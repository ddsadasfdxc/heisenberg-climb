/**
 * Post-combat card draft, presented as seized evidence.
 */
import { el, clear, cardDescription } from '../ui/dom.js';
import { sceneArt, sceneStyle, cardSuit } from '../ui/art.js';
import { cardArt } from '../ui/cardArt.js';

export class RewardScene {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.pool = [];
  }

  enter(data = {}) {
    this.pool = data.pool || [];
    this.mount();
  }

  exit() {
    this.root?.remove();
    this.root = null;
  }

  mount() {
    const g = this.game;
    const ui = g.uiLayer;
    clear(ui);
    const run = g.run;

    const cards = this.pool.map((def) => el('button', {
      class: `reward-card ${def.type || 'skill'}`,
      style: `--card-art:url("${cardArt(def.id, def.type)}")`,
      onClick: () => g.pickReward(def.id),
    }, [
      el('span', { class: 'cost', text: String(def.cost) }),
      el('span', { class: 'card-suit', text: cardSuit(def.type) }),
      el('span', { class: 'card-visual' }, [el('span', { class: 'card-stamp', text: def.rarity })]),
      el('span', { class: 'cname', text: def.name }),
      el('span', { class: 'ctype', text: `${def.type} // ${def.rarity}` }),
      el('span', { class: 'cdesc', text: cardDescription(def) }),
    ]));

    this.root = el('div', {
      class: 'screen reward-screen art-screen',
      style: sceneStyle('desert'),
    }, [
      el('div', { class: 'title-block', style: 'margin-top:5vh' }, [
        el('div', { class: 'eyebrow', text: 'AFTER-ACTION RECOVERY' }),
        el('h1', { text: 'Choose the Take' }),
        el('div', {
          class: 'sub',
          text: run ? `Payment secured · HP ${run.hp}/${run.maxHp} · Add one card to the operation` : 'Choose a card',
        }),
      ]),
      el('div', { class: 'reward-grid' }, cards),
      el('div', { class: 'menu-list' }, [
        el('button', { class: 'btn', text: 'Leave the Evidence', onClick: () => g.pickReward(null) }),
      ]),
    ]);
    ui.appendChild(this.root);
  }

  render() {}
}