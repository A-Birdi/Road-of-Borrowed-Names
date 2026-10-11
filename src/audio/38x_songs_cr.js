/* The Cloudroad, Chapter 10 of the twelve-chapter edition (expansion P12; plan 07_REGIONS.md R2 "Theme": shakuhachi
 * and koto with a walking rhythm; a lonely flute at altitude; the bells of pack horses): the highway and its stations,
 * the High Pass above the cloud, the Courier's Hut, the road's battle theme and the Courier Who Never Arrived.
 * Notation: see 30_songs.js.
 *
 * Every one quotes the relay motif (a step up the road, a glance ahead, and back down to hand it on). The walking
 * songs keep a footfall on the ōdaiko and small bells (j) like a pack horse's; at altitude only the flute is left. In
 * the twelve-chapter ladder (C-22) the battle and boss themes sit a step above Kotonoha's (Chapter 9) and below the
 * Archive's, leaving room for Steamhollow (tests/unit/audio_zones.test.mjs). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 10;
    _.songDefs[id] = def;
  }
  // the relay motif: up the road a step at a time, a glance ahead, and back down to hand it on
  _.motifs.relay = { deg: '1 2 3 5 3 2', notes: 'The Cloudroad: a step up the road, a glance ahead, and back down to hand it on.' };
  const RELAY = '1 - 2 - 3 - 5 - | 3 - 2 - - - . .';
  const RELAY_HI = "1' - 2' - 3' - 5' - | 3' - 2' - - - . .";

  // ================================================================== THE CLOUDROAD
  const CR_A = RELAY + ' | 5 - 6 - 5 - 3 - | 2 - - - - - . . | 1 - 2 - 3 - 5 - | 6 - 5 - 3 - 2 - | 3 - 2 - 1 - 2 - | 1 - - - - - . .';
  const CR_A_CH = '1 5 4 5 1 4 5 1';
  const CR_B = '5 - - - 6 - 5 - | 3 - - - - - . . | 4 - - - 5 - 4 - | 2 - - - - - . . | 3 - - - 4 - 5 - | 6 - - - 5 - 3 - | 2 - 3 - 2 - 1 - | 1 - - - - - . .';
  const CR_B_CH = '4 1 4 5 1 4 5 1';
  const CR_C = RELAY_HI + ' | ' + RELAY_HI + ' | 6 - 5 - 3 - 2 - | 3 - 5 - 6 - 5 - | 3 - 2 - 1 - 2 - | 1 - - - - - . .';
  S('cloudroad', {
    title: 'Station by Station',
    kind: 'area',
    motifs: ['relay'],
    notes: 'The Cloudroad and its post stations (A mixolydian, 92): a walking tune. The shakuhachi carries it at a traveller\'s pace over a koto that keeps the step; the ōdaiko is a footfall on every other beat and small bells ring off the beat like a pack horse\'s. B hands the tune to the koto, the shakuhachi answering; C lifts the relay motif onto the shinobue twice, a runner calling ahead to the next station.',
    key: 'A', mode: 'mixolydian', bpm: 92, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.6, rv: 0.4 },
      kotoL: { i: 'koto', o: 4, v: 0.5, rv: 0.3, pan: -0.15 },
      hi: { i: 'shinobue', o: 4, v: 0.46, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.28, rv: 0.28, pan: -0.25 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.22, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.46 },
      drum: { perc: true, v: 0.32, rv: 0.3 },
      bells: { perc: true, v: 0.26, rv: 0.4, pan: 0.3 },
    },
    all: { koto: "0 2 1' 2 0 2 1' 2", bass: '0 - - - 0 - - -', low: '0+2', drum: 'z...z...|z...z...', bells: '..j...j.|..j..jj.' },
    sections: {
      intro: { bars: 2, ch: '1 1', bells: '..j...j.|..j...j.' },
      A: { bars: 8, ch: CR_A_CH, lead: CR_A },
      B: { bars: 8, ch: CR_B_CH, kotoL: CR_B, koto: "0 . 2 . 0 . 2 ." },
      C: { bars: 8, ch: CR_A_CH, hi: CR_C },
      A2: { bars: 8, ch: CR_A_CH, lead: CR_A, kotoL: CR_A },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ================================================================== THE HIGH PASS
  const PS_A = '5 - - - - - 3 - | 5 - 6 - 5 - - - | 3 - - - 2 - 1 - | 2 - - - - - . . | ' + RELAY + ' | 7, - 1 - 2 - 3 - | 1 - - - - - . .';
  const PS_A_CH = '1P 1P 4 5 1P 5 7 1P';
  const PS_B_CH = '1P 1P 4 5 1P 6 7 1P';
  const PS_B = '1 - - - . . . . | 5, - - - . . . . | 4, - - - . . . . | 5, - - - . . . . | 1 - - - . . . . | 3 - - - . . . . | 2 - - - 7, - - - | 1 - - - - - . .';
  S('cr_pass', {
    title: 'Above the Cloud',
    kind: 'area',
    motifs: ['relay'],
    notes: 'The High Pass (E aeolian, 66): a lonely flute at altitude. The shinobue alone, long notes with the wind between them; a held sho chord and a bowed drone for the cold; no footfall and no bells, the pack horses turned back long ago. B is the koto, one note a bar like snow settling; A2 brings the flute back an octave higher.',
    key: 'E', mode: 'aeolian', bpm: 66, loopFrom: 1,
    tracks: {
      lead: { i: 'shinobue', o: 5, v: 0.56, rv: 0.6, dl: 0.2 },
      koto: { i: 'koto', o: 4, v: 0.42, rv: 0.55, pan: -0.2 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.24, rv: 0.5 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.2, rv: 0.5 },
    },
    all: { pad: '0+2+4', low: '0' },
    sections: {
      intro: { bars: 2, ch: '1P 1P' },
      A: { bars: 8, ch: PS_A_CH, lead: PS_A },
      B: { bars: 8, ch: PS_B_CH, koto: PS_B },
    },
    form: ['intro', 'A', 'B', { s: 'A', o: { lead: 1 } }],
  });

  // ================================================================== THE COURIER'S HUT
  const HT_A = '1 - - - 2 - 1 - | 7, - - - - - . . | ' + RELAY + ' | 4 - 3 - 2 - 1 - | 2 - - - - - . . | 1 - - - - - . . | . . . . . . . .';
  const HT_A_CH = '1P 7 1P 2 4 2 1P 1P';
  // B: the motif again, further off, and the rin alone between
  const HT_B = '. . . . . . . . | 5 - - - 4 - 3 - | 2 - - - - - . . | . . . . . . . . | ' + RELAY + ' | 7, - - - - - . . | 1 - - - - - . .';
  const HT_B_CH = '1P 4 2 1P 1P 2 7 1P';
  S('cr_hut', {
    title: 'The Courier\'s Hut',
    kind: 'area',
    motifs: ['relay'],
    notes: 'The relay hut on the saddle (D phrygian, 60): still and cold. The biwa plucks the relay motif slowly, as if from memory, and stops short; a rin struck once in two bars; a bowed drone; the wind in the sho. Nothing walks here.',
    key: 'D', mode: 'phrygian', bpm: 60, loopFrom: 0,
    tracks: {
      lead: { i: 'biwa', o: 3, v: 0.6, rv: 0.5 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.24, rv: 0.5 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.18, rv: 0.5 },
      bell: { perc: true, v: 0.3, rv: 0.7 },
    },
    all: { low: '0', pad: '0+2', bell: 'i.......|........' },
    sections: { A: { bars: 8, ch: HT_A_CH, lead: HT_A }, B: { bars: 8, ch: HT_B_CH, lead: HT_B } },
    form: ['A', 'B'],
  });

  // ================================================================== BATTLE
  const BC_A = '1 - 2 - 3 - 5 - | 3 - 2 - 1 - 5, - | 6, - 7, - 1 - 2 - | 3 - - - - - . . | 5 - 6 - 5 - 3 - | 2 - 3 - 5 - 3 - | 2 - 1 - 7, - 1 - | 1 - - - - - . .';
  const BC_A_CH = '1 5 6 1 4 5 7 1';
  const BC_B = "5 - - 3 5 - 6 - | 5 - - - 3 - - - | 4 - - 2 4 - 5 - | 3 - - - 2 - - - | 1' - - 6 5 - 3 - | 5 - - - 6 - - - | 5 - 3 - 2 - 3 - | 1 - - - - - . .";
  const BC_B_CH = '1 4 2 3 6 4 5 1';
  const BC_B_LOW = '1 - - - - - - - | 4, - - - - - - - | 2 - - - - - - - | 5, - - - - - - - | 6, - - - - - - - | 4, - - - - - - - | 5, - - - - - - - | 1 - - - - - - -';
  const BC_C = "1' - 2' - 3' - 5' - | 3' - 2' - - - . . | 1' - 2' - 3' - 5' - | 3' - 2' - 1' - 7 - | 6 - - - 5 - 3 - | 2 - 3 - 5 - 6 - | 5 - 3 - 2 - 3 - | 1 - - - - - . .";
  const BC_C_CH = '1P 1P 6 7 4 5 7 1';
  S('battle_cr', {
    title: 'Inkweaving — Runner\'s Pace',
    kind: 'battle',
    motifs: ['relay'],
    notes: 'Chapter 10 battle (E dorian, 118; Kotonoha\'s is 117, the Archive\'s 120). The shakuhachi leads, overblown and hard; the koto in running arpeggios like feet on stone steps; the shamisen drives an ostinato; ōdaiko, shime-daiko and the noh drums in a runner\'s 3+3+2, with the pack-horse bells shaken loose on the off-beats. B gives a climbing answer to the shinobue over a bowed bass; C throws the relay motif high on the shinobue over open fifths, a call from station to station.',
    key: 'E', mode: 'dorian', bpm: 118, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.68, rv: 0.22 },
      hi: { i: 'shinobue', o: 5, v: 0.6, rv: 0.25, pan: 0.12 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.4, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.32, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.68 },
      taiko: { perc: true, v: 0.58 },
      shime: { perc: true, v: 0.44, pan: 0.2 },
      noh: { perc: true, v: 0.42, pan: -0.25 },
      bells: { perc: true, v: 0.26, pan: 0.3 },
    },
    all: {
      ost: "0 0' 2 0' 4 0' 2 0'", arp: "0 2 1' 2 0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z.zZ.|Z..zZ.Zz', shime: 'eeEeeeEe|eeeeEeee', noh: 'm.mq..m.|..m.q.qm', bells: '.j...j..|.j..jj..',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ', noh: 'q.....q.|q.q.q...' },
      A: { bars: 8, ch: BC_A_CH, lead: BC_A },
      B: { bars: 8, ch: BC_B_CH, hi: BC_B, low: BC_B_LOW },
      C: { bars: 8, ch: BC_C_CH, hi: BC_C, low: BC_B_LOW, pad: '0+2+4', taiko: 'Z..z..Z.|Z.zz.zZz' },
      B2: { bars: 8, ch: BC_B_CH, hi: BC_B, low: BC_B_LOW, arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { hi: 'shakuhachi' }, o: { hi: -1 } }],
  });

  // ================================================================== THE COURIER WHO NEVER ARRIVED
  const BO_RIFF = '1 1 5, 1 2 1 5, 1 | 1 1 3 2 1 7, 6, 7,';
  const BO_A = '1 - 2 - 3 - 5 - | 3 - 2 - - - . . | 4 - 5 - 6 - 5 - | 4 - 3 - - - . . | 3 - 4 - 5 - 1\' - | 7 - 6 - 5 - 4 - | 3 - 2 - 1 - 7, - | 1 - - - - - . .';
  const BO_A_CH = '1 5 4 1 6 4 7 1';
  const BO_B = "5 - - - 6 - 5 - | 3 - - - 5 - - - | 6 - - - 5 - 3 - | 2 - - - - - . . | 5 - - - 6 - 1' - | 6 - 5 - 3 - - - | 2 - 3 - 5 - 3 - | 2 - - - - - . .";
  const BO_B_CH = '1 4 6 5 6 4 7 5';
  const BO_B_LOW = '1 - - - - - - - | 4, - - - - - - - | 6, - - - - - - - | 5, - - - - - - - | 6, - - - - - - - | 4, - - - - - - - | 5, - - - - - - - | 1 - - - - - - -';
  const BO_C = RELAY + ' | ' + RELAY + ' | ' + RELAY + ' | 1 - 2 - 3 - 2 - | 1 - - - - - . .';
  const BO_C_CH = '1P 1P 1P 1P 1P 1P 7 1P';
  S('boss_cr', {
    title: 'The Courier Who Never Arrived',
    kind: 'boss',
    motifs: ['relay'],
    notes: 'The Cloudroad\'s boss (B aeolian, 150; Kotonoha\'s is 149, the Archive\'s 152): a relay spirit still running a message nobody remembers. A koto riff struck near the bridge, the shamisen driving, ōdaiko and shime-daiko at a runner\'s pace, and the hyōshigi. A runs up the relay motif and on, never arriving; B is a breathless shinobue over a bowed bass; C is the relay motif three times over open fifths, the same message handed on and on, until it finally comes down home.',
    key: 'B', mode: 'aeolian', bpm: 150, loopFrom: 1,
    tracks: {
      riff: { i: 'koto', o: 3, v: 0.58, rv: 0.15, pan: -0.2 },
      lead: { i: 'shakuhachi', o: 4, v: 0.64, rv: 0.25 },
      hi: { i: 'shinobue', o: 5, v: 0.54, rv: 0.25, pan: 0.15 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: 0.2 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.42, rv: 0.12, pan: 0.25 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.3, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.72 },
      taiko: { perc: true, v: 0.62 },
      shime: { perc: true, v: 0.48, pan: 0.2 },
      clap: { perc: true, v: 0.42, pan: -0.25 },
    },
    all: {
      riff: BO_RIFF, ost: "0 2 0' 2 0 2 0' 2", bass: '0 0 - 0 0 - 0 -', pad: '0+1+2',
      taiko: 'Z..z..Z.|Z.z.Z.zZ', shime: 'eeEeeeEe|e.eEe.ee', clap: '..y...y.|..y.y.y.',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null },
      A: { bars: 8, ch: BO_A_CH, lead: BO_A },
      B: { bars: 8, ch: BO_B_CH, hi: BO_B, low: BO_B_LOW },
      C: { bars: 8, ch: BO_C_CH, lead: BO_C, pad: '0+2' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A', i: { lead: 'shinobue' } }, { s: 'B', i: { hi: 'shakuhachi' }, o: { hi: -1 } }],
  });
})(RB.audio);
