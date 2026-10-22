// RBN-QA-081 (Agnes 6332190763; data-only scope agreed by Agnes 6332266848, Local CL-155–CL-157, Cloud CC-084, CC-086):
// at Kotonoha's stage 3 (gather four tellings, hang them in the keepers' hall) the guide named the next chapter's tide
// ("Next: The Tidal Hollow — no way there from here just now"), because the exhibition's flag is set inside the
// tellings sheet, which the guide cannot see. The stage now names its own next place (`atIf`). In Chromium on the built
// game, reading the guide (its targets, the Next line, the first nudge, the markers):
//  1. every combination of the four tellings and the three conches heard (72 states): the first telling still missing in
//     Otoha's order (Otoha, Nami, Hamaji), then the first conch not yet heard, then a conch again once all three are heard
//     but their sheet was left, then the hall's desk; with the panels hung, Otoha. Never "The Tidal Hollow", never "no way
//     there"; the place is marked; each target is live; reading the guide changes nothing;
//  2. from the hall and from the tide pools, the same answers;
//  3. a save and load mid-stage keeps the answer;
//  4. the real way on: the exhibition hung at the desk (the tellings sheet answered as the automated runs do) sets the
//     flag and the guide turns to Otoha; her talk opens the hollow (stage 4), and stage 4's guidance leaves stage 3's
//     places for the Whispering Hollow's drifting leaf (RBN-QA-086, tests/e2e/guide_roots_leaf.mjs); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_tellings.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);

const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true };
async function guide(map, x, y, flags, o = {}) {
  return p.evaluate(async ([map, x, y, flags, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'down', edition: RB.edition.forNew(), comp: 'suzu', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'ko_main', o.stage != null ? o.stage : 3);
    if (o.save) { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); }
    const S = RB.game.s;
    RB.questGuide.reset(); RB.questMarks.refresh();
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); }
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 150));
    const before = JSON.stringify([S.flags, S.quests, S.vars]);
    const G = RB.questGuide, r = G.targets('ko_main');
    const next = G.nextLines(r).map((l) => l.en);
    const nudge1 = ((G.nudges('ko_main', S).lines || [])[0] || []).map((l) => l.en);
    const marks = RB.questMarks.marks().marks.length;
    const after = JSON.stringify([S.flags, S.quests, S.vars]);
    const live = r.targets.every((tg) => {
      if (tg.kind !== 'npc') return true;
      const n = (RB.content.maps[tg.map].npcs || []).find((q) => q.id === tg.id);
      return !!n && (!n.if || RB.state.test(S, n.if));
    });
    return { how: r.how, stage: S.quests.ko_main.stage, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, nudge1, marks, pure: before === after, live };
  }, [map, x, y, flags, o]);
}
const wrong = (r) => r.next.concat(r.nudge1).some((l) => /Tidal Hollow|no way there/i.test(l));
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next, nudge1: r.nudge1, marks: r.marks });
const TELL = ['otoha', 'nami', 'hamaji', 'shell'], SHELL = ['a', 'b', 'c'];
const CONCH = { a: 'ko.tidepools:ko_conch@7,9', b: 'ko.tidepools:ko_conch@18,15', c: 'ko.tidepools:ko_conch@24,11' };
function stateOf(tk, ck, hung) {
  const f = Object.assign({}, KO);
  TELL.forEach((n, i) => { if (tk & (1 << i)) f['ko_tell_' + n] = true; });
  SHELL.forEach((n, i) => { if (ck & (1 << i)) f['ko_shell_' + n] = true; });
  if (hung) f['tell_ko.t_hall_ok'] = true;
  return f;
}
function expected(f) {
  if (f['tell_ko.t_hall_ok']) return 'ko.village:ko_otoha';
  for (const n of ['otoha', 'nami', 'hamaji']) if (!f['ko_tell_' + n]) return 'ko.village:ko_' + n;
  if (!f.ko_tell_shell) { for (const n of SHELL) if (!f['ko_shell_' + n]) return CONCH[n]; return CONCH.a; }
  return 'ko.hall:desk@11,6';
}
const label = (f) => (TELL.filter((n) => f['ko_tell_' + n]).join('+') || 'no tellings') + (f.ko_tell_shell ? '' : ' / conches heard: ' + (SHELL.filter((n) => f['ko_shell_' + n]).join('') || 'none')) + (f['tell_ko.t_hall_ok'] ? ' / hung' : '');

