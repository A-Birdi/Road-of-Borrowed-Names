// Kanji on the writing pad, in Chromium against the built index.html:
// the "Kanji or kana" choice under Read as (default by Japanese level and a
// remembered preference, never by the answer), 水 written for the みず task
// and accepted with "written in kanji", the kanji hint when kanji reading is
// off, a kanji the pad doesn't know, kana/kanji twins (入り口), the chart's
// kanji, the Settings control, kana practice staying kana, and layout at
// 320 px / 200 % text. Strokes are real KanjiVG references (RB.recog.reference)
// injected with the pad's test hook; unknown kanji are composed from real
// component strokes (tools/kanjivg/synth.mjs UNKNOWN_KANJI layouts).
// Usage: node tests/e2e/pad_kanji.mjs [filter]
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

// The Road's own みず drill (src/content/ch5/30_learning.js, 07): 水 が 引いた。
const MIZU = { kind: 'write', item: 'v:水', title: 'Test: water', ctx: { jp: '{水|みず} が {引|ひ}いた 。', en: 'The water went down.' }, prompt: { en: 'Water is みず. Write it.' }, answer: 'みず', accept: ['みず', '水'], mode: 'kana' };

async function helpers(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // a real reference, placed in the pad's 0..1 box, with a little seeded jitter
    window.__ink = (ch, seed, j) => {
      const ref = RB.recog.reference(ch);
      const r = RB.util.rng((seed || 7) * 31 + ch.charCodeAt(0));
      const jj = j == null ? 0.02 : j;
      return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jj, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jj, t: 1000 + i * 16 })));
    };
    // 林 (not among the pad's kanji): two real 木 references side by side (UNKNOWN_KANJI layout)
    window.__hayashi = () => {
      const ref = RB.recog.reference('木');
      const bb = ref.strokes.flat().reduce((a, q) => [Math.min(a[0], q.x), Math.min(a[1], q.y), Math.max(a[2], q.x), Math.max(a[3], q.y)], [1e9, 1e9, -1e9, -1e9]);
      const part = (x0, x1) => ref.strokes.map((st) => st.map((q, i) => ({ x: 0.1 + 0.8 * (x0 + ((q.x - bb[0]) / (bb[2] - bb[0])) * (x1 - x0)), y: 0.1 + 0.8 * (0.1 + ((q.y - bb[1]) / (bb[3] - bb[1])) * 0.8), t: i * 16 })));
      return part(0.08, 0.494).concat(part(0.54, 0.94));
    };
    window.__start = (step, profile, extra) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
      s.learn.kanaKnown = 'both'; s.learn.profile = profile || 'E';
      RB.game.settings.input = 'hand';
      if (extra && extra.padKanji) RB.game.settings.padKanji = extra.padKanji;
      window.__res = null;
      RB.game.pushMode('challenge');
      RB.challenge.runStep(typeof step === 'function' ? step() : step, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
    };
    window.__write = async (strokes) => { RB.pad.__last._inject(strokes); await __wait(120); };
    window.__read = () => {
      const rd = document.querySelector('.readas');
      return {
        mode: RB.pad.__last.mode(), sel: document.querySelector('[data-script-sel]').value, state: rd.getAttribute('data-state'), text: rd.textContent.replace(/\s+/g, ' ').trim(),
        big: (document.querySelector('.readas .big ruby') || document.querySelector('.readas .big') || {}).textContent || '', rt: (document.querySelector('.readas .big rt') || {}).textContent || '',
        cands: [...document.querySelectorAll('.cands .cand')].map((x) => x.firstChild ? (x.querySelector('ruby') ? x.querySelector('ruby').firstChild.textContent : x.firstChild.textContent) : ''),
        acts: [...document.querySelectorAll('.cands [data-a]')].map((x) => x.getAttribute('data-a')),
        confirm: !document.querySelector('[data-a=confirm]').disabled, hint: !!document.querySelector('.rd-hint'),
        result: RB.pad.__last._state.result && { status: RB.pad.__last._state.result.status, kanjiHint: RB.pad.__last._state.result.kanjiHint, kanjiLike: RB.pad.__last._state.result.kanjiLike },
      };
    };
  });
}
async function openPad(opts, profile, step, extra) {
  const pg = await page(b, url, opts || { viewport: { width: 1280, height: 800 } });
  await helpers(pg.p);
  await pg.p.evaluate(([st, pr, ex]) => __start(st, pr, ex), [step || MIZU, profile || 'E', extra || null]);
  await pg.p.waitForSelector('.pad-ink');
  return pg;
}

