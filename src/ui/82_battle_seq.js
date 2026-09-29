/* Battle presentation sequencer. The rules (RB.combatLogic) decide
 * everything first and return their authoritative fx events; this file only
 * STAGES the display of results already computed. It never recomputes,
 * rerolls or applies a rule: each result reaches the screen through exactly
 * one `beat` cue, which hands that fx event to the combat UI (the displayed
 * state steps forward, the log line appears, the sound plays).
 *
 *   choreo.player(card, fx, ctx) / enemy(intent, fx, ctx) / finish(…) / revive(…)
 *       → a list of cues (times in presentation ms)
 *   run(kind, cues) → Promise that resolves when the sequence has played
 *
 * Cues: pose (an adventurer's pose and gesture), foe (the creature's action
 * pose), fx (a transient effect), strip (the paper-and-ink word), num (a
 * small number), beat (one authoritative fx event), log, sfx, final.
 *
 * Time: a presentation clock advanced from the frame loop (dt clamped to
 * 100 ms, so a stalled or background tab never bursts through stale beats),
 * faster with the Text speed setting, ×4 while hurried (Z / Enter / a click
 * on the battle). Only one sequence runs at a time; starting another first
 * settles the old one. settle() applies every remaining beat in order at
 * once and drops the transient visuals — used when the tab is hidden, by a
 * watchdog if frames stop arriving, and at scene exit — so skipping,
 * reduced motion or an interrupted playback always ends in the same state. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battleSeq = (function () {
  'use strict';
  // ---- tuning (presentation ms at normal speed) ----------------------------------------------
  const T = {
    // the word: travels and unrolls, the ink writes it (≈0.54 s in), it stays, and has
    // gone by the end of the response (the log keeps it)
    anticipate: 170, act: 400, stripAt: 120, strip: { travel: 320, unfurl: 200, inkAt: 120, inkEnd: 420, fadeAt: 850, end: 1000 },
    stripStill: { travel: 0, unfurl: 0, inkAt: 0, inkEnd: 0, fadeAt: 880, end: 980 },
    beat: 560, beatGap: 150, recoverAt: 900, recover: 240, end: 1140,
    foePrep: 320, foeExec: 380, contact: 560, foeRecover: 300, secondTarget: 120, react: 420,
    finishHold: 1000, speed: { normal: 1, fast: 1.4, instant: 2 }, hurry: 4,
  };
  let pt = 0, lastT = null, cur = null, port = null, timeScale = 1; // timeScale: tests and captures only
  const trace = [];
  const counters = { runs: 0, done: 0, settled: 0, hurried: 0, beats: 0, watchdogs: 0 };
  const timers = new Set();
  let onVis = null, onDown = null, layer = null;
  const stage = () => RB.battleStage;

  function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; }
  function clearTimers() { for (const id of timers) clearTimeout(id); timers.clear(); }
  function speed() {
    const ts = RB.game.settings && RB.game.settings.textSpeed;
    return T.speed[ts] || 1;
  }

  // ---- lifecycle (one attach per encounter) ----------------------------------------------------
  // p: { beat(f, cue) → info, log(html), reconcile() }
  function attach(p) {
    detach();
    port = p;
    pt = 0; lastT = null;
    onVis = () => { if (document.hidden) settle('hidden'); };
    document.addEventListener('visibilitychange', onVis);
  }
  function detach() {
    if (cur) settle('exit');
    if (onVis) document.removeEventListener('visibilitychange', onVis);
    onVis = null;
    unhook();
    clearTimers();
    port = null;
  }
  function tick(t) {
    const dt = lastT == null ? 16 : Math.max(0, Math.min(100, t - lastT));
    lastT = t;
    pt += dt * timeScale * (cur ? speed() * (cur.hurried ? T.hurry : 1) : 1);
    if (cur) step();
    return pt;
  }
  function now() { return pt; }

  // ---- running a sequence --------------------------------------------------------------------------
  function run(kind, cues, meta) {
    if (cur) settle('overlap');
    cues = cues.slice().sort((a, b) => a.at - b.at);
    const end = cues.reduce((m, c) => Math.max(m, c.at + (c.hold ? 0 : c.d || 0)), 0);
    const endAt = Math.max(meta && meta.minEnd || 0, cues.reduce((m, c) => Math.max(m, c.type === 'beat' || c.type === 'log' || c.type === 'final' ? c.at : 0), 0) + 1, meta && meta.end != null ? meta.end : end);
    counters.runs++;
    return new Promise((resolve) => {
      cur = { kind, cues, i: 0, t0: pt, end: endAt, resolve, hurried: false, started: performance.now(), rec: { kind, meta: meta || {}, fired: [], beats: [], hurried: false, settled: null, dur: 0 } };
      hook();
      // if frames stop arriving (a throttled tab, a stalled canvas), finish anyway
      const wall = (endAt / (speed() * Math.min(1, timeScale))) * 2 + 2500;
      cur.watch = later(() => { if (cur && cur.started + wall - 50 <= performance.now()) { counters.watchdogs++; settle('watchdog'); } }, wall);
      if (document.hidden) { settle('hidden'); return; }
      step();
    });
  }
  function step() {
    const el = pt - cur.t0;
    while (cur && cur.i < cur.cues.length && cur.cues[cur.i].at <= el) fire(cur.cues[cur.i++], false);
    if (cur && el >= cur.end) finish(null);
  }
  // A failing cue never stops the frame loop or the battle: it is reported and skipped
  // (a beat's result is still reconciled from the rules when the sequence ends).
  function fire(c, instant) {
    try { fire1(c, instant); } catch (err) { counters.errors = (counters.errors || 0) + 1; console.error('battle cue', c.type, err); }
  }
  function fire1(c, instant) {
    const S = stage(), at = cur.t0 + c.at;
    cur.rec.fired.push(c.type + (c.name ? ':' + c.name : c.pose ? ':' + c.who + '=' + c.pose : c.act ? ':' + c.act : ''));
    switch (c.type) {
      case 'beat': {
        counters.beats++;
        cur.rec.beats.push({ t: c.f.t, at: Math.round(pt - cur.t0), who: c.f.who || c.f.target || null });
        const info = port ? port.beat(c.f, c) : null;
        if (!instant && c.then) c.then(info, at);
        break;
      }
      case 'log': if (port) port.log(c.html); break;
      case 'final': S.finalFoe(true); break;
      case 'settleFoe': S.settleFoe(c.foe); break;
      case 'sfx': if (!instant) RB.audio && RB.audio.sfx(c.name); break;
      default:
        if (instant) break;
        if (c.type === 'pose') S.pose(c.who, c.pose, c.gesture, c.d, at);
        else if (c.type === 'foe') S.foe(c.act, c.d, at, { family: c.family, dir: c.dir, hold: c.hold, foe: c.foe || 0 });
        else if (c.type === 'fx') S.effect(c.name, c.d, at, c.p);
        else if (c.type === 'strip') S.strip(c.word, c.from, c.to, at, c.tm);
        else if (c.type === 'num') S.number(c.to, c.text, c.kind, at);
    }
  }
  // Apply every remaining beat now (in order), drop the transient visuals, resolve.
  function settle(why) {
    if (!cur) return;
    while (cur.i < cur.cues.length) fire(cur.cues[cur.i++], true);
    stage().clearTransient();
    counters.settled++;
    finish(why || 'skip');
  }
  function hurry() {
    if (!cur || cur.hurried) return;
    cur.hurried = true;
    cur.rec.hurried = true;
    counters.hurried++;
  }
  function finish(settled) {
    const c = cur;
    if (!c) return;
    cur = null;
    if (c.watch) { clearTimeout(c.watch); timers.delete(c.watch); }
    unhook();
    c.rec.settled = settled;
    c.rec.dur = Math.round(performance.now() - c.started);
    trace.push(c.rec);
    while (trace.length > 40) trace.shift();
    if (port && port.reconcile) port.reconcile();
    counters.done++;
    c.resolve(c.rec);
  }
  // While a sequence plays: Z / Enter / Escape (by the player's bindings) or a
  // fresh press on the battle hurries it. The press is used up here, so it
  // never also advances the line that follows (that line ignores presses
  // that began before it appeared).
  function hook() {
    unhook();
    if (!RB.ui || !RB.ui.pushLayer) return;
    const el = document.createElement('div');
    el.className = 'cb-seqkey';
    el.setAttribute('aria-hidden', 'true');
    layer = { el, name: 'battle-sequence', noAutofocus: true, parent: document.querySelector('.combat-ui') || undefined };
    layer.onAction = (a) => { if (a === 'ok' || a === 'cancel') { hurry(); return true; } return a !== 'menu' && a !== 'help'; };
    layer.onCancel = () => hurry();
    RB.ui.pushLayer(layer);
    const t0 = performance.now();
    onDown = (e) => {
      if (!cur || performance.now() - t0 < 120) return; // not the press that started it
      const tg = e.target;
      if (!tg || !tg.closest) return;
      if (tg.closest('button, a, input, select, textarea, .kwcard, .dlg')) return;
      if (tg.id === 'world' || tg.closest('.combat-ui')) hurry();
    };
    document.addEventListener('pointerdown', onDown, true);
  }
  function unhook() {
    if (layer) { const l = layer; layer = null; RB.ui.popLayer(l); }
    if (onDown) document.removeEventListener('pointerdown', onDown, true);
    onDown = null;
  }

  // ---- choreography: authoritative fx → cues ------------------------------------------------------
  // ctx: { comp, reduce, view (displayed state before the sequence), foe (the
  // creature concerned: your target, or the one acting), reach ({foes, allies}
  // a response reaches), group (more than one creature) }. Every cue about a
  // creature names it (foe: i; effects p.foe), so a group plays on the right one.
  // What each response looks like: who acts, the gesture, where it lands.
  const TECH_GESTURE = { nao: 'direct', mio: 'restore', ren: 'ward', suzu: 'flow' };
  const OUTCOME = { unravel: 1, ward: 1, heal: 1, water: 1, light: 1, bind: 1, warm: 1, bell: 1, settle: 1, reveal: 1, tech: 1, comp: 1, cact: 1, soften: 1, stun: 1, draw: 1 };
  const fid = (ctx, i) => (i == null ? (ctx.foe == null ? 0 : ctx.foe) : i);
  const foeId = (ctx, i) => (ctx.group ? 'foe:' + fid(ctx, i) : 'foe');
  const knotId = (ctx, i, j) => (ctx.group ? 'knot:' + fid(ctx, i) + ':' + j : 'knot:' + j);
  const fview = (ctx, i) => (ctx.view.foes ? ctx.view.foes[fid(ctx, i)] : ctx.view) || ctx.view;
  function wordOf(card) {
    // the response's own Japanese (a word in kanji with its reading; ほどく, こたえる, みぬく, あわせ as written)
    const jp = card.kind === 'word' ? card.word.jpK || card.word.jp : card.jp;
    return { jp, en: card.en, html: RB.ui.jhtml(jp) };
  }
  function planOf(card, fx, ctx) {
    const has = (t) => fx.some((f) => f.t === t);
    const tags = (card.word && card.word.tags) || [];
    const tg = (x) => tags.indexOf(x) >= 0;
    const party = ctx.comp ? 'party' : 'pc';
    const many = ctx.group && ctx.reach && ctx.reach.foes && ctx.reach.foes.length > 1;
    let target = many ? 'foes' : foeId(ctx), gesture = 'direct', travel = null, actors = ['pc'];
    if (card.kind === 'unravel') { gesture = 'direct'; travel = 'thread'; target = foeId(ctx); }
    else if (card.kind === 'tech') { actors = ['pc', 'comp']; gesture = 'direct'; travel = 'thread'; }
    else if (card.kind === 'answer') { gesture = 'book'; travel = 'note'; target = foeId(ctx); }
    else if (card.kind === 'truth') { gesture = 'trace'; travel = 'lens'; target = foeId(ctx); }
    else if (tg('ward')) { target = card.target || 'pc'; gesture = 'ward'; travel = 'sealForm'; }
    else if (tg('heal')) { target = party; gesture = 'restore'; travel = null; }
    else if (tg('water')) { gesture = 'flow'; travel = 'splash'; }
    else if (tg('bind')) { gesture = 'trace'; travel = 'rope'; target = foeId(ctx); }
    else if ((tg('light') && (has('light') || !tg('warm'))) || (tg('wind') && !tg('anchor'))) { gesture = tg('wind') && !tg('light') ? 'flow' : 'raise'; travel = tg('wind') && !tg('light') ? 'wind' : 'flash'; if (!tg('wind')) target = foeId(ctx); }
    else if (tg('anchor') || tg('stone')) { target = party; gesture = 'ward'; travel = 'stone'; }
    else if (tg('warm') || tg('fire')) { target = party; gesture = 'raise'; travel = 'warm'; }
    else if (tg('bell') || tg('voice')) { target = party; gesture = 'raise'; travel = 'rings'; }
    return { target, gesture, travel, actors };
  }
  // The travel/landing effect for a response, placed on the timeline (on each
  // creature it reaches, a little apart, when it reaches several).
  function travelCue(Q, plan, card, fx, ctx, at) {
    const from = 'pc';
    const has = (t) => fx.some((f) => f.t === t);
    const T = fid(ctx);
    const each = (plan.target === 'foes' ? ctx.reach.foes : [T]);
    const on = (name, d, extra, dt) => each.forEach((i, k) => Q.push({ at: at + (dt || 0) + k * 90, type: 'fx', name, d, p: Object.assign({ from, to: foeId(ctx, i), foe: i }, extra || {}) }));
    switch (plan.travel) {
      case 'thread': {
        const n = (fx.find((f) => f.t === 'unravel' && fid(ctx, f.foe) === T) || { n: 1 }).n;
        const i = Math.max(0, fview(ctx, T).knots - 1);
        Q.push({ at, type: 'fx', name: 'thread', d: 560, p: { from, to: knotId(ctx, T, i), foe: T } });
        if (n > 1 && fview(ctx, T).knots > 1) Q.push({ at: at + 60, type: 'fx', name: 'thread', d: 560, p: { from: ctx.comp ? 'comp' : from, to: knotId(ctx, T, i - 1), foe: T } });
        break;
      }
      case 'splash': each.forEach((i, k) => Q.push({ at: at + k * 90, type: 'fx', name: 'splash', d: 700, p: { from, to: foeId(ctx, i), foe: i, steam: fx.some((f) => f.t === 'water' && fid(ctx, f.foe) === i) || (!ctx.group && has('water')) } })); break;
      case 'flash': on('flash', 720); break;
      case 'wind': on('wind', 620); break;
      case 'rope': on('rope', 760); break;
      case 'note': Q.push({ at, type: 'fx', name: 'note', d: 640, p: { from, to: foeId(ctx), foe: T, fade: true } }); break;
      case 'lens': on('lens', 720, null, 120); break;
      case 'sealForm': Q.push({ at: at + 120, type: 'fx', name: 'sealForm', d: 520, p: { from, to: plan.target } }); break;
      case 'stone': Q.push({ at: at + 120, type: 'fx', name: 'stone', d: 700, p: { who: ctx.comp ? ['pc', 'comp'] : ['pc'] } }); break;
      case 'warm': Q.push({ at: at + 120, type: 'fx', name: 'warm', d: 700, p: { who: ctx.comp ? ['pc', 'comp'] : ['pc'] } }); break;
      case 'rings': Q.push({ at: at + 80, type: 'fx', name: 'rings', d: 720, p: { from, to: plan.target } }); break;
      default: break;
    }
  }
  // The reactions that belong to one fx beat (placed at the same moment).
  function reactions(Q, f, at, ctx, side) {
    const comp = ctx.comp, both = comp ? ['pc', 'comp'] : ['pc'];
    const num = (to, text, kind) => Q.push({ at, type: 'num', to, text, kind });
    const i = fid(ctx, f.foe);
    const foeCue = (act, d, extra) => Q.push(Object.assign({ at, type: 'foe', act, d, foe: i }, extra || {}));
    switch (f.t) {
      case 'unravel': {
        const n = f.n || 1;
        ctx.kb = ctx.kb || {};
        const top = ctx.kb[i] != null ? ctx.kb[i] : fview(ctx, i).knots;
        for (let j = 0; j < n && top - 1 - j >= 0; j++) Q.push({ at: at + j * 90, type: 'fx', name: 'knotRelease', d: 560, p: { i: top - 1 - j, foe: i } });
        Q.push({ at, type: 'fx', name: 'loosen', d: 600, p: { foe: i } });
        foeCue('release', 420);
        ctx.kb[i] = Math.max(0, top - n);
        break;
      }
      case 'ward': if (f.by) Q.push({ at: at - 60, type: 'fx', name: 'sealForm', d: 520, p: { to: f.target } }); break; // your seal forms with the response; a blocking seal waits for the blow
      case 'heal': Q.push({ at: at - 120, type: 'fx', name: 'motes', d: 820, p: { who: f.who || both } }); break;
      case 'water': foeCue('recoil', 300, { dir: 'party' }); if (f.by) Q.push({ at: at - 80, type: 'fx', name: 'splash', d: 620, p: { from: 'comp', to: foeId(ctx, i), foe: i, steam: true } }); break;
      case 'light': Q.push({ at, type: 'fx', name: 'mistPart', d: 620, p: { foe: i } }); break;
      case 'bind': Q.push({ at, type: 'fx', name: 'scatter', d: 520, p: { foe: i } }); foeCue('recoil', 300, { dir: 'party' }); break;
      case 'warm': Q.push({ at, type: 'fx', name: 'warm', d: 600, p: { who: both } }); break;
      case 'bell': if (f.by) Q.push({ at: at - 40, type: 'fx', name: 'rings', d: 700, p: {} }); break;
      case 'settle': foeCue('release', 500); break;
      case 'reveal': foeCue('recoil', 360, { dir: 'party' }); break;
      case 'tech': {
        const w = f.who || comp;
        if (w === 'mio') Q.push({ at, type: 'fx', name: 'motes', d: 820, p: { who: both } });
        if (w === 'ren') for (const x of both) Q.push({ at: at + (x === 'comp' ? 80 : 0), type: 'fx', name: 'sealForm', d: 520, p: { to: x } });
        if (w === 'suzu') for (const k of f.all && ctx.reach ? ctx.reach.foes : [i]) Q.push({ at: at + (k === i ? 0 : 90), type: 'fx', name: 'fizzle', d: 520, p: { foe: k } });
        Q.push({ at: at - 200, type: 'fx', name: 'link', d: 600, p: {} });
        break;
      }
      case 'comp': {
        const w = f.who;
        if (w === 'suzu' && side === 'enemy') Q.push({ at, type: 'fx', name: 'miss', d: 560, p: { to: f.missAt || ctx.missAt || 'pc' } });
        if (comp && w === comp) Q.push({ at: at - 120, type: 'pose', who: 'comp', pose: 'act', gesture: TECH_GESTURE[w] || 'raise', d: 420 });
        if (w === 'ren' && side === 'player') Q.push({ at, type: 'fx', name: 'flash', d: 520, p: { from: 'comp', foe: i } });
        if (w === 'mio' && side === 'enemy') Q.push({ at: at - 60, type: 'fx', name: 'motes', d: 760, p: { who: both } });
        break;
      }
      case 'soften': Q.push({ at: at - 200, type: 'fx', name: 'note', d: 420, p: { from: 'comp', to: foeId(ctx, i), foe: i, fade: true } }); foeCue('recoil', 260, { dir: 'party' }); break;
      case 'stun': Q.push({ at: at - 120, type: 'fx', name: 'rope', d: 620, p: { foe: i } }); foeCue('balk', 380); break;
      case 'draw': Q.push({ at, type: 'fx', name: 'miss', d: 560, p: { to: 'comp' } }); break;
      case 'cost': Q.push({ at: at - 150, type: 'fx', name: 'drop', d: 420, p: { to: 'pc' } }); num('pc', '-1', 'cost'); break;
      case 'block': {
        Q.push({ at, type: 'fx', name: 'sealBlock', d: 440, p: { to: f.who, n: f.n } });
        Q.push({ at, type: 'pose', who: f.who, pose: 'brace', d: 320 });
        Q.push({ at: at + 40, type: 'num', to: f.who, text: String(f.n), kind: 'block' });
        break;
      }
      case 'hit': {
        const partial = ctx.blocked && ctx.blocked[f.who];
        Q.push({ at, type: 'fx', name: 'impact', d: partial ? 300 : 380, p: { to: f.who, small: !!partial, col: ctx.kind === 'chill' ? '#e4f2ff' : null } });
        if (ctx.kind === 'chill') Q.push({ at, type: 'fx', name: 'frost', d: 520, p: { to: f.who } });
        Q.push({ at, type: 'pose', who: f.who, pose: 'hit', d: partial ? 300 : T.react });
        num(f.who, '-' + f.n, 'hit');
        break;
      }
      case 'stripWard': Q.push({ at, type: 'fx', name: 'sealStrip', d: 560, p: { who: both.filter((w) => (ctx.view.ward[w] || 0) > 0) } }); break;
      case 'heat': Q.push({ at: at - 60, type: 'fx', name: 'embers', d: 700, p: { foe: i } }); break;
      case 'shroud': break; // the mist roll arrives with the cast
      case 'charge': break;
      case 'mend': break;
      case 'silence': break;
      case 'countered': if (!ctx.wardBlock) Q.push({ at, type: 'fx', name: 'fizzle', d: 560, p: { foe: i } }); break;
      default: break;
    }
  }
  // how much a heal or a companion's draught actually restored, for the numbers
  function healNums(Q, at, info) {
    if (!info || !info.delta) return;
    for (const w of ['pc', 'comp']) if (info.delta[w] > 0) Q.push({ at, type: 'num', to: w, text: '+' + info.delta[w], kind: 'heal' });
  }
  const healThen = (info, at) => { const q = []; healNums(q, 0, info); for (const x of q) RB.battleStage.number(x.to, x.text, x.kind, at); };
  // With reduced motion a number is a still mark until it goes: the sequence that
  // shows it lasts until it has gone, so nothing changes during the next one.
  function stillNums(Q, rd) {
    if (!rd) return 0;
    let last = -1;
    for (const c of Q) if (c.type === 'num' || (c.type === 'beat' && c.then)) last = Math.max(last, c.at);
    return last < 0 ? 0 : last + 940;
  }

  const choreo = {
    // Your response (or your coordinated technique), once accepted and applied by the rules.
    player(card, fx, ctx) {
      const Q = [], rd = !!ctx.reduce;
      ctx.kb = {};
      let t = 0;
      const cost = fx.find((f) => f.t === 'cost');
      if (cost) {
        Q.push({ at: 0, type: 'pose', who: 'pc', pose: 'brace', d: 260 });
        reactions(Q, cost, 180, ctx, 'player');
        Q.push({ at: 180, type: 'beat', f: cost });
        t = 280;
      }
      const plan = planOf(card, fx, ctx);
      const word = wordOf(card);
      for (const who of plan.actors) {
        const g = who === 'comp' ? TECH_GESTURE[ctx.comp] || 'book' : plan.gesture;
        // reduced motion: one held gesture pose instead of anticipation → act → recovery
        if (rd) { Q.push({ at: t, type: 'pose', who, pose: 'act', gesture: g, d: T.recoverAt + T.recover }); continue; }
        Q.push({ at: t, type: 'pose', who, pose: 'anticipate', gesture: g, d: T.anticipate });
        Q.push({ at: t + T.anticipate, type: 'pose', who, pose: 'act', gesture: g, d: T.act });
      }
      Q.push({ at: t + T.stripAt, type: 'strip', word, from: plan.actors[0], to: plan.target, tm: rd ? T.stripStill : T.strip, d: rd ? T.stripStill.end : T.strip.end });
      travelCue(Q, plan, card, fx, ctx, t + 300);
      // outcome beats, in the rules' order, from the moment the response lands
      let bt = t + T.beat, first = true;
      const outs = fx.filter((f) => f.t !== 'cost' && f.t !== 'harmony');
      for (const f of outs) {
        reactions(Q, f, bt, ctx, 'player');
        const cue = { at: bt, type: 'beat', f, word: first ? word : null };
        if (f.t === 'heal' || (f.t === 'tech' && f.who === 'mio')) cue.then = healThen;
        Q.push(cue);
        first = false;
        bt += OUTCOME[f.t] ? T.beatGap : 60;
      }
      if (first) Q.push({ at: bt, type: 'beat', f: { t: 'woven' }, word });
      const hm = fx.find((f) => f.t === 'harmony');
      if (hm) {
        const at = Math.max(bt + 80, t + T.beat + 220);
        if (ctx.comp) Q.push({ at: at - 120, type: 'fx', name: 'link', d: 520, p: {} });
        Q.push({ at, type: 'beat', f: hm });
        bt = at;
      }
      if (!rd) for (const who of plan.actors) Q.push({ at: t + T.recoverAt, type: 'pose', who, pose: 'recover', gesture: who === 'comp' ? TECH_GESTURE[ctx.comp] : plan.gesture, d: T.recover });
      return { cues: Q, end: Math.max(t + T.end, bt + 200, stillNums(Q, rd)), plan, word };
    },
    // Your companion's support action (after your response, before the creatures):
    // their gesture, then each result on its actual target.
    companion(act, fx, ctx) {
      const Q = [], rd = !!ctx.reduce, who = ctx.comp;
      const g = act.gesture || TECH_GESTURE[who] || 'raise';
      if (rd) Q.push({ at: 0, type: 'pose', who: 'comp', pose: 'act', gesture: g, d: 700 });
      else {
        Q.push({ at: 0, type: 'pose', who: 'comp', pose: 'anticipate', gesture: g, d: 150 });
        Q.push({ at: 150, type: 'pose', who: 'comp', pose: 'act', gesture: g, d: 360 });
        Q.push({ at: 560, type: 'pose', who: 'comp', pose: 'recover', gesture: g, d: 220 });
      }
      let at = 360;
      for (const f of fx) {
        if (f.t === 'cact' && !f.none && f.foe != null && act.kind === 'opening') Q.push({ at: at - 80, type: 'fx', name: 'lens', d: 560, p: { foe: f.foe } });
        // (Nao's "take half": the two of you bound for this round)
        if (f.t === 'cact' && act.kind === 'share') Q.push({ at: at - 80, type: 'fx', name: 'link', d: 620, p: {} });
        if (f.t === 'cact' && act.kind === 'salts') Q.push({ at: at - 60, type: 'fx', name: 'motes', d: 700, p: { who: ctx.comp ? ['pc', 'comp'] : ['pc'] } });
        if (f.t === 'unravel') Q.push({ at: at - 160, type: 'fx', name: 'thread', d: 520, p: { from: 'comp', to: knotId(ctx, f.foe, Math.max(0, fview(ctx, f.foe).knots - 1)), foe: fid(ctx, f.foe) } });
        if (f.t === 'harmony') Q.push({ at: at - 120, type: 'fx', name: 'link', d: 520, p: {} });
        reactions(Q, f, at, ctx, 'companion');
        const cue = { at, type: 'beat', f };
        if (f.t === 'heal') cue.then = healThen;
        Q.push(cue);
        at += f.t === 'cact' ? 180 : 150;
      }
      return { cues: Q, end: Math.max(820, at + 160, stillNums(Q, rd)) };
    },
    // One creature's telegraphed move, as the rules resolved it (or its fizzle).
    enemy(it, fx, ctx) {
      const Q = [], kind = it.kind, comp = ctx.comp;
      const me = fid(ctx), fv = fview(ctx, me);
      const foeCue = (o) => Q.push(Object.assign({ type: 'foe', foe: me }, o));
      ctx.kind = kind;
      ctx.blocked = {};
      for (const f of fx) if (f.t === 'block') ctx.blocked[f.who] = true;
      const countered = fx.some((f) => f.t === 'countered');
      const hits = fx.filter((f) => f.t === 'hit' || f.t === 'block').map((f) => f.who);
      const single = { strike: 1, lie: 1, mirror: 1, chill: 1 }[kind];
      const aimed = single ? (ctx.aim || (it.target === 'comp' && comp ? 'comp' : 'pc')) : hits[0] || 'pc';
      ctx.aimed = aimed;
      // the one Suzu's flourish spares (a blow that would have left them at 2 or less)
      ctx.missAt = single ? aimed : ((comp ? ['pc', 'comp'] : ['pc']).find((w) => hits.indexOf(w) < 0) || 'pc');
      const fam = single ? 'strike' : kind === 'sweep' || kind === 'flood' ? 'sweep' : kind === 'gust' ? 'sweep' : 'cast';
      const pre = [], post = [];
      // A Strike or Sweep spends a held Gathering whether it lands or not. The rules clear
      // it without an event of its own; this display-only beat shows it at the blow (the
      // reconcile at the end of the sequence would show the same).
      const spent = (Q, at) => {
        if ((kind === 'strike' || kind === 'sweep') && fv.charged && !fx.some((f) => f.t === 'countered' && f.kind === 'charge')) {
          Q.push({ at, type: 'fx', name: 'scatter', d: 480, p: { foe: me } });
          Q.push({ at, type: 'beat', f: { t: 'spent', foe: me } });
        }
      };
      // lines the rules put before the move (Atlas) and after it (a companion's draught)
      let seenMove = false;
      for (const f of fx) {
        const draught = f.t === 'comp' && f.who === 'mio';            // always at the end of the exchange
        const isMove = f.t !== 'settle' && !draught;
        if (isMove) seenMove = true;
        else if (draught) post.push(f);
        else (seenMove ? post : pre).push(f);
      }
      let t = 0;
      for (const f of pre) { Q.push({ at: t, type: 'beat', f }); t += 160; }
      const dir = fam === 'strike' ? aimed : fam === 'sweep' ? 'party' : null;
      if (kind === 'rest' && !countered) {
        foeCue({ at: t, act: 'rest', d: 700 });
        Q.push({ at: t + 200, type: 'beat', f: { t: 'rest', foe: me } });
        t += 700;
      } else if (countered) {
        foeCue({ at: t, act: 'prep', d: T.foePrep, dir, family: fam });
        if (ctx.wardBlock && single) {
          // the blow is thrown and meets the seal raised in front of its target
          foeCue({ at: t + T.foePrep, act: 'exec', d: 320, dir, family: fam });
          Q.push({ at: t + T.foePrep + 10, type: 'fx', name: 'dart', d: 200, p: { to: aimed, foe: me } });
          Q.push({ at: t + T.foePrep + 200, type: 'fx', name: 'sealBlock', d: 420, p: { to: aimed, n: 0 } });
          Q.push({ at: t + T.foePrep + 200, type: 'pose', who: aimed, pose: 'brace', d: 320 });
        } else foeCue({ at: t + T.foePrep, act: 'balk', d: 380 });
        for (const f of fx.filter((x) => x.t === 'countered')) { reactions(Q, f, t + T.foePrep + 200, ctx, 'enemy'); Q.push({ at: t + T.foePrep + 200, type: 'beat', f }); }
        spent(Q, t + T.foePrep + 260);
        t += T.foePrep + 520;
      } else {
        foeCue({ at: t, act: 'prep', d: T.foePrep, dir, family: fam });
        foeCue({ at: t + T.foePrep, act: fam === 'cast' ? 'cast' : 'exec', d: fam === 'sweep' ? 460 : T.foeExec, dir, family: fam });
        const c0 = t + T.contact;
        if (fam === 'strike') {
          const col = kind === 'chill' ? '#cfe6ff' : null;
          if (kind === 'lie' || kind === 'mirror') Q.push({ at: t + T.foePrep, type: 'fx', name: 'pane', d: T.contact - T.foePrep + 40, p: { to: aimed, foe: me } });
          else Q.push({ at: t + T.foePrep + 10, type: 'fx', name: 'dart', d: T.contact - T.foePrep + 40, p: { to: aimed, col: col || ctx.foeCol, foe: me } });
        } else if (kind === 'gust') Q.push({ at: t + T.foePrep + 10, type: 'fx', name: 'gust', d: 600, p: { col: ctx.foeCol, foe: me } });
        else if (fam === 'sweep') Q.push({ at: t + T.foePrep + 10, type: 'fx', name: 'arc', d: 600, p: { who: comp ? ['pc', 'comp'] : ['pc'], col: kind === 'flood' ? '#6aa8d8' : ctx.foeCol, col2: kind === 'flood' ? '#e8f6ff' : null, foe: me } });
        else if (kind === 'heat') Q.push({ at: t + T.foePrep, type: 'fx', name: 'gather', d: 360, p: { foe: me } });
        else if (kind === 'charge') Q.push({ at: t + T.foePrep - 80, type: 'fx', name: 'gather', d: 640, p: { foe: me } });
        else if (kind === 'shroud') Q.push({ at: t + T.foePrep + 20, type: 'fx', name: 'mistRoll', d: 560, p: { foe: me } });
        else if (kind === 'silence') Q.push({ at: t + T.foePrep + 20, type: 'fx', name: 'hushWave', d: 520, p: { foe: me } });
        else if (kind === 'plea') Q.push({ at: t + T.foePrep, type: 'fx', name: 'note', d: 760, p: { from: 'foe', to: 'party', fade: true, foe: me } });
        else if (kind === 'mend') Q.push({ at: t + T.foePrep, type: 'fx', name: 'mendThread', d: 600, p: { i: Math.min(fv.maxKnots - 1, fv.knots), foe: me } });
        // contact: each result on its actual target, in the rules' order
        let at = kind === 'gust' ? c0 - 90 : c0;
        const lastWho = {};
        for (const f of fx) {
          if (pre.indexOf(f) >= 0 || post.indexOf(f) >= 0) continue;
          if (f.t === 'hit' && lastWho[f.who] === 'block') at += 110;        // the ward intercepts, then the smaller hit
          else if ((f.t === 'hit' || f.t === 'block') && Object.keys(lastWho).length && !lastWho[f.who]) at += T.secondTarget; // the arc reaches the next one
          reactions(Q, f, at, ctx, 'enemy');
          Q.push({ at, type: 'beat', f });
          if (f.t === 'hit' || f.t === 'block') lastWho[f.who] = f.t;
          if (f.t === 'stripWard') at += 90;
        }
        spent(Q, at + 60);
        foeCue({ at: Math.max(at + 100, t + T.contact + 140), act: fam === 'cast' ? 'rest' : 'recover', d: fam === 'cast' ? 260 : T.foeRecover, dir, family: fam });
        t = Math.max(at + 380, t + T.contact + 440);
      }
      for (const f of post) {
        reactions(Q, f, t + 120, ctx, 'enemy');
        const cue = { at: t + 120, type: 'beat', f };
        if (f.t === 'comp' && f.who === 'mio') cue.then = healThen;
        Q.push(cue);
        t += 520;
      }
      return { cues: Q, end: t + 60 };
    },
    // One creature of a group has settled (its knots all free) while others stand:
    // it rises and fades as a lone creature would, and stays settled.
    settleFoe(i, ctx) {
      const Q = [];
      Q.push({ at: 0, type: 'foe', act: 'settle', d: 760, hold: true, foe: i });
      Q.push({ at: 60, type: 'fx', name: 'release', d: 1000, p: { foe: i } });
      Q.push({ at: 400, type: 'beat', f: { t: 'settled', foe: i } });
      Q.push({ at: 760, type: 'settleFoe', foe: i });
      void ctx;
      return { cues: Q, end: ctx && ctx.reduce ? 820 : 1000 };
    },
    // The last knot comes loose: the creature (every one still standing) settles and the two of you ease.
    finish(seqEnd, ctx) {
      const Q = [], at = Math.max(0, seqEnd - 360);
      const last = ctx.last && ctx.last.length ? ctx.last : [0];
      last.forEach((i, k) => {
        Q.push({ at: at + k * 120, type: 'foe', act: 'settle', d: 760, hold: true, foe: i });
        Q.push({ at: at + 60 + k * 120, type: 'fx', name: 'release', d: 1000, p: { foe: i } });
      });
      Q.push({ at: at + 300, type: 'pose', who: 'pc', pose: 'cheer', d: 520 });
      if (ctx.comp) Q.push({ at: at + 380, type: 'pose', who: 'comp', pose: 'cheer', d: 520 });
      Q.push({ at: at + 760, type: 'final' });
      return { cues: Q, end: at + T.finishHold };
    },
    // Your companion helps you back to your feet (the rules' revive).
    revive(ctx) {
      const Q = [];
      Q.push({ at: 0, type: 'pose', who: 'comp', pose: 'act', gesture: 'restore', d: 520 });
      Q.push({ at: 100, type: 'fx', name: 'lift', d: 760, p: { to: 'pc' } });
      Q.push({ at: 280, type: 'pose', who: 'pc', pose: 'recover', gesture: null, d: 460 });
      Q.push({ at: 320, type: 'beat', f: { t: 'revive' } });
      return { cues: Q, end: 840 };
    },
  };

  function stats() {
    return { running: !!cur, kind: cur && cur.kind, pt: Math.round(pt), timers: timers.size, layer: !!layer, pointer: !!onDown, attached: !!port, counters: Object.assign({}, counters) };
  }
  // setTimeScale(k): slow the presentation clock (k < 1) for frame captures; tests and tools only
  return { T, attach, detach, tick, now, run, settle, hurry, busy: () => !!cur, choreo, planOf, stats, trace: () => trace.slice(), setTimeScale: (k) => { timeScale = Math.max(0.05, Math.min(4, +k || 1)); } };
})();
