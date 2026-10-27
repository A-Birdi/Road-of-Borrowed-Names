// Blockprint and Footlights, step 5 (Agnes 6444900108; Cloud CC-354), in Chromium on the built game, a synthetic
// twelve-chapter journey after Tomi's three plans (never a real save):
//  1. in the Playhouse before the dress rehearsal's discovery: the Journey's objective sends you back to the playhouse
//     to help Manbē, its "Next" line names him, and the world marker is over him;
//  2. from the committee room: the same objective, and "Next" names Manbē in the Playhouse;
//  3. the lift lowered (mp_under_open): the step's own words, "Next" names the trap lift, and the marker is over it;
//  4. no page errors, no network.
// Usage: node tools/build.mjs && node tests/e2e/mp_stage5_guide.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// Manybridge, Chapter 4, after mp.tomi_ready: the notice printed, the rehearsal done, the three plans made
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb_main_done: true, mp_arrived: true,
  mp_sobe_met: true, mp_press_open: true, press_printed: true, press_notice: true, mp_theatre_seen: true, mp_rehearsal_done: true,
  mp_fest_heard: true, mp_prep_met: true, mp_lan_bank: true, mp_prep_lanterns: true, mp_st_bank: true, mp_prep_stalls: true,
  mp_proc_drums: true, mp_prep_procession: true };
async function at(p, map, x, y, flags) {
  await p.evaluate(async ([map, x, y, flags]) => {
    const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'ren', dir: 'up', flags });
    for (const ev of RB.content.maps[map].onEnter || []) s.flags['enter:' + map + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'mp_main', 5);
    RB.questMarks.refresh();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, [map, x, y, flags]);
}
// the Journey's followed quest: its objective and its "Next" lines; then the markers on this map
async function journey(p) {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForSelector('.qguide', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(150);
  const j = await p.evaluate(() => ({
    fol: (document.querySelector('button.entry.followed') || {}).dataset ? document.querySelector('button.entry.followed').dataset.q : null,
    obj: ((document.querySelector('.qdetail .obj .en') || document.querySelector('.qdetail .obj') || {}).textContent || '').trim(),
    next: [...document.querySelectorAll('.qnext .nline')].map((e) => e.textContent.trim()),
  }));
  await p.evaluate(() => RB.ui.menu.close());
  await p.waitForTimeout(400);
  j.marks = await p.evaluate(() => RB.questMarks.marks().marks.map((m) => m.kind + ':' + (m.id || m.target || '')));
  return j;
}

{
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // 1. the Playhouse, before the discovery
  await at(p, 'mp.theatre', 10, 12, FLAGS);
  let j = await journey(p);
  ok(j.fol === 'mp_main' && /Return to the playhouse and help Manbē recover the missing names\./.test(j.obj), '1 the Playhouse, before: the objective sends you back to help Manbē (' + j.fol + ': "' + j.obj + '")');
  ok(j.next.some((l) => /Next: Manbē, in The Playhouse/.test(l)), '1 "Next" names Manbē (' + j.next.join(' | ') + ')');
  ok(j.marks.includes('target:mp_manbe'), '1 the world marker is over Manbē (' + j.marks.join(', ') + ')');
  // 2. the committee room, before the discovery
  await at(p, 'mp.committee', 5, 5, FLAGS);
  j = await journey(p);
  ok(/Return to the playhouse and help Manbē/.test(j.obj) && j.next.some((l) => /Next: Manbē, in The Playhouse/.test(l)), '2 the committee room: the same objective, and "Next" names Manbē in the Playhouse (' + j.next.join(' | ') + ')');
  ok(j.marks.length > 0, '2 the way out is marked (' + j.marks.join(', ') + ')');
  // 3. the lift lowered
  await at(p, 'mp.theatre', 10, 9, Object.assign({}, FLAGS, { mp_under_open: true }));
  j = await journey(p);
  ok(j.obj === 'Go down into the Understage beneath the stage and bring the names back.', '3 the lift lowered: the step\'s own words ("' + j.obj + '")');
  ok(j.next.some((l) => /Next: the trap lift, in The Playhouse/.test(l)), '3 "Next" names the trap lift (' + j.next.join(' | ') + ')');
  ok(j.marks.includes('target:mp_lift'), '3 the world marker is over the lift (' + j.marks.join(', ') + ')');
  ok(!errors.length && !requests.length, '4 no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

console.log(`\nmp_stage5_guide: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
