/* The Keepers' Road, Chapter 7 of the twelve-chapter edition (expansion P10; plan 07_REGIONS.md R8 "Theme"): the road
 * and the lodge, the Scriptorium Cave, the vigil in the Room of Wicks, the shuttered Hall, the road's battle theme and
 * the Hundredth Tale. Notation: see 30_songs.js.
 *
 * Biwa-led throughout (the instrument of the travelling storytellers), slow and narrative: the storyteller's biwa
 * (biwa_tale), its sawari held back, a written accent struck with the bachi on the skin (Robin, 2026-10-12: "a
 * storyteller's instrument with a forceful accent available"; on a second hearing, a fifth softer, the bars told
 * evenly, and no accent left where one rang as a wrong note; the Hundredth Tale keeps the full biwa's riff), with a
 * single bell at the waystations: a rin struck once in a while, never a peal. Every one quotes the road motif; the
 * vigil also Ren's (the lamplighter's fourths), the boss also the Hush's. In the twelve-chapter ladder (C-22) the
 * battle and boss themes sit a step above Snowbell's and below Lanternfall's (tests/unit/audio_zones.test.mjs). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  function S(id, def) {
    def.id = id;
    def.chapter = 7;
    _.songDefs[id] = def;
  }
  // the road motif in a minor mode: the same contour, harmonised for aeolian / phrygian / dorian
  const ROAD = "5, - 3 - - 2 1 - | 2 - - - - - . . | 3 - 5 - 6 - 5 - | 3 - 2 - 1 - - - | 5, - 3 - - 2 1 - | 7, - - - - - . . | 1 - 2 - 3 - 2 - | 1 - - - - - . .";
  const ROAD_CH_AEOL = '1 5 6 4 1 7 4 1';
  const bell8 = (meter) => ['i' + '.'.repeat(meter * 2 - 1), ...Array(7).fill('.'.repeat(meter * 2))].join('|');

  // ======================================================== THE KEEPERS' ROAD
  const KP_A = "1 - - 3 5 - 4 3 | 2 - - - 1 - - - | 3 - - 5 6 - 5 4 | 5 - - - - - . . | 6! - 5 - 4 - 3 - | 2 - 3 - 4 - 2 - | 7, - - 2 1 - 7, 6, | 7, - - - - - . .";
  const KP_A_CH = '1 7 6 3 4 7 5 7';
  const KP_B = "5 - - - 6 - 5 - | 3 - - - - - . . | 4 - - - 5 - 4 - | 2 - - - - - . . | 3 - - - 4 - 5 - | 6 - - - 5 - 4 - | 3 - 2 - 1 - 2 - | 1 - - - - - . .";
  const KP_B_CH = '3 6 4 7 3 6 5 1';
  S('keepers', {
    title: 'Lamps Along the Ridge',
    kind: 'area',
    motifs: ['road'],
    notes: 'The Keepers\' Road and the lodge (E aeolian, 80): the old ridge road in late-autumn mist. The biwa tells the tune like a storyteller beginning, plucked phrases with room between them; a shakuhachi answers in B a fifth higher, as if from further up the steps; koto and a bowed drone keep the ground, an ōdaiko once in two bars like a footfall. C hands the road motif to the biwa and strikes the single rin, the bell at the waystations.',
    key: 'E', mode: 'aeolian', bpm: 80, loopFrom: 1,
    tracks: {
      lead: { i: 'biwa_tale', o: 3, v: 0.62, rv: 0.35 },
      ans: { i: 'shakuhachi', o: 4, v: 0.46, rv: 0.45, pan: 0.2 },
      koto: { i: 'koto', o: 4, pat: true, v: 0.26, rv: 0.3, pan: -0.25 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.26, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.48 },
      drum: { perc: true, v: 0.3, rv: 0.4 },
      bell: { perc: true, v: 0.34, rv: 0.6, pan: 0.25 },
    },
    all: { koto: "0 . 2 . 1' . 2 .", bass: '0 - - - - - - -', low: '0+2', drum: 'z.......|........', bell: '........' },
    sections: {
      intro: { bars: 2, ch: '1 1', bell: 'i.......|........', drum: null },
      A: { bars: 8, ch: KP_A_CH, lead: KP_A },
      B: { bars: 8, ch: KP_B_CH, ans: KP_B, koto: "0 . . . 2 . . ." },
      C: { bars: 8, ch: ROAD_CH_AEOL, lead: ROAD, bell: bell8(4) },
      A2: { bars: 8, ch: KP_A_CH, lead: KP_A, ans: KP_A },
    },
    form: ['intro', 'A', 'B', 'C', 'A2'],
  });

  // ======================================================= THE SCRIPTORIUM CAVE
  const CV_A = "1 - - - 3 - 2 - | 1 - - - - - . . | 5, - - - 7, - 1 - | 2 - - - - - . . | 3 - - - 4 - 3 - | 2 - 1 - 7, - - - | 6, - - - 7, - 1 - | 5, - - - - - . .";
  const CV_A_CH = '1 6 5 7 3 7 6 5';
  const CV_B = "5 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | 1 - - - - - - - | 2 - - - 7, - - - | 1 - - - - - - -";
  const CV_B_CH = '1 6 4 7 3 6 7 1';
  // C: the road motif slowed to a note every half bar, like a page read aloud a word at a time
  const CV_C = "5, - - - 3 - - - | 2 - - - 1 - - - | 2 - - - - - - - | .:8 | 5, - - - 3 - - - | 2 - - - 1 - - - | 7, - - - - - - - | .:8";
  const CV_C_CH = '1 7 7 1 1 7 3 5';
  S('kr_cave', {
    title: 'The Register Shelves',
    kind: 'area',
    motifs: ['road'],
    notes: 'The Scriptorium Cave (C-sharp aeolian, 68): shelves of registers in the rock. The biwa reads a narrow, stepwise line like a finger along a page; a shō holds the chords in the stone; water drips. B is the koto alone, high and plucked once a bar like harmonics, over the biwa\'s low string; C slows the road motif to a note every half bar, and the rin sounds once, far off.',
    key: 'C#', mode: 'aeolian', bpm: 68, loopFrom: 0,
    tracks: {
      lead: { i: 'biwa_tale', o: 3, v: 0.58, rv: 0.55 },
      hi: { i: 'koto', o: 5, v: 0.34, rv: 0.6, pan: 0.25 },
      pick: { i: 'biwa_tale', o: 2, pat: true, v: 0.28, rv: 0.45, pan: -0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.3, rv: 0.5 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.3, rv: 0.45 },
      drip: { perc: true, v: 0.26, rv: 0.7, pan: 0.3 },
      bell: { perc: true, v: 0.28, rv: 0.75, pan: -0.3 },
    },
    all: { pick: '0 . . . . . . .', sho: '0+1+2', low: '0+2', drip: '....d...|........|..d.....|......d.', bell: '........' },
    sections: {
      A: { bars: 8, ch: CV_A_CH, lead: CV_A },
      B: { bars: 8, ch: CV_B_CH, hi: CV_B, pick: '0 . . . 2 . . .', sho: null },
      C: { bars: 8, ch: CV_C_CH, lead: CV_C, bell: bell8(4) },
    },
    form: ['A', 'B', 'C'],
  });

  // ============================================================= THE VIGIL
  // three-four, slow: ninety-nine wicks and a story at each
  const VG_A = "1 - - - 3 - | 2 - 1 - 7, - | 1 - - - - - | 5, - - - - - | 6, - - - 1 - | 7, - 6, - 5, - | 6, - - - 7, - | 1 - - - - -";
  const VG_A_CH = '1 7 6 3 4 5 6 1';
  // B: Ren's motif on the shakuhachi, the lamplighter's fourths, then a turn home
  const VG_B = "5, - 1 - 4 - | 5 - - - - - | 1' - 7 - 1' - | - - - - . . | 3 - - - 2 - | 1 - - - 7, - | 6, - - - 7, - | 1 - - - - -";
  const VG_B_CH = '1 5 1 4 3 4 6 1';
  const VG_C = "5, - 3 - 2 1 | 2 - - - - - | 5, - 3 - 2 1 | 7, - - - - - | 1 - 2 - 3 - | 2 - - - 1 - | 7, - - - 6, - | 1 - - - - -";
  const VG_C_CH = '1 5 1 7 6 5 7 1';
  S('kr_vigil', {
    title: 'Ninety-Nine Wicks',
    kind: 'area',
    motifs: ['road', 'ren'],
    notes: 'The vigil in the Room of Wicks and the lodge on the night of it (A aeolian, 60, in three): a story at every wick. The biwa tells, slow and close; a bowed drone and a koto in long arpeggios for the lamplight. B gives Ren\'s motif to the shakuhachi, the lamplighter\'s climbing fourths, since this is a keeper\'s night; C plays the road motif on the rin itself, struck softly, the one bell the road allows.',
    key: 'A', mode: 'aeolian', bpm: 60, meter: 3, loopFrom: 0,
    tracks: {
      lead: { i: 'biwa_tale', o: 3, v: 0.6, rv: 0.45 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.48, rv: 0.5, pan: 0.2 },
      rin: { i: 'rin', o: 5, v: 0.42, rv: 0.6, pan: -0.15 },
      koto: { i: 'koto', o: 3, pat: true, v: 0.22, rv: 0.45, pan: -0.25 },
      low: { i: 'bowed', o: 2, hold: true, v: 0.26, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
    },
    all: { koto: '0 2 1\' 2 1 2', low: '0+2', bass: '0 - - - - -' },
    sections: {
      A: { bars: 8, ch: VG_A_CH, lead: VG_A },
      B: { bars: 8, ch: VG_B_CH, shaku: VG_B },
      C: { bars: 8, ch: VG_C_CH, rin: VG_C, koto: '0 . 2 . . .' },
    },
    form: ['A', 'B', 'C'],
  });

  // ======================================================= THE SHUTTERED HALL
  const HL_A = "1 - - - 5, - - - | 6, - - - 4, - - - | 5, - - - 7, - 1 - | 2 - - - - - . . | 3 - - - 2 - 1 - | 7, - - - 6, - - - | 5, - - - 6, - 7, - | 1 - - - - - . .";
  const HL_A_CH = '1 4 5 2 3 7 5 1';
  const HL_B = "5 - - - - - - - | .:8 | 3 - - - - - - - | .:8 | 4 - - - - - - - | .:8 | 2 - - - - - - - | .:8";
  const HL_B_CH = '1 1 3 3 4 4 5 5';
  const HL_C_CH = '1 2 3 1 1 7 2 1';
  S('kr_hall', {
    title: 'The Curtain Left Down',
    kind: 'area',
    motifs: ['road'],
    notes: 'The shuttered Hall in the hills (D dorian, 66): a theatre nobody has opened in years. The biwa walks its low strings through the dust; a shō holds the air; far off, now and then, the hyōshigi clappers, as if a performance were still being called somewhere backstage. B leaves the koto alone in its high register, a note every other bar; C gives the road motif to the shakuhachi, quietly, as if not to wake the house.',
    key: 'D', mode: 'dorian', bpm: 66, loopFrom: 0,
    tracks: {
      lead: { i: 'biwa_tale', o: 3, v: 0.58, rv: 0.5 },
      hi: { i: 'koto', o: 5, v: 0.32, rv: 0.65, pan: 0.25 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.44, rv: 0.55, pan: -0.15 },
      pick: { i: 'biwa_tale', o: 2, pat: true, v: 0.26, rv: 0.45, pan: -0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.3, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
      clap: { perc: true, v: 0.2, rv: 0.7, pan: 0.35 },
    },
    all: { pick: '0 . . . . . . .', sho: '0+1+2', bass: '0 - - - - - - -', clap: '........|....y...|........|........' },
    sections: {
      A: { bars: 8, ch: HL_A_CH, lead: HL_A },
      B: { bars: 8, ch: HL_B_CH, hi: HL_B, pick: '0 . . . 2 . . .' },
      C: { bars: 8, ch: HL_C_CH, shaku: ROAD, clap: '........|........|........|....y...' },
    },
    form: ['A', 'B', 'C'],
  });

  // ============================================================ THE ROAD'S BATTLE
  const BK_A = "1 - 5, - 1 - 3 - | 2 - 1 - 7, - 6, - | 5, - - - - - . . | 5, - 3 - - 2 1 - | 2 - 3 - 4 - 5 - | 6 - 5 - 4 - 3 - | 2 - - - 7, - 2 - | 1 - - - - - . .";
  const BK_A_CH = '1 7 3 1 7 6 7 1';
  const BK_B = "3 - - - 5 - 4 - | 3 - - - - - . . | 6 - - - 5 - 4 - | 5 - - - - - . . | 1' - - - 7 - 6 - | 5 - - - 4 - 3 - | 4 - - - 2 - 7, - | 1 - - - - - . .";
  const BK_B_CH = '3 6 4 5 6 3 7 1';
  const BK_B_LOW = '3, - - - - - - - | 6, - - - - - - - | 4, - - - - - - - | 5, - - - - - - - | 6, - - - - - - - | 3, - - - - - - - | 7, - - - - - - - | 1 - - - - - - -';
  const BK_C_LOW = '1 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | 2 - - - - - - - | 1 - - - - - - - | 7, - - - - - - - | 6, - - - - - - - | 5, - - - - - - -';
  const BK_C_HI = '5,! - 3 - - 2 1 - | 2! - - - - - . . | .:8 | .:8 | 5,! - 3 - - 2 1 - | 7,! - - - - - . . | .:8 | .:8';
  const BK_C_CH = '1 2 3 2 1 7 6 5P';
  S('battle_keepers', {
    title: 'Inkweaving — Told Three Ways',
    kind: 'battle',
    motifs: ['road'],
    notes: 'Chapter 7 battle (E aeolian, 114; Snowbell\'s is 112, Lanternfall\'s 116). The storyteller\'s biwa leads: the tune told evenly, bar by bar, the bachi leaning only on the C section\'s motif entries, the road motif in its middle; the 3+3+2 pulse on ōdaiko with a busier shime-daiko and the noh drums calling; a shamisen ostinato and koto eighths. B gives a lyrical shakuhachi line over a falling bowed bass (the version someone else tells); C turns phrygian, the pad a close cluster, the biwa throwing the road motif out with the bachi on its entries while the rin rings once (the waystation bell); B2 hands the shakuhachi\'s line to the biwa.',
    key: 'E', mode: 'aeolian', bpm: 114, loopFrom: 1,
    tracks: {
      lead: { i: 'biwa_tale', o: 3, v: 0.76, rv: 0.22 },
      shaku: { i: 'shakuhachi', o: 4, v: 0.64, rv: 0.25, pan: 0.12 },
      low: { i: 'bowed', o: 3, v: 0.56, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.38, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.27, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.56 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      noh: { perc: true, v: 0.42, pan: -0.25 },
      bell: { perc: true, v: 0.3, rv: 0.5, pan: 0.3 },
    },
    all: {
      ost: "0 0' 2 0' 4 0' 2 0'", arp: "0 2 1' 2 0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z..Z.|Z..zZ.Zz', shime: 'e.eee.e.|eeeeEeee', noh: 'm..q..m.|..m.q.q.', bell: '........',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|Z.z.ZzZZ', noh: 'q.....q.|q.q.q...' },
      A: { bars: 8, ch: BK_A_CH, lead: BK_A },
      B: { bars: 8, ch: BK_B_CH, shaku: BK_B, low: BK_B_LOW },
      C: { bars: 8, mode: 'phrygian', ch: BK_C_CH, low: BK_C_LOW, lead: BK_C_HI, arp: { n: "0 2 1' 2", u: 0.25 }, pad: '0+2+b4', taiko: 'Z..z..Z.|Z.zz.zZz', bell: bell8(4) },
      B2: { bars: 8, ch: BK_B_CH, shaku: BK_B, low: BK_B_LOW, arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { shaku: 'biwa_tale' }, o: { shaku: -1 } }],
  });

  // ============================================================ THE HUNDREDTH TALE
  const BKB_RIFF = '1 1 5, 1 2 1 5, 1 | 1 1 3 2 1 7, 6, 7,';
  const BKB_A = "5 - 4 - 3 - 1 - | 2 - - - 1 - 7, - | 1 - 3 - 5 - 6 - | 5 - - - - - . . | 6 - 5 - 4 - 3 - | 4 - - - 2 - 1 - | 7, - 1 - 2 - 7, - | 1 - - - - - . .";
  const BKB_A_CH = '1 2 6 1 6 4 7 1';
  const BKB_B_CH = '1 2 6 1 1 7 2 1';
  const BKB_B_LOW = '1 - - - - - - - | 2 - - - - - - - | 6, - - - - - - - | 1 - - - - - - - | 1 - - - - - - - | 7, - - - - - - - | 2 - - - - - - - | 1 - - - - - - -';
  // C: the Hush's motif climbing to its raised fourth over open fifths and never landing; the tale that wants no end
  const BKB_C = '5, - 1 - 2 - 3 - | #4 - - - - - - - | 5, - 1 - 2 - 3 - | #4 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - 5 - - - | 6 - - - 5 - 4 - | 5 - - - - - - -';
  const BKB_C_CH = '1P 1P 1P 1P 1P 4 6 1P';
  const BKB_C_LOW = '1 - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 4 - - - - - - - | 6, - - - - - - - | 1 - - - - - - -';
  S('boss_keepers', {
    title: 'The Hundredth Tale',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'The Keepers\' Road\'s boss (D phrygian, 146; Snowbell\'s is 144, Lanternfall\'s 148): the Hundred-Wick Tale, a story that will not end. A biwa riff struck like a teller\'s plectrum on the body of the instrument; shamisen chords, ōdaiko and shime-daiko driving, the hyōshigi clappers as the teller\'s cues, and the rin counting tales. A climbs and falls on the shakuhachi; B is the road motif on the shinobue over a bowed bass; C lets the Hush\'s motif climb on glass to its raised fourth over open fifths, the tale wanting no ending, then the road motif again, on the shakuhachi this time, before A2 takes the tune back on shakuhachi and shinobue together.',
    key: 'D', mode: 'phrygian', bpm: 146, loopFrom: 1,
    tracks: {
      riff: { i: 'biwa', o: 3, v: 0.58, rv: 0.15, pan: -0.2 },
      lead: { i: 'shakuhachi', o: 5, v: 0.62, rv: 0.25 },
      hi: { i: 'shinobue', o: 5, v: 0.52, rv: 0.25, pan: 0.15 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.45, pan: 0.2 },
      low: { i: 'bowed', o: 3, v: 0.55, rv: 0.25, pan: 0.2 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.4, rv: 0.12, pan: 0.25 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 3, v: 0.3, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      taiko: { perc: true, v: 0.6 },
      shime: { perc: true, v: 0.46, pan: 0.2 },
      clap: { perc: true, v: 0.42, pan: -0.25 },
      bell: { perc: true, v: 0.34, rv: 0.5, pan: 0.3 },
    },
    all: {
      riff: BKB_RIFF, ost: "0 2 0' 2 0 2 0' 2", bass: '0 0 - 0 0 - 0 -', pad: '0+1+2',
      taiko: 'Z..z..Z.|Z.z.Z.zZ', shime: 'eeEeeeEe|e.eEe.ee', clap: '..y...y.|..y.y.y.', bell: 'i.......|........|........|........',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, bell: 'i.......|........' },
      A: { bars: 8, ch: BKB_A_CH, lead: BKB_A },
      B: { bars: 8, ch: BKB_B_CH, hi: ROAD, low: BKB_B_LOW },
      C: { bars: 8, ch: BKB_C_CH, glass: BKB_C, low: BKB_C_LOW, riff: null, taiko: 'Z.......|Z...z...', clap: '..y.....|..y...y.' },
      A2: { bars: 8, ch: BKB_A_CH, lead: BKB_A, hi: BKB_A },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B', i: { hi: 'shakuhachi' } }, 'A2'],
  });
})(RB.audio);
