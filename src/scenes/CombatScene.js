/**
 * Combat HUD: tactical stage, enemy dossiers and illustrated hand.
 */
import { el, clear, formatStatuses, intentText, cardDescription } from '../ui/dom.js';
import { portrait, sceneStyle, cardSuit } from '../ui/art.js';
import { cardArt } from '../ui/cardArt.js';

function cardNode(card, className, onClick, disabled = false, footer = null) {
  const type = card.type || 'skill';
  const artId = card.defId || card.id;
  return el('button', {
    class: `game-card ${type} ${className || ''}`.trim(),
    disabled,
    style: `--card-art:url("${cardArt(artId, type)}")`,
    onClick,
    'aria-label': `${card.name}: ${cardDescription(card)}`,
  }, [
    el('span', { class: 'card-cost', text: String(card.cost ?? 0) }),
    el('span', { class: 'card-suit', text: cardSuit(type) }),
    el('span', { class: 'card-visual', 'aria-hidden': 'true' }, [
      el('span', { class: 'card-stamp', text: card.rarity || type }),
    ]),
    el('span', { class: 'card-name', text: card.name }),
    el('span', { class: 'card-type', text: `${type} // ${card.rarity || 'standard'}` }),
    el('span', { class: 'card-copy', text: cardDescription(card) }),
    footer,
  ]);
}

