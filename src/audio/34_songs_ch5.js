/* Chapter 5 — Lanternfall. The lantern road down to the town, the records
 * and council chambers, the town after the bell, the battle and boss
 * themes, and the cues for the story of the flood and the drowned bell
 * ringing. The town and bell-tower themes are re-orchestrated in place in
 * 30_songs.js. Notation: see 30_songs.js.
 *
 * Intensity, one step up from Chapter 4: the battle is faster and busier,
 * with the Hush's colour (the raised fourth over open fifths) breaking into
 * it; the boss rings a bell under everything. After the bell, the town's
 * own tune comes back noisy, swung and arguing with itself. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const M = _.mat;
  function S(id, def) {
    def.id = id;
    def.chapter = 5;
    _.songDefs[id] = def;
  }

  // ========================================================= LANTERN ROAD
  const LFR_A = "5, - 3 - - 2 1 - | 2 - - - 4 - 5 - | 6 - - - 5 - 4 - | 5 - - - - - . . | 1' - 7 - 5 - 4 - | 5 - 3 - 2 - 1 - | 2 - 4 - 5 - 7 - | 5 - - - - - . .";
  const LFR_A_CH = '1 7 4 5 3 1 7 5';
  const LFR_C = '1 - - - 3 - 2 - | 1 - - - 7, - - - | 6, - - - 7, - 1 - | 2 - - - - - . . | 3 - - - 4 - 5 - | 3 - - - 2 - 1 - | 7, - 1 - 2 - 7, - | 1 - - - - - . .';
  const LFR_C_CH = '1 6 4 5 3 4 5 1';

  S('lf_road', {
    title: 'The Lantern Road Down',
    kind: 'area',
    motifs: ['road'],
    notes: 'Chapter 5 route (E dorian, 100): the lantern road down to the lake town. The road motif opens a shakuhachi tune over koto and a shime-daiko walk; B moves to C and the shamisen plays the Lanternfall tune in its square, even steps, a clock ticking under it — the orderly town ahead; C turns to E minor on koto with a bowed line and a rin, the lake and what it covered.',
    key: 'E', mode: 'dorian', bpm: 100, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.66, rv: 0.32 },
      sham: { i: 'shamisen', o: 4, v: 0.48, rv: 0.2, pan: 0.15 },
      koto: { i: 'koto', o: 4, v: 0.55, rv: 0.35, pan: -0.1 },
      low: { i: 'bowed', o: 3, pat: true, bass: true, v: 0.38, rv: 0.4, pan: -0.15 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.28, rv: 0.3, pan: -0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.3, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.42 },
      tick: { perc: true, v: 0.3, pan: 0.3 },
    },
    all: { arp: "0 2 1' 2 0 2 1' 2", pad: M.TRI, bass: '0 - - 0 2 - - -', perc: 'p...e..p|..p.e...' },
    sections: {
      intro: { bars: 2, ch: '1 7', lead: '5 - - - - - - - | 4 - - - - - . .', perc: null, bass: null },
      A: { bars: 8, ch: LFR_A_CH, lead: LFR_A },
      B: { bars: 8, key: 'C', mode: 'ionian', ch: M.LF_A_CH, sham: M.LF_A, arp: '0 2 1 2 0 2 1 2', tick: 'x.x.x.x.', perc: 'w.......|w.......' },
      C: { bars: 8, mode: 'aeolian', ch: LFR_C_CH, koto: LFR_C, low: '0 - - - - - - -', perc: 'i.......|........|........|........', dyn: 0.85 },
      A2: { bars: 8, ch: LFR_A_CH, lead: LFR_A, sham: LFR_A, perc: 'p...e..p|..p.e.p.' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A2', o: { sham: 0 } }],
  });

  // ================================================= RECORDS AND COUNCIL
  const LFC_A = '1 . 2 . 3 . 5 . | 4 - 3 - . . . . | 2 . 3 . 4 . 6 . | 5 - - - . . . . | 1 . 2 . 3 . 5 . | 6 - 5 - 4 - 3 - | 2 - 3 - 7, - . . | 1 - - - . . . .';
  const LFC_A_CH = '1 4 7 5 1 6 5 1';
  const LFC_B_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - 3 - - - | 2 - - - - - - - | .:8';
  const LFC_B_KOTO = '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - . . . . | .:8 | .:8 | .:8 | .:8';
  const LFC_B_CH = '1P 1P 2P 2P 1P 1P 2P 1P';

  S('lf_records', {
    title: 'Public Records',
    kind: 'area',
    motifs: ['road', 'hush'],
    notes: 'Chapter 5 records hall, council chamber, basement stacks and the sluice shore before the bell (A minor, 92): staccato koto questions over a shamisen walking figure, a clock and a hyōshigi keeping office hours. B is what the records were made to forget: A lydian over open fifths and a held shō, the Hush motif on glass in even notes, the road motif slipping through on koto. The questions return on shamisen.',
    key: 'A', mode: 'aeolian', bpm: 92,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.58, rv: 0.25, pan: 0.1 },
      frag: { i: 'koto', o: 4, v: 0.45, rv: 0.45, dl: 0.3, pan: 0.3 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.5, pan: -0.15 },
      walk: { i: 'shamisen', o: 3, pat: true, bass: true, v: 0.38, rv: 0.1, pan: -0.2 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.34, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.52 },
      tick: { perc: true, v: 0.35, pan: -0.25 },
    },
    echo: { beats: 0.75, fb: 0.3, mix: 0.25 },
    all: { walk: "0 . 2 . 1' . 2 .", pad: '0+1+3', bass: '0 - - - - - - -', tick: 'y...x.x.|....x...' },
    sections: {
      A: { bars: 8, ch: LFC_A_CH, koto: LFC_A },
      B: { bars: 8, mode: 'lydian', ch: LFC_B_CH, glass: LFC_B_GLASS, frag: LFC_B_KOTO, walk: null, pad: '0+1', tick: 'g...g...', dyn: 0.9 },
    },
    form: ['A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, { s: 'A', i: { koto: 'shamisen' } }, { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }],
  });

  // ==================================================== THE TOWN, AFTER
  const LFT_ANS = ".:8 | . . . . 1' - 7 - | .:8 | . . . . 5 - 6 - | .:8 | . . . . 3' - 2' - | .:8 | . . . . 1' - . .";
  const LFT_CANON = ". . . . 5 - 3 - | 4 - 2 - 3 - 1 - | 2 - 7, - 1 - 3 - | 5 - 1' - 7 - - - | 5 - - - 6 - 4 - | 5 - 3 - 4 - 2 - | 3 - 1 - 2 - 5 - | 4 - 2 - 1 - - -";

  S('lf_town_after', {
    title: 'Lanternfall, Talking Back',
    kind: 'area',
    motifs: ['road'],
    notes: 'Lanternfall after the bell (C, 104, swung): the same town tune, no longer square. The shamisen plays it with a lilt and the shinobue heckles between phrases; in B the koto and the shakuhachi play it as a canon two beats apart — two people saying the same thing differently, and both allowed to; C is the road motif, warm, on shakuhachi and shinobue. Woodblock, shime, hand pats, a hyōshigi, the atarigane.',
    key: 'C', bpm: 104, swing: 0.28,
    tracks: {
      sham: { i: 'shamisen', o: 4, v: 0.5, rv: 0.2, pan: -0.1 },
      fue: { i: 'shinobue', o: 5, v: 0.44, rv: 0.25, pan: 0.25 },
      koto: { i: 'koto', o: 5, v: 0.5, rv: 0.25, pan: 0.2 },
      shaku: { i: 'shakuhachi', o: 5, v: 0.62, rv: 0.3, pan: -0.2 },
      gtr: { i: 'shamisen', o: 4, pat: true, fold: 'all', win: -3, v: 0.28, rv: 0.12, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.26, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.42 },
      kane: { perc: true, v: 0.28, pan: 0.3 },
    },
    all: { gtr: '. . 0+1+2 . . . 0+1+2 .', bass: "0 - 2 - 1' - 2 -", pad: M.TRI, perc: 'w.e.p.ey|w.e.p.e.', kane: '........|......a.' },
    sections: {
      A: { bars: 8, ch: M.LF_A_CH, sham: M.LF_A, fue: LFT_ANS },
      B: { bars: 8, ch: M.LF_A_CH, koto: M.LF_A, shaku: LFT_CANON, perc: 'w.e.p.e.|w.eep.e.' },
      C: { bars: 8, ch: M.ROAD_A_CH, shaku: M.ROAD_A, fue: M.ROAD_A, kane: null, perc: 'p...e..p|..p.e...', dyn: 0.9 },
      A2: { bars: 8, ch: M.LF_A_CH, sham: M.LF_A, koto: LFT_ANS },
    },
    form: ['A', 'B', { s: 'C', o: { fue: 1 } }, 'A2'],
  });

  // ================================================================ BATTLE
  const BLF_A = '1 - 2 - 4 - 5 - | 4 - 2 - 1 - - - | 7, - 1 - 2 - 4 - | 2 - - - 1 - 7, - | 5, - 3 - - 2 1 - | 2 - 4 - 5 - 4 - | 2 - 1 - 7, - 5, - | 1 - - - - - . .';
  const BLF_A_CH = '1 4 7 5 1 7 4 1';
  const BLF_B = '3 - - - 2 - 1 - | 7, - - - 5, - - - | 6, - - - 7, - 1 - | 2 - - - - - . . | 3 - - - 4 - 5 - | 4 - - - 3 - 2 - | 1 - - - 2 - 7, - | 1 - - - - - . .';
  const BLF_B_CH = '3 7 4 5 3 7 4 1';
  const BLF_C_LOW = '1 - - - - - - - | 2 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | 5 - - - - - - - | 2 - - - - - - - | 5 - - - - - - - | 5 - - - - - - -';
  const BLF_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BLF_C_CH = '1P 1P 2P 2P 1P 2P 5P 5P';

  S('battle_lanternfall', {
    title: 'Inkweaving — Certainly Not',
    kind: 'battle',
    motifs: ['road', 'hush'],
    notes: 'Chapter 5 battle (G dorian, 116). The 3+3+2 pulse on ōdaiko, a shime-daiko in steady eighths, kotsuzumi and ōtsuzumi calling, hyōshigi on the turn of the bar; shamisen and koto ostinati. A: the shamisen leads, the road motif in the middle of its tune; B: a lyrical shakuhachi line over seventh chords that never quite settle; C is the Hush breaking in — G lydian over open fifths with the raised fourth held inside them, the Hush motif on glass in even notes against a climbing bowed line and koto sixteenths; B2 hands the line to the koto.',
    key: 'G', mode: 'dorian', bpm: 116, loopFrom: 1,
    tracks: {
      lead: { i: 'shamisen', o: 4, v: 0.5, rv: 0.2 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.25, pan: 0.1 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.4, pan: 0.2 },
      low: { i: 'bowed', o: 3, v: 0.55, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.36, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.26, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.56 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      noh: { perc: true, v: 0.42, pan: -0.25 },
      clap: { perc: true, v: 0.3, pan: 0.3 },
    },
    all: {
      ost: "0 0' 2 0' 1' 0' 2 0'", arp: "0 2 1' 2 0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z..Z.|Z..zZzZz', shime: 'eeEeeEee|eeEeeEee', noh: 'm..q..m.|q..m.q..', clap: '.......y|.......y',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ', noh: 'q.q.q...|q.q.q.q.' },
      A: { bars: 8, ch: BLF_A_CH, lead: BLF_A },
      B: { bars: 8, ch: BLF_B_CH, shaku: BLF_B, pad: '0+1+2+3', low: '3 - - - - - - - | 2 - - - - - - - | 4 - - - - - - - | 5 - - - - - - - | 3 - - - - - - - | 2 - - - - - - - | 4 - - - - - - - | 1 - - - - - - -' },
      C: { bars: 8, mode: 'lydian', ch: BLF_C_CH, low: BLF_C_LOW, glass: BLF_C_GLASS, arp: { n: "0 2 1' 2", u: 0.25 }, pad: '0+b2+2', taiko: 'Z..z..Z.|Z.zzZzZz' },
      B2: { bars: 8, ch: BLF_B_CH, shaku: BLF_B, pad: '0+1+2+3', arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { shaku: 'koto' }, o: { shaku: 1 } }],
  });

  // ================================================================== BOSS
  const BOS5_RIFF = '1 1 5, 1 2 1 5, 1 | 1 1 5, 1 4 3 2 1';
  const BOS5_A_CH = '1 2 1 2 6 7 2 2';
  const BOS5_HUSH = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const BOS5_A_NO = '.:8 | .:8 | .:8 | .:8 | 5 - 4 - 3 - 2 - | 1 - - - - - - - | 5 - 4 - 3 - 2 - | 2 - - - - - - -';
  const BOS5_B = '5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - - -';
  const BOS5_B_CH = '1 2 1 7 6 4 1 2';
  const BOS5_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';

  S('boss_lanternfall', {
    title: 'The Bell Under the Water',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'Chapter 5 boss (C phrygian, 148): a keeper that says "you must not" and "please do" in the same breath. A low biwa riff, shamisen chords, ōdaiko and shime-daiko on 3+3+2, the ōtsuzumi "kan", chappa and a bell tolling under everything — slow at first, then on every half bar in C. The Hush motif climbs on glass and the koto answers by walking the same steps back down, contradicting it; the road motif falls on shakuhachi in B and on shinobue with the Hush in B2.',
    key: 'C', mode: 'phrygian', bpm: 148, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.72, rv: 0.22 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 5, v: 0.52, rv: 0.3, pan: -0.2 },
      toll: { i: 'toll', o: 3, v: 0.62, rv: 0.45 },
      riff: { i: 'biwa', o: 3, v: 0.52, rv: 0.12, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.3, rv: 0.1, pan: 0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.55, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      taiko: { perc: true, v: 0.6 },
      shime: { perc: true, v: 0.36, pan: 0.15 },
      kan: { perc: true, v: 0.45, pan: -0.1 },
      crash: { perc: true, v: 0.36, rv: 0.3, pan: 0.3 },
    },
    all: {
      riff: BOS5_RIFF, ost: '. 0+2 . . . 0+2 . 0+1', bass: "0 0 0' 0 0 0 0' 0", sho: M.TRI,
      toll: '1 - - - - - - - | .:8',
      taiko: 'Z..z..Z.|Z.zzZzZz', shime: 'eeEeeEee', kan: '....q...|....q.qq', crash: 'v.......|........|v.......|........',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', sho: null, ost: null, kan: null, crash: null, taiko: 'Z..z..Z.|ZzZzZZZZ' },
      A: { bars: 8, ch: BOS5_A_CH, glass: BOS5_HUSH, koto: BOS5_A_NO },
      B: { bars: 8, ch: BOS5_B_CH, lead: BOS5_B },
      C: { bars: 8, ch: '6 6 2 2 6 6 5P 5P', glass: BOS5_C_GLASS, toll: '1 - - - 1 - - -', riff: null, taiko: 'Z.......|Z...z.z.', shime: 'e.e.e.e.', kan: 'q.q.q.q.', ost: "0 2 1' 2", dyn: 0.9 },
      B2: { bars: 8, ch: BOS5_B_CH, lead: BOS5_B, glass: BOS5_HUSH, taiko: 'Z..z..Z.|Z.zzZzZZ' },
      A2: { bars: 8, ch: BOS5_A_CH, glass: BOS5_HUSH, koto: BOS5_A_NO },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'shinobue' }, o: { lead: 1 } }, { s: 'A2', i: { riff: 'shamisen' }, o: { riff: 1 } }],
  });

  // ============================================================ STORY CUES
  // The minutes of the flood council, and the night of the flood itself.
  const LFF_A = '5 - - - 4 - 3 - | 2 - - - 1 - - - | 7, - - - 1 - 2 - | 3 - - - - - . . | 4 - - - 3 - 2 - | 1 - - - 7, - 6, - | #7, - 1 - 2 - #7, - | 1 - - - - - . .';
  const LFF_A_CH = '1 7 7 3 4 1 5M 1';
  const LFF_B = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - - - . . | 6, - 1 - 3 - 4 - | 5 - - - 4 - 3 - | 2 - - - #7, - - - | 1 - - - - - . .';
  const LFF_B_CH = '1 7 1 7 6 1 5M 1';

  S('lf_flood', {
    title: 'Old Minutes',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (D minor, 63) for the council minutes read aloud and the gatekeeper’s account of the flood night: a quarrel over a vague promise, a messenger running in the rain, a bell that rang too late. Koto rain in soft sixteenths, a low shakuhachi line, a biwa striking the bass, and a temple bell far off at the end of each phrase; B carries the road motif, as someone running.',
    key: 'D', mode: 'aeolian', bpm: 63,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.7, rv: 0.45 },
      rain: { i: 'koto', o: 4, pat: true, u: 0.25, v: 0.2, rv: 0.45, pan: 0.25 },
      biwa: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.4, rv: 0.4, pan: -0.2 },
      low: { i: 'bowed', o: 3, pat: true, bass: true, v: 0.38, rv: 0.45 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.36, rv: 0.5 },
      bell: { i: 'toll', o: 3, v: 0.45, rv: 0.6 },
    },
    all: { rain: '0 2 1 2', biwa: '0 . . . . . . .', low: '0 - - - - - - -', pad: M.TRI, bell: '.:8 | .:8 | .:8 | 1 - - - - - - - | .:8 | .:8 | .:8 | 1 - - - - - - -' },
    sections: {
      A: { bars: 8, ch: LFF_A_CH, lead: LFF_A, low: null },
      B: { bars: 8, ch: LFF_B_CH, lead: LFF_B, rain: '0 1 2 1' },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'bowed' }, o: { lead: -2 } }],
  });

  // The drowned bell rings; the voices in the pipes turn and run home.
  S('lf_bell', {
    title: 'The Bell Rings',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (B-flat, 72) after the drowned bell is rung: the bell itself on every other downbeat, koto running up through each chord like the voices turning back down the pipes, the main theme on shakuhachi and shinobue an octave apart, ōdaiko rolls swelling, a shō underneath. B is the theme’s answering phrase, quieter, with the rin.',
    key: 'Bb', bpm: 72,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.4 },
      hi: { i: 'shinobue', o: 5, v: 0.42, rv: 0.4, pan: 0.2 },
      rise: { i: 'koto', o: 3, pat: true, u: 0.25, v: 0.24, rv: 0.4, pan: -0.25 },
      bell: { i: 'toll', o: 3, v: 0.5, rv: 0.6 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.42, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      roll: { perc: true, v: 0.35, rv: 0.35 },
      bowl: { perc: true, v: 0.3, rv: 0.6, pan: 0.3 },
    },
    all: { rise: "0 1 2 0' 1' 2' 0'' -", sho: M.TRI, bass: '0 - - - - - - -', bell: '1 - - - - - - - | .:8' },
    sections: {
      A: { bars: 8, ch: M.ROAD_A_CH, lead: M.ROAD_A, hi: M.ROAD_A, roll: 'z.......|........|z...z...|zzzzZ...' },
      B: { bars: 8, ch: M.ROAD_B_CH, lead: M.ROAD_B, bell: null, bowl: 'i.......|........', dyn: 0.9 },
    },
    form: ['A', 'B'],
  });

  _.REQUIRED_SONGS.push('lf_road', 'lf_records', 'lf_town_after', 'battle_lanternfall', 'boss_lanternfall', 'lf_flood', 'lf_bell');
})(RB.audio);
