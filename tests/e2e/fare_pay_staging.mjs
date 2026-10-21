// RBN-QA-050 (Agnes): the fare repaid at Hana's teahouse (lq.fare_pay, rw.tea), in Chromium on the built game, played
// from each side you can talk to Chigusa from (west, east, above), with your companion along:
//  1. before you talk to her she sits at the small table (her teahouse stance), and she is still seated for "I've been
//     sitting here since morning";
//  2. at "Let's begin." she stands and walks round to Kōji's side (4,6), facing him (5,6, facing her): the walk is made
//     (no fallback) from every side;
//  3. side by side for the repayment: the coins in her hands, the fare book in his, the seal from him to her, each at
//     its line; your companion by the door (3,7), off her tile and out of the way;
//  4. the scene ends as before (the quest step, Chigusa on her way); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/fare_pay_staging.mjs   (EVIDENCE=<dir> also saves frames)
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const ev = process.env.EVIDENCE;
if (ev) fs.mkdirSync(ev, { recursive: true });
const FL = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, rw_koji_back: true, rw_echo_done: true, lq_fare_found: true };

async function run(side, comp) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate(([side, comp, FL]) => {
    const s = RB.game.debugStart('rw.tea', side.x, side.y, { comp, dir: side.dir, flags: FL });
    s.quests.lq_fare = { stage: 4, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.world.refreshActors();
  }, [side, comp, FL]);
  await p.waitForTimeout(1500);
  const look = () => p.evaluate(() => {
    const st = RB.staging.state(), f = (id) => st.actors.find((a) => a.id === id) || null;
    const c = f('lq_chigusa'), k = f('koji'), m = f('comp');
    return { chigusa: c && { at: [c.x, c.y], dir: c.dir, pose: c.pose, rest: c.rest, held: c.held }, koji: k && { at: [k.x, k.y], dir: k.dir, held: k.held }, comp: m && [m.x, m.y], fallbacks: RB.staging.stats().walkFallbacks };
  });
  const before = await look();
  await p.evaluate(() => RB.world.interact());
  const beats = [];
  let shot = 0;
  for (let i = 0; i < 160; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 160) : null, run: RB.script.isRunning(), mode: RB.game.mode() }; });
    if (st.d) {
      // (one press per line: a press while the same line is still up would be carried into the next)
      if (!beats.length || beats[beats.length - 1].d !== st.d) {
        await p.waitForTimeout(350); beats.push({ d: st.d, ...(await look()) });
        if (ev) await p.screenshot({ path: path.join(ev, side.name + '_' + comp + '_' + (++shot) + '.png') });
        await p.click('.dlg .b-next').catch(() => {});
      }
      await p.waitForTimeout(150);
      continue;
    }
    if (!st.run && st.mode === 'world' && beats.length) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(800);
  const after = await p.evaluate(() => ({ quest: RB.game.s.quests.lq_fare, paid: !!RB.game.s.flags.lq_fare_paid, mode: RB.game.mode() }));
  await p.close();
  return { before, beats, after, errors };
}
const SIDES = [{ name: 'west', x: 5, y: 4, dir: 'right' }, { name: 'east', x: 7, y: 4, dir: 'left' }, { name: 'above', x: 6, y: 3, dir: 'down' }];
for (const side of SIDES) for (const comp of side.name === 'west' ? ['suzu', 'nao'] : ['suzu']) {
  const r = await run(side, comp), tag = side.name + ' (' + comp + ')';
  const at = (re) => r.beats.find((x) => re.test(x.d));
  const since = at(/sitting here since morning/), coins = at(/lays (the )?coins|coins in front/i), book = at(/Write your name/), seal = at(/the pledge/i);
  ok(r.before.chigusa && r.before.chigusa.rest === 'sit' && r.before.chigusa.at.join() === '6,4', tag + ': before you talk she sits at the small table (' + JSON.stringify(r.before.chigusa) + ')');
  ok(since && since.chigusa.at.join() === '6,4' && since.chigusa.rest === 'sit' && !since.chigusa.pose, tag + ': still seated for "sitting here since morning" (' + JSON.stringify(since && since.chigusa) + ')');
  ok(coins && coins.chigusa.at.join() === '4,6' && coins.chigusa.dir === 'right' && coins.chigusa.pose === 'stiff' && coins.koji.at.join() === '5,6' && coins.koji.dir === 'left' && coins.fallbacks === r.before.fallbacks, tag + ': at the coins she stands beside Kōji, facing him, the walk made (' + JSON.stringify(coins && { c: coins.chigusa, k: coins.koji, fb: coins.fallbacks - r.before.fallbacks }) + ')');
  ok(coins && coins.chigusa.held === 'coins', tag + ': the coins in her hands');
  ok(book && book.koji.held === 'book' && book.chigusa.at.join() === '4,6', tag + ': the fare book in his hands, held out to her (' + JSON.stringify(book && { k: book.koji, c: book.chigusa.at }) + ')');
  ok(seal && (seal.chigusa.held === 'stamp' || seal.koji.held === 'stamp'), tag + ': the seal passes between them (' + JSON.stringify(seal && { c: seal.chigusa.held, k: seal.koji.held }) + ')');
  ok(coins && JSON.stringify(coins.comp) === '[3,7]', tag + ': your companion by the door, off her tile (' + JSON.stringify(coins && coins.comp) + ')');
  ok(r.after.paid && r.after.mode === 'world', tag + ': the scene ends as before (' + JSON.stringify(r.after) + ')');
  ok(!r.errors.length, tag + ': no page errors ' + r.errors.slice(0, 2).join(' | '));
}
console.log(`\nfare_pay_staging: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
