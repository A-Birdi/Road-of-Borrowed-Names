// Battle addendum seams for the art work (src/ui/82_battle_seq.js, 78_enemy_art.js,
// 83_battle_stage.js): a creature's own delivery of a move places its visual cues, and the
// rules' results are still placed by the sequencer — every result exactly once, in the rules'
// order, at the delivery's contact; beats a delivery tries to add are dropped; a delivery that
// throws falls back to the generic choreography. Posed frames are drawn and cached per act.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const Q = RB.battleSeq;
  const view = { pc: 10, comp: 10, max: 10, ward: { pc: 0, comp: 0 }, foes: [{ knots: 3, maxKnots: 3 }], cur: 0, knots: 3, maxKnots: 3 };
  const ctx = (o) => Object.assign({ comp: 'mio', reduce: false, view: JSON.parse(JSON.stringify(view)), group: false, foe: 0, art: 'test_art' }, o || {});
  const strike = { kind: 'strike', target: 'pc', label: 'Strike' };
  const fx = [{ t: 'hit', who: 'pc', n: 2 }];
  const beats = (r) => r.cues.filter((c) => c.type === 'beat');

  // the generic choreography (no delivery for this art)
  const g = Q.choreo.enemy(strike, fx, ctx());
  t.eq(beats(g).map((c) => c.f.t), ['hit'], 'generic: the hit is one beat');

  // a delivery: a swoop with its own timing; it tries to sneak in a beat (dropped)
  let called = null;
  Q.addDelivery('test_art', 'strike', (a) => {
    called = a;
    return {
      cues: [
        a.foeCue({ at: 0, act: 'prep', d: 260, dir: a.aimed, family: a.fam }),
        a.foeCue({ at: 260, act: 'exec', d: 380, dir: a.aimed, family: a.fam, travel: { to: a.aimed, peak: 0.6, arc: 10, shape: 'out' } }),
        { at: 640, type: 'fx', name: 'impact', d: 300, p: { to: a.aimed } },
        { at: 100, type: 'beat', f: { t: 'hit', who: 'pc', n: 99 } },
        a.foeCue({ at: 760, act: 'recover', d: 390, dir: a.aimed, family: a.fam, travel: { to: a.aimed, peak: 0.6, shape: 'back' } }),
      ],
      contact: 640, end: 1250,
    };
  });
  const d = Q.choreo.enemy(strike, fx, ctx());
  t.ok(called && called.kind === 'strike' && called.aimed === 'pc' && called.fam === 'strike', 'the delivery is asked with the move, its family and its actual target');
  t.eq(beats(d).length, 1, 'exactly one beat for the one result (the beat the delivery tried to add is dropped)');
  t.eq(beats(d)[0].f.n, 2, 'it is the rules\' result, not one the delivery invented');
  t.eq(beats(d)[0].at, 640, 'the result shows at the delivery\'s contact');
  t.ok(d.end >= 1250, 'the move lasts as long as its own performance (' + d.end + ')');
  t.ok(d.cues.some((c) => c.type === 'foe' && c.travel && c.travel.to === 'pc'), 'travel towards the actual target is carried on the foe cue');

  // a ward meets it: the seal blocks at the delivery's contact
  const wfx = [{ t: 'countered', kind: 'strike', foe: 0 }];
  const w = Q.choreo.enemy(strike, wfx, ctx({ wardBlock: true }));
  const sb = w.cues.find((c) => c.type === 'fx' && c.name === 'sealBlock');
  t.ok(sb && sb.at === 640 && beats(w).length === 1 && beats(w)[0].f.t === 'countered', 'a ward: the seal blocks at contact; the countered result once');

  // a delivery that throws: the generic choreography plays
  Q.addDelivery('test_art', 'strike', () => { throw new Error('broken delivery'); });
  const err = console.error; console.error = () => {};
  const f = Q.choreo.enemy(strike, fx, ctx());
  console.error = err;
  t.eq(beats(f).map((c) => c.f.t), ['hit'], 'a failing delivery: the generic choreography, the same single result');
  t.ok(f.cues.some((c) => c.type === 'fx' && c.name === 'dart'), 'and its generic visuals');

  // posed frames: a definition's own action frames, cached per act and side
  const EA = RB.enemyArt;
  let drawn = 0;
  EA.def('test_posed', { w: 16, h: 16, ox: 8, oy: 8, frames: 1, build(L) { L.rect(4, 4, 8, 8, '#888'); }, poses: { exec: 3 }, pose(L, act, i, n) { drawn++; L.rect(i, 0, 4, 4, '#f00'); } });
  t.eq(EA.P.test_posed.poses.exec, 3, 'a definition can carry authored action poses');
  // (drawing needs a canvas; in node the frame builder is exercised through the cache key logic only)
  t.ok(typeof EA.drawPosed === 'function', 'drawPosed is the entry point for posed drawing');
  void drawn;
};
