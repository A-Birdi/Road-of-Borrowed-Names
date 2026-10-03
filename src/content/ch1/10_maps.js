/* Chapter 1 maps: Reedwake village, its interiors, the arrival road, the
 * mill road and the abandoned mill. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  // ---- Reedwake village ----------------------------------------------------------
  C.maps['rw.village'] = {
    name: { en: 'Reedwake', jp: '{葦|あし}ノ{瀬|せ}' }, region: 'reedwake', place: 'reedwake', travel: 'reedwake',
    music: [{ if: 'rw_night', id: 'reedwake_night' }, { id: 'reedwake' }],
    ambient: { weather: null },
    alt: [{ if: 'rw_night', ambient: { dark: 0.55, darkCol: '12,16,44', weather: 'fireflies', playerLight: 56 }, night: true }],
    onEnter: [{ scene: 'rw.village_first', once: true }],
    terrain: K.build(50, 36, '.', (k) => {
      k.ragged('top', 'T', 3, 11).ragged('left', 'T', 3, 12).ragged('bottom', 'T', 2, 13).ragged('right', 'T', 3, 14);
      // river and banks
      k.rect(35, 0, 6, 36, '~');
      k.vline(34, 0, 35, '"').vline(41, 0, 35, '"');
      k.rect(33, 3, 1, 6, '"').rect(42, 20, 1, 8, '"');
      k.rect(35, 30, 6, 6, '~');
      // far bank clearing
      k.rect(42, 10, 6, 12, '.');
      k.scatter(',', 10, 5, [42, 10, 6, 12], '.');
      // paths
      k.path([[22, 0], [22, 17]], ':', 2);
      k.rect(16, 14, 13, 7, '=');
      k.path([[28, 17], [34, 17]], ':', 2);
      k.path([[22, 20], [22, 30], [0, 30]], ':', 2);
      k.path([[16, 17], [11, 17], [11, 16]], ':', 1);
      k.path([[21, 9], [21, 13]], ':', 1);
      k.path([[30, 16], [30, 16]], ':', 1);
      k.path([[11, 25], [11, 29]], ':', 1);
      k.path([[29, 20], [29, 26]], ':', 1);
      k.path([[7, 29], [7, 28]], ':', 1);
      k.path([[17, 29], [17, 28]], ':', 1);
      k.path([[5, 9], [5, 12], [15, 12]], ':', 1);
      k.path([[42, 17], [45, 17], [45, 16]], ':', 1);
      // bridge (planks); the far end is broken until the mill is settled
      k.hline(34, 41, 17, 'b', 2);
      // pier
      k.rect(33, 25, 2, 1, ':');
      // flowers and tall grass
      k.scatter(',', 26, 21, [3, 3, 30, 30], '.');
      k.scatter(';', 14, 22, [3, 3, 30, 30], '.');
      k.scatter('o', 6, 23, [3, 3, 30, 28], '.');
      k.scatter('T', 5, 24, [42, 2, 6, 8], '.');
      k.scatter('T', 4, 25, [42, 23, 6, 10], '.');
    }),
    structs: [
      { type: 'house', x: 18, y: 5, w: 7, h: 4, roof: 'tile', wall: 'stone', door: 3, windows: [1, 5], to: 'rw.hall', spawn: [5, 8], lit: true },
      { type: 'house', x: 28, y: 12, w: 5, h: 4, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4], chimney: true, to: 'rw.tea', spawn: [4, 7], sign: true, signX: 1 },
      { type: 'house', x: 9, y: 12, w: 5, h: 4, roof: 'thatch', door: 2, windows: [0, 4], to: 'rw.apoth', spawn: [4, 7] },
      { type: 'house', x: 26, y: 22, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1], to: 'rw.warehouse', spawn: [5, 7] },
      { type: 'house', x: 9, y: 22, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4], chimney: true, to: 'rw.carpenter', spawn: [4, 6] },
      { type: 'house', x: 3, y: 6, w: 4, h: 3, roof: 'thatch', door: 2, windows: [0], to: 'rw.house1', spawn: [3, 6] },
      { type: 'house', x: 5, y: 26, w: 4, h: 3, roof: 'thatch', door: 2, windows: [0, 3] },
      { type: 'house', x: 15, y: 26, w: 5, h: 3, roof: 'thatch', door: 2, windows: [0, 4], chimney: true, to: 'rw.house2', spawn: [4, 6] },
      { type: 'house', x: 43, y: 13, w: 4, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 3], to: 'rw.ferry', spawn: [3, 6] },
    ],
    props: [
      { p: 'well', x: 20, y: 17 },
      { p: 'noticeboard', x: 24, y: 14, scene: 'rw.board' },
      { p: 'sign', x: 23, y: 21, scene: 'rw.sign_square' },
      { p: 'signblank', x: 2, y: 29, scene: 'rw.sign_road', if: '!rw_sign_fixed' },
      { p: 'sign', x: 2, y: 29, scene: 'rw.sign_road_fixed', if: 'rw_sign_fixed' },
      { p: 'lantern', x: 24, y: 10, o: { lit: true } },
      { p: 'deadlantern', x: 20, y: 22, scene: 'rw.lantern_south', if: '!rw_lantern_s' },
      { p: 'lantern', x: 20, y: 22, if: 'rw_lantern_s' },
      { p: 'deadlantern', x: 32, y: 18, scene: 'rw.lantern_bridge', if: '!rw_lantern_b' },
      { p: 'lantern', x: 32, y: 18, if: 'rw_lantern_b' },
      { p: 'lantern', x: 20, y: 2 },
      { p: 'barrel', x: 32, y: 23 }, { p: 'crate', x: 33, y: 22 }, { p: 'crate', x: 25, y: 25 },
      { p: 'pier', x: 34, y: 25 }, { p: 'pier', x: 35, y: 25 },
      { p: 'boat', x: 35, y: 26, block: false },
      { p: 'laundry', x: 4, y: 23 },
      { p: 'bench', x: 17, y: 14 },
      { p: 'flowerpot', x: 14, y: 15 }, { p: 'flowerpot', x: 27, y: 15 },
      { p: 'cart', x: 12, y: 18 },
      { p: 'stump', x: 8, y: 17 },
      { p: 'hay', x: 14, y: 21 },
      { p: 'teaset', x: 33, y: 16, scene: 'rw.teatable' },
      { p: 'water', x: 38, y: 17, if: '!bridge_fixed' }, { p: 'water', x: 39, y: 17, if: '!bridge_fixed' }, { p: 'water', x: 40, y: 17, if: '!bridge_fixed' },
      { p: 'water', x: 38, y: 18, if: '!bridge_fixed' }, { p: 'water', x: 39, y: 18, if: '!bridge_fixed' }, { p: 'water', x: 40, y: 18, if: '!bridge_fixed' },
      { p: 'stone_marker', x: 46, y: 11, scene: 'rw.far_marker' },
    ],
    npcs: [],
    exits: [
      { x: 22, y: 0, w: 2, h: 1, to: 'rw.millroad', tx: 10, ty: 22, dir: 'up', if: 'rw_mill_open' },
      { x: 0, y: 30, w: 1, h: 2, to: 'rw.road', tx: 30, ty: 9, dir: 'left' },
    ],
    triggers: [
      { x: 22, y: 1, w: 2, h: 1, scene: 'rw.mill_blocked', if: '!rw_mill_open' },
      { x: 0, y: 30, w: 1, h: 2, scene: 'rw.leave_early', if: '!departed&rw_arrived' },
    ],
    spawn: { default: [22, 30, 'up'] },
  };
  // ---- simple interiors --------------------------------------------------------------
  function interior(id, name, w, h, doorX, backTo, backXY, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', music: null, noTravel: true,
      terrain: K.room(w, h, '_', doorX),
      props: [{ p: 'exitmat', x: doorX, y: h - 2 }],
      npcs: [],
      exits: [{ x: doorX, y: h - 1, to: backTo, tx: backXY[0], ty: backXY[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  interior('rw.hall', T('Lantern Hall', '{灯|あか}り{堂|どう}'), 11, 10, 5, 'rw.village', [21, 9], {
    terrain: K.build(11, 10, '#', (k) => { k.rect(1, 2, 9, 7, '_'); k.rect(3, 3, 5, 4, 'k'); k.set(5, 9, '_'); }),
    props: [
      { p: 'exitmat', x: 5, y: 8 },
      { p: 'shrine', x: 4, y: 2, scene: 'rw.hall_shrine' },
      { p: 'shelf', x: 1, y: 3 }, { p: 'shelf', x: 9, y: 3 },
      { p: 'lantern', x: 1, y: 6 }, { p: 'lantern', x: 9, y: 6 },
      { p: 'bookpile', x: 1, y: 7 }, { p: 'desk', x: 7, y: 7, scene: 'rw.hall_desk' },
    ],
    ambient: { dark: 0.35, playerLight: 40 },
  });
  interior('rw.tea', T("Hana's Teahouse", 'ハナ の {茶屋|ちゃや}'), 9, 9, 4, 'rw.village', [30, 16], {
    props: [
      { p: 'exitmat', x: 4, y: 7 },
      { p: 'counter', x: 1, y: 3, across: true }, { p: 'stove', x: 6, y: 2 }, { p: 'shelf', x: 7, y: 2 },
      { p: 'teaset', x: 2, y: 6, scene: 'rw.tea_cups' }, { p: 'chair', x: 1, y: 6 }, { p: 'chair', x: 3, y: 6 },
      { p: 'smalltable', x: 6, y: 5 }, { p: 'chair', x: 7, y: 5 },
      { p: 'bed', x: 7, y: 6, scene: 'rw.tea_bed' },
    ],
  });
  interior('rw.apoth', T("Mio's Apothecary", 'ミオ の {薬屋|くすりや}'), 9, 9, 4, 'rw.village', [11, 16], {
    props: [
      { p: 'exitmat', x: 4, y: 7 },
      { p: 'bottles', x: 1, y: 2, o: { labels: false }, if: '!rw_bottles_done', scene: 'rw.bottles_look' },
      { p: 'bottles', x: 1, y: 2, if: 'rw_bottles_done' },
      { p: 'bottles', x: 2, y: 2, o: { labels: false }, if: '!rw_bottles_done', scene: 'rw.bottles_look' },
      { p: 'bottles', x: 2, y: 2, if: 'rw_bottles_done' },
      { p: 'bottles', x: 6, y: 2 }, { p: 'shelf', x: 7, y: 2 },
      { p: 'table', x: 3, y: 4, scene: 'rw.apoth_table' }, { p: 'pot', x: 7, y: 6 }, { p: 'glassware', x: 1, y: 5 },
    ],
  });
  interior('rw.warehouse', T('River Warehouse', '{川|かわ}の{倉庫|そうこ}'), 11, 9, 5, 'rw.village', [29, 26], {
    terrain: K.build(11, 9, '#', (k) => { k.rect(1, 2, 9, 6, '_'); k.set(5, 8, '_'); }),
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'crate', x: 1, y: 2 }, { p: 'crate', x: 2, y: 2 }, { p: 'crate', x: 1, y: 3 }, { p: 'barrel', x: 8, y: 2 }, { p: 'barrel', x: 9, y: 2 },
      { p: 'crate', x: 8, y: 5, scene: 'rw.crates' }, { p: 'crate', x: 9, y: 5, scene: 'rw.crates' }, { p: 'net', x: 3, y: 2 },
      // "watch your step: the third floorboard is gone" (Nao, rw.nao_first) — drawn in 12_floorgap.js
      { p: 'rw_floorgap', x: 5, y: 5 },
    ],
  });
  interior('rw.carpenter', T("Bunta's Workshop", 'ブンタ の {工房|こうぼう}'), 9, 8, 4, 'rw.village', [11, 25], {
    props: [{ p: 'exitmat', x: 4, y: 6 }, { p: 'table', x: 1, y: 3, scene: 'rw.bench_tools' }, { p: 'anvil', x: 6, y: 3 }, { p: 'shelf', x: 7, y: 2 }, { p: 'stump', x: 6, y: 5 }],
  });
  interior('rw.house1', T("Oto's House", 'オト の {家|いえ}'), 8, 8, 3, 'rw.village', [5, 9], {
    props: [{ p: 'exitmat', x: 3, y: 6 }, { p: 'bed', x: 1, y: 2 }, { p: 'smalltable', x: 5, y: 3 }, { p: 'pot', x: 6, y: 5 }, { p: 'crate', x: 6, y: 2, scene: 'rw.boots' }],
  });
  interior('rw.house2', T("Kiku's House", 'キク の {家|いえ}'), 9, 8, 4, 'rw.village', [17, 29], {
    props: [{ p: 'exitmat', x: 4, y: 6 }, { p: 'bed', x: 7, y: 2 }, { p: 'table', x: 1, y: 3 }, { p: 'loom', x: 4, y: 2 }, { p: 'crate', x: 1, y: 5, scene: 'rw.kiku_plane' }],
  });
  interior('rw.ferry', T("Kōji's Ferry House", 'コウジ の {渡|わた}し{小屋|ごや}'), 8, 8, 3, 'rw.village', [45, 16], {
    props: [{ p: 'exitmat', x: 3, y: 6 }, { p: 'bed', x: 1, y: 2 }, { p: 'smalltable', x: 5, y: 3, scene: 'rw.ferry_cup' }, { p: 'net', x: 4, y: 2 }],
  });

  // ---- arrival road -------------------------------------------------------------------
  C.maps['rw.road'] = {
    name: { en: 'The Lantern Road', jp: '{灯|ひ}の{道|みち}' }, region: 'reedwake', music: 'road',
    ambient: { weather: null },
    terrain: K.build(32, 18, '.', (k) => {
      k.ragged('top', 'T', 4, 31).ragged('bottom', 'T', 4, 32);
      k.path([[0, 9], [31, 9]], ':', 2);
      k.scatter(',', 18, 33, [0, 4, 32, 10], '.');
      k.scatter(';', 12, 34, [0, 4, 32, 10], '.');
      k.scatter('r', 3, 35, [0, 4, 32, 10], '.');
      k.rect(12, 4, 6, 3, '~').rect(11, 5, 1, 2, '"').rect(18, 4, 1, 3, '"');
    }),
    props: [
      { p: 'lantern', x: 5, y: 8 }, { p: 'deadlantern', x: 14, y: 8, scene: 'rw.road_lantern', if: '!rw_road_lit' }, { p: 'lantern', x: 14, y: 8, scene: 'rw.road_lantern', if: 'rw_road_lit' }, { p: 'lantern', x: 24, y: 8 },
      { p: 'stone_marker', x: 20, y: 11, scene: 'rw.road_marker' },
    ],
    exits: [
      { x: 31, y: 9, w: 1, h: 2, to: 'rw.village', tx: 1, ty: 30, dir: 'right', locked: 'rw.road_mist', unlock: 'rw_road_lit' },
      { x: 0, y: 9, w: 1, h: 2, to: 'sg.road', sp: 'from_prev', dir: 'left', if: 'departed' },
    ],
    triggers: [{ x: 0, y: 9, w: 1, h: 2, scene: 'rw.road_west_blocked', if: '!departed' }],
    spawn: { default: [3, 9, 'right'], from_next: [2, 10, 'right'] },
  };
})(RB.content, RB.mapkit);
