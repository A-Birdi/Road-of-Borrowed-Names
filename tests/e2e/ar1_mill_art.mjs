// AR-1 Mill (the Old Mill's art, F13), in the built game: the art pass leaves the mill playing as before (and as MW-1 left
// it: the stairs' line now says the pit is flooded; tests/e2e/mw1_mill_flow.mjs holds the rest of that change). Into the
// mill by its door and out again; the stairs refuse while the wheel is jammed and take you down once the gears are
// mended, from the landing and from beside; back up from the Wheel Pit onto the landing; the millstone's look; the
// Mill Echo's approach; the jammed wheel's look. Then the drawings themselves: the stair-well is in the floor (dark
// where it goes down, the landing stone beside it), the jammed wheel never turns, the turning wheel turns about a hub
// whose axle and lean-to do not move, and reduced motion holds it still. The pictures are judged from the captures
// (docs/review/ar1_mill/), not here.
// Usage: node tools/build.mjs && node tests/e2e/ar1_mill_art.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const ENTER = { 'enter:rw.millroad:rw.mr_enter': true, 'enter:rw.mill1:rw.m1_enter': true, 'foe:rw.millroad:f1': true, 'foe:rw.millroad:f2': true, 'foe:rw.millroad:f3': true, 'foe:rw.mill0:p1': true, 'foe:rw.mill0:p2': true, rw_mill_open: true };

async function drain() {
  for (let k = 0; k < 300; k++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode() }));
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(25); continue; }
    if (s.mode === 'world') return 'world';
    if (s.mode === 'combat' || s.mode === 'encounter') return 'battle';
    await p.waitForTimeout(40);
  }
  return 'timeout';
}
async function start(map, x, y, dir, flags) {
  await p.evaluate(({ map, x, y, dir, flags }) => { RB.game.debugStart(map, x, y, { dir, flags }); RB.game.settings.textSpeed = 'instant'; }, { map, x, y, dir, flags: Object.assign({}, ENTER, flags) });
  await p.waitForTimeout(300);
  await drain();
}
const where = () => p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, mode: RB.game.mode() }));
const said = () => p.evaluate(() => RB.game.s.backlog.map((l) => l.en).join('\n'));
// tap a tile (the game's own walk and, on a thing, its look), then wait for the walk or the change of map
async function tap(tx, ty, ms) {
  const m0 = (await where()).map;
  await p.evaluate(([tx, ty]) => RB.world.tapTile(tx, ty), [tx, ty]);
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 8000)) {
    await p.waitForTimeout(120);
    const s = await p.evaluate(() => ({ mv: !!RB.world.W.player.mv || !!RB.world.W.path, dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), map: RB.world.W.map && RB.world.W.map.id }));
    if (s.dlg || s.mode === 'scene') { await drain(); }
    if (s.map !== m0) { await p.waitForTimeout(600); await drain(); return; }
    if (!s.mv && s.mode === 'world' && Date.now() - t0 > 600) return;
  }
}
async function face(dir) { await p.evaluate((d) => { RB.world.W.player.dir = d; RB.world.interact(); }, dir); await p.waitForTimeout(200); await drain(); await p.waitForTimeout(500); await drain(); }

// ---- into the mill by its door, and out again ----
await start('rw.millroad', 9, 6, 'up', {});
await tap(9, 4, 12000);
let w = await where();
ok(w.map === 'rw.mill1', 'the mill door leads in (' + JSON.stringify(w) + ')');
await start('rw.mill1', 7, 10, 'down', {});
await tap(7, 11, 12000);
w = await where();
ok(w.map === 'rw.millroad' && w.x === 9 && w.y === 5, 'the way out leads back to the road before the door (' + JSON.stringify(w) + ')');

// ---- the stairs: shut while the wheel is jammed (from in front and from beside), open once the gears are mended ----
for (const [x, y, dir] of [[12, 10, 'up'], [11, 9, 'right'], [12, 8, 'down']]) {
  await start('rw.mill1', x, y, dir, {});
  await face(dir);
  w = await where();
  ok(w.map === 'rw.mill1' && /No way down like this/.test(await said()), 'jammed: the stairs from ' + x + ',' + y + ' say the pit is flooded, and you stay');
}
for (const [x, y, dir] of [[12, 8, 'down'], [11, 9, 'right'], [12, 10, 'up']]) {
  await start('rw.mill1', x, y, dir, { rw_gears: true });
  await face(dir);
  w = await where();
  ok(w.map === 'rw.mill0' && w.x === 2 && w.y === 7, 'mended: the stairs from ' + x + ',' + y + ' go down to the Wheel Pit (' + JSON.stringify(w) + ')');
}
// ---- and back up ----
await tap(2, 9, 12000);
w = await where();
ok(w.map === 'rw.mill1' && w.x === 12 && w.y === 8, 'up from the pit onto the landing beside the stair-well (' + JSON.stringify(w) + ')');

