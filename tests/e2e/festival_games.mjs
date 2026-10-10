// The festival's games (expansion P09; src/ui/88g_festival_games.js), in Chromium on the built game, with throwaway
// sessions (no journey saved):
//  1. katanuki: the shape is asked for by name; a wrong sheet says what it is; the right one opens the trace; a
//     scribble cracks; a careful trace along the outline comes away clean; practice keeps nothing;
//  2. ring toss: a description; a throw at the right prize rings it; a timed round keeps only its best, and the
//     clock stops while the English is shown;
//  3. the word lottery: a word drawn; the forge opens on that word's sentence; a slip put back counts nothing;
//  4. taiko: practice is call and response (the card, then your turn); a wrong beat starts the card again; the keys
//     F and K drum the face and the rim;
//  5. every game at phone width without a sideways scroll, and no bare kanji in any of them.
// Usage: node tests/e2e/festival_games.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.body.scrollWidth <= innerWidth + 1);
async function bareKanji(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    for (const rootEl of document.querySelectorAll(scope)) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!/[一-鿿々]/.test(n.nodeValue)) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], [aria-hidden="true"]')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out;
  }, scope);
}
// a twelve-chapter journey on the festival night
async function start(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart('mp.playhouse', 23, 19, { comp: 'suzu', flags: { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_fest_night: true, mp_yukata: true, pt_festival: true } });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
  }, o || {});
}
async function open(p, game, mode) {
  await p.evaluate((game) => { window.__done = null; RB.activity.launch('festival', { source: 'booth', game, venue: true }).then((r) => { window.__done = r || {}; }); }, game);
  await p.waitForSelector('.fv-leaf [data-a=begin]');
  if (mode === 'timed') await p.click('.fv-leaf input[value=timed]');
  await p.click('.fv-leaf [data-a=begin]');
}
const state = (p, game) => p.evaluate((g) => RB.ui.festivalGames[g].state(), game);

