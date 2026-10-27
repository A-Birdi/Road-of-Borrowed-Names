// A tile pane redrawn under a still mouse (Agnes 6436544482, 6437095878; Local CL-475, CL-478, CL-479; CC-342,
// CC-343), in Chromium on the built game, word help on. A mouse click that places or removes a tile redraws the pane,
// and the browser then reports the pointer over whichever word slid beneath it; that one pointerover, at the press's
// own position, must not open the word's card. Real mouse, touch and keyboard input unless marked synthetic:
//  the order step (the Old Mill's jammed gears, tier F):
//   1. a centre click places the tile, and no card opens for the tile that slid under the pointer;
//      1b. the same with the pointer at a fractional position (+0.7 px; the click's own coordinates are whole pixels);
//   2. a click on a placed tile in "Your order" takes it back, and no card opens for the word that slid up under it;
//   3. a click in a tile's margin (not on its word): placed, no card, as before;
//   4. after that, moving off the word and back opens its card;
//   5. rapid moves across the remaining words: each word's card;
//   6. a 1 px move (the boundary, documented): within the word that slid under the pointer, no card until the
//      pointer enters a word; a 1 px move that enters a word opens its card;
//   7. a click on empty pool space redraws nothing and arms nothing: a later redraw by a click with no pointer (as
//      the keyboard's) under the same pointer shows the card as before;
//   8. (synthetic: a mouse pointer cannot be cancelled on demand) the guard's lifetime: an armed guard stops the
//      one pointerover onto a word at the press's position, once, and lets one onto the pane itself pass; a
//      pointercancel, a move or an entry elsewhere, leaving the pane, a key or 500 ms disarms it; touch, pen and
//      keyboard clicks never arm it;
//   9. touch: a tap places a tile with no card; a long press opens the card and places nothing, as before;
//  10. the keyboard: Tab to a word opens its card, Enter on a tile places it, and Tab to a word still opens its card;
//  a forged sentence's pieces (build): placement and removal, as 1 and 2.
// Usage: node tools/build.mjs && node tests/e2e/tile_hover_guard.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const settle = (p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)))));
// the open card's word, or null
const card = (p) => p.evaluate(() => { const h = document.querySelector('#overlay .help .hw'); return h ? h.firstChild.textContent : null; });
const hide = (p) => p.evaluate(() => RB.ui.help.hide(true));
const text = (t) => t.textContent.replace(/\s/g, '');
// the tiles of a list (the pool, or what is placed): each one's word and its first word's box
const tiles = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].map((t) => {
  const r = t.getBoundingClientRect(), j = t.querySelector('.jt').getBoundingClientRect();
  return { w: t.textContent.replace(/\s/g, ''), x: r.x, y: r.y, wd: r.width, h: r.height, jx: j.x, jy: j.y, jw: j.width, jh: j.height };
}), sel);
const texts = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].map((t) => t.textContent.replace(/\s/g, '')), sel);
// the word (and its tile) under a point
const under = (p, x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const j = e && e.closest('.jt'), t = e && e.closest('.tile'); return { word: j ? j.textContent.replace(/\s/g, '') : null, tile: t ? t.textContent.replace(/\s/g, '') : null }; }, [x, y]);
// every pointerup, click and pointerover the page receives, as the window hears it first (before the pane)
const listen = (p) => p.evaluate(() => {
  window.__ev = [];
  for (const k of ['pointerup', 'click', 'pointerover']) window.addEventListener(k, (e) => { const j = e.target.closest && e.target.closest('.jt'); window.__ev.push({ k, x: e.clientX, y: e.clientY, t: e.pointerType, d: e.detail, w: j ? j.textContent.replace(/\s/g, '') : null }); }, true);
});
const events = (p) => p.evaluate(() => window.__ev.slice());

const POOL = '.chal .tiles .tile', BUILT = '.chal .built .tile.placed';
// the Old Mill's jammed gears (tier F: four kana tiles to set in counting order), word help on, the mouse parked
async function gears(opts) {
  const P = await page(b, url, opts || {});
  await P.p.evaluate(() => {
    RB.game.inBattle = () => false;
    const s = RB.game.debugStart('rw.village', 22, 30, { profile: 'F' });
    s.learn.kanaKnown = 'both';
    if (!RB.game.settings.lightbulb) RB.ui.help.toggle(true);
    RB.challenge.run('rw.c_mill_gears', {});
  });
  await P.p.waitForSelector('.chal[data-kind=order] .tiles .tile');
  if (!opts || !opts.touch) await P.p.mouse.move(5, 5);
  await settle(P.p);
  return P;
}
const done = async (P, tag) => { ok(!P.errors.length && !P.requests.length, tag + ': no page errors, no network' + (P.errors.length ? ': ' + P.errors.slice(0, 2).join(' | ') : '')); await P.ctx.close(); };
// a real mouse click at a point: move there (as a hand would), press, release
async function clickAt(p, x, y) { await p.mouse.move(x, y, { steps: 4 }); await settle(p); await p.mouse.down(); await p.mouse.up(); await settle(p); }

