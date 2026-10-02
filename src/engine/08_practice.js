/* Roadside practice: the shared core of the Practice, Fishing and Shiritori
 * addendum (docs/PRACTICE_CONTRACTS.md). Activities keep their own records in
 * s.practice; ordinary learning stays in s.learn and is written only through
 * the adapter below, at most once per authored objective.
 *
 *   RB.practice.fresh()                 a new, empty practice state
 *   RB.practice.of(s)                   s.practice, created/filled when missing
 *   RB.practice.addNamespace(key, def, norm)  an activity's own sub-state
 *   RB.practice.settings(s) / set(s,k,v)      per-campaign activity setup
 *   RB.practice.seq(s)                  the next session/cast sequence number
 *   RB.practice.stream(s, name, extra)  a seeded random stream (never Math.random)
 *   RB.practice.objectives(session)     assess(objId, item, res, o): one mastery
 *                                       event per objective; practice tallies
 *   RB.practice.tally(s, kind, fields)  bounded counts kept apart from mastery
 *   RB.practice.cooldown()              no immediate repeat; a missed objective
 *                                       waits four objectives
 *   RB.practice.pickItems(pool, n, cd)  the scheduler's choice within the cooldown
 *   RB.practice.addActivity(def)        an entry in Words › Ways to practise
 *   RB.practice.addMementoSource(def)   finite cosmetic practice mementos (Journey)
 *
 * Nothing here reads the wall clock for eligibility, keeps a streak, or awards
 * bond: the two wordplay relationship events go through RB.company.award. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.practice = (function () {
  'use strict';
  const V = 1;
  // per-campaign setup that a fresh campaign starts with (addendum §20.3)
  const SETTINGS = {
    fishingPace: 'off',          // off | gentle | brisk | custom
    fishingCustomSec: null,      // 5–180 when custom
    shiritoriFormat: 'competitive', // competitive | cooperative
    shiritoriBand: 'pocket',     // pocket | everyday | extended | journey
    shiritoriLevel: 'casual',    // casual | thoughtful | sharp (cooperative: partner)
    shiritoriSupport: 'open',    // open | recall
    shiritoriChain: 12,          // cooperative goal: 6 | 12 | 20
    demoSeen: false,             // shiritori rules demonstration offered once
  };
  const NS = {};   // key -> { def: () => obj, norm?: (x) => x }
  const LIMITS = { tallyKinds: 64, recent: 50 };

  function fresh() {
    const p = {
      v: V, nextSessionSeq: 0, settings: {},
      fishing: { observed: {}, siteQueues: {}, milestones: {}, calibration: {}, recentAttempts: [], lastCommittedCatchSeq: 0, active: null },
      shiritori: { byCompanion: {}, active: null },
      deskPages: [],
      activityCompletion: {},
      tally: {},
    };
    for (const k in NS) p[k] = NS[k].def();
    return p;
  }
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  // fill what is missing, keep everything present (unknown future ids included)
  function fill(p) {
    const f = fresh();
    for (const k in f) {
      if (p[k] == null) p[k] = f[k];
      else if (isObj(f[k]) && isObj(p[k])) { for (const j in f[k]) if (p[k][j] == null) p[k][j] = f[k][j]; }
    }
    if (!Array.isArray(p.deskPages)) p.deskPages = [];
    if (!Array.isArray(p.fishing.recentAttempts)) p.fishing.recentAttempts = [];
    for (const k in NS) if (NS[k].norm) p[k] = NS[k].norm(p[k]) || p[k];
    return p;
  }
  function of(s) {
    if (!s) return null;
    if (!isObj(s.practice)) s.practice = fresh();
    else if (!s.practice._ok) { fill(s.practice); Object.defineProperty(s.practice, '_ok', { value: true, enumerable: false, configurable: true }); }
    return s.practice;
  }
  function addNamespace(key, def, norm) { NS[key] = { def, norm }; }

  function settings(s) {
    const p = of(s);
    return Object.assign({}, SETTINGS, p ? p.settings : {});
  }
  function set(s, k, v) { const p = of(s); if (p) p.settings[k] = v; }

  function seq(s) { const p = of(s); p.nextSessionSeq = (p.nextSessionSeq | 0) + 1; return p.nextSessionSeq; }

  // A seeded stream for one purpose: species queues, strategy tie-breaks,
  // decorative motion and so on each get their own, so one never shifts another.
  function stream(s, name, extra) {
    const id = (s && (s.id || s.created)) || 'campaign';
    return RB.util.rng(RB.util.hashStr(String(id) + '|' + name + '|' + (extra == null ? '' : extra)));
  }

  // ---- learning evidence (addendum §4) ----------------------------------------------------
  // An objective is one authored assessment inside a session. The first
  // confirmed result for it may become one ordinary mastery event; anything
  // after it (a corrected or assisted continuation, a replay) is practice
  // evidence only. Exposed answers (traced, copied, shown) never promote recall.
  function objectives(session) {
    const done = new Set();
    return {
      assess(objId, item, res, o) {
        o = o || {};
        const s = (RB.game && RB.game.s) || o.s;
        if (!objId || !res || res.cancelled) return false;
        const first = !done.has(objId);
        done.add(objId);
        const mode = res.mode === 'hand' ? 'hand' : res.mode === 'ime' ? 'ime' : 'choice';
        if (s) tally(s, o.kind || (session && session.kind) || 'practice', { n: 1, ok: res.firstTry !== false ? 1 : 0, assisted: res.assisted ? 1 : 0, exposed: o.exposed ? 1 : 0 });
        if (!first || o.exposed || o.paced || !item) { if (item) [].concat(item).forEach((i) => RB.learn.markIntroduced(i)); return false; }
        RB.learn.record(item, { ok: res.firstTry !== false, mode, assisted: !!res.assisted, ctx: 'practice:' + ((session && session.kind) || o.kind || '') });
        [].concat(item).forEach((i) => RB.learn.markIntroduced(i));
        return true;
      },
      seen: (objId) => done.has(objId),
    };
  }
  // bounded counts kept apart from mastery (wordplay use, motor practice, paced attempts…)
  function tally(s, kind, fields) {
    const p = of(s);
    if (!p) return;
    if (!p.tally[kind] && Object.keys(p.tally).length >= LIMITS.tallyKinds) return;
    const t = p.tally[kind] || (p.tally[kind] = {});
    for (const k in fields) t[k] = (t[k] || 0) + (+fields[k] || 0);
  }

  // ---- caller-side cooldowns (addendum §4.4) --------------------------------------------
  function cooldown() {
    const hist = []; // { id, missed }
    return {
      allow(id) {
        if (!hist.length) return true;
        if (hist[hist.length - 1].id === id) return false;          // never the identical objective again at once
        const k = hist.slice(-4).findIndex((h) => h.id === id && h.missed);
        return k < 0;                                                // a miss waits four objectives
      },
      push(id, missed) { hist.push({ id, missed: !!missed }); if (hist.length > 32) hist.shift(); },
      history: () => hist.slice(),
    };
  }
  // up to n items from pool, chosen by the scheduler but only among those the
  // cooldown allows; a short pool gives a short session (never repeats to fill)
  function pickItems(pool, n, cd) {
    const ok = Array.from(new Set(pool)).filter((id) => !cd || cd.allow(id));
    if (!ok.length) return [];
    return Array.from(new Set(RB.learn.pick(ok, Math.min(n, ok.length)))).slice(0, n);
  }

  // ---- Words › Ways to practise (src/ui/68_practice_index.js renders it) ------------------
  // def: { id, en, jp, icon, order, where:{en,jp}, available(s)→bool, here(s)→bool,
  //        note(s)→string (why not / where), begin()→Promise (only when here and safe) }
  const ACTS = [];
  function addActivity(def) {
    const i = ACTS.findIndex((d) => d.id === def.id);
    if (i >= 0) ACTS[i] = def; else ACTS.push(def);
    ACTS.sort((a, b) => (a.order || 50) - (b.order || 50));
  }
  const activities = () => ACTS.slice();

  // ---- Practice mementos (Journey; addendum §8.1, §16.3) ------------------------------------------
  // A source lists what it has to show: fishing's rod ribbon and framed illustration,
  // the writing desk's kept pages, the proofreader's kept page. Finite, cosmetic, never
  // part of the twelve Roadside Keepsakes. def: { id, order?, list(s) -> [{ id, title:{jp,en},
  //   kind, note?, draw?(canvas), html?() }] }
  const MEMS = [];
  function addMementoSource(def) {
    const i = MEMS.findIndex((d) => d.id === def.id);
    if (i >= 0) MEMS[i] = def; else MEMS.push(def);
    MEMS.sort((a, b) => (a.order || 50) - (b.order || 50));
  }
  function mementos(s) {
    const out = [];
    for (const d of MEMS) { try { for (const m of d.list(s) || []) out.push(Object.assign({ source: d.id }, m)); } catch (e) { console.error('memento source ' + d.id, e); } }
    return out;
  }

  // Old saves: practice starts empty, pace Off; nothing is inferred from older flags
  // (§21.4). RB.save.migrate calls of(st) (the save module loads after this one).

  return { V, SETTINGS, LIMITS, fresh, of, fill, addNamespace, settings, set, seq, stream, objectives, tally, cooldown, pickItems, addActivity, activities, addMementoSource, mementos };
})();
