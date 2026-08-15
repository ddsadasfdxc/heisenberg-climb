/**
 * Status effect definitions (data-driven).
 * @typedef {Object} StatusDef
 * @property {string} id
 * @property {string} name
 * @property {boolean} stackable
 * @property {boolean} [endOfTurn]
 * @property {number} [duration]
 * @property {number} [max]
 * @property {string} effect
 * @property {number} [valuePerStack]
 * @property {string} icon
 * @property {string} [color]
 */

/** @type {Record<string, StatusDef>} */
export const STATUS_EFFECTS = {
  poison: {
    id: 'poison',
    name: 'Poison',
    stackable: true,
    endOfTurn: true,
    effect: 'lose_hp',
    valuePerStack: 2,
    icon: '☠',
    color: '#6dde7a',
  },
  chemical_burn: {
    id: 'chemical_burn',
    name: 'Chemical Burn',
    stackable: true,
    endOfTurn: true,
    effect: 'lose_hp',
    valuePerStack: 3,
    icon: '⚗',
    color: '#3dd6c6',
  },
  vulnerable: {
    id: 'vulnerable',
    name: 'Vulnerable',
    stackable: false,
    duration: 2,
    effect: 'incoming_damage_x1.5',
    icon: '🛡',
    color: '#ff5c5c',
  },
  weak: {
    id: 'weak',
    name: 'Weak',
    stackable: false,
    duration: 2,
    effect: 'outgoing_damage_x0.75',
    icon: '⬇',
    color: '#f0c14a',
  },
  frail: {
    id: 'frail',
    name: 'Frail',
    stackable: false,
    duration: 2,
    effect: 'block_gained_x0.75',
    icon: '🧱',
    color: '#8fa3b8',
  },
  purity: {
    id: 'purity',
    name: 'Purity',
    stackable: true,
    max: 99,
    effect: 'special',
    icon: '💎',
    color: '#b48cff',
  },
  loophole: {
    id: 'loophole',
    name: 'Loophole',
    stackable: false,
    duration: 1,
    effect: 'skip_enemy_intent',
    icon: '⚖',
    color: '#f0c14a',
  },
  setup: {
    id: 'setup',
    name: 'Setup',
    stackable: true,
    effect: 'next_card_enhanced',
    icon: '🎯',
    color: '#7aa2ff',
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    stackable: true,
    effect: 'damage_bonus',
    valuePerStack: 1,
    icon: '💪',
    color: '#ff8a5c',
  },
  ritual: {
    id: 'ritual',
    name: 'Ritual',
    stackable: true,
    endOfTurn: false,
    effect: 'gain_strength_eot',
    valuePerStack: 1,
    icon: '🔥',
    color: '#ff5c5c',
  },
};
