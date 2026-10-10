// Shogi on screen (expansion P06, C12; src/ui/88_shogi.js), in Chromium on the built game, with throwaway sessions:
//  - the ladder; a lesson: the piece's moves drawn, Show moves, the asked move solves it and is kept;
//  - a puzzle: a wrong try leaves the board as it was and says why; promotion is asked, never assumed; solved, kept;
//  - mini-shogi: a move and the partner's reply; Why? in a sentence; Take back; a win recorded, the stamp ready, and
//    taking the winning move back takes the result off the record;
//  - hasami shogi: a move, the partner's reply, Take back;
//  - full shogi with a handicap at phone width: the giver moves first; the board fits; no overflow;
//  - every kanji on screen with its reading; no errors, no network. Captures in docs/screenshots/shogi/.
// Usage: node tests/e2e/shogi.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'shogi');
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
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden]')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out;
  }, scope);
}
async function open(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } });
    s.edition = 2; s.player.nameJp = 'ハル';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    window.__sg = RB.activity.launch('shogi', Object.assign({ source: 'distractions' }, o || {}));
  }, o || null);
  await p.waitForSelector('.sg-ladder');
}
const st = (p) => p.evaluate(() => { const v = RB.ui.shogi.state(); return v && { view: v.view, kind: v.kind, turn: v.g && v.g.turn, last: v.g && v.g.last, solved: v.solved, thinking: v.thinking }; });
const rec = (p) => p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s.practice.shogi)));
const sq = (p, r, c) => p.click('[data-sq="' + r + ',' + c + '"]');
const idle = (p) => p.waitForFunction(() => { const v = RB.ui.shogi.state(); return v && !v.thinking && v.g && v.g.turn === 0; }, null, { timeout: 30000 });

