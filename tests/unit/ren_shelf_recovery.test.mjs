// Ren's shelf after a save made partway through it (Local CL-889, CL-890 option A; Cloud CC-645; Agnes 6945102589).
// The shelf (sa.shelf_ren, src/content/ch6/51_scenes_archive.js) writes its outcome to the journey before it shows the
// reveal: the face taken back or left (sa_ren_took / sa_ren_left, with sa_ren_decided) and the quest done. The scene
// counts as seen only at its end. So a save made during the reveal held the outcome with the scene unseen, and every
// later use of the shelf went to its "after" line. Two guarded jumps at the scene's head now go to the rest of the chosen
// branch while the scene is unseen and Ren travels with you:
//   !if sa_ren_took&!seen.sa.shelf_ren&comp=ren -> ropen_rest   (:ropen_rest straight after the took branch's quest)
//   !if sa_ren_left&!seen.sa.shelf_ren&comp=ren -> rleave_rest  (:rleave_rest straight after the left branch's quest)
// The state lines before those labels (the flags, the quest, the Company's record of the choice) are not run again. A
// replay from the branch's start, never an exact resume; the reading in the took branch is asked again on each replay.
// An old partial save whose shelf has since been visited (seen by the "after" line) stays as it is: no migration.
// On the real runner, the screen stood in for, the reading answered by the test (the reveal itself, the save and the
// load through the game's own Ledger, and the learning records, are played in tests/e2e/ren_shelf_recovery.mjs):
//  1. the scene's head: the two jumps, in order, before the "decided" jump; each label where the agreed design puts it;
//  2. the jumps' conditions, by the game's own RB.state.test, over every outcome x seen x companion: a jump only when
//     its outcome is set, the scene unseen and Ren is the companion;
//  3. a partial save on each branch (the outcome set, the quest done, the scene unseen), run as the shelf runs it: the
//     rest of the branch, line for line as the parent's run says it after the same point; no choice, no quest banner,
//     no Company record, no flag or quest change; the reading asked once on the took branch; seen at the end; then a
//     second use: the "after" line only;
//  4. the same partial saves through a save's JSON and the game's own load migration (RB.save.migrate): the same;
//  5. a replay stopped and replayed (the scene left unseen again, as a save made inside a replay holds): the same rest
//     of the branch again, the reading asked again, still no banner or flag change;
//  6. unchanged, line for line as on the parent (315b770; fingerprints taken there): every first run (each choice, with
//     each companion), every finished scene's revisit, and every partial state that is not Ren's took/left (the carried
//     and told states, an outcome with another companion, a state with no outcome);
//  7. unchanged in its text: the scene without the two jumps and their labels, as on the parent; every other scene, as
//     on the parent (source line numbers aside, which move by four after 638 in this file); the shelf's 31 lines and
//     their voice keys, as on the parent.
// No scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const ID = 'sa.shelf_ren';
  const TOOK = 'sa_ren_took&!seen.sa.shelf_ren&comp=ren', LEFT = 'sa_ren_left&!seen.sa.shelf_ren&comp=ren';
  // on the parent (315b770): the scene without the two jumps; every other scene; the shelf's lines and keys; each run of 6
  const PARENT = { scene: '5e714171197ec611', others: [3177, 'b83fde7fb7adb657'], lines: '333c808efcf2ceb5', runs: '549de0c7ba474fe2' };

  // ---- the runner, with the screen stood in for (as tests/unit/cr_lamp_cancel.test.mjs) ----------------------------
  let out;
  const blank = () => ({ said: [], offered: [], toasts: [], asked: [], hooks: [] });
  let pick = /^Take it back/;
  RB.ui.dialogue.say = async (l) => { out.said.push([l.who || null, l.en || '']); };
  RB.ui.dialogue.choose = async (opts) => { const en = (opts || []).map((o) => (o && (o.en || o.text)) || ''); out.offered.push(en); if (typeof pick === 'number') return Math.min(pick, en.length - 1); const i = en.findIndex((x) => pick.test(x)); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (x) => { out.toasts.push((x && x.kind) || null); };
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors', 'placeCompanion']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  if (RB.sequence) { RB.sequence.cmd = async () => {}; RB.sequence.toShot = () => {}; RB.sequence.stopSkip = () => {}; }
  RB.challenge.run = async (id) => { out.asked.push(id); return { ok: true }; };
  const co0 = RB.hooks.co_note;
  RB.hooks.co_note = async (a, ctx) => { out.hooks.push(a.join(':')); return co0 ? co0(a, ctx) : undefined; };
  RB.test.enable({});
  if (!RB.game.G.settings) RB.game.G.settings = {};
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'sa_arrived', 'sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'];
  const use = (s) => { RB.game.G.s = s; RB.game.s = s; RB.world.W.map = { id: s.map, def: C.maps[s.map] }; return s; };
  // a journey in the Memories room with `comp`; `outcome`: the shelf's flags as a partial save holds them
  const OUT = {
    none: [],
    took: ['sa_ren_took', 'sa_ren_decided'],
    left: ['sa_ren_left', 'sa_ren_decided'],
    carried: ['sa_ren_carried', 'sa_ren_decided'],
    told: ['sa_ren_told', 'sa_ren_decided'],
  };
  const journey = (comp, outcome, seen) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'ren-shelf-recovery-test'; s.map = 'sa.memories'; s.x = 4; s.y = 7; s.comp = comp;
    for (const f of BASE.concat(OUT[outcome])) s.flags[f] = true;
    if (comp) s.flags['comp_' + comp] = true;
    s.quests.sa_main = { stage: 3, done: false, t: 2 };
    s.quests.ren_ushio = { stage: 1, done: false, t: 1 };
    if (outcome === 'took' || outcome === 'left') s.quests.ren_ushio = { stage: 1, done: true, t: 1 };
    if (outcome === 'carried') s.inv = Object.assign({}, s.inv, { sa_ren_folio: 1 });
    if (seen) s.seen[ID] = true;
    return use(s);
  };
  const snap = (s) => ({ flags: Object.keys(s.flags).filter((k) => /^sa_ren_/.test(k) && s.flags[k]).sort(), quest: s.quests.ren_ushio ? [!!s.quests.ren_ushio.done] : null, folio: (s.inv && s.inv.sa_ren_folio) || 0, seen: !!s.seen[ID] });
  const run = async (s, re) => {
    out = blank(); pick = re || /^Take it back/;
    const before = snap(s);
    try { await RB.script.run(ID); } catch (e) { errors.push(ID + ': ' + String((e && e.message) || e)); }
    return Object.assign({ before, after: snap(RB.game.s) }, out);
  };
  const roundTrip = (s) => { const c = RB.save.migrate(JSON.parse(JSON.stringify(s))) || JSON.parse(JSON.stringify(s)); return use(c); };
  const sc = C.scenes[ID], cmds = sc.cmds, labels = sc.labels;
  const EN = (i) => (cmds[i] && cmds[i].en) || '';
  // the lines the scene says from a command on, through its next !end (the scene's own order; no jumps inside these)
  const restFrom = (i) => { const r = []; for (let k = i; k < cmds.length && cmds[k].op !== 'end'; k++) if (cmds[k].op === 'say') r.push([cmds[k].who || null, cmds[k].en || '']); return r; };

  // 1. the scene's head and the labels
  {
    const head = cmds.slice(0, 4).map((c) => [c.op, c.args || null, c.if || null]);
    t.ok(flat(head) === flat([['speakerless', ['sa_ushio'], null], ['if', [TOOK, '->', 'ropen_rest'], null], ['if', [LEFT, '->', 'rleave_rest'], null], ['if', ['sa_ren_decided', '->', 'after'], null]]),
      '1 the head: the took jump, then the left jump, both before the "decided" jump ' + flat(head));
    const o = labels.ropen_rest, l = labels.rleave_rest;
    // (on the parent there are no such labels: these read as missing there, not as errors)
    const at = (i) => cmds[i] || { op: null, args: [] };
    const prevO = at(o - 1), prevL = at(l - 1);
    t.ok(o > labels.ropen && prevO.op === 'quest' && flat(prevO.args) === flat(['ren_ushio', 'done']) && at(o - 2).op === 'set' && flat(at(o - 2).args) === flat(['sa_ren_took', 'sa_ren_decided']) && at(o).op === 'music' && at(o).args[0] === 'companion_ren',
      '1 :ropen_rest straight after the took branch\'s flags and quest, at its music ' + flat({ ropen: labels.ropen, ropen_rest: o }));
    t.ok(l > labels.rleave && prevL.op === 'quest' && flat(prevL.args) === flat(['ren_ushio', 'done']) && at(l - 2).op === 'set' && flat(at(l - 2).args) === flat(['sa_ren_left', 'sa_ren_decided']) && at(labels.rleave).op === 'hook' && at(l).op === 'say' && /^…Yes\. The lessons are all here\./.test(EN(l)),
      '1 :rleave_rest straight after the left branch\'s record, flags and quest, at Ren\'s first line ' + flat({ rleave: labels.rleave, rleave_rest: l }));
    // nothing between a label and its branch's end writes to the journey or asks a choice
    const writes = (from) => { const r = []; for (let k = from; k < cmds.length && cmds[k].op !== 'end'; k++) if (['set', 'unset', 'quest', 'give', 'take', 'hook', 'choice', 'goto', 'if', 'var'].includes(cmds[k].op)) r.push(k + ':' + cmds[k].op); return r; };
    t.ok(o != null && l != null && !writes(o).length && !writes(l).length && cmds.slice(o).some((c) => c.op === 'challenge' && c.args[0] === 'sa.ren_reply'),
      '1 from each label to its branch\'s end: no flag, quest, item, record, choice or jump; the reading (sa.ren_reply) on the took branch ' + flat({ took: writes(o), left: writes(l) }));
  }

  // 2. the conditions over every outcome x seen x companion
  {
    const rows = [], bad = [];
    for (const outcome of Object.keys(OUT)) for (const seen of [false, true]) for (const comp of ['ren', 'nao', 'mio', 'suzu', null]) {
      const s = journey(comp, outcome, seen);
      const got = [S.test(s, TOOK), S.test(s, LEFT)];
      const want = [outcome === 'took' && !seen && comp === 'ren', outcome === 'left' && !seen && comp === 'ren'];
      rows.push(got);
      if (flat(got) !== flat(want)) bad.push([outcome, seen, comp, got]);
    }
    t.ok(rows.length === 50 && !bad.length, '2 the two jumps, by RB.state.test over 5 outcomes x seen x 5 companions (50 states): each only for its own outcome, the scene unseen, with Ren ' + flat(bad));
  }

  // 3 + 4. a partial save on each branch, as is and through a save's JSON and the load migration
  const TOOK_REST = restFrom(labels.ropen_rest), LEFT_REST = restFrom(labels.rleave_rest);
  const recovered = (r, rest, reading) => flat(r.said) === flat(rest) && !r.offered.length && !r.toasts.length && !r.hooks.length && flat(r.asked) === flat(reading ? ['sa.ren_reply'] : [])
    && flat(r.after.flags) === flat(r.before.flags) && flat(r.after.quest) === flat([true]) && !r.before.seen && r.after.seen;
  for (const [n, rt] of [['3', false], ['4', true]]) {
    for (const [outcome, rest, reading] of [['took', TOOK_REST, true], ['left', LEFT_REST, false]]) {
      let s = journey('ren', outcome, false);
      if (rt) s = roundTrip(s);
      const r = await run(s);
      t.ok(recovered(r, rest, reading), n + ' Ren, ' + outcome + ', the scene unseen' + (rt ? ', through a save\'s JSON and the load migration' : '') + ': the rest of the branch (' + rest.length + ' lines from "' + ((rest[0] || [])[1] || '').slice(0, 24) + '"), no choice, no banner, no record, the flags and quest as they were, '
        + (reading ? 'the reading asked once, ' : 'no reading, ') + 'seen at the end ' + flat({ said: r.said.length, offered: r.offered, toasts: r.toasts, hooks: r.hooks, asked: r.asked, before: r.before, after: r.after }));
      const r2 = await run(RB.game.s);
      t.ok(r2.said.length === 1 && /^Ren's shelf\. The writing on the label/.test(r2.said[0][1]) && !r2.asked.length && !r2.toasts.length && !r2.offered.length,
        n + ' Ren, ' + outcome + ', recovered: the next use is the "after" line only ' + flat(r2.said));
    }
  }
  t.ok(TOOK_REST.length === 9 && (TOOK_REST[0] || [])[1] === 'Ren opens the folio.' && LEFT_REST.length === 3, '3 the rest of each branch: nine lines from "Ren opens the folio." (took), Ren\'s three lines (left) ' + flat({ took: TOOK_REST.length, left: LEFT_REST.length }));

  // 5. stopped and replayed: a save made inside a replay holds the scene unseen again
  {
    const s = journey('ren', 'took', false);
    const a = await run(s);
    delete RB.game.s.seen[ID];
    const b = await run(RB.game.s);
    t.ok(recovered(a, TOOK_REST, true) && recovered(b, TOOK_REST, true), '5 Ren, took, replayed twice from an unseen scene: the rest of the branch each time, the reading asked each time, no banner, the flags and quest unchanged ' + flat([a.asked, b.asked, a.toasts, b.toasts]));
  }

  // 6. unchanged: first runs, revisits, and every partial state that is not Ren's took/left
  {
    // Ren's three choices (take it back, leave it, you decide); another companion's two (take it home, leave it here)
    const rows = [];
    for (const comp of ['ren', 'nao', 'mio', 'suzu', null]) {
      for (const pn of (comp === 'ren' ? [0, 1, 2] : [0, 1])) { const r = await run(journey(comp, 'none', false), pn); rows.push(['first', comp, pn, r.said, r.offered, r.toasts, r.asked, r.hooks, r.after]); }
      for (const outcome of Object.keys(OUT)) {
        const r = await run(journey(comp, outcome, true));
        rows.push(['revisit', comp, outcome, r.said, r.offered, r.toasts, r.asked, r.hooks, r.after]);
        if ((outcome === 'took' || outcome === 'left') && comp === 'ren') continue;
        if (outcome === 'none') continue;
        const p = await run(journey(comp, outcome, false));
        rows.push(['partial', comp, outcome, p.said, p.offered, p.toasts, p.asked, p.hooks, p.after]);
      }
    }
    const firstRen = rows.find((x) => x[0] === 'first' && x[1] === 'ren' && x[2] === 0);
    const naoTook = rows.find((x) => x[0] === 'partial' && x[1] === 'nao' && x[2] === 'took');
    t.ok(firstRen && firstRen[4].length === 1 && flat(firstRen[5]) === flat(['quest_done']) && flat(firstRen[6]) === flat(['sa.ren_reply']) && naoTook && naoTook[3].length === 1 && /^Ren's shelf\./.test(naoTook[3][0][1]),
      '6 Ren\'s first run: one choice, one quest banner, the reading once; a took outcome with Nao (not reachable in play): the "after" line, not Ren\'s branch ' + flat({ first: firstRen && [firstRen[4].length, firstRen[5], firstRen[6]], nao: naoTook && naoTook[3] }));
    t.ok(fp(rows) === PARENT.runs, '6 every first run (each choice, with each of five companions or none), every revisit (5 outcomes x the same five) and every other partial state (' + rows.filter((x) => x[0] === 'partial').length + '), line for line, choice, banner, reading, record and journey state, as on the parent ' + flat({ n: rows.length, fp: fp(rows) }));
  }

  // 7. the text: the scene without the two jumps; every other scene; the shelf's lines and keys
  {
    const NEW = new Set(['ropen_rest', 'rleave_rest']);
    // source line numbers set aside wherever they are kept (a command's own, and each choice option's)
    const noLine = (x) => JSON.parse(JSON.stringify(x, (k, v) => (k === 'line' ? undefined : v)));
    const isJump = (c) => c.op === 'if' && (c.args[0] === TOOK || c.args[0] === LEFT);
    const drop = []; cmds.forEach((c, i) => { if (isJump(c)) drop.push(i); });
    const kept = noLine(cmds.filter((c) => !isJump(c)));
    const shift = (i) => i - drop.filter((d) => d < i).length;
    const labs = Object.keys(labels).filter((k) => !NEW.has(k)).sort().map((k) => [k, shift(labels[k])]);
    t.ok(drop.length === 2 && fp([kept, labs]) === PARENT.scene, '7 the scene without the two jumps and their labels: the same commands and labels as on the parent ' + flat({ drop, fp: fp([kept, labs]) }));
    const others = Object.keys(C.scenes).filter((k) => k !== ID).sort().map((k) => [k, noLine(C.scenes[k].cmds), C.scenes[k].labels || null]);
    t.ok(others.length === PARENT.others[0] && fp(others) === PARENT.others[1], '7 every other scene: its commands and labels as on the parent (line numbers aside) ' + flat({ n: others.length, fp: fp(others) }));
    const lines = cmds.filter((c) => c.op === 'say').map((c) => [c.who || null, c.expr || null, keyOf(ID, c.jp), c.en, c.if || null]);
    t.ok(lines.length === 31 && fp(lines) === PARENT.lines, '7 the shelf\'s 31 lines and their voice keys, as on the parent ' + flat({ n: lines.length, fp: fp(lines) }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
