// RBN-QA-068 (Agnes 6313998295; Local CL-102; Cloud CC-057): after Akari gives the key, the Journey said to search the
// basement stacks (stairs behind the counter) while the guide said "Next: Belfry Loft — no way there from here just
// now": the stacks were unreachable behind their shut stairs, so the derivation looked on to the tower's arrival.
// `lf_main` stage 3 now names the stairs while they are shut (authored atIf, data only); once they are open the
// derivation is as before. In Chromium on the built game, reading the guide (its Next line and targets), with the
// tower's arrival unseen (no arrival scenes marked as seen):
//  1. the stairs shut, in the Records Hall and out in the town: the stairs at (14,3) in the Public Records Hall, named
//     ("the stairs"), never "no way there"; the target is there in this state; reading changes nothing; a save and
//     load gives the same answer;
//  2. the stairs open: the chest and the channel; with the minutes, the channel; with the channel seen, the chest;
//     both (stage 4), Tami: each exactly as before (CC-012);
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_stacks.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);
const LF = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, lf_arrived: true, lf_town_intro: true, lf_akari_key: true };

async function guide(map, x, y, flags, items, stage, o = {}) {
  return p.evaluate(async ([map, x, y, flags, items, stage, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags });
    for (const it of items) RB.state.give(s, it, 1);
    RB.state.setQuest(s, 'lf_main', stage);
    if (o.save) { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); }
    const S = RB.game.s;
    RB.questGuide.reset(); RB.questMarks.refresh();
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); }
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 200));
    const before = JSON.stringify([S.flags, S.quests, S.inv]);
    const G = RB.questGuide, r = G.targets('lf_main');
    const next = G.nextLines(r).map((l) => l.en);
    const after = JSON.stringify([S.flags, S.quests, S.inv]);
    // the target stands there in this state
    const live = r.targets.every((tg) => tg.kind !== 'prop' || (RB.content.maps[tg.map].props || []).some((q) => q.p === tg.p && q.x === tg.x && q.y === tg.y && (!q.if || RB.state.test(S, q.if))));
    const unseen = !Object.keys(S.flags).some((f) => /^enter:lf\.tower/.test(f));
    return { how: r.how, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, pure: before === after, live, unseen };
  }, [map, x, y, flags, items, stage, o]);
}
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next });
const nowhere = (r) => r.next.some((l) => /no way there/i.test(l));
const at = (f) => Object.assign({}, LF, f);

// 1. the stairs shut
for (const [name, map, x, y, o] of [['in the Records Hall', 'lf.records', 8, 9, {}], ['out in the town', 'lf.town', 11, 12, {}], ['in the Records Hall, after a save and load', 'lf.records', 8, 9, { save: true }]]) {
  const r = await guide(map, x, y, at({}), ['lf_stacks_key'], 3, o);
  ok(r.how === 'authored' && r.targets.join() === 'lf.records:stairs@14,3' && /^Next: the stairs, in Public Records Hall/.test(r.next[0] || '') && !nowhere(r) && r.live && r.pure && r.unseen, 'the stairs shut, ' + name + ': the stairs behind the counter, named, never "no way there" (' + sum(r) + ')');
}
// 2. the stairs open: as before
for (const [name, map, flags, items, stage, targets, line] of [
  ['open, nothing found yet', 'lf.records', { lf_stacks_open: true }, ['lf_stacks_key'], 3, 'lf.stacks:chest@21,2,lf.stacks:lf_conduit@22,6,lf.stacks:lf_conduit@22,7,lf.stacks:lf_conduit@22,8', /^Next: the chest, in Basement Stacks/],
  ['open, the minutes found', 'lf.stacks', { lf_stacks_open: true }, ['lf_stacks_key', 'lf_minutes'], 3, 'lf.stacks:lf_conduit@22,6,lf.stacks:lf_conduit@22,7,lf.stacks:lf_conduit@22,8', /^Next: the channel, in Basement Stacks/],
  ['open, the channel seen', 'lf.stacks', { lf_stacks_open: true, lf_conduit_seen: true }, ['lf_stacks_key'], 3, 'lf.stacks:chest@21,2', /^Next: the chest, in Basement Stacks/],
  ['both found (stage 4)', 'lf.stacks', { lf_stacks_open: true, lf_conduit_seen: true }, ['lf_stacks_key', 'lf_minutes'], 4, 'lf.council:lf_yae@6,3', /^Next: Councillor Tami, in Council Chamber/],
]) {
  const r = await guide(map, map === 'lf.records' ? 8 : 2, map === 'lf.records' ? 9 : 4, at(flags), items, stage);
  ok(r.how !== 'authored' && r.targets.join() === targets && line.test(r.next[0] || '') && !nowhere(r) && r.pure, name + ': as before (' + sum(r) + ')');
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
console.log(`\nguide_stacks: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
