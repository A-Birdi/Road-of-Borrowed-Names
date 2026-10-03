// World review WR-02 probe: does a held dialogue line's portrait change while the line is held?
// Samples the portrait canvas 11 times over about five seconds (the review's method) at 1440×900 and
// 390×844, and reports the number of distinct images and the portrait's CSS size. A diagnostic, not part
// of the default suite. Synthetic debug start; no save is read or written.
// Usage: node tests/e2e/review_held_portrait.mjs [--root <checkout>]   (default: this checkout)
const ai = process.argv.indexOf('--root');
const root = ai > 0 ? process.argv[ai + 1] : new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const { serve, launch, page } = await import(root + '/tests/e2e/lib.mjs');
const { srv, url } = await serve();
const browser = await launch();
const out = {};
for (const [vw, vh] of [[1440, 900], [390, 844]]) {
  const { p, errors } = await page(browser, url, { viewport: { width: vw, height: vh } });
  await p.evaluate(async () => {
    RB.game.debugStart('sg.tidehut', 4, 5, { comp: 'mio', dir: 'up', flags: { ch1_done: true, departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 300));
  });
  const r = await p.evaluate(async () => {
    const started = !!(RB.game && RB.game.s);
    RB.script.add('@scene test.held\nwataru: …… すみません 。 || …I am sorry.\n', 'test');
    RB.script.run('test.held');
    let cv = null;
    for (let i = 0; i < 40 && !cv; i++) { await new Promise((r) => setTimeout(r, 100)); const b = document.querySelector('.dlg:not(.hidden)'); cv = b && b.querySelector('canvas.portrait'); }
    await new Promise((r) => setTimeout(r, 300));
    if (!cv) return { err: 'no portrait canvas', started, mode: RB.game.mode && RB.game.mode() };
    const rect = cv.getBoundingClientRect();
    const seen = new Set(); const samples = [];
    for (let i = 0; i < 11; i++) {
      const u = cv.toDataURL(); seen.add(u); samples.push(u.length);
      await new Promise((r) => setTimeout(r, 480));
    }
    return { unique: seen.size, samples: samples.length, cssW: Math.round(rect.width), cssH: Math.round(rect.height), started };
  });
  out[vw + 'x' + vh] = Object.assign(r, { errors: errors.slice(0, 3) });
}
console.log(JSON.stringify(out, null, 1));
await browser.close(); srv.close();
