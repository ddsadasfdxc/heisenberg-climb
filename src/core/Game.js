/**
 * Top-level game controller / state machine.
 */
import { EventBus } from './EventBus.js';
import { SaveManager } from './SaveManager.js';
import { CHARACTERS, listPlayableCharacters } from '../data/characters.js';
import { CARDS, getRewardPool } from '../data/cards.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { CombatScene } from '../scenes/CombatScene.js';
import { MapScene } from '../scenes/MapScene.js';
import { RewardScene } from '../scenes/RewardScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';
import { ShopScene } from '../scenes/ShopScene.js';
import { EventScene } from '../scenes/EventScene.js';
import { RestScene } from '../scenes/RestScene.js';
import { RELICS, availableRelics, relicPrice } from '../data/relics.js';
import { getEvent, listEvents } from '../data/events.js';
import { el } from '../ui/dom.js';
import { sceneArt } from '../ui/art.js';
import { pick, shuffle } from '../utils/rng.js';
import { AudioManager } from './AudioManager.js';
import { initLocale, getLocale, setLocale, t } from './i18n.js';

export class Game {
  /**
   * @param {{canvas: HTMLCanvasElement, uiLayer: HTMLElement, mudLayer: HTMLElement}}
   */
  constructor({ canvas, uiLayer, mudLayer }) {
    this.canvas = canvas;
    this.uiLayer = uiLayer;
    this.mudLayer = mudLayer;
    this.bus = new EventBus();
    this.save = SaveManager.load();
    initLocale(localStorage.getItem('climb-language') || this.save.settings?.language);
    this.audio = new AudioManager();
    this.autosave = SaveManager.createAutosave(() => this.serialize());
    this.state = 'boot';
    /** @type {any} */
    this.run = null;
    /** @type {CombatSystem|null} */
    this.combat = null;
    this.scenes = {
      menu: new MenuScene(this),
      map: new MapScene(this),
      combat: new CombatScene(this),
      reward: new RewardScene(this),
      shop: new ShopScene(this),
      event: new EventScene(this),
      rest: new RestScene(this),
      game_over: new GameOverScene(this),
    };
    /** @type {any} */
    this.activeScene = null;

    this.bus.on('mud:log', ({ text, cls }) => this.pushMud(text, cls));
    this.bus.on('combat:end', (payload) => this.onCombatEnd(payload));
    this.bus.on('combat:update', () => this.audio.play('card'));
    document.addEventListener('pointerdown', () => this.audio.unlock(), { once: true });
    document.addEventListener('click', (e) => { if (e.target.closest?.('button')) this.audio.play('click'); });
  }

  boot() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.goto('menu');
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    const ctx = this.canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  loop(ts) {
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      // subtle desert grain
      ctx.fillStyle = 'rgba(61,214,198,0.03)';
      for (let i = 0; i < 18; i++) {
        const x = (Math.sin(ts / 800 + i) * 0.5 + 0.5) * w;
        const y = (i / 18) * h;
        ctx.fillRect(x, y, 2, 2);
      }
      this.activeScene?.render?.(ctx, w, h, ts);
    }
    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * @param {import('../data/types.js').GameStateId} state
   * @param {any} [data]
   */
  goto(state, data) {
    this.activeScene?.exit?.();
    this.state = state;
    this.uiLayer.innerHTML = '';
    if (state !== 'combat') this.clearMud();
    if (this.mudLayer) this.mudLayer.classList.toggle('hidden', state !== 'combat');
    const map = {
      menu: 'menu',
      map: 'map',
      combat: 'combat',
      reward: 'reward',
      shop: 'shop',
      event: 'event',
      rest: 'rest',
      game_over: 'game_over',
    };
    const key = map[state] || 'menu';
    this.activeScene = this.scenes[key];
    this.activeScene?.enter?.(data);
    this.bus.emit('state', { state, data });
    this.autosave();
  }

