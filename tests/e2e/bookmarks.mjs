// Sentence bookmarks and Creatures met (addendum §20, §23.6), against the built
// index.html in Chromium, with real mouse, keyboard and touch input:
// - the dialogue's Keep tab sits in the sheet's tab row, never over the text,
//   the controls or Next; Next is exactly where it would be without it; a
//   press on Keep never advances the line; K keeps from the keyboard; taps work;
// - Keep on dialogue-history lines (a chosen reply with the companion's name);
// - Words › Kept sentences: your own title and note (unsafe markup and control
//   characters stay plain text), keyboard use, optional practice that records
//   nothing, a noted word listing only kept sentences (never unseen lines),
//   Remove; nothing about learning changes;
// - save, reload and load: kept sentences keep the names and the branch
//   wording they were shown with after the names and companion change; a
//   changed or removed source becomes a marked saved excerpt;
// - Creatures met: nothing is registered by definitions; a creature is
//   registered when met, per placement (out of doors and indoors); what it
//   was seen doing, only after it happens; nothing of a later phase or a plea
//   before it is reached (a real boss battle); a settled observation; its own
//   art with a text alternative; no counts;
// - 320×640 and 390×844 at 200 % text: nothing wider than the screen, no
//   control under 44 px, nothing clipped.
// Captures: tests/e2e/out/words/. Usage: node tests/e2e/bookmarks.mjs [filter]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const only = process.argv[2];
const OUT = path.join(root, 'tests', 'e2e', 'out', 'words');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 300s')), 300000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 900)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const DESK = { viewport: { width: 1280, height: 800 } };
const PHONE = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
const shot = (p, name) => p.screenshot({ path: path.join(OUT, name + '.png') });

// The test's own scene (registered like content, again after a reload): a
// narration with the player's name, a line that differs by companion, a line
// with the name, a line with no Japanese, a reply with the companion's name.
const SCENE = [
  '@scene wt.keep',
  '!speakerless',
  'narr: $name は 、 {古|ふる}い {看板|かんばん} を {見|み}た 。 || $name looks at the old sign.',
  '?(comp=nao) comp: {届|とど}かなかった {約束|やくそく} か 。 || A promise that never arrived, then.',
  '?(comp=mio) comp: {約束|やくそく} は 、 {待|ま}つ {人|ひと} の {方|ほう} が {重|おも}い です 。 || A promise weighs more on the one who waits.',
  'comp: $name 、 {行|い}こう 。 || $name, let\'s go.',
  'narr: || The wind moves the shutters.',
  '!choice',
  '* $comp と {一緒|いっしょ} に {行|い}く || Go on with $comp -> go',
  '* {少|すこ}し {待|ま}つ || Wait a little -> go',
  ':go',
  'narr: {風|かぜ} が {止|や}んだ 。 || The wind drops.',
].join('\n');
const addScene = (p, src) => p.evaluate((src) => { delete RB.content.scenes['wt.keep']; RB.script.add(src, 'wt'); }, src || SCENE);
async function startScene(p, o) {
  o = o || {};
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.hall', 5, 6, { comp: o.comp || 'nao' });
    s.player.name = o.name || 'Aki'; s.player.nameJp = o.nameJp || 'アキ';
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.input = 'choice';
    if (o.text) RB.game.settings.textScale = o.text;
    RB.game.applySettings();
    window.__done = false;
  }, o);
  await addScene(p);
  await p.evaluate(() => { RB.script.run('wt.keep').then(() => { window.__done = true; }); });
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 10000 });
  await wait(p, 250);
}
const lineNow = (p) => p.evaluate(() => (document.querySelector('.dlg .main') || {}).textContent || '');
const R = (p, sel) => p.evaluate((q) => { const e = document.querySelector(q); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
const meet = (a, c) => a && c && a.l < c.r - 0.5 && c.l < a.r - 0.5 && a.t < c.b - 0.5 && c.t < a.b - 0.5;
const topAt = (p, x, y, sel) => p.evaluate(([x, y, q]) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest(q)); }, [x, y, sel]);
async function press(p, sel, touch) {
  // a real press on the first point of the element that is on screen and not covered
  let pt = null;
  for (let k = 0; k < 10 && (!pt || pt.miss); k++) {
    if (k) await wait(p, 100);
    pt = await p.evaluate((q) => {
      const el = document.querySelector(q);
      if (!el || !el.getClientRects().length) return { miss: 'absent' };
      if (!el.closest('.dlg')) el.scrollIntoView({ block: 'nearest' });
      const r = el.getBoundingClientRect();
      for (const x of [r.left + r.width / 2, r.left + Math.min(r.width / 2, 40), r.right - Math.min(r.width / 2, 40)]) {
        for (let y = Math.max(r.top, 0) + Math.min(6, r.height / 2); y < Math.min(r.bottom, innerHeight); y += 6) { const top = document.elementFromPoint(x, y); if (top && top.closest(q)) return { x, y }; }
      }
      const at = document.elementFromPoint(r.left + r.width / 2, Math.max(2, Math.min(innerHeight - 2, r.top + 8)));
      return { miss: 'covered', at: at && at.outerHTML.slice(0, 120) };
    }, sel);
  }
  assert(pt && !pt.miss, sel + ' cannot be pressed: ' + JSON.stringify(pt));
  if (touch) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y);
}
async function waitLine(p, prev) {
  for (let i = 0; i < 60; i++) { const t = await lineNow(p); if (t !== prev) return t; await wait(p, 50); }
  return lineNow(p);
}
// Captures the step a challenge runs, and marks its right option (for answering with a real click).
async function helpers(p) {
  await p.evaluate(() => {
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    window.G = {
      right() {
        const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
        const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
        const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
        const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
        const el = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
        el.setAttribute('data-right', '1');
        el.scrollIntoView({ block: 'center' });
        return true;
      },
    };
  });
}
async function answerRight(p) {
  await p.waitForSelector('.chal .mc .btn, .chal[data-kind=order]', { timeout: 10000 });
  if (await p.$('.chal .mc .btn')) {
    await p.evaluate(() => G.right());
    await wait(p, 60);
    await press(p, '.chal .mc .btn[data-right="1"]');
  } else await press(p, '.chal [data-a=reveal]'); // an ordering step: shown the answer (assisted), then continue
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
  await press(p, '.fbwrap .fb-go');
}
// every visible control on the folio page at least 44 px; nothing wider than the screen; text not cut off
async function audit(p, scope) {
  return p.evaluate((scope) => {
    const root = document.querySelector(scope) || document;
    const small = [...root.querySelectorAll('button, input, textarea, [role=button]')].filter((e) => e.offsetParent && !e.closest('.sr')).filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((e) => (e.className || e.tagName) + ':' + e.textContent.trim().slice(0, 24));
    const wide = document.documentElement.scrollWidth > innerWidth + 1;
    const leaves = [...document.querySelectorAll('.folio .leaf')].filter((l) => l.offsetParent && l.scrollWidth > l.clientWidth + 1).map((l) => l.scrollWidth + '>' + l.clientWidth);
    // text that is cut: an element whose content is wider than its box while it hides overflow
    const cut = [...root.querySelectorAll('.bm-row *, .cm-row *, .bm-detail *, .cm-detail *, .bm-chip, .bm-meta dd')].filter((e) => e.offsetParent && !e.closest('.sr') && e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.className + ':' + e.textContent.slice(0, 20));
    return { small, wide, leaves, cut };
  }, scope);
}

