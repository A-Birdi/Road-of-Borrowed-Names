// The Ledger (the book), after LP-1 (Robin's Firefox report): what it must keep doing, and how fast it is, kept
// apart. In the built index.html, headless Chromium unless RB_BROWSER names another engine (tests/e2e/lib.mjs);
// journeys from two campaign fixtures, an early one (Manybridge's first part done) and a populated late one
// (Steamhollow done), each continued from the title screen in its own browser profile.
//  Functional (pass/fail):
//   - Back opens the book with its selected tab focused; furigana on the running head; the look kept: the grain is
//     the baked tile, the shadow its own layer under the leaves (no filter over the spread);
//   - every tab with real arrow keys: its page drawn, the selection and the ribbon follow; the rail keeps no
//     measuring state; a turn after a turn plays its motion again;
//   - a page's scroll position survives a visit to another tab;
//   - reduced motion: the book opens and turns with no motion;
//   - Settings opened over the book (a sheet over a sheet) closes back to the book, and Back then closes the book;
//   - the world goes on living under the book (every frame updates it) but is drawn on one frame in four, and on
//     every frame again once the book closes;
//   - browsing every tab changes nothing of the journey; no page errors.
//  Measured (reported, not judged here; a proxy in this engine, not Robin's Firefox on Windows): the first and a
//  repeated opening's synchronous time, and frame intervals while opening, turning and scrolling.
// Usage: node tests/e2e/ledger.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, engine } from './lib.mjs';

const FIXTURES = [['early', 'tests/fixtures/campaign/F-ren-mb1_done.json'], ['late', 'tests/fixtures/campaign/F-ren-yn_done.json']];
const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const measured = [];
const ok = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const wait = (p, ms) => p.waitForTimeout(ms);

