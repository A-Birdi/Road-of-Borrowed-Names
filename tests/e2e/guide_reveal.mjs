// RBN-QA-067 (Agnes 6313977773/6314731884; Local CL-102/CL-105; Cloud CC-057): in the Ledger's Guide → Kana, the
// stroke-order box sits above the chart, so a kana chosen further down was drawn out of view. Now, on choosing a kana
// (click, tap, Enter or Space): if the box is not wholly in view, the Guide's own page scrolls once, at once (no smooth
// scroll), to show it, and focus moves to "Back to ‹kana› in the chart", which scrolls back to where you were and
// returns focus to that kana; if the box is already in view nothing moves and focus stays on the kana. In Chromium on
// the built game, at 1280 × 860, on a phone (390 × 844, touch) and at 200% (640 × 400 at twice the pixels), each with
// the pointer (or a tap) and the keyboard:
//  1. the box in view: choosing a kana moves nothing (that page, the facing page, the window) and adds no button;
//     focus stays on the kana;
//  2. the box out of view: one scroll of that page only, straight to its end point (no positions between), the box
//     wholly in view showing the kana chosen, "Back to ‹kana› in the chart" in view and focused (visibly, from the
//     keyboard); the facing page and the window unmoved; the page then stays where it is (no correction), and a wheel
//     still scrolls it (desktop);
//  3. Back: the chart where it was (the kana at the place on the page you chose it from), the kana focused (visibly, from the keyboard), still the one shown; the button gone;
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_reveal.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

