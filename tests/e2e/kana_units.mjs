// RBN-QA-198 in Chromium (Agnes 6758566311 and 6768862363; Local CL-714, CL-761; Cloud CC-544; Agnes 6803414018): a kana
// written as two characters (ティ, ファ, しゃ) is one unit, but the word-completion blank left its second character
// showing after the blank (パー？ィー) and marked the task single, so one character was all the pad would take. Now the
// word goes on after the whole unit, and only a one-character unit is single. On the built game, the real challenge
// runner, the word forced by the task's own clock:
//  1. typed (IME): ティ in パーティー shows パー？ー; テ is rejected with its feedback, テイ's result is recorded as it is,
//     ティ is accepted; フ/ファ in ソファ shows ソ？ and the same; し/しゃ in a word with しゃ, the same;
//  2. written on the pad: ティ as テ then ィ, both kept, accepted; a one-character control (テ) still takes one;
//  3. one-character controls typed: テ and あ in their words, the blank and the rest of the word as before, accepted;
//  4. the bare unit, in Foundations after every kana lesson (the lessons' own auto path marks what each one teaches),
//     prepared as the practice fallback and the lamps prepare it (Agnes 6805563739 (a) and 6806661624; Local CL-775):
//     a. typed: きゃ asked whole, not single, no word; き and きや (the full-size や) rejected, きゃ accepted, the task
//        right, recorded once as きゃ's (not first try, as any task right after a wrong answer; き's untouched); ティ
//        the same, with テ and テイ rejected; キャ right at once: recorded as キャ's, first try, nothing for キ;
//     b. on the pad, each character given its reference strokes (injected into the pad, then the pad's reading
//        confirmed; not drawn with a pointer): き then a small ゃ, kept as きゃ and accepted; テ then a small ィ, kept
//        as ティ and accepted; a one-character bare kana (き) still takes one character;
//     c. Step away: nothing recorded; the same task again: きゃ asked whole as before;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/kana_units.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

async function helpers(p) {
  await p.evaluate(() => {
    window.__wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // a real reference in the pad's 0..1 box; a small kana drawn small and low in the box, as it is written
    window.__ink = (ch, small) => { const ref = RB.recog.reference(ch); const k = small ? 0.45 : 0.8, o = (1 - k) / 2, dy = small ? 0.15 : 0; return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * k + o, y: (pt.y / ref.box) * k + o + dy, t: 1000 + i * 16 }))); };
    // write one character and confirm the pad's reading of it, as the player does
    window.__writeOne = async (ch, small) => { RB.pad.__last._inject(__ink(ch, small)); await __wait(200); const c = document.querySelector('[data-a=confirm]'); const read = (document.querySelector('.readas .big') || {}).textContent; if (c && !c.disabled) c.click(); await __wait(200); return read; };
    // the kana task for `ch` with its word forced to `want` (the task's own word choice, keyed by the learning clock)
    window.__task = (ch, want) => {
      const clock = RB.learn.clock;
      try { for (let c = 0; c < 4000; c++) { RB.learn.clock = () => c; const st = RB.tasks.kanaStep(ch); if (!want || (st.word && st.word.r === want)) return st; } } finally { RB.learn.clock = clock; }
      return null;
    };
    window.__start = (ch, want, input) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'mio' });
      s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
      RB.game.settings.input = input || 'ime';
      const st = __task(ch, want);
      window.__st = st; window.__res = null;
      if (!st) return null;
      RB.game.pushMode('challenge');
      RB.challenge.runStep(st, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
      return { word: st.word && st.word.r, template: st.template, single: !!st.single };
    };
    // the bare unit in Foundations, every kana lesson done, prepared as the practice fallback and the lamps prepare it
    window.__startBare = async (u, input) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'mio' });
      s.learn.kanaKnown = 'none'; s.learn.profile = 'F'; s.learn.taught = {};
      RB.test.enable();
      try { for (let i = 0; i < 99 && RB.lessons.nextGroup(s); i++) await RB.lessons.run('kana'); } finally { RB.test.disable(); }
      RB.game.settings.input = input || 'ime';
      const st = RB.tasks.prepare(RB.tasks.kanaStep(u, { bare: true }));
      window.__st = st; window.__res = null;
      RB.game.pushMode('challenge');
      RB.challenge.runStep(st, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
      return { answer: st.answer, item: st.item, single: !!st.single, full: st.fullAnswer || null, exposure: st.exposure || null, word: !!st.template, prompt: st.prompt && st.prompt.en };
    };
    window.__rec = (id) => { const r = RB.game.s.learn.items[id]; return r ? { seen: r.seen, ok: r.ok, bad: r.bad } : null; };
    window.__tpl = () => { const t = document.querySelector('.chal-tpl'); if (!t) return null; const parts = [...t.childNodes].map((n) => (n.classList && n.classList.contains('blank') ? '[?]' : n.textContent)); return parts.join(''); };
  });
}
async function typed(p, text) {
  await p.waitForSelector('#ime-in');
  await p.fill('#ime-in', '');
  await p.type('#ime-in', text);
  await p.press('#ime-in', 'Enter');
  await p.waitForSelector('.fbwrap[data-fb]');
  const r = await p.evaluate(() => { const f = document.querySelector('.fbwrap'); return { fb: f.getAttribute('data-fb'), text: f.textContent.replace(/\s+/g, ' ').trim() }; });
  return r;
}
async function again(p) { await p.evaluate(() => { const b = document.querySelector('.fbwrap [data-a=again], .fbwrap [data-a=retry]'); if (b) b.click(); }); await p.waitForTimeout(150); }