  pushMud(text, cls = '') {
    if (!this.mudLayer) return;
    if (cls === 'dmg') this.audio.play('hit');
    else if (cls === 'good') this.audio.play('heal');
    const line = document.createElement('div');
    line.className = `line ${cls || ''}`.trim();
    line.textContent = t(text);
    this.mudLayer.appendChild(line);
    while (this.mudLayer.children.length > 40) this.mudLayer.removeChild(this.mudLayer.firstChild);
    this.mudLayer.scrollTop = this.mudLayer.scrollHeight;
  }

  clearMud() {
    if (this.mudLayer) this.mudLayer.innerHTML = '';
  }

  toggleLanguage() {
    const next = getLocale() === 'zh' ? 'en' : 'zh';
    setLocale(next);
    this.save.settings = { ...(this.save.settings || {}), language: next };
    SaveManager.save(this.save);
    this.activeScene?.mount?.();
  }

  toggleSound() {
    this.audio.toggle();
    this.activeScene?.mount?.();
  }

  /** Start a fresh run */
  startRun(characterId) {
    const def = CHARACTERS[characterId];
    if (!def) return;
    this.run = {
      characterId,
      hp: def.hp,
      maxHp: def.hp,
      gold: 50,
      floor: 1,
      nodeIndex: 0,
      deck: [...def.startingDeck],
      relics: characterId === 'mike' ? ['pocket_watch'] : characterId === 'walter' ? ['heisenberg_hat'] : characterId === 'saul' ? ['saul_bluetooth'] : ['pollos_bucket'],
      flags: {},
      hpScale: 1,
      path: this.generatePath(),
      shopOffer: null,
      pendingEventId: null,
    };
    this.save.currentRun = this.run;
    this.autosave();
    this.goto('map');
  }
  generatePath() {
    // Phase 2 route: combat, events, commerce, rest and boss.
    return [
      { type: 'combat', enemyIds: ['street_dealer'], label: 'Street Corner' },
      { type: 'event', eventId: 'desert_methlab', label: 'Abandoned RV' },
      { type: 'combat', enemyIds: ['street_dealer', 'street_dealer'], label: 'Alley Ambush' },
      { type: 'shop', label: "Saul's Side Hustle" },
      { type: 'elite', enemyIds: ['tuco'], label: "Tuco's Place" },
      { type: 'rest', label: 'Desert Rest' },
      { type: 'event', eventId: 'chicken_bros', label: 'Los Pollos Drive-Thru' },
      { type: 'combat', enemyIds: ['hank'], label: 'DEA Sweep' },
      { type: 'boss', enemyIds: ['gus_fring'], label: 'Los Pollos HQ' },
    ];
  }

  enterCurrentNode() {
    if (!this.run) return this.goto('menu');
    const node = this.run.path[this.run.nodeIndex];
    if (!node) return this.completeRun();
    if (node.type === 'rest') return this.goto('rest', { node });
    if (node.type === 'shop') {
      if (!this.run.shopOffer) this.run.shopOffer = this.buildShopOffer();
      return this.goto('shop', { offer: this.run.shopOffer });
    }
    if (node.type === 'event') {
      this.run.pendingEventId = node.eventId || pick(listEvents())?.id || 'desert_methlab';
      return this.goto('event', { eventId: this.run.pendingEventId });
    }
    this.startCombat(node.enemyIds || ['street_dealer'], node);
  }

  advanceNode() {
    if (!this.run) return this.goto('menu');
    this.run.nodeIndex += 1;
    this.run.floor += 1;
    this.run.shopOffer = null;
    this.run.pendingEventId = null;
    if (this.run.nodeIndex >= this.run.path.length) return this.completeRun();
    this.autosave();
    this.goto('map');
  }

  completeRun() {
    if (!this.run) return this.goto('menu');
    const prog = this.save.characterProgress[this.run.characterId];
    if (prog) prog.wins = (prog.wins || 0) + 1;
    this.save.currentRun = null;
    SaveManager.save(this.save);
    this.goto('game_over', { result: 'victory' });
  }


