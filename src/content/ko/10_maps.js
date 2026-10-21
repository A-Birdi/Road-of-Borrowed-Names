/* Kotonoha, Chapter 9: the island above ground (expansion P11; docs/future/work/P11_SEA.md). The shore where the boats
 * land, written leaves drifting along the tide line and old stone lanterns half-buried in the sand; the village of
 * netted houses with the keepers' hall; the great camphor's lower terraces and, above them, its crown; the tide pools
 * to the west with their conches and the tide calendar; the sea cave to the east. The Root Hollows are in
 * 11_roots.js. Twelve-chapter journeys only (`edition: 2`).
 *
 * The island's three phases (07_REGIONS.md R4) are read separately: the story phase by flags (an early visit by the
 * player's own boat before Lanternfall is over, `ko_arrived&!ch5_done`; Chapter 9, `ko_ch9`; after the ending,
 * `post`), the profile by the tasks' tiers, and introduced concepts by the tasks' items. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  // noCompanion: the companion is away while ko_apart holds (the separation in the Root Hollows, 11_roots.js)
  const ISLE = { region: 'kotonoha', place: 'kotonoha', travel: 'kotonoha', music: 'kotonoha', edition: 2, noCompanion: '!ko_apart' };
  // leaves drifting down everywhere, a little sea haze
  const LEAVES = { weather: 'leaves', tint: 'rgba(200,220,210,0.05)' };
  // a stone lantern half-buried in sand: dark until `flag`, lit after
  const sandtoro = (x, y, flag, scene, after) => [
    Object.assign({ p: 'ko_sandtoro', x, y, if: '!' + flag }, scene ? { scene } : {}),
    Object.assign({ p: 'ko_sandtoro', x, y, if: flag, light: 30, o: { lit: true } }, after ? { scene: after } : {}),
  ];

  // ---- the shore (言の葉の浜) -------------------------------------------------------------------------------------------
  C.maps['ko.shore'] = Object.assign({}, ISLE, {
    name: T('The Shore of Leaves', '{葉|は} の {浜|はま}'),
    ambient: LEAVES,
    terrain: K.build(40, 26, '.', (k) => {
      k.ragged('top', 'T', 2, 901);
      k.scatter(';', 14, 902, [0, 3, 40, 8], '.');
      k.scatter('o', 5, 903, [2, 4, 36, 6], '.');
      k.rect(0, 11, 40, 10, 's');
      k.scatter('"', 9, 904, [0, 10, 40, 2], 's');
      k.rect(0, 20, 40, 2, 'w');
      k.rect(0, 22, 40, 4, '~');
      k.ragged('bottom', '~', 2, 905);
      k.rect(19, 18, 3, 7, '_');                       // the jetty
      k.path([[20, 0], [20, 11]], ':', 2);             // up to the village
      k.rect(33, 3, 7, 8, '^'); k.rect(0, 3, 4, 7, '^');
      k.scatter('h', 6, 906, [1, 12, 38, 7], 's');
    }),
    props: [
      { p: 'ko_leaves', x: 5, y: 17 }, { p: 'ko_leaves', x: 12, y: 19 }, { p: 'ko_leaves', x: 30, y: 15 },
      { p: 'ko_leaves', x: 9, y: 14, if: 'item.ko_leaf_rw|ko_ret_rw' }, { p: 'ko_leaves', x: 9, y: 14, if: '!item.ko_leaf_rw&!ko_ret_rw', scene: 'ko.leaf_rw' },
      { p: 'ko_leaves', x: 25, y: 18, if: 'item.ko_leaf_sg|ko_ret_sg' }, { p: 'ko_leaves', x: 25, y: 18, if: '!item.ko_leaf_sg&!ko_ret_sg', scene: 'ko.leaf_sg' },
      { p: 'ko_basket', x: 15, y: 14 }, { p: 'ko_basket', x: 26, y: 13 },
      ...sandtoro(7, 12, 'ko_l_shore1', null, null), ...sandtoro(34, 16, 'ko_l_shore2', null, null),
      { p: 'sign', x: 22, y: 10, scene: 'ko.shore_sign' },
      { p: 'ko_netrack', x: 27, y: 9 },
      { p: 'pier', x: 19, y: 24 }, { p: 'pier', x: 21, y: 24 },
      { p: 'boat', x: 22, y: 22, if: 'ko_arrived', scene: 'ko.ferry_back' },
      { p: 'bench', x: 16, y: 10 },
    ],
    npcs: [
      { id: 'ko_nami', x: 20, y: 17, dir: 'down', if: 'ch5_done&!ko_otoha_met' },
    ],
    foes: [
      { id: 's1', enemy: 'ko.sandlantern', x: 31, y: 18, patrol: 2 },
    ],
    triggers: [
      // the rocks round to the sea cave are under water but at low tide (Koyomi's calendar)
      { x: 39, y: 14, w: 1, h: 2, scene: 'ko.east_tide', if: '!ko_lowtide' },
    ],
    exits: [
      { x: 20, y: 0, w: 2, h: 1, to: 'ko.village', sp: 'from_shore', dir: 'up' },
      { x: 0, y: 15, w: 1, h: 2, to: 'ko.tidepools', sp: 'from_shore', dir: 'left' },
      { x: 39, y: 14, w: 1, h: 2, to: 'ko.seacave', sp: 'from_shore', dir: 'right', if: 'ko_lowtide' },
    ],
    onEnter: [{ scene: 'ko.shore_enter', if: 'ch5_done&!ko_ch9' }],
    spawn: { default: [20, 22, 'up'], from_sea: [20, 22, 'up'], from_village: [20, 1, 'down'], from_tidepools: [1, 15, 'right'], from_seacave: [38, 14, 'left'] },
  });

  // ---- the village (葉守の村) ----------------------------------------------------------------------------------------
  // the leaf-keepers' village: the keepers' hall with its exhibition, Otoha's house, Mitsu's lodging house, the Wind
  // Stone where leaves are sent home, Tokio's census board, Hamaji's nets
  C.maps['ko.village'] = Object.assign({}, ISLE, {
    name: T('The Keepers\' Village', '{葉守|はもり} の {村|むら}'),
    ambient: LEAVES,
    terrain: K.build(40, 30, '.', (k) => {
      k.ragged('left', 'T', 3, 911).ragged('right', 'T', 3, 912);
      k.scatter(';', 16, 913, [3, 2, 34, 26], '.');
      k.scatter(',', 8, 914, [4, 14, 32, 12], '.');
      k.path([[20, 29], [20, 0]], ':', 2);
      k.path([[7, 15], [33, 15]], ':', 1);
      k.rect(22, 14, 6, 4, '+');                       // the Wind Stone's paving
      k.path([[10, 25], [20, 25]], ':', 1);
    }),
    structs: [
      { type: 'house', x: 14, y: 3, w: 12, h: 5, roof: 'thatch', wall: 'wood', door: 6, windows: [2, 9], to: 'ko.hall', lit: true, sign: true, signX: 2 },
      { type: 'house', x: 4, y: 10, w: 7, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 5], to: 'ko.otoha', lit: true },
      { type: 'house', x: 29, y: 10, w: 8, h: 4, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 6], to: 'ko.lodge', lit: true, sign: true, signX: 1 },
      { type: 'house', x: 4, y: 19, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 4] },
      { type: 'house', x: 30, y: 19, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 4] },
    ],
    props: [
      { p: 'ko_windstone', x: 25, y: 14, scene: 'ko.windstone' },
      { p: 'noticeboard', x: 13, y: 12, scene: 'ko.census_board' },
      { p: 'ko_netrack', x: 8, y: 24 }, { p: 'ko_netrack', x: 12, y: 26 },
      { p: 'ko_basket', x: 17, y: 17 }, { p: 'ko_basket', x: 27, y: 23 },
      { p: 'ko_leaves', x: 23, y: 20 }, { p: 'ko_leaves', x: 6, y: 16 }, { p: 'ko_leaves', x: 31, y: 25 },
      { p: 'well', x: 15, y: 20 },
      { p: 'lantern', x: 19, y: 9, o: { lit: true } }, { p: 'lantern', x: 22, y: 9, o: { lit: true } },
      { p: 'bench', x: 27, y: 17 }, { p: 'flowerpot', x: 11, y: 13 },
    ],
    npcs: [
      { id: 'ko_otoha', x: 24, y: 16, dir: 'down', talk: [
        { if: 'post', scene: 'ko.otoha_post' },
        { if: 'quest.ko_main=7', scene: 'ko.end' },
        { if: 'ko_ch9&!ko_otoha_met', scene: 'ko.otoha_first' },
        { if: 'quest.ko_main=2', scene: 'ko.otoha_leaves' },
        { if: 'quest.ko_main=3', scene: 'ko.otoha_tellings' },
        { if: 'quest.ko_main>=4&!ko_done', scene: 'ko.otoha_roots' },
        { if: 'ko_done', scene: 'ko.otoha_after' },
        { scene: 'ko.otoha_early' }] },
      { id: 'ko_nami', x: 22, y: 10, dir: 'down', if: 'ko_otoha_met|!ch5_done', talk: [
        { if: 'post', scene: 'ko.nami_post' },
        { if: 'quest.ko_main=3&!ko_tell_nami', scene: 'ko.nami_telling' },
        { if: 'ko_done', scene: 'ko.nami_after' },
        { if: 'ko_ch9', scene: 'ko.nami_ch9' },
        { scene: 'ko.nami_early' }] },
      { id: 'ko_hamaji', x: 10, y: 23, dir: 'right', talk: [
        { if: 'post', scene: 'ko.hamaji_post' },
        { if: 'quest.ko_main=3&!ko_tell_hamaji', scene: 'ko.hamaji_telling' },
        { if: 'ko_done', scene: 'ko.hamaji_after' },
        { if: 'ko_ch9', scene: 'ko.hamaji_ch9' },
        { scene: 'ko.hamaji_early' }] },
      { id: 'ko_tokio', x: 14, y: 13, dir: 'down', talk: [
        { if: 'post', scene: 'ko.tokio_post' },
        { if: 'ko_done', scene: 'ko.tokio_after' },
        { if: 'ko_ch9', scene: 'ko.tokio_ch9' },
        { scene: 'ko.tokio_early' }] },
      { id: 'ko_nana', x: 18, y: 19, dir: 'down', talk: [
        { if: 'post', scene: 'ko.nana_post' },
        { if: 'ko_done', scene: 'ko.nana_after' },
        { if: 'ko_ch9', scene: 'ko.nana_ch9' },
        { scene: 'ko.nana_early' }] },
      { id: 'ko_ao', x: 28, y: 22, dir: 'left', talk: [
        { if: 'post', scene: 'ko.ao_post' },
        { if: 'ko_done', scene: 'ko.ao_after' },
        { if: 'ko_ch9&!item.ko_leaf_mb&!ko_ret_mb&mb1_done', scene: 'ko.ao_leaf' },
        { if: 'ko_ch9', scene: 'ko.ao_ch9' },
        { scene: 'ko.ao_early' }] },
    ],
    exits: [
      { x: 20, y: 29, w: 2, h: 1, to: 'ko.shore', sp: 'from_village', dir: 'down' },
      { x: 20, y: 0, w: 2, h: 1, to: 'ko.terraces', sp: 'from_village', dir: 'up' },
    ],
    spawn: { default: [20, 27, 'up'], from_shore: [20, 28, 'up'], from_terraces: [20, 1, 'down'] },
  });

  // ---- interiors ---------------------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, outside, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', place: 'kotonoha', music: null, noTravel: true, travelKind: 'interior', edition: 2, noCompanion: '!ko_apart',
      terrain: K.room(w, h, '_', doorX),
      props: [], npcs: [],
      exits: [{ x: doorX, y: h - 1, to: outside, tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  // the keepers' hall: the exhibition's three panels (each shows the version chosen for it; blank until then), the
  // shelves of the census, Yoshino's mornings with the children
  const panel = (x, pid) => [
    { p: 'ko_panel', x, y: 3, if: '!tell_ko.t_hall_ok', o: { v: 0 }, scene: 'ko.hall_panel_blank' },
    ...['otoha', 'nami', 'hamaji', 'shell'].map((src, i) => ({ p: 'ko_panel', x, y: 3, if: 'var.tell_ko.t_hall_' + pid + '=' + src, o: { v: i + 1 }, scene: 'ko.hall_panel_' + pid })),
  ];
  interior('ko.hall', T('The Keepers\' Hall', '{葉守|はもり} の {館|やかた}'), 16, 11, 8, 'ko.village', [20, 8], {
    props: [
      { p: 'exitmat', x: 8, y: 9 },
      ...panel(4, 'p1'), ...panel(8, 'p2'), ...panel(12, 'p3'),
      { p: 'shelf', x: 1, y: 2, scene: 'ko.hall_shelf' }, { p: 'shelf', x: 14, y: 2 },
      { p: 'desk', x: 11, y: 6, scene: 'ko.hall_exhibit' },
      { p: 'table', x: 3, y: 6 }, { p: 'chair', x: 2, y: 6 }, { p: 'chair', x: 5, y: 6 },
      { p: 'lantern', x: 14, y: 7, o: { lit: true } }, { p: 'ko_basket', x: 1, y: 8 },
    ],
    npcs: [
      { id: 'ko_yoshino', x: 4, y: 7, dir: 'up', talk: [
        { if: 'post', scene: 'ko.yoshino_post' },
        { if: 'ko_done', scene: 'ko.yoshino_after' },
        { if: 'ko_ch9', scene: 'ko.yoshino_ch9' },
        { scene: 'ko.yoshino_early' }] },
    ],
  });
  // Otoha's house: pressed leaves on every shelf, a low table, a kettle
  interior('ko.otoha', T('Otoha\'s House', 'オトハ の {家|いえ}'), 10, 8, 3, 'ko.village', [7, 14], {
    props: [
      { p: 'exitmat', x: 3, y: 6 }, { p: 'shelf', x: 1, y: 2, scene: 'ko.otoha_shelf' }, { p: 'shelf', x: 2, y: 2 }, { p: 'shelf', x: 8, y: 2 },
      { p: 'table', x: 6, y: 4 }, { p: 'teaset', x: 6, y: 3 }, { p: 'lantern', x: 8, y: 5, o: { lit: true } },
    ],
  });
  // Mitsu's lodging house by the path: a meal for whoever lands, a bed to rest
  interior('ko.lodge', T('Mitsu\'s Lodging House', 'ミツ の {宿|やど}'), 12, 9, 4, 'ko.village', [33, 14], {
    props: [
      { p: 'exitmat', x: 4, y: 7 }, { p: 'counter', x: 6, y: 2, across: true }, { p: 'stove', x: 9, y: 2 }, { p: 'pot', x: 10, y: 2 },
      { p: 'bed', x: 1, y: 4, scene: 'ko.lodge_rest' }, { p: 'bed', x: 1, y: 6, scene: 'ko.lodge_rest' },
      { p: 'table', x: 7, y: 5 }, { p: 'chair', x: 6, y: 5 }, { p: 'chair', x: 9, y: 5 }, { p: 'lantern', x: 10, y: 6, o: { lit: true } },
    ],
    npcs: [
      { id: 'ko_mitsu', x: 7, y: 3, dir: 'down', talk: [
        { if: 'post', scene: 'ko.mitsu_post' },
        { if: 'ko_done', scene: 'ko.mitsu_after' },
        { if: 'ko_ch9', scene: 'ko.mitsu_ch9' },
        { scene: 'ko.mitsu_early' }] },
    ],
  });

  // ---- the lower terraces (下の段) ---------------------------------------------------------------------------------------
  // stone terraces stepping up between the camphor's roots; keepers' baskets; leaves rising on the air; the way up to
  // the crown roped off in an early visit (Otoha's to open)
  C.maps['ko.terraces'] = Object.assign({}, ISLE, {
    name: T('The Lower Terraces', '{下|しも} の {段|だん}'),
    ambient: { weather: 'leaves', tint: 'rgba(60,90,70,0.07)' },
    terrain: K.build(36, 30, 'T', (k) => {
      for (const [y, x0, x1] of [[24, 4, 31], [17, 6, 29], [10, 8, 27], [3, 10, 25]]) { k.rect(x0, y, x1 - x0 + 1, 5, '.'); k.hline(x0, x1, y + 5, '^'); }
      k.rect(4, 29, 28, 1, '.');
      for (const [y, x] of [[29, 18], [22, 12], [15, 23], [8, 15]]) k.rect(x, y, 2, 2, '+');   // the stone stairs up
      k.path([[18, 29], [18, 24], [12, 24], [12, 17], [23, 17], [23, 10], [15, 10], [15, 3], [18, 3], [18, 0]], ':', 2);
      k.scatter(';', 14, 921, [4, 3, 28, 26], '.');
      k.scatter('r', 6, 922, [6, 4, 24, 24], '.');
    }),
    props: [
      { p: 'ko_leaves', x: 6, y: 26 }, { p: 'ko_leaves', x: 26, y: 26 }, { p: 'ko_leaves', x: 24, y: 12 }, { p: 'ko_leaves', x: 10, y: 5 },
      { p: 'ko_leaves', x: 8, y: 19, if: '!ch3_done|item.ko_leaf_co|ko_ret_co' },
      { p: 'ko_leaves', x: 8, y: 19, if: 'ch3_done&!item.ko_leaf_co&!ko_ret_co', scene: 'ko.leaf_co' },
      { p: 'ko_leaves', x: 26, y: 5, if: '!ch4_done|item.ko_leaf_sb|ko_ret_sb' },
      { p: 'ko_leaves', x: 26, y: 5, if: 'ch4_done&!item.ko_leaf_sb&!ko_ret_sb', scene: 'ko.leaf_sb' },
      { p: 'ko_basket', x: 21, y: 19 }, { p: 'ko_basket', x: 9, y: 12 },
      { p: 'ko_current', x: 28, y: 20 }, { p: 'ko_current', x: 7, y: 13 }, { p: 'ko_current', x: 22, y: 5 },
      { p: 'shrine', x: 13, y: 4, scene: 'ko.terrace_shrine' },
    ],
    npcs: [],
    foes: [
      { id: 't1', enemy: 'ko.leafling', x: 25, y: 20, patrol: 2 },
      { id: 't2', enemy: 'ko.leafling', x: 10, y: 6, patrol: 2, if: 'ko_ch9|post' },
      // the keeper's apprentice (E3): Ao, by his basket
      { id: 'w_ao', enemy: 'ko.leafling', encounter: 'ko.wander_ao', x: 14, y: 20, patrol: 1, if: 'ko_ch9&!ko_ao_helped' },
    ],
    triggers: [{ x: 18, y: 1, w: 2, h: 1, scene: 'ko.rope_early', if: '!ko_ch9&!post' }],
    exits: [
      { x: 18, y: 29, w: 2, h: 1, to: 'ko.village', sp: 'from_terraces', dir: 'down' },
      { x: 18, y: 0, w: 2, h: 1, to: 'ko.crown', sp: 'from_terraces', dir: 'up', if: 'ko_ch9|post' },
    ],
    spawn: { default: [18, 28, 'up'], from_village: [18, 28, 'up'], from_crown: [18, 1, 'down'] },
  });

  // ---- the crown (上の段, the great camphor) ---------------------------------------------------------------------------
  // the upper terraces round the trunk; the tree's shrine; the hollow between two roots that goes down into the Root
  // Hollows (opened by Otoha once the exhibition hangs)
  C.maps['ko.crown'] = Object.assign({}, ISLE, {
    name: T('The Great Camphor', '{大楠|おおくす}'),
    ambient: { weather: 'leaves', tint: 'rgba(70,100,80,0.09)', dark: 0.08 },
    terrain: K.build(36, 26, 'T', (k) => {
      k.rect(5, 6, 26, 19, '.');
      k.rect(12, 2, 12, 5, '^');
      k.rect(14, 7, 8, 3, '+');
      k.path([[18, 25], [18, 11]], ':', 2);
      k.scatter(';', 12, 931, [6, 11, 24, 13], '.');
      k.scatter('r', 4, 932, [6, 12, 24, 10], '.');
    }),
    props: [
      { p: 'ko_camphor', x: 16, y: 7 },
      { p: 'shrine', x: 24, y: 9, scene: 'ko.crown_shrine' },
      { p: 'hole', x: 14, y: 9 },
      { p: 'ko_leaves', x: 8, y: 14 }, { p: 'ko_leaves', x: 25, y: 18 }, { p: 'ko_leaves', x: 11, y: 21 },
      { p: 'ko_current', x: 9, y: 9 }, { p: 'ko_current', x: 27, y: 13 }, { p: 'ko_current', x: 21, y: 20 },
      { p: 'ko_basket', x: 23, y: 12 },
    ],
    npcs: [],
    foes: [
      { id: 'c1', enemy: 'ko.leafling', x: 10, y: 16, patrol: 2 },
      { id: 'c2', enemy: 'ko.jelly', x: 27, y: 20, patrol: 1, if: 'ko_ch9|post' },
    ],
    triggers: [{ x: 14, y: 10, w: 1, h: 1, scene: 'ko.hollow_shut', if: '!ko_hollow_open' }],
    exits: [
      { x: 18, y: 25, w: 2, h: 1, to: 'ko.terraces', sp: 'from_crown', dir: 'down' },
      { x: 14, y: 10, w: 1, h: 1, to: 'ko.roots1', sp: 'from_crown', dir: 'down', if: 'ko_hollow_open' },
    ],
    onEnter: [{ scene: 'ko.crown_first', if: '!ko_crown_seen' }],
    spawn: { default: [18, 24, 'up'], from_terraces: [18, 24, 'up'], from_roots: [14, 11, 'down'] },
  });

  // ---- the tide pools (潮だまり) ---------------------------------------------------------------------------------------
  // the island's west beach: pools that mirror words, the conches that hold what was said, the tide calendar's
  // standing stone on the point; the sailor's echo along the tide line
  C.maps['ko.tidepools'] = Object.assign({}, ISLE, {
    name: T('The Tide Pools', '{潮|しお}だまり'),
    ambient: { weather: 'motes', tint: 'rgba(160,210,220,0.06)' },
    terrain: K.build(36, 24, 's', (k) => {
      k.ragged('left', '~', 4, 941).ragged('bottom', '~', 3, 942);
      k.rect(26, 0, 10, 4, '.'); k.ragged('top', 'T', 2, 943);
      for (const [x, y, w, h] of [[8, 6, 3, 2], [14, 12, 4, 2], [21, 7, 3, 3], [10, 16, 3, 2], [24, 15, 3, 2], [18, 3, 2, 2]]) k.rect(x, y, w, h, 'w');
      k.scatter('h', 12, 944, [6, 2, 28, 18], 's');
      k.path([[35, 11], [28, 11], [28, 5]], ':', 1);
    }),
    props: [
      { p: 'ko_conch', x: 7, y: 9, scene: 'ko.shell_a' }, { p: 'ko_conch', x: 18, y: 15, scene: 'ko.shell_b' }, { p: 'ko_conch', x: 24, y: 11, scene: 'ko.shell_c' },
      { p: 'ko_tidestone', x: 29, y: 3, scene: 'ko.tidestone' },
      { p: 'ko_leaves', x: 15, y: 19, if: '!kr_done|item.ko_leaf_kr|ko_ret_kr' },
      { p: 'ko_leaves', x: 15, y: 19, if: 'kr_done&!item.ko_leaf_kr&!ko_ret_kr', scene: 'ko.leaf_kr' },
      { p: 'ko_leaves', x: 27, y: 18 }, { p: 'ko_leaves', x: 12, y: 4 },
      ...sandtoro(31, 15, 'ko_l_pools', null, null),
    ],
    npcs: [
      { id: 'ko_koyomi', x: 30, y: 5, dir: 'left', talk: [
        { if: 'post', scene: 'ko.koyomi_post' },
        { if: 'ko_done', scene: 'ko.koyomi_after' },
        { if: 'ko_ch9', scene: 'ko.koyomi_ch9' },
        { scene: 'ko.koyomi_early' }] },
    ],
    foes: [
      { id: 'p1', enemy: 'ko.mirror', x: 15, y: 10, patrol: 1 },
      { id: 'p2', enemy: 'ko.mirror', x: 22, y: 13, patrol: 1, if: 'ko_ch9|post' },
      { id: 'p3', enemy: 'ko.jelly', x: 11, y: 18, patrol: 1 },
      // the sailor's echo (E3): Kihei, at the water's edge
      { id: 'w_kihei', enemy: 'ko.jelly', encounter: 'ko.wander_kihei', x: 8, y: 20, patrol: 1, if: '!ko_kihei_met' },
    ],
    exits: [{ x: 35, y: 11, w: 1, h: 2, to: 'ko.shore', sp: 'from_tidepools', dir: 'right' }],
    spawn: { default: [34, 11, 'left'], from_shore: [34, 11, 'left'] },
  });

  // ---- the sea cave (海の洞) -------------------------------------------------------------------------------------------
  // round the eastern rocks at low tide: a cave with a shelf of rock like a stage, pools, the sea's own echo
  C.maps['ko.seacave'] = Object.assign({}, ISLE, {
    name: T('The Sea Cave', '{海|うみ} の {洞|ほら}'), setting: 'indoor', travelKind: 'dungeon', noTravel: true, music: 'ko_roots',
    ambient: { dark: 0.4, playerLight: 56, weather: 'motes', tint: 'rgba(60,120,140,0.10)' },
    terrain: K.build(30, 20, '#', (k) => {
      k.rect(1, 3, 27, 15, 's');
      k.rect(10, 4, 10, 4, '+');                      // the rock stage
      for (const [x, y, w, h] of [[3, 12, 4, 3], [22, 13, 4, 3], [14, 15, 3, 2]]) k.rect(x, y, w, h, 'w');
      k.rect(0, 10, 1, 2, 's');
      k.scatter('h', 6, 951, [2, 9, 25, 8], 's');
    }),
    props: [
      { p: 'pillar', x: 10, y: 4 }, { p: 'pillar', x: 19, y: 4 },
      { p: 'ko_conch', x: 25, y: 5, scene: 'ko.cave_conch' },
      { p: 'ko_leaves', x: 6, y: 6 }, { p: 'ko_leaves', x: 20, y: 11 },
    ],
    npcs: [],
    foes: [
      { id: 's1', enemy: 'ko.jelly', x: 6, y: 14, patrol: 1, bg: 'kotonoha_cave' },
      { id: 's2', enemy: 'ko.echo', x: 22, y: 9, patrol: 1, bg: 'kotonoha_cave' },
    ],
    exits: [{ x: 0, y: 10, w: 1, h: 2, to: 'ko.shore', sp: 'from_seacave', dir: 'left' }],
    onEnter: [{ scene: 'ko.seacave_first', if: '!ko_seacave_seen' }],
    spawn: { default: [1, 10, 'right'], from_shore: [1, 10, 'right'] },
  });
})(RB.content, RB.mapkit);

RB.script.add(`
@scene ko.shore_sign
!gesture pc read 22,10
narr: {古|ふる}い {板|いた} に 、 {彫|ほ}った {字|じ} 。 「{言|こと}の{葉|は}{島|じま} 。 {葉|は} を {拾|ひろ}う {者|もの} は 、 {葉守|はもり} の {村|むら} へ 。」 || Old boards, the words cut into them: "Kotonoha. Whoever gathers a leaf, bring it to the keepers' village."
`);
