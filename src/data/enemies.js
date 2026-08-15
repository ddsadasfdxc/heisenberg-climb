/**
 * Enemy / Boss definitions.
 * Intent patterns are declarative AI cycles.
 */

/** @typedef {'attack'|'defend'|'buff'|'debuff'|'special'} IntentType */

/**
 * @typedef {Object} IntentStep
 * @property {IntentType} type
 * @property {number} [value]
 * @property {number} [hits]
 * @property {string} [status]
 * @property {number} [statusValue]
 * @property {string} [label]
 */

/** @type {Record<string, any>} */
export const ENEMIES = {
  street_dealer: {
    id: 'street_dealer',
    name: 'Street Dealer',
    hp: 36,
    tags: ['enemy'],
    intents: [
      { type: 'attack', value: 7, label: 'Shiv' },
      { type: 'defend', value: 5, label: 'Duck' },
      { type: 'attack', value: 5, hits: 2, label: 'Wild Swings' },
    ],
    flavor: 'Corner boy with shaky hands and a cheap blade.',
  },
  tuco: {
    id: 'tuco',
    name: 'Tuco Salamanca',
    hp: 60,
    tags: ['enemy', 'elite'],
    intents: [
      { type: 'attack', value: 4, hits: 3, label: 'Tight Tight Tight' },
      { type: 'buff', status: 'strength', statusValue: 2, label: 'Rage' },
      { type: 'attack', value: 14, label: 'Biznatch' },
      { type: 'defend', value: 8, label: 'Paced Breathing' },
    ],
    flavor: 'Unstable. Loud. Extremely dangerous.',
  },
  hank: {
    id: 'hank',
    name: 'Hank Schrader',
    hp: 80,
    tags: ['enemy', 'elite'],
    intents: [
      { type: 'attack', value: 12, label: 'Minerals Talk' },
      { type: 'debuff', status: 'vulnerable', statusValue: 2, value: 6, label: 'Serve Warrant' },
      { type: 'defend', value: 10, label: 'Kevlar' },
      { type: 'attack', value: 9, hits: 2, label: 'ASAC Combo' },
    ],
    flavor: 'DEA instincts. Rocks for breakfast.',
  },
  gus_fring: {
    id: 'gus_fring',
    name: 'Gustavo Fring',
    hp: 250,
    tags: ['enemy', 'boss'],
    phases: [
      {
        untilHpPct: 0.5,
        intents: [
          { type: 'defend', value: 12, label: 'Polite Distance' },
          { type: 'attack', value: 10, label: 'Calculated Cut' },
          { type: 'debuff', status: 'weak', statusValue: 2, value: 8, label: 'Business Review' },
          { type: 'attack', value: 6, hits: 2, label: 'Two Moves Ahead' },
        ],
      },
      {
        untilHpPct: 0,
        intents: [
          { type: 'special', label: 'Face Off', value: 16 },
          { type: 'attack', value: 9, hits: 3, label: 'Box Cutter Storm' },
          { type: 'buff', status: 'strength', statusValue: 2, label: 'No More Mask' },
        ],
      },
    ],
    intents: [], // filled from phase
    flavor: 'Los Pollos. Superlab. Absolute control.',
  },
};

/**
 * @param {string} enemyId
 * @param {{hpScale?: number}} [opts]
 */
export function createEnemyState(enemyId, opts = {}) {
  const def = ENEMIES[enemyId];
  if (!def) throw new Error(`Unknown enemy ${enemyId}`);
  const scale = opts.hpScale ?? 1;
  const maxHp = Math.round(def.hp * scale);
  return {
    id: `${enemyId}_${Math.random().toString(36).slice(2, 7)}`,
    defId: enemyId,
    name: def.name,
    hp: maxHp,
    maxHp,
    block: 0,
    statuses: /** @type {Record<string, number>} */ ({}),
    tags: [...(def.tags || ['enemy'])],
    intentIndex: 0,
    intent: null,
    phase: 0,
    flavor: def.flavor || '',
    dead: false,
  };
}

export function getEnemyDef(id) {
  return ENEMIES[id];
}
