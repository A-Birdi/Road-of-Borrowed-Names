/* Kotonoha, Chapter 9 of the twelve-chapter edition (expansion P11; plan 07_REGIONS.md R4 "Theme": koto harmonics, a
 * bowed instrument, wind chimes, sparse and spacious): the island, the Root Hollows, the Garden of Unsent Words, the
 * island's battle theme and the Gardener. Notation: see 30_songs.js.
 *
 * The bowed voice (a kokyū-like line) carries the tunes; the koto plays high and sparse, like harmonics; glass stands
 * in for the wind chimes, a few random-seeming high notes in each bar. Every one quotes the leaf motif (a rise to the
 * octave and a slow fall, a leaf lifted and let go). In the twelve-chapter ladder (C-22) the battle and boss themes
 * sit a step above Lanternfall's (Chapter 8 there) and below the Archive's, leaving room for Chapters 10 and 11
 * (tests/unit/audio_zones.test.mjs). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 9;
    _.songDefs[id] = def;
  }
  // the leaf motif: up to the octave, a breath, and a slow fall
  _.motifs.leaf = { deg: "5, 6, 1 6, 5, 3,", notes: 'Kotonoha: a rise to the octave and a slow fall, a leaf lifted and let go.' };
  const LEAF = "5, - 6, - 1 - - - | 6, - 5, - 3, - - - | 2, - 3, - 5, - 3, - | 2, - - - - - . .";
  const LEAF_HI = "5 - 6 - 1' - - - | 6 - 5 - 3 - - - | 2 - 3 - 5 - 3 - | 2 - - - - - . .";

  // ================================================================== THE ISLAND
  const IS_A = LEAF_HI + " | 5 - 6 - 1' - 2' - | 1' - 6 - 5 - - - | 3 - 2 - 1 - 2 - | 1 - - - - - . .";
  const IS_A_CH = '1 4 2 5 1 4 7 1';
  // B: the koto alone in its high register, a note a bar like harmonics
  const IS_B = "1' - - - . . . . | 5 - - - . . . . | 4 - - - . . . . | 5 - - - . . . . | 3 - - - . . . . | 4 - - - . . . . | 2' - - - 7 - - - | 1' - - - - - . .";
  const IS_B_CH = '1 3 4 5 3 4 7 1';
  S('kotonoha', {
    title: 'Leaves on the Tide',
    kind: 'area',
    motifs: ['leaf'],
    notes: 'Kotonoha, the shore and the village (D dorian, 72): an island where lost words wash up. A bowed voice sings the leaf motif, up to the octave and slowly down; the koto answers high and sparse, like harmonics; glass for the wind chimes, a few high notes a bar; a brush on the off-beats for the tide. B is the koto alone, a note a bar; A2 brings the bowed voice back with the koto doubling it two octaves up.',
    key: 'D', mode: 'dorian', bpm: 72, loopFrom: 1,
    // (+1.5 dB: it opened on the edge of the game's range; tests/e2e/audio.check.mjs)
    tracks: _.lift({
      lead: { i: 'bowed', o: 4, v: 0.5, rv: 0.55 },
      hi: { i: 'koto', o: 5, v: 0.28, rv: 0.7, pan: 0.25 },
      chime: { i: 'glass', o: 4, pat: true, v: 0.15, rv: 0.85, pan: 0.35 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.2, rv: 0.4, pan: -0.25 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.2, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.34 },
      tide: { perc: true, v: 0.16, rv: 0.6, pan: -0.2 },
    }, 1.5),
    all: { koto: "0 . . 2 . . 1' .", chime: "2' . . . . 0' . . | . . 1' . . . . .", bass: '0 - - - - - - -', low: '0+2', tide: '....b...|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: null, bass: null },
      A: { bars: 8, ch: IS_A_CH, lead: IS_A },
      B: { bars: 8, ch: IS_B_CH, hi: IS_B, koto: "0 . . . . . . ." },
      A2: { bars: 8, ch: IS_A_CH, lead: IS_A, hi: IS_A },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ============================================================== THE ROOT HOLLOWS
  const RT_A = "1 - - - 2 - 3 - | 2 - - - - - . . | 7, - - - 1 - 2 - | 1 - - - - - . . | 3 - - - 4 - 3 - | 2 - 1 - 7, - - - | 6, - - - 7, - 1 - | 7, - - - - - . .";
  const RT_A_CH = '1 7 6 1 3 7 6 5';
  // B: the leaf motif an octave down on the bowed bass, slow, with drips
  const RT_B_CH = '1 4 2 5 1 4 7 1';
  S('ko_roots', {
    title: 'Under the Great Camphor',
    kind: 'area',
    motifs: ['leaf'],
    notes: 'The Root Hollows and the sea cave (B aeolian, 64): damp earth, the sea underneath, leaves turning in the air. A low koto picks a narrow line between the roots; a shō holds the air; water drips; the glass chimes sound far off. B sends the leaf motif down into the bowed bass, slowly, as if from under the island.',
    key: 'B', mode: 'aeolian', bpm: 64, loopFrom: 0,
    tracks: {
      lead: { i: 'koto', o: 3, v: 0.5, rv: 0.6 },
      deep: { i: 'bowed', o: 3, v: 0.44, rv: 0.55, pan: -0.15 },
      chime: { i: 'glass', o: 3, pat: true, v: 0.12, rv: 0.9, pan: 0.35 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.26, rv: 0.55 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.26, rv: 0.5 },
      drip: { perc: true, v: 0.24, rv: 0.75, pan: 0.3 },
    },
    all: { chime: ". . . . . . 2' . | . . . . . . . . | . . 1' . . . . . | . . . . . . . .", sho: '0+1+2', low: '0+2', drip: '....d...|........|..d.....|......d.' },
    sections: {
      A: { bars: 8, ch: RT_A_CH, lead: RT_A },
      B: { bars: 8, ch: RT_B_CH, deep: LEAF + ' | ' + LEAF, sho: null },
    },
    form: ['A', 'B'],
  });

  // ======================================================= THE GARDEN OF UNSENT WORDS
  // three-four: leaves hung on the root-branches like lanterns, swaying
  const GD_A = "5 - - - 6 - | 1' - - - - - | 6 - 5 - 3 - | 5 - - - - - | 2 - - - 3 - | 5 - - - 3 - | 2 - 1 - 2 - | 1 - - - - -";
  const GD_A_CH = '1 4 6 1 2 5 7 1';
  S('ko_garden', {
    title: 'Letters Never Sent',
    kind: 'area',
    motifs: ['leaf'],
    notes: 'The Garden of Unsent Words (E dorian, 56, in three): hundreds of letters hung on the roots like little lights. A harp turns slowly; the bowed voice sings the leaf motif as a lullaby; the glass chimes, closer now, every bar.',
    key: 'E', mode: 'dorian', bpm: 56, meter: 3, loopFrom: 0,
    tracks: {
      lead: { i: 'bowed', o: 4, v: 0.46, rv: 0.6 },
      harp: { i: 'harp', o: 3, pat: true, v: 0.26, rv: 0.55, pan: -0.2 },
      chime: { i: 'glass', o: 4, pat: true, v: 0.16, rv: 0.85, pan: 0.3 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.22, rv: 0.55 },
    },
    all: { harp: "0 2 1'", chime: ". 2' .", low: '0+2' },
    sections: {
      A: { bars: 8, ch: GD_A_CH, lead: GD_A },
      B: { bars: 8, ch: GD_A_CH, harp: "0 . 2", chime: "1' . 2'" },
    },
    form: ['A', 'B', 'A'],
  });

  // =========================================================== THE ISLAND'S BATTLE
  const BK_A = "1 - 5, - 1 - 3 - | 4 - 3 - 2 - 1 - | 5, - - - - - . . | 5 - 6 - 1' - 6 - | 5 - 4 - 3 - 4 - | 5 - 3 - 2 - 1 - | 2 - - - 7, - 2 - | 1 - - - - - . .";
  const BK_A_CH = '1 4 5 4 7 3 7 1';
  const BK_B = LEAF_HI + " | 5 - 6 - 1' - 2' - | 1' - 7 - 6 - 5 - | 4 - 3 - 2 - 7, - | 1 - - - - - . .";
  const BK_B_CH = '1 4 2 5 4 3 7 1';
  const BK_B_LOW = '1 - - - - - - - | 4, - - - - - - - | 2 - - - - - - - | 5, - - - - - - - | 4, - - - - - - - | 3, - - - - - - - | 7, - - - - - - - | 1 - - - - - - -';
  // C: the leaf motif torn about by the wind, phrygian, over a close cluster
  const BK_C_HI = "5,! - 6, - 1 - - - | 6,! - 5, - 3, - - - | .:8 | 2! - 1 - 7, - 1 - | 5,! - 6, - 1 - - - | 6,! - 5, - 3, - - - | .:8 | 7,! - 1 - 7, - - -";
  const BK_C_LOW = '1 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | 2 - - - - - - - | 1 - - - - - - - | 7, - - - - - - - | 6, - - - - - - - | 5, - - - - - - -';
  const BK_C_CH = '1 2 3 2 1 7 6 5P';
  S('battle_ko', {
    title: 'Inkweaving — Leaves in the Wind',
    kind: 'battle',
    motifs: ['leaf'],
    notes: 'Chapter 9 battle (D dorian, 117; Lanternfall\'s is 116, the Archive\'s 120). The bowed voice leads, struck hard; the koto runs in fast arpeggios like leaves in a gust; glass chimes on the off-beats; ōdaiko, shime-daiko and the noh drums drive a 3+3+2 pulse. B gives the leaf motif to the shakuhachi over a falling bowed bass; C turns phrygian, the leaf motif thrown about with hard accents over a close cluster; B2 hands it to the bowed voice.',
    key: 'D', mode: 'dorian', bpm: 117, loopFrom: 1,
    tracks: {
      lead: { i: 'bowed', o: 4, v: 0.68, rv: 0.22 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.64, rv: 0.25, pan: 0.12 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.38, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.3, rv: 0.25, pan: 0.3 },
      chime: { i: 'glass', o: 4, pat: true, v: 0.2, rv: 0.6, pan: 0.35 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.56 },
      shime: { perc: true, v: 0.42, pan: 0.2 },
      noh: { perc: true, v: 0.42, pan: -0.25 },
    },
    all: {
      ost: "0 0' 2 0' 4 0' 2 0'", arp: "0 . 1' 2 0 . 1' .", chime: ". . . 2' . . . .", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z.zZ.|Z..zZ.Zz', shime: 'eeEeeeEe|eeeeEeee', noh: 'm.mq..m.|..m.q.qm',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ', noh: 'q.....q.|q.q.q...' },
      A: { bars: 8, ch: BK_A_CH, lead: BK_A },
      B: { bars: 8, ch: BK_B_CH, shaku: BK_B, low: BK_B_LOW },
      C: { bars: 8, mode: 'phrygian', ch: BK_C_CH, low: BK_C_LOW, lead: BK_C_HI, arp: { n: "0 2 1' 2", u: 0.25 }, pad: '0+2+b4', taiko: 'Z..z..Z.|Z.zz.zZz' },
      B2: { bars: 8, ch: BK_B_CH, shaku: BK_B, low: BK_B_LOW, arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { shaku: 'bowed' }, o: { shaku: 0 } }],
  });

  // ================================================== THE GARDENER OF UNSENT WORDS
  const BB_RIFF = "1 1 5, 1 2 1 5, 1 | 1 1 3 2 1 7, 6, 7,";
  const BB_A = "5 - 4 - 3 - 1 - | 2 - - - 1 - 7, - | 1 - 3 - 5 - 6 - | 5 - - - - - . . | 6 - 5 - 4 - 3 - | 4 - - - 2 - 1 - | 7, - 1 - 2 - 7, - | 1 - - - - - . .";
  const BB_A_CH = '1 2 6 1 6 4 7 1';
  const BB_B_CH = '1 4 2 5 1 4 7 1';
  const BB_B_LOW = '1 - - - - - - - | 4, - - - - - - - | 2 - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 4, - - - - - - - | 7, - - - - - - - | 1 - - - - - - -';
  // C: the leaf motif on glass, over open fifths, never quite falling the whole way: words that won't be let go
  const BB_C = "5, - 6, - 1 - - - | 6, - 5, - - - - - | 5, - 6, - 1 - - - | 6, - 5, - - - - - | 5, - 6, - 1 - 2 - | 3 - - - 2 - 1 - | 6, - - - 5, - 6, - | 5, - - - - - - -";
  const BB_C_CH = '1P 1P 1P 1P 1P 4 6 1P';
  const BB_C_LOW = '1 - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 4 - - - - - - - | 6, - - - - - - - | 1 - - - - - - -';
  S('boss_ko', {
    title: 'The Gardener of Unsent Words',
    kind: 'boss',
    motifs: ['leaf'],
    notes: 'Kotonoha\'s boss (C-sharp aeolian, 149; Lanternfall\'s is 148, the Archive\'s 152): the oldest keeper-spirit in the garden of letters never sent. A koto riff struck near the bridge; shamisen chords; ōdaiko and shime-daiko driving; the hyōshigi clappers and glass chimes. A climbs and falls on the bowed voice; B is the leaf motif on the shinobue over a bowed bass; C sets the leaf motif on glass over open fifths, rising and never falling all the way, the words that will not be let go; A2 takes the tune back on bowed voice and shinobue together.',
    key: 'C#', mode: 'aeolian', bpm: 149, loopFrom: 1,
    tracks: {
      riff: { i: 'koto', o: 3, v: 0.56, rv: 0.15, pan: -0.2 },
      lead: { i: 'bowed', o: 4, v: 0.62, rv: 0.25 },
      hi: { i: 'shinobue', o: 5, v: 0.52, rv: 0.25, pan: 0.15 },
      glass: { i: 'glass', o: 4, v: 0.85, rv: 0.45, pan: 0.2 },
      low: { i: 'bowed', o: 3, v: 0.55, rv: 0.25, pan: 0.2 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.4, rv: 0.12, pan: 0.25 },
      chime: { i: 'glass', o: 4, pat: true, v: 0.16, rv: 0.6, pan: -0.3 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.3, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      taiko: { perc: true, v: 0.6 },
      shime: { perc: true, v: 0.46, pan: 0.2 },
      clap: { perc: true, v: 0.42, pan: -0.25 },
    },
    all: {
      riff: BB_RIFF, ost: "0 2 0' 2 0 2 0' 2", chime: ". . . . . . 1' .", bass: '0 0 - 0 0 - 0 -', pad: '0+1+2',
      taiko: 'Z..z..Z.|Z.z.Z.zZ', shime: 'eeEeeeEe|e.eEe.ee', clap: '..y...y.|..y.y.y.',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null },
      A: { bars: 8, ch: BB_A_CH, lead: BB_A },
      B: { bars: 8, ch: BB_B_CH, hi: LEAF_HI + ' | ' + LEAF_HI, low: BB_B_LOW },
      C: { bars: 8, ch: BB_C_CH, glass: BB_C, low: BB_C_LOW, riff: null, taiko: 'Z.......|Z...z...', clap: '..y.....|..y...y.' },
      A2: { bars: 8, ch: BB_A_CH, lead: BB_A, hi: BB_A },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B', i: { hi: 'shakuhachi' } }, 'A2'],
  });
})(RB.audio);
