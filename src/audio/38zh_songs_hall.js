/* The Hall of a Hundred Tales (expansion P15; plan 04_DUNGEONS.md D9: each wing "with its own map identity, music and
 * language theme"). The foyer: an old wooden hall at night, a biwa walking slowly under a held shō, the koto answering
 * now and then like a lantern being lit across the room (D dorian, 64). Wing 1, The Lamp at the Crossroads: a hill road
 * at dusk, the shakuhachi asking a phrase and the koto answering it back the same, a little changed (the tale's "say it
 * again"), over a soft taiko step that walks and stops (A minor pentatonic feel, aeolian, 76). Postgame and the
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

  // ================================================================== THE HALL
  const HALL_A = '1 - - - 2 - 3 - | 5 - - - 3 - - - | 2 - - - 1 - 6, - | 1 - - - - - . . | 3 - - - 5 - 6 - | 5 - - - 3 - 2 - | 1 - - - 2 - 6, - | 1 - - - - - . .';
  const HALL_KOTO = '.:8 | . . . . 5 - - - | .:8 | . . . . 3 - 2 - | .:8 | . . . . 6 - 5 - | .:8 | . . . . 1 - - -';
  S('hall', {
    title: 'The Hall of a Hundred Tales',
    kind: 'area',
    motifs: ['road'],
    notes: 'The keepers\' old hall at night (D dorian, 64): the biwa walks the tune slowly under a held shō, and every other bar the koto answers from across the room, a note or two, like a lantern being lit somewhere else in the dark. B turns to the road motif on the shakuhachi, quietly, as if remembering the journey that brought you here.',
    key: 'D', mode: 'dorian', bpm: 64, loopFrom: 1,
    tracks: {
      lead: { i: 'biwa', o: 3, v: 0.5, rv: 0.45 },
      koto: { i: 'koto', o: 5, v: 0.4, rv: 0.6, pan: 0.25, dl: 0.25 },
      flute: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.5 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.2, rv: 0.5 },
    },
    echo: { beats: 1, fb: 0.25, mix: 0.25 },
    all: { pad: '0+4' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '.:8 | . . . . 5 - - -' },
      A: { bars: 8, ch: '1 4 2 1 3 5 1 1', lead: HALL_A, koto: HALL_KOTO },
      B: { bars: 8, ch: '4 4 1 1 2 2 5 5', flute: '5, - 3 - 2 - 1 - | 2 - - - - - . . | 3 - 2 - 1 - 6, - | 1 - - - - - . . | 5, - 3 - 2 - 1 - | 2 - - - 3 - - - | 2 - - - 1 - - - | 1 - - - - - . .' },
      A2: { bars: 8, ch: '1 4 2 1 3 5 1 1', lead: HALL_A, koto: HALL_KOTO, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 1: THE LAMP AT THE CROSSROADS
  // The tale's "say it again": every phrase of the shakuhachi is answered by the koto with the same notes, the last one
  // changed. The taiko steps on the first beat, walks two bars and stops for two, like someone stopping to ask.
  const ASK = '3 - 5 - 6 - - - | .:8 | 6 - 5 - 3 - - - | .:8 | 2 - 3 - 5 - - - | .:8 | 3 - 2 - 1 - - - | .:8';
  const AGAIN = '.:8 | 3 - 5 - 6 - 1\' - | .:8 | 6 - 5 - 3 - 2 - | .:8 | 2 - 3 - 5 - 6 - | .:8 | 3 - 2 - 1 - - -';
  S('hall_w1', {
    title: 'The Lamp at the Crossroads',
    kind: 'area',
    motifs: [],
    notes: 'Wing 1 of the Hall: a hill road at dusk going to night (A aeolian, 76). The shakuhachi asks a phrase; the koto answers it back the same, with the last note changed, the tale\'s "say it again" turned into music. A taiko step on the first beat walks for two bars and stops for two, someone pausing at the crossroads to ask. B gives the asking to the koto and the answer to the flute, and a held shō opens out under it, as if the lamp had been lit.',
    key: 'A', mode: 'aeolian', bpm: 76, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.56, rv: 0.45 },
      koto: { i: 'koto', o: 4, v: 0.46, rv: 0.5, pan: 0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.28, rv: 0.35 },
      taiko: { i: 'taiko', drum: true, v: 0.3 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.16, rv: 0.5 },
    },
    echo: { beats: 0.75, fb: 0.25, mix: 0.22 },
    all: { bass: '0 - - - 4 - - -', taiko: 'x - - - - - - - | x - - - - - - - | .:8 | .:8' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: ASK, koto: AGAIN },
      B: { bars: 8, ch: '4 4 1 1 7 7 1 1', koto: ASK, lead: AGAIN, pad: '0+4' },
      A2: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: ASK, koto: AGAIN, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });
})(RB.audio);
