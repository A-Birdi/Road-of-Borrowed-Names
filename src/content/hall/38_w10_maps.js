/* The Hall of a Hundred Tales, wing 10, The Hundredth Tale (the player's own journey, told back): the floors and the
 * wing (expansion P15; plan 04_DUNGEONS.md D9). Its theme: everything at once; the tenth lantern's light is the Hall
 * itself on the night the last keeper stopped the Hundred at ninety-nine, and the tale to be told is yours.
 *   1 · The Road Behind (hall.w10f1): your journey in four pictures (t1), the places of your road set on its
 *       waystones in the order you came by them (t2), the old keepers' practice slates, one wrong (t3, a
 *       counterexample hall); a bench.
 *   2 · The Lantern Gallery (hall.w10f2): five sayings, each set by the lantern of the tale whose lesson it shows (t4),
 *       the moss lantern (t5, rooted), the last keepers' note in your companion's hands and where the hundredth wick
 *       is kept (t6, an information gap), the riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · The Unwritten Page (hall.w10f3): the hundredth tale's four pages, each given the word it is missing (t8),
 *       Sōan and Kohaku (t9, a mediation), and the hundredth tale, yours, told (t10, the capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w10.pat) chooses
 * which places of your road the waystones ask for, the sayings in the gallery, where the wick is kept and the pages.
 * The door to this wing stays sealed until nine lanterns are relit (src/content/hall/20_scenes_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w10';
  const AMB = { dark: 0.4, playerLight: 56, weather: 'motes', tint: 'rgba(110,80,40,0.10)' };

  // ==== floor 1: The Road Behind ===========================================================================================
  // A road of memory under a lantern-coloured sky: the hut with your journey's scroll, six waystones along the road
  // and the tablets of the places you passed, the road record by the way, and the keepers' practice slates.
  const STONES = { st1: [6, 16], st2: [8, 12], st3: [11, 9], st4: [21, 9], st5: [24, 12], st6: [27, 16] };
  const TABPOS = [[6, 7], [8, 7], [10, 7], [20, 7], [22, 7], [24, 7]];
  // which places each pattern's waystones ask for (in story order), and where their tablets lie (shuffled)
  const WAY = { 0: ['rw', 'mb1', 'co', 'kr', 'ko', 'yn'], 1: ['sg', 'mb2', 'sb', 'lf', 'cr', 'sa'] };
  const TABAT = { 0: { ko: 0, rw: 1, kr: 2, mb1: 3, yn: 4, co: 5 }, 1: { cr: 0, lf: 1, sg: 2, sa: 3, mb2: 4, sb: 5 } };
  C.hallW10 = { STONES, WAY, TABAT };
  C.maps['hall.w10f1'] = Object.assign({}, K.base(W), {
    name: T('The Road Behind', '{来|き}た {道|みち}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in
      k.rect(4, 6, 27, 12, '.');                 // the road behind you
      k.rect(1, 8, 6, 5, '_');                   // west: the hut with the scroll (the story room)
      k.rect(4, 2, 11, 4, '_');                  // north-west: the keepers' practice slates
      k.scatter(',', 7, 2011, [5, 13, 9, 4], '.');
      k.rect(16, 1, 2, 21, ':');                 // the path north, and south
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [16, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w10.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        // the six waystones, the road record, and the tablets of the places (gone once set on their stone)
        ...Object.keys(STONES).map((st) => ({ p: 'stone_marker', x: STONES[st][0], y: STONES[st][1], scene: 'hall.w10.' + st })),
        { p: 'noticeboard', x: 12, y: 14, scene: 'hall.w10.t2_board' }, ...K.andon(29, 16, W, 't2'),
        ...[0, 1].flatMap((p) => Object.keys(TABAT[p]).map((key) => ({ p: 'signblank', x: TABPOS[TABAT[p][key]][0], y: TABPOS[TABAT[p][key]][1], scene: 'hall.w10.tab_' + key, if: 'hall.w10.pat=' + p + '&!xp_hall_w10_f0_set_' + key }))),
        // the practice slates, and the one that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w10.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w10.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w10.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w10.card4' },
        { p: 'kr_scroll', x: 13, y: 3, scene: 'hall.w10.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10),
      ]),
    npcs: [
      { id: 'hall_kohaku', x: 19, y: 15, dir: 'down', talk: [{ scene: 'hall.w10.kohaku' }] },
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w10f2', sp: 'from_below', dir: 'up', if: 'hall.w10.f0.clear' }],
    onEnter: [{ scene: 'hall.w10.f1_first', if: '!hall_w10_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The Lantern Gallery =======================================================================================
  // The Hall's long gallery as it was: the nine lanterns of the nine tales along the walls, five sayings loose on the
  // floor, the moss lantern in the corner, the keepers' note by the wick shelf, the lacquer box by the hearth and the
  // little altar; the garden with the riddle stone, a back room to rest in, and the well.
  const LAMPS = { w1: [6, 8], w2: [9, 8], w3: [12, 8], w4: [21, 8], w5: [24, 8], w6: [27, 8], w7: [30, 11], w8: [30, 14], w9: [30, 17] };
  const SAYINGS = { s1: [8, 13], s2: [11, 15], s3: [14, 12], s4: [20, 14], s5: [23, 16] };
  const WICK = { box: [13, 18], shelf: [19, 10], altar: [26, 17] };
  Object.assign(C.hallW10, { LAMPS, SAYINGS, WICK });
  C.maps['hall.w10f2'] = Object.assign({}, K.base(W), {
    name: T('The Lantern Gallery', '{灯|ひ} の {回廊|かいろう}'),
    ambient: Object.assign({}, AMB, { dark: 0.46 }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, ':');                 // where you come in
      k.rect(4, 7, 28, 13, '_');                 // the gallery
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
        { p: 'well', x: 9, y: 22, scene: 'hall.w10.spring' },
        // the nine lanterns of the nine tales, and the five sayings (gone once set by their lantern)
        ...Object.keys(LAMPS).map((w) => ({ p: 'lantern', x: LAMPS[w][0], y: LAMPS[w][1], light: 24, o: { lit: true }, scene: 'hall.w10.to_' + w })),
        ...Object.keys(SAYINGS).map((s) => ({ p: 'fw_postnote', x: SAYINGS[s][0], y: SAYINGS[s][1], scene: 'hall.w10.' + s, if: '!xp_hall_w10_f1_put_' + s })),
        ...K.andon(5, 18, W, 't4'),
        // the keepers' note, and where the wick might be kept
        { p: 'kr_scroll', x: 25, y: 12, scene: 'hall.w10.t6' }, ...K.andon(27, 12, W, 't6'),
        { p: 'chest', x: WICK.box[0], y: WICK.box[1], scene: 'hall.w10.k_box' },
        { p: 'pa_lamprack', x: WICK.shelf[0], y: WICK.shelf[1], scene: 'hall.w10.k_shelf' },
        { p: 'hall_jizo', x: WICK.altar[0], y: WICK.altar[1], scene: 'hall.w10.k_altar' },
        { p: 'sb_irori', x: 11, y: 17 },
        // the moss lantern's corner (t5), the riddle stone (t7)
        ...K.andon(5, 14, W, 't5'),
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w10.t7' }, ...K.andon(8, 2, W, 't7'),
        // the back room (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [
      { id: 'hall_kohaku2', char: 'hall_kohaku', x: 20, y: 18, dir: 'up', talk: [{ scene: 'hall.w10.kohaku2' }] },
    ],
    foes: [
      { id: 'b1', enemy: 'kr.moss', encounter: 'hall.w10.moss', scene: 'hall.w10.t5', x: 7, y: 15, patrol: 1, bg: 'keepers', intro: { jp: '{隅|すみ} の {苔|こけ} {灯籠|どうろう} が 、 {根|ね} を {張|は}った まま {動|うご}き{出|だ}した 。', en: 'The moss lantern in the corner starts to move, its roots still in the floor.' }, settle: { jp: '{苔|こけ} {灯籠|どうろう} は 、 {静|しず}か に {灯|ひ} を {点|とも}した 。', en: 'The moss lantern quietly lights its flame.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w10f3', sp: 'from_below', dir: 'up', if: 'hall.w10.f1.clear' }],
    onEnter: [{ scene: 'hall.w10.f2_first', if: '!hall_w10_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Unwritten Page ========================================================================================
  // The innermost room: four page stands with the hundredth tale's pages, each missing a word; the old keeper and
  // his apprentice by the ninety-nine lit lanterns; and the hundredth lantern, dark, in the middle of the room.
  const PAGES = { pg1: [6, 6], pg2: [10, 6], pg3: [21, 6], pg4: [25, 6] };
  Object.assign(C.hallW10, { PAGES });
  C.maps['hall.w10f3'] = Object.assign({}, K.base(W), {
    name: T('The Unwritten Page', '{白紙|はくし} の {頁|ページ}'),
    ambient: Object.assign({}, AMB, { dark: 0.3 }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '_');                // where you come in
      k.rect(4, 4, 24, 14, 'm');                 // the innermost room
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [19, 22] }),
      [
        ...Object.keys(PAGES).map((pg) => ({ p: 'signblank', x: PAGES[pg][0], y: PAGES[pg][1], scene: 'hall.w10.' + pg })),
        ...K.andon(5, 16, W, 't8'),
        { p: 'sb_greatlamp', x: 15, y: 9, scene: 'hall.w10.t10' }, ...K.andon(18, 8, W, 't10'),
        ...K.andon(26, 16, W, 't9'),
        K.lit(5, 5), K.lit(26, 5), K.lit(5, 12), K.lit(26, 12),
      ]),
    npcs: [
      { id: 'hall_soan', x: 12, y: 13, dir: 'right', talk: [{ scene: 'hall.w10.t9' }] },
      { id: 'hall_kohaku3', char: 'hall_kohaku', x: 20, y: 13, dir: 'left', talk: [{ scene: 'hall.w10.t9' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w10.f3_first', if: '!hall_w10_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 10, title: T('The Hundredth Tale', '{百話目|ひゃくわめ} の {話|はなし}'),
    theme: T('The unwritten journey: everything the other tales taught, together, and the tale is yours.', '「 {百話目|ひゃくわめ} 」'),
    folklore: { en: 'Your own journey, told back. The custom behind the Hall is real: at a {百物語|ひゃくものがたり} gathering a hundred strange tales were told by a hundred lights, one put out after each, and legend held that something appeared after the hundredth. The keepers who relit their lights instead, and the night their last keeper stopped at ninety-nine, are the game\'s own.' },
    music: 'hall_w10', hearth: C.hallHearths.w10, patterns: 2,
    grow: { en: 'everything the nine tales taught, and the turns between them: ～からこそ and ～ものの (and, at the top, the keepers\' old written style).' },
    floors: [
      { id: 'f1', map: 'hall.w10f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The Road Behind', '{来|き}た {道|みち}'),
        stations: { w10_b1: { kind: 'bench', map: 'hall.w10f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w10f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The Lantern Gallery', '{灯|ひ} の {回廊|かいろう}'),
        stations: { w10_b2: { kind: 'bench', map: 'hall.w10f2', x: 21, y: 23 }, w10_sp: { kind: 'spring', map: 'hall.w10f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w10f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Unwritten Page', '{白紙|はくし} の {頁|ページ}'),
        stations: { w10_b3: { kind: 'bench', map: 'hall.w10f3', x: 19, y: 22 } }, procedures: ['hall_w10_tale'] },
    ],
    delvers: { f2: { map: 'hall.w10f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('Your journey in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('The waystones of your road', '{道|みち} の {標|しるべ}') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The keepers\' slates', '{灯守|ひもり} の {石板|せきばん}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The nine lanterns', '{九|ここの}つ の {灯|ひ}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('The moss lantern', '{苔|こけ} {灯籠|どうろう}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('The keepers\' note', '{灯守|ひもり} の {書|か}き{付|つ}け') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The unwritten pages', '{白紙|はくし} の {頁|ページ}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Sōan and Kohaku', 'ソウアン と コハク') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The hundredth tale', '{百話目|ひゃくわめ}') },
    ],
  });
})(RB.content, RB.mapkit);
