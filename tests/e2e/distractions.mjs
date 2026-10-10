// The Ledger's Distractions tab (expansion P06, K7, K10; src/ui/68b_distractions.js) and a place's game (Fuku's bench),
// in Chromium on the built game, with throwaway sessions:
//  - a six-chapter journey: five tabs as before; shiritori still on Company;
//  - a twelve-chapter journey: the sixth tab; the index of games met; a game's page (art, how to play, where,
//    records); Play with Mio opens shogi, and leaving it brings the Ledger back on Distractions; Company points to
//    Distractions, and shiritori's card is there;
//  - phone width: the index, a page, back to the index (the page's button and Back); no overflow; readings;
//  - Fuku's bench: after her nameplate, in a twelve-chapter journey she offers a game and the board opens with her;
//    in a six-chapter journey the bench is as it was.
// Usage: node tests/e2e/distractions.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'distractions');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
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
async function start(p, o) {
  await p.evaluate((o) => {
    const flags = Object.assign({ departed: true }, o.flags || {});
    // the map's arrival scenes as already seen (this is about the bench, not the first visit)
    for (const ev of (RB.content.maps[o.map || 'rw.village'] || {}).onEnter || []) flags['enter:' + (o.map || 'rw.village') + ':' + ev.scene] = true;
    if (o.map === 'sg.harbor') flags.sg_arrived = true;
    const s = RB.game.debugStart(o.map || 'rw.village', o.x || 22, o.y || 30, { comp: 'mio', flags });
    s.edition = o.edition; s.player.nameJp = 'ハル';
    s.visited = s.visited || {}; s.visited['sg.harbor'] = true; s.visited['rw.village'] = true;
    if (o.seaglass) { s.quests = s.quests || {}; s.quests.sg_seaglass = { stage: 5, done: true }; }
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
  }, o);
  await p.waitForTimeout(400);
  await settle(p);
}
// press through whatever is said until the world is back (the first reply to any question)
async function settle(p) {
  for (let i = 0; i < 150; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), ch: document.querySelectorAll('.choice').length, run: RB.script.isRunning() }));
    if (!st.dlg && !st.run && st.mode === 'world') return;
    if (st.ch) await p.evaluate(() => document.querySelector('.choice').click());
    else if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(80);
  }
}
const tabs = (p) => p.evaluate(() => [...document.querySelectorAll('.tabrail .ptab')].map((b) => b.dataset.id));

