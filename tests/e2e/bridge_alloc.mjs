// Chapter 1's bridge sequence stops rebuilding unchanged pictures every frame (Agnes 6404461467 and 6405460884, Local
// CL-408, CL-409, CL-412 and CL-413, CC-268 and CC-269): the shoji panels of the cup and door shots (shojiPair, a
// full art-buffer layer and canvas per call) are kept in one last-value slot while nothing that changes their pixels
// changes, and the eave lantern (eaveLantern's chochin, a fresh small canvas per call) is built once per size. Not a
// crash fix and no memory claim. In Chromium on the built game, each moment drawn directly (RB.sequence.drawAt, fixed
// t and phase, a fixed-size canvas), every pixel comparison byte for byte over the whole RGBA array:
//  1. a held moment draws the same pixels as a fresh draw (the caches released first), for the cup and door shots
//     at their closed, moving and open panel phases and for the four shots with the eave lantern;
//  2. the slot follows its inputs: across a resize (640×400 → 512×320 → 640×400), across view heights 268 → 269 at
//     640×480, and after RB.seqKit.release() is called directly, every draw equals a fresh draw at the same inputs.
//     268 → 269 is a real scale collision (Z = vb / 230: 1.1652 → 1.1696, both s(100) = 117 but s(9) 10 → 11, the
//     case Local raised), but it also moves the panels' place and size, so it is not an isolated control for a key
//     without Z; that the exact Z is in the key rests on reading the source. (Z 1.1660 and 1.1670 themselves need a
//     fractional view height, which the game never passes: RB.interlude.sheetTop and drawAt round it; with one, the
//     kit's static layers, keyed by the rounded height, collide before the slot does, on the old page as well. That
//     is outside this change.) Calling release() here is not an observation of the sequence's own release on re-entry
//     in the game; those calls are in 43_sequence.js by inspection.
//  3. uninterrupted phase sequences, with no release between draws: the cup's door slides open and back, the door
//     shot's panels slide shut and back, then the cup again, with held repeats between changes; every draw equals a
//     fresh draw at its inputs. On a page with the slot, the same sequence with the slot's key ignored (a stale
//     picture kept) must differ, to show the check can fail;
//  4. the slot is one entry, replaced on a new key, and empty after release;
//  5. the panels still move: the cup and door shots' moving moments differ from each other and from the settled ones;
//  6. held frames after a warm-up call RB.sprites.makeCanvas not at all (the art buffer's size and the lantern's, the
//     two allocations Local measured per frame on the old page, 2.000 per frame in the cup shot, are counted too);
//  7. with --against <page>: every moment of 1 and every draw of 3's sequence match that page's draws byte for byte
//     (the old page, to show the pictures unchanged); no page errors.
// The control is the same test on the old page (RB_PAGE=<old build>): 4 (no slot there) and 6 fail.
// Usage: node tools/build.mjs && node tests/e2e/bridge_alloc.mjs [--against <page in the repo root>]
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const ai = args.indexOf('--against'), AGAINST = ai >= 0 ? args[ai + 1] : null;
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// the moments: [shot, phase, k] (cup: the door slides open from k 0.6; door: the panels slide shut from k 0.5)
const MOMENTS = [
  ['cup', 'walk', 0], ['cup', 'walk', 0.8], ['cup', 'walk', 1],
  ['door', 'close', 0], ['door', 'close', 0.75], ['door', 'close', 1],
  ['hana', 'lift', 1], ['close', 'smile', 1],
];
// one uninterrupted run through both shots' panel phases, forward and back, a repeated step being a held draw
const CHAIN = [
  ...[0, 0.3, 0.6, 0.65, 0.7, 0.7, 0.8, 0.9, 1, 1, 0.9, 0.7, 0.6, 0].map((k) => ['cup', 'walk', k]),
  ...[0, 0.5, 0.55, 0.6, 0.6, 0.75, 0.9, 1, 1, 0.75, 0.5, 0].map((k) => ['door', 'close', k]),
  ['cup', 'walk', 0.8], ['cup', 'walk', 1],
];
// in the page: draw a moment on a fresh canvas of w × h and return its RGBA bytes; compare two of them byte for byte
const helpers = () => {
  window.__px = (w, h, o) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    RB.sequence.drawAt(c, w, h, Object.assign({ seq: 'ch1.bridge', t: 4321 }, o));
    return c.getImageData(0, 0, w, h).data;
  };
  window.__fresh = (w, h, o) => { RB.seqKit.release(); return window.__px(w, h, o); };
  window.__eq = (a, bb) => {
    if (a.length !== bb.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== bb[i]) return false;
    return true;
  };
  window.__b64 = (d) => {
    let s = '';
    for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
    return btoa(s);
  };
};

