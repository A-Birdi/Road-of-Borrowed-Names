/* The Hall of a Hundred Tales (百物語の館): expansion P15; plan 04_DUNGEONS.md D9; docs/future/work/P15_POSTGAME.md.
 * The old lantern-keepers' hall above the Keepers' Road, where apprentices relit a hundred lanterns, one for each tale
 * understood. Ten wings of ten trials, each wing one tale inside a lantern's light. Built on the expedition engine
 * (src/engine/98_expedition.js): each wing is an expedition of kind 'hall' with persistent condition, stations per
 * floor and the floor restarted on defeat.
 *
 *   wing(id, spec)   spec: { n, title { jp, en }, theme { jp, en } (the language theme), folklore { en } (the label
 *                    shown in the game: real custom, real legend or invented), music, hearth { map, x, y, dir } (the
 *                    wing's checkpoint, where its lantern is relit), patterns (how many room patterns), grow { en }
 *                    (the constructions Grow introduces, stated on the card), floors: [{ id, map, entry, name,
 *                    stations, procedures }], trials: [{ id: 't1'…'t10', floor, kind, title, reprieve }] }
 *   manifest()       every trial of every wing: [{ id: 'w1.t1', wing, trial, floor, kind }]
 *   enter(s, w, { held }) / retreat(s, { keep }) / markTrial(s, w, t) / resetFloor(s, w, k)
 *   choice(s, w) / setChoice(s, w, { route, tactics })   the three choices (the profile is always the campaign's)
 *   tactics(s)       the tactical setting in force (a wing's own while in it, else the campaign's)
 *   trialDone / floorClear / wingDone / litCount / note(s, w)
 *
 * The rules (D9, Robin's): condition carries across a wing, never what mistakes cost; a floor's trials count once
 * the floor is cleared (all its trials done), and from then on stay done; defeat starts the current floor again;
 * the emergency retreat (anywhere outside battle) leaves the wing and the current floor starts again next time,
 * earlier floors and wings kept; an earned reprieve (a riddle, a puzzle, a unique encounter) lets you leave with
 * the floor exactly as it is; suspend keeps the very place in a per-slot recovery record (src/engine/80_save.js),
 * removed with the slot, never a seventh save. The variations (which room holds which trial) are fixed when a wing
 * is first entered. Nothing escalates after mistakes, help is never withheld, and no collectible waits behind a
 * perfect run. The record (s.hall) is made at the first visit, in journeys of the twelve-chapter edition only. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.hall = (function () {
  'use strict';
  const W = {};
  const ORDER = [];
  const X = () => RB.expedition;
  const xid = (w) => 'hall_' + w;
  const ROUTES = ['consolidate', 'grow'];
  const TACTICS = ['relaxed', 'normal', 'hard'];

  // ---- definitions --------------------------------------------------------------------------------------------------
  function wing(id, spec) {
    if (!/^w\d+$/.test(id)) throw new Error('hall wing id: w<n>');
    const d = Object.assign({ id, patterns: 1, trials: [], floors: [], grow: null }, spec);
    W[id] = d;
    if (ORDER.indexOf(id) < 0) ORDER.push(id);
    ORDER.sort((a, b) => +a.slice(1) - +b.slice(1));
    const stations = {};
    d.floors.forEach((f, i) => { for (const k in f.stations || {}) stations[k] = Object.assign({ floor: i }, f.stations[k]); });
    X().define(xid(id), {
      title: d.title, kind: 'hall',
      floors: d.floors.map((f) => ({ id: f.id, map: f.map, entry: f.entry, name: f.name })),
      preview: { language: d.theme, size: { en: d.trials.length + ' trials of the tale.' } },
      rules: { persistent: true, restart: 'floor', ambush: false },
      stations, procedures: [].concat(...d.floors.map((f) => f.procedures || [])),
      exit: d.hearth, resetFloor: (s, k) => resetFloor(s, id, k),
      // delvers (D8): rarer here, and their rest goes further (src/engine/98b_delvers.js)
      delvers: d.delvers || null, delverChance: 0.35,
    });
    return d;
  }
  const get = (w) => W[w] || null;
  const list = () => ORDER.map((w) => W[w]);
  const trialOf = (w, t) => (W[w] ? W[w].trials.find((x) => x.id === t) || null : null);
  function manifest() {
    const out = [];
    for (const w of ORDER) for (const t of W[w].trials) out.push({ id: w + '.' + t.id, wing: w, trial: t.id, floor: t.floor, kind: t.kind, reprieve: !!t.reprieve });
    return out;
  }
  const wingOfMap = (mapId) => ORDER.find((w) => W[w].floors.some((f) => f.map === mapId)) || null;

  // ---- the record ---------------------------------------------------------------------------------------------------
  const inEdition = (s) => !!(s && RB.edition && RB.edition.of(s) >= 2);
  function rec(s) {
    if (!s.hall || typeof s.hall !== 'object') s.hall = { v: 1, wings: {}, visit: null };
    if (!s.hall.wings || typeof s.hall.wings !== 'object') s.hall.wings = {};
    return s.hall;
  }
  function wrec(s, w) {
    const H = rec(s);
    const r = H.wings[w] || (H.wings[w] = { lit: false, pat: null, choice: null, trials: {}, floors: [], done: false, held: null, notes: [] });
    for (const k of ['trials']) if (!r[k] || typeof r[k] !== 'object') r[k] = {};
    if (!Array.isArray(r.floors)) r.floors = [];
    if (!Array.isArray(r.notes)) r.notes = [];
    return r;
  }
  const peek = (s, w) => (s && s.hall && s.hall.wings && s.hall.wings[w]) || null;
  const visitOf = (s) => (s && s.hall && s.hall.visit) || null;

  // ---- the three choices ----------------------------------------------------------------------------------------------
  function choice(s, w) {
    const r = peek(s, w);
    const c = (r && r.choice) || {};
    return { route: ROUTES.indexOf(c.route) >= 0 ? c.route : 'consolidate', tactics: TACTICS.indexOf(c.tactics) >= 0 ? c.tactics : (s && s.learn && s.learn.difficulty) || 'normal' };
  }
  function setChoice(s, w, c) {
    const r = wrec(s, w), cur = choice(s, w);
    r.choice = { route: ROUTES.indexOf(c && c.route) >= 0 ? c.route : cur.route, tactics: TACTICS.indexOf(c && c.tactics) >= 0 ? c.tactics : cur.tactics };
    return r.choice;
  }
  // the tactical setting in force: a wing's own while you are in it (never changing the campaign's)
  function tactics(s) {
    const v = visitOf(s);
    if (v && W[v.wing] && RB.world && RB.world.W && RB.world.W.map && wingOfMap(RB.world.W.map.id) === v.wing) return choice(s, v.wing).tactics;
    return (s && s.learn && s.learn.difficulty) || 'normal';
  }

  // ---- trials, floors, wings ----------------------------------------------------------------------------------------
  function trialDone(s, w, t) {
    const v = visitOf(s), r = peek(s, w);
    const here = !!(v && v.wing === w && v.done && v.done[t]);
    if (v && v.wing === w && v.practice) return here;
    return here || !!(r && r.trials[t]);
  }
  const floorTrials = (w, k) => (W[w] ? W[w].trials.filter((t) => t.floor === k) : []);
  const floorClear = (s, w, k) => floorTrials(w, k).every((t) => trialDone(s, w, t.id));
  const wingDone = (s, w) => !!(peek(s, w) && peek(s, w).done);
  const litCount = (s) => ORDER.filter((w) => wingDone(s, w)).length;
  const doneCount = (s, w) => (W[w] ? W[w].trials.filter((t) => peek(s, w) && peek(s, w).trials[t.id]).length : 0);

  // a trial done in this visit; the floor counts once every trial on it is done (then it stays done)
  function markTrial(s, w, t) {
    const v = visitOf(s), tr = trialOf(w, t);
    if (!v || v.wing !== w || !tr) return { ok: false };
    const first = !v.done[t];
    v.done[t] = true;
    if (tr.reprieve && first) v.reprieve = (v.reprieve || 0) + 1;
    const out = { ok: true, first, floorCleared: false, wingDone: false, reprieve: !!(tr.reprieve && first) };
    if (floorClear(s, w, tr.floor)) {
      const r = wrec(s, w);
      if (!v.practice) {
        for (const x of floorTrials(w, tr.floor)) if (!r.trials[x.id]) r.trials[x.id] = { t: Date.now(), route: choice(s, w).route, tactics: choice(s, w).tactics };
        r.floors[tr.floor] = true;
      }
      out.floorCleared = true;
      if (W[w].floors.every((f, i) => (v.practice ? floorClear(s, w, i) : r.floors[i]))) {
        out.wingDone = true;
        if (!r.done && !v.practice) { r.done = true; r.doneAt = Date.now(); r.notes.push(noteOf(s, w)); }
      }
    }
    return out;
  }
  // a floor starts again: its trials not yet counted, its mechanisms, its creatures, its stations, its machines
  function resetFloor(s, w, k) {
    const d = W[w], v = visitOf(s), f = d && d.floors[k];
    if (!f) return;
    const r = peek(s, w);
    if (v && v.wing === w) for (const t of floorTrials(w, k)) if (v.practice || !(r && r.trials[t.id])) delete v.done[t.id];
    const pre = 'xp_' + xid(w) + '_f' + k + '_';
    for (const key of Object.keys(s.flags)) if (key.indexOf(pre) === 0 || key.indexOf('foe:' + f.map + ':') === 0) delete s.flags[key];
    const pr = s.enc && s.enc.proc;
    if (pr) for (const id of f.procedures || []) delete pr[id];
    const e = X().of(s);
    if (e && e.id === xid(w)) for (const sid in f.stations || {}) { const st = f.stations[sid]; const u = st.uses != null ? st.uses : (X().KIND[st.kind] || {}).uses || 1; e.stations[sid] = u === Infinity ? -1 : u; }
  }

  // ---- in and out ---------------------------------------------------------------------------------------------------
  // the variation fixed when a wing is first entered (seeded by the journey, kept until the wing is done)
  function patternOf(s, w) {
    const r = wrec(s, w);
    if (r.pat == null) {
      const n = Math.max(1, W[w].patterns || 1);
      r.pat = RB.util.rng(RB.util.hashStr(String(s.id || 'journey') + ':' + w) >>> 0).int(n);
    }
    return r.pat;
  }
  // where a visit begins: the first floor not yet cleared (a finished wing is walked again from the start, as
  // practice that changes no record); with a held floor, exactly where it was left
  function enter(s, w, o) {
    const d = W[w];
    if (!d || !s) return null;
    o = o || {};
    const r = wrec(s, w);
    patternOf(s, w);
    r.lit = true;
    const held = o.held && r.held ? r.held : null;
    X().enter(s, xid(w));
    const practice = !!r.done && !held;
    let k = 0;
    if (!practice) { k = d.floors.findIndex((f, i) => !r.floors[i]); if (k < 0) k = 0; }
    s.hall.visit = { wing: w, floor: k, done: {}, reprieve: 0, practice, started: Date.now(), help: { answers: 0, conceptual: 0, constrain: 0, supplied: 0 } };
    if (held) {
      for (const key in held.flags) s.flags[key] = held.flags[key];
      if (held.proc) { const E = s.enc || (s.enc = {}); E.proc = E.proc || {}; for (const id in held.proc) E.proc[id] = RB.util.deepClone(held.proc[id]); }
      const e = X().of(s);
      if (e && held.stations) e.stations = RB.util.deepClone(held.stations);
      if (e && held.statuses) e.statuses = RB.util.deepClone(held.statuses);
      if (held.resolve && s.resolve) { s.resolve.pc = held.resolve.pc; s.resolve.comp = held.resolve.comp; }
      Object.assign(s.hall.visit, { floor: held.floor, done: RB.util.deepClone(held.done || {}), reprieve: held.reprieve || 0, practice: !!held.practice, help: held.help || s.hall.visit.help, started: held.started || Date.now() });
      r.held = null;
      return { map: held.map, x: held.x, y: held.y, dir: held.dir || 'down', held: true };
    }
    const f = d.floors[k];
    return { map: f.map, x: f.entry.x, y: f.entry.y, dir: f.entry.dir || 'down', held: false };
  }
  // leave the wing; with keep (an earned reprieve spent) the floor is held exactly as it is for the next visit
  function retreat(s, o) {
    const v = visitOf(s);
    if (!v) return null;
    const w = v.wing, d = W[w], r = wrec(s, w);
    o = o || {};
    if (o.keep && v.reprieve > 0) {
      const maps = d.floors.map((f) => f.map), pre = 'xp_' + xid(w) + '_';
      const flags = {};
      for (const key of Object.keys(s.flags)) if (key.indexOf(pre) === 0 || maps.some((m) => key.indexOf('foe:' + m + ':') === 0)) flags[key] = s.flags[key];
      const proc = {};
      const pr = s.enc && s.enc.proc;
      if (pr) for (const f of d.floors) for (const id of f.procedures || []) if (pr[id]) proc[id] = RB.util.deepClone(pr[id]);
      const e = X().of(s), P = RB.world && RB.world.W && RB.world.W.player;
      r.held = {
        floor: v.floor, map: RB.world.W.map.id, x: P ? P.x : 0, y: P ? P.y : 0, dir: P ? P.dir : 'down', flags, proc,
        stations: e ? RB.util.deepClone(e.stations) : null, statuses: e ? RB.util.deepClone(e.statuses) : null,
        resolve: s.resolve ? { pc: s.resolve.pc, comp: s.resolve.comp } : null,
        done: RB.util.deepClone(v.done), reprieve: v.reprieve - 1, practice: v.practice, help: RB.util.deepClone(v.help), started: v.started,
      };
    }
    s.hall.visit = null;
    X().leave(s);
    return d.hearth;
  }
  // walking: the floor follows the map; walking off a wing's maps ends the visit (nothing held)
  function arrived(s, mapId) {
    const v = visitOf(s);
    if (!v) return;
    const w = wingOfMap(mapId);
    if (w !== v.wing) { s.hall.visit = null; return; }
    const k = W[w].floors.findIndex((f) => f.map === mapId);
    if (k >= 0) v.floor = k;
  }

  // ---- the record of a wing (D9 Rewards: optional, truthful, never a gate) -----------------------------------------
  function noteOf(s, w) {
    const v = visitOf(s), c = choice(s, w);
    const h = (v && v.help) || { answers: 0, conceptual: 0, constrain: 0, supplied: 0 };
    return { at: Date.now(), route: c.route, tactics: c.tactics, profile: s.learn && s.learn.profile, answers: h.answers, help: { conceptual: h.conceptual, constrain: h.constrain, supplied: h.supplied } };
  }
  const note = (s, w) => { const r = peek(s, w); return r && r.notes && r.notes.length ? r.notes[r.notes.length - 1] : null; };
  // every committed answer during a visit is counted with its help category (L2): the note's only source
  function counted(id, result) {
    const s = RB.game && RB.game.s, v = visitOf(s);
    if (!v || !result) return;
    v.help.answers++;
    if (result.help && v.help[result.help] != null) v.help[result.help]++;
  }
  function watchAnswers() {
    if (!RB.learn || !RB.learn.record || RB.learn.record.__hall) return;
    const inner = RB.learn.record;
    const wrapped = function (id, result) { const out = inner.apply(this, arguments); try { counted(id, result); } catch (e) { /* never breaks an answer */ } return out; };
    for (const k of Object.keys(inner)) wrapped[k] = inner[k];
    wrapped.__evidence = inner.__evidence; wrapped.__metered = inner.__metered; wrapped.__hall = true;
    RB.learn.record = wrapped;
  }

  // ---- conditions: hall.<…> ------------------------------------------------------------------------------------------
  //   hall.ledger · hall.lit (wings relit, with a comparison) · hall.visit · hall.w1 (done) · hall.w1.lit · hall.w1.t3
  //   · hall.w1.f0.clear · hall.w1.pat=1 · hall.w1.route=grow · hall.w1.held · hall.w1.count (trials counted)
  if (RB.state && RB.state.addTerm) RB.state.addTerm('hall', (s, rest, op, val, num, cmp) => {
    const p = rest.split('.');
    if (p[0] === 'ledger') return !!(s.flags && s.flags.hall_ledger);
    if (p[0] === 'lit') return op ? cmp(litCount(s), op, num(val)) : litCount(s) > 0;
    if (p[0] === 'visit') return !!visitOf(s);
    const w = p[0];
    if (!W[w]) return false;
    if (p.length === 1) return op ? cmp(wingDone(s, w) ? 1 : 0, op, num(val)) : wingDone(s, w);
    const r = peek(s, w);
    switch (p[1]) {
      case 'lit': return !!(r && r.lit);
      case 'held': return !!(r && r.held);
      case 'pat': return cmp(r && r.pat != null ? r.pat : 0, op || '=', num(val));
      case 'route': return cmp(choice(s, w).route, op || '=', val);
      case 'count': return op ? cmp(doneCount(s, w), op, num(val)) : doneCount(s, w) > 0;
      case 'practice': { const v = visitOf(s); return !!(v && v.wing === w && v.practice); }
      default:
        if (/^t\d+$/.test(p[1])) return trialDone(s, w, p[1]);
        if (/^f\d+$/.test(p[1]) && p[2] === 'clear') return floorClear(s, w, +p[1].slice(1));
        if (/^f\d+$/.test(p[1]) && p[2] === 'done') return !!(r && r.floors[+p[1].slice(1)]);
        return false;
    }
  });

  if (RB.bus) RB.bus.on('map:enter', (e) => { const s = RB.game && RB.game.s; if (s && e && e.id) { watchAnswers(); arrived(s, e.id); } });
  return {
    wing, get, list, manifest, trialOf, wingOfMap, rec, wrec, peek, visitOf, inEdition, choice, setChoice, tactics,
    trialDone, floorClear, floorTrials, wingDone, litCount, doneCount, markTrial, resetFloor, patternOf, enter, retreat,
    arrived, note, noteOf, watchAnswers, xid, ROUTES, TACTICS,
  };
})();
