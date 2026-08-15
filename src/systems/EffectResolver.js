/**
 * Declarative effect resolver for cards / relics / intents.
 * No anonymous gameplay logic in data files — all types handled here.
 */
import { STATUS_EFFECTS } from '../data/statuses.js';
import { randInt, pick } from '../utils/rng.js';

export class EffectResolver {
  /**
   * @param {import('./CombatSystem.js').CombatSystem} combat
   */
  constructor(combat) {
    this.combat = combat;
  }

  /**
   * @param {any[]} effects
   * @param {{source: any, target?: any|null, card?: any}} ctx
   */
  resolveAll(effects, ctx) {
    if (!effects?.length) return;
    for (const fx of effects) this.resolve(fx, ctx);
  }

  /**
   * @param {any} fx
   * @param {{source: any, target?: any|null, card?: any}} ctx
   */
  resolve(fx, ctx) {
    if (!fx) return;
    if (fx.type === 'condition') {
      if (this.evalCondition(fx.if, ctx)) this.resolve(fx.then, ctx);
      else if (fx.else) this.resolve(fx.else, ctx);
      return;
    }
    const targets = this.resolveTargets(fx.target || 'self', ctx);
    switch (fx.type) {
      case 'damage':
        for (const t of targets) this.dealDamage(ctx.source, t, fx.value ?? 0, ctx);
        break;
      case 'damage_random': {
        const v = randInt(fx.min ?? 1, fx.max ?? 1);
        for (const t of targets) this.dealDamage(ctx.source, t, v, ctx);
        break;
      }
      case 'block':
        for (const t of targets) this.gainBlock(t, fx.value ?? 0, ctx);
        break;
      case 'apply_status':
        for (const t of targets) this.applyStatus(t, fx.status, fx.value ?? 1, ctx);
        break;
      case 'draw':
        this.combat.drawCards(fx.value ?? 1);
        break;
      case 'gain_energy':
        this.combat.player.energy = Math.min(
          this.combat.player.energy + (fx.value ?? 1),
          99,
        );
        this.combat.log(`Energy +${fx.value ?? 1}`, 'good');
        break;
      case 'energy_next_turn':
        this.combat.player.energyNextTurn = (this.combat.player.energyNextTurn || 0) + (fx.value ?? 1);
        this.combat.log(`Next turn energy +${fx.value ?? 1}`, 'sys');
        break;
      case 'heal':
        for (const t of targets) this.heal(t, fx.value ?? 0);
        break;
      case 'reduce_intent':
        for (const t of targets) {
          if (!t.intent) continue;
          if (t.intent.type === 'attack' || typeof t.intent.value === 'number') {
            t.intent.value = Math.max(0, (t.intent.value || 0) - (fx.value ?? 0));
            this.combat.log(`${t.name} intent reduced by ${fx.value}`, 'sys');
          }
        }
        break;
      case 'lose_hp':
        for (const t of targets) this.loseHp(t, fx.value ?? 0, 'effect');
        break;
      default:
        console.warn('[EffectResolver] unknown', fx.type);
    }
    this.combat.emitUpdate();
  }

  evalCondition(cond, ctx) {
    if (!cond) return true;
    if (cond.hasStatus) {
      const on = cond.on === 'target' ? ctx.target : ctx.source;
      return !!(on && (on.statuses?.[cond.hasStatus] || 0) > 0);
    }
    if (cond.selfStatusAtLeast) {
      const [id, n] = cond.selfStatusAtLeast;
      return (ctx.source?.statuses?.[id] || 0) >= n;
    }
    if (cond.targetHpBelowPct != null && ctx.target) {
      return ctx.target.hp / ctx.target.maxHp < cond.targetHpBelowPct;
    }
    return false;
  }

  resolveTargets(spec, ctx) {
    const c = this.combat;
    switch (spec) {
      case 'self':
        return [ctx.source];
      case 'enemy':
        return ctx.target && !ctx.target.dead ? [ctx.target] : [];
      case 'all_enemies':
        return c.enemies.filter((e) => !e.dead);
      case 'random_enemy': {
        const live = c.enemies.filter((e) => !e.dead);
        const t = pick(live);
        return t ? [t] : [];
      }
      case 'player':
        return [c.player];
      default:
        return ctx.target ? [ctx.target] : [ctx.source];
    }
  }

