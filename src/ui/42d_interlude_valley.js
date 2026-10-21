/* The valley below Lanternfall on the first arrival (Chapter 5, lf.arrive; RBN-QA-064). On the map the Lantern
 * Road is only its roadside (grass, pines, its lamps), so the two lines that describe the view are shown as one
 * picture of it:
 *   valley  from the road's edge where the pines open (a trunk either side, their needle pads across the top):
 *           the valley below in the region's soft lavender afternoon (65_worldlook.js); Lanternfall on its floor,
 *           laid out as lf.town is (src/content/ch5/10_maps.js) and seen from above its north side: the indigo
 *           kawara roofs of its halls and houses, the avenue, the straight narrow canals (the grand canal with its
 *           two bridges, the east canal down to the lake), and the lamps standing in their rows along the avenue,
 *           the embankments and the lane; beyond the sluice shore (lf.sluice) the lake, and out in it only the top
 *           of the old tower (lf_sunktower: the indigo roof with its finial, the pale belfry, the green bell in its
 *           dark arch) breaking the surface; the far shore's ridges in haze.
 * The town is the map's own plan in a simple perspective (its rows recede toward the lake; on a narrow screen its
 * east and west ends go out of the frame, never the canals or the tower); its colours are the region's
 * (RB.tiles.PAL.lanternfall, the indigo kawara of 29_structart.js, the battle backdrop's lavender ridges and
 * haze). What the lines name is above the dialogue sheet (vb). Still layers per size; live: the lamps' flicker and
 * a faint shimmer on the lake. Reduced motion holds the picture still. Drawn with RB.pxkit at art resolution in
 * the prologue's manner (41_prologue_art.js, 42c_interlude_lookout.js); implemented provisionally under AC-1. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, stage, bandsIn } = A.kit;
  // its own layers per size, kept apart from the prologue's small cache
  const mine = new Map();
  const cached = (key, build) => {
    let v = mine.get(key);
    if (!v) { v = build(); mine.set(key, v); if (mine.size > 6) mine.delete(mine.keys().next().value); }
    return v;
  };
  A.kit.onRelease(() => mine.clear());
  const K = () => RB.pxkit;
  const key = (n, G) => n + '|' + G.w + 'x' + G.h + '|' + G.vb;
  const hex3 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix3 = (a, b, t) => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
  const hexOf = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const hashf = (x, y, k) => (K().hh(x | 0, y | 0, k || 0) % 1000) / 1000;
  // smooth value noise (blotches that keep their size on the ground plane)
  function vnoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hashf(xi, yi, seed), b = hashf(xi + 1, yi, seed), c = hashf(xi, yi + 1, seed), d = hashf(xi + 1, yi + 1, seed);
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  }

  // ---- the region's colours ---------------------------------------------------------------------------------
  // RB.tiles.PAL.lanternfall (grass, stone, water, sand, wood, wall, dirt, leaf, trunk, roof); the indigo kawara
  // ramp as 29_structart.js builds it (r5of, and one sunlit step above it); the lamppost's iron (26_propkit.js
  // FIX.iron) and the lantern's glass (21_tileart.js); the bell's patina (12_tower.js); the battle backdrop's
  // ridges and haze (76_battle_placeart.js LAND.lanternfall); the shade of the region's sun (65_worldlook.js).
  const C = {
    lawn: ['#4a7056', '#5d8a6a', '#6c9a78', '#82ae8c'],
    meadow: ['#527a5e', '#5d8a6a', '#6c9a78', '#78a484'],
    pave: ['#9892a4', '#b9b3c2', '#c4becd', '#d0cad6'],
    sand: ['#c4b89e', '#dcd2bc', '#e8e0cc'],
    path: ['#9c8c74', '#b4a48c', '#c4b69e', '#d4c8b2'],
    canal: ['#2e4a78', '#3c5c8a', '#4a6c9c', '#6c8cbc'],
    lake: ['#3c5c8a', '#4a6c9c', '#5a7cac', '#6c8cbc', '#8496c6', '#9ca6d2'],
    wallS: ['#7e7890', '#9892a4'],
    wallL: ['#b9b3c2', '#d0cad6'],
    deck: ['#503842', '#6a4c56', '#80606a', '#9c7c86'],
    bed: ['#3e6a58', '#f4d884', '#e8b4d0'],
  };
  const ROOF = ['#25223e', '#2a2848', '#3a3860', '#4c4a78', '#6e6ca0', '#8a86b6'];
  const STONE = ['#6e687e', '#7e7890', '#9892a4', '#b9b3c2', '#d0cad6'];
  const WOOD = ['#3e2c34', '#503842', '#6a4c56', '#80606a', '#9c7c86'];
  const PLASTER = ['#9a8ea4', '#b6aabe', '#d6ccdc', '#ebe4ee', '#f4f0f6'];
  const LEAF = ['#1e3a32', '#2e5042', '#3e6a58', '#4c7e6a', '#66987f'];
  const PINE = ['#0f1e1c', '#162a26', '#1f3a32', '#2b4c3e', '#3c624c', '#557a5c'];
  const BARK = ['#24191d', '#3e2c30', '#584044', '#6e5458', '#86686a'];
  const IRON = ['#18161f', '#2c2a36', '#46444f', '#676573', '#9593a0'];
  const PATINA = ['#3a4a3a', '#4a5a4a', '#5a6a52', '#6e7e62'];
  const SKY = ['#7a78b2', '#8682ba', '#928cc2', '#a098ca', '#ada4d1', '#bab0d8', '#c7bcde', '#d3c6e2', '#ddcee4'];
  const CLOUD = ['#b6aad6', '#d2c8e6', '#ebe2f0'];
  const HAZE = hex3('#b8b0d4');
  const HZV = [0, 0.15, 0.3, 0.44];
  const SHADE = hex3('#382868'); // the shade of the region's sun (56,40,104)

  // ---- the town, as lf.town lays it out (its own tiles: x west → east, y north → south) ---------------------------
  const TW = 52;
  const HOUSES = [ // x, y, w, h (the footprint, as the struct), wall, extra
    [5, 4, 12, 7, 'stone'], [21, 2, 10, 7, 'stone'], [36, 5, 8, 5, ''],
    [3, 26, 8, 5, 'wood', 'lit'], [14, 26, 6, 4, ''], [22, 26, 6, 4, 'wood', 'chim'], [31, 26, 6, 4, 'wood'],
    [4, 33, 5, 3, ''], [13, 33, 5, 3, 'wood'], [22, 33, 6, 3, ''], [31, 33, 5, 3, ''],
  ];
  const PAVE = [[0, 16, 52, 5], [4, 11, 14, 5], [24, 9, 4, 7], [38, 10, 4, 6], [0, 24, 42, 1], [0, 21, 3, 3],
    [0, 31, 42, 2], [11, 25, 2, 6], [20, 25, 2, 6], [28, 25, 2, 6], [38, 25, 4, 15], [3, 36, 35, 2], [10, 33, 2, 3], [19, 33, 2, 3], [29, 33, 2, 3]];
  const LAMPS = [];
  for (const x of [3, 9, 15, 21, 30, 36, 44, 49]) LAMPS.push([x, 16], [x, 19]);
  for (const x of [2, 20, 36]) LAMPS.push([x, 20]);
  for (const x of [5, 16, 23, 30]) LAMPS.push([x, 24]);
  for (const x of [4, 14, 24, 33]) LAMPS.push([x, 31]);
  // the old tower, out in the lake beyond the sluice shore (lf.sluice: the lake from about row 54, the tower east of
  // the lane down to the shore)
  const TOWER = [49.5, 64];
  // the road out of the west gate, back up the hillside to where you stand
  const ROAD = [[0, 18], [-5, 17.6], [-10, 14.5], [-13, 8], [-13.5, 1], [-11, -7], [-6, -15], [1, -24]];
  const KD = 0.018, QF = 0.3, CAM = 22, XL = -26, XR = 96;
  // the feet of the valley's walls (west and east), a little irregular
  const XLof = (Y) => XL + 3 * Math.sin(Y * 0.13 + 1) + 1.6 * Math.sin(Y * 0.37);
  const XRof = (Y) => XR + 4 * Math.sin(Y * 0.11 + 2) + 1.8 * Math.sin(Y * 0.33 + 1);
  const SHORE = (X) => 54 + 1.6 * Math.sin(X * 0.11 + 0.7) + 0.8 * Math.sin(X * 0.31 + 2);
  function roadDist(X, Y) {
    let best = 1e9;
    for (let i = 1; i < ROAD.length; i++) {
      const [xa, ya] = ROAD[i - 1], [xb, yb] = ROAD[i], dx = xb - xa, dy = yb - ya, L2 = dx * dx + dy * dy;
      const t = clamp(((X - xa) * dx + (Y - ya) * dy) / L2, 0, 1), ex = xa + dx * t - X, ey = ya + dy * t - Y;
      best = Math.min(best, ex * ex + ey * ey);
    }
    return Math.sqrt(best);
  }
  // what the ground is at a point of the plan
  const LAKE = 1, SAND = 2, CANAL = 3, CWALL = 4, CWALLL = 5, DECK = 6, PAVEC = 7, PATH = 8, BED = 9, LAWN = 10, MEADOW = 11;
  function cls(X, Y, sh) {
    if (X >= 42 && X < 45 && Y >= 24) {             // the east canal, from the grand canal down to the lake
      if (Y >= sh) return LAKE;
      if (Y >= 36 && Y < 38) return DECK;            // the lane's bridge over it
      return X >= 44.55 ? CWALLL : CANAL;            // its east wall faces us and the sun
    }
    if (Y >= sh) return LAKE;
    if (Y >= sh - 0.9) return SAND;
    if (X >= 0 && X < TW && Y >= 0 && Y < 40) {
      if (Y >= 21 && Y < 24 && X >= 3) {
        if (X >= 12 && X < 14 || X >= 33 && X < 35) return DECK;
        return Y >= 23.55 ? CWALL : CANAL;
      }
      for (const r of PAVE) if (X >= r[0] && X < r[0] + r[2] && Y >= r[1] && Y < r[1] + r[3]) return PAVEC;
      if ((X >= 19 && X < 23 || X >= 29 && X < 33) && Y >= 10 && Y < 15 && Math.floor(Y) % 2 === 0) return BED;
      return LAWN;
    }
    if (X >= 38 && X < 42 && Y >= 40 && Y < sh - 2) return PAVEC; // the lane on down to the shore
    if (X > -16 && X < 3 && Y > -26 && Y < 20 && roadDist(X, Y) < 1) return PATH;
    return MEADOW;
  }

  // ---- where everything is ------------------------------------------------------------------------------------
  // The plan seen in perspective: a row Y of it lies at q = 1 / (1 + KD·Y) (1 at the town's north edge, QF at the
  // far shore); px per tile across at the north edge (tp) from the share of the view the town fills, more of it
  // on a narrow screen; how steeply we look down (the rows' depth against their width), steeper there too.
  function geom(w, h, vb) {
    const S = stage(w, h, vb), { s } = S;
    const pw = clamp(Math.round(w * 0.05), s(14), s(40));         // the pines' trunks either side
    const canopy = Math.max(s(10), Math.round(vb * 0.07));         // their pads across the top
    const x0 = pw, x1 = w - pw, iw = x1 - x0, aspect = iw / Math.max(1, vb);
    const frac = clamp(1.5 - 0.35 * aspect, 0.78, 1.25);
    const tp = (frac * iw) / TW;                                    // px per tile at the town's near (north) edge
    const ratio = clamp(0.5 + 0.28 * (1.6 - aspect), 0.5, 0.78);
    const A0 = (ratio * tp) / KD, span = A0 * (1 - QF);
    const yMinF = Math.round(Math.max(canopy + s(30), vb * 0.24)); // room above the far shore for the ridges
    const yN = Math.round(Math.min(vb - Math.max(s(22), vb * 0.09), Math.max(yMinF, vb * 0.4) + span));
    const AA = yN - span < yMinF ? (yN - yMinF) / (1 - QF) : A0;
    const yE = yN - AA, yF = Math.round(yE + AA * QF);
    // the town's middle column in the view's middle (a little east of it when the ends go out of the frame)
    const Xc = TW / 2 + 4 * clamp((frac - 0.9) / 0.35, 0, 1);
    const vx = x0 + iw * 0.5 - (Xc - CAM) * tp;
    const q = (Y) => 1 / (1 + KD * Y);
    const sy = (Y) => yE + AA * q(Y);
    const sx = (X, Y) => vx + (X - CAM) * tp * q(Y);
    const hv = (Y) => tp * q(Y) * 0.8;                              // px per tile of height
    const footX = (X, y) => vx + (X - CAM) * tp * ((y - yE) / AA);  // where a line of the plan crosses a row
    return Object.assign(S, { w, h, vb, pw, canopy, x0, x1, iw, tp, A: AA, yE, yN, yF, vx, q, sy, sx, hv, footX,
      xLF: Math.round(footX(XLof(1 / QF / KD - 1 / KD), yF)), xRF: Math.round(footX(XRof(1 / QF / KD - 1 / KD), yF)) });
  }
  // A crest across the view from key points (x, y), refined by a seeded midpoint displacement: its row per column.
  function crestOf(w, keys, seed, amp) {
    const rn = K().rnd(seed);
    let pts = keys;
    for (let it = 0, a = amp; it < 4; it++, a *= 0.55) {
      const nx = [pts[0]];
      for (let i = 1; i < pts.length; i++) { const [xa, ya] = pts[i - 1], [xb, yb] = pts[i]; nx.push([(xa + xb) / 2 + (rn() - 0.5) * a * 0.5, (ya + yb) / 2 + (rn() - 0.5) * a], pts[i]); }
      pts = nx;
    }
    const out = new Float32Array(w);
    for (let x = 0, j = 0; x < w; x++) { while (j < pts.length - 2 && pts[j + 1][0] < x) j++; const [xa, ya] = pts[j], [xb, yb] = pts[j + 1]; out[x] = ya + (yb - ya) * clamp((x - xa) / Math.max(1e-3, xb - xa), 0, 1); }
    return out;
  }
  // The valley's walls (the left one in shade: it faces away from the afternoon sun; the right one lit) and the
  // ridges beyond the lake, each per column.
  function land(G) {
    const { w, yF, xLF, xRF, canopy, s, Z } = G;
    // (no steeper than about 37° on screen, so a narrow view keeps them low)
    const yTL = Math.round(Math.max(canopy * 0.4, yF - Math.max(s(56), (yF - canopy) * 0.95), yF - xLF * 0.75));
    const yTR = Math.round(Math.max(canopy * 0.6, yF - Math.max(s(44), (yF - canopy) * 0.8), yF - (w - xRF) * 0.75));
    const rL = new Int16Array(w), rR = new Int16Array(w);
    for (let x = 0; x < w; x++) {
      const u = clamp(x / Math.max(1, xLF), 0, 1), v = clamp((w - x) / Math.max(1, w - xRF), 0, 1);
      rL[x] = Math.round(yF - (yF - yTL) * Math.pow(1 - u, 1.35) + (1 - u) * (s(3) * Math.sin(x * 0.07 / Z) + s(1.5) * Math.sin(x * 0.23 / Z + 1)));
      rR[x] = Math.round(yF - (yF - yTR) * Math.pow(1 - v, 1.25) + (1 - v) * (s(2.5) * Math.sin(x * 0.08 / Z + 2) + s(1.5) * Math.sin(x * 0.27 / Z)));
    }
    // beyond the lake: a far range (its summits, for the light on their faces) and the far shore's low hills
    const peaks = [[-0.05, 0.62], [0.1, 0.3], [0.2, 0.55], [0.31, 0.12], [0.42, 0.5], [0.5, 0.26], [0.6, 0.58], [0.7, 0], [0.8, 0.42], [0.9, 0.2], [1.05, 0.6]];
    const fh = Math.max(s(16), Math.min(s(38), (yF - canopy) * 0.45)), fb = yF - s(9);
    const far = crestOf(w, peaks.map(([u, v]) => [u * w, fb - fh * (1 - v)]), 7719, s(6));
    const summits = [1, 3, 5, 7, 9].map((i) => ({ x: peaks[i][0] * w, y: fb - fh * (1 - peaks[i][1]) }));
    const near = crestOf(w, [[-10, yF - s(6)], [w * 0.15, yF - s(11)], [w * 0.33, yF - s(5)], [w * 0.5, yF - s(9)], [w * 0.7, yF - s(4)], [w * 0.86, yF - s(10)], [w + 10, yF - s(5)]], 3301, s(3));
    const rowY = (y) => (G.A / (y + 0.5 - G.yE) - 1) / KD;
    const inL = (x, y) => (y < yF ? x <= xLF && y >= rL[x] : x < G.footX(XLof(rowY(y)), y));
    const inRt = (x, y) => (y < yF ? x >= xRF && y >= rR[x] : x > G.footX(XRof(rowY(y)), y));
    return { rL, rR, inL, inRt, far, near, summits };
  }

  // ---- the buildings --------------------------------------------------------------------------------------------
  // A house of the plan in the view: its north wall toward us (in shade), the side wall that faces us, and its
  // hipped kawara roof: the north slope with its tile columns, its eave and its ridge, the sunlit south slope
  // showing over the ridge, the hip ends. Drawn into its own small layer and outlined.
  function house(G, b) {
    const P = K(), [bx, by, bw, bd, wk, extra] = b;
    const Xw = bx + 0.15, Xe = bx + bw - 0.15, Yn = by + 0.5, Ys = by + bd - 0.1, Ym = (Yn + Ys) / 2;
    const Hw = 1.15, Hr = (Ys - Yn) * 0.42, e = 0.32, hx = Math.min((Ys - Yn) / 2, (Xe - Xw) / 2 - 0.4);
    const p = (X, Y, Z) => [G.sx(X, Y), G.sy(Y) - Z * G.hv(Y)];
    const pts = [p(Xw - e, Yn - e, Hw), p(Xe + e, Yn - e, Hw), p(Xe + e, Ys + e, Hw), p(Xw - e, Ys + e, Hw), p(Xw + hx, Ym, Hw + Hr), p(Xe - hx, Ym, Hw + Hr), p(Xw, Yn, 0), p(Xe, Yn, 0), p(Xe, Ys, 0), p(Xw, Ys, 0)];
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const [x, y] of pts) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
    bx0 = Math.floor(bx0) - 3; by0 = Math.floor(by0) - 6; bx1 = Math.ceil(bx1) + 3; by1 = Math.ceil(by1) + 3;
    const L = P.layer(bx1 - bx0, by1 - by0, -bx0, -by0);
    const roof = P.mat(null, { cols: ROOF, at: 2, lineCol: '#120e22' });
    const wcols = wk === 'stone' ? STONE : wk === 'wood' ? WOOD : PLASTER, wall = P.mat(null, { cols: wcols, at: 2 });
    const timber = P.mat(null, { cols: WOOD, at: 1 }), glass = P.solid(extra === 'lit' ? '#f2c46a' : '#2a2436'), dark = P.solid('#2a2436');
    const step = (k, n) => (k + 0.5) / n;
    const tpq = G.tp * G.q(Yn);
    // the north wall: shade; stone in courses, boards in battens, plaster between timber posts; a footing
    const [nw0, nw1, nw2, nw3] = [p(Xw, Yn, 0), p(Xe, Yn, 0), p(Xe, Yn, Hw), p(Xw, Yn, Hw)];
    L.poly([nw0, nw1, nw2, nw3], wall, (x, y) => {
      if (y > nw0[1] - 1.5) return step(0, 5);
      if (wk === 'stone') return step(Math.round(nw0[1] - y) % 3 === 0 ? 0 : 1, 5);
      if (wk === 'wood') return step(Math.round(x - nw0[0]) % Math.max(2, Math.round(tpq * 0.45)) === 0 ? 0 : 1, 5);
      return step(1, 5);
    });
    if (!wk) for (let X = Xw; X <= Xe + 0.01; X += Math.max(1, Math.round((Xe - Xw) / 3))) { const [x, y] = p(Math.min(X, Xe - 0.1), Yn, 0); L.rect(Math.round(x), Math.round(nw3[1]), 1, Math.round(y - nw3[1]), timber, 1); }
    // a few windows in it (the inn's lit)
    const nWin = Math.max(1, Math.round((Xe - Xw) / 4));
    if (tpq >= 3.2) for (let i = 0; i < nWin; i++) {
      const X = Xw + ((i + 0.5) / nWin) * (Xe - Xw), [x, y] = p(X, Yn, Hw * 0.62), ww = Math.max(1, Math.round(tpq * 0.3)), wh = Math.max(1, Math.round(tpq * 0.28));
      L.rect(Math.round(x - ww / 2), Math.round(y), ww, wh, (i + bx) % 3 === 1 && extra !== 'lit' ? dark : glass, 0);
    }
    // the side wall that faces us: the east one (west of the view's middle: shade), or the west one (sunlit)
    if (Xe < CAM) L.poly([p(Xe, Yn, 0), p(Xe, Ys, 0), p(Xe, Ys, Hw), p(Xe, Yn, Hw)], wall, step(0, 5));
    else if (Xw > CAM) L.poly([p(Xw, Yn, 0), p(Xw, Ys, 0), p(Xw, Ys, Hw), p(Xw, Yn, Hw)], wall, step(3, 5));
    // the roof
    const [NW, NE, SE, SW, rW, rE] = pts;
    const cw = Math.max(2, Math.round(tpq * 0.42));
    L.poly([SW, SE, rE, rW], roof, (x, y) => step(y < rW[1] - 0.5 && y < SW[1] + 1.5 ? 5 : 4, 6));          // the sunlit south slope
    L.poly([NW, SW, rW], roof, (x, y) => step(Math.round(x) % cw === 0 ? 3 : 4, 6));                          // the west hip, lit
    L.poly([NE, SE, rE], roof, (x, y) => step(Math.round(x) % cw === 0 ? 0 : 1, 6));                          // the east hip, shade
    L.poly([NW, NE, rE, rW], roof, (x, y) => {                                                                 // the north slope
      const eave = NW[1] + (NE[1] - NW[1]) * clamp((x - NW[0]) / Math.max(1, NE[0] - NW[0]), 0, 1);
      if (y > eave - 1) return step(4, 6);           // the eave's round caps catch the light
      if (y < rW[1] + 1) return step(5, 6);          // the ridge
      return step(Math.round(x - NW[0]) % cw === 0 ? 1 : (y - rW[1]) / Math.max(1, eave - rW[1]) > 0.6 ? 2 : 3, 6);
    });
    // the ridge's end tiles, dark
    for (const r of [rW, rE]) L.rect(Math.round(r[0]) - 1, Math.round(r[1]) - 1, Math.max(2, Math.round(tpq * 0.3)), Math.max(1, Math.round(tpq * 0.2)), roof, 0);
    // a chimney on the inn and the bakery
    if (extra === 'lit' || extra === 'chim') {
      const [cx, cy] = p(Xe - hx * 0.6 - 0.4, Ym, Hw + Hr * 0.55), cwd = Math.max(2, Math.round(tpq * 0.45)), chh = Math.max(3, Math.round(tpq * 0.9));
      L.rect(Math.round(cx), Math.round(cy - chh), cwd, chh, P.mat(null, { cols: ['#3e2c30', '#5a4044', '#7a5a52', '#94726a'], at: 2 }), (x) => step(x < cx + 1 ? 3 : 1, 4));
      L.rect(Math.round(cx), Math.round(cy - chh), cwd, 1, dark, 0);
    }
    L.outline();
    return { cv: L.canvas(), x: bx0, y: by0, roofTop: Math.round(Math.min(rW[1], SW[1])), base: Math.round(nw0[1]), eave: Math.round(NW[1]), left: Math.round(NW[0]), right: Math.round(NE[0]) };
  }

  // ---- the trees and the sun's shade on the plan -----------------------------------------------------------------
  // The plan's trees in groves (each drawn and outlined as one mass): lf.town's park in the north-east, the trees
  // east of the east canal, the row along the south edge in runs with gaps (the east canal's mouth open), its
  // ragged north and west borders; a few groves on the meadows and along the shore.
  let treeSet = null;
  function trees() {
    if (treeSet) return treeSet;
    const r = K().rnd(5531), groves = [];
    const grove = (pts) => { if (pts.length) groves.push(pts); };
    const blob = (cx, cy, n, rx, ry, s0) => { const pts = []; for (let i = 0; i < n; i++) pts.push([cx + (r() - 0.5) * rx * 2, cy + (r() - 0.5) * ry * 2, s0 * (0.75 + r() * 0.5)]); return pts; };
    grove(blob(47.5, 6, 4, 2.6, 2.4, 1.1)); grove(blob(48.6, 11.6, 3, 2, 1.6, 1.05));
    grove(blob(48.6, 28, 4, 2.1, 2.4, 1.05)); grove(blob(49, 34.6, 4, 2.1, 2.2, 1.1));
    for (let x = 0.4; x < TW;) {
      const n = 3 + Math.floor(r() * 4), pts = [];
      for (let i = 0; i < n && x < TW; i++, x += 1.0 + r() * 0.5) if (x < 41.4 || x > 45.6) pts.push([x, 39.2 + r() * 0.6, 0.8 + r() * 0.35]);
      grove(pts);
      x += 1.5 + r() * 2.5;
    }
    for (let x = 1; x < TW;) { const n = 1 + Math.floor(r() * 3), pts = []; for (let i = 0; i < n; i++, x += 0.9 + r() * 0.5) pts.push([x, 0.2 + r() * 1.1, 0.8 + r() * 0.3]); grove(pts); x += 3 + r() * 5; }
    for (let y = 3; y < 38; y += 2.2 + r() * 2.4) if (y < 14.5 || y > 25) grove([[0.5 + r() * 0.8, y, 0.85 + r() * 0.3]]);
    for (const [x, y, n, sp] of [[-7, 30, 5, 2.4], [-18, 20, 3, 1.8], [-5, 45, 4, 2.2], [60, 10, 5, 2.6], [63, 33, 4, 2.2], [72, 47, 3, 2], [27, 46.5, 3, 1.8], [-16, -5, 3, 2]]) grove(blob(x, y, n, sp, sp * 0.8, 1.05));
    treeSet = { groves, all: groves.flat() };
    return treeSet;
  }
  // The sun's shade on the plan (it falls north-east: toward us and to the right) from the houses and the trees, on
  // a grid of quarter tiles, built once.
  const SG = { x0: -30, y0: -30, n: 4, w: 130 * 4, h: 90 * 4 };
  let shadeGrid = null;
  function shadeOf() {
    if (shadeGrid) return shadeGrid;
    const g = new Uint8Array(SG.w * SG.h);
    const set = (X, Y) => { const i = Math.floor((X - SG.x0) * SG.n), j = Math.floor((Y - SG.y0) * SG.n); if (i >= 0 && j >= 0 && i < SG.w && j < SG.h) g[j * SG.w + i] = 1; };
    for (const [x, y, w, d] of HOUSES) {
      const a = x + 0.15, b = y + 0.5, c = x + w - 0.15, e = y + d - 0.1;
      for (let Y = b - 0.875; Y < e; Y += 0.25) for (let X = a; X < c + 1.625; X += 0.25) {
        for (let t = 0.2; t <= 1.01; t += 0.2) { const xx = X + 0.125 - 1.6 * t, yy = Y + 0.125 + 0.8 * t; if (xx >= a && xx < c && yy >= b && yy < e) { set(X + 0.01, Y + 0.01); break; } }
      }
    }
    for (const [tx, ty, sz] of trees().all) for (let Y = ty - 1.25; Y < ty + 1.25; Y += 0.25) for (let X = tx - 0.5; X < tx + 2; X += 0.25) { const dx = X + 0.125 - 0.7 - tx, dy = Y + 0.125 + 0.35 - ty; if (dx * dx + dy * dy * 1.6 < 0.42 * sz * sz) set(X + 0.01, Y + 0.01); }
    return (shadeGrid = g);
  }
  const shaded = (g, X, Y) => { const i = Math.floor((X - SG.x0) * SG.n), j = Math.floor((Y - SG.y0) * SG.n); return i >= 0 && j >= 0 && i < SG.w && j < SG.h && g[j * SG.w + i] === 1; };

  // ---- the whole view, still ------------------------------------------------------------------------------------
  function cloudBank(g, cx, y, wd, ht, seed) {
    const rn = K().rnd(seed);
    const lobes = [[0, 0, 0.5], [-0.2, -0.45, 0.22], [0.12, -0.7, 0.18], [0.3, -0.35, 0.16]];
    for (const [ox, oy, f] of lobes) {
      const hw = wd * f, h2 = Math.max(1, Math.round(ht * (oy ? 0.7 : 1))), x0 = cx + ox * wd, y0 = y + Math.round(oy * ht);
      for (let j = 0; j < h2; j++) {
        const half = Math.round(hw * (0.6 + 0.4 * Math.sqrt((j + 1) / h2)) + (rn() - 0.5) * 2);
        R(g, x0 - half, y0 + j, half * 2, 1, j === 0 ? CLOUD[2] : j < h2 - 1 ? CLOUD[1] : CLOUD[0]);
      }
    }
  }
  function view(G) {
    return cached(key('lvview', G), () => {
      const { w, h, s, yE, A: AA, yF, tp, vx } = G, P = K(), bay = P.bayer;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const LD = land(G), SH = shadeOf();
      // the sky: lavender bands, warmer low over the ridges; two soft cloud banks
      bandsIn(g, 0, 0, w, yF + 2, SKY, 0.45);
      cloudBank(g, Math.round(w * 0.3), Math.round(yF * 0.34), w * 0.3, Math.max(2, s(4)), 61);
      cloudBank(g, Math.round(w * 0.74), Math.round(yF * 0.5), w * 0.2, Math.max(2, s(3)), 62);
      const FAR = ['#a59dc8', '#aaa2cc', '#b2aad0', '#c0b6d9'].map(hex3), HIL = ['#66658f', '#716f9b', '#7e7aa6', '#8c86b2', '#a09ac2'].map(hex3);
      const WL = ['#2a403e', '#35504a', '#425e56', '#526e62'].map(hex3), WR = ['#4a6e5a', '#5a8268', '#6a9676', '#82ac88'].map(hex3);
      const MIST = hex3('#c6bcde');
      // ground colours with the haze mixed in (4 levels), cached per colour
      const memo = new Map();
      const hz = (c, lv) => { const k2 = c + '|' + lv; let v = memo.get(k2); if (!v) { v = mix3(hex3(c), HAZE, HZV[lv]); memo.set(k2, v); } return v; };
      const hzc = (c3, lv) => (lv ? mix3(c3, HAZE, HZV[lv]) : c3);
      let yTop = h;
      for (let x = 0; x < w; x++) yTop = Math.min(yTop, LD.far[x] | 0, LD.rL[x], LD.rR[x]);
      yTop = Math.max(0, yTop);
      const img = g.getImageData(0, yTop, w, h - yTop), d = img.data;
      const put = (x, y, c) => { const o = ((y - yTop) * w + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; };
      const shoreY = new Int16Array(w);
      const owner = (x) => { let best = LD.summits[0], bd = 1e9; for (const S of LD.summits) { const dd = Math.abs(x - S.x); if (dd < bd) { bd = dd; best = S; } } return best; };
      for (let y = yTop; y < h; y++) {
        const qq = (y + 0.5 - yE) / AA, Y = (1 / qq - 1) / KD, fl = clamp((0.88 - qq) * 5.2, 0, 3);
        const fL = y >= yF ? G.footX(XLof(Y), y) : 0, fR = y >= yF ? G.footX(XRof(Y), y) : 0;
        for (let x = 0; x < w; x++) {
          const bv = bay(x, y);
          // the valley's walls: forest in clustered crowns, hazier toward the far end
          const left = y < yF ? x <= G.xLF && y >= LD.rL[x] : x < fL, right = !left && (y < yF ? x >= G.xRF && y >= LD.rR[x] : x > fR);
          if (left || right) {
            const u = left ? clamp(x / Math.max(1, G.xLF), 0, 1) : clamp((w - x) / Math.max(1, w - G.xRF), 0, 1);
            const lv = clamp(Math.floor(Math.pow(u, 1.15) * 3.3 + (bv - 0.5) * 0.5), 0, 3);
            const n = vnoise(x * 0.42 / G.Z, y * 0.7 / G.Z, left ? 11 : 12), n2 = vnoise(x * 0.42 / G.Z, (y - 1) * 0.7 / G.Z, left ? 11 : 12);
            const ridge = left ? LD.rL[x] : LD.rR[x];
            let k = n > 0.64 ? 0 : n > 0.47 ? 1 : 2;
            if (k === 2 && n2 > 0.47 && n < 0.4) k = 3;                    // lit tops of the crowns
            if (y <= ridge + (left ? 0 : 1)) k = Math.min(3, k + 1);        // the skyline catches the light
            put(x, y, hzc((left ? WL : WR)[k], lv));
            continue;
          }
          if (y < yF) {
            const nr = LD.near[x] | 0, fr = LD.far[x] | 0;
            if (y >= nr) {
              // the far shore's low hills, wooded; lit on top
              const n = vnoise(x * 0.5 / G.Z, y * 0.8 / G.Z, 13);
              put(x, y, HIL[y === nr ? 4 : n > 0.66 ? 0 : n > 0.5 ? 1 : (LD.near[Math.min(w - 1, x + 2)] - LD.near[Math.max(0, x - 2)]) > 0 ? 2 : 3]);
            } else if (y >= fr) {
              // the far range: lit to the left of each summit's spine, mist low down
              const S = owner(x), lit = x < S.x + (y - S.y) * 0.3 + s(5) * (vnoise(y * 0.12 / G.Z, S.x, 19) - 0.5) + s(2) * Math.sin(y * 0.5 / G.Z), depth = (y - fr) / Math.max(1, yF - fr);
              let c = FAR[lit ? (y <= fr + 1 ? 3 : 2) : y <= fr ? 1 : 0];
              if (y > yF - s(9) + bv * s(4)) c = mix3(c, MIST, 0.45);
              else if (depth > 0.55 && bv < 0.25) c = FAR[lit ? 3 : 1];
              put(x, y, c);
            }
            continue;
          }
          // the valley floor and the town on it
          const X = CAM + (x + 0.5 - vx) / (tp * qq), lv = clamp(Math.floor(fl + (bv - 0.5) * 0.35), 0, 3);
          const sh = SHORE(X), c = cls(X, Y, sh), dark = c >= DECK && shaded(SH, X, Y);
          let col;
          if (c === LAKE) {
            const off = Y - sh, ripple = vnoise(X * 0.25, Y * 0.9, 17);
            let k = off < 0.9 + ripple * 0.8 ? 3 : qq > 0.43 + bv * 0.012 ? 0 : qq > 0.38 + bv * 0.01 ? 1 : qq > 0.335 + bv * 0.01 ? 2 : qq > 0.31 + bv * 0.008 ? 4 : 5;
            if (k < 4 && X < CAM - 4 && qq < 0.42 && vnoise(X * 0.06, Y * 0.45, 7) > 0.56 && bv < 0.75) k++; // the sun's path on the water, to the left
            col = hzc(hex3(C.lake[k]), Math.min(lv, 1));
            shoreY[x] = y; // (the last lake row in this column: the near shore)
          } else if (c === SAND) col = hz(C.sand[dark ? 0 : bv < 0.25 ? 2 : 1], lv);
          else if (c === CANAL) {
            const east = X >= 42 && Y >= 24;
            const k = east ? (X < 42.5 ? 0 : X > 44.2 && bv < 0.5 ? 2 : 1) : (Y < 21.5 ? 2 : Y > 23.1 ? 0 : 1);
            col = hz(C.canal[k], lv);
          } else if (c === CWALL) col = hz(C.wallS[Y > 23.8 ? 1 : 0], lv);
          else if (c === CWALLL) col = hz(C.wallL[X > 44.8 ? 1 : 0], lv);
          else if (c === DECK) {
            const across = X >= 42 && Y >= 24, f = across ? X * 2 : Y * 2, edge = across ? Y - 36 < 0.18 || Y - 36 > 1.82 : (X - 12) % 21 < 0.18 || (X - 12) % 21 > 1.82;
            col = hz(C.deck[edge ? 0 : f - Math.floor(f) < 0.3 ? 1 : dark ? 2 : 3], lv);
          } else if (c === PAVEC) {
            const joint = qq > 0.68 && Math.abs(Y - Math.round(Y / 2) * 2) < 0.06 / qq;
            col = hz(C.pave[dark ? 0 : joint ? 1 : vnoise(X * 0.6, Y * 0.6, 5) > 0.7 && bv < 0.5 ? 2 : 3], lv);
          } else if (c === PATH) col = hz(C.path[dark ? 0 : vnoise(X * 0.9, Y * 0.9, 6) > 0.62 ? 1 : 2], lv);
          else if (c === BED) {
            // the council's tidy beds: a dark strip of plants, flowers in a dotted row along it
            const mid = Y - Math.floor(Y) > 0.3 && Y - Math.floor(Y) < 0.7;
            col = hz(mid && (x & 1) === 0 ? C.bed[1 + ((x >> 1) & 1)] : C.bed[0], lv);
          } else {
            // lawn and meadow: soft blotches on the ground plane, the sun's shade where it falls
            const n = vnoise(X * (c === MEADOW ? 0.14 : 0.3), Y * (c === MEADOW ? 0.2 : 0.3), c === MEADOW ? 3 : 4);
            let k = n > 0.62 + 0.1 * bv ? 3 : n < 0.3 + 0.1 * bv ? 1 : 2;
            if (Y < 0) k = n > 0.5 + 0.1 * bv ? 3 : 2;                       // the slope below you, in the sun
            col = dark ? hzc(mix3(hex3(C.lawn[0]), SHADE, 0.2), lv) : hz((c === MEADOW ? C.meadow : C.lawn)[k], lv);
          }
          put(x, y, col);
        }
      }
      g.putImageData(img, 0, yTop);

      // what stands on the plan, far to near: the tower out in the lake, the groves, the houses, the lamp posts
      const T = tower(G);
      g.drawImage(T.cv, T.x, T.y);
      reflect(g, T);
      const objs = [];
      for (const b of HOUSES) objs.push({ y: b[1] + 0.5, b });
      for (const gr of trees().groves) objs.push({ y: gr.reduce((a, t) => a + t[1], 0) / gr.length, gr });
      for (const l of LAMPS) objs.push({ y: l[1] + 0.5, l });
      objs.sort((a, b) => b.y - a.y);
      const roofs = [], lit = [];
      for (const o of objs) {
        if (o.b) { const H = house(G, o.b); g.drawImage(H.cv, H.x, H.y); roofs.push(H); }
        else if (o.gr) groveDraw(g, G, o.gr);
        else {
          const [X, Y] = o.l, qq = G.q(Y + 0.5), x = Math.round(G.sx(X + 0.5, Y + 0.5)), y = Math.round(G.sy(Y + 0.5));
          const ph = Math.max(3, Math.round(1.7 * G.hv(Y + 0.5))), hs = G.tp * qq >= 5.5 ? 2 : 1;
          R(g, x, y - ph, 1, ph, IRON[1]);
          R(g, x - (hs > 1 ? 1 : 0), y, hs + (hs > 1 ? 1 : 0), 1, IRON[2]);  // the plinth
          R(g, x - (hs >> 1), y - ph - hs - 1, hs + 1, 1, IRON[0]);          // the cap
          R(g, x - (hs >> 1), y - ph - hs, hs + 1, hs, '#c8964a');           // the glass (lit live)
          const canal = Y === 20 || Y === 24;
          lit.push({ x, y: y - ph - hs, hs, r: Math.max(2, Math.round(G.tp * qq * 0.5)), base: y, canal, ry: canal ? Math.round(G.sy(Y === 24 ? 23.25 : 21.25)) : 0 });
        }
      }
      // where the lake can shimmer: open water, mostly toward the sun's path on the left
      const glints = [], rn = P.rnd(4242);
      for (let i = 0; i < 1200 && glints.length < 26; i++) {
        const y = Math.round(yF + 1 + rn() * (shoreY[G.x0 + (G.iw >> 1)] - yF - 1)), x = Math.round(G.x0 + rn() * G.iw);
        if (!(shoreY[x] > y + 2) || LD.inL(x, y) || LD.inRt(x, y)) continue;
        const qq = (y + 0.5 - yE) / AA, X = CAM + (x + 0.5 - vx) / (tp * qq), Y = (1 / qq - 1) / KD;
        if (cls(X, Y, SHORE(X)) !== LAKE || Y - SHORE(X) < 2) continue;
        if (Math.abs(x - T.cx) < T.W && y > T.top && y < T.base + T.W) continue;
        if (rn() > (x < vx ? 1 : 0.35)) continue;
        glints.push([x, y, 1 + Math.round(rn() * Math.max(1, s(3))), rn() * 6.28, 1400 + Math.round(rn() * 2600)]);
      }
      return { cv, lit, glints, tower: T, roofs: { n: roofs.length, top: Math.min(...roofs.map((H) => H.roofTop)), bottom: Math.max(...roofs.map((H) => H.base)) } };
    });
  }
  // A grove: crowns of varied size round their branches, lit on the upper left with dark pockets low on the right,
  // a trunk showing under the nearer ones; hazier the farther it stands; outlined as one mass.
  function groveDraw(g, G, gr) {
    const P = K(), mY = gr.reduce((a, t) => a + t[1], 0) / gr.length, qm = G.q(mY);
    const lv = clamp(Math.floor((0.88 - qm) * 5.2), 0, 3);
    const leaf = P.mat(null, { cols: LEAF.map((c2) => hexOf(mix3(hex3(c2), HAZE, HZV[lv]))), at: 2, lineCol: hexOf(mix3([16, 12, 26], HAZE, HZV[lv] * 0.8)) });
    const bark = P.mat(null, { cols: BARK, at: 2 });
    const cs = gr.map(([X, Y, sz]) => { const qq = G.q(Y), r = Math.max(1.5, 0.7 * sz * G.tp * qq), x = G.sx(X, Y), y = G.sy(Y); return { x, y, r, ry: r * 0.9, cy: y - Math.max(1, r * 0.5) - r * 0.68, Y }; });
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const c of cs) { x0 = Math.min(x0, c.x - c.r * 1.6); x1 = Math.max(x1, c.x + c.r * 1.6); y0 = Math.min(y0, c.cy - c.ry * 1.4); y1 = Math.max(y1, c.y + 2); }
    if (x1 < 0 || x0 > G.w || y0 > G.h) return;
    x0 = Math.floor(x0) - 2; y0 = Math.floor(y0) - 2; x1 = Math.ceil(x1) + 2; y1 = Math.ceil(y1) + 2;
    const L = P.layer(x1 - x0, y1 - y0, -x0, -y0);
    cs.sort((a, b) => a.Y > b.Y ? -1 : 1);
    for (const c of cs) {
      const { x, cy, r, ry, y } = c;
      if (r > 2.5) L.rect(Math.round(x) - (r > 4 ? 1 : 0), Math.round(cy + ry * 0.5), r > 4 ? 2 : 1, Math.max(1, Math.round(y - cy - ry * 0.5)), bark, 1);
      L.ell(x, cy, r, ry, leaf, P.sphere(x - r * 0.35, cy - ry * 0.4, r, ry, { amb: 0.12 }));
      if (r >= 2.5) {
        // a second mass of leaves up to the right, and a small lit cluster at the top left
        L.ell(x + r * 0.42, cy - ry * 0.32, r * 0.58, ry * 0.52, leaf, P.sphere(x + r * 0.2, cy - ry * 0.6, r * 0.58, ry * 0.52, { amb: 0.2 }));
        if (r >= 3.5) L.ell(x - r * 0.38, cy - ry * 0.45, r * 0.32, ry * 0.26, leaf, 4);
      }
    }
    L.outline();
    g.drawImage(L.canvas(), x0, y0);
  }

  // ---- the old tower --------------------------------------------------------------------------------------------
  // As the shore shows it (lf_sunktower, 12_tower.js): pale coursed stone, the dark arch with the green bell in it,
  // the indigo roof with its light eave band and the iron finial; only the belfry clears the water.
  function tower(G) {
    const P = K(), { s } = G, [X, Y] = TOWER, qq = G.q(Y);
    const W = Math.max(s(11), Math.round(G.tp * qq * 3.6)) | 1, cx = Math.round(G.sx(X, Y)), base = Math.round(G.sy(Y));
    const stoneH = Math.round(W * 1.05), roofH = Math.max(3, Math.round(W * 0.5)), fin = Math.max(2, Math.round(W * 0.18)), ov = Math.max(1, Math.round(W * 0.12));
    const top = base - stoneH - roofH - fin, Wc = W + ov * 2 + 4, Hc = stoneH + roofH + fin + 4;
    const x0 = cx - (Wc >> 1), y0 = top - 2;
    const L = P.layer(Wc, Hc, -x0, -y0), st = P.mat(null, { cols: STONE, at: 3 }), rf = P.mat(null, { cols: ROOF, at: 3, lineCol: '#120e22' });
    const l = cx - (W >> 1), r = l + W, ey = base - stoneH;
    // the stone, lit from the left, in courses
    L.rect(l, ey, W, stoneH, st, (x, y) => { const u = (x - l) / W; return ((u < 0.28 ? 4 : u < 0.7 ? 3 : 2) - (W >= 10 && Math.round(base - y) % 3 === 0 && y > ey + 1 ? 1 : 0) + 0.5) / 5; });
    // the arch: dark, round-headed; the bell in it, gone green
    const aw = Math.max(3, Math.round(W * 0.46)) | 1, ax = cx - (aw >> 1), atop = ey + Math.max(2, Math.round(W * 0.18)), abot = base - Math.max(1, Math.round(W * 0.2));
    L.fill(ax, atop, ax + aw, abot, (x, y) => x >= ax && x < ax + aw && y >= atop && y < abot && (y >= atop + aw / 2 || ((x - cx - 0.5) / (aw / 2)) ** 2 + ((y - atop - aw / 2) / (aw / 2)) ** 2 <= 1.05), P.solid('#141828'), 0);
    const bm = P.mat(null, { cols: PATINA, at: 2 }), bw = Math.max(1, Math.round(aw * 0.55)), bt = atop + Math.max(1, Math.round(aw * 0.4)), bb = abot - (abot - atop > 6 ? 1 : 0);
    L.fill(cx - bw / 2 - 0.5, bt, cx + bw / 2 + 0.5, bb, (x, y) => y >= bt && y < bb && Math.abs(x - cx - 0.5) <= (bw / 2) * (0.55 + 0.45 * (y - bt) / Math.max(1, bb - bt)) + 0.3, bm, (x) => (x < cx + 0.5 ? 0.9 : 0.4));
    // the roof: a pyramid, its left face lit, its eave a light band with a dark line under it
    L.poly([[l - ov, ey + 1], [cx + 0.5, ey - roofH], [r + ov, ey + 1]], rf, (x, y) => (x < cx + 0.5 ? (y > ey - 1 ? 5 : 4) : y > ey - 1 ? 3 : 1.6) / 6 + 0.01);
    L.rect(l - ov + 1, ey, W + ov * 2 - 2, 1, rf, 0);
    // the finial
    L.rect(cx, ey - roofH - fin + 1, 1, fin, P.mat(null, { cols: IRON, at: 3 }), 3);
    L.outline();
    return { cv: L.canvas(), x: x0, y: y0, cx, W, base, top: ey - roofH - fin + 1, eave: ey, arch: [atop, abot] };
  }
  // its broken reflection under it, and the wet line where it meets the water
  function reflect(g, T) {
    const cv = T.cv, n = Math.min(cv.height - 2, T.base - T.y);
    for (let i = 1; i < n; i++) {
      if (i % 3 === 2) continue;
      g.globalAlpha = 0.32 * (1 - i / n);
      g.drawImage(cv, 0, T.base - T.y - i, cv.width, 1, T.x + (i % 4 === 1 ? 1 : 0), T.base + Math.round(i * 0.7), cv.width, 1);
    }
    g.globalAlpha = 1;
    R(g, T.cx - (T.W >> 1), T.base, T.W, 1, '#2e4a78');
  }

  // ---- the pines that frame it ----------------------------------------------------------------------------------
  // Two Japanese pines at the road's edge, a trunk either side (the left one nearer and wider, both leaning a
  // little), their branches reaching in with flat pads of needles: across the top, and down the sides wherever they
  // cover no part of the town or the tower. In shade, the light along the pads' tops and the trunks' left edges.
  function frame(G) {
    return cached(key('lvframe', G), () => {
      const { w, h, vb, pw, canopy, s } = G, P = K(), L = P.layer(w, h), V = view(G);
      const ndl = P.mat(null, { cols: PINE, at: 3, lineCol: '#08100e' }), bark = P.mat(null, { cols: BARK, at: 2 });
      const tn = { x0: Math.min(G.sx(-1, 0), G.sx(-1, 41)) - s(4), x1: Math.max(G.sx(53, 0), G.sx(53, 41)) + s(4), y0: G.sy(41) - s(12), y1: G.sy(-1) };
      const tw = { x0: V.tower.cx - V.tower.W - s(6), x1: V.tower.cx + V.tower.W + s(6), y0: V.tower.top - s(8), y1: V.tower.base + s(6) };
      const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
      const clear = (bb) => !hit(bb, tn) && !hit(bb, tw);
      // a pad of needles: a low cloud, its top in rounded bumps and lit, its underside in tufts
      function pad(cx, cy, rx, ry, seed) {
        const rn = P.rnd(seed), nb = 2 + Math.floor(rn() * 2), nt = Math.max(3, Math.round(rx / Math.max(2, s(3)))), ph = rn() * 6, pt = rn() * 6;
        const topY = (u) => cy - ry * Math.sqrt(Math.max(0, 1 - u * u)) * (0.72 + 0.28 * Math.abs(Math.sin((u + 1) * nb * Math.PI * 0.5 + pt)));
        const botY = (u) => cy + ry * 0.38 * Math.sqrt(Math.max(0, 1 - u * u)) + ry * 0.5 * Math.max(0, Math.sin((u + 1) * nt * Math.PI * 0.5 + ph)) * (1 - Math.abs(u) * 0.5);
        L.fill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => { const u = (x - cx) / rx; return Math.abs(u) <= 1 && y >= topY(u) && y <= botY(u); }, ndl, (x, y) => {
          const u = (x - cx) / rx, dd = y - topY(u), H = Math.max(1, botY(u) - topY(u));
          let k = dd < 1 ? (u < 0.3 ? 5 : 4) : dd < 2.5 && u < -0.1 ? 4 : dd / H < 0.42 ? 3 : dd / H < 0.72 ? 2 : 1;
          if (k > 1 && k < 4 && vnoise(x * 0.55 / G.Z, y * 0.9 / G.Z, seed & 255) > 0.66) k--;
          return (k + 0.5) / 6;
        });
      }
      // a branch: from the trunk out to a pad, arched a little, thinning
      function branch(xa, ya, xb, yb, wa) {
        const n = Math.max(3, Math.round(Math.hypot(xb - xa, yb - ya) / Math.max(3, s(6))));
        let px = xa, py = ya;
        for (let i = 1; i <= n; i++) {
          const t = i / n, x = xa + (xb - xa) * t, y = ya + (yb - ya) * t - Math.sin(t * Math.PI) * Math.abs(xb - xa) * 0.08;
          L.seg(px, py, x, y, Math.max(1, wa * (1 - t * 0.7)), bark, t < 0.3 ? 2 : 1);
          px = x; py = y;
        }
      }
      // the trunks: bending a little and leaning in, bark in long plates, the light on their left edges
      const tx = (xc0, lean, seed, y) => xc0 + lean * Math.pow(1 - clamp(y / h, 0, 1), 1.6) + s(4) * Math.sin((y / Math.max(1, h)) * 4.2 + seed);
      const trunk = (xc0, wid, lean, seed) => L.fill(xc0 - wid - s(16), -2, xc0 + wid + s(16), h + 2, (x, y) => Math.abs(x - tx(xc0, lean, seed, y)) <= (wid / 2) * (0.8 + 0.2 * (y / h)), bark, (x, y) => {
        const u = (x - tx(xc0, lean, seed, y)) / ((wid / 2) * (0.8 + 0.2 * (y / h))), v = vnoise(x * 0.45 / G.Z, y * 0.06 / G.Z, seed * 3);
        let k = u < -0.6 ? 3 : u > 0.55 ? 0.5 : 2;
        if (v > 0.6) k -= 1.2; else if (v < 0.22 && u < 0.2) k += 0.8;
        return clamp((k + 0.5) / 5, 0, 0.999);
      });
      const wl = Math.round(pw * 1.05), wr = Math.round(pw * 0.8), xl0 = Math.round(pw * 0.3), xr0 = w - Math.round(pw * 0.32), ll = s(16), lr = -s(12);
      trunk(xl0, wl, ll, 1.3);
      trunk(xr0, wr, lr, 4.1);
      const edgeL = (y) => tx(xl0, ll, 1.3, y) + wl * 0.35, edgeR = (y) => tx(xr0, lr, 4.1, y) - wr * 0.35;
      // a cluster of pads on branches from a trunk: [out from the trunk (px), row, size]
      const th0 = Math.max(s(10), canopy * 0.75);
      const cluster = (dir, by, list, seed) => {
        const bx = dir > 0 ? edgeL(by) : edgeR(by);
        for (const [u, v, f] of list) branch(bx, by, bx + dir * u, v + th0 * f * 0.25, Math.max(1.5, th0 * 0.32));
        list.forEach(([u, v, f], i) => pad(bx + dir * u, v, th0 * 2.2 * f, th0 * 0.8 * f, seed * 13 + i));
      };
      // across the top: a mass of pads in either corner, thinning inward, sky between
      const RL = w * 0.3, RR = w * 0.24;
      cluster(1, th0 * 2.2, [[RL * 0.06, th0 * 0.05, 1.25], [RL * 0.34, th0 * 0.55, 1.05], [RL * 0.62, th0 * 1.0, 0.85], [RL * 0.88, th0 * 0.75, 0.66], [RL * 0.24, th0 * 1.75, 0.8]], 3);
      cluster(-1, th0 * 2.4, [[RR * 0.06, th0 * 0.15, 1.2], [RR * 0.4, th0 * 0.75, 0.95], [RR * 0.76, th0 * 1.15, 0.72], [RR * 0.26, th0 * 1.95, 0.72]], 4);
      // down the sides: a branch or two, as far as they leave the town and the tower clear
      const side = (dir, rows, lens, seed) => rows.forEach((f, i) => {
        const y = Math.round(vb * f), th = th0 * (0.8 - i * 0.08), bx = dir > 0 ? edgeL(y) : edgeR(y);
        let len = w * lens[i];
        const box = (L2) => ({ x0: dir > 0 ? bx : bx - L2 - th * 2, x1: dir > 0 ? bx + L2 + th * 2 : bx, y0: y - th * 1.6, y1: y + th });
        while (len > s(16) && !clear(box(len))) len -= s(4);
        if (len <= s(16)) return;
        const list = [[len * 0.92, y - th * 0.4, 0.8 * th / th0], [len * 0.48, y + th * 0.2, 0.62 * th / th0]];
        for (const [u, v, f2] of list) branch(bx, y + th * 0.5, bx + dir * u, v + th * 0.2, Math.max(1.5, th * 0.3));
        list.forEach(([u, v, f2], j) => pad(bx + dir * u, v, th0 * 2.2 * f2, th0 * 0.8 * f2, seed * 17 + i * 3 + j));
      });
      side(1, [0.3, 0.55, 0.8], [0.15, 0.12, 0.13], 5);
      side(-1, [0.26, 0.5, 0.76], [0.13, 0.1, 0.12], 6);
      L.outline();
      return L.canvas();
    });
  }

  // ---- live: the lamps, the lake ---------------------------------------------------------------------------------
  function lamps(c, V, t, still) {
    const P = K();
    for (let i = 0; i < V.lit.length; i++) {
      const L = V.lit[i], ph = i * 2.17 + (L.x % 7);
      const f = still ? 0.85 : 0.8 + 0.08 * Math.sin(t / 330 + ph) + 0.05 * Math.sin(t / 113 + ph * 1.7);
      P.halo(c, L.x, L.y + (L.hs >> 1), L.r, '255,196,110', 0.3 * f, 2);
      c.fillStyle = 'rgba(255,214,140,' + f.toFixed(2) + ')'; c.fillRect(L.x - (L.hs >> 1), L.y, L.hs + 1, L.hs);
      c.fillStyle = '#fff2c8'; c.fillRect(L.x, L.y, 1, 1);
      // on the canal below an embankment's lamp, its light broken on the water
      if (L.canal) { c.fillStyle = 'rgba(255,200,120,' + (0.45 * f).toFixed(2) + ')'; c.fillRect(L.x - (still ? 0 : Math.round(Math.sin(t / 700 + ph))), L.ry, Math.max(1, L.hs + 1), 1); }
    }
  }
  function shimmer(c, V, t, still) {
    for (const [x, y, len, ph, beat] of V.glints) {
      const k = still ? (ph > 3.9 ? 0.8 : 0) : Math.max(0, Math.sin(t / beat + ph));
      if (k < 0.5) continue;
      c.fillStyle = 'rgba(236,232,250,' + (0.18 + (k - 0.5) * 0.7).toFixed(2) + ')';
      c.fillRect(x + (still ? 0 : Math.round(Math.sin(t / (beat * 1.7) + ph))), y, len, 1);
    }
    // the water lapping at the tower: a light line at its foot that comes and goes
    const T = V.tower, k = still ? 0 : Math.floor(t / 900) % 2;
    c.fillStyle = 'rgba(224,232,248,0.55)'; c.fillRect(T.cx - (T.W >> 1) - 1 + k, T.base + 1 + k, T.W + 2 - k * 2, 1);
  }

  let last = null; // the size last drawn at (tests)
  RB.interlude.ART.lf_valley = {
    stages: ['valley'],
    draw(c, w, h, t, st) {
      const G = geom(w, h, st.vb), V = view(G);
      last = { w, h, vb: st.vb };
      c.drawImage(V.cv, 0, 0);
      shimmer(c, V, t, st.still);
      lamps(c, V, t, st.still);
      c.drawImage(frame(G), 0, 0);
    },
    // tests: where the things the lines name are, against the dialogue sheet's top (vb); by default at the size
    // last drawn
    probe(w, h, vb) {
      if (w == null) { if (!last) return null; ({ w, h, vb } = last); }
      const G = geom(w, h, vb), V = view(G), T = V.tower, L = V.lit, canal = L.filter((l) => l.canal);
      return {
        w, h, vb, yF: G.yF, yN: G.yN, roofs: V.roofs,
        lamps: { n: L.length, top: Math.min(...L.map((l) => l.y)), bottom: Math.max(...L.map((l) => l.base)) },
        canalLights: { n: canal.length, bottom: Math.max(...canal.map((l) => Math.max(l.base, l.ry))) },
        tower: { x: T.cx, w: T.W, top: T.top, base: T.base },
      };
    },
  };
})();
