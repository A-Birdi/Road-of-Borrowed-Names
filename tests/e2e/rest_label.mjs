// The Company page's line for a new talk away from a rest stop (Agnes 6548032279; Cloud CC-409; Local CL-567; Agnes
// 6548240195). In Chromium on the built game, on throwaway journeys with Nao (never a real save), Nao's first rest
// topic ("The right-hand pier") read on the Company page as a player opens it:
//  1. the Waystation Teahouse: "new — not here: talk where you can rest (an inn, a hut, a camp, or Hana's Teahouse)",
//     no Talk, no "Rest together" (it offers tea, not a night's rest);
//  2. Kawaya on the night Ichi is lost: the same line, no Talk, no "Rest together";
//  3. Hana's Teahouse, a hut and a camp: "you could talk about this now", Talk and "Rest together";
//  4. a talk already heard, at the Waystation: "talked about", no Talk;
//  5. at phone width (360×740), at the Waystation: the line wraps inside its row, all of it on screen, nothing cut
//     off, and the page does not scroll sideways;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/rest_label.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const LINE = 'new — not here: talk where you can rest (an inn, a hut, a camp, or Hana\'s Teahouse)';
const NOW = 'you could talk about this now';

// a twelve-chapter journey with Nao on `map`, Chapter 3 (as tests/e2e/rest_stops.mjs: Nao's first rest topic is open)
async function at(p, map, x, y, flags, heard) {
  await p.evaluate(([map, x, y, flags, heard]) => {
    RB.game.inBattle = () => false;
    if (RB.ui.menu.isOpen && RB.ui.menu.isOpen()) RB.ui.menu.close();
    const def = RB.content.maps[map] || {}, seen = {};
    for (const ev of def.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
    const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'nao', flags: Object.assign({ departed: true, ch1_done: true }, seen, flags || {}) });
    s.chapter = 3;
    RB.company.sync(s, 'live');
    if (heard) s.company.talk['t:t.nao.pier'] = { st: 'done' };
    RB.company.refresh(s); RB.bus.emit('company:changed', {});
  }, [map, x, y, flags || {}, !!heard]);
  await p.waitForTimeout(150);
}
// the Company page once the folio has finished opening; the pier topic's row, its line's box, and the page's width
async function company(p) {
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForSelector('.co-page');
  await p.waitForFunction(() => !document.getAnimations().some((a) => { const el = a.effect && a.effect.target; return (a.playState === 'running' || a.pending) && el && el.closest && el.closest('.folio') && a.effect.getComputedTiming().endTime !== Infinity; }), null, { timeout: 5000 });
  const r = await p.evaluate(() => {
    const row = Array.from(document.querySelectorAll('.co-topics .entry')).find((e) => /right-hand pier/.test(e.textContent));
    const k = row && row.querySelector('.kind');
    if (k) k.scrollIntoView({ block: 'center' });
    const kb = k && k.getBoundingClientRect(), rb = row && row.getBoundingClientRect();
    const lh = k && parseFloat(getComputedStyle(k).lineHeight) || (k && parseFloat(getComputedStyle(k).fontSize) * 1.2);
    const de = document.scrollingElement || document.documentElement;
    return {
      rest: !!document.querySelector('[data-co-act=rest]'), talk: !!document.querySelector('[data-co-topic="t.nao.pier"]'), line: k ? k.textContent : null,
      box: kb && { left: Math.round(kb.left), right: Math.round(kb.right), lines: Math.round(kb.height / lh), clipped: k.scrollWidth > k.clientWidth + 1, inRow: kb.left >= rb.left - 1 && kb.right <= rb.right + 1, vw: innerWidth },
      sideways: de.scrollWidth > de.clientWidth + 1,
    };
  });
  await p.evaluate(() => RB.ui.menu.close());
  return r;
}

{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // 1. the Waystation Teahouse
  await at(p, 'kr.foot_inn', 6, 6);
  const w = await company(p);
  ok(w.line === LINE && !w.talk && !w.rest, '1 the Waystation Teahouse: the new line, no Talk, no "Rest together" ' + flat({ line: w.line, talk: w.talk, rest: w.rest }));
  // 2. Kawaya on the night Ichi is lost
  await at(p, 'mb.inn', 6, 7, { mb_night: true, mb_ichi_lost: true });
  const k = await company(p);
  ok(k.line === LINE && !k.talk && !k.rest, '2 Kawaya on the night Ichi is lost: the same line, no Talk, no "Rest together" ' + flat({ line: k.line, talk: k.talk, rest: k.rest }));
  // 3. Hana's Teahouse, a hut, a camp
  const yes = [];
  for (const [m, x, y] of [['rw.tea', 5, 6], ['sa.hut', 5, 5], ['sa.camp', 10, 10]]) { await at(p, m, x, y); const c = await company(p); yes.push([m, c.line, c.talk, c.rest]); }
  ok(yes.every((y) => y[1] === NOW && y[2] && y[3]), '3 Hana\'s Teahouse, a hut, a camp: "you could talk about this now", Talk, "Rest together" ' + flat(yes));
  // 4. a talk already heard, at the Waystation
  await at(p, 'kr.foot_inn', 6, 6, {}, true);
  const h = await company(p);
  ok(h.line === 'talked about' && !h.talk, '4 heard, at the Waystation: "talked about", no Talk ' + flat({ line: h.line, talk: h.talk }));
  ok(!errors.length, '1–4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 5. at phone width
{
  const { p, errors } = await page(b, url, { viewport: { width: 360, height: 740 } });
  await at(p, 'kr.foot_inn', 6, 6);
  const n = await company(p);
  ok(n.line === LINE && n.box && n.box.lines >= 2 && !n.box.clipped && n.box.inRow && n.box.left >= 0 && n.box.right <= n.box.vw && !n.sideways,
    '5 at 360×740: the line wraps inside its row, all of it on screen, nothing cut off, no sideways scroll ' + flat(n.box) + ' sideways ' + n.sideways);
  ok(!errors.length, '5 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nrest_label: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
