/* The Unwritten Atlas (post-game expeditions): its own battle and boss
 * themes in the Atlas theme's restless 7/8 (2+2+3), for the whole ensemble
 * the journey gathered. Notation: see 30_songs.js. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const M = _.mat;
  function S(id, def) {
    def.id = id;
    def.chapter = 7;
    _.songDefs[id] = def;
  }

  // ================================================================ BATTLE
  const BAT7_GLASS = '5, - 1 - 2 - 3 | 4 - - - - - - | .:7 | .:7 | 5, - 1 - 2 - 3 | 4 - - - - - - | .:7 | .:7';
  const BAT7_HI = '.:7 | .:7 | 5, - 3 - 2 1 - | 2 - - - - - - | .:7 | .:7 | .:7 | .:7';

  S('battle_atlas', {
    title: 'Inkweaving — Unwritten',
    kind: 'battle',
    motifs: ['road', 'hush'],
    notes: 'Atlas battle (A mixolydian, 7/8 in 2+2+3, 112): the Atlas tune — the road motif re-cut to an uneven stride — on shakuhachi over a shamisen ostinato and the taiko in 2+2+3; B is the Atlas’s climbing strain on koto; C is an unwritten place where the Hush has been: A lydian over open fifths with the raised fourth held inside them, the Hush motif on glass and the road motif thrown back on shinobue; then the shamisen takes the tune and the drums break for two bars before the loop.',
    key: 'A', mode: 'mixolydian', bpm: 112, meter: 3.5, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.25 },
      koto: { i: 'koto', o: 4, v: 0.5, rv: 0.28, pan: 0.2 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.4, pan: 0.2 },
      hi: { i: 'shinobue', o: 5, v: 0.45, rv: 0.3, pan: -0.2 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.36, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.26, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.64 },
      taiko: { perc: true, v: 0.52 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      noh: { perc: true, v: 0.38, pan: -0.25 },
    },
    all: {
      ost: "0 2 0' 2 0 2 4", arp: "0 2 1' 2 0 2 1'", bass: '0 - 0 - 2 - -', pad: '0+1+2+4',
      taiko: 'Z.z.Z..|Z.z.Zzz', shime: 'e.e.eee|eeeeEee', noh: '.......|..m...q',
    },
    sections: {
      intro: { bars: 2, ch: '1 7', pad: null, arp: null },
      A: { bars: 8, ch: M.ATL_A_CH, lead: M.ATL_A },
      B: { bars: 8, ch: M.ATL_C_CH, koto: M.ATL_C },
      C: { bars: 8, mode: 'lydian', ch: '1P 1P 2P 2P 1P 1P 2P 1P', glass: BAT7_GLASS, hi: BAT7_HI, arp: '0 2 1 2 0 2 1', pad: '0+b2+2', taiko: 'Z.z.Z..|Z.zzZzz' },
      A2: { bars: 8, ch: M.ATL_A_CH, lead: M.ATL_A },
      X: { bars: 2, ch: '1 7', ost: null, arp: null, pad: null, taiko: 'Z.z.Z..|ZzZzZZZ', shime: 'eeeeeee|eEeEeEe' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A2', i: { lead: 'shamisen' } }, 'X'],
  });

  // ================================================================== BOSS
  const BOS7_RIFF = '1 2 1 5, 1 2 4 | 1 2 1 5, 4 2 1';
  const BOS7_HUSH = '5, - 1 - 2 - 3 | 4 - - - - - - | .:7 | .:7 | 5, - 1 - 2 - 3 | 4 - - - - - - | .:7 | .:7';
  const BOS7_KOTO = '.:7 | .:7 | 3 - 2 - 1 - - | 2 - - - - - - | .:7 | .:7 | 3 - 2 - 1 - 7, | 1 - - - - - -';
  const BOS7_A_CH = '1 2 1 2 1 2 6 7';
  const BOS7_B = '5, - 3 - 2 1 - | 2 - - - - - - | 5, - 3 - 2 1 - | 7, - - - - - - | 1 - 3 - 5 - 6 | 5 - 4 - 3 - 2 | 3 - - - 1 - - | 2 - - - - - -';
  const BOS7_B_CH = '1 2 1 7 6 4 1 2';
  const BOS7_C_FALL = '5 4 2 1 5 4 2 | 6 5 4 2 6 5 4 | 5 4 2 1 5 4 2 | 6 5 4 2 6 5 4 | 5 4 2 1 5 4 2 | 5 4 2 1 5 4 2 | 4 2 1 5, 4 2 1 | 4 2 1 5, 4 2 1';

  S('boss_atlas', {
    title: 'The Map Unmade',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'Atlas boss (A phrygian, 7/8 in 2+2+3, 138): a biwa riff limping in sevens, shamisen chords, ōdaiko and shime-daiko with the ōtsuzumi "kan" and chappa. The Hush motif on glass, answered on koto; the road motif falls on shakuhachi in B and on shinobue with the Hush in B2. C pulls back: the bell tolls and a koto line falls in sevens like a road unravelling.',
    key: 'A', mode: 'phrygian', bpm: 138, meter: 3.5, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.72, rv: 0.22 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 5, v: 0.52, rv: 0.3, pan: -0.2 },
      fall: { i: 'koto', o: 4, v: 0.3, rv: 0.45, pan: 0.3 },
      toll: { i: 'toll', o: 3, v: 0.58, rv: 0.45 },
      riff: { i: 'biwa', o: 3, v: 0.52, rv: 0.12, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.3, rv: 0.1, pan: 0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.52, rv: 0.35 },
      bass: { i: 'bass', o: 1, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.55 },
      shime: { perc: true, v: 0.34, pan: 0.15 },
      kan: { perc: true, v: 0.42, pan: -0.1 },
      crash: { perc: true, v: 0.34, rv: 0.3, pan: 0.3 },
    },
    all: {
      riff: BOS7_RIFF, ost: '. 0+2 . . 0+2 . .', bass: "0 0 0' 0 0 0' 0", sho: M.TRI,
      taiko: 'Z.z.Z..|Z.z.Zzz', shime: 'eeEeEee', kan: '..q...q|..q..qq', crash: 'v......|.......|.......|.......',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', sho: null, ost: null, kan: null, crash: null, taiko: 'Z.z.Z..|ZzZzZZZ' },
      A: { bars: 8, ch: BOS7_A_CH, glass: BOS7_HUSH, koto: BOS7_KOTO },
      B: { bars: 8, ch: BOS7_B_CH, lead: BOS7_B },
      C: { bars: 8, ch: '6 6 2 2 6 6 5P 5P', glass: BOS7_HUSH, toll: '.:7 | .:7 | 2 - - - - - - | .:7 | .:7 | .:7 | 5, - - - - - - | .:7', fall: BOS7_C_FALL, riff: null, taiko: 'Z......|Z...z..', shime: 'e.e.e..', kan: 'q.q.q..', dyn: 0.9 },
      B2: { bars: 8, ch: BOS7_B_CH, lead: BOS7_B, glass: BOS7_HUSH },
      A2: { bars: 8, ch: BOS7_A_CH, glass: BOS7_HUSH, koto: BOS7_KOTO },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'shinobue' } }, { s: 'A2', i: { riff: 'shamisen' }, o: { riff: 1 } }],
  });

  _.REQUIRED_SONGS.push('battle_atlas', 'boss_atlas');
})(RB.audio);
