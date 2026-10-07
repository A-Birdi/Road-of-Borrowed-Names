// Browser half of the audit fixes (2026-10-07; unit half: tests/unit/audit_fixes.test.mjs), against
// the built index.html in Chromium with synthetic fixtures only:
//  - Words › Grammar met lists the grammar points met (it always showed its empty message);
//  - Translate in a story activity marks only the customer or letter it was used on as assisted;
//  - a Foundations copy step (the model shown) is recorded as guided practice, never unaided writing.
// Usage: node tests/e2e/audit_fixes.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 90s')), 90000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
// every learning record the page makes, in order: { ids, ok, mode, assisted }
const spy = (p) => p.evaluate(() => { const rec = RB.learn.record; window.__recs = []; RB.learn.record = (id, r) => { window.__recs.push({ ids: [].concat(id), ok: r.ok, mode: r.mode, assisted: !!r.assisted }); return rec(id, r); }; });

await test('Words › Grammar met lists the points met, with their titles and examples', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const openGrammar = async () => { await p.evaluate(() => RB.ui.menu.open('words')); await p.click('.folio [data-sub="grammar"]'); };
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); });
  await openGrammar();
  await p.waitForFunction(() => /Grammar you meet on the road will be collected here/.test(document.querySelector('#folio-page').textContent), null, { timeout: 5000 });
  await p.evaluate(() => { RB.ui.menu.close(); RB.learn.rec('g:prt_wa'); RB.learn.rec('g:prt_wo'); });
  await openGrammar();
  await p.waitForSelector('#folio-page .entries.notes', { timeout: 5000 });
  const o = await p.evaluate(() => ({ n: document.querySelectorAll('#folio-page .entries.notes > li').length, text: document.querySelector('#folio-page .entries.notes').textContent, ruby: document.querySelectorAll('#folio-page .entries.notes ruby').length, braces: /\{[^}]*\|/.test(document.querySelector('#folio-page .entries.notes').textContent) }));
  assert(o.n === 2, 'two points listed: ' + o.n);
  assert(/は/.test(o.text) && /を/.test(o.text) && /topic/.test(o.text), 'titles shown: ' + o.text.slice(0, 160));
  assert(o.ruby > 0 && !o.braces, 'examples rendered with furigana, no raw markup');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('letters: Translate on the first letter does not mark the next one as assisted', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E'; });
  await spy(p);
  await p.evaluate(() => { RB.activities.run('co.a_letters'); }); // (not awaited: it resolves when the activity ends)
  await p.waitForSelector('.lsheet.activity [data-tr]');
  const tos = await p.evaluate(() => RB.content.activities['co.a_letters'].letters.map((l) => l.to));
  await p.click('.lsheet.activity [data-tr]');
  await p.click('.lsheet.activity [data-to="' + tos[0] + '"]');
  await p.click('.lsheet.activity [data-next]');
  await p.waitForSelector('.lsheet.activity [data-tr]');
  await p.click('.lsheet.activity [data-to="' + tos[1] + '"]');
  const recs = await p.evaluate(() => window.__recs.filter((r) => r.ids.some((i) => i.startsWith('c:co_letter'))));
  assert(recs.length === 2, 'two letters recorded: ' + JSON.stringify(recs));
  assert(recs[0].assisted === true && recs[1].assisted === false, 'only the translated letter is assisted: ' + JSON.stringify(recs));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('orders: Translate for one customer does not mark the next as assisted', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E'; });
  await spy(p);
  await p.evaluate(() => { RB.activities.run('co.a_orders'); });
  await p.waitForSelector('.lsheet.activity [data-tr]');
  const custs = await p.evaluate(() => RB.content.activities['co.a_orders'].customers.map((c) => ({ want: c.want, items: c.items || null })));
  const serve = async (want) => {
    for (const k of Object.keys(want)) for (let n = 0; n < want[k]; n++) await p.click('.lsheet.activity [data-add="' + k + '"]');
    await p.click('.lsheet.activity [data-serve]');
    await p.waitForSelector('.lsheet.activity [data-next]');
  };
  await p.click('.lsheet.activity [data-tr]');
  await serve(custs[0].want);
  await p.click('.lsheet.activity [data-next]');
  await p.waitForSelector('.lsheet.activity [data-tr]');
  await serve(custs[1].want);
  const recs = await p.evaluate(() => window.__recs);
  const withItems = custs.slice(0, 2).map((c) => !!c.items);
  assert(withItems[0] && withItems[1], 'both customers carry learning items: ' + JSON.stringify(custs.slice(0, 2)));
  assert(recs.length === 2 && recs[0].assisted === true && recs[1].assisted === false, 'only the translated customer is assisted: ' + JSON.stringify(recs));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('a copy step (model shown) is recorded as guided practice, not unaided', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' }); s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {}; });
  await spy(p);
  // an inscription with nothing taught yet: RB.tasks.prepare turns it into a copy step
  const prepared = await p.evaluate(() => { const st = RB.tasks.prepare({ kind: 'write', item: 'v:audit_copy', prompt: { en: 'The inscription.' }, answer: 'あめ', accept: ['あめ'], mode: 'kana' }); return { copy: !!st.copy, answer: st.answer }; });
  assert(prepared.copy, 'prepared as a copy step: ' + JSON.stringify(prepared));
  await p.evaluate(() => {
    RB.game.settings.input = 'ime';
    window.__res = null;
    RB.game.pushMode('challenge');
    const st = RB.tasks.prepare({ kind: 'write', item: 'v:audit_copy', prompt: { en: 'The inscription.' }, answer: 'あめ', accept: ['あめ'], mode: 'kana' });
    RB.challenge.runStep(st, {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
  });
  await p.waitForSelector('.chal-copy');
  await p.waitForSelector('.chal input, .chal textarea');
  await p.fill('.chal input, .chal textarea', 'あめ');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fbwrap[data-fb=ok]', { timeout: 5000 });
  const fb = await p.evaluate(() => document.querySelector('.fbwrap[data-fb=ok]').textContent);
  assert(/Guided practice/.test(fb), 'feedback says guided practice: ' + fb.slice(0, 120));
  await p.click('.fb-go');
  await p.waitForFunction(() => window.__res);
  const r = await p.evaluate(() => ({ res: window.__res, recs: window.__recs.filter((x) => x.ids.includes('v:audit_copy')) }));
  assert(r.res.assisted && r.res.guided, 'the result is guided: ' + JSON.stringify(r.res));
  assert(r.recs.length === 1 && r.recs[0].assisted, 'recorded as assisted, not as unaided ' + (r.recs[0] && r.recs[0].mode) + ': ' + JSON.stringify(r.recs));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