  /** Damage pipeline with block / weak / vulnerable / strength / talents / relics */
  dealDamage(source, target, base, ctx = {}) {
    if (!target || target.dead) return 0;
    let dmg = base;

    // strength on source
    dmg += source?.statuses?.strength || 0;

    // weak on source
    if ((source?.statuses?.weak || 0) > 0) dmg = Math.floor(dmg * 0.75);

    // setup on source (player next attack)
    if (source === this.combat.player && (source.statuses?.setup || 0) > 0 && ctx.card?.type === 'attack') {
      dmg = Math.floor(dmg * 1.5);
      source.statuses.setup -= 1;
      if (source.statuses.setup <= 0) delete source.statuses.setup;
      this.combat.log('Setup consumed (+50% dmg)', 'sys');
    }

    // Walter talent: hand < 3 → +25%
    if (source === this.combat.player && this.combat.run?.characterId === 'walter') {
      if (this.combat.hand.length < 3) dmg = Math.floor(dmg * 1.25);
    }

    // Mike talent: target < 25% → x2
    if (source === this.combat.player && this.combat.run?.characterId === 'mike') {
      if (target.hp / target.maxHp < 0.25) dmg *= 2;
    }

    // first attack crit relic flag
    if (source === this.combat.player && this.combat.flags.firstAttackCrit && ctx.card?.type === 'attack') {
      dmg *= 2;
      this.combat.flags.firstAttackCrit = false;
      this.combat.log('Critical! (Heisenberg Hat)', 'warn');
    }

    // vulnerable on target
    if ((target.statuses?.vulnerable || 0) > 0) dmg = Math.floor(dmg * 1.5);

    dmg = Math.max(0, Math.floor(dmg));

    let remaining = dmg;
    if (target.block > 0) {
      const absorbed = Math.min(target.block, remaining);
      target.block -= absorbed;
      remaining -= absorbed;
    }
    if (remaining > 0) {
      target.hp = Math.max(0, target.hp - remaining);
      this.combat.log(`${source?.name || 'Source'} hits ${target.name} for ${dmg} (${remaining} HP)`, 'dmg');
    } else {
      this.combat.log(`${source?.name || 'Source'} hits ${target.name} for ${dmg} (blocked)`, 'sys');
    }
    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
      this.combat.log(`${target.name} is down.`, 'warn');
    }
    return dmg;
  }

  loseHp(target, amount, reason = '') {
    if (!target || target.dead) return;
    target.hp = Math.max(0, target.hp - amount);
    this.combat.log(`${target.name} loses ${amount} HP${reason ? ` (${reason})` : ''}`, 'dmg');
    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
    }
  }

  gainBlock(target, value, ctx = {}) {
    if (!target || target.dead) return;
    let v = value;
    if ((target.statuses?.frail || 0) > 0) v = Math.floor(v * 0.75);
    target.block = (target.block || 0) + Math.max(0, v);
    this.combat.log(`${target.name} gains ${v} Block`, 'good');
  }

  heal(target, value) {
    if (!target || target.dead) return;
    const before = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + value);
    const gained = target.hp - before;
    if (gained > 0) this.combat.log(`${target.name} heals ${gained}`, 'good');
  }

  applyStatus(target, statusId, value, ctx = {}) {
    if (!target || target.dead || !statusId) return;
    const def = STATUS_EFFECTS[statusId];
    if (!def) {
      console.warn('unknown status', statusId);
      return;
    }
    const cur = target.statuses[statusId] || 0;
    if (def.stackable) {
      let next = cur + value;
      if (def.max != null) next = Math.min(def.max, next);
      target.statuses[statusId] = next;
    } else {
      // duration-style: take max stacks/duration
      target.statuses[statusId] = Math.max(cur, value || def.duration || 1);
    }
    this.combat.log(`${target.name} gains ${def.name} ${target.statuses[statusId]}`, 'sys');
  }
}
