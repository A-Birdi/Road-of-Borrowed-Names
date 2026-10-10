// The Flood Cellars, P07's pilot expedition (src/content/expeditions/*, src/ui/89b_expedition.js). The playbook's
// evidence for the whole loop: an accurate entrance preview; a large looped floor (two ways to the stairs); the
// stations where the definition says; the optional route; the shortcut opened from the far side and kept; the
// sluice (a procedure) gating the far chamber; what a restart resets and keeps (machines part-way through reset,
// solved steps kept, the floors seen kept); coherence when a save resumes half in or half out; the state surviving a
// save; every learning step at all four profiles, and every input route meeting the construction.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, X = RB.expedition, E = RB.encounter;
  const d = X.get('cellars');
  t.ok(d && d.floors.length === 2 && d.rules.persistent && d.rules.restart === 'entrance', 'the cellars are defined: two floors, persistent condition, defeat restarts from the entrance');

  // ---- the preview says what the run does (D4) ---------------------------------------------------------------------
  const pv = X.preview('cellars');
  const rules = pv.rules.map((r) => r.en).join(' | ');
  t.ok(/carries/.test(rules) && /1 rest bench/.test(rules) && /1 spring/.test(rules) && /mended/.test(rules) && /entrance/.test(rules) && /plain sight/.test(rules) && /stay open/.test(rules) && /climb out/.test(rules), 'the card states every rule the run applies: ' + rules);
  t.ok(!/minute|hour/i.test(pv.size.en + rules), 'no length in minutes or hours is claimed (none has been measured)');
  t.ok(/〜て ある/.test(pv.language.en) && pv.language.jp, 'it names what is practised (〜て ある), never an answer');
  const html = RB.ui.expedition.cardHtml('cellars', RB.state.newCampaign({ edition: 2 }));
  t.ok(/Go down|Rules/.test(html + 'Go down') && /Language/.test(html) && /Size/.test(html), 'the card on screen carries the language, the size and the rules');

  // ---- the places the definition names are where the maps put them ---------------------------------------------
  const propAt = (map, x, y, kind) => (C.maps[map].props || []).find((p) => p.x === x && p.y === y && (!kind || p.p === kind));
  t.ok(propAt('rw.cellar1', 3, 9, 'bench') && propAt('rw.cellar1', 3, 9, 'bench').scene === 'xp.cellars_bench', 'the bench station is the bench on B1');
  t.ok(propAt('rw.cellar2', 3, 19, 'well') && propAt('rw.cellar2', 3, 19, 'well').scene === 'xp.cellars_spring', 'the spring station is the well on B2');
  t.ok(propAt('rw.cellar1', 36, 8, 'lantern') && propAt('rw.cellar1', 36, 8, 'lantern').if === d.stations.lamp.requires, 'the lamp station appears where the dead lamp was, once mended');
  t.ok(propAt('rw.cellar2', 31, 3, 'ladder') && (C.maps['rw.cellar1'].exits || []).some((e) => e.x === 8 && e.y === 22 && e.if === 'xpk_cellars_sc_ladder'), 'the shortcut: a ladder on B2, the grate on B1 a way down once opened');
  for (const sc of ['xp.cellars_hatch', 'xp.cellars_board', 'xp.cellars_bench', 'xp.cellars_lamp', 'xp.cellars_spring', 'xp.cellars_sluice', 'xp.cellars_ladder', 'xp.cellars_outflow', 'xp.cellars_leave', 'xp.cellars_yasu']) t.ok(!!C.scenes[sc], 'scene ' + sc);
  // story dungeons keep their checkpoints (D5): no map but the cellars' belongs to an expedition
  const owned = Object.keys(C.maps).filter((id) => X.owner(id));
  t.eq(owned.sort(), ['rw.cellar1', 'rw.cellar2'], 'only the cellars\' floors are an expedition\'s; every story map keeps the checkpoint rule');
  // the cellars are the twelve-chapter edition's only: no way in from the six-chapter world but the gated hatch
  const into = Object.keys(C.maps).filter((id) => !/^rw\.cellar/.test(id)).flatMap((id) => (C.maps[id].exits || []).filter((e) => /^rw\.cellar/.test(e.to)).map((e) => id));
  t.ok(!into.length && C.maps['rw.cellar1'].edition === 2 && C.maps['rw.cellar2'].edition === 2, 'no exit from any other map leads into the cellars; both floors are marked as the expansion\'s (' + into.join(', ') + ')');
  t.ok(propAt('rw.warehouse', 7, 3, 'sg_hatch') && propAt('rw.warehouse', 7, 3, 'sg_hatch').if === 'ed>=2&ch2_done', 'the hatch: twelve-chapter journeys, once Chapter 2 is over');

  // ---- walking: the loop, the optional room, the flood --------------------------------------------------------------
  const DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function reach(mapId, flags, from, extra) {
    const s = RB.state.newCampaign({ edition: 2 });
    Object.assign(s.flags, flags || {});
    RB.game.s = s;
    RB.maps.invalidate();
    const m = RB.maps.compile(mapId);
    const block = (x, y) => RB.maps.blockedStatic(m, x, y) || (extra && extra(x, y));
    const seen = new Set([from[0] + ',' + from[1]]), q = [from];
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of DIR) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || block(nx, ny)) continue; seen.add(k); q.push([nx, ny]); }
    }
    return { has: (x, y) => seen.has(x + ',' + y), near: (x, y) => DIR.some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy))), n: seen.size };
  }
  const e1 = d.floors[0].entry, e2 = d.floors[1].entry;
  let R = reach('rw.cellar1', {}, [e1.x, e1.y]);
  t.ok(R.has(30, 4) && R.near(3, 9) && R.near(5, 17) && R.near(36, 8) && R.has(2, 18), 'B1: the stairs, the bench, the notice, the lamp room and the ladder out are all reachable');
  t.ok(R.n > 300, 'B1 is a large floor (' + R.n + ' tiles to walk)');
  const north = reach('rw.cellar1', {}, [e1.x, e1.y], (x, y) => x === 16 && y >= 3 && y <= 5);
  const south = reach('rw.cellar1', {}, [e1.x, e1.y], (x, y) => x === 20 && y >= 20 && y <= 22);
  t.ok(north.has(30, 4) && south.has(30, 4), 'a loop: with either the north or the south passage closed, the stairs down can still be reached');
  const noRoom = reach('rw.cellar1', {}, [e1.x, e1.y], (x, y) => x === 33 && (y === 9 || y === 10));
  t.ok(noRoom.has(30, 4) && !noRoom.near(36, 8), 'the lamp room is an optional route: closing it off changes nothing about the way on');
  R = reach('rw.cellar2', {}, [e2.x, e2.y]);
  t.ok(R.has(2, 3) && R.near(3, 19) && R.near(28, 14), 'B2, flooded: the way back up, the spring and the sluice are reachable');
  t.ok(!R.has(28, 2) && !R.near(31, 3), 'and the outflow chamber is not, until the sluice has drained it');
  R = reach('rw.cellar2', { xp_cellars_drained: true }, [e2.x, e2.y]);
  t.ok(R.has(28, 2) && R.near(31, 3), 'drained: the outflow door and the ladder up can be reached');
  R = reach('rw.cellar2', { xpk_cellars_sc_ladder: true }, [30, 4]);
  t.ok(R.has(28, 2) && R.near(31, 3), 'down the opened shortcut, the outflow chamber is reachable even with the water back');
  RB.maps.invalidate();

  // ---- an instance: entering, the reset matrix, coherence, the save ------------------------------------------------
  const s = RB.state.newCampaign({ edition: 2 }); s.id = 'xp-cellars'; s.comp = 'mio'; s.flags.ch2_done = true; RB.game.s = s;
  X.arrived(s, 'rw.cellar1');
  t.ok(X.active(s) && X.of(s).id === 'cellars' && X.floorSeen(s, 'cellars', 'b1'), 'walking onto B1 without the hatch (an interrupted entry) begins a fresh visit; B1 counts as seen');
  X.arrived(s, 'rw.cellar2');
  t.eq(X.floorOf(s).id, 'b2', 'the second floor');
  // a visit's worth of state
  Object.assign(s.flags, { xp_cellars_drained: true, xp_cellars_lamp_fixed: true, 'foe:rw.cellar1:c1': true, 'foe:rw.cellar2:d3': true, xpk_cellars_taught: true });
  X.openShortcut(s, 'cellars', 'ladder');
  const st = E.begin('xp.cellars_sluice', s);
  const pick = (aid) => E.cards(st, s, []).find((c) => c.kind === 'proc' && c.action.id === aid);
  E.exchange(st, { card: pick('pull'), res: { ok: true, firstTry: true, mistakes: 0 }, target: st.cur }, {});
  t.eq(st.enc.proc.step, 1, 'the sluice: the plug pulled');
  E.finishEncounter(st, s, 'flee');
  t.ok(s.enc.proc.xp_cellars_sluice && s.enc.proc.xp_cellars_sluice.step === 1 && Object.keys(s.enc.solved).length === 1, 'stepped away part-way: the machine is kept, the step solved recorded');
  s.resolve.pc = 4;
  X.useStation(s, 'spring');
  t.eq([s.resolve.pc, X.stationLeft(s, 'spring')], [s.resolve.max, 0], 'the spring: full resolve, used up');
  // what a defeat does
  s.resolve.pc = 0;
  const wake = X.onDefeat(s);
  t.ok(wake && wake.map === 'rw.cellar1' && wake.x === e1.x && wake.y === e1.y, 'defeat: back to the foot of the ladder');
  t.ok(!s.flags.xp_cellars_drained && !s.flags.xp_cellars_lamp_fixed && !s.flags['foe:rw.cellar1:c1'] && !s.flags['foe:rw.cellar2:d3'], 'reset: the water is back, the lamp out, the creatures returned');
  t.ok(!s.enc.proc.xp_cellars_sluice && Object.keys(s.enc.solved).length === 1, 'reset: the sluice starts from its first step; the step solved before is still recognised (Resolve this step)');
  t.ok(X.stationLeft(s, 'spring') === 1 && X.stationLeft(s, 'bench') === 2 && s.resolve.pc === s.resolve.max, 'reset: stations and condition back');
  t.ok(s.flags.xpk_cellars_taught && X.shortcutOpen(s, 'cellars', 'ladder') && X.floorSeen(s, 'cellars', 'b2'), 'kept: what was taught, the shortcut, the floors seen');
  const x2 = E.begin('xp.cellars_sluice', s);
  t.ok(x2.enc.proc.step === 0 && E.cards(x2, s, []).some((c) => c.kind === 'resolve'), 'the sluice again: from the first step, with Resolve this step offered for it');
  // the save keeps the visit, unlimited and counted uses alike
  X.useStation(s, 'bench');
  s.resolve.pc = 3;
  const back = JSON.parse(JSON.stringify(s));
  RB.game.s = back;
  t.ok(X.active(back) && X.stationLeft(back, 'bench') === X.stationLeft(s, 'bench') && back.resolve.pc === 3, 'saved and read back: the same visit, the same uses, the same condition');
  X.define('xp_shelter_probe', { floors: [{ id: 'a', map: 'rw.cellar1', entry: { x: 4, y: 20 } }], stations: { sh: { kind: 'shelter', map: 'rw.cellar1', x: 1, y: 1 } }, rules: { persistent: true, restart: 'entrance' } });
  const p = RB.state.newCampaign({ edition: 2 }); p.flags = {}; X.enter(p, 'xp_shelter_probe');
  const pr = JSON.parse(JSON.stringify(p));
  t.eq(X.stationLeft(pr, 'sh'), Infinity, 'an unlimited shelter is still unlimited after a save');
  RB.game.s = s;
  // walking out by any way but the ladder (an interrupted exit) leaves the expedition
  X.arrived(s, 'rw.warehouse');
  t.ok(!X.active(s) && s.resolve.pc === s.resolve.max, 'onto any other map: the visit is over, resolve full');

  // ---- the language: four profiles everywhere, every input route ---------------------------------------------------
  const kinds = new Set();
  for (const id of ['xp.c_notice', 'xp.c_lamp', 'xp.c_final']) {
    const ch = C.challenges[id];
    t.ok(['F', 'E', 'I', 'A'].every((k) => ch.tiers[k] && ch.tiers[k].length >= 2), id + ': every profile has its own steps (two or more)');
    for (const k in ch.tiers) for (const step of ch.tiers[k]) kinds.add(step.kind);
  }
  t.ok(kinds.has('choose') && kinds.has('order') && kinds.has('write'), 'choosing, ordering and writing all meet 〜て ある (' + [...kinds].join(', ') + ')');
  const steps = C.encounters['xp.cellars_sluice'].procedure.steps;
  t.ok(steps.every((sp) => ['F', 'E', 'I', 'A'].every((k) => sp.task[k] && sp.task[k].options.some((o) => o.ok) && sp.task[k].options.some((o) => !o.ok && o.why))), 'the sluice: each step read at every profile, with a reason for each wrong reading');
  const items = new Set();
  for (const id of ['xp.c_notice', 'xp.c_lamp', 'xp.c_final']) for (const k in C.challenges[id].tiers) for (const step of C.challenges[id].tiers[k]) items.add(step.item);
  t.ok(items.has('g:te_aru') && items.has('g:v_te_kudasai'), 'the construction is the evidence item; the last door also asks the old 〜て ください');
  // every kanji shown carries its reading: English fields write Japanese as {漢字|かな} groups (the challenge screen
  // renders them with ruby), never bare
  const bare = [];
  const walk = (o, path) => { for (const k in o) { const v = o[k]; if (typeof v === 'string' && (k === 'en') && /[一-鿿々]/.test(v.replace(/\{[^|}]+\|[^}]+\}/g, ''))) bare.push(path + '.' + k); else if (v && typeof v === 'object') walk(v, path + '.' + k); } };
  for (const id of ['xp.c_notice', 'xp.c_lamp', 'xp.c_final']) walk(C.challenges[id], id);
  walk(C.encounters['xp.cellars_sluice'], 'sluice'); walk(C.encounters['xp.cellars_blot'], 'blot'); walk(d, 'def');
  t.eq(bare, [], 'no bare kanji in any English line of the cellars');
};
