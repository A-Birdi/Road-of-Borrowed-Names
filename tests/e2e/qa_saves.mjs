// The QA-only save backup and restore (SPECIFICATION §14's one exception: Robin, 2026-10-27, via Agnes 6431800544,
// 6431813219, 6431911207 and 6432013211; Local CL-457, CL-458). In Chromium on the built game, on IndexedDB, with
// isolated contexts and synthetic saves only (never a player's saves):
//  1. without ?dev=saves: no RB.save.qa, no sheets, no QA control anywhere in the ledger, the footer as before;
//  2. with it: "Export (QA)…" in an occupied slot's Manage group and "Restore (QA)…" in an empty slot's, on the Load
//     page only (not New Game's);
//  3. the round trip, by the ledger's own controls: export (preview, Download, Copy) in one profile; restore into an
//     empty slot of a FRESH profile (file input, check, preview, confirmation); re-exported there before any gameplay,
//     the payload is the same bytes with the same SHA-256; the records as restore derives them (rev 1, no thumbnail,
//     meta from the state with the file's saved times, writeRecovery's keys); the campaign id kept; RB.save.current()
//     and the held locks unchanged;
//  4. separately, the restored slot loads through the ordinary Load: map, position, flags, quests and playtime as the
//     file's manual save, with 0 page errors;
//  5. beside its source in the same profile: a fresh id in every record, meta recomputed with it; the source's records
//     byte-identical; Delete removes the restored slot's recovery records;
//  6. refused with every IndexedDB record (slots, recovery, settings) byte-identical: an occupied target, a target with
//     only a recovery point, a target held by another tab's claim, a tampered file (also through the sheet, which shows
//     why and offers no Restore), localStorage instead of IndexedDB;
//  7. a failure injected at the transaction's second put: the transaction aborts and the target stays empty;
//  8. the temporary target lock (Agnes 6432013211): while a journey is open, a restore that succeeds and one that fails
//     each leave the caller's current slot, its read-only state and its own lock as they were, and no target lock held.
//  9. a Check overtaken (Agnes 6432528267): Check(A) held, the text changed to B, A then resolving: A's result is
//     dropped (no preview, no Restore) and nothing is written; a Check held while the sheet closes is dropped too; only
//     once B itself is checked can it be restored, and what is restored is B;
// 10. one ceiling in UTF-8 bytes (Agnes 6432528267): a slot whose file would be over 16 MiB (five records, each within
//     4 MiB) offers no Download; a chosen file one byte over is refused before it is read, one exactly at it passes the
//     size check;
// 11. an Unwritten Atlas room (Local CL-459): a checkpoint standing in a generated room passes the check in a fresh
//     profile, is stored exactly as exported (the atlas preparation ran on copies only), re-exports to the same payload
//     hash, and then loads standing in that room.
// Usage: node tools/build.mjs && node tests/e2e/qa_saves.mjs [filter]
import crypto from 'node:crypto';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
const DEV = url + '?dev=saves';
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String((e && e.message) || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

// synthetic journeys from real content ids, each with the recovery kinds asked for after its manual save
async function seed(p, slots, kinds, name) {
  await p.evaluate(async ([slots, kinds, name]) => {
    const maps = [['rw.village', 22, 30, 'nao'], ['sg.harbor', 20, 22, 'mio'], ['co.village', 20, 18, 'ren']];
    for (let k = 0; k < slots.length; k++) {
      const n = slots[k], [m, x, y, c] = maps[k % maps.length];
      const s = RB.game.debugStart(m, x, y, { edition: RB.edition.forNew(), comp: c, profile: 'E', flags: { departed: true } });
      s.player.name = (name || 'Traveller') + ' ' + n; s.player.nameJp = 'たびびと'; s.chapter = 2; s.playtime = 600 * (k + 1) + 7;
      s.flags.qa_marker = true; s.vars.qa_count = 3 + k;
      await new Promise((r) => setTimeout(r, 40));
      const thumb = RB.render.thumbnail();
      await RB.save.writeSlot(n, s, { force: true, thumb });
      for (const kind of kinds || []) {
        s.playtime += 60; s.x += 1;
        await new Promise((r) => setTimeout(r, 5));
        await RB.save.writeRecovery(n, s, kind, thumb);
      }
    }
    await RB.game.toTitle();
  }, [slots, kinds || [], name || null]);
}
// every record as stored, by store and key
const raw = (p) => p.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('road-of-borrowed-names'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const all = (st) => new Promise((res, rej) => { const q = db.transaction(st, 'readonly').objectStore(st).getAll(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  const out = {};
  for (const st of ['slots', 'recovery', 'settings']) for (const r of await all(st)) out[st + ':' + (st === 'slots' ? r.slot : st === 'recovery' ? r.key : r.k)] = JSON.stringify(r);
  db.close();
  return out;
});
const diff = (a, z) => Object.keys(Object.assign({}, a, z)).filter((k) => a[k] !== z[k]);
const ownership = (p) => p.evaluate(async () => {
  const c = RB.save.current(), q = await navigator.locks.query();
  return { slot: c.slot, readOnly: c.readOnly, lockSlot: c.lockSlot == null ? null : c.lockSlot, held: q.held.map((l) => l.name).filter((n) => n.startsWith('rbn-slot-')).sort() };
});
const refused = async (p, fn, arg) => p.evaluate(async ([fn, arg]) => { try { await (0, eval)(fn)(arg); return null; } catch (e) { return String(e.message || e); } }, [String(fn), arg]);
async function openLedger(p, slot) {
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  const tab = 'lp' + Math.floor((slot - 1) / 6);
  if (await p.getAttribute('.folio-ledger .ptab[data-id=' + tab + ']', 'aria-selected') !== 'true') await p.click('.folio-ledger .ptab[data-id=' + tab + ']');
  await p.waitForSelector('.folio-ledger .rec[data-slot="' + slot + '"]');
}
async function manage(p, slot) {
  const t = '.folio-ledger .rec[data-slot="' + slot + '"] [data-a=manage]';
  if (await p.getAttribute(t, 'aria-expanded') !== 'true') await p.click(t);
}

// ---------------------------------------------------------------------------------------------------------------------
await test('without ?dev=saves: no RB.save.qa, no sheets, no QA control in the ledger, the footer as before', async () => {
  const P = await page(b, url);
  await seed(P.p, [2], ['auto']);
  assert(await P.p.evaluate(() => RB.save.qa === undefined && RB.ui.qaSaves === undefined), 'QA defined without the gate');
  await openLedger(P.p, 2);
  await manage(P.p, 2);
  const g = await P.p.evaluate(() => ({ qa: document.querySelectorAll('[data-a=qaexport], [data-a=qarestore], .folio-qasaves').length, foot: document.querySelector('.ledger-foot').textContent, mg: document.querySelectorAll('.folio-ledger .rec.empty [data-a=manage]').length }));
  assert(g.qa === 0 && g.mg === 0, 'QA controls without the gate: ' + JSON.stringify(g));
  assert(/There is no export or cloud copy\.$/.test(g.foot.trim()), 'the footer changed: ' + g.foot);
  assert(!P.errors.length, 'page errors: ' + P.errors.join(' | '));
  await P.ctx.close();
});

await test('with ?dev=saves: Export (QA) on an occupied slot and Restore (QA) on an empty one, on the Load page only', async () => {
  const P = await page(b, DEV);
  await seed(P.p, [2], ['auto']);
  await openLedger(P.p, 2);
  await manage(P.p, 2);
  await manage(P.p, 3);
  const g = await P.p.evaluate(() => ({
    ex: [...document.querySelectorAll('[data-a=qaexport]')].map((x) => +x.closest('[data-slot]').dataset.slot),
    re: [...document.querySelectorAll('[data-a=qarestore]')].map((x) => +x.closest('[data-slot]').dataset.slot),
    vis: [...document.querySelectorAll('[data-a=qaexport], .rec[data-slot="3"] [data-a=qarestore]')].map((x) => x.getClientRects().length > 0),
    foot: document.querySelector('.ledger-foot').textContent,
  }));
  assert(JSON.stringify(g.ex) === '[2]' && JSON.stringify(g.re) === '[1,3,4,5,6]' && g.vis.every(Boolean), 'controls: ' + JSON.stringify(g));
  assert(/QA backup \(\?dev=saves\)/.test(g.foot), 'the footer does not say so: ' + g.foot);
  await P.p.click('.folio-ledger [data-folio-close]');
  await P.p.click('.title [data-a=new]');
  await P.p.waitForSelector('.folio-ledger .rec');
  assert(await P.p.locator('[data-a=qaexport], [data-a=qarestore]').count() === 0, 'QA controls on the New Game page');
  assert(!P.errors.length, 'page errors: ' + P.errors.join(' | '));
  await P.ctx.close();
});

let FILE = null, SRC = null; // the exported file's text and the source's manual state, for the later tests
await test('round trip: exported by the ledger, restored into a fresh profile, re-exported before gameplay to the same payload bytes and SHA-256', async () => {
  const A = await page(b, DEV, { context: await b.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 800 } }) });
  await seed(A.p, [3], ['auto', 'auto', 'predeparture']);
  SRC = await A.p.evaluate(async () => (await RB.save.read(3, 'manual')).state);
  await openLedger(A.p, 3);
  await manage(A.p, 3);
  await A.p.click('.rec[data-slot="3"] [data-a=qaexport]');
  await A.p.waitForSelector('.folio-qasaves #qa-label');
  await A.p.fill('#qa-label', 'QA e2e');
  await A.p.click('[data-q=prepare]');
  await A.p.waitForSelector('#qa-text');
  const shown = await A.p.evaluate(() => ({ text: document.querySelector('#qa-text').value, sha: document.querySelector('.qa-sha').textContent, recs: document.querySelectorAll('.qa-recs > li').length, keys: document.querySelector('.qa-keys').textContent }));
  const f = JSON.parse(shown.text);
  assert(f.sha256 === sha(f.payload) && shown.sha === f.sha256 && shown.recs === 4 && /\bplayer\b/.test(shown.keys), 'the preview: ' + JSON.stringify({ sha: shown.sha, recs: shown.recs }));
  const [dl] = await Promise.all([A.p.waitForEvent('download'), A.p.click('[data-q=download]')]);
  const got = fs.readFileSync(await dl.path(), 'utf8');
  assert(got === shown.text && dl.suggestedFilename() === 'road-qa-slot3-QA-e2e.json', 'the download: ' + dl.suggestedFilename() + ', equal ' + (got === shown.text));
  await A.p.click('[data-q=copy]');
  await A.p.waitForFunction(() => /Copied|selected/.test(document.querySelector('[data-q-status]').textContent));
  FILE = got;
  assert(!A.errors.length, 'source page errors: ' + A.errors.join(' | '));
  await A.ctx.close();

  // a fresh profile: nothing saved, then the file restored into slot 9 through the sheet
  const B = await page(b, DEV);
  const own0 = await ownership(B.p);
  const before = await raw(B.p);
  await openLedger(B.p, 9);
  await manage(B.p, 9);
  await B.p.click('.rec[data-slot="9"] [data-a=qarestore]');
  await B.p.waitForSelector('.folio-qasaves #qa-file');
  await B.p.setInputFiles('#qa-file', { name: 'road-qa-slot3-QA-e2e.json', mimeType: 'application/json', buffer: Buffer.from(FILE, 'utf8') });
  await B.p.click('[data-q=check]');
  await B.p.waitForSelector('[data-q=restore]');
  const pv = await B.p.evaluate(() => document.querySelector('.folio-qasaves [data-q=out]').textContent);
  assert(pv.includes(f.sha256) && pv.includes('Traveller 3') && pv.includes('QA e2e'), 'the restore preview: ' + pv.slice(0, 300));
  assert(!diff(before, await raw(B.p)).length, 'written before the confirmation');
  await B.p.click('[data-q=restore]');
  await B.p.waitForSelector('[role=alertdialog]');
  await B.p.click('[role=alertdialog] .pbtn >> text="Restore"');
  await B.p.waitForFunction(() => !document.querySelector('.folio-qasaves'));
  await B.p.waitForSelector('.rec[data-slot="9"] [data-a=load]');
  const after = await raw(B.p);
  const changed = diff(before, after).sort();
  const recs = JSON.parse(f.payload);
  const want = ['recovery:9:auto:' + recs[1].savedAt, 'recovery:9:auto:' + recs[2].savedAt, 'recovery:9:predeparture', 'slots:9'].sort();
  assert(JSON.stringify(changed) === JSON.stringify(want), 'records written: ' + changed.join(','));
  const m = JSON.parse(after['slots:9']);
  assert(m.rev === 1 && m.thumb === null && m.meta.savedAt === recs[0].savedAt && m.meta.name === 'Traveller 3' && m.meta.id === SRC.id && m.state.id === SRC.id, 'the manual record: ' + JSON.stringify({ rev: m.rev, thumb: m.thumb, meta: m.meta }));
  for (const k of want.filter((x) => x.startsWith('recovery:'))) {
    const r = JSON.parse(after[k]), src = recs.find((x) => x.kind === r.kind && x.savedAt === r.savedAt);
    assert(src && r.slot === 9 && r.thumb === null && r.meta.savedAt === r.savedAt && JSON.stringify(r.state) === JSON.stringify(src.state), 'recovery record ' + k);
  }
  // re-exported before any gameplay: the same payload, byte for byte
  const again = JSON.parse(await B.p.evaluate(async () => (await RB.save.qa.exportSlot(9, 'again')).text));
  assert(again.payload === f.payload && again.sha256 === f.sha256, 'the re-export differs: ' + again.sha256 + ' vs ' + f.sha256);
  const own1 = await ownership(B.p);
  assert(JSON.stringify(own0) === JSON.stringify(own1) && !own1.held.length, 'ownership changed: ' + JSON.stringify([own0, own1]));
  assert(!B.errors.length, 'restore page errors: ' + B.errors.join(' | '));
  // 4. separately: the ordinary Load, from the ledger
  await B.p.click('.rec[data-slot="9"] [data-a=load]');
  await B.p.waitForFunction(() => RB.game.G.playing && RB.game.G.s && RB.game.G.s.player.name === 'Traveller 3', null, { timeout: 15000 });
  await B.p.waitForTimeout(500);
  const s = await B.p.evaluate(() => { const s = RB.game.G.s; return { map: s.map, x: s.x, y: s.y, flags: s.flags, quests: s.quests, playtime: s.playtime, vars: s.vars, slot: RB.save.current().slot }; });
  for (const k of ['map', 'x', 'y', 'flags', 'quests', 'vars']) assert(JSON.stringify(s[k]) === JSON.stringify(SRC[k]), 'loaded ' + k + ': ' + JSON.stringify(s[k]).slice(0, 200) + ' vs ' + JSON.stringify(SRC[k]).slice(0, 200));
  assert(s.playtime >= SRC.playtime && s.playtime < SRC.playtime + 5 && s.slot === 9, 'loaded playtime (it runs on while playing) or slot: ' + JSON.stringify([s.playtime, SRC.playtime, s.slot]));
  assert(!B.errors.length, 'load page errors: ' + B.errors.join(' | '));
  await B.ctx.close();
});

