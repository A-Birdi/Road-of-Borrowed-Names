// Karuta on screen (expansion P06, C12; src/ui/88d_karuta.js), in Chromium on the built game, with throwaway sessions:
//  - the menu; a game on eight cards: the proverb read a word at a time, first sound first; the right card is yours
//    and the proverb is shown whole with its meaning; a wrong card is お手つき and the partner takes the right one;
//    played to the end: the record (games, best, proverbs taken) and the stamp; the taken proverbs on the menu;
//  - the opt-in speed mode: the partner reaches for the card after a while;
//  - phone width: the mat fits; the Distractions page;
//  - every kanji with its reading; no errors, no network. Captures in docs/screenshots/karuta/.
// Usage: node tests/e2e/karuta.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'karuta');
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
async function open(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'nao', flags: { departed: true, pt_karuta: true } });
    s.edition = 2; s.player.nameJp = 'ハル';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    window.__kt = RB.activity.launch('karuta', { source: 'distractions' });
  });
  await p.waitForSelector('.kt-folio .hf-menu');
}
const st = (p) => p.evaluate(() => JSON.parse(JSON.stringify(RB.ui.karuta.state())));
const cur = (p) => p.evaluate(() => RB.karuta.current(RB.ui.karuta.state().g));

await test('a game: read word by word; right, wrong (お手つき), to the end; the record and the stamp', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  assert(/with Nao/.test(await p.textContent('.kt-folio')), 'played with Nao');
  await p.click('input[name="kt-size"][value="8"]');
  await p.click('[data-a="start"]');
  await p.waitForSelector('.kt-reader');
  assert((await p.$$('.kt-mat .kt-card')).length === 8, 'eight cards on the mat');
  const first = await cur(p);
  assert((await p.textContent('.kt-first')).trim() === first, 'the first sound, first');
  await p.waitForFunction(() => RB.ui.karuta.state().words >= 2, null, { timeout: 8000 });
  assert(!(await bareKanji(p, '.kt-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.kt-folio')));
  await p.screenshot({ path: path.join(out, 'reading.png') });
  await p.click('.kt-card[data-k="' + first + '"]');
  await p.waitForSelector('.kt-shown');
  assert(/Yours/.test(await p.textContent('.kt-shown')), 'the right card: yours');
  assert(!(await bareKanji(p, '.kt-folio')).length, 'the proverb whole, with readings');
  await p.screenshot({ path: path.join(out, 'taken.png') });
  await p.click('[data-a="next"]');
  await p.waitForSelector('.kt-reader');
  const second = await cur(p);
  const wrong = await p.evaluate((c) => RB.karuta.onMat(RB.ui.karuta.state().g).find((k) => k !== c), second);
  await p.click('[data-a="all"]');
  await p.click('.kt-card[data-k="' + wrong + '"]');
  await p.waitForSelector('.kt-shown');
  assert(/お/.test(await p.textContent('.kt-shown')) && /Nao takes the right one/.test(await p.textContent('.kt-shown')), 'お手つき: Nao takes the right card');
  let s = await st(p);
  assert(s.g.taken[1].includes(second) && s.g.otetsuki === 1, 'recorded as the partner\'s card');
  // the rest, rightly
  for (let i = 0; i < 10; i++) {
    s = await st(p);
    if (s.g.i >= s.g.order.length) break;
    await p.click('[data-a="next"]');
    await p.waitForSelector('.kt-reader');
    const c = await cur(p);
    await p.click('.kt-card[data-k="' + c + '"]');
    await p.waitForSelector('.kt-shown');
  }
  await p.click('[data-a="next"]');
  await p.waitForSelector('.hf-over');
  assert(/You took 7 cards to Nao's 1/.test(await p.textContent('.hf-over')), 'the end: seven to one');
  const r = await p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s.practice.karuta)));
  assert(r.games === 1 && r.best === 7 && Object.keys(r.cards).length === 7, 'the record: a game, a best of 7, seven proverbs taken: ' + JSON.stringify(r));
  assert(await p.evaluate(() => RB.stampBook.pressed(RB.game.s, 'pt.karuta')), 'the stamp: a game played to the end');
  await p.click('[data-a="menu"]');
  await p.waitForSelector('.kt-known');
  assert((await p.$$('.kt-known li')).length === 7, 'the proverbs taken, on the menu with their meanings');
  assert(!(await bareKanji(p, '.kt-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.kt-folio')));
  await p.screenshot({ path: path.join(out, 'menu_known.png') });
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('the speed mode (opt-in): the partner reaches for the card', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  await p.click('input[name="kt-size"][value="8"]');
  await p.click('input[name="kt-speed"][value="3"]');
  await p.click('[data-a="start"]');
  await p.waitForSelector('.kt-reader');
  await p.waitForSelector('.kt-shown', { timeout: 9000 });
  assert(/Nao was quicker/.test(await p.textContent('.kt-shown')), 'Nao was quicker');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('phone width: the mat fits; the Distractions page', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await open(p);
  assert(await noOverflow(p), 'the menu fits');
  await p.click('input[name="kt-size"][value="0"]');
  await p.click('[data-a="start"]');
  await p.waitForSelector('.kt-reader');
  assert((await p.$$('.kt-mat .kt-card')).length === 35, 'all thirty-five');
  assert(await noOverflow(p), 'the mat fits the phone');
  await p.screenshot({ path: path.join(out, 'mat_phone.png'), fullPage: false });
  await p.evaluate(() => RB.ui.karuta.close());
  await p.waitForFunction(() => RB.game.mode() === 'world');
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('.ds-item[data-ds="karuta"]');
  await p.click('.ds-item[data-ds="karuta"]');
  await p.waitForSelector('.ds-page .ds-how');
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
