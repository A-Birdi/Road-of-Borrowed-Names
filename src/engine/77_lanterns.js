/* Lantern tending (Practice addendum §15): "Tend a few lamps" at the Lantern
 * Hall in Reedwake once Chapter 1 has ended. The lamps are a separate rack of
 * practice shades (prop pa_lamprack, src/content/practice_a/); nothing here
 * reads or writes a story lantern flag.
 *
 * One lamp is one authored assessment: an existing drill for the item (at or
 * below the player's level) or the task generator's step for it, run through
 * RB.challenge.runStep with nothing recorded, then RB.practice.objectives
 * (session).assess, so at most one ordinary mastery event per lamp. The queue
 * follows learning events (RB.practice.pickItems → RB.learn.pick), never
 * dates: no streak, no missed-day text, no wall clock. A short pool gives a
 * short session.
 *
 *   RB.lanterns.unlocked(s) / here(s)          Chapter 1 over / standing in the Hall
 *   RB.lanterns.topics(s)                      [{ id, en, jp, n }] with eligible counts
 *   RB.lanterns.pool(s, { mode, topic })       eligible item ids (mode review | topic | new)
 *   RB.lanterns.cooldown(s)                    RB.practice.cooldown() fed with the kept history
 *   RB.lanterns.plan(s, { mode, topic, count }) { items, pool, count, short }
 *   RB.lanterns.stepFor(s, id, seed)           the authored step for one lamp
 *   RB.lanterns.teachFor(id)                   the small example shown before a new word
 *   RB.lanterns.tend(s, ob, objId, id, step, res, o)  record one lamp → { lit, missed, counted }
 *        (o.exposed: a new word's card was just shown, so the lamp is practice, not recall)
 *   RB.lanterns.finish(s, n)                   end of a session → { firstNote }
 *   RB.lanterns.labelOf(id, step)              { jp, en } for the reviewed list
 */
var RB = (globalThis.RB = globalThis.RB || {});

