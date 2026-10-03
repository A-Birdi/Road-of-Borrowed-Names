/* The prologue's riverbank lantern at night (shot 4): a chōchin hanging from
 * a post's arm out over the river, a name brushed down its paper. Through the
 * shot the name leaves it one stroke at a time — each stroke paling in steps,
 * then gone, a few motes rising from where it was — and the lamp's light
 * lowers with it. Behind: the far bank with its own lantern road, the night
 * sky in the title's bands. The name is abstract brush marks, not letters
 * (nothing here is text to read). Drawn with RB.pxkit at art resolution in
 * the title scene's manner (see 41_prologue_art.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, cached, stage, bandsIn, chochin } = A.kit;
  const K = () => RB.pxkit;

  function geom(w, h, vb) {
    const S = stage(w, h, vb), { cx, Zx, s } = S;
    const yH = Math.round(vb * 0.36);                       // the far bank
    const yN = Math.round(vb * 0.78);                       // the near bank's far edge
    const px = Math.round(cx - 70 * Zx);                    // the post
    const base = { x: px, y: yN + s(16) };                  // the post's foot, on the bank
    const lamp = { x: Math.round(px + 70 * Zx), y: Math.round(vb * 0.5) }; // the lantern's centre, out over the water
    // the near bank: a riverside path in the lower left, its water edge running down and out toward us
    const edge = (y) => (y < yN ? -1 : Math.round(px + s(28) + (y - yN) * 0.8));
    return Object.assign(S, { yH, yN, base, lamp, edge, w, h, vb });
  }

  // The name: three cursive marks, each a few brush strokes through points in
  // a unit box ([x, y, width]); eleven strokes in all. Calligraphy, not letters.
  const NAME = [
    [[[0.62, 0.06, 2.2], [0.5, 0.3, 2.2], [0.56, 0.55, 1.8], [0.4, 0.86, 1]], [[0.18, 0.36, 2], [0.3, 0.44, 1.4]], [[0.72, 0.52, 2], [0.86, 0.7, 1.2], [0.8, 0.82, 0.8]]],
    [[[0.2, 0.18, 2.2], [0.5, 0.08, 2], [0.78, 0.2, 1.8], [0.62, 0.42, 1.6], [0.32, 0.5, 1.2]], [[0.36, 0.6, 2], [0.6, 0.66, 1.8], [0.82, 0.9, 1]], [[0.2, 0.78, 1.8], [0.26, 0.86, 1.2]], [[0.82, 0.3, 1.6], [0.9, 0.44, 1]]],
    [[[0.5, 0.04, 2], [0.46, 0.22, 1.6]], [[0.16, 0.36, 2.2], [0.5, 0.3, 1.8], [0.84, 0.4, 1.4], [0.66, 0.56, 1.2]], [[0.56, 0.5, 2.2], [0.42, 0.72, 1.8], [0.5, 0.94, 1]], [[0.22, 0.66, 1.6], [0.3, 0.74, 1.2]]],
  ];
  const STROKES = [];
  NAME.forEach((m, gi) => m.forEach((st) => STROKES.push({ g: gi, st })));
  const FADE0 = 0.12, FADE1 = 0.86;                         // the name goes between these points of the shot
  const fadeOf = (j, k) => { const a = FADE0 + ((FADE1 - FADE0) * j) / STROKES.length, d = (FADE1 - FADE0) / STROKES.length; return clamp((k - a) / d, 0, 1); };

  function lampSprite(Z) {
    return cached('lamp|' + Z, () => {
      const L = chochin(Math.round(17 * Z), Math.round(40 * Z), true, Math.max(3, Math.round(4 * Z)));
      // each stroke as its own sprite on the lantern's grid, so it can pale and go
      const ink = K().mat('#2a1418', { n: 3, at: 1, line: false });
      const box = Math.round(13 * Z), gap = Math.round(1 * Z), top = L.y0 + Math.round((L.y1 - L.y0 - box * 3 - gap * 2) / 2);
      const strokes = STROKES.map(({ g, st }) => {
        const Ls = K().layer(L.W, L.H), ox = L.cx - box / 2 - 0.5, oy = top + g * (box + gap);
        let sx = 0, sy = 0;
        for (let i = 1; i < st.length; i++) {
          const a = st[i - 1], b = st[i];
          for (let q = 0; q < 3; q++) {
            const u = q / 3, v = (q + 1) / 3;
            Ls.seg(ox + (a[0] + (b[0] - a[0]) * u) * box, oy + (a[1] + (b[1] - a[1]) * u) * box, ox + (a[0] + (b[0] - a[0]) * v) * box, oy + (a[1] + (b[1] - a[1]) * v) * box, Math.max(1, (a[2] + (b[2] - a[2]) * u) * Z), ink, (x) => (x < L.cx ? 0.2 : 0.6));
          }
        }
        for (const p of st) { sx += p[0] / st.length; sy += p[1] / st.length; }
        return { cv: Ls.canvas(), x: ox + sx * box, y: oy + sy * box };
      });
      return Object.assign(L, { strokes });
    });
  }

  function scene(w, h, vb) {
    return cached('lantern|' + w + 'x' + h + '|' + Math.round(vb), () => {
      const G = geom(w, h, vb), { yH, base, lamp, edge, s, Z } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const P = K(), rnd = P.rnd(3301);
      // sky: the title's dusk bands, darkest at the top
      bandsIn(g, 0, 0, w, yH, ['#0b0f22', '#0f1429', '#131a33', '#18203f', '#1f2749', '#292e55', '#373358', '#4a3c5c'], 0.45);
      const stars = [];
      for (let i = 0; i < Math.round(w * yH / 2200); i++) {
        const x = Math.round(rnd() * w), y = Math.round(rnd() * yH * 0.8), b = rnd();
        R(g, x, y, 1, 1, b < 0.2 ? '#c8d0ee' : b < 0.6 ? '#6a7098' : '#464c74');
        if (b < 0.12) stars.push([x, y, rnd() * 6.28, 900 + Math.round(rnd() * 2000)]);
      }
      // a thin moon high on the right, and its light broken on the water below (drawn live)
      const moon = [Math.round(w * 0.8), Math.round(yH * 0.3), Math.max(4, s(6))];
      {
        const [mx, my, mr] = moon;
        P.halo(g, mx, my, mr * 5, '200,210,240', 0.16, 4);
        for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) {
          if (x * x + y * y > mr * mr + mr * 0.6) continue;
          if ((x + mr * 0.55) * (x + mr * 0.55) + (y - mr * 0.3) * (y - mr * 0.3) <= mr * mr * 0.85) continue;
          R(g, mx + x, my + y, 1, 1, x * x + y * y > (mr - 1.5) * (mr - 1.5) && x > 0 ? '#c9c0a2' : x > mr * 0.35 ? '#dcd4b8' : '#f1e9cc');
        }
      }
      // two low cloud streaks catching the last light
      for (let i = 0; i < 2; i++) { const cy = Math.round(yH * (0.62 + i * 0.12)), cx2 = Math.round(w * (0.68 - i * 0.4)), len = Math.round(w * 0.2); R(g, cx2 - len / 2, cy, len, 2, '#2c2d52'); R(g, cx2 - len / 2 + 6, cy - 1, len - 16, 1, '#3e3c62'); }
      // far hills, then the far bank's wood and reeds
      for (let x = 0; x < w; x++) {
        const v = Math.sin(x / (w * 0.11) + 1.7) * 0.6 + Math.sin(x / (w * 0.04) + 0.3) * 0.4;
        const t1 = Math.round(yH - s(12) - v * s(7)), t2 = Math.round(yH - s(5) - Math.abs(Math.sin(x * 0.21 + 1)) * s(3) - ((x * 7) % 5 === 0 ? s(2) : 0));
        R(g, x, t1, 1, yH - t1, '#1a2044'); R(g, x, t1, 1, 1, '#262c56');
        R(g, x, t2, 1, yH - t2 + 2, '#111733');
      }
      // far houses with a lit window or two, and the far bank's lantern road (lit live)
      const far = [];
      for (let x = s(20); x < w - s(20); x += s(26) + Math.round(rnd() * s(40))) {
        if (rnd() < 0.45) {
          const hw = s(8) + Math.round(rnd() * s(5)), hh = s(5) + Math.round(rnd() * s(3));
          R(g, x, yH - hh, hw, hh + 1, '#0c1122');
          for (let j = 0; j < 3; j++) R(g, x - 2 + j, yH - hh - 1 - j, hw + 4 - j * 2, 1, j === 2 ? '#1a2038' : '#0a0e1c');
          if (rnd() < 0.7) R(g, x + 2 + Math.round(rnd() * (hw - 5)), yH - hh + 2, 2, 2, rnd() < 0.6 ? '#e8b860' : '#9a7446');
        } else far.push([x, yH - s(4) - Math.round(rnd() * s(2))]);
      }
      far.forEach(([x, y]) => R(g, x, y, 1, s(4), '#1a1418'));
      // the river: sky-lit near the far bank, deepening toward us
      bandsIn(g, 0, yH + 1, w, h - yH - 1, ['#343f6e', '#2c3866', '#26315c', '#202b52', '#1b264a', '#172142', '#141d3a'], 0.4);
      R(g, 0, yH + 1, w, 1, '#0c1222');
      const water = [];
      for (let i = 0; i < Math.round(w * (h - yH) / 900); i++) {
        const y = yH + 3 + Math.round(Math.pow(rnd(), 1.3) * (h - yH - 4)), d = (y - yH) / (h - yH);
        const x = Math.round(rnd() * w), len = 2 + Math.round(d * 10);
        if (x > edge(y) + 4 && x + len > 0) water.push([x, y, len, rnd() * 6.28]);
      }
      // the near bank: a riverside path of packed earth with grass at its back, a lit lip at the water
      const { yN } = G;
      for (let y = yN; y < h; y++) {
        const x1 = edge(y), d = (y - yN) / Math.max(1, h - yN);
        R(g, 0, y, x1, 1, d < 0.15 ? '#171d30' : '#131a2b');
        const pa = Math.round(x1 * 0.2 + Math.sin(y * 0.37) * 2), pb = Math.round(x1 * 0.78 + Math.sin(y * 0.23 + 1) * 3);
        if (d > 0.1) { R(g, pa, y, pb - pa, 1, '#1d2034'); if (((y * 7) % 5) === 0) R(g, pa + Math.round(((y * 31) % 97) / 97 * (pb - pa)), y, 3, 1, '#2a2c42'); R(g, pa, y, 1, 1, '#171b2c'); R(g, pb - 1, y, 1, 1, '#171b2c'); }
        R(g, x1 - 2, y, 2, 1, '#2a3458'); R(g, x1, y, 2, 1, '#0c1222');
      }
      // the bank's far edge: grass in tufts against the water, moonlit tips
      for (let x = 0; x < edge(yN) + 2; x++) {
        const t2 = Math.round(Math.abs(Math.sin(x * 0.31 + 0.5)) * s(3) + ((x * 7) % 5 === 0 ? s(2) : 0));
        R(g, x, yN - t2, 1, t2 + 1, '#131a2b');
        if (t2 > s(2) && x % 2) R(g, x, yN - t2, 1, 1, '#2a3458');
      }
      for (let n = 0; n < w * 0.35; n++) {
        const y = Math.round(yN + 2 + rnd() * (h - yN - 2)), x = Math.round(rnd() * edge(y));
        const pa = edge(y) * 0.2, pb = edge(y) * 0.78;
        if (x < 1 || (x > pa && x < pb && rnd() < 0.8)) continue;
        const d = (y - yN) / (h - yN), sz = 1 + Math.round(d * 3);
        R(g, x, y - sz * 2, 1, sz * 2, '#1f2a44'); R(g, x - sz, y - sz, 1, sz, '#1a2238'); R(g, x + sz, y - sz - 1, 1, sz + 1, '#1a2238');
      }
      // a band of mist low over the far water
      for (let y = yH + s(4); y < yH + s(12); y++) for (let x = (y * 3) % 4; x < w; x += 4) if (((x >> 4) + y) % 3) R(g, x, y, 2, 1, 'rgba(120,130,170,0.14)');
      const stone = P.mat('#4a4c62', { n: 5, at: 2 });
      const SL = P.layer(w, h);
      for (const [fx, fy, r] of [[0.92, 0.84, 6], [0.97, 0.95, 8], [0.84, 1.04, 7], [0.1, 0.9, 5]]) {
        const sy = Math.round(G.yN + (vb - G.yN) * (fy - 0.78) / 0.22), sx = Math.round(edge(sy) * fx);
        if (sx > s(6)) SL.ell(sx, sy, s(r), s(r) * 0.55, stone, P.sphere(sx - s(2), sy - s(2), s(r), s(r) * 0.55, { amb: 0.08 }));
      }
      // the post: a weathered square post, an arm out over the water with a brace, a hook
      const wood = P.mat('#4a3628', { n: 6, at: 2, step: 0.08 });
      const pw = s(7), topY = lamp.y - s(46), armX = lamp.x + s(10);
      SL.rect(base.x - pw / 2, topY - s(4), pw, base.y - topY + s(4), wood, (x) => (x < base.x - pw / 2 + 2 ? 0.55 : x > base.x + pw / 2 - 3 ? 0.75 : 0.3));
      SL.rect(base.x - pw / 2 - s(4), topY, armX - base.x + pw / 2 + s(4), s(5), wood, (x, y) => (y < topY + 1 ? 0.8 : y > topY + s(4) - 1 ? 0.15 : 0.45));
      SL.seg(base.x + pw / 2, topY + s(22), base.x + s(26), topY + s(5), s(3), wood, 0.3);
      SL.rect(base.x - pw / 2 - s(2), topY - s(6), pw + s(4), s(3), wood, (x) => (x < base.x ? 0.7 : 0.35));
      for (let y = topY + s(10); y < base.y - s(6); y += s(17)) SL.line(base.x - 1, y, base.x - 1, y + s(5), wood, 0);
      SL.rect(base.x - pw / 2 - s(3), base.y - s(3), pw + s(6), s(4), stone, (x) => (x < base.x ? 0.6 : 0.25));
      SL.outline();
      g.drawImage(SL.canvas(), 0, 0);
      R(g, lamp.x, topY + s(5), 1, lamp.y - topY - s(5) - Math.round(lampSprite(Z).H / 2) + 1, '#0e0a0c');
      // light from the lantern on the post's near face and the ground below it, two flat steps
      g.fillStyle = 'rgba(255,190,110,0.06)';
      P.disc(g, lamp.x - s(20), base.y, s(60), s(12)); P.disc(g, lamp.x - s(24), base.y, s(34), s(7));
      R(g, base.x + pw / 2 - 2, topY + s(5), 1, base.y - topY - s(8), 'rgba(255,190,110,0.35)');
      // foreground reeds (lower right) are drawn live so they can sway
      const reeds = [];
      for (let y = G.yN + 2; y < h; y += 3 + Math.floor(rnd() * 4)) { const x = edge(y) - 1; if (rnd() < 0.7) reeds.push([x - Math.floor(rnd() * 5), y, s(6) + Math.round(rnd() * s(12)), rnd() * 6.28]); }
      for (let x = w - 2; x > Math.max(edge(h) + s(30), w * 0.72); x -= 2 + Math.floor(rnd() * 5)) reeds.push([x, h - 1 - Math.floor(rnd() * s(6)), s(16) + Math.round(rnd() * s(30)), rnd() * 6.28]);
      return { cv, G, stars, far, water, reeds, moon };
    });
  }

  A.SHOTS.lantern = (c, w, h, t, k, o) => {
    const S = scene(w, h, o.vb), G = S.G, { lamp, s, Z, yH } = G, still = o.still, P = K();
    c.drawImage(S.cv, 0, 0);
    if (!still) for (const [x, y, ph, beat] of S.stars) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(t / beat + ph)); c.fillStyle = 'rgba(220,226,255,' + a.toFixed(2) + ')'; c.fillRect(x, y, 1, 1); if (a > 0.92) { c.fillStyle = 'rgba(220,226,255,0.3)'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); } }
    // the far lantern road
    S.far.forEach(([x, y], i) => {
      const fl = still ? 0.8 : 0.72 + 0.14 * Math.sin(t / 340 + i * 1.7);
      c.globalAlpha = fl; P.halo(c, x, y - 1, s(6), '255,200,110', 0.3, 2); c.globalAlpha = 1;
      c.fillStyle = '#ffd27a'; c.fillRect(x, y - 2, 1, 2);
      c.fillStyle = 'rgba(255,200,110,0.3)'; c.fillRect(x - 1, yH + 3 + (i % 3), 3, 1);
    });
    // water glints drifting
    for (const [x, y, len, ph] of S.water) {
      const kk = still ? 0.5 : (Math.sin(t / 1400 + ph) + 1) / 2;
      if (kk < 0.55) continue;
      const dx = still ? 0 : Math.round(Math.sin(t / 2600 + ph) * 3);
      c.fillStyle = 'rgba(120,150,200,' + (0.22 + (kk - 0.55) * 0.8).toFixed(2) + ')';
      c.fillRect(Math.round(x + dx), y, len, 1);
    }
    // the moon's path on the water: short pale dashes, wider toward us
    {
      const [mx] = S.moon;
      for (let y = yH + 3, i = 0; y < G.h; y += 2 + (i % 3), i++) {
        const d = (y - yH) / (G.h - yH), on = still ? i % 3 !== 1 : Math.sin(t / 700 + i * 1.9) > -0.2;
        if (!on) continue;
        const wd = Math.max(1, Math.round((2 + d * 18) * (0.5 + 0.5 * Math.abs(Math.sin(i * 2.3)))));
        const dx = still ? 0 : Math.round(Math.sin(t / 1300 + i) * (1 + d * 2));
        c.fillStyle = 'rgba(200,206,236,' + (0.32 - d * 0.18).toFixed(3) + ')';
        const x0 = Math.max(G.edge(y) + 3, mx - (wd >> 1) + dx);
        c.fillRect(x0, y, mx + (wd >> 1) + dx - x0, 1);
      }
    }
    // the lantern: dimmer as its name goes
    const L = lampSprite(Z);
    let gone = 0;
    for (let j = 0; j < STROKES.length; j++) gone += fadeOf(j, k);
    const dim = 1 - 0.38 * (gone / STROKES.length);
    const fl = (still ? 0.86 : 0.8 + 0.1 * Math.sin(t / 310) + 0.05 * Math.sin(t / 97)) * dim;
    // its reflection: warm streaks under it on the water, broken by the ripples
    const foot = G.base.y + s(4), refl = foot - lamp.y;
    for (let y = foot; y < Math.min(G.h, foot + refl); y += 3) {
      const d = (y - foot) / refl, wob = still ? 0 : Math.round(Math.sin(t / 420 + y * 0.7) * (1 + d * 3));
      const wd = Math.max(1, Math.round(s(10) * (1 - d * 0.6) * (0.6 + 0.4 * Math.abs(Math.sin(y * 1.3)))));
      c.fillStyle = 'rgba(255,200,110,' + ((0.42 - d * 0.32) * fl).toFixed(3) + ')';
      c.fillRect(lamp.x - (wd >> 1) + wob, y, wd, 1);
    }
    c.globalAlpha = clamp(fl, 0, 1);
    P.halo(c, lamp.x, lamp.y, s(70), '255,200,110', 0.22, 5);
    c.globalAlpha = 1;
    const lx = Math.round(lamp.x - L.cx), ly = Math.round(lamp.y - L.H / 2);
    c.drawImage(L.cv, lx, ly);
    if (dim < 0.999) { c.globalAlpha = (1 - dim) * 0.5; c.globalCompositeOperation = 'multiply'; c.drawImage(L.cv, lx, ly); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
    // the name, stroke by stroke
    L.strokes.forEach((st, j) => {
      const f = fadeOf(j, k);
      if (f < 1) {
        c.globalAlpha = f < 0.25 ? 1 : f < 0.5 ? 0.66 : f < 0.75 ? 0.36 : 0.14;
        c.drawImage(st.cv, lx, ly);
        c.globalAlpha = 1;
      }
      if (still || f <= 0) return;
      // a few motes rise from where the stroke was, for a second and a half after it starts to go
      const el = (k - (FADE0 + ((FADE1 - FADE0) * j) / STROKES.length)) * 8000;
      if (el > 1500) return;
      for (let m = 0; m < 3; m++) {
        const ph = clamp(el / 1500 - m * 0.12, 0, 1);
        if (ph <= 0) continue;
        const x = lx + st.x + Math.round(Math.sin(ph * 5 + m * 2 + j) * s(4)), y = ly + st.y - ph * s(30);
        c.fillStyle = 'rgba(255,236,190,' + (0.85 * (1 - ph)).toFixed(3) + ')';
        c.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    });
    // reeds in front, swaying
    for (const [x, y, hh, ph] of S.reeds) {
      const sway = still ? 0 : Math.round(Math.sin(t / 1100 + ph) * 2);
      const lean = Math.round(hh / 3);
      c.fillStyle = '#0c1120';
      c.fillRect(x, y - hh + 3, 1, hh - 3);
      c.fillRect(x - 2, y - lean - 1, 1, lean);
      if (hh > 8) c.fillRect(x + 2, y - lean, 1, lean);
      c.fillStyle = '#1d2438'; c.fillRect(x + sway, y - hh, 1, 4);
      c.fillStyle = '#3a3448'; c.fillRect(x + sway, y - hh, 1, 1);
    }
  };
})();
