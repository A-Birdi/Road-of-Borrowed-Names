// Learning & combat interface tests against the built index.html in Chromium:
// the challenge runner (handwriting pad, choices, keyboard/IME, order), lessons
// and the combat overlay. Real pointer, touch and keyboard input where it can
// be driven (mouse strokes, CDP touch gestures, key presses); recognizer input
// is injected only where a specific, real reference-stroke result is needed.
// Synthetic fixtures only. Usage: node tests/e2e/learning_ui.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 180s')), 180000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 800)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const phone = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });

// in-page helpers: reference strokes (seeded jitter) and a hand challenge
async function helpers(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__ink = (ch, seed, j) => {
      const ref = RB.recog.reference(ch);
      const r = RB.util.rng((seed || 7) * 31 + ch.charCodeAt(0));
      const jj = j == null ? 0.02 : j;
      return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jj, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jj, t: 1000 + i * 16 })));
    };
    window.__start = (step, input, profile) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
      s.learn.kanaKnown = 'both'; s.learn.profile = profile || 'E';
      RB.game.settings.input = input || 'hand';
      window.__res = null;
      RB.game.pushMode('challenge'); // as when the story or a battle runs a challenge
      RB.challenge.runStep(typeof step === 'function' ? step() : step, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
    };
    window.__mizu = { kind: 'write', item: 'v:水', title: 'Test: water', ctx: { jp: '{冬|ふゆ} の {氷|こおり} を わら で {包|つつ}んで 、 {夏|なつ} まで しまって おく 。', en: 'Winter ice is wrapped in straw and stored until summer.' }, prompt: { en: 'Write the word for water.' }, answer: 'みず', accept: ['みず', '水'], mode: 'reading' };
  });
}
async function setTextScale(p, k) { await p.evaluate((k) => { RB.game.settings.textScale = k; RB.game.applySettings(); }, k); }
// Everything visible inside `root` must lie within the viewport horizontally
// (a scrollable tab rail may overflow by design: it scrolls and shows arrows).
async function overflowIn(p, rootSel) {
  return p.evaluate((sel) => {
    const W = window.innerWidth;
    const out = [];
    if (document.documentElement.scrollWidth > W + 1) out.push('page scrollWidth ' + document.documentElement.scrollWidth + ' > ' + W);
    const root = document.querySelector(sel);
    if (!root) return ['no ' + sel];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.tabrail, .sr') || el.matches('rt, rt *')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || el.getClientRects().length === 0) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      // clipped by a horizontally non-scrolling ancestor: a genuine reflow loss
      if (r.right > W + 1 || r.left < -1) out.push((el.className && el.className.baseVal == null ? el.className : el.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    }
    return out.slice(0, 8);
  }, rootSel);
}

// ---------------------------------------------------------------------------
await test('pad controls are distinct, labelled and at least 44px (phone and desktop)', async () => {
  for (const opts of [phone(390, 844), { viewport: { width: 1280, height: 800 } }]) {
    const { p, errors, ctx } = await page(b, url, opts);
    await helpers(p);
    await p.evaluate(() => __start(__mizu, 'hand'));
    await p.waitForSelector('.pad-box canvas.pad-ink');
    await p.evaluate(async () => { RB.pad.__last._inject(__ink('み')); await __wait(80); });
    const r = await p.evaluate(() => {
      const sel = ['[data-a=undo]', '[data-a=clear]', '[data-a=confirm]', '[data-a=del]', '[data-a=submit]', '.cands .cand:not([hidden])', '[data-mode=hand]', '[data-mode=choice]', '[data-mode=ime]', '[data-a=more], [data-a=chart]'];
      const vis = (q) => [...document.querySelectorAll(q.split(', ').map((x) => '.chal ' + x).join(', '))].find((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
      const got = sel.map((s) => { const e = vis(s); if (!e) return { s, missing: true }; const rc = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { s, w: rc.width, h: rc.height, x: rc.left, y: rc.top, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && rc.width > 0, label: (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim() }; });
      return got;
    });
    for (const g of r) {
      assert(!g.missing, 'missing control ' + g.s);
      assert(g.vis, 'control not visible: ' + g.s);
      assert(g.w >= 44 && g.h >= 44, g.s + ' is ' + Math.round(g.w) + 'x' + Math.round(g.h) + ' (< 44px)');
      assert(g.label, g.s + ' has no label');
    }
    const labels = r.map((g) => g.label.toLowerCase());
    assert(new Set(labels).size === labels.length, 'labels not distinct: ' + labels.join(' | '));
    // no two principal controls overlap
    const core = r.slice(0, 6);
    for (let i = 0; i < core.length; i++) for (let j = i + 1; j < core.length; j++) {
      const a = core[i], c = core[j];
      const ov = a.x < c.x + c.w - 1 && c.x < a.x + a.w - 1 && a.y < c.y + c.h - 1 && c.y < a.y + a.h - 1;
      assert(!ov, 'controls overlap: ' + a.s + ' / ' + c.s);
    }
    // everything needed is on screen without scrolling (prompt, canvas, read-as, confirm, answer line, submit)
    const onScreen = await p.evaluate(() => ['.chal-prompt', '.pad-ink', '.readas .big', '[data-a=confirm]', '.strip', '[data-a=submit]'].map((s) => { const r = document.querySelector('.chal ' + s).getBoundingClientRect(); return [s, r.top >= 0 && r.bottom <= window.innerHeight + 1]; }));
    for (const [s, ok] of onScreen) assert(ok, s + ' is off screen at ' + JSON.stringify(opts.viewport));
    const pad = await p.evaluate(() => document.querySelector('.pad-ink').getBoundingClientRect().width);
    assert(pad >= Math.min(240, opts.viewport.width * 0.6), 'writing canvas too small: ' + Math.round(pad) + 'px');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------
await test('the writing canvas is the only touch-action: none element in the challenge', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await helpers(p);
  await p.evaluate(() => __start(__mizu, 'hand'));
  await p.waitForSelector('.pad-ink');
  const none = await p.evaluate(() => [...document.querySelectorAll('.chal, .chal *')].filter((e) => getComputedStyle(e).touchAction === 'none').map((e) => e.tagName + '.' + (e.className && e.className.baseVal == null ? e.className : '')));
  assert(none.length === 1 && /CANVAS\.pad-ink/.test(none[0]), 'touch-action:none on: ' + none.join(', '));
  const body = await p.evaluate(() => getComputedStyle(document.querySelector('.chal-body')).touchAction);
  assert(/pan-y/.test(body), 'the scroll surface allows vertical panning: ' + body);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('switching input mode keeps the task, the written strokes and the answer line', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => __start(__mizu, 'hand'));
  await p.waitForSelector('.pad-ink');
  // confirm み, then draw an unconfirmed stroke with the real mouse
  await p.evaluate(async () => { RB.pad.__last._inject(__ink('み')); await __wait(60); });
  await p.click('[data-a=confirm]');
  const box = await p.locator('.pad-ink').boundingBox();
  await p.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(box.x + box.width * (0.3 + i * 0.03), box.y + box.height * (0.3 + i * 0.02));
  await p.mouse.up();
  await p.waitForTimeout(250);
  const before = await p.evaluate(() => ({ prompt: document.querySelector('.chal-prompt').textContent, text: RB.pad.__last.text(), strokes: RB.pad.__last._state.strokes.length, pad: RB.pad.__last }));
  assert(before.text === 'み' && before.strokes === 1, 'setup: ' + JSON.stringify(before));
  await p.click('[data-mode=choice]');
  await p.waitForSelector('.mc .btn');
  await p.click('[data-mode=ime]');
  const carried = await p.inputValue('#ime-in');
  assert(carried === 'み', 'the handwritten answer is carried to the keyboard: "' + carried + '"');
  await p.click('[data-mode=hand]');
  await p.waitForTimeout(150);
  const after = await p.evaluate((b) => ({ prompt: document.querySelector('.chal-prompt').textContent, text: RB.pad.__last.text(), strokes: RB.pad.__last._state.strokes.length, same: true, chal: !!document.querySelector('.chal'), res: window.__res }), before);
  assert(after.chal && !after.res, 'the task is still open');
  assert(after.prompt === before.prompt, 'prompt changed');
  assert(after.text === 'み' && after.strokes === 1, 'writing lost on mode switch: ' + JSON.stringify(after));
  // the canvas still shows ink after being hidden and shown again
  const inked = await p.evaluate(() => { const c = document.querySelector('.pad-ink'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  assert(inked > 50, 'ink redrawn after switching back: ' + inked);
  // keyboard mode, real typing: finishing the answer there still works
  await p.click('[data-mode=ime]');
  await p.fill('#ime-in', '');
  await p.type('#ime-in', 'みず');
  await p.press('#ime-in', 'Enter');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  assert(res.ok && res.mode === 'ime', 'result ' + JSON.stringify(res));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('keyboard: Backspace edits the answer line while writing; Escape steps away', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => __start(__mizu, 'hand'));
  await p.waitForSelector('.pad-ink');
  await p.evaluate(async () => { RB.pad.__last._inject(__ink('み')); await __wait(60); });
  await p.click('[data-a=confirm]');
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.keyboard.press('Backspace');
  const after = await p.evaluate(() => ({ text: RB.pad.__last.text(), open: !!document.querySelector('.chal'), res: window.__res }));
  assert(after.open && !after.res && after.text === '', 'Backspace removed the character and kept the task: ' + JSON.stringify(after));
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => Object.assign({ open: !!document.querySelector('.chal') }, window.__res));
  assert(res.cancelled === true && !res.open, 'Escape stepped away: ' + JSON.stringify(res));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('recognition uncertainty and a wrong answer are distinct in the DOM and on screen', async () => {
  const fbInfo = (p) => p.evaluate(() => { const w = document.querySelector('.fbwrap'); const cs = getComputedStyle(w); return { kind: w.getAttribute('data-fb'), head: w.querySelector('.fb-h').textContent, style: cs.borderTopStyle, left: cs.borderLeftStyle, bg: cs.backgroundColor, icon: w.querySelector('.fb-h svg').innerHTML, vis: w.getBoundingClientRect().bottom <= innerHeight + 1 && w.getBoundingClientRect().top >= 0 }; });
  // a real reference る with jitter, which the recognizer reports as uncertain
  let { p, errors, ctx } = await page(b, url, phone(390, 844));
  await helpers(p);
  await p.evaluate(() => __start(() => RB.tasks.kanaStep('ろ', { bare: true }), 'hand'));
  await p.waitForSelector('.pad-ink');
  const status = await p.evaluate(async () => { RB.pad.__last._inject(__ink('る', 1, 0.08)); await __wait(80); return RB.pad.__last._state.result.status; });
  assert(status === 'uncertain', 'fixture should read as uncertain, got ' + status);
  const live = await p.evaluate(() => ({ state: document.querySelector('.readas').getAttribute('data-state'), border: getComputedStyle(document.querySelector('.readas .big')).borderTopStyle, text: document.querySelector('.readas').textContent }));
  assert(live.state === 'unsure' && live.border === 'dashed' && /not sure/i.test(live.text), 'live uncertainty shown: ' + JSON.stringify(live));
  await p.tap('[data-a=confirm]');
  await p.tap('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb]');
  await p.waitForTimeout(100);
  const unsure = await fbInfo(p);
  await p.screenshot({ path: 'tests/e2e/out/learning_unsure.png' });
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  // a clearly written め for ぬ: a genuine language mistake
  ({ p, errors, ctx } = await page(b, url, phone(390, 844)));
  await helpers(p);
  await p.evaluate(() => __start(() => RB.tasks.kanaStep('ぬ', { bare: true }), 'hand'));
  await p.waitForSelector('.pad-ink');
  await p.evaluate(async () => { RB.pad.__last._inject(__ink('め')); await __wait(80); });
  await p.tap('[data-a=confirm]');
  await p.tap('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=no]');
  await p.waitForTimeout(100);
  const wrong = await fbInfo(p);
  await p.screenshot({ path: 'tests/e2e/out/learning_wrong.png' });
  assert(unsure.kind === 'unsure' && /could not read/i.test(unsure.head), 'unsure feedback: ' + JSON.stringify(unsure));
  assert(wrong.kind === 'no' && /not quite/i.test(wrong.head), 'wrong feedback: ' + JSON.stringify(wrong));
  assert(unsure.style === 'dashed' && wrong.style === 'solid', 'border shape differs (dashed vs solid): ' + unsure.style + ' / ' + wrong.style);
  assert(unsure.bg !== wrong.bg && unsure.icon !== wrong.icon, 'background and mark differ');
  assert(unsure.vis && wrong.vis, 'feedback is scrolled into view');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('uncertain recognition costs nothing; a wrong answer counts once', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => __start(() => RB.tasks.kanaStep('ろ', { bare: true }), 'hand'));
  await p.waitForSelector('.pad-ink');
  await p.evaluate(async () => { RB.pad.__last._inject(__ink('る', 1, 0.08)); await __wait(80); });
  await p.click('[data-a=confirm]');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=unsure]');
  // the uncertain character is marked in the answer line; rewrite it (tap it, write ろ)
  const marked = await p.evaluate(() => !!document.querySelector('.strip .cell.unsure'));
  assert(marked, 'uncertain character is marked in the answer line');
  await p.click('.strip .cell:not(.ins)');
  await p.evaluate(async () => { RB.pad.__last._inject(__ink('ろ')); await __wait(80); });
  await p.click('[data-a=confirm]');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  assert(res.ok && res.mistakes === 0 && res.recogMisses === 1 && res.firstTry === true, 'result ' + JSON.stringify(res));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('a touch scroll over the choices does not choose; a tap does', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await helpers(p);
  await setTextScale(p, 2); // long, enlarged choices: the sheet has to scroll
  await p.evaluate(() => {
    const ch = RB.content.challenges['co.c_chronicle'];
    const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E';
    const step = RB.tasks.stepsOf(ch)[0];
    window.__res = null;
    RB.challenge.runStep(step, {}).then((r) => { window.__res = r; });
  });
  await p.waitForSelector('.mc .btn');
  const cdp = await ctx.newCDPSession(p);
  const scrollable = await p.evaluate(() => { const bd = document.querySelector('.chal-body'); return bd.scrollHeight > bd.clientHeight + 20; });
  assert(scrollable, 'fixture: the challenge must be scrollable at 200% text');
  // start the drag on a choice that is fully on screen
  const target = await p.evaluate(() => { const bs = [...document.querySelectorAll('.mc .btn')]; const b = bs.find((x) => { const r = x.getBoundingClientRect(); return r.top > 40 && r.bottom < innerHeight - 40; }) || bs[0]; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const top0 = await p.evaluate(() => document.querySelector('.chal-body').scrollTop);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: target.x, y: target.y }] });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: target.x, y: target.y - i * 14 }] });
    await p.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(400);
  const afterScroll = await p.evaluate(() => ({ top: document.querySelector('.chal-body').scrollTop, fb: (document.querySelector('.fbwrap') || {}).getAttribute('data-fb'), tried: document.querySelectorAll('.mc .btn.tried, .mc .btn.on').length, res: window.__res }));
  assert(afterScroll.top !== top0, 'the gesture scrolled the page surface (' + top0 + ' → ' + afterScroll.top + ')');
  assert(!afterScroll.fb && afterScroll.tried === 0 && !afterScroll.res, 'scrolling chose an option: ' + JSON.stringify(afterScroll));
  // the same finger, tapping, does choose
  const t2 = await p.evaluate(() => { const bs = [...document.querySelectorAll('.mc .btn')]; const b = bs.find((x) => { const r = x.getBoundingClientRect(); return r.top > 0 && r.bottom < innerHeight; }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(t2.x, t2.y);
  await p.waitForSelector('.fbwrap[data-fb]');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('long-press on Japanese in an answer opens word help; a tap chooses (touch)', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await helpers(p);
  await p.evaluate(() => { RB.game.settings.lightbulb = true; __start({ kind: 'write', item: 'v:水', prompt: { en: 'Water.' }, answer: 'みず', accept: ['みず'], mode: 'kana', choices: ['みす', 'みず', 'ミズ'] }, 'choice'); });
  await p.waitForSelector('.mc .btn .jt');
  const cdp = await ctx.newCDPSession(p);
  const w = await p.evaluate(() => { const b = [...document.querySelectorAll('.mc .btn')].find((x) => x.textContent === 'みす'); const r = b.querySelector('.jt').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: w.x, y: w.y }] });
  await p.waitForTimeout(650);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(200);
  const lp = await p.evaluate(() => ({ help: !!document.querySelector('.help'), fb: document.querySelector('.fbwrap').getAttribute('data-fb'), tried: document.querySelectorAll('.mc .btn[disabled]').length }));
  assert(lp.help && !lp.fb && lp.tried === 0, 'long press: ' + JSON.stringify(lp));
  await p.evaluate(() => RB.ui.help.hide(true));
  const r = await p.evaluate(() => { const b = [...document.querySelectorAll('.mc .btn')].find((x) => x.textContent === 'みず'); const q = b.querySelector('.jt').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await p.touchscreen.tap(r.x, r.y);
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('the typing field stays above the software keyboard; pinch-zoom is ignored; Enter waits for IME composition', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await helpers(p);
  await p.evaluate(() => __start(__mizu, 'ime'));
  await p.waitForSelector('#ime-in');
  await p.focus('#ime-in');
  // the browser reports a keyboard covering the lower 330px of the visual viewport
  const kb = await p.evaluate(async () => {
    const vv = window.visualViewport;
    Object.defineProperty(vv, 'height', { configurable: true, get: () => innerHeight - 330 });
    Object.defineProperty(vv, 'offsetTop', { configurable: true, get: () => 0 });
    Object.defineProperty(vv, 'scale', { configurable: true, get: () => 1 });
    vv.dispatchEvent(new Event('resize'));
    await __wait(120);
    const inp = document.getElementById('ime-in').getBoundingClientRect(), sub = document.querySelector('[data-a=submit]').getBoundingClientRect(), fr = document.querySelector('.chal').getBoundingClientRect();
    return { visible: innerHeight - 330, inputBottom: inp.bottom, inputTop: inp.top, submitBottom: sub.bottom, chal: fr.height };
  });
  assert(kb.chal <= kb.visible + 1, 'overlay fits the visible viewport: ' + JSON.stringify(kb));
  assert(kb.inputTop >= 0 && kb.inputBottom <= kb.visible, 'typing field above the keyboard: ' + JSON.stringify(kb));
  assert(kb.submitBottom <= kb.visible, 'Submit above the keyboard: ' + JSON.stringify(kb));
  // pinch-zoom (scale 2) moves the visual viewport too; the layout must not chase it
  const zoom = await p.evaluate(async () => {
    const vv = window.visualViewport;
    Object.defineProperty(vv, 'height', { configurable: true, get: () => innerHeight / 2 });
    Object.defineProperty(vv, 'offsetTop', { configurable: true, get: () => 100 });
    Object.defineProperty(vv, 'scale', { configurable: true, get: () => 2 });
    vv.dispatchEvent(new Event('resize'));
    await __wait(120);
    return { h: document.querySelector('.chal').getBoundingClientRect().height, full: innerHeight };
  });
  assert(Math.abs(zoom.h - zoom.full) <= 1, 'pinch-zoom resized the overlay: ' + JSON.stringify(zoom));
  // Enter during composition does not submit; after composition it does
  await p.fill('#ime-in', 'みず');
  await p.evaluate(() => { const i = document.getElementById('ime-in'); i.dispatchEvent(new CompositionEvent('compositionstart')); i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })); });
  await p.waitForTimeout(80);
  assert(!(await p.evaluate(() => document.querySelector('.fbwrap').getAttribute('data-fb'))), 'Enter during composition submitted');
  await p.evaluate(() => document.getElementById('ime-in').dispatchEvent(new CompositionEvent('compositionend')));
  await p.waitForTimeout(20);
  await p.press('#ime-in', 'Enter');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('resizing and rotating mid-writing keeps the strokes and the task', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => __start(__mizu, 'hand'));
  await p.waitForSelector('.pad-ink');
  const box = await p.locator('.pad-ink').boundingBox();
  for (const [x0, y0, x1, y1] of [[0.25, 0.3, 0.75, 0.3], [0.5, 0.15, 0.45, 0.85]]) {
    await p.mouse.move(box.x + box.width * x0, box.y + box.height * y0);
    await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(box.x + box.width * (x0 + (x1 - x0) * i / 10), box.y + box.height * (y0 + (y1 - y0) * i / 10));
    await p.mouse.up();
  }
  await p.waitForTimeout(250);
  const s0 = await p.evaluate(() => JSON.stringify(RB.pad.__last._state.strokes));
  const inkNow = () => p.evaluate(() => { const c = document.querySelector('.pad-ink'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return { n, w: c.width, css: c.getBoundingClientRect().width }; });
  for (const [w, h] of [[390, 844], [844, 390], [360, 800], [1280, 800]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(300);
    const st = await p.evaluate(() => ({ strokes: JSON.stringify(RB.pad.__last._state.strokes), chal: !!document.querySelector('.chal'), res: window.__res }));
    assert(st.chal && !st.res, 'task survives resize to ' + w + 'x' + h);
    assert(st.strokes === s0, 'strokes changed on resize to ' + w + 'x' + h);
    const ink = await inkNow();
    assert(ink.n > 50 && ink.css > 100, 'ink redrawn at ' + w + 'x' + h + ': ' + JSON.stringify(ink));
    const off = await overflowIn(p, '.chal');
    assert(!off.length, 'overflow at ' + w + 'x' + h + ': ' + off.join('; '));
  }
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('no horizontal overflow at 320/360/390 and at 200% text: challenge, choices, lesson, activity, combat', async () => {
  const screens = {
    async chal(p) { await p.evaluate(() => __start(__mizu, 'hand')); await p.waitForSelector('.pad-ink'); await p.evaluate(async () => { RB.pad.__last._inject(__ink('み')); await __wait(60); }); return '.chal'; },
    async choose(p) { await p.evaluate(() => { const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E'; RB.challenge.runStep(RB.tasks.stepsOf(RB.content.challenges['co.c_chronicle'])[0], {}); }); await p.waitForSelector('.mc .btn'); return '.chal'; },
    async lesson(p) { await p.evaluate(() => { const s = RB.game.debugStart('rw.village', 22, 30, {}); s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {}; RB.lessons.run('kana'); }); await p.waitForSelector('.lsheet.lesson'); return '.lsheet'; },
    async activity(p) { await p.evaluate(() => { const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E'; RB.activities.run('co.a_letters'); }); await p.waitForSelector('.lsheet.activity'); return '.lsheet'; },
    async combat(p) {
      await p.evaluate(() => { const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio' }); s.words.push('mamoru', 'mizu', 'hikari'); RB.game.startBattle('rw.reedling', {}); });
      for (let i = 0; i < 80; i++) { const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp') })); if (st.cards) break; if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
      await p.waitForSelector('.resp');
      return '.combat-ui';
    },
  };
  const bad = [];
  for (const w of [320, 360, 390]) {
    for (const scale of [1, 2]) {
      for (const [name, open] of Object.entries(screens)) {
        const { p, errors, ctx } = await page(b, url, phone(w, 800));
        await helpers(p);
        await setTextScale(p, scale);
        const sel = await open(p);
        await p.waitForTimeout(250);
        const off = await overflowIn(p, sel);
        if (off.length) bad.push(name + ' @' + w + ' x' + scale + ': ' + off.join('; '));
        if (errors.length) bad.push(name + ' @' + w + ' x' + scale + ' errors: ' + errors.join('; '));
        await ctx.close();
      }
    }
  }
  assert(!bad.length, bad.join('\n   '));
});

// ---------------------------------------------------------------------------
// the sheets also carry the old "panel" class; the paper restyle of that class
// once took over their cloth cover and left the title light-on-paper
await test('lesson and activity sheets keep their cloth cover: title and its furigana are readable', async () => {
  const opens = {
    lesson: (p) => p.evaluate(() => { const s = RB.game.debugStart('rw.village', 22, 30, {}); s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {}; RB.lessons.run('kana'); }),
    activity: (p) => p.evaluate(() => { const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E'; RB.activities.run('co.a_letters'); }),
  };
  const bad = [];
  for (const [name, open] of Object.entries(opens)) {
    const { p, errors, ctx } = await page(b, url, phone(390, 844));
    await open(p);
    await p.waitForSelector('.lsheet.' + name + ' .folio-head h2');
    const c = await p.evaluate(() => {
      const rgb = (v) => v.match(/[\d.]+/g).map(Number);
      const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const sheet = document.querySelector('.lsheet'), h2 = sheet.querySelector('.folio-head h2'), rt = h2.querySelector('rt');
      const bg = rgb(getComputedStyle(sheet).backgroundColor);
      return { title: ratio(rgb(getComputedStyle(h2).color), bg), rt: rt ? ratio(rgb(getComputedStyle(rt).color), bg) : null };
    });
    if (!(c.title >= 4.5)) bad.push(name + ' title ' + c.title.toFixed(1) + ':1');
    if (c.rt != null && !(c.rt >= 4.5)) bad.push(name + ' furigana ' + c.rt.toFixed(1) + ':1');
    if (errors.length) bad.push(name + ' errors: ' + errors.join('; '));
    await ctx.close();
  }
  assert(!bad.length, bad.join('; '));
});

// ---------------------------------------------------------------------------
await test('combat at phone and landscape sizes shows the telegraph, its target and the responses', async () => {
  for (const [w, h] of [[390, 844], [360, 800], [844, 390], [1280, 800]]) {
    const { p, errors, ctx } = await page(b, url, w < 900 ? phone(w, h) : { viewport: { width: w, height: h } });
    await p.evaluate(() => { const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio', profile: 'F' }); s.learn.profile = 'F'; s.learn.kanaKnown = 'both'; s.words.push('mamoru', 'mizu', 'hikari'); RB.game.startBattle('rw.reedling', {}); });
    for (let i = 0; i < 80; i++) { const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp') })); if (st.cards) break; if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
    await p.waitForSelector('.resp[data-i]');
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; };
      const inView = (q) => q && q.y >= 0 && q.b <= innerHeight + 1 && q.x >= 0 && q.r <= innerWidth + 1;
      const hit = (s) => { const q = R(s); if (!q) return false; const e = document.elementFromPoint(q.x + q.w / 2, q.y + Math.min(q.h / 2, 20)); return !!(e && e.closest(s)); };
      const it = RB.combat.state().intent;
      const aimed = [...document.querySelectorAll('.cb-party .pm.aimed')].map((x) => x.querySelector('.pm-n').textContent);
      const wardCards = [...document.querySelectorAll('.rcard .rc-tgt')].map((x) => x.textContent.trim());
      const ov = (a, c) => a && c && a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1;
      return {
        intent: R('.combat-ui .intent'), label: document.querySelector('.it-label').textContent, jp: !!document.querySelector('.it-jp .jline'), en: (document.querySelector('.it-en') || {}).textContent || '',
        party: R('.cb-party'), dock: R('.cb-dock'), stage: R('.cb-stage'), foe: R('.cb-foe'),
        intentInView: inView(R('.combat-ui .intent')), partyInView: inView(R('.cb-party')), foeInView: inView(R('.cb-foe')), firstCardInView: inView(R('.resp[data-i="0"]')),
        intentOnTop: hit('.combat-ui .intent'), partyOnTop: hit('.cb-party'), cardOnTop: hit('.resp[data-i="0"]'),
        overlap: ov(R('.combat-ui .intent'), R('.cb-dock')) || ov(R('.combat-ui .intent'), R('.cb-party')) || ov(R('.cb-party'), R('.cb-dock')),
        target: it.target, kind: it.kind, aimed, wardCards,
        flee: inView(R('[data-flee]')),
      };
    });
    const tag = w + 'x' + h + ': ';
    assert(r.intentInView && r.intentOnTop && r.jp && /strike|sweep|waiting|rest/i.test(r.label), tag + 'telegraph visible and uncovered ' + JSON.stringify(r));
    assert(r.foeInView && r.partyInView && r.partyOnTop, tag + 'foe and party visible ' + JSON.stringify(r));
    assert(r.firstCardInView && r.cardOnTop && r.flee, tag + 'responses reachable ' + JSON.stringify(r));
    assert(!r.overlap, tag + 'panels overlap');
    assert(r.stage && r.stage.h >= 80, tag + 'the scene keeps a stage: ' + JSON.stringify(r.stage));
    if (/strike|sweep/.test(r.kind)) {
      const want = r.target === 'both' ? 2 : 1;
      assert(r.aimed.length === want, tag + 'the telegraphed target is marked: ' + JSON.stringify(r));
    }
    assert(r.wardCards.some((x) => /you/i.test(x)) && r.wardCards.some((x) => /mio/i.test(x)), tag + 'ward cards name their target: ' + r.wardCards.join(', '));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------
await test('combat response chosen by keyboard; the challenge shows the situation and the chosen target', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio' }); s.learn.kanaKnown = 'both'; s.words.push('mamoru', 'mizu'); RB.game.settings.input = 'choice'; RB.game.startBattle('rw.reedling', {}); });
  for (let i = 0; i < 80; i++) { const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp') })); if (st.cards) break; if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
  await p.waitForSelector('.resp[data-i]');
  // move focus to the "protect … on Mio" card with the arrow keys, choose it with Enter
  for (let i = 0; i < 12; i++) {
    const t = await p.evaluate(() => { const a = document.activeElement; return a && a.classList.contains('rcard') ? a.textContent : ''; });
    if (/protect/i.test(t) && /mio/i.test(t)) break;
    await p.keyboard.press('ArrowDown');
  }
  await p.keyboard.press('Enter');
  await p.waitForSelector('.chal .cb-situ');
  const situ = await p.evaluate(() => document.querySelector('.chal .cb-situ').textContent.replace(/\s+/g, ' '));
  assert(/protect/i.test(situ) && /on Mio/i.test(situ) && /strike|waiting|sweep/i.test(situ), 'situation on the task slip: ' + situ);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
