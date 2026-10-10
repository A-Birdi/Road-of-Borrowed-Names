/* Delvers' hooks (expansion P07; plan D8; src/engine/98b_delvers.js; the people and scenes in
 * src/content/expeditions/40_delvers.js). The aid comes first and always; a remembered moment adds to it; the
 * meeting is kept once (an expedition's visit, or an Atlas run) and in the journey's record.
 *   !hook dv_aid <id>      the delver's aid, said in a notice
 *   !hook dv_bonus <id>    a remembered moment: a little more rest
 *   !hook dv_met <id> 1|0  the meeting kept (remembered or not) */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const S = () => RB.game.s;
  // where the meeting happens: an expedition's visit, or an Atlas run
  function where(s) {
    const e = RB.expedition && RB.expedition.of(s);
    if (e) return { kind: 'expedition', exp: e.id };
    if (s.atlas && s.atlas.run) return { kind: 'atlas', run: s.atlas.run };
    return null;
  }
  const SAY = {
    rest: (r) => 'A rest with them: resolve +' + r.gave + '.',
    shortcut: () => 'They show you the catches of a grate: a shortcut is open, and stays open on every visit.',
    guide: (r) => (r.atlas ? 'They tell you what lies down both roads at the next fork.' : 'They tell you how the next floor lies: its plan is in your map now.'),
  };
  RB.hooks = RB.hooks || {};
  RB.hooks.dv_aid = async (a) => {
    const s = S(), id = a && a[0];
    const r = RB.delvers.aid(s, id, where(s));
    if (r) { RB.audio && RB.audio.sfx(r.kind === 'rest' ? 'heal' : 'reveal'); RB.ui.notice((SAY[r.kind] || SAY.rest)(r), 'info'); }
  };
  RB.hooks.dv_bonus = async (a) => {
    const s = S();
    const r = RB.delvers.bonus(s, a && a[0]);
    if (r) RB.ui.notice('Remembering it together: resolve +' + r.gave + '.', 'info');
  };
  RB.hooks.dv_met = async (a) => {
    const s = S(), id = a && a[0], w = where(s);
    RB.delvers.met(s, id, a && a[1] === '1');
    if (w && w.kind === 'expedition') s.flags['xp_' + w.exp + '_dv_met'] = true;
    if (w && w.kind === 'atlas') s.flags[RB.atlas.FLAG('dv_met')] = true;
    if (RB.world.W && RB.world.W.map) RB.world.refreshActors();
  };
})();
