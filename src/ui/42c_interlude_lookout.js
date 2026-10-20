/* The view from the fire lookout on the festival night (Chapter 3, co.reflection; RBN-QA-032). On the
 * map the lookout is only its platform, with the village far below it in the surround, so the lines
 * that describe the view are shown as pictures of it:
 *   village  the whole village from the top of the tower: the square lit for the festival at the foot
 *            of the terraced orchard, lantern strings swaying over it, and the freshly cut firebreaks
 *            lying pale across the slope in the moonlight
 *   seat     closer, down on the square: the stage under its lanterns, hung with red and white, Suzu
 *            dancing on it (when she is not up here with you); the audience on benches; and apart at
 *            the front, Hiro's seat: the folded cloth, the name slip and the one lit globe
 *   north    turned the other way: the orchard road climbing toward the northern peaks, with snow
 *            already gleaming on them
 * Each is seen from the lookout itself (the roof's edge, its corner posts and the rail frame it), with
 * what matters above the dialogue sheet (vb). Still layers per size; live: the stars, the lanterns'
 * flicker and sway, the dancer, the glints on the snow. Reduced motion holds each picture still.
 * Drawn with RB.pxkit at art resolution in the prologue's manner (41_prologue_art.js and
 * 42b_interlude_tide.js); implemented provisionally under AC-1. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, stage, bandsIn, chochin } = A.kit;
  // its own layers per picture and size, kept apart from the prologue's small cache
  const mine = new Map();
  const cached = (key, build) => {
    let v = mine.get(key);
    if (!v) { v = build(); mine.set(key, v); if (mine.size > 10) mine.delete(mine.keys().next().value); }
    return v;
  };
  A.kit.onRelease(() => mine.clear());
  const K = () => RB.pxkit;
  const key = (n, G) => n + '|' + G.w + 'x' + G.h + '|' + G.vb;
  const hex3 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  // is Suzu up here with you (then the stage is empty of her)
  const suzuHere = () => !!(RB.game && RB.game.s && RB.game.s.comp === 'suzu');

  // ---- the frame: where the view is ---------------------------------------------------------
  function geom(w, h, vb) {
    const S = stage(w, h, vb), { s } = S;
    const pw = clamp(Math.round(w * 0.03), s(6), s(14));      // the corner posts
    const eave = Math.max(s(7), Math.round(vb * 0.04));        // the roof's edge across the top
    const yR = Math.round(vb - s(12));                          // the rail's top (the view's bottom)
    const x0 = pw, x1 = w - pw, iw = x1 - x0, yT = eave, H = yR - yT;
    return Object.assign(S, { w, h, vb, pw, eave, yR, x0, x1, iw, yT, H, ox: (u) => Math.round(x0 + u * iw), oy: (v) => Math.round(yT + v * H) });
  }

  // The lookout round the view: the roof's edge with its rafter ends, a corner post either side, and
  // the rail, lit along its top. Below the rail (behind the sheet) its balusters and lower rail.
  function frame(G) {
    return cached(key('lkframe', G), () => {
      const { w, h, pw, eave, yR, s } = G, P = K(), L = P.layer(w, h);
      const wood = P.mat('#563a2a', { n: 6, at: 3, step: 0.07 }), roof = P.mat('#2c2430', { n: 4, at: 2, step: 0.06 });
      L.rect(0, 0, w, eave, roof, (x, y) => (y < eave - s(3) ? 0.3 : y < eave - 1 ? 0.55 : 0.8));
      for (let x = s(8); x < w; x += s(22)) L.rect(x, eave, s(4), Math.max(2, s(3)), wood, (xx, yy) => (yy < eave + 1 ? 0.6 : 0.3));
      L.rect(0, 0, pw, h, wood, (x) => (x >= pw - Math.max(1, s(2)) ? 0.72 : x < 1 ? 0.15 : 0.38));
      L.rect(w - pw, 0, pw, h, wood, (x) => (x < w - pw + Math.max(1, s(1.5)) ? 0.5 : 0.25));
      const rt = Math.max(3, s(5));
      L.rect(0, yR, w, rt, wood, (x, y) => (y < yR + 1 ? 0.97 : y < yR + 2 ? 0.7 : 0.45));
      L.rect(0, yR + rt, w, Math.max(1, s(2)), wood, 0);
      for (let x = pw + s(12); x < w - pw - s(4); x += s(26)) L.rect(x, yR + rt, Math.max(2, s(4)), h - yR - rt, wood, (xx) => (xx < x + 1 ? 0.6 : 0.3));
      L.rect(0, yR + rt + s(18), w, Math.max(2, s(4)), wood, (x, y) => (y < yR + rt + s(18) + 1 ? 0.6 : 0.35));
      L.outline();
      return L.canvas();
    });
  }

  // ---- shared pieces --------------------------------------------------------------------------
  // Night sky bands over rows 0..y1 and its stars (only those above `under(x)`); returns the twinklers.
  function sky(g, w, y1, cols, seed, per, under) {
    const rnd = K().rnd(seed), tw = [];
    bandsIn(g, 0, 0, w, y1, cols, 0.45);
    for (let i = 0, n = Math.round((w * y1) / per); i < n; i++) {
      const x = Math.floor(rnd() * w), y = Math.floor(Math.pow(rnd(), 1.3) * y1), b = rnd(), ph = rnd() * 6.28;
      if (under && y >= under(x) - 2) continue;
      R(g, x, y, 1, 1, b < 0.2 ? '#c8d0ee' : b < 0.6 ? '#6a7098' : '#464c74');
      if (b < 0.1) tw.push([x, y, ph, 900 + Math.round(b * 20000)]);
    }
    return tw;
  }
  function twinkle(c, stars, t, still) {
    if (still) return;
    for (const [x, y, ph, beat] of stars) {
      const a = 0.4 + 0.6 * Math.max(0, Math.sin(t / beat + ph));
      c.fillStyle = 'rgba(220,226,255,' + a.toFixed(2) + ')'; c.fillRect(x, y, 1, 1);
      if (a > 0.92) { c.fillStyle = 'rgba(220,226,255,0.3)'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
    }
  }
  // A full moon, its lower right a little in shade, and stepped rings of light round it.
  function moon(g, mx, my, mr) {
    K().halo(g, mx, my, mr * 5, '206,212,236', 0.18, 4);
    for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) {
      const d = x * x + y * y;
      if (d > mr * mr + mr * 0.6) continue;
      const edge = d > (mr - 1.2) * (mr - 1.2);
      R(g, mx + x, my + y, 1, 1, x + y > mr * 0.55 ? (edge ? '#bdb498' : '#ddd5b8') : edge ? '#e4dcc0' : '#f2ecd4');
    }
    if (mr >= 4) { R(g, mx - 2, my - 1, 2, 1, '#dcd3b4'); R(g, mx + 1, my + 1, 2, 2, '#dcd3b4'); R(g, mx - 1, my + 2, 1, 1, '#dcd3b4'); }
  }
  // A string of small paper lanterns hung between two points (a shallow catenary): the positions.
  function string(xa, ya, xb, yb, sag, gap) {
    const n = Math.max(2, Math.round(Math.hypot(xb - xa, yb - ya) / gap)), out = [];
    for (let i = 1; i < n; i++) { const t = i / n; out.push({ x: Math.round(xa + (xb - xa) * t), y: Math.round(ya + (yb - ya) * t + sag * 4 * t * (1 - t)), k: 4 * t * (1 - t) }); }
    return out;
  }
  function cord(g, xa, ya, xb, yb, sag, col) {
    const n = Math.max(2, Math.round(Math.abs(xb - xa)));
    for (let i = 0; i <= n; i++) { const t = i / n; R(g, Math.round(xa + (xb - xa) * t), Math.round(ya + (yb - ya) * t + sag * 4 * t * (1 - t)), 1, 1, col); }
  }
  // the lanterns on the strings, live: a slow sway (more in the middle of a string) and a flicker
  function lamps(c, list, t, still, sz, glow) {
    const P = K();
    for (let i = 0; i < list.length; i++) {
      const L = list[i], ph = i * 1.37;
      const dx = still ? 0 : Math.round(Math.sin(t / 1400 + ph * 0.4) * L.k * 1.2);
      const f = still ? 0.85 : 0.78 + 0.12 * Math.sin(t / 310 + ph) + 0.06 * Math.sin(t / 97 + ph * 3);
      const x = L.x + dx, y = L.y;
      if (glow) P.halo(c, x + (sz >> 1), y + (sz >> 1), sz * 2 + 2, '255,170,80', 0.22 * f, 2);
      c.fillStyle = L.col || '#e8903e'; c.fillRect(x, y, sz, sz + 1);
      c.fillStyle = 'rgba(255,214,140,' + f.toFixed(2) + ')'; c.fillRect(x, y, Math.max(1, sz - 1), sz);
      c.fillStyle = '#fff2c8'; c.fillRect(x, y, 1, 1);
    }
  }
  // glass lanterns on posts (the village's own, amber): a post, a dark cap and the globe
  function globes(c, list, t, still, r) {
    const P = K();
    for (let i = 0; i < list.length; i++) {
      const [x, y] = list[i], f = still ? 0.85 : 0.8 + 0.14 * Math.sin(t / 260 + i * 2.1);
      P.halo(c, x, y, r * 4, '255,180,90', 0.2 * f, 2);
      c.fillStyle = '#c8742e'; P.disc(c, x, y, r);
      c.fillStyle = 'rgba(255,200,110,' + f.toFixed(2) + ')'; P.disc(c, x - (r > 1 ? 1 : 0), y - (r > 1 ? 1 : 0), Math.max(1, r - 1));
      c.fillStyle = '#fff2cc'; c.fillRect(x - Math.max(1, r >> 1), y - Math.max(1, r >> 1), 1, 1);
    }
  }

  // ---- 1. the village from the top of the tower -------------------------------------------------
  function villageView(G) {
    return cached(key('lkvillage', G), () => {
      const { w, h, x0, iw, ox, oy, s } = G, P = K();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const U = (x) => (x - x0) / iw;
      // the orchard hill's skyline (its shoulder high on the left), a far ridge behind, the village's top
      const ridge = (x) => { const u = U(x); return Math.round(oy(0.3) - s(18) * Math.pow(clamp(1 - u, 0, 1), 1.6) + s(5) * Math.sin(u * 7.1 + 0.4) + s(1.5) * Math.sin(u * 23 + 1)); };
      const far = (x) => { const u = U(x); return Math.round(oy(0.21) + s(7) * Math.sin(u * 4.3 + 1.2) + s(2.5) * Math.sin(u * 13.7)); };
      const vTop = (x) => { const u = U(x); return Math.round(oy(0.6) + s(3) * Math.sin(u * 5 + 1)); };
      const fbY = (x) => vTop(x) - s(10);                        // the old firebreak along the orchard's foot
      const top = (x) => Math.min(ridge(x), far(x));
      const stars = sky(g, w, oy(0.46), ['#0d1026', '#11142e', '#161936', '#1b1d3e', '#222346', '#2a294c', '#35304f', '#433752'], 4711, 2000, top);
      moon(g, ox(0.15), oy(0.09), Math.max(4, s(7)));

      // the land, pixel by pixel: the far ridge, the terraces with their moonlit lips, the firebreaks
      const NT = 7, FAR = hex3('#1a2040'), FARL = hex3('#283058'), RIS = hex3('#1b1822'), LIP = hex3('#55526c');
      const TER = ['#2a2632', '#302b38', '#36303e'].map(hex3), FB = ['#86827e', '#9c978e', '#b2ac9e'].map(hex3), STB = hex3('#6a6664');
      const VIL = ['#211a20', '#261d24'].map(hex3);
      const diag = [[ox(0.66), ox(0.47), s(2), s(6)], [ox(0.11), ox(0.21), s(1.5), s(4)]];
      const inFB = (x, y, r, b) => {
        if (y >= fbY(x) - 1 && y < fbY(x) + s(6)) return true;
        for (const [xa, xb, w0, w1] of diag) {
          const ya = ridge(xa) + 2, yb = fbY(xb), t = (y - ya) / Math.max(1, yb - ya);
          if (t < 0 || t > 1) continue;
          if (Math.abs(x - (xa + (xb - xa) * t)) < w0 + (w1 - w0) * t) return true;
        }
        return false;
      };
      const terr = (x, y) => { const r = ridge(x), b = fbY(x), v = clamp((y - r) / Math.max(1, b - r), 0, 1); const vp = Math.pow(v, 0.78) + 0.016 * Math.sin(U(x) * 9 + Math.floor(Math.pow(v, 0.78) * NT) * 1.7); return vp * NT; };
      let yMin = h;
      for (let x = 0; x < w; x++) yMin = Math.min(yMin, top(x));
      yMin = Math.max(0, yMin);
      const img = g.getImageData(0, yMin, w, h - yMin), d = img.data, bay = P.bayer;
      const put = (x, y, c) => { const o = ((y - yMin) * w + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; };
      for (let x = 0; x < w; x++) {
        const fr = far(x), r = ridge(x), vt = vTop(x);
        for (let y = Math.max(yMin, Math.min(fr, r)); y < h; y++) {
          if (y < r) { put(x, y, y === fr ? FARL : FAR); continue; }
          if (y >= vt) { put(x, y, VIL[bay(x, y) < 0.3 ? 1 : 0]); continue; }
          if (y === r) { put(x, y, LIP); continue; }
          if (inFB(x, y)) { const n = Math.sin(x * 0.7 + y * 1.3) + Math.sin(x * 0.23 - y * 0.9); put(x, y, (x * 7 + y * 13) % 23 === 0 ? STB : FB[n > 0.9 ? 2 : n > -0.6 ? 1 : 0]); continue; }
          const T = terr(x, y), f = T - Math.floor(T);
          if (f > 0.82) { const T0 = terr(x, y - 1), f0 = T0 - Math.floor(T0); put(x, y, f0 <= 0.82 || Math.floor(T0) !== Math.floor(T) ? LIP : RIS); continue; }
          const n = Math.sin(x * 0.11 + y * 0.05) + Math.sin(x * 0.031 - y * 0.2 + 2);
          put(x, y, TER[n > 0.7 && bay(x, y) < 0.6 ? 2 : n > -0.4 ? 1 : 0]);
        }
      }
      g.putImageData(img, 0, yMin);

      // the orchard: persimmon trees in groves along each terrace, with gaps between (smaller up the
      // slope); none on the firebreaks. Their tops catch the moon; on the nearest a few fruit show.
      const TL = P.layer(w, h), fruit = P.solid('#c8702e'), rr0 = P.rnd(5303);
      const LEAVES = [P.mat('#5a2e2c', { n: 5, at: 2, step: 0.08 }), P.mat('#4c2a34', { n: 5, at: 2, step: 0.08 }), P.mat('#3a3428', { n: 5, at: 2, step: 0.08 })];
      for (let k = 0; k < NT; k++) {
        const vpc = (k + 0.42) / NT, rt0 = Math.max(1.5, s(1.2 + 3.8 * vpc));
        let x = x0 - rt0 + rr0() * rt0 * 6, left = 0, M = LEAVES[0];
        while (x < G.x1 + rt0) {
          if (left <= 0) { x += rt0 * (1.5 + rr0() * 4); left = 3 + Math.floor(rr0() * 7); M = LEAVES[rr0() < 0.6 ? 0 : rr0() < 0.6 ? 1 : 2]; continue; }
          left--;
          const rt = rt0 * (0.85 + rr0() * 0.3), r = ridge(x), b = fbY(x), y = Math.round(r + Math.pow(vpc, 1 / 0.78) * (b - r) + (rr0() - 0.5) * 2);
          if (!inFB(Math.round(x), y) && !inFB(Math.round(x), y + 2)) {
            const ry = rt * 0.8, cy = y - ry * 0.5;
            TL.ell(x, cy, rt, ry, M, P.sphere(x - rt * 0.35, cy - ry * 0.4, rt, ry, { amb: 0.12 }));
            if (k >= NT - 3 && rt >= 3) for (let j = 0; j < 2; j++) if (rr0() < 0.6) TL.dot(Math.round(x - rt * 0.3 + rr0() * rt * 0.6), Math.round(cy - ry * 0.2 + rr0() * ry * 0.5), fruit, 0);
          }
          x += rt * (1.7 + rr0() * 0.5);
        }
      }
      TL.outline();
      g.drawImage(TL.canvas(), 0, 0);
      // the cut brush bundled along the firebreaks
      const SH = P.layer(w, h), straw = P.mat('#c4b48a', { n: 4, at: 2 });
      for (let x = x0 + s(10); x < G.x1 - s(6); x += s(26) + Math.round(rr0() * s(20))) P.cluster(SH, x, fbY(x) + s(3), Math.max(2, s(3)), straw, 2);
      for (const [xa, xb] of diag) for (let t = 0.25; t < 0.95; t += 0.3) { const ya = ridge(xa) + 2, yb = fbY(xb), y = ya + (yb - ya) * t; P.cluster(SH, xa + (xb - xa) * t + s(1), y, Math.max(2, s(2.5)), straw, 2); }
      SH.outline();
      g.drawImage(SH.canvas(), 0, 0);

      // the village: the square in the middle, lit for the festival; houses round it; the channel on the right
      // the square widens toward us; the stage at its back, its two poles the strings' high ends
      const sq = { y0: oy(0.69), y1: oy(1.02), xa: [ox(0.38), ox(0.68)], xb: [ox(0.29), ox(0.77)] };
      const sqX = (y, side) => { const t = clamp((y - sq.y0) / (sq.y1 - sq.y0), 0, 1); return Math.round(sq.xa[side] + (sq.xb[side] - sq.xa[side]) * t); };
      const stx0 = ox(0.45), stx1 = ox(0.6), sty = oy(0.715), poleY = sty - s(12);
      const strings = [
        [stx0, poleY, sqX(oy(0.98), 0) + s(4), oy(0.98), s(5)], [stx1 - 1, poleY, sqX(oy(0.98), 1) - s(4), oy(0.98), s(5)],
        [stx0, poleY, ox(0.47), oy(1.02), s(4)], [stx1 - 1, poleY, ox(0.58), oy(1.02), s(4)],
        [sqX(oy(0.84), 0), oy(0.84), sqX(oy(0.84), 1), oy(0.84), s(7)],
      ];
      const lit = [];
      for (const [xa, ya, xb, yb, sag] of strings) lit.push(...string(xa, ya, xb, yb, sag, s(10)));
      lit.forEach((p, i) => { if (i % 5 === 2) p.col = '#c84a3a'; });
      // the paving: stones in courses, warm under the strings and before the stage
      const pools = lit.map((p) => [p.x, p.y + s(6), s(22), s(8)]).concat([[ox(0.52), oy(0.75), s(56), s(11)]]);
      {
        const X0 = sqX(sq.y1, 0), W2 = sqX(sq.y1, 1) - X0, im = g.getImageData(X0, sq.y0, W2, sq.y1 - sq.y0), dd = im.data;
        const ST = ['#2a2226', '#342a2c', '#443432', '#5a4238', '#725440'].map(hex3), cH = Math.max(3, s(5)), cW = Math.max(6, s(13));
        for (let y = sq.y0; y < sq.y1; y++) {
          const l = sqX(y, 0), r = sqX(y, 1), row = Math.floor((y - sq.y0) / cH), joinY = (y - sq.y0) % cH === 0;
          for (let x = l; x < r; x++) {
            let wm = 0;
            for (const [px2, py2, rx, ry] of pools) { const a = (x - px2) / rx, b = (y - py2) / ry, q = 1 - (a * a + b * b); if (q > 0) wm += q * 0.7; }
            const joint = joinY || (x - l + (row % 2) * (cW >> 1)) % cW === 0;
            const fi = clamp(clamp(wm, 0, 0.999) * (ST.length - 1) - (joint ? 1 : 0), 0, ST.length - 1), i0 = Math.floor(fi);
            const c = ST[Math.min(ST.length - 1, fi - i0 > bay(x, y) ? i0 + 1 : i0)];
            const o = ((y - sq.y0) * W2 + (x - X0)) * 4; dd[o] = c[0]; dd[o + 1] = c[1]; dd[o + 2] = c[2]; dd[o + 3] = 255;
          }
        }
        // only the square's own pixels: keep what is outside its sides
        const old = g.getImageData(X0, sq.y0, W2, sq.y1 - sq.y0).data;
        for (let y = sq.y0; y < sq.y1; y++) { const l = sqX(y, 0), r = sqX(y, 1); for (let x = X0; x < X0 + W2; x++) if (x < l || x >= r) { const o = ((y - sq.y0) * W2 + (x - X0)) * 4; dd[o] = old[o]; dd[o + 1] = old[o + 1]; dd[o + 2] = old[o + 2]; dd[o + 3] = old[o + 3]; } }
        g.putImageData(im, X0, sq.y0);
      }
      // the channel, dark water with the lanterns broken on it (live), and its little bridge
      // (it runs away from us up the valley: narrow and to the right at the orchard's foot, wider and nearer the square below)
      const ch = { x0: ox(0.835), x1: ox(0.85) }, chX = (y, side) => { const t = clamp((y - oy(0.6)) / (G.H * 0.45), 0, 1), dx = -Math.round(t * iw * 0.05); return side ? Math.round(ch.x1 + dx + t * s(7)) : Math.round(ch.x0 + dx - t * s(4)); };
      for (let y = oy(0.6) - s(2); y < h; y++) {
        const l = chX(y, 0), r = chX(y, 1);
        R(g, l - 1, y, 1, 1, '#3e3646'); R(g, r, y, 1, 1, '#2a2430');
        for (let x = l; x < r; x++) R(g, x, y, 1, 1, bay(x, y) < 0.15 ? '#22304a' : '#172034');
      }
      const by = oy(0.85), bl = chX(by, 0) - 2, br = chX(by, 1) + 2;
      R(g, bl, by, br - bl, Math.max(2, s(3)), '#4a3226'); R(g, bl, by, br - bl, 1, '#6e4c38');

      // houses: a roof seen from above (its ridge lit), a strip of wall under the eave with lit windows
      const HL = P.layer(w, h);
      const ROOF = { tile: P.mat('#2e2a38', { n: 5, at: 2, step: 0.075 }), thatch: P.mat('#3c3228', { n: 5, at: 2, step: 0.075 }), ash: P.mat('#3a3236', { n: 5, at: 2, step: 0.07 }) };
      const wall = P.mat('#4a3c3a', { n: 4, at: 2, step: 0.07 }), win = P.solid('#e8a850'), winD = P.solid('#18141c');
      const glows = [];
      const house = (u, v, wu, kind, wins, chimney) => {
        const cx = ox(u), base = oy(v), hw = Math.round((wu * iw) / 2), rh = Math.max(4, Math.round(hw * 0.55)), wh = Math.max(3, Math.round(hw * 0.28));
        const ridgeY = base - wh - rh, M = ROOF[kind];
        HL.rect(cx - hw + 1, base - wh, hw * 2 - 2, wh, wall, (x, y) => (y < base - wh + 1 ? 0.3 : 0.55));
        HL.poly([[cx - hw - 2, base - wh], [cx - hw * 0.6, ridgeY], [cx + hw * 0.6, ridgeY], [cx + hw + 2, base - wh]], M,
          (x, y) => clamp((y < ridgeY + 1 ? 0.95 : x < cx - hw * 0.6 + (y - ridgeY) * -0.7 ? 0.75 : 0.5) - (Math.round(y - ridgeY) % (kind === 'tile' ? 2 : 3) === 0 ? 0.18 : 0), 0, 0.999));
        for (const fu of wins) {
          const wx = Math.round(cx - hw + 2 + fu * (hw * 2 - 6)), wy = base - wh + Math.max(1, Math.round(wh * 0.3));
          const on = (wx * 7 + wy) % 5 !== 0;
          HL.rect(wx, wy, Math.max(2, s(2.5)), Math.max(2, Math.round(wh * 0.5)), on ? win : winD, 0);
          if (on) glows.push([wx + 1, wy + 1]);
        }
        if (chimney) { HL.rect(cx + hw * 0.3, ridgeY - s(4), Math.max(2, s(3)), s(5), P.mat('#4a3e3a', { n: 3, at: 1 }), (x) => (x < cx + hw * 0.3 + 1 ? 2 : 1)); if (chimney === 'kiln') glows.push([Math.round(cx + hw * 0.3) + 1, ridgeY - s(4), 'kiln']); }
      };
      // behind the square (between the old firebreak and it), then either side, nearer and larger toward us
      house(0.06, 0.68, 0.09, 'thatch', [0.2, 0.8]); house(0.17, 0.67, 0.08, 'thatch', [0.5]); house(0.28, 0.7, 0.08, 'tile', [0.3, 0.7]);
      house(0.73, 0.69, 0.07, 'thatch', [0.5]); house(0.91, 0.66, 0.13, 'tile', [0.2, 0.5, 0.8]);
      house(0.12, 0.8, 0.13, 'thatch', [0.15, 0.85], true); house(0.25, 0.85, 0.08, 'tile', [0.5]); house(0.9, 0.8, 0.11, 'ash', [0.3, 0.7], 'kiln');
      house(0.72, 0.93, 0.09, 'tile', [0.4]); house(0.95, 0.97, 0.1, 'thatch', [0.4]);
      // nearest, at the tower's foot: two big roofs, cut by the rail
      house(0.08, 1.05, 0.2, 'thatch', [0.3, 0.7]); house(0.26, 1.06, 0.13, 'tile', [0.5]);
      // the stage at the back of the square: a platform, lit, its front hung red and white, a lantern at each end
      const sth = Math.max(3, s(4));
      HL.rect(stx0, sty - Math.max(2, s(3)), stx1 - stx0, Math.max(2, s(3)), P.mat('#a8744a', { n: 4, at: 2 }), (x, y) => (y < sty - s(3) + 1 ? 3 : 2));
      HL.fill(stx0, sty, stx1, sty + sth, () => true, P.mat('#b0443a', { cols: ['#7a2c28', '#a8443a', '#c8beb0', '#e2d8c8'], at: 1 }), (x) => (Math.floor((x - stx0) / Math.max(2, s(3))) % 2 ? 0.8 : 0.3));
      for (const px2 of [stx0, stx1 - 1]) HL.rect(px2, sty - s(12), 1, s(12), P.mat('#4a3020', { n: 3, at: 1 }), 1);
      HL.outline();
      g.drawImage(HL.canvas(), 0, 0);
      // the cords of the strings (the lanterns on them are drawn live)
      for (const [xa, ya, xb, yb, sag] of strings) cord(g, xa, ya, xb, yb, sag, '#2a1e1e');
      const glass = [[sqX(oy(0.76), 0) - s(2), oy(0.76)], [sqX(oy(0.92), 0) - s(2), oy(0.92)], [sqX(oy(0.76), 1) + s(2), oy(0.76)], [sqX(oy(0.92), 1) + s(2), oy(0.92)]];
      glass.forEach(([x, y]) => R(g, x, y, 1, s(4), '#3a2a22'));
      const seat = [ox(0.64), oy(0.95)];
      return { cv, stars, lit, glows, glass, seat, chans: chX, stage: [stx0, stx1, sty], ridge: ridge(ox(0.5)) };
    });
  }
  function drawVillage(c, G, t, still) {
    const V = villageView(G), { s } = G;
    c.drawImage(V.cv, 0, 0);
    twinkle(c, V.stars, t, still);
    // lit windows, and the glass workshop's chimney faintly aglow
    for (const [x, y, k] of V.glows) {
      if (k === 'kiln') { const f = still ? 0.5 : 0.4 + 0.2 * Math.sin(t / 700); c.fillStyle = 'rgba(255,120,60,' + (0.35 * f).toFixed(2) + ')'; K().disc(c, x, y - 2, 2); continue; }
      c.fillStyle = 'rgba(255,190,100,0.16)'; K().disc(c, x, y, 2);
    }
    // the lanterns on the stage's poles and the glass lanterns round the square
    const [sx0, sx1, sy] = V.stage;
    globes(c, [[sx0, sy - s(12)], [sx1 - 1, sy - s(12)]], t, still, Math.max(1, s(1.5)));
    globes(c, V.glass, t, still, 1);
    lamps(c, V.lit, t, still, Math.max(1, s(2)), true);
    // the one globe on Hiro's seat, at the front of the square
    globes(c, [V.seat], t * 0.5, still, Math.max(1, s(1.5)));
    // the lanterns broken on the channel
    const chX = V.chans;
    for (let i = 0; i < 6; i++) {
      const y = G.oy(0.62) + Math.round(((i + 0.5) / 6) * (G.yR - G.oy(0.62))), k = still ? 0.7 : (Math.sin(t / 900 + i * 1.9) + 1) / 2;
      if (k < 0.4) continue;
      const l = chX(y, 0), r = chX(y, 1);
      c.fillStyle = 'rgba(255,180,90,' + (0.25 + k * 0.4).toFixed(2) + ')'; c.fillRect(l + 1 + (i % 2), y, Math.max(1, Math.round((r - l) * 0.5)), 1);
    }
  }

  // ---- 2. down on the square: the stage, and Hiro's seat ----------------------------------------
  // Suzu dancing, in her own colours (auburn hair, a plum dress trimmed gold) with a gold fan: three
  // poses of the dance, at stage size, each cached.
  function dancer(Z, pose) {
    return cached('lkdancer|' + Z + '|' + pose, () => {
      const P = K(), sc = (n) => Math.max(1, Math.round(n * Z)), W = sc(30), Hh = sc(34), L = P.layer(W, Hh);
      const cx = Math.round(W / 2), fy = Hh - 1;
      const dress = P.mat('#8a3a5a', { n: 5, at: 3, step: 0.08 }), trim = P.mat('#e8c070', { n: 4, at: 2 }), hair = P.mat('#aa5230', { n: 4, at: 2, step: 0.08 });
      const skin = P.mat('#e8b890', { n: 4, at: 2 }), fan = P.mat('#e8c070', { n: 4, at: 3, step: 0.07 }), ribbon = P.solid('#c8a0a8');
      const sway = pose === 1 ? -1 : pose === 2 ? 1 : 0;
      const sh = fy - sc(19), wy = fy - sc(12);
      // the dress, wide at the hem; the obi
      L.poly([[cx - sc(3) + sway, sh], [cx + sc(3) + sway, sh], [cx + sc(5), fy], [cx - sc(5), fy]], dress, (x, y) => clamp(0.9 - (x - cx + sc(2)) / sc(10) * 0.55, 0, 0.999));
      L.rect(cx - sc(3) + sway, wy, sc(6) + 1, Math.max(1, sc(2)), trim, (x) => (x < cx ? 3 : 1));
      L.rect(cx - sc(5), fy - Math.max(1, sc(1.5)), sc(10), Math.max(1, sc(1.5)), trim, 1);
      // the arms: the fan hand raised and the other held out, changing with the dance
      const hx = cx + sway, sy0 = sh + sc(1);
      const arms = pose === 0 ? [[-1, -8, -6], [1, 6, -1]] : pose === 1 ? [[-1, -7, 2], [1, 7, -7]] : [[-1, -8, -3], [1, 8, -3]];
      let fanAt = null;
      for (const [side, ax, ay] of arms) {
        const ex = hx + side * sc(3), ex2 = hx + sc(ax), ey2 = sy0 + sc(ay);
        L.seg(ex, sy0, ex2, ey2, Math.max(1, sc(2)), dress, side < 0 ? 3 : 2);
        L.dot(ex2, ey2, skin, 2);
        if ((pose === 1 ? side > 0 : side < 0)) fanAt = [ex2, ey2];
      }
      // the head: auburn waves, a ribbon, the face toward the light
      const hy = sh - sc(3);
      L.ell(hx, hy, sc(2.5), sc(3), skin, (x) => (x < hx ? 0.9 : 0.55));
      L.ell(hx + sc(0.6), hy - sc(1.3), sc(3), sc(2.2), hair, (x, y) => (y < hy - sc(2) ? 0.9 : 0.5));
      L.rect(hx + sc(1.5), hy - sc(1), Math.max(1, sc(1.6)), sc(4), hair, 1);
      L.dot(hx - sc(1.5), hy - sc(2.6), ribbon, 0);
      // the fan, open: a half-disc of gold with its ribs
      if (fanAt) {
        const [fx, fy2] = fanAt, fr = sc(4.5);
        L.fill(fx - fr, fy2 - fr, fx + fr, fy2 + 1, (x, y) => { const a = x - fx, b = y - fy2; return b <= 0 && a * a + b * b <= fr * fr; }, fan, (x, y) => (Math.round(Math.atan2(y - fy2, x - fx) * 4) % 2 ? 0.95 : 0.6));
      }
      L.outline();
      return { cv: L.canvas(), ax: cx, ay: fy };
    });
  }
  function seatView(G) {
    return cached(key('lkseat', G), () => {
      const { w, h, x0, iw, ox, oy, s, Z } = G, P = K();
      const cv = mk(w, h), g = cv.getContext('2d'), bay = P.bayer;
      g.imageSmoothingEnabled = false;
      // the far side of the square: house fronts with lit shōji, the eaves above them
      R(g, 0, 0, w, oy(0.24), '#1a141c');
      const FL = P.layer(w, h), plaster = P.mat('#463836', { n: 4, at: 2, step: 0.06 }), eaveM = P.mat('#2a2230', { n: 4, at: 2 }), sho = P.mat('#e0a458', { n: 4, at: 2, step: 0.06 }), lat = P.solid('#5a3a22');
      for (let i = 0, x = x0 - s(10); x < G.x1; i++, x += s(76)) {
        const hw = s(68), top = oy(0.02);
        FL.rect(x, top, hw, oy(0.22) - top, plaster, (xx, yy) => (yy < top + s(4) ? 0.25 : 0.5));
        FL.rect(x - s(4), top - s(4), hw + s(8), s(7), eaveM, (xx, yy) => (yy < top - s(3) ? 0.8 : 0.35));
        if (i % 3 !== 1) {
          const wx = x + s(12), wy = top + s(10), ww = s(30), wh = oy(0.17) - wy;
          FL.rect(wx, wy, ww, wh, sho, (xx, yy) => (yy < wy + wh * 0.5 ? 0.85 : 0.6));
          for (let lx = wx + s(6); lx < wx + ww - 1; lx += s(6)) FL.rect(lx, wy, 1, wh, lat, 0);
          for (let ly = wy + s(5); ly < wy + wh - 1; ly += s(5)) FL.rect(wx, ly, ww, 1, lat, 0);
          FL.rect(wx - 1, wy - 1, ww + 2, 1, lat, 0); FL.rect(wx - 1, wy + wh, ww + 2, 1, lat, 0);
        } else FL.rect(x + s(14), top + s(8), s(22), oy(0.22) - top - s(8), P.mat('#2a2030', { n: 3, at: 1 }), 1); // a dark doorway
      }
      FL.outline();
      g.drawImage(FL.canvas(), 0, 0);
      // the paving: big stones in offset courses, warm before the stage and round the seat
      const seatX = ox(0.8), seatY = oy(0.88);
      const posts = [[ox(0.69), oy(0.66)], [ox(0.95), oy(0.58)], [ox(0.97), oy(0.9)]];
      const pools = [[ox(0.37), oy(0.5), iw * 0.42, (G.H) * 0.22, 0.75], [seatX - s(4), seatY - s(2), s(40), s(14), 0.8], [ox(0.5), oy(0.22), iw * 0.5, s(10), 0.35]]
        .concat(posts.map(([x, y]) => [x, y + s(14), s(30), s(10), 0.4]));
      const ST = ['#2c2427', '#352b2c', '#433534', '#58443c', '#725846'].map(hex3);
      {
        const y0 = oy(0.22), im = g.getImageData(0, y0, w, h - y0), dd = im.data;
        for (let y = y0; y < h; y++) {
          const row = Math.floor((y - y0) / Math.max(4, s(7))), jy = (y - y0) % Math.max(4, s(7)) === 0;
          for (let x = 0; x < w; x++) {
            let wm = 0;
            for (const [px2, py2, rx, ry, k] of pools) { const a = (x - px2) / rx, b = (y - py2) / ry, q = 1 - (a * a + b * b); if (q > 0) wm += q * k; }
            const jx = (x + (row % 2) * s(9)) % Math.max(6, s(18)) === 0;
            let fi = Math.min(0.999, wm) * (ST.length - 1) + (jy || jx ? -1 : 0);
            fi = clamp(fi, 0, ST.length - 1);
            const i0 = Math.floor(fi), c = ST[Math.min(ST.length - 1, fi - i0 > bay(x, y) ? i0 + 1 : i0)];
            const o = ((y - y0) * w + x) * 4; dd[o] = c[0]; dd[o + 1] = c[1]; dd[o + 2] = c[2]; dd[o + 3] = 255;
          }
        }
        g.putImageData(im, 0, y0);
      }
      // the stage: the platform's boards, its front hung with red and white (kōhaku-maku), poles at its
      // front corners with a chōchin on each, a drum on its stand at the right-hand end
      const SL = P.layer(w, h), sx0 = ox(0.08), sx1 = ox(0.64), sy0 = oy(0.27), sy1 = oy(0.39), sy2 = oy(0.47);
      const board = P.mat('#a87a50', { n: 6, at: 3, step: 0.07 }), edge = P.mat('#4a2e22', { n: 4, at: 2 });
      SL.rect(sx0, sy0, sx1 - sx0, sy1 - sy0, board, (x, y) => clamp(0.55 + (y - sy0) / (sy1 - sy0) * 0.4 - ((y - sy0) % Math.max(3, s(4)) === 0 ? 0.25 : 0), 0, 0.999));
      SL.rect(sx0 - 1, sy1, sx1 - sx0 + 2, Math.max(2, s(2.5)), edge, (x, y) => (y < sy1 + 1 ? 3 : 1));
      const sw = Math.max(3, s(6)), kohaku = P.mat(null, { cols: ['#6a2426', '#9a3632', '#b8443c', '#a89c90', '#d0c6b6', '#e6ddcc'], at: 2 });
      SL.fill(sx0, sy1 + s(2.5), sx1, sy2, () => true, kohaku, (x, y) => {
        const k = Math.floor((x - sx0) / sw) % 2, fold = (x - sx0) % sw;
        return (k ? 0.68 : 0.15) + (fold === sw - 1 ? -0.12 : fold < 2 ? 0.14 : 0) + (y > sy2 - s(3) ? -0.1 : 0);
      });
      SL.rect(sx0, sy2, sx1 - sx0, Math.max(1, s(1.5)), edge, 0);
      const pole = P.mat('#4e3222', { n: 4, at: 2 });
      for (const px2 of [sx0 + s(2), sx1 - s(4)]) SL.rect(px2, oy(0.03), Math.max(2, s(2.5)), sy2 - oy(0.03), pole, (x) => (x < px2 + 1 ? 3 : 1));
      // the drum
      const dx = ox(0.58), dy = oy(0.3), dr = s(7);
      SL.rect(dx - dr + s(1), dy, Math.max(1, s(1.5)), s(8), pole, 1); SL.rect(dx + dr - s(2), dy, Math.max(1, s(1.5)), s(8), pole, 1);
      SL.ell(dx, dy, dr, dr * 0.75, P.mat('#7a3a26', { n: 5, at: 2 }), P.sphere(dx - dr * 0.4, dy - dr * 0.3, dr, dr * 0.75, { amb: 0.2 }));
      SL.ell(dx, dy - dr * 0.45, dr * 0.72, dr * 0.32, P.mat('#d8c8a6', { n: 4, at: 2 }), (x) => (x < dx ? 0.95 : 0.6));
      SL.outline();
      g.drawImage(SL.canvas(), 0, 0);
      // the chōchin: a string of small ones between the poles, a big one on each pole
      const big = chochin(Math.max(3, s(5)), Math.max(6, s(10)), true, Math.max(2, s(3)));
      for (const px2 of [sx0 + s(3), sx1 - s(3)]) g.drawImage(big.cv, Math.round(px2 - big.W / 2), oy(0.16));
      cord(g, sx0 + s(3), oy(0.08), sx1 - s(3), oy(0.08), s(8), '#2a1e1e');
      const lit = string(sx0 + s(3), oy(0.08), sx1 - s(3), oy(0.08), s(8), s(11));
      // the audience: two rows of benches, people seen from behind, watching the stage
      const AL = P.layer(w, h), bench = P.mat('#5e3e2c', { n: 4, at: 2 });
      const ROBES = ['#2e3a5a', '#5a4030', '#4a4a52', '#5a3044', '#3a4a3a', '#6a5a3a'].map((c2) => P.mat(c2, { n: 4, at: 2, step: 0.09 }));
      const HAIRS = ['#1e1a1c', '#35302e', '#8a8a90', '#3b2a20'].map((c2) => P.mat(c2, { n: 3, at: 1 }));
      const rp = P.rnd(8821);
      for (const [rowY, k] of [[oy(0.6), 0.85], [oy(0.75), 1]]) {
        const bx0 = ox(0.04), bx1 = ox(0.62), fs = s(15 * k);
        AL.rect(bx0, rowY, bx1 - bx0, Math.max(2, s(3 * k)), bench, (x, y) => (y < rowY + 1 ? 3 : 1));
        for (let x = bx0 + s(9); x < bx1 - s(6); x += s(16 * k) + Math.round(rp() * s(6))) {
          if (rp() < 0.18) continue;
          const kid = rp() < 0.2 ? 0.75 : 1, bw = fs * 0.55 * kid, bh = fs * 0.9 * kid, M = ROBES[Math.floor(rp() * ROBES.length)];
          AL.poly([[x - bw, rowY + 1], [x - bw * 0.8, rowY - bh * 0.7], [x - bw * 0.4, rowY - bh], [x + bw * 0.4, rowY - bh], [x + bw * 0.8, rowY - bh * 0.7], [x + bw, rowY + 1]], M,
            (xx, yy) => clamp((yy < rowY - bh * 0.82 ? 0.85 : 0.35) + (xx < x - bw * 0.5 ? 0.12 : 0), 0, 0.999));
          const hr = fs * 0.3 * kid;
          AL.ell(x, rowY - bh - hr * 0.7, hr, hr * 1.05, HAIRS[Math.floor(rp() * HAIRS.length)], (xx, yy) => (yy < rowY - bh - hr * 1.2 ? 0.95 : 0.4));
        }
      }
      AL.outline();
      g.drawImage(AL.canvas(), 0, 0);
      // Hiro's seat, apart at the front: a chair turned toward the stage, its folded red cloth, the name
      // slip propped against its back, and on the seat the one glass globe, lit
      const CL = P.layer(w, h), cw = P.mat('#8a5a3a', { n: 5, at: 3, step: 0.08 }), cloth = P.mat('#c8603a', { n: 4, at: 2, step: 0.08 });
      const paper = P.mat('#f4ecd8', { n: 4, at: 3, step: 0.06 }), ink = P.solid('#3a2a2a'), cap = P.mat('#3a2e2a', { n: 3, at: 1 });
      const q = (n) => Math.max(1, Math.round(n * Z * 1.6)), stY = seatY - q(11);
      // far legs, the seat (its top seen from above), near legs, the back on the right
      CL.rect(seatX - q(6), stY + q(1), Math.max(1, q(1)), q(10), cw, 1); CL.rect(seatX + q(5), stY + q(1), Math.max(1, q(1)), q(10), cw, 1);
      CL.poly([[seatX - q(8), stY + q(2)], [seatX - q(6), stY - q(1)], [seatX + q(7), stY - q(1)], [seatX + q(5), stY + q(2)]], cw, (x, y) => (y < stY ? 0.95 : 0.7));
      CL.rect(seatX - q(8), stY + q(2), q(13), Math.max(1, q(1.5)), cw, 1);
      CL.rect(seatX - q(8), stY + q(3), Math.max(1, q(1.2)), q(8), cw, 2); CL.rect(seatX + q(4), stY + q(3), Math.max(1, q(1.2)), q(8), cw, 1);
      CL.rect(seatX + q(4), stY - q(12), Math.max(1, q(1.4)), q(14), cw, 2); CL.rect(seatX + q(6), stY - q(13), Math.max(1, q(1.2)), q(13), cw, 1);
      for (const ry of [q(11), q(6)]) CL.rect(seatX + q(4), stY - ry, q(3.5), Math.max(1, q(1)), cw, (x) => (x < seatX + q(5) ? 3 : 1));
      // the cloth, folded on the seat by the back
      CL.rect(seatX - q(1), stY - q(2), q(5), q(2), cloth, (x, y) => (y < stY - q(2) + 1 ? 3 : 1));
      // the slip, propped against the back: careful brush marks (a name, written down)
      const slx = seatX + q(1.5), sly = stY - q(10);
      CL.rect(slx, sly, q(2.5), q(8), paper, (x) => (x < slx + 1 ? 0.95 : 0.6));
      for (const [mx, my] of [[0.8, 1.6], [0.8, 3.4], [1.2, 5.2]]) CL.dot(Math.round(slx + q(mx)), Math.round(sly + q(my)), ink, 0);
      // the globe: round amber glass on the seat, a dark cap, lit from within
      const gx = seatX - q(4), gy = stY - q(4.2), gr = q(3.4);
      CL.ell(gx, gy, gr, gr * 1.05, P.mat(null, { cols: ['#a85a24', '#d8822e', '#f0a848', '#ffcc78', '#ffe8b0'], at: 2, lineCol: '#4a2410' }),
        (x, y) => clamp(1 - Math.hypot(x - gx + gr * 0.2, y - gy) / (gr * 1.15), 0, 0.999));
      CL.rect(gx - q(1.6), gy - gr - q(1), q(3.2), q(1.4), cap, (x) => (x < gx ? 2 : 1));
      CL.outline();
      g.drawImage(CL.canvas(), 0, 0);
      posts.forEach(([x, y]) => R(g, x, y, Math.max(1, s(1.5)), s(14), '#3a2a22'));
      return { cv, lit, posts, globe: [gx, gy, gr], seat: [seatX, seatY], dancer: [ox(0.33), oy(0.36)], chochin: [[sx0 + s(3), oy(0.16) + big.H / 2], [sx1 - s(3), oy(0.16) + big.H / 2]] };
    });
  }
  function drawSeat(c, G, t, still) {
    const S = seatView(G), P = K(), { s, Z } = G;
    c.drawImage(S.cv, 0, 0);
    // the stage's lanterns: their light flickers a little
    for (const [x, y] of S.chochin) P.halo(c, x, y, s(20), '255,170,90', still ? 0.18 : 0.16 + 0.04 * Math.sin(t / 330 + x), 3);
    lamps(c, S.lit, t, still, Math.max(2, s(3)), true);
    globes(c, S.posts, t, still, Math.max(1, s(2)));
    // Suzu, dancing (not when she is up here with you)
    if (!suzuHere()) {
      const pose = still ? 0 : Math.floor(t / 900) % 4 === 3 ? 2 : Math.floor(t / 900) % 2, D = dancer(Math.round(Z * 85) / 100, pose);
      const [dx, dy] = S.dancer, bob = still || pose !== 2 ? 0 : -1;
      c.fillStyle = 'rgba(20,10,10,0.35)'; P.disc(c, dx, dy, s(6), Math.max(1, s(1.5)));
      c.drawImage(D.cv, dx - D.ax, dy - D.ay + bob);
    }
    // the one globe: its light on the seat and the stones, and the glass glowing
    const [gx, gy, gr] = S.globe, f = still ? 0.9 : 0.86 + 0.08 * Math.sin(t / 520) + 0.04 * Math.sin(t / 143);
    P.halo(c, gx, gy, gr * 6, '255,180,90', 0.3 * f, 4);
    c.fillStyle = 'rgba(255,236,190,' + (0.55 * f).toFixed(2) + ')'; P.disc(c, gx - 1, gy - 1, Math.max(1, Math.round(gr * 0.45)));
  }

  // ---- 3. north: the road on, the peaks with snow -----------------------------------------------
  function northView(G) {
    return cached(key('lknorth', G), () => {
      const { w, h, x0, iw, ox, oy, s } = G, P = K();
      const cv = mk(w, h), g = cv.getContext('2d'), bay = P.bayer;
      g.imageSmoothingEnabled = false;
      const U = (x) => (x - x0) / iw, base = oy(0.62);
      // the range's crest: key points (summits and saddles), refined with a seeded midpoint displacement
      const KP = [[-0.04, 0.5], [0.06, 0.37], [0.15, 0.47], [0.26, 0.24], [0.36, 0.41], [0.44, 0.33], [0.5, 0.43], [0.61, 0.11], [0.7, 0.31], [0.78, 0.24], [0.87, 0.4], [0.95, 0.29], [1.06, 0.46]];
      let pts = KP.map(([u, v]) => [x0 + u * iw, oy(v)]);
      const rn = P.rnd(6607);
      for (let it = 0, amp = s(5); it < 4; it++, amp *= 0.55) {
        const nx = [pts[0]];
        for (let i = 1; i < pts.length; i++) { const [xa, ya] = pts[i - 1], [xb, yb] = pts[i]; nx.push([(xa + xb) / 2 + (rn() - 0.5) * amp * 0.6, (ya + yb) / 2 + (rn() - 0.5) * amp], pts[i]); }
        pts = nx;
      }
      const crest = new Float32Array(w);
      for (let x = 0, j = 0; x < w; x++) { while (j < pts.length - 2 && pts[j + 1][0] < x) j++; const [xa, ya] = pts[j], [xb, yb] = pts[j + 1]; crest[x] = ya + (yb - ya) * clamp((x - xa) / Math.max(1e-3, xb - xa), 0, 1); }
      const summits = [1, 3, 5, 7, 9, 11].map((i) => ({ x: x0 + KP[i][0] * iw, y: oy(KP[i][1]) }));
      const owner = (x) => { let best = summits[0], bd = 1e9; for (const S of summits) { const dd = Math.abs(x - S.x) * (0.6 + (S.y - oy(0.1)) / G.H); if (dd < bd) { bd = dd; best = S; } } return best; };
      const minC = Math.min(...summits.map((S) => S.y));
      const stars = sky(g, w, base, ['#070a1c', '#0a0e22', '#0e1329', '#121831', '#161d39', '#1b2342', '#212a4b', '#283255'], 9091, 1100, (x) => crest[x] | 0);
      // the peaks: snow above a ragged line, deeper on the higher peaks; lit to the left of each spine
      const SNL = ['#b6c4dc', '#d2dcec', '#eaf0f8'].map(hex3), SNS = ['#566488', '#6a789e', '#7e8cb2'].map(hex3), RKL = hex3('#3a4266'), RKS = hex3('#262c4a'), RKD = hex3('#1e2440');
      const y0 = Math.max(0, Math.floor(minC) - 1), im = g.getImageData(0, y0, w, base + s(4) - y0), dd = im.data, W2 = w;
      for (let x = 0; x < w; x++) {
        const cy = crest[x], S = owner(x), hgt = clamp((base - cy) / Math.max(1, base - minC), 0, 1);
        const snowTo = cy + (base - cy) * (0.18 + 0.42 * hgt) + s(3) * Math.sin(x * 0.37) + s(2.5) * Math.sin(x * 0.91 + 2) + (Math.sin(x * 0.53 + S.x) > 0.6 ? s(5) * hgt : 0);
        for (let y = Math.ceil(cy); y < base + s(4); y++) {
          const spine = S.x + (y - S.y) * 0.22, lit = x < spine, depth = (y - cy) / Math.max(1, base - cy);
          // gullies: a few dark runs down each face, slanting outward from the spine
          const rib = depth > 0.1 && y < snowTo - s(2) && Math.sin((x - spine) * 0.21 / G.Z - (y - S.y) * 0.05 * Math.sign(x - spine) + S.x * 0.37) > 0.9 && Math.sin(y * 0.3 / G.Z + x * 0.05) > -0.3;
          let c;
          if (y < snowTo - (bay(x, y) < 0.5 ? 0 : 1)) {
            if (lit) { const k = rib ? 0 : depth < 0.12 ? 2 : depth < 0.3 && bay(x, y) < 0.5 ? 2 : 1; c = SNL[k]; }
            else { const k = rib ? 2 : x - spine < s(3) ? 0 : 1; c = SNS[k]; }
          } else c = rib ? RKD : lit ? RKL : RKS;
          const o = ((y - y0) * W2 + x) * 4; dd[o] = c[0]; dd[o + 1] = c[1]; dd[o + 2] = c[2]; dd[o + 3] = 255;
        }
      }
      g.putImageData(im, 0, y0);
      // glints for the snow (live): spots on the lit faces near the crests
      const glints = [];
      for (let i = 0; i < 400 && glints.length < 22; i++) {
        const x = Math.floor(x0 + rn() * iw), y = Math.round(crest[x] + rn() * s(10)), S = owner(x);
        if (x < S.x + (y - S.y) * 0.22 && y < base - s(10)) glints.push([x, y, rn() * 6.28, 700 + Math.round(rn() * 1600)]);
      }
      // a band of moonlit haze in the valley before the range
      for (let y = base - s(6); y < base + s(2); y++) for (let x = (y & 1) * 2; x < w; x += 4) R(g, x, y, 2, 1, 'rgba(150,166,206,' + (0.1 + 0.1 * (y - base + s(6)) / s(8)).toFixed(2) + ')');
      // the foothills, wooded, with a notch where the road goes over; then the orchard slope we look out
      // over, terraced, nearest at the bottom, the road winding up it
      const notch = 0.56;
      const hill1 = (x) => { const u = U(x); return Math.round(oy(0.6) + s(5) * Math.sin(u * 5.3 + 0.8) + s(2) * Math.sin(u * 17) + (Math.abs(u - notch) < 0.03 ? s(4) * (1 - Math.abs(u - notch) / 0.03) : 0)); };
      const hill2 = (x) => { const u = U(x); return Math.round(oy(0.72) + s(4) * Math.sin(u * 3.1 + 2.2) + s(1.5) * Math.sin(u * 11 + 1) + s(6) * Math.pow(Math.abs(u - 0.5) * 2, 2)); };
      const CON = P.layer(w, h), pine = P.mat('#1a2236', { n: 4, at: 2, step: 0.06 });
      for (let x = 0; x < w; x++) { const a = hill1(x); R(g, x, a, 1, h - a, '#141a30'); R(g, x, a, 1, 1, '#232b48'); }
      for (let x = x0 + rn() * s(6), grove = 0; x < G.x1; x += s(3) + rn() * s(3)) {
        if (grove-- <= 0) { x += s(10) + rn() * s(30); grove = 4 + Math.floor(rn() * 8); continue; }
        if (Math.abs(U(x) - notch) < 0.05) continue;
        const a = hill1(x) + s(1), th = s(4) + rn() * s(3);
        CON.poly([[x, a - th], [x - th * 0.42, a + 1], [x + th * 0.42, a + 1]], pine, (xx) => (xx < x ? 0.85 : 0.4));
      }
      CON.outline({ lit: false });
      g.drawImage(CON.canvas(), 0, 0);
      const NT2 = 4;
      for (let x = 0; x < w; x++) {
        const b = hill2(x);
        R(g, x, b, 1, h - b, '#100f1c'); R(g, x, b, 1, 1, '#2c2634');
        for (let k = 1; k < NT2; k++) { const ly = b + Math.round(s(10) * k * (0.7 + 0.35 * k)) + Math.round(Math.sin(U(x) * 6 + k) * s(2)); if (ly < h) { R(g, x, ly, 1, 1, '#2a2230'); R(g, x, ly + 1, 1, 1, '#0b0a14'); } }
      }
      // the road north: pale in the moonlight, winding up the slope, narrowing to the notch
      const road = P.layer(w, h), dirt = P.mat('#5c5a6e', { n: 4, at: 2, step: 0.08 });
      const vTopR = (hill1(ox(notch)) - G.yT) / G.H, RD = [];
      for (let v = 1.05; v >= vTopR; v -= 0.01) {
        const k = (v - vTopR) / (1.05 - vTopR);
        RD.push([ox(notch - 0.02 + 0.07 * k * Math.sin(k * 7.5 + 0.6)), oy(v), Math.max(1, s(1 + 5 * k * k))]);
      }
      for (let i = 1; i < RD.length; i++) {
        const [xa, ya, wa] = RD[i - 1], [xb, yb] = RD[i];
        if (yb > hill1(Math.round(xb)) - 1 && yb < hill2(Math.round(xb)) - 1 && ya < hill2(Math.round(xa))) continue; // behind the near slope's crest
        road.seg(xa, ya, xb, yb, wa, dirt, (x, y) => (x < xa ? 0.95 : 0.6));
      }
      road.outline({ lit: false });
      g.drawImage(road.canvas(), 0, 0);
      // orchard groves on the near terraces, dark, their tops faintly warm from the festival behind us
      const TL = P.layer(w, h), tree = P.mat('#2c1c24', { n: 4, at: 2, step: 0.07 }), rt = P.rnd(1201);
      for (let k = 0; k < NT2; k++) {
        const r0 = Math.max(2, s(2.2 + k * 1.6));
        for (let x = x0 + rt() * s(10), left = 0; x < G.x1 + r0; ) {
          if (left <= 0) { x += r0 * (2 + rt() * 5); left = 3 + Math.floor(rt() * 6); continue; }
          left--;
          const b = hill2(x), y = b + Math.round(s(10) * k * (0.7 + 0.35 * k)) - (k ? 1 : 0), r = r0 * (0.85 + rt() * 0.3);
          const onRoad = RD.some(([rx, ry, rw]) => Math.abs(ry - y) < r + 2 && Math.abs(rx - x) < rw + r + 1);
          if (!onRoad && y < h) TL.ell(x, y - r * 0.6, r, r * 0.8, tree, (xx, yy) => (yy < y - r * 1.1 ? 0.9 : xx < x ? 0.55 : 0.3));
          x += r * (1.7 + rt() * 0.4);
        }
      }
      TL.outline({ lit: false });
      g.drawImage(TL.canvas(), 0, 0);
      return { cv, stars, glints, crest, base, summit: summits[3] };
    });
  }
  function drawNorth(c, G, t, still) {
    const N = northView(G);
    c.drawImage(N.cv, 0, 0);
    twinkle(c, N.stars, t, still);
    // the snow gleaming: small stars of light that come and go on the lit faces
    for (const [x, y, ph, beat] of N.glints) {
      const k = still ? (ph > 4.6 ? 1 : 0) : Math.max(0, Math.sin(t / beat + ph));
      if (k < 0.55) continue;
      const a = (0.35 + (k - 0.55) * 1.4).toFixed(2);
      c.fillStyle = 'rgba(255,255,255,' + a + ')'; c.fillRect(x, y, 1, 1);
      if (k > 0.85) { c.fillStyle = 'rgba(240,246,255,' + (a * 0.5).toFixed(2) + ')'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
    }
    // the festival behind us warms the rail's top a little
    c.fillStyle = 'rgba(255,170,90,0.18)'; c.fillRect(0, G.yR, G.w, Math.max(1, G.s(2)));
  }

  let last = null; // the size last drawn at (tests)
  RB.interlude.ART.co_lookout = {
    stages: ['village', 'seat', 'north'],
    draw(c, w, h, t, st) {
      const G = geom(w, h, st.vb);
      last = { w, h, vb: st.vb };
      c.fillStyle = '#0d0c16'; c.fillRect(0, 0, w, h);
      if (st.stage === 'seat') drawSeat(c, G, t, st.still);
      else if (st.stage === 'north') drawNorth(c, G, t, st.still);
      else drawVillage(c, G, t, st.still);
      c.drawImage(frame(G), 0, 0);
    },
    // tests: where the things the lines name are, against the dialogue sheet's top (vb); by default at the
    // size last drawn
    probe(w, h, vb) {
      if (w == null) { if (!last) return null; ({ w, h, vb } = last); }
      const G = geom(w, h, vb), V = villageView(G), S = seatView(G), N = northView(G);
      return { yR: G.yR, vb, villageSeat: V.seat, ridge: V.ridge, globe: S.globe, seat: S.seat, dancer: !suzuHere(), dancerAt: S.dancer, peak: N.summit, base: N.base };
    },
  };
})();
