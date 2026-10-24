/* After the story: the travel volume's pages for the old guardians, the Hall of a Hundred Tales and Ashihara Shinden's
 * first festival (expansion P16; F-120, F-133, F-135, F-136; AC-1). These sequences are pages of the volume through
 * their records' entries (guardians/50_records.js, hall/40_records.js, settle/40_records.js: `seq` and `scene`), so
 * each is defined with page: false here and keeps its record's special rules (revealable before, witnessed when done).
 *
 * gd.<key> — an old guardian settled (`gd.<key>`, src/content/guardians/40_scenes.js, on the line that finds what it
 *   left): its place in the quiet after, the keepsake lying there in the light, the presence withdrawing.
 *   won     rw the mill's millstones and the floury cap · sg the filing chest's open top drawer and the spectacles ·
 *           co the embers at the back of the kiln and the fire-coloured scarf · sb the dome's floor under the open slit
 *           and the two star-chip earrings · lf the Drowned Bell over its water and the little bronze bell · mb the
 *           first bridge's oldest pile and the indigo headband round its foot · cr the summit cairn over the sea of cloud
 *           and the white cape · yn the Kettle's pool and the steam-coloured hood · ko the ledger among the roots and the
 *           green leaf on the newest shelf
 * hall.w<n> — a tale of the Hall told (`hall.w<n>.end`, from its first line to the light folding back into the Hall):
 *   tale    the tale as a picture scroll in ink and wash on paper, with one colour of its own, inking itself in; a red
 *           seal in the corner (a shape, never a letter)
 * as.festival — the village's first festival night (`as.festival`).
 *   night   the lanterns along the street, the canal or up the slope to the pine, as the village chose
 *   fire    everyone round the fire, dancing; the drum on a cooking pot
 * No letters, kana or kanji are drawn anywhere. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const sub = (k, a, b) => clamp((k - a) / (b - a), 0, 1);
  const look = (id) => (RB.content.chars[id] || {}).look || {};

  // ==== the old guardians ========================================================================================
  // Each place is built as a small set seen through one camera (SP.cam: metres, the floor or water Y = 0, the camera
  // at (0, ch, 0) looking along +Z), or as a painted landscape where a set would not help. Two pxkit layers: the place
  // (no outline: architecture keeps its own edges) and the things in it (outlined); then the light that falls into
  // the place, a framing foreground in shadow, and a dithered fall-off toward the frame's edges that keeps the eye on
  // the keepsake. Live: the motes in the light, the keepsake catching it, and the presence thinning away upward.
  const T = (en, jp) => ({ en, jp });
  const dz = (x, y, a) => (P().bayer(Math.round(x), Math.round(y)) - 0.5) * a;
  const frac = (v) => v - Math.floor(v);
  const hash = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const cl = (v) => clamp(v, 0.02, 0.999);
  // boards along a coordinate: a dark joint, a lit edge after it, each board a tone of its own
  const boards = (a, wd) => { const u = a / wd, f = frac(u); return (f < 0.07 ? -0.2 : f < 0.14 ? 0.06 : 0) + (hash(Math.floor(u)) - 0.5) * 0.1; };
  function camOf(G, o) {
    return SP.cam(G.w, G.vb, { F: Math.min(0.9, (2.5 * G.vb) / G.w) * (o.f || 1), hy: G.narrow && o.hyN != null ? o.hyN : o.hy, ch: o.ch, cx: o.cx == null ? 0.5 : o.cx, near: 0.3 });
  }
  // A room from inside: floor, ceiling, side walls and back wall, each shaded from its own world coordinates.
  // o: { W, D, H, floor: [M, (X, Z, x, y)], ceil: [M, (X, Z, x, y)], left / right: [M, (Z, Y, x, y)], back: [M, (X, Y, x, y)] }
  function room(L, C, o) {
    const hw = o.W / 2, D = o.D, H = o.H, n = 0.31, F = C.F, cx = C.cx, hy = C.hy, ch = C.ch;
    const onFloor = (x, y) => { const Z = (F * ch) / Math.max(0.01, y - hy); return [((x - cx) * Z) / F, Z]; };
    const onCeil = (x, y) => { const Z = (F * (H - ch)) / Math.max(0.01, hy - y); return [((x - cx) * Z) / F, Z]; };
    const onSide = (X, x, y) => { const Z = (F * X) / ((x - cx) || 0.01); return [Z, ch - ((y - hy) * Z) / F]; };
    const onBack = (x, y) => [((x - cx) * D) / F, ch - ((y - hy) * D) / F];
    const sh = (f, map) => (x, y) => cl(f(...map(x, y), x, y));
    if (o.ceil) C.poly(L, [[-hw, H, n], [hw, H, n], [hw, H, D], [-hw, H, D]], o.ceil[0], sh(o.ceil[1], onCeil));
    if (o.floor) C.poly(L, [[-hw, 0, n], [hw, 0, n], [hw, 0, D], [-hw, 0, D]], o.floor[0], sh(o.floor[1], onFloor));
    if (o.left) C.poly(L, [[-hw, 0, n], [-hw, 0, D], [-hw, H, D], [-hw, H, n]], o.left[0], sh(o.left[1], (x, y) => onSide(-hw, x, y)));
    if (o.right) C.poly(L, [[hw, 0, n], [hw, 0, D], [hw, H, D], [hw, H, n]], o.right[0], sh(o.right[1], (x, y) => onSide(hw, x, y)));
    if (o.back) C.poly(L, [[-hw, 0, D], [hw, 0, D], [hw, H, D], [-hw, H, D]], o.back[0], sh(o.back[1], onBack));
    return { onFloor, onBack, onSide, onCeil, D };
  }
  // An upright drum (a millstone, a pile, a pier) at (X, Z) from Y0 to Y1: the side shaded as a cylinder lit from the
  // left, the top an ellipse (o.top: a shade, or (x, y, T) → shade; false for none). Returns the top on screen.
  function drum(L, C, X, Z, r, Y0, Y1, M, o) {
    o = o || {};
    const t = C.p(X, Y1, Z), rx = r * t[2];
    const yf = (Y) => [C.p(X, Y, Z + r)[1], C.p(X, Y, Z - r)[1]];
    const [tf, tn] = yf(Y1), [bf, bn] = yf(Y0);
    const T0 = { x: t[0], y: (tf + tn) / 2, rx, ry: Math.max(1, (tn - tf) / 2) }, cyB = (bf + bn) / 2, ryB = Math.max(1, (bn - bf) / 2);
    const side = P().cyl(t[0], rx, { amb: o.amb == null ? 0.22 : o.amb, rim: o.rim || 0 });
    L.fill(t[0] - rx - 1, T0.y, t[0] + rx + 1, cyB + ryB + 1, (x, y) => { const u = (x - t[0]) / rx; if (Math.abs(u) > 1) return false; return y >= T0.y && y <= cyB + ryB * Math.sqrt(1 - u * u); }, M, (x, y) => cl(side(x, y) * (o.k == null ? 1 : o.k) + (o.side ? o.side(x, y, T0) : 0)));
    if (o.top !== false) L.ell(T0.x, T0.y, rx, T0.ry, M, (x, y) => cl(typeof o.top === 'function' ? o.top(x, y, T0) : (o.top == null ? 0.7 : o.top) + dz(x, y, 0.06)));
    return Object.assign(T0, { by: cyB + ryB });
  }
  // the convex hull of screen points (for a shaft of light from a window's corners to where they land)
  function hull(pts) {
    const s = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of s) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of s.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  // a shaft of light: an opening's corners carried along dir until they meet Y = 0 (or the given plane), filled faintly
  // twice (the whole beam, then its core) so it reads as air with light in it, not as a shape
  function shaft(g, C, corners, dir, rgb, a, floorY) {
    const fy = floorY || 0, pts = [];
    for (const [X, Y, Z] of corners) { const k = (Y - fy) / -dir[1]; pts.push(C.p(X, Y, Z).slice(0, 2), C.p(X + dir[0] * k, fy, Z + dir[2] * k).slice(0, 2)); }
    const H = hull(pts);
    const fill = (poly, al) => { g.fillStyle = 'rgba(' + rgb + ',' + al + ')'; g.beginPath(); poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
    fill(H, a);
    const mx = H.reduce((s, p) => s + p[0], 0) / H.length, my = H.reduce((s, p) => s + p[1], 0) / H.length;
    fill(H.map(([x, y]) => [mx + (x - mx) * 0.55, my + (y - my) * 0.8]), a * 0.8);
    return H;
  }
  // the light falling off toward the frame's edges round the keepsake, in three dithered steps (baked into the place)
  function vignette(g, w, h, fx, fy, rx, ry, a, rgb) {
    const img = g.getImageData(0, 0, w, h), d = img.data, p = P(), col = rgb || [8, 6, 12];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const e = Math.hypot((x - fx) / rx, (y - fy) / ry), l = Math.max(0, Math.min(3, Math.floor((e - 0.6) * 3 + (p.bayer(x, y) - 0.5) * 0.9)));
      if (!l) continue;
      const o = (y * w + x) * 4, k = (a * l) / 3;
      d[o] = d[o] * (1 - k) + col[0] * k; d[o + 1] = d[o + 1] * (1 - k) + col[1] * k; d[o + 2] = d[o + 2] * (1 - k) + col[2] * k;
    }
    g.putImageData(img, 0, 0);
  }
  // dust turning slowly in a shaft (points inside the hull)
  function dust(c, H, t, still, n, seed, rgb) {
    if (!H || H.length < 3) return;
    const rnd = P().rnd(seed || 13), xs = H.map((q) => q[0]), ys = H.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const inside = (x, y) => { let k = false; for (let i = 0, j = H.length - 1; i < H.length; j = i++) { const [xi, yi] = H[i], [xj, yj] = H[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) k = !k; } return k; };
    for (let i = 0; i < n; i++) {
      const ph = rnd(), sp = 9000 + rnd() * 9000, u = (rnd() + (still ? 0 : t / sp)) % 1, v = (rnd() + (still ? 0 : Math.sin(t / sp * 6 + ph * 6) * 0.03)) % 1;
      const x = x0 + u * (x1 - x0), y = y0 + v * (y1 - y0);
      if (!inside(x, y)) continue;
      const a = still ? 0.5 : 0.25 + 0.4 * Math.abs(Math.sin(t / 900 + ph * 9));
      c.fillStyle = 'rgba(' + (rgb || '255,240,210') + ',' + a.toFixed(2) + ')';
      c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  // The guardian withdrawing: its shape as a cloud of pale motes that lifts and thins as k goes 0 → 1 (still: half
  // gone). Forms in units of the height: x −0.5..0.5, y 0 (its foot) .. 1 (its top).
  const FORMS = {
    figure: (x, y) => (y > 0.76 ? x * x + ((y - 0.87) / 1.1) ** 2 < 0.0108 : Math.abs(x) < (y > 0.68 ? 0.17 - (y - 0.68) * 0.9 : 0.15 + (0.68 - y) * 0.28)),
    flame: (x, y) => Math.abs(x) < 0.34 * Math.sin(Math.PI * Math.pow(1 - y, 1.5)) * (1 - y * 0.2) + Math.sin(y * 19) * 0.03,
    star: (x, y) => Math.sqrt(Math.abs(x) * 1.6) + Math.sqrt(Math.abs(y - 0.5) * 1.6) < 0.9,
    ox: (x, y) => ((x / 0.3) ** 2 + ((y - 0.42) / 0.34) ** 2 < 1 && y > 0.12) || (y > 0.62 && y < 0.95 && [-1, 1].some((s) => Math.abs(x - s * (0.2 + (y - 0.62) * 0.9 - (y - 0.62) ** 2 * 2.2)) < 0.045 - (y - 0.62) * 0.08)) || (y > 0.52 && y < 0.62 && Math.abs(x) < 0.42 && Math.abs(x) > 0.22),
    kettle: (x, y) => (x / 0.44) ** 2 + ((y - 0.34) / 0.32) ** 2 < 1 || ((x / 0.22) ** 2 + ((y - 0.68) / 0.06) ** 2 < 1) || x * x + (y - 0.78) ** 2 < 0.003 || (x > 0.36 && x < 0.58 && Math.abs(y - (0.38 + (x - 0.36) * 1.1)) < 0.05),
  };
  function presence(c, x, y, ht, k, rgb, form, t, still, seed) {
    const pts = Q.small('gd.pres|' + form + '|' + (seed || 9), () => {
      const rnd = P().rnd(seed || 9), out = [], f = FORMS[form] || FORMS.figure;
      for (let i = 0; i < 40000 && out.length < 520; i++) { const u = rnd() - 0.5, v = rnd(); if (f(u, v)) out.push([u, v, rnd(), rnd()]); }
      return out;
    });
    const e = ease(k), a0 = 1 - e;
    // once it has gone, a few last motes still drift up out of the picture
    if (!still && e > 0.5) for (let i = 0; i < 18; i++) { const r = pts[(i * 29) % pts.length], u = (t / (5200 + r[2] * 3000) + r[3]) % 1; c.fillStyle = 'rgba(' + rgb + ',' + (0.4 * (1 - u) * (e - 0.5) * 2).toFixed(2) + ')'; c.fillRect(Math.round(x + r[0] * ht * 1.4 + Math.sin(u * 7 + i) * 2), Math.round(y - ht * (0.6 + r[1] * 0.5) - u * ht * 0.8), 1, 1); }
    if (a0 <= 0.02) return;
    SP.glow(c, Math.round(x), Math.round(y - ht * (0.5 + e * 0.3)), Math.round(ht * 0.5), rgb, 0.2 * a0);
    for (const [u, v, r1, r2] of pts) {
      const lift = e * ht * (0.2 + r1 * 0.7) * (0.4 + v), sway = still ? 0 : Math.sin(t / 800 + r2 * 9) * 0.8;
      const xx = x + u * ht * (1 + e * 0.5) + sway, yy = y - v * ht - lift;
      if (r1 < e * 0.6) continue; // the first to go are gone
      const a = a0 * (0.4 + r2 * 0.5) * (still ? 1 : 0.8 + 0.2 * Math.sin(t / 300 + r1 * 20));
      c.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(2) + ')';
      c.fillRect(Math.round(xx), Math.round(yy), r2 > 0.86 ? 2 : 1, r2 > 0.86 ? 2 : 1);
    }
  }
  // a framing foreground in shadow: a post (x from the left or right edge) or a beam across the top, with a thin lit edge
  function framePost(g, x, wd, y0, y1, col, lit) { R(g, x, y0, wd, y1 - y0, col); if (lit) R(g, x + wd - 1, y0, 1, y1 - y0, lit); }
  function frameBeam(g, w, y, ht, col, lit) { R(g, 0, y, w, ht, col); if (lit) R(g, 0, y + ht - 1, w, 1, lit); }

  // ---- the nine places -------------------------------------------------------------------------------------------
  // build(G, C, g, p) paints the static picture onto g and returns { keep: [x, y, r], pres: [x, y, ht], shaft, extra };
  // live(c, G, I, t, st) draws what moves (optional)
  const GUARD = {
    // the mill: the stones in the light from the high window, the great wheel on the wall behind, the hopper hanging
    // over them; the cap between the stones, white with flour
    rw: { title: T('The Founder\'s Voice', '{初代|しょだい} の {声|こえ}'), tint: '244,234,208', form: 'figure', seed: 3,
      cam: { ch: 2.3, hy: 0.06, hyN: 0.3, f: 0.78 },
      build(G, C, g, p) {
        const wood = p.mat('#6e5238', { n: 8, at: 4, step: 0.07 }), floorM = p.mat('#86704e', { n: 8, at: 4, step: 0.07 }), beam = p.mat('#40302a', { n: 6, at: 3, step: 0.08 }),
          stone = p.mat('#9a9284', { n: 8, at: 4, step: 0.06 }), paper = p.mat('#f6ecd0', { n: 4, at: 2, step: 0.05 }), flour = p.mat('#ece4d0', { n: 4, at: 2, step: 0.04 }),
          sack = p.mat('#a08a64', { n: 6, at: 3, step: 0.08 }), cap = p.mat('#eee8da', { n: 6, at: 3, step: 0.05 }), patch = p.mat('#b8a888', { n: 4, at: 2 }), rope = p.mat('#8a7450', { n: 3, at: 1 });
        const SX = 0.35, SZ = 6.2, D = 9;
        const pool = (X, Z) => ease(clamp(1 - Math.hypot((X - SX + 0.2) / 1.7, (Z - SZ + 0.3) / 1.5), 0, 1));
        const Lr = SP.layer(G.w, G.h), Lo = SP.layer(G.w, G.h);
        const geo = room(Lr, C, { W: 7.4, D, H: 4.2,
          floor: [floorM, (X, Z, x, y) => 0.26 + boards(X, 0.34) + pool(X, Z) * 0.44 - Math.max(0, Z - 6.5) * 0.03 + dz(x, y, 0.06)],
          ceil: [beam, (X, Z, x, y) => 0.22 + (frac(Z / 1.6) < 0.2 ? 0.24 : 0) + boards(X, 0.4) * 0.5 + dz(x, y, 0.05)],
          left: [wood, (Z, Y, x, y) => 0.2 + boards(Y, 0.3) + Z * 0.02 + dz(x, y, 0.06)],
          right: [wood, (Z, Y, x, y) => 0.15 + boards(Y, 0.3) + Z * 0.015 + dz(x, y, 0.06)],
          back: [wood, (X, Y, x, y) => 0.34 + boards(X, 0.26) - Math.abs(X - 0.5) * 0.03 + (Y < 0.25 ? -0.12 : 0) + dz(x, y, 0.06)] });
        // the window high on the back wall: paper over a lattice, bright
        const wx0 = -2.7, wx1 = -1.5, wy0 = 2.3, wy1 = 3.4;
        C.poly(Lr, [[wx0, wy0, D], [wx1, wy0, D], [wx1, wy1, D], [wx0, wy1, D]], paper, (x, y) => { const [X, Y] = geo.onBack(x, y); return frac((X - wx0) / 0.3) < 0.14 || frac((Y - wy0) / 0.275) < 0.14 ? 0.3 : 0.92; });
        // the great wheel on the back wall: rim and cogs, six spokes, the hub
        const wc = C.p(2.1, 1.9, D - 0.05), wr = 1.25 * wc[2];
        Lr.fill(wc[0] - wr - 4, wc[1] - wr - 4, wc[0] + wr + 4, wc[1] + wr + 4, (x, y) => { const d = Math.hypot(x - wc[0], y - wc[1]); return (d <= wr && d >= wr * 0.8) || (d > wr && d < wr + Math.max(2, wr * 0.08) && frac((Math.atan2(y - wc[1], x - wc[0]) / (Math.PI * 2)) * 28) < 0.45); }, beam, (x, y) => cl(0.5 - ((y - wc[1]) / wr) * 0.2 - ((x - wc[0]) / wr) * 0.1 + dz(x, y, 0.06)));
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; Lr.seg(wc[0], wc[1], wc[0] + Math.cos(a) * wr * 0.82, wc[1] + Math.sin(a) * wr * 0.82, Math.max(2, wr * 0.1), beam, 0.42); }
        Lr.ell(wc[0], wc[1], wr * 0.17, wr * 0.17, beam, p.sphere(wc[0] - wr * 0.06, wc[1] - wr * 0.06, wr * 0.17, wr * 0.17, { amb: 0.3 }));
        // flour spilled round the stones, thicker close to them
        Lr.fill(0, Math.ceil(C.hy) + 1, G.w, G.h, (x, y) => { const [X, Z] = geo.onFloor(x, y); if (Z > D) return false; const d = Math.hypot(X - SX, Z - SZ); return d < 1.45 && hash(x * 31.7 + y * 17.3) < (1.45 - d) * 0.8; }, flour, 0.55);
        // sacks against the right wall, in shadow
        for (const [X, Z, r] of [[2.9, 4.6, 0.42], [3.1, 5.4, 0.38], [2.8, 5.1, 0.34]]) { const q = C.p(X, r * 0.9, Z), rr = r * q[2]; Lo.ell(q[0], q[1], rr, rr * 1.05, sack, p.sphere(q[0] - rr * 0.4, q[1] - rr * 0.5, rr, rr * 1.05, { amb: 0.18, k: 0.75 })); Lo.ell(q[0], q[1] - rr * 0.95, rr * 0.3, rr * 0.18, sack, 0.35); }
        // the stones: the bed stone, the runner on it with its eye, furrows dressed into its face
        const bed = drum(Lo, C, SX, SZ, 0.8, 0, 0.32, stone, { amb: 0.28, top: (x, y) => 0.62 + dz(x, y, 0.08) });
        const run = drum(Lo, C, SX, SZ, 0.7, 0.34, 0.6, stone, { amb: 0.28, top: (x, y, T0) => { const a = Math.atan2((y - T0.y) / T0.ry, (x - T0.x) / T0.rx); return 0.7 - ((x - T0.x) / T0.rx) * 0.12 + (frac((a / (Math.PI * 2)) * 14) < 0.16 ? -0.16 : 0) + dz(x, y, 0.06); } });
        Lo.ell(run.x, run.y, Math.max(2, run.rx * 0.16), Math.max(1, run.ry * 0.16), p.mat('#2a2622', { n: 3, at: 1 }), 0.3);
        // the hopper above the eye, a wooden funnel hung from the ceiling on ropes, its chute down to the eye
        const hz = SZ, hx = SX, ht0 = 1.95, hb = 1.3, a0 = 0.46, b0 = 0.14;
        for (const [ax, az] of [[-a0, -a0], [a0, -a0]]) C.seg(Lo, [hx + ax, ht0, hz + az], [hx + ax * 0.8, 4.2, hz + az * 0.8], 0.025, rope, 0.5);
        C.poly(Lo, [[hx - a0, ht0, hz - a0], [hx - a0, ht0, hz + a0], [hx - b0, hb, hz + b0], [hx - b0, hb, hz - b0]], wood, (x, y) => cl(0.38 + boards(y, 3) * 0.4));
        C.poly(Lo, [[hx - a0, ht0, hz - a0], [hx + a0, ht0, hz - a0], [hx + b0, hb, hz - b0], [hx - b0, hb, hz - b0]], wood, (x, y) => cl(0.55 + boards(x, 3) * 0.4 + dz(x, y, 0.05)));
        C.poly(Lo, [[hx - a0, ht0, hz - a0], [hx + a0, ht0, hz - a0], [hx + a0, ht0, hz + a0], [hx - a0, ht0, hz + a0]], beam, 0.2);
        C.seg(Lo, [hx, hb, hz], [hx + 0.05, 0.62, hz - 0.05], 0.09, wood, 0.45);
        // the cap, between the stones on the bed stone's rim, catching the light
        const cq = C.p(SX + 0.42, 0.33, SZ - 0.62), cr = 0.2 * cq[2];
        Lo.ell(cq[0], cq[1], cr * 1.3, cr * 0.4, cap, 0.5);
        Lo.fill(cq[0] - cr, cq[1] - cr * 0.95, cq[0] + cr, cq[1], (x, y) => ((x - cq[0]) / cr) ** 2 + ((y - cq[1]) / (cr * 0.95)) ** 2 <= 1, cap, p.sphere(cq[0] - cr * 0.4, cq[1] - cr * 0.6, cr, cr * 0.95, { amb: 0.4 }));
        Lo.rect(Math.round(cq[0] + cr * 0.2), Math.round(cq[1] - cr * 0.55), Math.max(2, Math.round(cr * 0.45)), Math.max(2, Math.round(cr * 0.35)), patch, 1);
        Lo.outline();
        g.drawImage(Lr.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        // the window's light down onto the stones
        const dir = [0.42, -1, -0.62];
        const H = shaft(g, C, [[wx0, wy0, D - 0.01], [wx1, wy0, D - 0.01], [wx0, wy1, D - 0.01], [wx1, wy1, D - 0.01]], dir, '255,236,196', 0.06);
        // the foreground: a post of the mill's frame on the left, the near beam across the top
        framePost(g, 0, Math.round(G.w * 0.07), 0, G.h, '#1c1612', '#4a3a2c');
        frameBeam(g, G.w, 0, Math.max(3, Math.round(G.vb * 0.05)), '#1a1410', '#3e3024');
        vignette(g, G.w, G.h, cq[0], cq[1] - G.vb * 0.15, G.w * 0.62, G.vb * 0.75, 0.6);
        return { keep: [cq[0], cq[1] - cr * 0.4, cr * 2.4], pres: [run.x, run.y, 1.9 * run.rx / 0.7], shaft: H };
      } },

    // the Head Office's archive: drawers to the ceiling behind, ledgers along the walls; the chest's top drawer pulled
    // out into the window's light, the spectacles and their tag on the papers in it
    sg: { title: T('The Head Office', '{本局|ほんきょく}'), tint: '226,234,244', form: 'figure', seed: 5,
      cam: { ch: 2.0, hy: 0.1, hyN: 0.3, f: 0.8 },
      build(G, C, g, p) {
        const wood = p.mat('#5a3e2a', { n: 8, at: 4, step: 0.07 }), floorM = p.mat('#6e5a44', { n: 8, at: 4, step: 0.07 }), wall = p.mat('#8a8072', { n: 7, at: 3, step: 0.06 }),
          drawer = p.mat('#7a5a3c', { n: 8, at: 4, step: 0.06 }), iron = p.mat('#2a2826', { n: 4, at: 2 }), paperM = p.mat('#ece2c8', { n: 5, at: 3, step: 0.05 }), glassM = p.mat('#c8b070', { n: 3, at: 1 }),
          spine = [p.mat('#6a3a2a', { n: 5, at: 2 }), p.mat('#3a4a5a', { n: 5, at: 2 }), p.mat('#5a5a3a', { n: 5, at: 2 }), p.mat('#7a6a4a', { n: 5, at: 2 })];
        const D = 8, Lr = SP.layer(G.w, G.h), Lo = SP.layer(G.w, G.h), CX = 0.25, CZ = 4.6, cw = 0.75, chh = 1.25, cd = 0.3;
        const pool = (X, Z) => ease(clamp(1 - Math.hypot((X - CX) / 1.5, (Z - CZ + 0.8) / 1.2), 0, 1));
        const shelves = (Z, Y, x, y, base) => { if (Y > 2.45) return base + 0.1 + dz(x, y, 0.05); const sy = frac(Y / 0.5); if (sy < 0.06) return base + 0.32; const i = Math.floor(Z / 0.1), top = 0.55 + hash(i * 3.1) * 0.3; return sy > top ? base - 0.12 : base + 0.12 + (frac(Z / 0.1) < 0.15 ? -0.15 : 0) + (hash(i) - 0.5) * 0.24 + dz(x, y, 0.05); };
        const geo = room(Lr, C, { W: 6.6, D, H: 3.8,
          floor: [floorM, (X, Z, x, y) => 0.24 + boards(X, 0.3) + pool(X, Z) * 0.42 - Math.max(0, Z - 6) * 0.03 + dz(x, y, 0.06)],
          ceil: [wood, (X, Z, x, y) => 0.12 + (frac(Z / 1.4) < 0.2 ? 0.2 : 0) + dz(x, y, 0.05)],
          left: [wood, (Z, Y, x, y) => shelves(Z, Y, x, y, 0.3 + Math.min(0.2, Math.max(0, 1 - Math.abs(Z - 3.6)) * 0.25))],
          right: [wood, (Z, Y, x, y) => shelves(Z, Y, x, y, 0.16)],
          back: [drawer, (X, Y, x, y) => { const fx = frac(X / 0.36), fy = frac(Y / 0.26); if (fx < 0.08 || fy < 0.1) return 0.12; const pull = Math.abs(fx - 0.54) < 0.07 && Math.abs(fy - 0.58) < 0.12; return pull ? 0.05 : 0.38 + (hash(Math.floor(X / 0.36) * 13 + Math.floor(Y / 0.26) * 7) - 0.5) * 0.14 + (fy > 0.86 ? 0.12 : 0) + dz(x, y, 0.05); }] });
        // the high window on the left wall
        const hw = 3.3, wz0 = 2.8, wz1 = 4.3, wy0 = 2.6, wy1 = 3.4;
        C.poly(Lr, [[-hw + 0.01, wy0, wz0], [-hw + 0.01, wy0, wz1], [-hw + 0.01, wy1, wz1], [-hw + 0.01, wy1, wz0]], paperM, (x, y) => { const [Z, Y] = geo.onSide(-hw, x, y); return frac((Z - wz0) / 0.375) < 0.12 || frac((Y - wy0) / 0.27) < 0.12 ? 0.25 : 0.95; });
        // a ladder against the drawers
        for (const X of [-1.9, -1.5]) C.seg(Lr, [X, 0, D - 0.7], [X + 0.15, 3.5, D - 0.05], 0.06, wood, 0.6);
        for (let i = 1; i < 11; i++) { const u = i / 11; C.seg(Lr, [-1.9 + 0.15 * u, 3.5 * u, D - 0.7 + 0.65 * u], [-1.5 + 0.15 * u, 3.5 * u, D - 0.7 + 0.65 * u], 0.04, wood, 0.5); }
        // the chest: its top, its left side, its front of drawers (the top one's slot empty)
        const x0 = CX - cw, x1 = CX + cw, zf = CZ - cd, zb = CZ + cd;
        C.poly(Lo, [[x0, chh, zf], [x1, chh, zf], [x1, chh, zb], [x0, chh, zb]], wood, (x, y) => cl(0.6 + boards(x * 0.6, 3) * 0.3 + dz(x, y, 0.05)));
        C.poly(Lo, [[x0, 0, zf], [x0, 0, zb], [x0, chh, zb], [x0, chh, zf]], wood, (x, y) => cl(0.3 + dz(x, y, 0.05)));
        const front = C.p(x0, chh, zf), fr = C.p(x1, 0, zf), u = front[2];
        C.poly(Lo, [[x0, 0, zf], [x1, 0, zf], [x1, chh, zf], [x0, chh, zf]], drawer, (x, y) => { const Y = chh - (y - front[1]) / u, X = x0 + (x - front[0]) / u; const r = Math.floor(Y / (chh / 4)), fy = frac(Y / (chh / 4)); if (r === 3 && fy > 0.06 && fy < 0.94 && X > x0 + 0.05 && X < x1 - 0.05) return 0.06; if (fy < 0.06 || X < x0 + 0.05 || X > x1 - 0.05) return 0.2; const ring = Math.hypot(X - CX, (fy - 0.5) * (chh / 4)) ; return ring < 0.05 && ring > 0.03 ? 0.08 : 0.5 + (hash(r) - 0.5) * 0.1 + (fy > 0.85 ? 0.12 : 0) + dz(x, y, 0.05); });
        for (const X of [x0, x1 - 0.12]) for (const Y of [0, chh - 0.12]) C.poly(Lo, [[X, Y, zf - 0.005], [X + 0.12, Y, zf - 0.005], [X + 0.12, Y + 0.12, zf - 0.005], [X, Y + 0.12, zf - 0.005]], iron, 1);
        void fr;
        // the top drawer, pulled out: its inside (papers), its left side, its front with its ring
        const dy0 = chh * 0.75 + 0.03, dy1 = chh - 0.03, dz0 = zf - 0.42, dx0 = x0 + 0.06, dx1 = x1 - 0.06;
        C.poly(Lo, [[dx0, dy0 + 0.02, dz0], [dx1, dy0 + 0.02, dz0], [dx1, dy0 + 0.02, zf], [dx0, dy0 + 0.02, zf]], drawer, 0.18);
        C.poly(Lo, [[dx0 + 0.06, dy0 + 0.05, dz0 + 0.04], [dx1 - 0.1, dy0 + 0.05, dz0 + 0.04], [dx1 - 0.1, dy0 + 0.05, zf], [dx0 + 0.06, dy0 + 0.05, zf]], paperM, (x, y) => cl(0.75 - frac(y / 3) * 0.1 + dz(x, y, 0.04)));
        C.poly(Lo, [[dx0, dy0, dz0], [dx0, dy0, zf], [dx0, dy1, zf], [dx0, dy1, dz0]], drawer, 0.32);
        C.poly(Lo, [[dx0, dy0, dz0], [dx1, dy0, dz0], [dx1, dy1, dz0], [dx0, dy1, dz0]], drawer, (x, y) => cl(0.62 + (y > C.p(0, dy1, dz0)[1] - 2 ? 0.15 : 0) + dz(x, y, 0.05)));
        const rq = C.p(CX, (dy0 + dy1) / 2, dz0 - 0.005); Lo.fill(rq[0] - 4, rq[1] - 4, rq[0] + 4, rq[1] + 4, (x, y) => { const d = Math.hypot(x - rq[0], y - rq[1]); return d < 0.05 * rq[2] && d > 0.028 * rq[2]; }, iron, 2);
        // the spectacles on the papers, and their tag
        const sq = C.p(CX - 0.1, dy0 + 0.06, dz0 + 0.2), sr = Math.max(2, 0.055 * sq[2]);
        for (const dx of [-sr * 1.25, sr * 1.25]) Lo.fill(sq[0] + dx - sr - 1, sq[1] - sr, sq[0] + dx + sr + 1, sq[1] + sr, (x, y) => { const d = Math.hypot((x - sq[0] - dx) / sr, (y - sq[1]) / (sr * 0.6)); return d <= 1 && d >= 0.62; }, glassM, 1);
        Lo.rect(sq[0] - 1, sq[1] - 1, 3, 1, glassM, 1);
        const tq = C.p(CX + 0.32, dy0 + 0.06, dz0 + 0.16), tw = Math.max(4, 0.13 * tq[2]);
        Lo.rect(tq[0], tq[1] - tw * 0.35, tw, tw * 0.6, paperM, 4);
        Lo.line(sq[0] + sr * 2.2, sq[1], tq[0], tq[1] - tw * 0.1, iron, 1);
        Lo.outline();
        g.drawImage(Lr.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        const H = shaft(g, C, [[-hw, wy0, wz0], [-hw, wy0, wz1], [-hw, wy1, wz1], [-hw, wy1, wz0]], [1, -0.85, -0.05], '250,240,220', 0.07);
        framePost(g, G.w - Math.round(G.w * 0.06), Math.round(G.w * 0.06), 0, G.h, '#16120e', null);
        R(g, G.w - Math.round(G.w * 0.06), 0, 1, G.h, '#3a2e24');
        vignette(g, G.w, G.h, sq[0], sq[1] - G.vb * 0.12, G.w * 0.6, G.vb * 0.7, 0.6);
        return { keep: [sq[0] + sr, sq[1], sr * 6], pres: [C.p(CX, chh, zb)[0], C.p(CX, chh, zb)[1], 1.35 * C.p(CX, chh, zb)[2]], shaft: H };
      } },

    // the First Fire: inside the kiln's vault from its mouth, the brick arching over us, the embers at the back still
    // red; the scarf over a loose brick on the ash
    co: { title: T('The First Fire', '{最初|さいしょ} の {火|ひ}'), tint: '255,196,140', form: 'flame', seed: 7,
      cam: { ch: 1.05, hy: 0.36, hyN: 0.42, f: 0.62 },
      build(G, C, g, p) {
        const { w, h } = G, brick = p.mat('#7a4230', { n: 8, at: 4, step: 0.07 }), ash = p.mat('#6a605a', { n: 7, at: 3, step: 0.07 }), ember = p.mat('#c4502a', { n: 6, at: 3, cols: ['#3a1410', '#6a2214', '#a83a1c', '#e0602a', '#f8a048', '#ffe0a0'] }),
          scarf = p.mat('#c4502a', { n: 6, at: 3, step: 0.07 }), stripe = p.mat('#f0a050', { n: 4, at: 2 }), dark = p.mat('#1e0e0a', { n: 3, at: 1 });
        const R0 = 1.55, yc = 0.45, D = 6.4, ch = C.ch, F = C.F, E = [0, 0.3, D - 0.6];
        // the vault, traced per pixel: floor, barrel vault, back wall with the firebox mouth
        const hit = new Float32Array(w * h * 4);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const dx = (x - C.cx) / F, dy = -(y - C.hy) / F, a = dx * dx + dy * dy, b = 2 * dy * (ch - yc), c0 = (ch - yc) ** 2 - R0 * R0;
          let t = D, kind = 3;
          const tc = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c0))) / (2 * a || 1e-6);
          if (tc > 0 && tc < t) { t = tc; kind = 2; }
          if (dy < 0) { const tf = -ch / dy; if (tf < t) { t = tf; kind = 1; } }
          const o = (y * w + x) * 4; hit[o] = kind; hit[o + 1] = dx * t; hit[o + 2] = ch + dy * t; hit[o + 3] = t;
        }
        const at = (x, y) => { const o = (Math.min(h - 1, Math.max(0, Math.floor(y))) * w + Math.min(w - 1, Math.max(0, Math.floor(x)))) * 4; return [hit[o], hit[o + 1], hit[o + 2], hit[o + 3]]; };
        const light = (X, Y, Z) => 0.2 + 1.15 / (1 + ((X - E[0]) ** 2 + (Y - E[1]) ** 2 + (Z - E[2]) ** 2) * 0.14);
        const mouth = (X, Y) => Math.abs(X) < 0.62 && Y < 0.55 + Math.sqrt(Math.max(0, 0.62 * 0.62 - X * X)) * 0.5;
        const L = SP.layer(w, h), Lo = SP.layer(w, h);
        L.fill(0, 0, w, h, (x, y) => at(x, y)[0] === 2, brick, (x, y) => { const [, X, Y, Z] = at(x, y), s = Math.atan2(Y - yc, X) * R0, row = Math.floor(s / 0.11), jz = frac((Z + (row % 2) * 0.13) / 0.26); return cl(0.12 + light(X, Y, Z) * 0.75 + (frac(s / 0.11) < 0.14 || jz < 0.08 ? -0.18 : (hash(row * 7 + Math.floor(Z / 0.26)) - 0.5) * 0.12) + dz(x, y, 0.06)); });
        L.fill(0, 0, w, h, (x, y) => at(x, y)[0] === 3 && !mouth(at(x, y)[1], at(x, y)[2]), brick, (x, y) => { const [, X, Y] = at(x, y), row = Math.floor(Y / 0.11), jx = frac((X + (row % 2) * 0.13) / 0.26); return cl(0.1 + light(X, Y, D) * 0.6 + (frac(Y / 0.11) < 0.14 || jx < 0.08 ? -0.15 : 0) + dz(x, y, 0.06)); });
        L.fill(0, 0, w, h, (x, y) => at(x, y)[0] === 3 && mouth(at(x, y)[1], at(x, y)[2]), dark, 0.4);
        L.fill(0, 0, w, h, (x, y) => at(x, y)[0] === 1, ash, (x, y) => { const [, X, , Z] = at(x, y); return cl(0.12 + light(X, 0, Z) * 0.7 + (hash(Math.round(X * 40) * 7 + Math.round(Z * 30)) - 0.5) * 0.12 + dz(x, y, 0.08)); });
        // the embers: a low mound before the mouth, glowing through grey
        L.fill(0, 0, w, h, (x, y) => { const [k, X, , Z] = at(x, y); return k === 1 && ((X - E[0]) / 0.9) ** 2 + ((Z - E[2] + 0.1) / 0.55) ** 2 < 1; }, ember, (x, y) => { const [, X, , Z] = at(x, y), d = Math.hypot((X - E[0]) / 0.9, (Z - E[2] + 0.1) / 0.55); return cl(0.2 + (1 - d) * 0.55 + (hash(Math.round(X * 26) * 13 + Math.round(Z * 22)) > 0.62 ? 0.3 : 0) + dz(x, y, 0.1)); });
        // the loose brick and the scarf over it, its ends hanging, a stripe near each end
        const bq = C.p(0.62, 0.12, D - 1.9), bu = bq[2];
        C.poly(Lo, [[0.45, 0.12, D - 2.0], [0.8, 0.12, D - 2.0], [0.8, 0.12, D - 1.82], [0.45, 0.12, D - 1.82]], brick, 0.55);
        C.poly(Lo, [[0.45, 0, D - 2.0], [0.8, 0, D - 2.0], [0.8, 0.12, D - 2.0], [0.45, 0.12, D - 2.0]], brick, 0.35);
        const sx0 = bq[0] - 0.24 * bu, sx1 = bq[0] + 0.24 * bu, sy = bq[1] - 0.02 * bu;
        Lo.fill(sx0 - 0.1 * bu, sy - 0.05 * bu, sx1 + 0.14 * bu, sy + 0.2 * bu, (x, y) => { const u = (x - sx0) / (sx1 - sx0); const top = sy - Math.sin(clamp(u, 0, 1) * Math.PI) * 0.035 * bu; if (u < 0) return y >= top && y < sy + (-u) * 1.6 * (sx1 - sx0) && Math.abs(x - (sx0 - 0.04 * bu)) < 0.06 * bu; if (u > 1) return y >= top && y < sy + 0.18 * bu && Math.abs(x - (sx1 + 0.06 * bu)) < 0.06 * bu; return y >= top && y < top + 0.07 * bu; }, scarf, (x, y) => cl(0.62 - (y - sy) / (0.2 * bu) * 0.3 + Math.sin(x * 1.1) * 0.06 + dz(x, y, 0.06)));
        Lo.fill(sx1 + 0.0 * bu, sy + 0.12 * bu, sx1 + 0.12 * bu, sy + 0.15 * bu, () => true, stripe, 2);
        for (let i = 0; i < 4; i++) Lo.rect(Math.round(sx1 + 0.01 * bu + i * 0.03 * bu), Math.round(sy + 0.18 * bu), 1, Math.max(2, Math.round(0.03 * bu)), stripe, 1);
        Lo.outline();
        g.drawImage(L.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        // the kiln's mouth round us: dark brick framing the view, its inner edge lit warm (the sill under it too; AR-1)
        const aw = w * (G.narrow ? 0.46 : 0.4), ay = G.vb * 0.4, ah = G.vb * 0.34, fr = (x, y) => !(Math.abs(x - w / 2) < aw && (y > ay ? y < G.vb * 0.97 : ((x - w / 2) / aw) ** 2 + ((y - ay) / ah) ** 2 < 1));
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fr(x, y)) { const edge = !fr(x + 1, y + 1) || !fr(x - 1, y + 1) || !fr(x, y - 1) || !fr(x, y - Math.max(2, G.s(2))); g.fillStyle = edge ? '#7a3a22' : ((Math.floor(y / G.s(6)) + Math.floor((x + (Math.floor(y / G.s(6)) % 2) * G.s(6)) / G.s(12))) % 2 ? '#1e100c' : '#24140e'); g.fillRect(x, y, 1, 1); }
        vignette(g, w, h, bq[0], bq[1] - G.vb * 0.1, w * 0.6, G.vb * 0.8, 0.35, [20, 8, 4]);
        const eq = C.p(E[0], 0.05, E[2]);
        return { keep: [bq[0] + 0.1 * bu, sy + 0.06 * bu, 0.4 * bu], pres: [eq[0], eq[1], 1.5 * eq[2]], ember: eq };
      },
      live(c, G, I, t, st) {
        const [x, y] = I.ember, rnd = P().rnd(2), still = st.still;
        SP.glow(c, Math.round(x), Math.round(y - G.s(4)), G.s(60), '255,130,60', 0.2 + (still ? 0 : Math.sin(t / 500) * 0.04));
        for (let i = 0; i < 26; i++) { const ph = rnd(), u = still ? ph : (t / (2200 + ph * 1800) + ph) % 1, xx = x + (rnd() - 0.5) * G.s(60) + Math.sin(u * 6 + ph * 9) * G.s(4), yy = y - u * G.vb * 0.4; if (u > 0.9) continue; R(c, xx, yy, 1, 1, u < 0.5 ? '#ffb050' : '#e0602a'); }
      } },

    // the Sister Star: the observatory's dome from its floor, the slit open on the night, the telescope at rest; the
    // great lamp burning at the left (lit since Chapter 4, as the Lamp Room is), its warm light on the boards; the
    // starlight falling to the floor and the two earrings in it
    sb: { title: T('The Sister Star', '{姉星|あねぼし}'), tint: '214,228,255', form: 'star', seed: 11,
      cam: { ch: 1.7, hy: 0.42, hyN: 0.5, f: 0.7 },
      build(G, C, g, p) {
        const { w, h, vb } = G, dome = p.mat('#4a4c62', { n: 8, at: 4, step: 0.06 }), floorM = p.mat('#5a4c44', { n: 8, at: 4, step: 0.07 }), brass = p.mat('#a08850', { n: 7, at: 3, step: 0.07 }),
          lac = p.mat('#2e2a36', { n: 6, at: 3, step: 0.07 }), stoneM = p.mat('#6a6872', { n: 7, at: 3, step: 0.06 });
        const L = SP.layer(w, h), Lo = SP.layer(w, h), base = Math.round(C.hy + C.F * C.ch / 7.5), cx = w / 2, slit = Math.max(4, Math.round(w * 0.075));
        // the night through the slit, then the dome round it: ribs gathering toward the crown, boards between them
        g.fillStyle = '#0c1028'; g.fillRect(0, 0, w, base);
        Q.bandsIn(g, cx - slit, 0, slit * 2, base, ['#0a0e26', '#10163a', '#18204a', '#1e2a58'], 0.45);
        SP.stars(g, cx - slit, 0, slit * 2, base, Math.round(slit * 2.2), 21, 6);
        L.fill(0, 0, w, base, (x, y) => Math.abs(x - cx) > slit, dome, (x, y) => { const a = Math.atan2(x - cx, Math.max(1, base + vb * 0.4 - y)), r = (base + vb * 0.4 - y) / vb; return cl(0.2 + (frac(a * 3.2) < 0.1 ? 0.22 : 0) + (frac(r * 9) < 0.08 ? -0.1 : 0) + (1 - Math.abs(x - cx) / (w / 2)) * 0.12 + dz(x, y, 0.06)); });
        // the slit's frames and its shutter rolled back
        L.rect(cx - slit - G.s(4), 0, G.s(4), base, lac, 0.4); L.rect(cx + slit, 0, G.s(4), base, lac, 0.3);
        // the drum wall below the dome, a rail along it (down to the frame's foot, under the floor: on a phone on its side
        // the floor's far edge falls below the wall's and a band between them was left unpainted; AR-2)
        L.rect(0, base - G.s(16), w, h - base + G.s(16), stoneM, (x, y) => cl(0.3 + (frac((x - cx) / G.s(26)) < 0.04 ? -0.15 : 0) + dz(x, y, 0.05) - (y > base ? 0.12 : 0)));
        L.rect(0, base - G.s(17), w, G.s(2), brass, 0.55);
        // the floor: boards, and the pool where the starlight lands
        const geo = room(L, C, { W: 16, D: 7.5, H: 9, floor: [floorM, (X, Z, x, y) => 0.22 + boards(X, 0.3) + ease(clamp(1 - Math.hypot(X / 1.2, (Z - 6.2) / 1.0), 0, 1)) * 0.5 + dz(x, y, 0.06)] });
        void geo;
        // the telescope on its pier, at rest, pointing up the slit
        const pq = drum(Lo, C, -1.9, 7.0, 0.3, 0, 1.15, stoneM, { amb: 0.25, top: 0.6 });
        const tb = C.p(-1.9, 1.35, 7.0), tt = [cx + slit * 0.4, Math.round(base * 0.18)];
        Lo.seg(tb[0], tb[1], tt[0], tt[1], Math.max(4, 0.32 * tb[2]), lac, (x, y) => { const dxv = tt[0] - tb[0], dyv = tt[1] - tb[1], L2 = Math.hypot(dxv, dyv), nx = -dyv / L2, ny = dxv / L2, d = ((x - tb[0]) * nx + (y - tb[1]) * ny) / (0.16 * tb[2]); return cl(0.45 - d * 0.35 + dz(x, y, 0.05)); });
        for (const u of [0.08, 0.5, 0.86]) { const x = lerp(tb[0], tt[0], u), y = lerp(tb[1], tt[1], u); Lo.ell(x, y, Math.max(2, 0.18 * tb[2] * (1 - u * 0.3)), Math.max(2, 0.18 * tb[2] * (1 - u * 0.3)), brass, 0.62); }
        Lo.seg(tb[0], tb[1], pq.x, pq.y, Math.max(2, 0.1 * tb[2]), brass, 0.5);
        // the great lamp, lit: a stone foot, the glass body burning, a brass cap
        const glass = p.mat('#ffd690', { n: 5, at: 3, step: 0.05 }), LX = -3.5, LZ = 5.2;
        drum(Lo, C, LX, LZ, 0.5, 0, 0.45, stoneM, { amb: 0.3, top: 0.62 });
        const lb = drum(Lo, C, LX, LZ, 0.38, 0.45, 1.55, glass, { amb: 0.75, top: false });
        drum(Lo, C, LX, LZ, 0.48, 1.55, 1.72, brass, { amb: 0.35, top: 0.7 });
        Lo.outline();
        g.drawImage(L.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        // the starlight from the slit down to the floor
        const fq = C.p(0, 0, 6.2), H = [[cx - slit, 0], [cx + slit, 0], [fq[0] + 1.1 * fq[2], fq[1]], [fq[0] - 1.1 * fq[2], fq[1]]];
        g.fillStyle = 'rgba(200,218,255,0.06)'; g.beginPath(); H.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
        // the foreground: a rail of the gallery stair at the bottom right, in shadow
        R(g, Math.round(w * 0.78), Math.round(vb * 0.74), Math.round(w * 0.22), G.s(3), '#141420');
        for (let i = 0; i < 4; i++) R(g, Math.round(w * (0.8 + i * 0.055)), Math.round(vb * 0.74), G.s(3), h, '#141420');
        vignette(g, w, h, fq[0], fq[1] - vb * 0.2, w * 0.6, vb * 0.8, 0.55, [6, 8, 18]);
        // the great lamp's warm light round it and on the boards (stepped, no gradients), over the night's shade
        const lq = C.p(LX, 0, LZ);
        SP.glow(g, lb.x, Math.round((lb.y + lb.by) / 2), Math.round(2.6 * lq[2]), '255,200,120', 0.45);
        SP.glow(g, lq[0], lq[1], Math.round(3.4 * lq[2]), '255,190,110', 0.35);
        return { keep: [fq[0], fq[1] - 0.08 * fq[2], 0.5 * fq[2]], pres: [fq[0], fq[1] - 0.2 * fq[2], 1.9 * fq[2]], shaft: H, ear: [fq[0], fq[1], fq[2]] };
      },
      live(c, G, I, t, st) {
        const [x, y, u] = I.ear;
        for (const dx of [-0.1 * u, 0.08 * u]) { const xx = Math.round(x + dx), yy = Math.round(y - 0.04 * u), tw = st.still ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(t / 500 + dx)); R(c, xx, yy - 2, 1, 5, '#e8f0ff'); R(c, xx - 2, yy, 5, 1, '#e8f0ff'); R(c, xx, yy, 1, 1, '#ffffff'); SP.glow(c, xx, yy, G.s(7), '220,232,255', 0.35 * tw); }
      } },

    // the Bell's Maker: the drowned tower's chamber, the great bell on its beam over the dark water; the little bronze
    // bell on the edge of the stone stand beneath it. By now the great bell has been rung (lf_bell_rung, before the
    // chapter's end), and the world draws it bright bronze: so it is bronze here too, green left only in its bands'
    // recesses (it was painted green with patina, as before it rang)
    lf: { title: T('The Bell\'s Maker', '{鐘|かね} の {鋳物師|いもじ}'), tint: '236,216,176', form: 'figure', seed: 13,
      build(G, C, g, p) {
        const { w, h, vb, s } = G, wall = p.mat('#4a524e', { n: 8, at: 4, step: 0.06 }), bronze = p.mat('#94743a', { n: 8, at: 4, step: 0.07 }), patina = p.mat('#4a7a68', { n: 6, at: 3, step: 0.07 }),
          water = p.mat('#1a3236', { n: 7, at: 3, step: 0.07 }), beamM = p.mat('#2e2420', { n: 6, at: 3, step: 0.08 }), slab = p.mat('#6a6a62', { n: 7, at: 3, step: 0.06 }), sky = p.mat('#c8d8d8', { n: 3, at: 2 });
        const L = SP.layer(w, h), Lo = SP.layer(w, h), cx = Math.round(w * 0.48), top = Math.round(vb * 0.16), bh = Math.round(vb * 0.42), wl = Math.round(vb * 0.64), py = Math.round(vb * 0.58);
        // the chamber's wall: big blocks in courses, damp lower down; the high window at the right
        L.fill(0, 0, w, wl, () => true, wall, (x, y) => { const row = Math.floor(y / s(14)), j = frac((x + (row % 2) * s(17)) / s(34)); return cl(0.26 + (frac(y / s(14)) < 0.1 || j < 0.05 ? -0.14 : (hash(row * 11 + Math.floor((x + (row % 2) * s(17)) / s(34))) - 0.5) * 0.12) + (y / wl) * -0.08 + (x > w * 0.6 ? 0.06 : 0) + dz(x, y, 0.06)); });
        const wx = Math.round(w * 0.82), wy = Math.round(vb * 0.08); L.rect(wx, wy, s(16), s(36), sky, 1); L.rect(wx - s(2), wy - s(2), s(20), s(2), wall, 0.1);
        // the water, dark, its far edge against the wall
        SP.water(L, 0, wl, w, h, water, { band: Math.max(3, s(4)), deep: 0.15, seed: 19, lit: (x) => clamp(1 - Math.abs(x - cx) / (w * 0.3), 0, 1) * 0.16 });
        // the stone stand: a slab across under the bell, its top and its front
        L.fill(Math.round(w * 0.14), py, Math.round(w * 0.86), wl + s(8), (x, y) => true, slab, (x, y) => cl((y < py + s(6) ? 0.62 : 0.32) + (frac(x / s(30)) < 0.03 ? -0.15 : 0) + dz(x, y, 0.06)));
        // the beam and the bell: crown, shoulder, waist, lip; raised bands; the bosses in their panels; patina
        L.rect(0, Math.round(vb * 0.04), w, s(12), beamM, (x, y) => cl(0.4 + (y - vb * 0.04 < 2 ? 0.2 : 0) + boards(x, s(40)) * 0.4));
        Lo.rect(cx - s(5), Math.round(vb * 0.04) + s(12), s(10), top - Math.round(vb * 0.04) - s(12), beamM, 0.3);
        const half = (v) => (v < 0.08 ? 0.38 : v < 0.2 ? 0.38 + Math.sin(((v - 0.08) / 0.12) * Math.PI / 2) * 0.24 : 0.62 + (v - 0.2) * 0.12 + (v > 0.9 ? (v - 0.9) * 1.2 : 0)) * bh * 0.62;
        const side = P().cyl(cx - bh * 0.05, bh * 0.4, { amb: 0.2, rim: 0.12 });
        Lo.fill(cx - bh, top, cx + bh, top + bh, (x, y) => Math.abs(x - cx) <= half((y - top) / bh), bronze, (x, y) => { const v = (y - top) / bh, band = [0.22, 0.6, 0.86].some((b) => Math.abs(v - b) < 0.015) ? 0.2 : [0.22, 0.6, 0.86].some((b) => Math.abs(v - b - 0.025) < 0.01) ? -0.15 : 0; const u = (x - cx) / half(v); const boss = v > 0.25 && v < 0.55 && frac(v * 14) < 0.4 && frac(u * 3.5 + 0.5) < 0.3 ? 0.18 : 0; return cl(side(cx + u * bh * 0.4, y) * 0.9 + band + boss + dz(x, y, 0.05)); });
        Lo.fill(cx - bh, top, cx + bh, top + bh, (x, y) => { const v = (y - top) / bh; const c0 = Math.floor(x / Math.max(1, s(2))); return Math.abs(x - cx) <= half(v) - 1 && [0.22, 0.6, 0.86].some((b) => v > b && v < b + 0.03) && hash(c0 * 3.7) < 0.35; }, patina, (x, y) => cl(0.45 - (x - cx) / bh * 0.3 + dz(x, y, 0.08)));
        Lo.ell(cx, top + bh, half(1), Math.max(2, s(4)), bronze, 0.2);
        // the little bell on the stand's front edge, right of the great one
        const kx = Math.round(w * 0.64), ky = py + s(1), kr = Math.max(3, s(6));
        Lo.fill(kx - kr, ky - kr * 1.6, kx + kr, ky, (x, y) => { const v = (y - (ky - kr * 1.6)) / (kr * 1.6); return Math.abs(x - kx) <= kr * (0.45 + v * 0.55); }, bronze, (x, y) => cl(0.7 - (x - kx) / kr * 0.3 + dz(x, y, 0.06)));
        Lo.rect(kx - 1, ky - kr * 1.6 - s(2), 2, s(2), bronze, 0.3);
        Lo.outline();
        g.drawImage(L.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        // the great bell's reflection, dim and broken by the water
        const ref = mk(w, h), rg = ref.getContext('2d'); rg.drawImage(Lo.canvas(), 0, 0);
        g.globalAlpha = 0.22; for (let j = 0; j < h - wl - s(8); j += 2) { const sy = top + bh - j; if (sy > top) g.drawImage(ref, 0, sy, w, 2, Math.round(Math.sin(j / 5) * 2), wl + s(8) + j, w, 2); } g.globalAlpha = 1;
        // the window's light falling across the bell's shoulder to the stand
        const H = [[wx, wy], [wx + s(16), wy], [Math.round(w * 0.62), py], [Math.round(w * 0.46), py]];
        g.fillStyle = 'rgba(230,236,220,0.07)'; g.beginPath(); H.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
        // the foreground: the stair's stones at the left, in shadow
        g.fillStyle = '#12161a'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, vb * 0.3); g.lineTo(w * 0.08, vb * 0.34); g.lineTo(w * 0.1, vb * 0.6); g.lineTo(w * 0.16, vb * 0.64); g.lineTo(w * 0.18, h); g.closePath(); g.fill();
        R(g, Math.round(w * 0.08), Math.round(vb * 0.34), 1, Math.round(vb * 0.26), '#3a4448');
        vignette(g, w, h, kx, ky - vb * 0.2, w * 0.6, vb * 0.75, 0.5, [6, 10, 12]);
        return { keep: [kx, ky - kr, kr * 3], pres: [Math.round(w * 0.6), py, vb * 0.5], shaft: H };
      } },

    // the Bridge Founder: under the first bridge, the deck and its beams overhead, piles going away into the light at
    // the far end; the oldest pile close by, the indigo headband round its foot at the water
    mb: { title: T('The Bridge Founder', '{橋|はし} の {開祖|かいそ}'), tint: '214,230,236', form: 'figure', seed: 17,
      cam: { ch: 0.95, hy: 0.36, hyN: 0.46, f: 0.66 },
      build(G, C, g, p) {
        const { w, h, vb } = G, water = p.mat('#2e4e58', { n: 8, at: 4, step: 0.07 }), deck = p.mat('#4a3a2c', { n: 7, at: 3, step: 0.08 }), pile = p.mat('#5a4a38', { n: 8, at: 4, step: 0.07 }),
          moss = p.mat('#4a6a3a', { n: 5, at: 2, step: 0.08 }), indigo = p.mat('#2e4a7a', { n: 6, at: 3, step: 0.07 }), far = p.mat('#c8d8d0', { n: 4, at: 2, step: 0.05 });
        const D = 20, Hd = 2.5, L = SP.layer(w, h), Lo = SP.layer(w, h);
        const geo = room(L, C, { W: 5, D, H: Hd,
          floor: [water, (X, Z, x, y) => { const Xw = X + Math.sin(Z * 5) * 0.04, gap = frac(Xw / 0.42) < 0.05 && hash(Math.floor(Z * 2.5) * 7 + Math.floor(Xw / 0.42) * 3) > 0.6; return 0.2 + Math.max(0, 1 - Math.abs(X) / 1.4) * Math.min(0.42, Z * 0.024) + (frac(Z * 1.6 + Math.sin(X * 2.4) * 0.3) < 0.16 ? 0.08 * Math.min(1, Z / 7) : 0) + (gap ? 0.22 : 0) + dz(x, y, 0.06); }],
          ceil: [deck, (X, Z, x, y) => 0.18 + (frac(X / 0.42) < 0.06 ? -0.12 : 0) + (frac(Z / 2.5) < 0.12 ? 0.2 : 0) + dz(x, y, 0.05)],
          back: [far, (X, Y, x, y) => (Y < 0.6 ? 0.5 + (Y < 0.25 ? -0.25 : 0) : 0.85) + dz(x, y, 0.04)],
          // the open sides between the outer piles: the misty day outside, the far bank low along the water (they were
          // left unpainted; AR-1)
          left: [far, (Z, Y, x, y) => (Y < 0.35 ? 0.3 + (Y < 0.12 ? -0.12 : 0) : 0.62 + Math.min(0.2, Z * 0.012)) + dz(x, y, 0.04)],
          right: [far, (Z, Y, x, y) => (Y < 0.35 ? 0.3 + (Y < 0.12 ? -0.12 : 0) : 0.66 + Math.min(0.2, Z * 0.012)) + dz(x, y, 0.04)] });
        void geo;
        // the piles in two rows going away, the cross-beams on them
        for (let Z = 2.5; Z < D; Z += 2.5) for (const X of [-2.0, 2.0]) drum(L, C, X, Z, 0.16, 0, Hd, pile, { amb: 0.2, top: false, k: clamp(0.5 + Z / D * 0.4, 0, 1) });
        for (let Z = 2.5; Z < D; Z += 2.5) C.poly(L, [[-2.4, Hd - 0.25, Z], [2.4, Hd - 0.25, Z], [2.4, Hd, Z], [-2.4, Hd, Z]], deck, 0.3);
        // the oldest pile, close: thick, weathered, green at the waterline; the headband tied round it
        const OX = -0.75, OZ = 2.6, or = 0.24;
        const op = drum(Lo, C, OX, OZ, or, 0, Hd, pile, { amb: 0.2, top: false, side: (x, y) => (frac(y / 3) < 0.1 ? -0.1 : 0) + ((x * 7 + y * 3) % 11 === 0 ? -0.08 : 0) });
        const wq = C.p(OX, 0, OZ), mq = C.p(OX, 0.32, OZ), u = wq[2];
        Lo.fill(op.x - op.rx - 1, mq[1], op.x + op.rx + 1, wq[1] + 2, (x, y) => Math.abs(x - op.x) <= op.rx && hash(x * 5 + y * 13) < 0.3 + (y - mq[1]) / (wq[1] - mq[1]) * 0.6, moss, (x, y) => cl(0.5 - (x - op.x) / op.rx * 0.3 + dz(x, y, 0.08)));
        const by0 = C.p(OX, 0.28, OZ)[1], by1 = C.p(OX, 0.16, OZ)[1];
        Lo.fill(op.x - op.rx - 1, by0 - 2, op.x + op.rx + 1, by1 + 2, (x, y) => { const v = (x - op.x) / op.rx; if (Math.abs(v) > 1) return false; const sag = Math.sqrt(1 - v * v) * (0.02 * u); return y >= by0 + sag && y <= by1 + sag; }, indigo, (x, y) => cl(0.6 - (x - op.x) / op.rx * 0.35 + dz(x, y, 0.05)));
        const kx = op.x + op.rx * 0.45, ky = (by0 + by1) / 2 + 0.02 * u;
        Lo.ell(kx, ky, Math.max(2, 0.05 * u), Math.max(2, 0.045 * u), indigo, 0.7);
        Lo.seg(kx, ky, kx + 0.08 * u, ky + 0.14 * u, Math.max(2, 0.035 * u), indigo, 0.45);
        Lo.seg(kx, ky, kx + 0.15 * u, ky + 0.1 * u, Math.max(2, 0.035 * u), indigo, 0.55);
        Lo.outline();
        g.drawImage(L.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        // the pile's reflection under it, and the light coming in through the deck's gaps as thin lines on the water
        R(g, Math.round(op.x - op.rx), Math.round(wq[1]), Math.round(op.rx * 2), Math.round(0.4 * u), 'rgba(20,30,34,0.35)');
        // the foreground: the near edge of the deck across the top, a near pile at the right edge
        frameBeam(g, w, 0, Math.max(3, Math.round(C.p(0, Hd, 0.9)[1])), '#141210', '#3a3028');
        const nq = C.p(1.4, 0, 0.9); framePost(g, Math.round(nq[0] - 0.2 * nq[2]), w, 0, h, '#16120e', null); R(g, Math.round(nq[0] - 0.2 * nq[2]), 0, 1, h, '#3e3226');
        vignette(g, w, h, kx, ky - vb * 0.15, w * 0.6, vb * 0.7, 0.5, [6, 10, 14]);
        return { keep: [kx, ky, 0.3 * u], pres: [wq[0], wq[1], 1.9 * u], water: [C.p(0, 0, 4)[1], C.p(0, 0, D)[1]] };
      },
      live(c, G, I, t, st) { SP.glints(c, Math.round(G.w * 0.3), Math.round(I.water[1]), Math.round(G.w * 0.4), Math.max(4, Math.round(I.water[0] - I.water[1])), t, 26, 51, '230,240,236', st.still); } },

    // the Cloud Ox Elder: the summit at sunrise above the sea of cloud, the cairn with the travellers' strips on their
    // cord; the white cape over its top stone
    cr: { title: T('The Cloud Ox Elder', '{雲牛|くもうし} の {長老|ちょうろう}'), tint: '250,250,252', form: 'ox', seed: 19,
      build(G, C, g, p) {
        const { w, h, vb, s } = G, rock = p.mat('#5a5048', { n: 8, at: 4, step: 0.07 }), rock2 = p.mat('#706458', { n: 8, at: 4, step: 0.07 }), peak = p.mat('#4a5a7a', { n: 5, at: 2, step: 0.07 }),
          wood = p.mat('#5a4430', { n: 4, at: 2 }), grass = p.mat('#7a7a44', { n: 5, at: 2, step: 0.08 });
        const hz = Math.round(vb * 0.42), cx = Math.round(w * (G.narrow ? 0.5 : 0.42)), base = Math.round(vb * 0.98);
        Q.bandsIn(g, 0, 0, w, hz, ['#2a3e78', '#3a5490', '#5a72a6', '#8a90b0', '#c8a8a0', '#f0c8a0'], 0.45);
        SP.glow(g, Math.round(w * 0.86), hz, Math.round(vb * 0.32), '255,214,160', 0.45);
        R(g, Math.round(w * 0.86) - s(6), hz - s(4), s(12), s(4), '#fff2d4');
        const L0 = SP.layer(w, h);
        for (const [px, ph, pw] of [[0.1, 0.16, 0.18], [0.27, 0.07, 0.1], [0.66, 0.11, 0.14]]) L0.fill(0, 0, w, h, (x, y) => y > hz - vb * ph + (Math.abs(x - w * px) / (w * pw)) * vb * ph * 1.2 && y < hz + s(6), peak, (x, y) => cl(0.3 + (x > w * px ? 0.12 : -0.08) + dz(x, y, 0.06)));
        L0.outline(); g.drawImage(L0.canvas(), 0, 0);
        // the sea of cloud: a level of white lit warm from the sun's side, billows on it
        g.fillStyle = '#d4d8e4'; g.fillRect(0, hz, w, h - hz);
        SP.clouds(g, w, { n: 10, seed: 23, y0: hz + s(4), y1: hz + vb * 0.18, scale: G.Z * 1.2, light: '#fff4e4', mid: '#eceef4', shade: '#c4cad8' });
        SP.clouds(g, w, { n: 6, seed: 29, y0: hz + vb * 0.2, y1: hz + vb * 0.4, scale: G.Z * 1.9, light: '#ffffff', mid: '#e4e8f0', shade: '#b8c0d0' });
        // the summit: a low rise of rock under the cairn, the slope dropping away at the right
        const L = SP.layer(w, h), Lo = SP.layer(w, h);
        const ground = (x) => base - vb * 0.2 * Math.exp(-(((x - cx) / (w * 0.38)) ** 2)) + (x > w * 0.82 ? (x - w * 0.82) * 0.6 : 0);
        L.fill(0, 0, w, h, (x, y) => y >= ground(x), rock, (x, y) => cl(0.22 + (y - ground(x) < s(3) ? 0.32 : 0) + (x > cx ? 0.06 : 0) + (frac((x * 0.4 + y) / s(16)) < 0.1 ? -0.1 : 0) + dz(x, y, 0.08)));
        for (let i = 0; i < 90; i++) { const x = hash(i * 3.7) * w, y = ground(x) + s(2) + hash(i * 5.1) * vb * 0.16; if (y < h) for (let b = -1; b <= 1; b++) L.line(x + b, y, x + b * 2, y - s(3) - (i % 3), grass, 2 + (b === 0 ? 1 : 0)); }
        // the cairn: stones stacked narrowing upward, sunlit on the right
        const rnd = P().rnd(31);
        let y = Math.round(ground(cx) + s(4)), hw = s(G.narrow ? 66 : 58);
        for (let i = 0; i < 12 && hw > s(7); i++) {
          const n = Math.max(1, Math.round(hw / s(14))), sw = (hw * 2) / n;
          for (let j = 0; j < n; j++) { const rx = sw * (0.52 + rnd() * 0.12), ry = s(7 - i * 0.3) * (0.9 + rnd() * 0.3), ex = cx - hw + sw * (j + 0.5) + (rnd() - 0.5) * s(4), ey = y - ry * 0.8; Lo.ell(ex, ey, rx, ry, (i + j) % 3 ? rock2 : rock, (x, yy) => cl(0.3 + ((x - ex) / rx) * 0.28 - ((yy - ey) / ry) * 0.2 + (hash(Math.floor(x / s(3)) * 3 + Math.floor(yy / s(3)) * 7) - 0.5) * 0.12 + dz(x, yy, 0.05))); }
          y -= Math.round(s(11 - i * 0.4)); hw = Math.round(hw * 0.87);
        }
        const capTop = y + s(2);
        Lo.seg(cx + s(16), capTop + s(16), cx + s(22), capTop - s(56), Math.max(2, s(3)), wood, 0.5);
        Lo.outline();
        g.drawImage(L.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0);
        // the foreground: a shoulder of rock at the lower right, in shadow, its sunlit edge
        g.fillStyle = '#1e1a1a'; g.beginPath(); g.moveTo(w, h); g.lineTo(w, vb * 0.58); g.lineTo(w * 0.92, vb * 0.66); g.lineTo(w * 0.88, vb * 0.86); g.lineTo(w * 0.84, h); g.closePath(); g.fill();
        g.fillStyle = '#d8a874'; g.fillRect(Math.round(w * 0.92), Math.round(vb * 0.66) - 1, Math.round(w * 0.08), 1);
        return { keep: [cx, capTop + s(14), s(40)], pres: [Math.round(w * 0.7), Math.round(hz + vb * 0.12), vb * 0.62], cape: [cx, capTop], pole: [cx + s(22), capTop - s(56)], to: [Math.round(w * 0.08), Math.round(ground(w * 0.08)) - s(4)] };
      },
      live(c, G, I, t, st) {
        const { s } = G, still = st.still, [cx, cy] = I.cape, [px, py] = I.pole, [qx, qy] = I.to;
        // the cord and its strips (plain cloth in five colours, no writing), lifting in the wind
        const cols = ['#f4f0e8', '#c84a3a', '#e0b040', '#4a6aa8', '#5a9a5a'];
        for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(px, qx, u), y = lerp(py, qy, u) + Math.sin(u * Math.PI) * s(14); R(c, x, y, 1, 1, '#4a3a2a'); if (i % 4 === 2) { const fl = still ? 0.5 : Math.sin(t / 260 + i) * 0.5 + 0.5; R(c, x - 1, y + 1, Math.max(2, s(4)), Math.max(3, s(7) + Math.round(fl * 2)), cols[(i / 4) % 5 | 0]); } }
        // the cape over the top stone, hanging down both sides in folds, its loose corner lifting
        const cw = s(17), len = s(24), lift = still ? 0.4 : 0.5 + Math.sin(t / 700) * 0.5;
        for (let j = 0; j < len; j++) { const v = j / len, half = cw * (0.3 + v * 0.7), sway = Math.sin(v * 3 + (still ? 0 : t / 900)) * s(1); for (let x = Math.round(-half); x <= half; x++) { const fold = Math.sin((x / cw) * 9 + v * 2); R(c, cx + x + sway, cy - s(4) + j, 1, 1, fold > 0.75 ? '#c4c8d4' : x > half * 0.3 ? '#fbfcfd' : x < -half * 0.5 ? '#d4d8e0' : '#eceef3'); } }
        for (let j = 0; j < s(14); j++) R(c, cx + cw + j * 0.8 + lift * s(5), cy + len - s(16) - j - lift * j * 0.6, Math.max(2, s(5) - j * 0.3), 1, '#eef0f4');
      } },

    // the Kettle's Mother: the Kettle's pool (its own page's chamber, quiet), the hood folded on a boulder at its edge
    yn: { title: T('The Kettle\'s Mother', '{釜|かま} の {母|はは}'), tint: '234,240,238', form: 'kettle', seed: 23,
      build(G, C, g, p) {
        const { w, h, vb, s } = G, rock = p.mat('#3e3c3a', { n: 8, at: 4, step: 0.07 }), hood = p.mat('#bab4ac', { n: 7, at: 4, step: 0.05 }), mineral = p.mat('#a89a6a', { n: 5, at: 2, step: 0.08 });
        RB.sequence.drawAt(g, w, h, { seq: 'yn.kettle', shot: 'pool', phase: 'calm', k: 1, vb, still: true, t: 0 });
        // a boulder at the pool's edge close to us on the left: its wet flat top, its dark side, mineral streaks
        const L = SP.layer(w, h), bx1 = Math.round(w * (G.narrow ? 0.5 : 0.3)), byT = Math.round(vb * 0.62), lip = s(8);
        const topEdge = (x) => byT + Math.sin(x / s(14)) * s(2) - (x / bx1) * s(4);
        L.fill(0, 0, bx1 + s(12), h, (x, y) => y >= topEdge(x) && x <= bx1 + (y - byT) * 0.25 - (y < byT + lip ? (byT + lip - y) * 0.9 : 0), rock, (x, y) => cl((y < topEdge(x) + lip ? 0.62 - (y - topEdge(x)) / lip * 0.2 : 0.26 + Math.sin((x * 0.5 + y) / s(5)) * 0.05 + (hash(Math.floor(x / Math.max(2, s(2))) * 7 + Math.floor(y / Math.max(2, s(2))) * 3) - 0.5) * 0.08) + (frac((x * 0.6 + y * 0.2) / s(11)) < 0.06 ? -0.1 : 0) + (x > bx1 - s(10) ? -0.08 : 0) + dz(x, y, 0.08)));
        for (let i = 0; i < 4; i++) { const x = s(18) + i * s(23); L.seg(x, byT + lip + s(1), x + s(3), byT + lip + s(6 + (i % 3) * 4), Math.max(1, s(2)), mineral, 0.3); }
        // the hood, folded: the body of it, the gathered crown on top, a crease
        const hx = Math.round(bx1 * 0.55), hy = byT + s(2), hw = s(26), hh = s(11);
        L.fill(hx - hw, hy - hh, hx + hw, hy + 1, (x, y) => { const u = (x - hx) / hw; return Math.abs(u) <= 1 && y >= hy - hh * (1 - u * u * 0.6); }, hood, (x, y) => cl(0.62 - ((x - hx) / hw) * 0.2 + (Math.abs(y - (hy - hh * 0.45)) < 1 ? -0.22 : 0) + dz(x, y, 0.05)));
        L.fill(hx - hw * 0.8, hy - hh * 1.6, hx + hw * 0.3, hy - hh * 0.8, (x, y) => ((x - (hx - hw * 0.25)) / (hw * 0.55)) ** 2 + ((y - (hy - hh * 1.1)) / (hh * 0.5)) ** 2 <= 1, hood, (x, y) => cl(0.8 - ((x - hx) / hw) * 0.2 + dz(x, y, 0.05)));
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        vignette(g, w, h, hx + w * 0.15, hy - vb * 0.2, w * 0.62, vb * 0.75, 0.45, [8, 12, 12]);
        return { keep: [hx, hy - hh, hw * 1.4], pres: [Math.round(w * 0.5), Math.round(vb * 0.56), vb * 0.62], steam: Math.round(vb * 0.56) };
      },
      live(c, G, I, t, st) {
        for (let i = 0; i < 6; i++) { const bx = G.w * (0.36 + i * 0.09), u0 = st.still ? 0.35 : ((t / 7000 + i * 0.17) % 1); for (let j = 0; j < 4; j++) { const u = (u0 + j / 4) % 1; SP.glow(c, Math.round(bx + Math.sin(u * 5 + i) * G.s(8)), Math.round(I.steam - u * G.vb * 0.45), Math.round(G.s(6) + u * G.s(10)), '232,238,236', (1 - u) * 0.22); } }
      } },

    // the First Keeper: the Root Hollow's ledgers on shelves cut into the earth among the roots; on the newest shelf,
    // fresh pale wood, the closed ledger and the green leaf on it in a shaft of light from above
    ko: { title: T('The First Keeper', '{最初|さいしょ} の {葉守|はもり}'), tint: '214,244,196', form: 'figure', seed: 29,
      build(G, C, g, p) {
        const { w, h, vb, s } = G, earth = p.mat('#4a3e30', { n: 8, at: 4, step: 0.07 }), root = p.mat('#6e5440', { n: 8, at: 4, step: 0.07 }), shelf = p.mat('#5a4430', { n: 6, at: 3, step: 0.08 }),
          fresh = p.mat('#d0b080', { n: 6, at: 3, step: 0.06 }), moss = p.mat('#3a4a2e', { n: 7, at: 3, step: 0.07 }), leaf = p.mat('#5aa048', { n: 6, at: 3, step: 0.07 }), cover = p.mat('#6a4a34', { n: 6, at: 3, step: 0.07 }),
          spines = ['#6a3a2a', '#3a4a3a', '#5a4a2a', '#4a3a4a', '#7a6a4a', '#2e3a4a'].map((c0) => p.mat(c0, { n: 5, at: 2, step: 0.08 }));
        const L = SP.layer(w, h), Lo = SP.layer(w, h), Lr = SP.layer(w, h), x0 = Math.round(w * (G.narrow ? 0.1 : 0.22)), x1 = Math.round(w * (G.narrow ? 0.9 : 0.78));
        const rows = [0.2, 0.37, 0.54].map((f) => Math.round(vb * f)), floorY = Math.round(vb * 0.7);
        // the earth wall, cut back into a recess where the shelves are; the floor of moss
        L.rect(0, 0, w, h, earth, (x, y) => cl(0.24 + (x > x0 - s(6) && x < x1 + s(6) && y > rows[0] - s(22) && y < rows[2] + s(4) ? -0.12 : 0) + (hash(Math.floor(x / s(5)) * 7 + Math.floor(y / s(4)) * 13) - 0.5) * 0.12 + dz(x, y, 0.08)));
        L.fill(0, floorY, w, h, () => true, moss, (x, y) => cl(0.2 - ((y - floorY) / (h - floorY)) * 0.12 + (hash(Math.floor(x / Math.max(2, s(3))) * 5 + Math.floor(y / Math.max(2, s(2))) * 11) > 0.82 ? 0.07 : 0) + (y < floorY + 2 ? 0.16 : 0) + (Math.abs(x - w * 0.5) < w * 0.2 ? 0.06 : 0) + dz(x, y, 0.08)));
        // the shelves: old ones above, full; the newest at the bottom, pale and empty but for one ledger
        rows.forEach((y, r) => {
          const fr = r === 2;
          L.rect(x0, y, x1 - x0, s(4), fr ? fresh : shelf, (xx, yy) => cl((yy < y + 1 ? 0.78 : 0.5) + dz(xx, yy, 0.05)));
          if (fr) return;
          for (let x = x0 + s(2); x < x1 - s(6); ) { const bw = s(5) + Math.round(hash(x * 3 + r) * s(4)), bh = s(14) + Math.round(hash(x * 7 + r) * s(5)), M = spines[Math.floor(hash(x + r * 11) * spines.length)]; L.rect(x, y - bh, bw, bh, M, (xx, yy) => cl(0.5 - ((xx - x) / bw) * 0.3 + (yy - (y - bh) < 2 ? 0.15 : 0) + dz(xx, yy, 0.05))); x += bw + (hash(x) > 0.85 ? s(5) : 1); }
        });
        const ly = rows[2], lx = Math.round(w * 0.5), lw = s(34), lh = s(9);
        Lo.rect(lx - lw, ly - lh, lw * 2, lh, cover, (x, y) => cl((y < ly - lh + 2 ? 0.72 : 0.45) + dz(x, y, 0.05)));
        Lo.rect(lx - lw + s(2), ly - lh + s(3), lw * 2 - s(2), s(3), fresh, 0.8);
        const fx = lx + s(2), fy = ly - lh - s(4), fr0 = s(12);
        Lo.fill(fx - fr0 - 2, fy - fr0, fx + fr0 + 2, fy + fr0, (x, y) => { const u = (x - fx) / fr0, v = (y - fy) / (fr0 * 0.42); return u * u + v * v <= 1; }, leaf, (x, y) => cl(0.62 + (y < fy ? 0.16 : -0.06) + (Math.abs(y - fy) < 1 ? -0.2 : 0) + dz(x, y, 0.05)));
        Lo.line(fx + fr0, fy, fx + fr0 + s(4), fy + s(2), p.mat('#2e5a26', { n: 3, at: 1 }), 1);
        // the roots: great ones down both sides and arching over, curved; smaller ones hanging
        const curve = (a, b, c0, wa, wb, n) => { const out = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; out.push([v * v * a[0] + 2 * v * u * b[0] + u * u * c0[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c0[1], lerp(wa, wb, u)]); } return out; };
        const rootSh = (x, y) => cl(0.44 + (((Math.round(y * 0.6) + Math.round(x * 0.25)) % 9) === 0 ? -0.2 : 0) + dz(x, y, 0.06));
        Lr.path(curve([-s(10), -s(10)], [w * 0.2, vb * 0.4], [w * 0.06, h], s(34), s(40), 16), s(30), root, rootSh);
        Lr.path(curve([w + s(10), -s(10)], [w * 0.8, vb * 0.45], [w * 0.95, h], s(30), s(40), 16), s(28), root, rootSh);
        Lr.path(curve([-s(10), vb * 0.1], [w * 0.5, -vb * 0.05], [w + s(10), vb * 0.14], s(16), s(18), 20), s(16), root, rootSh);
        for (let i = 0; i < 10; i++) { const x = w * (0.24 + i * 0.058), l = vb * (0.05 + hash(i) * 0.1); Lr.path(curve([x, vb * 0.08], [x + s(3), vb * 0.08 + l * 0.6], [x + s(1), vb * 0.08 + l], Math.max(2, s(3)), 1, 6), Math.max(2, s(3)), root, 0.32); }
        Lo.outline(); Lr.outline();
        g.drawImage(L.canvas(), 0, 0); g.drawImage(Lo.canvas(), 0, 0); g.drawImage(Lr.canvas(), 0, 0);
        // the light from a gap in the roots above, down onto the newest shelf
        const H = [[w * 0.55, 0], [w * 0.63, 0], [lx + lw * 1.3, ly + s(2)], [lx - lw * 1.1, ly + s(2)]];
        g.fillStyle = 'rgba(220,240,180,0.09)'; g.beginPath(); H.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
        SP.glow(g, lx, ly - s(4), Math.round(lw * 1.4), '220,240,170', 0.16);
        vignette(g, w, h, fx, fy - vb * 0.12, w * 0.58, vb * 0.72, 0.5, [6, 10, 6]);
        return { keep: [fx, fy, fr0 * 2.2], pres: [Math.round(w * (G.narrow ? 0.3 : 0.36)), floorY, vb * 0.56], shaft: H };
      } },
  };
  function geomGuard(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); }
  function guardStatic(key, G) {
    return cached('gd.' + key + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const D = GUARD[key], p = P(), cv = mk(G.w, G.h), g = cv.getContext('2d', { willReadFrequently: true });
      g.imageSmoothingEnabled = false;
      const C = D.cam ? camOf(G, D.cam) : null;
      // (a dark ground under every scene: where two of a room's faces meet, a pixel could be left unpainted at some sizes,
      // showing the picture before through it; AR-2)
      g.fillStyle = '#100e14'; g.fillRect(0, 0, G.w, G.h);
      const info = D.build(G, C, g, p);
      return { cv, info };
    });
  }
  for (const key of Object.keys(GUARD)) {
    const D = GUARD[key];
    RB.sequence.define('gd.' + key, {
      page: false, title: D.title, chapter: 'post', scene: 'gd.' + key,
      shots: {
        won: {
          phases: [['settle', 1500]],
          safe: { wide: 'the keepsake in its place above the sheet', narrow: 'the keepsake in the upper half', land: 'the keepsake' },
          draw(c, w, h, t, st) {
            const G = geomGuard(w, h, st.vb), still = st.still, k = st.at('settle');
            const S = guardStatic(key, G), I = S.info;
            c.drawImage(S.cv, 0, 0);
            if (D.live) D.live(c, G, I, t, st);
            if (I.shaft) dust(c, I.shaft, t, still, 60, 7, D.tint);
            const [px, py, ph] = I.pres;
            presence(c, px, py, ph, still ? 0.55 : k, D.tint, D.form, t, still, D.seed);
            // the keepsake catches the light as the presence goes
            const [kx, ky, kr] = I.keep;
            SP.glow(c, Math.round(kx), Math.round(ky), Math.round(Math.max(G.s(10), kr)), '255,244,214', 0.22 * ease(still ? 1 : k));
          },
          focus(w, h, vb) {
            const G = geomGuard(w, h, vb), I = guardStatic(key, G).info, [kx, ky, kr] = I.keep, [px, py, ph] = I.pres;
            const x0 = Math.max(0, Math.min(kx - kr, px - ph * 0.3)), x1 = Math.min(w, Math.max(kx + kr, px + ph * 0.3));
            const y0 = Math.max(0, Math.min(ky - kr, py - ph * 0.8)), y1 = Math.min(vb - 2, Math.max(ky + kr * 0.5, py));
            return { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
          },
        },
      },
    });
  }

  // ==== the Hall's tales: picture scrolls in ink and wash ===========================================================
  const PAPER = [233, 223, 198], INK = [[212, 201, 174], [180, 170, 146], [142, 134, 116], [102, 96, 79], [64, 59, 51], [34, 32, 28]];
  // a canvas painter writing straight into pixels: ink(x, y, tone 0..1) dithers between the ink ramp's steps;
  // col(x, y, [r, g, b]) lays an accent; shapes call these
  function painter(w, h) {
    const img = new ImageData(w, h), d = img.data, p = P();
    // the paper: warm, with fibres and a darker edge
    const rnd = p.rnd(97);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, edge = Math.min(x, y, w - 1 - x, h - 1 - y) / Math.min(w, h), v = edge < 0.06 ? (0.06 - edge) * 1.2 : 0;
      const fib = ((x * 7 + y * 13 + Math.floor(rnd() * 3)) % 29) === 0 ? 8 : 0;
      d[o] = PAPER[0] - v * 60 - fib; d[o + 1] = PAPER[1] - v * 64 - fib; d[o + 2] = PAPER[2] - v * 70 - fib; d[o + 3] = 255;
    }
    const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= w || y >= h) return; const o = (y * w + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; };
    function ink(x, y, tone) { tone = clamp(tone, 0, 1); if (tone <= 0.02) return; const f = tone * (INK.length - 1) + (p.bayer(Math.round(x), Math.round(y)) - 0.5); const i = Math.max(0, Math.min(INK.length - 1, Math.round(f))); put(x, y, INK[i]); }
    function fill(x0, y0, x1, y1, inside, tone) { for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) if (inside(x, y)) ink(x, y, typeof tone === 'function' ? tone(x, y) : tone); }
    function accent(x0, y0, x1, y1, inside, col) { for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) if (inside(x, y)) put(x, y, col); }
    function stroke(pts, w0, tone) { for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay))); for (let j = 0; j <= n; j++) { const u = j / n, x = lerp(ax, bx, u), y = lerp(ay, by, u), r = Math.max(0.5, w0 * (1 - (i - 1 + u) / pts.length * 0.5)); if (r < 1) { ink(x, y, tone); continue; } for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) ink(x + xx, y + yy, tone); } } }
    const disc = (cx, cy, r, tone) => fill(cx - r, cy - r, cx + r + 1, cy + r + 1, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, tone);
    // a little person in ink: a head and a robe, standing or walking away
    function figure(cx, by, sz, tone) { disc(cx, by - sz * 1.9, sz * 0.32, tone); fill(cx - sz * 0.5, by - sz * 1.6, cx + sz * 0.5, by, (x, y) => Math.abs(x - cx) <= sz * (0.22 + (y - (by - sz * 1.6)) / (sz * 1.6) * 0.28), tone); }
    // hills as washes: the ridge laid in darkest, the ink fading down into mist below it (paper shows through), a few
    // dry strokes of texture on the slope
    function hills(base, amp, tone, seed, freq) {
      const r2 = p.rnd(seed), ph = r2() * 6, fade = Math.max(4, amp * 2.4);
      const ridge = (x) => base + Math.sin(x / (w * (freq || 0.12)) + ph) * amp + Math.sin(x / (w * 0.04) + ph * 2) * amp * 0.22;
      fill(0, 0, w, h, (x, y) => y > ridge(x) && y < ridge(x) + fade * 3, (x, y) => { const d = (y - ridge(x)) / fade; return tone * (d < 0.12 ? 1.2 : Math.exp(-d * 1.1)) * (0.9 + 0.1 * Math.sin(x * 0.09 + Math.floor(y / 2) * 1.7)); });
      for (let i = 0; i < 14; i++) { const x = r2() * w, y = ridge(x) + r2() * fade * 0.8; stroke([[x, y], [x + fade * 0.5, y + fade * 0.25]], 0.6, tone * 0.9); }
    }
    // a pine: a leaning trunk, flat masses of needles in layers
    function pine(x, by, ht, tone) { stroke([[x, by], [x + ht * 0.08, by - ht * 0.5], [x - ht * 0.05, by - ht]], Math.max(1, ht * 0.03), tone); for (let i = 0; i < 4; i++) { const yy = by - ht * (0.45 + i * 0.16), ww = ht * (0.32 - i * 0.05), xx = x + (i % 2 ? -1 : 1) * ht * 0.08; fill(xx - ww, yy - ht * 0.06, xx + ww, yy + ht * 0.04, (X, Y) => ((X - xx) / ww) ** 2 + ((Y - yy) / (ht * 0.05)) ** 2 <= 1, tone * 0.9); } }
    // a house: walls, a roof (thatched if thatch), a door
    function house(x0, x1, by, ht, tone, thatch) { fill(x0, by - ht * 0.55, x1, by, () => true, tone * 0.35); fill(x0 - ht * 0.15, by - ht, x1 + ht * 0.15, by - ht * 0.55, (x, y) => y >= by - ht + Math.abs(x - (x0 + x1) / 2) * (ht * 0.45) / ((x1 - x0) / 2 + ht * 0.15), (x, y) => tone * (thatch ? 0.6 + ((x + y) % 3 === 0 ? 0.15 : 0) : 0.8)); fill((x0 + x1) / 2 - ht * 0.1, by - ht * 0.35, (x0 + x1) / 2 + ht * 0.1, by, () => true, tone); }
    return { img, ink, fill, accent, stroke, disc, figure, hills, pine, house, w, h };
  }
  const VERMILION = [196, 64, 44], GOLD = [222, 168, 64], BLUE = [70, 110, 160], PINK = [214, 140, 140];
  // the ten compositions (geometry in fractions of the frame; vb is the sheet's top)
  const TALES = {
    1: { title: ['The Lamp at the Crossroads', '{辻|つじ} の {灯籠|とうろう}'], paint(Pn, vb) { const { w } = Pn, cx = w / 2, cy = vb * 0.62, u = vb;
      Pn.hills(vb * 0.3, vb * 0.05, 0.3, 1); Pn.hills(vb * 0.42, vb * 0.035, 0.45, 2, 0.08);
      // four roads meeting at the lamp, pale washes widening toward us, grass along their edges
      for (const [ex, ey, wd] of [[-0.05, 1.2, 0.07], [1.05, 1.2, 0.07], [0.18, 0.47, 0.012], [0.84, 0.47, 0.012]]) Pn.stroke([[w * ex, vb * ey], [cx, cy]], vb * wd, 0.16);
      for (let i = 0; i < 40; i++) { const t0 = (i * 0.61) % 1, side = i % 4, ex = [-0.05, 1.05, 0.18, 0.84][side], ey = [1.2, 1.2, 0.47, 0.47][side], x = lerp(w * ex, cx, t0) + (i % 2 ? 6 : -6), y = lerp(vb * ey, cy, t0); Pn.stroke([[x, y], [x + 1, y - 4 * (1 - t0) - 1]], 0.5, 0.6); }
      // the stone lantern: base, post, platform, the firebox with its light, the curved roof, the jewel on top
      Pn.fill(cx - u * 0.055, cy - u * 0.03, cx + u * 0.055, cy, () => true, 0.7);
      Pn.fill(cx - u * 0.02, cy - u * 0.2, cx + u * 0.02, cy - u * 0.03, () => true, 0.62);
      Pn.fill(cx - u * 0.05, cy - u * 0.225, cx + u * 0.05, cy - u * 0.2, () => true, 0.78);
      Pn.fill(cx - u * 0.036, cy - u * 0.29, cx + u * 0.036, cy - u * 0.225, () => true, 0.82);
      Pn.accent(cx - u * 0.022, cy - u * 0.278, cx + u * 0.022, cy - u * 0.237, () => true, GOLD);
      Pn.fill(cx - u * 0.085, cy - u * 0.345, cx + u * 0.085, cy - u * 0.285, (x, y) => y > cy - u * 0.345 + Math.abs(x - cx) * 0.55 - Math.max(0, Math.abs(x - cx) - u * 0.06) * 0.9, 0.9);
      Pn.disc(cx, cy - u * 0.355, u * 0.013, 0.9);
      // the last traveller, small and going away up the north road (the far road at the right), as the line has it
      Pn.figure(w * 0.76, vb * 0.5, vb * 0.02, 0.5); }, glow: [0.5, 0.36] },
    2: { title: ['The Fox\'s Wedding', '{狐|きつね} の {嫁入|よめい}り'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.42, vb * 0.08, 0.3, 3, 0.2); Pn.disc(w * 0.82, vb * 0.18, vb * 0.07, 0.08);
      const tx = w * 0.78, ty = vb * 0.66; Pn.accent(tx - vb * 0.12, ty - vb * 0.34, tx + vb * 0.12, ty - vb * 0.3, () => true, VERMILION); Pn.accent(tx - vb * 0.09, ty - vb * 0.28, tx + vb * 0.09, ty - vb * 0.26, () => true, VERMILION); for (const dx of [-vb * 0.08, vb * 0.08]) Pn.accent(tx + dx - vb * 0.012, ty - vb * 0.3, tx + dx + vb * 0.012, ty, () => true, VERMILION);
      for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(w * 0.1, tx - vb * 0.04, u), y = lerp(vb * 0.8, ty - vb * 0.04, u); Pn.figure(x, y, vb * (0.04 - u * 0.02), 0.7); Pn.accent(x + vb * 0.02, y - vb * 0.08, x + vb * 0.03, y - vb * 0.065, () => true, [240, 150, 70]); }
      for (let i = 0; i < 70; i++) { const x = (i * 37) % w, y = (i * 53) % (vb * 0.9); Pn.stroke([[x, y], [x - vb * 0.02, y + vb * 0.06]], 0.5, 0.25); } }, glow: [0.5, 0.5] },
    3: { title: ['The Bell Before Dawn', '{夜明|よあ}け {前|まえ} の {鐘|かね}'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.5, vb * 0.12, 0.45, 4, 0.1); Pn.hills(vb * 0.62, vb * 0.05, 0.25, 5);
      const bx = w * 0.32, by = vb * 0.5; Pn.fill(bx - vb * 0.14, by - vb * 0.36, bx + vb * 0.14, by - vb * 0.3, (x, y) => y >= by - vb * 0.36 + Math.abs(x - bx) * 0.3, 0.85); for (const dx of [-vb * 0.1, vb * 0.1]) Pn.fill(bx + dx - 3, by - vb * 0.3, bx + dx + 3, by, () => true, 0.8); Pn.fill(bx - vb * 0.05, by - vb * 0.28, bx + vb * 0.05, by - vb * 0.14, (x, y) => Math.abs(x - bx) < vb * (0.035 + (y - (by - vb * 0.28)) / vb * 0.12), 0.7);
      Pn.accent(w * 0.5, vb * 0.08, w * 1, vb * 0.18, (x, y) => ((x * 3 + y * 5) % 4) < 2 && feather(x, y, w * 0.5, w, vb * 0.08, vb * 0.18), PINK); for (let i = 0; i < 6; i++) Pn.house(w * (0.5 + i * 0.08), w * (0.55 + i * 0.08), vb * 0.78 + (i % 2) * 6, vb * 0.08, 0.6, true); }, glow: [0.32, 0.4] },
    4: { title: ['The Borrowed Umbrella', '{借|か}りた {傘|かさ}'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.26, vb * 0.03, 0.18, 41);
      // the far roofs pale through the rain
      for (let i = 0; i < 5; i++) Pn.house(w * (0.46 + i * 0.105), w * (0.53 + i * 0.105), vb * 0.5 + (i % 2) * 4, vb * 0.13, 0.3, false);
      // the house close by: its wall, a lattice window, the deep eave and the dry shadow under it
      Pn.fill(0, vb * 0.3, w * 0.38, vb * 0.84, () => true, 0.22);
      Pn.fill(w * 0.05, vb * 0.4, w * 0.2, vb * 0.6, (x, y) => Math.round(x) % 6 === 0 || Math.round(y) % 6 === 0, 0.62);
      Pn.fill(0, vb * 0.18, w * 0.46, vb * 0.31, (x, y) => y > vb * 0.18 + (x / (w * 0.46)) * vb * 0.05, 0.86);
      Pn.fill(w * 0.36, vb * 0.31, w * 0.38, vb * 0.84, () => true, 0.8);
      Pn.fill(0, vb * 0.84, w, vb * 0.86, () => true, 0.3);
      // under the eave, the one who lent it; out in the rain, the one who borrowed it, under the red umbrella
      Pn.figure(w * 0.28, vb * 0.84, vb * 0.075, 0.82);
      const ux = w * 0.64, uy = vb * 0.6, ur = vb * 0.11;
      Pn.accent(ux - ur, uy - ur * 0.5, ux + ur, uy + 2, (x, y) => ((x - ux) / ur) ** 2 + ((y - uy) / (ur * 0.5)) ** 2 <= 1 && y <= uy, VERMILION);
      for (let i = -3; i <= 3; i++) Pn.stroke([[ux, uy - ur * 0.5], [ux + (i / 3) * ur, uy]], 0.5, 0.7);
      Pn.stroke([[ux, uy - ur * 0.55], [ux, uy + vb * 0.1]], 0.7, 0.85);
      Pn.figure(ux, vb * 0.84, vb * 0.075, 0.82);
      // the rain, long and slanting, and its rings on the ground
      for (let i = 0; i < 170; i++) { const x = (i * 41.3) % w, y = (i * 59.7) % (vb * 0.84); if (Math.abs(x - ux) < ur && y > uy - ur * 0.5 && y < vb * 0.84) continue; if (x < w * 0.46 && y > vb * 0.18 && y < vb * 0.84) continue; Pn.stroke([[x, y], [x - vb * 0.012, y + vb * 0.05]], 0.5, 0.4); }
      for (let i = 0; i < 9; i++) { const x = w * (0.42 + i * 0.065); Pn.stroke([[x - 3, vb * 0.85], [x + 3, vb * 0.85]], 0.4, 0.4); } }, glow: [0.64, 0.56] },
    5: { title: ['The Two Wells', '{二|ふた}つ の {井戸|いど}'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.3, vb * 0.05, 0.22, 6);
      Pn.house(w * 0.04, w * 0.28, vb * 0.6, vb * 0.26, 0.7, true); Pn.house(w * 0.72, w * 0.96, vb * 0.6, vb * 0.26, 0.7, true);
      for (const x of [w * 0.34, w * 0.66]) { Pn.fill(x - vb * 0.06, vb * 0.62, x + vb * 0.06, vb * 0.72, () => true, 0.6); Pn.accent(x - vb * 0.045, vb * 0.62, x + vb * 0.045, vb * 0.64, () => true, BLUE); for (const dx of [-vb * 0.05, vb * 0.05]) Pn.fill(x + dx - 2, vb * 0.46, x + dx + 2, vb * 0.62, () => true, 0.8); Pn.fill(x - vb * 0.07, vb * 0.44, x + vb * 0.07, vb * 0.47, () => true, 0.85); }
      Pn.fill(w * 0.46, vb * 0.66, w * 0.54, vb * 0.74, (x, y) => ((x - w / 2) / (w * 0.04)) ** 2 + ((y - vb * 0.7) / (vb * 0.04)) ** 2 <= 1, 0.85); for (let i = 0; i < 4; i++) Pn.stroke([[w * 0.49 + i * 3, vb * 0.64], [w * 0.5 + i * 3 + Math.sin(i) * 6, vb * 0.46]], 0.6, 0.2);
      Pn.figure(w * 0.4, vb * 0.8, vb * 0.05, 0.75); Pn.figure(w * 0.6, vb * 0.8, vb * 0.05, 0.75); }, glow: [0.5, 0.62] },
    6: { title: ['The Toll That Changed', '{変|か}わった {通行料|つうこうりょう}'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.3, vb * 0.14, 0.4, 7, 0.08); Pn.stroke([[w * 0.5, vb * 0.9], [w * 0.55, vb * 0.6], [w * 0.62, vb * 0.36], [w * 0.7, vb * 0.22]], vb * 0.02, 0.3);
      const gx = w * 0.5, gy = vb * 0.66; for (const dx of [-vb * 0.16, vb * 0.16]) Pn.fill(gx + dx - 3, gy - vb * 0.34, gx + dx + 3, gy, () => true, 0.85); Pn.fill(gx - vb * 0.2, gy - vb * 0.36, gx + vb * 0.2, gy - vb * 0.32, () => true, 0.9); Pn.fill(gx - vb * 0.12, gy - vb * 0.24, gx - vb * 0.04, gy - vb * 0.14, () => true, 0.4);
      Pn.accent(gx + vb * 0.18, gy - vb * 0.3, gx + vb * 0.22, gy - vb * 0.24, () => true, GOLD); Pn.accent(w * 0.5, vb * 0.03, w, vb * 0.11, (x, y) => ((x + y) % 3) === 0 && feather(x, y, w * 0.5, w, vb * 0.03, vb * 0.11), PINK);
      Pn.figure(w * 0.64, vb * 0.44, vb * 0.03, 0.7); Pn.figure(w * 0.3, vb * 0.8, vb * 0.05, 0.75); }, glow: [0.6, 0.4] },
    7: { title: ['The House That Remembers', '{覚|おぼ}えて いる {家|いえ}'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.26, vb * 0.06, 0.2, 8); Pn.house(w * 0.2, w * 0.62, vb * 0.66, vb * 0.46, 0.75, true);
      Pn.accent(w * 0.39, vb * 0.46, w * 0.43, vb * 0.66, () => true, GOLD); for (let i = 0; i < 40; i++) { const x = (i * 29) % w, y = (i * 43) % vb; Pn.disc(x, y, 1, 0.15); }
      Pn.stroke([[w * 0.41, vb * 0.68], [w * 0.55, vb * 0.8], [w * 0.8, vb * 0.86]], vb * 0.015, 0.25); Pn.figure(w * 0.72, vb * 0.84, vb * 0.04, 0.8); Pn.pine(w * 0.86, vb * 0.7, vb * 0.4, 0.7); }, glow: [0.41, 0.56] },
    8: { title: ['Three Witnesses at the Inn', '{宿|やど} の {三人|さんにん} の {証人|しょうにん}'], paint(Pn, vb) { const { w } = Pn, g6 = Math.max(5, Math.round(vb * 0.075));
      // the inn's room: the beam above, the paper wall with its lattice, two posts, the mats
      Pn.fill(0, 0, w, vb * 0.12, () => true, 0.78);
      Pn.fill(0, vb * 0.12, w, vb * 0.6, () => true, 0.08);
      Pn.fill(0, vb * 0.12, w, vb * 0.6, (x, y) => Math.round(x) % g6 === 0 || Math.round(y - vb * 0.12) % Math.round(g6 * 1.3) === 0, 0.42);
      for (const x of [w * 0.06, w * 0.94]) Pn.fill(x - w * 0.018, 0, x + w * 0.018, vb * 0.64, () => true, 0.85);
      Pn.fill(0, vb * 0.6, w, vb * 0.64, () => true, 0.6);
      Pn.fill(0, vb * 0.64, w, vb * 0.95, (x, y) => true, (x, y) => (Math.round(x) % Math.round(w * 0.25) < 2 ? 0.5 : 0.2));
      // the lamp in its paper frame at the right
      const lx = w * 0.86; Pn.fill(lx - vb * 0.04, vb * 0.38, lx + vb * 0.04, vb * 0.6, (x, y) => Math.abs(x - lx) > vb * 0.034 || y < vb * 0.39, 0.85); Pn.accent(lx - vb * 0.032, vb * 0.395, lx + vb * 0.032, vb * 0.6, () => true, GOLD);
      Pn.fill(lx - vb * 0.012, vb * 0.6, lx + vb * 0.012, vb * 0.66, () => true, 0.8);
      // the three witnesses kneeling in a row, a low table before them, a cup each
      for (let i = 0; i < 3; i++) { const x = w * (0.26 + i * 0.2); Pn.disc(x, vb * 0.47, vb * 0.034, 0.86); Pn.fill(x - vb * 0.075, vb * 0.5, x + vb * 0.075, vb * 0.7, (X, Y) => ((X - x) / (vb * 0.075)) ** 2 + ((Y - vb * 0.7) / (vb * 0.19)) ** 2 <= 1, 0.72 + i * 0.04); }
      Pn.fill(w * 0.2, vb * 0.74, w * 0.72, vb * 0.775, () => true, 0.82); for (const x of [w * 0.22, w * 0.7]) Pn.fill(x - 2, vb * 0.775, x + 2, vb * 0.83, () => true, 0.8);
      for (let i = 0; i < 3; i++) { const x = w * (0.26 + i * 0.2); Pn.fill(x - 3, vb * 0.715, x + 3, vb * 0.74, () => true, 0.55); } }, glow: [0.86, 0.5] },
    9: { title: ['The Crane\'s Return', '{鶴|つる} の {恩返|おんがえ}し'], paint(Pn, vb) { const { w } = Pn;
      Pn.hills(vb * 0.56, vb * 0.04, 0.12, 9, 0.2); Pn.house(w * 0.06, w * 0.3, vb * 0.74, vb * 0.24, 0.65, true); Pn.accent(w * 0.14, vb * 0.6, w * 0.2, vb * 0.66, () => true, GOLD);
      const cx = w * 0.62, cy = vb * 0.3, s = vb * 0.1; Pn.fill(cx - s * 2.6, cy - s, cx + s * 2.6, cy + s * 0.5, (x, y) => Math.abs(y - cy + Math.abs(x - cx) * 0.18) < s * 0.16 * (1 - Math.abs(x - cx) / (s * 2.7)) + 1, 0.06); for (const sx of [-1, 1]) Pn.fill(cx + sx * s * 1.8, cy - s * 0.6, cx + sx * s * 2.7, cy + s * 0.2, (x, y) => Math.abs(y - cy + Math.abs(x - cx) * 0.18) < s * 0.14, 0.85);
      Pn.fill(cx - s * 0.5, cy - s * 0.2, cx + s * 0.6, cy + s * 0.25, (x, y) => ((x - cx) / (s * 0.55)) ** 2 + ((y - cy) / (s * 0.2)) ** 2 <= 1, 0.04); Pn.stroke([[cx + s * 0.5, cy], [cx + s * 1.3, cy - s * 0.2]], 1, 0.7); Pn.accent(cx + s * 1.25, cy - s * 0.28, cx + s * 1.36, cy - s * 0.18, () => true, VERMILION);
      for (let i = 0; i < 60; i++) Pn.disc((i * 47) % w, (i * 31) % vb, 1, 0.08); }, glow: [0.62, 0.3] },
    10: { title: ['The Hundredth Tale', '{百話目|ひゃくわめ} の {話|はなし}'], paint(Pn, vb) { const { w } = Pn, cx = w / 2, hz = vb * 0.42;
      // the Hall at night: the dark coming down from the roof, the floor paler with the lamps' light on it
      Pn.fill(0, 0, w, vb, () => true, (x, y) => (y < hz ? 0.82 - (y / hz) * 0.22 : 0.5 - Math.min(0.2, (y - hz) / vb * 0.5)));
      // the pillars in two rows going away, and the lamps between them, every one of them lit
      let n = 0;
      for (const z of [1, 1.45, 2.1, 3, 4.3, 6.2]) {
        for (const side of [-1, 1]) {
          const x = cx + (side * w * 0.42) / z, top = hz - (vb * 0.6) / z, bot = hz + (vb * 0.42) / z, pw = Math.max(1, (w * 0.022) / z);
          Pn.fill(x - pw, Math.max(0, top), x + pw, bot, () => true, 0.95);
          for (let j = 0; j < 8 && n < 99; j++, n++) { const lx = x - side * ((j + 1) * (w * 0.045)) / z, ly = hz + ((vb * 0.3) / z) * (j % 2 ? 0.6 : 0.2) - (vb * 0.05) / z, r = Math.max(1, 2.2 / z); if (Math.abs(lx - cx) < 4) continue; Pn.accent(lx - r, ly - r * 1.4, lx + r, ly + r, () => true, GOLD); }
        }
      }
      // the hundredth lantern, close: the standing lamp you set the wick in (hall.w10.t10), its paper burning gold
      const ax = cx - w * 0.12, ay = vb * 0.9, ah = vb * 0.26, aw = vb * 0.1;
      Pn.fill(ax - aw * 0.55, ay - ah, ax + aw * 0.55, ay - ah * 0.34, () => true, 0.92);
      Pn.accent(ax - aw * 0.42, ay - ah * 0.94, ax + aw * 0.42, ay - ah * 0.4, () => true, [255, 236, 170]);
      Pn.stroke([[ax - aw * 0.42, ay - ah * 0.67], [ax + aw * 0.42, ay - ah * 0.67]], 0.6, 0.7);
      for (const sx of [-1, 1]) Pn.stroke([[ax + sx * aw * 0.5, ay - ah * 0.34], [ax + sx * aw * 0.62, ay]], 1, 0.95);
      // and what appears after the hundredth tale: the teller's shadow, cast by it, tall and faint on the right
      Pn.figure(cx + w * 0.3, vb * 0.98, vb * 0.26, 0.48); }, glow: [0.38, 0.72] },
  };
  // a wash of dawn colour feathered out at its left end and its top and bottom (it was a hard-edged band; AR-1)
  function feather(x, y, x0, x1, y0, y1) {
    const u = (x - x0) / (x1 - x0), v = Math.abs((y - y0) / (y1 - y0) - 0.5) * 2;
    return P().bayer(x, y) < Math.min(1, u * 1.6) * (1 - v * v);
  }
  // the seal in the corner: a red square of shapes (never a letter)
  function seal(Pn, x, y, sz) { Pn.accent(x, y, x + sz, y + sz, (X, Y) => X === Math.floor(x) || Y === Math.floor(y) || X === Math.floor(x + sz - 1) || Y === Math.floor(y + sz - 1) || (((X - x) * 3 + (Y - y) * 5) % 7 === 0 && X > x + 2 && Y > y + 2 && X < x + sz - 3 && Y < y + sz - 3), VERMILION); }
  // a tale's picture at four stages of inking in (k → the nearest stage), cached
  function talePicture(n, w, h, vb, stage4) {
    return cached('hall.w' + n + '|' + w + 'x' + h + '|' + vb + '|' + stage4, () => {
      const Pn = painter(w, h);
      TALES[n].paint(Pn, vb);
      seal(Pn, w - Math.round(vb * 0.12), Math.round(vb * 0.06), Math.max(6, Math.round(vb * 0.06)));
      // the ink comes in from the middle outward: hide what the stage has not reached yet (back to paper)
      if (stage4 < 4) {
        const d = Pn.img.data, rnd = P().rnd(5);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const r = Math.hypot((x - w / 2) / w, (y - vb / 2) / vb) * 1.6 + rnd() * 0.25;
          if (r > stage4 / 4) { const o = (y * w + x) * 4; d[o] = PAPER[0]; d[o + 1] = PAPER[1]; d[o + 2] = PAPER[2]; }
        }
      }
      const cv = mk(w, h); cv.getContext('2d').putImageData(Pn.img, 0, 0);
      return { cv };
    });
  }
  for (const n of Object.keys(TALES)) {
    const D = TALES[n];
    RB.sequence.define('hall.w' + n, {
      page: false, title: { en: D.title[0], jp: D.title[1] }, chapter: 'post', scene: 'hall.w' + n + '.end',
      shots: {
        tale: {
          phases: [['ink', 1500]],
          safe: { wide: 'the picture above the sheet', narrow: 'the picture in the upper half', land: 'the picture' },
          draw(c, w, h, t, st) {
            const k = st.still ? 1 : st.at('ink'), stage4 = Math.max(1, Math.min(4, Math.ceil(k * 4)));
            c.drawImage(talePicture(n, w, h, Math.round(st.vb), stage4).cv, 0, 0);
            // the tale's own light breathing a little once inked
            if (k >= 1) SP.glow(c, Math.round(w * D.glow[0]), Math.round(st.vb * D.glow[1]), Math.round(Math.min(w, st.vb) * 0.18), '255,220,150', st.still ? 0.12 : 0.1 + Math.sin(t / 900) * 0.03);
          },
          focus(w, h, vb) { return { x: Math.round(w * 0.1), y: Math.round(vb * 0.06), w: Math.round(w * 0.8), h: Math.round(vb * 0.86) }; },
        },
      },
    });
  }

  // ==== Ashihara Shinden's first festival ===========================================================================
  function geomFest(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); }
  const NIGHT_G = { mul: [0.5, 0.48, 0.62], add: [6, 4, 14] };
  function villageStatic(G) {
    return cached('as.village|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, vb } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, h, ['#0a0c1c', '#10142a', '#181c36', '#22243e', '#2c2c44'], 0.45);
      SP.stars(g, 0, 0, w, Math.round(vb * 0.3), 50, 61, 7);
      const L = SP.layer(w, h), paddy = p.mat('#1e2a3a', { n: 6, at: 3, step: 0.08 }), hill = p.mat('#161c24', { n: 5, at: 2 }), thatch = p.mat('#4a3a2a', { n: 7, at: 3, step: 0.08 }), wall = p.mat('#3a3028', { n: 6, at: 3, step: 0.08 }),
        bark = p.mat('#2a2018', { n: 4, at: 2 }), pine = p.mat('#16221e', { n: 5, at: 2 }), road = p.mat('#3a3430', { n: 6, at: 3, step: 0.07 });
      L.fill(0, 0, w, h, (x, y) => y > vb * 0.4 - Math.max(0, x - w * 0.55) * 0.35, hill, (x, y) => cl(0.4 + dz(x, y, 0.06)));
      SP.water(L, 0, Math.round(vb * 0.64), w, h, paddy, { band: Math.max(3, s(6)), deep: 0.1, seed: 11 });
      // the road through the village, coming toward us at the left
      L.fill(0, Math.round(vb * 0.6), w, h, (x, y) => y < vb * 0.66 + Math.max(0, (w * 0.3 - x)) * 0.5, road, (x, y) => cl(0.36 + (y - vb * 0.6) / vb * 0.4 + dz(x, y, 0.06)));
      // the houses along it, thatched, their paper doors warm
      for (let i = 0; i < 6; i++) { const x = Math.round(w * (0.2 + i * 0.13)), y = Math.round(vb * 0.6 - (i % 2) * s(3)), sc = 1 - i * 0.06; L.rect(x - s(16 * sc), y - s(14 * sc), s(32 * sc), s(14 * sc), wall, (xx, yy) => cl(0.4 + (xx > x ? -0.1 : 0.05) + dz(xx, yy, 0.05))); L.fill(x - s(24 * sc), y - s(36 * sc), x + s(24 * sc), y - s(12 * sc), (xx, yy) => yy >= y - s(36 * sc) + Math.abs(xx - x) * 0.95, thatch, (xx, yy) => cl(0.42 + (xx > x ? -0.12 : 0.08) + ((xx + yy * 2) % 4 === 0 ? 0.1 : 0) + dz(xx, yy, 0.05))); }
      // the lone pine at the top of the slope
      const px = Math.round(w * 0.88), py = Math.round(vb * 0.3);
      L.path([[px, py + s(30), s(4)], [px - s(4), py, s(3)], [px - s(10), py - s(20), s(2)]], s(3), bark, 0.4);
      SP.crown(L, px - s(10), py - s(24), s(26), s(10), pine, { n: 6, seed: 2 });
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      for (let i = 0; i < 6; i++) { const x = Math.round(w * (0.2 + i * 0.13)), y = Math.round(vb * 0.6 - (i % 2) * s(3)), sc = 1 - i * 0.06; R(g, x - s(5 * sc), y - s(11 * sc), s(10 * sc), s(9 * sc), i % 2 ? '#e8a860' : '#f0b870'); R(g, x - 1, y - s(11 * sc), 1, s(9 * sc), '#7a5030'); }
      // the foreground: the eave of the nearest house over us at the top left, its post
      g.fillStyle = '#0e0c10'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.46, 0); g.lineTo(w * 0.4, vb * 0.1); g.lineTo(0, vb * 0.15); g.closePath(); g.fill();
      g.fillStyle = '#3a2e30'; g.beginPath(); g.moveTo(0, vb * 0.15); g.lineTo(w * 0.4, vb * 0.1); g.lineTo(w * 0.4, vb * 0.1 + 1); g.lineTo(0, vb * 0.15 + 1); g.closePath(); g.fill();
      R(g, 0, 0, Math.max(3, s(7)), h, '#0e0c10');
      return { cv };
    });
  }
  // the line the lanterns hang along, close by to far off: a quadratic through three points [x, y, scale]
  function lanternLine(way, w, vb) {
    const P3 = way === 'hill' ? [[w * 0.1, vb * 0.46, 1.5], [w * 0.52, vb * 0.52, 0.85], [w * 0.86, vb * 0.3, 0.45]] : way === 'canal' ? [[w * 0.06, vb * 0.6, 1.6], [w * 0.42, vb * 0.6, 0.9], [w * 0.96, vb * 0.58, 0.42]] : [[w * 0.08, vb * 0.36, 1.6], [w * 0.5, vb * 0.46, 0.85], [w * 0.96, vb * 0.5, 0.42]];
    const out = [];
    for (let i = 0; i < 18; i++) { const u = i / 17, v = 1 - u; out.push([0, 1, 2].map((k) => v * v * P3[0][k] + 2 * v * u * P3[1][k] + u * u * P3[2][k])); }
    return out;
  }
  // Kotoe's pupils, for the night's 'pupils' phase (RBN-QA-177): four children of the village in their festival best
  const PUPILS = [
    { size: 'child', skin: 1, hair: 'short', hairColor: 0, cloth: ['#3a5a8a', '#2e4870', '#e8dcc0'], shape: 'tunic', acc: [] },
    { size: 'child', skin: 2, hair: 'bob', hairColor: 1, cloth: ['#a84a4a', '#8a3a3a', '#f0e0c0'], shape: 'tunic', acc: [] },
    { size: 'child', skin: 2, hair: 'short', hairColor: 3, cloth: ['#c8783a', '#a8602c', '#f0e0c0'], shape: 'tunic', acc: [] },
    { size: 'child', skin: 3, hair: 'bob', hairColor: 0, cloth: ['#5a7a4a', '#46623a', '#e8dcc0'], shape: 'tunic', acc: [] },
  ];
  const night = {
    phases: [['light', 1500], ['pupils', 900]],
    safe: { wide: 'the village and its lanterns above the sheet', narrow: 'the lanterns in the upper half', land: 'the lanterns' },
    draw(c, w, h, t, st) {
      const G = geomFest(w, h, st.vb), { s } = G, still = st.still, vb = st.vb;
      c.drawImage(villageStatic(G).cv, 0, 0);
      const kl = st.at('light'), way = st.test('var.as_lan=canal') ? 'canal' : st.test('var.as_lan=hill') ? 'hill' : 'street';
      const pts = lanternLine(way, w, vb);
      // the cord between them, then the lanterns lit one after another from the near end
      for (let i = 1; i < pts.length; i++) { const [ax, ay, as] = pts[i - 1], [bx, by] = pts[i]; for (let j = 0; j <= 8; j++) { const u = j / 8; R(c, lerp(ax, bx, u), lerp(ay, by, u) - s(10) * as + Math.sin(u * Math.PI) * s(3) * as, 1, 1, '#2a2024'); } }
      pts.forEach(([x, y, sc], i) => {
        const on = still || kl * 18 - i > 0.5;
        SP.lantern(c, Math.round(x), Math.round(y - s(10) * sc), Math.max(2, Math.round(s(3.4) * sc)), Math.max(3, Math.round(s(7) * sc)), on, t, still);
        if (way === 'canal' && on) for (let j = 0; j < 4; j++) R(c, Math.round(x - 1 + (still ? 0 : Math.sin(t / 300 + i + j))), Math.round(vb * 0.68 + (y - vb * 0.58) * 0.3 + j * s(3) * sc), Math.max(2, Math.round(3 * sc)), 1, 'rgba(255,190,110,' + (0.6 - j * 0.12).toFixed(2) + ')');
      });
      // villagers on their way along the road (Kotoe, once her pupils are up, is with them: below)
      const rnd = P().rnd(5), withPupils = st.at('pupils') > 0 && st.test('as_kotoe');
      for (const [id, u] of [['as_taki', 0.32], ['as_yoshizo', 0.36], ['as_kotoe', 0.62]]) {
        if (id === 'as_kotoe' && withPupils) { rnd(); continue; } const x = w * (0.18 + u * 0.7), y = vb * (0.66 - u * 0.06), sc = clamp(0.9 - u * 0.5, 0.4, 0.9), f = Q.figure(look(id), 'right', still ? 'i0' : 'w' + (Math.floor(t / 240 + rnd() * 4) % 4), sc, NIGHT_G); if (f) c.drawImage(f.cv, Math.round(x - f.ax + (still ? 0 : ((t / 120) % (w * 0.05)))), Math.round(y - f.ay)); }
      if (way === 'canal') SP.glints(c, 0, Math.round(vb * 0.66), w, Math.round(vb * 0.3), t, 24, 9, '255,190,120', still);
      // Kotoe's pupils, only with her school (RBN-QA-177): with Kotoe at the roadside, on the road where it comes toward us
      // at the left (never on the paddies), each holding up a sheet of the letters they have just learned, and singing.
      // The sheets show brush strokes, never letters (the names on them are the player's own, and nothing in these
      // pictures is lettered).
      const kp = st.at('pupils');
      if (kp > 0 && st.test('as_kotoe')) {
        const e = ease(kp), up = Math.round((1 - e) * s(4));
        // the road's near edge at x: vb·0.66, widening toward us left of w·0.3 (villageStatic); feet inside it
        const feet = (x) => Math.round(vb * 0.652 + Math.max(0, w * 0.3 - x) * 0.4);
        const sc = (x) => clamp(0.92 - x / w, 0.6, 0.9);
        const kx = Math.round(w * 0.07), kf = Q.figure(look('as_kotoe'), 'right', 'i0', sc(kx), NIGHT_G);
        if (kf) c.drawImage(kf.cv, Math.round(kx - kf.ax), feet(kx) + up - kf.ay);
        PUPILS.forEach((lk, i) => {
          const x = Math.round(w * (0.13 + i * 0.065)), y = feet(x) + up, sing = still ? 0 : Math.round(Math.max(0, Math.sin(t / 380 + i * 1.7)) * 1);
          const f = Q.figure(lk, 'down', 'i0', sc(x), NIGHT_G);
          if (!f) return;
          c.drawImage(f.cv, Math.round(x - f.ax), y - f.ay - sing);
          // the sheet, held up in front: lantern-lit paper with a few strokes of ink
          const pw = Math.max(5, s(11)), ph = Math.max(4, s(8)), px = x - (pw >> 1), py = y - f.ay - sing + Math.round(f.h * 0.42);
          R(c, px, py, pw, ph, '#e8d8b0'); R(c, px, py, pw, 1, '#f4ead0'); R(c, px, py + ph - 1, pw, 1, '#b89a70');
          for (let k = 0; k < 3; k++) { const ly = py + 2 + k * Math.max(1, Math.round(ph / 3.2)); if (ly < py + ph - 1) R(c, px + 2, ly, Math.max(1, pw - 4 - ((i + k) % 3) * 2), 1, '#2a2024'); }
        });
      }
    },
    focus(w, h, vb) { return { x: Math.round(w * 0.06), y: Math.round(vb * 0.24), w: Math.round(w * 0.9), h: Math.round(vb * 0.5) }; },
  };
  // round the fire: the villagers dancing in a ring (Yoshizō and Taki side by side), Shō keeping time on a cooking pot,
  // lanterns strung overhead; then Mitsue holding out the planting hat
  const DANCERS = ['as_mitsue', 'as_yoshizo', 'as_taki', 'as_natsu', 'as_kotoe', 'as_mohei'];
  const FIRE_G = (side) => ({ mul: [0.78, 0.6, 0.5], add: [26, 8, 0], rim: { side, col: '#ffb060', k: [0.5, 0.24] } });
  // the ring's turn when it came to rest (the 'settle' phase): kept through the gift, forgotten when the dance plays again
  let restTurn = null;
  const fire = {
    phases: [['dance', 1200], ['settle', 900], ['gift', 900]],
    safe: { wide: 'the fire and the ring of dancers above the sheet', narrow: 'the fire in the upper half', land: 'the fire' },
    draw(c, w, h, t, st) {
      const G = geomFest(w, h, st.vb), { s } = G, still = st.still, vb = st.vb;
      const fx = Math.round(w / 2), fy = Math.round(vb * 0.64), rx = Math.round(w * (G.narrow ? 0.4 : 0.27)), ry = Math.round(vb * 0.13);
      const B = cached('as.fireground|' + w + 'x' + h + '|' + vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d'), p = P();
        g.imageSmoothingEnabled = false;
        Q.bandsIn(g, 0, 0, w, h, ['#0a0c1c', '#12142a', '#1c1a30', '#2a2230'], 0.45);
        SP.stars(g, 0, 0, w, Math.round(vb * 0.3), 40, 71, 5);
        const L = SP.layer(w, h), earth = p.mat('#5a4434', { n: 8, at: 4, step: 0.07 }), trees = p.mat('#141a1a', { n: 4, at: 2 }), thatch = p.mat('#3a2e24', { n: 5, at: 2, step: 0.08 });
        // the treeline and two roofs behind, then the trampled ground lit by the fire, darker away from it
        L.fill(0, 0, w, h, (x, y) => y > vb * 0.36 + Math.sin(x / s(9)) * s(3) + Math.sin(x / s(23)) * s(6), trees, 0.5);
        for (const x0 of [w * 0.14, w * 0.8]) L.fill(x0 - s(30), vb * 0.3, x0 + s(30), vb * 0.42, (x, y) => y >= vb * 0.3 + Math.abs(x - x0) * 0.4, thatch, 0.4);
        L.fill(0, Math.round(vb * 0.44), w, h, () => true, earth, (x, y) => { const d = Math.hypot((x - fx) / (rx * 1.6), (y - fy) / (ry * 2.2)); return cl(0.12 + Math.max(0, 1 - d) * 0.6 + (hash(Math.floor(x / s(3)) * 7 + Math.floor(y / s(2)) * 3) - 0.5) * 0.08 + dz(x, y, 0.08)); });
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        return { cv };
      });
      c.drawImage(B.cv, 0, 0);
      SP.glow(c, fx, fy - s(16), Math.round(Math.min(w, vb) * 0.55), '255,150,70', 0.26 + (still ? 0 : Math.sin(t / 300) * 0.03));
      // the lanterns strung across overhead
      for (let i = 0; i < 9; i++) { const u = i / 8, x = w * (0.04 + u * 0.92), y = vb * 0.06 + Math.sin(u * Math.PI) * vb * 0.1; SP.lantern(c, Math.round(x), Math.round(y), Math.max(2, s(4)), Math.max(3, s(8)), true, t, still); }
      // the ring, turning slowly: the far half, the fire, the near half. Once it settles ('settle', then the gift: "Last of
      // all, everyone gathers round the fire"; RBN-QA-177) it stops where it is, and everyone stands still, facing the fire.
      const settled = st.at('settle') > 0;
      let turn = still ? 0.4 : (t / 11000) * Math.PI * 2;
      if (settled && !still) { if (restTurn == null) restTurn = turn; turn = restTurn; } else if (!settled) restTurn = null;
      const ring = DANCERS.map((id, i) => { const a = turn + (i / DANCERS.length) * Math.PI * 2 + (i === 2 ? -0.35 : 0); return { id, x: fx + Math.cos(a) * rx, y: fy + Math.sin(a) * ry, a }; });
      const toFire = (r) => (Math.abs(Math.cos(r.a)) > 0.75 ? (r.x < fx ? 'right' : 'left') : r.y > fy ? 'up' : 'down');
      const fig = (r) => {
        const sc = clamp(0.78 + ((r.y - fy) / ry) * 0.18, 0.55, 1);
        const f = settled ? Q.figure(look(r.id), toFire(r), 'i0', sc, FIRE_G(r.x < fx ? 'r' : 'l')) : Q.figure(look(r.id), Math.sin(r.a) > 0 ? 'right' : 'left', still ? 'i0' : 'w' + (Math.floor(t / 200 + r.x) % 4), sc, FIRE_G(r.x < fx ? 'r' : 'l'));
        if (f) c.drawImage(f.cv, Math.round(r.x - f.ax), Math.round(r.y - f.ay - (still || settled ? 0 : Math.abs(Math.sin(t / 200 + r.x)) * 2)));
      };
      ring.filter((r) => r.y < fy).forEach(fig);
      // the fire: a cone of logs, tongues of flame over it, sparks going up
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, bx = fx + Math.cos(a) * s(16), by = fy + Math.sin(a) * s(5); for (let j = 0; j <= s(24); j++) { const u = j / s(24); R(c, lerp(bx, fx, u), lerp(by, fy - s(24), u), Math.max(2, s(3)), 1, i % 2 ? '#3a2418' : '#4a2e1c'); } }
      for (let i = 0; i < 9; i++) { const fl = still ? 0 : Math.sin(t / (80 + i * 11) + i * 2) * s(4), hh = s(18) + (hash(i) * s(16)) + fl - Math.abs(i - 4) * s(2), x0 = fx - s(16) + i * s(4); for (let j = 0; j < hh; j++) { const v = j / hh, wd = Math.max(1, Math.round(s(4) * (1 - v) + (v < 0.2 ? s(1) : 0))); R(c, x0 + (still ? 0 : Math.sin(t / 120 + j * 0.3 + i) * v * s(2)), fy - s(2) - j, wd, 1, v < 0.25 && Math.abs(i - 4) < 3 ? '#fff0b0' : v < 0.6 ? '#ffb040' : '#f06a2a'); } }
      const rs = P().rnd(17);
      for (let i = 0; i < 26; i++) { const ph = rs(), u = still ? ph : (t / (1600 + ph * 1600) + ph) % 1; if (u > 0.85) continue; R(c, fx + (rs() - 0.5) * s(30) + Math.sin(u * 7 + ph * 9) * s(5), fy - s(20) - u * vb * 0.45, 1, 1, u < 0.4 ? '#ffd080' : '#f07030'); }
      ring.filter((r) => r.y >= fy).forEach(fig);
      // Shō at the left, close, keeping time on the cooking pot
      const sx = Math.round(w * (G.narrow ? 0.16 : 0.12)), sy = Math.round(vb * 0.86), sf = Q.figure(look('as_sho'), 'right', 'i0', 1, FIRE_G('r'));
      if (sf) c.drawImage(sf.cv, Math.round(sx - sf.ax), Math.round(sy - sf.ay));
      const beat = still || settled ? 0 : Math.max(0, Math.sin(t / 160)) * s(3);
      R(c, sx + s(10), sy - s(9), s(16), s(9), '#2a2626'); R(c, sx + s(9), sy - s(10), s(18), s(2), '#4a4444'); R(c, sx + s(12), sy - s(9), s(12), 1, '#8a6a50');
      R(c, sx + s(6), sy - s(16) - beat, s(8), Math.max(1, s(1.5)), '#6a5038');
      // the gift: Mitsue holds out the planting hat
      const kg = st.at('gift');
      if (kg > 0) {
        const bx = Math.round(w * (G.narrow ? 0.7 : 0.76)), by = Math.max(Math.round(vb + s(10)), 98), bx1 = Math.round(bx + (1 - ease(kg)) * s(10));
        // the hat, held up beside her: a wide shallow cone of woven sedge, its cord hanging (her arm up to its brim)
        const hx = bx - s(G.narrow ? 30 : 42), hy = by - s(44) + Math.round((1 - ease(kg)) * s(6)), hw = s(G.narrow ? 20 : 26), hh = s(10);
        const b = Q.bust('as_mitsue', 'smile', null, { mul: [0.9, 0.78, 0.66], add: [16, 6, 0], rim: { side: 'l', col: '#ffb060', k: [0.42, 0.2] } }, true, 200, Q.holdArms(bx1, by, [hx + Math.round(hw * 0.4), hy + hh + 2], null, true));
        if (b) c.drawImage(b.cv, bx1 - b.ax, by - b.ay);
        for (let j = 0; j < hh; j++) { const half = Math.round(hw * (0.12 + (j / hh) * 0.88)); for (let x = -half; x <= half; x++) R(c, hx + x, hy + j, 1, 1, (x + j * 2) % 5 === 0 ? '#a8884a' : x < 0 ? '#e0c078' : '#c8a860'); }
        R(c, hx - hw, hy + hh, hw * 2, 1, '#8a6a3a');
        for (let j = 0; j < s(10); j++) R(c, hx + Math.round(Math.sin(j / 3) * 2), hy + hh + j, 1, 1, '#6a4a2a');
      }
    },
    focus(w, h, vb) { const G = geomFest(w, h, vb), rx = Math.round(w * (G.narrow ? 0.4 : 0.27)); return { x: Math.round(w / 2 - rx - G.s(12)), y: Math.round(vb * 0.36), w: rx * 2 + G.s(24), h: Math.round(vb * 0.42) }; },
  };
  RB.sequence.define('as.festival', {
    page: false, title: { en: 'The First Festival', jp: '{最初|さいしょ} の {祭|まつ}り' }, chapter: 'post', scene: 'as.festival',
    shots: { night, fire },
  });
})();
