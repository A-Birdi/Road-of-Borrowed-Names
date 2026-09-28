/* Chapter 5 maps: the Lantern Road above Lanternfall, the town, the garden
 * quarter, the sluice shore and the town's interiors. The drowned bell
 * tower is in 12_tower.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TOWN_MUSIC = [{ if: 'lf_bell_rung', id: 'lanternfall' }, { id: 'lanternfall' }];

  // ---- the road down from the mountains -----------------------------------------------
  C.maps['lf.road'] = {
    name: T('The Lantern Road above Lanternfall', '{灯|ひ} の {道|みち} ・ {灯落|ひおち}{坂|ざか}'), region: 'lanternfall', music: 'road',
    ambient: { weather: 'leaves' },
    terrain: K.build(36, 22, '.', (k) => {
      k.ragged('top', '^', 3, 51).ragged('bottom', 'T', 3, 52);
      k.rect(0, 0, 36, 1, '^');
      k.scatter('Q', 14, 53, [0, 3, 36, 5], '.');
      k.path([[0, 12], [35, 12]], ':', 2);
      k.path([[24, 12], [24, 0]], ':', 2);
      k.rect(24, 0, 2, 4, '=');
      k.scatter(',', 16, 54, [0, 8, 36, 12], '.');
      k.scatter(';', 10, 55, [0, 8, 36, 12], '.');
      k.scatter('r', 4, 56, [0, 6, 36, 14], '.');
      k.rect(29, 15, 5, 3, 'w').rect(30, 16, 3, 1, '~');
      k.set(28, 16, '"').set(34, 15, '"').set(29, 18, '"');
      k.hline(0, 35, 11, '.'); k.path([[0, 12], [35, 12]], ':', 2);
    }),
    props: [
      { p: 'lantern', x: 6, y: 11 }, { p: 'lantern', x: 16, y: 11 }, { p: 'lantern', x: 31, y: 11 },
      { p: 'deadlantern', x: 23, y: 10, if: '!ch5_done', scene: 'lf.road_lantern' },
      { p: 'lantern', x: 23, y: 10, if: 'ch5_done', scene: 'lf.road_lantern' },
      { p: 'sign', x: 27, y: 14, scene: 'lf.road_sign' },
      { p: 'stone_marker', x: 10, y: 14, scene: 'lf.road_marker' },
      { p: 'bench', x: 17, y: 15, scene: 'lf.road_bench' },
    ],
    npcs: [],
    exits: [
      { x: 0, y: 12, w: 1, h: 2, to: 'sb.road', sp: 'from_next', dir: 'left' },
      { x: 24, y: 0, w: 2, h: 1, to: 'sa.road', sp: 'from_prev', dir: 'up', if: 'ch5_done' },
      { x: 35, y: 12, w: 1, h: 2, to: 'lf.town', tx: 1, ty: 17, dir: 'right' },
    ],
    triggers: [
      { x: 24, y: 1, w: 2, h: 1, scene: 'lf.road_north_locked', if: '!ch5_done' },
    ],
    onEnter: [{ scene: 'lf.arrive', if: '!lf_arrived' }],
    spawn: { default: [3, 12, 'right'], from_prev: [2, 13, 'right'], from_next: [24, 3, 'down'] },
  };

  // ---- Lanternfall ------------------------------------------------------------------------
  C.maps['lf.town'] = {
    name: T('Lanternfall', '{灯落|ひおち}'), region: 'lanternfall', place: 'lanternfall', travel: 'lanternfall',
    music: TOWN_MUSIC,
    ambient: { weather: null, tint: 'rgba(90,80,160,0.06)' },
    legend: { t: { tile: 'road', prop: 'lamppost' } },
    terrain: K.build(52, 40, '.', (k) => {
      k.ragged('top', 'T', 2, 61).ragged('left', 'T', 2, 62);
      k.rect(0, 39, 52, 1, 'T');
      // main avenue and the west gate
      k.rect(0, 16, 52, 4, '=');
      // civic forecourts
      k.rect(4, 11, 14, 5, '=');
      k.rect(24, 9, 4, 7, '=');
      k.rect(38, 10, 4, 6, '=');
      // council gardens (tidy beds)
      for (let y = 10; y <= 14; y += 2) { k.hline(19, 22, y, ','); k.hline(29, 32, y, ','); }
      k.set(19, 11, 'o').set(22, 11, 'o').set(29, 11, 'o').set(32, 11, 'o');
      k.set(19, 13, 'o').set(22, 13, 'o').set(29, 13, 'o').set(32, 13, 'o');
      // north-east park
      k.scatter('T', 6, 63, [44, 3, 7, 11], '.');
      k.scatter(',', 10, 64, [43, 3, 8, 12], '.');
      // grand canal with embankments and two bridges
      k.rect(3, 21, 49, 3, '~');
      k.rect(0, 20, 52, 1, '=');
      k.rect(0, 24, 42, 1, '=');
      k.rect(12, 21, 2, 3, 'B');
      k.rect(33, 21, 2, 3, 'B');
      k.rect(0, 21, 3, 3, '=');
      // east canal down to the lake
      k.rect(42, 24, 3, 16, '~');
      k.rect(45, 24, 7, 15, '.');
      k.scatter('T', 8, 65, [46, 25, 6, 13], '.');
      // south quarter lanes
      k.rect(0, 31, 42, 2, '=');
      k.rect(11, 25, 2, 6, '=');
      k.rect(20, 25, 2, 6, '=');
      k.rect(28, 25, 2, 6, '=');
      k.rect(38, 25, 4, 15, '=');
      k.rect(3, 36, 35, 2, '=');
      k.rect(10, 33, 2, 3, '=').rect(19, 33, 2, 3, '=').rect(29, 33, 2, 3, '=');
      k.rect(42, 36, 3, 2, 'b');
      k.rect(45, 28, 5, 1, ':').rect(45, 36, 5, 2, ':').rect(47, 28, 1, 9, ':');
      k.scatter(',', 14, 66, [0, 25, 38, 14], '.');
      // lampposts along the avenue and the embankment
      for (const x of [3, 9, 15, 21, 30, 36, 44, 49]) { k.set(x, 16, 't'); k.set(x, 19, 't'); }
      for (const x of [5, 16, 23, 30]) k.set(x, 24, 't');
      for (const x of [4, 14, 24, 33]) k.set(x, 31, 't');
      for (const x of [2, 20, 36]) k.set(x, 20, 't');
      // gate posts
      k.set(0, 15, 'T').set(0, 20, '=');
    }),
    structs: [
      { type: 'house', x: 5, y: 4, w: 12, h: 7, roof: 'indigo', wall: 'stone', door: 6, windows: [1, 3, 9, 11], to: 'lf.records', spawn: [8, 10], sign: true, signX: 5 },
      { type: 'house', x: 21, y: 2, w: 10, h: 7, roof: 'indigo', wall: 'stone', door: 5, windows: [1, 3, 7, 9], to: 'lf.council', spawn: [7, 8] },
      { type: 'house', x: 36, y: 5, w: 8, h: 5, roof: 'indigo', door: 3, windows: [1, 5, 6], to: 'lf.clerks', spawn: [6, 7] },
      { type: 'house', x: 3, y: 26, w: 8, h: 5, roof: 'indigo', wall: 'wood', door: 5, windows: [1, 3], chimney: true, lit: true, sign: true, signX: 2, to: 'lf.inn', spawn: [6, 8] },
      { type: 'house', x: 14, y: 26, w: 6, h: 4, roof: 'tile', door: 4, windows: [1, 2], sign: true, signX: 1, to: 'lf.cafe', spawn: [5, 7] },
      { type: 'house', x: 22, y: 26, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1, 5], chimney: true, to: 'lf.bakery', spawn: [3, 6] },
      { type: 'house', x: 31, y: 26, w: 6, h: 4, roof: 'indigo', wall: 'wood', door: 4, windows: [1, 2], sign: true, signX: 1, to: 'lf.ferry', spawn: [5, 7] },
      { type: 'house', x: 4, y: 33, w: 5, h: 3, roof: 'indigo', door: 4, windows: [1] },
      { type: 'house', x: 13, y: 33, w: 5, h: 3, roof: 'tile', wall: 'wood', door: 4, windows: [1, 2] },
      { type: 'house', x: 22, y: 33, w: 6, h: 3, roof: 'indigo', door: 5, windows: [1, 3] },
      { type: 'house', x: 31, y: 33, w: 5, h: 3, roof: 'tile', door: 4, windows: [1] },
    ],
    props: [
      { p: 'noticeboard', x: 26, y: 17, scene: 'lf.board' },
      { p: 'sign', x: 1, y: 15, scene: 'lf.gate_sign' },
      { p: 'statue', x: 20, y: 12, scene: 'lf.statue' },
      { p: 'flowerpot', x: 4, y: 11 }, { p: 'flowerpot', x: 17, y: 11 },
      { p: 'flowerpot', x: 37, y: 10 }, { p: 'flowerpot', x: 42, y: 10 },
      { p: 'bench', x: 45, y: 9 }, { p: 'bench', x: 48, y: 33, scene: 'lf.bench_canal' },
      { p: 'lf_grate', x: 7, y: 20, scene: 'lf.grate' }, { p: 'lf_grate', x: 27, y: 24, scene: 'lf.grate' }, { p: 'lf_grate', x: 46, y: 20, scene: 'lf.grate' },
      { p: 'mailbox', x: 30, y: 30, scene: 'lf.mailbox' },
      { p: 'pier', x: 41, y: 33 }, { p: 'pier', x: 41, y: 34 },
      { p: 'boat', x: 42, y: 34, scene: 'lf.canal_boat' },
      { p: 'barrel', x: 30, y: 28 }, { p: 'crate', x: 13, y: 26 }, { p: 'crate', x: 37, y: 28 },
      { p: 'laundry', x: 5, y: 38 },
      { p: 'well', x: 48, y: 30 },
      { p: 'sign', x: 40, y: 38, scene: 'lf.sign_sluice' },
      { p: 'sign', x: 50, y: 15, scene: 'lf.sign_gardens' },
    ],
    npcs: [
      { id: 'lf_hayato', x: 3, y: 17, dir: 'left', if: '!lf_town_intro', talk: 'lf.town_intro' },
      { id: 'lf_nagi', x: 13, y: 18, dir: 'down', wander: 3, talk: [{ if: 'post', scene: 'lf.nagi_post' }, { if: 'lf_bell_rung', scene: 'lf.nagi_after' }, { scene: 'lf.nagi' }] },
      { id: 'lf_kei', x: 16, y: 25, dir: 'down', wander: 2, if: '!lf_bell_rung', talk: 'lf.kei' },
      { id: 'lf_kei', x: 27, y: 18, dir: 'down', wander: 3, if: 'lf_bell_rung', talk: [{ if: 'post', scene: 'lf.kei_post' }, { scene: 'lf.kei_after' }] },
      { id: 'lf_tsuya', x: 40, y: 33, dir: 'right', talk: [{ if: 'quest.lf_timetable=active', scene: 'lf.tsuya' }, { if: 'post', scene: 'lf.tsuya_post' }, { if: 'quest.lf_timetable=done', scene: 'lf.tsuya_done' }, { scene: 'lf.tsuya' }] },
      { id: 'nao', x: 39, y: 30, dir: 'down', if: 'comp!=nao&!lf_nao_cameo_done', talk: [{ if: 'lf_bell_rung', scene: 'lf.naoc_after' }, { scene: 'lf.naoc' }] },
    ],
    exits: [
      { x: 0, y: 16, w: 1, h: 4, to: 'lf.road', tx: 34, ty: 12, dir: 'left' },
      { x: 51, y: 16, w: 1, h: 4, to: 'lf.gardens', tx: 1, ty: 11, dir: 'right' },
      { x: 38, y: 39, w: 4, h: 1, to: 'lf.sluice', tx: 15, ty: 1, dir: 'down' },
    ],
    triggers: [
      { x: 2, y: 16, w: 1, h: 4, scene: 'lf.town_intro', if: '!lf_town_intro' },
    ],
    onEnter: [
      { scene: 'lf.after_town', if: 'lf_bell_rung&!lf_after_town' },
      { scene: 'lf.mio_start', if: 'comp=mio&!quest.lf_mio&quest.lf_main>=2&!lf_bell_rung' },
    ],
    spawn: { default: [2, 17, 'right'] },
  };

  // ---- the garden quarter ---------------------------------------------------------------------
  C.maps['lf.gardens'] = {
    name: T('The Garden Quarter', '{庭|にわ} の {町|まち}'), region: 'lanternfall', music: TOWN_MUSIC,
    ambient: { weather: 'leaves' },
    terrain: K.build(34, 24, '.', (k) => {
      k.ragged('top', 'T', 2, 71).ragged('right', 'T', 3, 72).ragged('bottom', 'T', 2, 73);
      k.rect(0, 10, 27, 3, ':');
      k.rect(6, 6, 1, 4, ':').rect(21, 6, 1, 4, ':');
      // Kōhei's and Kinu's vegetable plots either side of the disputed strip
      k.rect(2, 7, 4, 2, 'F');
      k.rect(22, 7, 4, 2, 'F');
      k.scatter(',', 7, 74, [9, 3, 10, 6], '.');
      // tidy topiary garden
      k.rect(2, 14, 23, 8, '.');
      for (let x = 3; x <= 24; x += 3) { k.set(x, 15, 'o'); k.set(x, 20, 'o'); }
      k.hline(3, 24, 17, ','); k.hline(3, 24, 18, ',');
      k.rect(12, 13, 2, 9, ':');
      // pond
      k.rect(26, 15, 5, 4, 'w').rect(27, 16, 3, 2, '~');
      k.set(25, 15, '"').set(31, 16, '"').set(26, 19, '"');
    }),
    structs: [
      { type: 'house', x: 2, y: 2, w: 6, h: 4, roof: 'indigo', wall: 'wood', door: 4, windows: [1, 2] },
      { type: 'house', x: 20, y: 2, w: 6, h: 4, roof: 'tile', door: 1, windows: [3, 4], chimney: true },
    ],
    props: [
      // the disputed strip: the fence moves every morning until they settle it
      { p: 'fence', x: 13, y: 5, if: '!quest.lf_fence=done' }, { p: 'fence', x: 13, y: 6, if: '!quest.lf_fence=done' },
      { p: 'fence', x: 13, y: 7, if: '!quest.lf_fence=done' }, { p: 'fence', x: 13, y: 8, if: '!quest.lf_fence=done' },
      { p: 'hole', x: 11, y: 6, if: '!quest.lf_fence=done', scene: 'lf.fence_holes' }, { p: 'hole', x: 16, y: 7, if: '!quest.lf_fence=done', scene: 'lf.fence_holes' },
      { p: 'orchard', x: 14, y: 4, scene: 'lf.persimmon' },
      { p: 'bench', x: 13, y: 7, if: 'quest.lf_fence=done', scene: 'lf.fence_bench' },
      { p: 'flowerpot', x: 11, y: 8, if: 'quest.lf_fence=done' }, { p: 'flowerpot', x: 16, y: 8, if: 'quest.lf_fence=done' },
      { p: 'statue', x: 16, y: 17, scene: 'lf.garden_statue' },
      { p: 'shrine', x: 28, y: 10, scene: 'lf.garden_shrine' },
      { p: 'sign', x: 1, y: 9, scene: 'lf.sign_town' },
    ],
    npcs: [
      { id: 'lf_kohei', x: 10, y: 7, dir: 'right', talk: [{ if: 'quest.lf_fence=active', scene: 'lf.fence_talk' }, { if: 'post', scene: 'lf.kohei_post' }, { if: 'quest.lf_fence=done', scene: 'lf.kohei_done' }, { scene: 'lf.fence_talk' }] },
      { id: 'lf_kinu', x: 17, y: 7, dir: 'left', talk: [{ if: 'quest.lf_fence=active', scene: 'lf.fence_talk' }, { if: 'post', scene: 'lf.kinu_post' }, { if: 'quest.lf_fence=done', scene: 'lf.kinu_done' }, { scene: 'lf.fence_talk' }] },
      { id: 'lf_shu', x: 8, y: 19, dir: 'down', wander: 3, talk: [{ if: 'post', scene: 'lf.shu_post' }, { if: 'lf_bell_rung', scene: 'lf.shu_after' }, { scene: 'lf.shu' }] },
    ],
    exits: [{ x: 0, y: 10, w: 1, h: 3, to: 'lf.town', tx: 50, ty: 17, dir: 'left' }],
    spawn: { default: [1, 11, 'right'] },
  };

  // ---- the sluice shore and the drowned quarter -------------------------------------------------------
  C.maps['lf.sluice'] = {
    name: T('The Sluice Shore', '{水門|すいもん} の {岸|きし}'), region: 'lanternfall',
    music: [{ if: 'lf_bell_rung', id: 'lanternfall' }, { id: 'mystery' }],
    ambient: { weather: null, tint: 'rgba(40,60,120,0.08)' },
    terrain: K.build(34, 28, '.', (k) => {
      k.ragged('top', 'T', 2, 81).ragged('left', 'T', 2, 82);
      k.rect(13, 0, 4, 12, '=');
      // the lake
      k.rect(0, 15, 34, 13, '~');
      k.rect(0, 13, 34, 2, 's');
      k.scatter('s', 12, 84, [0, 12, 34, 2], '.');
      // drowned quarter: old lanes in the shallows
      k.rect(2, 15, 9, 6, 'w');
      k.rect(3, 17, 7, 1, '~');
      k.rect(26, 14, 6, 3, 'w');
      k.rect(22, 16, 6, 3, 'w');
      // the old sluice: an outlet channel with a stone apron
      k.rect(0, 7, 6, 1, '+');
      k.rect(0, 8, 5, 7, '~');
      k.rect(5, 8, 1, 5, '+');
      k.rect(6, 9, 2, 3, '+');
      // Tokuji's pier
      k.rect(18, 13, 2, 6, '_');
      k.scatter(',', 10, 85, [8, 3, 24, 9], '.');
      k.scatter('"', 8, 86, [0, 12, 34, 3], 's');
    }),
    structs: [
      { type: 'house', x: 21, y: 4, w: 5, h: 4, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4], chimney: true, to: 'lf.tokuji', spawn: [3, 6] },
    ],
    props: [
      { p: 'lf_sluicegate', x: 0, y: 10, scene: 'lf.sluice_gate' },
      { p: 'lf_wheel', x: 6, y: 8, scene: 'lf.sluice_wheel' },
      { p: 'stone_marker', x: 10, y: 10, scene: 'lf.memorial' },
      { p: 'flowerpot', x: 9, y: 11 }, { p: 'flowerpot', x: 11, y: 11 },
      { p: 'pillar', x: 4, y: 16 }, { p: 'pillar', x: 8, y: 19 }, { p: 'deadlantern', x: 6, y: 16, scene: 'lf.drowned_lamp', o: { staysDark: true } },
      { p: 'lf_sunktower', x: 24, y: 19, scene: 'lf.tower_view' },
      { p: 'pier', x: 18, y: 17 }, { p: 'pier', x: 19, y: 17 }, { p: 'pier', x: 18, y: 18 }, { p: 'pier', x: 19, y: 18 },
      { p: 'boat', x: 18, y: 19, scene: 'lf.boat_to_tower' },
      { p: 'net', x: 26, y: 9 }, { p: 'barrel', x: 20, y: 9 },
      { p: 'sign', x: 17, y: 2, scene: 'lf.sign_sluice' },
    ],
    npcs: [
      { id: 'lf_tokuji', x: 17, y: 11, dir: 'down', talk: [{ if: 'post', scene: 'lf.tokuji_post' }, { if: 'lf_bell_rung', scene: 'lf.tokuji_after' }, { if: 'lf_tokuji_told', scene: 'lf.tokuji_again' }, { if: 'quest.lf_main>=5', scene: 'lf.tokuji_story' }, { scene: 'lf.tokuji_early' }] },
    ],
    exits: [{ x: 13, y: 0, w: 4, h: 1, to: 'lf.town', tx: 39, ty: 38, dir: 'up' }],
    spawn: { default: [15, 1, 'down'], from_tower: [19, 16, 'up'] },
  };

  // ---- interiors -----------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, backXY, extra) {
    C.maps[id] = Object.assign({
      name, region: 'lanternfall', music: null, noTravel: true,
      terrain: K.room(w, h, '_', doorX),
      props: [{ p: 'exitmat', x: doorX, y: h - 2 }],
      npcs: [],
      exits: [{ x: doorX, y: h - 1, to: 'lf.town', tx: backXY[0], ty: backXY[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }

  interior('lf.records', T('Public Records Hall', '{記録館|きろくかん}'), 17, 12, 8, [11, 11], {
    music: 'mystery',
    terrain: K.build(17, 12, '#', (k) => {
      k.rect(1, 2, 15, 9, 'p');
      k.rect(5, 6, 7, 5, 'k');
      k.set(8, 11, 'p');
      k.rect(1, 2, 1, 5, 'l').rect(15, 2, 1, 5, 'l');
      k.rect(3, 2, 3, 1, 'l').rect(11, 2, 3, 1, 'l');
    }),
    props: [
      { p: 'exitmat', x: 8, y: 10 },
      { p: 'counter', x: 6, y: 4, scene: 'lf.records_counter' },
      { p: 'desk', x: 2, y: 8, scene: 'lf.records_ledger' },
      { p: 'desk', x: 13, y: 8, scene: 'lf.records_plots' },
      { p: 'bookpile', x: 12, y: 4 }, { p: 'bookpile', x: 4, y: 4 },
      { p: 'stairs', x: 14, y: 3, scene: 'lf.stacks_door', if: '!lf_stacks_open' },
      { p: 'stairs', x: 14, y: 3, if: 'lf_stacks_open' },
      { p: 'noticeboard', x: 2, y: 3, scene: 'lf.records_notice' },
      { p: 'lantern', x: 5, y: 9 }, { p: 'lantern', x: 11, y: 9 },
    ],
    npcs: [
      { id: 'lf_tadashi', x: 7, y: 3, dir: 'down', talk: [{ if: 'comp=mio&quest.lf_mio>=2&!quest.lf_mio=done', scene: 'lf.mio_refuse' }, { if: 'post', scene: 'lf.tadashi_post' }, { if: 'lf_bell_rung', scene: 'lf.tadashi_after' }, { scene: 'lf.tadashi' }] },
      { id: 'lf_hayato', x: 10, y: 5, dir: 'down', if: 'lf_town_intro', talk: [{ if: 'post', scene: 'lf.hayato_post' }, { if: 'quest.lf_form=done', scene: 'lf.hayato_done' }, { scene: 'lf.hayato' }] },
    ],
    exits: [
      { x: 8, y: 11, to: 'lf.town', tx: 11, ty: 11, dir: 'down' },
      { x: 14, y: 3, to: 'lf.stacks', tx: 2, ty: 3, dir: 'down', if: 'lf_stacks_open' },
    ],
    ambient: { dark: 0.12, playerLight: 50 },
    spawn: { default: [8, 10, 'up'] },
  });

  interior('lf.council', T('Council Chamber', '{議会|ぎかい}{堂|どう}'), 15, 10, 7, [26, 9], {
    music: 'mystery',
    terrain: K.build(15, 10, '#', (k) => { k.rect(1, 2, 13, 7, '_'); k.rect(4, 3, 7, 4, 'k'); k.set(7, 9, '_'); }),
    props: [
      { p: 'exitmat', x: 7, y: 8 },
      { p: 'table', x: 6, y: 4, across: true, scene: 'lf.council_table' }, { p: 'chair', x: 5, y: 4 }, { p: 'chair', x: 8, y: 4 },
      { p: 'bench', x: 2, y: 6 }, { p: 'bench', x: 11, y: 6 },
      { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 13, y: 2 },
      { p: 'desk', x: 11, y: 2, scene: 'lf.council_stamp' },
      { p: 'lantern', x: 3, y: 2 }, { p: 'lantern', x: 9, y: 2 },
    ],
    npcs: [
      { id: 'lf_yae', x: 6, y: 3, dir: 'down', talk: [{ if: 'post', scene: 'lf.yae_post' }, { if: 'lf_bell_rung', scene: 'lf.yae_after' }, { if: 'lf_yae_told', scene: 'lf.yae_again' }, { if: 'item.lf_minutes', scene: 'lf.yae_minutes' }, { scene: 'lf.yae' }] },
    ],
    ambient: { dark: 0.15, playerLight: 50 },
  });

  interior('lf.clerks', T("Clerks' Office", '{事務所|じむしょ}'), 13, 9, 6, [39, 10], {
    props: [
      { p: 'exitmat', x: 6, y: 7 },
      { p: 'desk', x: 1, y: 3, scene: 'lf.clerk_desk' }, { p: 'desk', x: 4, y: 3 }, { p: 'desk', x: 8, y: 3 },
      { p: 'chair', x: 2, y: 4 }, { p: 'chair', x: 9, y: 4 },
      { p: 'shelf', x: 11, y: 2 }, { p: 'bookpile', x: 11, y: 5 }, { p: 'bookpile', x: 1, y: 6 },
      { p: 'mailbox', x: 10, y: 6, scene: 'lf.returned_letters' },
      { p: 'smalltable', x: 7, y: 6, if: 'lf_akari_leave&!post', scene: 'lf.akari_note' },
    ],
    npcs: [
      { id: 'akari', x: 5, y: 4, dir: 'down', if: '!lf_akari_leave|post', talk: [{ if: 'quest.lf_akari>=1&!quest.lf_akari=done', scene: 'lf.akari_letter' }, { if: 'post', scene: 'lf.akari_post' }, { if: 'quest.lf_akari=done', scene: 'lf.akari_done' }, { if: 'lf_bell_rung', scene: 'lf.akari_after' }, { if: 'lf_akari_key', scene: 'lf.akari_again' }, { if: 'quest.lf_main>=2', scene: 'lf.akari_hint' }, { scene: 'lf.akari' }] },
    ],
  });

  interior('lf.inn', T('The Lamplit Inn', '{灯|あか}り{宿|やど}'), 13, 10, 6, [8, 31], {
    music: 'inn',
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'counter', x: 1, y: 4, across: true }, { p: 'shelf', x: 1, y: 2 }, { p: 'stove', x: 4, y: 2 },
      { p: 'bed', x: 10, y: 2, scene: 'lf.inn_bed' }, { p: 'bed', x: 11, y: 2, scene: 'lf.inn_bed' },
      { p: 'table', x: 7, y: 5, scene: 'lf.inn_table' }, { p: 'chair', x: 6, y: 5 }, { p: 'chair', x: 9, y: 5 },
      { p: 'smalltable', x: 2, y: 7 }, { p: 'chair', x: 1, y: 7 },
      { p: 'mat', x: 10, y: 6, scene: 'lf.inn_hall' }, { p: 'mat', x: 11, y: 6, scene: 'lf.inn_hall' },
    ],
    npcs: [
      { id: 'lf_setsu', x: 2, y: 3, dir: 'down', talk: [{ if: 'post', scene: 'lf.setsu_post' }, { if: 'lf_bell_rung', scene: 'lf.setsu_after' }, { scene: 'lf.setsu' }] },
      { id: 'mio', x: 3, y: 7, dir: 'left', if: 'comp!=mio&!lf_mio_cameo_done', talk: [{ if: 'lf_bell_rung', scene: 'lf.mioc_after' }, { scene: 'lf.mioc' }] },
    ],
    spawn: { default: [6, 8, 'up'] },
  });

  interior('lf.cafe', T("Ritsu's Café", 'リツ の {喫茶|きっさ}'), 11, 9, 5, [18, 30], {
    music: 'inn',
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'counter', x: 1, y: 3, across: true }, { p: 'teaset', x: 1, y: 2 }, { p: 'shelf', x: 3, y: 2 }, { p: 'stove', x: 4, y: 2 },
      { p: 'smalltable', x: 7, y: 3, scene: 'lf.cafe_table' }, { p: 'chair', x: 8, y: 3 },
      { p: 'smalltable', x: 7, y: 6 }, { p: 'chair', x: 8, y: 6 },
      { p: 'flowerpot', x: 9, y: 2 },
      { p: 'noticeboard', x: 6, y: 2, scene: 'lf.cafe_menu' },
    ],
    npcs: [
      { id: 'lf_ritsu', x: 2, y: 2, dir: 'down', talk: [{ if: 'post', scene: 'lf.ritsu_post' }, { if: 'lf_bell_rung', scene: 'lf.ritsu_after' }, { scene: 'lf.ritsu' }] },
    ],
    spawn: { default: [5, 7, 'up'] },
  });

  interior('lf.bakery', T("Masaru's Bakery", 'マサル の パン{屋|や}'), 9, 8, 3, [25, 30], {
    props: [
      { p: 'exitmat', x: 3, y: 6 },
      { p: 'stove', x: 1, y: 2 }, { p: 'stove', x: 2, y: 2 }, { p: 'table', x: 5, y: 3, scene: 'lf.bakery_orders' },
      { p: 'crate', x: 7, y: 2 }, { p: 'crate', x: 7, y: 3 }, { p: 'barrel', x: 1, y: 5 },
      { p: 'shelf', x: 4, y: 2 },
    ],
    npcs: [
      { id: 'lf_masaru', x: 3, y: 4, dir: 'down', talk: [{ if: 'post', scene: 'lf.masaru_post' }, { if: 'lf_bell_rung', scene: 'lf.masaru_after' }, { scene: 'lf.masaru' }] },
    ],
    spawn: { default: [3, 6, 'up'] },
  });

  interior('lf.ferry', T('Ferry Office', '{渡|わた}し{場|ば} の {事務所|じむしょ}'), 11, 9, 5, [35, 30], {
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'counter', x: 3, y: 3, across: true }, { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 9, y: 2 },
      { p: 'noticeboard', x: 7, y: 2, scene: 'lf.timetable' },
      { p: 'crate', x: 1, y: 5 }, { p: 'crate', x: 1, y: 6, scene: 'lf.mailsacks' }, { p: 'net', x: 8, y: 6 },
    ],
    npcs: [
      { id: 'umi', x: 4, y: 2, dir: 'down', talk: [{ if: 'comp=nao&lf_bell_rung&!quest.lf_nao=done', scene: 'lf.nao_deliver' }, { if: 'post', scene: 'lf.umi_post' }, { if: 'comp=nao&!lf_bell_rung&quest.lf_nao<1', scene: 'lf.nao_umi_first' }, { if: 'lf_bell_rung', scene: 'lf.umi_after' }, { scene: 'lf.umi' }] },
    ],
    spawn: { default: [5, 7, 'up'] },
  });

  interior('lf.tokuji', T("Tokuji's Hut", 'トクジ の {小屋|こや}'), 8, 8, 3, [23, 8], {
    props: [
      { p: 'exitmat', x: 3, y: 6 },
      { p: 'bed', x: 1, y: 2 }, { p: 'smalltable', x: 5, y: 3, scene: 'lf.tokuji_table' }, { p: 'net', x: 4, y: 2 },
      { p: 'shelf', x: 6, y: 2, scene: 'lf.tokuji_shelf' }, { p: 'pot', x: 6, y: 5 },
    ],
    exits: [{ x: 3, y: 7, to: 'lf.sluice', tx: 23, ty: 8, dir: 'down' }],
  });

  // ---- the basement stacks (a short, dim search) -------------------------------------------------
  C.maps['lf.stacks'] = {
    name: T('Basement Stacks', '{地下|ちか}{書庫|しょこ}'), region: 'lanternfall', music: 'mystery', noTravel: true,
    ambient: { dark: 0.55, playerLight: 46, weather: 'pages' },
    terrain: K.build(24, 16, '#', (k) => {
      k.rect(1, 2, 22, 13, '+');
      k.set(2, 1, '+');
      for (const x of [4, 8, 12, 16]) { k.rect(x, 4, 1, 4, 'L'); k.rect(x, 10, 1, 3, 'L'); }
      k.rect(20, 2, 3, 3, '+');
      k.rect(19, 12, 3, 1, 'L');
    }),
    props: [
      { p: 'stairs', x: 2, y: 2 },
      { p: 'lantern', x: 6, y: 2, o: { lit: true } }, { p: 'deadlantern', x: 14, y: 2 },
      { p: 'lf_conduit', x: 22, y: 6, scene: 'lf.conduit' }, { p: 'lf_conduit', x: 22, y: 7, scene: 'lf.conduit' }, { p: 'lf_conduit', x: 22, y: 8, scene: 'lf.conduit' },
      { p: 'chest', x: 21, y: 2, scene: 'lf.minutes_chest', if: '!item.lf_minutes' },
      { p: 'chest', x: 21, y: 2, o: { open: true }, if: 'item.lf_minutes' },
      { p: 'bookpile', x: 10, y: 8, scene: 'lf.stacks_ledger' }, { p: 'bookpile', x: 6, y: 13 },
      { p: 'desk', x: 13, y: 13, scene: 'lf.stacks_desk' },
      { p: 'crate', x: 1, y: 13 }, { p: 'crate', x: 18, y: 3 },
    ],
    foes: [
      { id: 'st1', enemy: 'lf.stamp', x: 10, y: 6, patrol: 1, aggro: true },
      // (its Hush is answered by すず or こえ, learned later in the chapter: it waits until then)
      { id: 'st2', enemy: 'lf.blot', x: 18, y: 9, patrol: 2, aggro: true, if: 'word.suzu|word.koe' },
    ],
    exits: [{ x: 2, y: 1, to: 'lf.records', tx: 13, ty: 3, dir: 'up' }],
    onEnter: [{ scene: 'lf.stacks_enter' }],
    spawn: { default: [2, 3, 'down'] },
  };
})(RB.content, RB.mapkit);