RB.lanterns = (function () {
  'use strict';
  const HALL = 'rw.hall';
  const RACK = { map: HALL, x: 9, y: 2 };
  const COUNTS = [3, 6];
  const RECENT = 8;          // kept objective history (ids + missed), for the caller-side cooldown
  const LV = { F: 0, E: 1, I: 2, A: 3 };
  // drill region tags → the map prefix that shows the region has been reached
  const REGION = { saltglass: 'sg.', cinder: 'co.', snowbell: 'sb.', lanternfall: 'lf.', still: 'sa.' };
  const NOTE = 'pa_lamps';

  // s.practice.lanterns: bounded, plain data (no dates)
  RB.practice.addNamespace('lanterns', () => ({ v: 1, sessions: 0, lamps: 0, recent: [], noted: false, last: { mode: 'review', topic: null, count: 3 } }), (x) => {
    if (!x || typeof x !== 'object') return null;
    if (!Array.isArray(x.recent)) x.recent = [];
    x.recent = x.recent.filter((h) => h && typeof h.id === 'string').slice(-RECENT);
    if (!x.last || typeof x.last !== 'object') x.last = { mode: 'review', topic: null, count: 3 };
    if (COUNTS.indexOf(x.last.count) < 0) x.last.count = 3;
    x.sessions = x.sessions | 0; x.lamps = x.lamps | 0;
    return x;
  });
  const st = (s) => RB.practice.of(s).lanterns;

  const unlocked = (s) => !!(s && s.flags && (s.flags.ch1_done || (s.chapter | 0) > 1));
  const here = (s) => !!(s && s.map === HALL);
  const profile = (s) => (s && s.learn && s.learn.profile) || 'F';

  // ---- drills by item (built once, after content has loaded) -----------------------------
  let byItem = null;
  function drills() {
    if (byItem) return byItem;
    byItem = new Map();
    for (const d of RB.content.drills || []) {
      for (const it of [].concat(d.item || [])) {
        if (typeof it !== 'string') continue;
        if (!byItem.has(it)) byItem.set(it, []);
        byItem.get(it).push(d);
      }
    }
    return byItem;
  }
  const drillsFor = (id) => drills().get(id) || [];
  const levelOk = (s, d) => LV[d.lv] != null && LV[d.lv] <= LV[profile(s)];

  // Can one authored assessment be built for this item for this player? (no side effects)
  function steppable(s, id) {
    if (typeof id !== 'string' || id.length < 3 || id[1] !== ':') return false;
    const k = id[0], v = id.slice(2);
    if (drillsFor(id).some((d) => levelOk(s, d))) return true;
    if (k === 'k') return RB.kana.isKana(v) && Array.from(v).length === 1 && RB.learn.kanaKnown(v);
    if (k === 'v') return !!RB.tasks.findWord(v);
    return false; // grammar and reading items need an authored drill
  }
  // the scheduler's own mistake cooldown, honoured by the caller too (§4.4)
  function resting(s, id) {
    const r = s.learn.items[id];
    return !!(r && r.cool > (s.learn.clock || 0));
  }
  function familiarIds(s) {
    const L = s.learn, out = new Set();
    for (const id in L.items || {}) { const r = L.items[id]; if (r && r.seen > 0) out.add(id); }
    for (const id in L.intro || {}) if (L.intro[id]) out.add(id);
    return Array.from(out);
  }
  const reached = (s, tag) => !REGION[tag] || Object.keys(s.visited || {}).some((m) => m.indexOf(REGION[tag]) === 0);
  function topicOf(id) {
    const k = id[0];
    const out = [k === 'k' ? 'kana' : k === 'v' ? 'words' : 'grammar'];
    for (const d of drillsFor(id)) for (const t of d.tags || []) if (REGION[t] && out.indexOf(t) < 0) out.push(t);
    return out;
  }

  // the eligible pool for a session (review: what you have met; topic: one slice of it;
  // new: vocabulary not yet introduced, from drills of places you have reached and the
  // writing desk's twenty cards)
  function pool(s, o) {
    o = o || {};
    if (o.mode === 'new') return fresh(s);
    let ids = familiarIds(s).filter((id) => steppable(s, id) && !resting(s, id));
    if (o.mode === 'topic' && o.topic) ids = ids.filter((id) => topicOf(id).indexOf(o.topic) >= 0);
    return ids.sort();
  }
  function fresh(s) {
    const out = new Set();
    for (const d of RB.content.drills || []) {
      const it = d.item;
      if (typeof it !== 'string' || it.slice(0, 2) !== 'v:') continue;
      if (!levelOk(s, d) || !(d.tags || []).some((t) => reached(s, t))) continue;
      if (RB.learn.introduced(it) || !RB.tasks.findWord(it.slice(2))) continue;
      out.add(it);
    }
    const cards = (RB.content.practiceA && RB.content.practiceA.cards) || [];
    for (const c of cards) if (!RB.learn.introduced(c.item) && RB.tasks.findWord(c.word + '|' + c.r)) out.add(c.item);
    return Array.from(out).sort();
  }
  function topics(s) {
    const T = (RB.content.practiceA && RB.content.practiceA.lanterns && RB.content.practiceA.lanterns.topics) || {};
    const ids = pool(s, { mode: 'review' });
    const n = {};
    for (const id of ids) for (const t of topicOf(id)) n[t] = (n[t] || 0) + 1;
    return ['kana', 'words', 'grammar'].concat(Object.keys(REGION)).filter((t) => n[t]).map((t) => ({ id: t, en: (T[t] && T[t].en) || t, jp: (T[t] && T[t].jp) || '', n: n[t] }));
  }

  // the caller-side cooldown (§4.4): no immediate identical objective, a missed one
  // waits four objectives, also across sessions (the kept history is a few ids, no dates)
  function cooldown(s) {
    const cd = RB.practice.cooldown();
    for (const h of st(s).recent) cd.push(h.id, h.missed);
    return cd;
  }
  function plan(s, o) {
    o = o || {};
    const count = COUNTS.indexOf(o.count) >= 0 ? o.count : 3;
    const p = pool(s, o);
    const items = RB.practice.pickItems(p, count, cooldown(s));
    return { items, pool: p.length, count, short: items.length < count };
  }

  // ---- one lamp's step ------------------------------------------------------------------------------------
  function stepFor(s, id, seed) {
    const r = RB.util.rng(RB.util.hashStr(String(id) + '#' + (seed == null ? 0 : seed)));
    const ds = drillsFor(id).filter((d) => levelOk(s, d));
    let step = null;
    if (ds.length) {
      const top = Math.max.apply(null, ds.map((d) => LV[d.lv]));
      const near = ds.filter((d) => LV[d.lv] === top);
      step = RB.util.deepClone(near[Math.floor(r() * near.length)]);
    } else if (id[0] === 'k') step = RB.tasks.kanaStep(id.slice(2));
    else if (id[0] === 'v') step = RB.tasks.vocabStep(id.slice(2));
    if (!step) return null;
    step = RB.tasks.prepare(step);
    if (!step.item) step.item = id;
    return step;
  }
  // the small example taught before a new word is asked for (§15.2)
  function teachFor(id) {
    if (id.slice(0, 2) !== 'v:') return null;
    const e = RB.tasks.findWord(id.slice(2));
    if (!e) return null;
    const jp = e.w !== e.r && RB.jp.rubyize ? RB.jp.rubyize(e.w, e.r) || e.w : e.w;
    const card = ((RB.content.practiceA && RB.content.practiceA.cards) || []).find((c) => c.item === id);
    const d = drillsFor(id).find((x) => x.ctx && x.ctx.jp && x.ctx.en);
    const ex = card ? [{ jp: card.full.jp, en: card.full.en }] : d ? [{ jp: d.ctx.jp, en: d.ctx.en }] : [];
    return { title: 'Something new', jp, en: e.r + ' (' + RB.kana.romaji(e.r) + '): ' + e.m + '.', ex };
  }

  // ---- recording one lamp ------------------------------------------------------------------------------------
  // The lamp is lit once its step is completed, however it was answered: a mistake
  // is explained and continued, and help never makes a lamp dimmer.
  // o.exposed: the answer was in view just before (a new word's card): practice, not recall
  function tend(s, ob, objId, id, step, res, o) {
    if (!res || res.cancelled) return { lit: false, missed: false, counted: false };
    const counted = ob.assess(objId, step.item || id, res, { kind: 'lanterns', s, exposed: !!(o && o.exposed) });
    const missed = res.firstTry === false;
    const L = st(s);
    L.recent.push({ id, missed });
    if (L.recent.length > RECENT) L.recent.splice(0, L.recent.length - RECENT);
    L.lamps = (L.lamps | 0) + 1;
    return { lit: true, missed, counted };
  }
  // A finished session: a count, and the first one adds one notebook note (nothing else
  // is collected: no currency, no bond, no display).
  function finish(s, n) {
    const L = st(s);
    L.sessions = (L.sessions | 0) + 1;
    let firstNote = false;
    if (n > 0 && !L.noted) {
      L.noted = true;
      if (RB.content.notes[NOTE] && !s.notebook.find((e) => e.id === NOTE)) { s.notebook.push({ kind: 'lore', id: NOTE, t: 0 }); firstNote = true; }
    }
    return { firstNote };
  }
  function remember(s, o) { const L = st(s); L.last = { mode: o.mode || 'review', topic: o.topic || null, count: COUNTS.indexOf(o.count) >= 0 ? o.count : 3 }; }

  // what the reviewed list shows for an item
  function labelOf(id, step) {
    const k = id[0], v = id.slice(2);
    if (k === 'k') return { jp: v, en: RB.kana.romaji(v) };
    if (k === 'v') {
      const e = RB.tasks.findWord(v);
      if (e) return { jp: e.w !== e.r && RB.jp.rubyize ? RB.jp.rubyize(e.w, e.r) || e.w : e.w, en: e.m };
    }
    if (k === 'g' && RB.grammar && RB.grammar.points) {
      const g = RB.grammar.points.find((x) => x.id === v);
      if (g) return { jp: g.title || '', en: g.en || '' };
    }
    return { jp: (step && step.ctx && step.ctx.jp) || '', en: (step && (step.title || (step.prompt && step.prompt.en))) || 'A reading question' };
  }

  return { HALL, RACK, COUNTS, NOTE, REGION, unlocked, here, topics, pool, plan, cooldown, stepFor, teachFor, tend, finish, remember, labelOf, state: st, steppable, _reset: () => { byItem = null; } };
})();