await test('beside its source: a fresh id in every record with meta recomputed; the source unchanged; Delete removes the restored recovery records', async () => {
  assert(FILE, 'needs the round trip\'s file');
  const A = await page(b, DEV);
  await seed(A.p, [3], ['auto', 'auto', 'predeparture']);
  const f = JSON.parse(FILE), recs = JSON.parse(f.payload);
  // the same campaign as the file's: slot 3 holds the file's own records, as in the profile it came from
  await A.p.evaluate(async (text) => { await RB.save.del(3); await RB.save.qa.restore(text, 3); }, FILE);
  const before = await raw(A.p);
  const res = await A.p.evaluate(async (text) => RB.save.qa.restore(text, 4), FILE);
  assert(res.idChanged && res.slot === 4 && JSON.stringify(res.kinds) === JSON.stringify(recs.map((r) => r.kind)), 'restore result: ' + JSON.stringify(res));
  const after = await raw(A.p);
  const src = Object.keys(before);
  assert(src.every((k) => before[k] === after[k]), 'the source records changed: ' + diff(before, after).filter((k) => before[k]).join(','));
  const mine = Object.keys(after).filter((k) => !before[k]).map((k) => JSON.parse(after[k]));
  const id = mine[0].state.id;
  assert(mine.length === 4 && id && id !== recs[0].state.id && mine.every((r) => r.state.id === id && r.meta.id === id), 'ids: ' + JSON.stringify(mine.map((r) => [r.state.id, r.meta.id])));
  assert(mine.every((r) => r.meta.savedAt === (r.savedAt || recs[0].savedAt) && r.meta.name === 'Traveller 3'), 'meta: ' + JSON.stringify(mine.map((r) => r.meta)));
  await A.p.evaluate(() => RB.save.del(4));
  const gone = await raw(A.p);
  assert(!diff(before, gone).length, 'Delete left records: ' + diff(before, gone).join(','));
  assert(!A.errors.length, 'page errors: ' + A.errors.join(' | '));
  await A.ctx.close();
});

