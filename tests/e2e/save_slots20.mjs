// The Inn Ledger with twenty slots (CC-241; Robin 6398218197, 6398223467, 6398253172; Agnes 6398244696, 6398364186;
// Local CL-381). In Chromium on the built game, with real clicks, taps and keys, isolated contexts and synthetic saves
// only (never a player's saves):
//  1. compatibility first: CC-023's own page (RB_OLD_PAGE, default zz_cc023.html beside index.html, its sha256 checked)
//     makes six manual saves with autosaves, a pre-departure point and a suspend; then this page opens in the same
//     storage: every `slots` and `recovery` record is byte-equal to before (thumbnails included), before and after the
//     ledger reads them; slots 7–20 list as empty; nothing is migrated;
//  2. the ledger in pages of six behind the book's paper tabs (1–6, 7–12, 13–18, 19–20): names, counts and marks,
//     the list numbering, the leaves' labels, the last page holding only 19 and 20; Left/Right/Home/End keep focus on
//     the selected tab; taps at 390×844; the page and an open Manage kept across the 860 px change; across the spread's
//     own breakpoint alone (800 → 700 → 800 px) the page, focus on slot 20's Load, slot 19 visible, slot 20 actionable;
//  3. New Game opens on the first empty slot's page and starts in slot 7; a journey saved into slot 15 from the game
//     (focus then on slot 15's own control), loaded after a reload (Load opens on the newest's page);
//  4. Copy: one line for each of the other nineteen slots (integer ids, never the source, slot 20 included); Escape
//     and Cancel choose none and put focus back on the source slot's Copy, the next choice is the one used; copying
//     onto a used slot replaces it only after its confirmation; Delete and the overwrite confirmation ask first; New
//     Game+'s list of twenty keeps its origin warning;
//  5. the two compact lists by keyboard alone: Tab along Copy's list and New Game+'s, Escape (none), reopened, Tab and
//     Enter (the target used is the one reached), focus never leaving the open list;
//  6. cross-tab: slot 12 owned by one tab opens read-only in the other;
//  7. localStorage only (IndexedDB blocked), the store forced full: a save fails visibly, nothing says it saved, the
//     protected records are unchanged;
//  8. storage.estimate() after twenty realistic slots (reported: IndexedDB headroom, not a fallback capacity claim).
// Captures for review go to tests/e2e/out/save_slots20/ (not committed).
// Usage: node tools/build.mjs && node tests/e2e/save_slots20.mjs [filter]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { serve, launch, page } from './lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(root, 'tests', 'e2e', 'out', 'save_slots20');
fs.mkdirSync(OUT, { recursive: true });
const OLD = process.env.RB_OLD_PAGE || 'zz_cc023.html';
const OLD_SHA = '4d84f2915324cc6bccfab1a5183ccbfa1c57b9c144ae22a299c228ffb03c0bf9'; // CC-023, published 2026-10-25
const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String((e && e.message) || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

// synthetic journeys from real content ids; kinds: recovery records written beside the manual save
async function seed(p, slots, kinds) {
  await p.evaluate(async ([slots, kinds]) => {
    const maps = [['rw.village', 22, 30, 'nao'], ['sg.harbor', 20, 22, 'mio'], ['co.village', 20, 18, 'ren'], ['sb.hamlet', 20, 20, 'suzu'], ['lf.town', 26, 20, 'mio'], ['sa.camp', 10, 10, 'ren']];
    for (let k = 0; k < slots.length; k++) {
      const n = slots[k], [m, x, y, c] = maps[k % maps.length];
      const s = RB.game.debugStart(m, x, y, { edition: RB.edition.forNew(), comp: c, profile: 'E', flags: { departed: true } });
      s.player.name = 'Traveller ' + n; s.chapter = 1 + (k % 6); s.playtime = 600 * (k + 1) + 7;
      await new Promise((r) => setTimeout(r, 40));
      const thumb = RB.render.thumbnail();
      await RB.save.writeSlot(n, s, { force: true, thumb });
      for (const kind of kinds || []) {
        s.playtime += 60;
        await new Promise((r) => setTimeout(r, 5));
        await RB.save.writeRecovery(n, s, kind, thumb);
      }
    }
    await RB.game.toTitle();
  }, [slots, kinds || []]);
}
// every `slots` and `recovery` record as stored, by key
const raw = (p) => p.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('road-of-borrowed-names'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const all = (st) => new Promise((res, rej) => { const q = db.transaction(st, 'readonly').objectStore(st).getAll(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  const out = {};
  for (const st of ['slots', 'recovery']) for (const r of await all(st)) out[st + ':' + (st === 'slots' ? r.slot : r.key)] = JSON.stringify(r);
  db.close();
  return out;
});
const ledger = (p) => p.evaluate(() => ({
  tabs: [...document.querySelectorAll('.folio-ledger .ptab')].map((t) => ({ sel: t.getAttribute('aria-selected') === 'true', name: t.getAttribute('aria-label'), text: t.textContent.replace(/\s+/g, ' ').trim() })),
  slots: [...document.querySelectorAll('.folio-ledger .rec')].map((r) => +r.dataset.slot),
  ols: [...document.querySelectorAll('.folio-ledger ol.ledger')].map((o) => o.start),
  leaves: [...document.querySelectorAll('.folio-ledger .leaf')].map((l) => l.getAttribute('aria-label')),
  meta: (document.querySelector('.folio-ledger .meta') || {}).textContent || '',
  panel: (document.querySelector('.folio-ledger .leafbox') || {}).getAttribute && document.querySelector('.folio-ledger .leafbox').getAttribute('aria-labelledby'),
  focus: (() => { const a = document.activeElement; return a ? { tab: a.classList.contains('ptab') ? a.getAttribute('aria-label') : null, slot: a.closest('[data-slot]') ? +a.closest('[data-slot]').dataset.slot : null, a: a.getAttribute('data-a') } : null; })(),
}));
const until = (p, fn, arg) => p.waitForFunction(fn, arg, { timeout: 10000 });
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const snap = (p, name) => p.screenshot({ path: path.join(OUT, name + '.png') });

// ---------------------------------------------------------------------------------------------------------------------
await test('compatibility: CC-023 page\'s six saves and every recovery record unchanged here; slots 7–20 empty', async () => {
  const oldFile = path.join(root, OLD);
  assert(fs.existsSync(oldFile), 'the CC-023 page is needed beside index.html as ' + OLD + ' (RB_OLD_PAGE)');
  const sha = crypto.createHash('sha256').update(fs.readFileSync(oldFile)).digest('hex');
  assert(sha === OLD_SHA, OLD + ' is not CC-023\'s page: ' + sha.slice(0, 16));
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const O = await page(b, url + OLD, { context: ctx });
  const oldSlots = await O.p.evaluate(() => RB.save.SLOTS);
  assert(oldSlots === 6, 'the old page has ' + oldSlots + ' slots');
  await seed(O.p, [1, 2, 3, 4, 5, 6], ['auto', 'auto', 'predeparture']);
  await O.p.evaluate(async () => { const s = (await RB.save.read(4, 'manual')).state; await RB.save.writeRecovery(4, s, 'suspend', null); });
  const before = await raw(O.p);
  const keys = Object.keys(before).sort();
  assert(keys.filter((k) => k.startsWith('slots:')).length === 6 && keys.filter((k) => k.startsWith('recovery:')).length === 19, 'old records: ' + keys.join(','));
  // this page, the same origin and storage
  await O.p.goto(url);
  await O.p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 });
  const opened = await raw(O.p);
  const L = await O.p.evaluate(async () => (await RB.save.list()).map((x) => ({ slot: x.slot, empty: x.empty, manual: x.manual, name: x.meta && x.meta.name, auto: !!x.auto, pre: !!x.pre, sus: !!x.suspend })));
  await O.p.click('.title [data-a=load]');
  await O.p.waitForSelector('.folio-ledger .rec');
  await O.p.waitForTimeout(300);
  const read = await raw(O.p);
  const diff = (a, z) => Object.keys(Object.assign({}, a, z)).filter((k) => a[k] !== z[k]);
  assert(!diff(before, opened).length, 'records changed by opening this page: ' + diff(before, opened).join(','));
  assert(!diff(before, read).length, 'records changed by listing them: ' + diff(before, read).join(','));
  assert(L.length === 20, 'list length ' + L.length);
  for (const x of L.slice(0, 6)) assert(!x.empty && x.manual && x.name === 'Traveller ' + x.slot && x.auto && x.pre, 'slot ' + x.slot + ' as listed: ' + JSON.stringify(x));
  assert(L[3].sus && !L[2].sus, 'the suspend point not listed with slot 4 only');
  assert(L.slice(6).every((x) => x.empty && !x.manual && !x.auto && !x.pre), 'slots 7–20 not empty: ' + JSON.stringify(L.slice(6).filter((x) => !x.empty)));
  console.log('     ' + keys.length + ' records (' + keys.filter((k) => k.startsWith('slots:')).length + ' manual, ' + keys.filter((k) => k.startsWith('recovery:')).length + ' recovery), byte-equal; old page ' + OLD + ' ' + sha.slice(0, 16));
  assert(!O.errors.length, O.errors.slice(0, 3).join(' | '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------------------
await test('ledger pages: four paper tabs, counts and marks, numbering, the last page 19–20; keys keep focus on the tab; page and Manage kept across 860 px', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await seed(p, [1, 2, 3, 4, 5, 6, 9, 15, 20]);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(300);
  let g = await ledger(p);
  // Load opens on the newest journey's page (slot 20, written last)
  assert(g.tabs.length === 4 && g.tabs[3].sel && g.slots.join() === '19,20', 'Load did not open on 19–20: ' + JSON.stringify(g));
  assert(g.tabs.map((t) => t.name).join('|') === 'Slots 1 to 6, 6 in use|Slots 7 to 12, 1 in use|Slots 13 to 18, 1 in use|Slots 19 to 20, 1 in use, the most recent save', 'tab names: ' + g.tabs.map((t) => t.name).join('|'));
  assert(/^1–6/.test(g.tabs[0].text) && /^19–20/.test(g.tabs[3].text), 'tab labels: ' + g.tabs.map((t) => t.text).join('|'));
  assert(g.ols.join() === '19,20' && g.leaves.join('|') === 'Slot 19|Slot 20' && g.panel === 'tab-lp3', 'the last page\'s spread: ' + JSON.stringify(g));
  assert(/9 of 20 in use/.test(g.meta), 'count: ' + g.meta);
  assert(!(await p.locator('.folio-ledger .rec[data-slot="21"]').count()), 'a slot past 20 is drawn');
  await snap(p, 'desktop_p4');
  // keys on the tabs: focus stays on the selected tab
  await p.focus('.folio-ledger .ptab[aria-selected="true"]');
  const steps = [['Home', 0, '1,2,3,4,5,6', 'Slots 1 to 3|Slots 4 to 6', '1,4'], ['ArrowRight', 1, '7,8,9,10,11,12', 'Slots 7 to 9|Slots 10 to 12', '7,10'], ['End', 3, '19,20', 'Slot 19|Slot 20', '19,20'], ['ArrowLeft', 2, '13,14,15,16,17,18', 'Slots 13 to 15|Slots 16 to 18', '13,16']];
  for (const [key, i, slots, leaves, ols] of steps) {
    await p.keyboard.press(key);
    await p.waitForTimeout(150);
    g = await ledger(p);
    assert(g.tabs[i].sel && g.focus && g.focus.tab === g.tabs[i].name, key + ': focus not on the selected tab: ' + JSON.stringify(g.focus));
    assert(g.slots.join() === slots && g.leaves.join('|') === leaves && g.ols.join() === ols && g.panel === 'tab-lp' + i, key + ': ' + JSON.stringify(g));
  }
  await snap(p, 'desktop_p1_after_keys');
  // the page and an open Manage survive the wide/narrow change
  await p.click('.rec[data-slot="15"] [data-a=manage]');
  for (const vp of [{ width: 700, height: 800 }, { width: 1280, height: 800 }]) {
    await p.setViewportSize(vp);
    await p.waitForTimeout(350);
    g = await ledger(p);
    const mg = await p.getAttribute('.rec[data-slot="15"] [data-a=manage]', 'aria-expanded');
    assert(g.tabs[2].sel && g.slots.join() === '13,14,15,16,17,18' && mg === 'true', 'at ' + vp.width + ' px: ' + JSON.stringify({ g, mg }));
  }
  await p.keyboard.press('Escape');
  await until(p, () => !document.querySelector('.folio-ledger') && !!document.querySelector('.title'));
  // a phone: taps on the tabs, one leaf, nothing past the edge
  const pctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const P = await page(b, url, { context: pctx });
  await seed(P.p, [1, 2, 3, 4, 5, 6, 9, 15, 20]);
  await P.p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await P.p.tap('.title [data-a=load]');
  await P.p.waitForSelector('.folio-ledger .rec');
  await P.p.waitForTimeout(300);
  await P.p.tap('.folio-ledger .ptab >> nth=1');
  await P.p.waitForTimeout(200);
  g = await ledger(P.p);
  assert(g.tabs[1].sel && g.slots.join() === '7,8,9,10,11,12' && g.leaves.join('|') === 'Slots 7 to 12' && g.ols.join() === '7', 'phone page 2: ' + JSON.stringify(g));
  assert(await noOverflow(P.p), 'the phone ledger scrolls sideways');
  await snap(P.p, 'phone_p2');
  await P.p.tap('.folio-ledger .ptab >> nth=3');
  await P.p.waitForTimeout(200);
  g = await ledger(P.p);
  assert(g.slots.join() === '19,20' && g.leaves.join('|') === 'Slots 19 to 20', 'phone page 4: ' + JSON.stringify(g));
  await snap(P.p, 'phone_p4');
  assert(!errors.length && !P.errors.length, errors.concat(P.errors).slice(0, 3).join(' | '));
  await pctx.close();
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------------------
// across the spread's own breakpoint only (720 px; 1280 ↔ 700 above also crosses 860 px, which hid the fault): 800 → 700 →
// 800 keeps the page, focus on slot 20's own Load, slot 19 visible and slot 20's Load actionable (Agnes 6399945694;
// Local CL-387: the same fault hid slots 4–6 in CC-023)
await test('ledger at 800 → 700 → 800 px: the page, focus on slot 20\'s Load, slot 19 visible and slot 20 actionable across the spread breakpoint', async () => {
  const ctx = await b.newContext({ viewport: { width: 800, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await seed(p, [1, 2, 3, 4, 5, 6, 9, 15, 20]);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(300);
  await p.focus('.rec[data-slot="20"] [data-a=load]');
  for (const [w, leaves] of [[800, 'Slot 19|Slot 20'], [700, 'Slots 19 to 20'], [800, 'Slot 19|Slot 20']]) {
    await p.setViewportSize({ width: w, height: 800 });
    await p.waitForTimeout(350);
    const g = await ledger(p);
    const vis19 = await p.locator('.rec[data-slot="19"]').isVisible();
    const load20 = p.locator('.rec[data-slot="20"] [data-a=load]');
    let actionable = true;
    try { await load20.scrollIntoViewIfNeeded({ timeout: 1500 }); await load20.click({ trial: true, timeout: 1500 }); } catch (e) { actionable = false; }
    assert(g.tabs[3].sel && g.panel === 'tab-lp3' && g.slots.join() === '19,20' && g.leaves.join('|') === leaves, w + ' px: ' + JSON.stringify(g));
    assert(vis19 && actionable, w + ' px: slot 19 visible ' + vis19 + ', slot 20 Load actionable ' + actionable);
    const f = await ledger(p);
    assert(f.focus && f.focus.slot === 20 && f.focus.a === 'load', w + ' px: focus ' + JSON.stringify(f.focus));
  }
  assert(!errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
});

await test('New Game starts in slot 7 (its page opens); a journey saved into slot 15 from the game keeps focus there; loaded after a reload', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await seed(p, [1, 2, 3, 4, 5, 6]);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.click('.title [data-a=new]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(300);
  let g = await ledger(p);
  assert(g.tabs[1].sel && g.slots[0] === 7 && g.focus && g.focus.slot === 7 && g.focus.a === 'start', 'New Game did not open on slot 7: ' + JSON.stringify(g));
  await p.evaluate(() => { window.__began = null; RB.ui.create.begin = (n) => { window.__began = n; }; });
  await p.click('.rec[data-slot="7"] [data-a=start]');
  await until(p, () => window.__began != null);
  assert(await p.evaluate(() => window.__began) === 7, 'the new journey went to slot ' + await p.evaluate(() => window.__began));
  // from the game: Save → page 13–18 → slot 15
  await p.evaluate(() => { RB.game.debugStart('co.village', 20, 18, { edition: RB.edition.forNew(), comp: 'ren', profile: 'E', flags: { departed: true } }); RB.game.s.player.name = 'Fifteen'; });
  await p.waitForTimeout(300);
  await p.evaluate(() => RB.ui.menu.open());
  await p.click('[data-util=save]');
  await p.click('.sv-slip [data-a=save]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(200);
  await p.click('.folio-ledger .ptab >> nth=2');
  await p.waitForTimeout(150);
  await p.click('.rec[data-slot="15"] [data-a=save]');
  await until(p, () => /Fifteen/.test((document.querySelector('.rec[data-slot="15"]') || {}).innerText || ''));
  await p.waitForTimeout(200);
  g = await ledger(p);
  assert(g.tabs[2].sel && g.focus && g.focus.slot === 15 && g.focus.a === 'save', 'after saving, focus not on slot 15\'s own control: ' + JSON.stringify(g));
  assert(await p.evaluate(async () => { const l = await RB.save.list(); return l[14].manual && l[14].meta.name === 'Fifteen'; }), 'slot 15 not saved');
  await snap(p, 'desktop_saved_15');
  // a reload, then Load opens on the newest's page and loads it
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 });
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(300);
  g = await ledger(p);
  assert(g.tabs[2].sel && g.slots.includes(15), 'Load did not open on slot 15\'s page: ' + JSON.stringify(g));
  await p.click('.rec[data-slot="15"] [data-a=load]');
  await until(p, () => RB.game.s && RB.game.s.player.name === 'Fifteen' && RB.game.s.map === 'co.village' && RB.save.current().slot === 15);
  assert(!errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------------------
await test('Copy: the other nineteen in a compact list (integer ids, slot 20 included); Escape chooses none; replacing asks first; Delete and overwrite ask first; New Game+ lists twenty', async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const { p, errors } = await page(b, url, { context: ctx });
  await seed(p, [1, 2, 3, 4, 5, 6]);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.tap('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(250);
  const openCopy = async (n) => {
    if (!(await p.locator('.rec[data-slot="' + n + '"] [data-a=copy]').isVisible())) await p.tap('.rec[data-slot="' + n + '"] [data-a=manage]');
    await p.tap('.rec[data-slot="' + n + '"] [data-a=copy]');
    await p.waitForSelector('.folio-copyslot .ng-opt');
    await p.waitForTimeout(150);
  };
  await openCopy(3);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.folio-copyslot .ng-opt')].map((x) => ({ n: x.dataset.slot, t: x.textContent.replace(/\s+/g, ' ').trim() })));
  assert(rows.length === 19 && !rows.some((r) => r.n === '3') && rows.map((r) => +r.n).join() === [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].join() && rows.every((r) => /^\d+$/.test(r.n)), 'copy rows: ' + rows.map((r) => r.n).join());
  assert(/^Slot 20\s*Empty$/.test(rows[18].t) && /^Slot 1\s*Traveller 1 & Nao, Chapter 1: replaced, asked first$/.test(rows[0].t), 'row text: ' + rows[0].t + ' / ' + rows[18].t);
  assert(await noOverflow(p), 'the copy list scrolls sideways');
  await snap(p, 'phone_copy');
  await p.keyboard.press('Escape');
  await until(p, () => !document.querySelector('.folio-copyslot'));
  assert(await p.evaluate(async () => (await RB.save.list()).filter((x) => !x.empty).length) === 6, 'Escape copied something');
  // none chosen: focus back on slot 3's Copy, after Escape and after Cancel (Local CL-387)
  let gc = await ledger(p);
  assert(gc.focus && gc.focus.slot === 3 && gc.focus.a === 'copy', 'focus after Escape: ' + JSON.stringify(gc.focus));
  await openCopy(3);
  await p.tap('.folio-copyslot [data-folio-close]');
  await until(p, () => !document.querySelector('.folio-copyslot'));
  gc = await ledger(p);
  assert(gc.focus && gc.focus.slot === 3 && gc.focus.a === 'copy', 'focus after Cancel: ' + JSON.stringify(gc.focus));
  assert(await p.evaluate(async () => (await RB.save.list()).filter((x) => !x.empty).length) === 6, 'Cancel copied something');
  // the next choice is the one used: slot 15 (empty: no question), an independent journey
  await openCopy(3);
  await p.tap('.folio-copyslot .ng-opt[data-slot="15"]');
  await until(p, () => /Traveller 3/.test((document.querySelector('.rec[data-slot="15"]') || {}).innerText || ''));
  await p.waitForTimeout(200);
  let g = await ledger(p);
  assert(g.tabs[2].sel && g.focus && g.focus.slot === 15 && g.focus.a === 'manage', 'after the copy: ' + JSON.stringify(g));
  const ids = await p.evaluate(async () => [(await RB.save.read(3, 'manual')).state.id, (await RB.save.read(15, 'manual')).state.id]);
  assert(ids[0] && ids[1] && ids[0] !== ids[1], 'the copy is not independent');
  // onto a used slot: asked first; Cancel keeps it
  await p.tap('.folio-ledger .ptab >> nth=0');
  await p.waitForTimeout(150);
  await openCopy(2);
  await p.tap('.folio-copyslot .ng-opt[data-slot="15"]');
  await p.waitForSelector('[role=alertdialog]');
  assert(/Slot 15 is in use/.test(await p.textContent('[role=alertdialog]')), 'no replace question');
  await p.tap('[role=alertdialog] button:has-text("Cancel")');
  await p.waitForTimeout(150);
  assert(await p.evaluate(async () => (await RB.save.read(15, 'manual')).state.player.name) === 'Traveller 3', 'slot 15 replaced after Cancel');
  // Delete asks first
  await p.tap('.folio-ledger .ptab >> nth=2');
  await p.waitForTimeout(150);
  if (!(await p.locator('.rec[data-slot="15"] [data-a=delete]').isVisible())) await p.tap('.rec[data-slot="15"] [data-a=manage]');
  await p.tap('.rec[data-slot="15"] [data-a=delete]');
  await p.waitForSelector('[role=alertdialog]');
  assert(/cannot be undone/i.test(await p.textContent('[role=alertdialog]')), 'Delete did not ask');
  await p.tap('[role=alertdialog] button:has-text("Delete")');
  await until(p, () => /empty/i.test((document.querySelector('.rec[data-slot="15"]') || {}).innerText || ''));
  await p.keyboard.press('Escape');
  // from the game: overwriting a used slot asks first
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'nao', profile: 'E', flags: { departed: true } }); });
  await p.waitForTimeout(250);
  await p.evaluate(() => RB.ui.menu.open());
  await p.tap('[data-util=save]');
  await p.tap('.sv-slip [data-a=save]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.tap('.folio-ledger .ptab >> nth=0');
  await p.waitForTimeout(150);
  await p.tap('.rec[data-slot="2"] [data-a=manage]');
  await p.tap('.rec[data-slot="2"] [data-a=save]');
  await p.waitForSelector('[role=alertdialog]');
  assert(/Overwrite slot 2/.test(await p.textContent('[role=alertdialog]')), 'no overwrite question');
  await p.tap('[role=alertdialog] button:has-text("Cancel")');
  await p.waitForTimeout(150);
  assert(await p.evaluate(async () => (await RB.save.read(2, 'manual')).state.player.name) === 'Traveller 2', 'slot 2 overwritten after Cancel');
  await p.keyboard.press('Escape');
  // New Game+: every slot, the origin's own warning, keyboard to slot 20
  const pick = p.evaluate(async () => RB.ui.ngplus.chooseSlot(await RB.save.list(), 2));
  await p.waitForSelector('.folio-ngplus .ng-opt');
  const ng = await p.evaluate(() => [...document.querySelectorAll('.folio-ngplus .ng-opt')].map((x) => ({ n: +x.dataset.slot, t: x.textContent.replace(/\s+/g, ' ').trim() })));
  assert(ng.length === 20 && ng.map((r) => r.n).join() === Array.from({ length: 20 }, (_, i) => i + 1).join(), 'New Game+ rows: ' + ng.map((r) => r.n).join());
  assert(/This journey \(finished\): the new one takes its place/.test(ng[1].t) && /erased/.test(ng[0].t) && /Empty/.test(ng[19].t), 'New Game+ text: ' + ng[1].t + ' / ' + ng[0].t);
  await snap(p, 'phone_ngplus');
  await p.focus('.folio-ngplus .ng-opt[data-slot="20"]');
  await p.keyboard.press('Enter');
  assert(await pick === 20, 'New Game+ chose ' + await pick);
  assert(!errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
// the two compact lists by keyboard alone (Agnes 6399957399): Tab along Copy's list to slot 16, Escape (nothing copied,
// focus back on slot 3's Copy), Enter reopens it, Tab to slot 17, Enter: the copy is in 17, focus on its Manage; New
// Game+'s list: Tab to slot 20, Escape (none), reopened, Tab to slot 20, Enter: 20. Focus never leaves the open list.
await test('keyboard: Copy\'s list and New Game+\'s list traversed with Tab; Escape chooses none; the next choice is the one used', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await seed(p, [1, 2, 3, 4, 5, 6]);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(300);
  // Tab from wherever the list opened its focus to `sel`, at most 30 presses, focus inside `scope` at every step
  const tabTo = async (sel, scope) => {
    for (let i = 0; i <= 30; i++) {
      const at = await p.evaluate(([sel, scope]) => { const a = document.activeElement; return { on: !!a && a.matches(sel), inside: !!a && !!a.closest(scope) }; }, [sel, scope]);
      assert(at.inside, 'focus left ' + scope + ' after ' + i + ' Tab presses');
      if (at.on) return i;
      await p.keyboard.press('Tab');
    }
    throw new Error('30 Tab presses did not reach ' + sel);
  };
  const used = () => p.evaluate(async () => (await RB.save.list()).filter((x) => !x.empty).map((x) => x.slot).join());
  await p.focus('.rec[data-slot="3"] [data-a=manage]');
  await p.keyboard.press('Enter');
  await until(p, () => { const c = document.querySelector('.rec[data-slot="3"] [data-a=copy]'); return !!c && c.getClientRects().length > 0; });
  await p.focus('.rec[data-slot="3"] [data-a=copy]');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.folio-copyslot .ng-opt');
  await p.waitForTimeout(150);
  const t16 = await tabTo('.folio-copyslot .ng-opt[data-slot="16"]', '.folio-copyslot');
  await p.keyboard.press('Escape');
  await until(p, () => !document.querySelector('.folio-copyslot'));
  let g = await ledger(p);
  assert(g.focus && g.focus.slot === 3 && g.focus.a === 'copy' && (await used()) === '1,2,3,4,5,6', 'after Escape: ' + JSON.stringify(g.focus) + ' used ' + await used());
  await p.keyboard.press('Enter');
  await p.waitForSelector('.folio-copyslot .ng-opt');
  await p.waitForTimeout(150);
  const t17 = await tabTo('.folio-copyslot .ng-opt[data-slot="17"]', '.folio-copyslot');
  await p.keyboard.press('Enter');
  await until(p, () => /Traveller 3/.test((document.querySelector('.rec[data-slot="17"]') || {}).innerText || ''));
  await p.waitForTimeout(200);
  g = await ledger(p);
  assert(g.tabs[2].sel && g.focus && g.focus.slot === 17 && g.focus.a === 'manage' && (await used()) === '1,2,3,4,5,6,17', 'after Enter on 17: ' + JSON.stringify({ tab: g.tabs.findIndex((t) => t.sel), focus: g.focus }) + ' used ' + await used());
  await p.keyboard.press('Escape');
  await until(p, () => !document.querySelector('.folio-ledger'));
  // New Game+'s list
  let pick = p.evaluate(async () => RB.ui.ngplus.chooseSlot(await RB.save.list(), 2));
  await p.waitForSelector('.folio-ngplus .ng-opt');
  await p.waitForTimeout(150);
  const n1 = await tabTo('.folio-ngplus .ng-opt[data-slot="20"]', '.folio-ngplus');
  await p.keyboard.press('Escape');
  assert(await pick === null, 'Escape on New Game+\'s list chose ' + await pick);
  pick = p.evaluate(async () => RB.ui.ngplus.chooseSlot(await RB.save.list(), 2));
  await p.waitForSelector('.folio-ngplus .ng-opt');
  await p.waitForTimeout(150);
  const n2 = await tabTo('.folio-ngplus .ng-opt[data-slot="20"]', '.folio-ngplus');
  await p.keyboard.press('Enter');
  assert(await pick === 20, 'New Game+ chose ' + await pick);
  console.log('     Tab presses: Copy to 16 ' + t16 + ', to 17 ' + t17 + '; New Game+ to 20 ' + n1 + ', ' + n2);
  assert(!errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
});

await test('cross-tab: slot 12 owned by one tab opens read-only in the other', async () => {
  const ctx = await b.newContext();
  const A = await page(b, url, { context: ctx });
  await A.p.evaluate(async () => { const s = RB.state.newCampaign({ edition: RB.edition.forNew() }); s.player.name = 'Twelve'; await RB.game.startNewCampaign(12, s); await RB.save.manualSave(12); });
  const B = await page(b, url, { context: ctx });
  const pending = B.p.evaluate(() => RB.game.loadCampaign(12, 'manual'));
  await B.p.waitForSelector('[role=alertdialog]', { timeout: 5000 });
  assert(/another tab/i.test(await B.p.textContent('[role=alertdialog]')), 'no warning in the second tab');
  await B.p.click('[role=alertdialog] >> text=Open read-only');
  await pending;
  assert(await B.p.evaluate(() => RB.save.status().readOnly && RB.save.current().slot === 12), 'the second tab is not read-only on slot 12');
  let threw = false;
  try { await B.p.evaluate(() => RB.save.manualSave(12)); } catch (e) { threw = true; }
  assert(threw, 'the read-only tab saved slot 12');
  await B.p.evaluate(() => RB.ui.menu.open());
  await B.p.click('[data-util=save]');
  await B.p.click('.sv-slip [data-a=save]');
  await B.p.waitForSelector('.folio-ledger .rec');
  await B.p.waitForTimeout(200);
  const g = await ledger(B.p);
  assert(g.tabs[1].sel && /this journey/.test(g.tabs[1].name), 'the save ledger did not open on slot 12\'s page: ' + JSON.stringify(g.tabs));
  assert(await B.p.locator('.rec[data-slot="12"] [data-a=save][disabled]').count() === 1 && await B.p.locator('.folio-ledger .note-slip.warn').count() === 1, 'slot 12 not shown read-only');
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------------------
await test('localStorage only, the store full: a save fails visibly, nothing says it saved, the protected records unchanged', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } }); });
  const { p, errors } = await page(b, url, { context: ctx });
  assert(await p.evaluate(() => RB.save.status().mode) === 'local', 'mode ' + await p.evaluate(() => RB.save.status().mode));
  await seed(p, [1, 2]);
  const keep = await p.evaluate(() => Object.keys(localStorage).filter((k) => /slots:|recovery:/.test(k)).sort().map((k) => [k, localStorage.getItem(k)]));
  assert(keep.length >= 2, 'protected records: ' + keep.length);
  const filled = await p.evaluate(() => { let n = 0; for (const size of [262144, 16384, 1024, 64]) { for (;;) { try { localStorage.setItem('zz_fill_' + n++, 'x'.repeat(size)); } catch (e) { break; } } } return n; });
  await p.evaluate(() => { RB.game.debugStart('co.village', 20, 18, { edition: RB.edition.forNew(), comp: 'ren', profile: 'E', flags: { departed: true } }); });
  await p.waitForTimeout(250);
  await p.evaluate(() => RB.ui.menu.open());
  await p.click('[data-util=save]');
  await p.click('.sv-slip [data-a=save]');
  await p.waitForSelector('.folio-ledger .rec');
  await p.click('.folio-ledger .ptab >> nth=1');
  await p.waitForTimeout(150);
  const notices = await p.evaluate(() => { window.__n = []; const o = RB.ui.notice; RB.ui.notice = (t, k) => { window.__n.push([k || '', t]); return o(t, k); }; return true; });
  assert(notices, 'notices not watched');
  await p.click('.rec[data-slot="8"] [data-a=save]');
  await p.waitForTimeout(600);
  const r = await p.evaluate(async () => ({ n: window.__n, eight: (await RB.save.list())[7], vis: !!document.querySelector('.notice.bad') }));
  assert(r.n.some(([k]) => k === 'bad') && r.vis, 'no visible failure: ' + JSON.stringify(r.n));
  assert(!r.n.some(([, t]) => /Saved/.test(t)), 'it said it saved: ' + JSON.stringify(r.n));
  assert(r.eight.empty, 'slot 8 holds something');
  const after = await p.evaluate(() => Object.keys(localStorage).filter((k) => /slots:|recovery:/.test(k)).sort().map((k) => [k, localStorage.getItem(k)]));
  assert(JSON.stringify(after) === JSON.stringify(keep), 'the protected records changed');
  console.log('     ' + filled + ' filler writes; the failure said: ' + (r.n.find(([k]) => k === 'bad') || [])[1]);
  await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('zz_fill_')) localStorage.removeItem(k); });
  assert(!errors.filter((e) => !/quota|exceeded/i.test(e)).length, errors.slice(0, 3).join(' | '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------------------
await test('storage.estimate() after twenty realistic slots (reported, IndexedDB headroom only)', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await seed(p, Array.from({ length: 20 }, (_, i) => i + 1), ['auto', 'auto', 'auto', 'predeparture']);
  const e = await p.evaluate(async () => { const x = await navigator.storage.estimate(); const l = await RB.save.list(); return { usage: x.usage, quota: x.quota, idb: x.usageDetails && x.usageDetails.indexedDB, used: l.filter((s) => !s.empty).length }; });
  assert(e.used === 20 && e.usage > 0 && e.quota > e.usage, 'estimate: ' + JSON.stringify(e));
  console.log('     20 slots, 3 autosaves and a pre-departure point each: usage ' + e.usage + ' B (IndexedDB ' + e.idb + ' B) of quota ' + e.quota + ' B');
  assert(!errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
});

console.log(`\nsave_slots20: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
