// The world view around the dialogue and at the map's edges: the camera never
// moves because a dialogue opens or closes; when the sheet at the bottom would
// cover the player or the speaker it docks at the top (replies then sit below
// it); outdoors, the view past a map's edge continues that edge (the river
// keeps flowing, a wooded edge stays wooded, nothing is placed on the water or
// the road) and darkens gently, including after the window grows; walled
// interiors keep their timber surround.
// Usage: node tests/e2e/world_view.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const FLAGS = { departed: true, ch1_done: true, rw_echo_done: true, rw_mill_open: true };
const start = (p, m, x, y) => p.evaluate(async ([m, x, y, F]) => {
  RB.game.debugStart(m, x, y, { comp: 'mio', flags: F });
  RB.game.settings.textSpeed = 'instant';
  await new Promise((r) => setTimeout(r, 300));
  while (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 30)); }
  await new Promise((r) => setTimeout(r, 300));
}, [m, x, y, FLAGS]);
const camAt = (p) => p.evaluate(() => [RB.render.cam.x, RB.render.cam.y].join());
// whether the sheet covers the player or the companion (the speaker below)
const cover = (p) => p.evaluate(() => {
  const r = document.querySelector('.dlg').getBoundingClientRect();
  const hit = (a) => { const q0 = RB.render.tileToCss(a.fx, a.fy - 0.5), q1 = RB.render.tileToCss(a.fx + 1, a.fy + 1); return q1.x > r.left + 4 && q0.x < r.right - 4 && q1.y > r.top + 4 && q0.y < r.bottom - 4; };
  const W = RB.world.W;
  return { player: hit(W.player), speaker: !!W.comp && hit(W.comp), top: document.querySelector('.dlg').classList.contains('top'), bodyTop: document.body.classList.contains('dlg-top') };
});
const say = (p) => p.evaluate(() => { window.__said = false; RB.script.runInline([{ who: 'mio', jp: '{落|お}ち{着|つ}く お{茶|ちゃ} を {煎|せん}じて います 。', en: "I'm brewing a calming tea." }]).then(() => { window.__said = true; }); });

// ---- desktop: near the bottom of the map the sheet docks at the top; mid-map it stays at the bottom
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.millroad', 13, 23);
  const c0 = await camAt(p);
  await say(p);
  await p.waitForTimeout(250);
  const c1 = await camAt(p), d1 = await cover(p);
  assert(c1 === c0, `camera unchanged when the dialogue opens (${c0} → ${c1})`);
  assert(d1.top && d1.bodyTop, 'near the bottom of the view the sheet docks at the top');
  assert(!d1.player && !d1.speaker, 'the sheet covers neither the player nor the speaker');
  // replies go below a top-docked sheet
  await p.evaluate(() => { window.__pick = null; RB.ui.dialogue.choose([{ en: 'Thank you.' }, { en: 'Is it bitter?' }]).then((i) => { window.__pick = i; }); });
  await p.waitForTimeout(150);
  const ch = await p.evaluate(() => { const c = document.querySelector('.choices').getBoundingClientRect(), d = document.querySelector('.dlg').getBoundingClientRect(); return { below: c.top >= d.bottom - 1, inView: c.bottom <= innerHeight + 1 }; });
  assert(ch.below && ch.inView, 'replies sit below a top-docked sheet, on screen');
  await p.locator('.choice >> nth=0').click();
  await p.evaluate(() => RB.ui.dialogue.advance(true));
  await p.waitForFunction(() => window.__said === true);
  // the game may follow with a scene of its own; let it finish too
  await p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 60)); } });
  await p.waitForTimeout(250);
  const c2 = await camAt(p);
  assert(c2 === c0 && !(await p.evaluate(() => document.body.classList.contains('dlg-top'))), `camera unchanged after the dialogue closes (${c2}); dock reset`);
  // mid-map: the default bottom sheet covers no one, so it stays there
  await start(p, 'rw.village', 22, 16);
  const m0 = await camAt(p);
  await say(p);
  await p.waitForTimeout(250);
  const dm = await cover(p);
  assert(!dm.top && !dm.player && (await camAt(p)) === m0, 'mid-map the sheet stays at the bottom, the camera stays put and the player is clear');
  await p.evaluate(() => RB.ui.dialogue.advance(true));
  assert(!errors.length, 'no page errors (desktop) ' + errors.join('; '));
  await ctx.close();
}

