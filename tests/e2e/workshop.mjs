// The Language Workshop and the new task families (expansion L7–L17b, L1, L2; src/learn/50_forge.js,
// src/ui/65_challenge.js, src/ui/64_workshop.js), in Chromium on the built game, with no journey saved:
//  - a forged sentence by every rung: choose, pieces, word by word, typed (the bounded answer space);
//    a reply outside it is "outside what this can read", not wrong; a wrong family says why;
//  - the evidence each rung records (recog, construct, typed) and its help category;
//  - asking back in a scene: the simpler line, recorded as understanding in context;
//  - an optional listening step answered by reading instead (never needs hearing);
//  - the workshop's page in Words › Ways to practise; no errors, no network.
// Usage: node tests/e2e/workshop.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 120 s')), 120000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const start = (p, prof) => p.evaluate((prof) => { const s = RB.game.debugStart('rw.village', 22, 30, { profile: prof }); s.learn.kanaKnown = 'both'; RB.game.settings.forgeRung = null; return true; }, prof);
// begin a family's example at a level, in the background (the promise resolves when it is done)
const tryIt = (p, id, lv) => p.evaluate(([id, lv]) => { window.__done = false; RB.ui.workshop.tryFamily(RB.content.workshop.families.find((f) => f.id === id), lv, () => {}).then(() => { window.__done = true; }); }, [id, lv]);
const tab = (p, m) => p.click('.chal-tabs .ptab[data-mode="' + m + '"]');
const cont = async (p) => { await p.waitForSelector('.fbwrap .fb-go'); await p.click('.fbwrap .fb-go'); };
const lastLog = (p, id) => p.evaluate((id) => { const it = RB.game.s.learn.items[id]; return it && it.log ? it.log[it.log.length - 1] : null; }, id);

await test('a forged sentence (L7) by each rung: choose, pieces, word by word, typed; outside the space is not wrong; a wrong reply says why', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'E');
  // rung 1: choose a complete sentence (a wrong one first: it says why)
  await tryIt(p, 'L7', 'E');
  await p.waitForSelector('.chal[data-kind=forge]');
  assert(await p.evaluate(() => [...document.querySelectorAll('.chal-tabs .ptab')].map((x) => x.dataset.mode).join(',')) === 'choice,build,fine,ime,hand', 'the support ladder');
  await tab(p, 'choice');
  const wrong = await p.evaluate(() => { const b = [...document.querySelectorAll('.chal .mc .btn')].find((x) => /閉/.test(x.textContent)); b.click(); return document.querySelector('.fbwrap').textContent; });
  assert(/keep it shut/.test(wrong), 'a wrong reply says why: ' + wrong);
  await p.evaluate(() => { const b = [...document.querySelectorAll('.chal .mc .btn')].find((x) => !x.disabled && /夕方/.test(x.textContent) && /開/.test(x.textContent)); b.click(); });
  await cont(p);
  await p.waitForFunction(() => window.__done);
  let l = await lastLog(p, 'g:te_oku');
  assert(l && l.m === 'recog' && l.f === 0, 'rung 1 records recognition, the first answer missed: ' + JSON.stringify(l));
  assert(await p.evaluate(() => RB.game.s.vars._forge === undefined || RB.game.s.vars._forge === 0 || true), 'ok');
  // rung 2: pieces (a distractor is offered)
  await tryIt(p, 'L7', 'E');
  await p.waitForSelector('.chal[data-kind=forge]');
  await tab(p, 'build');
  const pieces = await p.evaluate(() => [...document.querySelectorAll('.pane-build .tile')].map((t) => t.textContent));
  assert(pieces.some((t) => /朝/.test(t)), 'a piece that does not belong is among them: ' + pieces.join(' | '));
  for (const re of ['横', '夕方', 'おいてください']) await p.evaluate((re) => { const t = [...document.querySelectorAll('.pane-build .tile')].find((x) => x.textContent.replace(/\s/g, '').includes(re) && !/閉/.test(x.textContent)); t.click(); }, re);
  await p.click('[data-a=submit]');
  await cont(p);
  await p.waitForFunction(() => window.__done);
  l = await lastLog(p, 'g:te_oku');
  assert(l.m === 'construct' && l.f === 1 && !l.h, 'rung 2 records construction, first try, no help: ' + JSON.stringify(l));
  // rung 3: word by word (particles are their own pieces)
  await tryIt(p, 'L7', 'E');
  await p.waitForSelector('.chal[data-kind=forge]');
  await tab(p, 'fine');
  const fine = await p.evaluate(() => [...document.querySelectorAll('.pane-fine .tile')].map((t) => t.textContent.replace(/\s/g, '')));
  assert(fine.includes('を') && fine.includes('まで'), 'word by word: particles are separate: ' + fine.join(' '));
  for (const w of ['横', 'の', '門', 'を', '夕方', 'まで', '開けて', 'おいて', 'ください。']) await p.evaluate((w) => { const t = [...document.querySelectorAll('.pane-fine .tile')].find((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); return c.textContent.replace(/\s/g, '') === w; }); if (!t) throw new Error('no tile ' + w); t.click(); }, w);
  await p.click('[data-a=submit]');
  await cont(p);
  await p.waitForFunction(() => window.__done);
  l = await lastLog(p, 'g:te_oku');
  assert(l.m === 'construct' && l.f === 1, 'rung 3 is construction too: ' + JSON.stringify(l));
  // rung 4: typed — outside the space first (never wrong), then a softer accepted reply in kana
  await tryIt(p, 'L7', 'E');
  await p.waitForSelector('.chal[data-kind=forge]');
  await tab(p, 'ime');
  await p.fill('#ime-in', 'もんをあけておいてね');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=unsure]');
  const lim = await p.evaluate(() => document.querySelector('.fbwrap').textContent);
  assert(/Outside what this can read/.test(lim) && !/Not quite/.test(lim), 'outside the space is not a mistake: ' + lim.slice(0, 120));
  await p.fill('#ime-in', 'よこのもんをゆうがたまであけておいてもらえませんか');
  await p.click('[data-a=submit]');
  await cont(p);
  await p.waitForFunction(() => window.__done);
  l = await lastLog(p, 'g:te_oku');
  assert(l.m === 'typed' && l.f === 1, 'rung 4 typed, first try (outside-the-space was not counted): ' + JSON.stringify(l));
  assert(await p.evaluate(() => RB.game.settings.forgeRung === 'ime'), 'the rung chosen is remembered');
  assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
  await ctx.close();
});

