// The chart and every kanji on the pad, in Chromium against the built
// index.html (owner's brief of 2026-09-29: "expand recognizable drawn kanji to
// cover every kanji present in the game, with pages in the chart to cycle
// lists of kanji by type … the chart option in battles can have a search").
//  - 守 written with real pointer strokes (its KanjiVG reference) on an
//    Elementary campaign's pad: read as 守, and 守る accepted "written with kanji";
//  - the same in a battle: the 守る response, 守 + る by hand, the chart's
//    search from the battle's pad (Escape clears the search, then closes);
//  - the chart's pages cycle (kana, kanji by theme, kanji by use), met kanji
//    first, unmet dimmed; search by kanji, kana reading, rōmaji, meaning, word;
//  - an entry (readings with furigana, meaning, words, stroke order) and
//    practice: draw 守 in the practice square, Check says it was read as 守;
//  - the chart from Words › Kanji chart (no task), on Foundations too;
//  - kana pads unchanged (kana read as before);
//  - layout at 320×640 and 200 % text; no page errors.
// Usage: node tests/e2e/kanji_chart.mjs [filter]
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
fs.mkdirSync('tests/e2e/out', { recursive: true });
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 900)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 500)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const phone = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });

// Battle word task for 守る, exactly as the combat UI builds it for the "mamoru" response.
const MAMORU = { kind: 'write', item: 'v:守る', answer: 'まもる', accept: ['まもる', '守る'], mode: 'reading', title: 'Weave the inscription', prompt: { en: 'Write the word for “protect” (kana or kanji).' }, explain: { jp: '{守|まも}る', en: 'protect — Raises a ward.' } };

