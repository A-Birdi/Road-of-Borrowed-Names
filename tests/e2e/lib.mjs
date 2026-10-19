// Shared Playwright helpers: static server with a stable origin, browser
// launch, console/network error capture. Tests always load the BUILT index.html.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }
export const { chromium } = pw;

export function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      // RB_PAGE=zz_dev.html points a run at a scratch build (never committed) while a suite reads index.html
      if (p === '/') p = '/' + (process.env.RB_PAGE || 'index.html');
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      const type = f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

// RB_BROWSER=firefox (or webkit) runs a suite in another engine; Chromium is the default. Each engine needs its own
// Playwright browser build installed (a Chromium-only machine reports the missing build when it launches).
export const engine = (process.env.RB_BROWSER || 'chromium').toLowerCase();
export async function launch(opts = {}) {
  // sound may start without a gesture, as in the Chromium runs (each engine has its own switch for it)
  if (engine === 'firefox') return pw.firefox.launch({ firefoxUserPrefs: { 'media.autoplay.default': 0, 'media.autoplay.blocking_policy': 0 } });
  if (engine === 'webkit') return pw.webkit.launch();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  return browser;
}

// New page with error + request capture. Any request that is not to the test
// origin (or data:/blob:) is recorded as an unexpected network request.
export async function page(browser, url, opts = {}) {
  // (Firefox has no mobile emulation: a phone there is its viewport and touch only)
  const ctx = opts.context || await browser.newContext(Object.assign({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, deviceScaleFactor: opts.dpr || 1 }, engine === 'firefox' ? {} : { isMobile: !!opts.mobile }));
  const p = await ctx.newPage();
  const errors = [], requests = [], logs = [];
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); logs.push(m.type() + ': ' + m.text()); });
  const origin = url.startsWith('http') ? new URL(url).origin : null;
  p.on('request', (r) => {
    const u = r.url();
    if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('file:')) return;
    if (origin && u.startsWith(origin)) return;
    requests.push(u);
  });
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 });
  // The hosted game reads its voices from the voices' own site (HOSTED_BASE, ../Road-of-Borrowed-Names-voices/ja-JP/),
  // which these local servers never serve: a suite runs as the game did without one (nothing is fetched before a line
  // plays, so this is in time), unless it asks for the shipped base (voiceSite: true; tests/e2e/voice_runtime.mjs).
  // (and again after a reload, which brings back the shipped base: the prologue speaks as soon as a new journey starts)
  if (!opts.voiceSite) {
    const noSite = () => p.evaluate(() => { const V = window.RB && RB.voicebank; if (V && V.configure && !V._.S.embedded) V.configure({ base: null }); });
    await noSite();
    p.on('load', () => { p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 }).then(noSite).catch(() => {}); });
  }
  return { p, ctx, errors, requests, logs };
}

