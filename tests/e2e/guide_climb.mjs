// RBN-QA-099 (Agnes 6337095228, 6337348871; Local CL-181; Cloud CC-106, CC-109): on the Cloudroad, climbing station by
// station, the Journey's next step named Kirishita throughout. It now names the furthest station's own work
// (tests/unit/cr_guide_climb.test.mjs walks every step of all five stations). In Chromium on the built game, reading
// the guide as the Journey and the markers do (its targets, the "Next" lines, the markers on the map):
//  1. Oiwake before the ledger: Kanbe in the relay office;
//  2. Suginoki with Kanbe's message not yet delivered: Ine, marked;
//  3. Nakayama with its lamp unnamed: the everlasting lamp, marked; never Kirishita;
//  4. Nakayama with its work done but the road not planned: the way east, marked at (34,12);
//  5. back down at Suginoki by palanquin with Nakayama's lamp still unnamed: still Nakayama's lamp;
//  6. Umagaeshi planned (the fog waited out): Kirishita;
//  7. a save and load keeps the same answer; reading the guide changes no flag or quest; every person named is there;
//  8. stage 3 (Kirishita reached) as derived before, not the climb's steps; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_climb.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);

const BEFORE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_kanbe_met: true };
// stations 1 .. n-1 done (lamp, message, plan; the message from below delivered), station n reached, plus `at`
function flagsAt(n, at) {
  const f = Object.assign({}, BEFORE);
  for (let k = 1; k < n; k++) { Object.assign(f, { ['cr_st' + k]: true, ['cr_lamp' + k]: true, ['cr_given' + k]: true, ['cr_plan' + k]: true }); if (k > 1) f['relay_cr_r' + (k - 1) + '_done'] = true; }
  f['cr_st' + n] = true;
  for (const x of at || []) f[x] = true;
  return f;
}
async function guide(map, x, y, flags, stage, o = {}) {
  return p.evaluate(async ([map, x, y, flags, stage, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp: 'mio', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    if (!o.noLedger) s.inv.cr_ledger = 1;
    s.inv.cr_papers = 1;
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'cr_main', stage); s.quests.cr_main.t = Date.now();
    if (o.save) { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); }
    const S = RB.game.s;
    RB.questGuide.reset(); RB.questMarks.refresh();
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); }
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 200));
    const before = JSON.stringify([S.flags, S.quests, S.inv]);
    const G = RB.questGuide, r = G.targets('cr_main');
    const next = G.nextLines(r).map((l) => l.en);
    G.nudges('cr_main', S);
    const marks = RB.questMarks.marks().marks.map((k) => ({ kind: k.kind, id: k.id, tx: k.tx, ty: k.ty, dir: k.dir }));
    const after = JSON.stringify([S.flags, S.quests, S.inv]);
    const live = r.targets.every((tg) => {
      if (tg.kind !== 'npc') return true;
      const n = (RB.content.maps[tg.map].npcs || []).find((q) => q.id === tg.id);
      return !!n && (!n.if || RB.state.test(S, n.if));
    });
    return { how: r.how, map: RB.world.W.map.id, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, marks, pure: before === after, live };
  }, [map, x, y, flags, stage, o]);
}
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next, marks: r.marks.slice(0, 3) });
const kirishita = (r) => r.targets.some((t) => /^cr\.kirishita/.test(t)) || r.next.some((l) => /Kirishita/.test(l));
const all = [];

const r1 = await guide('cr.oiwake', 17, 13, flagsAt(1, []), 2, { noLedger: true });
ok(r1.targets.join() === 'cr.oiwake_post:cr_kanbe@4,3' && !kirishita(r1) && r1.next.some((l) => /Kanbe/.test(l)), '1. Oiwake, no ledger yet: Kanbe in the relay office (' + sum(r1) + ')');
const r2 = await guide('cr.suginoki', 17, 13, flagsAt(2, ['cr_given1']), 2);
ok(r2.targets.join() === 'cr.suginoki:cr_ine@13,14' && !kirishita(r2) && r2.marks.length > 0, '2. Suginoki, Kanbe\'s message not yet delivered: Ine, marked (' + sum(r2) + ')');
const r3 = await guide('cr.nakayama', 17, 13, flagsAt(4, ['cr_given3', 'relay_cr_r3_done']), 2);
ok(r3.targets.join() === 'cr.nakayama:cr_joyato@32,15' && !kirishita(r3) && r3.marks.length > 0 && r3.next.some((l) => /everlasting lamp/.test(l)), '3. Nakayama, its lamp unnamed: the everlasting lamp, marked; not Kirishita (' + sum(r3) + ')');
const r4 = await guide('cr.nakayama', 17, 13, flagsAt(4, ['cr_given3', 'relay_cr_r3_done', 'cr_lamp4', 'cr_given4']), 2);
ok(r4.targets.join() === 'cr.nakayama:spot@34,12' && !kirishita(r4) && r4.marks.some((m) => m.tx === 34 && m.ty === 12), '4. Nakayama, its work done, the road not planned: the way east, marked at (34,12) (' + sum(r4) + ')');
const r5 = await guide('cr.suginoki', 9, 12, flagsAt(4, ['cr_given3', 'relay_cr_r3_done']), 2);
ok(r5.targets.join() === 'cr.nakayama:cr_joyato@32,15' && !kirishita(r5), '5. back down at Suginoki by palanquin: still Nakayama\'s lamp (' + sum(r5) + ')');
const r6 = await guide('cr.umagaeshi', 17, 13, flagsAt(5, ['cr_given4', 'relay_cr_r4_done', 'cr_lamp5', 'cr_given5', 'cr_plan5']), 2);
ok(r6.targets.join() === 'cr.kirishita:enter' && r6.next.some((l) => /Kirishita/.test(l)), '6. Umagaeshi, the road planned (the fog waited out): Kirishita (' + sum(r6) + ')');
const r7 = await guide('cr.nakayama', 17, 13, flagsAt(4, ['cr_given3', 'relay_cr_r3_done']), 2, { save: true });
ok(r7.targets.join() === r3.targets.join() && r7.next.join() === r3.next.join(), '7. saved and loaded at Nakayama: the same answer (' + sum(r7) + ')');
all.push(r1, r2, r3, r4, r5, r6, r7);
ok(all.every((r) => r.pure && r.live), '7. reading the guide changes no flag, quest or item; every person named is there (' + JSON.stringify(all.map((r) => [r.pure, r.live])) + ')');
const r8 = await guide('cr.kirishita', 17, 13, Object.assign(flagsAt(5, ['cr_given4', 'relay_cr_r4_done', 'cr_lamp5', 'cr_given5', 'cr_plan5']), { cr_st6: true }), 3);
ok(r8.how !== 'authored' && !r8.targets.some((t) => /cr_joyato|spot@34,12|cr_genji/.test(t)), '8. stage 3 (Kirishita reached): as derived, not the climb\'s steps (' + sum(r8) + ')');

ok(errors.length === 0, 'no page errors' + (errors.length ? ' (' + errors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
