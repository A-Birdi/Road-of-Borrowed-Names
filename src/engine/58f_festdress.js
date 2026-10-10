/* Festival dress (expansion P09; plan 08_CULTURE.md C10a; Robin's C-46: yukata are for the festival only). On the
 * night of the Opening of the River, on Manybridge's festival maps, the traveller and the companion wear yukata: the
 * robe cut, a summer cotton print in each one's own colours, the trim as the obi. The road sprite and the dialogue
 * portrait only: no battle figure or Harmony bust (the festival has no fight), and nothing is kept: the next morning,
 * or anywhere else, everyone is dressed as before. Interim art under AC-1 (C-82); the finished cut is P16's. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.festDress = (function () {
  'use strict';
  // [cloth, shade, obi]: a light print and a darker sash for each person
  const YUKATA = {
    pc: ['#e8e2d0', '#c4bca6', '#3a4e8a'],
    nao: ['#3e5a7a', '#2e465e', '#d8a838'],
    mio: ['#f0dce4', '#d4bcc6', '#7a3a5a'],
    ren: ['#e4ead8', '#c4ccb6', '#4a6a5a'],
    suzu: ['#f2e2b8', '#d6c494', '#a8462e'],
  };
  // drop what does not go with a yukata (a satchel, a coat's things); keep the face's own (glasses, flowers, ribbons)
  const DROP = new Set(['bag', 'strap', 'satchel', 'book', 'pencil', 'scarf', 'cape', 'hood', 'hat', 'cap']);
  function on(s) {
    const W = RB.world && RB.world.W;
    return !!(s && s.flags && s.flags.mp_yukata && s.flags.mp_fest_night && !s.flags.mb2_done && W && W.map && /^mp\./.test(W.map.id));
  }
  function look(base, who) {
    const col = YUKATA[who] || YUKATA.pc;
    return Object.assign({}, base, { shape: 'robe', cloth: col.slice(), yukata: true, acc: (base.acc || []).filter((a) => !DROP.has(a)) });
  }
  function portrait(p, who) {
    const col = YUKATA[who] || YUKATA.pc;
    return Object.assign({}, p, { cloth: col.slice(), collar: 'robe', acc: (p.acc || []).filter((a) => !DROP.has(a)) });
  }
  return { on, look, portrait, YUKATA };
})();