// 1. every combination, from the village
const states = [];
for (let tk = 0; tk < 16; tk++) for (const ck of (tk & 8) ? [7] : [0, 1, 2, 3, 4, 5, 6, 7]) states.push(stateOf(tk, ck, false));
states.push(stateOf(15, 7, true));
let all = true;
for (const f of states) {
  const r = await guide('ko.village', 20, 14, f);
  const want = expected(f);
  const good = r.stage === 3 && r.how === 'authored' && r.targets.length === 1 && r.targets[0].indexOf(want) === 0 && !wrong(r) && r.next.length > 0 && r.nudge1.length > 0 && r.marks > 0 && r.live && r.pure;
  if (!good) all = false;
  ok(good, 'stage 3, ' + label(f) + ': ' + want + ' (' + sum(r) + ')');
}
ok(all && states.length === 73, 'all ' + states.length + ' stage-3 states name their own next place, never The Tidal Hollow');

// 2. from the hall and the tide pools
for (const [map, x, y] of [['ko.hall', 8, 8], ['ko.tidepools', 30, 11]]) for (const f of [stateOf(1, 0, false), stateOf(7, 3, false), stateOf(7, 7, false), stateOf(15, 7, false), stateOf(15, 7, true)]) {
  const r = await guide(map, x, y, f);
  const want = expected(f);
  ok(r.targets.length === 1 && r.targets[0].indexOf(want) === 0 && !wrong(r) && r.marks > 0 && r.pure, 'from ' + map + ', ' + label(f) + ': ' + want + ' (' + sum(r) + ')');
}

// 3. a save and load mid-stage
{
  const f = stateOf(7, 1, false);
  const r = await guide('ko.village', 20, 14, f, { save: true });
  ok(r.targets.length === 1 && r.targets[0] === CONCH.b && !wrong(r) && r.stage === 3, 'after a save and load: the same next place (the second conch) (' + sum(r) + ')');
}

// 4. the real way on: the exhibition hung, Otoha opens the hollow, stage 4 to the drifting leaf (RBN-QA-086)
{
  const run = await p.evaluate(async (flags) => {
    const s = RB.game.debugStart('ko.hall', 11, 7, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags });
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'ko_main', 3);
    RB.test.enable({ choose: () => 0 });
    const said = [];
    await RB.script.run('ko.hall_exhibit');
    const hung = !!RB.game.s.flags['tell_ko.t_hall_ok'];
    RB.questGuide.reset();
    const g1 = RB.questGuide.targets('ko_main');
    const toOtoha = g1.targets.map((t) => t.map + ':' + (t.id || t.p));
    RB.world.enter('ko.village', 24, 17, 'up', { fresh: true });
    await RB.script.run('ko.otoha_tellings');
    const stage = RB.game.s.quests.ko_main.stage;
    RB.questGuide.reset();
    const g2 = RB.questGuide.targets('ko_main');
    RB.test.disable();
    return { hung, toOtoha, stage, how4: g2.how, t4: g2.targets.map((t) => t.map + ':' + (t.id || t.p || t.kind)), next4: RB.questGuide.nextLines(g2).map((l) => l.en), hollow: !!RB.game.s.flags.ko_hollow_open };
  }, stateOf(15, 7, false));
  ok(run.hung && run.toOtoha.length === 1 && run.toOtoha[0] === 'ko.village:ko_otoha', 'the exhibition hung at the desk: the flag set, and the guide turns to Otoha (' + JSON.stringify(run) + ')');
  ok(run.stage === 4 && run.hollow && run.t4.length === 1 && run.t4[0] === 'ko.roots1:ko_current' && !run.t4.some((t) => /^ko\.(village|hall|tidepools):/.test(t)), 'Otoha opens the hollow: stage 4, guided to the drifting leaf (RBN-QA-086), not to a stage-3 place (' + JSON.stringify(run) + ')');
}

ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
