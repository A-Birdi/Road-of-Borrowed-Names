/* The Hall of a Hundred Tales, wing 5, The Two Wells (an invented tale; the frog in the well is the real proverb
 * 井の中の蛙, and the well-cleaning, 井戸替え, a real custom of old Japanese towns): the floors and the wing (expansion
 * P15; plan 04_DUNGEONS.md D9). Its theme: reasons and contrasts (～から and ～ので; けど and が; ～のに; on the Grow
 * route ～おかげで and ～せいで, ～ために; at the top ～からこそ, ～にもかかわらず, ～ものの).
 *   1 · The East Side (hall.w5f1): the tale in four pictures at Osugi's house (t1), three things gone wrong in the
 *       village, each set right at its cause rather than where it shows (t2), the old sayings on reasons, one wrong
 *       (t3, a counterexample hall); a bench.
 *   2 · The West Well (hall.w5f2): four jars sorted into drinkable and not by reading why (t4), the frogs of the west
 *       well (t5, wet), the well-digger's record in your companion's hands and the one remedy it points to (t6, an
 *       information gap), the riddle stone (t7, a reprieve); a bench, a spring, a resting place.
 *   3 · The Well-Cleaning (hall.w5f3): the cleaning's three jobs given to the helpers whose reasons fit them (t8),
 *       Osugi and Mosuke, who each blame the other's well (t9, a mediation), and the well-cleaning itself (t10, the
 *       capstone).
 * Each floor's way on is closed by a sacred rope until every trial on it is done; the pattern (hall.w5.pat) chooses
 * the causes, the jars, the record's reason and the helpers' reasons. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, B) {
  'use strict';
  const K = C.hallKit, T = K.T, W = 'w5';
  const AMB = { dark: 0.12, playerLight: 50, weather: 'motes', tint: 'rgba(240,210,140,0.10)' };

  // ==== floor 1: The East Side ============================================================================================
  // Three things gone wrong, each with where it shows (the effect) and two things that could be its cause.
  const PROB = {
    bucket: { effect: [22, 8], causes: { pulley: [25, 8], beam: [20, 7] } },
    field: { effect: [8, 15], causes: { stone: [11, 16], sluice: [5, 15] } },
    dog: { effect: [27, 14], causes: { feed: [24, 15], gate: [30, 14] } },
  };
  C.hallW5 = { PROB };
  const PROPS1 = { bucket: 'well', field: 'flowerpot', dog: 'crate', pulley: 'fw_pulleypost', beam: 'pillar', stone: 'rock', sluice: 'stone_marker', feed: 'hay', gate: 'door' };
  C.maps['hall.w5f1'] = Object.assign({}, K.base(W), {
    name: T('The East Side', '{東|ひがし} の {村|むら}'),
    ambient: AMB,
    terrain: B.build(34, 24, 'x', (k) => {
      k.rect(13, 18, 9, 5, '.');                 // where you come in
      k.rect(4, 6, 27, 12, '.');                 // the village
      k.rect(16, 1, 2, 21, ':');                 // the road north to the west side, and south
      k.rect(4, 11, 27, 2, ':');                 // the street east and west
      k.rect(1, 8, 6, 5, '_');                   // west: Osugi's house (the story room)
      k.rect(4, 2, 11, 4, '.');                  // north-west: the old sayings
      k.scatter('T', 5, 1621, [7, 6, 6, 3], '.'); k.scatter(',', 12, 1622, [4, 13, 26, 4], '.');
      k.rect(16, 1, 2, 21, ':'); k.rect(4, 11, 27, 2, ':');
    }),
    props: [].concat(
      K.furniture(W, 0, { ret: [14, 20], bench: [20, 20], gate: [16, 4], stairs: [16, 1] }),
      [
        { p: 'kr_scroll', x: 2, y: 9, scene: 'hall.w5.t1' }, ...K.andon(5, 9, W, 't1'),
        { p: 'lantern', x: 1, y: 8, light: 28, o: { lit: true } },
        // the three troubles: where each shows, and its two possible causes
        ...Object.keys(PROB).flatMap((pr) => [{ p: PROPS1[pr], x: PROB[pr].effect[0], y: PROB[pr].effect[1], scene: 'hall.w5.e_' + pr }]
          .concat(Object.keys(PROB[pr].causes).map((c) => ({ p: PROPS1[c], x: PROB[pr].causes[c][0], y: PROB[pr].causes[c][1], scene: 'hall.w5.c_' + c })))),
        ...K.andon(29, 10, W, 't2'),
        // the old sayings, and the stone that asks
        { p: 'signblank', x: 5, y: 3, scene: 'hall.w5.card1' }, { p: 'signblank', x: 7, y: 3, scene: 'hall.w5.card2' },
        { p: 'signblank', x: 9, y: 3, scene: 'hall.w5.card3' }, { p: 'signblank', x: 11, y: 3, scene: 'hall.w5.card4' },
        { p: 'stone_marker', x: 13, y: 3, scene: 'hall.w5.t3' }, ...K.andon(14, 2, W, 't3'),
        K.lit(15, 10), K.lit(19, 10),
      ]),
    npcs: [
      { id: 'hall_osugi', x: 9, y: 13, dir: 'down', talk: [{ scene: 'hall.w5.why_field' }] },
      { id: 'hall_kota', x: 22, y: 10, dir: 'down', talk: [{ scene: 'hall.w5.why_bucket' }] },
      { id: 'hall_hatsu', x: 26, y: 16, dir: 'up', talk: [{ scene: 'hall.w5.why_dog' }] },
    ],
    foes: [],
    exits: [{ x: 16, y: 1, w: 1, h: 1, to: 'hall.w5f2', sp: 'from_below', dir: 'up', if: 'hall.w5.f0.clear' }],
    onEnter: [{ scene: 'hall.w5.f1_first', if: '!hall_w5_f1_seen' }],
    spawn: { default: [17, 21, 'up'], entry: [17, 21, 'up'] },
  });

  // ==== floor 2: The West Well =============================================================================================
  // The west well under its willow; the four jars by the old storehouse, the shelf for drinking water and the drain
  // stone; the well-digger's record on the table and the three remedies (the willow, the well's own bucket, a lid).
  const JARS = { j1: [8, 18], j2: [10, 18], j3: [12, 18], j4: [14, 18] };
  const REMEDY = { willow: [12, 9], draw: [17, 10], lid: [21, 10] };
  Object.assign(C.hallW5, { JARS, REMEDY });
  C.maps['hall.w5f2'] = Object.assign({}, K.base(W), {
    name: T('The West Well', '{西|にし} の {井戸|いど}'),
    ambient: Object.assign({}, AMB, { dark: 0.18 }),
    terrain: B.build(36, 26, 'x', (k) => {
      k.rect(15, 21, 8, 5, '.');                 // where you come in
      k.rect(17, 2, 2, 20, ':');                 // the road north
      k.rect(5, 8, 24, 13, '.');                 // the west side: the well, the willow, the storehouse yard
      k.rect(4, 2, 9, 5, '.');                   // north-west: the riddle stone
      k.rect(13, 5, 4, 2, ':');                  //   its path (below the rope)
      k.rect(28, 2, 6, 5, '.');                  // north-east: the resting place
      k.rect(19, 5, 9, 2, ':');                  //   its path (below the rope)
      k.rect(29, 8, 5, 6, '.');                  // east: the frogs' wet ground
      k.rect(7, 21, 7, 4, '.');                  // south-west: the spring
      k.rect(13, 22, 3, 2, '.');
      k.scatter('T', 5, 1631, [22, 13, 6, 4], '.');
      k.rect(17, 2, 2, 20, ':');
    }),
    props: [].concat(
      K.furniture(W, 1, { ret: [16, 23], bench: [21, 23], gate: [17, 4], stairs: [17, 2] }),
      [
        { p: 'well', x: 9, y: 22, scene: 'hall.w5.spring' },
        // the jars (gone once set where they belong), the drinking shelf and the drain stone
        ...Object.keys(JARS).map((j) => ({ p: 'pot', x: JARS[j][0], y: JARS[j][1], scene: 'hall.w5.' + j, if: '!xp_hall_w5_f1_put_' + j })),
        { p: 'table', x: 22, y: 18, scene: 'hall.w5.to_drink' }, { p: 'rock', x: 26, y: 18, scene: 'hall.w5.to_drain' },
        ...K.andon(6, 18, W, 't4'),
        // the west well, its willow and a lid; the well-digger's record
        { p: 'tree', x: REMEDY.willow[0], y: REMEDY.willow[1], scene: 'hall.w5.m_willow' },
        { p: 'well', x: REMEDY.draw[0], y: REMEDY.draw[1], scene: 'hall.w5.m_draw' },
        { p: 'chest', x: REMEDY.lid[0], y: REMEDY.lid[1], scene: 'hall.w5.m_lid' },
        { p: 'desk', x: 24, y: 12, scene: 'hall.w5.t6' }, ...K.andon(27, 12, W, 't6'),
        // the riddle stone (t7)
        { p: 'kr_stele', x: 6, y: 3, scene: 'hall.w5.t7' }, ...K.andon(8, 2, W, 't7'),
        ...K.andon(32, 9, W, 't5'),
        // the resting place (a delver may be waiting)
        { p: 'teaset', x: 30, y: 3 }, { p: 'bench', x: 29, y: 5 },
      ]),
    npcs: [],
    foes: [
      { id: 'b1', enemy: 'yn.toad', encounter: 'hall.w5.frogs', scene: 'hall.w5.t5', x: 31, y: 11, patrol: 1, bg: 'reedwake', intro: { jp: '{井戸|いど} の {周|まわ}り の {湿|しめ}った {地面|じめん} で 、 {大|おお}きな {蛙|かえる} が {喉|のど} を {膨|ふく}らませて いる 。', en: 'On the wet ground round the well, a big frog puffs out its throat.' }, settle: { jp: '{蛙|かえる} は 、 {井戸|いど} の {方|ほう} へ {跳|は}ねて {帰|かえ}って いった 。', en: 'The frog hops back toward the well.' } },
    ],
    exits: [{ x: 17, y: 2, w: 1, h: 1, to: 'hall.w5f3', sp: 'from_below', dir: 'up', if: 'hall.w5.f1.clear' }],
    onEnter: [{ scene: 'hall.w5.f2_first', if: '!hall_w5_f2_seen' }],
    spawn: { default: [18, 24, 'up'], entry: [18, 24, 'up'], from_below: [18, 24, 'up'] },
  });

  // ==== floor 3: The Well-Cleaning =========================================================================================
  // The square between the two sides on the day of the well-cleaning: the job board and its three tags, the helpers,
  // Osugi and Mosuke, the common well at the top, and Kero by it.
  const TAGS = { bucket: [12, 17], rope: [14, 17], tally: [20, 17] };
  const HELP = { kota: [8, 12], hatsu: [25, 12], mosuke: [12, 9] };
  Object.assign(C.hallW5, { TAGS, HELP });
  C.maps['hall.w5f3'] = Object.assign({}, K.base(W), {
    name: T('The Well-Cleaning', '{井戸替|いどが}え'),
    ambient: Object.assign({}, AMB, { dark: 0.1 }),
    terrain: B.build(32, 24, 'x', (k) => {
      k.rect(11, 18, 11, 6, '.');                // where you come in
      k.rect(4, 7, 24, 12, '.');                 // the square
      k.rect(15, 2, 3, 6, ':');                  // the way up to the common well
      k.rect(11, 2, 11, 4, '+');                 // the well's stone surround
      k.scatter(',', 10, 1641, [4, 7, 24, 3], '.');
      k.rect(15, 2, 3, 6, ':');
    }),
    props: [].concat(
      K.furniture(W, 2, { ret: [13, 22], bench: [20, 22] }),
      [
        { p: 'well', x: 16, y: 3, scene: 'hall.w5.t10' },
        { p: 'sign', x: 17, y: 17, scene: 'hall.w5.t8_board' }, ...K.andon(10, 18, W, 't8'),
        ...Object.keys(TAGS).map((g) => ({ p: 'signblank', x: TAGS[g][0], y: TAGS[g][1], scene: 'hall.w5.tag_' + g, if: '!xp_hall_w5_f2_gave_' + g })),
        ...K.andon(26, 8, W, 't9'),
        K.lit(13, 5), K.lit(20, 5),
      ]),
    npcs: [
      { id: 'hall_kota3', char: 'hall_kota', x: HELP.kota[0], y: HELP.kota[1], dir: 'right', talk: [{ scene: 'hall.w5.h_kota' }] },
      { id: 'hall_hatsu3', char: 'hall_hatsu', x: HELP.hatsu[0], y: HELP.hatsu[1], dir: 'left', talk: [{ scene: 'hall.w5.h_hatsu' }] },
      { id: 'hall_mosuke', x: HELP.mosuke[0], y: HELP.mosuke[1], dir: 'down', talk: [{ scene: 'hall.w5.h_mosuke' }] },
      { id: 'hall_osugi3', char: 'hall_osugi', x: 21, y: 9, dir: 'down', talk: [{ scene: 'hall.w5.t9' }] },
      { id: 'hall_kero', x: 19, y: 4, dir: 'down', talk: [{ scene: 'hall.w5.kero' }] },
    ],
    foes: [], exits: [],
    onEnter: [{ scene: 'hall.w5.f3_first', if: '!hall_w5_f3_seen' }],
    spawn: { default: [16, 22, 'up'], entry: [16, 22, 'up'], from_below: [16, 22, 'up'] },
  });

  // ==== the wing ==========================================================================================================
  if (RB.hall) RB.hall.wing(W, {
    n: 5, title: T('The Two Wells', '{二|ふた}つ の {井戸|いど}'),
    theme: T('Reasons and contrasts: because, so, but, even though, thanks to and because of.', '「 から 」 と 「 のに 」'),
    folklore: { en: 'An invented tale. Two things in it are real: the proverb {井|い}の{中|なか}の{蛙|かわず}{大海|たいかい}を{知|し}らず, "the frog in the well knows nothing of the great sea"; and the well-cleaning ({井戸|いど}{替|が}え), when a town emptied and scrubbed its wells together, in Edo on the seventh day of the seventh month.' },
    music: 'hall_w5', hearth: C.hallHearths.w5, patterns: 2,
    grow: { en: 'credit and blame, and contrast said formally: ～おかげで and ～せいで (and, at the top, ～からこそ, ～にもかかわらず, ～ものの).' },
    floors: [
      { id: 'f1', map: 'hall.w5f1', entry: { x: 17, y: 21, dir: 'up' }, name: T('The East Side', '{東|ひがし} の {村|むら}'),
        stations: { w5_b1: { kind: 'bench', map: 'hall.w5f1', x: 20, y: 20 } } },
      { id: 'f2', map: 'hall.w5f2', entry: { x: 18, y: 24, dir: 'up' }, name: T('The West Well', '{西|にし} の {井戸|いど}'),
        stations: { w5_b2: { kind: 'bench', map: 'hall.w5f2', x: 21, y: 23 }, w5_sp: { kind: 'spring', map: 'hall.w5f2', x: 9, y: 22 } } },
      { id: 'f3', map: 'hall.w5f3', entry: { x: 16, y: 22, dir: 'up' }, name: T('The Well-Cleaning', '{井戸替|いどが}え'),
        stations: { w5_b3: { kind: 'bench', map: 'hall.w5f3', x: 20, y: 22 } }, procedures: ['hall_w5_clean'] },
    ],
    delvers: { f2: { map: 'hall.w5f2', x: 31, y: 4, dir: 'left' } },
    trials: [
      { id: 't1', floor: 0, kind: 'story', title: T('The tale in four pictures', '{四|よっ}つ の {絵|え}') },
      { id: 't2', floor: 0, kind: 'mechanism', title: T('Mending things at their cause', '{原因|げんいん} を {直|なお}す') },
      { id: 't3', floor: 0, kind: 'counterexample', title: T('The old sayings', '{昔|むかし} の {言葉|ことば}') },
      { id: 't4', floor: 1, kind: 'mechanism', title: T('The four jars', '{四|よっ}つ の {瓶|かめ}') },
      { id: 't5', floor: 1, kind: 'encounter', title: T('The frogs of the west well', '{西|にし} の {井戸|いど} の {蛙|かえる}') },
      { id: 't6', floor: 1, kind: 'infogap', title: T('The well-digger\'s record', '{井戸掘|いどほ}り の {記録|きろく}') },
      { id: 't7', floor: 1, kind: 'riddle', reprieve: true, title: T('The riddle stone', 'なぞなぞ の {石|いし}') },
      { id: 't8', floor: 2, kind: 'mechanism', title: T('The cleaning\'s three jobs', '{三|みっ}つ の {仕事|しごと}') },
      { id: 't9', floor: 2, kind: 'social', title: T('Osugi and Mosuke', 'オスギ と モスケ') },
      { id: 't10', floor: 2, kind: 'capstone', title: T('The well-cleaning', '{井戸替|いどが}え') },
    ],
  });
})(RB.content, RB.mapkit);
