/**
 * Playable characters.
 * @typedef {Object} CharacterDef
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {number} hp
 * @property {number} maxEnergy
 * @property {string[]} startingDeck
 * @property {{id:string, name:string, description:string}} talent
 * @property {string} color
 * @property {string} unlockCondition
 */

/** @type {Record<string, CharacterDef>} */
export const CHARACTERS = {
  walter: {
    id: 'walter',
    name: 'Walter White',
    title: 'The One Who Knocks',
    hp: 80,
    maxEnergy: 3,
    color: '#3dd6c6',
    startingDeck: [
      'strike','strike','strike','strike','strike',
      'defend','defend','defend','defend','defend',
      'blue_sky','say_my_name',
    ],
    talent: {
      id: 'knocker',
      name: 'I Am the One Who Knocks',
      description: 'When hand size < 3, deal +25% damage.',
    },
    unlockCondition: 'default',
  },
  saul: {
    id: 'saul',
    name: 'Saul Goodman',
    title: 'Better Call Saul',
    hp: 75,
    maxEnergy: 3,
    color: '#f0c14a',
    startingDeck: [
      'strike','strike','strike','strike','strike',
      'defend','defend','defend','defend','defend',
      'legal_loophole','slippin_jimmy',
    ],
    talent: {
      id: 'better_call',
      name: 'Better Call Saul',
      description: 'Once per combat: Negotiate — end fight for 50% gold, gain a random curse-lite debuff next fight.',
    },
    unlockCondition: 'default',
  },
  jesse: {
    id: 'jesse',
    name: 'Jesse Pinkman',
    title: 'Yo, Science!',
    hp: 70,
    maxEnergy: 3,
    color: '#ff8a5c',
    startingDeck: [
      'strike','strike','strike','strike','strike',
      'defend','defend','defend','defend',
      'yo_bitch','science_bitch','bash',
    ],
    talent: {
      id: 'yo_science',
      name: 'Yo, Science!',
      description: 'Every 4th card played costs 0 energy.',
    },
    unlockCondition: 'default',
  },
  mike: {
    id: 'mike',
    name: 'Mike Ehrmantraut',
    title: 'No Half Measures',
    hp: 85,
    maxEnergy: 3,
    color: '#7aa2ff',
    startingDeck: [
      'strike','strike','strike','strike',
      'defend','defend','defend','defend','defend',
      'clean_hit','setup_shot','half_measure',
    ],
    talent: {
      id: 'no_half',
      name: 'No Half Measures',
      description: 'Attacks vs enemies below 25% HP critically strike (x2).',
    },
    unlockCondition: 'default',
  },
};

export function listPlayableCharacters() {
  return Object.values(CHARACTERS);
}