// the bytes another page can be compared with: each moment drawn fresh, then the chain drawn without a release
async function bytes(pg) {
  return pg.evaluate(([M, C]) => {
    const moments = M.map(([shot, phase, k]) => window.__b64(window.__fresh(640, 400, { shot, phase, k })));
    RB.seqKit.release();
    const chain = C.map(([shot, phase, k]) => window.__b64(window.__px(640, 400, { shot, phase, k })));
    return { moments, chain };
  }, [MOMENTS, CHAIN]);
}

const { p, errors } = await page(b, url);
await p.evaluate(helpers);

// 1. held (warm) equals fresh, every moment
const r1 = await p.evaluate((M) => M.map(([shot, phase, k]) => {
  const o = { shot, phase, k }, fresh = window.__fresh(640, 400, o);
  const warm1 = window.__px(640, 400, o), warm2 = window.__px(640, 400, o);
  return { m: shot + '/' + phase + '@' + k, same: window.__eq(fresh, warm1) && window.__eq(warm1, warm2) };
}), MOMENTS);
ok(r1.every((x) => x.same), 'a held moment draws what a fresh draw does, byte for byte, for every moment (' + r1.filter((x) => !x.same).map((x) => x.m).join(', ') + ')');

// 2. the slot follows its inputs: resize, the scale collision, a direct release
const r2 = await p.evaluate(() => {
  const out = {}, px = window.__px, fresh = window.__fresh, eq = window.__eq;
  for (const [shot, phase, k] of [['cup', 'walk', 1], ['door', 'close', 1]]) {
    const o = { shot, phase, k };
    const f640 = fresh(640, 400, o), f512 = fresh(512, 320, o);
    RB.seqKit.release();
    const a = px(640, 400, o), bb = px(512, 320, o), c = px(640, 400, o);
    out[shot + ':resize'] = eq(a, f640) && eq(bb, f512) && eq(c, f640);
    // Z = vb / 230 here (640 / 380 is larger): 268 → 1.1652, 269 → 1.1696
    const z1 = Object.assign({ vb: 268 }, o), z2 = Object.assign({ vb: 269 }, o);
    const g1 = RB.seqKit.stage(640, 480, 268), g2 = RB.seqKit.stage(640, 480, 269);
    out[shot + ':zcase'] = g1.s(100) === g2.s(100) && g1.s(9) !== g2.s(9);
    const fz2 = fresh(640, 480, z2);
    RB.seqKit.release();
    px(640, 480, z1);
    out[shot + ':zfollow'] = eq(px(640, 480, z2), fz2);
    // drawn, the caches released directly, then drawn again
    px(640, 400, o); RB.seqKit.release();
    out[shot + ':release'] = eq(px(640, 400, o), f640);
  }
  return out;
});
ok(r2['cup:resize'] && r2['door:resize'], 'across 640×400 → 512×320 → 640×400 every draw equals a fresh draw at its size: ' + JSON.stringify([r2['cup:resize'], r2['door:resize']]));
ok(r2['cup:zcase'] && r2['door:zcase'], 'view heights 268 and 269 are a real scale collision: s(100) equal, s(9) different (Z 1.1652, 1.1696)');
ok(r2['cup:zfollow'] && r2['door:zfollow'], 'after a draw at view height 268, a draw at 269 equals a fresh one: ' + JSON.stringify([r2['cup:zfollow'], r2['door:zfollow']]));
ok(r2['cup:release'] && r2['door:release'], 'after RB.seqKit.release() is called directly, the shots draw as before: ' + JSON.stringify([r2['cup:release'], r2['door:release']]));

// 3. uninterrupted phase sequences: each draw equals a fresh draw at its inputs; with the slot's key ignored, they differ
const r3 = await p.evaluate((C) => {
  const want = C.map(([shot, phase, k]) => window.__fresh(640, 400, { shot, phase, k }));
  const run = () => {
    RB.seqKit.release();
    return C.map(([shot, phase, k], i) => (window.__eq(window.__px(640, 400, { shot, phase, k }), want[i]) ? '' : i + ':' + shot + '@' + k)).filter(Boolean);
  };
  const bad = run();
  let stale = null;
  const last = RB.seqKit.last;
  if (last) {
    RB.seqKit.last = (slot, key, build) => last(slot, 'ignored', build);
    try { stale = run().length; } finally { RB.seqKit.last = last; RB.seqKit.release(); }
  }
  return { steps: C.length, bad, stale };
}, CHAIN);
ok(!r3.bad.length, 'uninterrupted cup and door phase sequences (' + r3.steps + ' draws, no release between them) equal fresh draws byte for byte' + (r3.bad.length ? '; differ: ' + r3.bad.join(', ') : ''));
if (r3.stale !== null) ok(r3.stale > 0, 'with the slot\'s key ignored the same sequence differs from fresh draws (' + r3.stale + ' of ' + r3.steps + ' draws), so the check above can fail');

