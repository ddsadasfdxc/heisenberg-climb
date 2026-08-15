/**
 * Card database — declarative effects only.
 * @typedef {'attack'|'skill'|'power'|'status'|'curse'} CardType
 * @typedef {'common'|'uncommon'|'rare'|'legendary'} Rarity
 * @typedef {Object} CardEffect
 * @property {string} type
 * @property {number} [value]
 * @property {string} [target] enemy|all_enemies|self|random_enemy
 * @property {string} [status]
 * @property {any} [if]
 * @property {any} [then]
 *
 * @typedef {Object} CardDef
 * @property {string} id
 * @property {string} name
 * @property {number} cost
 * @property {CardType} type
 * @property {Rarity} rarity
 * @property {string|null} character
 * @property {string} description
 * @property {CardEffect[]} effects
 * @property {boolean} [exhaust]
 * @property {boolean} [ethereal]
 * @property {boolean} [needsTarget]
 * @property {{name:string, effects?:CardEffect[], cost?:number, description?:string}} [upgrade]
 */

/** @type {Record<string, CardDef>} */
export const CARDS = {
  strike: {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    character: null,
    description: 'Deal {dmg} damage.',
    needsTarget: true,
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
    upgrade: { name: 'Strike+', effects: [{ type: 'damage', value: 9, target: 'enemy' }] },
  },
  defend: {
    id: 'defend',
    name: 'Defend',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    character: null,
    description: 'Gain {blk} Block.',
    needsTarget: false,
    effects: [{ type: 'block', value: 5, target: 'self' }],
    upgrade: { name: 'Defend+', effects: [{ type: 'block', value: 8, target: 'self' }] },
  },
  blue_sky: {
    id: 'blue_sky',
    name: 'Blue Sky',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    character: 'walter',
    description: 'Deal 15 damage. If target has Chemical Burn, deal double. Gain 2 Purity.',
    needsTarget: true,
    effects: [
      { type: 'damage', value: 15, target: 'enemy' },
      { type: 'condition', if: { hasStatus: 'chemical_burn', on: 'target' }, then: { type: 'damage', value: 15, target: 'enemy' } },
      { type: 'apply_status', status: 'purity', value: 2, target: 'self' },
    ],
    upgrade: {
      name: 'Blue Sky+',
      description: 'Deal 22 damage. If target has Chemical Burn, deal double. Gain 3 Purity.',
      effects: [
        { type: 'damage', value: 22, target: 'enemy' },
        { type: 'condition', if: { hasStatus: 'chemical_burn', on: 'target' }, then: { type: 'damage', value: 22, target: 'enemy' } },
        { type: 'apply_status', status: 'purity', value: 3, target: 'self' },
      ],
    },
  },
  say_my_name: {
    id: 'say_my_name',
    name: 'Say My Name',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    character: 'walter',
    description: 'Apply 2 Vulnerable. Gain 1 Purity. If Purity ≥ 5, draw 1.',
    needsTarget: true,
    effects: [
      { type: 'apply_status', status: 'vulnerable', value: 2, target: 'enemy' },
      { type: 'apply_status', status: 'purity', value: 1, target: 'self' },
      { type: 'condition', if: { selfStatusAtLeast: ['purity', 5] }, then: { type: 'draw', value: 1 } },
    ],
    upgrade: {
      name: 'Say My Name+',
      description: 'Apply 3 Vulnerable. Gain 2 Purity. If Purity ≥ 5, draw 2.',
      effects: [
        { type: 'apply_status', status: 'vulnerable', value: 3, target: 'enemy' },
        { type: 'apply_status', status: 'purity', value: 2, target: 'self' },
        { type: 'condition', if: { selfStatusAtLeast: ['purity', 5] }, then: { type: 'draw', value: 2 } },
      ],
    },
  },
  crystal_cook: {
    id: 'crystal_cook',
    name: 'Crystal Cook',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    character: 'walter',
    description: 'Apply 3 Chemical Burn. Gain 1 Purity.',
    needsTarget: true,
    effects: [
      { type: 'apply_status', status: 'chemical_burn', value: 3, target: 'enemy' },
      { type: 'apply_status', status: 'purity', value: 1, target: 'self' },
    ],
    upgrade: {
      name: 'Crystal Cook+',
      effects: [
        { type: 'apply_status', status: 'chemical_burn', value: 5, target: 'enemy' },
        { type: 'apply_status', status: 'purity', value: 2, target: 'self' },
      ],
    },
  },
  legal_loophole: {
    id: 'legal_loophole',
    name: 'Legal Loophole',
    cost: 1,
    type: 'skill',
    rarity: 'rare',
    character: 'saul',
    description: 'Gain Loophole (next enemy intent skipped). Draw 1.',
    needsTarget: false,
    effects: [
      { type: 'apply_status', status: 'loophole', value: 1, target: 'self' },
      { type: 'draw', value: 1 },
    ],
    upgrade: {
      name: 'Legal Loophole+',
      description: 'Gain Loophole. Draw 2. Gain 4 Block.',
      effects: [
        { type: 'apply_status', status: 'loophole', value: 1, target: 'self' },
        { type: 'draw', value: 2 },
        { type: 'block', value: 4, target: 'self' },
      ],
    },
  },
  slippin_jimmy: {
    id: 'slippin_jimmy',
    name: "Slippin' Jimmy",
    cost: 0,
    type: 'skill',
    rarity: 'uncommon',
    character: 'saul',
    description: 'Gain 4 Block. Apply 1 Weak to a random enemy.',
    needsTarget: false,
    effects: [
      { type: 'block', value: 4, target: 'self' },
      { type: 'apply_status', status: 'weak', value: 1, target: 'random_enemy' },
    ],
    upgrade: {
      name: "Slippin' Jimmy+",
      effects: [
        { type: 'block', value: 6, target: 'self' },
        { type: 'apply_status', status: 'weak', value: 2, target: 'random_enemy' },
      ],
    },
  },
  objection: {
    id: 'objection',
    name: 'Objection!',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    character: 'saul',
    description: 'Enemy loses 8 intent damage this turn (min 0). Gain 3 Block.',
    needsTarget: true,
    effects: [
      { type: 'reduce_intent', value: 8, target: 'enemy' },
      { type: 'block', value: 3, target: 'self' },
    ],
    upgrade: {
      name: 'Objection!+',
      effects: [
        { type: 'reduce_intent', value: 12, target: 'enemy' },
        { type: 'block', value: 5, target: 'self' },
      ],
    },
  },
  yo_bitch: {
    id: 'yo_bitch',
    name: 'Yo, Bitch!',
    cost: 1,
    type: 'attack',
    rarity: 'uncommon',
    character: 'jesse',
    description: 'Deal 4-12 random damage. Impulse.',
    needsTarget: true,
    effects: [{ type: 'damage_random', min: 4, max: 12, target: 'enemy' }],
    upgrade: {
      name: 'Yo, Bitch!+',
      effects: [{ type: 'damage_random', min: 7, max: 16, target: 'enemy' }],
    },
  },
  science_bitch: {
    id: 'science_bitch',
    name: 'Science, Bitch!',
    cost: 1,
    type: 'skill',
    rarity: 'rare',
    character: 'jesse',
    description: 'Draw 2. Gain 1 energy next turn (impulse flag).',
    needsTarget: false,
    effects: [
      { type: 'draw', value: 2 },
      { type: 'energy_next_turn', value: 1 },
    ],
    upgrade: {
      name: 'Science, Bitch!+',
      effects: [
        { type: 'draw', value: 3 },
        { type: 'energy_next_turn', value: 1 },
      ],
    },
  },
  half_measure: {
    id: 'half_measure',
    name: 'No Half Measures',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    character: 'mike',
    description: 'Deal 12. If target HP < 25%, deal double.',
    needsTarget: true,
    effects: [
      { type: 'damage', value: 12, target: 'enemy' },
      { type: 'condition', if: { targetHpBelowPct: 0.25 }, then: { type: 'damage', value: 12, target: 'enemy' } },
    ],
    upgrade: {
      name: 'No Half Measures+',
      effects: [
        { type: 'damage', value: 16, target: 'enemy' },
        { type: 'condition', if: { targetHpBelowPct: 0.25 }, then: { type: 'damage', value: 16, target: 'enemy' } },
      ],
    },
  },
  setup_shot: {
    id: 'setup_shot',
    name: 'Setup Shot',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    character: 'mike',
    description: 'Gain 1 Setup. Next attack deals +50%.',
    needsTarget: false,
    effects: [{ type: 'apply_status', status: 'setup', value: 1, target: 'self' }],
    upgrade: {
      name: 'Setup Shot+',
      description: 'Gain 2 Setup. Next attacks enhanced.',
      effects: [{ type: 'apply_status', status: 'setup', value: 2, target: 'self' }],
    },
  },
  clean_hit: {
    id: 'clean_hit',
    name: 'Clean Hit',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    character: 'mike',
    description: 'Deal 8. Precise.',
    needsTarget: true,
    effects: [{ type: 'damage', value: 8, target: 'enemy' }],
    upgrade: {
      name: 'Clean Hit+',
      effects: [{ type: 'damage', value: 11, target: 'enemy' }],
    },
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    cost: 2,
    type: 'attack',
    rarity: 'common',
    character: null,
    description: 'Deal 8 damage. Apply 2 Vulnerable.',
    needsTarget: true,
    effects: [
      { type: 'damage', value: 8, target: 'enemy' },
      { type: 'apply_status', status: 'vulnerable', value: 2, target: 'enemy' },
    ],
    upgrade: {
      name: 'Bash+',
      effects: [
        { type: 'damage', value: 10, target: 'enemy' },
        { type: 'apply_status', status: 'vulnerable', value: 3, target: 'enemy' },
      ],
    },
  },
  dread: {
    id: 'dread',
    name: 'Dread',
    cost: 1,
    type: 'status',
    rarity: 'curse',
    character: null,
    description: 'Unplayable. Ethereal.',
    needsTarget: false,
    ethereal: true,
    unplayable: true,
    effects: [],
  },
  neutralizer: {
    id: 'neutralizer',
    name: 'Neutralizer',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    character: null,
    description: 'Gain 7 Block. Exhaust.',
    needsTarget: false,
    exhaust: true,
    effects: [{ type: 'block', value: 7, target: 'self' }],
    upgrade: {
      name: 'Neutralizer+',
      effects: [{ type: 'block', value: 10, target: 'self' }],
    },
  },
};

