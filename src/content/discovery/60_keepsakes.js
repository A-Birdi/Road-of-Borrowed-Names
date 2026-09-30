/* The six field-puzzle keepsakes of the Roadside Keepsakes catalogue
 * (addendum §17.2): registry entries in RB.content.keepsakes, each with its
 * own original pixel art (drawn at 32×32, shown at whole-number scales), its
 * name with reading, where it came from, and two layers of hint. The other
 * six (choice milestones and the two cases) are defined by their own systems
 * in the same registry; the catalogue (src/ui/58_keepsakes.js) reads them all. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  // a crisp pixel helper on a 32×32 context
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const OUT = '#2a2024';
  const K = (def) => def;

  // ---- Folded Reed Boat (F1, Reedwake) -----------------------------------------------------------------
  C.keepsakes.reed_boat = K({
    name: T('{葦|あし} の {折|お}り{舟|ぶね}', 'Folded Reed Boat'),
    desc: { en: 'A little boat folded from reed paper by Reedwake\'s children and kept dry on the shelf behind the warehouse\'s name screen. It floats, for a while.' },
    how: { en: 'Found on the dry shelf behind the slip screen by the river warehouse, once the screen was clamped.' },
    region: 'reedwake', source: { kind: 'puzzle', id: 'f1' },
    hint: {
      broad: { en: 'Somewhere in Reedwake, a draught keeps some names from being read.' },
      specific: { en: 'Between the river warehouse and the river, a screen of name slips swings in the wind off the water.' },
    },
    art(g) {
      const p = ['#7a6440', '#a8905c', '#d2bc84', '#e8d8a8', '#f8ecc8'];
      // water line and shadow
      R(g, 4, 25, 24, 1, '#5a7a96'); R(g, 7, 26, 18, 1, '#8cb0cc'); R(g, 10, 27, 12, 1, '#5a7a96');
      // hull: an inverted trapezoid with a folded rim
      for (let y = 18; y < 25; y++) { const inset = Math.floor((y - 18) * 0.9); R(g, 3 + inset, y, 26 - inset * 2, 1, y === 18 ? p[4] : y < 21 ? p[3] : p[2]); }
      R(g, 3, 18, 26, 1, p[4]); R(g, 9, 21, 14, 1, p[1]);
      // the sail: two folded triangles meeting at the mast crease
      for (let y = 6; y < 18; y++) { const w = Math.floor((y - 6) * 0.62); R(g, 16 - w, y, w, 1, p[3]); R(g, 16, y, w + 1, 1, p[2]); }
      R(g, 16, 6, 1, 12, p[1]);
      // reed fibres in the paper
      [[8, 20, 4], [18, 22, 5], [13, 12, 2], [18, 14, 2], [11, 23, 3]].forEach(([x, y, w]) => R(g, x, y, w, 1, p[1]));
      // outline
      for (let y = 6; y < 18; y++) { const w = Math.floor((y - 6) * 0.62); R(g, 15 - w, y, 1, 1, OUT); R(g, 17 + w, y, 1, 1, OUT); }
      R(g, 16, 5, 1, 1, OUT);
      R(g, 2, 17, 28, 1, OUT); R(g, 2, 18, 1, 1, OUT); R(g, 29, 18, 1, 1, OUT);
      for (let y = 18; y < 25; y++) { const inset = Math.floor((y - 18) * 0.9); R(g, 2 + inset, y, 1, 1, OUT); R(g, 29 - inset, y, 1, 1, OUT); }
      R(g, 9, 25, 14, 1, OUT);
    },
  });
})(RB.content);
