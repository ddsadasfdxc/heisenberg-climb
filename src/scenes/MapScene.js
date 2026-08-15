/**
 * Linear climb path viewer.
 */
import { el, clear } from '../ui/dom.js';
import { sceneArt } from '../ui/art.js';
import { CHARACTERS } from '../data/characters.js';
import { RELICS } from '../data/relics.js';
import { SaveManager } from '../core/SaveManager.js';

const TYPE_ICON = {
  combat: '⚔',
  elite: '☠',
  boss: '👑',
  rest: '⛺',
  shop: '💰',
  event: '?',
};

export class MapScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
  }

  enter() {
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
    const char = CHARACTERS[run.characterId];
    const node = run.path[run.nodeIndex];
    const relics = (run.relics || []).map((id) => RELICS[id]?.name || id).join(' · ') || '—';

    const pathEls = run.path.map((n, i) => {
      const state = i < run.nodeIndex ? 'done' : i === run.nodeIndex ? 'current' : 'locked';
      return el('div', { class: `path-node ${state}` }, [
        el('div', { class: 'path-ico', text: TYPE_ICON[n.type] || '•' }),
        el('div', { class: 'path-label', text: n.label || n.type }),
        el('div', {
          class: 'path-type',
          text: `${String(n.type).toUpperCase()}${i < run.nodeIndex ? ' ✓' : ''}`,
        }),
      ]);
    });

    this.root = el('div', { class: 'screen map-screen art-screen', style: `--scene-art:url("${sceneArt('desert')}")` }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'pill hp', html: `HP <span>${run.hp}/${run.maxHp}</span>` }),
          el('span', { class: 'pill', html: `GOLD <span style="color:var(--warn)">${run.gold}</span>` }),
          el('span', { class: 'pill', text: `FLOOR ${run.floor}` }),
          el('span', { class: 'pill', text: char?.name || run.characterId }),
        ]),
        el('div', { class: 'status-line', text: `Relics: ${relics}` }),
        el('div', { class: 'status-line', text: `Deck: ${run.deck.length} cards` }),
      ]),
      el('div', { class: 'panel map-body' }, [
        el('h2', { class: 'map-title', text: 'The Climb' }),
        el('div', { class: 'path-list' }, pathEls),
      ]),
      el('div', { class: 'action-bar' }, [
        el('button', {
          class: 'btn',
          text: 'Abandon',
          onClick: () => {
            if (!confirm('Abandon this run?')) return;
            g.save.currentRun = null;
            g.run = null;
            SaveManager.save(g.save);
            g.goto('menu');
          },
        }),
        el('button', {
          class: 'btn primary',
          text: node ? `Enter: ${node.label || node.type}` : 'Finish',
          onClick: () => g.enterCurrentNode(),
        }),
      ]),
    ]);

    ui.appendChild(this.root);
  }

  render() {}
}
