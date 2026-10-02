/* Companion shiritori: the computer opponents (Practice addendum §12).
 *
 * PROVISIONAL (foundation): every level plays the Casual policy until the
 * searching opponents land. The contract below is what the table UI calls;
 * the real implementation keeps these names and result fields.
 *
 *   RB.shiritori.chooseMove(state, bank, level, rng, o) -> Promise<{
 *       edge|null (null = concede: only ん words or nothing left), level,
 *       depth, exact, nodes, fallback, provisional }>
 *     level: 'partner' | 'casual' | 'thoughtful' | 'sharp'; the choice depends only
 *     on the public state, the bank, the level and the seeded rng — never on the
 *     player's draft, learning record, pet, sound or animation settings.
 *   RB.shiritori.analyse(state, bank) -> Promise<{ notes: [...] }>   post-match review
 *     (only claims a forced finish when an exhaustive search proved it). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (SH) {
  'use strict';
  // the learning partner prefers a word that leaves you a reply (§9.2 cooperative)
  function partner(state, bank, rng) {
    const safe = SH.safeReplies(state, bank);
    if (!safe.length) return null;
    const ok = safe.filter((e) => {
      const used = Object.assign({}, state.used); used[e.group] = true;
      return (bank.byHead[e.tail] || []).some((x) => !used[x.group] && !x.terminal);
    });
    const pool = ok.length ? ok : safe;
    return pool[Math.floor(rng() * pool.length)];
  }
  SH.chooseMove = async function (state, bank, level, rng) {
    const edge = level === 'partner' ? partner(state, bank, rng) : SH.casualMove(state, bank, rng);
    return { edge, level, depth: 0, exact: false, nodes: 0, fallback: false, provisional: level === 'thoughtful' || level === 'sharp' };
  };
  SH.analyse = async function (state, bank) { return { notes: [], provisional: true }; };
})(RB.shiritori);
