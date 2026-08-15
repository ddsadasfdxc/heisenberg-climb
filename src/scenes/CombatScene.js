/**
 * Combat HUD: hand, enemies, end turn.
 */
import { el, clear, formatStatuses, intentText, cardDescription } from '../ui/dom.js';
import { portrait } from '../ui/art.js';

export class CombatScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.unsub = null;
    this.snap = null;
    this.pendingUid = null;
    this.ended = false;
  }

  enter() {
    this.ended = false;
    this.pendingUid = null;
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
    if (this.root?.parentNode) this.root.remove();
    this.root = null;
    this.snap = null;
    this.pendingUid = null;
  }

  mount() {
    const g = this.game;
    const c = g.combat;
    const ui = g.uiLayer;
    clear(ui);
    if (!c) {
      g.goto('map');
      return;
    }
    const s = this.snap || c.snapshot();
    this.snap = s;
    const p = s.player;
    const selected = s.hand.find((card) => card.uid === s.selectedCardUid) || null;
    const needsTarget = !!(selected && selected.needsTarget);

    const enemyEls = s.enemies.map((e) => {
      const hpPct = Math.max(0, Math.min(100, (e.hp / Math.max(1, e.maxHp)) * 100));
      const cls = ['enemy-card'];
      if (e.dead) cls.push('dead');
      if (needsTarget && !e.dead) cls.push('targetable');
      return el(
        'div',
        {
          class: cls.join(' '),
          onClick: () => {
            if (e.dead || s.phase !== 'player') return;
            if (selected?.needsTarget) {
              const r = c.playCard(selected.uid, e.id);
              if (!r.ok && r.reason === 'no_energy') g.pushMud('Not enough energy.', 'warn');
            } else if (selected) {
              // non-target card; clicking enemy ignored
            } else {
              g.pushMud(`${e.name}: ${intentText(e.intent)}`, 'sys');
            }
          },
        },
        [
          el('img', { class: 'enemy-portrait', src: portrait(e.defId, e.name), alt: e.name }),
          el('div', { class: 'ename', text: e.name }),
          el('div', { class: 'intent', text: e.dead ? 'DOWN' : intentText(e.intent) }),
          el('div', { class: 'bar' }, [el('i', { style: `width:${hpPct}%` })]),
          el('div', {
            class: 'status-line',
            text: e.dead ? '—' : `HP ${e.hp}/${e.maxHp}${e.block ? ` · BLK ${e.block}` : ''}`,
          }),
          el('div', { class: 'status-line', text: formatStatuses(e.statuses) || ' ' }),
        ],
      );
    });

    const handEls = s.hand.map((card) => {
      const unplayable = card.unplayable || s.phase !== 'player' || p.energy < card.cost;
      const cls = ['card'];
      if (card.uid === s.selectedCardUid) cls.push('selected');
      if (unplayable) cls.push('unplayable');
      return el(
        'div',
        {
          class: cls.join(' '),
          onClick: () => {
            if (s.phase !== 'player' || this.ended) return;
            if (card.uid === s.selectedCardUid) {
              // second tap plays if no target needed
              if (!card.needsTarget) {
                const r = c.playCard(card.uid, null);
                if (!r.ok) this.feedback(r.reason);
              } else {
                c.selectCard(card.uid); // deselect
              }
              return;
            }
            c.selectCard(card.uid);
            if (!card.needsTarget) {
              // auto-play non-target on first confirm style: require double tap via selected
              // keep selected so user taps again or uses Play
            }
          },
        },
        [
          el('div', { class: 'cost', text: String(card.cost) }),
          el('div', { class: 'cname', text: card.name }),
          el('div', { class: 'ctype', text: card.type }),
          el('div', { class: 'cdesc', text: cardDescription(card) }),
        ],
      );
    });

    const playDisabled =
      s.phase !== 'player' || !selected || (selected.needsTarget && s.enemies.filter((e) => !e.dead).length !== 1);

    this.root = el('div', { class: 'screen combat-screen' }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'pill hp', html: `HP <span>${p.hp}/${p.maxHp}</span>` }),
          el('span', { class: 'pill block', html: `BLK <span>${p.block || 0}</span>` }),
          el('span', { class: 'pill energy', html: `EN <span>${p.energy}/${p.maxEnergy}</span>` }),
          el('span', { class: 'pill', text: `T${s.turn}` }),
          el('span', { class: 'pill', text: `DRAW ${s.drawCount}` }),
          el('span', { class: 'pill', text: `DISC ${s.discardCount}` }),
        ]),
        el('div', { class: 'status-line', text: formatStatuses(p.statuses) || 'No statuses' }),
      ]),
      el('div', { class: 'combat-stage' }, [el('div', { class: 'enemy-row' }, enemyEls)]),
      el('div', { class: 'hand-area' }, [
        el('div', {
          class: 'status-line',
          text:
            s.phase !== 'player'
              ? `Phase: ${s.phase}`
              : needsTarget
                ? 'Select a target enemy'
                : selected
                  ? 'Tap card again or Play'
                  : 'Select a card',
        }),
        el('div', { class: 'hand' }, handEls),
        el('div', { class: 'action-bar' }, [
          el('button', {
            class: 'btn primary',
            text: 'Play',
            disabled: !selected || s.phase !== 'player',
            onClick: () => {
              if (!selected) return;
              const live = s.enemies.filter((e) => !e.dead);
              const targetId = selected.needsTarget && live.length === 1 ? live[0].id : null;
              const r = c.playCard(selected.uid, targetId);
              if (!r.ok) this.feedback(r.reason);
            },
          }),
          el('button', {
            class: 'btn',
            text: 'End Turn',
            disabled: s.phase !== 'player',
            onClick: () => c.endTurn(),
          }),
          ...(g.run?.characterId === 'saul' && !c.flags.negotiated ? [el('button', {
            class: 'btn negotiate-btn', text: 'Negotiate', disabled: s.phase !== 'player', onClick: () => c.negotiate(),
          })] : []),
        ]),
      ]),
    ]);

    // Hide unused lint
    void playDisabled;

    ui.appendChild(this.root);

    // combat mud layer visibility
    if (g.mudLayer) g.mudLayer.classList.toggle('hidden', false);
  }

  feedback(reason) {
    const map = {
      no_energy: 'Not enough energy.',
      need_target: 'Choose a target.',
      not_player_turn: 'Not your turn.',
      not_in_hand: 'Card not in hand.',
    };
    this.game.pushMud(map[reason] || `Cannot play (${reason})`, 'warn');
  }

  render() {}
}
