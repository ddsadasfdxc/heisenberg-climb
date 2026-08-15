/**
 * Rest site: heal or smith (upgrade).
 */
import { el, clear } from '../ui/dom.js';
import { sceneArt, sceneStyle } from '../ui/art.js';
import { CARDS } from '../data/cards.js';

export class RestScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.mode = 'pick'; // pick | upgrade
  }

  enter() {
    this.mode = 'pick';
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
    if (!run) {
      g.goto('menu');
      return;
    }

    if (this.mode === 'upgrade') {
      const upgradable = [];
      run.deck.forEach((id, idx) => {
        const defId = typeof id === 'string' ? id : id.defId;
        const upgraded = typeof id === 'object' && id.upgraded;
        const def = CARDS[defId];
        if (def?.upgrade && !upgraded) upgradable.push({ idx, defId, def });
      });
      const list = upgradable.length
        ? upgradable.map((u) =>
            el('button', {
              class: 'btn choice-btn',
              text: `${u.def.name} → ${u.def.upgrade.name || u.def.name + '+'}`,
              onClick: () => g.restUpgradeCard(u.idx),
            }),
          )
        : [el('div', { class: 'sub', text: 'No upgradable cards.' })];
      this.root = el('div', { class: 'screen rest-screen art-screen', style: sceneStyle('rest') }, [
        el('div', { class: 'title-block' }, [
          el('h1', { text: 'Smith' }),
          el('div', { class: 'sub', text: 'Choose a card to upgrade.' }),
        ]),
        el('div', { class: 'menu-list' }, [
          ...list,
          el('button', {
            class: 'btn',
            text: 'Back',
            onClick: () => {
              this.mode = 'pick';
              this.mount();
            },
          }),
        ]),
      ]);
      ui.appendChild(this.root);
      return;
    }

    const healAmt = Math.round(run.maxHp * 0.3);
    this.root = el('div', { class: 'screen rest-screen art-screen', style: sceneStyle('rest') }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'pill hp', html: `HP <span>${run.hp}/${run.maxHp}</span>` }),
          el('span', { class: 'pill', html: `GOLD <span style="color:var(--warn)">${run.gold}</span>` }),
        ]),
      ]),
      el('div', { class: 'title-block' }, [
        el('h1', { text: 'Desert Rest' }),
        el('div', { class: 'sub', text: 'Heal up, or put an edge on your deck.' }),
      ]),
      el('div', { class: 'menu-list' }, [
        el('button', {
          class: 'btn primary',
          text: `Rest (+${healAmt} HP)`,
          onClick: () => g.restHeal(),
        }),
        el('button', {
          class: 'btn',
          text: 'Smith (Upgrade 1 card)',
          onClick: () => {
            this.mode = 'upgrade';
            this.mount();
          },
        }),
      ]),
    ]);
    ui.appendChild(this.root);
  }

  render() {}
}