// =====================================================================================================
await test('the Keep tab: in the tab row, clear of the text and Next; Next does not move; a press on it never advances; K; history; reply context', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await startScene(p);
  const l0 = await lineNow(p);
  assert(/Aki looks at the old sign|アキ/.test(l0), 'the first line is on screen: ' + l0);
  // geometry
  const g = await p.evaluate(() => {
    const q = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    return { tab: q('.dlg-keep'), next: q('.dlg .b-next'), txt: q('.dlg .txt'), sheet: q('.dlg-sheet'), ctrl: q('.dlg .ctrl'), top: document.querySelector('.dlg').classList.contains('top'), label: document.querySelector('.dlg-keep').textContent.trim() };
  });
  assert(g.label === 'Keep', 'the tab says Keep: ' + g.label);
  assert(g.tab.b <= g.sheet.t + 1.5 && g.tab.b >= g.sheet.t - 2, 'the tab stands on the sheet\'s top edge ' + JSON.stringify([g.tab, g.sheet.t]));
  assert(!meet(g.tab, g.txt) && !meet(g.tab, g.next) && !meet(g.tab, g.ctrl), 'the tab covers neither the text, the controls nor Next');
  assert(g.tab.w >= 44 && g.tab.h >= 44, 'the tab is a 44 px target ' + g.tab.w + 'x' + g.tab.h);
  assert(await topAt(p, g.tab.x, g.tab.y, '.dlg-keep') && await topAt(p, g.next.x, g.next.y, '.dlg .b-next'), 'nothing lies over the tab or over Next');
  // Next is exactly where it would be without the tab
  const without = await p.evaluate(() => { const t = document.querySelector('.dlg-keep'); t.style.display = 'none'; const r = document.querySelector('.dlg .b-next').getBoundingClientRect(); t.style.display = ''; return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  assert(Math.abs(without.l - g.next.l) < 0.5 && Math.abs(without.t - g.next.t) < 0.5 && Math.abs(without.w - g.next.w) < 0.5, 'Next does not move for the tab ' + JSON.stringify([without, g.next]));
  await shot(p, 'dlg_keep_1280');
  const learn0 = await p.evaluate(() => JSON.stringify(RB.game.s.learn));
  // a press on Keep keeps the line and does not advance it
  await press(p, '.dlg-keep');
  await wait(p, 400);
  const k1 = await p.evaluate(() => ({ n: RB.game.s.bookmarks.length, pressed: document.querySelector('.dlg-keep').getAttribute('aria-pressed'), label: document.querySelector('.dlg-keep').textContent.trim(), open: RB.ui.dialogue.isOpen() }));
  assert(k1.n === 1 && k1.pressed === 'true' && k1.label === 'Kept' && k1.open, 'kept, shown as Kept ' + JSON.stringify(k1));
  assert(await lineNow(p) === l0, 'the press on Keep did not advance the line');
  await shot(p, 'dlg_kept_1280');
  // Next still advances with one press
  await press(p, '.dlg .b-next');
  const l1 = await waitLine(p, l0);
  assert(/A promise that never arrived|届かなかった/.test(l1), 'Next advanced to the companion\'s line: ' + l1);
  // K keeps from the keyboard; K again (no words of yours yet) un-keeps it; K again keeps it
  await p.keyboard.press('KeyK'); await wait(p, 150);
  const a = await p.evaluate(() => RB.game.s.bookmarks.length);
  await p.keyboard.press('KeyK'); await wait(p, 150);
  const bb = await p.evaluate(() => RB.game.s.bookmarks.length);
  await p.keyboard.press('KeyK'); await wait(p, 150);
  const c = await p.evaluate(() => RB.game.s.bookmarks.length);
  assert(a === 2 && bb === 1 && c === 2, 'K keeps, un-keeps and keeps again ' + [a, bb, c]);
  assert(await lineNow(p) === l1, 'K did not advance the line');
  // a line with no Japanese: no tab, and Next in the same place
  await press(p, '.dlg .b-next'); const l2 = await waitLine(p, l1);
  await press(p, '.dlg .b-next'); await waitLine(p, l2);
  const nj = await p.evaluate(() => { const t = document.querySelector('.dlg-keep'); const r = document.querySelector('.dlg .b-next').getBoundingClientRect(); return { hidden: !t.offsetParent, top: document.querySelector('.dlg').classList.contains('top'), l: r.left, t: r.top, line: document.querySelector('.dlg .main').textContent }; });
  assert(/shutters/.test(nj.line) && nj.hidden, 'a line without Japanese has no Keep tab ' + JSON.stringify(nj));
  if (nj.top === g.top) assert(Math.abs(nj.l - g.next.l) < 0.5 && Math.abs(nj.t - g.next.t) < 0.5, 'Next is in the same place with and without the tab ' + JSON.stringify([nj, g.next]));
  // the reply: chosen with a click; its history entry carries the companion's name then
  await press(p, '.dlg .b-next');
  await p.waitForSelector('.choices .choice', { timeout: 5000 });
  await wait(p, 200);
  await press(p, '.choices .choice');
  await p.waitForFunction(() => (document.querySelector('.dlg .main') || {}).textContent.includes('wind drops') || /風/.test((document.querySelector('.dlg .main') || {}).textContent), null, { timeout: 5000 });
  const reply = await p.evaluate(() => { const e = RB.game.s.backlog.find((x) => x.choice && x.en === 'Go on with $comp'); return e && e.k; });
  assert(reply && reply.v && reply.v.comp === 'ナオ' && reply.e === 'Go on with Nao' && reply.src && reply.src.id === 'wt.keep', 'the reply\'s context: ' + JSON.stringify(reply));
  await press(p, '.dlg .b-next');
  await p.waitForFunction(() => window.__done === true, null, { timeout: 5000 });
  // Journey › Dialogue history: Keep the reply (a real 44 px button); again un-keeps it; again keeps it
  await p.evaluate(() => RB.ui.menu.open('log'));
  await p.waitForSelector('.history .hkeep');
  const hk = await p.evaluate(() => {
    const li = [...document.querySelectorAll('.history .entry')].find((x) => /Go on with Nao/.test(x.textContent));
    const bt = li && li.querySelector('.hkeep');
    const r = bt && bt.getBoundingClientRect();
    return bt ? { i: bt.getAttribute('data-hkeep'), w: r.width, h: r.height, pressed: bt.getAttribute('aria-pressed'), kept: [...document.querySelectorAll('.history .hkeep.kept')].length, n: document.querySelectorAll('.history .hkeep').length } : null;
  });
  assert(hk && hk.w >= 44 && hk.h >= 44 && hk.pressed === 'false' && hk.kept === 2, 'history lines have Keep buttons; the two kept lines read Kept ' + JSON.stringify(hk));
  const sel = '.history .hkeep[data-hkeep="' + hk.i + '"]';
  await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
  await press(p, sel); await wait(p, 150);
  const h1 = await p.evaluate((s) => ({ pressed: document.querySelector(s).getAttribute('aria-pressed'), n: RB.game.s.bookmarks.length, b: RB.game.s.bookmarks.find((x) => x.choice) }), sel);
  assert(h1.pressed === 'true' && h1.n === 3 && h1.b && h1.b.en === 'Go on with Nao' && h1.b.v.comp === 'ナオ' && h1.b.who === 'pc' && h1.b.wn.en === 'Aki', 'the reply kept from the history with its names then ' + JSON.stringify(h1.b));
  await shot(p, 'history_keep_1280');
  // keyboard in the history: focus the button, Enter un-keeps, Enter keeps
  await p.evaluate((s) => document.querySelector(s).focus(), sel);
  await p.keyboard.press('Enter'); await wait(p, 120);
  const h2 = await p.evaluate(() => RB.game.s.bookmarks.length);
  await p.keyboard.press('Enter'); await wait(p, 120);
  const h3 = await p.evaluate(() => RB.game.s.bookmarks.length);
  assert(h2 === 2 && h3 === 3, 'Enter on a history Keep toggles it ' + [h2, h3]);
  assert(await p.evaluate((l) => JSON.stringify(RB.game.s.learn) === l, learn0), 'keeping changed nothing about learning');
  assert(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
await test('Kept sentences: your own words stay plain text; keyboard; practice records nothing; a noted word lists only kept sentences; save, reload: names and branch as shown; a changed source is a saved excerpt', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await startScene(p);
  // keep the narration and Nao's line with the tab; the reply from history
  await press(p, '.dlg-keep'); await wait(p, 150);
  const l0 = await lineNow(p);
  await press(p, '.dlg .b-next'); const l1 = await waitLine(p, l0);
  await press(p, '.dlg-keep'); await wait(p, 150);
  for (let i = 0; i < 3; i++) { const t = await lineNow(p); await press(p, '.dlg .b-next'); await waitLine(p, t); }
  await p.waitForSelector('.choices .choice'); await wait(p, 200);
  await press(p, '.choices .choice');
  await wait(p, 300);
  await p.evaluate(async () => { for (let i = 0; i < 20 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 60)); } });
  await p.waitForFunction(() => window.__done === true, null, { timeout: 5000 });
  await p.evaluate(() => { const s = RB.game.s; RB.bookmarks.keep(s, s.backlog.find((x) => x.choice)); });
  const learn0 = await p.evaluate(() => JSON.stringify(RB.game.s.learn));
  // the page, by keyboard: open a row with Enter
  await p.evaluate(() => RB.ui.menu.open('bookmarks'));
  await p.waitForSelector('.bm-row');
  const rows = await p.evaluate(() => [...document.querySelectorAll('.bm-row')].map((r) => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)));
  assert(rows.length === 3, 'three kept sentences listed ' + JSON.stringify(rows));
  const narrId = await p.evaluate(() => RB.game.s.bookmarks.find((x) => x.who === 'narr').id);
  await p.evaluate((id) => document.querySelector('[data-bm-open="' + id + '"]').focus(), narrId);
  await p.keyboard.press('Enter'); await wait(p, 200);
  const op = await p.evaluate((id) => ({ exp: document.querySelector('[data-bm-open="' + id + '"]').getAttribute('aria-expanded'), focus: document.activeElement && document.activeElement.getAttribute('data-bm-open') }), narrId);
  assert(op.exp === 'true' && op.focus === narrId, 'Enter opens a kept sentence and the keyboard stays on it ' + JSON.stringify(op));
  // your title: unsafe markup and control characters, typed and saved with Enter
  const nasty = '<img src=x onerror="window.__xss=1"> & "quotes"';
  await p.focus('#bmt-' + narrId);
  await p.keyboard.type(nasty);
  await p.evaluate((id) => { const i = document.querySelector('#bmt-' + id); i.value = i.value + String.fromCharCode(7) + String.fromCharCode(0x202e) + ' end'; }, narrId);
  await p.keyboard.press('Enter'); await wait(p, 200);
  const t1 = await p.evaluate((id) => ({ title: RB.game.s.bookmarks.find((x) => x.id === id).title, focus: document.activeElement && document.activeElement.id, imgs: document.querySelectorAll('.folio .bm-list img').length, xss: window.__xss || 0, shown: (document.querySelector('[data-bm-open="' + id + '"] .bm-title .utext') || {}).textContent }), narrId);
  assert(t1.title === nasty + ' end' && t1.shown === t1.title && t1.imgs === 0 && !t1.xss, 'the title is kept and shown as plain text ' + JSON.stringify(t1));
  assert(t1.focus === 'bmt-' + narrId, 'the keyboard is back in the title field after saving');
  // a note, several lines, saved with its button
  await p.focus('#bmn-' + narrId);
  await p.keyboard.type('The sign at the hall.');
  await p.keyboard.press('Enter');
  await p.keyboard.type('Read it again later.');
  await p.evaluate((id) => document.querySelector('form[data-bm-form="note"][data-id="' + id + '"] [data-bm-save]').click(), narrId);
  await wait(p, 200);
  const n1 = await p.evaluate((id) => RB.game.s.bookmarks.find((x) => x.id === id).note, narrId);
  assert(n1 === 'The sign at the hall.\nRead it again later.', 'the note keeps its lines: ' + JSON.stringify(n1));
  await shot(p, 'bm_page_1280');
  // a noted word: only the kept sentence that uses it (many lines in the game use it)
  const counts = await p.evaluate(() => {
    const s = RB.game.s;
    s.notebook.push({ kind: 'word', id: 'w:約束|やくそく', surface: '約束', reading: 'やくそく', m: 'promise', t: Date.now() });
    return Object.values(RB.content.scenes).reduce((n, x) => n + x.cmds.filter((c) => c.op === 'say' && c.jp && c.jp.includes('{約束|やくそく}')).length, 0);
  });
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('bookmarks'); });
  await p.waitForSelector('[data-bm-word="w:約束|やくそく"]');
  await press(p, '[data-bm-word="w:約束|やくそく"]'); await wait(p, 200);
  const nw = await p.evaluate(() => ({ rows: [...document.querySelectorAll('.bm-row')].map((r) => r.querySelector('.bm-en').textContent), pressed: document.querySelector('[data-bm-word="w:約束|やくそく"]').getAttribute('aria-pressed') }));
  assert(counts > 5 && nw.pressed === 'true' && nw.rows.length === 1 && nw.rows[0] === 'A promise that never arrived, then.', 'the noted word lists only the kept sentence that uses it (' + counts + ' lines in the game use it) ' + JSON.stringify(nw));
  await shot(p, 'bm_word_1280');
  // optional practice of its words: the recognition template; nothing is recorded
  const naoId = await p.evaluate(() => RB.game.s.bookmarks.find((x) => x.who === 'nao').id);
  await press(p, '[data-bm-open="' + naoId + '"]'); await wait(p, 200);
  await p.evaluate((id) => document.querySelector('[data-bm-practice="' + id + '"]').scrollIntoView({ block: 'center' }), naoId);
  await press(p, '[data-bm-practice="' + naoId + '"]');
  await p.waitForSelector('.chal', { timeout: 5000 });
  const ch = await p.evaluate(() => ({ head: (document.querySelector('.chal-situ') || {}).textContent, kind: document.querySelector('.chal').dataset.kind, item: window.__step && window.__step.item, title: document.querySelector('.chal-title').textContent }));
  assert(/From your kept sentence/.test(ch.head) && ch.kind === 'choose' && !ch.item, 'practice shows the kept sentence and a recognition step with no learning item ' + JSON.stringify(ch));
  await shot(p, 'bm_practice_1280');
  for (let i = 0; i < 3; i++) {
    await answerRight(p);
    await wait(p, 300);
    if (await p.evaluate(() => RB.ui.menu.isOpen())) break;
  }
  await p.waitForFunction(() => RB.ui.menu.isOpen() && RB.ui.menu.current().words === 'bookmarks', null, { timeout: 5000 });
  assert(await p.evaluate((l) => JSON.stringify(RB.game.s.learn) === l, learn0), 'keeping, titling, noting and practising changed nothing in the learning record');
  // save; then the names and the companion change (as later state), save again and reload
  await p.evaluate(async () => { const s = RB.game.s; s.player.name = 'Beni'; s.player.nameJp = 'ベニ'; s.comp = 'mio'; RB.ui.menu.close(); await RB.save.writeSlot(1, s, { force: true }); });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await helpers(p);
  await addScene(p);
  await p.evaluate(async () => { await RB.game.loadCampaign(1); });
  await p.waitForFunction(() => RB.game.s && RB.game.mode() === 'world', null, { timeout: 10000 });
  await p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); } });
  await p.evaluate(() => RB.ui.menu.open('bookmarks'));
  await p.waitForSelector('.bm-row');
  const after = await p.evaluate(() => {
    const s = RB.game.s;
    const txt = document.querySelector('#folio-page').textContent;
    const bare = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); }; // the text without its readings
    return { name: s.player.name, comp: s.comp, n: s.bookmarks.length, rows: [...document.querySelectorAll('.bm-row')].map((r) => ({ jp: bare(r.querySelector('.bm-jp')), en: r.querySelector('.bm-en').textContent, kind: r.querySelector('.kind').textContent.replace(/\s+/g, ' ') })), beni: /Beni|ベニ/.test(txt), excerpts: document.querySelectorAll('.bm-excerpt').length };
  });
  const narr = after.rows.find((r) => /old sign/.test(r.en)), nao = after.rows.find((r) => /never arrived/.test(r.en)), rep = after.rows.find((r) => /Go on with/.test(r.en));
  assert(after.name === 'Beni' && after.comp === 'mio' && after.n === 3, 'reloaded a campaign whose names and companion have since changed ' + JSON.stringify(after));
  assert(narr && narr.en === 'Aki looks at the old sign.' && /アキ/.test(narr.jp) && !after.beni, 'the kept narration still reads with Aki / アキ ' + JSON.stringify(narr));
  assert(nao && /届かなかった/.test(nao.jp) && /Nao/.test(nao.kind), 'the kept branch line is Nao\'s, said by Nao, though Mio travels now ' + JSON.stringify(nao));
  assert(rep && rep.en === 'Go on with Nao' && /ナオ/.test(rep.jp), 'the kept reply still names Nao ' + JSON.stringify(rep));
  assert(after.excerpts === 0, 'sources unchanged: no excerpt marks');
  const kept = await p.evaluate((id) => { const b = RB.game.s.bookmarks.find((x) => x.id === id); return { title: b.title, note: b.note }; }, narrId);
  assert(kept.title === nasty + ' end' && kept.note === 'The sign at the hall.\nRead it again later.', 'title and note survive the reload');
  await shot(p, 'bm_reloaded_1280');
  // the source changes: Nao's line is rewritten; then the scene is gone
  await addScene(p, SCENE.replace('{届|とど}かなかった {約束|やくそく} か 。', '{届|とど}いた {約束|やくそく} だ 。'));
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('bookmarks'); });
  await p.waitForSelector('.bm-row');
  await press(p, '[data-bm-open="' + naoId + '"]'); await wait(p, 200);
  const ex = await p.evaluate((id) => ({ marks: document.querySelectorAll('.bm-excerpt').length, row: (() => { const c = document.querySelector('[data-bm-open="' + id + '"] .bm-jp').cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); })(), slip: (document.querySelector('.bm-excerpt') || {}).textContent }), naoId);
  assert(ex.marks === 1 && /届かなかった/.test(ex.row) && /Saved excerpt/.test(ex.slip), 'a changed source: marked a saved excerpt, the text as kept ' + JSON.stringify(ex));
  await shot(p, 'bm_excerpt_1280');
  await p.evaluate(() => { delete RB.content.scenes['wt.keep']; RB.ui.menu.close(); RB.ui.menu.open('bookmarks'); });
  await p.waitForSelector('.bm-row');
  await press(p, '[data-bm-open="' + narrId + '"]'); await wait(p, 200);
  const gone = await p.evaluate(() => (document.querySelector('.bm-excerpt') || {}).textContent || '');
  assert(/no longer in the game/.test(gone), 'a removed source: a saved excerpt ' + gone);
  // Remove (with the confirmation), by keyboard
  await p.evaluate((id) => document.querySelector('[data-bm-remove="' + id + '"]').focus(), narrId);
  await p.keyboard.press('Enter');
  await p.waitForSelector('[role=alertdialog] .foot button');
  await p.keyboard.press('Escape'); await wait(p, 150);
  const still = await p.evaluate(() => RB.game.s.bookmarks.length);
  await p.evaluate((id) => document.querySelector('[data-bm-remove="' + id + '"]').focus(), narrId);
  await p.keyboard.press('Enter');
  await p.waitForSelector('[role=alertdialog] .foot button');
  await p.click('[role=alertdialog] .foot button >> nth=0'); await wait(p, 200);
  const left = await p.evaluate(() => ({ n: RB.game.s.bookmarks.length, rows: document.querySelectorAll('.bm-row').length }));
  assert(still === 3 && left.n === 2 && left.rows === 2, 'Escape keeps it; Remove removes it ' + JSON.stringify([still, left]));
  assert(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
await test('readable inscriptions: a signpost (a scene) and a miller\'s notice (a line on the prop) are kept with what they were written on; a link opens the entry', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  // facing the village signpost, read it with the action key
  await p.evaluate(() => { const s = RB.game.debugStart('rw.village', 23, 22, { dir: 'up' }); s.learn.profile = 'E'; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); });
  await wait(p, 300);
  await p.keyboard.press('KeyZ');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
  await wait(p, 200);
  await press(p, '.dlg-keep'); await wait(p, 150);
  const a = await p.evaluate(() => RB.game.s.bookmarks[0]);
  assert(a && a.who === 'narr' && a.obj === 'sign' && a.src.k === 'sc' && a.src.id === 'rw.sign_square' && a.src.x === 23 && a.src.y === 21 && a.map === 'rw.village', 'the signpost\'s line, kept with the sign it was read on ' + JSON.stringify(a));
  await p.evaluate(async () => { for (let i = 0; i < 20 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 60)); } });
  // in the mill, the notice pinned by the miller (its line belongs to the prop itself)
  await p.evaluate(() => { RB.world.enter('rw.mill1', 9, 10, 'up'); });
  await wait(p, 400);
  await p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); } RB.world.W.player.dir = 'up'; });
  await p.keyboard.press('KeyZ');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() && /flour|粉/.test(document.querySelector('.dlg .main').textContent), null, { timeout: 5000 });
  await p.keyboard.press('KeyK'); await wait(p, 150);
  const m = await p.evaluate(() => RB.game.s.bookmarks.find((x) => x.map === 'rw.mill1'));
  assert(m && m.obj === 'sign' && m.src.k === 'pr' && m.src.m === 'rw.mill1' && m.src.x === 9 && m.src.y === 9, 'the notice\'s line, kept with the prop as its source ' + JSON.stringify(m));
  await p.evaluate(async () => { for (let i = 0; i < 20 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 60)); } });
  // 46 more kept lines, newer than the notice
  await p.evaluate(() => { const s = RB.game.s; for (let i = 0; i < 46; i++) RB.bookmarks.keep(s, { who: 'narr', jp: '{風|かぜ} ' + i + ' 。', en: 'Wind ' + i + '.', k: { m: 'rw.mill1', src: { k: 'ln' } } }); });
  // a link (as an evidence or memory page would make) opens that entry, even when it is past the first forty
  await p.evaluate((id) => RB.ui.wordsPages.show('bookmarks', id), m.id);
  await p.waitForSelector('.bm-detail');
  const d = await p.evaluate((id) => ({ open: document.querySelector('[data-bm-open="' + id + '"]').getAttribute('aria-expanded'), meta: document.querySelector('.bm-meta').textContent.replace(/\s+/g, ' '), status: [RB.bookmarks.status(RB.game.s.bookmarks[0]), RB.bookmarks.status(RB.game.s.bookmarks[1])], ex: document.querySelectorAll('.bm-excerpt').length }), m.id);
  assert(d.open === 'true' && /Read on/.test(d.meta) && /Sign/.test(d.meta) && /The Old Mill/.test(d.meta) && d.status.join() === 'ok,ok' && !d.ex, 'the page says what it was read on and where; both sources are intact ' + JSON.stringify(d));
  await shot(p, 'bm_sign_1280');
  // a long list shows 40 at a time; "Show older ones" (by keyboard) brings the next ones and the keyboard to the first of them
  await p.evaluate(() => { const s = RB.game.s; RB.ui.wordsPages.show('bookmarks', s.bookmarks[s.bookmarks.length - 1].id); });
  await p.waitForSelector('[data-bm-more]');
  const pg1 = await p.evaluate(() => ({ rows: document.querySelectorAll('.bm-row').length, more: document.querySelector('[data-bm-more]').textContent.trim() }));
  await p.evaluate(() => document.querySelector('[data-bm-more]').focus());
  await p.keyboard.press('Enter'); await wait(p, 200);
  const pg2 = await p.evaluate(() => ({ rows: document.querySelectorAll('.bm-row').length, more: !!document.querySelector('[data-bm-more]'), focus: document.activeElement && document.activeElement.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), idx: [...document.querySelectorAll('.bm-row')].indexOf(document.activeElement) }));
  assert(pg1.rows === 40 && /8 more of 8/.test(pg1.more) && pg2.rows === 48 && !pg2.more && pg2.idx === 40, 'forty at a time, then the rest, with the keyboard on the first new one ' + JSON.stringify([pg1, pg2]));
  assert(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
// Battle helpers: a real encounter with choices and real clicks.
const MOVES = ['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'];
async function battle(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.s;
    s.words = (o.words || []).slice();
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1, group: 1 }, ...o.moves.map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    RB.game.settings.input = 'choice'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
    RB.battleSeq.setTimeScale(4);
    window.__result = null;
    const place = o.foe ? RB.content.maps[o.map].foes.find((f) => f.id === o.foe) : null;
    const opts = place ? { place, where: { map: o.map, x: place.x, y: place.y }, foeKey: 'foe:' + o.map + ':' + place.id } : { noFlee: !!o.noFlee };
    RB.game.startBattle(place ? place.enemy : o.enemy, opts).then((r) => { window.__result = r || 'done'; });
  }, Object.assign({ moves: MOVES }, o));
}
async function cards(p) {
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), teach: [...document.querySelectorAll('[data-ok]')].some((x) => x.offsetParent), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (s.cards || s.r) return s;
    if (s.teach) await p.evaluate(() => { const b = [...document.querySelectorAll('[data-ok]')].find((x) => x.offsetParent); if (b) b.click(); });
    else if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  throw new Error('no response cards came: ' + JSON.stringify(await p.evaluate(() => ({ phase: RB.combat.phase(), mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), chal: !!document.querySelector('.chal'), busy: RB.battleSeq.busy(), r: window.__result, coach: !!document.querySelector('[data-coach-ok]'), top: RB.ui.topLayer() && RB.ui.topLayer().name }))));
}
// a response card by its English name (exactly), e.g. 'Unravel', 'protect', 'See through'
async function respond(p, name) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && (x.querySelector('.rc-en') || {}).textContent.trim().toLowerCase() === m.toLowerCase()); return c ? c.getAttribute('data-i') : null; }, name);
  assert(i != null, 'no response card named ' + name + ': ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 30)))));
  await p.evaluate((i) => document.querySelector('.rcard[data-i="' + i + '"]').scrollIntoView({ block: 'center' }), i);
  await press(p, '.rcard[data-i="' + i + '"]');
  await answerRight(p);
  await companionTurn(p); // with a companion, their turn comes next (the first action)
}
// Step back from an encounter: a real press, on phones at 200 % text too (the recap gives way to it;
// tests/e2e/combat_small.mjs checks that layout).
async function flee(p, o) {
  await p.waitForFunction(() => !RB.battleSeq.busy() && document.querySelector('[data-flee]'), null, { timeout: 15000 });
  await press(p, '[data-flee]', o && o.touch);
  await p.waitForSelector('[role=alertdialog] .foot button');
  await p.click('[role=alertdialog] .foot button >> nth=0');
  await p.waitForFunction(() => window.__result === 'flee' && RB.game.mode() === 'world', null, { timeout: 15000 });
}
const notes = (p, id) => p.evaluate((id) => { const c = RB.game.s.creatures[id]; return c ? Object.keys(c.notes).sort() : null; }, id);
const intentNow = (p) => p.evaluate(() => { const st = RB.combat.state(); return st && { kind: st.intent.kind, knots: st.knots, target: st.intent.target }; });
const pageText = (p, id) => p.evaluate((id) => { const d = document.createElement('div'); d.innerHTML = RB.ui.wordsPages.crHtml(RB.game.s, { view: { crOpen: id }, s: RB.game.s }); return d.textContent.replace(/\s+/g, ' '); }, id);

