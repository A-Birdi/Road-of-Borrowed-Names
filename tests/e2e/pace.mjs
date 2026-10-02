// Fishing pace in Chromium against the built index.html (Practice addendum §7,
// §23.3; docs/practice/pace.md). A generic authored step stands in for a fishing
// response entry (the fishing activity calls RB.pace.attempt the same way).
// Real clicks, keys, mouse strokes, CDP IME composition and viewport changes;
// a hidden tab and window blur are SIMULATED (headless Chromium cannot hide a
// page), and pointer cancellation / lost capture are synthetic PointerEvents.
// Synthetic campaigns only (RB.game.debugStart); no player save is touched.
// Usage: node tests/e2e/pace.mjs [filter] [--shots]   (--shots refreshes docs/screenshots/pace)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const only = process.argv.slice(2).find((a) => !a.startsWith('--'));
const SHOTS = process.argv.includes('--shots');
const SHOTDIR = path.join(root, 'docs', 'screenshots', 'pace');
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 180s')), 180000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 900)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const phone = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });

// a generic authored step: the right-hand route is clear (like fishing's C02)
const RIGHT = { kind: 'write', item: 'v:右', title: 'Which way?', ctx: { jp: '{右|みぎ} の {水|みず} が {空|あ}いて いる 。', en: 'The water on the right is open.' }, prompt: { en: 'Which way should the line go? Write it.' }, answer: 'みぎ', accept: ['みぎ', '{右|みぎ}'], mode: 'kana' };
const CHOOSE = { kind: 'choose', item: 'v:右', title: 'Which way?', ctx: { jp: '{右|みぎ} の {水|みず} が {空|あ}いて いる 。', en: 'The water on the right is open.' }, prompt: { en: 'Which way should the line go?' }, options: [{ en: 'Guide it to the right', ok: true }, { en: 'Guide it to the left', why: { en: 'The reeds are on the left.' } }, { en: 'Lift it straight up', why: { en: 'The branch is in the way.' } }] };

async function helpers(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__ink = (ch, seed) => {
      const ref = RB.recog.reference(ch);
      const r = RB.util.rng((seed || 7) * 31 + ch.charCodeAt(0));
      return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, t: 1000 + i * 16 })));
    };
    window.__begin = (o) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
      s.learn.profile = o.profile || 'E';
      s.learn.kanaKnown = 'both';
      RB.game.settings.input = o.input || 'ime';
      RB.game.settings.lightbulb = true;
      if (o.settings) for (const k in o.settings) RB.practice.set(s, k, o.settings[k]);
      window.__s = s;
      return s;
    };
    window.__attempt = (step, o) => {
      window.__res = null;
      RB.game.pushMode('challenge');
      RB.pace.attempt(step, o).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
    };
    window.__ordinary = (step) => {
      window.__res = null;
      RB.game.pushMode('challenge');
      RB.challenge.runStep(step, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
    };
    window.__cur = () => RB.pace.current();
    window.__clk = () => (RB.pace.current() && RB.pace.current().clock) || {};
    window.__hide = (hidden) => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') }); document.dispatchEvent(new Event('visibilitychange')); };
  });
}
async function open(opts, o) {
  const pg = await page(b, url, opts || DESK);
  await helpers(pg.p);
  await pg.p.evaluate((o) => __begin(o), o || {});
  return pg;
}
const cur = (p) => p.evaluate(() => __cur());
const clk = (p) => p.evaluate(() => __clk());
async function ready(p) {
  await p.waitForSelector('.pace-cover [data-pace=ready]');
  await p.click('.pace-cover [data-pace=ready]');
  await p.waitForFunction(() => __clk().state === 'running', null, { timeout: 5000 });
}
async function done(p) {
  await p.waitForSelector('.fbwrap [data-a=continue]');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res, null, { timeout: 5000 });
  return p.evaluate(() => window.__res);
}
async function shot(p, name) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTDIR, { recursive: true });
  const png = await p.screenshot();
  const b64 = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const k = img.width > 1400 ? 0.5 : 1;
    const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/webp', 0.86).split(',')[1];
  }, png.toString('base64'));
  fs.writeFileSync(path.join(SHOTDIR, name + '.webp'), Buffer.from(b64, 'base64'));
}
async function cdpIme(p, ctx, text, commit) {
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length });
  if (commit) await cdp.send('Input.insertText', { text });
  return cdp;
}

