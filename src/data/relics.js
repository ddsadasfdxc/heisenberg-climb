/** @type {Record<string, any>} */
export const RELICS = {
  pocket_watch: {
    id: 'pocket_watch',
    name: "Mike's Pocket Watch",
    rarity: 'uncommon',
    description: 'Combat start: gain 1 Energy.',
    flavorText: 'Time is precious. Waste it wisely.',
    effect: { trigger: 'combat_start', action: { type: 'gain_energy', value: 1 } },
  },
  heisenberg_hat: {
    id: 'heisenberg_hat',
    name: "Heisenberg's Hat",
    rarity: 'rare',
    description: 'First attack each combat critically strikes.',
    flavorText: 'The hat makes the man.',
    effect: { trigger: 'combat_start', action: { type: 'flag', key: 'firstAttackCrit', value: true } },
  },
  saul_bluetooth: {
    id: 'saul_bluetooth',
    name: "Saul's Bluetooth",
    rarity: 'uncommon',
    description: 'Shop prices -25%.',
    flavorText: 'Still got signal in the desert.',
    effect: { trigger: 'shop_price', action: { type: 'multiplier', value: 0.75 } },
  },
  pink_teddy: {
    id: 'pink_teddy',
    name: 'Pink Teddy Bear',
    rarity: 'legendary',
    description: 'On lethal damage: survive at 1 HP and heal 20 (once per run).',
    flavorText: 'Floating in a pool. Forever.',
    effect: { trigger: 'lethal', action: { type: 'cheat_death', heal: 20 } },
  },
  pollos_bucket: {
    id: 'pollos_bucket',
    name: 'Los Pollos Bucket',
    rarity: 'common',
    description: 'Combat start: heal 3 HP.',
    flavorText: 'Finger lickin\' empire.',
    effect: { trigger: 'combat_start', action: { type: 'heal', value: 3 } },
  },
  box_cutter: {
    id: 'box_cutter',
    name: 'Box Cutter',
    rarity: 'uncommon',
    description: 'Combat start: deal 4 damage to ALL enemies.',
    flavorText: 'No half measures in logistics.',
    effect: { trigger: 'combat_start', action: { type: 'damage', target: 'all_enemies', value: 4 } },
  },
  vacuum_cleaner: {
    id: 'vacuum_cleaner',
    name: "Huell's Vacuum",
    rarity: 'common',
    description: 'Gain 15 gold after each combat victory.',
    flavorText: 'Security is a full-time gig.',
    effect: { trigger: 'combat_victory', action: { type: 'gain_gold', value: 15 } },
  },
  kevlar_vest: {
    id: 'kevlar_vest',
    name: 'Kevlar Vest',
    rarity: 'uncommon',
    description: 'Combat start: gain 6 Block.',
    flavorText: 'Mike packed extras.',
    effect: { trigger: 'combat_start', action: { type: 'block', value: 6 } },
  },
  ricin_cigarette: {
    id: 'ricin_cigarette',
    name: 'The Ricin Cigarette',
    rarity: 'rare',
    description: 'Once: deal 10% max HP to a Boss.',
    flavorText: 'A little something extra.',
    effect: { trigger: 'boss_enter', action: { type: 'percent_hp_damage', value: 0.1, once: true } },
  },
};

export function listRelics() {
  return Object.values(RELICS);
}

/** Shop price by rarity */
export function relicPrice(def) {
  const table = { common: 50, uncommon: 80, rare: 120, legendary: 180 };
  return table[def?.rarity] || 70;
}

/** @param {string[]} owned */
export function availableRelics(owned = []) {
  const have = new Set(owned || []);
  return Object.values(RELICS).filter((r) => !have.has(r.id));
}
