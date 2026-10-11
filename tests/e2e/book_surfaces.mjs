// U05/U06: the book's family on every surface shown over the world and on every other folio (expansion plan
// 15_INTERFACE; playbook §15A U05, U06; F-142), against the built index.html in Chromium. Checked:
//  - the title: the masthead and the menu in the book's faces; every entry a button that still works (UI-A04, UI-A17);
//  - a confirmation: a sheet with a deckled top; the safe answer has focus first and is what Escape chooses; danger is
//    a seal and its words, not colour alone (UI-A05);
//  - word help opens from Japanese text and returns focus where it was (UI-A13);
//  - writing: the pad and its parents carry no transform and the pad is not stretched, so a stroke drawn across it is
//    recorded where it was drawn (UI-A14);
//  - typing: the answer field takes Japanese, nothing advances while typing, and with the largest text on a phone the
//    submit and the way back stay on screen (UI-A14, UI-A15);
//  - a battle keeps its identity: both people's bars, Harmony, the creature's plate, the response slips, the way back
//    (UI-A16);
//  - the census: on every surface opened here, the text is drawn in the book's embedded faces (UI-A17).
// Usage: node tests/e2e/book_surfaces.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 120s')), 120000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 700)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 375, height: 667 }, mobile: true, touch: true, dpr: 2 };
// the first face a selector's text is drawn with
const face = (p, q) => p.evaluate((q) => { const e = document.querySelector(q); return e ? getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim() : 'none: ' + q; }, q);
const fonts = (p) => p.evaluate(async () => { RB.bookType.install(); await document.fonts.ready; return true; });
async function battle(p, input, o) {
  await p.evaluate(([input, o]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'F'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = input; if (o && o.scale) RB.game.settings.textScale = o.scale;
    RB.game.applySettings();
    window.__result = null;
    RB.game.startBattle('rw.reedling', {}).then((r) => { window.__result = r; });
  }, [input, o || null]);
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i]') }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.resp[data-i]');
  await p.waitForTimeout(200);
}
async function openResponse(p) {
  // the first slip that asks something (Unravel, a word): choosing it opens the prompt
  await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled); c.click(); });
  await p.waitForSelector('.chal', { timeout: 8000 });
  await p.waitForTimeout(300);
}

