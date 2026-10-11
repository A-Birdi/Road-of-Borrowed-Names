// Old saves once the twelve-chapter edition has shipped (Robin's C-84, "Fully ship it (C-54 applies)"; C-54, C-66;
// docs/future/plan/02_FOUNDATIONS.md S4), against the built index.html in Chromium, in throwaway browser contexts
// (synthetic saves from tests/fixtures/campaign, never a player's own):
//  - a new journey is twelve-chapter, and Settings no longer offers the edition;
//  - a six-chapter journey's slot says where it is from; Continue on it first explains the fresh start (what comes
//    with you, what does not) and "Not now" returns to the title with the save byte for byte as it was;
//  - accepting begins New Game+ in its own slot after a confirmation: the journey's companion says goodbye, and the
//    new journey is twelve-chapter, from the start, carrying the learning record and the traveller as they are;
//  - a six-chapter journey from before a companion was chosen, loaded from the Ledger into another slot: the solo
//    farewell, and the old journey stays in its slot untouched; a finished six-chapter journey is offered too.
// Usage: node tests/e2e/old_saves.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 180s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const fixture = (f) => { const j = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/campaign', f + '.json'), 'utf8')); return j.state || j; };
// every record the game keeps in its database, as text (the save's bytes as stored)
const dump = (p) => p.evaluate(() => new Promise((res, rej) => {
  const rq = indexedDB.open('road-of-borrowed-names');
  rq.onerror = () => rej(rq.error);
  rq.onsuccess = async () => {
    const db = rq.result, out = {};
    for (const name of [...db.objectStoreNames]) {
      out[name] = await new Promise((r2) => { const g = db.transaction(name, 'readonly').objectStore(name).getAll(); g.onsuccess = () => r2(g.result); });
    }
    db.close();
    res(JSON.stringify(out));
  };
}));
// a synthetic save written to a slot, then the page reloaded so the title lists it
async function withSaves(p, saves) {
  await p.evaluate(async (saves) => { for (const [slot, st] of saves) await RB.save.writeSlot(slot, st, { force: true }); }, saves);
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 60000 });
  await p.waitForSelector('.title [data-a=continue]:not(.hidden), .title [data-a=load]');
  await p.waitForTimeout(300);
}
const sheetText = (p) => p.evaluate(() => (document.querySelector('.csheet') || {}).textContent || '');
const press = (p, re) => p.evaluate((src) => { const x = [...document.querySelectorAll('.csheet .pbtn, .folio-ngplus .ng-opt')].find((y) => new RegExp(src).test(y.textContent)); if (x) { x.click(); return true; } return false; }, re);
async function farewellThrough(p) {
  const lines = [];
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), who: RB.ui.dialogue.isOpen() ? (document.querySelector('.dlg .who, .dlg .dlg-tab') || {}).textContent || '' : '', ng: !!(RB.game.G.playing && RB.game.s && RB.game.s.ngplus) }));
    if (st.ng && !st.dlg) break;
    if (st.dlg) { lines.push(st.who.replace(/\s+/g, ' ').trim()); await p.evaluate(() => RB.ui.dialogue.advance(true)); }
    await p.waitForTimeout(60);
  }
  return lines;
}

