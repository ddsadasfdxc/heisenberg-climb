/**
 * Art direction layer. Photo assets are bundled locally under public/assets/art
 * (Pexels free-use source images), so the game remains reliable and offline-ready.
 */
const assetUrl = (file) => new URL(`assets/art/${file}`, document.baseURI).href;

export function sceneStyle(kind = 'desert') {
  const url = sceneArt(kind).replace(/"/g, '%22');
  return `--scene-art-abs:url("${url}")`;
}

const PHOTO_PORTRAITS = {
  walter: assetUrl('walter.jpg'),
  saul: assetUrl('saul.jpg'),
  jesse: assetUrl('jesse.jpg'),
  mike: assetUrl('mike.jpg'),
};

const ENEMY_ART = {
  street_dealer: ['SD', '#b84f39', '#17100f'],
  tuco: ['TUCO', '#d04728', '#250c09'],
  hank: ['DEA', '#d3a83c', '#111b25'],
  gus_fring: ['FRING', '#9f2637', '#110b13'],
};

export function portrait(id, name = '') {
  if (PHOTO_PORTRAITS[id]) return PHOTO_PORTRAITS[id];
  const [mark, a, b] = ENEMY_ART[id] || [(name || id || '?').slice(0, 3).toUpperCase(), '#8a7868', '#171514'];
  const safe = mark.replace(/[&<>"']/g, '');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="#050505"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .13 0"/><feBlend in="SourceGraphic" mode="overlay"/></filter></defs><rect width="480" height="600" fill="url(#bg)"/><circle cx="250" cy="218" r="106" fill="#b88768" opacity=".78"/><path d="M86 600c18-174 78-266 171-266 96 0 151 92 170 266" fill="#07090b"/><path d="M166 187c35-83 152-101 190-3-54-31-142-31-190 3Z" fill="#111"/><path d="M0 500 480 372v228Z" fill="${a}" opacity=".22"/><text x="34" y="530" fill="#fff" opacity=".25" font-family="monospace" font-size="18">CASE FILE // 87101</text><text x="34" y="574" fill="white" font-family="Impact, sans-serif" font-size="46" letter-spacing="3">${safe}</text><rect width="480" height="600" fill="transparent" filter="url(#grain)"/></svg>`)}`;
}

const SCENES = {
  desert: assetUrl('desert-road.jpg'),
  operators: assetUrl('neon-motel.jpg'),
  shop: assetUrl('neon-motel.jpg'),
  event: assetUrl('desert-rv.jpg'),
  rest: assetUrl('campfire.jpg'),
  boss: assetUrl('kitchen.jpg'),
  combat: assetUrl('gas-station.jpg'),
  kitchen: assetUrl('kitchen.jpg'),
};

export function sceneArt(kind = 'desert') {
  return SCENES[kind] || SCENES.desert;
}

export function cardSuit(type = 'skill') {
  return { attack: 'KN', skill: 'SC', power: 'PR', status: 'ST', curse: 'XX' }[type] || 'SC';
}
