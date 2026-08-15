/**
 * Narrative map events with branching choices.
 * @typedef {{id:string,text:string,effects:any[],requires?:any}} EventChoice
 * @typedef {{id:string,title:string,body:string,choices:EventChoice[]}} EventDef
 */
/** @type {Record<string, EventDef>} */
export const EVENTS = {
  desert_methlab: {
    id: 'desert_methlab',
    title: 'Abandoned RV',
    body: 'A rusted RV sits half-buried in dunes. The air smells like chemicals and regret.',
    choices: [
      {
        id: 'scavenge',
        text: 'Scavenge the lab (+card, slight HP loss)',
        effects: [
          { type: 'hp', value: -8 },
          { type: 'add_card', pool: 'reward' },
          { type: 'log', text: 'You pocket a stained formula card.', cls: 'good' },
        ],
      },
      {
        id: 'leave',
        text: 'Walk away (heal 6)',
        effects: [
          { type: 'hp', value: 6 },
          { type: 'log', text: 'Better not push your luck.', cls: 'sys' },
        ],
      },
      {
        id: 'cook',
        text: 'Cook one last batch (gold or burn)',
        effects: [
          { type: 'branch_rng', p: 0.6, ok: [{ type: 'gold', value: 45 }, { type: 'log', text: 'Blue sky. Pure profit.', cls: 'good' }], fail: [{ type: 'hp', value: -15 }, { type: 'log', text: 'The batch catches fire.', cls: 'dmg' }] },
        ],
      },
    ],
  },
  courtroom_hustle: {
    id: 'courtroom_hustle',
    title: 'Public Defender Roulette',
    body: 'A sweaty public defender waves a crumpled file. "I can make this go away... for a fee."',
    choices: [
      {
        id: 'pay',
        text: 'Pay 30 gold (remove a Strike)',
        requires: { gold: 30 },
        effects: [
          { type: 'gold', value: -30 },
          { type: 'remove_card', defId: 'strike' },
          { type: 'log', text: 'Paperwork buried. One Strike fewer.', cls: 'good' },
        ],
      },
      {
        id: 'bluff',
        text: 'Bluff your way out',
        effects: [
          { type: 'branch_rng', p: 0.5, ok: [{ type: 'gold', value: 20 }, { type: 'log', text: "Slippin' Jimmy would be proud.", cls: 'good' }], fail: [{ type: 'add_card', cardId: 'dread' }, { type: 'log', text: 'Contempt of court. You feel heavier.', cls: 'warn' }] },
        ],
      },
      {
        id: 'walk',
        text: 'Not interested',
        effects: [{ type: 'log', text: 'You keep walking.', cls: 'sys' }],
      },
    ],
  },
  chicken_bros: {
    id: 'chicken_bros',
    title: 'Los Pollos Drive-Thru',
    body: 'A smiling cashier slides a bucket across. Something metallic clinks under the drumsticks.',
    choices: [
      {
        id: 'bucket',
        text: 'Take the bucket (relic chance)',
        effects: [
          { type: 'grant_relic', prefer: 'pollos_bucket' },
          { type: 'log', text: "Finger-lickin' destiny.", cls: 'good' },
        ],
      },
      {
        id: 'tip',
        text: 'Tip 15 gold (heal 18)',
        requires: { gold: 15 },
        effects: [
          { type: 'gold', value: -15 },
          { type: 'hp', value: 18 },
          { type: 'log', text: 'Service with a secret.', cls: 'good' },
        ],
      },
      {
        id: 'question',
        text: 'Ask about the manager',
        effects: [
          { type: 'flag', key: 'gusAware', value: true },
          { type: 'log', text: 'You learn the chickens have eyes.', cls: 'warn' },
          { type: 'gold', value: 10 },
        ],
      },
    ],
  },
  desert_well: {
    id: 'desert_well',
    title: 'The Well',
    body: 'An old well. Rope frayed. Something glints below the waterline.',
    choices: [
      {
        id: 'climb',
        text: 'Climb down',
        effects: [
          { type: 'branch_rng', p: 0.55,
            ok: [{ type: 'grant_relic_random' }, { type: 'hp', value: -5 }, { type: 'log', text: 'You haul up a relic.', cls: 'good' }],
            fail: [{ type: 'hp', value: -20 }, { type: 'log', text: 'The rope snaps. Hard landing.', cls: 'dmg' }],
          },
        ],
      },
      {
        id: 'rest',
        text: 'Rest by the well',
        effects: [{ type: 'hp', value: 12 }, { type: 'log', text: 'Cool shade. Steady breath.', cls: 'good' }],
      },
      {
        id: 'toss',
        text: 'Toss 10 gold in',
        requires: { gold: 10 },
        effects: [
          { type: 'gold', value: -10 },
          { type: 'add_card', pool: 'reward' },
          { type: 'log', text: 'The well answers in paper and ink.', cls: 'sys' },
        ],
      },
    ],
  },
};

export function listEvents() {
  return Object.values(EVENTS);
}

export function getEvent(id) {
  return EVENTS[id] || null;
}