async function helpers(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__start = (step, profile, extra) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
      s.learn.kanaKnown = 'both'; s.learn.profile = profile || 'E';
      RB.game.settings.input = 'hand';
      if (extra && extra.padKanji) RB.game.settings.padKanji = extra.padKanji;
      window.__res = null;
      RB.game.pushMode('challenge');
      RB.challenge.runStep(step, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
    };
    // screen points of a reference character drawn into an element's box (0.1..0.9 of it)
    window.__points = (ch, sel) => {
      const ref = RB.recog.reference(ch);
      const r = document.querySelector(sel).getBoundingClientRect();
      return ref.strokes.map((st) => st.map((q) => ({ x: r.left + r.width * (0.1 + 0.8 * q.x / ref.box), y: r.top + r.height * (0.1 + 0.8 * q.y / ref.box) })));
    };
    window.__read = () => {
      const rd = document.querySelector('.readas');
      return {
        mode: RB.pad.__last.mode(), state: rd.getAttribute('data-state'), text: rd.textContent.replace(/\s+/g, ' ').trim(),
        big: (document.querySelector('.readas .big ruby') || document.querySelector('.readas .big') || {}).textContent || '', rt: (document.querySelector('.readas .big rt') || {}).textContent || '',
        cands: [...document.querySelectorAll('.cands .cand')].map((x) => (x.querySelector('ruby') ? x.querySelector('ruby').firstChild.textContent : x.firstChild.textContent)),
        confirm: !document.querySelector('[data-a=confirm]').disabled,
        status: RB.pad.__last._state.result && RB.pad.__last._state.result.status,
      };
    };
  });
}
// Draw with real pointer input: mouse moves (desktop) or touch-like pointer moves via the mouse API.
async function drawChar(p, ch, sel) {
  const strokes = await p.evaluate(([c, s]) => __points(c, s), [ch, sel]);
  for (const st of strokes) {
    await p.mouse.move(st[0].x, st[0].y);
    await p.mouse.down();
    for (let i = 1; i < st.length; i++) {
      // a few steps per segment, as a hand would move
      const a = st[i - 1], z = st[i];
      for (let k = 1; k <= 3; k++) await p.mouse.move(a.x + (z.x - a.x) * k / 3, a.y + (z.y - a.y) * k / 3);
    }
    await p.mouse.up();
    await p.waitForTimeout(40);
  }
  await p.waitForTimeout(450);
}
async function openPad(opts, profile, step, extra) {
  const pg = await page(b, url, opts || { viewport: { width: 1280, height: 800 } });
  await helpers(pg.p);
  await pg.p.evaluate(([st, pr, ex]) => __start(st, pr, ex), [step || MAMORU, profile || 'E', extra || null]);
  await pg.p.waitForSelector('.pad-ink');
  await pg.p.waitForTimeout(300);
  return pg;
}
async function overflow(p, root) {
  return p.evaluate((rootSel) => {
    const W = innerWidth, out = [];
    if (document.documentElement.scrollWidth > W + 1) out.push('page ' + document.documentElement.scrollWidth);
    for (const el of document.querySelectorAll(rootSel + ' *')) {
      if (el.closest('.sr') || el.matches('rt, rt *, option, optgroup')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
      const q = el.getBoundingClientRect();
      if (q.width && q.height && (q.right > W + 1 || q.left < -1)) out.push((typeof el.className === 'string' && el.className ? el.className : el.tagName) + ' ' + Math.round(q.left) + '..' + Math.round(q.right));
    }
    return out.slice(0, 8);
  }, root);
}

// ---------------------------------------------------------------------------
await test('Elementary: 守 drawn with real pointer strokes is read as 守 (まも); 守る accepted, written with kanji', async () => {
  const { p, errors, ctx } = await openPad(null, 'E');
  assert((await p.evaluate(() => RB.pad.__last.mode())) === 'kanji', 'Elementary pad reads kanji');
  await drawChar(p, '守', '.pad-ink');
  const rd = await p.evaluate(() => __read());
  assert(rd.big.startsWith('守') && rd.rt === 'まも' && rd.confirm, '守 read with furigana まも: ' + JSON.stringify(rd));
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_mamoru_pad.png' });
  await p.click('[data-a=confirm]');
  await drawChar(p, 'る', '.pad-ink');
  const rd2 = await p.evaluate(() => __read());
  assert(rd2.big === 'る', 'る read: ' + JSON.stringify(rd2));
  await p.click('[data-a=confirm]');
  assert((await p.evaluate(() => RB.pad.__last.text())) === '守る', 'composed 守る');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  const how = await p.evaluate(() => (document.querySelector('.fbwrap .fb-how') || {}).textContent || '');
  assert(/written with kanji/.test(how), 'feedback: ' + how);
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  assert(res.ok && !res.assisted && res.mistakes === 0 && res.mode === 'hand', 'result ' + JSON.stringify(res));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
// the chart's state, for assertions
const chartState = (p) => p.evaluate(() => {
  const leaf = document.querySelector('.kjc .leaf');
  if (!leaf) return null;
  const cells = [...leaf.querySelectorAll('.kchart [data-c]')];
  return {
    page: (document.querySelector('[data-kc-page]') || {}).value,
    pageName: ((document.querySelector('[data-kc-page]') || {}).selectedOptions || [{}])[0].textContent,
    pages: [...document.querySelectorAll('[data-kc-page] option')].map((o) => o.textContent),
    groups: [...document.querySelectorAll('[data-kc-page] optgroup')].map((g) => g.label),
    cells: cells.map((c) => c.getAttribute('data-c')),
    unmet: cells.filter((c) => c.classList.contains('unmet')).map((c) => c.getAttribute('data-c')),
    rubyless: cells.filter((c) => RB.kana.isKanji(c.getAttribute('data-c')) && c.getAttribute('data-c') !== '々' && !c.querySelector('rt')).map((c) => c.getAttribute('data-c')),
    results: [...leaf.querySelectorAll('.kc-res')].map((c) => c.getAttribute('data-c')),
    query: (document.querySelector('#kc-q') || {}).value,
    entry: !!leaf.querySelector('.kc-entry'), practice: !!leaf.querySelector('.kc-pp'),
    focus: document.activeElement && (document.activeElement.id || document.activeElement.getAttribute('data-c') || document.activeElement.getAttribute('data-kc') || document.activeElement.tagName),
  };
});
async function openChart(p) {
  await p.evaluate(() => { const m = document.querySelector('[data-a=more]'); if (m && m.offsetParent && m.getAttribute('aria-expanded') !== 'true') m.click(); });
  await p.click('[data-a=chart]');
  await p.waitForSelector('.kjc .kchart');
  await p.waitForTimeout(150);
}

await test('in a battle (Elementary): the 守る response written as 守 + る by hand; the chart\'s search from the battle\'s pad, typing never reaches the game, Escape clears then closes', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = 'hand';
    window.__result = null;
    RB.game.startBattle('rw.reedling', {}).then((r) => { window.__result = r; });
  });
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i]') }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  const i = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard')].find((x) => /protect/i.test(x.textContent)); return c ? c.getAttribute('data-i') : null; });
  assert(i != null, 'the 守る (protect) response is offered');
  await p.click('.rcard[data-i="' + i + '"]');
  await p.waitForSelector('.chal .pad-ink');
  await p.waitForTimeout(300);
  assert((await p.evaluate(() => RB.pad.__last.mode())) === 'kanji', 'the battle pad reads kanji on Elementary');
  // the chart, from the battle's pad
  await openChart(p);
  const before = await p.evaluate(() => ({ mode: RB.game.mode(), bulb: document.body.classList.contains('bulb-on'), layers: document.querySelectorAll('.folio-scrim').length }));
  await p.click('#kc-q');
  await p.keyboard.type('mamoru');
  await p.waitForTimeout(250);
  let st = await chartState(p);
  assert(st.results[0] === '守', 'search "mamoru": 守 first: ' + st.results.join(''));
  const after = await p.evaluate(() => ({ mode: RB.game.mode(), bulb: document.body.classList.contains('bulb-on'), layers: document.querySelectorAll('.folio-scrim').length }));
  assert(JSON.stringify(before) === JSON.stringify(after), 'typing in the search never reached the game: ' + JSON.stringify([before, after]));
  for (const [q, want, n] of [['守', '守', 1], ['まもる', '守', 1], ['守る', '守', 1], ['protect', '守', 3]]) {
    await p.fill('#kc-q', q);
    await p.waitForTimeout(200);
    st = await chartState(p);
    assert(st.results.slice(0, n).includes(want), `battle search "${q}": ${want} in the first ${n}: ${st.results.slice(0, 6).join('')}`);
  }
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_battle_search.png' });
  // keyboard: ArrowDown to the first result, Enter opens it, Escape back
  await p.focus('#kc-q');
  await p.keyboard.press('ArrowDown');
  st = await chartState(p);
  assert(st.focus === '守', 'ArrowDown moves to the first result: ' + st.focus);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.kc-entry');
  await p.keyboard.press('Escape');
  await p.waitForSelector('.kc-results');
  st = await chartState(p);
  assert(!st.entry && st.query === 'protect' && st.focus === '守', 'Escape: back to the results, focus on 守: ' + JSON.stringify(st.focus));
  // Escape in the search: first clears it, then closes the chart; the pad is still there
  await p.focus('#kc-q');
  await p.keyboard.press('Escape');
  st = await chartState(p);
  assert(st && st.query === '' && st.results.length === 0 && st.cells.length > 0, 'first Escape clears the search: ' + JSON.stringify(st && { q: st.query, r: st.results.length }));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  assert(!(await chartState(p)) && (await p.evaluate(() => !!document.querySelector('.chal .pad-ink'))), 'second Escape closes the chart, back to the pad');
  // write 守る by hand and weave it
  await drawChar(p, '守', '.chal .pad-ink');
  const rd = await p.evaluate(() => __read());
  assert(rd.big.startsWith('守') && rd.rt === 'まも', 'battle pad reads 守: ' + JSON.stringify(rd));
  await p.click('[data-a=confirm]');
  await drawChar(p, 'る', '.chal .pad-ink');
  await p.click('[data-a=confirm]');
  assert((await p.evaluate(() => RB.pad.__last.text())) === '守る', 'composed 守る');
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_battle_mamoru.png' });
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  const how = await p.evaluate(() => (document.querySelector('.fbwrap .fb-how') || {}).textContent || '');
  assert(/written with kanji/.test(how), 'battle feedback: ' + how);
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  await p.waitForFunction(() => !document.querySelector('.chal'), null, { timeout: 15000 });
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('the chart\'s pages cycle: kana, kanji by theme, kanji by use; met kanji first, the rest dimmed; every kanji with furigana; 守 on Movement and actions and on Verbs', async () => {
  const { p, errors, ctx } = await openPad(null, 'E');
  // the player has seen the first village scene and knows the 守る inscription
  await p.evaluate(() => { RB.game.s.seen['rw.village_first'] = true; RB.game.s.words = ['mamoru', 'mizu']; });
  await openChart(p);
  let st = await chartState(p);
  assert(st.groups.join('|') === 'Kana|Kanji by theme|Kanji by use', 'page groups: ' + st.groups.join('|'));
  for (const name of ['Hiragana', 'Katakana', 'Water and liquids', 'Nature and weather', 'People and the body', 'Places and buildings', 'Time and numbers', 'Feelings and the mind', 'Speech and writing', 'Movement and actions', 'Other', 'Nouns · 1 of', 'Verbs', 'Describing words', 'Counters and numbers', 'Names']) {
    assert(st.pages.some((x) => x.startsWith(name)), 'a page "' + name + '": ' + st.pages.join(', '));
  }
  assert(st.pageName === 'Water and liquids', 'a pad reading kanji opens on the first kanji page: ' + st.pageName);
  assert(!st.rubyless.length, 'every kanji on the page has furigana: ' + st.rubyless.join(''));
  // next / previous cycle through the pages
  await p.click('[data-kc=next]');
  st = await chartState(p);
  assert(st.pageName === 'Nature and weather', 'Next: ' + st.pageName);
  await p.click('[data-kc=prev]');
  await p.click('[data-kc=prev]');
  st = await chartState(p);
  assert(st.pageName === 'Katakana' && st.cells.includes('ア'), 'Previous twice: ' + st.pageName);
  // choose a page with the keyboard
  await p.selectOption('[data-kc-page]', { label: 'Movement and actions · 1 of 3' }).catch(async () => { await p.selectOption('[data-kc-page]', { label: 'Movement and actions' }); });
  await p.waitForTimeout(150);
  st = await chartState(p);
  const allActions = [];
  for (let k = 0; k < 4 && /^Movement and actions/.test(st.pageName); k++) { allActions.push(...st.cells); await p.click('[data-kc=next]'); st = await chartState(p); }
  assert(allActions.includes('守'), '守 is on Movement and actions');
  // met first: 守 (from 守る) is met and comes before the unmet kanji of its page
  await p.selectOption('[data-kc-page]', { index: (await p.evaluate(() => [...document.querySelectorAll('[data-kc-page] option')].findIndex((o) => /^Verbs/.test(o.textContent)))) });
  await p.waitForTimeout(150);
  st = await chartState(p);
  const firstUnmet = st.cells.findIndex((c) => st.unmet.includes(c));
  assert(st.cells.includes('守') && !st.unmet.includes('守') && st.cells.indexOf('守') < firstUnmet, 'Verbs: 守 is met and listed before the unmet kanji: ' + st.cells.slice(0, 12).join(''));
  assert(st.cells.slice(firstUnmet).every((c) => st.unmet.includes(c)), 'after the met kanji, only unmet ones');
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_pages.png' });
  // reopening the chart returns to the page it was left on
  await p.click('.kjc [data-folio-close]');
  await openChart(p);
  const again = await chartState(p);
  assert(again.pageName === st.pageName, 'the chart reopens where it was left: ' + again.pageName);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('an entry: readings with furigana, meaning, words, numbered stroke order; practice: 守 drawn in the square is read as 守, a wrong kanji is not, a stroke-order slip is noted; Use in my answer is assisted', async () => {
  const { p, errors, ctx } = await openPad(null, 'E');
  await openChart(p);
  await p.fill('#kc-q', '守');
  await p.waitForTimeout(200);
  await p.click('.kc-res[data-c="守"]');
  await p.waitForSelector('.kc-entry canvas');
  const e = await p.evaluate(() => {
    const leaf = document.querySelector('.kjc .leaf');
    return {
      big: leaf.querySelector('.kbig ruby').firstChild.textContent + '|' + leaf.querySelector('.kbig rt').textContent,
      text: leaf.textContent.replace(/\s+/g, ' '),
      words: [...leaf.querySelectorAll('.kc-words li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()),
      wordRuby: [...leaf.querySelectorAll('.kc-words ruby')].map((r) => r.firstChild.textContent + '|' + r.querySelector('rt').textContent),
      acts: [...leaf.querySelectorAll('.kc-acts [data-kc]')].map((x) => x.getAttribute('data-kc')),
    };
  });
  assert(e.big === '守|まも', 'big 守 with まも: ' + e.big);
  assert(/Readings in the game/.test(e.text) && /まも/.test(e.text) && /6 strokes/.test(e.text), 'readings and stroke count: ' + e.text.slice(0, 200));
  assert(e.wordRuby.includes('守|まも') && e.words.some((w) => /to protect/.test(w)), 'words with furigana, 守る "to protect": ' + JSON.stringify(e));
  assert(e.acts.join(',') === 'practise,use', 'actions: ' + e.acts.join(','));
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_entry.png' });
  // practice
  await p.click('[data-kc=practise]');
  await p.waitForSelector('.kc-pp-ink');
  await p.waitForTimeout(200);
  await drawChar(p, '守', '.kc-pp-ink');
  await p.click('[data-pp=check]');
  let fb = await p.evaluate(() => ({ kind: document.querySelector('.kc-pp-fb').getAttribute('data-fb'), text: document.querySelector('.kc-pp-fb').textContent.replace(/\s+/g, ' ') }));
  assert(fb.kind === 'ok' && /Read as 守/.test(fb.text.replace(/まも/g, '')) && /match the model/.test(fb.text), 'practice: read as 守, order right: ' + JSON.stringify(fb));
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_practice_ok.png' });
  // a different kanji: not 守
  await p.click('[data-pp=clear]');
  await drawChar(p, '字', '.kc-pp-ink');
  await p.click('[data-pp=check]');
  fb = await p.evaluate(() => ({ kind: document.querySelector('.kc-pp-fb').getAttribute('data-fb'), text: document.querySelector('.kc-pp-fb').textContent.replace(/\s+/g, ' ') }));
  assert(fb.kind !== 'ok' && /字/.test(fb.text), 'practice: 字 is not taken for 守: ' + JSON.stringify(fb));
  // 守 with two strokes in the wrong order: an order note (the injected strokes are the reference with 4 and 5 swapped)
  await p.click('[data-pp=clear]');
  await p.evaluate(() => { const ref = RB.recog.reference('守'); const st = ref.strokes.map((s) => s.map((q, i) => ({ x: 0.1 + 0.8 * q.x / ref.box, y: 0.1 + 0.8 * q.y / ref.box, t: i }))); [st[3], st[4]] = [st[4], st[3]]; RB.kanjiChart._lastPractice()._inject(st); });
  await p.click('[data-pp=check]');
  fb = await p.evaluate(() => document.querySelector('.kc-pp-fb').textContent.replace(/\s+/g, ' '));
  assert(/standard order/.test(fb), 'practice: an order note for swapped strokes: ' + fb);
  // the model can be shown
  await p.click('[data-pp=model]');
  assert((await p.evaluate(() => document.querySelector('[data-pp=model]').getAttribute('aria-pressed'))) === 'true', 'Show the model toggles');
  // back to the entry, Use in my answer: 守 goes into the answer, assisted
  await p.click('[data-kc=entry]');
  await p.waitForSelector('[data-kc=use]');
  await p.click('[data-kc=use]');
  await p.waitForTimeout(150);
  const t = await p.evaluate(() => ({ text: RB.pad.__last.text(), meta: RB.pad.__last.meta(), chart: !!document.querySelector('.kjc') }));
  assert(t.text === '守' && t.meta.assisted && !t.chart, 'Use in my answer: 守 in the answer, assisted, chart closed: ' + JSON.stringify(t));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Foundations: Words › Kanji chart opens the chart without a task; 守 found and practised; the kana pad offers kanji entries to practise but not to use', async () => {
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await helpers(p);
  await p.evaluate(() => { const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); s.learn.profile = 'F'; s.learn.kanaKnown = 'both'; });
  await p.evaluate(() => RB.ui.menu.open('words'));
  await p.waitForSelector('[data-sub=kanji]');
  await p.click('[data-sub=kanji]');
  await p.waitForSelector('[data-kchart]');
  await p.click('[data-kchart]');
  await p.waitForSelector('.kjc .kchart');
  let st = await chartState(p);
  assert(st.pages.length > 20 && st.pages[0] === 'Hiragana', 'browse mode: all pages: ' + st.pages.slice(0, 3).join(', '));
  await p.tap('#kc-q');
  await p.keyboard.type('まもる');
  await p.waitForTimeout(250);
  st = await chartState(p);
  assert(st.results[0] === '守', 'Foundations search まもる: 守: ' + st.results.join(''));
  await p.tap('.kc-res[data-c="守"]');
  await p.waitForSelector('[data-kc=practise]');
  assert(!(await p.$('[data-kc=use]')), 'no Use in my answer without a task');
  await p.tap('[data-kc=practise]');
  await p.waitForSelector('.kc-pp-ink');
  await p.waitForTimeout(200);
  await p.evaluate(() => { const ref = RB.recog.reference('守'); RB.kanjiChart._lastPractice()._inject(ref.strokes.map((s) => s.map((q, i) => ({ x: 0.1 + 0.8 * q.x / ref.box, y: 0.1 + 0.8 * q.y / ref.box, t: i })))); });
  await p.tap('[data-pp=check]');
  const fb = await p.evaluate(() => document.querySelector('.kc-pp-fb').getAttribute('data-fb'));
  assert(fb === 'ok', 'Foundations practice of 守: read as 守 (' + fb + ')');
  await p.screenshot({ path: 'tests/e2e/out/kanji_chart_foundations_practice.png' });
  const steps = [];
  for (let k = 0; k < 4; k++) {
    await p.keyboard.press('Escape');
    await p.waitForTimeout(120);
    const x = await chartState(p);
    steps.push(!x ? 'closed' : x.practice ? 'practice' : x.entry ? 'entry' : x.results.length ? 'results' : 'list');
  }
  assert(steps.join(',') === 'entry,results,list,closed', 'Escape: practice → entry → results → search cleared → closed: ' + steps.join(','));
  assert(await p.evaluate(() => !!document.querySelector('.folio')), 'back on the Words page');
  await ctx.close();
  // a Foundations task pad (kana only): the chart opens on the kana page; a kanji entry has Practise, not Use
  const pg = await openPad(phone(390, 844), 'F');
  assert((await pg.p.evaluate(() => RB.pad.__last.mode())) === 'any', 'Foundations pad reads kana only');
  await openChart(pg.p);
  st = await chartState(pg.p);
  assert(st.pageName === 'Hiragana' || /Water/.test(st.pageName) === false, 'kana pad opens on a kana page: ' + st.pageName);
  await pg.p.fill('#kc-q', '水');
  await pg.p.waitForTimeout(200);
  await pg.p.tap('.kc-res[data-c="水"]');
  await pg.p.waitForSelector('[data-kc=practise]');
  const acts = await pg.p.evaluate(() => ({ use: !!document.querySelector('[data-kc=use]'), note: /reads kana only/.test(document.querySelector('.kjc .leaf').textContent) }));
  assert(!acts.use && acts.note, 'kana pad: no Use for a kanji, and a note about Read as: ' + JSON.stringify(acts));
  // kana pick still works in one tap
  await pg.p.keyboard.press('Escape');
  await pg.p.keyboard.press('Escape');
  await pg.p.waitForTimeout(100);
  await pg.p.selectOption('[data-kc-page]', { label: 'Hiragana' });
  await pg.p.waitForTimeout(100);
  await pg.p.tap('.kpick[data-c="み"]');
  const t = await pg.p.evaluate(() => ({ text: RB.pad.__last.text(), assisted: RB.pad.__last.meta().assisted }));
  assert(t.text === 'み' && t.assisted, 'kana picked in one tap, assisted: ' + JSON.stringify(t));
  assert(!errors.length && !pg.errors.length, errors.concat(pg.errors).join('; '));
  await pg.ctx.close();
});

await test('kana-only pad unchanged: kana drawn with real pointer strokes read as themselves; a kanji drawn gets the hint', async () => {
  const { p, errors, ctx } = await openPad(null, 'F', { kind: 'write', item: 'v:みず', prompt: { en: 'Water: みず.' }, answer: 'みず', accept: ['みず', '水'], mode: 'kana' });
  for (const ch of ['み', 'ず', 'ア', 'ン', 'し', 'ツ']) {
    await p.click('[data-a=clear]');
    await drawChar(p, ch, '.pad-ink');
    const rd = await p.evaluate(() => __read());
    assert(rd.big === ch && rd.mode === 'any', ch + ' read as ' + JSON.stringify(rd));
  }
  await p.click('[data-a=clear]');
  await drawChar(p, '守', '.pad-ink');
  const rd = await p.evaluate(() => __read());
  assert(rd.state === 'outside' && /守/.test(rd.text) && /kanji reading is off/.test(rd.text), 'kana pad: 守 gets the kanji hint: ' + JSON.stringify(rd));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('layout at 320×640 and 200 % text: the chart (list, search, entry, practice) has no horizontal overflow; controls are at least 44 px', async () => {
  const bad = [];
  for (const [w, h, scale] of [[320, 640, 1], [320, 640, 2], [390, 844, 2], [1280, 800, 2]]) {
    const { p, errors, ctx } = await page(b, url, w < 600 ? phone(w, h) : { viewport: { width: w, height: h } });
    await helpers(p);
    await p.evaluate((k) => { RB.game.settings.textScale = k; RB.game.applySettings(); }, scale);
    await p.evaluate((st) => __start(st, 'E'), MAMORU);
    await p.waitForSelector('.pad-ink');
    await openChart(p);
    const check = async (label) => {
      const o = await overflow(p, '.kjc');
      if (o.length) bad.push(`${w}x${h} x${scale} ${label}: ${o.join('; ')}`);
      const small = await p.evaluate(() => [...document.querySelectorAll('.kjc #kc-q, .kjc [data-kc-page], .kjc .kc-pager .pbtn, .kjc .kpick, .kjc .kc-res, .kjc .kc-acts .pbtn, .kjc .kc-pp-tools .pbtn, .kjc [data-pp=check]')]
        .filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return [e.id || e.getAttribute('data-kc') || e.getAttribute('data-pp') || e.getAttribute('data-c') || e.className, Math.round(r.width), Math.round(r.height)]; })
        .filter(([, ww, hh]) => ww < 43.5 || hh < 43.5).slice(0, 5));
      if (small.length) bad.push(`${w}x${h} x${scale} ${label}: small targets ${JSON.stringify(small)}`);
    };
    await check('list');
    if (w === 320 && scale === 2) await p.screenshot({ path: 'tests/e2e/out/kanji_chart_320_200_list.png' });
    await p.fill('#kc-q', 'protect');
    await p.waitForTimeout(200);
    await check('search');
    if (w === 320 && scale === 2) await p.screenshot({ path: 'tests/e2e/out/kanji_chart_320_200_search.png' });
    await p.click('.kc-res[data-c="守"]');
    await p.waitForSelector('.kc-entry');
    await check('entry');
    if (w === 320 && scale === 2) await p.screenshot({ path: 'tests/e2e/out/kanji_chart_320_200_entry.png' });
    await p.click('[data-kc=practise]');
    await p.waitForSelector('.kc-pp-ink');
    await p.waitForTimeout(150);
    await check('practice');
    if (w === 320 && scale === 2) await p.screenshot({ path: 'tests/e2e/out/kanji_chart_320_200_practice.png' });
    if (errors.length) bad.push(errors.join('; '));
    await ctx.close();
  }
  assert(!bad.length, bad.join('\n   '));
});

await test('speed in the browser: kanji tables prepared once; a kana+kanji reading well under 50 ms; a chart search under 25 ms', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(() => {
    const t0 = performance.now();
    RB.recog._internal.kanjiTables();
    const tables = performance.now() - t0;
    const chars = RB.recog.supported({ kanji: true }).filter((c) => RB.kana.isKanji(c)).filter((_, i) => i % 13 === 0);
    const rng = RB.util.rng(7);
    const times = [];
    for (const ch of chars) {
      const ref = RB.recog.reference(ch);
      const strokes = ref.strokes.map((st) => st.map((q, i) => ({ x: q.x * 3 + (rng() - 0.5) * 6, y: q.y * 3 + (rng() - 0.5) * 6, t: i })));
      const a = performance.now();
      RB.recog.recognize(strokes, { box: { w: 327, h: 327 }, script: 'any', kanji: true });
      times.push(performance.now() - a);
    }
    times.sort((x, y) => x - y);
    const s0 = performance.now();
    RB.kanjiInfo.all();
    const index = performance.now() - s0;
    const f0 = performance.now();
    RB.kanjiInfo.search('a'); // the first search also builds the search keys
    const firstSearch = performance.now() - f0;
    const q = [];
    for (const w of ['protect', 'まもる', 'mamoru', '守る', 'water', 'kyou']) { const a = performance.now(); RB.kanjiInfo.search(w); q.push(performance.now() - a); }
    q.sort((x, y) => x - y);
    return { n: times.length, tables: +tables.toFixed(1), median: +times[times.length >> 1].toFixed(1), p95: +times[Math.floor(times.length * 0.95)].toFixed(1), max: +times[times.length - 1].toFixed(1), index: +index.toFixed(1), firstSearch: +firstSearch.toFixed(1), searchMax: +q[q.length - 1].toFixed(1) };
  });
  console.log('   browser timing: ' + JSON.stringify(r));
  fs.writeFileSync('tests/e2e/out/kanji_chart_timing.json', JSON.stringify(r, null, 1));
  assert(r.median < 50 && r.p95 < 100, 'recognize: median ' + r.median + ' ms, p95 ' + r.p95 + ' ms');
  assert(r.searchMax < 25, 'search: ' + r.searchMax + ' ms');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
