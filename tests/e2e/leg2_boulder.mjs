// RBN-QA-094 (Agnes 6336214195; Local CL-179; Cloud CC-102): the stone beside the Cloudroad's Stone Steps (cr.leg2,
// (9,13)) was drawn as a dressed, inscribed marker stone, while its scene says "A mossy boulder beside the stone steps.
// It seems to have come down from above decades ago." It is now a natural boulder like the old slide's others on that
// leg, mossed (rock with o.moss: a moss cap, moss in its crack and down its shaded flank, from a moss ramp of its own).
// In Chromium on the built game:
//  1. the placement: a rock with moss at (9,13) carrying the same scene, the only prop that changed; no marker stone
//     left on cr.leg2; every other Cloudroad marker stone still where it was with its scene;
//  2. the drawing: the map draws the mossed boulder on (9,13) and no marker stone there; the mossed variant is a
//     picture of its own; its moss is there (yellow-green pixels on the stone), none of it in the region's grass
//     colours, and the moss never changes the boulder's outline (the same opaque pixels as the plain rock); a plain
//     rock on the Cloudroad has no moss;
//  3. the tile: (9,13) still blocks, its neighbours as they were, and the road still runs from the west way to the
//     east way;
//  4. read with the world's own interact from each side you can stand on: the scene's line, as before;
//  5. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const allErrors = [];

// the Cloudroad's other marker stones (map, x, y, scene), as they stood before (with leg2's, seventeen)
const MARKERS = [
  ['cr.oiwake', 32, 15, 'cr.oiwake_stone'], ['cr.leg1', 6, 14, 'cr.leg1_stone'], ['cr.leg3', 10, 13, 'cr.leg3_stone'],
  ['cr.leg4', 8, 13, 'cr.leg4_stone'], ['cr.umagaeshi', 33, 15, 'cr.uma_stone'], ['cr.leg5', 7, 13, 'cr.leg5_stone'],
  ['cr.above', 18, 6, 'cr.above_stone'], ['cr.kumoi', 33, 15, 'cr.kumoi_stone'], ['cr.pass1', 7, 27, 'cr.pass1_stone'],
  ['cr.pass2', 9, 12, 'cr.bridge_stone'], ['cr.pass3', 6, 9, 'cr.snow_stone1'], ['cr.pass3', 18, 13, 'cr.snow_stone2'],
  ['cr.pass3', 28, 7, 'cr.snow_stone3'], ['cr.pass3', 9, 11, 'cr.lw_stones'], ['cr.hut', 22, 15, 'cr.genta_stone'],
  ['cr.summit', 17, 8, 'cr.summit_stone'],
];

async function start(p, x, y, dir) {
  await p.evaluate(([x, y, dir]) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_st1: true, cr_st2: true, cr_st3: true };
    const s = RB.game.debugStart('cr.leg2', x, y, { dir, comp: 'ren', flags: done });
    s.edition = 2; s.quests.cr_main = { stage: 3, done: false };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.world.enter('cr.leg2', x, y, dir, { fresh: true });
  }, [x, y, dir]);
  await p.waitForTimeout(900);
}

