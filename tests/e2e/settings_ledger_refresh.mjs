// RBN-QA-167 (Agnes 6378770182; Local CL-260): a setting changed on the Settings sheet opened over the Ledger (Town
// hints, Finding the way) left the page under it drawn as before until the Ledger was closed and opened again. In
// Chromium on the built game, with a throwaway journey in Saltglass that can travel to Reedwake (its flood stone
// noticed and openable, Chapter 1's stamp earned: the pilot's line in Places and its tag on the Map), a quest followed
// and enough quests open for the Journey's list to scroll. (The "has changed since you were last there" lines, which
// Agnes saw stay, are drawn in the same Places block behind the same setting; this journey has no town beats.)
//  1. the Journey's Places, Town hints Off then Back (the sheet's own button): the Ledger still open, the same frame and
//     page, its scroll kept; the town line gone at once; then Shown and Escape: back again;
//  2. the Map's chart, the same: Reedwake's tag gone, then back; the chart still the chart;
//  3. the Journey's quests, Finding the way off then Back: the followed quest no longer marked; full and Escape: marked
//     again;
//  4. after each, the focus is somewhere usable (inside the Ledger), and the journey itself is as it was just before;
//  5. Settings opened on their own (no Ledger) and closed: no Ledger opens;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/settings_ledger_refresh.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const PAST = { departed: true, rw_arrived: true, rw_met_tsuru: true, ch1_done: true, learn_wait: true };

const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async (flags) => {
  const s = RB.game.debugStart('sg.harbor', 20, 14, { dir: 'down', edition: RB.edition.forNew(), flags });
  s.travel = { reedwake: true, saltglass: true };
  if (s.world) Object.assign(s.world.sealed, { rw_floodstone: 'noticed' });
  // enough side quests open for the Journey's list to scroll
  Object.keys(RB.content.quests).filter((q) => !RB.content.quests[q].main).slice(0, 30).forEach((q, i) => { s.quests[q] = { stage: 0, done: false, t: i + 1 }; });
  // a quest followed
  if (!RB.questGuide.followed(s)) {
    const id = Object.keys(RB.content.quests).find((q) => !RB.content.quests[q].main);
    s.quests[id] = { stage: 0, done: false, t: 1 };
    RB.questGuide.follow(id);
  }
  RB.game.settings.textSpeed = 'instant'; RB.game.settings.townHints = 'on'; RB.game.settings.questGuide = 'full';
  RB.save.autosave = async () => {};
  RB.game.saveSettings = async () => {}; // (the throwaway page's settings are not written)
  await new Promise((r) => setTimeout(r, 600));
}, PAST);

const wait = (ms) => p.waitForTimeout(ms || 250);
// the open Ledger: its frame (marked once), the page it is on, its first leaf's scroll, what it shows
const ledger = () => p.evaluate(() => {
  const fr = document.querySelector('#folio-page') && document.querySelector('#folio-page').closest('.folio');
  const leaf = fr && fr.querySelector('.leaf');
  const txt = fr ? fr.textContent : '';
  const ae = document.activeElement;
  return {
    open: RB.ui.menu.isOpen(), mark: fr ? fr.dataset.qa167 || null : null, cur: RB.ui.menu.current(), scroll: leaf ? leaf.scrollTop : null,
    lines: document.querySelectorAll('.ret-line').length, changed: /has changed since you were last there/.test(txt), tags: document.querySelectorAll('.ret-tag').length,
    followed: document.querySelectorAll('.entry.followed, .ftag').length, focus: !!(ae && fr && fr.contains(ae)),
  };
});
const openLedger = async (sec) => {
  await p.evaluate((sec) => { RB.ui.menu.close(); RB.ui.menu.open(sec); }, sec);
  await wait(400);
  await p.evaluate(() => { const fr = document.querySelector('#folio-page').closest('.folio'); fr.dataset.qa167 = 'same'; const leaf = fr.querySelector('.leaf'); if (leaf) leaf.scrollTop = 40; });
  await wait(100);
};
// Settings from the Ledger's own button, one of its radios set, then closed by the sheet's own button or Escape
const viaSettings = async (key, value, how) => {
  await p.locator('[data-util="settings"]').first().click();
  await wait(300);
  await p.evaluate(() => RB.ui.settings.tab('play'));
  await wait(200);
  const set = await p.evaluate(([key, value]) => {
    const r = document.querySelector('input[type=radio][data-set="' + key + '"][value="' + value + '"]');
    if (!r) return 'no radio';
    r.click();
    return RB.game.settings[key];
  }, [key, value]);
  await wait(200);
  if (how === 'escape') await p.keyboard.press('Escape');
  else await p.evaluate(() => { const sp = document.querySelector('#settings-page'); const c = sp && sp.closest('.folio').querySelector('[data-folio-close]'); if (c) c.click(); });
  await wait(400);
  return { set, settingsOpen: await p.evaluate(() => RB.ui.settings.isOpen()) };
};
// (the journey just before and just after each visit to Settings: opening a page may set up its own records)
const journey = () => p.evaluate(() => { const s = Object.assign({}, RB.game.s); delete s.playtime; return JSON.stringify(s); });
const same = [];
const around = async (fn) => { const j0 = await journey(); const r = await fn(); same.push((await journey()) === j0); return r; };
const fmt = (o) => JSON.stringify(o);

