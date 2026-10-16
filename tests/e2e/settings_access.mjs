// Settings are easy to find (PT-1b: a new learner's report, 2026-10-15, "Settings are not prominently displayed in the
// menu / hard to find"): the title lists Settings; on the map a Settings button sits beside Word help and the Ledger
// (a gear with its name for assistive technology on a phone); inside the Ledger, Settings sits beside Close at the top.
// Each opens the Settings folio by a real click, and closing it returns to where the player was.
// Usage: node tests/e2e/settings_access.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const box = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, name: e.getAttribute('aria-label') || e.textContent.trim() }; }, sel);
const settingsOpen = (p) => p.evaluate(() => !!document.querySelector('.folio-settings'));

for (const [w, h, label, touch] of [[1280, 800, 'desktop', false], [390, 844, 'phone', true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
  const { p, errors } = await page(b, url, { context: ctx });
  await p.waitForFunction(() => window.__RB_READY__);
  await p.waitForTimeout(800);
  // the title
  const t = await p.evaluate(() => [...document.querySelectorAll('.tm')].map((x) => x.textContent.trim()));
  assert(t.some((x) => /Settings/.test(x)), `${label}: the title lists Settings (${t.join(' / ')})`);
  // on the map
  await p.evaluate(() => RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }));
  await p.waitForTimeout(900);
  const hb = await box(p, '.hud .set-b');
  assert(hb && hb.y < 80 && hb.x + hb.w <= hb.vw && hb.w >= 40 && hb.h >= 40, `${label}: a Settings button on the map, top right, at least 40 px: ${JSON.stringify(hb)}`);
  assert(hb && /Settings/.test(hb.name), `${label}: it is named Settings (${hb && hb.name})`);
  await p.click('.hud .set-b');
  await p.waitForTimeout(400);
  assert(await settingsOpen(p), `${label}: clicking it opens Settings`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  const back = await p.evaluate(() => ({ open: !!document.querySelector('.folio-settings'), mode: RB.game.mode() }));
  assert(!back.open && back.mode === 'world', `${label}: Escape closes it and the map is back: ${JSON.stringify(back)}`);
  // inside the Ledger
  await p.click('.hud .menu-b');
  await p.waitForTimeout(700);
  const lb = await box(p, '.folio [data-util="settings"]');
  const close = await box(p, '.folio [data-folio-close]');
  assert(lb && close && lb.y < 70 && Math.abs(lb.y - close.y) < 4 && lb.x < close.x, `${label}: in the Ledger, Settings sits beside Close at the top: ${JSON.stringify({ lb, close })}`);
  // Save & Load joined them on the cover (LI-5): just left of Settings, and no foot under the pages
  const sv = await box(p, '.folio [data-util="save"]');
  const footShown = await p.evaluate(() => { const f = document.querySelector('.folio-foot'); return !!(f && f.offsetParent && f.textContent.trim()); });
  assert(sv && Math.abs(sv.y - lb.y) < 4 && sv.x < lb.x && !footShown, `${label}: Save & Load sits beside Settings, no foot: ${JSON.stringify({ sv, lb, footShown })}`);
  await p.click('.folio [data-util="settings"]');
  await p.waitForTimeout(400);
  assert(await settingsOpen(p), `${label}: the Ledger's Settings opens Settings`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  const still = await p.evaluate(() => ({ settings: !!document.querySelector('.folio-settings'), ledger: RB.ui.menu.isOpen() }));
  assert(!still.settings && still.ledger, `${label}: closing Settings leaves the Ledger open: ${JSON.stringify(still)}`);
  // the Ledger's Save & Load still works
  await p.click('.folio [data-util="save"]');
  await p.waitForTimeout(400);
  assert(await p.evaluate(() => !!document.querySelector('.sv-slip [data-a="save"]') && !!document.querySelector('.sv-slip [data-a="load"]')), `${label}: Save & Load still opens the inn ledger's choices`);
  assert(!errors.length, `${label}: no page errors ${errors.join(' | ')}`);
  await ctx.close();
}
await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all settings-access checks passed');
process.exit(fail ? 1 : 0);
