// RBN-QA-086 (Cloud CC-087 finding A; numbered by Agnes 6332916876, ordinary-play corroboration 6333031332; Local
// CL-162; Agnes 6332919869): at Kotonoha's stage 4 (Otoha has opened the hollow: go down into the Root Hollows) the
// next step, the tide splitting the party in the Tidal Hollow, lies behind the Whispering Hollow's way down, shut
// until its drifting leaf has its word back (ko_root_a). The guide does not route through a shut way, so it said "Next:
// The Tidal Hollow — no way there from here just now". The stage now names the drifting leaf (ko.roots1 4,10) until
// then, and is derived as before after. In Chromium on the built game, reading the guide (its targets, the Next line,
// the first nudge, the markers):
//  1. from the village, the crown and the Whispering Hollow itself, before the leaf: the drifting leaf, never "The
//     Tidal Hollow", never "no way there"; the place is marked; reading the guide changes nothing;
//  2. the same places after the leaf: derived as before, direct to the tide's trigger (ko.roots2 15,12);
//  3. a save and load before the leaf keeps the answer;
//  4. the real way on: the leaf's scene played (its challenge answered as the automated runs do) sets ko_root_a, and
//     the guide turns to the Tidal Hollow, with a way there; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_roots_leaf.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);

const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true,
  ko_tell_otoha: true, ko_tell_nami: true, ko_tell_hamaji: true, ko_tell_shell: true, 'tell_ko.t_hall_ok': true, ko_hollow_open: true, ko_roots_seen: true };
const LEAF = 'ko.roots1:ko_current@4,10', TIDE = 'ko.roots2:trigger@15,12';
const PLACES = [['ko.village', 20, 14], ['ko.crown', 18, 24], ['ko.roots1', 14, 2]];
async function guide(map, x, y, flags, o = {}) {
  return p.evaluate(async ([map, x, y, flags, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'down', edition: RB.edition.forNew(), comp: 'suzu', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'ko_main', 4);
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
    return { how: r.how, stage: S.quests.ko_main.stage, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, nudge1, marks, pure: before === after };
  }, [map, x, y, flags, o]);
}
const wrong = (r) => r.next.concat(r.nudge1).some((l) => /Tidal Hollow|no way there/i.test(l));
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next, nudge1: r.nudge1, marks: r.marks });

// 1. before the leaf
for (const [map, x, y] of PLACES) {
  const r = await guide(map, x, y, KO);
  ok(r.stage === 4 && r.how === 'authored' && r.targets.length === 1 && r.targets[0] === LEAF && !wrong(r) && r.next.length > 0 && r.nudge1.length > 0 && r.marks > 0 && r.pure, 'stage 4 from ' + map + ', before the leaf: the drifting leaf, never The Tidal Hollow (' + sum(r) + ')');
}
// 2. after the leaf: derived as before
for (const [map, x, y] of PLACES) {
  const r = await guide(map, x, y, Object.assign({ ko_root_a: true }, KO));
  ok(r.stage === 4 && r.how === 'direct' && r.targets.length === 1 && r.targets[0] === TIDE && !r.next.some((l) => /no way there/i.test(l)) && r.pure, 'stage 4 from ' + map + ', after the leaf: derived as before, direct to the tide (' + sum(r) + ')');
}
// 3. a save and load before the leaf
{
  const r = await guide('ko.crown', 18, 24, KO, { save: true });
  ok(r.stage === 4 && r.targets.length === 1 && r.targets[0] === LEAF && !wrong(r), 'after a save and load: the same next place (the drifting leaf) (' + sum(r) + ')');
}
// 4. the real way on
{
  const run = await p.evaluate(async (flags) => {
    const s = RB.game.debugStart('ko.roots1', 5, 10, { dir: 'left', edition: RB.edition.forNew(), comp: 'suzu', flags });
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'ko_main', 4);
    RB.questGuide.reset();
    const g0 = RB.questGuide.targets('ko_main');
    RB.test.enable({ choose: () => 0 });
    await RB.script.run('ko.root_leaf_a');
    RB.test.disable();
    RB.questGuide.reset();
    const g1 = RB.questGuide.targets('ko_main');
    return { before: g0.targets.map((t) => t.map + ':' + (t.id || t.p || t.kind)), rootA: !!RB.game.s.flags.ko_root_a, how: g1.how, after: g1.targets.map((t) => t.map + ':' + (t.id || t.p || t.kind) + (t.x != null ? '@' + t.x + ',' + t.y : '')), next: RB.questGuide.nextLines(g1).map((l) => l.en), stage: RB.game.s.quests.ko_main.stage };
  }, KO);
  ok(run.before[0] === 'ko.roots1:ko_current' && run.rootA && run.stage === 4 && run.how === 'direct' && run.after[0] === TIDE && run.next.length > 0 && !run.next.some((l) => /no way there/i.test(l)), 'the leaf\'s word given back: ko_root_a set, and the guide turns to the Tidal Hollow with a way there (' + JSON.stringify(run) + ')');
}

ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
