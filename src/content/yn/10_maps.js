/* Steamhollow, Chapter 11: the maps (expansion P13; docs/future/work/P13_STEAMHOLLOW.md). Down from the Cloudroad Pass
 * through steaming rock (yn.descent) into the valley: the upper town with the Upper House (上の湯) and the
 * bath-keepers' hall (yn.upper); the lower town across the river, with the Lower House (下の湯), the market and the red
 * bridge, Kikue's dispensary, the little theatre and the spring house over the source (yn.lower); the river terraces
 * with their paddies and the footbath (yn.terraces); and the north road out of the valley (yn.north), which climbs to
 * the foot of the Archive road once the valley has agreed (yn_done). Interiors: the two inns' lobbies and baths, the
 * dispensary, the guild hall, the theatre. The Steam Vents are in 11_vents.js. Twelve-chapter journeys only.
 *
 * The town's mood follows the story: steam and lanterns always; the quarrel's tremors shake the screen in the scenes,
 * not the maps; at dusk (the evening scenes set it) the paper windows glow persimmon. The companion is away while
 * yn_apart holds (Mio's and Suzu's nights apart), and on the far side of the bamboo partition while yn_bath_apart
 * holds (the baths follow pronouns: src/engine/58y_baths.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TOWN = { region: 'steamhollow', place: 'steamhollow', travel: 'steamhollow', music: [{ if: 'yn_evening&!yn_done', id: 'yn_evening' }, { id: 'steamhollow' }], edition: 2, noCompanion: '!yn_apart' };
  const STEAM = { weather: 'motes', tint: 'rgba(240,236,226,0.10)' };
  const DUSK = { if: 'yn_evening&!yn_done', ambient: { weather: 'motes', tint: 'rgba(232,130,70,0.16)', dark: 0.18 } };
  const steam = (x, y) => ({ p: 'yn_steam', x, y });

  // ==== the way down (湯けむりの坂): from the Pass through steaming rock ================================================
  C.maps['yn.descent'] = Object.assign({}, TOWN, {
    name: T('The Steaming Slope', '{湯煙|ゆけむり} の {坂|さか}'), ambient: STEAM,
    terrain: K.build(32, 26, 'a', (k) => {
      k.ragged('top', '^', 2, 1301).ragged('bottom', '^', 2, 1302).ragged('right', '^', 2, 1303).ragged('left', '^', 2, 1304);
      // three shelves of rock the path switches back across
      k.hline(0, 26, 8, '^', 1); k.hline(5, 31, 14, '^', 1); k.hline(0, 26, 20, '^', 1);
      k.scatter('s', 12, 1305, [2, 2, 28, 22], 'a');
      k.scatter('h', 8, 1306, [2, 2, 28, 22], 'a');
      k.path([[0, 4], [28, 4], [28, 10], [3, 10], [3, 16], [28, 16], [28, 22], [31, 22]], ':', 2);
    }),
    props: [
      steam(8, 6), steam(18, 2), steam(22, 12), steam(10, 18), steam(20, 23), steam(14, 12),
      { p: 'stone_marker', x: 6, y: 3, scene: 'yn.descent_stone' },
      { p: 'bench', x: 14, y: 9, scene: 'yn.descent_view' },
    ],
    npcs: [
      { id: 'yn_yasuke', x: 9, y: 16, dir: 'down', if: '!yn_done', talk: [{ if: 'yn_yasuke_met', scene: 'yn.yasuke_idle' }, { scene: 'yn.yasuke_road' }] },
    ],
    foes: [
      { id: 'e1', enemy: 'yn.steamwisp', x: 18, y: 10, patrol: 2 },
      { id: 'e2', enemy: 'yn.pebbles', x: 16, y: 16, patrol: 1 },
    ],
    exits: [
      { x: 0, y: 4, w: 1, h: 2, to: 'cr.summit', sp: 'from_steam', dir: 'left' },
      { x: 31, y: 22, w: 1, h: 2, to: 'yn.upper', sp: 'from_descent', dir: 'right' },
    ],
    onEnter: [{ scene: 'yn.descent_first', if: '!yn_descent_seen' }],
    spawn: { default: [1, 4, 'right'], from_pass: [1, 4, 'right'], from_upper: [30, 22, 'left'] },
  });

  // ==== the upper town (上の町): the Upper House and the bath-keepers' hall ============================================
  C.maps['yn.upper'] = Object.assign({}, TOWN, {
    name: T('Steamhollow, the Upper Town', '{湯|ゆ}ノ{谷|たに} ・ {上|かみ} の {町|まち}'), ambient: STEAM, alt: [DUSK],
    terrain: K.build(40, 30, '.', (k) => {
      k.ragged('top', 'Q', 2, 1311).ragged('left', 'Q', 2, 1312).ragged('right', 'Q', 2, 1313);
      // the main street west to east, the cross street down to the lower town (and, at the top, the north road)
      k.rect(0, 15, 40, 2, '='); k.rect(19, 0, 2, 30, '=');
      k.rect(0, 12, 40, 3, '+'); k.rect(0, 17, 40, 2, '+');
      k.scatter(';', 10, 1314, [1, 20, 38, 9], '.');
      k.scatter('o', 6, 1315, [1, 20, 38, 9], '.');
    }),
    structs: [
      { type: 'house', x: 3, y: 4, w: 14, h: 7, roof: 'tile', wall: 'wood', door: 7, windows: [2, 5, 9, 12], to: 'yn.kami', spawn: [7, 8], lit: true, sign: true, signX: 3 },
      { type: 'house', x: 24, y: 4, w: 11, h: 7, roof: 'tile', wall: 'wood', door: 5, windows: [2, 8], to: 'yn.guild', spawn: [7, 8], lit: true, sign: true, signX: 2 },
      { type: 'house', x: 4, y: 21, w: 7, h: 5, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 5], lit: true },
      { type: 'house', x: 29, y: 21, w: 7, h: 5, roof: 'tile', wall: 'wood', door: 3, windows: [1, 5], lit: true },
    ],
    props: [
      { p: 'yn_footbath', x: 22, y: 19, scene: 'yn.footbath' },
      { p: 'yn_steambox', x: 13, y: 19, scene: 'yn.steambox' },
      { p: 'noticeboard', x: 17, y: 11, scene: 'yn.upper_board' },
      { p: 'sg_stall', x: 31, y: 12, scene: 'yn.geta_stall' },
      { p: 'lamppost', x: 18, y: 17 }, { p: 'lamppost', x: 21, y: 12 }, { p: 'lamppost', x: 2, y: 17 }, { p: 'lamppost', x: 37, y: 17 },
      steam(12, 22), steam(25, 23), steam(36, 13), steam(8, 18),
      { p: 'stone_marker', x: 21, y: 2, scene: 'yn.north_closed', if: '!yn_done' },
    ],
    npcs: [
      { id: 'yn_rokubei', x: 24, y: 18, dir: 'left', if: '!yn_rokubei_met', talk: 'yn.rokubei_first' },
      { id: 'yn_tama', x: 15, y: 18, dir: 'up', talk: [{ if: 'yn_done', scene: 'yn.tama_after' }, { if: 'yn_eggs_cooked&!yn_buns_cooked', scene: 'yn.tama_buns' }, { if: 'yn_eggs_cooked', scene: 'yn.tama_idle' }, { scene: 'yn.tama' }] },
      { id: 'yn_kihachi', x: 34, y: 12, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.kihachi_after' }, { scene: 'yn.kihachi' }] },
      { id: 'yn_toki', x: 2, y: 13, dir: 'right', talk: [{ if: 'yn_done', scene: 'yn.toki_after' }, { scene: 'yn.toki' }] },
      { id: 'yn_senta', x: 26, y: 20, dir: 'up', talk: [{ if: 'yn_done', scene: 'yn.senta_after' }, { scene: 'yn.senta' }] },
      { id: 'yn_heikichi', x: 12, y: 12, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.heikichi_after' }, { scene: 'yn.heikichi' }] },
    ],
    exits: [
      { x: 0, y: 15, w: 1, h: 2, to: 'yn.descent', sp: 'from_upper', dir: 'left' },
      { x: 19, y: 29, w: 2, h: 1, to: 'yn.lower', sp: 'from_upper', dir: 'down' },
      { x: 19, y: 0, w: 2, h: 1, to: 'yn.north', sp: 'from_town', dir: 'up', if: 'yn_done' },
    ],
    triggers: [{ x: 19, y: 1, w: 2, h: 1, scene: 'yn.north_closed', if: '!yn_done' }],
    onEnter: [{ scene: 'yn.arrive', if: '!yn_arrived' }],
    spawn: { default: [2, 15, 'right'], from_descent: [1, 15, 'right'], from_lower: [19, 28, 'up'], from_north: [19, 1, 'down'] },
  });

  // ==== the lower town (下の町): the Lower House, the market and the red bridge, the source =============================
  C.maps['yn.lower'] = Object.assign({}, TOWN, {
    name: T('Steamhollow, the Lower Town', '{湯|ゆ}ノ{谷|たに} ・ {下|しも} の {町|まち}'), ambient: STEAM, alt: [DUSK],
    terrain: K.build(40, 30, '.', (k) => {
      k.ragged('bottom', '^', 2, 1321).ragged('left', 'Q', 2, 1322).ragged('right', 'Q', 2, 1323);
      // the river, north to south, and the red bridge the street crosses it by
      k.rect(26, 0, 5, 30, '~'); k.rect(25, 0, 1, 30, 'w'); k.rect(31, 0, 1, 30, 'w');
      k.rect(0, 15, 40, 2, '='); k.rect(25, 15, 7, 2, 'b');
      k.rect(19, 0, 2, 15, '=');
      k.rect(0, 13, 25, 2, '+'); k.rect(32, 13, 8, 2, '+');
      k.scatter(';', 8, 1324, [1, 18, 23, 10], '.');
      // the path down to the spring house's stair
      k.path([[34, 17], [34, 26], [36, 26]], ':', 2);
    }),
    structs: [
      { type: 'house', x: 3, y: 4, w: 13, h: 7, roof: 'thatch', wall: 'wood', door: 6, windows: [2, 5, 8, 11], to: 'yn.shimo', spawn: [6, 8], lit: true, sign: true, signX: 3 },
      { type: 'house', x: 4, y: 20, w: 8, h: 5, roof: 'tile', wall: 'wood', door: 4, windows: [1, 6], to: 'yn.dispensary', spawn: [4, 6], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 32, y: 3, w: 7, h: 7, roof: 'tile', wall: 'wood', door: 3, windows: [1, 5], to: 'yn.playhouse', spawn: [8, 9], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 35, y: 19, w: 5, h: 4, roof: 'slate', wall: 'stone', door: 2, windows: [], lit: false },
    ],
    props: [
      { p: 'sg_stall', x: 10, y: 17, scene: 'yn.tokube_stall' },
      { p: 'sg_stall', x: 16, y: 12, scene: 'yn.onatsu_stall' },
      { p: 'yn_divider', x: 32, y: 24, scene: 'yn.divider' },
      { p: 'lamppost', x: 24, y: 17 }, { p: 'lamppost', x: 32, y: 14 }, { p: 'lamppost', x: 18, y: 17 }, { p: 'lamppost', x: 2, y: 12 },
      steam(29, 6), steam(28, 22), steam(14, 24), steam(37, 24), steam(22, 4),
      // the stone steps down behind the spring house: the grille's notice until Aki opens it, then a way down
      { p: 'stairs', x: 37, y: 26, if: '!yn_vents_open', scene: 'yn.vents_door' },
      { p: 'stairs', x: 37, y: 26, if: 'yn_vents_open' },
    ],
    npcs: [
      { id: 'mp_tokube', x: 11, y: 18, dir: 'up', if: '!yn_tokube_gone', talk: [{ if: 'yn_done', scene: 'yn.tokube_after' }, { if: 'yn_tokube_done', scene: 'yn.tokube_idle' }, { scene: 'yn.tokube' }] },
      { id: 'yn_onatsu', x: 17, y: 11, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.onatsu_after' }, { scene: 'yn.onatsu' }] },
      { id: 'yn_tsuneji', x: 22, y: 18, dir: 'left', if: '!yn_done', talk: 'yn.tsuneji' },
      { id: 'yn_aki', x: 33, y: 22, dir: 'down', if: '!yn_vents_open', talk: [{ if: 'quest.yn_main>=5', scene: 'yn.aki_ready' }, { scene: 'yn.aki' }] },
    ],
    exits: [
      { x: 19, y: 0, w: 2, h: 1, to: 'yn.upper', sp: 'from_lower', dir: 'up' },
      { x: 39, y: 15, w: 1, h: 2, to: 'yn.terraces', sp: 'from_lower', dir: 'right' },
      // shut until the vents are opened: walking onto it then says why (MW-1), as using it does
      { x: 37, y: 26, w: 1, h: 1, to: 'yn.vents1', sp: 'from_lower', dir: 'down', locked: 'yn.vents_door', unlock: 'yn_vents_open' },
    ],
    triggers: [{ x: 25, y: 15, w: 1, h: 2, scene: 'yn.bridge_quarrel', if: 'yn_rooms_done&yn_shimo_heard&!yn_quarrel' }],
    onEnter: [{ scene: 'yn.lower_first', if: '!yn_lower_seen' }],
    spawn: { default: [19, 1, 'down'], from_upper: [19, 1, 'down'], from_terraces: [38, 15, 'left'], from_vents: [36, 26, 'left'] },
  });

  // ==== the river terraces (棚田): paddies, the footbath and the spring's little shrine ================================
  C.maps['yn.terraces'] = Object.assign({}, TOWN, {
    name: T('The River Terraces', '{川|かわ} の {棚田|たなだ}'), ambient: { weather: 'motes', tint: 'rgba(230,236,220,0.06)' }, alt: [DUSK],
    terrain: K.build(36, 24, 'F', (k) => {
      k.ragged('top', 'Q', 2, 1331).ragged('right', 'Q', 2, 1332);
      k.rect(0, 20, 36, 4, '~'); k.rect(0, 19, 36, 1, 'w');
      // terrace walls, each with a gap; the path down through them
      k.hline(0, 35, 6, '^', 1); k.hline(0, 35, 11, '^', 1); k.hline(0, 35, 16, '^', 1);
      k.path([[0, 8], [8, 8], [8, 3], [20, 3], [20, 13], [12, 13], [12, 17], [28, 17]], ':', 2);
      k.rect(26, 12, 6, 4, '+');
    }),
    props: [
      { p: 'yn_footbath', x: 26, y: 13, scene: 'yn.terrace_footbath' },
      { p: 'shrine', x: 22, y: 2, scene: 'yn.shrine' },
      { p: 'yn_kakehi', x: 31, y: 13, scene: 'yn.kakehi' },
      { p: 'lamppost', x: 25, y: 12 },
      steam(29, 11), steam(5, 18),
    ],
    npcs: [
      { id: 'yn_kanae', x: 27, y: 15, dir: 'up', talk: [{ if: 'yn_poet_done', scene: 'yn.kanae_idle' }, { scene: 'yn.kanae' }] },
    ],
    // the Towel Thief, flapping between the paddies (protect the towel you were lent: yn.towel)
    foes: [{ id: 'w_towel', enemy: 'yn.towelthief', encounter: 'yn.towel', x: 15, y: 9, patrol: 2, if: 'yn_rooms_done&!yn_towel_kept' }],
    exits: [{ x: 0, y: 8, w: 1, h: 2, to: 'yn.lower', sp: 'from_terraces', dir: 'left' }],
    onEnter: [{ scene: 'yn.terraces_first', if: '!yn_terraces_seen' }],
    spawn: { default: [1, 8, 'right'], from_lower: [1, 8, 'right'] },
  });

  // ==== the north road (北の道): out of the valley, up to the foot of the Archive road ==================================
  // Quieter with every turn: near the top the valley's noise falls away and the mountain above is soundless (S15).
  C.maps['yn.north'] = Object.assign({}, TOWN, {
    name: T('The North Road', '{北|きた} の {道|みち}'), music: 'yn_north',
    ambient: { weather: 'motes', tint: 'rgba(200,204,210,0.14)' },
    terrain: K.build(30, 26, '.', (k) => {
      k.ragged('left', '^', 3, 1341).ragged('right', '^', 3, 1342);
      k.scatter('Q', 14, 1343, [3, 0, 24, 26], '.');
      k.path([[19, 25], [19, 20], [8, 20], [8, 12], [22, 12], [22, 5], [14, 5], [14, 0]], ':', 2);
      k.scatter('r', 6, 1344, [3, 0, 24, 26], '.');
    }),
    props: [
      { p: 'stone_marker', x: 16, y: 3, scene: 'yn.north_stone' },
      { p: 'deadlantern', x: 10, y: 11, scene: 'yn.north_lantern', o: { staysDark: true } },
    ],
    npcs: [],
    foes: [{ id: 'e1', enemy: 'yn.lostguest', x: 12, y: 20, patrol: 2 }, { id: 'e2', enemy: 'yn.chochin', x: 20, y: 12, patrol: 2 }],
    exits: [
      { x: 19, y: 25, w: 2, h: 1, to: 'yn.upper', sp: 'from_north', dir: 'down' },
      { x: 14, y: 0, w: 2, h: 1, to: 'sa.road', sp: 'from_prev', dir: 'up', if: 'yn_done' },
    ],
    onEnter: [{ scene: 'yn.north_first', if: '!yn_north_seen' }],
    spawn: { default: [19, 24, 'up'], from_town: [19, 24, 'up'] },
  });

  // ---- interiors ---------------------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, outside, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', place: 'steamhollow', music: null, noTravel: true, travelKind: 'interior', edition: 2, noCompanion: '!yn_apart',
      terrain: K.room(w, h, '_', doorX),
      props: [], npcs: [],
      exits: [{ x: doorX, y: h - 1, to: outside, tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  // the Upper House's lobby (上の湯): the front desk and its book, the house rules framed by the stair, the curtains to
  // the baths, the proprietress's tea
  interior('yn.kami', T('The Upper House', '{上|かみ}の{湯|ゆ}'), 15, 10, 7, 'yn.upper', [10, 11], {
    terrain: K.build(15, 10, '#', (k) => { k.rect(1, 2, 13, 7, 'm'); k.rect(5, 6, 5, 3, '_'); k.set(7, 9, '_'); }),
    props: [
      { p: 'exitmat', x: 7, y: 8 }, { p: 'counter', x: 9, y: 3, w: 4, across: true, scene: 'yn.kami_desk' },
      { p: 'sign', x: 2, y: 2, scene: 'yn.kami_rules' },
      { p: 'yn_noren', x: 1, y: 4, o: { side: 'men' }, scene: 'yn.bath_kami' },
      { p: 'yn_noren', x: 13, y: 4, o: { side: 'women' }, scene: 'yn.bath_kami' },
      { p: 'yn_noren', x: 13, y: 6, o: { side: 'private' }, scene: 'yn.bath_kami' },
      { p: 'stairs', x: 5, y: 2, scene: 'yn.kami_room' }, { p: 'lantern', x: 3, y: 6, o: { lit: true } }, { p: 'teaset', x: 7, y: 3 },
    ],
    npcs: [
      { id: 'yn_tokuzo', x: 10, y: 2, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.tokuzo_after' }, { if: 'quest.yn_main>=2&!yn_rooms_done', scene: 'yn.rooms_start' }, { scene: 'yn.tokuzo' }] },
      { id: 'yn_oritsu', x: 7, y: 4, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.oritsu_after' }, { if: 'yn_oritsu_met', scene: 'yn.oritsu_idle' }, { scene: 'yn.oritsu_first' }] },
      { id: 'yn_okiyo', x: 3, y: 5, dir: 'right', talk: [{ if: 'yn_rules_kami', scene: 'yn.okiyo_idle' }, { scene: 'yn.okiyo_rules' }] },
    ],
    onEnter: [{ scene: 'yn.kami_first', if: '!yn_kami_seen' }],
  });
  // the Upper House's bath (内湯): a wash place with stools and buckets, the cedar bath, the bamboo partition to the
  // other side; steam over everything
  interior('yn.kami_bath', T('The Upper House\'s Bath', '{上|かみ}の{湯|ゆ} の {内湯|うちゆ}'), 14, 10, 7, 'yn.kami', [7, 7], {
    noCompanion: '!yn_apart&!yn_bath_apart', ambient: { weather: 'motes', tint: 'rgba(240,240,236,0.22)' },
    terrain: K.build(14, 10, '#', (k) => { k.rect(1, 2, 12, 7, '+'); k.rect(2, 2, 10, 3, '~'); k.set(7, 9, '+'); }),
    props: [
      { p: 'exitmat', x: 7, y: 8 }, { p: 'yn_partition', x: 12, y: 2 }, { p: 'yn_partition', x: 12, y: 4 },
      { p: 'bench', x: 2, y: 7, scene: 'yn.wash' }, { p: 'pot', x: 4, y: 7 }, { p: 'pot', x: 9, y: 7 },
      { p: 'mat', x: 6, y: 5, scene: 'yn.soak' },
      steam(4, 3), steam(9, 2),
    ],
    exits: [{ x: 7, y: 9, to: 'yn.kami', tx: 7, ty: 7, dir: 'down' }],
    // (the bath itself is played by the curtain's scene as you step in: an enter event that may repeat would play it
    // again after every scene in the bath)
    spawn: { default: [7, 8, 'up'] },
  });
  // the Lower House's lobby (下の湯): loud, warm; the house rules on one short board; the way out back to the open-air
  // bath; Zenroku's corner
  interior('yn.shimo', T('The Lower House', '{下|しも}の{湯|ゆ}'), 15, 10, 6, 'yn.lower', [9, 11], {
    // (the earthen entrance, 土間, inside the door: packed earth, with the raised floor's edge along it; RBN-QA-114)
    terrain: K.build(15, 10, '#', (k) => { k.rect(1, 2, 13, 7, '_'); k.rect(9, 3, 4, 3, 'm'); k.rect(5, 7, 3, 2, ':'); k.set(6, 9, ':'); k.set(13, 2, '_'); }),
    props: [
      { p: 'yn_doma', x: 5, y: 7 },
      { p: 'exitmat', x: 6, y: 8 }, { p: 'counter', x: 2, y: 3, w: 3, across: true, scene: 'yn.shimo_desk' },
      { p: 'noticeboard', x: 6, y: 2, scene: 'yn.shimo_rules' },
      { p: 'yn_noren', x: 13, y: 2, o: { side: 'men' }, scene: 'yn.bath_shimo' },
      { p: 'sb_irori', x: 10, y: 6 }, { p: 'lantern', x: 1, y: 6, o: { lit: true } }, { p: 'bench', x: 3, y: 7 },
    ],
    npcs: [
      { id: 'yn_tahei', x: 3, y: 2, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.tahei_after' }, { if: 'yn_shimo_heard', scene: 'yn.tahei_idle' }, { scene: 'yn.tahei_first' }] },
      { id: 'yn_kane', x: 5, y: 5, dir: 'left', talk: [{ if: 'yn_done', scene: 'yn.kane_after' }, { if: 'yn_complaint_done', scene: 'yn.kane_idle' }, { if: 'yn_shimo_heard', scene: 'yn.complaint_start' }, { scene: 'yn.kane' }] },
      { id: 'yn_zenroku', x: 11, y: 4, dir: 'left', if: '!yn_done', talk: [{ if: 'yn_complaint_done', scene: 'yn.zenroku_idle' }, { scene: 'yn.zenroku' }] },
    ],
    onEnter: [{ scene: 'yn.shimo_first', if: '!yn_shimo_seen' }],
  });
  // the Lower House's open-air bath (露天風呂): rocks, steam, the night sky over the river, a bamboo fence between the
  // two sides
  C.maps['yn.shimo_bath'] = {
    name: T('The Lower House\'s Open-Air Bath', '{下|しも}の{湯|ゆ} の {露天風呂|ろてんぶろ}'), region: 'steamhollow', place: 'steamhollow', music: 'yn_evening',
    noTravel: true, travelKind: 'interior', edition: 2, noCompanion: '!yn_apart&!yn_bath_apart',
    ambient: { weather: 'motes', tint: 'rgba(60,70,100,0.22)', dark: 0.28 },
    terrain: K.build(18, 12, '^', (k) => {
      k.rect(1, 1, 16, 10, '+'); k.rect(3, 2, 10, 5, '~'); k.ragged('top', '^', 1, 1351);
      k.scatter('h', 6, 1352, [1, 7, 16, 3], '+');
    }),
    props: [
      { p: 'yn_partition', x: 14, y: 2 }, { p: 'yn_partition', x: 14, y: 4 }, { p: 'yn_partition', x: 14, y: 6 },
      { p: 'mat', x: 8, y: 7, scene: 'yn.soak' }, { p: 'bench', x: 2, y: 8, scene: 'yn.wash' },
      { p: 'lantern', x: 12, y: 8, o: { lit: true } },
      steam(5, 3), steam(10, 2), steam(8, 5),
    ],
    exits: [{ x: 1, y: 9, w: 1, h: 1, to: 'yn.shimo', tx: 12, ty: 3, dir: 'left' }],
    // (the bath itself is played by the curtain's scene as you step in)
    spawn: { default: [2, 9, 'right'] },
  };
  // Kikue's dispensary (薬処): jars with honest labels, a futon for a patient, a stove
  interior('yn.dispensary', T('Kikue\'s Dispensary', 'キクエ の {薬処|くすりどころ}'), 11, 8, 4, 'yn.lower', [8, 25], {
    props: [
      { p: 'exitmat', x: 4, y: 6 }, { p: 'shelf', x: 1, y: 2, scene: 'yn.kikue_shelf' }, { p: 'shelf', x: 3, y: 2 },
      { p: 'bottles', x: 6, y: 2, scene: 'yn.kikue_jars' }, { p: 'sb_futon', x: 8, y: 4, scene: 'yn.patient_futon' },
      { p: 'stove', x: 9, y: 2 }, { p: 'lantern', x: 10, y: 5, o: { lit: true } },
    ],
    npcs: [
      { id: 'yn_kikue', x: 5, y: 3, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.kikue_after' }, { if: 'yn_kikue_met', scene: 'yn.kikue_idle' }, { scene: 'yn.kikue_first' }] },
    ],
  });
  // the bath-keepers' hall (湯守の寄合所): the long table where the valley's arguments are had, the guild's ledger, a
  // model of the channels
  interior('yn.guild', T('The Bath-Keepers\' Hall', '{湯守|ゆもり} の {寄合所|よりあいじょ}'), 15, 10, 7, 'yn.upper', [29, 11], {
    terrain: K.build(15, 10, '#', (k) => { k.rect(1, 2, 13, 7, 'm'); k.rect(6, 7, 3, 2, '_'); k.set(7, 9, '_'); }),
    props: [
      { p: 'exitmat', x: 7, y: 8 }, { p: 'table', x: 5, y: 4, w: 5, scene: 'yn.guild_table' },
      { p: 'desk', x: 12, y: 3, scene: 'yn.guild_ledger' }, { p: 'yn_divider', x: 1, y: 3, scene: 'yn.guild_model' },
      { p: 'lantern', x: 1, y: 7, o: { lit: true } }, { p: 'lantern', x: 13, y: 7, o: { lit: true } },
    ],
    npcs: [
      { id: 'yn_rokubei', x: 7, y: 3, dir: 'down', if: 'yn_rokubei_met', talk: [{ if: 'yn_done', scene: 'yn.rokubei_after' }, { if: 'yn_kettle_settled&yn_eve_done&!yn_mediated', scene: 'yn.mediation_start' }, { if: 'yn_kettle_settled&!yn_eve_done', scene: 'yn.rokubei_tomorrow' }, { if: 'yn_quarrel&!yn_vents_open', scene: 'yn.rokubei_vents' }, { scene: 'yn.rokubei_idle' }] },
    ],
    onEnter: [{ scene: 'yn.guild_after_quarrel', if: 'yn_quarrel&!yn_guild_told' }],
  });
  // the little theatre (芝居小屋): a raised stage, benches, the troupe's baskets
  interior('yn.playhouse', T('The Little Theatre', '{芝居|しばい}{小屋|ごや}'), 17, 11, 8, 'yn.lower', [35, 10], {
    terrain: K.build(17, 11, '#', (k) => { k.rect(1, 2, 15, 8, '_'); k.rect(3, 2, 11, 3, 'm'); k.set(8, 10, '_'); }),
    props: [
      { p: 'exitmat', x: 8, y: 9 }, { p: 'bench', x: 4, y: 6 }, { p: 'bench', x: 7, y: 6 }, { p: 'bench', x: 10, y: 6 },
      { p: 'bench', x: 4, y: 8 }, { p: 'bench', x: 10, y: 8 }, { p: 'crate', x: 14, y: 3, scene: 'yn.troupe_baskets' },
      { p: 'lantern', x: 2, y: 3, o: { lit: true } }, { p: 'lantern', x: 14, y: 6, o: { lit: true } },
    ],
    npcs: [
      { id: 'yn_koume', x: 7, y: 3, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.koume_after' }, { if: 'comp=suzu&!yn_koume_met', scene: 'yn.koume_suzu' }, { scene: 'yn.koume' }] },
      { id: 'yn_shinza', x: 11, y: 3, dir: 'down', talk: [{ if: 'yn_done', scene: 'yn.shinza_after' }, { scene: 'yn.shinza' }] },
      { id: 'yn_ginnojo', x: 4, y: 7, dir: 'up', talk: [{ if: 'yn_actor_done', scene: 'yn.ginnojo_idle' }, { scene: 'yn.ginnojo' }] },
    ],
    onEnter: [{ scene: 'yn.playhouse_first', if: '!yn_playhouse_seen' }],
  });
})(RB.content, RB.mapkit);
