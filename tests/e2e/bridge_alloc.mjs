// Chapter 1's bridge sequence stops rebuilding unchanged pictures every frame (Agnes 6404461467 and 6405460884, Local
// CL-408, CL-409, CL-412 and CL-413, CC-268 and CC-269): the shoji panels of the cup and door shots (shojiPair, a
// full art-buffer layer and canvas per call) are kept in one last-value slot while nothing that changes their pixels
// changes, and the eave lantern (eaveLantern's chochin, a fresh small canvas per call) is built once per size. Not a
// crash fix and no memory claim. In Chromium on the built game, each moment drawn directly (RB.sequence.drawAt, fixed
// t and phase, a fixed-size canvas):
//  1. a held moment draws the same pixels as a fresh draw (the caches released first), for the cup and door shots
//     at their closed, moving and open panel phases and for the four shots with the eave lantern;
//  2. the slot follows its inputs: across a resize (640×400 → 512×320 → 640×400), across view heights 268 → 269 at
//     640×480 (Z = vb / 230: 1.1652 → 1.1696, both s(100) = 117 but s(9) 10 → 11: the collision Local raised, where a
//     scale key of s(100) would reuse the wrong lattice), and after the caches are released (re-entry), every draw
//     equals a fresh draw at the same inputs. (Z 1.1660 and 1.1670 themselves need a fractional view height, which
//     the game never passes: RB.interlude.sheetTop and drawAt round it; with one, the kit's static layers, keyed by
//     the rounded height, collide before the slot does, on the old page as well. That is outside this change.)
//  3. the slot is one entry, replaced on a new key, and empty after release;
//  4. the panels still move: the cup and door shots' moving moments differ from their settled ones;
//  5. held frames after a warm-up make no canvas of the art buffer's size and none of the lantern's size (the two
//     allocations Local measured per frame on the old page, 2.000 per frame in the cup shot);
//  6. with --against <page>, every moment of 1 matches that page's draw pixel for pixel (the old page, to show the
//     pictures unchanged); no page errors.
// The control is the same test on the old page (RB_PAGE=<old build>): 3 (no slot there) and 5 fail.
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
// in the page: draw a moment on a fresh canvas of w × h, return an FNV-1a hash of its pixels
const helpers = () => {
  window.__bh = (w, h, o) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    RB.sequence.drawAt(c, w, h, Object.assign({ seq: 'ch1.bridge', t: 4321 }, o));
    const d = c.getImageData(0, 0, w, h).data;
    let x = 2166136261 >>> 0;
    for (let i = 0; i < d.length; i++) { x ^= d[i]; x = Math.imul(x, 16777619) >>> 0; }
    return x.toString(16);
  };
};

async function hashes(pg) {
  return pg.evaluate((M) => M.map(([shot, phase, k]) => { RB.seqKit.release(); return window.__bh(640, 400, { shot, phase, k }); }), MOMENTS);
}

const { p, errors } = await page(b, url);
await p.evaluate(helpers);

// 1. held (warm) equals fresh, every moment
const r1 = await p.evaluate((M) => M.map(([shot, phase, k]) => {
  RB.seqKit.release();
  const fresh = window.__bh(640, 400, { shot, phase, k });
  const warm1 = window.__bh(640, 400, { shot, phase, k });
  const warm2 = window.__bh(640, 400, { shot, phase, k });
  return { m: shot + '/' + phase + '@' + k, same: fresh === warm1 && warm1 === warm2 };
}), MOMENTS);
ok(r1.every((x) => x.same), 'a held moment draws what a fresh draw does, for every moment (' + r1.filter((x) => !x.same).map((x) => x.m).join(', ') + ')');

