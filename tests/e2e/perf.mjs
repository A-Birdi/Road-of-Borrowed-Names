// Rendering and menu timing of a built game file, for before/after comparison.
// Headless requestAnimationFrame is capped by vsync, so this times the work
// itself: RB.render.frame() called directly (CPU + canvas time, flushed with a
// pixel read), the static-map build after invalidate(), and opening/closing
// the pause menu repeatedly (time and DOM growth, to catch leaks).
// Usage: node tests/e2e/perf.mjs [--html path/to/index.html] [--vp 1280x800] [--dpr 1] [--label name]
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, root } from './lib.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const htmlPath = path.resolve(root, opt('--html', 'index.html'));
const [vw, vh] = opt('--vp', '1280x800').split('x').map(Number);
const dpr = +opt('--dpr', '1');
const label = opt('--label', path.basename(path.dirname(htmlPath)) + '/' + path.basename(htmlPath));
const html = fs.readFileSync(htmlPath, 'utf8');
const srv = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dpr });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/');
await p.waitForFunction(() => window.__RB_READY__);
const scenes = [['rw.village', 22, 30], ['sg.harbor', 20, 22], ['co.village', 20, 18], ['lf.town', 26, 20], ['sb.hamlet', 20, 20], ['rw.hall', 5, 6]];
const out = { label, viewport: vw + 'x' + vh + '@' + dpr, scenes: {} };
for (const [m, x, y] of scenes) {
  const r = await p.evaluate(async ([m, x, y]) => {
    RB.game.debugStart(m, x, y, { comp: 'mio' });
    await new Promise((res) => setTimeout(res, 300));
    while (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); await new Promise((res) => setTimeout(res, 30)); }
    const cv = document.getElementById('world');
    const g = cv.getContext('2d');
    const flush = () => g.getImageData(0, 0, 1, 1); // wait for the canvas work to finish
    // static build
    const b0 = performance.now();
    RB.render.invalidate(); RB.render.frame(performance.now()); flush();
    const build = performance.now() - b0;
    // steady frames
    for (let i = 0; i < 10; i++) RB.render.frame(performance.now());
    flush();
    const N = 120;
    const t0 = performance.now();
    for (let i = 0; i < N; i++) { RB.world.update(16, true); RB.render.frame(t0 + i * 16); }
    flush();
    const frame = (performance.now() - t0) / N;
    return { build: +build.toFixed(1), frame: +frame.toFixed(2) };
  }, [m, x, y]);
  out.scenes[m] = r;
}
// menu open/close
out.menu = await p.evaluate(async () => {
  RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
  await new Promise((res) => setTimeout(res, 300));
  while (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); await new Promise((res) => setTimeout(res, 30)); }
  const nodes0 = document.getElementsByTagName('*').length;
  const t0 = performance.now();
  const N = 20;
  for (let i = 0; i < N; i++) {
    RB.ui.menu.open();
    await new Promise((res) => requestAnimationFrame(() => res()));
    RB.ui.menu.close();
  }
  const ms = (performance.now() - t0) / N;
  await new Promise((res) => setTimeout(res, 200));
  const nodes1 = document.getElementsByTagName('*').length;
  return { openClose: +ms.toFixed(1), domBefore: nodes0, domAfter: nodes1 };
});
console.log(JSON.stringify(out));
await browser.close(); srv.close();
