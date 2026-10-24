// Where someone not yet seen this session walks in from (RBN-QA-020's festival crowd; CC-179 §6, Agnes 6384084366,
// Local CL-300): a person who appears and has not been seen comes in from the nearest place the story keeps them
// (50_world.js wayFor, through mapsWith with conditions ignored). RBN-QA-020's festival-night crowd on mp.playhouse
// made that night's places count: the lock's boatmen, who had no other place, walked in from the playhouse side on an
// ordinary day, and the second stuck behind the first in the lock's lane (sequence_world, full mode, mb1.named 206/4
// from 0e4c46e on). Those placements are now marked `visiting`, and only that search skips them. In Chromium on the
// built game:
//  1. every other query is unchanged: for every person and every map, mapsWith with conditions ignored and with them
//     tested (as departures use it) gives what the base build gives (a digest of all of them, measured on CC-022's
//     cut fe868bb);
//  2. the origin search differs from the conditions-ignored one exactly where a person's only placements on a map are
//     visiting ones (worked out from the content itself), and only for RBN-QA-020's festival crowd;
//  3. the lock's boatmen have no place to walk in from (they appear where they stand, as before RBN-QA-020);
//  4. on the festival night the crowd still stands on the bank, the boatmen among them;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/arrival_origin.mjs
import { serve, launch, page } from './lib.mjs';

const BASE = { any: 1824154472, live: -1553402869 }; // the digests on the base build (CC-022's cut fe868bb), as 1. computes them
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });

const R = await p.evaluate(() => {
  RB.game.debugStart('mb.exchange', 47, 21, { edition: RB.edition.forNew(), comp: null, flags: { departed: true, ch1_done: true, ch2_done: true }, dir: 'up' });
  const J = JSON.stringify, maps = RB.content.maps, people = new Set();
  for (const id in maps) for (const n of maps[id].npcs || []) people.add(n.char || n.id);
  const ids = Object.keys(maps).sort(), who = [...people].sort();
  const dig = (f) => { let h = 7; for (const pr of who) for (const m of ids) for (const ch of pr + '@' + m + ':' + f(pr, m).join(',') + ';') h = (h * 31 + ch.charCodeAt(0)) | 0; return h; };
  const any = dig((pr, m) => RB.world.mapsWith(pr, m, true)), live = dig((pr, m) => RB.world.mapsWith(pr, m));
  // the origin search, against what the content says it should be: the maps with a placement of theirs not visiting
  const changed = new Set(), wrong = [];
  for (const pr of who) for (const m of ids) {
    const got = RB.world.mapsWith(pr, m, true, true), all = RB.world.mapsWith(pr, m, true);
    const want = ids.filter((id) => id !== m && (maps[id].npcs || []).some((n) => (n.char || n.id) === pr && !n.visiting && !(RB.game.s.comp && n.id === RB.game.s.comp && !n.alwaysShow)));
    if (J(got.slice().sort()) !== J(want)) wrong.push([pr, m, got, want]);
    if (J(got) !== J(all)) changed.add(pr);
  }
  const fest = new Set((maps['mp.playhouse'].npcs || []).filter((n) => n.visiting).map((n) => n.char || n.id));
  return { any, live, people: who.length, maps: ids.length, wrong: wrong.slice(0, 6), nWrong: wrong.length, changed: [...changed].sort(), fest: [...fest].sort(),
    boat: { magobe: RB.world.mapsWith('mb_vb_magobe', 'mb.exchange', true, true), torakichi: RB.world.mapsWith('mb_vb_torakichi', 'mb.exchange', true, true) } };
});
console.log('     (digests: ' + J({ any: R.any, live: R.live, people: R.people, maps: R.maps }) + ')');
ok(BASE.any ? R.any === BASE.any && R.live === BASE.live : R.people > 0, '1. every other query as on the base build: mapsWith for every person and map, conditions ignored and tested (' + J({ now: [R.any, R.live], base: BASE }) + ')');
ok(R.nWrong === 0 && R.changed.length > 0 && R.changed.every((c) => R.fest.includes(c)), '2. the origin search is the conditions-ignored one less the visiting places, and differs only for the festival crowd (' + J({ wrong: R.wrong, changed: R.changed }) + ')');
ok(J(R.boat) === J({ magobe: [], torakichi: [] }), '3. the lock\'s boatmen have no place to walk in from (' + J(R.boat) + ')');

// 4. the festival night: the crowd on the bank
const N = await p.evaluate(async () => {
  RB.game.debugStart('mp.playhouse', 24, 20, { edition: RB.edition.forNew(), comp: null, flags: { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_fest_night: true }, dir: 'up' });
  await new Promise((r) => setTimeout(r, 800));
  return RB.world.W.npcs.filter((n) => /_fest/.test(n.id)).map((n) => n.id);
});
ok(N.length >= 19 && N.includes('mb_vb_magobe_fest') && N.includes('mb_vb_torakichi_fest'), '4. on the festival night the crowd stands on the bank, the boatmen among them (' + N.length + ': ' + J(N.slice(0, 6)) + ')');
ok(!errors.length, '5. no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
