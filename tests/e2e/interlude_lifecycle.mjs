// Every interlude across a campaign change (RBN-QA-064 refine; Agnes 6318475345, Local CL-115): a picture that is up
// when a load happens (one that works, one that fails) leaves nothing behind it, shown or remembered, and the same
// picture shown again is drawn; cleared normally it gives the map back. In Chromium on the built game, for each
// picture in RB.interlude.ART (the tide-watcher's window, the lookout's views, the valley below Lanternfall, …), from a
// synthetic campaign of the shipped edition (never a player's save):
//  1. shown: drawn in place of the map;
//  2. a load that works (a save made just before) with it up: nothing of it left; the map drawn; shown again: drawn;
//  3. a load that fails (an empty slot) with it up: the same;
//  4. cleared: the map back; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/interlude_lifecycle.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const ids = await p.evaluate(async () => {
  RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu', flags: { departed: true } });
  RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  await RB.save.manualSave(1);
  return Object.keys(RB.interlude.ART);
});
ok(ids.length >= 3, 'the pictures registered: ' + ids.join(', '));
// (what the picture is as the renderer sees it: shown, and drawn in place of the map)
const pic = () => p.evaluate(() => ({ state: RB.interlude.state() && RB.interlude.state().id, drawn: !!RB.render.getOverride() && !RB.render.worldVisible() }));
for (const id of ids) {
  for (const [how, slot] of [['a load that works', 1], ['a load that fails (an empty slot)', 3]]) {
    await p.evaluate((id) => RB.interlude.show(id), id);
    await p.waitForTimeout(300);
    const up = await pic();
    const res = await p.evaluate(async (slot) => { try { return 'ok ' + (await RB.game.loadCampaign(slot, 'manual')); } catch (e) { return 'failed: ' + (e && e.message); } }, slot);
    await p.waitForTimeout(600);
    const after = await p.evaluate(() => ({ pic: RB.interlude.state(), world: RB.render.worldVisible(), mode: RB.game.mode() }));
    await p.evaluate((id) => RB.interlude.show(id), id);
    await p.waitForTimeout(300);
    const again = await pic();
    await p.evaluate(() => RB.interlude.clear());
    await p.waitForTimeout(100);
    const gone = await p.evaluate(() => ({ pic: RB.interlude.active(), world: RB.render.worldVisible() }));
    ok(up.state === id && up.drawn && !after.pic && after.world && after.mode === 'world' && again.state === id && again.drawn && !gone.pic && gone.world,
      `${id}, ${how} (${res}) with it up: nothing of it left, the map drawn; shown again, drawn; cleared, the map back (${JSON.stringify({ up, after, again, gone })})`);
  }
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
console.log(`\ninterlude_lifecycle: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
