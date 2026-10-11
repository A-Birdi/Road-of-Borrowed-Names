/* The Hall of a Hundred Tales (expansion P15; plan 04_DUNGEONS.md D9: each wing "with its own map identity, music and
 * language theme"). The foyer: an old wooden hall at night, a biwa walking slowly under a held shō, the koto answering
 * now and then like a lantern being lit across the room (D dorian, 64). Wing 1, The Lamp at the Crossroads: a hill road
 * at dusk, the shakuhachi asking a phrase and the koto answering it back the same, a little changed (the tale's "say it
 * again"), over a soft taiko step that walks and stops (A minor pentatonic feel, aeolian, 76). Wing 2, The Fox's
 * Wedding: rain falling through sunshine on a meadow, a procession walking by, the shinobue carrying a wedding tune and
 * the koto passing each phrase on to the next player, as a gift is handed down a line (G major pentatonic, 72). Wing 3,
 * The Bell Before Dawn: the last hour of the night in a mountain village, the shakuhachi in the old in-scale, the koto
 * counting steps one by one, a low temple bell tolling every few bars, and in the middle a soft drum, the tanuki's (E
 * phrygian, 66). Wing 4, The Borrowed Umbrella: a peddler's walking tune in the rainy season, the shamisen picking along
 * the road under the shinobue, rain dripping from the eaves and a hand drum keeping the walk (A dorian, 80). Wing 5,
 * The Two Wells: a late-summer village with two voices that answer each other across it, the biwa for the east house
 * and the shakuhachi for the west, a single drip deep in a well, and cicadas far off (D aeolian, 70). Postgame and the
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
      B: { bars: 8, ch: '4 4 1 1 2 2 5 5', flute: '5, - 3 - 2 - 1 - | 2 - - - - - . . | 3 - 2 - 1 - 6, - | 1 - - - - - . . | 5, - 3 - 2 - 1 - | 2 - - - - - . . | 2 - - - 1 - - - | 1 - - - - - . .' },
      A2: { bars: 8, ch: '1 4 2 1 3 5 1 1', lead: HALL_A, koto: HALL_KOTO, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 1: THE LAMP AT THE CROSSROADS
  // The tale's "say it again": every phrase of the shakuhachi is answered by the koto with the same notes, the last one
  // changed. The taiko steps on the first beat, walks two bars and stops for two, like someone stopping to ask.
  const ASK = '3 - 5 - 1\' - - - | .:8 | 6 - 5 - 3 - - - | .:8 | 2 - 3 - 5 - - - | .:8 | 3 - 2 - 1 - - - | .:8';
  const AGAIN = '.:8 | 3 - 5 - 1\' - 2\' - | .:8 | 6 - 5 - 3 - 2 - | .:8 | 2 - 3 - 5 - 4 - | .:8 | 3 - 2 - 1 - - -';
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
      taiko: { perc: true, v: 0.3, rv: 0.35 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.16, rv: 0.5 },
    },
    echo: { beats: 0.75, fb: 0.25, mix: 0.22 },
    all: { bass: '0 - - - 4 - - -', taiko: 'z.......|z.......|........|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: ASK, koto: AGAIN },
      B: { bars: 8, ch: '1 1 4 4 7 7 1 1', koto: ASK, lead: AGAIN, pad: '0+4' },
      A2: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: ASK, koto: AGAIN, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 2: THE FOX'S WEDDING
  // A sun-shower over a meadow and a procession walking through it. The shinobue sings a phrase; the koto takes its last
  // notes and carries them on, as a gift is handed from one person to the next (the wing's "who gives what to whom").
  // Under it the kotsuzumi marks the procession's slow step, small bells shake far off now and then, and the rain falls
  // in single drops. Intensity is in the tune, never a faster step (C-22).
  const VOW = '1 - 2 - 3 - 5 - | 6 - 5 - 3 - - - | 5 - 3 - 2 - 1 - | 2 - - - - - . . | 3 - 5 - 6 - 1\' - | 6 - 5 - 3 - - - | 2 - 3 - 2 - 1 - | 1 - - - - - . .';
  const PASS = '.:8 | . . . . 3 - 5 - | .:8 | . . . . 5 - 6 - | .:8 | . . . . 3 - 2 - | .:8 | . . . . 1 - - -';
  const PASS_B = '.:8 | . . . . 1 - 2 - | .:8 | . . . . 3 - 2 - | .:8 | . . . . 3 - 5 - | .:8 | . . . . 2 - - -';
  S('hall_w2', {
    title: 'The Fox\'s Wedding',
    kind: 'area',
    motifs: [],
    notes: 'Wing 2 of the Hall: rain falling through sunshine on a meadow, and a wedding procession walking through it (G major pentatonic, 72). The shinobue carries the wedding tune; at the end of every other bar the koto takes up its last notes and carries them on, as a gift passed down a line of hands. A kotsuzumi marks the procession\'s slow step, small bells shake somewhere far off, and the rain falls in single drops. B lets the shō in under a quieter flute, the procession passing under the torii.',
    key: 'G', mode: 'ionian', bpm: 72, loopFrom: 1,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.48, rv: 0.45 },
      koto: { i: 'koto', o: 4, v: 0.44, rv: 0.5, pan: -0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.24, rv: 0.35 },
      drum: { perc: true, v: 0.26, rv: 0.4 },
      rain: { perc: true, v: 0.16, rv: 0.6 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.15, rv: 0.5 },
    },
    echo: { beats: 0.75, fb: 0.22, mix: 0.2 },
    all: { bass: '0 - - - 4 - - -', drum: 'm.......|....m...|m.......|..j.....', rain: '..d....d|.....d..|.d......|....d..d' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '5, - - - 1 - - - | 3 - - - - - - -' },
      A: { bars: 8, ch: '1 1 4 5 1 4 5 1', lead: VOW, koto: PASS },
      B: { bars: 8, ch: '4 4 1 1 6 6 5 5', lead: '6 - - - 5 - 3 - | 1 - - - - - . . | 3 - - - 2 - 1 - | 3 - - - - - . . | 3 - - - 2 - 1 - | 6, - - - - - . . | 5, - 6, - 1 - 2 - | 2 - - - - - . .', koto: PASS_B, pad: '0+4' },
      A2: { bars: 8, ch: '1 1 4 5 1 4 5 1', lead: VOW, koto: PASS, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 3: THE BELL BEFORE DAWN
  // The last hour of the night. The shakuhachi sings in the in-scale (1, ♭2, 4, 5, ♭6), the koto counts the steps up
  // the slope in plain eighths, one, two, three, four, and a low bell tolls on the first beat of every fourth bar. In B
  // the koto takes the tune and a soft drum comes in under it, pon, pon: the tanuki in the cedars. The tune's own climb
  // gives the hour its weight, never a faster step (C-22).
  const NIGHT = '1 - - - 2 - 1 - | 5 - - - 4 - - - | 6 - - - 5 - 4 - | 1 - - - - - . . | 4 - - - 2 - 1 - | 2 - - - - - . . | 4 - 5 - 6 - 5 - | 1 - - - - - . .';
  const STEPS = '.:8 | 1 . 2 . 4 . 5 . | .:8 | 1 . 2 . 4 . 5 . | .:8 | 2 . 4 . 2 . 1 . | .:8 | 1 . 2 . 4 . 5 .';
  const TOLL = '1 - - - - - - - | .:8 | .:8 | .:8 | 1 - - - - - - - | .:8 | .:8 | .:8';
  S('hall_w3', {
    title: 'The Bell Before Dawn',
    kind: 'area',
    motifs: [],
    notes: 'Wing 3 of the Hall: the last hour of the night in a mountain village (E phrygian, 66). The shakuhachi sings in the old in-scale; between its phrases the koto counts the steps up the slope, one, two, three, four, and a low temple bell tolls on the first beat of every fourth bar. In B the koto takes the tune and a soft drum comes in beneath it, pon, pon, the tanuki in the cedars holding the night back; A2 brings the flute back a little quieter, as the sky begins to grey.',
    key: 'E', mode: 'phrygian', bpm: 66, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.54, rv: 0.5 },
      koto: { i: 'koto', o: 4, v: 0.4, rv: 0.45, pan: 0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.24, rv: 0.35 },
      bell: { i: 'toll', o: 2, v: 0.3, rv: 0.7 },
      drum: { perc: true, v: 0.24, rv: 0.45 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.14, rv: 0.5 },
    },
    echo: { beats: 1, fb: 0.25, mix: 0.22 },
    all: { bass: '0 - - - 4 - - -' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 . 2 . 4 . 5 . | .:8', bell: '1 - - - - - - - | .:8' },
      A: { bars: 8, ch: '1 1 6 6 7 7 1 1', lead: NIGHT, koto: STEPS, bell: TOLL },
      B: { bars: 8, ch: '6 6 7 7 1 1 7 7', bell: TOLL, koto: '6 - - - 5 - - - | 1 - - - - - . . | 2 - 4 - 2 - 1 - | 2 - - - - - . . | 1 - 2 - 4 - 5 - | 5 - - - - - . . | 4 - - - 2 - - - | 1 - - - - - . .', drum: 'l.......|....l...|l.......|l...l...', pad: '0+4' },
      A2: { bars: 8, ch: '1 1 6 6 7 7 1 1', lead: NIGHT, koto: STEPS, bell: TOLL, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 4: THE BORROWED UMBRELLA
  // A peddler's road in the rainy season. The shinobue walks the tune; the shamisen picks along under it, off the beat,
  // like a pack bumping on a back; rain drips in single drops and a hand drum keeps the walking pace. B gives the tune
  // to the koto, for the year of waiting, and brings the flute back for the way home (C-22: the tune, not the tempo).
  const ROAD = '1 - - - 3 - 5 - | 4 - 3 - 1 - - - | 5 - - - 4 - 1 - | 4 - - - - - . . | 4 - - - 5 - 4 - | 7, - - - - - . . | 1 - 3 - 4 - 5 - | 1 - - - - - . .';
  const PICK = '. 1 . 5 . 1 . 5 | . 1 . 3 . 1 . 5 | . 4 . 1 . 4 . 1 | . 4 . 1 . 4 . 6 | . 7, . 4 . 7, . 2 | . 7, . 4 . 7, . 2 | . 1 . 5 . 1 . 3 | . 1 . 5 . 1 . 5';
  S('hall_w4', {
    title: 'The Borrowed Umbrella',
    kind: 'area',
    motifs: [],
    notes: 'Wing 4 of the Hall: a peddler\'s road in the rainy season (A dorian, 80). The shinobue walks the tune; under it the shamisen picks off the beat, like a pack bumping on a back; rain drips in single drops from the eaves and a hand drum keeps the walking pace. B hands the tune to the koto, a year of waiting at the temple gate, and A2 brings the flute back for the way home.',
    key: 'A', mode: 'dorian', bpm: 80, loopFrom: 1,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.46, rv: 0.4 },
      pick: { i: 'shamisen', o: 3, v: 0.34, rv: 0.3, pan: 0.2 },
      koto: { i: 'koto', o: 4, v: 0.44, rv: 0.5, pan: -0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.22, rv: 0.35 },
      drum: { perc: true, v: 0.22, rv: 0.35 },
      rain: { perc: true, v: 0.15, rv: 0.6 },
    },
    echo: { beats: 0.5, fb: 0.2, mix: 0.18 },
    all: { bass: '0 - - - 4 - - -', drum: 'p...p...|p...p.p.', rain: '...d....|.d.....d|.....d..|..d.....' },
    sections: {
      intro: { bars: 2, ch: '1 1', pick: '. 1 . 5 . 1 . 5 | . 1 . 3 . 1 . 5' },
      A: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: ROAD, pick: PICK },
      B: { bars: 8, ch: '4 4 1 1 7 7 1 1', koto: '1 - - - 4 - 5 - | 6 - - - - - . . | 5 - - - 3 - 1 - | 3 - - - - - . . | 4 - - - 2 - 7, - | 5, - - - - - . . | 1 - 3 - 5 - 3 - | 1 - - - - - . .' },
      A2: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: ROAD, pick: PICK, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 5: THE TWO WELLS
  // Two houses, two voices. In A the biwa (the east house) states a phrase and the shakuhachi (the west) answers it,
  // the same rhythm with the opposite turn, a contrast rather than an echo; in B they overlap for the first time, a
  // phrase each, under a held shō; A2 lets them finish each other's phrases. A water drip sounds deep in the well every
  // other bar. The making-up is in the tune, never a louder or faster arrangement (C-22).
  const EAST = '5 - - - 3 - 1 - | 2 - - - - - . . | .:8 | .:8 | 5 - - - 6 - 5 - | 3 - - - - - . . | .:8 | .:8';
  const WEST = '.:8 | .:8 | 1 - - - 3 - 5 - | 4 - - - - - . . | .:8 | .:8 | 1 - - - 7, - 1 - | 3 - - - - - . .';
  S('hall_w5', {
    title: 'The Two Wells',
    kind: 'area',
    motifs: [],
    notes: 'Wing 5 of the Hall: a village at the end of summer with a well at either end (D aeolian, 70). Two voices for two houses: the biwa (the east) states a phrase, the shakuhachi (the west) answers with the same rhythm and the opposite turn, a contrast rather than an echo. In B they overlap for the first time under a held shō; in A2 each finishes the other\'s phrase. A single water drip sounds deep in a well every other bar, and cicadas sing far off.',
    key: 'D', mode: 'aeolian', bpm: 70, loopFrom: 1,
    tracks: {
      east: { i: 'biwa', o: 4, v: 0.48, rv: 0.4, pan: 0.25 },
      west: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.45, pan: -0.25 },
      bass: { i: 'koto', o: 3, pat: true, bass: true, v: 0.22, rv: 0.35 },
      drip: { perc: true, v: 0.18, rv: 0.7 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.14, rv: 0.5 },
    },
    echo: { beats: 1, fb: 0.22, mix: 0.2 },
    all: { bass: '0 - - - 4 - - -', drip: '......d.|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', east: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 1 4 4 6 6 1 1', east: EAST, west: WEST },
      B: { bars: 8, ch: '6 6 7 7 1 1 5 5', east: '3 - - - 1 - 6, - | 1 - - - - - . . | 2 - - - 4 - 2 - | 2 - - - - - . . | 5 - - - 3 - 1 - | 1 - - - - - . . | 5 - - - 7 - 5 - | 5 - - - - - . .', west: '.:8 | 3 - 1 - 3 - - - | .:8 | 4 - 2 - 4 - - - | .:8 | 3 - 5 - 3 - - - | .:8 | 2 - 5, - 2 - - -', pad: '0+4' },
      A2: { bars: 8, ch: '1 1 4 4 6 6 1 1', east: EAST, west: WEST, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 6: THE TOLL THAT CHANGED
  // A mountain pass in late autumn. The shakuhachi plays the toll as it began, one plain phrase; in B the koto takes the
  // same phrase and keeps adding to it, a turn here and a grace there, as the board filled with conditions; A2 gives the
  // plain phrase back, the rule behind them all. The hyōshigi knocks once every two bars, the gate's bar going down, and
  // the wind brushes through. The change is in the tune, never in a louder or faster arrangement (C-22).
  const PLAIN = '5 - - - 4 - 3 - | 1 - - - - - . . | 3 - 4 - 5 - 6 - | 5 - - - - - . . | 4 - - - 2 - 7, - | 1 - - - - - . . | 3 - 2 - 1 - 7, - | 1 - - - - - . .';
  const ADDED = '3 - 4 5 6 - 5 - | 5 - - - - - . . | 5 4 3 - 4 3 2 - | 1 - - - - - . . | 5 - 4 3 2 - 3 - | 5 - - - - - . . | 4 - 2 - 4 5 4 - | 2 - - - - - . .';
  S('hall_w6', {
    title: 'The Toll That Changed',
    kind: 'area',
    motifs: [],
    notes: 'Wing 6 of the Hall: a mountain pass in late autumn (E dorian, 74). The shakuhachi plays the toll as it began, one plain phrase; in B the koto takes the phrase and keeps adding to it, a turn here and a grace there, as the board filled with conditions; A2 gives the plain phrase back. The hyōshigi knocks once every two bars, the gate bar coming down, and a brush of wind goes through.',
    key: 'E', mode: 'dorian', bpm: 74, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.5, rv: 0.45 },
      koto: { i: 'koto', o: 4, v: 0.44, rv: 0.5, pan: -0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.22, rv: 0.35 },
      clap: { perc: true, v: 0.2, rv: 0.5 },
      wind: { perc: true, v: 0.12, rv: 0.6 },
    },
    echo: { beats: 1, fb: 0.2, mix: 0.18 },
    all: { bass: '0 - - - 4 - - -', clap: 'y.......|........', wind: '....b...|........|........|b.......' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: PLAIN },
      B: { bars: 8, ch: '4 4 1 1 3 3 7 7', koto: ADDED },
      A2: { bars: 8, ch: '1 1 4 4 7 7 1 1', lead: PLAIN, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 7: THE HOUSE THAT REMEMBERS
  // An empty house that remembers. The koto plays the family's tune whole; in B it plays the same tune with notes left
  // out, and the shō holds the harmony underneath so that the ear supplies what is missing (the wing's theme in sound);
  // A2 has the shakuhachi join the koto for the whole tune again. An old house creaks once in a while and the stream
  // drips past. Leaving notes out, never adding instruments or speed, is the change (C-22).
  const MEMORY = '5 - - - 4 - 3 - | 1 - - - - - . . | 3 - 4 - 5 - 6 - | 1 - - - - - . . | 4 - - - 2 - 7, - | 2 - - - - - . . | 3 - 2 - 1 - 7, - | 1 - - - - - . .';
  const GAPS = '5 - - - . . 3 - | . . . . . . . . | 3 - . . 5 - . . | 1 - - - - - . . | . . . . 2 - 7, - | 2 - - - - - . . | 3 - . . 1 - . . | . . . . . . . .';
  S('hall_w7', {
    title: 'The House That Remembers',
    kind: 'area',
    motifs: [],
    notes: 'Wing 7 of the Hall: an empty house deep in the snowy mountains of Tōno (C aeolian, 62). The koto plays the family\'s tune whole; in B it plays the same tune with notes left out while the shō holds the harmony, so that the ear supplies what is missing; in A2 the shakuhachi joins the koto for the whole tune. The old house creaks now and then and the stream drips past.',
    key: 'C', mode: 'aeolian', bpm: 62, loopFrom: 1,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.46, rv: 0.5 },
      flute: { i: 'shakuhachi', o: 4, v: 0.36, rv: 0.5, pan: 0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.2, rv: 0.35 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.14, rv: 0.5 },
      creak: { perc: true, v: 0.14, rv: 0.6 },
      drip: { perc: true, v: 0.14, rv: 0.7 },
    },
    echo: { beats: 1, fb: 0.24, mix: 0.2 },
    all: { bass: '0 - - - 4 - - -', creak: '........|........|...c....|........', drip: '......d.|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 1 6 6 7 7 1 1', koto: MEMORY },
      B: { bars: 8, ch: '1 1 6 6 7 7 1 1', koto: GAPS, pad: '0+4' },
      A2: { bars: 8, ch: '1 1 6 6 7 7 1 1', koto: MEMORY, flute: MEMORY, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 8: THREE WITNESSES AT THE INN
  // A snowbound inn and three accounts of one night. The same short phrase is told three times by three voices (the
  // koto, the shamisen, the shakuhachi), each telling it a little differently, as the witnesses do; in A2 the three
  // are laid over each other, and the phrase they share sounds plain at last. The hyōshigi of the night watch goes
  // round once every four bars. The puzzle is in the voicing, never in loudness or speed (C-22).
  const TOLD = '1 - 3 - 5 - - - | 4 - 3 - 2 - . . | 1 - 3 - 5 - - - | 6 - 5 - 3 - . .';
  const TOLD2 = '1 - 2 - 3 - - - | 3 - 2 - 1 - . . | 1 - 3 - 5 - - - | 4 - 3 - 2 - . .';
  S('hall_w8', {
    title: 'Three Witnesses at the Inn',
    kind: 'area',
    motifs: [],
    notes: 'Wing 8 of the Hall: an inn on the old highway, snowed in for the night (G mixolydian, 68). One short phrase is told three times by three voices, the koto, the shamisen and the shakuhachi, each a little differently, as the witnesses tell the night; in A2 the three are laid over each other and the phrase they share comes through. The night watch\'s clappers go round once every four bars.',
    key: 'G', mode: 'mixolydian', bpm: 68, loopFrom: 1,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.44, rv: 0.45, pan: -0.25 },
      sham: { i: 'shamisen', o: 4, v: 0.36, rv: 0.35, pan: 0.25 },
      flute: { i: 'shakuhachi', o: 4, v: 0.4, rv: 0.5 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.2, rv: 0.35 },
      watch: { perc: true, v: 0.18, rv: 0.5 },
    },
    echo: { beats: 1, fb: 0.2, mix: 0.18 },
    all: { bass: '0 - - - 4 - - -', watch: 'y.......|........|........|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 4 1 4 1 4 1 4', koto: TOLD + ' | ' + TOLD },
      B: { bars: 8, ch: '1 4 1 4 1 4 1 4', sham: TOLD2 + ' | ' + TOLD2 },
      C: { bars: 8, ch: '1 4 1 4 1 4 1 4', flute: TOLD + ' | ' + TOLD },
      A2: { bars: 8, ch: '1 4 1 4 1 4 1 4', koto: TOLD + ' | ' + TOLD, sham: TOLD2 + ' | ' + TOLD2, flute: TOLD + ' | ' + TOLD, dyn: 0.8 },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ================================================================== WING 9: THE CRANE'S RETURN
  // An old farmhouse in deep snow and a loom that never stops. The koto plays the tune plainly, as family speaks; in
  // B the shakuhachi plays the same tune in long, formal notes, as a guest speaks; in A2 the two play it together.
  // Under it all the loom keeps its own time, ton, ton, karari, once every two bars. The farewell is in the voicing,
  // never in loudness or speed (C-22).
  const WEAVE = '5 - - - 3 - 1 - | 2 - 4 - 5 - - - | 6 - - - 5 - 4 - | 2 - 1 - 7, - - - | 1 - - - 3 - 5 - | 4 - - - 6 - 5 - | 5 - 4 - 3 - 2 - | 1 - - - - - . .';
  const FORMAL = '5 - - - - - 3 - | 4 - - - 2 - - - | 1 - - - - - 6, - | 7, - - - - - . . | 3 - - - 5 - - - | 6 - - - 5 - 4 - | 3 - 2 - - - 7, - | 1 - - - - - - -';
  S('hall_w9', {
    title: 'The Crane\'s Return',
    kind: 'area',
    motifs: [],
    notes: 'Wing 9 of the Hall: an old farmhouse in deep snow, where a stranger weaves at night (D aeolian, 60). The koto plays the tune plainly, the way family talks; in B the shakuhachi plays it again in long, formal notes, the way a guest talks; in A2 they play it together. The loom keeps its own time underneath, ton, ton, karari, once every two bars.',
    key: 'D', mode: 'aeolian', bpm: 60, loopFrom: 1,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.44, rv: 0.5, pan: -0.2 },
      flute: { i: 'shakuhachi', o: 4, v: 0.38, rv: 0.55, pan: 0.2 },
      bass: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.18, rv: 0.35 },
      loom: { perc: true, v: 0.16, rv: 0.45 },
    },
    echo: { beats: 1, fb: 0.22, mix: 0.2 },
    all: { bass: '0 - - - 4 - - -', loom: 'w.w.c...|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '1 - - - 5, - - - | 1 - - - - - - -' },
      A: { bars: 8, ch: '1 4 6 7 1 4 7 1', koto: WEAVE },
      B: { bars: 8, ch: '1 4 6 7 1 4 7 1', flute: FORMAL },
      A2: { bars: 8, ch: '1 4 6 7 1 4 7 1', koto: WEAVE, flute: FORMAL, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== WING 10: THE HUNDREDTH TALE
  // The Hall's own tune, which has played in the foyer all along, told back: in A the koto plays it alone, plainly, as
  // a story begins; in B the shakuhachi remembers the road, as the foyer's B does; in A2 the koto and the biwa tell it
  // together over the held shō, and a single temple bell sounds once every eight bars, a lantern lit somewhere. The
  // weight is in the retelling, never in loudness or speed (C-22).
  S('hall_w10', {
    title: 'The Hundredth Tale',
    kind: 'area',
    motifs: ['road'],
    notes: 'Wing 10 of the Hall: the Hall itself long ago, and your own journey (D dorian, 64). The foyer\'s tune told back: the koto alone in A, the shakuhachi remembering the road in B, the koto and the biwa together over the shō in A2, with a single bell once every eight bars.',
    key: 'D', mode: 'dorian', bpm: 64, loopFrom: 1,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.46, rv: 0.55 },
      lead: { i: 'biwa', o: 3, v: 0.42, rv: 0.45 },
      flute: { i: 'shakuhachi', o: 4, v: 0.46, rv: 0.5 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.16, rv: 0.5 },
      bell: { perc: true, v: 0.16, rv: 0.7 },
    },
    echo: { beats: 1, fb: 0.25, mix: 0.25 },
    all: { bell: 'i.......|........|........|........|........|........|........|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', koto: '.:8 | . . . . 5 - - -' },
      A: { bars: 8, ch: '1 4 2 1 3 5 1 1', koto: HALL_A },
      B: { bars: 8, ch: '4 4 1 1 2 2 5 5', flute: '5, - 3 - 2 - 1 - | 2 - - - - - . . | 3 - 2 - 1 - 6, - | 1 - - - - - . . | 5, - 3 - 2 - 1 - | 2 - - - - - . . | 2 - - - 1 - - - | 1 - - - - - . .' },
      A2: { bars: 8, ch: '1 4 2 1 3 5 1 1', koto: HALL_A, lead: HALL_A, pad: '0+4', dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });
})(RB.audio);
