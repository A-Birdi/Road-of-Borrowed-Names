/* Fishing pace (Practice addendum §7, §1.3, §20.3, §21; docs/practice/pace.md):
 * the optional clock on ONE fishing response entry, its Pace meter, Ready,
 * Pause, soft expiry, calibration and the separate timing records. The math,
 * the clock and the records are in src/engine/76_pace.js (RB.paceCore).
 *
 *   RB.pace.attempt(step, o) -> Promise<result>
 *     o: { pace: 'off'|'gentle'|'brisk'|'custom', budgetSec? (custom), header?, ctxTag?,
 *          representation? ('kana'|'mixed' default before Ready), taskId?, session?, runOpts? }
 *     result: the RB.challenge.runStep result (noRecord: nothing reaches ordinary mastery
 *       here) + paced: { kind, clock: 'none'|'measure'|'timed', timed, budgetMs, activeMs,
 *       expired, onTime, convertedToUntimed, pauseReasons, inputMode, pointerClass,
 *       representation, bucket, recognitionRepair, assistance, submittedResult, letGo,
 *       sample, excluded }
 *   RB.pace.budgets(s, ctx) -> { gentle, brisk, samples, needed, reason, … }
 *   RB.pace.available(s, ctx) -> bool       a pace other than Off can be offered
 *   RB.pace.setupHtml(s) / wireSetup(el, s, { onChange }) / openSetup(s)   the Pace control
 *   RB.pace.summary(s), RB.pace.current(), RB.pace.dev (local diagnostics, consent-gated)
 *
 * Shared-code hooks: src/ui/65_challenge.js passes `opts.pace` (these hooks) only
 * when RB.pace.attempt runs a step, and hands them to the pad (src/ui/60_pad.js).
 * Every other challenge, lesson, battle and activity has no clock at all. */
