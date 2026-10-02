/* Creatures A — the moth family (the Flour Moth proof, battle addendum §18; also the Margin,
 * Ash, Catalogue, Chart and Postmark Moths). Winged/hovering anatomy (§9.2): wing shape change,
 * body aim, appendage follow-through, a stable hover over its shadow and a controlled arrest
 * of travel.
 *
 * Form (the restyle, docs/battle/creatures_a.md "The rendering standard"): a three-quarter
 * stance turned toward the party at the lower left — the body's axis leans (head up and toward
 * the party, abdomen swinging down behind), the near wings (screen right) large and in front,
 * overlapping the abdomen and casting their shadow on it, the far wings (screen left)
 * foreshortened to two thirds of their span, a ramp step darker, behind the head. Falcate
 * forewings with a hooked apex, a torn notch and a scalloped, chequered fringe; hind wings with a
 * tapered tail that lags the beat (secondary motion). Wing membrane: a warm 6-tone ramp whose
 * shadows run toward red-violet and highlights toward cream, painted as the moth's own pattern —
 * a darker basal area, ante- and postmedial lines with pale edges, a pale band, a dark
 * subterminal band, the veins with a lit side, dark blotches, an eye-spot with a saturated iris,
 * a pupil and a catch-light. A furred thorax of clustered tufts (lit tips upper left, a core
 * shadow lower right, a cool rim on the right), a banded abdomen with pale hair bands, a dark
 * head with a three-quarter face (near eye larger), bipectinate antennae, jointed legs with pale
 * claws. Every form has a coloured outline (the darkest tone pushed toward violet), lighter on
 * lit edges; nearer forms cast a one-step shadow on the ones behind.
 *
 * Native frame 224 × 192, origin (112, 100) (unchanged: the stance fits the old canvas; the far
 * wing's foreshortening gives the raised wings and reaching legs their room).
 *
 * Rig pose q (see rig): x, y body offset; roll (+ turns the belly and legs further to the party
 * at the lower left, on top of the stance's lean); wa [far (screen left), near (screen right)]
 * forewing angle (− raised); wsy stroke foreshortening; wsx span (the near wing narrows as it
 * turns toward the target); hl hind-wing lag (its tail trails it); ant antenna sweep (+ back);
 * legs 0 tucked … 1 reaching to the target; grip; abd abdomen swing (follow-through); fur; eye
 * (1 open, 0 shut); look; dust 0 … 1 material shaken from the wing margins; dk its kind ('flour'
 * the creature's own powder, 'ash', 'frost').
 *
 * Moves (deliveries, Normal ms; contact = when the rules' result shows):
 *   strike  the swoop (§18.2): 0–260 aim (wings draw back, belly to the target), 260–640 an
 *           arcing approach (travel, never a stretched sprite), 640 contact (hit / ward /
 *           softened / met air), 640–760 held contact pose, 760–1150 wings arrest and it returns
 *           (travel back), 1150–1250 settles into its hover. A ward: it meets the seal at 640
 *           and is thrown back. Softened: it meets the seal, then presses through.
 *   shroud  (§18.4) 1,450: wings rise and meet, clap down, shake the powder off the margins;
 *           the veil applies at 760 and settles quietly over its knots (84a veil).
 *   gust, sweep, charge, chill, mend: see deliveries below. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const S = A.side;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const TAU = Math.PI * 2;
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  // the direction of the party (lower left), on screen
  const AIM = [-0.74, 0.67];
  // the three-quarter stance: the body's lean (head toward the party) and the far wings' span
  const LEAN = 0.16, FAR = 0.66, WY = 0.78, HS = 0.92;
  // wing roots on the thorax (body frame) and their resting angles [far, near]
  const ROOT = { fore: [[-4, -8], [5, -7]], hind: [[-3, -3], [4, -2]] };
  const REST = { fore: [-0.04, 0.26], hind: [-0.04, 0.1] };

  // ---- wing outlines (the near wing in its own frame: root at 0,0, the costa running up-right;
  // the far wing is the same, mirrored and foreshortened) -------------------------------------
  const FW = [[1, -4], [7, -14], [17, -26], [31, -38], [47, -48], [63, -55], [77, -59], [89, -61], [94, -58], [91, -53], [89, -45], [87, -35], [83, -25], [77, -15], [69, -6], [60, 2], [48, 8], [34, 11], [20, 10], [9, 6], [2, 2]];
  const COSTA = FW.slice(0, 8);
  const HW = [[1, -2], [15, 1], [31, 5], [45, 12], [55, 22], [59, 33], [56, 44], [49, 51], [44, 54], [33, 55], [21, 49], [11, 38], [4, 24], [0, 10]];
  const PFW = A.poly(FW), PHW = A.poly(HW);
  const FBOX = [-1, -63, 96, 13], HBOX = [-2, -4, 64, 76];
  // the forewing's veins: from the discal cell to the margin (stopping short of it)
  const FVEINS = [[[38, -27], [58, -53]], [[39, -26], [73, -58]], [[40, -24], [86, -59]], [[42, -21], [89, -47]], [[42, -18], [86, -33]], [[41, -15], [80, -21]], [[38, -12], [71, -8]], [[30, -8], [60, 1]], [[8, 3], [46, 8]]];
  const HVEINS = [[[6, 2], [44, 12]], [[6, 3], [56, 26]], [[6, 4], [58, 39]], [[6, 5], [50, 50]], [[5, 6], [34, 54]], [[4, 7], [18, 46]]];
  // radial position of a point between the root (0) and the outer margin (1), by a ray table
  function radial(pts) {
    const NB = 96, tab = new Float64Array(NB);
    const P = A.poly(pts);
    for (let b = 0; b < NB; b++) {
      const a = -Math.PI + (b + 0.5) * (TAU / NB);
      let r = 0;
      for (let d = 1; d < 140; d += 0.5) { if (P.inside(Math.cos(a) * d, Math.sin(a) * d)) r = d; }
      tab[b] = r || 1;
    }
    return (x, y) => { const f = ((Math.atan2(y, x) + Math.PI) / TAU) * NB - 0.5, b0 = Math.floor(f), k = f - b0, i0 = (b0 + NB) % NB, i1 = (b0 + 1) % NB; return Math.hypot(x, y) / (tab[i0] + (tab[i1] - tab[i0]) * k); };
  }
  const UF = radial(FW), UH = radial(HW);
  const costaY = (x) => { for (let i = 1; i < COSTA.length; i++) if (x <= COSTA[i][0]) { const [x0, y0] = COSTA[i - 1], [x1, y1] = COSTA[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1); } return COSTA[COSTA.length - 1][1]; };
  const vang = FVEINS.map(([[x0, y0], [x1, y1]]) => Math.atan2(y1 - y0, x1 - x0));

  // ---- materials ---------------------------------------------------------------------------
  const matCache = new Map();
  function mats(o) {
    const col = o.col || '#c8c0e0', col2 = o.col2 || '#9a8ab8', key = col + col2;
    if (matCache.has(key)) return matCache.get(key);
    const hsl = K.rgb2hsl(...K.parse(col).slice(0, 3));
    const dark = hsl[2] < 0.35; // a dark-winged moth (the Chart Moth): pale marks
    const grey = hsl[1] < 0.12;
    const sol = (c, a) => K.solid([...K.parse(c).slice(0, 3), a], { line: false });
    const wingO = dark ? { n: 6, at: 2, lo: 0.06, hi: 0.66, sat: 1.25, hd: 26, hl: 30 } : { n: 6, at: 4, lo: 0.11, hi: 0.97, sat: grey ? 1 : 1.3, hd: 30, hl: 12, sd: grey ? 0.1 : 0.36 };
    const hindO = dark ? { n: 6, at: 3, lo: 0.1, hi: 0.86, sat: 0.8, hd: 30 } : { n: 6, at: 3, lo: 0.11, hi: 0.92, sat: grey ? 1.1 : 1.7, hd: 50, hl: 20, sd: grey ? 0.12 : 0.42 };
    const bodyC = mixh('#3a3050', col2, 0.18);
    const M = {
      dark,
      wing: A.hmat(col, wingO),
      wingF: A.hmat(mixh(col, '#5a5070', 0.1), Object.assign({}, wingO, { hi: wingO.hi - 0.1, lo: wingO.lo - 0.02 })),
      hind: A.hmat(col2, hindO),
      hindF: A.hmat(mixh(col2, '#5a5070', 0.12), Object.assign({}, hindO, { hi: hindO.hi - 0.1, lo: hindO.lo - 0.02 })),
      // the eye-spot's iris: the hind wing's colour, saturated and warmed
      iris: A.hmat(mixh(col2, dark ? '#e8b050' : '#d0703a', dark ? 0.5 : 0.45), { n: 5, at: 2, lo: 0.2, hi: 0.86, sat: 1.4, line: false }),
      // pale marks on a dark wing (the Chart Moth); on a light wing the marks are its own dark tones
      paleMk: A.hmat(mixh(col2, '#ffffff', 0.3), { n: 4, at: 2, lo: 0.45, hi: 0.95, line: false }),
      body: A.hmat(bodyC, { n: 6, at: 2, lo: 0.07, hi: 0.66, sat: 1.3, hd: 20, hl: 30, rim: '#8c9ee0' }),
      fur: A.hmat(mixh(col, '#fff6e4', 0.4), { n: 6, at: 4, lo: 0.24, hi: 0.98, sat: 0.9, hd: 40, hl: 10, sd: 0.12, rim: '#c4d8ff' }),
      leg: A.hmat(mixh('#2a2238', col2, 0.15), { n: 5, at: 2, lo: 0.07, hi: 0.6, sat: 1.2, rim: '#8090d0' }),
      eye: A.hmat('#e8e2f4', { n: 4, at: 2, lo: 0.42, hi: 0.98, sat: 1, hd: 20, line: '#160c22', lineLit: '#2c1c3c' }),
      ink: K.mat(null, { cols: ['#0c0814', '#1a1228', '#2c2040'], at: 1, line: false }),
      shine: K.solid('#fffaf0', { line: false }),
      dust: {
        flour: [sol(mixh(col, '#fffaf0', 0.6), 240), sol(mixh(col, '#ffffff', 0.25), 190), sol(mixh(col, col2, 0.5), 140)],
        ash: [sol('#d0c8c0', 230), sol('#968e88', 185), sol('#5a5250', 140)],
        frost: [sol('#f4faff', 240), sol('#c8e4f8', 190), sol('#86b8e8', 140)],
      },
    };
    matCache.set(key, M);
    if (matCache.size > 12) matCache.delete(matCache.keys().next().value);
    return M;
  }

  // ---- the wings ---------------------------------------------------------------------------
  // forewing value (0 … 1 → the ramp's tones): the moth's own pattern in clean bands, lit from
  // the costa, darker at the root under the body
  function foreTone(x, y) {
    const u0 = UF(x, y), a = Math.atan2(y, x);
    const u = u0 + 0.014 * Math.sin(a * 11);
    let v;
    if (u < 0.3) v = 0.5;
    else if (u < 0.345) v = 0.1;
    else if (u < 0.385) v = 0.86;
    else if (u < 0.665) v = 0.76;
    else if (u < 0.71) v = 0.1;
    else if (u < 0.765) v = 0.88;
    else if (u < 0.895) v = 0.52;
    else v = 0.36;
    // lit near the leading edge
    const dc = y - costaY(Math.min(89, Math.max(1, x)));
    if (v > 0.2) v += 0.14 * (1 - cl(dc / 20)) - 0.06;
    // each cell lighter along its upper vein (the stripes of a membrane between veins)
    if (u > 0.39 && u < 0.66) {
      for (let i = 0; i < vang.length - 2; i++) {
        const a0 = vang[i], a1 = vang[i + 1];
        const aa = Math.atan2(y + 20, x - 40);
        if (aa >= a0 && aa < a1) { const t = (aa - a0) / (a1 - a0 || 1); if (t < 0.22) v += 0.1; else if (t > 0.8) v -= 0.08; break; }
      }
    }
    if (Math.hypot(x, y) < 13) v -= 0.16;
    return cl(v) * 0.999;
  }
  function hindTone(x, y) {
    const u0 = UH(x, y), a = Math.atan2(y, x);
    const u = u0 + 0.02 * Math.sin(a * 13);
    let v;
    if (u < 0.26) v = 0.22;
    else if (u < 0.7) v = 0.56 - (u - 0.26) * 0.25;
    else if (u < 0.74) v = 0.84;
    else if (u < 0.88) v = 0.28;
    else v = 0.66;
    // lit along its upper edge (the forewing's shadow falls there instead: see cast())
    if (v > 0.2 && v < 0.8) v += 0.12 * (1 - cl((y - x * 0.15) / 30));
    return cl(v) * 0.999;
  }
  // The wing's own coordinates (radial position, angle, pattern tone) depend only on the point in
  // the wing's frame, so they are sampled once into grids at load (one unit apart) and looked up
  // per pixel — the same pattern at a fraction of the cost per frame.
  function grid(fn, box) {
    const [x0, y0, x1, y1] = box, W = x1 - x0 + 1, Hh = y1 - y0 + 1, g = new Float32Array(W * Hh);
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) g[y * W + x] = fn(x0 + x, y0 + y);
    return (x, y) => { const X = Math.round(x - x0), Y = Math.round(y - y0); return X < 0 || Y < 0 || X >= W || Y >= Hh ? fn(x, y) : g[Y * W + X]; };
  }
  const lineZone = (x, y) => { const u = UF(x, y) + 0.014 * Math.sin(Math.atan2(y, x) * 11); return (u > 0.3 && u < 0.345) || (u > 0.665 && u < 0.71) ? 1 : 0; };
  // the chequered fringe folded into the pattern: every third scale along the margin two tones darker
  const withFringe = (tone, U, lo) => (x, y) => {
    const v = tone(x, y);
    if (U(x, y) <= lo || Math.floor(Math.atan2(y, x) * 34) % 3) return v;
    return (Math.max(0, Math.floor(v * 6) - 2) + 0.5) / 6;
  };
  const FT = grid(withFringe(foreTone, UF, 0.955), FBOX), HT = grid(withFringe(hindTone, UH, 0.95), HBOX), LZ = grid(lineZone, FBOX);
  // the scalloped, chequered fringe: notches between the vein ends, alternating pale and dark scales
  // the scalloped margin: notches between the vein ends (the chequered scales are in the pattern)
  function fringe(Lw, ends) {
    for (let i = 1; i < ends.length; i++) {
      const [x0, y0] = ends[i - 1], [x1, y1] = ends[i];
      Lw.eraseEll((x0 + x1) / 2 + (x1 - x0) * 0.02, (y0 + y1) / 2, 2.2, 2.2);
    }
  }
  // a vein drawn point by point in the wing's frame, passing under the cross lines (they stay whole)
  function vein(Lw, M, x0, y0, x1, y1, k, under) {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.4));
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n; if (!under || LZ(x, y) < 0.5) Lw.dot(x, y, M, k); }
  }
  function eyespot(Lw, M, cx, cy, r, far) {
    const ry = r * 0.9;
    Lw.ell(cx + 0.5, cy - 0.5, r + 1, ry + 1, M.wing, M.wing.n - 1);   // the pale halo, lit side
    Lw.ell(cx + 1, cy, r + 1, ry + 1, M.wing, M.wing.n - 3);
    Lw.ell(cx, cy, r, ry, M.wing, 0);                                   // the dark ring
    Lw.ell(cx, cy, r - 2, ry - 2, M.iris, (x, y) => cl(0.62 - ((x - cx) * 0.6 + (y - cy) * 0.8) / (r * 1.6)) * 0.999);
    Lw.ell(cx + 1, cy + 1, r * 0.42, ry * 0.42, M.ink, 0);              // the pupil
    if (!far) { Lw.rect(Math.round(cx - r * 0.5), Math.round(cy - ry * 0.55), 2, 2, M.shine, 0); Lw.dot(cx + 2, cy + 2, M.iris, 4); }
  }
  function forewing(Lw, M, far) {
    const W = far ? M.wingF : M.wing;
    PFW.fill(Lw, W, M.dark ? (x, y) => FT(x, y) * 0.62 + 0.02 : FT);
    // veins: dark, with a lit side above; the discal cell
    const vt = M.dark ? null : 1;
    for (const [[x0, y0], [x1, y1]] of FVEINS) {
      const xe = x0 + (x1 - x0) * 0.92, ye = y0 + (y1 - y0) * 0.92;
      if (M.dark) Lw.line(x0, y0, xe, ye, M.paleMk, 1);
      else vein(Lw, W, x0, y0, xe, ye, vt + 1, true);
    }
    for (const [x0, y0, x1, y1] of [[8, -9, 38, -27], [9, -4, 41, -15], [38, -27, 41, -15]]) vein(Lw, W, x0, y0, x1, y1, 1, !M.dark);
    // the costa's lit edge
    for (let i = 1; i < 7; i++) Lw.line(COSTA[i - 1][0] + 0.5, COSTA[i - 1][1] + 1.2, COSTA[i][0], COSTA[i][1] + 1.2, W, W.n - 1);
    // dark blotches in the outer cells (clusters, two tones)
    for (const [bx, by, bw, bh] of far ? [[72, -40, 6, 4]] : [[72, -40, 7, 5], [76, -24, 5, 4]]) {
      Lw.ell(bx, by, bw / 2 + 0.5, bh / 2 + 0.5, W, 1);
      Lw.ell(bx - 0.5, by - 0.5, bw / 2 - 0.6, bh / 2 - 0.6, W, 0);
    }
    if (M.dark) Lw.scan(FBOX[0], FBOX[1], FBOX[2], FBOX[3], (x, y) => LZ(x, y) > 0.5, (i) => { if (Lw.mt[i] === W.id) { Lw.px[i] = M.paleMk.c[2]; Lw.mt[i] = M.paleMk.id; } });
    A.despeckle(Lw);
    eyespot(Lw, M, 43, -25, far ? 7 : 8, far);
    // a torn notch in the outer margin, and the fringe
    if (!far) Lw.erasePoly([[92, -41], [82, -37], [91, -33]]);
    fringe(Lw, [[89, -61], [91, -53], [89, -45], [87, -35], [83, -25], [77, -15], [69, -6], [60, 2]]);
  }
  function hindwing(Lw, M, far, lag) {
    const W = far ? M.hindF : M.hind;
    PHW.fill(Lw, W, M.dark ? (x, y) => HT(x, y) * 0.8 + 0.04 : HT);
    for (const [[x0, y0], [x1, y1]] of HVEINS) Lw.line(x0, y0, x0 + (x1 - x0) * 0.86, y0 + (y1 - y0) * 0.86, W, 1);
    // the hair at its root
    for (let i = 0; i < 7; i++) Lw.line(2 + i * 2, 1 + (i % 2), 6 + i * 2, 6 + (i % 3), W, i % 2 ? 2 : 3);
    // the ocellus
    // a small discal spot ringed pale (the forewing carries the eye-spot)
    Lw.ell(34, 29, 4.6, 4, W, W.n - 1);
    Lw.ell(34.5, 29.5, 3, 2.6, W, 0);
    Lw.dot(33, 28, W, 2);
    // the tail: tapering from the lower margin, trailing the beat, a pale spatulate tip
    const tx = 41 + lag * 16, ty = 66 - Math.abs(lag) * 5;
    Lw.poly([[36, 52], [47, 51], [tx + 3, ty - 9], [tx + 2, ty], [tx - 3, ty + 1], [tx - 3, ty - 8]], W, (x, y) => (x - (36 + (tx - 36) * cl((y - 52) / (ty - 52))) < 1 ? 3 : 1) / W.n + 0.01);
    Lw.ell(tx - 0.5, ty - 2, 3, 3.5, W, W.n - 1);
    Lw.ell(tx, ty - 1.5, 1.6, 2, W, W.n - 2);
    fringe(Lw, [[55, 22], [59, 33], [56, 44], [49, 51]]);
  }

  // ---- the body -----------------------------------------------------------------------------
  // a lit / shadowed value from a surface normal (upper-left key light), in crisp bands
  const facing = (nx, ny) => -(nx * 0.6 + ny * 0.8);
  function ballTone(cx, cy, rx, ry, lift) {
    return (x, y) => {
      const nx = (x - cx) / rx, ny = (y - cy) / ry, d = Math.min(1, nx * nx + ny * ny);
      const f = facing(nx, ny) * (0.55 + 0.45 * Math.sqrt(d));
      return cl(0.46 + (lift || 0) + f * 0.48 - (d > 0.82 && f < 0 ? 0.1 : 0)) * 0.999;
    };
  }
  // fur: a fluffy mass of tufts — pointed, radiating, overlapping downward; lit tips upper left
  function fluff(Lb, M, cx, cy, rx, ry, fz, seed) {
    // the mass in three crisp bands (lit cap upper left, mid, core shadow lower right)
    const tone = (x, y) => { const f = facing((x - cx) / rx, (y - cy) / ry); return f > 0.32 ? M.n - 1 : f > -0.12 ? M.n - 2 : f > -0.5 ? M.n - 3 : M.n - 4; };
    Lb.ell(cx, cy, rx, ry, M, (x, y) => (tone(x, y) + 0.5) / M.n);
    // tufts along its edge: pointed, radiating, the lower ones first (the upper tufts lie over them)
    const n = 20, tufts = [];
    for (let i = 0; i < n; i++) tufts.push((i / n) * TAU + (hs(i, seed) - 0.5) * 0.22);
    tufts.sort((p, q) => Math.sin(q) - Math.sin(p));
    for (const a of tufts) {
      const ca = Math.cos(a), sa = Math.sin(a), len = 3 + fz * 1.5 + hs(a * 10, seed) * 2.5 + (sa > 0.3 ? 2.5 : 0);
      const bx = cx + ca * rx * 0.8, by = cy + sa * ry * 0.8;
      const tx = cx + ca * (rx + len), ty = cy + sa * (ry + len * 0.8) + 1.5;
      const px = -sa * 3.8, py = ca * 2.8;
      const k = tone(bx + ca * 2, by + sa * 2);
      Lb.poly([[bx - px, by - py], [bx + px, by + py], [tx, ty]], M, k);
    }
    // inside: a few tuft partings — short downward chevrons one tone darker than where they lie
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
      const x = cx - rx * 0.55 + i * (rx * 0.36) + (r ? rx * 0.18 : 0), y = cy - ry * 0.3 + r * ry * 0.48;
      const k = Math.max(0, tone(x, y) - 1);
      Lb.line(x - 2, y - 1, x, y + 1 + fz, M, k); Lb.line(x, y + 1 + fz, x + 2, y - 1, M, k);
    }
  }
  // bipectinate antenna: a curved shaft, a comb of barbs leaning to the tip (two tones)
  function antenna(Lb, M, x0, y0, s, sweep, sc) {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6, a = -1.45 + s * (0.62 + sweep) + t * s * 0.95 * (1 + sweep * 0.4);
      const prev = pts[pts.length - 1] || [x0, y0];
      pts.push(i ? [prev[0] + Math.cos(a) * 5.4 * sc, prev[1] + Math.sin(a) * 5.4 * sc] : [x0, y0]);
    }
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      for (const tt of [0.25, 0.75]) {
        const px = ax + dx * tt, py = ay + dy * tt, b = Math.max(1.6, (4.6 - i * 0.55) * sc);
        Lb.line(px, py, px + nx * b + ux * b * 0.75, py + ny * b + uy * b * 0.75, M.leg, 3);
        Lb.line(px, py, px - nx * b + ux * b * 0.75, py - ny * b + uy * b * 0.75, M.leg, 1);
      }
    }
    Lb.path(pts, 2, M.leg, 1);
    for (let i = 1; i < pts.length; i++) Lb.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], M.leg, 3);
  }
  // legs: femur, tibia, tarsus, a pale claw; tucked under the thorax or reaching to the party
  function legs(Lb, M, reach, grip, dir, near) {
    const r = cl(reach), g = cl(grip);
    const js = near ? (reach > 0.3 ? [0, 1, 2] : [0, 1]) : [0, 1];
    for (const j of js) {
      const hx = (near ? -1 : -6) - j * 2, hy = -5 + j * 3.5, len = (near ? 31 : 25) - j * 5;
      const tx = hx - (near ? 5 : 4) + j * 2, ty = hy + 8 - j;
      const fx = A.lerp(tx, hx + dir[0] * len, r), fy = A.lerp(ty, hy + dir[1] * len, r);
      const kx = (hx + fx) / 2 - dir[1] * 6 * r - 2 * (1 - r), ky = (hy + fy) / 2 + dir[0] * 4 * r - 2;
      const lw = near ? 2.6 : 2.2;
      Lb.path([[hx, hy, lw], [kx, ky, lw], [fx, fy, 1.6]], lw, M.leg, 1);
      Lb.line(hx, hy - 1, kx, ky - 1, M.leg, near ? 4 : 3);
      if (r > 0.3) Lb.line(kx, ky - 1, fx, fy - 1, M.leg, 3);
      Lb.dot(kx, ky - 1, M.leg, 4);
      if (r > 0.3) {
        const cx = dir[0] * 3, cy = dir[1] * 3, sp = 2.4 - g * 2;
        Lb.line(fx, fy, fx + cx - dir[1] * sp, fy + cy + dir[0] * sp, M.fur, 3);
        Lb.line(fx, fy, fx + cx + dir[1] * sp, fy + cy - dir[0] * sp, M.fur, 2);
      } else Lb.dot(fx, fy + 1, M.fur, 3);
    }
  }
  function abdomen(Lb, M, q) {
    // six banded segments from the tip up (each overlaps the one behind it); the tip swings behind
    for (let i = 5; i >= 0; i--) {
      const x = q.abd * Math.pow(i / 5, 1.6) + i * 0.9, y = 6 + i * 6.2, r = 8.8 - i * 0.98, ry = 4.8;
      Lb.ell(x, y, r, ry, M.body, ballTone(x - 1, y - 1, r + 1, ry + 2, 0.04));
      // the pale hair band along its hind edge, in clusters
      for (let k = -2; k <= 2; k++) {
        const bx = x + k * r * 0.36, f = facing(k / 3, 0.4);
        Lb.rect(Math.round(bx - 1), Math.round(y + ry - 2), 2 + (k & 1), 1 + (k === 0 ? 1 : 0), M.fur, f > 0 ? 5 : f > -0.3 ? 4 : 3);
      }
    }
  }
  function head(Lb, M, q) {
    const hx = -3, hy = -27;
    Lb.ell(hx, hy, 11, 9.5, M.body, ballTone(hx, hy, 11, 9.5, 0.06));
    // the palps: two furry bumps under the face
    Lb.ell(hx - 6, hy + 8, 2.6, 2.4, M.fur, 2); Lb.ell(hx - 1.5, hy + 9, 3, 2.4, M.fur, 3);
    // the three-quarter face: the far eye narrow at the head's left edge, the near eye full
    const lx = q.look > 0.5 ? -1 : 0, ly = q.look > 0.5 ? 1 : 0;
    const op = q.eye;
    for (const [ex, ey, rx, ry0] of [[hx - 7.5, hy - 1, 2.6, 4.4], [hx + 1.5, hy - 1.5, 4.8, 5.2]]) {
      if (op < 0.3) { Lb.line(ex - rx, ey + 1, ex + rx, ey + 1, M.ink, 1); Lb.line(ex - rx + 1, ey + 2, ex + rx - 1, ey + 2, M.body, 3); continue; }
      const ry = ry0 * Math.max(0.5, op);
      Lb.ell(ex, ey, rx, ry, M.eye, (x, y) => cl(0.7 + facing((x - ex) / rx, (y - ey) / ry) * 0.45) * 0.999);
      const pw = rx > 3 ? 2 : 1;
      Lb.rect(Math.round(ex - pw / 2) + lx, Math.round(ey - 1) + ly, pw, op < 0.8 ? 2 : 3, M.ink, 0);
      if (rx > 3) Lb.dot(ex - 2 + lx, ey - 2 + ly, M.shine, 0);
    }
    // the mouth: a small dark line under the face
    Lb.line(hx - 6 + lx, hy + 5, hx - 3 + lx, hy + 6, M.ink, 1);
  }

  // powder (or ash, frost) shaken from the wing margins: clusters falling below them
  function dust(L, M, pts, amount, kind, seed) {
    const D = M.dust[kind] || M.dust.flour;
    const n = Math.round(amount * 8);
    pts.forEach(([x, y], k) => {
      for (let i = 0; i < n; i++) {
        const u = hs(seed + k * 13, i), v = hs(i * 7 + k, seed + 3);
        const px = x + (u - 0.5) * 14, py = y + 3 + v * 26 * amount;
        const r = 1 + hs(i, k + seed) * 1.4;
        L.ell(px, py, r, r * 0.8, D[i % 3], 0);
      }
      if (amount > 0.5) L.ell(x + (hs(k, seed) - 0.5) * 6, y + 10 * amount, 6 * amount, 4 * amount, D[2], 0);
    });
  }

  function rig(L, q, o, H, act, fi) {
    const M = mats(o);
    const fH = L.like(), fF = L.like(), lgF = L.like(), ab = L.like(), nH = L.like(), nF = L.like(), bod = L.like(), lgN = L.like(), an = L.like();
    const lean = q.roll + LEAN;
    // the body frame: the stance's lean plus the pose's roll, about the thorax
    const T = (Lr) => Lr.save().translate(q.x, q.y + 4).translate(0, -6).rotate(-lean).translate(0, 6);
    const ca = Math.cos(lean), sa = Math.sin(lean);
    const aim = [AIM[0] * ca - AIM[1] * sa, AIM[0] * sa + AIM[1] * ca]; // the party's direction, in the leaning body
    const margin = [];
    for (const s of [-1, 1]) {
      const i = s < 0 ? 0 : 1, far = s < 0;
      const ang = S(q.wa, i), sy = S(q.wsy, i), sx = S(q.wsx, i) * (far ? FAR : 1), hl = S(q.hl, i);
      const LH = far ? fH : nH, LF = far ? fF : nF;
      const rh = ROOT.hind[i], rf = ROOT.fore[i];
      T(LH).translate(rh[0], rh[1]).scale(s * sx * HS, HS).rotate(ang * 0.55 + hl + REST.hind[i]).scale(1, 0.94 + (sy - 0.94) * 0.5);
      hindwing(LH, M, far, hl * 2.4 + ang * 0.2);
      LH.restore();
      T(LF).translate(rf[0], rf[1]).scale(s * sx, 1).rotate(ang + REST.fore[i]).scale(1, sy * WY);
      forewing(LF, M, far);
      if (q.dust > 0) for (const k of [10, 12, 14]) { const p = LF.fwd(FW[k][0], FW[k][1]); margin.push([p[0] - L.ox, p[1] - L.oy]); }
      LF.restore();
    }
    T(lgF); legs(lgF, M, q.legs, q.grip, aim, false); lgF.restore();
    T(lgN); legs(lgN, M, q.legs, q.grip, aim, true); lgN.restore();
    T(ab); abdomen(ab, M, q); ab.restore();
    T(bod);
    fluff(bod, M.fur, 2, -15 - (q.fur || 0) * 0.5, 16 + (q.fur || 0), 11 + (q.fur || 0) * 0.6, q.fur || 0, 3);
    head(bod, M, q);
    bod.restore();
    // antennae from the top of the head: the far one up-left, the near one up-right and larger
    T(an);
    antenna(an, M, -7, -35, -1, -S(q.ant, 0) * 0.8 + 0.05, 0.86);
    antenna(an, M, 0, -36, 1, S(q.ant, 1) * 0.8, 1);
    an.restore();
    // light: a cool rim down the right edges of the body; each nearer form's shadow on the one behind
    A.rim(bod, [M.fur.id, M.body.id]); A.rim(ab, [M.body.id, M.fur.id]); A.rim(lgN, [M.leg.id]); A.rim(nF, [M.wing.id]); A.rim(nH, [M.hind.id]);
    A.cast(fH, fF, 2, 3, 1); A.cast(nH, nF, 2, 3, 1); A.cast(ab, nH, 2, 2, 1);
    A.cast(nF, bod, 2, 3, 1); A.cast(nH, bod, 2, 3, 1); A.cast(ab, bod, 1, 3, 1);
    A.cast(fF, bod, -2, 3, 1); A.cast(fF, an, 1, 2, 1);
    for (const Lr of [fH, fF, lgF, ab, nH, nF, bod, lgN, an]) A.outline(Lr);
    let out = fH;
    for (const Lr of [fF, lgF, ab, nH, nF, bod, lgN, an]) out = A.over(out, Lr);
    if (q.dust > 0) { const dl = L.like(); dust(dl, M, margin, q.dust, q.dk || 'flour', (fi | 0) * 5 + (act ? act.length : 0)); A.over(out, dl); }
    return out;
  }

  // ---- poses ---------------------------------------------------------------------------------
  const base = { x: 0, y: 0, roll: 0, wa: 0, wsy: 1, wsx: 1, hl: 0, ant: 0, legs: 0, grip: 0, abd: 0, fur: 0, eye: 1, look: 0, dust: 0, dk: 'flour' };
  // idle: a wingbeat whose up- and down-strokes differ (the hind wings lag a beat), antennae and
  // abdomen following through; every second loop a short glide with the wings held high
  const idle = [
    { wa: 0.06, wsy: 1, hl: 0.04, abd: 0, ant: 0.02 },
    { wa: -0.08, wsy: 0.95, hl: 0.09, abd: 0.8, ant: 0.03, y: -1 },
    { wa: -0.26, wsy: 0.85, hl: 0.12, abd: 1.4, ant: 0.04, y: -1 },
    { wa: -0.44, wsy: 0.74, hl: 0.08, abd: 1.6, ant: 0.02, y: -2 },
    { wa: -0.52, wsy: 0.7, hl: -0.03, abd: 1, ant: -0.01, y: -2 },
    { wa: -0.3, wsy: 0.84, hl: -0.14, abd: -0.4, ant: -0.03, y: -1 },
    { wa: -0.06, wsy: 0.96, hl: -0.1, abd: -1.2, ant: -0.03, y: 0 },
    { wa: 0.1, wsy: 1, hl: -0.03, abd: -1, ant: -0.01, y: 1 },
    { wa: -0.22, wsy: 0.9, hl: -0.02, abd: 0.4, ant: 0.05, y: -1 },
    { wa: -0.2, wsy: 0.92, hl: 0.02, abd: 0.8, ant: 0.07, y: -1, roll: 0.02 },
  ];
  const poseTable = {
    // Strike: aim — wings draw back and up, the belly and legs turn to the target
    'prep.strike': [
      { wa: [-0.42, -0.3], wsy: [0.8, 0.84], roll: 0.08, ant: 0.12, legs: 0.15, y: -2, x: 1, abd: 1, look: 1 },
      { wa: [-0.78, -0.52], wsy: [0.64, 0.72], wsx: [0.92, 1], roll: 0.18, ant: 0.26, legs: 0.3, y: -4, x: 3, abd: 2, look: 1, fur: 1 },
      { wa: [-0.95, -0.62], wsy: [0.58, 0.68], wsx: [0.88, 1], roll: 0.26, ant: 0.36, legs: 0.42, y: -5, x: 4, abd: 3, look: 1, fur: 1 },
    ],
    // the arcing approach: a swept glide leaning into it, the legs reaching ahead; at the end the
    // wings flare up to brake as the legs strike
    'exec.strike': [
      { wa: [-0.72, -0.36], wsy: [0.56, 0.64], wsx: [0.84, 0.98], roll: 0.34, ant: 0.5, legs: 0.6, abd: 4, y: -3, look: 1 },
      { wa: [-0.5, -0.16], wsy: [0.5, 0.58], wsx: [0.82, 0.96], roll: 0.42, ant: 0.6, legs: 0.8, abd: 5, y: -2, look: 1 },
      { wa: [-0.2, 0.06], wsy: [0.78, 0.82], wsx: [0.86, 0.98], roll: 0.38, ant: 0.45, legs: 1, abd: 3, look: 1 },
      { wa: [-0.86, -0.56], wsy: [0.96, 0.98], wsx: [0.92, 1], roll: 0.3, ant: 0.2, legs: 1, grip: 0.5, abd: -1, x: -2, y: 1, look: 1 },
    ],
    // contact held: the wings come down around the target, legs gripping, the abdomen swings past
    'exec.impact': [
      { wa: [0.12, 0.28], wsy: [1, 1], wsx: [0.94, 1], roll: 0.28, ant: 0.06, legs: 1, grip: 1, abd: -4, x: -3, y: 2, fur: 1, look: 1 },
      { wa: [-0.2, -0.04], wsy: [0.96, 0.98], wsx: [0.96, 1], roll: 0.2, ant: 0.1, legs: 0.85, grip: 1, abd: -2, x: -1, y: 1, look: 1 },
    ],
    // softened: it meets the seal and is checked, then presses through
    'exec.push': [
      { wa: [-0.9, -0.62], wsy: [0.96, 1], wsx: [0.9, 1], roll: 0.04, ant: -0.12, legs: 0.75, grip: 0, abd: 2, x: 3, y: -1, fur: 1, eye: 0.6, look: 1 },
      { wa: [-0.1, 0.1], wsy: [0.94, 0.96], wsx: [0.9, 1], roll: 0.32, ant: 0.3, legs: 1, grip: 1, abd: -3, x: -3, y: 2, look: 1 },
    ],
    // met empty air (a companion's flourish): it overshoots and tumbles a little
    'exec.miss': [
      { wa: [0.3, -0.62], wsy: [0.9, 0.7], wsx: [0.82, 1], roll: 0.6, ant: 0.6, legs: 0.6, abd: 6, x: -4, y: 3, eye: 0.6 },
    ],
    // the wings arrest the motion (a full braking flare, the body pitched back), it beats home
    'recover.strike': [
      { wa: [-0.74, -0.76], wsy: [1, 1], roll: -0.04, legs: 0.5, ant: -0.12, abd: -3, y: -3, fur: 1 },
      { wa: [0.12, 0.08], wsy: [0.94, 0.96], roll: -0.06, legs: 0.25, abd: -1, y: -1 },
      { wa: [-0.34, -0.38], wsy: [0.78, 0.8], roll: -0.02, legs: 0.1, abd: 1, y: -1 },
      { wa: [-0.04, -0.06], wsy: [0.96, 0.97], legs: 0, abd: 0.5 },
    ],
    // into the hover again: two shallow beats that meet the idle loop
    'recover.hover': [
      { wa: -0.2, wsy: 0.9, abd: 0.4, y: -1 },
      { wa: 0.04, wsy: 1, abd: 0 },
    ],
    // a ward: it strikes the seal and is thrown back (head tipped away, antennae flung forward)
    'recover.deflect': [
      { wa: [-0.8, -0.74], wsy: [0.9, 0.96], wsx: [0.9, 1], roll: -0.26, ant: -0.34, legs: 0.6, grip: 0, abd: -6, x: 5, y: -5, fur: 1, eye: 0.4 },
      { wa: [-0.4, -0.46], wsy: [0.86, 0.9], roll: -0.16, ant: -0.2, legs: 0.4, abd: -4, x: 3, y: -3, eye: 0.7 },
      { wa: [0.08, 0.04], wsy: [0.96, 0.98], roll: -0.06, ant: -0.06, legs: 0.2, abd: -1, y: -1 },
      { wa: [-0.2, -0.22], wsy: [0.88, 0.9], roll: 0, legs: 0, abd: 0.5 },
    ],
    // Shroud: wings rise and meet high over the body
    'prep.shroud': [
      { wa: -0.42, wsy: 0.8, y: -2, abd: 1, ant: -0.04 },
      { wa: -0.76, wsy: 0.62, y: -5, abd: 2, ant: -0.12, fur: 1 },
      { wa: -0.98, wsy: 0.52, wsx: 0.96, y: -6, abd: 3, ant: -0.18, fur: 1 },
    ],
    // … clap down, and shake the powder from the margins (it falls over the knots)
    'cast.shroud': [
      { wa: 0.34, wsy: 1, y: -2, abd: -2, dust: 0.35, fur: 1 },
      { wa: 0.5, wsy: 1, y: 1, abd: -3, dust: 0.75 },
      { wa: [0.22, 0.16], wsy: 0.92, abd: 2, dust: 1, y: 0 },
      { wa: -0.26, wsy: 0.8, abd: -2, dust: 0.9, y: -1 },
      { wa: [0.3, 0.26], wsy: 0.98, abd: 2, dust: 1, y: 1 },
      { wa: 0, wsy: 0.95, abd: 0, dust: 0.6 },
    ],
    'recover.shroud': [
      { wa: -0.3, wsy: 0.84, dust: 0.35, abd: 1, y: -1 },
      { wa: 0.06, wsy: 0.98, dust: 0.15, abd: -1 },
      { wa: -0.22, wsy: 0.88, dust: 0.05, abd: 0.5, y: -1 },
      { wa: 0.02, wsy: 1 },
    ],
    // Gust (the Ash Moth): it rears, then one great fanning downstroke shakes ash at the party
    'prep.gust': [
      { wa: -0.6, wsy: 0.7, y: -4, roll: -0.06, abd: 3, ant: -0.1 },
      { wa: -1.0, wsy: 0.55, wsx: [0.94, 1], y: -7, roll: -0.12, abd: 5, ant: -0.2, fur: 1 },
    ],
    'exec.gust': [
      { wa: -0.4, wsy: 0.86, y: -5, roll: 0.06, abd: 3, dust: 0.3, dk: 'ash' },
      { wa: [0.36, 0.24], wsy: 1, wsx: [1, 0.94], y: -1, roll: 0.14, abd: -2, dust: 0.8, dk: 'ash' },
      { wa: [0.56, 0.44], wsy: 1, wsx: [1, 0.92], y: 1, roll: 0.16, abd: -4, dust: 0.6, dk: 'ash' },
      { wa: [0.4, 0.3], wsy: 0.98, y: 1, roll: 0.1, abd: -2, dust: 0.3, dk: 'ash' },
    ],
    'recover.gust': [
      { wa: -0.3, wsy: 0.82, y: -1, abd: 1, dust: 0.1, dk: 'ash' },
      { wa: 0.02, wsy: 0.98, y: 0 },
    ],
    // Sweep (the Chart Moth): a low, wide pass with the wings spread flat over both of you
    'prep.sweep': [
      { wa: -0.5, wsy: 0.72, y: -3, roll: 0.1, legs: 0.2, abd: -1 },
      { wa: -0.7, wsy: 0.64, wsx: [0.9, 1], y: -5, roll: 0.18, legs: 0.3, abd: -2, ant: 0.3 },
    ],
    'exec.sweep': [
      { wa: [0.06, 0.02], wsy: 1, wsx: [1.04, 1], roll: 0.2, legs: 0.5, ant: 0.5, abd: -4, y: 2 },
      { wa: [0.16, 0.1], wsy: 1, wsx: [1.04, 1], roll: 0.1, legs: 0.6, ant: 0.5, abd: -2, y: 3 },
      { wa: [0.12, 0.16], wsy: 1, wsx: [1, 1.02], roll: -0.04, legs: 0.6, ant: 0.45, abd: 2, y: 3 },
      { wa: [-0.2, -0.3], wsy: 0.9, roll: -0.1, legs: 0.4, ant: 0.3, abd: 4, y: 1 },
    ],
    'recover.sweep': [
      { wa: -0.6, wsy: 0.96, roll: -0.06, legs: 0.2, abd: 2, y: -2 },
      { wa: 0.08, wsy: 0.96, abd: 0 },
      { wa: -0.2, wsy: 0.9, abd: 0.5, y: -1 },
    ],
    // Gathering (Catalogue, Postmark): wings fold down over the body and tremble, gathering
    'prep.charge': [
      { wa: 0.3, wsy: 0.96, y: 1, abd: 0, ant: 0.1 },
      { wa: 0.62, wsy: 0.9, wsx: 0.92, y: 2, ant: 0.18, legs: 0.2 },
    ],
    'cast.charge': [
      { wa: 0.78, wsy: 0.86, wsx: 0.88, y: 2, ant: 0.2, legs: 0.25, fur: 1 },
      { wa: [0.82, 0.76], wsy: 0.84, wsx: 0.86, y: 3, ant: 0.24, legs: 0.25, fur: 1 },
      { wa: [0.76, 0.82], wsy: 0.84, wsx: 0.86, y: 2, ant: 0.2, legs: 0.25, fur: 1 },
      { wa: 0.84, wsy: 0.82, wsx: 0.86, y: 3, ant: 0.26, legs: 0.3, fur: 1, eye: 0.6 },
    ],
    'recover.charge': [
      { wa: 0.36, wsy: 0.94, y: 1, ant: 0.1, legs: 0.1 },
      { wa: -0.1, wsy: 0.96, y: 0 },
    ],
    // Chill (Catalogue): one fanning beat sends cold dust at the one it aims at
    'prep.chill': [
      { wa: -0.5, wsy: 0.74, roll: 0.08, y: -3, abd: -1, ant: 0.1 },
      { wa: -0.84, wsy: 0.6, wsx: [0.9, 1], roll: 0.14, y: -5, abd: -2, ant: 0.18 },
    ],
    'exec.chill': [
      { wa: [0.2, 0.06], wsy: 1, wsx: [0.92, 1], roll: 0.22, y: -2, abd: 2, dust: 0.6, dk: 'frost' },
      { wa: [0.48, 0.32], wsy: 1, wsx: [0.9, 1], roll: 0.24, y: 0, abd: 3, dust: 0.9, dk: 'frost' },
      { wa: [0.3, 0.2], wsy: 0.96, roll: 0.16, y: 0, abd: 1, dust: 0.4, dk: 'frost' },
    ],
    'recover.chill': [
      { wa: -0.3, wsy: 0.84, roll: 0.06, dust: 0.1, dk: 'frost' },
      { wa: 0.02, wsy: 0.98 },
    ],
    // Re-tying (the Chart Moth): it hovers low and its forelegs work the loose thread
    'cast.mend': [
      { wa: -0.2, wsy: 0.9, y: 3, roll: 0.06, legs: 0.6, grip: 0.2, ant: 0.1 },
      { wa: 0.06, wsy: 0.98, y: 4, roll: 0.08, legs: 0.8, grip: 0.8, ant: 0.14 },
      { wa: -0.24, wsy: 0.88, y: 3, roll: 0.06, legs: 0.7, grip: 0.3, ant: 0.1 },
      { wa: 0.04, wsy: 0.98, y: 4, roll: 0.08, legs: 0.85, grip: 1, ant: 0.12 },
    ],
    // Rest: it sinks and spreads its wings flat, antennae lowered
    rest: [
      { wa: 0.12, wsy: 1, y: 2, ant: 0.08, abd: 0.5 },
      { wa: 0.24, wsy: 1, y: 5, ant: 0.16, abd: 1 },
      { wa: 0.22, wsy: 1, y: 5, ant: 0.18, abd: 0.6, eye: 0.7 },
      { wa: 0.06, wsy: 1, y: 3, ant: 0.1, abd: 0 },
    ],
    // reactions to real outcomes
    recoil: [
      { wa: [-0.66, -0.52], wsy: [0.86, 0.9], roll: -0.24, ant: -0.3, abd: -5, x: 3, fur: 1, eye: 0.4 },
      { wa: [-0.24, -0.2], wsy: 0.92, roll: -0.1, ant: -0.1, abd: -2, x: 1, eye: 0.8 },
    ],
    // a knot loosens: a shiver runs through it and a little powder falls
    release: [
      { wa: -0.16, wsy: 0.88, dust: 0.25, abd: 1, fur: 1 },
      { wa: 0.14, wsy: 1, dust: 0.45, abd: -1.5, eye: 0.6 },
      { wa: -0.06, wsy: 0.95, dust: 0.15, abd: 0.5 },
    ],
    // interrupted: the move falters — the wings collapse unevenly, then it catches itself
    balk: [
      { wa: [-0.2, -0.62], wsy: [0.7, 0.8], roll: -0.16, ant: -0.22, legs: 0.2, abd: -3, eye: 0.5 },
      { wa: [0.26, 0.1], wsy: 0.94, roll: -0.08, ant: -0.1, abd: 2, eye: 0.7 },
      { wa: -0.1, wsy: 0.94, roll: -0.02, abd: 0 },
    ],
    // its name comes back: calm beats, and it rests open-winged, eyes closed
    settle: [
      { wa: -0.3, wsy: 0.86, ant: 0.04 },
      { wa: 0.06, wsy: 1, ant: 0.08, eye: 0.5 },
      { wa: 0, wsy: 1, ant: 0.1, eye: 0 },
    ],
  };
  A.family('moth', {
    spec: { w: 224, h: 216, ox: 112, oy: 124, ms: 105, seq: [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 8], bob: (t) => Math.sin(t / 520) * 4 },
    base, idle, poseTable, rig,
    recoil: { push: 5 },
    veil: (o) => ({ kind: 'flour', cols: [mixh(o.col || '#c8c0e0', '#fffaf0', 0.55), mixh(o.col || '#c8c0e0', '#ffffff', 0.2), mixh(o.col || '#c8c0e0', o.col2 || '#9a8ab8', 0.45)] }),
  });

  // ---- deliveries ----------------------------------------------------------------------------
  // The swoop (§18.2). peak: share of the way to the target's chest at contact; arc: lift (art px).
  A.deliver('moth', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) {
      // reduced motion: held key poses in place — aim, strike, recover — no travel
      c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 340, oc === 'ward' ? 'push@0' : 'strike@3');
      c.F(640, 'recover', 360, oc === 'ward' ? 'deflect@1' : 'strike@3');
      c.X(640, oc === 'ward' ? 'scaleShed' : 'scaleShed', 360, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
      return c.done(640, 1000);
    }
    const peak = oc === 'ward' || oc === 'block' ? 0.54 : 0.6;
    const out = { to, peak, arc: 18, shape: 'out' };
    c.F(0, 'prep', 260, 'strike');
    c.F(260, 'exec', 380, 'strike', out);
    c.X(300, 'wingWake', 380, { to });
    if (oc === 'ward' || oc === 'block') {
      // the seal stops it: thrown back at once, then it beats home
      c.F(640, 'recover', 420, 'deflect', { to, peak, shape: 'back' });
      c.X(640, 'scaleShed', 420, { to, seal: true });
      c.F(1060, 'recover', 190, 'hover');
      return c.done(640, 1250);
    }
    if (oc === 'soft') {
      // checked by the seal, then pressing through to the smaller hit (shown 110 ms later)
      c.F(640, 'exec', 120, 'push', { to, peak, shape: 'hold' });
      c.X(640, 'scaleShed', 300, { to, seal: true });
    } else if (oc === 'miss') {
      c.F(640, 'exec', 120, 'miss', { to, peak, shape: 'hold' });
    } else {
      c.F(640, 'exec', 120, 'impact', { to, peak, shape: 'hold' });
      if (oc === 'hit') c.X(640, 'scaleShed', 360, { to });
    }
    c.F(760, 'recover', 390, 'strike', { to, peak, arc: -6, shape: 'back' });
    c.F(1150, 'recover', 100, 'hover');
    return c.done(640, 1250);
  });
  // Shroud (§18.4), 1,450 ms: the condition applies at 760 (the sequencer's beat)
  A.deliver('moth', 'shroud', (a) => {
    const c = A.kit(a);
    if (c.rd) {
      c.F(0, 'prep', 360, 'shroud@2').F(360, 'cast', 560, 'shroud@2');
      c.X(380, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {});
      c.F(920, 'recover', 420, 'shroud@3');
      return c.done(760, 1450);
    }
    c.F(0, 'prep', 300, 'shroud');
    c.F(300, 'cast', 460, 'shroud');
    c.X(330, 'veilRelease', 820, {});
    c.X(700, 'mistRoll', 560, {});
    c.F(760, 'recover', 690, 'shroud');
    return c.done(760, 1450);
  });
  // Gust (the Ash Moth), ~1,300 ms: it rears, then fans the party (wards torn, then the blow)
  A.deliver('moth', 'gust', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 320, 'gust@1').F(320, 'exec', 440, 'gust@2').F(760, 'recover', 400, 'gust@1'); c.X(380, 'gust', 520, { col: '#c8c0b8' }); return c.done(600, 1200); }
    c.F(0, 'prep', 320, 'gust');
    c.F(320, 'exec', 440, 'gust', { to: 'party', peak: -0.04, shape: 'out' });
    c.X(380, 'gust', 600, { col: '#c8c0b8' });
    c.X(400, 'ashDrift', 700, {});
    c.F(760, 'recover', 440, 'gust', { to: 'party', peak: -0.04, shape: 'back' });
    return c.done(600, 1300);
  });
  // Sweep (the Chart Moth), ~1,300 ms: a wide low pass over both of you (first target at 620,
  // the second 120 ms later, placed by the sequencer)
  A.deliver('moth', 'sweep', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'sweep@1').F(300, 'exec', 460, 'sweep@1').F(760, 'recover', 420, 'sweep@2'); c.X(320, 'arc', 600, { who: a.comp ? ['pc', 'comp'] : ['pc'], col: a.ctx.foeCol }); return c.done(620, 1200); }
    c.F(0, 'prep', 280, 'sweep');
    c.F(280, 'exec', 480, 'sweep', { to: 'party', peak: 0.48, arc: 10, shape: 'out' });
    c.X(330, 'arc', 600, { who: a.comp ? ['pc', 'comp'] : ['pc'], col: a.ctx.foeCol });
    c.F(760, 'recover', 440, 'sweep', { to: 'party', peak: 0.48, shape: 'back' });
    c.F(1200, 'recover', 100, 'hover');
    return c.done(620, 1300);
  });
  // Gathering, ~1,200 ms: wings folded and trembling while the motes draw in (applies at 760)
  A.deliver('moth', 'charge', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'charge@1').F(260, 'cast', 640, 'charge@3').F(900, 'recover', 300, 'charge@0'); c.X(240, 'gather', 640, {}); return c.done(760, 1200); }
    c.F(0, 'prep', 260, 'charge');
    c.F(260, 'cast', 640, 'charge');
    c.X(240, 'gather', 640, {});
    c.F(900, 'recover', 300, 'charge');
    return c.done(760, 1200);
  });
  // Chill (the Catalogue Moth), ~1,150 ms: one fanning beat sends cold dust at its target
  A.deliver('moth', 'chill', (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'chill@1').F(300, 'exec', 320, 'chill@1').F(620, 'recover', 420, 'chill@1'); c.X(320, 'frostDust', 320, { to }); return c.done(600, 1100); }
    c.F(0, 'prep', 280, 'chill');
    c.F(280, 'exec', 340, 'chill', { to, peak: 0.12, shape: 'out' });
    c.X(320, 'frostDust', 330, { to, seal: A.outcome(a) === 'ward' || A.outcome(a) === 'block' });
    c.F(620, 'recover', 440, 'chill', { to, peak: 0.12, shape: 'back' });
    c.F(1060, 'recover', 90, 'hover');
    return c.done(600, 1150);
  });
  // Re-tying (the Chart Moth), ~1,200 ms: its forelegs work a loose knot tight again
  A.deliver('moth', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {};
    const i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@3').F(900, 'recover', 300, 'hover@1'); c.X(240, 'mendThread', 600, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 240, 'charge');
    c.F(240, 'cast', 660, 'mend', { to: 'party', peak: -0.03, shape: 'out' });
    c.X(260, 'mendThread', 600, { i });
    c.F(900, 'recover', 300, 'hover', { to: 'party', peak: -0.03, shape: 'back' });
    return c.done(760, 1200);
  });

  A.auditFamily('moth', {
    anatomy: 'winged / hovering', frame: [224, 192], anchor: [112, 100], was: [188, 160],
    idle: '10 drawings, 20-entry sequence × 105 ms (wingbeat with distinct up/down strokes and a hind-wing lag; a held glide every other loop)',
    materials: 'wing membrane with scale fringe (chequered margin), costal highlight, veins, ante/postmedial lines, eye-spot; furred thorax tufts; banded abdomen; bipectinate antennae; jointed legs',
    moves: { strike: 'swoop (travel out/hold/back, arc 18)', shroud: 'wing clap, powder shaken from the margins', gust: 'rear and fanning downstroke (ash)', sweep: 'low wide pass', charge: 'wings folded, trembling', chill: 'fanning beat, frost dust', mend: 'forelegs knot the thread' },
    reactions: 'recoil (flung back, antennae forward), release (shiver, powder falls), balk (wings collapse unevenly), settle (open wings, eyes closed)',
    overlays: 'Shroud veil in its own powder (84a); Gathering motes; Heat pips (shared)',
  });
})();
