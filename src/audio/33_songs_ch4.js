/* Chapter 4 — Snowbell. The snow road, the battle and boss themes and the
 * cues for the blizzard at the inn, the snowed-in night and the lamp being
 * lit. The hamlet and observatory themes are re-orchestrated in place in
 * 30_songs.js. Notation: see 30_songs.js.
 *
 * Intensity, one step up from Chapter 3 — but cold rather than hot: a
 * faster, busier battle with noh drums (kotsuzumi "pon", ōtsuzumi "kan")
 * answering the taiko, koto in the high register like ice, and a boss
 * that swirls; the cues stay quiet, as a snowed-in hamlet is. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const M = _.mat;
  function S(id, def) {
    def.id = id;
    def.chapter = 4;
    _.songDefs[id] = def;
  }

  // ============================================================= SNOW ROAD
  const SBR_A = '5, - 3 - - 2 1 - | 2 - - - - - . . | 1 - 2 - 3 - 5 - | 4 - - - 3 - - - | 5 - 6 - 5 - 3 - | 2 - - - 1 - - - | 7, - 1 - 2 - 3 - | 1 - - - - - . .';
  const SBR_A_CH = '1 7 1 4 6 5 7 1';
  const SBR_C = '1 - - - - - 2 - | 1 - - - - - . . | 4 - - - 3 - 2 - | 1 - - - - - . . | 5 - - - 4 - 3 - | 2 - - - 1 - - - | 7, - 1 - 2 - 1 - | 1 - - - - - . .';
  const SBR_C_CH = '1 2 1 2 6 7 1 1';

  S('sb_road', {
    title: 'The Snowbell Road',
    kind: 'area',
    motifs: ['road'],
    notes: 'Chapter 4 route (D minor, 96): the climb into the snow. A trudging koto ostinato under a shakuhachi tune that opens with the road motif; small bells shake now and then. B turns to 3/4 and F major — the Snowbell waltz drifting down from the hamlet on koto; C is the wind on the pass, D phrygian, the shakuhachi bending and breathing over ōdaiko rumbles; then koto and shakuhachi share the tune.',
    key: 'D', mode: 'aeolian', bpm: 96, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.68, rv: 0.4 },
      koto: { i: 'koto', o: 5, v: 0.5, rv: 0.35, pan: 0.15 },
      waltz: { i: 'koto', o: 4, v: 0.55, rv: 0.4, pan: -0.1 },
      ost: { i: 'koto', o: 3, pat: true, v: 0.28, rv: 0.3, pan: -0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.58 },
      perc: { perc: true, v: 0.42 },
      bells: { perc: true, v: 0.35, rv: 0.5, pan: 0.35 },
    },
    all: { ost: "0 . 2 0' . 2 0' 2", pad: '0+2+4', bass: '0 - - - 2, - - -', perc: 'p...e...|p...e.p.', bells: 'j.......|........|........|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', lead: '1 - - - - - - - | 2 - - - 1 - - -', perc: null, bass: null },
      A: { bars: 8, ch: SBR_A_CH, lead: SBR_A },
      B: { bars: 8, key: 'F', mode: 'ionian', meter: 3, ch: M.SNOW_A_CH, waltz: M.SNOW_A, ost: "0 2 1' 2 1' 2", pad: M.TRI, bass: '0 - - - - -', perc: 'p.....|p...p.', bells: 'j.....|......|......|......' },
      C: { bars: 8, mode: 'phrygian', ch: SBR_C_CH, lead: SBR_C, ost: '0 2 0 2 0 2 0 2', perc: 'z.......|........|z.......|....z...', dyn: 0.9 },
      A2: { bars: 8, ch: SBR_A_CH, koto: SBR_A, lead: '1 - - - - - - - | 7, - - - - - - - | 1 - - - - - - - | 2 - - - 1 - - - | 3 - - - - - - - | 2 - - - - - - - | 2 - - - - - - - | 1 - - - - - - -' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A2', o: { lead: -1 } }],
  });

  // ================================================================ BATTLE
  const BSB_A = '1 - 5, - 1 - 3 - | 2 - - - 1 - 7, - | 1 - - - - - . . | 5, - 3 - - 2 1 - | 2 - 3 - 5 - 3 - | 2 - - - 1 - - - | 7, - 6, - 7, - 2 - | 1 - - - - - . .';
  const BSB_A_CH = '1 7 1 6 4 7 6 1';
  const BSB_B = "3 - 5 - 1' - 7 - | 5 - - - - - . . | 4 - 6 - 5 - 4 - | 3 - - - - - . . | 3 - 5 - 1' - 2' - | 1' - 7 - 5 - - - | 4 - 3 - 2 - 1 - | #7, - - - - - . .";
  const BSB_B_CH = '6 3 4 1 6 3 4 5M';
  const BSB_B_LOW = '6, - - - - - - - | 5, - - - - - - - | 4, - - - - - - - | 3, - - - - - - - | 6, - - - - - - - | 5, - - - - - - - | 4, - - - - - - - | 5, - - - - - - -';
  const BSB_C_LOW = '5 - - - - - - - | 4 - - - - - - - | 3 - - - - - - - | 2 - - - - - - - | 1 - - - - - - - | 2 - - - - - - - | 5 - - - - - - - | 5 - - - - - - -';
  const BSB_C_HI = '5,! - 3 - - 2 1 - | 2! - - - - - . . | .:8 | .:8 | 5,! - 3 - - 2 1 - | 2 - - - - - . . | .:8 | .:8';
  const BSB_C_CH = '1 2 1 2 6 7 5P 5P';

  S('battle_snowbell', {
    title: 'Inkweaving — Frost',
    kind: 'battle',
    motifs: ['road'],
    notes: 'Chapter 4 battle (F-sharp minor, 112). The 3+3+2 pulse on ōdaiko and a busier shime-daiko, with the noh drums — kotsuzumi "pon" and ōtsuzumi "kan" — calling across it; a shamisen ostinato and koto eighths. A: a new shakuhachi tune that turns into the road motif; B: koto high in its register, like ice, over a falling bowed bass; C: F-sharp phrygian, the pad a frozen in-scale cluster (root, flat second, fifth), a slow bowed line under koto sixteenths while a second shakuhachi throws the road motif out with hard breath accents; B2 hands the ice tune to the shamisen.',
    key: 'F#', mode: 'aeolian', bpm: 112, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.68, rv: 0.25 },
      koto: { i: 'koto', o: 5, v: 0.5, rv: 0.3, pan: 0.2 },
      hi: { i: 'shakuhachi', o: 5, v: 0.55, rv: 0.3, pan: 0.15 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.38, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.26, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.55 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      noh: { perc: true, v: 0.42, pan: -0.25 },
    },
    all: {
      ost: "0 0' 2 0' 4 0' 2 0'", arp: "0 2 1' 2 0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z..Z.|Z..z.zZz', shime: 'e.ee.ee.|eeee.eee', noh: 'm.....q.|..m.q...',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ', noh: 'q.....q.|q.q.q...' },
      A: { bars: 8, ch: BSB_A_CH, lead: BSB_A },
      B: { bars: 8, ch: BSB_B_CH, koto: BSB_B, low: BSB_B_LOW },
      C: { bars: 8, mode: 'phrygian', ch: BSB_C_CH, low: BSB_C_LOW, hi: BSB_C_HI, arp: { n: "0 2 1' 2", u: 0.25 }, pad: '0+2+b4', taiko: 'Z..z..Z.|Z.zz.zZz' },
      B2: { bars: 8, ch: BSB_B_CH, koto: BSB_B, low: BSB_B_LOW, arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { koto: 'shamisen' }, o: { koto: -1 } }],
  });

  // ================================================================== BOSS
  const BOS4_RIFF = '1 2 5 2 1 2 5 2 | 1 2 6 5 4 2 1 5,';
  const BOS4_A_CH = '1 2 1 2 6 7 2 2';
  const BOS4_HUSH = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const BOS4_A_SH = '.:8 | .:8 | .:8 | .:8 | 3 - - - 5 - - - | 3 - - - 4 - 3 - | 2 - - - - - - - | .:8';
  const BOS4_B = '5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - - -';
  const BOS4_B_CH = '1 2 1 7 6 4 1 2';
  const BOS4_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BOS4_C_SNOW = "5 4 2 1 5 4 2 1 | 6 5 4 2 6 5 4 2 | 5 4 2 1 5 4 2 1 | 6 5 4 2 6 5 4 2 | 5 4 2 1 5 4 2 1 | 5 4 2 1 5 4 2 1 | 4 2 1 5, 4 2 1 5, | 4 2 1 5, 4 2 1 5,";

  S('boss_snowbell', {
    title: 'A Light Kept Waiting',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'Chapter 4 boss (B phrygian, 144): something lonely rather than cruel. An icy koto riff in eighths circling the half-step, a low biwa striking the 3+3+2 accents, shamisen chords off the beat, ōdaiko and shime-daiko with the ōtsuzumi "kan" on the backbeat, chappa and a rin like a bell left out in the cold. The Hush motif on glass over a held shō; a shakuhachi answers; the road motif falls on shakuhachi in B and on shinobue with the Hush in B2. C is snow: half time, the koto falling in steady eighths, the stamps even, the bell tolling.',
    key: 'B', mode: 'phrygian', bpm: 144, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.72, rv: 0.25 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.45, pan: 0.2 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.55, rv: 0.4, pan: -0.25 },
      snow: { i: 'koto', o: 5, v: 0.3, rv: 0.45, pan: 0.3 },
      toll: { i: 'toll', o: 3, v: 0.6, rv: 0.45 },
      riff: { i: 'koto', o: 4, v: 0.4, rv: 0.2, pan: -0.15 },
      strike: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.45, rv: 0.2, pan: -0.1 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.3, rv: 0.1, pan: 0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.55, rv: 0.35 },
      bass: { i: 'bass', o: 1, pat: true, bass: true, v: 0.7 },
      taiko: { perc: true, v: 0.6 },
      shime: { perc: true, v: 0.36, pan: 0.15 },
      kan: { perc: true, v: 0.45, pan: -0.1 },
      bell: { perc: true, v: 0.35, rv: 0.45, pan: 0.3 },
    },
    all: {
      riff: BOS4_RIFF, strike: '0 . . . . . 0 .', ost: '. . . . . 0+2 . .', bass: "0 0 0' 0 0 0 0' 0", sho: M.TRI,
      taiko: 'Z..z..Z.|Z.zzZ.Zz', shime: 'eeEeeEee', kan: '....q..q|....q.qq',
      bell: 'i.......|........|v.......|........',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', sho: null, ost: null, kan: null, bell: 'i.......|........', taiko: 'Z..z..Z.|ZzZzZZZZ' },
      A: { bars: 8, ch: BOS4_A_CH, glass: BOS4_HUSH, shaku: BOS4_A_SH },
      B: { bars: 8, ch: BOS4_B_CH, lead: BOS4_B },
      C: { bars: 8, ch: '6 6 2 2 6 6 5P 5P', glass: BOS4_C_GLASS, toll: '.:8 | .:8 | 2 - - - - - - - | .:8 | .:8 | .:8 | 5, - - - - - - - | .:8', snow: BOS4_C_SNOW, riff: null, strike: '0 - - - - - - -', taiko: 'Z.......|Z...z.z.', shime: 'e.e.e.e.', kan: 'q.q.q.q.', dyn: 0.9 },
      B2: { bars: 8, ch: BOS4_B_CH, lead: BOS4_B, glass: BOS4_HUSH, taiko: 'Z..z..Z.|Z..zZzZZ' },
      A2: { bars: 8, ch: BOS4_A_CH, glass: BOS4_HUSH, shaku: BOS4_A_SH },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'shinobue' }, o: { lead: 1 } }, { s: 'A2', i: { riff: 'shamisen' } }],
  });

  // ============================================================ STORY CUES
  // The blizzard: the village round the hearth at the inn.
  const SBZ_A = '1 - - - - - - - | 2 - - - 1 - - - | 7, - - - - - - - | 1 - - - - - . . | 3 - - - - - 2 - | 1 - - - 7, - - - | 1 - - - 2 - 3 - | 2 - - - - - . .';
  const SBZ_A_CH = '1 7 6 1 3 7 1 5';
  S('sb_blizzard', {
    title: 'Blizzard at Yukimiya',
    kind: 'scene',
    motifs: [],
    notes: 'Cue (A minor, 66) for the storm, with the village gathered round the inn’s hearth. Shakuhachi long tones bent in from below and pushed with breath, like wind round the eaves; a low koto murmur and a biwa now and then; soft ōdaiko rumbles. Warmth only in the held shō.',
    key: 'A', mode: 'aeolian', bpm: 66,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.68, rv: 0.5 },
      mur: { i: 'koto', o: 3, pat: true, v: 0.26, rv: 0.45, pan: -0.25 },
      biwa: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.38, rv: 0.4, pan: 0.2 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.42, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      wind: { perc: true, v: 0.32, rv: 0.5 },
    },
    all: { mur: '0 2 0 2 1 2 0 2', biwa: '0 - - - - - - - | . . . . . . . .', sho: '0+2+4', bass: '0 - - - - - - -', wind: 'z.......|........|....z...|........' },
    sections: {
      A: { bars: 8, ch: SBZ_A_CH, lead: SBZ_A },
      B: { bars: 8, ch: SBZ_A_CH, lead: SBZ_A, mur: '0 1 2 1 0 1 2 1', dyn: 0.9 },
    },
    form: ['A', { s: 'B', o: { lead: 1 } }],
  });

  // The snowed-in night: two travellers, two futons, snow light.
  const SBN_A = '3 - - - 2 1 | 2 - - - 6, - | 1 - - - - - | 5, - - - - - | 3 - - - 5 - | 6 - - - 5 3 | 2 - - - 3 - | 1 - - - - -';
  const SBN_A_CH = '1 2 4 5 1 4 5 1';
  const SBN_B = '6 - - - 5 - | 3 - - - 2 - | 1 - - - 2 - | 3 - - - - - | 5, - 3 - 2 1 | 2 - - - - - | 6, - 1 - 2 - | 1 - - - - -';
  const SBN_B_CH = '6 3 4 1 1 5 4 1';
  S('sb_snowlight', {
    title: 'Snow Light',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (F, 3/4, 58) for the snowed-in night upstairs at the inn, the two travellers talking in the dark. Koto alone, then shakuhachi, very quiet, with a held shō like the warmth coming up from the hearth below; B carries the road motif as a lullaby.',
    key: 'F', bpm: 58, meter: 3,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.5, rv: 0.5, pan: 0.15 },
      lead: { i: 'shakuhachi', o: 4, v: 0.62, rv: 0.5 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.24, rv: 0.5, pan: -0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.38, rv: 0.55 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.38 },
    },
    all: { arp: "0 2 1' 2 0 .", sho: M.TRI, bass: '0 - - - - -' },
    sections: {
      A: { bars: 8, ch: SBN_A_CH, koto: SBN_A },
      B: { bars: 8, ch: SBN_B_CH, lead: SBN_B },
      A2: { bars: 8, ch: SBN_A_CH, lead: SBN_A, koto: '. . . . . . | . . . . 5 - | . . . . . . | . . . . 3 - | . . . . . . | . . . . 1\' - | . . . . . . | . . . . . .' },
    },
    form: ['A', 'B', 'A2', 'B'],
  });

  // The observatory lamp lit again; the evening it shines over the hamlet.
  S('sb_lamp', {
    title: 'The Lamp on the Mountain',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Cue (F lydian, 3/4, 76) for the observatory lamp being lit and the evening it shines over Snowbell. The Snowbell waltz on koto lifted into lydian with small bells and rin; then the road motif on shakuhachi over a held shō — the light reaching the valley.',
    key: 'F', mode: 'lydian', bpm: 76, meter: 3,
    tracks: {
      koto: { i: 'koto', o: 5, v: 0.5, rv: 0.45, pan: 0.15 },
      lead: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.45 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.26, rv: 0.45, pan: -0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.4, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
      bells: { perc: true, v: 0.35, rv: 0.55, pan: 0.3 },
    },
    all: { arp: "0 2 1' 2 1' 2", sho: M.TRI, bass: '0 - - - - -', bells: 'j.....|......|i.....|......' },
    sections: {
      A: { bars: 8, ch: M.SNOW_A_CH, koto: M.SNOW_A },
      B: { bars: 8, mode: 'ionian', ch: M.SNOW_C_CH, lead: M.SNOW_C, sho: '0+1+2+4' },
    },
    form: ['A', 'B', 'A'],
  });

  _.REQUIRED_SONGS.push('sb_road', 'battle_snowbell', 'boss_snowbell', 'sb_blizzard', 'sb_snowlight', 'sb_lamp');
})(RB.audio);