async function journey(fx, view) {
  const st = JSON.parse(fs.readFileSync(path.join(root, fx), 'utf8'));
  const r = await page(b, url, { viewport: view || { width: 1536, height: 730 }, dpr: 1.25 });
  const { p } = r;
  await p.evaluate(async (st) => { await RB.save.writeSlot(1, st, { force: true }); }, st);
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.game.mode() === 'world' && !document.querySelector('.title'), null, { timeout: 20000 });
  for (let i = 0; i < 30 && await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.game.mode() !== 'world'); i++) { await p.keyboard.press('Enter'); await wait(p, 100); }
  await wait(p, 1500);
  // counters: the Ledger's opening (synchronous), the world's updates and its drawing, the frames
  await p.evaluate(() => {
    window.__openMs = []; const o = RB.ui.menu.open; RB.ui.menu.open = function (...a) { const t = performance.now(); const x = o.apply(this, a); window.__openMs.push(performance.now() - t); return x; };
    window.__draws = 0; const f = RB.render.frame; RB.render.frame = function (...a) { window.__draws++; return f.apply(this, a); };
    window.__updates = 0; const u = RB.world.update; RB.world.update = function (...a) { window.__updates++; return u.apply(this, a); };
    window.__fr = []; const tick = (t) => { window.__fr.push(t); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
  return r;
}
const frames = (p, from, to) => p.evaluate(([a, z]) => { const f = window.__fr.filter((t) => t >= a && t < z); const d = f.slice(1).map((t, i) => t - f[i]).sort((x, y) => x - y); return { n: d.length, p95: Math.round(d[Math.floor(d.length * 0.95)] || 0), max: Math.round(d[d.length - 1] || 0) }; }, [from, to]);
const now = (p) => p.evaluate(() => performance.now());
const state = (p) => p.evaluate(() => { const s = RB.game.s; return JSON.stringify({ flags: s.flags, quests: s.quests, inv: s.inv, words: s.words, vars: s.vars, seen: s.seen, comp: s.comp, map: s.map, x: s.x, y: s.y, learn: Object.keys(s.learn.items || {}).length }); });

for (const [label, fx] of FIXTURES) {
  console.log('== ' + label + ' journey (' + fx + '), ' + engine);
  const { p, errors, ctx } = await journey(fx);
  const before = await state(p);
  // ---- open
  const t0 = await now(p);
  await p.keyboard.press('Escape');
  await p.waitForSelector('.folio.book');
  await wait(p, 800);
  const t1 = await now(p);
  const look = await p.evaluate(() => {
    const sp = document.querySelector('.folio.book .spread'), leaf = sp && sp.querySelector('.leaf');
    const cast = sp && getComputedStyle(sp, '::before');
    return {
      mode: RB.game.mode(), focus: document.activeElement && document.activeElement.getAttribute('role'), sel: document.activeElement && document.activeElement.getAttribute('aria-selected'),
      ruby: [...document.querySelectorAll('.bk-runhead rt')].filter((r) => r.textContent.trim()).length,
      filter: sp && getComputedStyle(sp).filter, shadow: cast && cast.boxShadow, grain: leaf && /image-set\(|url\("?data:image\/png/.test(getComputedStyle(leaf).backgroundImage), svg: leaf && /svg/.test(getComputedStyle(leaf).backgroundImage),
    };
  });
  ok(look.mode === 'menu' && look.focus === 'tab' && look.sel === 'true', label + ': Back opens the book, its selected tab focused (' + JSON.stringify([look.mode, look.focus, look.sel]) + ')');
  ok(look.ruby > 0, label + ': the running head has its furigana');
  ok(look.filter === 'none' && /rgba\(0, 0, 0, 0\.35\)/.test(look.shadow || '') && look.grain && !look.svg, label + ': the look kept: the shadow its own layer, the grain the baked tile (' + JSON.stringify({ filter: look.filter, shadow: look.shadow, grain: look.grain, svg: look.svg }) + ')');
  // ---- the world under the book
  const w0 = await p.evaluate(() => ({ d: window.__draws, u: window.__updates, f: window.__fr.length }));
  await wait(p, 1500);
  const w1 = await p.evaluate(() => ({ d: window.__draws, u: window.__updates, f: window.__fr.length }));
  const under = { draws: w1.d - w0.d, updates: w1.u - w0.u, frames: w1.f - w0.f };
  ok(under.updates >= under.frames - 2 && under.draws <= Math.ceil(under.frames / 4) + 2 && under.draws >= Math.floor(under.frames / 4) - 2, label + ': under the book the world updates every frame and is drawn on one in four (' + JSON.stringify(under) + ')');
  // ---- every tab, real keys
  const tabs = await p.evaluate(() => [...document.querySelectorAll('.ptab')].map((t) => t.dataset.id));
  const t2 = await now(p);
  const seen = [];
  let turnsOk = true, prevTb = null;
  for (let i = 0; i < tabs.length; i++) {
    await p.keyboard.press('ArrowRight');
    await wait(p, 60);
    const st = await p.evaluate(() => {
      const sp = document.querySelector('.folio.book .spread'), on = document.querySelector('.ptab[aria-selected="true"]');
      const anims = sp ? sp.getAnimations({ subtree: true }).map((a) => a.animationName).filter(Boolean) : [];
      return { id: on && on.dataset.id, focus: document.activeElement === on, text: sp ? sp.textContent.replace(/\s+/g, ' ').trim().length : 0, measuring: !!document.querySelector('.tabrail-wrap.measure'), ribbon: (document.querySelector('.ribbon') || {}).style ? document.querySelector('.ribbon').style.transform : '', tb: sp && sp.classList.contains('tb'), turn: sp && sp.classList.contains('turn'), anims };
    });
    seen.push(st);
    if (st.turn && !st.anims.some((n) => /^bk-turn/.test(n))) turnsOk = false;
    if (prevTb !== null && st.turn && st.tb === prevTb) turnsOk = false;
    prevTb = st.turn ? st.tb : null;
    await wait(p, 350);
  }
  const t3 = await now(p);
  ok(seen.every((x, i) => x.id === tabs[(i + 1) % tabs.length] && x.focus && x.text > 20 && !x.measuring), label + ': every tab with the arrow keys draws its page, the selection and focus follow, the rail keeps no measuring state (' + seen.map((x) => x.id + ':' + x.text).join(' ') + ')');
  ok(new Set(seen.map((x) => x.ribbon)).size > 1, label + ': the ribbon moves with the selection');
  ok(turnsOk, label + ': every turn plays its motion, a turn after a turn by its other name');
  // ---- scroll memory: Journey's page scrolled, another tab, back again
  await p.evaluate(() => { const j = document.querySelector('.ptab[data-id="journey"]'); j.focus(); j.click(); });
  await wait(p, 400);
  const target = await p.evaluate(() => { const l = document.querySelector('.folio.book .leaf'); l.scrollTop = Math.min(240, l.scrollHeight - l.clientHeight); return l.scrollTop; });
  const t4 = await now(p);
  const box = await p.evaluate(() => { const r = document.querySelector('.folio.book .leaf').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(box.x, box.y);
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 100); await wait(p, 60); }
  await wait(p, 250);
  const t5 = await now(p);
  // (the wheel moved the same page on: that is the position to come back to)
  const kept = await p.evaluate(() => document.querySelector('.folio.book .leaf').scrollTop);
  await p.keyboard.press('ArrowRight'); await wait(p, 300);
  await p.keyboard.press('ArrowLeft'); await wait(p, 300);
  const back = await p.evaluate(() => document.querySelector('.folio.book .leaf').scrollTop);
  ok(target > 0 && kept > 0 && Math.abs(back - kept) <= 2, label + ': a page keeps its scroll position across a visit to another tab (' + kept + ' → ' + back + ')');
  // ---- Settings over the book, then back
  await p.click('.folio.book [data-util="settings"]');
  await p.waitForFunction(() => RB.ui.settings.isOpen());
  await p.keyboard.press('Escape'); await wait(p, 400);
  const nested = await p.evaluate(() => ({ settings: RB.ui.settings.isOpen(), book: !!document.querySelector('.folio.book:not(.closing)'), mode: RB.game.mode(), inBook: !!(document.activeElement && document.activeElement.closest('.folio.book')) }));
  ok(!nested.settings && nested.book && nested.mode === 'menu', label + ': Settings over the book closes back to the book (' + JSON.stringify(nested) + ')');
  // ---- close, the world drawn again at full rate
  await p.keyboard.press('Escape'); await wait(p, 500);
  const shut = await p.evaluate(() => ({ mode: RB.game.mode(), open: RB.ui.menu.isOpen() }));
  ok(shut.mode === 'world' && !shut.open, label + ': Back then closes the book');
  const c0 = await p.evaluate(() => ({ d: window.__draws, f: window.__fr.length }));
  await wait(p, 1000);
  const c1 = await p.evaluate(() => ({ d: window.__draws, f: window.__fr.length }));
  ok(c1.d - c0.d >= c1.f - c0.f - 2, label + ': once closed the world is drawn on every frame (' + (c1.d - c0.d) + ' of ' + (c1.f - c0.f) + ')');
  // ---- a repeated opening
  const t6 = await now(p);
  await p.keyboard.press('Escape'); await p.waitForSelector('.folio.book'); await wait(p, 800);
  const t7 = await now(p);
  await p.keyboard.press('Escape'); await wait(p, 400);
  ok((await state(p)) === before, label + ': browsing the book changed nothing of the journey');
  // ---- reduced motion
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await p.keyboard.press('Escape'); await p.waitForSelector('.folio.book'); await wait(p, 50);
  const still = await p.evaluate(() => document.querySelector('.folio.book').getAnimations({ subtree: true }).map((a) => a.animationName || ('transition:' + a.transitionProperty + '@' + (a.effect && a.effect.target ? a.effect.target.className : ''))));
  await p.keyboard.press('ArrowRight'); await wait(p, 50);
  const still2 = await p.evaluate(() => document.querySelector('.folio.book').getAnimations({ subtree: true }).map((a) => a.animationName || ('transition:' + a.transitionProperty + '@' + (a.effect && a.effect.target ? a.effect.target.className : ''))));
  // (motion: an animation, or a transition that moves something; a colour easing in is not motion)
  const moving = still.concat(still2).filter((x) => !/^transition:(background-color|color|border-color|box-shadow|outline-color)@/.test(x));
  ok(!moving.length, label + ': with reduced motion the book opens and turns without motion (' + JSON.stringify(still.concat(still2)) + ')');
  await p.keyboard.press('Escape'); await wait(p, 300);
  ok(!errors.length, label + ': no page errors ' + errors.slice(0, 2).join(' | '));
  const m = { journey: label, engine, openFirstMs: null, openRepeatMs: null, opening: await frames(p, t0, t1), turning: await frames(p, t2, t3), scrolling: await frames(p, t4, t5), reopening: await frames(p, t6, t7) };
  const om = await p.evaluate(() => window.__openMs.map((x) => Math.round(x)));
  m.openFirstMs = om[0]; m.openRepeatMs = om[1];
  measured.push(m);
  await ctx.close();
}
// a phone: one leaf, its shadow layer on the fore-edge side only, nothing wider than the screen
{
  const { p, errors, ctx } = await journey(FIXTURES[1][1], { width: 390, height: 844 });
  await p.keyboard.press('Escape'); await p.waitForSelector('.folio.book'); await wait(p, 800);
  const ph = await p.evaluate(() => { const sp = document.querySelector('.folio.book .spread'), c = getComputedStyle(sp, '::before'); return { two: sp.classList.contains('two'), left: c.left, overflow: document.documentElement.scrollWidth > innerWidth + 1 }; });
  ok(!ph.two && ph.left === '0px' && !ph.overflow, 'phone: one leaf, the shadow on the fore-edge side, nothing wider than the screen (' + JSON.stringify(ph) + ')');
  ok(!errors.length, 'phone: no page errors');
  await ctx.close();
}
await b.close(); srv.close();
for (const m of measured) console.log('MEASURED ' + JSON.stringify(m));
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