// ---- the millstone's look, before and after the echo ----
await start('rw.mill1', 8, 5, 'left', {});
await face('left');
ok(/A great millstone/.test(await said()), 'the millstone: warm, though no one is turning it');
await start('rw.mill1', 8, 5, 'left', { rw_gears: true, rw_loft_done: true, rw_echo_done: true });
await face('left');
ok(/turns quietly/.test(await said()), 'after the echo: it turns quietly');

// ---- the Mill Echo's approach is where it was ----
await start('rw.mill1', 7, 10, 'up', { rw_gears: true, rw_loft_done: true, 'word.mizu': true });
await p.evaluate(() => RB.world.tapTile(7, 6));
let r = 'timeout';
for (let k = 0; k < 20 && r !== 'battle'; k++) { await p.waitForTimeout(150); r = await drain(); }
ok(r === 'battle' && /voices are swirling|voices swirl/i.test(await said()), 'walking up to the millstone still meets the Mill Echo (' + r + ')');
await p.evaluate(() => { try { RB.combat && RB.combat.end && RB.combat.end(); } catch (e) { void e; } });

// ---- the jammed wheel's look ----
await start('rw.millroad', 14, 4, 'up', {});
await face('up');
ok(/waterwheel is still/.test(await said()), 'the jammed wheel: it is still, it only creaks');

// ---- the drawings ----
await start('rw.mill1', 12, 8, 'down', {});
await p.waitForTimeout(400);
const lum = await p.evaluate(() => {
  const cv = document.querySelector('canvas'), g = cv.getContext('2d'), k = cv.width / cv.clientWidth;
  const avg = (tx, ty, fx, fy, fw, fh) => {
    const a = RB.render.tileToCss(tx, ty), c = RB.render.tileToCss(tx + 1, ty + 1);
    const x = Math.round((a.x + (c.x - a.x) * fx) * k), y = Math.round((a.y + (c.y - a.y) * fy) * k), w = Math.max(1, Math.round((c.x - a.x) * fw * k)), h = Math.max(1, Math.round((c.y - a.y) * fh * k));
    const d = g.getImageData(x, y, w, h).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return s / (d.length / 4);
  };
  return { deep: avg(12, 9, 0.25, 0.75, 0.5, 0.12), landing: avg(11, 8, 0.2, 0.2, 0.6, 0.6), planks: avg(10, 9, 0.2, 0.2, 0.6, 0.6) };
});
ok(lum.deep < lum.landing * 0.45 && lum.deep < lum.planks * 0.45, 'the stair-well goes down into the dark, beside a lighter landing and planks ' + JSON.stringify(lum));
const art = await p.evaluate(() => {
  const P = RB.props.P.millwheel, pal = RB.tiles.PAL.reedwake;
  const shot = (t, o, rect) => {
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 120;
    const g = cv.getContext('2d');
    P.draw2(g, 48, 20, pal, t, Object.assign({ cx: 14, cy: 2 }, o));
    const d = g.getImageData(rect[0], rect[1], rect[2], rect[3]).data;
    let h = 0;
    for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) | 0;
    return h;
  };
  const WHEEL = [48 - 2, 20 - 10, 70, 60], LEAN = [48 - 40, 20 - 14, 34, 62];
  const ts = [1000, 1400, 2100, 3300];
  const hashes = (o, rect) => ts.map((t) => shot(t, o, rect));
  return {
    jammed: hashes({ still: true, jammed: true }, WHEEL), turning: hashes({}, WHEEL), reduced: hashes({ still: true }, WHEEL),
    lean: hashes({}, LEAN), jammedLean: shot(1000, { still: true, jammed: true }, LEAN), turningStill: shot(1000, { still: true }, WHEEL),
  };
});
const same = (a) => a.every((x) => x === a[0]);
ok(same(art.jammed), 'the jammed wheel never turns');
ok(!same(art.turning), 'the wheel turns once the echo is put to rest');
ok(same(art.reduced), 'reduced motion holds the turning wheel still');
ok(same(art.lean), 'the axle and the lean-to do not move while the wheel turns');
ok(art.jammed[0] !== art.turningStill, 'held still, the jammed wheel and the turning one still differ (white water against calm, a twig caught)');
ok(!errors.length, 'no page errors ' + errors.join('; '));
await b.close();
srv.close();
console.log(fails ? fails + ' failed' : 'ar1_mill_art: all passed');
process.exit(fails ? 1 : 0);
