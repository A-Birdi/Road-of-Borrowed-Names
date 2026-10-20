// The view from the festival lookout (RBN-QA-032), in the BUILT game, headless Chromium, synthetic campaigns in
// fresh contexts (never a player's save):
// - in co.reflection the lines that describe the view are shown over pictures of it (src/ui/42c_interlude_lookout.js):
//   the whole village and the firebreaks over the village, Hiro's seat (Suzu's line, or "Suzu is dancing") over the
//   square, the snow on the northern peaks over the north; every other line of the scene (the companion's, yours)
//   is on the platform with the map shown; nothing is left showing after the scene;
// - Suzu dances on the stage unless she is the one up here with you;
// - the seat's globe and the stage are above the dialogue sheet, at a desktop size and a phone held upright; with
//   reduced motion each picture holds still (two frames alike);
// - no console errors, no network requests.
// Usage: node tests/e2e/lookout_vista.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, co_arrived: true, co_met_sayo: true, co_records_done: true, co_seal_broken: true, co_kiln_open: true, co_kiln_seen: true, co_warden_down: true, co_logpage_taken: true, co_kiln_done: true, co_kiln_return: true, co_hiro_globe: true };
const WANT = [[/see the whole village/, 'village'], [/firebreaks lie pale/, 'village'], [/Hiro's seat from here|Down on the stage, Suzu/, 'seat'], [/northern peaks/, 'north']];

for (const [comp, W, H, reduce] of [['suzu', 1180, 757, false], ['nao', 1180, 757, false], ['ren', 390, 844, true]]) {
  const tag = `${comp} ${W}×${H}${reduce ? ' reduced motion' : ''}`;
  const { p, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  await p.evaluate(async ([comp, FL, reduce]) => {
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = reduce; RB.game.applySettings();
    const s = RB.game.debugStart('co.lookout', 7, 6, { comp, flags: FL, dir: 'up', edition: 2 });
    s.chapter = 3; s.quests.co_main = { stage: 9, done: false, t: 1 };
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 800 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    RB.script.run('co.reflection');
  }, [comp, FL, reduce]);
  let last = '', wrong = [], seen = {}, probe = null, still = null;
  for (let i = 0; i < 40; i++) {
    const l = await p.waitForFunction((last) => { const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown(); if (l && RB.ui.dialogue.isOpen() && (l.en || '') !== last) return l.en; return !RB.script.isRunning() ? '__done' : false; }, last, { timeout: 60000, polling: 100 }).then((h) => h.jsonValue(), () => '__timeout');
    if (l === '__done' || l === '__timeout') break;
    last = l;
    await p.waitForTimeout(700);
    const st = await p.evaluate(() => { const s = RB.interlude.state(); return s && s.stage; });
    const want = (WANT.find(([re]) => re.test(l)) || [null, null])[1];
    if (st !== want) wrong.push(`"${l.slice(0, 40)}": ${st} (want ${want})`);
    if (want) seen[want] = (seen[want] || 0) + 1;
    if (want === 'seat') {
      probe = await p.evaluate(() => { const A = RB.interlude.ART.co_lookout, pr = A && A.probe(); return pr ? { pr } : null; });
      if (reduce) still = await p.evaluate(async () => { const a = document.getElementById('world').toDataURL(); await new Promise((r) => setTimeout(r, 900)); return a === document.getElementById('world').toDataURL(); });
    }
    await p.evaluate(() => RB.ui.dialogue.advance(true));
  }
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 30000 }).catch(() => {});
  ok(!wrong.length, `${tag}: each line over the right picture, the others on the platform${wrong.length ? ' — ' + wrong.join('; ') : ''}`);
  ok(seen.village === 2 && seen.seat === 1 && seen.north === 1, `${tag}: the village for two lines, the seat for one, the north for one (${JSON.stringify(seen)})`);
  ok(!(await p.evaluate(() => RB.interlude.active())) && (await p.evaluate(() => RB.world.W.map.id)) === 'co.village', `${tag}: after the scene nothing is left showing; the next morning in the village`);
  if (probe) {
    const { pr } = probe, vb = pr.vb;
    ok(pr.dancer === (comp !== 'suzu'), `${tag}: Suzu ${comp === 'suzu' ? 'is up here, not' : 'is'} dancing on the stage`);
    ok(pr.globe[1] + pr.globe[2] < vb && pr.seat[1] < vb && pr.dancerAt[1] < vb && pr.villageSeat[1] < pr.yR && pr.peak.y < vb, `${tag}: the seat's globe, the stage, the village's seat and the peaks are above the sheet (globe ${pr.globe[1]}, seat ${pr.seat[1]}, sheet ${vb})`);
  } else ok(false, `${tag}: the seat picture was shown`);
  if (reduce) ok(still === true, `${tag}: with reduced motion the picture holds still`);
  ok(!errors.length, `${tag}: no console errors${errors.length ? ' — ' + errors[0].slice(0, 120) : ''}`);
  ok(!requests.length, `${tag}: no network requests`);
  await p.close();
}
console.log(`\nlookout_vista: ${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