await test('refused with every record byte-identical: occupied, recovery-only, held by another tab, tampered (also in the sheet), localStorage', async () => {
  assert(FILE, 'needs the round trip\'s file');
  const ctx = await b.newContext();
  const A = await page(b, DEV, { context: ctx });
  await seed(A.p, [3], ['auto']);
  await A.p.evaluate(async () => { const s = (await RB.save.read(3, 'manual')).state; await RB.save.writeRecovery(6, s, 'predeparture', null); });
  const C = await page(b, DEV, { context: ctx });
  assert(await C.p.evaluate(() => RB.save.claim(8)) === 'owned', 'the other tab could not claim slot 8');
  const before = await raw(A.p);
  const own0 = await ownership(A.p);
  const tampered = (() => { const f = JSON.parse(FILE); f.payload = f.payload.replace('Traveller 3', 'Traveller 8'); return JSON.stringify(f); })();
  const cases = [[3, FILE, /not empty/, 'an occupied slot'], [6, FILE, /recovery points/, 'a slot with only a pre-departure point'], [8, FILE, /open in another tab/, 'a slot another tab holds'],
    [7, tampered, /checksum mismatch/, 'a tampered file'], [7, FILE.slice(0, -30), /not JSON/, 'a truncated file'], [0, FILE, /No such slot/, 'slot 0']];
  for (const [slot, text, re, why] of cases) {
    const e = await refused(A.p, '(a) => RB.save.qa.restore(a[0], a[1])', [text, slot]);
    assert(e && re.test(e), why + ': ' + e);
    const now = await raw(A.p);
    assert(!diff(before, now).length, why + ' wrote: ' + diff(before, now).join(','));
  }
  assert(JSON.stringify(await ownership(A.p)) === JSON.stringify(own0), 'ownership changed by the refusals');
  // the sheet: the tampered text pasted, checked, refused with its reason; no Restore offered
  await openLedger(A.p, 7);
  await manage(A.p, 7);
  await A.p.click('.rec[data-slot="7"] [data-a=qarestore]');
  await A.p.waitForSelector('#qa-paste');
  await A.p.fill('#qa-paste', tampered);
  await A.p.click('[data-q=check]');
  await A.p.waitForSelector('.folio-qasaves [role=alert]');
  const s = await A.p.evaluate(() => ({ alert: document.querySelector('.folio-qasaves [role=alert]').textContent, restore: !!document.querySelector('[data-q=restore]') }));
  assert(/checksum mismatch/.test(s.alert) && !s.restore, 'the sheet: ' + JSON.stringify(s));
  await A.p.keyboard.press('Escape');
  await A.p.waitForFunction(() => !document.querySelector('.folio-qasaves'));
  assert(!diff(before, await raw(A.p)).length, 'the sheet wrote');
  assert(!A.errors.length && !C.errors.length, 'page errors: ' + A.errors.concat(C.errors).join(' | '));
  await ctx.close();
  // localStorage only (IndexedDB blocked): refused, nothing written there either
  const lctx = await b.newContext();
  await lctx.addInitScript(() => { Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } }); });
  const L = await page(b, DEV, { context: lctx });
  const keys0 = await L.p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));
  const e = await refused(L.p, '(a) => RB.save.qa.restore(a[0], a[1])', [FILE, 7]);
  assert(await L.p.evaluate(() => RB.save._mode()) === 'local' && e && /needs IndexedDB/.test(e) && /localStorage/.test(e), 'localStorage mode: ' + e);
  assert(keys0 === await L.p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]))), 'localStorage changed');
  await lctx.close();
});

