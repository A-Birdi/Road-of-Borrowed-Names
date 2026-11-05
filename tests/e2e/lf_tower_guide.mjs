// The bell tower's guidance, in Chromium (Agnes 6548995370; Cloud CC-412; Local CL-571 and CL-572; Agnes 6549259814).
// Inside the tower, step 7 now names the plate of the first gate still shut (A, then B, then C) instead of only
// "wait"; after C the guide finds the Bell Chamber as before. On the built game, on throwaway journeys (never a real
// save), reading the Journey's followed quest (its "Next" lines) and the world markers, the moves made by the game's own
// transition and a save made and loaded through the game's own save and load; each journey carries what a journey has
// by step 7 (Tokuji's boat lent, the stacks open, the ledger and the channel seen):
//  1. no gates, on the Upper Floor: "Next" names the Upper Floor, and the marker is over plate A;
//  2. gate A, in the Gate Works: the Gate Works, the marker over plate B; then out of the tower to the sluice (the Gate
//     Works named, never "no way there") and back in by the game's own moves: the same; a save and load: the same;
//  3. gates A and B, on the Drowned Stair: the Drowned Stair, the marker over plate C;
//  4. gates A, B and C, on the Drowned Stair: "Next" names the bell in the Bell Chamber, as before; no plate marked;
//  5. in none of these the waiting state ("No marker for this step yet"); reading changes nothing; no page errors, no
//     network.
// Usage: node tools/build.mjs && node tests/e2e/lf_tower_guide.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const BASE = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true, lf_yae_told: true, lf_tokuji_told: true,
  lf_tokuji_boat: true, lf_akari_key: true, lf_stacks_open: true, lf_ledger_seen: true, lf_conduit_seen: true, lf_tower_entered: true };

async function at(p, map, x, y, flags) {
  await p.evaluate(async ([map, x, y, flags]) => {
    const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'nao', dir: 'down', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'lf_main', 7);
    RB.questGuide.reset(); RB.questMarks.refresh();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, [map, x, y, flags]);
}
const move = (p, map, x, y) => p.evaluate(async ([map, x, y]) => {
  await RB.test.idle();
  await RB.game.transition(map, x, y, 'down', {});
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  RB.questMarks.refresh();
  return RB.world.W.map.id;
}, [map, x, y]);
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 900));
  await RB.test.idle();
  RB.questMarks.refresh();
  return RB.world.W.map.id;
});
// the Journey's followed quest: its "Next" lines; then the markers on this map; and whether reading changed anything
async function journey(p) {
  const before = await p.evaluate(() => JSON.stringify([RB.game.s.flags, RB.game.s.quests, RB.game.s.inv]));
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForSelector('.qguide', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(150);
  const j = await p.evaluate(() => ({
    fol: (document.querySelector('button.entry.followed') || {}).dataset ? document.querySelector('button.entry.followed').dataset.q : null,
    next: [...document.querySelectorAll('.qnext .nline')].map((e) => e.textContent.trim()),
    guide: ((document.querySelector('.qguide') || {}).textContent || '').trim(),
  }));
  await p.evaluate(() => RB.ui.menu.close());
  await p.waitForTimeout(400);
  j.marks = await p.evaluate(() => RB.questMarks.marks().marks.map((m) => m.kind + ':' + (m.id || m.target || '') + (m.tx != null ? '@' + m.tx + ',' + m.ty : '')));
  j.targets = await p.evaluate(() => RB.questGuide.targets('lf_main').targets.map((t) => t.map + ':' + (t.id || t.p || t.kind) + (t.x != null ? '@' + t.x + ',' + t.y : '')));
  j.map = await p.evaluate(() => RB.world.W.map.id);
  j.pure = before === (await p.evaluate(() => JSON.stringify([RB.game.s.flags, RB.game.s.quests, RB.game.s.inv])));
  // the waiting state, as the Journey shows it: no marker, and the nudge behind a button
  j.wait = /No marker for this step yet|can.t take this further/i.test(j.next.join(' ') + ' ' + j.guide);
  return j;
}
const plateMarked = (j) => j.marks.some((m) => /^target:lf_plate/.test(m));
const show = (j) => flat({ map: j.map, next: j.next, marks: j.marks, targets: j.targets, wait: j.wait, pure: j.pure });

const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });

