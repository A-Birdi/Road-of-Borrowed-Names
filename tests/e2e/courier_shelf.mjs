// RBN-QA-095 (Agnes 6336337663; Cloud CC-105; Local CL-180): the shelf in Sono's Courier's Inn at Sakashita
// (cr.saka_inn, (1,2)) was drawn as an ordinary bookshelf, while its scene (cr.saka_shelf) says "On the shelf: an old
// straw hat, and a happi coat with the relay's emblem on it" and Sono calls them her grandfather's spares. That one
// placement is now a keepsake shelf (o.keep 'courier'): the straw hat on the top shelf, the relay coat hung below it
// from the back with its crest (a plain ring, no letters), straw sandals beside it; no books. In Chromium on the built
// game:
//  1. the placement: that shelf, the same tile and scene, with the keepsake option; the only shelf in the game with it;
//  2. the drawing: the map draws the keepsake shelf on (1,2); the keepsake picture has the hat (straw across the top
//     shelf), the coat (indigo below) and its crest (a pale ring round the coat's middle); the ordinary shelf drawn on
//     the same tile has no crest ring; the outline is the shelf's own (the same opaque pixels as the ordinary one);
//  3. the tile: (1,2) still blocks;
//  4. read with the world's own interact from each side you can stand on: the scene's line, as before;
//  5. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const allErrors = [];

async function start(p, x, y, dir) {
  await p.evaluate(([x, y, dir]) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_st1: true, cr_st2: true, cr_st3: true };
    const s = RB.game.debugStart('cr.saka_inn', x, y, { dir, comp: 'suzu', flags: done });
    s.edition = 2; s.quests.cr_main = { stage: 2, done: false };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.world.enter('cr.saka_inn', x, y, dir, { fresh: true });
  }, [x, y, dir]);
  await p.waitForTimeout(900);
}

{
  const { p, errors } = await page(b, url);
  await start(p, 1, 3, 'up');

  // ---- 1. the placement ------------------------------------------------------------------------------------------------
  const pl = await p.evaluate(() => {
    const M = RB.content.maps, here = M['cr.saka_inn'].props.filter((q) => q.x === 1 && q.y === 2);
    let shelves = 0; const kept = [];
    for (const id in M) for (const q of M[id].props || []) if (q.p === 'shelf') { shelves++; if (q.o && q.o.keep) kept.push(id + '@' + q.x + ',' + q.y); }
    return { here: here.map((q) => ({ p: q.p, scene: q.scene, o: q.o || null })), shelves, kept };
  });
  ok(pl.here.length === 1 && pl.here[0].p === 'shelf' && pl.here[0].scene === 'cr.saka_shelf' && pl.here[0].o && pl.here[0].o.keep === 'courier',
    'the inn\'s shelf is the keepsake shelf, the same tile and scene (' + JSON.stringify(pl.here) + ')');
  ok(pl.kept.length === 1 && pl.kept[0] === 'cr.saka_inn@1,2' && pl.shelves > 1, 'it is the only keepsake shelf; every other shelf is as it was (' + JSON.stringify(pl) + ')');

  // ---- 2. the drawing --------------------------------------------------------------------------------------------------
  const d = await p.evaluate(async () => {
    const P = RB.props.P, calls = [];
    const f0 = P.shelf.draw2;
    P.shelf.draw2 = function (c, x, y, pal, t, o) { if (o && o.cx === 1 && o.cy === 2) calls.push(o.keep || null); return f0.apply(this, arguments); };
    RB.render.invalidate && RB.render.invalidate();
    await new Promise((r) => setTimeout(r, 400));
    P.shelf.draw2 = f0;
    // the art itself, in the inn's own palette, ordinary and keepsake, for the same tile (sprite origin at (8,24))
    const pal = RB.world.W.map.pal || RB.tiles.PAL.interior;
    const pic = (keep) => { const c = document.createElement('canvas'); c.width = 48; c.height = 64; const g = c.getContext('2d'); P.shelf.draw2(g, 8, 24, pal, 0, Object.assign({ cx: 1, cy: 2, still: true }, keep ? { keep } : {})); return g.getImageData(0, 0, 48, 64).data; };
    const a = pic(null), k = pic('courier');
    const at = (D, x, y) => { const i = ((y + 24) * 48 + (x + 8)) * 4; return [D[i], D[i + 1], D[i + 2], D[i + 3]]; };
    const straw = ([r, g, bl, al]) => al > 200 && r > 150 && g > 120 && bl < 130 && r > bl + 50;
    const indigo = ([r, g, bl, al]) => al > 200 && bl > r + 18 && bl > g + 8 && r < 110;
    const cream = ([r, g, bl, al]) => al > 200 && r > 200 && g > 190 && bl > 160;
    let hat = 0, coat = 0, ring = 0, ringPlain = 0, outline = 0;
    for (let y = -11; y <= -4; y++) for (let x = 4; x <= 28; x++) if (straw(at(k, x, y))) hat++;
    for (let y = 2; y <= 18; y++) for (let x = 4; x <= 28; x++) if (indigo(at(k, x, y))) coat++;
    for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) { const r = Math.hypot(i, j); if (r >= 2.5 && r <= 4.5) { if (cream(at(k, 16 + i, 10 + j))) ring++; if (cream(at(a, 16 + i, 10 + j))) ringPlain++; } }
    for (let i = 0; i < k.length; i += 4) if ((a[i + 3] > 0) !== (k[i + 3] > 0)) outline++;
    return { calls, hat, coat, ring, ringPlain, outline };
  });
  ok(d.calls.length > 0 && d.calls.every((x) => x === 'courier'), 'the map draws the keepsake shelf on (1,2) (' + JSON.stringify(d.calls.slice(0, 3)) + ')');
  ok(d.hat >= 60 && d.coat >= 150 && d.ring >= 25, 'the keepsake shelf has the straw hat, the indigo coat and its pale crest ring (' + JSON.stringify({ hat: d.hat, coat: d.coat, ring: d.ring }) + ')');
  ok(d.ringPlain < 6, 'the ordinary shelf on the same tile has no crest ring (' + d.ringPlain + ')');
  ok(d.outline === 0, 'the outline is the shelf\'s own: the same opaque pixels as the ordinary one (' + d.outline + ' differ)');

  // ---- 3. the tile -------------------------------------------------------------------------------------------------------
  const blocks = await p.evaluate(() => RB.maps.blockedStatic(RB.world.W.map, 1, 2));
  ok(blocks, 'the shelf\'s tile (1,2) still blocks');

  // ---- 4. read from each side you can stand on ---------------------------------------------------------------------------
  const sides = await p.evaluate(() => { const m = RB.world.W.map, B = (x, y) => RB.maps.blockedStatic(m, x, y); return [['below', 1, 3, 'up'], ['right', 2, 2, 'left']].filter((q) => !B(q[1], q[2])); });
  const reads = [];
  for (const [side, x, y, dir] of sides) {
    await p.evaluate(([x, y, dir]) => RB.world.enter('cr.saka_inn', x, y, dir, {}), [x, y, dir]);
    await p.waitForTimeout(400);
    await p.evaluate(() => RB.world.interact());
    await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 }).catch(() => {});
    reads.push([side, await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return d ? String(d.en || '').slice(0, 60) : null; })]);
    for (let i = 0; i < 6 && (await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.script.isRunning())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(250); }
  }
  ok(reads.length >= 1 && reads.every((r) => r[1] && /On the shelf: an old straw hat, and a happi coat/.test(r[1])), 'read from each side you can stand on: the scene\'s line (' + JSON.stringify(reads) + ')');
  allErrors.push(...errors);
  await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
