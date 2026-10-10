// Kotonoha, Chapter 9 of the twelve-chapter edition (expansion P11), in Chromium on the built game, with throwaway
// sessions (no journey saved):
//  1. the hall's exhibition (a tellings sheet of panels): four tellings side by side at the learner's profile, no bare
//     kanji; "Hang the panels" waits for a pick on every panel; each pick says what it does for whoever reads it (no
//     wrong version); every combination is accepted and kept; at A, Otoha's telling quotes the Kokinshū preface,
//     glossed and labelled;
//  2. the shells (who said what, to whom): the six lines with the English a tap away; a line placed wrongly says what
//     it would mean said that way and which clue points elsewhere; placed right, the reconstruction is kept;
//  3. the Wind Stone in its scene at F: only the leaves carried are offered; a wrong place is explained and the leaf
//     stays in hand to try again; the right place sends it home;
//  4. at phone width both sheets stack and the page never scrolls sideways;
//  5. The Sailor's Last Letter in its scene: each lasting end is described before it is chosen, "think again" goes
//     back to the choice, and the end chosen lasts (Kihei gone from the tide pools, the letter framed by Mitsu's
//     door); the island's new props (the moon stones, the frame) drawn on their maps with no page errors.
// Usage: node tests/e2e/kotonoha.mjs [filter]
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
// a twelve-chapter journey on Kotonoha, Chapter 9 under way (Otoha met, the four tellings heard)
async function start(p, o) {
  await p.evaluate((o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_arrived: true, ko_ch9: true, ko_otoha_met: true, ko_tell_otoha: true, ko_tell_nami: true, ko_tell_hamaji: true, ko_tell_shell: true };
    const s = RB.game.debugStart(o.map || 'ko.hall', o.x || 7, o.y || 8, { comp: o.comp || 'ren', flags: Object.assign(done, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.quests.ko_main = Object.assign({}, s.quests.ko_main || {}, { stage: 3 });
    Object.assign(s.inv, o.inv || {});
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
  }, o || {});
}
const click = (p, sel) => p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.click(); }, sel);
const tell = (p, id) => p.evaluate((id) => { window.__tell = null; RB.hooks.tellings([id]).then(() => { window.__tell = RB.game.s.vars._tell; }); }, id);
const shells = (p, id) => p.evaluate((id) => { window.__sh = null; RB.hooks.shells([id]).then(() => { window.__sh = RB.game.s.vars._shells; }); }, id);
const told = async (p, k) => { await p.waitForFunction((k) => window[k], k); return p.evaluate((k) => window[k], k); };
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

