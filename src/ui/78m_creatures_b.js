/* Creatures B — the shared kit for the Chapter 4–6 and Atlas battle families (battle
 * addendum §9, §10, §21.4; docs/battle/creatures_b.md). The families themselves live in
 * 78n_*.js … 78t_*.js and their effects in 84m_*.js.
 *
 * A family is a RIG: one drawing function draw(L, o, q, H, at) that paints the creature from a
 * small set of pose parameters q (a hinge angle, how far a door stands open, where the flame
 * sits, which way the ears point …). Its idle frames and every authored action frame are just
 * parameter sets, so the same anatomy — the same silhouette, palette, materials and anchor —
 * holds in every pose, and a pose is a real drawing (not the idle frame bent or squashed).
 *
 *   RB.creaturesB.rig(id, {
 *     w, h, ox, oy, dy, ms, seq, bob,      as RB.enemyArt.def (the canvas and the idle timing)
 *     base: { … },                         default pose parameters
 *     idle: [ { … }, … ],                  idle frames (overrides of base)
 *     acts: { 'exec:strike': [ … ], … },   authored action frames (overrides of base)
 *     keys: { strike: ['exec:strike', 2] } one held frame per move for reduced motion
 *     alias: { prep: 'prep:strike' }       an act drawn with another act's frames
 *     draw(L, o, q, H, at) })              at: { act, i, n, f } ('idle' acts carry f)
 *
 * Act names: the sequencer's own reactions use the seam's names (recoil, release, balk,
 * settle, rest); a family's deliveries use '<act>:<move>' names (prep:strike, exec:sweep,
 * cast:silence …) so each move has its own drawings. RB.enemyArt.drawPosed draws any act a
 * definition lists in `poses`; motion() treats an unknown act as stationary, so only the
 * cue's `travel` moves the creature bodily.
 *
 * Deliveries (RB.battleSeq.addDelivery) are built with play(a, plan): the plan lists the foe
 * cues (act, duration, travel), the effects, `contact` and `end`. Results never appear here:
 * the sequencer places every rules result at `contact`. With reduced motion a plan plays as
 * one held key pose without travel; its effects keep their cues and draw their still form.
 *
 * Presentation only: nothing here reads or changes the rules, and nothing is random (any
 * variation comes from RB.pxkit.hh hashes of fixed indices). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.creaturesB = (function () {
  'use strict';
  const EA = RB.enemyArt, K = RB.pxkit;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    lin: (k) => cl(k),
    out: (k) => 1 - Math.pow(1 - cl(k), 3),
    in: (k) => Math.pow(cl(k), 2),
    io: (k) => { k = cl(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    bell: (k) => Math.sin(Math.PI * cl(k)),
  };
  // a damped swing: the hinge settles after a blow (amplitude a, n half-swings, k 0..1)
  const damp = (a, k, n) => a * Math.cos(cl(k) * Math.PI * (n || 3)) * Math.pow(1 - cl(k), 1.6);

  // ---- pose parameter sets ---------------------------------------------------------------------
  // tween(a, b, n, ease): n frames from a to b (numbers interpolate; anything else switches at
  // the middle). Frames include b, not a (a is the previous key). keys(base, …stops) chains them.
  function mixQ(a, b, k) {
    const out = Object.assign({}, a);
    for (const key of Object.keys(b)) {
      const x = a[key], y = b[key];
      out[key] = typeof x === 'number' && typeof y === 'number' ? lerp(x, y, k) : (k >= 0.5 || x === undefined ? y : x);
    }
    return out;
  }
  function tween(a, b, n, ease) {
    const f = ease || E.io, out = [];
    for (let i = 1; i <= n; i++) out.push(mixQ(a, b, f(i / n)));
    return out;
  }
  // keys(start, [q, n, ease], [q, n, ease] …) → the frames after `start`
  function keys(start, ...stops) {
    let cur = start;
    const out = [];
    for (const [q, n, ease] of stops) {
      const to = Object.assign({}, cur, q);
      out.push(...tween(cur, to, n, ease));
      cur = to;
    }
    return out;
  }

  // ---- rigs ------------------------------------------------------------------------------------
  const RIGS = {};
  // The sequencer's reactions (recoil, release, balk, prep, rest, settle) step through a family's
  // authored frames by progress; with reduced motion each holds one frame (index; −1 = the last).
  // The frame cache does not know the setting, so the families' caches are cleared when it changes
  // (checked as each battle enters and each round becomes calm; see onScene).
  const HOLD = { recoil: 0, release: 1, balk: 1, prep: -1, rest: 1, settle: -1 };
  const reduced = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
  let seenReduced = null;
  function syncReduced() {
    const r = reduced();
    if (seenReduced !== null && r !== seenReduced) for (const id of Object.keys(RIGS)) EA.def(id, EA.P[id]);
    seenReduced = r;
  }
  function rig(id, spec) {
    const base = spec.base || {};
    const mk = (ov) => Object.assign({}, base, ov || {});
    const idle = (spec.idle || [{}]).map(mk);
    const acts = {};
    for (const a of Object.keys(spec.acts || {})) acts[a] = spec.acts[a].map(mk);
    // aliases: an act drawn with another act's frames (the sequencer's generic 'prep', used when a
    // move is answered before it lands, borrows the family's usual wind-up), optionally a slice
    for (const a of Object.keys(spec.alias || {})) {
      const [src, from, to] = [].concat(spec.alias[a]);
      if (!acts[src]) throw new Error('creaturesB: ' + id + ' alias ' + a + ' names a missing act ' + src);
      acts[a] = acts[src].slice(from || 0, to == null ? undefined : to);
    }
    for (const kn of Object.keys(spec.keys || {})) {
      const [a, i] = spec.keys[kn];
      if (!acts[a]) throw new Error('creaturesB: ' + id + ' key ' + kn + ' names a missing act ' + a);
      acts['key:' + kn] = [acts[a][Math.min(i, acts[a].length - 1)]];
    }
    const poses = {};
    for (const a of Object.keys(acts)) poses[a] = acts[a].length;
    const R = { id, spec, base, idle, acts, poses };
    RIGS[id] = R;
    return EA.def(id, {
      w: spec.w, h: spec.h, ox: spec.ox, oy: spec.oy, dy: spec.dy || 0, ms: spec.ms || 140, seq: spec.seq || null,
      frames: idle.length, bob: spec.bob || null, motion: spec.motion || undefined, poseMotion: spec.poseMotion || 'travel',
      build: (L, f, o, H) => spec.draw(L, o || {}, idle[f] || idle[0], H, { act: 'idle', i: f, n: idle.length, f }),
      poses,
      pose: (L, act, i, n, o, H, side) => {
        const fr = acts[act] || [idle[0]];
        // reduced motion: the sequencer's own reactions hold one drawing (their meaning — knocked,
        // loosening, balked, waiting, settled — without stepping through poses)
        if (HOLD[act] != null && reduced()) i = HOLD[act] < 0 ? fr.length - 1 : Math.min(fr.length - 1, HOLD[act]);
        return spec.draw(L, o || {}, fr[Math.max(0, Math.min(fr.length - 1, i))], H, { act, i, n: fr.length, side });
      },
      rig: R,
    });
  }

  // ---- deliveries --------------------------------------------------------------------------------
  // plan: { parts: [{ at, act, d, travel?, hold? }], fx: [{ at, name, d, p }], contact, end, key }
  // → { cues, contact, end } for RB.battleSeq.addDelivery. `key` is the move's held pose for
  // reduced motion (one still drawing for the whole move; no travel).
  function play(a, plan) {
    const rd = !!(a.ctx && a.ctx.reduce);
    const cues = [];
    const base = { dir: a.dir, family: a.fam };
    if (rd) {
      const key = plan.key || (plan.parts[plan.parts.length - 1] || {}).act;
      cues.push(a.foeCue(Object.assign({}, base, { at: 0, act: key, d: Math.max(plan.contact + 380, plan.end - 140) })));
    } else {
      for (const p of plan.parts) {
        const c = Object.assign({}, base, p);
        if (!c.travel) delete c.travel;
        cues.push(a.foeCue(c));
      }
    }
    for (const f of plan.fx || []) cues.push({ at: f.at, type: 'fx', name: f.name, d: f.d, p: Object.assign({ foe: a.me }, f.p || {}) });
    return { cues, contact: plan.contact, end: plan.end };
  }
  // the target(s) a move reaches, for effects: a Strike's actual target, or the party
  const targets = (a) => (a.fam === 'strike' ? [a.aimed] : a.comp ? ['pc', 'comp'] : ['pc']);
  // a creature's flame / body colour (artOpts.col through the sequencer's context)
  const colOf = (a, dflt) => (a.ctx && a.ctx.foeCol) || dflt;
  // register one function for several move kinds of a family (the sequencer, 82_battle_seq.js,
  // loads after these files: registrations wait until flush(), called from 84m_creatures_b_fx.js)
  const PENDING = [];
  function deliver(art, kinds, fn) { PENDING.push([art, kinds, fn]); flush(); }
  function flush() {
    if (!RB.battleSeq || !RB.battleSeq.addDelivery) return false;
    while (PENDING.length) {
      const [art, kinds, fn] = PENDING.shift();
      for (const k of kinds) RB.battleSeq.addDelivery(art, k, fn);
    }
    return true;
  }
  // Ward meets a Strike (a.wardBlock): the approach stops short at the seal raised in front of
  // the target and the creature is thrown back (its balk). Returns the travel scale and parts.
  const blocked = (a) => !!(a.countered && a.wardBlock);

  // ---- prewarm (§21.4) ----------------------------------------------------------------------------
  // While you choose (the presentation is calm), the frames each creature will need for the move
  // it has telegraphed are built in small slices (≤ 6 ms each, spaced out), so its performance does
  // not stall on first use. Only the encounter's own creatures and their telegraphed moves; the
  // frames go into RB.enemyArt's bounded cache (140 canvases, least recently used out first).
  const warm = { q: [], timer: null, built: 0, ms: 0, runs: 0 };
  let warmCv = null;
  function pump() {
    warm.timer = null;
    const t0 = performance.now();
    while (warm.q.length && performance.now() - t0 < 6) {
      const job = warm.q.shift();
      const a = performance.now();
      try { job(); } catch (err) { /* a frame that cannot be built now is built when drawn */ }
      warm.ms += performance.now() - a; warm.built++;
    }
    if (warm.q.length) warm.timer = setTimeout(pump, 24);
  }
  function stopWarm() { warm.q.length = 0; if (warm.timer) { clearTimeout(warm.timer); warm.timer = null; } }
  // queue the frames of creature `art` (options o) for the move `kind` (and its reactions)
  function warmFor(art, o, kind, still) {
    const R = RIGS[art];
    if (!R || typeof document === 'undefined') return 0;
    if (!warmCv) { warmCv = document.createElement('canvas'); warmCv.width = warmCv.height = 1; }
    const c = warmCv.getContext('2d');
    const names = still ? ['key:' + kind] : Object.keys(R.poses).filter((a) => a.endsWith(':' + kind) && !a.startsWith('key:')).concat(['prep', 'balk', 'recoil', 'release']);
    let n = 0;
    for (const act of names) {
      const cnt = R.poses[act];
      if (!cnt) continue;
      for (let i = 0; i < cnt; i++) { warm.q.push(() => EA.drawPosed(c, art, 0, o, 0, 0, 1, false, { act, k: (i + 0.5) / cnt, dir: { x: -0.8, y: 0.6 } })); n++; }
    }
    return n;
  }
  function onScene(e) {
    if (!e || e.scope !== 'battle') return;
    if (e.phase === 'exit') { stopWarm(); return; }
    if (e.phase !== 'enter' && e.phase !== 'calm') return;
    syncReduced();
    const C = RB.combat, st = C && C.state && C.state();
    if (!st || !C.members) return;
    const still = !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
    const ids = C.members();
    let n = 0;
    ids.forEach((id, i) => {
      const d = RB.content && RB.content.enemies[id], f = st.foes && st.foes[i];
      if (!d || !f || f.knots <= 0 || !f.intent) return;
      n += warmFor(d.art, d.artOpts || {}, f.intent.kind, still);
    });
    if (n) { warm.runs++; if (!warm.timer) warm.timer = setTimeout(pump, 60); }
  }
  if (RB.bus && RB.bus.on) RB.bus.on('present:scene', (e) => { try { onScene(e); } catch (err) { /* cosmetic */ } });
  const warmStats = () => ({ queued: warm.q.length, built: warm.built, ms: +warm.ms.toFixed(1), runs: warm.runs, active: !!warm.timer });

  // ---- audit (docs/battle/creatures_b.md) --------------------------------------------------------
  // Every enemy that uses one of these families has a row: its disposition and the reasoning
  // the record keeps. Filled in by each family file; checked by tests/unit/creatures_b.test.mjs.
  const FAMILIES = ['sb_snowfox', 'lantern', 'sb_frostlamp', 'lf_conduit', 'bell', 'lf_keeper', 'hush', 'sa_hush', 'fox', 'atlas_cartographer', 'spirit'];
  const AUDIT = {};
  const FAMILY = {};
  function family(id, rec) { FAMILY[id] = rec; }
  function audit(enemyId, rec) { AUDIT[enemyId] = rec; }

  // Estimated resident pixels of one family's cached frames (w × h × 4 × frames): every idle
  // frame plus every authored action frame (one side), as an upper bound — the shared frame
  // cache (RB.enemyArt, 140 canvases) holds far fewer at once.
  function budget(id) {
    const R = RIGS[id], S = EA.P[id];
    if (!S) return null;
    const idle = (S.seq ? new Set(S.seq).size : S.frames || 1);
    let acts = 0;
    if (R) for (const a of Object.keys(R.poses)) acts += R.poses[a];
    const px = S.w * S.h * 4;
    return { w: S.w, h: S.h, idle, acts, bytesIdle: px * idle, bytesAll: px * (idle + acts) };
  }

  // ---- the restyle kit (docs/battle/creatures_b.md, "Restyle standard") ---------------------------
  // The families draw with RB.pxkit layers; these helpers give them one shared rendering standard:
  //  - ramps: 4–7 tones per material, a wide value range, hue moving toward violet-blue in the
  //    shadows (and more saturated) and toward warm yellow in the lights (ramp, or hand-picked);
  //  - outlines: every material's outline is its own darkest tone pushed toward navy/violet (a
  //    colour, never black), a little lighter on edges that face the light (mat);
  //  - light: one key light from the upper left (lam), shading quantised into a few wide bands
  //    (sph, cyl, facet), never a smooth gradient; a cool rim light down the right-hand edges
  //    (rim); cast shadows where a near part overlaps a far one (cast);
  //  - clusters: fur and cloth break the band edges into strand-shaped clusters (strands), and
  //    single stray pixels are folded into their neighbours (clean);
  //  - metal: hard bands with a near-white specular streak and a dark reflected band (cyl), and
  //    lit edges picked out by a bright line inside the outline (lit).
  // Everything is deterministic (hashes of fixed coordinates), cached by the frame cache.
  const S = (function () {
    const MATS = K.MATS;
    const LK = (() => { const v = [-0.6, -0.7, 0.4]; const n = Math.hypot(v[0], v[1], v[2]); return v.map((a) => a / n); })();
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const hslOf = (c) => { const p = K.parse(c); return K.rgb2hsl(p[0], p[1], p[2]); };
    const fromHsl = (h, s, l) => K.hex(K.hsl2rgb(h, clamp(s, 0, 1), clamp(l, 0.02, 0.98)));
    const toward = (h, t, deg) => { const d = ((t - h + 540) % 360) - 180; return h + clamp(d, -deg, deg); };
    const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
    // n tones dark → light around `base` (at index `at`): o.lo / o.hi the darkest and lightest
    // lightness, o.cool / o.warm the hues the shadows and lights lean toward (o.cs / o.ws: how far)
    function ramp(base, o) {
      o = o || {};
      const n = o.n || 6, at = o.at != null ? o.at : Math.round((n - 1) * 0.55);
      const [h, s, l] = hslOf(base);
      const lo = o.lo != null ? o.lo : Math.max(0.08, l * 0.26), hi = o.hi != null ? o.hi : Math.min(0.95, l + (1 - l) * 0.72);
      const cool = o.cool == null ? 250 : o.cool, warm = o.warm == null ? 48 : o.warm;
      const cs = o.cs == null ? 40 : o.cs, ws = o.ws == null ? 24 : o.ws;
      const grey = s < 0.1;
      const out = [];
      for (let i = 0; i < n; i++) {
        let H = h, Sx = s, Lx = l;
        if (i < at) {
          const k = (at - i) / Math.max(1, at);
          Lx = l + (lo - l) * k;
          if (grey) { H = cool; Sx = s + (o.gs || 0.16) * k; } else { H = toward(h, cool, cs * k); Sx = Math.min(0.9, s * (1 + 0.3 * k) + 0.08 * k); }
        } else if (i > at) {
          const k = (i - at) / Math.max(1, n - 1 - at);
          Lx = l + (hi - l) * k;
          if (grey) { H = warm; Sx = s + 0.08 * k; } else { H = toward(h, warm, ws * k); Sx = s * (1 - 0.2 * k); }
        }
        out.push(fromHsl(H, Sx, Lx));
      }
      return out;
    }
    // the outline tone of a ramp: its darkest tone pushed darker and toward navy/violet
    function deep(c, k) {
      const [h, s, l] = hslOf(c);
      return fromHsl(s < 0.1 ? 252 : toward(h, 256, 46), clamp(s * 0.7 + 0.28, 0.3, 0.72), Math.min(l * 0.55, k == null ? 0.12 : k));
    }
    // a material from hand-picked (or ramp-made) tones: coloured outline, lighter on lit edges;
    // o.rim: the cool back-light tone used by rim(); o.alpha: translucent tones
    function mat(cols, o) {
      o = o || {};
      const al = o.alpha != null ? (o.alpha | 0).toString(16).padStart(2, '0') : '';
      const cs = cols.map((c) => (al ? K.hex(K.parse(c)) + al : c));
      const line = o.line === false ? false : o.line || deep(cols[0], o.deep);
      const M = K.mat(null, { cols: cs, at: o.at != null ? o.at : Math.round((cols.length - 1) * 0.55), line, lineLit: o.lineLit || (line ? mixh(line, cols[Math.min(1, cols.length - 1)], o.litk == null ? 0.38 : o.litk) : undefined) });
      if (o.rim) M.rim = K.pack(K.parse(o.rim).map((v, i) => (i === 3 && al ? parseInt(al, 16) : v)));
      return M;
    }
    // ---- shading: functions of local coordinates that return a ramp step (as 0..1 for fill)
    const T = { 2: [0.15], 3: [-0.1, 0.5], 4: [-0.25, 0.22, 0.68], 5: [-0.38, 0.02, 0.42, 0.8], 6: [-0.48, -0.16, 0.16, 0.5, 0.84], 7: [-0.55, -0.28, 0.0, 0.3, 0.6, 0.86] };
    const band = (lam, t) => { let i = 0; while (i < t.length && lam > t[i]) i++; return i; };
    const step = (i, n) => (clamp(i, 0, n - 1) + 0.5) / n;
    // the key light's term for a surface normal
    const lam = (nx, ny, nz) => nx * LK[0] + ny * LK[1] + nz * LK[2];
    // an ellipsoid (rx, ry) lit by the key light, quantised into n tones; o.bias raises or lowers
    // the light; o.jit(x, y) breaks the band edges (strands); o.t custom thresholds
    function sph(cx, cy, rx, ry, n, o) {
      o = o || {};
      const t = o.t || T[n], jit = o.jit, bias = o.bias || 0, flat = o.flat == null ? 1 : o.flat;
      return (x, y) => {
        const nx = (x - cx) / rx, ny = (y - cy) / ry, d = Math.min(1, nx * nx + ny * ny);
        const nz = Math.sqrt(1 - d) * flat + (1 - flat) * 0.7;
        let v = lam(nx, ny, nz) + bias;
        if (jit) v += jit(x, y);
        return step(band(v, t), n);
      };
    }
    // a cylinder along an axis at angle `ang` through (cx, cy), radius r: hard bands across it.
    // bands: [[from (-1 near the lit side … 1), step], …] in order; o.jit breaks the edges
    function cyl(cx, cy, ang, r, n, bands, o) {
      o = o || {};
      // the side that faces the upper left is the lit side
      let px = -Math.sin(ang), py = Math.cos(ang);
      if (px * LK[0] + py * LK[1] < 0) { px = -px; py = -py; }
      const B = bands || [[-1, n - 2], [-0.84, n - 1], [-0.66, n - 2], [-0.3, n - 3], [0.25, 1], [0.62, 0], [0.86, 1]];
      return (x, y) => {
        let u = -((x - cx) * px + (y - cy) * py) / r;
        if (o.jit) u += o.jit(x, y);
        let k = B[0][1];
        for (const [f, s] of B) if (u >= f) k = s;
        return step(k, n);
      };
    }
    // flat planes: a constant step
    const facet = (i, n) => () => step(i, n);
    // strand clusters for fur and cloth: an offset that is constant across a strand `w` px wide and
    // tapers along it every `len` px (pointed tufts); ang: the direction the strands run (radians,
    // or a function of (x, y))
    // Each strand cell holds one tuft: a triangle `w` px wide at its root narrowing to a point over
    // `len` px; inside it the light term moves by ±amp (the sign and the stagger hashed per cell), so
    // a band edge crossing the cell breaks into a pointed cluster — never single-pixel noise.
    function strands(ang, o) {
      o = o || {};
      const wd = o.w || 4, len = o.len || 8, amp = o.amp == null ? 0.3 : o.amp, seed = o.seed || 1, bias = o.sign || 0;
      const fixed = typeof ang !== 'function', ca0 = fixed ? Math.cos(ang) : 0, sa0 = fixed ? Math.sin(ang) : 0;
      return (x, y) => {
        let ca = ca0, sa = sa0;
        if (!fixed) { const a = ang(x, y); ca = Math.cos(a); sa = Math.sin(a); }
        const u = x * ca + y * sa, w = -x * sa + y * ca;
        const cw = Math.floor(w / wd), wl = w - cw * wd;
        const uu = u + (K.hh(cw + 99, seed, 3) % len);
        const cu = Math.floor(uu / len), fr = (uu - cu * len) / len;
        if (Math.abs(wl - wd / 2) > (wd / 2) * (1 - fr) + 0.35) return 0;
        const r = (K.hh(cw + 99, cu + 99, seed) % 1000) / 1000;
        const hv = bias > 0 ? (r < 0.75 ? 1 : -1) : bias < 0 ? (r < 0.75 ? -1 : 1) : r < 0.5 ? -1 : 1;
        return hv * amp;
      };
    }
    // ---- passes over a whole layer (after its shapes are drawn) ----------------------------------
    // the cool back light on the silhouette: a fill pixel whose right-hand neighbour is empty, or
    // is an outline pixel with nothing beyond it, takes its material's rim tone (o.w: 2 deepens it
    // where the form is wide); only where the form is wider than the rim, so no thin part turns
    // wholly into rim. Works on a part before or after its outline, or on the composite.
    // o.y0 / o.y1 limit it vertically (buffer px); o.diag also lights lower-right edges.
    const isLine = (c, m) => { const M = MATS[m]; return !!M && (c === M.line || c === M.lineLit); };
    function rim(L, o) {
      o = o || {};
      const { w, h, px, mt } = L, out = px.slice();
      const empty = (j) => !(px[j] >>> 24);
      const edgeAt = (i, x) => {
        if (x + 1 >= w || empty(i + 1)) return true;
        if (isLine(px[i + 1], mt[i + 1]) && (x + 2 >= w || empty(i + 2))) return true;
        return false;
      };
      for (let y = Math.max(1, o.y0 || 0); y < Math.min(h - 1, o.y1 || h); y++) for (let x = 4; x < w; x++) {
        const i = y * w + x;
        if (empty(i)) continue;
        const M = MATS[mt[i]];
        if (!M || !M.rim || isLine(px[i], mt[i]) || px[i] === M.rim) continue;
        let edge = edgeAt(i, x);
        if (!edge && o.diag && x + 1 < w && (empty(i + w + 1) || isLine(px[i + w + 1], mt[i + w + 1])) && (empty(i + w) || isLine(px[i + w], mt[i + w]))) edge = true;
        if (!edge) continue;
        if (empty(i - 1) || empty(i - 2) || empty(i - 3) || isLine(px[i - 2], mt[i - 2])) continue;
        out[i] = M.rim;
        if (o.w > 1 && !empty(i - 4) && !empty(i - 5) && mt[i - 1] === mt[i] && !isLine(px[i - 1], mt[i - 1])) out[i - 1] = M.rim;
      }
      L.px = out;
      return L;
    }
    // the shadow a near part (front) casts on a far one (back): back pixels the front would cover
    // if moved (dx, dy) away from the light step k tones down their own ramp
    function cast(front, back, dx, dy, k) {
      const { w, h } = back, fp = front.px, bp = back.px, bm = back.mt, bb = bbox(back);
      if (!bb) return back;
      for (let y = bb[1]; y <= bb[3]; y++) for (let x = bb[0]; x <= bb[2]; x++) {
        const i = y * w + x;
        if (!(bp[i] >>> 24) || (fp[i] >>> 24)) continue;
        const sx = x - dx, sy = y - dy;
        if (sx < 0 || sy < 0 || sx >= w || sy >= h || !(fp[sy * w + sx] >>> 24)) continue;
        const M = MATS[bm[i]];
        if (!M) continue;
        const j = M.c.indexOf(bp[i]);
        if (j <= 0) continue;
        bp[i] = M.c[Math.max(0, j - (k || 1))];
      }
      return back;
    }
    // a bright line just inside the edges that face the light (metal, glass, wet pipe): pixels of
    // material M with an empty neighbour above or to the left take step k (o.right: also on the
    // right, as a reflected edge)
    function lit(L, M, k, o) {
      o = o || {};
      const { w, h, px, mt } = L, out = px.slice(), col = M.c[clamp(k, 0, M.n - 1)];
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (!(px[i] >>> 24) || mt[i] !== M.id) continue;
        const up = !(px[i - w] >>> 24), lf = !(px[i - 1] >>> 24);
        if ((o.up !== false && up) || (o.left !== false && lf)) { if (!o.test || o.test(x - L.ox, y - L.oy)) out[i] = col; }
      }
      L.px = out;
      return L;
    }
    // stray single pixels (no 4-neighbour of the same colour) folded into the colour most of their
    // neighbours share (at least three of the four), within one material
    function clean(L, only) {
      const { w, h, px, mt } = L, bb = bbox(L);
      if (!bb) return L;
      const out = px.slice();
      for (let y = Math.max(1, bb[1]); y <= Math.min(h - 2, bb[3]); y++) for (let x = Math.max(1, bb[0]); x <= Math.min(w - 2, bb[2]); x++) {
        const i = y * w + x, c = px[i];
        if (!(c >>> 24) || (only && mt[i] !== only.id)) continue;
        const nb = [px[i - 1], px[i + 1], px[i - w], px[i + w]];
        if (nb.includes(c)) continue;
        for (const v of nb) if (v >>> 24 && nb.filter((u) => u === v).length >= 3) { out[i] = v; break; }
      }
      L.px = out;
      return L;
    }
    // a pointed tuft from (x, y) along `ang`: `len` long, `wd` wide at its root, bent by `bend`
    function tuft(L, x, y, ang, len, wd, M, k, bend) {
      const ca = Math.cos(ang), sa = Math.sin(ang), b = bend || 0;
      const px = -sa, py = ca;
      L.poly([[x + px * wd / 2, y + py * wd / 2], [x + ca * len * 0.55 + px * (wd * 0.3 + b * 0.5), y + sa * len * 0.55 + py * (wd * 0.3 + b * 0.5)], [x + ca * len + px * b, y + sa * len + py * b], [x - px * wd / 2 + ca * len * 0.3, y - py * wd / 2 + sa * len * 0.3]], M, k);
      return L;
    }
    // the rows and columns that hold any pixel (the passes below work only there)
    function bbox(L) {
      const { w, h, px } = L;
      let x0 = w, x1 = -1, y0 = -1, y1 = -1;
      for (let y = 0; y < h; y++) {
        const r = y * w;
        let any = false;
        for (let x = 0; x < w; x++) if (px[r + x]) { any = true; if (x < x0) x0 = x; break; }
        if (!any) continue;
        for (let x = w - 1; x >= 0; x--) if (px[r + x]) { if (x > x1) x1 = x; break; }
        if (y0 < 0) y0 = y;
        y1 = y;
      }
      return y0 < 0 ? null : [x0, y0, x1, y1];
    }
    // the coloured selective outline (as RB.pxkit's Layer.outline: every empty pixel touching a
    // shape takes the neighbour material's outline tone, lighter where the edge faces the light),
    // done only round the drawn area — the same result at a fraction of the cost on large frames
    function outline(L) {
      const bb = bbox(L);
      if (!bb) return L;
      const { w, h, px, mt } = L, out = px.slice(), omt = mt.slice();
      const X0 = Math.max(0, bb[0] - 1), X1 = Math.min(w - 1, bb[2] + 1), Y0 = Math.max(0, bb[1] - 1), Y1 = Math.min(h - 1, bb[3] + 1);
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
        const i = y * w + x;
        if (px[i] >>> 24) continue;
        let dark = 0, lit = 0, m = 0;
        const chk = (j, isLit) => {
          if (!(px[j] >>> 24)) return;
          const M = MATS[mt[j]];
          if (!M || !M.line) return;
          if (isLit) { if (!lit) { lit = M.lineLit; m = m || M.id; } } else if (!dark) { dark = M.line; m = M.id; }
        };
        if (x + 1 < w) chk(i + 1, true);
        if (y + 1 < h) chk(i + w, true);
        if (x > 0) chk(i - 1, false);
        if (y > 0) chk(i - w, false);
        const col = dark || lit;
        if (col) { out[i] = col; omt[i] = m; }
      }
      L.px = out; L.mt = omt;
      return L;
    }
    // interior form lines lighter than the silhouette: on the composite, an outline pixel with all
    // four neighbours filled (a line between two overlapping parts, not against the background)
    // takes its material's second-darkest tone (o.k: another step)
    function inner(L, o) {
      o = o || {};
      const bb = bbox(L);
      if (!bb) return L;
      const { w, h, px, mt } = L, out = px.slice();
      for (let y = Math.max(1, bb[1]); y <= Math.min(h - 2, bb[3]); y++) for (let x = Math.max(1, bb[0]); x <= Math.min(w - 2, bb[2]); x++) {
        const i = y * w + x, c = px[i];
        if (!(c >>> 24) || !isLine(c, mt[i])) continue;
        if (!(px[i - 1] >>> 24) || !(px[i + 1] >>> 24) || !(px[i - w] >>> 24) || !(px[i + w] >>> 24)) continue;
        const M = MATS[mt[i]];
        out[i] = M.c[Math.min(M.n - 1, o.k == null ? 1 : o.k)];
      }
      L.px = out;
      return L;
    }
    // the four-neighbour edge test used by detail passes: is (x, y) (buffer px) filled?
    const filled = (L, x, y) => x >= 0 && y >= 0 && x < L.w && y < L.h && (L.px[y * L.w + x] >>> 24) > 0;
    // metal bands across a cylinder (n tones): a lit edge, the near-white specular streak, the light
    // and mid planes, the shadow, the dark reflected band and the reflected light at the far edge
    const METAL = (n) => [[-1, n - 2], [-0.84, n - 1], [-0.66, n - 2], [-0.32, n - 3], [0.18, Math.max(1, n - 4)], [0.52, 0], [0.8, 1]];
    // a metal pipe along a polyline [[x, y, w?], …]: each run banded across its width, a collar (a
    // wider ring) at every joint
    function pipe(L, pts, w, M, o) {
      o = o || {};
      const n = M.n, bands = o.bands || METAL(n);
      for (let i = 1; i < pts.length; i++) {
        const [xa, ya] = pts[i - 1], [xb, yb, wb] = pts[i];
        const ww = wb || w, ang = Math.atan2(yb - ya, xb - xa);
        L.seg(xa, ya, xb, yb, ww, M, cyl((xa + xb) / 2, (ya + yb) / 2, ang, ww / 2, n, bands));
      }
      if (o.collars !== false) for (let i = 1; i < pts.length - 1; i++) {
        const [x, y, w0] = pts[i], [x2, y2] = pts[i + 1], ww = (w0 || w) + 4;
        const ang = Math.atan2(y2 - y, x2 - x), ux = Math.cos(ang), uy = Math.sin(ang);
        L.seg(x - ux * 1.5, y - uy * 1.5, x + ux * 1.5, y + uy * 1.5, ww, M, cyl(x, y, ang, ww / 2, n, bands));
        L.line(x + ux * 2 - uy * (ww / 2 - 1), y + uy * 2 + ux * (ww / 2 - 1), x + ux * 2 + uy * (ww / 2 - 1), y + uy * 2 - ux * (ww / 2 - 1), M, 0);
      }
      return L;
    }
    return { LK, ramp, deep, mat, T, band, step, lam, sph, cyl, facet, strands, rim, cast, lit, clean, tuft, filled, mixh, toward, hslOf, fromHsl, METAL, pipe, bbox, outline, inner };
  })();

  return { rig, RIGS, play, deliver, flush, PENDING, warmFor, warmStats, stopWarm, targets, colOf, blocked, tween, keys, mixQ, E, damp, cl, lerp, FAMILIES, AUDIT, FAMILY, family, audit, budget, S };
})();
