// The QA-only save backup (SPECIFICATION §14's one exception: Robin, 2026-10-27, via Agnes 6431800544 and 6431813219),
// in session storage with synthetic campaigns only:
//  - without the gate (?dev=saves, or __RB_DEV_SAVES__ for tests) nothing is defined: no RB.save.qa, no sheets;
//  - an export holds one slot's records only (no settings, no other slot, no thumbnail or meta), its checksum is the
//    SHA-256 of the payload's UTF-8 bytes, and the parsed payload serialises back to the same bytes;
//  - a file is refused for each way it can be wrong, before anything could be written: size, JSON, format, unknown
//    field, file version, newer schema, source slot, label, checksum (before the payload is parsed), the payload's
//    shape, each record's fields, kind, count, saved time, duplicate, size, name length, its own schema version (Agnes
//    6432528267: 0, -1, 0.5 ... with the file's schema valid), and one invalid state among valid ones; the ledger reads
//    the same afterwards;
//  - one size ceiling, 16 MiB in UTF-8, for every file (Agnes 6432528267): exactly at it passes the size check and one
//    byte over fails it, multibyte text included; an export is run through the same check, so a slot whose file would
//    be over it (five records, each within its own 4 MiB) is refused at export, and one just under it exports a file
//    that check() accepts;
//  - restore is refused outside IndexedDB, with nothing written (tests/e2e/qa_saves.mjs restores on IndexedDB).
import { createHash } from 'node:crypto';
import { load } from '../lib/load.mjs';

