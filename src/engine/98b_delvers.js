/* Delvers (expansion P07; plan 04_DUNGEONS.md D8; Robin's R1; F-31): people from the journey met by chance in the
 * depths. In journeys of the twelve-chapter edition, a person the player has already met (their scene seen) may be
 * waiting in a side chamber: a seeded chance once per visit of an expedition, once per run of the Atlas (at its
 * camp). Meeting them always helps (their aid: a rest, a way opened, or what lies ahead shown). A short memory
 * question from a moment you shared adds a little more; a wrong answer takes nothing away. Nothing depends on
 * meeting anyone (the curve and the route tests run with nobody there).
 *
 *   define(id, { char, source (the scene that must have been seen), aid: 'rest' | 'guide' | 'shortcut' })
 *   eligible(s) → ids;  pick(s, seed, chance) → id | null (seeded; never one the journey has not met)
 *   aid(s, id, where) → what it gave;  bonus(s, id) → what the remembered moment added
 *   met(s, id, remembered)   the record (s.delvers = { met: { id: n }, remembered: { id: true } }, made at the first
 *                            meeting; the six-chapter edition never makes it)
 * An expedition names where a delver may stand (spec.delvers: { <floor>: { map, x, y, dir } }); a visit rolls once
 * (RB.expedition.onVisit) and sets its own flag xp_<exp>_dv_<id>_<floor>, which a restart clears like any other. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.delvers = (function () {
  'use strict';
  const DEFS = {};
  const ORDER = [];
  function define(id, d) { if (!DEFS[id]) ORDER.push(id); DEFS[id] = Object.assign({ id, aid: 'rest' }, d); return DEFS[id]; }
  const get = (id) => DEFS[id] || null;
  const list = () => ORDER.map((id) => DEFS[id]);
  const inEdition = (s) => !!(s && RB.edition && RB.edition.of(s) >= 2);
  // the people this journey has met (their scene seen), in a fixed order
  const eligible = (s) => (inEdition(s) ? ORDER.filter((id) => s.seen && s.seen[DEFS[id].source]) : []);
  // a seeded choice: someone, with the given chance, among those met
  function pick(s, seed, chance) {
    const ids = eligible(s);
    if (!ids.length) return null;
    const r = RB.util.rng(seed >>> 0);
    if (r() >= (chance == null ? 0.5 : chance)) return null;
    return ids[r.int(ids.length)];
  }
  function rec(s) {
    if (!s.delvers || typeof s.delvers !== 'object') s.delvers = { v: 1, met: {}, remembered: {} };
    for (const k of ['met', 'remembered']) if (!s.delvers[k] || typeof s.delvers[k] !== 'object') s.delvers[k] = {};
    return s.delvers;
  }
  const peek = (s) => (s && s.delvers ? JSON.parse(JSON.stringify(s.delvers)) : { v: 1, met: {}, remembered: {} });
  function met(s, id, remembered) {
    const r = rec(s);
    r.met[id] = (r.met[id] || 0) + 1;
    if (remembered) r.remembered[id] = true;
  }
  const rest = (s, n) => {
    const before = { pc: s.resolve.pc, comp: s.resolve.comp };
    s.resolve.pc = Math.min(s.resolve.max, s.resolve.pc + n);
    s.resolve.comp = Math.min(s.resolve.max, s.resolve.comp + n);
    return Math.max(s.resolve.pc - before.pc, s.resolve.comp - before.comp);
  };
  // the delver's aid, always given. where: { kind: 'expedition', exp } or { kind: 'atlas', run }
  function aid(s, id, where) {
    const d = DEFS[id];
    if (!d) return null;
    const X = RB.expedition;
    if (d.aid === 'shortcut' && where && where.kind === 'expedition') {
      const e = X.get(where.exp);
      const shut = e && Object.keys(e.shortcuts).find((k) => !X.shortcutOpen(s, e.id, k));
      if (shut) { X.openShortcut(s, e.id, shut); return { kind: 'shortcut', id: shut }; }
    }
    if ((d.aid === 'guide' || d.aid === 'shortcut') && where && where.kind === 'expedition') {
      const e = X.get(where.exp);
      const unseen = e && e.floors.find((f) => !X.floorSeen(s, e.id, f.id));
      if (unseen) { s.flags['xpk_' + e.id + '_seen_' + unseen.id] = true; return { kind: 'guide', floor: unseen.id }; }
    }
    if ((d.aid === 'guide' || d.aid === 'shortcut') && where && where.kind === 'atlas' && where.run) {
      where.run.dvGuide = true; // the next fork's sign names both roads (src/atlas/50_run.js)
      return { kind: 'guide', atlas: true };
    }
    return { kind: 'rest', gave: rest(s, 4) };
  }
  // a remembered moment: a little more rest (never more than full)
  function bonus(s, id) { return DEFS[id] ? { kind: 'rest', gave: rest(s, 4) } : null; }
  return { define, get, list, eligible, pick, aid, bonus, met, peek, rec };
})();

// a visit of an expedition with delvers' places: roll once (src/engine/98_expedition.js)
if (RB.expedition && RB.expedition.onVisit) {
  RB.expedition.onVisit((s, d, e) => {
    if (!d.delvers || !e) return;
    const floors = Object.keys(d.delvers);
    if (!floors.length) return;
    const seed = RB.util.hashStr(String(s.id) + ':dv:' + d.id + ':' + e.started + ':' + e.restarts) >>> 0;
    const who = RB.delvers.pick(s, seed, d.delverChance);
    if (!who) return;
    const floor = floors[RB.util.rng(seed ^ 0x9e3779b9).int(floors.length)];
    e.delver = { id: who, floor };
    s.flags['xp_' + d.id + '_dv_' + who + '_' + floor] = true;
  });
}
