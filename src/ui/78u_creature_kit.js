/* Creatures C — the art pass's creature kit (expansion P16b; AC-1, C-82; battle addendum §5, §9, §10; the rendering
 * standard in docs/battle/creatures_a.md). The creatures drawn on a borrowed family in the interim (F-36, F-93, F-104,
 * F-135) each get a drawing of their own here: an anatomy written as one rig function over a shared pose vocabulary,
 * so a creature keeps its own silhouette, materials and features in every pose, while how each kind of move is
 * performed (how a strike winds up, lands and recovers; how a sweep, a shroud or a plea plays; its timing and its
 * effect) is shared and tested once. Each creature is its own family on the Creatures A rig (RB.creaturesA.family),
 * so the enemy art, the sequencer and the audit treat it as every other family.
 *
 *   RB.creatureKit.define(art, {
 *     spec: { w, h, ox, oy, dy, ms, bob },   the canvas, its origin and the idle timing (RB.enemyArt.def)
 *     moves: ['strike', 'charge', …],         the kinds it performs (its intents; 'rest' is always there)
 *     fx: { strike: 'stoneDust', … },         the effect each kind leaves (defaults per kind below)
 *     travel: { strike: 0.24 },               how far a strike's approach goes (share of the gap)
 *     veil(o),                                for a shroud: the veil's colours over its knots
 *     draw(L, q, o, H, C),                    the drawing: q the pose (BASE ⊕ the frame), o the artOpts, C the kit
 *     audit: { anatomy, materials, moves } }) the family's audit record (its own words)
 *
 * The pose vocabulary every drawing reads (q):
 *   lean    the body toward the party (+) or away (−), as a share of a full lean
 *   lift    the body raised (+) or sunk (−), art px          squash  −1 … 1: stretched up … pressed down
 *   reach   0 … 1: its striking part out (a horn, a lash, a pole, a ram)
 *   open    0 … 1: a mouth, lid, shell, hold or hands opening   glow  0 … 2: its own light (1 at rest)
 *   eyes    'open' | 'narrow' | 'wide' | 'shut'                 tilt   radians, about its foot
 *   wing    −1 … 1: what it beats or flings (wings, sleeves, strings) back … forward
 *   puff    0 … 1: what it lets out (breath, steam, ink, water, scraps)   ph  a cycle 0 … 1 (ripples, beads, flicker)
 * Presentation only: nothing here reads or changes a rule; nothing is random (variation from fixed hashes). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.creatureKit = (function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const BASE = { lean: 0, lift: 0, squash: 0, reach: 0, open: 0, glow: 1, eyes: 'open', tilt: 0, wing: 0, puff: 0, ph: 0, sway: 0 };
  const DEFS = {};
  const FAMS = [];

  // ---- idle: a slow breath, a sway, one blink, its cycle turning --------------------------------------------------
  function idle(n, o) {
    o = o || {};
    const out = [];
    for (let f = 0; f < n; f++) {
      const a = (f / n) * Math.PI * 2;
      out.push({ squash: Math.sin(a) * (o.breath == null ? 0.035 : o.breath), lift: Math.round(Math.sin(a) * (o.bob == null ? 1 : o.bob)), sway: Math.sin(a + 0.8), ph: f / n, eyes: f === Math.floor(n * 0.65) ? 'shut' : f === Math.floor(n * 0.65) + 1 ? 'narrow' : 'open', wing: Math.sin(a) * (o.wing || 0), puff: o.puff ? (0.5 + Math.sin(a) * 0.5) * o.puff : 0 });
    }
    return out;
  }

  // ---- the shared choreography: each kind's frames as pose stops over BASE ---------------------------------------
  const S = {
    strike: {
      prep: [{ lean: -0.06, squash: 0.1, eyes: 'narrow' }, { lean: -0.14, squash: 0.2, reach: 0.12 }, { lean: -0.2, squash: 0.24, reach: 0.18, eyes: 'narrow' }],
      exec: [{ lean: 0.04, squash: 0.02, reach: 0.5, eyes: 'wide' }, { lean: 0.18, squash: -0.14, reach: 0.9, eyes: 'wide' }, { lean: 0.26, squash: -0.18, reach: 1, eyes: 'wide' }],
      impact: [{ lean: 0.3, squash: 0.1, reach: 1, glow: 1.25, eyes: 'narrow' }, { lean: 0.24, squash: 0.06, reach: 0.9 }],
      push: [{ lean: 0.1, reach: 0.6, eyes: 'narrow' }, { lean: 0.22, reach: 0.9, squash: 0.08 }],
      miss: [{ lean: 0.34, squash: -0.1, reach: 1, tilt: 0.12, eyes: 'wide' }],
      recover: [{ lean: 0.14, reach: 0.6 }, { lean: 0.05, reach: 0.25 }, { lean: 0, reach: 0, eyes: 'open' }],
      hover: [{}],
      deflect: [{ lean: -0.18, squash: -0.06, reach: 0.3, eyes: 'shut', tilt: -0.1 }, { lean: -0.08, reach: 0.1, tilt: -0.04 }, { lean: 0, tilt: 0 }],
    },
    sweep: {
      prep: [{ tilt: -0.07, lean: -0.08, wing: -0.4, eyes: 'narrow' }, { tilt: -0.15, lean: -0.12, wing: -0.85, reach: 0.2 }],
      exec: [{ tilt: 0.04, lean: 0.1, wing: 0.3, reach: 0.7, eyes: 'wide' }, { tilt: 0.16, lean: 0.18, wing: 1, reach: 1 }, { tilt: 0.2, lean: 0.16, wing: 1, reach: 1, puff: 0.6 }],
      recover: [{ tilt: 0.1, lean: 0.08, wing: 0.4, reach: 0.4, puff: 0.3 }, { tilt: 0, lean: 0, wing: 0, reach: 0, puff: 0, eyes: 'open' }],
    },
    charge: {
      prep: [{ squash: 0.14, glow: 1.2, eyes: 'narrow' }, { squash: 0.24, glow: 1.4 }],
      cast: [{ squash: 0.3, glow: 1.6, ph: 0.25 }, { squash: 0.34, glow: 1.75, ph: 0.5 }, { squash: 0.34, glow: 1.9, ph: 0.75, eyes: 'shut' }, { squash: 0.32, glow: 1.8, ph: 1 }],
      recover: [{ squash: 0.15, glow: 1.4, eyes: 'narrow' }, { squash: 0, glow: 1.1, eyes: 'open' }],
    },
    heat: {
      prep: [{ open: 0.3, glow: 1.3, eyes: 'narrow' }],
      cast: [{ open: 0.7, glow: 1.6, puff: 0.5, ph: 0.3 }, { open: 0.9, glow: 1.9, puff: 1, ph: 0.6 }, { open: 0.8, glow: 1.8, puff: 0.8, ph: 0.9 }],
      recover: [{ open: 0.3, glow: 1.3, puff: 0.3 }, { open: 0, glow: 1, puff: 0, eyes: 'open' }],
    },
    chill: {
      prep: [{ open: 0.3, lean: -0.08, glow: 0.8, eyes: 'narrow' }, { open: 0.5, lean: -0.12, glow: 0.7 }],
      exec: [{ open: 0.9, puff: 0.7, lean: 0.06, reach: 0.4 }, { open: 1, puff: 1, lean: 0.1, reach: 0.6, eyes: 'wide' }],
      recover: [{ open: 0.4, puff: 0.4, lean: 0.04, reach: 0.2 }, { open: 0, puff: 0, lean: 0, reach: 0, glow: 1, eyes: 'open' }],
    },
    shroud: {
      prep: [{ squash: 0.14, puff: 0.2, eyes: 'narrow' }, { squash: 0.2, puff: 0.3, open: 0.2 }],
      cast: [{ puff: 0.6, open: 0.5, squash: 0 }, { puff: 1, open: 0.8, squash: -0.1, eyes: 'shut' }, { puff: 1, open: 0.5, squash: -0.05 }],
      recover: [{ puff: 0.4, open: 0.2, eyes: 'narrow' }, { puff: 0, open: 0, squash: 0, eyes: 'open' }],
    },
    plea: {
      prep: [{ lean: 0.05, lift: 1, eyes: 'wide' }],
      cast: [{ lean: 0.1, lift: 2, open: 0.7, reach: 0.4 }, { lean: 0.12, lift: 2, open: 1, reach: 0.5, eyes: 'narrow' }, { lean: 0.12, lift: 2, open: 1, reach: 0.5 }],
      recover: [{ lean: 0.04, lift: 1, open: 0.4, reach: 0.2 }, { lean: 0, lift: 0, open: 0, reach: 0, eyes: 'open' }],
    },
    mend: {
      prep: [{ lean: -0.04, tilt: -0.05, eyes: 'narrow' }],
      cast: [{ reach: 0.4, tilt: -0.1, glow: 1.2 }, { reach: 0.6, tilt: -0.12, glow: 1.4, ph: 0.5 }, { reach: 0.5, glow: 1.3, ph: 1 }],
      recover: [{ reach: 0.2, tilt: -0.04 }, { reach: 0, tilt: 0, glow: 1, eyes: 'open' }],
    },
    flood: {
      prep: [{ squash: 0.2, open: 0.3, lean: -0.08, eyes: 'narrow' }],
      exec: [{ open: 1, puff: 0.8, squash: -0.15, lean: 0.12, eyes: 'wide' }, { open: 1, puff: 1, lean: 0.15 }],
      recover: [{ open: 0.4, puff: 0.3, lean: 0.05 }, { open: 0, puff: 0, lean: 0, squash: 0, eyes: 'open' }],
    },
    mirror: {
      prep: [{ glow: 1.3, tilt: -0.06, eyes: 'narrow' }],
      exec: [{ glow: 1.8, lean: 0.08, open: 0.6, ph: 0.5 }, { glow: 1.6, lean: 0.1, open: 0.8, ph: 1, eyes: 'wide' }],
      recover: [{ glow: 1.2, open: 0.3, lean: 0.04 }, { glow: 1, open: 0, lean: 0, tilt: 0, eyes: 'open' }],
    },
    gust: {
      prep: [{ wing: -0.8, lean: -0.1, eyes: 'narrow' }],
      exec: [{ wing: 1, lean: 0.1, puff: 0.6 }, { wing: -0.6, lean: 0.12, puff: 1 }, { wing: 1, lean: 0.1, puff: 0.8, eyes: 'wide' }],
      recover: [{ wing: 0.2, puff: 0.3, lean: 0.04 }, { wing: 0, puff: 0, lean: 0, eyes: 'open' }],
    },
    silence: {
      prep: [{ squash: 0.15, eyes: 'narrow', glow: 0.9 }],
      cast: [{ squash: 0.3, open: 0, glow: 0.6, eyes: 'shut' }, { squash: 0.36, glow: 0.5, eyes: 'shut' }],
      recover: [{ squash: 0.15, glow: 0.8, eyes: 'narrow' }, { squash: 0, glow: 1, eyes: 'open' }],
    },
  };
  // lie: drawn as a mirror's light turned sly (the same frames, its own effect)
  const REACT = {
    rest: [{ squash: 0.1, eyes: 'narrow' }, { squash: 0.16, eyes: 'shut', lift: -1 }, { squash: 0.16, eyes: 'shut', lift: -1 }, { squash: 0.1, eyes: 'narrow' }],
    recoil: [{ lean: -0.3, tilt: -0.14, eyes: 'shut', squash: -0.08 }, { lean: -0.16, tilt: -0.06, eyes: 'wide' }, { lean: -0.05, tilt: -0.02 }, { lean: 0, tilt: 0, eyes: 'open' }],
    release: [{ glow: 1.5, eyes: 'shut', puff: 0.3 }, { glow: 1.3, puff: 0.5 }, { glow: 1.1, puff: 0.2, eyes: 'narrow' }, { glow: 1, puff: 0, eyes: 'open' }],
    balk: [{ lean: 0.1, squash: 0.2, eyes: 'wide' }, { lean: -0.1, squash: 0.24, eyes: 'shut' }, { lean: 0, squash: 0.1, eyes: 'narrow' }],
    settle: [{ squash: 0.2, glow: 0.9, eyes: 'narrow' }, { squash: 0.4, glow: 0.7, eyes: 'shut', lift: -2 }, { squash: 0.5, glow: 0.6, eyes: 'shut', lift: -4 }],
  };
  const PHASES = { strike: ['prep', 'exec', 'recover'], chill: ['prep', 'exec', 'recover'], sweep: ['prep', 'exec', 'recover'], flood: ['prep', 'exec', 'recover'], mirror: ['prep', 'exec', 'recover'], gust: ['prep', 'exec', 'recover'] };
  function table(moves) {
    const t = {};
    const kinds = new Set(moves.map((k) => (k === 'lie' ? 'mirror' : k)).filter((k) => S[k]));
    kinds.add('strike'); // every creature can be struck back and recovers like it (deflect, hover)
    for (const k of kinds) for (const ph of Object.keys(S[k])) {
      const key = ['impact', 'push', 'miss'].includes(ph) ? 'exec.' + ph : ['hover', 'deflect'].includes(ph) ? 'recover.' + ph : ph + '.' + k;
      t[key] = S[k][ph];
    }
    for (const r of Object.keys(REACT)) t[r] = REACT[r];
    return t;
  }

  // ---- deliveries: each kind's timing and effect (the same shapes the families before used) ----------------------
  const FX = { strike: 'stoneDust', sweep: 'arc', charge: 'gather', heat: 'gather', chill: 'frostDust', shroud: 'mistRoll', plea: 'note', mend: 'mendThread', flood: 'tideWash', mirror: 'pane', lie: 'pane', gust: 'gust', silence: 'hushWave' };
  function deliveries(art, d) {
    const fx = Object.assign({}, FX, d.fx || {});
    const peakOf = (k, def) => (d.travel && d.travel[k] != null ? d.travel[k] : def);
    const who = (a) => (a.comp ? ['pc', 'comp'] : ['pc']);
    const fns = {
      strike(a) {
        const c = A.kit(a), oc = A.outcome(a), to = a.aimed, blocked = oc === 'ward' || oc === 'block';
        if (c.rd) { c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 300, 'strike@2').F(600, 'recover', 520, blocked ? 'deflect@0' : 'strike@0'); c.X(600, fx.strike, 380, { to }); return c.done(600, 1180); }
        const peak = peakOf('strike', 0.22) * (blocked ? 0.8 : 1);
        c.F(0, 'prep', 320, 'strike');
        c.F(320, 'exec', 280, 'strike', { to, peak, shape: 'out' });
        c.X(560, fx.strike, 420, { to, seal: blocked || oc === 'soft' });
        if (blocked) { c.F(600, 'recover', 480, 'deflect', { to, peak, shape: 'back' }); c.F(1080, 'recover', 100, 'hover'); return c.done(600, 1180); }
        c.F(600, 'exec', 130, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
        c.F(730, 'recover', 350, 'strike', { to, peak, shape: 'back' });
        c.F(1080, 'recover', 100, 'hover');
        return c.done(600, 1180);
      },
      sweep(a) {
        const c = A.kit(a), w = who(a);
        if (c.rd) { c.F(0, 'prep', 300, 'sweep@1').F(300, 'exec', 460, 'sweep@2').F(760, 'recover', 340, 'sweep@0'); c.X(340, fx.sweep, 520, { who: w, col: a.ctx && a.ctx.foeCol }); return c.done(600, 1150); }
        c.F(0, 'prep', 300, 'sweep');
        c.F(300, 'exec', 460, 'sweep', { to: 'party', peak: peakOf('sweep', 0.16), shape: 'out' });
        c.X(330, fx.sweep, 560, { who: w, col: a.ctx && a.ctx.foeCol });
        c.F(760, 'recover', 390, 'sweep', { to: 'party', peak: peakOf('sweep', 0.16), shape: 'back' });
        return c.done(600, 1150);
      },
      charge(a) {
        const c = A.kit(a);
        if (c.rd) { c.F(0, 'prep', 280, 'charge@1').F(280, 'cast', 640, 'charge@3').F(920, 'recover', 300, 'charge@0'); c.X(260, fx.charge, 640, {}); return c.done(760, 1220); }
        c.F(0, 'prep', 280, 'charge').F(280, 'cast', 640, 'charge').F(920, 'recover', 300, 'charge');
        c.X(260, fx.charge, 660, {});
        return c.done(760, 1220);
      },
      heat(a) {
        const c = A.kit(a);
        if (c.rd) { c.F(0, 'prep', 260, 'heat@0').F(260, 'cast', 640, 'heat@1').F(900, 'recover', 200, 'heat@1'); c.X(280, fx.heat, 380, {}); return c.done(640, 1100); }
        c.F(0, 'prep', 260, 'heat').F(260, 'cast', 640, 'heat').F(900, 'recover', 200, 'heat');
        c.X(280, fx.heat, fx.heat === 'echoRings' ? 600 : 380, fx.heat === 'echoRings' ? { warm: true } : {});
        return c.done(640, 1100);
      },
      chill(a) {
        const c = A.kit(a), to = a.aimed, oc = A.outcome(a);
        if (c.rd) { c.F(0, 'prep', 300, 'chill@1').F(300, 'exec', 320, 'chill@1').F(620, 'recover', 480, 'chill@0'); c.X(320, fx.chill, 300, { to }); return c.done(600, 1100); }
        c.F(0, 'prep', 300, 'chill');
        c.F(300, 'exec', 320, 'chill', { to, peak: 0.06, shape: 'out' });
        c.X(320, fx.chill, 320, { to, seal: oc === 'ward' || oc === 'block' });
        c.F(620, 'recover', 480, 'chill', { to, peak: 0.06, shape: 'back' });
        return c.done(600, 1100);
      },
      shroud(a) {
        const c = A.kit(a);
        if (c.rd) { c.F(0, 'prep', 300, 'shroud@1').F(300, 'cast', 600, 'shroud@1').F(900, 'recover', 450, 'shroud@0'); c.X(340, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {}); return c.done(760, 1350); }
        c.F(0, 'prep', 300, 'shroud').F(300, 'cast', 600, 'shroud').F(900, 'recover', 450, 'shroud');
        c.X(340, 'veilRelease', 760, {});
        c.X(700, 'mistRoll', 560, {});
        return c.done(760, 1350);
      },
      plea(a) {
        const c = A.kit(a);
        if (c.rd) { c.F(0, 'prep', 320, 'plea@0').F(320, 'cast', 640, 'plea@1').F(960, 'recover', 340, 'plea@0'); c.X(380, fx.plea, 760, { from: 'foe', to: 'party', fade: true }); return c.done(700, 1300); }
        c.F(0, 'prep', 320, 'plea').F(320, 'cast', 640, 'plea').F(960, 'recover', 340, 'plea');
        c.X(380, fx.plea, 760, { from: 'foe', to: 'party', fade: true });
        return c.done(700, 1300);
      },
      mend(a) {
        const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
        if (c.rd) { c.F(0, 'cast', 900, 'mend@1').F(900, 'recover', 300, 'mend@1'); c.X(240, 'mendThread', 620, { i }); return c.done(760, 1200); }
        c.F(0, 'prep', 240, 'mend').F(240, 'cast', 660, 'mend').F(900, 'recover', 300, 'mend');
        c.X(240, 'mendThread', 620, { i });
        return c.done(760, 1200);
      },
      flood(a) {
        const c = A.kit(a), w = who(a);
        if (c.rd) { c.F(0, 'prep', 320, 'flood@0').F(320, 'exec', 420, 'flood@1').F(740, 'recover', 460, 'flood@0'); c.X(400, fx.flood, 560, { who: w }); return c.done(620, 1200); }
        c.F(0, 'prep', 320, 'flood').F(320, 'exec', 420, 'flood').F(740, 'recover', 460, 'flood');
        c.X(400, fx.flood, 620, Object.assign({ who: w }, d.floodInk ? { ink: true } : {}));
        return c.done(620, 1200);
      },
      mirror(a) {
        const c = A.kit(a), to = a.aimed;
        if (c.rd) { c.F(0, 'prep', 300, 'mirror@0').F(300, 'exec', 340, 'mirror@1').F(640, 'recover', 460, 'mirror@0'); c.X(340, fx.mirror, 300, { to }); return c.done(620, 1150); }
        c.F(0, 'prep', 300, 'mirror');
        c.F(300, 'exec', 340, 'mirror', { to, peak: 0.08, shape: 'out' });
        c.X(340, fx[a.kind] || fx.mirror, 300, { to });
        c.F(640, 'recover', 460, 'mirror', { to, peak: 0.08, shape: 'back' });
        return c.done(620, 1150);
      },
      gust(a) {
        const c = A.kit(a);
        if (c.rd) { c.F(0, 'prep', 300, 'gust@0').F(300, 'exec', 480, 'gust@1').F(780, 'recover', 360, 'gust@0'); c.X(380, fx.gust, 600, { col: a.ctx && a.ctx.foeCol }); return c.done(640, 1140); }
        c.F(0, 'prep', 300, 'gust').F(300, 'exec', 480, 'gust').F(780, 'recover', 360, 'gust');
        c.X(380, fx.gust, 600, { col: a.ctx && a.ctx.foeCol });
        return c.done(640, 1140);
      },
      silence(a) {
        const c = A.kit(a);
        if (c.rd) { c.F(0, 'prep', 300, 'silence@0').F(300, 'cast', 600, 'silence@1').F(900, 'recover', 250, 'silence@0'); c.X(340, 'hushWave', 520, {}); return c.done(700, 1150); }
        c.F(0, 'prep', 300, 'silence').F(300, 'cast', 600, 'silence').F(900, 'recover', 250, 'silence');
        c.X(360, 'hushWave', 520, {});
        return c.done(700, 1150);
      },
    };
    fns.lie = fns.mirror;
    const kinds = new Set(d.moves.filter((k) => k !== 'rest'));
    for (const k of kinds) if (fns[k]) A.deliver(art, k, fns[k]);
    // anything else it is ever asked to perform: its strike's preparation and recovery
    A.deliver(art, '*', (a) => { const c = A.kit(a); c.F(0, 'prep', 320, 'strike@1').F(320, 'recover', 520, 'strike@0'); return c.done(600, 900); });
  }

  // ---- the kit a drawing works with --------------------------------------------------------------------------------
  const MCACHE = new Map();
  // a material (A.hmat) cached by its key
  function mat(key, base, o) { const k = key + '|' + base + '|' + JSON.stringify(o || {}); let M = MCACHE.get(k); if (!M) { M = A.hmat(base, o); MCACHE.set(k, M); } return M; }
  const mix = (a, b, k) => K.hex(K.mix(K.parse(a), K.parse(b), k));
  const hh = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  // eyes: two (or one) small lit eyes, shut as a line, narrow as a slit, wide with a highlight
  function eyes(L, pts, q, M, o) {
    o = o || {};
    const r = o.r || 2;
    for (const [x, y] of pts) {
      const X = Math.round(x), Y = Math.round(y);
      if (q.eyes === 'shut') { L.rect(X - r, Y, r * 2 + 1, 1, M, 0); continue; }
      const h = q.eyes === 'narrow' ? 1 : q.eyes === 'wide' ? r * 2 + 1 : r * 2;
      L.rect(X - r, Y - (h >> 1), r * 2 + 1, h, M, Math.min(M.n - 1, 2));
      L.dot(X - r + 1, Y - (h >> 1), M, M.n - 1);
    }
  }
  // tube(L, pts, M, o): a soft rounded form along a path of [x, y, r] (necks, feet, tentacles, limbs, tails), shaded as
  // one tube under the key light (no banding where the pieces join): o.lift raises it, o.gloss adds a wet streak along
  // its lit top, o.clip(x, y) keeps only part of it (the flat of a foot on the ground)
  function tube(L, pts, M, o) {
    o = o || {};
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y, r] of pts) { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); }
    let lx = NaN, ly = NaN, nd = 0, nr = 1, ndx = 0, ndy = 0;
    const near = (x, y) => {
      if (x === lx && y === ly) return;
      lx = x; ly = y;
      let best = 1e9;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1e-6;
        const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
        const ex = x - (a[0] + dx * t), ey = y - (a[1] + dy * t), d = Math.hypot(ex, ey), r = a[2] + (b[2] - a[2]) * t;
        if (d / r < best) { best = d / r; nd = d; nr = r; ndx = ex; ndy = ey; }
      }
    };
    const lift = o.lift || 0, gloss = o.gloss || 0;
    return L.fill(x0, y0, x1, y1, (x, y) => { near(x, y); return nd <= nr && (!o.clip || o.clip(x, y)); }, M, (x, y) => {
      near(x, y);
      const nx = ndx / nr, ny = ndy / nr, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const f = -(nx * 0.56 + ny * 0.68) + nz * 0.42;
      let v = 0.46 + f * 0.5 + lift;
      if (gloss && ny < -0.5 && nx > -0.55 && nx < 0.15) v += gloss;
      if (nx * nx + ny * ny > 0.74 && f < 0.02) v += 0.1;
      return Math.max(0, Math.min(0.999, v));
    });
  }
  // a standing figure (for the ghosts and the people made of something else): hips at (x, y), scale h; stride −1 … 1
  // (front foot forward +), lean (toward the party +), arms as angles from straight down (+ forward). Returns where
  // its head and hands are. Each part is a tube in M, so the figure keeps its volume in any material.
  function figure(Lr, M, P, back) {
    const h = P.h || 1, s = P.stride || 0, x = P.x, y = P.y, lean = P.lean || 0;
    const nx = x - lean * 12 * h, ny = y - 34 * h, hx = nx - lean * 4 * h, hy = ny - 11 * h;
    const legs = [[s, Lr], [-s, back || Lr]];
    for (const [st, L2] of legs) {
      const kx = x - st * 9 * h, ky = y + 17 * h - Math.abs(st) * 2 * h, fx = kx - st * 5 * h + (st < 0 ? 6 * h * -st : 0), fy = y + 36 * h - Math.max(0, -st) * 6 * h;
      tube(L2, [[x, y, 5.5 * h], [kx, ky, 4.6 * h], [fx, fy, 3.8 * h]], M, P.opt);
      tube(L2, [[fx, fy, 3.6 * h], [fx - 6 * h, fy + 1, 3 * h]], M, P.opt);
    }
    tube(Lr, [[x, y, 7.5 * h], [(x + nx) / 2, (y + ny) / 2, 8.5 * h], [nx, ny, 6.5 * h]], M, P.opt);
    const hands = [];
    for (const [a, L2] of [[P.armF || 0, Lr], [P.armB || 0, back || Lr]]) {
      const sx = nx + 2 * h, sy = ny + 4 * h, ex = sx - Math.sin(a) * 13 * h, ey = sy + Math.cos(a) * 13 * h, a2 = a + (P.bend || 0.5), wx = ex - Math.sin(a2) * 12 * h, wy = ey + Math.cos(a2) * 12 * h;
      tube(L2, [[sx, sy, 4.2 * h], [ex, ey, 3.6 * h], [wx, wy, 3 * h]], M, P.opt);
      hands.push([wx, wy]);
    }
    if (P.head !== false) Lr.ell(hx, hy, 8 * h, 9 * h, M, A.ball(hx - 3 * h, hy - 3 * h, 8 * h, 9 * h, P.opt));
    return { head: [hx, hy], neck: [nx, ny], hands, feet: y + 36 * h };
  }

  // a layer whose shades may also be written as a share of the ramp (0.55: just past the middle), as the scene painters
  // do; whole numbers stay ramp steps (pxkit). Layers made from it with like() take the same rule.
  function soft(L) {
    if (L._soft) return L;
    const fill = L.fill, like = L.like;
    L.fill = function (x0, y0, x1, y1, inside, M, sh) { return fill.call(this, x0, y0, x1, y1, inside, M, typeof sh === 'number' && sh % 1 !== 0 ? () => sh : sh); };
    L.like = function () { return soft(like.call(this)); };
    L._soft = true;
    return L;
  }
  // the drawing helpers handed to each creature
  const C = { A, K, mat, mix, hh, eyes, tube, figure, ball: A.ball, stone: A.stone, fpoly: A.fpoly, finish: A.finish, rim: A.rim, outline: A.outline, cast: A.cast, band: A.band, despeckle: A.despeckle, lerp: (a, b, k) => a + (b - a) * k, clamp: (v, a, b) => (v < a ? a : v > b ? b : v) };

  // ---- define a creature -------------------------------------------------------------------------------------------
  function define(art, d) {
    DEFS[art] = d;
    if (FAMS.indexOf(art) < 0) FAMS.push(art);
    const moves = (d.moves || []).slice();
    A.family(art, {
      spec: Object.assign({ w: 220, h: 220, ox: 110, oy: 120, ms: 180 }, d.spec),
      base: Object.assign({}, BASE, d.base || {}),
      idle: d.idle || idle(8, d.idleOpts),
      poseTable: Object.assign(table(moves), d.poses || {}),
      rig: (L, q, o, H, act, i) => d.draw(soft(L), q, o || {}, H, C, act, i),
      recoil: d.recoil || { push: 3 },
      veil: d.veil || null,
    });
    deliveries(art, Object.assign({}, d, { moves }));
    A.auditFamily(art, Object.assign({ anatomy: '', frame: [d.spec && d.spec.w || 220, d.spec && d.spec.h || 220], anchor: [d.spec && d.spec.ox || 110, d.spec && d.spec.oy || 120], idle: '8 drawings (a breath, a sway, a blink, its own cycle)', moves: {}, reactions: 'recoil, release, balk, settle and rest in its own drawing', kit: 'creatures C (P16b)' }, d.audit || {}));
  }
  // ---- its figure on the map (32 × 48, RB.sprites.customArt) ------------------------------------------------------
  // The same drawing at rest, reduced to the map's scale: each map pixel takes the colour most of its block holds
  // (no blending, so the pixel art stays crisp), feet on the frame's foot line, facing the way the figure faces.
  function overworld(art, o) {
    const memo = {};
    function reduce(flip) {
      const d = DEFS[art], spec = RB.enemyArt && RB.enemyArt.P[art];
      if (!d || !spec || !K.layer) return null;
      const q = Object.assign({}, BASE, idle(8, d.idleOpts)[0]);
      const L = soft(K.layer(spec.w, spec.h, spec.ox, spec.oy));
      const out = d.draw(L, q, o || {}, RB.enemyArt.H || {}, C, 'idle', 0) || L;
      const { w, h, px } = out;
      let x0 = w, x1 = -1, y0 = h, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((px[y * w + x] >>> 24) > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
      if (x1 < 0) return null;
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1, k = Math.max(bw / 30, bh / 44, 1), tw = Math.max(1, Math.round(bw / k)), th = Math.max(1, Math.round(bh / k));
      const cells = [];
      for (let ty = 0; ty < th; ty++) for (let tx = 0; tx < tw; tx++) {
        const sx0 = x0 + Math.floor(tx * k), sx1 = x0 + Math.max(Math.floor(tx * k) + 1, Math.floor((tx + 1) * k)), sy0 = y0 + Math.floor(ty * k), sy1 = y0 + Math.max(Math.floor(ty * k) + 1, Math.floor((ty + 1) * k));
        const count = new Map();
        let n = 0, opaque = 0;
        for (let y = sy0; y < sy1 && y < h; y++) for (let x = sx0; x < sx1 && x < w; x++) {
          n++;
          const v = px[y * w + x];
          if ((v >>> 24) < 60) continue;
          opaque++;
          const key = v >>> 0;
          count.set(key, (count.get(key) || 0) + 1);
        }
        if (!n || opaque / n < 0.4) continue;
        let best = 0, bc = 0;
        for (const [c, m] of count) if (m > bc) { bc = m; best = c; }
        const X = flip ? tw - 1 - tx : tx;
        cells.push([X, ty, [best & 255, (best >>> 8) & 255, (best >>> 16) & 255, best >>> 24]]);
      }
      return { tw, th, cells };
    }
    const get = (d) => { const flip = d === 'side' || d === 'right'; return memo[flip ? 1 : 0] || (memo[flip ? 1 : 0] = reduce(flip)); }; // (the battle drawing faces left)
    const draw = function (b, look, d, f) {
      const r = get(d);
      if (!r) return { outline: false };
      const ox = Math.round((32 - r.tw) / 2), oy = 45 - r.th + (f === 1 ? -1 : 0);
      for (const [x, y, c] of r.cells) b.rect(ox + x, oy + y, 1, 1, c);
      return null;
    };
    // the 16 × 24 sprite the world keeps as its key (and draws where the small sprite is used): every other pixel
    draw.small = function (c, look, d, f) {
      const r = get(d);
      if (!r) return;
      const ox = Math.round((32 - r.tw) / 2), oy = 45 - r.th + (f === 1 ? -1 : 0);
      for (const [x, y, col] of r.cells) {
        const X = ox + x, Y = oy + y;
        if (X % 2 || Y % 2) continue;
        c.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (col[3] / 255).toFixed(3) + ')';
        c.fillRect(X / 2, Y / 2, 1, 1);
      }
    };
    return draw;
  }
  return { define, FAMS, DEFS, BASE, S, REACT, idle, table, C, overworld };
})();
