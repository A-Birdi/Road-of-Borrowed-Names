/* The first sight of Kotonoha (Chapter 9, ko.first_sight; RBN-QA-073). On the first landing, by Tetsu's ferry
 * (ko.ferry_out) or in your own boat (sea.arrive_kotonoha), two lines describe the view ("Beyond the sand stands a
 * tree bigger than any you have seen…", "Leaves are falling like snow…") while the map is only the shore (ko.shore),
 * where no tree stands. So those two lines are shown over one picture of the view:
 *   view  from the end of the jetty where you land (ko.shore, row 22): its boards running away to the sand, the
 *         shallows either side, the pale sand with its drifts of leaves and the two old stone lanterns half-buried
 *         in it, the rocks at either end of the beach, the trees along its top with the path going up between them;
 *         beyond, the island rising to its crown, and on the crown the great tree, its limbs spread as if to hold the
 *         whole island; leaves drifting down over everything.
 * The tree is the one the travel volume draws on the crown behind the village (src/ui/43k_seq_ko.js, ko.end's
 * "stone": the trunk flaring into the hill with its bark lines, the crown of leaf masses lit on the upper left, in
 * its materials and under its sky and clouds), seen nearer and lower, so its limbs show under the crown; the leaves
 * coming down are that file's own (RB.seqKo.falling), with a few nearer ones turning as they come, in its garden
 * leaves' colours, a few faint dashes of ink on each (never a character). The shore is ko.shore's own plan and
 * colours (RB.tiles.PAL.kotonoha: sand, shallows, wood, stone, grass, leaf; the leaf gold and ink of
 * src/content/ko/02_art.js). No people, no village: only what the two lines name and the beach you stand on. What the
 * lines name is above the dialogue sheet (vb). Still layers per size; live: the leaves drifting down, glints on the
 * shallows. Reduced motion holds one picture. Drawn with RB.pxkit at art resolution in the prologue's manner
 * (41_prologue_art.js, 42c_interlude_lookout.js, 42d_interlude_valley.js); implemented provisionally under AC-1. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, bandsIn } = A.kit;
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
  const lerp = (a, b, k) => a + (b - a) * k;

  // ---- the colours ------------------------------------------------------------------------------------------------
  // The shore's from the region (RB.tiles.PAL.kotonoha, src/content/ko/01_region.js); the sky, its clouds, the hill
  // and the tree's trunk and leaves as ko.end's "stone" draws them (43k_seq_ko.js); the leaves' gold and ink as the
  // drifts on the shore are drawn (02_art.js GOLD, INKS).
  const KO = {
    grass: ['#7aa88a', '#8ab896', '#a0c8a6', '#5e8e70'], dirt: ['#bcae90', '#ccc0a2', '#a29476', '#dcd2b8'],
    stone: ['#a8b0b2', '#c2c8c8', '#868e92'], water: ['#3e8a8e', '#4a9a9c', '#6cb4b0', '#e0f2ee'],
    sand: ['#e2dac2', '#eee8d4', '#cac0a2'], wood: ['#8a7058', '#a2866a', '#6a5440', '#c0a482'],
    leaf: ['#3e6e52', '#4e8460', '#6aa078', '#2c5440'], sky: '#dcecea',
  };
  const PAL = () => Object.assign({}, KO, (RB.tiles && RB.tiles.PAL && RB.tiles.PAL.kotonoha) || {});
  const SKY = ['#6a8ec0', '#82a2cc', '#9cb6d8', '#b8cce4', '#d0dee8'];       // ko.end "stone"'s sky
  const CLOUD = { light: '#ffffff', mid: '#eef0f6', shade: '#c4cce0' };
  const HILL = '#5a7a46', TRUNK = '#6a5038', CROWN = '#4a7a3a';           // its hill, trunk and leaves
  const GOLD = ['#a8822e', '#d0a844', '#e8c868'], INK = '#2a2434';

  // ---- where everything is ----------------------------------------------------------------------------------------
  // The beach is ground seen from the end of the jetty (ko.shore: you at column 20, row 22; the water's edge at row
  // 20, the jetty's foot on the sand at row 18, the sand up to row 11, then grass and the trees along the top at row
  // 0): a row Z tiles ahead lies at hy + k / Z, a column X tiles across at cx + F·X / Z. The island and its tree are
  // composed above it, the tree a little right of the middle, its crown wide against the sky.
  function geom(w, h, vb) {
    const S = RB.seqKit.stage(w, h, vb), { s } = S, narrow = S.lay === 'narrow';
    vb = S.vb;
    const cx = Math.round(w / 2);
    const yWater = Math.round(vb * 0.91), ySand = Math.round(vb * 0.73);
    const k = (yWater - ySand) / (1 / 2.5 - 1 / 11.5), hy = ySand - k / 11.5;
    const F = w * (narrow ? 0.2 : 0.17);
    const gy = (Z) => hy + k / Z, gx = (X, Z) => cx + (F * X) / Z, Zof = (y) => k / Math.max(0.01, y - hy);
    const tx = Math.round(w * (narrow ? 0.53 : 0.55));
    const crest = Math.round(vb * (narrow ? 0.52 : 0.47));
    const cr = { x: tx, y: Math.round(vb * (narrow ? 0.26 : 0.27)), rx: Math.round(w * (narrow ? 0.52 : 0.4)), ry: Math.round(vb * (narrow ? 0.19 : 0.19)) };
    return Object.assign(S, { w, h, vb, narrow, cx, s, yWater, ySand, k, hy, F, gy, gx, Zof, tx, crest, cr });
  }
  // the island's skyline per column: up from its shoulders to the crown under the tree
  function skyline(G) {
    const { w, s, tx, crest, hy } = G, out = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      const u = x < tx ? (tx - x) / (w * 0.6) : (x - tx) / (w * 0.68);
      out[x] = Math.min(hy - s(3), crest + (hy - s(3) - crest) * Math.pow(Math.min(u, 1.3), 1.55) + s(2) * Math.sin(x / (w * 0.06) + 1) * Math.min(1, u * 3) + s(1) * Math.sin(x / (w * 0.021)));
    }
    return out;
  }

  // ---- the island: the hill, its groves and the path up, the trees along the top of the beach -------------------------
  function island(G, L) {
    const { w, s, hy, tx, crest } = G, p = K();
    const top = skyline(G);
    // the hill, a little hazed with distance: lit on its left, its terraces faint below the crown (as "stone" draws them)
    const hill = p.mat(p.hex(p.mix(HILL, '#c6d8dc', 0.18)), { n: 7, at: 3, step: 0.07 });
    L.fill(0, 0, w, Math.round(Math.max(hy + s(8), G.gy(22.5) + 2)), (x, y) => y >= top[x | 0], hill, (x, y) => {
      const d = y - top[x | 0], near = Math.abs(x - tx) < w * 0.22 && d > s(3);
      return clamp(0.56 - (x - tx) / w * 0.22 - d / Math.max(1, hy - crest) * 0.18 + (d < 1.5 ? 0.12 : 0) + (near && Math.round(d) % Math.max(4, s(6)) === 0 ? -0.12 : 0) + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999);
    });
    // the path up from the beach, winding over the hill toward the crown
    const dirt = p.mat(G.P.dirt[1], { n: 5, at: 2, step: 0.08 });
    const foot = [G.gx(0.5, 22), G.gy(22)], head = [tx - s(14), crest + s(5)];
    let px0 = foot[0], py0 = foot[1];
    for (let i = 1; i <= 24; i++) {
      const u = i / 24, x = lerp(foot[0], head[0], u) + Math.sin(u * 7.5 + 0.4) * w * 0.05 * (1 - u), y = lerp(foot[1], head[1], Math.pow(u, 0.8));
      L.seg(px0, py0, x, y, Math.max(1, s(3) * (1 - u * 0.75)), dirt, (xx) => (xx < x ? 0.75 : 0.5));
      px0 = x; py0 = y;
    }
    // groves on the slopes, clustered, hazier the higher they stand; none on the path or under the tree
    const grove = p.mat(p.hex(p.mix(G.P.leaf[1], '#c6d8dc', 0.2)), { n: 6, at: 3, step: 0.08 }), r = p.rnd(911);
    for (let i = 0; i < 16; i++) {
      const gx0 = r() * w, side = gx0 < tx ? -1 : 1;
      if (Math.abs(gx0 - tx) < w * 0.12) continue;
      const t0 = top[clamp(Math.round(gx0), 0, w - 1)], gy0 = lerp(t0 + s(4), hy - s(2), 0.2 + r() * 0.8);
      const n = 2 + Math.floor(r() * 4), rr = Math.max(2, s(2.5 + r() * 2.5) * (0.6 + (gy0 - crest) / Math.max(1, hy - crest) * 0.5));
      for (let j = 0; j < n; j++) {
        const x = gx0 + (j - n / 2) * rr * 1.4 + (r() - 0.5) * rr, y = gy0 + (r() - 0.5) * rr * 0.6;
        if (y < top[clamp(Math.round(x), 0, w - 1)] + rr) continue;
        L.ell(x, y, rr, rr * 0.8, grove, p.sphere(x - rr * 0.35 * -side, y - rr * 0.4, rr, rr * 0.8, { amb: 0.2 }));
      }
    }
    // the trees along the top of the beach (ko.shore's ragged first rows), the path's gap between them
    const woods = p.mat(G.P.leaf[1], { n: 7, at: 3, step: 0.08 }), bark = p.mat(G.P.trunk ? G.P.trunk[0] : '#6a5a4a', { n: 4, at: 2 }), rw = p.rnd(917);
    const Zw = 22.5, base = G.gy(Zw), tile = G.F / Zw;
    for (let X = -60; X < 60; X += 0.9 + rw() * 0.7) {
      if (X > -1.2 && X < 2.2) continue; // the path
      const x = G.gx(X, Zw - rw() * 1.5), y = base + rw() * tile * 0.6;
      if (x < -tile * 3 || x > w + tile * 3) continue;
      const rr = Math.max(2, tile * (0.75 + rw() * 0.55)), ht = tile * (1.1 + rw() * 0.8);
      L.rect(Math.round(x) - 1, Math.round(y - ht * 0.5), Math.max(1, Math.round(tile * 0.25)), Math.round(ht * 0.5), bark, 1);
      L.ell(x, y - ht * 0.5 - rr * 0.6, rr, rr * 0.85, woods, p.sphere(x - rr * 0.4, y - ht * 0.5 - rr, rr, rr * 0.85, { amb: 0.14 }));
    }
    return top;
  }

  // ---- the great tree ---------------------------------------------------------------------------------------------
  // "stone"'s tree (43k_seq_ko.js): its trunk flaring into the hill (the same flare and bark lines), its crown of leaf
  // masses round the branches lit on the upper left (SP.crown's way, in the same leaf material), seen nearer: the
  // trunk forks low into limbs that reach out under the crown to its far ends, which hang lower than its middle, so it
  // holds the island like spread arms. The masses gather in clusters on the limbs with sky between them, their
  // undersides in shade, dark pockets inside, a few lit clumps on top.
  // Clusters: [x (× rx), y (× ry), half-width (× rx), half-height (× ry), masses, seed]
  const CLUSTERS = [
    [-0.96, 0.6, 0.12, 0.22, 7, 31], [0.98, 0.64, 0.11, 0.2, 7, 32],          // the far ends, hanging low
    [-0.74, 0.28, 0.2, 0.36, 12, 33], [0.76, 0.31, 0.19, 0.34, 12, 34],       // out along the long limbs
    [-0.5, -0.1, 0.24, 0.44, 14, 35], [0.52, -0.06, 0.23, 0.42, 14, 36],
    [0, -0.3, 0.3, 0.5, 18, 41],                                                // the dome: its middle, behind
    [-0.25, -0.52, 0.25, 0.44, 15, 37], [0.27, -0.5, 0.25, 0.44, 15, 38],     // its shoulders and its top
    [0.01, -0.72, 0.22, 0.36, 14, 11],
    [-0.13, 0.1, 0.17, 0.28, 9, 39], [0.19, 0.14, 0.16, 0.26, 9, 40],          // low over the fork
  ];
  // the limbs: from the fork to [x, y] (× rx, × ry) through a bend, their width at the fork (× the trunk's half-width)
  const LIMBS = [
    [[-0.44, -0.06], [-0.96, 0.58], 0.9], [[0.46, -0.02], [0.98, 0.62], 0.85],
    [[-0.3, -0.02], [-0.5, -0.08], 0.7], [[0.3, 0.0], [0.52, -0.04], 0.7],
    [[-0.12, -0.2], [-0.24, -0.48], 0.6], [[0.14, -0.2], [0.26, -0.45], 0.6], [[0.02, -0.3], [0.01, -0.66], 0.5],
  ];
  // smooth value noise (the leaf clumps keep their size)
  const hashf = (x, y, k) => (K().hh(x | 0, y | 0, k || 0) % 1000) / 1000;
  function vnoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hashf(xi, yi, seed), b = hashf(xi + 1, yi, seed), c = hashf(xi, yi + 1, seed), d = hashf(xi + 1, yi + 1, seed);
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  }
  // a leaf mass's light: SP.crown's (the cluster's and the mass's own roundness, lit on the upper left) with the whole
  // crown's, a shaded underside, and clumps of leaves (lit ones on the mass's upper half)
  function massShade(G, cx, cy, rw, rh, mx, my, r, seed) {
    const p = K(), C = G.cr, ry = r * 0.8;
    return (x, y) => {
      const lit = ((C.x - x) / C.rx) * 0.08 + ((cx - x) / rw + (cy - y) / rh) * 0.16 + ((mx - x) / r * 0.6 + (my - y) / ry) * 0.18;
      const under = y > cy + rh * 0.12 ? -((y - cy - rh * 0.12) / (rh * 0.36)) * 0.24 : 0;
      const nz = vnoise(x / G.s(4.5), y / G.s(3.5), seed);
      const clump = nz > 0.64 && y < my ? 0.1 : nz < 0.3 ? -0.07 : 0;
      return clamp(0.47 + lit + under + clump + (p.bayer(x, y) - 0.5) * 0.05, 0.02, 0.999);
    };
  }
  const massIn = (mx, my, r, floor) => (x, y) => y <= floor && ((x - mx) / r) ** 2 + ((y - my) / (r * 0.8)) ** 2 <= 1;
  // a cluster of leaf masses (SP.crown's placing, smaller masses), with its dark inside
  function cluster(L, G, cx, cy, rw, rh, M, n, seed) {
    const p = K(), rnd = p.rnd(seed), out = [];
    L.ell(cx, cy + rh * 0.1, rw * 0.6, rh * 0.32, M, 0.16); // the dark inside
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      out.push([cx + Math.cos(a) * r * rw * 0.74, cy + Math.sin(a) * r * rh * 0.56 - rh * 0.06, rw * (0.2 + rnd() * rnd() * 0.3)]);
    }
    out.sort((a, b) => a[1] - b[1]);
    // (the lowest masses cut a little flatter underneath, each at its own height, so the underside is level-ish but scalloped)
    for (const [mx, my, r] of out) { const floor = my + r * (0.45 + rnd() * 0.3); L.fill(mx - r, my - r, mx + r, floor, massIn(mx, my, r, floor), M, massShade(G, cx, cy, rw, rh, mx, my, r, seed)); }
  }
  // a limb: thick segments along its points, lit along its upper side, in the crown's shade
  function limb(L, pts, M) {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by, wd] = pts[i], dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, sg = Math.abs(dx) > 0.3 * len ? Math.sign(dx) : 1;
      L.seg(ax, ay, bx, by, wd, M, (x, y) => {
        const up = (((x - ax) * dy - (y - ay) * dx) / len) * sg / Math.max(1, wd / 2); // -1 underside … 1 upper side
        return clamp(0.36 + up * 0.16 + (((Math.round(x * 0.7) * 5 + Math.round(y * 0.7) * 3) % 9) === 0 ? -0.08 : 0), 0.02, 0.999);
      });
    }
  }
  function tree(G) {
    const { s, tx, crest, cr, w, h } = G, p = K(), SP = RB.seqPaint;
    const L = SP.layer(w, h);
    const trunk = p.mat(TRUNK, { n: 7, at: 3, step: 0.08 }), leafM = p.mat(CROWN, { n: 7, at: 3, step: 0.08 });
    const hw = s(G.narrow ? 9 : 10), base = crest + s(3), fork = Math.round(cr.y + cr.ry * 0.5);
    const bark = (x) => (((Math.round(x * 0.7) * 5) % 7) === 0 ? -0.12 : 0); // "stone"'s bark lines
    // the limbs, in the crown's shade: from the fork out through a bend, thinning
    for (const [[bx, by], [ex, ey], wk] of LIMBS) {
      const x0 = tx + Math.sign(bx || 1) * hw * 0.3, x1 = tx + bx * cr.rx, y1 = cr.y + by * cr.ry, x2 = tx + ex * cr.rx, y2 = cr.y + ey * cr.ry + s(2);
      const pts = [];
      for (let j = 0; j <= 12; j++) {
        const u = j / 12, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
        pts.push([a * x0 + b * x1 + c * x2, a * fork + b * y1 + c * y2, Math.max(1.5, hw * 1.5 * wk * (1 - u * 0.8))]);
      }
      limb(L, pts, trunk);
    }
    // the trunk: flaring into the hill (the flare and bark lines as "stone" draws them), roots out over the crown
    const fl = s(20), q = s(9);
    L.fill(tx - hw * 5, fork - s(2), tx + hw * 5, base, (x, y) => Math.abs(x - tx) < hw + Math.max(0, y - base + fl) ** 2 / q, trunk,
      (x, y) => clamp(Math.min(0.66, 0.54 - (x - tx + hw) / (hw * 2.4) * 0.42) + bark(x) - (y < fork + s(10) ? 0.1 * (1 - (y - fork) / s(10)) : 0), 0.02, 0.999));
    for (const d of [-1, 1]) for (const [len, dy] of [[s(30), s(1)], [s(18), s(3)]]) {
      L.path([[tx + d * hw * 1.5, base - s(4), s(6)], [tx + d * (hw * 1.5 + len * 0.6), base - s(1), s(4)], [tx + d * (hw * 1.5 + len), base + dy, s(2)]], s(4), trunk, d < 0 ? 0.5 : 0.3);
    }
    // the crown, cluster by cluster: out from the far ends to the dome, the low ones over the fork last (nearest)
    for (const [lx, ly, rw, rh, n, seed] of CLUSTERS) cluster(L, G, tx + lx * cr.rx, cr.y + ly * cr.ry, rw * cr.rx, rh * cr.ry, leafM, n, seed);
    L.outline();
    // the crown's extent (its leaves), for the layout and the tests
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (L.mt[y * w + x] === leafM.id) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { cv: L.canvas(), crown: { top: y0, bottom: y1, left: x0, right: x1 }, trunk: { x: tx, top: fork, base, w: hw * 2 }, leafM };
  }

  // ---- the beach: the grass at its top, the rocks at its ends, the sand, the stone lanterns, the drifts of leaves ----
  function beach(G, L) {
    const { w, s, gx, gy, Zof, ySand, yWater, F } = G, p = K(), P = G.P;
    // the grass between the trees and the sand, the path across it
    const grass = p.mat(P.grass[0], { n: 6, at: 3, step: 0.08 }), dirt = p.mat(P.dirt[1], { n: 5, at: 2, step: 0.08 });
    const y0 = Math.round(gy(22.5));
    L.fill(0, y0, w, ySand + 1, (x, y) => y >= y0 && y <= ySand, grass, (x, y) => clamp(0.5 + (y - y0) / Math.max(1, ySand - y0) * 0.1 + (p.bayer(x, y) - 0.5) * 0.12, 0.02, 0.999));
    L.fill(0, y0, w, ySand + 1, (x, y) => { const Z = Zof(y + 0.5); return Math.abs((x - G.cx) * Z / F - 0.5) < 1 + (p.bayer(x, y) - 0.5) * 0.3; }, dirt, 0.6);
    // the sand: pale, the wind's ripples across it in perspective, damp and darker toward the water's edge
    const sand = p.mat(P.sand[0], { n: 6, at: 3, step: 0.06 });
    L.fill(0, ySand, w, yWater, (x, y) => y >= ySand && y < yWater, sand, (x, y) => {
      const Z = Zof(y + 0.5), X = (x - G.cx) * Z / F, v = Z * 1.25 + 0.4 * Math.sin(X * 0.45 + Z * 0.3);
      const ripple = Z < 9 && v - Math.floor(v) < Math.min(0.3, (1.25 * Z * Z) / G.k) ? -0.1 : 0; // a pixel's line, near to far
      const damp = Z < 3.1 ? -0.16 - (Z < 2.75 ? 0.1 : 0) : 0;
      return clamp(0.62 + ripple + damp + (p.bayer(x, y) - 0.5) * 0.05, 0.02, 0.999);
    });
    // the rocks at either end of the beach (the map's outcrops), weathered stone in a few blocks
    const stone = p.mat(P.stone[0], { n: 6, at: 3, step: 0.08 });
    for (const [X, Z, n, seed] of [[-18.5, 15, 3, 3], [-16, 18.5, 2, 4], [15.5, 14, 3, 5], [17, 18, 3, 6]]) {
      const rs = p.rnd(seed), x = gx(X, Z), y = gy(Z), t = F / Z;
      for (let i = 0; i < n; i++) {
        const bx = x + (i - n / 2) * t * 0.9 + (rs() - 0.5) * t * 0.4, bw = t * (0.7 + rs() * 0.5), bh = t * (0.8 + rs() * 0.9), by = y + (rs() - 0.3) * t * 0.4;
        L.stone([[bx - bw / 2, by], [bx - bw * 0.45, by - bh * 0.6], [bx - bw * 0.1, by - bh], [bx + bw * 0.35, by - bh * 0.8], [bx + bw / 2, by]], stone, { face: 3, bevel: Math.max(1, Math.round(t * 0.12)), seam: true });
      }
    }
    // the two old stone lanterns half-buried in the sand (dark: nobody has lit them yet)
    const lant = p.mat(P.stone[2], { n: 6, at: 3, step: 0.08 }), hole = p.solid('#2a2a2e');
    for (const [X, Z] of [[-13.5, 10.5], [13.5, 6.5]]) {
      const x = gx(X, Z), y = gy(Z), t = F / Z, bw = t * 0.6, bh = t * 0.55, cw = t * 0.95;
      L.rect(Math.round(x - bw / 2), Math.round(y - bh), Math.round(bw), Math.round(bh), lant, (xx) => (xx < x - bw * 0.15 ? 0.7 : 0.4));
      L.rect(Math.round(x - bw * 0.2), Math.round(y - bh * 0.75), Math.max(1, Math.round(bw * 0.4)), Math.max(1, Math.round(bh * 0.35)), hole, 0);
      L.poly([[x - cw / 2, y - bh], [x - cw * 0.3, y - bh - t * 0.22], [x + cw * 0.3, y - bh - t * 0.22], [x + cw / 2, y - bh]], lant, (xx) => (xx < x ? 0.8 : 0.5));
      L.ell(x, y, t * 0.6, Math.max(1, t * 0.12), sand, 0.4); // the sand heaped round it
    }
    return { y0 };
  }

  // ---- the shallows and the jetty ---------------------------------------------------------------------------------
  function shore(G, L) {
    const { w, h, s, gx, gy, Zof, yWater, F } = G, p = K(), P = G.P, SP = RB.seqPaint;
    const water = p.mat(P.water[1], { n: 7, at: 3, step: 0.07 });
    SP.water(L, 0, yWater, w, h, water, { band: Math.max(2, s(3)), deep: -0.2, seed: 19, lit: (x, y) => (y - yWater < 2 ? 0.25 : 0) });
    // the foam along the water's edge, broken
    const foam = p.solid(P.water[3]);
    for (let x = 0; x < w; x++) if (Math.sin(x * 0.21) + Math.sin(x * 0.07 + 1) > -0.9) L.rect(x, yWater, 1, 1, foam, 0);
    // the jetty: three tiles wide, from under you to its foot on the sand (row 18); boards across it, a beam along each
    // side, posts down into the water; its shade on the water to the right (the light is on the upper left)
    const wood = p.mat(P.wood[1], { n: 7, at: 3, step: 0.07 }), dark = p.mat(P.water[0], { n: 4, at: 1, step: 0.06 });
    const Zf = 4.5, yF = Math.round(gy(Zf));
    L.fill(0, yWater, w, h, (x, y) => { const Z = Zof(y + 0.5), X = (x - G.cx) * Z / F; return X > 1.5 && X < 1.62; }, dark, 0.3);
    const tones = [], rt = p.rnd(29);
    for (let i = 0; i < 64; i++) tones.push((rt() - 0.5) * 0.14);
    L.fill(0, yF, w, h, (x, y) => { const Z = Zof(y + 0.5), X = (x - G.cx) * Z / F; return Math.abs(X) <= 1.5; }, wood, (x, y) => {
      const Z = Zof(y + 0.5), X = (x - G.cx) * Z / F, b = Math.floor(Z / 0.34), joint = Math.floor(Zof(y - 0.5) / 0.34) !== b;
      if (Math.abs(X) > 1.32) return X < 0 ? 0.72 : 0.3;            // the side beams: lit on the left
      return clamp(0.58 + tones[b & 63] + (joint ? -0.3 : 0) + (((Math.round(X * 9) + b * 3) % 11) === 0 ? -0.08 : 0), 0.02, 0.999);
    });
    for (const Z of [1.5, 2.5, 3.5]) for (const X of [-1.62, 1.62]) {
      const x = gx(X, Z), y = gy(Z), t = F / Z, pw = Math.max(2, Math.round(t * 0.16)), ph = Math.round(t * 0.35);
      L.rect(Math.round(x - pw / 2), Math.round(y - ph), pw, ph + Math.round(t * 0.3), wood, (xx) => (xx < x ? 0.6 : 0.25));
    }
    return { yF };
  }

  // ---- the leaves on the sand (gold, a stroke of ink on the larger ones) -------------------------------------------
  function drifts(g, G) {
    const { gx, gy, F } = G, rd = K().rnd(53);
    // ko.shore's drifts of leaves (its ko_leaves): [column, row], each two tiles wide
    for (const [mx, my] of [[5, 17], [12, 19], [30, 15], [9, 14], [25, 18], [16, 12], [28, 12]]) {
      const Z = 22.5 - my - 0.5, X0 = mx - 20.5;
      for (let i = 0; i < 7; i++) {
        const X = X0 + rd() * 2, Zi = Z + (rd() - 0.5) * 0.6, x = Math.round(gx(X, Zi)), y = Math.round(gy(Zi)), t = F / Zi;
        const lw = Math.max(1, Math.round(t * 0.22)), lh = Math.max(1, Math.round(t * 0.1));
        R(g, x, y, lw, lh, GOLD[1 + (i % 2)]);
        if (lh > 1) R(g, x, y + lh - 1, lw, 1, GOLD[0]);
        if (lw >= 4) R(g, x + Math.round(lw * 0.3), y, Math.max(1, Math.round(lw * 0.3)), 1, INK);
      }
    }
  }

  // ---- the whole view, still ----------------------------------------------------------------------------------------
  function view(G) {
    return cached(key('kofirst', G), () => {
      const { w, h, s, hy } = G, p = K(), SP = RB.seqPaint;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      // the sky and its clouds, as "stone" has them, paling to the island's own sky low down
      bandsIn(g, 0, 0, w, Math.round(hy + s(10)), SKY.concat([G.P.sky]), 0.45);
      SP.clouds(g, w, { n: 4, seed: 73, y0: s(10), y1: G.vb * 0.3, scale: G.Z, light: CLOUD.light, mid: CLOUD.mid, shade: CLOUD.shade });
      const LI = SP.layer(w, h);
      island(G, LI);
      LI.outline();
      g.drawImage(LI.canvas(), 0, 0);
      const T = tree(G);
      g.drawImage(T.cv, 0, 0);
      const LB = SP.layer(w, h);
      const B = beach(G, LB);
      LB.outline();
      g.drawImage(LB.canvas(), 0, 0);
      drifts(g, G);
      const LS = SP.layer(w, h);
      const S2 = shore(G, LS);
      LS.outline();
      g.drawImage(LS.canvas(), 0, 0);
      // where the shallows can glint: open water either side of the jetty, above the sheet
      const glints = [], rn = p.rnd(4747);
      for (let i = 0; i < 400 && glints.length < 22; i++) {
        const y = Math.round(G.yWater + 2 + rn() * (Math.max(G.yWater + 3, G.vb) - G.yWater - 2)), x = Math.round(rn() * w);
        const Z = G.Zof(y + 0.5), X = (x - G.cx) * Z / G.F;
        if (Math.abs(X) < 2.1) continue;
        glints.push([x, y, 1 + Math.round(rn() * Math.max(1, s(2))), rn() * 6.28, 1100 + Math.round(rn() * 1600)]);
      }
      return { cv, crown: T.crown, trunk: T.trunk, glints, sand: { top: G.ySand, water: G.yWater, grass: B.y0 }, jetty: { top: S2.yF } };
    });
  }

  // ---- live: the leaves coming down, the glints on the shallows ----------------------------------------------------------
  // A nearer leaf, turning as it comes down: a camphor leaf, pointed at both ends, in the garden leaves' colours
  // (43k_seq_ko.js leaf()), its midrib, and on one half a few faint dashes of ink (writing, never a character);
  // edge-on, a sliver. len: its length (px), ang: its angle, open: 0 (edge-on) … 1 (flat to us).
  const NEAR = [['#c8d8a0', '#e8f0c0', '#a0b07a'], ['#d8c890', '#f0e4b8', '#b0a070'], ['#b8d0a8', '#dcecc8', '#94ac84']];
  function nearLeaf(c, x, y, len, ang, open, tint, seed) {
    const col = NEAR[tint % 3], ca = Math.cos(ang), sa = Math.sin(ang), hl = len / 2, hw = Math.max(0.5, len * 0.21 * open), bx = Math.ceil(hl) + 1;
    for (let j = -bx; j <= bx; j++) for (let i = -bx; i <= bx; i++) {
      const u = i * ca + j * sa, v = -i * sa + j * ca;
      if (Math.abs(u) > hl) continue;
      const half = hw * Math.pow(1 - (u / hl) ** 2, 0.75);
      if (Math.abs(v) > half + 0.25) continue;
      let k = v < -0.25 ? col[1] : col[0];
      if (Math.abs(v) <= 0.5 && hw > 1.2) k = col[2];
      else if (hw >= 1.8 && v > 0.9 && v < half - 0.3 && Math.abs(u) < hl * 0.62 && ((Math.round(u + seed) % 4) + 4) % 4 < 2) k = '#5a4a44';
      c.fillStyle = k;
      c.fillRect(x + i, y + j, 1, 1);
    }
  }
  function nearLeaves(c, G, t, still) {
    const rnd = K().rnd(61), n = G.narrow ? 6 : 8;
    for (let i = 0; i < n; i++) {
      const x0 = rnd() * G.w, sp = 0.5 + rnd() * 0.5, ph = rnd(), tint = Math.floor(rnd() * 3), len = Math.max(6, G.s(7 + rnd() * 4)), period = 16000 / sp, spin = 0.6 + rnd() * 0.8;
      const u = still ? ph : ((t / period) + ph) % 1;
      const x = Math.round(x0 + Math.sin(u * 5 + i) * G.s(16)), y = Math.round(lerp(-G.s(14), G.vb - len * 0.5, u));
      nearLeaf(c, x, y, len, 0.6 + Math.sin(u * 7 * spin + i) * 0.9, Math.abs(Math.cos(u * 11 * spin + i)), tint, i * 7 + 3);
    }
  }
  // The nearest leaves (RBN-QA-073 refine; Agnes 6321061529, Local CL-121): a few large ones coming down past you, so
  // the island's written leaves read as leaves at play size. A camphor leaf's shape in the drifts' gold (GOLD), lit on
  // one half, with a darker rim, midrib and stalk, and across each half short strokes of ink in rows, as writing looks
  // from a step away (never a character). They come down in front of the hill, the beach and the water: below the
  // crown and clear of the trunk and its roots, so the tree is never covered; each one grows as it comes nearer and
  // passes behind the dialogue sheet (nothing is drawn below vb). Reduced motion holds them where they are, flat
  // enough to read; on a phone, whose picture is drawn nearer 1:1, they are a quarter larger. drawn: each one's box this
  // frame (for the tests).
  let drawn = [];
  function goldLeaf(c, x, y, len, ang, open, seed, floor) {
    const ca = Math.cos(ang), sa = Math.sin(ang), hl = len / 2, hw = Math.max(0.5, len * 0.3 * open), bx = Math.ceil(hl) + 3;
    const hh = (k, side) => K().hh(seed, k, side + 5) % 5;
    let box = null;
    for (let j = -bx; j <= bx; j++) for (let i = -bx; i <= bx; i++) {
      const px = x + i, py = y + j;
      if (py >= floor) continue;
      const u = i * ca + j * sa, v = -i * sa + j * ca;
      let k = null;
      if (u < -hl && u >= -hl - Math.max(1.5, len * 0.12) && Math.abs(v) <= 0.6) k = GOLD[0]; // the stalk
      else if (Math.abs(u) <= hl) {
        const half = hw * Math.pow(1 - (u / hl) ** 2, 0.7);
        if (Math.abs(v) > half + 0.3) continue;
        k = v < 0 ? GOLD[2] : GOLD[1];
        if (Math.abs(v) > half - 0.7 || Math.abs(v) <= 0.5) k = GOLD[0]; // the rim and the midrib
        else if (half >= 2.2) {
          // the writing: across each half, at a few stations along the leaf, a short stroke (some left out)
          const st = Math.round((u + hl) / Math.max(2.5, len * 0.14)), at = (u + hl) - st * Math.max(2.5, len * 0.14), side = v < 0 ? 0 : 1;
          if (Math.abs(at) < 0.55 && st >= 1 && (u + hl) < len * 0.86 && Math.abs(v) > half * 0.28 && Math.abs(v) < half * 0.78 && hh(st, side) !== 0) k = INK;
        }
      }
      if (!k) continue;
      c.fillStyle = k;
      c.fillRect(px, py, 1, 1);
      if (!box) box = [px, py, px, py];
      else { if (px < box[0]) box[0] = px; if (py < box[1]) box[1] = py; if (px > box[2]) box[2] = px; if (py > box[3]) box[3] = py; }
    }
    return box;
  }
  // what the leaves keep clear of: the crown's extent, and the trunk with its flare and roots down to the hill
  const keepClear = (G, V) => {
    const rh = V.trunk.w * 0.75 + G.s(34);
    return { crown: [V.crown.left, V.crown.top, V.crown.right, V.crown.bottom], trunk: [V.trunk.x - rh, V.trunk.top, V.trunk.x + rh, V.trunk.base + G.s(4)] };
  };
  // (Their time is the picture's own, since it was shown: as it opens they are where the still picture has them, spread
  // down the view and full-size, so they read from its first frame; then they come on down and round again. Local
  // CL-129: on the page's clock a picture could open with most of them still coming into view.)
  function goldLeaves(c, G, V, since, still) {
    const rnd = K().rnd(83), n = G.narrow ? 4 : 5, KC = keepClear(G, V), sway = G.s(12), out = [];
    for (let i = 0; i < n; i++) {
      const len = Math.round(G.s(17 + rnd() * 7) * (G.narrow ? 1.25 : 1)), period = 12000 + rnd() * 5000, ph = rnd(), spin = 0.5 + rnd() * 0.6, lane = rnd();
      // its lane across the picture (spread, one to each part of it); in the trunk's column it starts below the roots
      const x0 = ((i + 0.2 + lane * 0.6) / n) * G.w, reach = sway + len * 0.7;
      const inTrunk = x0 + reach > KC.trunk[0] && x0 - reach < KC.trunk[2];
      const top = (inTrunk ? KC.trunk[3] : KC.crown[3] + G.s(2)) + len * 0.7, bottom = G.vb + len;
      const u0 = 0.18 + 0.55 * ((i * 0.618 + ph * 0.3) % 1), u = still ? u0 : (u0 + since / period) % 1;
      const grow = Math.min(1, u / 0.14), size = len * grow * grow * (3 - 2 * grow);
      if (size < 4) continue;
      const x = Math.round(x0 + Math.sin(u * 4.5 + i * 1.7) * sway), y = Math.round(lerp(top, bottom, u));
      const open = still ? 0.92 : 0.5 + 0.5 * Math.abs(Math.cos(u * 9 * spin + i));
      const box = goldLeaf(c, x, y, size, 0.5 + Math.sin(u * 5 * spin + i * 2.3) * 0.7, open, i * 13 + 5, G.vb);
      if (box) out.push({ box, len: size });
    }
    drawn = out;
  }
  function live(c, G, V, t, still, since) {
    // the glints on the shallows
    for (const [x, y, len, ph, beat] of V.glints) {
      const k = still ? (ph > 3.9 ? 0.8 : 0) : Math.max(0, Math.sin(t / beat + ph));
      if (k < 0.55) continue;
      c.fillStyle = 'rgba(240,250,248,' + (0.35 + (k - 0.55) * 1.2).toFixed(2) + ')';
      c.fillRect(x, y, len, 1);
    }
    // the leaves coming down over everything (43k_seq_ko.js's falling leaves), and the nearer ones
    const KO2 = RB.seqKo;
    KO2.falling(c, G, t, still, G.narrow ? 60 : 80, 7, 'tree');
    KO2.falling(c, G, t * 0.85 + 4000, still, G.narrow ? 34 : 44, 19, 'tree');
    nearLeaves(c, G, t, still);
    goldLeaves(c, G, V, since || 0, still);
  }

  let last = null; // the size last drawn at (tests)
  const geomP = (w, h, vb) => Object.assign(geom(w, h, vb), { P: PAL() });
  RB.interlude.ART.ko_first_sight = {
    stages: ['view'],
    draw(c, w, h, t, st) {
      const G = geomP(w, h, st.vb), V = view(G);
      last = { w, h, vb: st.vb };
      c.drawImage(V.cv, 0, 0);
      live(c, G, V, st.still ? 0 : t, st.still, st.since);
    },
    // tests: where the things the lines name are, against the dialogue sheet's top (vb); by default at the size last
    // drawn. The leaves come down from above the picture to vb at the lowest (43k_seq_ko.js falling, and the nearer ones);
    // gold: the large gold ones in the last frame drawn (their boxes) and what they keep clear of.
    probe(w, h, vb) {
      if (w == null) { if (!last) return null; ({ w, h, vb } = last); }
      const G = geomP(w, h, vb), V = view(G);
      return { w, h, vb: G.vb, crown: V.crown, trunk: V.trunk, sand: V.sand, jetty: V.jetty, leaves: { n: (G.narrow ? 60 + 34 + 6 : 80 + 44 + 8), bottom: G.vb + 1 },
        gold: { n: G.narrow ? 4 : 5, now: drawn.map((d) => ({ box: d.box.slice(), len: d.len })), clear: keepClear(G, V) } };
    },
  };
})();