await test('the exhibition: four tellings at the profile, each pick explained, any combination hung and kept', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'E' });
  await tell(p, 'ko.t_hall');
  await p.waitForSelector('.tl-sheet .tl-src');
  const srcs = await p.$$eval('.tl-sheet .tl-src', (xs) => xs.map((x) => x.dataset.s));
  assert(srcs.join(',') === 'otoha,nami,hamaji,shell', 'four tellings side by side: ' + srcs.join(','));
  assert((await bareKanji(p, '.tl-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.tl-sheet')).join(' | '));
  const panels = await p.$$eval('.tl-panel', (xs) => xs.map((x) => x.dataset.p));
  assert(panels.join(',') === 'p1,p2,p3', 'three panels to hang: ' + panels.join(','));
  assert(await p.$eval('.tl-go', (e) => e.disabled && /Hang the panels/.test(e.textContent)), 'nothing to hang until every panel has its telling');
  // each pick says what it does for whoever reads the panel; none is wrong
  const picks = { p1: 'hamaji', p2: 'nami', p3: 'shell' };
  for (const [pn, src] of Object.entries(picks)) {
    await click(p, '.tl-pick[data-p=' + pn + '][data-s=' + src + ']');
    const why = await p.$eval('.tl-panel[data-p=' + pn + '] .tl-pwhy', (e) => e.textContent);
    assert(why.length > 20 && !/wrong|not supported|can't/i.test(why), pn + ': the pick explained, not judged: ' + why);
  }
  // changing a pick is free
  await click(p, '.tl-pick[data-p=p1][data-s=otoha]');
  assert(await p.$eval('.tl-pick[data-p=p1][data-s=otoha]', (e) => e.getAttribute('aria-checked') === 'true'), 'a pick can be changed');
  await click(p, '.tl-go');
  assert((await told(p, '__tell')) === 'best', 'any set of panels is a supported exhibition');
  const kept = await p.evaluate(() => ({ p1: RB.game.s.vars['tell_ko.t_hall_p1'], p2: RB.game.s.vars['tell_ko.t_hall_p2'], p3: RB.game.s.vars['tell_ko.t_hall_p3'], ok: !!RB.game.s.flags['tell_ko.t_hall_ok'] }));
  assert(kept.p1 === 'otoha' && kept.p2 === 'nami' && kept.p3 === 'shell' && kept.ok, 'the panels kept: ' + JSON.stringify(kept));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the A profile: Otoha\'s telling quotes the Kokinshū preface, glossed and labelled', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'A' });
  await tell(p, 'ko.t_hall');
  await p.waitForSelector('.tl-src[data-s=otoha] .tl-gloss');
  const t = await p.$eval('.tl-src[data-s=otoha]', (e) => ({ text: e.querySelector('.tl-text').textContent, gloss: e.querySelector('.tl-gloss').textContent }));
  assert(/Classical/.test(t.gloss) && /やまとうた/.test(t.text) && /古今|こきん/.test(t.text + t.gloss), 'the classical line with its gloss: ' + JSON.stringify(t).slice(0, 240));
  assert((await bareKanji(p, '.tl-sheet')).length === 0, 'no bare kanji at A');
  await click(p, '.tl-cancel');
  assert((await told(p, '__tell')) === 'cancel', 'Come back later leaves it for later');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the shells: a line placed wrongly says what it would mean and which clue points elsewhere; placed right, kept', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'F' });
  await shells(p, 'ko.s_first');
  await p.waitForSelector('.sh-sheet .sh-frag');
  const frags = await p.$$eval('.sh-frag', (xs) => xs.map((x) => x.dataset.f));
  assert(frags.join(',') === 'a1,a2,b1,b2,c1,c2', 'six lines from three conches: ' + frags.join(','));
  assert((await bareKanji(p, '.sh-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.sh-sheet')).join(' | '));
  await click(p, '.sh-showen[data-f=a1]');
  assert(await p.$('.sh-frag[data-f=a1] .sh-entext'), 'the English a tap away');
  assert(await p.$eval('.sh-go', (e) => e.disabled), 'nothing to put together until every line is placed');
  const right = { a1: ['yoshi', 'chitose'], a2: ['chitose', 'yoshi'], b1: ['sendo', 'chitose'], b2: ['chitose', 'sendo'], c1: ['yoshi', 'sendo'], c2: ['chitose', 'ano'] };
  const place = async (f, who, to) => { await click(p, '.sh-chip[data-f=' + f + '][data-r=who][data-p=' + who + ']'); await click(p, '.sh-chip[data-f=' + f + '][data-r=to][data-p=' + to + ']'); };
  for (const [f, [who, to]] of Object.entries(right)) await place(f, who, to);
  // one placed wrongly: the boatman asking Chitose after "the reply"
  await place('a1', 'sendo', 'chitose');
  await click(p, '.sh-go');
  await p.waitForSelector('.sh-frag[data-f=a1] .sh-why');
  const why = await p.$eval('.sh-frag[data-f=a1] .sh-why', (e) => e.textContent);
  assert(/love letter/.test(why) && /plain speech|family/.test(why), 'what it would mean, and the clue: ' + why);
  assert(!(await p.$('.sh-done')), 'not done while a line is out of place');
  await place('a1', 'yoshi', 'chitose');
  await click(p, '.sh-go');
  await p.waitForSelector('.sh-done');
  assert((await p.$$('.sh-ok')).length === 6, 'every line placed');
  await click(p, '.sh-done');
  assert((await told(p, '__sh')) === 'ok', 'the reconstruction tells the scene ok');
  assert(await p.evaluate(() => !!RB.game.s.flags['shells_ko.s_first']), 'kept');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the Wind Stone at F: only leaves carried are offered; a wrong place explained, the right one sends it home', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'F', map: 'ko.village', x: 24, y: 15, inv: { ko_leaf_sg: 1 } });
  await p.evaluate(() => { window.__sc = false; RB.script.run('ko.windstone').then(() => { window.__sc = true; }); });
  for (let i = 0; i < 20 && !(await p.$('.choices:not(.hidden) .choice')); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(100); }
  const menu = await p.$$eval('.choices:not(.hidden) .choice', (xs) => xs.map((x) => x.textContent));
  assert(menu.length === 2 && menu.some((t) => /Fragile/.test(t)) && menu.some((t) => /Not now/.test(t)), 'the one leaf carried, and "not now": ' + menu.join(' / '));
  await p.locator('.choices .choice').filter({ hasText: /Fragile/ }).click();
  await p.waitForSelector('.chal .mc .btn');
  // a teahouse sign: wrong, explained, the leaf still in hand
  await p.locator('.chal .mc .btn').filter({ hasText: /ちゃや/ }).click();
  await p.waitForSelector('.fb-why');
  const why = await p.$eval('.fb-why', (e) => e.textContent);
  assert(/teahouse sign|dumplings/.test(why), 'why not: ' + why);
  assert(await p.evaluate(() => (RB.game.s.inv.ko_leaf_sg || 0) === 1), 'the leaf still in hand');
  await p.locator('.chal .mc .btn').filter({ hasText: /がらす の はこ/ }).click();
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  for (let i = 0; i < 40; i++) {
    if (await p.evaluate(() => window.__sc)) break;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(80);
  }
  const st = await p.evaluate(() => ({ done: window.__sc, leaf: RB.game.s.inv.ko_leaf_sg || 0, home: !!RB.game.s.flags.ko_ret_sg, n: RB.game.s.vars.ko_ret }));
  assert(st.done && st.leaf === 0 && st.home && st.n === 1, 'sent home: ' + JSON.stringify(st));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('phone width: the exhibition and the shells stack, nothing scrolls sideways', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 400, height: 800 } });
  await start(p, { profile: 'I' });
  await tell(p, 'ko.t_hall');
  await p.waitForSelector('.tl-sheet .tl-src');
  const geo = await p.evaluate(() => {
    const xs = [...document.querySelectorAll('.tl-sheet .tl-src')].map((e) => e.getBoundingClientRect());
    return xs.every((r, i) => i === 0 || r.top >= xs[i - 1].bottom - 1);
  });
  assert(geo && (await noSideways(p)), 'the tellings stacked, no sideways scroll');
  await click(p, '.tl-cancel');
  await told(p, '__tell');
  await shells(p, 'ko.s_first');
  await p.waitForSelector('.sh-sheet .sh-frag');
  const wide = await p.evaluate(() => [...document.querySelectorAll('.sh-sheet .sh-frag')].some((e) => e.getBoundingClientRect().right > window.innerWidth + 1));
  assert(!wide && (await noSideways(p)), 'the shells fit the phone, no sideways scroll');
  await click(p, '.sh-cancel');
  assert((await told(p, '__sh')) === 'cancel', 'Come back later');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the sailor\'s letter in its scene: each end shown first, "think again", the chosen end lasts on the map', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'E', map: 'ko.tidepools', x: 12, y: 19, inv: { ko_kihei_letter: 1 }, flags: { ko_kihei_met: true, ko_lowtide: true } });
  await p.evaluate(() => { RB.game.s.quests.ko_kihei = { stage: 2, done: false }; RB.world.refreshActors(); window.__sc = false; RB.script.run('ko.kihei_choose').then(() => { window.__sc = true; }); });
  const menu = async () => { for (let i = 0; i < 30 && !(await p.$('.choices:not(.hidden) .choice')); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(80); } return p.$$eval('.choices:not(.hidden) .choice', (xs) => xs.map((x) => x.textContent)); };
  const first = await menu();
  assert(first.length === 4 && first.some((t) => /Mitsu/.test(t)) && first.some((t) => /wind/.test(t)) && first.some((t) => /back to Kihei/.test(t)) && first.some((t) => /Not now/.test(t)), 'four ways: ' + first.join(' / '));
  await p.locator('.choices .choice').filter({ hasText: /on the wind/ }).click();
  const shownEnd = await p.evaluate(() => [...document.querySelectorAll('.dialogue, .dlg, .textbox, body')].map((e) => e.textContent).join(' '));
  assert(/Mitsu never knows/.test(shownEnd) || /goes with it/.test(shownEnd), 'the end is described before it is chosen');
  const second = await menu();
  assert(second.some((t) => /Think again/.test(t)), 'with a way to think again: ' + second.join(' / '));
  await p.locator('.choices .choice').filter({ hasText: /Think again/ }).click();
  const again = await menu();
  assert(again.length === 4, 'back to the four ways');
  await p.locator('.choices .choice').filter({ hasText: /Give it to Mitsu/ }).click();
  await menu();
  await p.locator('.choices .choice').filter({ hasText: /Give it to her/ }).click();
  for (let i = 0; i < 40 && !(await p.evaluate(() => window.__sc)); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(80); }
  const st = await p.evaluate(() => { RB.world.refreshActors(); return { done: RB.game.s.quests.ko_kihei && RB.game.s.quests.ko_kihei.done, mitsu: !!RB.game.s.flags.ko_kihei_mitsu, letter: RB.game.s.inv.ko_kihei_letter || 0, kihei: !!(RB.world.W.npcs || []).find((a) => a.id === 'ko_kihei') }; });
  assert(st.done && st.mitsu && !st.letter && !st.kihei, 'given to Mitsu; Kihei gone from the pools: ' + JSON.stringify(st));
  // the lodging house: the frame by the door is drawn
  await p.evaluate(() => RB.game.transition('ko.lodge', 4, 6, 'up', {}));
  await p.waitForTimeout(400);
  const frame = await p.evaluate(() => RB.world.W.map.id === 'ko.lodge' && !!RB.content.maps['ko.lodge'].props.find((q) => q.p === 'ko_frame' && RB.state.test(RB.game.s, q.if)));
  assert(frame, 'the frame stands by Mitsu\'s door');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the island\'s new props are drawn: the moon stones on four maps, with no page errors', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  for (const [map, x, y] of [['ko.shore', 3, 15], ['ko.village', 34, 16], ['ko.terraces', 24, 13], ['ko.tidepools', 31, 19]]) {
    await start(p, { map, x, y, flags: { ko_lowtide: true } });
    await p.evaluate(() => { RB.game.s.quests.ko_tide = { stage: 0, done: false }; RB.world.refreshActors && RB.world.refreshActors(); });
    await p.waitForTimeout(500);
    const vis = await p.evaluate((map) => RB.content.maps[map].props.filter((q) => q.p === 'ko_moonstone' && RB.state.test(RB.game.s, q.if)).length, map);
    assert(vis === 1, map + ': its moon stone lies there (' + vis + ')');
  }
  assert(!errors.length, 'no page errors while drawing: ' + errors.join(' | '));
  await p.close();
});

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