{
  const { p, errors } = await page(b, url);
  await start(p, 9, 14, 'up');

  // ---- 1. the placement ------------------------------------------------------------------------------------------------
  const pl = await p.evaluate(() => {
    const M = RB.content.maps, here = M['cr.leg2'].props.filter((q) => q.x === 9 && q.y === 13);
    const markers = [];
    for (const id in M) if (/^cr\./.test(id)) for (const q of M[id].props || []) if (q.p === 'stone_marker') markers.push([id, q.x, q.y, q.scene || null]);
    return { here: here.map((q) => ({ p: q.p, scene: q.scene, o: q.o || null })), leg2Markers: M['cr.leg2'].props.filter((q) => q.p === 'stone_marker').length, markers };
  });
  ok(pl.here.length === 1 && pl.here[0].p === 'rock' && pl.here[0].scene === 'cr.leg2_stone' && pl.here[0].o && pl.here[0].o.moss === true,
    'the stone beside the steps is a mossed natural rock with its own scene (' + JSON.stringify(pl.here) + ')');
  ok(pl.leg2Markers === 0, 'no marker stone left on the Stone Steps (' + pl.leg2Markers + ')');
  const key = (q) => q.slice(0, 4).join();
  ok(pl.markers.length === MARKERS.length && MARKERS.every((m) => pl.markers.some((q) => key(q) === key(m))),
    'every other Cloudroad marker stone is still where it was with its scene (' + pl.markers.length + ' of ' + MARKERS.length + ': ' + pl.markers.map((q) => q[0] + '@' + q[1] + ',' + q[2]).join(' ') + ')');

  // ---- 2. the drawing --------------------------------------------------------------------------------------------------
  const drawn = await p.evaluate(async () => {
    const P = RB.props.P, calls = [];
    const wrap = (id) => { const f = P[id].draw2; P[id].draw2 = function (c, x, y, pal, t, o) { if (o && o.cx === 9 && o.cy === 13) calls.push({ id, moss: !!o.moss }); return f.apply(this, arguments); }; return () => (P[id].draw2 = f); };
    const un = [wrap('rock'), wrap('stone_marker')];
    RB.render.invalidate && RB.render.invalidate();
    await new Promise((r) => setTimeout(r, 400));
    un.forEach((f) => f());
    // the art itself: the mossed variant and the plain one for the same tile, in the Cloudroad's palette
    const pal = RB.tiles.PAL.cloudroad, M = RB.propKit.mat(pal);
    const pic = (moss) => { const c = document.createElement('canvas'); c.width = 48; c.height = 48; const g = c.getContext('2d'); P.rock.draw2(g, 4, 6, pal, 0, { cx: 9, cy: 13, still: true, moss }); return g.getImageData(0, 0, 48, 48).data; };
    const a = pic(false), m = pic(true);
    const hex = (d, i) => '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    const grass = new Set(M.grass.concat(pal.grass).map((h) => h.toLowerCase()));
    let mossPx = 0, mossInGrass = 0, plainMoss = 0, outline = 0;
    for (let i = 0; i < m.length; i += 4) {
      const isMoss = (d) => d[i + 3] > 200 && d[i + 1] > d[i] + 8 && d[i + 1] > d[i + 2] + 24;
      if (isMoss(m)) { mossPx++; if (grass.has(hex(m, i))) mossInGrass++; }
      if (isMoss(a)) plainMoss++;
      if ((a[i + 3] > 0) !== (m[i + 3] > 0)) outline++;
    }
    let differ = 0;
    for (let i = 0; i < m.length; i++) if (a[i] !== m[i]) differ++;
    return { calls, mossPx, mossInGrass, plainMoss, outline, differ };
  });
  const atTile = drawn.calls.filter((c) => c.id === 'rock' && c.moss).length, markerAt = drawn.calls.filter((c) => c.id === 'stone_marker').length;
  ok(atTile > 0 && markerAt === 0, 'the map draws the mossed boulder on (9,13) and no marker stone there (' + JSON.stringify({ mossedRock: atTile, marker: markerAt }) + ')');
  ok(drawn.differ > 0 && drawn.mossPx >= 40 && drawn.plainMoss === 0, 'the mossed boulder is a picture of its own (its own variant) and carries moss (' + drawn.mossPx + ' moss pixels); the plain rock on the same tile of the Cloudroad, none (' + drawn.plainMoss + ')');
  ok(drawn.mossInGrass === 0, 'none of its moss is in the region\'s grass colours (' + drawn.mossInGrass + ')');
  ok(drawn.outline === 0, 'the moss never changes the boulder\'s outline: the same opaque pixels as the plain rock (' + drawn.outline + ' differ)');

  // ---- 3. the tile -----------------------------------------------------------------------------------------------------
  const tile = await p.evaluate(() => {
    const m = RB.world.W.map, B = (x, y) => RB.maps.blockedStatic(m, x, y);
    const nb = { north: [9, 12], east: [10, 13], south: [9, 14], west: [8, 13] };
    const open = {}; for (const k in nb) open[k] = !B(nb[k][0], nb[k][1]);
    // the road from the west way to the east way, over open tiles
    const west = [], east = [];
    for (const e of m.exits || []) for (let i = 0; i < (e.w || 1); i++) for (let j = 0; j < (e.h || 1); j++) (e.x === 0 ? west : e.x >= m.w - 1 ? east : []).push([e.x + i, e.y + j]);
    const seen = new Set(west.map((q) => q.join())), Q = west.slice();
    while (Q.length) { const [x, y] = Q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, k = X + ',' + Y; if (X < 0 || Y < 0 || X >= m.w || Y >= m.h || seen.has(k) || B(X, Y)) continue; seen.add(k); Q.push([X, Y]); } }
    return { blocks: B(9, 13), open, west: west.length, east: east.length, through: east.some((q) => seen.has(q.join())) };
  });
  ok(tile.blocks, 'the boulder\'s tile (9,13) still blocks');
  ok(tile.open.north && tile.open.east && tile.open.south, 'its neighbours north (the steps), east and south stay open (' + JSON.stringify(tile.open) + ')');
  ok(tile.west > 0 && tile.east > 0 && tile.through, 'the road still runs from the west way to the east way (' + JSON.stringify({ west: tile.west, east: tile.east, through: tile.through }) + ')');

  // ---- 4. read from each side you can stand on -------------------------------------------------------------------------
  const sides = [['north', 9, 12, 'down'], ['east', 10, 13, 'left'], ['south', 9, 14, 'up'], ['west', 8, 13, 'right']].filter((q) => tile.open[q[0]]);
  const reads = [];
  for (const [side, x, y, dir] of sides) {
    await p.evaluate(([x, y, dir]) => RB.world.enter('cr.leg2', x, y, dir, {}), [x, y, dir]);
    await p.waitForTimeout(400);
    await p.evaluate(() => RB.world.interact());
    await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 }).catch(() => {});
    const d = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return d ? String(d.en || '') : null; });
    reads.push([side, d && d.slice(0, 50)]);
    for (let i = 0; i < 6 && (await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.script.isRunning())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(250); }
  }
  ok(reads.length >= 3 && reads.every((r) => r[1] && /A mossy boulder beside the stone steps/.test(r[1])), 'read from each side you can stand on: the scene\'s line (' + JSON.stringify(reads) + ')');
  allErrors.push(...errors);
  await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