// ---- 1. the Journey's Places
{
  await openLedger('journey');
  const a = await ledger();
  const off = await around(() => viaSettings('townHints', 'off', 'back'));
  const z = await ledger();
  const on = await around(() => viaSettings('townHints', 'on', 'escape'));
  const y = await ledger();
  ok(a.lines === 1 && a.scroll > 0, 'the Journey\'s Places shows the pilot\'s line, and the page is scrolled (' + fmt(a) + ')');
  ok(off.set === 'off' && !off.settingsOpen && z.open && z.mark === 'same' && z.cur.section === 'journey' && z.scroll === a.scroll && !z.lines && z.focus,
    'Town hints Off, then Back: the Ledger still open on the same page and frame, its scroll kept, the town line gone at once, the focus in the Ledger (' + fmt({ off, z }) + ')');
  ok(on.set === 'on' && !on.settingsOpen && y.open && y.mark === 'same' && y.scroll === a.scroll && y.lines === 1 && y.focus,
    'Shown again, then Escape: the line back at once, the same page and frame, the scroll kept (' + fmt({ on, y }) + ')');
}
// ---- 2. the Map's chart
{
  await openLedger('map');
  const a = await ledger();
  const off = await around(() => viaSettings('townHints', 'off', 'back'));
  const z = await ledger();
  const on = await around(() => viaSettings('townHints', 'on', 'escape'));
  const y = await ledger();
  ok(a.tags === 1 && off.set === 'off' && z.open && z.mark === 'same' && z.cur.section === 'map' && z.cur.map === a.cur.map && !z.tags && z.focus &&
    on.set === 'on' && y.tags === 1 && y.cur.map === a.cur.map && y.mark === 'same',
    'the Map: Reedwake\'s tag gone at once with Town hints Off and back with Shown; the chart still the chart, the same frame (' + fmt({ a, z, y }) + ')');
}
// ---- 3. Finding the way
{
  await openLedger('journey');
  const a = await ledger();
  const off = await around(() => viaSettings('questGuide', 'off', 'back'));
  const z = await ledger();
  const on = await around(() => viaSettings('questGuide', 'full', 'escape'));
  const y = await ledger();
  ok(a.followed > 0 && off.set === 'off' && z.open && z.mark === 'same' && z.cur.section === 'journey' && z.scroll === a.scroll && z.followed === 0 && z.focus &&
    on.set === 'full' && y.followed === a.followed && y.mark === 'same',
    'Finding the way off, then Back: the followed quest no longer marked at once; full and Escape: marked again; the same page and frame, its scroll kept (' + fmt({ a, z, y }) + ')');
}
// ---- 4. the journey unchanged
ok(same.length === 6 && same.every(Boolean), 'the journey itself as it was just before each of the six visits to Settings (' + fmt(same) + ')');
// ---- 5. Settings on their own
{
  await p.evaluate(() => RB.ui.menu.close());
  await wait(300);
  await p.evaluate(() => RB.ui.settings.open());
  await wait(300);
  await p.evaluate(() => RB.ui.settings.tab('play'));
  await p.evaluate(() => { const r = document.querySelector('input[type=radio][data-set="townHints"][value="off"]'); if (r) r.click(); });
  await wait(200);
  await p.keyboard.press('Escape');
  await wait(400);
  const st = await p.evaluate(() => ({ menu: RB.ui.menu.isOpen(), settings: RB.ui.settings.isOpen(), hints: RB.game.settings.townHints }));
  ok(!st.menu && !st.settings && st.hints === 'off', 'Settings opened on their own and closed: no Ledger opens (' + fmt(st) + ')');
}
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close();
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