RB.pace = (function () {
  'use strict';
  const C = RB.paceCore;
  const esc = RB.util.esc;
  const PAUSE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6v12M15 6v12"/></svg>';
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 5.5l11 6.5-11 6.5z"/></svg>';
  const NAMES = { off: 'Off — A Quiet Cast', gentle: 'Gentle — A Little Current', brisk: 'Brisk — A Quick Current', custom: 'Custom' };
  const SHORT = { off: 'Off', gentle: 'Gentle', brisk: 'Brisk', custom: 'Custom' };
  const EXPIRY = 'The line is loosening. Continue at your own pace, or let this one go.';
  const CAUSE = {
    help: 'word help is open', modal: 'another window is open', hidden: 'the game was in the background', blur: 'the window lost focus',
    layout: 'the screen changed size', 'pointer-cancel': 'the pen or finger was interrupted', device: 'the input device changed',
    pause: 'you paused', 'candidate-review': 'you are checking what the pad read', 'recognition-repair': 'you are correcting what the pad read', settings: 'settings are open',
  };
  const UNTIMED_WHY = {
    player: 'you chose to finish untimed', expired: 'the pace ran out', 'content-correction': 'you are correcting the answer',
    'answer-shown': 'the answer was shown', 'input-changed': 'you switched how to answer', 'representation-changed': 'you changed between kana and kanji',
    'device-changed': 'you switched to a different pen, finger or mouse', 'settings-changed': 'the pace settings changed',
  };
  const NOTE = {
    'too-long': 'this answer is too long to time in this release, so it is untimed.',
    unknown: 'Gentle and Brisk cannot compare this kind of answer, so it is untimed. Custom can still time it.',
    layout: 'your Gentle and Brisk times were set on a different screen layout, so this answer is untimed. Recalibrate when you like.',
    'over-180': 'this pace would be longer than 180 seconds for this kind of answer, so it is untimed. Choose Custom or Off if you prefer.',
    'custom-unset': 'no Custom seconds are set, so this answer is untimed.',
  };
  let cur = null;          // the live attempt (one at a time)
  let lastPtr = null;      // the last handwriting pointer class seen during an attempt
  const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);
  const S = () => (RB.game && RB.game.s) || null;
  const reduced = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
  const showSecs = () => !!(RB.game && RB.game.settings && RB.game.settings.fishSeconds);
  const clampSec = (v) => { v = Math.round(+v); return isFinite(v) ? Math.min(C.LIMITS.customMax, Math.max(C.LIMITS.customMin, v)) : null; };
  const guessPtr = () => (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse');
  // the pad's size class follows the challenge's own layout breakpoints (60_learning.css)
  function layoutClass() {
    if (typeof window === 'undefined') return 'M';
    const w = window.innerWidth, h = window.innerHeight;
    return w >= 900 && h >= 560 ? 'L' : w < 600 ? 'S' : 'M';
  }

  // ---- what a step allows ----------------------------------------------------------------
  function planFor(o) {
    // o: { s, kind, step, input, repr, pointer, customSec, measureOff, layout }
    const sel = o.input === 'choice' || o.input === 'order';
    const repr = sel ? 'select' : o.repr;
    const cx = C.complexity(o.step, repr, { options: o.options });
    const bk = C.bucketKey({ input: o.input, pointer: o.pointer, repr, cx });
    const base = { kind: o.kind, input: o.input, repr, pointer: o.pointer, key: bk.key || null, layout: o.input === 'hand' ? o.layout : null, cx };
    if (o.kind === 'off') {
      if (o.measureOff && bk.key) return Object.assign(base, { clock: 'measure', b: C.budgets(o.s, { key: bk.key, layout: base.layout }) });
      return Object.assign(base, { clock: 'none' });
    }
    if (bk.reason === 'too-long') return Object.assign(base, { clock: 'none', note: 'too-long' });
    if (o.kind === 'custom') {
      const sec = clampSec(o.customSec);
      if (sec == null || o.customSec == null) return Object.assign(base, { clock: 'none', note: 'custom-unset' });
      return Object.assign(base, { clock: 'timed', budgetMs: sec * 1000, sec });
    }
    if (!bk.key) return Object.assign(base, { clock: 'none', note: 'unknown' });
    const b = C.budgets(o.s, { key: bk.key, layout: base.layout });
    base.b = b;
    if (b.reason === 'collecting') return Object.assign(base, { clock: 'measure' });
    if (b.reason === 'layout') return Object.assign(base, { clock: 'none', note: 'layout' });
    const sec = b[o.kind];
    if (sec == null) return Object.assign(base, { clock: 'none', note: 'over-180' });
    return Object.assign(base, { clock: 'timed', budgetMs: sec * 1000, sec, proposal: b.reason === 'proposal' });
  }
  function budgets(s, ctx) {
    ctx = ctx || {};
    s = s || S();
    if (ctx.key) return C.budgets(s, { key: ctx.key, layout: ctx.layout });
    if (!ctx.step) return { gentle: null, brisk: null, samples: 0, needed: C.LIMITS.needed, reason: 'no-context' };
    const input = ctx.inputMode || 'hand';
    const repr = input === 'choice' || input === 'order' ? 'select' : ctx.representation || C.representations(ctx.step).filter((r) => r !== 'select')[0];
    const cx = C.complexity(ctx.step, repr, {});
    const bk = C.bucketKey({ input, pointer: ctx.pointerClass || (input === 'ime' ? null : guessPtr()), repr, cx });
    if (!bk.key) return { gentle: null, brisk: null, samples: 0, needed: C.LIMITS.needed, reason: bk.reason };
    return C.budgets(s, { key: bk.key, layout: ctx.layout || (input === 'hand' ? layoutClass() : null) });
  }
  function available(s, ctx) {
    if (!ctx || !ctx.step) return true;   // Custom can always be chosen; Gentle/Brisk say what they need
    const reps = C.representations(ctx.step);
    if (!reps.length) return true;
    return reps.some((r) => !C.complexity(ctx.step, r, {}).untimed);
  }

  // ---- one attempt ------------------------------------------------------------------------
  function controller(step, o, s) {
    const settings = RB.practice && s ? RB.practice.settings(s) : {};
    const kind = C.KINDS.indexOf(o.pace) >= 0 ? o.pace : 'off';
    const customSec = o.budgetSec != null ? o.budgetSec : settings.fishingCustomSec;
    const measureOff = !!settings.fishingPaceMeasure;
    const reps = C.representations(step).filter((r) => r !== 'select');
    // the intended representation: the caller's or the player's explicit choice; otherwise
    // handwriting follows the pad's kanji preference (never the answer) and typing starts on kana
    let reprChosen = !!(o.representation && reps.indexOf(o.representation) >= 0);
    let repr = reps.length > 1 ? (reprChosen ? o.representation : 'kana') : reps[0] || null;
    const defaultRepr = (input) => (reps.length < 2 || reprChosen ? repr : input === 'hand' && RB.pad && RB.pad.kanjiPreferred && RB.pad.kanjiPreferred() ? 'mixed' : 'kana');
    let api = null, plan = null, clk = null, phase = 'init', disposed = false;
    let mode = null, ptr = null, readyPtr = null, ptrNote = '';
    let lastInput = { t: -1, kind: null }, blurred = false, strokeOn = false, composing = false, pendingExpiry = false, expiryShown = false;
    let lastCause = null, letGo = false, outcomeKind = null, result = null, size = null, lastHint = null; // the slip was drawn (before mount) with the default hint
    const env = { help: false, modal: false, hidden: false, blur: false };
    const flags = { repair: 0, review: 0, contentErrors: 0, reveal: false, exposed: false, chart: false, inputChanged: false, deviceChanged: false, reprChanged: false, reprMismatch: false, pointerCancel: 0, layout: 0, assist: new Set(), ptrs: new Set(), submitPtr: null };
    const timers = { deadline: null, meter: null };
    const cleanups = [];
    const el = { bar: null, cover: null, veil: null };
    const listen = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); };
    const timed = () => !!(clk && clk.timed());
    const visibleClock = () => plan && plan.clock === 'timed';

    function replan() {
      const input = mode || 'hand';
      if (phase === 'gate' || phase === 'init') repr = defaultRepr(input);
      if (input === 'hand') ptr = readyPtr || lastPtr || guessPtr();
      else if (input === 'choice' || input === 'order') ptr = readyPtr || (lastInput.kind || guessPtr());
      else ptr = null;
      plan = planFor({ s, kind, step, input, repr, pointer: ptr, customSec, measureOff, layout: layoutClass() });
      return plan;
    }

    // ---- environment: help, layers, background, focus, size ----------------------------------
    function envNow() {
      const ov = RB.ui && RB.ui.overlay;
      return {
        help: !!(ov && Array.prototype.some.call(ov.children, (c) => c.classList && c.classList.contains('help'))),
        modal: !!(api && RB.ui.topLayer && RB.ui.topLayer() && RB.ui.topLayer() !== api.layer),
        hidden: typeof document !== 'undefined' && document.visibilityState === 'hidden',
        blur: blurred,
      };
    }
    function syncEnv() {
      if (disposed) return;
      const e = envNow();
      let changed = false;
      for (const k in e) {
        if (e[k] === env[k]) continue;
        env[k] = e[k];
        changed = true;
        if (e[k]) { lastCause = k; if (k === 'help') flags.assist.add('word-help'); }
        if (clk && !clk.finished) { if (e[k]) clk.pause(k); else clk.release(k); }
      }
      if (changed) render();
    }
    function onResize() {
      if (disposed || !size) return;
      const w = window.innerWidth, h = window.innerHeight;
      const textFocus = RB.input && RB.input.isTextTarget && RB.input.isTextTarget(document.activeElement);
      const changed = w !== size.w || (h !== size.h && !textFocus);   // a software keyboard alone does not count
      size = { w, h };
      if (!changed) return;
      if (phase === 'gate') { replan(); render(); return; }
      if (clk && clk.started && !clk.finished) { flags.layout++; lastCause = 'layout'; clk.interrupt('layout'); render(); }
    }
    // an entry action (stroke, key, choice): starts a settling clock at once, and
    // ends an untimed pause (a timed one waits for Continue)
    function entryAction() {
      if (phase === 'settling') begin();
      if (clk && !clk.consent && !clk.finished && (clk.hold || clk.reasons().some((r) => C.USER.indexOf(r) >= 0))) { clk.resume(); render(); }
    }
    function install() {
      size = { w: window.innerWidth, h: window.innerHeight };
      listen(document, 'visibilitychange', syncEnv);
      listen(window, 'blur', () => { blurred = true; syncEnv(); });
      listen(window, 'focus', () => { blurred = false; syncEnv(); });
      listen(window, 'resize', onResize);
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.addEventListener) listen(screen.orientation, 'change', () => { size = { w: -1, h: -1 }; onResize(); });
      listen(document, 'pointerdown', (e) => {
        lastInput = { t: now(), kind: e.pointerType === 'mouse' || e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : null };
        if (api && (api.sheet.contains(e.target) || api.answer.contains(e.target)) && phase !== 'gate') entryAction();
      }, true);
      listen(document, 'keydown', (e) => {
        lastInput = { t: now(), kind: 'key' };
        if (api && api.wrap.contains(e.target) && RB.input.isTextTarget(e.target)) entryAction();
      }, true);
      if (typeof MutationObserver !== 'undefined') {
        const mo = new MutationObserver(syncEnv);
        if (RB.ui.overlay) mo.observe(RB.ui.overlay, { childList: true });
        if (RB.ui.root) mo.observe(RB.ui.root, { childList: true });
        cleanups.push(() => mo.disconnect());
      }
    }
    function watchIme() {
      const ime = api && api.ime();
      if (!ime || ime.__pace) return;
      ime.__pace = true;
      listen(ime.inp, 'compositionstart', () => { composing = true; entryAction(); });
      listen(ime.inp, 'compositionend', () => { composing = false; setTimeout(afterInputSettles, 0); });
      listen(ime.inp, 'input', () => hooks.draft());
    }

    // ---- the clock's life --------------------------------------------------------------------
    function makeClock() {
      clk = C.clock({ budgetMs: plan.clock === 'timed' ? plan.budgetMs : null, consent: plan.clock === 'timed' });
      const e = envNow();
      for (const k in e) { env[k] = e[k]; if (e[k]) clk.pause(k); }
      clk.on((what) => { schedule(); if (what === 'expire') onExpire(); });
    }
    function begin() {
      if (disposed || phase !== 'settling') return;
      phase = 'active';
      clk.start();
      render();
    }
    // After Ready (or, untimed Off, once the task shows): the clock starts when the
    // input is focused and the reveal and any software-keyboard motion have settled.
    function settleThen() {
      phase = 'settling';
      render();
      const vv = window.visualViewport;
      let frames = 0, stable = 0, lastH = vv ? Math.round(vv.height) : 0;
      const t0 = now();
      const stepF = () => {
        if (disposed || phase !== 'settling') return;
        const h = vv ? Math.round(vv.height) : 0;
        stable = h === lastH ? stable + 1 : 0;
        lastH = h;
        frames++;
        if ((frames >= 2 && stable >= 2) || now() - t0 > 700) begin();
        else requestAnimationFrame(stepF);
      };
      requestAnimationFrame(stepF);
    }
    function schedule() {
      clearTimeout(timers.deadline);
      timers.deadline = null;
      if (disposed || !clk) return;
      if (clk.timed() && clk.running()) timers.deadline = setTimeout(() => { if (clk) clk.tick(); }, Math.max(0, clk.remaining()) + 2);
      const want = visibleClock() && clk.started && !clk.finished;
      if (want && !timers.meter) timers.meter = setInterval(() => { if (clk) { clk.tick(); syncEnv(); meter(); } }, reduced() ? 1000 : 200);
      else if (!want && timers.meter) { clearInterval(timers.meter); timers.meter = null; }
    }
    function onExpire() {
      if (strokeOn || composing) { pendingExpiry = true; render(); return; }   // let the stroke or composition finish
      showExpiry();
    }
    function afterInputSettles() {
      if (pendingExpiry && !strokeOn && !composing && clk && clk.frozen) { pendingExpiry = false; showExpiry(); }
    }

    // ---- interface --------------------------------------------------------------------------
    function focusInput() {
      if (!api) return;
      const m = api.mode();
      let t = null;
      if (m === 'ime' && api.ime()) t = api.ime().inp;
      else if (m === 'choice') t = api.sheet.querySelector('.mc .btn:not([disabled])');
      else if (m === 'order') t = api.sheet.querySelector('.tiles .tile');
      else { t = api.sheet.querySelector('.pad-box'); if (t) t.setAttribute('tabindex', '-1'); }
      if (t) t.focus({ preventScroll: true });
    }
    function buildBar() {
      const b = RB.ui.el('div', 'pace-bar');
      b.setAttribute('role', 'group');
      b.setAttribute('aria-label', 'Pace');
      b.innerHTML = '<span class="pace-lab">Pace</span><span class="pace-mode"></span>' +
        '<svg class="pace-line" viewBox="0 0 120 26" aria-hidden="true" focusable="false"><path class="rod" d="M3 24L16 4"/><path class="ln" d="M16 4L110 14"/><circle class="fl" cx="111" cy="16" r="3.2"/></svg>' +
        '<span class="pace-secs" role="timer"></span><span class="pace-st" aria-live="polite"></span>' +
        '<span class="pace-acts"><button class="cbtn pace-b" data-pace="pause">' + PAUSE_SVG + '<span>Pause</span></button>' +
        '<button class="cbtn pace-b" data-pace="continue" hidden>' + PLAY_SVG + '<span>Continue</span></button>' +
        '<button class="cbtn pace-b" data-pace="untimed">Untimed</button></span>';
      b.addEventListener('click', onClick);
      api.frame.insertBefore(b, api.body);
      el.bar = b;
    }
    function gateHtml() {
      const p = plan, label = p.key ? C.describe(p.key).toLowerCase() : '';
      let h = '<p class="pace-gh">Pace: <b>' + esc(NAMES[kind]) + '</b></p>';
      if (p.clock === 'timed') {
        if (kind === 'custom') h += '<p class="pace-gb">You chose <b>' + p.sec + ' seconds</b> of answering time.</p>';
        else if (p.proposal) h += '<p class="pace-gb">' + esc(SHORT[kind]) + ' is ready for this kind of answer (' + esc(label) + '): <b>' + p.sec + ' seconds</b>, from ' + p.b.samples + ' of your untimed answers. Pressing Ready keeps this time until you recalibrate.</p>';
        else h += '<p class="pace-gb"><b>' + p.sec + ' seconds</b> of answering time for this kind of answer (' + esc(label) + ').</p>';
      } else {
        const n = p.b ? p.b.samples : 0;
        h += '<p class="pace-gb">' + (kind === 'off' ? 'Pace is off. ' : esc(SHORT[kind]) + ' is not prepared for this kind of answer yet (' + n + ' of ' + C.LIMITS.needed + ' untimed answers). ') +
          'This answer is <b>untimed</b>. Press Ready when you start answering, so it can help prepare Gentle and Brisk' + (label ? ' for ' + esc(label) : '') + '.</p>';
      }
      if (ptrNote) h += '<p class="pace-gn" role="status">' + esc(ptrNote) + '</p>';
      const writing = (mode === 'hand' || mode === 'ime') && reps.length > 1;
      if (writing) {
        h += '<fieldset class="pace-repr"><legend>How you will write it</legend>' +
          ['kana', 'mixed'].map((r) => '<label><input type="radio" name="pace-repr" value="' + r + '"' + (repr === r ? ' checked' : '') + '><span>' + (r === 'kana' ? 'Kana' : 'Supported mixed-kanji writing') + '</span></label>').join('') + '</fieldset>';
      }
      h += '<div class="pace-gacts"><button class="pbtn primary pace-ready" data-pace="ready">' + PLAY_SVG + '<span>Ready</span></button>' +
        '<button class="pbtn" data-pace="untimed">' + (p.clock === 'timed' ? 'Answer untimed instead' : 'Answer without measuring') + '</button></div>';
      // the explanation follows the buttons, so Ready stays in view on short screens
      h += '<p class="pace-gx small">' + (p.clock === 'timed'
        ? 'Read the task first. The clock starts when you press Ready and runs only while you answer. Word help, checking what the pad read, Pause and leaving the game stop it. If it runs out, the line loosens and you can still finish untimed. Pace never changes the fish.'
        : 'Nothing is timed. Help, Pause and leaving the game are left out of the measurement. Pace never changes the fish.') + '</p>';
      return h;
    }
    function renderGate() {
      if (!el.cover) {
        el.cover = RB.ui.el('div', 'pace-cover');
        el.cover.addEventListener('click', onClick);
        el.cover.addEventListener('change', (e) => {
          const r = e.target.closest('input[name=pace-repr]');
          if (!r) return;
          repr = r.value;
          reprChosen = true;
          if (api.pad() && api.pad().setMode) api.pad().setMode(repr === 'mixed' ? 'kanji' : (RB.pad && api.pad()._state ? api.pad()._state.kanaScript : 'any'));
          replan();
          render();
          const back = el.cover.querySelector('input[name=pace-repr][value="' + repr + '"]');
          if (back) back.focus({ preventScroll: true });
        });
      }
      if (el.cover.parentNode !== api.sheet) api.sheet.insertBefore(el.cover, api.sheet.firstChild);
      // rebuilt only when it says something new, so keyboard focus stays put
      const h = gateHtml();
      if (el.cover.__h !== h) { el.cover.innerHTML = h; el.cover.__h = h; }
    }
    function slack(f) {
      // taut at the start, sagging as the window runs out
      const sag = 2 + Math.max(0, Math.min(1, f)) * 16;
      return 'M16 4Q63 ' + (9 + sag).toFixed(1) + ' 110 14';
    }
    function meter() {
      if (!el.bar || !clk) return;
      const total = clk.budgetMs || 1;
      const left = clk.timed() ? clk.remaining() : 0;
      const f = clk.timed() ? 1 - left / total : 1;
      el.bar.querySelector('.ln').setAttribute('d', slack(clk.frozen || !clk.timed() ? 1 : f));
      const secs = el.bar.querySelector('.pace-secs');
      const txt = clk.timed() ? Math.ceil(left / 1000) + ' s left' : '';
      secs.textContent = txt;
      secs.setAttribute('aria-label', clk.timed() ? 'Pace: ' + Math.ceil(left / 1000) + ' of ' + Math.round(total / 1000) + ' seconds left' : 'Pace: untimed');
    }
    function stateText() {
      if (phase === 'gate') return plan.clock === 'timed' ? 'Starts when you press Ready' : 'Untimed';
      if (phase === 'settling') return 'Starting…';
      if (!clk) return '';
      if (clk.finished) return outcomeKind === 'ok' ? (timed() && clk.snapshot().lastSubmit && clk.snapshot().lastSubmit.onTime ? 'Answered at your chosen pace' : 'Answered') : '';
      if (clk.frozen) return pendingExpiry ? 'The line is loosening — finish what you are writing' : 'The line is loosening';
      if (!clk.timed()) return plan.clock === 'timed' ? 'Untimed now: ' + (UNTIMED_WHY[clk.converted] || 'take your time') : 'Untimed';
      if (clk.running()) return 'Running';
      const rs = clk.reasons().filter((r) => r !== 'processing' && r !== 'evaluating');
      const cause = rs.length ? rs[rs.length - 1] : lastCause;
      return 'Paused: ' + (CAUSE[cause] || 'continue when you are ready');
    }
    function veilWanted() {
      if (!clk || !visibleClock() || !clk.timed() || clk.finished || phase !== 'active') return null;
      if (expiryShown && clk.frozen) return 'expiry';
      if (clk.frozen) return null;
      if (clk.has('pause')) return 'pause';
      const rs = clk.reasons().filter((r) => r !== 'processing' && r !== 'evaluating');
      if (rs.some((r) => r === 'help' || r === 'modal' || r === 'candidate-review' || r === 'recognition-repair')) return null;
      return clk.hold ? 'pause' : null;
    }
    function render() {
      if (disposed || !api) return;
      const wantBar = plan.clock !== 'none' || !!plan.note;
      if (wantBar && !el.bar) buildBar();
      if (el.bar) {
        const b = el.bar;
        b.setAttribute('data-state', phase === 'gate' ? 'gate' : !clk ? 'idle' : clk.finished ? 'done' : clk.frozen ? 'expired' : !clk.timed() ? 'untimed' : clk.running() ? 'running' : 'paused');
        b.setAttribute('data-clock', plan.clock);
        let modeTxt = '';
        if (plan.clock === 'timed') modeTxt = SHORT[kind] + ' · ' + plan.sec + ' s';
        else if (plan.clock === 'measure') modeTxt = kind === 'off' ? 'Off · measuring this untimed answer' : SHORT[kind] + ' is being prepared · this answer is untimed (' + (plan.b ? plan.b.samples : 0) + ' of ' + C.LIMITS.needed + ')';
        else modeTxt = SHORT[kind] + ' · ' + (NOTE[plan.note] || 'untimed');
        b.querySelector('.pace-mode').textContent = modeTxt;
        const st = stateText();
        const stEl = b.querySelector('.pace-st');
        if (stEl.textContent !== st) stEl.textContent = st;
        b.querySelector('.pace-line').style.display = plan.clock === 'timed' ? '' : 'none';
        const secs = b.querySelector('.pace-secs');
        secs.classList.toggle('sr', !showSecs());
        secs.hidden = plan.clock !== 'timed';
        const live = visibleClock() && clk && clk.started && !clk.finished && clk.timed() && !clk.frozen;
        b.querySelector('[data-pace=pause]').hidden = !(live && clk.running());
        b.querySelector('[data-pace=continue]').hidden = !(live && !clk.running() && clk.hold || (live && clk.reasons().some((r) => r === 'candidate-review' || r === 'recognition-repair')));
        b.querySelector('[data-pace=untimed]').hidden = !(live || (phase === 'settling' && plan.clock === 'timed'));
        b.classList.toggle('dashed', !!(clk && !clk.running()));
        if (plan.clock === 'timed') { if (clk) meter(); else b.querySelector('.ln').setAttribute('d', slack(0)); }
      }
      // the answer slip's hint says whether this answer is timed (only when that changes:
      // the slip is a live region)
      const hint = hooks.hint();
      if (hint !== lastHint) { lastHint = hint; api.setHint(); }
      api.wrap.classList.toggle('pace-gated', phase === 'gate');
      if (phase === 'gate') renderGate();
      else if (el.cover) { el.cover.remove(); el.cover = null; }
      renderVeil();
    }
    function renderVeil() {
      const want = veilWanted();
      if (!want) {
        if (el.veil) {
          const had = el.veil.contains(document.activeElement);
          el.veil.remove(); el.veil = null; api.body.inert = false;
          if (had) focusInput();
        }
        return;
      }
      const kindNow = el.veil && el.veil.getAttribute('data-veil');
      if (kindNow === want && el.veil.isConnected) { placeVeil(); if (want === 'pause') el.veil.querySelector('.pace-why').textContent = 'Paused: ' + (CAUSE[clk.has('pause') ? 'pause' : lastCause] || 'continue when you are ready') + '.'; return; }
      if (el.veil) el.veil.remove();
      const v = RB.ui.el('div', 'pace-veil');
      const id = 'pv' + Math.random().toString(36).slice(2, 7);
      v.setAttribute('data-veil', want);
      v.setAttribute('role', want === 'expiry' ? 'alertdialog' : 'dialog');
      v.setAttribute('aria-labelledby', id);
      if (want === 'expiry') {
        v.innerHTML = '<div class="pace-card"><p class="pace-exp" id="' + id + '"><strong>' + esc(EXPIRY) + '</strong></p>' +
          '<p class="small">What you have written so far is kept.</p>' +
          '<div class="pace-vacts"><button class="pbtn primary" data-pace="untimed-continue">Continue untimed</button><button class="pbtn" data-pace="let-go">Let it go</button></div></div>';
      } else {
        v.innerHTML = '<div class="pace-card"><p class="pace-why" id="' + id + '">Paused: ' + esc(CAUSE[clk.has('pause') ? 'pause' : lastCause] || 'continue when you are ready') + '.</p>' +
          '<p class="small">The clock is stopped and your answer so far is kept.</p>' +
          '<div class="pace-vacts"><button class="pbtn primary" data-pace="continue">' + PLAY_SVG + '<span>Continue</span></button><button class="pbtn" data-pace="untimed">Finish untimed</button></div></div>';
      }
      v.addEventListener('click', onClick);
      api.frame.appendChild(v);
      el.veil = v;
      api.body.inert = true;
      placeVeil();
      const f = v.querySelector('.pbtn.primary');
      if (f && env.hidden === false) setTimeout(() => { if (el.veil === v && v.isConnected) f.focus({ preventScroll: true }); }, 0);
    }
    function placeVeil() { if (el.veil) el.veil.style.top = api.body.offsetTop + 'px'; }
    function showExpiry() {
      if (!clk || !clk.frozen || clk.finished) return;
      expiryShown = true;
      render();
    }
    function onClick(e) {
      const b = e.target.closest('[data-pace]');
      if (!b || b.disabled) return;
      const a = b.getAttribute('data-pace');
      if (a === 'ready') ready(e);
      else if (a === 'pause' && clk && clk.running()) { lastCause = 'pause'; clk.pause('pause'); render(); }
      else if (a === 'continue' && clk) { clk.resume(); render(); if (!el.veil) focusInput(); }
      else if (a === 'untimed') untimed('player');
      else if (a === 'untimed-continue' && clk) { expiryShown = false; clk.continueUntimed(); render(); focusInput(); }
      else if (a === 'let-go') { letGo = true; expiryShown = false; api.finish(true); }
    }
    // Ready: the clock starts once the task is rendered, the input focused and
    // the reveal settled. A press with another kind of pointer than the one the
    // gate showed re-plans first (never a budget the player has not seen).
    function ready(e) {
      if (phase !== 'gate') return;
      const pt = e && e.detail !== 0 && e.pointerType ? e.pointerType : e && e.detail === 0 ? 'key' : null;
      const m = api.mode();
      if (pt && (m === 'hand' ? pt !== 'key' : m === 'choice' || m === 'order')) {
        const before = plan;
        readyPtr = m === 'hand' && pt === 'key' ? ptr : pt;
        replan();
        if (plan.key !== before.key || plan.clock !== before.clock || plan.budgetMs !== before.budgetMs) {
          ptrNote = 'Pace now follows your ' + (readyPtr === 'key' ? 'keyboard' : readyPtr) + ': check it, then press Ready again.';
          render();
          const r = el.cover && el.cover.querySelector('[data-pace=ready]');
          if (r) r.focus({ preventScroll: true });
          return;
        }
      }
      ptrNote = '';
      if (plan.clock === 'timed' && plan.proposal) C.accept(s, plan.key, plan.layout, Date.now());
      makeClock();
      api.wrap.classList.remove('pace-gated');
      if (el.cover) { el.cover.remove(); el.cover = null; }
      focusInput();
      settleThen();
    }
    function untimed(why) {
      if (phase === 'gate') {
        // before Ready: this answer simply has no clock (and is not measured)
        plan = Object.assign({}, plan, { clock: 'none', note: null, declined: true });
        phase = 'active';
        clk = C.clock({ budgetMs: null, consent: false });
        clk.on(() => schedule());
        clk.start();
        render();
        focusInput();
        return;
      }
      if (clk && clk.convert(why)) { expiryShown = false; render(); focusInput(); }
    }

    // ---- hooks called by the challenge runner and the pad -------------------------------------
    const hooks = {
      mount(a) {
        api = a;
        mode = a.mode();
        install();
        replan();
        watchIme();
        if (plan.clock === 'timed' || plan.clock === 'measure') { phase = 'gate'; render(); }
        else { makeClock(); render(); settleThen(); }
      },
      modeShown(m, how) {
        if (!api) return;
        const prev = mode;
        mode = m;
        watchIme();
        if (phase === 'gate') { replan(); render(); return; }
        if (how === 'tab' && prev && prev !== m && clk && clk.started) {
          flags.inputChanged = true;
          if (clk.timed()) clk.convert('input-changed');
          render();
        }
      },
      submit(modeUsed) {
        if (!clk) return null;
        if (phase === 'settling') begin();
        if (modeUsed === 'choice' || modeUsed === 'order') flags.submitPtr = lastInput.kind;
        const text = hooks.text();
        if (repr === 'mixed' && (modeUsed === 'hand' || modeUsed === 'ime') && text && !RB.kana.hasKanji(text)) flags.reprMismatch = true;
        const stamp = clk.submit();
        render();
        return stamp;
      },
      outcome(k) {
        if (!clk) return;
        clk.release('evaluating');
        if (k === 'ok') { outcomeKind = 'ok'; clk.finish(); }
        else if (k === 'unsure') { flags.repair++; lastCause = 'recognition-repair'; clk.pause('recognition-repair'); }
        else if (k === 'wrong') { flags.contentErrors++; if (clk.timed()) clk.convert('content-correction'); }
        else if (k === 'misread') {
          // the player says the recognizer misread: not a Japanese error, and it costs nothing
          flags.contentErrors = Math.max(0, flags.contentErrors - 1);
          flags.repair++;
          lastCause = 'recognition-repair';
          if (!clk.unconvert('content-correction')) clk.pause('recognition-repair');
        }
        render();
      },
      assist(why) {
        if (why === 'reveal') { flags.reveal = true; flags.assist.add('answer-shown'); if (clk && clk.timed()) clk.convert('answer-shown'); }
        else if (why === 'model') { flags.exposed = true; flags.assist.add('stroke-model'); }
        else if (why === 'chart') { flags.chart = true; flags.assist.add('chart'); }
        else if (why === 'correction') flags.assist.add('other-candidate');
        else if (why) flags.assist.add(String(why));
        render();
      },
      text() {
        if (!api) return '';
        const m = api.mode();
        if (m === 'hand' && api.pad()) return api.pad().text();
        if (m === 'ime' && api.ime()) return api.ime().inp.value;
        return '';
      },
      draft() {
        if (!clk || !clk.started || flags.reprChanged) return;
        if (repr === 'kana' && RB.kana.hasKanji(hooks.text())) {
          flags.reprChanged = true;
          if (clk.timed()) clk.convert('representation-changed');
          render();
        }
      },
      hint() {
        if (!plan || plan.clock === 'none') return null;
        if (plan.clock === 'timed') return clk && !clk.timed() ? null : 'Pace is on: the clock runs only while you answer. Help, checking what the pad read, and leaving the game pause it.';
        return 'Nothing is timed. This answer is measured to prepare your Gentle and Brisk pace.';
      },
      onAction(a) {
        if (!el.veil) return false;
        if (a === 'cancel') {
          // Back on the expiry sheet keeps the catch (the safe choice); on a pause it does nothing
          if (el.veil.getAttribute('data-veil') === 'expiry') { expiryShown = false; clk.continueUntimed(); render(); focusInput(); }
          return true;
        }
        return false;
      },
      finish(cancelled, res) {
        result = res;
        if (clk && !clk.finished) clk.finish();
        dispose();
      },
      // ---- pad ----
      stroke(phaseS, e) {
        if (phaseS === 'down') {
          const p = e && e.pointerType;
          if (p === 'mouse' || p === 'touch' || p === 'pen') { flags.ptrs.add(p); lastPtr = p; }
          strokeOn = true;
          entryAction();
          if (clk && clk.started && clk.timed() && plan.pointer && p && p !== plan.pointer && (p === 'mouse' || p === 'touch' || p === 'pen')) {
            flags.deviceChanged = true;
            clk.convert('device-changed');
            render();
          }
          return;
        }
        strokeOn = false;
        if (phaseS === 'cancel' || phaseS === 'lost') {
          // a cancelled pointer or lost capture mid-stroke (not a normal release)
          flags.pointerCancel++;
          lastCause = 'pointer-cancel';
          if (clk) clk.interrupt('pointer-cancel');
          render();
        }
        setTimeout(afterInputSettles, 0);
      },
      busy(on) { if (clk && clk.started && !clk.finished) { if (on) clk.pause('processing'); else clk.release('processing'); } },
      review(k) {
        if (!clk || !clk.started || clk.finished) return;
        if (k === 'repair') { flags.repair++; if (!clk.has('recognition-repair')) { lastCause = 'recognition-repair'; clk.pause('recognition-repair'); } }
        else { flags.review++; if (!clk.has('candidate-review') && !clk.has('recognition-repair')) { lastCause = 'candidate-review'; clk.pause('candidate-review'); } }
        render();
      },
      // the pad says "Confirm character & continue" while a review or repair stopped a visible clock
      reviewing() { return !!(clk && visibleClock() && clk.timed() && (clk.has('candidate-review') || clk.has('recognition-repair'))); },
      confirmed() {
        if (clk && (clk.has('candidate-review') || clk.has('recognition-repair'))) {
          // one action inserts the reviewed character and resumes active entry
          clk.release('candidate-review'); clk.release('recognition-repair');
          clk.resume();
          render();
        }
        hooks.draft();
      },
    };

    function dispose() {
      if (disposed) return;
      disposed = true;
      clearTimeout(timers.deadline);
      clearInterval(timers.meter);
      timers.deadline = timers.meter = null;
      for (const f of cleanups.splice(0)) { try { f(); } catch (e) { /* already gone */ } }
      if (api) api.body.inert = false;
      for (const k in el) if (el[k]) { el[k].remove(); el[k] = null; }
    }

    // ---- the result and its record ------------------------------------------------------------
    function finalResult(res) {
      const snap = clk ? clk.snapshot() : null;
      // the input the attempt ended in (an arranged order reports 'choice' as its result mode)
      const modeUsed = mode || (res && res.mode) || null;
      const handPtrs = Array.from(flags.ptrs);
      const pointerClass = modeUsed === 'hand' ? (handPtrs.length === 1 ? handPtrs[0] : handPtrs.length ? 'mixed' : plan.pointer) : modeUsed === 'choice' || modeUsed === 'order' ? flags.submitPtr || plan.pointer : null;
      let submitted;
      if (res && res.cancelled) submitted = letGo ? 'let-go' : 'stepped-away';
      else if (res && res.ok && flags.reveal && outcomeKind !== 'ok') submitted = 'revealed';
      else if (res && res.ok) submitted = flags.contentErrors || (res.mistakes || 0) > 0 ? 'correct-after-correction' : 'correct';
      else submitted = 'unresolved';
      // the sample's bucket uses what was actually used (the pointer that wrote, the input that chose)
      let key = plan.key, noBucket = false;
      if (plan.clock === 'measure' && modeUsed && modeUsed === plan.input && pointerClass && pointerClass !== plan.pointer && pointerClass !== 'mixed') {
        key = C.bucketKey({ input: modeUsed, pointer: pointerClass, repr: plan.repr, cx: plan.cx }).key || null;
        noBucket = !key;
      }
      const ex = C.exclusions({
        clock: plan.clock, submitted, repair: flags.repair + ((res && res.recogMisses) || 0), review: flags.review, reveal: flags.reveal,
        exposed: flags.exposed, chart: flags.chart, inputChanged: flags.inputChanged || (!!modeUsed && modeUsed !== plan.input),
        deviceChanged: flags.deviceChanged || (modeUsed === 'hand' && handPtrs.length > 1), reprChanged: flags.reprChanged || flags.reprMismatch,
        pointerCancel: flags.pointerCancel, layout: flags.layout, converted: snap && snap.converted, noBucket,
      });
      const sample = plan.clock === 'measure' && !ex.length && !!key && !!snap && snap.started;
      return {
        kind, clock: plan.clock, timed: plan.clock === 'timed', budgetMs: plan.clock === 'timed' ? plan.budgetMs : null,
        activeMs: snap && snap.started ? snap.activeMs : null, expired: !!(snap && snap.expired),
        onTime: snap && snap.lastSubmit && plan.clock === 'timed' && !snap.converted ? snap.lastSubmit.onTime : snap && snap.expired ? false : null,
        convertedToUntimed: snap ? snap.converted : null, convertedAtMs: snap ? snap.convertedAt : null,
        pauseReasons: snap ? snap.pauseReasons : {}, inputMode: modeUsed, pointerClass: pointerClass || null,
        representation: plan.repr || null, bucket: key || null, layout: plan.layout || null,
        recognitionRepair: !!(flags.repair || (res && res.recogMisses)), assistance: Array.from(flags.assist),
        submittedResult: submitted, letGo, sample, excluded: sample ? [] : ex, note: plan.note || null, provisional: false,
      };
    }
    function record(paced) {
      return {
        at: Date.now(), taskId: o.taskId || step.id || step.taskId || (o.ctxTag || 'fishing') + ':' + [].concat(step.item || '?')[0],
        profile: (s && s.learn && s.learn.profile) || null, paceKind: paced.kind, clock: paced.clock, budgetMs: paced.budgetMs,
        activeMs: paced.activeMs, expired: paced.expired, onTime: paced.onTime, convertedToUntimed: paced.convertedToUntimed,
        pauseReasons: paced.pauseReasons, inputMode: paced.inputMode, pointerClass: paced.pointerClass,
        representationClass: paced.representation, bucket: paced.bucket, layout: paced.layout, assistance: paced.assistance,
        recognitionRepair: paced.recognitionRepair, submittedResult: paced.submittedResult, sample: paced.sample, excluded: paced.excluded,
      };
    }
    function snapshot() {
      return { kind, phase, plan: plan && { clock: plan.clock, key: plan.key, sec: plan.sec || null, note: plan.note || null, repr: plan.repr, pointer: plan.pointer, proposal: !!plan.proposal }, clock: clk ? clk.snapshot() : null, env: Object.assign({}, env), pendingExpiry, expiryShown, flags: { repair: flags.repair, review: flags.review, contentErrors: flags.contentErrors, pointerCancel: flags.pointerCancel, layout: flags.layout, assist: Array.from(flags.assist) } };
    }
    return { hooks, dispose, result: finalResult, record, snapshot, get clock() { return clk; }, get mounted() { return !!api; }, convert: untimed };
  }

  async function attempt(step, o) {
    o = o || {};
    const s = S();
    if (cur) cur.dispose();
    const ctl = controller(step, o, s);
    cur = ctl;
    let res;
    try {
      res = await RB.challenge.runStep(step, Object.assign({ allowCancel: true }, o.runOpts || {}, { header: o.header, ctxTag: o.ctxTag || 'fishing', pace: ctl.hooks, noRecord: true }));
    } finally {
      ctl.dispose();
      if (cur === ctl) cur = null;
    }
    res = res || { cancelled: true };
    res.paced = ctl.result(res);
    if (!ctl.mounted) { res.paced.clock = 'none'; res.paced.timed = false; res.paced.sample = false; return res; }  // automated test runs solve without the screen
    const alive = (!o.session || typeof o.session.alive !== 'function' || o.session.alive()) && S() === s;
    if (alive && s) {
      const rec = C.record(s, ctl.record(res.paced));
      if (rec && rec.sample && res.paced.bucket) C.addSample(s, res.paced.bucket, res.paced.activeMs);
      if (pilot.on()) await pilot.capture(rec, res.paced);
    }
    return res;
  }
  // A pace setting changed during a cast: altering a budget mid-cast makes that cast untimed.
  function settingsChanged() { if (cur && cur.clock && cur.clock.timed()) cur.convert('settings-changed'); }

  // ---- the Pace control for a preparation sheet ------------------------------------------------
  function statusLines(s) {
    const c = C.cal(s);
    if (!c) return '';
    const keys = Object.keys(c.buckets).filter((k) => c.buckets[k].s.length || c.buckets[k].acc).sort((a, b) => c.buckets[b].s.length - c.buckets[a].s.length).slice(0, 6);
    if (!keys.length) return '<p class="small pace-none">No answers measured yet.</p>';
    return '<ul class="pace-buckets">' + keys.map((k) => {
      const b = C.budgets(s, { key: k });
      let t;
      if (b.reason === 'ok') t = (b.gentle ? 'Gentle ' + b.gentle + ' s' : 'Gentle over 180 s (use Off or Custom)') + ' · ' + (b.brisk ? 'Brisk ' + b.brisk + ' s' : 'Brisk over 180 s') + ' (kept until you recalibrate)';
      else if (b.reason === 'proposal') t = (b.gentle ? 'Gentle ' + b.gentle + ' s' : 'Gentle would be over 180 s') + ' · ' + (b.brisk ? 'Brisk ' + b.brisk + ' s' : 'Brisk would be over 180 s') + ' (offered at your next Ready)';
      else t = b.samples + ' of ' + C.LIMITS.needed + ' untimed answers';
      return '<li><span class="k">' + esc(C.describe(k)) + '</span><span class="v">' + esc(t) + '</span></li>';
    }).join('') + '</ul>';
  }
  function setupHtml(s, opts) {
    s = s || S();
    opts = opts || {};
    const st = RB.practice.settings(s);
    const v = C.KINDS.indexOf(st.fishingPace) >= 0 ? st.fishingPace : 'off';
    const cs = clampSec(st.fishingCustomSec) || 30;
    const id = 'pace' + Math.random().toString(36).slice(2, 6);
    const opt = (k, d, extra) => '<label class="pace-opt"><input type="radio" name="' + id + '-k" value="' + k + '"' + (v === k ? ' checked' : '') + '><span class="t"><b>' + esc(NAMES[k]) + '</b><span class="d">' + d + '</span>' + (extra || '') + '</span></label>';
    return '<fieldset class="pace-setup" data-pace-setup="' + id + '"><legend>Pace</legend>' +
      '<p class="pace-what">Pace is an optional time limit on entering your answer after a bite. It starts only when you press <b>Ready</b>, after you have read the situation, and runs only while you answer: word help, checking what the pad read, Pause and leaving the game stop it. When it runs out the line loosens and you can still land the fish untimed. Pace never changes which fish you meet or what you receive.</p>' +
      '<div class="pace-opts" role="radiogroup" aria-label="Pace">' +
      opt('off', 'No time limit. The default.') +
      opt('gentle', 'A generous limit made from your own untimed answers of the same kind.') +
      opt('brisk', 'A shorter limit from the same answers.') +
      opt('custom', 'You choose 5 to 180 seconds.', '<span class="pace-custom"><button type="button" class="pbtn" data-pace-sec="-5" aria-label="5 seconds less">−</button>' +
        '<label class="pace-seclab"><input type="number" inputmode="numeric" min="5" max="180" step="1" value="' + cs + '" data-pace-secs-in aria-label="Custom seconds"> seconds</label>' +
        '<button type="button" class="pbtn" data-pace-sec="5" aria-label="5 seconds more">+</button></span>') +
      '</div>' +
      '<p class="small pace-how">Gentle and Brisk are prepared separately for each kind of answer: how you answer (writing with a mouse, finger or pen; typing; choosing), kana or mixed kanji, and its length. Each needs ' + C.LIMITS.needed + ' untimed answers of that kind first; until then those casts are untimed and measured from Ready. Nothing is ever tightened on its own.</p>' +
      '<div class="pace-status">' + statusLines(s) + '</div>' +
      '<label class="pace-check"><input type="checkbox" data-pace-measure' + (st.fishingPaceMeasure ? ' checked' : '') + '><span>Measure my untimed answers while pace is Off (adds a Ready button)</span></label>' +
      '<label class="pace-check"><input type="checkbox" data-pace-show' + (showSecs() ? ' checked' : '') + '><span>Show seconds beside the line</span></label>' +
      '<div class="pace-recal"><button type="button" class="pbtn" data-pace-recal>Recalibrate</button><span class="small">Sets your measured answers aside; the next untimed answers prepare new times.</span></div>' +
      '</fieldset>';
  }
  function wireSetup(root, s, opts) {
    s = s || S();
    opts = opts || {};
    const fs = root.matches && root.matches('[data-pace-setup]') ? root : root.querySelector('[data-pace-setup]');
    if (!fs) return;
    const changed = () => { settingsChanged(); if (opts.onChange) opts.onChange(RB.practice.settings(s)); };
    const secIn = fs.querySelector('[data-pace-secs-in]');
    const setSec = (v) => {
      const c = clampSec(v) || 30;
      secIn.value = c;
      RB.practice.set(s, 'fishingCustomSec', c);
    };
    fs.addEventListener('change', (e) => {
      const t = e.target;
      if (t.type === 'radio') {
        RB.practice.set(s, 'fishingPace', t.value);
        if (t.value === 'custom') setSec(secIn.value);
        changed();
      } else if (t.matches('[data-pace-secs-in]')) { setSec(t.value); if (RB.practice.settings(s).fishingPace === 'custom') changed(); }
      else if (t.matches('[data-pace-measure]')) { RB.practice.set(s, 'fishingPaceMeasure', !!t.checked); changed(); }
      else if (t.matches('[data-pace-show]')) { RB.game.settings.fishSeconds = !!t.checked; if (RB.game.saveSettings) RB.game.saveSettings(); changed(); }
    });
    fs.addEventListener('click', async (e) => {
      const d = e.target.closest('[data-pace-sec]');
      if (d) { setSec((+secIn.value || 30) + +d.getAttribute('data-pace-sec')); if (RB.practice.settings(s).fishingPace === 'custom') changed(); return; }
      if (e.target.closest('[data-pace-recal]')) {
        const i = await RB.ui.confirm('Recalibrate Gentle and Brisk? Your measured answers are set aside, and your next untimed answers of each kind prepare new times.', ['Recalibrate', 'Keep my times']);
        if (i !== 0) return;
        C.recalibrate(s);
        fs.querySelector('.pace-status').innerHTML = statusLines(s);
        changed();
      }
    });
  }
  // A small sheet holding the same control (a preparation sheet can embed it instead).
  function openSetup(s) {
    s = s || S();
    return new Promise((resolve) => {
      const layer = { name: 'pace-setup' };
      const fr = RB.learnUi.sheet({ cls: 'small pace-sheet', title: 'Pace', onClose: () => done() });
      fr.leaf.innerHTML = setupHtml(s);
      fr.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-pace-done>Done</button>';
      wireSetup(fr.leaf, s, {});
      layer.el = fr.scrim;
      function done() { RB.ui.popLayer(layer); resolve(RB.practice.settings(s)); }
      layer.onCancel = done;
      fr.foot.querySelector('[data-pace-done]').onclick = done;
      RB.ui.pushLayer(layer);
    });
  }

  // ---- §7.6: local developer measurement (no upload; consent first) ---------------------------
  const PILOT_KEY = 'rb.pace.pilot.v1';
  const pilot = {
    load() { try { return JSON.parse(localStorage.getItem(PILOT_KEY) || 'null'); } catch (e) { return null; } },
    save(p) { try { localStorage.setItem(PILOT_KEY, JSON.stringify(p)); return true; } catch (e) { return false; } },
    on() { const p = pilot.load(); return !!(p && p.consent); },
    consent(on, setupLabel) {
      if (!on) return pilot.save(Object.assign(pilot.load() || { records: [] }, { consent: null }));
      return pilot.save(Object.assign(pilot.load() || { records: [] }, { consent: { at: Date.now(), setup: String(setupLabel || '').slice(0, 80) } }));
    },
    clear() { try { localStorage.removeItem(PILOT_KEY); } catch (e) { /* nothing stored */ } },
    // the same record (no strokes, no answer text) + an optional comfort answer
    async capture(rec, paced) {
      const p = pilot.load();
      if (!p || !p.consent || !rec) return;
      let comfort = null;
      if (paced.clock === 'timed' && !paced.letGo) comfort = await askComfort();
      p.records = (p.records || []).concat([Object.assign({}, rec, { comfort, setup: p.consent.setup || '' })]).slice(-C.LIMITS.pilot);
      pilot.save(p);
    },
  };
  function askComfort() {
    return new Promise((resolve) => {
      const layer = { name: 'pace-comfort' };
      const fr = RB.learnUi.sheet({ cls: 'small pace-sheet', title: 'Pilot question (optional)' });
      fr.leaf.innerHTML = '<p>Did this feel comfortable enough to repeat?</p><div class="pace-comfort">' + [1, 2, 3, 4, 5].map((n) => '<button class="pbtn" data-c="' + n + '">' + n + '</button>').join('') + '</div><p class="small">1 = not at all, 5 = very. Kept only on this device.</p>';
      fr.foot.innerHTML = '<span class="spacer"></span><button class="cbtn" data-c="0">Skip</button>';
      layer.el = fr.scrim;
      const done = (v) => { RB.ui.popLayer(layer); resolve(v || null); };
      layer.onCancel = () => done(null);
      fr.scrim.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (b) done(+b.getAttribute('data-c')); });
      RB.ui.pushLayer(layer);
    });
  }
  const dev = {
    diagnostics(s) { return C.diagnostics(s || S()); },
    pilot: () => pilot.load(),
    consent: (on, setup) => pilot.consent(on, setup),
    clear: () => pilot.clear(),
    // print the comparable records to the developer console (nothing is sent anywhere)
    print(s) { const d = { diagnostics: C.diagnostics(s || S()), pilot: pilot.load() }; console.log('[pace diagnostics]', JSON.stringify(d, null, 2)); return d; },
    open(s) {
      s = s || S();
      const d = C.diagnostics(s);
      const p = pilot.load();
      const sec = (ms) => (ms == null ? '–' : (ms / 1000).toFixed(1));
      const layer = { name: 'pace-dev' };
      const fr = RB.learnUi.sheet({ cls: 'pace-sheet pace-dev', title: 'Pace measurement (developer)', onClose: () => close() });
      fr.leaf.innerHTML = '<p class="small">Local records of this campaign only. Nothing leaves this device. ' + esc(d.note) + '</p>' +
        '<h3>Comparable buckets</h3>' + (d.buckets.length ? '<table class="pace-tab"><thead><tr><th>Bucket</th><th>n</th><th>p50 s</th><th>p75 s</th><th>p90 s</th><th>Gentle/Brisk</th></tr></thead><tbody>' +
          d.buckets.map((b) => '<tr><td>' + esc(b.label) + '</td><td>' + b.n + '</td><td>' + sec(b.p50) + '</td><td>' + sec(b.p75) + '</td><td>' + sec(b.p90) + '</td><td>' + (b.accepted ? b.accepted.gentle + '/' + b.accepted.brisk + ' (kept)' : b.proposal ? b.proposal.gentle + '/' + b.proposal.brisk : '–') + '</td></tr>').join('') + '</tbody></table>' : '<p>No samples.</p>') +
        '<h3>Expiry by pace</h3><p>' + (Object.keys(d.byKind).map((k) => esc(k) + ': ' + d.byKind[k].expired + ' expired of ' + d.byKind[k].completed + ' completed (' + d.byKind[k].interrupted + ' left early)').join('; ') || 'No timed attempts.') + '</p>' +
        '<h3>Excluded from calibration</h3>' + (d.excluded.length ? '<ul>' + d.excluded.map((x) => '<li>#' + x.n + ' ' + esc(x.taskId || '') + ': ' + esc(x.excluded.join(', ')) + '</li>').join('') + '</ul>' : '<p>None.</p>') +
        '<h3>Pilot capture</h3><p class="small">For a consenting pilot only (Practice addendum §7.6): every fishing response record (no strokes, no answer text) is also kept on this device, with an optional comfort answer after a timed one. ' + (p && p.consent ? 'On since this session’s consent; ' + (p.records || []).length + ' records.' : 'Off.') + '</p>' +
        '<label class="pace-check"><input type="checkbox" data-dev-consent' + (p && p.consent ? ' checked' : '') + '><span>The player has agreed to keep pilot timing records on this device</span></label>' +
        '<div class="pace-recal"><button class="pbtn" data-dev-print>Print to console</button><button class="pbtn danger" data-dev-clear>Delete pilot capture</button></div>';
      fr.foot.innerHTML = '<span class="spacer"></span><button class="cbtn" data-dev-close>Close</button>';
      layer.el = fr.scrim;
      function close() { RB.ui.popLayer(layer); }
      layer.onCancel = close;
      fr.scrim.addEventListener('click', (e) => {
        if (e.target.closest('[data-dev-close]')) close();
        if (e.target.closest('[data-dev-print]')) dev.print(s);
        if (e.target.closest('[data-dev-clear]')) { pilot.clear(); close(); }
      });
      fr.scrim.addEventListener('change', (e) => { if (e.target.matches('[data-dev-consent]')) pilot.consent(e.target.checked, (navigator.maxTouchPoints ? 'touch-capable' : 'pointer') + ' / ' + layoutClass()); });
      RB.ui.pushLayer(layer);
    },
  };

  return {
    attempt, budgets, available, settingsChanged, setupHtml, wireSetup, openSetup, summary: (s) => C.summary(s || S()), dev,
    current: () => (cur ? cur.snapshot() : null), clocksCreated: () => C.created(), EXPIRY, provisional: false,
  };
})();
