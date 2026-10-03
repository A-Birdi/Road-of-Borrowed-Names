/* Chapter 2 — Saltglass. The coast road, the chapter's battle and boss
 * themes and its story cues, scored for the Japanese instruments in
 * 10_synth.js (shakuhachi, koto, shamisen, biwa, shinobue, shō, rin and the
 * wadaiko kit). The harbour and Drowned Archive themes themselves are
 * re-orchestrated in place in 30_songs.js. Notation: see 30_songs.js.
 *
 * Intensity, one step up from Chapter 1: a few more beats per minute, a
 * denser accompaniment (shamisen eighths instead of plucked quarter-ish
 * figures), the wadaiko in place of the soft low drum — still a small
 * ensemble, and the battle keeps the game's patient 3+3+2 pulse. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const M = _.mat;
  function S(id, def) {
    def.id = id;
    def.chapter = 2;
    _.songDefs[id] = def;
  }
  // koto "wave": up an octave and back like a breaker running up the sand
  const KOTO_WAVE = "0 2 0' 1' 2' 1' 0' 2";

  // ============================================================ COAST ROAD
  const SGR_A = '5, - 3 - - 2 1 - | 2 - - - 6, - 1 - | 2 - 3 - 5 - 6 - | 5 - - - - - . . | 6 - 5 - 3 - 2 - | 3 - 5 - 2 - 1 - | 6, - 1 - 2 - 3 - | 2 - - - - - . .';
  const SGR_A_CH = '1 2 4 5s4 6 4 2 5s4';
  const SGR_A_CTR = "1' - - - - - - - | 2' - - - 1' - - - | 6 - - - - - - - | 5 - - - - - - - | 1' - - - - - - - | 6 - - - - - - - | 5 - - - 4 - - - | 5 - - - - - - -";
  const SGR_C = "6 - - - - - 5 - | 3 - - - 2 - - - | 1 - - - 2 - 3 - | 5 - - - - - . . | 6 - - - 1' - 6 - | 5 - - - 3 - - - | 2 - - - 3 - 2 - | 2 - - - - - . .";
  const SGR_C_CH = '6 3 4 1 6 4 5s4 5';

  S('sg_road', {
    title: 'The Coast Road',
    kind: 'area',
    motifs: ['road'],
    notes: 'Chapter 2 route (B-flat, 88): the cliff road above the sea. The road motif opens a new pentatonic tune on shakuhachi over a koto "wave" that runs up an octave and back; A2 gives the tune to the koto with a second shakuhachi holding long notes; B moves to F and the shamisen plays the head of the Saltglass harbour tune — the town is in sight; C turns to G minor with a rin bowl like a buoy bell. Hand pats, shime-daiko and kotsuzumi keep a walking pace.',
    key: 'Bb', bpm: 88, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.72, rv: 0.32 },
      ctr: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.42, pan: 0.25 },
      koto: { i: 'koto', o: 4, v: 0.58, rv: 0.3, pan: -0.15 },
      sham: { i: 'shamisen', o: 4, v: 0.55, rv: 0.2, pan: 0.15 },
      wave: { i: 'koto', o: 3, pat: true, v: 0.3, rv: 0.35, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.3, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.45 },
      buoy: { perc: true, v: 0.4, rv: 0.6, pan: 0.35 },
    },
    all: { wave: KOTO_WAVE, pad: M.TRI, bass: '0 - - - 2 - - -', perc: 'p...e..p|..p.e...' },
    sections: {
      intro: { bars: 4, ch: '1 2 1 5s4', lead: '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - . .', perc: null, bass: null },
      A: { bars: 8, ch: SGR_A_CH, lead: SGR_A },
      A2: { bars: 8, ch: SGR_A_CH, koto: SGR_A, ctr: SGR_A_CTR, perc: 'p...m...|p...m.p.' },
      B: { bars: 8, key: 'F', ch: M.SALT_A_CH, sham: M.SALT_A, wave: '0 . 2 . 0 . 2 .', bass: '0 - 2, - 0 - 2, -', perc: 'y...e..p|..p.e...' },
      C: { bars: 8, ch: SGR_C_CH, lead: SGR_C, wave: "0 2 4 2 1' 2 4 2", perc: null, buoy: 'i.......|........|........|........', dyn: 0.85 },
      A3: { bars: 8, ch: SGR_A_CH, lead: SGR_A, ctr: SGR_A_CTR, perc: 'p...e..p|..p.e.p.' },
    },
    form: ['intro', 'A', 'A2', 'B', 'C', 'A3'],
  });

  // ================================================================ BATTLE
  const BSG_A_LEAD = '5, - 3 - - 2 1 - | 2 - - - - - . . | .:8 | .:8 | 5, - 3 - - 2 1 - | 7, - - - - - . . | .:8 | .:8';
  const BSG_A_KOTO = '.:8 | .:8 | 3 - 2 - 1 - 7, - | 1 - - - 4 - 5 - | .:8 | .:8 | 3 - 2 - 7, - 5, - | 5, - - - - - . .';
  const BSG_A_CH = '1 1 7 4 1 1 7 5';
  const BSG_B = '3 - - 4 5 - 3 - | 2 - - - 1 - - - | 3 - - 4 5 - 7 - | 5 - - - - - . . | 7 - 5 - 4 - 3 - | 4 - 3 - 1 - - - | 2 - - 3 4 - 5 - | 5 - - - - - . .';
  const BSG_B_CH = '3 7 1 5 7 4 1 5M';
  const BSG_B_LOW = '5 - - - - - - - | 4 - - - - - - - | 3 - - - - - - - | 2 - - - - - - - | 2 - - - - - - - | 1 - - - - - - - | 1 - - - - - - - | #7, - - - - - - -';
  const BSG_C_LOW = '1 - - - - - - - | 2 - - - - - - - | 4 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - | 6 - - - 5 - - - | 4 - - - 5 - - - | 2 - - - - - - -';
  const BSG_C_HI = '.:8 | .:8 | .:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - . . | 2 - 1 - #7, - 5, - | 5, - - - - - . .';
  const BSG_C_CH = '1 1 b6 b6 4 4 5M 5M';

  S('battle_saltglass', {
    title: 'Inkweaving — Salt Wind',
    kind: 'battle',
    motifs: ['road'],
    notes: 'Chapter 2 battle (D dorian, 104 — Chapter 1 is 100). The game’s patient 3+3+2 pulse, now on shime-daiko with an ōdaiko on the downbeat, under a shamisen ostinato in eighths that rings out on the octave. A: the road motif on shakuhachi, answered by koto; B: a min’yō-coloured shakuhachi line; C: a rising bowed line and koto sixteenths over B-flat and A major, the road motif on shinobue; B2 gives the line to the shamisen over a falling bowed bass.',
    key: 'D', mode: 'dorian', bpm: 104, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.68, rv: 0.25 },
      koto: { i: 'koto', o: 5, v: 0.55, rv: 0.25, pan: 0.2 },
      hi: { i: 'shinobue', o: 5, v: 0.48, rv: 0.25, pan: 0.15 },
      low: { i: 'bowed', o: 3, v: 0.6, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.4, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.26, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.35, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.68 },
      taiko: { perc: true, v: 0.55 },
      shime: { perc: true, v: 0.42, pan: 0.2 },
    },
    all: { ost: "0 0' 2 0 0' 2 4 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4', taiko: 'z.......|z.....z.', shime: 'e..e..e.|e..e.ee.' },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, shime: 'e..e..e.|e..e.eee' },
      A: { bars: 8, ch: BSG_A_CH, lead: BSG_A_LEAD, koto: BSG_A_KOTO },
      B: { bars: 8, ch: BSG_B_CH, lead: BSG_B, arp: "0 2 1' 2" },
      C: { bars: 8, ch: BSG_C_CH, low: BSG_C_LOW, hi: BSG_C_HI, arp: { n: "0 2 1' 2", u: 0.25 }, taiko: 'z.......|z...z.z.', shime: 'e..e..e.|e.ee.ee.' },
      B2: { bars: 8, ch: BSG_B_CH, lead: BSG_B, low: BSG_B_LOW },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'shamisen' }, o: { lead: -1 } }],
  });

  // ================================================================== BOSS
  const BOS2_RIFF = '1 1 2 1 5, 1 2 1 | 1 1 2 1 4 2 1 5,';
  const BOS2_A_CH = '1 2 1 2 6 4 2 2';
  const BOS2_HUSH = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const BOS2_A_KOTO = '.:8 | .:8 | .:8 | .:8 | 3 - - - 1 - - - | 4 - - - 3 - - - | 2 - - - - - - - | .:8';
  const BOS2_B = '5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - - -';
  const BOS2_B_CH = '1 2 1 7 6 4 1 2';
  const BOS2_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BOS2_C_TOLL = '.:8 | .:8 | 2 - - - - - - - | .:8 | .:8 | .:8 | 5, - - - - - - - | .:8';

  S('boss_saltglass', {
    title: 'Low Tide Reckoning',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'Chapter 2 boss (E phrygian — the in-scale’s dark half-step — 140). A low biwa riff in eighths with its sawari buzz, a shamisen chord ostinato, ōdaiko on 3+3+2, shime-daiko sixteenths and an ōtsuzumi "kan" on the backbeat like a stamp coming down. The Hush motif climbs on glass in even notes over a held shō; the road motif falls against it on shakuhachi (and on shinobue in B2, both at once). C drops to half time: the stamps go even, the bell tolls, before the riff returns on shamisen.',
    key: 'E', mode: 'phrygian', bpm: 140, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.75, rv: 0.22 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 5, v: 0.55, rv: 0.3, pan: -0.2 },
      toll: { i: 'toll', o: 3, v: 0.6, rv: 0.45 },
      riff: { i: 'biwa', o: 3, v: 0.55, rv: 0.12, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.34, rv: 0.1, pan: 0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: -2, v: 0.55, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      taiko: { perc: true, v: 0.6 },
      shime: { perc: true, v: 0.32, pan: 0.15, u: 0.25 },
      kan: { perc: true, v: 0.45, pan: -0.1 },
      crash: { perc: true, v: 0.4, rv: 0.3, pan: 0.3 },
    },
    all: {
      riff: BOS2_RIFF, ost: "0 . 2 . 1' . 2 .", bass: "0 0 0' 0 0 0 0' 0", sho: M.TRI,
      taiko: 'Z..z..Z.|Z..z..Zz', shime: 'e.e.E.e.e.e.E.e.', kan: '....q...|....q..q',
      crash: 'v.......|........|........|........|........|........|........|........',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', sho: null, ost: null, kan: null, shime: null, crash: null, taiko: 'Z..z..Z.|Z.z.ZzZZ' },
      A: { bars: 8, ch: BOS2_A_CH, glass: BOS2_HUSH, koto: BOS2_A_KOTO },
      B: { bars: 8, ch: BOS2_B_CH, lead: BOS2_B },
      C: { bars: 8, ch: '6 6 2 2 6 6 5P 5P', glass: BOS2_C_GLASS, toll: BOS2_C_TOLL, riff: null, taiko: 'Z.......|Z...z...', shime: 'e...e...e...e...', kan: 'q.q.q.q.', ost: "0 2 1' 2", dyn: 0.9 },
      B2: { bars: 8, ch: BOS2_B_CH, lead: BOS2_B, glass: BOS2_HUSH, taiko: 'Z..z..Z.|Z..z.zZZ' },
      A2: { bars: 8, ch: BOS2_A_CH, glass: BOS2_HUSH, koto: BOS2_A_KOTO },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'shinobue' } }, { s: 'A2', i: { riff: 'shamisen' }, o: { riff: 1 } }],
  });

  // ============================================================ STORY CUES
  // Wataru's confession and the harbourmaster's judgement.
  const SGC_A = '5 - - - 4 - 3 - | 2 - - - - - . . | 3 - - - 2 - 1 - | 7, - - - - - . . | 1 - - - 3 - 4 - | 5 - - - 4 - 3 - | 2 - - - 1 - 7, - | 1 - - - - - . .';
  const SGC_A_CH = '1 7 6 5 6 3 4 1';
  const SGC_B = "3 - - - 5 - 6 - | 5 - - - 4 - - - | 4 - - - 3 - 2 - | 3 - - - - - . . | 3 - - - 5 - 1' - | 7 - - - 6 - 5 - | 4 - - - 2 - 5 - | 1 - - - - - . .";
  const SGC_B_CH = '3 7 6 3 3 7 4 1';

  S('sg_confession', {
    title: 'The Unopened Notice',
    kind: 'scene',
    motifs: [],
    notes: 'Cue (D minor, 63) for a confession at the warehouse and the judgement in the harbour office. A lone shakuhachi line in the low register over sparse koto and a held bowed note — something said with difficulty; B warms toward F major on koto with the bowed voice beneath, strict and kind at once; the shakuhachi returns with the koto answering.',
    key: 'D', mode: 'aeolian', bpm: 63,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.72, rv: 0.4 },
      koto: { i: 'koto', o: 4, v: 0.55, rv: 0.4, pan: 0.15 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.3, rv: 0.4, pan: -0.25 },
      low: { i: 'bowed', o: 3, pat: true, bass: true, v: 0.42, rv: 0.4, pan: -0.1 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.38, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      bowl: { perc: true, v: 0.35, rv: 0.6, pan: 0.3 },
    },
    all: { arp: "0 . 2 . 1' . . .", low: '0 - - - - - - -', pad: M.TRI, bass: '0 - - - - - - -', bowl: 'i.......|........|........|........|........|........|........|........' },
    sections: {
      A: { bars: 8, ch: SGC_A_CH, lead: SGC_A, low: null },
      B: { bars: 8, ch: SGC_B_CH, koto: SGC_B },
      A2: { bars: 8, ch: SGC_A_CH, lead: SGC_A, koto: '.:8 | . . . . 3 - 2 - | .:8 | . . . . 3 - 2 - | .:8 | . . . . 5 - 6 - | .:8 | .:8' },
    },
    form: ['A', 'B', 'A2'],
  });

  // Before the boss: the stamp coming down behind the counter.
  S('sg_counter', {
    title: 'The Returns Counter',
    kind: 'scene',
    motifs: ['hush'],
    notes: 'Cue (E phrygian, 60) before the chapter’s boss. Three hollow kotsuzumi strokes and a rest in every bar — a stamp coming down, again and again — under a held shō cluster and a low biwa. The Hush motif climbs on glass in even notes; water drips in the stacks.',
    key: 'E', mode: 'phrygian', bpm: 60,
    tracks: {
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.5 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: -2, v: 0.6, rv: 0.45 },
      low: { i: 'biwa', o: 2, v: 0.5, rv: 0.4, pan: -0.15 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.42 },
      stamp: { perc: true, v: 0.6, rv: 0.25 },
      drip: { perc: true, v: 0.45, rv: 0.6, pan: 0.3 },
    },
    all: { sho: '0+2+4', bass: '0 - - - - - - -', stamp: 'm.m.m...', drip: 'd.......|........|....d...|........|........|..d.....' },
    sections: {
      A: { bars: 4, ch: '1P 1P 2P 1P', glass: '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8' },
      B: { bars: 4, ch: '1P 2P 1P 2P', low: '1 - - - - - - - | 2 - - - - - - - | 1 - - - - - - - | 2 - - - - - - -', stamp: 'm.m.m...|m.m.m..q' },
      A2: { bars: 4, ch: '1P 1P 2P 1P', glass: '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - - - - -', low: '1 - - - - - - - | .:8 | .:8 | .:8' },
    },
    form: ['A', 'B', 'A2'],
  });

  // After the boss: the letters lift off the shelves and stream home.
  S('sg_letters', {
    title: 'Letters on the Tide',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (F, 80) as the shelved letters rise and stream back to the harbour. Koto sixteenths climbing through each chord like paper lifting, rin strokes, the main theme on shakuhachi; B lifts the theme’s answering phrase onto shinobue over a shō, the koto still climbing.',
    key: 'F', bpm: 80,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.7, rv: 0.4 },
      hi: { i: 'shinobue', o: 5, v: 0.5, rv: 0.4, pan: 0.15 },
      rise: { i: 'koto', o: 3, pat: true, u: 0.25, v: 0.28, rv: 0.4, pan: -0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: -3, v: 0.5, rv: 0.45 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.3, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      bowl: { perc: true, v: 0.35, rv: 0.6, pan: 0.3 },
    },
    all: { rise: "0 1 2 0' 1' 2' 0'' -", pad: M.TRI, bass: '0 - - - - - - -', bowl: 'i.......|........' },
    sections: {
      A: { bars: 8, ch: M.ROAD_A_CH, lead: M.ROAD_A },
      B: { bars: 8, ch: M.ROAD_B_CH, hi: M.ROAD_B, sho: M.TRI, pad: null },
    },
    form: ['A', 'B'],
  });

  // The chapter's last night: the lighthouse beam, the companion's confidence.
  const SGH_A = '5, - 1 - 2 - | 3 - - - 2 1 | 2 - - - 6, - | 1 - - - - - | 5, - 1 - 2 - | 3 - - - 5 - | 6 - 5 - 3 2 | 2 - - - - -';
  const SGH_A_CH = '1 1 6 4 1 6 4 5';
  const SGH_B = '5, - 3 - 2 1 | 2 - - - - - | 5, - 3 - 2 1 | 6, - - - 5, - | 4 - 3 - 2 - | 1 - - - 6, - | 2 - - - 7, - | 1 - - - - -';
  const SGH_B_CH = '1 5 1 6 4 6 5 1';

  S('sg_lighthouse', {
    title: 'The Lighthouse Beam',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (B-flat, 3/4, 66) for the chapter’s last night on the pier. A koto figure turns over every bar like the beam going round; a rin bowl sounds every other bar. The shakuhachi tune opens with the Saltglass harbour tune’s rising fourth; B carries the road motif in the same slow 3/4, then the koto takes the tune while a second koto answers each phrase with a pressed (ato-oshi) note bending up into place.',
    key: 'Bb', bpm: 66, meter: 3,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.72, rv: 0.45 },
      koto: { i: 'koto', o: 4, v: 0.55, rv: 0.45, pan: 0.15 },
      press: { i: 'koto_oshi', o: 5, v: 0.4, rv: 0.5, pan: 0.3 },
      beam: { i: 'koto', o: 3, pat: true, v: 0.3, rv: 0.45, pan: -0.25 },
      low: { i: 'bowed', o: 3, pat: true, bass: true, v: 0.38, rv: 0.45, pan: -0.1 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.32, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.42 },
      bowl: { perc: true, v: 0.32, rv: 0.6, pan: 0.3 },
    },
    all: { beam: "0 2 0' 1' 0' 2", low: '0 - - - - -', pad: M.TRI, bass: '0 - - - - -', bowl: 'i.....|......' },
    sections: {
      A: { bars: 8, ch: SGH_A_CH, lead: SGH_A, low: null },
      B: { bars: 8, ch: SGH_B_CH, lead: SGH_B },
      A2: { bars: 8, ch: SGH_A_CH, koto: SGH_A, press: '.:6 | .:6 | .:6 | 1 - - - - - | .:6 | .:6 | .:6 | 2 - - - - -' },
    },
    form: ['A', 'B', 'A2', 'B'],
  });

  _.REQUIRED_SONGS.push('sg_road', 'battle_saltglass', 'boss_saltglass', 'sg_confession', 'sg_counter', 'sg_letters', 'sg_lighthouse');
})(RB.audio);
