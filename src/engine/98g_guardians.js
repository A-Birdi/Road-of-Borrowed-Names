/* The old guardians (expansion P15e; plan 03_ENCOUNTERS.md E16, sealed S7; content in src/content/guardians/): one
 * per region, awake only after the story. Winning earns an honest personal record, never an essential: how many
 * times you faced the guardian before it settled, and the tactical setting you faced it on. The record rides on the
 * guardian's stamp (K1) and is shown in the stamp book; nothing asks for a setting, a mode, going without help or a
 * time (C-13), and the record never changes what the stamp, its page or its keepsake are.
 *   faced: s.vars['gd_<key>_n'], counted by the guardian's scene each time the encounter begins (a step back counts:
 *   you did face it); the tactical setting is the one in force when it settled. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.guardians = (function () {
  'use strict';
  const KEYS = ['rw', 'sg', 'co', 'sb', 'lf', 'mb', 'cr', 'yn', 'ko'];
  const TACTICS = { relaxed: 'Relaxed', normal: 'Standard', hard: 'Demanding' };
  const TACTICS_JP = { relaxed: 'ゆったり', normal: 'ふつう', hard: 'きびしい' };
  const stampId = (key) => 'gd.' + key;
  // the record a win leaves: { tries, tactics }
  function won(s, key) {
    if (!s || KEYS.indexOf(key) < 0) return null;
    const id = stampId(key);
    if (RB.records && RB.records.has(s, 'stamps', id)) return s.records.stamps[id];
    const tries = Math.max(1, +((s.vars && s.vars['gd_' + key + '_n']) || 0) || 1);
    const tactics = (s.learn && s.learn.difficulty) || 'normal';
    s.flags[id] = true;
    if (!RB.stampBook || !RB.stampBook.earned(s, id) || !RB.records) return null;
    RB.records.award(s, 'stamps', id, { at: null, tries, tactics: TACTICS[tactics] ? tactics : 'normal' });
    return s.records.stamps[id];
  }
  // the words the stamp book shows under a pressed guardian's stamp
  function noteOf(rec) {
    if (!rec || !rec.tries) return '';
    const n = rec.tries;
    const how = n === 1 ? 'Settled the first time you faced it' : 'Settled on your ' + ordinal(n) + ' meeting';
    return how + ', on ' + (TACTICS[rec.tactics] || 'Standard') + '.';
  }
  function ordinal(n) {
    const w = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
    if (w[n]) return w[n];
    const t = n % 100, u = n % 10;
    return n + (t > 10 && t < 14 ? 'th' : u === 1 ? 'st' : u === 2 ? 'nd' : u === 3 ? 'rd' : 'th');
  }
  RB.hooks = RB.hooks || {};
  RB.hooks.guardian_won = (a) => { const s = RB.game && RB.game.s; if (s) won(s, a && a[0]); };
  return { KEYS, TACTICS, TACTICS_JP, stampId, won, noteOf };
})();
