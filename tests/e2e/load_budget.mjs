// S6 (expansion plan 02_FOUNDATIONS.md): how quickly the single file opens and how much memory it holds, as the game
// grows (Robin's C-21: size is no concern below 100 MB; opening quickly and running smoothly is). Headless Chromium on
// this machine, software rendering: a trend line between builds, not a measurement of Firefox or Robin's foldable.
// Usage: node tests/e2e/load_budget.mjs [runs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const runs = +(process.argv[2] || 3);
const bytes = fs.statSync(path.join(root, 'index.html')).size;
const { srv, url } = await serve();
const b = await launch();
const rows = [];
for (const [label, vp] of [['desktop 1280×800', { width: 1280, height: 800 }], ['phone 390×844', { width: 390, height: 844 }]]) {
  for (let i = 0; i < runs; i++) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    const t0 = Date.now();
    await p.goto(url);
    await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 120000 });
    const ready = Date.now() - t0;
    const m = await p.evaluate(async () => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      // a new campaign on the first map, then a moment of play
      RB.game.debugStart('rw.village', 22, 30, {});
      await new Promise((r) => setTimeout(r, 1500));
      const mem = performance.memory ? performance.memory.usedJSHeapSize : null;
      return { domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0), load: Math.round(nav.loadEventEnd || 0), heapMB: mem ? Math.round(mem / 1048576) : null };
    });
    rows.push({ label, run: i + 1, readyMs: ready, ...m });
    await ctx.close();
  }
}
await b.close(); srv.close();
const med = (xs) => { const s = xs.slice().sort((a, c) => a - c); return s[Math.floor(s.length / 2)]; };
const out = { when: new Date().toISOString(), indexBytes: bytes, indexMiB: +(bytes / 1048576).toFixed(2), rows,
  median: Object.fromEntries(['desktop 1280×800', 'phone 390×844'].map((l) => [l, { readyMs: med(rows.filter((r) => r.label === l).map((r) => r.readyMs)), heapMB: med(rows.filter((r) => r.label === l).map((r) => r.heapMB)) }])) };
console.log(JSON.stringify(out, null, 1));