await test('katanuki: the shape by name; a wrong sheet; a scribble cracks; a careful trace comes away clean', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'I' });
  await open(p, 'katanuki');
  let st = await state(p, 'katanuki');
  assert(st.phase === 'choose' && st.sheets.length === 4 && st.sheets.includes(st.target), 'four sheets, one of them the asked shape: ' + JSON.stringify(st));
  const ask = await p.$eval('.fv-ask', (e) => e.textContent);
  assert(/抜/.test(ask), 'the shape asked for in Japanese: ' + ask);
  assert((await bareKanji(p, '.fv-leaf')).length === 0, 'no bare kanji');
  const wrong = st.sheets.findIndex((s) => s !== st.target);
  await p.click('.fv-sheetbtn[data-k="' + wrong + '"]');
  assert(/That sheet is/.test(await p.$eval('.fv-say', (e) => e.textContent)), 'a wrong sheet says what it is');
  await p.click('.fv-sheetbtn[data-k="' + st.sheets.indexOf(st.target) + '"]');
  await p.waitForSelector('canvas.fv-pad');
  // a scribble across the middle
  const box = await p.$eval('canvas.fv-pad', (c) => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
  await p.mouse.move(box.x + box.w * 0.1, box.y + box.w * 0.5); await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(box.x + box.w * (0.1 + i * 0.065), box.y + box.w * (0.5 + (i % 2 ? 0.1 : -0.1)));
  await p.mouse.up();
  await p.click('[data-k=press]');
  assert(/snapped|cracked/.test(await p.$eval('.fv-say', (e) => e.textContent)), 'a scribble cracks the sheet');
  // the next sheet: trace its outline with the pointer, carefully
  st = await state(p, 'katanuki');
  await p.click('.fv-sheetbtn[data-k="' + st.sheets.indexOf(st.target) + '"]');
  await p.waitForSelector('canvas.fv-pad');
  const pts = await p.evaluate((id) => { const o = RB.ui.festivalGames.katanuki.outline(id); const out = []; for (let i = 1; i < o.length; i++) for (let k = 0; k < 6; k++) out.push([o[i - 1][0] + (o[i][0] - o[i - 1][0]) * k / 6, o[i - 1][1] + (o[i][1] - o[i - 1][1]) * k / 6]); return out; }, st.target);
  const b2 = await p.$eval('canvas.fv-pad', (c) => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
  await p.mouse.move(b2.x + pts[0][0] * b2.w, b2.y + pts[0][1] * b2.w); await p.mouse.down();
  for (const [x, y] of pts) await p.mouse.move(b2.x + x * b2.w, b2.y + y * b2.w);
  await p.mouse.up();
  await p.click('[data-k=press]');
  assert(/comes away clean/.test(await p.$eval('.fv-say', (e) => e.textContent)), 'a careful trace comes away clean: ' + await p.$eval('.fv-say', (e) => e.textContent));
  await p.click('[data-k=finish]');
  await p.waitForSelector('.fv-over');
  assert(/Nothing is kept/.test(await p.$eval('.fv-over', (e) => e.textContent)), 'practice keeps nothing');
  assert(await p.evaluate(() => !(RB.game.s.practice && RB.game.s.practice.festival && RB.game.s.practice.festival.games.katanuki)), 'no record from practice');
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await test('ring toss: the described prize; a timed round keeps its best; the clock stops for the English', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'F' });
  await open(p, 'wanage', 'timed');
  let st = await state(p, 'wanage');
  assert(st.row.length === 5 && st.row.includes(st.target), 'five prizes, the described one among them');
  const left0 = await p.evaluate(() => RB.ui.festival.state().left);
  await p.click('[data-w=en]');
  const paused = await p.evaluate(() => RB.ui.festival.state().paused);
  assert(paused > 0, 'the clock stops while the English is shown');
  await p.click('.fv-peg[data-w="' + st.row.indexOf(st.target) + '"]');
  await p.waitForFunction(() => /Ringed/.test(document.querySelector('.fv-say').textContent));
  st = await state(p, 'wanage');
  assert(st.score === 1, 'a ring on the described prize counts');
  assert(left0 > 0, 'a timed round has a clock');
  // end the round now (as if the clock ran out)
  await p.evaluate(() => { const g = RB.ui.festivalGames.wanage; const r = g.stop(); RB.ui.festival.state(); return r; });
  await p.evaluate(() => { const f = RB.festival; f.timedResult(RB.game.s, 'wanage', { score: 1, streak: 1 }); });
  const kept = await p.evaluate(() => RB.festival.peek(RB.game.s, 'wanage'));
  assert(kept.timed === 1 && kept.best === 1, 'a timed round keeps its own best: ' + JSON.stringify(kept));
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await test('word lottery: a word drawn; the forge opens on its sentence; putting the slip back counts nothing', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'E' });
  await open(p, 'kuji');
  await p.click('[data-q=draw]');
  await p.waitForSelector('.chal[data-kind=forge]');
  const st = await state(p, 'kuji');
  assert(!!st.word && st.busy, 'a word is drawn and the forge is open');
  const slip = await p.$eval('.fv-slip', (e) => e.textContent);
  const want = await p.evaluate((w) => RB.jp.plain(RB.content.festival.kuji.words.find((x) => x.id === w).word.jp), st.word);
  assert(slip.includes(want), 'the slip shows the word: ' + slip + ' / ' + want);
  const prompt = await p.$eval('.chal', (e) => e.textContent);
  assert(prompt.includes('Your word is'), 'the forge asks for a sentence with that word: ' + prompt.slice(0, 120));
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => /put it back/.test((document.querySelector('.fv-say') || {}).textContent || ''), null, { timeout: 5000 });
  assert((await state(p, 'kuji')).score === 0, 'a slip put back counts nothing');
  assert((await bareKanji(p, '.fv-leaf')).length === 0, 'no bare kanji on the lottery');
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await test('taiko: call and response; a wrong beat starts again; the keys drum', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'F' });
  await open(p, 'taiko');
  await p.waitForFunction(() => RB.ui.festivalGames.taiko.state().phase === 'answer', null, { timeout: 8000 });
  let st = await state(p, 'taiko');
  const card = await p.$eval('.fv-card', (e) => e.textContent);
  assert(/ドン|カッ/.test(card), 'the card is written in drum words: ' + card);
  // a wrong first beat
  const wrongKey = st.pat[0] === 'don' ? 'k' : 'f';
  await p.keyboard.press(wrongKey);
  st = await state(p, 'taiko');
  assert(st.pos === 0 && /From the top/.test(await p.$eval('.fv-say', (e) => e.textContent)), 'a wrong beat starts the card again');
  for (const k of st.pat) await p.keyboard.press(k === 'don' ? 'f' : 'k');
  await p.waitForFunction(() => /Every beat right/.test(document.querySelector('.fv-say').textContent));
  assert((await state(p, 'taiko')).score === 1, 'the card drummed right counts');
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await test('phone width: every game fits, and no bare kanji', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 } });
  await start(p, { profile: 'I' });
  for (const g of ['katanuki', 'wanage', 'kuji', 'taiko', 'yoyo']) {
    await open(p, g);
    await p.waitForTimeout(200);
    assert(await noOverflow(p), g + ': no sideways scroll at phone width');
    const bare = await bareKanji(p, '.fv-leaf');
    assert(bare.length === 0, g + ': no bare kanji: ' + bare.join(', '));
    await p.evaluate(() => RB.ui.festival.close());
    await p.waitForFunction(() => window.__done && !(RB.activity.active && RB.activity.active()) && RB.game.mode() === 'world');
  }
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