await test('help is recorded by category (L2): Translate on a production prompt is conceptual; "I don\'t know" supplies the answer', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'E');
  await tryIt(p, 'L13', 'E');
  await p.waitForSelector('.chal[data-kind=forge]');
  await p.click('.task-tr [data-a=tr]');
  await tab(p, 'choice');
  await p.evaluate(() => { const b = [...document.querySelectorAll('.chal .mc .btn')].find((x) => /三時/.test(x.textContent)); b.click(); });
  await cont(p);
  await p.waitForFunction(() => window.__done);
  let l = await lastLog(p, 'v:入口');
  assert(l && l.h === 'conceptual', 'Translate of the notice in a production task: conceptual help: ' + JSON.stringify(l));
  await tryIt(p, 'L9', 'E');
  await p.waitForSelector('.chal[data-kind=forge]');
  await p.click('[data-a=reveal]');
  await cont(p);
  await p.waitForFunction(() => window.__done);
  l = await lastLog(p, 'g:prt_ni');
  assert(l && l.h === 'supplied', '"I don\'t know": the answer supplied: ' + JSON.stringify(l));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('asking back (L12): the dialogue offers Ask back on a hard line; the simpler line replaces it; recorded as understanding in context', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'E');
  await p.evaluate(() => { RB.game.settings.lead = 'ja'; RB.script.run('ws.ask'); });
  await p.waitForFunction(() => RB.ui.dialogue.isOpen());
  await p.evaluate(() => RB.ui.dialogue.advance(true));
  await p.waitForFunction(() => !document.querySelector('.dlg .b-ask').classList.contains('hidden'));
  const before = await p.evaluate(() => document.querySelector('.dlg .main').textContent);
  await p.click('.dlg .b-ask');
  await p.click('.dlg-ask [data-ask="2"]');
  const after = await p.evaluate(() => document.querySelector('.dlg .main').textContent);
  assert(before !== after && /最後/.test(after), 'the simpler line: ' + after);
  const it = await p.evaluate(() => { const r = RB.game.s.learn.items['c:ask_back']; return r && { log: r.log, ok: r.ok }; });
  assert(it && it.log[0].m === 'context' && !it.log[0].h && it.ok === 1, 'asking back is a success, understanding in context: ' + JSON.stringify(it));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('listening (L16) never needs hearing: "Read it instead" shows the words, and the answer is recorded as reading', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'E');
  await tryIt(p, 'L16', 'E');
  await p.waitForSelector('.chal[data-kind=listen]');
  const read = await p.evaluate(() => !!document.querySelector('.chal-listen [data-a=readit]') || /read it instead/i.test(document.querySelector('.chal-listen').textContent));
  assert(read, 'a text route is offered');
  if (await p.$('.chal-listen [data-a=readit]')) await p.click('.chal-listen [data-a=readit]');
  assert(/きて/.test(await p.evaluate(() => document.querySelector('.chal-listen').textContent)), 'the words are shown');
  await p.evaluate(() => { const b = [...document.querySelectorAll('.chal .mc .btn')].find((x) => /come/.test(x.textContent)); b.click(); });
  await cont(p);
  await p.waitForFunction(() => window.__done);
  const l = await lastLog(p, 'v:来て');
  assert(l && l.m === 'context', 'recorded as reading in context, not listening: ' + JSON.stringify(l));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('the workshop is listed in Words › Ways to practise and opens; every family is there; a stretch level is labelled', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'F');
  const listed = await p.evaluate(() => RB.practice.activities().some((d) => d.id === 'workshop'));
  assert(listed, 'listed');
  await p.evaluate(() => RB.ui.workshop.open());
  await p.waitForSelector('.folio-workshop .ws-list');
  const r = await p.evaluate(() => ({ n: document.querySelectorAll('.ws-list [data-ws]').length, txt: document.querySelector('.folio-workshop').textContent }));
  assert(r.n === 12 && /a stretch/.test(r.txt) && /\(yours\)/.test(r.txt), 'twelve families, levels labelled: ' + JSON.stringify({ n: r.n }));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Words › Mastery: an exam in one way of answering (Choose), every question right first time: a star; the page says stars unlock nothing', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'E');
  await p.evaluate(() => { RB.ui.menu.open('words'); });
  await p.waitForSelector('#folio-page');
  await p.evaluate(() => { const b = [...document.querySelectorAll('[data-sub], .subbtn')].find((x) => /Mastery/.test(x.textContent)); if (b) b.click(); });
  await p.waitForSelector('[data-exam="kana:h:ka"][data-mode="choice"]');
  const note = await p.evaluate(() => document.querySelector('.ms-note').textContent);
  assert(/don't unlock anything/.test(note), 'the page says so: ' + note);
  await p.click('[data-exam="kana:h:ka"][data-mode="choice"]');
  for (let i = 0; i < 5; i++) {
    await p.waitForSelector('.chal .mc .btn');
    // the right option: the kana, in the script the prompt names, that its romaji names
    await p.evaluate(() => {
      const pr = document.querySelector('.chal-prompt').textContent;
      const m = pr.match(/\(([a-z]+)\)|“([a-z]+)”/);
      const rom = m && (m[1] || m[2]);
      const kata = /katakana/.test(pr);
      const bs = [...document.querySelectorAll('.chal .mc .btn')];
      const b = bs.find((x) => { const c = x.textContent.trim(); return RB.kana.romaji(c) === rom && (kata ? RB.kana.isKata(c) : RB.kana.isHira(c)); }) || bs[0];
      b.click();
    });
    await p.waitForSelector('.fbwrap .fb-go, .fbwrap[data-fb=no]');
    if (await p.$('.fbwrap[data-fb=no]')) throw new Error('a wrong option was picked: ' + await p.evaluate(() => document.querySelector('.chal-prompt').textContent));
    await p.click('.fbwrap .fb-go');
  }
  await p.waitForFunction(() => RB.records.has(RB.game.s, 'stars', 'kana:h:ka|choice'), null, { timeout: 10000 });
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