await test('a failure injected at the second put: the transaction aborts, the target stays empty, no lock left held', async () => {
  assert(FILE, 'needs the round trip\'s file');
  const A = await page(b, DEV);
  await seed(A.p, [3], ['auto']);
  const before = await raw(A.p);
  const own0 = await ownership(A.p);
  const e = await A.p.evaluate(async (text) => {
    const put = IDBObjectStore.prototype.put;
    let n = 0;
    IDBObjectStore.prototype.put = function (...a) { if (++n === 2) throw new Error('injected put failure'); return put.apply(this, a); };
    try { await RB.save.qa.restore(text, 10); return null; } catch (err) { return String(err.message || err) + ' after ' + n + ' puts'; }
    finally { IDBObjectStore.prototype.put = put; }
  }, FILE);
  assert(e && /injected put failure after 2 puts/.test(e), 'the restore did not fail at the second put: ' + e);
  const after = await raw(A.p);
  assert(!diff(before, after).length, 'written despite the abort: ' + diff(before, after).join(','));
  assert(JSON.stringify(await ownership(A.p)) === JSON.stringify(own0), 'ownership changed');
  // the same restore without the fault succeeds (the abort left nothing behind that blocks it)
  const ok = await A.p.evaluate((text) => RB.save.qa.restore(text, 10), FILE);
  assert(ok.slot === 10 && ok.kinds.length === 4, 'the clean restore: ' + JSON.stringify(ok));
  assert(!A.errors.length, 'page errors: ' + A.errors.join(' | '));
  await A.ctx.close();
});

