/* Field Inkweaving: authored field puzzles, their durable state, and the three
 * separate layers of a field action (addendum §13; docs/ADDENDUM_CONTRACTS.md;
 * docs/addendum/fieldweave.md).
 *
 * A puzzle is data (RB.fieldweave.define): objects anchored on a map, an
 * initial state, rules that move that state, an outcome predicate
 * (`complete`) and method classes that name the equivalent routes.
 *
 *   rules: { act: 'name' }        an ordinary action, run by id from the
 *                                 object's inspection scene (!hook fw_act pz name)
 *          { weave: family|'*', obj: key|'*' }   a field weave of that response
 *                                 family on that object
 *          if: cond  set: {…}  say: {jp,en}  obs: 'fact id'  fx: 'cue'
 *   A rule without `set` (or whose `set` changes nothing) is an ineffective
 *   attempt: it only explains, physically, why nothing happened.
 *   cond: { key: value | [values…] } (all must hold), or an array of those (any).
 *
 * The three layers are kept apart. Language acceptance happens before this
 * module is asked anything (the real RB.challenge.runStep); a wrong answer
 * never reaches it. Applicability (does this response do anything to this
 * object now?) is the rule lookup; correct Japanese on the wrong object is
 * neutral physical feedback. Completion (does the world now meet the
 * outcome?) is the predicate, whichever route produced the state.
 *
 * State: s.discovery.puzzles[id] = { state, done, method, t, seen, log, via }.
 * Completion commits once (RB.state.once 'puzzle:<id>:done'), then emits
 * discovery:resolved; nothing here uses the gameplay random streams, and the
 * presentation (src/ui/57_weave.js) reads results and never writes state. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.fieldweave = (function () {
  'use strict';
  const DEFS = {};
  // Each inscription word's response family (the stable ids of
  // docs/ADDENDUM_CONTRACTS.md §6). Voice shares the bell's family: a sound.
  const FAMILY = {
    mamoru: 'protect', mizu: 'water', hikari: 'light', iyasu: 'heal', kaze: 'wind', nawa: 'bind',
    ishi: 'stone', tsuchi: 'stone', koori: 'ice', honoo: 'fire', suzu: 'bell', koe: 'bell',
  };
  // What any response does to an object with no rule for it: something plain
  // and visible, never a failure of the Japanese (which was already accepted).
  const PLAIN = {
    protect: { jp: '{淡|あわ}い {守|まも}り が {一瞬|いっしゅん} {立|た}つ が 、 ここ に は {守|まも}る もの が ない 。 すぐ に {消|き}えた 。', en: 'A pale ward stands for a moment, but there is nothing here for it to hold. It fades.' },
    water: { jp: '{水|みず} が {少|すこ}し {跳|は}ねて 、 {流|なが}れ{落|お}ちた 。 {何|なに} も {変|か}わらない 。', en: 'A little water splashes and runs off. Nothing changes.' },
    light: { jp: '{光|ひかり} が はっきり {照|て}らす 。 {見|み}える もの は 、 さっき と {同|おな}じ だ 。', en: 'Light shows it clearly. What you see is what you saw before.' },
    heal: { jp: '{柔|やわ}らかな {光|ひかり} が {触|ふ}れる が 、 ここ に {癒|いや}す もの は ない 。', en: 'A soft glow touches it, but there is nothing here to heal.' },
    wind: { jp: '{風|かぜ} が {吹|ふ}き{抜|ぬ}けた 。 {何|なに} も {動|うご}かない 。', en: 'A breeze passes through. Nothing moves.' },
    bind: { jp: '{縄|なわ} の {形|かたち} が {巻|ま}きついて 、 {結|むす}ぶ ところ が なく ほどけた 。', en: 'The shape of a rope winds round it, finds nothing to tie to, and falls loose.' },
    stone: { jp: '{重|おも}み が {一瞬|いっしゅん} かかる 。 もともと {動|うご}かない もの だ 。', en: 'A weight settles on it for a moment. It was not moving anyway.' },
    ice: { jp: '{冷|つめ}たい {霜|しも} が {薄|うす}く {張|は}って 、 すぐ {消|き}えた 。', en: 'A thin frost forms and is gone.' },
    fire: { jp: '{小|ちい}さな {炎|ほのお} が {揺|ゆ}れて 、 {何|なに} も {焦|こ}がさず に {消|き}えた 。', en: 'A small flame flickers and goes out without scorching anything.' },
    bell: { jp: '{澄|す}んだ {音|おと} が {響|ひび}いて 、 {消|き}えて いく 。', en: 'A clear note rings out and fades.' },
    support: { jp: '{何|なに} も {起|お}きない 。', en: 'Nothing happens.' },
  };
  const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
  const LOG_MAX = 24;

  // ---- definitions -------------------------------------------------------------------------
  function define(def) {
    if (!def || !def.id) throw new Error('fieldweave: a puzzle needs an id');
    def.objects = def.objects || {};
    for (const k in def.objects) {
      const o = def.objects[k];
      o.key = k; o.w = o.w || 1; o.h = o.h || 1;
    }
    def.rules = (def.rules || []).map((r, i) => Object.assign({ n: i }, r, { id: r.id || (r.act ? 'act:' + r.act : 'weave:' + r.weave + '@' + (r.obj || '*')) + '#' + i }));
    def.init = def.init || {};
    def.methods = def.methods || [];
    DEFS[def.id] = def;
    return def;
  }
  const get = (id) => DEFS[id] || null;
  const list = () => Object.keys(DEFS).map((k) => DEFS[k]);

  // ---- records -----------------------------------------------------------------------------
  function disc(s) { return s.discovery || (s.discovery = RB.state.newCampaign().discovery); }
  // The record, created on first touch (reading never writes the save).
  function rec(s, id) {
    const d = disc(s), def = DEFS[id];
    if (!d.puzzles[id]) d.puzzles[id] = { state: clone(def ? def.init : {}), done: false, method: null, t: null, seen: {}, log: [] };
    return d.puzzles[id];
  }
  function peek(s, id) {
    const r = s && s.discovery && s.discovery.puzzles[id];
    if (r) return r;
    const def = DEFS[id];
    return { state: clone(def ? def.init : {}), done: false, method: null, t: null, seen: {}, log: [], virtual: true };
  }
  const stateOf = (s, id) => peek(s, id).state;
  // What the world draws: the committed state, except while a field action is
  // being shown (the object changes at the effect's beat, not before it).
  const hold = {};
  function view(s, id) { return hold[id] || stateOf(s, id); }
  function setHold(id, st) { if (st) hold[id] = st; else delete hold[id]; }

  function one(st, cond) {
    for (const k in cond) {
      const want = cond[k], have = st[k] == null ? (typeof want === 'boolean' || (Array.isArray(want) && typeof want[0] === 'boolean') ? false : null) : st[k];
      if (Array.isArray(want) ? want.indexOf(have) < 0 : want !== have) return false;
    }
    return true;
  }
  function match(st, cond) {
    if (cond == null) return true;
    if (typeof cond === 'function') return !!cond(st);
    if (Array.isArray(cond)) return cond.some((c) => one(st, c));
    return one(st, cond);
  }
  function eligible(s, id) {
    const def = DEFS[id];
    return !!def && (!def.eligible || RB.state.test(s, def.eligible));
  }
  // The route that produced this state: the first method class whose
  // condition holds (definitions list them in order of precedence).
  function methodOf(def, st, rule) {
    for (const m of def.methods) if (match(st, m.if) && (!m.rule || [].concat(m.rule).indexOf(rule && (rule.act || rule.weave)) >= 0)) return m.id;
    return 'ordinary';
  }

  // ---- objects in the world ----------------------------------------------------------------
  // Every object of every eligible puzzle on a map: { pz, key, o, x, y, w, h }.
  function objectsOn(s, mapId) {
    const out = [];
    for (const id in DEFS) {
      const def = DEFS[id];
      if (def.map !== mapId || !eligible(s, id)) continue;
      for (const k in def.objects) {
        const o = def.objects[k];
        if (o.if && !RB.state.test(s, o.if)) continue;
        out.push({ pz: id, key: k, o, x: o.x, y: o.y, w: o.w, h: o.h, def });
      }
    }
    return out;
  }
  // Chebyshev distance from a tile to an object's footprint.
  function dist(t, x, y) {
    const dx = x < t.x ? t.x - x : x >= t.x + t.w ? x - (t.x + t.w - 1) : 0;
    const dy = y < t.y ? t.y - y : y >= t.y + t.h ? y - (t.y + t.h - 1) : 0;
    return Math.max(dx, dy);
  }
  // The weave targets near a tile: the object in front first, then nearest.
  function near(s, mapId, x, y, dir, radius) {
    radius = radius == null ? 2 : radius;
    const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir] || [0, 0];
    const fx = x + D[0], fy = y + D[1];
    return objectsOn(s, mapId).filter((t) => t.o.weave !== false && dist(t, x, y) <= radius)
      .map((t) => Object.assign(t, { d: dist(t, x, y), front: dist(t, fx, fy) === 0 }))
      .sort((a, b) => (b.front - a.front) || (a.d - b.d) || (a.y - b.y) || (a.x - b.x));
  }
  // What the player can see of an object now: the first `look` whose
  // condition holds (on the puzzle state and, with `ifs`, on the campaign).
  function lookOf(s, pz, key) {
    const def = DEFS[pz], o = def && def.objects[key];
    if (!o) return null;
    const st = stateOf(s, pz), r = peek(s, pz);
    for (const l of o.look || []) {
      if (l.if && !match(st, l.if)) continue;
      if (l.ifs && !RB.state.test(s, l.ifs)) continue;
      if (l.done != null && !!r.done !== l.done) continue;
      return l;
    }
    return null;
  }
  // an observed fact (kept through a reset; drives hints and descriptions)
  function observe(s, pz, fact) {
    if (!fact || !DEFS[pz]) return false;
    const r = rec(s, pz);
    if (r.seen[fact]) return false;
    r.seen[fact] = Date.now();
    return true;
  }

  // ---- rules ---------------------------------------------------------------------------------
  function objOk(r, key) { return !r.obj || r.obj === '*' || [].concat(r.obj).indexOf(key) >= 0; }
  // the first rule that applies to an ordinary action on an object
  function actRule(def, st, name) {
    return def.rules.find((r) => r.act === name && match(st, r.if)) || null;
  }
  // the most specific weave rule for this family on this object, in this state
  function weaveRule(def, st, key, fam) {
    const cands = def.rules.filter((r) => r.weave && (r.weave === fam || r.weave === '*') && objOk(r, key) && match(st, r.if));
    const rank = (r) => (r.obj && r.obj !== '*' ? 0 : 2) + (r.weave === fam ? 0 : 1);
    cands.sort((a, b) => rank(a) - rank(b) || a.n - b.n);
    return cands[0] || null;
  }
  // Would this response change anything here now? (for previews: the same
  // lookup as weave(), without writing; never used to hide a response)
  function applies(s, pz, key, word) {
    const def = DEFS[pz];
    if (!def) return false;
    const r = weaveRule(def, stateOf(s, pz), key, familyOf(word));
    return !!(r && r.set && Object.keys(r.set).some((k) => stateOf(s, pz)[k] !== r.set[k]));
  }

  let seq = 0;
  // Apply a rule: the authoritative commit. Returns what happened, for the
  // presentation to show afterwards.
  function apply(s, pz, rule, kind, extra) {
    const def = DEFS[pz];
    const r = rec(s, pz);
    const before = clone(r.state);
    const after = clone(r.state);
    if (rule && rule.set) Object.assign(after, clone(rule.set));
    const changed = Object.keys(after).filter((k) => after[k] !== before[k]);
    const res = Object.assign({
      pz, kind, rule: rule ? rule.id : null, act: rule ? rule.act || null : null, before, after, changed,
      effective: changed.length > 0, say: rule && rule.say ? [].concat(rule.say) : [], fx: rule && rule.fx || null,
      obs: rule && rule.obs || null, completed: false, method: null, keepsake: null, id: 'fw:' + pz + ':' + (++seq),
      region: def.region,
    }, extra || {});
    if (rule && rule.obs) observe(s, pz, rule.obs);
    if (res.effective) {
      r.state = after;
      r.log.push({ r: rule.act || rule.weave, k: res.key || null, t: Date.now() });
      if (r.log.length > LOG_MAX) r.log.splice(0, r.log.length - LOG_MAX);
      // an object that changed tells the map annotations about it
      for (const k of changed) RB.bus.emit('world:changed', { map: def.map, prop: pz + '.' + k, state: after[k], puzzle: pz });
    }
    if (!r.done && match(r.state, def.complete)) commit(s, pz, rule, res);
    return res;
  }
  // The outcome holds: record it once, with the route that produced it.
  function commit(s, pz, rule, res) {
    const def = DEFS[pz], r = rec(s, pz);
    const method = methodOf(def, r.state, rule);
    r.done = true;
    r.method = method;
    r.t = Date.now();
    if (res.lang) r.via = { word: res.word || null, family: res.family || null, mode: res.lang.mode || null, assisted: !!res.lang.assisted };
    // a temporary support gives way to the lasting ordinary arrangement
    if (def.after) { r.state = Object.assign(r.state, clone(def.after)); res.after = clone(r.state); }
    res.completed = true;
    res.method = method;
    if (RB.state.once(s, 'puzzle:' + pz + ':done')) {
      const k = def.reward && def.reward.keepsake;
      if (k && RB.discovery && RB.discovery.keepsake(s, k, { kind: 'puzzle', id: pz, method })) res.keepsake = k;
      res.first = true;
    }
    RB.bus.emit('discovery:resolved', { kind: 'puzzle', id: pz, region: def.region, method, id2: 'puzzle:' + pz + ':done', map: def.map });
    return res;
  }

  // An ordinary action from an inspection scene (by name).
  function act(s, pz, name) {
    const def = DEFS[pz];
    if (!def || !eligible(s, pz)) return null;
    const r0 = peek(s, pz);
    if (r0.done && !(def.after_acts || []).includes(name)) return apply(s, pz, null, 'act', { key: null, stale: true });
    const rule = actRule(def, r0.state, name);
    return apply(s, pz, rule, 'act', { key: rule && rule.obj ? [].concat(rule.obj)[0] : null, stale: !rule });
  }
  // A field weave: `word` was already accepted by the language step (lang is
  // that step's result, for the record; it never decides applicability).
  function weave(s, pz, key, word, lang) {
    const def = DEFS[pz];
    if (!def || !def.objects[key] || !eligible(s, pz)) return null;
    const fam = familyOf(word);
    const r0 = peek(s, pz);
    const rule = r0.done ? null : weaveRule(def, r0.state, key, fam);
    const res = apply(s, pz, rule, 'weave', { key, word, family: fam, lang: lang || null });
    if (!rule || !res.say.length) res.say = [r0.done && def.solvedSay ? def.solvedSay : PLAIN[fam] || PLAIN.support];
    res.neutral = !res.effective;
    // the same word on the same object, once understood, may be repeated directly
    if (res.effective) { const rr = rec(s, pz); rr.known = rr.known || {}; rr.known[key + ':' + word] = 1; }
    return res;
  }
  // A routine repeat of an understood control needs no language step: the
  // same word already worked on this object before (and did something).
  function routine(s, pz, key, word) {
    const r = peek(s, pz);
    return !!(r.known && r.known[key + ':' + word]);
  }
  // Back to the first arrangement: observations, a finished result and its
  // keepsake are kept; a finished puzzle is not reset.
  function reset(s, pz) {
    const def = DEFS[pz];
    if (!def) return false;
    const r = rec(s, pz);
    if (r.done) return false;
    const before = clone(r.state);
    r.state = clone(def.init);
    r.log.push({ r: 'reset', t: Date.now() });
    if (r.log.length > LOG_MAX) r.log.splice(0, r.log.length - LOG_MAX);
    for (const k of Object.keys(before)) if (before[k] !== r.state[k]) RB.bus.emit('world:changed', { map: def.map, prop: pz + '.' + k, state: r.state[k], puzzle: pz });
    return true;
  }
  // Layered hints: broad, then specific, then the whole route. No cost.
  function hintLevel(s, pz) { return (s.discovery && s.discovery.hints[pz]) || 0; }
  function hint(s, pz) {
    const def = DEFS[pz];
    if (!def || !def.hints) return 0;
    const d = disc(s);
    d.hints[pz] = Math.min(def.hints.length, (d.hints[pz] || 0) + 1);
    return d.hints[pz];
  }
  function familyOf(word) {
    return FAMILY[word] || (RB.content.words[word] && RB.content.words[word].family) || 'support';
  }

  // ---- saves ---------------------------------------------------------------------------------
  // Repair only what is broken, puzzle by puzzle: an unknown puzzle id is kept
  // and ignored; a known one with a value its definition does not allow goes
  // back to its documented safe arrangement (the start, or the solved
  // arrangement if it was finished). Evidence and results are kept.
  function repair(st) {
    const d = st && st.discovery;
    if (!d || !d.puzzles || typeof d.puzzles !== 'object') return;
    for (const id in d.puzzles) {
      const def = DEFS[id];
      let r = d.puzzles[id];
      if (!def) continue;
      if (!r || typeof r !== 'object' || Array.isArray(r)) r = d.puzzles[id] = { state: clone(def.init), done: false, method: null, t: null, seen: {}, log: [], repaired: 'shape' };
      if (!r.seen || typeof r.seen !== 'object') r.seen = {};
      if (!Array.isArray(r.log)) r.log = [];
      r.done = !!r.done;
      let bad = !r.state || typeof r.state !== 'object' || Array.isArray(r.state);
      if (!bad && def.values) for (const k in def.values) if (r.state[k] != null && def.values[k].indexOf(r.state[k]) < 0) bad = true;
      if (!bad && r.done && def.complete && !match(r.state, def.complete)) bad = true;
      if (bad) {
        r.state = clone(r.done ? (def.solved || def.init) : def.init);
        r.repaired = r.done ? 'solved' : 'start';
      } else for (const k in def.init) if (!(k in r.state)) r.state[k] = clone(def.init[k]);
      if (r.done && !r.method) r.method = 'ordinary';
    }
  }
  // (registered with RB.save.addMigration by src/content/discovery/10_puzzles.js:
  // the save module loads after this file)

  // ---- conditions: puzzle.f1=done, puzzle.f1.screen=shut, puzzle.f1 (touched) --------------
  RB.state.addTerm('puzzle', (s, rest, op, val, num, cmp) => {
    const dot = rest.indexOf('.');
    const id = dot < 0 ? rest : rest.slice(0, dot), key = dot < 0 ? null : rest.slice(dot + 1);
    const r = s.discovery && s.discovery.puzzles[id];
    if (!key) {
      if (val === 'done') return cmp(!!(r && r.done), op || '=', true);
      return op ? cmp(r && r.done ? 'done' : r ? 'open' : 'none', op, val) : !!r;
    }
    const v = stateOf(s, id)[key];
    if (!op) return !!v;
    const want = val === 'true' ? true : val === 'false' ? false : num(val);
    return cmp(v == null ? (typeof want === 'boolean' ? false : 'none') : v, op, want);
  });

  return {
    define, get, list, rec, peek, stateOf, view, setHold, match, eligible, methodOf, objectsOn, near, dist,
    lookOf, observe, act, weave, applies, routine, reset, hint, hintLevel, familyOf, repair, FAMILY, PLAIN,
    _weaveRule: weaveRule, _actRule: actRule,
  };
})();
