/* The Hall of a Hundred Tales: the kit the wings are built with (expansion P15; plan 04_DUNGEONS.md D9). Wing 1 keeps
 * its own inline helpers (it came first); wings 2–10 use these, so that every wing's floors share the same furniture
 * (the return lantern, a bench, the sacred rope that closes the way on, the stairs) and every trial scene the same
 * shape (it sets its floor's flag xp_hall_<w>_f<k>_<t>, tells the Hall with hall_trial, and refreshes the map).
 *
 *   K.base(w)                       the map fields every floor of a wing shares (region and music hall_<w>, the
 *                                   expedition, the Keepers' Road on the chart, no travel, no story checkpoint)
 *   K.lit(x, y, cond, scene)        a lit stone lantern (light); K.andon(x, y, w, t): a trial's floor lantern, dark
 *                                   until the trial is done
 *   K.furniture(w, k, at)           the return lantern, the bench (scene hall.<w>.bench<k+1>), the rope (until the
 *                                   floor is cleared) and the stairs; at: { ret: [x, y], bench, gate, stairs }
 *   K.lv(w)                         the level a task in the wing is set at, as conditions: { F, E, I, A, EF, NOTF,
 *                                   both(a, b) } (the profile, or one up on the Grow route; Advanced stays Advanced)
 *   K.mark(w, k, t)                 the lines that count a trial (its flag, hall_trial, refresh)
 *   K.taskTrial(o)                  the body of a trial that is a language task: o = { w, k, t, done (line),
 *                                   intro (lines), task (challenge id, or { 0: id, 1: id } by pattern), after
 *                                   (lines when it is answered), later (line when it is put off) }; the wing writes
 *                                   the `@scene <id>` line itself, so that every scene's source line can be found
 *                                   (tools/scene_manifest.mjs)
 * Lines are the scene language's own (`narr: jp || en`, `?(cond) …`). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = {};
  K.T = (en, jp) => ({ en, jp });
  K.base = (w) => ({ region: 'hall_' + w, music: 'hall_' + w, edition: 2, place: 'keepers', noTravel: true, noCheckpoint: true, travelKind: 'dungeon', travelPlace: { en: 'the Hall of a Hundred Tales' }, expedition: 'hall_' + w });
  K.lit = (x, y, cond, scene) => Object.assign({ p: 'kr_toro', x, y, light: 34, o: { lit: true } }, cond ? { if: cond } : {}, scene ? { scene } : {});
  K.andon = (x, y, w, t) => [
    { p: 'hall_andon', x, y, if: '!hall.' + w + '.' + t },
    { p: 'hall_andon', x, y, if: 'hall.' + w + '.' + t, light: 30, o: { lit: true } },
  ];
  K.furniture = (w, k, at) => [].concat(
    at.ret ? [K.lit(at.ret[0], at.ret[1], null, 'hall.return')] : [],
    at.bench ? [{ p: 'bench', x: at.bench[0], y: at.bench[1], scene: 'hall.' + w + '.bench' + (k + 1) }] : [],
    at.gate ? [{ p: 'hall_gate', x: at.gate[0], y: at.gate[1], if: '!hall.' + w + '.f' + k + '.clear', scene: 'hall.gate' }] : [],
    at.stairs ? [{ p: 'stairs', x: at.stairs[0], y: at.stairs[1] }] : []);
  K.lv = (w) => {
    const G = 'hall.' + w + '.route=grow';
    const L = { F: 'prof=F&!' + G, E: 'prof=E&!' + G + '|prof=F&' + G, I: 'prof=I&!' + G + '|prof=E&' + G, A: 'prof=A|prof=I&' + G };
    L.EF = L.F; L.NOTF = 'prof>=E|' + G; L.IA = L.I + '|' + L.A; L.FE = L.F + '|' + L.E;
    L.both = (a, b) => a.split('|').map((x) => x + '&' + b).join('|');
    return L;
  };
  K.mark = (w, k, t) => '!set xp_hall_' + w + '_f' + k + '_' + t + '\n!hook hall_trial ' + w + ' ' + t + '\n!refresh';
  K.taskTrial = (o) => {
    const { w, k, t } = o;
    const task = typeof o.task === 'string' ? '!hook hall_challenge ' + o.task + '\n' :
      '!if hall.' + w + '.pat=1 -> p1\n!hook hall_challenge ' + o.task[0] + '\n!goto asked\n:p1\n!hook hall_challenge ' + o.task[1] + '\n:asked\n';
    return '\n!if hall.' + w + '.' + t + ' -> done\n' + (o.intro || []).join('\n') + '\n' + task +
      '!if var._res=0 -> later\n' + (o.after || []).join('\n') + '\n' + K.mark(w, k, t) + '\n!end\n:later\n' + o.later + '\n!end\n:done\n' + o.done + '\n';
  };
  C.hallKit = K;
})(RB.content);
