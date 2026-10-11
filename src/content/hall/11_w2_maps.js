/* The Hall of a Hundred Tales, wing 2, The Fox's Wedding (狐の嫁入り; a real image: rain in sunshine, and the foxfire
 * once said to light a fox bride's way): the floors and the wing (expansion P15; plan 04_DUNGEONS.md D9). Its theme:
 * who does what, and from whom to whom (particles; giving, lending and borrowing).
 *   1 · The Sun-Shower Meadow (hall.w2f1): the tale in four pictures in the rain shelter (t1), the gifts and their
 *       tags, carried to the right trays (t2), the go-between's practice cards (t3, a counterexample hall); a bench.
 *   2 · The Procession Road (hall.w2f2): the procession set in order by its card (t4), the foxfire in the sun-shower
 *       (t5, conditions: flame in the rain), the seating list in your companion's hands and Sayo's place at the feast
 *       (t6, an information gap), the riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · Beneath the Torii (hall.w2f3): the borrowed things returned to their owners by the shrine's notes (t8),
 *       Konta, who will not give up his umbrella (t9), and the cup passed round (t10, the capstone: the wedding cup,
 *       simplified from the real 三々九度).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w2.pat) chooses
 * the tags, the procession's order, Sayo's seat and who lent what to whom. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w2';
  const AMB = { dark: 0.18, playerLight: 70, weather: 'rain', tint: 'rgba(250,230,160,0.10)' };

  // ==== floor 1: The Sun-Shower Meadow ====================================================================================
  const GIFTS = { red: [11, 13], white: [21, 13], chestnut: [24, 8] };
  const TRAYS = { groom: [31, 6], mother: [31, 10], toku: [31, 14] };
  C.hallW2 = { GIFTS, TRAYS };
  C.maps['hall.w2f1'] = Object.assign({}, K.base(W), {
    name: T('The Sun-Shower Meadow', '{日照|ひで}り{雨|あめ} の {野|の}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in
      k.rect(4, 6, 23, 12, '.');                 // the meadow
      k.rect(16, 1, 2, 21, ':');                 // the path north and south
      k.rect(4, 11, 23, 2, ':');                 // the path east and west
      k.rect(1, 9, 5, 6, '_');                   // west: the rain shelter (the story room)
      k.rect(27, 4, 6, 13, '_');                 // east: the veranda with the trays
      k.rect(4, 2, 11, 4, '.');                  // north-west: the go-between's cards
      k.scatter('T', 8, 1531, [5, 6, 10, 5], '.'); k.scatter(',', 14, 1532, [4, 6, 22, 11], '.');
      k.rect(16, 1, 2, 21, ':'); k.rect(4, 11, 23, 2, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [17, 1] }),
      [
        // the story room
        { p: 'kr_scroll', x: 2, y: 10, scene: 'hall.w2.t1' }, ...K.andon(4, 9, W, 't1'), { p: 'lantern', x: 1, y: 9, light: 30, o: { lit: true } },
        // the gifts on the path, and the trays on the veranda (t2)
        { p: 'crate', x: GIFTS.red[0], y: GIFTS.red[1], scene: 'hall.w2.g_red', if: '!xp_hall_w2_f0_put_red' },
        { p: 'chest', x: GIFTS.white[0], y: GIFTS.white[1], scene: 'hall.w2.g_white', if: '!xp_hall_w2_f0_put_white' },
        { p: 'ko_basket', x: GIFTS.chestnut[0], y: GIFTS.chestnut[1], scene: 'hall.w2.g_chestnut', if: '!xp_hall_w2_f0_put_chestnut' },
        ...Object.keys(TRAYS).map((k) => ({ p: 'table', x: TRAYS[k][0], y: TRAYS[k][1], scene: 'hall.w2.tray_' + k })),
        ...K.andon(28, 4, W, 't2'),
        // the go-between's practice cards, and her stone (t3)
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w2.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w2.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w2.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w2.card4' },
        { p: 'stone_marker', x: 13, y: 3, scene: 'hall.w2.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10), K.lit(15, 14), K.lit(19, 14),
      ]),
    npcs: [], foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w2f2', sp: 'from_below', dir: 'up', if: 'hall.w2.f0.clear' }],
    onEnter: [{ scene: 'hall.w2.f1_first', if: '!hall_w2_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Procession Road ======================================================================================
  // five of the procession wait on the grass west of the road; sent on in the card's order, each takes their place on it
  const ROLES = ['bearer', 'toku', 'kozue', 'gin', 'porter'];
  const WAIT = { bearer: [12, 18], toku: [12, 16], kozue: [12, 14], gin: [12, 12], porter: [12, 10] };
  const ROAD = [[18, 8], [18, 10], [18, 12], [18, 14], [18, 16]];
  const CHAR = { bearer: 'hall_bearer', toku: 'hall_toku', kozue: 'hall_kozue', gin: 'hall_gin', porter: 'hall_porter' };
  C.hallW2.ROLES = ROLES;
  C.maps['hall.w2f2'] = Object.assign({}, K.base(W), {
    name: T('The Procession Road', '{行列|ぎょうれつ} の {道|みち}'),
    ambient: Object.assign({}, AMB, { dark: 0.24 }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '.');                 // where you come in
      k.rect(17, 2, 2, 20, ':');                 // the road
      k.rect(9, 8, 8, 13, '.');                  // west: where the procession waits
      k.rect(19, 7, 11, 11, '.');                // east: the meadow of foxfire
      k.rect(22, 18, 11, 6, '_');                // the feast's long table (south-east)
      k.rect(4, 2, 9, 5, '.');                   // the riddle stone's grass (north-west)
      k.rect(28, 2, 6, 5, '.');                  // the resting place (north-east)
      k.rect(19, 5, 9, 2, ':');                  //   its path (joining the road below the rope)
      k.rect(8, 20, 7, 5, '.');                  // the spring (south-west)
      k.rect(13, 5, 4, 2, ':');                  //   the riddle stone's path (below the rope too)
      k.scatter('T', 8, 1541, [20, 8, 9, 9], '.'); k.scatter(',', 12, 1542, [9, 8, 7, 12], '.');
      k.rect(23, 10, 5, 5, '.');                 // the clearing where the foxfire sways
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [18, 2] }),
      [
        { p: 'well', x: 10, y: 22, scene: 'hall.w2.spring' },
        { p: 'sign', x: 20, y: 20, scene: 'hall.w2.t4_card' }, ...K.andon(14, 20, W, 't4'),
        // the feast's table: two seats with places set (t6), and the seating list
        { p: 'table', x: 26, y: 20 }, { p: 'table', x: 27, y: 20 }, { p: 'table', x: 28, y: 20 },
        { p: 'chair', x: 25, y: 19, scene: 'hall.w2.t6_bride' }, { p: 'chair', x: 29, y: 21, scene: 'hall.w2.t6_groom' },
        { p: 'desk', x: 23, y: 22, scene: 'hall.w2.t6' }, ...K.andon(32, 19, W, 't6'),
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w2.t7' }, ...K.andon(8, 2, W, 't7'),
        ...K.andon(28, 8, W, 't5'),
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [].concat(
      ROLES.map((r) => ({ id: CHAR[r], x: WAIT[r][0], y: WAIT[r][1], dir: 'right', if: '!xp_hall_w2_f1_sent_' + r, talk: [{ scene: 'hall.w2.l4_' + r }] })),
      // once sent: in their place on the road (the card's slot for them is drawn by the step they were sent at)
      ...ROLES.map((r) => [1, 2, 3, 4, 5].map((i) => ({ id: CHAR[r] + '_r' + i, char: CHAR[r], x: ROAD[i - 1][0], y: ROAD[i - 1][1], dir: 'up', if: 'xp_hall_w2_f1_sent_' + r + '&xp_hall_w2_f1_at_' + r + '_' + i, talk: [{ scene: 'hall.w2.l4_placed' }] })))),
    foes: [
      { id: 'b1', enemy: 'co.ember', encounter: 'hall.w2.foxfire', scene: 'hall.w2.t5', x: 25, y: 12, patrol: 2, bg: 'keepers', intro: { jp: '{雨|あめ} の {中|なか} で 、 {青|あお}い {火|ひ} が {揺|ゆ}れて いる 。 {狐火|きつねび} だ 。', en: 'A blue flame sways in the rain. Foxfire.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w2f3', sp: 'from_below', dir: 'up', if: 'hall.w2.f1.clear' }],
    onEnter: [{ scene: 'hall.w2.f2_first', if: '!hall_w2_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: Beneath the Torii ========================================================================================
  const DOORS = { sayo: [5, 10], konta: [5, 15], toku: [27, 12] };
  const THINGS = { umbrella: [14, 20], lantern: [18, 20], cup: [20, 18] };
  Object.assign(C.hallW2, { DOORS, THINGS });
  C.maps['hall.w2f3'] = Object.assign({}, K.base(W), {
    name: T('Beneath the Torii', '{鳥居|とりい} の {下|した}'),
    ambient: Object.assign({}, AMB, { dark: 0.3, weather: 'motes' }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(12, 18, 10, 6, '.');                // where you come in, and the borrowed things
      k.rect(15, 2, 3, 17, ':');                 // the approach to the shrine
      k.rect(2, 8, 13, 10, '.');                 // west: two houses
      k.rect(18, 8, 12, 10, '.');                // east: the go-between's house
      k.rect(12, 2, 9, 5, '+');                  // the shrine's stone court
      k.scatter('T', 8, 1551, [3, 9, 9, 8], '.'); k.scatter('T', 6, 1552, [20, 9, 8, 8], '.');
      k.rect(15, 2, 3, 17, ':');
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'pillar', x: 14, y: 8 }, { p: 'pillar', x: 18, y: 8 },          // the torii's two posts
        { p: 'shrine', x: 16, y: 2 },
        { p: 'table', x: 16, y: 5, scene: 'hall.w2.t10', if: '!hall.w2.t10' }, { p: 'teaset', x: 16, y: 5, if: 'hall.w2.t10', scene: 'hall.w2.cups_after' },
        { p: 'sign', x: 21, y: 20, scene: 'hall.w2.t8_notes' },
        { p: 'hall_umbrella', x: THINGS.umbrella[0], y: THINGS.umbrella[1], scene: 'hall.w2.th_umbrella', if: '!xp_hall_w2_f2_back_umbrella' },
        { p: 'lantern', x: THINGS.lantern[0], y: THINGS.lantern[1], scene: 'hall.w2.th_lantern', if: '!xp_hall_w2_f2_back_lantern' },
        { p: 'teaset', x: THINGS.cup[0], y: THINGS.cup[1], scene: 'hall.w2.th_cup', if: '!xp_hall_w2_f2_back_cup' },
        ...Object.keys(DOORS).map((k) => ({ p: 'door', x: DOORS[k][0], y: DOORS[k][1], scene: 'hall.w2.door_' + k })),
        ...K.andon(12, 18, W, 't8'), ...K.andon(24, 15, W, 't9'),
        K.lit(14, 9), K.lit(18, 9),
      ]),
    npcs: [
      { id: 'hall_konta', x: 22, y: 16, dir: 'left', if: '!hall.w2.t9', talk: [{ scene: 'hall.w2.t9' }] },
      { id: 'hall_konta_after', char: 'hall_konta', x: 17, y: 7, dir: 'up', if: 'hall.w2.t9', talk: [{ scene: 'hall.w2.konta_after' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w2.f3_first', if: '!hall_w2_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 2, title: T('The Fox\'s Wedding', '{狐|きつね} の {嫁入|よめい}り'),
    theme: T('Who does what, from whom to whom: particles; giving, lending and borrowing.', '{誰|だれ} が {誰|だれ} に'),
    folklore: { en: 'A real image: 狐の嫁入り, "a fox\'s wedding", is still the name for rain falling while the sun shines, and was once the name for lines of foxfire in the hills, said to light a fox bride\'s way. The tale is the hall\'s own.' },
    music: 'hall_w2', hearth: C.hallHearths.w2, patterns: 2,
    grow: { en: 'who did it for whom: ～てあげる, ～てくれる and ～てもらう (and, at the top, the humble and respectful ways to give).' },
    floors: [
      { id: 'f1', map: 'hall.w2f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Sun-Shower Meadow', '{日照|ひで}り{雨|あめ} の {野|の}'),
        stations: { w2_b1: { kind: 'bench', map: 'hall.w2f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w2f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Procession Road', '{行列|ぎょうれつ} の {道|みち}'),
        stations: { w2_b2: { kind: 'bench', map: 'hall.w2f2', x: 21, y: 23 }, w2_sp: { kind: 'spring', map: 'hall.w2f2', x: 10, y: 22 } } },
      { id: 'f3', map: 'hall.w2f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('Beneath the Torii', '{鳥居|とりい} の {下|した}'),
        stations: { w2_b3: { kind: 'bench', map: 'hall.w2f3', x: 20, y: 22 } }, procedures: ['hall_w2_cups'] },
    ],
    delvers: { f2: { map: 'hall.w2f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('The gifts and their tags', '{贈|おく}り{物|もの} の {札|ふだ}') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The go-between\'s cards', '{仲人|なこうど} の {札|ふだ}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The procession in order', '{行列|ぎょうれつ} の {順番|じゅんばん}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('Foxfire in the rain', '{雨|あめ} の {狐火|きつねび}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('Sayo\'s seat', 'サヨ の {席|せき}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The borrowed things', '{借|か}りた {物|もの}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Konta\'s umbrella', 'コンタ の {傘|かさ}') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The cup passed round', '{盃|さかずき} の {受|う}け{渡|わた}し') },
    ],
  });
})(RB.content, RB.mapkit);
