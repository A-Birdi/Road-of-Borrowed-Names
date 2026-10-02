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

  return { rig, RIGS, play, deliver, flush, PENDING, warmFor, warmStats, stopWarm, targets, colOf, blocked, tween, keys, mixQ, E, damp, cl, lerp, FAMILIES, AUDIT, FAMILY, family, audit, budget };
})();
