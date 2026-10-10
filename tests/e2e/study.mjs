// The fidelity study, Suzu at the Mill (expansion P01, C-80; src/engine/68*_study*.js; docs/future/work/P01_STUDY.md),
// against the built index.html in Chromium, with no journey loaded (never a real save):
//  - it opens only on a development page (the world proof's switch), from the proof's panel or ?study=mill;
//  - it is a mode of the game: it draws into the game's buffer every frame and closes back to what was on screen
//    (Escape or its Close), with no save slot touched;
//  - held still, the same picture on every page load (no random stream); reduced motion holds Suzu still;
//  - each layer switch (light, focus, bloom, the close camera) changes the picture;
//  - no errors, no network.
// Usage: node tests/e2e/study.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 90s')), 90000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 700)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
// the canvas, drawn at a fixed instant, as a hash and a measure of how much it varies (a blank frame doesn't)
const look = (p) => p.evaluate(() => {
  RB.render.frame(5000);
  const cv = document.getElementById('world'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let x = 2166136261, sum = 0, sq = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    x ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); x = Math.imul(x, 16777619) >>> 0;
    if ((i >> 2) % 7 === 0) { const l = d[i] + d[i + 1] + d[i + 2]; sum += l; sq += l * l; n++; }
  }
  return { hash: x.toString(16) + ':' + cv.width + 'x' + cv.height, sd: Math.sqrt(sq / n - (sum / n) ** 2) };
});

await test('without the development switch the study does not exist for the player: it will not open, ?study=mill does nothing', async () => {
  const { p, ctx, errors, requests } = await page(b, url + '?study=mill', { viewport: { width: 1280, height: 800 } });
  await p.waitForTimeout(800);
  assert(await p.evaluate(() => !RB.study.isOpen() && RB.study.open() === false && !RB.study.isOpen()), 'the study opened without the switch');
  assert(!(await p.$('#study-ui')) && !(await p.$('#wl-dev')), 'no study or proof interface without the switch');
  assert(await p.evaluate(() => RB.game.mode() !== 'study'), 'the mode changed');
  assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
  await ctx.close();
});

await test('on a dev page: the panel opens it; it draws every frame into the game\'s buffer; Escape closes it back to the title; no save slot', async () => {
  const { p, ctx, errors, requests } = await page(b, url + '?dev=world', { viewport: { width: 1280, height: 800 } });
  await p.waitForSelector('#wl-dev');
  const before = await p.evaluate(() => ({ mode: RB.game.mode(), slot: RB.save.current().slot, ov: !!RB.render.getOverride() }));
  await p.click('#wl-study');
  await p.waitForFunction(() => RB.study.isOpen() && RB.study.stats().frames > 20, null, { timeout: 20000 });
  const open = await p.evaluate(() => ({ mode: RB.game.mode(), ui: !!document.getElementById('study-ui'), hidden: getComputedStyle(document.getElementById('ui')).visibility }));
  assert(open.mode === 'study' && open.ui && open.hidden === 'hidden', 'the study as a mode, the game\'s interface hidden: ' + JSON.stringify(open));
  const l = await look(p);
  assert(l.sd > 20, 'the frame should be a picture, not a blank: ' + JSON.stringify(l));
  await p.keyboard.press('Escape');
  const after = await p.evaluate(() => ({ open: RB.study.isOpen(), mode: RB.game.mode(), slot: RB.save.current().slot, ov: !!RB.render.getOverride(), ui: !!document.getElementById('study-ui') }));
  assert(!after.open && !after.ui && after.mode === before.mode && after.ov === before.ov && after.slot == null && before.slot == null, 'closed back to the title: ' + JSON.stringify({ before, after }));
  assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
  await ctx.close();
});

await test('held still it draws the same picture on every page load; reduced motion holds Suzu still; ?study=mill opens it', async () => {
  const hashes = [];
  for (let k = 0; k < 2; k++) {
    const { p, ctx, errors } = await page(b, url + '?dev=world&study=mill', { viewport: { width: 1280, height: 800 } });
    await p.waitForFunction(() => RB.study.isOpen(), null, { timeout: 20000 });
    await p.evaluate(() => RB.study.set({ motion: false }));
    hashes.push((await look(p)).hash);
    if (k === 1) {
      const still = await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); const S = RB.studySuzu, a = S.frameFor(S.poseAt(0, true)), b2 = S.frameFor(S.poseAt(2600, !!RB.game.reducedMotion())); return a === b2; });
      assert(still, 'reduced motion should hold Suzu in one pose');
    }
    assert(!errors.length, 'errors: ' + errors.join('; '));
    await ctx.close();
  }
  assert(hashes[0] === hashes[1], 'the same picture twice: ' + hashes.join(' / '));
});

await test('each layer changes the picture: light, focus, bloom, the close camera; in motion, two instants differ', async () => {
  const { p, ctx, errors } = await page(b, url + '?dev=world&study=mill', { viewport: { width: 1280, height: 800 } });
  await p.waitForFunction(() => RB.study.isOpen(), null, { timeout: 20000 });
  await p.evaluate(() => RB.study.set({ motion: false }));
  const base = (await look(p)).hash;
  for (const k of ['light', 'focus', 'bloom', 'life']) {
    await p.evaluate((k) => RB.study.set({ [k]: false }), k);
    const h = (await look(p)).hash;
    await p.evaluate((k) => RB.study.set({ [k]: true }), k);
    assert(h !== base, 'switching off ' + k + ' changed nothing');
  }
  await p.evaluate(() => RB.study.set({ close: true }));
  const close = await p.evaluate(() => RB.render.viewSize().w / 16);
  assert(close < 18, 'the close camera shows fewer tiles: ' + close);
  await p.evaluate(() => RB.study.set({ close: false, motion: true }));
  const moved = await p.evaluate(() => {
    const S = RB.studySuzu, a = S.frameFor(S.poseAt(100, false)).buf.d, b2 = S.frameFor(S.poseAt(1700, false)).buf.d;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b2[i]) diff++;
    return diff;
  });
  assert(moved > 20, 'Suzu should move between two instants of her idle: ' + moved + ' bytes differ');
  await p.evaluate(() => RB.study.close());
  assert(await p.evaluate(() => RB.render.viewSize().w / 16) > 18, 'closing returns the game\'s own camera');
  assert(!errors.length, 'errors: ' + errors.join('; '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
