// CW-1 (the traveller's setup book): the motion evidence recipe. Real time throughout (no fake clock): each scene is a
// fresh browser profile that plays the real New Game route from the title (slot 1, Skip prologue) with the same synthetic
// traveller as tools/review/cw1_capture.mjs, then records one interaction at normal speed (Playwright's recordVideo;
// the scene's start is written to motion.json so the clip can be cut to it). Also: frames paused at 25/50/75 % of a
// leaf, frame-accurate stepped renders at the contract's timing, frame intervals and elapsed times measured in the page,
// and the rendering environment. Nothing is saved to a real profile, and the journey begins only in the 'begin' scene,
// in its own throwaway profile.
// Usage: node tools/review/cw1_motion.mjs <build.html> <outDir> [--size=1440x900] [--scenes=forward,backward,...] [--baseline]
import http from 'node:http';
import fs from 'node:fs';
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }

const [, , html, out] = process.argv;
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const [W, H] = arg('size', '1440x900').split('x').map(Number);
const baseline = process.argv.includes('--baseline');
const ALL = baseline ? ['base_forward'] : ['forward', 'backward', 'jump', 'edit_return', 'begin', 'reduced', 'flat', 'frames', 'stepped', 'perf'];
const scenes = arg('scenes', ALL.join(',')).split(',');
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
const report = { build: html, size: W + 'x' + H, browser: 'Chromium ' + browser.version() + ' (headless)', scenes: {} };

async function open(o = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: o.reduce ? 'reduce' : 'no-preference' },
    o.video ? { recordVideo: { dir: out + '/raw', size: { width: W, height: H } } } : {}));
  const t0 = Date.now();
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 60000 });
  if (o.flat) await p.evaluate(() => { RB.game.settings.ledgerStyle = 'flat'; RB.game.applySettings(); });
  const has = (s) => p.evaluate((s) => !!document.querySelector(s), s);
  await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /New Game/.test(x.textContent)).click());
  await p.waitForSelector('.slot[data-slot="1"] [data-a=start]');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  for (let i = 0; i < 60 && !(await has('.folio-create #nm')); i++) {
    await p.evaluate(() => {
      const sk = [...document.querySelectorAll('button')].find((x) => /^Skip prologue$/.test(x.textContent.trim()));
      if (sk) sk.click();
      const yes = [...document.querySelectorAll('.csheet button')].find((x) => /Skip the prologue/.test(x.textContent));
      if (yes) yes.click();
    });
    await p.waitForTimeout(250);
  }
  await p.waitForTimeout(700);
  await p.fill('#nm', 'Robin');
  await p.click('input[data-set=pron][data-v=she]');
  const mark = () => (Date.now() - t0) / 1000;
  return { ctx, p, errors, mark };
}
const settled = (p) => p.waitForFunction(() => !document.querySelector('.cr-stage.lt-on') && !document.querySelector('.folio-create.cr-turning'), null, { timeout: 6000 });
const step = (p) => p.evaluate(() => document.querySelector('.folio-create').getAttribute('data-step'));
async function next(p) { await p.click('.folio-create .folio-foot .cr-primary:not([hidden])'); await settled(p); }
async function quick(p, n) { // to a later step without recording intent (the scene starts after)
  for (let i = 0; i < n; i++) await next(p);
}
async function finish(name, s, from, notes) {
  const v = s.p.video();
  const end = s.mark();
  await s.ctx.close();
  const raw = v ? await v.path() : null;
  report.scenes[name] = Object.assign({ start: from, end, video: raw ? raw.split('/').slice(-2).join('/') : null, errors: s.errors }, notes || {});
}

