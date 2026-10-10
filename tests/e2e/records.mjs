// The journey's records on screen (expansion P06; src/ui/66c_records.js, 66d_ngplus.js), in Chromium on the built
// game, with throwaway sessions:
//  - a six-chapter journey: no Stamp book or Travel volume in the Journey; no Travel volume on the title;
//  - a twelve-chapter journey: the stamp book (a chapter's stamp ready, pressed at its town's stand), the travel
//    volume (the seal designed and kept; a page veiled until its moment; "Watch it again" plays and changes
//    nothing in the journey);
//  - the Main Menu's volume with the development switch: veiled pages, a chapter revealed after a confirmation,
//    kept by the device across a reload, veiled again;
//  - New Game+ from the end: the slot chosen, the ending companion's farewell, the new journey with the records;
//  - phone width: no horizontal overflow; captures; no errors, no network.
// Usage: node tests/e2e/records.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'records');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function start(p, edition) {
  await p.evaluate((ed) => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } });
    s.edition = ed; s.player.nameJp = 'ハル';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
  }, edition);
  await p.waitForTimeout(400);
}
const journeyTabs = (p) => p.evaluate(() => [...document.querySelectorAll('.folio [data-jv]')].map((b) => b.getAttribute('data-jv')));
async function settle(p) {
  for (let i = 0; i < 100; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode() }));
    if (!st.dlg && st.mode === 'world') return;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(80);
  }
}

