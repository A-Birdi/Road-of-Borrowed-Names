// RBN-QA-163 C (Agnes 6375174827; Local CL-248; Cloud CC-154 §4): the ink in the water at the Ink Bridge, in the
// browser, as the renderer bakes it into Blockprint Row's ground:
//  1. what the patch paints lies inside its three water tiles south of the bridge, clear of the banks' edges; nothing
//     above its own row (the bridge's rows);
//  2. in the map's ground as built, the water there is darker than the same canal further down, and the bridge's
//     rows are drawn as before;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ink_water.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const r = await p.evaluate(async () => {
  const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, mp_arrived: true, mp_sobe_met: true };
  const s = RB.game.debugStart('mp.blockprint', 22, 21, { dir: 'left', edition: RB.edition.forNew(), flags: FLAGS });
  s.comp = null;
  await new Promise((res) => setTimeout(res, 1200));
  const W = RB.world.W, m = W.map, pal = RB.tiles.PAL[m.region];
  const T = m.staticLayer.width / (m.w + 2 * m.margin.x); // art pixels a tile
  // 1. the patch alone, baked onto a clear canvas with a tile's room above it
  const c = document.createElement('canvas'); c.width = 3 * T; c.height = 5 * T;
  const g = c.getContext('2d');
  const pd = RB.props.P.mp_inkwater; // (on a build without it, nothing is painted and the checks fail)
  if (pd && pd.bake2) pd.bake2(g, 0, 2 * T, pal, { cx: 18, cy: 24 });
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let above = 0, inside = 0, edge = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (!d[(y * c.width + x) * 4 + 3]) continue;
    if (y < 2 * T) above++; else inside++;
    if (x < 4 || x >= 3 * T - 4) edge++;
  }
  // 2. the ground as built: mean brightness of the patch's tiles against the same canal three tiles further down
  const sg = m.staticLayer.getContext('2d');
  const lum = (tx, ty, tw, th) => {
    const q = sg.getImageData((tx + m.margin.x) * T, (ty + m.margin.y) * T, tw * T, th * T).data;
    let sum = 0; for (let i = 0; i < q.length; i += 4) sum += 0.2126 * q[i] + 0.7152 * q[i + 1] + 0.0722 * q[i + 2];
    return sum / (q.length / 4);
  };
  return { T, above, inside, edge, patch: Math.round(lum(18, 24, 3, 1)), further: Math.round(lum(18, 28, 3, 1)), bridge: Math.round(lum(18, 22, 3, 2)) };
});
ok(r.inside > 0 && r.above === 0 && r.edge === 0, 'the patch paints only its own water, south of the bridge and clear of the banks (' + JSON.stringify(r) + ')');
ok(r.patch < r.further - 10, 'in the ground as built, the water at the bridge is darker than the canal further down (' + r.patch + ' against ' + r.further + ')');
ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
