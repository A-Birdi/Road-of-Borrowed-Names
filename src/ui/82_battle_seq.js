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
 * at the Battle animations setting's pace (Normal / Fast; Instant plays
 * nothing and applies the results at once — Text speed has no say), ×4 while
 * hurried (Z / Enter / a click on the battle). Skip settles the rest of the
 * exchange. A sequence may carry meta.action: the action banner shows for that
 * action only, inside its own interval (src/ui/82b_battle_banner.js). Only one sequence runs at a time; starting another first
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
    finishHold: 1000, speed: { normal: 1, fast: 1.43 }, hurry: 4,
    bannerOut: { normal: 120, fast: 80 }, // the banner leaves inside the action's last ms (§14.3)
    // Harmony portrait (Harmony addendum §7.2, §7.4; src/ui/82d_harmony_cutin.js): in / hold / fade, presentation
    // ms — Fast's clock runs ×1.43, so its values are 100 / 220 / 160 ms of wall time (480 ms)
    cutin: { normal: { in: 180, hold: 380, out: 220 }, fast: { in: 143, hold: 315, out: 229 } },
  };
  let pt = 0, lastT = null, cur = null, port = null, timeScale = 1; // timeScale: tests and captures only
  const trace = [];
  const counters = { runs: 0, done: 0, settled: 0, hurried: 0, beats: 0, watchdogs: 0 };
  const timers = new Set();
  let onVis = null, onDown = null, layer = null;
  const stage = () => RB.battleStage;

  function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; }
  function clearTimers() { for (const id of timers) clearTimeout(id); timers.clear(); }
  // Battle animations (battle addendum §14.2): Normal / Fast / Instant, its own setting — Text
  // speed has no say here. Fast plays every action in about 70 % of its Normal time.
  const mode = () => { const m = RB.game.settings && RB.game.settings.battleAnim; return m === 'fast' || m === 'instant' ? m : 'normal'; };
  function speed() { return T.speed[mode()] || 1; }
  // Skip (§14.5): the rest of this exchange settles at once; cleared when the next decision is due
  let skipping = false;

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
    if (RB.harmonyCutin) RB.harmonyCutin.dispose('exit'); // (Harmony portrait: never outlives the encounter)
    skipping = false;
    if (RB.battleBanner) RB.battleBanner.clear();
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
    if (RB.harmonyCutin) RB.harmonyCutin.frame(pt); // (Harmony portrait: on this clock, hurried with it)
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
      const act = meta && meta.action ? meta.action : null;
      cur = { kind, cues, i: 0, t0: pt, end: endAt, resolve, hurried: false, started: performance.now(), rec: { kind, meta: meta || {}, fired: [], beats: [], hurried: false, settled: null, dur: 0, banner: null } };
      // Instant playback and an exchange being skipped: every result at once, in order; no
      // movement, no banner, no flash (§14.4)
      if (mode() === 'instant' || skipping) { counters.instant = (counters.instant || 0) + 1; settle(skipping ? 'skip' : 'instant'); return; }
      hook();
      // the action banner: this action only, inside its own interval (§15)
      if (act && RB.battleBanner) {
        const aEnd = Math.max(1, Math.min(endAt, act.end != null ? act.end : endAt));
        cur.banner = RB.battleBanner.show(act);
        cur.bannerOff = Math.max(0, aEnd - (T.bannerOut[mode()] || 120));
        cur.rec.banner = { id: act.id, side: act.side, start: 0, end: aEnd };
      }
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
    if (cur && cur.banner && el >= cur.bannerOff) { RB.battleBanner.hide(cur.banner); cur.banner = null; }
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
        if (c.type === 'pose') S.pose(c.who, c.pose, c.gesture, c.d, at, c.k); // (k: a held pose's fixed progress)
        else if (c.type === 'cutin') { if (RB.harmonyCutin) RB.harmonyCutin.start(c, at, cur.rec); } // Harmony portrait
        else if (c.type === 'foe') S.foe(c.act, c.d, at, { family: c.family, dir: c.dir, hold: c.hold, foe: c.foe || 0, travel: c.travel });
        else if (c.type === 'fx') S.effect(c.name, c.d, at, c.p);
        else if (c.type === 'strip') S.strip(c.word, c.from, c.to, at, c.tm);
        else if (c.type === 'num') S.number(c.to, c.text, c.kind, at);
    }
  }
  // Apply every remaining beat now (in order), drop the transient visuals, resolve.
  function settle(why) {
    if (!cur) return;
    while (cur.i < cur.cues.length) fire(cur.cues[cur.i++], true);
    if (RB.harmonyCutin) RB.harmonyCutin.dispose(why || 'skip'); // (Harmony portrait: settled with the rest)
    stage().clearTransient();
    counters.settled++;
    finish(why || 'skip');
  }
  // Skip the rest of the exchange: the playing sequence settles now, the ones after it settle as
  // they start (results once, in order); endExchange() — the next decision — clears it.
  function skip() {
    skipping = true;
    counters.skipped = (counters.skipped || 0) + 1;
    if (cur) settle('skip');
  }
  function endExchange() { skipping = false; }
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
    // the banner belongs to this action's interval: gone by its end, on every path
    if (c.banner && RB.battleBanner) { RB.battleBanner.hide(c.banner, true); c.banner = null; }
    if (RB.harmonyCutin) RB.harmonyCutin.dispose('end'); // (gone long before; a safety on every path)
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
  // What each response looks like — who acts, the gesture, the word's motion, where it lands — is the
  // party's choreography (src/ui/84p_party_choreo.js, RB.partyChoreo): planOf and the party's cases below
  // ask it, with the helpers in H.
  const OUTCOME = { unravel: 1, ward: 1, heal: 1, water: 1, light: 1, bind: 1, warm: 1, bell: 1, settle: 1, reveal: 1, tech: 1, comp: 1, cact: 1, soften: 1, stun: 1, draw: 1 };
  const fid = (ctx, i) => (i == null ? (ctx.foe == null ? 0 : ctx.foe) : i);
  const foeId = (ctx, i) => (ctx.group ? 'foe:' + fid(ctx, i) : 'foe');
  const knotId = (ctx, i, j) => (ctx.group ? 'knot:' + fid(ctx, i) + ':' + j : 'knot:' + j);
  const fview = (ctx, i) => (ctx.view.foes ? ctx.view.foes[fid(ctx, i)] : ctx.view) || ctx.view;
  // The reactions that belong to one fx beat (placed at the same moment).
  function reactions(Q, f, at, ctx, side) {
    // the party's side of a result (your response, your companion's action, a blow on one of you)
    if (RB.partyChoreo && RB.partyChoreo.react(Q, f, at, ctx, side, H)) return;
    const i = fid(ctx, f.foe);
    switch (f.t) {
      case 'heat': Q.push({ at: at - 60, type: 'fx', name: 'embers', d: 700, p: { foe: i } }); break;
      case 'shroud': break; // the mist roll arrives with the cast
      case 'charge': break;
      case 'mend': break;
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
  // what the party's choreography needs from here
  const H = { get T() { return T; }, fid, foeId, knotId, fview, healThen, stillNums, OUTCOME };

  // ---- creature-specific delivery (battle addendum §9.3, §18) ---------------------------------
  // addDelivery(art, kind, fn): how one creature performs a move — its own preparation, approach,
  // contact and recovery. kind: an intent kind ('strike', 'shroud' …), a family ('strike',
  // 'sweep', 'cast') or '*'. fn(a) → { cues, contact, end } with times in ms from the move's start:
  //   a = { kind, fam, me, aimed, dir, fv, comp, countered, wardBlock, ctx, T, foeCue(o), fx }
  //       (fx: the rules' results for this move, read-only — to choose a contact variant)
  //   cues: 'foe' (act, d, dir, family, travel, hold), 'fx', 'pose', 'sfx' only — never 'beat':
  //         the rules' results are placed here, at `contact`, in their order (dropped otherwise)
  //   contact: when the move arrives (the first result shows then); end: when its own
  //         performance (recovery included) is over — the action's interval for the banner
  // Without a delivery the generic choreography below plays.
  const DELIVERY = {};
  function addDelivery(art, kind, fn) { (DELIVERY[art] = DELIVERY[art] || {})[kind] = fn; }
  function deliveryOf(art, kind, fam) { const d = art && DELIVERY[art]; return d ? d[kind] || d[fam] || d['*'] || null : null; }
  const VISUAL = { foe: 1, fx: 1, pose: 1, sfx: 1 };
  function delivered(fn, a) {
    let r = null;
    try { r = fn(a); } catch (e) { console.error('battle delivery', e); r = null; }
    if (!r || !Array.isArray(r.cues) || !(r.contact >= 0)) return null;
    return { cues: r.cues.filter((c) => c && VISUAL[c.type] && c.at >= 0), contact: r.contact, end: Math.max(r.end || 0, r.contact + 200) };
  }

  const choreo = {
    // Your response (or your coordinated technique), once accepted and applied by the rules:
    // anticipation → gesture → the resolved word, moving in its own way → arrival on the actual
    // targets → each result in the rules' order → recovery (src/ui/84p_party_choreo.js).
    player(card, fx, ctx) { return RB.partyChoreo.player(card, fx, ctx, H); },
    // Your companion's support action (after your response, before the creatures): their own gesture,
    // then each result on its actual target.
    companion(act, fx, ctx) { return RB.partyChoreo.companion(act, fx, ctx, H); },
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
        if (!(ctx.wardBlock && single && deliveryOf(ctx.art, kind, fam))) foeCue({ at: t, act: 'prep', d: T.foePrep, dir, family: fam });
        const D = ctx.wardBlock && single ? deliveryOf(ctx.art, kind, fam) : null;
        const dv = D ? delivered(D, { kind, fam, me, aimed, dir, fv, comp, countered: true, wardBlock: true, ctx, T, foeCue: (o) => Object.assign({ type: 'foe', foe: me }, o), fx }) : null;
        if (dv) {
          // its own approach, stopped by the seal raised in front of its target
          for (const c of dv.cues) Q.push(Object.assign({}, c, { at: t + c.at }));
          const at = t + dv.contact;
          Q.push({ at, type: 'fx', name: 'sealBlock', d: 420, p: { to: aimed, n: 0 } });
          Q.push({ at, type: 'pose', who: aimed, pose: 'brace', d: 320 });
          for (const f of fx.filter((x) => x.t === 'countered')) { reactions(Q, f, at, ctx, 'enemy'); Q.push({ at, type: 'beat', f }); }
          spent(Q, at + 60);
          t += dv.end;
        } else {
          if (D) foeCue({ at: t, act: 'prep', d: T.foePrep, dir, family: fam }); // (its delivery failed: the generic one)
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
        }
      } else if (deliveryOf(ctx.art, kind, fam)) {
        // this creature's own performance of the move; the results arrive at its contact
        const dv = delivered(deliveryOf(ctx.art, kind, fam), { kind, fam, me, aimed, dir, fv, comp, countered: false, wardBlock: false, ctx, T, foeCue: (o) => Object.assign({ type: 'foe', foe: me }, o), fx });
        if (!dv) return choreo.enemy(it, fx, Object.assign({}, ctx, { art: null }));
        for (const c of dv.cues) Q.push(Object.assign({}, c, { at: t + c.at }));
        let at = t + dv.contact;
        const lastWho = {};
        for (const f of fx) {
          if (pre.indexOf(f) >= 0 || post.indexOf(f) >= 0) continue;
          if (f.t === 'hit' && lastWho[f.who] === 'block') at += 110;
          else if ((f.t === 'hit' || f.t === 'block') && Object.keys(lastWho).length && !lastWho[f.who]) at += T.secondTarget;
          reactions(Q, f, at, ctx, 'enemy');
          Q.push({ at, type: 'beat', f });
          if (f.t === 'hit' || f.t === 'block') lastWho[f.who] = f.t;
          if (f.t === 'stripWard') at += 90;
        }
        spent(Q, at + 60);
        t = Math.max(at + 200, t + dv.end);
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
    // The last knot comes loose: the creature (every one still standing) settles and the two of you ease,
    // each in your own way.
    finish(seqEnd, ctx) { return RB.partyChoreo.finish(seqEnd, ctx); },
    // Your companion helps you back to your feet (the rules' revive).
    revive(ctx) { return RB.partyChoreo.revive(ctx); },
  };

  function stats() {
    return { running: !!cur, kind: cur && cur.kind, pt: Math.round(pt), timers: timers.size, layer: !!layer, pointer: !!onDown, attached: !!port, counters: Object.assign({}, counters) };
  }
  // setTimeScale(k): slow the presentation clock (k < 1) for frame captures; tests and tools only
  return { T, attach, detach, tick, now, run, settle, hurry, skip, endExchange, skipping: () => skipping, mode, busy: () => !!cur, current: () => (cur ? { kind: cur.kind, banner: !!cur.banner, t: Math.round(pt - cur.t0), end: cur.end } : null), choreo, planOf: (card, fx, ctx) => RB.partyChoreo.planOf(card, fx, ctx, H), addDelivery, deliveryOf, stats, trace: () => trace.slice(), setTimeScale: (k) => { timeScale = Math.max(0.05, Math.min(4, +k || 1)); } };
})();
