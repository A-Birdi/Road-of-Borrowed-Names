/* The Keepers' Road, Chapter 7: the maps (expansion P10; docs/future/work/P10_KEEPERS.md). The road climbs east from
 * Snowbell's road: the Foot of the Road and its waystation teahouse, the Cedar Steps, the hamlet at the Fox Bridge,
 * the Maple Ridge (its fork north to the Shuttered Hall), the Keepers' Lodge with Hisae's hut and the cave behind it,
 * and the Pass, where the road goes down to Lanternfall. The cave and the vigil are in 11_cave.js. Twelve-chapter
 * journeys only (`edition: 2`).
 *
 * Light-state continuity: every stone lantern is two instances, dark and lit, by a flag. A lantern relit by its name
 * sets kr_l_<id> and stays lit; the rest of the road's lanterns come on at dawn after the vigil (kr_vigil_done) and
 * stay on; the Shuttered Hall's stay dark (the postgame opens it, P15). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ROAD = { region: 'keepers', place: 'keepers', travel: 'keepers', music: 'keepers', edition: 2 };
  const MIST = { weather: 'motes', tint: 'rgba(200,205,190,0.06)' };
  // a stone lantern: dark until `flag`, lit after (relit by name, or at dawn); `scene` while dark, `after` once lit
  const toro = (x, y, flag, scene, after) => [
    Object.assign({ p: 'kr_toro', x, y, if: '!' + flag }, scene ? { scene } : {}),
    Object.assign({ p: 'kr_toro', x, y, if: flag, light: 34, o: { lit: true } }, after ? { scene: after } : {}),
  ];
  const dawn = (x, y) => toro(x, y, 'kr_vigil_done', null, null);

  // ---- the Foot of the Road (麓の宿) ----------------------------------------------------------------------------------
  C.maps['kr.foot'] = Object.assign({}, ROAD, {
    name: T('The Foot of the Road', '{麓|ふもと} の {宿|やど}'),
    ambient: MIST,
    terrain: K.build(36, 24, '.', (k) => {
      k.ragged('top', '^', 3, 701).ragged('bottom', 'Q', 3, 702);
      k.scatter('Q', 16, 703, [0, 3, 36, 5], '.');
      k.scatter('T', 7, 704, [24, 15, 12, 6], '.');
      k.scatter(';', 14, 705, [0, 8, 36, 12], '.');
      k.scatter(',', 6, 706, [2, 15, 14, 5], '.');
      k.path([[0, 12], [18, 12], [18, 0]], ':', 2);
      k.rect(18, 0, 2, 4, '+');
    }),
    structs: [
      { type: 'house', x: 4, y: 4, w: 8, h: 4, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 6], to: 'kr.foot_inn', spawn: [5, 7], lit: true, sign: true, signX: 1 },
    ],
    props: [
      ...toro(8, 10, 'kr_l_foot', 'kr.toro_foot', 'kr.toro_foot_lit'),
      ...dawn(14, 10), ...dawn(21, 6), ...dawn(21, 14),
      { p: 'noticeboard', x: 12, y: 14, scene: 'kr.foot_board' },
      { p: 'stone_marker', x: 16, y: 14, scene: 'kr.foot_marker' },
      { p: 'shrine', x: 26, y: 8, scene: 'kr.shrine_foot' },
      { p: 'bench', x: 4, y: 15 },
    ],
    npcs: [
      { id: 'kr_iwa', x: 25, y: 11, dir: 'up', if: '!kr_iwa_book_lost|kr_iwa_book_found', talk: [{ if: 'kr_done', scene: 'kr.iwa_after' }, { if: 'kr_iwa_book_found', scene: 'kr.iwa_thanks' }, { scene: 'kr.iwa_first' }] },
      { id: 'kr_seiji', x: 20, y: 15, dir: 'left', if: '!kr_seiji_gone', talk: 'kr.seiji_first' },
    ],
    exits: [
      { x: 0, y: 12, w: 1, h: 2, to: 'sb.road', sp: 'from_next', dir: 'left' },
      { x: 18, y: 0, w: 2, h: 1, to: 'kr.steps', sp: 'from_foot', dir: 'up' },
    ],
    onEnter: [{ scene: 'kr.arrive', if: '!kr_arrived' }],
    spawn: { default: [2, 12, 'right'], from_snowbell: [1, 12, 'right'], from_steps: [18, 1, 'down'] },
  });

  // ---- the Cedar Steps (杉の石段) -------------------------------------------------------------------------------------
  C.maps['kr.steps'] = Object.assign({}, ROAD, {
    name: T('The Cedar Steps', '{杉|すぎ} の {石段|いしだん}'),
    ambient: { weather: 'motes', dark: 0.12, tint: 'rgba(40,60,40,0.08)', playerLight: 30 },
    terrain: K.build(24, 36, 'Q', (k) => {
      k.path([[11, 35], [11, 28], [7, 24], [7, 18], [14, 14], [14, 8], [11, 4], [11, 0]], '.', 4);
      k.path([[11, 35], [11, 28], [7, 24], [7, 18], [14, 14], [14, 8], [11, 4], [11, 0]], '+', 2);
      k.rect(4, 22, 7, 4, '+'); k.rect(12, 12, 6, 4, '+'); k.rect(9, 2, 6, 3, '+');
      k.scatter('r', 5, 711, [2, 4, 20, 30], '.');
      k.scatter(';', 10, 712, [2, 4, 20, 30], '.');
    }),
    props: [
      { p: 'kr_cedar', x: 6, y: 20, if: '!kr_cedar_cleared', scene: 'kr.cedar' },
      ...toro(16, 15, 'kr_l_steps', 'kr.toro_steps', 'kr.toro_steps_lit'),
      ...dawn(5, 26), ...dawn(9, 5),
      { p: 'shrine', x: 13, y: 2, scene: 'kr.shrine_steps' },
    ],
    npcs: [
      { id: 'kr_kumazo', x: 9, y: 23, dir: 'left', talk: [{ if: 'kr_done', scene: 'kr.kumazo_after' }, { if: 'kr_cedar_cleared', scene: 'kr.kumazo_idle' }, { scene: 'kr.kumazo_first' }] },
    ],
    foes: [
      { id: 'moss1', enemy: 'kr.moss', encounter: 'kr.moss_steps', x: 14, y: 9, patrol: 0, if: '!kr_moss1_named', bg: 'keepers' },
    ],
    exits: [
      { x: 11, y: 35, w: 2, h: 1, to: 'kr.foot', sp: 'from_steps', dir: 'down' },
      { x: 11, y: 0, w: 2, h: 1, to: 'kr.fox', sp: 'from_steps', dir: 'up' },
    ],
    spawn: { default: [11, 34, 'up'], from_foot: [11, 34, 'up'], from_fox: [11, 1, 'down'] },
  });

  // ---- the hamlet at the Fox Bridge (狐橋) ---------------------------------------------------------------------------
  C.maps['kr.fox'] = Object.assign({}, ROAD, {
    name: T('Fox Bridge', '{狐橋|きつねばし}'),
    ambient: MIST,
    terrain: K.build(40, 26, '.', (k) => {
      k.ragged('top', '^', 3, 721).ragged('bottom', '^', 2, 722);
      k.rect(24, 0, 4, 26, '^'); k.rect(25, 0, 2, 26, '~');
      k.scatter('T', 9, 723, [0, 4, 22, 18], '.');
      k.scatter('T', 7, 724, [29, 4, 11, 18], '.');
      k.scatter(';', 10, 725, [0, 16, 22, 8], '.');
      k.rect(2, 17, 6, 3, 'F');
      k.path([[8, 25], [8, 13], [22, 13]], ':', 2);
      k.path([[28, 13], [39, 13]], ':', 2);
      k.rect(23, 12, 6, 2, 'b');
    }),
    structs: [
      { type: 'house', x: 2, y: 4, w: 7, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 5] },
      { type: 'house', x: 12, y: 4, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: 2, windows: [4], to: 'kr.kame', spawn: [4, 6], lit: true },
      { type: 'house', x: 31, y: 4, w: 6, h: 3, roof: 'thatch', wall: 'wood', door: null },
    ],
    props: [
      ...toro(21, 11, 'kr_l_fox', 'kr.toro_fox', 'kr.toro_fox_lit'),
      ...dawn(29, 15),
      { p: 'shrine', x: 18, y: 8, scene: 'kr.fox_shrine' },
      { p: 'well', x: 11, y: 18 },
      { p: 'stone_marker', x: 31, y: 15, scene: 'kr.fox_marker' },
      { p: 'bench', x: 15, y: 15 },
    ],
    npcs: [
      { id: 'kr_shozo', x: 5, y: 9, dir: 'down', talk: [{ if: 'kr_done', scene: 'kr.shozo_after' }, { if: 'quest.kr_fox=1', scene: 'kr.shozo_fox' }, { if: 'kr_shozo_met', scene: 'kr.shozo_idle' }, { scene: 'kr.shozo_first' }] },
      { id: 'kr_hinata', x: 13, y: 18, dir: 'left', talk: [{ if: 'quest.kr_cache=done', scene: 'kr.kids_after' }, { scene: 'kr.kids_rhyme' }] },
      { id: 'kr_kai', x: 14, y: 20, dir: 'up', talk: [{ if: 'quest.kr_cache=done', scene: 'kr.kids_after' }, { scene: 'kr.kids_rhyme' }] },
    ],
    exits: [
      { x: 8, y: 25, w: 2, h: 1, to: 'kr.steps', sp: 'from_fox', dir: 'down' },
      { x: 39, y: 13, w: 1, h: 2, to: 'kr.ridge', sp: 'from_fox', dir: 'right' },
    ],
    onEnter: [{ scene: 'kr.fox_arrive', if: '!kr_fox_seen' }],
    spawn: { default: [8, 24, 'up'], from_steps: [8, 24, 'up'], from_ridge: [38, 13, 'left'] },
  });

  // ---- the Maple Ridge (紅葉の尾根) -----------------------------------------------------------------------------------
  C.maps['kr.ridge'] = Object.assign({}, ROAD, {
    name: T('The Maple Ridge', '{紅葉|もみじ} の {尾根|おね}'),
    ambient: { weather: 'leaves', tint: 'rgba(200,120,60,0.05)' },
    terrain: K.build(44, 24, '.', (k) => {
      k.ragged('top', '^', 2, 731).ragged('bottom', '^', 3, 732);
      k.scatter('T', 28, 733, [0, 2, 44, 19], '.');
      k.scatter(';', 12, 734, [0, 14, 44, 8], '.');
      k.path([[0, 13], [18, 13], [30, 10], [43, 10]], ':', 2);
      k.path([[18, 13], [20, 6], [22, 0]], ':', 2);
      k.path([[30, 10], [34, 18], [34, 21]], ':', 1);
      k.rect(11, 8, 6, 3, '+');
      k.rect(26, 14, 7, 4, '+');
      k.rect(32, 19, 4, 3, '.');
    }),
    props: [
      { p: 'kr_stele', x: 14, y: 8, scene: 'kr.stele' },
      { p: 'stone_marker', x: 19, y: 15, scene: 'kr.fork_marker' },
      // the third waystation's ruin: two lanterns the Wick Moths come for (kept lit, they stay lit)
      ...toro(27, 14, 'kr_moths_done', 'kr.ruin_lanterns', null), ...toro(31, 14, 'kr_moths_done', 'kr.ruin_lanterns', null),
      // the oil cache, under the broken lantern the rhyme counts to
      { p: 'deadlantern', x: 34, y: 20, if: '!kr_cache_found', scene: 'kr.cache_spot' },
      { p: 'kr_jar', x: 34, y: 20, if: 'kr_cache_found', scene: 'kr.cache_jar' },
      ...dawn(9, 12), ...dawn(38, 9),
    ],
    npcs: [
      { id: 'kr_juzo', x: 12, y: 11, dir: 'up', talk: [{ if: 'kr_done', scene: 'kr.juzo_after' }, { if: 'kr_juzo_met', scene: 'kr.juzo_idle' }, { scene: 'kr.juzo_first' }] },
      { id: 'kr_kikyo', x: 38, y: 12, dir: 'left', if: '!kr_kikyo_lodge', talk: 'kr.kikyo_first' },
    ],
    foes: [
      { id: 'r1', enemy: 'kr.sandal', x: 7, y: 16, patrol: 2, bg: 'keepers' },
      { id: 'r2', enemy: 'kr.chochin', x: 24, y: 6, patrol: 1, bg: 'keepers' },
    ],
    triggers: [
      { x: 26, y: 11, w: 7, h: 1, scene: 'kr.moths', if: 'kr_hisae_met&!kr_moths_done' },
    ],
    exits: [
      { x: 0, y: 13, w: 1, h: 2, to: 'kr.fox', sp: 'from_ridge', dir: 'left' },
      { x: 43, y: 10, w: 1, h: 2, to: 'kr.lodge', sp: 'from_ridge', dir: 'right' },
      { x: 22, y: 0, w: 2, h: 1, to: 'kr.hall', sp: 'from_ridge', dir: 'up' },
    ],
    spawn: { default: [1, 13, 'right'], from_fox: [1, 13, 'right'], from_lodge: [42, 10, 'left'], from_hall: [22, 1, 'down'] },
  });

  // ---- the Keepers' Lodge (灯守の宿坊) --------------------------------------------------------------------------------
  C.maps['kr.lodge'] = Object.assign({}, ROAD, {
    name: T('The Keepers\' Lodge', '{灯守|ひもり} の {宿坊|しゅくぼう}'),
    music: [{ if: 'kr_night&!kr_vigil_done', id: 'kr_vigil' }, { id: 'keepers' }],
    ambient: {
      weather: 'motes',
      get dark() { const s = RB.game && RB.game.s; return s && s.flags.kr_night && !s.flags.kr_vigil_done ? 0.5 : 0.05; },
      get tint() { const s = RB.game && RB.game.s; return s && s.flags.kr_night && !s.flags.kr_vigil_done ? 'rgba(30,40,80,0.14)' : 'rgba(200,205,190,0.05)'; },
      playerLight: 44,
    },
    terrain: K.build(40, 28, '.', (k) => {
      k.rect(0, 0, 40, 4, '^');
      k.ragged('bottom', 'Q', 3, 741);
      k.scatter('Q', 12, 742, [0, 4, 10, 20], '.');
      k.scatter('T', 9, 743, [30, 14, 10, 10], '.');
      k.rect(12, 6, 16, 10, '+'); k.frame(12, 6, 16, 10, '#');
      for (const [x, y] of [[19, 15], [20, 15], [12, 10], [12, 11], [27, 9], [16, 6], [20, 6], [23, 6], [24, 6]]) k.set(x, y, '+');
      k.rect(19, 4, 3, 2, '+');
      k.path([[0, 18], [19, 18], [19, 16]], ':', 2);
      k.path([[20, 18], [39, 18]], ':', 2);
      k.path([[33, 10], [33, 17]], ':', 1);
      k.path([[6, 11], [6, 17]], ':', 1);
    }),
    structs: [
      { type: 'house', x: 30, y: 5, w: 7, h: 5, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 5], to: 'kr.hisae', spawn: [4, 6], lit: true },
      { type: 'house', x: 3, y: 6, w: 7, h: 5, roof: 'tile', wall: 'stone', door: 3, windows: [1, 5], to: 'kr.lodge_in', spawn: [4, 6], lit: true },
    ],
    props: [
      // Hisae's one lamp, lit every night of her life; the lodge's others come on at dawn
      { p: 'kr_toro', x: 20, y: 8, light: 34, o: { lit: true }, scene: 'kr.hisae_lamp' },
      ...dawn(14, 8), ...dawn(26, 8), ...dawn(14, 13), ...dawn(26, 13),
      { p: 'kr_stele', x: 16, y: 11, scene: 'kr.lodge_inscription' },
      { p: 'bench', x: 22, y: 12 },
      { p: 'kr_scroll', x: 25, y: 11, if: 'kr_kikyo_lodge', scene: 'kr.kikyo_scroll' },
      { p: 'door', x: 20, y: 3, scene: 'kr.cave_go' },
    ],
    npcs: [
      { id: 'kr_hisae', x: 20, y: 10, dir: 'down', if: '!kr_night|kr_vigil_done', talk: [
        { if: 'kr_done', scene: 'kr.hisae_after' },
        { if: 'kr_registers_read&!kr_vigil_done', scene: 'kr.hisae_vigil' },
        { if: 'kr_hisae_met', scene: 'kr.hisae_idle' },
        { scene: 'kr.hisae_first' }] },
      { id: 'kr_mokichi', x: 6, y: 13, dir: 'down', talk: [{ if: 'kr_done', scene: 'kr.mokichi_after' }, { scene: 'kr.mokichi' }] },
      { id: 'kr_sora', x: 9, y: 15, dir: 'left', wander: 1, talk: [{ if: 'kr_done', scene: 'kr.sora_after' }, { scene: 'kr.sora' }] },
      { id: 'kr_kikyo', x: 24, y: 13, dir: 'left', if: 'kr_kikyo_lodge&!kr_done', talk: 'kr.kikyo_lodge' },
    ],
    triggers: [
      { x: 38, y: 18, w: 1, h: 2, scene: 'kr.lodge_east_dark', if: '!kr_vigil_done' },
    ],
    exits: [
      { x: 0, y: 18, w: 1, h: 2, to: 'kr.ridge', sp: 'from_lodge', dir: 'left' },
      { x: 39, y: 18, w: 1, h: 2, to: 'kr.descent', sp: 'from_lodge', dir: 'right', if: 'kr_vigil_done' },
    ],
    onEnter: [{ scene: 'kr.lodge_arrive', if: '!kr_lodge_seen' }],
    spawn: { default: [1, 18, 'right'], from_ridge: [1, 18, 'right'], from_descent: [38, 18, 'left'], from_cave: [20, 5, 'down'] },
  });

  // ---- the Shuttered Hall (百物語の館) -------------------------------------------------------------------------------
  C.maps['kr.hall'] = Object.assign({}, ROAD, {
    name: T('The Shuttered Hall', '{閉|と}ざされた {館|やかた}'),
    music: 'kr_hall',
    ambient: { weather: 'motes', dark: 0.1, tint: 'rgba(60,60,80,0.08)' },
    terrain: K.build(30, 22, '.', (k) => {
      k.rect(0, 0, 30, 3, '^');
      k.ragged('bottom', 'T', 2, 751);
      k.scatter('T', 10, 752, [0, 3, 6, 16], '.'); k.scatter('T', 10, 753, [24, 3, 6, 16], '.');
      k.rect(8, 11, 14, 3, '+');
      k.path([[14, 21], [14, 13]], ':', 2);
    }),
    structs: [
      { type: 'house', x: 7, y: 3, w: 16, h: 8, roof: 'tile', wall: 'wood', door: null, windows: [] },
    ],
    props: [
      { p: 'kr_halldoor', x: 14, y: 10, scene: 'kr.hall_door' },
      { p: 'kr_toro', x: 8, y: 12, scene: 'kr.hall_lantern' }, { p: 'kr_toro', x: 21, y: 12, scene: 'kr.hall_lantern' },
      { p: 'kr_toro', x: 6, y: 16 }, { p: 'kr_toro', x: 23, y: 16 },
      { p: 'stone_marker', x: 11, y: 17, scene: 'kr.hall_marker' },
    ],
    npcs: [],
    exits: [
      { x: 14, y: 21, w: 2, h: 1, to: 'kr.ridge', sp: 'from_hall', dir: 'down' },
    ],
    onEnter: [{ scene: 'kr.hall_first', if: '!kr_hall_seen' }],
    spawn: { default: [14, 20, 'up'], from_ridge: [14, 20, 'up'] },
  });

  // ---- the Pass, and the way down (峠) -------------------------------------------------------------------------------
  C.maps['kr.descent'] = Object.assign({}, ROAD, {
    name: T('The Pass', '{峠|とうげ}'),
    ambient: { weather: 'leaves' },
    terrain: K.build(36, 22, '.', (k) => {
      k.ragged('top', '^', 3, 761).ragged('bottom', '^', 2, 762);
      k.scatter('T', 14, 763, [0, 3, 36, 15], '.');
      k.scatter('Q', 8, 764, [20, 3, 16, 15], '.');
      k.path([[0, 12], [14, 12], [22, 9], [35, 12]], ':', 2);
      k.rect(12, 9, 6, 4, '+');
    }),
    props: [
      ...dawn(12, 9), ...dawn(17, 9), ...dawn(30, 10),
      { p: 'stone_marker', x: 20, y: 13, scene: 'kr.pass_marker' },
      { p: 'bench', x: 14, y: 14 },
    ],
    npcs: [
      { id: 'kr_seiji', x: 24, y: 13, dir: 'left', if: 'kr_seiji_gone&kr_done', talk: 'kr.seiji_after' },
    ],
    exits: [
      { x: 0, y: 12, w: 1, h: 2, to: 'kr.lodge', sp: 'from_descent', dir: 'left' },
      { x: 35, y: 12, w: 1, h: 2, to: 'lf.road', sp: 'from_prev', dir: 'right', if: 'kr_done' },
    ],
    onEnter: [{ scene: 'kr.chapter_end', if: 'kr_vigil_done&!kr_done' }],
    spawn: { default: [1, 12, 'right'], from_lodge: [1, 12, 'right'], from_lanternfall: [34, 12, 'left'] },
  });

  // ---- interiors ---------------------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, outside, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', place: 'keepers', music: null, noTravel: true, travelKind: 'interior', edition: 2,
      terrain: K.room(w, h, '_', doorX),
      props: [], npcs: [],
      exits: [{ x: doorX, y: h - 1, to: outside, tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  // Aya's teahouse at the first waystation
  interior('kr.foot_inn', T('The Waystation Teahouse', '{茶屋|ちゃや}'), 11, 8, 5, 'kr.foot', [8, 8], {
    props: [
      { p: 'exitmat', x: 5, y: 6 }, { p: 'counter', x: 3, y: 2, across: true }, { p: 'bench', x: 1, y: 4 }, { p: 'bench', x: 8, y: 4 },
      { p: 'table', x: 8, y: 2, scene: 'kr.inn_book' }, { p: 'lantern', x: 10, y: 3, o: { lit: true } },
    ],
    npcs: [{ id: 'kr_aya', x: 4, y: 3, dir: 'down', talk: [{ if: 'kr_done', scene: 'kr.aya_after' }, { if: 'kr_aya_met', scene: 'kr.aya_idle' }, { scene: 'kr.aya_first' }] }],
  });
  // Kame's house in the hamlet
  interior('kr.kame', T('Kame\'s House', 'カメ の {家|いえ}'), 9, 7, 4, 'kr.fox', [14, 8], {
    props: [{ p: 'exitmat', x: 4, y: 5 }, { p: 'shelf', x: 1, y: 2 }, { p: 'table', x: 5, y: 2 }, { p: 'lantern', x: 8, y: 3, o: { lit: true } }],
    npcs: [{ id: 'kr_kame', x: 3, y: 3, dir: 'down', talk: [{ if: 'quest.kr_fox=done', scene: 'kr.kame_after' }, { scene: 'kr.kame' }] }],
  });
  // the lodge's last dry corner, where the caretakers live
  interior('kr.lodge_in', T('The Caretakers\' Room', '{宿坊|しゅくぼう} の {奥|おく}'), 10, 8, 4, 'kr.lodge', [6, 11], {
    props: [
      { p: 'exitmat', x: 4, y: 6 }, { p: 'shelf', x: 1, y: 2, scene: 'kr.lodge_registers_old' }, { p: 'table', x: 6, y: 3 },
      { p: 'lantern', x: 9, y: 3, o: { lit: true } }, { p: 'bed', x: 7, y: 5 },
    ],
    npcs: [{ id: 'kr_fuyu', x: 3, y: 4, dir: 'down', talk: [{ if: 'kr_done', scene: 'kr.fuyu_after' }, { scene: 'kr.fuyu' }] }],
  });
  // Hisae's hut: one room, a hearth, the order's last registers on a shelf
  interior('kr.hisae', T('Hisae\'s Hut', 'ヒサエ の {小屋|こや}'), 9, 7, 4, 'kr.lodge', [33, 10], {
    props: [
      { p: 'exitmat', x: 4, y: 5 }, { p: 'shelf', x: 1, y: 2, scene: 'kr.hisae_shelf' }, { p: 'table', x: 5, y: 2, scene: 'kr.hisae_table' },
      { p: 'lantern', x: 8, y: 3, o: { lit: true } }, { p: 'bed', x: 6, y: 4 },
    ],
    npcs: [],
  });
})(RB.content, RB.mapkit);
