/* Creatures B — veils: the Hush Wraith (sa.wraith, family 'hush') and the spare spirit veil
 * (family 'spirit', defined for completeness; no enemy in the current bestiary uses it).
 *
 * Hush Wraith: a tall pale veil with a hollow ring for a face, folds falling from a hooded
 * crown to a tattered hem, and blank scraps drifting near it. Anatomy (cloth / spirit): the
 * crown leads and the cloth follows from it — the folds bend, the hem lags and flares, the
 * ring keeps its place in the hood. Its movement is coherent expansion and return: it gathers
 * itself tall and narrow, spreads wide, folds back. Strike: it gathers, then lunges and a fold
 * of cloth whips out like a sleeve and wraps its one target, smothering; it draws back. Hush:
 * it spreads wide like an embrace and its ring opens into a soundless hollow; a pale wave
 * rolls out; it folds back. Re-tying: one strip of its hem lengthens down to a loose knot. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E, S = CB.S;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));

  // ======================================================================================
  // HUSH WRAITH
  // ======================================================================================
  // the veil: pale lavender cloth (violet in its folds' shadows, warm white on its lit ridges),
  // translucent toward the hem; the ring face of dark lacquer; blank paper scraps
  const VPAL = { veil: ['#262050', '#433d7c', '#6e68a8', '#a6a2d4', '#d8d8f0', '#f6f6ff', '#fffcf0'], ring: ['#08061a', '#1a1636', '#2e2a52', '#4a4678'] };
  function drawHush(L, o, q, H) {
    const col = o.col || '#e8e6f0';
    const VC = col.toLowerCase() === '#e8e6f0' ? VPAL.veil : S.ramp(col, { n: 7, at: 4, lo: 0.14 });
    const dimK = Math.round((q.dim || 0) * 4);
    const M = S.mat(VC, { at: 4, rim: '#a8e4ff', litk: 0.16 });
    const Mf = S.mat(VC, { at: 4, alpha: 180, rim: '#a8e4ff', line: S.deep(VC[0], 0.22) });
    const Mf2 = S.mat(VC, { at: 4, alpha: 100, line: false });
    const ring = S.mat(VPAL.ring, { at: 2, litk: 0.3 });
    const voidM = S.mat(['#05040e', '#0e0c1e', '#2a2050'], { at: 0, line: false });
    const scrap = S.mat(['#5a5470', '#a8a4b4', '#e4e0d8', '#fbf8f0'], { at: 2 });
    const ink = S.mat(['#3a3448'], { at: 0, line: false });
    const ph = q.hph || 0;
    const B = L.like(), bits = L.like(), arm = L.like();
    const sp = q.spread || 1, ht = q.height || 1, lean = q.lean || 0;
    const top = -72 * ht;
    // the profile: a hooded crown peaked toward the party, shoulders, falling cloth — the near (left)
    // side full, the far (right) side foreshortened
    const hw0 = (y) => (y < -40 ? 20 * Math.sqrt(Math.max(0, 1 - ((y + 40) / 32) ** 2)) : y < -8 ? 20 + (y + 40) * 0.65 : 41 + (y + 8) * 0.1);
    const yU = (y) => y / ht;
    const hw = (y) => hw0(yU(y)) * (1 + (sp - 1) * K.clamp((yU(y) + 20) / 70, 0, 1));
    const hood = (y) => (yU(y) < -40 ? -6 * K.clamp((-40 - yU(y)) / 30, 0, 1) : 0); // the hood's peak leans forward
    const cx = (y) => hood(y) + lean * K.clamp(1 - (y - top) / 150, 0, 1) + Math.sin(ph + y / 26) * (q.wave || 1.2) * K.clamp((y + 10) / 60, 0, 1);
    const wl = (y) => hw(y) * 1.06, wr = (y) => hw(y) * (yU(y) < -40 ? 0.94 : 0.8);       // near and far half-widths
    const lift = q.lift || 0;
    const hem = (x) => {
      const k = Math.floor((x + 80) / 8), u = ((x + 80) % 8) / 8;
      const len = (60 + (K.hh(k, 3, 11) % 16) + (x > 10 ? 6 : 0)) * ht - lift;          // the far side trails longer behind
      return len + Math.round(Math.sin(ph + k * 0.9) * (3 + (q.flare || 0) * 0.4)) - Math.round(Math.abs(u - 0.5) * 9);
    };
    const inside = (x, y) => { const d = x - cx(y); return y >= top && (d < 0 ? -d <= wl(y) : d <= wr(y)); };
    const tAt = (x, y) => { const d = x - cx(y); return d < 0 ? d / wl(y) : d / wr(y); };     // −1 near edge … 1 far edge
    // folds falling from the crown: each a ridge lit on its left with a hard shadow on its right;
    // the whole veil darker toward the far side and the hem; strand clusters break the edges
    const CREST = [-0.7, -0.22, 0.26, 0.7];
    const jit = S.strands(Math.PI / 2, { w: 4, len: 12, amp: 0.2, seed: 13 });
    const fold = (x, y) => {
      const t = tAt(x, y) + Math.sin(ph + y / 30) * 0.05 * Math.min(1, (y + 30) / 50);
      const near = y < -46 * ht ? 0 : Math.min(1, (y + 46 * ht) / 40);                      // folds open below the hood
      let k = 4.6 - (t + 1) * 1.15 - (y > 40 ? (y - 40) / 40 : 0);
      if (near > 0) {
        let best = 9, bd = 0;
        for (const c of CREST) { const d = t - c * (0.6 + 0.4 * near) * sp ** 0.2; if (Math.abs(d) < Math.abs(best)) { best = d; bd = d; } }
        if (bd > 0.03 && bd < 0.26) k -= (bd < 0.12 ? 1.8 : 1.1) * near;  // the shadow side of the fold (deepest by the ridge)
        else if (bd <= 0.03 && bd > -0.08) k += 1.1 * near;             // the lit ridge
      }
      k += jit(x, y) - dimK;
      return S.step(Math.round(k), 7);
    };
    const W = 90;
    B.fill(-W, top - 2, W, 100, (x, y) => inside(x, y) && y < hem(x) - 14, M, fold);
    B.fill(-W, top, W, 110, (x, y) => inside(x, y) && y >= hem(x) - 14 && y < hem(x) - 6, Mf, fold);
    B.fill(-W, top, W, 110, (x, y) => inside(x, y) && y >= hem(x) - 6 && y < hem(x), Mf2, fold);
    // one strip of the hem lengthens toward a loose knot (re-tying): cloth, wavering as it goes
    if (q.strip > 0.05) {
      const st = q.strip, x0 = -24 + cx(50), y0 = 50 * ht, len = 50 * st;
      B.fill(x0 - len - 8, y0 - 4, x0 + 8, y0 + len + 8, (x, y) => {
        const k = (y - y0) / Math.max(1, len);
        if (k < 0 || k > 1) return false;
        const c0 = x0 - k * len * 0.7 + Math.sin(k * 7 + ph) * 2;
        return Math.abs(x - c0) <= 3.5 - k * 1.5 && !(k > 0.9 && (Math.floor(x) % 3 === 0));
      }, M, (x, y) => { const k = (y - y0) / Math.max(1, len), c0 = x0 - k * len * 0.7 + Math.sin(k * 7 + ph) * 2; return S.step(x < c0 ? 5 : 3, 7); });
    }
    // the ring face in the hood (turned toward the party): a lacquer-dark ring, a shadow crescent
    // under its upper rim; it opens into a void (Hush)
    const fy = -44 * ht + (q.bow || 0) * 6, fx0 = cx(fy) - 6;
    const rr = 11.5 * (q.ring || 1), op = q.open || 0;
    // the hood's opening casts a shadow round the ring
    B.fill(fx0 - rr - 6, fy - rr - 6, fx0 + rr + 6, fy + rr + 6, (x, y) => { const d = Math.hypot((x - fx0) / 0.86, (y - fy) / (1 + op * 0.25)); return d <= rr + 4 && d > rr - 1 && inside(x, y); }, M, (x, y) => S.step((y > fy && x > fx0 - 4) ? 2 : 3, 7));
    B.fill(fx0 - rr - 3, fy - rr - 3, fx0 + rr + 3, fy + rr + 3, (x, y) => { const d = Math.hypot((x - fx0) / 0.86, (y - fy) / (1 + op * 0.25)); return d <= rr && d >= rr - 3.5; }, ring, (x, y) => S.step(x - fx0 + y - fy < -8 ? 3 : x - fx0 + y - fy < 4 ? 2 : 1, 4));
    if (op > 0.1) {
      B.fill(fx0 - rr, fy - rr * 1.3, fx0 + rr, fy + rr * 1.3, (x, y) => Math.hypot((x - fx0) / 0.86, (y - fy) / (1 + op * 0.25)) < rr - 3.5, voidM, (x, y) => S.step(Math.hypot((x - fx0) / 0.86, (y - fy) / (1 + op * 0.25)) > rr - 5.5 ? 2 : 0, 3));
    } else {
      B.fill(fx0 - 9, fy - 9, fx0 + 9, fy + 9, (x, y) => { const d = Math.hypot((x - fx0) / 0.86, y - fy); return d < rr - 3.5; }, M, (x, y) => S.step(Math.hypot((x - fx0 + 2) / 0.86, y - fy + 2) > rr - 5 ? 2 : 4, 7));
    }
    // the sleeve: a fold of cloth that whips out toward the party (strike) — the same veil, its
    // folds running along it, tapering to a tattered end
    if (q.reach > 0.05) {
      const rk = q.reach, sx = cx(-14) - wl(-14) + 8, sy = -14 * ht;
      const len = 20 + 50 * rk, droop = 10 - 14 * rk;
      const cyAt = (k) => sy + Math.sin(k * Math.PI) * droop + k * 6 + Math.sin(ph * 2 + k * 6) * 2 * (1 - rk);
      const wAt = (k) => 11 * (1 - k * 0.62) + Math.sin(k * 9 + ph) * 1.2;
      arm.fill(sx - len - 4, sy - 24, sx + 6, sy + 30, (x, y) => {
        const k = (sx - x) / len;
        if (k < 0 || k > 1) return false;
        if (k > 0.86 && (Math.floor(y) % 4) >= 2) return false;
        return Math.abs(y - cyAt(k)) <= wAt(k);
      }, M, (x, y) => { const k = (sx - x) / len, d = (y - cyAt(k)) / Math.max(1, wAt(k)); const crease = Math.cos(k * 13 + d * 2) > 0.55; return S.step(d < -0.45 ? 5 : d > 0.5 ? 2 : crease ? 3 : 4, 7); });
    }
    B.outline(); arm.outline();
    S.cast(arm, B, 2, 3, 1);
    // blank scraps drifting near it (flung out when it spreads or loosens)
    const sc = q.scatter || 0;
    for (let i = 0; i < 4; i++) {
      const k = ((q.sph || 0) / 6 + i / 4) % 1;
      const r0 = 1 + sc * 0.6;
      const x = ([-50, 46, -38, 54][i]) * r0 + Math.sin(k * 6 + i) * 4, y = [10, -20, 44, 26][i] - k * 30 - sc * 10;
      bits.save().translate(Math.round(x), Math.round(y)).rotate(k * 3 + i);
      bits.rect(-3, -2, 7, 5, scrap, (px, py) => S.step(px + py < -1 ? 3 : px + py < 3 ? 2 : 1, 4));
      bits.line(-2, 0, 2, 0, ink, 0);
      bits.restore();
    }
    bits.outline();
    if (Math.round(q.sph || 0) % 3 !== 1) bits.fade(0.85);
    const out = B.over(arm);
    S.rim(out, { w: 2 });
    return out.over(bits);
  }
  const HB = { spread: 1, height: 1, lean: 0, wave: 1.2, lift: 0, flare: 0, hph: 0, sph: 0, ring: 1, open: 0, bow: 0, reach: 0, strip: 0, scatter: 0, dim: 0 };
  const hushIdle = [];
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2;
    // a slow breath: it swells a little and settles; the hem ripples from the crown down
    hushIdle.push({ hph: a, sph: f * 0.75, spread: 1 + Math.sin(a) * 0.03, height: 1 + Math.sin(a + Math.PI) * 0.015, lean: Math.sin(a - 0.5) * 2, ring: f === 5 ? 0.92 : 1 });
  }
  const hk = (from, ...st) => CB.keys(Object.assign({}, HB, from), ...st);
  const hushActs = {
    // Strike: it gathers tall and narrow (hem lifting), lunges; the sleeve whips out and wraps
    'prep:strike': hk({}, [{ spread: 0.88, height: 1.06, lift: 10, ring: 0.85, lean: 6, hph: 1 }, 2, E.out], [{ spread: 0.8, height: 1.1, lift: 16, ring: 0.8, lean: 10, hph: 2 }, 2, E.io]),
    'exec:strike': hk({ spread: 0.8, height: 1.1, lift: 16, ring: 0.8, lean: 10 }, [{ spread: 0.95, height: 1.02, lift: 6, lean: -14, reach: 0.5, flare: 6, hph: 3 }, 1, E.in], [{ spread: 1.05, height: 1, lift: 0, lean: -20, reach: 1, flare: 10, hph: 4 }, 1, E.out], [{ lean: -18, reach: 0.95, flare: 8, hph: 5 }, 1, E.lin]),
    'recover:strike': hk({ spread: 1.05, lean: -18, reach: 0.95, flare: 8 }, [{ spread: 1.02, lean: -6, reach: 0.4, flare: 4, hph: 6 }, 2, E.io], [{ spread: 1, lean: 3, reach: 0, flare: 0, hph: 7 }, 2, E.io], [{ lean: 0, hph: 8 }, 1, E.out]),
    // Hush: it spreads wide like an embrace, its ring opens into a soundless hollow; folds back
    'cast:silence': hk({}, [{ spread: 1.15, height: 0.98, ring: 1.15, open: 0.4, lift: 6, flare: 6, hph: 1 }, 2, E.out], [{ spread: 1.35, height: 0.96, ring: 1.35, open: 1, lift: 12, flare: 12, scatter: 0.6, hph: 2, sph: 1 }, 2, E.io], [{ spread: 1.4, ring: 1.4, open: 1, lift: 14, flare: 14, scatter: 1, hph: 3, sph: 2 }, 2, E.lin], [{ spread: 1.3, ring: 1.3, hph: 4, sph: 3 }, 1, E.lin]),
    'recover:silence': hk({ spread: 1.3, height: 0.96, ring: 1.3, open: 1, lift: 14, flare: 14, scatter: 1, sph: 3 }, [{ spread: 1.1, ring: 1.1, open: 0.3, lift: 5, flare: 5, scatter: 0.4, hph: 5, sph: 4 }, 2, E.io], [{ spread: 1, height: 1, ring: 1, open: 0, lift: 0, flare: 0, scatter: 0, hph: 6, sph: 5 }, 2, E.out]),
    // Re-tying: it bows, and one strip of its hem lengthens down to a loose knot
    'cast:mend': hk({}, [{ bow: 1, lean: -4, ring: 0.9, hph: 1 }, 2, E.out], [{ bow: 1.5, lean: -8, strip: 0.6, hph: 2 }, 2, E.io], [{ strip: 1, hph: 3 }, 2, E.io], [{ strip: 1, hph: 4 }, 2, E.lin]),
    'recover:mend': hk({ bow: 1.5, lean: -8, strip: 1, ring: 0.9 }, [{ bow: 0.6, lean: -3, strip: 0.4, hph: 5 }, 2, E.io], [{ bow: 0, lean: 0, strip: 0, ring: 1, hph: 6 }, 2, E.out]),
    // reactions
    recoil: hk({}, [{ lean: 16, flare: 10, spread: 1.08, ring: 0.8, hph: 1 }, 1, E.out], [{ lean: -5, flare: 4, spread: 1.02, ring: 0.9, hph: 2 }, 1, E.io], [{ lean: 3, flare: 1, hph: 3 }, 1, E.io], [{ lean: 0, flare: 0, spread: 1, ring: 1 }, 1, E.out]),
    release: hk({}, [{ scatter: 0.7, flare: 6, ring: 1.1, hph: 1, sph: 1 }, 1, E.out], [{ scatter: 1, flare: 8, height: 1.02, hph: 2, sph: 2 }, 1, E.io], [{ scatter: 0.5, flare: 3, height: 1, hph: 3, sph: 3 }, 1, E.io], [{ scatter: 0, flare: 0, ring: 1, hph: 4, sph: 4 }, 1, E.out]),
    balk: hk({ spread: 0.8, height: 1.1, lift: 16, ring: 0.8, lean: 10 }, [{ spread: 1.12, height: 0.94, lift: 0, ring: 1.15, lean: 4, flare: 8, hph: 1 }, 1, E.out], [{ spread: 0.96, height: 1.02, ring: 0.95, flare: 3, hph: 2 }, 1, E.io], [{ spread: 1.03, height: 0.99, flare: 1, hph: 3 }, 1, E.io], [{ spread: 1, height: 1, ring: 1, lean: 0, flare: 0 }, 1, E.out]),
    settle: hk({}, [{ height: 0.9, spread: 1.08, ring: 0.9, dim: 0.1 }, 1, E.out], [{ height: 0.72, spread: 1.2, ring: 0.7, dim: 0.2, flare: 6 }, 1, E.io], [{ height: 0.58, spread: 1.3, ring: 0.5, dim: 0.25, flare: 10 }, 1, E.io], [{ height: 0.5, spread: 1.34, ring: 0.4, dim: 0.3, flare: 12 }, 1, E.out]),
    rest: hk({}, [{ height: 0.97, spread: 1.04, ring: 0.9, bow: 0.6, hph: 1 }, 1, E.io], [{ height: 0.95, spread: 1.06, ring: 0.85, bow: 1, dim: 0.1, hph: 2 }, 1, E.io], [{ height: 0.95, spread: 1.06, ring: 0.85, bow: 1, dim: 0.1, hph: 3 }, 1, E.io], [{ height: 0.97, spread: 1.03, ring: 0.92, bow: 0.5, hph: 4 }, 1, E.io]),
  };
  CB.rig('hush', {
    w: 232, h: 236, ox: 130, oy: 112, ms: 160,
    bob: (t) => Math.sin(t / 700) * 5,
    base: HB, idle: hushIdle, acts: hushActs,
    keys: { strike: ['exec:strike', 1], silence: ['cast:silence', 4], mend: ['cast:mend', 5] },
    alias: { prep: 'prep:strike' },
    draw: drawHush,
  });
  CB.deliver('hush', ['strike'], (a) => {
    const blk = CB.blocked(a), peak = blk ? 0.32 : 0.46;
    return CB.play(a, {
      key: 'key:strike', contact: 660, end: 1300,
      parts: [
        { at: 0, act: 'prep:strike', d: 340 },
        { at: 340, act: 'exec:strike', d: 340, travel: { to: a.aimed, peak, arc: 6, shape: 'out' } },
        blk ? { at: 680, act: 'balk', d: 280, travel: { to: a.aimed, peak, shape: 'back' } } : null,
        { at: blk ? 960 : 680, act: 'recover:strike', d: blk ? 340 : 620, travel: blk ? null : { to: a.aimed, peak, shape: 'back' } },
      ].filter(Boolean),
      fx: [{ at: 620, name: 'cbWrap', d: 520, p: { to: a.aimed, short: blk } }],
    });
  });
  CB.deliver('hush', ['silence'], (a) => CB.play(a, {
    key: 'key:silence', contact: 780, end: 1380,
    parts: [{ at: 0, act: 'cast:silence', d: 840 }, { at: 840, act: 'recover:silence', d: 540 }],
    fx: [{ at: 420, name: 'cbToll', d: 640, p: { mode: 'mute', dx: -2, dy: -44, to: 'party' } }],
  }));
  CB.deliver('hush', ['mend'], (a) => {
    const fv = a.fv || {};
    return CB.play(a, {
      key: 'key:mend', contact: 780, end: 1320,
      parts: [{ at: 0, act: 'cast:mend', d: 840 }, { at: 840, act: 'recover:mend', d: 480 }],
      fx: [{ at: 380, name: 'cbMend', d: 640, p: { dx: -62, dy: 96, i: fv.knots < fv.maxKnots ? Math.min(fv.maxKnots - 1, fv.knots) : null, col: '#e8e6f0' } }],
    });
  });
  CB.deliver('hush', ['*'], (a) => CB.play(a, {
    key: 'key:silence', contact: 700, end: 1200,
    parts: [{ at: 0, act: 'cast:silence', d: 760 }, { at: 760, act: 'recover:silence', d: 440 }],
  }));

  // ======================================================================================
  // SPIRIT (a generic veil; no enemy uses it today — kept coherent in case one does)
  // ======================================================================================
  function drawSpirit(L, o, q, H) {
    const col = o.col || '#e8e4ff';
    const SC = S.ramp(col, { n: 6, at: 4, lo: 0.16, hi: 0.97 });
    const M = S.mat(SC, { at: 4, alpha: 230, rim: '#a8e4ff', litk: 0.16 });
    const Mt = S.mat(SC, { at: 4, alpha: 120, line: false });
    const ink = S.mat(['#0e0a1c', '#241c3a'], { at: 0, line: false });
    const white = K.solid('#fffdf6', { line: false });
    const glow = L.like(), B = L.like();
    if (q.glow > 0.05) H.glow(glow, 0, -22, 30 + q.glow * 10, 32 + q.glow * 10, col, 0.3 * q.glow, 3);
    const sx = q.sx || 1, sy = q.sy || 1, lx = q.lean || 0;
    // a round head lit from the upper left (hard bands), turned a little toward the party
    H.tail(B, lx * 0.6 + 2, -16, 76 * (q.tl || 1), 22 * sx, q.tph || 0, [[0, 50, M], [50, 120, Mt]], { amp: q.tamp == null ? 6 : q.tamp, curl: 12, lean: q.tlean || 0 });
    B.ell(lx, -22, 24 * sx, 26 * sy, M, S.sph(lx - 4, -28, 26 * sx, 28 * sy, 6, { bias: 0.15 }));
    B.outline();
    for (const [ex, w] of [[lx - 13, 2], [lx + 1, 3]]) { if (q.blink) B.rect(ex - w, -18, w * 2, 1, ink, 0); else { B.ell(ex, -18, w, 5, ink, 0); B.rect(ex - 1, -21, 2, 2, white, 0); } }
    const out = glow.over(B);
    S.rim(out, { w: 2 });
    return out;
  }
  const SB = { sx: 1, sy: 1, lean: 0, tph: 0, tamp: 6, tlean: 0, tl: 1, glow: 0, blink: false };
  const spIdle = [];
  for (let f = 0; f < 6; f++) { const a = (f / 6) * Math.PI * 2; spIdle.push({ tph: a, sx: 1 + Math.sin(a) * 0.03, sy: 1 - Math.sin(a) * 0.03, blink: f === 4 }); }
  const sk = (from, ...st) => CB.keys(Object.assign({}, SB, from), ...st);
  const spActs = {
    'prep:strike': sk({}, [{ sx: 1.12, sy: 0.88, lean: 4, tlean: 0.2 }, 3, E.out]),
    'exec:strike': sk({ sx: 1.12, sy: 0.88, lean: 4, tlean: 0.2 }, [{ sx: 0.86, sy: 1.12, lean: -6, tlean: 0.45, tl: 1.2, tph: 1 }, 2, E.out], [{ sx: 0.92, sy: 1.06, lean: -5, tph: 2 }, 1, E.lin]),
    'recover:strike': sk({ sx: 0.92, sy: 1.06, lean: -5, tlean: 0.45, tl: 1.2 }, [{ sx: 1, sy: 1, lean: 0, tlean: 0, tl: 1, tph: 3 }, 3, E.io]),
    'cast:any': sk({}, [{ sx: 1.08, sy: 1.08, glow: 0.6, tamp: 9 }, 2, E.out], [{ sx: 1.12, sy: 1.1, glow: 1, tph: 1.5 }, 2, E.io], [{ sx: 1, sy: 1, glow: 0.4, tph: 3 }, 2, E.io]),
    recoil: sk({}, [{ sx: 0.9, sy: 1.08, lean: 6, tlean: -0.3 }, 1, E.out], [{ sx: 1.04, sy: 0.97, lean: -2 }, 1, E.io], [{ sx: 1, sy: 1, lean: 0, tlean: 0 }, 1, E.out]),
    release: sk({}, [{ glow: 0.5, tamp: 9, blink: true }, 1, E.out], [{ glow: 0.3, tph: 2 }, 1, E.io], [{ glow: 0, tamp: 6, blink: false }, 1, E.out]),
    balk: sk({ sx: 1.12, sy: 0.88, lean: 4 }, [{ sx: 0.94, sy: 1.06, lean: -1 }, 1, E.out], [{ sx: 1.03, sy: 0.98 }, 1, E.io], [{ sx: 1, sy: 1, lean: 0 }, 1, E.out]),
    settle: sk({}, [{ sy: 0.94, glow: 0.4, blink: true }, 1, E.out], [{ sy: 0.86, sx: 1.08, glow: 0.6 }, 2, E.io]),
    rest: sk({}, [{ sy: 0.96, sx: 1.03, blink: true, tamp: 4 }, 2, E.io], [{ sy: 1, sx: 1, blink: false, tamp: 6 }, 2, E.io]),
  };
  CB.rig('spirit', {
    w: 140, h: 176, ox: 70, oy: 76, ms: 160,
    bob: (t) => Math.sin(t / 450) * 5,
    base: SB, idle: spIdle, acts: spActs,
    keys: { strike: ['exec:strike', 1], any: ['cast:any', 3] },
    alias: { prep: 'prep:strike' },
    draw: drawSpirit,
  });
  CB.deliver('spirit', ['strike', 'lie', 'mirror', 'chill'], (a) => {
    const blk = CB.blocked(a), peak = blk ? 0.3 : 0.45;
    return CB.play(a, {
      key: 'key:strike', contact: 600, end: 1200,
      parts: [{ at: 0, act: 'prep:strike', d: 300 }, { at: 300, act: 'exec:strike', d: 320, travel: { to: a.aimed, peak, arc: 8, shape: 'out' } }, { at: 620, act: blk ? 'balk' : 'recover:strike', d: 580, travel: { to: a.aimed, peak, shape: 'back' } }],
      fx: [{ at: 580, name: 'cbWrap', d: 460, p: { to: a.aimed, short: blk, col: CB.colOf(a, '#e8e4ff') } }],
    });
  });
  CB.deliver('spirit', ['sweep', 'flood', 'gust'], (a) => CB.play(a, {
    key: 'key:strike', contact: 700, end: 1300,
    parts: [{ at: 0, act: 'prep:strike', d: 320 }, { at: 320, act: 'exec:strike', d: 420, travel: { to: 'party', peak: 0.3, arc: 16, shape: 'outback' } }, { at: 740, act: 'recover:strike', d: 560 }],
    fx: [{ at: 500, name: 'cbToll', d: 800, p: { mode: 'sweep', dx: 0, dy: -20, who: CB.targets(a), col: CB.colOf(a, '#e8e4ff') } }],
  }));
  CB.deliver('spirit', ['*'], (a) => CB.play(a, {
    key: 'key:any', contact: 640, end: 1100,
    parts: [{ at: 0, act: 'cast:any', d: 760 }],
    fx: [{ at: 200, name: 'cbGather', d: 600, p: { dy: -22, col: CB.colOf(a, '#e8e4ff') } }],
  }));

  CB.family('hush', { anatomy: 'cloth / spirit veil: the crown leads, the folds bend and the hem lags; coherent gathering, spreading and return; a sleeve fold that reaches; one hem strip that lengthens', palette: 'veil #e8e6f0 (6 steps, translucent hem ramps at alpha 170 / 90), ring #1a1830, void #0e0c1a, blank scraps #f0eee6 with a grey line' });
  CB.family('spirit', { anatomy: 'spirit (generic veil; unused by the current bestiary): a round head that swells and stretches, a streaming tail', palette: 'veil from artOpts.col (default #e8e4ff), translucent tail' });
})();
