/**
 * Turn-based combat: draw / play / end turn / enemy intents.
 */
import { createCardInstance } from '../data/cards.js';
import { createEnemyState, getEnemyDef } from '../data/enemies.js';
import { STATUS_EFFECTS } from '../data/statuses.js';
import { RELICS } from '../data/relics.js';
import { pickDialogue } from '../data/dialogues.js';
import { CHARACTERS } from '../data/characters.js';
import { shuffle } from '../utils/rng.js';
import { EffectResolver } from './EffectResolver.js';

export class CombatSystem {
  /**
   * @param {{ bus: import('../core/EventBus.js').EventBus, run: any, enemyIds: string[], onLog?: Function }}
   */
  constructor({ bus, run, enemyIds, onLog }) {
    this.bus = bus;
    this.run = run;
    this.onLog = onLog || (() => {});
    this.resolver = new EffectResolver(this);
    this.phase = 'player'; // player | enemy | victory | defeat
    this.turn = 0;
    this.cardsPlayed = 0;
    this.selectedCardUid = null;
    this.flags = { firstAttackCrit: false, negotiated: false };

    const charDef = CHARACTERS[run.characterId];
    this.player = {
      id: 'player',
      name: charDef.name,
      hp: run.hp,
      maxHp: run.maxHp,
      block: 0,
      energy: 0,
      maxEnergy: charDef.maxEnergy ?? 3,
      energyNextTurn: 0,
      statuses: {},
      dead: false,
    };

    this.drawPile = shuffle(run.deck.map((id) => (typeof id === 'string' ? createCardInstance(id) : createCardInstance(id.defId, { upgraded: id.upgraded }))));
    this.discardPile = [];
    this.exhaustPile = [];
    this.hand = [];

    this.enemies = enemyIds.map((id) => {
      const st = createEnemyState(id, { hpScale: run.hpScale || 1 });
      this.rollIntent(st);
      return st;
    });
  }

  start() {
    this.log('— Combat start —', 'sys');
    const line = pickDialogue('combat_start', { character: this.run.characterId });
    if (line) this.log(`“${line}”`, 'warn');
    if (this.enemies.some((e) => e.tags?.includes('boss'))) {
      const boss = this.enemies.find((e) => e.tags?.includes('boss'));
      const bl = pickDialogue('boss_encounter', { bossId: boss?.defId });
      if (bl) this.log(`“${bl}”`, 'warn');
    }
    this.beginPlayerTurn();
    if (this.run.flags?.negotiationDebt) {
      this.resolver.applyStatus(this.player, 'weak', 2);
      this.player.statuses.weak = 3; // begin-turn decay leaves the promised 2 turns
      delete this.run.flags.negotiationDebt;
      this.log('The fine print catches up: Weak 2.', 'warn');
    }
    this.applyRelicTriggers('combat_start');
    if (this.enemies.some((e) => e.tags?.includes('boss'))) this.applyRelicTriggers('boss_enter');
    this.checkEnd();
    this.emitUpdate();
  }

  applyRelicTriggers(trigger) {
    const relics = this.run.relics || [];
    for (const rid of relics) {
      const def = RELICS[rid];
      if (!def?.effect || def.effect.trigger !== trigger) continue;
      const act = def.effect.action;
      if (!act) continue;
      if (act.type === 'gain_energy') this.player.energy += act.value || 1;
      else if (act.type === 'heal') this.resolver.heal(this.player, act.value || 0);
      else if (act.type === 'flag') this.flags[act.key] = act.value;
      else if (act.type === 'percent_hp_damage') {
        if (act.once && this.run.flags?.[`${rid}Used`]) continue;
        for (const enemy of this.enemies.filter((e) => !e.dead && e.tags?.includes('boss'))) {
          this.resolver.dealDamage(this.player, enemy, Math.ceil(enemy.maxHp * (act.value || 0)), {});
        }
        if (act.once) {
          this.run.flags = this.run.flags || {};
          this.run.flags[`${rid}Used`] = true;
        }
      } else this.resolver.resolve(act, { source: this.player });
      this.log(`Relic: ${def.name}`, 'sys');
    }
  }

  log(text, cls = '') {
    this.onLog?.(text, cls);
    this.bus.emit('mud:log', { text, cls });
  }

  emitUpdate() {
    this.bus.emit('combat:update', this.snapshot());
  }

  snapshot() {
    return {
      phase: this.phase,
      turn: this.turn,
      player: { ...this.player, statuses: { ...this.player.statuses } },
      enemies: this.enemies.map((e) => ({
        ...e,
        statuses: { ...e.statuses },
        intent: e.intent ? { ...e.intent } : null,
      })),
      hand: this.hand.map((c) => ({ ...c })),
      drawCount: this.drawPile.length,
      discardCount: this.discardPile.length,
      exhaustCount: this.exhaustPile.length,
      selectedCardUid: this.selectedCardUid,
      cardsPlayed: this.cardsPlayed,
    };
  }

