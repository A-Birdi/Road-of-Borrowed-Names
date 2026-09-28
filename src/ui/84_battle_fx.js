/* Battle effects and status marks, drawn as pixel shapes at art resolution
 * (no images, no text glyphs). Pure drawing: every function takes the 2D
 * context, positions in canvas art px, an integer pixel unit `u` (the
 * scene's grid) and a progress k (0 → 1) or a clock t. The battle stage
 * (src/ui/83_battle_stage.js) decides when and where; the sequencer
 * (src/ui/82_battle_seq.js) decides why. Particles are few, deterministic
 * (seeded by index, never Math.random) and bounded; with reduced motion
 * the callers pass `still` and the marks stay put without particles.
 *
 * RB.battleFx.fx[name](c, e, k, A, t, still)   transient effect instances
 * RB.battleFx.status.*                        persistent condition marks
 * RB.battleFx.digits(c, x, y, text, u, col)   small pixel numbers (3×5) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battleFx = (function () {
  'use strict';
  const K = () => RB.pxkit;
  // palette (the game's earthy paper-and-ink materials)
  const P = {
    paper: '#efe4c8', paper2: '#dccb9e', paperEdge: '#b8a47a', ink: '#2a2024', ink2: '#4a3a40',
    verm: '#c8503a', amber: '#e0a848', light: '#fff4c8', warm: '#ffd88a', river: '#8cc0e0',
    water: '#8cc8f0', foam: '#e8f6ff', frost: '#e4f2ff', ember: '#f08a48', ember2: '#ffc070',
    heal: '#b4e0a0', heal2: '#e8f8d8', mist: '#dfe5ee', hush: '#c8c4dc', stone: '#a89c88', stone2: '#6e6454',
    cord: '#e8d8b0',
  };
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (k) => 1 - Math.pow(1 - clamp01(k), 3);          // out
  const easeIn = (k) => Math.pow(clamp01(k), 2);
  const bell = (k) => Math.sin(Math.PI * clamp01(k));             // 0 → 1 → 0
  const seg = (k, a, b) => clamp01((k - a) / (b - a));            // local progress of [a, b]
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); }; // 0..1, stable
  function R(c, x, y, w, h, col, a) {
    if (a != null) { if (a <= 0.01) return; c.globalAlpha = Math.min(1, a); }
    if (col) c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    if (a != null) c.globalAlpha = 1;
  }
  // a dotted pixel line from a to b (every `step` px), optional wobble
  function line(c, a, b, u, col, alpha, o) {
    o = o || {};
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const n = Math.max(2, Math.round(len / ((o.step || 2) * u)));
    const nx = -dy / len, ny = dx / len;
    c.globalAlpha = clamp01(alpha == null ? 1 : alpha);
    c.fillStyle = col;
    const from = o.from || 0, to = o.to == null ? 1 : o.to;
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      if (s < from || s > to) continue;
      const w = o.wob ? Math.sin(s * Math.PI * (o.waves || 3) + (o.ph || 0)) * o.wob * Math.sin(Math.PI * s) : 0;
      c.fillRect(Math.round(a.x + dx * s + nx * w), Math.round(a.y + dy * s + ny * w), o.th || u, o.th || u);
    }
    c.globalAlpha = 1;
  }
  // a quadratic curve a → b bulging by `bend` (px, perpendicular), dotted
  function curve(c, a, b, bend, u, col, alpha, from, to) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    const n = Math.max(4, Math.round(len / (2 * u)));
    c.globalAlpha = clamp01(alpha == null ? 1 : alpha);
    c.fillStyle = col;
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      if (s < (from || 0) || s > (to == null ? 1 : to)) continue;
      const x = (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * cx + s * s * b.x;
      const y = (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * cy + s * s * b.y;
      c.fillRect(Math.round(x), Math.round(y), u, u);
    }
    c.globalAlpha = 1;
  }
  function qpt(a, b, bend, s) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    return { x: (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * cx + s * s * b.x, y: (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * cy + s * s * b.y };
  }
  function ring(c, x, y, r, u, col, alpha) {
    if (alpha != null && alpha <= 0.01) return;
    c.globalAlpha = clamp01(alpha == null ? 1 : alpha);
    c.fillStyle = col;
    K().ring(c, x, y, Math.max(1, r), u);
    c.globalAlpha = 1;
  }
  function ellipse(c, x, y, rx, ry, u, col, alpha, from, to) {
    c.globalAlpha = clamp01(alpha == null ? 1 : alpha);
    c.fillStyle = col;
    const n = Math.max(12, Math.round((rx + ry) * 1.2 / u));
    const a0 = from == null ? 0 : from, a1 = to == null ? Math.PI * 2 : to;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      c.fillRect(Math.round(x + Math.cos(a) * rx), Math.round(y + Math.sin(a) * ry), u, u);
    }
    c.globalAlpha = 1;
  }
  // a small paper tag (a ward seal): paper face, an ink band, a darker edge
  function tag(c, x, y, u, alpha, lit) {
    const w = 5 * u, h = 8 * u;
    R(c, x - w / 2 - u, y - h / 2 - u, w + 2 * u, h + 2 * u, lit ? P.light : P.paperEdge, alpha * (lit ? 0.9 : 0.8));
    R(c, x - w / 2, y - h / 2, w, h, lit ? '#fffaf0' : P.paper, alpha);
    R(c, x - u, y - h / 2 + u, 2 * u, h - 2 * u, P.verm, alpha * 0.85);
  }
  function spark(c, x, y, r, u, col, alpha) {
    R(c, x - u / 2, y - r, u, r * 2, col, alpha);
    R(c, x - r, y - u / 2, r * 2, u, col, alpha);
  }
  // mist puffs (stepped discs), drifting by `drift` px
  function puffs(c, pts, u, alpha, drift) {
    for (const [dx, dy, r, a] of pts) {
      c.globalAlpha = clamp01(a * alpha);
      c.fillStyle = P.mist;
      K().disc(c, dx + (drift || 0), dy, Math.max(u, Math.round(r)), Math.max(u, Math.round(r * 0.55)));
    }
    c.globalAlpha = 1;
  }

  // ---- 3×5 pixel digits -------------------------------------------------------------------
  const GLYPH = {
    0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001',
    5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001111',
    '+': '000010111010000', '-': '000000111000000', '−': '000000111000000',
  };
  function digits(c, x, y, text, u, col, alpha) {
    const s = String(text);
    const w = s.length * 4 * u - u;
    let x0 = Math.round(x - w / 2), y0 = Math.round(y);
    for (const pass of [0, 1]) {
      let xx = x0;
      for (const ch of s) {
        const g = GLYPH[ch];
        if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') {
          const gx = xx + (i % 3) * u, gy = y0 + Math.floor(i / 3) * u;
          if (pass === 0) R(c, gx - 1, gy - 1, u + 2, u + 2, P.ink, alpha * 0.9);
          else R(c, gx, gy, u, u, col, alpha);
        }
        xx += 4 * u;
      }
    }
  }

  // ---- transient effects ------------------------------------------------------------------
  // e.p holds the parameters (anchors are ids resolved through A.pt each frame,
  // so a resize mid-effect keeps them attached to the actors).
  const fx = {
    // Unravel: a loose paper-thread drawn from the hand to the knot being freed
    thread(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'hand'), b = A.pt(e.p.to, 'core');
      const bend = -0.28 * Math.hypot(b.x - a.x, b.y - a.y); // arcs up and over, never through anyone
      if (still) { curve(c, a, b, bend, u, P.cord, 0.6 * (1 - seg(k, 0.7, 1))); return; }
      const head = ease(seg(k, 0, 0.55)), fade = 1 - seg(k, 0.7, 1);
      const n = Math.max(8, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / (1.5 * u))), wob = 4 * u * (1 - k * 0.6);
      for (let i = 0; i <= n; i++) {
        const s = i / n;
        if (s > head) break;
        const q = qpt(a, b, bend, s), w = Math.sin(s * Math.PI * 3 + t / 90) * wob * Math.sin(Math.PI * s);
        R(c, q.x, q.y + w, u, u, i % 5 === 0 ? P.ink2 : P.cord, fade);
      }
      const hp = qpt(a, b, bend, head);
      R(c, hp.x - u, hp.y - u, 3 * u, 3 * u, P.paper, fade);
    },
    // Unravel on the creature: short strands of its tangled ink peel off and drift outward
    loosen(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('foe', 'core'), n = 6, r0 = A.foeR * 0.55;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + hs(i, 3) * 0.8, r = r0 + ease(k) * 22 * u;
        const x = o.x + Math.cos(ang) * r, y = o.y + Math.sin(ang) * r * 0.8;
        const al = bell(seg(k, 0, 1)) * 0.9;
        for (let j = 0; j < 4; j++) R(c, x + Math.cos(ang + 1.3) * j * 2 * u, y + Math.sin(ang + 1.3) * j * 2 * u + Math.sin(t / 80 + j) * u, u, u, j % 2 ? P.ink2 : P.cord, al);
      }
    },
    // the knot at e.p.i comes loose: its loop opens, the ends drop, a few paper flecks lift
    knotRelease(c, e, k, A, t, still) {
      const u = A.u, q = A.pt('knot:' + e.p.i, 'core');
      if (still) { ring(c, q.x, q.y, 12 * u, u, P.light, 0.7 * (1 - k)); return; }
      ring(c, q.x, q.y, Math.round((6 + ease(k) * 16) * u), u, P.light, 1 - k);
      for (let i = 0; i < 6; i++) {
        const ang = -Math.PI / 2 + (i - 2.5) * 0.55, r = ease(k) * (14 + hs(i, 7) * 10) * u;
        R(c, q.x + Math.cos(ang) * r, q.y + Math.sin(ang) * r - easeIn(k) * 6 * u, 2 * u, u, i % 2 ? P.paper : P.cord, 1 - k);
      }
      spark(c, q.x, q.y - 2 * u, Math.round((4 - 3 * k) * u), u, '#ffffff', 1 - seg(k, 0, 0.5));
    },
    // Protect: a brush stroke sweeps the arc in front of the ally, and the seal tags stand up along it
    sealForm(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.to, 'chest'), r = A.wardR;
      if (still) return; // the persistent seal shows at once
      const a0 = -Math.PI * 0.85, a1 = Math.PI * 0.2, s = ease(seg(k, 0, 0.6));
      ellipse(c, o.x, o.y, r, r * 0.9, u, P.light, (1 - seg(k, 0.6, 1)) * 0.9, a0, a0 + (a1 - a0) * s);
      if (k < 0.5) spark(c, o.x + Math.cos(a0 + (a1 - a0) * s) * r, o.y + Math.sin(a0 + (a1 - a0) * s) * r * 0.9, 3 * u, u, '#ffffff', 1);
    },
    // a ward takes a blow: the tag in front lights up, a small burst where the blow lands
    sealBlock(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.to, 'chest'), r = A.wardR, ang = -Math.PI * 0.25;
      const x = o.x + Math.cos(ang) * r, y = o.y + Math.sin(ang) * r * 0.9;
      if (still) { ring(c, x, y, 7 * u, u, P.light, 0.8 * (1 - k)); return; }
      tag(c, x, y, u, 1 - seg(k, 0.5, 1), true);
      ring(c, x, y, Math.round((5 + ease(k) * 10) * u), u, P.light, 1 - k);
      // the spent tags flutter off (one per absorbed point, at most three)
      for (let i = 0; i < Math.min(3, e.p.n || 1); i++) {
        const dx = (-6 - i * 5 - ease(k) * 18) * u, dy = (easeIn(k) * 16 - 4 + i * 3) * u;
        R(c, x + dx, y + dy + Math.sin(t / 70 + i) * u, 3 * u, 4 * u, P.paper, 1 - k);
      }
    },
    // Gust: every seal tag is torn away and blown off to the left
    sealStrip(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u;
      for (const who of e.p.who || []) {
        const o = A.pt(who, 'chest'), r = A.wardR;
        for (let i = 0; i < 4; i++) {
          const ang = -Math.PI * 0.8 + i * 0.3;
          const x = o.x + Math.cos(ang) * r - ease(k) * (30 + i * 10) * u, y = o.y + Math.sin(ang) * r * 0.9 - bell(k) * 8 * u + i * 2 * u;
          R(c, x, y + Math.sin(t / 60 + i) * u, 3 * u, 4 * u, i % 2 ? P.paper : P.paper2, 1 - k);
        }
      }
    },
    // Heal: paper motes rise around each ally in time with the recovery, a soft ring at the chest
    motes(c, e, k, A, t, still) {
      const u = A.u;
      for (const who of e.p.who || []) {
        const o = A.pt(who, 'chest');
        if (still) { spark(c, o.x, o.y - 10 * u, 3 * u, u, P.heal, 0.9 * (1 - seg(k, 0.6, 1))); continue; }
        ring(c, o.x, o.y, Math.round((4 + ease(seg(k, 0.25, 0.8)) * 14) * u), u, P.heal2, bell(seg(k, 0.25, 0.9)) * 0.8);
        for (let i = 0; i < 7; i++) {
          const ph = hs(i, who === 'pc' ? 1 : 2), s = seg(k, ph * 0.35, ph * 0.35 + 0.65);
          if (s <= 0 || s >= 1) continue;
          const x = o.x + (hs(i, 9) - 0.5) * 30 * u + Math.sin(t / 200 + i) * u, y = o.y + 12 * u - ease(s) * 34 * u;
          R(c, x, y, 2 * u, 2 * u, i % 3 ? P.heal2 : P.paper, 1 - s);
          if (i % 3 === 0) R(c, x, y + 2 * u, 2 * u, u, P.heal, 1 - s);
        }
      }
    },
    // Water: a compact wave arcs onto the creature, droplets splash, and steam rises where the heat was
    splash(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, 'hand'), b = A.pt('foe', 'top');
      if (still) return;
      const trav = seg(k, 0, 0.45);
      if (trav < 1) for (let i = 0; i < 5; i++) {
        const s = clamp01(trav - i * 0.06);
        if (s <= 0) continue;
        const q = qpt(a, b, -40 * u, s);
        R(c, q.x, q.y, 3 * u, 2 * u, i ? P.water : P.foam, 1);
      }
      const hit = seg(k, 0.45, 1);
      if (hit > 0) {
        for (let i = 0; i < 9; i++) {
          const ang = -Math.PI * (0.1 + 0.8 * (i / 8)), r = ease(hit) * (10 + hs(i, 4) * 12) * u;
          R(c, b.x + Math.cos(ang) * r, b.y + Math.sin(ang) * r * 0.7 + easeIn(hit) * 10 * u, 2 * u, 2 * u, i % 2 ? P.water : P.foam, 1 - hit);
        }
        if (e.p.steam) for (let i = 0; i < 5; i++) {
          const x = b.x + (i - 2) * 7 * u + Math.sin(t / 150 + i) * 2 * u, y = b.y - ease(hit) * (16 + i * 3) * u;
          c.globalAlpha = 0.55 * (1 - hit);
          c.fillStyle = '#f4f6f8';
          K().disc(c, x, y, Math.round((3 + hit * 4) * u), Math.round((2 + hit * 3) * u));
        }
        c.globalAlpha = 1;
      }
    },
    // Light: warm light gathers at the hand, then a revealing flash on the creature (no impact)
    flash(c, e, k, A, t, still) {
      const u = A.u, b = A.pt('foe', 'core');
      if (still) return;
      const a = A.pt(e.p.from, 'hand');
      const g = seg(k, 0, 0.35);
      if (g < 1) K().halo(c, a.x, a.y, Math.round((4 + g * 8) * u), '255,244,200', 0.8 * bell(g), 3);
      const f = seg(k, 0.3, 1);
      if (f > 0) {
        K().halo(c, b.x, b.y, Math.round((24 + ease(f) * 40) * u), '255,248,210', 0.55 * (1 - f), 4);
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2, r0 = (10 + ease(f) * 20) * u;
          line(c, { x: b.x + Math.cos(ang) * r0, y: b.y + Math.sin(ang) * r0 }, { x: b.x + Math.cos(ang) * (r0 + 8 * u), y: b.y + Math.sin(ang) * (r0 + 8 * u) }, u, P.light, 1 - f, { step: 1 });
        }
      }
    },
    // the mist is pushed apart (light or wind clearing a Shroud)
    mistPart(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, b = A.pt('foe', 'base');
      const s = ease(k);
      puffs(c, [[b.x - (20 + s * 60) * u, b.y - 4 * u, 18 * u, 0.3], [b.x + (20 + s * 60) * u, b.y, 20 * u, 0.3], [b.x - (6 + s * 30) * u, b.y + 10 * u, 14 * u, 0.26]], u, 1 - k);
    },
    // Wind: streaks from the hand past the creature
    wind(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, a = A.pt(e.p.from, 'hand'), b = A.pt('foe', 'core');
      for (let i = 0; i < 4; i++) {
        const off = (i - 1.5) * 9 * u, s = seg(k, i * 0.08, 0.6 + i * 0.08);
        const aa = { x: a.x, y: a.y + off }, bb = { x: b.x + 30 * u, y: b.y + off * 1.6 };
        curve(c, aa, bb, 10 * u, u, '#f0f4f8', 0.8 * bell(s), Math.max(0, s - 0.35), s);
      }
    },
    // Rope: a loop is thrown round the creature and cinched tight
    rope(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core'), rx = A.foeR * 0.7, ry = A.foeR * 0.28;
      if (still) { ellipse(c, o.x, o.y + 6 * u, rx * 0.8, ry * 0.8, u, P.cord, 0.8 * (1 - seg(k, 0.6, 1))); return; }
      const draw = ease(seg(k, 0, 0.5)), cinch = seg(k, 0.5, 0.75), fade = 1 - seg(k, 0.75, 1);
      const sc = 1 - 0.18 * ease(cinch);
      ellipse(c, o.x, o.y + 6 * u, rx * sc, ry * sc, u, P.cord, fade, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * draw);
      ellipse(c, o.x, o.y + 6 * u + u, rx * sc, ry * sc, u, P.stone2, fade * 0.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * draw);
      if (cinch > 0) R(c, o.x - 2 * u, o.y + 6 * u + ry * sc - 2 * u, 4 * u, 4 * u, P.cord, fade);
    },
    // the gathered force spills away as motes flung outward (Gathering removed)
    scatter(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('foe', 'core');
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + 0.3, r = (18 + ease(k) * 34) * u;
        R(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r * 0.8, 2 * u, 2 * u, P.amber, 1 - k);
      }
    },
    // Stone: a seal circle settles at the party's feet
    stone(c, e, k, A, t, still) {
      const u = A.u;
      for (const who of e.p.who || []) {
        const f = A.pt(who, 'feet');
        const s = ease(seg(k, 0, 0.5));
        ellipse(c, f.x, f.y, (10 + s * 8) * u, (3 + s * 2) * u, u, P.stone, (1 - seg(k, 0.7, 1)) * (still ? 0.7 : 1));
        if (!still) for (let i = 0; i < 3; i++) R(c, f.x + (i - 1) * 9 * u, f.y - bell(seg(k, 0.1 + i * 0.1, 0.7)) * 5 * u - u, 3 * u, 2 * u, i % 2 ? P.stone : P.stone2, 1 - seg(k, 0.6, 1));
      }
    },
    // Warmth: a warm glow wraps the allies, a few embers rise
    warm(c, e, k, A, t, still) {
      const u = A.u;
      for (const who of e.p.who || []) {
        const o = A.pt(who, 'chest');
        if (still) continue;
        K().halo(c, o.x, o.y, Math.round(18 * u), '255,190,120', 0.45 * bell(k), 3);
        for (let i = 0; i < 4; i++) R(c, o.x + (hs(i, 5) - 0.5) * 20 * u, o.y + 6 * u - ease(k) * (18 + i * 4) * u, u, 2 * u, i % 2 ? P.ember2 : P.ember, 1 - k);
      }
    },
    // Bell / voice: clear rings spread from the party (and the hush breaks)
    rings(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('party', 'head');
      if (still) { ring(c, o.x, o.y - 6 * u, 10 * u, u, P.light, 0.7 * (1 - k)); return; }
      for (let i = 0; i < 3; i++) {
        const s = seg(k, i * 0.15, 0.7 + i * 0.1);
        if (s > 0 && s < 1) ring(c, o.x, o.y - 6 * u, Math.round((6 + ease(s) * 34) * u), u, P.light, 1 - s);
      }
    },
    // a folded paper note drifting from one side to the other (an answer, or its plea)
    note(c, e, k, A, t, still) {
      const u = A.u, a = A.pt(e.p.from, e.p.from === 'foe' ? 'core' : 'hand'), b = A.pt(e.p.to, e.p.to === 'foe' ? 'core' : 'head');
      const s = still ? 0.5 : ease(seg(k, 0, 0.8)), q = qpt(a, b, -24 * u, s);
      const al = still ? 0.9 * (1 - seg(k, 0.7, 1)) : 1 - seg(k, 0.8, 1) * (e.p.fade ? 1 : 0.2);
      R(c, q.x - 4 * u, q.y - 3 * u + (still ? 0 : Math.sin(t / 120) * u), 8 * u, 6 * u, P.paper, al);
      R(c, q.x - 4 * u, q.y - 3 * u, 8 * u, u, P.paper2, al);
      R(c, q.x - 2 * u, q.y, 4 * u, u, P.ink2, al * 0.7);
    },
    // See through: a pale lens forms over the false promise and a crack runs across it
    lens(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core');
      const r = Math.round(A.foeR * 0.45);
      ring(c, o.x, o.y, r, u, P.light, (still ? 0.7 : 1) * (1 - seg(k, 0.75, 1)));
      const cr = still ? 1 : ease(seg(k, 0.3, 0.7));
      if (cr > 0) line(c, { x: o.x - r * 0.7, y: o.y - r * 0.7 }, { x: o.x + r * 0.7, y: o.y + r * 0.7 }, u, '#ffffff', 1 - seg(k, 0.75, 1), { to: cr, wob: 2 * u, waves: 5, step: 1 });
    },
    // the enemy's focused blow: a short ink streak from the creature to its one target
    dart(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, a = A.pt('foe', 'core'), b = A.pt(e.p.to, 'chest');
      const col = e.p.col || P.ink2;
      const s = ease(k), tail = Math.max(0, s - 0.3);
      line(c, a, b, u, col, 0.9, { from: tail, to: s, th: 2 * u, step: 1 });
      line(c, a, b, u, e.p.glint || P.paper, 0.9, { from: Math.max(0, s - 0.08), to: s, th: u, step: 1 });
    },
    // a broad sweep: one arc that passes over every affected ally in turn
    arc(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, who = e.p.who || [];
      const pts = [A.pt('foe', 'core')].concat(who.map((w) => A.pt(w, 'chest')));
      if (pts.length < 2) return;
      const last = pts[pts.length - 1];
      const end = { x: last.x + 22 * u, y: last.y + 4 * u };
      pts.push(end);
      const col = e.p.col || P.ink2, col2 = e.p.col2 || P.paper;
      const s = ease(k), tail = Math.max(0, s - 0.35);
      const segs = pts.length - 1;
      for (let i = 0; i < segs; i++) {
        const a0 = i / segs, a1 = (i + 1) / segs;
        const f = clamp01((tail - a0) / (a1 - a0)), g = clamp01((s - a0) / (a1 - a0));
        if (g <= 0 || f >= 1) continue;
        const bend = i === 0 ? 36 * u : -10 * u;
        curve(c, pts[i], pts[i + 1], bend, u, col, 0.85, f, g);
        curve(c, { x: pts[i].x, y: pts[i].y - 3 * u }, { x: pts[i + 1].x, y: pts[i + 1].y - 3 * u }, bend, u, col2, 0.6, f, g);
      }
    },
    // Gust: wind lines rake across the party from the creature's side
    gust(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('party', 'chest'), f = A.pt('foe', 'core');
      for (let i = 0; i < 5; i++) {
        const s = seg(k, i * 0.07, 0.7 + i * 0.06), y = o.y + (i - 2) * 10 * u;
        const a = { x: f.x - 10 * u, y: y - 20 * u + i * 4 * u }, b = { x: o.x - 60 * u, y: y + 6 * u };
        curve(c, a, b, 8 * u, u, '#eef2f6', 0.75 * bell(s), Math.max(0, s - 0.3), s);
      }
    },
    // contact on an ally: a compact star and four flecks (brief; one per real hit)
    impact(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.to, 'chest');
      const x = o.x + (e.p.dx || 0) * u, y = o.y + (e.p.dy || 0) * u;
      if (still) { spark(c, x, y, 5 * u, u, '#ffffff', 0.9 * (1 - seg(k, 0.5, 1))); return; }
      const r = Math.round((3 + ease(k) * 7) * u) * (e.p.small ? 0.7 : 1);
      spark(c, x, y, r, 2 * u, '#ffffff', 1 - k);
      spark(c, x, y, Math.round(r * 0.5), u, e.p.col || P.amber, 1 - k);
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) R(c, x + dx * r * 0.8, y + dy * r * 0.8, u, u, '#ffffff', 1 - k);
    },
    // Chill: frost sparks where the cold blow lands
    frost(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt(e.p.to, 'chest');
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2, r = ease(k) * 14 * u;
        spark(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r, 2 * u, u, P.frost, 1 - k);
      }
    },
    // a blow that meets empty air (Suzu's flourish): paper confetti where it would have landed
    miss(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt(e.p.to, 'chest');
      for (let i = 0; i < 8; i++) {
        const ang = -Math.PI / 2 + (hs(i, 2) - 0.5) * 2.6, r = ease(k) * (12 + hs(i, 6) * 12) * u;
        R(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r + easeIn(k) * 12 * u, 2 * u, u, i % 3 ? P.paper : P.verm, 1 - k);
      }
    },
    // its move comes to nothing: the ink it gathered breaks up in little puffs around it
    fizzle(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('foe', 'core');
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2 + 0.4, r = (A.foeR * 0.35) + ease(k) * 16 * u;
        c.globalAlpha = 0.6 * (1 - k);
        c.fillStyle = i % 2 ? P.ink2 : '#8a7c84';
        K().disc(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r * 0.8, Math.round((3 - 2 * k) * u) + u, Math.round((2 - k) * u) + u);
      }
      c.globalAlpha = 1;
    },
    // Heat rising: embers burst from the creature
    embers(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('foe', 'top');
      for (let i = 0; i < 10; i++) {
        const x = o.x + (hs(i, 8) - 0.5) * A.foeR * 1.2, y = o.y + A.foeR * 0.3 - ease(k) * (20 + hs(i, 3) * 26) * u;
        R(c, x + Math.sin(t / 90 + i) * u, y, u, 2 * u, i % 2 ? P.ember : P.ember2, 1 - k);
      }
      K().halo(c, A.pt('foe', 'core').x, A.pt('foe', 'core').y, Math.round(A.foeR * 0.8), '255,150,80', 0.35 * bell(k), 3);
    },
    // Shroud rising: mist rolls down off the creature over its knots
    mistRoll(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('foe', 'core'), b = A.pt('foe', 'base');
      const s = ease(k);
      const y = o.y + (b.y - o.y) * s;
      puffs(c, [[o.x - 30 * u * s, y, 16 * u, 0.3], [o.x + 30 * u * s, y + 4 * u, 18 * u, 0.3], [o.x, y - 8 * u, 14 * u, 0.3]], u, 1 - seg(k, 0.7, 1));
    },
    // Gathering: motes spiral in to the creature's core
    gather(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, o = A.pt('foe', 'core');
      for (let i = 0; i < 8; i++) {
        const s = seg(k, i * 0.04, 0.7 + i * 0.03), ang = (i / 8) * Math.PI * 2 + s * 3, r = (1 - ease(s)) * (A.foeR * 0.9);
        R(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r * 0.8, 2 * u, 2 * u, P.amber, bell(s));
      }
      K().halo(c, o.x, o.y, Math.round(A.foeR * 0.35), '255,210,130', 0.5 * bell(seg(k, 0.5, 1)), 3);
    },
    // Re-tying: a thread runs from the creature down to a loose knot, which pulls tight
    mendThread(c, e, k, A, t, still) {
      const u = A.u, a = A.pt('foe', 'core'), b = A.pt('knot:' + e.p.i, 'core');
      if (still) { ring(c, b.x, b.y, 10 * u, u, P.verm, 0.7 * (1 - k)); return; }
      const s = ease(seg(k, 0, 0.55));
      line(c, a, b, u, P.cord, 1 - seg(k, 0.7, 1), { to: s, wob: 3 * u, waves: 4, ph: t / 100, step: 1.5 });
      const g = seg(k, 0.55, 1);
      if (g > 0) ring(c, b.x, b.y, Math.round((14 - ease(g) * 8) * u), u, P.verm, 1 - g);
    },
    // Hush: a pale wave rolls from the creature onto the party
    hushWave(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, a = A.pt('foe', 'core'), b = A.pt('party', 'head');
      const s = ease(seg(k, 0, 0.8));
      const q = { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
      for (let i = 0; i < 3; i++) ellipse(c, q.x, q.y, (8 + i * 6) * u, (5 + i * 4) * u, u, P.hush, (1 - seg(k, 0.8, 1)) * (0.8 - i * 0.2), Math.PI * 0.6, Math.PI * 1.4);
    },
    // a mirror or false promise: a pale pane glints and slides toward its target
    pane(c, e, k, A, t, still) {
      if (still) return;
      const u = A.u, a = A.pt('foe', 'core'), b = A.pt(e.p.to, 'chest');
      const s = ease(seg(k, 0, 0.9)), x = a.x + (b.x - a.x) * s, y = a.y + (b.y - a.y) * s;
      const w = 10 * u, h = 14 * u;
      R(c, x - w / 2, y - h / 2, w, h, '#e8eef8', 0.45 * (1 - seg(k, 0.85, 1)));
      line(c, { x: x - w / 2, y: y + h / 2 }, { x: x + w / 2, y: y - h / 2 }, u, '#ffffff', 0.9, { from: seg(k, 0, 0.6) * 0.7, to: seg(k, 0, 0.6) * 0.7 + 0.3, step: 1 });
    },
    // a companion's coordinated gesture joined to yours: a thread of light between two hands
    link(c, e, k, A, t, still) {
      const u = A.u, a = A.pt('pc', 'hand'), b = A.pt('comp', 'hand');
      const al = still ? 0.7 * (1 - seg(k, 0.7, 1)) : bell(k);
      line(c, a, b, u, P.warm, al, { step: 2, wob: still ? 0 : 3 * u, waves: 2, ph: t / 120 });
      if (!still) { spark(c, a.x, a.y, 3 * u, u, '#ffffff', al); spark(c, b.x, b.y, 3 * u, u, '#ffffff', al); }
    },
    // a small ink drop for a slip of the brush (−1 resolve): falls and spreads on the shoulder
    drop(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.to, 'head');
      if (still) return;
      const y = o.y - 18 * u + easeIn(seg(k, 0, 0.5)) * 14 * u;
      if (k < 0.5) R(c, o.x + 6 * u, y, 2 * u, 3 * u, P.ink, 1);
      else R(c, o.x + 4 * u, o.y - 4 * u, (2 + 4 * seg(k, 0.5, 0.7)) * u, u, P.ink, 1 - seg(k, 0.7, 1));
    },
    // the final knot: the creature's name comes back — soft motes rise from it
    release(c, e, k, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core');
      if (still) return;
      K().halo(c, o.x, o.y, Math.round(A.foeR * (0.8 + 0.4 * k)), '255,246,220', 0.35 * bell(k), 4);
      for (let i = 0; i < 12; i++) {
        const s = seg(k, hs(i, 1) * 0.4, hs(i, 1) * 0.4 + 0.6);
        if (s <= 0 || s >= 1) continue;
        const x = o.x + (hs(i, 2) - 0.5) * A.foeR * 1.6, y = o.y + A.foeR * 0.4 - ease(s) * 50 * u;
        R(c, x + Math.sin(t / 160 + i) * u, y, 2 * u, 2 * u, i % 3 ? P.light : P.paper, 1 - s);
      }
    },
    // revived: a companion helps the player up (a warm column of light)
    lift(c, e, k, A, t, still) {
      const u = A.u, o = A.pt(e.p.to, 'feet');
      if (still) return;
      K().halo(c, o.x, o.y - 20 * u, Math.round(22 * u), '255,236,180', 0.5 * bell(k), 3);
      for (let i = 0; i < 5; i++) R(c, o.x + (i - 2) * 5 * u, o.y - ease(seg(k, i * 0.1, 0.8)) * 40 * u, u, 3 * u, P.light, 1 - seg(k, 0.5, 1));
    },
  };

  // ---- persistent status marks (drawn every frame from the displayed state) -----------------
  const status = {
    // Heat on the creature: a restrained shimmer and a few embers per level; still: small flame pips
    heat(c, A, n, t, still) {
      const u = A.u, o = A.pt('foe', 'top'), core = A.pt('foe', 'core');
      if (still) {
        for (let i = 0; i < n; i++) { const x = o.x + A.foeR * 0.55 + i * 6 * u, y = o.y + 4 * u; R(c, x, y, 3 * u, 4 * u, P.ember, 1); R(c, x + u, y - 2 * u, u, 2 * u, P.ember2, 1); }
        return;
      }
      for (let i = 0; i < 2 + 2 * n; i++) {
        const per = 1600 + hs(i, 11) * 900, s = ((t + hs(i, 12) * per) % per) / per;
        const x = core.x + (hs(i, 13) - 0.5) * A.foeR * 1.3 + Math.sin(t / 240 + i) * 2 * u, y = o.y + A.foeR * 0.5 - s * (26 + 8 * n) * u;
        R(c, x, y, u, s < 0.4 ? 2 * u : u, i % 2 ? P.ember : P.ember2, 0.85 * bell(s));
      }
      // heat haze: three short wavering columns above it (brighter at level 2)
      c.globalAlpha = 0.18 + 0.1 * n;
      c.fillStyle = '#ffd0a0';
      for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) c.fillRect(Math.round(o.x + (j - 1) * 14 * u + Math.sin(t / 180 + i + j) * u), Math.round(o.y - 4 * u - i * 3 * u), u, 2 * u);
      c.globalAlpha = 1;
    },
    // Shroud: mist lying over its knots and its lower half (localized, drifting slowly)
    shroud(c, A, t, still) {
      const u = A.u, b = A.pt('foe', 'base'), o = A.pt('foe', 'core'), w = A.knotSpan || A.foeR;
      const drift = still ? 0 : Math.round(Math.sin(t / 1300) * 5 * u);
      puffs(c, [[b.x - w * 0.6, b.y - 2 * u, 16 * u, 0.42], [b.x + w * 0.55, b.y + 2 * u, 18 * u, 0.42], [b.x, b.y + 4 * u, 20 * u, 0.48],
        [o.x - A.foeR * 0.45, o.y + A.foeR * 0.25, 20 * u, 0.24], [o.x + A.foeR * 0.4, o.y + A.foeR * 0.3, 22 * u, 0.24]], u, 1, drift);
    },
    // Gathering: motes circling it slowly, and a held glow at the core
    charge(c, A, t, still) {
      const u = A.u, o = A.pt('foe', 'core');
      const r = A.foeR * 0.75;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + (still ? 0 : t / 1400);
        R(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r * 0.55, 2 * u, 2 * u, P.amber, still ? 0.9 : 0.6 + 0.3 * Math.sin(t / 300 + i));
      }
      if (!still) K().halo(c, o.x, o.y, Math.round(A.foeR * 0.25), '255,210,130', 0.18 + 0.08 * Math.sin(t / 400), 3);
    },
    // Hush over the party: a pale dotted arc above their heads and a small mute mark (ring + bar)
    hush(c, A, t, still) {
      const u = A.u, h = A.pt('party', 'head');
      const al = still ? 0.85 : 0.6 + 0.2 * Math.sin(t / 700);
      ellipse(c, h.x, h.y + 4 * u, A.partyW * 0.6, 10 * u, u, P.hush, al * 0.8, Math.PI * 1.08, Math.PI * 1.92);
      const x = h.x, y = h.y - 14 * u;
      ring(c, x, y, 5 * u, u, P.hush, al);
      line(c, { x: x - 4 * u, y: y + 4 * u }, { x: x + 4 * u, y: y - 4 * u }, u, P.hush, al, { step: 1 });
    },
    // a ward: seal tags standing in an arc in front of the ally, one tag per ward point
    wards(c, A, who, n, t, still) {
      if (!n) return;
      const u = A.u, o = A.pt(who, 'chest'), r = A.wardR;
      const shown = Math.min(n, 6);
      ellipse(c, o.x, o.y, r, r * 0.9, u, P.light, 0.22, -Math.PI * 0.85, Math.PI * 0.2);
      for (let i = 0; i < shown; i++) {
        const ang = -Math.PI * 0.8 + ((i + 0.5) / shown) * Math.PI * 0.95;
        const bob = still ? 0 : Math.round(Math.sin(t / 700 + i * 1.3) * 0.6) * u;
        tag(c, o.x + Math.cos(ang) * r, o.y + Math.sin(ang) * r * 0.9 + bob, u, 0.95, false);
      }
      if (n > 6) digits(c, o.x + r + 6 * u, o.y - r, String(n), u, P.light, 1);
    },
    // Harmony full: a faint thread of light between the two allies' hands
    harmony(c, A, t, still) {
      const u = A.u, a = A.pt('pc', 'hand'), b = A.pt('comp', 'hand');
      line(c, a, b, u, P.warm, still ? 0.55 : 0.35 + 0.2 * Math.sin(t / 500), { step: 3, wob: still ? 0 : 2 * u, waves: 2, ph: t / 400 });
    },
  };

  return { fx, status, digits, P, ease, bell, seg };
})();
