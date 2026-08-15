/**
 * Branching narrative event screen.
 */
import { el, clear } from '../ui/dom.js';
import { sceneArt, sceneStyle } from '../ui/art.js';
import { getEvent } from '../data/events.js';

export class EventScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.eventDef = null;
    this.resolved = false;
    this.resultLines = [];
  }

  /** @param {{eventId?: string}} [data] */
  enter(data = {}) {
    this.resolved = false;
    this.resultLines = [];
    const id = data.eventId || this.game.run?.pendingEventId;
    this.eventDef = getEvent(id) || getEvent('desert_methlab');
    this.mount();
  }

  exit() {
    if (this.root?.parentNode) this.root.remove();
    this.root = null;
    this.eventDef = null;
  }

  mount() {
    const g = this.game;
    const ui = g.uiLayer;
    clear(ui);
    const run = g.run;
    const ev = this.eventDef;
    if (!run || !ev) {
      g.goto('map');
      return;
    }

    let bodyChildren;
    if (!this.resolved) {
      const choices = ev.choices.map((ch) => {
        const need = ch.requires?.gold || 0;
        const locked = need > 0 && run.gold < need;
        return el('button', {
          class: 'btn choice-btn',
          text: ch.text,
          disabled: locked,
          onClick: () => {
            const lines = g.resolveEventChoice(ev.id, ch.id);
            this.resolved = true;
            this.resultLines = lines || [];
            if (g.state === 'event') this.mount();
          },
        });
      });
      bodyChildren = [
        el('p', { class: 'event-body', text: ev.body }),
        el('div', { class: 'menu-list' }, choices),
      ];
    } else {
      bodyChildren = [
        el(
          'div',
          { class: 'event-result' },
          (this.resultLines.length ? this.resultLines : ['Done.']).map((t) => el('div', { class: 'line', text: t })),
        ),
        el('div', { class: 'menu-list' }, [
          el('button', {
            class: 'btn primary',
            text: 'Continue',
            onClick: () => g.finishEvent(),
          }),
        ]),
      ];
    }

    this.root = el('div', { class: 'screen event-screen art-screen', style: sceneStyle('event') }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'pill hp', html: `HP <span>${run.hp}/${run.maxHp}</span>` }),
          el('span', { class: 'pill', html: `GOLD <span style="color:var(--warn)">${run.gold}</span>` }),
        ]),
      ]),
      el('div', { class: 'title-block', style: 'margin-top:2vh' }, [
        el('h1', { text: ev.title }),
        el('div', { class: 'sub', text: 'A fork in the desert road.' }),
      ]),
      el('div', { class: 'panel event-panel' }, bodyChildren),
    ]);
    ui.appendChild(this.root);
  }

  render() {}
}
