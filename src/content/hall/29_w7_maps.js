/* The Hall of a Hundred Tales, wing 7, The House That Remembers (a real legend: the マヨイガ, the wandering house of
 * the mountains of Tōno, told in the Tōno Monogatari; the house's family and Owan are invented): the floors and the
 * wing (expansion P15; plan 04_DUNGEONS.md D9). Its theme: what was left unsaid (leaving out what is understood;
 * こ・そ・あ; の for "the one"; at the top 例の, 前者 and 後者).
 *   1 · The Black Gate (hall.w7f1): the tale in four pictures in the side room (t1), the things left behind in the
 *       entrance hall, each hung under the note that means it without naming it (t2), the sayings on the garden
 *       stones, one wrong (t3, a counterexample hall); a bench.
 *   2 · The Rooms Within (hall.w7f2): the kitchen memo that names nothing, done in its order (t4), the lantern in the
 *       dark room (t5, paper; it floats), the letter in the storehouse in your companion's hands and the one keepsake
 *       it means (t6, an information gap), the riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · The Parlour by the Stream (hall.w7f3): the bowls by the stream, fetched as the house asks for "the one"
 *       (t8), Magoroku and Owan (t9, a mediation), and leaving the house (t10, the capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w7.pat) chooses
 * the notes on the hooks, the memo, the keepsake the letter means and the bowls the house asks for. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w7';
  const AMB = { dark: 0.2, playerLight: 54, weather: 'snow', tint: 'rgba(160,170,190,0.10)' };

  // ==== floor 1: The Black Gate ============================================================================================
  // The black gate in the mist, the front garden, the side room with its scroll, the entrance hall where visitors'
  // forgotten things lie on the boards under four hooks with notes, and the garden stones to the north-west.
  const ITEMS = { umbrella: [22, 10], jacket: [24, 10], lantern: [26, 10], book: [28, 10], teacup: [22, 8] };
  const HOOKS = { h1: [22, 6], h2: [24, 6], h3: [26, 6], h4: [28, 6] };
  C.hallW7 = { ITEMS, HOOKS };
  const ITEMPROP = { umbrella: 'hall_umbrella', jacket: 'ko_basket', lantern: 'lantern', book: 'bookpile', teacup: 'teaset' };
  C.maps['hall.w7f1'] = Object.assign({}, K.base(W), {
    name: T('The Black Gate', '{黒|くろ}い {門|もん}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in, through the black gate
      k.rect(4, 6, 27, 12, '.');                 // the front garden
      k.rect(16, 1, 2, 21, ':');                 // the path north, into the house, and south
      k.rect(1, 8, 6, 5, '_');                   // west: the side room (the story room)
      k.rect(21, 6, 9, 6, '_');                  // east: the entrance hall
      k.rect(4, 2, 11, 4, '.');                  // north-west: the garden stones
      k.scatter('Q', 5, 1691, [5, 13, 8, 4], '.'); k.scatter(',', 8, 1692, [20, 13, 9, 4], '.');
      k.rect(16, 1, 2, 21, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [16, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w7.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        // the things left behind (gone once hung up) and the four hooks with their notes
        ...Object.keys(ITEMS).map((i) => Object.assign({ p: ITEMPROP[i], x: ITEMS[i][0], y: ITEMS[i][1], scene: 'hall.w7.i_' + i, if: '!xp_hall_w7_f0_hung_' + i }, ITEMPROP[i] === 'lantern' ? { light: 20, o: { lit: true } } : {})),
        ...Object.keys(HOOKS).map((h) => ({ p: 'signblank', x: HOOKS[h][0], y: HOOKS[h][1], scene: 'hall.w7.' + h })),
        ...K.andon(29, 11, W, 't2'),
        // the garden stones, and the one that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w7.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w7.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w7.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w7.card4' },
        { p: 'stone_marker', x: 13, y: 3, scene: 'hall.w7.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10),
      ]),
    npcs: [
      { id: 'hall_owan', x: 25, y: 8, dir: 'down', talk: [{ scene: 'hall.w7.owan' }] },
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w7f2', sp: 'from_below', dir: 'up', if: 'hall.w7.f0.clear' }],
    onEnter: [{ scene: 'hall.w7.f1_first', if: '!hall_w7_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Rooms Within ==========================================================================================
  // The house's corridor running north; the kitchen to the west with its memo on the post; the dark room above it
  // where a paper lantern drifts; the stone-floored storehouse to the east with the letter, three keepsakes and the
  // family altar; the inner garden with the riddle stone, a tatami room to rest in, and the courtyard well.
  const KITCHEN = { kettle: [7, 17], hearth: [9, 16], teapot: [13, 16], tray: [13, 18], shutters: [7, 14], lamp: [11, 14], brazier: [6, 19], door: [12, 20] };
  const KPROP = { kettle: 'pot', hearth: 'sb_irori', teapot: 'teaset', tray: 'fw_tray', shutters: 'hall_screen', brazier: 'kr_jar', door: 'door' };
  const KEEP = { comb: [26, 18], flute: [28, 18], mirror: [29, 15] };
  const KEEPPROP = { comb: 'chest', flute: 'shelf', mirror: 'sa_cabinet' };
  Object.assign(C.hallW7, { KITCHEN, KEEP });
  C.maps['hall.w7f2'] = Object.assign({}, K.base(W), {
    name: T('The Rooms Within', '{奥|おく} の {部屋|へや}'),
    ambient: Object.assign({}, AMB, { dark: 0.34, weather: null, tint: 'rgba(90,70,60,0.14)' }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '_');                 // where you come in
      k.rect(17, 2, 2, 20, '_');                 // the corridor north
      k.rect(5, 14, 10, 7, '_');                 // west: the kitchen
      k.rect(15, 16, 2, 2, '_');                 //   its doorway
      k.rect(5, 6, 10, 6, '_');                  // north-west: the dark room
      k.rect(15, 8, 2, 2, '_');                  //   its doorway
      k.rect(22, 14, 9, 7, '+');                 // east: the storehouse
      k.rect(19, 16, 3, 2, '_');                 //   its doorway
      k.rect(4, 2, 9, 4, '.');                   // the inner garden: the riddle stone
      k.rect(13, 5, 4, 1, ':');                  //   its path (below the rope)
      k.rect(28, 2, 6, 5, 'm');                  // north-east: a tatami room to rest in
      k.rect(19, 5, 9, 1, '_');                  //   its passage (below the rope)
      k.rect(7, 21, 7, 4, '.');                  // south-west: the courtyard well
      k.rect(13, 22, 3, 2, '.');
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [17, 2] }),
      [
        { p: 'well', x: 9, y: 22, scene: 'hall.w7.spring' },
        // the kitchen: the memo on the post, and everything it might mean
        { p: 'fw_postnote', x: 5, y: 14, scene: 'hall.w7.memo' },
        ...Object.keys(KPROP).map((c) => ({ p: KPROP[c], x: KITCHEN[c][0], y: KITCHEN[c][1], scene: 'hall.w7.c_' + c })),
        { p: 'deadlantern', x: KITCHEN.lamp[0], y: KITCHEN.lamp[1], scene: 'hall.w7.c_lamp', if: '!xp_hall_w7_f1_did_lamp' },
        { p: 'lantern', x: KITCHEN.lamp[0], y: KITCHEN.lamp[1], scene: 'hall.w7.c_lamp', if: 'xp_hall_w7_f1_did_lamp', light: 30, o: { lit: true } },
        ...K.andon(5, 20, W, 't4'),
        // the storehouse: the letter, three keepsakes, the family altar
        { p: 'desk', x: 23, y: 15, scene: 'hall.w7.t6' }, ...K.andon(22, 20, W, 't6'),
        ...Object.keys(KEEP).map((g) => ({ p: KEEPPROP[g], x: KEEP[g][0], y: KEEP[g][1], scene: 'hall.w7.m_' + g })),
        { p: 'shrine', x: 27, y: 14 },
        // the dark room (t5), the riddle stone (t7)
        ...K.andon(6, 7, W, 't5'),
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w7.t7' }, ...K.andon(8, 2, W, 't7'),
        // the tatami room (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [
      { id: 'hall_owan2', char: 'hall_owan', x: 25, y: 19, dir: 'up', talk: [{ scene: 'hall.w7.owan2' }] },
    ],
    foes: [
      { id: 'b1', enemy: 'kr.chochin', encounter: 'hall.w7.lantern', scene: 'hall.w7.t5', x: 10, y: 8, patrol: 1, bg: 'keepers', intro: { jp: '{暗|くら}い {部屋|へや} の {奥|おく} で 、 {古|ふる}い {提灯|ちょうちん} が {一|ひと}つ 、 {目|め} を {開|あ}けた 。', en: 'At the back of the dark room, an old paper lantern opens one eye.' }, settle: { jp: '{提灯|ちょうちん} は 、 {満足|まんぞく} そう に {目|め} を {閉|と}じた 。', en: 'The lantern closes its eye, content.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w7f3', sp: 'from_below', dir: 'up', if: 'hall.w7.f1.clear' }],
    onEnter: [{ scene: 'hall.w7.f2_first', if: '!hall_w7_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Parlour by the Stream =================================================================================
  // The best room, laid for guests, opening onto a garden where a stream runs past the bottom of the house; four
  // bowls on the bank; Owan by the water, Magoroku in the parlour, and the little gate out by the stream.
  const BOWLS = { rl: [8, 6], rs: [11, 6], bl: [21, 6], bs: [24, 6] };
  Object.assign(C.hallW7, { BOWLS });
  C.maps['hall.w7f3'] = Object.assign({}, K.base(W), {
    name: T('The Parlour by the Stream', '{川辺|かわべ} の {座敷|ざしき}'),
    ambient: Object.assign({}, AMB, { dark: 0.24, weather: 'snow' }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '_');                // where you come in
      k.rect(4, 9, 24, 9, 'm');                  // the parlour
      k.rect(4, 5, 24, 4, '.');                  // the garden by the stream
      k.rect(2, 2, 28, 3, '~');                  // the stream
      k.scatter(',', 6, 1701, [5, 7, 22, 1], '.');
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'cr_gate', x: 16, y: 5, scene: 'hall.w7.t10' },
        ...Object.keys(BOWLS).map((b) => ({ p: 'kr_jar', x: BOWLS[b][0], y: BOWLS[b][1], scene: 'hall.w7.b_' + b, if: '!xp_hall_w7_f2_got_' + b })),
        ...K.andon(26, 7, W, 't8'),
        { p: 'fw_tray', x: 8, y: 11 }, { p: 'fw_tray', x: 10, y: 11 }, { p: 'fw_tray', x: 12, y: 11 },
        { p: 'kr_scroll', x: 5, y: 9 }, { p: 'pot', x: 23, y: 11 },
        ...K.andon(26, 16, W, 't9'),
        K.lit(6, 16), K.lit(25, 13),
      ]),
    npcs: [
      { id: 'hall_owan3', char: 'hall_owan', x: 14, y: 7, dir: 'down', talk: [{ scene: 'hall.w7.owan3' }] },
      { id: 'hall_magoroku', x: 18, y: 13, dir: 'left', talk: [{ scene: 'hall.w7.t9' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w7.f3_first', if: '!hall_w7_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 7, title: T('The House That Remembers', '{覚|おぼ}えて いる {家|いえ}'),
    theme: T('What was left unsaid: leaving out what is understood; this, that and "the one"; the thing you both know.', '{言|い}わなくて も {分|わ}かる こと'),
    folklore: { en: 'Based on a real legend: the マヨイガ, the "wandering house" of the mountains of Tōno in northern Japan, told in the Tōno Monogatari (1910). Someone lost in the hills comes on a grand house with its gate open, red and black bowls laid out and a kettle on the boil, and nobody there; one who takes nothing and goes home finds a bowl come floating down the stream after them. The house\'s family and Owan are invented.' },
    music: 'hall_w7', hearth: C.hallHearths.w7, patterns: 2,
    grow: { en: 'reference and omission: の for "the one" and leaving out what is understood (and, at the top, {例|れい}の, {前者|ぜんしゃ} and {後者|こうしゃ}).' },
    floors: [
      { id: 'f1', map: 'hall.w7f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Black Gate', '{黒|くろ}い {門|もん}'),
        stations: { w7_b1: { kind: 'bench', map: 'hall.w7f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w7f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Rooms Within', '{奥|おく} の {部屋|へや}'),
        stations: { w7_b2: { kind: 'bench', map: 'hall.w7f2', x: 21, y: 23 }, w7_sp: { kind: 'spring', map: 'hall.w7f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w7f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Parlour by the Stream', '{川辺|かわべ} の {座敷|ざしき}'),
        stations: { w7_b3: { kind: 'bench', map: 'hall.w7f3', x: 20, y: 22 } }, procedures: ['hall_w7_leave'] },
    ],
    delvers: { f2: { map: 'hall.w7f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('The things left behind', '{忘|わす}れ{物|もの}') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The garden stones', '{庭|にわ} の {石|いし}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The kitchen memo', '{台所|だいどころ} の {覚|おぼ}え{書|が}き') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('The lantern in the dark room', '{暗|くら}い {部屋|へや} の {提灯|ちょうちん}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('The letter in the storehouse', '{蔵|くら} の {手紙|てがみ}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The bowls by the stream', '{川辺|かわべ} の {椀|わん}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Magoroku and Owan', 'マゴロク と オワン') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('Leaving the house', '{家|いえ} を {出|で}る') },
    ],
  });
})(RB.content, RB.mapkit);
