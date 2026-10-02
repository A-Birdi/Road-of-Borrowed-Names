/* Creatures B — lanterns: the Lantern Ghost (sb.ghost), the Nameless Lantern (sa.ghost), the
 * Guttering Lantern (atlas.lamp) and Moth and Lantern (atlas.mothlamp) share the paper-lantern
 * ghost (family 'lantern'); the Lamp That Waited (sb.boss, the Chapter 4 guardian) is a standing
 * lamp (family 'sb_frostlamp').
 *
 * Lantern: a ribbed paper lantern that hangs from an unseen hand by its bamboo loop. Anatomy:
 * one hinge at the loop (the barrel swings as a pendulum), a flame inside that lags the swing
 * and shows through the paper (the internal light), a torn grin that shows the flame, wooden
 * caps, and a ghost-flame tail that trails. Strike: drawn back, it swings through and its grin
 * opens on a lick of flame at the one target. Heat: it rises, the paper bellies out, the flame
 * runs white-hot and a shimmer rolls off it. Shroud: the flame gutters and smoke pours from its
 * lower cap and grin down over its knots (Moth and Lantern's moths whirl out with it). The false
 * promise: a kind face is painted over the grin and a warm light floats to its target. Re-tying:
 * it bows, its tail reaches down to a loose knot and ties it with a thread of flame.
 *
 * The Lamp That Waited: a tall standing andon on a stone foot, a snow-capped roof, a lattice
 * panel whose front-left leaf is a hinged door, a flame gone cold and blue, icicles, frost motes.
 * Anatomy: it stands — it rocks on the edge of its foot (a hinge at the ground), its door swings
 * on its hinge, the snow on the roof shakes loose. Chill (its signature): the door opens, the
 * flame shrinks white, the cold gathers, and it breathes frost at its target; the door swings
 * shut with a clack. Strike: it rocks back on its heel, then tips forward onto its toe so the
 * eave swings at its target and the roof snow bursts off; it rocks down and settles. Its plea:
 * the flame sinks to an ember and a letter shows at the door left ajar. Released, its flame
 * warms (the colour it should have had). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E, S = CB.S;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const LPIV = -68; // the lantern's hinge (top of its loop)

  // ======================================================================================
  // LANTERN
  // ======================================================================================
  const MOTHLAMP = '#d8c0a0'; // Moth and Lantern's flame colour (its moths are part of it)
  function lanPt(q, x, y) {
    const a = q.tilt || 0, c = Math.cos(a), s = Math.sin(a), dy = y - LPIV;
    return [Math.round(x * c - dy * s), Math.round(LPIV + x * s + dy * c + (q.lift || 0))];
  }
  // ramps for one flame colour: the flame itself (hue-shifted, a white core), the paper lit by it
  // from inside (deep at the grazing limbs, glowing round the flame), the ghost tail (translucent)
  const lanPal = (fl, hot) => {
    const fr = S.ramp(fl, { n: 6, at: 3, lo: 0.2, hi: 0.94, cs: 30, ws: 18 });
    const warm = (c, k) => mixh(c, '#fff4dc', k + 0.3 * (hot || 0));
    return {
      flame: S.ramp(fl, { n: 5, at: 2, hi: 0.93, lo: 0.32, cs: 24 }),
      // the paper: deep flame-hue shadows at the grazing edges, cream lit through near the flame
      paper: [fr[0], fr[1], fr[2], warm(fr[3], 0.3), warm(fr[4], 0.5), warm('#fffdf4', 0.2)],
      ghost: S.ramp(fl, { n: 4, at: 2, lo: 0.32, hi: 0.86, cs: 30 }),
    };
  };
  const LROT = -0.36; // where the face is centred round the barrel (the near-left side faces the party)
  function drawLantern(L, o, q, H) {
    const fl0 = o.col || '#8aa8e8';
    const moths = !!o.moths || String(fl0).toLowerCase() === MOTHLAMP;
    const fl = q.false > 0.5 ? mixh(fl0, '#f0a050', 0.7) : q.hot > 0 ? mixh(fl0, '#fff0b0', 0.55 * q.hot) : fl0;
    const dim = q.dim || 0, glowK = (q.glow == null ? 1 : q.glow) * (1 - dim * 0.6);
    const P = lanPal(fl, q.hot);
    const paper = S.mat(P.paper, { at: 3, rim: mixh(fl, '#c8e8ff', 0.6), litk: 0.15 });
    const wood = S.mat(['#120c1c', '#26162a', '#3e2430', '#5e3a36', '#8a5e4a', '#c49a76'], { at: 2, rim: '#7a9ad8', litk: 0.15 });
    const bamboo = S.mat(['#2a1a1c', '#5a3e2a', '#8e6e3e', '#c4a460', '#ecd896'], { at: 2, litk: 0.15 });
    const flameM = S.mat(P.flame, { at: 2, line: false });
    const core = K.solid(mixh(fl, '#ffffff', 0.85), { line: false });
    const ghost = S.mat(P.ghost, { at: 2, alpha: 200, line: S.deep(P.ghost[0], 0.2) });
    const ghost2 = S.mat(P.ghost, { at: 2, alpha: 120, line: false });
    const ink = S.mat(['#0e0a18', '#22182e', '#3a2c44'], { at: 0, line: false });
    const tongue = S.mat(['#8a2a4a', '#cc5a6e', '#f29aa0'], { at: 1, line: false });
    const blush = S.mat(['#d8707a', '#f0a0a0'], { at: 0, line: false });
    const smokeM = S.mat(['#3e3a58', '#6a6484', '#9a94ae', '#c8c2d4'], { at: 2, alpha: 170, line: '#2a2640' });
    const smokeM2 = S.mat(['#5a5674', '#8a84a0', '#b8b2c8'], { at: 1, alpha: 100, line: false });
    const mothM = S.mat(['#4a3e52', '#9a8a8a', '#d8ccb8', '#f8f2e2', '#fffef6'], { at: 3, line: '#2a2030' });
    const white = K.solid('#fffdf6', { line: false });
    const aura = L.like(), tail = L.like(), B = L.like(), fx = L.like(), front = L.like(), mothB = L.like();
    // ---- light around it (stepped, never a blur)
    const ac = lanPt(q, 0, -2);
    H.glow(aura, ac[0], ac[1], 46 + (q.flame || 1) * 4, 52 + (q.flame || 1) * 4, fl, 0.24 * glowK, 3);
    // ---- the ghost tail, hanging from the lower cap; it trails the swing
    const tb = lanPt(q, 0, 44);
    const tlen = q.tlen || 60;
    H.tail(tail, tb[0], tb[1], tlen, 17, q.tph || 0, [[0, 30, ghost], [30, 120, ghost2]], { amp: q.tamp == null ? 7 : q.tamp, curl: 10, dark: 0.1, lean: (q.tlean || 0) - Math.sin(q.tilt || 0) * 0.6 });
    // ---- the lantern (swung about its loop)
    B.save().translate(0, q.lift || 0).translate(0, LPIV).rotate(q.tilt || 0).translate(0, -LPIV);
    // bamboo loop with bindings where it meets the cap (the near arm lit, the far arm in shade)
    S.pipe(B, [[-12, -52], [-11, -61], [-5, -67], [5, -67], [11, -61], [12, -52]], 3, bamboo, { collars: false, bands: [[-1, 3], [-0.3, 2], [0.4, 1]] });
    B.rect(-14, -56, 5, 4, wood, 3); B.rect(9, -56, 5, 4, wood, 1); B.line(-14, -54, -10, -54, wood, 1);
    const br = q.breathe || 0;
    const hwAt = (y) => 22 + br + (9 + br * 0.6) * Math.cos(((y + 3) / 46) * (Math.PI / 2));
    const th = (x, y) => Math.asin(Math.max(-1, Math.min(1, x / hwAt(y))));
    // the flame's place inside (it lags the swing)
    const fxp = (q.fl || 0) - 3, fyp = 10 - (q.flame || 1) * 2, fs = q.flame || 1;
    // the paper lit from inside: rings of light round the flame (hard steps), darker toward the
    // grazing edges, the key light adding a little on the left, the cool rim on the right
    // the paper's long fibres break each band edge into short vertical clusters
    const fibre = S.strands(Math.PI / 2, { w: 3, len: 7, amp: 0.09, seed: 31 });
    const paperFn = (x, y) => {
      // a cylinder lit from inside: bright through the middle, falling off toward the grazing
      // limbs (the right one more: it also faces away from the key light) and away from the flame
      const u = (x - fxp * 0.3) / hwAt(y), dy = (y - fyp) / (44 + fs * 6);
      let v = (0.95 + fs * 0.08) * glowK - Math.pow(Math.abs(u), 2.2) * 0.8 - dy * dy * 0.7 - (u > 0 ? u * 0.3 : 0) - dim * 0.35 + fibre(x, y);
      return v > 0.82 ? 5 : v > 0.6 ? 4 : v > 0.36 ? 3 : v > 0.12 ? 2 : v > -0.15 ? 1 : 0;
    };
    const paperStep = (x, y) => paperFn(x, y);
    B.fill(-36 - br, -46, 36 + br, 40, (x, y) => y >= -46 && y < 40 && Math.abs(x) <= hwAt(y), paper, (x, y) => S.step(paperFn(x, y), 6));
    // the bamboo ribs round the barrel: each a dark line curving toward us, a lit lip above it on
    // the near side, the paper just under it in the rib's shadow
    for (let yr = -37; yr < 36; yr += 9) {
      const hw = hwAt(yr);
      for (let x = -Math.floor(hw) + 1; x < hw - 1; x++) {
        const t = x / hw, y = Math.round(yr + 3 * Math.sqrt(Math.max(0, 1 - t * t)));
        const v = Math.max(0, paperStep(x, y) - 2);
        B.dot(x, y, paper, v);
        if (t < -0.3 && t > -0.8) B.dot(x, y - 1, paper, Math.min(5, paperStep(x, y - 1) + 1));
      }
    }
    // paper seams (vertical joins), spaced as they wrap
    for (const a of [LROT - 0.9, LROT + 0.1, LROT + 1.05]) {
      if (Math.abs(a) > 1.35) continue;
      for (let y = -44; y < 38; y++) { if ((y + 44) % 9 === 7) continue; B.dot(Math.round(hwAt(y) * Math.sin(a)), y, paper, a > 0.4 ? 0 : 1); }
    }
    // a tear (upper right) with the flame showing through its ragged edge
    B.poly([[14, -31], [19, -34], [22, -28], [20, -22], [15, -24], [16, -28]], ink, 1);
    B.poly([[16, -29], [19, -31], [20, -26], [17, -25]], flameM, 3);
    // caps: dark lacquered wood — the top cap's upper face seen as an ellipse, banded fronts, a
    // specular streak on the near-left, grain
    const capSh = (x, y, y0) => { const u = x / 26; return S.step(u < -0.78 ? 3 : u < -0.6 ? 5 : u < -0.2 ? 3 : u < 0.4 ? 2 : u < 0.78 ? 1 : 2, 6); };
    B.fill(-27 - br, -53, 27 + br, -44, (x, y) => y >= -53 && y < -44 + Math.round(2 * Math.sqrt(Math.max(0, 1 - (x / (25 + br * 0.5)) ** 2))) && Math.abs(x) <= 25 + br * 0.5, wood, (x, y) => capSh(x, y));
    B.ell(0, -53, 25 + br * 0.5, 3, wood, (x, y) => S.step(x < -6 ? 4 : x < 10 ? 3 : 2, 6));
    B.fill(-25 - br, 38, 25 + br, 47, (x, y) => y >= 38 && y < 44 + Math.round(2 * Math.sqrt(Math.max(0, 1 - (x / (23 + br * 0.5)) ** 2))) && Math.abs(x) <= 23 + br * 0.5, wood, (x, y) => capSh(x, y));
    for (const [x, y] of [[-16, -50], [-3, -49], [11, -50], [-13, 41], [2, 42], [14, 41]]) B.line(x, y, x + 4, y, wood, x < 0 ? 4 : 2);
    // ---- the face (on the paper, turned toward the party: the far eye narrowed by the curve)
    const eyes = q.false > 0.5 ? 'soft' : q.eyes || 'open';
    for (const [a, sz] of [[LROT - 0.4, 0.75], [LROT + 0.36, 1]]) {
      const ey = -14, ex = Math.round(hwAt(ey) * Math.sin(a)), w = Math.max(2, Math.round(4 * sz));
      if (eyes === 'shut') { B.line(ex - w, ey + 1, ex + w, ey + 1, ink, 0); B.dot(ex - w, ey, ink, 0); B.dot(ex + w, ey, ink, 0); }
      else if (eyes === 'half') { B.ell(ex, ey + 2, w, 2.5, ink, 0); B.rect(ex - 1, ey + 1, 2, 1, white, 0); }
      else if (eyes === 'soft') { B.line(ex - w, ey + 1, ex, ey - 2, ink, 0); B.line(ex, ey - 2, ex + w, ey + 1, ink, 0); B.rect(ex - w - 2, ey + 4, 3, 1, blush, 0); B.rect(ex + w - 1, ey + 4, 3, 1, blush, 1); }
      else if (eyes === 'squint') { B.poly([[ex - w - 1, ey - 1], [ex + w, ey + 1], [ex - w, ey + 3]], ink, 0); }
      else if (eyes === 'wide') { B.ell(ex, ey, w + 0.5, 6, ink, 0); B.rect(ex - 1, ey - 4, 2, 2, white, 0); B.dot(ex + 1, ey + 2, white, 0); }
      else { B.ell(ex, ey, w - 0.5, 5, ink, 0); B.rect(ex - 1, ey - 3, 2, 2, white, 0); B.dot(ex + 1, ey + 2, ink, 2); }
    }
    // the mouth: a torn grin that shows the flame (closed / grin / wide), or the false smile
    const mx0 = Math.round(hwAt(10) * Math.sin(LROT)) + 2;
    if (q.false > 0.5) {
      for (let x = -7; x <= 7; x++) B.dot(mx0 + x, 14 - Math.round((x * x) / 14), ink, 0);
    } else {
      const m = q.mouth == null ? 1 : q.mouth, sy = 0.45 + 0.4 * m, sx = (x) => mx0 + x * (1 + 0.06 * m) * (x < 0 ? 0.82 : 1);
      const g = [[-15, 6], [-9, 11], [-5, 7], [0, 12], [5, 7], [10, 12], [15, 5], [12, 16], [4, 20], [-5, 20], [-12, 15]].map(([x, y]) => [sx(x), 6 + (y - 6) * sy]);
      B.poly(g, ink, 1);
      B.poly([[-10, 13], [-4, 10], [0, 14], [5, 10], [10, 14], [6, 18], [-6, 18]].map(([x, y]) => [sx(x), 6 + (y - 6) * sy]), flameM, (x, y) => S.step(y < 6 + 12 * sy ? 3 : 2, 5));
      if (m > 1.3) B.ell(mx0 + fxp * 0.3, 6 + 10 * sy, 4, 3 * sy, core, 0);
      B.ell(mx0 + 3, 6 + 12 * sy, 4, 3 * Math.min(1, sy), tongue, (x, y) => S.step(y < 6 + 11 * sy ? 2 : 1, 3));
      // the torn paper's edge round the grin: a lit lip above it
      for (const [x, y] of g.slice(0, 7)) B.dot(Math.round(x), Math.round(y) - 1, paper, 5);
    }
    B.restore();
    // ---- heat shimmer off the cap
    if (q.hot > 0.05) {
      const sh = S.mat(P.flame.slice(2), { at: 1, line: false });
      for (let i = 0; i < 4; i++) {
        const [x0, y0] = lanPt(q, -15 + i * 10, -56);
        for (let y = 0; y < 10 + q.hot * 14; y += 2) fx.rect(x0 + Math.round(Math.sin((y + i * 5 + (q.tph || 0) * 6) / 3) * 1.5), y0 - y, 1, 2, sh, y < 6 ? 2 : 1);
      }
      fx.fade(0.55 + 0.4 * q.hot);
    }
    // ---- smoke pouring from the lower cap and the grin (Shroud): puffs with a lit top-left
    if (q.smoke > 0.05) {
      const n = Math.round(3 + q.smoke * 6), sm = L.like();
      for (let i = 0; i < n; i++) {
        const k = ((i / n) + (q.sph || 0)) % 1;
        const [x0, y0] = lanPt(q, (i % 3 - 1) * 12, 44);
        const x = x0 + Math.round(Math.sin(i * 2.3 + k * 3) * 10 * k), y = y0 + Math.round(k * 46 * q.smoke);
        const r = 5 + k * 9;
        sm.ell(x, y, r, r * 0.62, k < 0.5 ? smokeM : smokeM2, (px, py) => S.step(py < y - r * 0.2 && px < x + r * 0.2 ? (k < 0.5 ? 3 : 2) : py > y + r * 0.3 ? 0 : 1, k < 0.5 ? 4 : 3));
      }
      const [mx, my] = lanPt(q, mx0, 14);
      sm.ell(mx - 8, my + 6, 6, 4, smokeM2, 1);
      sm.outline();
      fx.over(sm);
    }
    // ---- Moth and Lantern: white moths circling it (part of the creature)
    if (moths) {
      const spread = 1 + (q.mspread || 0);
      for (let i = 0; i < 4; i++) {
        const a = (q.mph || 0) + i * (Math.PI / 2) + (i % 2) * 0.4;
        const rx = (40 + i * 4) * spread, ry = (24 + (i % 2) * 6) * spread;
        const [cx, cy] = lanPt(q, 0, -8);
        const x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
        const up = (Math.round((q.mph || 0) * 4) + i) % 2;
        const Lr = Math.sin(a) > 0 ? front : mothB;          // the near side passes in front
        // far wing (shade), body, near wing (lit), antennae
        Lr.poly(up ? [[x, y - 1], [x + 7, y - 6], [x + 6, y + 1]] : [[x, y - 1], [x + 7, y + 2], [x + 5, y + 3]], mothM, 1);
        Lr.ell(x, y, 1.5, 3, mothM, (px, py) => S.step(py < y - 1 ? 2 : 1, 5));
        Lr.poly(up ? [[x, y - 1], [x - 7, y - 6], [x - 6, y + 1]] : [[x, y - 1], [x - 7, y + 2], [x - 5, y + 3]], mothM, (px, py) => S.step(px < x - 3 ? 4 : 3, 5));
        Lr.dot(x - 4, y - (up ? 3 : 0), mothM, 1);
        Lr.dot(x - 1, y - 4, mothM, 0); Lr.dot(x + 1, y - 4, mothM, 0);
      }
    }
    // ---- outlines, cast shadows, the rim
    tail.outline(); B.outline(); front.outline(); mothB.outline();
    S.lit(B, wood, 4, { left: false, test: (x, y) => y < -50 });
    S.cast(B, tail, 2, 3, 1);
    const out = aura.over(mothB).over(tail).over(B);
    S.rim(out, { w: 1, y0: 0 });
    return out.over(fx).over(front);
  }
  const LB = { tilt: 0, lift: 0, flame: 1, fl: 0, glow: 1, mouth: 1, eyes: 'open', tph: 0, tamp: 7, tlean: 0, tlen: 60, breathe: 0, hot: 0, smoke: 0, sph: 0, false: 0, mph: 0, mspread: 0, dim: 0 };
  // idle: a slow pendulum (1.4 s), the flame lagging and flickering through three shapes, a blink
  const lanIdle = [];
  for (let f = 0; f < 10; f++) {
    const a = (f / 10) * Math.PI * 2;
    lanIdle.push({ tilt: 0.05 * Math.sin(a), fl: -3 * Math.sin(a - 0.7), flame: [1, 1.15, 0.9, 1.1, 1, 0.85, 1.15, 1, 0.9, 1.05][f], tph: a, mph: a * 0.5, sph: f / 10, eyes: f === 7 ? 'half' : f === 8 ? 'shut' : 'open', mouth: f === 4 ? 0.8 : 1 });
  }
  const lk = (from, ...st) => CB.keys(Object.assign({}, LB, from), ...st);
  const damped = (a0, n, extra) => { const out = []; for (let i = 0; i < n; i++) { const k = i / n; out.push(Object.assign({}, LB, { tilt: CB.damp(a0, k, 3), fl: -CB.damp(a0, Math.max(0, k - 0.1), 3) * 14, tph: 2 + k * 3 }, extra ? extra(k) : {})); } return out; };
  const lanActs = {
    // Strike: drawn back, flame flaring; it swings through, the grin opening on a lick of flame
    'prep:strike': lk({}, [{ tilt: -0.14, fl: 4, flame: 1.4, mouth: 1.3, eyes: 'squint', tlean: -0.2, mph: 0.6 }, 2, E.out], [{ tilt: -0.26, fl: 7, flame: 1.7, mouth: 1.5, lift: -4, tph: 1, mph: 1.2 }, 2, E.io]),
    'exec:strike': lk({ tilt: -0.26, fl: 7, flame: 1.7, mouth: 1.5, lift: -4, eyes: 'squint', tlean: -0.2 }, [{ tilt: 0.12, fl: 2, flame: 1.8, mouth: 2, lift: -1, tlean: 0.25, tph: 1.6, mph: 1.8 }, 1, E.in], [{ tilt: 0.34, fl: -6, flame: 2, mouth: 2, eyes: 'wide', tlean: 0.4, tph: 2.2, mph: 2.4 }, 1, E.out], [{ tilt: 0.3, fl: -8, flame: 1.8, mouth: 1.8, tph: 2.6, mph: 3 }, 1, E.lin]),
    'recover:strike': damped(0.3, 6, (k) => ({ flame: 1.6 - 0.6 * k, mouth: 1.8 - 0.8 * k, eyes: k < 0.5 ? 'wide' : 'open', mph: 3 + k * 2 })),
    // Heat: it rises, the paper bellies out, the flame runs white-hot; a shimmer rolls off it
    'cast:heat': lk({}, [{ lift: -4, flame: 1.3, breathe: 1, eyes: 'wide', hot: 0.2, mph: 0.5 }, 2, E.out], [{ lift: -9, flame: 1.8, breathe: 3, hot: 0.6, mouth: 1.4, tamp: 9, tph: 1.2, mph: 1.4 }, 2, E.io], [{ lift: -10, flame: 2, breathe: 4, hot: 1, mouth: 1.7, tph: 2.2, mph: 2.6 }, 2, E.io], [{ lift: -8, flame: 1.9, breathe: 3, hot: 1, tph: 3, mph: 3.4 }, 2, E.lin]),
    'recover:heat': lk({ lift: -8, flame: 1.9, breathe: 3, hot: 1, mouth: 1.7, eyes: 'wide', tamp: 9 }, [{ lift: -3, flame: 1.4, breathe: 1, hot: 0.6, mouth: 1.2, tph: 4 }, 2, E.io], [{ lift: 0, flame: 1.15, breathe: 0, hot: 0.3, mouth: 1, eyes: 'open', tamp: 7, tph: 5 }, 2, E.out]),
    // Shroud: the flame gutters and dims, it tips down, and smoke pours from cap and grin
    'cast:shroud': lk({}, [{ flame: 0.6, dim: 0.2, tilt: 0.06, eyes: 'half', mouth: 1.3, mspread: 0.2 }, 2, E.out], [{ flame: 0.35, dim: 0.45, smoke: 0.5, sph: 0.2, mspread: 0.6, mph: 1.2 }, 2, E.io], [{ flame: 0.3, dim: 0.5, smoke: 1, sph: 0.45, tilt: 0.04, mspread: 0.9, mph: 2.4 }, 2, E.io], [{ smoke: 1, sph: 0.7, mph: 3.4, mspread: 0.7 }, 2, E.lin]),
    'recover:shroud': lk({ flame: 0.3, dim: 0.5, smoke: 1, sph: 0.7, tilt: 0.04, eyes: 'half', mouth: 1.3, mspread: 0.7, mph: 3.4 }, [{ flame: 0.7, dim: 0.25, smoke: 0.4, sph: 0.9, mspread: 0.3, mph: 4.2 }, 2, E.io], [{ flame: 1, dim: 0, smoke: 0, tilt: 0, eyes: 'open', mouth: 1, mspread: 0, mph: 5 }, 2, E.out]),
    // the false promise: a kind face over the grin, a warm (false) flame; it leans in, then
    // the warmth goes out of it and the grin comes back
    'prep:lie': lk({}, [{ false: 1, tilt: -0.05, flame: 1.2, eyes: 'soft' }, 2, E.out], [{ false: 1, tilt: -0.1, lift: -3, flame: 1.3 }, 2, E.io]),
    'exec:lie': lk({ false: 1, tilt: -0.1, lift: -3, flame: 1.3, eyes: 'soft' }, [{ tilt: 0.12, lift: -1, tph: 1.4 }, 2, E.io], [{ tilt: 0.16, tph: 2 }, 1, E.lin], [{ false: 0, tilt: 0.12, flame: 1.5, mouth: 1.6, eyes: 'squint', tph: 2.6 }, 1, E.lin]),
    'recover:lie': lk({ tilt: 0.12, flame: 1.5, mouth: 1.6, eyes: 'squint', tph: 2.6 }, [{ tilt: -0.04, flame: 1.2, mouth: 1.2, tph: 3.4 }, 2, E.io], [{ tilt: 0, flame: 1, mouth: 1, eyes: 'open', tph: 4 }, 2, E.out]),
    // Re-tying: it bows, its tail reaching down to the loose knot to tie it with flame
    'cast:mend': lk({}, [{ tilt: 0.1, lift: 4, eyes: 'half', tlean: -0.2, flame: 1.2 }, 2, E.out], [{ tilt: 0.16, lift: 8, tlean: -0.55, tlen: 72, tamp: 4, flame: 1.4, tph: 1.4 }, 2, E.io], [{ tilt: 0.14, lift: 9, tlean: -0.7, tlen: 78, tamp: 3, flame: 1.5, tph: 2.4 }, 2, E.io], [{ tlean: -0.6, tlen: 74, tph: 3.2 }, 2, E.lin]),
    'recover:mend': lk({ tilt: 0.14, lift: 9, tlean: -0.6, tlen: 74, tamp: 3, flame: 1.5, eyes: 'half' }, [{ tilt: 0.04, lift: 3, tlean: -0.15, tlen: 64, tamp: 6, flame: 1.2, tph: 4 }, 2, E.io], [{ tilt: 0, lift: 0, tlean: 0, tlen: 60, tamp: 7, flame: 1, eyes: 'open', tph: 5 }, 2, E.out]),
    // reactions to real outcomes
    recoil: lk({}, [{ tilt: -0.22, fl: 6, flame: 0.6, eyes: 'shut', mouth: 0.5, tlean: 0.3 }, 1, E.out], [{ tilt: 0.1, fl: -3, flame: 0.8, eyes: 'half' }, 1, E.io], [{ tilt: -0.04, fl: 1, flame: 0.95 }, 1, E.io], [{ tilt: 0, fl: 0, flame: 1, eyes: 'open', mouth: 1, tlean: 0 }, 1, E.out]),
    release: lk({}, [{ flame: 1.4, glow: 1.25, eyes: 'shut', mouth: 0.6, tamp: 10 }, 1, E.out], [{ flame: 1.3, glow: 1.3, tph: 1.5, tlen: 66 }, 1, E.io], [{ flame: 1.1, glow: 1.1, eyes: 'half', tph: 3 }, 1, E.io], [{ flame: 1, glow: 1, eyes: 'open', mouth: 1, tamp: 7, tlen: 60, tph: 4 }, 1, E.out]),
    balk: lk({ tilt: -0.2, flame: 1.6, mouth: 1.5, eyes: 'squint' }, [{ tilt: 0.06, flame: 0.4, mouth: 0.6, eyes: 'wide', dim: 0.3 }, 1, E.out], [{ tilt: -0.08, flame: 0.6, dim: 0.2 }, 1, E.io], [{ tilt: 0.02, flame: 0.85, dim: 0.05, eyes: 'half' }, 1, E.io], [{ tilt: 0, flame: 1, dim: 0, mouth: 1, eyes: 'open' }, 1, E.out]),
    settle: lk({}, [{ flame: 1.2, mouth: 0.4, eyes: 'half', tamp: 4 }, 1, E.out], [{ flame: 1.1, mouth: 0, eyes: 'shut', lift: 4, tamp: 2, tlen: 54, glow: 1.15 }, 1, E.io], [{ lift: 8, tlen: 48, glow: 1.2 }, 1, E.io], [{ lift: 10, tlen: 44, glow: 1.1 }, 1, E.out]),
    rest: lk({}, [{ flame: 0.7, dim: 0.15, eyes: 'half', mouth: 0.6, tamp: 4 }, 1, E.io], [{ flame: 0.55, dim: 0.25, eyes: 'shut', lift: 3, tph: 1 }, 1, E.io], [{ flame: 0.6, dim: 0.25, eyes: 'shut', lift: 3, tph: 2 }, 1, E.io], [{ flame: 0.8, dim: 0.1, eyes: 'half', lift: 1, tph: 3 }, 1, E.io]),
  };
  CB.rig('lantern', {
    w: 188, h: 224, ox: 94, oy: 92, ms: 140,
    base: LB, idle: lanIdle, acts: lanActs,
    keys: { strike: ['exec:strike', 2], heat: ['cast:heat', 5], shroud: ['cast:shroud', 5], lie: ['exec:lie', 2], mend: ['cast:mend', 5] },
    alias: { prep: 'prep:strike' },
    draw: drawLantern,
  });
  const lpt = (act, i, x, y) => lanPt(lanActs[act][i], x, y);
  CB.deliver('lantern', ['strike'], (a) => {
    const blk = CB.blocked(a), peak = blk ? 0.3 : 0.42;
    const m = lpt('exec:strike', 2, 0, 12);
    return CB.play(a, {
      key: 'key:strike', contact: 620, end: 1250,
      parts: [
        { at: 0, act: 'prep:strike', d: 300 },
        { at: 300, act: 'exec:strike', d: 360, travel: { to: a.aimed, peak, arc: 12, shape: 'out' } },
        blk ? { at: 660, act: 'balk', d: 260, travel: { to: a.aimed, peak, shape: 'back' } } : null,
        { at: blk ? 920 : 660, act: 'recover:strike', d: blk ? 330 : 590, travel: blk ? null : { to: a.aimed, peak, shape: 'back' } },
      ].filter(Boolean),
      fx: [{ at: 440, name: 'cbFlameLick', d: 420, p: { dx: m[0], dy: m[1], to: a.aimed, col: CB.colOf(a, '#8aa8e8'), short: blk } }],
    });
  });
  CB.deliver('lantern', ['heat'], (a) => CB.play(a, {
    key: 'key:heat', contact: 760, end: 1300,
    parts: [{ at: 0, act: 'cast:heat', d: 820 }, { at: 820, act: 'recover:heat', d: 480 }],
    fx: [{ at: 420, name: 'cbHeatWave', d: 700, p: { dy: -4, col: CB.colOf(a, '#8aa8e8') } }],
  }));
  CB.deliver('lantern', ['shroud'], (a) => CB.play(a, {
    key: 'key:shroud', contact: 800, end: 1400,
    parts: [{ at: 0, act: 'cast:shroud', d: 860 }, { at: 860, act: 'recover:shroud', d: 540 }],
    fx: [{ at: 300, name: 'cbSmoke', d: 900, p: { dy: 46, moths: String(CB.colOf(a, '')).toLowerCase() === MOTHLAMP } }],
  }));
  CB.deliver('lantern', ['lie'], (a) => {
    const m = lpt('exec:lie', 1, 0, 8);
    return CB.play(a, {
      key: 'key:lie', contact: 700, end: 1260,
      parts: [{ at: 0, act: 'prep:lie', d: 300 }, { at: 300, act: 'exec:lie', d: 420, travel: { to: a.aimed, peak: 0.16, arc: 6, shape: 'out' } }, { at: 720, act: 'recover:lie', d: 540, travel: { to: a.aimed, peak: 0.16, shape: 'back' } }],
      fx: [{ at: 300, name: 'cbFalseLight', d: 560, p: { dx: m[0], dy: m[1], to: a.aimed } }],
    });
  });
  CB.deliver('lantern', ['mend'], (a) => {
    const tip = lpt('cast:mend', 5, -18, 120);
    const fv = a.fv || {};
    const room = fv.knots < fv.maxKnots;
    return CB.play(a, {
      key: 'key:mend', contact: 760, end: 1300,
      parts: [{ at: 0, act: 'cast:mend', d: 820 }, { at: 820, act: 'recover:mend', d: 480 }],
      fx: [{ at: 360, name: 'cbMend', d: 640, p: { dx: tip[0], dy: tip[1], i: room ? Math.min(fv.maxKnots - 1, fv.knots) : null, col: CB.colOf(a, '#8aa8e8') } }],
    });
  });
  CB.deliver('lantern', ['*'], (a) => CB.play(a, {
    key: 'key:heat', contact: 700, end: 1200,
    parts: [{ at: 0, act: 'cast:heat', d: 760 }, { at: 760, act: 'recover:heat', d: 440 }],
  }));

  // ======================================================================================
  // THE LAMP THAT WAITED
  // ======================================================================================
  function frostPt(q, x, y) {
    // rocking on the edge of its foot: the hinge is the toe (front, toward the party) when it
    // tips forward, the heel when it tips back
    const a = q.rock || 0, px = a > 0 ? -36 : a < 0 ? 36 : 0, py = 86;
    const c = Math.cos(a), s = Math.sin(a), dx = x - px, dy = y - py;
    // positive rock tips the top toward the party (left): rotate by -a
    return [Math.round(px + dx * c + dy * s), Math.round(py - dx * s + dy * c + (q.lift || 0))];
  }
  // The andon seen three-quarter: its front face turned toward the party (x −44…22), its right side
  // face receding (x 22…44, raised by the depth). A hip roof with two visible slopes under snow, a
  // kumiko lattice over paper lit from inside, a door leaf in the front face, a stone foot block.
  const FX0 = -44, FX1 = 22, SDX = 22, SDY = -6; // front face x range; the depth offset of the side face
  const FPAL = {
    wood: ['#0c0a1c', '#1a1830', '#2a2846', '#3e3a5e', '#5c5680', '#8a84aa'],
    paperCold: ['#2a3a76', '#46609e', '#7092c8', '#a6c4e8', '#d6e8fa', '#f6fbff'],
    paperWarm: ['#5a2a2a', '#8e4a34', '#c47a46', '#eab06a', '#f8dc9e', '#fff6dc'],
    snow: ['#3c4892', '#6676bc', '#9eb0e2', '#d4e0f6', '#f6f9ff', '#fffdf0'],
    ice: ['#2c5a9a', '#5a92d0', '#98ccf0', '#e2f6ff'],
    stone: ['#16142a', '#2a2840', '#44425c', '#625f7a', '#8a879e', '#b8b6c6'],
  };
  function drawFrostLamp(L, o, q, H) {
    const warmth = Math.max(o.warm ? 1 : 0, q.warm || 0);
    const wood = S.mat(FPAL.wood, { at: 3, rim: '#7ea6e6', litk: 0.15 });
    const paper = S.mat(FPAL.paperCold.map((c, i) => mixh(c, FPAL.paperWarm[i], warmth)), { at: 3, rim: '#bfe4ff', litk: 0.15 });
    const flameC = mixh(q.white ? mixh('#8ab8f0', '#f4fbff', q.white) : '#8ab8f0', '#f8a040', warmth);
    const flameM = S.mat(S.ramp(flameC, { n: 5, at: 2, hi: 0.95, lo: 0.3, cs: 24 }), { at: 2, line: false });
    const coreM = K.solid(mixh(flameC, '#ffffff', 0.78), { line: false });
    const snow = S.mat(FPAL.snow, { at: 3, rim: '#bfe8ff', litk: 0.16 });
    const ice = S.mat(FPAL.ice, { at: 2, alpha: 235, litk: 0.2 });
    const stone = S.mat(FPAL.stone, { at: 3, rim: '#8ab0e8', litk: 0.15 });
    const mote = S.mat(['#9ad0f4', '#e6f6ff', '#ffffff'], { at: 1, line: false });
    const cav = S.mat(['#05050e', '#0e0e1e', '#1a1a30'], { at: 0, line: false });
    const ink = S.mat(['#0a0a1a', '#1e1c34', '#34304e'], { at: 0, line: false });
    const white = K.solid('#fbfdff', { line: false });
    const letter = S.mat(['#5a4a4a', '#a8967e', '#e2d4b4', '#fbf4e2'], { at: 2 });
    const aura = L.like(), B = L.like(), door = L.like(), fx = L.like(), ground = L.like(), roof = L.like();
    const fs = q.flame == null ? 1 : q.flame, dim = q.dim || 0;
    const ac = frostPt(q, -6, -4);
    H.glow(aura, ac[0], ac[1], 60 + fs * 4, 72 + fs * 4, flameC, 0.24 * (1 - dim * 0.6), 3);
    const rockT = (Lr) => { const a = q.rock || 0, px = a > 0 ? -36 : a < 0 ? 36 : 0; Lr.save().translate(0, q.lift || 0).translate(px, 86).rotate(-a).translate(-px, -86); };
    rockT(B); rockT(roof);
    // the side face as a parallelogram (x across it 0..1, y down it)
    const side = (u, y) => [FX1 + u * SDX, y + u * SDY];
    // ---- the paper panels, lit from inside: the front face bright round the flame, the side face
    // seen at an angle (darker, the cool rim at its far edge)
    const fl = q.fl || 0, dr = q.door || 0;
    const glowAt = (x, y) => (1 - Math.hypot((x - fl + 10) / 46, (y + 4) / 66)) * (0.95 + fs * 0.07) * (1 - dim * 0.55);
    const fibre = S.strands(Math.PI / 2, { w: 3, len: 7, amp: 0.07, seed: 41 });
    const frontStep = (x, y) => { const v = glowAt(x, y) + (x < -30 ? 0.05 : 0) + fibre(x, y); return v > 0.62 ? 5 : v > 0.42 ? 4 : v > 0.22 ? 3 : v > 0.02 ? 2 : 1; };
    B.rect(FX0, -72, FX1 - FX0, 136, paper, (x, y) => S.step(frontStep(x, y), 6));
    B.poly([side(0, -72), side(1, -72), side(1, 64), side(0, 64)], paper, (x, y) => { const u = (x - FX1) / SDX, v = glowAt(FX1, y) * 0.55 - u * 0.25; return S.step(v > 0.3 ? 3 : v > 0.12 ? 2 : 1, 6); });
    // the door leaf's opening (front left): the dark inside and the flame itself
    if (dr > 0.02) {
      B.rect(-38, -66, 32, 122, cav, (x, y) => S.step(Math.hypot((x + 20) / 26, (y - 10) / 56) < 0.6 ? 2 : Math.hypot((x + 20) / 26, (y - 10) / 56) < 0.85 ? 1 : 0, 3));
      const fx0 = -20 + fl, fy0 = 18;
      B.ell(fx0, fy0 - fs * 6, 7 + fs * 3, 14 + fs * 6, flameM, (x, y) => { const d = Math.hypot((x - fx0) / 10, (y - fy0 + fs * 6) / 20); return S.step(d < 0.35 ? 4 : d < 0.6 ? 3 : x < fx0 ? 2 : 1, 5); });
      B.ell(fx0, fy0 - fs * 3, 3 + fs, 7 + fs * 3, coreM, 0);
      B.rect(fx0 - 5, fy0 + 10, 10, 4, wood, (x) => S.step(x < fx0 ? 4 : 2, 6));
    }
    // the cold flame glowing through the paper when the door is shut
    if (dr <= 0.02) { B.ell(fl - 10, 10, 9 + fs * 2, 19 + fs * 4, paper, 5); B.ell(fl - 10, 16, 4 + fs, 9 + fs * 3, K.solid(warmth > 0.5 ? '#fff4b0' : '#f2f8ff', { line: false }), 0); }
    // posts: the near-left corner (lit), the front-right corner, the far-right corner (in shade)
    B.rect(FX0, -72, 6, 136, wood, (x) => S.step(x < FX0 + 2 ? 5 : x < FX0 + 4 ? 4 : 3, 6));
    B.rect(FX1 - 3, -72, 6, 136, wood, (x) => S.step(x < FX1 ? 3 : 1, 6));
    B.poly([side(1, -72), [FX1 + SDX + 3, -72 + SDY], [FX1 + SDX + 3, 64 + SDY], side(1, 64)], wood, () => S.step(1, 6));
    // rails top and bottom (front and side)
    B.rect(FX0, -72, FX1 - FX0, 5, wood, (x) => S.step(x < FX0 + 30 ? 4 : 3, 6));
    B.rect(FX0, 56, FX1 - FX0, 8, wood, (x, y) => S.step(y < 58 ? 3 : 2, 6));
    B.poly([side(0, -72), side(1, -72), side(1, -67), side(0, -67)], wood, () => S.step(2, 6));
    B.poly([side(0, 56), side(1, 56), side(1, 64), side(0, 64)], wood, () => S.step(1, 6));
    if (dr > 0.02) B.rect(-6, -67, 4, 123, wood, (x) => S.step(x < -4 ? 3 : 2, 6)); // the centre stile (the open door's other edge)
    // the kumiko lattice: thin dark bars with a lit edge, on both faces
    for (const y of [-40, -8, 24]) {
      for (let x = (dr > 0.02 ? -2 : FX0 + 6); x < FX1 - 3; x++) { B.dot(x, y, wood, 2); B.dot(x, y - 1, wood, 4); }
      for (let u = 0.1; u < 1; u += 0.06) { const [x, yy] = side(u, y); B.dot(Math.round(x), Math.round(yy), wood, 1); }
    }
    for (const x of (dr > 0.02 ? [8] : [-27, -6, 8])) for (let y = -67; y < 56; y++) { B.dot(x, y, wood, 2); B.dot(x - 1, y, wood, 4); }
    for (let y = -67; y < 56; y++) { const [x, yy] = side(0.5, y); B.dot(Math.round(x), Math.round(yy), wood, 1); }
    // mournful eyes on the paper (the near one on the panel right of the door, the far one painted
    // on the door leaf; the leaf carries it away when it opens)
    const eyes = q.eyes || 'mourn';
    const eye = (ex, ey, w) => {
      if (eyes === 'shut') { B.line(ex - w, ey + 1, ex + w, ey + 2, ink, 0); }
      else if (eyes === 'down') { B.poly([[ex - w, ey + 1], [ex + w, ey - 1], [ex + w, ey + 4], [ex - w + 1, ey + 4]], ink, 0); B.rect(ex - 1, ey + 2, 2, 1, white, 0); }
      else if (eyes === 'wide') { B.ell(ex, ey + 1, w, 4, ink, 0); B.rect(ex - 2, ey - 1, 2, 2, white, 0); }
      else if (eyes === 'warm') { B.line(ex - w + 1, ey + 2, ex, ey - 1, ink, 0); B.line(ex, ey - 1, ex + w - 1, ey + 2, ink, 0); }
      else { B.poly([[ex - w, ey], [ex + w, ey - 4], [ex + w, ey + 4], [ex - w + 1, ey + 6]], ink, 0); B.rect(ex - 1, ey - 1, 2, 2, white, 0); B.dot(ex + 2, ey + 3, ink, 2); }
    };
    eye(4, -30, 6);
    if (dr <= 0.3) eye(-24, -29, 5);
    // ---- the roof: a hip roof, its front slope lit and its right slope in shade, eaves of dark wood
    const eL = [-56, -74], eR = [30, -74], eB = [54, -80], rL = [-14, -98], rR = [16, -101];
    roof.poly([eL, eR, rR, rL], wood, (x, y) => S.step(y > -78 ? 2 : x < -20 ? 4 : 3, 6));
    roof.poly([eR, eB, rR], wood, (x, y) => S.step(y > -80 ? 1 : 2, 6));
    roof.rect(-56, -76, 86, 3, wood, (x) => S.step(x < -40 ? 5 : 4, 6));
    roof.poly([eR, [eB[0], eB[1]], [eB[0], eB[1] + 3], [eR[0], eR[1] + 3]], wood, () => S.step(1, 6));
    roof.rect(-6, -106, 12, 7, wood, (x) => S.step(x < -2 ? 4 : 2, 6)); // the finial
    // snow on the roof (shaken loose as q.snow falls): heaped on the front slope, a lip over the
    // eave, lit on top, blue in the shade, its lower edge in lumps
    const sn = q.snow == null ? 1 : q.snow;
    if (sn > 0.05) {
      const top = -100 - Math.round(sn * 3);
      roof.fill(-58, top - 6, 56, -72, (x, y) => {
        const yEave = -75 + (x > 30 ? (x - 30) * -0.25 : 0);
        const ridge = x < -14 ? -98 + (x + 14) * -0.92 : x > 16 ? -101 + (x - 16) * 0.55 : -98 - (x + 14) * 0.1;
        const lump = Math.round(Math.sin(x / 5) * 1.5 + (K.hh(Math.round(x / 3), 7, 2) % 3));
        const depth = (yEave - ridge) * (0.35 + 0.6 * sn);
        return y >= ridge - 3 * sn && y <= ridge + depth + lump && x > -58 && x < 54;
      }, snow, (x, y) => S.step(x > 28 ? (y < -88 ? 2 : 1) : y < -94 ? 5 : y < -86 ? 4 : x < -30 ? 4 : 3, 6));
    }
    // icicles on the eaves (they lengthen as the cold gathers): lit on the left, a bright tip
    const ic = q.ice == null ? 1 : q.ice;
    const icicle = (Lr, x, y, len) => { Lr.poly([[x - 3, y], [x + 3, y], [x, y + len]], ice, (px) => S.step(px < x - 1 ? 3 : px < x + 1 ? 2 : 1, 4)); Lr.dot(x, y + len - 1, ice, 3); };
    for (let i = 0; i < 8; i++) icicle(roof, -50 + i * 11, -73, Math.round((6 + ((i * 5) % 9)) * (0.6 + 0.6 * ic)));
    for (let i = 0; i < 2; i++) icicle(roof, 36 + i * 9, -77 - i * 2, Math.round((5 + i * 3) * (0.6 + 0.6 * ic)));
    B.restore(); roof.restore();
    // the door leaf, swung open on its hinge at the near-left post (toward you, foreshortened)
    if (dr > 0.02) {
      rockT(door);
      const w = Math.max(3, Math.round(32 * Math.cos(dr * 1.35))), sk = Math.round(Math.sin(dr * 1.35) * 5);
      const x0 = -38, x1 = -38 + w;
      door.poly([[x0, -66], [x1, -66 - sk], [x1, 56 + sk], [x0, 56]], paper, (x) => S.step(x < x0 + 3 ? 4 : 3 - Math.round(dr), 6));
      door.rect(x1 - 2, -67 - sk, 3, 124 + 2 * sk, wood, (x) => S.step(x < x1 ? 4 : 2, 6));
      door.rect(x0, -67, 2, 124, wood, 3);
      for (const y of [-40, -8, 24]) door.line(x0, y, x1, y + Math.round(sk * (y - -5) / 61), wood, 2);
      if (w > 14 && (q.eyes || 'mourn') !== 'shut') { const sx = (x) => x0 + ((x + 38) / 32) * w; door.poly([[sx(-18), -29], [sx(-29), -33], [sx(-29), -25], [sx(-19), -23]], ink, 0); }
      if (q.letter > 0.05 && w > 10) door.stone([[x0 + 3, 4], [x1 - 3, 3], [x1 - 3, 17], [x0 + 3, 16]], letter, { bevel: 1, face: 2 });
      door.restore();
    }
    // ---- the foot: a stone block seen from a little above (its top face, front and right side)
    rockT(ground);
    ground.poly([[-36, 64], [26, 64], [40, 60], [-22, 60]], stone, (x) => S.step(x < -10 ? 5 : 4, 6));
    ground.rect(-36, 64, 62, 10, stone, (x, y) => S.step(x < -26 ? 4 : y > 71 ? 2 : 3, 6));
    ground.poly([[26, 64], [40, 60], [40, 70], [26, 74]], stone, () => S.step(1, 6));
    ground.rect(-10, 74, 16, 12, stone, (x) => S.step(x < -6 ? 4 : x < 2 ? 3 : 1, 6));
    ground.poly([[-18, 84], [12, 84], [20, 81], [-10, 81]], stone, () => S.step(4, 6));
    ground.rect(-18, 84, 30, 4, stone, (x) => S.step(x < -10 ? 3 : 2, 6));
    for (const [x, y, s] of [[-26, 68, 4], [14, 67, 3], [32, 66, 3]]) K.cluster(ground, x, y, s, stone, 1, K.hh(x, y, 5));
    for (const [x, l] of [[-30, 5], [-22, 3], [18, 4]]) icicle(ground, x, 74, Math.round(l * (0.6 + 0.6 * ic)));
    ground.restore();
    // ---- outlines, cast shadows (the roof on the panel, the panel on the foot), the rim
    B.outline(); roof.outline(); door.outline(); ground.outline();
    S.cast(roof, B, 2, 4, 2);
    S.cast(B, ground, 2, 3, 1);
    S.cast(door, B, 2, 3, 1);
    const out = aura.over(ground).over(B).over(roof).over(door);
    S.rim(out, { w: 2 });
    // snow shaken off the roof, falling (sprite-local clumps)
    if (q.fall > 0.02) {
      for (let i = 0; i < 7; i++) {
        const [x0, y0] = frostPt(q, -40 + i * 13, -90);
        const k = q.fall;
        const x = x0 - Math.round(k * (24 + (i % 3) * 8)), y = y0 - Math.round(Math.sin(k * Math.PI) * (8 + (i % 2) * 6)) + Math.round(k * k * (50 + (i % 3) * 24));
        fx.ell(x, y, 3 + (i % 2), 2 + (i % 2), snow, (px, py) => S.step(py < y ? 4 : 2, 6));
      }
    }
    // frost motes circling (they swirl inward while the cold gathers)
    const mr = q.mr == null ? 1 : q.mr;
    for (let i = 0; i < 10; i++) {
      const a = (q.mph || 0) + i * (Math.PI * 2 / 10);
      const r = (70 + (i % 3) * 8) * mr;
      const x = Math.round(Math.cos(a) * r), y = Math.round(Math.sin(a) * r * 0.55) - 4 + (q.lift || 0);
      if (warmth > 0.6) { fx.dot(x, y, K.solid('#ffd890', { line: false }), 0); continue; }
      fx.rect(x - 1, y, 3, 1, mote, 0); fx.rect(x, y - 1, 1, 3, mote, 0); fx.dot(x, y, mote, (i + Math.round((q.mph || 0) * 3)) % 4 === 0 ? 2 : 1);
    }
    // cold breath at the open door
    if (q.breath > 0.05) {
      const [bx, by] = frostPt(q, -44, 4), pf = L.like();
      const pm = S.mat(['#a8bcec', '#d8e6fa', '#fbfdff'], { at: 1, alpha: 215, line: '#7486c4' });
      for (let i = 0; i < 4; i++) { const x = bx - i * 8 * q.breath, y = by + i * 2 - 4, rx = 4 + i * 2, ry = 3 + i; pf.ell(x, y, rx, ry, pm, (px, py) => S.step(py < y && px < x ? 2 : 1, 3)); }
      pf.outline();
      fx.over(pf);
    }
    return out.over(fx);
  }
  const FB = { rock: 0, lift: 0, flame: 1, fl: 0, dim: 0, door: 0, white: 0, warm: 0, eyes: 'mourn', snow: 1, fall: 0, ice: 1, mr: 1, mph: 0, breath: 0, letter: 0 };
  const frostIdle = [];
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2;
    frostIdle.push({ rock: 0, flame: [1, 1.1, 1.2, 1.1, 1, 0.9, 0.95, 1][f], fl: Math.round(Math.sin(a) * 2), mph: (f / 8) * (Math.PI * 2 / 10), eyes: f === 5 ? 'down' : 'mourn' });
  }
  const fk = (from, ...st) => CB.keys(Object.assign({}, FB, from), ...st);
  const frostActs = {
    // Chill (signature): the door eases open, the flame shrinks white, the motes swirl in, the
    // icicles lengthen — then it breathes frost at its one target; the door swings to with a clack
    'prep:chill': fk({}, [{ door: 0.2, flame: 0.9, white: 0.3, mr: 0.9, eyes: 'down', mph: 0.3 }, 2, E.out], [{ door: 0.5, flame: 0.7, white: 0.6, mr: 0.75, ice: 1.3, mph: 0.9 }, 2, E.io], [{ door: 0.65, flame: 0.55, white: 0.9, mr: 0.6, ice: 1.5, mph: 1.6, eyes: 'wide' }, 2, E.io]),
    'exec:chill': fk({ door: 0.65, flame: 0.55, white: 0.9, mr: 0.6, ice: 1.5, mph: 1.6, eyes: 'wide' }, [{ door: 0.9, rock: 0.03, breath: 0.6, flame: 0.4, mph: 2.2 }, 1, E.in], [{ door: 1, rock: 0.05, breath: 1, flame: 0.35, mr: 0.8, mph: 2.8 }, 1, E.lin], [{ door: 1, rock: 0.05, breath: 1, mph: 3.4 }, 1, E.lin], [{ door: 0.95, rock: 0.04, breath: 0.6, mr: 0.9, mph: 4 }, 1, E.lin]),
    'recover:chill': fk({ door: 0.95, rock: 0.04, breath: 0.6, flame: 0.35, white: 0.9, mr: 0.9, ice: 1.5, eyes: 'wide', mph: 4 }, [{ door: 0.3, rock: 0.01, breath: 0, flame: 0.6, white: 0.6, mph: 4.6 }, 1, E.in], [{ door: 0, rock: -0.02, flame: 0.8, fall: 0.3, eyes: 'down', mph: 5.2 }, 1, E.lin], [{ door: 0.12, rock: 0.01, fall: 0.6, mph: 5.8 }, 1, E.out], [{ door: 0, rock: 0, flame: 1, white: 0, mr: 1, ice: 1, fall: 0, eyes: 'mourn', mph: 6.4 }, 2, E.io]),
    // Strike: it rocks back on its heel, then tips onto its toe so the eave swings at its target
    // and the snow bursts off; it rocks down and settles on its foot (mechanical settling)
    'prep:strike': fk({}, [{ rock: -0.06, flame: 1.2, eyes: 'wide', fl: 3, mph: 0.4 }, 2, E.out], [{ rock: -0.12, flame: 1.3, fl: 5, snow: 0.95, mph: 0.8 }, 2, E.io]),
    'exec:strike': fk({ rock: -0.12, flame: 1.3, fl: 5, eyes: 'wide', snow: 0.95 }, [{ rock: 0.08, fl: -2, mph: 1.4 }, 1, E.in], [{ rock: 0.2, fl: -6, snow: 0.4, fall: 0.25, flame: 1.4, mph: 1.8 }, 1, E.out], [{ rock: 0.19, fl: -6, snow: 0.3, fall: 0.5, mph: 2.2 }, 1, E.lin]),
    'recover:strike': fk({ rock: 0.19, fl: -6, snow: 0.3, fall: 0.5, flame: 1.4, eyes: 'wide' }, [{ rock: 0, fl: 2, fall: 0.8, flame: 1.2 }, 1, E.in], [{ rock: -0.04, fl: 3, fall: 1, snow: 0.35 }, 1, E.out], [{ rock: 0.015, fl: -1, fall: 0, eyes: 'mourn' }, 1, E.io], [{ rock: 0, fl: 0, flame: 1, snow: 0.4 }, 2, E.io], [{ snow: 0.7 }, 1, E.lin]),
    // its plea: the flame sinks to an ember, the door left ajar shows a letter, eyes down
    'cast:plea': fk({}, [{ flame: 0.7, dim: 0.2, eyes: 'down' }, 2, E.out], [{ flame: 0.4, dim: 0.4, door: 0.3, letter: 1, rock: 0.03 }, 2, E.io], [{ flame: 0.3, dim: 0.45, door: 0.35, mr: 0.85 }, 3, E.io]),
    'recover:plea': fk({ flame: 0.3, dim: 0.45, door: 0.35, letter: 1, rock: 0.03, mr: 0.85, eyes: 'down' }, [{ flame: 0.6, dim: 0.2, door: 0.1, letter: 0, rock: 0.01 }, 2, E.io], [{ flame: 1, dim: 0, door: 0, rock: 0, mr: 1, eyes: 'mourn' }, 2, E.out]),
    // reactions
    recoil: fk({}, [{ rock: -0.08, flame: 0.7, fl: 5, eyes: 'shut', fall: 0.2 }, 1, E.out], [{ rock: 0.03, flame: 0.85, fl: -2, fall: 0.5 }, 1, E.io], [{ rock: -0.01, fl: 1, fall: 0.8, eyes: 'down' }, 1, E.io], [{ rock: 0, fl: 0, flame: 1, fall: 0, eyes: 'mourn' }, 1, E.out]),
    release: fk({}, [{ warm: 0.35, flame: 1.3, eyes: 'shut' }, 1, E.out], [{ warm: 0.5, flame: 1.4, mr: 1.1 }, 1, E.io], [{ warm: 0.25, flame: 1.15, eyes: 'down' }, 1, E.io], [{ warm: 0, flame: 1, mr: 1, eyes: 'mourn' }, 1, E.out]),
    balk: fk({ door: 0.6, white: 0.8, flame: 0.6, eyes: 'wide' }, [{ door: 0.05, white: 0.5, flame: 0.8, rock: -0.03, fall: 0.3 }, 1, E.out], [{ door: 0.15, white: 0.3, rock: 0.01, fall: 0.6 }, 1, E.io], [{ door: 0, white: 0, flame: 1, rock: 0, fall: 0, eyes: 'down' }, 1, E.io], [{ eyes: 'mourn' }, 1, E.out]),
    settle: fk({}, [{ warm: 0.4, flame: 1.2, eyes: 'shut', mr: 1.1 }, 1, E.out], [{ warm: 0.8, flame: 1.4, ice: 0.6, eyes: 'warm' }, 1, E.io], [{ warm: 1, flame: 1.3, ice: 0.3, snow: 0.8 }, 1, E.io], [{ warm: 1, flame: 1.2, ice: 0.1 }, 1, E.out]),
    rest: fk({}, [{ flame: 0.7, dim: 0.15, eyes: 'down', mr: 0.95 }, 1, E.io], [{ flame: 0.55, dim: 0.25, eyes: 'shut', mph: 0.2 }, 1, E.io], [{ flame: 0.55, dim: 0.25, eyes: 'shut', mph: 0.4 }, 1, E.io], [{ flame: 0.75, dim: 0.1, eyes: 'down', mph: 0.6 }, 1, E.io]),
  };
  CB.rig('sb_frostlamp', {
    w: 212, h: 244, ox: 106, oy: 114, ms: 150,
    base: FB, idle: frostIdle, acts: frostActs,
    keys: { chill: ['exec:chill', 2], strike: ['exec:strike', 1], plea: ['cast:plea', 5] },
    alias: { prep: 'prep:chill' },
    draw: drawFrostLamp,
  });
  const fpt = (act, i, x, y) => frostPt(frostActs[act][i], x, y);
  CB.deliver('sb_frostlamp', ['chill'], (a) => {
    const blk = CB.blocked(a);
    const m = fpt('exec:chill', 1, -44, 4);
    return CB.play(a, {
      key: 'key:chill', contact: 900, end: 1700,
      parts: [{ at: 0, act: 'prep:chill', d: 560 }, { at: 560, act: 'exec:chill', d: 420 }, blk ? { at: 980, act: 'balk', d: 300 } : null, { at: blk ? 1280 : 980, act: 'recover:chill', d: blk ? 420 : 720 }].filter(Boolean),
      fx: [{ at: 600, name: 'cbFrostBreath', d: 620, p: { dx: m[0], dy: m[1], to: a.aimed, short: blk } }],
    });
  });
  CB.deliver('sb_frostlamp', ['strike'], (a) => {
    const blk = CB.blocked(a);
    const m = fpt('exec:strike', 2, -56, -76);
    return CB.play(a, {
      key: 'key:strike', contact: 680, end: 1400,
      parts: [
        { at: 0, act: 'prep:strike', d: 360 },
        { at: 360, act: 'exec:strike', d: 340, travel: { to: a.aimed, peak: blk ? 0.12 : 0.18, arc: 0, shape: 'out' } },
        blk ? { at: 700, act: 'balk', d: 280, travel: { to: a.aimed, peak: 0.12, shape: 'back' } } : null,
        { at: blk ? 980 : 700, act: 'recover:strike', d: blk ? 420 : 700, travel: blk ? null : { to: a.aimed, peak: 0.18, shape: 'back' } },
      ].filter(Boolean),
      fx: [{ at: 500, name: 'cbSnowBurst', d: 700, p: { dx: m[0], dy: m[1], to: a.aimed, short: blk } }],
    });
  });
  CB.deliver('sb_frostlamp', ['plea'], (a) => CB.play(a, {
    key: 'key:plea', contact: 780, end: 1500,
    parts: [{ at: 0, act: 'cast:plea', d: 860 }, { at: 860, act: 'recover:plea', d: 640 }],
    fx: [{ at: 420, name: 'cbNote', d: 900, p: { dx: -48, dy: 8, to: 'party' } }],
  }));
  CB.deliver('sb_frostlamp', ['*'], (a) => CB.play(a, {
    key: 'key:plea', contact: 700, end: 1300,
    parts: [{ at: 0, act: 'cast:plea', d: 760 }, { at: 760, act: 'recover:plea', d: 540 }],
  }));

  CB.family('lantern', { anatomy: 'hung lantern (constructed): one hinge at the loop, a lagging internal flame seen through the paper, a torn grin, a trailing ghost-flame tail', palette: 'flame from artOpts.col (blue #8ab8f0 / lavender #9aa8d8 / guttering orange #e8a060 / pale #d8c0a0 with its moths), paper #f4ead0 tinted by the flame (6 steps), dark wood #4a3630, bamboo #8a7048' });
  CB.family('sb_frostlamp', { anatomy: 'standing lamp, large boss (constructed): rocks on the edge of its stone foot, a hinged door leaf, roof snow that shakes loose, icicles, an internal cold flame', palette: 'wood #2e2c3e, paper #d8e8f4 (warms to #f8ecc8), cold flame #8ab8f0 (white when gathering, #f8a040 when released), snow #eef4fa, ice #bcd8ee, stone #6a6878' });
})();
