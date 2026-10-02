/* A Quiet Cast — the nine catalogue entries (Practice addendum §5.3). The
 * roster is the owner's content decision. The drawings are original
 * (src/engine/75_fishing_art.js renders each `art` description); outline, fins
 * and markings differ by species, not only colour.
 *
 * Captions: the natural-history references [F1]–[F9] could not be reached
 * from the build environment, so no biological claim is made in the game.
 * Each entry carries its name and reading, a common English name, and a
 * survey line about where it was recorded (a fact of the game, not of
 * biology). The verified descriptions are pending a source check
 * (docs/practice/fishing.md lists what to verify and where). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (F) {
  'use strict';
  const fish = (id, o) => F.addFish(Object.assign({ id }, o));

  // ---- the current (Reedwake riverbank) ----------------------------------------------------------
  fish('oikawa', {
    jp: 'オイカワ', reading: 'おいかわ', romaji: 'oikawa', en: 'Oikawa', common: 'pale chub', site: 'fish.reedwake.current', ref: 'F1',
    hint: { en: 'Somewhere in the moving water of the Reedwake river.' },
    survey: { jp: 'オイカワ 。 {川|かわ} の {流|なが}れ で {見|み}た 。', en: 'Oikawa. Seen in the river\'s current.' },
    stage: 22,
    art: {
      len: 72,
      profile: [[0, 0.035, 0.03], [0.08, 0.1, 0.07], [0.3, 0.135, 0.11], [0.55, 0.12, 0.1], [0.8, 0.07, 0.06], [1, 0.045, 0.045]],
      tail: { len: 0.24, spread: 0.17, fork: 0.62 },
      dorsal: [{ at: 0.43, len: 0.13, h: 0.11 }],
      anal: { at: 0.58, len: 0.22, h: 0.13, shape: 'long' },
      pelvic: { at: 0.42, len: 0.1, h: 0.06 }, pectoral: { at: 0.2, len: 0.12, h: 0.05 },
      eye: { at: 0.085, v: 0.35, r: 0.03 }, mouth: 'terminal', gill: 0.2,
      col: { back: '#5d8a8a', flank: '#c9d6d2', belly: '#eef0ea', fin: '#d98a6a' },
      mark: { bars: { t0: 0.28, t1: 0.92, n: 9, w: 0.5, col: '#5f9aa6', alt: '#e8907a', v0: 0.15, v1: 0.75, k: 0.7 } },
    },
  });
  fish('kawamutsu', {
    jp: 'カワムツ', reading: 'かわむつ', romaji: 'kawamutsu', en: 'Kawamutsu', common: 'dark chub', site: 'fish.reedwake.current', ref: 'F2',
    hint: { en: 'Somewhere along the Reedwake river, near the bank.' },
    survey: { jp: 'カワムツ 。 {川岸|かわぎし} の {近|ちか}く で {見|み}た 。', en: 'Kawamutsu. Seen near the riverbank.' },
    stage: 22,
    art: {
      len: 72,
      profile: [[0, 0.05, 0.04], [0.1, 0.12, 0.09], [0.32, 0.145, 0.125], [0.6, 0.12, 0.1], [0.82, 0.075, 0.065], [1, 0.05, 0.05]],
      tail: { len: 0.22, spread: 0.16, fork: 0.55 },
      dorsal: [{ at: 0.45, len: 0.12, h: 0.1 }], anal: { at: 0.64, len: 0.13, h: 0.08 },
      pelvic: { at: 0.44, len: 0.09, h: 0.05 }, pectoral: { at: 0.21, len: 0.11, h: 0.05 },
      eye: { at: 0.09, v: 0.35, r: 0.042 }, mouth: 'terminal', mouthLen: 0.07, gill: 0.22,
      col: { back: '#6a7048', flank: '#c9c49a', belly: '#efe8cc', fin: '#d8b04a' },
      mark: { band: { t0: 0.02, t1: 1.0, v: 0.48, hw: 0.11, col: '#2a3550', k: 0.8 } },
    },
  });
  fish('ugui', {
    jp: 'ウグイ', reading: 'うぐい', romaji: 'ugui', en: 'Ugui', common: 'Japanese dace', site: 'fish.reedwake.current', ref: 'F3',
    hint: { en: 'Somewhere in the Reedwake river, out where it runs.' },
    survey: { jp: 'ウグイ 。 {川|かわ} の {流|なが}れ で {見|み}た 。', en: 'Ugui. Seen in the river\'s current.' },
    stage: 26,
    art: {
      len: 76,
      profile: [[0, 0.03, 0.025], [0.1, 0.085, 0.07], [0.35, 0.115, 0.1], [0.65, 0.09, 0.08], [1, 0.042, 0.04]],
      tail: { len: 0.22, spread: 0.15, fork: 0.65 },
      dorsal: [{ at: 0.44, len: 0.11, h: 0.1 }], anal: { at: 0.66, len: 0.11, h: 0.07 },
      pelvic: { at: 0.45, len: 0.08, h: 0.05 }, pectoral: { at: 0.2, len: 0.1, h: 0.04 },
      eye: { at: 0.08, v: 0.32, r: 0.03 }, mouth: 'terminal', gill: 0.2,
      col: { back: '#3e4a4a', flank: '#b8c2c0', belly: '#ecece6', fin: '#c87a5a' },
      mark: { stripes: [{ t0: 0.2, t1: 0.95, v: 0.38, hw: 0.04, col: '#e0703a', k: 0.85 }, { t0: 0.3, t1: 0.9, v: 0.56, hw: 0.05, col: '#2e2e36', k: 0.6 }, { t0: 0.22, t1: 0.96, v: 0.72, hw: 0.04, col: '#e06a38', k: 0.85 }] },
    },
  });

  // ---- quiet water (the pond by the Lantern Road) --------------------------------------------------------------
  fish('ginbuna', {
    jp: 'ギンブナ', reading: 'ぎんぶな', romaji: 'ginbuna', en: 'Ginbuna', common: 'silver crucian carp', site: 'fish.reedwake.quiet', ref: 'F4',
    hint: { en: 'Somewhere in still water near Reedwake.' },
    survey: { jp: 'ギンブナ 。 {静|しず}か な {水|みず} で {見|み}た 。', en: 'Ginbuna. Seen in still water.' },
    stage: 22,
    art: {
      len: 64,
      profile: [[0, 0.05, 0.04], [0.1, 0.15, 0.1], [0.38, 0.22, 0.16], [0.62, 0.18, 0.13], [0.85, 0.09, 0.08], [1, 0.065, 0.06]],
      tail: { len: 0.24, spread: 0.2, fork: 0.35 },
      dorsal: [{ at: 0.36, len: 0.42, h: 0.08, shape: 'long' }], anal: { at: 0.72, len: 0.1, h: 0.08 },
      pelvic: { at: 0.42, len: 0.1, h: 0.06 }, pectoral: { at: 0.22, len: 0.12, h: 0.06 },
      eye: { at: 0.1, v: 0.3, r: 0.035 }, mouth: 'terminal', gill: 0.24,
      col: { back: '#6c7466', flank: '#c8ccc0', belly: '#ece9de', fin: '#9aa090' },
      mark: { scales: true },
    },
  });
  fish('koi', {
    jp: 'コイ', reading: 'こい', romaji: 'koi', en: 'Koi', common: 'common carp', site: 'fish.reedwake.quiet', ref: 'F5',
    hint: { en: 'Somewhere in still water near Reedwake, out in the open.' },
    survey: { jp: 'コイ 。 {静|しず}か な {水|みず} で {見|み}た 。', en: 'Koi. Seen in still water.' },
    stage: 32,
    art: {
      len: 84,
      profile: [[0, 0.05, 0.05], [0.12, 0.13, 0.1], [0.38, 0.17, 0.14], [0.66, 0.14, 0.11], [0.88, 0.08, 0.07], [1, 0.06, 0.06]],
      tail: { len: 0.22, spread: 0.18, fork: 0.42 },
      dorsal: [{ at: 0.34, len: 0.42, h: 0.08, shape: 'long' }], anal: { at: 0.72, len: 0.09, h: 0.08 },
      pelvic: { at: 0.44, len: 0.09, h: 0.06 }, pectoral: { at: 0.22, len: 0.12, h: 0.06 },
      eye: { at: 0.11, v: 0.3, r: 0.028 }, mouth: 'sub', barbels: 2, gill: 0.24,
      col: { back: '#5a4e2a', flank: '#a88e4e', belly: '#dccfa0', fin: '#7a6438' },
      mark: { scales: true },
    },
  });
  fish('motsugo', {
    jp: 'モツゴ', reading: 'もつご', romaji: 'motsugo', en: 'Motsugo', common: 'stone moroko', site: 'fish.reedwake.quiet', ref: 'F6',
    hint: { en: 'Somewhere at the edges of still water near Reedwake.' },
    survey: { jp: 'モツゴ 。 {静|しず}か な {水|みず} の {端|はし} で {見|み}た 。', en: 'Motsugo. Seen at the edge of still water.' },
    stage: 15,
    art: {
      len: 48,
      profile: [[0, 0.03, 0.035], [0.1, 0.09, 0.08], [0.35, 0.12, 0.1], [0.7, 0.09, 0.075], [1, 0.05, 0.05]],
      tail: { len: 0.2, spread: 0.14, fork: 0.3 },
      dorsal: [{ at: 0.45, len: 0.13, h: 0.1, shape: 'round' }], anal: { at: 0.64, len: 0.11, h: 0.07 },
      pelvic: { at: 0.43, len: 0.08, h: 0.05 }, pectoral: { at: 0.2, len: 0.1, h: 0.04 },
      eye: { at: 0.1, v: 0.3, r: 0.045 }, mouth: 'up', gill: 0.21,
      col: { back: '#7a7660', flank: '#c4bfa6', belly: '#e8e2cc', fin: '#a8a088' },
      mark: { band: { t0: 0.05, t1: 1.0, v: 0.48, hw: 0.04, col: '#3a3630', k: 0.85 } },
    },
  });

  // ---- the harbour (Saltglass quay) ---------------------------------------------------------------------------
  fish('mahaze', {
    jp: 'マハゼ', reading: 'まはぜ', romaji: 'mahaze', en: 'Mahaze', common: 'yellowfin goby', site: 'fish.saltglass.harbor', ref: 'F7',
    hint: { en: 'Somewhere in the Saltglass harbour, low down by the quay.' },
    survey: { jp: 'マハゼ 。 {港|みなと} の {底|そこ} の {近|ちか}く で {見|み}た 。', en: 'Mahaze. Seen near the bottom of the harbour.' },
    stage: 22,
    art: {
      len: 72,
      profile: [[0, 0.06, 0.05], [0.08, 0.1, 0.08], [0.2, 0.11, 0.1], [0.5, 0.09, 0.085], [0.8, 0.065, 0.06], [1, 0.05, 0.05]],
      tail: { len: 0.18, spread: 0.11, fork: 0, shape: 'round' },
      dorsal: [{ at: 0.32, len: 0.13, h: 0.09, shape: 'spiny' }, { at: 0.5, len: 0.3, h: 0.07, shape: 'long' }],
      anal: { at: 0.55, len: 0.26, h: 0.06, shape: 'long' },
      pelvic: { at: 0.24, len: 0.12, h: 0.06, disc: true }, pectoral: { at: 0.21, len: 0.11, h: 0.07 },
      eye: { at: 0.09, v: 0.75, r: 0.03 }, mouth: 'terminal', mouthLen: 0.07, gill: 0.2,
      col: { back: '#8a7a5a', flank: '#c8b890', belly: '#ece4cc', fin: '#c4b07a' },
      mark: { mottle: '#5e4e36', spots: [{ t0: 0.1, t1: 0.95, v0: 0.1, v1: 0.55, p: 7, col: '#4a3c2a', seed: 5 }] },
    },
  });
  fish('bora', {
    jp: 'ボラ', reading: 'ぼら', romaji: 'bora', en: 'Bora', common: 'flathead grey mullet', site: 'fish.saltglass.harbor', ref: 'F8',
    hint: { en: 'Somewhere in the Saltglass harbour.' },
    survey: { jp: 'ボラ 。 {港|みなと} で {見|み}た 。', en: 'Bora. Seen in the harbour.' },
    stage: 32,
    art: {
      len: 84,
      profile: [[0, 0.05, 0.035], [0.06, 0.09, 0.06], [0.25, 0.13, 0.11], [0.55, 0.12, 0.1], [0.82, 0.07, 0.065], [1, 0.05, 0.05]],
      tail: { len: 0.2, spread: 0.17, fork: 0.5 },
      dorsal: [{ at: 0.4, len: 0.09, h: 0.1, shape: 'spiny' }, { at: 0.66, len: 0.08, h: 0.08 }],
      anal: { at: 0.68, len: 0.09, h: 0.07 },
      pelvic: { at: 0.36, len: 0.08, h: 0.05 }, pectoral: { at: 0.2, len: 0.12, h: 0.05 },
      eye: { at: 0.07, v: 0.45, r: 0.03 }, mouth: 'terminal', gill: 0.18,
      col: { back: '#4c5c6a', flank: '#b4bcc2', belly: '#e8ecec', fin: '#8a96a0' },
      mark: { stripes: [{ t0: 0.2, t1: 0.96, v: 0.2, hw: 0.025, col: '#5a6876', k: 0.6 }, { t0: 0.2, t1: 0.96, v: 0.33, hw: 0.025, col: '#5a6876', k: 0.6 }, { t0: 0.2, t1: 0.96, v: 0.46, hw: 0.025, col: '#7a8692', k: 0.5 }] },
    },
  });
  fish('maaji', {
    jp: 'マアジ', reading: 'まあじ', romaji: 'maaji', en: 'Maaji', common: 'Japanese jack mackerel', site: 'fish.saltglass.harbor', ref: 'F9',
    hint: { en: 'Somewhere in the Saltglass harbour, further out.' },
    survey: { jp: 'マアジ 。 {港|みなと} の {沖|おき} の ほう で {見|み}た 。', en: 'Maaji. Seen out toward open water.' },
    stage: 24,
    art: {
      len: 76,
      profile: [[0, 0.04, 0.035], [0.1, 0.11, 0.09], [0.32, 0.15, 0.13], [0.6, 0.11, 0.09], [0.86, 0.04, 0.035], [1, 0.03, 0.03]],
      tail: { len: 0.26, spread: 0.2, fork: 0.75 },
      dorsal: [{ at: 0.3, len: 0.12, h: 0.1, shape: 'spiny' }, { at: 0.46, len: 0.32, h: 0.05, shape: 'long' }],
      anal: { at: 0.54, len: 0.28, h: 0.045, shape: 'long' },
      pelvic: { at: 0.33, len: 0.07, h: 0.04 }, pectoral: { at: 0.21, len: 0.16, h: 0.04 },
      eye: { at: 0.1, v: 0.35, r: 0.04 }, mouth: 'terminal', gill: 0.22,
      col: { back: '#3e6a7a', flank: '#c6d4d0', belly: '#eef2ec', fin: '#c8c08a' },
      mark: { scutes: { t0: 0.25, t1: 0.99, v: 0.5, arc: 0.2 }, opercle: '#2a2a32' },
    },
  });
})(RB.fishing);
