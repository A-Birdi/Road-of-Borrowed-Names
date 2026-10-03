/* Chapter 1's illustrated sequence: the bridge reaches the far bank (`rw.bridge_scene`,
 * src/content/ch1/31_scenes_mill.js; docs/expressive/SHOTS.md §1). Late in the afternoon after the storm,
 * the river still high and brown; the low sun from the left. Five compositions:
 *   reach  from the near bank at the bridge's foot: the bridge in three-quarter view, its last span settling
 *          onto the far bank (the break the prologue showed closes, motes gathering into it); then the far
 *          hut's door slides open and a man in a hat steps out with a teacup (only on the line that says so)
 *   cup    along the bridge from the near end: Kōji walks toward us, the cup held level; at the left the
 *          teahouse door slides open and Tsuru comes from the square, far off
 *   hana   at the teahouse door, over Kōji's shoulder: Hana's hand stops on the frame; his cup lifts a little
 *   close  inside the doorway, close: Hana, the two cups she poured this morning on the counter behind her,
 *          Kōji's hand and cup at the edge: her head lowers and stays lowered, then lifts with a small smile
 *          as she reaches for the cups
 *   door   from the square: Kōji turns on the step and waves, the doors slide shut; the shōji glows
 * People are the game's own drawings (road sprites, Hana's portrait), graded into the light. Nothing here is
 * text: no letters are drawn into the pictures. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const SUN = { rim: { side: 'l', col: '#ffd49a', k: [0.45, 0.2] }, mul: [1, 0.95, 0.88], add: [6, 2, 0] };
  const step4 = (a) => Math.round(clamp(a, 0, 1) * 4) / 4; // stepped alpha (never a smooth blend)
  const WOOD = '#7a5638', BOARD = '#7a5232', POST = '#5e3e26';

  // ---- the sky after the storm, shared --------------------------------------------------------------
  function sky(g, w, yH, s, rnd, dusk) {
    Q.bandsIn(g, 0, 0, w, yH, dusk ? ['#363e68', '#444874', '#5a527a', '#7a5e80', '#a06c7c', '#c47e78', '#dc9a7e']
      : ['#4c5a8c', '#5a6898', '#6e78a2', '#8a86a6', '#a892a4', '#c49e98', '#dcae8e', '#ecc08e'], 0.45);
    const p = P();
    if (!dusk) {
      // the sun low on the left, behind the last of the cloud
      const sx = Math.round(w * 0.1), sy = Math.round(yH * 0.74), sr = Math.max(3, s(6));
      p.halo(g, sx, sy, sr * 7, '255,226,170', 0.3, 5);
      g.fillStyle = '#fff0cc'; p.disc(g, sx, sy, sr);
    }
    // the storm's clouds drawing off to the right: dark banks, their undersides lit warm
    const CL = p.layer(w, yH + s(4));
    const dark = p.mat(dusk ? '#4a4664' : '#5a5a78', { n: 6, at: 3, step: 0.07 });
    for (const [fx, fy, cw] of [[0.6, 0.2, 0.36], [0.92, 0.4, 0.26], [0.34, 0.46, 0.14], [0.78, 0.66, 0.18]]) {
      const cx = Math.round(w * fx), cy = Math.round(yH * fy), W2 = Math.round(w * cw / 2);
      for (let i = 0; i < 7; i++) {
        const ex = cx - W2 + Math.round((W2 * 2 * (i + 0.5)) / 7), er = Math.max(3, Math.round(W2 * (0.2 + 0.1 * Math.sin(i * 2.1 + fx * 7)))), ery = Math.max(2, Math.round(er * 0.5));
        CL.ell(ex, cy - Math.round(ery * 0.3), er, ery, dark, (x, y) => (y > cy + ery * 0.2 ? 0.95 : y > cy - ery * 0.1 ? 0.62 : 0.3 + (x < cx ? 0.12 : 0)));
      }
      CL.rect(cx - W2, cy, W2 * 2, Math.max(1, s(2)), dark, 0.95);
    }
    g.drawImage(CL.canvas(), 0, 0);
    for (let i = 0; i < 3; i++) { const bx = Math.round(w * (0.3 + rnd() * 0.3)), by = Math.round(yH * (0.3 + rnd() * 0.3)); R(g, bx - 2, by, 2, 1, '#3c3a4e'); R(g, bx, by + 1, 1, 1, '#3c3a4e'); R(g, bx + 1, by, 2, 1, '#3c3a4e'); }
    for (const [amp, f1, ph, col] of [[s(22), 0.11, 0.7, dusk ? '#6e6488' : '#9a8ea6'], [s(13), 0.07, 2.2, dusk ? '#58546e' : '#7c7a94']]) {
      for (let x = 0; x < w; x++) { const v = Math.sin(x / (w * f1) + ph) * 0.6 + Math.sin(x / (w * f1 * 0.37) + ph * 1.7) * 0.4; const t1 = Math.round(yH - amp * (0.55 + v * 0.45)); R(g, x, t1, 1, yH - t1, col); }
    }
  }
  // the river after the storm: brown, streaming, with lighter current lines and the odd branch
  const RIVER = ['#b49c7a', '#a08664', '#8e7454', '#7e6446', '#70583c', '#644e36', '#5a4630'];
  function river(c, x0, y0, w, h, t, still, seed, dir) {
    const rnd = P().rnd(seed || 913), H = Math.max(1, h);
    for (let n = 0; n < (w * h) / 420; n++) {
      const y = Math.round(y0 + Math.pow(rnd(), 1.1) * H), d = (y - y0) / H;
      const len = 2 + Math.round(d * 16), sp = (0.012 + d * 0.034) * (dir || 1), xr = rnd() * (w + 60);
      const x = Math.round(x0 + ((((xr - (still ? 0 : t * sp)) % (w + 60)) + w + 60) % (w + 60)) - 30);
      const a = still ? 0.28 : 0.16 + 0.22 * ((Math.sin(t / 900 + n) + 1) / 2);
      c.fillStyle = (d < 0.3 ? 'rgba(236,216,180,' : n % 3 ? 'rgba(200,170,128,' : 'rgba(80,58,38,') + a.toFixed(2) + ')';
      c.fillRect(x, y, len, 1);
      if (n % 47 === 0) { c.fillStyle = 'rgba(70,50,32,0.8)'; c.fillRect(x, y - 1, Math.max(2, len >> 1), 1); } // a branch carried down
    }
  }

  // ---- shot 1: the bridge reaches -------------------------------------------------------------------
  // The bridge in perspective from its near end N (our bank, lower left) to its far end F (by the hut):
  // a point z of the way across (0..1 in the world) sits at screen fraction sf(z) along N→F, and its parts
  // shrink as 1 / depth(z). Deck top band, the near beam under it, railings, piers in the water.
  function geomReach(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const yH = Math.round(vb * (lay === 'narrow' ? 0.3 : lay === 'land' ? 0.26 : 0.36));
    // a phone on its side: closer in, the bridge's far end and the hut (the near end off the frame)
    const N = lay === 'narrow' ? [w * 0.18, vb * 0.9] : lay === 'land' ? [w * -0.34, vb * 1.4] : [w * 0.22, vb * 0.9];
    const F = lay === 'narrow' ? [w * 0.86, yH + s(12)] : lay === 'land' ? [w * 0.6, yH + s(22)] : [w * 0.74, yH + s(10)];
    const big = lay === 'land' ? 1.7 : lay === 'narrow' ? 1.1 : 1;
    const DF = 3.4; // the far end is this many times further from us than the near end
    const depth = (z) => 1 + (DF - 1) * z;
    const sf = (z) => (1 - 1 / depth(z)) / (1 - 1 / DF);
    const arch = s(16) * big;
    const cl = (z) => { const u = sf(z); return [lerp(N[0], F[0], u), lerp(N[1], F[1], u) - (arch * Math.sin(Math.PI * z)) / depth(z) * 1.6]; };
    const sz = (z, n) => (n * big) / depth(z) * (DF / 2.2);
    const dw = (z) => sz(z, s(13)), fz = (z) => sz(z, s(10)), ph = (z) => sz(z, s(30)), wl = (z) => cl(z)[1] + fz(z) + sz(z, s(26));
    const hutW = Math.round(s(46) * big), hutH = Math.round(s(30) * big);
    const hut = { x: Math.round(F[0] + s(10) * big), y: Math.round(F[1] + s(2)), w: hutW, h: hutH };
    const BRK = 0.62; // where the prologue's bridge broke off (in the world)
    return Object.assign(S, { yH, N, F, big, arch, cl, dw, fz, ph, wl, sz, sf, hut, BRK });
  }
  function bridgePart(L, G, z0, z1) {
    const p = P(), { cl, dw, fz, ph, wl, sz, s } = G;
    const wood = p.mat(WOOD, { n: 6, at: 3, step: 0.085 }), wet = p.mat('#5a4230', { n: 5, at: 2, step: 0.08 });
    const zs = [];
    for (let i = 0; i <= 60; i++) zs.push(lerp(z0, z1, i / 60));
    const far = (z) => { const [x, y] = cl(z); return [x + dw(z) * 0.55, y - dw(z)]; };
    // piers (behind the beam), braced, standing in the current
    for (const z of [0.14, 0.34, 0.54, 0.74, 0.92]) {
      if (z < z0 - 0.001 || z > z1 + 0.001) continue;
      const [x, y] = cl(z), pw = Math.max(2, Math.round(sz(z, s(4)))), bot = wl(z) + Math.round(sz(z, s(4)));
      L.rect(x - pw, y + fz(z) - 1, pw, bot - y - fz(z), wet, (xx) => (xx < x - pw / 2 ? 0.8 : 0.3));
      const fx = Math.round(x + dw(z) * 0.5);
      L.rect(fx - pw, y - dw(z) + fz(z), pw, bot - y + dw(z) - fz(z) - 1, wet, 0.18);
      L.seg(x - pw / 2, y + fz(z) + 1, fx - pw / 2, bot - 2, Math.max(1, sz(z, s(1.6))), wet, 0.25);
    }
    // the far railing (behind the deck)
    for (let i = 0; i < zs.length; i += 4) { const z = zs[i], [x, y] = far(z), hh = ph(z) * 0.9; L.rect(x - 1, y - hh, Math.max(1, Math.round(sz(z, s(2)))), hh, wood, 1); }
    L.path(zs.map((z) => { const [x, y] = far(z); return [x, y - ph(z) * 0.9]; }), Math.max(1, s(1.4)), wood, 1);
    L.path(zs.map((z) => { const [x, y] = far(z); return [x, y - ph(z) * 0.45]; }), 1, wood, 0);
    // the deck top: planks across (a darker joint every so often), lit from the left
    const top = zs.map((z) => cl(z)).concat(zs.slice().reverse().map((z) => far(z)));
    L.poly(top, wood, (x, y) => 0.84 - ((Math.round(x * 0.5 + y) % 5) === 0 ? 0.12 : 0));
    for (let i = 0; i < zs.length; i += 2) { const a = cl(zs[i]), b = far(zs[i]); L.line(a[0], a[1] - 1, b[0], b[1], wood, 2); }
    // the near beam under the deck's edge, in its own shadow
    const beam = zs.map((z) => cl(z)).concat(zs.slice().reverse().map((z) => { const [x, y] = cl(z); return [x, y + fz(z)]; }));
    L.poly(beam, wood, (x, y) => 0.32 - (Math.round(x) % 11 === 0 ? 0.14 : 0));
    L.path(zs.map((z) => cl(z)), Math.max(1, s(1.2)), wood, 5);
    // the near railing: posts with caps, then the top and middle rails
    for (let i = 0; i < zs.length; i += 4) {
      const z = zs[i], [x, y] = cl(z), hh = ph(z), pw = Math.max(2, Math.round(sz(z, s(3.5))));
      L.rect(x - 1, y - hh, pw, hh + 1, wood, (xx) => (xx < x + pw * 0.4 ? 0.9 : 0.42));
      L.rect(x - 2, y - hh - Math.max(1, Math.round(sz(z, s(2)))), pw + 2, Math.max(1, Math.round(sz(z, s(2)))), wood, 4);
    }
    L.path(zs.map((z) => { const [x, y] = cl(z); return [x, y - ph(z)]; }), Math.max(1, sz(0.5, s(2.4))), wood, 0.95);
    L.path(zs.map((z) => { const [x, y] = cl(z); return [x, y - ph(z) * 0.5]; }), Math.max(1, sz(0.5, s(1.6))), wood, 0.6);
  }
  function reachStatic(G) {
    return cached('ch1.reach|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, yH, N, hut, s, cl, wl, big } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(4417);
      sky(g, w, yH, s, rnd);
      Q.bandsIn(g, 0, yH, w, h - yH, RIVER, 0.45);
      // the far bank: a lip of mud, grass and reeds, trees behind, the hut by the bridge's end
      const FB = p.layer(w, h);
      const grass = p.mat('#5e7a44', { n: 6, at: 3, step: 0.075 }), mud = p.mat('#7a6448', { n: 4, at: 2 }), tree = p.mat('#3e5a40', { n: 5, at: 2, step: 0.08 });
      FB.rect(0, yH - s(4), w, s(8), grass, (x, y) => (y < yH - s(2) ? 0.85 : 0.5));
      FB.rect(0, yH + s(4), w, Math.max(1, s(2)), mud, (x) => ((x >> 2) % 3 ? 0.6 : 0.35));
      for (let x = -s(6); x < w + s(6); x += s(8) + Math.floor(rnd() * s(10))) {
        if (x > hut.x - s(8) && x < hut.x + hut.w + s(8)) continue;
        const r = s(5) + Math.floor(rnd() * s(6)), cy = yH - s(3) - r;
        FB.ell(x, cy, r, Math.round(r * 0.85), tree, p.sphere(x - r * 0.3, cy - r * 0.3, r, r * 0.85, { amb: 0.25 }));
      }
      FB.outline();
      g.drawImage(FB.canvas(), 0, 0);
      for (let x = 0; x < w; x += 2 + Math.floor(rnd() * 3)) { const rh = s(3) + Math.floor(rnd() * s(5)); R(g, x, yH + s(4) - rh, 1, rh, rnd() < 0.5 ? '#4a6236' : '#6e8a4a'); }
      // the hut: board walls in the sun, a thatched roof, a small window, a step; its door is live
      const H = p.layer(w, h);
      const board = p.mat('#8a6a48', { n: 6, at: 3, step: 0.08 }), thatch = p.mat('#9a8452', { n: 5, at: 3, step: 0.08 });
      const hx = hut.x, hy = hut.y, hw = hut.w, hh = hut.h;
      H.rect(hx, hy - hh, hw, hh, board, (x) => ((Math.round(x - hx) % Math.max(3, s(5))) < 1 ? 0.3 : x < hx + hw * 0.55 ? 0.8 : 0.52));
      H.poly([[hx - s(7) * big, hy - hh + s(2)], [hx + hw * 0.45, hy - hh - s(18) * big], [hx + hw + s(7) * big, hy - hh + s(2)]], thatch,
        (x, y) => clamp(0.86 - (x - hx) / hw * 0.42 - ((Math.round(y) % 3) === 0 ? 0.12 : 0), 0, 0.999));
      H.rect(hx + Math.round(hw * 0.64), hy - Math.round(hh * 0.7), Math.round(s(7) * big), Math.round(s(6) * big), p.solid('#2a2026'), 0);
      H.rect(hx - s(2), hy - s(2), Math.round(s(16) * big), s(2), p.mat('#8a8680', { n: 4, at: 2 }), 2);
      H.outline();
      g.drawImage(H.canvas(), 0, 0);
      // the near bank, lower left: grass down to the water, a worn path to the bridge, stones at its foot
      const NB = p.layer(w, h);
      const [nx, ny] = cl(0);
      const edge = (y) => nx + s(40) * big + (y - ny) * 0.9;
      const bankTop = (x) => ny - s(30) * big - x * 0.16;
      NB.fill(0, 0, w, h, (x, y) => x < edge(y) && y > bankTop(x), grass,
        (x, y) => clamp(0.76 - (y - bankTop(x)) / (h - bankTop(x) + 1) * 0.34 + ((x * 3 + y * 5) % 13 === 0 ? 0.16 : 0) - ((x * 7 + y * 3) % 17 === 0 ? 0.14 : 0), 0, 0.999));
      const dirt = p.mat('#a08a64', { n: 5, at: 2, step: 0.08 });
      NB.fill(0, ny - s(20), nx + s(10), h, (x, y) => y > ny - s(12) * big + (nx - x) * 0.12 && y < ny + s(12) * big + (nx - x) * 0.3 && x < nx + s(6), dirt, (x, y) => clamp(0.62 + ((x + y * 3) % 9 === 0 ? 0.2 : 0) - (y - ny) / s(40) * 0.2, 0, 0.999));
      NB.stone([[nx - s(4), ny - s(4)], [nx + s(34) * big, ny - s(8) * big], [nx + s(42) * big, ny + s(30) * big], [nx - s(8), ny + s(38) * big]], p.mat('#8a8680', { n: 5, at: 2, step: 0.1 }), { face: 2, bevel: 2 });
      NB.outline();
      g.drawImage(NB.canvas(), 0, 0);
      // darker bands in the current and the far bank's reflection, broken
      for (let y = yH + s(8); y < h; y += s(5) + Math.floor(rnd() * s(6))) { const x0 = Math.floor(rnd() * w), len = s(30) + Math.floor(rnd() * w * 0.4); R(g, x0, y, len, 1, 'rgba(70,50,30,0.28)'); }
      for (let x = 0; x < w; x += 2) { if ((x >> 3) % 3 === 0) continue; R(g, x, yH + s(6) + ((x * 7) % 3), 1, s(3) + ((x * 5) % 3), 'rgba(60,84,48,0.35)'); }
      // the bridge up to where the prologue's broke off (its last span comes with the shot's action)
      const B = p.layer(w, h);
      bridgePart(B, G, 0, G.BRK);
      B.outline();
      const bc = B.canvas();
      // its reflection, dim and broken by the current
      const rc = mk(w, h), rg = rc.getContext('2d'), wy = wl(0.3);
      rg.save(); rg.translate(0, wy * 2 - s(6)); rg.scale(1, -1); rg.drawImage(bc, 0, 0); rg.restore();
      rg.globalCompositeOperation = 'source-atop'; rg.fillStyle = 'rgba(60,40,24,0.62)'; rg.fillRect(0, 0, w, h);
      rg.globalCompositeOperation = 'destination-out';
      for (let y = 0; y < h; y += 3) rg.fillRect(0, y, w, 1);
      rg.fillRect(0, 0, w, wy - s(2));
      g.globalAlpha = 0.4; g.drawImage(rc, 0, 0); g.globalAlpha = 1;
      g.drawImage(bc, 0, 0);
      // reeds along our bank's edge, tall in front
      for (let y = ny - s(30); y < h; y += 2 + Math.floor(rnd() * 3)) {
        const x = Math.round(edge(y)) - 1 - Math.floor(rnd() * 4);
        if (rnd() < 0.45) continue;
        const rh = s(8) + Math.floor(rnd() * s(16) * big);
        R(g, x, y - rh, 1, rh, '#3e5a32'); R(g, x - 1, y - Math.round(rh * 0.5), 1, Math.round(rh * 0.5), '#2e4a2a'); R(g, x, y - rh, 1, 2, '#a07a4a');
      }
      return cv;
    });
  }
  function reachSpan(G) {
    return cached('ch1.span|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const L = P().layer(G.w, G.h);
      bridgePart(L, G, G.BRK - 0.02, 1);
      L.outline();
      return L.canvas();
    });
  }
  function hutDoor(c, G, open) {
    const { hut, s, big } = G, dw = Math.round(s(10) * big), dh = Math.round(s(19) * big), dx = Math.round(hut.x + s(7) * big), dy = hut.y - dh;
    R(c, dx, dy, dw, dh, '#4a3828');
    for (let x = dx + 2; x < dx + dw; x += 3) R(c, x, dy + 1, 1, dh - 2, '#3a2c20');
    const gap = Math.round(dw * clamp(open, 0, 1));
    if (gap > 0) { R(c, dx, dy, gap, dh, '#140e12'); R(c, dx + gap, dy, 1, dh, '#6a5034'); }
    R(c, dx - 1, dy - 1, dw + 2, 1, '#2a2020');
    return { x: dx, y: dy, w: dw, h: dh };
  }
  // motes gathering into a shape: scattered above it at k 0, at their places by k 1; a few linger after
  function motes(c, pts, k, t, still) {
    for (let i = 0; i < pts.length; i++) {
      const [tx, ty, sx, sy] = pts[i], e = ease(clamp(k * 1.25 - (i % 5) * 0.05, 0, 1));
      const x = lerp(sx, tx, e), y = lerp(sy, ty, e) + (still ? 0 : Math.sin(t / 400 + i) * (1 - e) * 2);
      const a = k >= 1 ? (i % 4 === 0 && !still ? 0.3 + 0.25 * Math.sin(t / 700 + i) : 0) : 0.9 * (1 - e * 0.6);
      if (a <= 0.02) continue;
      c.fillStyle = 'rgba(255,238,196,' + a.toFixed(2) + ')';
      c.fillRect(Math.round(x), Math.round(y), 1, 1);
      if (e < 0.4 && i % 3 === 0) { c.fillStyle = 'rgba(255,238,196,' + (a * 0.4).toFixed(2) + ')'; c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); }
    }
  }
  const reach = {
    phases: [['reach', 1200], ['door', 800]],
    safe: { wide: 'bridge and hut in the top 60 %', narrow: 'the bridge runs diagonally up the frame, the hut top right', land: 'the bridge end and the hut' },
    draw(c, w, h, t, st) {
      const G = geomReach(w, h, st.vb), { s, hut, cl, big } = G, still = st.still;
      c.drawImage(reachStatic(G), 0, 0);
      river(c, 0, G.yH + s(6), w, h - G.yH - s(6), t, still, 913, 1);
      const k = st.at('reach');
      if (k > 0) { c.globalAlpha = step4(ease(k)); c.drawImage(reachSpan(G), 0, -Math.round((1 - ease(k)) * s(6) * big)); c.globalAlpha = 1; }
      const pts = [], rnd = P().rnd(77);
      for (let i = 0; i < 40; i++) { const z = lerp(G.BRK, 1, rnd()), [x, y] = cl(z); pts.push([x + rnd() * G.dw(z), y - rnd() * G.ph(z), x + (rnd() - 0.5) * s(46), y - s(26) - rnd() * s(34)]); }
      if (!still || k < 1) motes(c, pts, k, t, still);
      // the far hut's door and Kōji with his cup (only from the line that says he comes out)
      const kd = st.at('door');
      const door = hutDoor(c, G, ease(clamp(kd / 0.45, 0, 1)));
      if (kd > 0.3) {
        const e = ease(clamp((kd - 0.3) / 0.7, 0, 1)), sc = clamp(0.42 * big, 0.32, 0.7);
        const f = Q.figure(look('koji'), 'left', 'p:cuphold/cup', sc, SUN);
        if (f) {
          const fx = Math.round(lerp(door.x + door.w / 2, door.x - s(6) * big, e)), fy = Math.round(lerp(door.y + door.h - 1, hut.y + s(2) * big, e));
          c.globalAlpha = step4(e * 1.6); c.drawImage(f.cv, fx - f.ax, fy - f.ay); c.globalAlpha = 1;
        }
      }
      // you on the bank by the bridge's foot, from behind (and your companion, if one walks with you)
      if (G.lay !== 'land') {
        const [nx, ny] = cl(0), sc = clamp(G.Z * (G.lay === 'narrow' ? 0.9 : 1), 0.45, 1);
        const comp = st.cast.comp, fx = Math.round(nx - s(26)), fy = Math.round(ny + s(4));
        c.fillStyle = 'rgba(30,40,20,0.35)';
        if (comp) { const fc = Q.figure(comp.look, 'up', 'i0', sc, SUN); if (fc) { P().disc(c, fx - s(24), fy, s(9), Math.max(1, s(2))); c.drawImage(fc.cv, fx - s(24) - fc.ax, fy - fc.ay); } }
        const fp = Q.figure(st.cast.pc, 'up', 'i0', sc, SUN);
        if (fp) { c.fillStyle = 'rgba(30,40,20,0.35)'; P().disc(c, fx, fy, s(9), Math.max(1, s(2))); c.drawImage(fp.cv, fx - fp.ax, fy - fp.ay); }
      }
      // reeds close to us in the corner, dark against the water
      const rr = P().rnd(4321);
      for (let i = 0; i < 16; i++) {
        const x = Math.round(w - s(4) - rr() * s(70)), y0 = G.vb + s(30), hh = s(40) + Math.round(rr() * s(50)), sway = still ? 0 : Math.round(Math.sin(t / 1300 + i) * 2);
        R(c, x, y0 - hh, 1, hh, '#1e2a1a'); R(c, x + sway, y0 - hh - s(6), 1, s(8), '#2a3a24'); R(c, x + sway, y0 - hh - s(6), 1, 2, '#6a5030');
      }
      void hut;
    },
    focus(w, h, vb) { const G = geomReach(w, h, vb), [x] = G.cl(G.BRK), top = G.hut.y - G.hut.h - Math.round(G.s(18) * G.big); return { x: Math.round(x), y: top, w: Math.round(G.hut.x + G.hut.w - x), h: Math.round(G.wl(G.BRK) - top) }; },
  };

  // ---- the teahouse front, shared ------------------------------------------------------------------------
  // A board front on a stone plinth under a tiled eave; posts at the corners and the doorway; a lattice
  // window; an indigo noren over the doorway (live), a paper lantern on a bracket (live).
  function teahouse(L, o) {
    const p = P(), { x0, x1, yG, s, dX, dW, roofY, light, win } = o;
    const board = p.mat(BOARD, { n: 6, at: 3, step: 0.08 }), post = p.mat(POST, { n: 5, at: 2, step: 0.08 });
    const tile = p.mat('#4a4e5e', { n: 5, at: 2, step: 0.09 }), stone = p.mat('#8a8478', { n: 5, at: 2, step: 0.09 });
    const wallTop = roofY + s(14);
    L.rect(x0, wallTop, x1 - x0, yG - wallTop, board, (x, y) => ((Math.round(x - x0) % Math.max(4, s(7))) < 1 ? 0.25 : clamp(0.6 + light * 0.25 - (y - wallTop) / (yG - wallTop) * 0.22, 0, 0.999)));
    L.rect(x0, yG - s(8), x1 - x0, s(8), stone, (x, y) => ((Math.round(x - x0) % s(16)) < 1 ? 0.15 : y < yG - s(7) ? 0.85 : 0.5));
    // the eave: a ridge of rounded tiles over the dark underside and the rafter ends
    L.rect(x0 - s(10), roofY + s(9), x1 - x0 + s(20), s(5), post, 0.12);
    for (let x = x0 - s(8); x < x1 + s(8); x += s(5)) L.rect(x, roofY + s(10), s(2), s(3), post, 2);
    for (let i = 0; i < 5; i++) L.rect(x0 - s(12) + i, roofY + i * s(2), x1 - x0 + s(24) - i * 2, s(2), tile, i === 4 ? 0 : 4 - (i % 2) * 2);
    for (let x = x0 - s(12); x < x1 + s(12); x += s(6)) L.rect(x, roofY, 1, s(10), tile, 0);
    for (const px of [x0, dX - s(5), dX + dW, x1 - s(5)]) L.rect(px, wallTop, s(5), yG - wallTop - s(8), post, (x) => (x < px + 1 ? 0.88 : 0.4));
    if (win) {
      // a lattice window with paper behind, catching the light
      const [wx, wy, ww, wh] = win;
      L.rect(wx, wy, ww, wh, p.mat('#e2d0b0', { n: 4, at: 2 }), (x, y) => 0.4 + light * 0.4);
      for (let x = wx + s(5); x < wx + ww; x += s(5)) L.rect(x, wy, 1, wh, post, 1);
      for (let y = wy + s(5); y < wy + wh; y += s(5)) L.rect(wx, y, ww, 1, post, 1);
      L.rect(wx - s(2), wy - s(2), ww + s(4), s(2), post, 3); L.rect(wx - s(2), wy + wh, ww + s(4), s(3), post, 1);
    }
    return { wallTop };
  }
  function noren(g, x, y, w, hh, s, wave) {
    const IND = Q.rampC('#2e3a6a', 5, { at: 2 });
    const half = Math.round(w / 2);
    for (const [px, pw] of [[x, half - 1], [x + half + 1, w - half - 1]]) {
      for (let xx = px; xx < px + pw; xx++) {
        const fold = ((xx - px) % s(6)) < 2 ? 1 : ((xx - px) % s(6)) > s(4) ? 3 : 2;
        R(g, xx, y, 1, hh + (wave ? Math.round(Math.sin(xx * 0.3 + wave) * 0.6) : 0), IND[fold]);
      }
      R(g, px, y + hh - 1, pw, 1, IND[0]);
    }
    // the lantern crest in undyed thread (a ring and a dot: a mark, not a letter)
    g.fillStyle = '#d8d0bc'; P().ring(g, x + Math.round(w * 0.75), y + Math.round(hh * 0.5), Math.max(2, s(4)), 1);
    g.fillStyle = '#d8d0bc'; P().disc(g, x + Math.round(w * 0.75), y + Math.round(hh * 0.5), 1);
    R(g, x, y, w, Math.max(1, s(2)), '#4a3020');
  }
  function eaveLantern(g, x, y, s, t, still) {
    const lan = Q.chochin(s(6), s(15), true), fl = still ? 0.9 : 0.85 + 0.1 * Math.sin(t / 330) + 0.05 * Math.sin(t / 91);
    g.globalAlpha = fl; P().halo(g, x, y + lan.H / 2, s(30), '255,196,120', 0.22, 3); g.globalAlpha = 1;
    R(g, x, y - s(6), 1, s(6), '#2a1e18');
    g.drawImage(lan.cv, Math.round(x - lan.cx), y);
  }
  function shojiPair(c, x, y, w, h, s, open, glow) {
    // two panels: the left one slides over the right as `open` goes 0 → 1
    const p = P(), L = p.layer(c.canvas.width, c.canvas.height), half = Math.round(w / 2);
    const paper = p.mat(glow > 0.5 ? '#f2d8a6' : '#e2d2b4', { n: 4, at: 2 }), wood = p.mat(POST, { n: 4, at: 2 });
    Q.shoji(L, x + half, y, w - half, h, s, paper, wood, glow);
    Q.shoji(L, Math.round(x + half * open), y, half, h, s, paper, wood, glow);
    L.outline();
    c.save(); c.beginPath(); c.rect(x - s(2), y, w + s(4), h); c.clip(); c.drawImage(L.canvas(), 0, 0); c.restore();
  }

  // ---- shot 2: his own cup, along the bridge ------------------------------------------------------------
  function geomCup(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const yH = Math.round(vb * (lay === 'narrow' ? 0.34 : lay === 'land' ? 0.3 : 0.4));
    const vx = Math.round(w * (lay === 'narrow' ? 0.62 : 0.6));
    const yN = Math.round(h + s(10));
    const halfN = lay === 'narrow' ? w * 0.42 : w * 0.24, halfF = s(9);
    const dz = (y) => clamp((y - yH) / Math.max(1, yN - yH), 0, 1);
    const dx = (y) => lerp(halfF, halfN, dz(y));
    const th = { x1: Math.round(w * (lay === 'narrow' ? 0.36 : 0.3)), yG: Math.round(vb * (lay === 'narrow' ? 0.74 : 0.86)) };
    const kEnd = Math.round(vb - s(8)); // where Kōji stops (his feet), just above the sheet
    return Object.assign(S, { yH, vx, yN, dx, dz, th, kEnd });
  }
  function cupStatic(G) {
    return cached('ch1.cup|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, yH, vx, yN, dx, s, th } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(2207);
      sky(g, w, yH, s, rnd);
      Q.bandsIn(g, 0, yH, w, h - yH, RIVER, 0.45);
      // the far bank and the hut where the bridge lands
      R(g, 0, yH - s(3), w, s(5), '#5e7a44'); R(g, 0, yH + s(2), w, Math.max(1, s(1)), '#7a6448');
      const tree = p.mat('#3e5a40', { n: 5, at: 2 }), T0 = p.layer(w, h);
      for (let x = -s(6); x < w; x += s(9) + Math.floor(rnd() * s(9))) { if (Math.abs(x - vx) < s(30)) continue; const r = s(4) + Math.floor(rnd() * s(4)); T0.ell(x, yH - s(3) - r, r, r * 0.85, tree, p.sphere(x - r * 0.3, yH - s(4) - r * 1.2, r, r)); }
      const board = p.mat('#8a6a48', { n: 6, at: 3 }), thatch = p.mat('#9a8452', { n: 5, at: 3 });
      const hx = vx + s(10), hw2 = s(22);
      T0.rect(hx, yH - s(14), hw2, s(14), board, (x) => (x < hx + hw2 * 0.6 ? 0.78 : 0.5));
      T0.poly([[hx - s(3), yH - s(13)], [hx + hw2 / 2, yH - s(22)], [hx + hw2 + s(3), yH - s(13)]], thatch, (x) => (x < hx + hw2 / 2 ? 0.85 : 0.45));
      T0.rect(hx + s(3), yH - s(9), s(5), s(9), p.solid('#1a1216'), 0);
      T0.outline();
      g.drawImage(T0.canvas(), 0, 0);
      // the deck running away from us: planks across, converging, lit a little more on the left
      const D = p.layer(w, h);
      const wood = p.mat(WOOD, { n: 6, at: 3, step: 0.085 });
      D.fill(0, yH, w, h, (x, y) => y >= yH && Math.abs(x - vx) <= dx(y), wood, (x, y) => clamp(0.74 - (Math.abs(x - vx) / dx(y)) * 0.16 + (x < vx ? 0.06 : -0.05), 0, 0.999));
      for (let i = 1; i < 30; i++) { const z = Math.pow(i / 30, 1.8), y = Math.round(yH + (yN - yH) * z); D.rect(vx - dx(y), y, dx(y) * 2, 1, wood, 1); if (z > 0.3) D.rect(vx - dx(y), y + 1, dx(y) * 2, 1, wood, 5); }
      // the nail lines along the deck (two stringers under the planks)
      for (const f of [-0.5, 0.5]) for (let y = yH + s(4); y < h; y += 3) { const x = Math.round(vx + f * dx(y)); D.dot(x, y, wood, 1); }
      for (const side of [-1, 1]) {
        const posts = [];
        for (let i = 1; i < 13; i++) {
          const z = Math.pow(i / 12, 1.8), y = Math.round(yH + (yN - yH) * z), x = Math.round(vx + side * dx(y)), ph = Math.round(lerp(s(6), s(70), z)), pw = Math.max(1, Math.round(lerp(1, s(7), z)));
          D.rect(side < 0 ? x - pw : x, y - ph, pw, ph, wood, (xx) => (side < 0 ? (xx > x - pw * 0.5 ? 0.92 : 0.6) : 0.45));
          posts.push([x, y - ph]);
        }
        const rail = [], mid = [];
        for (let i = 0; i <= 40; i++) { const z = Math.pow(i / 40, 1.8), y = yH + (yN - yH) * z, x = vx + side * dx(y); rail.push([x, y - lerp(s(6), s(70), z)]); mid.push([x, y - lerp(s(3), s(36), z)]); }
        D.path(rail, Math.max(1, s(2.5)), wood, side < 0 ? 0.95 : 0.55);
        D.path(mid, Math.max(1, s(1.6)), wood, side < 0 ? 0.7 : 0.4);
      }
      D.outline();
      g.drawImage(D.canvas(), 0, 0);
      // the teahouse at the left on our bank: its front, the door we will see open, a window
      const T = p.layer(w, h);
      const roofY = Math.round(Math.max(s(4), th.yG - s(104)));
      const dX = Math.round(th.x1 * 0.34), dW = Math.round(th.x1 * 0.4);
      const o = teahouse(T, { x0: -s(14), x1: th.x1, yG: th.yG, s, dX, dW, roofY, light: 0.5, win: [s(4), roofY + s(30), Math.max(s(10), dX - s(14)), s(22)] });
      T.outline();
      g.drawImage(T.canvas(), 0, 0);
      // the path to the square beyond it, packed earth
      Q.bandsIn(g, 0, th.yG, th.x1 + s(6), h - th.yG, ['#8e7a5c', '#827054', '#76654c'], 0.4);
      return { cv, roofY, wallTop: o.wallTop, dX, dW };
    });
  }
  const cupShot = {
    phases: [['walk', 1600]],
    safe: { wide: 'Kōji centre above the sheet', narrow: 'the bridge vertical, Kōji in the upper half', land: 'Kōji and the door' },
    draw(c, w, h, t, st) {
      const G = geomCup(w, h, st.vb), { s, yH, vx, th } = G, still = st.still;
      const S0 = cupStatic(G);
      c.drawImage(S0.cv, 0, 0);
      // the water either side of the deck, streaming
      c.save(); c.beginPath(); c.rect(0, yH + s(3), w, h); c.clip();
      river(c, 0, yH + s(4), w, h - yH, t, still, 515, 1);
      c.restore();
      c.drawImage(S0.cv, 0, 0, w, h, 0, 0, w, h); // (the deck and posts over the water again)
      const k = st.at('walk'), kd = ease(clamp((k - 0.6) / 0.4, 0, 1));
      const dy0 = S0.wallTop + s(20), dyh = th.yG - s(8) - dy0;
      // the doorway: dark until the panel slides, then the warm room behind
      R(c, S0.dX, dy0, S0.dW, dyh, '#2a1a14');
      if (kd > 0) { c.fillStyle = 'rgba(255,190,110,' + (0.4 * kd).toFixed(2) + ')'; c.fillRect(S0.dX, dy0, S0.dW, dyh); }
      shojiPair(c, S0.dX, dy0, S0.dW, dyh, s, 1 - kd * 0.95, 0.25);
      noren(c, S0.dX - s(2), dy0 - s(4), S0.dW + s(4), s(15), s, still ? 0 : t / 900);
      eaveLantern(c, Math.round(th.x1 - s(12)), S0.wallTop + s(4), s, t, still);
      // Tsuru, far off on the path from the square, as the door opens
      if (kd > 0.3) {
        const ft = Q.figure(look('tsuru'), 'right', 'i0', clamp(0.5 * G.Z, 0.3, 0.6), SUN);
        if (ft) { c.globalAlpha = step4((kd - 0.3) / 0.5); c.drawImage(ft.cv, Math.round(th.x1 * 0.08 + kd * s(8) - ft.ax), Math.round(th.yG + s(6) - ft.ay)); c.globalAlpha = 1; }
      }
      // Kōji, from mid-span to the near end, the cup held level
      const e = still ? 1 : ease(clamp(k / 0.82, 0, 1));
      const y0 = yH + (G.kEnd - yH) * 0.3, fy = Math.round(lerp(y0, G.kEnd, e));
      const sc = clamp(lerp(0.4, 1, G.dz(fy) / Math.max(0.01, G.dz(G.kEnd))), 0.3, 1);
      const walking = !still && e < 1;
      const key = walking && Math.floor(t / 240) % 2 ? 'p:step/cup' : 'p:cuphold/cup';
      const fk = Q.figure(look('koji'), 'down', key, Math.round(sc * 20) / 20, SUN);
      if (fk) {
        c.fillStyle = 'rgba(40,24,16,0.35)'; P().disc(c, vx - s(2), fy, Math.round(fk.w * 0.3), Math.max(1, Math.round(fk.h * 0.04)));
        c.drawImage(fk.cv, Math.round(vx - s(2) - fk.ax), fy - fk.ay - (walking && Math.floor(t / 120) % 2 ? 1 : 0));
      }
    },
    focus(w, h, vb) { const G = geomCup(w, h, vb); return { x: G.vx - 24, y: G.kEnd - 58, w: 44, h: 58 }; },
  };

  // ---- the doorway (shots 3 and 4) ---------------------------------------------------------------------------
  // The room inside the teahouse behind Hana: plaster in the half-light, a shelf, a paper lantern still lit
  // from the night, the counter with the tray, the pot and the two cups poured this morning.
  function interior(L, g, o) {
    const p = P(), { x0, x1, top, bot, counterY, s, deep } = o;
    const plaster = p.mat('#4e3e38', { n: 5, at: 2, step: 0.06 }), pale = p.mat('#9a6a42', { n: 6, at: 3, step: 0.09 }), front = p.mat('#5a3622', { n: 5, at: 3 });
    L.rect(x0, top, x1 - x0, bot - top, plaster, (x, y) => clamp(0.36 + (x - x0) / (x1 - x0) * 0.3 - (y - top) / (bot - top) * 0.1, 0, 0.999));
    // a shelf: caddies and bowls
    const shY = Math.round(lerp(top, counterY, deep ? 0.32 : 0.4)), sx0 = Math.round(lerp(x0, x1, 0.56)), sx1 = Math.round(lerp(x0, x1, 0.94));
    if (sx1 - sx0 > s(30)) {
      const tin = p.mat('#7a7a84', { n: 5 }), red = p.mat('#8a2c22', { n: 5 }), grn = p.mat('#3e5e3a', { n: 5 }), bowl = p.mat('#c8bca2', { n: 5 });
      const can = (cx, rw, hh, M) => { L.rect(cx - rw, shY - hh, rw * 2, hh, M, p.cyl(cx - 1, rw, { amb: 0.2 })); L.rect(cx - rw, shY - hh, rw * 2, 2, M, (x) => (x < cx ? 0.95 : 0.7)); };
      can(sx0 + s(8), s(5), s(13), red); can(sx0 + s(22), s(4), s(10), tin); can(sx0 + s(34), s(5), s(14), grn);
      for (let i = 0; i < 3; i++) L.ell(sx0 + s(54), shY - s(3) - i * s(3), s(8) - i, s(2), bowl, (x) => (x < sx0 + s(52) ? 0.85 : 0.5));
      L.rect(sx0 - s(3), shY, sx1 - sx0 + s(6), s(3), pale, (x, y) => (y < shY + 1 ? 0.9 : 0.45));
    }
    // a small lattice window in the back wall (the evening outside), a cloth on a peg, a pillar
    const wx = Math.round(lerp(x0, x1, 0.1)), wy = Math.round(lerp(top, counterY, 0.12)), ww = Math.round(Math.min(s(64), (x1 - x0) * 0.2)), wh = Math.round(Math.min(s(40), (counterY - top) * 0.36));
    if (ww > s(20) && wh > s(14)) {
      const post = p.mat(POST, { n: 5, at: 2 });
      L.rect(wx, wy, ww, wh, p.mat('#d8a07a', { n: 4, at: 2 }), (x, y) => clamp(0.85 - (y - wy) / wh * 0.6, 0, 0.999));
      for (let x = wx + s(6); x < wx + ww; x += s(6)) L.rect(x, wy, 1, wh, post, 1);
      L.rect(wx, wy + Math.round(wh / 2), ww, 1, post, 1);
      L.rect(wx - s(3), wy - s(3), ww + s(6), s(3), post, 3); L.rect(wx - s(3), wy + wh, ww + s(6), s(3), post, 1); L.rect(wx - s(3), wy, s(3), wh, post, 2); L.rect(wx + ww, wy, s(3), wh, post, 1);
      const cl = p.mat('#c8c0a8', { n: 4, at: 2 }), px = wx + ww + s(26);
      L.rect(px, wy + s(2), s(2), s(3), post, 1);
      L.fill(px - s(7), wy + s(5), px + s(9), wy + s(30), (x, y) => Math.abs(x - px - 1) < s(7) - (y - wy) * 0.05, cl, (x) => (x < px ? 0.85 : 0.45));
    }
    L.rect(Math.round(lerp(x0, x1, 0.47)), top, s(6), counterY - top, p.mat(POST, { n: 5, at: 2 }), (x) => (x < lerp(x0, x1, 0.47) + 2 ? 0.7 : 0.3));
    // the counter: an oiled top with a lit nosing, the front in shadow
    L.rect(x0, counterY, x1 - x0, s(7), pale, (x, y) => (y < counterY + 1 ? 0.98 : y < counterY + s(5) ? 0.8 : 0.6));
    L.rect(x0, counterY + s(7), x1 - x0, bot - counterY, front, (x, y) => ((Math.round(x - x0) % s(26)) < 1 ? 0.15 : y < counterY + s(9) ? 0.75 : 0.42));
    void g;
  }
  function geomDoor(w, h, vb, close) {
    const S = stage(w, h, vb), { s, lay } = S;
    const ph = 96;                                                                    // Hana's portrait (1 art px per px)
    const narrow = lay === 'narrow';
    const hx = Math.round(w * (narrow ? 0.6 : close ? 0.5 : 0.6));
    const hy = Math.round(vb + (close ? s(6) : s(8)));                                // her portrait's bottom (cut by the sheet)
    let dX, dW;
    if (close) { dX = Math.round(w * 0.06); dW = Math.round(w * 0.88); }              // inside the doorway: the frame is the door
    else { dW = Math.round(clamp(w * (narrow ? 0.62 : 0.34), ph * 1.6, ph * 2.6)); dX = Math.round(hx - dW * 0.48); }
    // the lintel (on an upright phone the doorway rises to fill the frame above her)
    const top = Math.round(narrow ? Math.max(s(10), vb * 0.16) : Math.max(s(close ? 2 : 12), hy - ph - s(close ? 70 : 54)));
    const counterY = Math.round(hy - ph * (close ? 0.36 : 0.4));
    return Object.assign(S, { ph, hx, hy, dW, dX, top, counterY, close: !!close });
  }
  function doorStatic(G) {
    return cached('ch1.door|' + (G.close ? 'c' : 'm') + '|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, dX, dW, top, counterY, lay, close } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P();
      const L = p.layer(w, h);
      const I = p.layer(w, h);
      interior(I, g, { x0: dX, x1: dX + dW, top, bot: h, counterY, s, deep: close });
      I.outline();
      if (!close) {
        // the board front either side of the doorway, in the low sun; a lattice window to the right
        const board = p.mat(BOARD, { n: 6, at: 3, step: 0.08 });
        L.rect(0, 0, w, h, board, (x, y) => ((Math.round(x) % Math.max(5, s(9))) < 1 ? 0.22 : clamp(0.68 - y / h * 0.2 - (x > dX + dW ? 0.1 : 0), 0, 0.999)));
        L.erase(dX, top, dX + dW, h, () => true);
        const wx = dX + dW + s(26);
        if (wx + s(40) < w) {
          const post = p.mat(POST, { n: 5, at: 2 }), paper = p.mat('#e2d0b0', { n: 4, at: 2 });
          const wy = top + s(18), ww = Math.min(s(70), w - wx - s(10)), wh = s(40);
          L.rect(wx, wy, ww, wh, paper, 0.55);
          for (let x = wx + s(6); x < wx + ww; x += s(6)) L.rect(x, wy, 1, wh, post, 1);
          for (let y = wy + s(6); y < wy + wh; y += s(6)) L.rect(wx, y, ww, 1, post, 1);
          L.rect(wx - s(3), wy - s(3), ww + s(6), s(3), post, 3); L.rect(wx - s(3), wy + wh, ww + s(6), s(4), post, 1);
        }
        L.rect(0, h - s(18), w, s(18), p.mat('#8a8478', { n: 5, at: 2 }), (x, y) => ((Math.round(x) % s(22)) < 1 ? 0.15 : y < h - s(17) ? 0.85 : 0.5));
      }
      // the doorway's posts and lintel (inside it, close: the posts at the frame's edges)
      const post = p.mat(POST, { n: 5, at: 2, step: 0.08 }), pw = s(close ? 12 : 8);
      L.rect(dX - pw, top - s(6), pw, h - top + s(6), post, (x) => (x < dX - pw + 2 ? 0.9 : 0.5));
      L.rect(dX + dW, top - s(6), pw, h - top + s(6), post, (x) => (x < dX + dW + 2 ? 0.7 : 0.35));
      L.rect(dX - pw, top - s(12), dW + pw * 2, s(9), post, (x, y) => (y < top - s(11) ? 0.92 : 0.45));
      if (close) { L.rect(0, 0, dX - pw, h, post, 0.2); L.rect(dX + dW + pw, 0, w, h, post, 0.15); L.rect(0, 0, w, Math.max(0, top - s(12)), post, 0.18); }
      L.outline();
      g.drawImage(I.canvas(), 0, 0);
      g.drawImage(L.canvas(), 0, 0);
      // the shōji slid back against the right post
      const S2 = p.layer(w, h);
      const sw = Math.round(dW * (close ? 0.16 : 0.28));
      Q.shoji(S2, dX + dW - sw, top, sw, h - top, s, p.mat('#e2d2b4', { n: 4, at: 2 }), p.mat(POST, { n: 4, at: 2 }), close ? 0.5 : 0.1);
      S2.outline();
      g.drawImage(S2.canvas(), 0, 0);
      // the lantern inside, still lit from the night: warm light from the right
      g.fillStyle = 'rgba(255,190,120,0.07)'; g.fillRect(dX + Math.round(dW * 0.45), top, Math.round(dW * 0.55), h - top);
      void lay;
      return { cv };
    });
  }
  function hanaBust(expr, fr) {
    // Hana in the doorway: the sun from outside on her face (our left), the room's dimness behind
    return Q.bust('hana', expr, fr, { mul: [0.97, 0.93, 0.89], add: [4, 2, 0], rim: { side: 'l', col: '#ffd8a8', k: [0.4, 0.18], below: 0.85 } }, false, 200);
  }
  // a teacup held in a hand (the cup's sprite from the prologue's teahouse)
  function cupInHand(c, x, y, Z, skin, sleeve, angle) {
    const kit = RB.prologueArt.kit;
    const cup = kit.scaled(kit.cupSprite(), clamp(Z, 0.5, 1));
    c.drawImage(cup.cv, Math.round(x - cup.ax), Math.round(y - cup.ay));
    const hd = Q.hand({ size: Math.round(11 * Z), pose: 'grip', side: 'R', angle: angle == null ? -0.2 : angle, skin, sleeve });
    if (hd) c.drawImage(hd.cv, Math.round(x - hd.ax - cup.w * 0.4), Math.round(y - hd.ay - cup.h * 0.22));
    return cup;
  }
  // Kōji from behind, close to us: the back of his straw hat, his hair at the nape, his shoulders and back
  function kojiBack(Z) {
    return Q.small('kojiback|' + Z, () => {
      const p = P(), W = Math.round(150 * Z), H = Math.round(170 * Z), L = p.layer(W, H);
      const lk = look('koji'), col = RB.sprites.colorsOf(lk);
      const coat = p.mat(col.cloth[0], { n: 6, at: 3, step: 0.08 }), hair = p.mat(col.hair[0], { n: 5, at: 2 }), straw = p.mat(lk.hatCol || '#a8884a', { n: 6, at: 3, step: 0.08 });
      const skin = p.mat(col.skin[0], { n: 5, at: 2 }), band = p.mat('#4a2e22', { n: 3, at: 1 }), belt = p.mat(col.cloth[2] || '#c8a070', { n: 4, at: 2 });
      const cx = W * 0.5, sh = H * 0.5;
      // the back: rounded shoulders falling to the arms, the light from the left; the arm on our right
      // bent forward (the hand with the cup is in front of him)
      const half = (y) => { if (y < sh) return 0; const k = clamp((y - sh) / (H * 0.12), 0, 1); return W * (0.16 + 0.3 * Math.sqrt(k)); };
      L.fill(0, sh, W, H, (x, y) => Math.abs(x - cx) <= half(y), coat, (x, y) => clamp(0.82 - (x - cx + W * 0.25) / W * 0.6 - (y - sh) / H * 0.3 + (Math.abs(x - cx) > half(y) - 2 ? -0.15 : 0), 0, 0.999));
      L.line(cx + 1, sh + H * 0.06, cx, H, coat, 1);                                    // the back seam
      L.line(cx - W * 0.3, sh + H * 0.16, cx - W * 0.33, H, coat, 1);                  // the near arm against the body
      L.line(cx + W * 0.3, sh + H * 0.16, cx + W * 0.36, H * 0.86, coat, 0);           // the far arm, bent forward
      L.rect(cx - W * 0.3, H * 0.9, W * 0.6, H * 0.04, belt, (x) => (x < cx ? 0.8 : 0.45));
      // the collar, the nape in shadow under the brim
      L.ell(cx, sh + 1, W * 0.17, H * 0.03, coat, 4);
      L.rect(cx - W * 0.1, sh - H * 0.07, W * 0.2, H * 0.08, skin, (x) => (x < cx - W * 0.02 ? 0.55 : 0.3));
      L.ell(cx, sh - H * 0.09, W * 0.14, H * 0.06, hair, (x) => (x < cx ? 0.6 : 0.3));
      // the hat from behind and a little above: a wide woven brim, the crown with its dark band
      const by = sh - H * 0.13;
      L.ell(cx, by, W * 0.44, H * 0.075, straw, (x, y) => clamp((y < by - 1 ? 0.86 : y < by + H * 0.03 ? 0.64 : 0.3) - (x - cx) / W * 0.4 - ((Math.round(x * 0.6 + y * 1.3) % 4) === 0 ? 0.1 : 0), 0, 0.999));
      L.ell(cx, by - H * 0.06, W * 0.19, H * 0.09, straw, (x, y) => clamp(0.92 - (x - cx) / W * 0.9 - ((Math.round(y) % 3) === 0 ? 0.12 : 0), 0, 0.999));
      L.rect(cx - W * 0.19, by - H * 0.03, W * 0.38, Math.max(2, H * 0.025), band, (x) => (x < cx ? 1 : 0));
      L.outline();
      return { cv: L.canvas(), ax: Math.round(cx), ay: H, w: W, h: H, handX: Math.round(cx + W * 0.36), handY: Math.round(H * 0.8) };
    });
  }
  const hanaShot = {
    phases: [['stop', 700], ['lift', 600]],
    safe: { wide: 'both faces in the top 55 %', narrow: 'stacked, Hana above', land: 'Hana\'s face and the cup' },
    draw(c, w, h, t, st) {
      const G = geomDoor(w, h, st.vb, false), { s, hx, hy, dX, top, lay } = G, still = st.still;
      c.drawImage(doorStatic(G).cv, 0, 0);
      noren(c, dX - s(2), top - s(4), G.dW + s(4), s(16), s, still ? 0 : t / 1100);
      // the eave over the front: tiles and rafter ends at the top of the frame
      const ey = Math.max(0, top - s(46));
      if (ey > s(10)) { c.fillStyle = '#2a2026'; c.fillRect(0, 0, w, ey); for (let x = 0; x < w; x += s(6)) { R(c, x, ey - s(4), s(2), s(3), '#4a3426'); R(c, x + s(3), 0, 1, ey - s(6), '#3a3644'); } R(c, 0, ey - s(6), w, s(2), '#4a4e5e'); }
      if (dX + G.dW + s(14) < w) eaveLantern(c, dX + G.dW + s(14), Math.max(s(4), top - s(30)), s, t, still);
      // Hana in the doorway: surprise on her line; then she takes it in as he speaks
      const ks = st.at('stop'), kl = st.at('lift');
      const expr = kl > 0.2 ? 'think2' : ks > 0.15 ? 'surprise' : 'neutral';
      const hb = hanaBust(expr, ks > 0.15 && kl < 0.2 ? { head: [0, -1] } : null);
      if (hb) c.drawImage(hb.cv, hx - hb.ax, hy - hb.ay);
      // her hand on the doorframe: it slides down the post and stops there
      const skin = Q.skinOf(look('hana'));
      const hd = Q.hand({ size: 10, pose: 'rest', side: 'L', angle: Math.PI * 0.5, skin, sleeve: '#a86a5a' });
      if (hd) c.drawImage(hd.cv, Math.round(dX - s(3) - hd.ax), Math.round(lerp(hy - 96 + s(6), hy - 96 + s(30), ease(ks)) - hd.ay));
      // Kōji in front of us, from behind, over the doorway's left edge; his cup held level in front of
      // him, Hana looking at it; it lifts a little on the rule
      const kb = kojiBack(lay === 'narrow' ? 0.9 : 1);
      const kx = Math.round(lay === 'narrow' ? w * 0.26 : dX - s(6));
      const lift = Math.round(ease(kl) * s(5));
      const cx = Math.round(kx + kb.w * 0.6), cy = Math.round(G.vb + s(2) - lift);
      cupInHand(c, cx, cy, 1, Q.skinOf(look('koji')), '#5a6a7a', -0.15);
      if (!still) Q.steam(c, cx - 1, cy - s(18), t, 2, 2, 0.7, s);
      c.drawImage(kb.cv, kx - kb.ax, Math.round(G.vb + s(70) - kb.ay));
    },
    focus(w, h, vb) { const G = geomDoor(w, h, vb, false); return { x: G.hx - 48, y: G.hy - 96, w: 96, h: 60 }; },
  };
  const closeShot = {
    phases: [['lower', 700], ['smile', 1000]],
    safe: { wide: 'face and cups in the top 60 %', narrow: 'face top, cups middle', land: 'her face and the cups' },
    draw(c, w, h, t, st) {
      const G = geomDoor(w, h, st.vb, true), { s, hx, hy, dX, dW, counterY } = G, still = st.still;
      c.drawImage(doorStatic(G).cv, 0, 0);
      // the hanging lantern inside, still lit
      const lx = Math.round(dX + dW * 0.8), ly = Math.max(s(4), G.top + s(4));
      eaveLantern(c, lx, ly, s, t, still);
      // the tray, the pot and the two cups on the counter behind her (poured this morning)
      const kit = RB.prologueArt.kit;
      const tray = kit.traySprite(), cup = kit.cupSprite(), pot = kit.potSprite();
      const cx0 = Math.round(hx + Math.max(s(84), dW * 0.24)), cups = [[cx0 - s(14), counterY + s(1)], [cx0 + s(14), counterY + s(2)]];
      const put = (sp, x, y) => { c.fillStyle = 'rgba(30,14,10,0.4)'; P().disc(c, x + Math.round(sp.w * 0.12), y, Math.round(sp.w * 0.36), Math.max(1, s(2))); c.drawImage(sp.cv, x - sp.ax, y - sp.ay); };
      put(tray, cx0, counterY + s(4));
      put(pot, Math.round(hx - Math.max(s(84), dW * 0.22)), counterY + s(4));
      for (const [x, y] of cups) put(cup, x, y);
      const ksm = st.at('smile'), klo = st.at('lower');
      if (!still) cups.forEach(([x, y], i) => Q.steam(c, x - 1, y - cup.top, t, i, ksm >= 1 ? 4 : 2, ksm >= 1 ? 1 : 0.6, s));
      // Hana: her head lowers (and stays lowered), then lifts with a small smile
      const down = Math.round(ease(klo) * 2 * (1 - ease(ksm)));
      const expr = ksm > 0.3 ? 'smile' : klo > 0.2 ? 'sad' : 'neutral';
      const fr = down ? { head: [0, down], look: [0, 1] } : ksm > 0.3 ? null : klo > 0 ? { look: [0, 1] } : null;
      const hb = hanaBust(expr, fr);
      if (hb) c.drawImage(hb.cv, hx - hb.ax, hy - hb.ay);
      // her hand reaches toward the cups as she smiles
      const reach = ease(ksm);
      if (reach > 0) {
        const hd = Q.hand({ size: 11, pose: 'offer', side: 'R', angle: -0.2, skin: Q.skinOf(look('hana')), sleeve: '#a86a5a' });
        if (hd) c.drawImage(hd.cv, Math.round(lerp(hx + s(34), cups[0][0] - s(14), reach) - hd.ax), Math.round(lerp(hy - s(10), counterY + s(2), reach) - hd.ay));
      }
      // Kōji's hand and cup at the frame's edge, close to us
      cupInHand(c, Math.round(dX + dW - s(30)), Math.round(G.vb + s(2)), 1, Q.skinOf(look('koji')), '#5a6a7a', -0.4);
    },
    focus(w, h, vb) { const G = geomDoor(w, h, vb, true); const x1 = G.hx + Math.max(G.s(84), G.dW * 0.24) + G.s(24); return { x: G.hx - 48, y: G.hy - 96, w: Math.round(x1 - (G.hx - 48)), h: 60 }; },
  };

  // ---- shot 5: before the door closes, from the square ---------------------------------------------------
  function geomFront(w, h, vb) {
    const S = stage(w, h, vb), { s, lay } = S;
    const yG = Math.round(vb * (lay === 'land' ? 0.94 : 0.88));
    const x0 = Math.round(w * -0.06), x1 = Math.round(w * 1.06);
    const roofY = Math.round(Math.max(s(8), yG - s(lay === 'land' ? 112 : 132)));
    const dW = Math.round(clamp(w * 0.2, s(64), s(96))), dX = Math.round(w * 0.5 - dW / 2);
    return Object.assign(S, { yG, x0, x1, roofY, dW, dX });
  }
  function frontStatic(G) {
    return cached('ch1.front|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, yG, x0, x1, roofY, dW, dX } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const p = P(), rnd = p.rnd(611);
      sky(g, w, roofY + s(14), s, rnd, true);
      for (let i = 0; i < 18; i++) { const x = Math.round(rnd() * w), y = Math.round(rnd() * roofY * 0.8); R(g, x, y, 1, 1, 'rgba(240,230,255,0.55)'); }
      Q.bandsIn(g, 0, yG, w, h - yG, ['#8a7258', '#7e6850', '#725e48', '#665440'], 0.4);
      const L = p.layer(w, h);
      const winW = Math.min(s(80), Math.round((dX - s(40)) * 0.6));
      teahouse(L, { x0, x1, yG, s, dX, dW, roofY, light: 0.6, win: winW > s(24) ? [Math.round(dX - s(26) - winW), roofY + s(40), winW, s(30)] : null });
      if (winW > s(24)) {
        const post = p.mat(POST, { n: 5, at: 2 }), paper = p.mat('#f0d4a0', { n: 4, at: 2 });
        const wx = dX + dW + s(26), wy = roofY + s(40);
        L.rect(wx, wy, winW, s(30), paper, 0.8);
        for (let x = wx + s(5); x < wx + winW; x += s(5)) L.rect(x, wy, 1, s(30), post, 1);
        for (let y = wy + s(5); y < wy + s(30); y += s(5)) L.rect(wx, y, winW, 1, post, 1);
        L.rect(wx - s(2), wy - s(2), winW + s(4), s(2), post, 3); L.rect(wx - s(2), wy + s(30), winW + s(4), s(3), post, 1);
      }
      // a bench by the wall, a water jar, a potted pine
      const wood = p.mat('#6e4a2e', { n: 5, at: 2 }), clay = p.mat('#7a5a4a', { n: 5, at: 2 }), pine = p.mat('#3e5e46', { n: 5, at: 2 });
      const bx = Math.round(dX - s(110));
      if (bx > s(4)) { L.rect(bx, yG - s(12), s(44), s(3), wood, 0.85); L.rect(bx + s(3), yG - s(10), s(2), s(10), wood, 0.4); L.rect(bx + s(38), yG - s(10), s(2), s(10), wood, 0.4); }
      const jx = Math.round(dX + dW + s(16));
      L.ell(jx, yG - s(9), s(8), s(9), clay, p.sphere(jx - s(2), yG - s(12), s(8), s(9)));
      const px = Math.round(dX - s(16));
      L.rect(px - s(6), yG - s(10), s(12), s(10), clay, (x) => (x < px ? 0.8 : 0.4));
      for (let i = 0; i < 3; i++) L.ell(px + (i - 1) * s(4), yG - s(16) - i * s(5), s(8) - i * 2, s(4), pine, (x, y) => (y < yG - s(17) - i * s(5) ? 0.85 : 0.4));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  const doorShot = {
    phases: [['close', 1300]],
    safe: { wide: 'the door in the upper half', narrow: 'the door in the upper half', land: 'the door' },
    draw(c, w, h, t, st) {
      const G = geomFront(w, h, st.vb), { s, yG, dX, dW, roofY } = G, still = st.still;
      c.drawImage(frontStatic(G).cv, 0, 0);
      const k = st.at('close');
      const kw = clamp(k / 0.55, 0, 1), ks = ease(clamp((k - 0.5) / 0.5, 0, 1));
      const top = roofY + s(14) + s(20), dh = yG - s(8) - top;
      // inside: the lit room
      c.fillStyle = '#d89a58'; c.fillRect(dX, top, dW, dh);
      c.fillStyle = 'rgba(255,230,180,0.35)'; c.fillRect(dX + s(4), top + s(4), dW - s(8), Math.round(dh * 0.5));
      // Hana going in ahead (a shape against the light), Kōji on the step turning to wave
      if (ks < 0.95) {
        const fh = Q.figure(look('hana'), 'up', 'i0', clamp(G.Z, 0.5, 1), { mul: [0.55, 0.45, 0.42], add: [20, 8, 0] });
        if (fh) { c.save(); c.beginPath(); c.rect(dX, top, dW, dh); c.clip(); c.drawImage(fh.cv, Math.round(dX + dW * 0.32 - fh.ax), Math.round(yG - s(8) - fh.ay)); c.restore(); }
        const turned = (kw > 0.2 && kw < 1) || (kw >= 1 && ks < 0.25);
        const fk = Q.figure(look('koji'), turned ? 'down' : 'up', turned ? 'p:wave' : 'p:cuphold/cup', clamp(G.Z * 1.0, 0.5, 1), { mul: [0.92, 0.86, 0.84], add: [12, 4, 0], rim: { side: 'r', col: '#ffc888', k: [0.5, 0.2] } });
        const kx = Math.round(dX + dW * 0.64 - (ks > 0.25 ? (ks - 0.25) * dW * 0.34 : 0));
        if (fk) { c.globalAlpha = step4(1 - clamp((ks - 0.5) / 0.4, 0, 1)); c.drawImage(fk.cv, kx - fk.ax, Math.round(yG - s(2) - fk.ay)); c.globalAlpha = 1; }
      }
      // the panels sliding to meet, warm light through the paper; when shut, the two of them shadows on it
      shojiPair(c, dX, top, dW, dh, s, 1 - ks, 1);
      const fl = still ? 0.9 : 0.86 + 0.08 * Math.sin(t / 420);
      if (ks >= 1) {
        c.fillStyle = 'rgba(96,52,28,' + (0.3 * fl).toFixed(2) + ')';
        for (const [u, hh] of [[0.36, 0.42], [0.6, 0.44]]) { P().disc(c, dX + Math.round(dW * u), top + Math.round(dh * hh), s(5), s(6)); c.fillRect(dX + Math.round(dW * u) - s(6), top + Math.round(dh * (hh + 0.08)), s(12), Math.round(dh * (0.9 - hh))); }
      }
      c.globalAlpha = fl; P().halo(c, dX + Math.round(dW / 2), top + Math.round(dh * 0.5), Math.round(dW * 0.9), '255,200,130', 0.16, 4); c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,200,130,' + (0.12 * (1 - ks * 0.5)).toFixed(2) + ')';
      c.beginPath(); c.moveTo(dX, yG); c.lineTo(dX + dW, yG); c.lineTo(dX + dW + s(30), G.h); c.lineTo(dX - s(30), G.h); c.fill();
      noren(c, dX - s(3), top - s(18), dW + s(6), s(18), s, still ? 0 : t / 1000);
      eaveLantern(c, Math.round(dX + dW + s(20)), roofY + s(16), s, t, still);
    },
    focus(w, h, vb) { const G = geomFront(w, h, vb); return { x: G.dX - G.s(4), y: G.roofY + G.s(14), w: G.dW + G.s(8), h: G.yG - G.roofY - G.s(14) }; },
  };

  RB.sequence.define('ch1.bridge', {
    title: { en: 'The bridge reaches the far bank', jp: '{橋|はし} が {届|とど}いた' }, chapter: 1, scene: 'rw.bridge_scene',
    shots: { reach, cup: cupShot, hana: hanaShot, close: closeShot, door: doorShot },
  });
})();
