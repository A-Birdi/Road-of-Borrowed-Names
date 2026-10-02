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
      if (p === '/') p = '/index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      const type = f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

export async function launch(opts = {}) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  return browser;
}

// New page with error + request capture. Any request that is not to the test
// origin (or data:/blob:) is recorded as an unexpected network request.
export async function page(browser, url, opts = {}) {
  const ctx = opts.context || await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.mobile, deviceScaleFactor: opts.dpr || 1 });
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