await test('a new journey is twelve-chapter, and Settings no longer offers the edition', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  const o = await p.evaluate(() => ({ shipped: RB.edition.shipped(), forNew: RB.edition.forNew() }));
  assert(o.shipped && o.forNew === 2, 'shipped, new journeys twelve-chapter: ' + JSON.stringify(o));
  await p.evaluate(() => RB.ui.settings.open());
  await p.waitForSelector('.folio-settings');
  const rows = await p.evaluate(() => { const out = []; for (const b of document.querySelectorAll('.folio-settings [data-sec], .folio-settings .ptab, .folio-settings button')) if (/Learning/i.test(b.textContent)) { b.click(); break; } return out; });
  void rows;
  await p.waitForTimeout(300);
  const has = await p.evaluate(() => /Edition for new journeys|Twelve chapters \(in development\)/.test(document.querySelector('.folio-settings').textContent));
  assert(!has, 'Settings still offers the edition');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('a six-chapter journey: its slot says so; Continue explains the fresh start; "Not now" leaves it byte for byte', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await withSaves(p, [[1, fixture('F-ren-ch2_done')]]);
  const before = await dump(p);
  // the Ledger's slot
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.slot[data-slot="1"]');
  const note = await p.evaluate(() => document.querySelector('.slot[data-slot="1"]').textContent.replace(/\s+/g, ' '));
  assert(/From the six-chapter edition/.test(note), 'the slot says where it is from: ' + note);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  // Continue: the explanation first
  await p.click('.title [data-a=continue]');
  await p.waitForSelector('.csheet');
  const t = await sheetText(p);
  assert(/six-chapter edition/.test(t) && /New Game\+/.test(t) && /without satchel equipment or items/.test(t) && /learning record and stars/.test(t) && /illustrations/.test(t) && /pastime records/.test(t) && /Nothing in this saved journey changes unless you begin/.test(t), 'the explanation (C-54): ' + t);
  const focus = await p.evaluate(() => (document.activeElement || {}).textContent || '');
  assert(/Not now/.test(focus), 'the safe answer has focus first: ' + focus);
  await press(p, '^\\s*Not now');
  await p.waitForSelector('.title [data-a=continue]');
  await p.waitForTimeout(400);
  const o = await p.evaluate(() => ({ playing: RB.game.G.playing, mode: RB.game.mode() }));
  assert(!o.playing, 'back at the title, no journey begun: ' + JSON.stringify(o));
  assert(await dump(p) === before, 'the save is byte for byte as it was');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('accepting: New Game+ in its own slot after a confirmation; Ren says goodbye; twelve chapters from the start, carrying what C-54 names', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  const old = fixture('F-ren-ch2_done');
  await withSaves(p, [[1, old]]);
  await p.click('.title [data-a=continue]');
  await p.waitForSelector('.csheet');
  await press(p, 'Begin New Game\\+');
  await p.waitForSelector('.folio-ngplus .ng-opt');
  const opt = await p.evaluate(() => document.querySelector('.folio-ngplus .ng-opt[data-slot="1"]').textContent.replace(/\s+/g, ' '));
  assert(/six-chapter edition/.test(opt), 'its own slot offered as "this journey (six-chapter edition)": ' + opt);
  await press(p, 'Slot 1');
  await p.waitForSelector('.csheet');
  assert(/in place of this six-chapter one/.test(await sheetText(p)), 'a confirmation before it is replaced');
  await press(p, '^\\s*Begin here');
  const lines = await farewellThrough(p);
  assert(lines.length >= 2, 'the farewell plays: ' + JSON.stringify(lines));
  const s = await p.evaluate(() => { const s = RB.game.s; return { edition: s.edition, ngplus: s.ngplus, from: s.ngFrom, chapter: s.chapter, comp: s.comp, name: s.player.name, learn: JSON.stringify(s.learn.items || {}).length, inv: Object.keys(s.inv || {}).length, post: !!s.flags.postgame }; });
  assert(s.edition === 2 && s.ngplus === (old.ngplus || 0) + 1 && s.from && s.from.edition === 1 && s.from.comp === 'ren' && !s.comp && !s.post && !s.inv, 'a twelve-chapter New Game+ from the start: ' + JSON.stringify(s));
  assert(s.name === old.player.name && s.learn === JSON.stringify(old.learn.items || {}).length, 'the traveller and the learning record carried: ' + JSON.stringify(s));
  const meta = await p.evaluate(async () => (await RB.save.list())[0]);
  assert(meta && !meta.empty && meta.meta && meta.meta.edition === 2, 'slot 1 now holds the new journey: ' + JSON.stringify(meta && meta.meta));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('before a companion was chosen, loaded into another slot: the solo farewell; the old journey stays untouched; a finished one is offered too', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  const early = fixture('F-ren-ch2_done');
  early.comp = null; early.chapter = 1; early.flags = Object.assign({}, early.flags, { ch1_done: false, departed: false }); early.id = 'early-one';
  await withSaves(p, [[1, early], [3, fixture('F-ren-ch6_done')]]);
  const slot1 = await p.evaluate(async () => JSON.stringify(await RB.save.read(1, 'manual')));
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.slot[data-slot="3"]');
  assert(/From the six-chapter edition/.test(await p.evaluate(() => document.querySelector('.slot[data-slot="3"]').textContent)), 'the finished six-chapter journey is marked too');
  await p.evaluate(() => { const b = document.querySelector('.slot[data-slot="1"] [data-a=load], .slot[data-slot="1"] [data-a=loadauto]'); b.click(); });
  await p.waitForSelector('.csheet');
  await press(p, 'Begin New Game\\+');
  await p.waitForSelector('.folio-ngplus .ng-opt');
  await press(p, 'Slot 2');
  const lines = await farewellThrough(p);
  const solo = await p.evaluate(() => (RB.content.ngFarewell && RB.content.ngFarewell.solo || []).length);
  assert(solo > 0 && lines.length >= 1, 'the solo farewell plays: ' + JSON.stringify(lines));
  assert(!lines.some((w) => /Ren/.test(w)), 'no companion speaks a farewell: ' + JSON.stringify(lines));
  const st = await p.evaluate(async () => { const l = await RB.save.list(); return { s2: l[1].meta && l[1].meta.edition, ng: RB.game.s.ngplus, from: RB.game.s.ngFrom }; });
  assert(st.s2 === 2 && st.ng === 1 && st.from && st.from.comp === null && st.from.edition === 1, 'the new journey in slot 2: ' + JSON.stringify(st));
  assert(await p.evaluate(async () => JSON.stringify(await RB.save.read(1, 'manual'))) === slot1, 'the old journey in slot 1 is untouched');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
