const ICONS = {
  strike: ['knife', '#ad312b'], defend: ['shield', '#315f7e'], bash: ['fist', '#9b3f25'],
  blue_sky: ['crystal', '#2ca8b4'], say_my_name: ['hat', '#b88d31'], crystal_cook: ['flask', '#26a88f'],
  legal_loophole: ['scales', '#b49a58'], slippin_jimmy: ['coin', '#cc9937'], objection: ['gavel', '#934c33'],
  yo_bitch: ['bolt', '#d05d37'], science_bitch: ['flask', '#64b9c4'], half_measure: ['scope', '#495f75'],
  setup_shot: ['scope', '#617aa3'], clean_hit: ['bullet', '#737b80'], dread: ['skull', '#6e456e'], neutralizer: ['shield', '#47756e'],
  pocket_watch: ['watch', '#c89c51'], heisenberg_hat: ['hat', '#9fba64'], saul_bluetooth: ['phone', '#c9a44f'],
  pink_teddy: ['bear', '#c36c7e'], pollos_bucket: ['bucket', '#d28f45'], box_cutter: ['knife', '#a74235'],
  vacuum_cleaner: ['vacuum', '#7ca2a6'], kevlar_vest: ['shield', '#657f91'], ricin_cigarette: ['cigarette', '#8bad68'],
};

function shape(kind, accent) {
  const common = `fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"`;
  const map = {
    knife: `<path ${common} d="M34 140 145 29l18 18L52 158l-31 8Z"/><path ${common} d="m106 66 34 34M31 139l24 24"/>`,
    shield: `<path ${common} d="M96 20 156 43v48c0 43-25 70-60 89-35-19-60-46-60-89V43Z"/><path ${common} d="m65 98 22 22 42-51"/>`,
    fist: `<path ${common} d="M51 92V57c0-14 23-15 23 0v24-39c0-15 24-15 24 0v39-31c0-15 24-15 24 0v35-23c0-15 24-14 24 1v54c0 39-25 64-59 64-28 0-48-16-65-45-8-13 11-28 22-15l17 19"/>`,
    crystal: `<path ${common} d="m96 18 54 43-20 91-34 31-34-31-20-91Z"/><path ${common} d="M42 61h108M96 18v165M62 152l34-91 34 91"/>`,
    flask: `<path ${common} d="M72 21h48M82 21v53l-48 78c-8 14 0 27 17 27h90c17 0 25-13 17-27l-48-78V21"/><path ${common} d="M55 133h82M71 112h50"/>`,
    hat: `<path ${common} d="M53 117 68 48h56l15 69M29 118c42 15 91 15 134 0l8 24c-49 21-101 21-150 0Z"/>`,
    scales: `<path ${common} d="M96 23v150M51 46h90M29 73h45l-23 50c-13 0-26-9-31-20Zm89 0h45l-23 50c-13 0-26-9-31-20ZM56 174h80"/>`,
    coin: `<circle ${common} cx="96" cy="100" r="70"/><path ${common} d="M111 67c-9-9-38-10-38 10 0 26 48 12 48 39 0 23-32 22-47 10M96 49v101"/>`,
    gavel: `<path ${common} d="m39 54 43-31 42 57-43 31ZM100 93l62 83M24 174h90"/>`,
    bolt: `<path ${common} d="m112 15-61 94h45l-16 76 65-101H99Z"/>`,
    scope: `<circle ${common} cx="96" cy="100" r="58"/><path ${common} d="M96 18v46m0 72v46M14 100h46m72 0h46"/><circle cx="96" cy="100" r="9" fill="${accent}"/>`,
    bullet: `<path ${common} d="M57 169V74c0-30 17-53 39-53s39 23 39 53v95ZM57 132h78"/>`,
    skull: `<path ${common} d="M43 91c0-45 24-69 53-69s53 24 53 69c0 25-9 38-23 47v38H66v-38c-14-9-23-22-23-47Z"/><circle cx="73" cy="93" r="12" fill="${accent}"/><circle cx="119" cy="93" r="12" fill="${accent}"/><path ${common} d="M83 137h26"/>`,
    watch: `<circle ${common} cx="96" cy="100" r="58"/><path ${common} d="M71 39 78 15h36l7 24M71 161l7 24h36l7-24M96 61v42l29 18"/>`,
    phone: `<path ${common} d="M58 25h76v150H58Z"/><path ${common} d="M76 48h40M82 151h28M79 84c14-13 27-13 41 0M86 99c7-7 14-7 21 0"/>`,
    bear: `<circle ${common} cx="96" cy="93" r="52"/><circle ${common} cx="48" cy="50" r="22"/><circle ${common} cx="144" cy="50" r="22"/><circle cx="76" cy="85" r="7" fill="${accent}"/><circle cx="116" cy="85" r="7" fill="${accent}"/><path ${common} d="M79 119c11 9 23 9 34 0M55 139l-20 39m102-39 20 39"/>`,
    bucket: `<path ${common} d="M45 60h102l-15 115H60Z"/><path ${common} d="M59 60c8-48 66-48 74 0M68 93h56m-61 34h66"/>`,
    vacuum: `<path ${common} d="M67 36h59v96H67Z"/><circle ${common} cx="77" cy="151" r="20"/><circle ${common} cx="124" cy="151" r="20"/><path ${common} d="M126 59h21c17 0 24 13 24 29v70M39 27h30v17H39Z"/>`,
    cigarette: `<path ${common} d="M25 112h114v28H25Zm114 0h27v28h-27"/><path ${common} d="M151 91c-14-13 13-18 0-34s14-20 1-36"/>`,
  };
  return map[kind] || map.crystal;
}

export function cardArt(id, type = 'skill') {
  const [kind, accent] = ICONS[id] || [type === 'attack' ? 'knife' : 'crystal', type === 'attack' ? '#ad312b' : '#3f7789'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 200"><defs><radialGradient id="r"><stop stop-color="${accent}" stop-opacity=".3"/><stop offset="1" stop-color="#090b0d" stop-opacity="0"/></radialGradient><filter id="g"><feTurbulence baseFrequency=".6" numOctaves="2"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .08 0"/></filter></defs><rect width="192" height="200" fill="url(#r)"/>${shape(kind, accent)}<rect width="192" height="200" filter="url(#g)" opacity=".2"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
