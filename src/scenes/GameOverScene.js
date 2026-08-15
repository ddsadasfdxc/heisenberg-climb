/**
 * Victory / defeat interstitial.
 */
import { el, clear } from '../ui/dom.js';
import { CHARACTERS } from '../data/characters.js';

export class GameOverScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.payload = { result: 'defeat' };
  }

  /** @param {{result?: string}} [data] */
  enter(data = {}) {
    this.payload = data || { result: 'defeat' };
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
    const win = this.payload.result === 'victory';
    const run = g.run;
    const char = run ? CHARACTERS[run.characterId] : null;

    this.root = el('div', { class: 'screen' }, [
      el('div', { class: 'overlay', style: 'position:relative;inset:auto;flex:1;background:transparent' }, [
        el('div', { class: 'modal' }, [
          el('h2', { text: win ? 'Empire Secured' : 'Buried in the Desert' }),
          el('p', {
            text: win
              ? 'Los Pollos falls quiet. The climb is complete.'
              : 'One imperfect batch. One wrong knock. Try again.',
          }),
          el('p', {
            text: char
              ? `${char.name} · Floor ${run?.floor ?? '-'} · Gold ${run?.gold ?? 0}`
              : 'Return to the title screen to climb again.',
          }),
          el('button', {
            class: 'btn primary',
            text: 'Main Menu',
            onClick: () => {
              g.run = null;
              g.combat = null;
              g.goto('menu');
            },
          }),
        ]),
      ]),
    ]);
    ui.appendChild(this.root);
  }

  render() {}
}
