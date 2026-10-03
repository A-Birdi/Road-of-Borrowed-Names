/* Party effects (battle addendum §8.3, §10): the visuals that carry a response, a companion's support or
 * a technique to its actual targets, in whole pixels on the scene's grid. They are added to
 * RB.battleFx.fx under their own names (prefixed 'p', or a shared family's prefix where an older test
 * reads it: flashReveal, splashArc, ropeBind, ringsPulse, ringsVoice) and never replace another area's
 * effects. src/ui/84p_party_choreo.js places them; the stage draws them each frame from live anchors —
 * an actor's 'release' (where an effect leaves: a brush tip, a strip end, the vial's lip, the lamp,
 * a fingertip), 'held', 'chest', 'head', 'feet'; a creature's 'core', 'top', 'base'; a knot's.
 *
 * Truthfulness: an effect is placed only on the recipients the rules name; a heal that restores no one
 * gathers and settles back without reaching anyone; light disperses a Shroud only when one was there
 * (pShroudClear is placed for the rules' 'light' result); nothing here draws an impact star or damage.
 * Particles are few, deterministic (seeded by index; never Math.random). With reduced motion (`still`)
 * each effect shows its meaning as a held mark, without travel, particles or flashes. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const F = RB.battleFx, K = () => RB.pxkit, P = F.P;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (k) => 1 - Math.pow(1 - cl(k), 3);
  const easeIn = (k) => cl(k) * cl(k);
  const seg = (k, a, b) => cl((k - a) / (b - a));
  const bell = (k) => Math.sin(Math.PI * cl(k));
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y) || 1;
  function R(c, x, y, w, h, col, a) {
    if (a != null) { if (a <= 0.01) return; c.globalAlpha = Math.min(1, a); }
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    if (a != null) c.globalAlpha = 1;
  }
  function qpt(a, b, bend, s) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend;
    return { x: (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * cx + s * s * b.x, y: (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * cy + s * s * b.y };
  }
  function ell(c, x, y, rx, ry, u, col, a, from, to) {
    if (a <= 0.01) return;
    c.globalAlpha = cl(a); c.fillStyle = col;
    const n = Math.max(12, Math.round(((rx + ry) * 1.3) / u));
    const a0 = from == null ? 0 : from, a1 = to == null ? Math.PI * 2 : to;
    for (let i = 0; i <= n; i++) { const q = a0 + ((a1 - a0) * i) / n; c.fillRect(Math.round(x + Math.cos(q) * rx), Math.round(y + Math.sin(q) * ry), u, u); }
    c.globalAlpha = 1;
  }
  function disc(c, x, y, r, ry, col, a) { if (a <= 0.01) return; c.globalAlpha = cl(a); c.fillStyle = col; K().disc(c, x, y, Math.max(1, Math.round(r)), Math.max(1, Math.round(ry))); c.globalAlpha = 1; }
  function halo(c, x, y, r, rgb, a) { if (a > 0.01) K().halo(c, x, y, Math.max(2, Math.round(r)), rgb, a, 3); }
  // a dotted path along s → q(s) between from and to
  function path(c, fn, len, from, to, u, col, a, step, th) {
    if (a <= 0.01 || to <= from) return;
    c.globalAlpha = cl(a); c.fillStyle = col;
    const n = Math.max(3, Math.round((len * (to - from)) / ((step || 1.5) * u)));
    for (let i = 0; i <= n; i++) { const q = fn(from + ((to - from) * i) / n); c.fillRect(Math.round(q.x), Math.round(q.y), th || u, th || u); }
    c.globalAlpha = 1;
  }
  // a small paper seal tag (paper face, vermilion band, edge)
  function tag(c, x, y, u, a, lit) {
    const w = 5 * u, h = 8 * u;
    R(c, x - w / 2 - u, y - h / 2 - u, w + 2 * u, h + 2 * u, lit ? P.light : P.paperEdge, a * 0.85);
    R(c, x - w / 2, y - h / 2, w, h, lit ? '#fffaf0' : P.paper, a);
    R(c, x - u, y - h / 2 + u, 2 * u, h - 2 * u, P.verm, a * 0.9);
  }
  function puff(c, x, y, r, u, col, a) { disc(c, x, y, Math.max(u, r), Math.max(u, r * 0.55), col, a); }
  // Nao's courier route (pCourier, pThreadRoute): where it starts — the pencil's point when the sketch began,
  // kept relative to his feet in art px so it stays put while the pencil moves on and follows the stage through
  // a resize — and the shape of each leg: a high arc out over the party, a hump hopping from knot to knot, a
  // rise up to the creature
  function courierStart(e, A) {
    const from = e.p.from || 'comp', f = A.pt(from, 'feet'), u = A.u;
    if (!e._st) { const p = A.pt(from, 'release'); e._st = { dx: (p.x - f.x) / u, dy: (p.y - f.y) / u }; }
    return { x: f.x + e._st.dx * u, y: f.y + e._st.dy * u };
  }
  function courierLeg(pts, i, A, thread) {
    const a = pts[i], b = pts[i + 1], L = dist(a, b), last = !thread && i === pts.length - 2;
    const bend = i === 0 ? -0.3 : last ? 0.3 : -0.5;
    return (q) => qpt(a, b, bend * L, q);
  }
  // a courier's dashed line along fn up to `to`, at a fixed spacing (the dashes never crawl as it grows)
  function courierDash(c, fn, L, to, u, a) {
    if (a <= 0.01 || to <= 0) return;
    const step = (1.2 * u) / (L || 1);
    for (let j = 0, q = 0; q <= to; j++, q = j * step) {
      if (j % 6 > 3) continue;
      const p = fn(q);
      R(c, p.x - 1.5 * u, p.y - u, 3 * u, 3 * u, '#3e2810', a * 0.85);
      R(c, p.x - u, p.y - u, 2 * u, 2 * u, '#ffd860', a);
      R(c, p.x - u, p.y - u, u, u, '#fff6d0', a);
    }
  }
  const sparkle = (c, x, y, r, u, col, a) => { R(c, x - u / 2, y - r, u, 2 * r, col, a); R(c, x - r, y - u / 2, 2 * r, u, col, a); };

  const fx = {
    // Unravel: a cord drawn out of the completed inscription to the very knot that loosens — it runs out
    // slack, then is pulled taut (the knot's own release is 'knotRelease', at the result's beat)
    pThread(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release'), b = A.pt(e.p.to, 'core'), L = dist(a, b);
      const fade = 1 - seg(k, 0.82, 1);
      if (still) { path(c, (s) => qpt(a, b, -0.12 * L, s), L, 0, 1, u, P.cord, 0.8 * fade, 2); return; }
      const head = ease(seg(k, 0, 0.42)), pull = ease(seg(k, 0.42, 0.8));
      const bend = (-0.24 + 0.2 * pull) * L, wob = (1 - pull) * 2.2 * u;
      const fn = (s) => { const q = qpt(a, b, bend, s); return { x: q.x, y: q.y + Math.sin(s * Math.PI * 4 + t / 110) * wob * Math.sin(Math.PI * s) }; };
      path(c, fn, L, 0, head, u, P.ink2, fade * 0.9, 1.2, 2 * u);
      path(c, (s) => { const q = fn(s); return { x: q.x, y: q.y - u }; }, L, 0, head, u, P.cord, fade, 1.2);
      const hp = fn(head);
      if (pull <= 0) R(c, hp.x - u, hp.y - u, 3 * u, 3 * u, P.paper, fade);
      else sparkle(c, b.x, b.y, Math.round((2 + 3 * bell(pull)) * u), u, '#ffffff', fade * bell(pull));
    },
    // Protect: a vermilion stroke closes round the one it protects; a folded seal lands before them
    pSealClose(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.to, 'chest'), r = A.wardR;
      const fade = 1 - seg(k, 0.8, 1);
      if (still) { tag(c, o.x + r * 0.7, o.y - r * 0.4, u, 0.9 * fade, true); return; }
      const s = ease(seg(k, 0, 0.55)), a0 = -Math.PI * 0.3, sweep = Math.PI * 1.75;
      ell(c, o.x, o.y + u, r * 1.05, r * 0.95, 2 * u, P.verm, 0.85 * fade, a0, a0 + sweep * s);
      ell(c, o.x, o.y, r * 1.05, r * 0.95, u, P.light, 0.7 * fade, a0, a0 + sweep * s);
      const land = seg(k, 0.45, 0.7);
      if (land > 0) {
        const x = o.x + Math.cos(-Math.PI * 0.25) * r, y = o.y + Math.sin(-Math.PI * 0.25) * r * 0.9 - (1 - ease(land)) * 10 * u;
        tag(c, x, y, u, fade, e.p.held || land < 1);
        if (land < 1) halo(c, x, y, 8 * u, '255,244,200', 0.4 * bell(land));
      }
    },
    // Light: the raised hand gathers light, a band of it reaches the creature, a reveal (no impact)
    flashReveal(c, e, k, A, t, still) {
      const u = A.u, b = A.pt('foe', 'core');
      if (still) { halo(c, b.x, b.y, A.foeR * 0.8, '255,248,214', 0.35 * (1 - seg(k, 0.7, 1))); return; }
      const a = A.pt(e.p.from, 'release');
      const g = seg(k, 0, 0.3);
      if (g < 1) { halo(c, a.x, a.y, (3 + g * 9) * u, '255,244,200', 0.75 * bell(g)); sparkle(c, a.x, a.y, Math.round((2 + 3 * g) * u), u, '#ffffff', bell(g)); }
      const band = seg(k, 0.22, 0.62), L = dist(a, b);
      if (band > 0 && band < 1) {
        for (let j = -1; j <= 1; j++) path(c, (s) => { const q = qpt(a, b, -0.1 * L, s); return { x: q.x, y: q.y + j * 2 * u }; }, L, Math.max(0, band - 0.5), band, u, j ? P.warm : P.light, (j ? 0.5 : 0.9) * (1 - band * 0.5), 1.5);
      }
      const rv = seg(k, 0.5, 1);
      if (rv > 0) {
        halo(c, b.x, b.y, A.foeR * (0.5 + 0.5 * ease(rv)) * (e.p.lit ? 1.2 : 0.8), '255,248,214', (e.p.lit ? 0.5 : 0.3) * (1 - rv));
        for (let i = 0; i < 8; i++) {
          const an = (i / 8) * Math.PI * 2 + 0.2, r0 = (A.foeR * 0.4 + ease(rv) * 18 * u);
          R(c, b.x + Math.cos(an) * r0, b.y + Math.sin(an) * r0 * 0.8, u, u, P.light, 1 - rv);
        }
      }
    },
    // the creature's real Shroud dispersing: the same mist that marked it, pushed off and thinning —
    // outward from its centre for light, swept away to the right for wind
    pShroudClear(c, e, k, A, t, still) {
      const u = A.u, b = A.pt('foe', 'base'), o = A.pt('foe', 'core'), w = A.knotSpan || A.foeR;
      const pts = [[b.x - w * 0.6, b.y - 2 * u, 16 * u, 0.42], [b.x + w * 0.55, b.y + 2 * u, 18 * u, 0.42], [b.x, b.y + 4 * u, 20 * u, 0.48], [o.x - A.foeR * 0.45, o.y + A.foeR * 0.25, 20 * u, 0.24], [o.x + A.foeR * 0.4, o.y + A.foeR * 0.3, 22 * u, 0.24]];
      if (still) { for (const [x, y, r, a] of pts) puff(c, x, y, r * 0.8, u, P.mist, a * (1 - k)); return; }
      const s = ease(k), wind = e.p.by === 'wind';
      pts.forEach(([x, y, r, a], i) => {
        const dx = x - o.x, dy = y - o.y, L = Math.hypot(dx, dy) || 1;
        const mx = wind ? (40 + i * 8) * u * s : (dx / L) * 34 * u * s, my = wind ? -6 * u * s : (dy / L) * 14 * u * s - 6 * u * s;
        puff(c, x + mx, y + my, r * (1 - 0.4 * s), u, P.mist, a * (1 - s));
      });
      if (!wind) for (let i = 0; i < 6; i++) { const ss = seg(k, 0.2 + i * 0.05, 0.8 + i * 0.03); if (ss > 0 && ss < 1) sparkle(c, o.x + (hs(i, 3) - 0.5) * A.foeR * 1.4, b.y - ease(ss) * 22 * u, u, u, P.light, 1 - ss); }
    },
    // Heal: paper motes spiral into the hand as it gathers; with no one to restore they settle and fade
    pGather(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release');
      if (still) { sparkle(c, a.x, a.y - 2 * u, 3 * u, u, P.heal, 0.8 * (1 - seg(k, 0.6, 1))); return; }
      for (let i = 0; i < 8; i++) {
        const ph = hs(i, 4), s = seg(k, ph * 0.3, ph * 0.3 + 0.6);
        if (s <= 0 || s >= 1) continue;
        const an = (i / 8) * Math.PI * 2 + s * 4, r = (1 - ease(s)) * 22 * u;
        R(c, a.x + Math.cos(an) * r, a.y + Math.sin(an) * r * 0.7 - (e.p.none ? 0 : 0), 2 * u, 2 * u, i % 3 ? P.heal2 : P.paper, bell(s));
      }
      const glow = seg(k, 0.55, 0.85);
      if (glow > 0) halo(c, a.x, a.y, (4 + 6 * glow) * u, '200,240,190', 0.5 * (1 - seg(k, 0.85, 1)));
      if (e.p.none) for (let i = 0; i < 4; i++) { const s = seg(k, 0.75, 1); R(c, a.x + (i - 1.5) * 3 * u, a.y + easeIn(s) * 12 * u, u, u, P.heal2, 1 - s); }
    },
    // …released to each one it actually restores: a stream of motes arcing to their chest
    pHealTo(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release'), b = A.pt(e.p.to, 'chest'), L = dist(a, b);
      if (still) { ell(c, b.x, b.y, 8 * u, 6 * u, u, P.heal2, 0.8 * (1 - seg(k, 0.6, 1))); return; }
      for (let i = 0; i < 7; i++) {
        const s = seg(k, i * 0.06, 0.6 + i * 0.05);
        if (s <= 0 || s >= 1) continue;
        const q = qpt(a, b, -0.25 * L - i * u, ease(s));
        R(c, q.x, q.y, 2 * u, 2 * u, i % 2 ? P.heal : P.heal2, 1 - s * 0.3);
      }
      const ar = seg(k, 0.55, 1);
      if (ar > 0) ell(c, b.x, b.y, (4 + 10 * ease(ar)) * u, (3 + 8 * ease(ar)) * u, u, P.heal2, 0.8 * (1 - ar));
    },
    // Water: a ribbon of water arcing from the hand onto the creature, a splash, steam where Heat was cooled
    splashArc(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release'), b = A.pt('foe', 'top'), L = dist(a, b);
      if (still) { if (e.p.steam) for (let i = 0; i < 3; i++) puff(c, b.x + (i - 1) * 8 * u, b.y - 10 * u, 4 * u, u, '#f4f6f8', 0.55 * (1 - seg(k, 0.6, 1))); return; }
      const tr = seg(k, 0, 0.45), tail = Math.max(0, tr - 0.35);
      const fn = (s) => qpt(a, b, -0.35 * L, s);
      if (tr < 1) { path(c, fn, L, tail, tr, u, P.water, 0.95, 1, 3 * u); path(c, (s) => { const q = fn(s); return { x: q.x, y: q.y - u }; }, L, Math.max(tail, tr - 0.12), tr, u, P.foam, 1, 1, 2 * u); }
      const hit = seg(k, 0.42, 1);
      if (hit > 0) {
        for (let i = 0; i < 10; i++) {
          const an = -Math.PI * (0.1 + 0.8 * (i / 9)), r = ease(hit) * (10 + hs(i, 4) * 14) * u;
          R(c, b.x + Math.cos(an) * r, b.y + Math.sin(an) * r * 0.7 + easeIn(hit) * 12 * u, 2 * u, 2 * u, i % 2 ? P.water : P.foam, 1 - hit);
        }
        if (e.p.steam) for (let i = 0; i < 5; i++) puff(c, b.x + (i - 2) * 7 * u + Math.sin(t / 150 + i) * 2 * u, b.y - ease(hit) * (16 + i * 3) * u, (3 + hit * 4) * u, u, '#f4f6f8', 0.55 * (1 - hit));
      }
    },
    // Ice: crisp crystalline strokes grow out on the creature, glint, and melt; cooling vapour where it
    // actually cooled Heat
    pFrost(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core'), a = A.pt(e.p.from || 'pc', 'release');
      const fade = 1 - seg(k, 0.75, 1);
      if (!still) { const tr = seg(k, 0, 0.25); if (tr < 1) path(c, (s) => ({ x: a.x + (o.x - a.x) * s, y: a.y + (o.y - a.y) * s }), dist(a, o), Math.max(0, tr - 0.3), tr, u, P.frost, 1, 1, 2 * u); }
      const g = still ? 1 : ease(seg(k, 0.22, 0.55));
      for (let i = 0; i < 6; i++) {
        const an = (i / 6) * Math.PI * 2 + 0.26, R0 = A.foeR * 0.2, L = A.foeR * 0.45 * g;
        const x0 = o.x + Math.cos(an) * R0, y0 = o.y + Math.sin(an) * R0;
        path(c, (s) => ({ x: x0 + Math.cos(an) * L * s, y: y0 + Math.sin(an) * L * s }), L + 1, 0, 1, u, i % 2 ? P.frost : '#ffffff', fade, 1);
        if (g > 0.6) for (const sd of [-1, 1]) { const bx = x0 + Math.cos(an) * L * 0.6, by = y0 + Math.sin(an) * L * 0.6, ba = an + sd * 0.9; path(c, (s) => ({ x: bx + Math.cos(ba) * 5 * u * s, y: by + Math.sin(ba) * 5 * u * s }), 5 * u, 0, 1, u, P.frost, fade * 0.8, 1); }
      }
      if (!still && g >= 1) sparkle(c, o.x + A.foeR * 0.3, o.y - A.foeR * 0.2, Math.round(3 * bell(seg(k, 0.55, 0.75)) * u) + u, u, '#ffffff', fade);
      if (e.p.steam && !still) for (let i = 0; i < 4; i++) { const s = seg(k, 0.55 + i * 0.05, 1); puff(c, o.x + (i - 1.5) * 8 * u, o.y - A.foeR * 0.3 - ease(s) * 18 * u, (3 + 3 * s) * u, u, '#f4f6f8', 0.5 * (1 - s)); }
    },
    // cooling vapour off a creature (Heat cooled by a companion's vapour; a technique washing it off)
    pSteam(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'top');
      if (still) { puff(c, o.x, o.y - 6 * u, 6 * u, u, '#f4f6f8', 0.5 * (1 - k)); return; }
      // (Clearwater Draught's washing: a fuller hiss of steam off the quenched Heat)
      if (e.p.wash) for (let i = 0; i < 4; i++) { const s = seg(k, 0.05 + i * 0.06, 0.8 + i * 0.05); puff(c, o.x + (i - 1.5) * 12 * u + Math.sin(t / 140 + i) * 3 * u, o.y + 6 * u - ease(s) * (26 + i * 5) * u, (5 + 6 * s) * u, u, '#f4f8fc', 0.6 * bell(s)); }
      for (let i = 0; i < 5; i++) { const s = seg(k, i * 0.08, 0.7 + i * 0.06); puff(c, o.x + (i - 2) * 7 * u + Math.sin(t / 160 + i) * 2 * u, o.y - ease(s) * (14 + i * 4) * u, (3 + 4 * s) * u, u, e.p.wash ? '#e8f6ff' : '#f4f6f8', 0.55 * bell(s)); }
    },
    // Wind: curved paper trails swept from the hand past the creature, a few scraps carried with them
    pWind(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, a = A.pt(e.p.from, 'release'), b = A.pt('foe', 'core');
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * 10 * u, s = seg(k, i * 0.07, 0.62 + i * 0.07);
        const aa = { x: a.x, y: a.y + off * 0.4 }, bb = { x: b.x + 40 * u, y: b.y + off - 10 * u }, L = dist(aa, bb);
        path(c, (x) => qpt(aa, bb, 0.18 * L, x), L, Math.max(0, s - 0.35), s, u, i === 1 ? P.paper : '#eef2f6', 0.85 * bell(s), 1.2);
      }
      for (let i = 0; i < 4; i++) { const s = seg(k, 0.15 + i * 0.08, 0.85); if (s <= 0 || s >= 1) continue; const q = qpt(a, { x: b.x + 50 * u, y: b.y - 6 * u }, 0.2 * dist(a, b), s); R(c, q.x, q.y + Math.sin(t / 70 + i) * 2 * u, 2 * u, u, i % 2 ? P.paper : P.paper2, 1 - s); }
    },
    // Bind: a cord thrown from the hand, wrapped twice round the creature and cinched (held when its
    // gathered force is actually broken; otherwise it slackens as it goes)
    ropeBind(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release'), o = A.pt('foe', 'core'), rx = A.foeR * 0.72, ry = A.foeR * 0.28;
      if (still) { ell(c, o.x, o.y + 6 * u, rx * 0.85, ry * 0.85, u, P.cord, 0.85 * (1 - seg(k, 0.6, 1))); return; }
      const thr = seg(k, 0, 0.3);
      if (thr < 1) path(c, (s) => qpt(a, o, -0.3 * dist(a, o), s), dist(a, o), Math.max(0, thr - 0.4), thr, u, P.cord, 1, 1.3, 2 * u);
      const wrap = ease(seg(k, 0.25, 0.6)), cinch = ease(seg(k, 0.6, 0.75)), fade = 1 - seg(k, 0.82, 1);
      const sc = 1 - 0.2 * cinch * (e.p.held ? 1 : 0.5);
      for (const [dy, col, al] of [[4, P.cord, 1], [10, P.cord, 0.9], [5, P.stone2, 0.6]]) ell(c, o.x, o.y + dy * u, rx * sc, ry * sc, u, col, fade * al, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * wrap);
      if (cinch > 0) { R(c, o.x - 2 * u, o.y + 4 * u + ry * sc - 2 * u, 4 * u, 4 * u, P.cord, fade); R(c, o.x - u, o.y + 4 * u + ry * sc - u, 2 * u, 2 * u, P.ink2, fade); }
    },
    // Stone: a circle stamped into the ground at each of your feet, small stones settling, a firm line
    pGround(c, e, k, A, t, still) {
      const u = A.u;
      for (const who of e.p.who || []) {
        const f = A.pt(who, 'feet'), s = ease(seg(k, 0, 0.35)), fade = 1 - seg(k, 0.75, 1);
        ell(c, f.x, f.y, (12 + 4 * s) * u, (3 + s) * u, u, P.stone2, fade * (still ? 0.8 : 1));
        ell(c, f.x, f.y, (8 + 3 * s) * u, (2 + s) * u, u, P.stone, fade * 0.8);
        if (still) continue;
        for (let i = 0; i < 4; i++) { const ss = seg(k, 0.05 + i * 0.06, 0.4 + i * 0.06); R(c, f.x + (i - 1.5) * 7 * u, f.y - 2 * u - (1 - easeIn(ss)) * 14 * u, 2 * u, 2 * u, i % 2 ? P.stone : P.stone2, fade * (ss > 0 ? 1 : 0)); }
        for (const sd of [-1, 1]) path(c, (x) => ({ x: f.x + sd * (10 + 8 * x) * u, y: f.y + (x * x) * 2 * u }), 10 * u, 0, s, u, P.stone2, fade * 0.7, 1.5);
      }
    },
    // Warmth: warm light round each of you, embers lifting off it (warmth, not a fireball)
    pEmber(c, e, k, A, t, still) {
      const u = A.u;
      for (const who of e.p.who || []) {
        const o = A.pt(who, 'chest');
        if (still) { halo(c, o.x, o.y, 14 * u, '255,190,120', 0.3 * (1 - seg(k, 0.7, 1))); continue; }
        halo(c, o.x, o.y, (12 + 8 * ease(k)) * u, '255,190,120', 0.42 * bell(k));
        for (let i = 0; i < 6; i++) { const s = seg(k, i * 0.07, 0.6 + i * 0.06); R(c, o.x + (hs(i, 5) - 0.5) * 24 * u + Math.sin(t / 120 + i) * u, o.y + 8 * u - ease(s) * (18 + i * 4) * u, u, 2 * u, i % 2 ? P.ember2 : P.ember, bell(s)); }
      }
    },
    // Bell: clear rings from the raised hand spreading over the two of you, each with a short tick
    ringsPulse(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from || 'pc', 'release'), o = A.pt(e.p.to || 'party', 'head');
      if (still) { ell(c, o.x, o.y - 6 * u, 12 * u, 10 * u, u, P.light, 0.75 * (1 - k)); return; }
      for (let i = 0; i < 3; i++) {
        const s = seg(k, i * 0.18, 0.62 + i * 0.12);
        if (s <= 0 || s >= 1) continue;
        const cx = a.x + (o.x - a.x) * ease(s), cy = a.y + (o.y - 6 * u - a.y) * ease(s);
        ell(c, cx, cy, (5 + ease(s) * 30) * u, (4 + ease(s) * 22) * u, u, P.light, 1 - s);
        R(c, cx - u / 2, cy - (8 + ease(s) * 24) * u, u, 3 * u, '#ffffff', 1 - s);
      }
    },
    // Voice: sound arcs carried from the speaker to whom it is for
    ringsVoice(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'head'), to = e.p.to || 'foe';
      const b = to === 'party' || to === 'pc' || to === 'comp' ? A.pt(to, 'head') : A.pt('foe', 'core');
      const col = e.p.col || '#f4e8d0', L = dist(a, b), dx = (b.x - a.x) / L, dy = (b.y - a.y) / L;
      if (still) { for (let i = 0; i < 2; i++) ell(c, a.x + dx * (12 + i * 8) * u, a.y + dy * (12 + i * 8) * u, (5 + i * 3) * u, (6 + i * 3) * u, u, col, 0.8 * (1 - k), Math.atan2(dy, dx) - 0.9, Math.atan2(dy, dx) + 0.9); return; }
      const an = Math.atan2(dy, dx);
      for (let i = 0; i < 4; i++) {
        const s = seg(k, i * 0.12, 0.55 + i * 0.12);
        if (s <= 0 || s >= 1) continue;
        const x = a.x + (b.x - a.x) * ease(s), y = a.y + (b.y - a.y) * ease(s);
        ell(c, x, y, (4 + 4 * s) * u, (6 + 5 * s) * u, u, col, 1 - s * 0.6, an - 0.9, an + 0.9);
      }
    },
    // Answer: a folded note drifting in an arc to the creature, opening there
    pNote(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release'), b = A.pt('foe', 'core');
      const s = still ? 1 : ease(seg(k, 0, 0.7)), q = qpt(a, b, -0.3 * dist(a, b), s), al = 1 - seg(k, 0.85, 1);
      const open = still ? 1 : seg(k, 0.65, 0.85), w = (6 + 6 * open) * u;
      R(c, q.x - w / 2, q.y - 3 * u + (still ? 0 : Math.sin(t / 120) * u), w, 6 * u, P.paper, al);
      R(c, q.x - w / 2, q.y - 3 * u, w, u, P.paper2, al);
      if (open > 0.5) R(c, q.x - 3 * u, q.y, 6 * u, u, P.ink2, al * 0.8);
      else R(c, q.x, q.y - 3 * u, u, 6 * u, P.paperEdge, al);
    },
    // See through: the false layer splits away — two pale panes part along a crack
    pSplit(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core'), w = A.foeR * 0.5, h = A.foeR * 0.7;
      const s = still ? 0.4 : ease(k), al = 0.55 * (1 - seg(k, 0.7, 1));
      R(c, o.x - w - s * 10 * u, o.y - h / 2 - s * 6 * u, w, h, '#e8eef8', al);
      R(c, o.x + s * 10 * u, o.y - h / 2 + s * 6 * u, w, h, '#e8eef8', al);
      path(c, (x) => ({ x: o.x + (x - 0.5) * 2 * u * 3, y: o.y - h / 2 + x * h }), h, 0, 1, u, '#ffffff', al * 1.6, 1);
    },
    // A coordinated technique: two threads, from each of you, braiding toward one culmination
    pJoin(c, e, k, A, t, still) {
      const u = A.u, a = A.pt('pc', 'release'), b2 = A.pt('comp', 'release'), d = e.p.to === 'foes' ? A.pt('foes', 'core') : A.pt('foe', 'core');
      const col2 = { nao: '#c8962e', mio: '#9ad0c0', ren: '#ffd27a', suzu: '#e8a0b8' }[e.p.who] || P.warm;
      // (soft: a fine braid under a technique whose own carrier leads — Nao's route, Mio's pour)
      const fade = (1 - seg(k, 0.8, 1)) * (e.p.soft ? 0.5 : 1), th = e.p.soft ? u : 2 * u;
      if (still) { path(c, (s) => qpt(a, d, -0.1 * dist(a, d), s), dist(a, d), 0, 1, u, P.warm, 0.7 * fade, 2); path(c, (s) => qpt(b2, d, -0.1 * dist(b2, d), s), dist(b2, d), 0, 1, u, col2, 0.7 * fade, 2); return; }
      const s = ease(seg(k, 0, 0.6));
      for (const [src, col, ph] of [[a, P.warm, 0], [b2, col2, Math.PI]]) {
        const L = dist(src, d);
        path(c, (x) => { const q = qpt(src, d, -0.2 * L, x); return { x: q.x, y: q.y + Math.sin(x * Math.PI * 5 + ph + t / 90) * 2 * u * (1 - x) }; }, L, 0, s, u, col, fade, 1.2, th);
      }
      const m = seg(k, 0.55, 0.85);
      if (m > 0) { halo(c, d.x, d.y, A.foeR * (0.4 + 0.4 * m), '255,226,160', 0.45 * bell(m)); sparkle(c, d.x, d.y, Math.round((3 + 4 * bell(m)) * u), u, '#ffffff', bell(m)); }
    },
    // Nao: the opening marked — an ink circle drawn round the place, a short leader line from his finger
    pSpot(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core'), x = o.x - A.foeR * 0.25, y = o.y + A.foeR * 0.15, r = 7 * u;
      const fade = 1 - seg(k, 0.8, 1), s = still ? 1 : ease(seg(k, 0, 0.45));
      ell(c, x, y, r, r * 0.8, 2 * u, P.ink, 0.85 * fade, -Math.PI * 0.7, -Math.PI * 0.7 + Math.PI * 2 * s);
      ell(c, x, y, r - u, r * 0.8 - u, u, P.paper, 0.7 * fade, -Math.PI * 0.7, -Math.PI * 0.7 + Math.PI * 2 * s);
      if (e.p.from && !still) { const a = A.pt(e.p.from, 'release'); path(c, (q) => ({ x: a.x + (x - a.x) * q, y: a.y + (y - a.y) * q }), dist(a, { x, y }), Math.max(0, s - 0.5), s * 0.85, u, P.paper, 0.5 * fade, 3); }
    },
    // its move crossed out before it starts (Nao seizes the opening; Suzu's feint)
    pHeadOff(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'top'), r = 8 * u, y = o.y + 10 * u;
      const fade = 1 - seg(k, 0.8, 1), s1 = still ? 1 : ease(seg(k, 0, 0.35)), s2 = still ? 1 : ease(seg(k, 0.25, 0.6));
      path(c, (q) => ({ x: o.x - r + 2 * r * q, y: y - r + 2 * r * q }), 2 * r, 0, s1, u, P.ink, fade, 1, 2 * u);
      path(c, (q) => ({ x: o.x + r - 2 * r * q, y: y - r + 2 * r * q }), 2 * r, 0, s2, u, P.ink, fade, 1, 2 * u);
    },
    // Take half: a cord between the two of you, a seal at its middle — bound for the round
    pShare(c, e, k, A, t, still) {
      const u = A.u, a = A.pt('pc', 'chest'), b = A.pt('comp', 'chest'), fade = 1 - seg(k, 0.8, 1);
      const s = still ? 1 : ease(seg(k, 0, 0.5)), m = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 4 * u };
      path(c, (q) => qpt(b, a, 0.15 * dist(a, b), q), dist(a, b), 0, s, u, P.cord, fade, 1.3, 2 * u);
      if (s >= 1) tag(c, m.x, m.y, u, fade, true);
    },
    // Mio: drops poured from the vial's lip to each one it actually restores (none: they fall short)
    pPour(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release');
      const who = e.p.who || [];
      if (still) { for (const w of who) { const b = A.pt(w, 'chest'); sparkle(c, b.x, b.y - 6 * u, 3 * u, u, '#9ad0c0', 0.85 * (1 - seg(k, 0.6, 1))); } return; }
      for (const w of who) {
        const b = A.pt(w, 'chest'), L = dist(a, b);
        for (let i = 0; i < 6; i++) { const s = seg(k, i * 0.07, 0.55 + i * 0.07); if (s <= 0 || s >= 1) continue; const q = qpt(a, b, -0.3 * L, ease(s)); R(c, q.x, q.y, 2 * u, 2 * u, i % 2 ? '#9ad0c0' : '#d8f4ec', 1); }
        const ar = seg(k, 0.6, 1);
        if (ar > 0) ell(c, b.x, b.y, (4 + 8 * ease(ar)) * u, (3 + 6 * ease(ar)) * u, u, '#d8f4ec', 0.8 * (1 - ar));
      }
      if (!who.length) for (let i = 0; i < 4; i++) { const s = seg(k, i * 0.08, 0.6 + i * 0.08); R(c, a.x + 2 * u + i * u, a.y + easeIn(s) * 24 * u, u, 2 * u, '#9ad0c0', 1 - s); }
    },
    // Mio's vapour: a soft cloud from the open vial to the creature; it brightens where it washes
    // something off, and simply thins where there was nothing
    pVapour(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release'), b = A.pt('foe', 'core');
      const s = still ? 1 : ease(seg(k, 0, 0.5)), al = 1 - seg(k, 0.7, 1);
      for (let i = 0; i < 6; i++) {
        const ss = Math.max(0, s - i * 0.06), q = qpt(a, b, -0.2 * dist(a, b), ss);
        puff(c, q.x + Math.sin(t / 180 + i) * 2 * u, q.y + (i % 2 ? 2 : -2) * u, (3 + 3 * ss + (s >= 1 ? 3 * seg(k, 0.5, 0.8) : 0)) * u, u, e.p.clears ? '#e8f6ff' : '#dfeae6', 0.45 * al);
      }
    },
    // smelling salts: a sharp sparkle at the vial and crisp flecks at each of you (no recovery number)
    pSalts(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'release');
      if (!still) sparkle(c, a.x, a.y, Math.round((2 + 4 * bell(seg(k, 0, 0.4))) * u), u, '#ffffff', bell(seg(k, 0, 0.4)));
      for (const w of e.p.who || []) {
        const o = A.pt(w, 'head');
        for (let i = 0; i < 3; i++) { const s = still ? 0.5 : seg(k, 0.25 + i * 0.08, 0.8); R(c, o.x + (i - 1) * 5 * u, o.y + 4 * u - ease(s) * 8 * u, u, 2 * u, '#c8f0e0', 1 - s); }
      }
    },
    // Ren's lamp: a cone of lamplight from the glass to each one it wards or each creature it reveals
    pLamp(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from || 'comp', 'release');
      const fade = 1 - seg(k, 0.8, 1), g = still ? 1 : ease(seg(k, 0, 0.4));
      if (!still && e.p.flare) halo(c, a.x, a.y, (6 + 10 * bell(seg(k, 0, 0.5))) * u, '255,226,150', 0.55 * bell(seg(k, 0, 0.6)));
      else halo(c, a.x, a.y, 8 * u, '255,226,150', 0.35 * fade);
      const tg = (e.p.who || []).map((w) => A.pt(w, 'chest')).concat((e.p.foes || []).map((i) => A.pt('foe:' + i, 'core')));
      for (const b of tg) {
        const L = dist(a, b), nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
        for (let j = -2; j <= 2; j++) path(c, (s) => ({ x: a.x + (b.x - a.x) * s + nx * j * (1 + 4 * s) * u, y: a.y + (b.y - a.y) * s + ny * j * (1 + 4 * s) * u }), L, 0, g, u, j ? '#ffe8b0' : '#fff6d8', (j ? 0.25 : 0.55) * fade, 2.5);
      }
    },
    // Suzu draws its eye: a vermilion line from each creature's head to hers, a small pennant
    pAttention(c, e, k, A, t, still) {
      const u = A.u, b = A.pt(e.p.to || 'comp', 'head');
      const fade = 1 - seg(k, 0.85, 1), s = still ? 1 : ease(seg(k, 0, 0.45));
      for (const i of e.p.foes || [0]) {
        const a = A.pt('foe:' + i, 'top'), L = dist(a, b);
        path(c, (q) => qpt(a, b, 0.08 * L, q), L, 0, s, u, P.verm, 0.85 * fade, 3, u);
        if (s >= 1) { R(c, b.x - 3 * u, b.y - 16 * u, 5 * u, 3 * u, P.verm, fade); R(c, b.x - 3 * u, b.y - 16 * u, u, 8 * u, P.ink2, fade); }
      }
    },
    // Encore: two little paper bursts at her hands as they clap
    pClap(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u;
      for (const part of ['handR', 'handL']) {
        const o = A.pt(e.p.from || 'comp', part);
        for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.5, r = ease(k) * (6 + hs(i, 1) * 6) * u; R(c, o.x + Math.cos(an) * r, o.y + Math.sin(an) * r, u, u, i % 2 ? P.paper : P.verm, 1 - k); }
      }
    },
    // ---- the Harmony techniques (Harmony addendum §9) --------------------------------------------------
    // Read the Opening: Nao's pencil sketches a courier's route in the air — dashed gold, out from where the
    // pencil started, over the party and down to the knots that really come loose (a waypoint tick landing on
    // each: two, or the one left), then up to the creature, where a ring closes round the opening. It is drawn
    // at the pencil's pace (p.draw: the share of k the sketch takes; the legs take equal time, as the pencil's
    // ticks do) and stays, lit, until the knots have gone (p.out). Only on that creature.
    pCourier(c, e, k, A, t, still) {
      const u = A.u, R0 = courierStart(e, A), pts = [R0].concat((e.p.way || []).map((id) => A.pt(id, 'core')), [A.pt('foe', 'core')]);
      const n = pts.length - 1, draw = e.p.draw || 0.5, fade = 1 - seg(k, e.p.out || 0.8, 1);
      const s = still ? 1 : cl(k / draw) * n; // legs done (fractional)
      for (let i = 0; i < n; i++) {
        const fn = courierLeg(pts, i, A), L = dist(pts[i], pts[i + 1]), to = cl(s - i);
        if (to <= 0) break;
        courierDash(c, fn, L, to, u, fade);
      }
      // the waypoint ticks: a pin drops onto each knot as the route reaches it, a ring round it
      for (let i = 1; i < n; i++) {
        const w = pts[i], land = still ? 1 : cl((s - i) * 2.5);
        if (s < i) continue;
        const y = w.y - 14 * u - (1 - ease(land)) * 10 * u;
        ell(c, w.x, w.y + u, 9 * u, 4 * u, 2 * u, '#3e2810', 0.7 * fade * land);
        ell(c, w.x, w.y, 9 * u, 4 * u, u, '#ffd860', fade * (0.4 + 0.6 * land));
        R(c, w.x - u, y, 2 * u, 9 * u, '#3e2810', fade);
        R(c, w.x - 2 * u, y - 2 * u, 4 * u, 4 * u, '#3e2810', fade);
        R(c, w.x - u, y - u, 2 * u, 2 * u, '#ffd860', fade);
        if (!still && land < 1) sparkle(c, w.x, y, Math.round((2 + 2 * bell(land)) * u), u, '#fff0c0', bell(land) * fade);
      }
      // the route's end: a dashed ring closes round the opening
      if (s >= n || still) {
        const o = pts[n], r = Math.max(8 * u, A.foeR * 0.32), cl2 = still ? 1 : ease(seg(k, draw, draw + 0.12));
        ell(c, o.x, o.y + u, r, r * 0.75, 2 * u, '#3e2810', 0.8 * fade, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cl2);
        ell(c, o.x, o.y, r, r * 0.75, u, '#ffd860', fade, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cl2);
      }
      // the head: the pencil's point running ahead of the dashes
      if (!still && s < n) {
        const i = Math.floor(s), q = courierLeg(pts, i, A)(s - i);
        R(c, q.x - u, q.y - u, 2 * u, 2 * u, '#fff6d8', 1);
        sparkle(c, q.x, q.y, 2 * u, u, '#ffffff', 0.8);
      }
    },
    // …your thread follows the route: out from your strip to the first knot it marked, along the route's own
    // hops to the next (reached at p.arrive, the share of k just before the knots go), then drawn taut
    pThreadRoute(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from || 'pc', 'release'), ws = (e.p.way || []).map((id) => A.pt(id, 'core'));
      if (!ws.length) return;
      const fade = 1 - seg(k, 0.82, 1), pts = [a].concat(ws);
      const L0 = dist(a, ws[0]), legs = pts.length - 1;
      const ar = e.p.arrive || 0.5, head = still ? legs : ease(seg(k, 0, ar)) * legs, pull = still ? 1 : ease(seg(k, ar - 0.04, ar + 0.22));
      for (let i = 0; i < legs; i++) {
        const to = cl(head - i);
        if (to <= 0) break;
        const L = i ? dist(pts[i], pts[i + 1]) : L0;
        const base = i ? courierLeg(pts, i, A, true) : (q) => qpt(a, ws[0], (-0.22 + 0.14 * pull) * L0, q);
        const wob = (1 - pull) * 1.6 * u;
        const fn = (q) => { const p = base(q); return { x: p.x, y: p.y + Math.sin(q * Math.PI * 3 + t / 110) * wob * Math.sin(Math.PI * q) }; };
        path(c, fn, L, 0, to, u, P.ink2, fade * 0.9, 1.2, 2 * u);
        path(c, (q) => { const p = fn(q); return { x: p.x, y: p.y - u }; }, L, 0, to, u, P.cord, fade, 1.2);
      }
      if (!still && pull > 0) for (const w of ws) sparkle(c, w.x, w.y, Math.round((2 + 2 * bell(pull)) * u), u, '#ffffff', fade * bell(pull));
    },
    // Read the Opening: the two knots come loose together — one shared burst: a ring round both, the hop
    // between them flaring, rays from between them, flecks off both at once (only when two really do)
    pKnotPair(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.a, 'core'), b = A.pt(e.p.b, 'core'), L = dist(a, b), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const fade = 1 - seg(k, 0.55, 1);
      if (still) { ell(c, m.x, m.y, L / 2 + 8 * u, 7 * u, u, '#ffd860', 0.85 * (1 - seg(k, 0.6, 1))); return; }
      const s = ease(seg(k, 0, 0.55));
      halo(c, m.x, m.y, L * 0.5 + (8 + 10 * s) * u, '255,230,150', 0.55 * bell(seg(k, 0, 0.6)));
      ell(c, m.x, m.y + u, L / 2 + (6 + 18 * s) * u, (5 + 9 * s) * u, 2 * u, '#c8962e', 0.9 * fade);
      ell(c, m.x, m.y, L / 2 + (6 + 18 * s) * u, (5 + 9 * s) * u, u, '#fff6d8', fade);
      const hop = (q) => qpt(a, b, -0.5 * L, q), fl = bell(seg(k, 0, 0.45));
      path(c, hop, L, 0, 1, u, '#ffffff', fl, 1, 2 * u);
      for (let i = 0; i < 10; i++) {
        const an = -Math.PI / 2 + (i - 4.5) * 0.33, r0 = 4 * u + s * (12 + hs(i, 6) * 10) * u;
        R(c, m.x + Math.cos(an) * (L / 2 + r0), m.y + Math.sin(an) * r0 - u, 2 * u, u, i % 2 ? '#ffd860' : '#fff0c0', fade);
      }
      for (const p of [a, b]) {
        sparkle(c, p.x, p.y - 2 * u, Math.round((3 + 3 * bell(seg(k, 0, 0.5))) * u), u, '#ffffff', bell(seg(k, 0, 0.5)));
        for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.6, r = s * (10 + hs(i, p === a ? 2 : 3) * 8) * u; R(c, p.x + Math.cos(an) * r, p.y + Math.sin(an) * r + easeIn(k) * 8 * u, 2 * u, 2 * u, i % 2 ? P.paper : '#ffd860', fade); }
      }
    },
    // Read the Opening, its move answered (the technique's result on the creature): the route's ring pulled
    // tight round the opening, four pins closing in on it, a short gold flash
    pRead(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core'), r0 = Math.max(8 * u, A.foeR * 0.32);
      const fade = 1 - seg(k, 0.6, 1), s = still ? 0.6 : ease(seg(k, 0, 0.45)), r = r0 * (1 - 0.35 * s);
      if (!still) halo(c, o.x, o.y, r0 * 1.4, '255,226,150', 0.45 * bell(seg(k, 0, 0.5)));
      ell(c, o.x, o.y, r, r * 0.75, 2 * u, '#ffd860', fade);
      for (let i = 0; i < 4; i++) {
        const an = Math.PI / 4 + (i * Math.PI) / 2, ro = r + (10 - 6 * s) * u;
        path(c, (q) => ({ x: o.x + Math.cos(an) * (ro - q * 6 * u), y: o.y + Math.sin(an) * (ro - q * 6 * u) * 0.75 }), 6 * u, 0, 1, u, '#3e2810', fade, 1, 2 * u);
      }
    },
    // Clearwater Draught: the pour, to you both — a clear stream from the vial's lip arcs up over the party and
    // breaks into a shimmering fall of drops over each of you, with small ripples at your feet (the pour is the
    // act; the restoring is shown at the result, and only on one of you who was below full)
    pCascade(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from || 'comp', 'release'), who = e.p.who && e.p.who.length ? e.p.who : ['pc'];
      const hd = who.map((w) => A.pt(w, 'head')), ft = who.map((w) => A.pt(w, 'feet'));
      const x0 = Math.min(...hd.map((h) => h.x)) - 14 * u, x1 = Math.max(...hd.map((h) => h.x)) + 14 * u, top = Math.min(...hd.map((h) => h.y)) - 10 * u;
      const floor = Math.max(...ft.map((f) => f.y)), fade = 1 - seg(k, 0.84, 1);
      // a fountain's arc: from the lip high over the middle of the party, down to where it breaks over the far one
      const B = { x: x1 - 2 * u, y: top }, C = { x: (a.x + B.x) / 2, y: Math.min(a.y, B.y) - 60 * u };
      const arc = (q) => ({ x: (1 - q) * (1 - q) * a.x + 2 * q * (1 - q) * C.x + q * q * B.x, y: (1 - q) * (1 - q) * a.y + 2 * q * (1 - q) * C.y + q * q * B.y });
      const L = dist(a, C) + dist(C, B);
      const dropX = (i, n) => x0 + ((i + 0.5) / n) * (x1 - x0);
      if (still) {
        path(c, arc, L, 0, 1, u, '#4a98b8', 0.75 * fade, 1.6, 2 * u);
        path(c, (q) => { const p = arc(q); return { x: p.x, y: p.y - u }; }, L, 0, 1, u, '#d8f4fc', 0.85 * fade, 1.6, u);
        for (let i = 0; i < 10; i++) R(c, dropX(i, 10), top + (6 + (i % 3) * 12) * u, u, 2 * u, i % 2 ? '#ffffff' : '#9ad0c0', 0.85 * fade);
        for (const f of ft) { ell(c, f.x, f.y, 14 * u, 4 * u, u, '#d8f4fc', 0.75 * fade); ell(c, f.x, f.y, 8 * u, 2 * u, u, '#9ad0c0', 0.6 * fade); }
        return;
      }
      // the stream: its head runs out over the party, its tail leaves the lip as the pour ends — a clear ribbon
      // with a dark edge under it and a bright line along its top
      const hS = ease(seg(k, 0, 0.24)), tS = easeIn(seg(k, 0.34, 0.58));
      if (hS > tS) {
        path(c, (q) => { const p = arc(q); return { x: p.x, y: p.y + u }; }, L, tS, hS, u, '#3e88a8', 0.85, 0.8, 3 * u);
        path(c, arc, L, tS, hS, u, '#bfe8f4', 1, 0.8, 2 * u);
        path(c, (q) => { const p = arc(q); return { x: p.x, y: p.y - u }; }, L, tS, hS, u, '#ffffff', 0.95, 2.2, u);
        const hp = arc(hS);
        if (hS < 1) sparkle(c, hp.x, hp.y, 2 * u, u, '#ffffff', 0.9);
      }
      // where it breaks over you: a bright burst, then a shimmer hanging over the party while it falls
      const br = seg(k, 0.2, 0.42);
      if (br > 0 && br < 1) { halo(c, B.x, B.y, (8 + 10 * br) * u, '220,246,255', 0.55 * bell(br)); sparkle(c, B.x, B.y, Math.round((3 + 3 * bell(br)) * u), u, '#ffffff', bell(br)); }
      const veil = bell(seg(k, 0.22, 0.8));
      if (veil > 0.02) for (let i = 0; i < 11; i++) { const x = dropX(i, 11), ln = (floor - top) * (0.6 + 0.3 * hs(i, 5)); path(c, (q) => ({ x: x + Math.sin(q * 6 + i) * u, y: top + q * ln }), ln, 0, 1, u, '#d8f4fc', 0.3 * veil, 2.5); }
      // the fall: streaks and drops over the whole width of the party, shimmering as they fall to the floor
      for (let i = 0; i < 34; i++) {
        const ph = hs(i, 11), st = 0.2 + ph * 0.42, s2 = seg(k, st, st + 0.18);
        if (s2 <= 0 || s2 >= 1) continue;
        const x = dropX(i, 34) + Math.sin(i * 2.3) * 2 * u, y = top + (hs(i, 3) - 0.5) * 8 * u + easeIn(s2) * (floor - top);
        const tw = (Math.floor(t / 60) + i) % 3;
        if (i % 2) { R(c, x, y - 7 * u, u, 5 * u, '#bfe8f4', 0.8 * (1 - s2 * 0.4)); R(c, x, y - 2 * u, u, 2 * u, '#ffffff', 1 - s2 * 0.3); }
        else R(c, x, y, 2 * u, 2 * u + (i % 4 ? 0 : u), tw === 0 ? '#ffffff' : tw === 1 ? '#bfe8f4' : '#7cc8dc', 1 - s2 * 0.35);
        if (tw === 0 && i % 3 === 0) sparkle(c, x, y, 2 * u, u, '#ffffff', 0.9);
      }
      // ripples at each of your feet as the drops land, a few splashes thrown up
      ft.forEach((f, j) => {
        for (let r = 0; r < 3; r++) {
          const s3 = seg(k, 0.34 + j * 0.05 + r * 0.1, 0.78 + j * 0.05 + r * 0.1);
          if (s3 <= 0 || s3 >= 1) continue;
          ell(c, f.x, f.y, (4 + 18 * ease(s3)) * u, (1.5 + 5 * ease(s3)) * u, u, r === 1 ? '#bfe8f4' : '#ffffff', (1 - s3) * fade);
          if (r === 0) for (let q = 0; q < 4; q++) { const an = -Math.PI / 2 + (q - 1.5) * 0.7; R(c, f.x + Math.cos(an) * ease(s3) * 10 * u, f.y - bell(s3) * (5 + q) * u, u, u, '#ffffff', 1 - s3); }
        }
      });
    },
    // …and your ink carries one drop of it to the knot: a clear drop riding a short ink trail, landing in a
    // small splash on the knot (it lands at p.land)
    pDrop(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from || 'pc', 'release'), b = A.pt(e.p.to, 'core'), L = dist(a, b), land = e.p.land || 0.5;
      const fade = 1 - seg(k, 0.85, 1);
      if (still) { disc(c, b.x, b.y - 4 * u, 2 * u, 2 * u, '#bfe8f4', 0.85 * fade); ell(c, b.x, b.y, 7 * u, 2.5 * u, u, '#bfe8f4', 0.7 * fade); return; }
      const s = ease(seg(k, 0, land)), fn = (q) => qpt(a, b, -0.28 * L, q);
      if (s < 1) {
        path(c, fn, L, Math.max(0, s - 0.35), s, u, P.ink2, 0.85, 1.6, u);
        const q = fn(s);
        disc(c, q.x, q.y, 2 * u, 2 * u, '#6ab8d0', 1);
        disc(c, q.x, q.y - u, Math.max(u, 1.4 * u), Math.max(u, 1.4 * u), '#d8f4fc', 1);
        R(c, q.x - u, q.y - 2 * u, u, u, '#ffffff', 1);
      }
      const h = seg(k, land, 1);
      if (h > 0) {
        ell(c, b.x, b.y, (3 + 10 * ease(h)) * u, (1.5 + 3 * ease(h)) * u, u, '#d8f4fc', (1 - h) * fade);
        for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.5, r = ease(h) * (6 + hs(i, 9) * 6) * u; R(c, b.x + Math.cos(an) * r, b.y + Math.sin(an) * r + easeIn(h) * 8 * u, u, 2 * u, i % 2 ? '#ffffff' : '#9ad0c0', 1 - h); }
      }
    },
    // the restoring of Clearwater Draught on one of you who was below full: clear water rising round you from
    // the feet, a ring of it at the chest (with the motes; never on one already full)
    pRefill(c, e, k, A, t, still) {
      const u = A.u;
      for (const w of e.p.who || []) {
        const f = A.pt(w, 'feet'), o = A.pt(w, 'chest'), H = f.y - o.y;
        if (still) { ell(c, o.x, o.y, 10 * u, 6 * u, u, '#bfe8f4', 0.8 * (1 - seg(k, 0.6, 1))); continue; }
        const s = ease(seg(k, 0, 0.6)), fade = 1 - seg(k, 0.7, 1);
        for (let j = 0; j < 4; j++) {
          const y = f.y - s * H * (1 - j * 0.18);
          if (y > f.y) continue;
          path(c, (q) => ({ x: o.x - 9 * u + q * 18 * u, y: y + Math.sin(q * Math.PI * 2 + t / 120 + j) * u }), 18 * u, 0, 1, u, j ? '#9ad0c0' : '#ffffff', (j ? 0.45 : 0.8) * fade, 2);
        }
        const rg = seg(k, 0.5, 1);
        if (rg > 0) ell(c, o.x, o.y, (6 + 8 * ease(rg)) * u, (4 + 5 * ease(rg)) * u, u, '#d8f4fc', 0.8 * (1 - rg));
      }
    },
    // the washing of Clearwater Draught on a creature that really had Heat, mist or Gathering: clear water
    // rinses down over it, its front shimmering, and what it carries off shows how each leaves — embers
    // quenched (Heat), the gathered motes carried down (Gathering), the mist pressed down and out (mist)
    pWash(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core'), top = A.pt('foe', 'top'), b = A.pt('foe', 'base'), w = Math.max(A.foeR, 16 * u);
      const y0 = Math.min(top.y, o.y - A.foeR) - 6 * u, y1 = Math.max(b.y, o.y + A.foeR * 0.6), fade = 1 - seg(k, 0.75, 1);
      if (still) { for (let i = 0; i < 7; i++) R(c, o.x - w + ((i + 0.5) / 7) * 2 * w, o.y - A.foeR * 0.2 + (i % 2) * 8 * u, u, 3 * u, '#bfe8f4', 0.75 * fade); return; }
      const s = ease(seg(k, 0, 0.55)), fy = y0 + s * (y1 - y0), front = fade * (1 - seg(k, 0.5, 0.65));
      // the falling front — a clear sheet with a bright edge — and the rain behind it
      if (front > 0.02) {
        for (let r = 1; r <= 4; r++) path(c, (q) => ({ x: o.x - w + q * 2 * w, y: fy - r * 3 * u + Math.sin(q * Math.PI * 4 + t / 90 + r) * 2 * u }), 2 * w, 0, 1, u, '#bfe8f4', 0.32 * front * (1 - r * 0.18), 1.5, 2 * u);
        path(c, (q) => ({ x: o.x - w + q * 2 * w, y: fy + Math.sin(q * Math.PI * 4 + t / 90) * 2 * u }), 2 * w, 0, 1, u, '#ffffff', 0.95 * front, 1.2, 2 * u);
      }
      for (let i = 0; i < 18; i++) {
        const x = o.x - w + ((i + 0.5) / 18) * 2 * w, ph = hs(i, 13), yy = y0 + ((ph + t / 420) % 1) * (fy - y0);
        if (fy - y0 < 4 * u) break;
        R(c, x, yy, u, 5 * u, i % 3 ? '#bfe8f4' : '#ffffff', 0.85 * fade);
      }
      const d = seg(k, 0.3, 1);
      if (d > 0) {
        if (e.p.heat) for (let i = 0; i < 6; i++) { const x = o.x + (hs(i, 4) - 0.5) * w * 1.4, y = o.y - A.foeR * 0.3 + easeIn(d) * 26 * u + i * 2 * u; R(c, x, y, 2 * u, 2 * u, d < 0.4 ? (i % 2 ? P.ember : P.ember2) : '#8a8490', 1 - d); }
        if (e.p.gather) for (let i = 0; i < 6; i++) { const x = o.x + (hs(i, 7) - 0.5) * w * 1.6, y = o.y + easeIn(d) * 34 * u - (i % 3) * 3 * u; R(c, x, y, 2 * u, 2 * u, P.amber, 1 - d); }
        if (e.p.mist) for (let i = 0; i < 3; i++) puff(c, o.x + (i - 1) * w * 0.7 + (i - 1) * ease(d) * 16 * u, b.y + 2 * u + ease(d) * 6 * u, (8 + 6 * d) * u, u, P.mist, 0.4 * (1 - d));
        ell(c, b.x, b.y + 2 * u, (6 + 22 * ease(d)) * u, (2 + 5 * ease(d)) * u, u, '#d8f4fc', 0.7 * (1 - d));
      }
    },
    // Curtain Call: the thread swung round the opening like a stage curtain — a band of cloth (vermilion,
    // its folds in stripes, a gold hem) leaving your hand, sweeping over and past the creature, then hooking
    // back down onto it: its own move turned round. Lead: the target (the others in a group a step behind).
    pCurtain(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from || 'pc', 'release'), o = A.pt('foe', 'core'), top = A.pt('foe', 'top');
      const over = { x: o.x + A.foeR * 0.9, y: Math.min(top.y, o.y - A.foeR) - 6 * u };
      const L1 = dist(a, over), L2 = dist(over, o);
      const fade = 1 - seg(k, 0.78, 1);
      const out = still ? 1 : ease(seg(k, 0, 0.5)), back = still ? 1 : ease(seg(k, 0.45, 0.78));
      // the band: the way out (a high arc) and the hook back onto it
      const p1 = (q) => qpt(a, over, -0.32 * L1, q), p2 = (q) => qpt(over, o, 0.45 * L2, q);
      const band = (fn, L, s0, s1) => {
        if (s1 <= s0) return;
        const n = Math.max(4, Math.round((L * (s1 - s0)) / (1.5 * u)));
        for (let i = 0; i <= n; i++) {
          const q = s0 + ((s1 - s0) * i) / n, p = fn(q), fold = Math.floor((q * L) / (4 * u)) % 2;
          R(c, p.x - u, p.y - 2 * u, 3 * u, 3 * u, fold ? '#a8322a' : '#d0503c', fade * (e.p.lead === false ? 0.75 : 1));
          R(c, p.x - u, p.y + u, 3 * u, u, '#e8c060', fade * 0.9);
        }
      };
      band(p1, L1, 0, out);
      if (out >= 1) band(p2, L2, 0, back);
      if (!still && back > 0.85) { const h = seg(k, 0.7, 0.9); sparkle(c, o.x, o.y, Math.round((2 + 3 * bell(h)) * u), u, '#fff0e0', bell(h) * fade); }
    },
    // Lantern Ward: the level plane Ren's hand draws, set before each of you at the chest — a few thin lines
    // of lamplight laid flat in perspective, growing from his side; restrained, it holds and is gone (the
    // ward itself is the seal tag at the result, its real amount, used up by blows like any ward)
    pPlane(c, e, k, A, t, still) {
      const u = A.u, fade = 1 - seg(k, 0.8, 1), s = still ? 1 : ease(seg(k, 0, 0.45));
      for (const w of e.p.who || []) {
        const o = A.pt(w, 'chest'), x0 = o.x - 9 * u, y0 = o.y + 3 * u;
        for (let r = 0; r < 3; r++) {
          const len = 24 * u * s, dx = r * 3 * u, dy = -r * 2 * u;
          path(c, (q) => ({ x: x0 + dx + q * len, y: y0 + dy - q * len * 0.32 }), len, 0, 1, u, r === 1 ? '#fff6d8' : '#ffe8b0', (r === 1 ? 0.75 : 0.4) * fade, 1, u);
        }
        if (s >= 1 && !still) R(c, x0 + 24 * u + 3 * u, y0 - 24 * u * 0.32 - 2 * u, u, u, '#ffffff', fade);
      }
    },
    // a support that found nothing to do (no opening; the knot held; not in step): a small grey puff
    pNone(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.from || 'comp', 'release');
      puff(c, o.x, o.y - (still ? 0 : ease(k) * 6 * u), (2 + 2 * k) * u, u, '#8a8490', 0.5 * (1 - k));
    },
  };
  Object.assign(F.fx, fx);
  RB.partyFx = { NAMES: Object.keys(fx) };
})();
