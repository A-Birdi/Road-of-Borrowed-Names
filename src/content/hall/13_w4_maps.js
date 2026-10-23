/* The Hall of a Hundred Tales, wing 4, The Borrowed Umbrella (invented, in the style of real folktales; the karakasa,
 * an old umbrella grown into a spirit that hops on its one leg, is a real image of Japanese folklore): the floors and
 * the wing (expansion P15; plan 04_DUNGEONS.md D9). Its theme: requests, permission, intention and misunderstanding
 * (～てください and ～てもらえますか, and said without naming the thing at all; ～てもいい and ～てはいけない,
 * ～なければならない and ～なくてもいい; ～つもり and ～ようと思う; at the top the humble ways to ask).
 *   1 · Gosaku's Village (hall.w4f1): the tale in four pictures in Gosaku's house (t1), the neighbours who come to
 *       borrow from his pack, each asking in their own way (t2), the peddler's cards on asking, one wrong (t3); a
 *       bench.
 *   2 · The Closed River (hall.w4f2): Gosaku's diary of a year ago, followed fork by fork the way he really went,
 *       not the way he meant to (t4), the reeds in the flood (t5, rain: rooted), the river notice in your companion's
 *       hands and the one crossing it allows today (t6, an information gap), the riddle stone (t7, a reprieve); a
 *       bench, a spring, a resting place.
 *   3 · The Mountain Temple (hall.w4f3): the temple's rules for visitors, kept (what you must do, may do and must not
 *       do) on the way into the hall (t8), the umbrella at the gate, sure it was never meant to come back (t9), and
 *       the umbrella returned to Myōshin (t10, the capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w4.pat) chooses
 * who needs what, the diary's year, the crossing the notice allows and the temple's rules. The river closure (川留め)
 * is a real custom of the old highways: in a flood the crossings were shut by notice until the water fell. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w4';
  const AMB = { dark: 0.2, playerLight: 60, weather: 'rain', tint: 'rgba(120,140,150,0.12)' };

  // ==== floor 1: Gosaku's Village ===========================================================================================
  // Gosaku's house to the west (the story room); his pack's four things on the veranda; the four neighbours round the
  // square; the peddler's cards on asking by the north-west wall.
  const ITEMS = { mino: [24, 7], towel: [26, 7], lamp: [28, 7], sandals: [30, 7] };
  const PEOPLE = { oume: [8, 9], otake: [13, 8], kyubei: [22, 15], kaede: [27, 12] };
  C.hallW4 = { ITEMS, PEOPLE };
  C.maps['hall.w4f1'] = Object.assign({}, K.base(W), {
    name: T('Gosaku\'s Village', 'ゴサク の {村|むら}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in
      k.rect(4, 6, 25, 12, '.');                 // the village square
      k.rect(16, 1, 2, 21, ':');                 // the road north to the river, and south
      k.rect(4, 11, 25, 2, ':');                 // the street east and west
      k.rect(1, 8, 6, 7, '_');                   // west: Gosaku's house (the story room)
      k.rect(23, 6, 9, 3, '_');                  // north-east: Gosaku's veranda, with his pack
      k.rect(4, 2, 11, 4, '.');                  // north-west: the peddler's cards
      k.scatter('T', 6, 1591, [6, 14, 8, 3], '.'); k.scatter(',', 12, 1592, [4, 6, 24, 11], '.');
      k.rect(16, 1, 2, 21, ':'); k.rect(4, 11, 25, 2, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [16, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w4.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        // the pack's four things (gone once lent)
        { p: 'hay', x: ITEMS.mino[0], y: ITEMS.mino[1], scene: 'hall.w4.i_mino', if: '!xp_hall_w4_f0_gave_mino' },
        { p: 'chest', x: ITEMS.towel[0], y: ITEMS.towel[1], scene: 'hall.w4.i_towel', if: '!xp_hall_w4_f0_gave_towel' },
        { p: 'lantern', x: ITEMS.lamp[0], y: ITEMS.lamp[1], scene: 'hall.w4.i_lamp', if: '!xp_hall_w4_f0_gave_lamp', light: 26, o: { lit: true } },
        { p: 'crate', x: ITEMS.sandals[0], y: ITEMS.sandals[1], scene: 'hall.w4.i_sandals', if: '!xp_hall_w4_f0_gave_sandals' },
        ...K.andon(22, 7, W, 't2'),
        // the peddler's cards, and the stone that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w4.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w4.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w4.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w4.card4' },
        { p: 'stone_marker', x: 13, y: 3, scene: 'hall.w4.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10), K.lit(15, 14),
      ]),
    npcs: [
      { id: 'hall_gosaku', x: 5, y: 13, dir: 'right', talk: [{ scene: 'hall.w4.gosaku1' }] },
      ...Object.keys(PEOPLE).map((w) => ({ id: 'hall_' + w, x: PEOPLE[w][0], y: PEOPLE[w][1], dir: 'down', talk: [{ scene: 'hall.w4.n_' + w }] })),
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w4f2', sp: 'from_below', dir: 'up', if: 'hall.w4.f0.clear' }],
    onEnter: [{ scene: 'hall.w4.f1_first', if: '!hall_w4_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Closed River ===========================================================================================
  // The path north to the river forks three times; at each fork two ways, each with its marker (the diary's choices).
  // The river along the north with its three crossings (the bridge, the ford, the ferry boat) and the notice board.
  const FORKS = {
    f1: { bridge: [11, 18], bank: [25, 18] },
    f2: { teahouse: [10, 12], woods: [26, 12] },
    f3: { ferry: [12, 7], hut: [24, 7] },
  };
  const CROSS = { bridge: [8, 3], ford: [18, 3], boat: [23, 3] };
  Object.assign(C.hallW4, { FORKS, CROSS });
  C.maps['hall.w4f2'] = Object.assign({}, K.base(W), {
    name: T('The Closed River', '{川留|かわど}め の {川|かわ}'),
    ambient: Object.assign({}, AMB, { dark: 0.26 }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '.');                 // where you come in
      k.rect(17, 2, 2, 20, ':');                 // the path north to the river
      k.rect(8, 17, 20, 3, ':');                 // fork 1: the bridge road west, the bank east
      k.rect(8, 11, 20, 3, ':');                 // fork 2: the teahouse west, the woods east
      k.rect(10, 6, 16, 3, ':');                 // fork 3: the ferry landing west, the hut east
      k.rect(4, 2, 24, 3, '.');                  // the riverbank and its three crossings
      k.rect(28, 3, 4, 1, ':');                  // the narrow way on along the water (the rope closes it)
      k.rect(28, 9, 6, 5, '.');                  // east: the reeds in the flood
      k.rect(2, 20, 7, 5, '.');                  // south-west: the spring
      k.rect(9, 22, 6, 2, '.');
      k.rect(28, 19, 6, 5, '.');                 // south-east: the resting place
      k.rect(23, 22, 5, 2, '.');
      k.rect(3, 9, 5, 6, '.');                   // west: the riddle stone
      k.scatter('T', 6, 1601, [9, 14, 18, 2], '.'); k.scatter('T', 5, 1602, [9, 9, 18, 1], '.');
      k.rect(17, 2, 2, 20, ':'); k.rect(4, 2, 24, 3, '.');
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [28, 3], stairs: [30, 3] }),
      [
        { p: 'well', x: 4, y: 22, scene: 'hall.w4.spring' },
        // Gosaku's diary, and the forks' markers
        { p: 'sign', x: 20, y: 21, scene: 'hall.w4.t4_diary' }, ...K.andon(14, 21, W, 't4'),
        ...Object.keys(FORKS).flatMap((f) => Object.keys(FORKS[f]).map((w) => ({ p: 'sign', x: FORKS[f][w][0], y: FORKS[f][w][1] - 1, scene: 'hall.w4.' + f + '_' + w }))),
        // the river notice and its three crossings
        { p: 'sign', x: 22, y: 4, scene: 'hall.w4.t6' }, ...K.andon(26, 2, W, 't6'),
        { p: 'pillar', x: CROSS.bridge[0], y: CROSS.bridge[1], scene: 'hall.w4.x_bridge' },
        { p: 'rock', x: CROSS.ford[0] - 4, y: CROSS.ford[1], scene: 'hall.w4.x_ford' },
        { p: 'boat', x: CROSS.boat[0], y: CROSS.boat[1], scene: 'hall.w4.x_boat' },
        // the riddle stone (t7)
        { p: 'kr_stele', x: 4, y: 10, scene: 'hall.w4.t7' }, ...K.andon(6, 9, W, 't7'),
        ...K.andon(32, 9, W, 't5'),
        // the resting place (a delver may be waiting)
        { p: 'teaset', x: 31, y: 20 }, { p: 'bench', x: 30, y: 22 },
      ]),
    npcs: [],
    foes: [
      { id: 'b1', enemy: 'rw.reedling', encounter: 'hall.w4.reeds', scene: 'hall.w4.t5', x: 30, y: 11, patrol: 1, bg: 'reedwake', intro: { jp: '{増|ふ}えた {水|みず} の {中|なか} で 、 {葦|あし} が {生|い}き{物|もの} の よう に {揺|ゆ}れて いる 。', en: 'In the risen water, the reeds sway like living things.' } },
    ],
    exits: [{ x: 30, y: 3, w: 1, h: 1, to: 'hall.w4f3', sp: 'from_below', dir: 'up', if: 'hall.w4.f1.clear' }],
    onEnter: [{ scene: 'hall.w4.f2_first', if: '!hall_w4_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Mountain Temple ========================================================================================
  // The temple gate to the south, the rules board inside it; the stone basin, the bell, the stone for sandals and the
  // main hall's door; the umbrella at the gate; Myōshin on the veranda.
  const RULE = { basin: [8, 12], bell: [22, 11], stone: [14, 6], door: [16, 5] };
  Object.assign(C.hallW4, { RULE });
  C.maps['hall.w4f3'] = Object.assign({}, K.base(W), {
    name: T('The Mountain Temple', '{山寺|やまでら}'),
    ambient: Object.assign({}, AMB, { dark: 0.24 }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '.');                // where you come in
      k.rect(15, 7, 3, 12, ':');                 // the approach
      k.rect(4, 8, 24, 10, '+');                 // the temple yard
      k.rect(10, 2, 13, 5, '_');                 // the main hall's veranda
      k.scatter('T', 5, 1611, [4, 14, 5, 3], '+'); k.scatter('T', 5, 1612, [24, 14, 4, 3], '+');
      k.rect(15, 7, 3, 12, ':');
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'sign', x: 18, y: 17, scene: 'hall.w4.t8_rules' }, ...K.andon(12, 17, W, 't8'),
        { p: 'well', x: RULE.basin[0], y: RULE.basin[1], scene: 'hall.w4.r_basin' },
        { p: 'bell', x: RULE.bell[0], y: RULE.bell[1], scene: 'hall.w4.r_bell' },
        { p: 'stone_marker', x: RULE.stone[0], y: RULE.stone[1], scene: 'hall.w4.r_stone' },
        { p: 'door', x: RULE.door[0], y: RULE.door[1], scene: 'hall.w4.r_door' },
        ...K.andon(10, 9, W, 't9'),
        K.lit(14, 8), K.lit(18, 8),
      ]),
    npcs: [
      { id: 'hall_karakasa', x: 19, y: 19, dir: 'left', if: '!hall.w4.t9', talk: [{ scene: 'hall.w4.t9' }] },
      { id: 'hall_karakasa_after', char: 'hall_karakasa', x: 19, y: 4, dir: 'down', if: 'hall.w4.t9', talk: [{ scene: 'hall.w4.kasa_after' }] },
      { id: 'hall_myoshin', x: 13, y: 4, dir: 'down', talk: [{ scene: 'hall.w4.t10' }] },
      { id: 'hall_gosaku3', char: 'hall_gosaku', x: 17, y: 16, dir: 'up', talk: [{ scene: 'hall.w4.gosaku3' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w4.f3_first', if: '!hall_w4_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 4, title: T('The Borrowed Umbrella', '{借|か}りた {傘|かさ}'),
    theme: T('Asking, being allowed, meaning to, and being misunderstood.', '{頼|たの}む 、 {許|ゆる}す 、 つもり'),
    folklore: { en: 'An invented tale in the style of real folktales. Two things in it are real: the karakasa, an old umbrella that grows into a spirit and hops on its one leg, from Japanese folklore; and the river closures ({川留|かわど}め) of the old highways, when a crossing was shut by notice until the flood fell.' },
    music: 'hall_w4', hearth: C.hallHearths.w4, patterns: 2,
    grow: { en: 'asking without naming the thing, and permission and duty said politely: indirect requests, ～なければならない and ～なくてもいい (and, at the top, the humble ways to ask).' },
    floors: [
      { id: 'f1', map: 'hall.w4f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('Gosaku\'s Village', 'ゴサク の {村|むら}'),
        stations: { w4_b1: { kind: 'bench', map: 'hall.w4f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w4f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Closed River', '{川留|かわど}め の {川|かわ}'),
        stations: { w4_b2: { kind: 'bench', map: 'hall.w4f2', x: 21, y: 23 }, w4_sp: { kind: 'spring', map: 'hall.w4f2', x: 4, y: 22 } } },
      { id: 'f3', map: 'hall.w4f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Mountain Temple', '{山寺|やまでら}'),
        stations: { w4_b3: { kind: 'bench', map: 'hall.w4f3', x: 20, y: 22 } }, procedures: ['hall_w4_return'] },
    ],
    delvers: { f2: { map: 'hall.w4f2', x: 32, y: 21, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('The neighbours\' requests', '{近所|きんじょ} の {頼|たの}み') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The peddler\'s cards', '{行商人|ぎょうしょうにん} の {札|ふだ}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('Gosaku\'s diary', 'ゴサク の {日記|にっき}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('Reeds in the flood', '{増水|ぞうすい} の {葦|あし}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('The river notice', '{川留|かわど}め の {高札|こうさつ}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The temple\'s rules', '{寺|てら} の {決|き}まり') },
      { id: 't9', floor: 2, kind: 'social', title: T('The umbrella at the gate', '{門|もん} の {唐傘|からかさ}') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The umbrella returned', '{傘|かさ} を {返|かえ}す') },
    ],
  });
})(RB.content, RB.mapkit);
