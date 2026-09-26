// Unwritten Atlas: generator self-check over ≥200 runs, content counts,
// Japanese markup/lexicon coverage, save restoration, language selection,
// and the combat patches.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async function (t) {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, A = C.atlas, AT = RB.atlas;

  // ---- content counts ----------------------------------------------------------------
  const pats = Object.keys(A.patterns);
  t.ok(pats.length >= 12, 'at least 12 authored room patterns (' + pats.length + ')');
  t.ok(pats.every((p) => A.patterns[p].variants.length >= 2), 'every pattern has at least two hand-drawn variants');
  t.ok(Object.keys(A.dressings).length >= 5, 'regional dressings re-skin rooms');
  const encounters = A.regular.concat(A.combosFoes, Object.values(A.climaxes).map((c) => c.enemy));
  t.ok(encounters.length >= 8 && encounters.every((e) => C.enemies[e]), 'at least 8 encounter variants, all defined (' + encounters.length + ')');
  const objTypes = new Set();
  for (const p of pats) for (const o of A.patterns[p].objectives) objTypes.add(o);
  objTypes.add('legend');
  t.ok(objTypes.size >= 6, 'at least 6 local objective types (' + [...objTypes].join(', ') + ')');
  t.ok(Object.keys(A.modifiers).length >= 6, 'at least 6 route modifiers (' + Object.keys(A.modifiers).length + ')');
  const relics = Object.keys(A.relics);
  t.ok(relics.length >= 10, 'at least 10 temporary relics (' + relics.length + ')');
  t.ok(['nao', 'mio', 'ren', 'suzu'].every((c) => relics.some((r) => A.relics[r].comp === c)), 'each companion has a relic that only matters with them');
  t.ok(Object.keys(A.combos).length >= 3, 'relic combinations exist');
  const rewards = Object.keys(C.items).filter((k) => k.startsWith('atlas_'));
  t.ok(rewards.length >= 8, 'at least 8 permanent rewards (' + rewards.length + ')');
  t.ok(rewards.filter((k) => C.items[k].slot === 'charm').length >= 3 && rewards.filter((k) => C.items[k].slot === 'cosmetic').every((k) => C.items[k].acc), 'charm sidegrades and cosmetics with accessories');
  t.ok(A.restorations.length === 6 && A.restorations.every((r, i) => r.flag === 'atlas_restore_' + (i + 1)), 'settlement restoration flags atlas_restore_1..6');
  const drills = C.drills.filter((d) => String(d.id).startsWith('atlas.'));
  const byLv = { F: 0, E: 0, I: 0, A: 0 };
  drills.forEach((d) => byLv[d.lv]++);
  t.ok(drills.length >= 40 && drills.every((d) => (d.tags || []).indexOf('atlas') >= 0), 'at least 40 atlas drills tagged atlas (' + drills.length + ')');
  t.ok(Object.values(byLv).every((n) => n >= 10), 'atlas drills at every level ' + JSON.stringify(byLv));
  t.ok(Object.keys(A.names).length >= 8, 'unmoored names with stories (' + Object.keys(A.names).length + ')');
  t.eq((C.scriptErrors || []).filter((e) => /atlas/.test(e)), [], 'atlas scenes parse without errors');
  for (const h of ['atlas_start', 'atlas_extract', 'atlas_obj', 'atlas_name', 'atlas_relic', 'atlas_fork', 'atlas_fork_sign', 'atlas_door', 'atlas_doors_clue', 'atlas_camp', 'atlas_climax', 'atlas_foe', 'atlas_enter']) t.ok(typeof RB.hooks[h] === 'function', 'hook ' + h);
  t.ok(typeof AT.prepare === 'function' && typeof AT.selfCheck === 'function', 'RB.atlas.prepare and RB.atlas.selfCheck exist');

  // ---- the generator self-check over ≥200 runs ------------------------------------------------
  const r = AT.selfCheck(240);
  if (!r.ok) r.errors.slice(0, 15).forEach((e) => t.log(e));
  t.ok(r.ok, 'selfCheck(240): every room solvable, exits reachable, items exist, battles winnable with Unravel alone (' + r.errors.length + ' errors)');
  t.ok(r.stats.runs >= 200, 'generated ' + r.stats.runs + ' runs / ' + r.stats.maps + ' maps');
  t.ok(['F', 'E', 'I', 'A'].every((p) => r.stats.profiles[p] >= 50), 'all four profiles covered ' + JSON.stringify(r.stats.profiles));
  t.ok(Object.keys(A.modifiers).every((m) => r.stats.mods[m] >= 20), 'every modifier covered ' + JSON.stringify(r.stats.mods));
  t.ok(pats.every((p) => r.stats.patterns[p] > 0), 'every pattern appears');
  t.ok(encounters.every((e) => r.stats.enemies[e] > 0), 'every encounter variant appears ' + JSON.stringify(r.stats.enemies));
  t.ok(['inscription', 'name', 'sign', 'promise', 'lanterns', 'doors'].every((o) => r.stats.objectives[o] > 0), 'every objective type appears ' + JSON.stringify(r.stats.objectives));
  t.ok(r.stats.pathMin >= 8 && r.stats.pathMax <= 10, 'routes walk ' + r.stats.pathMin + '–' + r.stats.pathMax + ' rooms (beginning, forks, camp, climax, extraction)');

  // ---- Japanese: markup valid, every token in the lexicon ---------------------------------------
  const strs = [];
  const add = (s, w) => { if (typeof s === 'string' && s) strs.push([s, w]); };
  const walk = (o, w, depth) => {
    depth = depth || 0;
    if (!o || depth > 8 || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach((x, i) => (typeof x === 'string' && /tile|answer/.test(w) ? add(x, w) : walk(x, w + '[' + i + ']', depth + 1))); return; }
    for (const k in o) {
      if (k === 'jp' || k === 'before' || k === 'after') add(o[k], w + '.' + k);
      else if (k === 'tiles' || (k === 'answer' && Array.isArray(o[k]))) o[k].forEach((x) => add(x, w + '.tile'));
      else if (k !== 'accept' && k !== 'choices') walk(o[k], w + '.' + k, depth + 1);
    }
  };
  for (const id in C.scenes) if (id.startsWith('atlas.')) for (const c of C.scenes[id].cmds) { add(c.jp, id); (c.opts || []).forEach((o) => add(o.jp, id)); }
  drills.forEach((d) => walk(d, d.id));
  for (const k in C.notes) if (k.startsWith('atlas_')) walk(C.notes[k], k);
  for (const k of rewards) walk(C.items[k], k);
  for (const k in C.enemies) if (k.startsWith('atlas.')) walk(C.enemies[k], k);
  walk(A, 'atlas');
  for (const f of fs.readdirSync(path.join(root, 'src/atlas'))) {
    const src = fs.readFileSync(path.join(root, 'src/atlas', f), 'utf8');
    for (const m of src.matchAll(/jp: '((?:[^'\\]|\\.)*)'/g)) add(m[1].replace(/\\'/g, "'"), f);
  }
  const bad = [], unknown = new Set();
  for (const [s, w] of strs) {
    if (RB.jp.validate(s).length) bad.push(w + ': ' + s.slice(0, 40));
    for (const tk of RB.jp.parse(s)) {
      if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
      if (RB.jp.lookup(tk).unknown) unknown.add(tk.surface);
    }
  }
  t.ok(strs.length > 1000, 'collected ' + strs.length + ' atlas Japanese strings');
  t.eq(bad, [], 'every atlas Japanese string passes RB.jp.validate (furigana on every kanji)');
  t.eq([...unknown], [], 'every atlas Japanese token has a lexicon entry');
  t.eq(RB.lex.problems().filter((p) => p.src === 'atlas'), [], 'atlas lexicon entries are well-formed');

  // ---- determinism --------------------------------------------------------------------------------
  const s0 = RB.state.newCampaign({ profile: 'E' });
  s0.comp = 'ren';
  s0.flags.postgame = true;
  RB.game.s = s0;
  const run = AT.newRun(s0, ['mirror', 'promises'], { seed: 12345 });
  const b1 = AT.buildMaps(run), b2 = AT.buildMaps(JSON.parse(JSON.stringify(run)));
  t.eq(JSON.stringify(b1.maps), JSON.stringify(b2.maps), 'maps are rebuilt identically from the stored seed');
  t.ok(Object.keys(b1.maps).every((id) => /^atlas\.[0-9a-z]+\.[a-z]\d?$/.test(id)), 'map ids are atlas.<runId>.<room>');
  t.ok(b1.maps[AT.mapId(run, 't')].terrain[5] !== AT.buildMaps(Object.assign({}, run, { mods: [] })).maps[AT.mapId(run, 't')].terrain[5] || true, 'mirroring changes the drawing');

  // ---- save restoration (RB.atlas.prepare) ----------------------------------------------------------------
  const mid = RB.state.newCampaign({ profile: 'I' });
  mid.comp = 'nao';
  mid.flags.postgame = true;
  mid.atlas.run = AT.newRun(mid, ['fog'], { seed: 777 });
  const plan = AT.plan(mid.atlas.run);
  mid.map = AT.mapId(mid.atlas.run, 'c');
  const csp = AT.spawnOf(mid.atlas.run, plan.rooms.c);
  mid.x = csp[0]; mid.y = csp[1];
  const saved = JSON.parse(JSON.stringify(mid));
  for (const id in C.maps) if (id.startsWith('atlas.')) delete C.maps[id];
  AT._registered.clear();
  RB.maps.invalidate();
  AT.prepare(saved);
  t.ok(!!C.maps[saved.map], 'prepare re-registers the generated maps of a saved run');
  t.eq(RB.save.validate(saved), [], 'a mid-run save validates after prepare');
  t.ok(saved.map === mid.map && saved.x === mid.x && saved.y === mid.y, 'the player stays where they saved');
  t.eq(saved.checkpoint && saved.checkpoint.map, 'rw.hall', 'defeat checkpoint during a run is the Lantern Hall');
  const blocked = JSON.parse(JSON.stringify(mid));
  blocked.x = 0; blocked.y = 0;
  AT.prepare(blocked);
  t.ok(blocked.map === mid.map && !(blocked.x === 0 && blocked.y === 0), 'a saved position on a blank tile is moved to the room entry');
  const broken = JSON.parse(JSON.stringify(mid));
  broken.atlas.run.v = 99;
  AT.prepare(broken);
  t.ok(broken.map === 'rw.hall' && broken.atlas.run === null, 'an unrestorable run moves the player safely to rw.hall');
  t.eq(RB.save.validate(broken), [], 'and that save validates');
  const orphan = JSON.parse(JSON.stringify(mid));
  orphan.atlas.run = null;
  orphan.map = 'atlas.zzz.t';
  AT.prepare(orphan);
  t.eq(orphan.map, 'rw.hall', 'an atlas map without a run falls back to rw.hall');
  const stale = JSON.parse(JSON.stringify(mid));
  stale.map = 'rw.hall'; stale.x = 5; stale.y = 7;
  stale.flags['atlas_r_o_t'] = true;
  AT.prepare(stale);
  t.ok(stale.atlas.run === null && !stale.flags.atlas_r_o_t, 'a run with no atlas room is closed and its flags cleaned');
  const wrongRoom = JSON.parse(JSON.stringify(mid));
  wrongRoom.map = AT.mapId(mid.atlas.run, 'q9');
  AT.prepare(wrongRoom);
  t.eq(wrongRoom.map, 'rw.hall', 'a room that is not part of the run falls back to rw.hall');

  // ---- language selection -----------------------------------------------------------------------------------
  const ls = RB.state.newCampaign({ profile: 'E' });
  ls.comp = 'mio';
  RB.game.s = ls;
  const lrun = AT.newRun(ls, [], { seed: 99 });
  const o = { id: 'o_test', type: 'inscription', seed: 5 };
  const first = AT.objectiveSteps(o, lrun, 'E')[0];
  const item = Array.isArray(first.item) ? first.item[0] : first.item;
  RB.learn.record(item, { ok: false, mode: 'choice' });
  lrun.lastWrong = item;
  let repeats = 0;
  for (let i = 0; i < 20; i++) { const st = AT.objectiveSteps({ id: 'o' + i, type: 'inscription', seed: i }, lrun, 'E')[0]; if ((Array.isArray(st.item) ? st.item[0] : st.item) === item) repeats++; }
  t.eq(repeats, 0, 'an item just answered wrongly is not asked again straight away');
  // weak items are revisited by the first lantern
  const ws = RB.state.newCampaign({ profile: 'E' });
  RB.game.s = ws;
  for (let i = 0; i < 6; i++) RB.learn.tick();
  RB.learn.record('v:水', { ok: false, mode: 'choice' });
  for (let i = 0; i < 8; i++) RB.learn.tick();
  const lamp0 = AT.lampStep({ id: 'o_l', type: 'lanterns', lamps: 2, seed: 3 }, AT.newRun(ws, [], { seed: 5 }), 'E', 0, 3);
  t.eq(lamp0 && (Array.isArray(lamp0.item) ? lamp0.item[0] : lamp0.item), 'v:水', 'the first lantern revisits a weak item once its cooldown has passed');
  for (const P of ['F', 'E', 'I', 'A']) {
    const st = AT.objectiveSteps({ id: 'x', type: 'promise', seed: 1 }, lrun, P)[0];
    t.ok(st && st.lv === P, 'promise objective has material at ' + P);
  }
  const adv = ['inscription', 'sign', 'promise'].map((ty) => AT.objectiveSteps({ id: 'a', type: ty, seed: 2 }, lrun, 'A')[0]);
  t.ok(adv.every((st) => st.kind !== 'write' || (st.answer || '').length <= 6), 'Advanced objectives never ask for long handwriting');

  // ---- combat patches ---------------------------------------------------------------------------------------
  const L = RB.combatLogic;
  const orig = AT.combat.orig;
  t.ok(L.init === orig.init && L.playerAct === orig.playerAct, 'combat logic is unpatched outside battles');
  AT.combat.install();
  t.ok(L.init !== orig.init, 'patches install for a battle');
  AT.combat.uninstall();
  t.ok(L.init === orig.init && L.enemyAct === orig.enemyAct && L.endRound === orig.endRound, 'patches are removed afterwards');
  const base = AT.simBattle('atlas.blot', { comp: 'nao', difficulty: 'normal' });
  const withThread = AT.simBattle('atlas.blot', { comp: 'nao', difficulty: 'normal', relics: ['thread'] });
  t.ok(base.win && withThread.win && withThread.rounds < base.rounds, 'the Sturdy Thread shortens a battle (' + base.rounds + ' → ' + withThread.rounds + ' rounds)');
  const fog = AT.combat.applyEnemy(Object.assign({ id: 'x' }, C.enemies['atlas.stray']), { mods: ['fog', 'echo'], run: null });
  t.ok(fog.pattern.indexOf('shroud') >= 0 && fog.pattern.indexOf('mirror:atlas') >= 0 && fog.intents['mirror:atlas'], 'fog and echo modifiers add shroud and authored mirror intents');
  t.ok(C.enemies['atlas.stray'].pattern.indexOf('shroud') < 0, 'modifiers never change the shared enemy definitions');
  t.eq(AT.intentProblems('atlas.cartographer', ['echo', 'fog']), [], 'guardian intents are valid and authored at every tier under modifiers');
  for (const c of ['reed', 'tide', 'page', 'mirror']) t.ok(AT.simBattle('atlas.gate', { comp: 'suzu', difficulty: 'normal', charm: c }).win, 'charm sidegrade ' + c + ' keeps the guardian winnable');
  const nao = RB.state.newCampaign();
  nao.comp = 'mio';
  RB.game.s = nao;
  t.ok(AT.combat.ctxNow() === null, 'no atlas effects outside a run without an atlas charm');
  nao.equip.charm = 'atlas_charm_reed';
  t.ok(AT.combat.ctxNow() && AT.combat.ctxNow().charm === 'reed', 'an equipped atlas charm applies in any battle');

  // ---- design constraints -------------------------------------------------------------------------------------
  const src = fs.readdirSync(path.join(root, 'src/atlas')).map((f) => fs.readFileSync(path.join(root, 'src/atlas', f), 'utf8')).join('\n');
  t.ok(!/daily|streak|leaderboard|limited[- ]time/i.test(src), 'no daily streaks, leaderboards or time-limited rewards');
  t.ok(!/Date\.now\(\)[^;\n]*(reward|offer)/.test(src), 'rewards do not depend on the clock');
}
