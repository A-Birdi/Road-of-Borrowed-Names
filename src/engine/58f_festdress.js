/* Festival dress (expansion P09; plan 08_CULTURE.md C10a; Robin's C-46: yukata are for the festival only). On the
 * night of the Opening of the River, on Manybridge's festival maps, the traveller and the companion wear yukata: the
 * robe cut, a summer cotton print in each one's own colours, the trim as the obi. The road sprite and the dialogue
 * portrait only: no battle figure or Harmony bust (the festival has no fight), and nothing is kept: the next morning,
 * or anywhere else, everyone is dressed as before. The cut (P16d, implemented provisionally under AC-1): on the road
 * sprite a print of small morning-glory florets in the obi's colour, a wide obi, and at the back its bow
 * (src/engine/32_spriteart.js, garmentFB).
 * Steamhollow's evening (P13; plan 06_WORLD.md W4, "Steamhollow's evening yukata walk"): from the mediation's end until
 * the vow (yn_mediated, until yn_done: yn.walk and yn.end, one scene with no fight), on the town's two streets, the
 * whole valley is out in yukata and so are the two of you, in the inns' lent indigo (yn_yukata), each with an obi of
 * their own. The same limits: road sprite and portrait only, nothing kept. */
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
  // Steamhollow: the inns' indigo, and an obi light enough to read on it
  const INN = ['#2e3a5e', '#222c48'], INN_OBI = { pc: '#d8c8a0', nao: '#d8a838', mio: '#c87a9a', ren: '#8ab89a', suzu: '#d8743e' };
  // drop what does not go with a yukata (a satchel, a coat's things); keep the face's own (glasses, flowers, ribbons)
  const DROP = new Set(['bag', 'strap', 'satchel', 'book', 'pencil', 'scarf', 'cape', 'hood', 'hat', 'cap']);
  // which evening it is here, if any: 'mp' (Manybridge's festival night) or 'yn' (Steamhollow's evening)
  function kind(s) {
    const W = RB.world && RB.world.W, m = W && W.map && W.map.id;
    if (!s || !s.flags || !m) return null;
    if (s.flags.mp_yukata && s.flags.mp_fest_night && !s.flags.mb2_done && /^mp\./.test(m)) return 'mp';
    if (s.flags.yn_mediated && !s.flags.yn_done && /^yn\.(upper|lower)$/.test(m)) return 'yn';
    return null;
  }
  function on(s) { return !!kind(s); }
  // k: the evening ('yn' for Steamhollow's; anything else, Manybridge's), by default the one here now
  function colours(who, k) {
    if (k === undefined) k = kind(RB.game && RB.game.s);
    const own = YUKATA[who] || YUKATA.pc;
    return k === 'yn' ? [INN[0], INN[1], INN_OBI[who] || INN_OBI.pc] : own.slice();
  }
  function look(base, who, k) {
    return Object.assign({}, base, { shape: 'robe', cloth: colours(who, k), yukata: true, acc: (base.acc || []).filter((a) => !DROP.has(a)) });
  }
  function portrait(p, who, k) {
    return Object.assign({}, p, { cloth: colours(who, k), collar: 'robe', acc: (p.acc || []).filter((a) => !DROP.has(a)) });
  }
  return { on, kind, look, portrait, YUKATA };
})();
