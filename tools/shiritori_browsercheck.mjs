// Responsiveness of the shiritori search inside the built page (Practice addendum §12.3,
// §23.7), in Chromium through Playwright:
//
//   node tools/shiritori_browsercheck.mjs [--positions 12]
//
// Loads the built index.html (with its Content-Security-Policy), checks that the three
// banks are registered, records whether a Worker can be created under that policy, then
// asks Sharp and Thoughtful for moves in busy Extended positions and an exact Pocket
// endgame with the real cooperative driver while requestAnimationFrame and a
// PerformanceObserver('longtask') watch the main thread. Prints a JSON summary; it is
// a measurement on this machine's Chromium, not a claim for other devices.
import os from 'node:os';
import { serve, launch, page } from '../tests/e2e/lib.mjs';

const args = process.argv.slice(2);
const npos = (() => { const i = args.indexOf('--positions'); return i >= 0 ? +args[i + 1] : 12; })();
const { srv, url } = await serve();
const browser = await launch();
const { p, errors, requests } = await page(browser, url);
const out = await p.evaluate(async (npos) => {
  const SH = RB.shiritori;
  const res = { banks: SH.banks().map((id) => id + ':' + SH.bank(id).groupCount), csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]').content };
  // can a Worker start under this CSP? (blob: and data: are not allowed script sources)
  res.worker = await new Promise((done) => {
    try {
      const u = URL.createObjectURL(new Blob(['postMessage(1)'], { type: 'text/javascript' }));
      const w = new Worker(u);
      const to = setTimeout(() => done('no message within 1 s'), 1000);
      w.onmessage = () => { clearTimeout(to); done('blob worker ran'); };
      w.onerror = (e) => { clearTimeout(to); done('blob worker failed: ' + (e.message || 'error event')); };
    } catch (e) { done('blob worker refused: ' + e.message); }
  });
  // main-thread observers
  const longs = [];
  let po = null;
  try { po = new PerformanceObserver((l) => { for (const e of l.getEntries()) longs.push(e.duration); }); po.observe({ type: 'longtask', buffered: false }); } catch (e) { res.longtaskObserver = 'unavailable'; }
  let last = performance.now(), maxGap = 0, frames = 0, running = true;
  const tick = (t) => { const g = t - last; if (g > maxGap) maxGap = g; last = t; frames++; if (running) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const X = SH.bank('extended'), P = SH.bank('pocket');
  const decisions = [];
  const rng = RB.util.rng;
  for (let i = 0; i < npos; i++) {
    const r = rng(1000 + i);
    const g = SH.newGame(X, { starter: X.starters[i % X.starters.length], first: 'cpu' });
    for (let k = 0; k < 2 + (i % 6) && !g.over; k++) { const s = SH.safeReplies(g, X); SH.play(g, X, s[Math.floor(r() * s.length)]); }
    if (g.over) continue;
    for (const level of ['sharp', 'thoughtful']) {
      const a = performance.now();
      const m = await SH.chooseMove(g, X, level, SH.strategyRng(i, g, X, level), {});
      decisions.push({ level, ms: +(performance.now() - a).toFixed(1), depth: m.depth, nodes: m.nodes, mode: m.mode, fallback: m.fallback, slices: m.slices, maxSliceMs: +m.maxSliceMs.toFixed(2), label: m.label });
    }
  }
  // an exact Pocket endgame
  for (let i = 0; i < 400; i++) {
    const r = rng(77 + i);
    const g = SH.newGame(P, { starter: P.starters[i % P.starters.length], first: 'cpu' });
    while (!g.over && SH.ai.liveGroups(g, P) > 12) { const s = SH.safeReplies(g, P); SH.play(g, P, s[Math.floor(r() * s.length)]); }
    if (g.over || SH.safeGroups(g, P).length < 2) continue;
    const a = performance.now();
    const m = await SH.chooseMove(g, P, 'sharp', SH.strategyRng(i, g, P, 'sharp'), {});
    decisions.push({ level: 'sharp-endgame', ms: +(performance.now() - a).toFixed(1), depth: m.depth, nodes: m.nodes, mode: m.mode, fallback: m.fallback, slices: m.slices, maxSliceMs: +m.maxSliceMs.toFixed(2), label: m.label });
    break;
  }
  await new Promise((r) => setTimeout(r, 120));
  running = false;
  if (po) po.disconnect();
  const by = (lv) => decisions.filter((d) => d.level === lv);
  const sum = (lv) => { const d = by(lv); return d.length ? { n: d.length, msMax: Math.max(...d.map((x) => x.ms)), msMedian: d.map((x) => x.ms).sort((a, b) => a - b)[d.length >> 1], maxSliceMs: Math.max(...d.map((x) => x.maxSliceMs)), fallbacks: d.filter((x) => x.fallback).length, depths: d.map((x) => x.depth + (x.label === 'exact' ? 'x' : '')).join(' ') } : null; };
  res.detail = decisions.map((d) => d.level[0] + d.depth + ":" + d.maxSliceMs + "/" + d.ms + "/" + d.slices).join(" ");
  res.sharp = sum('sharp'); res.thoughtful = sum('thoughtful'); res.endgame = sum('sharp-endgame');
  res.longTasks = { count: longs.length, maxMs: longs.length ? +Math.max(...longs).toFixed(1) : 0 };
  res.frames = frames; res.maxFrameGapMs = +maxGap.toFixed(1);
  return res;
}, npos);
out.pageErrors = errors; out.externalRequests = requests;
out.browser = 'chromium ' + browser.version();
out.loadAverage = os.loadavg().map((x) => +x.toFixed(1));
out.cpus = os.cpus().length;
console.log(JSON.stringify(out, null, 1));
await browser.close();
srv.close();
