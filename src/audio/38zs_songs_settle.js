/* Ashihara Shinden, the new settlement (expansion P15f; plan 07_REGIONS.md R7). The village: a planting song on the reed
 * plain, the shinobue singing a plain tune of five notes, the shamisen answering it lower, a hand drum keeping the walk
 * of people carrying seedlings (G major pentatonic, ionian, 84). Its first festival: the same tune turned into a dance,
 * the flute calling a bar and the shamisen answering the next, and the drum's walk becoming the dance's step; the
 * same instruments at the same tempo, the change is in how the tune is shared out (C-22). Postgame and the
 * twelve-chapter edition only. Notation: see 30_songs.js. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 12;
    def.edition = 2;
    def.postgame = true;
    _.songDefs[id] = def;
  }
  const TUNE = '1 - 2 - 3 - 5 - | 6 - 5 - 3 - - - | 2 - 3 - 5 - 3 - | 2 - 1 - - - . . | 3 - 5 - 6 - 1\' - | 6 - 5 - 3 - - - | 2 - 3 - 2 - 1 - | 6, - 1 - - - . .';
  const ANSWER = '5, - 6, - 1 - 2 - | 3 - 2 - 1 - - - | 6, - 1 - 2 - 3 - | 2 - - - . . . . | 5 - 3 - 2 - 1 - | 2 - 3 - 5 - - - | 3 - 2 - 1 - 6, - | 1 - - - - - . .';
  // the festival: the flute calls one bar, the shamisen answers the next (the tune shared out between them)
  const CALL = '1 - 2 - 3 - 5 - | . . . . . . . . | 2 - 3 - 5 - 3 - | . . . . . . . . | 3 - 5 - 6 - 1\' - | . . . . . . . . | 2 - 3 - 2 - 1 - | . . . . . . . .';
  const REPLY = '. . . . . . . . | 6 - 5 - 3 - - - | . . . . . . . . | 2 - 1 - - - . . | . . . . . . . . | 6 - 5 - 3 - - - | . . . . . . . . | 6, - 1 - - - . .';
  const CH = '1 4 1 1 1 4 5 1';
  const TRACKS = () => ({
    flute: { i: 'shinobue', o: 5, v: 0.36, rv: 0.4, pan: 0.15 },
    sham: { i: 'shamisen', o: 3, v: 0.38, rv: 0.3, pan: -0.15 },
    bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.18, rv: 0.3 },
    drum: { perc: true, v: 0.18, rv: 0.3 },
  });

  S('ashihara', {
    title: 'New Fields on the Reed Plain',
    kind: 'area',
    motifs: [],
    notes: 'Ashihara Shinden by day: a planting song (G major pentatonic, 84). The shinobue sings a plain five-note tune, the shamisen answers it lower, and a hand drum keeps the walk of people carrying seedlings; in A2 they sing it together.',
    key: 'G', mode: 'ionian', bpm: 84, loopFrom: 1,
    tracks: TRACKS(),
    all: { bass: '0 - - - 2 - - -', drum: 'p...p.t.|p...p...' },
    sections: {
      intro: { bars: 2, ch: '1 1', sham: '1 - - - 5, - - - | 1 - - - - - . .' },
      A: { bars: 8, ch: CH, flute: TUNE },
      B: { bars: 8, ch: CH, sham: ANSWER },
      A2: { bars: 8, ch: CH, flute: TUNE, sham: ANSWER, dyn: 0.9 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  S('as_festival', {
    title: 'The First Festival',
    kind: 'area',
    motifs: [],
    notes: 'Ashihara Shinden\'s first festival night: the village\'s tune turned into a dance (G major pentatonic, 84, the same as by day). The flute calls a bar and the shamisen answers the next, the tune shared out between them, and the drum\'s walk becomes the dance\'s step; in B the shamisen sings the answering tune under the flute\'s calls; in A2 they play it whole together.',
    key: 'G', mode: 'ionian', bpm: 84, loopFrom: 1,
    tracks: TRACKS(),
    all: { bass: '0 - 2 - 0 - 2 -', drum: 'P.t.P.t.|P.t.p.t.' },
    sections: {
      intro: { bars: 2, ch: '1 1', flute: '1 - - - 5 - - - | 1\' - - - - - . .' },
      A: { bars: 8, ch: CH, flute: CALL, sham: REPLY },
      B: { bars: 8, ch: CH, sham: ANSWER, flute: CALL },
      A2: { bars: 8, ch: CH, flute: TUNE, sham: ANSWER, dyn: 0.95 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });
})(RB.audio);
