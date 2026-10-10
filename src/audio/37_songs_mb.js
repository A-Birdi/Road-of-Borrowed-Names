/* Manybridge — the twelve-chapter edition's Chapter 3 (expansion P08; plan 07_REGIONS.md R1 "Theme"): the canal
 * city, the Undercroft Locks, and the chapter's battle and boss themes. Notation: see 30_songs.js.
 *
 * The palette the plan gives the city: shamisen-led and brisker than Saltglass, hand drums and a taiko pulse,
 * wooden clappers (拍子木) as a cue. Intensity: a step above Saltglass (a few more beats per minute, a busier
 * ostinato, the clappers on top of the drums), still one score with the road motif under it. The twelve-chapter
 * ladder as a whole (C-22) is checked when every new zone has its themes (P14). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 3;
    _.songDefs[id] = def;
  }

  // ============================================================ THE CITY
  const MB_A = "1 - 2 3 5 - 3 2 | 1 - 6, - 1 - . . | 2 - 3 5 6 - 5 3 | 2 - - - . . . . | 5 - 6 1' 6 - 5 3 | 5 - 3 2 1 - 2 3 | 2 - 1 6, 1 - 2 - | 1 - - - . . . .";
  const MB_A_CH = '1 6 2 5 4 1 2 1';
  const MB_B = "6 - 5 - 3 - 5 - | 6 - 1' - 2' - - - | 1' - 6 - 5 - 3 - | 5 - - - . . . . | 3 - 5 - 6 - 5 - | 3 - 2 - 1 - 2 - | 3 - - - 2 - 1 - | 2 - - - . . . .";
  const MB_B_CH = '4 4 6 5 4 1 6 5';
  // C: the road motif on the shamisen, as if a porter whistles it crossing a bridge
  const MB_C = "5, - 3 - - 2 1 - | 2 - - - - - . . | 3 - 5 - 6 - 5 - | 3 - 2 - 1 - - - | 5, - 3 - - 2 1 - | 7, - - - - - . . | 1 - 2 - 3 - 2 - | 1 - - - - - . .";
  const MB_C_CH = '1 5 6 2 1 5 4 1';
  S('manybridge', {
    title: 'Eight Hundred Bridges',
    kind: 'area',
    motifs: ['road'],
    notes: 'Manybridge (A, 112): the canal city. A shamisen tune in eighths over koto and a walking bass; the shakuhachi answers in the B section, where the harmony leans to IV like a barge turning under a bridge. Hand pats and shime-daiko keep a quick step; the clappers (hyōshigi) open each pass, as at a theatre door. C gives the road motif to the shamisen, as if a porter whistles it crossing a bridge.',
    key: 'A', bpm: 112, loopFrom: 1,
    tracks: {
      lead: { i: 'shamisen', o: 4, v: 0.62, rv: 0.2 },
      ans: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.35, pan: 0.2 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.32, rv: 0.25, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.26, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.45 },
      clap: { perc: true, v: 0.5, pan: 0.3 },
    },
    all: { koto: "0 2 1' 2", bass: '0 - 2 - 0 - 2 -', pad: '0+1+2', perc: 'p.e.p.e.|p.e.pee.' },
    sections: {
      intro: { bars: 2, ch: '1 1', clap: 'y.y.y...|y.......', perc: null },
      A: { bars: 8, ch: MB_A_CH, lead: MB_A },
      B: { bars: 8, ch: MB_B_CH, ans: MB_B, perc: 'p...e.p.|p.e.p.e.' },
      C: { bars: 8, ch: MB_C_CH, lead: MB_C, clap: 'y.......|........', perc: 'p.e.p.e.|p.eep.e.' },
      A2: { bars: 8, ch: MB_A_CH, lead: MB_A, ans: "3 - - - - - - - | 1 - - - - - - - | 5 - - - - - - - | 4 - - - - - - - | 3 - - - - - - - | 2 - - - - - - - | 4 - - - - - - - | 3 - - - - - - -" },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ======================================================== THE UNDERCROFT
  const UC_A = "5, - - - - - - - | 1 - - - 2 - - - | 3 - - - - - 2 - | 1 - - - - - - - | 5, - - - 6, - - - | 1 - - - 7, - - - | 6, - - - - - - - | .:8";
  const UC_A_CH = '1 7 4 1 6 7 6 5';
  // C: the road motif slowed, one note to a half bar, far off down the tunnel
  const UC_C = "5, - - - 3 - - - | 2 - - - 1 - - - | 2 - - - - - - - | .:8 | 5, - - - 3 - - - | 2 - - - 1 - - - | 7, - - - - - - - | .:8";
  const UC_C_CH = '1 5 7 1 1 5 7 5';
  S('undercroft', {
    title: 'Under the Exchange',
    kind: 'area',
    motifs: ['road'],
    notes: 'The Undercroft Locks (D aeolian, 72): water dripping in the dark (drops on the off-beats), a held bowed drone, sparse koto harmonics, and the road motif slowed on a far shakuhachi. B lifts to the relative major as the levels turn; in C the road motif comes back, slowed to a note every half bar.',
    key: 'D', mode: 'aeolian', bpm: 72, loopFrom: 0,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.55 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.26, rv: 0.5, pan: 0.3 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.32, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      drip: { perc: true, v: 0.4, rv: 0.6, pan: -0.3 },
    },
    all: { koto: "0 . 2 . 1' . . .", bass: '0 - - - - - - -', low: '0+2', drip: '...d....|.....d..' },
    sections: {
      A: { bars: 8, ch: UC_A_CH, lead: UC_A },
      B: { bars: 8, ch: '3 6 4 7 3 4 6 5', lead: "3 - - - 5 - - - | 6 - - - - - 5 - | 3 - - - 2 - - - | 1 - - - - - - - | 3 - - - 5 - - - | 1' - - - 7 - - - | 6 - - - 5 - - - | .:8", drip: '..d.....|....d..d' },
      C: { bars: 8, ch: UC_C_CH, lead: UC_C, koto: "0 . . . 2 . . .", drip: '....d...|.d......' },
    },
    form: ['A', 'B', 'C'],
  });

  // ================================================================ BATTLE
  const BMB_A = "1 - 3 - 4 - 5 - | 4 - 3 - 1 - 7, - | 1 - 3 - 4 - 5 - | 7 - - - 6 - 5 - | 4 - 5 - 6 - 5 - | 4 - 3 - 1 - 3 - | 2 - 1 - 7, - 6, - | 7, - - - . . . .";
  const BMB_A_CH = '1 7 1 7 4 1 7 5';
  const BMB_B = "5 - 6 - 7 - 1' - | 7 - 6 - 5 - 4 - | 5 - 6 - 7 - 1' - | 2' - - - 1' - 7 - | 6 - 5 - 4 - 3 - | 4 - 5 - 6 - 7 - | 1' - 7 - 6 - 5 - | 5 - - - . . . .";
  const BMB_B_CH = '4 7 4 5 4 2 7 1';
  const BMB_C = "5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - - - . . | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - . .";
  const BMB_C_CH = '1 5 1 7 1 4 3 5';
  S('battle_manybridge', {
    title: 'Inkweaving — Canal Rush',
    kind: 'battle',
    motifs: ['road'],
    notes: 'Manybridge battle (E dorian, 108; Saltglass is 104). The 3+3+2 pulse on ōdaiko and shime-daiko, with hyōshigi clappers marking the bar like a stage cue; a shamisen ostinato that climbs to the ninth; the road motif on shakuhachi, then up on shinobue in B over a bowed line; C states the road motif plainly before the return.',
    key: 'E', mode: 'dorian', bpm: 108, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.66, rv: 0.25 },
      hi: { i: 'shinobue', o: 5, v: 0.5, rv: 0.25, pan: 0.15 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.42, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.28, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.34, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.68 },
      taiko: { perc: true, v: 0.56 },
      shime: { perc: true, v: 0.44, pan: 0.2 },
      clap: { perc: true, v: 0.4, pan: -0.3 },
    },
    all: { ost: "0 0' 2 0 0' 2 4 2", arp: "0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4', taiko: 'z..z..z.|z..z.zz.', shime: 'e.ee.ee.|e.ee.eee', clap: 'y.......|y...y...' },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null },
      A: { bars: 8, ch: BMB_A_CH, lead: BMB_A },
      B: { bars: 8, ch: BMB_B_CH, hi: BMB_B, low: "1 - - - 6, - - - | 1 - - - 2 - - - | 1 - - - 6, - - - | 5, - - - - - - - | 4, - - - 5, - - - | 6, - - - 2 - - - | 1 - - - 7, - - - | 5, - - - - - - -" },
      C: { bars: 8, ch: BMB_C_CH, lead: BMB_C, taiko: 'z.......|z...z.z.', clap: 'y...y...|y.y.y...' },
      A2: { bars: 8, ch: BMB_A_CH, lead: BMB_A, low: "1 - - - - - - - | 7, - - - - - - - | 1 - - - - - - - | 4, - - - - - - - | 4, - - - - - - - | 1 - - - - - - - | 7, - - - - - - - | 5, - - - - - - -" },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A2', i: { lead: 'shamisen' }, o: { lead: -1 } }],
  });

  // ================================================================== BOSS
  const BB_RIFF = '1 1 2 1 6, 1 2 1 | 1 1 3 2 1 6, 7, 1';
  const BB_A = '5 - - - 4 - 3 - | 2 - - - 1 - - - | 5 - - - 6 - 5 - | 4 - - - - - - - | 3 - 4 - 5 - 6 - | 7 - 6 - 5 - 4 - | 3 - - - 2 - - - | 1 - - - - - - -';
  const BB_A_CH = '1 2 1 7 6 7 2 1';
  const BB_B = "1 - 2 - 3 - 5 - | 6 - - - 5 - - - | 1' - 7 - 6 - 5 - | 6 - - - - - - - | 5 - 6 - 7 - 1' - | 2' - - - 1' - - - | 7 - 6 - 5 - 3 - | 5 - - - - - - -";
  const BB_B_CH = '6 7 1 2 6 7 2 1';
  const BB_C = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - - - . . | 1 - 2 - 3 - 4 - | 5 - - - 4 - 3 - | 2 - - - 3 - - - | 1 - - - - - - -';
  const BB_C_CH = '1 2 1 7 1 1 2 1';
  // D: the hush motif, rising and never landing — the bridge's own refusal
  const BB_D = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - 5 - - - | 6 - - - 5 - 4 - | 5 - - - - - - -';
  const BB_D_CH = '1 4 1 1 1 4 6 1';
  S('boss_manybridge', {
    title: 'The Nameless Bridge',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'Manybridge boss (F# phrygian, 142; Saltglass\'s is 140). A biwa riff of planks being torn up, a shamisen chord ostinato, ōdaiko and shime-daiko driving, the ōtsuzumi "kan" and clappers on the backbeat. The road motif falls on shakuhachi in A; B rises on shinobue towards the name, the bowed bass climbing under it. C restates the road motif; D drops the riff and lets the shinobue climb the hush motif, as the bridge refuses.',
    key: 'F#', mode: 'phrygian', bpm: 142, loopFrom: 1,
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
      kan: { perc: true, v: 0.42, pan: -0.25 },
    },
    all: { riff: BB_RIFF, ost: "0 2 0' 2 0 2 0' 2", bass: '0 0 - 0 0 - 0 -', pad: '0+2+4', taiko: 'z..z..z.|z.z.z.zz', shime: 'eeeeeeee|e.e.e.e.', kan: '..q...q.|..q.y.q.' },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null },
      A: { bars: 8, ch: BB_A_CH, lead: BB_A },
      B: { bars: 8, ch: BB_B_CH, hi: BB_B, low: "1 - - - 3 - - - | 2 - - - 4 - - - | 3 - - - 5 - - - | 6 - - - - - - - | 1' - - - 6 - - - | 7 - - - 4 - - - | 6 - - - 4 - - - | 1 - - - - - - -" },
      C: { bars: 8, ch: BB_C_CH, lead: BB_C, kan: '..q.....|..q...q.' },
      D: { bars: 8, ch: BB_D_CH, hi: BB_D, riff: null, taiko: 'z.......|z...z...' },
      A2: { bars: 8, ch: BB_A_CH, lead: BB_A, hi: BB_A },
    },
    form: ['intro', 'A', 'B', 'C', 'D', { s: 'A2', o: { hi: 1 } }],
  });
})(RB.audio);
