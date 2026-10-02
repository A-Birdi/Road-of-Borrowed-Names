/* Creatures B — the Hush (sa.hush, family 'sa_hush'), the Chapter 6 guardian.
 *
 * A hollow: a near-black core in a deep indigo ring whose edge thins away in stepped rings of
 * falling opacity (no dither), a pale ring for an eye, eighteen blank pages on two counter-
 * rotating orbits (those in the lower half pass in front), and the marks it took rising off it.
 *
 * Anatomy (abstract / spirit): coherent expansion, separation and return of recognisable forms.
 * The hollow swells and contracts; the eye opens, narrows, closes to a line; the pages leave
 * their orbits to take a FORMATION and come back to it — the Hush borrows what every guardian
 * did, and each borrowed move has its own shape made of the same pages:
 *   strike  — the pages stack into a lance and it is thrown at the one target;
 *   sweep   — the pages fan into a broad arc and are flung across the party;
 *   silence — the eye shuts to a line, the hollow swells, the pages stop; a dark soundless ring;
 *   shroud  — the pages go blank and scatter, drifting down over its knots;
 *   mend    — the pages gather low by its knots and stitch one shut;
 *   heat    — the pages char amber and spin fast; the rim smoulders;
 *   gust    — the pages whirl into a vortex that blows across you (stripping wards);
 *   charge  — the pages pull in tight, the eye burns;
 *   lie / mirror — the pages square into a pane: a polite face / a bright reflection sent out;
 *   chill   — the pages rime over and a breath of frost leaves the hollow;
 *   plea    — the eye softens and one page drifts out to you;
 *   flood   — ink wells out of the hollow and rolls across the party.
 * Its routine moves stay short; the guardian's signatures (flood, gust, the thrown lance) take
 * longer, with a readable preparation at its scale. Phase changes keep their authored lines
 * (the rules and the content tell them; nothing here changes them). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E, S = CB.S;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const TINT = { pale: ['#eeeae0', '#cfcadf'], blank: ['#fbf9f4', '#f0eee8'], amber: ['#f0c070', '#d89048'], frost: ['#e4f2ff', '#bcd8ee'], ink: ['#4a4870', '#2e2c48'] };

  // where page j (0–17) sits in a formation (art px from the hollow's centre) and its angle
  function formPos(form, j, q) {
    const n = 18, k = j / (n - 1);
    switch (form) {
      case 'stack': return [-34 - j * 3.6, 2 + Math.sin(j * 0.7) * 2, Math.PI / 2];                      // a lance toward the party
      case 'fan': { const a = Math.PI * 0.62 + k * Math.PI * 0.76; return [Math.cos(a) * 84, Math.sin(a) * 40 - 6, a + Math.PI / 2]; }
      case 'pane': return [-64 + (j % 3) * 12, -32 + Math.floor(j / 3) * 11, 0];                           // a flat pane, front left
      case 'vortex': { const a = j * 0.62 + (q.rot || 0) * 2.4; const r = 14 + j * 3.6; return [Math.cos(a) * r - 10, Math.sin(a) * r * 0.55, a]; }
      case 'scatter': { const a = j * 2.39 + 0.4; const r = 72 + (K.hh(j, 5, 3) % 24); return [Math.cos(a) * r, Math.sin(a) * r * 0.75 + 10, a * 1.7]; }
      case 'tight': { const a = j * (Math.PI * 2 / 9) + (q.rot || 0) * (j < 9 ? 1 : -1); const r = j < 9 ? 44 : 50; return [Math.cos(a) * r, Math.sin(a) * r * 0.62, a * 0.5]; }
      case 'knot': { const a = j * 1.3; return [-6 + Math.cos(a) * (10 + j * 1.6), 74 + Math.sin(a) * 6 - j * 0.4, a]; }
      default: return null;
    }
  }
  // page tints (paper ramps: violet-grey shadow → warm white), the hollow's indigo, the eye
  const PTINT = {
    pale: ['#3a3660', '#7a76a2', '#c4c0d8', '#eeeae2', '#fffcf2'],
    blank: ['#56546e', '#a8a6bc', '#e6e4ea', '#fbf9f4', '#ffffff'],
    amber: ['#5a1e1a', '#a8502a', '#e09a48', '#f6cc78', '#fff0bc'],
    frost: ['#2e4c8c', '#6a98d0', '#b4d8f4', '#e8f6ff', '#ffffff'],
    ink: ['#100e22', '#242242', '#3a3862', '#56548a', '#7a78aa'],
  };
  function drawHush(L, o, q, H) {
    const pr = PTINT[q.tint] || PTINT.pale;
    const em = q.ember || 0;
    const IND = ['#06050e', '#100e22', '#1e1c3c', '#30305a', '#4a4a7e', '#7070a8'].map((c, i) => (em > 0 ? mixh(c, ['#1a0806', '#3a1008', '#6a2414', '#a8441e', '#e07a34', '#ffb860'][i], em * 0.7) : c));
    const core = S.mat(IND.slice(0, 3), { at: 0, line: false });
    const indigo = S.mat(IND, { at: 2, rim: em > 0.3 ? '#ffc890' : '#9ab8ff', litk: 0.2 });
    const edgeA = [200, 140, 80].map((a) => S.mat([IND[2], IND[3], IND[4]], { at: 1, alpha: a, line: false }));
    const eyeM = S.mat(q.eyeGlow ? ['#c87a30', '#ffd890', '#fff6dc', '#ffffff'] : ['#6a66a8', '#c4c0f0', '#f2f0ff', '#ffffff'], { at: 2, line: false });
    const page = S.mat(pr, { at: 3, litk: 0.2 });
    const page2 = S.mat(pr.slice(0, 4), { at: 2, litk: 0.15 });
    const markM = S.mat(['#b8b4c8', '#ece8dc'], { at: 1, alpha: 210, line: false });
    const inkM = S.mat(PTINT.ink, { at: 2, line: '#06050e' });
    const lineM = K.solid(q.tint === 'amber' ? '#7a2a14' : q.tint === 'ink' ? '#a8a6cc' : '#5a5680', { line: false });
    const backP = L.like(), hollow = L.like(), frontP = L.like(), fx = L.like(), aura = L.like(), inkL = L.like();
    const hr = q.hr || 1, sw = q.swell || 0;
    const R0 = 38 * hr;
    if (em > 0.05) H.glow(aura, 0, 0, R0 + 20, R0 + 18, '#f08040', 0.28 * em, 3);
    if (q.eyeGlow) H.glow(aura, 0, 0, 30, 30, '#fff0c0', 0.2, 2);
    // the hollow's thinning edge: stepped rings of falling opacity (a soft, deliberate edge)
    for (let i = 2; i >= 0; i--) {
      const r = R0 + 3 + (i + 1) * (2.6 + sw * 2.4);
      hollow.fill(-r - 2, -r - 2, r + 2, r + 2, (x, y) => { const d = Math.hypot(x, y) + Math.sin(Math.atan2(y, x) * 5 + (q.rot || 0) * 3) * (1 + sw); return d <= r; }, edgeA[i], i === 0 ? 2 : 1);
    }
    // the rim of the hollow as a thick ring seen a little turned: its outer face lit on the upper
    // left (hard bands), the inner lip lit on the far (lower right) side where the light falls in
    hollow.ell(0, 0, R0, R0, indigo, (x, y) => {
      const d = Math.hypot(x, y) / R0, a = (x * S.LK[0] + y * S.LK[1]) / Math.max(1, Math.hypot(x, y));
      let k = d > 0.86 ? (a > 0.55 ? 5 : a > 0.1 ? 4 : a > -0.5 ? 3 : 2) : d > 0.76 ? (a < -0.45 ? 4 : 2) : 1;
      return S.step(k, 6);
    });
    // (the funnel turned toward the party: its throat set off to the near side, the far inner wall seen)
    hollow.ell(-6, 1, 28 * hr * 0.88, 28 * hr, core, (x, y) => { const d = Math.hypot((x + 6) / 0.88, y - 1) / (28 * hr); return S.step(d > 0.82 ? 2 : d > 0.55 ? 1 : 0, 3); });
    // the eye: a luminous ring, turned toward the party (narrower across); it narrows to a slit and
    // shuts to a line
    const er = (17 + (q.er || 0)) * (q.eyeR || 1), eo = q.eye == null ? 1 : q.eye, ex = -7;
    if (eo < 0.08) { hollow.rect(ex - er, -1, er * 2, 2, eyeM, 2); hollow.rect(ex - er + 3, -1, 6, 1, eyeM, 3); }
    else hollow.fill(ex - er - 2, -er - 2, ex + er + 2, er + 2, (x, y) => { const d = Math.hypot((x - ex) / 0.88, y / eo); return d <= er && d >= er - 2.5 - (1 - eo) * 2; }, eyeM, (x, y) => S.step(x - ex + y < -er * 0.6 ? 3 : x - ex + y < er * 0.4 ? 2 : 1, 4));
    // ink welling out of the hollow (flood): dark, glossy, with a lit drop at each tip
    if (q.ink > 0.05) {
      const n = Math.round(3 + q.ink * 5);
      for (let i = 0; i < n; i++) {
        const x = Math.round(-18 + i * 7 + Math.sin(i * 2 + (q.rot || 0) * 4) * 3), len = Math.round(10 + q.ink * (20 + (i % 3) * 14));
        inkL.rect(x, 24, 5, len, inkM, (px) => S.step(px < x + 2 ? 3 : 1, 5));
        inkL.ell(x + 2, 24 + len, 4, 3, inkM, (px, py) => S.step(py < 24 + len && px < x + 2 ? 4 : 2, 5));
        inkL.dot(x + 1, 25 + len - 2, inkM, 4);
      }
    }
    // the pages: two counter-rotating orbits, each a sheet with a lit edge, a fold shadow and a
    // written line; the far ones cooler and fainter, the near ones bright
    const fk = q.fk || 0;
    const drawP = (j, x, y, a, M, front) => {
      const Lr = front ? frontP : backP;
      const fore = 0.55 + 0.45 * Math.abs(Math.cos(a * 0.7 + j)); // some turn edge-on as they orbit
      Lr.save().translate(Math.round(x), Math.round(y)).rotate(a).scale(fore, 1);
      Lr.poly([[-6, -4], [4, -4], [6, -2], [6, 4], [-6, 4]], M, (px, py) => S.step(py < -2.5 || px < -4.5 ? M.n - 1 : px > 3 && py < 0 ? 1 : M.n - 2, M.n));
      Lr.line(-4, 0, 3, 0, q.tint === 'blank' ? M : lineM, q.tint === 'blank' ? M.n - 3 : 0);
      if (j % 3 === 0 && q.tint !== 'blank') Lr.line(-4, 2, 1, 2, lineM, 0);
      if (q.tint === 'amber' && j % 2) Lr.line(-6, 4, 6, 4, K.solid('#ff9040', { line: false }), 0);
      Lr.restore();
    };
    for (let j = 0; j < 18; j++) {
      const ringI = j < 9 ? 0 : 1, i = j % 9;
      const r = (ringI ? 72 : 58) * (q.rr || 1), dir = ringI ? -1 : 1, off = ringI ? 0.35 : 0;
      const a = off + i * (Math.PI * 2 / 9) + dir * (q.rot || 0) * (Math.PI * 2 / 9);
      const fl = q.fl == null ? 0.62 : q.fl;
      let x = Math.cos(a) * r, y = Math.sin(a) * r * fl, ang = a * 0.5 + i;
      let front = Math.sin(a) > 0;
      const F = fk > 0 ? formPos(q.form, j, q) : null;
      if (F) {
        const sk = Math.min(1, Math.max(0, fk * 1.25 - (j / 17) * 0.25));
        x = x + (F[0] - x) * sk; y = y + (F[1] - y) * sk; ang = ang + (F[2] - ang) * sk;
        if (sk > 0.5) front = true;
      }
      if (q.drift > 0 && j === 0) { x = x + (-96 - x) * q.drift; y = y + (-30 - y) * q.drift; ang = Math.sin((q.rot || 0) * 3) * 0.6; front = true; }
      drawP(j, x, y, ang, front ? page : page2, front);
    }
    S.outline(backP); S.outline(frontP); S.outline(hollow); S.outline(inkL);
    backP.fade(0.78);
    S.cast(frontP, hollow, 2, 3, 1);
    // the marks it took, rising off the hollow as short strokes (more when a knot comes loose)
    const nm = Math.round(6 * (q.marks == null ? 1 : q.marks));
    for (let i = 0; i < nm; i++) {
      const k = (((q.mph || 0) / 8) + i / Math.max(1, nm)) % 1;
      const x = Math.round(Math.sin(i * 2.1) * 30 * (1 - k)), y = Math.round(-34 * hr - k * 56);
      fx.rect(x, y, 2, 4 - (i % 2), markM, k < 0.6 ? 1 : 0);
      if (i % 2) fx.dot(x + 2, y + 1, markM, 0);
    }
    fx.fade(0.9);
    const out = aura.over(backP).over(hollow).over(inkL);
    S.rim(out, { w: 2 });
    return out.over(frontP).over(fx);
  }
  const HB = { hr: 1, swell: 0, eye: 1, eyeR: 1, er: 0, eyeGlow: false, rot: 0, rr: 1, fl: 0.62, form: 'orbit', fk: 0, tint: 'pale', marks: 1, mph: 0, ink: 0, ember: 0, drift: 0 };
  const hushIdle = [];
  for (let f = 0; f < 10; f++) {
    // a slow turning (1.4 s), the eye breathing, the edge rippling
    hushIdle.push({ rot: f / 10, er: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1][f], swell: Math.sin((f / 10) * Math.PI * 2) * 0.3 + 0.3, mph: f * 0.8 });
  }
  const hk = (from, ...st) => CB.keys(Object.assign({}, HB, from), ...st);
  // pose builders for the borrowed moves (form in, hold, fly / release, return)
  const formIn = (form, extra, n) => hk({}, [Object.assign({ form, fk: 0.5, rot: 0.3, eye: 0.7 }, extra || {}), n || 2, E.out], [Object.assign({ form, fk: 1, rot: 0.6, eye: 0.5 }, extra || {}), n || 2, E.io]);
  const formOut = (form, extra) => hk(Object.assign({ form, fk: 1, rot: 0.6, eye: 0.5 }, extra || {}), [Object.assign({ form, fk: 0.4, rot: 0.9, eye: 0.85 }), 2, E.io], [{ form, fk: 0, rot: 1.2, eye: 1, tint: 'pale', ember: 0, eyeGlow: false, hr: 1, swell: 0.3, rr: 1, fl: 0.62 }, 2, E.out]);
  const hushActs = {
    // strike: a lance of pages, aimed, thrown (the lance itself is the effect), its orbit refilling
    'prep:strike': formIn('stack', { eye: 0.45, hr: 0.96 }),
    'exec:strike': hk({ form: 'stack', fk: 1, rot: 0.6, eye: 0.45, hr: 0.96 }, [{ fk: 0.6, eye: 0.3, hr: 1.06, swell: 0.8, rot: 0.8 }, 1, E.in], [{ form: 'orbit', fk: 0, rr: 0.8, eye: 0.35, hr: 1.08, swell: 1, rot: 1 }, 1, E.out], [{ rr: 0.86, rot: 1.2 }, 1, E.lin]),
    'recover:strike': hk({ rr: 0.86, eye: 0.35, hr: 1.08, swell: 1, rot: 1.2 }, [{ rr: 0.95, eye: 0.7, hr: 1.02, swell: 0.6, rot: 1.4 }, 2, E.io], [{ rr: 1, eye: 1, hr: 1, swell: 0.3, rot: 1.6 }, 2, E.out]),
    // sweep: the pages fan into a broad arc, and it is flung across the party
    'prep:sweep': formIn('fan', { eye: 0.6, fl: 0.5 }),
    'exec:sweep': hk({ form: 'fan', fk: 1, rot: 0.6, eye: 0.6, fl: 0.5 }, [{ fk: 0.4, rr: 1.3, hr: 1.05, swell: 0.8, rot: 1 }, 1, E.in], [{ form: 'orbit', fk: 0, rr: 0.7, hr: 1.1, swell: 1, rot: 1.4, eye: 0.4 }, 1, E.out], [{ rr: 0.75, rot: 1.7 }, 1, E.lin]),
    'recover:sweep': hk({ rr: 0.75, hr: 1.1, swell: 1, rot: 1.7, eye: 0.4, fl: 0.5 }, [{ rr: 0.92, hr: 1.03, swell: 0.6, rot: 2, eye: 0.8, fl: 0.58 }, 2, E.io], [{ rr: 1, hr: 1, swell: 0.3, rot: 2.3, eye: 1, fl: 0.62 }, 2, E.out]),
    // silence: the eye shuts to a line, the hollow swells, the pages stop where they are
    'cast:silence': hk({}, [{ eye: 0.4, hr: 1.06, swell: 0.6, rot: 0.1 }, 2, E.out], [{ eye: 0, hr: 1.16, swell: 1.4, rot: 0.12, marks: 0.3 }, 2, E.io], [{ eye: 0, hr: 1.2, swell: 1.6, rot: 0.12, marks: 0 }, 2, E.lin]),
    'recover:silence': hk({ eye: 0, hr: 1.2, swell: 1.6, rot: 0.12, marks: 0 }, [{ eye: 0.5, hr: 1.08, swell: 0.8, rot: 0.3, marks: 0.5 }, 2, E.io], [{ eye: 1, hr: 1, swell: 0.3, rot: 0.6, marks: 1 }, 2, E.out]),
    // shroud: the pages go blank and scatter wide, then drift
    'cast:shroud': hk({}, [{ tint: 'blank', form: 'scatter', fk: 0.4, eye: 0.6, rot: 0.3 }, 2, E.out], [{ tint: 'blank', form: 'scatter', fk: 1, eye: 0.4, rot: 0.5, swell: 1 }, 2, E.io], [{ fk: 1, rot: 0.7 }, 2, E.lin]),
    'recover:shroud': formOut('scatter', { tint: 'blank', eye: 0.4, swell: 1 }),
    // mend: the pages gather low by its knots and stitch one shut
    'cast:mend': formIn('knot', { eye: 0.6 }, 3),
    'recover:mend': formOut('knot', { eye: 0.6 }),
    // heat: the pages char amber and spin fast, the rim smoulders
    'cast:heat': hk({}, [{ tint: 'amber', ember: 0.4, rot: 0.6, eye: 0.8 }, 2, E.in], [{ ember: 0.9, rot: 1.6, hr: 1.06, swell: 0.8, eyeGlow: true }, 2, E.lin], [{ ember: 1, rot: 2.6, swell: 1 }, 2, E.lin]),
    'recover:heat': hk({ tint: 'amber', ember: 1, rot: 2.6, hr: 1.06, swell: 1, eyeGlow: true, eye: 0.8 }, [{ ember: 0.5, rot: 3.1, hr: 1.02 }, 2, E.out], [{ tint: 'pale', ember: 0, rot: 3.4, hr: 1, swell: 0.3, eyeGlow: false, eye: 1 }, 2, E.out]),
    // gust: the pages whirl into a vortex (the vortex blows across you as an effect)
    'prep:gust': formIn('vortex', { eye: 0.5, rot: 0.6 }),
    'exec:gust': hk({ form: 'vortex', fk: 1, rot: 0.6, eye: 0.5 }, [{ rot: 1.2, swell: 1, hr: 1.05 }, 1, E.lin], [{ rot: 1.8, fk: 0.7 }, 1, E.lin], [{ rot: 2.4, fk: 0.3, eye: 0.4 }, 1, E.lin], [{ form: 'orbit', fk: 0, rot: 2.8, rr: 0.8 }, 1, E.out]),
    'recover:gust': hk({ rot: 2.8, rr: 0.8, swell: 1, hr: 1.05, eye: 0.4 }, [{ rot: 3.1, rr: 0.92, swell: 0.6, eye: 0.8 }, 2, E.io], [{ rot: 3.3, rr: 1, swell: 0.3, hr: 1, eye: 1 }, 2, E.out]),
    // charge: the pages pull in tight, the eye burns, the hollow contracts
    'cast:charge': hk({}, [{ form: 'tight', fk: 0.5, rot: 0.4, hr: 0.92, eye: 0.9 }, 2, E.out], [{ form: 'tight', fk: 1, rot: 1, hr: 0.86, eyeGlow: true, eye: 1, eyeR: 1.15 }, 2, E.io], [{ rot: 1.6, hr: 0.84 }, 2, E.lin]),
    'recover:charge': formOut('tight', { hr: 0.86, eyeGlow: true, eyeR: 1.15 }),
    // lie / mirror: the pages square into a pane in front of it
    'prep:lie': formIn('pane', { eye: 0.55 }),
    'exec:lie': hk({ form: 'pane', fk: 1, rot: 0.6, eye: 0.55 }, [{ eye: 0.7, rot: 0.7 }, 2, E.io], [{ fk: 0.6, eye: 0.5, rot: 0.8 }, 2, E.io]),
    'recover:lie': formOut('pane', { fk: 0.6, eye: 0.5 }),
    'prep:mirror': formIn('pane', { eye: 0.5, tint: 'frost' }),
    'exec:mirror': hk({ form: 'pane', fk: 1, rot: 0.6, eye: 0.5, tint: 'frost' }, [{ eyeGlow: true, eye: 0.8 }, 1, E.lin], [{ tint: 'blank', eyeGlow: true }, 1, E.lin], [{ fk: 0.7, tint: 'frost', eyeGlow: false }, 2, E.io]),
    'recover:mirror': formOut('pane', { fk: 0.7, tint: 'frost' }),
    // chill: the pages rime over, the orbits flatten, frost leaves the hollow
    'cast:chill': hk({}, [{ tint: 'frost', fl: 0.5, rot: 0.2, eye: 0.6 }, 2, E.out], [{ fl: 0.4, rr: 0.92, hr: 1.04, swell: 0.6, rot: 0.3, eye: 0.4 }, 2, E.io], [{ rr: 0.9, rot: 0.35 }, 2, E.lin]),
    'recover:chill': hk({ tint: 'frost', fl: 0.4, rr: 0.9, hr: 1.04, swell: 0.6, rot: 0.35, eye: 0.4 }, [{ fl: 0.52, rr: 0.96, rot: 0.6, eye: 0.7 }, 2, E.io], [{ tint: 'pale', fl: 0.62, rr: 1, hr: 1, swell: 0.3, rot: 0.9, eye: 1 }, 2, E.out]),
    // plea: the eye softens, and one page drifts out toward you
    'cast:plea': hk({}, [{ eye: 0.75, eyeR: 0.9, hr: 0.97, rot: 0.1, drift: 0.3 }, 2, E.out], [{ eye: 0.7, drift: 0.8, rot: 0.2, marks: 0.6 }, 2, E.io], [{ drift: 1, rot: 0.3 }, 2, E.lin]),
    'recover:plea': hk({ eye: 0.7, eyeR: 0.9, hr: 0.97, drift: 1, rot: 0.3, marks: 0.6 }, [{ drift: 0.3, rot: 0.5, eye: 0.85 }, 2, E.io], [{ drift: 0, rot: 0.7, eye: 1, eyeR: 1, hr: 1, marks: 1 }, 2, E.out]),
    // flood (signature): the hollow swells, ink wells out of it and pours; it drains back
    'prep:flood': hk({}, [{ hr: 1.08, swell: 0.8, eye: 0.6, ink: 0.2, rr: 1.08 }, 2, E.out], [{ hr: 1.18, swell: 1.4, eye: 0.4, ink: 0.5, rr: 1.14, rot: 0.2 }, 2, E.io], [{ hr: 1.22, swell: 1.6, eye: 0.3, ink: 0.7, rot: 0.3 }, 2, E.lin]),
    'exec:flood': hk({ hr: 1.22, swell: 1.6, eye: 0.3, ink: 0.7, rr: 1.14, rot: 0.3 }, [{ ink: 1, hr: 1.12, swell: 1.8, rot: 0.5 }, 1, E.in], [{ ink: 1, hr: 1.06, rot: 0.7 }, 1, E.lin], [{ ink: 0.9, hr: 1.02, rot: 0.9 }, 1, E.lin], [{ ink: 0.8, rot: 1.1 }, 1, E.lin]),
    'recover:flood': hk({ ink: 0.8, hr: 1.02, swell: 1.8, eye: 0.3, rr: 1.14, rot: 1.1 }, [{ ink: 0.4, swell: 1, eye: 0.6, rr: 1.06, rot: 1.3 }, 2, E.io], [{ ink: 0, swell: 0.3, eye: 1, rr: 1, rot: 1.5 }, 2, E.out]),
    // reactions
    recoil: hk({}, [{ hr: 0.9, swell: 1.4, rr: 1.15, eye: 0.3, rot: -0.1 }, 1, E.out], [{ hr: 1.04, swell: 0.8, rr: 1.05, eye: 0.6 }, 1, E.io], [{ hr: 0.98, swell: 0.5, rr: 1.0, eye: 0.85 }, 1, E.io], [{ hr: 1, swell: 0.3, eye: 1 }, 1, E.out]),
    release: hk({}, [{ marks: 2, mph: 1, eyeGlow: true, eye: 1, er: 2 }, 1, E.out], [{ marks: 2.4, mph: 2.4, hr: 0.97 }, 1, E.lin], [{ marks: 1.8, mph: 3.8, eyeGlow: false }, 1, E.lin], [{ marks: 1, mph: 5, hr: 1, er: 0 }, 1, E.out]),
    balk: hk({ form: 'stack', fk: 1, eye: 0.45, rot: 0.6 }, [{ fk: 0.3, rr: 1.2, eye: 0.9, swell: 1, rot: 0.3 }, 1, E.out], [{ form: 'orbit', fk: 0, rr: 1.05, rot: 0.1, eye: 0.7 }, 1, E.io], [{ rr: 0.98, rot: 0.2, swell: 0.5 }, 1, E.io], [{ rr: 1, eye: 1, swell: 0.3 }, 1, E.out]),
    settle: hk({}, [{ hr: 0.92, eye: 0.6, marks: 2, mph: 1, rot: 0.1 }, 1, E.out], [{ hr: 0.78, eye: 0.2, marks: 2.4, mph: 2.5, rr: 0.9, fl: 0.4, tint: 'blank' }, 1, E.io], [{ hr: 0.66, eye: 0, marks: 1.6, mph: 4, rr: 0.8, fl: 0.3 }, 1, E.io], [{ hr: 0.6, eye: 0, marks: 0.8, mph: 5, rr: 0.76, fl: 0.25 }, 1, E.out]),
    rest: hk({}, [{ eye: 0.5, rot: 0.05, swell: 0.2 }, 1, E.io], [{ eye: 0.3, rot: 0.1, swell: 0.1 }, 1, E.io], [{ eye: 0.3, rot: 0.15, swell: 0.1 }, 1, E.io], [{ eye: 0.6, rot: 0.2, swell: 0.2 }, 1, E.io]),
  };
  CB.rig('sa_hush', {
    w: 252, h: 252, ox: 126, oy: 120, ms: 140,
    bob: (t) => Math.sin(t / 900) * 4,
    base: HB, idle: hushIdle, acts: hushActs,
    keys: { strike: ['prep:strike', 3], sweep: ['prep:sweep', 3], silence: ['cast:silence', 5], shroud: ['cast:shroud', 4], mend: ['cast:mend', 5], heat: ['cast:heat', 5], gust: ['exec:gust', 1], charge: ['cast:charge', 4], lie: ['exec:lie', 1], mirror: ['exec:mirror', 1], chill: ['cast:chill', 4], plea: ['cast:plea', 4], flood: ['exec:flood', 0] },
    alias: { prep: ['cast:charge', 0, 4] },
    draw: drawHush,
  });

  // ---- deliveries (Normal-speed ms; see docs/battle/creatures_b.md) ---------------------------------
  const D = (kinds, fn) => CB.deliver('sa_hush', kinds, fn);
  D(['strike'], (a) => {
    const blk = CB.blocked(a);
    return CB.play(a, {
      key: 'key:strike', contact: 760, end: 1360,
      parts: [{ at: 0, act: 'prep:strike', d: 480 }, { at: 480, act: 'exec:strike', d: 320, travel: { to: a.aimed, peak: 0.1, arc: 0, shape: 'outback' } }, blk ? { at: 800, act: 'balk', d: 260 } : null, { at: blk ? 1060 : 800, act: 'recover:strike', d: blk ? 300 : 560 }].filter(Boolean),
      fx: [{ at: 520, name: 'cbPageLance', d: 560, p: { dx: -40, dy: 2, to: a.aimed, short: blk } }],
    });
  });
  D(['sweep'], (a) => CB.play(a, {
    key: 'key:sweep', contact: 800, end: 1520,
    parts: [{ at: 0, act: 'prep:sweep', d: 480 }, { at: 480, act: 'exec:sweep', d: 380 }, { at: 860, act: 'recover:sweep', d: 660 }],
    fx: [{ at: 560, name: 'cbPageFling', d: 820, p: { dx: -40, dy: 0, who: CB.targets(a) } }],
  }));
  D(['silence'], (a) => CB.play(a, {
    key: 'key:silence', contact: 820, end: 1440,
    parts: [{ at: 0, act: 'cast:silence', d: 880 }, { at: 880, act: 'recover:silence', d: 560 }],
    fx: [{ at: 460, name: 'cbToll', d: 680, p: { mode: 'mute', dx: 0, dy: 0, to: 'party' } }],
  }));
  D(['shroud'], (a) => CB.play(a, {
    key: 'key:shroud', contact: 820, end: 1440,
    parts: [{ at: 0, act: 'cast:shroud', d: 880 }, { at: 880, act: 'recover:shroud', d: 560 }],
    fx: [{ at: 380, name: 'cbPageFog', d: 900, p: { dy: 0 } }],
  }));
  D(['mend'], (a) => {
    const fv = a.fv || {};
    return CB.play(a, {
      key: 'key:mend', contact: 800, end: 1400,
      parts: [{ at: 0, act: 'cast:mend', d: 860 }, { at: 860, act: 'recover:mend', d: 540 }],
      fx: [{ at: 420, name: 'cbMend', d: 620, p: { dx: -6, dy: 70, i: fv.knots < fv.maxKnots ? Math.min(fv.maxKnots - 1, fv.knots) : null, col: '#eeeae0' } }],
    });
  });
  D(['heat'], (a) => CB.play(a, {
    key: 'key:heat', contact: 780, end: 1340,
    parts: [{ at: 0, act: 'cast:heat', d: 840 }, { at: 840, act: 'recover:heat', d: 500 }],
    fx: [{ at: 420, name: 'cbHeatWave', d: 720, p: { dy: 0, col: '#f08040' } }],
  }));
  D(['gust'], (a) => CB.play(a, {
    key: 'key:gust', contact: 900, end: 1640,
    parts: [{ at: 0, act: 'prep:gust', d: 480 }, { at: 480, act: 'exec:gust', d: 520 }, { at: 1000, act: 'recover:gust', d: 640 }],
    fx: [{ at: 560, name: 'cbPageGust', d: 860, p: { dx: -20, dy: 0, who: CB.targets(a) } }],
  }));
  D(['charge'], (a) => CB.play(a, {
    key: 'key:charge', contact: 800, end: 1360,
    parts: [{ at: 0, act: 'cast:charge', d: 860 }, { at: 860, act: 'recover:charge', d: 500 }],
    fx: [{ at: 260, name: 'cbGather', d: 720, p: { dy: 0, col: '#fff0c0' } }],
  }));
  D(['lie'], (a) => CB.play(a, {
    key: 'key:lie', contact: 760, end: 1340,
    parts: [{ at: 0, act: 'prep:lie', d: 420 }, { at: 420, act: 'exec:lie', d: 380 }, { at: 800, act: 'recover:lie', d: 540 }],
    fx: [{ at: 460, name: 'cbPane', d: 340, p: { dx: -52, dy: -4, to: a.aimed, smile: true } }],
  }));
  D(['mirror'], (a) => {
    const blk = CB.blocked(a);
    return CB.play(a, {
      key: 'key:mirror', contact: 780, end: 1380,
      parts: [{ at: 0, act: 'prep:mirror', d: 420 }, { at: 420, act: 'exec:mirror', d: 400 }, { at: 820, act: blk ? 'balk' : 'recover:mirror', d: 560 }],
      fx: [{ at: 460, name: 'cbMirror', d: 520, p: { dx: -52, dy: -4, to: a.aimed, short: blk } }],
    });
  });
  D(['chill'], (a) => {
    const blk = CB.blocked(a);
    return CB.play(a, {
      key: 'key:chill', contact: 760, end: 1320,
      parts: [{ at: 0, act: 'cast:chill', d: 820 }, blk ? { at: 820, act: 'balk', d: 240 } : null, { at: blk ? 1060 : 820, act: 'recover:chill', d: blk ? 260 : 500 }].filter(Boolean),
      fx: [{ at: 460, name: 'cbFrostBreath', d: 620, p: { dx: -30, dy: 4, to: a.aimed, short: blk } }],
    });
  });
  D(['plea'], (a) => CB.play(a, {
    key: 'key:plea', contact: 800, end: 1480,
    parts: [{ at: 0, act: 'cast:plea', d: 860 }, { at: 860, act: 'recover:plea', d: 620 }],
    fx: [{ at: 480, name: 'cbNote', d: 900, p: { dx: -96, dy: -30, to: 'party' } }],
  }));
  D(['flood'], (a) => CB.play(a, {
    key: 'key:flood', contact: 1040, end: 1960,
    parts: [{ at: 0, act: 'prep:flood', d: 600 }, { at: 600, act: 'exec:flood', d: 520 }, { at: 1120, act: 'recover:flood', d: 840 }],
    fx: [{ at: 660, name: 'cbFlood', d: 1060, p: { dx: 0, dy: 30, who: CB.targets(a), col: '#4a4870', col2: '#8a88b0', col3: '#2a2840' } }],
  }));
  D(['*'], (a) => CB.play(a, {
    key: 'key:charge', contact: 700, end: 1200,
    parts: [{ at: 0, act: 'cast:charge', d: 760 }, { at: 760, act: 'recover:charge', d: 440 }],
  }));

  CB.family('sa_hush', { anatomy: 'abstract boss: a hollow that swells and contracts, a ring eye that narrows and shuts, eighteen pages on two orbits that leave to form a lance, a fan, a pane, a vortex, a knot-stitch, a scatter, and return', palette: 'core #0a0a14, indigo #282846, edge #44466a in three stepped opacities (no dither), eye #f0ecff, pages #eeeae0 / #cfcadf (blank, amber, frost and ink tints for the borrowed moves)' });
})();