await test('the temporary target lock: with a journey open, success and failure each leave current slot, read-only state and its own lock as they were', async () => {
  assert(FILE, 'needs the round trip\'s file');
  const A = await page(b, DEV);
  await seed(A.p, [3], ['auto']);
  assert(await A.p.evaluate(() => RB.game.loadCampaign(3, 'manual')), 'slot 3 did not load');
  const own0 = await ownership(A.p);
  assert(own0.slot === 3 && own0.readOnly === false && own0.lockSlot === 3 && JSON.stringify(own0.held) === '["rbn-slot-3"]', 'the journey does not own slot 3: ' + JSON.stringify(own0));
  const ok = await A.p.evaluate((text) => RB.save.qa.restore(text, 11), FILE);
  assert(ok.slot === 11, 'restore while playing: ' + JSON.stringify(ok));
  assert(JSON.stringify(await ownership(A.p)) === JSON.stringify(own0), 'after a success: ' + JSON.stringify(await ownership(A.p)));
  const before = await raw(A.p);
  const e = await A.p.evaluate(async (text) => {
    const put = IDBObjectStore.prototype.put;
    let n = 0;
    IDBObjectStore.prototype.put = function (...a) { if (++n === 3) throw new Error('injected put failure'); return put.apply(this, a); };
    try { await RB.save.qa.restore(text, 12); return null; } catch (err) { return String(err.message || err); } finally { IDBObjectStore.prototype.put = put; }
  }, FILE);
  assert(e && /injected/.test(e) && !diff(before, await raw(A.p)).length, 'the failed restore: ' + e);
  assert(JSON.stringify(await ownership(A.p)) === JSON.stringify(own0), 'after a failure: ' + JSON.stringify(await ownership(A.p)));
  // read-only kept as it was
  await A.p.evaluate(() => RB.save.setReadOnly(true));
  await A.p.evaluate((text) => RB.save.qa.restore(text, 12), FILE);
  const ro = await ownership(A.p);
  assert(ro.readOnly === true && ro.slot === 3 && ro.lockSlot === 3 && JSON.stringify(ro.held) === '["rbn-slot-3"]', 'read-only changed: ' + JSON.stringify(ro));
  await A.p.evaluate(() => RB.save.setReadOnly(false));
  assert(await A.p.evaluate(() => RB.game.G.playing && RB.game.G.s.player.name === 'Traveller 3'), 'the open journey changed');
  assert(!A.errors.length, 'page errors: ' + A.errors.join(' | '));
  await A.ctx.close();
});

