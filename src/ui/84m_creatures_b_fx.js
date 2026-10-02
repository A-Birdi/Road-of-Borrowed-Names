/* Creatures B — effects for the Chapter 4–6 and Atlas families (battle addendum §9.3, §10).
 * Drawn like src/ui/84_battle_fx.js: pixel shapes at art resolution, positions resolved from
 * the stage's live anchors every frame (so a resize or a travelling creature keeps them
 * attached), deterministic (index hashes, never Math.random), and a still form for reduced
 * motion that keeps the meaning (where it came from and whom it reached) without movement.
 *
 * Every effect takes p.foe (the acting creature) and, where it starts on the creature, p.dx /
 * p.dy: the point in the creature's own art px (relative to its origin, at the pose that
 * produces it). Targets are anchor ids ('pc', 'comp', 'party') — always the actual recipients
 * the delivery was given; an effect never adds one.
 *
 * This file also registers the families' deliveries with the sequencer (RB.creaturesB.flush):
 * 82_battle_seq.js loads after the 78m–78t family files. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const FX = RB.battleFx;
  if (!FX) return;
  const K = () => RB.pxkit;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (k) => 1 - Math.pow(1 - cl(k), 3);
  const easeIn = (k) => Math.pow(cl(k), 2);
  const bell = (k) => Math.sin(Math.PI * cl(k));
  const seg = (k, a, b) => cl((k - a) / (b - a));
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  function R(c, x, y, w, h, col, a) {
    if (a != null) { if (a <= 0.01) return; c.globalAlpha = Math.min(1, a); }
    if (col) c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    if (a != null) c.globalAlpha = 1;
  }
  // a block with a dark one-pixel edge (reads on light and dark backdrops)
  function blk(c, x, y, w, h, col, a, edge) { R(c, x - 1, y - 1, w + 2, h + 2, edge || '#2a2024', a * 0.85); R(c, x, y, w, h, col, a); }
  // a point on the acting creature (its art px) → canvas
  function on(A, p) { const o = A.pt('foe', 'core'); return { x: o.x + (p.dx || 0) * A.u, y: o.y + (p.dy || 0) * A.u }; }
  const lerpP = (a, b, s) => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });
  function qpt(a, b, bend, s) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    return { x: (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * cx + s * s * b.x, y: (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * cy + s * s * b.y };
  }
  // an arc of an ellipse (dotted in whole pixels), angles a0..a1
  function arc(c, x, y, rx, ry, a0, a1, u, col, alpha, th) {
    if (alpha <= 0.01 || rx < 1) return;
    c.globalAlpha = cl(alpha);
    c.fillStyle = col;
    const n = Math.max(8, Math.round(((rx + ry) * Math.abs(a1 - a0)) / (1.6 * u)));
    const w = th || u;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      c.fillRect(Math.round(x + Math.cos(a) * rx - w / 2), Math.round(y + Math.sin(a) * ry - w / 2), w, w);
    }
    c.globalAlpha = 1;
  }
  function ring(c, x, y, r, u, col, alpha) {
    if (alpha <= 0.01) return;
    c.globalAlpha = cl(alpha); c.fillStyle = col; K().ring(c, x, y, Math.max(1, Math.round(r)), u); c.globalAlpha = 1;
  }
  function spark(c, x, y, r, u, col, alpha) { R(c, x - u / 2, y - r, u, r * 2, col, alpha); R(c, x - r, y - u / 2, r * 2, u, col, alpha); }
  const tint = (hex, k) => { const a = K().parse(hex); return K().hex(K().mix(a, [255, 250, 236, 255], k)); };

  const fx = {
    // ---- a bell's voice -------------------------------------------------------------------------
    // p.mode: 'strike' (the rim meets its one target: rings burst round it), 'dull' (the blow
    // meets a seal: one choked ring in front of it), 'sweep' (one broad toll front rolls from the
    // mouth across every recipient in turn), 'mute' (a grey, ringless wave that settles over the
    // party as the Hush), 'lie' (a thin bright ring carrying the false name)
    cbToll(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), col = tint(p.col || '#8a7a4a', 0.75);
      if (p.mode === 'strike' || p.mode === 'dull') {
        const T = A.pt(p.to, 'chest');
        const at = p.mode === 'dull' ? lerpP(T, M, 0.32) : T;
        if (still) { ring(c, at.x, at.y, 12 * u, u, p.mode === 'dull' ? '#b8b4c0' : col, 0.8 * (1 - seg(k, 0.6, 1))); return; }
        const n = p.mode === 'dull' ? 1 : 3;
        for (let i = 0; i < n; i++) {
          const s = seg(k, i * 0.12, 0.55 + i * 0.12);
          if (s <= 0 || s >= 1) continue;
          ring(c, at.x, at.y, (5 + ease(s) * (p.mode === 'dull' ? 10 : 22)) * u, i ? u : 2 * u, i ? col : '#fffaf0', (1 - s) * (p.mode === 'dull' ? 0.6 : 0.95));
        }
        if (p.mode === 'strike') for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.4, r = (8 + ease(seg(k, 0, 0.5)) * 18) * u;
          R(c, at.x + Math.cos(a) * r, at.y + Math.sin(a) * r * 0.8, 2 * u, u, col, 1 - seg(k, 0.2, 0.7));
        }
        // the lip rings too
        ring(c, M.x, M.y, (6 + ease(k) * 14) * u, u, col, 0.6 * (1 - seg(k, 0.1, 0.6)));
        return;
      }
      if (p.mode === 'sweep') {
        const who = (p.who || ['pc']).map((w) => A.pt(w, 'chest'));
        const mid = { x: who.reduce((m, q) => m + q.x, 0) / who.length, y: who.reduce((m, q) => m + q.y, 0) / who.length };
        const dir = Math.atan2(mid.y - M.y, mid.x - M.x);
        const d = who.map((q) => Math.hypot(q.x - M.x, q.y - M.y));
        // the front reaches the first at ~0.22, the next ~0.13 later (the sequencer's second target)
        const ks = [0.22, 0.355];
        const rAt = (kk) => {
          if (kk <= ks[0]) return d[0] * (kk / ks[0]);
          if (who.length > 1 && kk <= ks[1]) return d[0] + (Math.max(d[1], d[0] + 10 * u) - d[0]) * ((kk - ks[0]) / (ks[1] - ks[0]));
          const last = who.length > 1 ? Math.max(d[1], d[0] + 10 * u) : d[0], k0 = who.length > 1 ? ks[1] : ks[0];
          return last + (kk - k0) * 260 * u;
        };
        if (still) {
          arc(c, M.x, M.y, d[d.length - 1], d[d.length - 1] * 0.55, dir - 0.5, dir + 0.5, u, col, 0.7 * (1 - seg(k, 0.7, 1)), 2 * u);
          for (const q of who) ring(c, q.x, q.y, 10 * u, u, col, 0.8 * (1 - seg(k, 0.7, 1)));
          return;
        }
        // rings swelling at the mouth while it tolls
        for (let i = 0; i < 2; i++) { const s = seg(k, i * 0.08, 0.3 + i * 0.08); if (s > 0 && s < 1) ring(c, M.x, M.y, (8 + ease(s) * 20) * u, u, col, 0.7 * (1 - s)); }
        // the broad front: an arc facing the party, a bright leading edge and a softer trail
        for (let j = 0; j < 3; j++) {
          const kk = k - j * 0.035;
          if (kk <= 0) continue;
          const r = rAt(kk), al = (1 - seg(k, 0.45, 0.75)) * (j === 0 ? 0.95 : 0.45 - j * 0.12);
          arc(c, M.x, M.y, r, r * 0.62, dir - 0.62, dir + 0.62, u, j === 0 ? '#fffaf0' : col, al, j === 0 ? 2 * u : u);
        }
        // each recipient rings as the front passes it
        who.forEach((q, i) => {
          const s = seg(k, ks[i] - 0.01, ks[i] + 0.3);
          if (s > 0 && s < 1) { ring(c, q.x, q.y, (6 + ease(s) * 16) * u, 2 * u, col, 1 - s); spark(c, q.x, q.y - 6 * u, (5 - 4 * s) * u, u, '#fffaf0', 1 - s); }
        });
        return;
      }
      if (p.mode === 'mute') {
        const T = A.pt(p.to || 'party', 'head');
        if (still) { arc(c, T.x, T.y + 4 * u, 22 * u, 9 * u, Math.PI * 1.1, Math.PI * 1.9, u, '#a8a4b8', 0.8 * (1 - seg(k, 0.6, 1)), 2 * u); return; }
        const s = ease(seg(k, 0, 0.7));
        const q = lerpP(M, { x: T.x, y: T.y - 4 * u }, s);
        // a choked note: grey, no shine, flattening as it goes; it settles as a lid over them
        for (let i = 0; i < 3; i++) {
          const rx = (10 + i * 6 + s * 10) * u, ry = (8 + i * 4) * u * (1 - 0.55 * s);
          arc(c, q.x, q.y, rx, ry, Math.PI * 0.55, Math.PI * 1.45, u, i ? '#8a8698' : '#b8b4c4', (1 - seg(k, 0.75, 1)) * (0.85 - i * 0.22), i ? u : 2 * u);
        }
        if (k > 0.6) arc(c, T.x, T.y + 4 * u, 24 * u, 8 * u, Math.PI * 1.1, Math.PI * 1.9, u, '#b8b4c4', bell(seg(k, 0.6, 1)) * 0.7, 2 * u);
        return;
      }
      if (p.mode === 'lie') {
        const T = A.pt(p.to, 'chest');
        if (still) { ring(c, M.x, M.y, 12 * u, u, '#fff4d0', 0.7 * (1 - k)); return; }
        for (let i = 0; i < 3; i++) {
          const s = seg(k, i * 0.1, 0.7 + i * 0.1);
          if (s <= 0 || s >= 1) continue;
          const q = lerpP(M, T, ease(s) * 0.5);
          ring(c, q.x, q.y, (6 + s * 12) * u, u, i % 2 ? '#fff4d0' : '#f0d8a0', 0.8 * (1 - s));
        }
      }
    },
    // a borrowed name tag (a paper strip with ink marks and a vermilion seal — marks, not
    // writing) carried from the creature to its target, where it clings and fades
    cbTag(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T = A.pt(p.to, 'chest');
      const s = still ? 1 : ease(seg(k, 0, 0.6)), q = qpt(M, T, -30 * u, s);
      const al = still ? 0.9 * (1 - seg(k, 0.7, 1)) : 1 - seg(k, 0.75, 1);
      const sway = still ? 0 : Math.round(Math.sin(t / 90) * u);
      const w = 6 * u, h = 14 * u;
      blk(c, q.x - w / 2 + sway, q.y - h / 2, w, h, '#efe4c8', al, '#5a4a3a');
      for (let i = 0; i < 3; i++) R(c, q.x - w / 2 + 2 * u + sway, q.y - h / 2 + (2 + i * 3) * u, 2 * u, u, '#3a2c28', al * 0.8);
      R(c, q.x - u + sway, q.y + h / 2 - 3 * u, 2 * u, 2 * u, '#c8503a', al);
    },
    // force drawn in to one point of the creature (Gathering), in its own colour
    cbGather(c, e, k, A, t, still) {
      const u = A.u, p = e.p, o = on(A, p), col = p.col || '#ffd88a';
      if (still) { ring(c, o.x, o.y, 10 * u, u, col, 0.7 * (1 - seg(k, 0.7, 1))); return; }
      for (let i = 0; i < 10; i++) {
        const s = seg(k, i * 0.035, 0.65 + i * 0.03), ang = (i / 10) * Math.PI * 2 + s * 3.2, r = (1 - ease(s)) * (A.foeR * 0.95);
        blk(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r * 0.75, 2 * u, 2 * u, col, bell(s), '#3a2a18');
      }
      K().halo(c, o.x, o.y, Math.round(A.foeR * 0.32), '255,220,150', 0.45 * bell(seg(k, 0.45, 1)), 3);
    },
    // one of the keeper's tendrils stretched out to its target: an iron pipe with collars that
    // reaches out (contact ≈ 0.41), holds, and draws back. p.short: it stops at a seal.
    cbLash(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest');
      const T = p.short ? lerpP(T0, M, 0.3) : T0;
      const reach = still ? 0.9 : k < 0.41 ? ease(k / 0.41) : k < 0.55 ? 1 : 1 - ease((k - 0.55) / 0.35);
      if (reach <= 0.02) return;
      const tip = qpt(M, T, -18 * u, reach);
      const n = Math.max(6, Math.round((Math.hypot(T.x - M.x, T.y - M.y) * reach) / (3 * u)));
      const al = still ? 0.8 * (1 - seg(k, 0.7, 1)) : 1;
      for (let i = 0; i <= n; i++) {
        const s = (i / n) * reach, q = qpt(M, T, -18 * u, s), w = Math.max(3, Math.round(9 - 4 * (i / n))) * u;
        R(c, q.x - w / 2 - u, q.y - w / 2 - u, w + 2 * u, w + 2 * u, '#141222', al);
        R(c, q.x - w / 2, q.y - w / 2, w, w, '#3a3850', al);
        R(c, q.x - w / 2, q.y - w / 2, w, u, '#6a6888', al);
        if (i % 4 === 2) R(c, q.x - w / 2 - u, q.y - u, w + 2 * u, 2 * u, '#5a5878', al);
      }
      R(c, tip.x - 4 * u, tip.y - 4 * u, 8 * u, 8 * u, '#4a4868', al);
      if (!still && k > 0.38 && k < 0.6) {
        const s = seg(k, 0.38, 0.6);
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.6; R(c, tip.x + Math.cos(a) * s * 14 * u, tip.y + Math.sin(a) * s * 10 * u, 2 * u, 2 * u, '#a0bee6', 1 - s); }
      }
    },
    // the keeper's flood: water bursts from the sluice, falls, and a wave rolls along the floor,
    // cresting over each recipient in turn (0.36, then the next 0.12 later), then draws back
    // leaving a wet sheen. p.who: the recipients; p.col/p.col2: the water (ink for the Hush).
    cbFlood(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), who = (p.who || ['pc']).map((w) => ({ c: A.pt(w, 'chest'), f: A.pt(w, 'feet') }));
      const W = p.col || '#7aa8d8', F = p.col2 || '#eef6ff', D = p.col3 || '#4a78a8';
      const floor = Math.max(...who.map((q) => q.f.y)) - 2 * u;
      const far = Math.min(...who.map((q) => q.f.x)) - 30 * u;
      if (still) {
        for (const q of who) { R(c, q.f.x - 18 * u, q.f.y - 4 * u, 36 * u, 3 * u, W, 0.7 * (1 - seg(k, 0.7, 1))); R(c, q.f.x - 14 * u, q.f.y - 5 * u, 28 * u, u, F, 0.7 * (1 - seg(k, 0.7, 1))); }
        return;
      }
      // the burst: a thick fall of water from the sluice to the floor (0 → 0.2)
      const b = seg(k, 0, 0.22), fall = 1 - seg(k, 0.25, 0.5);
      if (b > 0 && fall > 0) {
        const y1 = M.y + (floor - M.y) * ease(b);
        for (let y = M.y; y < y1; y += 2 * u) {
          const w = (16 + (y - M.y) / u * 0.18) * u, x = M.x - w / 2 - (y - M.y) * 0.25;
          R(c, x, y, w, 2 * u, (Math.round(y / u) % 6) < 2 ? F : W, 0.85 * fall);
        }
      }
      // the wave: its front from below the creature to beyond the party (crest reaches recipient i at ks[i])
      const xs = who.map((q) => q.c.x), x0 = M.x - 20 * u;
      const ks = [0.36, 0.48];
      const xAt = (kk) => {
        if (kk <= 0.18) return x0;
        if (kk <= ks[0]) return x0 + (xs[0] - x0) * ((kk - 0.18) / (ks[0] - 0.18));
        if (who.length > 1 && kk <= ks[1]) return xs[0] + (xs[1] - xs[0]) * ((kk - ks[0]) / (ks[1] - ks[0]));
        const last = xs[xs.length - 1], k0 = who.length > 1 ? ks[1] : ks[0];
        return last + (far - last) * Math.min(1, (kk - k0) / 0.2);
      };
      const fx0 = xAt(k), recede = seg(k, 0.62, 1);
      const hgt = (14 + 10 * bell(seg(k, 0.18, 0.62))) * u * (1 - recede);
      if (k > 0.18) {
        // the body of water behind the front, back to the creature
        for (let x = Math.min(fx0, x0); x <= x0; x += 2 * u) {
          const fromF = (x - fx0) / u;                     // px behind the front
          const h = Math.max(2 * u, hgt * Math.min(1, 0.35 + fromF / 60) * (1 - Math.min(0.6, fromF / 300)));
          const ph = Math.sin(x / (6 * u) + t / 120) * u;
          R(c, x, floor - h + ph, 2 * u, h, D, 0.75 * (1 - recede * 0.6));
          R(c, x, floor - h + ph, 2 * u, Math.min(h, 3 * u), W, 0.85 * (1 - recede * 0.6));
          if ((Math.round(x / u) % 9) < 2) R(c, x, floor - h + ph, 2 * u, u, F, 0.9 * (1 - recede));
        }
        // the crest curling over at the front, spray above it
        if (recede < 1) {
          const cx = fx0, cy = floor - hgt;
          R(c, cx - 3 * u, cy - 3 * u, 8 * u, 4 * u, F, 0.95 * (1 - recede));
          for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.35 + 0.5 * hs(i, 2)), r = (6 + hs(i, 4) * 12) * u; R(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r - bell(seg(k, 0.2, 0.7)) * 6 * u, 2 * u, 2 * u, i % 2 ? F : W, 0.9 * (1 - recede)); }
        }
      }
      // each recipient: the crest breaks over them as it arrives
      who.forEach((q, i) => {
        const s = seg(k, ks[i] - 0.02, ks[i] + 0.22);
        if (s <= 0 || s >= 1) return;
        for (let j = 0; j < 8; j++) { const a = -Math.PI / 2 + (j - 3.5) * 0.32, r = ease(s) * (10 + hs(j, i) * 10) * u; R(c, q.c.x + Math.cos(a) * r, q.c.y + Math.sin(a) * r + easeIn(s) * 14 * u, 2 * u, 2 * u, j % 2 ? F : W, 1 - s); }
      });
      // the residue: a wet sheen on the floor that dries
      if (k > 0.55) for (const q of who) { const s = seg(k, 0.55, 1); R(c, q.f.x - 20 * u, q.f.y - 2 * u, 40 * u, u, F, 0.55 * (1 - s)); R(c, q.f.x - 16 * u, q.f.y - u, 30 * u, u, W, 0.5 * (1 - s)); }
    },
    // a false promise: a pale pane glints and slides to its target; p.smile paints a polite curve on it
    cbPane(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T = A.pt(p.to, 'chest');
      const s = still ? 1 : ease(seg(k, 0, 0.85)), q = lerpP(M, T, s);
      const al = still ? 0.8 * (1 - seg(k, 0.7, 1)) : 0.85 * (1 - seg(k, 0.85, 1));
      const w = 12 * u, h = 16 * u;
      R(c, q.x - w / 2 - u, q.y - h / 2 - u, w + 2 * u, h + 2 * u, '#6a6a88', al * 0.7);
      R(c, q.x - w / 2, q.y - h / 2, w, h, '#e8eef8', al * 0.6);
      if (p.smile) { for (let i = -3; i <= 3; i++) R(c, q.x + i * u, q.y + 2 * u + Math.round((i * i) / 4) * u, u, u, '#5a5a78', al); }
      if (!still) { const g = seg(k, 0, 0.6); for (let i = 0; i < 4; i++) R(c, q.x - w / 2 + (g * 1.4 * w) - i * u, q.y - h / 2 + i * 4 * u, u, 4 * u, '#ffffff', al * (1 - g)); }
    },
    // a plea: a folded letter that leaves the creature and drifts to the party (p.drip: wet)
    cbNote(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T = A.pt(p.to || 'party', 'head');
      const s = still ? 0.6 : ease(seg(k, 0, 0.75)), q = qpt(M, { x: T.x, y: T.y - 14 * u }, -36 * u, s);
      const al = still ? 0.9 * (1 - seg(k, 0.75, 1)) : 1 - seg(k, 0.82, 1);
      const sway = still ? 0 : Math.round(Math.sin(t / 140) * 2) * u;
      blk(c, q.x - 5 * u + sway, q.y - 4 * u, 10 * u, 7 * u, '#efe4c8', al, '#5a4a3a');
      R(c, q.x - 5 * u + sway, q.y - 4 * u, 10 * u, u, '#dccb9e', al);
      R(c, q.x - 3 * u + sway, q.y, 6 * u, u, '#4a3a40', al * 0.7);
      if (p.drip && !still) for (let i = 0; i < 3; i++) { const d = ((k * 3 + i / 3) % 1); R(c, q.x - 2 * u + i * 2 * u + sway, q.y + 4 * u + d * 12 * u, u, 2 * u, '#a0bee6', al * (1 - d)); }
    },
  };
  Object.assign(FX.fx, fx);

  // the families' deliveries wait for the sequencer (loaded before this file)
  if (RB.creaturesB) RB.creaturesB.flush();
})();
