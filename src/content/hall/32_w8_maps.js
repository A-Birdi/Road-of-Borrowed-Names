/* The Hall of a Hundred Tales, wing 8, Three Witnesses at the Inn (an invented tale): the floors and the wing
 * (expansion P15; plan 04_DUNGEONS.md D9). Its theme: whose account? Reports, evidence and uncertainty (what was
 * seen, what was heard, what someone was told and what was only guessed: ～そうだ, ～らしい, ～ようだ and ～みたいだ,
 * ～はずだ, ～かもしれない, ～でしょう; at the top ～に違いない and ～とのことだ).
 *   1 · The Inn at Nightfall (hall.w8f1): the tale in four pictures in the back room (t1), what each witness said,
 *       sorted by how they know it (t2), the sayings on the inn's scrolls, one wrong (t3, a counterexample hall); a
 *       bench.
 *   2 · The Snowy Yard (hall.w8f2): the witnesses' places (the kitchen window, the stairs, the back door), each account weighed against what can be seen or heard
 *       from there (t4), the snow fox (t5, wet), Hisa's note in your companion's hands and the one road it points to
 *       (t6, an information gap), the riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · The Morning Room (hall.w8f3): the footprints in the snow, each named from the evidence (t8), Saki and Gonroku
 *       (t9, a mediation), and the inn's record of the night (t10, the capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w8.pat) chooses
 * the accounts, which of them hold, the road in Hisa's note and the prints' places. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w8';
  const AMB = { dark: 0.3, playerLight: 60, weather: 'snow', tint: 'rgba(120,140,190,0.12)' };

  // ==== floor 1: The Inn at Nightfall ======================================================================================
  // The inn's front path in the snow; the back room with its scroll; the front room where Omatsu has written down what
  // each witness said on five slips, and four trays to sort them into; the scrolls along the north wall.
  const SLIPS = { s1: [22, 7], s2: [24, 7], s3: [26, 7], s4: [28, 7], s5: [23, 9] };
  const TRAYS = { seen: [22, 11], heard: [24, 11], told: [26, 11], guess: [28, 11] };
  C.hallW8 = { SLIPS, TRAYS };
  C.maps['hall.w8f1'] = Object.assign({}, K.base(W), {
    name: T('The Inn at Nightfall', '{夜|よる} の {宿|やど}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in, through the snow
      k.rect(4, 6, 27, 12, '.');                 // the inn's front yard
      k.rect(16, 1, 2, 21, ':');                 // the path north, and south
      k.rect(1, 8, 6, 5, '_');                   // west: the back room (the story room)
      k.rect(21, 6, 9, 7, '_');                  // east: the front room, the accounts
      k.rect(4, 2, 11, 4, '_');                  // north-west: the scrolls along the corridor
      k.scatter(',', 6, 1711, [5, 13, 9, 4], '.');
      k.rect(16, 1, 2, 21, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [16, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w8.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        // the five slips (gone once sorted) and the four trays
        ...Object.keys(SLIPS).map((s) => ({ p: 'fw_postnote', x: SLIPS[s][0], y: SLIPS[s][1], scene: 'hall.w8.' + s, if: '!xp_hall_w8_f0_put_' + s })),
        ...Object.keys(TRAYS).map((t) => ({ p: 'fw_tray', x: TRAYS[t][0], y: TRAYS[t][1], scene: 'hall.w8.to_' + t })),
        ...K.andon(29, 12, W, 't2'), { p: 'sb_irori', x: 26, y: 9 },
        // the scrolls, and the one that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w8.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w8.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w8.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w8.card4' },
        { p: 'kr_scroll', x: 13, y: 3, scene: 'hall.w8.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10),
      ]),
    npcs: [
      { id: 'hall_omatsu', x: 25, y: 12, dir: 'up', talk: [{ scene: 'hall.w8.omatsu' }] },
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w8f2', sp: 'from_below', dir: 'up', if: 'hall.w8.f0.clear' }],
    onEnter: [{ scene: 'hall.w8.f1_first', if: '!hall_w8_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Snowy Yard ============================================================================================
  // The yard behind the inn under snow: the kitchen window, the foot of the stairs and the back door, each a
  // witness's place; the alcove where the box stood, with Hisa's note in its place; three roads out of the yard (east
  // to the next village, west up to the pass teahouse, north to the mountain shrine); the riddle stone, a corner to
  // rest in, and the well.
  const SPOTS = { kitchen: [7, 16], stairs: [12, 16], backdoor: [26, 15] };
  const ROADS = { east: [31, 12], west: [4, 12], shrine: [24, 7] };
  Object.assign(C.hallW8, { SPOTS, ROADS });
  C.maps['hall.w8f2'] = Object.assign({}, K.base(W), {
    name: T('The Snowy Yard', '{雪|ゆき} の {庭|にわ}'),
    ambient: Object.assign({}, AMB, { dark: 0.36 }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '.');                 // where you come in
      k.rect(4, 7, 28, 13, '.');                 // the yard
      k.rect(17, 2, 2, 20, ':');                 // the path north
      k.rect(4, 2, 9, 4, '.');                   // north-west: the riddle stone
      k.rect(13, 5, 4, 1, ':');                  //   its path (below the rope)
      k.rect(28, 2, 6, 5, '_');                  // north-east: a corner of the inn to rest in
      k.rect(19, 5, 9, 1, ':');                  //   its path (below the rope)
      k.rect(7, 21, 7, 4, '.');                  // south-west: the well
      k.rect(13, 22, 3, 2, '.');
      k.scatter('Q', 5, 1721, [5, 8, 6, 3], '.');
      k.rect(17, 2, 2, 20, ':');
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [17, 2] }),
      [
        { p: 'well', x: 9, y: 22, scene: 'hall.w8.spring' },
        // the witnesses' places
        { p: 'hall_screen', x: SPOTS.kitchen[0], y: SPOTS.kitchen[1], scene: 'hall.w8.p_kitchen' },
        { p: 'fw_slipscreen', x: SPOTS.stairs[0], y: SPOTS.stairs[1], scene: 'hall.w8.p_stairs' },
        { p: 'door', x: SPOTS.backdoor[0], y: SPOTS.backdoor[1], scene: 'hall.w8.p_backdoor' },
        ...K.andon(10, 18, W, 't4'),
        // the alcove and Hisa's note; the three roads out of the yard
        { p: 'chest', x: 21, y: 17, scene: 'hall.w8.t6' }, ...K.andon(23, 18, W, 't6'),
        ...Object.keys(ROADS).map((r) => ({ p: 'cr_gate', x: ROADS[r][0], y: ROADS[r][1], scene: 'hall.w8.r_' + r })),
        // the snow fox's corner (t5), the riddle stone (t7)
        ...K.andon(6, 12, W, 't5'),
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w8.t7' }, ...K.andon(8, 2, W, 't7'),
        // the resting corner (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [
      { id: 'hall_omatsu2', char: 'hall_omatsu', x: 20, y: 19, dir: 'up', talk: [{ scene: 'hall.w8.omatsu2' }] },
    ],
    foes: [
      { id: 'b1', enemy: 'sb.fox', encounter: 'hall.w8.fox', scene: 'hall.w8.t5', x: 9, y: 12, patrol: 1, bg: 'snowbell', intro: { jp: '{雪|ゆき} の {中|なか} から 、 {白|しろ}い {狐|きつね} が {顔|かお} を {出|だ}した 。', en: 'A white fox looks out of the snow.' }, settle: { jp: '{狐|きつね} は 、 {足跡|あしあと} も {残|のこ}さず に {雪|ゆき} の {中|なか} へ {消|き}えた 。', en: 'The fox vanishes into the snow without leaving a single print.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w8f3', sp: 'from_below', dir: 'up', if: 'hall.w8.f1.clear' }],
    onEnter: [{ scene: 'hall.w8.f2_first', if: '!hall_w8_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Morning Room ==========================================================================================
  // The inn's best room at first light, its doors open on the snowy garden: four sets of prints in the snow, the
  // evidence board and four name tags; Saki and Gonroku at odds by the brazier; Omatsu's ledger on its desk.
  const PRINTS = { pr1: [7, 6], pr2: [11, 6], pr3: [20, 6], pr4: [24, 6] };
  const TAGS = { tosuke: [6, 13], gonroku: [8, 13], saki: [10, 13], hisa: [12, 13] };
  Object.assign(C.hallW8, { PRINTS, TAGS });
  C.maps['hall.w8f3'] = Object.assign({}, K.base(W), {
    name: T('The Morning Room', '{朝|あさ} の {座敷|ざしき}'),
    ambient: Object.assign({}, AMB, { dark: 0.12, tint: 'rgba(230,220,200,0.10)' }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '_');                // where you come in
      k.rect(4, 9, 24, 9, 'm');                  // the morning room
      k.rect(4, 4, 24, 5, '.');                  // the garden under snow
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'desk', x: 20, y: 11, scene: 'hall.w8.t10' },
        ...Object.keys(PRINTS).map((pr) => ({ p: 'pet_spot', x: PRINTS[pr][0], y: PRINTS[pr][1], scene: 'hall.w8.' + pr })),
        { p: 'noticeboard', x: 8, y: 10, scene: 'hall.w8.t8_board' }, ...K.andon(4, 10, W, 't8'),
        ...Object.keys(TAGS).map((g) => ({ p: 'signblank', x: TAGS[g][0], y: TAGS[g][1], scene: 'hall.w8.tag_' + g, if: '!xp_hall_w8_f2_named_' + g })),
        { p: 'sb_irori', x: 16, y: 14 },
        ...K.andon(26, 16, W, 't9'),
        K.lit(6, 16), K.lit(25, 10),
      ]),
    npcs: [
      { id: 'hall_omatsu3', char: 'hall_omatsu', x: 22, y: 12, dir: 'left', talk: [{ scene: 'hall.w8.omatsu3' }] },
      { id: 'hall_saki', x: 15, y: 13, dir: 'right', talk: [{ scene: 'hall.w8.t9' }] },
      { id: 'hall_gonroku', x: 19, y: 15, dir: 'left', talk: [{ scene: 'hall.w8.t9' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w8.f3_first', if: '!hall_w8_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 8, title: T('Three Witnesses at the Inn', '{宿|やど} の {三人|さんにん} の {証人|しょうにん}'),
    theme: T('Whose account? What was seen, what was heard, what someone was told, and what was only guessed.', '「 そうだ 」 と 「 らしい 」'),
    folklore: { en: 'An invented tale, set at an inn on an old highway of the kind where travellers left things in the innkeeper\'s keeping. The fox that gets the blame belongs to a real habit of old Japanese rumour: when something went missing at night, people said a fox had done it.' },
    music: 'hall_w8', hearth: C.hallHearths.w8, patterns: 2,
    grow: { en: 'how sure you are and where you heard it: ～はずだ, ～ようだ and ～らしい (and, at the top, ～に{違|ちが}いない and ～とのことだ).' },
    floors: [
      { id: 'f1', map: 'hall.w8f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Inn at Nightfall', '{夜|よる} の {宿|やど}'),
        stations: { w8_b1: { kind: 'bench', map: 'hall.w8f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w8f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Snowy Yard', '{雪|ゆき} の {庭|にわ}'),
        stations: { w8_b2: { kind: 'bench', map: 'hall.w8f2', x: 21, y: 23 }, w8_sp: { kind: 'spring', map: 'hall.w8f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w8f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Morning Room', '{朝|あさ} の {座敷|ざしき}'),
        stations: { w8_b3: { kind: 'bench', map: 'hall.w8f3', x: 20, y: 22 } }, procedures: ['hall_w8_record'] },
    ],
    delvers: { f2: { map: 'hall.w8f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('How each one knows', '{見|み}た か 、 {聞|き}いた か') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The inn\'s scrolls', '{宿|やど} の {掛|か}け{軸|じく}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The witnesses\' places', '{証人|しょうにん} の {場所|ばしょ}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('The snow fox', '{雪|ゆき} の {狐|きつね}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('Hisa\'s note', 'ヒサ の {書|か}き{置|お}き') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The footprints in the snow', '{雪|ゆき} の {足跡|あしあと}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Saki and Gonroku', 'サキ と ゴンロク') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The record of the night', '{夜|よる} の {記録|きろく}') },
    ],
  });
})(RB.content, RB.mapkit);
