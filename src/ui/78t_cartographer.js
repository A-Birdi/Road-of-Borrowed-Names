/* Creatures B — the Blank Cartographer (atlas.cartographer, family 'atlas_cartographer'), an
 * Atlas guardian.
 *
 * A hooded figure folded out of unfinished maps: three paper panels for a cloak (grid, the
 * contours of a hill left open, a dotted route that stops short), a hollow hood with pale eyes,
 * a chart that unrolls from its right hand and, in its left, the brush it erases roads with
 * (its settling line: it lays the brush down).
 *
 * Anatomy (paper / cloth): flat facets split by crisp creases; the whole figure leans from its
 * hem on the ground; the panels swing out from the shoulders and settle after the body moves;
 * the chart is a paper strip that bends along its length and follows its hand; the hood bows.
 * Strike: it draws the chart back over its shoulder and snaps it out like a lash at its one
 * target. Sweep: it raises the brush and drags one long erasing stroke across the party. Shroud:
 * blank sheets fold out of its cloak over itself and drift down over its knots. Plea: it holds
 * the chart out flat, unrolled, one thin road left on it. Waiting: chart rolled, hood bowed. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  // a point of the figure after its lean about the hem (0, 78)
  function cartPt(q, x, y) {
    const a = q.lean || 0, c = Math.cos(a), s = Math.sin(a), dy = y - 78;
    return [Math.round(x * c - dy * s), Math.round(78 + x * s + dy * c)];
  }
  // the chart's spine: from the hand, `cl` long, starting at angle ca (0 = hanging down, +π/2 = held
  // out toward the party, −π = straight up), bending by cw
  function chartSpine(q) {
    const n = 8, out = [[q.hx, q.hy]];
    let a = q.ca || 0, x = q.hx, y = q.hy;
    const seg = Math.max(4, (q.cl || 30) / n);
    for (let i = 0; i < n; i++) {
      a += (q.cw || 0) * Math.sin((i / n) * Math.PI * 1.5 + (q.cph || 0));
      x += -Math.sin(a) * seg; y += Math.cos(a) * seg;
      out.push([x, y]);
    }
    return out;
  }
  function drawCart(L, o, q, H) {
    const pale = !!o.pale;
    const paper = K.mat(pale ? '#f0e8d4' : '#e8dcc0', { n: 6, at: 3, step: 0.07, shift: 1.2 });
    const paperD = K.mat(pale ? '#d8ccb0' : '#cbbd98', { n: 5, at: 2, step: 0.07 });
    const grid = K.solid(mixh(pale ? '#d2c6a8' : '#b4a684', '#e8dcc0', q.erase || 0), { line: false });
    const route = K.solid(mixh('#8a5a3a', '#e8dcc0', q.erase || 0), { line: false });
    const hood = K.mat('#2a2a3a', { n: 3, at: 1, step: 0.06 });
    const eyeM = K.mat(q.eyeWarm ? '#f0d8a0' : '#9ec4f0', { n: 3, at: 1, line: false });
    const chart = K.mat('#f8f2e2', { n: 5, at: 3, step: 0.06 });
    const wood = K.mat('#6a4a3a', { n: 4, at: 2, step: 0.1 });
    const inkM = K.mat('#2a2030', { n: 3, at: 1, step: 0.08 });
    const blankM = K.mat('#fbf8f0', { n: 4, at: 2, step: 0.05 });
    const back = L.like(), B = L.like(), front = L.like(), fx = L.like();
    const lean = q.lean || 0;
    const T = (Lr) => Lr.save().translate(0, 78).rotate(lean).translate(0, -78);
    // ---- the cloak: three panels, each its own flat facet; the side panels swing out
    T(B);
    const fl = q.flareL || 0, fr = q.flareR || 0, flut = q.flut || 0;
    const panels = [
      [[[-4, -42], [-40 - fl, 76 + flut], [-18, 78], [-2, 20]], 3],
      [[[-4, -42], [-2, 20], [-18, 78], [18, 78 - flut], [4, 20]], 2],
      [[[4, 20], [18, 78 - flut], [42 + fr, 74], [6, -40]], 1],
    ];
    for (const [pts, k] of panels) B.poly(pts, paper, k);
    // the hood's shoulders (the hood itself bows on its own below)
    B.poly([[-22, -34], [22, -34], [24, -24], [-24, -24]], paper, 3);
    B.onto((b) => {
      if ((q.erase || 0) < 0.95) {
        for (let x = -36; x <= 40; x += 9) b.line(x, -30, x + (x < 0 ? -2 : 2), 78, grid, 0);
        for (let y = -20; y <= 70; y += 10) b.line(-40 - fl, y, 42 + fr, y, grid, 0);
        // contour lines of an unfinished hill
        for (let r = 0; r < 3; r++) for (let a = 0; a < 20; a++) {
          if (a % 5 === 4) continue;
          const t0 = (a / 20) * Math.PI * 2, t1 = ((a + 1) / 20) * Math.PI * 2;
          b.line(12 + Math.cos(t0) * (6 + r * 5), 50 + Math.sin(t0) * (4 + r * 3), 12 + Math.cos(t1) * (6 + r * 5), 50 + Math.sin(t1) * (4 + r * 3), grid, 0);
        }
        // a dotted route that stops short
        const rt = [[-28, 60], [-20, 44], [-8, 38], [-6, 24], [6, 14]];
        for (let i = 1; i < rt.length; i++) for (let k = 0; k < 4; k += 2) {
          const u = k / 4, x = rt[i - 1][0] + (rt[i][0] - rt[i - 1][0]) * u, y = rt[i - 1][1] + (rt[i][1] - rt[i - 1][1]) * u;
          b.rect(Math.round(x), Math.round(y), 2, 2, route, 0);
        }
        b.fill(-33, 55, -23, 65, (x, y) => { const d = Math.hypot(x + 28, y - 60); return d <= 4.5 && d >= 2.5; }, route, 0);
      }
    });
    // fold creases between panels (a dark crease with a lit lip)
    B.line(-2, 20, -18, 78, paperD, 0); B.line(-1, 20, -17, 78, paper, 5);
    B.line(4, 20, 18, 78 - flut, paperD, 1); B.line(-4, -42, -2, 20, paperD, 1);
    B.restore();
    // ---- the hood: it bows and tips about the neck
    T(B);
    B.save().translate(0, -30).rotate(q.ht || 0).translate(0, (q.bow || 0) * 4); // about the neck
    B.poly([[-20, -16], [0, -40], [20, -16], [22, 4], [-22, 4]], paper, (x, y) => K.clamp(0.74 - (x + 20) / 70, 0, 0.99));
    B.line(0, -40, -3, -18, paperD, 1);
    B.ell(0, -10, 13, 11, hood, K.sphere(3, -6, 14, 12, { amb: 0.1 }));
    const eyes = q.eyes || 'open';
    for (const s of [-1, 1]) {
      if (eyes === 'shut') { B.rect(s * 5 - 2, -11, 4, 1, eyeM, 0); continue; }
      if (eyes === 'soft') { B.line(s * 5 - 2, -10, s * 5, -12, eyeM, 2); B.line(s * 5, -12, s * 5 + 2, -10, eyeM, 2); continue; }
      const h = eyes === 'narrow' ? 1 : 3;
      B.rect(s * 5 - 2, -12 + (3 - h), 4, h, eyeM, 1); B.dot(s * 5 - 2, -12 + (3 - h), eyeM, 2);
    }
    B.restore();
    B.restore();
    B.outline();
    // ---- the left arm and the brush (held toward the party)
    T(back);
    const sh1 = [-16, -26], bh = [q.bx, q.by];
    back.path([[sh1[0], sh1[1], 9], [(sh1[0] + bh[0]) / 2 - 3, (sh1[1] + bh[1]) / 2 + 2, 8], [bh[0], bh[1], 6]], 8, paperD, (x, y) => K.clamp(0.6 - (y - sh1[1]) / 80, 0, 0.99));
    back.ell(bh[0], bh[1], 4, 4, paper, 2);
    if (q.brush !== false) {
      const ba = q.ba || 0, bl = 34;
      const tip = [bh[0] - Math.sin(ba) * bl, bh[1] + Math.cos(ba) * bl];
      const butt = [bh[0] + Math.sin(ba) * 8, bh[1] - Math.cos(ba) * 8];
      back.path([[butt[0], butt[1]], [tip[0], tip[1]]], 3, wood, 2);
      back.ell(tip[0] - Math.sin(ba) * 3, tip[1] + Math.cos(ba) * 3, 3, 4, inkM, 1);
      back.dot(Math.round(tip[0] - Math.sin(ba) * 6), Math.round(tip[1] + Math.cos(ba) * 6), inkM, 0);
    }
    back.restore();
    back.outline();
    // ---- the right arm and the chart (it unrolls, snaps out, is held flat)
    T(front);
    const sh2 = [16, -26], hd = [q.hx, q.hy];
    front.path([[sh2[0], sh2[1], 9], [(sh2[0] + hd[0]) / 2 + 3, (sh2[1] + hd[1]) / 2 + 2, 8], [hd[0], hd[1], 6]], 8, paper, (x, y) => K.clamp(0.55 - (x - sh2[0]) / 80, 0, 0.99));
    const sp = chartSpine(q);
    const cw = q.flat ? 26 : 22;
    for (let i = 1; i < sp.length; i++) {
      const [x0, y0] = sp[i - 1], [x1, y1] = sp[i];
      front.seg(x0, y0, x1, y1, cw, chart, (x, y) => K.clamp(0.72 - i * 0.03 - ((x - x0) * (y1 - y0) - (y - y0) * (x1 - x0)) / (cw * 30), 0, 0.99));
    }
    // the rollers at its ends, and lines of (unreadable) survey notes along it
    const [ex, ey] = sp[sp.length - 1];
    const a0 = Math.atan2(sp[1][1] - sp[0][1], sp[1][0] - sp[0][0]) + Math.PI / 2;
    for (const [px, py] of [[hd[0], hd[1]], [ex, ey]]) front.seg(px - Math.cos(a0) * 13, py - Math.sin(a0) * 13, px + Math.cos(a0) * 13, py + Math.sin(a0) * 13, 5, chart, 1);
    front.ell(hd[0], hd[1], 5, 4, paper, 2);
    front.outline();
    front.onto((b) => {
      for (let i = 2; i < sp.length - 1; i++) {
        const [x0, y0] = sp[i];
        const l = 5 + ((i * 7) % 9);
        b.line(Math.round(x0 - Math.cos(a0) * 7), Math.round(y0 - Math.sin(a0) * 7), Math.round(x0 - Math.cos(a0) * 7 + Math.cos(a0) * l), Math.round(y0 - Math.sin(a0) * 7 + Math.sin(a0) * l), grid, 0);
      }
      // held out flat (its plea): the one thin road it left
      if (q.flat) for (let i = 1; i < sp.length - 1; i++) { const [x, y] = sp[i]; b.rect(Math.round(x + Math.cos(a0) * 4), Math.round(y + Math.sin(a0) * 4), 2, 2, route, 0); }
    });
    front.restore();
    // ---- blank sheets folding out over it (Shroud)
    if (q.blank > 0.05) {
      T(fx);
      const n = Math.round(1 + q.blank * 5);
      for (let i = 0; i < n; i++) {
        const x = [-18, 14, -30, 26, 0, -8][i], y = [10, 24, 44, 50, -10, 64][i];
        fx.save().translate(x, y).rotate([-0.3, 0.25, -0.1, 0.4, 0.05, -0.35][i] * (0.6 + q.blank * 0.4));
        fx.stone([[-14, -10], [14, -10], [14, 10], [-14, 10]], blankM, { bevel: 2, face: 2 });
        fx.line(-10, -6, 10, -6, blankM, 3);
        fx.restore();
      }
      fx.restore();
      fx.outline();
    }
    const out = back.over(B).over(front).over(fx);
    if (pale) out.fade(0.85);
    return out;
  }
  const CBs = { lean: 0, flareL: 0, flareR: 0, flut: 0, ht: 0, bow: 0, eyes: 'open', eyeWarm: false, hx: 30, hy: -4, ca: 0, cl: 30, cw: 0, cph: 0, flat: false, bx: -30, by: 4, ba: 0.25, brush: true, erase: 0, blank: 0 };
  const cartIdle = [];
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2;
    // the chart breathes open and shut a little; the panels' hems flutter; one blink
    cartIdle.push({ cl: 30 + [0, 3, 6, 8, 6, 3, 0, -2][f], flut: [0, 1, 2, 1, 0, -1, -1, 0][f], cw: Math.sin(a) * 0.04, cph: a, ht: Math.sin(a) * 0.03, ba: 0.25 + Math.sin(a + 1) * 0.05, eyes: f === 6 ? 'shut' : 'open' });
  }
  const ck = (from, ...st) => CB.keys(Object.assign({}, CBs, from), ...st);
  const cartActs = {
    // Strike: the chart drawn back over its shoulder, then snapped out like a lash at its target
    'prep:strike': ck({}, [{ lean: 0.04, hx: 34, hy: -16, ca: -2.2, cl: 36, cw: 0.15, flareR: 4, eyes: 'narrow' }, 2, E.out], [{ lean: 0.08, hx: 36, hy: -24, ca: -2.7, cl: 44, cw: 0.22, flareR: 8, flareL: -3, ht: 0.06 }, 2, E.io]),
    'exec:strike': ck({ lean: 0.08, hx: 36, hy: -24, ca: -2.7, cl: 44, cw: 0.22, flareR: 8, flareL: -3, ht: 0.06, eyes: 'narrow' }, [{ lean: -0.05, hx: 20, hy: -18, ca: -3.7, cl: 52, cw: -0.1, flareR: 2, flareL: 4, ht: -0.04, flut: 2 }, 1, E.in], [{ lean: -0.1, hx: 6, hy: -10, ca: -4.65, cl: 60, cw: -0.18, cph: 1, flareL: 8, flut: 4, ht: -0.08 }, 1, E.out], [{ lean: -0.09, ca: -4.75, cl: 62, cw: 0.08, cph: 2, flut: 3 }, 1, E.lin]),
    'recover:strike': ck({ lean: -0.09, hx: 6, hy: -10, ca: -4.75, cl: 62, cw: 0.08, flareL: 8, flut: 3, ht: -0.08, eyes: 'narrow' }, [{ lean: -0.03, hx: 20, hy: -6, ca: -5.6, cl: 46, cw: 0.12, cph: 3, flareL: 3, flut: 1 }, 2, E.io], [{ lean: 0, hx: 30, hy: -4, ca: -Math.PI * 2, cl: 30, cw: 0, flareL: 0, flareR: 0, flut: 0, ht: 0, eyes: 'open' }, 2, E.out]),
    // Sweep: the brush raised high, then dragged in one long erasing stroke across
    'prep:sweep': ck({}, [{ bx: -26, by: -30, ba: 2.6, lean: 0.03, flareL: -2, eyes: 'narrow', ht: 0.05 }, 2, E.out], [{ bx: -20, by: -44, ba: 3.0, lean: 0.06, flareL: -4, flareR: 3 }, 2, E.io]),
    'exec:sweep': ck({ bx: -20, by: -44, ba: 3.0, lean: 0.06, flareL: -4, flareR: 3, eyes: 'narrow', ht: 0.05 }, [{ bx: -40, by: -16, ba: 1.9, lean: -0.04, flareL: 6, flut: 3, ht: -0.04 }, 1, E.in], [{ bx: -46, by: 10, ba: 1.2, lean: -0.08, flareL: 10, flut: 4, erase: 0.4, ht: -0.08 }, 1, E.lin], [{ bx: -40, by: 22, ba: 0.8, lean: -0.07, flareL: 8, erase: 0.6 }, 1, E.out]),
    'recover:sweep': ck({ bx: -40, by: 22, ba: 0.8, lean: -0.07, flareL: 8, flut: 4, erase: 0.6, eyes: 'narrow', ht: -0.08 }, [{ bx: -34, by: 10, ba: 0.5, lean: -0.02, flareL: 3, flut: 1, erase: 0.3 }, 2, E.io], [{ bx: -30, by: 4, ba: 0.25, lean: 0, flareL: 0, flareR: 0, flut: 0, erase: 0, ht: 0, eyes: 'open' }, 2, E.out]),
    // Shroud: blank sheets fold out of its cloak over it
    'cast:shroud': ck({}, [{ blank: 0.3, flareL: 4, flareR: 4, eyes: 'narrow', erase: 0.3 }, 2, E.out], [{ blank: 0.7, flareL: 7, flareR: 7, flut: 2, erase: 0.6, ht: 0.06 }, 2, E.io], [{ blank: 1, flareL: 5, flareR: 5, erase: 0.8, eyes: 'shut' }, 2, E.io]),
    'recover:shroud': ck({ blank: 1, flareL: 5, flareR: 5, erase: 0.8, eyes: 'shut', ht: 0.06 }, [{ blank: 0.5, flareL: 2, flareR: 2, erase: 0.4, eyes: 'narrow' }, 2, E.io], [{ blank: 0, flareL: 0, flareR: 0, erase: 0, ht: 0, eyes: 'open' }, 2, E.out]),
    // Plea: it bows and holds the chart out flat, unrolled — one thin road left on it
    'cast:plea': ck({}, [{ bow: 1, ht: 0.12, eyes: 'soft', hx: 16, hy: 0, ca: 0.8, cl: 40, lean: -0.03, eyeWarm: true }, 2, E.out], [{ bow: 2, ht: 0.16, hx: 4, hy: 2, ca: 1.45, cl: 58, flat: true, lean: -0.06 }, 2, E.io], [{ cl: 62 }, 2, E.lin]),
    'recover:plea': ck({ bow: 2, ht: 0.16, eyes: 'soft', hx: 4, hy: 2, ca: 1.45, cl: 62, flat: true, lean: -0.06, eyeWarm: true }, [{ bow: 1, ht: 0.06, hx: 18, hy: -2, ca: 0.6, cl: 44, flat: false, lean: -0.02 }, 2, E.io], [{ bow: 0, ht: 0, hx: 30, hy: -4, ca: 0, cl: 30, lean: 0, eyes: 'open', eyeWarm: false }, 2, E.out]),
    // reactions
    recoil: ck({}, [{ lean: 0.12, flareL: -4, flareR: 8, flut: -3, ht: 0.14, eyes: 'shut', cw: 0.2 }, 1, E.out], [{ lean: -0.03, flareL: 2, flareR: 2, flut: 2, ht: -0.03, eyes: 'narrow', cw: -0.1 }, 1, E.io], [{ lean: 0.02, flareR: 1, flut: 0, ht: 0.02, cw: 0.04 }, 1, E.io], [{ lean: 0, flareL: 0, flareR: 0, ht: 0, eyes: 'open', cw: 0 }, 1, E.out]),
    release: ck({}, [{ eyes: 'shut', cl: 40, flut: 2 }, 1, E.out], [{ cl: 48, flut: 3, cw: 0.1, eyeWarm: true }, 1, E.io], [{ cl: 40, flut: 1, cw: 0.04, eyes: 'soft' }, 1, E.io], [{ cl: 30, flut: 0, cw: 0, eyes: 'open', eyeWarm: false }, 1, E.out]),
    balk: ck({ lean: 0.08, hx: 36, hy: -24, ca: -2.7, cl: 44, cw: 0.22, flareR: 8, eyes: 'narrow' }, [{ lean: 0.02, ca: -1.4, cl: 30, cw: -0.3, hx: 28, hy: -12, flareR: 3, eyes: 'open' }, 1, E.out], [{ ca: -0.6, cl: 26, cw: 0.2, hx: 30, hy: -6 }, 1, E.io], [{ lean: 0, ca: -0.1, cl: 28, cw: 0, flareR: 0, hy: -4 }, 1, E.io], [{ ca: 0, cl: 30 }, 1, E.out]),
    settle: ck({}, [{ bow: 1, eyes: 'soft', ba: 0.6, by: 14, eyeWarm: true }, 1, E.out], [{ bow: 2, ht: 0.1, ba: 1.2, bx: -36, by: 28, cl: 50, ca: 0.4 }, 1, E.io], [{ bow: 2.5, ht: 0.14, ba: 1.5, bx: -38, by: 40, brush: false, cl: 58, ca: 0.7, eyes: 'shut' }, 1, E.io], [{ bow: 3, ht: 0.16, cl: 60, ca: 0.8 }, 1, E.out]),
    rest: ck({}, [{ bow: 1, ht: 0.06, cl: 24, eyes: 'narrow', ba: 0.4 }, 1, E.io], [{ bow: 1.5, ht: 0.08, cl: 20, eyes: 'shut', ba: 0.5 }, 1, E.io], [{ bow: 1.5, ht: 0.08, cl: 20, eyes: 'shut', ba: 0.5, flut: 1 }, 1, E.io], [{ bow: 1, ht: 0.05, cl: 24, eyes: 'narrow', ba: 0.4, flut: 0 }, 1, E.io]),
  };
  CB.rig('atlas_cartographer', {
    w: 220, h: 236, ox: 110, oy: 128, ms: 160,
    bob: (t) => Math.sin(t / 520) * 2,
    base: CBs, idle: cartIdle, acts: cartActs,
    keys: { strike: ['exec:strike', 1], sweep: ['exec:sweep', 1], shroud: ['cast:shroud', 5], plea: ['cast:plea', 5] },
    alias: { prep: 'prep:strike' },
    draw: drawCart,
  });
  CB.deliver('atlas_cartographer', ['strike'], (a) => {
    const blk = CB.blocked(a), q = cartActs['exec:strike'][1], sp = chartSpine(q), tip = cartPt(q, sp[sp.length - 1][0], sp[sp.length - 1][1]);
    return CB.play(a, {
      key: 'key:strike', contact: 660, end: 1320,
      parts: [{ at: 0, act: 'prep:strike', d: 380 }, { at: 380, act: 'exec:strike', d: 300, travel: { to: a.aimed, peak: blk ? 0.08 : 0.12, arc: 0, shape: 'out' } }, blk ? { at: 680, act: 'balk', d: 280, travel: { to: a.aimed, peak: 0.08, shape: 'back' } } : null, { at: blk ? 960 : 680, act: 'recover:strike', d: blk ? 360 : 640, travel: blk ? null : { to: a.aimed, peak: 0.12, shape: 'back' } }].filter(Boolean),
      fx: [{ at: 470, name: 'cbChartLash', d: 560, p: { dx: tip[0], dy: tip[1], to: a.aimed, short: blk } }],
    });
  });
  CB.deliver('atlas_cartographer', ['sweep'], (a) => {
    const q = cartActs['exec:sweep'][1], b = cartPt(q, q.bx - Math.sin(q.ba) * 34, q.by + Math.cos(q.ba) * 34);
    return CB.play(a, {
      key: 'key:sweep', contact: 760, end: 1480,
      parts: [{ at: 0, act: 'prep:sweep', d: 420 }, { at: 420, act: 'exec:sweep', d: 380, travel: { to: 'party', peak: 0.1, arc: 0, shape: 'outback' } }, { at: 800, act: 'recover:sweep', d: 680 }],
      fx: [{ at: 520, name: 'cbErase', d: 860, p: { dx: b[0], dy: b[1], who: CB.targets(a) } }],
    });
  });
  CB.deliver('atlas_cartographer', ['shroud'], (a) => CB.play(a, {
    key: 'key:shroud', contact: 800, end: 1420,
    parts: [{ at: 0, act: 'cast:shroud', d: 860 }, { at: 860, act: 'recover:shroud', d: 560 }],
    fx: [{ at: 360, name: 'cbPageFog', d: 900, p: { dy: 20 } }],
  }));
  CB.deliver('atlas_cartographer', ['plea'], (a) => CB.play(a, {
    key: 'key:plea', contact: 800, end: 1500,
    parts: [{ at: 0, act: 'cast:plea', d: 860 }, { at: 860, act: 'recover:plea', d: 640 }],
    fx: [{ at: 460, name: 'cbNote', d: 900, p: { dx: -40, dy: 2, to: 'party' } }],
  }));
  CB.deliver('atlas_cartographer', ['*'], (a) => CB.play(a, {
    key: 'key:plea', contact: 700, end: 1300,
    parts: [{ at: 0, act: 'cast:plea', d: 760 }, { at: 760, act: 'recover:plea', d: 540 }],
  }));

  CB.family('atlas_cartographer', { anatomy: 'paper / cloth boss: flat creased facets that lean from the hem, panels that swing out and settle, a hood that bows, a chart that bends along its length from the right hand, a brush in the left', palette: 'paper #e8dcc0 (6 steps; pale #f0e8d4 with o.pale), grid #b4a684, route #8a5a3a, hood #2a2a3a, eyes #9ec4f0, chart #f8f2e2, brush wood #6a4a3a and ink #2a2030, blank sheets #fbf8f0' });
})();
