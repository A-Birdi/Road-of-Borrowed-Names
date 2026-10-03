/* The prologue's bridge in the morning (shot 5): an arched wooden bridge
 * across a river that widens toward us between grassy banks. It is still
 * there, railings, capped posts and braced piers, but it stops short: past
 * three fifths of its span its planks end ragged, one hangs, and motes drift
 * up from the break as if the rest had been unwritten. On the far bank only
 * its landing and end post wait, and a lone pier stands in the water between.
 * Morning sky in bands, hazy ridges, a far shore wood. Drawn with RB.pxkit at
 * art resolution in the title scene's manner (see 41_prologue_art.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, cached, stage, bandsIn } = A.kit;
  const K = () => RB.pxkit;
  const rampC = (base, n, o) => K().ramp(base, n, o).map((c) => K().css(c));
  const BREAK = 0.6;

  function geom(w, h, vb) {
    const S = stage(w, h, vb), { cx, s } = S;
    const yH = Math.round(vb * 0.42);                         // the far shore
    const hw = (y) => w * (0.2 + 0.3 * clamp((y - yH) / Math.max(1, h - yH), 0, 1)); // the river's half-width
    // the river's centre, meandering a little, and its banks' small irregularities
    const mid = (y) => cx + Math.sin((y - yH) * 0.011) * s(16) * (0.4 + clamp((y - yH) / Math.max(1, h - yH), 0, 1));
    const wob = (y, side) => Math.round(Math.sin(y * 0.23 + side * 2) * 1.2 + Math.sin(y * 0.061 + side * 5) * s(3) * clamp((y - yH) / 60, 0, 1));
    const yBr = Math.round(yH + (vb - yH) * 0.36);           // where the bridge meets the banks
    const yW = yBr + s(6);                                     // the water under it
    const bx0 = Math.round(mid(yBr) - hw(yBr) - s(16)), bx1 = Math.round(mid(yBr) + hw(yBr) + s(16));
    const ah = Math.max(s(10), Math.round((bx1 - bx0) * 0.11));
    const top = (x) => yBr - Math.round(ah * Math.sin((Math.PI * (x - bx0)) / (bx1 - bx0)));
    const xb = Math.round(bx0 + (bx1 - bx0) * BREAK);
    return Object.assign(S, { yH, hw, mid, wob, yBr, yW, bx0, bx1, ah, top, xb, w, h, vb });
  }

  function scene(w, h, vb) {
    return cached('bridge|' + w + 'x' + h + '|' + Math.round(vb), () => {
      const G = geom(w, h, vb), { yH, hw, mid, wob, yBr, yW, bx0, bx1, top, xb, s } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const P = K(), rnd = P.rnd(5521);
      // sky: morning, deep blue above warming to cream at the horizon
      bandsIn(g, 0, 0, w, yH, ['#6c8fbe', '#7a9cc6', '#8aa9ce', '#9cb6d4', '#b0c3d8', '#c4d0da', '#d8dad6', '#eae0ca'], 0.45);
      // the sun, low on the left behind a stepped halo
      const sx = Math.round(w * 0.2), sy = Math.round(yH * 0.58), sr = Math.max(4, s(7));
      P.halo(g, sx, sy, sr * 6, '255,240,210', 0.26, 5);
      g.fillStyle = '#fff4dc'; P.disc(g, sx, sy, sr); g.fillStyle = '#fffaf0'; P.disc(g, sx - 1, sy - 1, Math.max(1, sr - 2));
      // clouds: flat banks with a lit top and a cooler underside
      const CL = P.layer(w, h);
      const cloud = P.mat('#d6dce8', { n: 5, at: 2, step: 0.07 });
      for (const [fx, fy, cw] of [[0.62, 0.3, 0.22], [0.86, 0.5, 0.16], [0.38, 0.62, 0.12]]) {
        const ccx = Math.round(w * fx), ccy = Math.round(yH * fy), W2 = Math.round(w * cw / 2);
        for (let i = 0; i < 6; i++) {
          const ex = ccx - W2 + Math.round((W2 * 2 * (i + 0.5)) / 6), er = Math.round(W2 * (0.24 + 0.12 * Math.sin(i * 2.3 + fx * 9))), ery = Math.max(2, Math.round(er * 0.45));
          CL.ell(ex, ccy - Math.round(ery * 0.4), er, ery, cloud, (x, y) => (y < ccy - ery * 0.6 ? 0.95 : y < ccy ? 0.62 : 0.3));
        }
        CL.rect(ccx - W2, ccy, W2 * 2, s(2), cloud, 0.3);
      }
      g.drawImage(CL.canvas(), 0, 0);
      // ridges in haze, far to near
      const ridge = (base, amp, f1, f2, ph, col, crest) => {
        for (let x = 0; x < w; x++) {
          const v = Math.sin(x / (w * f1) + ph) * 0.6 + Math.sin(x / (w * f2) + ph * 2.3) * 0.4;
          const t1 = Math.round(base - amp * (0.55 + v * 0.45));
          R(g, x, t1, 1, yH - t1 + 1, col);
          if (crest) R(g, x, t1, 1, 1, crest);
        }
      };
      ridge(yH, s(34), 0.14, 0.05, 1.1, '#a4b4cc', '#b8c6d6');
      ridge(yH, s(20), 0.09, 0.03, 2.7, '#8a9cbc', '#9cacc6');
      for (let y = yH - s(8); y < yH; y++) for (let x = (y & 1) * 2; x < w; x += 4) R(g, x, y, 2, 1, 'rgba(232,226,210,0.35)');
      // the far shore: a wood in clumps with sunlit crowns, a temple roof among them
      for (let x = -s(4); x < w + s(4); x += s(5) + Math.floor(rnd() * s(4))) {
        const r = s(4) + Math.floor(rnd() * s(4)), cy = yH - Math.round(r * 0.6);
        g.fillStyle = '#4a6466'; P.disc(g, x, cy, r, Math.round(r * 0.8));
        g.fillStyle = '#62807a'; P.disc(g, x - 1, cy - Math.round(r * 0.35), Math.max(1, r - 2), Math.max(1, Math.round(r * 0.4)));
      }
      {
        const tx = Math.round(w * 0.68), tw = s(26), ty = yH - s(14);
        R(g, tx - tw / 2 + s(2), ty + s(5), tw - s(4), s(9), '#55596a');
        for (let j = 0; j < s(6); j++) { const ww = tw + s(12) - Math.round(j * j * 0.9) - j * 2; R(g, tx - ww / 2, ty + s(5) - j, ww, 1, j === 0 ? '#3a3e4c' : j === s(6) - 1 ? '#6a7084' : '#4a4e5e'); }
        R(g, tx - tw / 2 - s(6), ty + s(5), s(2), 1, '#3a3e4c'); R(g, tx + tw / 2 + s(4), ty + s(5), s(2), 1, '#3a3e4c');
        R(g, tx - s(1), ty - s(3), s(2), s(3), '#3a3e4c');
      }
      R(g, 0, yH, w, 1, '#5e6e58'); R(g, 0, yH + 1, w, 1, '#7a8a66');
      // the river: the sky's light near the far shore, deepening toward us
      bandsIn(g, 0, yH + 2, w, h - yH - 2, ['#b2c4d2', '#9eb4c8', '#88a6bf', '#7298b6', '#6088aa', '#52799c', '#466c8e'], 0.45);
      // the banks, left and right: meadow in strips that widen toward us, a sandy lip, a darker wet edge
      const GR = rampC('#5e8a42', 6, { at: 3, step: 0.08 });
      const GRr = K().ramp('#5e8a42', 6, { at: 3, step: 0.08 }), GM = K().css(K().mix(GRr[2], GRr[3], 0.5));
      for (let y = yH + 2; y < h; y++) {
        const d = (y - yH) / (h - yH), m = mid(y), half = hw(y);
        const l = Math.round(m - half + wob(y, 0)), r = Math.round(m + half + wob(y, 1));
        // field strips that widen toward us, soft dithered seams between them
        const f = Math.sqrt(Math.max(0, y - yH)) * 1.3, band = Math.floor(f) % 2, fr = f - Math.floor(f);
        for (const [x0, x1] of [[0, l], [r, w]]) {
          if (x1 <= x0) continue;
          R(g, x0, y, x1 - x0, 1, band ? GM : GR[3]);
          if (fr > 0.75 && d > 0.05) for (let x = x0 + ((y * 3) & 3); x < x1; x += 4) if (K().bayer(x, y) < (fr - 0.75) * 4) R(g, x, y, 1, 1, band ? GR[3] : GM);
        }
        const lip = Math.max(1, Math.round(1 + d * 3));
        R(g, l - lip, y, lip, 1, '#c8b88a'); R(g, l, y, 1, 1, '#5a6a6a');
        R(g, r, y, lip, 1, '#a8986e'); R(g, r - 1, y, 1, 1, '#3e5a6a');
      }
      // tufts and flowers in the meadow, larger toward us
      for (let n = 0; n < w * 0.9; n++) {
        const y = Math.round(yH + 4 + Math.pow(rnd(), 0.75) * (h - yH - 6)), m = mid(y), half = hw(y);
        const x = Math.round(rnd() * w);
        if (x > m - half - 3 && x < m + half + 3) continue;
        const d = (y - yH) / (h - yH), sz = 1 + Math.round(d * 4);
        R(g, x, y - sz * 2, 1, sz * 2, GR[1]); R(g, x - sz, y - sz, 1, sz, GR[1]); R(g, x + sz, y - sz - 1, 1, sz + 1, GR[1]);
        R(g, x, y - sz * 2, 1, 1, GR[5]);
        if (rnd() < 0.05) R(g, x + 2, y - sz, 2, 2, rnd() < 0.5 ? '#f0e6c0' : '#e8a8b8');
      }
      // ripple lines on the open water
      const glints = [];
      for (let n = 0; n < w * (h - yH) / 700; n++) {
        const y = Math.round(yH + 3 + Math.pow(rnd(), 1.2) * (h - yH - 4)), m = mid(y), half = hw(y) - 4;
        const x = Math.round(m - half + rnd() * half * 2), d = (y - yH) / (h - yH), len = 2 + Math.round(d * 12);
        if (x + len > m + half) continue;
        R(g, x, y, len, 1, d < 0.3 ? '#c4d4de' : '#7aa0bc');
        if (rnd() < 0.5) glints.push([x, y, len, rnd() * 6.28]);
      }
      // the bridge, the reflection first
      const wood = P.mat('#8a5a36', { n: 6, at: 3, step: 0.09 });
      const bronze = P.mat('#7a6a3a', { n: 5, at: 2 }), stone = P.mat('#8a8a8e', { n: 5, at: 2, step: 0.1 });
      const B = P.layer(w, h);
      const dk = s(6), rail = s(13), seg = (x) => x <= xb || x >= Math.round(bx0 + (bx1 - bx0) * 0.93);
      // the abutments: dressed stone where the bridge meets each bank
      for (const ax of [bx0 - s(6), bx1 - s(8)]) B.stone([[ax, yBr - s(2)], [ax + s(14), yBr - s(2)], [ax + s(16), yW + s(6)], [ax - s(2), yW + s(6)]], stone, { face: 2, bevel: 2 });
      // piers with cross bracing, and the lone pier left standing past the break
      for (const u of [0.18, 0.4, 0.82]) {
        const x = Math.round(bx0 + (bx1 - bx0) * u), y0 = top(x) + dk - 1, lone = u > BREAK;
        const bot = yW + s(lone ? 2 : 4);
        B.rect(x - s(4), lone ? y0 + s(10) : y0, s(3), bot - (lone ? y0 + s(10) : y0), wood, (xx) => (xx < x - s(3) ? 0.7 : 0.3));
        B.rect(x + s(2), lone ? y0 + s(14) : y0, s(3), bot - (lone ? y0 + s(14) : y0), wood, (xx) => (xx < x + s(3) ? 0.6 : 0.25));
        if (!lone) { B.seg(x - s(3), y0 + s(2), x + s(4), bot - s(2), Math.max(1, s(1.4)), wood, 0.2); B.seg(x + s(4), y0 + s(2), x - s(3), bot - s(2), Math.max(1, s(1.4)), wood, 0.25); }
      }
      // the deck's side beam, following the arch, with plank ends and a lit top edge; ragged at the break
      for (let x = bx0; x <= bx1; x++) {
        if (!seg(x)) continue;
        const t0 = top(x);
        let d2 = dk;
        if (x > xb - s(8) && x <= xb) { const k2 = (x - (xb - s(8))) / s(8); d2 = Math.max(1, Math.round(dk * (1 - k2 * 0.7) + ((x * 7) % 3) - 1)); }
        B.rect(x, t0, 1, d2, wood, (xx, yy) => (yy < t0 + 1 ? 0.95 : yy < t0 + 2 ? 0.7 : yy > t0 + d2 - 2 ? 0.15 : 0.45));
        if ((x - bx0) % s(4) === 0) B.line(x, t0 + 2, x, t0 + d2 - 1, wood, 1);
      }
      // a plank hanging from the break
      B.seg(xb - s(2), top(xb) + s(2), xb + s(5), top(xb) + s(16), Math.max(2, s(2.5)), wood, (xx) => (xx < xb + s(1) ? 0.6 : 0.3));
      // railing: posts, a top rail and a middle rail; the post at the break snapped short
      const postAt = [];
      for (let x = bx0 + s(2); x <= bx1 - s(2); x += s(16)) if (seg(x)) postAt.push(x);
      if (postAt[postAt.length - 1] !== bx1 - s(4)) postAt.push(bx1 - s(4));
      for (let i = 0; i < postAt.length; i++) {
        const x = postAt[i], t0 = top(x), snapped = x <= xb && x > xb - s(16);
        const ph = snapped ? s(6) : rail;
        B.rect(x - 1, t0 - ph, s(3), ph, wood, (xx) => (xx < x ? 0.85 : 0.35));
        if (snapped) { B.dot(x - 1, t0 - ph - 1, wood, 2); B.dot(x + 1, t0 - ph, wood, 4); }
        const end = i === 0 || x >= bx1 - s(6) || (x <= xb && postAt[i + 1] > xb);
        if (end && !snapped) { B.ell(x + 0.5, t0 - ph - s(2), s(2.6), s(2.6), bronze, P.sphere(x - 0.5, t0 - ph - s(3), s(2.6), s(2.6))); B.rect(x, t0 - ph - s(6), 1, s(2), bronze, 3); }
      }
      for (let x = bx0 + s(2); x <= bx1 - s(2); x++) {
        if (!seg(x)) continue;
        const brk = x > xb - s(12) && x <= xb;
        if (!brk || x < xb - s(9)) { B.rect(x, top(x) - rail, 1, s(2), wood, (xx, yy) => (yy < top(x) - rail + 1 ? 0.9 : 0.4)); }
        if (!brk) B.dot(x, top(x) - Math.round(rail * 0.5), wood, 2);
      }
      B.outline();
      const bc = B.canvas();
      // reflection: the bridge mirrored about the water under it, dim and broken by ripples
      {
        const rc = mk(w, h), rg = rc.getContext('2d');
        rg.save(); rg.translate(0, yW * 2); rg.scale(1, -1); rg.drawImage(bc, 0, 0); rg.restore();
        rg.globalCompositeOperation = 'source-atop'; rg.fillStyle = 'rgba(40,70,100,0.55)'; rg.fillRect(0, 0, w, h);
        rg.globalCompositeOperation = 'destination-out';
        for (let y = yW; y < h; y += 3) rg.fillRect(0, y, w, 1);
        rg.fillRect(0, 0, w, yW + 1);
        g.globalAlpha = 0.6; g.drawImage(rc, 0, 0); g.globalAlpha = 1;
      }
      // the bridge's shadow on the water, then the bridge
      g.fillStyle = 'rgba(30,50,80,0.25)';
      for (let x = bx0; x <= bx1; x++) if (seg(x)) g.fillRect(x + s(3), yW, 1, s(3));
      g.drawImage(bc, 0, 0);
      // reeds at the waterline on both banks
      for (let y = yH + s(10); y < h; y += 3 + Math.floor(rnd() * 5)) {
        const d = (y - yH) / (h - yH), m = mid(y), half = hw(y), hh = Math.round(s(4) + d * s(16) * (0.6 + rnd() * 0.6));
        for (const x of [Math.round(m - half + wob(y, 0)) - 2 - Math.floor(rnd() * 4), Math.round(m + half + wob(y, 1)) + 2 + Math.floor(rnd() * 4)]) {
          if (rnd() < 0.45) continue;
          if (Math.abs(y - yBr) < s(14) && x > bx0 - s(10) && x < bx1 + s(10)) continue;
          R(g, x, y - hh, 1, hh, '#46683a'); R(g, x - 1, y - Math.round(hh * 0.4), 1, Math.round(hh * 0.4), '#3a5a32');
          R(g, x, y - hh, 1, 2, '#9a7a4a');
        }
      }
      return { cv, G, glints };
    });
  }

  A.SHOTS.bridge = (c, w, h, t, k, o) => {
    const S = scene(w, h, o.vb), G = S.G, { s, xb, top, yH } = G, still = o.still;
    c.drawImage(S.cv, 0, 0);
    // glints drifting on the water
    for (const [x, y, len, ph] of S.glints) {
      const kk = still ? 0.5 : (Math.sin(t / 1300 + ph) + 1) / 2;
      if (kk < 0.6) continue;
      const dx = still ? 0 : Math.round(Math.sin(t / 2400 + ph) * 3);
      c.fillStyle = 'rgba(246,250,252,' + (0.3 + (kk - 0.6) * 1.2).toFixed(2) + ')';
      c.fillRect(Math.round(x + dx), y, len, 1);
    }
    // a band of mist drifting low over the far water
    if (!still) {
      const off = Math.round(t / 160) % 8;
      c.fillStyle = 'rgba(240,242,240,0.16)';
      for (let y = yH + s(3); y < yH + s(11); y++) for (let x = ((y * 3 + off) % 8) - 8; x < w; x += 8) if (((x + off) >> 5) % 3) c.fillRect(x, y, 4, 1);
    }
    // the break: motes leaving it, wood colours paling to light as they rise
    if (still) return;
    const bx = xb, by = top(xb) + s(2);
    for (let i = 0; i < 9; i++) {
      const ph = (t / 3200 + i / 9) % 1;
      const x = bx + s(2) + ph * s(36) + Math.sin(ph * 6 + i * 1.7) * s(3), y = by - ph * s(26) + ((i * 5) % 7) - 3;
      const col = ph < 0.35 ? '138,90,54' : ph < 0.65 ? '200,160,110' : '250,240,214';
      c.fillStyle = 'rgba(' + col + ',' + (ph < 0.6 ? 0.9 : (1 - ph) * 2.2).toFixed(2) + ')';
      const sz = ph < 0.3 ? 2 : 1;
      c.fillRect(Math.round(x), Math.round(y), sz, sz);
    }
  };
})();
