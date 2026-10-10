/* Expeditions (expansion P07; plan 04_DUNGEONS.md D1–D4, D10; playbook P07). One engine for every dungeon with
 * expedition rules: authored side dungeons now, the Hall of a Hundred Tales later. Story dungeons keep their
 * checkpoints unless a chapter opts in; the Unwritten Atlas keeps its own run (it uses the battle hooks below).
 *
 *   define(id, spec)          spec: { title, kind: 'side' | 'story' | 'hall', floors: [{ id, map, entry: { x, y, dir } }],
 *                               preview: { language, size, suggested } ({ en, jp } each), rules: { persistent,
 *                               restart: 'entrance' | 'checkpoint' | 'floor' }, stations: { <id>: { kind, map, x, y,
 *                               uses, requires } }, shortcuts: { <id>: { map } }, mechanisms: [puzzle ids],
 *                               procedures: [procedure ids whose machine a restart resets], maps: [ids],
 *                               exit: { map, x, y, dir } (where leaving puts you) }
 *   enter(s, id) / leave(s) / restart(s) / active(s) / floorOf(s)
 *   useStation(s, id) → { ok, kind, gave, left, why }      stationLeft(s, id)
 *   openShortcut(s, expId, id) / shortcutOpen(s, expId, id)   (kept across restarts, like the map)
 *   battleStart(st, s) / battleEnd(st, s, outcome) → true when the expedition took care of resolve
 *   onDefeat(s) → where to wake ({ map, x, y, dir }) or null for the game's checkpoint
 *
 * Persistent condition (D2): in an expedition that declares it, resolve carries from encounter to encounter, but only
 * what tactics cost: what language mistakes cost is given back at the end of each encounter. The accounting (track,
 * below) keeps two pools per party member, mistakes and everything else; a heal repairs the everything-else pool
 * first, so a mistake can never turn into carried damage, and the refund is never more than is missing.
 *
 * What a restart resets (D3a): creatures, station uses, mechanisms, the party's condition, the expedition's own
 * flags (xp_<id>_…), the machines of its procedures part-way through. What it keeps: the learning record, Known
 * details, map knowledge (the floors seen, xpk_<id>_seen_<floor>), shortcuts opened (xpk_<id>_…) and the encounters'
 * solved steps (so "Resolve this step" still recognises them, E11).
 *
 * Coherence (D3): walking onto one of an expedition's maps without being on it begins a fresh visit; walking onto any
 * other map while on one leaves it. A save resumed after an interrupted entry or exit is therefore never half in. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.expedition = (function () {
  'use strict';
  const DEFS = {};
  const KIND = { bench: { gives: 4, uses: 2 }, spring: { gives: 'full', uses: 1, clears: true }, shelter: { gives: 0, uses: Infinity, clears: true }, lamp: { gives: 4, uses: 1 } };
  function define(id, spec) {
    if (!/^\w+$/.test(id)) throw new Error('expedition id: letters, digits and _ only');
    DEFS[id] = Object.assign({ id, kind: 'side', floors: [], stations: {}, shortcuts: {}, mechanisms: [], procedures: [], maps: [], exit: null, rules: { persistent: false, restart: 'entrance', ambush: false } }, spec);
    DEFS[id].maps = DEFS[id].maps.length ? DEFS[id].maps : DEFS[id].floors.map((f) => f.map);
    return DEFS[id];
  }
  const get = (id) => DEFS[id] || null;
  const list = () => Object.keys(DEFS).map((k) => DEFS[k]);
  const of = (s) => (s && s.expedition && DEFS[s.expedition.id] ? s.expedition : null);
  const active = (s) => !!of(s);

  // ---- a fresh instance ---------------------------------------------------------------------------------------------
  // (uses are saved as numbers: unlimited is -1, since a saved Infinity would come back as null)
  function fresh(s, d) {
    const stations = {};
    for (const k in d.stations) { const u = usesOf(d.stations[k]); stations[k] = u === Infinity ? -1 : u; }
    return { id: d.id, v: 1, floor: 0, started: Date.now(), restarts: 0, stations, statuses: { pc: [], comp: [] } };
  }
  const usesOf = (st) => (st.uses != null ? st.uses : KIND[st.kind] ? KIND[st.kind].uses : 1);
  function enter(s, id) {
    const d = DEFS[id];
    if (!d || !s) return null;
    if (of(s) && s.expedition.id !== id) leave(s);
    if (!of(s)) {
      clearInstance(s, d);
      s.expedition = fresh(s, d);
      full(s);
    }
    return s.expedition;
  }
  // the party at full resolve, no statuses
  function full(s) { if (s.resolve) { s.resolve.pc = s.resolve.max; s.resolve.comp = s.resolve.max; } if (s.expedition) s.expedition.statuses = { pc: [], comp: [] }; }
  // what belongs to one visit: creatures beaten, mechanisms' states, the expedition's own flags
  function clearInstance(s, d) {
    const pre = 'xp_' + d.id + '_';
    for (const k of Object.keys(s.flags)) {
      if (k.indexOf(pre) === 0) delete s.flags[k];
      for (const m of d.maps) if (k.indexOf('foe:' + m + ':') === 0) delete s.flags[k];
    }
    const pz = s.discovery && s.discovery.puzzles;
    if (pz) for (const id of d.mechanisms) delete pz[id];
    // a machine left part-way through starts from its beginning; the steps solved before stay recognised
    const pr = s.enc && s.enc.proc;
    if (pr) for (const id of d.procedures) delete pr[id];
  }
  function leave(s) {
    const e = of(s);
    if (!e) return false;
    const d = DEFS[e.id];
    clearInstance(s, d);
    delete s.expedition;
    full(s);
    return true;
  }
  // defeat or a deliberate restart: everything of the visit resets coherently, the learning and the map stay
  function restart(s) {
    const e = of(s);
    if (!e) return null;
    const d = DEFS[e.id], n = e.restarts + 1;
    clearInstance(s, d);
    s.expedition = fresh(s, d);
    s.expedition.restarts = n;
    full(s);
    return s.expedition;
  }
  const floorOf = (s) => { const e = of(s); return e ? DEFS[e.id].floors[e.floor] || null : null; };
  // walking onto a floor's map moves the expedition's floor (autosave happens on the transition, never in battle);
  // onto an expedition's map from outside it begins a fresh visit; onto any other map leaves it
  const owner = (mapId) => Object.keys(DEFS).find((k) => DEFS[k].maps.indexOf(mapId) >= 0) || null;
  function arrived(s, mapId) {
    if (!s || !s.flags) return;
    let e = of(s);
    if (e && DEFS[e.id].maps.indexOf(mapId) < 0) { leave(s); e = null; }
    if (!e) { const id = owner(mapId); if (!id) return; e = enter(s, id); }
    const d = DEFS[e.id];
    const i = d.floors.findIndex((f) => f.map === mapId);
    if (i >= 0) { e.floor = i; s.flags['xpk_' + d.id + '_seen_' + d.floors[i].id] = true; }
  }
  const floorSeen = (s, expId, floorId) => !!(s && s.flags && s.flags['xpk_' + expId + '_seen_' + floorId]);
  function onDefeat(s) {
    const e = of(s);
    if (!e) return null;
    const d = DEFS[e.id];
    const rule = d.rules.restart || 'entrance';
    if (rule === 'checkpoint') return null;
    const floor = rule === 'floor' ? d.floors[e.floor] : d.floors[0];
    if (rule === 'entrance') restart(s);
    else { full(s); }
    return floor ? { map: floor.map, x: floor.entry.x, y: floor.entry.y, dir: floor.entry.dir || 'down' } : null;
  }

  // ---- stations: places, never things carried -----------------------------------------------------------------------
  function stationLeft(s, id) { const e = of(s); if (!e || e.stations[id] == null) return 0; return e.stations[id] < 0 ? Infinity : e.stations[id]; }
  function useStation(s, id) {
    const e = of(s);
    if (!e) return { ok: false, why: 'Not on an expedition.' };
    const st = DEFS[e.id].stations[id];
    if (!st) return { ok: false, why: 'No such place.' };
    if (st.requires && !RB.state.test(s, st.requires)) return { ok: false, why: 'Not yet.' };
    const unlimited = e.stations[id] === -1;
    if (!unlimited && !(e.stations[id] > 0)) return { ok: false, why: 'Used up for this expedition.', kind: st.kind, left: 0 };
    const k = KIND[st.kind] || KIND.bench;
    // nothing to mend: the place keeps its use (a rest is never wasted by a press at full strength)
    const missing = s.resolve.pc < s.resolve.max || (s.comp && s.resolve.comp < s.resolve.max);
    const statuses = e.statuses && (e.statuses.pc.length || e.statuses.comp.length);
    if (!missing && !(k.clears && statuses)) return { ok: false, rested: true, why: 'You are rested already: this place will keep.', kind: st.kind, left: stationLeft(s, id) };
    const before = { pc: s.resolve.pc, comp: s.resolve.comp };
    if (k.gives === 'full') { s.resolve.pc = s.resolve.max; s.resolve.comp = s.resolve.max; }
    else if (k.gives) { s.resolve.pc = Math.min(s.resolve.max, s.resolve.pc + k.gives); s.resolve.comp = Math.min(s.resolve.max, s.resolve.comp + k.gives); }
    if (k.clears) e.statuses = { pc: [], comp: [] };
    if (!unlimited) e.stations[id]--;
    return { ok: true, kind: st.kind, gave: { pc: s.resolve.pc - before.pc, comp: s.resolve.comp - before.comp }, left: stationLeft(s, id) };
  }

  // ---- shortcuts: opened from the far side, kept like the map -------------------------------------------------------
  const scFlag = (expId, id) => 'xpk_' + expId + '_sc_' + id;
  function openShortcut(s, expId, id) { if (!DEFS[expId] || !DEFS[expId].shortcuts[id]) return false; s.flags[scFlag(expId, id)] = true; return true; }
  const shortcutOpen = (s, expId, id) => !!(s && s.flags && s.flags[scFlag(expId, id)]);

  // ---- the accounting (D2) ----------------------------------------------------------------------------------------
  // st.pc / st.comp become accessors that sort every change by its cause: a change made inside mistake(st, fn) is a
  // language mistake; every other loss is "the rest" (blows, a procedure's misstep, a status); a gain heals the rest
  // first, then mistakes. start: what was already missing counts as the rest.
  function track(st) {
    if (!st || st.acct) return st;
    const pools = { pc: { rest: Math.max(0, st.max - st.pc), mist: 0 }, comp: { rest: st.compId ? Math.max(0, st.max - st.comp) : 0, mist: 0 } };
    const acct = { pools, cause: null };
    for (const who of ['pc', 'comp']) {
      let v = st[who];
      Object.defineProperty(st, who, {
        configurable: true, enumerable: true,
        get: () => v,
        set: (n) => {
          const d = n - v;
          v = n;
          const p = pools[who];
          if (d < 0) { if (acct.cause === 'mistake') p.mist += -d; else p.rest += -d; }
          else if (d > 0) { let h = d; const r = Math.min(p.rest, h); p.rest -= r; h -= r; p.mist = Math.max(0, p.mist - h); }
        },
      });
    }
    Object.defineProperty(st, 'acct', { value: acct, enumerable: false, configurable: true });
    return st;
  }
  function mistake(st, fn) {
    if (!st || !st.acct) return fn();
    const was = st.acct.cause;
    st.acct.cause = 'mistake';
    try { return fn(); } finally { st.acct.cause = was; }
  }
  // the encounter is over: what mistakes cost comes back (never more than is missing)
  function settle(st) {
    if (!st || !st.acct) return { pc: st ? st.pc : 0, comp: st ? st.comp : 0, refund: { pc: 0, comp: 0 } };
    const P = st.acct.pools;
    const refund = { pc: Math.min(P.pc.mist, st.max - st.pc), comp: st.compId ? Math.min(P.comp.mist, st.max - st.comp) : 0 };
    return { pc: st.pc + refund.pc, comp: st.compId ? st.comp + refund.comp : 0, refund };
  }

  // ---- the battle hooks ---------------------------------------------------------------------------------------------
  const persistent = (s) => { const e = of(s); return !!(e && DEFS[e.id].rules.persistent); };
  function battleStart(st, s) {
    if (!persistent(s)) return;
    track(st);
  }
  // returns true when the expedition took care of resolve (the game otherwise restores it after every encounter)
  function battleEnd(st, s, outcome) {
    if (!persistent(s) || !st) return false;
    if (outcome === 'lose') return false; // defeat applies the expedition's rule (onDefeat)
    const r = settle(st);
    // back from the battle's scale (the difficulty setting) to the campaign's
    const dr = st.max - s.resolve.max;
    s.resolve.pc = Math.max(1, Math.min(s.resolve.max, r.pc - dr));
    s.resolve.comp = s.comp ? Math.max(1, Math.min(s.resolve.max, r.comp - dr)) : s.resolve.max;
    return true;
  }

  // ---- the preview card (D4): what is practised, never the solutions ---------------------------------------------------
  function preview(id) {
    const d = DEFS[id];
    if (!d) return null;
    const rules = [];
    rules.push(d.rules.persistent ? { en: 'Resolve carries from encounter to encounter (what mistakes cost always comes back).', jp: '' } : { en: 'Resolve recovers after every encounter.', jp: '' });
    const n = {};
    for (const k in d.stations) n[d.stations[k].kind] = (n[d.stations[k].kind] || 0) + (d.stations[k].requires ? 0 : 1);
    const names = { bench: ['rest bench', 'rest benches'], spring: ['spring', 'springs'], shelter: ['shelter', 'shelters'], lamp: ['lamp', 'lamps'] };
    const st = Object.keys(n).filter((k) => n[k]).map((k) => n[k] + ' ' + names[k][n[k] > 1 ? 1 : 0]);
    if (st.length) rules.push({ en: 'Places to rest: ' + st.join(', ') + '.' });
    if (Object.keys(d.stations).some((k) => d.stations[k].requires)) rules.push({ en: 'Something along the way can be mended into one more.' });
    rules.push({ en: d.rules.restart === 'entrance' ? 'Defeat starts the expedition again from its entrance; what you learned stays with you.' : d.rules.restart === 'floor' ? 'Defeat starts the floor again.' : 'Defeat wakes you at the last safe place.' });
    rules.push({ en: d.rules.ambush ? 'Some creatures wait out of sight: an ambush is announced before it begins.' : 'Every creature is in plain sight: nothing ambushes you.' });
    if (Object.keys(d.shortcuts).length) rules.push({ en: 'Shortcuts opened from the far side stay open.' });
    rules.push({ en: d.exit ? 'You can climb out at the entrance whenever you like; the next visit starts fresh.' : 'You can leave whenever you like; the next visit starts fresh.' });
    return { title: d.title, kind: d.kind, language: d.preview.language, size: d.preview.size, suggested: d.preview.suggested || null, rules };
  }

  if (RB.bus) RB.bus.on('map:enter', (e) => { const s = RB.game && RB.game.s; if (s && e && e.id) arrived(s, e.id); });
  return { define, get, list, of, active, enter, leave, restart, arrived, owner, floorSeen, onDefeat, floorOf, stationLeft, useStation, openShortcut, shortcutOpen, track, mistake, settle, battleStart, battleEnd, preview, persistent, KIND };
})();
