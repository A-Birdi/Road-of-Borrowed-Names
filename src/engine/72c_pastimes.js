/* Pastimes (expansion P06, K7, C12): one registry for the games a traveller can play, read by the Ledger's
 * Distractions tab (src/ui/68b_distractions.js), and one record per game kept with the save's practice record
 * (RB.practice namespaces), which New Game+ carries (F-03; RB.ngplus.PASTIMES).
 *
 *   RB.pastimes.define(id, { title, kind: 'game' | 'festival', order (the index's order), activity (an RB.activity
 *     kind), companion (a game your companion can play anywhere safe), venue: { en, jp } (where it is played),
 *     met(s), records(s) → [{ en, value }], blurb: { jp, en }, howto: [{ jp, en }], art (the page's key art) })
 * Records are personal: never ranked, never a currency, and nothing in the story needs a win (G15). Points in a card
 * game are points, never stakes. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.pastimes = (function () {
  'use strict';
  const DEFS = {};
  const ORDER = [];
  function define(id, d) { if (!DEFS[id]) ORDER.push(id); DEFS[id] = Object.assign({ id, kind: 'game' }, d); return DEFS[id]; }
  const get = (id) => DEFS[id] || null;
  // every pastime this traveller has met (the index lists these; the rest stay unknown until met)
  const all = () => ORDER.map((id) => DEFS[id]).sort((a, b) => (a.order || 50) - (b.order || 50));
  const met = (s) => all().filter((d) => { try { return !d.met || d.met(s); } catch (e) { return false; } });
  // a pastime's own record in the save (created on first use)
  function rec(s, key) {
    const p = RB.practice && RB.practice.of(s);
    if (!p) return null;
    if (!p[key] || typeof p[key] !== 'object') p[key] = fresh(key);
    else { const f = fresh(key); for (const k in f) if (!(k in p[key])) p[key][k] = f[k]; }
    return p[key];
  }
  const FRESH = {
    shogi: () => ({ v: 1, lessons: {}, tsume: {}, games: {}, wins: {}, best: null, active: null }),
    hanafuda: () => ({ v: 1, lessons: {}, games: 0, wins: 0, best: 0, yaku: {}, active: null }),
    karuta: () => ({ v: 1, games: 0, best: 0, cards: {}, active: null }),
  };
  const fresh = (k) => (FRESH[k] ? FRESH[k]() : { v: 1 });
  // a record is made on first use only, so loading a save never changes it (older saves stay exactly as they were);
  // New Game+ carries those that exist
  if (RB.ngplus && RB.ngplus.PASTIMES) for (const k in FRESH) if (RB.ngplus.PASTIMES.indexOf(k) < 0) RB.ngplus.PASTIMES.push(k);
  // a game finished: its result in the record (wins by kind; a best that only ever rises)
  function result(s, key, kind, won, score) {
    const r = rec(s, key);
    if (!r) return null;
    if (key === 'shogi') {
      r.games[kind] = (r.games[kind] || 0) + 1;
      if (won) r.wins[kind] = (r.wins[kind] || 0) + 1;
    } else {
      r.games = (r.games || 0) + 1;
      if (won) r.wins = (r.wins || 0) + 1;
      if (score != null && score > (r.best || 0)) r.best = score;
    }
    r.active = null;
    return r;
  }
  return { define, get, met, all, rec, result, fresh };
})();