await test('a Check overtaken by new text, or by the sheet closing: its late result is dropped; only the text checked last can be restored', async () => {
  assert(FILE, 'needs the round trip\'s file');
  const A = await page(b, DEV);
  await seed(A.p, [5], ['auto'], 'Beta');
  const B_TEXT = await A.p.evaluate(async () => { const t = (await RB.save.qa.exportSlot(5, 'beta')).text; await RB.save.del(5); return t; });
  // every check is held until the test releases it
  await A.p.evaluate(() => {
    const orig = RB.save.qa.check;
    window.__held = [];
    RB.save.qa.check = (t) => new Promise((res) => window.__held.push(() => res(orig(t))));
  });
  const held = (n) => A.p.waitForFunction((n) => window.__held.length === n, n);
  const release = () => A.p.evaluate(() => window.__held.shift()());
  const before = await raw(A.p);
  await openLedger(A.p, 9);
  await manage(A.p, 9);
  await A.p.click('.rec[data-slot="9"] [data-a=qarestore]');
  await A.p.waitForSelector('#qa-paste');
  // Check(A), then B typed in while A is still being checked, then A resolves
  await A.p.fill('#qa-paste', FILE);
  await A.p.click('[data-q=check]');
  await held(1);
  await A.p.fill('#qa-paste', B_TEXT);
  await release();
  await A.p.waitForTimeout(400);
  let s = await A.p.evaluate(() => ({ out: document.querySelector('.folio-qasaves [data-q=out]').textContent, restore: !!document.querySelector('[data-q=restore]'), check: !document.querySelector('[data-q=check]').disabled, text: document.querySelector('#qa-paste').value.length }));
  assert(s.out === '' && !s.restore && s.check && s.text === B_TEXT.length, 'A\'s late result was used: ' + JSON.stringify(s));
  // a Check held while the sheet closes
  await A.p.click('[data-q=check]');
  await held(1);
  await A.p.keyboard.press('Escape');
  await A.p.waitForFunction(() => !document.querySelector('.folio-qasaves'));
  await release();
  await A.p.waitForTimeout(400);
  assert(!(await A.p.evaluate(() => !!document.querySelector('.folio-qasaves, [role=alertdialog]'))), 'the closed sheet came back');
  assert(!diff(before, await raw(A.p)).length, 'written by an obsolete check');
  // B checked itself: then, and only then, Restore; and what is restored is B
  await manage(A.p, 9);
  await A.p.click('.rec[data-slot="9"] [data-a=qarestore]');
  await A.p.waitForSelector('#qa-paste');
  await A.p.fill('#qa-paste', B_TEXT);
  await A.p.click('[data-q=check]');
  await held(1);
  assert(!(await A.p.evaluate(() => !!document.querySelector('[data-q=restore]'))), 'Restore offered before B was checked');
  await release();
  await A.p.waitForSelector('[data-q=restore]');
  s = await A.p.evaluate(() => document.querySelector('.folio-qasaves [data-q=out]').textContent);
  assert(s.includes('Beta 5') && !s.includes('Traveller 3'), 'the preview is not B\'s: ' + s.slice(0, 200));
  await A.p.click('[data-q=restore]');
  await A.p.waitForSelector('[role=alertdialog]');
  await A.p.click('[role=alertdialog] .pbtn >> text="Restore"');
  await A.p.waitForFunction(() => !document.querySelector('.folio-qasaves'));
  const again = JSON.parse(await A.p.evaluate(async () => (await RB.save.qa.exportSlot(9, 'x')).text));
  assert(again.payload === JSON.parse(B_TEXT).payload && again.payload !== JSON.parse(FILE).payload, 'slot 9 does not hold B');
  assert(!A.errors.length, 'page errors: ' + A.errors.join(' | '));
  await A.ctx.close();
});

