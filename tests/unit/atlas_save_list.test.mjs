// The Save ledger's readability for Unwritten Atlas saves (Agnes 6563018827, 6563408499, 6563687836; Local CL-621,
// CL-623, CL-624; Cloud CC-459 to CC-461). An Atlas room is registered only while its run is current, so on a cold
// launch, after a return to the Hall or with another run active, a save in a room was listed "Unreadable" although Load
// (which rebuilds the run first) loads it. In localStorage (a stand-in store, so the stored bytes can be compared), with
// synthetic journeys only:
//  - the change and nothing else: list() alone takes the filtered errors; validate, read, migrate, the QA restore and
//    the Atlas code are as before (fingerprints taken on the parent);
//  - the camp save on a cold launch, with another run active, two saved runs of different seeds, and a run with the
//    active run's id and another seed: each listed readable, and each loads (into its room when it can be restored);
//  - an incompatible run, a missing run, a seed that is not a number, an unknown room and another run's id in the map:
//    listed readable, and each loads into the Lantern Hall (with its notice for the incompatible run);
//  - still "Unreadable" with the base's reason: run ids that are objects (three that stop prepare's own recovery, and
//    {}), a numeric id, the atlas record null, a string or a number; and, on an ordinary map, no player, a bad position,
//    a newer schema and an unknown map. On an Atlas map those three keep their own reason, without the "unknown map"
//    that the agreed rule drops;
//  - the single-field sweep, within Agnes's limit: on the Atlas map, every corruption the change newly lists as
//    readable loads; on an ordinary map, every listing is the base's (validate's) own;
//  - listing changes nothing: the stored bytes, the map keys, the registered runs and the active run's map objects.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { load } from '../lib/load.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ALL = ['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'];
const fp = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
// on the parent (6258dbc)
const PARENT = {
  'src/engine/80_save.js': 'ec13db2a2b685ee3', 'src/atlas/30_gen.js': '9f71fed033ad3025', 'src/atlas/50_run.js': 'a12801b2f9910bc8',
  'src/ui/30_title.js': 'a14e4179264f2eee', 'src/ui/66c_records.js': '0ffde28d06a4921f', 'src/ui/40_create.js': 'dae1561041a79331',
};

function storage() {
  const m = new Map();
  return {
    get length() { return m.size; }, key: (i) => (i < m.size ? [...m.keys()][i] : null),
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m,
  };
}