for (const sc of scenes) {
  if (sc === 'base_forward') {
    // the baseline: Next through its four steps, then Begin and its departure review
    const s = await open({ video: true });
    const from = s.mark();
    await s.p.waitForTimeout(900);
    for (let i = 0; i < 3; i++) { await s.p.click('.folio-create .folio-foot .cr-primary:not([hidden])'); await s.p.waitForTimeout(1200); }
    await s.p.click('.folio-create .folio-foot .cr-primary:not([hidden])');
    await s.p.waitForSelector('.folio-review', { timeout: 10000 }).catch(() => {});
    await s.p.waitForTimeout(2500);
    await finish(sc, s, from, { steps: 'identity → appearance → background → learning → Begin → departure review' });
  }
  if (sc === 'forward') {
    const s = await open({ video: true });
    const from = s.mark();
    await s.p.waitForTimeout(900);
    for (let i = 0; i < 4; i++) { await next(s.p); await s.p.waitForTimeout(1100); }
    await s.p.waitForTimeout(600);
    await finish(sc, s, from, { steps: 'Next ×4: identity → appearance → background → learning → summary (one leaf each)', last: 'summary' });
  }
  if (sc === 'backward') {
    const s = await open({ video: true });
    await quick(s.p, 4);
    await s.p.waitForTimeout(300);
    const from = s.mark();
    await s.p.waitForTimeout(900);
    for (let i = 0; i < 2; i++) { await s.p.click('.folio-create .folio-foot .cr-back'); await settled(s.p); await s.p.waitForTimeout(1100); }
    await finish(sc, s, from, { steps: 'Back ×2: summary → learning → background (one leaf each)', last: await step(s.p).catch(() => null) });
  }
  if (sc === 'jump') {
    const s = await open({ video: true });
    await quick(s.p, 3);
    await s.p.waitForTimeout(300);
    const from = s.mark();
    await s.p.waitForTimeout(900);
    await s.p.click('.cr-route button[data-step="0"]'); await settled(s.p);
    await s.p.waitForTimeout(1300);
    await s.p.click('.cr-route button[data-step="3"]'); await settled(s.p);
    await s.p.waitForTimeout(1300);
    await finish(sc, s, from, { steps: 'route: learning → identity (three leaves back), then identity → learning (three leaves forward)' });
  }
  if (sc === 'edit_return') {
    const s = await open({ video: true });
    await quick(s.p, 4);
    await s.p.screenshot({ path: out + '/summary_before_edit.png' });
    const from = s.mark();
    await s.p.waitForTimeout(1000);
    // Identity: four leaves back, a changed name, four leaves forward
    await s.p.click('[data-sg=identity] .cr-edit'); await settled(s.p); await s.p.waitForTimeout(700);
    await s.p.fill('#nm', 'Robin Ashe'); await s.p.waitForTimeout(500);
    await s.p.click('.cr-ret'); await settled(s.p); await s.p.waitForTimeout(1000);
    // Tactical challenge: one leaf back, Relaxed, Return
    await s.p.click('.cr-sumpage [data-edit][data-group="difficulty"]'); await settled(s.p); await s.p.waitForTimeout(600);
    await s.p.click('input[data-k=difficulty][data-v=relaxed]'); await s.p.waitForTimeout(500);
    await s.p.click('.cr-ret'); await settled(s.p); await s.p.waitForTimeout(1000);
    // Reading (the lead language): the fold opens on Learning; Japanese first; Return
    await s.p.click('.cr-sumpage [data-edit][data-group="reading"]'); await settled(s.p); await s.p.waitForTimeout(600);
    await s.p.click('details.cr-readfold input[data-k=lead][data-v=ja]');
    await s.p.waitForTimeout(500);
    await s.p.click('.cr-ret'); await settled(s.p); await s.p.waitForTimeout(1200);
    await s.p.screenshot({ path: out + '/summary_after_edit.png' });
    const txt = await s.p.evaluate(() => document.querySelector('.cr-sumpage').innerText + '\n' + document.querySelector('.cr-sumsheet').innerText);
    await finish(sc, s, from, { steps: 'Summary: Edit identity (4 back) → name → Return (4 forward); Edit tactical → Relaxed → Return; Edit reading → Japanese first → Return', summaryAfter: txt });
  }
  if (sc === 'begin') {
    const s = await open({ video: true });
    await quick(s.p, 4);
    const from = s.mark();
    await s.p.waitForTimeout(1000);
    await s.p.click('.folio-create .folio-foot [data-a=go]');
    await s.p.waitForFunction(() => RB.game.G && RB.game.G.playing, null, { timeout: 20000 }).catch(() => {});
    await s.p.waitForTimeout(3000);
    const after = await s.p.evaluate(() => ({ playing: !!(RB.game.G && RB.game.G.playing), review: !!document.querySelector('.folio-review'), create: !!document.querySelector('.folio-create') }));
    await finish(sc, s, from, { steps: 'Summary → Begin the journey → the game (no departure review)', after });
  }
  if (sc === 'reduced' || sc === 'flat') {
    const s = await open({ video: true, reduce: sc === 'reduced', flat: sc === 'flat' });
    const from = s.mark();
    let turns = 0;
    await s.p.evaluate(() => { window.__lt = 0; new MutationObserver(() => { if (document.querySelector('.cr-stage.lt-on')) window.__lt++; }).observe(document.querySelector('.cr-stage'), { attributes: true, childList: true }); });
    await s.p.waitForTimeout(900);
    for (let i = 0; i < 4; i++) { await next(s.p); await s.p.waitForTimeout(900); }
    await s.p.click('.cr-route button[data-step="0"]'); await settled(s.p); await s.p.waitForTimeout(1200);
    turns = await s.p.evaluate(() => window.__lt);
    await finish(sc, s, from, { steps: 'Next ×4, then the route to identity', leafTurnsSeen: turns });
  }
  if (sc === 'frames') {
    const s = await open({});
    // each fraction from its own turn (a paused leaf is settled by the turn's watchdog after its length + 1.5 s, so
    // one turn cannot wait for three screenshots): make the move, pause the wanted leaf the moment it is made, set it
    // to the fraction, photograph it, let it finish, then undo the move
    const shoot = async (name, trigger, undo, hop) => {
      const info = [];
      for (const f of [0.25, 0.5, 0.75]) {
        await s.p.evaluate((o) => {
          const st = document.querySelector('.cr-stage');
          let n = 0;
          window.__held = false;
          const mo = new MutationObserver(() => {
            const lf = st.querySelector('.lt-leaf');
            if (!lf || lf.__seen) return;
            lf.__seen = true;
            if (++n === o.hop) {
              st.getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = a.effect.getComputedTiming().duration * o.f; });
              window.__held = true; mo.disconnect();
            }
          });
          mo.observe(st, { childList: true });
        }, { hop, f });
        await s.p.evaluate(trigger);
        await s.p.waitForFunction(() => window.__held, null, { timeout: 4000 });
        await s.p.waitForTimeout(60);
        const file = name + '_' + Math.round(f * 100) + '.png';
        await s.p.screenshot({ path: out + '/' + file });
        info.push(Object.assign({ file }, await s.p.evaluate(() => {
          const st = document.querySelector('.cr-stage');
          const pg = (c) => { const e = st.querySelector(c + ' > .lt-print'); return e ? (e.className.match(/cr-s-(\w+)/) || [])[1] + ':' + (e.classList.contains('cr-l') ? 'L' : 'R') : null; };
          return { under: [pg('.lt-slot.lt-l'), pg('.lt-slot.lt-r')], front: pg('.lt-front'), back: pg('.lt-back'), printsInert: [...st.querySelectorAll('.lt-print')].every((e) => e.hasAttribute('inert') && e.getAttribute('aria-hidden') === 'true') };
        })));
        await s.p.evaluate(() => document.querySelector('.cr-stage').getAnimations({ subtree: true }).forEach((a) => a.play()));
        await settled(s.p);
        await s.p.evaluate(undo);
        await settled(s.p);
      }
      return info;
    };
    const nx = () => document.querySelector('.folio-create .folio-foot .cr-primary:not([hidden])').click();
    const bk = () => document.querySelector('.folio-create .folio-foot .cr-back').click();
    const rep = {};
    await s.p.screenshot({ path: out + '/rest_identity.png' });
    rep.m01_fwd_1to2 = await shoot('m01_fwd_1to2', nx, bk, 1);
    await s.p.evaluate(nx); await settled(s.p);
    rep.m02_bwd_2to1 = await shoot('m02_bwd_2to1', bk, nx, 1);
    await quick(s.p, 3);
    rep.m04_5to1_hop2 = await shoot('m04_5to1_hop2', () => document.querySelector('[data-sg=identity] .cr-edit').click(), () => document.querySelector('.cr-ret').click(), 2);
    rep.final = await step(s.p);
    await s.ctx.close();
    report.scenes.frames = Object.assign(rep, { errors: s.errors });
  }
  if (sc === 'stepped') {
    // Frame-accurate renders at the contract's own timing (the live recordings above drop frames: Playwright's
    // screencast in this software renderer captures far fewer frames than the page draws). Each leaf is paused the
    // moment it is made, set to t = 0, 20, 40 … ms of its duration (50 frames a second), and photographed; the frames are
    // then joined with their exact durations (the gap between leaves, the settle, a still before and after). Every frame
    // is the real page at that moment of the turn; only the clock is stepped. Preparation (about 20 ms warm) is not shown.
    const s = await open({});
    const dt = 20;
    // (harness only: the turn's watchdog, its plan's total + 1.5 s, would settle a leaf held for photographs)
    await s.p.evaluate(() => {
      const st = window.setTimeout;
      window.setTimeout = function (f, ms) { const P = window.__plan; if (P && ms === P.totalMs + 1500) return 0; return st.apply(this, arguments); };
      const run = RB.ui.leafTurn.run;
      RB.ui.leafTurn.run = function (o) { window.__plan = RB.ui.leafTurn.plan(o.from, o.to); return run.call(this, o); };
    });
    const render = async (name, moves) => {
      const dir = out + '/stepped/' + name;
      fs.mkdirSync(dir, { recursive: true });
      const list = [];
      let idx = 0;
      const shot = async (ms) => { const f = 'f' + String(idx++).padStart(4, '0') + '.png'; await s.p.screenshot({ path: dir + '/' + f }); list.push([f, ms]); };
      const info = [];
      for (const [label, trigger] of moves) {
        await shot(600);
        await s.p.evaluate(() => {
          const st = document.querySelector('.cr-stage');
          window.__hop = 0;
          window.__mo && window.__mo.disconnect();
          window.__mo = new MutationObserver(() => {
            const lf = st.querySelector('.lt-leaf');
            if (!lf || lf.__seen) return;
            lf.__seen = true;
            st.getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = 0; });
            window.__hop++;
          });
          window.__mo.observe(st, { childList: true });
        });
        await s.p.evaluate(trigger);
        const P = await s.p.evaluate(() => { const t = Date.now(); return new Promise((r) => { const w = () => (window.__plan || Date.now() - t > 3000 ? r(window.__plan) : setTimeout(w, 10)); w(); }); });
        for (let k = 1; k <= P.n; k++) {
          await s.p.waitForFunction((k) => window.__hop >= k, k, { timeout: 8000 });
          for (let t = 0; t < P.leafMs; t += dt) {
            await s.p.evaluate((t) => document.querySelector('.cr-stage').getAnimations({ subtree: true }).forEach((a) => { a.currentTime = t; }), t);
            await shot(Math.min(dt, P.leafMs - t));
          }
          await s.p.evaluate((d) => document.querySelector('.cr-stage').getAnimations({ subtree: true }).forEach((a) => { a.currentTime = d; }), P.leafMs);
          await shot(k < P.n ? P.gapMs : P.settleMs);
          await s.p.evaluate(() => document.querySelector('.cr-stage').getAnimations({ subtree: true }).forEach((a) => a.play()));
        }
        await settled(s.p);
        await shot(900);
        info.push({ label, leaves: P.n, leafMs: P.leafMs, gapMs: P.gapMs, settleMs: P.settleMs, step: await step(s.p) });
      }
      await s.p.evaluate(() => { window.__mo && window.__mo.disconnect(); window.__plan = null; });
      fs.writeFileSync(dir + '/list.txt', list.map(([f, ms]) => "file '" + f + "'\nduration " + (ms / 1000).toFixed(3)).join('\n') + "\nfile '" + list[list.length - 1][0] + "'\n");
      return { frames: list.length, seconds: list.reduce((n, x) => n + x[1], 0) / 1000, moves: info };
    };
    const nx = () => document.querySelector('.folio-create .folio-foot .cr-primary:not([hidden])').click();
    const bk = () => document.querySelector('.folio-create .folio-foot .cr-back').click();
    const rep = {};
    rep.fwd_bwd = await render('fwd_bwd', [['Next: identity → appearance (one leaf)', nx], ['Back: appearance → identity (one leaf)', bk]]);
    await s.p.evaluate(nx); await settled(s.p);
    await quick(s.p, 2);
    rep.jump = await render('jump_4to1', [['route: learning → identity (three leaves)', () => document.querySelector('.cr-route button[data-step="0"]').click()]]);
    await quick(s.p, 4);
    rep.edit = await render('edit_5to1_1to5', [['Summary: Edit identity (four leaves back)', () => document.querySelector('[data-sg=identity] .cr-edit').click()], ['Return to summary (four leaves forward)', () => document.querySelector('.cr-ret').click()]]);
    await s.ctx.close();
    report.scenes.stepped = Object.assign(rep, { errors: s.errors });
  }
  if (sc === 'perf') {
    // frame intervals (requestAnimationFrame) during a single leaf and a four-leaf riffle; elapsed time from the click
    // to the live destination; the first turn of a session against later ones; and a no-animation control
    const s = await open({});
    const env = await s.p.evaluate(() => {
      const c = document.createElement('canvas').getContext('webgl');
      const x = c && c.getExtension('WEBGL_debug_renderer_info');
      return { renderer: x ? c.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'unknown', dpr: devicePixelRatio, ua: navigator.userAgent };
    });
    // all stamped in the page: the click, the first frame showing a leaf, and the moment the stage is emptied (the live
    // destination shown); frame intervals between the click and that moment
    const measure = async (press) => {
      await s.p.evaluate(() => {
        const R = window.__pf = { f: [], c0: 0, f0: 0, l0: 0, nodes0: document.querySelectorAll('*').length, peak: 0 };
        let last = 0;
        const st = document.querySelector('.cr-stage');
        const mo = new MutationObserver(() => { if (R.f0 && !R.l0 && !st.classList.contains('lt-on')) { R.l0 = performance.now(); mo.disconnect(); } });
        mo.observe(st, { attributes: true, attributeFilter: ['class'] });
        const tick = (t) => {
          if (R.l0) return;
          if (R.c0 && last) R.f.push(t - last);
          last = t;
          if (R.c0 && !R.f0 && st.querySelector('.lt-leaf')) R.f0 = performance.now();
          if (st.classList.contains('lt-on')) R.peak = Math.max(R.peak, document.querySelectorAll('*').length);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        document.addEventListener('click', () => { R.c0 = performance.now(); }, { capture: true, once: true });
      });
      await press();
      await settled(s.p);
      await s.p.waitForTimeout(50);
      return s.p.evaluate(() => {
        const R = window.__pf;
        const f = R.f.slice().sort((a, b) => a - b);
        const q = (p) => (f.length ? Math.round(f[Math.min(f.length - 1, Math.floor(p * f.length))] * 10) / 10 : null);
        return { clickToLiveMs: Math.round(R.l0 - R.c0), prepMs: Math.round(R.f0 - R.c0), turnMs: Math.round(R.l0 - R.f0), frames: f.length, medianMs: q(0.5), p95Ms: q(0.95), maxMs: f.length ? Math.round(f[f.length - 1]) : null, nodesBefore: R.nodes0, nodesPeak: R.peak, nodesAfter: document.querySelectorAll('*').length };
      });
    };
    const rep = { env };
    rep.cold_1to2 = await measure(() => s.p.click('.folio-create .folio-foot .cr-primary:not([hidden])'));
    rep.warm_2to1 = await measure(() => s.p.click('.folio-create .folio-foot .cr-back'));
    rep.warm_1to2 = await measure(() => s.p.click('.folio-create .folio-foot .cr-primary:not([hidden])'));
    await quick(s.p, 3);
    rep.riffle_5to1 = await measure(() => s.p.click('[data-sg=identity] .cr-edit'));
    rep.riffle_1to5 = await measure(() => s.p.click('.cr-ret'));
    await s.ctx.close();
    // the control: the same moves with Reduce motion (no leaves): the direct switch
    const c = await open({ reduce: true });
    // (with no leaf, the moment the destination is shown is the moment its step is set on the book)
    const t = async (press) => {
      await c.p.evaluate(() => {
        window.__c0 = 0; window.__c1 = 0;
        const fe = document.querySelector('.folio-create');
        const mo = new MutationObserver(() => { if (window.__c0 && !window.__c1) { window.__c1 = performance.now(); mo.disconnect(); } });
        mo.observe(fe, { attributes: true, attributeFilter: ['data-step'] });
        document.addEventListener('click', () => { window.__c0 = performance.now(); }, { capture: true, once: true });
      });
      await press(); await settled(c.p); await c.p.waitForTimeout(50);
      return c.p.evaluate(() => Math.round(window.__c1 - window.__c0));
    };
    rep.control_reduced_1to2 = await t(() => c.p.click('.folio-create .folio-foot .cr-primary:not([hidden])'));
    await quick(c.p, 3);
    rep.control_reduced_5to1 = await t(() => c.p.click('[data-sg=identity] .cr-edit'));
    await c.ctx.close();
    report.scenes.perf = Object.assign(rep, { errors: s.errors.concat(c.errors) });
  }
}
fs.writeFileSync(out + '/motion.json', JSON.stringify(report, null, 1));
await browser.close();
srv.close();
console.log(JSON.stringify(report, null, 1));
