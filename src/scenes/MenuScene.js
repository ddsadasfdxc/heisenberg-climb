/**
 * Title / character select.
 */
import { el, clear } from '../ui/dom.js';
import { SaveManager } from '../core/SaveManager.js';
import { getLocale } from '../core/i18n.js';
import { portrait, sceneArt } from '../ui/art.js';

export class MenuScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.mode = 'title'; // title | select
  }

  enter() {
    this.mode = 'title';
    this.mount();
  }

  exit() {
    if (this.root?.parentNode) this.root.remove();
    this.root = null;
  }

  mount() {
    const ui = this.game.uiLayer;
    clear(ui);
    const hasRun = !!this.game.save?.currentRun;

    if (this.mode === 'title') {
      this.root = el('div', { class: 'screen menu-screen art-screen', style: `--scene-art:url("${sceneArt('desert')}")` }, [
        el('div', { class: 'top-tools' }, [
          el('button', { class: 'icon-btn', text: getLocale() === 'zh' ? 'EN' : '中文', onClick: () => this.game.toggleLanguage() }),
          el('button', { class: 'icon-btn', text: this.game.audio.enabled ? '🔊' : '🔇', onClick: () => this.game.toggleSound() }),
        ]),
        el('div', { class: 'title-block' }, [
          el('h1', { text: 'BCS & BB' }),
          el('div', { class: 'sub', text: 'The Climb — desert roguelike deckbuilder' }),
          el('div', { class: 'sub', text: 'Say my name. Build the empire. Climb the tower.' }),
        ]),
        el('div', { class: 'menu-list' }, [
          el('button', {
            class: 'btn primary',
            text: 'New Climb',
            onClick: () => {
              this.mode = 'select';
              this.mount();
            },
          }),
          el('button', {
            class: 'btn',
            text: hasRun ? 'Continue Run' : 'Continue Run (empty)',
            disabled: !hasRun,
            onClick: () => {
              if (!hasRun) return;
              this.game.run = structuredClone(this.game.save.currentRun);
              this.game.goto('map');
            },
          }),
          el('button', {
            class: 'btn danger',
            text: 'Wipe Save',
            onClick: () => {
              if (!confirm('Delete local save?')) return;
              this.game.save = SaveManager.defaultSave();
              SaveManager.save(this.game.save);
              this.game.run = null;
              this.mount();
            },
          }),
        ]),
      ]);
    } else {
      const chars = this.game.listCharacters();
      this.root = el('div', { class: 'screen menu-screen' }, [
        el('div', { class: 'title-block', style: 'margin-top:4vh' }, [
          el('h1', { text: 'Choose Operator' }),
          el('div', { class: 'sub', text: 'Talent passive applies for the whole run.' }),
        ]),
        el('div', { class: 'menu-list' }, [
          ...chars.map((c) => {
            const prog = this.game.save.characterProgress?.[c.id] || {};
            return el(
              'button',
              {
                class: 'char-btn',
                style: `border-color:${c.color}55`,
                onClick: () => this.game.startRun(c.id),
              },
              [
                el('img', { class: 'char-portrait', src: portrait(c.id, c.name), alt: c.name }),
                el('div', { class: 'char-copy' }, [
                  el('div', { class: 'name', text: c.name }),
                  el('div', { class: 'desc', text: `${c.title} · HP ${c.hp}` }),
                  el('div', { class: 'desc', text: `${c.talent.name}: ${c.talent.description}` }),
                  el('div', { class: 'desc', text: `W/L ${prog.wins || 0}/${prog.deaths || 0}` }),
                ]),
              ],
            );
          }),
          el('button', {
            class: 'btn',
            text: 'Back',
            onClick: () => {
              this.mode = 'title';
              this.mount();
            },
          }),
        ]),
      ]);
    }

    ui.appendChild(this.root);
  }

  /** Canvas garnish handled by Game.loop */
  render() {}
}
