// RBN-QA-166 B (Agnes 6375876823, 6376447128; Local CL-252; Cloud CC-156 §5): the story room's task in the browser, as a
// player meets it in the first wing's shelter, at each learning tier (F, E, I, A):
//  1. first use: the task's prompt names the four written passages, never "pictures";
//  2. a wrong order: the hint and "Try again", the same prompt still shown;
//  3. "Come back later": the scene says you can put them in order later (its recorded line, as it was);
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_story_passages.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true, hall_w1_f1_seen: true };
const rows = [];
for (const tier of ['F', 'E', 'I', 'A']) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async ([tier, DONE]) => {
    const s = RB.game.debugStart('hall.w1f1', 4, 12, { dir: 'left', comp: null, flags: DONE });
    s.edition = 2; s.learn.kanaKnown = 'both'; s.learn.profile = tier;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.applySettings();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
    await new Promise((r) => setTimeout(r, 600));
    window.__done = false;
    RB.script.run('hall.w1.t1').then(() => { window.__done = true; });
  }, [tier, DONE]);
  // through the tale's lines to the task
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ chal: !!document.querySelector('.chal-prompt'), open: RB.ui.dialogue.isOpen() }));
    if (st.chal) break;
    if (st.open) await p.evaluate(() => RB.ui.dialogue.advance());
    await p.waitForTimeout(60);
  }
  const first = await p.evaluate(() => (document.querySelector('.chal-prompt') || {}).textContent || '');
  // a wrong order: the answer's order with its first two swapped
  await p.evaluate(() => {
    const step = RB.content.challenges['hall.w1.story'].tiers[RB.game.s.learn.profile][0];
    const pool = RB.util.rng(RB.util.hashStr(step.tiles.join(''))).shuffle(step.tiles.map((t, i) => ({ t, i })));
    const want = step.answer.map((a) => pool.findIndex((pc) => pc.t === a));
    [want[0], want[1]] = [want[1], want[0]];
    for (const j of want) document.querySelector('[data-add="' + j + '"]').click();
    document.querySelector('.chal-submit').click();
  });
  await p.waitForTimeout(500);
  const retry = await p.evaluate(() => ({ why: (document.querySelector('.fb-why') || {}).textContent || '', again: /Try again/.test(document.querySelector('.chal') ? document.querySelector('.chal').textContent : ''), prompt: (document.querySelector('.chal-prompt') || {}).textContent || '' }));
  // come back later
  await p.evaluate(() => { const leave = document.querySelector('[data-a="leave"]'); if (leave) leave.click(); });
  for (let i = 0; i < 60; i++) {
    const st = await p.evaluate(() => ({ done: window.__done, open: RB.ui.dialogue.isOpen() }));
    if (st.done) break;
    if (st.open) await p.evaluate(() => RB.ui.dialogue.advance());
    await p.waitForTimeout(60);
  }
  const later = await p.evaluate(() => window.__said.slice(-1)[0] || '');
  rows.push({ tier, first, retry, later });
  errorsAll.push(...errors); await ctx.close();
}
const okFirst = rows.every((r) => /passages/.test(r.first) && !/picture/i.test(r.first));
ok(okFirst, 'first use, at each tier: the prompt names the written passages, never "pictures" (' + rows.map((r) => r.tier + ': ' + r.first).join(' | ') + ')');
ok(rows.every((r) => r.retry.why && !/picture/i.test(r.retry.why) && r.retry.again && r.retry.prompt === r.first), 'a wrong order, at each tier: the hint and "Try again", the same prompt still shown (' + rows.map((r) => r.tier + ': ' + r.retry.why.slice(0, 50)).join(' | ') + ')');
ok(rows.every((r) => r.later === 'You can put the pictures in order later.'), 'come back later, at each tier: the scene\'s own line, as it was (' + rows.map((r) => r.tier + ': ' + r.later).join(' | ') + ')');
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
