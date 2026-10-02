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
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E;
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
    const M = K.mat(K.tone(col, -dim * 2), { n: 6, at: 3, step: 0.085, shift: 1.2 });
    const Mlip = K.mat(K.tone(col, -0.6 - dim * 2), { n: 5, at: 2, step: 0.08, shift: 1.2 });
    const spec = K.solid(mixh(col, '#fff4d8', 0.72 - dim * 0.4), { line: false });
    const ringM = K.solid(mixh(col, '#fffaf0', 0.85), { line: false });
    const cav = K.mat('#140e14', { n: 3, at: 0, step: 0.05, line: false });
    const patina = K.mat(mixh('#7fb0a0', col, 0.25), { n: 3, at: 1, step: 0.07, line: false });
    const wisp = K.mat(mixh('#c8a0a8', col, 0.25), { n: 3, at: 1, step: 0.1, alpha: 170, line: false });
    const wisp2 = K.mat(mixh('#c8a0a8', col, 0.25), { n: 3, at: 1, step: 0.1, alpha: 95, line: false });
    const eyeM = K.mat(mixh('#f0d0d8', col, 0.2), { n: 3, at: 1, line: false });
    const glowM = K.mat(mixh('#ffd88a', col, 0.15), { n: 3, at: 1, line: false });
    const strands = L.like(), back = L.like(), B = L.like(), clap = L.like(), fx = L.like(), aura = L.like();
    const sw = q.sw, lift = q.lift || 0, sh = q.shake || 0;
    // ---- glow behind (gathering / a toll)
    if (q.glow > 0.05) H.glow(aura, ...bellPt(q, 0, -8), 48 + q.glow * 10, 58 + q.glow * 10, '#ffd88a', 0.22 * q.glow, 3);
    // ---- ghost strands from under the lip: they trail the swing (lean) and curl
    const mute = q.mute || 0;
    for (let i = 0; i < 3; i++) {
      const lx = -18 + i * 18;
      const [sx, sy] = bellPt(q, lx * (1 - mute * 0.5), 38);
      const len = (q.slen || 46) - (i % 2) * 8 - mute * 22;
      H.tail(strands, sx, sy, Math.max(10, len), 5, (q.sph || 0) + i * 1.7, [[0, 20, wisp], [20, 90, wisp2]], { amp: (q.samp == null ? 6 : q.samp) * (1 - mute * 0.7), curl: 8, dark: 0.1, lean: (q.slean || 0) + (i - 1) * 0.04 * (q.spread || 0) });
    }
    // ---- the clapper (behind the lip, seen below it), on its own hinge inside the bell
    {
      const ca = sw + (q.cl || 0), Lr = 46;
      const hx = bellPt(q, 0, -8);
      const tip = [Math.round(hx[0] - Lr * Math.sin(ca)), Math.round(hx[1] + Lr * Math.cos(ca))];
      clap.path([[hx[0], hx[1]], [tip[0], tip[1] - 4]], 3, M, 1);
      clap.ell(tip[0], tip[1], 5, 5, M, K.sphere(tip[0] - 1, tip[1] - 1, 5, 5));
      clap.rect(tip[0] - 2, tip[1] - 3, 2, 1, spec, 0);
    }
    // ---- the bell itself (swung about its hinge)
    B.save().translate(sh, lift).translate(0, PIV).rotate(sw).translate(0, -PIV);
    // the loop (dragon-head handle reduced to a heavy cast loop with a collar)
    B.path([[-9, -56], [-11, -64], [-5, -71], [5, -71], [11, -64], [9, -56]], 5, M, (x, y) => K.clamp(0.75 - (x + 10) / 40 - (y + 70) / 60, 0, 0.99));
    B.rect(-12, -60, 24, 4, Mlip, (x) => K.clamp(0.7 - (x + 12) / 36, 0, 0.99));
    // body: dome shoulder, straight waist, flared lip; a lit stripe on the left, a cool rim
    const ycut = 36;
    B.fill(-46, -62, 46, ycut, (x, y) => y >= -60 && y < ycut && Math.abs(x) <= hwBell(y), M, (x, y) => {
      const w = hwBell(y) || 1, nx = x / w;
      let v = 0.5 - nx * 0.34 + (y < -42 ? (-42 - y) / 70 : 0) - (y > 24 ? 0.12 : 0);
      if (nx > -0.7 && nx < -0.5) v += 0.2;          // the specular stripe
      if (nx > 0.82) v += 0.12;                       // reflected light on the shadowed rim
      v -= (q.dark || 0) * 0.15;
      return K.clamp(v, 0, 0.99);
    });
    // the lip band: a heavier rolled edge
    B.fill(-46, 24, 46, ycut, (x, y) => y >= 26 && y < ycut && Math.abs(x) <= hwBell(y), Mlip, (x, y) => K.clamp(0.6 - x / 90 - (y - 26) / 30, 0, 0.99));
    // raised bands: a lit top edge, a shadowed underside
    for (const y of [-34, 14]) {
      const w2 = hwBell(y);
      B.line(-w2 + 1, y, w2 - 1, y, M, 1); B.line(-w2 + 2, y - 1, w2 - 2, y - 1, M, 5); B.line(-w2 + 2, y + 1, w2 - 2, y + 1, M, 2);
    }
    B.line(0, -34, 0, 14, M, 1); B.line(-1, -34, -1, 14, M, 4);
    // bosses in the upper field: lit top-left, shadow below
    for (let r = 0; r < 3; r++) for (const cx of [-25, -18, -11, 7, 14, 21]) {
      const cy = -53 + r * 6;
      B.rect(cx, cy, 3, 3, M, cx < 0 ? 4 : 3); B.dot(cx, cy, M, 5); B.rect(cx + 1, cy + 3, 3, 1, M, 1);
    }
    // the inscription panels: worn cast strokes (not glyphs), lit on their upper edge
    for (const [px, s] of [[-24, 1], [6, 2]]) for (let r = 0; r < 4; r++) {
      const y = -28 + r * 9, l = 6 + (K.hh(px, r, s) % 9);
      B.line(px + (r % 2) * 3, y, px + (r % 2) * 3 + l, y, M, 2); B.line(px + (r % 2) * 3, y - 1, px + (r % 2) * 3 + l, y - 1, M, 4);
    }
    // the striking seat
    B.ell(-18, 22, 5, 4, M, 2); B.ell(-18, 22, 3, 2, M, 4); B.dot(-19, 21, M, 5);
    // verdigris where rain ran down from the bosses and in the bands
    const pt = [[-28, -36, 6], [-14, -33, 4], [18, -35, 7], [26, 12, 6], [-30, 16, 5], [8, 30, 6], [-6, 15, 4], [22, -12, 4]];
    for (let i = 0; i < pt.length; i++) if (K.hh(i, 4, 9) % 100 < 45 + patinaAmt * 55) {
      const [x, y, s] = pt[i];
      K.cluster(B, x, y, s, patina, 1, K.hh(x + 40, y + 40, 3));
      if (patinaAmt > 0.7) B.line(x, y + 2, x + 1, y + 7 + (i % 3) * 3, patina, 0);
    }
    // eyes under the upper band
    const eyes = q.eyes || 'hollow';
    for (const s of [-1, 1]) {
      const ex = s * 11 + 1, ey = -24;
      if (eyes === 'shut') { B.line(ex - 4, ey, ex + 4, ey + 1, cav, 0); B.line(ex - 3, ey + 1, ex + 3, ey + 1, M, 1); }
      else if (eyes === 'half') { B.ell(ex, ey + 1, 5, 2, cav, 0); B.rect(ex - 2, ey + 1, 3, 1, eyeM, 1); }
      else if (eyes === 'false') { B.line(ex - 4, ey + 1, ex, ey - 2, cav, 0); B.line(ex, ey - 2, ex + 4, ey + 1, cav, 0); B.line(ex - 3, ey + 1, ex, ey - 1, eyeM, 2); }
      else if (eyes === 'wide') { B.ell(ex, ey, 6, 4, cav, 0); B.rect(ex - 1, ey - 1, 2, 2, eyeM, 2); }
      else if (eyes === 'glow') { B.ell(ex, ey, 5, 3, cav, 0); B.rect(ex - 3, ey - 1, 6, 2, glowM, 2); B.rect(ex - 1, ey - 1, 2, 1, ringM, 0); }
      else { B.ell(ex, ey, 5, 3, cav, 0); B.rect(ex - 2, ey, 3, 1, eyeM, 1); }
    }
    // the specular streak and catch-lights
    B.rect(-25, -44, 2, 54, spec, 0); B.rect(-22, -40, 1, 18, spec, 0); B.dot(-20, -58, spec, 0); B.dot(-8, -66, spec, 0);
    // the band glow while gathering
    if (q.glow > 0.05) for (const y of [-34, 14]) { const w2 = hwBell(y); B.line(-w2 + 3, y, w2 - 3, y, glowM, q.glow > 0.5 ? 2 : 1); }
    // the mouth: more of the dark inside shows as the bell tips
    const ry = 3 + Math.min(7, Math.abs(sw) * 14);
    B.ell(0, ycut - 1, hwBell(ycut - 1) - 3, ry, cav, (x, y) => K.clamp(0.2 + (y - ycut) / 20, 0, 0.99));
    B.line(-hwBell(ycut - 1) + 4, ycut - 1 - ry, hwBell(ycut - 1) - 4, ycut - 1 - ry, Mlip, 1);
    // the Hush: strands bound round its own mouth
    if (mute > 0.05) {
      const th = mute > 0.6 ? 3 : 2;
      for (let k = 0; k < 3; k++) {
        const y = 22 + k * 5;
        if (k / 3 > mute + 0.1) break;
        B.fill(-46, y - th, 46, y + th, (x, yy) => Math.abs(x) <= hwBell(yy) + 1 && Math.abs(yy - y - Math.sin(x / 7 + k) * 1.2) < th / 2 + 0.2, wisp, (x) => K.clamp(0.7 - x / 120, 0, 0.99));
      }
    }
    B.restore();
    B.outline();
    // the toll: the struck lip flashes along its leading edge and the air round the mouth
    // shivers (rings in the plane of the mouth, swung with the bell)
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
    clap.outline();
    // the clapper shows inside the dark mouth and below the lip, never through the metal
    for (let i = 0; i < clap.px.length; i++) if (clap.px[i] >>> 24 && (!(B.px[i] >>> 24) || B.mt[i] === cav.id)) { B.px[i] = clap.px[i]; B.mt[i] = clap.mt[i]; }
    return aura.over(strands).over(back).over(B).over(fx);
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
  function keeperPt(q, x, y) {
    const a = q.tilt || 0, c = Math.cos(a), s = Math.sin(a), dy = y - KP;
    return [Math.round(x * c - dy * s), Math.round(KP + x * s + dy * c + (q.crouch || 0))];
  }
  // tendril i: from its root on the lower back to a foot on the floor (the lash lifts tendril 0)
  function tendrilPts(q, i) {
    const x0 = -30 + i * 20;
    const ph = (q.tph || 0) + i;
    const w0 = Math.sin(ph) * 5 * (q.tamp == null ? 1 : q.tamp);
    const [rx, ry] = keeperPt(q, x0, 18);
    const curl = q.curl || 0;              // plea: the tendrils draw in under it
    let ex = -70 + i * 46, ey = 92;
    ex = ex * (1 - curl * 0.45);
    const out = [[rx, ry, 10], [rx + (ex - rx) * 0.5 + w0, ry + (ey - ry) * 0.45 - curl * 6, 10], [ex + w0 * 0.6, 78 - curl * 10, 9], [ex + (i < 2 ? -10 : 10) * (1 - curl), ey - curl * 14, 8]];
    if (i === 0 && q.lash) {
      // the lash: the front tendril rears up and reaches toward the party
      const k = q.lash;
      out[1] = [rx - 24 * k, ry - 10 * k + 10 * (1 - k), 10];
      out[2] = [rx - 40 * k + (ex + w0) * (1 - k) * 0.5, 30 - 26 * k + 48 * (1 - k), 9];
      out[3] = [rx - 62 * k + (ex - 10) * (1 - k) * 0.5, 14 - 10 * k + 78 * (1 - k), 8];
    }
    if (i === 3 && q.rope) {
      // the false yes: the back tendril curls up to wind the bell rope away
      const k = q.rope;
      out[2] = [ex + 8 * k, 78 - 40 * k, 9];
      out[3] = [ex - 6 * k, 92 - 66 * k, 8];
    }
    return out;
  }
  function drawKeeper(L, o, q, H) {
    const col = o.col || '#4a5a52';
    const bronze = K.mat(col, { n: 6, at: 3, step: 0.085, shift: 1.2 });
    const patina = K.mat('#7fae9a', { n: 3, at: 1, step: 0.08, line: false });
    const brass = K.mat('#b8984a', { n: 6, at: 3, step: 0.09 });
    const band = K.mat('#6a7a62', { n: 5, at: 2, step: 0.08 });
    const pipeM = K.mat('#3a3850', { n: 5, at: 2, step: 0.08 });
    const water = K.mat('#a0bee6', { n: 3, at: 1, step: 0.1, alpha: 210, line: false });
    const foam = K.solid('#eef6ff', { line: false });
    const eyeM = K.mat(q.eyeGlow ? '#fff0c0' : '#e8ecff', { n: 3, at: 1, line: false });
    const dark = K.mat('#141820', { n: 2, at: 0, line: false });
    const seamM = K.solid('#9fd8e8', { line: false });
    const ropeM = K.mat('#b89060', { n: 4, at: 2, step: 0.1 });
    const tend = L.like(), front = L.like(), B = L.like(), fx = L.like(), aura = L.like();
    const tilt = q.tilt || 0, cr = q.crouch || 0;
    // tendrils: the three behind, the front one (a lash) drawn over the body
    for (let i = 0; i < 4; i++) H.pipe(i === 0 && q.lash > 0.3 ? front : tend, tendrilPts(q, i), 10, pipeM);
    // feet: a flat cap where each tendril meets the floor (planted)
    for (let i = 0; i < 4; i++) {
      if (i === 0 && q.lash > 0.3) continue;
      if (i === 3 && q.rope > 0.3) continue;
      const p = tendrilPts(q, i)[3];
      tend.ell(p[0], Math.min(94, p[1] + 2), 7, 3, pipeM, 1);
    }
    // the bell rope wound up by the back tendril (the false yes)
    if (q.rope > 0.05) {
      const p = tendrilPts(q, 3)[3];
      const [cx, cy] = keeperPt(q, 0, 46);
      tend.path([[cx + 2, cy], [Math.round((cx + p[0]) / 2) + 4, Math.round((cy + p[1]) / 2) + 10], [p[0], p[1]]], 2, ropeM, 2);
      for (let k = 0; k < 3; k++) tend.ell(p[0] + (k - 1) * 2, p[1] + k * 2 - 2, 4, 2, ropeM, 2 - (k % 2));
    }
    // seams glowing with the pressure (Gathering)
    if (q.glow > 0.05) H.glow(aura, ...keeperPt(q, 0, -20), 58, 62, '#9fd8e8', 0.18 * q.glow, 3);
    B.save().translate(0, cr).translate(0, KP).rotate(tilt).translate(0, -KP);
    // the gate wheel on its spindle (it turns: spokes at q.wheel)
    B.path([[0, -72], [0, -94]], 4, brass, 3);
    B.fill(-17, -105, 17, -85, (x, y) => { const d = Math.hypot(x, (y + 95) * 1.8); return d <= 15 && d >= 12; }, brass, (x, y) => K.clamp(0.62 - (x + y + 95) / 30, 0, 0.99));
    for (let k = 0; k < 4; k++) {
      const a = (q.wheel || 0) + (k * Math.PI) / 4;
      B.line(0, -95, Math.round(Math.cos(a) * 13), Math.round(-95 + Math.sin(a) * 13 / 1.8), brass, 2);
      B.line(0, -95, Math.round(-Math.cos(a) * 13), Math.round(-95 - Math.sin(a) * 13 / 1.8), brass, 2);
    }
    B.ell(0, -95, 3, 2, brass, 5);
    // knob on the rim (shows the wheel's turning)
    { const a = q.wheel || 0; B.ell(Math.round(Math.cos(a) * 14), Math.round(-95 + Math.sin(a) * 14 / 1.8), 2, 2, brass, 5); }
    // body: a crowned bell-trapezoid with fluting, a heavy base band
    B.ell(0, -70, 22, 8, bronze, K.sphere(-6, -74, 24, 10));
    B.poly([[-22, -70], [22, -70], [62, 30], [-62, 30]], bronze, (x, y) => {
      const w = 22 + (y + 70) * 0.4, nx = x / w;
      return K.clamp(0.56 - nx * 0.36 + (y < -40 ? 0.12 : 0) + (nx > -0.62 && nx < -0.48 ? 0.14 : 0) - (q.dark || 0) * 0.2, 0, 0.99);
    });
    for (const x of [-30, 0, 30]) { B.line(x * 0.4, -68, x, 28, bronze, 1); B.line(x * 0.4 + 1, -68, x + 1, 28, bronze, 4); }
    B.stone([[-64, 28], [64, 28], [66, 40], [-66, 40]], band, { bevel: 2, face: 2 });
    for (let i = 0; i < 7; i++) { B.rect(-54 + i * 18, 32, 2, 2, band, 4); B.dot(-54 + i * 18 + 1, 33, band, 0); }
    // verdigris where the water runs; streaks down from the plate
    for (const [x, y, s] of [[-40, 10, 8], [-30, 22, 6], [34, 14, 7], [18, -40, 5], [-14, -58, 6], [48, 24, 5], [-48, 26, 4]]) K.cluster(B, x, y, s, patina, 1, K.hh(x + 7, y + 7, 9));
    for (const x of [-22, -9, 11, 23]) B.line(x, -6, x + (x > 0 ? 1 : -1), 4 + (K.hh(x, 2, 2) % 10), patina, 0);
    // the sluice: a drop gate — the plate sinks in its grooves and opens a dark mouth under the
    // eyes (water fills it when it pours)
    const pl = q.plate || 0, open = Math.round(pl * 22);
    B.rect(-29, -46, 3, 40 + open, band, 1); B.rect(26, -46, 3, 40 + open, band, 1);
    B.dot(-28, -46, band, 4); B.dot(27, -46, band, 4);
    if (open > 0) {
      B.rect(-25, -44, 50, open, dark, (x, y) => K.clamp(0.1 + (y + 44) / 60, 0, 0.99));
      if (q.pour > 0.05) {
        B.rect(-23, -42 + Math.round((1 - q.pour) * open * 0.5), 46, Math.max(2, open - 3 - Math.round((1 - q.pour) * open * 0.5)), water, (x, y) => K.clamp(0.45 + (((y * 3 + x) % 7) === 0 ? 0.4 : 0) - (y + 44) / 80, 0, 0.99));
        for (let k = 0; k < 5; k++) B.rect(-21 + k * 9, -42 + ((k * 3 + Math.round((q.tph || 0) * 4)) % 4), 4, 1, foam, 0);
      }
    }
    // the brass sluice plate (riding in its grooves): grooves, rivets
    const py = -44 + open;
    B.stone([[-26, py], [26, py], [26, py + 36], [-26, py + 36]], brass, { bevel: 3, face: 3 });
    for (let y = py + 6; y <= py + 28; y += 6) { B.line(-20, y, 20, y, brass, 0); B.line(-20, y + 1, 20, y + 1, brass, 4); }
    for (const [x, y] of [[-23, py + 3], [21, py + 3], [-23, py + 32], [21, py + 32]]) { B.rect(x, y, 2, 2, brass, 5); B.dot(x + 1, y + 1, brass, 1); }
    // eyes above the plate (pale; lit while it gathers; shut in its plea; bowing for the "yes")
    const eyes = q.eyes || 'open';
    for (const s of [-1, 1]) {
      const ex = s * 12, ey = -56;
      if (eyes === 'shut') { B.rect(ex - 4, ey + 2, 8, 1, dark, 0); }
      else if (eyes === 'down') { B.rect(ex - 4, ey, 8, 5, dark, 0); B.rect(ex - 3, ey + 3, 5, 2, eyeM, 1); }
      else if (eyes === 'smile') { B.rect(ex - 4, ey, 8, 5, dark, 0); B.line(ex - 3, ey + 3, ex, ey + 1, eyeM, 2); B.line(ex, ey + 1, ex + 3, ey + 3, eyeM, 2); }
      else if (eyes === 'wide') { B.rect(ex - 5, ey - 1, 10, 7, dark, 0); B.rect(ex - 3, ey + 1, 5, 3, eyeM, 2); }
      else { B.rect(ex - 4, ey, 8, 5, dark, 0); B.rect(ex - 3, ey + 1, 5, 3, eyeM, 1); }
    }
    // glowing seams (the pressure inside, Gathering)
    if (q.glow > 0.05) for (const x of [-30, 0, 30]) { const n = Math.round(10 + q.glow * 80); for (let k = 0; k < n; k += 3) { const t = k / 98; B.dot(Math.round(x * 0.4 + (x - x * 0.4) * t), Math.round(-68 + 96 * t), seamM, 0); } }
    // the clapper on its chain below (it swings)
    const ca = q.clap || 0;
    const cx = Math.round(Math.sin(-ca) * 12), cy = 40 + Math.round(Math.cos(ca) * 12);
    B.path([[0, 40], [cx, cy - 2]], 3, pipeM, 1);
    B.ell(cx, cy + 3, 8, 7, pipeM, K.sphere(cx - 2, cy, 9, 8));
    B.restore();
    B.outline(); tend.outline(); front.outline();
    // drips (they stop while it gathers, and run as residue after the flood)
    const drips = q.drips == null ? 1 : q.drips;
    for (let i = 0; i < 4; i++) {
      if (i / 4 >= drips) continue;
      const k = (((q.dph || 0) + i / 4) % 1);
      const [x, y0] = keeperPt(q, [-50, -18, 22, 52][i], 42);
      fx.rect(x, y0 + k * (92 - y0), 2, 4, water, 1);
      if (k > 0.82) fx.rect(x - 2, 92, 6, 1, water, 2);
    }
    // the residue: a spreading puddle under the lip after the flood
    if (q.puddle > 0.05) fx.ell(0, 95, Math.round(30 + 50 * q.puddle), 3, water, 1);
    return aura.over(tend).over(B).over(front).over(fx);
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
