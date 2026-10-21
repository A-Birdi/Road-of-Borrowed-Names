// RBN-QA-047 (Local; scope corrected by Agnes, CL-055): in Tetsuji's Goat Shed (sb.goatshed) the two stall dividers
// stood on outdoor snow, because the global fence character `f` is grass plus a fence and Snowbell's grass is drawn as
// snow. Only this map's legend changes (`f`: the shed's boards plus the fence), in Chromium on the built game:
//  1. exactly the eight divider cells (x 4 and 8, rows 2-5) are boards with a fence on them; row 6 under them stays open
//     boards; every other cell has the tile the global legend gives it;
//  2. collision as before: the divider cells are blocked by their fence and nothing else changes (grass and boards are
//     both walkable); the goats, the sign, the props and the exit are where they were;
//  3. the other maps that use `f` outdoors (co.road, sb.hamlet, cr.barrier, lq.koharu) keep grass under their fences;
//  4. the picture: no snow-white ground in the divider cells (pale, unsaturated pixels): only the fence rails' own,
//     alike in all eight cells (the snow on the rails is a separate question); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/goatshed_fence.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
await p.evaluate(() => {
  RB.game.debugStart('sb.goatshed', 6, 7, { dir: 'up', flags: { departed: true, ch1_done: true, ch2_done: true, ch3_done: true } });
  RB.game.settings.reducedMotion = true; RB.game.applySettings();
});
await p.waitForTimeout(1200);
const m = await p.evaluate(() => {
  const M = RB.world.W.map, T = RB.tiles.T, L = RB.tiles.LEGEND, rows = M.def.terrain;
  const name = (t) => Object.keys(T).find((k) => T[k] === t);
  const cells = [], others = [];
  for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
    const ch = rows[y][x], i = y * M.w + x, fence = M.props.some((q) => q.auto && q.p === 'fence' && q.x === x && q.y === y);
    if (ch === 'f') cells.push({ x, y, tile: name(M.tiles[i]), fence, block: M.block[i] });
    else if (M.tiles[i] !== (T[(L[ch] || L['.']).tile] || T.grass)) others.push({ x, y, ch, tile: name(M.tiles[i]) });
  }
  const row6 = [4, 8].map((x) => ({ x, ch: rows[6][x], tile: name(M.tiles[6 * M.w + x]), block: M.block[6 * M.w + x] }));
  const npcs = RB.world.W.npcs.map((n) => n.id + '@' + n.x + ',' + n.y).sort();
  const props = M.props.filter((q) => !q.auto).map((q) => q.p + '@' + q.x + ',' + q.y).sort();
  const blocked = [];
  for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) if (M.block[y * M.w + x] && rows[y][x] !== '#') blocked.push(x + ',' + y);
  // the outdoor maps with `f` keep the global grass under their fences
  const out = {};
  for (const id of ['co.road', 'sb.hamlet', 'cr.barrier', 'lq.koharu']) {
    if (!RB.content.maps[id]) { out[id] = 'absent'; continue; }
    const C = RB.maps.compile(id), r = C.def.terrain; let n = 0, grass = 0;
    for (let y = 0; y < C.h; y++) for (let x = 0; x < C.w; x++) if (r[y][x] === 'f') { n++; if (C.tiles[y * C.w + x] === T.grass) grass++; }
    out[id] = grass + '/' + n;
  }
  return { cells, others, row6, npcs, props, blocked, exits: M.exits.map((e) => e.x + ',' + e.y + '>' + e.to), out };
});
const want = [];
for (const x of [4, 8]) for (let y = 2; y <= 5; y++) want.push(x + ',' + y);
ok(m.cells.length === 8 && m.cells.map((c) => c.x + ',' + c.y).sort().join() === want.sort().join(), 'exactly the eight divider cells (x 4 and 8, rows 2-5) use the fence character (' + m.cells.map((c) => c.x + ',' + c.y).join(' ') + ')');
ok(m.cells.every((c) => c.tile === 'wood' && c.fence && c.block === 1), 'each divider cell: the shed\'s boards with a fence on them, blocked as before (' + JSON.stringify(m.cells.map((c) => [c.tile, c.fence, c.block]).filter((v, i, a) => a.findIndex((w) => w.join() === v.join()) === i)) + ')');
ok(m.row6.every((c) => c.ch === '_' && c.tile === 'wood' && c.block === 0), 'row 6 under the dividers stays open boards (' + JSON.stringify(m.row6) + ')');
ok(!m.others.length, 'every other cell has the tile the global legend gives it (' + JSON.stringify(m.others.slice(0, 4)) + ')');
// (the full list is printed: the same on the build before this change, where the dividers stood on walkable grass)
console.log('note blocked (not wall): ' + m.blocked.slice().sort().join(' '));
ok(want.every((c) => m.blocked.includes(c)) && ![4, 8].some((x) => m.blocked.includes(x + ',6')), 'collision: the dividers blocked by their fence, row 6 open (' + m.blocked.length + ' blocked cells besides walls)');
console.log('note goats: ' + m.npcs.join(' '));
ok(['sb_goat5', 'sb_goat6', 'sb_goat_momo', 'sb_kid1', 'sb_kid2'].every((id) => m.npcs.some((n) => n.startsWith(id + '@'))), 'the goats are there (' + m.npcs.join(' ') + ')');
ok(m.props.includes('sign@6,2') && m.props.includes('exitmat@6,7') && m.exits.some((e) => /^6,8>sb\.hamlet/.test(e)), 'the sign, the mat and the way out as before (' + m.exits.join(' ') + ')');
ok(Object.values(m.out).every((v) => v === 'absent' || /^(\d+)\/\1$/.test(v)), 'outdoor fences keep grass under them (' + JSON.stringify(m.out) + ')');
// the picture: pale unsaturated ("snow") pixels in the ground of each divider cell, against a board cell beside it
const snow = await p.evaluate(() => {
  const cv = document.querySelector('canvas'), g = cv.getContext('2d');
  const cam = RB.render.cam, v = RB.render.viewSize(), sx = cv.width / v.w, sy = cv.height / v.h;
  const pale = (tx, ty) => { const x = Math.round((tx * 16 - cam.x) * sx), y = Math.round((ty * 16 - cam.y) * sy), w = Math.round(16 * sx), h = Math.round(16 * sy); const d = g.getImageData(x, y, w, h).data; let n = 0; for (let i = 0; i < d.length; i += 4) { const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); if ((mx + mn) / 2 > 150 && mx - mn < 28) n++; } return Math.round(1000 * n / (d.length / 4)) / 10; };
  const r = {};
  for (const x of [4, 8]) for (let y = 2; y <= 5; y++) r[x + ',' + y] = pale(x, y);
  r.board = pale(3, 5); r.board2 = pale(7, 5);
  return r;
});
// What stays pale is the fence's own rails (the snow on them is a separate question, Agnes 6305563025), the same in
// every cell; on the build before this change the snow strips and tufts under them made 10-42 % of each cell pale.
const cellsPale = Object.entries(snow).filter(([k]) => !/board/.test(k)).map(([, v]) => v);
const fenceMax = Math.max(...cellsPale), spread = fenceMax - Math.min(...cellsPale);
ok(snow.board < 1 && snow.board2 < 1 && fenceMax <= 8 && spread <= 1.5, 'no snow-white ground under the dividers: only the rails\' own pale pixels, alike in all eight cells (' + JSON.stringify(snow) + ' %)');
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await p.close();
console.log(`\ngoatshed_fence: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
