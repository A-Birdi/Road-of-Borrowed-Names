// Recovery points in localStorage (IndexedDB blocked), in Chromium on the built game, synthetic saves only (Agnes
// 6434739887; Local CL-468, CL-469; CC-335 to CC-337). The record is stored first; only an autosave trims, keeping the
// newest three; nothing is removed before a write succeeds:
//  1. three autosaves survive a pre-departure point and a suspend point; a fourth removes only the oldest;
//  2. a store that would fit a new autosave only after removing the oldest: the autosave fails visibly ("Autosave
//     failed"), and every value in the store is byte-identical (the accepted trade-off: no delete to make room);
//  3. a store too full even for that (the journey has grown since the oldest autosave): the same; and a pre-departure
//     point that does not fit removes nothing;
//  4. a removal that fails after a successful write keeps the new autosave, says so apart ("Autosaved, but older
//     autosaves could not be removed"), and four autosaves truthfully remain.
// Usage: node tools/build.mjs && node tests/e2e/recovery_trim.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// a fresh context with IndexedDB refused, a journey in slot 2 with its manual save, a pre-departure point, a suspend
// point and three autosaves (the pre-departure and suspend points first, so the old order trims nothing while seeding),
// the page's notices recorded
async function fresh() {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } }); });
  const P = await page(b, url, { context: ctx });
  const mode = await P.p.evaluate(async () => {
    RB.game.inBattle = () => false;
    const s = RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'nao', profile: 'E', flags: { departed: true } });
    s.player.name = 'Trim 2';
    await new Promise((r) => setTimeout(r, 40));
    await RB.save.writeSlot(2, s, { force: true, thumb: RB.render.thumbnail() });
    RB.save.setCurrent(2, 1);
    await RB.save.writeRecovery(2, s, 'predeparture', RB.render.thumbnail());
    await new Promise((r) => setTimeout(r, 5));
    await RB.save.writeRecovery(2, s, 'suspend', RB.render.thumbnail());
    // with their thumbnails, as autosave() writes them, so a new autosave is about the size of the oldest
    for (let i = 0; i < 3; i++) { await new Promise((r) => setTimeout(r, 5)); await RB.save.writeRecovery(2, s, 'auto', RB.render.thumbnail()); }
    window.__notes = [];
    const n = RB.ui.notice;
    RB.ui.notice = (text, kind) => { window.__notes.push(String(text)); return n(text, kind); };
    return RB.save._mode();
  });
  return { ctx, P, mode };
}
const store = (p) => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
const autoKeys = (o) => Object.keys(o).filter((k) => k.startsWith('rbn:recovery:2:auto:')).sort();
// the records a failure must leave exactly as they were: the manual save, the pre-departure and suspend points, every autosave
const kept = (o) => Object.keys(o).filter((k) => k === 'rbn:slots:2' || k.startsWith('rbn:recovery:2:')).sort().map((k) => [k, o[k]]);
const keptOk = (before, after, extra) => { const b = kept(before), a = kept(after).filter(([k]) => !(extra || []).includes(k)); return b.length === 6 && JSON.stringify(a) === JSON.stringify(b); };
const same = (a, z) => JSON.stringify(Object.keys(a).sort().map((k) => [k, a[k]])) === JSON.stringify(Object.keys(z).sort().map((k) => [k, z[k]]));
// fill the store until about `room` characters (UTF-16 code units, as Chromium counts them) are left
const fillTo = (p, room) => p.evaluate((room) => {
  const fits = (n) => { try { localStorage.setItem('rbn:zfill', 'x'.repeat(n)); return true; } catch (e) { return false; } finally { localStorage.removeItem('rbn:zfill'); } };
  let lo = 0, hi = 12 * 1024 * 1024;
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (fits(mid)) lo = mid; else hi = mid - 1; }
  localStorage.setItem('rbn:zfill', 'x'.repeat(Math.max(0, lo - room)));
  return lo;
}, room);

