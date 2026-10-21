// RBN-QA-069 (Agnes 6314567342/6315323517; Local CL-105; Cloud CC-058): in the Drowned Archive's Receiving Hall, before
// the catalogue is put in order, sg_main stage 8 said "Next: The Tide Clerk, in Drowned Archive — Returns Counter — no
// way there from here just now": the inner door (11,0) stays locked until the catalogue (sg_da_catalog), so the
// derivation looked past it. Stage 8 now names the spot in front of that door while it is shut (authored atIf, data
// only); the door's own line names the catalogue cabinet, and the drawers and the puzzle are not marked. Once the
// catalogue is done, derived as before. In Chromium on the built game, reading the guide, with the arrival seen as play
// leaves it (no other arrival marked):
//  1. before the catalogue, with each companion (Ren, Nao, Mio, Suzu), standing in the hall and at the drawers: the
//     spot (11,1) in the Receiving Hall, never "no way there"; reading changes nothing; a save and load gives the same;
//  2. after the catalogue: the Tide Clerk and the trigger in the vault, as before (CC-012); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_archive.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);
const SG = { departed: true, ch1_done: true, sg_arrived: true, sg_da_seen: true };

async function guide(x, y, comp, flags, o = {}) {
  return p.evaluate(async ([x, y, comp, flags, o]) => {
    const s = RB.game.debugStart('sg.da_entry', x, y, { dir: 'up', edition: RB.edition.forNew(), comp, flags });
    RB.state.setQuest(s, 'sg_main', 8);
    if (o.save) { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); }
    const S = RB.game.s;
    RB.questGuide.reset(); RB.questMarks.refresh();
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); }
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 200));
    const before = JSON.stringify([S.flags, S.quests]);
    const G = RB.questGuide, r = G.targets('sg_main');
    const next = G.nextLines(r).map((l) => l.en);
    const after = JSON.stringify([S.flags, S.quests]);
    return { how: r.how, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, pure: before === after, stage: S.quests.sg_main.stage };
  }, [x, y, comp, flags, o]);
}
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next });
const nowhere = (r) => r.next.some((l) => /no way there/i.test(l));
const door = (r) => r.how === 'authored' && r.targets.join() === 'sg.da_entry:spot@11,1' && /Receiving Hall/.test(r.next[0] || '') && !nowhere(r) && r.pure;

// 1. before the catalogue
for (const comp of ['ren', 'nao', 'mio', 'suzu']) {
  for (const [where, x, y] of [['in the hall', 11, 15], ['at the drawers', 11, 4]]) {
    const r = await guide(x, y, comp, Object.assign({}, SG));
    ok(door(r), comp + ', ' + where + ', before the catalogue: the inner door\'s spot in the Receiving Hall, never "no way there" (' + sum(r) + ')');
  }
}
{
  const r = await guide(11, 15, 'suzu', Object.assign({}, SG), { save: true });
  ok(door(r), 'after a save and load: the same (' + sum(r) + ')');
}
// 2. after the catalogue: as before
for (const comp of ['ren', 'nao', 'mio', 'suzu']) {
  const r = await guide(11, 15, comp, Object.assign({}, SG, { sg_da_catalog: true }));
  ok(r.how !== 'authored' && r.targets.some((t) => /^sg\.da_vault:/.test(t)) && !nowhere(r) && r.pure, comp + ', after the catalogue: derived as before (' + sum(r) + ')');
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
console.log(`\nguide_archive: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
