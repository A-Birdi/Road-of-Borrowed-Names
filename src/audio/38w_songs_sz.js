/* Sazanami (expansion P11d; plan 07_REGIONS.md R6): Ripples, for the fishing hamlet up the coast. Notation: see
 * 30_songs.js.
 *
 * The shakuhachi carries the ripple motif (a small lift to the sixth and back down past the third, like a ripple
 * running in and drawing off); the shamisen keeps a lazy fisher's strum, the koto rolls under it, the bass rocks
 * between root and fifth, water drops for the pools. D major on the yo pentatonic (no fourth, no seventh in the
 * tune), unhurried; quieter and more open than Saltglass's working harbour. */
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
  // the ripple motif: a small lift to the sixth and back down past the third
  _.motifs.ripple = { deg: '5 6 5 3 2 3', notes: 'Sazanami: a small lift to the sixth and back down past the third, a ripple running in and drawing off.' };
  const SZ_A = "5 - 6 5 3 - 2 3 | 5 - - - 6 - 5 - | 6 - 5 - 1' - 6 5 | 2 - - - - - . . | 5 - 6 5 3 - 2 3 | 6 - 1' - 6 - 5 - | 3 - 5 - 2 - 3 2 | 1 - - - - - . .";
  const SZ_A_CH = '1 1 4 5 1 4 5 1';
  const SZ_B = "6 - - - 1' - 6 5 | 3 - - - 5 - - - | 6 - 5 - 6 - 1' - | 3 - - - - - . . | 2 - 3 - 5 - 6 - | 2' - - - 6 - 5 - | 6 - 5 - 2 - 5 - | 5 - - - - - . .";
  const SZ_B_CH = '6 6 4 1 2 5 4 5';
  S('sazanami', {
    title: 'Ripples',
    kind: 'area',
    motifs: ['ripple'],
    notes: 'Sazanami (D major on the yo pentatonic, 84): the shakuhachi sings the ripple motif, a small lift to the sixth and back down past the third; a lazy shamisen strum, the koto rolling under it, the bass rocking between root and fifth, water drops for the tide pools.',
    key: 'D', mode: 'ionian', bpm: 84, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.4, rv: 0.45 },
      strum: { i: 'shamisen', o: 3, pat: true, v: 0.2, rv: 0.2, pan: -0.3 },
      roll: { i: 'koto', o: 4, pat: true, v: 0.18, rv: 0.35, pan: 0.25 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.38 },
      pad: { i: 'pad', o: 3, hold: true, v: 0.14, rv: 0.6 },
      drops: { perc: true, v: 0.16, rv: 0.5, pan: 0.2 },
    },
    all: { strum: '0 . 2 . 0 . 2 1', roll: ". 0 . 2 . 1 . 2", bass: '0 - - - 2 - - -', pad: '0+2', drops: 'd.......|....d...' },
    sections: {
      intro: { bars: 2, ch: '1 1', roll: null },
      A: { bars: 8, ch: SZ_A_CH, lead: SZ_A },
      B: { bars: 8, ch: SZ_B_CH, lead: SZ_B },
      A2: { bars: 8, ch: SZ_A_CH, lead: SZ_A, roll: "0 1 2 1 0 1 2 1" },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });
})(RB.audio);