// 1. no gates, on the Upper Floor
await at(p, 'lf.tower_upper', 10, 10, BASE);
let j = await journey(p);
ok(j.fol === 'lf_main' && j.next.some((l) => /in Upper Floor/.test(l)) && flat(j.targets) === flat(['lf.tower_upper:lf_plate@5,2']) && plateMarked(j) && !j.wait && j.pure,
  '1 no gates, the Upper Floor: "Next" names the Upper Floor, the marker over plate A, no "wait" ' + show(j));

// 2. gate A, in the Gate Works; out to the sluice and back; a save and load
const A = Object.assign({ lf_gate_a: true, lf_mid_seen: true, lf_shortcut: true }, BASE);
await at(p, 'lf.tower_mid', 10, 4, A);
j = await journey(p);
ok(j.next.some((l) => /in Gate Works/.test(l)) && flat(j.targets) === flat(['lf.tower_mid:lf_plate@9,3']) && plateMarked(j) && !j.wait && j.pure,
  '2 gate A, the Gate Works: "Next" names the Gate Works, the marker over plate B, no "wait" ' + show(j));
const m1 = await move(p, 'lf.sluice', 10, 10);
const out = await journey(p);
const m2 = await move(p, 'lf.tower_top', 7, 9);
const m3 = await move(p, 'lf.tower_mid', 3, 4);
const back = await journey(p);
ok(m1 === 'lf.sluice' && m2 === 'lf.tower_top' && m3 === 'lf.tower_mid' && flat(out.targets) === flat(['lf.tower_mid:lf_plate@9,3']) && out.next.some((l) => /in Gate Works/.test(l)) && !out.next.some((l) => /no way there/i.test(l)) && !out.wait &&
  flat(back.targets) === flat(['lf.tower_mid:lf_plate@9,3']) && plateMarked(back) && !back.wait,
  '2 out of the tower to the sluice, then back in through the top floor to the Gate Works: plate B, named and marked ' + flat({ m1, m2, m3, out: show(out), back: show(back) }));
const m4 = await saveLoad(p);
const sl = await journey(p);
ok(m4 === 'lf.tower_mid' && flat(sl.targets) === flat(['lf.tower_mid:lf_plate@9,3']) && plateMarked(sl) && !sl.wait, '2 a save and load: the same ' + show(sl));

// 3. gates A and B, on the Drowned Stair
await at(p, 'lf.tower_low', 10, 4, Object.assign({ lf_gate_b: true, lf_low_seen: true }, A));
j = await journey(p);
ok(j.next.some((l) => /in Drowned Stair/.test(l)) && flat(j.targets) === flat(['lf.tower_low:lf_plate@3,2']) && plateMarked(j) && !j.wait && j.pure,
  '3 gates A and B, the Drowned Stair: "Next" names the Drowned Stair, the marker over plate C, no "wait" ' + show(j));

// 4. gates A, B and C: the Bell Chamber, as before
await at(p, 'lf.tower_low', 10, 4, Object.assign({ lf_gate_b: true, lf_low_seen: true, lf_gate_c: true }, A));
j = await journey(p);
ok(j.next.some((l) => /the bell, in Bell Chamber/.test(l)) && j.targets.includes('lf.bellhall:lf_bigbell@7,7') && !plateMarked(j) && !j.wait && j.pure,
  '4 gates A, B and C: "Next" names the bell in the Bell Chamber, no plate marked, no "wait" ' + show(j));

ok(!errors.length && !requests.length, '5 no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : '') + (requests.length ? ' ' + requests.slice(0, 2).join(' | ') : ''));
await ctx.close();
console.log(`\nlf_tower_guide: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
