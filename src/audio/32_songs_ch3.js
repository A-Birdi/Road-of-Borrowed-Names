/* Chapter 3 — Cinder Orchard. The orchard road, the terraces and workshop
 * row, the battle and boss themes, the festival, and the cues for the night
 * of the fire and the village remembering it. The town and kiln themes are
 * re-orchestrated in place in 30_songs.js. Notation: see 30_songs.js.
 *
 * Intensity, one step up from Chapter 2: a festival kumi-daiko (ōdaiko,
 * shime, rim) in place of the harbour's light drums, shinobue on top, a
 * little faster — and the heat of the in-scale (phrygian) for the kiln. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const M = _.mat;
  function S(id, def) {
    def.id = id;
    def.chapter = 3;
    _.songDefs[id] = def;
  }

  // ========================================================== ORCHARD ROAD
  const COR_A = '5, - 3 - - 2 1 - | 2 - - - 5, - 6, - | 1 - 2 - 3 - 5 - | 6 - - - 5 - - - | 6 - 5 - 3 - 5 - | 2 - 3 - 1 - 7, - | 6, - 1 - 2 - 3 - | 2 - - - - - . .';
  const COR_A_CH = '1 7 4 4 6 5 4 5s4';
  const COR_C = '1 - - - 7, - 5, - | 6, - - - - - . . | 1 - - - 2 - 3 - | 2 - - - - - . . | 3 - - - 2 - 1 - | 7, - - - 6, - - - | 5, - 6, - 7, - 2 - | 1 - - - - - . .';
  const COR_C_CH = '1 6 1 7 3 4 5 1';

  S('co_road', {
    title: 'The Orchard Road',
    kind: 'area',
    motifs: ['road'],
    notes: 'Chapter 3 route (A mixolydian, 92): the slope up through the persimmon terraces, someone practising for the festival. The road motif opens a shinobue tune over a koto figure; A2 doubles it an octave down on shamisen, the min’yō way; B hands the Cinder Orchard tune to the koto with the shinobue answering — the village ahead; C turns to A minor on shakuhachi over a slow ōdaiko heartbeat — the fire nobody mentions.',
    key: 'A', mode: 'mixolydian', bpm: 92, loopFrom: 1,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.5, rv: 0.28 },
      sham: { i: 'shamisen', o: 4, v: 0.45, rv: 0.2, pan: -0.15 },
      koto: { i: 'koto', o: 4, v: 0.55, rv: 0.25, pan: 0.15 },
      hi: { i: 'shinobue', o: 4, v: 0.42, rv: 0.3, pan: 0.25 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.7, rv: 0.35 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.3, rv: 0.3, pan: -0.3 },
      strum: { i: 'shamisen', o: 4, pat: true, fold: 'all', win: -4, v: 0.3, rv: 0.15, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.28, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.62 },
      perc: { perc: true, v: 0.45 },
      bell: { perc: true, v: 0.3, rv: 0.35, pan: 0.3 },
    },
    all: { arp: "0 2 1' 2 0 2 1' 2", pad: M.TRI, bass: '0 . 0 2 . 0 2 .', perc: 'e..p.e.p|e..pe.p.' },
    sections: {
      intro: { bars: 2, ch: '1 7', bell: 'a.......|a.a.....', perc: null, bass: null },
      A: { bars: 8, ch: COR_A_CH, lead: COR_A },
      A2: { bars: 8, ch: COR_A_CH, lead: COR_A, sham: COR_A, bell: '....a...|........' },
      B: { bars: 8, ch: M.CIN_A_CH, koto: M.CIN_A, hi: M.CIN_A_CM, arp: null, strum: '0+1+2 . . 0+1+2 . . 0+1+2 .', bell: '..a...a.' },
      C: { bars: 8, mode: 'aeolian', ch: COR_C_CH, shaku: COR_C, arp: "0 2 4 2 1' 2 4 2", perc: 'z.......|........', dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ============================================== TERRACES AND WORKSHOP ROW
  const COT_A = "5 . 6 . 1' . 6 5 | 4 - - - . . . . | 5 . 6 . 1' . 2' 1' | 6 - - - . . . . | 4 . 5 . 6 . 5 4 | 3 - 4 - 5 - . . | 6 - 5 - 4 - 3 - | 2 - - - . . . .";
  const COT_A_CH = '1 4 1 4 4 3 6 5M';
  const COT_B_SH = '3 - - - - - - - | 5 - - - 6 - - - | 7 - - - - - - - | 6 - - - 5 - - - | 4 - - - 3 - - - | 2 - - - 1 - - - | 2 - - - - - - - | #7, - - - 2 - - -';
  const COT_B_KOTO = '.:8 | 5, - 3 - - 2 1 - | 2 - - - . . . . | .:8 | .:8 | 5, - . . 3 - . . | .:8 | .:8';
  const COT_B_CH = '6 6 4 4 1 1 5M 5M';

  S('co_terraces', {
    title: 'Ash on the Terraces',
    kind: 'area',
    motifs: ['road'],
    notes: 'Chapter 3 dungeon, the upper terraces and the old workshop row (B minor, 96): staccato koto questions over a shamisen walking figure, kotsuzumi "pon" and ōtsuzumi "kan" answering each other as in a noh play, a hyōshigi now and then. B is the half-remembered fire: a long shakuhachi line over a low biwa while the road motif comes through on koto in pieces; then the questions return on shamisen.',
    key: 'B', mode: 'aeolian', bpm: 96,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.6, rv: 0.25, pan: 0.1 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.68, rv: 0.4 },
      frag: { i: 'koto', o: 4, v: 0.45, rv: 0.45, dl: 0.3, pan: 0.3 },
      walk: { i: 'shamisen', o: 3, pat: true, bass: true, v: 0.42, rv: 0.1, pan: -0.2 },
      drone: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.4, rv: 0.35, pan: -0.1 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.35, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
      noh: { perc: true, v: 0.45, pan: -0.2 },
      clap: { perc: true, v: 0.3, rv: 0.3, pan: 0.3 },
    },
    echo: { beats: 0.75, fb: 0.3, mix: 0.25 },
    all: { walk: "0 . 2 . 1' . 2 .", pad: '0+1+3', bass: '0 - - - - - - -', noh: 'm.....q.|..m.....', clap: '........|........|........|.......y' },
    sections: {
      A: { bars: 8, ch: COT_A_CH, koto: COT_A },
      B: { bars: 8, ch: COT_B_CH, shaku: COT_B_SH, frag: COT_B_KOTO, walk: null, drone: '0 - - - - - - -', noh: 'm.......|....q...', clap: null, dyn: 0.9 },
    },
    form: ['A', 'B', { s: 'A', i: { koto: 'shamisen' } }, 'B'],
  });

  // ================================================================ BATTLE
  const BCI_A = '5, - 3 - - 2 1 - | 7, - - - - - . . | 5, - 3 - - 2 1 - | 2 - - - 3 - 5 - | 6 - 5 - 3 - 2 - | 3 - - - 1 - - - | 7, - 1 - 2 - 3 - | 5, - - - - - . .';
  const BCI_A_CH = '1 7 1 5 6 1 7 5';
  const BCI_B = '3 - - - 2 - 1 - | 5 - - - - - . . | 4 - - - 3 - 2 - | 1 - - - - - . . | 3 - - - 5 - 6 - | 5 - - - 3 - . . | 4 - 3 - 2 - 1 - | #7, - - - - - . .';
  const BCI_B_CH = '6 3 7 1 6 3 4 5M';
  const BCI_B_LOW = '6, - - - - - - - | 5, - - - - - - - | 5, - - - - - - - | 5, - - - - - - - | 6, - - - - - - - | 5, - - - - - - - | 6, - - - - - - - | #7, - - - - - - -';
  const BCI_C_LOW = '1 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - | 5 - - - - - - - | 4 - - - - - - - | 5 - - - - - - - | 5 - - - - - - -';
  const BCI_C_HI = '.:8 | .:8 | .:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - . . | .:8 | .:8';
  const BCI_C_CH = '1 2 1 2 6 7 5P 5P';

  S('battle_cinder', {
    title: 'Inkweaving — Festival Fire',
    kind: 'battle',
    motifs: ['road'],
    notes: 'Chapter 3 battle (A minor, 108). The 3+3+2 pulse becomes a small festival kumi-daiko: ōdaiko on the accents, shime-daiko filling the eighths, rim clicks; a shamisen ostinato and koto underneath. A: the road motif on shinobue; B: a lyrical shakuhachi line over a bowed pedal; C slips into A phrygian — the kiln’s half-step, heat rising — with a climbing bowed line, koto sixteenths and the road motif on shinobue; B2 gives the line to the shamisen.',
    key: 'A', mode: 'aeolian', bpm: 108, loopFrom: 1,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.5, rv: 0.25 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.7, rv: 0.25, pan: 0.1 },
      hi: { i: 'shinobue', o: 5, v: 0.45, rv: 0.3, pan: 0.2 },
      low: { i: 'bowed', o: 3, v: 0.58, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.4, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.28, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.34, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.68 },
      taiko: { perc: true, v: 0.55 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      rim: { perc: true, v: 0.4, pan: -0.25 },
    },
    all: {
      ost: "0 0' 2 0' 0 0' 2 4", arp: "0 2 1' 2 0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z..Z.|Z..z..Zz', shime: 'e.ee.ee.|e.ee.eee', rim: '.......f|...f...f',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ' },
      A: { bars: 8, ch: BCI_A_CH, lead: BCI_A },
      B: { bars: 8, ch: BCI_B_CH, shaku: BCI_B, low: BCI_B_LOW },
      C: { bars: 8, mode: 'phrygian', ch: BCI_C_CH, low: BCI_C_LOW, hi: BCI_C_HI, arp: { n: "0 2 1' 2", u: 0.25 }, taiko: 'Z..z..Z.|Z.zz.zZz' },
      B2: { bars: 8, ch: BCI_B_CH, shaku: BCI_B, low: BCI_B_LOW },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { shaku: 'shamisen' } }],
  });

  // ================================================================== BOSS
  const BOS3_RIFF = '1 2 1 5, 1 2 3 2 | 1 2 1 5, 4 3 2 1';
  const BOS3_A_CH = '1 2 1 2 2 7 2 2';
  const BOS3_HUSH = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const BOS3_A_KOTO = '.:8 | .:8 | .:8 | .:8 | 1 - - - 2 - - - | 3 - - - 2 - 1 - | 2 - - - - - - - | .:8';
  const BOS3_B = '5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - - -';
  const BOS3_B_CH = '1 2 1 7 6 4 1 2';
  const BOS3_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BOS3_C_TOLL = '.:8 | .:8 | 2 - - - - - - - | .:8 | .:8 | .:8 | 5, - - - - - - - | .:8';
  const BOS3_C_WATER = "1' 5 3 1 1' 5 3 1 | 2' 6 4 2 2' 6 4 2 | 1' 5 3 1 1' 5 3 1 | 2' 6 4 2 2' 6 4 2 | 1' 5 3 1 1' 5 3 1 | 1' 5 3 1 1' 5 3 1 | 5 3 1 5, 5 3 1 5, | 5 3 1 5, 5 3 1 5,";

  S('boss_cinder', {
    title: 'The Kiln Will Not Cool',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'Chapter 3 boss (D phrygian, 142). A low biwa riff that circles the half-step like the kiln theme, shamisen chords, ōdaiko and shime on 3+3+2 with chappa crashes and rim clicks, the ōtsuzumi "kan" on the backbeat. The Hush motif on glass over a held shō; koto answers with the kiln theme’s head; the road motif falls on shakuhachi against it. C is the answer to heat: half time, the bell tolls, a cold koto figure ripples downward like water poured on the coals; B2 puts the road and the Hush together on shinobue and glass.',
    key: 'D', mode: 'phrygian', bpm: 142, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.72, rv: 0.22 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 5, v: 0.52, rv: 0.3, pan: -0.2 },
      water: { i: 'koto', o: 5, v: 0.28, rv: 0.45, pan: 0.3 },
      toll: { i: 'toll', o: 3, v: 0.6, rv: 0.45 },
      riff: { i: 'biwa', o: 3, v: 0.55, rv: 0.12, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.32, rv: 0.1, pan: 0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.55, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.64 },
      taiko: { perc: true, v: 0.54 },
      shime: { perc: true, v: 0.36, pan: 0.15 },
      kan: { perc: true, v: 0.45, pan: -0.1 },
      crash: { perc: true, v: 0.38, rv: 0.3, pan: 0.3 },
    },
    all: {
      riff: BOS3_RIFF, ost: ". 0+2 . . . 0+2 . 0+1", bass: "0 0 0' 0 0 0 0' 0", sho: M.TRI,
      taiko: 'Z..z..Z.|Z..zZ.Zz', shime: 'eeEeeEee', kan: '....q..f|....q.qf',
      crash: 'v.......|........|........|........|v.......|........|........|........',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', sho: null, ost: null, kan: null, crash: null, taiko: 'Z..z..Z.|ZzZzZZZZ' },
      A: { bars: 8, ch: BOS3_A_CH, glass: BOS3_HUSH, koto: BOS3_A_KOTO },
      B: { bars: 8, ch: BOS3_B_CH, lead: BOS3_B },
      C: { bars: 8, ch: '6 6 2 2 6 6 5P 5P', glass: BOS3_C_GLASS, toll: BOS3_C_TOLL, water: BOS3_C_WATER, riff: null, taiko: 'Z.......|Z...z.z.', shime: 'e.e.e.e.', kan: 'q.q.q.q.', ost: "0 2 1' 2", dyn: 0.9 },
      B2: { bars: 8, ch: BOS3_B_CH, lead: BOS3_B, glass: BOS3_HUSH, taiko: 'Z..z..Z.|Z..zZzZZ' },
      A2: { bars: 8, ch: BOS3_A_CH, glass: BOS3_HUSH, koto: BOS3_A_KOTO },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'shinobue' } }, { s: 'A2', i: { riff: 'shamisen' }, o: { riff: 1 } }],
  });

  // ============================================================== FESTIVAL
  // matsuri-bayashi: shinobue over shime-daiko, ōdaiko and the atarigane's
  // "chan-chiki"; then the Cinder tune sung on shamisen and koto, and the
  // lanterns being lit.
  const COF_A = "5 - 6 - 1' - 6 5 | 6 - 1' - 2' - - - | 1' - 6 - 5 - 3 - | 5 - - - - - . . | 5 - 6 - 1' - 6 5 | 6 - 1' - 3' - 2' - | 1' - 6 - 5 - 6 - | 1' - - - - - . .";
  const COF_A_CH = '1 4 1 5 1 4 5 1';
  const COF_C = '3 - - - 2 - 1 - | 6, - - - - - - - | 1 - - - 2 - 3 - | 5 - - - - - - - | 6 - - - 5 - 3 - | 2 - - - 1 - - - | 2 - - - 3 - 2 - | 1 - - - - - - -';
  const COF_C_CH = '1 6 4 1 4 1 5 1';

  S('co_festival', {
    title: 'The Autumn Festival',
    kind: 'area',
    motifs: ['road'],
    notes: 'The Cinder Orchard festival night (A, 116), a matsuri-bayashi: a pentatonic shinobue tune over shime-daiko, ōdaiko and the atarigane’s chan-chiki, a hyōshigi to start. B is the Cinder Orchard tune sung on shamisen with koto chords and the road motif tucked into the shinobue’s answer; C is quieter — the thirty glass lanterns being lit, koto and shakuhachi with a rin, the drums resting — before the band comes back.',
    key: 'A', bpm: 116, loopFrom: 1,
    tracks: {
      fue: { i: 'shinobue', o: 5, v: 0.5, rv: 0.25 },
      sham: { i: 'shamisen', o: 4, v: 0.5, rv: 0.2, pan: -0.15 },
      ans: { i: 'shinobue', o: 4, v: 0.42, rv: 0.3, pan: 0.25 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.65, rv: 0.4 },
      koto: { i: 'koto', o: 4, pat: true, fold: 'all', win: -3, v: 0.32, rv: 0.25, pan: 0.2 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.3, rv: 0.35, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.26, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      shime: { perc: true, v: 0.42, pan: 0.15 },
      taiko: { perc: true, v: 0.5 },
      kane: { perc: true, v: 0.32, pan: -0.25 },
      bowl: { perc: true, v: 0.32, rv: 0.6, pan: 0.3 },
    },
    all: { bass: '0 . 2 . 0 . 2 .', pad: M.TRI, shime: 'e.eee.e.|e.eee.ee', taiko: 'z.......|z...z...', kane: 'a..aa..a' },
    sections: {
      intro: { bars: 2, ch: '1 1', shime: 'y.y.y...|e.e.eeee', taiko: '........|z.......', kane: null, bass: null },
      A: { bars: 8, ch: COF_A_CH, fue: COF_A, koto: '0+1+2 . . 0+1+2 . . 0+1+2 .' },
      B: { bars: 8, mode: 'mixolydian', ch: M.CIN_A_CH, sham: M.CIN_A, ans: M.CIN_A_CM, koto: '. . 0+1+2 . . . 0+1+2 .', kane: 'a...a...' },
      C: { bars: 8, ch: COF_C_CH, shaku: COF_C, arp: "0 2 1' 2 1' 2 0' 2", shime: null, taiko: null, kane: null, bowl: 'i.......|........|........|........', dyn: 0.85 },
      A2: { bars: 8, ch: COF_A_CH, fue: COF_A, sham: COF_A, koto: '0+1+2 . . 0+1+2 . . 0+1+2 .', taiko: 'z...z...|z.z.z...' },
      R: { bars: 8, ch: M.ROAD_A_CH, key: 'A', fue: M.ROAD_A, koto: '. . 0+1+2 . . . 0+1+2 .', kane: 'a...a...' },
    },
    form: ['intro', 'A', 'B', 'C', 'A2', { s: 'R', dyn: 0.95 }],
  });

  // ============================================================ STORY CUES
  // The kiln's last page: the night of the fire, twenty years ago.
  const COFI_A = '5 - - - - - 3 - | 2 - 1 - 7, - - - | 1 - - - 2 - 3 - | 2 - - - - - . . | 5 - - - 6 - 5 - | 3 - - - 2 - 1 - | 7, - 1 - 2 - 3 - | 1 - - - - - . .';
  const COFI_A_CH = '1 7 6 5 1 4 5M 1';
  const COFI_B = '5, - 1 - 2 - 3 - | 4 - - - 3 - 2 - | 3 - - - - - . . | .:8 | 5, - 1 - 2 - 3 - | 5 - - - 4 - 3 - | 2 - - - - - - - | .:8';
  const COFI_B_CH = '6 6 4 4 6 6 5M 5M';

  S('co_fire', {
    title: 'The Kiln’s Last Page',
    kind: 'scene',
    motifs: [],
    notes: 'Cue (A minor, 72) for the vision on the kiln’s last page: the night of the fire, heard rather than seen. A shakuhachi line with sharp breath accents (muraiki) over trembling koto and a biwa that strikes and buzzes; ōdaiko rolls swell and fall back like a fire catching in the wind. B is the woman going up to open the water gate: the line climbs and holds while the drums thin to a heartbeat.',
    key: 'A', mode: 'aeolian', bpm: 72,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.72, rv: 0.4 },
      trem: { i: 'koto', o: 4, pat: true, u: 0.25, v: 0.24, rv: 0.4, pan: 0.25 },
      biwa: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.45, rv: 0.35, pan: -0.2 },
      low: { i: 'bowed', o: 3, pat: true, bass: true, v: 0.4, rv: 0.4 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.38, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
      roll: { perc: true, v: 0.45, rv: 0.3 },
    },
    all: { trem: '0 2 0 2', biwa: '0 . . . 0 . 2 .', low: '0 - - - - - - -', pad: '0+1+2', bass: '0 - - - - - - -', roll: 'z.......|z...z.zz|z.......|zzzzZ.Z.' },
    sections: {
      A: { bars: 8, ch: COFI_A_CH, lead: COFI_A, low: null },
      B: { bars: 8, ch: COFI_B_CH, lead: COFI_B, trem: '0 1 2 1', roll: 'z.......|....z...', dyn: 0.9 },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'bowed' } }],
  });

  // The assembly at dusk: the village remembers, together.
  const COAS_A = "3 - - - 2 - 1 - | 6, - - - - - . . | 1 - - - 2 - 3 - | 5 - - - - - . . | 6 - - - 5 - 3 - | 2 - - - 3 - 5 - | 3 - - - 2 - - - | 1 - - - - - . .";
  const COAS_A_CH = '1 4 6 3 4 1 5s4 1';
  const COAS_B = "5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 6, - - - 5, - - - | 6, - 1 - 2 - 3 - | 5 - - - 3 - 2 - | 1 - - - 2 - - - | 1 - - - - - . .";
  const COAS_B_CH = '1 5 1 4 6 3 4 1';

  S('co_assembly', {
    title: 'What the Village Remembers',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (F, 60) for the dusk assembly where the village remembers the fire together, and the square that evening. A slow koto and bowed hymn, shakuhachi above, a held shō; nothing hurried. B carries the road motif, heard as consolation rather than as a march, and the rin sounds once at each phrase.',
    key: 'F', bpm: 60,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.68, rv: 0.45 },
      koto: { i: 'koto', o: 4, v: 0.5, rv: 0.45, pan: 0.2 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.28, rv: 0.45, pan: -0.25 },
      low: { i: 'bowed', o: 3, pat: true, bass: true, v: 0.4, rv: 0.45, pan: -0.1 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.45, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.42 },
      bowl: { perc: true, v: 0.3, rv: 0.6, pan: 0.3 },
    },
    all: { arp: "0 . 2 . 1' . 2 .", low: '0 - - - - - - -', sho: M.TRI, bass: '0 - - - - - - -', bowl: 'i.......|........|........|........' },
    sections: {
      A: { bars: 8, ch: COAS_A_CH, koto: COAS_A, low: null },
      B: { bars: 8, ch: COAS_B_CH, lead: COAS_B },
      A2: { bars: 8, ch: COAS_A_CH, lead: COAS_A, koto: '.:8 | . . . . 5 - 6 - | .:8 | . . . . 1 - 2 - | .:8 | . . . . 6 - 5 - | .:8 | .:8' },
    },
    form: ['A', 'B', 'A2'],
  });

  _.REQUIRED_SONGS.push('co_road', 'co_terraces', 'battle_cinder', 'boss_cinder', 'co_festival', 'co_fire', 'co_assembly');
})(RB.audio);
