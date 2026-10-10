/* Manybridge, Chapter 4 of the twelve-chapter edition (expansion P09; plan 07_REGIONS.md R1 "Theme"): Playhouse Row, the
 * Understage, the festival, the fireworks, and the Lord of the Understage. Notation: see 30_songs.js.
 *
 * The same city's palette as Chapter 3 (shamisen, hand drums, hyōshigi clappers), turned toward the theatre: Playhouse
 * Row has the taiko pulse the plan asks for; the Understage is ropes and wheels in the dark; the festival is a
 * matsuri-bayashi; the fireworks cue is the quiet under the bangs. Every one quotes the road motif. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 4;
    _.songDefs[id] = def;
  }
  // the road motif, as the city plays it (Chapter 3's C section: a porter whistling it crossing a bridge)
  const ROAD = "5, - 3 - - 2 1 - | 2 - - - - - . . | 3 - 5 - 6 - 5 - | 3 - 2 - 1 - - - | 5, - 3 - - 2 1 - | 7, - - - - - . . | 1 - 2 - 3 - 2 - | 1 - - - - - . .";
  const ROAD_CH = '1 5 6 2 1 5 4 1';

  // ========================================================= PLAYHOUSE ROW
  const PH_A = "1 - 3 - 5 - 3 - | 6 - 1' - 6 - 4 - | 5 - 3 - 1 - 3 - | 2 - - - 5 - - - | 3 - 5 - 1' - 5 - | 4 - 6 - 1' - 6 - | 5 - 7, - 2 - - - | 1 - - - . . . .";
  const PH_A_CH = '1 4 1 5 1 4 5 1';
  const PH_B = "6 - - - 3 - - - | 4 - - - 6 - - - | 5 - - - 3 - - - | 2 - - - - - - - | 1' - - - 6 - - - | 1' - - - 4 - - - | 7, - - - 2 - - - | 5 - - - - - . .";
  const PH_B_CH = '6 4 1 5 6 4 5 5';
  S('playhouse', {
    title: 'Footlights',
    kind: 'area',
    motifs: ['road'],
    notes: 'Playhouse Row (D, 118): the theatre street. Ōdaiko and shime-daiko keep a taiko pulse under a shamisen tune that climbs to the octave like a barker\'s call; the hyōshigi clappers open each pass, as before a curtain. B gives the shakuhachi a slower answer over a turn to the relative minor (the wings, the dust); C hands the road motif to the shamisen before the street comes back.',
    key: 'D', bpm: 118, loopFrom: 1,
    tracks: {
      lead: { i: 'shamisen', o: 4, v: 0.62, rv: 0.2 },
      ans: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.35, pan: 0.2 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.3, rv: 0.25, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.24, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      taiko: { perc: true, v: 0.5 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      clap: { perc: true, v: 0.5, pan: 0.3 },
    },
    all: { koto: "0 2 1' 2", bass: '0 - 2 - 0 - 2 -', pad: '0+1+2', taiko: 'z...z...|z...z.z.', shime: 'e.e.e.e.|e.eee.e.' },
    sections: {
      intro: { bars: 2, ch: '1 1', clap: 'y.y.y...|y.......', taiko: null, shime: null },
      A: { bars: 8, ch: PH_A_CH, lead: PH_A },
      B: { bars: 8, ch: PH_B_CH, ans: PH_B, taiko: 'z.......|z...z...' },
      C: { bars: 8, ch: ROAD_CH, lead: ROAD, clap: 'y.......|........' },
      A2: { bars: 8, ch: PH_A_CH, lead: PH_A, ans: PH_A },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // =========================================================== THE UNDERSTAGE
  const US_A = "1 - - - - - 5, - | 7, - - - 2 - - - | 4 - - - - - 6, - | 5, - - - 3 - - - | 6, - - - 1 - - - | 2 - - - 7, - - - | 3 - - - 1 - - - | 5, - - - - - - -";
  const US_A_CH = '1 7 4 1 6 7 6 5';
  const US_B = "3 - - - 5 - - - | 6 - - - 1' - - - | 4 - - - 6 - - - | 7, - - - 2 - - - | 5 - - - 3 - - - | 1' - - - 6 - - - | 6 - - - 3 - - - | 5 - - - - - - -";
  const US_B_CH = '3 6 4 7 3 4 6 5';
  // C: the road motif slowed to a note every half bar, as if hummed by someone working a rope in the dark
  const US_C = "5, - - - 3 - - - | 2 - - - 1 - - - | 2 - - - - - - - | .:8 | 5, - - - 3 - - - | 2 - - - 1 - - - | 7, - - - - - - - | .:8";
  const US_C_CH = '1 5 7 1 1 5 7 5';
  S('understage', {
    title: 'Beneath the Boards',
    kind: 'area',
    motifs: ['road'],
    notes: 'The Understage (B aeolian, 76): the dark under the stage. A bowed drone and a slow biwa pluck like a rope taking the strain; the clappers far off overhead (the play going on above); the shakuhachi line moves a step at a time. B lifts to the relative major as the machinery turns; C slows the road motif to a note every half bar.',
    key: 'B', mode: 'aeolian', bpm: 76, loopFrom: 0,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.55 },
      biwa: { i: 'biwa', o: 2, pat: true, v: 0.3, rv: 0.45, pan: -0.25 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.32, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      clap: { perc: true, v: 0.22, rv: 0.6, pan: 0.35 },
    },
    all: { biwa: '0 . . . 2 . . .', bass: '0 - - - - - - -', low: '0+2', clap: '........|....y...' },
    sections: {
      A: { bars: 8, ch: US_A_CH, lead: US_A },
      B: { bars: 8, ch: US_B_CH, lead: US_B, clap: '..y.....|....y...' },
      C: { bars: 8, ch: US_C_CH, lead: US_C, biwa: '0 . . . . . . .' },
    },
    form: ['A', 'B', 'C'],
  });

  // ============================================================ THE FESTIVAL
  const FE_A = "5 - 6 - 5 - 3 - | 1' - - - 5 - - - | 6 - - - 1' - 6 - | 5 - 3 - 1 - - - | 3 - 5 - 6 - 5 - | 2 - - - 5 - - - | 4 - 6 - 1' - - - | 1 - - - . . . .";
  const FE_A_CH = '1 1 4 1 1 5 4 1';
  const FE_B = "6 - - - 1' - - - | 2 - - - 4 - - - | 5 - - - 7 - - - | 1' - - - - - - - | 3 - - - 6 - - - | 4 - - - 1' - - - | 2 - - - 5 - - - | 3 - - - - - . .";
  const FE_B_CH = '6 2 5 1 6 4 5 1';
  S('festival', {
    title: 'The Opening of the River',
    kind: 'area',
    motifs: ['road'],
    notes: 'The festival (G, 120): a matsuri-bayashi for the Opening of the River and the festival hall after it. The shinobue tune over shime-daiko and ōdaiko and the atarigane\'s chan-chiki; B passes it to the shamisen with koto chords; C gives the road motif to the shinobue, the drums dropping to a heartbeat, before the band comes back.',
    key: 'G', bpm: 120, loopFrom: 1,
    tracks: {
      fue: { i: 'shinobue', o: 5, v: 0.5, rv: 0.25 },
      sham: { i: 'shamisen', o: 4, v: 0.5, rv: 0.2, pan: -0.15 },
      koto: { i: 'koto', o: 4, pat: true, fold: 'all', win: -3, v: 0.3, rv: 0.25, pan: 0.2 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.24, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.58 },
      shime: { perc: true, v: 0.42, pan: 0.15 },
      taiko: { perc: true, v: 0.5 },
      kane: { perc: true, v: 0.3, pan: -0.25 },
    },
    all: { bass: '0 . 2 . 0 . 2 .', pad: '0+1+2', shime: 'e.eee.e.|e.eee.ee', taiko: 'z.......|z...z...', kane: 'a..aa..a' },
    sections: {
      intro: { bars: 2, ch: '1 1', shime: 'y.y.y...|e.e.eeee', taiko: '........|z.......', kane: null, bass: null },
      A: { bars: 8, ch: FE_A_CH, fue: FE_A, koto: '0+1+2 . . 0+1+2 . . 0+1+2 .' },
      B: { bars: 8, ch: FE_B_CH, sham: FE_B, koto: '. . 0+1+2 . . . 0+1+2 .', kane: 'a...a...' },
      C: { bars: 8, ch: ROAD_CH, fue: ROAD, shime: null, kane: null, taiko: 'z.......|........', dyn: 0.85 },
      A2: { bars: 8, ch: FE_A_CH, fue: FE_A, sham: FE_A, koto: '0+1+2 . . 0+1+2 . . 0+1+2 .', taiko: 'z...z...|z.z.z...' },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ======================================================= THE FIREWORKS (cue)
  const FW_A = "3 - - - 5 - - - | 6 - - - 1' - - - | 6 - - - 4 - - - | 5 - - - 2 - - - | 1' - - - 5 - - - | 3 - - - 1 - - - | 4 - - - 6 - - - | 5 - - - - - - -";
  const FW_A_CH = '1 6 4 5 1 6 4 1';
  S('fireworks', {
    title: 'Tamaya',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (E♭, 66) for the fireworks with the companion: koto arpeggios rising like sparks, a shakuhachi line on long notes, and the ōdaiko far off as the bursts (soft, never sharp). B is the road motif on the koto, the drums gone quiet, the two of you just watching.',
    key: 'Eb', bpm: 66, loopFrom: 0,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.55, rv: 0.5 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.32, rv: 0.45, pan: 0.25 },
      road: { i: 'koto', o: 4, v: 0.5, rv: 0.4, pan: -0.15 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.3, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      boom: { perc: true, v: 0.35, rv: 0.7 },
    },
    all: { arp: "0 2 1' 2 0' 2 1' 2", pad: '0+1+2', bass: '0 - - - - - - -', boom: 'z.......|........|....z...|........' },
    sections: {
      A: { bars: 8, ch: FW_A_CH, lead: FW_A },
      B: { bars: 8, ch: ROAD_CH, road: ROAD, boom: null, dyn: 0.85 },
    },
    form: ['A', 'B', 'A'],
  });

  // ==================================================== THE LORD OF THE UNDERSTAGE
  const NB_RIFF = '1 1 5, 1 2 1 5, 1 | 1 1 3 2 1 7, 6, 7,';
  const NB_A = '1 - 3 - 5 - 3 - | 2 - 4 - 6 - 4 - | 5 - - - 3 - 1 - | 7, - - - 2 - 4 - | 6, - 1 - 3 - 1 - | 2 - 4 - 7, - 2 - | 4 - - - 2 - - - | 1 - - - - - - -';
  const NB_A_CH = '1 2 1 7 6 7 2 1';
  const NB_B = "1' - - - 6 - - - | 7 - - - 2' - - - | 1' - - - 5 - - - | 6 - - - 4 - - - | 3 - - - 6 - - - | 4 - - - 7 - - - | 2' - - - 6 - - - | 5 - - - - - - -";
  const NB_B_CH = '6 7 1 2 6 7 2 1';
  const NB_C = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - - - . . | 1 - 2 - 3 - 4 - | 5 - - - 4 - 3 - | 2 - - - 3 - - - | 1 - - - - - - -';
  const NB_C_CH = '1 2 1 7 1 1 2 1';
  // D: the hush motif, rising and never landing: the machinery that wants a play without names
  const NB_D = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - 5 - - - | 6 - - - 5 - 4 - | 5 - - - - - - -';
  const NB_D_CH = '1 4 1 1 1 4 6 1';
  S('boss_understage', {
    title: 'The Lord of the Understage',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'The Understage\'s boss (C# phrygian, 144; Chapter 3\'s is 142). A biwa riff like a capstan ratcheting round, shamisen chords, ōdaiko and shime-daiko driving and the hyōshigi cracking on the backbeat as stage cues. A climbs and falls on the shakuhachi; B rises on shinobue toward the roll call; C restates the road motif; D lets the shinobue climb the hush motif, the machinery wanting a play without names.',
    key: 'C#', mode: 'phrygian', bpm: 144, loopFrom: 1,
    tracks: {
      riff: { i: 'biwa', o: 3, v: 0.55, rv: 0.15, pan: -0.2 },
      lead: { i: 'shakuhachi', o: 5, v: 0.62, rv: 0.25 },
      hi: { i: 'shinobue', o: 5, v: 0.52, rv: 0.25, pan: 0.15 },
      low: { i: 'bowed', o: 3, v: 0.55, rv: 0.25, pan: 0.2 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.4, rv: 0.12, pan: 0.25 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.3, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      taiko: { perc: true, v: 0.6 },
      shime: { perc: true, v: 0.46, pan: 0.2 },
      clap: { perc: true, v: 0.45, pan: -0.25 },
    },
    all: { riff: NB_RIFF, ost: "0 2 0' 2 0 2 0' 2", bass: '0 0 - 0 0 - 0 -', pad: '0+2+4', taiko: 'z..z..z.|z.z.z.zz', shime: 'eeeeeeee|e.e.e.e.', clap: '..y...y.|..y.y.y.' },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null },
      A: { bars: 8, ch: NB_A_CH, lead: NB_A },
      B: { bars: 8, ch: NB_B_CH, hi: NB_B, low: "1 - - - 3 - - - | 2 - - - 4 - - - | 3 - - - 5 - - - | 6 - - - - - - - | 1' - - - 6 - - - | 7 - - - 4 - - - | 6 - - - 4 - - - | 1 - - - - - - -" },
      C: { bars: 8, ch: NB_C_CH, lead: NB_C, clap: '..y.....|..y...y.' },
      D: { bars: 8, ch: NB_D_CH, hi: NB_D, riff: null, taiko: 'z.......|z...z...' },
      A2: { bars: 8, ch: NB_A_CH, lead: NB_A, hi: NB_A },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'D', o: { hi: 1 } }, { s: 'A2', o: { hi: 1 } }],
  });
})(RB.audio);
