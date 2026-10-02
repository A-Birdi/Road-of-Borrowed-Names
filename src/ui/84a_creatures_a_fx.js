/* Creatures A — effects, the Shroud veil, and wiring (battle addendum §10, §18.4, §21.4).
 *
 * - Registers the families' deliveries (78b–78f queue them; the sequencer loads after them).
 * - The Shroud lifecycle, for EVERY creature that shrouds (not only these families): the veil
 *   is drawn in the creature's own material — a definition's `veil(o)` gives its colours and
 *   kind ('flour' powder, 'fog', 'pulp', 'scrap'); others keep the plain mist colours.
 *     application  fx.veilRelease (the material leaves the creature) and fx.mistRoll (it settles
 *                  over the knots), at the creature's own cue;
 *     persistence  status.shroud: a quiet localized veil over the knots and the lower body —
 *                  slow drift, never over the face, the target marks or the party;
 *     clearing     fx.mistPart (cued by the rules' 'light' result): the same material disperses.
 *   (This replaces the earlier generic mistRoll / mistPart / status.shroud drawings in
 *   84_battle_fx.js; names and signatures are unchanged.)
 * - Creature effects with their own names (wingWake, scaleShed, ashDrift, frostDust, …).
 * - Prewarm: when a creature of these families is first built in a battle, its action frames
 *   are built in idle time slices (bounded by the enemy-art cache), so the first action does not
 *   stall on generation.
 * Particles are deterministic (seeded by index), bounded, and absent with reduced motion except
 * where a still mark carries meaning. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, F = RB.battleFx, EA = RB.enemyArt;
  const fx = F.fx, status = F.status;
  const K = () => RB.pxkit;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (k) => 1 - Math.pow(1 - clamp01(k), 3);
  const easeIn = (k) => Math.pow(clamp01(k), 2);
  const bell = (k) => Math.sin(Math.PI * clamp01(k));
  const seg = (k, a, b) => clamp01((k - a) / (b - a));
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  function R(c, x, y, w, h, col, a) {
    if (a != null) { if (a <= 0.01) return; c.globalAlpha = Math.min(1, a); }
    if (col) c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    if (a != null) c.globalAlpha = 1;
  }
  function disc(c, x, y, r, ry, col, a) {
    if (a <= 0.01) return;
    c.globalAlpha = Math.min(1, a);
    c.fillStyle = col;
    K().disc(c, x, y, Math.max(1, Math.round(r)), Math.max(1, Math.round(ry)));
    c.globalAlpha = 1;
  }

  // ---- deliveries ----------------------------------------------------------------------------
  if (RB.battleSeq && RB.battleSeq.addDelivery) for (const [art, kind, fn] of A.queue) RB.battleSeq.addDelivery(art, kind, fn);

  // ---- which creature an effect or mark is on, and its veil material --------------------------
  const MIST = { kind: 'mist', cols: ['#dfe5ee', '#eef2f6', '#c8d0dc'] };
  function enemyAt(i) {
    try {
      const ids = RB.combat && RB.combat.members ? RB.combat.members() : null;
      const id = ids && ids[i || 0];
      return id ? RB.content.enemies[id] : null;
    } catch (e) { return null; }
  }
  function veilOf(i) {
    const e = enemyAt(i), spec = e && EA.P[e.art];
    if (spec && typeof spec.veil === 'function') { try { return spec.veil(e.artOpts || {}) || MIST; } catch (err) { return MIST; } }
    return MIST;
  }
  // a status mark gets the anchor helper only: find its creature by its live anchor
  function foeIndexOf(Ah) {
    try {
      const S = RB.battleStage, L = S.lay();
      if (!L || !L.foes || L.foes.length < 2) return 0;
      const p = Ah.pt('foe', 'core');
      for (let i = 0; i < L.foes.length; i++) { const q = S.anchor('foe:' + i, 'core'); if (q.x === p.x && q.y === p.y) return i; }
    } catch (e) { /* the lead */ }
    return 0;
  }
  A.veilOf = veilOf;

  // The veil's puffs: stepped discs in the material's colours, with small flecks for powder,
  // pulp or scraps. pts: [x, y, r, alpha]; drift (px) moves them sideways.
  function veil(c, V, pts, u, alpha, drift, t, still) {
    for (let j = 0; j < pts.length; j++) {
      const [x, y, r, a] = pts[j];
      disc(c, x + (drift || 0), y, r, r * 0.55, V.cols[j % 2 ? 1 : 0], a * alpha);
      disc(c, x + (drift || 0) + r * 0.25, y + r * 0.2, r * 0.6, r * 0.3, V.cols[2], a * alpha * 0.7);
    }
    if (V.kind === 'mist' || V.kind === 'fog') return;
    // flecks: flour specks, wet pulp or paper scraps resting in the veil, turning slowly
    const n = Math.min(14, pts.length * 3);
    for (let i = 0; i < n; i++) {
      const p = pts[i % pts.length];
      const ox = (hs(i, 3) - 0.5) * p[2] * 1.8, oy = (hs(i, 4) - 0.5) * p[2] * 0.8;
      const bob = still ? 0 : Math.round(Math.sin(t / 900 + i * 1.7) * 1) * u;
      const w = V.kind === 'scrap' ? 3 * u : V.kind === 'pulp' ? 2 * u : u;
      R(c, p[0] + ox + (drift || 0), p[1] + oy + bob, w, V.kind === 'scrap' ? 2 * u : u, i % 3 ? V.cols[1] : V.cols[0], 0.85 * alpha);
    }
  }
  // the persistent veil's layout around a creature
  function veilPts(Ah) {
    const u = Ah.u, b = Ah.pt('foe', 'base'), o = Ah.pt('foe', 'core'), w = Ah.knotSpan || Ah.foeR, r = Ah.foeR;
    return [[b.x - w * 0.6, b.y - 2 * u, 15 * u, 0.42], [b.x + w * 0.55, b.y + 2 * u, 17 * u, 0.42], [b.x, b.y + 4 * u, 19 * u, 0.46],
      [o.x - r * 0.45, o.y + r * 0.3, 18 * u, 0.22], [o.x + r * 0.42, o.y + r * 0.34, 20 * u, 0.22]];
  }

  // persistence: quiet, localized (over its knots and lower body), drifting slowly
  status.shroud = function (c, Ah, t, still) {
    const V = veilOf(foeIndexOf(Ah));
    const drift = still ? 0 : Math.round(Math.sin(t / 1300) * 5 * Ah.u);
    veil(c, V, veilPts(Ah), Ah.u, 1, drift, t, still);
  };
  // application, part 1: the material leaves the creature (its own body or wings) and spreads
  fx.veilRelease = function (c, e, k, Ah, t, still) {
    const V = veilOf(e.p.foe), u = Ah.u, o = Ah.pt('foe', 'core'), r = Ah.foeR;
    if (still) { veil(c, V, [[o.x, o.y + r * 0.4, 16 * u, 0.4]], u, 1 - seg(k, 0.6, 1), 0, t, true); return; }
    const s = ease(seg(k, 0, 0.7)), fade = 1 - seg(k, 0.75, 1);
    // a ring of puffs bursting from the wing margins / body edge, sinking as it spreads
    for (let i = 0; i < 9; i++) {
      const ang = -Math.PI * 0.95 + (i / 8) * Math.PI * 1.9, rr = r * (0.55 + 0.6 * s);
      const x = o.x + Math.cos(ang) * rr, y = o.y + Math.sin(ang) * rr * 0.6 + easeIn(seg(k, 0.2, 1)) * 26 * u;
      disc(c, x, y, (5 + 7 * s) * u, (3 + 4 * s) * u, V.cols[i % 2], 0.55 * fade * bell(seg(k, 0, 0.9)) + 0.15 * fade);
    }
    // powder falling in short streams
    for (let i = 0; i < 16; i++) {
      const x0 = o.x + (hs(i, 1) - 0.5) * r * 2.1, s2 = seg(k, hs(i, 2) * 0.3, hs(i, 2) * 0.3 + 0.7);
      if (s2 <= 0 || s2 >= 1) continue;
      const y = o.y - r * 0.1 + ease(s2) * (r * 0.7 + 20 * u);
      R(c, x0 + Math.sin(t / 140 + i) * u, y, u * (i % 3 ? 1 : 2), u, V.cols[i % 3 === 2 ? 2 : 0], 0.9 * (1 - s2));
    }
  };
  // application, part 2: the released material settles over the knots (where the veil stays)
  fx.mistRoll = function (c, e, k, Ah, t, still) {
    if (still) return;
    const V = veilOf(e.p.foe), u = Ah.u, o = Ah.pt('foe', 'core');
    const pts = veilPts(Ah), s = ease(k), fade = 1 - seg(k, 0.75, 1);
    const roll = pts.map(([x, y, r, a]) => [o.x + (x - o.x) * s, o.y + (y - o.y) * s, r * (0.6 + 0.4 * s), a * 1.1]);
    veil(c, V, roll, u, fade, 0, t, false);
  };
  // clearing: light or wind (or a companion's clearing) disperses the same material outward
  fx.mistPart = function (c, e, k, Ah, t, still) {
    const V = veilOf(e.p.foe), u = Ah.u;
    const pts = veilPts(Ah), b = Ah.pt('foe', 'base');
    if (still) { veil(c, V, pts, u, 0.6 * (1 - seg(k, 0.4, 1)), 0, t, true); return; }
    const s = ease(k), fade = 1 - seg(k, 0.35, 1);
    const out = pts.map(([x, y, r, a], j) => {
      const dx = x - b.x, side = dx === 0 ? (j % 2 ? 1 : -1) : Math.sign(dx);
      return [x + side * (24 + 40 * s) * u * s, y - (8 + j * 3) * u * s, r * (1 + 0.5 * s), a];
    });
    veil(c, V, out, u, fade, 0, t, false);
  };

  // ---- creature effects -------------------------------------------------------------------------
  // the swoop's wake: a few wing scales shed along its path (behind the creature, toward home)
  fx.wingWake = function (c, e, k, Ah, t, still) {
    if (still) return;
    const V = veilOf(e.p.foe), u = Ah.u, o = Ah.pt('foe', 'core');
    for (let i = 0; i < 8; i++) {
      const s = seg(k, i * 0.07, i * 0.07 + 0.55);
      if (s <= 0 || s >= 1) continue;
      const x = o.x + (12 + i * 5) * u + (hs(i, 9) - 0.5) * 10 * u, y = o.y - (4 - i * 2) * u + easeIn(s) * 14 * u;
      R(c, x, y, u, u, V.cols[i % 2], 0.8 * (1 - s));
    }
  };
  // contact: a small burst of wing scales where the moth meets its target (or the seal before it)
  fx.scaleShed = function (c, e, k, Ah, t, still) {
    const V = veilOf(e.p.foe), u = Ah.u, ch = Ah.pt(e.p.to || 'pc', 'chest');
    let x = ch.x, y = ch.y;
    if (e.p.seal) { const r = Ah.wardR; x += Math.cos(-Math.PI * 0.25) * r; y += Math.sin(-Math.PI * 0.25) * r * 0.9; }
    else { x += 6 * u; y -= 6 * u; }
    if (still) { disc(c, x, y, 6 * u, 4 * u, V.cols[0], 0.6 * (1 - seg(k, 0.5, 1))); return; }
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI * 0.15 - (i / 9) * Math.PI * 0.9 + (hs(i, 5) - 0.5) * 0.4, r = ease(k) * (8 + hs(i, 6) * 14) * u;
      R(c, x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.8 + easeIn(k) * 10 * u, u * (i % 3 ? 1 : 2), u, V.cols[i % 3], 1 - k);
    }
    disc(c, x, y, (3 + 5 * ease(k)) * u, (2 + 3 * ease(k)) * u, V.cols[1], 0.35 * (1 - k));
  };
  // the Ash Moth's gust carries ash across the party (follows the shared gust strokes)
  fx.ashDrift = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, o = Ah.pt('party', 'chest'), f = Ah.pt('foe', 'core');
    for (let i = 0; i < 14; i++) {
      const s = seg(k, hs(i, 1) * 0.3, hs(i, 1) * 0.3 + 0.7);
      if (s <= 0 || s >= 1) continue;
      const y0 = f.y - 10 * u + (hs(i, 2) - 0.5) * 50 * u, y1 = o.y + (hs(i, 3) - 0.5) * 60 * u;
      const x = f.x + (o.x - 50 * u - f.x) * ease(s), y = y0 + (y1 - y0) * s + Math.sin(t / 90 + i) * 2 * u;
      R(c, x, y, i % 3 ? u : 2 * u, u, i % 2 ? '#8a8480' : '#c8c0b8', 0.85 * (1 - s));
    }
  };
  // cold dust fanned from the wings to one target
  fx.frostDust = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, a = Ah.pt('foe', 'core'), b = Ah.pt(e.p.to || 'pc', 'chest');
    for (let i = 0; i < 18; i++) {
      const s = seg(k, hs(i, 1) * 0.35, hs(i, 1) * 0.35 + 0.65);
      if (s <= 0 || s >= 1) continue;
      const sp = (hs(i, 2) - 0.5) * 30 * u * (1 - s);
      const x = a.x + (b.x - a.x) * ease(s), y = a.y + (b.y - a.y) * ease(s) + sp - bell(s) * 14 * u;
      R(c, x, y, u * (i % 4 ? 1 : 2), u, i % 3 ? '#e4f2ff' : '#ffffff', 0.9 * (1 - s * s));
    }
  };

  // the creature's own colour (its palette), for effects that carry its material
  function colOf(i, fallback) { const e = enemyAt(i); return (e && e.artOpts && e.artOpts.col) || fallback || '#c8d4e0'; }
  // a wisp's dart: sparks of its light left hanging along the path, fading
  fx.wispTrail = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, o = Ah.pt('foe', 'core'), col = colOf(e.p.foe, '#cfe8ff');
    for (let i = 0; i < 9; i++) {
      const s = seg(k, i * 0.06, i * 0.06 + 0.5);
      if (s <= 0 || s >= 1) continue;
      const x = o.x + (14 + i * 4) * u + Math.sin(i * 2.1) * 4 * u, y = o.y - (6 - i) * u + Math.cos(i * 1.7) * 3 * u;
      R(c, x - u, y - u, 2 * u, 2 * u, i % 3 ? col : '#ffffff', 0.85 * (1 - s));
    }
  };
  // an echo's volley: its shards fly out on slightly different arcs and arrive together at contact
  // (at the seal in front of the target when a ward meets them)
  fx.shardVolley = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, a = Ah.pt('foe', 'core'), ch = Ah.pt(e.p.to || 'pc', 'chest'), col = e.p.col || colOf(e.p.foe, '#a8c8d8');
    let bx = ch.x, by = ch.y;
    if (e.p.seal) { const r = Ah.wardR; bx += Math.cos(-Math.PI * 0.25) * r; by += Math.sin(-Math.PI * 0.25) * r * 0.9; }
    const fly = seg(k, 0, 0.85);
    for (let i = 0; i < 6; i++) {
      const s = ease(clamp01(fly * 1.05 - i * 0.03)), bend = (i - 2.5) * 10 * u;
      const mx = (a.x + bx) / 2 - bend * 0.6, my = (a.y + by) / 2 - 20 * u + bend;
      const x = (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * mx + s * s * bx, y = (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * my + s * s * by;
      const al = k < 0.85 ? 1 : 1 - seg(k, 0.85, 1);
      R(c, x - 2 * u, y - u, 4 * u, 2 * u, '#1c2a34', al * 0.8);
      R(c, x - 2 * u + u, y - u, 2 * u, u, col, al);
    }
  };
  // rings travelling out from an echo (its Heat: warm and quick; its Plea: soft)
  fx.echoRings = function (c, e, k, Ah, t, still) {
    const u = Ah.u, o = Ah.pt('foe', 'core'), col = e.p.warm ? '#f0a060' : colOf(e.p.foe, '#a8c8d8');
    if (still) { c.globalAlpha = 0.5 * (1 - seg(k, 0.5, 1)); c.fillStyle = col; K().ring(c, o.x, o.y, Math.round(Ah.foeR * 1.1), u); c.globalAlpha = 1; return; }
    for (let i = 0; i < 3; i++) {
      const s = seg(k, i * 0.18, 0.6 + i * 0.13);
      if (s <= 0 || s >= 1) continue;
      c.globalAlpha = 0.7 * (1 - s); c.fillStyle = col;
      K().ring(c, o.x, o.y, Math.round(Ah.foeR * (0.8 + 1.3 * ease(s))), u);
    }
    c.globalAlpha = 1;
  };

  // where a blow lands: the target's chest, or the seal raised in front of it
  function landAt(Ah, e) {
    const ch = Ah.pt(e.p.to || 'pc', 'chest');
    if (!e.p.seal) return { x: ch.x, y: ch.y };
    const r = Ah.wardR;
    return { x: ch.x + Math.cos(-Math.PI * 0.25) * r, y: ch.y + Math.sin(-Math.PI * 0.25) * r * 0.9 };
  }
  // a blot's lash: ink flicked off its tendril, bursting where it lands
  fx.inkLash = function (c, e, k, Ah, t, still) {
    const u = Ah.u, b = landAt(Ah, e), col = colOf(e.p.foe, '#2a2a44');
    if (still) { disc(c, b.x, b.y, 6 * u, 4 * u, col, 0.8 * (1 - seg(k, 0.5, 1))); return; }
    const a = Ah.pt('foe', 'core'), fly = seg(k, 0, 0.45), hit = seg(k, 0.45, 1);
    if (fly < 1) for (let i = 0; i < 5; i++) {
      const s = clamp01(fly - i * 0.05);
      if (s <= 0) continue;
      const x = a.x + (b.x - a.x) * ease(s), y = a.y + (b.y - a.y) * ease(s) - bell(s) * 16 * u;
      R(c, x - u, y - u, 3 * u - i * 0.3 * u, 2 * u, i ? col : '#c8ccf0', 1);
    }
    if (hit > 0) for (let i = 0; i < 9; i++) {
      const ang = -Math.PI * 0.1 - (i / 8) * Math.PI * 1.1, r = ease(hit) * (8 + hs(i, 4) * 12) * u;
      disc(c, b.x + Math.cos(ang) * r, b.y + Math.sin(ang) * r * 0.8 + easeIn(hit) * 10 * u, (2 - hit) * u + u * 0.5, (1.5 - hit) * u + u * 0.5, i % 3 ? col : '#c8ccf0', 1 - hit);
    }
  };
  // a blot's surge: a low wave of ink running along the ground under the party (or a hush ring)
  fx.inkWave = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, f = Ah.pt('foe', 'base'), col = colOf(e.p.foe, '#2a2a44');
    const who = e.p.who && e.p.who.length ? e.p.who : ['pc'];
    const end = Ah.pt(who[who.length - 1], 'feet'), s = ease(k), fade = 1 - seg(k, 0.75, 1);
    const x = f.x + (end.x - 30 * u - f.x) * s, y = f.y + (end.y - f.y) * s;
    for (let i = 0; i < 7; i++) {
      const xx = x + (i - 3) * 9 * u, h = (4 + 3 * Math.sin(i + k * 9)) * u * (e.p.hush ? 0.6 : 1);
      disc(c, xx, y - h * 0.4, 8 * u, h, e.p.hush ? '#4a4870' : col, (e.p.hush ? 0.35 : 0.7) * fade);
    }
    if (!e.p.hush) for (let i = 0; i < 6; i++) R(c, x + (i - 3) * 11 * u, y - (8 + (i % 3) * 3) * u - bell(seg(k, i * 0.05, 0.8)) * 6 * u, 2 * u, u, '#c8ccf0', 0.8 * fade);
  };
  // a crab's claw snapping shut at its target: two closing arcs and chips of shell-grit
  fx.clawSnap = function (c, e, k, Ah, t, still) {
    const u = Ah.u, b = landAt(Ah, e);
    if (still) { R(c, b.x - 5 * u, b.y - u, 10 * u, 2 * u, '#f0e0c8', 0.8 * (1 - seg(k, 0.5, 1))); return; }
    const sh = 1 - ease(seg(k, 0, 0.3)), fade = 1 - seg(k, 0.4, 1);
    for (const sgn of [-1, 1]) for (let i = 0; i < 5; i++) {
      const a = sgn * (0.5 + sh * 0.9) + (i - 2) * 0.12;
      R(c, b.x + 10 * u - Math.cos(a) * 12 * u, b.y + Math.sin(a) * 10 * u, 2 * u, 2 * u, '#f0e0c8', fade);
    }
    for (let i = 0; i < 6; i++) { const r = ease(seg(k, 0.25, 1)) * (8 + hs(i, 3) * 10) * u, a = -Math.PI * 0.2 - i * 0.5; R(c, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r + easeIn(seg(k, 0.25, 1)) * 8 * u, u, u, '#d8c0a0', 1 - seg(k, 0.3, 1)); }
  };
  // water (or the Ledger Heap's ink-wash) rolling across the party from the creature's side
  fx.tideWash = function (c, e, k, Ah, t, still) {
    const u = Ah.u, who = e.p.who && e.p.who.length ? e.p.who : ['pc'];
    const cols = e.p.ink ? ['#3a4a6a', '#8aa0c0', '#e8e0cc'] : ['#4a88c0', '#8cc8f0', '#e8f6ff'];
    if (still) { for (const w of who) { const o = Ah.pt(w, 'feet'); disc(c, o.x, o.y - 4 * u, 16 * u, 4 * u, cols[1], 0.6 * (1 - seg(k, 0.6, 1))); } return; }
    const f = Ah.pt('foe', 'base'), last = Ah.pt(who[who.length - 1], 'feet'), s = ease(seg(k, 0, 0.8)), fade = 1 - seg(k, 0.75, 1);
    const front = f.x + (last.x - 40 * u - f.x) * s, y0 = f.y + (last.y - f.y) * s;
    for (let i = 0; i < 9; i++) {
      const x = front + i * 12 * u, crest = (10 + 6 * Math.sin(i * 1.3 + k * 10)) * u * (1 - i / 12);
      disc(c, x, y0 - crest * 0.5, 9 * u, crest, cols[0], 0.75 * fade);
      disc(c, x - 2 * u, y0 - crest * 0.9, 6 * u, crest * 0.45, cols[1], 0.85 * fade);
      R(c, x - 3 * u, y0 - crest * 1.3, 4 * u, u, cols[2], fade);
    }
    for (let i = 0; i < 8; i++) { const x = front + (hs(i, 2) - 0.2) * 30 * u, y = y0 - (16 + hs(i, 3) * 20) * u * bell(seg(k, 0.1 + i * 0.04, 0.9)); R(c, x, y, 2 * u, 2 * u, cols[2], 0.9 * fade); }
    if (e.p.scraps) for (let i = 0; i < 6; i++) { const x = front + (hs(i, 7) - 0.3) * 40 * u, y = y0 - (10 + hs(i, 8) * 26) * u * bell(seg(k, 0.15 + i * 0.05, 0.95)); R(c, x, y, 4 * u, 3 * u, '#e8e0cc', 0.9 * fade); R(c, x + u, y + u, 2 * u, u, '#5a5468', 0.7 * fade); }
  };
  // a golem's blow: stone dust and grit thrown up where it lands
  fx.stoneDust = function (c, e, k, Ah, t, still) {
    const u = Ah.u, b = landAt(Ah, e), col = colOf(e.p.foe, '#9a9a7a');
    if (still) { disc(c, b.x, b.y, 10 * u, 5 * u, '#b8b0a0', 0.6 * (1 - seg(k, 0.5, 1))); return; }
    for (let i = 0; i < 5; i++) disc(c, b.x + (i - 2) * 7 * u, b.y + 4 * u - ease(k) * (6 + i % 3 * 4) * u, (4 + 6 * ease(k)) * u, (3 + 3 * ease(k)) * u, '#c8c0b0', 0.45 * (1 - k));
    for (let i = 0; i < 8; i++) { const a = -Math.PI * 0.15 - i * 0.36, r = ease(k) * (10 + hs(i, 5) * 14) * u; R(c, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r * 0.7 + easeIn(k) * 14 * u, 2 * u, 2 * u, i % 2 ? col : '#5a564a', 1 - k); }
  };
  // ice: shards of frost flying from the creature to one target
  fx.iceShard = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, a = Ah.pt('foe', 'core'), b = Ah.pt(e.p.to || 'pc', 'chest');
    for (let i = 0; i < 4; i++) {
      const s = ease(clamp01(seg(k, i * 0.06, 0.85 + i * 0.03)));
      if (s <= 0 || s >= 1) continue;
      const x = a.x + (b.x - a.x) * s + (i - 1.5) * 4 * u, y = a.y + (b.y - a.y) * s - bell(s) * (6 + i * 3) * u;
      R(c, x - 3 * u, y - u, 6 * u, 2 * u, '#c8e4f8', 1);
      R(c, x - 2 * u, y - u, 3 * u, u, '#ffffff', 1);
    }
  };

  // paper's edge: two quick slashes across the target (a crane's beak, a letter's strips)
  fx.paperCut = function (c, e, k, Ah, t, still) {
    const u = Ah.u, b = landAt(Ah, e);
    if (still) { for (let i = 0; i < 6; i++) R(c, b.x - 8 * u + i * 3 * u, b.y - 6 * u + i * 2 * u, 2 * u, u, '#f4ecd8', 0.8 * (1 - seg(k, 0.5, 1))); return; }
    for (let s = 0; s < 2; s++) {
      const kk = seg(k, s * 0.18, 0.55 + s * 0.18), fade = 1 - seg(k, 0.55 + s * 0.18, 1);
      if (kk <= 0) continue;
      const x0 = b.x - 14 * u, y0 = b.y - 12 * u + s * 8 * u, len = 28 * u;
      for (let i = 0; i <= 10 * kk; i++) R(c, x0 + i * len / 10, y0 + i * len / 16, 2 * u, u, i % 4 ? '#fffaf0' : '#3a3450', fade);
    }
    for (let i = 0; i < 5; i++) { const s = seg(k, 0.2, 1); R(c, b.x + (hs(i, 1) - 0.5) * 24 * u, b.y + (hs(i, 2) - 0.5) * 10 * u + easeIn(s) * 16 * u, 3 * u, 2 * u, '#f4ecd8', 1 - s); }
  };
  // the crane's gust carries scraps of paper over the party
  fx.paperFlurry = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, o = Ah.pt('party', 'chest'), f = Ah.pt('foe', 'core');
    for (let i = 0; i < 10; i++) {
      const s = seg(k, hs(i, 1) * 0.3, hs(i, 1) * 0.3 + 0.7);
      if (s <= 0 || s >= 1) continue;
      const x = f.x + (o.x - 60 * u - f.x) * ease(s), y = f.y - 20 * u + (o.y + (hs(i, 3) - 0.5) * 50 * u - f.y + 20 * u) * s + Math.sin(t / 80 + i) * 3 * u;
      const tw = Math.sin(t / 60 + i * 2) > 0;
      R(c, x, y, (tw ? 3 : 1) * u, 2 * u, i % 3 ? '#f2eee2' : '#c8c0a8', 0.9 * (1 - s * 0.6));
    }
  };
  // a clerk's seal: a vermilion square stamped on its target (or on the seal before it, or on a knot)
  fx.stampSeal = function (c, e, k, Ah, t, still) {
    const u = Ah.u, b = e.p.knot != null ? Ah.pt('knot:' + e.p.knot, 'core') : landAt(Ah, e);
    const sz = Math.round((e.p.knot != null ? 6 : 9) * u);
    const pop = still ? 1 : 1 + 0.4 * (1 - ease(seg(k, 0, 0.25)));
    const al = still ? 0.9 * (1 - seg(k, 0.6, 1)) : 1 - seg(k, 0.55, 1);
    const w = Math.round(sz * pop);
    R(c, b.x - w / 2 - u, b.y - w / 2 - u, w + 2 * u, w + 2 * u, '#5a2018', al * 0.8);
    R(c, b.x - w / 2, b.y - w / 2, w, w, '#c8503a', al);
    R(c, b.x - w / 2 + u, b.y - w / 2 + u, w - 2 * u, u, '#e88a6a', al);
    R(c, b.x - u, b.y - w / 2 + 2 * u, 2 * u, w - 4 * u, '#f4ecd8', al * 0.8);
    if (!still && k < 0.3) c.globalAlpha = 1;
  };

  // the Kiln Warden's mouth (its firebox, low on the dome, on the party's side)
  function mouthOf(Ah) { const o = Ah.pt('foe', 'core'); return { x: o.x - 14 * Ah.u, y: o.y + Ah.foeR * 0.35 }; }
  // a ball of fire from its mouth to one of you (or the seal before you), trailing sparks
  fx.kilnBolt = function (c, e, k, Ah, t, still) {
    const u = Ah.u, a = mouthOf(Ah), b = landAt(Ah, e);
    if (still) { disc(c, b.x, b.y, 7 * u, 6 * u, '#f0902e', 0.8 * (1 - seg(k, 0.6, 1))); return; }
    const s = ease(seg(k, 0, 0.95)), x = a.x + (b.x - a.x) * s, y = a.y + (b.y - a.y) * s - bell(s) * 22 * u;
    for (let i = 1; i < 6; i++) { const s2 = Math.max(0, s - i * 0.06), x2 = a.x + (b.x - a.x) * s2, y2 = a.y + (b.y - a.y) * s2 - bell(s2) * 22 * u; R(c, x2 - u, y2 - u, 2 * u, 2 * u, i % 2 ? '#f08a48' : '#ffd070', 0.9 - i * 0.14); }
    disc(c, x, y, 7 * u, 6 * u, '#d8502a', 0.95);
    disc(c, x - u, y - u, 5 * u, 4 * u, '#f0902e', 1);
    disc(c, x - 2 * u, y - 2 * u, 2 * u, 2 * u, '#fff0b8', 1);
  };
  // a sweep of flame from its mouth across both of you
  fx.kilnBreath = function (c, e, k, Ah, t, still) {
    const u = Ah.u, a = mouthOf(Ah), who = e.p.who && e.p.who.length ? e.p.who : ['pc'];
    const pts = who.map((w) => Ah.pt(w, 'chest'));
    if (still) { for (const p of pts) disc(c, p.x, p.y, 10 * u, 6 * u, '#f0902e', 0.6 * (1 - seg(k, 0.6, 1))); return; }
    const sw = ease(seg(k, 0, 0.75)), fade = 1 - seg(k, 0.75, 1);
    const p0 = pts[0], p1 = pts[pts.length - 1];
    const tx = p0.x + (p1.x - p0.x) * sw - 10 * u * sw, ty = p0.y + (p1.y - p0.y) * sw;
    for (let i = 0; i < 12; i++) {
      const s = i / 11, x = a.x + (tx - a.x) * s, y = a.y + (ty - a.y) * s - Math.sin(s * Math.PI) * 10 * u + Math.sin(t / 60 + i) * 2 * u;
      const r = (3 + s * 9) * u;
      disc(c, x, y, r, r * 0.7, i % 3 === 0 ? '#ffd070' : i % 3 === 1 ? '#f0902e' : '#d8502a', 0.8 * fade);
    }
  };
  // stoking: heat shimmer and sparks rising from the dome and chimney
  fx.kilnStoke = function (c, e, k, Ah, t, still) {
    if (still) return;
    const u = Ah.u, o = Ah.pt('foe', 'top');
    for (let i = 0; i < 12; i++) {
      const s = seg(k, hs(i, 1) * 0.4, hs(i, 1) * 0.4 + 0.6);
      if (s <= 0 || s >= 1) continue;
      const x = o.x + (hs(i, 2) - 0.5) * Ah.foeR * 1.3 + Math.sin(t / 100 + i) * 2 * u, y = o.y + Ah.foeR * 0.4 - ease(s) * (24 + hs(i, 3) * 30) * u;
      R(c, x, y, u, 2 * u, i % 2 ? '#ffd070' : '#f08a48', 1 - s);
    }
    K().halo(c, o.x, o.y + Ah.foeR * 0.6, Math.round(Ah.foeR * 0.9), '255,150,80', 0.25 * bell(k), 3);
  };

  // ---- the audit (§9.1, §4 Phase D): every enemy id of these families ---------------------------
  // disposition: 'upgraded' (the family's revised rig, its own palette, every move it uses
  // delivered by the creature, authored rest and reactions), 'meets' (already at the standard,
  // re-verified) or 'incomplete' (said plainly). Evidence: docs/battle/creatures_a.md.
  const AUD = [
    ['rw.dustmoth', 'moth', 'upgraded', 'Flour Moth (the proof): swoop Strike (hit / ward / softened / met air), Shroud in flour; interior (mill) and exterior (mill road) placements keep their own lines and backdrops'],
    ['atlas.moth', 'moth', 'upgraded', 'Margin Moth (Atlas palette): swoop Strike, Shroud in its paper-dust'],
    ['co.moth', 'moth', 'upgraded', 'Ash Moth: swoop Strike; Gust as a rearing, fanning downstroke shaking ash'],
    ['sa.moth', 'moth', 'upgraded', 'Catalogue Moth: swoop Strike; Gathering (wings folded, trembling); Chill (a fanning beat of frost dust)'],
    ['sb.moth', 'moth', 'upgraded', 'Chart Moth (dark wings, pale marks): swoop Strike; Sweep (low wide pass); Re-tying with its forelegs'],
    ['sg.moth', 'moth', 'upgraded', 'Postmark Moth: swoop Strike; Gathering'],
    ['rw.reedling', 'wisp', 'upgraded', 'Reedling: comet-dart Strike; Sweep (coil and whirl over both)'],
    ['co.ember', 'wisp', 'upgraded', 'Ember Wisp: comet-dart Strike; Heat (a crown of flame, the aura swelling)'],
    ['lf.mote', 'wisp', 'upgraded', 'Hush Mote: comet-dart Strike; Shroud (breathes its fog out, in its lilac light)'],
    ['sg.fogwisp', 'wisp', 'upgraded', 'Harbour Fog: comet-dart Strike; Shroud (harbour fog)'],
    ['sb.wisp', 'wisp', 'upgraded', 'Frost Wisp: Chill (frost breath at one); Re-tying with its tail-tip'],
    ['atlas.stray', 'wisp', 'upgraded', 'Stray Name (Atlas): comet-dart Strike; Plea (dims, drifts nearer, a note)'],
    ['rw.mill_echo', 'echo', 'upgraded', 'The Mill Echo (Chapter 1 boss): shard-volley Strike, Mirror pane, Heat (rings warm and quicken), Plea; drawn at the family\'s scale (no phase-specific art)'],
    ['sa.echo', 'echo', 'upgraded', 'Shelved Echo: shard-volley Strike, Mirror, Re-tying (shards relock)'],
    ['atlas.echo', 'echo', 'upgraded', 'Road Echo (Atlas): shard-volley Strike, Mirror'],
    ['rw.inkblot', 'blot', 'upgraded', 'Runoff Blot: tendril-lash Strike, ground-surge Sweep, Re-tying strand'],
    ['co.soot', 'blot', 'upgraded', 'Smoke Blot: Strike, Sweep, Re-tying'],
    ['lf.blot', 'blot', 'upgraded', 'Silence Blot: Strike; Silence (presses shut and flattens; a hush spreads)'],
    ['sg.blot', 'blot', 'upgraded', 'Runaway Ink: Sweep, Re-tying'],
    ['atlas.blot', 'blot', 'upgraded', 'Blotted Line (Atlas): Strike, Re-tying'],
    ['sg.crab', 'crab', 'upgraded', 'Label Crab: sidle, thrust-and-snap Strike; snip-and-tuck Re-tying'],
    ['atlas.crab', 'crab', 'upgraded', 'Rock-pool Crab (Atlas): Strike; Flood (claws raised and slammed down; a wash over both)'],
    ['sa.crane', 'crane', 'upgraded', 'Paper Crane: beak-dart Strike, Gust (three strokes, a paper flurry); now faces the party'],
    ['sg.crane', 'crane', 'upgraded', 'Soggy Paper Crane: Strike; Shroud (damp pulp shaken into a mist)'],
    ['atlas.crane', 'crane', 'upgraded', 'Unfolded Crane (Atlas): Gust; Sweep (a low slicing pass)'],
    ['co.golem', 'golem', 'upgraded', 'Glass Golem: overhead hammer Strike, Gathering, Re-tying (a stone set back)'],
    ['sb.golem', 'golem', 'upgraded', 'Icicle Warden: Strike, Gathering, Chill (rimed fist, ice shards)'],
    ['sg.golem', 'golem', 'upgraded', 'Ledger Heap: Strike, Gathering, Flood (cracks open, arms wide)'],
    ['atlas.milestone', 'golem', 'upgraded', 'Mossy Milestone (Atlas): Strike, Gathering'],
    ['atlas.gate', 'golem', 'upgraded', 'The Half-road Gatekeeper (Atlas boss): Strike, Gathering, Re-tying, Plea (kneels, holds out its hand); family scale'],
    ['sg.letter', 'sg_letter', 'upgraded', 'Undelivered Letter: Plea (a note slides out to you), Sweep (edge-on spin, strips lashing); definition moved from content/ch2/01_art.js'],
    ['sg.tideclerk', 'clerk', 'upgraded', 'The Tide Clerk (Chapter 2 boss): stamp Strike, Lie, Mirror, Gathering, Flood (tide of water and paper), Shroud (paper-strewn fog), Plea; now faces the party'],
    ['atlas.toll', 'clerk', 'upgraded', 'False Gatekeeper (Atlas): stamp Strike, Lie, Gathering'],
    ['atlas.echotoll', 'clerk', 'upgraded', 'Echoing Gatekeeper (Atlas): stamp Strike, Lie, Mirror'],
    ['lf.stamp', 'clerk', 'upgraded', 'Consent Stamp: stamp Strike, Lie, Re-tying (a small exact stamp)'],
    ['co.warden', 'warden', 'upgraded', 'The Kiln Warden (Chapter 3 boss): fire-belch Strike, flame-breath Sweep, Heat (stoking), Gathering (mortar glow), Mirror (glaze shimmer), Plea'],
  ];
  for (const [id, art, d, note] of AUD) A.auditEnemy(id, art, d, note);

  // ---- prewarm --------------------------------------------------------------------------------
  // The acts a creature will need (its moves' frame sets, then the reactions), built in idle slices
  // after its first frame appears in a battle. Bounded: at most PREWARM_CAP frames per creature,
  // and the enemy-art cache itself holds a fixed number of frames (LRU).
  const PREWARM_CAP = 44;
  const pending = [], seen = new Map();
  let tick = null, cv1 = null;
  const kindsOf = (e) => {
    const ks = new Set();
    const add = (k) => ks.add(String(k).split(':')[0]);
    (e.pattern || []).forEach(add);
    (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add));
    Object.keys(e.intents || {}).forEach(add);
    return [...ks];
  };
  const FAMILY_OF = { strike: 'strike', lie: 'strike', mirror: 'strike', chill: 'strike', sweep: 'sweep', flood: 'sweep', gust: 'sweep' };
  function wanted(id, o) {
    const spec = EA.P[id];
    if (!spec || !spec.poses) return [];
    const ok = JSON.stringify(o || {});
    const kinds = new Set();
    try { for (const mid of (RB.combat && RB.combat.members ? RB.combat.members() : [])) { const e = RB.content.enemies[mid]; if (e && e.art === id && JSON.stringify(e.artOpts || {}) === ok) kindsOf(e).forEach((k) => kinds.add(k)); } } catch (e) { /* none known */ }
    const keys = [];
    const push = (k) => { if (spec.poses[k] && keys.indexOf(k) < 0) keys.push(k); };
    for (const kd of kinds) { for (const act of ['prep', 'exec', 'cast', 'recover']) push(act + '.' + kd); push('prep.' + (FAMILY_OF[kd] || 'cast')); push('exec.' + (FAMILY_OF[kd] || 'cast')); }
    for (const k of ['exec.impact', 'recover.hover', 'recover.deflect', 'rest', 'recoil', 'release', 'balk', 'settle']) push(k);
    const out = [];
    for (const key of keys) for (let i = 0; i < spec.poses[key] && out.length < PREWARM_CAP; i++) out.push([key, i, spec.poses[key]]);
    return out;
  }
  function pump(deadline) {
    tick = null;
    const t0 = performance.now();
    while (pending.length && (deadline ? deadline.timeRemaining() > 6 : performance.now() - t0 < 8)) {
      const [id, o, key, i, n] = pending.shift();
      try {
        if (!cv1) cv1 = RB.sprites && RB.sprites.makeCanvas ? RB.sprites.makeCanvas(1, 1) : null;
        if (!cv1) { pending.length = 0; break; }
        const [act, fam] = key.split('.');
        EA.drawPosed(cv1.getContext('2d'), id, 0, o, -9999, -9999, 1, false, { act, family: fam || null, k: (i + 0.5) / n, dir: { x: -0.8, y: 0.6 } });
      } catch (e) { pending.length = 0; break; }
    }
    if (pending.length) schedule();
  }
  function schedule() {
    if (tick) return;
    if (typeof requestIdleCallback === 'function') tick = requestIdleCallback(pump, { timeout: 400 });
    else tick = setTimeout(() => pump(null), 30);
  }
  A.prewarm = { pending: () => pending.length, cap: PREWARM_CAP };
  A.onBuilt = function (id, o) {
    if (typeof document === 'undefined' || !RB.combat || !RB.combat.members) return;
    const key = id + '|' + JSON.stringify(o);
    const now = performance.now();
    if (seen.has(key) && now - seen.get(key) < 20000) return;
    seen.set(key, now);
    if (seen.size > 24) seen.delete(seen.keys().next().value);
    // (after the frame that asked has been built and drawn)
    setTimeout(() => { for (const [k, i, n] of wanted(id, o)) pending.push([id, o, k, i, n]); schedule(); }, 0);
  };
})();
