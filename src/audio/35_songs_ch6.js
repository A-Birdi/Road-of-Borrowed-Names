/* Chapter 6 — the Still Archive. The archive road (and the same road walked
 * home afterwards), the room of set-down memories, the battle theme, the
 * last boss, and the cues for the keeper of the Archive and for the note
 * read again. The Still Archive and finale themes are re-orchestrated in
 * place in 30_songs.js; the Hush's own theme stays as it was — glass, open
 * fifths, nothing human in it. Notation: see 30_songs.js.
 *
 * Intensity, the last step: the busiest battle, every drum of the kit, the
 * Hush's colour inside the fight; the final boss is a piece of its own (since
 * 2026-10-12, on Robin's ear: see it below), with bowed strings, a small choir
 * and a temple toll that no other fight has. No brass. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const M = _.mat;
  function S(id, def) {
    def.id = id;
    def.chapter = 6;
    _.songDefs[id] = def;
  }

  // ========================================================== ARCHIVE ROAD
  const SAR_A = '5, - 3 - - 2 1 - | 2 - - - 4 - 3 - | 2 - - - 1 - 7, - | 1 - - - - - . . | 3 - - - 5 - 6 - | 5 - - - 3 - 2 - | 1 - - - 2 - 3 - | 2 - - - - - . .';
  const SAR_A_CH = '1 7 5 1 3 4 6 5';
  const SAR_B_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - 3 - - - | 2 - - - - - - - | .:8';
  const SAR_B_KOTO = '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - . . . . | .:8 | .:8 | .:8 | .:8';
  const SAR_B_CH = '1P 1P 2P 2P 1P 1P 2P 1P';
  const SAR_C = '5, - 3 - - 2 1 - | 2 - - - 1 - 7, - | 5, - 3 - - 2 1 - | 6, - - - 5, - - - | 6, - 1 - 2 - 3 - | 5 - 4 - 3 - 2 - | #7, - - - 2 - - - | 1 - - - - - . .';
  const SAR_C_CH = '1 7 1 6 6 4 5M 1';

  S('sa_road', {
    title: 'The Archive Road',
    kind: 'area',
    motifs: ['road', 'hush'],
    notes: 'Chapter 6 route (B minor, 104): the last climb, the Archive above. A shakuhachi tune opened by the road motif over koto and a low biwa; B is the Archive’s order showing through — B lydian over open fifths and a held shō, the Hush motif on glass, the road motif slipping past on koto; C sets the road motif marching on shamisen over ōdaiko and shime: going on anyway.',
    key: 'B', mode: 'aeolian', bpm: 104, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.68, rv: 0.32 },
      sham: { i: 'shamisen', o: 4, v: 0.48, rv: 0.2, pan: 0.15 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.5, pan: -0.15 },
      frag: { i: 'koto', o: 4, v: 0.45, rv: 0.45, dl: 0.3, pan: 0.3 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.28, rv: 0.3, pan: -0.3 },
      drone: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.36, rv: 0.3, pan: -0.1 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.45 },
    },
    echo: { beats: 0.75, fb: 0.3, mix: 0.25 },
    all: { arp: "0 2 1' 2 0 2 1' 2", drone: '0 - - - - - - -', pad: M.TRI, bass: '0 - - 0 2 - - -', perc: 'p...e..p|..p.e...' },
    sections: {
      intro: { bars: 2, ch: '1 1', lead: '1 - - - - - - - | 7, - - - 5, - - -', perc: null, bass: null, arp: null },
      A: { bars: 8, ch: SAR_A_CH, lead: SAR_A },
      B: { bars: 8, mode: 'lydian', ch: SAR_B_CH, glass: SAR_B_GLASS, frag: SAR_B_KOTO, arp: null, drone: null, pad: '0+1', perc: 'g...g...', dyn: 0.9 },
      C: { bars: 8, ch: SAR_C_CH, sham: SAR_C, drone: '0 . . 0 . . 0 .', perc: 'z..e..e.|z..e.ee.' },
      A2: { bars: 8, ch: SAR_A_CH, lead: SAR_A, sham: SAR_A },
    },
    form: ['intro', 'A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, 'C', 'A2'],
  });

  // ========================================================= THE ROAD HOME
  S('sa_road_home', {
    title: 'The Road of Borrowed Names (Home)',
    kind: 'area',
    motifs: ['road'],
    notes: 'The archive road after the Hush is gone (D, 84): the main theme of the game — the same melody, harmony and form as Chapter 1’s "road" — played by the whole Japanese ensemble the journey gathered: shakuhachi, then shamisen, koto arpeggios where the harp was, a shō where the pad was, shinobue for the answering phrase, hand pats, shime-daiko and a rin.',
    key: 'D', bpm: 84, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.7, rv: 0.3 },
      koto: { i: 'koto', o: 5, v: 0.45, rv: 0.35, pan: 0.25 },
      gt: { i: 'shamisen', o: 4, pat: true, fold: 'all', win: -3, v: 0.32, rv: 0.25, pan: -0.15 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.36, rv: 0.3, pan: -0.25 },
      pad: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.62, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.62 },
      perc: { perc: true, v: 0.42 },
    },
    all: { arp: M.ARP4, pad: M.TRI, bass: M.BASS4, perc: 'p...e..p|....e..p' },
    sections: {
      intro: { bars: 4, ch: '1 4 1 5s4', bass: '0 - - - - - - -', perc: 'i.......|........|........|........' },
      A: { bars: 8, ch: M.ROAD_A_CH, lead: M.ROAD_A },
      Ag: { bars: 8, ch: M.ROAD_A_CH, lead: M.ROAD_A, gt: '1 - - - - - - -', perc: 'p.e.e..p|m.e.e..p' },
      Ab: { bars: 8, ch: M.ROAD_A_CH, lead: M.ROAD_A, koto: M.ROAD_A, gt: '1 - - - - - - -', perc: 'p.e.e..p|m.e.e..p' },
      B: { bars: 8, ch: M.ROAD_B_CH, lead: M.ROAD_B },
      Bg: { bars: 8, ch: M.ROAD_B_CH, lead: M.ROAD_B, gt: '1 - - - 3 - - -' },
      C: { bars: 8, ch: M.ROAD_C_CH, koto: M.ROAD_C, perc: 'i.......|........|........|........', dyn: 0.85 },
    },
    form: ['intro', 'A', { s: 'Ag', i: { lead: 'shamisen' }, o: { lead: -1 } }, 'B', 'Ab', 'C', { s: 'Bg', i: { lead: 'shinobue' } }],
  });

  // ==================================================== SET-DOWN MEMORIES
  const SAM_A = '5 - - - 3 - 2 - | 1 - - - - - . . | 3 - - - 2 - 1 - | 7, - - - - - . . | 6, - - - 7, - 1 - | 2 - - - 3 - 2 - | 1 - - - 7, - 6, - | 7, - - - - - . .';
  const SAM_A_CH = '1 1 3 7 6 1 4 5';
  const SAM_B = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - 6, - - - | 6, - 1 - 2 - 3 - | 4 - - - 3 - - - | 2 - - - 1 - 7, - | 1 - - - - - . .';
  const SAM_B_CH = '1 7 1 6 6 4 5 1';

  S('sa_memories', {
    title: 'Set-Down Memories',
    kind: 'area',
    motifs: ['road'],
    notes: 'The room where the grieving set their memories down (B minor, 58). A slow koto line with a held shō and a rin; then the road motif on shakuhachi in minor, falling where it used to climb, as in the old "Sorrow" — but kept, not lost; the koto answers.',
    key: 'B', mode: 'aeolian', bpm: 58,
    tracks: {
      koto: { i: 'koto', o: 4, v: 0.5, rv: 0.5, pan: 0.15 },
      lead: { i: 'shakuhachi', o: 4, v: 0.62, rv: 0.5 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.24, rv: 0.5, pan: -0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.4, rv: 0.55 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
      bowl: { perc: true, v: 0.28, rv: 0.6, pan: 0.3 },
    },
    all: { arp: "0 . 2 . 1' . 2 .", sho: M.TRI, bass: '0 - - - - - - -', bowl: 'i.......|........|........|........' },
    sections: {
      A: { bars: 8, ch: SAM_A_CH, koto: SAM_A },
      B: { bars: 8, ch: SAM_B_CH, lead: SAM_B },
      A2: { bars: 8, ch: SAM_A_CH, lead: SAM_A, koto: '.:8 | . . . . 5 - 6 - | .:8 | . . . . 3 - 2 - | .:8 | . . . . 5 - 4 - | .:8 | .:8' },
    },
    form: ['A', 'B', 'A2'],
  });

  // ================================================================ BATTLE
  const BST_A = '1 - - 7, 1 - 3 - | 2 - 1 - 7, - 5, - | 1 - - 7, 1 - 4 - | 3 - - - - - . . | 5, - 3 - - 2 1 - | 2 - 3 - 4 - 5 - | 4 - 3 - 2 - 7, - | 1 - - - - - . .';
  const BST_A_CH = '1 7 4 3 1 6 7 1';
  const BST_B = "5 - 4 - 3 - 4 - | 5 - - - - - . . | 6 - 5 - 4 - 5 - | 6 - - - - - . . | 7 - 6 - 5 - 6 - | 7 - 1' - 2' - 1' - | 7 - 6 - 5 - 4 - | 5 - - - - - . .";
  const BST_B_CH = '5 5 6 6 7 7 4 5M';
  const BST_B_LOW = '5, - - - - - - - | 5, - - - - - - - | 6, - - - - - - - | 6, - - - - - - - | 7, - - - - - - - | 7, - - - - - - - | 4, - - - - - - - | 5, - - - - - - -';
  const BST_C_LOW = '1 - - - - - - - | 2 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | 5 - - - - - - - | 2 - - - - - - - | 5 - - - - - - - | 5 - - - - - - -';
  const BST_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BST_C_HI = '.:8 | .:8 | 5,! - 3 - - 2 1 - | 2! - - - - - . . | .:8 | .:8 | .:8 | .:8';
  const BST_C_CH = '1P 1P 2P 2P 1P 2P 5P 5P';

  S('battle_still', {
    title: 'Inkweaving — Every Name',
    kind: 'battle',
    motifs: ['road', 'hush'],
    notes: 'Chapter 6 battle (B minor, 120). The 3+3+2 pulse with the whole kit: ōdaiko, shime-daiko in eighths, kotsuzumi and ōtsuzumi, hyōshigi, chappa; shamisen and koto ostinati under everything. A: a shakuhachi tune that runs into the road motif; B: koto high up over a bowed bass and unsettled ninth chords; C is the Archive’s order inside the fight — B lydian over open fifths with a cluster held inside them (root, flat ninth, raised fourth, fifth), the Hush motif on glass, a climbing bowed line, koto sixteenths, and the road motif thrown back on shinobue; B2 gives the koto line to the shamisen.',
    key: 'B', mode: 'aeolian', bpm: 120, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.25 },
      koto: { i: 'koto', o: 4, v: 0.5, rv: 0.28, pan: 0.2 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.4, pan: 0.2 },
      hi: { i: 'shinobue', o: 5, v: 0.45, rv: 0.3, pan: -0.2 },
      low: { i: 'bowed', o: 3, v: 0.55, rv: 0.25, pan: -0.15 },
      ost: { i: 'shamisen', o: 3, pat: true, v: 0.36, rv: 0.12, pan: -0.25 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.26, rv: 0.25, pan: 0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.32, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.66 },
      taiko: { perc: true, v: 0.52 },
      shime: { perc: true, v: 0.4, pan: 0.2 },
      noh: { perc: true, v: 0.42, pan: -0.25 },
      metal: { perc: true, v: 0.3, rv: 0.3, pan: 0.3 },
    },
    all: {
      ost: "0 0' 2 0' 1' 0' 2 0'", arp: "0 2 1' 2 0 2 1' 2", bass: '0 - - 0 - - 0 -', pad: '0+1+2+4',
      taiko: 'Z..z..Z.|Z.zzZzZz', shime: 'eeEeeEee|eeEeeEee', noh: 'm..q..m.|q..m.qq.', metal: 'v......y|.......y|.......y|.......y',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, arp: null, taiko: 'Z..z..Z.|ZzZzZZZZ', noh: 'q.q.q...|q.q.q.q.', metal: 'v.......|........' },
      A: { bars: 8, ch: BST_A_CH, lead: BST_A },
      B: { bars: 8, ch: BST_B_CH, koto: BST_B, low: BST_B_LOW, pad: '0+1+2+3+4' },
      C: { bars: 8, mode: 'lydian', ch: BST_C_CH, low: BST_C_LOW, glass: BST_C_GLASS, hi: BST_C_HI, arp: { n: "0 2 1' 2", u: 0.25 }, pad: '0+b3+b2+2', taiko: 'Z..z..Z.|Z.zzZzZZ' },
      B2: { bars: 8, ch: BST_B_CH, koto: BST_B, low: BST_B_LOW, pad: '0+1+2+3+4', arp: { n: "0 2 1' 2", u: 0.25 } },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { koto: 'shamisen' } }],
  });

  // ============================================================ FINAL BOSS
  // The last fight is a piece of its own (Robin, 2026-10-12: "a unique, intense and conclusive final battle theme";
  // the earlier version thinned into lydian glass and then sang the road theme in F major on two flutes, from about
  // 29 s, which read "like a singsong lullaby"). It keeps the opening Robin liked (the sterile intro, the riff, the
  // Hush motif on glass, the road motif falling on shakuhachi) over its own engine, which no other boss uses: bowed
  // strings in sixteenths, biwa stabs and a galloping 3+3+2 on the drums, the big drum and a temple toll. Then the
  // Hush takes the voices (C), and the last stand has a melody of its own, sung (D, E), in minor to the end: an
  // aeolian cadence (bVI, bVII, i) struck by the toll.
  const BOS6_RIFF = '1 5, 1 2 3 2 1 5, | 1 5, 1 2 4 3 2 1';
  const BOS6_A_CH = '1 2 1 2 6 7 2 2';
  const BOS6_HUSH = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const BOS6_A_KOTO = '.:8 | .:8 | .:8 | .:8 | 3 - - - 5 - - - | 3 - - - 4 - 3 - | 2 - - - - - - - | .:8';
  const BOS6_B = '5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - - -';
  const BOS6_B_CH = '1 2 1 7 6 4 1 2';
  // the Hush cutting in, in eighths, at the end of each half of B
  const BOS6_B_GLASS = '.:8 | .:8 | .:8 | . . . 5, 1 2 3 #4 | .:8 | .:8 | .:8 | . . . 5, 1 2 3 #4';
  // C, the Hush takes the voices: its motif sung a bar a note, played in canon and then in eighths; the road motif
  // tries twice and is cut off; the drums thin to a heartbeat that quickens into a roll
  const BOS6_C_CH = '1P 1P 2P 2P 1P 1P 2P 5P';
  const BOS6_C_CHOIR = '5, - - - - - - - | 1 - - - - - - - | 2 - - - - - - - | 3 - - - - - - - | #4 - - - - - - - | - - - - - - - - | - - - - - - - - | - - - - . . . .';
  const BOS6_C_GLASS = '5, - 1 - 2 - 3 - | #4 - - - - - - - | .:8 | .:8 | 5, 1 2 3 #4 - 5, 1 | 2 3 #4 - 5, 1 2 3 | #4 - 5, 1 2 3 #4 - | #4 - - - . . . .';
  const BOS6_C_LOW = '.:8 | .:8 | 5, - 1 - 2 - 3 - | #4 - - - - - - - | .:8 | .:8 | 5, 1 2 3 #4 - 5, 1 | 2 3 #4 - . . . .';
  const BOS6_C_CUT = '.:8 | .:8 | 5, - 3 - . . . . | .:8 | .:8 | .:8 | 5, - 3 - . . . . | .:8';
  // D and E, the last stand (F aeolian): a melody of its own, leaping (a fourth, a fifth), in 3+3+2, over a bass
  // that falls F, E-flat, D-flat, C; E climbs higher and ends on the cadence. The cello carries the Hush motif with
  // its fourth natural (answered, as the finale will have it) and the road motif under the climb.
  const BOS6_D_CH = '1 7 4 5M 1 7 6:0.5 7:0.5 1';
  const BOS6_D = "1 - - 5 - - 1' - | 7 - - 6 - - 5 - | 4 - - 6 - - 5 4 | 5 - - - #7, - - - | 1 - - 5 - - 1' - | 2' - - 1' - - 7 - | 3' - - - 2' - - - | 1' - - - - - . .";
  const BOS6_D_HI = ".:8 | .:8 | .:8 | .:8 | 1 - - 5 - - 1' - | 2' - - 1' - - 7 - | 3' - - - 2' - - - | 1' - - - - - . .";
  const BOS6_D_CELLO = '1 - - - - - - - | 7, - - - - - - - | 6, - - - - - - - | 5, - - - - - - - | 1 - - - - - - - | 2 - - - - - - - | 3 - - - 2 - - - | 1 - - - - - - -';
  const BOS6_D_GLASS = '.:8 | .:8 | .:8 | . . . 5, 1 2 3 #4 | .:8 | .:8 | .:8 | .:8';
  const BOS6_E_CH = '4 7 1 5M 6:0.5 7:0.5 7 6:0.5 7:0.5 1P';
  const BOS6_E = "4 - - 6 - - 1' - | 2' - - 1' - - 6 - | 5 - - 1' - - 7 6 | 5 - - - #7, - - - | 3' - - - 2' - - - | 1' - - - 7 - 6 - | 5 - - - 6 - 7 - | 1' - - - - - - -";
  const BOS6_E_CELLO = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - - - | 6, - - - 7, - - - | 1 - - - - - - -';
  // the strings' sixteenths (soft while the Hush works, then full) and the drums, bar by bar
  // (the strings in eighths in A and B and in sixteenths from C, the shime in sixteenths in C's roll and in E: the
  // drive grows, and the sixteenths cost CPU only where they count)
  const soft = (p) => p.split(' ').map((x) => x + '?').join(' ');
  const SAW_P = '0 0 1 0 0 0 1 0 0 0 1 0 2 1 0 1', SAW = '0 0 1 0 2 0 1 0 0 0 1 0 2 1 0 2', SAW8 = '0 0 1 0 0 1 2 1';
  const bars = (...b) => b.join(' | ');
  const SAW_C = bars(...Array(4).fill(soft(SAW_P)), ...Array(4).fill(SAW_P));
  const SAW_E = bars(...Array(7).fill(SAW), '0! - - - - - - - - - - - - - - -');
  const GALLOP = 'Z.zZ.zZ.|Z.zZ.zZZ';
  const SHIME16 = 'EeeeeeEeeeeeEeee', SHIME8 = 'Eee.Eee.|EeeEeeEe', BASS332 = '0! . . 0 . . 0 .';
  const TAIKO_C = 'Z...............|Z.......Z.......|Z.......Z.......|Z...Z...Z...Z...|Z...Z...Z...Z...|Z.Z.Z.Z.Z.Z.Z.Z.|Z.Z.Z.Z.ZzZzZzZz|zzzzzzzzZZZZZZZZ';
  const SHIME_C = '................|................|................|................|e...e...e...e...|e.e.e.e.e.e.e.e.|eeeeeeeeeeeeeeee|EEEEEEEEEEEEEEEE';
  const TOLL_AT = (k) => Array.from({ length: 8 }, (x, i) => (k.includes(i + 1) ? '1 - - - - - - -' : '.:8')).join(' | ');

  S('boss_hush', {
    title: 'Nothing Left to Shelve',
    kind: 'boss',
    motifs: ['road', 'hush'],
    notes: 'The last fight (F phrygian, then F aeolian, 156), against the Hush itself, and a piece of its own: no other boss has its engine (bowed strings in sixteenths, biwa stabs, a galloping 3+3+2 on ōdaiko and shime-daiko, the big drum, a temple toll at the turns). It opens sterile, glass ticks and a shō; then the riff and the drums arrive, the Hush motif on glass against koto, and the road motif falls on shakuhachi and shinobue while the Hush cuts in. C is the Hush taking the voices: a choir sings its motif a bar a note up to the raised fourth, glass and koto play it in canon and then in eighths, the road motif tries twice and is cut off, and the drums thin to a heartbeat that quickens into a roll. D and E are the last stand, in F minor: a melody of its own, sung by the choir with shakuhachi and later shinobue, leaping a fourth and a fifth in 3+3+2 over a bass falling F, E-flat, D-flat, C; under it the cello plays the Hush motif with its fourth made natural, then the road motif; it ends on an aeolian cadence (D-flat, E-flat, F) struck by the toll, and the fight goes round again.',
    key: 'F', mode: 'phrygian', bpm: 156, loopFrom: 1,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.7, rv: 0.22 },
      hi: { i: 'shinobue', o: 5, v: 0.42, rv: 0.25, pan: 0.2 },
      choir: { i: 'choir', o: 4, v: 0.46, rv: 0.35, pan: -0.05 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.4, pan: 0.2 },
      koto: { i: 'koto', o: 5, v: 0.5, rv: 0.3, pan: -0.2 },
      low: { i: 'koto', o: 3, v: 0.42, rv: 0.3, pan: -0.25 },
      cello: { i: 'bowed', o: 3, v: 0.5, rv: 0.25, pan: -0.1 },
      riff: { i: 'biwa', o: 3, v: 0.5, rv: 0.12, pan: -0.15 },
      saw: { i: 'bowed', o: 2, pat: true, v: 0.27, rv: 0.15, pan: 0.15 },
      stab: { i: 'biwa', o: 3, pat: true, v: 0.36, rv: 0.12, pan: 0.25 },
      voices: { i: 'choir', o: 4, hold: true, fold: 'all', win: 0, v: 0.25, rv: 0.4 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.55, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.62 },
      toll: { i: 'toll', o: 2, v: 0.44, rv: 0.5 },
      big: { perc: true, v: 0.44 },
      taiko: { perc: true, v: 0.52 },
      shime: { perc: true, v: 0.32, pan: 0.15 },
      noh: { perc: true, v: 0.4, pan: -0.1 },
      tick: { perc: true, v: 0.4, pan: 0.3 },
    },
    all: {
      riff: BOS6_RIFF, bass: "0 0 0' 0 0 0 0' 0", sho: M.TRI, saw: SAW8, stab: '0+2! . . 0+2 . . 0+2 .',
      taiko: GALLOP, shime: SHIME8, big: 'O.......|........|........|........', noh: '....q...|m...q.qm',
      tick: 'v.......|........|v.......|........',
    },
    sections: {
      intro: { bars: 2, ch: '1P 1P', riff: null, saw: null, stab: null, bass: null, taiko: null, shime: null, big: null, noh: null, tick: 'g.g.g.g.|g.g.gggg' },
      A: { bars: 8, ch: BOS6_A_CH, glass: BOS6_HUSH, koto: BOS6_A_KOTO, stab: null, toll: TOLL_AT([1]) },
      B: { bars: 8, ch: BOS6_B_CH, lead: BOS6_B, hi: BOS6_B, glass: BOS6_B_GLASS, voices: M.TRI, stab: null, toll: TOLL_AT([1]) },
      C: {
        bars: 8, ch: BOS6_C_CH, choir: BOS6_C_CHOIR, glass: BOS6_C_GLASS, low: BOS6_C_LOW, lead: BOS6_C_CUT, riff: null, stab: null, bass: '0 - - - - - - -',
        saw: { n: SAW_C, u: 0.25 }, taiko: { n: TAIKO_C, u: 0.25 }, shime: { n: SHIME_C, u: 0.25 }, tick: 'g.g.g.g.',
        noh: '........|........|........|q.......|........|........|q...q...|q.q.qqqq', big: 'O.......|........|........|........|O.......|........|........|O...O.OO', toll: TOLL_AT([1, 5]),
      },
      D: {
        bars: 8, mode: 'aeolian', ch: BOS6_D_CH, choir: BOS6_D, lead: BOS6_D, hi: BOS6_D_HI, cello: BOS6_D_CELLO, glass: BOS6_D_GLASS, voices: M.TRI, riff: null, sho: null,
        saw: { n: SAW, u: 0.25 }, bass: BASS332, noh: 'q..m..q.|q.qm..qq', tick: 'V.......|........|........|........|V.......|........|........|....V...', toll: TOLL_AT([1, 5]),
      },
      E: {
        bars: 8, mode: 'aeolian', ch: BOS6_E_CH, choir: BOS6_E, lead: BOS6_E, hi: BOS6_E, cello: BOS6_E_CELLO, voices: M.TRI, riff: null, sho: null,
        saw: { n: SAW_E, u: 0.25 }, bass: bars(...Array(7).fill(BASS332), '0 - - - - - - -'), stab: bars(...Array(7).fill('0+2! . . 0+2 . . 0+2 .'), '0+2! . . . . . . .'),
        taiko: 'Z.zZ.zZ.|Z.zZ.zZZ|Z.zZ.zZ.|Z.zZ.zZZ|Z.zZ.zZ.|Z.zZ.zZZ|ZzZzZzZZ|Z.......', shime: { n: bars(...Array(7).fill(SHIME16), 'E...............'), u: 0.25 },
        big: 'O.......|........|O.......|........|O.......|........|O...O...|O.......', noh: 'q..m..q.|q.qm..qq|q..m..q.|q.qm..qq|q..m..q.|q.qm..qq|q.q.q.q.|Q.......',
        tick: 'V.......|........|........|........|V.......|........|........|V.......', toll: TOLL_AT([1, 8]),
      },
    },
    // (the last stand a little under full level: everything sounds at once there, and its peaks stay within the game's)
    form: ['intro', 'A', 'B', 'C', { s: 'D', dyn: 0.9 }, { s: 'E', dyn: 0.9 }],
  });

  // ============================================================ STORY CUES
  // The keeper of the Archive: the Hush's motif, and a tired human voice.
  const SAK_A = '3 - - - 2 - 1 - | 2 - - - - - . . | 3 - - - 4 - 5 - | 4 - - - - - . . | 5 - - - 4 - 3 - | 2 - - - 3 - 2 - | 3 - - - 2 - - - | 1 - - - - - . .';
  const SAK_A_CH = '1 2 1 2 1 2 5 1';
  const SAK_B_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const SAK_B_KOTO = '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - . . | .:8 | .:8 | 5, - 3 - - . . . | .:8';

  S('sa_kasane', {
    title: 'The Keeper',
    kind: 'scene',
    motifs: ['road', 'hush'],
    notes: 'Cue (F lydian, 60) for meeting the keeper of the Still Archive and for the last words before the Hush breaks loose. Her line is human — a shakuhachi in even, careful steps that sighs at the ends of phrases — over the Hush’s own colour: a held shō, glass, the raised fourth. In B the Hush motif and the road motif take turns, and the road motif is cut off.',
    key: 'F', mode: 'lydian', bpm: 60,
    tracks: {
      lead: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.5 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.55, pan: 0.2 },
      koto: { i: 'koto', o: 4, v: 0.45, rv: 0.5, pan: -0.2 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.45, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.38 },
      tick: { perc: true, v: 0.35, rv: 0.3, pan: 0.25 },
    },
    all: { sho: M.TRI, bass: '0 - - - - - - -', tick: 'g...g...' },
    sections: {
      A: { bars: 8, ch: SAK_A_CH, lead: SAK_A },
      B: { bars: 8, ch: '1P 1P 2P 2P 1P 1P 2P 2P', glass: SAK_B_GLASS, koto: SAK_B_KOTO, sho: '0+1' },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'koto' } }],
  });

  // The note read again, in context: the Hush's motif finds its natural fourth.
  const SAT_A_KOTO = '5, - 1 - 2 - 3 - | 4 - - - 3 - - - | 2 - - - - - - - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const SAT_A_SH = '.:8 | .:8 | .:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 1 - - - - - . .';
  const SAT_A_CH = '1 4 5 1 1 5 1 1';
  S('sa_toya', {
    title: 'The Note, Read Again',
    kind: 'scene',
    motifs: ['road', 'hush'],
    notes: 'Cue (D, 63) for the old note read again in its context. The Hush motif on koto — but in D major with a natural fourth that steps down and resolves; then the road motif answers on shakuhachi, gently. B lays the main theme over a held shō with the resolved Hush motif beneath it on glass, as the finale will.',
    key: 'D', bpm: 63,
    tracks: {
      koto: { i: 'koto', o: 5, v: 0.5, rv: 0.5, pan: -0.15 },
      lead: { i: 'shakuhachi', o: 5, v: 0.64, rv: 0.5 },
      glass: { i: 'glass', o: 4, v: 0.8, rv: 0.5, pan: 0.2 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.22, rv: 0.5, pan: 0.25 },
      sho: { i: 'sho', o: 4, hold: true, fold: 'all', win: 0, v: 0.42, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
      bowl: { perc: true, v: 0.3, rv: 0.6, pan: 0.3 },
    },
    all: { arp: "0 . 2 . 1' . 2 .", sho: M.TRI, bass: '0 - - - - - - -', bowl: 'i.......|........|........|........' },
    sections: {
      A: { bars: 8, ch: SAT_A_CH, koto: SAT_A_KOTO, lead: SAT_A_SH },
      B: { bars: 8, ch: M.ROAD_A_CH, lead: M.ROAD_A, glass: M.FIN_C_GLASS },
    },
    form: ['A', 'B', { s: 'A', i: { koto: 'shakuhachi', lead: 'koto' } }],
  });

  _.REQUIRED_SONGS.push('sa_road', 'sa_road_home', 'sa_memories', 'battle_still', 'boss_hush', 'sa_kasane', 'sa_toya');
})(RB.audio);
