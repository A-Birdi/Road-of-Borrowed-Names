// The portrait development viewer (src/ui/21z_portrait_dev.js; ?dev=portraits): refused on a normal page; on a dev
// page it opens over the title with the game's own renderer and timeline, keeps later chapters' people hidden until
// revealed, sizes every display cell by the game's own fit, and lets no key reach the title screen underneath.
// Usage: node tests/e2e/portrait_dev.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 30000 });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ allowed: RB.portraitDev.allowed(), open: RB.portraitDev.open(), el: !!document.getElementById('por-dev') }));
  ok(!r.allowed && r.open === null && !r.el, 'a normal page: the viewer is refused and nothing is added ' + JSON.stringify(r));
  ok(!errors.length, 'no page errors (' + errors.join('; ') + ')');
  await p.context().close();
}

{
  const { p, errors, requests } = await page(b, url + '?dev=portraits', { viewport: { width: 1600, height: 1000 } });
  await p.waitForSelector('#por-dev td canvas[data-dev]', { timeout: 30000 });
  const s0 = await p.evaluate(() => RB.portraitDev.state());
  ok(s0 && s0.frames > 100 && s0.cueEnd > 0, 'a dev page opens the viewer on its own: Suzu smiling, a timeline with a lead-in cue ' + JSON.stringify({ frames: s0 && s0.frames, cueEnd: s0 && s0.cueEnd }));
  ok(JSON.stringify(s0.masked) === '["ch2","later"]' && s0.shown.includes('pc') && ['nao', 'mio', 'ren', 'suzu', 'tsuru'].every((id) => s0.shown.includes(id)) && !s0.shown.includes('omi') && !s0.shown.includes('kasane'),
    'you, the companions and Chapter 1 are shown; Chapter 2 and later stay hidden until revealed ' + JSON.stringify(s0.masked));
  // every cell: the game's own fit at that layout and ratio, at real device pixels
  const fit = await p.evaluate(() => {
    const D = RB.portraitDev, want = [];
    for (const L of D.LAYOUTS) for (const d of D.DPRS) want.push(Math.round(RB.portraitAnim.fitSize(L.target, d, L.grow) * d));
    return { want, got: RB.portraitDev.state().cells };
  });
  ok(JSON.stringify(fit.want) === JSON.stringify(fit.got) && fit.got.length === 18, 'three layouts × six ratios, each the size the game would draw (' + fit.got.join(', ') + ' device px)');
  // the animation runs: the frame key changes over a few seconds of real time
  const keys = new Set();
  for (let i = 0; i < 16; i++) { keys.add(await p.evaluate(() => RB.portraitDev.state().key)); await p.waitForTimeout(400); }
  ok(keys.size >= 2, 'the loop plays (' + keys.size + ' different frames in 6 s)');
  await p.click('[data-expr="laugh"]');
  const s1 = await p.evaluate(() => RB.portraitDev.state());
  ok(s1.expr === 'laugh' && s1.cueEnd > 0, 'an expression with a cue starts its line again ' + JSON.stringify({ expr: s1.expr, cueEnd: s1.cueEnd }));
  await p.click('#pd-still');
  const s2 = await p.evaluate(() => RB.portraitDev.state());
  ok(s2.still && s2.key === 'still', 'Still (Reduce motion) shows the held image');
  await p.click('[data-reveal="ch2"]');
  const s3 = await p.evaluate(() => RB.portraitDev.state());
  ok(s3.shown.includes('omi') && JSON.stringify(s3.masked) === '["later"]', 'Reveal shows that group only');
  await p.click('[data-who="pc"]');
  await p.click('[data-acc="hat"]');
  const s4 = await p.evaluate(() => RB.portraitDev.state());
  ok(s4.who === 'pc' && !!(await p.$('#pd-look')), 'your own portrait with the look controls');
  // keys stay in the viewer: Enter and Escape do not start or open anything on the title underneath
  const before = await p.evaluate(() => RB.game.mode());
  for (const k of ['Enter', 'Escape', 'n', 'ArrowDown', 'Enter']) await p.keyboard.press(k);
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({ mode: RB.game.mode(), campaign: !!(RB.game.s && RB.game.s.player) }));
  ok(after.mode === before && !after.campaign, 'no key reaches the title screen (mode ' + before + ' → ' + after.mode + ')');
  ok(!errors.length && !requests.length, 'no page errors, no network requests (' + errors.concat(requests).join('; ') + ')');
  await p.context().close();
}

await b.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