await test('the title: the masthead and the menu in the book\'s faces; the menu still works', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await fonts(p);
  assert(await p.evaluate(() => document.body.classList.contains('book-ui')), 'the book is on at the title');
  const m = await face(p, '.title h1'), l = await face(p, '.tm .lbl');
  assert(m === 'RB Vollkorn' && l === 'RB Vollkorn', 'masthead ' + m + ', menu ' + l);
  assert(await p.evaluate(() => getComputedStyle(document.querySelector('.tm .lbl')).fontVariantCaps === 'small-caps'), 'the menu in small capitals');
  // Settings opens from the menu and comes back
  await p.evaluate(() => [...document.querySelectorAll('.tm')].find((x) => /Settings/.test(x.textContent)).click());
  await p.waitForSelector('.folio-settings');
  assert(await face(p, '.folio-settings .folio-head h2') === 'RB Vollkorn', 'the settings sheet\'s heading in the display face');
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !document.querySelector('.folio-settings'));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('a confirmation: a deckled sheet; the safe answer first in focus and chosen by Escape; danger sealed and named', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await fonts(p);
  await p.evaluate(() => { window.__c = undefined; RB.ui.confirm('Delete this journey? This cannot be undone.', ['Delete', 'Keep it'], { danger: true }).then((i) => { window.__c = i; }); });
  await p.waitForSelector('.csheet');
  const o = await p.evaluate(() => {
    const sh = document.querySelector('.csheet'), d = sh.querySelector('.pbtn.danger');
    return { deckle: getComputedStyle(sh, '::before').content, seal: d ? getComputedStyle(d, '::before').content : null, sealBg: d ? getComputedStyle(d, '::before').backgroundColor : null,
      words: d ? d.textContent.trim() : null, focus: document.activeElement && document.activeElement.textContent.trim(), q: getComputedStyle(sh.querySelector('.q')).fontFamily.split(',')[0].replace(/"/g, '').trim() };
  });
  assert(o.deckle && o.deckle !== 'none', 'the sheet has its deckled top: ' + o.deckle);
  assert(o.seal && o.seal !== 'none' && o.words === 'Delete', 'danger is a seal and its word: ' + JSON.stringify(o));
  assert(o.focus === 'Keep it', 'the safe answer has focus first: ' + o.focus);
  assert(o.q === 'RB Vollkorn', 'the question in the reading face: ' + o.q);
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => window.__c !== undefined);
  assert(await p.evaluate(() => window.__c) === 1, 'Escape chose the safe answer');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('word help opens from Japanese in the dialogue, in the book\'s faces, and gives focus back', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await fonts(p);
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } }); RB.ui.dialogue.say({ who: 'mio', jp: '{今日|きょう} は {川|かわ} の {水|みず} が {高|たか}い わね 。', en: 'The river is high today.' }); });
  await p.waitForSelector('.dlg .main .jt[data-i], .dlg .sub .jt[data-i], .dlg .jt[data-i]');
  // a person moving with the keyboard: a key, then focus on the word (help opens on keyboard focus)
  await p.keyboard.press('Shift');
  await p.focus('.dlg .jt[data-i]');
  await p.waitForSelector('.help:not(.hidden)', { timeout: 4000 });
  const hw = await face(p, '.help .hw');
  assert(hw === 'RB Shippori Mincho', 'the headword in the heading face: ' + hw);
  assert(await p.evaluate(() => getComputedStyle(document.querySelector('.help'), '::after').content !== 'none'), 'the help is a slip with its folded corner');
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !document.querySelector('.help:not(.hidden)'), null, { timeout: 4000 });
  assert(await p.evaluate(() => document.activeElement && document.activeElement.matches('.jt[data-i]')), 'focus is back on the word');
  assert(await p.evaluate(() => RB.ui.dialogue.isOpen()), 'the line is still there (nothing advanced)');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('writing: no transform on the pad or its parents, the pad not stretched, a stroke recorded where it was drawn', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await fonts(p);
  await battle(p, 'hand');
  await openResponse(p);
  await p.waitForSelector('.pad-ink');
  const o = await p.evaluate(() => {
    const ink = document.querySelector('.pad-ink'), tr = [];
    for (let e = ink; e && e !== document.body; e = e.parentElement) { const t = getComputedStyle(e).transform; if (t && t !== 'none') tr.push((e.className || e.tagName) + ': ' + t); }
    const r = ink.getBoundingClientRect();
    return { tr, w: r.width, h: r.height, cw: ink.width, ch: ink.height, x: r.left, y: r.top };
  });
  assert(!o.tr.length, 'transforms above the pad: ' + o.tr.join('; '));
  assert(Math.abs(o.w / o.h - o.cw / o.ch) < 0.02, 'the pad keeps its proportions: ' + JSON.stringify(o));
  await p.mouse.move(o.x + o.w * 0.25, o.y + o.h * 0.25);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(o.x + o.w * (0.25 + i * 0.05), o.y + o.h * (0.25 + i * 0.05));
  await p.mouse.up();
  const st = await p.evaluate(() => { const P = RB.pad.__last && RB.pad.__last._state; return P ? P.strokes.map((s) => [s[0], s[s.length - 1]]) : null; });
  assert(st && st.length === 1, 'one stroke recorded: ' + JSON.stringify(st));
  const [a, z] = st[0];
  assert(Math.abs(a.x - 0.25) < 0.03 && Math.abs(a.y - 0.25) < 0.03 && Math.abs(z.x - 0.75) < 0.03 && Math.abs(z.y - 0.75) < 0.03, 'the stroke is where it was drawn: ' + JSON.stringify(st[0]));
  assert(await face(p, '.chal .slip-lab') === 'RB Vollkorn', 'the prompt\'s labels in the display face');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('typing on a phone with the largest text: Japanese goes in, nothing advances, submit and the way back stay on screen', async () => {
  const { p, errors, ctx } = await page(b, url, PHONE);
  await fonts(p);
  await battle(p, 'ime', { scale: 1.5 });
  await openResponse(p);
  await p.waitForSelector('#ime-in');
  await p.focus('#ime-in');
  await p.keyboard.insertText('みず');
  await p.waitForTimeout(200);
  const o = await p.evaluate(() => {
    const vis = (q) => { const e = document.querySelector(q); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1; };
    return { val: document.querySelector('#ime-in').value, chal: !!document.querySelector('.chal'), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      submit: vis('.chal [data-a="submit"], .chal .submit, .chal button.primary'), back: vis('.chal [data-a="back"], .chal .chal-back, .chal [data-back]') };
  });
  assert(o.val === 'みず' && o.chal, 'the field took the text and the prompt stayed: ' + JSON.stringify(o));
  assert(o.submit !== false, 'submit reachable on screen: ' + JSON.stringify(o));
  assert(o.back !== false, 'the way back reachable on screen: ' + JSON.stringify(o));
  assert(o.sw <= o.cw + 1, 'no sideways scrolling: ' + o.sw + ' > ' + o.cw);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('a battle keeps its identity: both bars, Harmony, the creature\'s plate, the response slips, the way back; in the book\'s faces', async () => {
  for (const opts of [DESK, PHONE]) {
    const { p, errors, ctx } = await page(b, url, opts);
    await fonts(p);
    await battle(p, 'choice');
    const o = await p.evaluate(() => ({
      party: document.querySelectorAll('.cb-party .bar, .cb-party [class*="hp"]').length, harmony: !!document.querySelector('.cb-harmony'),
      foe: !!document.querySelector('.cb-foe'), slips: document.querySelectorAll('.rcard[data-i]').length, flee: !!document.querySelector('[data-flee]'),
    }));
    assert(o.party >= 2 && o.harmony && o.foe && o.slips >= 2 && o.flee, JSON.stringify(opts.viewport) + ': ' + JSON.stringify(o));
    const f = await face(p, '.rcard');
    assert(/^RB /.test(f), 'the slips in the book\'s faces: ' + f);
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

await test('the census: every surface opened here draws its text in the book\'s embedded faces', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await fonts(p);
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } }); });
  const seen = {};
  const look = async (name, q) => { seen[name] = await face(p, q); };
  await p.evaluate(() => { RB.ui.notice('A new word noted.'); RB.ui.toast({ kind: 'word', jp: '{水|みず}', en: 'water' }); });
  await p.waitForTimeout(150);
  await look('notice', '.notice'); await look('toast', '.toast .en');
  await p.evaluate(() => { RB.ui.dialogue.say({ who: 'mio', jp: '{行|い}こう 。', en: 'Let\'s go.' }); });
  await p.waitForTimeout(150);
  await look('dialogue (English)', '.dlg .main .enline, .dlg .sub .enline'); await look('dialogue (Japanese)', '.dlg .jline');
  await p.evaluate(() => { RB.ui.dialogue.choose([{ jp: '{行|い}こう', en: 'Let\'s go' }, { jp: '{待|ま}って', en: 'Wait' }]); });
  await p.waitForSelector('.choice');
  await look('a choice', '.choice');
  await p.evaluate(() => { document.querySelector('.choice').click(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { RB.ui.dialogue.hide && RB.ui.dialogue.hide(); RB.ui.settings.open(); });
  await p.waitForSelector('.folio-settings');
  await look('the settings sheet', '.folio-settings .folio-head h2'); await look('a settings page', '.folio-settings .leaf');
  await p.keyboard.press('Escape');
  await p.evaluate(() => RB.ui.workshop.open());
  await p.waitForSelector('.folio-workshop');
  await look('the workshop', '.folio-workshop .leaf');
  const bad = Object.entries(seen).filter(([, f]) => !/^RB /.test(f));
  assert(!bad.length, 'not in the book\'s faces: ' + JSON.stringify(bad) + ' (all: ' + JSON.stringify(seen) + ')');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