// ---- phone: the touch controls' band is kept while they hide, so the dialogue moves nothing
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  await start(p, 'rw.millroad', 13, 23);
  const c0 = await camAt(p);
  await say(p);
  await p.waitForTimeout(400);
  const c1 = await camAt(p), d1 = await cover(p);
  assert(c1 === c0, `phone: camera unchanged when the dialogue opens (${c0} → ${c1})`);
  assert(!d1.player && !d1.speaker, `phone: the sheet covers neither the player nor the speaker (docked ${d1.top ? 'top' : 'bottom'})`);
  const r = await p.evaluate(() => { const d = document.querySelector('.dlg').getBoundingClientRect(); return { l: d.left, r: d.right, t: d.top, over: document.documentElement.scrollWidth > innerWidth + 1 }; });
  assert(r.l >= -1 && r.r <= 391 && r.t >= -1 && !r.over, 'phone: the docked sheet is on screen, nothing wider than it');
  await p.evaluate(() => RB.ui.dialogue.advance(true));
  await p.waitForTimeout(300);
  assert((await camAt(p)) === c0, 'phone: camera unchanged after the dialogue closes');
  assert(!errors.length, 'no page errors (phone) ' + errors.join('; '));
  await ctx.close();
}

// ---- past the edge of an outdoor map: the edge continues, darkening; interiors keep their surround
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1920, height: 500 } });
  await start(p, 'rw.millroad', 13, 12);
  const probe = () => p.evaluate(() => {
    const m = RB.world.W.map, cv = document.getElementById('world'), g = cv.getContext('2d'), k = devicePixelRatio;
    const X0 = Math.round(RB.render.tileToCss(0, 0).x * k), X1 = Math.round(RB.render.tileToCss(m.w, 0).x * k);
    const col = (x) => { const d = g.getImageData(Math.max(0, Math.min(cv.width - 4, x)), 0, 4, cv.height).data; const s = [0, 0, 0]; for (let i = 0; i < d.length; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; } return s.map((v) => Math.round(v / (d.length / 4))); };
    const n = parseInt(RB.tiles.PAL[m.region].dark.slice(1), 16), dark = [n >> 16, (n >> 8) & 255, n & 255];
    return {
      X0, X1, W: cv.width, margin: m.margin, dark,
      rightIn: col(X1 - 24), rightOut: col(Math.round((X1 + cv.width) / 2)), leftIn: col(X0 + 24), leftOut: col(Math.round(X0 / 2)),
      trees: (m.apronProps || []).filter((q) => q.x < 0 && q.p === 'tree').length,
      onWater: (m.apronProps || []).filter((q) => q.x >= m.w).length,
      onRoad: (m.apronProps || []).filter((q) => q.y >= m.h && (q.x === 10 || q.x === 11)).length,
    };
  });
  let e = await probe();
  const lum = (c) => (c[0] + c[1] + c[2]) / 3;
  const far = (a, c) => Math.abs(a[0] - c[0]) + Math.abs(a[1] - c[1]) + Math.abs(a[2] - c[2]);
  assert(e.X0 > 8 && e.X1 < e.W - 8, `the map is narrower than this view (${e.X0}..${e.X1} of ${e.W})`);
  assert(e.rightOut[2] > e.rightOut[0] + 25 && far(e.rightOut, e.dark) > 60, 'past the river edge the river continues (' + e.rightOut + ')');
  assert(e.leftOut[1] > e.leftOut[2] && e.leftOut[1] > e.leftOut[0] && far(e.leftOut, e.dark) > 60, 'past the wooded edge the woods continue (' + e.leftOut + ')');
  assert(lum(e.rightOut) < lum(e.rightIn) && lum(e.leftOut) < lum(e.leftIn), 'the ground past the edge is darker than inside');
  assert(e.trees > 10 && e.onWater === 0 && e.onRoad === 0, `trees continue the wooded edge (${e.trees}); none on the river (${e.onWater}) or the road (${e.onRoad})`);
  // a larger window rebuilds the band past the edge
  await p.setViewportSize({ width: 2600, height: 500 });
  await p.waitForTimeout(500);
  const e2 = await probe();
  assert(e2.margin.x > e.margin.x && e2.rightOut[2] > e2.rightOut[0] + 25 && far(e2.rightOut, e2.dark) > 60, `after the window grows the edge still continues (margin ${e.margin.x} → ${e2.margin.x})`);
  // walled interiors keep the surround
  await start(p, 'rw.hall', 5, 6);
  const hall = await p.evaluate(() => { const m = RB.world.W.map; return { enclosed: m.enclosed, margin: m.margin, props: (m.apronProps || []).length }; });
  assert(hall.enclosed && hall.margin.x === 0 && hall.margin.y === 0 && hall.props === 0, 'a walled interior keeps its timber surround (no continued ground)');
  assert(!errors.length, 'no page errors (edges) ' + errors.join('; '));
  await ctx.close();
}

await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