await test('the ladder; a lesson: the moves drawn, the asked move solves it and is kept', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  assert(/with Mio/.test(await p.textContent('.sg-folio')), 'played with the companion: Mio');
  assert((await p.$$('.sg-rung')).length === 6, 'six rungs');
  assert(!(await bareKanji(p, '.sg-folio')).length, 'kanji without readings on the ladder: ' + (await bareKanji(p, '.sg-folio')));
  await p.screenshot({ path: path.join(out, 'ladder_desktop.png') });
  await p.click('[data-a="lesson"][data-id="N"]');
  await p.waitForSelector('.sg-diag');
  assert((await p.$$('.sg-diag .jump')).length === 2, 'the knight\'s two jumps drawn');
  await sq(p, 4, 1);
  const tg = await p.evaluate(() => [...document.querySelectorAll('.sg-sq.tgt')].map((e) => e.dataset.sq));
  assert(tg.includes('2,2') && tg.includes('2,0'), 'Show moves: where the knight can go: ' + tg);
  await p.screenshot({ path: path.join(out, 'lesson_knight.png') });
  await sq(p, 2, 2);
  assert((await st(p)).solved, 'the asked move solves it');
  assert(!!(await rec(p)).lessons.N, 'kept in the record');
  assert(!(await bareKanji(p, '.sg-folio')).length, 'kanji without readings in the lesson: ' + (await bareKanji(p, '.sg-folio')));
  await p.click('[data-a="ladder"]');
  assert(/1 of 8 met/.test(await p.textContent('.sg-ladder')), 'the ladder counts it');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('a puzzle: a wrong try changes nothing and says why; promotion asked; solved and kept', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  await p.click('[data-a="tsume"][data-id="t1"]');
  await p.waitForSelector('.sg-hand.mine [data-a="drop"]');
  const before = await p.evaluate(() => JSON.stringify(RB.ui.shogi.state().g.b));
  await p.click('.sg-hand.mine [data-a="drop"][data-t="G"]');
  await sq(p, 1, 1);
  assert(/can still get away/.test(await p.textContent('.sg-status')), 'a check that is not mate: said so');
  assert(before === await p.evaluate(() => JSON.stringify(RB.ui.shogi.state().g.b)), 'and the board is as it was');
  await p.click('.sg-hand.mine [data-a="drop"][data-t="G"]');
  await sq(p, 1, 2);
  assert((await st(p)).solved && !!(await rec(p)).tsume.t1, 'mate: solved and kept');
  await p.click('[data-a="ladder"]');
  await p.click('[data-a="tsume"][data-id="t6"]');
  await sq(p, 2, 4);
  await sq(p, 1, 4);
  await p.waitForSelector('.sg-ask');
  assert(!(await bareKanji(p, '.sg-ask')).length, 'the promotion question with readings');
  await p.screenshot({ path: path.join(out, 'tsume_promote.png') });
  await p.click('[data-a="prom"][data-v="0"]');
  assert(!(await st(p)).solved && /can still get away/.test(await p.textContent('.sg-status')), 'not promoting: the king escapes');
  await sq(p, 2, 4);
  await sq(p, 1, 4);
  await p.click('[data-a="prom"][data-v="1"]');
  assert((await st(p)).solved, 'promoting: mate');
  assert(await p.evaluate(() => !!document.querySelector('.sg-pc.prom')), 'the promoted piece in red');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('mini-shogi: a move and a reply; Why?; Take back; a win recorded and taken back', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  await p.click('[data-a="play"][data-v="mini"]');
  await p.waitForSelector('.sg-board');
  // the pawn forward (from the right-hand file as you see it: rank 4, file 5)
  await sq(p, 3, 0);
  assert(await p.evaluate(() => document.querySelectorAll('.sg-sq.tgt').length === 1), 'Show moves: the pawn has one square');
  await sq(p, 2, 0);
  await idle(p);
  const s1 = await st(p);
  assert(s1.last && s1.view === 'game', 'the partner replied');
  await p.click('[data-a="why"]');
  const why = await p.textContent('.sg-why');
  assert(/Mio /.test(why) && /[ぁ-ん]/.test(why), 'Why? in a sentence, in both languages: ' + why);
  assert(!(await bareKanji(p, '.sg-folio')).length, 'kanji without readings in a game: ' + (await bareKanji(p, '.sg-folio')));
  await p.screenshot({ path: path.join(out, 'mini_why.png') });
  await p.click('[data-a="back"]');
  assert(await p.evaluate(() => { const g = RB.ui.shogi.state().g; return g.turn === 0 && !g.last && g.b[3][0] && g.b[3][0].t === 'P'; }), 'Take back: the start again');
  // a winning position (the first puzzle's), then the mate
  await p.evaluate(() => {
    const g = RB.ui.shogi.state().g;
    const rows = ['..k..', '.....', '..G..', '.....', '....K'];
    g.b = rows.map((row) => [...row].map((ch) => (ch === '.' ? null : { t: ch.toUpperCase(), s: ch === ch.toUpperCase() ? 0 : 1, p: false })));
    g.h = [{ G: 1 }, {}]; g.turn = 0; g.hist = []; g.last = null;
  });
  await sq(p, 4, 0); // an empty square: the board drawn again
  await p.click('.sg-hand.mine [data-a="drop"][data-t="G"]');
  await sq(p, 1, 2);
  await p.waitForFunction(() => /You win/.test(document.querySelector('.sg-status').textContent));
  let r = await rec(p);
  assert(r.games.mini === 1 && r.wins.mini === 1, 'the win recorded: ' + JSON.stringify(r));
  assert(await p.evaluate(() => RB.stampBook.pressed(RB.game.s, 'pt.shogi')), 'the first-win stamp pressed (it needs no stand)');
  await p.screenshot({ path: path.join(out, 'mini_win.png') });
  await p.click('[data-a="back"]');
  r = await rec(p);
  assert(!r.games.mini && !r.wins.mini, 'taken back: the result comes off the record: ' + JSON.stringify(r));
  assert(await p.evaluate(() => RB.stampBook.pressed(RB.game.s, 'pt.shogi')), 'a stamp once pressed stays pressed (F-22)');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('hasami shogi: a move, a reply, Take back', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  await p.click('[data-a="play"][data-v="hasami"]');
  await p.waitForSelector('.sg-board');
  await sq(p, 8, 0);
  await sq(p, 5, 0);
  await p.waitForFunction(() => { const v = RB.ui.shogi.state(); return !v.thinking && v.g.turn === 0; }, null, { timeout: 20000 });
  assert(await p.evaluate(() => RB.ui.shogi.state().g.b[5][0] === 0), 'the piece moved and the partner replied');
  assert(!(await bareKanji(p, '.sg-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.sg-folio')));
  await p.screenshot({ path: path.join(out, 'hasami.png') });
  await p.click('[data-a="back"]');
  assert(await p.evaluate(() => RB.ui.shogi.state().g.b[8][0] === 0), 'taken back');
  await p.click('.folio [data-a="close"], .sg-folio .folio-close').catch(() => {});
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('shogi with a handicap at phone width: the giver moves first; the board fits; leaving closes', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await open(p);
  assert(await noOverflow(p), 'the ladder fits');
  await p.screenshot({ path: path.join(out, 'ladder_phone.png'), fullPage: false });
  await p.click('[data-a="play"][data-v="full"][data-hc="two"]');
  await idle(p);
  assert(!!(await st(p)).last, 'the giver (your partner) moved first');
  const fits = await p.evaluate(() => { const r = document.querySelector('.sg-board').getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth; });
  assert(fits && await noOverflow(p), 'the 9×9 board fits the phone');
  assert(!(await bareKanji(p, '.sg-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.sg-folio')));
  // a move on the phone: a pawn forward (the seventh file's pawn, rank 7)
  await sq(p, 6, 2);
  await sq(p, 5, 2);
  await idle(p);
  await p.screenshot({ path: path.join(out, 'full_handicap_phone.png'), fullPage: false });
  // leaving: to the ladder, then away
  await p.evaluate(() => RB.ui.popLayer && document.querySelector('.sg-folio') && RB.ui.shogi.close());
  assert(await p.evaluate(() => window.__sg.then((r) => r && r.ok !== false)), 'the activity ends cleanly');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
