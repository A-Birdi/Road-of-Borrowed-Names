/* Karuta (expansion P06, C12; the deck in src/content/pastimes/40_karuta.js): the reader reads a proverb, the players
 * look for its picture card on the mat. Turn-based by default, as the spec asks (no speed is ever required): the
 * player answers in their own time; a wrong card (お手つき) lets the partner take the right one. An opt-in speed mode
 * lets the partner reach for it after a while (the screen's timer; the rules only record who took it).
 *   newGame(seed, kanas) → g    current(g) → kana being read    pick(g, kana) → g (took / otetsuki)
 *   partnerTakes(g) → g          over(g)                         Deterministic for a seed. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.karuta = (function () {
  'use strict';
  function rng(seed) { let x = (seed >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // the mat: the chosen cards in a shuffled layout, and a separate shuffled reading order
  function newGame(seed, kanas) {
    const r = rng(seed);
    const mat = shuffle(kanas.slice(), r);
    const order = shuffle(kanas.slice(), r);
    return { seed, mat, order, i: 0, taken: [[], []], otetsuki: 0, last: null };
  }
  const clone = (g) => JSON.parse(JSON.stringify(g));
  const current = (g) => (g.i < g.order.length ? g.order[g.i] : null);
  const over = (g) => g.i >= g.order.length;
  const onMat = (g) => g.mat.filter((k) => g.taken[0].indexOf(k) < 0 && g.taken[1].indexOf(k) < 0);
  // the player touches a card: the right one is theirs; a wrong one is お手つき, and the partner takes the right one
  function pick(g, kana) {
    const n = clone(g), cur = current(n);
    if (!cur || onMat(n).indexOf(kana) < 0) return n;
    if (kana === cur) { n.taken[0].push(cur); n.last = { who: 0, kana: cur, ok: true }; }
    else { n.otetsuki++; n.taken[1].push(cur); n.last = { who: 1, kana: cur, ok: false, touched: kana }; }
    n.i++;
    return n;
  }
  // speed mode only: the partner was quicker
  function partnerTakes(g) {
    const n = clone(g), cur = current(n);
    if (!cur) return n;
    n.taken[1].push(cur); n.last = { who: 1, kana: cur, ok: true, quicker: true };
    n.i++;
    return n;
  }
  return { newGame, current, over, onMat, pick, partnerTakes, clone };
})();
