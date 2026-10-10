// The Keepers' Road, Chapter 7 of the twelve-chapter edition (expansion P10), in Chromium on the built game, with
// throwaway sessions (no journey saved):
//  1. weighing tellings, the cave's order: the sources at the learner's own profile (I: によると; A: the classical line
//     with its modern gloss), the English a tap away, no bare kanji; a claim marked the other way says why (never a
//     gate); the song's order is not supported and the scene hears 'no'; the supported order is 'best' and is kept;
//  2. a choice telling (the oil cache): a detour that is supported ('ok'), then the best reading ('best');
//  3. the rite in the cave, played through its scene: the right order opens the inner door; on a phone-width screen
//     the sheet stacks its sources and the page never scrolls sideways.
// Usage: node tests/e2e/keepers.mjs [filter]
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
// a twelve-chapter journey on the Keepers' Road, everything before the cave done
async function start(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map || 'kr.lodge', o.x || 20, o.y || 12, { comp: o.comp || 'ren', flags: Object.assign({ departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_stele_read: true, kr_rhyme_heard: true, kr_scroll_done: true }, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'I';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
  }, o || {});
}
const click = (p, sel) => p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.click(); }, sel);
const hook = (p, id) => p.evaluate((id) => { window.__tell = null; RB.hooks.tellings([id]).then(() => { window.__tell = RB.game.s.vars._tell; }); }, id);
const result = async (p) => { await p.waitForFunction(() => window.__tell); return p.evaluate(() => window.__tell); };

await test('the cave\'s order: sources at the profile, marks with reasons, the song refused, the supported order kept', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'I' });
  await hook(p, 'kr.t_cave');
  await p.waitForSelector('.tl-sheet .tl-src');
  const srcs = await p.$$eval('.tl-sheet .tl-src', (xs) => xs.map((x) => x.dataset.s));
  assert(srcs.join(',') === 'stele,hisae,rhyme,scroll', 'four sources side by side: ' + srcs.join(','));
  const stele = await p.$eval('.tl-src[data-s=stele] .tl-text', (e) => e.textContent);
  assert(/に\s*よると/.test(stele), 'the stele at the I profile (によると): ' + stele.slice(0, 40));
  assert((await bareKanji(p, '.tl-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.tl-sheet')).join(' | '));
  await click(p, '.tl-showen[data-s=stele]');
  assert(await p.$('.tl-src[data-s=stele] .tl-en'), 'the English a tap away');
  // the rhyme's order claim marked as vouched for: told why, nothing locked
  const rc = await p.$eval('.tl-src[data-s=rhyme] .tl-claim:last-child', (e) => e.dataset.c);
  await click(p, '.tl-claim[data-c="' + rc + '"] .tl-mark[data-m="1"]');
  await p.waitForSelector('.tl-claim[data-c="' + rc + '"] .tl-why');
  // the song's order: east, spring, bell, name
  for (const x of ['east', 'spring', 'bell', 'name']) await click(p, '.tl-chip[data-x=' + x + ']');
  assert(!(await p.$eval('.tl-go', (e) => e.disabled)), 'a full order can be acted on whatever was marked');
  await click(p, '.tl-go');
  assert((await result(p)) === 'no', 'the song\'s order is not supported');
  // again, the supported order
  await hook(p, 'kr.t_cave');
  await p.waitForSelector('.tl-sheet .tl-chip');
  for (const x of ['east', 'spring', 'name', 'bell']) await click(p, '.tl-chip[data-x=' + x + ']');
  await click(p, '.tl-go');
  assert((await result(p)) === 'best', 'east, spring, name, bell: the supported order');
  const kept = await p.evaluate(() => ({ v: RB.game.s.vars['tell_kr.t_cave'], ok: !!RB.game.s.flags['tell_kr.t_cave_ok'], best: !!RB.game.s.flags['tell_kr.t_cave_best'] }));
  assert(kept.v === 'east,spring,name,bell' && kept.ok && kept.best, 'kept: ' + JSON.stringify(kept));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the A profile: the stele\'s classical line with its modern gloss, labelled', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'A' });
  await hook(p, 'kr.t_cave');
  await p.waitForSelector('.tl-src[data-s=stele] .tl-gloss');
  const t = await p.$eval('.tl-src[data-s=stele]', (e) => ({ text: e.querySelector('.tl-text').textContent, gloss: e.querySelector('.tl-gloss').textContent }));
  assert(/べし/.test(t.text) && /Classical/.test(t.gloss) && /なければ/.test(t.gloss), 'classical, glossed: ' + JSON.stringify(t).slice(0, 200));
  assert((await bareKanji(p, '.tl-sheet')).length === 0, 'no bare kanji');
  await click(p, '.tl-cancel');
  assert((await result(p)) === 'cancel', 'Come back later leaves it for later');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the oil cache: a supported detour, then the best reading', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'E', map: 'kr.ridge', x: 20, y: 10 });
  await hook(p, 'kr.t_cache');
  await p.waitForSelector('.tl-sheet .tl-opt');
  await click(p, '.tl-opt[data-o=every]');
  await click(p, '.tl-go');
  assert((await result(p)) === 'ok', 'digging under every lantern: supported, a detour');
  await hook(p, 'kr.t_cache');
  await p.waitForSelector('.tl-sheet .tl-opt');
  await click(p, '.tl-opt[data-o=third]');
  await click(p, '.tl-go');
  assert((await result(p)) === 'no', '"the third from the bridge": nothing vouches for it');
  await hook(p, 'kr.t_cache');
  await p.waitForSelector('.tl-sheet .tl-opt');
  await click(p, '.tl-opt[data-o=down]');
  await click(p, '.tl-go');
  assert((await result(p)) === 'best', 'down the little path: the best reading');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the rite in its scene at phone width: the sheet stacks, the right order opens the inner door', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 400, height: 800 } });
  await start(p, { profile: 'F', map: 'kr.cave1', x: 14, y: 8 });
  await p.evaluate(() => { window.__sc = false; RB.script.run('kr.rite').then(() => { window.__sc = true; }); });
  // the scene's opening line, then the sheet
  for (let i = 0; i < 20 && !(await p.$('.tl-sheet .tl-src')); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(100); }
  await p.waitForSelector('.tl-sheet .tl-src');
  const geo = await p.evaluate(() => {
    const xs = [...document.querySelectorAll('.tl-sheet .tl-src')].map((e) => e.getBoundingClientRect());
    return { stacked: xs.every((r, i) => i === 0 || r.top >= xs[i - 1].bottom - 1), wide: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  assert(geo.stacked && !geo.wide, 'stacked on a phone, no sideways scroll: ' + JSON.stringify(geo));
  for (const x of ['east', 'spring', 'name', 'bell']) await click(p, '.tl-chip[data-x=' + x + ']');
  await click(p, '.tl-go');
  // the scene's lines (instant text) until it ends
  for (let i = 0; i < 40; i++) {
    if (await p.evaluate(() => window.__sc)) break;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(80);
  }
  const st = await p.evaluate(() => ({ done: !!RB.game.s.flags.kr_rite_done, wrong: !!RB.game.s.flags.kr_cave_wrong, stage: RB.game.s.quests.kr_main && RB.game.s.quests.kr_main.stage }));
  assert(st.done && !st.wrong, 'the inner door opens: ' + JSON.stringify(st));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
