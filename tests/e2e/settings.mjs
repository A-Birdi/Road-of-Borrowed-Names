// Settings through the real Settings folio (named groups, real switches,
// radios and sliders): contrast, reduced motion, Japanese-led dialogue,
// instant text and text size are applied at once and survive a page reload
// (stored in IndexedDB).
// Usage: node tests/e2e/settings.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
const { p, errors } = await page(b, url, { context: ctx });
await p.waitForFunction(() => window.__RB_READY__);
await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); RB.ui.menu.open('settings'); });
// Display & Accessibility: real switches
await p.waitForSelector('[data-grp=display]');
await p.click('[data-grp=display]');
for (const k of ['contrast', 'reducedMotion']) {
  await p.click(`label.switch:has([data-sw=${k}])`);
  await p.waitForTimeout(120);
  assert(await p.isChecked(`[data-sw=${k}]`), k + ' switch reads On after one click');
}
// Reading & Language: real radio groups
await p.click('[data-grp=reading]');
for (const [k, v] of [['lead', 'ja'], ['textSpeed', 'instant']]) {
  await p.click(`label.opt:has(input[data-set=${k}][value="${v}"])`);
  await p.waitForTimeout(120);
  assert(await p.isChecked(`input[data-set=${k}][value="${v}"]`), k + '=' + v + ' radio checked');
}
const pv = await p.evaluate(() => { const b = document.querySelector('.pv-main'); return b ? { ruby: !!b.querySelector('ruby'), text: b.textContent.trim().slice(0, 20) } : null; });
assert(pv && pv.ruby, 'reading preview now leads with Japanese from the game, with furigana (' + (pv && pv.text) + ')');
await p.click('[data-grp=display]');
await p.evaluate(() => { const r = document.querySelector('[data-range="textScale"]'); r.value = '1.3'; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
await p.waitForTimeout(600);
const now = await p.evaluate(() => ({
  hc: document.body.classList.contains('high-contrast'), rm: document.body.classList.contains('reduced-motion'), ja: document.body.classList.contains('lead-ja'),
  scale: getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim(), speed: RB.game.settings.textSpeed, reduced: RB.game.reducedMotion(),
}));
assert(now.hc, 'high contrast applied');
assert(now.rm && now.reduced, 'reduced motion applied');
assert(now.ja, 'Japanese-led dialogue applied');
assert(now.speed === 'instant', 'instant text set');
assert(Math.abs(parseFloat(now.scale) - 1.3) < 0.01, 'text size applied (' + now.scale + ')');
await p.reload();
await p.waitForFunction(() => window.__RB_READY__);
await p.waitForTimeout(300);
const after = await p.evaluate(() => ({
  hc: document.body.classList.contains('high-contrast'), rm: document.body.classList.contains('reduced-motion'), ja: document.body.classList.contains('lead-ja'),
  scale: getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim(), speed: RB.game.settings.textSpeed,
}));
assert(after.hc && after.rm && after.ja && after.speed === 'instant' && Math.abs(parseFloat(after.scale) - 1.3) < 0.01, 'settings persisted across reload: ' + JSON.stringify(after));
assert(!errors.length, 'no page errors ' + errors.join('; '));
await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
