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
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E;
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
  function drawLantern(L, o, q, H) {
    const fl0 = o.col || '#8aa8e8';
    const moths = !!o.moths || String(fl0).toLowerCase() === MOTHLAMP;
    const fl = q.false > 0.5 ? mixh(fl0, '#f0a050', 0.7) : q.hot > 0 ? mixh(fl0, '#fff0b0', 0.55 * q.hot) : fl0;
    const dim = q.dim || 0, glowK = (q.glow == null ? 1 : q.glow) * (1 - dim * 0.6);
    const paper = K.mat(mixh(mixh('#f4ead0', fl, 0.16), q.hot > 0 ? '#fff4d0' : '#f4ead0', 0.3 * (q.hot || 0)), { n: 6, at: 3, step: 0.075 });
    const wood = K.mat('#4a3630', { n: 5, at: 2, step: 0.085 });
    const bamboo = K.mat('#8a7048', { n: 4, at: 2, step: 0.09 });
    const flameM = K.mat(mixh(fl, '#fff6d8', 0.35 + 0.3 * (q.hot || 0)), { n: 4, at: 2, step: 0.12, line: false });
    const core = K.solid(mixh(fl, '#ffffff', 0.8), { line: false });
    const ghost = K.mat(fl, { n: 4, at: 2, step: 0.1, alpha: 185, line: false });
    const ghost2 = K.mat(fl, { n: 3, at: 1, step: 0.1, alpha: 105, line: false });
    const tongue = K.mat('#d8707a', { n: 3, at: 1, line: false });
    const blush = K.solid('#e89a90', { line: false });
    const smokeM = K.mat('#8a8498', { n: 3, at: 1, step: 0.08, alpha: 150, line: false });
    const smokeM2 = K.mat('#a8a2b4', { n: 3, at: 1, step: 0.08, alpha: 90, line: false });
    const mothM = K.mat('#f2ead8', { n: 4, at: 2, step: 0.08, lineCol: '#4a4038' });
    const aura = L.like(), tail = L.like(), B = L.like(), fx = L.like(), front = L.like();
    // ---- light around it (stepped, never a blur)
    const ac = lanPt(q, 0, -2);
    H.glow(aura, ac[0], ac[1], 46 + (q.flame || 1) * 4, 52 + (q.flame || 1) * 4, fl, 0.24 * glowK, 3);
    // ---- the ghost tail, hanging from the lower cap; it trails the swing
    const tb = lanPt(q, 0, 44);
    const tlen = q.tlen || 60;
    H.tail(tail, tb[0], tb[1], tlen, 17, q.tph || 0, [[0, 26, ghost], [26, 120, ghost2]], { amp: q.tamp == null ? 7 : q.tamp, curl: 10, dark: 0.1, lean: (q.tlean || 0) - Math.sin(q.tilt || 0) * 0.6 });
    // ---- the lantern (swung about its loop)
    B.save().translate(0, q.lift || 0).translate(0, LPIV).rotate(q.tilt || 0).translate(0, -LPIV);
    // bamboo loop with a binding where it meets the cap
    B.path([[-12, -52], [-11, -61], [-5, -67], [5, -67], [11, -61], [12, -52]], 3, bamboo, (x, y) => K.clamp(0.7 - (x + 12) / 40 - (y + 67) / 60, 0, 0.99));
    B.rect(-13, -55, 4, 3, wood, 1); B.rect(9, -55, 4, 3, wood, 1);
    const br = q.breathe || 0;
    const hwAt = (y) => 22 + br + (9 + br * 0.6) * Math.cos(((y + 3) / 46) * (Math.PI / 2));
    // the flame's place inside (it lags the swing)
    const fxp = (q.fl || 0), fyp = 10 - (q.flame || 1) * 2;
    B.fill(-36 - br, -46, 36 + br, 40, (x, y) => y >= -46 && y < 40 && Math.abs(x) <= hwAt(y), paper, (x, y) => {
      const n = Math.abs(x) / hwAt(y);
      const g = 1 - Math.hypot((x - fxp) / (30 + br), (y - fyp) / 40);
      return K.clamp(0.24 + g * (0.58 + (q.flame || 1) * 0.07) * glowK - n * n * 0.25 + (x < 0 ? 0.05 : -0.04) - dim * 0.15, 0, 0.99);
    });
    // paper strips (faint vertical joins) and the bamboo ribs curving with the barrel
    B.onto((b) => {
      for (const sx of [-0.55, 0.05, 0.6]) for (let y = -44; y < 38; y++) { const x = Math.round(sx * hwAt(y)); if ((y + 44) % 3) b.dot(x, y, paper, 1); }
      for (let y = -37; y < 36; y += 9) {
        const hw = hwAt(y);
        for (let x = -Math.floor(hw) + 1; x < hw - 1; x++) b.dot(x, y + Math.round((x / hw) * (x / hw) * 2), paper, Math.abs(x) / hw > 0.7 ? 0 : 1);
      }
      // a small tear (upper right) with the flame showing through its ragged edge
      b.poly([[14, -30], [19, -33], [22, -27], [19, -22], [15, -24]], K.solid('#2a1e24', { line: false }), 0);
      b.poly([[16, -29], [19, -30], [20, -26], [17, -25]], flameM, 2);
    });
    // caps: dark wood with a lit bevel and grain
    B.rect(-25 - br * 0.5, -53, 50 + br, 8, wood, (x, y) => K.clamp(0.6 - (y + 53) / 16 + (x < 0 ? 0.12 : -0.1), 0, 0.99));
    B.rect(-23 - br * 0.5, 38, 46 + br, 7, wood, (x, y) => K.clamp(0.55 - (y - 38) / 14 + (x < 0 ? 0.12 : -0.1), 0, 0.99));
    for (const x of [-16, -3, 11]) { B.line(x, -51, x + 4, -51, wood, 3); B.line(x + 2, 40, x + 6, 40, wood, 3); }
    B.restore();
    B.outline();
    // ---- the face (on the paper, swung with it)
    B.onto((b) => {
      b.save().translate(0, q.lift || 0).translate(0, LPIV).rotate(q.tilt || 0).translate(0, -LPIV);
      const eyes = q.false > 0.5 ? 'soft' : q.eyes || 'open';
      for (const s of [-1, 1]) {
        const ex = s * 11, ey = -14;
        if (eyes === 'shut') { b.line(ex - 4, ey + 1, ex + 4, ey + 1, H.ink, 1); b.dot(ex - 4, ey, H.ink, 1); b.dot(ex + 4, ey, H.ink, 1); }
        else if (eyes === 'half') { b.ell(ex, ey + 2, 3.5, 2.5, H.ink, 1); b.rect(ex - 2, ey + 1, 2, 1, H.white, 0); }
        else if (eyes === 'soft') { b.line(ex - 4, ey + 1, ex, ey - 2, H.ink, 1); b.line(ex, ey - 2, ex + 4, ey + 1, H.ink, 1); b.rect(ex - 6, ey + 4, 3, 1, blush, 0); b.rect(ex + 3, ey + 4, 3, 1, blush, 0); }
        else if (eyes === 'squint') { b.poly([[ex - 5, ey - 1], [ex + 4, ey + 1], [ex - 4, ey + 3]], H.ink, 1); }
        else if (eyes === 'wide') { b.ell(ex, ey, 4.5, 6, H.ink, 1); b.rect(ex - 2, ey - 4, 2, 2, H.white, 0); b.dot(ex + 1, ey + 2, H.white, 0); }
        else { b.ell(ex, ey, 3.5, 5, H.ink, 1); b.rect(ex - 2, ey - 4, 2, 2, H.white, 0); }
      }
      // the mouth: a torn grin that shows the flame (closed / grin / wide), or the false smile
      if (q.false > 0.5) {
        for (let x = -7; x <= 7; x++) b.dot(x, 14 - Math.round((x * x) / 14), H.ink, 1);
      } else {
        const m = q.mouth == null ? 1 : q.mouth, sy = 0.45 + 0.4 * m;
        const g = [[-15, 6], [-9, 11], [-5, 7], [0, 12], [5, 7], [10, 12], [15, 5], [12, 16], [4, 20], [-5, 20], [-12, 15]].map(([x, y]) => [x * (1 + 0.06 * m), 6 + (y - 6) * sy]);
        b.poly(g, H.ink, 1);
        b.poly([[-10, 13], [-4, 10], [0, 14], [5, 10], [10, 14], [6, 18], [-6, 18]].map(([x, y]) => [x * (1 + 0.06 * m), 6 + (y - 6) * sy]), flameM, 1 + (q.flame > 1.2 ? 1 : 0));
        if (m > 1.3) b.ell(fxp * 0.3, 6 + 10 * sy, 4, 3 * sy, core, 0);
        b.ell(3, 6 + 12 * sy, 4, 3 * Math.min(1, sy), tongue, 1);
      }
      b.restore();
    });
    // ---- heat shimmer off the cap
    if (q.hot > 0.05) {
      const sh = K.solid(mixh(fl, '#fff8d0', 0.6), { line: false });
      for (let i = 0; i < 4; i++) {
        const [x0, y0] = lanPt(q, -15 + i * 10, -56);
        for (let y = 0; y < 10 + q.hot * 14; y += 2) fx.dot(x0 + Math.round(Math.sin((y + i * 5 + (q.tph || 0) * 6) / 3) * 1.5), y0 - y, sh, 0);
      }
      fx.fade(0.5 + 0.4 * q.hot);
    }
    // ---- smoke pouring from the lower cap and the grin (Shroud)
    if (q.smoke > 0.05) {
      const n = Math.round(3 + q.smoke * 6);
      for (let i = 0; i < n; i++) {
        const k = ((i / n) + (q.sph || 0)) % 1;
        const [x0, y0] = lanPt(q, (i % 3 - 1) * 12, 44);
        const x = x0 + Math.round(Math.sin(i * 2.3 + k * 3) * 10 * k), y = y0 + Math.round(k * 46 * q.smoke);
        const r = 5 + k * 9;
        fx.ell(x, y, r, r * 0.6, k < 0.5 ? smokeM : smokeM2, (px, py) => K.clamp(0.75 - (py - y + r) / (r * 3), 0, 0.99));
      }
      const [mx, my] = lanPt(q, 0, 14);
      fx.ell(mx - 8, my + 6, 6, 4, smokeM2, 1);
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
        const Lr = Math.sin(a) > 0 ? front : tail;          // the near side passes in front
        Lr.ell(x, y, 1.5, 3, mothM, 1);
        Lr.poly(up ? [[x, y - 1], [x - 7, y - 6], [x - 6, y + 1]] : [[x, y - 1], [x - 7, y + 2], [x - 5, y + 3]], mothM, 3);
        Lr.poly(up ? [[x, y - 1], [x + 7, y - 6], [x + 6, y + 1]] : [[x, y - 1], [x + 7, y + 2], [x + 5, y + 3]], mothM, 2);
        Lr.dot(x - 1, y - 3, mothM, 0); Lr.dot(x + 1, y - 3, mothM, 0);
      }
      front.outline();
    }
    tail.outline({});
    return aura.over(tail).over(B).over(fx).over(front);
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
  function drawFrostLamp(L, o, q, H) {
    const warmth = Math.max(o.warm ? 1 : 0, q.warm || 0);
    const wood = K.mat('#2e2c3e', { n: 5, at: 2, step: 0.08 });
    const woodHi = K.mat('#4a4058', { n: 4, at: 2, step: 0.08 });
    const paperCol = mixh('#d8e8f4', '#f8ecc8', warmth);
    const paper = K.mat(paperCol, { n: 6, at: 3, step: 0.07 });
    const flameC = mixh(q.white ? mixh('#8ab8f0', '#f4fbff', q.white) : '#8ab8f0', '#f8a040', warmth);
    const flameM = K.mat(flameC, { n: 4, at: 2, step: 0.12, line: false });
    const coreM = K.solid(mixh(flameC, '#ffffff', 0.75), { line: false });
    const snow = K.mat('#eef4fa', { n: 5, at: 3, step: 0.06 });
    const ice = K.mat('#bcd8ee', { n: 4, at: 2, step: 0.1, alpha: 230 });
    const stone = K.mat('#6a6878', { n: 5, at: 2, step: 0.08 });
    const mote = K.mat('#e6f4ff', { n: 2, at: 1, line: false });
    const cav = K.mat('#121220', { n: 3, at: 0, step: 0.05, line: false });
    const letter = K.mat('#efe4c8', { n: 4, at: 2, step: 0.07 });
    const aura = L.like(), B = L.like(), door = L.like(), fx = L.like(), ground = L.like();
    const fs = q.flame == null ? 1 : q.flame, dim = q.dim || 0;
    const ac = frostPt(q, 0, -4);
    H.glow(aura, ac[0], ac[1], 60 + fs * 4, 72 + fs * 4, flameC, 0.24 * (1 - dim * 0.6), 3);
    // the foot stays on the ground (stone) — drawn unrocked except when it tips
    const rockT = (Lr) => { const a = q.rock || 0, px = a > 0 ? -36 : a < 0 ? 36 : 0; Lr.save().translate(0, q.lift || 0).translate(px, 86).rotate(-a).translate(-px, -86); };
    rockT(B);
    // roof: wide cap, ridge and its snow (shaken loose as q.snow falls)
    B.poly([[-56, -76], [-42, -91], [42, -91], [56, -76], [50, -72], [-50, -72]], wood, (x, y) => K.clamp(0.62 - (y + 91) / 30 - x / 200, 0, 0.99));
    B.line(-50, -73, 50, -73, woodHi, 3);
    B.rect(-10, -97, 20, 6, wood, 2); B.rect(-12, -98, 24, 2, woodHi, 2);
    const sn = q.snow == null ? 1 : q.snow;
    if (sn > 0.05) B.fill(-46, -102, 46, -86, (x, y) => y >= -93 - Math.round(Math.sin(x / 6) * 1.5) - Math.round(sn * 2) && y < -87 && Math.abs(x) < (42 - (y + 93) * 0.5) * (0.4 + 0.6 * sn) + (K.hh(Math.round(x), 3, 1) % 3), snow, (x, y) => K.clamp(0.82 - (x + 40) / 160 - (y + 93) / 20, 0, 0.99));
    // posts, the lit paper panel and its lattice
    B.rect(-42, -72, 84, 136, paper, (x, y) => {
      const g = 1 - Math.hypot((x - (q.fl || 0)) / 44, (y + 4) / 70);
      return K.clamp(0.2 + g * (0.7 + fs * 0.06) * (1 - dim * 0.5) + (x < 0 ? 0.04 : -0.04), 0, 0.99);
    });
    // the door leaf (front left): its opening shows the dark inside and the flame itself
    const dr = q.door || 0;
    if (dr > 0.02) {
      B.rect(-36, -66, 36, 122, cav, (x, y) => K.clamp(0.15 + (1 - Math.hypot((x + 14) / 30, (y - 10) / 60)) * 0.6, 0, 0.99));
      // the flame, seen whole through the open door
      const fx0 = -14 + (q.fl || 0), fy0 = 18;
      B.ell(fx0, fy0 - fs * 6, 7 + fs * 3, 14 + fs * 6, flameM, (x, y) => K.clamp(0.9 - Math.hypot((x - fx0) / 10, (y - fy0) / 22) * 0.8, 0, 0.99));
      B.ell(fx0, fy0 - fs * 3, 3 + fs, 7 + fs * 3, coreM, 0);
      B.rect(fx0 - 5, fy0 + 10, 10, 4, wood, 2); // the wick cup
    }
    for (const x of [-42, 36]) B.rect(x, -72, 6, 136, wood, x < 0 ? 3 : 1);
    B.rect(-42, -72, 84, 5, wood, 3);
    B.rect(-42, 56, 84, 8, wood, 1);
    if (dr > 0.02) B.rect(-3, -67, 5, 123, wood, 2); // the centre stile (the open door's other edge)
    B.onto((b) => {
      for (const y of [-40, -8, 24]) b.line(2, y, 36, y, wood, 1);
      b.line(18, -67, 18, 56, wood, 1);
      if (dr <= 0.02) { for (const y of [-40, -8, 24]) b.line(-36, y, -3, y, wood, 1); b.line(-19, -67, -19, 56, wood, 1); b.line(0, -67, 0, 56, wood, 1); }
    });
    // the cold flame, seen through the paper (when the door is shut it glows through)
    if (dr <= 0.02) {
      B.ell(q.fl || 0, 10, 10 + fs * 2, 20 + fs * 4, paper, 5);
      B.ell(q.fl || 0, 16, 5 + fs, 10 + fs * 3, K.solid(warmth > 0.5 ? '#fff4b0' : '#f2f8ff', { line: false }), 0);
    }
    // mournful eyes on the paper (right half; the door leaf carries none)
    const eyes = q.eyes || 'mourn';
    for (const s of [-1, 1]) {
      const ex = s * 13, ey = -30;
      if (s < 0 && dr > 0.3) continue;
      if (eyes === 'shut') { B.line(ex - 6, ey + 1, ex + 6, ey + 2, H.ink, 1); }
      else if (eyes === 'down') { B.poly([[ex - 6, ey + 1], [ex + 6, ey - 1], [ex + 6, ey + 4], [ex - 5, ey + 4]], H.ink, 1); B.rect(ex - 1, ey + 2, 2, 1, H.white, 0); }
      else if (eyes === 'wide') { B.ell(ex, ey + 1, 6, 4, H.ink, 1); B.rect(ex - 2, ey - 1, 2, 2, H.white, 0); }
      else if (eyes === 'warm') { B.line(ex - 5, ey + 2, ex, ey - 1, H.ink, 1); B.line(ex, ey - 1, ex + 5, ey + 2, H.ink, 1); }
      else { B.poly([[s * 7, -30], [s * 19, -34], [s * 19, -26], [s * 8, -24]], H.ink, 1); B.rect(s * 12 - 1, -31, 2, 2, H.white, 0); }
    }
    // icicles on the eaves (they lengthen as the cold gathers)
    const ic = q.ice == null ? 1 : q.ice;
    const icicle = (Lr, x, y, len) => Lr.poly([[x - 3, y], [x + 3, y], [x, y + len]], ice, (px) => K.clamp(0.75 - (px - x + 3) / 8, 0, 0.99));
    for (let i = 0; i < 9; i++) icicle(B, -44 + i * 11, -72, Math.round((6 + ((i * 5) % 9)) * (0.6 + 0.6 * ic)));
    B.restore();
    // the door leaf itself, swung open on its hinge at the left post (foreshortened)
    if (dr > 0.02) {
      rockT(door);
      // hinged at the left post, it swings out toward you: seen nearly edge-on when wide open,
      // its free edge (nearer) a little taller
      const w = Math.max(3, Math.round(33 * Math.cos(dr * 1.35))), sk = Math.round(Math.sin(dr * 1.35) * 4);
      const x0 = -36, x1 = -36 + w;
      door.poly([[x0, -66], [x1, -66 - sk], [x1, 56 + sk], [x0, 56]], paper, (x, y) => K.clamp(0.66 - (x - x0) / 70 - dr * 0.15, 0, 0.99));
      door.rect(x1 - 2, -67 - sk, 3, 124 + 2 * sk, wood, 2);
      door.rect(x0, -67, 2, 124, wood, 1);
      for (const y of [-40, -8, 24]) door.line(x0, y, x1, y + Math.round(sk * (y - -5) / 61), wood, 1);
      // a letter tucked in the door (its plea)
      if (q.letter > 0.05 && w > 10) door.stone([[x0 + 3, 4], [x1 - 3, 3], [x1 - 3, 17], [x0 + 3, 16]], letter, { bevel: 1, face: 2 });
      door.restore();
    }
    // the foot: a stone block on the ground (it tips with the lamp)
    rockT(ground);
    ground.stone([[-32, 64], [32, 64], [38, 74], [-38, 74]], stone, { bevel: 2, face: 2 });
    ground.rect(-7, 74, 14, 12, stone, 1);
    ground.stone([[-14, 84], [14, 84], [16, 88], [-16, 88]], stone, { bevel: 1, face: 1 });
    for (let i = 0; i < 6; i++) icicle(ground, -30 + i * 12, 74, Math.round((5 + ((i * 7) % 8)) * (0.6 + 0.6 * ic)));
    ground.restore();
    B.outline(); door.outline(); ground.outline();
    // snow shaken off the roof, falling (sprite-local clumps)
    if (q.fall > 0.02) {
      for (let i = 0; i < 7; i++) {
        const [x0, y0] = frostPt(q, -40 + i * 13, -90);
        const k = q.fall;
        const x = x0 - Math.round(k * (24 + (i % 3) * 8)), y = y0 - Math.round(Math.sin(k * Math.PI) * (8 + (i % 2) * 6)) + Math.round(k * k * (50 + (i % 3) * 24));
        fx.ell(x, y, 3 + (i % 2), 2 + (i % 2), snow, 3);
      }
    }
    // frost motes circling (they swirl inward while the cold gathers)
    const mr = q.mr == null ? 1 : q.mr;
    for (let i = 0; i < 10; i++) {
      const a = (q.mph || 0) + i * (Math.PI * 2 / 10);
      const r = (70 + (i % 3) * 8) * mr;
      const x = Math.round(Math.cos(a) * r), y = Math.round(Math.sin(a) * r * 0.55) - 4 + (q.lift || 0);
      if (warmth > 0.6) { fx.dot(x, y, K.solid('#ffd890', { line: false }), 0); continue; }
      fx.rect(x - 1, y, 3, 1, mote, 1); fx.rect(x, y - 1, 1, 3, mote, 1);
      if ((i + Math.round((q.mph || 0) * 3)) % 4 === 0) fx.dot(x, y, K.solid('#ffffff', { line: false }), 0);
    }
    // cold breath at the open door
    if (q.breath > 0.05) {
      const [bx, by] = frostPt(q, -40, 4);
      const pm = K.mat('#e2f0ff', { n: 3, at: 1, step: 0.06, alpha: 170, line: false });
      for (let i = 0; i < 4; i++) fx.ell(bx - i * 8 * q.breath, by + i * 2 - 4, 4 + i * 2, 3 + i, pm, 2 - (i > 1 ? 1 : 0));
    }
    return aura.over(ground).over(B).over(door).over(fx);
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
