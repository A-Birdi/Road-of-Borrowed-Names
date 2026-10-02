/* Creatures B — the Conduit Spirit (lf.conduit, family 'lf_conduit'): an iron pipe that woke,
 * snaking up in an S from a bolted base plate to a flared spout with two lit eyes, carrying the
 * voices of the tower as rising beads of light.
 *
 * Anatomy (fluid / pipe): one origin (the base plate on the floor), a body that bends from the
 * base (the higher, the more it moves), collars at the joints, a spout that aims, a hinged valve
 * lid on the spout, and what it carries: light rising inside, spray out of the spout, drips and
 * a puddle as residue. Pressure is always shown travelling the same way — up from the base:
 * Sweep: a bulge climbs the pipe joint by joint (each collar lighting as it passes), the spout
 * swings across and a jet arcs over the party, then it drips and leaves a puddle at its base.
 * Hush: the valve lid swings shut over the spout, the rising light stops and sinks, a muffled
 * pulse rolls out. Re-tying: the pipe bends low and pours a thread of light into a loose knot. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  // the pipe's rest shape: base → spout (x, y, width); heights from the base for the bend
  const P0 = [[-14, 84, 18], [-26, 58, 16], [-20, 30, 16], [0, 10, 16], [16, -10, 16], [14, -36, 16], [4, -56, 16]];
  function pipePts(q) {
    const out = [];
    for (let i = 0; i < P0.length; i++) {
      const [x, y, w] = P0[i], h = (84 - y) / 140;                 // 0 at the base … 1 at the spout
      const bend = (q.bend || 0) * h * h * 60, sq = (q.squash || 0) * h * 22;
      let ww = w;
      if (q.pulse >= 0 && q.pulse != null) { const d = Math.abs(i / (P0.length - 1) - q.pulse); if (d < 0.2) ww += Math.round((1 - d / 0.2) * 7); }
      out.push([Math.round(x + bend + (q.sway || 0) * h * 2), Math.round(y + sq), ww]);
    }
    return out;
  }
  // the spout's frame: its mouth point and the direction it opens (art px)
  function spout(q) {
    const P = pipePts(q), [x, y] = P[P.length - 1], a = q.aim || 0;
    return { x, y, a, mouth: [Math.round(x + Math.sin(a) * 22), Math.round(y - Math.cos(a) * 22)] };
  }
  function drawConduit(L, o, q, H) {
    const col = o.col || '#8a90c8';
    const iron = K.mat('#3a3850', { n: 6, at: 2, step: 0.075, shift: 1.2 });
    const ironHi = K.mat('#5a5878', { n: 4, at: 2, step: 0.08 });
    const light = K.mat(col, { n: 3, at: 1, step: 0.12, line: false });
    const lightHi = K.solid(mixh(col, '#ffffff', 0.7), { line: false });
    const dark = K.mat('#141222', { n: 2, at: 0, line: false });
    const rust = K.mat('#8a5a40', { n: 3, at: 1, step: 0.08, line: false });
    const water = K.mat(mixh(col, '#cfe0ff', 0.4), { n: 3, at: 1, step: 0.1, alpha: 200, line: false });
    const glow = L.like(), B = L.like(), fx = L.like(), head = L.like();
    const P = pipePts(q);
    const gl = (q.glow == null ? 1 : q.glow);
    // the base plate on the floor (the origin): bolted, never moves
    B.stone([[-32, 84], [4, 84], [8, 93], [-36, 93]], iron, { bevel: 2, face: 2 });
    for (const x of [-30, -2]) { B.rect(x, 87, 2, 2, ironHi, 3); B.dot(x + 1, 88, iron, 0); }
    H.pipe(B, P, 16, iron);
    // rust and wet streaks where the joints leak
    for (let i = 1; i < P.length - 1; i++) {
      const [x, y] = P[i];
      K.cluster(B, x + 4, y + 6, 4, rust, 1, K.hh(i, 7, 2));
      B.line(x + 5, y + 8, x + 5, y + 12 + (i % 3) * 2, rust, 0);
    }
    // bolts on the collars; a collar lights as the pressure passes it
    for (let i = 1; i < P.length - 1; i++) {
      B.rect(P[i][0] - 7, P[i][1] - 1, 2, 2, ironHi, 3);
      B.rect(P[i][0] + 5, P[i][1] - 1, 2, 2, ironHi, 2);
      if (q.pulse != null && q.pulse >= 0 && Math.abs(i / (P.length - 1) - q.pulse) < 0.12) {
        B.rect(P[i][0] - 9, P[i][1] - 2, 18, 3, light, 2);
        H.glow(glow, P[i][0], P[i][1], 16, 10, col, 0.4, 2);
      }
    }
    B.outline();
    // ---- the spout (rotated to its aim), its eyes and its valve lid
    const S = spout(q);
    head.save().translate(S.x, S.y).rotate(S.a);
    head.poly([[-14, -2], [14, -2], [20, -22], [-20, -22]], iron, (x, y) => K.clamp(0.55 - x / 60 - (y + 22) / 90, 0, 0.99));
    head.ell(0, -22, 20, 5, iron, 3);
    head.ell(0, -22, 15, 3, dark, 0);
    head.rect(-14, -4, 28, 3, ironHi, 2);
    // the spray from the mouth (in the sprite; the jet beyond is an effect)
    if (q.spray > 0.05) {
      for (let i = 0; i < 9; i++) {
        const k = ((i / 9) + (q.sph || 0)) % 1, spread = (i % 3 - 1) * (4 + k * 10);
        head.rect(Math.round(spread), Math.round(-26 - k * 30 * q.spray), 2 + (i % 2), 2, i % 2 ? water : light, 2);
      }
    }
    head.restore();
    head.outline();
    // eyes: two lit slits on the flare
    head.onto((b) => {
      b.save().translate(S.x, S.y).rotate(S.a);
      const eyes = q.eyes || 'open';
      for (const s of [-1, 1]) {
        if (eyes === 'shut') { b.rect(s * 7 - 2, -11, 5, 1, dark, 0); continue; }
        const h = eyes === 'narrow' ? 1 : eyes === 'wide' ? 4 : 3;
        b.rect(s * 7 - 2, -12, 5, h, gl > 0.5 ? light : dark, gl > 0.5 ? 2 : 0);
        if (gl > 0.5) b.dot(s * 7 - 2, -12, lightHi, 0);
      }
      b.restore();
    });
    // the valve lid: hinged at the back of the rim, standing open or laid shut across the mouth
    if (q.cap != null) {
      const c = q.cap;
      head.save().translate(S.x, S.y).rotate(S.a).translate(19, -23);
      // open: it hangs down against the back of the flare; shut: laid across the mouth
      const ph = 1.62 + (-Math.PI - 1.62) * c;
      head.rotate(ph);
      head.rect(0, -2, 36, 4, iron, (x) => K.clamp(0.62 - x / 80, 0, 0.99));
      head.rect(0, -3, 3, 6, ironHi, 2);
      head.rect(17, -4, 5, 2, ironHi, 3);
      head.restore();
      head.outline();
    }
    // the light it carries, rising beside the pipe (they stop and sink while it is hushed)
    const lights = q.lights == null ? 1 : q.lights;
    for (let i = 0; i < 6; i++) {
      if (i / 6 >= lights) continue;
      const k = (((q.lph || 0) / 8) + i / 6) % 1;
      const sk = (q.sink || 0) > 0 ? 1 - k : k;
      const seg = Math.min(P.length - 2, Math.floor((1 - sk) * (P.length - 1)));
      const u = (1 - sk) * (P.length - 1) - seg;
      const x = P[seg][0] + (P[seg + 1][0] - P[seg][0]) * u + (i % 2 ? 12 : -12), y = P[seg][1] + (P[seg + 1][1] - P[seg][1]) * u;
      fx.ell(x, y, 3, 3, light, sk < 0.8 ? 2 : 1);
      H.glow(glow, x, y, 8, 8, col, 0.3 * gl, 2);
    }
    H.glow(glow, S.x, S.y - 14, 18, 8, col, 0.3 * gl, 2);
    // the residue: drips from the spout lip, a puddle spreading at the base
    if (q.drips > 0.05) for (let i = 0; i < 3; i++) {
      const k = (((q.dph || 0) / 4) + i / 3) % 1;
      const [mx, my] = S.mouth;
      const x = mx + (i - 1) * 6, y = my + 4 + k * Math.max(10, 84 - my) * 0.5;
      if (i / 3 < q.drips) fx.rect(Math.round(x), Math.round(y), 2, 3, water, 1);
    }
    if (q.puddle > 0.05) {
      fx.ell(-14, 95, Math.round(16 + 30 * q.puddle), 3, water, 1);
      fx.rect(-24, 94, Math.round(10 + 12 * q.puddle), 1, K.solid(mixh(col, '#ffffff', 0.7), { line: false }), 0);
    }
    return glow.over(B).over(head).over(fx);
  }
  const CBase = { bend: 0, squash: 0, sway: 0, aim: 0, pulse: -1, cap: 0, spray: 0, drips: 0, puddle: 0, glow: 1, lights: 1, lph: 0, sink: 0, sph: 0, dph: 0, eyes: 'open' };
  const conIdle = [];
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2;
    conIdle.push({ bend: Math.sin(a) * 0.06, sway: Math.round(Math.sin(a) * 1), aim: Math.sin(a - 0.6) * 0.06, lph: f, eyes: f === 6 ? 'narrow' : 'open' });
  }
  const ck = (from, ...st) => CB.keys(Object.assign({}, CBase, from), ...st);
  const conActs = {
    // Sweep: pressure climbs from the base joint by joint, the spout draws back; it swings
    // across, spraying; the spray dies, it drips, a puddle spreads at its base
    'prep:sweep': ck({}, [{ pulse: 0.05, squash: 0.15, aim: 0.25, bend: 0.1, eyes: 'narrow' }, 1, E.out], [{ pulse: 0.3, squash: 0.25, aim: 0.4, bend: 0.18 }, 1, E.lin], [{ pulse: 0.55, squash: 0.3, aim: 0.5, bend: 0.22 }, 1, E.lin], [{ pulse: 0.8, squash: 0.2, aim: 0.55, bend: 0.25, eyes: 'wide' }, 1, E.lin]),
    'exec:sweep': ck({ pulse: 0.8, squash: 0.2, aim: 0.55, bend: 0.25, eyes: 'wide' }, [{ pulse: 1, squash: -0.1, aim: -0.2, bend: -0.1, spray: 1, sph: 0.2 }, 1, E.in], [{ pulse: -1, squash: -0.15, aim: -0.7, bend: -0.3, spray: 1, sph: 0.5 }, 1, E.lin], [{ aim: -1.0, bend: -0.42, spray: 1, sph: 0.8 }, 1, E.lin], [{ aim: -1.15, bend: -0.48, spray: 0.7, sph: 1.1 }, 1, E.out]),
    'recover:sweep': ck({ aim: -1.15, bend: -0.48, squash: -0.15, spray: 0.7, eyes: 'wide' }, [{ aim: -0.7, bend: -0.3, squash: 0, spray: 0.2, drips: 1, puddle: 0.3, dph: 1 }, 2, E.io], [{ aim: -0.25, bend: -0.1, spray: 0, puddle: 0.7, dph: 3, eyes: 'open' }, 2, E.io], [{ aim: 0, bend: 0, drips: 0.66, puddle: 1, dph: 5 }, 2, E.out]),
    // Hush: the valve lid swings shut, the light stops and sinks, it hunches; a muffled pulse
    'cast:silence': ck({}, [{ cap: 0.25, eyes: 'narrow', bend: 0.05 }, 2, E.out], [{ cap: 0.7, squash: 0.15, lights: 0.6, sink: 1, lph: 2, glow: 0.7 }, 2, E.io], [{ cap: 1, squash: 0.25, lights: 0.3, lph: 4, glow: 0.4, eyes: 'shut' }, 2, E.io], [{ cap: 1, squash: 0.2, lph: 5 }, 1, E.lin]),
    'recover:silence': ck({ cap: 1, squash: 0.2, lights: 0.3, sink: 1, glow: 0.4, eyes: 'shut', lph: 5 }, [{ cap: 0.5, squash: 0.1, lights: 0.6, sink: 0, glow: 0.7, eyes: 'narrow', lph: 6 }, 2, E.io], [{ cap: 0, squash: 0, lights: 1, glow: 1, eyes: 'open', lph: 7 }, 2, E.out]),
    // Re-tying: it bends low, the spout aimed down at its knots, and pours a thread of light
    'cast:mend': ck({}, [{ bend: -0.2, aim: -0.6, squash: 0.1, eyes: 'narrow' }, 2, E.out], [{ bend: -0.45, aim: -1.6, squash: 0.25, lights: 0.8, lph: 2 }, 2, E.io], [{ bend: -0.5, aim: -2.0, squash: 0.3, spray: 0.3, lph: 4 }, 2, E.io], [{ spray: 0.2, lph: 6 }, 2, E.lin]),
    'recover:mend': ck({ bend: -0.5, aim: -2.0, squash: 0.3, spray: 0.2, lights: 0.8, eyes: 'narrow' }, [{ bend: -0.2, aim: -0.8, squash: 0.1, spray: 0, drips: 0.5, lph: 7 }, 2, E.io], [{ bend: 0, aim: 0, squash: 0, lights: 1, drips: 0, eyes: 'open', lph: 8 }, 2, E.out]),
    // reactions
    recoil: ck({}, [{ bend: 0.3, aim: 0.5, squash: -0.1, eyes: 'shut', drips: 1, dph: 1 }, 1, E.out], [{ bend: -0.12, aim: -0.2, eyes: 'wide', dph: 2 }, 1, E.io], [{ bend: 0.05, aim: 0.08, drips: 0.5, dph: 3 }, 1, E.io], [{ bend: 0, aim: 0, drips: 0, eyes: 'open' }, 1, E.out]),
    release: ck({}, [{ glow: 1.4, eyes: 'shut', pulse: 0.2 }, 1, E.out], [{ glow: 1.3, pulse: 0.5, lph: 2 }, 1, E.lin], [{ glow: 1.1, pulse: 0.8, lph: 4, eyes: 'narrow' }, 1, E.lin], [{ glow: 1, pulse: -1, lph: 6, eyes: 'open' }, 1, E.out]),
    balk: ck({ pulse: 0.6, squash: 0.25, aim: 0.5, bend: 0.2, eyes: 'wide' }, [{ pulse: -1, squash: -0.1, aim: -0.3, bend: -0.1, drips: 1, dph: 1 }, 1, E.out], [{ squash: 0.1, aim: 0.15, bend: 0.06, dph: 2, eyes: 'shut' }, 1, E.io], [{ squash: 0, aim: 0, bend: 0, drips: 0.5, dph: 3 }, 1, E.io], [{ drips: 0, eyes: 'open' }, 1, E.out]),
    settle: ck({}, [{ squash: 0.15, eyes: 'narrow', lights: 0.8, glow: 1.2 }, 1, E.out], [{ squash: 0.35, bend: -0.15, aim: -0.4, lights: 0.5, glow: 0.9, eyes: 'shut' }, 1, E.io], [{ squash: 0.5, bend: -0.25, aim: -0.7, lights: 0.2, glow: 0.7 }, 1, E.io], [{ squash: 0.55, bend: -0.28, aim: -0.8, lights: 0, glow: 0.6, puddle: 0.4 }, 1, E.out]),
    rest: ck({}, [{ squash: 0.12, eyes: 'narrow', lights: 0.6, sink: 1, lph: 1 }, 1, E.io], [{ squash: 0.18, eyes: 'shut', aim: -0.1, lph: 2 }, 1, E.io], [{ squash: 0.18, eyes: 'shut', aim: -0.12, lph: 3 }, 1, E.io], [{ squash: 0.1, eyes: 'narrow', aim: -0.05, lph: 4 }, 1, E.io]),
  };
  CB.rig('lf_conduit', {
    w: 196, h: 240, ox: 98, oy: 132, dy: -6, ms: 120,
    base: CBase, idle: conIdle, acts: conActs,
    keys: { sweep: ['exec:sweep', 2], silence: ['cast:silence', 5], mend: ['cast:mend', 5] },
    alias: { prep: 'prep:sweep' },
    draw: drawConduit,
  });
  const mouthAt = (act, i) => spout(conActs[act][i]).mouth;
  CB.deliver('lf_conduit', ['sweep'], (a) => {
    const m = mouthAt('exec:sweep', 1);
    return CB.play(a, {
      key: 'key:sweep', contact: 740, end: 1500,
      parts: [{ at: 0, act: 'prep:sweep', d: 420 }, { at: 420, act: 'exec:sweep', d: 400 }, { at: 820, act: 'recover:sweep', d: 680 }],
      fx: [{ at: 460, name: 'cbJet', d: 820, p: { dx: m[0], dy: m[1], who: CB.targets(a), col: CB.colOf(a, '#8a90c8') } }],
    });
  });
  CB.deliver('lf_conduit', ['silence'], (a) => {
    const m = mouthAt('cast:silence', 5);
    return CB.play(a, {
      key: 'key:silence', contact: 800, end: 1380,
      parts: [{ at: 0, act: 'cast:silence', d: 840 }, { at: 840, act: 'recover:silence', d: 540 }],
      fx: [{ at: 480, name: 'cbToll', d: 620, p: { mode: 'mute', dx: m[0], dy: m[1], to: 'party' } }],
    });
  });
  CB.deliver('lf_conduit', ['mend'], (a) => {
    const m = mouthAt('cast:mend', 5), fv = a.fv || {};
    return CB.play(a, {
      key: 'key:mend', contact: 780, end: 1340,
      parts: [{ at: 0, act: 'cast:mend', d: 840 }, { at: 840, act: 'recover:mend', d: 500 }],
      fx: [{ at: 380, name: 'cbMend', d: 640, p: { dx: m[0], dy: m[1], i: fv.knots < fv.maxKnots ? Math.min(fv.maxKnots - 1, fv.knots) : null, col: CB.colOf(a, '#8a90c8') } }],
    });
  });
  CB.deliver('lf_conduit', ['*'], (a) => CB.play(a, {
    key: 'key:silence', contact: 700, end: 1200,
    parts: [{ at: 0, act: 'prep:sweep', d: 420 }, { at: 420, act: 'recover:sweep', d: 780 }],
  }));

  CB.family('lf_conduit', { anatomy: 'pipe (fluid): a fixed base plate, a body that bends from the base, collars at the joints, an aiming spout with a hinged valve lid; pressure climbs from the base; spray, drips and a puddle as residue', palette: 'iron #3a3850 (6 steps) with #5a5878 lights, rust #8a5a40, spirit light from artOpts.col #8a90c8, water mixed toward #cfe0ff' });
})();