// 1, 4, 5, 6a: a centre click places a tile; then a later hover, rapid moves, a 1 px move
{
  const P = await gears();
  const p = P.p;
  const t0 = (await tiles(p, POOL))[0], t1 = (await tiles(p, POOL))[1];
  const cx = t0.x + t0.wd / 2, cy = t0.y + t0.h / 2;
  await p.mouse.move(cx, cy, { steps: 4 }); await settle(p);
  ok((await card(p)) === t0.w, '1 hovering the first tile\'s word opens its card, as before (' + (await card(p)) + ')');
  await p.mouse.down(); await p.mouse.up(); await settle(p);
  const u = await under(p, cx, cy);
  ok(JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]), '1 a centre click places the tile: ' + (await texts(p, BUILT)).join(' '));
  ok(u.word === t1.w, '1 the next tile\'s word slid under the still pointer (' + u.word + '), so a stray card would be its');
  ok((await card(p)) === null, '1 no card opens for it: ' + (await card(p)));
  // 6a: a 1 px move within that word: no new entry, so no card (the boundary)
  await p.mouse.move(cx + 1, cy); await settle(p);
  ok((await card(p)) === null && (await under(p, cx + 1, cy)).word === t1.w, '6 a 1 px move within the word beneath: no card until the pointer enters a word (the documented boundary)');
  // 4: off the word and back
  await p.mouse.move(cx, t1.y - 20, { steps: 3 }); await settle(p);
  await p.mouse.move(cx, cy, { steps: 3 }); await settle(p);
  ok((await card(p)) === t1.w, '4 moving off the word and back opens its card: ' + (await card(p)));
  // 5: rapid moves across the remaining words
  const left = await tiles(p, POOL), seen = [];
  for (const t of left) { await p.mouse.move(t.jx + t.jw / 2, t.jy + t.jh / 2, { steps: 2 }); await p.waitForTimeout(40); seen.push(await card(p)); }
  ok(JSON.stringify(seen) === JSON.stringify(left.map((t) => t.w)), '5 rapid moves across the remaining words: each one\'s card (' + seen.join(' ') + ')');
  await done(P, '1, 4, 5, 6');
}

// 1b: the same at a fractional position: the click's coordinates are whole pixels, the press's and the stray's are not
{
  const P = await gears();
  const p = P.p;
  const [t0, t1] = await tiles(p, POOL);
  const cx = Math.floor(t0.x + t0.wd / 2) + 0.7, cy = Math.floor(t0.y + t0.h / 2) + 0.7;
  await p.mouse.move(cx, cy, { steps: 4 }); await settle(p);
  await listen(p);
  await p.mouse.down(); await p.mouse.up(); await settle(p);
  const ev = await events(p);
  const up = ev.find((e) => e.k === 'pointerup'), ck = ev.find((e) => e.k === 'click'), over = ev.find((e) => e.k === 'pointerover' && e.w === t1.w);
  const f = (e) => e ? '(' + e.x + ', ' + e.y + ')' : 'none';
  console.log('     1b events: pointerup ' + f(up) + ', click ' + f(ck) + ', the pointerover on ' + t1.w + ' ' + f(over));
  ok(JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]) && (await under(p, cx, cy)).word === t1.w, '1b at +0.7 px: placed, and ' + t1.w + ' slid under the pointer');
  ok((await card(p)) === null, '1b at +0.7 px: no card opens for it: ' + (await card(p)));
  await done(P, '1b');
}

