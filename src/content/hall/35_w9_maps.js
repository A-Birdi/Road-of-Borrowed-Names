/* The Hall of a Hundred Tales, wing 9, The Crane's Return (a real folktale, 鶴の恩返し): the floors and the wing
 * (expansion P15; plan 04_DUNGEONS.md D9). Its theme: to whom are you speaking? Register and relationship (plain and
 * polite speech, what you call people, family words inside and outside, respectful and humble verbs; at the top
 * ～てくださる／～ていただく and ～させていただく).
 *   1 · The Village in the Snow (hall.w9f1): the tale in four pictures in the field hut (t1), five things the old man
 *       said, each given back to the one it was said to (t2), the prayer boards at the village shrine, one wrong (t3,
 *       a counterexample hall); a bench.
 *   2 · The Old Couple's House (hall.w9f2): the seats at the hearth, each person in their place (t4), the frost at the
 *       window (t5, frozen), what the young woman asked before she shut the loom room door, in your companion's ears,
 *       and doing it without looking (t6, an information gap), the riddle stone (t7, a reprieve); a bench, a spring, a
 *       resting place.
 *   3 · The Sound of the Loom (hall.w9f3): the lord's order passed down from the gate to the shop to the hearth, said
 *       to each listener as they should hear it (t8), Yosaku and Otoku (t9, a mediation), and the farewell (t10, the
 *       capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w9.pat) chooses
 * the old man's words, the night at the hearth (the young woman's first night, or a later one when the village head
 * calls), what she asked, and the lord's order. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w9';
  const AMB = { dark: 0.26, playerLight: 56, weather: 'snow', tint: 'rgba(200,210,230,0.10)' };

  // ==== floor 1: The Village in the Snow ===================================================================================
  // The field's edge where the crane was caught, and the hut there with its scroll; the village street, where the four
  // people the old man spoke to that day are standing (his wife at her door, the neighbours' child, Gensuke at his
  // cloth stall, the lord's messenger by the gate), and his words lying loose in the snow; the shrine's prayer boards.
  const SLIPS = { s1: [8, 14], s2: [11, 9], s3: [20, 15], s4: [26, 16], s5: [13, 12] };
  const HEARERS = { otoku: [22, 8], sabu: [26, 10], gensuke: [28, 13], envoy: [23, 13] };
  C.hallW9 = { SLIPS, HEARERS };
  C.maps['hall.w9f1'] = Object.assign({}, K.base(W), {
    name: T('The Village in the Snow', '{雪|ゆき} の {村|むら}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in, through the snow
      k.rect(4, 6, 27, 12, '.');                 // the village
      k.rect(21, 7, 9, 9, ':');                  // east: the village street
      k.rect(1, 8, 6, 5, '_');                   // west: the field hut (the story room)
      k.rect(4, 2, 11, 4, '_');                  // north-west: the shrine's porch and its prayer boards
      k.scatter(',', 6, 1911, [5, 13, 9, 4], '.');
      k.rect(16, 1, 2, 21, ':');                 // the path north, and south
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [16, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w9.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        { p: 'stone_marker', x: 6, y: 16, scene: 'hall.w9.trap' },
        // the old man's words, loose in the snow (gone once given back)
        ...Object.keys(SLIPS).map((s) => ({ p: 'fw_postnote', x: SLIPS[s][0], y: SLIPS[s][1], scene: 'hall.w9.' + s, if: '!xp_hall_w9_f0_put_' + s })),
        { p: 'door', x: 22, y: 7 }, { p: 'sg_stall', x: 27, y: 14 }, { p: 'sa_gate', x: 24, y: 15 },
        ...K.andon(29, 16, W, 't2'),
        // the prayer boards, and the one that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w9.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w9.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w9.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w9.card4' },
        { p: 'kr_scroll', x: 13, y: 3, scene: 'hall.w9.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10),
      ]),
    npcs: [
      { id: 'hall_otoku', x: HEARERS.otoku[0], y: HEARERS.otoku[1], dir: 'down', talk: [{ scene: 'hall.w9.to_otoku' }] },
      { id: 'hall_sabu', x: HEARERS.sabu[0], y: HEARERS.sabu[1], dir: 'left', talk: [{ scene: 'hall.w9.to_sabu' }] },
      { id: 'hall_gensuke', x: HEARERS.gensuke[0], y: HEARERS.gensuke[1], dir: 'left', talk: [{ scene: 'hall.w9.to_gensuke' }] },
      { id: 'hall_envoy', x: HEARERS.envoy[0], y: HEARERS.envoy[1], dir: 'up', talk: [{ scene: 'hall.w9.to_envoy' }] },
      { id: 'hall_yosaku', x: 18, y: 16, dir: 'down', talk: [{ scene: 'hall.w9.yosaku' }] },
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w9f2', sp: 'from_below', dir: 'up', if: 'hall.w9.f0.clear' }],
    onEnter: [{ scene: 'hall.w9.f1_first', if: '!hall_w9_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Old Couple's House ====================================================================================
  // The old couple's farmhouse: the earthen floor by the door, the hearth with its four seats and the house's board
  // that says who sits where, the name tags for tonight's people; the loom room behind its paper door, the meal tray
  // and the firewood, a torn place in the paper; the window where the frost comes in; the garden with the riddle
  // stone, a corner to rest in, and the well.
  const SEATS = { yokoza: [10, 10], kyakuza: [12, 11], kakaza: [9, 12], kijiri: [11, 13] };
  const TAGS = { yosaku: [5, 18], otoku: [7, 18], musume: [9, 18], sabu: [11, 18], shoya: [11, 18] };
  const DUTY = { meal: [20, 16], fire: [14, 16], peek: [28, 13] };
  Object.assign(C.hallW9, { SEATS, TAGS, DUTY });
  C.maps['hall.w9f2'] = Object.assign({}, K.base(W), {
    name: T('The Old Couple\'s House', '{老夫婦|ろうふうふ} の {家|いえ}'),
    ambient: Object.assign({}, AMB, { dark: 0.34, weather: null, tint: 'rgba(230,170,110,0.10)' }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, ':');                 // the earthen floor by the door
      k.rect(4, 7, 28, 13, '_');                 // the house
      k.rect(4, 2, 9, 4, '.');                   // north-west: the garden and the riddle stone
      k.rect(13, 5, 4, 1, ':');                  //   its path (below the rope)
      k.rect(28, 2, 6, 5, '_');                  // north-east: a back room to rest in
      k.rect(19, 5, 9, 1, ':');                  //   its path (below the rope)
      k.rect(7, 21, 7, 4, '.');                  // south-west: the well
      k.rect(13, 22, 3, 2, '.');
      k.rect(17, 2, 2, 20, ':');                 // the passage north
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [17, 2] }),
      [
        { p: 'well', x: 9, y: 22, scene: 'hall.w9.spring' },
        // the hearth, its four seats and the board; the name tags (who is here tonight depends on the night)
        { p: 'sb_irori', x: 10, y: 11 },
        ...Object.keys(SEATS).map((st) => ({ p: 'mat', x: SEATS[st][0], y: SEATS[st][1], scene: 'hall.w9.seat_' + st })),
        { p: 'noticeboard', x: 5, y: 8, scene: 'hall.w9.t4_board' }, ...K.andon(8, 8, W, 't4'),
        ...['yosaku', 'otoku', 'musume'].map((g) => ({ p: 'signblank', x: TAGS[g][0], y: TAGS[g][1], scene: 'hall.w9.tag_' + g, if: '!xp_hall_w9_f1_seated_' + g })),
        { p: 'signblank', x: TAGS.sabu[0], y: TAGS.sabu[1], scene: 'hall.w9.tag_sabu', if: 'hall.w9.pat=0&!xp_hall_w9_f1_seated_sabu' },
        { p: 'signblank', x: TAGS.shoya[0], y: TAGS.shoya[1], scene: 'hall.w9.tag_shoya', if: 'hall.w9.pat=1&!xp_hall_w9_f1_seated_shoya' },
        // the loom room's paper door, the meal tray, the firewood, the torn paper
        { p: 'hall_screen', x: 24, y: 8, scene: 'hall.w9.t6' }, ...K.andon(27, 8, W, 't6'),
        { p: 'loom', x: 29, y: 8 },
        { p: 'fw_tray', x: DUTY.meal[0], y: DUTY.meal[1], scene: 'hall.w9.d_meal' },
        { p: 'sb_woodpile', x: DUTY.fire[0], y: DUTY.fire[1], scene: 'hall.w9.d_fire' },
        { p: 'pet_screen', x: DUTY.peek[0], y: DUTY.peek[1], scene: 'hall.w9.d_peek' },
        // the window where the frost comes in (t5), the riddle stone (t7)
        ...K.andon(5, 14, W, 't5'),
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w9.t7' }, ...K.andon(8, 2, W, 't7'),
        // the back room (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
        K.lit(21, 12), K.lit(30, 17),
      ]),
    npcs: [
      { id: 'hall_otoku2', char: 'hall_otoku', x: 20, y: 18, dir: 'up', talk: [{ scene: 'hall.w9.otoku2' }] },
    ],
    foes: [
      { id: 'b1', enemy: 'sb.wisp', encounter: 'hall.w9.frost', scene: 'hall.w9.t5', x: 7, y: 15, patrol: 1, bg: 'snowbell', intro: { jp: '{窓|まど} の {隙間|すきま} から 、 {白|しろ}い {霜|しも} が {入|はい}って きた 。', en: 'White frost creeps in through a gap in the window.' }, settle: { jp: '{霜|しも} は 、 {囲炉裏|いろり} の {火|ひ} に {溶|と}けて {消|き}えた 。', en: 'The frost melts away in the warmth of the hearth.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w9f3', sp: 'from_below', dir: 'up', if: 'hall.w9.f1.clear' }],
    onEnter: [{ scene: 'hall.w9.f2_first', if: '!hall_w9_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Sound of the Loom =====================================================================================
  // Down the hill, the lord's gate and Gensuke's cloth shop; back up the hill, the old couple's hearth, where Yosaku
  // and Otoku wait for news, and the loom room, where the loom has gone quiet at last.
  const POSTS = { gate: [5, 6], shop: [9, 12], hearth: [20, 10] };
  Object.assign(C.hallW9, { POSTS });
  C.maps['hall.w9f3'] = Object.assign({}, K.base(W), {
    name: T('The Sound of the Loom', '{機|はた} の {音|おと}'),
    ambient: Object.assign({}, AMB, { dark: 0.18, tint: 'rgba(230,220,210,0.10)' }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, ':');                // where you come in
      k.rect(2, 4, 12, 14, '.');                 // west: the town below, the lord's gate and the cloth shop
      k.rect(14, 4, 16, 14, 'm');                // east: the old couple's house
      k.rect(24, 4, 6, 4, '_');                  //   its loom room
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [19, 22] }),
      [
        { p: 'sa_gate', x: POSTS.gate[0], y: POSTS.gate[1], scene: 'hall.w9.post_gate' },
        { p: 'sg_stall', x: POSTS.shop[0], y: POSTS.shop[1], scene: 'hall.w9.post_shop' },
        { p: 'sb_irori', x: POSTS.hearth[0], y: POSTS.hearth[1], scene: 'hall.w9.post_hearth' },
        ...K.andon(3, 16, W, 't8'),
        { p: 'loom', x: 26, y: 5, scene: 'hall.w9.t10' }, ...K.andon(29, 4, W, 't10'),
        ...K.andon(28, 16, W, 't9'),
        K.lit(16, 6), K.lit(12, 6),
      ]),
    npcs: [
      { id: 'hall_envoy3', char: 'hall_envoy', x: 7, y: 7, dir: 'left', talk: [{ scene: 'hall.w9.envoy3' }] },
      { id: 'hall_gensuke3', char: 'hall_gensuke', x: 11, y: 14, dir: 'up', talk: [{ scene: 'hall.w9.gensuke3' }] },
      { id: 'hall_yosaku3', char: 'hall_yosaku', x: 19, y: 13, dir: 'right', talk: [{ scene: 'hall.w9.t9' }] },
      { id: 'hall_otoku3', char: 'hall_otoku', x: 23, y: 13, dir: 'left', talk: [{ scene: 'hall.w9.t9' }] },
      { id: 'hall_musume', x: 25, y: 7, dir: 'down', talk: [{ scene: 'hall.w9.t10' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w9.f3_first', if: '!hall_w9_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 9, title: T('The Crane\'s Return', '{鶴|つる} の {恩返|おんがえ}し'),
    theme: T('To whom are you speaking? Plain and polite speech, what you call people, and the words that raise others and lower yourself.', '「 {誰|だれ} に {話|はな}す か 」'),
    folklore: { en: 'A real folktale, told all over Japan: {鶴|つる}の{恩返|おんがえ}し, "the crane returns a kindness". An old man frees a crane from a trap; a young woman comes to the old couple\'s door in the snow, weaves cloth of wonderful beauty and asks never to be watched at the loom; when they look, they see a crane weaving from her own feathers, and she must leave. The seats at the hearth ({横座|よこざ}, {客座|きゃくざ}, かか{座|ざ}, {木尻|きじり}) are a real custom of old farmhouses, with names that vary from place to place.' },
    music: 'hall_w9', hearth: C.hallHearths.w9, patterns: 2,
    grow: { en: 'who you speak to and about: what to call people and your own family, ～てくださる and ～ていただく (and, at the top, ～させていただく).' },
    floors: [
      { id: 'f1', map: 'hall.w9f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Village in the Snow', '{雪|ゆき} の {村|むら}'),
        stations: { w9_b1: { kind: 'bench', map: 'hall.w9f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w9f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Old Couple\'s House', '{老夫婦|ろうふうふ} の {家|いえ}'),
        stations: { w9_b2: { kind: 'bench', map: 'hall.w9f2', x: 21, y: 23 }, w9_sp: { kind: 'spring', map: 'hall.w9f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w9f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Sound of the Loom', '{機|はた} の {音|おと}'),
        stations: { w9_b3: { kind: 'bench', map: 'hall.w9f3', x: 19, y: 22 } }, procedures: ['hall_w9_farewell'] },
    ],
    delvers: { f2: { map: 'hall.w9f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('Whose ears?', '{誰|だれ} に {言|い}った ？') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The prayer boards', '{絵馬|えま}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The seats at the hearth', '{囲炉裏|いろり} の {席|せき}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('Frost at the window', '{窓|まど} の {霜|しも}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('What she asked', '{娘|むすめ} の {頼|たの}み') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The lord\'s order', '{殿|との}さま の {仰|おお}せ') },
      { id: 't9', floor: 2, kind: 'social', title: T('Yosaku and Otoku', 'ヨサク と オトク') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The farewell', '{別|わか}れ') },
    ],
  });
})(RB.content, RB.mapkit);
