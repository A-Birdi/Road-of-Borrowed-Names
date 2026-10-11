/* The Hall of a Hundred Tales, wing 6, The Toll That Changed (an invented tale; the barrier stations of the old
 * highways, 関所, and the notice boards that set out their rules, 高札, are real): the floors and the wing (expansion
 * P15; plan 04_DUNGEONS.md D9). Its theme: conditions and exceptions (～と, ～ば, ～たら and ～なら; ～ても; on the
 * Grow route ～場合, ただし and ～以外; at the top ～限り, ～さえ～ば, ～を除いて).
 *   1 · The Toll House at Noon (hall.w6f1): the tale in four pictures in Kihei's room (t1), the toll board and four
 *       travellers, each given the tag the board says they owe (t2), the waymarkers' sayings on conditions, one wrong
 *       (t3, a counterexample hall); a bench.
 *   2 · The Pass at Dusk (hall.w6f2): the pass's five lanterns lit by the rule and today's sky (t4), the mist on the
 *       pass (t5, mist; the porters fly), Kihei's ledger in your companion's hands and the one traveller it lets go on
 *       after dark (t6, an information gap), the riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · The Gate at Nightfall (hall.w6f3): the help board, each case hung beside what the toll house does for it
 *       (t8), Ibuki and Otsuta at the shut gate (t9, a mediation), and the night at the gate (t10, the capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w6.pat) chooses
 * the travellers' circumstances, the lantern rule, the ledger's night rule and the help board's cases. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w6';
  const AMB = { dark: 0.14, playerLight: 50, weather: 'leaves', tint: 'rgba(200,120,70,0.10)' };

  // ==== floor 1: The Toll House at Noon ===================================================================================
  // The toll house by the road (Kihei's room inside it), the toll board under the eaves with the box of tags beside
  // it, four travellers waiting their turn, and the waymarkers on the old road to the north-west.
  const TAGS = { free: [23, 7], one: [25, 7], two: [27, 7] };
  const WAIT = { ofuku: [22, 14], hanbei: [25, 14], koun: [28, 14], momo: [24, 16] };
  C.hallW6 = { TAGS, WAIT };
  C.maps['hall.w6f1'] = Object.assign({}, K.base(W), {
    name: T('The Toll House at Noon', '{昼|ひる} の {関所|せきしょ}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in
      k.rect(4, 6, 27, 12, '.');                 // the yard before the toll house
      k.rect(16, 1, 2, 21, ':');                 // the road north up the pass, and south
      k.rect(4, 11, 27, 2, ':');                 // the lane east and west
      k.rect(1, 8, 6, 5, '_');                   // west: the toll house, Kihei's room (the story room)
      k.rect(4, 2, 11, 4, '.');                  // north-west: the waymarkers
      k.scatter('T', 4, 1661, [7, 6, 6, 3], '.'); k.scatter(',', 10, 1662, [4, 13, 26, 4], '.');
      k.rect(16, 1, 2, 21, ':'); k.rect(4, 11, 27, 2, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [17, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w6.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } }, { p: 'sb_futon', x: 2, y: 11 },
        // the toll board and the box of tags
        { p: 'noticeboard', x: 20, y: 7, scene: 'hall.w6.board' },
        ...Object.keys(TAGS).map((g) => ({ p: 'fw_indexbox', x: TAGS[g][0], y: TAGS[g][1], scene: 'hall.w6.tag_' + g })),
        ...K.andon(29, 8, W, 't2'),
        // the waymarkers, and the stone that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w6.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w6.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w6.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w6.card4' },
        { p: 'stone_marker', x: 13, y: 3, scene: 'hall.w6.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10),
      ]),
    npcs: [
      { id: 'hall_kihei', x: 4, y: 11, dir: 'left', talk: [{ scene: 'hall.w6.kihei' }] },
      { id: 'hall_ibuki', x: 21, y: 9, dir: 'down', talk: [{ scene: 'hall.w6.ibuki' }] },
      ...Object.keys(WAIT).map((w) => ({ id: 'hall_' + w, x: WAIT[w][0], y: WAIT[w][1], dir: 'up', talk: [{ scene: 'hall.w6.n_' + w }], if: '!xp_hall_w6_f0_served_' + w })),
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w6f2', sp: 'from_below', dir: 'up', if: 'hall.w6.f0.clear' }],
    onEnter: [{ scene: 'hall.w6.f1_first', if: '!hall_w6_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Pass at Dusk ===========================================================================================
  // The road climbing the pass, over a stream by a plank bridge; five stone lanterns along it (the foot, the bend, the
  // bridge, the shrine, the top), the lighting rule on its post and the festival notice; the shelter hut where Kihei's
  // ledger is kept, and three travellers waiting to go on up after dark.
  const LAMPS = { foot: [16, 19], bend: [19, 17], bridge: [16, 15], shrine: [23, 10], top: [19, 7] };
  const NIGHT = { momo: [14, 8], koun: [22, 7], hanbei: [14, 10] };
  Object.assign(C.hallW6, { LAMPS, NIGHT });
  C.maps['hall.w6f2'] = Object.assign({}, K.base(W), {
    name: T('The Pass at Dusk', '{夕暮|ゆうぐ}れ の {峠|とうげ}'),
    ambient: Object.assign({}, AMB, { dark: 0.3, tint: 'rgba(120,70,90,0.14)' }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '.');                 // where you come in
      k.rect(5, 6, 26, 15, '.');                 // the slopes either side of the road
      k.rect(5, 13, 26, 2, '~');                 // the stream across the pass
      k.rect(17, 2, 2, 20, ':');                 // the road up the pass
      k.rect(17, 13, 2, 2, 'B');                 //   and its plank bridge
      k.rect(4, 2, 9, 4, '.');                   // north-west: the riddle stone
      k.rect(13, 5, 4, 1, ':');                  //   its path (below the rope)
      k.rect(28, 2, 6, 5, '.');                  // north-east: the resting place
      k.rect(19, 5, 9, 1, ':');                  //   its path (below the rope)
      k.rect(7, 21, 7, 4, '.');                  // south-west: the spring
      k.rect(13, 22, 3, 2, '.');
      k.scatter('Q', 6, 1671, [6, 16, 8, 4], '.');
      k.scatter(';', 10, 1673, [6, 6, 8, 6], '.');
      k.rect(17, 2, 2, 11, ':'); k.rect(17, 15, 2, 7, ':');
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [18, 2] }),
      [
        { p: 'well', x: 9, y: 22, scene: 'hall.w6.spring' },
        // the five lanterns (dark until lit), the lighting rule and the festival notice
        ...Object.keys(LAMPS).flatMap((l) => [
          { p: 'deadlantern', x: LAMPS[l][0], y: LAMPS[l][1], scene: 'hall.w6.l_' + l, if: '!xp_hall_w6_f1_lit_' + l },
          { p: 'lantern', x: LAMPS[l][0], y: LAMPS[l][1], scene: 'hall.w6.l_' + l, if: 'xp_hall_w6_f1_lit_' + l, light: 34, o: { lit: true } }]),
        { p: 'shrine', x: 24, y: 9 },
        { p: 'hall_signpost', x: 14, y: 19, scene: 'hall.w6.t4_rule' }, { p: 'sign', x: 21, y: 19, scene: 'hall.w6.sky' },
        ...K.andon(14, 17, W, 't4'),
        // the shelter hut: Kihei's ledger
        { p: 'desk', x: 26, y: 17, scene: 'hall.w6.t6' }, ...K.andon(29, 17, W, 't6'),
        // the riddle stone (t7)
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w6.t7' }, ...K.andon(8, 2, W, 't7'),
        ...K.andon(6, 8, W, 't5'),
        // the resting place (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [
      { id: 'hall_ibuki2', char: 'hall_ibuki', x: 25, y: 19, dir: 'up', talk: [{ scene: 'hall.w6.ibuki2' }] },
      // the one the ledger lets go on has gone up the pass once the trial is done
      ...Object.keys(NIGHT).map((w) => Object.assign({ id: 'hall_' + w + '2', char: 'hall_' + w, x: NIGHT[w][0], y: NIGHT[w][1], dir: 'down', talk: [{ scene: 'hall.w6.x_' + w }] },
        w === 'momo' ? { if: '!hall.w6.t6|hall.w6.pat=1' } : w === 'koun' ? { if: '!hall.w6.t6|hall.w6.pat=0' } : {})),
    ],
    foes: [
      { id: 'b1', enemy: 'cr.fogporter', encounter: 'hall.w6.mist', scene: 'hall.w6.t5', x: 9, y: 9, patrol: 1, bg: 'mistpass', intro: { jp: '{霧|きり} の {中|なか} から 、 {荷|に} を {担|かつ}いだ {影|かげ} が {浮|う}かんで きた 。', en: 'Out of the mist floats a shape with a load on its back.' }, settle: { jp: '{霧|きり} が {晴|は}れて 、 {影|かげ} は {谷|たに} へ {流|なが}れて いった 。', en: 'The mist lifts, and the shape drifts away down into the valley.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w6f3', sp: 'from_below', dir: 'up', if: 'hall.w6.f1.clear' }],
    onEnter: [{ scene: 'hall.w6.f2_first', if: '!hall_w6_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Gate at Nightfall ======================================================================================
  // The gate at the top of the pass as night comes on: the help board on the guard hut's wall with its four empty
  // hooks and the five case boards fallen in the wind, Ibuki at the shut gate and Otsuta with her baby before it.
  const HOOKS = { h1: [6, 10], h2: [8, 10], h3: [10, 10], h4: [12, 10] };
  const CASES = { rain: [6, 14], dark: [8, 14], sick: [10, 14], lost: [12, 14], cold: [14, 14] };
  Object.assign(C.hallW6, { HOOKS, CASES });
  C.maps['hall.w6f3'] = Object.assign({}, K.base(W), {
    name: T('The Gate at Nightfall', '{日暮|ひぐ}れ の {門|もん}'),
    ambient: Object.assign({}, AMB, { dark: 0.42, playerLight: 62, tint: 'rgba(40,40,80,0.16)' }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '.');                // where you come in
      k.rect(4, 7, 24, 12, '.');                 // the gate yard
      k.rect(15, 2, 3, 6, ':');                  // the road up to the gate
      k.rect(11, 2, 11, 3, '+');                 // the gate's stone footing
      k.scatter(';', 8, 1681, [20, 14, 7, 4], '.');
      k.rect(15, 2, 3, 6, ':');
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'cr_gate', x: 16, y: 3, scene: 'hall.w6.t10' },
        { p: 'noticeboard', x: 8, y: 8, scene: 'hall.w6.t8_board' }, ...K.andon(4, 8, W, 't8'),
        ...Object.keys(HOOKS).map((h) => ({ p: 'signblank', x: HOOKS[h][0], y: HOOKS[h][1], scene: 'hall.w6.' + h })),
        ...Object.keys(CASES).map((c) => ({ p: 'sign', x: CASES[c][0], y: CASES[c][1], scene: 'hall.w6.pl_' + c, if: '!xp_hall_w6_f2_hung_' + c })),
        ...K.andon(26, 8, W, 't9'),
        { p: 'sb_irori', x: 22, y: 12 },
        K.lit(13, 5), K.lit(20, 5),
      ]),
    npcs: [
      { id: 'hall_ibuki3', char: 'hall_ibuki', x: 18, y: 7, dir: 'down', talk: [{ scene: 'hall.w6.t9' }] },
      { id: 'hall_otsuta', x: 14, y: 8, dir: 'up', talk: [{ scene: 'hall.w6.otsuta' }], if: '!hall.w6.t9' },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w6.f3_first', if: '!hall_w6_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 6, title: T('The Toll That Changed', '{変|か}わった {通行料|つうこうりょう}'),
    theme: T('Conditions and exceptions: if, when, even if, except and unless.', '「 なら 」 と 「 ただし 」'),
    folklore: { en: 'An invented tale. Two things in it are real: the barrier stations ({関所|せきしょ}) on the old highways, where travellers showed their papers and paid; and the notice boards ({高札|こうさつ}) that set out a place\'s rules in public, so that anyone could read them.' },
    music: 'hall_w6', hearth: C.hallHearths.w6, patterns: 2,
    grow: { en: 'rules and their exceptions: ～{場合|ばあい}, ただし and ～{以外|いがい} (and, at the top, ～{限|かぎ}り, ～さえ～ば, ～を{除|のぞ}いて).' },
    floors: [
      { id: 'f1', map: 'hall.w6f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Toll House at Noon', '{昼|ひる} の {関所|せきしょ}'),
        stations: { w6_b1: { kind: 'bench', map: 'hall.w6f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w6f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Pass at Dusk', '{夕暮|ゆうぐ}れ の {峠|とうげ}'),
        stations: { w6_b2: { kind: 'bench', map: 'hall.w6f2', x: 21, y: 23 }, w6_sp: { kind: 'spring', map: 'hall.w6f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w6f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Gate at Nightfall', '{日暮|ひぐ}れ の {門|もん}'),
        stations: { w6_b3: { kind: 'bench', map: 'hall.w6f3', x: 20, y: 22 } }, procedures: ['hall_w6_watch'] },
    ],
    delvers: { f2: { map: 'hall.w6f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('The toll board', '{通行料|つうこうりょう} の {札|ふだ}') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The waymarkers', '{道標|みちしるべ}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The lanterns of the pass', '{峠|とうげ} の {灯籠|とうろう}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('The mist on the pass', '{峠|とうげ} の {霧|きり}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('Kihei\'s ledger', 'キヘエ の {帳面|ちょうめん}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The help board', '{助|たす}け の {札|ふだ}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Ibuki and Otsuta', 'イブキ と オツタ') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The night at the gate', '{門|もん} の {夜|よる}') },
    ],
  });
})(RB.content, RB.mapkit);