// 4. one slot entry, replaced on a new key, empty after release (on a page with the slot)
const r4 = await p.evaluate(() => {
  if (!RB.seqKit.last) return null;
  RB.seqKit.release();
  window.__px(640, 400, { shot: 'cup', phase: 'walk', k: 0.7 });
  const a = RB.seqKit.stats().lasts;
  window.__px(640, 400, { shot: 'cup', phase: 'walk', k: 0.9 });
  window.__px(640, 400, { shot: 'door', phase: 'close', k: 0.6 });
  const bb = RB.seqKit.stats().lasts;
  RB.seqKit.release();
  return { a, b: bb, after: RB.seqKit.stats().lasts };
});
ok(r4 && r4.a === 1 && r4.b === 1 && r4.after === 0, 'the slot holds one entry whatever the panels\' openness, and none after release: ' + JSON.stringify(r4));

// 5. the panels still move
const r5 = await p.evaluate(() => {
  const h = (shot, phase, k) => window.__fresh(640, 400, { shot, phase, k }), ne = (a, bb) => !window.__eq(a, bb);
  return {
    cup: ne(h('cup', 'walk', 0.8), h('cup', 'walk', 1)) && ne(h('cup', 'walk', 0.7), h('cup', 'walk', 0.9)),
    door: ne(h('door', 'close', 0.75), h('door', 'close', 1)) && ne(h('door', 'close', 0.6), h('door', 'close', 0.9)),
  };
});
ok(r5.cup && r5.door, 'the panels still move: moving moments differ from each other and from the settled ones: ' + JSON.stringify(r5));

// 6. held frames call makeCanvas not at all (30 frames after one warm-up, t advancing)
const r6 = await p.evaluate((M) => {
  const mk = RB.sprites.makeCanvas, calls = [];
  RB.sprites.makeCanvas = function (w, h) { calls.push(w + 'x' + h); return mk.apply(this, arguments); };
  const out = {};
  try {
    const g = RB.seqKit.stage(640, 400, Math.round(400 * 0.64)), lan = (Math.ceil(g.s(6) * 2) + 4) + 'x' + (g.s(15) + Math.max(2, Math.round(g.s(15) * 0.09)) * 2 + 4);
    for (const [shot, phase, k] of M.filter((x) => x[2] === 1)) {
      RB.seqKit.release();
      const cv = document.createElement('canvas'); cv.width = 640; cv.height = 400;
      const c = cv.getContext('2d');
      RB.sequence.drawAt(c, 640, 400, { seq: 'ch1.bridge', shot, phase, k, t: 1000 });
      calls.length = 0;
      for (let f = 1; f <= 30; f++) RB.sequence.drawAt(c, 640, 400, { seq: 'ch1.bridge', shot, phase, k, t: 1000 + f * 16 });
      out[shot] = { frames: 30, buffer: calls.filter((x) => x === '640x400').length, lantern: calls.filter((x) => x === lan).length, all: calls.length };
    }
  } finally { RB.sprites.makeCanvas = mk; }
  return out;
}, MOMENTS);
ok(Object.values(r6).every((x) => x.all === 0), 'held frames call makeCanvas not at all after one warm-up (30 frames each; buffer and lantern sizes counted too): ' + JSON.stringify(r6));

// 7. against another page: the same bytes at every moment and every draw of the uninterrupted sequence
if (AGAINST) {
  const mine = await bytes(p);
  const q = await page(b, url + AGAINST.replace(/^\/+/, ''));
  await q.p.evaluate(helpers);
  const theirs = await bytes(q.p);
  const same = (x, y) => Buffer.from(x, 'base64').equals(Buffer.from(y, 'base64'));
  const dm = MOMENTS.filter((m, i) => !same(mine.moments[i], theirs.moments[i])).map((m) => m.join('/'));
  const dc = CHAIN.map((m, i) => (same(mine.chain[i], theirs.chain[i]) ? '' : i + ':' + m.join('/'))).filter(Boolean);
  ok(!dm.length, 'every moment matches ' + AGAINST + ' byte for byte (' + MOMENTS.length + ' moments, 640×400 RGBA' + (dm.length ? '; differ: ' + dm.join(', ') : '') + ')');
  ok(!dc.length, 'every draw of the uninterrupted sequence matches ' + AGAINST + ' byte for byte (' + CHAIN.length + ' draws' + (dc.length ? '; differ: ' + dc.join(', ') : '') + ')');
  ok(!q.errors.length, 'no page errors on ' + AGAINST + (q.errors.length ? ': ' + q.errors.slice(0, 3).join(' | ') : ''));
}
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