// ---------------------------------------------------------------------------
await test('Read as offers Kanji or kana; the default follows the level and the preference, not the answer', async () => {
  const { p, errors, ctx } = await openPad(null, 'E');
  const opts = await p.evaluate(() => [...document.querySelectorAll('[data-script-sel] option')].map((o) => o.value + ':' + o.textContent));
  assert(JSON.stringify(opts) === JSON.stringify(['kanji:Kanji or kana', 'any:Either kana', 'hira:ひらがな', 'kata:カタカナ']), 'options: ' + opts.join(', '));
  const def = await p.evaluate(() => ({ mode: RB.pad.__last.mode(), sel: document.querySelector('[data-script-sel]').value, pref: RB.game.settings.padKanji }));
  assert(def.mode === 'kanji' && def.sel === 'kanji' && def.pref === 'auto', 'Elementary, preference auto: Kanji or kana ' + JSON.stringify(def));
  // same task, the answer spelled only in kana: the pad's mode does not change
  await p.evaluate(() => { document.querySelector('[data-a=leave]').click(); });
  await p.waitForFunction(() => window.__res);
  await p.evaluate(() => __start(Object.assign({}, { kind: 'write', item: 'v:へや', prompt: { en: 'Room: へや.' }, answer: 'へや', accept: ['へや'], mode: 'kana' }), 'E'));
  await p.waitForSelector('.pad-ink');
  assert((await p.evaluate(() => RB.pad.__last.mode())) === 'kanji', 'a kana-only answer does not switch kanji reading off');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  // Foundations: kana only; kana practice at any level: kana only, in its script
  for (const [profile, step, want] of [['F', MIZU, 'any'], ['E', { kind: 'write', item: 'k:ぬ', prompt: { en: 'Write nu' }, answer: 'ぬ', accept: ['ぬ'], mode: 'kana', single: true, script: 'hira' }, 'hira'], ['A', { kind: 'write', item: 'k:モ', prompt: { en: 'モチ' }, answer: 'モチ', accept: ['モチ'], mode: 'kana', script: 'kata' }, 'kata']]) {
    const pg = await openPad(null, profile, step);
    const m = await pg.p.evaluate(() => ({ mode: RB.pad.__last.mode(), sel: document.querySelector('[data-script-sel]').value }));
    assert(m.mode === want && m.sel === want, profile + ' ' + step.item + ': ' + JSON.stringify(m));
    assert(!pg.errors.length, pg.errors.join('; '));
    await pg.ctx.close();
  }
  // an explicit preference wins over the level
  for (const [profile, pref, want] of [['F', 'on', 'kanji'], ['A', 'off', 'any']]) {
    const pg = await openPad(null, profile, MIZU, { padKanji: pref });
    const m = await pg.p.evaluate(() => RB.pad.__last.mode());
    assert(m === want, profile + ' with padKanji ' + pref + ': ' + m);
    await pg.ctx.close();
  }
});

