// Hana's teahouse rush at night (Agnes 6433779782; CC-332, CC-333; Local CL-464 to CL-466). In the game, at Reedwake's
// night (rw_night, rw_evening) once Kōji is back:
//  1. talking to Hana in the teahouse plays rw.hana_rush: her first line names no time of day ("Sorry, it's a rush
//     right now."), the "New quest" notice that follows it is "The Teahouse Rush", and helping out finishes the quest
//     and gives her tea leaves (the scene with the game's own test player, which answers "Help out");
//  2. the orders themselves, served by clicking the tray, under their new title (忙しい茶屋 · The Teahouse Rush), every
//     customer served at the first try;
//  3. nothing anywhere says "morning rush" or 朝の茶屋, and no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hana_rush_night.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const MORNING = /morning rush|朝 の 茶屋|\{朝\|あさ\} の \{茶屋/i;

// 1. the scene at night
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(async () => {
    RB.test.enable({ choose: () => 0 });
    const s = RB.game.debugStart('rw.tea', 2, 5, { edition: RB.edition.forNew(), profile: 'E', flags: { departed: false, rw_koji_back: true, rw_night: true, rw_evening: true }, dir: 'up' });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((res) => setTimeout(res, 50));
    const toasts = [];
    const orig = RB.ui.toast;
    RB.ui.toast = (t) => { toasts.push({ kind: t.kind, jp: t.jp || '', en: t.en || '' }); return orig(t); };
    const n = s.backlog.length;
    await RB.test.talk('hana');
    await RB.test.idle();
    RB.ui.toast = orig;
    return {
      night: !!s.flags.rw_night, lines: s.backlog.slice(n).map((l) => ({ who: l.who, jp: l.jp || '', en: l.en || '' })), toasts,
      quest: s.quests.rw_teahouse || null, leaves: (s.inv.rw_tea_leaves || 0), log: RB.test.log.filter((x) => x.t === 'choice' || x.t === 'activity').length,
    };
  });
  const first = r.lines.find((l) => l.who === 'hana');
  ok(r.night && first && first.en === 'Welcome! …Sorry, it\'s a rush right now. Everyone heard Kōji\'s back and came to look. Would you help?', '1 at night Hana\'s first line names no time of day: ' + (first ? first.en : '(none)'));
  ok(first && /\{今\|いま\} \{混\|こ\}んで いて/.test(first.jp), '1 its Japanese: 今混んでいて');
  const qn = r.toasts.find((t) => t.kind === 'quest_new'), qd = r.toasts.find((t) => t.kind === 'quest_done');
  ok(qn && qn.en === 'The Teahouse Rush' && qn.jp === '{忙|いそが}しい {茶屋|ちゃや}', '1 the "New quest" notice that follows: ' + (qn ? qn.jp + ' · ' + qn.en : JSON.stringify(r.toasts)));
  ok(qd && qd.en === 'The Teahouse Rush' && r.quest && r.quest.done && r.leaves >= 1, '1 helping out finishes the quest and gives the tea leaves (' + r.leaves + ')');
  ok(!r.lines.some((l) => MORNING.test(l.en) || MORNING.test(l.jp)) && !r.toasts.some((t) => MORNING.test(t.en) || MORNING.test(t.jp)), '3 nothing said or shown in the scene says "morning rush"');
  ok(!errors.length, '1 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// 2. the orders, served by clicking, under their new title
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.tea', 2, 5, { edition: RB.edition.forNew(), profile: 'E', flags: { rw_koji_back: true, rw_night: true, rw_evening: true } });
    s.learn.profile = 'E';
    window.__res = null;
    RB.activities.run('rw.a_orders').then((r) => { window.__res = r; });
  });
  await p.waitForSelector('.lsheet.activity [data-serve]');
  const head = await p.evaluate(() => (document.querySelector('.lsheet.activity') || {}).textContent || '');
  ok(/忙/.test(head) && /The Teahouse Rush/.test(head) && !MORNING.test(head), '2 the orders\' sheet is titled 忙しい茶屋 · The Teahouse Rush');
  const custs = await p.evaluate(() => RB.content.activities['rw.a_orders'].customers.map((c) => ({ who: c.who, want: c.want })));
  for (let i = 0; i < custs.length; i++) {
    for (const k of Object.keys(custs[i].want)) for (let n = 0; n < custs[i].want[k]; n++) await p.click('.lsheet.activity [data-add="' + k + '"]');
    await p.click('.lsheet.activity [data-serve]');
    await p.waitForSelector('.lsheet.activity [data-next]');
    await p.click('.lsheet.activity [data-next]');
    if (i < custs.length - 1) await p.waitForSelector('.lsheet.activity [data-serve]');
  }
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  const res = await p.evaluate(() => ({ ok: window.__res.ok, mistakes: window.__res.mistakes, n: (window.__res.results || []).length }));
  ok(res.ok && res.mistakes === 0 && res.n === custs.length, '2 every customer served at the first try (' + res.n + ' of ' + custs.length + ')');
  ok(!errors.length, '2 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

console.log(`\nhana_rush_night: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
