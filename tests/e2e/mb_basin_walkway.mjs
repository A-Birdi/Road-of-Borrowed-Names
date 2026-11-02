// The Upper Basin's drained walkway (Agnes 6569630781; Cloud CC-467; Local CL-631): the nine tiles of the north
// walkway's drowned stretch (26–28, 2–4) are paving under the flood, so draining the basin bares the walkway the sluice's
// narration describes. In Chromium on the built game, on a throwaway journey (never a real save), in the Upper Basin
// with the first tablet read, walking through the real movement code:
//  1. before the drain: the nine under their flood and closed; a step east from the walkway onto the stretch is refused;
//  2. the sluice's wheel used (its scene, "Open the sluice"): in the same visit the nine are paving and open, and the
//     walkway is walked east across them to the stairs and down to the Channels;
//  3. back up from the Channels: still paving, and walked west across them;
//  4. a save and load through the game's own save: still paving, and walked across again;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/mb_basin_walkway.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

// the nine tiles as the world has them: their terrain, and whether they are closed to walking
const nine = (p) => p.evaluate(() => {
  const W = RB.world.W, out = [];
  for (let y = 2; y <= 4; y++) for (let x = 26; x <= 28; x++) out.push({ id: RB.maps.tileAt(W.map, x, y).id, closed: RB.maps.blockedStatic(W.map, x, y) });
  return { map: W.map.id, paved: out.every((c) => c.id === 'stonefloor'), closed: out.filter((c) => c.closed).length };
});
const where = (p) => p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y }));
const quiet = (p) => p.evaluate(() => { RB.world.W.quietUntil = 1e15; });
// walk in a direction n steps (stops early at a map change)
async function walk(p, dir, n) {
  const start = await where(p);
  for (let i = 0; i < n; i++) {
    await p.evaluate((dir) => RB.test.step(dir), dir);
    const w = await where(p);
    if (w.map !== start.map) break;
  }
  return where(p);
}

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(() => {
  const map = 'mb.under1', f = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_under_seen: true, mb_tab1: true };
  for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
  RB.game.debugStart(map, 9, 17, { comp: 'mio', flags: f, dir: 'down', edition: 2 });
  RB.game.settings.textSpeed = 'instant';
  RB.game.applySettings();
  RB.test.enable({ choose: () => 0 });
});
await p.waitForTimeout(600);
await quiet(p);

// 1. before the drain
const n1 = await nine(p);
await p.evaluate(() => RB.test.place(25, 3, 'right'));
const w1 = await walk(p, 'right', 1);
ok(n1.map === 'mb.under1' && n1.closed === 9 && w1.x === 25 && w1.y === 3,
  '1 before the drain: the nine under their flood and closed; a step east onto the stretch is refused ' + flat({ n1, w1 }));

// 2. the sluice
await p.evaluate(async () => { await RB.test.use(9, 18); await RB.test.idle(); });
const low = await p.evaluate(() => !!RB.game.s.flags.mb_u1_low);
const n2 = await nine(p);
await quiet(p);
await p.evaluate(() => RB.test.place(25, 3, 'right'));
const across = await walk(p, 'right', 5);
const down = await walk(p, 'right', 1);
ok(low && n2.map === 'mb.under1' && n2.paved && n2.closed === 0 && across.map === 'mb.under1' && across.x === 30 && across.y === 3 && down.map === 'mb.under2',
  '2 the sluice opened: in the same visit the nine are paving and open, walked east across to the stairs and down ' + flat({ low, n2, across, down }));

// 3. back up from the Channels
await quiet(p);
const up = await walk(p, 'up', 1);
await quiet(p);
const n3 = await nine(p);
const west = await walk(p, 'left', 5);
ok(up.map === 'mb.under1' && up.x === 30 && up.y === 3 && n3.paved && n3.closed === 0 && west.map === 'mb.under1' && west.x === 25 && west.y === 3,
  '3 back up from the Channels: still paving, walked west across them ' + flat({ up, n3, west }));

// 4. a save and load
const m4 = await p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
await quiet(p);
const n4 = await nine(p);
await p.evaluate(() => RB.test.place(25, 3, 'right'));
const again = await walk(p, 'right', 5);
ok(m4 === 'mb.under1' && n4.paved && n4.closed === 0 && again.map === 'mb.under1' && again.x === 30,
  '4 after a save and load: still paving, walked across again ' + flat({ m4, n4, again }));

ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await p.context().close();

console.log(`\nmb_basin_walkway: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
