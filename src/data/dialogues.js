/** Lightweight dialogue / MUD line pool. */
export const DIALOGUES = [
  { id: 'walt_start_01', character: 'walter', trigger: 'combat_start', text: 'I am the danger.', weight: 10 },
  { id: 'walt_start_02', character: 'walter', trigger: 'combat_start', text: 'We’re done when I say we’re done.', weight: 8 },
  { id: 'walt_crit', character: 'walter', trigger: 'hp_critical', text: 'I did it for me. I liked it.', weight: 10 },
  { id: 'saul_start_01', character: 'saul', trigger: 'combat_start', text: 'Did you know you have rights? The Constitution says you do!', weight: 10 },
  { id: 'saul_start_02', character: 'saul', trigger: 'combat_start', text: 'It’s all good, man.', weight: 8 },
  { id: 'jesse_start_01', character: 'jesse', trigger: 'combat_start', text: 'Yeah, science!', weight: 10 },
  { id: 'jesse_start_02', character: 'jesse', trigger: 'combat_start', text: 'This is my own private domicile and I will not be harassed… bitch!', weight: 6 },
  { id: 'mike_start_01', character: 'mike', trigger: 'combat_start', text: 'No half measures.', weight: 10 },
  { id: 'mike_start_02', character: 'mike', trigger: 'combat_start', text: 'We had a good thing, you stupid son of a bitch.', weight: 5 },
  { id: 'gus_enter', character: null, trigger: 'boss_encounter', condition: { bossId: 'gus_fring' }, text: 'A man provides. And he does it even when he is not appreciated.', weight: 10 },
  { id: 'win_generic', character: null, trigger: 'victory', text: 'The desert keeps its secrets. You walk away richer.', weight: 5 },
  { id: 'death_generic', character: null, trigger: 'death', text: 'The climb ends here. Reputation remains.', weight: 5 },
];

/**
 * @param {string} trigger
 * @param {{character?: string, bossId?: string}} [ctx]
 */
export function pickDialogue(trigger, ctx = {}) {
  const pool = DIALOGUES.filter((d) => {
    if (d.trigger !== trigger) return false;
    if (d.character && ctx.character && d.character !== ctx.character) return false;
    if (d.condition?.bossId && d.condition.bossId !== ctx.bossId) return false;
    return true;
  });
  if (!pool.length) return null;
  const total = pool.reduce((s, d) => s + (d.weight || 1), 0);
  let r = Math.random() * total;
  for (const d of pool) {
    r -= d.weight || 1;
    if (r <= 0) return d.text;
  }
  return pool[pool.length - 1].text;
}
