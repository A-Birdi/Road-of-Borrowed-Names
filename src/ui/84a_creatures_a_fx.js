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