await test('a six-chapter journey: the Ledger and the title as they were', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  assert(!(await p.evaluate(() => !!document.querySelector('.title [data-a="volume"]'))), 'no Travel volume on the title');
  await start(p, 1);
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await p.waitForTimeout(250);
  const tabs = await journeyTabs(p);
  assert(tabs.indexOf('stamps') < 0 && tabs.indexOf('volume') < 0, 'no Stamp book or Travel volume: ' + tabs.join(', '));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('a twelve-chapter journey: a stamp pressed at its stand; the seal; a page witnessed and watched again, changing nothing', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 2);
  await p.evaluate(() => { RB.game.s.flags.ch1_done = true; RB.ui.menu.open('stamps'); });
  await p.waitForSelector('.rb-stamps');
  assert(await p.evaluate(() => document.querySelector('[data-stamp="ch.rw"]').classList.contains('ready')), 'Reedwake\'s stamp: earned, ready at its stand');
  assert(await p.evaluate(() => /press it at the stand in Reedwake/.test(document.querySelector('[data-stamp="ch.rw"]').textContent)), 'it says where');
  await p.screenshot({ path: path.join(out, 'stamps_desktop.png') });
  await p.evaluate(() => RB.ui.menu.close());
  // the stand in the square
  await p.evaluate(() => { const st = RB.content.stampStands.reedwake; RB.test.place(st.x, st.y + 1, 'up'); });
  await p.waitForTimeout(200);
  await p.evaluate(() => RB.world.interact());
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 8000 });
  assert(/press the stamp/.test(await p.evaluate(() => RB.ui.dialogue.shown().en)), 'pressed at the stand');
  await settle(p);
  assert(await p.evaluate(() => !!RB.game.s.records.stamps['ch.rw'] && RB.game.s.records.stamps['ch.rw'].at === 'reedwake'), 'recorded once, with where');
  // the travel volume: the seal
  await p.evaluate(() => RB.ui.menu.open('volume'));
  await p.waitForSelector('[data-a="seal-edit"]');
  await p.click('[data-a="seal-edit"]');
  await p.click('input[name="rb-frame"][value="square"]');
  await p.click('input[name="rb-kana"][value="ル"]');
  await p.click('[data-a="seal-save"]');
  await p.waitForTimeout(200);
  assert(await p.evaluate(() => { const d = RB.game.s.player.seal; return d && d.frame === 'square' && d.kana === 'ル'; }), 'the seal is kept');
  // a page before its moment: only its criteria
  const veiled = await p.evaluate(() => [...document.querySelectorAll('.rb-pg.veiled')].map((x) => x.textContent));
  assert(veiled.length > 0 && veiled.every((t) => /Chapter \d/.test(t)), 'pages not yet reached show only their criteria');
  assert(await p.evaluate(() => !document.querySelector('.rb-pg.veiled canvas')), 'never their picture');
  // a chapter finished: its page viewable; witnessed carries the seal
  await p.evaluate(() => { RB.game.s.seq['ch1.bridge'] = { n: 1, h: [] }; RB.ui.menu.close(); RB.ui.menu.open('volume'); });
  await p.waitForSelector('.rb-pg.witnessed .rb-mark');
  await p.screenshot({ path: path.join(out, 'volume_desktop.png') });
  const before = await p.evaluate(() => { const s = JSON.parse(JSON.stringify(RB.game.s)); delete s.playtime; return JSON.stringify(s); });
  await p.click('[data-a="watch"][data-page="ch1.bridge"]');
  await p.waitForSelector('.seq-view', { timeout: 8000 });
  for (let k = 0; k < 6; k++) { await p.evaluate(() => { const n = document.querySelector('.seq-view [data-a="next"]'); if (n) n.click(); }); await p.waitForTimeout(500); }
  await p.evaluate(() => { const c = document.querySelector('.seq-view [data-a="skip"]'); if (c) c.click(); });
  await p.waitForFunction(() => !document.querySelector('.seq-view'), null, { timeout: 8000 });
  const after = await p.evaluate(() => { const s = JSON.parse(JSON.stringify(RB.game.s)); delete s.playtime; return JSON.stringify(s); });
  assert(after === before, 'watching it again changed nothing in the journey');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('the Main Menu\'s volume: veiled, a chapter revealed and kept by the device, veiled again', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url + '?edition=12', { context: ctx });
  await p.waitForSelector('.title [data-a="volume"]');
  await p.click('.title [data-a="volume"]');
  await p.waitForSelector('.folio-volume .rb-pages');
  const v0 = await p.evaluate(() => document.querySelectorAll('.folio-volume .rb-pg.veiled').length);
  assert(v0 >= 13, 'with no journey, the pages are veiled (' + v0 + ')');
  await p.screenshot({ path: path.join(out, 'menu_veiled.png') });
  await p.click('.folio-volume [data-a="revealch"][data-ch="1"]');
  await p.waitForSelector('.confirm-scrim button');
  assert(/Chapter 1/.test(await p.evaluate(() => document.querySelector('.confirm-scrim').textContent)), 'the confirmation names the chapter');
  await p.evaluate(() => [...document.querySelectorAll('.confirm-scrim button')].find((x) => /Reveal/.test(x.textContent)).click());
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => !!document.querySelector('.folio-volume [data-a="watch"][data-page="ch1.bridge"]')), 'Chapter 1 revealed');
  assert(await p.evaluate(() => document.querySelectorAll('.folio-volume .rb-pg.veiled').length) === v0 - 1, 'only it');
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.waitForSelector('.title [data-a="volume"]');
  await p.click('.title [data-a="volume"]');
  await p.waitForSelector('.folio-volume .rb-pages');
  assert(await p.evaluate(() => !!document.querySelector('.folio-volume [data-a="reveil"][data-page="ch1.bridge"]')), 'kept by the device after a reload');
  await p.click('.folio-volume [data-a="reveil"][data-page="ch1.bridge"]');
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => document.querySelectorAll('.folio-volume .rb-pg.veiled').length) === v0, 'veiled again');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('New Game+ from the end: the slot, the farewell, a new journey with the records', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 2);
  await p.evaluate(() => { const s = RB.game.s; s.flags.postgame = true; s.flags.ngp_offered = true; s.flags.ch1_done = true; RB.stampBook.pressAt(s, 'reedwake'); s.seq['ch1.bridge'] = { n: 1, h: [] }; RB.ui.menu.open('volume'); });
  await p.waitForSelector('[data-a="ngplus"]');
  await p.click('[data-a="ngplus"]');
  await p.waitForSelector('.folio-ngplus [data-slot="2"]');
  await p.click('.folio-ngplus [data-slot="2"]');
  const said = [];
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cur: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown() : null, ng: RB.game.s && RB.game.s.ngplus }));
    if (st.ng === 1) break;
    if (st.cur && (!said.length || said[said.length - 1].en !== st.cur.en)) said.push(st.cur);
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(120);
  }
  assert(said.length >= 3 && said.slice(0, -1).every((l) => l.who === 'mio'), 'the ending journey\'s companion says goodbye: ' + said.map((l) => l.who + ': ' + l.en).join(' / '));
  const n = await p.evaluate(() => ({ ng: RB.game.s.ngplus, comp: RB.game.s.comp, stamp: !!RB.game.s.records.stamps['ch.rw'], seq: !!RB.game.s.seq['ch1.bridge'], slot: RB.save.current().slot, done: !!RB.game.s.flags.postgame }));
  assert(n.ng === 1 && !n.comp && n.stamp && n.seq && n.slot === 2 && !n.done, 'a new journey in slot 2, with the stamps and the volume, not the story: ' + JSON.stringify(n));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('New Game+ into another journey\'s slot: asked first; Choose again changes nothing; the farewell is the ending journey\'s; the origin slot untouched', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 2);
  const ids = await p.evaluate(async () => {
    const s = RB.game.s;
    s.flags.postgame = true; s.flags.ngp_offered = true; s.flags.ch1_done = true;
    await RB.save.manualSave(1);
    const other = JSON.parse(JSON.stringify(s));
    other.id = 'other-journey'; other.comp = 'ren'; other.player.name = 'Kai'; other.flags = { departed: true };
    await RB.save.writeSlot(3, other);
    return { origin: s.id };
  });
  await p.evaluate(() => RB.ui.menu.open('volume'));
  await p.waitForSelector('[data-a="ngplus"]');
  await p.click('[data-a="ngplus"]');
  await p.waitForSelector('.folio-ngplus [data-slot="3"]');
  assert(/erased/.test(await p.textContent('.folio-ngplus [data-slot="3"]')), 'another journey\'s slot says it will be erased');
  await p.click('.folio-ngplus [data-slot="3"]');
  await p.waitForSelector('.confirm-scrim button');
  assert(/Kai's journey/.test(await p.textContent('.confirm-scrim')), 'asked first, naming whose journey it erases');
  await p.evaluate(() => [...document.querySelectorAll('.confirm-scrim button')].find((x) => /Choose again/.test(x.textContent)).click());
  await p.waitForSelector('.folio-ngplus [data-slot="3"]');
  assert(await p.evaluate(async () => { const r = await RB.save.read(3, 'manual'); return r && r.state && r.state.id === 'other-journey'; }), 'Choose again: slot 3 untouched');
  await p.click('.folio-ngplus [data-slot="3"]');
  await p.waitForSelector('.confirm-scrim button');
  await p.evaluate(() => [...document.querySelectorAll('.confirm-scrim button')].find((x) => /Erase and begin/.test(x.textContent)).click());
  const said = [];
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cur: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown() : null, ng: RB.game.s && RB.game.s.ngplus }));
    if (st.ng === 1) break;
    if (st.cur && (!said.length || said[said.length - 1].en !== st.cur.en)) said.push(st.cur);
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(120);
  }
  assert(said.length >= 3 && said.slice(0, -1).every((l) => l.who === 'mio'), 'the farewell is the ending journey\'s companion\'s (Mio), not the erased one\'s (Ren): ' + said.map((l) => l.who).join(','));
  const after = await p.evaluate(async (ids) => {
    const rd = async (n) => { try { return (await RB.save.read(n, 'manual')).state; } catch (e) { return null; } };
    const one = await rd(1), three = await rd(3);
    // slot 3: the erased journey is gone; the new one is there once it is first saved
    return { cur: RB.save.current().slot, ng: RB.game.s.ngplus, oneId: one && one.state === undefined ? one.id : one && one.id, onePost: !!(one && one.flags.postgame), threeOld: !!(three && three.id === 'other-journey') };
  }, ids);
  assert(after.cur === 3 && after.ng === 1 && after.oneId === ids.origin && after.onePost && !after.threeOld, 'the new journey is in slot 3, Kai\'s is gone; the finished journey in slot 1 is as it was: ' + JSON.stringify(after));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('the Main Menu\'s volume with saves: the Continue journey\'s seals and look, fixed while open', async () => {
  const { p, errors, ctx } = await page(b, url + '?edition=12', { viewport: { width: 1280, height: 800 } });
  await p.waitForSelector('.title [data-a="volume"]');
  // two journeys: an older one in slot 1 and the Continue one in slot 5 (saved last), each a real game state; the
  // lower slot first, so a volume that ignored the save times would show the wrong journey
  await p.evaluate(async () => {
    const mk = async (slot, id, name, kana, frame) => {
      const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true, ch1_done: true } });
      s.edition = 2; s.id = id; s.player.name = name; s.player.nameJp = kana;
      s.seq['ch1.bridge'] = { n: 1, h: [] };
      RB.seal.set(s, { frame, kana: kana.slice(0, 1), style: 'fine' });
      await RB.save.writeSlot(slot, s);
      await new Promise((r) => setTimeout(r, 30));
    };
    await mk(1, 'menu-older', 'Ao', 'アオ', 'round');
    await mk(5, 'menu-cont', 'Haru', 'ハル', 'gourd');
  });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.waitForSelector('.title [data-a="volume"]');
  await p.click('.title [data-a="volume"]');
  await p.waitForSelector('.folio-volume .rb-pages');
  assert(/With the Continue journey/.test(await p.textContent('.folio-volume')), 'with a save: the Continue journey\'s seals');
  assert(await p.evaluate(() => { const pg = document.querySelector('.folio-volume [data-page="ch1.bridge"]'); const card = pg && pg.closest('.rb-pg'); return !!card && !card.classList.contains('veiled') && !!card.querySelector('.rb-mark'); }), 'a page that journey witnessed: open, with its seal');
  assert(await p.evaluate(() => /ハ/.test(document.querySelector('.folio-volume .rb-pg .rb-mark').innerHTML) && !/>ア</.test(document.querySelector('.folio-volume .rb-pg .rb-mark').innerHTML)), 'the seal is the Continue journey\'s (saved last), not the older one\'s');
  // a newer save written while the volume is open does not change what it shows
  const before = await p.evaluate(() => document.querySelector('.folio-volume .rb-pages').innerHTML.length);
  await p.evaluate(async () => { const s = RB.state.newCampaign({ edition: 2 }); s.id = 'menu-two'; s.player.name = 'Ao'; await RB.save.writeSlot(4, s); });
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => document.querySelector('.folio-volume .rb-pages').innerHTML.length) === before, 'fixed while open');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('phone width: the stamp book and the volume fit', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  await start(p, 2);
  for (const pg of ['stamps', 'volume']) {
    await p.evaluate((pg) => { RB.ui.menu.close(); RB.ui.menu.open(pg); }, pg);
    await p.waitForTimeout(400);
    assert(await noOverflow(p), pg + ': no horizontal overflow');
    await p.screenshot({ path: path.join(out, pg + '_phone.png') });
  }
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
