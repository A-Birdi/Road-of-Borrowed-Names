/* Steamhollow, Chapter 11 of the twelve: the travel volume's pages (expansion P16; AC-1).
 *
 * yn.kettle — the Kettle Below settled (`yn.kettle`, src/content/yn/23_scenes_vents.js, after the encounter).
 *   pool    the Kettle's chamber: a cavern of wet rock round a pool, the great iron-dark shape in it the size of a
 *           house; the bubbles going out one by one and the shape settling to the bottom, the water clearing, the
 *           steam rising quietly
 * yn.end — the chapter's last night (`yn.end`).
 *   valley  every lantern in the valley lit: the two inns either side of the river, the red bridge between them with
 *           guests of both inns crossing in yukata, steam from the baths and the river
 *   ridge   above it all the north ridge, black under the stars and silent; your companion's resolve
 * No letters, kana or kanji are drawn: noren and lanterns carry colour, never characters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};

  const NIGHT = { mul: [0.74, 0.7, 0.82], add: [8, 4, 16], rim: { side: 'r', col: '#ffb070', k: [0.42, 0.2], below: 0.85 } };
  const FEST = { mul: [0.6, 0.54, 0.6], add: [14, 6, 4], rim: { side: 't', col: '#ffb070', k: [0.42, 0.2] } };

  // ==== yn.kettle · the Kettle's chamber ==========================================================================
  function geomPool(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow', wl: Math.round(vb * 0.56) }); }
  function poolStatic(G) {
    return cached('yn.pool|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, wl } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.fillStyle = '#0e1214'; g.fillRect(0, 0, w, h);
      const L = SP.layer(w, h), rock = p.mat('#4a4a46', { n: 7, at: 3, step: 0.08 }), wet = p.mat('#3a4442', { n: 6, at: 3, step: 0.08 }), mineral = p.mat('#a89a6a', { n: 6, at: 3, step: 0.08 });
      // the cavern: rock walls closing in from both sides and overhead, wet and streaked with mineral where water ran
      const rim = (x) => s(30) + Math.sin(x / (w * 0.09)) * s(10) + Math.abs(x - w / 2) * 0.12;
      // the back wall of the chamber, dim, in broken slabs, warmer low down where the pool's heat lights it
      const back = p.mat('#3a3634', { n: 7, at: 3, step: 0.08 });
      L.fill(0, 0, w, wl, () => true, back, (x, y) => clamp(0.2 + (y / wl) * 0.2 + (((Math.round(x / s(9)) * 7 + Math.round(y / s(6)) * 3) % 5) === 0 ? 0.08 : 0) + ((Math.round(y) % s(6)) === 0 ? -0.08 : 0) + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
      L.fill(0, 0, w, wl, (x, y) => y < rim(x), rock, (x, y) => clamp(0.3 + (rim(x) - y) / s(60) * -0.1 + (((Math.round(x * 0.5) * 7 + Math.round(y * 0.5) * 3) % 11) < 2 ? 0.12 : 0) + (p.bayer(x, y) - 0.5) * 0.1, 0.02, 0.999));
      for (const side of [-1, 1]) {
        const edge = (y) => (side < 0 ? s(70) + Math.sin(y / s(16)) * s(8) : w - s(70) - Math.sin(y / s(14)) * s(8));
        L.fill(0, 0, w, h, (x, y) => (side < 0 ? x < edge(y) : x > edge(y)), rock, (x, y) => clamp(0.42 + (side < 0 ? 0.08 : -0.06) + (((Math.round(y * 0.5) * 5 + Math.round(x * 0.5)) % 9) < 2 ? 0.1 : 0) + (p.bayer(x, y) - 0.5) * 0.1, 0.02, 0.999));
        for (let i = 0; i < 4; i++) { const x = side < 0 ? s(20 + i * 12) : w - s(20 + i * 12); L.seg(x, rim(x), x + side * s(4), wl, Math.max(1, s(2)), mineral, 0.5); }
      }
      // the pool: dark green water, lit from below where the Kettle's heat is
      const water = p.mat('#2a4a46', { n: 7, at: 3, step: 0.08 });
      SP.water(L, 0, wl, w, h, water, { band: Math.max(3, s(4)), deep: 0.3, seed: 33, lit: (x, y) => clamp(1 - Math.hypot(x - w / 2, (y - wl - s(30)) * 2) / (w * 0.35), 0, 1) * 0.3 });
      // the edge stones round the pool, wet
      L.fill(0, 0, w, h, (x, y) => y >= wl - s(3) && y < wl + s(2), wet, 0.7);
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // the Kettle: a great iron-dark rounded shape with a lid's rim and a spout's stub, sinking by `sink` (0..1)
  function kettle(c, G, sink, t, still) {
    const { w, s, wl } = G, cx = Math.round(w / 2), r = s(G.narrow ? 46 : 60);
    const art = Q.small('yn.kettle|' + r, () => {
      const p = P(), W = r * 3, H = Math.round(r * 2.2), L = SP.layer(W, H), iron = p.mat('#3a3436', { n: 7, at: 3, step: 0.07 }), rust = p.mat('#6a4434', { n: 5, at: 2 });
      L.ell(W / 2, H * 0.62, r * 1.25, r * 0.85, iron, p.sphere(W / 2 - r * 0.4, H * 0.4, r * 1.25, r * 0.85, { amb: 0.25 }));
      L.ell(W / 2, H * 0.3, r * 0.75, r * 0.18, iron, 0.66);
      L.ell(W / 2, H * 0.26, r * 0.2, r * 0.12, iron, 0.8);
      L.seg(W / 2 + r * 1.1, H * 0.5, W / 2 + r * 1.45, H * 0.36, r * 0.18, iron, 0.45);
      for (let i = 0; i < 9; i++) L.dot(W / 2 - r + i * r * 0.25, H * 0.62 + Math.sin(i) * r * 0.3, rust, 2);
      L.outline();
      return { cv: L.canvas(), W, H };
    });
    const y0 = Math.round(wl - art.H * 0.62 + sink * art.H * 0.3), vis = Math.max(0, Math.round(wl - y0));
    SP.glow(c, cx, wl + s(10), Math.round(r * 1.6), '255,150,90', 0.22 * (1 - sink * 0.6));
    if (vis > 0) c.drawImage(art.cv, 0, 0, art.W, vis, cx - Math.round(art.W / 2), y0, art.W, vis);
    // under the water, its shape seen through it (darker, wavering)
    const below = Math.min(art.H - vis, Math.round(G.h - wl));
    if (below > 0) { c.globalAlpha = 0.35 + 0.3 * sink; for (let j = 0; j < below; j += 2) { const off = still ? 0 : Math.round(Math.sin(t / 400 + j / 6) * 1); c.drawImage(art.cv, 0, vis + j, art.W, 2, cx - Math.round(art.W / 2) + off, wl + j, art.W, 2); } c.globalAlpha = 1; }
  }
  const pool = {
    phases: [['calm', 1600]],
    safe: { wide: 'the Kettle in its pool above the sheet', narrow: 'the Kettle in the upper half', land: 'the Kettle' },
    draw(c, w, h, t, st) {
      const G = geomPool(w, h, st.vb), { s, wl } = G, still = st.still;
      c.drawImage(poolStatic(G).cv, 0, 0);
      const k = ease(st.at('calm'));
      kettle(c, G, k, t, still);
      // the bubbles going out one by one; then only a slow one now and then
      const rnd = P().rnd(41);
      for (let i = 0; i < 18; i++) {
        const gone = i / 18 < k;
        const x = w / 2 + (rnd() - 0.5) * s(170), ph = rnd();
        if (gone && !(i === 3 && !still && ((t / 3000 + ph) % 1) < 0.15)) continue;
        const r = Math.max(1, Math.round(s(2 + rnd() * 3)));
        c.fillStyle = 'rgba(220,240,230,0.6)'; c.fillRect(Math.round(x - r), wl - r, r * 2, 1); c.fillRect(Math.round(x - r + 1), wl - r - 1, r * 2 - 2, 1);
      }
      // steam rising slowly from the whole pool: soft columns that thin as they climb
      for (let i = 0; i < 6; i++) {
        const bx = w * (0.2 + i * 0.12), u0 = still ? 0.4 : ((t / 6000 + i * 0.17) % 1);
        for (let j = 0; j < 6; j++) { const u = (u0 + j / 6) % 1, y = wl - u * st.vb * 0.5, x = bx + Math.sin(u * 5 + i) * s(8); SP.glow(c, x, y, Math.round(s(6) + u * s(10)), '230,236,234', (1 - u) * (0.3 + 0.3 * (1 - k))); }
      }
      SP.glints(c, 0, wl + s(2), w, s(30), t, 14, 43, '200,240,220', still);
    },
    focus(w, h, vb) { const G = geomPool(w, h, vb), r = G.s(G.narrow ? 46 : 60); return { x: Math.round(w / 2 - r * 1.5), y: Math.round(G.wl - r * 1.4), w: r * 3, h: Math.round(Math.min(vb - 2, G.wl + G.s(10)) - (G.wl - r * 1.4)) }; },
  };
  RB.sequence.define('yn.kettle', {
    title: { en: 'The Kettle Below, quiet', jp: '{釜|かま}の{主|ぬし} が {静|しず}まる' }, chapter: 'yn', scene: 'yn.kettle',
    shots: { pool },
  });

  // ==== yn.end · the valley's lanterns, and the silent ridge ========================================================
  function geomValley(w, h, vb) { const S = stage(w, h, vb); return Object.assign(S, { narrow: S.lay === 'narrow' }); }
  function valleyStatic(G) {
    return cached('yn.valley|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, vb } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, h, ['#080a18', '#0c1022', '#12162c', '#1a1c34', '#24223a'], 0.45);
      SP.stars(g, 0, 0, w, Math.round(vb * 0.25), 30, 23, 0);
      const L = SP.layer(w, h);
      // the valley's sides, black against the sky; the river down the middle, the two inns either side
      const hill = p.mat('#141820', { n: 5, at: 2, step: 0.08 });
      L.fill(0, 0, w, h, (x, y) => y > vb * 0.18 + Math.abs(x - w / 2) * -0.2 + Math.abs(x - w / 2) * Math.abs(x - w / 2) / w * 0.9, hill, (x, y) => clamp(0.4 + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
      const river = p.mat('#1e2a40', { n: 6, at: 3, step: 0.08 });
      SP.water(L, Math.round(w * 0.36), Math.round(vb * 0.7), Math.round(w * 0.64), h, river, { band: Math.max(3, s(4)), deep: 0.1, seed: 7 });
      // the inns: big wooden buildings, two storeys, deep eaves, rows of lit paper windows
      const wood = p.mat('#3a2a24', { n: 7, at: 3, step: 0.08 }), tile = p.mat('#22242e', { n: 6, at: 3, step: 0.08 }), paper = p.mat('#ffc878', { n: 5, at: 3, step: 0.08 });
      for (const side of [-1, 1]) {
        const x0 = side < 0 ? -s(10) : Math.round(w * 0.64), x1 = side < 0 ? Math.round(w * 0.36) : w + s(10), base = Math.round(vb * 0.74);
        for (let f = 0; f < 2; f++) {
          const top = base - s(34) * (f + 1), inset = f * s(12) * (side < 0 ? 1 : -1);
          L.rect(Math.min(x0, x1) + (side < 0 ? 0 : -inset), top, Math.abs(x1 - x0) - Math.abs(inset), s(34), wood, (x, y) => clamp(0.4 + (((Math.round(x) % s(10)) === 0) ? -0.15 : 0), 0.02, 0.999));
          for (let x = Math.min(x0, x1) + s(6) + (side < 0 ? 0 : -inset); x < Math.max(x0, x1) - s(12) - (side < 0 ? Math.abs(inset) : 0); x += s(14)) L.rect(x, top + s(8), s(9), s(14), paper, (xx, yy) => clamp(0.6 + ((Math.round(yy) % 4) === 0 ? -0.2 : 0) + ((Math.round(xx) % 4) === 0 ? -0.2 : 0), 0.02, 0.999));
          SP.roof(L, Math.min(x0, x1) - s(6) + (side < 0 ? 0 : -inset), Math.max(x0, x1) + s(6) - (side < 0 ? Math.abs(inset) : 0), top - s(10), s(10), tile, { course: Math.max(2, s(3)) });
        }
      }
      // the red bridge across the river between them
      const red = p.mat('#a83a2a', { n: 7, at: 3, step: 0.08 }), bx0 = Math.round(w * 0.3), bx1 = Math.round(w * 0.7), by = Math.round(vb * 0.74), rise = s(14);
      L.fill(bx0, by - rise - s(16), bx1, by + s(6), (x, y) => { const u = (x - bx0) / (bx1 - bx0); const top = by - Math.sin(Math.PI * u) * rise; return y >= top && y < top + s(5); }, red, (x, y) => 0.55);
      L.fill(bx0, by - rise - s(16), bx1, by, (x, y) => { const u = (x - bx0) / (bx1 - bx0); const top = by - Math.sin(Math.PI * u) * rise - s(9); return Math.abs(y - top) < 1.2; }, red, 0.75);
      for (let x = bx0 + s(4); x < bx1; x += s(14)) { const u = (x - bx0) / (bx1 - bx0); const top = by - Math.sin(Math.PI * u) * rise; L.rect(x, top - s(9), Math.max(2, s(2)), s(9), red, 0.6); }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv, bx0, bx1, by, rise };
    });
  }
  const PEOPLE = ['yn_oritsu', 'yn_tahei', 'yn_aki', 'yn_rokubei'];
  const valley = {
    phases: [['light', 1500]],
    safe: { wide: 'the lit valley and the bridge above the sheet', narrow: 'the bridge in the upper half', land: 'the bridge' },
    draw(c, w, h, t, st) {
      const G = geomValley(w, h, st.vb), { s } = G, still = st.still;
      const B = valleyStatic(G);
      c.drawImage(B.cv, 0, 0);
      const kl = st.at('light');
      // the lanterns strung along both inns' eaves and the bridge, lighting in a wave from the bridge outward
      const rows = [];
      for (let i = 0; i < 14; i++) rows.push([w * (0.02 + i * 0.024), st.vb * 0.58 + Math.sin(i * 0.7) * s(2)]);
      for (let i = 0; i < 14; i++) rows.push([w * (0.66 + i * 0.024), st.vb * 0.58 + Math.sin(i * 0.7) * s(2)]);
      for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6; rows.push([lerp(B.bx0, B.bx1, u), B.by - Math.sin(Math.PI * u) * B.rise - s(14)]); }
      rows.forEach(([x, y], i) => {
        const d = Math.abs(x - w / 2) / (w / 2), on = still ? 1 : clamp(kl * 1.6 - d, 0, 1);
        SP.lantern(c, Math.round(x), Math.round(y), Math.max(2, s(3)), Math.max(3, s(6)), on > 0.5, t, still);
      });
      // guests of both inns crossing the bridge in yukata (in the inns' own colours)
      PEOPLE.forEach((id, i) => {
        const lk = Object.assign({}, look(id), { shape: 'robe', cloth: i % 2 ? ['#e8e0d0', '#c8bea8', '#3a4e8a'] : ['#2e3a5e', '#222c48', '#d8a838'] });
        const u = still ? 0.2 + i * 0.2 : (((t / 9000) + i * 0.25) % 1), x = lerp(B.bx0 + s(10), B.bx1 - s(10), i % 2 ? 1 - u : u);
        const top = B.by - Math.sin(Math.PI * ((x - B.bx0) / (B.bx1 - B.bx0))) * B.rise;
        const f = Q.figure(lk, i % 2 ? 'left' : 'right', still ? 'i0' : 'w' + (Math.floor(t / 200 + i) % 4), 0.42, FEST);
        if (f) c.drawImage(f.cv, Math.round(x - f.ax), Math.round(top - f.ay));
      });
      // steam rising from the baths behind the inns and from the river
      for (let i = 0; i < 8; i++) {
        const bx = w * (0.06 + i * 0.125), u0 = still ? 0.3 : ((t / 7000 + i * 0.13) % 1);
        for (let j = 0; j < 5; j++) { const u = (u0 + j / 5) % 1, y = st.vb * 0.62 - u * st.vb * 0.4, x = bx + Math.sin(u * 4 + i) * s(10); SP.glow(c, x, y, Math.round(s(8) + u * s(10)), '220,214,226', (1 - u) * 0.28); }
      }
      SP.glints(c, Math.round(w * 0.36), Math.round(st.vb * 0.76), Math.round(w * 0.28), s(30), t, 18, 57, '255,190,120', still);
    },
    focus(w, h, vb) { return { x: Math.round(w * 0.25), y: Math.round(vb * 0.3), w: Math.round(w * 0.5), h: Math.round(vb * 0.5) }; },
  };
  const ridge = {
    phases: [['up', 1200], ['comp', 800]],
    safe: { wide: 'the silent ridge and your companion\'s face above the sheet', narrow: 'their face and the ridge in the upper half', land: 'their face' },
    draw(c, w, h, t, st) {
      const G = geomValley(w, h, st.vb), { s } = G;
      const B = cached('yn.ridge|' + w + 'x' + h + '|' + st.vb, () => {
        const cv = mk(w, h), g = cv.getContext('2d'), p = P();
        g.imageSmoothingEnabled = false;
        Q.bandsIn(g, 0, 0, w, h, ['#04060e', '#080a16', '#0c0e1e', '#121428', '#1a1a30'], 0.45);
        SP.stars(g, 0, 0, w, Math.round(st.vb * 0.4), 70, 29, 9);
        const L = SP.layer(w, h), m = p.mat('#0a0c14', { n: 4, at: 1 });
        L.fill(0, 0, w, h, (x, y) => y > st.vb * 0.42 - Math.abs(Math.sin(x / (w * 0.13) + 1)) * s(40) + Math.sin(x / (w * 0.04)) * s(4), m, 0.5);
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        // the valley's lantern glow along the bottom edge
        for (let i = 0; i < 6; i++) SP.glow(g, Math.round(w * (0.1 + i * 0.16)), Math.round(st.vb * 0.98), s(40), '255,170,90', 0.18);
        return { cv };
      });
      c.drawImage(B.cv, 0, 0);
      const comp = st.cast.comp, kc = st.at('comp');
      if (comp && kc > 0) {
        const b = Q.bust(comp.id, 'closed', null, NIGHT, false, 200);
        const cx = Math.round(w * (G.narrow ? 0.66 : 0.64) + (1 - ease(kc)) * s(8)), cy = Math.max(Math.round(st.vb + s(10)), 98);
        if (b) c.drawImage(b.cv, cx - b.ax, cy - b.ay);
      }
    },
    focus(w, h, vb) { const G = geomValley(w, h, vb), cx = Math.round(w * (G.narrow ? 0.66 : 0.64)), cy = Math.max(Math.round(vb + G.s(10)), 98); return { x: cx - 34, y: cy - 92, w: 68, h: Math.min(vb - 2, cy - 30) - (cy - 92) }; },
  };
  RB.sequence.define('yn.end', {
    title: { en: 'Every lantern in the valley', jp: '{谷|たに} の {提灯|ちょうちん}' }, chapter: 'yn', scene: 'yn.end',
    shots: { valley, ridge },
  });
})();
