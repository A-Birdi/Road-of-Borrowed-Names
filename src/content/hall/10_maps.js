/* The Hall of a Hundred Tales: the foyer and wing 1's floors (expansion P15; plan 04_DUNGEONS.md D9).
 *
 * The foyer (hall.foyer): the old hall's long room, entered from the west by the door above the Keepers' Road. Ten
 * alcoves face it, five on the north side (wings 1–5) and five on the south (wings 6, 7, 10, 8, 9: the tenth, the
 * Hundredth Tale, in the middle, opposite the first five). Each alcove holds the wing's hearth (its checkpoint, lit the
 * first time you reach it), its lantern (relit when the tale is done) and the paper screen through which the wing is
 * entered. At the east end, the keepers' rules on a board and the lectern where the key ledger lay.
 *
 * Wing 1, The Lamp at the Crossroads (辻の灯籠; invented): a hill road at dusk going to night, inside a lamp's light.
 *   1 · The Crossroads at Dusk (hall.w1f1): the story room in the roadside shelter (t1), the signpost and a traveller
 *       asking the way (t2), the row of plaques (t3, a counterexample hall); a bench.
 *   2 · The Lantern Road (hall.w1f2): roads in a grid between lanterns; the route card (t4: follow it to the right
 *       lantern), the stray lanterns in the mist (t5, conditions), the map your companion holds and the spring it
 *       shows (t6, an information gap), the riddle stone (t7: a reprieve); a bench, a spring, a resting place where a
 *       delver may be met.
 *   3 · The Lamp's Crossroads (hall.w1f3): four lamps to light in the order Otami's note gives (t8), Genza the pilgrim
 *       who will not say he is lost (t9), and the great lamp relit for the travellers (t10, the capstone); a bench.
 * Each floor's way on is closed by a sacred rope until every trial on it is done. The pattern fixed when the wing is
 * first entered (hall.w1.pat) chooses which version of the signpost, the plaques, the route card, the spring and the
 * lamps' order you meet. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const HALL = { region: 'hall', music: 'hall', edition: 2, noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the Hall of a Hundred Tales' }, indoor: true };
  const W1 = { region: 'hall_w1', music: 'hall_w1', edition: 2, noTravel: true, noCheckpoint: true, travelKind: 'dungeon', travelPlace: { en: 'the Hall of a Hundred Tales' }, expedition: 'hall_w1' };
  const lit = (x, y, cond, scene) => Object.assign({ p: 'kr_toro', x, y, light: 34, o: { lit: true } }, cond ? { if: cond } : {}, scene ? { scene } : {});
  // a trial's own lantern: dark until the trial is done
  const andon = (x, y, w, t) => [
    { p: 'hall_andon', x, y, if: '!hall.' + w + '.' + t },
    { p: 'hall_andon', x, y, if: 'hall.' + w + '.' + t, light: 30, o: { lit: true } },
  ];

  // ==== the foyer ======================================================================================================
  const NORTH = [['w1', 6], ['w2', 14], ['w3', 22], ['w4', 30], ['w5', 38]];
  const SOUTH = [['w6', 6], ['w7', 14], ['w10', 22], ['w8', 30], ['w9', 38]];
  const alcove = (w, x0, north) => {
    const sy = north ? 2 : 19, hy = north ? 4 : 16, ay = north ? 3 : 18;
    return [
      { p: 'hall_screen', x: x0 + 2, y: sy, if: '!hall.' + w + '.lit', scene: 'hall.door_' + w },
      { p: 'hall_screen', x: x0 + 2, y: sy, if: 'hall.' + w + '.lit', o: { lit: true }, light: 40, scene: 'hall.door_' + w },
      { p: 'sb_irori', x: x0 + 2, y: hy, scene: 'hall.hearth_' + w },
      { p: 'hall_andon', x: x0, y: ay, if: '!hall.' + w, scene: 'hall.lantern_' + w },
      { p: 'hall_andon', x: x0, y: ay, if: 'hall.' + w, light: 36, o: { lit: true }, scene: 'hall.lantern_' + w },
      { p: 'pillar', x: x0 - 1, y: north ? 6 : 15 }, { p: 'pillar', x: x0 + 6, y: north ? 6 : 15 },
    ];
  };
  C.maps['hall.foyer'] = Object.assign({}, HALL, {
    name: T('The Hall of a Hundred Tales', '{百物語|ひゃくものがたり} の {館|やかた}'),
    ambient: { dark: 0.42, playerLight: 50, weather: 'motes', tint: 'rgba(80,60,40,0.08)' },
    terrain: K.build(50, 22, '#', (k) => {
      k.rect(5, 7, 40, 8, '_');                                  // the long room
      for (const [, x0] of NORTH) k.rect(x0, 2, 6, 5, 'm');      // the north alcoves
      for (const [, x0] of SOUTH) k.rect(x0, 15, 6, 5, 'm');     // the south alcoves
      k.rect(0, 9, 5, 4, '_');                                   // the way in from the west door
      k.rect(45, 8, 4, 6, 'k');                                  // the east dais
    }),
    props: [].concat(
      ...NORTH.map(([w, x0]) => alcove(w, x0, true)), ...SOUTH.map(([w, x0]) => alcove(w, x0, false)),
      [
        { p: 'noticeboard', x: 47, y: 8, scene: 'hall.rules' },
        { p: 'desk', x: 47, y: 11, scene: 'hall.lectern' },
        { p: 'lantern', x: 45, y: 13, light: 34, o: { lit: true } }, { p: 'lantern', x: 45, y: 8, light: 34, o: { lit: true } },
        { p: 'mat', x: 1, y: 10 },
      ]),
    npcs: [],
    exits: [{ x: 0, y: 10, w: 1, h: 2, to: 'kr.hall', sp: 'from_foyer', dir: 'left' }],
    onEnter: [{ scene: 'hall.foyer_first', if: '!hall_foyer_seen' }],
    spawn: { default: [1, 10, 'right'], from_door: [1, 10, 'right'], w1: [8, 7, 'up'], w2: [16, 7, 'up'], w3: [24, 7, 'up'], w4: [32, 7, 'up'], w5: [40, 7, 'up'], w6: [8, 14, 'down'], w7: [16, 14, 'down'], w10: [24, 14, 'down'], w8: [32, 14, 'down'], w9: [40, 14, 'down'] },
  });
  // where each wing's hearth puts you back (the wing's exit: its alcove, beside the hearth)
  const HEARTH = {};
  for (const [w, x0] of NORTH) HEARTH[w] = { map: 'hall.foyer', x: x0 + 1, y: 6, dir: 'up' };
  for (const [w, x0] of SOUTH) HEARTH[w] = { map: 'hall.foyer', x: x0 + 1, y: 15, dir: 'down' };
  C.hallHearths = HEARTH;

  // ==== wing 1, floor 1: The Crossroads at Dusk ==========================================================================
  const AMB1 = { dark: 0.4, playerLight: 62, weather: 'motes', tint: 'rgba(40,60,90,0.12)' };
  C.maps['hall.w1f1'] = Object.assign({}, W1, {
    name: T('The Crossroads at Dusk', '{夕暮|ゆうぐ}れ の {辻|つじ}'),
    ambient: AMB1,
    terrain: K.build(36, 26, 'x', (k) => {
      k.rect(12, 18, 13, 7, '.');                 // the clearing where you come in
      k.rect(11, 8, 15, 10, '.');                 // the crossroads and its grass
      k.rect(17, 8, 2, 17, ':');                  // the road north and south
      k.rect(4, 12, 21, 2, ':');                  // the road west and east
      k.rect(25, 12, 4, 2, ':');
      k.rect(1, 9, 6, 8, '_');                    // west: the roadside shelter (the story room)
      k.rect(29, 6, 6, 14, '+');                  // east: the row of plaques
      k.rect(17, 1, 2, 7, ':');                   // north: the way on
      k.scatter('T', 9, 1501, [11, 8, 15, 10], '.'); k.scatter(',', 8, 1502, [12, 18, 13, 7], '.');
      k.rect(16, 11, 4, 4, ':');                  // (the crossing itself kept clear)
    }),
    props: [
      // the clearing: the return lantern, a bench
      lit(14, 21, null, 'hall.return'), { p: 'bench', x: 21, y: 21, scene: 'hall.w1.bench1' },
      // the crossroads: the signpost, lamps at its corners
      { p: 'hall_signpost', x: 19, y: 11, scene: 'hall.w1.t2_sign' },
      lit(15, 10), lit(21, 10), lit(15, 15), lit(21, 15),
      ...andon(13, 9, 'w1', 't2'),
      // the shelter: the picture scroll on its stand (the story room)
      { p: 'kr_scroll', x: 3, y: 10, scene: 'hall.w1.t1' }, ...andon(5, 10, 'w1', 't1'),
      { p: 'lantern', x: 1, y: 9, light: 30, o: { lit: true } }, { p: 'bench', x: 2, y: 15 },
      // the plaques: four stones, and the judge's lantern at the end
      { p: 'mb_plaque', x: 34, y: 8, scene: 'hall.w1.plaque1' }, { p: 'mb_plaque', x: 34, y: 11, scene: 'hall.w1.plaque2' },
      { p: 'mb_plaque', x: 34, y: 14, scene: 'hall.w1.plaque3' }, { p: 'mb_plaque', x: 34, y: 17, scene: 'hall.w1.plaque4' },
      { p: 'stone_marker', x: 30, y: 7, scene: 'hall.w1.t3' }, ...andon(29, 6, 'w1', 't3'),
      lit(29, 19),
      // the way on: the sacred rope until the floor is cleared
      { p: 'hall_gate', x: 17, y: 6, if: '!hall.w1.f0.clear', scene: 'hall.gate' },
      { p: 'stairs', x: 17, y: 1 },
    ],
    npcs: [
      { id: 'hall_traveller', x: 20, y: 13, dir: 'left', if: '!hall.w1.t2', talk: [{ scene: 'hall.w1.t2' }] },
    ],
    foes: [],
    exits: [{ x: 18, y: 1, w: 1, h: 1, to: 'hall.w1f2', sp: 'from_below', dir: 'up', if: 'hall.w1.f0.clear' }],
    onEnter: [{ scene: 'hall.w1.f1_first', if: '!hall_w1_f1_seen' }],
    spawn: { default: [18, 23, 'up'], entry: [18, 23, 'up'] },
  });

  // ==== wing 1, floor 2: The Lantern Road ================================================================================
  // Roads in a grid: three running east-west (y 6, 13, 20) and the middle one north-south (x 20), with side roads at x
  // 8 and 32; a lantern stands at each east and west end of the three crossings (the route card's targets).
  const ENDS = { w6: [3, 6], w13: [3, 13], w20: [3, 20], e6: [37, 6], e13: [37, 13], e20: [37, 20] };
  C.hallW1Ends = ENDS;
  C.maps['hall.w1f2'] = Object.assign({}, W1, {
    name: T('The Lantern Road', '{灯籠|とうろう} の {道|みち}'),
    ambient: Object.assign({}, AMB1, { dark: 0.46 }),
    terrain: K.build(40, 28, 'x', (k) => {
      for (const y of [6, 13, 20]) k.rect(3, y, 35, 2, ':');    // the crossings, east to west
      k.rect(20, 1, 2, 27, ':');                                 // the middle road, south to north
      for (const x of [8, 32]) k.rect(x, 6, 2, 16, ':');         // the side roads
      k.rect(16, 22, 10, 6, '.');                                // the clearing where you come in
      k.rect(23, 22, 8, 5, '.');                                 // the teahouse corner
      k.rect(10, 2, 8, 4, '.');                                  // the riddle stone's grass
      k.rect(33, 22, 5, 5, '.');                                 // the resting place
      k.rect(4, 22, 6, 4, '.');                                  // the spring's hollow (south-west)
      k.rect(33, 1, 5, 5, '.');                                  // the spring's hollow (north-east)
      k.scatter('T', 10, 1511, [10, 8, 20, 4], ':'); k.scatter('T', 8, 1512, [10, 15, 20, 4], ':');
    }),
    props: [
      lit(18, 24, null, 'hall.return'), { p: 'bench', x: 24, y: 23, scene: 'hall.w1.bench2' },
      { p: 'well', x: 28, y: 25, scene: 'hall.w1.spring' },
      // the route card at the start (t4), and the lanterns at the crossings' ends
      { p: 'sign', x: 22, y: 23, scene: 'hall.w1.t4_card' }, ...andon(16, 22, 'w1', 't4'),
      ...Object.keys(ENDS).map((k) => ({ p: 'kr_toro', x: ENDS[k][0], y: ENDS[k][1], scene: 'hall.w1.l4_' + k, if: '!xp_hall_w1_f1_lamp_' + k })),
      ...Object.keys(ENDS).map((k) => ({ p: 'kr_toro', x: ENDS[k][0], y: ENDS[k][1], scene: 'hall.w1.l4_' + k, if: 'xp_hall_w1_f1_lamp_' + k, light: 34, o: { lit: true } })),
      // the companion's map on the stone table (t6), and the spring's two hollows
      { p: 'table', x: 26, y: 22, scene: 'hall.w1.t6' }, ...andon(30, 22, 'w1', 't6'),
      { p: 'rock', x: 6, y: 23, scene: 'hall.w1.t6_sw' }, { p: 'rock', x: 35, y: 3, scene: 'hall.w1.t6_ne' },
      // the riddle stone (t7)
      { p: 'kr_stele', x: 13, y: 3, scene: 'hall.w1.t7' }, ...andon(11, 2, 'w1', 't7'),
      ...andon(24, 9, 'w1', 't5'),
      // the resting place (a delver may be waiting)
      { p: 'teaset', x: 35, y: 24 }, { p: 'bench', x: 34, y: 25 },
      { p: 'hall_gate', x: 20, y: 3, if: '!hall.w1.f1.clear', scene: 'hall.gate' },
      { p: 'stairs', x: 21, y: 1 },
    ],
    npcs: [],
    foes: [
      { id: 'b1', enemy: 'yn.chochin', encounter: 'hall.w1.lanterns', scene: 'hall.w1.t5', x: 26, y: 13, patrol: 2, bg: 'yn_upper', intro: { jp: '{霧|きり} の {中|なか} を 、 {提灯|ちょうちん} が {勝手|かって} に {漂|ただよ}って いる 。', en: 'Paper lanterns drift through the mist on their own.' } },
    ],
    exits: [{ x: 20, y: 1, w: 1, h: 1, to: 'hall.w1f3', sp: 'from_below', dir: 'up', if: 'hall.w1.f1.clear' }],
    onEnter: [{ scene: 'hall.w1.f2_first', if: '!hall_w1_f2_seen' }],
    spawn: { default: [20, 26, 'up'], entry: [20, 26, 'up'], from_below: [20, 26, 'up'] },
  });

  // ==== wing 1, floor 3: The Lamp's Crossroads ===========================================================================
  // The great lamp in the middle; four stone lamps round the crossing (north, east, south, west, as seen from the way
  // in at the south); Otami's note by the way in; Genza on the west road.
  const LAMP8 = { N: [15, 5], E: [23, 11], S: [15, 17], W: [7, 11] };
  C.hallW1Lamps = LAMP8;
  C.maps['hall.w1f3'] = Object.assign({}, W1, {
    name: T('The Lamp\'s Crossroads', '{灯|ひ} の {辻|つじ}'),
    ambient: Object.assign({}, AMB1, { dark: 0.52, playerLight: 58 }),
    terrain: K.build(32, 26, 'x', (k) => {
      k.rect(5, 3, 21, 17, '.');                 // the field round the crossing
      k.rect(14, 3, 3, 23, ':');                 // the road north and south
      k.rect(1, 10, 30, 3, ':');                 // the road west and east
      k.rect(10, 7, 11, 9, ':');                 // the crossing
      k.rect(12, 20, 7, 5, '.');                 // where you come in
      k.rect(1, 13, 5, 5, '.');                  // Genza's place on the west road
      k.scatter('T', 10, 1521, [5, 3, 21, 17], '.');
      k.rect(10, 7, 11, 9, ':'); k.rect(14, 3, 3, 23, ':'); k.rect(1, 10, 30, 3, ':');
    }),
    props: [
      lit(13, 22, null, 'hall.return'), { p: 'bench', x: 18, y: 22, scene: 'hall.w1.bench3' },
      { p: 'sign', x: 17, y: 21, scene: 'hall.w1.t8_note' },
      // the four lamps (t8)
      ...Object.keys(LAMP8).map((d) => ({ p: 'kr_toro', x: LAMP8[d][0], y: LAMP8[d][1], scene: 'hall.w1.l8_' + d, if: '!xp_hall_w1_f2_lit_' + d })),
      ...Object.keys(LAMP8).map((d) => ({ p: 'kr_toro', x: LAMP8[d][0], y: LAMP8[d][1], scene: 'hall.w1.l8_' + d, if: 'xp_hall_w1_f2_lit_' + d, light: 34, o: { lit: true } })),
      ...andon(12, 19, 'w1', 't8'), ...andon(4, 14, 'w1', 't9'),
      // the great lamp (t10)
      { p: 'sb_greatlamp', x: 15, y: 10, if: '!hall.w1.t10', scene: 'hall.w1.t10' },
      { p: 'sb_greatlamp', x: 15, y: 10, if: 'hall.w1.t10', light: 90, o: { lit: true }, scene: 'hall.w1.great_after' },
    ],
    npcs: [
      { id: 'hall_genza', x: 3, y: 15, dir: 'right', if: '!hall.w1.t9', talk: [{ scene: 'hall.w1.t9' }] },
      // after he walks with you: by the great lamp, waiting to see it lit
      { id: 'hall_genza_lamp', char: 'hall_genza', x: 18, y: 13, dir: 'left', if: 'hall.w1.t9', talk: [{ scene: 'hall.w1.genza_after' }] },
    ],
    foes: [],
    exits: [],
    onEnter: [{ scene: 'hall.w1.f3_first', if: '!hall_w1_f3_seen' }],
    spawn: { default: [15, 24, 'up'], entry: [15, 24, 'up'], from_below: [15, 24, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing('w1', {
    n: 1, title: T('The Lamp at the Crossroads', '{辻|つじ} の {灯籠|とうろう}'),
    theme: T('Finding the way: directions, signs, which turning, asking again.', '{道|みち} を {聞|き}く ・ {教|おし}える'),
    folklore: { en: 'Invented for this hall, in the manner of an old wayside tale.' },
    music: 'hall_w1', hearth: HEARTH.w1, patterns: 2,
    grow: { en: 'giving directions with ～と (曲がると、橋が見えます) and asking politely again (もう一度、お願いします).' },
    floors: [
      { id: 'f1', map: 'hall.w1f1', entry: { x: 18, y: 23, dir: 'up' }, name: T('The Crossroads at Dusk', '{夕暮|ゆうぐ}れ の {辻|つじ}'),
        stations: { w1_b1: { kind: 'bench', map: 'hall.w1f1', x: 21, y: 21 } } },
      { id: 'f2', map: 'hall.w1f2', entry: { x: 20, y: 26, dir: 'up' }, name: T('The Lantern Road', '{灯籠|とうろう} の {道|みち}'),
        stations: { w1_b2: { kind: 'bench', map: 'hall.w1f2', x: 24, y: 23 }, w1_sp: { kind: 'spring', map: 'hall.w1f2', x: 28, y: 25 } } },
      { id: 'f3', map: 'hall.w1f3', entry: { x: 15, y: 24, dir: 'up' }, name: T('The Lamp\'s Crossroads', '{灯|ひ} の {辻|つじ}'),
        stations: { w1_b3: { kind: 'bench', map: 'hall.w1f3', x: 18, y: 22 } }, procedures: ['hall_w1_great'] },
    ],
    delvers: { f2: { map: 'hall.w1f2', x: 36, y: 24, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'sign', title: T('The signpost', '{道|みち}しるべ') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The odd plaque out', '{一|ひと}つ だけ {違|ちが}う {石|いし}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The route card', '{道順|みちじゅん} の {札|ふだ}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('Lanterns in the mist', '{霧|きり} の {提灯|ちょうちん}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('The map in your companion\'s hands', '{地図|ちず} を {持|も}つ {人|ひと}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('Four lamps in order', '{四|よっ}つ の {灯|ひ} の {順番|じゅんばん}') },
      { id: 't9', floor: 2, kind: 'social', title: T('The pilgrim who knows the way', '{道|みち} を {知|し}って いる {巡礼|じゅんれい}') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The lamp relit', '{灯|ひ} を {戻|もど}す') },
    ],
  });
})(RB.content, RB.mapkit);
