/* The sea (expansion P11c; plan 06_WORLD.md W7; 07_REGIONS.md R6): Open Water, for the coastal sea when you sail her
 * yourself. Notation: see 30_songs.js.
 *
 * The shinobue carries the sail motif (a swell up to the sixth and back, a sail filling and easing); the koto rolls
 * under it like the swell; the bass rocks between root and fifth; brush and water drops for the spray. G mixolydian,
 * unhurried. The sea's creature on deck fights to Kotonoha's battle theme (the zone below). */
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
  // the sail motif: a swell up to the sixth and back
  _.motifs.sail = { deg: '1 3 5 6 5 3', notes: 'The sea: a swell up to the sixth and back, a sail filling and easing.' };
  const SAIL = '1 - 3 - 5 - 6 - | 5 - - - 3 - - - | 2 - 3 - 5 - 3 - | 2 - - - - - . .';
  const SEA_A = SAIL + " | 1 - 3 - 5 - 1' - | 7 - 6 - 5 - - - | 4 - 3 - 2 - 3 - | 1 - - - - - . .";
  const SEA_A_CH = '1 1 5 5 1 7 4 1';
  const SEA_B = "5 - - - 6 - 7 - | 1' - - - - - . . | 6 - - - 5 - 4 - | 5 - - - - - . . | 3 - - - 4 - 5 - | 6 - - - 5 - 3 - | 2 - - - 3 - 2 - | 1 - - - - - . .";
  const SEA_B_CH = '4 4 2 5 6 4 5 1';
  S('sea', {
    title: 'Open Water',
    kind: 'area',
    motifs: ['sail'],
    notes: 'The coastal sea (G mixolydian, 92): the shinobue sings the sail motif, a swell up to the sixth and back; the koto rolls under it like the swell, the bass rocks between root and fifth; brush and water drops for the spray.',
    key: 'G', mode: 'mixolydian', bpm: 92, loopFrom: 1,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.42, rv: 0.45 },
      roll: { i: 'koto', o: 4, pat: true, v: 0.24, rv: 0.35, pan: -0.25 },
      hi: { i: 'harp', o: 4, pat: true, v: 0.14, rv: 0.6, pan: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
      pad: { i: 'pad', o: 3, hold: true, v: 0.16, rv: 0.6 },
      spray: { perc: true, v: 0.2, rv: 0.5, pan: 0.2 },
    },
    all: { roll: '0 1 2 1 0 1 2 1', hi: ". . 2 . . . 1' .", bass: '0 - - - 2 - - -', pad: '0+2', spray: 'b...d...|b.....d.' },
    sections: {
      intro: { bars: 2, ch: '1 1', hi: null },
      A: { bars: 8, ch: SEA_A_CH, lead: SEA_A },
      B: { bars: 8, ch: SEA_B_CH, lead: SEA_B },
      A2: { bars: 8, ch: SEA_A_CH, lead: SEA_A, hi: "2 . 1' . 2 . 1' ." },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });
})(RB.audio);
