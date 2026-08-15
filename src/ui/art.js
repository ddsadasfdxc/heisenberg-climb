const PORTRAITS = {
  walter: ['WW', '#2e9f8f', '#102d2b'], saul: ['SG', '#e3b83f', '#4a3011'],
  jesse: ['JP', '#ef7950', '#3b1d19'], mike: ['ME', '#6d91e8', '#182542'],
  street_dealer: ['SD', '#bf4b4b', '#351719'], tuco: ['TU', '#d85d3b', '#481b12'],
  hank: ['DEA', '#c8a94a', '#273747'], gus_fring: ['GF', '#9a66c7', '#251733'],
};

export function portrait(id, name = '') {
  const [mark, a, b] = PORTRAITS[id] || [(name || id || '?').slice(0, 2).toUpperCase(), '#607d8b', '#17232b'];
  const safe = mark.replace(/[&<>"']/g, '');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><filter id="n"><feTurbulence baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="x"/><feBlend in="SourceGraphic" in2="x" mode="soft-light"/></filter></defs><rect width="160" height="160" rx="22" fill="url(#g)"/><circle cx="80" cy="58" r="31" fill="#e5c09b" opacity=".82"/><path d="M30 153c5-43 25-62 50-62s45 19 50 62" fill="#10151b" opacity=".85"/><path d="M25 23h110M16 136h128" stroke="#fff" opacity=".12" stroke-width="3"/><text x="80" y="145" text-anchor="middle" fill="white" font-family="monospace" font-weight="900" font-size="25">${safe}</text><rect width="160" height="160" rx="22" fill="none" stroke="#fff" opacity=".25" stroke-width="4" filter="url(#n)"/></svg>`)}`;
}

export function sceneArt(kind = 'desert') {
  const palettes = { desert: ['#d39b50','#401d18'], shop: ['#e4bd47','#311c36'], event: ['#45a69c','#151b32'], rest: ['#d16f4c','#18243b'], boss: ['#8f3145','#160f21'] };
  const [a,b] = palettes[kind] || palettes.desert;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360"><defs><linearGradient id="s" y2="1"><stop stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="800" height="360" fill="url(#s)"/><circle cx="650" cy="82" r="53" fill="#ffe3a1" opacity=".8"/><path d="M0 250Q120 180 260 245T520 225T800 230V360H0Z" fill="#1a1114" opacity=".72"/><path d="M115 235v-100h22v38h27v18h-27v44M520 235v-130h33l22 130" fill="#161319" opacity=".9"/><path d="M0 287h800" stroke="#ffe8b1" opacity=".2" stroke-width="4"/><text x="35" y="55" fill="white" opacity=".12" font-family="monospace" font-size="35" font-weight="bold">ALBUQUERQUE // 87101</text></svg>`)}`;
}