// After a response's step is answered in battle: if your companion's turn
// opens (the response is queued), choose their action — the one whose data-a
// is `pick`, or matching `match` (a RegExp source over the card's text), or
// the first one available — with a real click. Resolves the action's text, or
// null when there was no companion's turn (no companion, or the fight ended).
export async function companionTurn(p, o) {
  o = o || {};
  const t0 = Date.now();
  while (Date.now() - t0 < (o.timeout || 4000)) {
    const s = await p.evaluate(() => ({ c: !!document.querySelector('.ccard'), ph: RB.combat.phase() }));
    if (s.c) {
      // (the menu ignores presses in its first moments: a deliberate choice comes after that)
      await p.waitForTimeout(o.delay != null ? o.delay : 320);
      // the first time, a short note explains the companion's turn: read it, then "Got it"
      // (the pointer is moved off first: left where Continue was, it can rest on a keyword — on a phone the
      // Harmony band — whose hover note then covers "Got it"; the note closes 250 ms after the pointer leaves)
      if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]'); await p.waitForTimeout(80); }
      const sel = await p.evaluate((o) => {
        const cs = [...document.querySelectorAll('.ccard:not([disabled])')];
        const c = o.pick != null ? cs.find((x) => x.getAttribute('data-a') === String(o.pick)) : o.match ? cs.find((x) => new RegExp(o.match, 'i').test(x.textContent.replace(/\s+/g, ' '))) : cs[0];
        return c ? { a: c.getAttribute('data-a'), text: c.textContent.replace(/\s+/g, ' ').trim() } : null;
      }, o);
      if (!sel) throw new Error('no companion action matching ' + JSON.stringify(o) + ': ' + JSON.stringify(await p.evaluate(() => ({ ph: RB.combat.phase(), cards: [...document.querySelectorAll('.ccard')].map((c) => c.getAttribute('data-a') + (c.disabled ? ' off' : '') + ' ' + c.textContent.replace(/\s+/g, ' ').slice(0, 40)) }))));
      // a real click on the visible part of the card (scrolled into view)
      const q = '.ccard[data-a="' + sel.a + '"]';
      const pt = await p.evaluate((q) => {
        const el = document.querySelector(q);
        el.scrollIntoView({ block: 'start' });
        const r = el.getBoundingClientRect();
        // the first visible point down its middle (a card taller than its scroll box is cut off below)
        const x = r.left + r.width / 2;
        for (let y = Math.max(r.top, 0) + 6; y < Math.min(r.bottom, innerHeight); y += 6) { const top = document.elementFromPoint(x, y); if (top && top.closest(q)) return { x, y, ok: true }; }
        const at = document.elementFromPoint(x, Math.min(innerHeight - 2, r.top + 10)); const d = document.querySelector('.cb-dock').getBoundingClientRect(), rc = document.querySelector('.ccards').getBoundingClientRect(), cu = document.querySelector('.combat-ui');
        return { x, y: r.top, ok: false, r: [r.left, r.top, r.width, r.height], at: at && at.outerHTML.slice(0, 160), dock: [d.top, d.bottom], rcards: [rc.top, rc.bottom], ui: [cu.scrollTop, cu.scrollHeight, cu.clientHeight] };
      }, q);
      if (!pt.ok) throw new Error('the companion\'s action is covered: ' + JSON.stringify(pt));
      await p.mouse.click(pt.x, pt.y);
      return sel.text;
    }
    if (s.ph !== 'challenge' && s.ph !== 'companion') return null;
    await p.waitForTimeout(40);
  }
  return null;
}

// The setup book (CW-1, src/ui/40_create.js) turns printed leaves between its steps on wide screens: wait until no leaf
// is turning (a phone, or Reduce motion, moves at once and this returns at once).
export async function settled(p, timeout) {
  await p.waitForFunction(() => !document.querySelector('.folio-create.cr-turning, .cr-stage.lt-on'), null, { timeout: timeout || 5000 });
}
// A new journey begins from its last step, the Summary ("Before you set out", CW-1): from any step of the setup, go on
// to it with the real buttons and press Begin the journey.
export async function beginJourney(p) {
  for (let i = 0; i < 6; i++) {
    await settled(p);
    if (await p.isVisible('.folio-create .folio-foot [data-a=go]')) break;
    await p.click('.folio-create .folio-foot .cr-primary:not([hidden])');
  }
  await p.click('.folio-create .folio-foot [data-a=go]');
}
// Before its story begins, a New Game+ journey opens Settings on "Before you set out" (ST-1b, src/ui/55_settings.js
// review()): set out from it with the real button (the review is the subject of tests/e2e/settings_review.mjs). A fresh
// journey has no such review since CW-1 (its Summary was the last look): then this only waits for the journey to begin.
export async function setOut(p, opts = {}) {
  const h = await p.waitForFunction(() => (document.querySelector('.folio-review [data-review-go]') ? 'review' : !document.querySelector('.folio-create') && RB.game.G && RB.game.G.playing === true ? 'play' : null), null, { timeout: opts.timeout || 15000 });
  if ((await h.jsonValue()) !== 'review') return;
  await p.click('.folio-review [data-review-go]');
  await p.waitForFunction(() => !(RB.ui.settings.reviewing && RB.ui.settings.reviewing()), null, { timeout: 5000 });
}
