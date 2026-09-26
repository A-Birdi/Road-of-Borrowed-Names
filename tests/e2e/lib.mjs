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
