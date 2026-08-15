/**
 * Post-combat card draft.
 */
import { el, clear, cardDescription } from '../ui/dom.js';
import { sceneArt } from '../ui/art.js';

export class RewardScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.pool = [];
  }

  /** @param {{pool?: any[]}} [data] */
  enter(data = {}) {
    this.pool = data.pool || [];
    this.mount();
  }

  exit() {
    if (this.root?.parentNode) this.root.remove();
    this.root = null;
  }

  mount() {
    const g = this.game;
    const ui = g.uiLayer;
    clear(ui);
    const run = g.run;

    const cards = this.pool.map((def) =>
      el(
        'button',
        {
          class: 'reward-card',
          onClick: () => g.pickReward(def.id),
        },
        [
          el('div', { class: 'cost', text: String(def.cost) }),
          el('div', { class: 'cname', text: def.name }),
          el('div', { class: 'ctype', text: `${def.type} · ${def.rarity}` }),
          el('div', { class: 'cdesc', text: cardDescription(def) }),
        ],
      ),
    );

    this.root = el('div', { class: 'screen reward-screen art-screen', style: `--scene-art:url("${sceneArt('desert')}")` }, [
      el('div', { class: 'title-block', style: 'margin-top:6vh' }, [
        el('h1', { text: 'Loot' }),
        el('div', {
          class: 'sub',
          text: run ? `+gold secured · HP ${run.hp}/${run.maxHp}` : 'Choose a card',
        }),
      ]),
      el('div', { class: 'reward-grid' }, cards),
      el('div', { class: 'menu-list' }, [
        el('button', {
          class: 'btn',
          text: 'Skip Card',
          onClick: () => g.pickReward(null),
        }),
      ]),
    ]);
    ui.appendChild(this.root);
  }

  render() {}
}
