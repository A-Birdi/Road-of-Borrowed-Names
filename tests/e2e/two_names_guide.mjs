// Two Names' first step (CC-023 matrix entry 151; CC-223, Agnes 6393575502, Local CL-343, CL-359): RBN-QA-004 gave the
// step an unconditional `at` (the Lantern Hall), which held after the gathering and the companion choice too, so the
// guide kept saying to enter the hall and never marked the shrine where the step ends. The step now names the hall only
// while the gathering or the choice is still to come (`atIf`: the shrine turns you away before both), then the
// derivation finds the shrine. In Chromium on the built game, reading the guide (the Next line, its targets, the
// markers):
//  1. before the gathering, from the village: the Lantern Hall, and a marker on the way there;
//  2. after the gathering, no one chosen yet, in the hall: still the hall (never the "can't take this further" nudge);
//  3. after the gathering with a companion chosen: the shrine (4,2), in the hall with its marker on the shrine, and from
//     the village with a marker on the way;
//  4. the next stage, as before: the coast road;
//  5. a save made between the gathering and the choice, loaded: still the hall; reading the guide changes no flag or
//     quest; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/two_names_guide.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);

async function guide(map, x, y, flags, quests, qid, o = {}) {
  return p.evaluate(async ([map, x, y, flags, quests, qid, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp: o.comp || null, flags });
    if (o.prov) s.provisional = o.prov;
    RB.game.settings.textSpeed = 'instant';
    let t = Date.now() - 100000;
    for (const [q, v] of quests) { RB.state.setQuest(s, q, v); s.quests[q].t = (t += 1000); }
    if (o.save) { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); }
    const S = RB.game.s;
    RB.questGuide.reset(); RB.questMarks.refresh();
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); }
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 200));
    const before = JSON.stringify([S.flags, S.quests, S.provisional || null]);
    const G = RB.questGuide, r = G.targets(qid);
    const next = G.nextLines(r).map((l) => l.en);
    const N = G.nudges(qid, S);
    const marks = RB.questMarks.marks().marks.map((k) => ({ kind: k.kind, target: k.target, id: k.id, map: k.map, tx: k.tx, ty: k.ty, to: k.to, edge: k.edge }));
    const after = JSON.stringify([S.flags, S.quests, S.provisional || null]);
    return { how: r.how, stage: S.quests[qid].stage, map: S.map, prov: S.provisional || null, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, nudge: N.lines.map((ls) => ls.map((l) => l.en)), markable: N.markable, marks, pure: before === after };
  }, [map, x, y, flags, quests, qid, o]);
}
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next, marks: r.marks.slice(0, 3) });
const waiting = (r) => r.how === 'waiting' || r.nudge.some((ls) => ls.some((l) => /take this further/.test(l)));

// the evening before the departure: the mill's echo answered, the evening come (the hall's gathering waits on entering)
const EVE = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_echo_done: true, rw_evening: true, rw_koji_back: true, bridge_fixed: true };
const GATHERED = Object.assign({}, EVE, { rw_hall_gather: true, 'enter:rw.hall:rw.hall_gather': true });

// 1. before the gathering
{
  const r = await guide('rw.village', 22, 12, EVE, [['rw_depart', 0]], 'rw_depart');
  ok(r.how === 'authored' && r.targets.length === 1 && r.targets[0] === 'rw.hall:enter' && r.markable && r.next.some((l) => /Lantern Hall/.test(l)) && !waiting(r), 'before the gathering, in the village: the Lantern Hall (' + sum(r) + ')');
  ok(r.marks.some((k) => k.kind === 'exit' && k.to === 'rw.hall'), '… with a marker on the way into the hall (' + JSON.stringify(r.marks) + ')');
  ok(r.pure, '… and reading the guide changes nothing');
}
// 2. after the gathering, no one chosen yet
{
  const r = await guide('rw.hall', 5, 6, GATHERED, [['rw_depart', 0]], 'rw_depart');
  ok(r.how === 'authored' && r.targets[0] === 'rw.hall:enter' && !waiting(r) && r.next.some((l) => /Lantern Hall/.test(l)), 'after the gathering, no one chosen yet, in the hall: still the hall, not the waiting nudge (' + sum(r) + ')');
  ok(!r.targets.some((t) => /shrine/.test(t)) && !r.marks.some((k) => k.id === 'shrine'), '… and the shrine (which would turn you away) is not marked (' + JSON.stringify(r.marks) + ')');
}
// 3. after the gathering, a companion chosen
{
  const r = await guide('rw.hall', 5, 6, GATHERED, [['rw_depart', 0]], 'rw_depart', { prov: 'nao' });
  ok(r.how === 'direct' && r.targets.length === 1 && r.targets[0] === 'rw.hall:shrine@4,2' && r.markable && r.next.some((l) => /shrine/.test(l)) && !waiting(r), 'after the gathering, Nao chosen, in the hall: the shrine (' + sum(r) + ')');
  ok(r.marks.some((k) => !k.edge && k.kind === 'target' && k.target === 'prop' && k.id === 'shrine' && k.map === 'rw.hall'), '… with its marker on the shrine, in view (' + JSON.stringify(r.marks) + ')');
  const v = await guide('rw.village', 22, 12, GATHERED, [['rw_depart', 0]], 'rw_depart', { prov: 'nao' });
  ok(v.targets.length === 1 && v.targets[0] === 'rw.hall:shrine@4,2' && v.marks.some((k) => k.kind === 'exit' && k.to === 'rw.hall'), '… and from the village: the shrine, a marker on the way into the hall (' + sum(v) + ')');
  ok(r.pure && v.pure, '… reading the guide changes nothing');
}
// 4. the next stage, as before
{
  const r = await guide('rw.road', 26, 9, Object.assign({}, GATHERED, { ch1_done: true, departed: true }), [['rw_depart', 1]], 'rw_depart', { comp: 'nao' });
  ok(r.how === 'authored' && r.targets.length === 1 && r.targets[0] === 'sg.road:enter', 'rw_depart 1: the coast road, as before (' + sum(r) + ')');
}
// 5. a save between the gathering and the choice, loaded
{
  const r = await guide('rw.hall', 5, 6, GATHERED, [['rw_depart', 0]], 'rw_depart', { save: true });
  ok(r.map === 'rw.hall' && !r.prov && r.how === 'authored' && r.targets[0] === 'rw.hall:enter' && !waiting(r), 'a save made between the gathering and the choice, loaded: still the hall (' + sum(r) + ')');
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
console.log(`\ntwo_names_guide: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