  startCombat(enemyIds, node) {
    this.clearMud();
    this.combat = new CombatSystem({
      bus: this.bus,
      run: this.run,
      enemyIds,
      onLog: () => {}, // mud:log bus is the single UI logging path
    });
    this.goto('combat', { node });
    this.combat.start();
  }

  onCombatEnd({ result }) {
    if (!this.run) return;
    if (result === 'victory') {
      this.run.hp = this.combat?.player?.hp ?? this.run.hp;
      let goldReward = 25 + this.run.floor * 5;
      for (const rid of this.run.relics || []) {
        const fx = RELICS[rid]?.effect;
        if (fx?.trigger === 'combat_victory' && fx.action?.type === 'gain_gold') {
          goldReward += fx.action.value || 0;
        }
      }
      this.run.gold += goldReward;
      this.goto('reward', {
        pool: shuffle(getRewardPool(this.run.characterId)).slice(0, 3),
      });
    } else {
      const prog = this.save.characterProgress[this.run.characterId];
      if (prog) prog.deaths = (prog.deaths || 0) + 1;
      this.save.currentRun = null;
      SaveManager.save(this.save);
      this.goto('game_over', { result: 'defeat' });
    }
  }

  pickReward(cardId) {
    if (!this.run || !cardId) return this.advanceAfterReward();
    this.run.deck.push(cardId);
    this.pushMud(`Added card to deck.`, 'good');
    this.advanceAfterReward();
  }

  advanceAfterReward() {
    this.advanceNode();
  }

  getShopPriceMultiplier() {
    let mult = 1;
    for (const rid of this.run?.relics || []) {
      const fx = RELICS[rid]?.effect;
      if (fx?.trigger === 'shop_price' && fx.action?.type === 'multiplier') mult *= fx.action.value;
    }
    return mult;
  }

  buildShopOffer() {
    if (!this.run) return { cards: [], relics: [], removePrice: 50 };
    const cards = shuffle(getRewardPool(this.run.characterId).filter((c) => c.rarity !== 'curse'))
      .slice(0, 3)
      .map((c) => ({ id: c.id, price: c.rarity === 'rare' ? 90 : c.rarity === 'uncommon' ? 65 : 40, sold: false }));
    const relics = shuffle(availableRelics(this.run.relics)).slice(0, 2)
      .map((r) => ({ id: r.id, price: relicPrice(r), sold: false }));
    return { cards, relics, removePrice: 55 };
  }

  buyShopCard(index) {
    const slot = this.run?.shopOffer?.cards?.[index];
    if (!slot || slot.sold) return false;
    const price = Math.max(1, Math.round(slot.price * this.getShopPriceMultiplier()));
    if (this.run.gold < price) return false;
    this.run.gold -= price;
    this.run.deck.push(slot.id);
    slot.sold = true;
    this.autosave();
    return true;
  }

  buyShopRelic(index) {
    const slot = this.run?.shopOffer?.relics?.[index];
    if (!slot || slot.sold || !RELICS[slot.id]) return false;
    const price = Math.max(1, Math.round(slot.price * this.getShopPriceMultiplier()));
    if (this.run.gold < price) return false;
    this.run.gold -= price;
    this.run.relics.push(slot.id);
    slot.sold = true;
    this.autosave();
    return true;
  }

