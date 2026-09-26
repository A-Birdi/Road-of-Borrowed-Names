/* Chapter 4 maps: the mountain road, Snowbell hamlet and its interiors.
 * Dungeon maps (the frozen observatory) are in 25_dungeon.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const S = () => RB.game && RB.game.s;
  const storm = () => { const s = S(); return !!(s && s.flags.sb_storm && !s.flags.sb_morning); };
  const night = () => { const s = S(); return !!(s && s.flags.sb_evening); };

  // ---- the mountain road (link to Cinder Orchard and Lanternfall) -------------------------
  C.maps['sb.road'] = {
    name: T('The Snowbell Road', '{雪鈴|ゆきすず} の {坂道|さかみち}'), region: 'snowbell', music: 'road',
    ambient: { weather: 'snow', tint: 'rgba(200,220,255,0.06)' },
    terrain: K.build(36, 22, '*', (k) => {
      k.ragged('top', 'P', 4, 41).ragged('bottom', 'P', 3, 42).ragged('left', 'P', 2, 43);
      k.rect(27, 16, 9, 6, '^');
      k.ragged('right', 'P', 2, 44);
      k.rect(4, 5, 6, 3, 'i').rect(5, 8, 3, 1, 'i');
      k.scatter('R', 9, 45, [2, 4, 32, 13], '*');
      k.scatter('P', 7, 46, [2, 4, 32, 14], '*');
      k.path([[0, 13], [18, 13]], ':', 2);
      k.vline(18, 0, 14, ':', 2);
      k.hline(18, 35, 13, ':', 2);
      k.rect(0, 13, 1, 2, ':').rect(35, 13, 1, 2, ':');
      k.rect(21, 7, 3, 2, ':');
    }),
    props: [
      { p: 'sign', x: 16, y: 11, scene: 'sb.road_sign' },
      { p: 'lantern', x: 7, y: 12 }, { p: 'lantern', x: 25, y: 12 }, { p: 'lantern', x: 20, y: 4 },
      { p: 'stone_marker', x: 12, y: 16, scene: 'sb.road_marker' },
      { p: 'shrine', x: 21, y: 6, scene: 'sb.road_shrine' },
      { p: 'bench', x: 9, y: 15 },
      { p: 'sb_drift', x: 31, y: 13, if: '!ch4_done', scene: 'sb.road_east_locked' },
      { p: 'sb_drift', x: 31, y: 14, if: '!ch4_done', scene: 'sb.road_east_locked' },
      { p: 'sb_drift', x: 32, y: 12, if: '!ch4_done' }, { p: 'sb_drift', x: 32, y: 15, if: '!ch4_done' },
    ],
    npcs: [
      { id: 'hayate', x: 28, y: 12, dir: 'left', if: 'ch4_done&!post', talk: 'sb.hayate_road' },
    ],
    exits: [
      { x: 0, y: 13, w: 1, h: 2, to: 'co.road', sp: 'from_next', dir: 'left' },
      { x: 18, y: 0, w: 2, h: 1, to: 'sb.hamlet', tx: 22, ty: 33, dir: 'up' },
      { x: 35, y: 13, w: 1, h: 2, to: 'lf.road', sp: 'from_prev', dir: 'right', if: 'ch4_done' },
    ],
    onEnter: [{ scene: 'sb.arrive', if: '!sb_arrived' }, { scene: 'sb.next_day', if: 'sb_evening' }],
    spawn: { default: [3, 13, 'right'], from_prev: [2, 13, 'right'], from_next: [33, 13, 'left'] },
  };

  // ---- Snowbell hamlet ------------------------------------------------------------------------
  C.maps['sb.hamlet'] = {
    name: T('Snowbell', '{雪鈴|ゆきすず}'), region: 'snowbell', place: 'snowbell', travel: 'snowbell',
    music: [{ if: 'sb_evening', id: 'wonder' }, { id: 'snowbell' }],
    ambient: {
      weather: 'snow',
      get dark() { return night() ? 0.45 : storm() ? 0.3 : 0; },
      get tint() { return night() ? 'rgba(40,50,90,0.10)' : 'rgba(200,220,255,0.05)'; },
      playerLight: 46,
    },
    terrain: K.build(46, 36, '*', (k) => {
      k.ragged('top', 'P', 3, 51).ragged('left', 'P', 3, 52).ragged('bottom', 'P', 2, 53).ragged('right', 'P', 2, 54);
      // the frozen stream along the east side
      k.rect(40, 0, 2, 36, 'i');
      k.vline(39, 0, 35, '*').vline(42, 0, 35, '*');
      k.scatter('R', 5, 55, [39, 2, 4, 32], '*');
      k.hline(39, 42, 20, 'b', 1);
      k.scatter('P', 6, 56, [43, 3, 3, 30], '*');
      // square
      k.rect(16, 14, 14, 9, '=');
      // roads and paths
      k.path([[22, 35], [22, 22]], ':', 2);
      k.path([[23, 14], [23, 9], [30, 9]], ':', 2);
      k.vline(30, 0, 10, ':', 2);
      k.path([[31, 8], [35, 8]], ':', 1);
      k.path([[10, 8], [10, 10], [16, 10], [16, 14]], ':', 1);
      k.path([[10, 17], [10, 18], [16, 18]], ':', 1);
      k.path([[29, 17], [35, 17]], ':', 1);
      k.path([[6, 26], [6, 31], [22, 31]], ':', 1);
      k.path([[29, 30], [29, 31], [23, 31]], ':', 1);
      k.path([[30, 20], [38, 20]], ':', 1);
      // goat pen (fence with a gate on the west side)
      k.frame(11, 23, 8, 7, 'f');
      k.set(11, 26, '*');
      k.scatter('R', 4, 57, [2, 3, 36, 30], '*');
      k.scatter('P', 5, 58, [2, 30, 18, 3], '*');
    }),
    structs: [
      { type: 'house', x: 6, y: 12, w: 9, h: 5, roof: 'snow', wall: 'wood', door: 4, windows: [1, 2, 6, 7], chimney: true, lit: true, sign: true, signX: 4, to: 'sb.inn', spawn: [8, 10] },
      { type: 'house', x: 8, y: 5, w: 5, h: 3, roof: 'snow', wall: 'wood', door: 2, windows: [0, 4], chimney: true, to: 'sb.fuki', spawn: [3, 5] },
      { type: 'house', x: 33, y: 4, w: 6, h: 4, roof: 'snow', wall: 'stone', door: 2, windows: [0, 4, 5], chimney: true, lit: true, to: 'sb.hoshino', spawn: [5, 7] },
      { type: 'house', x: 33, y: 13, w: 5, h: 4, roof: 'snow', wall: 'wood', door: 2, windows: [0, 4], chimney: true, to: 'sb.sachi', spawn: [4, 6] },
      { type: 'house', x: 3, y: 22, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [0], to: 'sb.goatshed', spawn: [6, 7] },
      { type: 'house', x: 27, y: 27, w: 5, h: 3, roof: 'slate', wall: 'wood', door: 2, windows: [0, 4], sign: true, signX: 1, to: 'sb.post', spawn: [5, 6] },
      { type: 'house', x: 26, y: 3, w: 4, h: 3, roof: 'snow', wall: 'wood', door: 1, windows: [3] },
      { type: 'house', x: 3, y: 18, w: 4, h: 3, roof: 'snow', wall: 'wood', door: 2, windows: [0] },
      { type: 'house', x: 33, y: 24, w: 5, h: 3, roof: 'snow', wall: 'wood', door: 2, windows: [0, 4], chimney: true },
    ],
    props: [
      // square
      { p: 'sb_bellpost', x: 22, y: 15, o: { blank: true }, if: '!quest.sb_bell>=2', scene: 'sb.bellpost' },
      { p: 'sb_bellpost', x: 22, y: 15, if: 'quest.sb_bell>=2', scene: 'sb.bellpost' },
      { p: 'noticeboard', x: 17, y: 14, scene: 'sb.hamlet_board' },
      { p: 'well', x: 27, y: 20, scene: 'sb.well' },
      { p: 'lantern', x: 16, y: 13 }, { p: 'lantern', x: 29, y: 13 }, { p: 'lantern', x: 21, y: 24 },
      { p: 'lantern', x: 29, y: 2 }, { p: 'lantern', x: 12, y: 9 },
      { p: 'sb_snowgoat', x: 18, y: 20, o: { oneHorn: true }, scene: 'sb.sculpt_goat' },
      { p: 'sb_snowobs', x: 20, y: 21, scene: 'sb.sculpt_obs' },
      { p: 'sb_snowfox', x: 24, y: 21, scene: 'sb.sculpt_fox' },
      { p: 'snowman', x: 28, y: 22 },
      // around the houses
      { p: 'sb_woodpile', x: 15, y: 11 }, { p: 'sb_woodpile', x: 36, y: 10 },
      { p: 'barrel', x: 7, y: 18 }, { p: 'crate', x: 32, y: 29 }, { p: 'crate', x: 26, y: 29 },
      { p: 'mailbox', x: 26, y: 28, scene: 'sb.post_box' },
      { p: 'laundry', x: 34, y: 19, scene: 'sb.laundry' },
      { p: 'hay', x: 9, y: 24 }, { p: 'hay', x: 2, y: 26 },
      { p: 'bench', x: 17, y: 22 },
      { p: 'telescope', x: 39, y: 5, scene: 'sb.hoshino_scope' },
      { p: 'hole', x: 40, y: 25, scene: 'sb.icehole' },
      { p: 'stump', x: 38, y: 26 },
      // the Star Stair: iced over until melted
      { p: 'sb_icewall', x: 30, y: 1, if: '!sb_stair_open', scene: 'sb.stair_ice' },
      { p: 'sb_icewall', x: 31, y: 1, if: '!sb_stair_open', scene: 'sb.stair_ice' },
      { p: 'stone_marker', x: 32, y: 2, scene: 'sb.stair_marker' },
    ],
    npcs: [
      // Hayate watches the fox trails at the edge of the woods.
      { id: 'hayate', x: 27, y: 7, dir: 'down', wander: 1, if: '!sb_evening&!ch4_done|post', talk: [{ if: 'post', scene: 'sb.hayate_post' }, { scene: 'sb.hayate' }] },
      // Tetsuji at his pen gate.
      { id: 'tetsuji', x: 9, y: 27, dir: 'right', if: '!sb_evening|post', talk: [{ if: 'post', scene: 'sb.tetsuji_post' }, { scene: 'sb.tetsuji' }] },
      // Children by their sculptures.
      { id: 'kanta', x: 19, y: 19, dir: 'down', wander: 1, if: '!sb_evening|post', talk: [{ if: 'post', scene: 'sb.kanta_post' }, { scene: 'sb.kanta' }] },
      { id: 'chiyo', x: 21, y: 20, dir: 'down', if: '!sb_evening|post', talk: [{ if: 'post', scene: 'sb.chiyo_post' }, { scene: 'sb.chiyo' }] },
      { id: 'rokuta', x: 25, y: 20, dir: 'left', wander: 1, if: '!sb_evening|post', talk: [{ if: 'post', scene: 'sb.rokuta_post' }, { scene: 'sb.rokuta' }] },
      // Denji ice-fishing on the stream.
      { id: 'denji', x: 39, y: 25, dir: 'right', if: '!sb_evening&!sb_morning|sb_lamp_lit&!sb_evening|post', talk: [{ if: 'post', scene: 'sb.denji_post' }, { scene: 'sb.denji' }] },
      // Sachi hanging (frozen) laundry.
      { id: 'sachi', x: 35, y: 20, dir: 'up', wander: 1, if: '!sb_evening|post', talk: [{ if: 'post', scene: 'sb.sachi_post' }, { scene: 'sb.sachi' }] },
      // Goats in the pen.
      { id: 'sb_goat1', x: 14, y: 25, look: { custom: 'goat' }, wander: 2, talk: 'sb.goat' },
      { id: 'sb_goat2', x: 16, y: 27, look: { custom: 'goat', col: '#d8c0a0', col2: '#a88a6a' }, wander: 2, talk: 'sb.goat' },
      { id: 'sb_goat3', x: 14, y: 28, look: { custom: 'goat', col: '#5a4a44', col2: '#3a2e2a' }, wander: 2, talk: 'sb.goat' },
      { id: 'sb_goat4', x: 17, y: 24, look: { custom: 'goat' }, wander: 1, talk: 'sb.goat' },
      // The evening after the lamp is lit: the hamlet gathers in the square.
      { id: 'hoshino', x: 22, y: 17, dir: 'up', if: 'sb_evening&!post', talk: 'sb.eve_hoshino' },
      { id: 'kanta', x: 20, y: 18, dir: 'up', if: 'sb_evening&!post', talk: 'sb.eve_kanta' },
      { id: 'fuki', x: 24, y: 18, dir: 'up', if: 'sb_evening&!post', talk: 'sb.eve_fuki' },
      { id: 'yae', x: 18, y: 17, dir: 'up', if: 'sb_evening&!post', talk: 'sb.eve_yae' },
      { id: 'tetsuji', x: 26, y: 17, dir: 'up', if: 'sb_evening&!post', talk: 'sb.eve_tetsuji' },
      { id: 'sousuke', x: 27, y: 19, dir: 'up', if: 'sb_evening&!post', talk: 'sb.eve_sousuke' },
      // After the story: Hoshino on his bench if he stayed.
      { id: 'hoshino', x: 36, y: 9, dir: 'down', if: 'post&!sb_hoshino_goes', talk: 'sb.hoshino_post' },
      { id: 'fuki', x: 23, y: 16, dir: 'down', if: 'ch4_done&!sb_evening', talk: [{ if: 'post', scene: 'sb.fuki_post' }, { scene: 'sb.fuki_after' }] },
    ],
    exits: [
      { x: 22, y: 35, w: 2, h: 1, to: 'sb.road', tx: 18, ty: 1, dir: 'down' },
      { x: 30, y: 0, w: 2, h: 1, to: 'sb.obs_path', tx: 14, ty: 37, dir: 'up', if: 'sb_stair_open' },
    ],
    onEnter: [
      { scene: 'sb.hamlet_first', if: '!sb_hamlet_seen' },
      { scene: 'sb.eve_start', if: 'sb_lamp_lit&!sb_evening_seen' },
    ],
    spawn: { default: [22, 33, 'up'] },
  };

  // ---- interiors ---------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, backTo, backXY, extra) {
    C.maps[id] = Object.assign({
      name, region: 'snowbell', music: null, noTravel: true,
      terrain: K.room(w, h, '_', doorX),
      props: [{ p: 'exitmat', x: doorX, y: h - 2 }],
      npcs: [],
      exits: [{ x: doorX, y: h - 1, to: backTo, tx: backXY[0], ty: backXY[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }

  // Yukimiya, the inn with the hearth. During the storm the whole hamlet is here.
  const inStorm = 'sb_storm&!sb_morning';
  interior('sb.inn', T('Yukimiya Inn', '{宿|やど} {雪見屋|ゆきみや}'), 17, 12, 8, 'sb.hamlet', [10, 17], {
    music: 'inn',
    ambient: { get dark() { return storm() ? 0.3 : 0.12; }, playerLight: 40 },
    terrain: K.build(17, 12, '#', (k) => { k.rect(1, 2, 15, 9, '_'); k.rect(5, 4, 6, 4, 'm'); k.set(8, 11, '_'); }),
    props: [
      { p: 'exitmat', x: 8, y: 10 },
      { p: 'sb_irori', x: 7, y: 5, if: 'sb_hearth_done|!sb_storm', scene: 'sb.irori' },
      { p: 'sb_irori', x: 7, y: 5, o: { low: true }, if: 'sb_storm&!sb_hearth_done', scene: 'sb.irori' },
      { p: 'counter', x: 12, y: 3, scene: 'sb.inn_counter' }, { p: 'shelf', x: 15, y: 2 }, { p: 'bottles', x: 14, y: 2 }, { p: 'pot', x: 12, y: 2 },
      { p: 'stairs', x: 1, y: 2 },
      { p: 'table', x: 2, y: 8 }, { p: 'chair', x: 1, y: 8 }, { p: 'chair', x: 4, y: 8 },
      { p: 'smalltable', x: 13, y: 8, scene: 'sb.inn_table' }, { p: 'chair', x: 14, y: 8 },
      { p: 'sb_woodpile', x: 1, y: 5, o: { indoor: true } },
      { p: 'noticeboard', x: 10, y: 2, scene: 'sb.inn_menu' },
      { p: 'lantern', x: 4, y: 2 },
    ],
    npcs: [
      { id: 'yae', x: 13, y: 2, dir: 'down', talk: [{ if: 'post', scene: 'sb.yae_post' }, { if: inStorm, scene: 'sb.yae_storm' }, { scene: 'sb.yae' }] },
      { id: 'natsume', x: 5, y: 4, dir: 'down', if: '!sb_storm|sb_morning', talk: [{ if: 'post', scene: 'sb.natsume_post' }, { scene: 'sb.natsume' }] },
      // cameo: Nao, stuck with the winter mailbag
      { id: 'nao', x: 3, y: 6, dir: 'right', if: 'comp!=nao&!sb_storm|comp!=nao&sb_morning', talk: [{ if: 'post', scene: 'sb.nao_cameo_post' }, { if: 'sb_lamp_lit', scene: 'sb.nao_cameo_after' }, { scene: 'sb.nao_cameo' }] },
      // the storm crowd
      { id: 'hoshino', x: 6, y: 8, dir: 'up', if: inStorm, talk: 'sb.storm_hoshino' },
      { id: 'fuki', x: 10, y: 7, dir: 'left', if: inStorm, talk: 'sb.storm_fuki' },
      { id: 'tetsuji', x: 11, y: 5, dir: 'left', if: inStorm, talk: 'sb.storm_tetsuji' },
      { id: 'natsume', x: 11, y: 4, dir: 'down', if: inStorm, talk: 'sb.storm_natsume' },
      { id: 'sachi', x: 3, y: 9, dir: 'up', if: inStorm, talk: 'sb.storm_sachi' },
      { id: 'kanta', x: 5, y: 9, dir: 'up', if: inStorm, talk: 'sb.storm_kanta' },
      { id: 'chiyo', x: 9, y: 9, dir: 'up', if: inStorm, talk: 'sb.storm_kids' },
      { id: 'rokuta', x: 10, y: 9, dir: 'up', if: inStorm, talk: 'sb.storm_kids' },
      { id: 'denji', x: 14, y: 6, dir: 'left', if: inStorm, talk: 'sb.storm_denji' },
      { id: 'sousuke', x: 14, y: 9, dir: 'left', if: inStorm, talk: 'sb.storm_sousuke' },
      { id: 'hayate', x: 2, y: 4, dir: 'down', if: inStorm, talk: 'sb.storm_hayate' },
      { id: 'nao', x: 3, y: 6, dir: 'right', if: 'comp!=nao&' + inStorm, talk: 'sb.nao_cameo_storm' },
      // the morning after
      { id: 'hoshino', x: 6, y: 8, dir: 'up', if: 'sb_morning&!sb_obs_open', talk: 'sb.morning_hoshino' },
      { id: 'denji', x: 14, y: 6, dir: 'left', if: 'sb_morning&!sb_lamp_lit', talk: 'sb.denji_morning' },
    ],
    exits: [
      { x: 8, y: 11, to: 'sb.hamlet', tx: 10, ty: 17, dir: 'down', locked: 'sb.inn_door_storm', unlock: '!sb_storm|sb_morning' },
      { x: 1, y: 2, to: 'sb.inn_room', tx: 6, ty: 5, dir: 'right', locked: 'sb.inn_stairs', unlock: 'sb_storm|sb_lamp_lit' },
    ],
    spawn: { default: [8, 9, 'up'] },
  });
  // Upstairs: the travellers' room.
  C.maps['sb.inn_room'] = {
    name: T('Upstairs at Yukimiya', '{雪見屋|ゆきみや} の {二階|にかい}'), region: 'snowbell', music: 'quiet_road', noTravel: true,
    ambient: { get dark() { return storm() ? 0.5 : 0.15; }, playerLight: 30 },
    terrain: K.build(9, 8, '#', (k) => { k.rect(1, 2, 7, 5, 'm'); k.set(7, 6, '_'); }),
    props: [
      { p: 'sb_futon', x: 2, y: 2, o: { col: '#6a7aa8' }, scene: 'sb.room_futon' },
      { p: 'sb_futon', x: 4, y: 2, o: { col: '#a86a6a' }, scene: 'sb.room_futon' },
      { p: 'lantern', x: 7, y: 2, o: { lit: true } },
      { p: 'smalltable', x: 2, y: 5, scene: 'sb.room_table' },
      { p: 'stairs', x: 7, y: 6 },
    ],
    npcs: [],
    exits: [{ x: 7, y: 6, to: 'sb.inn', tx: 2, ty: 3, dir: 'down', locked: 'sb.room_stay', unlock: '!sb_storm|sb_morning|!sb_hearth_done' }],
    onEnter: [{ scene: 'sb.quiet_begin', if: 'sb_storm&sb_hearth_done&!sb_quiet_done' }],
    spawn: { default: [6, 5, 'left'] },
  };

  interior('sb.post', T('The Post Shelter', '{郵便|ゆうびん}{小屋|ごや}'), 10, 8, 5, 'sb.hamlet', [29, 30], {
    props: [
      { p: 'exitmat', x: 5, y: 6 },
      { p: 'sb_mailshelf', x: 1, y: 2, scene: 'sb.post_shelf' }, { p: 'sb_mailshelf', x: 3, y: 2, scene: 'sb.post_shelf' },
      { p: 'desk', x: 6, y: 3, across: true, scene: 'sb.post_desk' }, { p: 'stove', x: 8, y: 2 },
      { p: 'crate', x: 1, y: 5 }, { p: 'crate', x: 1, y: 4, scene: 'sb.post_sacks' }, { p: 'mailbox', x: 8, y: 5 },
      { p: 'noticeboard', x: 5, y: 2, scene: 'sb.post_notice' },
    ],
    npcs: [
      { id: 'sousuke', x: 7, y: 2, dir: 'down', if: '!sb_storm&!sb_evening|sb_morning&!sb_evening', talk: [{ if: 'post', scene: 'sb.sousuke_post' }, { scene: 'sb.sousuke' }] },
    ],
  });
  interior('sb.hoshino', T('Hoshino\'s House', 'ホシノ の {家|いえ}'), 11, 9, 5, 'sb.hamlet', [35, 8], {
    ambient: { dark: 0.15, playerLight: 40 },
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'sb_starchart', x: 1, y: 3, scene: 'sb.hoshino_charts' },
      { p: 'telescope', x: 9, y: 2, scene: 'sb.hoshino_window' },
      { p: 'bookpile', x: 1, y: 6 }, { p: 'shelf', x: 3, y: 2 }, { p: 'shelf', x: 4, y: 2, scene: 'sb.hoshino_shelf' },
      { p: 'stove', x: 7, y: 2 }, { p: 'bed', x: 9, y: 5 },
      { p: 'smalltable', x: 6, y: 5, scene: 'sb.hoshino_letters_box' }, { p: 'chair', x: 7, y: 5 },
    ],
    npcs: [
      { id: 'hoshino', x: 4, y: 4, dir: 'down', if: '!sb_storm|sb_obs_open&!sb_evening&!post', talk: [{ if: 'post', scene: 'sb.hoshino_home_post' }, { if: 'sb_lamp_lit', scene: 'sb.hoshino_after' }, { scene: 'sb.hoshino' }] },
    ],
  });
  interior('sb.goatshed', T('Tetsuji\'s Goat Shed', 'テツジ の ヤギ{小屋|ごや}'), 12, 9, 6, 'sb.hamlet', [6, 26], {
    ambient: { dark: 0.2, playerLight: 40 },
    terrain: K.build(12, 9, '#', (k) => { k.rect(1, 2, 10, 6, '_'); k.set(6, 8, '_'); k.vline(4, 2, 5, 'f'); k.vline(8, 2, 5, 'f'); }),
    props: [
      { p: 'exitmat', x: 6, y: 7 },
      { p: 'hay', x: 1, y: 2 }, { p: 'hay', x: 2, y: 2 }, { p: 'hay', x: 10, y: 2 }, { p: 'hay', x: 9, y: 3 },
      { p: 'sign', x: 6, y: 2, scene: 'sb.goat_note' },
      { p: 'pot', x: 10, y: 6 }, { p: 'crate', x: 1, y: 6 },
    ],
    npcs: [
      { id: 'sb_goat5', x: 2, y: 4, look: { custom: 'goat' }, wander: 1, talk: 'sb.goat' },
      { id: 'sb_goat6', x: 10, y: 4, look: { custom: 'goat', col: '#d8c0a0', col2: '#a88a6a' }, wander: 1, talk: 'sb.goat' },
      { id: 'sb_kid1', x: 6, y: 4, look: { custom: 'goat', col: '#f8f4ec' }, talk: 'sb.goat_kid' },
      { id: 'sb_kid2', x: 7, y: 4, look: { custom: 'goat', col: '#e8dcc8' }, talk: 'sb.goat_kid' },
      { id: 'sb_goat_momo', x: 6, y: 3, look: { custom: 'goat', col: '#f0e8dc' }, talk: 'sb.goat_momo' },
    ],
  });
  interior('sb.sachi', T('Sachi and Kanta\'s House', 'サチ と カンタ の {家|いえ}'), 9, 8, 4, 'sb.hamlet', [35, 17], {
    props: [
      { p: 'exitmat', x: 4, y: 6 },
      { p: 'loom', x: 1, y: 2, scene: 'sb.sachi_loom' }, { p: 'bed', x: 7, y: 2 }, { p: 'table', x: 3, y: 4 },
      { p: 'stove', x: 6, y: 2 }, { p: 'crate', x: 1, y: 5, scene: 'sb.sachi_box' },
    ],
    npcs: [
      { id: 'sachi', x: 5, y: 3, dir: 'down', if: 'sb_evening&!post', talk: 'sb.sachi' },
    ],
  });
  interior('sb.fuki', T('Fuki\'s House', 'フキ の {家|いえ}'), 8, 7, 3, 'sb.hamlet', [10, 8], {
    ambient: { dark: 0.15, playerLight: 36 },
    props: [
      { p: 'exitmat', x: 3, y: 5 },
      { p: 'bed', x: 1, y: 2 }, { p: 'stove', x: 6, y: 2 },
      { p: 'bookpile', x: 5, y: 4, scene: 'sb.fuki_notebook' },
      { p: 'smalltable', x: 3, y: 2, scene: 'sb.fuki_tea' },
    ],
    npcs: [
      { id: 'fuki', x: 2, y: 3, dir: 'right', if: '!sb_storm&!sb_evening&!post', talk: 'sb.fuki' },
    ],
  });
})(RB.content, RB.mapkit);