// ---------------------------------------------------------------------------------------------------
await test('Off is the default: no Pace bar, no Ready, nothing timed; the attempt is recorded apart from mastery', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'ime' });
  const pace = await p.evaluate(() => RB.practice.settings(__s).fishingPace);
  assert(pace === 'off', 'a new campaign starts Off: ' + pace);
  await p.evaluate((st) => __attempt(st, { pace: RB.practice.settings(__s).fishingPace, taskId: 'T/off' }), RIGHT);
  await p.waitForSelector('#ime-in');
  const ui = await p.evaluate(() => ({ bar: !!document.querySelector('.pace-bar'), gate: !!document.querySelector('.pace-cover'), gated: document.querySelector('.chal').classList.contains('pace-gated'), hint: document.querySelector('.fbwrap').textContent }));
  assert(!ui.bar && !ui.gate && !ui.gated, 'Off shows no Pace bar and no Ready ' + JSON.stringify(ui));
  assert(/nothing happens until you submit/.test(ui.hint), 'and says nothing is timed: ' + ui.hint);
  await p.fill('#ime-in', 'みぎ');
  await p.press('#ime-in', 'Enter');
  const res = await done(p);
  const rec = await p.evaluate(() => ({ recent: __s.practice.fishing.recentAttempts, item: __s.learn.items['v:右'] || null }));
  assert(res.ok && res.paced.kind === 'off' && res.paced.clock === 'none' && !res.paced.timed && res.paced.budgetMs === null && res.paced.activeMs > 0, 'untimed result with a measured active time: ' + JSON.stringify(res.paced));
  assert(rec.recent.length === 1 && rec.recent[0].paceKind === 'off' && rec.recent[0].taskId === 'T/off' && rec.recent[0].sample === false, 'one separate record, not a calibration sample (no Ready): ' + JSON.stringify(rec.recent));
  assert(!rec.item || !rec.item.seen, 'nothing reached ordinary mastery from the attempt itself: ' + JSON.stringify(rec.item));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('Ready → word help pauses → Continue → soft expiry → Continue untimed → the same catch succeeds', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'ime' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 5, taskId: 'T/flow' }), RIGHT);
  await p.waitForSelector('.pace-cover');
  const g = await p.evaluate(() => ({ text: document.querySelector('.pace-cover').textContent, ime: !!(document.querySelector('#ime-in') && document.querySelector('#ime-in').offsetParent), answer: !!document.querySelector('.chal-answer').offsetParent, task: !!document.querySelector('.chal-task').offsetParent, bar: document.querySelector('.pace-bar').textContent }));
  assert(/5 seconds/.test(g.text) && /Ready/.test(g.text) && /Kana/.test(g.text) && /Supported mixed-kanji writing/.test(g.text), 'the Ready card shows the budget and the representation choice: ' + g.text);
  assert(!/みぎ/.test(g.text), 'the representation choice never shows the answer');
  assert(!g.ime && !g.answer && g.task, 'the task can be read; the answer area waits for Ready ' + JSON.stringify(g));
  assert(/Pace/.test(g.bar) && /Custom · 5 s/.test(g.bar), 'the bar is labelled Pace: ' + g.bar);
  await shot(p, 'gate_1280');
  await p.waitForTimeout(1200);
  assert((await clk(p)).state === undefined, 'reading before Ready is never timed');
  await ready(p);
  assert(await p.evaluate(() => document.activeElement && document.activeElement.id === 'ime-in'), 'Ready focuses the input');
  await p.waitForTimeout(400);
  await shot(p, 'running_1280');
  // word help on a word of the task
  await p.click('.chal-task .chal-ctx .jt');
  await p.waitForSelector('#overlay > .help');
  await p.waitForFunction(() => __clk().state === 'paused');
  const a1 = (await clk(p)).activeMs;
  await p.waitForTimeout(1200);
  const c1 = await clk(p);
  assert(c1.activeMs === a1 && c1.reasons.includes('help'), 'word help stops the pace: ' + JSON.stringify(c1));
  await shot(p, 'help_paused_1280');
  await p.click('#overlay > .help [data-a=close]');
  await p.waitForSelector('.pace-veil[data-veil=pause]');
  await p.waitForTimeout(800);
  const c2 = await clk(p);
  const veil = await p.evaluate(() => document.querySelector('.pace-veil').textContent);
  assert(c2.state === 'paused' && c2.hold && c2.activeMs === a1, 'closing help does not restart it: ' + JSON.stringify(c2));
  assert(/word help/.test(veil) && /Continue/.test(veil), 'the pause says why and offers Continue: ' + veil);
  await shot(p, 'paused_1280');
  await p.click('.pace-veil [data-pace=continue]');
  await p.waitForFunction(() => __clk().state === 'running');
  await p.type('#ime-in', 'み');
  // let it run out
  await p.waitForSelector('.pace-veil[data-veil=expiry]', { timeout: 9000 });
  const e = await p.evaluate(() => ({ msg: document.querySelector('.pace-exp').textContent, val: document.querySelector('#ime-in').value, c: __clk(), btns: [...document.querySelectorAll('.pace-veil button')].map((x) => x.textContent.trim()), st: document.querySelector('.pace-st').textContent }));
  assert(e.msg === 'The line is loosening. Continue at your own pace, or let this one go.', 'the exact expiry message: ' + e.msg);
  assert(JSON.stringify(e.btns) === JSON.stringify(['Continue untimed', 'Let it go']), 'options: ' + e.btns.join(', '));
  assert(e.val === 'み' && e.c.expired && e.c.state === 'expired' && e.c.activeMs >= 5000, 'expired, frozen, the draft kept: ' + JSON.stringify(e));
  await shot(p, 'expiry_1280');
  await p.click('.pace-veil [data-pace=untimed-continue]');
  await p.waitForFunction(() => !document.querySelector('.pace-veil') && !__clk().timed);
  assert((await p.evaluate(() => document.activeElement.id)) === 'ime-in', 'focus goes back to the answer');
  await p.type('#ime-in', 'ぎ');
  await p.press('#ime-in', 'Enter');
  const res = await done(p);
  const P = res.paced;
  assert(res.ok && P.kind === 'custom' && P.timed && P.expired && P.onTime === false && P.convertedToUntimed === 'expired' && P.submittedResult === 'correct' && P.pauseReasons.help >= 1 && P.assistance.includes('word-help') && P.inputMode === 'ime' && !P.sample, 'result: ' + JSON.stringify(P));
  const r = await p.evaluate(() => ({ rec: __s.practice.fishing.recentAttempts.slice(-1)[0], item: __s.learn.items['v:右'] || null }));
  assert(r.rec.expired && r.rec.budgetMs === 5000 && r.rec.paceKind === 'custom' && r.rec.submittedResult === 'correct', 'the expiry is recorded in the timing record only: ' + JSON.stringify(r.rec));
  assert(!r.item || !r.item.seen, 'no ordinary mastery event (no timeout mistake): ' + JSON.stringify(r.item));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('recognition repair stops the pace and costs nothing ("That is not what I wrote", one-press Confirm character & continue)', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'hand' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/repair', representation: 'kana' }), RIGHT);
  await ready(p);
  await p.evaluate(() => RB.pad.__last._inject(__ink('み')));
  await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure');
  const before = await p.evaluate(() => ({ dis: document.querySelector('[data-a=notwrote]').disabled, conf: document.querySelector('[data-a=confirm]').textContent.trim() }));
  assert(!before.dis && before.conf === 'Confirm', 'the repair is offered even after a confident reading: ' + JSON.stringify(before));
  await p.click('[data-a=notwrote]');
  await p.waitForFunction(() => __clk().reasons && __clk().reasons.includes('recognition-repair'));
  const a = (await clk(p)).activeMs;
  await p.waitForTimeout(1000);
  const st = await p.evaluate(() => ({ c: __clk(), conf: document.querySelector('[data-a=confirm]').textContent.trim(), bar: document.querySelector('.pace-st').textContent }));
  assert(st.c.activeMs === a && st.conf === 'Confirm character & continue' && /correcting what the pad read/.test(st.bar), 'repair stops the clock: ' + JSON.stringify(st));
  await shot(p, 'repair_1280');
  // write it again, then one press inserts it and continues
  await p.evaluate(() => RB.pad.__last._inject(__ink('み', 3)));
  await p.waitForTimeout(250);
  await p.click('[data-a=confirm]');
  await p.waitForFunction(() => __clk().state === 'running');
  assert((await p.evaluate(() => RB.pad.__last.text())) === 'み', 'the reviewed character was inserted by the same press');
  // candidate review: tapping another reading stops the pace too; writing it again and
  // "Confirm character & continue" goes on
  await p.evaluate(() => RB.pad.__last._inject(__ink('ぎ')));
  await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure');
  await p.click('.cands .cand >> nth=0');
  await p.waitForFunction(() => __clk().reasons && __clk().reasons.includes('candidate-review'));
  const cr = await p.evaluate(() => ({ c: __clk(), conf: document.querySelector('[data-a=confirm]').textContent.trim(), st: document.querySelector('.pace-st').textContent }));
  assert(cr.c.state === 'paused' && cr.conf === 'Confirm character & continue' && /checking what the pad read/.test(cr.st), 'candidate review pauses: ' + JSON.stringify(cr));
  await p.click('[data-a=clear]');
  await p.evaluate(() => RB.pad.__last._inject(__ink('ぎ')));
  await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure');
  await p.click('[data-a=confirm]');
  await p.waitForFunction(() => __clk().state === 'running');
  await p.click('[data-a=submit]');
  const res = await done(p);
  assert(res.ok && res.mistakes === 0 && res.firstTry === true, 'no mistake: ' + JSON.stringify({ ok: res.ok, m: res.mistakes, f: res.firstTry }));
  assert(res.paced.recognitionRepair && !res.paced.expired && res.paced.onTime === true && res.paced.convertedToUntimed === null && res.paced.submittedResult === 'correct' && res.paced.excluded.includes('recognition-repair'), 'on time, repair recorded, never a sample: ' + JSON.stringify(res.paced));
  assert(res.paced.activeMs < 60000 && res.paced.pauseReasons['recognition-repair'] >= 1 && res.paced.pauseReasons['candidate-review'] >= 1, 'repair and review time not charged ' + JSON.stringify(res.paced.pauseReasons));
  assert(res.paced.pauseReasons.processing >= 3, 'the recognizer\'s input-blocked processing was left out each time (' + res.paced.pauseReasons.processing + ')');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('a misread reported after a wrong answer is not a Japanese error: the draft stays, the timed window comes back', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'hand' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/misread', representation: 'kana' }), RIGHT);
  await ready(p);
  for (const ch of ['み', 'き']) {
    await p.evaluate((ch) => RB.pad.__last._inject(__ink(ch)), ch);
    await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure');
    await p.click('[data-a=confirm]');
  }
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=no] .fb-misread');
  const w = await p.evaluate(() => ({ c: __clk(), text: RB.pad.__last.text() }));
  assert(!w.c.timed && w.c.converted === 'content-correction' && w.text === 'みき', 'a confirmed wrong answer continues untimed and keeps the draft: ' + JSON.stringify(w));
  await p.click('.fb-misread');
  await p.waitForSelector('.fbwrap[data-fb=unsure]');
  const m = await clk(p);
  assert(m.timed && m.converted === null && m.reasons.includes('recognition-repair') && m.hold, 'reported misread: the pace comes back, stopped for repair: ' + JSON.stringify(m));
  // rewrite the misread character: tap it in the answer, write it, one press continues
  await p.click('.strip .cell:not(.ins) >> nth=1');
  await p.evaluate(() => RB.pad.__last._inject(__ink('ぎ')));
  await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure');
  assert((await p.evaluate(() => document.querySelector('[data-a=confirm]').textContent.trim())) === 'Confirm character & continue', 'one press inserts and continues');
  await p.click('[data-a=confirm]');
  await p.waitForFunction(() => __clk().state === 'running');
  await p.click('[data-a=submit]');
  const res = await done(p);
  assert(res.ok && res.mistakes === 0 && res.firstTry === true && res.recogMisses >= 1, 'not a mistake: ' + JSON.stringify({ m: res.mistakes, f: res.firstTry, r: res.recogMisses }));
  assert(res.paced.onTime === true && res.paced.convertedToUntimed === null && res.paced.recognitionRepair && res.paced.submittedResult === 'correct', 'on time, no cost: ' + JSON.stringify(res.paced));
  // a genuine wrong answer first, then a misread reported on a second one: the genuine
  // correction stands (still untimed), only the reported one is uncounted
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/misread2', representation: 'kana' }), RIGHT);
  await ready(p);
  const writeAll = async (chars) => { for (const ch of chars) { await p.evaluate((ch) => RB.pad.__last._inject(__ink(ch)), ch); await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure'); await p.click('[data-a=confirm]'); } };
  await writeAll(['ひ', 'だ', 'り']);
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=no]');
  await p.evaluate(() => RB.pad.__last.reset());
  await writeAll(['み', 'き']);
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=no] .fb-misread');
  await p.click('.fb-misread');
  await p.waitForSelector('.fbwrap[data-fb=unsure]');
  const g2 = await clk(p);
  assert(!g2.timed && g2.converted === 'content-correction', 'with a genuine content error earlier, the attempt stays untimed: ' + JSON.stringify(g2));
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  const r2 = await p.evaluate(() => window.__res);
  assert(r2.mistakes === 1 && r2.recogMisses === 1, 'one genuine mistake, one uncounted misread: ' + JSON.stringify({ m: r2.mistakes, r: r2.recogMisses }));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('a hidden tab and a lost window focus pause it (simulated); coming back needs Continue', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'ime' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/hidden' }), RIGHT);
  await ready(p);
  await p.waitForTimeout(300);
  await p.evaluate(() => __hide(true));
  const a = (await clk(p)).activeMs;
  await p.waitForTimeout(1500);
  const h = await clk(p);
  assert(h.state === 'paused' && h.reasons.includes('hidden') && h.activeMs === a, 'hidden: paused ' + JSON.stringify(h));
  await p.evaluate(() => __hide(false));
  await p.waitForTimeout(600);
  const v = await p.evaluate(() => ({ c: __clk(), veil: document.querySelector('.pace-veil') && document.querySelector('.pace-veil').textContent }));
  assert(v.c.state === 'paused' && v.c.hold && v.c.activeMs === a && /background/.test(v.veil || ''), 'back: still paused until Continue ' + JSON.stringify(v));
  await p.click('.pace-veil [data-pace=continue]');
  await p.waitForFunction(() => __clk().state === 'running');
  await p.evaluate(() => window.dispatchEvent(new Event('blur')));
  await p.waitForFunction(() => __clk().state === 'paused');
  const b1 = (await clk(p)).activeMs;
  await p.waitForTimeout(800);
  await p.evaluate(() => window.dispatchEvent(new Event('focus')));
  await p.waitForTimeout(300);
  const f = await p.evaluate(() => ({ c: __clk(), veil: document.querySelector('.pace-veil') && document.querySelector('.pace-veil').textContent }));
  assert(f.c.state === 'paused' && f.c.activeMs === b1 && /lost focus/.test(f.veil || ''), 'focus loss pauses; regaining it does not restart ' + JSON.stringify(f));
  // Escape on a pause sheet neither continues nor leaves
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  assert((await clk(p)).state === 'paused' && !(await p.evaluate(() => window.__res)), 'Escape does not resume or abandon');
  await p.click('.pace-veil [data-pace=continue]');
  await p.waitForFunction(() => __clk().state === 'running');
  const P = (await clk(p)).pauseReasons;
  assert(P.hidden === 1 && P.blur === 1, 'both reasons recorded ' + JSON.stringify(P));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('a resize pauses until Continue; strokes are kept', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'hand' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/resize', representation: 'kana' }), RIGHT);
  await ready(p);
  await p.evaluate(() => RB.pad.__last._inject(__ink('み')));
  await p.waitForTimeout(250);
  await p.setViewportSize({ width: 1000, height: 760 });
  await p.waitForFunction(() => __clk().state === 'paused');
  const a = (await clk(p)).activeMs;
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({ c: __clk(), n: RB.pad.__last._state.strokes.length, veil: document.querySelector('.pace-veil').textContent }));
  assert(r.c.activeMs === a && r.c.pauseReasons.layout === 1 && /screen changed size/.test(r.veil), 'resize: paused and said why ' + JSON.stringify(r));
  assert(r.n === 2, 'the two strokes of み are kept: ' + r.n);
  await p.click('.pace-veil [data-pace=continue]');
  await p.waitForFunction(() => __clk().state === 'running');
  // a modal over the task (the kanji chart) pauses; closing it needs Continue
  await p.evaluate(() => { const m = document.querySelector('[data-a=more]'); if (m && m.offsetParent) m.click(); });
  await p.click('.pad-extra [data-a=chart]');
  await p.waitForFunction(() => __clk().reasons && __clk().reasons.includes('modal'));
  const m0 = (await clk(p)).activeMs;
  await p.waitForTimeout(600);
  await p.keyboard.press('Escape');
  await p.waitForSelector('.pace-veil[data-veil=pause]');
  const m1 = await p.evaluate(() => ({ c: __clk(), veil: document.querySelector('.pace-veil').textContent }));
  assert(m1.c.activeMs === m0 && m1.c.hold && /another window/.test(m1.veil) && m1.c.pauseReasons.modal === 1, 'the chart paused it; back from it waits for Continue ' + JSON.stringify(m1));
  await p.click('.pace-veil [data-pace=continue]');
  await p.waitForFunction(() => __clk().state === 'running');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('developer measurement is local and consent-gated; Off can measure from Ready when asked', async () => {
  const { p, errors, ctx, requests } = await open(DESK, { input: 'ime', settings: { fishingPaceMeasure: true } });
  await p.evaluate(() => { try { localStorage.removeItem('rb.pace.pilot.v1'); } catch (e) { /* none */ } });
  await p.evaluate((st) => __attempt(st, { pace: 'off', taskId: 'T/offmeasure' }), RIGHT);
  await p.waitForSelector('.pace-cover');
  const g = await p.evaluate(() => ({ plan: __cur().plan, text: document.querySelector('.pace-cover').textContent }));
  assert(g.plan.clock === 'measure' && /Pace is off/.test(g.text) && /untimed/.test(g.text), 'Off + "measure my untimed answers": Ready, no deadline ' + JSON.stringify(g));
  await ready(p);
  await p.fill('#ime-in', 'みぎ');
  await p.press('#ime-in', 'Enter');
  let res = await done(p);
  assert(res.paced.kind === 'off' && res.paced.clock === 'measure' && !res.paced.timed && res.paced.sample, 'a sample from an Off answer measured from Ready: ' + JSON.stringify(res.paced));
  // the diagnostics panel: buckets with p50/p75/p90, exclusions; no pilot capture without consent
  await p.evaluate(() => RB.pace.dev.open(__s));
  await p.waitForSelector('.pace-dev');
  const d = await p.evaluate(() => document.querySelector('.pace-dev').textContent);
  assert(/Typing \(IME\)/.test(d) && /p75/.test(d) && /Nothing leaves this device/.test(d) && /No human pilot data exists/.test(d) && /Off\./.test(d), 'diagnostics panel: ' + d.slice(0, 400));
  await shot(p, 'dev_1280');
  await p.click('.pace-dev [data-dev-consent]');
  await p.click('.pace-dev [data-dev-close]');
  assert(await p.evaluate(() => !!(RB.pace.dev.pilot() && RB.pace.dev.pilot().consent)), 'consent recorded locally');
  await p.evaluate(() => RB.practice.set(__s, 'fishingPaceMeasure', false));
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/pilot' }), RIGHT);
  await ready(p);
  await p.fill('#ime-in', 'みぎ');
  await p.press('#ime-in', 'Enter');
  await p.waitForSelector('.fbwrap [data-a=continue]');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForSelector('.pace-comfort');
  const q = await p.evaluate(() => document.querySelector('.pace-sheet').textContent);
  assert(/comfortable enough to repeat/.test(q) && /Kept only on this device/.test(q), 'the optional comfort question (pilot only): ' + q);
  await p.click('.pace-comfort [data-c="4"]');
  await p.waitForFunction(() => window.__res);
  const pil = await p.evaluate(() => RB.pace.dev.pilot());
  assert(pil.records.length === 1 && pil.records[0].comfort === 4 && pil.records[0].taskId === 'T/pilot' && !JSON.stringify(pil).includes('みぎ'), 'one local pilot record with the comfort answer, no answer text: ' + JSON.stringify(pil.records));
  const printed = [];
  p.on('console', (m) => { if (/pace diagnostics/.test(m.text())) printed.push(m.text()); });
  await p.evaluate(() => RB.pace.dev.print(__s));
  await p.waitForTimeout(100);
  assert(printed.length === 1, 'Print to console works');
  await p.evaluate(() => RB.pace.dev.clear());
  assert(await p.evaluate(() => RB.pace.dev.pilot() === null), 'the pilot capture is separately deletable');
  assert(!requests.length, 'no network request: ' + requests.join(', '));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('pointer cancellation and lost capture mid-stroke pause; a normal release does not', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'hand' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/pointer', representation: 'kana' }), RIGHT);
  await ready(p);
  const box = await p.evaluate(() => { const r = document.querySelector('.pad-ink').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  // a real mouse stroke: down, move, up
  await p.mouse.move(box.x + box.w * 0.3, box.y + box.h * 0.3);
  await p.mouse.down();
  await p.mouse.move(box.x + box.w * 0.6, box.y + box.h * 0.35, { steps: 6 });
  await p.mouse.up();
  await p.waitForTimeout(300);
  const n1 = await p.evaluate(() => ({ c: __clk(), n: RB.pad.__last._state.strokes.length }));
  assert(n1.c.state === 'running' && !n1.c.pauseReasons['pointer-cancel'] && n1.n === 1, 'a normal release is not a cancellation: ' + JSON.stringify(n1));
  // a cancelled pointer (synthetic: what a system gesture or palm rejection sends)
  const fire = (type, id, f) => p.evaluate(([type, id, f, box]) => {
    const ink = document.querySelector('.pad-ink');
    ink.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: box.x + box.w * f, clientY: box.y + box.h * 0.6, bubbles: true, cancelable: true }));
  }, [type, id, f, box]);
  await fire('pointerdown', 41, 0.3); await fire('pointermove', 41, 0.5); await fire('pointercancel', 41, 0.5);
  await p.waitForFunction(() => __clk().state === 'paused');
  const c = await p.evaluate(() => ({ c: __clk(), veil: document.querySelector('.pace-veil') && document.querySelector('.pace-veil').textContent }));
  assert(c.c.pauseReasons['pointer-cancel'] === 1 && /interrupted/.test(c.veil || ''), 'cancellation pauses and says why ' + JSON.stringify(c));
  await p.click('.pace-veil [data-pace=continue]');
  await p.waitForFunction(() => __clk().state === 'running');
  await fire('pointerdown', 42, 0.3); await fire('pointermove', 42, 0.5); await fire('lostpointercapture', 42, 0.5);
  await p.waitForFunction(() => __clk().state === 'paused');
  const l = await clk(p);
  assert(l.pauseReasons['pointer-cancel'] === 2, 'capture lost mid-stroke pauses too ' + JSON.stringify(l.pauseReasons));
  assert((await p.evaluate(() => RB.pad.__last._state.strokes.length)) === 2, 'the stroke ended by lost capture is kept');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('expiry lets a stroke in progress and a real IME composition finish; nothing is cut off or submitted', async () => {
  {
    const { p, errors, ctx } = await open(DESK, { input: 'hand' });
    await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 5, taskId: 'T/stroke', representation: 'kana' }), RIGHT);
    await ready(p);
    const box = await p.evaluate(() => { const r = document.querySelector('.pad-ink').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    await p.mouse.move(box.x + box.w * 0.2, box.y + box.h * 0.5);
    await p.mouse.down();
    await p.mouse.move(box.x + box.w * 0.3, box.y + box.h * 0.5, { steps: 3 });
    await p.waitForFunction(() => __clk().expired, null, { timeout: 9000 });
    await p.waitForTimeout(300);
    const mid = await p.evaluate(() => ({ cur: __cur(), veil: !!document.querySelector('.pace-veil'), st: document.querySelector('.pace-st').textContent }));
    assert(mid.cur.pendingExpiry && !mid.veil && /finish what you are writing/.test(mid.st), 'the sheet waits for the stroke ' + JSON.stringify(mid));
    await p.mouse.move(box.x + box.w * 0.8, box.y + box.h * 0.5, { steps: 6 });
    await p.mouse.up();
    await p.waitForSelector('.pace-veil[data-veil=expiry]');
    assert((await p.evaluate(() => RB.pad.__last._state.strokes.length)) === 1, 'the stroke finished and was kept');
    await p.click('.pace-veil [data-pace=untimed-continue]');
    assert((await p.evaluate(() => RB.pad.__last._state.strokes.length)) === 1 && !(await p.evaluate(() => window.__res)), 'still there after Continue untimed; nothing submitted');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
  {
    const { p, errors, ctx } = await open(DESK, { input: 'ime' });
    await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 5, taskId: 'T/ime' }), RIGHT);
    await ready(p);
    const cdp = await cdpIme(p, ctx, 'み', false);
    await p.keyboard.press('Enter').catch(() => {});
    await p.waitForFunction(() => __clk().expired, null, { timeout: 9000 });
    await p.waitForTimeout(300);
    const mid = await p.evaluate(() => ({ cur: __cur(), veil: !!document.querySelector('.pace-veil'), val: document.querySelector('#ime-in').value, fb: document.querySelector('.fbwrap').getAttribute('data-fb') }));
    assert(mid.cur.pendingExpiry && !mid.veil && mid.val === 'み' && !mid.fb, 'composition in progress at expiry: not cut off, not submitted ' + JSON.stringify(mid));
    await cdp.send('Input.insertText', { text: 'みぎ' });
    await p.waitForSelector('.pace-veil[data-veil=expiry]');
    const after = await p.evaluate(() => ({ val: document.querySelector('#ime-in').value, res: window.__res }));
    assert(after.val === 'みぎ' && !after.res, 'the composition finished, then the sheet: ' + JSON.stringify(after));
    await p.click('.pace-veil [data-pace=untimed-continue]');
    await p.press('#ime-in', 'Enter');
    const res = await done(p);
    assert(res.ok && res.paced.expired && res.paced.convertedToUntimed === 'expired' && res.paced.submittedResult === 'correct', 'landed untimed: ' + JSON.stringify(res.paced));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------------------------------
await test('Let it go ends the cast without a mistake; Untimed at any time keeps the draft', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'ime' });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 5, taskId: 'T/letgo' }), RIGHT);
  await ready(p);
  await p.type('#ime-in', 'み');
  await p.waitForSelector('.pace-veil[data-veil=expiry]', { timeout: 9000 });
  await p.click('.pace-veil [data-pace=let-go]');
  await p.waitForFunction(() => window.__res);
  const r = await p.evaluate(() => ({ res: window.__res, rec: __s.practice.fishing.recentAttempts.slice(-1)[0], item: __s.learn.items['v:右'] || null }));
  assert(r.res.cancelled && r.res.paced.letGo && r.res.paced.submittedResult === 'let-go' && r.res.mistakes === 0 && r.rec.expired, 'let go: ' + JSON.stringify(r.res.paced));
  assert(!r.item || !r.item.seen, 'no mastery record');
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/untimed' }), RIGHT);
  await ready(p);
  await p.type('#ime-in', 'み');
  await p.click('.pace-bar [data-pace=untimed]');
  await p.waitForFunction(() => !__clk().timed);
  const u = await p.evaluate(() => ({ val: document.querySelector('#ime-in').value, c: __clk(), st: document.querySelector('.pace-st').textContent, hint: document.querySelector('.fbwrap').textContent }));
  assert(u.val === 'み' && u.c.converted === 'player' && /Untimed now/.test(u.st) && /nothing happens until you submit/.test(u.hint), 'converted to untimed, draft kept: ' + JSON.stringify(u));
  // a representation change after Ready (kana chosen, kanji typed) also makes it untimed
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/repr', representation: 'kana' }), RIGHT);
  await ready(p);
  await p.fill('#ime-in', '右');
  await p.waitForFunction(() => !__clk().timed);
  assert((await clk(p)).converted === 'representation-changed', 'kana chosen, kanji written: untimed');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('Gentle: untimed and measured until 12 comparable samples, then offered once and fixed; pointer class and representation choose the bucket', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'ime', settings: { fishingPace: 'gentle' } });
  await p.evaluate((st) => __attempt(st, { pace: 'gentle', taskId: 'T/measure' }), CHOOSE);
  await p.waitForSelector('.pace-cover');
  const g = await p.evaluate(() => ({ text: document.querySelector('.pace-cover').textContent, bar: document.querySelector('.pace-bar').textContent, plan: __cur().plan }));
  assert(/not prepared/.test(g.text) && /0 of 12/.test(g.text) && /untimed/.test(g.text) && g.plan.clock === 'measure' && g.plan.key === 'select.mouse.choose.o2-4', 'uncalibrated Gentle: untimed, measured from Ready ' + JSON.stringify(g));
  await shot(p, 'measure_gate_1280');
  await p.click('.pace-cover [data-pace=ready]');
  await p.waitForFunction(() => __clk().state === 'running');
  assert(!(await p.evaluate(() => document.querySelector('.pace-line').getBoundingClientRect().width)), 'no slack line: nothing is timed');
  await p.waitForTimeout(400);
  await p.click('.mc .btn:has-text("right")');
  let res = await done(p);
  assert(res.paced.clock === 'measure' && !res.paced.timed && res.paced.sample && res.paced.bucket === 'select.mouse.choose.o2-4' && res.paced.pointerClass === 'mouse', 'a comparable successful untimed sample: ' + JSON.stringify(res.paced));
  const n1 = await p.evaluate(() => __s.practice.fishing.calibration.buckets['select.mouse.choose.o2-4'].s);
  assert(n1.length === 1 && n1[0] >= 300 && n1[0] < 20000, 'stored: ' + JSON.stringify(n1));
  // known samples (1..12 s): B = 9 s → Gentle 22 s, Brisk 15 s
  await p.evaluate(() => { RB.paceCore.recalibrate(__s, 'select.mouse.choose.o2-4'); for (let i = 1; i <= 12; i++) RB.paceCore.addSample(__s, 'select.mouse.choose.o2-4', i * 1000); });
  await p.evaluate((st) => __attempt(st, { pace: 'gentle', taskId: 'T/offer' }), CHOOSE);
  await p.waitForSelector('.pace-cover');
  const o = await p.evaluate(() => ({ text: document.querySelector('.pace-cover').textContent, plan: __cur().plan, acc: __s.practice.fishing.calibration.buckets['select.mouse.choose.o2-4'].acc }));
  assert(/Gentle is ready/.test(o.text) && /22 seconds/.test(o.text) && o.plan.clock === 'timed' && o.plan.sec === 22 && o.plan.proposal && !o.acc, 'offered, not yet accepted: ' + JSON.stringify(o));
  await shot(p, 'offer_gate_1280');
  // a keyboard Ready press is another input class: the gate re-plans before any budget runs
  await p.focus('.pace-cover [data-pace=ready]');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.pace-gn');
  const k = await p.evaluate(() => ({ note: document.querySelector('.pace-gn').textContent, plan: __cur().plan, phase: __cur().phase }));
  assert(k.phase === 'gate' && /keyboard/.test(k.note) && k.plan.key === 'select.key.choose.o2-4' && k.plan.clock === 'measure', 'keyboard selection has its own bucket: ' + JSON.stringify(k));
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  await p.evaluate((st) => __attempt(st, { pace: 'gentle', taskId: 'T/offer2' }), CHOOSE);
  await p.waitForSelector('.pace-cover');
  await p.click('.pace-cover [data-pace=ready]');
  await p.waitForFunction(() => __clk().state === 'running');
  const t1 = await p.evaluate(() => ({ c: __clk(), acc: __s.practice.fishing.calibration.buckets['select.mouse.choose.o2-4'].acc }));
  assert(t1.c.timed && t1.c.budgetMs === 22000 && t1.acc && t1.acc.gentle === 22 && t1.acc.brisk === 15, 'Ready accepted the offer; it is now fixed: ' + JSON.stringify(t1));
  await p.click('.mc .btn:has-text("right")');
  res = await done(p);
  assert(res.paced.timed && res.paced.onTime === true && !res.paced.sample, 'a timed answer is never a sample: ' + JSON.stringify(res.paced));
  // faster samples later cannot tighten it; Brisk uses the same accepted baseline
  await p.evaluate(() => { for (let i = 0; i < 24; i++) RB.paceCore.addSample(__s, 'select.mouse.choose.o2-4', 500); });
  await p.evaluate((st) => __attempt(st, { pace: 'brisk', taskId: 'T/brisk' }), CHOOSE);
  await p.waitForSelector('.pace-cover');
  const br = await p.evaluate(() => __cur().plan);
  assert(br.clock === 'timed' && br.sec === 15 && !br.proposal, 'Brisk 15 s from the accepted baseline, unchanged by new samples: ' + JSON.stringify(br));
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  // representation choice before Ready changes the bucket (never showing the answer)
  await p.evaluate(() => { RB.game.settings.input = 'hand'; });
  await p.evaluate((st) => __attempt(st, { pace: 'gentle', taskId: 'T/repr', representation: 'kana' }), RIGHT);
  await p.waitForSelector('.pace-cover input[name=pace-repr]');
  const k1 = (await cur(p)).plan.key;
  await p.click('.pace-cover input[name=pace-repr][value=mixed]');
  await p.waitForFunction(() => __cur().plan.repr === 'mixed');
  const k2 = await p.evaluate(() => ({ key: __cur().plan.key, mode: RB.pad.__last.mode(), focus: document.activeElement.value }));
  assert(k1 === 'hand.mouse.kana.l1' && k2.key === 'hand.mouse.mixed.l1.s1' && k2.mode === 'kanji' && k2.focus === 'mixed', 'kana and mixed-kanji are different buckets; the pad reads kanji when chosen: ' + JSON.stringify([k1, k2]));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('ordinary challenges have no clock: no Pace bar, no Ready, no repair row, unchanged wrong-answer behaviour', async () => {
  const { p, errors, ctx } = await open(DESK, { input: 'hand' });
  const n0 = await p.evaluate(() => RB.pace.clocksCreated());
  await p.evaluate((st) => __ordinary(st), RIGHT);
  await p.waitForSelector('.pad-ink');
  await p.waitForTimeout(300);
  const ui = await p.evaluate(() => ({ bar: !!document.querySelector('.pace-bar'), gate: !!document.querySelector('.pace-cover'), repair: !!document.querySelector('.pad-repair'), cur: RB.pace.current(), hint: document.querySelector('.fbwrap').textContent }));
  assert(!ui.bar && !ui.gate && !ui.repair && ui.cur === null && /nothing happens until you submit/.test(ui.hint), 'no pace anything: ' + JSON.stringify(ui));
  for (const ch of ['み', 'き']) {
    await p.evaluate((ch) => RB.pad.__last._inject(__ink(ch)), ch);
    await p.waitForFunction(() => document.querySelector('.readas').getAttribute('data-state') === 'sure');
    assert((await p.evaluate(() => document.querySelector('[data-a=confirm]').textContent.trim())) === 'Confirm', 'the confirm label is unchanged');
    await p.click('[data-a=confirm]');
  }
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=no]');
  const w = await p.evaluate(() => ({ text: RB.pad.__last.text(), mis: !!document.querySelector('.fb-misread') }));
  assert(w.text === '' && !w.mis, 'an ordinary wrong handwritten answer still clears the pad, with no pace control: ' + JSON.stringify(w));
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  await p.evaluate((st) => __ordinary(st), CHOOSE);
  await p.waitForSelector('.mc .btn');
  await p.waitForTimeout(300);
  assert(!(await p.evaluate(() => !!document.querySelector('.pace-bar') || !!RB.pace.current())), 'choices: no pace');
  await p.click('.mc .btn:has-text("right")');
  await done(p);
  // an authored challenge from the content (RB.challenge.run)
  const id = await p.evaluate(() => Object.keys(RB.content.challenges)[0]);
  await p.evaluate((id) => { window.__runRes = null; RB.challenge.run(id).then((r) => { window.__runRes = r; }); }, id);
  await p.waitForSelector('.chal, .banner-layer', { timeout: 5000 });
  await p.waitForTimeout(500);
  assert(!(await p.evaluate(() => !!document.querySelector('.pace-bar') || !!RB.pace.current())), 'authored challenge ' + id + ': no pace');
  const n1 = await p.evaluate(() => RB.pace.clocksCreated());
  assert(n1 === n0, 'no clock was created by any ordinary challenge (' + n0 + ' → ' + n1 + ')');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('the Pace control and the attempt: 44 px targets, keyboard, 320×640 / 390×844 / 844×390 and 200 % text, reduced motion', async () => {
  const bad = [];
  const check = (p, tag) => p.evaluate((tag) => {
    const W = innerWidth, out = [];
    if (document.documentElement.scrollWidth > W + 1) out.push(tag + ': page ' + document.documentElement.scrollWidth);
    for (const el of document.querySelectorAll('.pace-bar *, .pace-cover *, .pace-veil *, .pace-setup *, .pad-repair *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length || el.closest('.sr')) continue;
      const q = el.getBoundingClientRect();
      if (q.width && q.height && (q.right > W + 1 || q.left < -1)) out.push(tag + ': overflow ' + (el.className && el.className.baseVal == null ? el.className : el.tagName) + ' ' + Math.round(q.left) + '..' + Math.round(q.right));
    }
    for (const el of document.querySelectorAll('.pace-bar button, .pace-cover button, .pace-veil button, .pace-setup button, .pad-repair button, .pace-cover label, .pace-setup label.pace-opt, .pace-setup label.pace-check')) {
      if (!el.getClientRects().length || getComputedStyle(el).display === 'none') continue;
      const q = el.getBoundingClientRect();
      if (q.height < 43.5 || q.width < 43.5) out.push(tag + ': small target ' + el.textContent.trim().slice(0, 30) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height));
    }
    return out;
  }, tag);
  for (const [w, h] of [[320, 640], [390, 844], [844, 390], [1280, 800]]) for (const scale of [1, 2]) {
    const opts = w < 900 ? phone(w, h) : DESK;
    const { p, errors, ctx } = await open(opts, { input: 'hand' });
    // a touch screen is tapped (a mouse click there would be another pointer class, and re-plan)
    const press = (q) => (w < 900 ? p.tap(q, { timeout: 8000 }) : p.click(q, { timeout: 8000 })).catch((e) => { throw new Error(w + 'x' + h + '@' + scale + ' ' + q + ': ' + String(e.message).split('\n').filter((l) => /intercepts|Timeout/.test(l)).join(' ')); });
    await p.evaluate((k) => { RB.game.settings.textScale = k; RB.game.applySettings(); }, scale);
    await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/layout', representation: 'kana' }), RIGHT);
    await p.waitForSelector('.pace-cover');
    const tag = w + 'x' + h + '@' + scale;
    bad.push(...await check(p, tag + ' gate'));
    if (w === 320 && scale === 2) await shot(p, 'gate_320x640_200');
    await press('.pace-cover [data-pace=ready]');
    await p.waitForFunction(() => __clk().state === 'running');
    bad.push(...await check(p, tag + ' running'));
    if (w === 390 && scale === 1) await shot(p, 'running_390x844');
    await press('.pace-bar [data-pace=pause]');
    await p.waitForSelector('.pace-veil');
    bad.push(...await check(p, tag + ' paused'));
    if (w === 320 && scale === 2) await shot(p, 'paused_320x640_200');
    await press('.pace-veil [data-pace=continue]');
    await p.waitForFunction(() => __clk().state === 'running');
    await press('[data-a=leave]');
    await p.waitForFunction(() => window.__res);
    await p.evaluate(() => { RB.pace.openSetup(__s); }); // (resolves when the sheet closes: not awaited)
    await p.waitForSelector('.pace-setup');
    bad.push(...await check(p, tag + ' setup'));
    if (w === 390 && scale === 1) await shot(p, 'setup_390x844');
    if (w === 320 && scale === 2) await shot(p, 'setup_320x640_200');
    if (errors.length) bad.push(tag + ' ' + errors.join('; '));
    await ctx.close();
  }
  assert(!bad.length, bad.slice(0, 20).join('\n   '));
  // keyboard: Tab to Ready, Enter starts; Pause and Continue by keyboard; the setup is keyboard-operable
  const { p, errors, ctx } = await open(DESK, { input: 'ime' });
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await p.evaluate((st) => __attempt(st, { pace: 'custom', budgetSec: 60, taskId: 'T/keys' }), RIGHT);
  await p.waitForSelector('.pace-cover');
  let tabs = 0;
  while (tabs < 30 && !(await p.evaluate(() => document.activeElement && document.activeElement.matches('[data-pace=ready]')))) { await p.keyboard.press('Tab'); tabs++; }
  assert(tabs < 30, 'Ready is reachable by Tab');
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => __clk().state === 'running');
  assert((await p.evaluate(() => document.activeElement.id)) === 'ime-in', 'Enter on Ready starts and focuses the answer');
  const tr = await p.evaluate(() => getComputedStyle(document.querySelector('.pace-line .ln')).transitionDuration);
  assert(/^0s/.test(tr), 'reduced motion: the line does not glide (' + tr + ')');
  await p.focus('.pace-bar [data-pace=pause]');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.pace-veil');
  await p.waitForFunction(() => document.activeElement && document.activeElement.matches('.pace-veil [data-pace=continue]'));
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => __clk().state === 'running');
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  await p.evaluate(() => { RB.pace.openSetup(__s); }); // (resolves when the sheet closes: not awaited)
  await p.waitForSelector('.pace-setup');
  await p.focus('.pace-setup input[value=custom]');
  await p.keyboard.press('Space');
  await p.fill('.pace-setup [data-pace-secs-in]', '200');
  await p.press('.pace-setup [data-pace-secs-in]', 'Tab');
  let st = await p.evaluate(() => RB.practice.settings(__s));
  assert(st.fishingPace === 'custom' && st.fishingCustomSec === 180, 'Custom by keyboard; seconds kept within 5–180: ' + JSON.stringify(st));
  await p.click('.pace-setup [data-pace-sec="-5"]');
  st = await p.evaluate(() => RB.practice.settings(__s));
  assert(st.fishingCustomSec === 175, 'one-second steps, −5 button: ' + st.fishingCustomSec);
  await p.click('.pace-setup input[value=off]');
  assert((await p.evaluate(() => RB.practice.settings(__s).fishingPace)) === 'off', 'Off again');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
