/* Festival games (expansion P06 for P09; plan C10, Robin's C-17 and C-55): the shell every booth game uses.
 *   - Practice, the default: untimed, no score kept, no rewards; help changes nothing.
 *   - Timed, opt-in and chosen each time: the same game against a clock that stops while help is open; it keeps the
 *     player's own personal bests (and streaks where natural), shown only in the game itself, never ranked.
 *   - Just for fun: no stamp, keepsake or other reward from any score or mode.
 * A game: RB.festival.define(id, { title: { en, jp }, about: { en, jp }, seconds (the timed round), better: 'more',
 *   streaks: true|false, ui: the screen module's name in RB.ui.festivalGames }). Records live in
 *   s.practice.festival.games[id] = { timed, best, bestStreak, last } (made at the first timed round; New Game+ carries
 *   them, F-03). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.festival = (function () {
  'use strict';
  const DEFS = {};
  const ORDER = [];
  function define(id, d) { if (!DEFS[id]) ORDER.push(id); DEFS[id] = Object.assign({ id, seconds: 60, better: 'more', streaks: true }, d); return DEFS[id]; }
  const get = (id) => DEFS[id] || null;
  const list = () => ORDER.map((id) => DEFS[id]);
  // read only (a page or the game's own corner): never makes a record
  function peek(s, id) {
    const f = s && s.practice && s.practice.festival;
    const g = f && f.games && f.games[id];
    return g ? JSON.parse(JSON.stringify(g)) : { timed: 0, best: null, bestStreak: 0, last: null };
  }
  // a timed round finished: { score, streak } → what changed (new best, new streak); practice rounds keep nothing
  function timedResult(s, id, r) {
    const d = DEFS[id];
    if (!d || !s || !RB.practice) return null;
    const p = RB.practice.of(s);
    if (!p.festival || typeof p.festival !== 'object') p.festival = { v: 1, games: {} };
    const g = p.festival.games[id] || (p.festival.games[id] = { timed: 0, best: null, bestStreak: 0, last: null });
    const better = (a, b) => (b == null ? true : d.better === 'less' ? a < b : a > b);
    const out = { newBest: false, newStreak: false };
    g.timed++;
    if (better(r.score, g.best)) { g.best = r.score; out.newBest = true; }
    if (d.streaks && (r.streak || 0) > (g.bestStreak || 0)) { g.bestStreak = r.streak; out.newStreak = true; }
    g.last = { score: r.score, streak: r.streak || 0, t: Date.now() };
    return out;
  }
  if (RB.ngplus && RB.ngplus.PASTIMES && RB.ngplus.PASTIMES.indexOf('festival') < 0) RB.ngplus.PASTIMES.push('festival');
  return { define, get, list, peek, timedResult };
})();
