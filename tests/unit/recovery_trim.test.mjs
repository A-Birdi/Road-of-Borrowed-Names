// Recovery points outside IndexedDB, session-only here (Agnes 6434739887; Local CL-468, CL-469; CC-335 to CC-337): the
// new record is stored first and only an autosave trims, keeping the newest AUTO_KEEP (3), as IndexedDB already does.
//  - three autosaves survive a pre-departure point and a suspend point (they trimmed to two before);
//  - a fourth autosave removes only the oldest; the pre-departure and suspend points stay;
//  - a state that cannot be copied stops the write before anything changes;
//  - a trim that fails after the write keeps the record just saved, reports apart from a failed autosave (lastError,
//    save:trimError) and may leave four autosaves; nothing claims one transaction.
// tests/e2e/recovery_trim.mjs does the same in localStorage, with the store full.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  t.eq(await RB.save.detect(), 'session', 'session-only in the unit context');
  RB.game.inBattle = () => false;
  const tick = () => new Promise((r) => setTimeout(r, 3));
  const mk = (x) => { const s = RB.state.newCampaign(); s.id = 'trim'; s.map = 'rw.village'; s.x = x; s.y = 5; s.player.name = 'Trim'; return s; };
  // the session store itself (the save module's own Map, caught as it is first written; read only)
  const VmMap = RB.content.constructor.constructor('return Map')();
  const set = VmMap.prototype.set;
  let mem = null;
  VmMap.prototype.set = function (k, v) { if (typeof k === 'string' && k.startsWith('slots:')) mem = this; return set.call(this, k, v); };
  await RB.save.writeSlot(2, mk(1));
  VmMap.prototype.set = set;
  t.ok(mem && mem.has('slots:2'), 'the session store is read directly');
  // every record of a slot: its kind and saved time, oldest first
  const recs = async (slot) => [...mem.entries()].filter(([k]) => k.startsWith('recovery:' + slot + ':')).map(([, v]) => v).sort((x, y) => x.savedAt - y.savedAt).map((r) => r.kind + '@' + r.savedAt);
  const autos = async (slot) => (await recs(slot)).filter((k) => k.startsWith('auto@'));

  const a = [];
  for (let i = 0; i < 3; i++) { await tick(); a.push((await RB.save.writeRecovery(2, mk(10 + i), 'auto')).savedAt); }
  t.eq(await autos(2), a.map((x) => 'auto@' + x), 'three autosaves');
  await tick(); const pre = (await RB.save.writeRecovery(2, mk(20), 'predeparture')).savedAt;
  await tick(); const sus = (await RB.save.writeRecovery(2, mk(21), 'suspend')).savedAt;
  t.eq(await autos(2), a.map((x) => 'auto@' + x), 'three autosaves survive a pre-departure point and a suspend point');
  await tick(); const a4 = (await RB.save.writeRecovery(2, mk(13), 'auto')).savedAt;
  t.eq(await autos(2), [a[1], a[2], a4].map((x) => 'auto@' + x), 'a fourth autosave removes only the oldest');
  t.ok((await recs(2)).includes('predeparture@' + pre) && (await recs(2)).includes('suspend@' + sus), 'the pre-departure and suspend points stay');

  // a state that cannot be copied: nothing is written or removed
  const before = JSON.stringify(await recs(2));
  const bad = mk(30); bad.vars.big = BigInt(1);
  let e1 = null;
  try { await RB.save.writeRecovery(2, bad, 'auto'); } catch (e) { e1 = e; }
  t.ok(e1 && JSON.stringify(await recs(2)) === before, 'a state that cannot be copied stops the write before anything changes');

  // a trim that fails after the write: the vm's own Map refuses to delete autosaves for a moment
  const del = VmMap.prototype.delete;
  let events = 0;
  RB.bus.on('save:trimError', () => { events++; });
  VmMap.prototype.delete = function (k) { if (typeof k === 'string' && k.startsWith('recovery:2:auto:')) throw new Error('cannot remove'); return del.call(this, k); };
  let a5, e2 = null;
  try { await tick(); a5 = (await RB.save.writeRecovery(2, mk(14), 'auto')).savedAt; } catch (e) { e2 = e; } finally { VmMap.prototype.delete = del; }
  const after = await autos(2);
  t.ok(!e2 && a5 && after.length === 4 && after.includes('auto@' + a5), 'a trim that fails keeps the autosave just written (four remain, truthfully): ' + after.join(' '));
  t.ok(/^Autosaved, but older autosaves could not be removed \(cannot remove\)$/.test(RB.save.status().lastError) && events === 1, 'and is reported apart from a failed autosave: ' + RB.save.status().lastError);
  await tick(); const a6 = (await RB.save.writeRecovery(2, mk(15), 'auto')).savedAt;
  t.eq(await autos(2), [a[2], a4, a5, a6].slice(-3).map((x) => 'auto@' + x), 'the next autosave trims back to three');
};