/**
 * Clone a card def into a runtime instance.
 * @param {string} cardId
 * @param {{upgraded?: boolean}} [opts]
 */
export function createCardInstance(cardId, opts = {}) {
  const base = CARDS[cardId];
  if (!base) throw new Error(`Unknown card: ${cardId}`);
  const upgraded = !!opts.upgraded;
  const inst = {
    uid: `${cardId}_${Math.random().toString(36).slice(2, 9)}`,
    defId: cardId,
    name: base.name,
    cost: base.cost,
    type: base.type,
    rarity: base.rarity,
    character: base.character,
    description: base.description,
    effects: structuredClone(base.effects),
    exhaust: !!base.exhaust,
    ethereal: !!base.ethereal,
    needsTarget: base.needsTarget !== false && base.type === 'attack' ? true : !!base.needsTarget,
    unplayable: !!base.unplayable,
    upgraded: false,
  };
  if (upgraded && base.upgrade) {
    inst.upgraded = true;
    inst.name = base.upgrade.name || `${base.name}+`;
    if (base.upgrade.cost != null) inst.cost = base.upgrade.cost;
    if (base.upgrade.effects) inst.effects = structuredClone(base.upgrade.effects);
    if (base.upgrade.description) inst.description = base.upgrade.description;
  }
  // attack default needsTarget
  if (inst.type === 'attack' && base.needsTarget !== false) inst.needsTarget = true;
  return inst;
}

/** @param {string} characterId */
export function getRewardPool(characterId) {
  return Object.values(CARDS).filter(
    (c) => c.rarity !== 'curse' && (c.character === null || c.character === characterId),
  );
}
