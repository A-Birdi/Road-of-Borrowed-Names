/* Delvers in the Hall of a Hundred Tales (expansion P15; plan D8, D9 "rarer and stronger here"): each wing with a
 * resting place names where a delver may be waiting (the wing's `delvers`, src/engine/98h_hall.js); a visit rolls once
 * (src/engine/98b_delvers.js). Placed here, after every chapter has defined its delvers, so the whole journey's people
 * can be met. Meeting nobody changes nothing a wing needs. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  if (!RB.hall || !RB.delvers) return;
  for (const w of RB.hall.list()) {
    const xp = RB.expedition.get(RB.hall.xid(w.id));
    if (!xp || !xp.delvers) continue;
    for (const fl in xp.delvers) {
      const at = xp.delvers[fl], m = C.maps[at.map];
      if (!m) continue;
      for (const d of RB.delvers.list()) m.npcs = (m.npcs || []).concat([{ id: d.char, char: d.char, x: at.x, y: at.y, dir: at.dir, arrive: 'here', leave: 'here', if: 'xp_' + xp.id + '_dv_' + d.id + '_' + fl + '&!xp_' + xp.id + '_dv_met', talk: [{ scene: 'dv.' + d.id }] }]);
    }
  }
})(RB.content);