export default async (t) => {
  globalThis.__RB_TEST__ = true;

  // ---- the change, and nothing else ----------------------------------------------------------------------------------
  {
    const save = src('src/engine/80_save.js');
    const a = save.indexOf("  // the ledger's readability"), b = save.indexOf('  function migrate(st) {');
    const back = (a > 0 && b > a ? save.slice(0, a) + save.slice(b) : save)
      .replace("      const errs = r && r.state ? listErrors(r.state) : null;\n      const corrupt = r && (!r.state || errs.length > 0);\n", '      const corrupt = r && (!r.state || validate(r.state).length > 0);\n')
      .replace("        corruptWhy: corrupt ? (r.state ? errs.join('; ') : 'no data') : null,\n", "        corruptWhy: corrupt ? (r.state ? validate(r.state).join('; ') : 'no data') : null,\n");
    t.ok(back !== save && fp(back) === PARENT['src/engine/80_save.js'] && (save.match(/listErrors\(/g) || []).length === 2,
      'the save file is its parent plus listErrors and the two lines of list() that use it (corrupt and its reason from one list)');
    const same = Object.keys(PARENT).filter((f) => f !== 'src/engine/80_save.js' && fp(src(f)) === PARENT[f]);
    t.eq(same.length, 5, 'the Atlas generator and run, the title, the travel volume and the New Game+ offer are as on the parent');
  }

  const LS = storage();
  const RB = load(ALL, { __RB_TEST__: true, localStorage: LS });
  const AT = RB.atlas, C = RB.content;
  t.eq(await RB.save.detect(), 'local', 'the save layer runs on the stand-in localStorage');
  RB.game.inBattle = () => false;
  const raw = () => JSON.stringify([...LS._m.entries()].filter(([k]) => k.startsWith('rbn:')).sort());
  const cold = () => { for (const id in C.maps) if (id.startsWith('atlas.')) delete C.maps[id]; AT._registered.clear(); RB.maps.invalidate(); };
  const regs = () => JSON.stringify([...AT._registered.entries()].map(([k, v]) => [k, v.seed]).sort());
  const camp = (seed, room = 'c') => {
    const s = RB.state.newCampaign({ profile: 'I' });
    s.id = 'asl-' + seed; s.comp = 'nao'; s.flags.postgame = true; s.player.name = 'Tester';
    RB.game.s = s;
    s.atlas.run = AT.newRun(s, ['fog'], { seed });
    const p = AT.plan(s.atlas.run);
    s.map = AT.mapId(s.atlas.run, room);
    const sp = AT.spawnOf(s.atlas.run, p.rooms[room]);
    s.x = sp[0]; s.y = sp[1];
    return s;
  };
  const village = () => { const s = RB.state.newCampaign({ profile: 'I' }); s.id = 'asl-v'; s.player.name = 'Tester'; s.map = 'rw.village'; s.x = 4; s.y = 5; return s; };
  const clearSlots = async () => { for (let i = 1; i <= 20; i++) await RB.save.del(i); };
  // a listing, watched: the stored bytes, the map keys, the registered runs and the given map objects are the same after
  let quiet = true;
  async function list(watch = []) {
    const b = raw(), k = Object.keys(C.maps).sort().join(), r = regs(), objs = watch.map((id) => C.maps[id]);
    const out = await RB.save.list();
    if (raw() !== b || Object.keys(C.maps).sort().join() !== k || regs() !== r || watch.some((id, i) => C.maps[id] !== objs[i])) quiet = false;
    return out;
  }
  const readable = (row) => row && row.manual && !row.corrupt && row.corruptWhy === null;
  async function loads(slot) { try { const r = await RB.save.read(slot, 'manual'); return r && r.state ? r.state : null; } catch (e) { return null; } }

  // ---- the camp save on a cold launch -----------------------------------------------------------------------------------
  const A = camp(777);
  const roomA = A.map;
  await RB.save.writeSlot(1, A);
  cold();
  let rows = await list();
  t.ok(readable(rows[0]) && rows[0].meta && rows[0].meta.name === 'Tester',
    'a cold launch: the camp save is listed readable, with its journey ' + JSON.stringify([rows[0].corrupt, rows[0].corruptWhy]));
  t.eq(RB.save.validate(JSON.parse(LS.getItem('rbn:slots:1')).state), ['unknown map ' + roomA], 'its stored state still fails validate alone (unchanged): only the unknown room');
  let st = await loads(1);
  t.ok(st && st.map === roomA && st.x === A.x && st.y === A.y && st.atlas.run && st.atlas.run.seed === 777, 'and Load reads it into its room, where it was saved');

  // ---- another run active; two saved runs of different seeds; the active run's id with another seed --------------------
  await clearSlots(); cold();
  const B = camp(888), roomB = B.map;
  const sameId = JSON.parse(JSON.stringify(A)); sameId.atlas.run.seed = 999; // hand-made: a run's id is its seed in base 36
  await RB.save.writeSlot(1, A); await RB.save.writeSlot(2, B); await RB.save.writeSlot(3, sameId);
  cold();
  AT.register(JSON.parse(JSON.stringify(A.atlas.run))); // the run of seed 777 is the active one
  const activeRooms = Object.keys(C.maps).filter((id) => id.startsWith('atlas.'));
  rows = await list(activeRooms);
  t.ok(readable(rows[0]) && readable(rows[1]) && readable(rows[2]),
    'with another run active: its own save, a saved run of another seed, and one with its id and another seed are each listed readable');
  t.ok(quiet && regs() === JSON.stringify([[A.atlas.run.id, 777]]) && C.maps[roomA] && !C.maps[roomB],
    'and listing them leaves the active run\'s maps and registrations exactly as they were (nothing of the other runs registered)');
  cold();
  rows = await list();
  t.ok(readable(rows[0]) && readable(rows[1]), 'two saved runs of different seeds, cold: both listed readable');
  st = await loads(2);
  t.ok(st && st.map === roomB && st.atlas.run.seed === 888, 'and the second loads into its own room');
  cold();
  st = await loads(3);
  t.ok(st && (st.map === roomA || st.map === 'rw.hall'), 'the active run\'s id with another seed: Load returns a state (' + (st && st.map === 'rw.hall' ? 'the Hall' : 'a room') + ')');

  // ---- listed readable, and Load recovers to the Lantern Hall -----------------------------------------------------------
  await clearSlots(); cold();
  const hallCases = [
    ['an incompatible run (another generator version)', (s) => { s.atlas.run.v = 99; }],
    ['a missing run', (s) => { s.atlas.run = null; }],
    ['a seed that is not a number', (s) => { s.atlas.run.seed = '777'; }],
    ['an unknown room of the run', (s) => { s.map = AT.mapId(s.atlas.run, 'q9'); }],
    ['another run\'s id in the map', (s) => { s.map = 'atlas.zzzz.c'; }],
    ['the atlas record missing', (s) => { delete s.atlas; }],
  ];
  for (let i = 0; i < hallCases.length; i++) { const s = camp(777); hallCases[i][1](s); await RB.save.writeSlot(i + 1, s); }
  cold();
  rows = await list();
  for (let i = 0; i < hallCases.length; i++) {
    cold();
    st = await loads(i + 1);
    t.ok(readable(rows[i]) && st && st.map === 'rw.hall' && st.flags.atlas_restored_to_hall === true,
      hallCases[i][0] + ': listed readable, and Load returns it in the Lantern Hall, with the flag for its notice ' + JSON.stringify([rows[i].corruptWhy, st && st.map]));
  }

  // ---- still "Unreadable", with the base's reason -----------------------------------------------------------------------
  await clearSlots(); cold();
  const keep = [
    ['run id {"toString":null,"valueOf":null}', (s) => { s.atlas.run.id = JSON.parse('{"toString":null,"valueOf":null}'); }],
    ['run id {"toString":null}', (s) => { s.atlas.run.id = JSON.parse('{"toString":null}'); }],
    ['run id [{"toString":null}]', (s) => { s.atlas.run.id = JSON.parse('[{"toString":null}]'); }],
    ['run id {}', (s) => { s.atlas.run.id = {}; }],
    ['a numeric run id', (s) => { s.atlas.run.id = 5; }],
    ['the atlas record null', (s) => { s.atlas = null; }],
    ['the atlas record a string', (s) => { s.atlas = 'str'; }],
    ['the atlas record a number', (s) => { s.atlas = 7; }],
  ];
  const ordinary = [
    ['no player name', (s) => { delete s.player.name; }],
    ['a bad position', (s) => { s.x = 'a'; }],
    ['a newer schema', (s) => { s.v = RB.SAVE_SCHEMA + 1; }],
    ['an unknown ordinary map', (s) => { s.map = 'rw.nowhere'; }],
  ];
  const states = [];
  for (const [, f] of keep) { const s = camp(777); f(s); states.push(s); }
  for (const [, f] of ordinary) { const s = village(); f(s); states.push(s); }
  for (const [, f] of ordinary.slice(0, 3)) { const s = camp(777); f(s); states.push(s); }
  for (let i = 0; i < states.length; i++) await RB.save.writeSlot(i + 1, states[i]);
  cold();
  rows = await list();
  // every base reason first, while the maps are as the listing saw them (a Load below registers its run's rooms)
  const whys = states.map((x, i) => RB.save.validate(JSON.parse(LS.getItem('rbn:slots:' + (i + 1))).state));
  for (let i = 0; i < keep.length; i++) {
    const why = whys[i].join('; ');
    t.ok(rows[i].corrupt && rows[i].corruptWhy === why && /^unknown map atlas\./.test(why),
      keep[i][0] + ': still "Unreadable", with the base\'s reason (' + rows[i].corruptWhy + ')');
  }
  const loaded = [];
  for (let i = 0; i < keep.length; i++) { cold(); loaded.push(!!(await loads(i + 1))); }
  // why they are kept out: Load cannot recover the three ids that stop prepare's own recovery, nor an atlas record that
  // is not an object; {} and a number would load into the Hall, so the list is stricter than Load there, never looser
  t.eq(loaded, [false, false, false, true, true, false, false, false], 'and as Load behaves on them: the three ids and the three atlas records fail to load; {} and a number would load into the Hall');
  for (let j = 0; j < ordinary.length; j++) {
    const i = keep.length + j;
    t.ok(rows[i].corrupt && rows[i].corruptWhy === whys[i].join('; '),
      'an ordinary map, ' + ordinary[j][0] + ': still "Unreadable", with the base\'s reason (' + rows[i].corruptWhy + ')');
  }
  for (let j = 0; j < 3; j++) {
    const i = keep.length + ordinary.length + j;
    const whole = whys[i];
    t.ok(rows[i].corrupt && whole.includes('unknown map ' + states[i].map) && rows[i].corruptWhy === whole.filter((e) => e !== 'unknown map ' + states[i].map).join('; '),
      'an Atlas room, ' + ordinary[j][0] + ': still "Unreadable", with its own reason and not the dropped "unknown map" (' + rows[i].corruptWhy + ')');
  }

  // ---- the single-field sweep (Local CL-623, CL-624; Agnes 6563687836) -------------------------------------------------
  const VALUES = [null, 'x', 7, [], {}];
  function variants(mk) {
    const out = [];
    const s0 = mk();
    for (const k of Object.keys(s0)) {
      for (const v of VALUES) out.push(['state.' + k + ' = ' + JSON.stringify(v), (s) => { s[k] = JSON.parse(JSON.stringify(v)); }]);
      out.push(['state.' + k + ' removed', (s) => { delete s[k]; }]);
    }
    if (s0.atlas && s0.atlas.run) {
      for (const k of Object.keys(s0.atlas.run)) for (const v of VALUES) out.push(['run.' + k + ' = ' + JSON.stringify(v), (s) => { s.atlas.run[k] = JSON.parse(JSON.stringify(v)); }]);
      for (const v of VALUES) out.push(['run = ' + JSON.stringify(v), (s) => { s.atlas.run = JSON.parse(JSON.stringify(v)); }]);
    }
    return out;
  }
  let atlasCases = 0, atlasNew = 0, atlasBad = [], ordCases = 0, ordBad = [], unstorable = 0;
  for (const [mk, isAtlas] of [[() => camp(777), true], [village, false]]) {
    const vs = variants(mk);
    for (let at = 0; at < vs.length; at += 20) {
      await clearSlots(); cold();
      const batch = [];
      for (let i = 0; i < 20 && at + i < vs.length; i++) {
        const s = mk(); vs[at + i][1](s);
        try { await RB.save.writeSlot(batch.length + 1, s); batch.push(vs[at + i][0]); } catch (e) { unstorable++; }
      }
      cold();
      const rs = await list();
      // every base reason first, while the maps are as the listing saw them (a Load below registers its run's rooms)
      const stored = batch.map((x, i) => JSON.parse(LS.getItem('rbn:slots:' + (i + 1))).state);
      const wholes = stored.map((x) => RB.save.validate(x));
      for (let i = 0; i < batch.length; i++) {
        const whole = wholes[i];
        if (isAtlas) {
          atlasCases++;
          const fresh = !rs[i].corrupt && whole.length > 0;
          if (fresh) { atlasNew++; cold(); if (!(await loads(i + 1))) atlasBad.push(batch[i]); }
          if (rs[i].corrupt && !(rs[i].corruptWhy === whole.join('; ') || rs[i].corruptWhy === whole.filter((e) => e !== 'unknown map ' + stored[i].map).join('; '))) atlasBad.push(batch[i] + ' (reason)');
        } else {
          ordCases++;
          if (rs[i].corrupt !== whole.length > 0 || rs[i].corruptWhy !== (whole.length ? whole.join('; ') : null)) ordBad.push(batch[i]);
        }
      }
    }
  }
  t.ok(atlasNew > 0 && !atlasBad.length, 'the Atlas map, ' + atlasCases + ' single-field corruptions written (' + unstorable + ' on both maps that writeSlot\'s own meta step refuses are not in the sweep): every one newly listed readable (' + atlasNew + ') loads, and each one still unreadable keeps the base\'s reason or that reason without "unknown map" ' + JSON.stringify(atlasBad.slice(0, 5)));
  t.ok(ordCases > 0 && !ordBad.length, 'an ordinary map, ' + ordCases + ' single-field corruptions: every listing is the base\'s own ' + JSON.stringify(ordBad.slice(0, 5)));

  t.ok(quiet, 'listing changed nothing, every time: the stored bytes, the map keys, the registered runs, the active run\'s map objects');
};
