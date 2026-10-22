// RBN-QA-080: a typing task's own content growing while the software keyboard is up (the book's type arriving after
// the keyboard, a line wrapping) keeps the field, and its Submit as far as the field stays in view, above the
// keyboard; never while feedback is shown or the answer is in, never with the keyboard closed, pinch-zoomed or focus
// elsewhere, and nothing of it is left once the task is finished, taken down or replaced. The keyboard is reported the
// way the browser does (the visual viewport shrinks); the growth comes after it, with no viewport event and no focus.
// Synthetic fixtures only. Usage: node tests/e2e/kb_reflow.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 180s')), 180000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 900)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 500)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const phone = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });

// A task as a story or battle runs one, with the book's type settled (RB.bookType.install() itself awaited) and
// spies: which ResizeObservers watch the task's boxes and whether they were let go, every write to the scroll
// surface's scrollTop (what wrote it), focus moves and visual-viewport events.
async function open(p, opts) {
  await p.evaluate(() => {
    if (window.__ros) return; // the spies once per page
    const RO = window.ResizeObserver;
    window.__ros = [];
    window.ResizeObserver = class extends RO {
      constructor(cb) { super(cb); this.__t = []; this.__off = false; window.__ros.push(this); }
      observe(el, o) { this.__t.push(el); return super.observe(el, o); }
      disconnect() { this.__off = true; return super.disconnect(); }
    };
    window.__ev = { focus: 0, vv: 0 };
    document.addEventListener('focusin', () => window.__ev.focus++, true);
    for (const t of ['resize', 'scroll']) window.visualViewport.addEventListener(t, () => window.__ev.vv++);
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await p.evaluate(async (o) => {
    await RB.bookType.install();
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.input = 'ime';
    window.__res = null;
    RB.game.pushMode('challenge');
    const step = { kind: 'write', item: 'v:水', title: 'Test: water', ctx: { jp: '{冬|ふゆ} の {氷|こおり} を わら で {包|つつ}んで 、 {夏|なつ} まで しまって おく 。', en: 'Winter ice is wrapped in straw and stored until summer.' }, prompt: { en: 'Write the word for water.' }, answer: 'みず', accept: ['みず', '水'], mode: 'reading' };
    RB.challenge.runStep(step, o && o.own ? { own: (drop) => { window.__drop = drop; } } : {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
    await window.__frames();
  }, opts || {});
  await p.waitForSelector('#ime-in');
  await p.evaluate(async () => {
    // spy on this task's scroll surface: every write, and whether keepFocusVisible made it
    const body = document.querySelector('.chal .chal-body');
    const d = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    window.__writes = [];
    Object.defineProperty(body, 'scrollTop', { configurable: true, get() { return d.get.call(this); }, set(v) { window.__writes.push(/keepFocusVisible/.test(new Error().stack || '') ? 'keep' : 'other'); d.set.call(this, v); } });
    // the observers watching this task's own boxes
    const task = document.querySelector('.chal .chal-task');
    window.__mine = () => window.__ros.filter((r) => r.__t.includes(task));
    window.__boxes = [...document.querySelectorAll('.chal .chal-task, .chal .chal-work, .chal .chal-answer')];
  });
}
const focusField = async (p) => {
  await p.focus('#ime-in');
  // the field's own focus handler keeps it in view 250 ms later: let that and the task's opening focus pass first,
  // so that what follows can only come from the new path
  await p.waitForTimeout(450);
};
// the browser reports a keyboard covering the lower 330 px (or a pinch-zoom at scale 2)
const keyboard = (p, how) => p.evaluate(async (how) => {
  const vv = window.visualViewport;
  const pinch = how === 'pinch';
  Object.defineProperty(vv, 'height', { configurable: true, get: () => (pinch ? innerHeight / 2 : innerHeight - 330) });
  Object.defineProperty(vv, 'offsetTop', { configurable: true, get: () => (pinch ? 100 : 0) });
  Object.defineProperty(vv, 'scale', { configurable: true, get: () => (pinch ? 2 : 1) });
  vv.dispatchEvent(new Event('resize'));
  await __wait(120); await __frames();
}, how);
// the task grows by px above the field (in the task's text), then where everything stands; with the writes, focus moves
// and viewport events that happened meanwhile
const grow = (p, px, where) => p.evaluate(async ({ px, where }) => {
  window.__writes.length = 0; const f0 = window.__ev.focus, v0 = window.__ev.vv;
  const host = where === 'old' ? window.__oldCtx : document.querySelector('.chal .task-ctx');
  const dv = document.createElement('div'); dv.style.height = px + 'px'; host.appendChild(dv);
  await __frames(); await __wait(150); await __frames();
  const R = (q) => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
  return { visible: innerHeight - 330, body: R('.chal .chal-body'), input: R('#ime-in'), submit: R('.chal [data-a=submit]'), fb: R('.chal .fbwrap[data-fb]'),
    writes: window.__writes.slice(), focusMoves: window.__ev.focus - f0, vvEvents: window.__ev.vv - v0, focused: document.activeElement && (document.activeElement.id || document.activeElement.tagName),
    kb: !!document.querySelector('.chal.kb'), fbOn: !!document.querySelector('.chal.fb-on'), locked: !!document.querySelector('.chal.locked') };
}, { px, where });
const inView = (k, r) => !!r && r.top >= 0 && r.bottom <= k.visible + 1;
// Submit in view, or as far as it can be with the field still in view (the field then at the top of the scroll surface)
const submitOk = (k) => inView(k, k.submit) || k.input.top - k.body.top <= 9;
const clean = (k) => k.focusMoves === 0 && k.vvEvents === 0;

// ---------------------------------------------------------------------------
for (const [W, H] of [[390, 844], [360, 640]]) {
  await test(W + 'x' + H + ': the task grows under the keyboard, the field and Submit stay in view; a wrong answer keeps its feedback in view, quiet while typing resumes; the answer in, quiet; finished, let go', async () => {
    const { p, errors, ctx } = await page(b, url, phone(W, H));
    await open(p);
    await focusField(p);
    await keyboard(p);
    const g = await grow(p, 90);
    assert(clean(g) && g.kb && g.focused === 'ime-in', 'growth with no viewport event and no focus move: ' + JSON.stringify(g));
    // (where the browser's own scroll anchoring already holds the field in place, nothing needs writing)
    assert(inView(g, g.input) && submitOk(g), 'field and Submit in view after the growth: ' + JSON.stringify(g));
    assert(g.writes.every((x) => x === 'keep'), 'only the keep-in-view wrote: ' + JSON.stringify(g));
    // a wrong answer: its feedback is brought into view and stays there (where the field scrolls away above it, too)
    await p.keyboard.insertText('みつ');
    await p.press('#ime-in', 'Enter');
    await p.waitForSelector('.chal .fbwrap[data-fb=no]');
    const w = await grow(p, 0);
    assert(w.fbOn && !w.locked && inView(w, w.fb), 'the wrong answer\'s feedback in view: ' + JSON.stringify(w));
    // typing resumes with the feedback still shown, and the task grows enough to push the field away: the new path
    // stays quiet (it would write to bring the field back)
    await p.fill('#ime-in', '');
    await p.keyboard.insertText('み');
    const t = await grow(p, 300);
    assert(t.fbOn && clean(t) && t.focused === 'ime-in' && !t.writes.length, 'quiet while feedback is shown: ' + JSON.stringify(t));
    // the right answer: in, locked; growth: quiet
    await p.keyboard.insertText('ず');
    await p.press('#ime-in', 'Enter');
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    await focusField(p);
    const l = await grow(p, 300);
    assert(l.locked && !l.writes.includes('keep'), 'quiet once the answer is in: ' + JSON.stringify(l));
    // finished: its observer let go; growing its old boxes does nothing
    await p.evaluate(() => { window.__oldCtx = document.querySelector('.chal .task-ctx'); document.querySelector('.chal [data-a=continue]').click(); });
    await p.waitForFunction(() => window.__res && !document.querySelector('.chal'));
    const fin = await p.evaluate(() => ({ mine: window.__mine().length, off: window.__mine().every((r) => r.__off), ok: window.__res.ok }));
    assert(fin.mine === 1 && fin.off && fin.ok, 'finished: its observer let go: ' + JSON.stringify(fin));
    const after = await p.evaluate(async () => { window.__writes.length = 0; const dv = document.createElement('div'); dv.style.height = '50px'; window.__oldCtx.appendChild(dv); await __frames(); await __wait(150); return window.__writes.length; });
    assert(after === 0, 'nothing written after the task finished: ' + after);
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------
await test('no chase: keyboard closed, pinch-zoomed, focus outside the task or on a button in it', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await open(p);
  await focusField(p);
  const closed = await grow(p, 60);
  assert(!closed.kb && !closed.writes.length && clean(closed), 'keyboard closed: ' + JSON.stringify(closed));
  await keyboard(p, 'pinch');
  const pinch = await grow(p, 60);
  assert(!pinch.kb && !pinch.writes.length && clean(pinch), 'pinch-zoomed: ' + JSON.stringify(pinch));
  await keyboard(p);
  // the field loses focus (the page's own body has it): nothing to keep in view
  await p.evaluate(() => document.activeElement.blur());
  await p.waitForTimeout(300);
  const out = await grow(p, 60);
  assert(out.kb && !out.writes.length && out.vvEvents === 0, 'focus outside the task: ' + JSON.stringify(out));
  // a button of the task has focus, not a field: nothing to keep in view
  await p.evaluate(() => document.querySelector('.chal [data-a=reveal]').focus({ preventScroll: true }));
  await p.waitForTimeout(300);
  const btn = await grow(p, 60);
  assert(btn.kb && !btn.writes.length && btn.vvEvents === 0 && btn.focused !== 'ime-in', 'a button focused: ' + JSON.stringify(btn));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('taken down by its owner (QA-078) with the keyboard up: its observer let go, nothing written after; a newer task keeps its own field in view', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await open(p, { own: true });
  await focusField(p);
  await keyboard(p);
  await p.evaluate(() => { window.__oldCtx = document.querySelector('.chal .task-ctx'); window.__oldMine = window.__mine(); window.__drop(); });
  await p.waitForFunction(() => !document.querySelector('.chal'));
  const dropped = await p.evaluate(async () => {
    window.__writes.length = 0;
    const dv = document.createElement('div'); dv.style.height = '50px'; window.__oldCtx.appendChild(dv);
    await __frames(); await __wait(150);
    return { mine: window.__oldMine.length, off: window.__oldMine.every((r) => r.__off), writes: window.__writes.length, res: window.__res };
  });
  assert(dropped.mine === 1 && dropped.off && dropped.writes === 0 && dropped.res === null, 'dropped: ' + JSON.stringify(dropped));
  // a newer task: its own observer, and it keeps its field in view when it grows
  await p.evaluate(() => RB.game.popMode('challenge'));
  await open(p);
  await focusField(p);
  await keyboard(p);
  const g = await grow(p, 90);
  const ros = await p.evaluate(() => ({ mine: window.__mine().length, live: window.__mine().filter((r) => !r.__off).length, old: window.__oldMine.every((r) => r.__off) }));
  assert(ros.mine === 1 && ros.live === 1 && ros.old && g.writes.includes('keep') && inView(g, g.input) && submitOk(g) && clean(g), 'the newer task: ' + JSON.stringify({ ros, g }));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close();
srv.close();
console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
