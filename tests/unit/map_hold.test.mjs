// A map that holds you while a story moment lasts (map.def.hold; src/engine/50_world.js holdAt, used by arrive() and by
// the test driver's routes, tests/e2e/drive.mjs): which exits it holds, and when. The village's night before departure
// (rw_night) holds its roads out, not its doors; a hold names exceptions and may hold doors too; the first hold that
// holds is the one; a cleared condition releases; only the definition and state given count, and neither is changed.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.state, C = RB.content, held = RB.world.holdAt;
  t.ok(typeof held === 'function', 'RB.world.holdAt is the world\'s own test, exported');

  // the village's night: its roads out held, its doors open, nothing held by day
  const s = S.newCampaign({});
  const v = C.maps['rw.village'], m = RB.maps.compile('rw.village');
  const roads = m.exits.filter((e) => !e.door), doors = m.exits.filter((e) => e.door);
  t.ok(roads.some((e) => e.to === 'rw.millroad') && doors.length > 0, 'the village has roads out (the mill road among them) and doors (' + roads.map((e) => e.to).join(', ') + ')');
  t.eq(m.exits.filter((e) => held(v, e, s)).map((e) => e.to), [], 'by day, no exit of the village is held');
  s.flags.rw_night = true;
  const h = held(v, roads.find((e) => e.to === 'rw.millroad'), s);
  t.ok(h && h.scene === 'rw.night_hold', 'on the night before departure, the road to the mill is held, with the scene that says why (' + JSON.stringify(h) + ')');
  t.eq(roads.filter((e) => !held(v, e, s)).map((e) => e.to), [], 'and every other road out');
  t.eq(doors.filter((e) => held(v, e, s)).map((e) => e.to), [], 'but no door: the houses, the hall and the teahouse stay open');
  delete s.flags.rw_night;

  // a hold's exceptions and doors, and a map with no hold
  const def = { hold: [{ if: 'test_hold', scene: 'x.hold', except: ['x.home'] }] }, defD = { hold: [{ if: 'test_hold', scene: 'x.hold', doors: true }] };
  const road = { to: 'x.road' }, home = { to: 'x.home' }, door = { to: 'x.house', door: true };
  t.eq([held(def, road, s), held(defD, door, s)], [null, null], 'a hold whose condition does not hold holds nothing');
  s.flags.test_hold = true;
  t.eq([!!held(def, road, s), !!held(def, home, s), !!held(def, door, s)], [true, false, false], 'a hold holds a road, not an excepted way, not a door');
  t.eq(!!held(defD, door, s), true, 'a hold that says doors holds a door too');
  t.eq([held({}, road, s), held(null, road, s)], [null, null], 'a map with no hold holds nothing');
  // several holds: the first that holds (as arrive() found it); a hold released when its condition clears
  const def2 = { hold: [{ if: 'test_hold2', scene: 'x.first' }, { if: 'test_hold', scene: 'x.second' }, { if: 'test_hold', scene: 'x.third' }] };
  t.eq(held(def2, road, s).scene, 'x.second', 'of several holds, the first whose condition holds');
  s.flags.test_hold2 = true;
  t.eq(held(def2, road, s).scene, 'x.first', 'and the first of all once its condition holds too');
  delete s.flags.test_hold2; delete s.flags.test_hold;
  t.eq([held(def, road, s), held(def2, road, s)], [null, null], 'the condition cleared: released');
  // only what it is given: the map definition and state passed in (not the map the world has loaded), and nothing changed
  s.flags.rw_night = true;
  const before = JSON.stringify([v.hold, s.flags]);
  t.ok(!!held(v, { to: 'rw.millroad' }, s) && !held(C.maps['rw.road'], { to: 'rw.village' }, s), 'the village\'s hold for the village, none for the road, whatever map is loaded');
  t.eq(JSON.stringify([v.hold, s.flags]), before, 'the definition and the state are left as they were');
  delete s.flags.rw_night;

  // every hold in the game: the scene that says why exists, and its map has ways out to hold
  for (const id of Object.keys(C.maps)) {
    for (const hd of C.maps[id].hold || []) {
      const cm = RB.maps.compile(id);
      t.ok(!!C.scenes[hd.scene], id + ': its hold\'s scene ' + hd.scene + ' exists');
      t.ok(Array.isArray(cm.exits) && cm.exits.length > 0, id + ': a map with a hold has ways out to hold');
    }
  }
};
