/** Tiny DOM helpers */
import { t } from '../core/i18n.js';
import { STATUS_EFFECTS } from '../data/statuses.js';
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = t(v);
    else if (k === 'title') node.title = t(v);
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function formatStatuses(statuses = {}) {
  return Object.entries(statuses)
    .map(([k, v]) => `${STATUS_EFFECTS[k]?.icon || '✦'} ${t(STATUS_EFFECTS[k]?.name || k)}:${v}`)
    .join(' · ');
}

export function intentText(intent) {
  if (!intent) return '…';
  const label = t(intent.label || intent.type);
  if (intent.type === 'attack') {
    const hits = intent.hits && intent.hits > 1 ? ` x${intent.hits}` : '';
    return `⚔ ${label} ${intent.value || 0}${hits}`;
  }
  if (intent.type === 'defend') return `🛡 ${label} ${intent.value || 0}`;
  if (intent.type === 'buff') return `⬆ ${label}`;
  if (intent.type === 'debuff') return `⬇ ${label}`;
  return `✦ ${label}`;
}

export function cardDescription(card) {
  let text = card?.description || '';
  const effects = card?.effects || [];
  const damage = effects.find((x) => x.type === 'damage' || x.type === 'damage_random');
  const block = effects.find((x) => x.type === 'block');
  if (damage) text = text.replace('{dmg}', damage.value ?? `${damage.min}-${damage.max}`);
  if (block) text = text.replace('{blk}', block.value ?? 0);
  return t(text);
}
