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
  // one blank page in flight (whole pixels): its turn (0–3: flat, tilted, edge-on, tilted back)
  // decides its shape; an ink edge, a lit face and a faint line
  function page(c, x, y, turn, u, col, alpha) {
    if (alpha <= 0.01) return;
    const t4 = ((turn % 4) + 4) % 4, w = [6, 5, 2, 5][t4] * u, h = [4, 5, 5, 4][t4] * u;
    R(c, x - w / 2 - u, y - h / 2 - u, w + 2 * u, h + 2 * u, '#2a2840', alpha * 0.8);
    R(c, x - w / 2, y - h / 2, w, h, col, alpha);
    if (t4 !== 2) R(c, x - w / 2 + u, y, Math.max(u, w - 2 * u), u, '#8a86a0', alpha * 0.8);
  }

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

    // ---- lanterns ----------------------------------------------------------------------------------
    // a lick of flame from the grin to the one target (its head arrives ≈ 0.43), then drawn back
    cbFlameLick(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest'), T = p.short ? lerpP(T0, M, 0.3) : T0;
      const col = p.col || '#8aa8e8', mid = tint(col, 0.45), hot = tint(col, 0.85);
      const head = still ? 0.95 : k < 0.43 ? ease(k / 0.43) : k < 0.55 ? 1 : 1 - easeIn((k - 0.55) / 0.35);
      const tailS = still ? 0 : Math.max(0, head - 0.75);
      if (head <= 0.02) return;
      const al = still ? 0.8 * (1 - seg(k, 0.7, 1)) : 1 - seg(k, 0.85, 1);
      const len = Math.hypot(T.x - M.x, T.y - M.y), n = Math.max(8, Math.round((len * (head - tailS)) / (2 * u)));
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i <= n; i++) {
          const s = tailS + ((head - tailS) * i) / n, q = qpt(M, T, -0.18 * len, s);
          const f = i / n, wob = still ? 0 : Math.sin(s * 14 - t / 40) * 1.5 * u;
          const w = Math.max(u, Math.round((7 - 4 * f) * u * (pass === 0 ? 1.3 : pass === 1 ? 0.8 : 0.4)));
          R(c, q.x - w / 2, q.y - w / 2 + wob, w, w, pass === 0 ? col : pass === 1 ? mid : hot, al * (pass === 0 ? 0.9 : 1));
        }
      }
      if (!still && k > 0.4 && k < 0.7) { const s = seg(k, 0.4, 0.7); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5; blk(c, T.x + Math.cos(a) * s * 16 * u, T.y + Math.sin(a) * s * 12 * u - s * 6 * u, 2 * u, 2 * u, i % 2 ? hot : mid, 1 - s, '#3a2418'); } }
    },
    // Heat: a shimmer rolls off the lantern in rings and hot sparks lift (strongest ≈ 0.5)
    cbHeatWave(c, e, k, A, t, still) {
      const u = A.u, p = e.p, o = on(A, p), col = tint(p.col || '#f0a060', 0.5);
      if (still) { ring(c, o.x, o.y, A.foeR * 0.8, u, '#ffe8b0', 0.7 * (1 - seg(k, 0.7, 1))); return; }
      for (let i = 0; i < 3; i++) {
        const s = seg(k, 0.15 + i * 0.12, 0.65 + i * 0.12);
        if (s <= 0 || s >= 1) continue;
        const r = A.foeR * (0.5 + ease(s) * 0.9);
        c.globalAlpha = 0.75 * (1 - s); c.fillStyle = i % 2 ? col : '#fff0c0';
        const nn = Math.max(16, Math.round(r / u));
        for (let j = 0; j < nn; j++) { const a = (j / nn) * Math.PI * 2, rr = r + Math.sin(a * 6 + t / 60) * 2 * u; c.fillRect(Math.round(o.x + Math.cos(a) * rr), Math.round(o.y + Math.sin(a) * rr * 0.8), u, u); }
        c.globalAlpha = 1;
      }
      for (let i = 0; i < 8; i++) { const s = seg(k, 0.3 + hs(i, 3) * 0.2, 0.9); if (s <= 0 || s >= 1) continue; blk(c, o.x + (hs(i, 5) - 0.5) * A.foeR * 1.4 + Math.sin(t / 80 + i) * u, o.y - ease(s) * (30 + hs(i, 7) * 30) * u, 2 * u, 2 * u, i % 2 ? '#ffe08a' : col, 1 - s, '#5a2418'); }
      K().halo(c, o.x, o.y, Math.round(A.foeR * 0.9), '255,200,120', 0.3 * bell(seg(k, 0.2, 0.9)), 3);
    },
    // Shroud from a lantern: smoke rolls from its lower cap down over its knots (covers them ≈ 0.55);
    // p.moths: Moth and Lantern's moths whirl out through it
    cbSmoke(c, e, k, A, t, still) {
      const u = A.u, p = e.p, o = on(A, p), b = A.pt('foe', 'base'), w = A.knotSpan || A.foeR;
      const al = 1 - seg(k, 0.75, 1);
      if (still) { for (let i = 0; i < 3; i++) { c.globalAlpha = 0.4 * al; c.fillStyle = '#9a94a8'; K().disc(c, b.x + (i - 1) * w * 0.6, b.y, 14 * u, 7 * u); } c.globalAlpha = 1; return; }
      for (let i = 0; i < 9; i++) {
        const s = seg(k, i * 0.04, 0.55 + i * 0.04);
        if (s <= 0) continue;
        const x = o.x + (b.x + (i % 3 - 1) * w * 0.7 - o.x) * ease(s) + Math.sin(i * 2.1 + t / 400) * 3 * u, y = o.y + (b.y - o.y) * ease(s);
        const r = (6 + ease(s) * 12) * u;
        c.globalAlpha = 0.42 * al * Math.min(1, s * 3); c.fillStyle = i % 2 ? '#8a8498' : '#a8a2b4';
        K().disc(c, x, y, Math.round(r), Math.round(r * 0.55));
      }
      c.globalAlpha = 1;
      if (p.moths) for (let i = 0; i < 5; i++) {
        const s = seg(k, 0.1 + i * 0.05, 0.8 + i * 0.04);
        if (s <= 0 || s >= 1) continue;
        const a = i * 1.3 + s * 5, r = (16 + s * 40) * u;
        const x = o.x + Math.cos(a) * r, y = o.y - 20 * u + Math.sin(a) * r * 0.5 + s * 30 * u, up = Math.round(t / 60 + i) % 2;
        R(c, x - 3 * u, y - (up ? 2 : 0) * u, 3 * u, 2 * u, '#f2ead8', 1 - s); R(c, x + u, y - (up ? 2 : 0) * u, 3 * u, 2 * u, '#f2ead8', 1 - s); R(c, x, y, u, 2 * u, '#6a5a48', 1 - s);
      }
    },
    // the false promise of a lantern: a warm light floats to its target (arrives ≈ 0.71) and there
    // turns cold and breaks
    cbFalseLight(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T = A.pt(p.to, 'chest');
      if (still) { K().halo(c, T.x, T.y, 10 * u, '255,210,140', 0.5 * (1 - seg(k, 0.7, 1)), 3); return; }
      const s = ease(seg(k, 0, 0.71)), q = qpt(M, T, -26 * u, s), br = seg(k, 0.71, 1);
      if (br <= 0) {
        K().halo(c, q.x, q.y + Math.sin(t / 120) * u, Math.round((7 + Math.sin(t / 90) * 1.5) * u), '255,200,120', 0.6, 3);
        blk(c, q.x - 2 * u, q.y - 2 * u, 4 * u, 4 * u, '#ffe0a0', 1, '#6a3a20');
      } else {
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.3, r = ease(br) * 14 * u; R(c, T.x + Math.cos(a) * r, T.y + Math.sin(a) * r + easeIn(br) * 8 * u, 2 * u, 2 * u, i % 2 ? '#bcd0ee' : '#e8eef8', 1 - br); }
        ring(c, T.x, T.y, (4 + br * 10) * u, u, '#bcd0ee', 0.8 * (1 - br));
      }
    },
    // Re-tying from a point of the creature (a lantern's tail tip, a veil's hem, a spout): a
    // thread runs to the loose knot p.i and pulls it tight (≈ 0.62). p.i == null: there is nothing
    // to re-tie — the thread reaches, frays and falls away (no knot changes)
    cbMend(c, e, k, A, t, still) {
      const u = A.u, p = e.p, a = on(A, p), col = p.col || '#e8d8b0', bright = tint(col, 0.6);
      const b = p.i != null ? A.pt('knot:' + p.i, 'core') : { x: A.pt('foe', 'base').x, y: A.pt('foe', 'base').y - 6 * u };
      if (still) { if (p.i != null) ring(c, b.x, b.y, 10 * u, u, bright, 0.8 * (1 - seg(k, 0.7, 1))); return; }
      const s = ease(seg(k, 0, 0.55)), fade = 1 - seg(k, 0.8, 1);
      const n = Math.max(8, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / (1.5 * u)));
      for (let i = 0; i <= n; i++) {
        const f = i / n;
        if (f > s) break;
        const q = qpt(a, b, 10 * u, f), w = Math.sin(f * Math.PI * 4 + t / 90) * 2 * u * (1 - seg(k, 0.5, 0.62));
        R(c, q.x, q.y + w, u, u, i % 4 ? bright : col, fade);
      }
      if (p.i != null) {
        const g = seg(k, 0.55, 0.8);
        if (g > 0) { ring(c, b.x, b.y, (14 - ease(g) * 8) * u, u, bright, 1 - seg(k, 0.8, 1)); spark(c, b.x, b.y - 2 * u, (4 - 2 * g) * u, u, '#ffffff', 1 - g); }
      } else if (k > 0.55) {
        const f = seg(k, 0.55, 1);
        for (let i = 0; i < 5; i++) R(c, b.x + (i - 2) * 3 * u, b.y + easeIn(f) * 12 * u, u, u, col, 1 - f);
      }
    },
    // Chill: a stream of frost from an opening (the lamp's door, a fox's mouth) to the one target;
    // the front arrives ≈ 0.48, rime forms on them; p.short: it stops at a seal
    cbFrostBreath(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest'), T = p.short ? lerpP(T0, M, 0.3) : T0;
      if (still) { for (let i = 0; i < 5; i++) spark(c, T.x + (i - 2) * 5 * u, T.y + ((i % 2) * 4 - 2) * u, 3 * u, u, '#e4f2ff', 0.85 * (1 - seg(k, 0.7, 1))); return; }
      const front = ease(seg(k, 0, 0.48)), stop = seg(k, 0.6, 0.9);
      const len = Math.hypot(T.x - M.x, T.y - M.y);
      for (let i = 0; i < 26; i++) {
        const ph = (hs(i, 1) + k * 2.2) % 1, s = ph * front;
        if (s < stop) continue;
        const q = qpt(M, T, 0.06 * len, s), spread = (2 + s * 10) * u;
        const x = q.x + (hs(i, 2) - 0.5) * spread, y = q.y + (hs(i, 3) - 0.5) * spread;
        if (i % 3 === 0) spark(c, x, y, 2 * u, u, '#ffffff', 0.9 * (1 - seg(k, 0.85, 1)));
        else blk(c, x, y, (i % 2 ? 2 : 1) * u, u, i % 2 ? '#e4f2ff' : '#bcd8ee', 0.85 * (1 - seg(k, 0.85, 1)), '#4a6a8a');
      }
      // a misty body to the stream
      for (let i = 0; i < 6; i++) { const s = (i / 6) * front; if (s < stop) continue; const q = qpt(M, T, 0.06 * len, s); c.globalAlpha = 0.22 * (1 - seg(k, 0.8, 1)); c.fillStyle = '#e2f0ff'; K().disc(c, q.x, q.y, Math.round((3 + s * 9) * u), Math.round((2 + s * 6) * u)); }
      c.globalAlpha = 1;
      if (k > 0.46) { const g = seg(k, 0.46, 1); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; spark(c, T.x + Math.cos(a) * (6 + g * 6) * u, T.y + Math.sin(a) * (6 + g * 6) * u, (3 - g * 2) * u, u, '#e4f2ff', 1 - g); } }
    },
    // the snow off the Lamp's roof flung at its target (lands ≈ 0.23), bursting in a puff
    cbSnowBurst(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest'), T = p.short ? lerpP(T0, M, 0.3) : T0;
      if (still) { for (let i = 0; i < 4; i++) { c.globalAlpha = 0.6 * (1 - seg(k, 0.6, 1)); c.fillStyle = '#eef4fa'; K().disc(c, T.x + (i - 1.5) * 6 * u, T.y - 2 * u, 4 * u, 3 * u); } c.globalAlpha = 1; return; }
      const fl = seg(k, 0, 0.23);
      if (fl < 1) for (let i = 0; i < 5; i++) {
        const s = cl(fl * 1.1 - i * 0.03), q = qpt(M, T, -0.3 * Math.hypot(T.x - M.x, T.y - M.y), s);
        blk(c, q.x - 2 * u + (i - 2) * 2 * u, q.y - 2 * u + (i % 2) * 2 * u, (4 - (i % 2)) * u, 3 * u, i % 2 ? '#dce8f4' : '#f6fbff', 1, '#6a7a90');
      }
      const bst = seg(k, 0.23, 1);
      if (bst > 0) {
        for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.1 + 0.8 * hs(i, 4)), r = ease(bst) * (8 + hs(i, 6) * 14) * u; blk(c, T.x + Math.cos(a) * r, T.y + Math.sin(a) * r + easeIn(bst) * 18 * u, 2 * u, 2 * u, i % 2 ? '#eef4fa' : '#ffffff', 1 - bst, '#6a7a90'); }
        c.globalAlpha = 0.45 * (1 - bst); c.fillStyle = '#f6fbff'; K().disc(c, T.x, T.y, Math.round((6 + bst * 10) * u), Math.round((4 + bst * 6) * u)); c.globalAlpha = 1;
      }
    },

    // ---- veils ----------------------------------------------------------------------------------------
    // the veil's sleeve wraps its one target (≈ 0.1) and pulls tight, then slips away;
    // p.short: it wraps only the seal raised in front of them
    cbWrap(c, e, k, A, t, still) {
      const u = A.u, p = e.p, T0 = A.pt(p.to, 'chest'), F = A.pt('foe', 'core'), T = p.short ? lerpP(T0, F, 0.3) : T0;
      const col = p.col || '#e8e6f0', shade = '#a8a4b8';
      const al = still ? 0.8 * (1 - seg(k, 0.6, 1)) : 1 - seg(k, 0.65, 1);
      const wrap = still ? 1 : ease(seg(k, 0, 0.2)), tight = seg(k, 0.2, 0.45);
      const rx = (16 - 4 * ease(tight)) * u, ry = (7 - 2 * ease(tight)) * u;
      for (let b = 0; b < 2; b++) {
        const y = T.y + (b * 8 - 4) * u;
        const a0 = -Math.PI * 0.1 + b * 0.6, a1 = a0 + Math.PI * 2 * wrap;
        arc(c, T.x, y, rx, ry, a0, a1, u, b ? shade : col, al, 3 * u);
        arc(c, T.x, y - u, rx, ry, a0, a1, u, '#ffffff', al * 0.5, u);
      }
      // the loose end trailing back toward the veil
      if (!still && k < 0.5) { const end = lerpP(T, F, 0.18); for (let i = 0; i < 6; i++) { const q = lerpP({ x: T.x + rx, y: T.y }, end, i / 6); R(c, q.x, q.y + Math.sin(i + t / 70) * u, 3 * u, 3 * u, col, al * (1 - i / 7)); } }
    },

    // ---- the conduit ---------------------------------------------------------------------------------
    // a jet under pressure from the spout: its landing point sweeps across the party, reaching
    // each recipient in turn (0.34, then 0.49), the stream flowing from the mouth (never back);
    // splashes where it lands, and drops left on the ground as it stops
    cbJet(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), who = (p.who || ['pc']).map((w) => A.pt(w, 'chest'));
      const col = tint(p.col || '#8a90c8', 0.35), foam = '#eef4ff';
      if (still) { for (const q of who) { R(c, q.x - 8 * u, q.y - 2 * u, 16 * u, 4 * u, col, 0.7 * (1 - seg(k, 0.7, 1))); } return; }
      const near = lerpP(who[0], M, 0.25), far = { x: who[who.length - 1].x - 24 * u, y: who[who.length - 1].y + 4 * u };
      const ks = [0.34, 0.49];
      let Lp;
      if (k < ks[0]) Lp = lerpP(near, who[0], seg(k, 0.12, ks[0]));
      else if (who.length > 1 && k < ks[1]) Lp = lerpP(who[0], who[1], seg(k, ks[0], ks[1]));
      else Lp = lerpP(who[who.length - 1], far, seg(k, who.length > 1 ? ks[1] : ks[0], 0.62));
      const on1 = seg(k, 0.06, 0.14), off = seg(k, 0.62, 0.78);
      const len = Math.hypot(Lp.x - M.x, Lp.y - M.y), apex = -0.35 * len;
      if (on1 > 0 && off < 1) {
        const n = Math.max(10, Math.round(len / (2 * u)));
        for (let i = 0; i <= n; i++) {
          const s = i / n;
          if (s > on1 || s < off) continue;
          const q = qpt(M, Lp, apex, s), w = Math.max(2, Math.round((5 - 2 * s) * u));
          const flow = ((s * 8 - t / 60) % 1 + 1) % 1;
          R(c, q.x - w / 2, q.y - w / 2, w, w, flow < 0.25 ? foam : col, 0.9);
        }
        // spray where it lands
        for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + 0.7 * hs(i, Math.round(t / 80))), r = (4 + hs(i, 3) * 10) * u; R(c, Lp.x + Math.cos(a) * r, Lp.y + Math.sin(a) * r, 2 * u, 2 * u, i % 2 ? foam : col, 0.8 * (1 - off)); }
      }
      // each recipient is drenched as the jet passes
      who.forEach((q, i) => { const s = seg(k, ks[i], ks[i] + 0.25); if (s > 0 && s < 1) for (let j = 0; j < 7; j++) { const a = -Math.PI / 2 + (j - 3) * 0.45, r = ease(s) * (8 + hs(j, i) * 10) * u; R(c, q.x + Math.cos(a) * r, q.y + Math.sin(a) * r + easeIn(s) * 12 * u, 2 * u, 2 * u, j % 2 ? foam : col, 1 - s); } });
      // drops left behind on the floor
      if (k > 0.55) { const s = seg(k, 0.55, 1); for (const q of who) { const f = A.pt('pc', 'feet'); R(c, q.x - 10 * u, f.y - u, 20 * u, u, col, 0.6 * (1 - s)); } }
    },

    // ---- the Hush: its pages ---------------------------------------------------------------------
    // a lance of its pages thrown at the one target (the head arrives ≈ 0.43), bursting there;
    // p.short: it shatters on the seal in front of them
    cbPageLance(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest'), T = p.short ? lerpP(T0, M, 0.3) : T0;
      if (still) { for (let i = 0; i < 5; i++) page(c, T.x + (i - 2) * 6 * u, T.y + ((i % 2) * 6 - 3) * u, i, u, '#eeeae0', 0.85 * (1 - seg(k, 0.7, 1))); return; }
      const fly = seg(k, 0, 0.43), dir = Math.atan2(T.y - M.y, T.x - M.x);
      if (fly < 1) {
        const head = lerpP(M, T, easeIn(fly) * 0.6 + fly * 0.4);
        for (let i = 0; i < 10; i++) { const back = i * 5 * u; page(c, head.x - Math.cos(dir) * back, head.y - Math.sin(dir) * back, 0, u, i % 2 ? '#cfcadf' : '#eeeae0', 1 - i * 0.05); }
      } else {
        const b = seg(k, 0.43, 1);
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + hs(i, 4), r = ease(b) * (10 + hs(i, 2) * 22) * u; page(c, T.x + Math.cos(a) * r, T.y + Math.sin(a) * r * 0.8 + easeIn(b) * 20 * u, i + Math.round(b * 4), u, i % 2 ? '#cfcadf' : '#eeeae0', 1 - b); }
        ring(c, T.x, T.y, (6 + ease(b) * 16) * u, u, '#f0ecff', 0.7 * (1 - b));
      }
    },
    // its pages fanned and flung across the party: the arc reaches each recipient in turn (0.29,
    // then 0.44), then the pages scatter and fall
    cbPageFling(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), who = (p.who || ['pc']).map((w) => A.pt(w, 'chest'));
      if (still) { for (const q of who) for (let i = 0; i < 3; i++) page(c, q.x + (i - 1) * 7 * u, q.y - 4 * u, i, u, '#eeeae0', 0.8 * (1 - seg(k, 0.7, 1))); return; }
      const mid = { x: who.reduce((m, q) => m + q.x, 0) / who.length, y: who.reduce((m, q) => m + q.y, 0) / who.length };
      const dir = Math.atan2(mid.y - M.y, mid.x - M.x), d = who.map((q) => Math.hypot(q.x - M.x, q.y - M.y));
      const ks = [0.29, 0.44];
      const rAt = (kk) => kk <= ks[0] ? d[0] * (kk / ks[0]) : who.length > 1 && kk <= ks[1] ? d[0] + (Math.max(d[1], d[0] + 10 * u) - d[0]) * ((kk - ks[0]) / (ks[1] - ks[0])) : (who.length > 1 ? Math.max(d[1], d[0] + 10 * u) : d[0]) + (kk - (who.length > 1 ? ks[1] : ks[0])) * 220 * u;
      const r = rAt(k), al = 1 - seg(k, 0.55, 0.85);
      for (let i = 0; i < 14; i++) {
        const a = dir - 0.6 + (i / 13) * 1.2, rr = r - (i % 3) * 4 * u;
        page(c, M.x + Math.cos(a) * rr, M.y + Math.sin(a) * rr * 0.62 + easeIn(seg(k, 0.5, 1)) * 20 * u, i + Math.round(k * 6), u, i % 2 ? '#cfcadf' : '#eeeae0', al);
      }
      who.forEach((q, i) => { const s = seg(k, ks[i], ks[i] + 0.25); if (s > 0 && s < 1) ring(c, q.x, q.y, (6 + ease(s) * 14) * u, u, '#f0ecff', 1 - s); });
    },
    // Shroud from its pages: blank pages drift down from round the hollow and settle over its
    // knots (covering them ≈ 0.49)
    cbPageFog(c, e, k, A, t, still) {
      const u = A.u, p = e.p, o = on(A, p), b = A.pt('foe', 'base'), w = A.knotSpan || A.foeR;
      const al = 1 - seg(k, 0.8, 1);
      if (still) { for (let i = 0; i < 6; i++) page(c, b.x + (i - 2.5) * w * 0.3, b.y + ((i % 2) * 4 - 2) * u, i, u, '#fbf9f4', 0.8 * al); return; }
      for (let i = 0; i < 14; i++) {
        const s = ease(seg(k, i * 0.02, 0.49 + i * 0.02)), a = i * 2.39;
        const x0 = o.x + Math.cos(a) * A.foeR * 0.9, y0 = o.y + Math.sin(a) * A.foeR * 0.5;
        const x1 = b.x + ((i % 7) - 3) * w * 0.22, y1 = b.y + ((i % 3) - 1) * 3 * u;
        page(c, x0 + (x1 - x0) * s + Math.sin(t / 200 + i) * 2 * u * (1 - s), y0 + (y1 - y0) * s, i + Math.round(s * 3), u, i % 2 ? '#f0eee8' : '#fbf9f4', al);
      }
    },
    // its vortex of pages blown across the party (reaches you ≈ 0.4; it tears the wards away)
    cbPageGust(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), who = (p.who || ['pc']).map((w) => A.pt(w, 'chest'));
      const end = { x: Math.min(...who.map((q) => q.x)) - 40 * u, y: who[0].y };
      if (still) { for (const q of who) arc(c, q.x, q.y, 18 * u, 8 * u, Math.PI * 0.2, Math.PI * 1.6, u, '#eef2f6', 0.7 * (1 - seg(k, 0.7, 1)), 2 * u); return; }
      const s = seg(k, 0, 0.75), cx = lerpP(M, end, ease(s) * 0.55 + s * 0.45), al = 1 - seg(k, 0.7, 0.95);
      for (let i = 0; i < 4; i++) {
        const y = cx.y + (i - 1.5) * 10 * u, len = (30 + i * 8) * u;
        for (let j = 0; j < 10; j++) R(c, cx.x + j * len / 10, y + Math.sin(j * 0.8 + t / 50 + i) * 2 * u, u, u, i % 2 ? '#eef2f6' : '#dfe6ee', al * (1 - j / 12));
      }
      for (let i = 0; i < 12; i++) {
        const a = i * 0.52 + k * 14, r = (8 + i * 2.2) * u;
        page(c, cx.x + Math.cos(a) * r, cx.y + Math.sin(a) * r * 0.55, i + Math.round(k * 9), u, i % 2 ? '#cfcadf' : '#eeeae0', al);
      }
    },
    // a mirror of pages flashes and its reflection strikes the one target (≈ 0.62); p.short: the
    // reflection breaks on the seal
    cbMirror(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest'), T = p.short ? lerpP(T0, M, 0.3) : T0;
      if (still) { R(c, T.x - 6 * u, T.y - 8 * u, 12 * u, 16 * u, '#e4f2ff', 0.45 * (1 - seg(k, 0.7, 1))); return; }
      const fl = seg(k, 0, 0.3);
      if (fl > 0 && fl < 1) { K().halo(c, M.x, M.y, Math.round((10 + fl * 14) * u), '240,248,255', 0.6 * bell(fl), 3); spark(c, M.x - 6 * u, M.y - 8 * u, (6 * bell(fl)) * u, u, '#ffffff', bell(fl)); }
      const bm = seg(k, 0.25, 0.62);
      if (bm > 0) {
        const head = lerpP(M, T, ease(bm)), tail = lerpP(M, T, Math.max(0, ease(bm) - 0.35));
        const n = Math.max(6, Math.round(Math.hypot(head.x - tail.x, head.y - tail.y) / (2 * u)));
        for (let i = 0; i <= n; i++) { const q = lerpP(tail, head, i / n); R(c, q.x - u, q.y - u, 3 * u, 3 * u, i % 3 ? '#e4f2ff' : '#ffffff', 0.9 * (1 - seg(k, 0.7, 0.85))); }
      }
      const hit = seg(k, 0.62, 1);
      if (hit > 0) {
        // the reflection: a pale outline of whoever it was sent at, flashing and fading
        c.globalAlpha = 0.55 * (1 - hit); c.fillStyle = '#e4f2ff';
        c.fillRect(Math.round(T.x - 6 * u), Math.round(T.y - 14 * u), Math.round(12 * u), Math.round(26 * u));
        c.fillRect(Math.round(T.x - 4 * u), Math.round(T.y - 22 * u), Math.round(8 * u), Math.round(8 * u));
        c.globalAlpha = 1;
        ring(c, T.x, T.y, (6 + ease(hit) * 14) * u, u, '#ffffff', 0.8 * (1 - hit));
      }
    },

    // ---- the Cartographer ------------------------------------------------------------------------
    // its chart snapped out like a lash: the paper strip runs on from the chart's end to the one
    // target (≈ 0.34), then rolls back; p.short: it stops at the seal
    cbChartLash(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T0 = A.pt(p.to, 'chest'), T = p.short ? lerpP(T0, M, 0.3) : T0;
      const reach = still ? 0.9 : k < 0.34 ? ease(k / 0.34) : k < 0.5 ? 1 : 1 - ease((k - 0.5) / 0.4);
      if (reach <= 0.02) return;
      const al = still ? 0.8 * (1 - seg(k, 0.7, 1)) : 1;
      const len = Math.hypot(T.x - M.x, T.y - M.y), n = Math.max(6, Math.round((len * reach) / (3 * u)));
      for (let i = 0; i <= n; i++) {
        const s = (i / n) * reach, q = qpt(M, T, (still ? 0 : Math.sin(k * 12) * 0.12) * len - 0.1 * len, s), w = 8 * u;
        R(c, q.x - w / 2 - u, q.y - w / 2 - u, w + 2 * u, w + 2 * u, '#6a5a48', al);
        R(c, q.x - w / 2, q.y - w / 2, w, w, i % 2 ? '#f8f2e2' : '#efe6d0', al);
        if (i % 3 === 1) R(c, q.x - w / 2 + u, q.y, w - 2 * u, u, '#b4a684', al);
      }
      if (!still && k > 0.32 && k < 0.6) { const s = seg(k, 0.32, 0.6); spark(c, T.x, T.y, (6 - 4 * s) * u, u, '#ffffff', 1 - s); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; R(c, T.x + Math.cos(a) * s * 14 * u, T.y + Math.sin(a) * s * 10 * u, 2 * u, u, '#efe6d0', 1 - s); } }
    },
    // its brush dragged in one long erasing stroke across the party: the stroke's head reaches
    // each recipient in turn (0.28, then 0.42), leaving a pale wash that fades
    cbErase(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), who = (p.who || ['pc']).map((w) => A.pt(w, 'chest'));
      if (still) { for (const q of who) R(c, q.x - 14 * u, q.y - 4 * u, 28 * u, 8 * u, '#fbf8f0', 0.6 * (1 - seg(k, 0.7, 1))); return; }
      const far = { x: who[who.length - 1].x - 30 * u, y: who[who.length - 1].y + 6 * u };
      const pts = [M].concat(who).concat([far]), ks = [0, 0.28].concat(who.length > 1 ? [0.42] : []).concat([0.6]);
      const at = (kk) => { for (let i = 1; i < ks.length; i++) if (kk <= ks[i]) return lerpP(pts[i - 1], pts[i], (kk - ks[i - 1]) / (ks[i] - ks[i - 1])); return pts[pts.length - 1]; };
      const head = Math.min(k, 0.6), fade = 1 - seg(k, 0.6, 1);
      const n = Math.max(10, Math.round(head * 60));
      for (let i = 0; i <= n; i++) {
        const kk = (i / n) * head, q = at(kk), w = (10 + Math.sin(kk * 20) * 2) * u;
        R(c, q.x - 2 * u, q.y - w / 2, 4 * u, w, '#fbf8f0', 0.55 * fade * (0.6 + 0.4 * (i / n)));
      }
      const hq = at(head);
      if (k < 0.62) R(c, hq.x - 3 * u, hq.y - 6 * u, 6 * u, 12 * u, '#2a2030', 0.8);
      who.forEach((q, i) => { const s = seg(k, ks[i + 1], ks[i + 1] + 0.3); if (s > 0 && s < 1) for (let j = 0; j < 4; j++) R(c, q.x + (j - 1.5) * 7 * u, q.y + ((j % 2) * 6 - 6) * u - s * 6 * u, 5 * u, 4 * u, '#fbf8f0', 1 - s); });
    },

    // ---- foxes ---------------------------------------------------------------------------------------
    // a bite on the one target: two rows of fangs snap shut (≈ 0.1) and a few flecks fly;
    // p.short: the jaws close on the seal in front of it
    cbBite(c, e, k, A, t, still) {
      const u = A.u, p = e.p, T0 = A.pt(p.to, 'chest'), F = A.pt('foe', 'core'), T = p.short ? lerpP(T0, F, 0.3) : T0;
      const al = still ? 0.85 * (1 - seg(k, 0.6, 1)) : 1 - seg(k, 0.5, 0.9);
      const cls = still ? 1 : ease(seg(k, 0, 0.12)), gap = (1 - cls) * 10 * u;
      for (const s of [-1, 1]) {
        const y = T.y + s * (3 * u + gap);
        arc(c, T.x, y, 9 * u, 4 * u, s < 0 ? Math.PI * 0.15 : Math.PI * 1.15, s < 0 ? Math.PI * 0.85 : Math.PI * 1.85, u, '#fff8f0', al, 2 * u);
        for (let i = -2; i <= 2; i++) R(c, T.x + i * 4 * u, y + s * u, u, -s * 3 * u + (s < 0 ? 0 : 0), '#ffffff', al);
      }
      if (!still && k > 0.1) { const f = seg(k, 0.1, 0.6); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.5; R(c, T.x + Math.cos(a) * ease(f) * 14 * u, T.y + Math.sin(a) * ease(f) * 10 * u, 2 * u, u, i % 2 ? '#ffffff' : '#f0d8c8', 1 - f); } }
    },
    // foxfire whirled off the tail: flames run along an arc across the party, passing each
    // recipient in turn (0.3, then 0.45), and flicker out
    cbFoxfire(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), who = (p.who || ['pc']).map((w) => A.pt(w, 'chest'));
      if (still) { for (const q of who) { K().halo(c, q.x, q.y, 9 * u, '154,224,232', 0.5 * (1 - seg(k, 0.7, 1)), 3); } return; }
      const far = who[who.length - 1], pts = [M].concat(who).concat([{ x: far.x - 30 * u, y: far.y - 20 * u }]);
      const ks = [0.3, 0.45];
      const at = (kk) => {
        // the flame front along M → who[0] → who[1] → beyond, timed to reach each at ks[i]
        if (kk <= ks[0]) return qpt(pts[0], pts[1], -0.35 * Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y), kk / ks[0]);
        if (who.length > 1 && kk <= ks[1]) return qpt(pts[1], pts[2], -20 * u, (kk - ks[0]) / (ks[1] - ks[0]));
        const i0 = who.length, k0 = who.length > 1 ? ks[1] : ks[0];
        return qpt(pts[i0], pts[i0 + 1], -10 * u, Math.min(1, (kk - k0) / 0.25));
      };
      for (let j = 0; j < 9; j++) {
        const kk = k - j * 0.025;
        if (kk <= 0) continue;
        const q = at(kk), al = (1 - seg(k, 0.65, 0.9)) * (1 - j / 10);
        const r = (5 - j * 0.35) * u, fl = Math.sin(t / 50 + j) * u;
        R(c, q.x - r, q.y - r * 1.6 + fl, r * 2, r * 2.4, '#5ac0d0', al * 0.7);
        R(c, q.x - r * 0.6, q.y - r * 1.2 + fl, r * 1.2, r * 1.6, '#9ae0e8', al);
        R(c, q.x - r * 0.25, q.y - r * 0.6 + fl, r * 0.5, r * 0.8, '#f0ffff', al);
      }
      who.forEach((q, i) => { const s = seg(k, ks[i], ks[i] + 0.3); if (s > 0 && s < 1) for (let m = 0; m < 5; m++) { const a = -Math.PI / 2 + (m - 2) * 0.5; R(c, q.x + Math.cos(a) * ease(s) * 12 * u, q.y + Math.sin(a) * ease(s) * 12 * u - s * 8 * u, 2 * u, 3 * u, '#9ae0e8', 1 - s); } });
    },
    // the borrowed face: a pale double of the fox glides to its target (≈ 0.65), where it pops
    // into a leaf that flutters down
    cbDouble(c, e, k, A, t, still) {
      const u = A.u, p = e.p, M = on(A, p), T = A.pt(p.to, 'chest');
      if (still) { K().halo(c, T.x, T.y, 10 * u, '240,232,210', 0.45 * (1 - seg(k, 0.7, 1)), 3); return; }
      const s = ease(seg(k, 0, 0.65)), pop = seg(k, 0.65, 1);
      if (pop <= 0) {
        const q = lerpP(M, T, s), al = 0.45 + 0.15 * Math.sin(t / 70);
        c.globalAlpha = al; c.fillStyle = '#f4ecd8';
        K().disc(c, q.x, q.y + 6 * u, 9 * u, 8 * u); K().disc(c, q.x - 2 * u, q.y - 6 * u, 7 * u, 6 * u);
        c.fillRect(Math.round(q.x - 8 * u), Math.round(q.y - 16 * u), 3 * u, 5 * u); c.fillRect(Math.round(q.x + 3 * u), Math.round(q.y - 16 * u), 3 * u, 5 * u);
        c.globalAlpha = 1;
        R(c, q.x - 5 * u, q.y - 7 * u, 2 * u, u, '#3a5a8a', al + 0.3); R(c, q.x + u, q.y - 7 * u, 2 * u, u, '#3a5a8a', al + 0.3);
      } else {
        const x = T.x + Math.sin(pop * 8) * 6 * u, y = T.y + easeIn(pop) * 22 * u;
        blk(c, x - 3 * u, y - 2 * u, 6 * u, 3 * u, '#6a9a48', 1 - pop, '#2a3a18');
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; R(c, T.x + Math.cos(a) * ease(pop) * 12 * u, T.y + Math.sin(a) * ease(pop) * 9 * u, u, u, '#f4ecd8', 1 - pop); }
      }
    },
  };
  Object.assign(FX.fx, fx);

  // the families' deliveries wait for the sequencer (loaded before this file)
  if (RB.creaturesB) RB.creaturesB.flush();
})();
