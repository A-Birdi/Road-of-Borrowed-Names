/* Song data — original music for The Road of Borrowed Names.
 * This file: the shared motifs, Chapter 1 and the songs used across the
 * game. Zone music from Chapter 2 on (overworld, battle, boss and story
 * cues, with the Japanese instruments) is in 31_songs_ch2.js … 36_songs_ch6.js;
 * which battle/boss theme plays where is in 39_zones.js.
 *
 * ============================== NOTATION ==================================
 * A song is { title, key, mode, bpm, meter, tracks, all, sections, form }.
 *
 *  key    tonic name: C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B
 *  mode   ionian (default) | dorian | phrygian | lydian | mixolydian | aeolian
 *  meter  beats per bar (quarter-note beats). 4 = 4/4, 3 = 3/4 or 6/8 when
 *         written in eighths, 3.5 = 7/8. Sections may override key, mode,
 *         bpm and meter (the credits medley does).
 *  loop   false for stings/cutscenes; loopFrom: form index where the loop
 *         restarts (lets an intro play once).
 *  swing  0..0.33 — delays off-beat eighths by swing/2 of a beat.
 *  echo   { beats, fb, mix } per-song feedback delay; tracks send with `dl`.
 *
 * TRACKS  name: { i: instrument, o: octave of the tonic, v: level, pan,
 *                 rv: reverb send, dl: echo send, u: beats per step (0.5) }
 *   instruments: pluck harp bell celesta toll glass flute bowed bass pad keys
 *                mallet choir
 *   Japanese:    shamisen biwa koto koto_oshi (plucked a whole tone low and
 *                pressed up to the written note) shakuhachi shinobue sho rin
 *   Kinds of track:
 *   - melody (default): scale DEGREES.
 *   - pat: true   — chord-tone PATTERN that follows the section's chords.
 *                  bass: true makes tone 0 follow slash-chord bass notes.
 *                  fold: 'all' folds every tone into one octave window
 *                  starting `win` semitones from the tonic (close voicing).
 *   - hold: true  — one sustained chord per chord change (pads, choir).
 *   - perc: true  — one character per step (see letters below).
 *
 * MELODY TOKENS (space separated; one token = one step of `u` beats)
 *   1..7        scale degree in the current key/mode (1 = tonic at octave o)
 *   #4 b7       chromatic alteration
 *   5, 1' 3''   octave down / up (repeatable)
 *   -           extend the previous note (or rest) by one step
 *   .           rest one step;  .:8 rest eight steps
 *   x:n         any note/rest lasting n steps (e.g. 5:3, 1+3+5:12)
 *   1+3+5       notes sounding together
 *   5! 5?       accent / soft
 *   |           bar line — CHECKED: every bar must contain exactly meter/u steps
 *   A track line must fill its section exactly, or divide it evenly (it then
 *   repeats). Pattern and percussion lines cycle and are cut at section end.
 *
 * PATTERN TOKENS: same, but digits are chord tones: 0 root, 1 third, 2 fifth,
 *   3 seventh, 4 ninth (diatonic unless the chord says otherwise).
 *
 * CHORDS (section.ch, one token per bar unless :n or chu says otherwise)
 *   1..7 diatonic triad on that degree (so 6 in major is minor)
 *   b6 #4   chromatic root (major triad unless a quality is given)
 *   quality suffixes: M major  m minor  D dominant-7  o diminished
 *                     P open fifth (no third)  s4 / s2 suspended
 *   1/3     slash chord (bass plays degree 3)
 *   :0.5    lasts half a bar;  -  extends the previous chord;  .  no chord
 *
 * PERCUSSION letters (upper case = accent)
 *   k soft kick   t hand tom   l low drum   s shaker   b brush   p hand pat
 *   w woodblock   h high woodblock   r rim   x clock tick   g glass tick
 *   d water drop  c wooden creak   j small bells   o big drum (bosses)
 *   n frame-drum snap   . rest   | bar check
 *   Japanese:  z ōdaiko (don)   e shime-daiko (ten)   f taiko rim (ka)
 *              m kotsuzumi (pon)   q ōtsuzumi (kan)   y hyōshigi clappers
 *              a atarigane hand gong   v chappa cymbals   i rin bowl bell
 *
 * FORM entries: 'A' or { s:'A', i:{track:inst}, o:{track:+1}, m:[muted],
 *   tr: semitones, dyn, key, mode, bpm }. Sections may use from:'A' to
 *   inherit another section's lines and override some.
 * ========================================================================== */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const defs = (_.songDefs = {});
  function S(id, def) {
    def.id = id;
    defs[id] = def;
  }

  // ------------------------------------------------------------ motifs
  // Degree strings; tests check each song quotes the motifs it claims by
  // matching the diatonic step contour (transposition/mode independent).
  _.motifs = {
    road: {
      deg: '5, 3 2 1 2',
      notes: 'Main theme. A rising sixth and a stepwise fall that turns back up — setting out, looking back, going on.',
    },
    hush: {
      deg: '5, 1 2 3 4',
      notes: 'The antagonist. The road motif’s own pitches sorted into order and evened out, ending on a raised fourth (in lydian) that never resolves — until the finale, where it lands on a natural fourth.',
    },
    nao: {
      deg: '1 1 5 4 3 4 1',
      notes: 'Nao, courier: two quick knocks, a glance up a fifth, a wry sidestep, home.',
    },
    mio: {
      deg: '3 2 3 5 3 2 3',
      notes: 'Mio, apothecary: a small symmetrical figure straightened like labelled bottles, closing firmly on the tonic.',
    },
    ren: {
      deg: "5, 1 4 5 1' 7 1'",
      notes: 'Ren, lantern keeper: fourths climbing like a lamplighter, then a small turn that is nearly a joke.',
    },
    suzu: {
      deg: "1 1' 7 b7 6 5",
      notes: 'Suzu, performer: a flourish up an octave and a sly chromatic slide back down, like a bow.',
    },
  };
  // Diatonic step contour of a degree string (used by tests and tooling).
  _.motifSteps = function (deg) {
    const sd = deg.trim().split(/\s+/).map((t) => {
      const m = /^[#b]?([1-7])([',]*)$/.exec(t);
      if (!m) throw new Error('bad motif token ' + t);
      let oc = 0;
      for (const c of m[2]) oc += c === "'" ? 1 : -1;
      return +m[1] - 1 + 7 * oc;
    });
    return sd.slice(1).map((v, i) => v - sd[i]);
  };

  // ------------------------------------------------ shared accompaniment
  const ARP4 = "0 2 1' 2 4 2 1' 2";
  const ARP3 = "0 2 1' 2 4 2";
  const BASS4 = '0 - - - - - 2 -';
  const BASS3 = '0 - - 2 - -';
  const TRI = '0+1+2';

  // ------------------------------------------------------ road material
  const ROAD_A = "5, - 3 - - 2 1 - | 2 - - - . 1 6, 1 | 5, - 3 - - 2 1 - | 6, - - - 5, - - - | 3 - - 5 6 - 5 - | 1' - - - 7 6 5 - | 4 - - 3 2 - 5, - | 1 - - - - - . .";
  const ROAD_A_CH = '1 2 6 4:0.5 5:0.5 4 1/3 2:0.5 5:0.5 1';
  const ROAD_B = "6 - - 5 6 - 1' - | 7 - 6 - 5 - - - | 4 - - 3 4 - 6 - | 5 - - - - - . . | 6 - - 5 6 - 1' - | 2' - 1' - 7 - 5 - | 4 - 3 - 2 - 5, - | 2 - - - - - . .";
  const ROAD_B_CH = '6 3 4 1:0.5 5:0.5 6 5 4:0.5 5:0.5 5';
  const MINOR_B_CH = '6 3 4 1:0.5 5M:0.5 6 5 4:0.5 5M:0.5 5M';
  const ROAD_C = "5, - 3 - - 2 1 - | 7, - - - . . . . | 4, - 2 - - 1 7, - | 6, - - - . . . . | 3, - 1 - - 7, 6, - | 5, - - - . . . . | 4 - - - 3 - - - | 2 - - - - - . .";
  const ROAD_C_CH = '6 3 4 2 6 4 5s4 5';

  // companion motifs placed over one shared progression (departure, credits)
  const DEP_B_CH = '2 5 1 1 5s4 1 1:0.5 1D:0.5 4:0.5 1:0.5';
  const DEP_NAO = '2 2 . 6 - 5 4 5 | 2 - - - . . . . | .:8 | .:8 | .:8 | .:8 | .:8 | .:8';
  const DEP_MIO = '.:8 | .:8 | 3 2 3 5 3 2 3 - | 1 - - - . . . . | .:8 | .:8 | .:8 | .:8';
  const DEP_REN = ".:8 | .:8 | .:8 | .:8 | 5, - 1 - 4 - 5 - | 1' - 7 1' - - - - | .:8 | .:8";
  const DEP_SUZU = ".:8 | .:8 | .:8 | .:8 | .:8 | .:8 | 1 1' 7 b7 6 - 5 - | 3 - - - 2 - 1 -";
  // shared with the zone files (31_… 36_)
  _.mat = { ARP4, ARP3, BASS4, BASS3, TRI, ROAD_A, ROAD_A_CH, ROAD_B, ROAD_B_CH, MINOR_B_CH, ROAD_C, ROAD_C_CH };
  const COMPANION_TRACKS = () => ({
    nao: { i: 'pluck', o: 4, v: 0.75, rv: 0.25, pan: -0.2 },
    mio: { i: 'mallet', o: 5, v: 0.75, rv: 0.25, pan: 0.2 },
    ren: { i: 'bell', o: 4, v: 0.65, rv: 0.4 },
    suzu: { i: 'flute', o: 5, v: 0.75, rv: 0.3 },
  });

  // ======================================================== TITLE / INTRO
  S('title', {
    title: 'Lanterns at Dusk (Title)',
    kind: 'area',
    motifs: ['road'],
    notes: 'The road motif alone on celesta, like a lantern being lit; then the full main theme on flute. Loops from the theme, not the intro.',
    key: 'D', bpm: 66, loopFrom: 1,
    tracks: {
      lead: { i: 'flute', o: 5, v: 0.8, rv: 0.35 },
      bell: { i: 'celesta', o: 5, v: 0.6, rv: 0.4, pan: 0.2 },
      gt: { i: 'bowed', o: 4, pat: true, fold: 'all', win: -3, v: 0.55, rv: 0.3, pan: -0.15 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.5, rv: 0.35, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.5, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
    },
    all: { pad: TRI, arp: ARP4, bass: '0 - - - - - - -' },
    sections: {
      intro: { bars: 4, ch: '1 2 1/3 5s4', bell: "5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 6, - - - 5, - - -", arp: null, bass: null },
      A: { bars: 8, ch: ROAD_A_CH, lead: ROAD_A },
      B: { bars: 8, ch: ROAD_B_CH, lead: ROAD_B, gt: '1 - - - - - - -' },
      A2: { bars: 8, ch: ROAD_A_CH, bell: ROAD_A, gt: '1 - - - 3 - - -' },
    },
    form: ['intro', 'A', 'B', 'A2'],
  });

  S('prologue', {
    title: 'The Name That Went Out (Prologue)',
    kind: 'cutscene',
    loop: false,
    motifs: ['road', 'hush'],
    notes: '~48 s cutscene. The road motif on celesta; the Hush motif answers on glass in D lydian over open fifths and a glass tick; the road motif returns with its notes missing and stops unresolved.',
    key: 'D', bpm: 60,
    tracks: {
      bell: { i: 'celesta', o: 5, v: 0.65, rv: 0.45 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.5, pan: 0.2 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.5, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
      tick: { perc: true, v: 0.5, rv: 0.3 },
    },
    sections: {
      p1: { bars: 4, ch: '1 2 6 4', bell: "5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 6, - - - - - . .", pad: TRI, bass: '0 - - - - - - -' },
      p2: { bars: 4, mode: 'lydian', ch: '1P 2P 1P 2P', glass: '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - - - - -', pad: '0+1', tick: 'g.......' },
      p3: { bars: 4, ch: '6 4 1s2 1s2', bell: '5, - 3 - - . . . | .:8 | 5, - . . . . . . | .:8', pad: '0+2+4', dyn: 0.8 },
    },
    form: ['p1', 'p2', 'p3'],
  });

  // ============================================================= REEDWAKE
  const REED_A = "1 - 2 3 - 5 | 6 - 5 3 - - | 2 - 3 2 - 1 | 6, - - 5, - - | 1 - 2 3 - 5 | 6 - 1' 7 - 6 | 5 - 3 2 - 3 | 1 - - - - -";
  const REED_A_CH = '1 6 2 5 1 4 5 1';
  const REED_A_CM = "3 - - 5 - - | 3 - - - - - | 4 - - 3 - - | 2 - - - - - | 3 - - 5 - - | 1' - - - - - | 7 - - 6 - - | 5 - - - - -";
  const REED_B = "6 - 5 6 - 1' | 5 - - 3 - - | 4 - 3 4 - 6 | 5 - - - - - | 5, - 3 - 2 1 | 2 - - 3 - 5 | 6 - 5 3 - 2 | 2 - - - - -";
  const REED_B_CH = '6 3 4 5 1 2 4 5';
  const REED_C = '3 - - 2 - 1 | 6, - - - - - | 3 - - 2 - 1 | 7, - - - - - | 1 - 2 3 - 2 | 1 - 6, 5, - - | 6, - 1 2 - 3 | 2 - - - - -';
  const REED_C_CH = '6 6 4 3 4 1 2 5';

  S('reedwake', {
    title: 'Reedwake — Mending Day',
    kind: 'area',
    motifs: ['road'],
    notes: 'Lilting 6/8 village tune in G: plucked strings like reeds in the current, flute, mallet, light woodblock and shaker. B quotes the road motif where the village road leaves town; C is the quieter storm-memory strain in E-minor colour.',
    key: 'G', bpm: 96, meter: 3,
    tracks: {
      lead: { i: 'flute', o: 4, v: 0.85, rv: 0.25 },
      mal: { i: 'mallet', o: 4, v: 0.75, rv: 0.2, pan: 0.2 },
      cm: { i: 'celesta', o: 5, v: 0.7, rv: 0.35, pan: -0.2 },
      arp: { i: 'pluck', o: 4, pat: true, v: 0.45, rv: 0.2, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.4, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.45 },
    },
    all: { arp: ARP3, pad: TRI, bass: BASS3, perc: 'w..s.s|...s.s' },
    sections: {
      intro: { bars: 2, ch: '1 5s4', perc: null },
      A: { bars: 8, ch: REED_A_CH, lead: REED_A },
      A2: { bars: 8, ch: REED_A_CH, mal: REED_A, cm: REED_A_CM },
      B: { bars: 8, ch: REED_B_CH, lead: REED_B },
      A3: { bars: 8, ch: REED_A_CH, lead: REED_A, cm: REED_A_CM, perc: 'w.ss.s|p.ss.s' },
      C: { bars: 8, ch: REED_C_CH, lead: REED_C, perc: null, dyn: 0.85 },
      B2: { bars: 8, ch: REED_B_CH, mal: REED_B },
    },
    form: ['intro', 'A', 'A2', 'B', 'A3', { s: 'C', i: { arp: 'harp' } }, 'B2'],
  });

  S('reedwake_night', {
    title: 'Reedwake — Lamps on the Water',
    kind: 'area',
    motifs: ['road'],
    notes: 'The village tune slowed for night (72): celesta and harp, no drums — only a woodblock now and then, like a boat knocking at its mooring.',
    key: 'G', bpm: 72, meter: 3,
    tracks: {
      lead: { i: 'celesta', o: 5, v: 0.6, rv: 0.45 },
      fl: { i: 'flute', o: 4, v: 0.65, rv: 0.4 },
      arp: { i: 'harp', o: 3, pat: true, v: 0.45, rv: 0.4, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.55, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      perc: { perc: true, v: 0.35, rv: 0.3 },
    },
    all: { arp: "0 2 1' - 2 -", pad: TRI, bass: '0 - - - - -', perc: '......|......|w.....|......' },
    sections: {
      A: { bars: 8, ch: REED_A_CH, lead: REED_A },
      B: { bars: 8, ch: REED_B_CH, fl: REED_B },
      C: { bars: 8, ch: REED_C_CH, lead: REED_C, dyn: 0.85 },
      A2: { bars: 8, ch: REED_A_CH, fl: REED_A, lead: REED_A_CM },
    },
    form: ['A', 'B', 'C', 'A2'],
  });

  // ================================================================= ROAD
  S('road', {
    title: 'The Road of Borrowed Names',
    kind: 'area',
    motifs: ['road'],
    notes: 'Main theme (D, 84). A: the theme; B: the answering phrase climbing toward the relative minor; C: the motif in a falling sequence with a lydian flash over G, before the theme returns. Instrumentation rotates (flute, pluck, bowed, celesta) so the long loop keeps changing.',
    key: 'D', bpm: 84,
    tracks: {
      lead: { i: 'flute', o: 5, v: 0.85, rv: 0.28 },
      bell: { i: 'celesta', o: 5, v: 0.5, rv: 0.35, pan: 0.25 },
      gt: { i: 'bowed', o: 4, pat: true, fold: 'all', win: -3, v: 0.55, rv: 0.3, pan: -0.15 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.5, rv: 0.3, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.45, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.65 },
      perc: { perc: true, v: 0.45 },
    },
    all: { arp: ARP4, pad: TRI, bass: BASS4, perc: 'w...s..s|....s..s' },
    sections: {
      intro: { bars: 4, ch: '1 4 1 5s4', bass: null, perc: null },
      A: { bars: 8, ch: ROAD_A_CH, lead: ROAD_A },
      Ag: { bars: 8, ch: ROAD_A_CH, lead: ROAD_A, gt: '1 - - - - - - -', perc: 'w.s.s..s|p.s.s..s' },
      Ab: { bars: 8, ch: ROAD_A_CH, lead: ROAD_A, bell: ROAD_A, gt: '1 - - - - - - -', perc: 'w.s.s..s|p.s.s..s' },
      B: { bars: 8, ch: ROAD_B_CH, lead: ROAD_B },
      Bg: { bars: 8, ch: ROAD_B_CH, lead: ROAD_B, gt: '1 - - - 3 - - -' },
      C: { bars: 8, ch: ROAD_C_CH, bell: ROAD_C, perc: null, dyn: 0.85 },
    },
    loopFrom: 1,
    form: ['intro', 'A', { s: 'Ag', i: { lead: 'pluck' } }, 'B', 'Ab', 'C', { s: 'Bg', i: { lead: 'bowed' }, o: { lead: -1 } }],
  });

  // ================================================================= MILL
  const MILL_A = "1 - 3 4 5 - | 6 - 5 - 3 - | 4 - 3 - 1 - | 7, - - - - - | 1 - 3 4 5 - | 6 - 7 - 1' - | 2' - 1' - 6 - | 5 - - - . .";
  const MILL_A_CH = '1 4 1 7 1 4 7 5';
  const MILL_B = '5, - 3 - 2 1 | 2 - - - - - | 5, - 3 - 2 1 | 7, - - - - - | 4 - - 3 - 1 | 2 - 3 - 4 - | 5 - - 6 - 5 | 5 - - - - -';
  const MILL_B_CH = '1 7 b6 7 4 7 1 5M';
  const MILL_C = "1' - - . . . | . . . 5 - - | . . . . . . | 3' - - 2' - - | 1' - - . . . | . . . 6 - - | 7 - - - - - | 5 - - - - -";
  const MILL_C_CH = '1 1 4 4 1 1 7 5M';

  S('mill', {
    title: 'The Mill That Calls Back',
    kind: 'area',
    motifs: ['road'],
    notes: 'First dungeon, A dorian in 3/4 (108) — the waterwheel turns: a rotating pluck figure, a bouncing bass, a wooden creak every other bar and drips in the rafters. Mallet asks the questions; B turns the road motif curious over an F-major (lydian-coloured) chord; C is the machinery alone with a celesta through the echo.',
    key: 'A', mode: 'dorian', bpm: 108, meter: 3,
    tracks: {
      mal: { i: 'mallet', o: 4, v: 0.8, rv: 0.2, pan: 0.15 },
      lead: { i: 'flute', o: 4, v: 0.75, rv: 0.3 },
      bell: { i: 'celesta', o: 4, v: 0.55, rv: 0.45, dl: 0.3, pan: -0.2 },
      arp: { i: 'pluck', o: 4, pat: true, v: 0.45, rv: 0.15, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.35, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.65 },
      wheel: { perc: true, v: 0.5, rv: 0.25 },
      drip: { perc: true, v: 0.5, rv: 0.5, pan: 0.35 },
    },
    echo: { beats: 1.5, fb: 0.35, mix: 0.3 },
    all: {
      arp: "2 1 0 1 2 1'", bass: '0 . 2 . 2 .', pad: '0+2', wheel: 'c.....|x...x.',
      drip: '......|......|...d..|......|......|.d....|......|....d.',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', arp: null, pad: null },
      A: { bars: 8, ch: MILL_A_CH, mal: MILL_A },
      Ab: { bars: 8, ch: MILL_A_CH, mal: MILL_A, bell: MILL_A },
      B: { bars: 8, ch: MILL_B_CH, lead: MILL_B },
      C: { bars: 8, ch: MILL_C_CH, bell: MILL_C, arp: null, dyn: 0.85 },
    },
    form: ['intro', 'A', 'B', { s: 'Ab', i: { mal: 'pluck' }, o: { bell: 1 } }, 'C', { s: 'B', i: { lead: 'mallet' } }, 'A'],
  });

  // =============================================================== BATTLE
  const BAT_A_BELL = '.:8 | 5, - 3 - - 2 1 - | 2 - - - - - . . | .:8 | 5, - 3 - - 2 1 - | 7, - - - - - . . | . . . . 1 - 2 - | 3 - 2 - - - - -';
  const BAT_A_CH = '1 1 7 6 4 4 5 5';
  const BAT_B = '3 - - 2 3 - 5 - | 4 - 3 - 2 - - - | 3 - - 2 3 - 6 - | 5 - - - - - . . | 6 - 5 - 4 - 3 - | 4 - 3 - 2 - 1 - | 2 - - 3 4 - 5 - | 5 - - - - - . .';
  const BAT_B_CH = '6 4 6 3 4 1 7 5M';
  const BAT_C = '1 - - - - - - - | 2 - - - - - - - | 4 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - | 6 - - - 5 - - - | 4 - - - 5 - - - | 2 - - - - - - -';

  S('battle', {
    title: 'Inkweaving',
    kind: 'area',
    motifs: ['road'],
    notes: 'Combat that waits for you (E minor, 100): a patient 3+3+2 pulse on low drum and pluck ostinato that never speeds up. The road motif appears in minor as resolve; B is a lyrical flute line; C adds a slowly rising bowed line — tension without aggression.',
    key: 'E', mode: 'aeolian', bpm: 100,
    tracks: {
      lead: { i: 'flute', o: 5, v: 0.8, rv: 0.25 },
      bell: { i: 'bell', o: 5, v: 0.55, rv: 0.35, pan: 0.2 },
      low: { i: 'bowed', o: 4, v: 0.6, rv: 0.25, pan: -0.15 },
      ost: { i: 'pluck', o: 4, pat: true, v: 0.5, rv: 0.15, pan: -0.25 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.4, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      drum: { perc: true, v: 0.6 },
      shk: { perc: true, v: 0.4, pan: 0.3 },
    },
    all: { ost: "0 2 1' 0 2 1' 0 2", bass: '0 - - 0 - - 0 -', pad: TRI, drum: 'l..l..l.', shk: '..s...s.|..s.s.s.' },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, shk: null },
      A: { bars: 8, ch: BAT_A_CH, bell: BAT_A_BELL },
      B: { bars: 8, ch: BAT_B_CH, lead: BAT_B },
      C: { bars: 8, ch: BAT_A_CH, bell: BAT_A_BELL, low: BAT_C, drum: 'l..l..l.|l..l..t.' },
      B2: { bars: 8, ch: BAT_B_CH, lead: BAT_B, low: '3 - - - - - - - | 1 - - - - - - - | 3 - - - - - - - | 3, - - - - - - - | 1 - - - - - - - | 1 - - - - - - - | 2, - - - - - - - | 2, - - - - - - -' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'pluck' } }],
  });

  // ================================================================= BOSS
  const BOSS_HUSH = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 1 - - - - - - - | .:8 | .:8 | .:8 | .:8';
  const BOSS_A_BELL = '.:8 | .:8 | .:8 | .:8 | 3 - - - 1 - - - | 4 - - - 3 - - - | 2 - - - - - - - | .:8';
  const BOSS_A_CH = '1 b2 1 b2 6 4 5 5';
  const BOSS_B = '5, - 3 - - 2 1 - | 2 - - - b2 - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | 1 - 3 - 5 - 6 - | 5 - 4 - 3 - 2 - | 3 - - - 1 - - - | 2 - - - - - - -';
  const BOSS_B_CH = '1 5:0.5 b2:0.5 6 7 4 5 6 5M';
  const BOSS_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BOSS_C_TOLL = '.:8 | .:8 | b2 - - - - - - - | .:8 | .:8 | .:8 | 5, - - - - - - - | .:8';
  // the driving figure: a low bowed riff in eighths that never lets up (two bars, with a turn)
  const BOSS_RIFF = '1 1 5, 1 3 1 5, 1 | 1 1 5, 1 4 3 2 5,';

  S('boss', {
    title: 'A Promise Held Too Tightly',
    kind: 'area',
    motifs: ['road', 'hush'],
    notes: 'Boss theme in C minor with a Phrygian D-flat, driven (138): a low bowed riff in eighths that never lets up, an eighth-note bass pedal with octave kicks, big drums on a 3+3+2 accent with a frame-drum snap on the backbeat and a sixteenth-note shaker. The Hush motif on glass climbs in even notes while the road motif falls against it (B2 plays both at once over the full kit); C drops to half time under the bell toll before the last push — bosses are places the Hush has touched.',
    key: 'C', mode: 'aeolian', bpm: 138, loopFrom: 1,
    tracks: {
      lead: { i: 'flute', o: 5, v: 0.85, rv: 0.22 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.4, pan: 0.2 },
      bell: { i: 'bell', o: 5, v: 0.5, rv: 0.35, pan: -0.2 },
      toll: { i: 'toll', o: 3, v: 0.6, rv: 0.45 },
      riff: { i: 'bowed', o: 3, v: 0.62, rv: 0.12, pan: -0.15 },
      ost: { i: 'pluck', o: 4, pat: true, v: 0.4, rv: 0.1, pan: 0.25 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.4, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.72 },
      drum: { perc: true, v: 0.62 },
      snap: { perc: true, v: 0.5, pan: 0.1 },
      hat: { perc: true, v: 0.32, pan: 0.3, u: 0.25 },
    },
    all: {
      riff: BOSS_RIFF, ost: "0 2 1' 2 0 2 1' 2", bass: "0 0 0' 0 0 0 0' 0", pad: TRI,
      drum: 'O..o..O.|O..o..Oo', snap: '....N...|....N..n', hat: 'ssSsssSsssSsssSs',
    },
    sections: {
      intro: { bars: 2, ch: '1 1', pad: null, ost: null, snap: null, hat: null, drum: 'O..o..O.|O.o.OoOO' },
      A: { bars: 8, ch: BOSS_A_CH, glass: BOSS_HUSH, bell: BOSS_A_BELL },
      B: { bars: 8, ch: BOSS_B_CH, lead: BOSS_B },
      C: { bars: 8, ch: '6 6 b2 b2 6 6 5M 5M', glass: BOSS_C_GLASS, toll: BOSS_C_TOLL, riff: null, drum: 'O.......|O...o...', snap: null, hat: 's...s...s...s...', ost: "0 2 1' 2", dyn: 0.9 },
      B2: { bars: 8, ch: BOSS_B_CH, lead: BOSS_B, glass: BOSS_HUSH, drum: 'O..o..O.|O..o.oOO' },
      A2: { bars: 8, ch: BOSS_A_CH, glass: BOSS_HUSH, bell: BOSS_A_BELL },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'B2', i: { lead: 'bowed' }, o: { lead: -1 } }, { s: 'A2', i: { riff: 'pluck' }, o: { riff: 1 } }],
  });

  S('victory', {
    title: 'Victory Sting',
    kind: 'sting',
    loop: false,
    motifs: ['road'],
    notes: 'Six seconds: the road motif at double speed rising to a held tonic, a harp run and a soft bell.',
    key: 'D', bpm: 120,
    tracks: {
      lead: { i: 'celesta', o: 5, v: 0.7, rv: 0.35, u: 0.25 },
      lead2: { i: 'pluck', o: 4, v: 0.5, rv: 0.25, u: 0.25 },
      run: { i: 'harp', o: 4, v: 0.5, rv: 0.35, u: 0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.5, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      perc: { perc: true, v: 0.5 },
    },
    sections: {
      s: {
        bars: 3, ch: '1:0.5 4:0.5 1 1',
        lead: "5, - - 3 - - 2 1 2 - 3 - 5 - 6 - | 1' - - - - - - - - - - - . . . . | .:16",
        lead2: ".:8 4+6+1':8 | 1+3+5:12 .:4 | .:16",
        run: ".:16 | 1 3 5 1' 3' 5' 1'' - - - - - - - - - | .:16",
        pad: TRI, bass: '0 - - - - - - -', perc: 'k...w...|k.......|........',
      },
    },
    form: ['s'],
  });

  // ============================================================ SALTGLASS
  const SALT_A = "5, - 1 - 2 3 - 1 | 2 - 6, - 1 - - - | 5, - 1 - 2 3 - 5 | 4 - - - 3 - - - | 6 - 5 - 3 - 1 - | 2 - 3 - 4 - 3 2 | 1 - 6, - 5, - 6, 7, | 1 - - - - - . .";
  const SALT_A_CH = '1 5s4 1 4 6 2 4:0.5 5:0.5 1';
  const SALT_B = '3 - 3 4 5 - 3 - | b7 - - - 5 - - - | 4 - 4 5 6 - 4 - | 3 - - - 1 - - - | 3 - 3 4 5 - 3 - | b7 - 6 - 5 - 4 - | 3 - 2 - 1 - 2 - | 5, - - - - - . .';
  const SALT_B_CH = '1 b7 4 1 1 b7 2 5';
  const SALT_C = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - 1 - - - | 6 - 5 - 3 - 2 - | 3 - - - 1 - - - | 2 - 3 - 4 - 5 - | 5 - - - - - . .';
  const SALT_C_CH = '6 4 2 5:0.5 5s4:0.5 6 4 5 5';

  S('saltglass', {
    title: 'Saltglass Harbour',
    kind: 'area',
    chapter: 2,
    motifs: ['road'],
    notes: 'Working harbour in F with a lilting swing (104), re-orchestrated for Chapter 2 as a min’yō band — same melody, form and motifs as before: shakuhachi lead, shamisen chords slapping on 2 and 4 like rigging against a mast, a bouncing root–fifth bass, woodblock, shaker and shime-daiko, a hyōshigi clap to start. B leans mixolydian (E-flat) for the cargo-label muddle on a bright shinobue; A2 puts the tune on koto with a second koto answering; C is quieter and echoing — the road motif on shakuhachi over D minor, pointing toward the drowned archive; B2 hands the tune to the shamisen.',
    key: 'F', bpm: 104, swing: 0.24,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.72, rv: 0.25 },
      mal: { i: 'koto', o: 5, v: 0.5, rv: 0.2, pan: 0.2 },
      bell: { i: 'koto', o: 5, v: 0.42, rv: 0.4, dl: 0.35, pan: -0.2 },
      gtr: { i: 'shamisen', o: 4, pat: true, fold: 'all', win: -3, v: 0.32, rv: 0.15, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.28, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.65 },
      perc: { perc: true, v: 0.45 },
    },
    echo: { beats: 0.75, fb: 0.3, mix: 0.3 },
    all: { gtr: '. . 0+1+2 . . . 0+1+2 .', bass: '0 - 2, - 0 - 2, 0', pad: TRI, perc: 'w.s.e.s.|w.s.e.ss' },
    sections: {
      intro: { bars: 2, ch: '1 5', perc: 'y.......' },
      A: { bars: 8, ch: SALT_A_CH, lead: SALT_A },
      B: { bars: 8, ch: SALT_B_CH, lead: SALT_B },
      A2: { bars: 8, ch: SALT_A_CH, mal: SALT_A, bell: '.:8 | .:8 | .:8 | 6 - - - 5 - - - | .:8 | .:8 | .:8 | 5 - - - - - . .' },
      C: { bars: 8, ch: SALT_C_CH, bell: SALT_C, gtr: null, perc: '....s...', dyn: 0.85 },
      B2: { bars: 8, ch: SALT_B_CH, mal: SALT_B },
    },
    form: ['intro', 'A', { s: 'B', i: { lead: 'shinobue' } }, 'A2', { s: 'C', i: { bell: 'shakuhachi' } }, { s: 'B2', i: { mal: 'shamisen' }, o: { mal: -1 } }],
  });

  // ====================================================== DROWNED ARCHIVE
  const DROWN_A = '5 - - - 3 - 2 - | 1 - - - - - - - | 6 - - - 5 - 3 - | 5 - - - - - - - | 4 - - - 3 - 1 - | 2 - - - 1 - 7, - | 2 - - - - - 5, - | 5, - - - - - - -';
  const DROWN_A_CH = '1 1 6 6 4 4 5 5';
  const DROWN_B_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const DROWN_B_BELL = '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - - - | .:8 | .:8 | 5, - 3 - - 2 1 - | 7, - - - - - - -';
  const DROWN_B_CH = '4 4 1 1 6 6 1 5';
  const DROWN_C = "1' - - - - - - - | .:8 | 7 - - - - - - - | .:8 | 6 - - - - - - - | . . . . 5 - - - | 4 - - - - - - - | 2 - - - - - - -";
  const DROWN_C_CH = '1 1 7 7 6 1 4 5M';

  S('drowned_archive', {
    title: 'The Drowned Archive',
    kind: 'area',
    chapter: 2,
    motifs: ['road', 'hush'],
    notes: 'Tidal ruin in E minor at a slow 66, re-orchestrated for Chapter 2 — same melody, form and motifs: the lead is now a rin bowl through a long echo, the arpeggio a koto, the pads still swell like tides and water still drips. In B the Hush motif rises from below on glass (a lydian glint over C) over a held shō, and the road motif answers from above; the repeat of A is on shakuhachi; C adds a slow ōdaiko heartbeat under the koto.',
    key: 'E', mode: 'aeolian', bpm: 66,
    tracks: {
      bell: { i: 'rin', o: 5, v: 0.95, rv: 0.5, dl: 0.4, pan: 0.15 },
      glass: { i: 'glass', o: 4, v: 0.9, rv: 0.5, pan: -0.2 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.3, rv: 0.45, dl: 0.2, pan: -0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.5, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
      drip: { perc: true, v: 0.55, rv: 0.6, pan: 0.3 },
      heart: { perc: true, v: 0.4, rv: 0.4 },
    },
    echo: { beats: 1.5, fb: 0.4, mix: 0.35 },
    all: {
      arp: "0 2 4 2 1' 2 4 2", pad: '0+1+2+4', bass: '0 - - - - - - -',
      drip: 'd.......|....d...|........|..d.....|........|......d.|.d......|........',
    },
    sections: {
      A: { bars: 8, ch: DROWN_A_CH, bell: DROWN_A },
      B: { bars: 8, ch: DROWN_B_CH, glass: DROWN_B_GLASS, bell: DROWN_B_BELL, arp: '0 . 2 . 4 . 2 .' },
      C: { bars: 8, ch: DROWN_C_CH, bell: DROWN_C, heart: 'z.......|........', dyn: 0.9 },
    },
    form: ['A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, { s: 'A', i: { bell: 'shakuhachi' } }, { s: 'C', i: { bell: 'koto' } }],
  });

  // =============================================================== CINDER
  const CIN_A = "1 - 3 - 5 - 3 5 | 6 - 5 - 7 - - - | 1' - 7 - 5 - 3 - | 4 - - 3 2 - - - | 1 - 3 - 5 - 3 5 | 6 - 5 - 7 - 1' - | 2' - 1' - 7 - 5 - | 1' - - - - - . .";
  const CIN_A_CH = '1 1:0.5 7:0.5 1 4 1 4:0.5 7:0.5 5 1';
  const CIN_A_CM = ".:8 | . . . . . . 1' 2' | .:8 | . . . . . 5 6 7 | .:8 | .:8 | .:8 | . . . . 3' 2' 1' .";
  const CIN_B = '5, - 3 - - 2 1 - | 2 - - - - - . . | 3 - - 4 5 - 3 - | 2 - - - 7, - - - | 6, - 1 - 3 - 6 - | 5 - - 4 3 - - - | 2 - 3 - 4 - 2 - | 5, - - - - - . .';
  const CIN_B_CH = '1 5 6 7 4 1 4 5M';
  const CIN_C = "1' - 1' 7 5 - 5 3 | 4 - 4 3 1 - - - | 1' - 1' 7 5 - 5 3 | 2 - 2 3 1 - - - | 5 - 5 6 7 - 6 5 | 4 - 4 5 6 - 5 4 | 3 - 3 4 5 - 4 3 | 2 - 1 - - - . .";
  const CIN_C_CH = '1 4 1 5 1 4 1 5';

  S('cinder', {
    title: 'Cinder Orchard Festival',
    kind: 'area',
    chapter: 3,
    motifs: ['road'],
    notes: 'Festival town in A mixolydian (112), re-orchestrated for Chapter 3 as a festival band — same melody, form and motifs as before: shinobue over strummed shamisen with koto answering figures, a small hayashi of ōdaiko, shime-daiko and rim clicks, the atarigane’s chan-chiki where the shaker was. B slips into A minor with the road motif on koto — the festival history that does not match what people remember. C is a call-and-response dance on shamisen; the last A2 is on koto.',
    key: 'A', mode: 'mixolydian', bpm: 112,
    tracks: {
      lead: { i: 'shinobue', o: 4, v: 0.52, rv: 0.2 },
      mal: { i: 'koto', o: 4, v: 0.6, rv: 0.2, pan: 0.2 },
      pl: { i: 'koto', o: 4, v: 0.38, rv: 0.2, pan: -0.2 },
      gtr: { i: 'shamisen', o: 4, pat: true, fold: 'all', win: -4, v: 0.3, rv: 0.1, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.28, rv: 0.3 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.65 },
      drum: { perc: true, v: 0.5 },
      shk: { perc: true, v: 0.28, pan: 0.3 },
    },
    all: { gtr: '0+1+2 . . 0+1+2 . . 0+1+2 .', bass: '0 . 0 2 . 0 2 .', pad: TRI, drum: 'z..e..f.|z..e.ef.', shk: 'a..aa..a' },
    sections: {
      intro: { bars: 1, ch: '1', gtr: null, pad: null, bass: null, shk: 'y.y.y...' },
      A: { bars: 8, ch: CIN_A_CH, lead: CIN_A },
      A2: { bars: 8, ch: CIN_A_CH, lead: CIN_A, pl: CIN_A_CM },
      B: { bars: 8, mode: 'aeolian', ch: CIN_B_CH, mal: CIN_B, drum: 'z.......|....e...', shk: '..a...a.', gtr: null, dyn: 0.9 },
      C: { bars: 8, ch: CIN_C_CH, mal: CIN_C, drum: 'z..e..f.|z..e.ef.|z..e..f.|zz.e.eff' },
    },
    form: ['intro', 'A', 'A2', 'B', { s: 'C', i: { mal: 'shamisen' } }, { s: 'A2', i: { lead: 'koto' } }],
  });

  // ================================================================= KILN
  const KILN_A = '1 - - - 2 - - - | 3 - - - 2 - 1 - | 4 - - - 3 - 2 - | 2 - - - - - - - | 5 - - - 4 - 3 - | 2 - 3 - 1 - - - | 7, - 1 - 2 - 3 - | 2 - - - - - - -';
  const KILN_A_CH = '1:0.5 2:0.5 1 2 2 1 1 7 2';
  const KILN_B = '5 - 4 - 3 - 2 - | 3 - - - - - . . | 5 - 4 - 3 - 2 - | 1 - - - - - . . | 6 - 5 - 4 - 5 - | 3 - - - - - . . | 2 - 3 - 4 - 5 - | 7 - - - - - . .';
  const KILN_B_CH = '1 2 1 2 6 1 2 5';
  const KILN_C = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | 2 - - - - - - -';
  const KILN_C_CH = '1 1 1 1 2 2 1 2';

  S('kiln', {
    title: 'The Sealed Kiln',
    kind: 'area',
    chapter: 3,
    motifs: ['hush'],
    notes: 'E phrygian heat (84), re-orchestrated for Chapter 3 — same melody, form and motifs: an ōdaiko heartbeat, a low biwa buzzing on the root like heat in the walls, rim clicks, celesta shimmer in sixteenths, the bowed line leaning on the flat second. B opens into E lydian — the beauty of the glass itself — on koto over a held shō. C strips back to the heartbeat while the Hush motif circles on glass; the last A is on shakuhachi.',
    key: 'E', mode: 'phrygian', bpm: 84,
    tracks: {
      lead: { i: 'bowed', o: 4, v: 0.7, rv: 0.35 },
      cel: { i: 'koto', o: 5, v: 0.5, rv: 0.45, pan: 0.2 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.5, pan: -0.15 },
      shim: { i: 'celesta', o: 4, pat: true, u: 0.25, v: 0.3, rv: 0.4, pan: 0.3 },
      drone: { i: 'biwa', o: 2, pat: true, bass: true, v: 0.32, rv: 0.35, pan: -0.2 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.45, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
      beat: { perc: true, v: 0.55, rv: 0.2 },
      tick: { perc: true, v: 0.3, pan: -0.3 },
    },
    all: { shim: "0 2 1' 2 4 2 1' 2", drone: '0 - - - - - - -', pad: '0+2', bass: '0 - - - - - - -', beat: 'z.z.....|........', tick: '..f...f.' },
    sections: {
      A: { bars: 8, ch: KILN_A_CH, lead: KILN_A },
      B: { bars: 8, mode: 'lydian', ch: KILN_B_CH, cel: KILN_B, pad: TRI, tick: null, drone: null },
      C: { bars: 8, ch: KILN_C_CH, glass: KILN_C, shim: null },
    },
    form: ['A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, 'C', { s: 'A', i: { lead: 'shakuhachi' } }],
  });

  // ============================================================= SNOWBELL
  const SNOW_A = '5, - 1 - 2 - | 3 - - - 2 1 | 2 - - - - - | 5, - 6, - 7, - | 1 - 2 - 3 - | 5 - - - 4 3 | 2 - - - 3 - | 1 - - - - -';
  const SNOW_A_CH = '1 1 2 5 6 1 5 1';
  const SNOW_A_CM = ". . . . . . | . . . . 5 - | . . . . . . | . . . . 7, - | . . . . . . | . . . . 1' - | . . . . . . | . . . . . .";
  const SNOW_B = '6 - 5 - 3 - | 2 - - - 1 - | 6, - 1 - 2 - | 3 - - - - - | 4 - 3 - 2 - | 1 - - - 6, - | 7, - 1 - 2 - | 5, - - - - -';
  const SNOW_B_CH = '6 2 6 3 4 6 5 5';
  const SNOW_C = '5, - 3 - 2 1 | 2 - - - - - | 5, - 3 - 2 1 | 6, - - - - - | 4 - 3 - 2 - | 1 - - - 6, - | 2 - - - 7, - | 1 - - - - -';
  const SNOW_C_CH = '1 2 1 6 4 6 5 1';

  S('snowbell', {
    title: 'Snowbell',
    kind: 'area',
    chapter: 4,
    motifs: ['road'],
    notes: 'Mountain-hamlet waltz in F (80), re-orchestrated for Chapter 4 — same melody, form and motifs: the music-box line now on koto over a second, lower koto, the small bells shaking every few bars and a rin now and then. B is the family-correspondence strain in D minor on shakuhachi; C carries the road motif in 3/4 like footprints in fresh snow.',
    key: 'F', bpm: 80, meter: 3,
    tracks: {
      lead: { i: 'koto', o: 5, v: 0.5, rv: 0.45 },
      fl: { i: 'shakuhachi', o: 4, v: 0.66, rv: 0.4 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.26, rv: 0.4, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.42, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
      bells: { perc: true, v: 0.4, rv: 0.5, pan: 0.35 },
    },
    all: { arp: "0 2 1' 2 1' 2", pad: TRI, bass: '0 - - - - -', bells: 'j.....|......|......|......' },
    sections: {
      intro: { bars: 2, ch: '1 5s4', bells: null },
      A: { bars: 8, ch: SNOW_A_CH, lead: SNOW_A },
      B: { bars: 8, ch: SNOW_B_CH, fl: SNOW_B },
      A2: { bars: 8, ch: SNOW_A_CH, fl: SNOW_A, lead: SNOW_A_CM },
      C: { bars: 8, ch: SNOW_C_CH, lead: SNOW_C, arp: "0 2 4 2 1' 2", bells: 'j.....|......|i.....|......' },
      B2: { bars: 8, ch: SNOW_B_CH, lead: SNOW_B, dyn: 0.9 },
    },
    form: ['intro', 'A', 'B', 'A2', 'C', 'B2'],
  });

  // ========================================================== OBSERVATORY
  const OBS_A = "3 - - - 4 - 5 - | 6 - - - - - . . | 3 - - - 4 - 5 - | 2' - - - 1' - - - | 7 - - - 6 - 5 - | 6 - - - 4 - - - | 5 - - - 2 - 3 - | 2 - - - - - . .";
  const OBS_A_CH = '1 2 1 2 3 2 5 5';
  const OBS_B = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - - - . . | 4 - - - 5 - 6 - | 5 - - - 3 - - - | 2 - 3 - 4 - 5 - | 5 - - - - - . .';
  const OBS_B_CH = '1 2 6 3 2 1 2 5';
  const OBS_B_LINE = '3 - - - - - - - | 2 - - - - - - - | 1 - - - - - - - | 7, - - - - - - - | 6, - - - - - - - | 1 - - - - - - - | 2 - - - - - - - | 2 - - - - - - -';

  S('observatory', {
    title: 'The Observatory',
    kind: 'area',
    chapter: 4,
    motifs: ['road'],
    notes: 'C lydian at 72, re-orchestrated for Chapter 4 — same melody, form and motifs: wheeling koto sixteenths through a dotted echo, the tick of the old mechanism, shakuhachi and glass above. B lifts the road motif into lydian on koto — the view from the top of the world — over a held shō; on the repeat a slow glass line falls beneath it.',
    key: 'C', mode: 'lydian', bpm: 72,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.66, rv: 0.4 },
      glass: { i: 'glass', o: 5, v: 0.8, rv: 0.5, pan: -0.15 },
      cel: { i: 'koto', o: 5, v: 0.48, rv: 0.45, pan: 0.15 },
      arp: { i: 'koto', o: 4, pat: true, u: 0.25, v: 0.22, rv: 0.35, dl: 0.35, pan: 0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.45, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      clock: { perc: true, v: 0.35, pan: -0.35 },
    },
    echo: { beats: 0.75, fb: 0.4, mix: 0.3 },
    all: { arp: "0 2 1' 2 4 2 1' 2", pad: '0+1+2+4', bass: '0 - - - - - - -', clock: 'x...x...' },
    sections: {
      A: { bars: 8, ch: OBS_A_CH, lead: OBS_A },
      B: { bars: 8, ch: OBS_B_CH, cel: OBS_B },
      A2: { bars: 8, ch: OBS_A_CH, glass: OBS_A },
      B2: { bars: 8, ch: OBS_B_CH, lead: OBS_B, glass: OBS_B_LINE },
    },
    form: ['A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, 'A2', { s: 'B2', i: { pad: 'sho' }, o: { pad: 1 } }],
  });

  // ============================================================ QUIET ROAD
  const QR_A1 = "5, - 3 - - 2 1 - | 2 - - - . 1 6, 1 | .:8 | .:8 | 3 - - 5 6 - 5 - | 1' - - - 7 6 5 - | .:8 | .:8";
  const QR_A2 = '.:8 | .:8 | 5, - 3 - - 2 1 - | 6, - - - 5, - - - | .:8 | .:8 | 4 - - 3 2 - 5, - | 1 - - - - - . .';
  const QR_B1 = "3 - - 2 3 - 5 - | 6 - 5 - 3 - - - | 2 - - 1 2 - 3 - | 5, - - - - - . . | 3 - - 2 3 - 5 - | 6 - 1' - 7 - 6 - | 5 - 3 - 2 - 1 - | 2 - - - - - . .";
  const QR_B2 = '1 - - 7, 1 - 3 - | 4 - 3 - 1 - - - | 7, - - 6, 7, - 1 - | 3, - - - - - . . | 1 - - 7, 1 - 3 - | 4 - 6 - 5 - 4 - | 3 - 1 - 7, - 6, - | 7, - - - - - . .';
  const QR_B_CH = '1 6 2 5 1 4 1 5';

  S('quiet_road', {
    title: 'The Quiet Road',
    kind: 'area',
    motifs: ['road'],
    notes: 'The calm stretch for two travellers (B-flat, 70): the main theme passed back and forth between flute and a lower bowed voice, like a conversation that does not need filling. B is a new tender tune the two voices sing together a tenth apart.',
    key: 'Bb', bpm: 70,
    tracks: {
      lead: { i: 'flute', o: 4, v: 0.8, rv: 0.35, pan: 0.1 },
      lead2: { i: 'bowed', o: 3, v: 0.7, rv: 0.35, pan: -0.1 },
      keys: { i: 'keys', o: 4, pat: true, fold: 'all', win: -3, v: 0.4, rv: 0.3, pan: 0.2 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.35, rv: 0.4, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.35, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
    },
    all: { keys: '0+1+2 - - - . . 1+2+3 -', arp: "0 . 2 . 1' . 2 .", pad: TRI, bass: BASS4 },
    sections: {
      A: { bars: 8, ch: ROAD_A_CH, lead: QR_A1, lead2: QR_A2 },
      B: { bars: 8, ch: QR_B_CH, lead: QR_B1, lead2: QR_B2 },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'celesta' } }, 'B'],
  });

  // ============================================================ LANTERNFALL
  const LF_A = "5 - 3 - 4 - 2 - | 3 - 1 - 2 - 7, - | 1 - 3 - 5 - 1' - | 7 - - - 5 - - - | 6 - 4 - 5 - 3 - | 4 - 2 - 3 - 1 - | 2 - 5 - 4 - 2 - | 1 - - - - - - -";
  const LF_A_CH = '1:0.5 5:0.5 1:0.5 5:0.5 1 5 4:0.5 1:0.5 2:0.5 1:0.5 5 1';
  const LF_B = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5 - - - 1 - - - | 2 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - . . . . | .:8 | .:8';
  const LF_B_CH = '1P 1P 2P 5P 1P 2P 1P 1P';
  const LF_C_FL = '.:8 | .:8 | .:8 | . 5, 3 - 2 1 2 . | .:8 | .:8 | .:8 | . 5, 3 - 2 1 . .';

  S('lanternfall', {
    title: 'Lanternfall',
    kind: 'area',
    chapter: 5,
    motifs: ['road', 'hush'],
    notes: 'A beautiful, too-orderly town (C major, 96), re-orchestrated for Chapter 5 — same melody, form and motifs: square four-bar phrases in even quarter notes on koto, sequences that answer themselves, an Alberti koto figure, a tick on every beat, the shamisen doubling in A2. In B the thirds drain away into open fifths under a held shō and the Hush motif appears on glass; in C the road motif keeps interrupting off the beat on shakuhachi — the last disagreement in town.',
    key: 'C', bpm: 96,
    tracks: {
      lead: { i: 'koto', o: 5, v: 0.5, rv: 0.35 },
      pl: { i: 'shamisen', o: 4, v: 0.42, rv: 0.25, pan: -0.15 },
      fl: { i: 'shakuhachi', o: 5, v: 0.66, rv: 0.3, pan: 0.2 },
      glass: { i: 'glass', o: 5, v: 0.9, rv: 0.5 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.28, rv: 0.3, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.4, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
      tick: { perc: true, v: 0.4, pan: 0.3 },
    },
    all: { arp: '0 2 1 2 0 2 1 2', pad: TRI, bass: '0 - 2 - 0 - 2 -', tick: 'w.x.x.x.' },
    sections: {
      A: { bars: 8, ch: LF_A_CH, lead: LF_A },
      A2: { bars: 8, ch: LF_A_CH, lead: LF_A, pl: LF_A },
      B: { bars: 8, mode: 'lydian', ch: LF_B_CH, glass: LF_B, arp: '0 . 1 . 0 . 1 .', pad: '0+1', tick: 'g...g...' },
      C: { bars: 8, ch: LF_A_CH, lead: LF_A, fl: LF_C_FL },
    },
    form: ['A', 'A2', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, 'C', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }],
  });

  // ============================================================ BELL TOWER
  const BT_A = "5 - - - 4 - 3 - | 2 - - - 1 - - - | 5 - - - 6 - 7 - | 1' - - - - - - - | 7 - - - 6 - 5 - | 4 - - - 3 - - - | 2 - - - 3 - 4 - | 5 - - - - - - -";
  const BT_A_CH = '1 4 1 4 7 7:0.5 4:0.5 4 5';
  const BT_B_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const BT_B_LEAD = '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - - - | .:8 | .:8 | 5, - 3 - - 2 1 - | 7, - - - - - - -';
  const BT_B_CH = '1 1 4 4 1 1 4 5';

  S('belltower', {
    title: 'The Submerged Bell Tower',
    kind: 'area',
    chapter: 5,
    motifs: ['road', 'hush'],
    notes: 'D dorian at 60, as if heard under water, re-orchestrated for Chapter 5 — same melody, form and motifs: a deep temple-bell toll every other bar, drops, a koto arpeggio and a bowed line through a long echo. In B the Hush motif and the road motif take turns, phrase by phrase, over a held shō; the repeat of A is on shakuhachi.',
    key: 'D', mode: 'dorian', bpm: 60,
    tracks: {
      lead: { i: 'bowed', o: 4, v: 0.7, rv: 0.45, dl: 0.3 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.55, pan: 0.2 },
      toll: { i: 'toll', o: 2, v: 0.6, rv: 0.55 },
      arp: { i: 'koto', o: 3, pat: true, v: 0.3, rv: 0.5, dl: 0.2, pan: -0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.5, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
      drip: { perc: true, v: 0.45, rv: 0.6, pan: -0.3 },
    },
    echo: { beats: 1, fb: 0.35, mix: 0.3 },
    all: { toll: '1 - - - - - - - | .:8', arp: "0 . 2 . 1' . . .", pad: TRI, bass: '0 - - - - - - -', drip: '.....d..|........|..d.....|........' },
    sections: {
      A: { bars: 8, ch: BT_A_CH, lead: BT_A },
      B: { bars: 8, ch: BT_B_CH, glass: BT_B_GLASS, lead: BT_B_LEAD },
    },
    form: ['A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, { s: 'A', i: { lead: 'shakuhachi' }, o: { lead: 1 } }],
  });

  // ================================================================= HUSH
  const HUSH_A = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 2 - - - - - - - | 1 - - - - - - - | .:8';
  const HUSH_A_CH = '1P 1P 2P 2P 1P 2P 1P 1P';
  const HUSH_B_CEL = '5, - 3 - - 2 1 - | 2 - - - - - . . | .:8 | .:8 | 5, - 3 - - 2 1 - | .:8 | .:8 | .:8';
  const HUSH_B_GLASS = '.:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - . . | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - -';
  const HUSH_B_CH = '1M 1M 2s4 2 1M 1M 2s4 2';
  const HUSH_C_CEL = '5, - 3 - - . 1 - | .:8 | 5, - . . . . 1 - | .:8 | . . 3 - - . . . | .:8 | .:8 | .:8';
  const HUSH_C_GLASS = '.:8 | 5, - 1 - 2 - 3 - | .:8 | 4 - - - - - - - | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8';
  const HUSH_C_CH = '1P 2P 1P 2P 1P 2P 1P 1P';

  S('hush', {
    title: 'The Hush',
    kind: 'area',
    motifs: ['hush', 'road'],
    notes: 'Antagonist theme. F lydian at 60, glass tones in strictly even notes over open fifths and a glass tick on every beat — calm, orderly, eerily empty. The Hush motif (5, 1 2 3 ♯4) is the road motif’s pitches sorted and evened out, left hanging on the raised fourth. In B the road motif is heard and then “filed” by the Hush; in C its notes go missing one by one.',
    key: 'F', mode: 'lydian', bpm: 60,
    tracks: {
      glass: { i: 'glass', o: 5, v: 1, rv: 0.55 },
      cel: { i: 'celesta', o: 5, v: 0.55, rv: 0.5, pan: -0.2 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.5, rv: 0.5 },
      low: { i: 'glass', o: 3, pat: true, v: 0.6, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.4 },
      tick: { perc: true, v: 0.45, rv: 0.3, pan: 0.25 },
    },
    all: { pad: '0+1', low: '0 - - - 1 - - -', bass: '0 - - - - - - -', tick: 'g.g.g.g.' },
    sections: {
      A: { bars: 8, ch: HUSH_A_CH, glass: HUSH_A },
      B: { bars: 8, ch: HUSH_B_CH, cel: HUSH_B_CEL, glass: HUSH_B_GLASS, pad: TRI },
      C: { bars: 8, ch: HUSH_C_CH, cel: HUSH_C_CEL, glass: HUSH_C_GLASS, tick: 'g...g...' },
    },
    form: ['A', 'B', 'C'],
  });

  // ========================================================= STILL ARCHIVE
  const SA_A = '.:8 | .:8 | 5, - 3 - - 2 1 - | 2 - - - - - - - | 5, - 3 - - 2 1 - | 7, - - - - - - - | #7, - - - 1 - - - | 2 - - - #7, - - -';
  const SA_A_CH = '1 1 6 4 3 7 5M:0.5 5s4:0.5 5M';
  const SA_B = '5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - - - - - | 5, - 1 - 2 - 3 - | 4 - - - 3 - - - | 2 - - - - - - - | 1 - - - - - - -';
  const SA_B_CH = '1P 1P 2P 2P 1P 2P 5P 1P';

  S('still_archive', {
    title: 'The Still Archive',
    kind: 'area',
    chapter: 6,
    motifs: ['road', 'hush'],
    notes: 'Final dungeon in B minor (80), re-orchestrated for Chapter 6 — same melody, form and motifs: an ōdaiko heartbeat and a koto ostinato under a bowed road motif. B is the archive’s own order — B lydian, open fifths, a held shō, the Hush motif alone on glass, the pulse gone. C drives the road theme’s climbing phrase back in minor on shakuhachi over the ostinato; the last A is on shakuhachi too.',
    key: 'B', mode: 'aeolian', bpm: 80,
    tracks: {
      lead: { i: 'bowed', o: 4, v: 0.75, rv: 0.35, dl: 0.2 },
      fl: { i: 'shakuhachi', o: 4, v: 0.7, rv: 0.3 },
      glass: { i: 'glass', o: 4, v: 1, rv: 0.55, pan: 0.15 },
      ost: { i: 'koto', o: 3, pat: true, v: 0.32, rv: 0.15, pan: -0.25 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: -2, v: 0.45, rv: 0.45 },
      bass: { i: 'bass', o: 1, pat: true, bass: true, v: 0.7 },
      drum: { perc: true, v: 0.5, rv: 0.2 },
      tick: { perc: true, v: 0.35, pan: 0.3 },
    },
    echo: { beats: 0.75, fb: 0.3, mix: 0.25 },
    all: { ost: "0 2 1' 2 0 2 1' 2", pad: TRI, bass: '0 - - 0 - - 0 -', drum: 'z.z.....|........', tick: '....x...' },
    sections: {
      A: { bars: 8, ch: SA_A_CH, lead: SA_A },
      B: { bars: 8, mode: 'lydian', ch: SA_B_CH, glass: SA_B, ost: null, drum: null, pad: '0+1', tick: 'g...g...' },
      C: { bars: 8, ch: MINOR_B_CH, fl: ROAD_B, drum: 'z..z..z.' },
    },
    form: ['A', { s: 'B', i: { pad: 'sho' }, o: { pad: 1 } }, 'C', { s: 'A', i: { lead: 'shakuhachi' }, o: { lead: 1 } }],
  });

  // =============================================================== FINALE
  const FIN_A = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - - - . . | 6, - 1 - 3 - 5 - | 6 - 5 - 4 - 3 - | 2 - - - 5, - - - | #7, - - - - - . .';
  const FIN_A_CH = '1 5 4 7 6 4 5 5M';
  const FIN_A_LOW = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | 5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8';
  const FIN_C_GLASS = '5, - 1 - 2 - 3 - | 4 - - - - - - - | .:8 | .:8 | .:8 | .:8 | .:8 | .:8';

  S('finale', {
    title: 'Which Promises We Keep',
    kind: 'area',
    chapter: 6,
    motifs: ['road', 'hush'],
    notes: 'Final confrontation (92), re-orchestrated for Chapter 6 — same melody, form and motifs. A: the road motif in D minor on shakuhachi over a 3+3+2 ōdaiko and shime pulse and a shamisen ostinato, while the Hush motif crawls in the bowed bass. B: the theme’s climbing phrase, still in minor, with choir. C/D: the theme breaks into D major over koto arpeggios — and the Hush motif returns beneath it on glass with a natural fourth, resolved instead of erased.',
    key: 'D', mode: 'aeolian', bpm: 92,
    tracks: {
      lead: { i: 'shakuhachi', o: 5, v: 0.72, rv: 0.3 },
      low: { i: 'bowed', o: 3, v: 0.75, rv: 0.3, pan: -0.15 },
      glass: { i: 'glass', o: 4, v: 0.9, rv: 0.5, pan: 0.2 },
      bell: { i: 'koto', o: 5, v: 0.42, rv: 0.4, pan: 0.25 },
      choir: { i: 'choir', o: 4, hold: true, fold: 'all', win: -3, v: 0.55, rv: 0.45 },
      ost: { i: 'shamisen', o: 4, pat: true, v: 0.34, rv: 0.15, pan: -0.25 },
      arp: { i: 'koto', o: 4, pat: true, v: 0.3, rv: 0.35, pan: -0.3 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.4, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.7 },
      drum: { perc: true, v: 0.55 },
      shk: { perc: true, v: 0.28, pan: 0.3 },
    },
    all: { ost: "0 2 1' 0 2 1' 0 2", pad: TRI, bass: '0 . . 0 . . 0 .', drum: 'z..z..e.|z..z..ee', shk: '..a.....' },
    sections: {
      A: { bars: 8, ch: FIN_A_CH, lead: FIN_A, low: FIN_A_LOW },
      B: { bars: 8, ch: MINOR_B_CH, lead: ROAD_B, choir: TRI },
      C: { bars: 8, mode: 'ionian', ch: ROAD_A_CH, lead: ROAD_A, glass: FIN_C_GLASS, choir: TRI, arp: ARP4, ost: null, bass: BASS4, drum: 'z.......' },
      D: { bars: 8, mode: 'ionian', ch: ROAD_B_CH, lead: ROAD_B, bell: ROAD_B, choir: TRI, arp: ARP4, ost: null, bass: BASS4, drum: 'z...z...' },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'bowed' }, o: { lead: -1 } }, 'C', 'D'],
  });

  // =============================================================== ENDING
  S('ending', {
    title: 'What the Lanterns Kept',
    kind: 'area',
    motifs: ['road'],
    notes: 'Denouement (66): the main theme at its gentlest on flute with harp and electric-piano chords; B on a cello-like bowed voice; C is the travellers’ tune from the quiet road; D lifts the theme a step into E major with celesta doubling the flute and a soft choir.',
    key: 'D', bpm: 66,
    tracks: {
      lead: { i: 'flute', o: 5, v: 0.8, rv: 0.4 },
      lead2: { i: 'bowed', o: 3, v: 0.75, rv: 0.4, pan: -0.1 },
      cel: { i: 'celesta', o: 5, v: 0.5, rv: 0.45, pan: 0.2 },
      keys: { i: 'keys', o: 4, pat: true, fold: 'all', win: -3, v: 0.4, rv: 0.35, pan: 0.2 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.45, rv: 0.4, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.4, rv: 0.45 },
      choir: { i: 'choir', o: 4, hold: true, fold: 'all', win: -3, v: 0.4, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
    },
    all: { arp: ARP4, pad: TRI, keys: '0+1+2 - - - . . . .', bass: BASS4 },
    sections: {
      A: { bars: 8, ch: ROAD_A_CH, lead: ROAD_A },
      B: { bars: 8, ch: ROAD_B_CH, lead2: ROAD_B },
      C: { bars: 8, ch: QR_B_CH, lead: QR_B1, lead2: QR_B2 },
      D: { bars: 8, key: 'E', ch: ROAD_A_CH, lead: ROAD_A, cel: ROAD_A, choir: TRI },
    },
    form: ['A', 'B', { s: 'C', o: { lead: -1 } }, 'D'],
  });

  S('credits', {
    title: 'Borrowed Names, Returned (Credits)',
    kind: 'area',
    motifs: ['road', 'nao', 'mio', 'ren', 'suzu'],
    notes: 'Medley: the main theme; the Reedwake tune in its own 6/8; the four companion motifs in turn; the Snowbell waltz; the theme’s answering phrase; and the theme once more a step higher in E major.',
    key: 'D', bpm: 84,
    tracks: Object.assign({
      lead: { i: 'flute', o: 5, v: 0.8, rv: 0.35 },
      lead4: { i: 'flute', o: 4, v: 0.8, rv: 0.35 },
      cel: { i: 'celesta', o: 5, v: 0.55, rv: 0.4, pan: 0.2 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.45, rv: 0.35, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.4, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
      perc: { perc: true, v: 0.4 },
    }, COMPANION_TRACKS()),
    all: { arp: ARP4, pad: TRI, bass: BASS4 },
    sections: {
      road: { bars: 8, ch: ROAD_A_CH, lead: ROAD_A, perc: 'w...s..s|....s..s' },
      reed: { bars: 8, key: 'G', meter: 3, bpm: 96, ch: REED_A_CH, lead4: REED_A, arp: ARP3, bass: BASS3, perc: 'w..s.s|...s.s' },
      comp: { bars: 8, ch: DEP_B_CH, nao: DEP_NAO, mio: DEP_MIO, ren: DEP_REN, suzu: DEP_SUZU, arp: "0 . 2 . 1' . 2 ." },
      snow: { bars: 8, key: 'F', meter: 3, bpm: 80, ch: SNOW_A_CH, cel: SNOW_A, arp: "0 2 1' 2 1' 2", bass: '0 - - - - -' },
      roadB: { bars: 8, ch: ROAD_B_CH, lead: ROAD_B, perc: 'w...s..s|....s..s' },
      fin: { bars: 8, key: 'E', ch: ROAD_A_CH, lead: ROAD_A, cel: ROAD_A },
    },
    form: ['road', 'reed', 'comp', 'snow', 'roadB', 'fin'],
  });

  // ================================================================ ATLAS
  const ATL_A = '5, - 3 - 2 1 - | 2 - 3 - 5 - - | 5, - 3 - 2 1 - | 7, - 6, - 5, - - | 4 - 5 - 6 5 - | 3 - 2 - 1 - - | 7, - 1 - 2 3 - | 1 - - - - - -';
  const ATL_A_CH = '1 5 1 7 4 1 7 1';
  const ATL_C = "1' - 7 - 6 5 - | 4 - 5 - 6 - - | 5 - 4 - 3 2 - | 1 - - - - - - | 1' - 7 - 6 5 - | 4 - 5 - 6 - - | 1' - 2' - 1' 7 - | 1' - - - - - -";
  const ATL_C_CH = '1 4 5 1 1 4 7 1';

  S('atlas', {
    title: 'The Unwritten Atlas',
    kind: 'area',
    motifs: ['road'],
    notes: 'Post-game expeditions in A mixolydian and a restless 7/8 (2+2+3, 104): the road motif re-cut to an uneven stride. B repeats the theme a minor third higher on celesta — an unstable route; C is a new climbing strain.',
    key: 'A', mode: 'mixolydian', bpm: 104, meter: 3.5,
    tracks: {
      lead: { i: 'flute', o: 4, v: 0.8, rv: 0.25 },
      cel: { i: 'celesta', o: 5, v: 0.55, rv: 0.35, pan: 0.2 },
      ost: { i: 'pluck', o: 4, pat: true, v: 0.5, rv: 0.15, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.35, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.65 },
      drum: { perc: true, v: 0.55 },
      shk: { perc: true, v: 0.35, pan: 0.3 },
    },
    all: { ost: "0 2 1' 2 0 2 4", pad: TRI, bass: '0 - 0 - 2 - -', drum: 't.w.t..', shk: '.s.s.ss' },
    sections: {
      intro: { bars: 2, ch: '1 7', pad: null },
      A: { bars: 8, ch: ATL_A_CH, lead: ATL_A },
      B: { bars: 8, key: 'C', ch: ATL_A_CH, cel: ATL_A },
      C: { bars: 8, ch: ATL_C_CH, lead: ATL_C, drum: 't.w.t.t' },
    },
    form: ['intro', 'A', 'B', 'C', { s: 'A', i: { lead: 'pluck' } }, 'C'],
  });

  // ============================================================ DEPARTURE
  S('departure', {
    title: 'The Departure Room',
    kind: 'area',
    motifs: ['road', 'nao', 'mio', 'ren', 'suzu'],
    notes: 'Choosing a companion (D, 72): the road motif on celesta; then each companion’s motif in turn on their own instrument — Nao (pluck), Mio (mallet), Ren (bell), Suzu (flute) — over one shared progression; then the road’s answering phrase.',
    key: 'D', bpm: 72,
    tracks: Object.assign({
      cel: { i: 'celesta', o: 5, v: 0.6, rv: 0.45 },
      lead: { i: 'flute', o: 5, v: 0.75, rv: 0.35 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.4, rv: 0.4, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.45, rv: 0.45 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
    }, COMPANION_TRACKS()),
    all: { arp: "0 . 2 . 1' . 2 .", pad: TRI, bass: '0 - - - - - - -' },
    sections: {
      A: { bars: 8, ch: ROAD_A_CH, cel: ROAD_A },
      B: { bars: 8, ch: DEP_B_CH, nao: DEP_NAO, mio: DEP_MIO, ren: DEP_REN, suzu: DEP_SUZU },
      C: { bars: 8, ch: ROAD_B_CH, lead: ROAD_B },
    },
    form: ['A', 'B', 'C', 'B'],
  });

  // ================================================================== INN
  const INN_A = "3 - 5 - 6 - 5 3 | 2 - - - 1 - - - | 3 - 5 - 6 - 1' - | 7 - - - 6 - - - | 5 - 6 5 3 - 1 - | 2 - 3 - 4 - 3 - | 2 - 1 - 6, - 7, - | 1 - - - . . . .";
  const INN_A_CH = '1 2 6 5 4 2 5 1';
  const INN_B = "4 - - 3 4 - 6 - | 5 - - - 3 - - - | 2 - - 1 2 - 4 - | 3 - - - - - . . | 4 - - 3 4 - 6 - | 1' - - - 6 - 5 - | 4 - 3 - 2 - 5, - | 2 - - - - - . .";
  const INN_B_CH = '4 1 2 6 4 4 2:0.5 5:0.5 5';

  S('inn', {
    title: 'The Inn at the Crossing',
    kind: 'area',
    motifs: [],
    notes: 'Rest (B-flat, 88, swung): electric-piano sevenths, brushes and hand pats, and a mallet tune that sounds like cups being set out. B is a kitchen-bustle bridge in E-flat.',
    key: 'Bb', bpm: 88, swing: 0.3,
    tracks: {
      mal: { i: 'mallet', o: 4, v: 0.8, rv: 0.25 },
      lead: { i: 'flute', o: 4, v: 0.7, rv: 0.3 },
      keys: { i: 'keys', o: 4, pat: true, fold: 'all', win: -4, v: 0.5, rv: 0.25, pan: 0.2 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      brush: { perc: true, v: 0.45, pan: -0.2 },
    },
    all: { keys: '. . 0+1+2+3 - . 0+1+2+3 - .', bass: '0 - 1 - 2 - 1 -', brush: 'b.pbb.pb' },
    sections: {
      A: { bars: 8, ch: INN_A_CH, mal: INN_A },
      A2: { bars: 8, ch: INN_A_CH, lead: INN_A },
      B: { bars: 8, ch: INN_B_CH, mal: INN_B },
    },
    form: ['A', 'B', 'A2', { s: 'B', i: { mal: 'pluck' } }],
  });

  // ============================================================== MYSTERY
  const MYS_A = "1 . 3 . 4 . 5 . | 6 - 5 - . . . . | 4 . 3 . 1 . 7, . | 2 - - - . . . . | 1 . 3 . 4 . 5 . | 6 - 7 - 1' - . . | 2' - 1' - 6 - 4 - | 5 - - - . . . .";
  const MYS_A_CH = '1 4 1 2 1 4 7 5';
  const MYS_B = '5, - 3 - . . . . | . . . . 2 1 . . | 2 - - - . . . . | .:8 | 5 - - 4 3 - . . | 2 - 3 - 4 - . . | 5 - - - 6 - - - | 5 - - - - - . .';
  const MYS_B_CH = '1 1 2 2 b6 7 4 5M';

  S('mystery', {
    title: 'Something Doesn’t Add Up',
    kind: 'area',
    motifs: ['road'],
    notes: 'Investigation (B dorian, 92): staccato mallet questions that end on the second or the fifth, a plucked walking bass, soft woodblocks. In B the road motif is scattered across the bars like clues with gaps between them.',
    key: 'B', mode: 'dorian', bpm: 92,
    tracks: {
      mal: { i: 'mallet', o: 4, v: 0.8, rv: 0.25, pan: 0.1 },
      lead: { i: 'flute', o: 4, v: 0.75, rv: 0.35 },
      walk: { i: 'pluck', o: 2, pat: true, bass: true, v: 0.75, rv: 0.1 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.35, rv: 0.4 },
      tick: { perc: true, v: 0.4, pan: -0.25 },
    },
    all: { walk: "0 . 2 . 1' . 2 .", pad: '0+1+3', tick: 'w...h.h.|....h...' },
    sections: {
      A: { bars: 8, ch: MYS_A_CH, mal: MYS_A },
      B: { bars: 8, ch: MYS_B_CH, lead: MYS_B },
    },
    form: ['A', 'B', { s: 'A', i: { mal: 'pluck' } }, { s: 'B', i: { lead: 'celesta' }, o: { lead: 1 } }],
  });

  // ============================================================ COMPANIONS
  const NAO_A = '1 1 . 5 - 4 3 4 | 1 - - - . . . . | 1 1 . 5 - 4 3 4 | 6 - 5 - . . . . | 3 - 4 - 5 - 7 - | 6 - - 5 4 - - - | 3 - 1 - 2 - 7, - | 1 - - - . . . .';
  const NAO_A_CH = '1 1 1 4 3 4 1:0.5 7:0.5 1';
  const NAO_B = '5 - - - 4 - 3 - | 2 - - - - - . . | 3 - - - 2 - 1 - | 7, - - - - - . . | 1 1 . 5 - 4 3 4 | 1 - - - - - . . | 6, - 7, - 1 - 2 - | 5, - - - - - . .';
  const NAO_B_CH = '3 7 1 7 1 4 7 5M';

  S('companion_nao', {
    title: 'Nao — The Letter Not Delivered',
    kind: 'companion',
    motifs: ['nao'],
    notes: 'Nao’s motif (1 1 · 5 4 3 4 | 1): two quick knocks, a glance up, a wry sidestep and back — a courier checking the exits. A dorian at 108 on pluck with woodblock knocks; B slows the same motif on flute for the letter Nao chose not to deliver.',
    key: 'A', mode: 'dorian', bpm: 108,
    tracks: {
      pl: { i: 'pluck', o: 4, v: 0.8, rv: 0.2 },
      lead: { i: 'flute', o: 4, v: 0.75, rv: 0.35 },
      gtr: { i: 'pluck', o: 3, pat: true, fold: 'all', win: 5, v: 0.35, rv: 0.1, pan: -0.3 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.35, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.6 },
      knock: { perc: true, v: 0.5, pan: 0.3 },
    },
    all: { gtr: '. 0+1+2 . 0+1+2 . 0+1+2 . 0+1+2', bass: '0 - . 0 2 - . 2', pad: TRI, knock: 'h.h.....|........' },
    sections: {
      A: { bars: 8, ch: NAO_A_CH, pl: NAO_A },
      B: { bars: 8, ch: NAO_B_CH, lead: NAO_B, gtr: null, knock: null, bass: '0 - - - - - - -', dyn: 0.9 },
    },
    form: ['A', 'B', { s: 'A', i: { pl: 'mallet' } }],
  });

  const MIO_A = "3 2 3 5 3 2 3 - | 1 - - - . . . . | 4 3 4 6 4 3 4 - | 2 - - - . . . . | 5 4 5 1' 5 4 5 - | 6 - 5 - 4 - 3 - | 2 - - 3 4 - 7, - | 1 - - - - - . .";
  const MIO_A_CH = '1 1 4 5 1 4 2:0.5 5:0.5 1';
  const MIO_B = "6 - - 5 6 - 1' - | 5 - - - 3 - - - | 4 - - 3 4 - 6 - | 5 - - - - - . . | 3 2 3 5 3 2 3 - | 2 - - - 6, - - - | 7, - 1 - 2 - 5, - | 1 - - - - - . .";
  const MIO_B_CH = '6 1 4 5 1 2 5 1';

  S('companion_mio', {
    title: 'Mio — Labels in Neat Rows',
    kind: 'companion',
    motifs: ['mio'],
    notes: 'Mio’s motif (3 2 3 5 3 2 3 | 1): a small symmetrical figure, set straight like bottles on a shelf, closing firmly on the tonic. F major at 84 on mallet with the odd glass-bottle clink; B lets the flute wonder about the limits of being useful before the motif returns.',
    key: 'F', bpm: 84,
    tracks: {
      mal: { i: 'mallet', o: 4, v: 0.85, rv: 0.25 },
      lead: { i: 'flute', o: 4, v: 0.75, rv: 0.35 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.4, rv: 0.35, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.35, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
      clink: { perc: true, v: 0.4, pan: 0.3 },
    },
    all: { arp: "0 2 1' 2 0 2 1' 2", pad: TRI, bass: BASS4, clink: '......g.|........|...g....|........' },
    sections: {
      A: { bars: 8, ch: MIO_A_CH, mal: MIO_A },
      B: { bars: 8, ch: MIO_B_CH, lead: MIO_B },
    },
    form: ['A', 'B', { s: 'A', i: { mal: 'celesta' }, o: { mal: 1 } }],
  });

  const REN_A = "5, - 1 - 4 - 5 - | 1' - 7 1' - - - - | 6 - 5 - 4 - 3 - | 2 - - - 5, - - - | 5, - 1 - 4 - 5 - | 1' - 7 1' - - 2' - | 3' - 2' - 1' - 5 - | 1' - - - - - . .";
  const REN_A_CH = '5s4 1 4 5 5s4 1 6 1';
  const REN_B = '3 - - - 2 - 1 - | 6, - - - - - . . | 3 - - - 4 - 5 - | 2 - - - - - . . | 5, - 1 - 4 - 5 - | 6 - - - 5 - - - | 4 - 3 - 2 - - - | 5, - - - - - . .';
  const REN_B_CH = '6 4 1 5 5s4 4 2 5';

  S('companion_ren', {
    title: 'Ren — A Lamp Polished Too Carefully',
    kind: 'companion',
    motifs: ['ren'],
    notes: 'Ren’s motif (5, 1 4 5 | 1′ 7 1′): fourths climbing like a lamplighter, then a small turn that is almost a joke. E-flat at 76 on bell and harp with a clock tick; B hands the motif to the flute for the mentor whose face is fading.',
    key: 'Eb', bpm: 76,
    tracks: {
      bell: { i: 'bell', o: 4, v: 0.7, rv: 0.4 },
      lead: { i: 'flute', o: 4, v: 0.75, rv: 0.35 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.4, rv: 0.4, pan: -0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.4, rv: 0.4 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.5 },
      tick: { perc: true, v: 0.3, pan: 0.3 },
    },
    all: { arp: "0 . 2 . 1' . 2 .", pad: TRI, bass: BASS4, tick: 'x.......' },
    sections: {
      A: { bars: 8, ch: REN_A_CH, bell: REN_A },
      B: { bars: 8, ch: REN_B_CH, lead: REN_B },
    },
    form: ['A', 'B', { s: 'A', i: { bell: 'celesta' } }],
  });

  const SUZU_A = "1 - 1' 7 b7 6 | 5 - - 4 - - | 4 - 5 6 - 4 | 3 - - 2 - - | 1 - 1' 7 b7 6 | 5 - - 1' - - | 7 - 6 5 - 2 | 1 - - - - -";
  const SUZU_A_CH = '1:0.5 1D:0.5 5 4 3:0.5 5:0.5 1:0.5 1D:0.5 4:0.5 1:0.5 5 1';
  const SUZU_B = '3 - - - - - | 2 - - 1 - - | 6, - - - - - | 5, - - - - - | 4 - - 3 - - | 2 - - - 1 - | 2 - - - - - | 1 - - - - -';
  const SUZU_B_CH = '1 2 6 5 4 2 5 1';

  S('companion_suzu', {
    title: 'Suzu — The Comfortable Lie',
    kind: 'companion',
    motifs: ['suzu'],
    notes: 'Suzu’s motif (1 1′ 7 ♭7 6 5): a flourish up an octave and a sly chromatic slide back down — a performer’s bow. Playful 6/8 in G on flute over pizzicato pluck and hand pats; B is the honest answer, the same kind of harmony slowed to long notes over harp.',
    key: 'G', bpm: 96, meter: 3,
    tracks: {
      lead: { i: 'flute', o: 4, v: 0.8, rv: 0.3 },
      pz: { i: 'pluck', o: 3, pat: true, v: 0.5, rv: 0.15, pan: -0.25 },
      arp: { i: 'harp', o: 4, pat: true, v: 0.4, rv: 0.4, pan: 0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.35, rv: 0.35 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.55 },
      perc: { perc: true, v: 0.45, pan: 0.2 },
    },
    all: { pz: "0 . 2 1' . 2", pad: TRI, bass: BASS3, perc: 'p..h..|p..hh.' },
    sections: {
      A: { bars: 8, ch: SUZU_A_CH, lead: SUZU_A },
      B: { bars: 8, ch: SUZU_B_CH, lead: SUZU_B, pz: null, perc: null, arp: ARP3, dyn: 0.85 },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'celesta' } }, 'B'],
  });

  // ======================================================== SCENE MOODS
  const SOR_A = '5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 7, - - - 6, - - - | 6, - 1 - 3 - 2 - | 1 - - - 7, 6, 5, - | 4, - - - 5, - #7, - | 1 - - - - - . .';
  const SOR_A_CH = '1 5 6 7 4 1 4:0.5 5M:0.5 1';
  const SOR_B = '3 - - - 4 - 5 - | 6 - - - 5 - - - | 4 - - - 3 - 2 - | 3 - - - - - . . | 3 - - - 4 - 5 - | 6 - - - 5 - 4 - | 3 - - - 2 - - - | 2 - - - - - . .';
  const SOR_B_CH = '3 6 7 3 1 4 5M 5M';

  S('sorrow', {
    title: 'Sorrow',
    kind: 'scene',
    motifs: ['road'],
    notes: 'D minor at 58: the road motif on a bowed voice over harp and pad, falling where it used to climb. B turns briefly toward F major on flute before an open half cadence.',
    key: 'D', mode: 'aeolian', bpm: 58,
    tracks: {
      lead: { i: 'bowed', o: 4, v: 0.75, rv: 0.45 },
      fl: { i: 'flute', o: 5, v: 0.7, rv: 0.45 },
      arp: { i: 'harp', o: 3, pat: true, v: 0.4, rv: 0.45, pan: -0.25 },
      pad: { i: 'pad', o: 3, hold: true, fold: 'all', win: 5, v: 0.5, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
    },
    all: { arp: ARP4, pad: TRI, bass: '0 - - - - - - -' },
    sections: {
      A: { bars: 8, ch: SOR_A_CH, lead: SOR_A },
      B: { bars: 8, ch: SOR_B_CH, fl: SOR_B },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'flute' }, o: { lead: 1 } }],
  });

  const WON_A = "5, - 3 - - 2 1 - | 2 - - - - - . . | 5, - 3 - - 2 1 - | 4 - - - 3 - - - | 5 - - - 6 - 7 - | 1' - - - 7 - 5 - | 4 - - - 2 - 3 - | 2 - - - - - . .";
  const WON_A_CH = '1 2 6 2 6 1 2 5';
  const WON_B = '3 - - - - - - - | 4 - - - - - - - | 5 - - - 3 - - - | 2 - - - - - - - | 6 - - - 5 - - - | 4 - - - 3 - - - | 2 - - - 1 - - - | 1 - - - - - - -';
  const WON_B_CH = '1 2 1 5 6 2 5s4 1';

  S('wonder', {
    title: 'Wonder',
    kind: 'scene',
    motifs: ['road'],
    notes: 'Discovery (E-flat lydian, 76): celesta sixteenths through an echo, flute, then glass. The road motif lifted into lydian — the raised fourth shining and moving on, where the Hush uses the same colour and stays still.',
    key: 'Eb', mode: 'lydian', bpm: 76,
    tracks: {
      lead: { i: 'flute', o: 5, v: 0.75, rv: 0.4 },
      glass: { i: 'glass', o: 5, v: 0.85, rv: 0.5 },
      arp: { i: 'celesta', o: 4, pat: true, u: 0.25, v: 0.3, rv: 0.4, dl: 0.35, pan: 0.25 },
      pad: { i: 'pad', o: 4, hold: true, fold: 'all', win: -5, v: 0.45, rv: 0.5 },
      bass: { i: 'bass', o: 2, pat: true, bass: true, v: 0.45 },
    },
    echo: { beats: 0.75, fb: 0.35, mix: 0.3 },
    all: { arp: "0 2 1' 2 4 2 1' 2", pad: '0+1+2+4', bass: '0 - - - - - - -' },
    sections: {
      A: { bars: 8, ch: WON_A_CH, lead: WON_A },
      B: { bars: 8, ch: WON_B_CH, glass: WON_B },
    },
    form: ['A', 'B', { s: 'A', i: { lead: 'celesta' } }],
  });

  Object.assign(_.mat, {
    REED_A, REED_A_CH, SALT_A, SALT_A_CH, SALT_B, SALT_B_CH, SALT_C, SALT_C_CH,
    CIN_A, CIN_A_CH, CIN_A_CM, CIN_B, CIN_B_CH, CIN_C, CIN_C_CH, KILN_A, KILN_A_CH, KILN_B, KILN_B_CH,
    SNOW_A, SNOW_A_CH, SNOW_B, SNOW_B_CH, SNOW_C, SNOW_C_CH, OBS_A, OBS_A_CH, OBS_B, OBS_B_CH, QR_B1, QR_B2, QR_B_CH,
    LF_A, LF_A_CH, BT_A, BT_A_CH, SA_A, SA_A_CH, SA_B, SA_B_CH, FIN_A, FIN_A_CH,
    BOSS_HUSH, HUSH_A, HUSH_A_CH, FIN_C_GLASS, SOR_A, SOR_A_CH, WON_A, WON_A_CH,
  });

  _.REQUIRED_SONGS = [
    'title', 'prologue', 'reedwake', 'reedwake_night', 'road', 'mill', 'battle', 'boss', 'victory',
    'saltglass', 'drowned_archive', 'cinder', 'kiln', 'snowbell', 'observatory', 'quiet_road',
    'lanternfall', 'belltower', 'hush', 'still_archive', 'finale', 'ending', 'credits', 'atlas',
    'departure', 'inn', 'mystery', 'companion_nao', 'companion_mio', 'companion_ren',
    'companion_suzu', 'sorrow', 'wonder',
  ];
})(RB.audio);
