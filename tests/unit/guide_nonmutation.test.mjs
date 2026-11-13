// Asking the quest guide leaves the journey as it was (CC-541 finding 2; Local CL-708; Agnes 6650249477; Cloud CC-559;
// Agnes 6807565638, option 1 bounded). The guide's copies of a journey have their own Satchel marks (`newItems`) and
// their own whole world record (src/engine/56_questguide.js cloneSt), and the town's two condition reads make no
// record (src/engine/53_town.js slotOf, eventHere). On the shipped content and the twelve fixture journeys:
//  1. the reads: slotOf and eventHere, and the conditions slot.<person> and roadev.<road>.<event> (and placedAt), on no
//     world, a world with no towns or roads, a town or road with no record, a partial record, non-default slots and
//     active, seen-through and unknown road events: each value as before, and nothing made or changed;
//  2. the whole guide: every fixture journey's every active quest through the public questions (targets, nudges, Next
//     lines, the way there, the analysis, reachability), asked, asked again, and asked in the other order: the whole
//     journey the same after each ask (own property by own property, undefined and NaN kept, every object the same
//     object); a simulated give marking nothing on the journey; the copies' world the question's own, with nothing
//     of the live journey's in it, and unchanged by every path of the question;
//  3. the answers: as an analysis of a copy of the journey gives them; and a live `scene.` condition, read by the
//     guide while its scene runs (the courier's, on the real runner) and false once it has ended;
//  4. the writers: two journeys, one asked before every step and one never asked, through leaving and entering a
//     town, the routine's ticks (after three moves away, and after a rest), road events chosen on arrival and seen
//     through, and a save and load: the same at every step, with the records made and changed by those writers.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

function storage() {
  const m = new Map();
  return {
    get length() { return m.size; }, key: (i) => (i < m.size ? [...m.keys()][i] : null),
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m,
  };
}

