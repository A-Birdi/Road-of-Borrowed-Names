/* The Hall of a Hundred Tales, wing 3, The Bell Before Dawn (an invented tale): the floors and the wing (expansion P15;
 * plan 04_DUNGEONS.md D9). Its theme: sequence and timing (まず, つぎに, それから, さいごに; ～てから; ～前に and ～後で;
 * まで and までに; ～とき and ～たら; on the Grow route ～うちに and ～ところ, and at the top ～次第).
 *   1 · The Sleeping Village (hall.w3f1): the tale in four pictures at Jinbei's bedside (t1), Jinbei's note of the
 *       night's chores, done in the order the note means rather than the order it is written in (t2), and the
 *       bell-ringer's sayings by the temple path, one of them wrong (t3, a counterexample hall); a bench.
 *   2 · The Night Slope (hall.w3f2): the incense clock, burned from hour to hour while each thing on Jinbei's slate is
 *       done at its time (t4), night moths round the slope lantern in the dawn mist (t5), Jinbei's almanac in your
 *       companion's hands and Shino's lantern hung on the right hook of the hour post (t6, an information gap), the
 *       riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · The Bell Tower (hall.w3f3): the lost tanuki cub found by putting three sightings in time order (t8), Mame, the
 *       cub's mother, drumming to hold the night back (t9), and the dawn bell rung with Shino (t10, the capstone,
 *       with the real custom of 捨て鐘, three strikes before the hour is counted).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w3.pat) chooses
 * the chores' order, the slate's hours, the almanac's hour and the sightings. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w3';
  const AMB = { dark: 0.42, playerLight: 66, weather: 'motes', tint: 'rgba(30,40,80,0.14)' };

  // ==== floor 1: The Sleeping Village ======================================================================================
  // Jinbei's house to the west (the story room); the village square; the four chores of Jinbei's note (the well, the
  // woodpile, the stone lantern, the priest's door); the bell-ringer's sayings on four stones by the temple path.
  const CHORES = { water: [9, 15], wood: [24, 15], lamp: [22, 8], priest: [27, 10] };
  C.hallW3 = { CHORES };
  C.maps['hall.w3f1'] = Object.assign({}, K.base(W), {
    name: T('The Sleeping Village', '{眠|ねむ}る {村|むら}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in
      k.rect(4, 6, 25, 12, '.');                 // the village square
      k.rect(16, 1, 2, 21, ':');                 // the path north to the temple, and south
      k.rect(4, 11, 25, 2, ':');                 // the street east and west
      k.rect(1, 8, 6, 7, '_');                   // west: Jinbei's house (the story room)
      k.rect(4, 2, 11, 4, '.');                  // north-west: the bell-ringer's sayings
      k.rect(29, 8, 4, 5, '_');                  // east: the priest's lodging
      k.scatter('T', 7, 1561, [6, 6, 8, 4], '.'); k.scatter(',', 10, 1562, [4, 13, 24, 4], '.');
      k.rect(16, 1, 2, 21, ':'); k.rect(4, 11, 25, 2, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [17, 1] }),
      [
        // Jinbei's house: the picture scroll, his bed, a lantern
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w3.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'sb_futon', x: 4, y: 12 }, { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        // Jinbei's note, and the four chores
        { p: 'sign', x: 18, y: 17, scene: 'hall.w3.t2_note' }, ...K.andon(12, 17, W, 't2'),
        { p: 'well', x: CHORES.water[0], y: CHORES.water[1], scene: 'hall.w3.c_water' },
        { p: 'sb_woodpile', x: CHORES.wood[0], y: CHORES.wood[1], scene: 'hall.w3.c_wood' },
        { p: 'kr_toro', x: CHORES.lamp[0], y: CHORES.lamp[1], scene: 'hall.w3.c_lamp', if: '!xp_hall_w3_f0_did_lamp' },
        { p: 'kr_toro', x: CHORES.lamp[0], y: CHORES.lamp[1], scene: 'hall.w3.c_lamp', if: 'xp_hall_w3_f0_did_lamp', light: 34, o: { lit: true } },
        { p: 'door', x: CHORES.priest[0], y: CHORES.priest[1], scene: 'hall.w3.c_priest' },
        // the bell-ringer's sayings, and the stone that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w3.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w3.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w3.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w3.card4' },
        { p: 'stone_marker', x: 13, y: 3, scene: 'hall.w3.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10), K.lit(15, 14),
      ]),
    npcs: [
      { id: 'hall_jinbei', x: 3, y: 13, dir: 'right', talk: [{ scene: 'hall.w3.jinbei' }] },
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w3f2', sp: 'from_below', dir: 'up', if: 'hall.w3.f0.clear' }],
    onEnter: [{ scene: 'hall.w3.f1_first', if: '!hall_w3_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Night Slope ===========================================================================================
  // The slope up to the temple; the incense clock and Jinbei's slate where you come in; the three things on the slate
  // (the Jizō to the west, the bridge lantern to the east, the temple's outer gate up the slope); the almanac on the
  // stone table and the hour post's three hooks; the riddle stone and the resting place, both reached below the rope.
  const HOOKS = { h1: [27, 19], h2: [29, 19], h3: [31, 19] };
  Object.assign(C.hallW3, { HOOKS });
  const HOUR = (h) => (h ? 'xp_hall_w3_f1_h' + h : '!xp_hall_w3_f1_h1&!xp_hall_w3_f1_h2&!xp_hall_w3_f1_h3');
  C.maps['hall.w3f2'] = Object.assign({}, K.base(W), {
    name: T('The Night Slope', '{夜|よる} の {坂道|さかみち}'),
    ambient: Object.assign({}, AMB, { dark: 0.48, weather: 'mist' }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '.');                 // where you come in
      k.rect(17, 2, 2, 20, ':');                 // the slope
      k.rect(5, 9, 12, 8, '.');                  // west: the Jizō's grass
      k.rect(19, 9, 12, 8, '.');                 // east: the bridge and the moths' lantern
      k.rect(23, 17, 11, 5, '.');                // south-east: the almanac and the hour post
      k.rect(4, 2, 9, 5, '.');                   // north-west: the riddle stone's grass
      k.rect(13, 5, 4, 2, ':');                  //   its path (joining the slope below the rope)
      k.rect(28, 2, 6, 5, '.');                  // north-east: the resting place
      k.rect(19, 5, 9, 2, ':');                  //   its path (below the rope too)
      k.rect(7, 20, 7, 5, '.');                  // south-west: the spring
      k.rect(13, 22, 3, 2, '.');
      k.scatter('T', 8, 1571, [6, 10, 9, 6], '.'); k.scatter('T', 6, 1572, [20, 10, 9, 6], '.');
      k.rect(9, 12, 3, 3, '.'); k.rect(24, 11, 5, 5, '.'); k.rect(17, 2, 2, 20, ':');
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [18, 2] }),
      [
        { p: 'well', x: 9, y: 22, scene: 'hall.w3.spring' },
        // the incense clock (its hour drawn from the floor's hour flag) and Jinbei's slate
        ...[0, 1, 2, 3].map((h) => ({ p: 'hall_incense', x: 20, y: 21, scene: 'hall.w3.clock', if: HOUR(h), o: { h } })),
        { p: 'sign', x: 22, y: 21, scene: 'hall.w3.t4_slate' }, ...K.andon(14, 21, W, 't4'),
        // the slate's three things
        { p: 'hall_jizo', x: 10, y: 11, scene: 'hall.w3.h_jizo' },
        { p: 'kr_toro', x: 26, y: 10, scene: 'hall.w3.h_bridge', if: 'hall.w3.pat=0&!xp_hall_w3_f1_d_bridge|hall.w3.pat=1&xp_hall_w3_f1_d_bridge', light: 34, o: { lit: true } },
        { p: 'kr_toro', x: 26, y: 10, scene: 'hall.w3.h_bridge', if: 'hall.w3.pat=0&xp_hall_w3_f1_d_bridge|hall.w3.pat=1&!xp_hall_w3_f1_d_bridge' },
        { p: 'door', x: 21, y: 7, scene: 'hall.w3.h_gate' },
        // the almanac on the stone table, and the hour post's hooks (Shino's lantern on the one chosen)
        { p: 'desk', x: 24, y: 18, scene: 'hall.w3.t6' }, ...K.andon(33, 17, W, 't6'),
        ...Object.keys(HOOKS).map((h) => ({ p: 'stone_marker', x: HOOKS[h][0], y: HOOKS[h][1], scene: 'hall.w3.t6_' + h })),
        ...Object.keys(HOOKS).map((h) => ({ p: 'lantern', x: HOOKS[h][0], y: HOOKS[h][1] - 1, if: 'xp_hall_w3_f1_hung_' + h, light: 30, o: { lit: true } })),
        // the riddle stone (t7)
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w3.t7' }, ...K.andon(8, 2, W, 't7'),
        ...K.andon(29, 14, W, 't5'),
        // the resting place (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [
      { id: 'hall_shino', x: 19, y: 22, dir: 'left', talk: [{ scene: 'hall.w3.shino2' }] },
    ],
    foes: [
      { id: 'b1', enemy: 'co.moth', encounter: 'hall.w3.moths', scene: 'hall.w3.t5', x: 26, y: 13, patrol: 2, bg: 'keepers', intro: { jp: '{霧|きり} の {中|なか} 、 {灯籠|とうろう} の {周|まわ}り を 、 {白|しろ}い {蛾|が} が {回|まわ}って いる 。', en: 'In the mist, white moths circle the stone lantern.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w3f3', sp: 'from_below', dir: 'up', if: 'hall.w3.f1.clear' }],
    onEnter: [{ scene: 'hall.w3.f2_first', if: '!hall_w3_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Bell Tower ============================================================================================
  // The bell tower on the ridge with the great bell; three people who saw the cub (the priest, the watchman, the
  // fisherman) and three places it might be (the tower's steps, the woodpile, the well); Mame by the cedar.
  const HIDE = { steps: [12, 7], wood: [24, 12], well: [6, 14] };
  Object.assign(C.hallW3, { HIDE });
  C.maps['hall.w3f3'] = Object.assign({}, K.base(W), {
    name: T('The Bell Tower', '{鐘楼|しょうろう}'),
    ambient: Object.assign({}, AMB, { dark: 0.5 }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '.');                // where you come in
      k.rect(15, 2, 3, 17, ':');                 // the approach to the bell tower
      k.rect(3, 8, 12, 10, '.');                 // west: the cedars and the well
      k.rect(18, 8, 11, 10, '.');                // east: the temple yard and the woodpile
      k.rect(11, 2, 11, 5, '+');                 // the tower's stone court
      k.scatter('T', 7, 1581, [4, 9, 9, 7], '.'); k.scatter('T', 5, 1582, [19, 13, 8, 4], '.');
      k.rect(5, 13, 4, 3, '.'); k.rect(23, 11, 4, 3, '.'); k.rect(15, 2, 3, 17, ':');
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'lf_bigbell', x: 15, y: 3, scene: 'hall.w3.t10' },
        { p: 'shrine', x: 20, y: 3 },
        { p: 'stone_marker', x: HIDE.steps[0], y: HIDE.steps[1], scene: 'hall.w3.hide_steps' },
        { p: 'sb_woodpile', x: HIDE.wood[0], y: HIDE.wood[1], scene: 'hall.w3.hide_wood' },
        { p: 'well', x: HIDE.well[0], y: HIDE.well[1], scene: 'hall.w3.hide_well' },
        ...K.andon(11, 18, W, 't8'), ...K.andon(9, 9, W, 't9'),
        K.lit(14, 8), K.lit(18, 8),
      ]),
    npcs: [
      { id: 'hall_osho', x: 20, y: 9, dir: 'down', talk: [{ scene: 'hall.w3.w_osho' }] },
      { id: 'hall_mataji', x: 10, y: 11, dir: 'right', talk: [{ scene: 'hall.w3.w_mataji' }] },
      { id: 'hall_sukezo', x: 22, y: 17, dir: 'left', talk: [{ scene: 'hall.w3.w_sukezo' }] },
      { id: 'hall_mame', x: 7, y: 9, dir: 'right', if: '!hall.w3.t9', talk: [{ scene: 'hall.w3.t9' }] },
      { id: 'hall_mame_after', char: 'hall_mame', x: 13, y: 5, dir: 'right', if: 'hall.w3.t9', talk: [{ scene: 'hall.w3.mame_after' }] },
      { id: 'hall_kobu', x: 14, y: 6, dir: 'right', if: 'hall.w3.t8', talk: [{ scene: 'hall.w3.kobu' }] },
      { id: 'hall_shino3', char: 'hall_shino', x: 17, y: 5, dir: 'down', talk: [{ scene: 'hall.w3.shino3' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w3.f3_first', if: '!hall_w3_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 3, title: T('The Bell Before Dawn', '{夜明|よあ}け {前|まえ} の {鐘|かね}'),
    theme: T('Sequence and timing: what comes first, before, after, until and by.', '{順番|じゅんばん} と {時|とき}'),
    folklore: { en: 'An invented tale. Two things in it are real: temple bells were rung at dawn to tell the hour, three warning strikes (捨て鐘) before the hour was counted; and in the old tales a tanuki drums on its belly in the night.' },
    music: 'hall_w3', hearth: C.hallHearths.w3, patterns: 2,
    grow: { en: 'while there is still time and the moment of an action: ～うちに and ～ところ (and, at the top, ～次第, "as soon as").' },
    floors: [
      { id: 'f1', map: 'hall.w3f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Sleeping Village', '{眠|ねむ}る {村|むら}'),
        stations: { w3_b1: { kind: 'bench', map: 'hall.w3f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w3f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Night Slope', '{夜|よる} の {坂道|さかみち}'),
        stations: { w3_b2: { kind: 'bench', map: 'hall.w3f2', x: 21, y: 23 }, w3_sp: { kind: 'spring', map: 'hall.w3f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w3f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Bell Tower', '{鐘楼|しょうろう}'),
        stations: { w3_b3: { kind: 'bench', map: 'hall.w3f3', x: 20, y: 22 } }, procedures: ['hall_w3_bell0', 'hall_w3_bell1'] },
    ],
    delvers: { f2: { map: 'hall.w3f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('Jinbei\'s note', 'ジンベエ の {書|か}き{置|お}き') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The bell-ringer\'s sayings', '{鐘撞|かねつ}き の {言葉|ことば}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The incense clock', '{香時計|こうどけい}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('Moths in the dawn mist', '{霧|きり} の {中|なか} の {蛾|が}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('The almanac\'s hour', '{暦|こよみ} の {時刻|じこく}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The lost cub', '{迷子|まいご} の {子狸|こだぬき}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Mame\'s drum', 'マメ の {腹鼓|はらつづみ}') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The dawn bell', '{明|あ}け{六|む}つ の {鐘|かね}') },
    ],
  });
})(RB.content, RB.mapkit);