await test('one ceiling in UTF-8 bytes: a slot whose file would be over 16 MiB offers no Download; a file one byte over is refused unread', async () => {
  const A = await page(b, DEV);
  const MAX = await A.p.evaluate(() => RB.save.qa.MAX_FILE_BYTES);
  assert(MAX === 16 * 1024 * 1024, 'the ceiling is ' + MAX);
  await A.p.evaluate(async () => {
    const s = RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'nao', profile: 'E', flags: { departed: true } });
    s.player.name = 'Big 4'; s.pad = 'あ'.repeat(1200000); // 3,600,000 bytes in UTF-8 each
    await RB.save.writeSlot(4, s, { force: true });
    for (const k of ['auto', 'auto', 'auto', 'predeparture']) { await new Promise((r) => setTimeout(r, 5)); await RB.save.writeRecovery(4, s, k, null); }
    await RB.game.toTitle();
  });
  const before = await raw(A.p);
  assert(Object.keys(before).filter((k) => /^(slots:4|recovery:4:)/.test(k)).length === 5, 'slot 4 does not hold five records');
  await openLedger(A.p, 4);
  await manage(A.p, 4);
  await A.p.click('.rec[data-slot="4"] [data-a=qaexport]');
  await A.p.waitForSelector('#qa-label');
  await A.p.click('[data-q=prepare]');
  await A.p.waitForSelector('.folio-qasaves [role=alert]', { timeout: 30000 });
  let s = await A.p.evaluate(() => ({ alert: document.querySelector('.folio-qasaves [role=alert]').textContent, dl: !!document.querySelector('[data-q=download]'), text: !!document.querySelector('#qa-text') }));
  assert(/cannot be exported: the file is larger than 16 MiB/.test(s.alert) && !s.dl && !s.text, 'the export: ' + JSON.stringify(s));
  await A.p.keyboard.press('Escape');
  await A.p.waitForFunction(() => !document.querySelector('.folio-qasaves'));
  await manage(A.p, 5);
  await A.p.click('.rec[data-slot="5"] [data-a=qarestore]');
  await A.p.waitForSelector('#qa-file');
  await A.p.setInputFiles('#qa-file', { name: 'over.json', mimeType: 'application/json', buffer: Buffer.alloc(MAX + 1, 0x78) });
  await A.p.click('[data-q=check]');
  await A.p.waitForSelector('.folio-qasaves [role=alert]');
  s = await A.p.evaluate(() => ({ alert: document.querySelector('.folio-qasaves [role=alert]').textContent, restore: !!document.querySelector('[data-q=restore]') }));
  assert(/larger than 16 MiB/.test(s.alert) && !s.restore, 'one byte over: ' + JSON.stringify(s));
  await A.p.setInputFiles('#qa-file', { name: 'at.json', mimeType: 'application/json', buffer: Buffer.alloc(MAX, 0x78) });
  await A.p.click('[data-q=check]');
  await A.p.waitForSelector('.folio-qasaves [role=alert]', { timeout: 30000 });
  s = await A.p.evaluate(() => ({ alert: document.querySelector('.folio-qasaves [role=alert]').textContent, restore: !!document.querySelector('[data-q=restore]') }));
  assert(/not JSON/.test(s.alert) && !/larger than/.test(s.alert) && !s.restore, 'exactly at the ceiling: ' + JSON.stringify(s));
  assert(!diff(before, await raw(A.p)).length, 'written');
  assert(!A.errors.length, 'page errors: ' + A.errors.join(' | '));
  await A.ctx.close();
});

