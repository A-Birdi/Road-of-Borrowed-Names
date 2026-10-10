// Festival games on screen (expansion P06 for P09; src/ui/88e_festival.js, 88f_festival_yoyo.js), in Chromium on the
// built game, with throwaway sessions:
//  - the game's corner: Practice chosen by default, Timed offered; a practice round of water-balloon fishing (a
//    right balloon hooked, a wrong one says what it is, a hint) ends keeping nothing;
//  - a timed round (shortened for the test): the clock stops while a hint is shown; the round's score becomes the
//    player's best, shown in the game's corner; no stamp;
//  - phone width: the tub fits; the Distractions page with Play buttons;
//  - every kanji with its reading; no errors, no network. Captures in docs/screenshots/festival/.
// Usage: node tests/e2e/festival.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'festival');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function bareKanji(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    for (const rootEl of document.querySelectorAll(scope)) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!/[一-鿿々]/.test(n.nodeValue)) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], [aria-hidden="true"]')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out;
  }, scope);
}
async function open(p, seconds) {
  await p.evaluate((sec) => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'suzu', flags: { departed: true, pt_festival: true } });
    s.edition = 2; s.player.nameJp = 'ハル';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    if (sec) RB.festival.get('yoyo').seconds = sec;
    window.__fv = RB.activity.launch('festival', { source: 'distractions', game: 'yoyo' });
  }, seconds || null);
  await p.waitForSelector('.fv-folio [data-a="begin"]');
}
const yo = (p) => p.evaluate(() => JSON.parse(JSON.stringify(RB.ui.festivalGames.yoyo.state())));
const hook = async (p, right) => {
  const st = await yo(p);
  const bal = right ? st.tub.find((x) => x.en === st.target.en) : st.tub.find((x) => x.en !== st.target.en);
  // a drifting balloon never stands still for Playwright's click: the click goes to it directly
  await p.evaluate((id) => document.querySelector('.fv-balloon[data-b="' + id + '"]').click(), bal.id);
  return bal;
};

await test('practice: untimed, a right and a wrong balloon, a hint; nothing kept', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  assert(await p.evaluate(() => document.querySelector('input[name="fv-mode"][value="practice"]').checked), 'Practice is chosen by default');
  assert(!(await bareKanji(p, '.fv-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.fv-folio')));
  await p.screenshot({ path: path.join(out, 'corner.png') });
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-tub');
  assert(!(await p.$('.fv-clock')), 'no clock in practice');
  assert((await p.$$('.fv-balloon')).length === 6, 'six balloons');
  const wrong = await hook(p, false);
  assert(new RegExp(wrong.en).test(await p.textContent('.fv-say')), 'a wrong balloon says what it is: ' + await p.textContent('.fv-say'));
  await p.click('[data-y="hint"]');
  assert(/It begins/.test(await p.textContent('.fv-ask')), 'a hint: the first sound');
  assert(!(await bareKanji(p, '.fv-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.fv-folio')));
  await p.screenshot({ path: path.join(out, 'practice_tub.png') });
  for (let i = 0; i < 8; i++) { if (await p.$('.fv-over')) break; await hook(p, true); await p.waitForTimeout(60); }
  await p.waitForSelector('.fv-over');
  assert(/Nothing is kept/.test(await p.textContent('.fv-over')), 'practice over: nothing kept');
  assert(await p.evaluate(() => !RB.game.s.practice.festival), 'and nothing was written');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('a timed round: the clock stops for a hint; the score becomes your best; no stamp', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p, 6);
  await p.click('input[name="fv-mode"][value="timed"]');
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-clock');
  await hook(p, true);
  await hook(p, true);
  await p.click('[data-y="hint"]');
  const a = await p.evaluate(() => RB.ui.festival.state());
  await p.waitForTimeout(1200);
  const c = await p.evaluate(() => RB.ui.festival.state());
  assert(a.paused === 1 && Math.abs(c.left - a.left) < 300, 'the clock stops while the hint is shown (' + a.left + ' → ' + c.left + ')');
  await p.waitForSelector('.fv-over', { timeout: 15000 });
  const r = await p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s.practice.festival.games.yoyo)));
  assert(r.timed === 1 && r.best === 2 && r.bestStreak === 2, 'the round: two hooked, kept as your best: ' + JSON.stringify(r));
  assert(/Your best yet/.test(await p.textContent('.fv-over')), 'said so');
  assert(await p.evaluate(() => !Object.keys(RB.game.s.records.stamps || {}).length), 'no stamp from it');
  await p.click('[data-a="corner"]');
  await p.waitForSelector('[data-a="begin"]');
  assert(/Your best: 2/.test(await p.textContent('.fv-folio')), 'the best, shown in the game\'s own corner');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('phone width: the tub fits; the Distractions page', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await open(p);
  await p.click('[data-a="begin"]');
  await p.waitForSelector('.fv-tub');
  assert(await noOverflow(p), 'the tub fits the phone');
  await p.screenshot({ path: path.join(out, 'tub_phone.png'), fullPage: false });
  await p.evaluate(() => RB.ui.festival.close());
  await p.waitForFunction(() => RB.game.mode() === 'world');
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('.ds-item[data-ds="festival"]');
  await p.click('.ds-item[data-ds="festival"]');
  await p.waitForSelector('[data-ds-act="festival"][data-g="yoyo"]');
  assert(await noOverflow(p), 'its page fits');
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio')));
  await p.screenshot({ path: path.join(out, 'distractions_page_phone.png'), fullPage: false });
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
