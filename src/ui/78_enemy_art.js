/* Battle creatures, drawn as pixel art at art resolution (2 art px per
 * logical px; a creature is roughly 128 art px across, centred on its old
 * logical origin ×2, feet/shadow line at y ≈ +84).
 *
 * RB.enemyArt.def(id, spec) registers a creature:
 *   { w, h, ox, oy,            sprite canvas size and the origin inside it
 *     frames, ms, seq,         idle animation: frame count, ms per frame,
 *                              optional frame order
 *     bob(t) → px,             optional whole-sprite float offset (art px)
 *     dy,                      optional fixed offset that sets a walker's
 *                              feet on the ground line (y ≈ +84)
 *     build(L, f, o, H) }      draws frame f into layer L (RB.pxkit) with the
 *                              creature's options o (o.col, o.col2, o.core,
 *                              o.warm, o.pale …); may return another layer
 * Frames are built once per (id, options, frame) and cached as canvases.
 * RB.enemyArt.A keeps the older vector drawers (logical px) that other files
 * may still register; a pixel definition wins when both exist. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.enemyArt = (function () {
  'use strict';
  const K = RB.pxkit;
  const A = {};
  const P = {};
  const cache = new Map();
  const CAP = 140;

  function def(id, spec) {
    P[id] = spec;
    for (const k of [...cache.keys()]) if (k.startsWith(id + '|')) cache.delete(k);
    return spec;
  }
  function seqOf(spec) {
    if (spec.seq) return spec.seq;
    const n = spec.frames || 1, out = [];
    for (let i = 0; i < n; i++) out.push(i);
    return out;
  }
  function frameAt(spec, t, still) {
    const seq = seqOf(spec);
    return still ? seq[0] : seq[Math.floor(Math.max(0, t) / (spec.ms || 160)) % seq.length];
  }
  function okey(o) {
    if (!o) return '';
    const ks = Object.keys(o).sort();
    return ks.map((k) => k + ':' + o[k]).join(',');
  }
  // The cached canvas for one frame.
  function frame(id, f, o) {
    const spec = P[id];
    if (!spec) return null;
    const key = id + '|' + okey(o) + '|' + f;
    let cv = cache.get(key);
    if (cv) { cache.delete(key); cache.set(key, cv); return cv; }
    const L = K.layer(spec.w, spec.h, spec.ox, spec.oy);
    const out = spec.build(L, f, o || {}, H) || L;
    if (f === seqOf(spec)[0] && !spec._box) {
      // rows (and columns) that hold any pixel: the creature's real reach
      let t0 = -1, t1 = -1, l0 = out.w, l1 = -1;
      for (let y = 0; y < out.h; y++) {
        let any = false;
        for (let x = 0, i = y * out.w; x < out.w; x++, i++) if (out.px[i] >>> 24) { any = true; if (x < l0) l0 = x; if (x > l1) l1 = x; }
        if (any) { if (t0 < 0) t0 = y; t1 = y; }
      }
      spec._box = [Math.max(0, t0), Math.max(0, t1)];
      spec._boxX = [l1 < 0 ? 0 : l0, l1 < 0 ? out.w - 1 : l1];
    }
    cv = out.canvas();
    cache.set(key, cv);
    while (cache.size > CAP) cache.delete(cache.keys().next().value);
    return cv;
  }
  function has(id) { return !!P[id]; }
  // Vertical reach of a creature's sprite around its origin, in art px at
  // scale 1 (top is negative), so a scene can keep it inside the stage.
  function extent(id, o) {
    const pid = P[id] ? id : 'wisp';
    const spec = P[pid];
    const dy = spec.dy || 0;
    frame(pid, seqOf(spec)[0], o);
    const box = spec._box || [0, spec.h - 1], bx = spec._boxX || [0, spec.w - 1];
    return { top: box[0] - spec.oy + dy - 6, bottom: box[1] - spec.oy + dy + 6, left: bx[0] - spec.ox, right: bx[1] - spec.ox };
  }
  // Draw a creature at art resolution: origin at (x, y), integer scale s.
  function drawArt(c, id, t, o, x, y, s, still) {
    const spec = P[id] || (!A[id] && P.wisp);
    if (!spec) return false;
    const pid = P[id] ? id : 'wisp';
    const f = frameAt(spec, t, still);
    const cv = frame(pid, f, o);
    const b = (spec.bob && !still ? Math.round(spec.bob(t)) : 0) + (spec.dy || 0);
    s = s || 1;
    c.imageSmoothingEnabled = false;
    c.drawImage(cv, Math.round(x - spec.ox * s), Math.round(y - (spec.oy - b) * s), spec.w * s, spec.h * s);
    return true;
  }
  // ---- acting: each creature performs with its own anatomy ------------------------------
  // A motion style per creature (a definition may also carry `motion`):
  // flutter — wings raised in preparation, a fast beat and a darting reach
  //           (moths, the crane, the letter);
  // drift   — pulls in, then darts out with the tail streaming (wisps, veils);
  // sway    — a hung thing tilting back and swinging (lanterns, the lamp);
  // pulse   — contracts and swells (echoes, the Hush);
  // ripple  — ink that shrinks, surges and splashes (blots);
  // lurch   — rocks back and lurches into a slam (golems, the kiln, the keeper);
  // stamp   — rises and brings the seal down (clerks);
  // swing   — a bell's long swing; pounce — crouch and leap (foxes);
  // scuttle — a sideways shuffle and a snap (crabs).
  // Every style reads differently for an attack (exec), a self-buff or
  // condition (cast), a reaction (recoil / release), a move that fizzles
  // (balk), the final settling (settle) and waiting (rest).
  const STYLE = {
    moth: 'flutter', crane: 'flutter', sg_letter: 'flutter', wisp: 'drift', hush: 'drift', spirit: 'drift', atlas_cartographer: 'drift',
    lantern: 'sway', sb_frostlamp: 'sway', lf_conduit: 'sway', echo: 'pulse', sa_hush: 'pulse', blot: 'ripple',
    golem: 'lurch', warden: 'lurch', lf_keeper: 'lurch', clerk: 'stamp', bell: 'swing', fox: 'pounce', sb_snowfox: 'pounce', crab: 'scuttle',
  };
  const MOVES = {
    flutter: { prep: { dy: -5, lean: -3, pull: 3, frame: 'hi' }, exec: { reach: 16, lean: 4, rate: 2.6 }, cast: { dy: -4, rate: 2.2, glow: 0.5 }, recoil: { push: 6, lean: 3, frame: 'lo' } },
    drift: { prep: { pull: 5, sy: 0.94 }, exec: { reach: 18, lean: 5 }, cast: { sy: 1.05, glow: 0.7 }, recoil: { push: 7, lean: 3 } },
    sway: { prep: { lean: -6, pull: 2 }, exec: { reach: 6, lean: 8 }, cast: { osc: 4, glow: 0.4 }, recoil: { push: 3, lean: 5 } },
    pulse: { prep: { sy: 0.92 }, exec: { reach: 4, sy: 1.08, glow: 0.8 }, cast: { sy: 1.06, glow: 0.8 }, recoil: { push: 3, sy: 0.94 } },
    ripple: { prep: { sy: 0.9, ripple: 1 }, exec: { reach: 10, lean: 5, sy: 1.07, ripple: 2 }, cast: { sy: 1.04, ripple: 2 }, recoil: { push: 3, sy: 0.9, ripple: 2 } },
    lurch: { prep: { lean: -5, dy: -2, pull: 2 }, exec: { reach: 8, lean: 6, slam: 3 }, cast: { dy: -3, sy: 1.03, glow: 0.3 }, recoil: { push: 3, lean: 4 } },
    stamp: { prep: { dy: -7 }, exec: { reach: 4, slam: 5, sy: 0.95 }, cast: { dy: -4, glow: 0.3 }, recoil: { push: 3, lean: 2 } },
    swing: { prep: { lean: -7 }, exec: { reach: 4, lean: 9 }, cast: { osc: 5 }, recoil: { push: 2, lean: 6 } },
    pounce: { prep: { sy: 0.93, dy: 3, lean: -2, pull: 2 }, exec: { reach: 20, hop: 9 }, cast: { dy: -2, sy: 1.03, glow: 0.3 }, recoil: { push: 5, lean: 3 } },
    scuttle: { prep: { jitter: 2, pull: 2 }, exec: { reach: 10, lean: 4 }, cast: { jitter: 2 }, recoil: { push: 4, lean: 2 } },
  };
  function styleOf(id) { return (P[id] && P[id].motion) || STYLE[id] || 'drift'; }
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const eo = (k) => 1 - Math.pow(1 - cl(k), 3);
  const bl = (k) => Math.sin(Math.PI * cl(k));
  // the reach of a blow over its execution: out fast, then partly back (0.3 held for the recovery)
  const lunge = (k) => (k < 0.45 ? eo(k / 0.45) : 1 - 0.7 * eo((k - 0.45) / 0.55));
  // pose: { act, k (0..1), dir: unit vector toward the target (or the source, for a
  // reaction), family: 'strike'|'sweep'|… } → offsets in creature px
  function motion(id, pose, t, still) {
    const M = MOVES[styleOf(id)] || MOVES.drift;
    const k = cl(pose.k || 0), d = pose.dir || { x: -0.8, y: 0.6 }, sg = d.x < 0 ? -1 : 1;
    const m = { dx: 0, dy: 0, lean: 0, ripple: 0, sy: 1, frame: null, rate: 1, alpha: 1, glow: 0 };
    const exec = (L, E, sweep) => {
      const reach = (E.reach || 0) * (sweep ? 0.7 : 1);
      m.dx = d.x * reach * L; m.dy = d.y * reach * 0.5 * L;
      if (E.slam) m.dy += E.slam * cl((L - 0.6) / 0.4);
      if (E.hop) m.dy -= E.hop * bl(Math.min(1, L));
      m.lean = (E.lean || 0) * sg * L * (sweep ? 1.5 : 1);
      if (sweep) m.dy += Math.sin(L * Math.PI * 2) * 3;
      m.sy = 1 + ((E.sy || 1) - 1) * L; m.ripple = (E.ripple || 0) * L; m.glow = (E.glow || 0) * L;
      m.rate = E.rate || 1.6;
    };
    const a = pose.act;
    if (a === 'prep' || a === 'balk') {
      const Pp = M.prep, p = a === 'prep' ? eo(k) : 1 - eo(k);
      m.dx = -d.x * (Pp.pull || 0) * p; m.dy = (Pp.dy || 0) * p; m.lean = (Pp.lean || 0) * sg * p;
      m.sy = 1 + ((Pp.sy || 1) - 1) * p; m.ripple = (Pp.ripple || 0) * p;
      if (Pp.jitter) m.dx += Math.round(Math.sin(t / 45) * Pp.jitter * p);
      if (Pp.frame && k > 0.2 && a === 'prep') m.frame = Pp.frame;
      if (a === 'balk') { m.dx += Math.sin(k * 30) * 1.5 * (1 - k); m.alpha = 1 - 0.15 * bl(k); }
    } else if (a === 'exec') exec(lunge(k), M.exec, pose.family === 'sweep');
    else if (a === 'recover') exec(0.3 * (1 - eo(k)), M.exec, pose.family === 'sweep');
    else if (a === 'cast') {
      const C = M.cast, c = bl(k);
      m.dy = (C.dy || 0) * c; m.sy = 1 + ((C.sy || 1) - 1) * c; m.glow = (C.glow || 0) * c; m.ripple = (C.ripple || 0) * c;
      if (C.osc) m.lean = C.osc * Math.sin(k * Math.PI * 2) * sg;
      if (C.jitter) m.dx = Math.round(Math.sin(t / 45) * C.jitter * c);
      m.rate = C.rate || 1.3;
    } else if (a === 'recoil') {
      const Rr = M.recoil, j = Math.pow(1 - k, 2);
      m.dx = -d.x * (Rr.push || 4) * j; m.dy = -d.y * (Rr.push || 4) * 0.4 * j; m.lean = -sg * (Rr.lean || 2) * j;
      m.sy = 1 + ((Rr.sy || 1) - 1) * j; m.ripple = (Rr.ripple || 0) * j;
      if (Rr.frame && k < 0.5) m.frame = Rr.frame;
    } else if (a === 'release') {
      m.dx = Math.sin(k * 28) * 1.5 * (1 - k); m.glow = 0.4 * bl(k);
    } else if (a === 'settle') {
      const s = eo(k);
      m.dy = -6 * s; m.alpha = 1 - 0.55 * s; m.glow = 0.5 * bl(k); m.rate = 0.5;
    } else if (a === 'rest') {
      const b = bl(k);
      m.dy = 2 * b; m.sy = 1 - 0.02 * b; m.rate = 0.6;
    }
    // reduced motion: no movement, no posture or frame changes, no fades; only the
    // settled (released) creature shows as it will stay, at once
    if (still) return { dx: 0, dy: 0, lean: 0, ripple: 0, sy: 1, frame: null, rate: 0, alpha: a === 'settle' ? 0.45 : 1, glow: 0 };
    return m;
  }
  function pickFrame(spec, which) {
    const seq = seqOf(spec);
    if (which === 'lo') return seq[0];
    let hi = seq[0];
    for (const f of seq) if (f > hi) hi = f;
    return hi;
  }
  // Draw a creature in a pose (see motion): moved, leaned, squashed or rippled in
  // whole creature pixels (4-row bands drawn with integer offsets, no smoothing).
  // Without a pose it is exactly drawArt. Returns the offset applied (art px).
  function drawPosed(c, id, t, o, x, y, s, still, pose) {
    const spec = P[id] || (!A[id] && P.wisp);
    if (!spec) return null;
    const pid = P[id] ? id : 'wisp';
    s = s || 1;
    const m = pose ? motion(pid, pose, t, still) : null;
    const f = m && m.frame != null ? pickFrame(spec, m.frame) : frameAt(spec, t * (m ? m.rate || 1 : 1), still);
    const cv = frame(pid, f, o);
    const b = (spec.bob && !still ? Math.round(spec.bob(t)) : 0) + (spec.dy || 0);
    const X = Math.round(x + Math.round(m ? m.dx : 0) * s), Y = Math.round(y + Math.round(m ? m.dy : 0) * s);
    c.imageSmoothingEnabled = false;
    if (m && m.glow > 0.02) K.halo(c, X, Y, Math.round(Math.max(spec.ox, spec.oy) * 0.6 * s), '255,244,214', 0.24 * m.glow, 3);
    const a0 = c.globalAlpha;
    if (m && m.alpha < 1) c.globalAlpha = a0 * m.alpha;
    const lean = m ? m.lean : 0, rip = m ? m.ripple : 0, sy = m ? m.sy : 1;
    if (!lean && !rip && Math.abs(sy - 1) < 0.005) {
      c.drawImage(cv, X - spec.ox * s, Math.round(Y - (spec.oy - b) * s), spec.w * s, spec.h * s);
    } else {
      const H = spec.h, BH = 4;
      for (let r = 0; r < H; r += BH) {
        const bh = Math.min(BH, H - r);
        const y1 = Math.round((r - spec.oy) * sy), y2 = Math.round((r + bh - spec.oy) * sy);
        if (y2 <= y1) continue;
        const up = 1 - (r + bh / 2) / H;
        const off = Math.round(lean * up + (rip ? Math.sin(r / 9 + t / 150) * rip : 0));
        c.drawImage(cv, 0, r, spec.w, bh, X + (off - spec.ox) * s, Y + (y1 + b) * s, spec.w * s, (y2 - y1) * s);
      }
    }
    c.globalAlpha = a0;
    return { dx: X - x, dy: Y - y };
  }

  // Older entry point: draws in the caller's logical px (half the art size).
  function draw(c, art, t, o) {
    if (P[art]) {
      const spec = P[art];
      const cv = frame(art, frameAt(spec, t, RB.game && RB.game.reducedMotion && RB.game.reducedMotion()), o);
      c.imageSmoothingEnabled = false;
      c.drawImage(cv, -spec.ox / 2, (-spec.oy + (spec.dy || 0)) / 2, spec.w / 2, spec.h / 2);
      return;
    }
    (A[art] || A.wisp || (() => {}))(c, t, o || {});
  }

  // ---- shared parts --------------------------------------------------------------------
  const H = {
    K,
    TAU: Math.PI * 2,
    ph: (f, n) => (f / n) * Math.PI * 2,
    ink: K.mat(null, { cols: ['#120e1c', '#1e1830', '#2c2440'], at: 1, line: false }),
    white: K.solid('#fbf8ff', { line: false }),
    // two eyes: dark ovals with a catch-light; `col` for pale eyes on dark bodies
    eyes(L, x, y, gap, o) {
      o = o || {};
      const rx = o.rx || 3, ry = o.ry || 5;
      const M = o.col ? K.mat(null, { cols: [K.tone(o.col, -2), o.col, K.tone(o.col, 2)], at: 1, line: false }) : H.ink;
      for (const s of [-1, 1]) {
        const ex = x + s * gap;
        L.ell(ex, y, rx, ry, M, o.col ? K.sphere(ex, y, rx, ry, { amb: 0.4 }) : 1);
        if (o.shine !== false) L.rect(Math.round(ex - rx * 0.6), Math.round(y - ry * 0.7), 2, 2, o.col ? M : H.white, o.col ? 2 : 0);
        if (o.pupil) L.rect(Math.round(ex) - 1, Math.round(y) - 1, 2, 3, H.ink, 0);
      }
      return L;
    },
    // a stepped translucent glow (rings of falling alpha) — its own layer, never outlined
    glow(L, x, y, rx, ry, col, a, steps) {
      steps = steps || 3;
      const c = K.parse(col);
      for (let i = steps; i >= 1; i--) {
        const M = K.solid([c[0], c[1], c[2], Math.round((a * 255 * (steps - i + 1)) / steps / 1.4)], { line: false });
        L.ell(x, y, (rx * i) / steps, (ry * i) / steps, M, 0);
      }
      return L;
    },
    // A round pipe along a polyline: each run is shaded across its width
    // (lit on the side facing the upper left), with a collar at every joint.
    pipe(L, pts, w, M, o) {
      o = o || {};
      const run = (xa, ya, xb, yb, ww) => {
        const dx = xb - xa, dy = yb - ya, len = Math.hypot(dx, dy) || 1;
        let nx = -dy / len, ny = dx / len;
        if (nx * -0.6 + ny * -0.8 < 0) { nx = -nx; ny = -ny; }
        const rr = ww / 2;
        L.seg(xa, ya, xb, yb, ww, M, (x, y) => {
          const d = K.clamp(((x - xa) * nx + (y - ya) * ny) / rr, -1, 1);
          return K.clamp(0.14 + 0.86 * Math.max(0, d * 0.55 + Math.sqrt(1 - d * d) * 0.62), 0, 0.99);
        });
      };
      for (let i = 1; i < pts.length; i++) run(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], pts[i][2] || w);
      if (o.collars !== false) for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i], [x2, y2] = pts[i + 1];
        const len = Math.hypot(x2 - x, y2 - y) || 1, ux = (x2 - x) / len, uy = (y2 - y) / len;
        run(x - ux * 2, y - uy * 2, x + ux * 2, y + uy * 2, (pts[i][2] || w) + 4);
      }
      return L;
    },
    // A tapering ghost tail hanging from (x, y0), `len` long and `w0` wide at
    // the top, swaying with phase ph. bands: [[fromY, toY, material], …]
    // (relative to y0) so the tip can fade through translucent ramps.
    tail(L, x, y0, len, w0, ph, bands, o) {
      o = o || {};
      const amp = o.amp == null ? 10 : o.amp, curl = o.curl || 14, dark = o.dark == null ? 0.18 : o.dark;
      const lean = o.lean || 0;
      const cx = (y) => x + lean * y + Math.sin(ph + y / curl) * amp * Math.min(1, y / (len * 0.45));
      const hw = (y) => w0 * Math.pow(Math.max(0, 1 - y / len), 0.85) + 1;
      for (const [a, b, M] of bands) {
        const lx = Math.abs(lean) * len;
        L.fill(x - w0 - amp - 2 - lx, y0 + a, x + w0 + amp + 2 + lx, y0 + Math.min(b, len), (px, py) => {
          const y = py - y0;
          return y >= a && y < b && y < len && Math.abs(px - cx(y)) <= hw(y);
        }, M, (px, py) => {
          const y = py - y0, n = (px - cx(y)) / hw(y);
          const v = 0.2 + 0.8 * Math.max(0, -n * 0.55 + Math.sqrt(Math.max(0, 1 - n * n)) * 0.7);
          return K.clamp(v * (1 - dark * y / len), 0, 0.99);
        });
      }
      return L;
    },
  };

  // ---- wisp -----------------------------------------------------------------------------
  // A small lantern-spirit: a round head that trails into a curling tail.
  // Options: col.
  def('wisp', {
    w: 132, h: 180, ox: 66, oy: 62, frames: 6, ms: 150,
    bob: (t) => Math.sin(t / 420) * 5,
    build(L, f, o, H) {
      const col = o.col || '#9fb8e8';
      const ph = H.ph(f, 6);
      const aura = L.like();
      H.glow(aura, 0, 4, 46, 44, col, 0.32, 3);
      const body = L.like();
      const M = K.mat(col, { n: 5, at: 3, step: 0.1 });
      const Mt = K.mat(col, { n: 4, at: 2, step: 0.1, alpha: 205, line: false });
      const Mf = K.mat(col, { n: 3, at: 1, step: 0.1, alpha: 130, line: false });
      // tail: one tapering ribbon that sways with the phase and thins into light
      H.tail(body, 0, 12, 70, 25, ph, [[0, 40, M], [40, 56, Mt], [56, 200, Mf]], { amp: 11, curl: 11 });
      // head
      body.ell(0, 0, 30, 29, M, K.sphere(0, 0, 30, 29, { amb: 0.2, rim: 0.12 }));
      body.outline();
      // inner light: a warm core cluster just up-left of centre
      body.onto((b) => {
        b.ell(-8, -9, 9, 7, M, 4);
        b.ell(-11, -12, 4, 3, K.solid(K.mix(K.parse(col), [255, 252, 236, 255], 0.75), { line: false }), 0);
      });
      H.eyes(body, 1, 2, 10, { rx: 3.5, ry: 6 });
      return body.under(aura);
    },
  });

  // ---- moth ------------------------------------------------------------------------------
  // A dusk moth, front on: patterned forewings with an eye-spot and a dark
  // margin, softer hind wings, a furred thorax and feathered antennae.
  // Options: col (forewings), col2 (hind wings, markings).
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  def('moth', {
    w: 188, h: 160, ox: 94, oy: 76, frames: 4, seq: [0, 1, 2, 3, 2, 1], ms: 95,
    bob: (t) => Math.sin(t / 520) * 4,
    build(L, f, o, H) {
      const col = o.col || '#c8c0e0', col2 = o.col2 || '#9a8ab8';
      const Mw = K.mat(col, { n: 5, at: 3, step: 0.1 });
      const Mm = K.mat(mixh(col, col2, 0.55), { n: 4, at: 2, step: 0.1 });
      const Mh = K.mat(col2, { n: 5, at: 3, step: 0.1 });
      const Mb = K.mat(mixh('#3a3050', col2, 0.18), { n: 5, at: 2, step: 0.085 });
      const Mfur = K.mat(mixh(col, '#fff4dc', 0.3), { n: 4, at: 2, step: 0.09 });
      const ang = [0.04, -0.14, -0.3, -0.46][f], sy = [1, 0.93, 0.82, 0.72][f];
      const hind = L.like(), fore = L.like(), body = L.like();
      const FW = [[4, -10], [20, -30], [40, -44], [60, -50], [74, -46], [81, -35], [79, -21], [71, -8], [57, 4], [39, 11], [21, 11], [6, 4]];
      const HW = [[4, -2], [22, 6], [40, 14], [52, 26], [52, 40], [41, 50], [26, 47], [13, 36], [4, 18]];
      const inset = (pts, k, cx, cy) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
      for (const s of [-1, 1]) {
        const lit = s < 0 ? 0.1 : -0.04;
        // hind wing (moves less)
        hind.save().scale(s, 1).translate(6, 0).rotate(ang * 0.55).scale(1, 0.94 + (sy - 0.94) * 0.5).translate(-6, 0);
        hind.poly(HW, Mh, 1);
        hind.poly(inset(HW, 0.8, 10, 12), Mh, (x, y) => K.clamp(0.42 + lit + x / 150 - y / 260, 0, 0.99));
        hind.ell(34, 30, 6, 5, Mh, 4);
        hind.ell(34, 30, 3, 2, Mb, 1);
        for (const [cx, cy] of [[52, 34], [46, 46], [32, 49]]) hind.eraseEll(cx + 2, cy + 2, 3.2, 3.2);
        hind.restore();
        // forewing: a dark margin, the lit field, veins, then the eye-spot
        fore.save().scale(s, 1).translate(6, -4).rotate(ang).scale(1, sy).translate(-6, 4);
        fore.poly(FW, Mm, 1);
        fore.poly(inset(FW, 0.86, 14, -14), Mw, (x, y) => {
          const lead = (y + 10 + x * 0.72) < 6 ? 0.18 : 0; // the leading edge catches light
          return K.clamp(0.36 + lit + x / 190 + lead, 0, 0.99);
        });
        for (const [x1, y1] of [[70, -42], [76, -24], [66, -6], [46, 8]]) fore.line(9, -4, x1, y1, Mw, 1);
        fore.line(28, -26, 36, -8, Mw, 1);
        fore.ell(50, -24, 10, 9, Mm, 0);
        fore.ell(50, -24, 7.5, 6.5, Mw, 4);
        fore.ell(51, -23, 4, 3.6, Mh, 1);
        fore.rect(48, -27, 2, 2, Mw, 4);
        for (const [cx, cy] of [[82, -28], [77, -13], [66, 0], [49, 10]]) fore.eraseEll(cx + 1, cy + 1, 3, 3);
        fore.restore();
        // antenna: a curved shaft with barbs on the outer side
        body.save().scale(s, 1);
        const sh = [[3, -32], [7, -42], [12, -50], [19, -56], [26, -58]];
        body.path(sh, 2, Mb, 1);
        for (let i = 1; i < sh.length; i++) { const [x, y] = sh[i]; body.line(x, y, x + 4, y + 3, Mb, 2); body.line(x - 1, y - 1, x + 2, y - 5, Mb, 2); }
        // legs tucked under the thorax
        body.path([[8, -4], [16, 2], [18, 8]], 2, Mb, 0);
        body.path([[8, 2], [14, 10], [14, 16]], 2, Mb, 0);
        body.restore();
      }
      // abdomen, thorax with a fur collar, head, pale eyes
      for (let i = 5; i >= 0; i--) {
        const y = 6 + i * 6.5, r = 8.5 - i * 0.9;
        body.ell(0, y, r, 5, Mb, K.sphere(0, y, r, 5, { amb: 0.22 }));
        body.line(-r + 2, y + 3, r - 2, y + 3, Mb, 0);
      }
      body.ell(0, -8, 11, 12, Mb, K.sphere(0, -8, 11, 12, { amb: 0.2 }));
      body.ell(0, -17, 13, 6, Mfur, K.sphere(0, -17, 13, 6, { amb: 0.3 }));
      for (let x = -11; x <= 9; x += 4) body.poly([[x, -14], [x + 4, -14], [x + 2, -10]], Mfur, 1);
      body.ell(0, -27, 8.5, 7, Mb, K.sphere(0, -27, 8.5, 7, { amb: 0.24 }));
      H.eyes(body, 0, -28, 5, { col: '#f0e8ff', rx: 3, ry: 3.2, pupil: true, shine: false });
      hind.outline(); fore.outline(); body.outline();
      return hind.over(fore).over(body);
    },
  });

  // ---- ink blot --------------------------------------------------------------------------
  // Glossy ink that has stood up: a dome melting into a lobed puddle, drips
  // on its flanks, pale eyes and a wavering mouth. Options: col.
  def('blot', {
    w: 168, h: 136, ox: 84, oy: 58, dy: 30, frames: 4, seq: [0, 1, 2, 3], ms: 170,
    build(L, f, o, H) {
      const col = o.col || '#241f3a';
      const M = K.mat(col, { n: 5, at: 1, step: 0.085, lt: 1.1 });
      const gloss = K.solid(mixh(col, '#eef0ff', 0.78), { line: false });
      const gloss2 = K.solid(mixh(col, '#c8ccf0', 0.45), { line: false });
      const pale = K.mat('#f1edff', { n: 3, at: 1, step: 0.1, line: false });
      const w = [0, 2, 0, -2][f], d = [0, 1, 2, 3][f];
      const B = L.like();
      // puddle lobes
      for (const [x, y, rx, ry] of [[-46, 42, 20, 9], [44, 43, 22, 8], [-12, 47, 32, 9], [20, 39, 26, 11], [-30, 38, 20, 10], [58, 47, 8, 4], [-62, 47, 7, 3]]) {
        B.ell(x + (x > 0 ? w : -w) * 0.5, y, rx, ry, M, (px, py) => K.clamp(0.28 - (py - y) / 40 + (px < 0 ? 0.08 : 0), 0, 0.99));
      }
      // body dome (squash and stretch)
      const rx = 38 + w, ry = 42 - w;
      B.ell(0, 2 + w, rx, ry, M, K.sphere(-2, -6, rx + 4, ry + 4, { amb: 0.08, k: 0.9 }));
      B.fill(-rx, 10, rx, 44, (x, y) => Math.abs(x) <= rx * (0.86 + (y - 10) / 110) && y <= 44, M, (x, y) => K.clamp(0.25 - (y - 10) / 120 + (x < 0 ? 0.1 : -0.04), 0, 0.99));
      // drips on the flanks, with a drop falling
      for (const [x, y0, len, sd] of [[-rx + 6, 4, 18, 0], [rx - 8, 10, 14, 1], [-rx + 16, 20, 10, 2]]) {
        const L2 = len + ((d + sd) % 4);
        B.path([[x, y0], [x + (x < 0 ? -2 : 2), y0 + L2 * 0.6], [x + (x < 0 ? -2 : 2), y0 + L2]], 5, M, 1);
        B.ell(x + (x < 0 ? -2 : 2), y0 + L2 + 1, 3.5, 3.5, M, 1);
        const fall = ((d * 7 + sd * 11) % 28);
        if (fall < 22) B.ell(x + (x < 0 ? -3 : 3), y0 + L2 + 8 + fall, 2, 2.5, M, 1);
      }
      B.outline();
      // gloss: a curved streak and two small glints up-left, a cool sheen low right
      B.onto((b) => {
        b.save().translate(-15, -22 + w).rotate(-0.7);
        b.ell(0, 0, 11, 4, gloss2, 0);
        b.ell(-1, -1, 8, 2.2, gloss, 0);
        b.restore();
        b.rect(-26, -8 + w, 3, 3, gloss, 0);
        b.rect(-6, -34 + w, 4, 2, gloss2, 0);
        b.save().translate(22, 22).rotate(0.9);
        b.ell(0, 0, 9, 2, gloss2, 0);
        b.restore();
        b.ell(-40, 40, 8, 2, gloss2, 0);
      });
      // pale eyes with dark pupils, a wavering mouth
      for (const s of [-1, 1]) {
        const ex = s * 12, ey = -6 + w;
        B.ell(ex, ey, 6, 8, pale, K.sphere(ex, ey, 6, 8, { amb: 0.5 }));
        B.ell(ex + 1, ey + 2, 3, 4, H.ink, 0);
        B.rect(ex - 3, ey - 5, 2, 2, H.white, 0);
      }
      const mw = [[-8, 12], [-4, 14], [0, 12], [4, 14], [8, 12]];
      for (let i = 1; i < mw.length; i++) B.line(mw[i - 1][0], mw[i - 1][1] + w + (f % 2), mw[i][0], mw[i][1] + w, pale, 0);
      return B;
    },
  });

  // ---- paper crane -----------------------------------------------------------------------
  // A folded crane, side on: a diamond body, a long tail out to the left, the
  // neck up to the right with the head bent down and tipped in vermilion,
  // and two wings that beat from high to level. Flat facets split by crisp
  // creases; lines of writing on the near wing. Options: col.
  def('crane', {
    w: 188, h: 168, ox: 94, oy: 92, frames: 4, seq: [0, 1, 2, 3], ms: 140,
    bob: (t) => Math.sin(t / 300) * 3,
    build(L, f, o, H) {
      const col = o.col || '#f4efe0';
      const M = K.mat(col, { n: 5, at: 3, step: 0.085, shift: 1.3 });
      const red = K.mat('#c85a4a', { n: 4, at: 2, step: 0.1 });
      const writing = K.solid(mixh(col, '#3a3450', 0.6), { line: false });
      // wing tip positions per frame: raised high → level → a little below → level
      const tipN = [[-30, -76], [-58, -46], [-74, -8], [-56, -40]][f];
      const tipF = [[20, -80], [48, -58], [66, -22], [46, -52]][f];
      const down = f === 2;
      const back = L.like(), mid = L.like(), front = L.like();
      // far wing (behind the body, in shade)
      back.poly([[4, 2], [18, 6], tipF], M, down ? 1 : 2);
      back.poly([[4, 2], [-4, 10], tipF], M, down ? 0 : 1);
      back.line(4, 2, tipF[0], tipF[1], M, 0);
      // tail: two long facets out to the left
      mid.poly([[-10, 14], [-4, 22], [-80, -12]], M, 3);
      mid.poly([[-4, 22], [-12, 26], [-80, -12]], M, 1);
      // neck and head
      mid.poly([[8, 14], [16, 22], [60, -34]], M, 2);
      mid.poly([[16, 22], [22, 18], [60, -34]], M, 1);
      mid.poly([[56, -30], [60, -36], [76, -22], [72, -18]], M, 3);
      mid.poly([[70, -21], [76, -22], [80, -14]], red, 2);
      // body: a diamond split by its centre crease
      mid.poly([[0, -6], [-26, 20], [0, 44]], M, 3);
      mid.poly([[0, -6], [26, 20], [0, 44]], M, 1);
      mid.poly([[-26, 20], [0, 44], [-10, 22]], M, 2);
      mid.line(0, -6, 0, 44, M, 0);
      // near wing (in front, lit from above unless lowered)
      front.poly([[-2, 0], [-16, 8], tipN], M, down ? 2 : 4);
      front.poly([[-2, 0], [8, 6], tipN], M, down ? 1 : 3);
      front.line(-2, 0, tipN[0], tipN[1], M, down ? 0 : 1);
      // writing across the broad facet: short strokes in rows, following the wing
      front.onto((b) => {
        const ux = tipN[0] + 2, uy = tipN[1], len = Math.hypot(ux, uy);
        const dx = ux / len, dy = uy / len;
        for (let r = 0; r < 4; r++) for (let s = 0; s < 3; s++) {
          const at = 16 + r * 13 + s * 4, off = -4 - s * 5;
          const x0 = dx * at - dy * off, y0 = dy * at + dx * off;
          const l2 = 3 + ((r * 3 + s * 5) % 4);
          b.line(x0, y0, x0 + dx * l2, y0 + dy * l2, writing, 0);
        }
      });
      back.outline(); mid.outline(); front.outline();
      return back.over(mid).over(front);
    },
  });

  // ---- stone golem -----------------------------------------------------------------------
  // A stack of dressed field-stones: chamfered blocks lit on their top/left
  // bevels, a boulder head with an eye slit, lichen on the ledges, cracks,
  // and a chest core glowing in the core colour. Options: col, core.
  def('golem', {
    w: 164, h: 180, ox: 82, oy: 88, frames: 4, seq: [0, 1, 2, 3], ms: 240,
    bob: (t) => Math.sin(t / 520) * 2,
    build(L, f, o, H) {
      const col = o.col || '#8fb8b0', core = o.core || '#f0a060';
      const M = K.mat(col, { n: 5, at: 2, step: 0.1, shift: 1.2 });
      const Md = K.mat(K.tone(col, -1.5), { n: 5, at: 2, step: 0.09 });
      const moss = K.mat(mixh(K.tone(col, -0.5), '#7f9a3e', 0.5), { n: 3, at: 1, step: 0.09, line: false });
      const Mc = K.mat(core, { n: 4, at: 2, step: 0.12, line: false });
      const pulse = [0, 1, 2, 1][f], sway = [0, 1, 1, 0][f];
      const back = L.like(), mid = L.like(), glow = L.like();
      const S = (Lr, x, y, w, h, Mx, o2) => {
        const c = (o2 && o2.c) || 5;
        const j = (k) => ((K.hh(x + 50, y + 50, k) % 5) - 2);
        Lr.stone([[x + c, y + j(1)], [x + w - c + j(2), y], [x + w, y + c], [x + w + j(3) * 0.5, y + h - c], [x + w - c, y + h], [x + c + j(4), y + h + j(5) * 0.5], [x, y + h - c], [x + j(6) * 0.5, y + c]], Mx, Object.assign({ bevel: 4 }, o2));
        // weathering: a few worn patches on the face, well inside the bevel
        const n = Math.floor((w * h) / 500);
        for (let i = 0; i < n; i++) {
          const px = x + 8 + (K.hh(x, y, 20 + i) % Math.max(1, w - 16)), py = y + 8 + (K.hh(x, y, 40 + i) % Math.max(1, h - 16));
          K.cluster(Lr, px, py, 4 + (K.hh(x, y, 60 + i) % 4), Mx, (i % 3) ? 1 : 3, K.hh(x, y, 80 + i));
        }
        return Lr;
      };
      // legs
      S(back, -30, 50, 24, 20, Md); S(back, -32, 66, 28, 18, Md);
      S(back, 6, 50, 24, 20, Md); S(back, 4, 66, 28, 18, Md);
      // arms: shoulder boulder, forearm, fist (they sway a pixel)
      for (const s of [-1, 1]) {
        const ax = s < 0 ? -66 : 40, dy = s < 0 ? sway : 1 - sway;
        S(back, ax + (s < 0 ? 4 : -2), 14 + dy, 22, 30, Md, { c: 4 });
        S(back, ax, 40 + dy, 26, 22, M, { c: 6 });
        back.line(ax + 7, 50 + dy, ax + 7, 58 + dy, M, 0); back.line(ax + 14, 50 + dy, ax + 14, 58 + dy, M, 0);
        S(back, ax - (s < 0 ? 2 : 0) + (s < 0 ? 0 : 0), -18 + dy, 28, 34, M, { c: 8 });
      }
      // torso: a broad chest stone over a narrower belly stone; the head a rounded boulder
      S(mid, -26, 22, 52, 32, Md, { c: 7 });
      S(mid, -38, -22, 76, 50, M, { c: 10, bevel: 5 });
      S(mid, -21, -60, 42, 38, M, { c: 11, bevel: 5 });
      mid.rect(-18, -40, 36, 9, Md, 0); // eye slit
      mid.rect(-18, -41, 36, 1, M, 1);
      mid.rect(-17, -31, 34, 1, M, 3);
      // cracks: a dark line with a lit lip
      for (const c of [[[-30, -6], [-22, 0], [-25, 10]], [[26, 2], [31, 10], [28, 18]], [[8, -58], [4, -50], [7, -46]]]) {
        for (let i = 1; i < c.length; i++) { mid.line(c[i - 1][0], c[i - 1][1], c[i][0], c[i][1], M, 0); mid.line(c[i - 1][0] + 1, c[i - 1][1] + 1, c[i][0] + 1, c[i][1] + 1, M, 3); }
      }
      // lichen on the upper ledges
      for (const [x, y, s] of [[-26, -20, 9], [-12, -21, 5], [22, -20, 6], [-12, -58, 8], [10, -59, 5], [-58, -16, 7], [48, -16, 5], [-20, 24, 6]]) K.cluster(mid, x, y, s, moss, 1, K.hh(x + 99, y + 99, 3));
      // chest core: a carved socket, a glowing stone and its catch-light
      mid.ell(0, 2, 12, 12, Md, 0);
      mid.ell(0, 2, 9, 9, Mc, (x, y) => K.clamp(0.3 + pulse * 0.12 + (-(x + y - 2) / 28), 0, 0.99));
      mid.rect(-3, -3, 3, 3, K.solid(mixh(core, '#ffffff', 0.7), { line: false }), 0);
      for (const s of [-1, 1]) { mid.rect(s * 8 - 4, -37, 8, 3, Mc, 2 + (pulse > 1 ? 1 : 0)); mid.rect(s * 8 - 3, -37, 4, 1, Mc, 3); }
      back.outline(); mid.outline();
      H.glow(glow, 0, 2, 20 + pulse * 2, 20 + pulse * 2, core, 0.3, 3);
      H.glow(glow, 0, -36, 24, 6, core, 0.2, 2);
      return back.over(mid).over(glow);
    },
  });

  // ---- paper lantern ghost ---------------------------------------------------------------
  // A ribbed paper lantern lit from inside, dark wooden caps and handle, a
  // torn grin that shows the flame, and a ghost tail in the flame colour.
  // Options: col (flame).
  def('lantern', {
    w: 128, h: 200, ox: 64, oy: 80, frames: 6, ms: 130,
    bob: (t) => Math.sin(t / 400) * 5,
    build(L, f, o, H) {
      const fl = o.col || '#8aa8e8';
      const flick = [0, 1, 2, 1, 0, 2][f];
      const paper = K.mat(mixh('#f4ead0', fl, 0.16), { n: 5, at: 3, step: 0.085 });
      const wood = K.mat('#4a3630', { n: 4, at: 1, step: 0.09 });
      const flame = K.mat(mixh(fl, '#fff6d8', 0.35), { n: 4, at: 2, step: 0.12, line: false });
      const ghost = K.mat(fl, { n: 4, at: 2, step: 0.1, alpha: 180, line: false });
      const ghost2 = K.mat(fl, { n: 3, at: 1, step: 0.1, alpha: 100, line: false });
      const aura = L.like(), body = L.like();
      H.glow(aura, 0, -2, 46 + flick, 52 + flick, fl, 0.24, 3);
      H.tail(body, 0, 42, 60, 17, H.ph(f, 6), [[0, 26, ghost], [26, 100, ghost2]], { amp: 7, curl: 10, dark: 0.1 });
      body.path([[-12, -52], [-11, -62], [-4, -67], [4, -67], [11, -62], [12, -52]], 3, wood, 2);
      const hwAt = (y) => 22 + 9 * Math.cos(((y + 3) / 46) * (Math.PI / 2));
      body.fill(-34, -46, 34, 40, (x, y) => y >= -46 && y < 40 && Math.abs(x) <= hwAt(y), paper, (x, y) => {
        const n = Math.abs(x) / hwAt(y);
        const g = 1 - Math.hypot(x / 30, (y - 8) / 40);
        return K.clamp(0.26 + g * (0.6 + flick * 0.06) - n * n * 0.25 + (x < 0 ? 0.05 : -0.03), 0, 0.99);
      });
      // bamboo ribs, curving a little with the barrel
      for (let y = -37; y < 36; y += 9) {
        const hw = hwAt(y);
        for (let x = -Math.floor(hw) + 1; x < hw - 1; x++) body.dot(x, y + Math.round((x / hw) * (x / hw) * 2), paper, Math.abs(x) / hw > 0.7 ? 0 : 1);
      }
      body.rect(-25, -53, 50, 8, wood, (x, y) => K.clamp(0.55 - (y + 53) / 16 + (x < 0 ? 0.1 : -0.1), 0, 0.99));
      body.rect(-23, 38, 46, 7, wood, (x, y) => K.clamp(0.5 - (y - 38) / 14 + (x < 0 ? 0.1 : -0.1), 0, 0.99));
      body.outline();
      body.onto((b) => {
        H.eyes(b, 0, -14, 11, { rx: 3.5, ry: 5 });
        // the torn grin: a jagged opening lit by the flame inside
        const g = [[-15, 6], [-9, 11], [-5, 7], [0, 12], [5, 7], [10, 12], [15, 5], [12, 16], [4, 20], [-5, 20], [-12, 15]];
        b.poly(g, H.ink, 1);
        b.poly([[-10, 13], [-4, 10], [0, 14], [5, 10], [10, 14], [6, 18], [-6, 18]], flame, 1 + (flick > 1 ? 1 : 0));
        b.ell(3, 18, 4, 3, K.mat('#d8707a', { n: 3, at: 1, line: false }), 1);
      });
      return body.under(aura);
    },
  });

  // ---- echo ------------------------------------------------------------------------------
  // The shape a trapped sound leaves: a dark hollow with pale eyes and an
  // open mouth, ripples spreading out of it, and shards of whatever it was
  // turning slowly around it. Options: col.
  def('echo', {
    w: 184, h: 184, ox: 92, oy: 92, frames: 8, ms: 125,
    bob: (t) => Math.sin(t / 650) * 3,
    build(L, f, o, H) {
      const col = o.col || '#a8c8d8';
      const lightAng = Math.atan2(-0.66, -0.56);
      const R = [K.mat(col, { n: 4, at: 2, step: 0.1, alpha: 235 }), K.mat(col, { n: 4, at: 2, step: 0.1, alpha: 150, line: false }), K.mat(col, { n: 4, at: 2, step: 0.1, alpha: 80, line: false })];
      const shard = K.mat(col, { n: 5, at: 3, step: 0.1 });
      const coreM = K.mat('#1c2a34', { n: 4, at: 1, step: 0.07 });
      const rings = L.like(), shards = L.like(), core = L.like();
      for (let i = 0; i < 3; i++) {
        const r = 28 + ((i * 18 + f * 2.25) % 54);
        const M = R[r < 46 ? 0 : r < 66 ? 1 : 2];
        const th = r < 46 ? 2 : 1.5;
        rings.fill(-r - 3, -r - 3, r + 3, r + 3, (x, y) => { const d = Math.hypot(x, y); return d <= r + th && d >= r - th; }, M,
          (x, y) => K.clamp(0.5 + 0.45 * Math.cos(Math.atan2(y, x) - lightAng), 0, 0.99));
      }
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + (f * Math.PI) / 32 + (i % 2 ? 0.2 : 0);
        const r0 = i % 2 ? 50 : 40;
        shards.save().rotate(a);
        shards.stone([[r0, -3], [r0 + 16, -5], [r0 + 22, 0], [r0 + 15, 5], [r0 + 1, 3]], shard, { bevel: 2, face: 2 });
        shards.restore();
      }
      core.ell(0, 0, 21, 21, coreM, K.sphere(0, 0, 21, 21, { amb: 0.1, rim: 0.25 }));
      core.fill(-24, -24, 24, 24, (x, y) => { const d = Math.hypot(x, y); return d <= 23 && d > 21; }, shard, (x, y) => K.clamp(0.45 + 0.5 * Math.cos(Math.atan2(y, x) - lightAng), 0, 0.99));
      H.eyes(core, 0, -5, 7, { col: mixh(col, '#ffffff', 0.4), rx: 2.5, ry: 3.5, shine: false });
      core.ell(0, 9, 4, 3 + (f % 4 === 0 ? 1 : 0), K.mat('#0a1016', { n: 2, at: 0, line: false }), 0);
      core.fill(-5, 5, 5, 13, (x, y) => { const d = Math.hypot(x / 5, (y - 9) / 4.5); return d <= 1 && d > 0.72 && y < 9; }, shard, 1);
      rings.outline(); shards.outline(); core.outline();
      return rings.over(shards).over(core);
    },
  });

  // ---- clerk -----------------------------------------------------------------------------
  // An archive clerk-spirit: a long official's robe with folds, a paper
  // collar, a tall cap with a pale band, a face in shadow with pale eyes, a
  // big seal stamp that rises and slams, and loose sheets drifting beside
  // it. Options: col (robe).
  def('clerk', {
    w: 168, h: 188, ox: 78, oy: 92, dy: 14, frames: 6, ms: 150,
    build(L, f, o, H) {
      const col = o.col || '#4a6a8a';
      const robe = K.mat(col, { n: 5, at: 2, step: 0.09 });
      const paperM = K.mat('#e8e0cc', { n: 4, at: 2, step: 0.08 });
      const woodM = K.mat('#6a4a3a', { n: 4, at: 2, step: 0.1 });
      const seal = K.mat('#c85a4a', { n: 4, at: 2, step: 0.1 });
      const shade = K.mat(K.tone(col, -3.5), { n: 3, at: 1, step: 0.05 });
      const skin = K.mat('#d8c8b8', { n: 3, at: 1, step: 0.08 });
      const lines = K.solid('#5a5468', { line: false });
      const sy = [-24, -17, -8, 2, -3, -13][f];
      const back = L.like(), mid = L.like(), front = L.like();
      // loose sheets drifting at its side
      for (let i = 0; i < 3; i++) {
        const dy = ((f + i * 2) % 6 < 3 ? 1 : -1) * ((f + i) % 3);
        back.save().translate(-54 - i * 5, 22 - i * 18 + dy).rotate(-0.28 + i * 0.2 + (((f + i) % 2) ? 0.05 : -0.05));
        back.stone([[-11, -8], [11, -8], [11, 8], [-11, 8]], paperM, { bevel: 2, face: 2 });
        for (let r = 0; r < 3; r++) back.line(-7, -3 + r * 3, 5 - (r % 2) * 5, -3 + r * 3, lines, 0);
        back.restore();
      }
      // robe with folds (vertical bands, light from the left)
      const robeP = [[-20, -26], [20, -26], [30, 16], [35, 66], [26, 64], [18, 68], [8, 64], [-2, 68], [-12, 64], [-22, 68], [-35, 66], [-30, 16]];
      mid.poly(robeP, robe, (x, y) => K.clamp(0.52 - x / 110 + 0.16 * Math.cos((x + 3) / 5.2) * Math.min(1, (y + 20) / 40), 0, 0.99));
      // left sleeve hanging, right sleeve raised to the stamp
      mid.poly([[-19, -24], [-34, -8], [-44, 30], [-28, 36], [-22, 2]], robe, (x, y) => K.clamp(0.62 + 0.14 * Math.cos(x / 4) - (y + 24) / 200, 0, 0.99));
      mid.ell(-35, 34, 5, 4, skin, 1);
      front.poly([[18, -24], [32, -16], [44, sy + 4], [34, sy + 12], [24, -2]], robe, (x, y) => K.clamp(0.45 - (x - 18) / 120, 0, 0.99));
      // collar and cap
      mid.poly([[-13, -26], [13, -26], [0, -6]], paperM, 3);
      mid.poly([[-6, -26], [6, -26], [0, -14]], robe, 1);
      mid.ell(0, -30, 13, 10, shade, 0);
      mid.poly([[-15, -40], [-14, -58], [-8, -66], [8, -66], [14, -58], [15, -40]], robe, K.sphere(-2, -56, 18, 16, { amb: 0.2 }));
      mid.rect(-16, -44, 32, 5, paperM, (x) => K.clamp(0.7 - (x + 16) / 60, 0, 0.99));
      // face in shadow: pale eyes
      for (const s of [-1, 1]) { mid.rect(s * 5 - 2, -33, 4, 2, K.solid('#eef0ff', { line: false }), 0); mid.dot(s * 5 - 2, -34, K.solid('#b8c0e0', { line: false }), 0); }
      // the stamp: handle, knob, gripping hand and vermilion seal
      front.rect(36, sy - 22, 7, 22, woodM, K.cyl(39.5, 3.5));
      front.ell(39.5, sy - 24, 6, 4, woodM, K.sphere(39.5, sy - 25, 6, 4));
      front.ell(38, sy - 8, 6, 5, skin, K.sphere(37, sy - 9, 6, 5));
      front.stone([[29, sy], [50, sy], [50, sy + 9], [29, sy + 9]], seal, { bevel: 2, face: 2 });
      if (f === 3) for (const [x1, y1, x2, y2] of [[26, 14, 21, 16], [53, 14, 58, 16], [30, 17, 26, 21], [49, 17, 53, 21]]) front.line(x1, y1, x2, y2, paperM, 3);
      back.outline(); mid.outline(); front.outline();
      return back.over(mid).over(front);
    },
  });

  // ---- kiln warden -----------------------------------------------------------------------
  // A living kiln: a brick dome with a teal-glazed band, ember eyes, a
  // chimney breathing smoke, and a firebox mouth with flames that roll.
  def('warden', {
    w: 172, h: 196, ox: 86, oy: 104, dy: 12, frames: 6, ms: 140,
    build(L, f, o, H) {
      const clay = K.mat(o.col || '#8a5a40', { n: 5, at: 2, step: 0.085 });
      const glaze = K.mat('#8fb8b0', { n: 5, at: 2, step: 0.1 });
      const soot = K.mat('#2a1a16', { n: 3, at: 1, step: 0.05 });
      const fireR = K.mat('#d8502a', { n: 3, at: 1, step: 0.1, line: false });
      const fireO = K.mat('#f0902e', { n: 3, at: 1, step: 0.1, line: false });
      const fireY = K.mat('#ffd070', { n: 3, at: 1, step: 0.1, line: false });
      const eye = K.mat('#ffd070', { n: 3, at: 1, step: 0.1, line: false });
      const smoke = K.mat('#8a8490', { n: 3, at: 1, step: 0.08, alpha: 150, line: false });
      const glowL = L.like(), body = L.like(), fx = L.like(), fire = L.like();
      const hw = (y) => (y >= -18 ? 54 + Math.max(0, y - 40) * 0.2 : 54 * Math.sqrt(Math.max(0, 1 - ((y + 18) / 54) ** 2)));
      // chimney
      body.stone([[-9, -88], [9, -88], [10, -64], [-10, -64]], clay, { bevel: 3, face: 1 });
      body.rect(-11, -90, 22, 4, soot, 1);
      // dome of bricks
      body.fill(-60, -72, 60, 70, (x, y) => y >= -72 && y < 70 && Math.abs(x) <= hw(y), clay, (x, y) => {
        const row = Math.floor((y + 72) / 8), jx = Math.floor((row % 2) * 7 + x + 60) % 14;
        const my = Math.floor(y + 72) % 8;
        const nx = x / (hw(y) || 1);
        const base = 0.46 - nx * 0.28 - (y > 40 ? 0.08 : 0) + (y < -30 ? 0.12 * (1 + nx) : 0);
        const tint = ((K.hh(Math.floor((x + 60 + (row % 2) * 7) / 14), row, 5) % 3) - 1) * 0.07;
        if (my === 7 || jx === 0) return K.clamp(base - 0.28, 0, 0.99);   // mortar seam
        if (my === 0 || jx === 1) return K.clamp(base + 0.12 + tint, 0, 0.99); // lit brick edge
        return K.clamp(base + tint, 0, 0.99);
      });
      // teal glazed band with a highlight
      body.fill(-58, -4, 58, 6, (x, y) => y >= -4 && y < 5 && Math.abs(x) <= hw(y) + 1, glaze, (x, y) => K.clamp(0.62 - x / 140 - (y + 4) / 18, 0, 0.99));
      body.rect(-40, -3, 14, 1, glaze, 4);
      // firebox mouth
      const mouthIn = (x, y) => y >= 14 && y < 60 && Math.abs(x) <= 24 * (y < 26 ? Math.sqrt(Math.max(0, 1 - ((26 - y) / 12) ** 2)) : 1);
      const archIn = (x, y) => y >= 10 && y < 62 && Math.abs(x) <= 29 * (y < 26 ? Math.sqrt(Math.max(0, 1 - ((26 - y) / 16) ** 2)) : 1);
      body.fill(-30, 8, 30, 62, archIn, clay, (x, y) => K.clamp(0.72 - (y - 10) / 90 - x / 120, 0, 0.99));
      body.fill(-24, 14, 24, 60, mouthIn, soot, 0);
      body.outline();
      // flames rolling in the firebox
      const tongues = [[-14, 5], [-4, 9], [7, 6], [16, 4]];
      for (let i = 0; i < tongues.length; i++) {
        const [x, hgt] = tongues[i];
        const h = hgt + ((f + i * 2) % 3) * 4;
        const top = 60 - h * 3;
        const sway = ((f + i) % 3) - 1;
        fire.poly([[x - 7, 60], [x + sway * 2, top], [x + 7, 60]], fireR, 1);
        fire.poly([[x - 4, 60], [x + sway * 3, top + 8], [x + 4, 60]], fireO, 1);
        fire.poly([[x - 2, 60], [x + sway * 3, top + 18], [x + 2, 60]], fireY, 1);
      }
      fire.erase(-60, -100, 60, 100, (x, y) => !mouthIn(x, y));
      body.over(fire);
      // ember eyes in the dome
      for (const s of [-1, 1]) {
        body.poly([[s * 8, -30], [s * 22, -34], [s * 20, -28], [s * 9, -26]], soot, 0);
        body.poly([[s * 10, -30], [s * 20, -32], [s * 19, -29], [s * 10, -28]], eye, 2);
      }
      // smoke from the chimney
      for (let i = 0; i < 3; i++) {
        const k = ((f / 6) + i / 3) % 1;
        fx.ell(-2 + Math.sin(k * 6 + i) * 4 + k * 10, -94 - k * 34, 5 + k * 6, 4 + k * 4, smoke, (x, y) => K.clamp(0.8 - k * 0.5 - (y + 94 + k * 34) / 20, 0, 0.99));
      }
      H.glow(glowL, 0, 58, 44, 10, '#f09040', 0.34, 3);
      H.glow(glowL, 0, -30, 26, 8, '#ffb050', 0.12, 2);
      return glowL.over(body).over(fx);
    },
  });

  // ---- temple bell -----------------------------------------------------------------------
  // A cast bell swinging from its loop: bands, rows of bosses, a striking
  // seat, a dark mouth with its tongue, hollow eyes under the upper band and
  // ghost strands trailing below. Options: col (metal).
  def('bell', {
    w: 136, h: 204, ox: 68, oy: 78, frames: 8, ms: 140,
    build(L, f, o, H) {
      const col = o.col || '#8a7a4a';
      const M = K.mat(col, { n: 5, at: 2, step: 0.1, shift: 1.2 });
      const spec = K.solid(mixh(col, '#fff4d8', 0.7), { line: false });
      const cav = K.mat('#140e14', { n: 2, at: 0, line: false });
      const wisp = K.mat(mixh('#c8a0a8', col, 0.25), { n: 3, at: 1, step: 0.1, alpha: 160, line: false });
      const wisp2 = K.mat(mixh('#c8a0a8', col, 0.25), { n: 3, at: 1, step: 0.1, alpha: 90, line: false });
      const eyeM = K.mat(mixh('#f0d0d8', col, 0.2), { n: 3, at: 1, line: false });
      const a = [-0.13, -0.09, -0.03, 0.04, 0.1, 0.13, 0.08, -0.04][f];
      const strands = L.like(), B = L.like();
      for (let i = 0; i < 3; i++) H.tail(strands, -18 + i * 18 + Math.round(a * 60), 40, 46 - (i % 2) * 8, 5, H.ph(f, 8) + i * 1.7, [[0, 20, wisp], [20, 80, wisp2]], { amp: 6, curl: 8, dark: 0.1 });
      B.save().translate(0, -64).rotate(a).translate(0, 64);
      // hanging loop
      B.path([[-9, -58], [-10, -66], [-4, -72], [4, -72], [10, -66], [9, -58]], 5, M, 3);
      // body profile: dome shoulder, straight waist, flared lip
      const hw = (y) => (y < -42 ? 30 * Math.sqrt(Math.max(0, 1 - ((y + 42) / 18) ** 2)) : y < 22 ? 30 + (y + 42) * 0.03 : 32 + (y - 22) * 0.75);
      B.fill(-44, -62, 44, 36, (x, y) => y >= -60 && y < 36 && Math.abs(x) <= hw(y), M, (x, y) => {
        const v = K.cyl(-3, 36, { amb: 0.16, rim: 0.2 })(x, y);
        return y < -42 ? K.clamp(v + (-42 - y) / 60, 0, 0.99) : y > 26 ? K.clamp(v - 0.12, 0, 0.99) : v;
      });
      // bands: a raised line with a lit top edge
      for (const y of [-34, 14]) { const w2 = hw(y); B.line(-w2 + 1, y, w2 - 1, y, M, 0); B.line(-w2 + 2, y - 1, w2 - 2, y - 1, M, 4); B.line(-w2 + 2, y + 1, w2 - 2, y + 1, M, 3); }
      B.line(0, -34, 0, 14, M, 1); B.line(-1, -34, -1, 14, M, 3);
      // bosses in the upper field
      for (let r = 0; r < 3; r++) for (const cx of [-24, -17, -10, 8, 15, 22]) {
        const cy = -52 + r * 6;
        B.rect(cx, cy, 3, 3, M, 3); B.dot(cx, cy, M, 4); B.rect(cx + 1, cy + 3, 2, 1, M, 0);
      }
      // striking seat
      B.ell(-18, 24, 5, 4, M, 1); B.ell(-18, 24, 3, 2, M, 3);
      // hollow eyes under the upper band
      for (const s of [-1, 1]) { B.ell(s * 11 + 1, -24, 5, 3, cav, 0); B.rect(s * 11 - 1, -24, 3, 1, eyeM, 1); }
      // specular streak down the lit side
      B.rect(-24, -44, 2, 56, spec, 0); B.rect(-21, -40, 1, 20, spec, 0);
      // mouth and tongue
      B.ell(0, 34, 30, 4, cav, 0);
      B.path([[0, 20], [0, 34]], 2, M, 0);
      B.ell(0, 36, 5, 5, M, K.sphere(0, 36, 5, 5));
      B.restore();
      B.outline();
      return strands.over(B);
    },
  });

  // ---- fox -------------------------------------------------------------------------------
  // A sitting fox-spirit: tall ears, a ruff, narrow blue eyes with faint
  // red marks above them, and a great tail that sways behind. Options: col.
  def('fox', {
    w: 168, h: 156, ox: 78, oy: 72, dy: 18, frames: 4, seq: [0, 1, 2, 1, 0, 1, 2, 3], ms: 170,
    build(L, f, o, H) {
      const col = o.col || '#e8eef4';
      const M = K.mat(col, { n: 5, at: 3, step: 0.09, shift: 1.2 });
      const ruff = K.mat(mixh(col, '#ffffff', 0.45), { n: 4, at: 2, step: 0.07 });
      const inner = K.mat(mixh(col, '#b86a70', 0.5), { n: 3, at: 1, step: 0.08 });
      const mark = K.mat('#c85a4a', { n: 3, at: 1, line: false });
      const eyeM = K.mat('#3a5a8a', { n: 3, at: 1, line: false });
      const sw = [-0.08, 0, 0.08, 0][f];
      const tailL = L.like(), B = L.like();
      // tail: a thick curl from the hip, tapering to a pale tip
      tailL.save().translate(20, 40).rotate(sw).translate(-20, -40);
      const tp = [[18, 42, 26], [38, 36, 30], [54, 20, 28], [58, 0, 24], [52, -16, 18], [42, -24, 12], [34, -24, 6]];
      tailL.path(tp.map(([x, y, w]) => [x, y, w]), 20, M, (x, y) => K.clamp(0.5 - (x - 40) / 60 - (y - 10) / 110, 0, 0.99));
      tailL.path(tp.slice(4).map(([x, y, w]) => [x, y, w + 1]), 12, ruff, (x, y) => K.clamp(0.7 - (x - 40) / 60, 0, 0.99));
      for (const [x, y] of [[56, 14], [60, -2], [48, 30], [36, 40]]) tailL.poly([[x, y], [x + 7, y + 2], [x + 2, y + 6]], M, 1);
      tailL.restore();
      // body, haunch, front legs, paws
      B.ell(4, 30, 30, 30, M, K.sphere(-4, 18, 38, 40, { amb: 0.2 }));
      B.ell(22, 44, 15, 15, M, K.sphere(18, 38, 18, 18, { amb: 0.12 }));
      for (const x of [-10, 6]) { B.rect(x, 34, 9, 26, M, K.cyl(x + 3, 6)); B.ell(x + 4, 60, 7, 4, M, K.sphere(x + 2, 58, 7, 5)); B.line(x + 3, 60, x + 3, 63, M, 1); }
      // chest ruff with a jagged lower edge
      B.ell(-2, 12, 17, 18, ruff, K.sphere(-6, 6, 19, 20, { amb: 0.3 }));
      for (let x = -16; x < 14; x += 5) B.poly([[x, 24], [x + 5, 24], [x + 2, 31]], ruff, 1);
      // ears (the right one twitches on the blink frame)
      for (const s of [-1, 1]) {
        B.save();
        if (s > 0 && f === 3) B.translate(16, -32).rotate(0.12).translate(-16, 32);
        B.poly([[s * 7, -30], [s * 23, -58], [s * 25, -26]], M, s < 0 ? 3 : 2);
        B.poly([[s * 11, -31], [s * 21, -50], [s * 21, -30]], inner, 1);
        B.restore();
      }
      // head, cheek tufts, muzzle
      B.ell(0, -16, 23, 18, M, K.sphere(-4, -22, 26, 22, { amb: 0.22 }));
      for (const s of [-1, 1]) B.poly([[s * 18, -14], [s * 30, -4], [s * 16, -2]], M, s < 0 ? 3 : 1);
      B.ell(0, -5, 11, 8, ruff, K.sphere(-2, -8, 12, 9, { amb: 0.35 }));
      B.outline();
      tailL.outline();
      B.onto((b) => {
        b.rect(-2, -9, 5, 3, H.ink, 1); b.dot(-1, -9, H.white, 0);
        b.line(0, -6, 0, -3, H.ink, 1); b.line(0, -3, -3, -2, H.ink, 1); b.line(0, -3, 3, -2, H.ink, 1);
        for (const s of [-1, 1]) {
          if (f === 3) b.line(s * 9 - 3, -18, s * 9 + 3, -17, H.ink, 0);
          else { b.poly([[s * 5, -20], [s * 13, -21], [s * 12, -16], [s * 6, -16]], eyeM, 1); b.rect(s * 9 - 1, -20, 2, 4, H.ink, 0); b.dot(s * 9 - (s < 0 ? 1 : 0), -20, H.white, 0); }
          b.poly([[s * 6, -26], [s * 12, -30], [s * 10, -25]], mark, 1);
        }
      });
      return tailL.over(B);
    },
  });

  // ---- crab ------------------------------------------------------------------------------
  // A shore crab with a ridged shell, eyes on stalks, pincers that snap,
  // jointed legs, and two unreadable cargo tags stuck to its back.
  // Options: col.
  def('crab', {
    w: 196, h: 140, ox: 98, oy: 62, dy: 26, frames: 4, ms: 180,
    build(L, f, o, H) {
      const col = o.col || '#c86a4a';
      const M = K.mat(col, { n: 5, at: 2, step: 0.1, shift: 1.2 });
      const belly = K.mat(mixh(col, '#f0e0c8', 0.5), { n: 4, at: 2, step: 0.08 });
      const tag = K.mat('#f0e8d8', { n: 4, at: 2, step: 0.07 });
      const string = K.solid('#8a6a4a', { line: false });
      const lift = [0, 1, 0, -1][f];
      const legs = L.like(), B = L.like(), claws = L.like();
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        const up = ((i + f + (s > 0 ? 1 : 0)) % 2) * 3;
        const kx = s * (50 + i * 5), ky = 8 + i * 9 - up;
        legs.path([[s * 28, 20 + i * 6, 7], [kx, ky, 7], [s * (60 + i * 4), 46 + i * 3 - up, 4]], 7, M, (x, y) => K.clamp(0.5 - (y - 10) / 90 + (s < 0 ? 0.1 : -0.05), 0, 0.99));
        legs.rect(kx - 2, ky - 3, 4, 2, M, 3);
      }
      // shell: wide dome with a pale rim and bumps
      B.ell(0, 16, 46, 26, belly, 1);
      B.ell(0, 10, 45, 25, M, K.sphere(-10, 0, 50, 30, { amb: 0.18, rim: 0.12 }));
      B.fill(-44, 14, 44, 30, (x, y) => { const e = (x / 44) ** 2 + ((y - 10) / 24) ** 2; return e <= 1 && e > 0.72 && y > 18; }, belly, (x) => K.clamp(0.6 - x / 120, 0, 0.99));
      for (const [x, y] of [[-24, -4], [-12, -10], [4, -12], [18, -8], [30, 0], [-32, 6]]) { B.rect(x, y, 4, 3, M, 3); B.rect(x + 1, y + 3, 3, 1, M, 1); }
      // eye stalks
      for (const s of [-1, 1]) { B.path([[s * 9, -10], [s * 12, -22], [s * 13, -28]], 4, M, 2); B.ell(s * 13, -30, 5, 5, H.ink, 1); B.rect(s * 13 - 2, -33, 2, 2, H.white, 0); }
      // cargo tags on the shell, each with a string and unreadable lines
      for (const [x, y, r] of [[-20, 2, -0.2], [8, -2, 0.16]]) {
        B.save().translate(x, y).rotate(r);
        B.stone([[-8, -5], [8, -5], [10, 0], [8, 5], [-8, 5]], tag, { bevel: 2, face: 2 });
        B.ell(6, 0, 1.5, 1.5, M, 0);
        B.line(-5, -2, 2, -2, H.ink, 2); B.line(-5, 1, 0, 1, H.ink, 2);
        B.line(7, 0, 12, -6, string, 0);
        B.restore();
      }
      B.path([[-6, 26], [6, 26]], 2, H.ink, 1);
      // claws: arm, then a big pincer that opens and closes
      // claws: a bent arm, a heavy palm, and two fingers that part and close
      for (const s of [-1, 1]) {
        const up = (s < 0 ? lift : -lift) * 2, open = (f + (s > 0 ? 2 : 0)) % 4 < 2 ? 0.42 : 0.06;
        const lit = s < 0 ? 0.1 : -0.08;
        claws.path([[s * 34, 8, 9], [s * 50, 4 + up, 9], [s * 54, -10 + up, 8]], 9, M, (x, y) => K.clamp(0.5 - y / 90 + lit, 0, 0.99));
        claws.save().translate(s * 52, -24 + up).scale(s, 1).rotate(-0.5);
        claws.ell(0, 0, 16, 12, M, (x, y) => K.clamp(0.62 - (x * s * 0.6 + y) / 34 + lit, 0, 0.99));
        claws.rect(-6, -7, 6, 3, M, 4);
        claws.save().translate(10, -5).rotate(-open);
        claws.poly([[0, -5], [14, -10], [26, -9], [30, -5], [20, -3], [4, 4]], M, (x, y) => K.clamp(0.7 - y / 20 + lit, 0, 0.99));
        claws.line(8, -5, 24, -6, M, 1);
        claws.restore();
        claws.save().translate(10, 5).rotate(open * 0.7);
        claws.poly([[0, -4], [16, -3], [24, 0], [18, 4], [2, 5]], M, (x, y) => K.clamp(0.4 - y / 24 + lit, 0, 0.99));
        claws.restore();
        claws.restore();
      }
      legs.outline(); B.outline(); claws.outline();
      return legs.over(B).over(claws);
    },
  });

  // ---- hush wraith -----------------------------------------------------------------------
  // A tall pale veil with a hollow ring for a face, folds falling to a
  // tattered hem that fades out, and blank scraps drifting near it.
  def('hush', {
    w: 150, h: 200, ox: 75, oy: 96, frames: 6, ms: 170,
    bob: (t) => Math.sin(t / 700) * 5,
    build(L, f, o, H) {
      const col = o.col || '#e8e6f0';
      const M = K.mat(col, { n: 5, at: 3, step: 0.085, shift: 1.4 });
      const Mf = K.mat(col, { n: 4, at: 2, step: 0.085, alpha: 170, line: false });
      const Mf2 = K.mat(col, { n: 3, at: 1, step: 0.085, alpha: 90, line: false });
      const ring = K.mat('#1a1830', { n: 3, at: 1, step: 0.05 });
      const scrap = K.mat('#f0eee6', { n: 3, at: 1, step: 0.08 });
      const ph = H.ph(f, 6);
      const B = L.like(), bits = L.like();
      const hw = (y) => (y < -40 ? 20 * Math.sqrt(Math.max(0, 1 - ((y + 40) / 32) ** 2)) : y < -8 ? 20 + (y + 40) * 0.65 : 41 + (y + 8) * 0.1);
      // tattered hem: strips of different lengths, swaying
      const hem = (x) => {
        const k = Math.floor((x + 64) / 8), u = ((x + 64) % 8) / 8;
        const len = 60 + (K.hh(k, 3, 11) % 16);
        return len + Math.round(Math.sin(ph + k * 0.9) * 3) - Math.round(Math.abs(u - 0.5) * 8);
      };
      const fold = (x, y) => K.clamp(0.55 - x / 120 + 0.18 * Math.cos((x + Math.sin(ph + y / 30) * 2) / 5.5) * Math.min(1, (y + 30) / 50) - (y > 40 ? (y - 40) / 160 : 0), 0, 0.99);
      // solid down to where each strip starts to thin, then two translucent
      // ramps toward its tip (no outline there)
      B.fill(-60, -74, 60, 90, (x, y) => y >= -72 && y < hem(x) - 14 && Math.abs(x) <= hw(y), M, fold);
      B.fill(-60, 30, 60, 90, (x, y) => y >= hem(x) - 14 && y < hem(x) - 6 && Math.abs(x) <= hw(y), Mf, fold);
      B.fill(-60, 30, 60, 90, (x, y) => y >= hem(x) - 6 && y < hem(x) && Math.abs(x) <= hw(y), Mf2, fold);
      // the hollow ring face with a shadow crescent inside
      B.fill(-14, -58, 14, -30, (x, y) => { const d = Math.hypot(x, y + 44); return d <= 11.5 && d >= 8; }, ring, (x, y) => K.clamp(0.4 + (x + y + 44) / 40, 0, 0.99));
      B.fill(-9, -53, 9, -35, (x, y) => { const d = Math.hypot(x, y + 44); return d < 8 && Math.hypot(x + 2, y + 46) > 7; }, M, 1);
      B.outline();
      for (let i = 0; i < 3; i++) {
        const k = ((f / 6) + i / 3) % 1;
        const x = [-50, 46, -38][i] + Math.sin(k * 6 + i) * 4, y = [10, -20, 44][i] - k * 30;
        bits.save().translate(x, y).rotate(k * 3 + i);
        bits.rect(-3, -2, 6, 5, scrap, (px, py) => K.clamp(0.6 - (px + py) / 12, 0, 0.99));
        bits.restore();
      }
      bits.outline();
      if (f % 3 !== 1) bits.fade(0.85);
      return B.over(bits);
    },
  });

  // ---- spirit (a generic veil; not used by the current bestiary) ------------------------
  def('spirit', {
    w: 120, h: 160, ox: 60, oy: 72, frames: 6, ms: 160,
    bob: (t) => Math.sin(t / 450) * 5,
    build(L, f, o, H) {
      const col = o.col || '#e8e4ff';
      const M = K.mat(col, { n: 5, at: 3, step: 0.09, alpha: 220 });
      const B = L.like();
      B.ell(0, -22, 24, 26, M, K.sphere(-2, -26, 26, 28, { amb: 0.25 }));
      H.tail(B, 0, -10, 76, 24, H.ph(f, 6), [[0, 50, M], [50, 100, K.mat(col, { n: 4, at: 2, step: 0.09, alpha: 120, line: false })]], { amp: 6, curl: 12 });
      B.outline();
      H.eyes(B, 0, -18, 8, { rx: 3, ry: 5 });
      return B;
    },
  });

  // ---- the Blank Cartographer (Unwritten Atlas boss) ------------------------------------
  // A hooded figure folded out of unfinished maps: paper panels with grid
  // and contour lines, a dotted route that stops short, a hollow hood with
  // pale eyes, and a chart unrolling from one hand. Options: pale.
  def('atlas_cartographer', {
    w: 176, h: 200, ox: 84, oy: 100, frames: 6, ms: 160,
    bob: (t) => Math.sin(t / 520) * 4,
    build(L, f, o, H) {
      const paper = K.mat(o.pale ? '#f0e8d4' : '#e8dcc0', { n: 5, at: 3, step: 0.08, shift: 1.2 });
      const grid = K.solid(o.pale ? '#d2c6a8' : '#b4a684', { line: false });
      const route = K.solid('#8a5a3a', { line: false });
      const hood = K.mat('#2a2a3a', { n: 3, at: 1, step: 0.06 });
      const eyeM = K.mat('#9ec4f0', { n: 3, at: 1, line: false });
      const chart = K.mat('#f8f2e2', { n: 4, at: 2, step: 0.07 });
      const unroll = [0, 3, 6, 8, 6, 3][f];
      const flut = [0, 1, 2, 1, 0, -1][f];
      const B = L.like(), front = L.like();
      // cloak of folded sheets: three panels, each its own flat facet
      const panels = [
        [[[-4, -42], [-40, 76 + flut], [-18, 78], [-2, 20]], 3],
        [[[-4, -42], [-2, 20], [-18, 78], [18, 78 - flut], [4, 20]], 2],
        [[[4, 20], [18, 78 - flut], [42, 74], [6, -40]], 1],
      ];
      for (const [pts, k] of panels) B.poly(pts, paper, k);
      B.poly([[-20, -46], [0, -70], [20, -46], [22, -26], [-22, -26]], paper, (x, y) => K.clamp(0.72 - (x + 20) / 70, 0, 0.99));
      B.onto((b) => {
        for (let x = -36; x <= 40; x += 9) b.line(x, -40, x + (x < 0 ? -2 : 2), 78, grid, 0);
        for (let y = -20; y <= 70; y += 10) b.line(-40, y, 42, y, grid, 0);
        // contour lines of an unfinished hill
        for (let r = 0; r < 3; r++) for (let a = 0; a < 20; a++) {
          const t0 = (a / 20) * Math.PI * 2, t1 = ((a + 1) / 20) * Math.PI * 2;
          if (a % 5 === 4) continue;
          b.line(12 + Math.cos(t0) * (6 + r * 5), 50 + Math.sin(t0) * (4 + r * 3), 12 + Math.cos(t1) * (6 + r * 5), 50 + Math.sin(t1) * (4 + r * 3), grid, 0);
        }
        // a dotted route that stops short
        const rt = [[-28, 60], [-20, 44], [-8, 38], [-6, 24], [6, 14]];
        for (let i = 1; i < rt.length; i++) for (let k = 0; k < 4; k += 2) {
          const u = k / 4, x = rt[i - 1][0] + (rt[i][0] - rt[i - 1][0]) * u, y = rt[i - 1][1] + (rt[i][1] - rt[i - 1][1]) * u;
          b.rect(Math.round(x), Math.round(y), 2, 2, route, 0);
        }
        b.fill(-33, 55, -23, 65, (x, y) => { const d = Math.hypot(x + 28, y - 60); return d <= 4.5 && d >= 2.5; }, route, 0);
      });
      // fold creases between panels
      B.line(-2, 20, -18, 78, paper, 0); B.line(4, 20, 18, 78 - flut, paper, 1);
      // hood opening: a hollow with pale eyes
      B.ell(0, -40, 13, 11, hood, K.sphere(3, -36, 14, 12, { amb: 0.1 }));
      for (const s of [-1, 1]) { B.rect(s * 5 - 2, -42, 4, 3, eyeM, 1); B.dot(s * 5 - 2, -42, eyeM, 2); }
      B.outline();
      // the chart unrolling from its hand
      front.ell(30, -4, 6, 5, paper, 2);
      front.rect(34, -8, 22, 30 + unroll, chart, (x, y) => K.clamp(0.7 - (x - 34) / 60 - (y + 8) / 200, 0, 0.99));
      front.rect(33, -11, 24, 5, chart, K.cyl(45, 12));
      front.rect(33, 20 + unroll, 24, 5, chart, K.cyl(45, 12));
      front.onto((b) => { for (let y = -2; y < 18 + unroll; y += 5) b.line(38, y, 38 + 6 + ((y * 7) % 9), y, grid, 0); });
      front.outline();
      const out = B.over(front);
      if (o.pale) out.fade(0.85);
      return out;
    },
  });

  return { def, P, A, draw, drawArt, drawPosed, motion, styleOf, STYLE, MOVES, frame, has, frameAt, extent, H };
})();