await test('a six-chapter journey: five tabs as before; shiritori on Company', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { edition: 1 });
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('.tabrail');
  assert(JSON.stringify(await tabs(p)) === JSON.stringify(['journey', 'words', 'satchel', 'map', 'company']), 'five tabs: ' + (await tabs(p)));
  assert(await p.evaluate(() => RB.ui.menu.current().section === 'journey'), 'asking for Distractions opens the Journey');
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('[data-co-sec="wordplay"]');
  assert(await p.evaluate(() => !!document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"], [data-co-sec="wordplay"][data-wp-act="resume"]')), 'shiritori\'s card, with Play, on Company');
  await p.evaluate(() => RB.ui.menu.open('words'));
  await p.waitForSelector('.index');
  assert(!(await p.$('.index-sec')), 'the Words contents: one list, as before');
  await p.evaluate(() => { RB.game.s.flags.postgame = true; RB.ui.menu.open('keepsakes'); });
  await p.waitForSelector('[data-jv="keepsakes"]');
  assert(!(await p.$('.subnav.sub2')) && (await p.$$('[data-jv="fishing"]')).length === 1, 'the Journey\'s pages side by side, as before');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('a twelve-chapter journey: the tab, the index, a page; Play with Mio opens shogi and the Ledger comes back', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { edition: 2, flags: { postgame: true } });
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('.ds-list');
  assert((await tabs(p)).includes('distractions'), 'a sixth tab: Distractions');
  const items = await p.evaluate(() => [...document.querySelectorAll('.ds-item')].map((b) => b.dataset.ds));
  assert(items.join() === 'shiritori,shogi,fishing', 'the games met, in order: ' + items);
  await p.click('.ds-item[data-ds="shogi"]');
  await p.waitForSelector('.ds-page .ds-how');
  const page2 = await p.textContent('.ds-page');
  assert(/How to play/.test(page2) && /Fuku's bench/.test(page2) && /Your records/.test(page2), 'the page: how to play, where, records');
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio')));
  await p.screenshot({ path: path.join(out, 'shogi_page_desktop.png') });
  const play = await p.$('[data-ds-act="play"]');
  assert(play && !(await play.isDisabled()), 'Play with Mio, here and now');
  assert(/Play with Mio/.test(await play.textContent()), 'named for the companion');
  await play.click();
  await p.waitForSelector('.sg-ladder');
  assert(/with Mio/.test(await p.textContent('.sg-folio')), 'shogi, with Mio');
  await p.evaluate(() => RB.ui.shogi.close());
  // leaving the board: the Ledger is back on Distractions (the wait fails the test if it is not)
  await p.waitForFunction(() => RB.ui.menu.isOpen() && RB.ui.menu.current().section === 'distractions', null, { timeout: 8000 });
  // Company points here, and shiritori's card is on its page
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('[data-wp-act="distractions"]');
  assert(!(await p.$('.co-detail [data-wp-act="play"]')), 'no Play on Company in a twelve-chapter journey');
  await p.click('[data-wp-act="distractions"]');
  await p.waitForSelector('.ds-page .wp-card');
  assert(await p.evaluate(() => RB.ui.menu.current().section === 'distractions'), 'Open Distractions: shiritori\'s page, with its card');
  await p.screenshot({ path: path.join(out, 'shiritori_page_desktop.png') });
  // K10: the Words contents in three sections; the Journey's mementos under one entry
  await p.evaluate(() => RB.ui.menu.open('words'));
  await p.waitForSelector('.index-sec');
  const secs = await p.evaluate(() => [...document.querySelectorAll('.index-sec')].map((h) => h.textContent));
  assert(secs.length === 3 && /My learning/.test(secs[0]) && /Reference/.test(secs[1]) && /Practice/.test(secs[2]), 'Words: My learning, Reference, Practice: ' + secs.join(' / '));
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio')));
  await p.screenshot({ path: path.join(out, 'words_sections.png') });
  await p.evaluate(() => RB.ui.menu.open('fishing'));
  await p.waitForSelector('.subnav.sub2');
  const row1 = await p.evaluate(() => [...document.querySelectorAll('.subnav:not(.sub2) [data-jv]')].map((b) => b.textContent.trim()));
  const row2 = await p.evaluate(() => [...document.querySelectorAll('.subnav.sub2 [data-jv]')].map((b) => b.dataset.jv));
  assert(row1.includes('Mementos') && !row1.includes('Fishing notes') && row2.includes('keepsakes') && row2.includes('fishing'), 'Journey: one Mementos entry, its pages below: ' + row1.join(', ') + ' | ' + row2.join(', '));
  await p.screenshot({ path: path.join(out, 'journey_mementos.png') });
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('phone width: index, page, back; nothing wider than the screen', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await start(p, { edition: 2, flags: { postgame: true } });
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('.ds-list');
  assert(await noOverflow(p), 'the index fits');
  await p.screenshot({ path: path.join(out, 'index_phone.png') });
  await p.click('.ds-item[data-ds="fishing"]');
  await p.waitForSelector('.ds-page');
  assert(!(await p.$('.ds-list')), 'one page at a time');
  assert(await noOverflow(p), 'the page fits');
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio')));
  await p.screenshot({ path: path.join(out, 'fishing_page_phone.png') });
  await p.click('[data-ds-act="index"]');
  await p.waitForSelector('.ds-list');
  await p.click('.ds-item[data-ds="shogi"]');
  await p.waitForSelector('.ds-page');
  await p.keyboard.press('Escape');
  await p.waitForSelector('.ds-list');
  assert(await p.evaluate(() => RB.ui.menu.isOpen()), 'Back: to the index, the Ledger still open');
  await p.click('[data-ds="fishing"]');
  await p.click('[data-ds-act="notes"]');
  // Open your Fishing notes: the Journey's page (the wait fails the test if not)
  await p.waitForFunction(() => RB.ui.menu.current().section === 'journey' && RB.ui.menu.current().journey === 'fishing', null, { timeout: 8000 });
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('Fuku\'s bench: a game offered after her nameplate, in a twelve-chapter journey only', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const atBench = async () => {
    await p.evaluate(() => { RB.test.place(40, 9, 'up'); RB.world.W.player.dir = 'up'; });
    await p.waitForTimeout(150);
    await p.evaluate(() => RB.world.interact());
    await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 8000 });
  };
  // six chapters: the bench as it was
  await start(p, { edition: 1, map: 'sg.harbor', x: 40, y: 10, seaglass: true, flags: { ch2_done: true } });
  await atBench();
  const said = [];
  for (let i = 0; i < 60; i++) {
    const st = await p.evaluate(() => ({ cur: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown().en : null, ch: document.querySelectorAll('.choice').length, run: RB.script.isRunning() }));
    assert(!st.ch, 'no question in a six-chapter journey');
    if (st.cur && said[said.length - 1] !== st.cur) said.push(st.cur);
    if (!st.cur && !st.run) break;
    await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  assert(said.length === 1 && /old bench/.test(said[0]), 'the bench, and nothing more: ' + said.join(' / '));
  // twelve chapters
  await start(p, { edition: 2, map: 'sg.harbor', x: 40, y: 10, seaglass: true, flags: { ch2_done: true } });
  await atBench();
  for (let i = 0; i < 60 && !(await p.$('.choice')); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); }
  const ch = await p.evaluate(() => [...document.querySelectorAll('.choice')].map((b) => b.textContent));
  assert(ch.some((x) => /Yes, please/.test(x)), 'Fuku offers a game: ' + ch.join(' | '));
  await p.screenshot({ path: path.join(out, 'fuku_offer.png') });
  await p.evaluate(() => [...document.querySelectorAll('.choice')].find((b) => /Yes, please/.test(b.textContent)).click());
  for (let i = 0; i < 40 && !(await p.$('.sg-ladder')); i++) { if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
  await p.waitForSelector('.sg-ladder', { timeout: 8000 });
  assert(/with Fuku/.test(await p.textContent('.sg-folio')), 'the board opens, with Fuku');
  assert(/How hard Fuku plays/.test(await p.textContent('.sg-level')), 'and Fuku is the one across the board');
  await p.evaluate(() => RB.ui.shogi.close());
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