await test('an Unwritten Atlas room: checked and restored in a fresh profile as exported, re-exported to the same payload hash, then loads in that room', async () => {
  const A = await page(b, DEV);
  const made = await A.p.evaluate(async () => {
    const s = RB.game.debugStart('rw.hall', 5, 5, { edition: RB.edition.forNew(), comp: 'ren', profile: 'E', flags: { post: true, postgame: true } });
    s.player.name = 'Atlas 6';
    const run = RB.atlas.newRun(s, [], { seed: 424242 });
    s.atlas.run = run;
    RB.atlas.register(run);
    const id = RB.atlas.mapId(run, 't'), sp = RB.content.maps[id].spawn.default;
    s.map = id; s.x = sp[0]; s.y = sp[1];
    await RB.save.writeSlot(6, s, { force: true });
    await RB.game.toTitle();
    return { text: (await RB.save.qa.exportSlot(6, 'atlas')).text, map: id };
  });
  assert(made.map.startsWith('atlas.'), 'not in an atlas room: ' + made.map);
  assert(!A.errors.length, 'source page errors: ' + A.errors.join(' | '));
  await A.ctx.close();
  const f = JSON.parse(made.text), recs = JSON.parse(f.payload);
  const B = await page(b, DEV);
  const r = await B.p.evaluate(async ([text, slot]) => {
    const maps0 = Object.keys(RB.content.maps).filter((k) => k.startsWith('atlas.')).length;
    const c = await RB.save.qa.check(text);
    const res = await RB.save.qa.restore(text, slot);
    const again = JSON.parse((await RB.save.qa.exportSlot(slot, 'again')).text);
    return { maps0, ok: c.ok, errors: c.errors, map: c.ok && c.previews[0].meta.place, res, payload: again.payload, sha: again.sha256 };
  }, [made.text, 6]);
  assert(r.maps0 === 0 && r.ok, 'the check in a fresh profile: ' + JSON.stringify({ maps0: r.maps0, errors: r.errors }));
  const stored = JSON.parse((await raw(B.p))['slots:6']).state;
  assert(JSON.stringify(stored) === JSON.stringify(recs[0].state) && stored.map === made.map && stored.atlas.run, 'the stored state is not the exported one');
  assert(r.payload === f.payload && r.sha === f.sha256, 'the re-export differs: ' + r.sha + ' vs ' + f.sha256);
  const L = await B.p.evaluate(async (slot) => { const ok = await RB.game.loadCampaign(slot, 'manual'); return { ok, map: RB.game.s.map, run: !!RB.game.s.atlas.run }; }, 6);
  assert(L.ok && L.map === made.map && L.run, 'the load: ' + JSON.stringify(L));
  assert(!B.errors.length, 'page errors: ' + B.errors.join(' | '));
  await B.ctx.close();
});

console.log(`\nqa_saves: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