await test('Creatures met: registered only when met, per placement; observations only as they happen; nothing of a later phase or plea before it; a settled observation; art with a text alternative; no counts', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await p.evaluate(() => { const s = RB.game.debugStart('rw.millroad', 10, 22, {}); s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); });
  const n0 = await p.evaluate(() => ({ met: Object.keys(RB.game.s.creatures).length, defined: Object.keys(RB.content.enemies).length, foes: RB.world.W.foes.length }));
  assert(n0.met === 0 && n0.defined > 40 && n0.foes > 0, 'foes on the map and ' + n0.defined + ' definitions loaded, none registered ' + JSON.stringify(n0));
  await p.evaluate(() => RB.ui.menu.open('creatures'));
  await p.waitForSelector('#folio-page');
  const empty = await p.evaluate(() => document.querySelector('#folio-page').textContent);
  assert(/No creatures yet/.test(empty), 'the page says none yet');
  await p.evaluate(() => RB.ui.menu.close());
  // the Reedling out of doors on the Mill Road (its usual placement), then indoors in the Wheel Pit (its own lines)
  await battle(p, { map: 'rw.millroad', foe: 'f1', words: ['mamoru'] });
  await cards(p);
  const r1 = await p.evaluate(() => { const c = RB.game.s.creatures['rw.reedling']; return { ids: Object.keys(RB.game.s.creatures), place: c && c.maps['rw.millroad'], notes: c && Object.keys(c.notes), intent: RB.combat.state().intent.kind }; });
  assert(r1.ids.length === 1 && r1.ids[0] === 'rw.reedling' && r1.place.set === 'outdoor' && /reeds/.test(r1.place.intro.en), 'met on the Mill Road: out of doors, with the line shown ' + JSON.stringify(r1));
  assert(r1.notes.length === 1 && r1.notes[0] === 'i:' + r1.intent, 'one note: the move it showed ' + JSON.stringify(r1.notes));
  await flee(p);
  await p.evaluate(() => { RB.world.enter('rw.mill0', 2, 7, 'up'); });
  await wait(p, 300);
  await battle(p, { map: 'rw.mill0', foe: 'p2', words: ['mamoru'] });
  await cards(p);
  await flee(p);
  const r2 = await p.evaluate(() => { const c = RB.game.s.creatures['rw.reedling']; return { maps: Object.keys(c.maps), set: c.maps['rw.mill0'].set, intro: c.maps['rw.mill0'].intro.en, n: Object.keys(RB.game.s.creatures).length }; });
  assert(r2.n === 1 && r2.maps.join() === 'rw.millroad,rw.mill0' && r2.set === 'indoor' && /wet stones/.test(r2.intro), 'the same species at a second placement, indoors, with that placement\'s own line ' + JSON.stringify(r2));
  // the Mill Echo (a boss with two later changes and a plea), in the mill
  await p.evaluate(() => { RB.world.enter('rw.mill1', 7, 9, 'up'); });
  await wait(p, 300);
  await battle(p, { enemy: 'rw.mill_echo', noFlee: true, words: ['mamoru', 'mizu', 'hikari'] });
  await cards(p);
  let it = await intentNow(p);
  assert(it.kind === 'strike', 'the echo opens with a Strike ' + JSON.stringify(it));
  await respond(p, 'protect');
  await cards(p);
  it = await intentNow(p);
  assert(it.kind === 'heat', 'then Heat ' + JSON.stringify(it));
  await respond(p, 'Unravel');
  await cards(p);
  await respond(p, 'water');
  await cards(p);
  const nA = await notes(p, 'rw.mill_echo');
  assert(['a:strike:mamoru', 'i:heat', 'i:strike', 's:heat', 'c:heat:mizu'].every((k) => nA.includes(k)), 'seen, blocked, overheated, cooled: ' + nA.join(' '));
  const txtA = await pageText(p, 'rw.mill_echo');
  const bad = await p.evaluate(() => { const e = RB.content.enemies['rw.mill_echo']; return e.phases.map((x) => x.line.en.slice(0, 26)); });
  const leaks = ['Mirror', 'Plea', 'Kōji', 'コウジ', 'inside out'].concat(bad).filter((w) => txtA.includes(w));
  assert(!nA.some((k) => /^(p:|i:mirror|i:plea)/.test(k)) && !leaks.length, 'before its first change: nothing of its later moves, lines or the plea\'s answer ' + JSON.stringify(leaks));
  assert(/Heat was cooled by/.test(txtA) && /blocked it/.test(txtA) && /overheated/.test(txtA), 'the notes say what happened, in the battle\'s words: ' + txtA.slice(0, 400));
  // on to the end: Unravel, see through the mirror, answer the plea
  for (let k = 0; k < 12; k++) {
    const s = await cards(p);
    if (s.r) break;
    it = await intentNow(p);
    if (it.kind === 'mirror') {
      const n = await notes(p, 'rw.mill_echo');
      const t2 = await pageText(p, 'rw.mill_echo');
      assert(n.includes('p:0') && n.includes('i:mirror') && !n.includes('p:1') && !n.includes('i:plea') && !/Plea|Kōji|コウジ/.test(t2), 'its first change is noted once begun; the second and the plea are not ' + n.join(' '));
      await respond(p, 'See through');
    } else if (it.kind === 'plea') await respond(p, 'Answer');
    else await respond(p, 'Unravel');
  }
  await p.waitForFunction(() => window.__result === 'win', null, { timeout: 30000 });
  await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 15000 });
  const fin = await p.evaluate(() => { const c = RB.game.s.creatures['rw.mill_echo']; return { notes: Object.keys(c.notes).sort(), settled: !!c.settled, settle: c.maps['rw.mill1'] && c.maps['rw.mill1'].settle, all: JSON.stringify(c) }; });
  assert(fin.settled && fin.settle && /Kōji/.test(fin.settle.en) && fin.notes.includes('a:mirror:truth') && fin.notes.includes('a:plea:answer') && fin.notes.includes('p:1'), 'settled: the line shown, seen through, answered ' + JSON.stringify(fin.notes));
  assert(!/"(count|wins|kills|defeats|times)"\s*:/.test(fin.all), 'no counts stored');
  // the page, after the win
  await p.evaluate(() => RB.ui.menu.open('creatures'));
  await p.waitForSelector('.cm-row');
  await press(p, '[data-cr-open="rw.mill_echo"]'); await wait(p, 300);
  const pg = await p.evaluate(() => {
    const cv = document.querySelector('.cm-detail canvas.cm-art');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) ink++;
    const txt = document.querySelector('#folio-page').textContent.replace(/\s+/g, ' ');
    return { ink, alt: cv.getAttribute('aria-label'), role: cv.getAttribute('role'), rows: document.querySelectorAll('.cm-row').length, txt, thumbs: [...document.querySelectorAll('.cm-row canvas')].map((c) => c.width > 8) };
  });
  assert(pg.rows === 2 && pg.ink > 200 && pg.role === 'img' && /Picture of the The Mill Echo|Picture of the Mill Echo/.test(pg.alt) && /First seen: Above the millstone/.test(pg.alt), 'its battle art is drawn, with a text alternative ' + JSON.stringify({ ink: pg.ink, alt: pg.alt }));
  assert(pg.thumbs.every(Boolean), 'each row shows the creature\'s art');
  assert(/When it settled/.test(pg.txt) && /Kōji/.test(pg.txt) && /Indoors/.test(pg.txt) && /Reading it changes nothing in a battle/.test(pg.txt), 'the page: where, indoors, the settled line, and that it changes nothing');
  assert(!/\b(defeated|times|kills?|wins?)\b/i.test(pg.txt.replace(/Reading it changes nothing in a battle\./, '')), 'no counts on the page');
  await shot(p, 'cr_page_1280');
  await press(p, '[data-cr-open="rw.mill_echo"]'); await wait(p, 200);
  await press(p, '[data-cr-open="rw.reedling"]'); await wait(p, 300);
  const rd = await p.evaluate(() => document.querySelector('.cm-detail').textContent.replace(/\s+/g, ' '));
  assert(/Out of doors/.test(rd) && /Indoors/.test(rd) && /wet stones/.test(rd) && /reeds/.test(rd), 'the Reedling: both placements, each with its own setting and line');
  await shot(p, 'cr_placements_1280');
  // keyboard: Enter on a row closes and opens it
  await p.evaluate(() => document.querySelector('[data-cr-open="rw.reedling"]').focus());
  await p.keyboard.press('Enter'); await wait(p, 150);
  const kb = await p.evaluate(() => ({ exp: document.querySelector('[data-cr-open="rw.reedling"]').getAttribute('aria-expanded'), f: document.activeElement.getAttribute('data-cr-open') }));
  assert(kb.exp === 'false' && kb.f === 'rw.reedling', 'Enter closes the row and keeps the keyboard on it ' + JSON.stringify(kb));
  assert(!errors.length, 'no page errors ' + errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
for (const [w, h] of [[390, 844], [320, 640]]) {
  await test(w + 'x' + h + ' at 200 % text, by touch: the Keep tab and Next; both pages fit, every control at least 44 px, nothing cut off', async () => {
    const { p, errors, ctx } = await page(b, url, PHONE(w, h));
    await helpers(p);
    await startScene(p, { text: 2 });
    const g = await p.evaluate(() => {
      const q = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      return { tab: q('.dlg-keep'), next: q('.dlg .b-next'), txt: q('.dlg .txt'), ctrl: q('.dlg .ctrl'), who: document.querySelector('.dlg-tab').offsetParent ? q('.dlg-tab') : null, vw: innerWidth };
    });
    assert(!meet(g.tab, g.txt) && !meet(g.tab, g.next) && !meet(g.tab, g.ctrl) && !(g.who && meet(g.tab, g.who)), 'the tab covers nothing ' + JSON.stringify(g));
    assert(g.tab.r <= g.vw && g.tab.w >= 44 && g.tab.h >= 44, 'the tab fits and is a 44 px target');
    const without = await p.evaluate(() => { const t = document.querySelector('.dlg-keep'); t.style.display = 'none'; const r = document.querySelector('.dlg .b-next').getBoundingClientRect(); t.style.display = ''; return { l: r.left, t: r.top }; });
    assert(Math.abs(without.l - g.next.l) < 0.5 && Math.abs(without.t - g.next.t) < 0.5, 'Next does not move for the tab');
    const l0 = await lineNow(p);
    await press(p, '.dlg-keep', true); await wait(p, 400);
    assert(await lineNow(p) === l0 && await p.evaluate(() => RB.game.s.bookmarks.length) === 1, 'a tap on Keep keeps without advancing');
    await shot(p, 'dlg_kept_' + w + '_200');
    // (a line longer than the sheet: Next first shows the rest — "More" — then advances)
    let l1 = l0;
    for (let k = 0; k < 5 && l1 === l0; k++) { await press(p, '.dlg .b-next', true); l1 = await waitLine(p, l0); }
    assert(l1 !== l0, 'taps on Next advance');
    // the speaker's tab and the Keep tab side by side at this width
    const g2 = await p.evaluate(() => { const a = document.querySelector('.dlg-tab').getBoundingClientRect(), k = document.querySelector('.dlg-keep').getBoundingClientRect(); return { a: [a.left, a.right, a.top, a.bottom], k: [k.left, k.right, k.top, k.bottom] }; });
    assert(g2.a[1] <= g2.k[0] + 0.5 || g2.a[3] <= g2.k[2] + 0.5, 'the speaker\'s tab and the Keep tab do not overlap ' + JSON.stringify(g2));
    await press(p, '.dlg-keep', true); await wait(p, 200);
    await p.evaluate(async () => { for (let i = 0; i < 20 && !window.__done; i++) { if (document.querySelector('.choices .choice')) document.querySelector('.choices .choice').click(); else RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 80)); } });
    // a note with a long unbroken word, then the page
    await p.evaluate(() => { const s = RB.game.s; RB.bookmarks.rename(s, s.bookmarks[0].id, 'W'.repeat(60)); RB.bookmarks.setNote(s, s.bookmarks[0].id, 'x'.repeat(280)); s.notebook.push({ kind: 'word', id: 'w:約束|やくそく', surface: '約束', reading: 'やくそく', m: 'promise', t: 1 }); });
    // (the game's own notices, "Kept. …", take presses while they show: wait until they have gone)
    await p.waitForFunction(() => !document.querySelector('.notices .notice'), null, { timeout: 10000 });
    await p.evaluate(() => RB.ui.menu.open('bookmarks'));
    await p.waitForSelector('.bm-row');
    const id0 = await p.evaluate(() => RB.game.s.bookmarks[0].id);
    await press(p, '[data-bm-open="' + id0 + '"]', true); await wait(p, 300);
    const a1 = await audit(p, '#folio-page');
    assert(!a1.small.length && !a1.wide && !a1.leaves.length && !a1.cut.length, 'Kept sentences fits ' + JSON.stringify(a1));
    await shot(p, 'bm_page_' + w + '_200');
    await p.evaluate(() => document.querySelector('.bm-user').scrollIntoView({ block: 'start' }));
    await shot(p, 'bm_user_' + w + '_200');
    // a creature met (a real encounter), then its page
    await p.evaluate(() => { RB.ui.menu.close(); RB.world.enter('rw.millroad', 10, 22, 'up'); });
    await wait(p, 300);
    await battle(p, { map: 'rw.millroad', foe: 'f3', words: ['mamoru', 'hikari'] });
    await cards(p);
    await flee(p, { touch: true });
    await p.evaluate(() => RB.ui.menu.open('creatures'));
    await p.waitForSelector('.cm-row');
    await press(p, '[data-cr-open="rw.dustmoth"]', true); await wait(p, 300);
    const a2 = await audit(p, '#folio-page');
    assert(!a2.small.length && !a2.wide && !a2.leaves.length && !a2.cut.length, 'Creatures met fits ' + JSON.stringify(a2));
    const cr = await p.evaluate(() => { const c = RB.game.s.creatures['rw.dustmoth']; return { set: c.maps['rw.millroad'].set, intro: c.maps['rw.millroad'].intro.en, txt: document.querySelector('.cm-detail').textContent.replace(/\s+/g, ' ') }; });
    assert(cr.set === 'outdoor' && /drifts out of the mill/.test(cr.intro) && /Out of doors/.test(cr.txt), 'the moth met out of doors, with that placement\'s line ' + JSON.stringify(cr));
    await shot(p, 'cr_page_' + w + '_200');
    assert(!errors.length, 'no page errors ' + errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------------------------------
// curated captures for the docs (WebP, half size)
if (!only) {
  const docs = path.join(root, 'docs', 'screenshots', 'words');
  fs.mkdirSync(docs, { recursive: true });
  const { p, ctx } = await page(b, url, DESK);
  for (const f of ['dlg_kept_1280', 'bm_page_1280', 'bm_excerpt_1280', 'cr_page_1280', 'cr_placements_1280', 'dlg_kept_390_200', 'bm_page_320_200', 'cr_page_320_200', 'history_keep_1280', 'bm_practice_1280', 'bm_sign_1280']) {
    const src = path.join(OUT, f + '.png');
    if (!fs.existsSync(src)) continue;
    const webp = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const k = img.width > 1000 ? 0.5 : img.width > 500 ? 0.5 : 1;
      const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(img, 0, 0, cv.width, cv.height);
      return cv.toDataURL('image/webp', 0.86).split(',')[1];
    }, fs.readFileSync(src).toString('base64'));
    fs.writeFileSync(path.join(docs, f + '.webp'), Buffer.from(webp, 'base64'));
  }
  await ctx.close();
}

await b.close(); srv.close();
console.log('\n' + results.join('\n'));
console.log(fail ? fail + ' failed' : 'all ok (' + pass + ')');
process.exit(fail ? 1 : 0);
