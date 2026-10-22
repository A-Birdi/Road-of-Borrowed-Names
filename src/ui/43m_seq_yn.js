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
 * yn.suzu_garden — Suzu's night apart (`yn.suzu_garden`, called from the Upper House's room; RBN-QA-125). There is no
 *          garden map: the inn's back garden is the picture's, from before the first line until the scene ends, and it
 *          dissolves back to the room's own map. A cutaway for one companion's night, not a page of the travel volume.
 *   garden  the back garden under the moon, seen from the veranda you step out onto: the garden wall and a pine over
 *           it, the bath's steam rising beyond; the pond with its frogs' stones and a stone lantern; Suzu small on a
 *           garden stone at the near bank, hugging her knees
 *   stone   the two of you from behind on her stone, the pond and the moon's long reflection in front of you
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
  // the guests are nobody in particular: looks drawn from fixed seeds, as the world gives people with no name
  const GUESTS = [8101, 8202, 8303, 8404].map((n) => (RB.sprites && RB.sprites.randomLook ? RB.sprites.randomLook(n) : {}));
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
      GUESTS.forEach((g0, i) => {
        const lk = Object.assign({}, g0, { shape: 'robe', cloth: i % 2 ? ['#e8e0d0', '#c8bea8', '#3a4e8a'] : ['#2e3a5e', '#222c48', '#d8a838'] });
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
        const b = Q.bust({ id: comp.id, fest: 'yn' }, 'closed', null, NIGHT, false, 200); // in the evening's yukata, as the walk has it
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

  // ==== yn.suzu_garden · the inn's back garden at night (RBN-QA-125) ===============================================
  // moonlight: cool, from the upper right; Suzu as she is (the yukata are for the mediation's evening, not tonight)
  const MOON = { mul: [0.66, 0.7, 0.86], add: [4, 6, 20], rim: { side: 'r', col: '#cfdcff', k: [0.4, 0.18], below: 0.85 } };
  const suzuLook = (st) => (st.cast.comp && st.cast.comp.id === 'suzu' ? st.cast.comp.look : look('suzu'));
  // the moon: a pale disc, its shaded edge away from the light and a few darker seas, in a faint halo
  function moonDisc(g, x, y, r) {
    SP.glow(g, x, y, Math.round(r * 3.2), '200,214,255', 0.16);
    for (let j = -r; j <= r; j++) {
      const hw = Math.round(Math.sqrt(Math.max(0, r * r - j * j)));
      R(g, x - hw, y + j, hw * 2, 1, '#e8ecf4');
      R(g, x - hw, y + j, Math.max(1, Math.round(hw * 0.28)), 1, '#c4ccdc');
    }
    for (const [dx, dy, rr] of [[0.25, -0.2, 0.22], [-0.1, 0.25, 0.18], [0.35, 0.35, 0.12]]) {
      const cx = Math.round(x + dx * r), cy = Math.round(y + dy * r), q = Math.max(1, Math.round(rr * r));
      R(g, cx - q, cy - Math.max(1, Math.round(q * 0.7)), q * 2, Math.max(1, Math.round(q * 1.4)), '#d0d6e4');
    }
  }
  // the bath's steam beyond the wall: soft columns thinning as they climb (the Upper House's own baths)
  function bathSteam(c, x0, x1, y, t, still, s) {
    for (let i = 0; i < 3; i++) {
      const bx = lerp(x0, x1, (i + 0.5) / 3), u0 = still ? 0.35 : ((t / 9000 + i * 0.31) % 1);
      for (let j = 0; j < 9; j++) { const u = (u0 + j / 9) % 1, yy = y - u * s(50), xx = bx + Math.sin(u * 3 + i) * s(7); SP.glow(c, xx, yy, Math.round(s(9) + u * s(10)), '206,212,226', (1 - u) * 0.09); }
    }
  }
  // a stone lantern (yukimi-dōrō) standing at (x, y) in units of u: its window holds a candle (lit by the shot's glow)
  function stoneLantern(L, p, x, y, u) {
    const lM = p.mat('#6e7076', { n: 7, at: 3, step: 0.08 });
    L.seg(x - u * 0.6, y - u * 2, x - u * 2.2, y, Math.max(1, Math.round(u * 0.7)), lM, 0.38);
    L.seg(x + u * 0.6, y - u * 2, x + u * 2.2, y, Math.max(1, Math.round(u * 0.7)), lM, 0.52);
    L.ell(x, y - u * 2.2, u * 2, u * 0.7, lM, 0.48);
    L.rect(x - u * 1.3, y - u * 4.4, u * 2.6, u * 2.2, lM, 0.5);
    L.rect(x - u * 0.6, y - u * 4, u * 1.2, u * 1.4, p.mat('#ffcc80', { n: 4, at: 2 }), 0.6);
    L.ell(x, y - u * 5, u * 4.2, u * 1.2, lM, p.sphere(x + u * 1.2, y - u * 5.6, u * 4.2, u * 1.2, { amb: 0.35 }));
    L.ell(x, y - u * 6.2, u * 0.7, u * 0.7, lM, 0.62);
  }
  // the pond's water into L where inside(x, y) holds (a layer of its own, copied in by its outline)
  function pondInto(L, w, h, x0, y0, x1, y1, inside, mx, s, seed) {
    const p = P(), Lw = SP.layer(w, h), water = p.mat('#1c2a3c', { n: 7, at: 3, step: 0.08 });
    SP.water(Lw, x0, y0, x1, y1, water, { band: Math.max(3, s(4)), deep: 0.22, seed, lit: (x) => clamp(1 - Math.abs(x - mx) / s(12), 0, 1) * 0.34 });
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) {
      if (!inside(x + 0.5, y + 0.5)) continue;
      const i = y * w + x;
      if (Lw.px[i] >>> 24) { L.px[i] = Lw.px[i]; L.mt[i] = Lw.mt[i]; }
    }
  }

  function geomGarden(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow', { s } = S;
    const wallY = Math.round(vb * (narrow ? 0.3 : 0.26)), footY = wallY + s(18);
    const px = Math.round(w * (narrow ? 0.56 : 0.6)), prx = Math.round(w * (narrow ? 0.4 : 0.3));
    const py = Math.round(footY + (vb - footY) * 0.5), pry = Math.max(s(14), Math.round((vb - footY) * 0.27));
    const veranda = Math.round(vb - s(narrow ? 8 : 10));
    // Suzu's stone at the near bank, to the left; the frogs' stones across the pond from it, smaller as they go
    const rock = { x: Math.round(px - prx * 0.72), y: Math.round(py + pry * 0.86), rx: s(17), ry: s(7) };
    const stones = [0.2, 0.42, 0.63, 0.84].map((u, i) => [Math.round(lerp(px - prx * 0.45, px + prx * 0.6, u)), Math.round(lerp(py + pry * 0.55, py - pry * 0.55, u)), Math.max(3, s(10 - i * 1.6)), Math.max(2, s(4 - i * 0.6))]);
    const lantern = { x: Math.min(w - s(16), Math.round(px + prx * 1.1)), y: Math.round(py - pry * 0.15) };
    return Object.assign(S, { narrow, wallY, footY, px, py, prx, pry, veranda, rock, stones, lantern, mx: Math.round(w * (narrow ? 0.76 : 0.8)), my: Math.round(wallY * 0.42), mr: Math.max(4, s(8)) });
  }
  const inPond = (G, x, y) => { const a = (x - G.px) / G.prx, b = (y - G.py) / G.pry, th = Math.atan2(b, a); return a * a + b * b <= 1 + 0.07 * Math.sin(th * 3 + 0.6) + 0.04 * Math.sin(th * 5); };
  function gardenStatic(G) {
    return cached('yn.garden|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, wallY, footY, px, py, prx, pry, veranda, rock, stones, lantern, narrow } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      // the sky: deep night blue, a few stars, the moon high on the right
      Q.bandsIn(g, 0, 0, w, wallY + s(6), ['#060918', '#0a0e22', '#0e142c', '#141a34', '#1a203c'], 0.45);
      SP.stars(g, 0, 0, w, wallY, 34, 71, 0);
      moonDisc(g, G.mx, G.my, G.mr);
      const L = SP.layer(w, h);
      // beyond the wall: the inn's own upper floor at the left (dark boards, two paper windows dimly lit, its eave), a
      // garden pine at the right, pruned into pads of needles on a bent trunk
      const tile = p.mat('#2a2c38', { n: 6, at: 3, step: 0.08 }), bark = p.mat('#2a2220', { n: 5, at: 2, step: 0.08 }), pine = p.mat('#1e2c26', { n: 6, at: 3, step: 0.08 });
      const wing0 = Math.round(w * (narrow ? 0.02 : 0.1)), wing1 = Math.round(w * (narrow ? 0.46 : 0.4)), wingTop = wallY - s(28);
      const woodD = p.mat('#2e2420', { n: 6, at: 3, step: 0.08 }), paperD = p.mat('#c89a5a', { n: 5, at: 3, step: 0.08 });
      L.rect(wing0, wingTop, wing1 - wing0, wallY - wingTop, woodD, (x) => clamp(0.32 + ((Math.round(x) % s(12)) === 0 ? -0.12 : 0), 0.02, 0.999));
      for (const k of [0.2, 0.62]) { const wx = Math.round(lerp(wing0, wing1, k)), ww = s(16), wy = wingTop + s(7); L.rect(wx, wy, ww, s(12), paperD, (xx, yy) => clamp(0.42 + ((Math.round(xx - wx) % Math.max(2, s(4))) === 0 || (Math.round(yy - wy) % Math.max(2, s(4))) === 0 ? -0.2 : 0), 0.02, 0.999)); }
      SP.roof(L, wing0 - s(6), wing1 + s(6), wingTop - s(8), s(9), tile, { course: Math.max(2, s(3)) });
      const tx = Math.round(w * (narrow ? 0.66 : 0.7)), tb = wallY + s(2);
      L.seg(tx, tb, tx - s(8), tb - s(20), Math.max(2, s(4)), bark, 0.5);
      L.seg(tx - s(8), tb - s(20), tx + s(4), tb - s(38), Math.max(2, s(3)), bark, 0.55);
      L.seg(tx - s(6), tb - s(24), tx - s(26), tb - s(30), Math.max(1, s(2)), bark, 0.5);
      L.seg(tx + s(2), tb - s(34), tx + s(24), tb - s(40), Math.max(1, s(2)), bark, 0.55);
      for (const [cx, cy, rw, rh, sd] of [[tx - s(28), tb - s(33), s(16), s(5), 83], [tx + s(26), tb - s(43), s(18), s(5), 89], [tx + s(2), tb - s(48), s(14), s(5), 91]]) SP.crown(L, cx, cy, rw, rh, pine, { seed: sd, n: 6 });
      // the garden wall: plaster under a small tiled cap, a footing of stones
      const plaster = p.mat('#6a6878', { n: 6, at: 3, step: 0.07 }), stoneM = p.mat('#4a4c56', { n: 7, at: 3, step: 0.08 });
      L.rect(0, wallY, w, footY - wallY, plaster, (x, y) => clamp(0.45 + (x / w) * 0.12 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
      SP.roof(L, -s(4), w + s(4), wallY - s(5), s(6), tile, { course: Math.max(2, s(2)) });
      L.rect(0, footY - s(4), w, s(4), stoneM, (x) => clamp(0.32 + (Math.round(x / s(7)) % 2 ? 0.08 : -0.04), 0.02, 0.999));
      // the ground: moss and swept earth, darker toward us; quiet
      const moss = p.mat('#2c3a32', { n: 6, at: 3, step: 0.08 });
      L.fill(0, footY, w, h, () => true, moss, (x, y) => clamp(0.44 - (y - footY) / Math.max(1, h - footY) * 0.14 + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
      const shrub = p.mat('#24342a', { n: 6, at: 3, step: 0.08 });
      for (const [k, rw] of [[0.04, 22], [0.17, 15], [0.5, 12], [0.86, 20], [0.97, 14]]) { const sx = Math.round(w * k), sy = footY + s(3), r = s(rw); L.ell(sx, sy, r, s(9), shrub, p.sphere(sx + r * 0.4, sy - s(5), r, s(9), { amb: 0.3 })); }
      // the pond, the moon's long reflection on it
      pondInto(L, w, h, px - prx * 1.1, py - pry * 1.15, px + prx * 1.1, py + pry * 1.15, (x, y) => inPond(G, x, y), G.mx, s, 37);
      // its bank: stones set round the edge, more of them on the near side, none where Suzu's stone sits
      const bankM = p.mat('#585a62', { n: 7, at: 3, step: 0.08 });
      const rb = p.rnd(29);
      for (let th = 0.2; th < Math.PI * 2 + 0.2;) {
        const near = Math.sin(th) > 0, big = rb() < 0.25;
        const bx = px + Math.cos(th) * prx * (1 + rb() * 0.05), by = py + Math.sin(th) * pry * (1.04 + rb() * 0.06);
        th += (near ? 0.17 : 0.24) + rb() * 0.24;
        if (Math.hypot(bx - rock.x, (by - rock.y) * 2) < rock.rx * 1.4 || rb() < 0.18) continue;
        const r = Math.max(2, s((near ? 3.5 : 2.5) + (big ? 2.5 : rb() * 1.5))), ry = Math.max(1, Math.round(r * 0.55));
        L.ell(bx, by, r, ry, bankM, p.sphere(bx + r * 0.4, by - ry * 0.5, r, ry, { amb: 0.3 }));
      }
      // the frogs' stones across the water, each with its dark wet rim
      for (const [sx, sy, rx, ry] of stones) {
        L.ell(sx, sy + 1, rx, ry, p.mat('#1a2230', { n: 4, at: 2 }), 0.3);
        L.ell(sx, sy, rx, ry, bankM, p.sphere(sx + rx * 0.35, sy - ry * 0.6, rx, ry, { amb: 0.35 }));
      }
      // a stone lantern (yukimi-dōrō) on the far bank: splayed legs, a platform, the fire box with a candle in its
      // window, the wide umbrella cap and its finial
      stoneLantern(L, p, lantern.x, lantern.y, Math.max(2, s(3)));
      // Suzu's stone at the near bank: broad and flat-topped; a path of flat stones to it from the veranda's step
      L.ell(rock.x, rock.y, rock.rx, rock.ry, stoneM, p.sphere(rock.x + rock.rx * 0.4, rock.y - rock.ry * 0.6, rock.rx, rock.ry, { amb: 0.32 }));
      for (let i = 0; i < 4; i++) { const u = (i + 1) / 5, sx = Math.round(lerp(s(36), rock.x - rock.rx * 0.5, u)), sy = Math.round(lerp(veranda - s(3), rock.y + rock.ry * 1.8, u)), rx = Math.max(3, Math.round(s(9) * (1.2 - u * 0.5))), ry = Math.max(2, Math.round(rx * 0.42)); L.ell(sx, sy, rx, ry, bankM, p.sphere(sx + rx * 0.3, sy - ry * 0.5, rx, ry, { amb: 0.35 })); }
      // the veranda you step out onto: its eave across the top left, a post, the boards' edge at the bottom
      const wood = p.mat('#3a2c26', { n: 7, at: 3, step: 0.08 });
      SP.roof(L, -s(10), Math.round(w * (narrow ? 0.46 : 0.36)), -s(2), s(12), tile, { course: Math.max(2, s(3)) });
      L.rect(s(8), 0, Math.max(3, s(5)), veranda, wood, (x, y) => clamp(0.3 + ((Math.round(x) % 3) === 0 ? 0.08 : 0), 0.02, 0.999));
      SP.planks(L, 0, veranda, Math.round(w * (narrow ? 0.6 : 0.45)), h - veranda, wood, { board: Math.max(3, s(6)), seed: 19 });
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the room's lamp behind you, warm on the boards; the night everywhere else
      SP.glow(g, s(10), veranda + s(4), s(46), '255,186,116', 0.16);
      return { cv };
    });
  }
  const garden = {
    phases: [['moon', 1400]],
    safe: { wide: 'Suzu on her stone and the pond above the sheet', narrow: 'Suzu and the pond in the upper half', land: 'Suzu on her stone' },
    draw(c, w, h, t, st) {
      const G = geomGarden(w, h, st.vb), { s, py, pry, rock, stones } = G, still = st.still;
      c.drawImage(gardenStatic(G).cv, 0, 0);
      // the moon's light coming up on the water as the picture settles
      SP.glints(c, G.mx - s(10), py - pry * 0.7, s(20), pry * 1.4, t, Math.round(4 + 8 * ease(st.at('moon'))), 53, '214,226,255', still);
      bathSteam(c, w * 0.8, w * 0.98, G.wallY, t, still, s);
      const lu = Math.max(2, s(3));
      SP.glow(c, G.lantern.x, G.lantern.y - lu * 3.3, s(16), '255,186,110', 0.14);
      // a frog on the far stone: now and then the rings it leaves on the water
      if (!still) { const f = stones[3], u = ((t + 900) % 3800) / 3800; if (u < 0.55) SP.rings(c, f[0] + f[2], f[1] + s(2), s(9), u / 0.55, '186,204,240', 2); }
      // Suzu on her stone, hugging her knees, turned to the pond
      const f = Q.figure(suzuLook(st), 'right', 'p:sitlow', clamp(G.Z * 0.8, 0.45, 1), MOON);
      if (f) c.drawImage(f.cv, Math.round(rock.x - f.ax), Math.round(rock.y - rock.ry * 0.4 - f.ay));
    },
    focus(w, h, vb) { const G = geomGarden(w, h, vb), y = Math.max(0, G.rock.y - G.s(56)); return { x: G.rock.x - G.s(30), y, w: G.s(60), h: Math.max(8, Math.min(vb - 2, G.rock.y + G.s(8)) - y) }; },
  };

  function geomStone(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow', { s } = S;
    const wallY = Math.round(vb * (narrow ? 0.16 : 0.12)), bank = wallY + s(16);
    const seat = Math.round(vb - s(narrow ? 16 : 20));
    const W = Math.round(clamp(s(82), 56, 118));
    const lx = Math.round(w * (narrow ? 0.34 : 0.4)), rx = lx + Math.round(W * 0.98);
    return Object.assign(S, { narrow, wallY, bank, seat, W, lx, rx, mx: Math.round(w * (narrow ? 0.6 : 0.62)) });
  }
  function stoneStatic(G) {
    return cached('yn.gstone|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, wallY, bank, mx } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, wallY + s(4), ['#0a0e22', '#0e142c', '#141a34'], 0.45);
      SP.stars(g, 0, 0, w, wallY, 10, 73, 0);
      const L = SP.layer(w, h);
      const plaster = p.mat('#6a6878', { n: 6, at: 3, step: 0.07 }), tile = p.mat('#2a2c38', { n: 6, at: 3, step: 0.08 }), moss = p.mat('#2c3a32', { n: 6, at: 3, step: 0.08 });
      const pine = p.mat('#1e2c26', { n: 6, at: 3, step: 0.08 });
      SP.crown(L, Math.round(w * 0.78), wallY - s(6), s(34), s(8), pine, { seed: 97, n: 8 });
      L.rect(0, wallY, w, s(10), plaster, (x, y) => clamp(0.45 + (x / w) * 0.1 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
      SP.roof(L, -s(4), w + s(4), wallY - s(4), s(5), tile, { course: 2 });
      L.fill(0, wallY + s(10), w, bank, () => true, moss, (x, y) => clamp(0.4 + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999));
      // the pond from its near edge to the far bank, the moon's reflection a long broken column on it
      pondInto(L, w, h, -2, bank, w + 2, h + 2, () => true, mx, s, 41);
      // the far bank's stones and a frog's stone out on the water
      const bankM = p.mat('#585a62', { n: 7, at: 3, step: 0.08 });
      const rb = p.rnd(31);
      for (let bx = rb() * s(20); bx < w;) { const r = Math.max(2, s(2.5 + rb() * 3)); if (rb() > 0.2) L.ell(bx, bank + rb() * s(2), r, Math.max(1, Math.round(r * 0.5)), bankM, p.sphere(bx + r * 0.4, bank - r * 0.3, r, r * 0.5, { amb: 0.3 })); bx += s(10) + rb() * s(30); }
      // the stone lantern from the first picture, small on the far bank, its candle lit
      stoneLantern(L, p, Math.round(w * 0.84), bank + s(1), Math.max(1, s(2)));
      const fx = Math.round(w * 0.24), fy = Math.round(lerp(bank, G.seat, 0.45)), fr = Math.max(4, s(10));
      L.ell(fx, fy, fr, Math.max(2, Math.round(fr * 0.4)), bankM, p.sphere(fx + fr * 0.35, fy - fr * 0.2, fr, fr * 0.4, { amb: 0.35 }));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv, fx, fy, fr };
    });
  }
  // the stone the two of you sit on, in front of you: its top at the seat, rounded, lit from the right
  function seatStone(c, G) {
    const B = Q.small('yn.gseat|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, seat, lx, rx, W } = G, p = P(), x0 = Math.round(lx - W * 0.8), x1 = Math.round(rx + W * 0.8);
      const cv = mk(w, h), L = SP.layer(w, h), M = p.mat('#4e505a', { n: 7, at: 3, step: 0.08 }), mossM = p.mat('#2e3e30', { n: 5, at: 2, step: 0.08 });
      // a rounded boulder, domed across its top and falling away at both ends, its near face in shade
      const top = (x) => { const u = (x - (x0 + x1) / 2) / ((x1 - x0) / 2); return seat + Math.round(u * u * s(22) + Math.sin(x / s(9)) * 1.2); };
      const edge = (y) => s(10) * Math.min(1, (y - seat) / Math.max(1, s(30)));
      L.fill(x0, seat - s(2), x1, h, (x, y) => y >= top(x) && x > x0 + s(14) - edge(y) && x < x1 - s(14) + edge(y), M, (x, y) => clamp(0.52 + (x - (x0 + x1) / 2) / (x1 - x0) * 0.32 - (y - seat) / Math.max(1, h - seat) * 0.34 + (p.bayer(x, y) - 0.5) * 0.08 + (y - top(x) < 2 ? 0.12 : 0), 0.02, 0.999));
      // moss in the hollows of its top, darker under the curve
      const rm = p.rnd(43);
      for (let i = 0; i < 9; i++) { const mx = lerp(x0 + s(20), x1 - s(20), rm()), my = top(mx) + s(2) + rm() * s(4); L.ell(mx, my, s(3 + rm() * 4), s(1.5), mossM, 0.4); }
      L.outline();
      cv.getContext('2d').drawImage(L.canvas(), 0, 0);
      return { cv };
    });
    c.drawImage(B.cv, 0, 0);
  }
  const stone = {
    phases: [['settle', 1000]],
    safe: { wide: 'the two of you and the moon on the water above the sheet', narrow: 'your heads and the pond in the upper half', land: 'the two of you' },
    draw(c, w, h, t, st) {
      const G = geomStone(w, h, st.vb), { s, seat, W, lx, rx, mx, bank } = G, still = st.still;
      const B = stoneStatic(G);
      c.drawImage(B.cv, 0, 0);
      SP.glints(c, mx - s(8), bank + s(4), s(16), seat - bank, t, Math.round(8 + 8 * ease(st.at('settle'))), 59, '214,226,255', still);
      SP.glow(c, Math.round(w * 0.84), bank - Math.max(1, s(2)) * 3, s(10), '255,186,110', 0.14);
      if (!still) { const u = ((t + 400) % 4200) / 4200; if (u < 0.5) SP.rings(c, B.fx + B.fr, B.fy + s(2), s(10), u / 0.5, '186,204,240', 2); }
      // you at the left and Suzu at your right, from behind, seated: each one's hips (0.4 of the shoulders' width below
      // the drawing's anchor, src/ui/43_sequence_back.js) a little below the stone's top line, settled into its dome;
      // what is below them is the stone's
      const Ws = Math.round(W * 0.94);
      const pb = Q.back(st.cast.pc || {}, W, { light: 'r', ext: 0.5 });
      if (pb) c.drawImage(pb.cv, lx - pb.ax, seat - Math.round(W * 0.3) - pb.ay);
      const cb = Q.back(suzuLook(st), Ws, { light: 'r', ext: 0.5 });
      if (cb) c.drawImage(cb.cv, rx - cb.ax, seat - Math.round(Ws * 0.3) - cb.ay);
      seatStone(c, G);
    },
    focus(w, h, vb) { const G = geomStone(w, h, vb), y = Math.max(0, G.seat - Math.round(G.W * 1.35)); return { x: G.lx - Math.round(G.W * 0.6), y, w: G.rx - G.lx + Math.round(G.W * 1.2), h: Math.max(8, Math.min(vb - 2, G.seat) - y) }; },
  };
  RB.sequence.define('yn.suzu_garden', {
    page: false, title: { en: 'Suzu in the back garden', jp: '{裏庭|うらにわ} の スズ' }, chapter: 'yn', scene: 'yn.suzu_garden',
    shots: { garden, stone },
  });
})();
