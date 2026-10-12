/* Steamhollow, Chapter 11 of the twelve-chapter edition (expansion P13; plan 07_REGIONS.md R3 "Theme": relaxed koto and
 * shamisen; the hollow sound of wooden sandals on stone; a deep drone for the vents): the valley's lively ensemble, its
 * evenings, the Steam Vents, the Kettle Below, the chapter's battle theme and the north road out of the valley.
 * Notation: see 30_songs.js.
 *
 * Every one quotes the steam motif (rising from the water, curling over and settling: 5 6 1' 6 5 3). The town keeps
 * the hyōshigi clack of geta on stone off the beat; under the town only the drone and the drip. In the twelve-chapter
 * ladder (C-22) the battle and boss themes sit a step above the Cloudroad's (Chapter 10) and below the Archive's
 * (tests/unit/audio_zones.test.mjs). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 11;
    _.songDefs[id] = def;
  }
  // the steam motif: rising off the water, curling over, settling back
  _.motifs.yu = { deg: '5 6 1\' 6 5 3', notes: 'Steamhollow: steam rising off the water, curling over and settling back.' };
  const YU = "5 - 6 - 1' - 6 - | 5 - 3 - - - . .";

  // ================================================================== STEAMHOLLOW
  // G major, 96: the shamisen leads over a koto that keeps the step; geta on stone (hyōshigi) off the beat
  const YN_A = YU + ' | 2 - 3 - 5 - 3 - | 2 - - - - - . . | ' + YU + " | 3 - 2 - 1 - 2 - | 1 - - - - - . .";
  const YN_A_CH = '1 1 5 5 1 6 5 1';
  const YN_B = '3 - - - 5 - 3 - | 2 - - - - - . . | 1 - - - 2 - 3 - | 5 - - - - - . . | 6 - - - 5 - 6 - | 1\' - - - - - . . | 7 - 6 - 5 - 6 - | 5 - - - - - . .';
  const YN_B_CH = '1 5 4 1 4 4 5 5';
  const YN_C = "1' - 2' - 3' - 2' - | 1' - 6 - - - . . | 5 - 6 - 1' - 2' - | 3' - - - - - . . | 2' - 1' - 6 - 5 - | 6 - - - - - . . | 5 - 3 - 2 - 3 - | 1 - - - - - . .";
  const YN_C_CH = '1 4 1 1 5 4 1 1';
  S('steamhollow', {
    title: 'Steam Over the Rooftops',
    kind: 'area',
    motifs: ['yu'],
    notes: 'Steamhollow\'s streets (G major, 96): a lively ensemble, relaxed. The shamisen carries the tune over a koto that keeps the step; the hyōshigi clacks off the beat like geta on stone; a bowed drone and a soft pad for the steam. B gives the tune to the koto with the shakuhachi answering; C lifts the steam motif onto the shinobue, a little higher each time, before the shamisen brings it home.',
    key: 'G', mode: 'ionian', bpm: 96, loopFrom: 1,
    tracks: {
      lead: { i: 'shamisen', o: 4, v: 0.56, rv: 0.3 },
      kotoL: { i: 'koto', o: 4, v: 0.5, rv: 0.3, pan: -0.15 },
      hi: { i: 'shinobue', o: 5, v: 0.44, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.26, rv: 0.28, pan: -0.25 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 4, v: 0.18, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.42 },
      geta: { perc: true, v: 0.3, rv: 0.25, pan: 0.25 },
      drum: { perc: true, v: 0.26, rv: 0.3 },
    },
    all: { koto: "0 2 1' 2 0 2 1' 2", bass: '0 - - - 0 - - -', pad: '0+2+4', geta: '..y...y.|..y.y.y.', drum: 'z.......|z...z...' },
    sections: {
      intro: { bars: 2, ch: '1 1', geta: '..y...y.|..y...y.' },
      A: { bars: 8, ch: YN_A_CH, lead: YN_A },
      B: { bars: 8, ch: YN_B_CH, kotoL: YN_B, koto: "0 . 2 . 0 . 2 ." },
      C: { bars: 8, ch: YN_C_CH, hi: YN_C },
      A2: { bars: 8, ch: YN_A_CH, lead: YN_A, kotoL: YN_A },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ================================================================== THE EVENING
  // D major, 72: lanterns on, the bath, the companions' evenings; the koto plucks, the shakuhachi breathes
  const EV_A = '5 - - - 6 - 5 - | 3 - - - - - . . | 2 - - - 3 - 5 - | 6 - - - - - . . | ' + YU + ' | 2 - - - 3 - 2 - | 1 - - - - - . .';
  const EV_A_CH = '1 1 5 4 1 1 5 1';
  const EV_B = '3 - - - . . . . | 5 - - - . . . . | 6 - - - 5 - - - | 3 - - - . . . . | 2 - - - . . . . | 5 - - - . . . . | 3 - - - 2 - - - | 1 - - - - - . .';
  const EV_B_CH = '1 1 4 1 5 5 1 1';
  S('yn_evening', {
    title: 'Lanterns in the Steam',
    kind: 'area',
    motifs: ['yu'],
    notes: 'Steamhollow at dusk and in the open-air bath (D major, 72): the koto plucks the steam motif slowly over a held sho chord; the shakuhachi answers in long breaths; a rin now and then, far off. B is the koto almost alone, one note at a time, like the drip from a bamboo spout.',
    key: 'D', mode: 'ionian', bpm: 72, loopFrom: 1,
    // (+2 dB, and the intro's drones played up: it opened below the game's range; tests/e2e/audio.check.mjs)
    tracks: _.lift({
      lead: { i: 'koto', o: 4, v: 0.52, rv: 0.5 },
      breath: { i: 'shakuhachi', o: 4, v: 0.42, rv: 0.55, pan: 0.15 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.2, rv: 0.5 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.18, rv: 0.5 },
      bell: { perc: true, v: 0.22, rv: 0.7 },
    }, 2),
    all: { pad: '0+2+4', low: '0', bell: 'i.......|........|........|........' },
    sections: {
      intro: { bars: 2, ch: '1 1', dyn: 1.8 },
      A: { bars: 8, ch: EV_A_CH, lead: EV_A },
      B: { bars: 8, ch: EV_B_CH, lead: EV_B },
      A2: { bars: 8, ch: EV_A_CH, breath: EV_A },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  // ================================================================== THE STEAM VENTS
  // C phrygian, 64: a deep drone; the biwa plucks the steam motif bent low; drips (the rin, muffled); no footfall
  const VT_A = '1 - - - . . . . | 2 - 1 - - - . . | . . . . . . . . | 5 - - - - - . . | 5 - 6 - 1\' - 6 - | 5 - 3 - - - . . | 4 - 3 - 2 - - - | 1 - - - - - . .';
  const VT_A_CH = '1P 2 1P 5P 1P 1P 2 1P';
  const VT_B = '. . . . . . . . | 5, - - - . . . . | 1 - - - 2 - - - | 1 - - - . . . . | . . . . 5 - - - | 4 - 3 - - - . . | 2 - - - - - . . | 1 - - - - - . .';
  const VT_B_CH = '1P 5P 2 1P 5P 1P 2 1P';
  S('yn_vents', {
    title: 'Under the Spring',
    kind: 'area',
    motifs: ['yu'],
    notes: 'The Steam Vents (C phrygian, 64): a deep drone under everything, a bowed bass that barely moves; the biwa plucks the steam motif bent down into the dark, then stops; a muffled rin like a drip; the ōdaiko once in two bars, low, like the Kettle turning over in its sleep.',
    key: 'C', mode: 'phrygian', bpm: 64, loopFrom: 0,
    tracks: {
      lead: { i: 'biwa', o: 3, v: 0.58, rv: 0.55 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.28, rv: 0.5 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.16, rv: 0.55 },
      drip: { perc: true, v: 0.24, rv: 0.75 },
      drum: { perc: true, v: 0.3, rv: 0.5 },
    },
    all: { low: '0', pad: '0+4', drip: '....i...|........|..i.....|........', drum: 'z.......|........' },
    sections: { A: { bars: 8, ch: VT_A_CH, lead: VT_A }, B: { bars: 8, ch: VT_B_CH, lead: VT_B }, A2: { bars: 8, ch: VT_A_CH, lead: VT_A } },
    form: ['A', 'B', 'A2'],
  });

  // ================================================================== THE NORTH ROAD
  // A aeolian, 58: the valley's noise falling away behind; the shinobue alone, longer and longer rests
  const NR_A = '1 - - - - - . . | . . . . . . . . | 3 - - - - - . . | . . . . . . . . | 5 - 6 - 1\' - 6 - | 5 - 3 - - - . . | 3 - - - - - . . | . . . . . . . .';
  const NR_A_CH = '1P 1P 3 3 1P 1P 1P 1P';
  const NR_B = '. . . . . . . . | 5 - - - - - . . | . . . . . . . . | . . . . . . . . | 3 - - - - - . . | . . . . . . . . | 1 - - - - - - - | . . . . . . . .';
  S('yn_north', {
    title: 'Where the Sound Ends',
    kind: 'area',
    motifs: ['yu'],
    notes: 'The north road out of Steamhollow (A aeolian, 58): the valley\'s noise falls away behind you. The shinobue alone, long notes and longer silences, over a bowed drone so quiet it is almost not there; the steam motif reduced to three notes and then to one.',
    key: 'A', mode: 'aeolian', bpm: 58, loopFrom: 0,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.5, rv: 0.65, dl: 0.25 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.14, rv: 0.6 },
    },
    all: { low: '0' },
    sections: { A: { bars: 8, ch: NR_A_CH, lead: NR_A }, B: { bars: 8, ch: NR_A_CH, lead: NR_B } },
    form: ['A', 'B', 'A', 'B'],
  });

  // ================================================================== BATTLE
  // F dorian, 119 (the Cloudroad's is 118, the Archive's 120): the shamisen hard and bright; koto arpeggios; geta
  const BY_A = "1 - 2 - 3 - 5 - | 4 - 3 - 1 - 5, - | 1 - 3 - 5 - 6 - | 5 - - - - - . . | 5 - 6 - 1' - 6 - | 5 - 3 - 2 - 3 - | 2 - 1 - 7, - 2 - | 1 - - - - - . .";
  const BY_A_CH = '1 4 1 1 1 1 5D 1';
  const BY_B = "5 - - 3 5 - 6 - | 4 - - - 2 - - - | 3 - - 1 3 - 4 - | 5 - - - 3 - - - | 1' - - 6 5 - 3 - | 4 - - - 6 - - - | 5 - 4 - 2 - 4 - | 5 - - - - - . .";
  const BY_B_CH = '1 7 1 3 4D 4 7D 3';
  const BY_B_LOW = '1 - - - - - - - | 7, - - - - - - - | 1 - - - - - - - | 3 - - - - - - - | 4, - - - - - - - | 4, - - - - - - - | 7, - - - - - - - | 3 - - - - - - -';
  const BY_C = "5 - 6 - 1' - 6 - | 5 - 3 - - - . . | 5 - 6 - 1' - 6 - | 5 - 3 - 4 - 5 - | 3 - - - 1 - 3 - | 4 - 3 - 1 - 4 - | 5 - 4 - 2 - 4 - | 1 - - - - - . .";
  const BY_C_CH = '1P 1P 1P 1 1 4 7 1';
  // the shamisen's answers in B (off the beat, chord tones) and its stabs in C; the bowed bass under A
  const BY_A_LOW = '1 - - - - - - - | 4, - - - - - - - | 1 - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 3 - - - - - - - | 7, - - - - - - - | 1 - - - - - - -';
  const BY_B_ANS = ". . 5 - . . 3 - | . . 4 - . . 7, - | . . 1' - . . 5 - | . . 3 - . . 5 - | . . 4 - . . 6 - | . . 1' - . . 6 - | . . 2 - . . 4 - | . . 3 - - - . .";
  const BY_C_STAB = "1 . 1 . . . 5, . | 1 . 1 . . . 5, . | 1 . 1 . . . 5, . | 1 . 3 . . . 5 . | 1 . 3 . . . 5 . | 4 . 6 . . . 1' . | 7, . 2 . . . 4 . | 1 . . . . . . .";
  S('battle_yn', {
    title: 'Inkweaving — Hot Water',
    kind: 'battle',
    motifs: ['yu'],
    notes: 'Chapter 11 battle (F dorian, 119; the Cloudroad\'s is 118, the Archive\'s 120). The shamisen leads, struck hard; the koto runs arpeggios in sixteenths like water over stones; ōdaiko and shime-daiko in a bathhouse rhythm, pushed off the beat, with the hyōshigi clacking like geta on wet stone. B is the shinobue over a bowed bass; C throws the steam motif up twice over open fifths, the vents blowing.',
    key: 'F', mode: 'dorian', bpm: 119, loopFrom: 1,
    tracks: {
      lead: { i: 'shamisen', o: 4, v: 0.66, rv: 0.2 },
      hi: { i: 'shinobue', o: 5, v: 0.58, rv: 0.25, pan: 0.12 },
      low: { i: 'bowed', o: 3, v: 0.54, rv: 0.25, pan: -0.15 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.32, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.3, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.58 },
      shime: { perc: true, v: 0.44, pan: 0.2 },
      geta: { perc: true, v: 0.36, pan: -0.25 },
    },
    all: {
      arp: { n: "0 2 1' 2", u: 0.25 }, bass: '0 0 - 0 - 0 0 0', pad: '0+1+2+4',
      taiko: 'Z.zz.zZz|Z.zzZzzz', shime: 'eeEeeeEe|eEeeEeEe', geta: '.yy.yy.y|.yy.yy.y',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ' },
      A: { bars: 8, ch: BY_A_CH, lead: BY_A, low: BY_A_LOW },
      B: { bars: 8, ch: BY_B_CH, hi: BY_B, low: BY_B_LOW, lead: BY_B_ANS },
      C: { bars: 8, ch: BY_C_CH, hi: BY_C, low: BY_B_LOW, lead: BY_C_STAB, pad: '0+4', taiko: 'Z..z..Z.|Z.zz.zZz' },
      B2: { bars: 8, ch: BY_B_CH, hi: BY_B, low: BY_B_LOW, lead: BY_B_ANS, arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { hi: 'shakuhachi' }, o: { hi: -1 } }],
  });

  // ================================================================== THE KETTLE BELOW
  // C# aeolian, 151 (the Cloudroad's boss is 150, the Archive's 152): frightened, not cruel: the riff rattles like a
  // lid; the steam motif tries to rise and keeps falling back, until C, where it settles
  const KB_RIFF = '1 1 5, 1 1 1 5, 1 | 1 1 3 1 7, 7, 5, 7,';
  const KB_A = "1 - 3 - 5 - 6 - | 5 - 3 - - - . . | 1 - 3 - 5 - 6 - | 5 - 3 - 1 - - - | 4 - 5 - 6 - 5 - | 4 - 3 - - - . . | 3 - 4 - 5 - 7, - | 1 - - - - - . .";
  const KB_A_CH = '1 1 1 1 4 4 5D 1';
  const KB_A_LOW = '1 - - - - - - - | 1 - - - - - - - | 1 - - - - - - - | 1 - - - - - - - | 4, - - - - - - - | 4, - - - - - - - | 7, - - - - - - - | 1 - - - - - - -';
  const KB_B = "5 - - - 6 - 5 - | 3 - - - 5 - - - | 6 - - - 5 - 3 - | 4 - - - - - . . | 5 - - - 6 - 1' - | 6 - 5 - 3 - - - | 4 - 3 - 4 - 5 - | 5 - - - - - . .";
  const KB_B_CH = '1 1 4 4 6 1 7 3';
  const KB_B_LOW = '1 - - - - - - - | 1 - - - - - - - | 4, - - - - - - - | 4, - - - - - - - | 6, - - - - - - - | 1 - - - - - - - | 7, - - - - - - - | 3 - - - - - - -';
  const KB_C = YU + ' | ' + YU + ' | ' + YU + ' | 3 - 2 - 1 - 2 - | 1 - - - - - . .';
  const KB_C_CH = '1P 1P 1P 1P 1P 1P 7 1P';
  const KB_B_ANS = ". . 5 - . . 3 - | . . 1' - . . 5 - | . . 4 - . . 6 - | . . 1' - . . 4 - | . . 6 - . . 3 - | . . 5 - . . 1' - | . . 7 - . . 2' - | . . 3 - - - . .";
  const KB_C_STAB = "1 . 3 . . . 5 . | 1 . 3 . . . 5 . | 1 . 3 . . . 5 . | 1 . 3 . . . 5 . | 1 . 3 . . . 5 . | 1 . 3 . . . 5 . | 7, . 2 . . . 4 . | 1 . . . . . . .";
  S('yn_kettle', {
    title: 'The Kettle Below',
    kind: 'boss',
    motifs: ['yu'],
    notes: 'The Kettle Below (C# aeolian, 151; the Cloudroad\'s boss is 150, the Archive\'s 152): the spring\'s old spirit, frightened rather than cruel. A koto riff rattles like a kettle lid over a cluster on the shō, the ōdaiko and shime-daiko press off the beat, the hyōshigi clatters; the shakuhachi climbs the steam motif and falls back again and again. B is the shinobue breathless over a bowed bass; C is the steam motif three times over open fifths, rising and settling until the riff stops shaking.',
    key: 'C#', mode: 'aeolian', bpm: 151, loopFrom: 1,
    tracks: {
      riff: { i: 'koto', o: 3, v: 0.58, rv: 0.15, pan: -0.2 },
      lead: { i: 'shakuhachi', o: 4, v: 0.64, rv: 0.25 },
      hi: { i: 'shinobue', o: 5, v: 0.54, rv: 0.25, pan: 0.15 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: 0.2 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.3, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.72 },
      taiko: { perc: true, v: 0.62 },
      shime: { perc: true, v: 0.48, pan: 0.2 },
      clap: { perc: true, v: 0.42, pan: -0.25 },
    },
    all: {
      riff: KB_RIFF, bass: '0 0 - 0 0 - 0 0', pad: '0+1+2+4',
      taiko: 'Z.zz.zZz|Z.zzZzzZ', shime: 'eeEeeeEe|eEeEe.ee', clap: '..y.y.y.|..y.yyy.',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null },
      A: { bars: 8, ch: KB_A_CH, lead: KB_A, low: KB_A_LOW },
      B: { bars: 8, ch: KB_B_CH, hi: KB_B, low: KB_B_LOW, lead: KB_B_ANS },
      C: { bars: 8, ch: KB_C_CH, lead: KB_C, hi: KB_C_STAB, pad: '0+4' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A', i: { lead: 'shinobue' }, o: { lead: 1 } }, { s: 'B', i: { hi: 'shakuhachi' }, o: { hi: -1 } }],
  });
})(RB.audio);
