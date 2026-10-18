// CW-1 (the traveller's setup book): the capture recipe, the same for the baseline and the candidate build.
// It plays the real New Game flow from the title (slot 1, Skip prologue) with one synthetic traveller, and photographs
// every step at matched viewports: the baseline's four steps and its departure review ("Before you set out", summary and
// details), or the candidate's five steps. Deterministic enough to compare: Playwright's fake clock is paused and moved
// only by the recipe, Math.random is seeded, and the creation figure's idle blink (its 3.6 s interval) is held off in
// both builds alike. Nothing is saved: each viewport is a fresh browser profile, and the journey is never begun.
// Usage: node tools/review/cw1_capture.mjs <build.html> <outDir> [--sizes=1440x900,1280x720] [--text=1.5] [--profile=F|E|I|A] [--ui=ja] [--no-ornament]
import http from 'node:http';
import fs from 'node:fs';
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }

const [, , html, out] = process.argv;
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const sizes = arg('sizes', '1440x900,1280x720,1366x768,1920x1080').split(',').map((s) => s.split('x').map(Number));
const textScale = +arg('text', '1');
fs.mkdirSync(out, { recursive: true });
const body = fs.readFileSync(html);
const srv = http.createServer((req, res) => {
  if (req.url.split('?')[0] !== '/') { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await pw.chromium.launch();
const T0 = new Date('2026-10-18T09:00:00Z');
const INIT = `(() => {
  let s = 0x2f6b4a1d; Math.random = function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const si = window.setInterval; window.setInterval = function (f, ms) { if (ms === 3600) return 0; return si.apply(this, arguments); };
})();`;
// the traveller, the same in both builds
const T = { name: 'Robin', pron: 'she', hair: 'ponytail', outfit: '2', shape: 'coat', acc: ['glasses', 'flower'], bg: 'student', profile: arg('profile', 'E'), input: 'hand', assist: 'assist', difficulty: 'hard' };
const shots = [];

async function run(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await ctx.addInitScript(INIT);
  await ctx.clock.install({ time: T0 });
  await ctx.clock.pauseAt(new Date(T0.getTime() + 1000));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  for (let i = 0; i < 300 && !(await p.evaluate(() => window.__RB_READY__ === true)); i++) await ctx.clock.runFor(100);
  const tick = (ms) => ctx.clock.runFor(ms || 400);
  const ev = async (f, a) => { const r = await p.evaluate(f, a); await tick(); return r; };
  const click = (sel) => ev((s) => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.click(); }, sel);
  const has = (sel) => p.evaluate((s) => !!document.querySelector(s), sel);
  const shot = async (name) => {
    await tick(200);
    const f = out + '/' + name + '_' + w + 'x' + h + '.png';
    await p.screenshot({ path: f });
    shots.push(f);
  };
  await ev((o) => { RB.game.settings.textScale = o.ts; if (o.ui) RB.game.settings.uiLang = o.ui; RB.game.applySettings(); }, { ts: textScale, ui: arg('ui', '') });
  // (the candidate's ornaments off, for the side-by-side: a review-only body class, never a player setting)
  if (process.argv.includes('--no-ornament')) await ev(() => document.body.classList.add('cr-no-ornament'));
  // New Game → slot 1 → Skip prologue
  await ev(() => { const b = [...document.querySelectorAll('button')].find((x) => /New Game/.test(x.textContent)); b.click(); });
  await click('.slot[data-slot="1"] [data-a=start]');
  for (let i = 0; i < 40 && !(await has('.cr-scrim')); i++) {
    await ev(() => {
      const sk = [...document.querySelectorAll('button')].find((x) => /^Skip prologue$/.test(x.textContent.trim()));
      if (sk) sk.click();
      const yes = [...document.querySelectorAll('.csheet button')].find((x) => /Skip the prologue/.test(x.textContent));
      if (yes) yes.click();
    });
  }
  const step = () => p.evaluate(() => document.querySelector('.folio-create').getAttribute('data-step'));
  // (the candidate turns printed leaves on the browser's own animation clock, not the paused one: wait, in real time,
  // until no leaf is turning; the baseline has none, so this returns at once there)
  const settle = async () => {
    for (let i = 0; i < 80; i++) {
      await ctx.clock.runFor(50);
      await p.waitForTimeout(25);
      if (await p.evaluate(() => !document.querySelector('.cr-stage.lt-on') && !document.querySelector('.folio-create.cr-turning'))) return;
    }
  };
  const next = async () => { await ev(() => { const b = document.querySelector('.folio-create .folio-foot .cr-primary:not([hidden])'); b.click(); }); await settle(); };
  const pick = (sel) => ev((s) => { const i = document.querySelector(s); if (!i) throw new Error('missing ' + s); i.click(); }, sel);
  // every page of the book that scrolls, to its top or its end (the same rule in both builds)
  const scrollAll = (end) => ev((end) => { document.querySelectorAll('.folio-create *').forEach((l) => { if (l.scrollHeight > l.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(l).overflowY)) l.scrollTop = end ? l.scrollHeight : 0; }); }, end);
  // Identity
  await ev((t) => { const nm = document.querySelector('#nm'); nm.focus(); nm.value = t.name; nm.dispatchEvent(new Event('input', { bubbles: true })); nm.blur(); }, T);
  await pick('input[data-set=pron][data-v=' + T.pron + ']');
  await shot('1_identity');
  await next();
  // Appearance
  await pick('input[data-set=hair][data-v=' + T.hair + ']');
  await pick('input[data-set=outfit][data-v="' + T.outfit + '"]');
  await pick('input[data-set=shape][data-v=' + T.shape + ']');
  for (const a of T.acc) await pick('input[data-acc=' + a + ']');
  await scrollAll(false);
  await shot('2_appearance');
  await next();
  // Background
  await pick('input[data-set=bg][data-v=' + T.bg + ']');
  await shot('3_background');
  await next();
  // Learning
  for (const k of ['profile', 'input']) await pick('input[data-k=' + k + '][data-v=' + T[k] + ']');
  const fold = '.cr-learn details.cr-more > summary, .folio-create details.cr-fold > summary';
  const folded = await p.evaluate(() => !!document.querySelector('.cr-learn details.cr-more:not([open])'));
  if (folded) await click(fold); // (baseline: assist and tactics live in the fold)
  for (const k of ['assist', 'difficulty']) await pick('input[data-k=' + k + '][data-v=' + T[k] + ']');
  if (folded) await click(fold);
  await scrollAll(false);
  await shot('4_learning');
  await scrollAll(true);
  await shot('4_learning_scrolled');
  await click(fold);
  await ev(() => { const d = document.querySelector('.folio-create details[open]'); if (d) d.scrollIntoView({ block: 'start' }); });
  await shot('4_learning_fold_open');
  await click(fold);
  await scrollAll(false);
  if (await has('.folio-create .cr-route [data-step="4"]')) {
    // the candidate: the fifth step, Summary
    await next();
    await shot('5_summary');
    await scrollAll(true);
    await shot('5_summary_scrolled');
  } else {
    // the baseline: Begin, then the departure review over the not-yet-started journey
    await next();
    for (let i = 0; i < 20 && !(await has('.folio-review')); i++) await tick(200);
    await shot('5_review_summary');
    await click('.folio-review [data-a=details]');
    await shot('5_review_details');
  }
  await ctx.close();
  return { errors, step: null };
}

const report = {};
for (const [w, h] of sizes) report[w + 'x' + h] = await run(w, h);
fs.writeFileSync(out + '/capture.json', JSON.stringify({ build: html, textScale, uiLang: arg('ui', 'default'), profile: T.profile, ornaments: !process.argv.includes('--no-ornament'), sizes: sizes.map((s) => s.join('x')), report, shots: shots.map((f) => f.split('/').pop()) }, null, 1));
await browser.close();
srv.close();
console.log(JSON.stringify(report));