  beginPlayerTurn() {
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    this.phase = 'player';
    this.turn += 1;
    this.player.block = 0;
    const bonus = this.player.energyNextTurn || 0;
    this.player.energyNextTurn = 0;
    this.player.energy = this.player.maxEnergy + bonus;
    this.tickStatusesStart(this.player);
    this.drawCards(5);
    this.log(`— Turn ${this.turn} —`, 'sys');
    this.emitUpdate();
  }

  drawCards(n) {
    for (let i = 0; i < n; i++) {
      if (!this.drawPile.length) {
        if (!this.discardPile.length) break;
        this.drawPile = shuffle(this.discardPile);
        this.discardPile = [];
        this.log('Shuffle discard into draw.', 'sys');
      }
      const card = this.drawPile.shift();
      if (card) this.hand.push(card);
    }
  }

  selectCard(uid) {
    if (this.phase !== 'player') return;
    if (this.selectedCardUid === uid) this.selectedCardUid = null;
    else this.selectedCardUid = uid;
    this.emitUpdate();
  }

  /**
   * Play selected or given card. If needs target, enemyId required.
   * @param {string} cardUid
   * @param {string|null} enemyId
   */
  playCard(cardUid, enemyId = null) {
    if (this.phase !== 'player' || this.player.dead) return { ok: false, reason: 'not_player_turn' };
    const idx = this.hand.findIndex((c) => c.uid === cardUid);
    if (idx < 0) return { ok: false, reason: 'not_in_hand' };
    const card = this.hand[idx];
    if (card.unplayable) return { ok: false, reason: 'unplayable' };

    // Jesse talent: every 4th card costs 0
    let cost = card.cost;
    if (this.run.characterId === 'jesse' && (this.cardsPlayed + 1) % 4 === 0) {
      cost = 0;
      this.log('Yo, Science! — free card', 'good');
    }
    if (this.player.energy < cost) return { ok: false, reason: 'no_energy' };

    let target = null;
    if (card.needsTarget) {
      target = this.enemies.find((e) => e.id === enemyId && !e.dead) || null;
      if (!target) {
        // auto single live enemy
        const live = this.enemies.filter((e) => !e.dead);
        if (live.length === 1) target = live[0];
        else return { ok: false, reason: 'need_target' };
      }
    }

    this.player.energy -= cost;
    this.hand.splice(idx, 1);
    this.cardsPlayed += 1;
    this.selectedCardUid = null;
    this.log(`Play ${card.name}`, 'sys');

    this.resolver.resolveAll(card.effects, {
      source: this.player,
      target,
      card,
    });

    if (card.exhaust) this.exhaustPile.push(card);
    else this.discardPile.push(card);

    this.checkEnd();
    this.emitUpdate();
    return { ok: true };
  }

  negotiate() {
    if (this.run.characterId !== 'saul' || this.flags.negotiated || this.phase !== 'player') return false;
    this.flags.negotiated = true;
    this.run.gold = Math.floor((this.run.gold || 0) * 0.5);
    this.run.flags = this.run.flags || {};
    this.run.flags.negotiationDebt = true;
    for (const enemy of this.enemies) { enemy.hp = 0; enemy.dead = true; }
    this.log('Deal closed. Half the cash is gone.', 'warn');
    this.checkEnd();
    this.emitUpdate();
    return true;
  }

  endTurn() {
    if (this.phase !== 'player') return;
    // discard hand (ethereal exhaust)
    const kept = [];
    for (const c of this.hand) {
      if (c.ethereal) this.exhaustPile.push(c);
      else this.discardPile.push(c);
    }
    this.hand = kept;
    this.selectedCardUid = null;
    this.tickStatusesEnd(this.player);
    this.phase = 'enemy';
    this.emitUpdate();
    // run enemy turn async-ish (sync for MVP)
    this.runEnemyTurn();
  }

  runEnemyTurn() {
    // loophole skips all intents once
    if ((this.player.statuses.loophole || 0) > 0) {
      this.log('Loophole! Enemy intents skipped.', 'good');
      delete this.player.statuses.loophole;
      for (const e of this.enemies) {
        if (!e.dead) {
          e.intentIndex = (e.intentIndex + 1) % Math.max(1, this.getIntentList(e).length || 1);
          this.rollIntent(e);
        }
      }
      this.afterEnemyTurn();
      return;
    }

    for (const e of this.enemies) {
      if (e.dead) continue;
      e.block = 0;
      this.tickStatusesStart(e);
      this.executeIntent(e);
      if (this.player.dead) break;
      this.tickStatusesEnd(e);
      e.intentIndex = (e.intentIndex + 1) % Math.max(1, this.getIntentList(e).length || 1);
      this.rollIntent(e);
    }
    this.afterEnemyTurn();
  }

  afterEnemyTurn() {
    this.checkEnd();
    if (this.phase === 'victory' || this.phase === 'defeat') {
      this.emitUpdate();
      return;
    }
    this.beginPlayerTurn();
  }