const ALL = ['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'];
const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  {
    const RB = load(ALL, { __RB_TEST__: true, crypto: globalThis.crypto, TextEncoder });
    t.ok(RB.save.qa === undefined && RB.ui.qaSaves === undefined, 'without the gate there is no QA backup at all');
  }
  const RB = load(ALL, { __RB_TEST__: true, __RB_DEV_SAVES__: true, crypto: globalThis.crypto, TextEncoder });
  const qa = RB.save.qa;
  t.ok(qa && typeof qa.exportSlot === 'function' && typeof qa.check === 'function' && typeof qa.restore === 'function', 'with the gate: export, check and restore');
  const MAX = 16 * 1024 * 1024;
  t.eq(qa.MAX_FILE_BYTES, MAX, 'one ceiling for a whole file: 16 MiB in UTF-8 bytes');
  t.ok(RB.ui.qaSaves && typeof RB.ui.qaSaves.exportSheet === 'function' && typeof RB.ui.qaSaves.restoreSheet === 'function', 'with the gate: the two sheets');
  t.eq(await RB.save.detect(), 'session', 'the unit context saves for the session only');
  RB.game.inBattle = () => false;
  const tick = () => new Promise((r) => setTimeout(r, 3));
  const mk = (o = {}) => {
    const s = RB.state.newCampaign();
    s.id = o.id || 'qa-unit'; s.map = 'rw.village'; s.x = 4; s.y = 5;
    s.player.name = o.name || 'Tester'; s.player.nameJp = 'テスター';
    return s;
  };
  await RB.save.saveSettings({ marker: 'SETTINGS-MARKER' });
  await RB.save.writeSlot(5, mk({ id: 'other', name: 'OtherSlot' }));
  await RB.save.writeSlot(3, mk());
  await tick(); await RB.save.writeRecovery(3, mk(), 'auto');
  await tick(); await RB.save.writeRecovery(3, mk(), 'auto');
  await tick(); await RB.save.writeRecovery(3, mk(), 'predeparture');
  const before = JSON.stringify(await RB.save.list());

  // ---- export ----------------------------------------------------------------------------------------------------
  const ex = await qa.exportSlot(3, 'unit label');
  const f = JSON.parse(ex.text);
  t.eq(Object.keys(f).sort(), ['exportedAt', 'format', 'fv', 'gameVersion', 'label', 'payload', 'saveSchema', 'sha256', 'sourceSlot'], 'the file has exactly its nine fields');
  t.ok(f.format === 'road-qa-save' && f.fv === 1 && f.saveSchema === RB.SAVE_SCHEMA && f.gameVersion === RB.VERSION && f.sourceSlot === 3 && f.label === 'unit label', 'format, version, schema, game version, source slot and label');
  t.ok(f.sha256 === sha(f.payload) && ex.sha256 === f.sha256, 'the checksum is the SHA-256 of the payload string\'s UTF-8 bytes (non-ASCII included)');
  t.eq(ex.payloadBytes, Buffer.byteLength(f.payload, 'utf8'), 'the payload size is in UTF-8 bytes');
  const recs = JSON.parse(f.payload);
  t.eq(recs.map((r) => r.kind), ['manual', 'auto', 'auto', 'predeparture'], 'the manual save first, then the recovery points by kind and time');
  t.ok(recs.every((r) => Object.keys(r).sort().join() === 'kind,savedAt,state'), 'each record is only its kind, saved time and state (no key, rev, slot, meta or thumbnail)');
  t.ok(recs[1].savedAt < recs[2].savedAt, 'the autosaves in time order');
  t.ok(!ex.text.includes('SETTINGS-MARKER') && !ex.text.includes('OtherSlot'), 'no settings and no other slot in the file');
  t.eq(JSON.stringify(recs), f.payload, 'the parsed payload serialises back to the same bytes (what a restore stores, a re-export gives)');
  t.eq(ex.previews.map((p) => [p.kind, p.savedAt, p.meta.name, p.meta.place]), recs.map((r) => [r.kind, r.savedAt, 'Tester', RB.content.maps['rw.village'].name.en]), 'the preview: each record\'s journey, with its own saved time');
  t.ok(ex.previews.every((p) => p.keys.length === Object.keys(recs[0].state).length && p.keys.every(([k, n]) => typeof k === 'string' && n > 0)), 'the preview lists every top-level key with its size');
  for (const [slot, re, why] of [[7, /Nothing saved/, 'an empty slot'], [0, /No such slot/, 'slot 0'], [21, /No such slot/, 'slot 21'], [2.5, /No such slot/, 'a fraction']]) {
    let e = null;
    try { await qa.exportSlot(slot, ''); } catch (err) { e = err; }
    t.ok(e && re.test(e.message), 'export refuses ' + why);
  }

  // ---- check -----------------------------------------------------------------------------------------------------
  const ok = await qa.check(ex.text);
  t.ok(ok.ok && !ok.errors.length && ok.records.length === 4 && ok.previews.length === 4, 'its own export passes every check');
  const refuse = async (text, re, why) => {
    const c = await qa.check(text);
    t.ok(c.ok === false && c.errors.some((e) => re.test(e)), 'refused: ' + why + (c.ok ? ' (accepted)' : ' (' + c.errors.join('; ') + ')'));
  };
  const outer = (patch) => JSON.stringify(Object.assign({}, f, patch));
  const inner = (rs) => { const p = JSON.stringify(rs); return outer({ payload: p, sha256: sha(p) }); };
  const copy = () => JSON.parse(f.payload);
  await refuse('', /no file text/, 'no text');
  await refuse(ex.text.slice(0, -12), /not JSON/, 'a truncated file');
  await refuse('x'.repeat(MAX + 1), /larger than 16 MiB/, 'a file over 16 MiB');
  await refuse('x'.repeat(MAX - 2) + 'あ', /larger than 16 MiB/, 'one byte over 16 MiB in UTF-8 (16 MiB − 1 characters)');
  await refuse('x'.repeat(MAX - 3) + 'あ', /not JSON/, 'exactly 16 MiB in UTF-8 passes the size check (and fails as JSON)');
  await refuse('あ'.repeat(6 * 1024 * 1024), /larger than 16 MiB/, 'multibyte text over 16 MiB in UTF-8 (6 Mi characters)');
  await refuse(JSON.stringify([f]), /not a QA save file/, 'a list instead of the file');
  await refuse(outer({ format: 'rbn-qa-save' }), /not a QA save file/, 'another format');
  await refuse(outer({ extra: 1 }), /unexpected fields/, 'an unknown field');
  await refuse(outer({ fv: 2 }), /unknown file version/, 'file version 2');
  await refuse(outer({ saveSchema: RB.SAVE_SCHEMA + 1 }), /newer version/, 'a newer save schema');
  await refuse(outer({ saveSchema: '1' }), /bad save schema/, 'a schema that is not a number');
  await refuse(outer({ sourceSlot: 21 }), /bad source slot/, 'source slot 21');
  await refuse(outer({ label: 'x'.repeat(81) }), /bad label/, 'a label over 80 characters');
  await refuse(outer({ exportedAt: 5 }), /bad exportedAt/, 'an export time that is not text');
  await refuse(outer({ sha256: 'ABC' }), /checksum missing/, 'a malformed checksum');
  await refuse(outer({ payload: f.payload.replace('Tester', 'Testor') }), /checksum mismatch/, 'one changed character in the payload');
  await refuse(outer({ payload: f.payload.slice(0, -40) }), /checksum mismatch/, 'a payload cut short, before it is parsed');
  { const p = '[{'; await refuse(outer({ payload: p, sha256: sha(p) }), /payload is not JSON/, 'a payload that is not JSON, with a matching checksum'); }
  await refuse(inner({}), /1 to 6 records/, 'a payload that is not a list');
  await refuse(inner([]), /1 to 6 records/, 'an empty payload');
  { const r = copy(); await refuse(inner(r.concat(r, r).slice(0, 7)), /1 to 6 records/, 'seven records'); }
  { const r = copy(); r[0].thumb = 'x'; await refuse(inner(r), /record 1: unexpected fields/, 'a record with an extra field'); }
  { const r = copy(); r[3].kind = 'cloud'; await refuse(inner(r), /record 4: unknown kind/, 'an unknown kind'); }
  { const r = copy(); r.push(Object.assign({}, r[0])); await refuse(inner(r), /more manual records/, 'two manual saves'); }
  { const r = copy(); r.push(Object.assign({}, r[1], { savedAt: r[2].savedAt + 1 }), Object.assign({}, r[1], { savedAt: r[2].savedAt + 2 })); await refuse(inner(r), /more auto records/, 'four autosaves'); }
  { const r = copy(); r[2].savedAt = r[1].savedAt; await refuse(inner(r), /duplicates auto:/, 'two autosaves at the same time'); }
  { const r = copy(); r[0].savedAt = 1.5; await refuse(inner(r), /finite whole number/, 'a fractional saved time'); }
  { const r = copy(); r[0].savedAt = null; await refuse(inner(r), /finite whole number/, 'a missing saved time (NaN serialises as null)'); }
  { const r = copy(); r[0].savedAt = String(r[0].savedAt); await refuse(inner(r), /finite whole number/, 'a saved time as text'); }
  { const r = copy(); r[0].savedAt = -1; await refuse(inner(r), /finite whole number/, 'a negative saved time'); }
  { const r = copy(); r[1].state = null; await refuse(inner(r), /record 2: state missing/, 'a record without its state'); }
  { const r = copy(); r[2].state.map = 'nowhere'; await refuse(inner(r), /record 3: unknown map nowhere/, 'one invalid state among valid ones'); }
  { const r = copy(); delete r[0].state.player; await refuse(inner(r), /record 1: player missing/, 'a state without its player'); }
  { const r = copy(); r[0].state.v = RB.SAVE_SCHEMA + 1; await refuse(inner(r), new RegExp('record 1: bad save schema ' + (RB.SAVE_SCHEMA + 1)), 'a state from a newer schema'); }
  for (const v of [0, -1, 0.5, '1', null]) {
    const r = copy(); r[2].state.v = v;
    await refuse(inner(r), new RegExp('record 3: bad save schema ' + JSON.stringify(v).replace(/[.]/g, '\\.') + '$'), 'a state whose own schema is ' + JSON.stringify(v) + ' (the file\'s schema ' + f.saveSchema + ')');
  }
  { const r = copy(); delete r[1].state.v; await refuse(inner(r), /record 2: bad save schema null$/, 'a state without its schema'); }
  { const r = copy(); r[0].state.player.name = 'x'.repeat(65); await refuse(inner(r), /player name too long/, 'a player name over 64 characters'); }
  { const r = copy(); r[0].state.pad = 'x'.repeat(4 * 1024 * 1024); await refuse(inner(r), /state too large/, 'a state over 4 MiB'); }
  { const r = copy(); r[0].state.pad = 'あ'.repeat(1.5 * 1024 * 1024); await refuse(inner(r), /state too large/, 'a state over 4 MiB in UTF-8 bytes (under it in characters)'); }

  // ---- the ceiling at export: five records, each within 4 MiB, are refused together; four export and check -----------
  // (in session storage a pre-departure point is written first: there, writing one also trims the autosaves to two)
  {
    const pad = 'あ'.repeat(1200000); // 3,600,000 bytes in UTF-8, 1,200,000 characters
    const big = () => { const s = mk({ id: 'qa-big', name: 'Big' }); s.pad = pad; return s; };
    await RB.save.writeSlot(8, big());
    for (const kind of ['predeparture', 'auto', 'auto']) { await tick(); await RB.save.writeRecovery(8, big(), kind); }
    const four = await qa.exportSlot(8, 'four');
    const c4 = await qa.check(four.text);
    t.ok(JSON.parse(four.text).payload.length < 5e6 && four.fileBytes === Buffer.byteLength(four.text, 'utf8') && four.fileBytes > 14e6 && four.fileBytes <= MAX && c4.ok && c4.records.length === 4,
      'four large records: a ' + four.fileBytes + '-byte file (under 5 Mi characters), under the ceiling, that check() accepts');
    await tick(); await RB.save.writeRecovery(8, big(), 'auto');
    let e = null;
    try { await qa.exportSlot(8, 'five'); } catch (err) { e = err; }
    t.ok(e && /cannot be exported: the file is larger than 16 MiB/.test(e.message), 'five large records (each within 4 MiB; together over 16 MiB in UTF-8, about 6 Mi characters) are refused at export: ' + (e && e.message));
    await RB.save.del(8);
  }

  // ---- restore: IndexedDB only -----------------------------------------------------------------------------------
  {
    let e = null;
    try { await qa.restore(ex.text, 7); } catch (err) { e = err; }
    t.ok(e && /needs IndexedDB/.test(e.message) && /session-only/.test(e.message), 'restore is refused in session storage');
  }
  t.eq(JSON.stringify(await RB.save.list()), before, 'after every check and refusal the ledger reads exactly as before');
  t.eq((await RB.save.loadSettings()).marker, 'SETTINGS-MARKER', 'the settings untouched');
};