// ---------------------------------------------------------------------------
await test('writing 水 for the みず task (Elementary) is read as 水 with furigana and accepted: written in kanji', async () => {
  const { p, errors, ctx } = await openPad(phone(390, 844), 'E');
  await p.evaluate(() => __write(__ink('水')));
  const rd = await p.evaluate(() => __read());
  assert(rd.state === 'sure' && rd.big.startsWith('水') && rd.rt === 'みず' && rd.confirm, 'read as 水 (みず): ' + JSON.stringify(rd));
  assert(!rd.hint && !/small/i.test(rd.text), 'no size hint on a kanji: ' + rd.text);
  await p.tap('[data-a=confirm]');
  const cell = await p.evaluate(() => ({ text: RB.pad.__last.text(), rt: (document.querySelector('.strip .cell:not(.ins) rt') || {}).textContent }));
  assert(cell.text === '水' && cell.rt === 'みず', 'answer line shows 水 with its reading: ' + JSON.stringify(cell));
  await p.tap('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  const fb = await p.evaluate(() => { const w = document.querySelector('.fbwrap'); const how = w.querySelector('.fb-how'); return { text: w.textContent.replace(/\s+/g, ' '), how: how && how.textContent, ruby: how && [...how.querySelectorAll('ruby')].map((r) => r.firstChild.textContent + '|' + r.querySelector('rt').textContent) }; });
  assert(/written in kanji/.test(fb.text) && fb.ruby && fb.ruby.includes('水|みず'), 'feedback says it was written in kanji, 水 with みず: ' + JSON.stringify(fb));
  assert(!/[\u{1F300}-\u{1FAFF}✅✔]/u.test(fb.text), 'no emoji in the feedback');
  await p.screenshot({ path: 'tests/e2e/out/pad_kanji_mizu.png' });
  await p.tap('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => ({ res: window.__res, rec: RB.game.s.learn.items['v:水'] }));
  assert(res.res.ok && res.res.mistakes === 0 && res.res.recogMisses === 0 && !res.res.assisted && res.res.mode === 'hand', 'result ' + JSON.stringify(res.res));
  assert(res.rec && res.rec.modes.hand === 1, 'recorded as unassisted handwriting ' + JSON.stringify(res.rec));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('kana only (Foundations): kana unchanged; 水 gets a plain "looks like the kanji" hint and a way to read kanji', async () => {
  const { p, errors, ctx } = await openPad(phone(390, 844), 'F');
  assert((await p.evaluate(() => RB.pad.__last.mode())) === 'any', 'Foundations starts in Either kana');
  // kana: as before
  for (const ch of ['み', 'ず']) {
    await p.evaluate((ch) => __write(__ink(ch)), ch);
    const rd = await p.evaluate(() => __read());
    assert(rd.big === ch && rd.state === 'sure' && rd.confirm && !rd.acts.includes('kanji'), ch + ' read as before: ' + JSON.stringify(rd));
    await p.tap('[data-a=confirm]');
  }
  assert((await p.evaluate(() => RB.pad.__last.text())) === 'みず', 'composed みず');
  // 水 with kanji reading off
  await p.evaluate(() => __write(__ink('水')));
  const rd = await p.evaluate(() => __read());
  assert(rd.state === 'outside' && /looks like the kanji/i.test(rd.text) && /kanji reading is off/i.test(rd.text) && /水/.test(rd.text), 'hint shown: ' + JSON.stringify(rd));
  assert(!rd.confirm && !rd.hint && rd.acts.includes('kanji'), 'no confirm, no size hint, a Read kanji too action: ' + JSON.stringify(rd));
  assert(!/pick the one you meant/i.test(rd.text), 'not framed as an unsure kana');
  await p.screenshot({ path: 'tests/e2e/out/pad_kanji_hint.png' });
  // one tap reads kanji (and is remembered)
  await p.tap('.cands [data-a=kanji]');
  await p.waitForTimeout(150);
  const after = await p.evaluate(() => Object.assign(__read(), { pref: RB.game.settings.padKanji }));
  assert(after.mode === 'kanji' && after.sel === 'kanji' && after.big.startsWith('水') && after.confirm && after.pref === 'on', 'switched: ' + JSON.stringify(after));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('a kanji the pad does not know: said plainly, write it in kana; no unrelated candidates', async () => {
  for (const [profile, off] of [['E', false], ['F', true]]) {
    const { p, errors, ctx } = await openPad(phone(390, 844), profile);
    await p.evaluate(() => __write(__hayashi()));
    const rd = await p.evaluate(() => __read());
    assert(rd.state === 'outside' && /looks like a kanji/i.test(rd.text) && /kana/i.test(rd.text), profile + ': message ' + JSON.stringify(rd));
    if (!off) assert(/doesn.t know/i.test(rd.text), 'kanji mode: says the pad does not know it: ' + rd.text);
    else assert(/kanji reading is off/i.test(rd.text) && rd.acts.includes('kanji'), 'kana mode: offers kanji reading: ' + JSON.stringify(rd));
    assert(rd.cands.length === 0 && !rd.confirm && !rd.hint && rd.acts.includes('chart'), profile + ': no candidates, no confirm, no size hint, the chart: ' + JSON.stringify(rd));
    assert(rd.result.kanjiLike, 'recognizer flagged it kanji-like');
    if (!off) await p.screenshot({ path: 'tests/e2e/out/pad_kanji_unknown.png' });
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------
await test('one shape, two characters: 入り口 by hand; ロ/口 offered by what was written before, choosing the twin is not assisted', async () => {
  const step = { kind: 'write', item: 'v:入り口', prompt: { en: 'Entrance: いりぐち.' }, answer: 'いりぐち', accept: ['いりぐち', '入り口'], mode: 'reading' };
  const { p, errors, ctx } = await openPad(null, 'E', step);
  // at the start, the kana form first, the kanji offered beside it
  await p.evaluate(() => __write(__ink('口')));
  let rd = await p.evaluate(() => __read());
  assert(rd.big === 'ロ' && rd.cands[0] === '口' && /katakana/.test(rd.text), 'start: ロ, then 口: ' + JSON.stringify(rd));
  await p.click('[data-a=clear]');
  for (const ch of ['入', 'り', '口']) {
    await p.evaluate((ch) => __write(__ink(ch)), ch);
    rd = await p.evaluate(() => __read());
    assert(rd.big.startsWith(ch), ch + ' offered first: ' + JSON.stringify(rd));
    await p.click('[data-a=confirm]');
  }
  assert((await p.evaluate(() => RB.pad.__last.text())) === '入り口', 'composed 入り口');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  const how = await p.evaluate(() => document.querySelector('.fbwrap .fb-how').textContent);
  assert(/written with kanji/.test(how), 'feedback: ' + how);
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  let res = await p.evaluate(() => window.__res);
  assert(res.ok && !res.assisted && res.mistakes === 0, 'result ' + JSON.stringify(res));
  // 口 alone for くち, written at the start (ロ first): choosing 口 is not assisted
  await p.evaluate(() => __start({ kind: 'write', item: 'v:口', prompt: { en: 'Mouth: くち.' }, answer: 'くち', accept: ['くち', '口'], mode: 'kana' }, 'E'));
  await p.waitForSelector('.pad-ink');
  await p.evaluate(() => __write(__ink('口')));
  await p.click('.cands .cand >> nth=0');
  rd = await p.evaluate(() => __read());
  assert(rd.big.startsWith('口') && rd.rt === 'くち' && !/you chose/i.test(rd.text), 'twin chosen: ' + JSON.stringify(rd));
  await p.click('[data-a=confirm]');
  const cellAsst = await p.evaluate(() => RB.pad.__last.meta().assisted);
  assert(!cellAsst, 'choosing the other character of the same shape is not assisted');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  res = await p.evaluate(() => window.__res);
  assert(res.ok && !res.assisted, 'result ' + JSON.stringify(res));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('the chart follows Read as: kana sections, and the pad\'s kanji with furigana (assisted)', async () => {
  const { p, errors, ctx } = await openPad(null, 'E');
  await p.click('[data-a=chart]');
  await p.waitForSelector('.kchart');
  const c = await p.evaluate(() => ({ heads: [...document.querySelectorAll('.kchart-h')].map((h) => h.textContent), kanji: [...document.querySelectorAll('.kpick')].filter((b) => b.querySelector('ruby')).map((b) => b.querySelector('ruby').firstChild.textContent + '|' + b.querySelector('rt').textContent), all: document.querySelectorAll('.kpick').length }));
  assert(c.heads.join(',') === 'Hiragana,Katakana,Kanji the pad can read', 'sections: ' + c.heads.join(','));
  assert(c.kanji.length === 33 && c.kanji.includes('水|みず') && c.kanji.every((k) => /\|[ぁ-ゖ]+$/.test(k)), 'the 33 kanji, each with furigana: ' + c.kanji.join(' '));
  await p.click('.kpick[data-c="水"]');
  const t = await p.evaluate(() => ({ text: RB.pad.__last.text(), meta: RB.pad.__last.meta() }));
  assert(t.text === '水' && t.meta.assisted, 'picked from the chart, assisted: ' + JSON.stringify(t));
  await ctx.close();
  // kana only, hiragana task: hiragana only (as before)
  const pg = await openPad(null, 'E', { kind: 'write', item: 'k:ぬ', prompt: { en: 'Write nu' }, answer: 'ぬ', accept: ['ぬ'], mode: 'kana', single: true, script: 'hira' });
  await pg.p.click('[data-a=chart]');
  await pg.p.waitForSelector('.kchart');
  const c2 = await pg.p.evaluate(() => ({ heads: document.querySelectorAll('.kchart-h').length, kanji: [...document.querySelectorAll('.kpick')].some((b) => RB.kana.isKanji(b.getAttribute('data-c'))), first: document.querySelector('.kpick').getAttribute('data-c') }));
  assert(c2.heads === 0 && !c2.kanji && c2.first === 'あ', 'hiragana chart unchanged: ' + JSON.stringify(c2));
  assert(!errors.length && !pg.errors.length, errors.concat(pg.errors).join('; '));
  await pg.ctx.close();
});

// ---------------------------------------------------------------------------
await test('Read as by keyboard; the choice is remembered; Settings › Handwriting reads', async () => {
  const { p, errors, ctx } = await openPad(null, 'E');
  // keyboard: focus the select and move to "Either kana"
  await p.focus('[data-script-sel]');
  await p.keyboard.press('ArrowDown');
  await p.waitForTimeout(100);
  let st = await p.evaluate(() => ({ sel: document.querySelector('[data-script-sel]').value, mode: RB.pad.__last.mode(), pref: RB.game.settings.padKanji }));
  assert(st.sel === 'any' && st.mode === 'any' && st.pref === 'off', 'keyboard choice applied and remembered: ' + JSON.stringify(st));
  await p.evaluate(() => __write(__ink('水')));
  assert((await p.evaluate(() => __read())).state === 'outside', 'kana only now: 水 gets the hint');
  await p.selectOption('[data-script-sel]', 'kanji');
  await p.waitForTimeout(150);
  st = await p.evaluate(() => Object.assign(__read(), { pref: RB.game.settings.padKanji }));
  assert(st.mode === 'kanji' && st.big.startsWith('水') && st.pref === 'on', 'Kanji or kana re-reads the drawing: ' + JSON.stringify(st));
  // Settings: the same preference, as real radios
  await p.evaluate(() => { document.querySelector('[data-a=leave]').click(); });
  await p.waitForFunction(() => window.__res);
  await p.evaluate(() => RB.ui.menu.open('settings'));
  await p.waitForSelector('[data-grp=learning]');
  await p.click('[data-grp=learning]');
  await p.waitForSelector('input[data-set=padKanji]');
  const radios = await p.evaluate(() => [...document.querySelectorAll('input[data-set=padKanji]')].map((r) => r.value + (r.checked ? '*' : '')));
  assert(radios.join(',') === 'auto,on*,off', 'radios: ' + radios.join(','));
  await p.click('label.opt:has(input[data-set=padKanji][value="off"])');
  await p.waitForTimeout(150);
  assert((await p.evaluate(() => RB.game.settings.padKanji)) === 'off', 'Settings: Kana only');
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__);
  await p.waitForTimeout(300);
  assert((await p.evaluate(() => RB.game.settings.padKanji)) === 'off', 'preference survives a reload');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('no horizontal overflow with More open at 320/360 px and 200 % text; the select is at least 44 px', async () => {
  const bad = [];
  for (const w of [320, 360]) for (const scale of [1, 2]) for (const ink of ['水', 'hayashi']) {
    const { p, errors, ctx } = await page(b, url, phone(w, 800));
    await helpers(p);
    await p.evaluate((k) => { RB.game.settings.textScale = k; RB.game.applySettings(); }, scale);
    await p.evaluate(() => __start({ kind: 'write', item: 'v:水', prompt: { en: 'Water is みず. Write it.' }, answer: 'みず', accept: ['みず', '水'], mode: 'kana' }, 'E'));
    await p.waitForSelector('.pad-ink');
    await p.click('[data-a=more]');
    await p.evaluate((ink) => __write(ink === 'hayashi' ? __hayashi() : __ink(ink)), ink);
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const W = innerWidth, out = [];
      if (document.documentElement.scrollWidth > W + 1) out.push('page ' + document.documentElement.scrollWidth);
      for (const el of document.querySelectorAll('.chal *')) {
        if (el.closest('.tabrail, .sr') || el.matches('rt, rt *')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
        const q = el.getBoundingClientRect();
        if (q.width && q.height && (q.right > W + 1 || q.left < -1)) out.push((el.className && el.className.baseVal == null ? el.className : el.tagName) + ' ' + Math.round(q.left) + '..' + Math.round(q.right));
      }
      const s = document.querySelector('[data-script-sel]').getBoundingClientRect();
      return { out: out.slice(0, 6), sel: { h: s.height, l: s.left, r: s.right } };
    });
    if (r.out.length) bad.push(w + 'px x' + scale + ' ' + ink + ': ' + r.out.join('; '));
    if (!(r.sel.h >= 44 && r.sel.l >= 0 && r.sel.r <= w + 1)) bad.push(w + 'px x' + scale + ': select ' + JSON.stringify(r.sel));
    if (errors.length) bad.push(errors.join('; '));
    if (w === 320 && scale === 2 && ink === '水') await p.screenshot({ path: 'tests/e2e/out/pad_kanji_320_200.png' });
    await ctx.close();
  }
  assert(!bad.length, bad.join('\n   '));
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
