/* The last chapter's road in a twelve-chapter journey (expansion P14; 10_STORY.md §6a, sealed S15): the score thins as
 * the party climbs. The Archive road keeps its own tune (sa_road's A, the road motif) with the ensemble taken away a
 * layer at a time, the last return in fragments; at the gate and in the Reading Room only a low drone and a held shō
 * remain, with the road motif far down on the koto and the Hush motif once on glass. Inside, the Archive's own themes
 * play as they always have. Six-chapter journeys hear nothing new. Notation: see 30_songs.js. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 12;
    def.edition = 2;
    _.songDefs[id] = def;
  }

  // ================================================================== THE ROAD, THINNING
  // sa_road's tune (B minor) slowed to 88: the shakuhachi over a biwa drone and a held shō; no drums, no arpeggio. B is
  // the Archive's order on glass (the Hush motif), the koto gone; the last A keeps only the first bar of each pair.
  const SAR_A = '5, - 3 - - 2 1 - | 2 - - - 4 - 3 - | 2 - - - 1 - 7, - | 1 - - - - - . . | 3 - - - 5 - 6 - | 5 - - - 3 - 2 - | 1 - - - 2 - 3 - | 2 - - - - - . .';
  const SAR_A_CH = '1 7 5 1 3 4 6 5';
  const THIN = '5, - 3 - - 2 1 - | .:8 | 2 - - - 1 - 7, - | .:8 | 3 - - - 5 - 6 - | .:8 | 1 - - - 2 - 3 - | .:8';
  const GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - 3 - - - | 2 - - - - - - - | .:8';
  S('sa_thin', {
    title: 'The Archive Road, Thinning',
    kind: 'area',
    motifs: ['road', 'hush'],
    notes: 'The last climb in a twelve-chapter journey (B minor, 88): the Archive road\'s own tune on shakuhachi, over a biwa drone and a held shō, with the drums, the shamisen and the koto arpeggio taken away. B sets the Hush motif on glass with nothing under it but the drone; the last A keeps only every other bar of the tune, the rest left silent.',
    key: 'B', mode: 'aeolian', bpm: 88, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.62, rv: 0.4 },
      glass: { i: 'glass', o: 5, v: 0.7, rv: 0.6, pan: -0.15 },
      drone: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.3, rv: 0.35 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.22, rv: 0.5 },
    },
    echo: { beats: 0.75, fb: 0.3, mix: 0.3 },
    all: { drone: '0 - - - - - - -', pad: '0+4' },
    sections: {
      intro: { bars: 2, ch: '1 1', lead: '1 - - - - - - - | 7, - - - 5, - - -' },
      A: { bars: 8, ch: SAR_A_CH, lead: SAR_A },
      B: { bars: 8, ch: '1 1 1 1 1 1 1 1', glass: GLASS, pad: '0' },
      A2: { bars: 8, ch: SAR_A_CH, lead: THIN, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== UNDER THE ARCHIVE
  // B minor, 60: a bowed drone and a held shō; the road motif far down on the koto, twice in eight bars; the Hush motif
  // once on glass; nothing keeps time.
  const LOW = '5, - 3 - 2 - 1 - | 2 - - - - - - - | .:8 | .:8 | 5, - 3 - 2 - 1 - | 2 - - - - - - - | .:8 | .:8';
  const HUSH = '.:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  S('sa_drone', {
    title: 'Under the Archive',
    kind: 'area',
    motifs: ['road', 'hush'],
    notes: 'The Archive\'s gate and its Reading Room in a twelve-chapter journey, before the Hush is settled (B minor, 60): the score thinned to a bowed drone and a held shō. Under it the road motif, the game\'s main theme, far down on the koto, twice in eight bars; in B the Hush motif once on glass, and the koto answers it with the road motif. Nothing keeps time.',
    key: 'B', mode: 'aeolian', bpm: 60, loopFrom: 1,
    tracks: {
      low: { i: 'koto', o: 3, v: 0.46, rv: 0.6, dl: 0.3 },
      glass: { i: 'glass', o: 5, v: 0.6, rv: 0.65, pan: 0.2 },
      bow: { i: 'bowed', o: 2, hold: true, v: 0.24, rv: 0.5 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.18, rv: 0.55 },
    },
    all: { bow: '0', pad: '0+4' },
    sections: {
      intro: { bars: 2, ch: '1 1' },
      A: { bars: 8, ch: '1 1 1 1 1 1 1 1', low: LOW },
      B: { bars: 8, ch: '1 1 1 1 1 1 1 1', glass: HUSH, low: '.:8 | .:8 | .:8 | .:8 | 5, - 3 - 2 - 1 - | 2 - - - - - - - | .:8 | .:8' },
      A2: { bars: 8, ch: '1 1 1 1 1 1 1 1', low: LOW, dyn: 0.8 },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });
})(RB.audio);
