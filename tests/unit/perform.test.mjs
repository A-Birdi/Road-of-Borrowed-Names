// The performance library (expansion P05, playbook V5; src/engine/67a_perform.js). Every complete action is sound
// (its poses and held objects exist, every phase is drawn, its rounds are deterministic and of a sensible length,
// contact phases hold something or meet an anchor); a person at work yields at once to a conversation, a scene or a
// walk and begins again from the anticipation; personality changes timing and adds the person's own mannerism, and
// neighbours never move in step; reduced motion holds one readable pose; one-shot gestures play once and end;
// placements keep their work in front of them and stay findable; no journey's content uses it yet.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const F = RB.perform, C = RB.content;

  // ---- the catalogue ----------------------------------------------------------------------------------------------
  const all = F.list();
  t.ok(all.length >= 16, 'the catalogue: ' + all.map((c) => c.id).join(', '));
  for (const id of ['sweep', 'sort', 'carry', 'tie', 'tend', 'read', 'grind', 'pointway', 'consider', 'laugh', 'offer', 'thanks', 'mistake']) t.ok(F.get(id), 'V5 lists it: ' + id);
  for (const c of all) t.eq(F.validate(c), [], c.id + ' is sound');
  for (const c of F.list('social')) t.ok(c.once, c.id + ': a social gesture plays once');
  // a broken contract is caught
  const bad = { id: 'x', round: (n) => [['a', 100], ['b', n % 2 ? 300 : 400]], pose: { a: 'nopose' }, still: null, contact: { a: 'something' } };
  const be = F.validate(bad);
  t.ok(be.some((e) => /no pose nopose/.test(e)) && be.some((e) => /phase b has no pose/.test(e)) && be.some((e) => /no still pose/.test(e)) && be.some((e) => /lasts/.test(e)) && be.some((e) => /contact with nothing/.test(e)), 'a broken contract is caught: ' + be.join('; '));
  const flaky = { id: 'y', round: () => [['a', Math.random() < 2 ? 2000 + Math.floor(Math.random() * 100) : 0]], pose: { a: 'check' }, still: { pose: 'check' } };
  t.ok(F.validate(flaky).some((e) => /deterministic/.test(e)), 'and a round that is not deterministic');

  // profession supplies the task: every class's suggestions are real work in the catalogue
  for (const cls of Object.keys(RB.mannerisms.CLASSES)) t.ok(F.suggest(cls).every((id) => F.get(id) && F.get(id).kind === 'work'), 'suggested work for ' + cls + ': ' + F.suggest(cls).join(', '));

  // ---- a person at work ---------------------------------------------------------------------------------------------
  let mode = 'world';
  RB.game.mode = () => mode;
  let reduced = false;
  RB.game.reducedMotion = () => reduced;
  const person = (o) => Object.assign({ id: 'pf_test', x: 5, y: 5, fx: 5, fy: 5, dir: 'down', look: { skin: 2, hair: 'short', hairColor: 3, outfit: 0, acc: [] }, home: [5, 5], def: { perform: 'sweep' } }, o || {});
  {
    const a = person();
    const f0 = F.frameOf(a, 100000, false);
    t.ok(f0 && f0.phase, 'at work: a phase (' + (f0 && f0.phase) + ')');
    // through a whole round, every phase drawn; the broom in hand while sweeping
    const seen = new Set();
    for (let k = 0; k < 60; k++) { const f = F.frameOf(a, 100000 + k * 200, false); seen.add(f.phase); if (f.phase === 'stroke') t.ok(/\/broom/.test(f.key), 'the broom in hand on a stroke'); }
    t.ok(['grip', 'stroke', 'gather', 'look', 'rest'].every((p) => seen.has(p)), 'a complete action: ' + [...seen].join(' → '));
    // a conversation: it yields at once, and begins again from the anticipation
    mode = 'dialogue';
    t.eq(F.frameOf(a, 120000, false), null, 'talking: the action yields at once (the game\'s own frames)');
    t.eq(F.working(a), false, 'and the idle habits may have the person');
    mode = 'world';
    const back = F.frameOf(a, 125000, false);
    t.eq(back.phase, 'grip', 'afterwards it begins again from the grip, never a frozen half-gesture');
    // walking, or a scene that stages the person
    a.mv = { tx: 6, ty: 5 };
    t.eq(F.frameOf(a, 126000, false), null, 'walking: yields');
    a.mv = null; a.stg = { run: { done: false } };
    t.eq(F.frameOf(a, 127000, false), null, 'staged by a scene: yields');
    a.stg = null;
    // reduced motion: one readable pose
    reduced = true;
    const st = F.frameOf(a, 128000, true);
    t.eq(st.key, RB.sprites._pose.key('sweep1', { prop: 'broom' }), 'reduced motion: one still, readable pose with the broom');
    reduced = false;
  }
  {
    // neighbours out of step; personality
    const a = person({ id: 'pf_a', home: [3, 4] }), b = person({ id: 'pf_bb', home: [9, 2] });
    const pa = [], pb = [];
    for (let k = 0; k < 20; k++) { pa.push(F.frameOf(a, 200000 + k * 300, false).phase); pb.push(F.frameOf(b, 200000 + k * 300, false).phase); }
    t.ok(pa.join() !== pb.join(), 'two people at the same work never move in step');
    const c = F.get('read');
    const plain = F.roundOf(c, 0, [], 0), brisk = F.roundOf(c, 0, ['brisk'], 0), slow = F.roundOf(c, 0, ['unhurried'], 0);
    const len = (r) => r.reduce((s, x) => s + x[1], 0);
    t.ok(len(brisk) < len(plain) && len(slow) > len(plain), 'tempo: brisk is quicker, unhurried slower (' + [len(brisk), len(plain), len(slow)].join(' < ') + ')');
    const th = [0, 1, 2, 3].map((n) => F.roundOf(c, n, ['thoughtful'], 0).some((x) => x[0] === 'adjust'));
    t.eq(th, [true, false, true, false], 'a thoughtful person adjusts their glasses every other round');
    const r = person({ id: 'pf_r', def: { perform: { act: 'read', traits: ['thoughtful'] } } });
    let adj = null;
    for (let k = 0; k < 400 && !adj; k++) { const f = F.frameOf(r, 300000 + k * 100, false); if (f.phase === 'adjust') adj = f; }
    t.ok(adj && /^p:temple/.test(adj.key), 'drawn as the hand at the temple: ' + (adj && adj.key));
    t.eq(F.actOf(person({ id: 'q', def: { perform: { act: 'read', traits: ['nonsense', 'quiet'] } } })).traits, ['quiet'], 'only known traits');
  }
  {
    // a one-shot gesture: plays once, then the person rests (and it plays during a scene)
    const a = person({ id: 'pf_once', def: {} });
    a._pfOnce = { act: 'pointway' };
    mode = 'dialogue';
    const f1 = F.frameOf(a, 50000, false);
    t.eq(f1 && f1.phase, 'look', 'a cue in a scene: it plays');
    const f2 = F.frameOf(a, 50000 + 600, false);
    t.ok(f2 && /^p:point/.test(f2.key), 'pointing along the way');
    t.eq(F.frameOf(a, 50000 + 5000, false), null, 'then it is over');
    t.ok(!a._pfOnce, 'and forgotten');
    mode = 'world';
  }

  // ---- placements -----------------------------------------------------------------------------------------------------
  t.eq(F.check('sg.road'), [], 'the gallery: every person\'s work is in front of them, and each can be reached to talk to');
  const m = C.maps['rw.road'];
  m.npcs = (m.npcs || []).concat([{ id: 'pf_bad1', char: 'tobi', x: 3, y: 9, dir: 'up', perform: 'sort' }, { id: 'pf_bad2', char: 'sota', x: 20, y: 0, dir: 'down', perform: 'sweep' }, { id: 'pf_bad3', char: 'tobi', x: 7, y: 9, perform: 'laugh' }]);
  RB.maps.forget('rw.road');
  const probs = F.check('rw.road');
  t.ok(probs.some((p) => /tobi \(sort\): the desk or table/.test(p)), 'work with nothing to work at is caught');
  t.ok(probs.some((p) => /sota \(sweep\): nobody can reach them/.test(p)), 'someone walled in is caught');
  t.ok(probs.some((p) => /one-shot gesture is cued by a scene/.test(p)), 'a gesture placed as work is caught');
  m.npcs = m.npcs.filter((n) => !/^pf_bad/.test(n.id));
  RB.maps.forget('rw.road');
  // nothing in a journey uses it yet: the only performers are the gallery's, behind its flag
  const performers = [];
  for (const id in C.maps) for (const n of C.maps[id].npcs || []) if (n.perform) performers.push(id + ':' + n.id + ':' + n.if);
  t.ok(performers.length === 7 && performers.every((p) => /:dev_perform$/.test(p)), 'no journey\'s people perform yet; the gallery only with its flag');
};