// 2: removal from "Your order"
{
  const P = await gears();
  const p = P.p;
  // two placed by the program (clicks with no pointer, as the keyboard's: nothing to guard; the mouse is parked away)
  const two = () => p.evaluate(() => {
    const clr = document.querySelector('.chal [data-o=clr]');
    if (!clr.disabled) clr.click();
    document.querySelector('.chal .tiles [data-add]').click();
    document.querySelector('.chal .tiles [data-add]').click();
  });
  await two(); await settle(p);
  const [a, z] = await tiles(p, BUILT);
  // where the next placed word lands once the first is taken back: the list shortens and the sheet re-centres, so it
  // lands lower in the first tile than its centre (measured by the program first, then the two placed again)
  await p.evaluate(() => document.querySelector('.chal .built [data-rm]').click()); await settle(p);
  const [z1] = await tiles(p, BUILT);
  await two(); await settle(p);
  const cx = z1.jx + z1.jw / 2, cy = (Math.max(a.y, z1.jy) + Math.min(a.y + a.h, z1.jy + z1.jh)) / 2;
  await p.mouse.move(cx, cy, { steps: 4 }); await settle(p);
  const u0 = await under(p, cx, cy);
  ok(u0.tile === a.w && u0.word === null && (await card(p)) === null, '2 the point is on the first placed tile (' + a.w + '), below its word, where the next word will land; no card');
  await p.mouse.down(); await p.mouse.up(); await settle(p);
  ok(JSON.stringify(await texts(p, BUILT)) === JSON.stringify([z.w]) && (await under(p, cx, cy)).word === z.w, '2 a click takes it back, and the next placed word slid up under the pointer (' + (await under(p, cx, cy)).word + ')');
  ok((await card(p)) === null, '2 no card opens for it: ' + (await card(p)));
  await done(P, '2');
}

// 3: a click in a tile's margin, not on its word
{
  const P = await gears();
  const p = P.p;
  const [t0] = await tiles(p, POOL);
  const mx = t0.x + 4, my = t0.y + t0.h / 2;
  ok((await under(p, mx, my)).word === null && (await under(p, mx, my)).tile === t0.w, '3 the margin point is on the tile but not on its word');
  await clickAt(p, mx, my);
  ok(JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]) && (await card(p)) === null && (await under(p, mx, my)).word === null, '3 a margin click places the tile, and no card opens, as before');
  await done(P, '3');
}

// 6b: a 1 px move that enters a word opens its card
{
  const P = await gears();
  const p = P.p;
  const [t0, t1] = await tiles(p, POOL);
  // the last whole pixel left of the first word that is not on it (the browser's hit test, not the word's box)
  const y = Math.round(t0.jy + t0.jh / 2);
  let x = Math.ceil(t0.jx);
  while ((await under(p, x, y)).word && x > t0.x) x--;
  ok((await under(p, x, y)).word === null && (await under(p, x, y)).tile === t0.w && (await under(p, x + 1, y)).word === t0.w, '6 at x ' + x + ' the pointer is on the first tile, a pixel left of its word');
  await clickAt(p, x, y);
  ok(JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]) && (await card(p)) === null && (await under(p, x, y)).word === null && (await under(p, x + 1, y)).word === t1.w, '6 placed; the next word now begins a pixel to the right');
  await p.mouse.move(x + 1, y); await settle(p);
  ok((await card(p)) === t1.w, '6 a 1 px move that enters a word opens its card: ' + (await card(p)));
  await done(P, '6b');
}

// 7: a click that redraws nothing arms nothing
{
  const P = await gears();
  const p = P.p;
  const pool0 = await tiles(p, POOL), last = pool0[pool0.length - 1];
  const px = last.jx + last.jw / 2, py = last.jy + last.jh / 2;
  await p.evaluate(() => document.querySelector('.chal .tiles [data-add]').click()); await settle(p);
  ok((await under(p, px, py)).tile === null, '7 with one tile placed, where the last word was is empty pool space');
  await clickAt(p, px, py);
  ok((await texts(p, BUILT)).length === 1 && (await card(p)) === null, '7 a click there changes nothing');
  await p.evaluate(() => document.querySelector('.chal .built [data-rm]').click()); await settle(p);
  ok((await under(p, px, py)).word === last.w && (await card(p)) === last.w, '7 a later redraw by a click with no pointer (as the keyboard\'s) brings ' + last.w + ' back under the pointer and its card opens, as before (nothing was armed): ' + (await card(p)));
  await done(P, '7');
}

