// Agnes, RBN-QA-028: at Fusa's teahouse (`co.a_orders`, "Help out"), the fifth customer, Shino, thanked you for the
// invitations ("ありがとう。招待状、助かったわ。") even when you had not yet sorted them at her post house, where the task
// then opened unstarted. Her thanks for the invitations now waits for them (co_letters_done); before that she thanks
// you for the sweets. Either order stays open; the tray, its counts and its results are unchanged. In the game, with
// the activity itself (every customer served by clicking the tray), at each tier:
//  1. invitations not yet sorted: Shino's thanks is for the sweets, never the invitations; all five served;
//  2. invitations sorted (co_letters_done): her thanks for the invitations, as before;
//  3. the other four customers' thanks are their own, as before.
// Usage: node tools/build.mjs && node tests/e2e/shino_thanks.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const INVITE = /invitations/, SWEET = /Something sweet is a real help/;

async function run(tier, done) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([tier, done]) => {
    const s = RB.game.debugStart('co.village', 20, 18, { comp: 'suzu', flags: done ? { co_letters_done: true } : {} });
    s.learn.profile = tier;
    window.__res = null;
    RB.activities.run('co.a_orders').then((r) => { window.__res = r; });
  }, [tier, done]);
  await p.waitForSelector('.lsheet.activity [data-serve]');
  const custs = await p.evaluate(() => RB.content.activities['co.a_orders'].customers.map((c) => ({ who: c.who, want: c.want })));
  const thanks = [];
  for (let i = 0; i < custs.length; i++) {
    for (const k of Object.keys(custs[i].want)) for (let n = 0; n < custs[i].want[k]; n++) await p.click('.lsheet.activity [data-add="' + k + '"]');
    await p.click('.lsheet.activity [data-serve]');
    await p.waitForSelector('.lsheet.activity [data-next]');
    thanks.push({ who: custs[i].who, text: await p.evaluate(() => document.querySelector('.lsheet.activity .fbwrap').textContent) });
    await p.click('.lsheet.activity [data-next]');
    if (i < custs.length - 1) await p.waitForSelector('.lsheet.activity [data-serve]');
  }
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  const res = await p.evaluate(() => ({ ok: window.__res.ok, mistakes: window.__res.mistakes, n: (window.__res.results || []).length }));
  await p.context().close();
  return { thanks, res, errors };
}

for (const tier of ['F', 'E', 'I', 'A']) {
  let r = await run(tier, false);
  const shino = r.thanks.find((x) => x.who === 'co_shino');
  ok(shino && SWEET.test(shino.text) && !INVITE.test(shino.text), tier + ' 1 invitations not sorted: Shino thanks you for the sweets (' + (shino ? shino.text.replace(/\s+/g, ' ').slice(0, 90) : '-') + ')');
  ok(r.res.ok && r.res.n === 5 && r.res.mistakes === 0, tier + ' 1 all five served, first try, the activity finished');
  ok(r.thanks.filter((x) => x.who !== 'co_shino').every((x) => !INVITE.test(x.text) && !SWEET.test(x.text)), tier + ' 3 the other four customers\' thanks are their own');
  ok(!r.errors.length, tier + ' 1 no page errors' + (r.errors.length ? ': ' + r.errors.slice(0, 2).join(' | ') : ''));
  r = await run(tier, true);
  const shino2 = r.thanks.find((x) => x.who === 'co_shino');
  ok(shino2 && INVITE.test(shino2.text) && !SWEET.test(shino2.text), tier + ' 2 invitations sorted: her thanks for the invitations, as before');
  ok(r.res.ok && r.res.n === 5 && !r.errors.length, tier + ' 2 all five served; no page errors');
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
