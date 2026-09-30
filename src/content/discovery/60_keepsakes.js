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

  // ---- Painted Cork Float (F2, Saltglass) ----------------------------------------------------------------
  C.keepsakes.cork_float = K({
    name: T('{色|いろ} を {塗|ぬ}った コルク の {浮|う}き', 'Painted Cork Float'),
    desc: { en: 'A spare float from the harbour office\'s demonstration tank, cork painted in bands by the harbour children. The working float stayed in its tank.' },
    how: { en: 'Taken from the net bag of spares beside the signal float, once the float stood at the viewing slot.' },
    region: 'saltglass', source: { kind: 'puzzle', id: 'f2' },
    hint: {
      broad: { en: 'In Saltglass, something by the water is meant to rise, and doesn\'t.' },
      specific: { en: 'Past the east end of the quay, on the sand: a tank with a float at the bottom and a window at the top.' },
    },
    art(g) {
      const cork = ['#6a4424', '#8a5a30', '#b8864a', '#d8aa6a', '#ecc890'];
      // a stubby cylinder seen from the side, with painted bands and a loop of cord
      R(g, 9, 6, 14, 1, OUT); R(g, 8, 7, 16, 18, OUT); R(g, 9, 25, 14, 1, OUT);
      for (let x = 9; x < 23; x++) { const k = x < 11 ? 3 : x < 14 ? 4 : x > 20 ? 1 : 2; R(g, x, 7, 1, 18, cork[k]); }
      R(g, 9, 11, 14, 3, '#b83a2e'); R(g, 9, 11, 14, 1, '#d85a44'); // red band
      R(g, 9, 18, 14, 3, '#2e5a8a'); R(g, 9, 18, 14, 1, '#4a7ab0'); // blue band
      R(g, 9, 7, 14, 2, cork[4]); // the lit top
      for (const [x, y] of [[12, 9], [17, 15], [14, 22], [19, 23]]) R(g, x, y, 1, 1, cork[0]); // cork pores
      // the cord loop through the top
      R(g, 14, 2, 4, 1, OUT); R(g, 13, 3, 1, 4, OUT); R(g, 18, 3, 1, 4, OUT); R(g, 14, 3, 4, 1, '#e8e0cc');
      R(g, 6, 27, 20, 1, 'rgba(0,0,0,0.25)');
    },
  });

  // ---- Glass Leaf (F3, Cinder Orchard) ---------------------------------------------------------------------
  C.keepsakes.glass_leaf = K({
    name: T('ガラス の {葉|は}', 'Glass Leaf'),
    desc: { en: 'A small leaf of pale green glass, made by Hiro from the ends of his rods: the same leaf he presses into his work as a maker\'s mark.' },
    how: { en: 'Master Isao offered it from the dish on the workshop shelf, once the sample globe\'s mark was read and its card put back.' },
    region: 'cinder', source: { kind: 'puzzle', id: 'f3' },
    hint: {
      broad: { en: 'In Cinder Orchard, a finished piece has lost its name.' },
      specific: { en: 'In the glass workshop, a sample globe sits on a rocking tray under a lamp, its maker\'s mark too shallow to read.' },
    },
    art(g) {
      const gl = ['#2e6a4a', '#4a9a6a', '#7ac894', '#b4e8c4', '#eafff0'];
      // a leaf outline: pointed tip up-right, stem down-left
      const rows = [[20, 5, 3], [17, 6, 7], [15, 7, 10], [13, 8, 12], [11, 9, 14], [10, 10, 15], [9, 11, 15], [8, 12, 15], [7, 13, 15], [7, 14, 14], [6, 15, 14], [6, 16, 13], [6, 17, 12], [6, 18, 11], [7, 19, 9], [7, 20, 8], [8, 21, 6], [9, 22, 4]];
      for (const [x, y, w] of rows) { R(g, x - 1, y, w + 2, 1, OUT); }
      R(g, 17, 4, 5, 1, OUT); R(g, 9, 23, 4, 1, OUT);
      for (const [x, y, w] of rows) for (let i = 0; i < w; i++) { const d = i / w; R(g, x + i, y, 1, 1, gl[d < 0.25 ? 3 : d < 0.6 ? 2 : 1]); }
      // the midrib and veins
      for (let i = 0; i < 14; i++) R(g, 9 + i, 21 - i, 1, 1, gl[0]);
      for (const [x, y] of [[12, 14], [15, 11], [18, 8]]) { R(g, x - 2, y + 1, 2, 1, gl[0]); R(g, x + 1, y + 2, 1, 2, gl[0]); }
      R(g, 10, 12, 2, 1, gl[4]); R(g, 12, 10, 2, 1, gl[4]); // highlight
      // the stem
      R(g, 6, 23, 3, 1, OUT); R(g, 5, 24, 2, 3, OUT); R(g, 7, 23, 1, 1, gl[1]); R(g, 6, 24, 1, 2, gl[1]);
    },
  });

  // ---- Snowflake Toggle (F4, Snowbell) ------------------------------------------------------------------------
  C.keepsakes.snow_toggle = K({
    name: T('{雪|ゆき} の {留|と}め{具|ぐ}', 'Snowflake Toggle'),
    desc: { en: 'A wooden coat toggle carved in the shape of a snowflake by Denji, Snowbell\'s old carpenter, and left in the post shelter\'s holding box for anyone to take.' },
    how: { en: 'Found in box ③ of the post shelter\'s holding boxes, the one without a name and with the same round stamp as Hayate\'s.' },
    region: 'snowbell', source: { kind: 'puzzle', id: 'f4' },
    hint: {
      broad: { en: 'In Snowbell, frost hides something that is being given away.' },
      specific: { en: 'Beside the post shelter, three boxes wait behind a frosted glass cover, and a note says which one.' },
    },
    art(g) {
      const wd = ['#5a3a22', '#7a5230', '#a07040', '#c89a60', '#e8c890'];
      // six arms from a centre, each with a pair of side twigs, carved in wood
      const cx = 16, cy = 16;
      const arm = (dx, dy) => {
        for (let i = 2; i < 12; i++) { const x = Math.round(cx + dx * i), y = Math.round(cy + dy * i); R(g, x - 1, y - 1, 3, 3, OUT); }
        for (let i = 2; i < 12; i++) { const x = Math.round(cx + dx * i), y = Math.round(cy + dy * i); R(g, x, y, 1, 1, i < 6 ? wd[3] : wd[2]); }
        const tx = cx + dx * 7, ty = cy + dy * 7, px = -dy, py = dx;
        for (const s of [1, -1]) for (let j = 1; j < 4; j++) { const x = Math.round(tx + (px * s + dx) * j * 0.7), y = Math.round(ty + (py * s + dy) * j * 0.7); R(g, x, y, 1, 1, wd[1]); }
      };
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 - Math.PI / 2; arm(Math.cos(a), Math.sin(a)); }
      R(g, cx - 3, cy - 3, 7, 7, OUT); R(g, cx - 2, cy - 2, 5, 5, wd[3]); R(g, cx - 2, cy - 2, 5, 1, wd[4]);
      // the two holes for the cord
      R(g, cx - 1, cy - 1, 1, 1, wd[0]); R(g, cx + 1, cy + 1, 1, 1, wd[0]);
    },
  });

  // ---- Miniature Bell Clapper (F5, Lanternfall) -------------------------------------------------------------
  C.keepsakes.bell_clapper = K({
    name: T('{小|ちい}さな {撞木|しゅもく}', 'Miniature Bell Clapper'),
    desc: { en: 'A spare miniature striker for the garden\'s listening chime: a turned wooden head on a silk cord. The real striker still hangs in the alcove.' },
    how: { en: 'Offered from the box under the tube diagram in the Garden Quarter, once the chime rang only the display flower.' },
    region: 'lanternfall', source: { kind: 'puzzle', id: 'f5' },
    hint: {
      broad: { en: 'In Lanternfall, a sound keeps arriving where someone is trying to read.' },
      specific: { en: 'In the Garden Quarter, bamboo tubes carry a chime\'s note from a stone alcove to a reading nook and a display niche.' },
    },
    art(g) {
      const wd = ['#4a2e1a', '#6e4428', '#9a6438', '#c48a50', '#e4b476'];
      // the cord from the top, a knot, the turned wooden head below
      R(g, 15, 2, 2, 12, OUT); R(g, 15, 2, 1, 12, '#d84a5a'); R(g, 16, 2, 1, 12, '#a82a3a');
      R(g, 13, 13, 6, 3, OUT); R(g, 14, 13, 4, 2, '#d84a5a');
      R(g, 10, 16, 12, 12, OUT); R(g, 9, 18, 14, 8, OUT);
      for (let y = 17; y < 27; y++) for (let x = 10; x < 22; x++) { const d = (x - 10) / 12; if ((y === 17 || y === 26) && (x < 11 || x > 20)) continue; R(g, x, y, 1, 1, wd[d < 0.2 ? 4 : d < 0.45 ? 3 : d < 0.8 ? 2 : 1]); }
      R(g, 10, 21, 12, 1, wd[0]); R(g, 10, 23, 12, 1, wd[4]); // turned rings
      R(g, 11, 18, 2, 2, '#fff0d0');
      R(g, 8, 29, 16, 1, 'rgba(0,0,0,0.25)');
    },
  });

  // ---- Pocket Paperweight (F6, the Archive road) ---------------------------------------------------------------
  C.keepsakes.paperweight = K({
    name: T('{懐|ふところ} の {文鎮|ぶんちん}', 'Pocket Paperweight'),
    desc: { en: 'A smooth flat stone from the stream below the Last Lamp Hut. Oyone keeps a pile of them by her index box to hold travellers\' papers down in the mountain wind.' },
    how: { en: 'Oyone offered it from beside the index box, once the loose slips were filed by her rule.' },
    region: 'archive_road', source: { kind: 'puzzle', id: 'f6' },
    hint: {
      broad: { en: 'On the last stretch of road, a traveller\'s index has come apart.' },
      specific: { en: 'In the Last Lamp Hut, three slips lie loose on a tray beside Oyone\'s index box.' },
    },
    art(g) {
      const st = ['#3a3a44', '#565864', '#7a7c88', '#9ea0aa', '#c8cad0'];
      // a flat oval pebble with a pale quartz band
      const rows = [[10, 10, 12], [8, 11, 16], [6, 12, 20], [5, 13, 22], [5, 14, 22], [4, 15, 24], [4, 16, 24], [4, 17, 24], [5, 18, 22], [5, 19, 22], [6, 20, 20], [8, 21, 16], [10, 22, 12]];
      for (const [x, y, w] of rows) R(g, x - 1, y, w + 2, 1, OUT);
      R(g, 10, 9, 12, 1, OUT); R(g, 10, 23, 12, 1, OUT);
      for (const [x, y, w] of rows) for (let i = 0; i < w; i++) { const d = i / w, e = (y - 10) / 12; R(g, x + i, y, 1, 1, st[e < 0.3 ? (d < 0.4 ? 4 : 3) : e < 0.7 ? (d < 0.3 ? 3 : 2) : (d > 0.7 ? 0 : 1)]); }
      for (let i = 0; i < 18; i++) R(g, 7 + i, 18 - Math.round(i * 0.35), 1, 1, '#e8e4dc'); // the quartz band
      R(g, 9, 12, 3, 1, '#ffffff');
      R(g, 5, 25, 22, 1, 'rgba(0,0,0,0.25)');
    },
  });
})(RB.content);