// A copy and a comparison that keep what JSON (and structuredClone) lose: an own property holding undefined is not a
// missing one, NaN is NaN, a property that is not enumerable (such as the practice record's own `_ok` mark,
// src/engine/08_practice.js) is kept as one, and a Set or Map is compared by its contents.
const tag = (x) => Object.prototype.toString.call(x);
function copyOf(v, seen = new Map()) {
  if (!v || typeof v !== 'object') return v;
  if (seen.has(v)) return seen.get(v);
  if (tag(v) === '[object Set]') { const o = new Set(); seen.set(v, o); for (const x of v) o.add(copyOf(x, seen)); return o; }
  if (tag(v) === '[object Map]') { const o = new Map(); seen.set(v, o); for (const [k, x] of v) o.set(k, copyOf(x, seen)); return o; }
  const o = Array.isArray(v) ? [] : {};
  seen.set(v, o);
  for (const k of Reflect.ownKeys(v)) {
    const d = Object.getOwnPropertyDescriptor(v, k);
    if ('value' in d) d.value = copyOf(d.value, seen);
    Object.defineProperty(o, k, d);
  }
  return o;
}
// the paths that differ (the first few)
function diff(a, b, p = '', out = []) {
  if (out.length >= 6 || Object.is(a, b)) return out;
  const show = (x) => (x === undefined ? 'undefined' : typeof x === 'number' && isNaN(x) ? 'NaN' : JSON.stringify(x));
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') { out.push((p || '.') + ': ' + String(show(a)).slice(0, 80) + ' → ' + String(show(b)).slice(0, 80)); return out; }
  if (tag(a) !== tag(b)) { out.push((p || '.') + ': ' + tag(a) + ' → ' + tag(b)); return out; }
  if (tag(a) === '[object Set]') {
    const A = [...a], B = [...b];
    if (A.length !== B.length || A.some((x) => !b.has(x))) out.push((p || '.') + ': set ' + JSON.stringify(A).slice(0, 80) + ' → ' + JSON.stringify(B).slice(0, 80));
    return out;
  }
  if (tag(a) === '[object Map]') {
    const ka = [...a.keys()], kb = [...b.keys()];
    if (ka.length !== kb.length || ka.some((k) => !b.has(k))) { out.push((p || '.') + ': map keys'); return out; }
    for (const k of ka) diff(a.get(k), b.get(k), p + '<' + String(k) + '>', out);
    return out;
  }
  const ka = Reflect.ownKeys(a), kb = Reflect.ownKeys(b);
  for (const k of ka) if (!Object.prototype.hasOwnProperty.call(b, k)) out.push(p + '.' + String(k) + ': present → absent');
  for (const k of kb) if (!Object.prototype.hasOwnProperty.call(a, k)) out.push(p + '.' + String(k) + ': absent → present');
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
    if (Object.prototype.propertyIsEnumerable.call(a, k) !== Object.prototype.propertyIsEnumerable.call(b, k)) out.push(p + '.' + String(k) + ': enumerable changed');
    diff(a[k], b[k], p + '.' + String(k), out);
  }
  return out;
}
// every object in the journey, down to three levels, by path: an ask must leave each the very same object
function objectsOf(s) {
  const out = new Map();
  const walk = (o, p, d) => { if (!o || typeof o !== 'object' || d > 3) return; out.set(p, o); for (const k of Object.keys(o)) walk(o[k], p + '.' + k, d + 1); };
  walk(s, '', 0);
  return out;
}
function sameObjects(before, s) {
  const now = objectsOf(s), bad = [];
  for (const [p, o] of before) if (now.get(p) !== o) bad.push(p || '.');
  return bad;
}
// every object reachable from a value (for "nothing of the live journey's in the copy")
function allObjects(o, set = new Set()) {
  if (!o || typeof o !== 'object' || set.has(o)) return set;
  set.add(o);
  for (const k of Object.keys(o)) allObjects(o[k], set);
  return set;
}

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const LS = storage();
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true, localStorage: LS });
  const C = RB.content, S = RB.state, T = RB.town, G = RB.questGuide;
  const snap = (s) => copyOf(s);
  const dir = path.join(root, 'tests', 'fixtures', 'campaign');
  const FIX = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const fixture = (f) => RB.save.migrate(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const active = (s) => Object.keys(s.quests).filter((q) => !s.quests[q].done && C.quests[q]);
  // the public questions, as the Journey, the markers and the world ask them
  function askQuest(s, q) {
    const r = G.targets(q, s);
    G.nudges(q, s); G.nextLines(r);
    try { G.wayFrom(r); } catch (e) { /* no world on the stand-in screen: the way is asked of RB.world */ }
    G.analyse(q, s, {});
    return r;
  }
  const answerOf = (s, q) => { G.reset(); const r = G.targets(q, s); return JSON.stringify({ stage: r.stage, how: r.how, needs: r.needs || null, mark: r.mark || null, targets: (r.targets || []).map((e) => e.key) }) + ' | ' + JSON.stringify(G.nudges(q, s)) + ' | ' + JSON.stringify(G.nextLines(r)); };

  // ---- 1. the two reads, and their conditions ----------------------------------------------------------------------
  {
    const town = Object.keys(C.towns).find((id) => C.towns[id].residents && C.towns[id].residents.oto);
    const road = 'sg_road', D = C.roadEvents[road];
    t.ok(town === 'reedwake' && C.towns.reedwake.residents.oto.slots === 3 && C.towns.reedwake.residents.kiku.slots === 3, '1 the cases: Oto and Kiku keep three places in Reedwake');
    t.ok(D && D.unique && D.unique.id === 'child' && (D.variants || []).some((v) => v.id === 'crab') && (D.maps || []).includes('sg.road'), '1 and the coast road has the child (its first event) and the crab');
    const base = () => { const s = S.newCampaign({ edition: 2 }); s.id = 'pure-reads'; return s; };
    const look = (s) => ({
      oto: T.slotOf(s, 'oto'), kiku: T.slotOf(s, 'kiku'), nao: T.slotOf(s, 'nao'),
      conds: ['slot.oto', 'slot.oto=1', 'slot.oto=2', 'slot.oto=3', 'slot.kiku=3', 'roadev.sg_road.child', 'roadev.sg_road.crab', 'roadev.zz_road.child'].filter((c) => S.test(s, c)),
      here: T.eventHere(s, road) ? T.eventHere(s, road).id : null, unknownRoad: T.eventHere(s, 'zz_road'), placed: T.placedAt(s, 'sg.road'),
    });
    const cases = [
      ['no world at all', (s) => { delete s.world; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['a world with no towns and no roads', (s) => { s.world = {}; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['towns and roads with no record for Reedwake or the coast road', (s) => { s.world.towns.saltglass = { tick: 1, slots: { tobi: 2 }, leftAt: 3, flags: {}, rests: 0 }; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['Reedwake with a partial record: Kiku at 3, Oto with none', (s) => { s.world.towns.reedwake = { tick: 2, slots: { kiku: 3 }, leftAt: 4, flags: {}, rests: 1 }; }, { oto: 1, kiku: 3, here: null, conds: ['slot.oto', 'slot.oto=1', 'slot.kiku=3'] }],
      ['Oto at 3 and Kiku at 2 (non-default slots)', (s) => { s.world.towns.reedwake = { tick: 5, slots: { oto: 3, kiku: 2 }, leftAt: 9, flags: { x: true }, rests: 2 }; }, { oto: 3, kiku: 2, here: null, conds: ['slot.oto=3'] }],
      ['a slot of 0 falls back to 1, as before', (s) => { s.world.towns.reedwake = { tick: 1, slots: { oto: 0 }, leftAt: null, flags: {}, rests: 0 }; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['the coast road with no event now', (s) => { s.world.roads.sg_road = { unique: 'offered', solved: {}, offered: 1, here: null }; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['the child standing on the coast road (active)', (s) => { s.world.roads.sg_road = { unique: 'offered', solved: {}, offered: 1, here: { id: 'child' }, visit: 3, lastMap: 'sg.road' }; }, { oto: 1, kiku: 1, here: 'child', conds: ['slot.oto', 'slot.oto=1', 'roadev.sg_road.child'] }],
      ['the child seen through (done)', (s) => { s.world.roads.sg_road = { unique: 'done', solved: { child: true }, offered: 1, here: { id: 'child', done: true } }; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['an event the road does not have (unknown)', (s) => { s.world.roads.sg_road = { unique: null, solved: {}, offered: 0, here: { id: 'zz_gone' } }; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
      ['a town record that is not an object reads as none, and stays', (s) => { s.world.towns.reedwake = null; }, { oto: 1, kiku: 1, here: null, conds: ['slot.oto', 'slot.oto=1'] }],
    ];
    for (const [name, make, want] of cases) {
      const s = base(); make(s);
      const before = snap(s), objs = objectsOf(s), hadWorld = 'world' in s;
      const got = look(s); look(s); // read twice: the second read sees what the first left
      const placedWant = want.here ? !!(D.unique.id === want.here ? D.unique.at : (D.variants.find((v) => v.id === want.here) || {}).at) : false;
      t.ok(got.oto === want.oto && got.kiku === want.kiku && got.nao === 1 && got.here === want.here && got.unknownRoad === null && got.placed === placedWant &&
        JSON.stringify(got.conds) === JSON.stringify(want.conds),
        '1 ' + name + ': the values read (slotOf, eventHere, placedAt and the conditions) ' + JSON.stringify(got));
      const d = diff(before, s), moved = sameObjects(objs, s);
      t.ok(!d.length && !moved.length && ('world' in s) === hadWorld, '1 ' + name + ': nothing made or changed ' + JSON.stringify({ d, moved }));
    }
  }

  // ---- 2. the whole guide, on every fixture journey ---------------------------------------------------------------
  {
    const freshWorld = snap(S.newCampaign({ edition: 2 }).world);
    const Ttest = S.test, Tgive = S.give;
    let live = null, worlds = new Set(), gives = [];
    S.test = (st, c) => { if (live && st && st !== live && st.world && typeof st.world === 'object') worlds.add(st.world); return Ttest(st, c); };
    S.give = (st, id, n) => { if (live && st !== live) gives.push({ id, sharesMarks: st.newItems === live.newItems }); return Tgive(st, id, n); };
    let asks = 0, copies = 0, sharedCopies = 0;
    // each public question on its own: the journey after it, and the copies of a world its paths read
    const questions = (s, q) => {
      let r = null;
      return [
        ['targets', () => { r = G.targets(q, s); }], ['nudges', () => G.nudges(q, s)], ['Next lines', () => G.nextLines(r)],
        ['the way there', () => { try { G.wayFrom(r); } catch (e) { /* no world on the stand-in screen */ } }], ['the analysis', () => G.analyse(q, s, {})],
      ];
    };
    const ask = (s, q, problems) => {
      for (const [name, fn] of questions(s, q)) {
        const before = snap(s), objs = objectsOf(s), liveWorld = allObjects(s.world), worldBefore = snap(s.world);
        worlds = new Set();
        fn();
        asks++;
        const d = diff(before, s), moved = sameObjects(objs, s);
        if (d.length || moved.length) problems.push(q + ' (' + name + '): ' + JSON.stringify({ d, moved }).slice(0, 300));
        // one copy of the journey's own world per question, shared by its paths (any other is a new journey's: the
        // steps passed within a scene are found on one, `passing`)
        const own = [...worlds].filter((w) => diff(freshWorld, w).length);
        if (own.length > 1) problems.push(q + ' (' + name + '): ' + own.length + ' copies of the journey\'s world in one question');
        if (worlds.size > 1) sharedCopies++;
        for (const w of worlds) {
          copies++;
          const shared = [...allObjects(w)].filter((o) => liveWorld.has(o)).length;
          const changed = diff(worldBefore, w).length && diff(freshWorld, w).length;
          if (shared || changed) problems.push(q + ' (' + name + '): a copy of the world ' + JSON.stringify({ shared, changed: diff(worldBefore, w) }).slice(0, 300));
        }
      }
    };
    for (const f of FIX) {
      const s = fixture(f); RB.game.s = s; live = s; G.reset();
      const qs = active(s), problems = [];
      for (const q of qs) ask(s, q, problems);
      for (const q of qs) ask(s, q, problems); // asked again (the cache's answers)
      G.reset();
      for (const q of qs.slice().reverse()) ask(s, q, problems); // in the other order
      const before = snap(s), objs = objectsOf(s);
      try { G.reachable(s); G.firstHop(s.map, ['rw.village', 'lf.town'], s); } catch (e) { problems.push('reachable: ' + e.message); }
      const d = diff(before, s), moved = sameObjects(objs, s);
      if (d.length || moved.length) problems.push('reachable: ' + JSON.stringify({ d, moved }).slice(0, 300));
      t.ok(qs.length > 0 && !problems.length, '2 ' + f + ': ' + qs.length + ' active quests, asked, asked again and asked in the other order: the whole journey the same after each ask, every object the same object, and each copy of the world the question\'s own and unchanged ' + JSON.stringify(problems.slice(0, 3)));
    }
    t.ok(asks === 15 * FIX.reduce((n, f) => n + active(fixture(f)).length, 0) && copies > 0, '2 in all: ' + asks + ' questions (five for each active quest, three times); ' + copies + ' copies of a world read by a question\'s paths, one of the journey\'s own at most per question (' + sharedCopies + ' questions also read a new journey\'s)');

    // a simulated give: the copy's own Satchel marks, never the journey's
    {
      const s = fixture('F-ren-ch2_done.json'); RB.game.s = s; live = s; G.reset();
      const marks = snap(s.newItems), inv = snap(s.inv);
      gives = [];
      askQuest(s, 'sg_seaglass');
      const plate = gives.filter((g) => g.id === 'sg_plate');
      t.ok(plate.length > 0 && plate.every((g) => !g.sharesMarks), '2 the Seaglass quest on the chapter 2 journey: the guide follows a give of the plate (' + plate.length + ' times), each on a copy with its own marks ' + JSON.stringify(gives.slice(0, 4)));
      t.ok(!diff(marks, s.newItems).length && !('sg_plate' in s.newItems) && !diff(inv, s.inv).length, '2 and the journey\'s Satchel marks and items are as they were (no plate marked new) ' + JSON.stringify({ marks: diff(marks, s.newItems), inv: diff(inv, s.inv) }));
    }
    S.test = Ttest; S.give = Tgive; live = null;
  }

  // ---- 3. the answers ----------------------------------------------------------------------------------------------
  {
    const bad = [];
    let n = 0;
    for (const f of FIX) {
      const s = fixture(f); RB.game.s = s;
      for (const q of active(s)) {
        const copy = snap(s);
        const a = answerOf(s, q), b = answerOf(copy, q);
        n++;
        if (a !== b) bad.push(f + ' ' + q + ': ' + a.slice(0, 120) + ' ≠ ' + b.slice(0, 120));
      }
    }
    t.ok(n > 0 && !bad.length, '3 every fixture journey\'s every active quest (' + n + '): the guide\'s answer (targets, nudges, Next lines) on the journey is the one an analysis of a copy gives ' + JSON.stringify(bad.slice(0, 3)));

    // a live scene. condition, read by the guide during the scene and after it (a stage placed by atIf on the
    // courier's scene, added for this test only, on the real runner with the screen and the encounter stood in for)
    const QID = 'zz_scene_probe';
    C.quests[QID] = { title: { en: 'probe', jp: 'probe' }, stages: [{ en: 'probe', jp: 'probe', atIf: [{ if: 'scene.cr.courier', at: { map: 'cr.hut', npc: 'cr_genta' } }], at: { map: 'cr.summit' } }] };
    RB.ui.dialogue.say = async () => {}; RB.ui.dialogue.choose = async () => 0; RB.ui.dialogue.hide = () => {};
    RB.ui.toast = async () => {}; RB.ui.fade = async () => {};
    for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
    RB.world.scriptMove = async () => {}; RB.game.afterScene = () => {}; RB.save.autosave = async () => {};
    const s = S.newCampaign({ edition: 2 }); s.id = 'pure-scene'; s.comp = 'nao'; s.map = 'cr.hut'; s.x = 14; s.y = 12;
    Object.assign(s.flags, { departed: true, cr_called: true, cr_hut_seen: true });
    s.quests[QID] = { stage: 0 };
    RB.game.G.s = s; RB.game.s = s;
    const where = (st) => { G.reset(); const r = G.targets(QID, st); return r.how + ':' + (r.targets || []).map((e) => e.map + '/' + (e.id || e.kind)).join(','); };
    const before = where(s);
    let during = null;
    RB.game.startEncounter = async () => {
      const b = snap(s), objs = objectsOf(s);
      during = { live: S.test(s, 'scene.cr.courier'), copy: S.test(snap(s), 'scene.cr.courier'), guide: where(s), guideOnCopy: where(snap(s)) };
      during.unchanged = !diff(b, s).length && !sameObjects(objs, s).length;
      return { result: 'end', outcome: 'fades' };
    };
    await RB.script.run('cr.courier');
    const after = { live: S.test(s, 'scene.cr.courier'), guide: where(s) };
    t.ok(before === 'authored:cr.summit/enter', '3 the probe stage before the courier\'s scene: its plain place (the summit) ' + before);
    t.ok(during && during.live === true && during.copy === false && during.guide === 'authored:cr.hut/cr_genta' && during.guideOnCopy === 'authored:cr.summit/enter' && during.unchanged,
      '3 while the scene runs: the condition holds on the journey (not on a copy), the guide reads it there and names Genta at the hut, and asking changed nothing ' + JSON.stringify(during));
    t.ok(after.live === false && after.guide === 'authored:cr.summit/enter', '3 once the scene has ended: the condition is false and the guide names the summit again ' + JSON.stringify(after));
    delete C.quests[QID]; delete s.quests[QID]; G.reset();
  }

  // ---- 4. the writers, asked and never asked -----------------------------------------------------------------------
  {
    t.eq(await RB.save.detect(), 'local', '4 the save layer runs on the stand-in localStorage');
    const base = fixture('F-ren-ch2_done.json');
    base.map = 'rw.village';
    const v = C.maps['rw.village'];
    [base.x, base.y] = v.spawn.default;
    t.ok(!base.world.towns.reedwake && !base.world.roads.rw_road && !base.world.roads.rw_mill && base.flags.departed, '4 the journey (chapter 2 done, in Reedwake): no record yet for Reedwake, the river road or the mill road');
    let A = snap(base), B = snap(base);
    const asked = (s) => {
      RB.game.s = s;
      for (const q of active(s)) askQuest(s, q);
      try { G.reachable(s); } catch (e) { /* as above */ }
      for (const id in C.towns) for (const p in C.towns[id].residents || {}) for (const k of [1, 2, 3]) S.test(s, 'slot.' + p + '=' + k);
      for (const rid in C.roadEvents) {
        const D = C.roadEvents[rid];
        for (const e of [D.unique].concat(D.variants || []).filter(Boolean)) S.test(s, 'roadev.' + rid + '.' + e.id);
        T.eventHere(s, rid);
        for (const m of D.maps || []) T.placedAt(s, m);
      }
    };
    const go = (s, map) => { const why = T.beforeEnter(s, map); s.map = map; T.visited(s, map); const ev = T.roadEventAt(s, map); return { why, ev }; };
    const step = (name, fn, check) => {
      asked(A);
      const a = fn(A), b = fn(B);
      const d = diff(B, A);
      t.ok(!d.length && JSON.stringify(a) === JSON.stringify(b), '4 ' + name + ': the asked journey and the unasked one are the same ' + JSON.stringify({ a, b, d }));
      if (check) check(A, a);
    };
    step('leaving Reedwake for the river road', (s) => go(s, 'rw.road'), (s, r) => {
      t.ok(s.world.towns.reedwake && s.world.towns.reedwake.leftAt === s.world.moves && s.world.roads.rw_road && s.world.roads.rw_road.here && s.world.roads.rw_road.here.id === 'cart' && r.ev,
        '4 the writers made their records: Reedwake\'s (left at this move) and the river road\'s, its first event (the cart) chosen on arrival ' + JSON.stringify({ town: s.world.towns.reedwake, road: s.world.roads.rw_road, ev: r.ev }));
    });
    const cart = snap(A.world.roads.rw_road);
    asked(A); asked(A);
    t.ok(!diff(cart, A.world.roads.rw_road).length && T.eventHere(A, 'rw_road').id === 'cart' && S.test(A, 'roadev.rw_road.cart'), '4 the cart, an active event, read again and again: unchanged, and still there');
    step('the cart seen through', (s) => { T.roadDone(s, 'rw_road', 'cart'); return T.eventHere(s, 'rw_road'); }, (s, r) => {
      t.ok(r === null && s.world.roads.rw_road.solved.cart, '4 seen through: recorded as solved, and nothing stands on the road now ' + JSON.stringify(s.world.roads.rw_road));
    });
    step('on to the mill road', (s) => go(s, 'rw.millroad'), (s) => {
      t.ok(s.world.roads.rw_mill && s.world.roads.rw_mill.here && s.world.roads.rw_mill.here.id === 'sacks', '4 the mill road\'s record made on arrival, its first event (the sacks) chosen ' + JSON.stringify(s.world.roads.rw_mill));
    });
    step('back to the river road (an event drawn from the stream, or none)', (s) => go(s, 'rw.road'));
    step('into Reedwake after three moves away: the routine ticks', (s) => go(s, 'rw.village'), (s, r) => {
      t.ok(r.why === 'away' && s.world.towns.reedwake.tick === 1 && ['oto', 'kiku', 'mame'].every((p) => [1, 2, 3].includes(s.world.towns.reedwake.slots[p])),
        '4 the tick: away, its slots drawn for all three ' + JSON.stringify({ why: r.why, town: s.world.towns.reedwake }));
    });
    // non-default slots, set the same on both, read and read again: unchanged
    for (const s of [A, B]) Object.assign(s.world.towns.reedwake.slots, { oto: 3, kiku: 2, mame: 2 });
    const slots = snap(A.world.towns.reedwake);
    asked(A); asked(A);
    t.ok(!diff(slots, A.world.towns.reedwake).length && T.slotOf(A, 'oto') === 3 && S.test(A, 'slot.kiku=2'), '4 non-default slots (Oto at 3, Kiku and Mame at 2), read again and again: unchanged');
    step('out to the river road, and a night\'s rest there', (s) => { const r = go(s, 'rw.road'); T.rested(s); return r; }, (s) => {
      t.ok(s.world.towns.reedwake.rests === s.world.rests - 1, '4 leaving keeps the rests seen then, and the rest is counted after it ' + JSON.stringify({ town: s.world.towns.reedwake.rests, world: s.world.rests }));
    });
    step('back into Reedwake after the rest: the routine ticks', (s) => go(s, 'rw.village'), (s, r) => {
      t.ok(r.why === 'rest' && s.world.towns.reedwake.tick === 2, '4 the tick: after a rest ' + JSON.stringify({ why: r.why, town: s.world.towns.reedwake }));
    });
    t.ok(JSON.stringify(A.rng || null) === JSON.stringify(B.rng || null) && !diff(A.world, B.world).length, '4 the stream\'s counts and the world record the same in both');
    // a save and a load
    asked(A);
    await RB.save.writeSlot(1, A); await RB.save.writeSlot(2, B);
    const LA = (await RB.save.read(1, 'manual')).state, LB = (await RB.save.read(2, 'manual')).state;
    t.ok(!diff(LB, LA).length && !diff(A.world, LA.world).length && JSON.stringify(LA.rng || null) === JSON.stringify(A.rng || null),
      '4 saved and loaded: the two the same, the world record and the stream as they were ' + JSON.stringify({ d: diff(LB, LA), w: diff(A.world, LA.world) }));
    A = LA; B = LB;
    step('after the load, out to the river road again', (s) => go(s, 'rw.road'));
    step('and back into Reedwake', (s) => go(s, 'rw.village'));
  }
};