// 8: the guard's lifetime, with synthetic events (the mouse parked away, so the browser adds none)
{
  const P = await gears();
  const p = P.p;
  const [t0, t1] = await tiles(p, POOL);
  const C = [Math.round(t0.x + t0.wd / 2), Math.round(t0.y + t0.h / 2)];
  // reset the pane (Clear, by the program), then a press and click of `type` at C on the first tile
  const press = (type, detail) => p.evaluate(([C, type, detail]) => {
    RB.ui.help.hide(true);
    const clr = document.querySelector('.chal [data-o=clr]');
    if (!clr.disabled) clr.click();
    const el = document.elementFromPoint(C[0], C[1]);
    const o = { bubbles: true, cancelable: true, composed: true, pointerId: 7, isPrimary: true, pointerType: type, clientX: C[0], clientY: C[1] };
    el.dispatchEvent(new PointerEvent('pointerup', o));
    el.dispatchEvent(new PointerEvent('click', Object.assign({ detail, button: 0 }, o)));
    return [...document.querySelectorAll('.chal .built .tile')].length;
  }, [C, type, detail]);
  // a mouse pointerover at (x, y) on whatever is there; then the card's word
  const over = (dx, dy) => p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true, composed: true, pointerId: 7, isPrimary: true, pointerType: 'mouse', clientX: x, clientY: y })); const h = document.querySelector('#overlay .help .hw'); return h ? h.firstChild.textContent : null; }, [C[0] + (dx || 0), C[1] + (dy || 0)]);
  const on = (js) => p.evaluate(([js, C]) => { const pane = document.querySelector('.chal .pane-order'), el = document.elementFromPoint(C[0], C[1]); return new Function('pane', 'el', 'C', js)(pane, el, C); }, [js, C]);
  ok((await press('mouse', 1)) === 1 && (await under(p, C[0], C[1])).word === t1.w, '8 a mouse press and click at the centre place the tile; ' + t1.w + ' is now there');
  ok((await over()) === null, '8 armed: the pointerover at the press\'s position is stopped (no card)');
  await hide(p);
  ok((await over()) === t1.w, '8 consumed once: the next pointerover there opens the card');
  // the browser's first report after a redraw is the pane itself (the word that was under the pointer is gone)
  await press('mouse', 1);
  const heard = await p.evaluate((C) => {
    let n = 0;
    const f = () => { n++; };
    document.addEventListener('pointerover', f);
    document.querySelector('.chal .pane-order .tiles').dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true, composed: true, pointerId: 7, isPrimary: true, pointerType: 'mouse', clientX: C[0], clientY: C[1] }));
    document.removeEventListener('pointerover', f);
    return n;
  }, C);
  ok(heard === 1 && (await over()) === null, '8 a pointerover there onto the pane itself passes (the document hears it) and leaves it armed: the one onto the word is then stopped');
  const cases = [
    ['a pointercancel', 'el.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: 7, pointerType: "mouse" }))'],
    ['a move elsewhere', 'el.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 7, pointerType: "mouse", clientX: C[0] + 2, clientY: C[1] }))'],
    ['leaving the pane', 'pane.dispatchEvent(new PointerEvent("pointerleave", { pointerId: 7, pointerType: "mouse", clientX: 5, clientY: 5 }))'],
    ['a key', 'el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Shift", code: "ShiftLeft" }))'],
  ];
  for (const [what, js] of cases) {
    await press('mouse', 1);
    await on(js);
    ok((await over()) === t1.w, '8 ' + what + ' disarms it: the pointerover at the press\'s position then opens the card');
  }
  await press('mouse', 1);
  const entry = await over(2, 0);
  await hide(p);
  ok(entry === t1.w && (await over()) === t1.w, '8 an entry 2 px away goes through (its card opens) and disarms it');
  await press('mouse', 1);
  await p.waitForTimeout(600);
  ok((await over()) === t1.w, '8 after 500 ms it is disarmed');
  for (const [type, detail, what] of [['touch', 1, 'a touch tap'], ['pen', 1, 'a pen tap'], ['', 0, 'a keyboard click']]) {
    ok((await press(type, detail)) === 1 && (await over()) === t1.w, '8 ' + what + ' never arms it: the pointerover at its position opens the card');
  }
  await done(P, '8');
}