// 2. the slot follows its inputs: resize, the Z collision, re-entry
const r2 = await p.evaluate(() => {
  const out = {};
  const fresh = (w, h, o) => { RB.seqKit.release(); return window.__bh(w, h, o); };
  for (const [shot, phase, k] of [['cup', 'walk', 1], ['door', 'close', 1]]) {
    const o = { shot, phase, k };
    const f640 = fresh(640, 400, o), f512 = fresh(512, 320, o);
    RB.seqKit.release();
    const a = window.__bh(640, 400, o), bb = window.__bh(512, 320, o), c = window.__bh(640, 400, o);
    out[shot + ':resize'] = a === f640 && bb === f512 && c === f640 && f640 !== f512;
    // Z = vb / 230 here (640 / 380 is larger): 268 → 1.1652, 269 → 1.1696
    const z1 = Object.assign({ vb: 268 }, o), z2 = Object.assign({ vb: 269 }, o);
    const g1 = RB.seqKit.stage(640, 480, 268), g2 = RB.seqKit.stage(640, 480, 269);
    out[shot + ':zcase'] = g1.s(100) === g2.s(100) && g1.s(9) !== g2.s(9);
    const fz2 = fresh(640, 480, z2);
    RB.seqKit.release();
    window.__bh(640, 480, z1);
    out[shot + ':zfollow'] = window.__bh(640, 480, z2) === fz2;
    // re-entry: the caches released, then drawn again
    window.__bh(640, 400, o); RB.seqKit.release();
    out[shot + ':reentry'] = window.__bh(640, 400, o) === f640;
  }
  return out;
});
ok(r2['cup:resize'] && r2['door:resize'], 'across 640×400 → 512×320 → 640×400 every draw equals a fresh draw at its size: ' + JSON.stringify([r2['cup:resize'], r2['door:resize']]));
ok(r2['cup:zcase'] && r2['door:zcase'], 'the scale case is a real collision: s(100) equal, s(9) different at view heights 268 and 269 (Z 1.1652, 1.1696)');
ok(r2['cup:zfollow'] && r2['door:zfollow'], 'after a draw at view height 268, a draw at 269 equals a fresh one (the exact Z is in the key): ' + JSON.stringify([r2['cup:zfollow'], r2['door:zfollow']]));
ok(r2['cup:reentry'] && r2['door:reentry'], 'after the caches are released (re-entry), the shots draw as before: ' + JSON.stringify([r2['cup:reentry'], r2['door:reentry']]));

// 3. one slot entry, replaced on a new key, empty after release (on a page with the slot)
const r3 = await p.evaluate(() => {
  if (!RB.seqKit.last) return null;
  RB.seqKit.release();
  window.__bh(640, 400, { shot: 'cup', phase: 'walk', k: 0.7 });
  const a = RB.seqKit.stats().lasts;
  window.__bh(640, 400, { shot: 'cup', phase: 'walk', k: 0.9 });
  window.__bh(640, 400, { shot: 'door', phase: 'close', k: 0.6 });
  const bb = RB.seqKit.stats().lasts;
  RB.seqKit.release();
  return { a, b: bb, after: RB.seqKit.stats().lasts };
});
ok(r3 && r3.a === 1 && r3.b === 1 && r3.after === 0, 'the slot holds one entry whatever the panels\' openness, and none after release: ' + JSON.stringify(r3));

// 4. the panels still move
const r4 = await p.evaluate(() => {
  const h = (shot, phase, k) => { RB.seqKit.release(); return window.__bh(640, 400, { shot, phase, k }); };
  return { cup: h('cup', 'walk', 0.8) !== h('cup', 'walk', 1) && h('cup', 'walk', 0.7) !== h('cup', 'walk', 0.9), door: h('door', 'close', 0.75) !== h('door', 'close', 1) && h('door', 'close', 0.6) !== h('door', 'close', 0.9) };
});
ok(r4.cup && r4.door, 'the panels still move: moving moments differ from each other and from the settled ones: ' + JSON.stringify(r4));

// 5. held frames make no art-buffer canvas and no lantern canvas (30 frames after one warm-up, t advancing)
const r5 = await p.evaluate((M) => {
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
const heldOk = Object.values(r5).every((x) => x.buffer === 0 && x.lantern === 0);
ok(heldOk, 'held frames make no art-buffer-sized and no lantern-sized canvas after one warm-up (30 frames each): ' + JSON.stringify(r5));

// 6. against another page: the same pixels at every moment
if (AGAINST) {
  const mine = await hashes(p);
  const q = await page(b, url + AGAINST.replace(/^\/+/, ''));
  await q.p.evaluate(helpers);
  const theirs = await hashes(q.p);
  const diff = MOMENTS.filter((m, i) => mine[i] !== theirs[i]).map((m) => m.join('/'));
  ok(!diff.length, 'every moment matches ' + AGAINST + ' pixel for pixel (' + MOMENTS.length + ' moments' + (diff.length ? '; differ: ' + diff.join(', ') : '') + ')');
  ok(!q.errors.length, 'no page errors on ' + AGAINST + (q.errors.length ? ': ' + q.errors.slice(0, 3).join(' | ') : ''));
}
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
