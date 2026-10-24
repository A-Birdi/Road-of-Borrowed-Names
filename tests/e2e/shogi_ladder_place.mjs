// RBN-QA-179 (Agnes 6382151920; Local CL-286): a lesson opened from the shogi ladder after scrolling down to it kept
// the ladder's scroll, so its heading and the piece's Japanese were above the top of the page. In Chromium on the built
// game, with throwaway sessions:
//  1. at phone width, bishop → Back to the ladder → rook → Leave → king, each opened after scrolling down to it: the
//     view starts at its top, its heading seen and focused; back on the ladder, the place it was left and the button
//     that opened it, focused;
//  2. a puzzle and a game (the handicap game whose giver moves first) the same way, the heading kept focused through
//     the partner's move;
//  3. what keeps its place: choosing a piece, a move's words, Start again and New game, scrolled down;
//  4. by keyboard (Enter opens, Escape leaves, Enter opens the same lesson again) on a desktop with the largest text;
//  5. no page errors, no network.
// Usage: node tools/build.mjs && node tests/e2e/shogi_ladder_place.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;

async function open(p, scale) {
  await p.evaluate((scale) => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } });
    s.edition = 2; s.player.nameJp = 'ハル';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    if (scale) { RB.game.settings.textScale = scale; RB.game.applySettings(); }
    window.__sg = RB.activity.launch('shogi', { source: 'distractions' });
  }, scale || null);
  await p.waitForSelector('.sg-ladder');
  // the game's own faces loaded, and the ladder laid out with them: when the ladder is drawn before any face has been
  // asked for, document.fonts.ready resolves at once and the faces arrive about half a second later, re-wrapping a
  // rung's small print (the ladder some 40 px taller), after the test had measured where it stood
  await p.evaluate(async () => {
    await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
    await document.fonts.ready;
    const leaf = document.querySelector('.sg-leaf');
    let h = -1, same = 0;
    for (let i = 0; i < 200 && same < 10; i++) { await new Promise((r) => requestAnimationFrame(r)); same = leaf.scrollHeight === h ? same + 1 : 0; h = leaf.scrollHeight; }
  });
}
// the leaf's scroll, the heading's place in it, and what has focus
const where = (p) => p.evaluate(() => {
  const leaf = document.querySelector('.sg-leaf'), lr = leaf.getBoundingClientRect();
  const hd = leaf.querySelector('.sg-top'), why = leaf.querySelector('.sg-why');
  const seen = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.top >= lr.top - 1 && r.top + 8 <= lr.bottom; };
  const a = document.activeElement;
  const v = RB.ui.shogi.state();
  return {
    view: v && v.view, top: Math.round(leaf.scrollTop), max: leaf.scrollHeight - leaf.clientHeight,
    heading: seen(hd), why: seen(why),
    focus: !a ? null : a.classList.contains('sg-top') ? 'heading' : a.dataset && a.dataset.a ? [a.dataset.a, a.dataset.id || a.dataset.v || '', a.dataset.hc || ''].join(':') : a.tagName.toLowerCase() + (a.className ? '.' + String(a.className).split(' ')[0] : ''),
    visible: !!(a && a.matches && a.matches(':focus-visible')),
  };
});
// scroll the ladder down to the button, as a reader does before tapping it: until it is at the bottom of the page
// (a puzzle, a game), or for a lesson near the ladder's top, on down until it is at the top of the page
const scrollTo = (p, sel, edge) => p.evaluate(([sel, edge]) => {
  const leaf = document.querySelector('.sg-leaf'), el = leaf.querySelector(sel);
  leaf.scrollTop = 0;
  const lr = leaf.getBoundingClientRect(), r = el.getBoundingClientRect();
  leaf.scrollTop = Math.max(0, edge === 'top' ? r.top - lr.top - 12 : r.bottom - lr.bottom + 12);
  return Math.round(leaf.scrollTop);
}, [sel, edge || 'bottom']);
// a tap in the page itself (Playwright's own click first scrolls what it clicks into view, which is not what is tested)
const tap = (p, sel) => p.evaluate((sel) => document.querySelector(sel).click(), sel);
// the lesson's asked move: its piece, then the goal
async function lessonMove(p, id) {
  const m = await p.evaluate((id) => {
    const L = RB.content.shogi.lessons.find((x) => x.id === id);
    let from = null;
    L.board.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === L.piece) from = [r, c]; }));
    return { from, to: L.goal.to };
  }, id);
  await p.click('[data-sq="' + m.from.join(',') + '"]');
  await p.click('[data-sq="' + m.to.join(',') + '"]');
}

// 1. bishop → Back to the ladder → rook → Leave → king, at phone width
{
  const { p, ctx, errors, requests } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  await open(p, 1.5);
  const t0 = await scrollTo(p, '[data-a="lesson"][data-id="B"]', 'top');
  await tap(p, '[data-a="lesson"][data-id="B"]');
  const w1 = await where(p);
  ok(t0 > 0 && w1.view === 'lesson' && w1.top === 0 && w1.heading && w1.why && w1.focus === 'heading', 'the bishop, opened after scrolling the ladder down (' + t0 + ' px): its top, the heading and its Japanese seen, the heading focused (' + J(w1) + ')');
  await lessonMove(p, 'B');
  await tap(p, '[data-a="ladder"]');
  const w2 = await where(p);
  ok(w2.view === 'ladder' && Math.abs(w2.top - t0) <= 2 && w2.focus === 'lesson:B:', 'Back to the ladder: the place it was left (' + t0 + ' px), the bishop\'s button focused (' + J(w2) + ')');
  // the rook's button sits beside the bishop's: tapped from where the ladder is
  await tap(p, '[data-a="lesson"][data-id="R"]');
  const w3 = await where(p);
  ok(w3.view === 'lesson' && w3.top === 0 && w3.heading && w3.why && w3.focus === 'heading', 'then the rook: its top, the heading and its Japanese seen, focused (' + J(w3) + ')');
  await tap(p, '[data-folio-close]');
  const w4 = await where(p);
  ok(w4.view === 'ladder' && Math.abs(w4.top - t0) <= 2 && w4.focus === 'lesson:R:', 'Leave: the ladder where it was, the rook\'s button focused (' + J(w4) + ')');
  await tap(p, '[data-a="lesson"][data-id="K"]');
  const w5 = await where(p);
  ok(w5.view === 'lesson' && w5.top === 0 && w5.heading && w5.focus === 'heading', 'then the king the same way (' + J(w5) + ')');
  ok(!errors.length && !requests.length, 'no page errors, no network (' + J(errors.concat(requests)).slice(0, 300) + ')');
  await ctx.close();
}