// 9: touch
{
  const P = await gears({ touch: true });
  const p = P.p;
  const [t0, t1] = await tiles(p, POOL);
  await p.touchscreen.tap(t0.x + t0.wd / 2, t0.y + t0.h / 2); await settle(p);
  ok(JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]) && (await card(p)) === null, '9 a tap places the tile, with no card, as before');
  // a long press, held 700 ms (word help opens one at 450 ms), on the word now first in the pool
  const s = await P.ctx.newCDPSession(p);
  const at = (await tiles(p, POOL))[0];
  ok(at.w === t1.w, '9 ' + t1.w + ' is now the first tile');
  const nx = at.jx + at.jw / 2, ny = at.jy + at.jh / 2;
  await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: nx, y: ny }] });
  await p.waitForTimeout(700);
  const during = await card(p);
  await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(p);
  ok(during === t1.w && (await card(p)) === t1.w && JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]), '9 a long press on ' + t1.w + ' opens its card and places nothing, as before (' + during + ')');
  await done(P, '9');
}

// 10: the keyboard
{
  const P = await gears();
  const p = P.p;
  const [t0, t1] = await tiles(p, POOL);
  const focusTile = (i) => p.evaluate((i) => { document.querySelectorAll('.chal .tiles .tile')[i].focus(); }, i);
  const active = () => p.evaluate(() => { const a = document.activeElement; return { jt: !!(a && a.classList.contains('jt')), tile: a && a.closest('.tile') ? a.closest('.tile').textContent.replace(/\s/g, '') : null }; });
  await focusTile(0);
  await p.keyboard.press('Tab'); await settle(p);
  const a1 = await active();
  ok(a1.jt && a1.tile === t0.w && (await card(p)) === t0.w, '10 Tab to the first tile\'s word opens its card, as before (' + (await card(p)) + ')');
  await p.keyboard.press('Shift+Tab'); await settle(p);
  const a2 = await active();
  await p.keyboard.press('Enter'); await settle(p);
  ok(!a2.jt && a2.tile === t0.w && JSON.stringify(await texts(p, BUILT)) === JSON.stringify([t0.w]), '10 Enter on the tile places it');
  await hide(p);
  await focusTile(0);
  await p.keyboard.press('Tab'); await settle(p);
  const a3 = await active();
  ok(a3.jt && a3.tile === t1.w && (await card(p)) === t1.w, '10 then Tab to the next word still opens its card: nothing suppressed (' + (await card(p)) + ')');
  await done(P, '10');
}

// a forged sentence's pieces (the workshop's L7, rung 2): placement and removal
{
  const P = await page(b, url, {});
  const p = P.p;
  await p.evaluate(() => {
    RB.game.inBattle = () => false;
    const s = RB.game.debugStart('rw.village', 22, 30, { profile: 'E' });
    s.learn.kanaKnown = 'both';
    RB.game.settings.forgeRung = null;
    if (!RB.game.settings.lightbulb) RB.ui.help.toggle(true);
    RB.ui.workshop.tryFamily(RB.content.workshop.families.find((f) => f.id === 'L7'), 'E', () => {});
  });
  await p.waitForSelector('.chal[data-kind=forge]');
  await p.click('.chal-tabs .ptab[data-mode="build"]');
  await p.waitForSelector('.pane-build .tiles .tile');
  await p.mouse.move(5, 5); await settle(p);
  const BP = '.pane-build .tiles .tile', BB = '.chal .forge-line .built .tile.placed';
  const [t0, t1] = await tiles(p, BP);
  const cx = t0.jx + t0.jw / 2, cy = t0.jy + t0.jh / 2;
  await clickAt(p, cx, cy);
  const u = await under(p, cx, cy);
  ok(JSON.stringify(await texts(p, BB)) === JSON.stringify([t0.w]) && u.tile === t1.w && !!u.word, 'build 1 a click on the first piece\'s word places it, and the next piece\'s word (' + u.word + ') slid under the pointer');
  ok((await card(p)) === null, 'build 1 no card opens for it: ' + (await card(p)));
  // removal: a second piece placed by the program, then a click on the first placed piece's word
  await p.mouse.move(5, 5); await settle(p);
  await p.evaluate(() => document.querySelector('.pane-build .tiles [data-add]').click()); await settle(p);
  const [a, z] = await tiles(p, BB);
  const rx = a.jx + a.jw / 2, ry = a.jy + a.jh / 2;
  await clickAt(p, rx, ry);
  const v = await under(p, rx, ry);
  ok(JSON.stringify(await texts(p, BB)) === JSON.stringify([z.w]) && v.tile === z.w && !!v.word, 'build 2 a click on the first placed piece\'s word takes it back, and the next placed piece\'s word (' + v.word + ') slid up under the pointer');
  ok((await card(p)) === null, 'build 2 no card opens for it: ' + (await card(p)));
  await done(P, 'build');
}

console.log(`\ntile_hover_guard: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
