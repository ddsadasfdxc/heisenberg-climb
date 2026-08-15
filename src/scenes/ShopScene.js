/**
 * Run shop: buy cards / relics, remove a card.
 */
import { el, clear } from '../ui/dom.js';
import { sceneArt } from '../ui/art.js';
import { CARDS } from '../data/cards.js';
import { RELICS, relicPrice } from '../data/relics.js';

export class ShopScene {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.root = null;
    this.offer = null;
  }

  /** @param {{offer?: any}} [data] */
  enter(data = {}) {
    this.offer = data.offer || this.game.buildShopOffer?.() || { cards: [], relics: [], removePrice: 50 };
    this.mount();
  }

  exit() {
    if (this.root?.parentNode) this.root.remove();
    this.root = null;
    this.offer = null;
  }

  priceMultiplier() {
    return this.game.getShopPriceMultiplier?.() ?? 1;
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
    const mult = this.priceMultiplier();
    const offer = this.offer;

    const cardEls = (offer.cards || []).map((slot, idx) => {
      const def = CARDS[slot.id];
      if (!def) return el('div', { class: 'shop-slot sold', text: '—' });
      const price = Math.max(1, Math.round(slot.price * mult));
      const sold = !!slot.sold;
      return el(
        'button',
        {
          class: `shop-slot card-slot${sold ? ' sold' : ''}`,
          disabled: sold || run.gold < price,
          onClick: () => {
            if (sold) return;
            if (!g.buyShopCard(idx)) this.mount();
            else this.mount();
          },
        },
        [
          el('div', { class: 'cost', text: String(def.cost) }),
          el('div', { class: 'cname', text: def.name }),
          el('div', { class: 'ctype', text: `${def.type} · ${def.rarity}` }),
          el('div', { class: 'cdesc', text: def.description }),
          el('div', { class: 'price', text: sold ? 'SOLD' : `${price}g` }),
        ],
      );
    });

    const relicEls = (offer.relics || []).map((slot, idx) => {
      const def = RELICS[slot.id];
      if (!def) return el('div', { class: 'shop-slot sold', text: '—' });
      const price = Math.max(1, Math.round((slot.price ?? relicPrice(def)) * mult));
      const sold = !!slot.sold;
      return el(
        'button',
        {
          class: `shop-slot relic-slot${sold ? ' sold' : ''}`,
          disabled: sold || run.gold < price,
          onClick: () => {
            g.buyShopRelic(idx);
            this.mount();
          },
        },
        [
          el('div', { class: 'cname', text: def.name }),
          el('div', { class: 'ctype', text: def.rarity }),
          el('div', { class: 'cdesc', text: def.description }),
          el('div', { class: 'price', text: sold ? 'SOLD' : `${price}g` }),
        ],
      );
    });

    const removePrice = Math.max(1, Math.round((offer.removePrice || 50) * mult));

    this.root = el('div', { class: 'screen shop-screen art-screen', style: `--scene-art:url("${sceneArt('shop')}")` }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'pill hp', html: `HP <span>${run.hp}/${run.maxHp}</span>` }),
          el('span', { class: 'pill', html: `GOLD <span style="color:var(--warn)">${run.gold}</span>` }),
          el('span', { class: 'pill', text: mult < 1 ? `DEAL x${mult.toFixed(2)}` : 'SHOP' }),
        ]),
      ]),
      el('div', { class: 'title-block', style: 'margin-top:1vh' }, [
        el('h1', { text: "Saul's Side Hustle" }),
        el('div', { class: 'sub', text: 'Cards, relics, and discreet deletions.' }),
      ]),
      el('div', { class: 'shop-section' }, [
        el('h3', { text: 'Cards' }),
        el('div', { class: 'shop-grid' }, cardEls),
      ]),
      el('div', { class: 'shop-section' }, [
        el('h3', { text: 'Relics' }),
        el('div', { class: 'shop-grid' }, relicEls),
      ]),
      el('div', { class: 'menu-list' }, [
        el('button', {
          class: 'btn',
          text: `Remove a card (${removePrice}g)` ,
          disabled: run.gold < removePrice || run.deck.length <= 5,
          onClick: () => {
            g.openCardRemoval(removePrice);
          },
        }),
        el('button', {
          class: 'btn primary',
          text: 'Leave Shop',
          onClick: () => g.leaveShop(),
        }),
      ]),
    ]);
    ui.appendChild(this.root);
  }

  render() {}
}
