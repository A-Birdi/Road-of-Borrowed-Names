/* The Keepers' Road, Chapter 7 of the twelve: the travel volume's pages (expansion P16; AC-1).
 *
 * kr.vigil — the vigil in the Room of Wicks (`kr.vigil_begin`, src/content/kr/22_scenes_vigil.js), up to the dark
 * gathering in the corner (the encounter is the world's).
 *   room    the long room built as a small place: three tiers of oil dishes along both walls going away to the far
 *           wall, ninety-nine small flames, the mats, a low table with the keepers' register; warm and close
 *   hisae   Old Hisae close at the left, the rows of flames behind her; then, as the tellings go on, the flames going
 *           out along the walls one after another
 *   last    the same room nearly dark: one wick left on the far wall; the ninety-eighth goes out; Kikyō begins; then
 *           in the corner the dark gathers into something with weight
 * kr.dawn — dawn at the pass (`kr.chapter_end`).
 *   road    looking back from the pass: the keepers' road switching down the ridge to the foot of the mountain, every
 *           stone lantern on it lit in the blue before sunrise
 *   valley  turning to go: Lanternfall's valley ahead in the morning mist, the two of you from behind on the pass; your
 *           companion's resolve (their face to the valley, then eyes closed)
 * No letters, kana or kanji are drawn: the register's pages are brush marks. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const sub = (k, a, b) => clamp((k - a) / (b - a), 0, 1);

  const LAMP = { mul: [0.86, 0.76, 0.66], add: [14, 6, 0], rim: { side: 'r', col: '#ffc070', k: [0.42, 0.2], below: 0.85 } };
  const DARK = { mul: [0.5, 0.46, 0.52], add: [6, 2, 6], rim: { side: 'r', col: '#ffb060', k: [0.4, 0.16], below: 0.85 } };
  const DAWN = { mul: [0.82, 0.84, 0.94], add: [6, 8, 18], rim: { side: 'r', col: '#ffd0a0', k: [0.42, 0.2], below: 0.85 } };

  // ==== kr.vigil · the Room of Wicks, built as a small place ======================================================
  // The floor is Y = 0; the walls stand at X = ±RW; the far wall at Z = RZ; the dishes on three shelves at SHELF.
  const RW = 2.2, RZ = 11, SHELF = [0.55, 1.05, 1.55], CEIL = 2.5;
  function camRoom(w, vb, narrow) { return SP.cam(w, vb, narrow ? { F: 1.25, hy: 0.42, cx: 0.5, ch: 1.15 } : { F: 0.78, hy: 0.42, cx: 0.5, ch: 1.15 }); }
  // the dishes: every wick's place [X, Y, Z] and its order of going out (seeded, so the same order every time)
  function wicks() {
    const out = [], rnd = P().rnd(99);
    for (const side of [-1, 1]) for (const y of SHELF) for (let i = 0; i < 16; i++) out.push([side * (RW - 0.12), y, 1.6 + i * 0.6]);
    for (const y of SHELF) for (let i = 0; i < 1; i++) out.push([-0.9 + i * 0.6, y, RZ - 0.12]);
    while (out.length > 99) out.pop();
    out.forEach((p) => p.push(rnd()));
    // the last to go out: the middle of the far wall's top shelf
    const last = out.reduce((b, p, i) => (Math.abs(p[0]) < 1 && p[2] > RZ - 1 && p[1] === SHELF[2] ? i : b), 0);
    out[last][3] = 2;
    return out;
  }
  // (built on first use: the pixel kit loads after this file)
  let WK = null;
  const W_ = () => WK || (WK = wicks());
  function roomStatic(G, dark) {
    return cached('kr.room|' + G.w + 'x' + G.h + '|' + G.vb + '|' + dark, () => {
      const { w, h } = G, C = camRoom(w, G.vb, G.narrow), p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.fillStyle = '#0c0a0a'; g.fillRect(0, 0, w, h);
      const L = SP.layer(w, h);
      const lit = 1 - dark * 0.8;
      const wall = p.mat('#7a6650', { n: 7, at: 3, step: 0.07 }), wood = p.mat('#4a3424', { n: 7, at: 3, step: 0.07 }), mat = p.mat('#a89a6a', { n: 6, at: 3, step: 0.07 }), shelf = p.mat('#3a2a1e', { n: 6, at: 3, step: 0.08 });
      const sh = (base) => (x, y) => clamp(base * lit + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999);
      // the ceiling's boards, the far wall, the two side walls (plaster between dark posts), the mats on the floor
      C.poly(L, [[-RW, CEIL, 0.4], [RW, CEIL, 0.4], [RW, CEIL, RZ], [-RW, CEIL, RZ]], wood, sh(0.22));
      C.poly(L, [[-RW, 0, RZ], [RW, 0, RZ], [RW, CEIL, RZ], [-RW, CEIL, RZ]], wall, sh(0.5));
      for (const side of [-1, 1]) {
        C.poly(L, [[side * RW, 0, 0.4], [side * RW, 0, RZ], [side * RW, CEIL, RZ], [side * RW, CEIL, 0.4]], wall, sh(side < 0 ? 0.56 : 0.44));
        for (let z = 1.3; z < RZ; z += 1.6) C.seg(L, [side * RW, 0, z], [side * RW, CEIL, z], 0.09, wood, 0.32 * lit + 0.05);
        // the shelves running the wall's length
        for (const y of SHELF) C.poly(L, [[side * RW, y - 0.04, 0.6], [side * RW, y - 0.04, RZ], [side * (RW - 0.22), y - 0.04, RZ], [side * (RW - 0.22), y - 0.04, 0.6]], shelf, sh(0.6));
      }
      for (const y of SHELF) C.poly(L, [[-1.4, y - 0.04, RZ], [1.4, y - 0.04, RZ], [1.4, y - 0.04, RZ - 0.22], [-1.4, y - 0.04, RZ - 0.22]], shelf, sh(0.6));
      for (const x of [-1.5, 1.5]) C.seg(L, [x, 0, RZ - 0.01], [x, CEIL, RZ - 0.01], 0.12, wood, 0.3);
      C.poly(L, [[0.35, 2.15, RZ - 0.02], [0.95, 2.15, RZ - 0.02], [0.95, 0.75, RZ - 0.02], [0.35, 0.75, RZ - 0.02]], p.mat('#c8bca0', { n: 5, at: 3, step: 0.06 }), sh(0.5));
      C.seg(L, [0.65, 2.0, RZ - 0.03], [0.65, 1.0, RZ - 0.03], 0.03, p.mat('#2a2024', { n: 3, at: 1 }), 0.5);
      C.seg(L, [0.3, 2.17, RZ - 0.03], [1.0, 2.17, RZ - 0.03], 0.05, wood, 0.4);
      // the mats: rectangles with dark borders, two by the room's length
      C.poly(L, [[-RW, 0, 0.4], [RW, 0, 0.4], [RW, 0, RZ], [-RW, 0, RZ]], mat, sh(0.5));
      for (let z = 1.6; z < RZ; z += 1.8) C.seg(L, [-RW, 0, z], [RW, 0, z], 0.012, wood, 0.3);
      C.seg(L, [0, 0, 1.6], [0, 0, RZ], 0.012, wood, 0.3);
      // the low table in the middle with the register open on it
      const tb = p.mat('#3a2418', { n: 6, at: 3, step: 0.08 }), pg = p.mat('#e8dcc0', { n: 5, at: 3, step: 0.06 });
      C.poly(L, [[-0.5, 0.35, 4.2], [0.5, 0.35, 4.2], [0.5, 0.35, 5.2], [-0.5, 0.35, 5.2]], tb, sh(0.7));
      C.poly(L, [[-0.5, 0.35, 4.2], [0.5, 0.35, 4.2], [0.5, 0.2, 4.2], [-0.5, 0.2, 4.2]], tb, sh(0.3));
      C.poly(L, [[-0.3, 0.36, 4.45], [0.3, 0.36, 4.45], [0.3, 0.36, 4.85], [-0.3, 0.36, 4.85]], pg, sh(0.8));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv, C };
    });
  }
  // the dishes and their flames: lit while their order is beyond `out` (0 all lit … 1 all out but the last)
  function drawWicks(c, C, out, t, still, glowA) {
    for (const [X, Y, Z, ord] of W_()) {
      const q = C.p(X, Y, Z), sz = Math.max(1, Math.round(q[2] * 0.05));
      R(c, q[0] - sz, q[1], sz * 2 + 1, Math.max(1, Math.round(sz * 0.6)), '#2a1e16');
      if (ord < out) { R(c, q[0], q[1] - sz, 1, sz, '#3a2a20'); continue; }
      const fl = still ? 0 : Math.round(Math.sin(t / (110 + ord * 60) + ord * 9) * 0.6);
      const fh = Math.max(2, Math.round(q[2] * 0.09)) + fl;
      R(c, q[0], q[1] - fh, Math.max(1, sz), fh, '#ffb040');
      R(c, q[0], q[1] - fh + 1, Math.max(1, sz), Math.max(1, fh - 2), '#fff0b0');
      if (glowA > 0) SP.glow(c, q[0], q[1] - fh / 2, Math.max(3, Math.round(q[2] * 0.32)), '255,180,90', glowA);
    }
  }
  const geomRoom = (w, h, vb) => { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); };
  const room = {
    phases: [['settle', 1000]],
    safe: { wide: 'the room and its flames going away above the sheet', narrow: 'the room in the upper half', land: 'the far wall\'s flames' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), S0 = roomStatic(G, 0);
      c.drawImage(S0.cv, 0, 0);
      drawWicks(c, S0.C, 0, t, st.still, 0.14 + 0.06 * ease(st.at('settle')));
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb), C = camRoom(w, vb, G.narrow), a = C.p(-RW, CEIL * 0.8, RZ), b = C.p(RW, 0.2, RZ); return { x: Math.round(a[0] - 20), y: Math.round(Math.max(0, a[1])), w: Math.round(b[0] - a[0] + 40), h: Math.round(Math.min(vb - 2, b[1]) - Math.max(0, a[1])) }; },
  };
  const hisae = {
    phases: [['speak', 700], ['out', 1500]],
    safe: { wide: 'Hisae\'s face and the rows of flames above the sheet', narrow: 'her face in the upper half', land: 'her face' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), { s } = G;
      const ko = st.at('out');
      const S0 = roomStatic(G, 0.3 * ko);
      c.drawImage(S0.cv, 0, 0);
      drawWicks(c, S0.C, 0.97 * ease(ko), t, st.still, 0.16);
      const b = Q.bust('kr_hisae', ko > 0.2 ? 'closed' : 'neutral', ko > 0.2 ? null : { look: [1, 0] }, ko > 0.5 ? DARK : LAMP, false, 200);
      const bx = Math.round(w * (G.narrow ? 0.3 : 0.24)), by = Math.max(Math.round(st.vb + s(10)), 98);
      if (b) c.drawImage(b.cv, bx - b.ax, by - b.ay);
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb), bx = Math.round(w * (G.narrow ? 0.3 : 0.24)), by = Math.max(Math.round(vb + G.s(10)), 98); return { x: bx - 34, y: by - 92, w: 68, h: Math.min(vb - 2, by - 30) - (by - 92) }; },
  };
  const last = {
    phases: [['out', 900], ['kikyo', 700], ['gather', 1500]],
    safe: { wide: 'the last flame and the corner where the dark gathers, above the sheet', narrow: 'the flame and the corner in the upper half', land: 'the last flame' },
    draw(c, w, h, t, st) {
      const G = geomRoom(w, h, st.vb), { s } = G, still = st.still;
      const S0 = roomStatic(G, 0.95);
      c.drawImage(S0.cv, 0, 0);
      // one wick left (and the ninety-eighth going out on the first line)
      const ko = st.at('out');
      drawWicks(c, S0.C, 1.5, t, still, 0.3);
      const nn = W_().filter((p) => p[3] < 1).sort((a, b) => b[3] - a[3])[0];
      if (nn && ko < 1) { const q = S0.C.p(nn[0], nn[1], nn[2]), fh = Math.max(1, Math.round(q[2] * 0.09 * (1 - ko))); R(c, q[0], q[1] - fh, 1, fh, '#ffb040'); }
      if (ko >= 1) { const q = S0.C.p(nn[0], nn[1], nn[2]); c.fillStyle = 'rgba(160,150,140,0.5)'; for (let i = 0; i < 4; i++) c.fillRect(q[0] + (i % 2), q[1] - 2 - i * 2, 1, 1); }
      // Kikyō at the right, half in the dark, telling
      const kk = st.at('kikyo');
      if (kk > 0) {
        const b = Q.bust('kr_kikyo', 'neutral', { look: [-1, 0] }, DARK, false, 200);
        const bx = Math.round(w * (G.narrow ? 0.72 : 0.76)), by = Math.max(Math.round(st.vb + s(16)), 104);
        if (b) c.drawImage(b.cv, Math.round(bx + (1 - ease(kk)) * s(12) - b.ax), by - b.ay);
      }
      // the dark gathering in the near-left corner: an ink-dark mass that thickens and takes on weight
      const kg = ease(st.at('gather'));
      if (kg > 0) {
        const C = S0.C, a = C.p(-RW + 0.3, 0, 4.2), b = C.p(-RW + 0.3, CEIL, 4.2), cx = Math.max(s(46), a[0] + s(14)), cy = lerp(b[1], a[1], 0.55);
        const rnd = P().rnd(17);
        for (let i = 0; i < 420 * kg; i++) {
          const an = rnd() * Math.PI * 2, rr = Math.pow(rnd(), 0.8) * s(36) * (0.4 + kg * 0.6), wob = still ? 0 : Math.sin(t / 500 + i) * 2;
          c.fillStyle = rr < s(20) * kg ? 'rgba(4,2,8,0.85)' : i % 4 ? 'rgba(8,6,12,0.6)' : 'rgba(34,24,46,0.7)';
          c.fillRect(Math.round(cx + Math.cos(an) * rr + wob), Math.round(cy + Math.sin(an) * rr * 1.4), 2, 2);
        }
        // two faint points in it, like eyes that haven't decided
        if (kg > 0.7) { c.fillStyle = 'rgba(200,180,140,' + ((kg - 0.7) * 2).toFixed(2) + ')'; c.fillRect(Math.round(cx - s(4)), Math.round(cy - s(6)), 1, 1); c.fillRect(Math.round(cx + s(3)), Math.round(cy - s(6)), 1, 1); }
      }
    },
    focus(w, h, vb) { const G = geomRoom(w, h, vb), C = camRoom(w, vb, G.narrow), a = C.p(-RW, CEIL, 4.2), b = C.p(RW, 0.5, RZ); return { x: Math.round(Math.max(0, a[0])), y: Math.round(Math.max(0, a[1])), w: Math.round(Math.min(w, b[0]) - Math.max(0, a[0])), h: Math.round(Math.min(vb - 2, b[1] + 20) - Math.max(0, a[1])) }; },
  };
  RB.sequence.define('kr.vigil', {
    title: { en: 'The vigil of ninety-nine wicks', jp: '{九十九|きゅうじゅうきゅう} の {芯|しん} の {夜|よ}' }, chapter: 'kr', scene: 'kr.vigil_begin',
    shots: { room, hisae, last },
  });

  // ==== kr.dawn · the pass at dawn ==================================================================================
  function geomPass(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow';
    return Object.assign(S, { narrow, ridge: Math.round(vb * (narrow ? 0.5 : 0.46)) });
  }
  // the switchbacks seen from above: a road zigzagging down the ridge, its stone lanterns, cedars along it
  function roadPts(G) {
    const { w, h, vb } = G, out = [];
    const legs = 7;
    for (let i = 0; i <= legs; i++) {
      const u = i / legs, y = lerp(vb * 0.98, vb * 0.3, Math.pow(u, 0.75));
      const x = w * (i % 2 ? 0.66 - u * 0.12 : 0.34 + u * 0.12);
      out.push([x, y, 1 - u * 0.85]);
    }
    return out;
  }
  function roadStatic(G) {
    return cached('kr.road|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, h, ['#1a2240', '#22305a', '#2e3e6a', '#3e4e78', '#56608a', '#7a7a98', '#a09098'], 0.45);
      SP.stars(g, 0, 0, w, Math.round(G.vb * 0.2), 14, 41, 0);
      const L = SP.layer(w, h), rnd = p.rnd(29);
      // the far ridges in layers, cooler and paler with distance
      const ridge = (base, amp, seed, mat, off) => { const r2 = p.rnd(seed); const ph = r2() * 6; L.fill(0, 0, w, h, (x, y) => y > base + Math.sin(x / (w * 0.13) + ph) * amp + Math.sin(x / (w * 0.05) + ph * 2) * amp * 0.3, mat, (x, y) => clamp(0.4 + off + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999)); };
      ridge(G.vb * 0.3, s(10), 3, p.mat('#4a5478', { n: 6, at: 3, step: 0.07 }), 0.1);
      ridge(G.vb * 0.42, s(14), 5, p.mat('#36405e', { n: 6, at: 3, step: 0.07 }), 0.05);
      // the near slope the road runs down: dark cedar forest, the road a pale band of beaten earth
      L.fill(0, 0, w, h, (x, y) => y > G.vb * 0.26 + Math.abs(x - w * 0.5) * 0.1, p.mat('#2e3a3a', { n: 7, at: 3, step: 0.08 }), (x, y) => clamp(0.52 - (y - G.vb * 0.26) / h * 0.4 - Math.abs(x - w * 0.5) / w * 0.2 + (((x * 7 + y * 13) % 23) < 3 ? 0.1 : 0) + (p.bayer(x, y) - 0.5) * 0.12, 0.02, 0.999));
      const pts = roadPts(G), earth = p.mat('#7a6e64', { n: 6, at: 3, step: 0.08 });
      for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; L.seg(a[0], a[1], b[0], b[1], Math.max(2, s(8) * (a[2] + b[2]) / 2), earth, 0.5); }
      // cedars along the road: dark spires, some nearer and bigger
      const cedar = p.mat('#16221e', { n: 5, at: 2, step: 0.08 });
      for (let i = 0; i < 90; i++) {
        const near = pts[Math.floor(rnd() * pts.length)], x = rnd() < 0.6 ? near[0] + (rnd() - 0.5) * w * 0.5 : rnd() * w, y = rnd() < 0.6 ? near[1] + (rnd() - 0.3) * s(30) : G.vb * 0.3 + rnd() * (h - G.vb * 0.3), sc = 0.4 + (y / h) * 1.4, ht = s(16) * sc * (0.8 + rnd() * 0.5), wd = s(5) * sc;
        if (y < G.vb * 0.28) continue;
        L.fill(x - wd, y - ht, x + wd, y, (xx, yy) => Math.abs(xx - x) <= wd * (yy - (y - ht)) / ht, cedar, (xx, yy) => clamp((xx < x ? 0.55 : 0.3) + (((Math.round(yy) - Math.round(y)) % 3) === 0 ? -0.15 : 0), 0.02, 0.999));
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the sunrise's first warmth along the top of the far ridge
      g.fillStyle = 'rgba(255,190,140,0.12)'; g.fillRect(0, Math.round(G.vb * 0.22), w, s(10));
      return { cv, pts };
    });
  }
  const road = {
    phases: [['look', 1400]],
    safe: { wide: 'the lit road going down the ridge, above the sheet', narrow: 'the road in the upper half', land: 'the road\'s lights' },
    draw(c, w, h, t, st) {
      const G = geomPass(w, h, st.vb), { s } = G, still = st.still;
      const S0 = roadStatic(G);
      c.drawImage(S0.cv, 0, 0);
      // the stone lanterns along every leg, all lit, the near ones seen as lanterns, the far ones as points
      const kl = ease(st.at('look')), pts = S0.pts;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        for (let j = 0; j < 4; j++) {
          const u = (j + 0.5) / 4, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - s(4), sc = lerp(a[2], b[2], u);
          if (sc > 0.55) { R(c, x - s(2) * sc, y - s(6) * sc, Math.max(2, s(4) * sc), Math.max(2, s(6) * sc), '#5a5a62'); R(c, x - s(1) * sc, y - s(5) * sc, Math.max(1, s(2) * sc), Math.max(1, s(3) * sc), '#ffd080'); }
          else R(c, x, y, Math.max(1, Math.round(s(2) * sc)), Math.max(1, Math.round(s(2) * sc)), (i + j) % 3 ? '#ffc060' : '#fff0b0');
          SP.glow(c, x, y - s(3) * sc, Math.max(2, Math.round(s(10) * sc)), '255,190,100', 0.22 * (0.6 + 0.4 * kl) * (still ? 1 : 0.9 + Math.sin(t / 700 + i + j) * 0.1));
        }
      }
    },
    focus(w, h, vb) { const G = geomPass(w, h, vb); return { x: Math.round(w * 0.25), y: Math.round(vb * 0.28), w: Math.round(w * 0.5), h: Math.round(vb * 0.7) }; },
  };
  function valleyStatic(G) {
    return cached('kr.valley|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, Math.round(w), Math.round(G.vb * 0.4), ['#2e3e6a', '#3e5080', '#5a6890', '#8a8098', '#c09890', '#e8b888'], 0.45);
      Q.bandsIn(g, 0, Math.round(G.vb * 0.4), Math.round(w), Math.round(h - G.vb * 0.4), ['#e8b888', '#c09890'], 0.45);
      const L = SP.layer(w, h);
      // the valley: far blue mountains, mist lying in the bottom, the river's thread and the town's roofs below
      const m1 = p.mat('#5a6a90', { n: 6, at: 3, step: 0.07 }), m2 = p.mat('#46567a', { n: 6, at: 3, step: 0.07 });
      L.fill(0, 0, w, h, (x, y) => y > G.vb * 0.36 + Math.sin(x / (w * 0.16) + 1) * s(12) + Math.sin(x / (w * 0.06)) * s(4), m1, (x, y) => clamp(0.5 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
      L.fill(0, 0, w, h, (x, y) => y > G.vb * 0.5 + Math.sin(x / (w * 0.2) + 3) * s(10), m2, (x, y) => clamp(0.45 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the mist: pale bands lying in the valley
      for (let i = 0; i < 3; i++) {
        const cy = Math.round(G.vb * (0.6 + i * 0.07)), hw = s(7 + i * 2);
        for (let y = cy - hw; y <= cy + hw; y++) for (let x = 0; x < w; x++) {
          const f = (1 - Math.abs(y - cy) / hw) * (0.55 + 0.45 * Math.sin(x / (w * 0.09) + i * 2));
          if (f > P().bayer(x, y) + 0.15) { g.fillStyle = 'rgba(232,228,238,0.42)'; g.fillRect(x, y, 1, 1); }
        }
      }
      // the town: small roofs in the mist, a few lamps still lit
      const rnd = p.rnd(5);
      for (let i = 0; i < 26; i++) { const x = Math.round(w * (0.35 + rnd() * 0.4)), y = Math.round(G.vb * (0.62 + rnd() * 0.12)); R(g, x, y, s(4), s(2), '#3a3a4e'); if (i % 4 === 0) R(g, x + 1, y + s(2), 1, 1, '#ffd080'); }
      // the pass where you stand: rocks and grass across the bottom
      const L2 = SP.layer(w, h), rock = p.mat('#4a4844', { n: 6, at: 3, step: 0.08 }), grass = p.mat('#4a5a3a', { n: 6, at: 3, step: 0.08 });
      L2.fill(0, 0, w, h, (x, y) => y > G.vb * 0.82 + Math.sin(x / (w * 0.1)) * s(5), grass, (x, y) => clamp(0.42 + (((x * 5 + y * 3) % 11) < 2 ? 0.15 : 0) + (((x * 13 + y * 7) % 17) < 2 ? -0.12 : 0) - (y - G.vb * 0.82) / h * 0.3 + (p.bayer(x, y) - 0.5) * 0.1, 0.02, 0.999));
      // the path going down off the pass toward the valley
      const path = p.mat('#8a7e6a', { n: 6, at: 3, step: 0.08 });
      L2.fill(0, 0, w, h, (x, y) => y > G.vb * 0.84 && Math.abs(x - (w * 0.52 + (y - G.vb) * 0.5)) < s(10) + (y - G.vb * 0.84) * 0.6, path, (x, y) => clamp(0.5 + (p.bayer(x, y) - 0.5) * 0.12, 0.02, 0.999));
      L2.ell(w * 0.86, G.vb * 0.86, s(26), s(14), rock, p.sphere(w * 0.84, G.vb * 0.82, s(26), s(14), { amb: 0.3 }));
      L2.outline();
      g.drawImage(L2.canvas(), 0, 0);
      return { cv };
    });
  }
  const valley = {
    phases: [['ahead', 1000], ['comp', 800], ['resolve', 800]],
    safe: { wide: 'the valley and your companion\'s face above the sheet', narrow: 'their face and the valley in the upper half', land: 'their face' },
    draw(c, w, h, t, st) {
      const G = geomPass(w, h, st.vb), { s } = G;
      c.drawImage(valleyStatic(G).cv, 0, 0);
      // the sun about to clear the far ridge: a warm rim
      const ka = ease(st.at('ahead'));
      SP.glow(c, Math.round(w * 0.6), Math.round(st.vb * 0.34), Math.round(s(60) * (0.6 + 0.4 * ka)), '255,210,160', 0.2 * ka);
      const W = Math.round(clamp(s(118), 80, 160));
      const pb = Q.back(st.cast.pc || {}, W, { light: 'r' });
      const bx = Math.round(w * (G.narrow ? 0.3 : 0.32)), by = Math.round(st.vb + s(G.narrow ? 90 : 80));
      if (pb) c.drawImage(pb.cv, bx - pb.ax, by - pb.ay);
      const comp = st.cast.comp;
      if (comp) {
        const kc = st.at('comp'), kr = st.at('resolve');
        if (kc > 0) {
          const b = Q.bust(comp.id, kr > 0.4 ? 'closed' : 'neutral', kr > 0.4 ? null : { look: [1, 0], head: [1, 0] }, DAWN, false, 200);
          const cx = Math.round(w * (G.narrow ? 0.72 : 0.68) + (1 - ease(kc)) * s(8)), cy = Math.max(Math.round(st.vb + s(10)), 98);
          if (b) c.drawImage(b.cv, cx - b.ax, cy - b.ay);
        }
      }
    },
    focus(w, h, vb) { const G = geomPass(w, h, vb), cx = Math.round(w * (G.narrow ? 0.72 : 0.68)), cy = Math.max(Math.round(vb + G.s(10)), 98); return { x: cx - 34, y: cy - 92, w: 68, h: Math.min(vb - 2, cy - 30) - (cy - 92) }; },
  };
  RB.sequence.define('kr.dawn', {
    title: { en: 'Dawn at the pass', jp: '{峠|とうげ} の {夜明|よあ}け' }, chapter: 'kr', scene: 'kr.chapter_end',
    shots: { road, valley },
  });
})();
