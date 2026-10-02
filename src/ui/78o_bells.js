/* Creatures B — bells: the Bell Wraith (lf.wraith), the Borrowed Bell (atlas.bell, an Atlas
 * guardian) and the Drowned Bell's Keeper (lf.keeper, the Chapter 5 guardian).
 *
 * Bell (family 'bell'): a cast bell hanging from its loop. Anatomy: one hinge at the loop
 * (the whole body swings as a pendulum, its lip leading), a clapper hung inside on its own
 * hinge that lags the swing and strikes the lip, ghost strands that trail the swing, metal
 * that rings when struck (a bright lip and a shiver), hollow eyes under the upper band.
 * Its Strike rams the lip into the one target; its Sweep is a full swing whose toll rolls
 * across the party; Gathering holds it drawn back at the top of its arc with its bands lit;
 * the Hush wraps its strands round its own mouth; the Borrowed Bell's false promise rings out
 * a name tag that is not its own. Recovery is a damped swing (mechanical settling).
 *
 * Keeper (family 'lf_keeper'): bell-bronze on four pipe tendrils, a gate wheel on its crown and
 * a brass sluice plate for a face. Anatomy: the body rides on its tendrils (crouch, rear, plant),
 * the wheel turns, the plate slides up on its grooves to open a sluice mouth, the clapper hangs
 * below on a chain, water drips from its lip. Its Strike is one tendril lashed at its target;
 * its Flood (signature) spins the wheel, lifts the plate and lets the water out across both of
 * you; its Hush winds the plate shut; its false "yes" bows while a tendril winds the bell rope
 * away; its plea lowers it on curled tendrils; Gathering winds the wheel tight while the seams
 * glow with the pressure inside. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E, S = CB.S;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const PIV = -66; // the bell's hinge (the top of its loop), art px above the origin

  // ======================================================================================
  // BELL
  // ======================================================================================
  const hwBell = (y) => (y < -42 ? 30 * Math.sqrt(Math.max(0, 1 - ((y + 42) / 18) ** 2)) : y < 22 ? 30 + (y + 42) * 0.03 : 32 + (y - 22) * 0.75);
  // a point of the bell (local, unswung) after the swing about the hinge, plus lift and shake
  function bellPt(q, x, y) {
    const a = q.sw, c = Math.cos(a), s = Math.sin(a), dy = y - PIV;
    return [Math.round(x * c - dy * s + (q.shake || 0)), Math.round(PIV + x * s + dy * c + (q.lift || 0))];
  }
  function drawBell(L, o, q, H) {
    const col = o.col || '#8a7a4a';
    const [hh] = K.rgb2hsl(...K.parse(col));
    const patinaAmt = q.patina != null ? q.patina : hh > 70 && hh < 200 ? 1 : 0.45; // bronze gone green carries more verdigris
    const dim = q.dark || 0;
    // cast metal: a 7-tone ramp from the bell's colour (deep violet-navy shadow → warm specular)
    const MC = S.ramp(col, { n: 7, at: 3, lo: 0.09, hi: 0.92, cs: 34, ws: 26 });
    const M = S.mat(MC, { at: 3, rim: '#9ccaf4', litk: 0.14 });
    const ringM = K.solid(mixh(col, '#fffaf0', 0.88), { line: false });
    const cav = S.mat(['#06040e', '#120e1e', '#221c32'], { at: 0, line: false });
    const patina = S.mat(['#1a5458', '#2c8478', '#4cb092', '#96dcbc'], { at: 1, line: false });
    const WR = S.ramp(mixh('#d898b0', col, 0.2), { n: 4, at: 2, lo: 0.3, hi: 0.86, cs: 30 });
    const wisp = S.mat(WR, { at: 2, alpha: 185, line: S.deep(WR[0], 0.2) });
    const wisp2 = S.mat(WR, { at: 2, alpha: 110, line: false });
    const eyeM = S.mat(['#a87a9a', '#f0d0dc', '#fffaff'], { at: 1, line: false });
    const glowM = S.mat(['#e8a040', '#ffd88a', '#fff6d0'], { at: 1, line: false });
    const strands = L.like(), B = L.like(), clap = L.like(), fx = L.like(), aura = L.like();
    const sw = q.sw, lift = q.lift || 0, sh = q.shake || 0;
    // ---- glow behind (gathering / a toll)
    if (q.glow > 0.05) H.glow(aura, ...bellPt(q, 0, -8), 48 + q.glow * 10, 58 + q.glow * 10, '#ffd88a', 0.22 * q.glow, 3);
    // ---- ghost strands from under the lip: they trail the swing (lean) and curl
    const mute = q.mute || 0;
    for (let i = 0; i < 3; i++) {
      const lx = -18 + i * 18;
      const [sx, sy] = bellPt(q, lx * (1 - mute * 0.5), 38);
      const len = (q.slen || 46) - (i % 2) * 8 - mute * 22;
      H.tail(strands, sx, sy, Math.max(10, len), 5, (q.sph || 0) + i * 1.7, [[0, 22, wisp], [22, 90, wisp2]], { amp: (q.samp == null ? 6 : q.samp) * (1 - mute * 0.7), curl: 8, dark: 0.1, lean: (q.slean || 0) + (i - 1) * 0.04 * (q.spread || 0) });
    }
    // ---- the clapper (behind the lip, seen below it), on its own hinge inside the bell
    {
      const ca = sw + (q.cl || 0), Lr = 46;
      const hx = bellPt(q, 0, -8);
      const tip = [Math.round(hx[0] - Lr * Math.sin(ca)), Math.round(hx[1] + Lr * Math.cos(ca))];
      clap.path([[hx[0], hx[1]], [tip[0], tip[1] - 4]], 3, M, () => S.step(2, 7));
      clap.ell(tip[0], tip[1], 5, 5, M, S.sph(tip[0] - 1, tip[1] - 1, 5, 5, 7, { bias: 0.1 }));
      clap.dot(tip[0] - 2, tip[1] - 3, M, 6);
    }
    // ---- the bell itself (swung about its hinge), seen a little from below and turned toward the
    // party: its features wrap the barrel (centred at BROT), its bands bow upward toward us
    B.save().translate(sh, lift).translate(0, PIV).rotate(sw).translate(0, -PIV);
    const BROT = -0.34;
    const th = (x, y) => Math.asin(Math.max(-1, Math.min(1, x / Math.max(1, hwBell(y)))));
    const wrapX = (a, y) => Math.round(hwBell(y) * Math.sin(a));
    const bowY = (a, y) => Math.round(y - 3 * Math.cos(a));
    // the loop: a heavy cast ring with a collar
    S.pipe(B, [[-9, -56], [-11, -64], [-5, -71], [5, -71], [11, -64], [9, -56]], 6, M, { collars: false });
    B.rect(-13, -60, 26, 5, M, (x) => S.step(x < -9 ? 5 : x < 0 ? 4 : x < 8 ? 2 : 1, 7));
    // body: dome shoulder, straight waist, flared lip, in hard metal bands — a lit plane with the
    // near-white specular streak, mid planes, a dark reflected band, the cool rim
    const ycut = 36;
    const bodySh = (x, y) => {
      const u = x / (hwBell(y) || 1);
      let k = u < -0.93 ? 4 : u < -0.8 ? 6 : u < -0.64 ? 5 : u < -0.26 ? 4 : u < 0.22 ? 3 : u < 0.58 ? 2 : u < 0.84 ? 1 : 2;
      if (y < -46 && k < 6) k++;                    // the shoulder faces the sky
      if (y > 24 && k > 1) k--;                     // the flare turns down
      k -= Math.round(dim * 3);
      return S.step(k, 7);
    };
    B.fill(-48, -62, 48, ycut, (x, y) => y >= -60 && y < ycut && Math.abs(x) <= hwBell(y), M, bodySh);
    // the lip band: a heavier rolled edge, bowed toward us
    B.fill(-48, 18, 48, ycut, (x, y) => { const a = th(x, y); return y >= bowY(a, 27) && y < ycut && Math.abs(x) <= hwBell(y); }, M, (x, y) => { const u = x / hwBell(y), a = th(x, y); return S.step(y < bowY(a, 27) + 2 ? (u < -0.5 ? 6 : u < 0.4 ? 5 : 3) : u < -0.7 ? 4 : u < 0.1 ? 3 : u < 0.6 ? 1 : 0, 7); });
    // raised bands: a lit top edge, the band, a shadowed underside — bowing as they wrap
    for (const yb of [-34, 14]) for (let x = -Math.floor(hwBell(yb)) + 1; x < hwBell(yb) - 1; x++) {
      const a = th(x, yb), y = bowY(a, yb), u = x / hwBell(yb);
      B.dot(x, y - 1, M, u < -0.4 ? 6 : u < 0.4 ? 5 : 3); B.dot(x, y, M, u < 0.2 ? 4 : 2); B.dot(x, y + 1, M, 1);
    }
    // the vertical rib between the panels
    for (let y = -33; y < 13; y++) { const x = wrapX(BROT + 0.02, y); B.dot(x, y, M, 1); B.dot(x - 1, y, M, 5); }
    // bosses in the upper field (nipples cast in rows), wrapped round the shoulder: a lit cap, a
    // shadow below; the far ones foreshortened
    for (let r = 0; r < 3; r++) for (let k = -4; k <= 4; k++) {
      const a = BROT + k * 0.26;
      if (Math.abs(a) > 1.25 || Math.abs(k) === 0) continue;
      const cy = -53 + r * 6, cx = wrapX(a, cy), w = Math.cos(a) > 0.6 ? 3 : 2;
      B.rect(cx, cy, w, 3, M, a < -0.3 ? 5 : 4); B.dot(cx, cy, M, 6); B.rect(cx + 1, cy + 3, w, 1, M, 1);
    }
    // the inscription panels: worn cast strokes (not glyphs), lit on their upper edge, wrapping
    for (const [a0, s] of [[BROT - 0.62, 1], [BROT + 0.22, 2]]) for (let r = 0; r < 4; r++) {
      const y = -28 + r * 9, l = 5 + (K.hh(s, r, 3) % 7);
      const x0 = wrapX(a0 + (r % 2) * 0.06, y), x1 = Math.min(wrapX(a0 + 0.5, y), x0 + l);
      B.line(x0, y, x1, y, M, 1); B.line(x0, y - 1, x1, y - 1, M, a0 < BROT ? 6 : 5);
    }
    // the striking seat (a lotus boss) on the near side
    { const sx = wrapX(BROT - 0.5, 22); B.ell(sx, 22, 5, 4, M, 2); B.ell(sx, 22, 3, 2, M, 5); B.dot(sx - 1, 21, M, 6); }
    // verdigris where rain ran down from the bosses and in the bands: clustered patches and streaks
    const pt = [[-28, -36, 6], [-14, -33, 4], [18, -35, 7], [26, 12, 6], [-30, 16, 5], [8, 30, 6], [-6, 15, 4], [22, -12, 4]];
    for (let i = 0; i < pt.length; i++) if (K.hh(i, 4, 9) % 100 < 45 + patinaAmt * 55) {
      const [x, y, s] = pt[i];
      K.cluster(B, x, y, s, patina, 1, K.hh(x + 40, y + 40, 3));
      K.cluster(B, x - 1, y - 1, Math.max(2, s - 3), patina, 2, K.hh(x + 41, y + 4, 3));
      if (patinaAmt > 0.7) S.tuft(B, x + 1, y + 2, Math.PI / 2, 5 + (i % 3) * 3, 2, patina, 0, 0);
    }
    // eyes under the upper band: hollow sockets, the far one narrowed by the curve
    const eyes = q.eyes || 'hollow';
    for (const [a, wv] of [[BROT - 0.4, 0.8], [BROT + 0.32, 1]]) {
      const ey = -24, ex = wrapX(a, ey), rx = Math.max(3, Math.round(5 * wv * Math.cos(a)));
      if (eyes === 'shut') { B.line(ex - rx, ey, ex + rx, ey + 1, cav, 0); B.line(ex - rx + 1, ey + 1, ex + rx - 1, ey + 1, M, 5); }
      else if (eyes === 'half') { B.ell(ex, ey + 1, rx, 2, cav, 0); B.rect(ex - 2, ey + 1, 3, 1, eyeM, 1); }
      else if (eyes === 'false') { B.line(ex - rx, ey + 1, ex, ey - 2, cav, 0); B.line(ex, ey - 2, ex + rx, ey + 1, cav, 0); B.line(ex - rx + 1, ey + 1, ex, ey - 1, eyeM, 2); }
      else if (eyes === 'wide') { B.ell(ex, ey, rx + 1, 4, cav, 0); B.rect(ex - 1, ey - 1, 2, 2, eyeM, 2); B.dot(ex + 1, ey + 1, eyeM, 0); }
      else if (eyes === 'glow') { B.ell(ex, ey, rx, 3, cav, 0); B.rect(ex - rx + 2, ey - 1, rx * 2 - 3, 2, glowM, 2); B.rect(ex - 1, ey - 1, 2, 1, ringM, 0); }
      else { B.ell(ex, ey, rx, 3, cav, 0); B.rect(ex - 2, ey, 3, 1, eyeM, 1); B.dot(ex - 2, ey, eyeM, 2); }
      B.line(ex - rx, ey - 4, ex + rx, ey - 4, M, a < BROT ? 6 : 5); // the lit brow over each
    }
    // the band glow while gathering
    if (q.glow > 0.05) for (const yb of [-34, 14]) for (let x = -Math.floor(hwBell(yb)) + 3; x < hwBell(yb) - 3; x++) B.dot(x, bowY(th(x, yb), yb), glowM, q.glow > 0.5 ? 2 : 1);
    // the mouth seen from below: the dark inside, lit along its far inner rim; more shows as it tips
    const ry = 4 + Math.min(7, Math.abs(sw) * 14);
    B.ell(0, ycut - 1, hwBell(ycut - 1) - 3, ry, cav, (x, y) => S.step(y < ycut - 1 - ry * 0.5 ? 2 : y < ycut ? 1 : 0, 3));
    for (let x = -Math.floor(hwBell(ycut - 1)) + 5; x < hwBell(ycut - 1) - 5; x++) B.dot(x, Math.round(ycut - 1 - ry * Math.sqrt(Math.max(0, 1 - (x / (hwBell(ycut - 1) - 3)) ** 2))), M, x < 0 ? 3 : 2);
    // the Hush: strands bound round its own mouth
    if (mute > 0.05) {
      const th2 = mute > 0.6 ? 3 : 2;
      for (let k = 0; k < 3; k++) {
        const y = 22 + k * 5;
        if (k / 3 > mute + 0.1) break;
        B.fill(-48, y - th2 - 2, 48, y + th2 + 2, (x, yy) => Math.abs(x) <= hwBell(yy) + 1 && Math.abs(yy - y + 2 * Math.cos(th(x, yy)) - Math.sin(x / 7 + k) * 1.2) < th2 / 2 + 0.2, wisp, (x) => S.step(x < -10 ? 3 : x < 15 ? 2 : 1, 4));
      }
    }
    B.restore();
    // ---- outlines, the toll, compositing, rim
    strands.outline(); B.outline(); clap.outline();
    S.cast(B, strands, 2, 3, 1);
    // the clapper shows inside the dark mouth and below the lip, never through the metal
    for (let i = 0; i < clap.px.length; i++) if (clap.px[i] >>> 24 && (!(B.px[i] >>> 24) || B.mt[i] === cav.id)) { B.px[i] = clap.px[i]; B.mt[i] = clap.mt[i]; }
    // the toll: the struck lip flashes along its leading edge and the air round the mouth shivers
    // (rings in the plane of the mouth, swung with the bell)
    if (q.ring > 0.05) {
      fx.save().translate(sh, lift).translate(0, PIV).rotate(sw).translate(0, -PIV);
      const my = ycut - 1, w0 = hwBell(my) - 3;
      for (let k = 0; k < 2; k++) {
        const r = w0 + 6 + k * 9 + q.ring * 5;
        fx.fill(-r - 2, my - 16, r + 2, my + 16, (x, y) => { const d = Math.hypot(x / r, (y - my) / (r * 0.28)); return d <= 1 && d >= 1 - 0.07 - k * 0.02 && (k === 0 || y > my); }, ringM, 0);
      }
      for (let x = -w0; x <= w0; x++) fx.dot(x, Math.round(my + ry * Math.sqrt(Math.max(0, 1 - (x / w0) ** 2))), ringM, 0);
      fx.restore();
      fx.fade(Math.min(1, q.ring));
    }
    const out = aura.over(strands).over(B);
    S.rim(out, { w: 2 });
    return out.over(fx);
  }

  // ---- bell poses --------------------------------------------------------------------------------
  const BB = { sw: 0, cl: 0, ring: 0, glow: 0, lift: 0, shake: 0, mute: 0, dark: 0, eyes: 'hollow', sph: 0, samp: 6, slean: 0, slen: 46, spread: 0 };
  // idle: a slow pendulum (1.5 s), the clapper lagging it, strands trailing, one blink
  const bellIdle = [];
  for (let f = 0; f < 10; f++) {
    const a = (f / 10) * Math.PI * 2;
    bellIdle.push({ sw: 0.07 * Math.sin(a), cl: -0.05 * Math.sin(a - 0.9), slean: -0.12 * Math.cos(a) * 0.6, sph: a * 0.8, eyes: f === 6 ? 'half' : f === 7 ? 'shut' : 'hollow' });
  }
  const bk = (from, ...st) => CB.keys(Object.assign({}, BB, from), ...st);
  const bellActs = {
    // Strike: drawn back (the lip away), then a ram: the lip leads into the target, the
    // clapper strikes at contact, and a damped swing home
    'prep:strike': bk({}, [{ sw: -0.18, cl: 0.1, lift: -3, slean: 0.25, eyes: 'wide' }, 2, E.out], [{ sw: -0.3, cl: 0.22, lift: -5, slean: 0.35, sph: 1.2 }, 2, E.io]),
    'exec:strike': bk({ sw: -0.3, cl: 0.22, lift: -5, slean: 0.35, eyes: 'wide' }, [{ sw: 0.1, cl: 0.0, lift: -2, slean: -0.1, sph: 2 }, 1, E.in], [{ sw: 0.42, cl: -0.3, lift: 0, slean: -0.35, sph: 2.6, eyes: 'glow' }, 1, E.out], [{ sw: 0.48, cl: 0.5, ring: 1, shake: -1, sph: 3 }, 1, E.lin], [{ sw: 0.4, cl: 0.25, ring: 0.7, shake: 1, sph: 3.4 }, 1, E.lin]),
    'recover:strike': (() => { const out = []; for (let i = 1; i <= 6; i++) { const k = (i - 1) / 6; out.push(Object.assign({}, BB, { sw: CB.damp(0.4, k, 3), cl: -CB.damp(0.3, Math.max(0, k - 0.08), 3), ring: Math.max(0, 0.6 - k * 1.2), shake: i < 3 ? (i % 2 ? -1 : 1) : 0, sph: 3.4 + k * 2, slean: -CB.damp(0.3, k, 3), eyes: k > 0.7 ? 'hollow' : 'glow' })); } return out; })(),
    // Sweep: a long draw back to the top of the arc, a full swing through, the toll at the
    // bottom of the arc, the clapper striking twice; then the swing dies away
    'prep:sweep': bk({}, [{ sw: -0.2, cl: 0.12, slean: 0.25, eyes: 'wide' }, 2, E.out], [{ sw: -0.52, cl: 0.32, lift: -4, slean: 0.5, sph: 1.4 }, 2, E.io]),
    'exec:sweep': bk({ sw: -0.52, cl: 0.32, lift: -4, slean: 0.5, eyes: 'wide' }, [{ sw: -0.1, cl: 0.2, lift: -1, slean: 0.1, sph: 2 }, 1, E.in], [{ sw: 0.3, cl: -0.4, ring: 1, lift: 0, slean: -0.4, sph: 2.8, eyes: 'glow', spread: 1 }, 1, E.lin], [{ sw: 0.56, cl: 0.5, ring: 0.9, shake: -1, slean: -0.6, sph: 3.4 }, 1, E.out], [{ sw: 0.5, cl: -0.2, ring: 0.8, shake: 1, sph: 4 }, 1, E.lin]),
    'recover:sweep': (() => { const out = []; for (let i = 1; i <= 7; i++) { const k = (i - 1) / 7; out.push(Object.assign({}, BB, { sw: CB.damp(0.5, k, 3), cl: -CB.damp(0.35, Math.max(0, k - 0.1), 4), ring: Math.max(0, 0.5 - k), shake: i < 3 ? (i % 2 ? 1 : -1) : 0, sph: 4 + k * 2, slean: -CB.damp(0.4, k, 3), spread: 1 - k, eyes: k > 0.6 ? 'hollow' : 'glow' })); } return out; })(),
    // Gathering: hauled back to the top of its arc and HELD there, strands coiled, its bands
    // lighting band by band; it eases a little forward as the force settles in
    'cast:charge': bk({}, [{ sw: -0.25, cl: 0.15, slean: 0.3, samp: 4, eyes: 'wide' }, 2, E.out], [{ sw: -0.46, cl: 0.25, lift: -6, slen: 34, samp: 2, slean: 0.45, glow: 0.5, eyes: 'glow', sph: 1.5 }, 2, E.io], [{ sw: -0.44, glow: 1, sph: 2.2 }, 2, E.lin], [{ sw: -0.34, cl: 0.12, lift: -4, glow: 0.8, sph: 2.8 }, 2, E.io]),
    'recover:charge': bk({ sw: -0.34, cl: 0.12, lift: -4, slen: 34, samp: 2, slean: 0.45, glow: 0.8, eyes: 'glow' }, [{ sw: -0.12, cl: 0.08, lift: -1, slen: 42, samp: 4, slean: 0.15, glow: 0.5 }, 2, E.io], [{ sw: 0, cl: 0, lift: 0, slen: 46, samp: 6, slean: 0, glow: 0.25, eyes: 'hollow' }, 2, E.out]),
    // the Hush: the clapper is drawn up still, the strands rise and bind its own mouth, the
    // eyes shut; a dull, choked note (no ring)
    'cast:silence': bk({}, [{ sw: 0.05, cl: 0, slean: -0.1, eyes: 'half', samp: 3 }, 2, E.out], [{ mute: 0.5, slen: 30, samp: 2, eyes: 'shut', dark: 0.2 }, 2, E.io], [{ mute: 1, sw: -0.04, lift: 2, dark: 0.35 }, 2, E.io], [{ mute: 1, sw: 0.02, lift: 1, shake: 1 }, 1, E.lin], [{ mute: 1, sw: 0, shake: 0 }, 1, E.lin]),
    'recover:silence': bk({ mute: 1, slen: 30, samp: 2, eyes: 'shut', dark: 0.35, lift: 1 }, [{ mute: 0.5, slen: 38, samp: 4, dark: 0.2, eyes: 'half', lift: 0 }, 2, E.io], [{ mute: 0, slen: 46, samp: 6, dark: 0, eyes: 'hollow' }, 2, E.out]),
    // a false promise (the Borrowed Bell): a sly sideways tilt, the eyes curving into a smile,
    // a light ring that rings out a name tag which is not its own, then the smile drops
    'prep:lie': bk({}, [{ sw: -0.12, cl: 0.05, eyes: 'false', lift: -2, slean: 0.15 }, 2, E.out], [{ sw: -0.2, cl: 0.12, eyes: 'false', lift: -3, sph: 1 }, 2, E.io]),
    'exec:lie': bk({ sw: -0.2, cl: 0.12, eyes: 'false', lift: -3, slean: 0.15 }, [{ sw: 0.18, cl: -0.2, eyes: 'false', ring: 0.6, sph: 2 }, 2, E.io], [{ sw: 0.22, cl: 0.25, ring: 0.9, sph: 2.6 }, 1, E.lin], [{ sw: 0.16, cl: 0.0, ring: 0.5, eyes: 'hollow', sph: 3 }, 2, E.io]),
    'recover:lie': bk({ sw: 0.16, ring: 0.5, sph: 3 }, [{ sw: -0.06, cl: 0.05, ring: 0, sph: 4 }, 2, E.io], [{ sw: 0, cl: 0, eyes: 'hollow' }, 2, E.out]),
    // reactions to real outcomes (from the sequencer): knocked, a knot loosening, balked, settled, waiting
    recoil: bk({}, [{ sw: -0.26, cl: 0.25, ring: 0.6, shake: 1, eyes: 'shut', slean: 0.3 }, 1, E.out], [{ sw: 0.12, cl: -0.15, ring: 0.3, shake: -1, eyes: 'half' }, 1, E.io], [{ sw: -0.05, cl: 0.06, ring: 0, shake: 0 }, 1, E.io], [{ sw: 0, cl: 0, eyes: 'hollow', slean: 0 }, 1, E.out]),
    release: bk({}, [{ eyes: 'shut', glow: 0.35, slen: 54, samp: 9, ring: 0.3 }, 1, E.out], [{ glow: 0.5, slen: 58, samp: 10, ring: 0.15, sph: 1.2 }, 1, E.io], [{ glow: 0.2, slen: 52, samp: 8, ring: 0, eyes: 'half', sph: 2.2 }, 1, E.io], [{ glow: 0, slen: 46, samp: 6, eyes: 'hollow', sph: 3 }, 1, E.out]),
    balk: bk({ sw: -0.3, cl: 0.2, eyes: 'wide' }, [{ sw: -0.1, cl: -0.4, shake: 1, eyes: 'wide' }, 1, E.out], [{ sw: -0.22, cl: 0.4, shake: -1 }, 1, E.io], [{ sw: -0.08, cl: -0.15, shake: 0, eyes: 'half' }, 1, E.io], [{ sw: 0, cl: 0, eyes: 'hollow' }, 1, E.out]),
    settle: bk({}, [{ sw: 0.05, cl: -0.05, eyes: 'half', glow: 0.3, ring: 0.3 }, 1, E.out], [{ sw: 0, cl: 0, eyes: 'shut', glow: 0.5, ring: 0.1, slen: 56, samp: 3 }, 1, E.io], [{ glow: 0.25, ring: 0, slen: 60, samp: 2, dark: 0.1 }, 1, E.io], [{ glow: 0, slen: 62, samp: 1, dark: 0.15 }, 1, E.out]),
    rest: bk({}, [{ sw: 0.03, cl: -0.02, eyes: 'half', dark: 0.12, slen: 50, samp: 3 }, 1, E.io], [{ sw: 0.0, eyes: 'shut', dark: 0.18, lift: 2, samp: 2 }, 1, E.io], [{ sw: -0.02, eyes: 'shut', dark: 0.18, lift: 2 }, 1, E.io], [{ sw: 0, eyes: 'half', dark: 0.1, lift: 1 }, 1, E.io]),
  };
  CB.rig('bell', {
    w: 212, h: 232, ox: 106, oy: 92, ms: 150,
    base: BB, idle: bellIdle, acts: bellActs,
    keys: { strike: ['exec:strike', 3], sweep: ['exec:sweep', 2], charge: ['cast:charge', 5], silence: ['cast:silence', 4], lie: ['exec:lie', 2] },
    alias: { prep: 'prep:strike' },
    draw: drawBell,
  });

  // ---- bell deliveries ---------------------------------------------------------------------------
  // Normal-speed timings (presentation ms from the move's start); see docs/battle/creatures_b.md.
  const P = (q, x, y) => bellPt(q, x, y);
  const mouthAt = (act, i) => { const q = bellActs[act][i]; return P(q, 0, 38); };
  CB.deliver('bell', ['strike'], (a) => {
    const blk = CB.blocked(a), peak = blk ? 0.34 : 0.48;
    const m = mouthAt('exec:strike', 3);
    return CB.play(a, {
      key: 'key:strike', contact: 640, end: 1300,
      parts: [
        { at: 0, act: 'prep:strike', d: 300 },
        { at: 300, act: 'exec:strike', d: 400, travel: { to: a.aimed, peak, arc: 10, shape: 'out' } },
        blk ? { at: 700, act: 'balk', d: 260, travel: { to: a.aimed, peak, shape: 'back' } } : null,
        { at: blk ? 960 : 700, act: 'recover:strike', d: blk ? 340 : 600, travel: blk ? null : { to: a.aimed, peak, shape: 'back' } },
      ].filter(Boolean),
      fx: [{ at: 620, name: 'cbToll', d: 520, p: { mode: blk ? 'dull' : 'strike', dx: m[0], dy: m[1], to: a.aimed, col: CB.colOf(a, '#8a7a4a'), local: true } }],
    });
  });
  CB.deliver('bell', ['sweep'], (a) => {
    const m = mouthAt('exec:sweep', 1);
    return CB.play(a, {
      key: 'key:sweep', contact: 760, end: 1560,
      parts: [
        { at: 0, act: 'prep:sweep', d: 380 },
        { at: 380, act: 'exec:sweep', d: 420, travel: { to: 'party', peak: 0.14, arc: 0, shape: 'outback' } },
        { at: 800, act: 'recover:sweep', d: 760 },
      ],
      fx: [{ at: 560, name: 'cbToll', d: 900, p: { mode: 'sweep', dx: m[0], dy: m[1], who: CB.targets(a), col: CB.colOf(a, '#8a7a4a') } }],
    });
  });
  CB.deliver('bell', ['charge'], (a) => CB.play(a, {
    key: 'key:charge', contact: 820, end: 1360,
    parts: [{ at: 0, act: 'cast:charge', d: 900 }, { at: 900, act: 'recover:charge', d: 460 }],
    fx: [{ at: 260, name: 'cbGather', d: 700, p: { dy: -8, col: '#ffd88a' } }],
  }));
  CB.deliver('bell', ['silence'], (a) => {
    const m = mouthAt('cast:silence', 7);
    return CB.play(a, {
      key: 'key:silence', contact: 800, end: 1380,
      parts: [{ at: 0, act: 'cast:silence', d: 860 }, { at: 860, act: 'recover:silence', d: 520 }],
      fx: [{ at: 520, name: 'cbToll', d: 620, p: { mode: 'mute', dx: m[0], dy: m[1], to: 'party' } }],
    });
  });
  CB.deliver('bell', ['lie'], (a) => {
    const m = mouthAt('exec:lie', 2);
    return CB.play(a, {
      key: 'key:lie', contact: 700, end: 1300,
      parts: [{ at: 0, act: 'prep:lie', d: 300 }, { at: 300, act: 'exec:lie', d: 420, travel: { to: a.aimed, peak: 0.12, arc: 4, shape: 'outback' } }, { at: 720, act: 'recover:lie', d: 580 }],
      fx: [{ at: 380, name: 'cbToll', d: 360, p: { mode: 'lie', dx: m[0], dy: m[1], to: a.aimed } }, { at: 420, name: 'cbTag', d: 420, p: { dx: m[0], dy: m[1], to: a.aimed } }],
    });
  });
  // anything else the bell might be given (none in the current bestiary): its strike, cast-style
  CB.deliver('bell', ['*'], (a) => CB.play(a, {
    key: 'key:charge', contact: 700, end: 1200,
    parts: [{ at: 0, act: 'cast:charge', d: 760 }, { at: 760, act: 'recover:charge', d: 440 }],
    fx: [],
  }));

  // ======================================================================================
  // THE KEEPER
  // ======================================================================================
  const KP = -80; // the keeper's body hinge (the crown), art px above the origin
  const KLEAN = -0.05; // it leans toward the party (a line of action from its back foot to its crown)
  function keeperPt(q, x, y) {
    const a = (q.tilt || 0) + KLEAN, c = Math.cos(a), s = Math.sin(a), dy = y - KP;
    return [Math.round(x * c - dy * s), Math.round(KP + x * s + dy * c + (q.crouch || 0))];
  }
  // the body: a cast cone seen three-quarter from a little above; hw(y) its half width, the
  // face (plate and eyes) turned toward the party (θ < 0 is the near-left side)
  const KHW = (y) => (y < -70 ? 22 : 22 + (y + 70) * 0.4);
  const KROT = -0.32; // where the face is centred round the cone (radians)
  // tendril i: from its root under the lip to a foot on the floor. 0 the near-left (it lashes),
  // 1 and 2 the far pair behind (higher feet, in shade), 3 the near-right (it winds the rope)
  // (four legs round a circle, the stand turned toward the party and seen from a little above:
  // left, front, back, right — the front foot lowest and nearest, the back one highest, half hidden)
  const TROOT = [[-30, 38], [-6, 44], [8, 32], [30, 38]];
  const TFOOT = [[-70, 86], [-16, 97], [16, 76], [70, 91]];
  function tendrilPts(q, i) {
    const ph = (q.tph || 0) + i;
    const w0 = Math.sin(ph) * 5 * (q.tamp == null ? 1 : q.tamp);
    const [rx, ry] = keeperPt(q, TROOT[i][0], TROOT[i][1]);
    const curl = q.curl || 0;              // plea: the tendrils draw in under it
    let [ex, ey] = TFOOT[i];
    ex = ex * (1 - curl * 0.45);
    const far = i === 2, wd = i === 1 ? 12 : far ? 8 : 10;
    const kneeOut = i === 0 ? -10 : i === 3 ? 10 : i === 1 ? -6 : 4;
    const out = [[rx, ry, wd], [rx + (ex - rx) * 0.45 + kneeOut + w0, ry + (ey - ry) * 0.35 - curl * 6, wd], [ex + w0 * 0.6 + kneeOut * 0.4, ey - 14 - curl * 10, wd - 1], [ex + (i === 0 ? -8 : i === 3 ? 8 : i === 1 ? -5 : 4) * (1 - curl), ey - curl * 14, wd - 2]];
    if (i === 0 && q.lash) {
      // the lash: the near tendril rears up and reaches toward the party
      const k = q.lash;
      out[1] = [rx - 24 * k + (out[1][0] - rx) * (1 - k), ry - 10 * k + (out[1][1] - ry) * (1 - k), 11];
      out[2] = [rx - 42 * k + out[2][0] * (1 - k) * 0.9, 30 - 26 * k + 50 * (1 - k), 10];
      out[3] = [rx - 64 * k + (ex - 9) * (1 - k) * 0.8, 14 - 10 * k + 80 * (1 - k), 9];
    }
    if (i === 3 && q.rope) {
      // the false yes: the near-right tendril curls up to wind the bell rope away
      const k = q.rope;
      out[2] = [ex + 8 * k, ey - 14 - 40 * k, 10];
      out[3] = [ex - 6 * k, ey - 66 * k, 9];
    }
    return out;
  }
  // palettes: weathered bell bronze (green-grey, verdigris in the hollows), brass, blued iron pipe
  const KPAL = {
    bronze: ['#0e1024', '#18223a', '#22384a', '#2f5450', '#4a7a5e', '#86ae70', '#e4f2bc'],
    patina: ['#14484e', '#22766e', '#3ea88c', '#86dcb4'],
    brass: ['#2a1210', '#5a2e14', '#93591e', '#c78e2c', '#ecc35c', '#fff2b4'],
    iron: ['#100e26', '#1f1e40', '#33335e', '#4e5084', '#7e84b4', '#c6cceb'],
    water: ['#2a5aa4', '#4f8ad2', '#8cc2f0', '#d4f0ff'],
  };
  function drawKeeper(L, o, q, H) {
    const col = o.col || '#4a5a52';
    const bronzeCols = col.toLowerCase() === '#4a5a52' ? KPAL.bronze : S.ramp(col, { n: 7, at: 3 });
    const bronze = S.mat(bronzeCols, { at: 3, rim: '#7ab8e8', litk: 0.12 });
    const patina = S.mat(KPAL.patina, { at: 1, line: false });
    const brass = S.mat(KPAL.brass, { at: 3, rim: '#8ab0e0', litk: 0.12 });
    const iron = S.mat(KPAL.iron, { at: 3, rim: '#86b8ee', litk: 0.12 });
    const ironFar = S.mat(KPAL.iron.slice(0, 5), { at: 2, litk: 0.1 });
    const water = S.mat(KPAL.water, { at: 1, alpha: 215, line: '#1a3a74' });
    const foam = K.solid('#f2fbff', { line: false });
    const eyeM = S.mat(q.eyeGlow ? ['#e8a040', '#ffd880', '#fff6d0'] : ['#7a9ad0', '#cfe0ff', '#ffffff'], { at: 1, line: false });
    const cav = S.mat(['#06060e', '#100e1c', '#1c1a2e'], { at: 0, line: false });
    const seamM = S.mat(['#4ab8d8', '#a4f0ff', '#ffffff'], { at: 1, line: false });
    const ropeM = S.mat(['#3a1e1a', '#7a4a2a', '#b8864a', '#e8c080'], { at: 2 });
    const farT = L.like(), sideT = L.like(), nearT = L.like(), lash = L.like(), B = L.like(), wheelL = L.like(), fx = L.like(), aura = L.like();
    const tilt = (q.tilt || 0) + KLEAN, cr = q.crouch || 0;
    // ---- tendrils: the far pair behind the body, the near pair in front of its lip
    // the back leg in shade behind everything; the side legs behind the lip; the front leg (and a
    // lashing or rope-winding leg) in front of it
    S.pipe(farT, tendrilPts(q, 2), 8, ironFar, { bands: [[-1, 3], [-0.7, 4], [-0.45, 3], [-0.1, 2], [0.4, 1], [0.75, 0]] });
    for (const i of [0, 3]) S.pipe((i === 0 && q.lash > 0.3) ? lash : (i === 3 && q.rope > 0.3) ? nearT : sideT, tendrilPts(q, i), 10, iron);
    S.pipe(nearT, tendrilPts(q, 1), 12, iron);
    // feet: a flat cap where each tendril meets the floor (planted)
    for (let i = 0; i < 4; i++) {
      if (i === 0 && q.lash > 0.3) continue;
      if (i === 3 && q.rope > 0.3) continue;
      const p = tendrilPts(q, i)[3], far = i === 2, Lr = far ? farT : i === 1 ? nearT : sideT, M = far ? ironFar : iron;
      Lr.ell(p[0], p[1] + 1, far ? 7 : 9, far ? 3 : 4, M, (x, y) => S.step(y < p[1] ? M.n - 2 : x > p[0] + 2 ? 1 : M.n - 3, M.n));
      Lr.line(p[0] - (far ? 5 : 7), p[1] + 1, p[0] + (far ? 5 : 7), p[1] + 1, M, 0);
    }
    // the bell rope wound up by the near-right tendril (the false yes)
    if (q.rope > 0.05) {
      const p = tendrilPts(q, 3)[3];
      const [cx, cy] = keeperPt(q, 0, 46);
      nearT.path([[cx + 2, cy], [Math.round((cx + p[0]) / 2) + 4, Math.round((cy + p[1]) / 2) + 10], [p[0], p[1]]], 3, ropeM, 2);
      for (let k = 0; k < 3; k++) nearT.ell(p[0] + (k - 1) * 2, p[1] + k * 2 - 2, 4, 2, ropeM, 3 - (k % 2));
    }
    // seams glowing with the pressure (Gathering)
    if (q.glow > 0.05) H.glow(aura, ...keeperPt(q, 0, -20), 58, 62, '#9fd8e8', 0.18 * q.glow, 3);
    // ---- the body, in its own frame (crouch, then the lean about the crown)
    B.save().translate(0, cr).translate(0, KP).rotate(tilt).translate(0, -KP);
    // the angle round the cone at a point (−π/2 the left limb, 0 facing us, π/2 the right limb)
    const th = (x, y) => Math.asin(Math.max(-1, Math.min(1, x / KHW(y))));
    // the lip's lower edge curves toward us (seen from a little above)
    const lipY = (x) => 32 + 7 * Math.sqrt(Math.max(0, 1 - (x / 62) ** 2));
    // cast bronze in hard bands: lit left plane with a specular streak, a dark reflected band and
    // the cool rim on the right; the crown lighter (it faces the sky)
    const bodySh = (x, y) => {
      const u = x / KHW(y);
      let k = u < -0.9 ? 4 : u < -0.74 ? 6 : u < -0.58 ? 5 : u < -0.2 ? 4 : u < 0.3 ? 3 : u < 0.62 ? 2 : u < 0.84 ? 1 : 2;
      if (y < -54 && k < 5) k++;
      if (y > 20 && k > 1) k--;
      k -= Math.round((q.dark || 0) * 3);
      return S.step(k, 7);
    };
    B.fill(-64, -72, 64, 42, (x, y) => y >= -70 && y < lipY(x) && Math.abs(x) <= KHW(y), bronze, bodySh);
    // the crown: the top face (an ellipse we look down on) and the cast dome on it
    B.ell(0, -70, 22, 7, bronze, (x, y) => S.step(x < -8 ? 6 : x < 8 ? 5 : 4, 7));
    B.ell(-1, -73, 12, 5, bronze, (x, y) => S.step(y < -75 && x < 0 ? 6 : x > 5 ? 3 : 4, 7));
    // the lip band: a heavier rolled edge, curving toward us
    B.fill(-64, 20, 64, 42, (x, y) => Math.abs(x) <= KHW(y) && y >= lipY(x) - 10 && y < lipY(x), bronze, (x, y) => { const u = x / KHW(y); return S.step(y < lipY(x) - 8 ? (u < -0.5 ? 6 : 5) : u < -0.7 ? 4 : u < -0.1 ? 3 : u < 0.6 ? 2 : 1, 7); });
    // flutes round the cone: a shadowed groove with a lit lip on its left, spaced as they wrap
    for (let f = -3; f <= 3; f++) {
      const a = KROT + f * 0.5;
      if (Math.abs(a) > 1.3) continue;
      for (let y = -66; y < 24; y++) {
        const x = Math.round(KHW(y) * Math.sin(a));
        B.dot(x, y, bronze, a < -0.2 ? 3 : 1);
        if (Math.cos(a) > 0.4) B.dot(x - 1, y, bronze, a < -0.2 ? 6 : a < 0.4 ? 4 : 3);
      }
    }
    // raised bands with rivets, following the curve
    for (const yb of [-64, 16]) {
      for (let x = -KHW(yb) + 1; x <= KHW(yb) - 1; x++) {
        const t = th(x, yb), yy = Math.round(yb + 3 * Math.cos(t));
        B.dot(x, yy - 1, bronze, x / KHW(yb) < -0.4 ? 6 : 5); B.dot(x, yy, bronze, 3); B.dot(x, yy + 1, bronze, 1);
      }
      for (let r = -6; r <= 6; r++) {
        const a = KROT + r * 0.22;
        if (Math.abs(a) > 1.3) continue;
        const x = Math.round(KHW(yb) * Math.sin(a)), yy = Math.round(yb + 3 * Math.cos(a)) + 3;
        B.dot(x, yy, bronze, 5); B.dot(x + 1, yy + 1, bronze, 0);
      }
    }
    // verdigris: clustered green where water runs from the bands, with streaks down
    // (it gathers under the raised bands and runs down in tapering streaks)
    for (const [x0, y0, n] of [[-44, 20, 3], [-20, 21, 2], [24, 21, 3], [44, 22, 2], [-14, -60, 2], [10, -60, 3], [2, 21, 2]]) {
      for (let k = 0; k < n; k++) {
        const x = x0 + k * 4 + (K.hh(x0, k, 5) % 3), len = 5 + (K.hh(x0, y0 + k, 2) % 10);
        S.tuft(B, x, y0, Math.PI / 2, len, 3, patina, x < -10 ? 2 : 1, 0);
        B.dot(x - 1, y0, patina, 3);
      }
    }
    // ---- the sluice: a drop gate whose brass plate slides down its grooves to open a mouth
    const pl = q.plate || 0, open = Math.round(pl * 22);
    const pa0 = KROT - 0.62, pa1 = KROT + 0.5; // the plate's span round the cone
    const onFace = (x, y, a0, a1) => { const t = th(x, y); return t >= a0 && t <= a1; };
    // grooves either side of the plate
    for (const a of [pa0 - 0.05, pa1 + 0.05]) for (let y = -46; y < -6 + open; y++) { const x = Math.round(KHW(y) * Math.sin(a)); B.dot(x, y, bronze, 0); B.dot(x + (a < 0 ? 1 : -1), y, bronze, 2); }
    if (open > 0) {
      B.fill(-64, -46, 64, -44 + open, (x, y) => y >= -44 && y < -44 + open && onFace(x, y, pa0, pa1), cav, (x, y) => S.step(y > -44 + open - 3 ? 2 : y > -40 ? 1 : 0, 3));
      if (q.pour > 0.05) {
        const top = -42 + Math.round((1 - q.pour) * open * 0.5);
        const ph = (q.tph || 0) * 3;
        B.fill(-64, top, 64, -44 + open, (x, y) => y >= top + Math.round(Math.sin(x / 4 + ph)) && y < -45 + open && onFace(x, y, pa0 + 0.06, pa1 - 0.06), water, (x, y) => {
          const d = y - top - Math.sin(x / 4 + ph);
          const wave = Math.sin(x / 6 - y / 3 + ph) > 0.55;
          return S.step(d < 1.5 ? 3 : y > -47 + open ? 0 : wave ? 2 : 1, 4);
        });
        for (let k = 0; k < 5; k++) { const a = pa0 + 0.12 + k * 0.2, x = Math.round(KHW(top) * Math.sin(a)); B.rect(x, top + ((k * 3 + Math.round((q.tph || 0) * 4)) % 4), 3, 1, foam, 0); }
      }
    }
    // the brass plate itself (riding in its grooves), banded as it wraps the cone, with rivets
    const py = -44 + open;
    const plateSh = (x, y) => {
      const t = th(x, y), u = (t - pa0) / (pa1 - pa0);
      let k = u < 0.06 ? 4 : u < 0.16 ? 5 : u < 0.4 ? 4 : u < 0.78 ? 3 : 2;
      if (y < py + 2) k = Math.min(5, k + 1);
      if (y > py + 33) k = Math.max(1, k - 2);
      return S.step(k, 6);
    };
    B.fill(-64, py, 64, py + 37, (x, y) => y >= py && y < py + 37 && onFace(x, y, pa0, pa1 + 0.04), brass, () => S.step(0, 6)); // its thickness, seen on the shadow side
    B.fill(-64, py, 64, py + 36, (x, y) => y >= py && y < py + 36 && onFace(x, y, pa0, pa1), brass, plateSh);
    for (let x = -64; x < 64; x++) if (onFace(x, py, pa0, pa1)) B.dot(x, py, brass, 5); // the lit top edge
    for (let gy = py + 7; gy <= py + 29; gy += 6) for (let x = -64; x < 64; x++) {
      if (!onFace(x, gy, pa0 + 0.08, pa1 - 0.08)) continue;
      const t = th(x, gy), yy = Math.round(gy + 2 * Math.cos(t - KROT) - 2);
      B.dot(x, yy, brass, 1); B.dot(x, yy + 1, brass, t < KROT ? 5 : 4);
    }
    for (const a of [pa0 + 0.08, pa1 - 0.09]) for (const yy of [py + 3, py + 32]) { const x = Math.round(KHW(yy) * Math.sin(a)); B.rect(x, yy, 2, 2, brass, 5); B.dot(x + 1, yy + 1, brass, 1); }
    // eyes above the plate: the near one full, the far one narrowed by the curve
    const eyes = q.eyes || 'open';
    // (sockets cast into the bronze: a dark hollow under a lit brow, a pale light inside)
    for (const [a, wv] of [[KROT - 0.42, 12], [KROT + 0.3, 14]]) {
      const ey = -55, ex = Math.round(KHW(ey) * Math.sin(a)), w = Math.max(5, Math.round(wv * Math.cos(a))), x0 = ex - (w >> 1);
      B.rect(x0 - 1, ey - 3, w + 2, 2, bronze, a < KROT ? 6 : 5);                      // the lit brow
      B.poly([[x0 - 1, ey - 1], [x0 + w + 1, ey - 1], [x0 + w, ey + 6], [x0, ey + 6]], cav, 1); // the socket
      if (eyes === 'shut') { B.rect(x0, ey + 2, w, 1, eyeM, 0); }
      else if (eyes === 'down') { B.rect(x0 + 1, ey + 3, w - 2, 2, eyeM, 1); B.dot(x0 + 1, ey + 3, eyeM, 2); }
      else if (eyes === 'smile') { B.line(x0 + 1, ey + 3, ex, ey + 1, eyeM, 2); B.line(ex, ey + 1, x0 + w - 2, ey + 3, eyeM, 2); }
      else if (eyes === 'wide') { B.rect(x0, ey - 1, w, 7, cav, 0); B.rect(x0 + 1, ey, w - 2, 4, eyeM, 1); B.rect(ex - 1, ey + 1, 2, 2, cav, 2); B.dot(x0 + 1, ey, eyeM, 2); }
      else { B.rect(x0 + 1, ey + 1, w - 2, 3, eyeM, 1); B.rect(ex - 1 + (a < KROT ? 0 : -1), ey + 1, 2, 3, cav, 2); B.dot(x0 + 1, ey + 1, eyeM, 2); }
    }
    // glowing seams (the pressure inside, Gathering): along the flutes, rising with the glow
    if (q.glow > 0.05) for (let f = -3; f <= 3; f += 2) {
      const a = KROT + f * 0.36, n = Math.round(10 + q.glow * 80);
      for (let k = 0; k < n; k += 3) { const y = Math.round(22 - k); if (y < -66) break; B.dot(Math.round(KHW(y) * Math.sin(a)), y, seamM, k % 6 ? 1 : 2); }
    }
    B.restore();
    // ---- the gate wheel on its spindle: a brass handwheel lying flat, seen from above (it turns:
    // spokes at q.wheel), its rim lit along the near-left
    {
      const [sx, sy] = keeperPt(q, 0, -72), [wx, wy] = keeperPt(q, 0, -94);
      S.pipe(wheelL, [[sx, sy, 4], [wx, wy + 2, 4]], 4, brass, { collars: false });
      const rx = 16, ry = 6;
      wheelL.fill(wx - rx - 2, wy - ry - 3, wx + rx + 2, wy + ry + 3, (x, y) => { const d = Math.hypot((x - wx) / rx, (y - wy) / ry); return d <= 1.05 && d >= 0.72; }, brass, (x, y) => S.step(y < wy && x < wx ? 5 : y < wy ? 4 : x < wx - 4 ? 3 : x < wx + 6 ? 2 : 1, 6));
      for (let k = 0; k < 4; k++) {
        const a = (q.wheel || 0) + (k * Math.PI) / 4;
        wheelL.line(wx, wy, Math.round(wx + Math.cos(a) * 13), Math.round(wy + Math.sin(a) * 5), brass, Math.sin(a) < 0 ? 4 : 2);
        wheelL.line(wx, wy, Math.round(wx - Math.cos(a) * 13), Math.round(wy - Math.sin(a) * 5), brass, Math.sin(a) > 0 ? 4 : 2);
      }
      wheelL.ell(wx, wy, 3, 2, brass, 5);
      const a = q.wheel || 0; wheelL.ell(Math.round(wx + Math.cos(a) * 15), Math.round(wy + Math.sin(a) * 6) - 1, 2, 2, brass, (x, y) => S.step(y < wy + Math.sin(a) * 6 - 1 ? 5 : 3, 6));
    }
    // ---- the clapper on its chain below (it swings), seen under the lip
    {
      const ca = q.clap || 0, [hx, hy] = keeperPt(q, 0, 38);
      const cx = hx + Math.round(Math.sin(-ca) * 12), cy = hy + Math.round(Math.cos(ca) * 12);
      for (let k = 0; k < 4; k++) { const t = k / 4; farT.rect(Math.round(hx + (cx - hx) * t) - 1, Math.round(hy + (cy - hy) * t), 2, 2, ironFar, k % 2 ? 2 : 3); }
      farT.ell(cx, cy + 4, 8, 7, ironFar, S.sph(cx - 2, cy + 1, 9, 8, 5, { bias: 0.1 }));
      farT.dot(cx - 3, cy + 1, ironFar, 4);
    }
    // ---- passes: clusters, coloured outlines, cast shadows, the lit edges of the metal, rim light
    for (const X of [farT, sideT, nearT, lash, B, wheelL]) X.outline();
    S.lit(B, bronze, 6, { left: false, test: (x, y) => y < -66 });
    S.cast(B, farT, 2, 3, 1); S.cast(B, sideT, 2, 3, 2);
    S.cast(nearT, B, 2, 3, 1);
    S.cast(wheelL, B, 2, 3, 1);
    S.cast(lash, B, 3, 4, 1);
    const out = aura.over(farT).over(sideT).over(B).over(wheelL).over(nearT).over(lash);
    S.rim(out, { w: 2 });
    // drips (they stop while it gathers, and run as residue after the flood)
    const drips = q.drips == null ? 1 : q.drips;
    for (let i = 0; i < 4; i++) {
      if (i / 4 >= drips) continue;
      const k = (((q.dph || 0) + i / 4) % 1);
      const [x, y0] = keeperPt(q, [-50, -18, 22, 52][i], 40);
      fx.rect(x, Math.round(y0 + k * (94 - y0)), 2, 3, water, 2); fx.dot(x, Math.round(y0 + k * (94 - y0)), water, 3);
      if (k > 0.82) fx.rect(x - 2, 95, 6, 1, water, 1);
    }
    // the residue: a spreading puddle under the lip after the flood
    if (q.puddle > 0.05) {
      const r = Math.round(30 + 50 * q.puddle);
      fx.ell(0, 96, r, 3, water, (x, y) => S.step(y < 95 ? 2 : Math.abs(x) > r * 0.7 ? 0 : 1, 4));
      fx.line(-r + 6, 95, -r + 16, 95, water, 3);
    }
    return out.over(fx);
  }
  const KB = { tilt: 0, crouch: 0, wheel: 0, plate: 0, pour: 0, lash: 0, rope: 0, curl: 0, clap: 0, glow: 0, dark: 0, eyes: 'open', tph: 0, tamp: 1, dph: 0, drips: 1, puddle: 0, eyeGlow: false };
  const keeperIdle = [];
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2;
    keeperIdle.push({ tilt: Math.sin(a) * 0.035, crouch: Math.round(Math.sin(a * 2) * 1), wheel: a * 0.125, clap: -Math.sin(a - 0.8) * 0.18, tph: a, dph: f / 8, eyes: f === 5 ? 'down' : 'open' });
  }
  const kk = (from, ...st) => CB.keys(Object.assign({}, KB, from), ...st);
  const keeperActs = {
    // Strike: rears back on its rear tendrils, then the front tendril lashes at the target
    'prep:strike': kk({}, [{ tilt: -0.08, crouch: -2, lash: 0.2, eyes: 'wide', clap: 0.2 }, 2, E.out], [{ tilt: -0.12, crouch: -4, lash: 0.45, clap: 0.3, tph: 0.8 }, 2, E.io]),
    'exec:strike': kk({ tilt: -0.12, crouch: -4, lash: 0.45, eyes: 'wide', clap: 0.3 }, [{ tilt: 0.06, crouch: 0, lash: 0.85, clap: -0.1, tph: 1.4 }, 1, E.in], [{ tilt: 0.1, crouch: 2, lash: 1, clap: -0.35, tph: 1.8 }, 1, E.out], [{ tilt: 0.09, crouch: 2, lash: 0.95, clap: -0.2 }, 1, E.lin]),
    'recover:strike': kk({ tilt: 0.09, crouch: 2, lash: 0.95, eyes: 'wide', clap: -0.2 }, [{ tilt: 0.02, crouch: 1, lash: 0.5, clap: 0.2, eyes: 'open' }, 2, E.io], [{ tilt: -0.02, crouch: 0, lash: 0.1, clap: -0.1 }, 2, E.io], [{ tilt: 0, lash: 0, clap: 0 }, 1, E.out]),
    // Flood (signature): crouch, the wheel spins, the plate lifts — water bursts out across the
    // party — then the plate drops, the wheel unwinds, and the drips run on as a puddle spreads
    'prep:flood': kk({}, [{ crouch: 3, wheel: 0.6, eyes: 'wide', tph: 0.5 }, 2, E.out], [{ crouch: 5, wheel: 1.6, plate: 0.2, tilt: -0.04 }, 2, E.io], [{ crouch: 4, wheel: 2.8, plate: 0.45, tilt: -0.06, drips: 0.5 }, 2, E.io]),
    'exec:flood': kk({ crouch: 4, wheel: 2.8, plate: 0.45, tilt: -0.06, eyes: 'wide', drips: 0.5 }, [{ wheel: 3.6, plate: 1, pour: 1, tilt: 0.08, crouch: 0, tph: 1.6 }, 1, E.in], [{ wheel: 4.0, tilt: 0.1, crouch: -2, tph: 2.2, dph: 0.2 }, 1, E.lin], [{ wheel: 4.3, tilt: 0.08, tph: 2.8, dph: 0.4 }, 1, E.lin], [{ wheel: 4.5, tilt: 0.06, pour: 0.6, tph: 3.4, dph: 0.6 }, 1, E.lin]),
    'recover:flood': kk({ wheel: 4.5, plate: 1, pour: 0.6, tilt: 0.06, crouch: -2, eyes: 'wide', drips: 1, tph: 3.4 }, [{ plate: 0.3, pour: 0, wheel: 3.6, tilt: 0.02, crouch: 0, puddle: 0.5, eyes: 'open', dph: 0.9 }, 2, E.io], [{ plate: 0, wheel: 3.2, tilt: 0, puddle: 0.8, dph: 1.4 }, 2, E.out], [{ puddle: 1, dph: 1.9 }, 2, E.lin]),
    // the Hush: the wheel winds the plate shut tight, the clapper is hauled up still, eyes shut
    'cast:silence': kk({}, [{ wheel: -0.6, eyes: 'down', clap: 0.1 }, 2, E.out], [{ wheel: -1.6, clap: -0.4, crouch: 2, eyes: 'shut', drips: 0.5 }, 2, E.io], [{ wheel: -2.2, clap: 0, crouch: 3, dark: 0.25, drips: 0 }, 2, E.io], [{ wheel: -2.3, crouch: 2, dark: 0.3 }, 1, E.lin]),
    'recover:silence': kk({ wheel: -2.3, crouch: 2, eyes: 'shut', dark: 0.3, drips: 0 }, [{ wheel: -2.0, crouch: 1, dark: 0.15, eyes: 'down', drips: 0.5 }, 2, E.io], [{ wheel: -1.8, crouch: 0, dark: 0, eyes: 'open', drips: 1 }, 2, E.out]),
    // the false "yes": it bows (tilts forward, eyes curved) while the back tendril winds the
    // bell rope up out of reach; the words go out (a pale pane) to its target
    'prep:lie': kk({}, [{ tilt: 0.08, crouch: 2, eyes: 'smile', rope: 0.3 }, 2, E.out], [{ tilt: 0.14, crouch: 4, rope: 0.6, tph: 0.6 }, 2, E.io]),
    'exec:lie': kk({ tilt: 0.14, crouch: 4, eyes: 'smile', rope: 0.6 }, [{ tilt: 0.04, crouch: 1, rope: 0.85, tph: 1.2 }, 2, E.io], [{ tilt: 0.12, crouch: 3, rope: 1, tph: 1.8 }, 2, E.io]),
    'recover:lie': kk({ tilt: 0.12, crouch: 3, eyes: 'smile', rope: 1 }, [{ tilt: 0.02, crouch: 1, rope: 0.6, eyes: 'open' }, 2, E.io], [{ tilt: 0, crouch: 0, rope: 0 }, 2, E.out]),
    // its plea: it sinks on curled tendrils, eyes down, the clapper hanging dead still
    'cast:plea': kk({}, [{ crouch: 4, curl: 0.3, eyes: 'down', tamp: 0.4 }, 2, E.out], [{ crouch: 10, curl: 0.7, tilt: 0.05, clap: 0, drips: 0.75 }, 3, E.io], [{ crouch: 12, curl: 0.8, tilt: 0.06 }, 2, E.lin]),
    'recover:plea': kk({ crouch: 12, curl: 0.8, tilt: 0.06, eyes: 'down', tamp: 0.4, drips: 0.75 }, [{ crouch: 4, curl: 0.3, tilt: 0.02, tamp: 0.8 }, 2, E.io], [{ crouch: 0, curl: 0, tilt: 0, eyes: 'open', tamp: 1, drips: 1 }, 2, E.out]),
    // Gathering: the wheel winds tight, tendrils brace wide, the seams light with pressure, drips stop
    'cast:charge': kk({}, [{ wheel: 0.8, crouch: 2, eyes: 'wide', tamp: 0.3 }, 2, E.out], [{ wheel: 2.2, crouch: 4, glow: 0.5, drips: 0.25, eyeGlow: true }, 2, E.io], [{ wheel: 3.4, crouch: 5, glow: 1, drips: 0, tilt: -0.03 }, 2, E.io], [{ wheel: 3.6, crouch: 4, glow: 0.85 }, 2, E.lin]),
    'recover:charge': kk({ wheel: 3.6, crouch: 4, glow: 0.85, drips: 0, eyes: 'wide', eyeGlow: true, tamp: 0.3 }, [{ crouch: 2, glow: 0.6, eyes: 'open' }, 2, E.io], [{ crouch: 0, glow: 0.45, tamp: 1 }, 2, E.out]),
    // reactions
    recoil: kk({}, [{ tilt: -0.1, crouch: -2, clap: 0.5, eyes: 'shut' }, 1, E.out], [{ tilt: 0.05, crouch: 1, clap: -0.4, eyes: 'down' }, 1, E.io], [{ tilt: -0.02, crouch: 0, clap: 0.15 }, 1, E.io], [{ tilt: 0, clap: 0, eyes: 'open' }, 1, E.out]),
    release: kk({}, [{ eyes: 'shut', plate: 0.15, pour: 0, crouch: 1 }, 1, E.out], [{ plate: 0.2, crouch: 2, tamp: 1.6, tph: 1 }, 1, E.io], [{ plate: 0.1, crouch: 1, tph: 2, eyes: 'down' }, 1, E.io], [{ plate: 0, crouch: 0, tamp: 1, tph: 3, eyes: 'open' }, 1, E.out]),
    balk: kk({ wheel: 2, crouch: 4, glow: 0.6, eyes: 'wide' }, [{ wheel: 1.4, crouch: 1, glow: 0.3, clap: 0.4 }, 1, E.out], [{ wheel: 1.0, crouch: -1, glow: 0.1, clap: -0.3 }, 1, E.io], [{ wheel: 0.8, crouch: 0, glow: 0, clap: 0.1, eyes: 'down' }, 1, E.io], [{ clap: 0, eyes: 'open' }, 1, E.out]),
    settle: kk({}, [{ crouch: 3, eyes: 'down', plate: 0.2 }, 1, E.out], [{ crouch: 8, curl: 0.4, eyes: 'shut', plate: 0.3, tamp: 0.4 }, 1, E.io], [{ crouch: 12, curl: 0.6, dark: 0.1, plate: 0.25 }, 1, E.io], [{ crouch: 14, curl: 0.7, dark: 0.15, plate: 0.2, drips: 0.25 }, 1, E.out]),
    rest: kk({}, [{ crouch: 2, eyes: 'down', tamp: 0.5 }, 1, E.io], [{ crouch: 4, eyes: 'shut', wheel: 0.1 }, 1, E.io], [{ crouch: 4, eyes: 'shut', wheel: 0.15, dph: 0.3 }, 1, E.io], [{ crouch: 2, eyes: 'down', dph: 0.6 }, 1, E.io]),
  };
  CB.rig('lf_keeper', {
    w: 236, h: 244, ox: 118, oy: 116, ms: 150,
    base: KB, idle: keeperIdle, acts: keeperActs,
    keys: { strike: ['exec:strike', 1], flood: ['exec:flood', 1], silence: ['cast:silence', 5], lie: ['exec:lie', 3], plea: ['cast:plea', 5], charge: ['cast:charge', 6] },
    alias: { prep: ['cast:charge', 0, 4] },
    draw: drawKeeper,
  });
  const kpt = (act, i, x, y) => keeperPt(keeperActs[act][i], x, y);
  CB.deliver('lf_keeper', ['strike'], (a) => {
    const blk = CB.blocked(a);
    const tip = tendrilPts(keeperActs['exec:strike'][2], 0)[3];
    return CB.play(a, {
      key: 'key:strike', contact: 700, end: 1360,
      parts: [
        { at: 0, act: 'prep:strike', d: 380 },
        { at: 380, act: 'exec:strike', d: 360, travel: { to: a.aimed, peak: blk ? 0.08 : 0.12, arc: 0, shape: 'out' } },
        blk ? { at: 740, act: 'balk', d: 300, travel: { to: a.aimed, peak: 0.08, shape: 'back' } } : null,
        { at: blk ? 1040 : 740, act: 'recover:strike', d: blk ? 320 : 620, travel: blk ? null : { to: a.aimed, peak: 0.12, shape: 'back' } },
      ].filter(Boolean),
      fx: [{ at: 470, name: 'cbLash', d: 560, p: { dx: tip[0], dy: tip[1], to: a.aimed, short: blk } }],
    });
  });
  CB.deliver('lf_keeper', ['flood'], (a) => {
    const m = kpt('exec:flood', 1, 0, -2);
    return CB.play(a, {
      key: 'key:flood', contact: 1000, end: 1900,
      parts: [{ at: 0, act: 'prep:flood', d: 600 }, { at: 600, act: 'exec:flood', d: 520 }, { at: 1120, act: 'recover:flood', d: 780 }],
      fx: [{ at: 640, name: 'cbFlood', d: 1000, p: { dx: m[0], dy: m[1], who: CB.targets(a) } }],
    });
  });
  CB.deliver('lf_keeper', ['silence'], (a) => CB.play(a, {
    key: 'key:silence', contact: 820, end: 1400,
    parts: [{ at: 0, act: 'cast:silence', d: 860 }, { at: 860, act: 'recover:silence', d: 540 }],
    fx: [{ at: 480, name: 'cbToll', d: 640, p: { mode: 'mute', dx: 0, dy: 44, to: 'party' } }],
  }));
  CB.deliver('lf_keeper', ['lie'], (a) => {
    const m = kpt('exec:lie', 1, 0, -40);
    return CB.play(a, {
      key: 'key:lie', contact: 760, end: 1360,
      parts: [{ at: 0, act: 'prep:lie', d: 320 }, { at: 320, act: 'exec:lie', d: 460 }, { at: 780, act: 'recover:lie', d: 580 }],
      fx: [{ at: 420, name: 'cbPane', d: 380, p: { dx: m[0], dy: m[1], to: a.aimed, smile: true } }],
    });
  });
  CB.deliver('lf_keeper', ['plea'], (a) => CB.play(a, {
    key: 'key:plea', contact: 760, end: 1500,
    parts: [{ at: 0, act: 'cast:plea', d: 820 }, { at: 820, act: 'recover:plea', d: 680 }],
    fx: [{ at: 380, name: 'cbNote', d: 900, p: { dx: 0, dy: -40, to: 'party', drip: true } }],
  }));
  CB.deliver('lf_keeper', ['charge'], (a) => CB.play(a, {
    key: 'key:charge', contact: 840, end: 1400,
    parts: [{ at: 0, act: 'cast:charge', d: 900 }, { at: 900, act: 'recover:charge', d: 500 }],
    fx: [{ at: 300, name: 'cbGather', d: 700, p: { dy: -20, col: '#9fd8e8' } }],
  }));
  CB.deliver('lf_keeper', ['*'], (a) => CB.play(a, {
    key: 'key:charge', contact: 700, end: 1200,
    parts: [{ at: 0, act: 'cast:charge', d: 760 }, { at: 760, act: 'recover:charge', d: 440 }],
  }));

  // ---- the record ---------------------------------------------------------------------------------
  CB.family('bell', { anatomy: 'bell (constructed): one hinge at the loop, a lagging clapper on its own hinge, trailing ghost strands', palette: 'metal ramp from artOpts.col (6 steps, warm lights / cool shadows), verdigris by hue, pale eyes, bone-pink strands' });
  CB.family('lf_keeper', { anatomy: 'large constructed boss (bell-bronze on four pipe tendrils): body hinge at the crown, turning gate wheel, sliding sluice plate, clapper on a chain, dripping water', palette: 'bronze #4a5a52 (6 steps), brass #b8984a, verdigris #7fae9a, iron pipe #3a3850, water #a0bee6' });
})();