// 2. a puzzle, and the handicap game whose giver moves first
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  await open(p);
  const t0 = await scrollTo(p, '[data-a="tsume"]');
  await tap(p, '[data-a="tsume"]');
  const w1 = await where(p);
  ok(t0 > 0 && w1.view === 'tsume' && w1.top === 0 && w1.heading && w1.why && w1.focus === 'heading', 'a puzzle opened after scrolling (' + t0 + ' px): its top, heading and Japanese seen, focused (' + J(w1) + ')');
  await tap(p, '[data-folio-close]');
  const w2 = await where(p);
  ok(w2.view === 'ladder' && Math.abs(w2.top - t0) <= 2 && /^tsume:/.test(w2.focus), 'Leave: the ladder where it was, the puzzle\'s button focused (' + J(w2) + ')');
  const t1 = await scrollTo(p, '[data-a="play"][data-v="full"][data-hc="two"]');
  await tap(p, '[data-a="play"][data-v="full"][data-hc="two"]');
  await p.waitForFunction(() => { const v = RB.ui.shogi.state(); return v && v.view === 'game' && !v.thinking && v.g.turn === 0; }, null, { timeout: 30000 });
  const w3 = await where(p);
  ok(t1 > 0 && w3.view === 'game' && w3.top === 0 && w3.heading && w3.focus === 'heading', 'the two-piece handicap game, opened from the foot of the ladder (' + t1 + ' px): its top and heading, still focused after the giver\'s first move (' + J(w3) + ')');
  await tap(p, '[data-folio-close]');
  const w4 = await where(p);
  ok(w4.view === 'ladder' && Math.abs(w4.top - t1) <= 2 && w4.focus === 'play:full:two', 'Leave: the ladder where it was, that game\'s button focused (' + J(w4) + ')');
  ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
  await ctx.close();
}

// 3. what keeps its place, scrolled down within a view
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 600 }, mobile: true, touch: true });
  await open(p, 1.5);
  await tap(p, '[data-a="lesson"][data-id="R"]');
  const down = () => p.evaluate(() => { const l = document.querySelector('.sg-leaf'); l.scrollTop = l.scrollHeight; return Math.round(l.scrollTop); });
  const t0 = await down();
  await tap(p, '[data-sq="4,0"]');
  const w1 = await where(p);
  ok(t0 > 0 && w1.top === t0, 'choosing the rook, scrolled down (' + t0 + ' px): the page stays where it is (' + J(w1) + ')');
  await tap(p, '[data-sq="1,0"]');
  const w2 = await where(p);
  const said = await p.textContent('.sg-status');
  ok(w2.top === t0 && said.includes('The rook can go there, but that isn\'t the square asked for: start again.'), 'a square the rook can reach that is not the one asked: its words (RBN-QA-178\'s), the page where it is (' + J({ w2, said }) + ')');
  await tap(p, '[data-a="reset"]');
  const w3 = await where(p);
  ok(w3.view === 'lesson' && w3.top === t0, 'Start again: the same lesson, where it is (' + J(w3) + ')');
  await tap(p, '[data-folio-close]');
  await tap(p, '[data-a="play"][data-v="hasami"]');
  const t1 = await down();
  await tap(p, '[data-a="again"]');
  const w4 = await where(p);
  ok(t1 > 0 && w4.view === 'hasami' && w4.top === t1, 'New game in hasami shogi, scrolled down (' + t1 + ' px): where it is (' + J(w4) + ')');
  ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
  await ctx.close();
}

// 4. by keyboard, on a desktop with the largest text
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p, 1.5);
  const t0 = await scrollTo(p, '[data-a="lesson"][data-id="G"]', 'top');
  await p.focus('[data-a="lesson"][data-id="G"]');
  const t0f = await p.evaluate(() => Math.round(document.querySelector('.sg-leaf').scrollTop));
  await p.keyboard.press('Enter');
  const w1 = await where(p);
  ok(w1.view === 'lesson' && w1.top === 0 && w1.heading && w1.focus === 'heading' && w1.visible, 'Enter on the gold: its top, the heading focused and showing its focus ring (' + J(w1) + ')');
  await p.keyboard.press('Escape');
  const w2 = await where(p);
  ok(t0f === t0 && w2.view === 'ladder' && Math.abs(w2.top - t0) <= 2 && w2.focus === 'lesson:G:', 'Escape: the ladder where it was (' + t0 + ' px), the gold\'s button focused (' + J(w2) + ')');
  await p.keyboard.press('Enter');
  const w3 = await where(p);
  ok(w3.view === 'lesson' && (await p.evaluate(() => RB.ui.shogi.state().g.b[3][2].t)) === 'G' && w3.focus === 'heading', 'Enter again: the gold\'s lesson once more (' + J(w3) + ')');
  ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
  await ctx.close();
}

await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