  openCardRemoval(price) {
    if (!this.run || this.run.gold < price || this.run.deck.length <= 5) return;
    const shop = this.scenes.shop;
    const choices = this.run.deck.map((entry, index) => {
      const defId = typeof entry === 'string' ? entry : entry.defId;
      const def = CARDS[defId];
      return el('button', {
        class: 'btn choice-btn',
        text: def?.name || defId,
        onClick: () => {
          if (!this.run || this.run.gold < price || this.run.deck.length <= 5) return;
          this.run.gold -= price;
          this.run.deck.splice(index, 1);
          this.autosave();
          shop.mount();
        },
      });
    });
    shop.root = el('div', { class: 'screen shop-screen art-screen', style: `--scene-art:url("${sceneArt('shop')}")` }, [
      el('div', { class: 'title-block' }, [el('h1', { text: 'Discreet Deletion' }), el('div', { class: 'sub', text: `Remove one card for ${price} gold.` })]),
      el('div', { class: 'removal-list' }, choices),
      el('button', { class: 'btn', text: 'Cancel', onClick: () => shop.mount() }),
    ]);
    this.uiLayer.innerHTML = '';
    this.uiLayer.appendChild(shop.root);
  }

  leaveShop() {
    this.advanceNode();
  }

  restHeal() {
    if (!this.run) return;
    const amount = Math.round(this.run.maxHp * 0.3);
    this.run.hp = Math.min(this.run.maxHp, this.run.hp + amount);
    this.advanceNode();
  }

  restUpgradeCard(index) {
    if (!this.run) return;
    const entry = this.run.deck[index];
    const defId = typeof entry === 'string' ? entry : entry?.defId;
    if (!CARDS[defId]?.upgrade) return;
    this.run.deck[index] = { defId, upgraded: true };
    this.advanceNode();
  }

  resolveEventChoice(eventId, choiceId) {
    if (!this.run) return [];
    const choice = getEvent(eventId)?.choices.find((c) => c.id === choiceId);
    if (!choice || (choice.requires?.gold || 0) > this.run.gold) return ['Requirement not met.'];
    const lines = [];
    const apply = (effects = []) => {
      for (const fx of effects) {
        if (fx.type === 'gold') this.run.gold = Math.max(0, this.run.gold + fx.value);
        else if (fx.type === 'hp') {
          this.run.hp = Math.max(0, Math.min(this.run.maxHp, this.run.hp + fx.value));
          lines.push(`${fx.value >= 0 ? 'HP +' : 'HP '}${fx.value}`);
        } else if (fx.type === 'add_card') {
          const cardId = fx.cardId || pick(getRewardPool(this.run.characterId))?.id;
          if (cardId) { this.run.deck.push(cardId); lines.push(`Card gained: ${CARDS[cardId]?.name || cardId}`); }
        } else if (fx.type === 'remove_card') {
          const idx = this.run.deck.findIndex((c) => (typeof c === 'string' ? c : c.defId) === fx.defId);
          if (idx >= 0) this.run.deck.splice(idx, 1);
        } else if (fx.type === 'grant_relic' || fx.type === 'grant_relic_random') {
          const pool = availableRelics(this.run.relics);
          const relic = (fx.prefer && !this.run.relics.includes(fx.prefer) ? RELICS[fx.prefer] : null) || pick(pool);
          if (relic) { this.run.relics.push(relic.id); lines.push(`Relic gained: ${relic.name}`); }
        } else if (fx.type === 'flag') {
          this.run.flags = this.run.flags || {};
          this.run.flags[fx.key] = fx.value;
        } else if (fx.type === 'branch_rng') apply(Math.random() < (fx.p ?? 0.5) ? fx.ok : fx.fail);
        else if (fx.type === 'log') { lines.push(fx.text); this.pushMud(fx.text, fx.cls); }
      }
    };
    apply(choice.effects);
    this.autosave();
    if (this.run.hp <= 0) {
      const prog = this.save.characterProgress[this.run.characterId];
      if (prog) prog.deaths = (prog.deaths || 0) + 1;
      this.save.currentRun = null;
      SaveManager.save(this.save);
      this.goto('game_over', { result: 'defeat' });
    }
    return lines;
  }

  finishEvent() {
    this.advanceNode();
  }

  serialize() {
    this.save.currentRun = this.run;
    return this.save;
  }

  listCharacters() {
    return listPlayableCharacters();
  }
}