  getIntentList(enemy) {
    const def = getEnemyDef(enemy.defId);
    if (def.phases?.length) {
      const pct = enemy.hp / enemy.maxHp;
      // pick phase by untilHpPct
      let phaseIdx = 0;
      for (let i = 0; i < def.phases.length; i++) {
        phaseIdx = i;
        if (pct > (def.phases[i].untilHpPct ?? 0)) break;
      }
      // if hp below threshold, advance
      for (let i = 0; i < def.phases.length; i++) {
        if (pct <= (def.phases[i].untilHpPct ?? 0) && i < def.phases.length - 1) continue;
        // find first phase where hp still above until? simpler:
      }
      // Simpler logic: phase 0 while hp > 50% if untilHpPct 0.5
      phaseIdx = 0;
      for (let i = 0; i < def.phases.length; i++) {
        const until = def.phases[i].untilHpPct ?? 0;
        if (pct > until) {
          phaseIdx = i;
          break;
        }
        phaseIdx = i;
      }
      // Actually: untilHpPct:0.5 means phase active until hp drops to 50%
      phaseIdx = 0;
      for (let i = 0; i < def.phases.length; i++) {
        const until = def.phases[i].untilHpPct ?? 0;
        if (enemy.hp / enemy.maxHp > until) {
          phaseIdx = i;
          break;
        }
        phaseIdx = i;
      }
      enemy.phase = phaseIdx;
      return def.phases[phaseIdx].intents || [];
    }
    return def.intents || [];
  }

  rollIntent(enemy) {
    const list = this.getIntentList(enemy);
    if (!list.length) {
      enemy.intent = { type: 'attack', value: 5, label: 'Attack' };
      return;
    }
    const step = list[enemy.intentIndex % list.length];
    enemy.intent = { ...step };
  }

  executeIntent(enemy) {
    const intent = enemy.intent;
    if (!intent) return;
    this.log(`${enemy.name}: ${intent.label || intent.type}`, 'warn');
    const hits = intent.hits || 1;
    switch (intent.type) {
      case 'attack':
        for (let i = 0; i < hits; i++) {
          this.resolver.dealDamage(enemy, this.player, intent.value || 0, {});
          if (this.player.dead) break;
        }
        break;
      case 'defend':
        this.resolver.gainBlock(enemy, intent.value || 0);
        break;
      case 'buff':
        if (intent.status) this.resolver.applyStatus(enemy, intent.status, intent.statusValue || 1);
        break;
      case 'debuff':
        if (intent.status) this.resolver.applyStatus(this.player, intent.status, intent.statusValue || 1);
        if (intent.value) this.resolver.dealDamage(enemy, this.player, intent.value, {});
        break;
      case 'special':
        this.resolver.dealDamage(enemy, this.player, intent.value || 10, {});
        break;
      default:
        break;
    }
    // lethal relic
    if (this.player.hp <= 0) {
      const relics = this.run.relics || [];
      if (relics.includes('pink_teddy') && !this.run.flags?.teddyUsed) {
        this.player.hp = 1;
        this.player.dead = false;
        this.resolver.heal(this.player, 20);
        this.run.flags = this.run.flags || {};
        this.run.flags.teddyUsed = true;
        this.log('Pink Teddy Bear saves you!', 'good');
      } else {
        this.player.dead = true;
        this.player.hp = 0;
      }
    }
  }

  tickStatusesStart(unit) {
    // ritual → strength at start? keep EOT for DoT
  }

  tickStatusesEnd(unit) {
    if (!unit || unit.dead) return;
    const statuses = unit.statuses || {};
    for (const [id, stacks] of Object.entries(statuses)) {
      const def = STATUS_EFFECTS[id];
      if (!def) continue;
      if (def.endOfTurn && def.effect === 'lose_hp') {
        const dmg = (def.valuePerStack || 1) * stacks;
        // poison/burn ignore block typically — direct hp
        this.resolver.loseHp(unit, dmg, def.name);
        if (id === 'poison') {
          // poison decays 1
          unit.statuses[id] = stacks - 1;
          if (unit.statuses[id] <= 0) delete unit.statuses[id];
        }
      }
      if (def.effect === 'gain_strength_eot') {
        this.resolver.applyStatus(unit, 'strength', (def.valuePerStack || 1) * stacks);
      }
      // duration decrement for non-stackable duration statuses
      if (!def.stackable && def.duration && id !== 'loophole') {
        unit.statuses[id] = stacks - 1;
        if (unit.statuses[id] <= 0) delete unit.statuses[id];
      }
    }
    if (unit.hp <= 0) {
      unit.hp = 0;
      unit.dead = true;
    }
  }

  checkEnd() {
    const live = this.enemies.filter((e) => !e.dead);
    if (!live.length) {
      this.phase = 'victory';
      this.run.hp = this.player.hp;
      const line = pickDialogue('victory', {});
      if (line) this.log(`“${line}”`, 'good');
      this.log('Victory!', 'good');
      this.bus.emit('combat:end', { result: 'victory', run: this.run });
      return;
    }
    if (this.player.hp <= 0 || this.player.dead) {
      this.player.dead = true;
      this.phase = 'defeat';
      const line = pickDialogue('death', {});
      if (line) this.log(`“${line}”`, 'dmg');
      this.log('Defeat...', 'dmg');
      this.bus.emit('combat:end', { result: 'defeat', run: this.run });
    }
  }
}