async function open(o) {
  const { p, errors } = await page(b, url, o);
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu' });
    s.learn.kanaKnown = 'both';
    RB.ui.menu.open('words');
  });
  await p.waitForTimeout(400);
  await p.click('.folio [data-sub="guide"]');
  await p.waitForTimeout(300);
  await p.click('.folio [data-g="kana"]');
  await p.waitForTimeout(400);
  // (watch the Guide's page: every scroll position it passes through)
  await p.evaluate(() => {
    const leaf = document.querySelector('.kdemo-box').closest('.leaf');
    window.__tops = []; leaf.addEventListener('scroll', () => window.__tops.push(leaf.scrollTop));
  });
  return { p, errors };
}
// where everything stands: the Guide's page, every other scrolling thing (the facing page, the window), the box, focus
const where = (p, k) => p.evaluate((k) => {
  const box = document.querySelector('.kdemo-box'), leaf = box.closest('.leaf'), lr = leaf.getBoundingClientRect(), br = box.getBoundingClientRect();
  const inView = (r) => r.top >= lr.top - 0.5 && r.bottom <= lr.bottom + 0.5 && r.height > 0;
  const others = [...document.querySelectorAll('*')].filter((n) => n !== leaf && n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(n).overflowY)).map((n) => (n.className || n.tagName).toString().slice(0, 30) + ':' + n.scrollTop);
  const back = document.querySelector('[data-kback]'), a = document.activeElement;
  return {
    top: Math.round(leaf.scrollTop), boxIn: inView(br), others: others.join(','), win: window.scrollY,
    shown: ((document.querySelector('.kinfo .jp') || {}).textContent || '').trim(),
    back: back ? { text: back.textContent.trim(), inView: inView(back.getBoundingClientRect()), focused: a === back, visible: back.matches(':focus-visible') && getComputedStyle(back).outlineStyle !== 'none' } : null,
    focus: a && a.classList.contains('kcell') ? a.dataset.k : a ? a.tagName + '.' + a.className : null,
    focusVisible: !!(a && a.matches(':focus-visible') && getComputedStyle(a).outlineStyle !== 'none'),
    tops: window.__tops.slice(),
    // (the chosen kana's place on the page, as you see it)
    cellY: k ? Math.round(document.querySelector('.kcell[data-k="' + k + '"]').getBoundingClientRect().top - lr.top) : null,
  };
}, k);
const frames = (p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
// put the Guide's page so that `which` holds: 'box' (the box at the top, a kana wholly in view below it) or 'far' (a
// kana far down the chart in view, the box out of view); returns that kana
const place = (p, which) => p.evaluate(async (which) => {
  const box = document.querySelector('.kdemo-box'), leaf = box.closest('.leaf');
  const cells = [...document.querySelectorAll('.kcell')];
  leaf.scrollTop = 0;
  const lr = () => leaf.getBoundingClientRect();
  const inView = (r) => r.top >= lr().top && r.bottom <= lr().bottom;
  let cell;
  if (which === 'box') {
    leaf.scrollTop = Math.max(0, leaf.scrollTop + box.getBoundingClientRect().top - lr().top - 4);
    cell = cells.find((c) => inView(c.getBoundingClientRect()));
  } else {
    cell = cells[Math.floor(cells.length * 0.8)];
    leaf.scrollTop += cell.getBoundingClientRect().top - lr().top - leaf.clientHeight / 2;
  }
  // (this placing's own scroll is reported a frame later: let it pass before watching)
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__tops = [];
  return cell && inView(cell.getBoundingClientRect()) ? { k: cell.dataset.k, boxIn: inView(box.getBoundingClientRect()) } : null;
}, which);
const settle = (p, ms = 700) => p.waitForTimeout(ms);

for (const [name, o, tap] of [
  ['desktop 1280×860', { viewport: { width: 1280, height: 860 } }, false],
  ['phone 390×844', { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 }, true],
  ['200% (640×400 at 2×)', { viewport: { width: 640, height: 400 }, dpr: 2 }, false],
]) {
  const { p, errors } = await open(o);
  const press = async (k) => { if (tap) await p.tap('.kcell[data-k="' + k + '"]'); else await p.click('.kcell[data-k="' + k + '"]'); };
  const key = async (k, how) => { await p.keyboard.press('Tab'); await p.evaluate((k) => document.querySelector('.kcell[data-k="' + k + '"]').focus({ preventScroll: true }), k); await p.keyboard.press(how); };
  const pointer = tap ? 'a tap' : 'the pointer';

  // 1. the box in view: nothing moves
  for (const [how, act] of [[pointer, press], ['Enter', (k) => key(k, 'Enter')]]) {
    const at = await place(p, 'box');
    const w0 = await where(p, at && at.k);
    if (at) await act(at.k);
    await settle(p);
    const w1 = await where(p, at && at.k);
    ok(at && at.boxIn && w1.top === w0.top && w1.cellY === w0.cellY && !w1.tops.length && w1.others === w0.others && w1.win === w0.win && !w1.back && w1.focus === at.k && w1.shown === at.k, name + ', the box in view, ' + how + ': nothing moves, no button, focus stays on ' + (at && at.k) + ' (' + JSON.stringify({ at, before: { top: w0.top, others: w0.others }, after: w1 }) + ')');
  }

  // 2-3. the box out of view: reveal, then Back
  for (const [how, act, back] of [
    [pointer, press, async () => { if (tap) await p.tap('[data-kback]'); else await p.click('[data-kback]'); }],
    ['Enter', (k) => key(k, 'Enter'), () => p.keyboard.press('Enter')],
    ['Space', (k) => key(k, 'Space'), () => p.keyboard.press('Space')],
  ]) {
    const kb = how !== pointer;
    const at = await place(p, 'far');
    const w0 = await where(p, at.k);
    await act(at.k);
    await frames(p);
    const w1 = await where(p, at.k);
    await settle(p);
    const w2 = await where(p, at.k);
    // (every position the page reported is the end point: no smooth scroll's positions between, no later correction)
    ok(at && !at.boxIn && w1.top < w0.top && w1.boxIn && w1.shown === at.k && w1.tops.length >= 1 && w1.tops.every((t) => t === w1.top) && w2.top === w1.top && w2.tops.length === w1.tops.length && w1.others === w0.others && w1.win === w0.win,
      name + ', ' + how + ' on ' + (at && at.k) + ' far down: the Guide\'s page alone moves, once, at once, to show the box (' + JSON.stringify({ at, before: { top: w0.top, others: w0.others, win: w0.win }, after: { top: w1.top, boxIn: w1.boxIn, shown: w1.shown, tops: w1.tops, others: w1.others, win: w1.win }, later: { top: w2.top, tops: w2.tops } }) + ')');
    ok(w1.back && w1.back.text === 'Back to ' + at.k + ' in the chart' && w1.back.inView && w1.back.focused && (!kb || w1.back.visible), name + ', ' + how + ': "Back to ' + (at && at.k) + ' in the chart" in view and focused' + (kb ? ', visibly' : '') + ' (' + JSON.stringify(w1.back) + ')');
    if (name.startsWith('desktop') && how === pointer) {
      await p.mouse.move(640, 400);
      await p.mouse.wheel(0, 240);
      await settle(p, 500);
      const w3 = await where(p);
      ok(w3.top > w2.top, name + ': a wheel still scrolls the Guide\'s page after the reveal, and it stays (' + JSON.stringify({ revealed: w2.top, wheeled: w3.top }) + ')');
      // (back to the revealed place for Back's check of where you were)
      await p.evaluate((t) => { document.querySelector('.kdemo-box').closest('.leaf').scrollTop = t; }, w2.top);
      await settle(p, 200);
    }
    // (no button, nothing to press: the check below fails)
    if (await p.$('[data-kback]')) await back();
    await settle(p);
    const w4 = await where(p, at.k);
    ok(Math.abs(w4.cellY - w0.cellY) <= 1 && w4.focus === at.k && (!kb || w4.focusVisible) && !w4.back && w4.shown === at.k && w4.others === w0.others && w4.win === w0.win,
      name + ', ' + how + ': Back puts the chart where it was (the kana where you chose it), focus on ' + at.k + (kb ? ' (visibly)' : '') + ', still shown; the button gone (' + JSON.stringify({ was: [w0.top, w0.cellY], now: [w4.top, w4.cellY], focus: w4.focus, focusVisible: w4.focusVisible, shown: w4.shown, back: w4.back }) + ')');
  }
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nguide_reveal: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