// ---- 1. typed ------------------------------------------------------------------------------------------------------------
const UNITS = [['ティ', 'パーティー', 'パー', 'ー', 'テ'], ['ファ', 'ソファ', 'ソ', '', 'フ'], ['しゃ', null, null, null, 'し']];
for (const [ch, want, before, after, wrong] of UNITS) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate(([ch, want]) => __start(ch, want), [ch, want]);
  ok(t && t.single === false && (want ? t.word === want : t.word.indexOf(ch) >= 0), '1 ' + ch + ': the task in ' + (t && t.word) + ', not single ' + flat(t));
  const shown = await p.evaluate(() => __tpl());
  const i = t.word.indexOf(ch);
  const wantTpl = t.word.slice(0, i) + '[?]' + t.word.slice(i + ch.length);
  ok(shown === wantTpl && (before == null || (t.template.before === before && t.template.after === after)), '1 ' + ch + ': on screen ' + shown + ' (the whole unit is the blank; nothing of it after)');
  const w = await typed(p, wrong);
  ok(w.fb === 'no', '1 ' + ch + ': ' + wrong + ' typed is rejected: "' + w.text.slice(0, 140) + '"');
  if (ch === 'ティ') {
    await again(p);
    const ti = await typed(p, 'テイ');
    console.log('     (テイ typed for ティ, as recorded: fb=' + ti.fb + ' "' + ti.text.slice(0, 200) + '")');
    ok(ti.fb === 'no', '1 ティ: テイ typed is not accepted (its feedback recorded above)');
  }
  await again(p);
  const r = await typed(p, ch);
  ok(r.fb === 'ok', '1 ' + ch + ': ' + ch + ' typed is accepted');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  ok(res && res.ok, '1 ' + ch + ': the task ends right ' + flat({ ok: res && res.ok }));
  ok(!errors.length, '1 ' + ch + ': no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 2. written on the pad ---------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => __start('ティ', 'パーティー', 'hand'));
  await p.waitForSelector('.pad-ink');
  const r1 = await p.evaluate(() => __writeOne('テ'));
  const one = await p.evaluate(() => RB.pad.__last.text());
  const r2 = await p.evaluate(() => __writeOne('ィ', true));
  const two = await p.evaluate(() => RB.pad.__last.text());
  ok(one === 'テ' && two === 'ティ', '2 the pad keeps テ, then the small ィ after it: ' + flat({ read: [r1, r2], one, two }));
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb]', { timeout: 8000 }).catch(() => {});
  const fb = await p.evaluate(() => { const f = document.querySelector('.fbwrap'); return f && f.getAttribute('data-fb'); });
  ok(fb === 'ok', '2 written ティ is accepted ' + fb);
  ok(!errors.length, '2 no page errors ' + errors.join('; '));
  await p.context().close();
}
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate(() => __start('テ', null, 'hand'));
  await p.waitForSelector('.pad-ink');
  await p.evaluate(async () => { await __writeOne('テ'); await __writeOne('レ'); });
  const txt = await p.evaluate(() => RB.pad.__last.text());
  ok(t && t.single === true && Array.from(txt).length === 1, '2 a one-character unit (テ in ' + (t && t.word) + ') still takes one character on the pad: ' + flat({ txt, single: t && t.single }));
  ok(!errors.length, '2 control: no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 3. one-character controls typed ----------------------------------------------------------------------------------
for (const ch of ['テ', 'あ']) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate((ch) => __start(ch, null), ch);
  const shown = await p.evaluate(() => __tpl());
  const i = t.word.indexOf(ch);
  ok(t.single === true && shown === t.word.slice(0, i) + '[?]' + t.word.slice(i + 1), '3 ' + ch + ' in ' + t.word + ': single, ' + shown + ' as before');
  const r = await typed(p, ch);
  ok(r.fb === 'ok', '3 ' + ch + ' typed is accepted');
  ok(!errors.length, '3 ' + ch + ': no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 4. the bare unit, Foundations ----------------------------------------------------------------------------------
const wholeBare = (t, u) => t && t.answer === u && t.item === 'k:' + u && t.single === false && !t.full && !t.exposure && !t.word;
for (const [u, wrongs] of [['きゃ', ['き', 'きや']], ['ティ', ['テ', 'テイ']]]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate((u) => __startBare(u), u);
  const base = await p.evaluate((u) => [__rec('k:' + u), __rec('k:' + u[0])], u);
  ok(wholeBare(t, u) && !(await p.evaluate(() => !!document.querySelector('.chal-tpl'))), '4a ' + u + ' bare: asked whole, not single, no word ' + flat(t));
  for (const w of wrongs) {
    const r = await typed(p, w);
    ok(r.fb === 'no', '4a ' + u + ': ' + w + ' typed is rejected: "' + r.text.slice(0, 120) + '"');
    await again(p);
  }
  const r = await typed(p, u);
  ok(r.fb === 'ok', '4a ' + u + ': ' + u + ' typed is accepted');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  const after = await p.evaluate((u) => [__rec('k:' + u), __rec('k:' + u[0])], u);
  const b0 = base[0] || { seen: 0, ok: 0, bad: 0 };
  ok(res && res.ok && res.firstTry === false && after[0] && after[0].seen === b0.seen + 1 && after[0].bad === b0.bad + 1 && after[0].ok === b0.ok && flat(after[1]) === flat(base[1]),
    '4a ' + u + ': the task right, recorded once as ' + u + '\'s, not first try (as any task right after a wrong answer), ' + u[0] + '\'s record untouched ' + flat({ base, after }));
  ok(!errors.length, '4a ' + u + ': no page errors ' + errors.join('; '));
  await p.context().close();
}
{
  // right at once: recorded as the unit's, first try
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate(() => __startBare('キャ'));
  const r = await typed(p, 'キャ');
  await p.click('.fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  const rec = await p.evaluate(() => [__rec('k:キャ'), __rec('k:キ')]);
  ok(wholeBare(t, 'キャ') && r.fb === 'ok' && res.ok && res.firstTry === true && rec[0] && rec[0].ok === 1 && rec[0].bad === 0 && rec[1] === null,
    '4a キャ bare, typed right at once: recorded as キャ\'s, first try; nothing for キ ' + flat({ t, rec }));
  ok(!errors.length, '4a キャ: no page errors ' + errors.join('; '));
  await p.context().close();
}
for (const [u, a, small] of [['きゃ', 'き', 'ゃ'], ['ティ', 'テ', 'ィ']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate((u) => __startBare(u, 'hand'), u);
  await p.waitForSelector('.pad-ink');
  const r1 = await p.evaluate((a) => __writeOne(a), a);
  const r2 = await p.evaluate((sm) => __writeOne(sm, true), small);
  const txt = await p.evaluate(() => RB.pad.__last.text());
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb]', { timeout: 8000 }).catch(() => {});
  const fb = await p.evaluate(() => { const f = document.querySelector('.fbwrap'); return f && f.getAttribute('data-fb'); });
  ok(wholeBare(t, u) && txt === u && fb === 'ok', '4b ' + u + ' bare on the pad: ' + a + ' then a small ' + small + ', kept as ' + u + ', accepted ' + flat({ read: [r1, r2], txt, fb }));
  ok(!errors.length, '4b ' + u + ': no page errors ' + errors.join('; '));
  await p.context().close();
}
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t = await p.evaluate(() => __startBare('き', 'hand'));
  await p.waitForSelector('.pad-ink');
  await p.evaluate(async () => { await __writeOne('き'); await __writeOne('ゃ', true); });
  const txt = await p.evaluate(() => RB.pad.__last.text());
  ok(t.single === true && txt === 'き', '4b a one-character bare kana (き) still takes one character on the pad ' + flat({ txt, single: t.single }));
  ok(!errors.length, '4b control: no page errors ' + errors.join('; '));
  await p.context().close();
}
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  const t1 = await p.evaluate(() => __startBare('きゃ'));
  const base = await p.evaluate(() => __rec('k:きゃ'));
  await p.waitForSelector('[data-a=leave]');
  await p.click('[data-a=leave]');
  await p.waitForFunction(() => window.__res);
  const res = await p.evaluate(() => window.__res);
  const mid = await p.evaluate(() => __rec('k:きゃ'));
  const t2 = await p.evaluate(() => { const st = RB.tasks.prepare(RB.tasks.kanaStep('きゃ', { bare: true })); return { answer: st.answer, item: st.item, single: !!st.single, full: st.fullAnswer || null, exposure: st.exposure || null, word: !!st.template }; });
  ok(res && res.cancelled && flat(mid) === flat(base) && wholeBare(t1, 'きゃ') && wholeBare(t2, 'きゃ'), '4c Step away: nothing recorded; the same task again, きゃ whole as before ' + flat({ res, base, mid, t2 }));
  ok(!errors.length, '4c no page errors ' + errors.join('; '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nkana_units: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