// 1. survive and rotate
{
  const { ctx, P, mode } = await fresh();
  ok(mode === 'local', '1 localStorage only (IndexedDB blocked): ' + mode);
  let o = await store(P.p);
  const three = autoKeys(o);
  await P.p.evaluate(async () => { const s = RB.game.s; await RB.save.writeRecovery(2, s, 'predeparture', null); await new Promise((r) => setTimeout(r, 5)); await RB.save.writeRecovery(2, s, 'suspend', null); });
  o = await store(P.p);
  ok(three.length === 3 && JSON.stringify(autoKeys(o)) === JSON.stringify(three) && o['rbn:recovery:2:predeparture'] && o['rbn:recovery:2:suspend'], '1 three autosaves survive a pre-departure point and a suspend point');
  await P.p.evaluate(async () => { await new Promise((r) => setTimeout(r, 5)); await RB.save.autosave('auto'); });
  o = await store(P.p);
  const now = autoKeys(o);
  ok(now.length === 3 && now[0] === three[1] && now[1] === three[2] && !now.includes(three[0]) && o['rbn:recovery:2:predeparture'] && o['rbn:recovery:2:suspend'], '1 a fourth autosave removes only the oldest');
  ok(!P.errors.length, '1 no page errors' + (P.errors.length ? ': ' + P.errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 2 and 3. a full store: nothing removed to make room
for (const [tag, share] of [['2 fits only after removing the oldest', 0.5], ['3 too full even after removing it', 0.05]]) {
  const { ctx, P } = await fresh();
  // the oldest autosave's size, and the newest's (about what the next one will be: the same state, the same thumbnail)
  const sz = await P.p.evaluate(() => { const ks = Object.keys(localStorage).filter((x) => x.startsWith('rbn:recovery:2:auto:')).sort(); const n = (k) => k.length + localStorage.getItem(k).length; return { oldest: n(ks[0]), newest: n(ks[ks.length - 1]) }; });
  const size = sz.newest, room = Math.floor(size * share);
  // 3: the journey has grown since (a quarter more state), so even the oldest's room is not enough
  const grow = share >= 0.5 ? 0 : Math.ceil(size / 4);
  if (grow) await P.p.evaluate((n) => { RB.game.s.vars.trimPad = 'x'.repeat(n); }, grow);
  await fillTo(P.p, room);
  if (share >= 0.5) ok(room < size && room + sz.oldest > size * 1.2, tag + ': the room left (' + room + ') is short of a new autosave (~' + size + ') and would fit one once the oldest (' + sz.oldest + ') went');
  else ok(room + sz.oldest < size + grow - 1000, tag + ': the room left (' + room + ') plus the oldest (' + sz.oldest + ') is short of the new autosave (~' + (size + grow) + ')');
  const before = await store(P.p);
  ok(before['rbn:slots:2'] && before['rbn:recovery:2:predeparture'] && before['rbn:recovery:2:suspend'] && autoKeys(before).length === 3, tag + ': the fixture holds the manual save, a pre-departure point, a suspend point and three autosaves');
  const r = await P.p.evaluate(async () => { await new Promise((res) => setTimeout(res, 5)); const rec = await RB.save.autosave('auto'); return { rec: !!rec, err: RB.save.status().lastError, notes: window.__notes.slice() }; });
  const after = await store(P.p);
  ok(!r.rec && /quota|exceeded/i.test(r.err || '') && r.notes.some((n) => /^Autosave failed/.test(n)), tag + ': the autosave fails visibly (' + r.notes.join(' | ').slice(0, 120) + ')');
  ok(same(before, after) && autoKeys(after).length === 3 && keptOk(before, after), tag + ': every value in the store is byte-identical: the manual save, the pre-departure and suspend points and the three autosaves, exactly');
  if (share < 0.5) {
    // (it replaces the stored pre-departure point under the same key, so it is written as the game would, with its
    // thumbnail and the grown journey: larger than the one it replaces by more than the room left)
    const e = await P.p.evaluate(async () => { try { await RB.save.writeRecovery(2, RB.game.s, 'predeparture', RB.render.thumbnail()); return null; } catch (err) { return String(err && err.message || err); } });
    const after2 = await store(P.p);
    ok(e && same(before, after2) && keptOk(before, after2), tag + ': a pre-departure point that does not fit removes nothing either, and the old one stays exactly');
  }
  ok(!P.errors.length, tag + ': no page errors' + (P.errors.length ? ': ' + P.errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 4. a removal that fails after the write
{
  const { ctx, P } = await fresh();
  const full0 = await store(P.p);
  const before = autoKeys(full0);
  const r = await P.p.evaluate(async () => {
    const rm = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (k) { if (String(k).startsWith('rbn:recovery:2:auto:')) throw new Error('cannot remove'); return rm.call(this, k); };
    try { await new Promise((res) => setTimeout(res, 5)); const rec = await RB.save.autosave('auto'); return { key: rec && rec.key, err: RB.save.status().lastError, notes: window.__notes.slice() }; } finally { Storage.prototype.removeItem = rm; }
  });
  const full1 = await store(P.p);
  const after = autoKeys(full1);
  ok(r.key && after.length === 4 && after.includes('rbn:recovery:' + r.key) && before.every((k) => after.includes(k)), '4 the new autosave is kept and four remain, truthfully');
  ok(keptOk(full0, full1, ['rbn:recovery:' + r.key]), '4 the manual save, the pre-departure and suspend points and the three earlier autosaves are exactly as they were');
  ok(/^Autosaved, but older autosaves could not be removed/.test(r.err || '') && r.notes.some((n) => /^Autosaved, but older autosaves could not be removed: cannot remove/.test(n)) && !r.notes.some((n) => /^Autosave failed/.test(n)),
    '4 reported apart from a failed autosave: ' + r.notes.join(' | '));
  ok(!P.errors.length, '4 no page errors' + (P.errors.length ? ': ' + P.errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

console.log(`\nrecovery_trim: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
