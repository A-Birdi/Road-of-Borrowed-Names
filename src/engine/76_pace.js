/* Fishing pace, the core (Practice addendum §7, §21.3; docs/practice/pace.md).
 * No DOM here. The interface and the attempt flow are in src/ui/69_pace.js.
 *
 *   RB.paceCore.clock({ now?, budgetMs?, kind? })  the active-entry clock of ONE attempt
 *   RB.paceCore.complexity(step, repr)       authored complexity of a step's answer
 *   RB.paceCore.representations(step)        'kana' / 'mixed' / 'select' choices it allows
 *   RB.paceCore.bucketKey(d)                 a calibration bucket (finite set) or a reason
 *   RB.paceCore.p75(ms[]) / percentile()     nearest-rank percentiles
 *   RB.paceCore.presets(Bms)                 Gentle/Brisk seconds from B
 *   RB.paceCore.budgets(s, ctx)              what Gentle/Brisk would be for a bucket
 *   RB.paceCore.addSample / accept / recalibrate / record / diagnostics / summary
 *
 * The clock accumulates monotonic active time (performance.now(), or an
 * injected now() in tests); it never subtracts Date.now() values and never
 * counts frames. Pause reasons nest; a user-visible pause needs an explicit
 * continuation; processing-only exclusions restore the run silently.
 * Only RB.pace.attempt (fishing response entry) ever creates a clock: the
 * created counter lets tests prove that no other part of the game has one. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.paceCore = (function () {
  'use strict';
  const LIMITS = { recent: 50, samples: 24, needed: 12, customMin: 5, customMax: 180, maxUnits: 8, maxStrokes: 40, pilot: 2000 };
  const KINDS = ['off', 'gentle', 'brisk', 'custom'];

  // ---- the clock -------------------------------------------------------------------------
  // Reasons that the environment sets and clears (counted, so they nest):
  const ENV = ['help', 'modal', 'hidden', 'blur', 'processing', 'evaluating', 'settings'];
  // Reasons the player leaves by an explicit continuation:
  const USER = ['pause', 'candidate-review', 'recognition-repair', 'feedback'];
  // Processing-only exclusions: restored silently when they end.
  const SILENT = { processing: 1, evaluating: 1 };
  // Momentary interruptions (an event, not a state): recorded, and they leave a hold.
  const EVENTS = ['layout', 'pointer-cancel', 'device'];
  let created = 0;

  function perfNow() { return typeof performance !== 'undefined' && performance.now ? performance.now() : 0; }

  function clock(opts) {
    opts = opts || {};
    created++;
    const now = typeof opts.now === 'function' ? opts.now : perfNow;
    const budget = opts.budgetMs == null ? null : Math.max(0, Math.round(+opts.budgetMs));
    // consent: a user-visible pause waits for an explicit continuation (timed
    // attempts). Untimed measuring passes false: nothing to restart unexpectedly.
    const consent = opts.consent !== false;
    const st = {
      started: false, finished: false, frozen: false,
      acc: 0, seg: null,              // accumulated active ms; start of the running segment
      reasons: new Map(),             // reason -> nesting count
      seen: {},                       // reason -> times it paused the started clock
      hold: false,                    // waiting for an explicit continuation
      expired: false, expiredAt: null,
      converted: null, convertedAt: null,
      submits: [],                    // [{ activeMs, onTime, t }]
    };
    const subs = [];
    const emit = (what) => { for (const f of subs.slice()) { try { f(what, api); } catch (e) { console.error('pace listener', e); } } };
    const timed = () => budget != null && !st.converted;
    const running = () => st.started && !st.finished && !st.frozen && !st.hold && st.reasons.size === 0;
    function active() { return st.acc + (st.seg != null ? Math.max(0, now() - st.seg) : 0); }
    // move between running and stopped exactly once per change
    function settle(wasRunning) {
      const is = running();
      if (wasRunning && !is) { st.acc += Math.max(0, now() - st.seg); st.seg = null; }
      else if (!wasRunning && is) st.seg = now();
    }
    function start() {
      if (st.started || st.finished) return false;
      st.started = true;
      st.hold = false;
      settle(false);
      emit('start');
      return true;
    }
    function pause(reason) {
      const was = running();
      st.reasons.set(reason, (st.reasons.get(reason) || 0) + 1);
      if (st.started && !st.finished) {
        st.seen[reason] = (st.seen[reason] || 0) + 1;
        if (!SILENT[reason] && consent) st.hold = true;
      }
      settle(was);
      emit('pause');
    }
    function release(reason) {
      if (!st.reasons.has(reason)) return;
      const was = running();
      const n = st.reasons.get(reason) - 1;
      if (n > 0) st.reasons.set(reason, n); else st.reasons.delete(reason);
      settle(was);
      emit('release');
    }
    // a momentary interruption (layout change, pointer cancellation): it stops
    // the clock until the player continues
    function interrupt(reason) {
      if (!st.started || st.finished) return;
      const was = running();
      st.seen[reason] = (st.seen[reason] || 0) + 1;
      if (consent) st.hold = true;
      settle(was);
      emit('pause');
    }
    // the player's explicit continuation: leaves the player's own pause states;
    // a reason the environment still holds (help open, tab hidden) keeps it stopped
    function resume() {
      if (!st.started || st.finished || st.frozen) return false;
      const was = running();
      for (const r of USER) st.reasons.delete(r);
      // consent counts only when nothing else holds it: Continue pressed while the
      // tab is still hidden must not let it restart unseen when the tab returns
      if (st.reasons.size === 0) st.hold = false;
      settle(was);
      emit('resume');
      return running();
    }
    function remaining() { return budget == null ? null : Math.max(0, budget - active()); }
    // authoritative deadline: activeEntryMs >= budgetMs
    function tick() {
      if (timed() && st.started && !st.finished && !st.expired && active() >= budget) {
        const was = running();
        st.expired = true;
        st.frozen = true;
        settle(was);
        st.expiredAt = budget;
        emit('expire');
      }
      return state();
    }
    // the timed window ends; the clock keeps measuring untimed (records only)
    function convert(reason) {
      if (!timed()) { if (!st.converted && budget != null) st.converted = reason; return false; }
      const was = running();
      st.converted = reason || 'player';
      st.convertedAt = active();
      if (st.frozen) { st.frozen = false; st.hold = false; }
      settle(was);
      emit('convert');
      return true;
    }
    // "Continue untimed" after a soft expiry
    function continueUntimed() {
      if (!st.frozen) return false;
      const was = running();
      st.frozen = false;
      st.hold = false;
      st.converted = st.converted || 'expired';
      st.convertedAt = st.convertedAt == null ? st.acc : st.convertedAt;
      settle(was);
      emit('convert');
      return true;
    }
    // a wrong-answer conversion that the player then reports as a misread: the
    // repair costs nothing, so the timed window comes back (stopped, in repair)
    function unconvert(fromReason) {
      if (st.converted !== fromReason || st.expired || budget == null) return false;
      const was = running();
      st.converted = null;
      st.convertedAt = null;
      st.reasons.set('recognition-repair', 1);
      st.seen['recognition-repair'] = (st.seen['recognition-repair'] || 0) + 1;
      st.hold = true;
      settle(was);
      emit('pause');
      return true;
    }
    // An explicit submission. It is stamped now: on time if the active time is
    // still below the budget, whatever evaluation or rendering does after it.
    function submit() {
      tick();
      const a = active();
      const onTime = timed() ? (!st.expired && a < budget) : null;
      const stamp = { activeMs: Math.round(a), onTime, t: now() };
      st.submits.push(stamp);
      if (st.submits.length > 20) st.submits.shift();
      pause('evaluating');
      return stamp;
    }
    function finish() {
      if (st.finished) return;
      const was = running();
      st.finished = true;
      settle(was);
      emit('finish');
    }
    function state() {
      return st.finished ? 'finished' : !st.started ? 'ready' : st.frozen ? 'expired' : running() ? 'running' : 'paused';
    }
    function reasons() { return Array.from(st.reasons.keys()); }
    function has(r) { return st.reasons.has(r); }
    function snapshot() {
      const last = st.submits[st.submits.length - 1] || null;
      return {
        state: state(), started: st.started, timed: timed(), budgetMs: budget, activeMs: Math.round(active()),
        expired: st.expired, expiredAt: st.expiredAt, converted: st.converted, convertedAt: st.convertedAt == null ? null : Math.round(st.convertedAt),
        hold: st.hold, reasons: reasons(), pauseReasons: Object.assign({}, st.seen), lastSubmit: last,
      };
    }
    const api = {
      start, pause, release, interrupt, resume, tick, convert, continueUntimed, unconvert, submit, finish,
      active, remaining, running, timed, state, reasons, has, snapshot,
      on(f) { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; },
      get budgetMs() { return budget; }, get hold() { return st.hold; }, get expired() { return st.expired; },
      get frozen() { return st.frozen; }, get converted() { return st.converted; }, get started() { return st.started; },
      get consent() { return consent; }, get finished() { return st.finished; },
    };
    return api;
  }

  // ---- representation and authored complexity (§7.4) -------------------------------------
  const K = () => RB.kana;
  const PUNCT = /[\s、。，．,.!?！？「」『』（）()・…〜~]/g;
  function plainOf(acc) { try { return RB.jp && RB.jp.plain ? RB.jp.plain(acc, {}) : String(acc); } catch (e) { return String(acc); } }
  function readingOf(acc) { try { return RB.jp && RB.jp.reading ? RB.jp.reading(acc, {}) : String(acc); } catch (e) { return String(acc); } }
  const clean = (s) => String(s || '').replace(PUNCT, '');
  const units = (kana) => Array.from(clean(kana)).length;          // kana-equivalent units (small kana and ー count)
  function kanaOnly(s) { s = clean(s); return !!s && Array.from(s).every((c) => K().isKana(c)); }
  // kana-equivalent length of a written form with kanji: its reading where the markup
  // gives one, otherwise each kanji's own reading (unknown -> null: not comparable)
  function mixedUnits(acc, plain) {
    const r = readingOf(acc);
    if (kanaOnly(r)) return units(r);
    let n = 0;
    for (const c of Array.from(clean(plain))) {
      if (K().isKana(c)) { n++; continue; }
      const kr = RB.answers && RB.answers.kanjiReading ? RB.answers.kanjiReading(c) : null;
      if (!kr) return null;
      n += units(kr);
    }
    return n;
  }
  function strokesOf(plain) {
    let n = 0;
    for (const c of Array.from(clean(plain))) {
      const k = RB.recog && RB.recog.strokeCount ? RB.recog.strokeCount(c) : 0;
      if (!k) return null;
      n += k;
    }
    return n;
  }
  // The accepted short variants of a write step, by representation.
  function variants(step) {
    const out = { kana: [], mixed: [] };
    if (!step || step.kind !== 'write' || step.mode === 'meaning') return out;
    const accept = (step.accept && step.accept.length ? step.accept : [step.answer]).filter((x) => x != null && x !== '').map(String);
    for (const acc of accept) {
      const plain = plainOf(acc);
      if (kanaOnly(plain)) { out.kana.push({ form: clean(plain), units: units(plain) }); continue; }
      if (K().hasKanji(plain)) {
        out.mixed.push({ form: clean(plain), units: mixedUnits(acc, plain), strokes: strokesOf(plain) });
        // kana and reading checks also accept the reading itself
        const r = readingOf(acc);
        if (step.mode !== 'exact' && kanaOnly(r)) out.kana.push({ form: clean(r), units: units(r) });
      }
    }
    return out;
  }
  // Which representations a step allows before Ready (never showing the answer).
  function representations(step) {
    if (!step) return [];
    if (step.kind === 'choose' || step.kind === 'order') return ['select'];
    if (step.kind !== 'write' || step.mode === 'meaning') return [];
    const v = variants(step), out = [];
    if ((step.pace && step.pace.kana) || v.kana.length) out.push('kana');
    if ((step.pace && step.pace.mixed) || v.mixed.length) out.push('mixed');
    return out;
  }
  const lenBucket = (u) => (u >= 1 && u <= 2 ? 'l1' : u >= 3 && u <= 4 ? 'l2' : u >= 5 && u <= 8 ? 'l3' : null);
  const strokeBucket = (n) => (n >= 1 && n <= 8 ? 's1' : n >= 9 && n <= 20 ? 's2' : n >= 21 && n <= 40 ? 's3' : null);
  const optBucket = (n) => (n >= 2 && n <= 4 ? 'o2-4' : n >= 5 && n <= 8 ? 'o5-8' : null);
  // The conservative authored complexity for a representation: the longest
  // accepted variant that is short enough to time (≤ 8 units, ≤ 40 strokes).
  // { units, strokes } | { untimed: 'too-long' } | { unknown: why }
  function complexity(step, repr, opt) {
    opt = opt || {};
    if (!step) return { unknown: 'no-step' };
    if (repr === 'select') {
      if (step.kind === 'order') {
        const n = (step.tiles || []).length;
        return n > LIMITS.maxUnits ? { untimed: 'too-long' } : n ? { sub: 'order', units: n } : { unknown: 'no-tiles' };
      }
      const n = step.kind === 'choose' ? (step.options || []).length : (opt.options || (step.choices ? step.choices.length : 4));
      return n > 8 ? { untimed: 'too-long' } : { sub: step.kind === 'choose' ? 'choose' : 'pick', options: n };
    }
    if (step.pace && step.pace[repr]) {
      const a = step.pace[repr];
      if ((a.units || 0) > LIMITS.maxUnits || (a.strokes || 0) > LIMITS.maxStrokes) return { untimed: 'too-long' };
      return repr === 'mixed' ? { units: a.units, strokes: a.strokes, authored: true } : { units: a.units, authored: true };
    }
    const list = variants(step)[repr] || [];
    if (!list.length) return { unknown: 'no-variant' };
    const known = list.filter((v) => v.units != null && (repr !== 'mixed' || v.strokes != null));
    if (!known.length) return { unknown: 'unknown-reading-or-strokes' };
    const short = known.filter((v) => v.units <= LIMITS.maxUnits && (repr !== 'mixed' || v.strokes <= LIMITS.maxStrokes));
    if (!short.length) return { untimed: 'too-long' };
    const u = Math.max.apply(null, short.map((v) => v.units));
    if (repr !== 'mixed') return { units: u };
    return { units: u, strokes: Math.max.apply(null, short.map((v) => v.strokes)) };
  }

  // ---- calibration buckets (finite set) -------------------------------------------------
  const HAND_PTR = ['mouse', 'touch', 'pen'];
  const SEL_PTR = ['mouse', 'touch', 'pen', 'key'];
  const LENS = ['l1', 'l2', 'l3'], STROKES = ['s1', 's2', 's3'], OPTS = ['o2-4', 'o5-8'];
  const ALL = (function () {
    const out = [];
    for (const p of HAND_PTR) { for (const l of LENS) { out.push('hand.' + p + '.kana.' + l); for (const s of STROKES) out.push('hand.' + p + '.mixed.' + l + '.' + s); } }
    for (const r of ['kana', 'mixed']) for (const l of LENS) out.push('ime.' + r + '.' + l);
    for (const p of SEL_PTR) { for (const o of OPTS) { out.push('select.' + p + '.choose.' + o); out.push('select.' + p + '.pick.' + o); } for (const l of LENS) out.push('select.' + p + '.order.' + l); }
    return out;
  })();
  const ALLSET = new Set(ALL);
  // d: { input: 'hand'|'ime'|'choice'|'order', pointer, repr, cx: complexity() }
  //  -> { key } | { reason: 'too-long'|'unknown'|... }
  function bucketKey(d) {
    if (!d || !d.cx) return { reason: 'unknown' };
    const cx = d.cx;
    if (cx.untimed) return { reason: cx.untimed };
    if (cx.unknown) return { reason: 'unknown', detail: cx.unknown };
    let key = null;
    if (d.input === 'hand') {
      if (HAND_PTR.indexOf(d.pointer) < 0) return { reason: 'unknown', detail: 'pointer' };
      const l = lenBucket(cx.units);
      if (!l) return { reason: cx.units > LIMITS.maxUnits ? 'too-long' : 'unknown' };
      if (d.repr === 'kana') key = 'hand.' + d.pointer + '.kana.' + l;
      else if (d.repr === 'mixed') { const s = strokeBucket(cx.strokes); if (!s) return { reason: cx.strokes > LIMITS.maxStrokes ? 'too-long' : 'unknown' }; key = 'hand.' + d.pointer + '.mixed.' + l + '.' + s; }
    } else if (d.input === 'ime') {
      const l = lenBucket(cx.units);
      if (!l) return { reason: cx.units > LIMITS.maxUnits ? 'too-long' : 'unknown' };
      if (d.repr === 'kana' || d.repr === 'mixed') key = 'ime.' + d.repr + '.' + l;
    } else if (d.input === 'choice' || d.input === 'order') {
      const p = SEL_PTR.indexOf(d.pointer) >= 0 ? d.pointer : null;
      if (!p) return { reason: 'unknown', detail: 'pointer' };
      if (cx.sub === 'order') { const l = lenBucket(cx.units); if (!l) return { reason: 'too-long' }; key = 'select.' + p + '.order.' + l; }
      else { const o = optBucket(cx.options); if (!o) return { reason: 'unknown' }; key = 'select.' + p + '.' + (cx.sub || 'pick') + '.' + o; }
    }
    return key && ALLSET.has(key) ? { key } : { reason: 'unknown' };
  }
  // words for a bucket, for the setup sheet and diagnostics
  const PTR_EN = { mouse: 'mouse', touch: 'touch', pen: 'pen', key: 'keyboard' };
  const LEN_EN = { l1: '1–2', l2: '3–4', l3: '5–8' };
  const STR_EN = { s1: '1–8 strokes', s2: '9–20 strokes', s3: '21–40 strokes' };
  function describe(key) {
    const p = String(key || '').split('.');
    if (p[0] === 'hand') return 'Handwriting (' + PTR_EN[p[1]] + '), ' + (p[2] === 'kana' ? 'kana' : 'mixed kanji') + ', ' + LEN_EN[p[3]] + ' kana' + (p[4] ? ', ' + STR_EN[p[4]] : '');
    if (p[0] === 'ime') return 'Typing (IME), ' + (p[1] === 'kana' ? 'kana' : 'mixed kanji') + ', ' + LEN_EN[p[2]] + ' kana';
    if (p[0] === 'select') return 'Selection pace (' + PTR_EN[p[1]] + '), ' + (p[2] === 'order' ? 'arranging ' + LEN_EN[p[3]] + ' pieces' : (p[2] === 'choose' ? 'reading choices, ' : 'choosing, ') + (p[3] === 'o2-4' ? '2–4' : '5–8') + ' options');
    return String(key);
  }

  // ---- calibration math ----------------------------------------------------------------
  // Nearest-rank percentile: the smallest value with at least p% of the
  // values at or below it (rank = ceil(p/100 × N), 1-based).
  function percentile(arr, p) {
    const a = (arr || []).filter((x) => typeof x === 'number' && isFinite(x)).slice().sort((x, y) => x - y);
    if (!a.length) return null;
    const rank = Math.max(1, Math.ceil((p / 100) * a.length));
    return a[Math.min(a.length, rank) - 1];
  }
  const p75 = (arr) => percentile(arr, 75);
  // Gentle = ceil(1.80 B + 5), Brisk = ceil(1.25 B + 3), B in seconds. Computed
  // in integers from B in whole milliseconds, so no floating-point rounding can
  // add a second. Above 180 s the result is reported, never clamped tighter.
  const ceilDiv = (a, b) => Math.floor((a + b - 1) / b);
  function presets(Bms) {
    if (Bms == null || !isFinite(Bms)) return null;
    const B = Math.max(0, Math.round(Bms));
    const gentle = ceilDiv(18 * B + 50000, 10000);    // (1.8 B[ms] + 5000) / 1000
    const brisk = ceilDiv(125 * B + 300000, 100000);  // (1.25 B[ms] + 3000) / 1000
    return { B, gentle, brisk, gentleOver: gentle > LIMITS.customMax, briskOver: brisk > LIMITS.customMax };
  }

  // ---- campaign records (s.practice.fishing) ------------------------------------------------
  function fishing(s) {
    const p = RB.practice && RB.practice.of ? RB.practice.of(s) : s && s.practice;
    return p ? p.fishing : null;
  }
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  // s.practice.fishing.calibration = { v, n, buckets: { key: { s: [ms], acc: {...}|null } } }
  function cal(s) {
    const f = fishing(s);
    if (!f) return null;
    if (!isObj(f.calibration)) f.calibration = {};
    const c = f.calibration;
    if (!c.v) c.v = 1;
    if (!(c.n >= 0)) c.n = 0;
    if (!isObj(c.buckets)) c.buckets = {};
    for (const k in c.buckets) {
      const b = c.buckets[k];
      if (!isObj(b)) { delete c.buckets[k]; continue; }
      if (!Array.isArray(b.s)) b.s = [];
      b.s = b.s.filter((x) => typeof x === 'number' && isFinite(x) && x >= 0).slice(-LIMITS.samples);
      if (b.acc != null && !isObj(b.acc)) b.acc = null;
    }
    if (!Array.isArray(f.recentAttempts)) f.recentAttempts = [];
    return c;
  }
  function bucket(s, key, create) {
    const c = cal(s);
    if (!c || !ALLSET.has(key)) return null;
    if (!c.buckets[key] && create) c.buckets[key] = { s: [], acc: null };
    return c.buckets[key] || null;
  }
  // What Gentle/Brisk are for a bucket. ctx: { key, layout? } or a bucketKey() reason.
  //  reason: 'collecting' (fewer than 12), 'proposal' (12+ samples, not yet accepted),
  //  'ok' (accepted budgets in effect), 'layout' (accepted on another pad layout),
  //  'too-long' / 'unknown' (cannot be compared: Off or Custom only)
  function budgets(s, ctx) {
    ctx = ctx || {};
    const out = { key: ctx.key || null, gentle: null, brisk: null, samples: 0, needed: LIMITS.needed, reason: ctx.reason || 'unknown', B: null, proposed: null, accepted: null, label: ctx.key ? describe(ctx.key) : '' };
    if (!ctx.key) return out;
    const b = bucket(s, ctx.key, false);
    const n = b ? b.s.length : 0;
    out.samples = n;
    out.accepted = b && b.acc ? Object.assign({}, b.acc) : null;
    if (n >= LIMITS.needed) { out.B = p75(b.s); out.proposed = presets(out.B); }
    if (out.accepted) {
      if (out.accepted.layout && ctx.layout && out.accepted.layout !== ctx.layout) { out.reason = 'layout'; return out; }
      out.gentle = out.accepted.gentleOver ? null : out.accepted.gentle;
      out.brisk = out.accepted.briskOver ? null : out.accepted.brisk;
      out.reason = 'ok';
      return out;
    }
    if (!out.proposed) { out.reason = 'collecting'; return out; }
    out.gentle = out.proposed.gentleOver ? null : out.proposed.gentle;
    out.brisk = out.proposed.briskOver ? null : out.proposed.brisk;
    out.reason = 'proposal';
    return out;
  }
  // a comparable successful untimed sample (the latest 24 are kept)
  function addSample(s, key, ms) {
    const b = bucket(s, key, true);
    if (!b || !(ms >= 0) || !isFinite(ms)) return false;
    b.s.push(Math.round(ms));
    if (b.s.length > LIMITS.samples) b.s.splice(0, b.s.length - LIMITS.samples);
    return true;
  }
  // the player starts a cast with a proposed budget: from then on it stays fixed
  function accept(s, key, layout, at) {
    const b = bucket(s, key, false);
    if (!b || b.acc || b.s.length < LIMITS.needed) return b ? b.acc : null;
    const pr = presets(p75(b.s));
    b.acc = { B: pr.B, gentle: pr.gentle, brisk: pr.brisk, gentleOver: pr.gentleOver, briskOver: pr.briskOver, n: b.s.length, layout: layout || null, at: at || null };
    return b.acc;
  }
  // explicit Recalibrate: the bucket's (or every bucket's) accepted budgets and
  // samples are set aside; the next 12 untimed answers prepare new ones
  function recalibrate(s, key) {
    const c = cal(s);
    if (!c) return 0;
    let n = 0;
    for (const k of key ? [key] : Object.keys(c.buckets)) if (c.buckets[k]) { delete c.buckets[k]; n++; }
    return n;
  }
  // Why an attempt is not a calibration sample (§7.4): only a measured untimed
  // attempt from Ready to a correct final commit with no recognition repair,
  // answer exposure, interruption of the input or content correction counts.
  // f: facts about the attempt. Returns [] for a comparable sample.
  function exclusions(f) {
    const ex = [];
    if (f.clock !== 'measure') ex.push(f.clock === 'timed' ? 'timed' : 'not-measured-from-ready');
    if (f.submitted !== 'correct') ex.push(f.submitted === 'correct-after-correction' ? 'content-correction' : String(f.submitted || 'unresolved'));
    if (f.repair) ex.push('recognition-repair');
    if (f.review) ex.push('candidate-review');
    if (f.reveal) ex.push('answer-shown');
    if (f.exposed) ex.push('stroke-model-shown');
    if (f.chart) ex.push('chart-pick');
    if (f.inputChanged) ex.push('input-changed');
    if (f.deviceChanged) ex.push('device-changed');
    if (f.reprChanged) ex.push('representation-changed');
    if (f.pointerCancel) ex.push('pointer-cancel');
    if (f.layout) ex.push('layout-changed');
    if (f.converted) ex.push('converted:' + f.converted);
    if (f.noBucket) ex.push('no-bucket');
    return ex;
  }

  // ---- separate timing records (§7.5); never ordinary mastery ----------------------------
  const RECORD_KEYS = ['n', 'at', 'taskId', 'profile', 'paceKind', 'clock', 'budgetMs', 'activeMs', 'expired', 'onTime', 'convertedToUntimed', 'pauseReasons', 'inputMode', 'pointerClass', 'representationClass', 'bucket', 'layout', 'assistance', 'recognitionRepair', 'submittedResult', 'sample', 'excluded'];
  function record(s, rec) {
    const f = fishing(s);
    const c = cal(s);
    if (!f || !c) return null;
    const r = {};
    for (const k of RECORD_KEYS) if (rec[k] !== undefined) r[k] = rec[k];
    c.n = (c.n | 0) + 1;
    r.n = c.n;
    f.recentAttempts.push(r);
    if (f.recentAttempts.length > LIMITS.recent) f.recentAttempts.splice(0, f.recentAttempts.length - LIMITS.recent);
    return r;
  }
  // Developer diagnostics (§7.6): comparable buckets with sample counts and
  // p50/p75/p90, expiry rates by pace, and every excluded sample with its reason.
  function diagnostics(s) {
    const c = cal(s), f = fishing(s);
    if (!c) return null;
    const buckets = Object.keys(c.buckets).sort().map((k) => {
      const b = c.buckets[k];
      return { key: k, label: describe(k), n: b.s.length, p50: percentile(b.s, 50), p75: percentile(b.s, 75), p90: percentile(b.s, 90), proposal: b.s.length >= LIMITS.needed ? presets(p75(b.s)) : null, accepted: b.acc || null };
    });
    const byKind = {};
    for (const r of f.recentAttempts) {
      if (r.clock !== 'timed') continue;
      const k = byKind[r.paceKind] || (byKind[r.paceKind] = { completed: 0, expired: 0, interrupted: 0 });
      // an expiry counts whatever followed it; an attempt left before expiry
      // (stepped away) is an interruption, not a completed paced attempt
      if (r.expired) { k.completed++; k.expired++; }
      else if (r.submittedResult === 'stepped-away') k.interrupted++;
      else k.completed++;
    }
    for (const k in byKind) byKind[k].expiryRate = byKind[k].completed ? Math.round((byKind[k].expired / byKind[k].completed) * 1000) / 1000 : null;
    const excluded = f.recentAttempts.filter((r) => r.clock === 'measure' && !r.sample).map((r) => ({ n: r.n, taskId: r.taskId, bucket: r.bucket || null, excluded: r.excluded || [] }));
    return { buckets, byKind, excluded, attempts: f.recentAttempts.length, note: 'No human pilot data exists unless a facilitator collected it with consent on this device.' };
  }
  // At most a small optional summary; a timeout never becomes an error tally.
  const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  function summary(s) {
    const f = fishing(s);
    if (!f) return '';
    const n = f.recentAttempts.filter((r) => r.clock === 'timed' && r.onTime === true && r.submittedResult === 'correct').length;
    if (!n) return '';
    return (NUM[n] || String(n)) + (n === 1 ? ' response' : ' responses') + ' completed at your chosen pace.';
  }

  return {
    LIMITS, KINDS, ENV, USER, EVENTS, clock, created: () => created,
    variants, representations, complexity, bucketKey, describe, ALL_BUCKETS: ALL, isBucket: (k) => ALLSET.has(k),
    lenBucket, strokeBucket, percentile, p75, presets,
    cal, budgets, addSample, accept, recalibrate, exclusions, record, diagnostics, summary, RECORD_KEYS,
  };
})();