export class CombatScene {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.unsub = null;
    this.snap = null;
    this.ended = false;
  }

  enter() {
    this.ended = false;
    this.snap = this.game.combat?.snapshot?.() || null;
    this.unsub = this.game.bus.on('combat:update', (s) => {
      this.snap = s;
      this.mount();
    });
    this.mount();
  }

  exit() {
    if (typeof this.unsub === 'function') this.unsub();
    this.unsub = null;
    this.root?.remove();
    this.root = null;
    this.snap = null;
  }

  mount() {
    const g = this.game;
    const c = g.combat;
    const ui = g.uiLayer;
    clear(ui);
    if (!c) return g.goto('map');

    const s = this.snap || c.snapshot();
    this.snap = s;
    const p = s.player;
    const selected = s.hand.find((card) => card.uid === s.selectedCardUid) || null;
    const needsTarget = !!selected?.needsTarget;
    const liveEnemies = s.enemies.filter((e) => !e.dead);
    const bossFight = s.enemies.some((e) => e.tags?.includes('boss'));
    const scene = bossFight ? 'boss' : 'combat';

    const enemies = s.enemies.map((e, index) => {
      const hpPct = Math.max(0, Math.min(100, (e.hp / Math.max(1, e.maxHp)) * 100));
      const classes = [
        'enemy-dossier',
        e.tags?.includes('boss') ? 'boss' : '',
        e.dead ? 'dead' : '',
        needsTarget && !e.dead ? 'targetable' : '',
      ].filter(Boolean).join(' ');

      return el('button', {
        class: classes,
        style: `--enemy-index:${index}`,
        disabled: e.dead,
        onClick: () => {
          if (e.dead || s.phase !== 'player') return;
          if (selected?.needsTarget) {
            const result = c.playCard(selected.uid, e.id);
            if (!result.ok) this.feedback(result.reason);
          } else {
            g.pushMud(`${e.name}: ${intentText(e.intent)}`, 'sys');
          }
        },
      }, [
        el('span', { class: 'enemy-case', text: e.tags?.includes('boss') ? 'PRIORITY TARGET' : `CASE 0${index + 1}` }),
        el('span', { class: 'enemy-image-wrap' }, [
          el('img', { class: 'enemy-portrait', src: portrait(e.defId, e.name), alt: e.name }),
          el('span', { class: 'enemy-scan', 'aria-hidden': 'true' }),
        ]),
        el('span', { class: 'enemy-name', text: e.name }),
        el('span', { class: 'enemy-intent-label', text: 'NEXT MOVE' }),
        el('span', { class: `enemy-intent ${e.intent?.type || ''}`, text: e.dead ? 'DOWN' : intentText(e.intent) }),
        el('span', { class: 'health-track' }, [el('i', { style: `width:${hpPct}%` })]),
        el('span', {
          class: 'enemy-vitals',
          text: e.dead ? 'NEUTRALIZED' : `HP ${e.hp}/${e.maxHp}${e.block ? ` · BLK ${e.block}` : ''}`,
        }),
        el('span', { class: 'enemy-statuses', text: formatStatuses(e.statuses) || 'NO ACTIVE EFFECTS' }),
      ]);
    });

    const hand = s.hand.map((card, index) => {
      const unplayable = card.unplayable || s.phase !== 'player' || p.energy < card.cost;
      const className = [
        card.uid === s.selectedCardUid ? 'selected' : '',
        unplayable ? 'unplayable' : '',
      ].filter(Boolean).join(' ');

      const node = cardNode(card, className, () => {
        if (s.phase !== 'player' || this.ended || card.unplayable) return;
        if (card.uid === s.selectedCardUid) {
          if (!card.needsTarget) {
            const result = c.playCard(card.uid, null);
            if (!result.ok) this.feedback(result.reason);
          } else {
            c.selectCard(card.uid);
          }
          return;
        }
        c.selectCard(card.uid);
      });
      node.style.setProperty('--hand-index', index);
      return node;
    });

    const instruction = s.phase !== 'player'
      ? `Phase: ${s.phase}`
      : needsTarget
        ? 'Select a marked target'
        : selected
          ? 'Tap again to confirm — or use Play'
          : 'Select a card from your hand';
    const playerHp = Math.max(0, Math.min(100, (p.hp / Math.max(1, p.maxHp)) * 100));

    this.root = el('div', {
      class: `screen combat-screen cinematic-screen ${bossFight ? 'boss-fight' : ''}`,
      style: sceneStyle(scene),
    }, [
      el('div', { class: 'combat-backdrop', 'aria-hidden': 'true' }, [
        el('div', { class: 'desert-haze' }),
        el('div', { class: 'stage-vignette' }),
      ]),
      el('header', { class: 'combat-command' }, [
        el('div', { class: 'command-brand' }, [
          el('span', { class: 'eyebrow', text: bossFight ? 'FINAL INTERCEPT' : 'FIELD OPERATION' }),
          el('strong', { text: bossFight ? 'LOS POLLOS HQ' : 'ALBUQUERQUE // ACTIVE' }),
        ]),
        el('div', { class: 'command-turn' }, [el('small', { text: 'TURN' }), el('b', { text: String(s.turn).padStart(2, '0') })]),
        el('div', { class: 'combat-resources' }, [
          el('span', { class: 'resource hp-resource' }, [
            el('small', { text: 'VITALS' }),
            el('b', {}, [document.createTextNode(String(p.hp)), el('em', { text: `/${p.maxHp}` })]),
            el('i', { style: `--fill:${playerHp}%` }),
          ]),
          el('span', { class: 'resource block-resource' }, [el('small', { text: 'ARMOR' }), el('b', { text: String(p.block || 0) })]),
          el('span', { class: 'resource energy-resource' }, [
            el('small', { text: 'ENERGY' }),
            el('b', {}, [document.createTextNode(String(p.energy)), el('em', { text: `/${p.maxEnergy}` })]),
          ]),
        ]),
      ]),
      el('div', { class: 'combat-meta' }, [
        el('span', { text: formatStatuses(p.statuses) || 'STATUS // CLEAN' }),
        el('span', {
          text: `DRAW ${String(s.drawCount).padStart(2, '0')} · DISC ${String(s.discardCount).padStart(2, '0')} · EXH ${String(s.exhaustCount).padStart(2, '0')}`,
        }),
      ]),
      el('main', { class: 'combat-stage' }, [
        el('div', { class: 'stage-caption' }, [el('span', { text: 'THREAT ASSESSMENT' }), el('i')]),
        el('div', { class: 'enemy-row' }, enemies),
      ]),
      el('section', { class: 'hand-console' }, [
        el('div', { class: 'hand-heading' }, [
          el('div', {}, [
            el('span', { class: 'eyebrow', text: 'TACTICAL HAND' }),
            el('strong', { text: instruction }),
          ]),
          el('span', { class: 'hand-count', text: `${s.hand.length} CARDS` }),
        ]),
        el('div', { class: 'hand' }, hand),
        el('div', { class: 'action-bar' }, [
          el('button', {
            class: 'btn play-btn primary',
            text: selected?.needsTarget && liveEnemies.length > 1 ? 'Choose Target' : 'Execute Card',
            disabled: !selected || s.phase !== 'player',
            onClick: () => {
              if (!selected) return;
              const target = selected.needsTarget && liveEnemies.length === 1 ? liveEnemies[0].id : null;
              const result = c.playCard(selected.uid, target);
              if (!result.ok) this.feedback(result.reason);
            },
          }),
          el('button', {
            class: 'btn end-turn-btn',
            text: 'End Turn',
            disabled: s.phase !== 'player',
            onClick: () => c.endTurn(),
          }),
          ...(g.run?.characterId === 'saul' && !c.flags.negotiated
            ? [el('button', {
                class: 'btn negotiate-btn',
                disabled: s.phase !== 'player',
                onClick: () => c.negotiate(),
              }, [el('span', { text: 'NEGOTIATE EXIT' }), el('small', { text: 'Pay 50% gold · carry Weak into next fight' })])]
            : []),
        ]),
      ]),
    ]);

    ui.appendChild(this.root);
    g.mudLayer?.classList.toggle('hidden', false);
  }

  feedback(reason) {
    const map = {
      no_energy: 'Not enough energy.',
      need_target: 'Choose a target.',
      not_player_turn: 'Not your turn.',
      not_in_hand: 'Card not in hand.',
      unplayable: 'This card cannot be played.',
    };
    this.game.pushMud(map[reason] || `Cannot play (${reason})`, 'warn');
  }

  render() {}
}