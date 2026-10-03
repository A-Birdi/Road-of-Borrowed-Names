/* Chapter 3 maps: the hill road, Cinder Orchard (day / dusk / festival night),
 * its interiors, the terraces, and the dungeon: upper terraces → old
 * workshop row (+ ice house) → the great kiln → the kiln's heart. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  // ======================================================================================
  // The hill road (links Saltglass ← → Snowbell)
  // ======================================================================================
  C.maps['co.road'] = {
    name: T('The Orchard Road', '{灰実|はいみ} へ の {坂道|さかみち}'), region: 'cinder', music: 'road',
    ambient: { weather: 'leaves' },
    terrain: K.build(36, 20, '.', (k) => {
      k.ragged('top', 'T', 3, 301).ragged('bottom', 'T', 3, 302);
      k.rect(2, 3, 32, 6, ';');
      k.scatter('.', 40, 303, [2, 3, 32, 6], ';');
      k.scatter('r', 6, 304, [2, 3, 32, 6], ';.');
      k.path([[0, 11], [35, 11]], ':', 2);
      k.rect(23, 0, 2, 11, ':');
      k.hline(3, 33, 13, 'f');
      k.set(18, 13, '.');
      k.rect(3, 14, 31, 3, 'F');
      for (let x = 4; x < 34; x += 3) k.set(x, 14, 'O').set(x + 1, 16, 'O');
      k.scatter(',', 10, 305, [0, 9, 36, 4], '.');
    }),
    props: [
      { p: 'lantern', x: 6, y: 10 }, { p: 'lantern', x: 16, y: 10 }, { p: 'lantern', x: 29, y: 10 },
      { p: 'sign', x: 32, y: 10, text: { jp: 'この {先|さき} 、 {灰実|はいみ}の{里|さと} 。 {秋祭|あきまつ}り は {十五日|じゅうごにち} 。', en: '"Cinder Orchard ahead. Autumn festival on the fifteenth." The date has been painted over twice.' } },
      { p: 'stone_marker', x: 22, y: 9, scene: 'co.road_marker' },
      { p: 'co_scrub', x: 23, y: 4, if: '!ch3_done', scene: 'co.road_north' }, { p: 'co_scrub', x: 24, y: 4, if: '!ch3_done', scene: 'co.road_north' },
      { p: 'co_scrub', x: 23, y: 5, if: '!ch3_done', scene: 'co.road_north' }, { p: 'co_scrub', x: 24, y: 5, if: '!ch3_done', scene: 'co.road_north' },
      { p: 'co_sheaf', x: 22, y: 5, if: 'ch3_done' }, { p: 'co_sheaf', x: 25, y: 4, if: 'ch3_done' },
      { p: 'bench', x: 11, y: 9, text: { jp: '{誰|だれ} か が {柿|かき} の {種|たね} を {並|なら}べて いった 。', en: 'Someone has left a neat row of persimmon seeds on the bench, drying.' } },
    ],
    exits: [
      { x: 0, y: 11, w: 1, h: 2, to: 'sg.road', sp: 'from_next', dir: 'left' },
      { x: 35, y: 11, w: 1, h: 2, to: 'co.village', tx: 1, ty: 18, dir: 'right' },
      { x: 23, y: 0, w: 2, h: 1, to: 'sb.road', sp: 'from_prev', dir: 'up', if: 'ch3_done' },
    ],
    triggers: [{ x: 23, y: 7, w: 2, h: 1, scene: 'co.road_north', if: '!ch3_done', once: true, id: 'north' }],
    onEnter: [{ scene: 'co.arrive', if: '!co_arrived' }],
    spawn: { default: [3, 11, 'right'], from_prev: [1, 11, 'right'], from_next: [23, 1, 'down'] },
  };

  // ======================================================================================
  // Cinder Orchard — shared layout (day hub, dusk assembly, festival night)
  // ======================================================================================
  function villageTerrain() {
    return K.build(52, 40, '.', (k) => {
      // edges
      k.ragged('left', 'T', 2, 311).ragged('right', 'T', 2, 312).ragged('bottom', 'T', 2, 313);
      // northern terraces (lower orchard), west of the channel
      k.rect(0, 0, 34, 9, 'F');
      k.hline(0, 33, 3, '^').hline(0, 33, 7, '^');
      for (let x = 1; x < 33; x += 3) { k.set(x, 1, 'O'); k.set(x + 1, 5, 'O'); }
      k.rect(24, 0, 2, 13, ':');
      // the old firebreak strip, overgrown
      k.rect(0, 9, 34, 2, ';');
      k.rect(24, 9, 2, 2, ':');
      // north-east garden around the Chronicle Hall
      k.rect(36, 0, 16, 11, '.');
      k.scatter('O', 6, 314, [44, 0, 7, 3], '.');
      // channel
      k.rect(34, 0, 2, 40, '~');
      // roads and paths
      k.path([[0, 18], [14, 18]], ':', 2);
      k.rect(14, 12, 18, 13, '=');
      k.path([[31, 18], [51, 18]], ':', 2);
      k.rect(34, 18, 2, 2, 'b');
      k.rect(37, 8, 2, 30, ':');
      k.path([[39, 8], [43, 8]], ':', 1);
      k.path([[42, 17], [42, 17]], ':', 1);
      k.path([[39, 25], [44, 25]], ':', 1);
      k.path([[7, 15], [7, 17]], ':', 1);
      k.path([[6, 25], [11, 25], [11, 20]], ':', 1);
      k.path([[22, 25], [22, 33], [31, 33]], ':', 2);
      k.rect(34, 33, 2, 2, 'b');
      k.path([[36, 33], [37, 33]], ':', 2);
      k.path([[14, 33], [22, 33]], ':', 1);
      // stage
      k.rect(19, 12, 10, 2, '_');
      // southern fields and orchard
      k.rect(3, 34, 10, 4, 'F');
      k.rect(40, 29, 10, 3, 'F');
      for (let x = 40; x < 50; x += 3) k.set(x, 33, 'O');
      k.scatter(',', 24, 315, [2, 26, 30, 12], '.');
      k.scatter('O', 5, 316, [2, 27, 12, 6], '.');
      k.scatter('"', 6, 317, [32, 27, 2, 6], '.');
      k.scatter('"', 5, 318, [36, 26, 1, 12], '.:');
    });
  }
  const villageStructs = [
    { type: 'house', x: 39, y: 3, w: 9, h: 5, roof: 'tile', wall: 'stone', door: 4, windows: [1, 7], to: 'co.hall', spawn: [6, 8], lit: true },
    { type: 'house', x: 3, y: 11, w: 8, h: 5, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 6], chimney: true, to: 'co.inn', spawn: [6, 8], sign: true, signX: 2 },
    { type: 'house', x: 39, y: 13, w: 8, h: 5, roof: 'ash', wall: 'stone', door: 3, windows: [1, 6], chimney: true, to: 'co.glass', spawn: [6, 8] },
    { type: 'house', x: 40, y: 21, w: 7, h: 4, roof: 'tile', wall: 'wood', door: 4, windows: [1], chimney: true, to: 'co.pottery', spawn: [5, 7] },
    { type: 'house', x: 3, y: 21, w: 6, h: 4, roof: 'thatch', door: 3, windows: [1, 5], to: 'co.post', spawn: [4, 6], sign: true, signX: 0 },
    { type: 'house', x: 15, y: 28, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4] },
    { type: 'house', x: 24, y: 27, w: 6, h: 4, roof: 'tile', door: 2, windows: [0, 4], chimney: true },
    { type: 'house', x: 44, y: 34, w: 5, h: 3, roof: 'thatch', door: 2, windows: [0, 4] },
  ];
  const villageDoorText = [
    { p: 'door', x: 17, y: 30, text: { jp: '{戸|と} に {紙|かみ} が {貼|は}って ある 。 「 {柿|かき} を {干|ほ}して います 。 {開|あ}けないで 」', en: 'A note on the door: "Persimmons drying. Do not open."' } },
    { p: 'door', x: 26, y: 30, text: { jp: '{中|なか} から 、 {誰|だれ} か が {鼻歌|はなうた} で {祭|まつ}り の {歌|うた} を {練習|れんしゅう} して いる 。', en: 'Someone inside is humming the festival song, getting the same bar wrong each time.' } },
    { p: 'door', x: 46, y: 36, text: { jp: '{留守|るす} の よう だ 。 {軒下|のきした} に {長靴|ながぐつ} が {三足|さんぞく} {並|なら}んで いる 。', en: 'Nobody home. Three pairs of boots stand under the eaves, in order of size.' } },
  ];
  const villageProps = [
    { p: 'co_lookout', x: 11, y: 11, scene: 'co.lookout_base', o: {}, if: '!co_bell_done&!co_restored' },
    { p: 'co_lookout', x: 11, y: 11, scene: 'co.lookout_base', o: { rope: true }, if: 'co_bell_done|co_restored' },
    { p: 'co_buckets', x: 38, y: 6, scene: 'co.buckets' }, { p: 'co_buckets', x: 48, y: 6, scene: 'co.buckets' },
    { p: 'noticeboard', x: 15, y: 24, scene: 'co.board' },
    { p: 'co_stage', x: 19, y: 13 }, { p: 'co_stage', x: 22, y: 13 }, { p: 'co_stage', x: 25, y: 13 },
    { p: 'co_bunting', x: 15, y: 13 }, { p: 'co_bunting', x: 29, y: 13 }, { p: 'co_bunting', x: 20, y: 24 },
    { p: 'co_glasslantern', x: 18, y: 12, o: { lit: false } }, { p: 'co_glasslantern', x: 29, y: 12, o: { lit: false } },
    { p: 'bench', x: 17, y: 17 }, { p: 'bench', x: 20, y: 17 }, { p: 'bench', x: 17, y: 20 }, { p: 'bench', x: 20, y: 20 },
    { p: 'table', x: 25, y: 17, scene: 'co.glass_table' }, { p: 'chair', x: 24, y: 17 }, { p: 'chair', x: 27, y: 17 },
    { p: 'co_seat', x: 26, y: 18, scene: 'co.seat', if: '!co_hiro_seat_named' },
    { p: 'co_seat', x: 26, y: 18, scene: 'co.seat', o: { named: true }, if: 'co_hiro_seat_named' },
    { p: 'smalltable', x: 29, y: 21, scene: 'co.sayo_table' },
    { p: 'well', x: 15, y: 15 },
    { p: 'lantern', x: 13, y: 17 }, { p: 'lantern', x: 32, y: 17 }, { p: 'lantern', x: 36, y: 20 },
    { p: 'kiln', x: 47, y: 21, o: {} , text: { jp: 'ノブ の {小|ちい}さな {窯|かま} 。 まだ {少|すこ}し {温|あたた}かい 。', en: 'Nobu\'s small pottery kiln. Still faintly warm from yesterday.' } },
    { p: 'crate', x: 33, y: 24, scene: 'co.tamotsu_shed' }, { p: 'barrel', x: 32, y: 25 },
    { p: 'co_hoshigaki', x: 4, y: 16 }, { p: 'co_hoshigaki', x: 27, y: 31 },
    { p: 'flowerpot', x: 12, y: 16 }, { p: 'flowerpot', x: 36, y: 12 },
    { p: 'cart', x: 12, y: 27 }, { p: 'hay', x: 19, y: 9 }, { p: 'stump', x: 29, y: 10 },
    { p: 'mailbox', x: 9, y: 24, text: { jp: '「 {郵便|ゆうびん} ・ {灰実|はいみ} 」 。 {入|い}れ{口|ぐち} に {祭|まつ}り の {招待状|しょうたいじょう} が {一枚|いちまい} {挟|はさ}まって いる 。', en: '"Post — Haimi." A festival invitation is stuck half-in the slot.' } },
    { p: 'stone_marker', x: 36, y: 16, scene: 'co.channel_marker' },
    { p: 'co_scrub', x: 3, y: 9, if: '!co_firebreak_cut' }, { p: 'co_scrub', x: 9, y: 10, if: '!co_firebreak_cut' }, { p: 'co_scrub', x: 14, y: 9, if: '!co_firebreak_cut' },
    { p: 'co_scrub', x: 30, y: 9, if: '!co_firebreak_cut' }, { p: 'co_scrub', x: 32, y: 10, if: '!co_firebreak_cut' },
    { p: 'co_sheaf', x: 3, y: 9, if: 'co_firebreak_cut' }, { p: 'co_sheaf', x: 14, y: 9, if: 'co_firebreak_cut' }, { p: 'co_sheaf', x: 31, y: 10, if: 'co_firebreak_cut' },
  ].concat(villageDoorText);

  C.maps['co.village'] = {
    name: T('Cinder Orchard', '{灰実|はいみ}の{里|さと}'), region: 'cinder', place: 'cinder', travel: 'cinder',
    music: 'cinder',
    ambient: { weather: 'leaves' },
    terrain: villageTerrain(),
    structs: villageStructs,
    props: villageProps,
    npcs: [
      { id: 'co_sayo', x: 22, y: 15, dir: 'down', wander: 2, if: '!ch3_done', talk: [{ scene: 'co.sayo' }] },
      { id: 'co_sayo', x: 28, y: 22, dir: 'down', wander: 1, if: 'ch3_done', talk: [{ if: 'post', scene: 'co.sayo_post' }, { scene: 'co.sayo_after' }] },
      { id: 'co_kotaro', x: 27, y: 20, dir: 'left', wander: 3, if: '!ch3_done', talk: [{ scene: 'co.kotaro' }] },
      { id: 'co_kotaro', x: 13, y: 15, dir: 'up', wander: 1, if: 'ch3_done', talk: [{ if: 'post', scene: 'co.kotaro_post' }, { scene: 'co.kotaro_after' }] },
      { id: 'co_goro', x: 12, y: 13, dir: 'down', talk: [{ if: 'post', scene: 'co.goro_post' }, { if: 'ch3_done', scene: 'co.goro_after' }, { scene: 'co.goro' }] },
      { id: 'co_tamotsu', x: 33, y: 22, dir: 'right', wander: 1, talk: [{ if: 'post', scene: 'co.tamotsu_post' }, { if: 'ch3_done', scene: 'co.tamotsu_after' }, { scene: 'co.tamotsu' }] },
      { id: 'co_heita', x: 20, y: 10, dir: 'down', if: '!co_firebreak_cut', talk: [{ scene: 'co.heita' }] },
      { id: 'co_heita', x: 16, y: 9, dir: 'left', wander: 2, if: 'co_firebreak_cut', talk: [{ if: 'post', scene: 'co.heita_post' }, { scene: 'co.heita_after' }] },
      { id: 'hiro', x: 25, y: 19, dir: 'up', if: 'ch3_done', talk: [{ if: 'post', scene: 'co.hiro_post' }, { scene: 'co.hiro_after' }] },
      { id: 'suzu', x: 27, y: 14, dir: 'down', wander: 1, if: 'comp!=suzu&co_chronicle_read&!co_kiln_done', talk: [{ scene: 'co.suzu_c_square' }] },
      { id: 'suzu', x: 21, y: 14, dir: 'down', wander: 2, if: 'comp!=suzu&ch3_done', talk: [{ if: 'post', scene: 'co.suzu_c_post' }, { scene: 'co.suzu_c_after' }] },
    ],
    exits: [
      { x: 0, y: 18, w: 1, h: 2, to: 'co.road', tx: 34, ty: 11, dir: 'left' },
      { x: 24, y: 0, w: 2, h: 1, to: 'co.terraces', tx: 21, ty: 32, dir: 'up' },
    ],
    triggers: [
      { x: 24, y: 12, w: 2, h: 1, scene: 'co.suspect', if: 'var.co_clues>=3&!co_suspect' },
      { x: 37, y: 18, w: 2, h: 2, scene: 'co.suspect', if: 'var.co_clues>=3&!co_suspect' },
      { x: 13, y: 18, w: 1, h: 2, scene: 'co.suspect', if: 'var.co_clues>=3&!co_suspect' },
    ],
    onEnter: [
      { scene: 'co.village_first', if: '!co_met_sayo' },
      { scene: 'co.suspect', if: 'var.co_clues>=3&!co_suspect' },
      { scene: 'co.kiln_return', if: 'co_kiln_done&!co_kiln_return' },
    ],
    spawn: { default: [2, 18, 'right'] },
  };

  // Dusk: the village gathers in the square (the assembly runs as one scene).
  C.maps['co.eve'] = {
    name: T('Cinder Orchard at dusk', '{夕暮|ゆうぐ}れ の {灰実|はいみ}'), region: 'cinder', music: 'sorrow', noTravel: true,
    noTravelWhy: { en: 'The village is gathered in the square for the evening. Travel works again once it\'s over.' },
    ambient: { weather: 'leaves', tint: 'rgba(200,90,40,0.16)', dark: 0.25, darkCol: '60,20,10', playerLight: 40 },
    terrain: villageTerrain(), structs: villageStructs.map((s) => Object.assign({}, s, { to: undefined, lit: true })),
    props: villageProps.filter((p) => p.p !== 'co_seat' && p.p !== 'co_glasslantern').concat([
      { p: 'co_seat', x: 26, y: 18 }, { p: 'lantern', x: 22, y: 12 }, { p: 'lantern', x: 26, y: 12 },
    ]),
    npcs: [
      { id: 'co_tokiwa', x: 23, y: 13, dir: 'down' },
      { id: 'co_ume', x: 18, y: 16, dir: 'up' }, { id: 'co_goro', x: 16, y: 18, dir: 'up' },
      { id: 'co_sayo', x: 21, y: 16, dir: 'up' }, { id: 'co_kotaro', x: 20, y: 19, dir: 'up' },
      { id: 'co_isao', x: 28, y: 16, dir: 'up' }, { id: 'hiro', x: 27, y: 16, dir: 'up' },
      { id: 'co_nobu', x: 29, y: 19, dir: 'up' }, { id: 'co_fusa', x: 18, y: 19, dir: 'up' },
      { id: 'co_shino', x: 16, y: 16, dir: 'up' }, { id: 'co_tamotsu', x: 30, y: 16, dir: 'up' },
      { id: 'co_asa', x: 29, y: 18, dir: 'up' }, { id: 'co_heita', x: 22, y: 19, dir: 'up' },
      { id: 'suzu', x: 25, y: 20, dir: 'up', if: 'comp!=suzu' },
    ],
    exits: [], spawn: { default: [23, 17, 'up'] },
  };

  // Festival night.
  C.maps['co.festival'] = {
    name: T('The Autumn Festival', '{秋祭|あきまつ}り'), region: 'cinder', music: 'cinder', noTravel: true,
    noTravelWhy: { en: 'Tonight is the festival — the road can wait until tomorrow. When you\'re ready, climb the fire lookout at the corner of the square.' },
    ambient: { weather: 'fireflies', dark: 0.55, darkCol: '20,10,30', playerLight: 46 },
    terrain: villageTerrain(), structs: villageStructs.map((s) => Object.assign({}, s, { to: undefined, lit: true })),
    props: villageProps.filter((p) => p.p !== 'co_seat' && p.p !== 'co_glasslantern' && p.p !== 'co_lookout').concat([
      { p: 'co_lookout', x: 11, y: 11, o: { rope: true }, scene: 'co.fest_lookout' },
      { p: 'co_seat', x: 26, y: 18, o: { named: true }, scene: 'co.fest_seat' },
      { p: 'co_glasslantern', x: 18, y: 12 }, { p: 'co_glasslantern', x: 29, y: 12 }, { p: 'co_glasslantern', x: 14, y: 12 },
      { p: 'co_glasslantern', x: 31, y: 24 }, { p: 'co_glasslantern', x: 14, y: 24 }, { p: 'co_glasslantern', x: 22, y: 24 },
      { p: 'co_glasslantern', x: 36, y: 17 }, { p: 'co_glasslantern', x: 10, y: 19 }, { p: 'co_glasslantern', x: 24, y: 11 },
      { p: 'lantern', x: 22, y: 12 }, { p: 'lantern', x: 26, y: 12 },
    ]),
    npcs: [
      { id: 'co_tokiwa', x: 16, y: 21, dir: 'right', talk: 'co.fest_tokiwa' },
      { id: 'co_ume', x: 18, y: 16, dir: 'down', talk: 'co.fest_ume' },
      { id: 'co_goro', x: 12, y: 13, dir: 'down', talk: 'co.fest_goro' },
      { id: 'co_sayo', x: 21, y: 15, dir: 'down', wander: 2, talk: 'co.fest_sayo' },
      { id: 'co_kotaro', x: 20, y: 22, dir: 'up', wander: 2, talk: 'co.fest_kotaro' },
      { id: 'co_isao', x: 28, y: 16, dir: 'left', talk: 'co.fest_isao' },
      { id: 'hiro', x: 25, y: 19, dir: 'up', talk: 'co.fest_hiro' },
      { id: 'co_nobu', x: 30, y: 20, dir: 'left', talk: 'co.fest_nobu' },
      { id: 'co_fusa', x: 16, y: 18, dir: 'down', talk: 'co.fest_fusa' },
      { id: 'co_shino', x: 27, y: 23, dir: 'up', talk: 'co.fest_shino' },
      { id: 'co_tamotsu', x: 33, y: 20, dir: 'left', talk: 'co.fest_tamotsu' },
      { id: 'co_asa', x: 29, y: 14, dir: 'down', talk: 'co.fest_asa' },
      { id: 'co_heita', x: 23, y: 23, dir: 'up', talk: 'co.fest_heita' },
      { id: 'suzu', x: 24, y: 13, dir: 'down', if: 'comp!=suzu', talk: 'co.fest_suzu_c' },
    ],
    exits: [],
    triggers: [
      { x: 0, y: 18, w: 1, h: 2, scene: 'co.fest_stay' }, { x: 24, y: 0, w: 2, h: 1, scene: 'co.fest_stay' },
    ],
    spawn: { default: [23, 17, 'down'] },
  };

  // ======================================================================================
  // Interiors
  // ======================================================================================
  function interior(id, name, w, h, doorX, backXY, extra) {
    C.maps[id] = Object.assign({
      name, region: 'cinder', music: null, noTravel: true, travelKind: 'interior',
      terrain: K.room(w, h, '_', doorX),
      props: [{ p: 'exitmat', x: doorX, y: h - 2 }],
      npcs: [],
      exits: [{ x: doorX, y: h - 1, to: 'co.village', tx: backXY[0], ty: backXY[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }

  interior('co.hall', T('Chronicle Hall', '{記録堂|きろくどう}'), 13, 10, 6, [43, 8], {
    terrain: K.build(13, 10, '#', (k) => { k.rect(1, 2, 11, 7, '+'); k.rect(4, 4, 5, 3, 'k'); k.set(6, 9, '+'); }),
    ambient: { dark: 0.2, playerLight: 50 },
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'desk', x: 5, y: 3, scene: 'co.chronicle' },
      { p: 'shelf', x: 1, y: 2, scene: 'co.hall_shelf' }, { p: 'shelf', x: 2, y: 2, scene: 'co.hall_shelf' },
      { p: 'shelf', x: 10, y: 2, scene: 'co.hall_register' }, { p: 'shelf', x: 11, y: 2, scene: 'co.hall_register' },
      { p: 'bookpile', x: 1, y: 7 }, { p: 'bookpile', x: 11, y: 7 },
      { p: 'lantern', x: 3, y: 3 }, { p: 'lantern', x: 9, y: 3 },
      { p: 'smalltable', x: 9, y: 6, scene: 'co.hall_reading' },
      { p: 'flowerpot', x: 1, y: 5 },
    ],
    npcs: [
      { id: 'co_tokiwa', x: 7, y: 5, dir: 'down', talk: [{ if: 'post', scene: 'co.tokiwa_post' }, { if: 'ch3_done', scene: 'co.tokiwa_after' }, { scene: 'co.tokiwa' }] },
    ],
  });

  interior('co.inn', T("Fusa's Inn", 'フサ の {宿|やど}'), 13, 10, 6, [7, 16], {
    terrain: K.build(13, 10, '#', (k) => { k.rect(1, 2, 11, 7, '_'); k.rect(8, 2, 4, 3, 'm'); k.set(6, 9, '_'); }),
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'counter', x: 1, y: 4, across: true }, { p: 'stove', x: 1, y: 2 }, { p: 'shelf', x: 3, y: 2 },
      { p: 'co_hoshigaki', x: 4, y: 3 },
      { p: 'bed', x: 9, y: 2, scene: 'co.inn_bed' }, { p: 'bed', x: 11, y: 2, scene: 'co.inn_bed' },
      { p: 'table', x: 4, y: 6 }, { p: 'chair', x: 3, y: 6 }, { p: 'chair', x: 6, y: 6 },
      { p: 'teaset', x: 9, y: 6, scene: 'co.inn_tea' }, { p: 'chair', x: 10, y: 6 },
      { p: 'flowerpot', x: 11, y: 7 },
    ],
    npcs: [
      { id: 'co_fusa', x: 2, y: 3, dir: 'down', talk: [{ if: 'post', scene: 'co.fusa_post' }, { if: 'ch3_done', scene: 'co.fusa_after' }, { scene: 'co.fusa' }] },
      { id: 'suzu', x: 10, y: 5, dir: 'left', if: 'comp!=suzu&co_chronicle_read&!co_suzu_c_inn', talk: 'co.suzu_c_inn' },
      { id: 'suzu', x: 10, y: 5, dir: 'left', if: 'comp!=suzu&co_suzu_c_inn&!co_kiln_done', talk: 'co.suzu_c_wait' },
    ],
    onEnter: [{ scene: 'co.suzu_night', if: 'comp=suzu&co_chronicle_read' }],
  });

  interior('co.glass', T('Glass Workshop', 'ガラス {工房|こうぼう}'), 13, 10, 6, [42, 18], {
    terrain: K.build(13, 10, '#', (k) => { k.rect(1, 2, 11, 7, '_'); k.rect(1, 2, 4, 3, '+'); k.set(6, 9, '_'); }),
    ambient: { dark: 0.15, playerLight: 50 },
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'co_furnace', x: 2, y: 2, scene: 'co.furnace' },
      { p: 'co_beam', x: 8, y: 2, scene: 'co.beam' },
      { p: 'shelf', x: 11, y: 2, scene: 'co.glass_ledger' },
      { p: 'glassware', x: 10, y: 2 }, { p: 'glassware', x: 1, y: 6 },
      { p: 'table', x: 5, y: 5, text: { jp: '{作|つく}りかけ の {火屋|ほや} が {並|なら}んで いる 。 {祭|まつ}り の {灯籠|とうろう} に {使|つか}う 、 {丸|まる}い ガラス だ 。', en: 'Half-finished lantern globes in a row: round glass shades for the festival lanterns.' } },
      { p: 'barrel', x: 11, y: 7 }, { p: 'anvil', x: 9, y: 6 },
    ],
    npcs: [
      { id: 'hiro', x: 4, y: 5, dir: 'left', if: '!ch3_done', talk: [{ scene: 'co.hiro' }] },
      { id: 'co_isao', x: 9, y: 4, dir: 'down', talk: [{ if: 'post', scene: 'co.isao_post' }, { if: 'ch3_done', scene: 'co.isao_after' }, { scene: 'co.isao' }] },
      { id: 'suzu', x: 6, y: 6, dir: 'left', if: 'comp!=suzu&co_kiln_done&!co_suzu_done', talk: 'co.suzu_truth' },
    ],
  });

  interior('co.pottery', T("Nobu's Pottery", 'ノブ の {焼|や}き{物|もの}{屋|や}'), 11, 9, 5, [44, 25], {
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'co_wheel', x: 3, y: 4, text: { jp: 'ろくろ 。 {粘土|ねんど} が まだ {湿|しめ}って いる 。', en: 'The potter\'s wheel. The clay on it is still damp.' } },
      { p: 'co_flasks', x: 6, y: 2, scene: 'co.flasks' },
      { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 9, y: 2 },
      { p: 'smalltable', x: 8, y: 5, scene: 'co.pottery_slip' },
      { p: 'pot', x: 1, y: 6 }, { p: 'pot', x: 9, y: 6 },
    ],
    npcs: [
      { id: 'co_nobu', x: 4, y: 5, dir: 'down', talk: [{ if: 'post', scene: 'co.nobu_post' }, { if: 'ch3_done', scene: 'co.nobu_after' }, { scene: 'co.nobu' }] },
    ],
  });

  interior('co.post', T("Shino's Post House", 'シノ の {郵便所|ゆうびんじょ}'), 9, 8, 4, [6, 25], {
    props: [
      { p: 'exitmat', x: 4, y: 6 },
      { p: 'desk', x: 1, y: 3, scene: 'co.post_desk' },
      { p: 'shelf', x: 6, y: 2 }, { p: 'shelf', x: 7, y: 2, text: { jp: '{仕分|しわ}け{棚|だな} 。 {里|さと} の {家|いえ} の {数|かず} だけ {区切|くぎ}り が ある 。 {空|から} の {区切|くぎ}り が {五|いつ}つ 。', en: 'A sorting rack with one slot per household. Five slots at the end are empty and unlabelled.' } },
      { p: 'mailbox', x: 7, y: 5 },
    ],
    npcs: [
      { id: 'co_shino', x: 4, y: 4, dir: 'down', talk: [{ if: 'post', scene: 'co.shino_post' }, { if: 'ch3_done', scene: 'co.shino_after' }, { scene: 'co.shino' }] },
      { id: 'nao', x: 2, y: 5, dir: 'right', if: 'comp!=nao&co_chronicle_read&!co_nao_cameo', talk: 'co.nao_cameo' },
    ],
  });

  // ======================================================================================
  // The terraces (lower, farmed) — switchback paths, signposts, the headgate
  // ======================================================================================
  C.maps['co.terraces'] = {
    name: T('The Terraces', '{段々畑|だんだんばたけ}'), region: 'cinder', music: 'cinder',
    ambient: { weather: 'leaves' },
    terrain: K.build(44, 34, '.', (k) => {
      k.ragged('left', 'T', 2, 321).ragged('right', 'T', 3, 322);
      k.rect(37, 0, 2, 34, '~');
      // terrace walls with stair gaps
      const walls = [[27, 8], [20, 28], [13, 10], [6, 20]];
      for (const [y, gx] of walls) { k.hline(2, 35, y, '^'); k.set(gx, y, ':').set(gx + 1, y, ':'); }
      // band 1 (bottom)
      k.rect(3, 29, 14, 3, 'F');
      for (let x = 24; x < 35; x += 2) k.set(x, 29, 'O');
      k.path([[21, 33], [21, 30], [8, 30], [8, 27]], ':', 2);
      // band 2
      k.rect(11, 22, 10, 3, 'F');
      for (let x = 24; x < 35; x += 3) { k.set(x, 22, 'O'); k.set(x + 1, 25, 'O'); }
      k.path([[8, 26], [8, 24], [28, 24], [28, 20]], ':', 2);
      k.path([[5, 25], [5, 25]], ':', 1);
      // band 3 (the crossroads)
      for (let x = 3; x < 17; x += 3) { k.set(x, 15, 'O'); k.set(x + 1, 18, 'O'); }
      k.rect(24, 15, 10, 3, 'F');
      k.path([[28, 19], [28, 16], [10, 16], [10, 13]], ':', 2);
      k.path([[19, 16], [19, 17]], ':', 1);
      // band 4 — the overgrown firebreak cuts diagonally across
      for (let i = 0; i < 14; i++) k.rect(2 + i * 2, 11 - Math.floor(i / 3), 3, 2, ';');
      k.path([[10, 12], [10, 9], [20, 9], [20, 6]], ':', 2);
      k.rect(26, 8, 8, 3, 'F');
      // band 5 (top): headgate and the upper gate
      k.path([[20, 5], [20, 0]], ':', 2);
      k.path([[21, 3], [35, 3]], ':', 1);
      k.path([[4, 0], [4, 4], [19, 4]], ':', 2);
      k.rect(8, 1, 8, 2, 'F');
      k.scatter(',', 18, 323, [2, 0, 34, 33], '.');
    }),
    structs: [
      { type: 'house', x: 2, y: 21, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 4], chimney: true, to: 'co.ume', spawn: [3, 6] },
    ],
    props: [
      { p: 'stairs', x: 8, y: 27 }, { p: 'stairs', x: 9, y: 27 }, { p: 'stairs', x: 28, y: 20 }, { p: 'stairs', x: 29, y: 20 },
      { p: 'stairs', x: 10, y: 13 }, { p: 'stairs', x: 11, y: 13 }, { p: 'stairs', x: 20, y: 6 }, { p: 'stairs', x: 21, y: 6 },
      { p: 'co_sluice', x: 37, y: 2, scene: 'co.headgate' },
      { p: 'signblank', x: 18, y: 17, scene: 'co.signpost', if: '!co_signs_done' },
      { p: 'sign', x: 18, y: 17, scene: 'co.signpost_done', if: 'co_signs_done' },
      { p: 'signblank', x: 23, y: 30, scene: 'co.signpost_small', if: '!co_signs_done' },
      { p: 'sign', x: 23, y: 30, text: { jp: '↑ {上|うえ} の {段|だん} ・ {水門|すいもん}  ← ウメ の {家|いえ}  ↓ {里|さと}', en: '↑ Upper terraces · Water gate   ← Ume\'s house   ↓ Village' }, if: 'co_signs_done' },
      { p: 'signblank', x: 22, y: 5, scene: 'co.signpost_small', if: '!co_signs_done' },
      { p: 'sign', x: 22, y: 5, text: { jp: '→ {水門|すいもん}  ↑ {上|うえ} の {段|だん} （ {立入|たちい}り {禁止|きんし} ）', en: '→ Water gate   ↑ Upper terraces (no entry)' }, if: 'co_signs_done' },
      { p: 'fence', x: 20, y: 0, if: '!co_upper_open', scene: 'co.upper_locked' }, { p: 'fence', x: 21, y: 0, if: '!co_upper_open', scene: 'co.upper_locked' },
      { p: 'fence', x: 4, y: 0, if: '!co_shortcut', scene: 'co.shortcut_locked' }, { p: 'fence', x: 5, y: 0, if: '!co_shortcut', scene: 'co.shortcut_locked' },
      { p: 'co_scrub', x: 14, y: 10, if: '!co_firebreak_cut' }, { p: 'co_scrub', x: 23, y: 8, if: '!co_firebreak_cut' }, { p: 'co_scrub', x: 27, y: 7, if: '!co_firebreak_cut' },
      { p: 'co_scrub', x: 6, y: 11, if: '!co_firebreak_cut' }, { p: 'co_scrub', x: 33, y: 8, if: '!co_firebreak_cut' },
      { p: 'co_sheaf', x: 14, y: 10, if: 'co_firebreak_cut' }, { p: 'co_sheaf', x: 23, y: 8, if: 'co_firebreak_cut' }, { p: 'co_sheaf', x: 6, y: 11, if: 'co_firebreak_cut' },
      { p: 'hay', x: 15, y: 32 }, { p: 'cart', x: 12, y: 32 },
      { p: 'stone_marker', x: 33, y: 12, scene: 'co.terrace_marker' },
      { p: 'co_hoshigaki', x: 2, y: 25 },
      { p: 'bench', x: 30, y: 2, text: { jp: '{水門|すいもん} の {横|よこ} の {長椅子|ながいす} 。 ここ から {里|さと} {全体|ぜんたい} が {見|み}える 。', en: 'A bench beside the water gate. From here you can see the whole village, and the lookout tower standing over it like a heron.' } },
    ],
    npcs: [
      { id: 'co_asa', x: 22, y: 31, dir: 'left', wander: 1, talk: [{ if: 'post', scene: 'co.asa_post' }, { if: 'ch3_done', scene: 'co.asa_after' }, { scene: 'co.asa' }] },
      { id: 'co_ume', x: 14, y: 23, dir: 'down', wander: 1, talk: [{ if: 'post', scene: 'co.ume_post' }, { if: 'ch3_done', scene: 'co.ume_after' }, { scene: 'co.ume' }] },
      { id: 'co_tamotsu', x: 34, y: 3, dir: 'right', if: 'co_records_done&!co_upper_open', talk: 'co.tamotsu_gate' },
      { id: 'co_goat', x: 27, y: 23, dir: 'left', wander: 2, talk: 'co.goat' },
    ],
    exits: [
      { x: 21, y: 33, w: 2, h: 1, to: 'co.village', tx: 24, ty: 1, dir: 'down' },
      { x: 20, y: 0, w: 2, h: 1, to: 'co.upper', tx: 20, ty: 28, dir: 'up', if: 'co_upper_open' },
      { x: 4, y: 0, w: 2, h: 1, to: 'co.oldworks', tx: 3, ty: 23, dir: 'up', if: 'co_shortcut' },
    ],
    triggers: [
      { x: 20, y: 1, w: 2, h: 1, scene: 'co.upper_locked', if: '!co_upper_open' },
    ],
    spawn: { default: [21, 32, 'up'] },
  };

  interior('co.ume', T("Ume's House", 'ウメ の {家|いえ}'), 9, 8, 3, [5, 25], {
    exits: [{ x: 3, y: 7, to: 'co.terraces', tx: 5, ty: 25, dir: 'down' }],
    props: [
      { p: 'exitmat', x: 3, y: 6 },
      { p: 'stove', x: 1, y: 2, text: { jp: 'いろり の {火|ひ} は {小|ちい}さく 、 {丁寧|ていねい} に {灰|はい} を かぶせて ある 。', en: 'The hearth fire is small and carefully banked under ash — the way people bank fires who have learned to.' } },
      { p: 'co_beam', x: 5, y: 2, scene: 'co.ume_beam' },
      { p: 'bed', x: 7, y: 4 }, { p: 'co_hoshigaki', x: 2, y: 3 },
      { p: 'shelf', x: 4, y: 2, text: { jp: '{古|ふる}い {鋏|はさみ} 、 {種|たね} の {袋|ふくろ} 、 {子|こ}ども の {描|か}いた {柿|かき} の {絵|え} 。', en: 'Old pruning shears, seed bags, and a child\'s drawing of a persimmon with a face.' } },
    ],
  });

  // ======================================================================================
  // Dungeon 1: the upper terraces (burned twenty years ago, replanted in rows)
  // ======================================================================================
  C.maps['co.upper'] = {
    name: T('The Upper Terraces', '{上|うえ} の {段|だん}'), region: 'cinder', music: 'mystery',
    ambient: { weather: 'motes', tint: 'rgba(90,70,60,0.12)' },
    legend: { Y: { tile: 'ash', prop: 'orchard' }, Z: { tile: 'ash', prop: 'stump' } },
    terrain: K.build(40, 30, 'a', (k) => {
      k.ragged('left', 'n', 2, 331).ragged('right', 'n', 3, 332);
      k.hline(2, 36, 22, '^').hline(2, 36, 14, '^').hline(2, 36, 7, '^');
      k.set(20, 22, ':').set(21, 22, ':');
      k.set(14, 14, ':').set(15, 14, ':');
      k.set(30, 7, ':').set(31, 7, ':');
      for (let y = 24; y < 28; y += 2) for (let x = 4; x < 16; x += 3) k.set(x, y, 'Y');
      for (let y = 16; y < 21; y += 2) for (let x = 22; x < 35; x += 3) k.set(x, y, 'Y');
      for (let y = 9; y < 13; y += 3) for (let x = 4; x < 26; x += 3) k.set(x, y, 'Z');
      k.scatter('Z', 6, 333, [3, 23, 30, 6], 'a');
      k.scatter('.', 30, 334, [3, 0, 33, 29], 'a');
      k.rect(29, 0, 4, 7, 'a');
      k.path([[20, 29], [20, 23]], ':', 2);
      k.path([[20, 20], [14, 20], [14, 15]], ':', 2);
      k.path([[14, 12], [30, 12], [30, 8]], ':', 2);
      k.path([[30, 6], [30, 0]], ':', 2);
    }),
    props: [
      { p: 'stone_marker', x: 23, y: 25, scene: 'co.upper_stone' },
      { p: 'rock', x: 20, y: 22, if: '!co_w_ishi', scene: 'co.upper_wall' }, { p: 'rock', x: 21, y: 22, if: '!co_w_ishi', scene: 'co.upper_wall' },
      { p: 'stairs', x: 20, y: 22, if: 'co_w_ishi' }, { p: 'stairs', x: 21, y: 22, if: 'co_w_ishi' },
      { p: 'co_ashband', x: 16, y: 14, scene: 'co.ashband' }, { p: 'co_ashband', x: 17, y: 14, scene: 'co.ashband' },
      { p: 'rock', x: 14, y: 14, if: '!co_w_tsuchi', scene: 'co.ashband' }, { p: 'rock', x: 15, y: 14, if: '!co_w_tsuchi', scene: 'co.ashband' },
      { p: 'stairs', x: 14, y: 14, if: 'co_w_tsuchi' }, { p: 'stairs', x: 15, y: 14, if: 'co_w_tsuchi' },
      { p: 'stairs', x: 30, y: 7 }, { p: 'stairs', x: 31, y: 7 },
      { p: 'deadlantern', x: 32, y: 2, scene: 'co.upper_lantern', if: '!co_kiln_done' }, { p: 'lantern', x: 32, y: 2, scene: 'co.upper_lantern', if: 'co_kiln_done' },
      { p: 'co_scrub', x: 8, y: 18 }, { p: 'co_scrub', x: 26, y: 10 }, { p: 'co_scrub', x: 12, y: 4 },
    ],
    foes: [
      { id: 'm1', enemy: 'co.moth', x: 10, y: 18, patrol: 2 },
      { id: 's1', enemy: 'co.soot', x: 25, y: 11, patrol: 2 },
      { id: 'm2', enemy: 'co.moth', x: 26, y: 18, patrol: 2, aggro: true },
    ],
    exits: [
      { x: 20, y: 29, w: 2, h: 1, to: 'co.terraces', tx: 20, ty: 1, dir: 'down' },
      { x: 30, y: 0, w: 2, h: 1, to: 'co.oldworks', tx: 30, ty: 23, dir: 'up' },
    ],
    onEnter: [{ scene: 'co.upper_enter', if: '!co_upper_seen' }],
    spawn: { default: [20, 28, 'up'] },
  };

  // ======================================================================================
  // Dungeon 2: the old workshop row (burned shells) + ice house
  // ======================================================================================
  C.maps['co.oldworks'] = {
    name: T('The Old Workshop Row', '{古|ふる}い {工房|こうぼう}{通|どお}り'), region: 'cinder', music: 'mystery',
    ambient: { weather: 'motes', tint: 'rgba(100,60,40,0.14)', dark: 0.12 },
    terrain: K.build(40, 26, 'a', (k) => {
      k.ragged('left', 'n', 2, 341).ragged('right', 'n', 2, 342);
      k.hline(0, 39, 0, '^');
      // the lane
      k.rect(2, 14, 36, 3, ':');
      k.rect(29, 17, 3, 9, ':');
      k.rect(2, 17, 3, 9, ':');
      k.rect(19, 6, 3, 8, ':');
      // burned workshop shells north and south of the lane
      const shell = (x, y, w, h, floor, gapX) => {
        k.rect(x, y, w, h, floor);
        k.frame(x, y, w, h, '#');
        k.set(x + gapX, y + h - 1, floor).set(x + gapX, y, floor);
        k.set(x + w - 1, y + 1, 'a');
      };
      shell(4, 7, 7, 6, '+', 3);
      shell(26, 7, 8, 6, '+', 4);
      shell(8, 18, 8, 6, '_', 3);
      shell(17, 18, 7, 6, 'g', 3);
      k.scatter('g', 10, 343, [3, 13, 34, 5], 'a:');
      k.scatter('.', 20, 344, [2, 0, 36, 26], 'a');
    }),
    structs: [
      { type: 'house', x: 16, y: 1, w: 9, h: 5, roof: 'ash', wall: 'stone', door: 4, windows: [] },
      { type: 'house', x: 34, y: 17, w: 5, h: 3, roof: 'slate', wall: 'stone', door: 2, windows: [], to: 'co.icehouse', spawn: [5, 8] },
    ],
    props: [
      { p: 'co_seal', x: 20, y: 5, if: '!co_seal_broken', scene: 'co.kiln_seal' },
      { p: 'kiln', x: 11, y: 3, o: { sealed: true }, text: { jp: '{小|ちい}さな {素焼|すや}き の {窯|かま} 。 {中|なか} は {灰|はい} で いっぱい だ 。', en: 'A small bisque kiln, its mouth choked with ash.' } },
      { p: 'sign', x: 5, y: 13, scene: 'co.works_sign' },
      { p: 'signblank', x: 29, y: 13, scene: 'co.works_sign2' },
      { p: 'co_beam', x: 11, y: 21 }, { p: 'co_beam', x: 27, y: 9 },
      { p: 'glassware', x: 19, y: 20, scene: 'co.works_globes' },
      { p: 'barrel', x: 5, y: 9 }, { p: 'crate', x: 9, y: 11 }, { p: 'anvil', x: 30, y: 10 },
      { p: 'co_bar', x: 2, y: 25, if: '!co_shortcut', scene: 'co.shortcut_open' }, { p: 'co_bar', x: 3, y: 25, if: '!co_shortcut', scene: 'co.shortcut_open' },
      { p: 'deadlantern', x: 23, y: 7, scene: 'co.works_lantern', if: '!co_kiln_done' }, { p: 'lantern', x: 23, y: 7, scene: 'co.works_lantern', if: 'co_kiln_done' },
    ],
    foes: [
      { id: 'g1', enemy: 'co.golem', x: 13, y: 15, patrol: 2, bg: 'cinder' }, // out on the workshop row, not in a kiln
      { id: 's2', enemy: 'co.soot', x: 29, y: 10, patrol: 1 },
      { id: 'e1', enemy: 'co.ember', x: 20, y: 21, patrol: 1, aggro: true, bg: 'cinder' },
    ],
    exits: [
      { x: 30, y: 25, w: 2, h: 1, to: 'co.upper', tx: 30, ty: 1, dir: 'down' },
      { x: 2, y: 25, w: 2, h: 1, to: 'co.terraces', tx: 4, ty: 1, dir: 'down', if: 'co_shortcut' },
      { x: 20, y: 5, w: 1, h: 1, to: 'co.kiln', tx: 14, ty: 22, dir: 'up', if: 'co_seal_broken' },
    ],
    onEnter: [{ scene: 'co.oldworks_enter', if: '!co_oldworks_seen' }],
    spawn: { default: [30, 23, 'up'] },
  };

  C.maps['co.icehouse'] = {
    name: T('The Ice House', '{氷室|ひむろ}'), region: 'cinder', music: null, noTravel: true, travelKind: 'interior',
    ambient: { dark: 0.35, tint: 'rgba(150,200,255,0.12)', playerLight: 40 },
    terrain: K.build(11, 10, '#', (k) => { k.rect(1, 2, 9, 7, 'i'); k.rect(4, 6, 3, 3, '+'); k.set(5, 9, '+'); }),
    props: [
      { p: 'exitmat', x: 5, y: 8 },
      { p: 'co_iceblock', x: 1, y: 2 }, { p: 'co_iceblock', x: 2, y: 2 }, { p: 'co_iceblock', x: 8, y: 2 }, { p: 'co_iceblock', x: 9, y: 3 },
      { p: 'co_iceblock', x: 1, y: 5, scene: 'co.ice_block' }, { p: 'hay', x: 9, y: 6 }, { p: 'hay', x: 2, y: 7 },
      { p: 'stone_marker', x: 5, y: 2, scene: 'co.ice_marker' },
    ],
    exits: [{ x: 5, y: 9, to: 'co.oldworks', tx: 36, ty: 20, dir: 'down' }],
    onEnter: [{ scene: 'co.ice_enter', if: '!co_w_koori' }],
    spawn: { default: [5, 8, 'up'] },
  };

  // ======================================================================================
  // Dungeon 3: inside the great climbing kiln — three chambers stepping uphill
  // ======================================================================================
  C.maps['co.kiln'] = {
    name: T('The Great Kiln', '{大窯|おおがま}'), region: 'cinder', music: 'kiln', noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the Great Kiln' },
    ambient: { weather: 'embers', dark: 0.45, darkCol: '30,8,4', tint: 'rgba(255,110,40,0.08)', playerLight: 48 },
    terrain: K.build(30, 24, '#', (k) => {
      k.rect(2, 17, 26, 5, '+');           // chamber 1 (lowest, firemouth side)
      k.scatter('a', 30, 351, [2, 17, 26, 5], '+');
      k.rect(2, 10, 26, 6, 'g');           // chamber 2 (glass-melting chamber)
      k.scatter('a', 18, 352, [2, 10, 26, 6], 'g');
      k.rect(2, 3, 26, 6, '+');            // chamber 3 (top, control wall)
      k.scatter('a', 22, 353, [2, 3, 26, 6], '+');
      k.set(6, 16, '+').set(7, 16, '+');   // flue opening 1→2
      k.set(22, 9, '+').set(23, 9, '+');   // flue opening 2→3
      k.set(14, 22, '+').set(14, 23, '+');
    }),
    props: [
      { p: 'exitmat', x: 14, y: 22 },
      { p: 'stairs', x: 6, y: 16 }, { p: 'stairs', x: 7, y: 16 }, { p: 'stairs', x: 22, y: 9 }, { p: 'stairs', x: 23, y: 9 },
      { p: 'co_tablet', x: 25, y: 19, if: '!co_tab1', scene: 'co.tablet1' },
      { p: 'co_tablet', x: 4, y: 12, if: '!co_tab2', scene: 'co.tablet2' },
      { p: 'co_tablet', x: 26, y: 5, if: '!co_tab3', scene: 'co.tablet3' },
      { p: 'co_kilnwall', x: 11, y: 3, scene: 'co.kiln_wall', if: '!co_kiln_open' },
      { p: 'co_kilnwall', x: 11, y: 3, o: { open: true, fixed: true }, scene: 'co.kiln_wall_done', if: 'co_kiln_open' },
      { p: 'kiln', x: 18, y: 2, o: { sealed: true }, scene: 'co.firebox', if: '!co_kiln_open' },
      { p: 'kiln', x: 18, y: 2, o: {}, scene: 'co.firebox', if: 'co_kiln_open' },
      { p: 'pillar', x: 10, y: 12 }, { p: 'pillar', x: 19, y: 12 },
      { p: 'glassware', x: 15, y: 11, text: { jp: '{溶|と}けて {固|かた}まった ガラス の {火屋|ほや} 。 {数|かぞ}える と 、 {三十個|さんじゅっこ} {近|ちか}く ある 。', en: 'Lantern globes, melted and set into one lump. You count close to thirty.' } },
      { p: 'co_beam', x: 3, y: 5 },
    ],
    foes: [
      { id: 'e2', enemy: 'co.ember', x: 20, y: 19, patrol: 2 },
      { id: 'g2', enemy: 'co.golem', x: 14, y: 13, patrol: 2, aggro: true },
      { id: 'e3', enemy: 'co.ember', x: 8, y: 5, patrol: 2 },
    ],
    exits: [{ x: 14, y: 23, w: 1, h: 1, to: 'co.oldworks', tx: 20, ty: 6, dir: 'down' }],
    onEnter: [{ scene: 'co.kiln_enter', if: '!co_kiln_seen' }],
    spawn: { default: [14, 22, 'up'] },
  };

  C.maps['co.kiln_core'] = {
    name: T("The Kiln's Heart", '{窯|かま}の{奥|おく}'), region: 'cinder', music: 'kiln', noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the Great Kiln' },
    ambient: { weather: 'embers', dark: 0.4, darkCol: '40,8,0', tint: 'rgba(255,90,30,0.12)', playerLight: 50 },
    terrain: K.build(15, 12, '#', (k) => { k.rect(1, 2, 13, 9, 'g'); k.scatter('a', 20, 361, [1, 2, 13, 9], 'g'); k.set(7, 11, 'g'); }),
    props: [
      { p: 'exitmat', x: 7, y: 10 },
      { p: 'co_glasslantern', x: 7, y: 3, scene: 'co.core_lantern', if: 'co_warden_down' },
      { p: 'co_furnace', x: 1, y: 2 }, { p: 'co_furnace', x: 12, y: 2 },
      { p: 'co_tablet', x: 4, y: 6, if: 'co_warden_down&!co_logpage_taken', scene: 'co.core_page' },
    ],
    exits: [{ x: 7, y: 11, to: 'co.kiln', tx: 20, ty: 5, dir: 'down' }],
    onEnter: [{ scene: 'co.warden_fight', if: '!co_warden_down', once: false }],
    spawn: { default: [7, 9, 'up'] },
  };

  // The top of the fire lookout: a platform over the lanterns. Round the platform, the village
  // far below at night (surround: the village map itself drawn small, the lookout's own place on
  // it at the foot of its timber legs; src/engine/61_below.js): the festival with its lanterns
  // while you are up there that night (until the evening's reflection is over), the village after.
  C.maps['co.lookout'] = {
    name: T('The Lookout', '{火|ひ}の{見|み}{櫓|やぐら}'), region: 'cinder', music: 'quiet_road',
    ambient: { weather: 'fireflies', dark: 0.5, darkCol: '14,8,26', playerLight: 44 },
    surround: { below: [{ if: '!seen.co.reflection', map: 'co.festival' }, { map: 'co.village' }], at: [12, 12.9], hide: [11, 11, 2, 2], scale: 0.4, drop: 2.4, shaft: 'timber', top: 3, foot: 1.1 },
    terrain: K.build(16, 12, 'x', (k) => { k.rect(5, 4, 6, 4, '_'); }),
    props: [
      { p: 'fence', x: 5, y: 3, block: false }, { p: 'fence', x: 6, y: 3, block: false }, { p: 'fence', x: 9, y: 3, block: false }, { p: 'fence', x: 10, y: 3, block: false },
      { p: 'bell', x: 7, y: 3, scene: 'co.lookout_bell' },
      { p: 'sparkle', x: 1, y: 9 }, { p: 'sparkle', x: 3, y: 10 }, { p: 'sparkle', x: 12, y: 9 }, { p: 'sparkle', x: 14, y: 10 },
      { p: 'sparkle', x: 2, y: 1 }, { p: 'sparkle', x: 13, y: 2 }, { p: 'sparkle', x: 7, y: 10 }, { p: 'sparkle', x: 9, y: 11 },
      { p: 'fence', x: 5, y: 8, block: false }, { p: 'fence', x: 6, y: 8, block: false }, { p: 'fence', x: 7, y: 8, block: false }, { p: 'fence', x: 8, y: 8, block: false }, { p: 'fence', x: 9, y: 8, block: false },
      { p: 'hole', x: 10, y: 7 },
    ],
    exits: [],
    triggers: [{ x: 10, y: 7, w: 1, h: 1, scene: 'co.lookout_down', if: 'ch3_done' }],
    spawn: { default: [7, 6, 'up'] },
  };
})(RB.content, RB.mapkit);
