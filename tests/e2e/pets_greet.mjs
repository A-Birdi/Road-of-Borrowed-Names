// Greeting together (addendum §6.3, §19.2) in the BUILT game — the sixteen companion × animal moments, in
// headless Chromium with session-only debug campaigns (no player saves):
// - from Company › Pet ("Greet together with …", clicked with the mouse): the folio closes, the moment plays in
//   the world, the animal walks over to your companion and acts, lines are advanced with the mouse on Next;
// - nothing is gained or lost (inventory, words, variables, flags other than "seen", Company records, awards);
// - replayable; refused (with a reason, nothing played) with no pet chosen, with the pet hidden in exploration,
//   and while a scene is running;
// - the rest-point route: RB.pets.restOption offers "Greet the … together" and plays the same moment;
// - a capture of each (tests/e2e/out/pets/greet_<comp>_<species>.png) and a contact sheet of all sixteen.
// Usage: node tests/e2e/pets_greet.mjs [species,…]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const SPECIES = (args.find((a) => /^(cat|dog|bird|tanuki)(,|$)/.test(a)) || 'cat,dog,bird,tanuki').split(',');
const COMPS = ['nao', 'mio', 'ren', 'suzu'];
const outDir = path.join(root, 'tests/e2e/out/pets');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + ': ' + e.message); console.log('FAIL ' + name + ': ' + (e.stack || e.message)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);

async function start(p, comp, sp) {
  await p.evaluate(async ([comp, sp]) => {
    RB.game.debugStart('rw.village', 20, 18, { comp, flags: { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true }, dir: 'down' });
    RB.game.settings.textSpeed = 'instant';
    await new Promise((r) => setTimeout(r, 250));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    if (sp) { RB.pets.meet(RB.game.s, sp); RB.pets.select(RB.game.s, sp); }
  }, [comp, sp]);
  await wait(p, 400);
  // a few steps, so your companion walks behind you as in play (and the animal follows)
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown']) { await p.keyboard.down(k); await wait(p, 230); await p.keyboard.up(k); await wait(p, 80); }
  await wait(p, 1500);
}
// what a greeting must not change
const snap = (p) => p.evaluate(() => {
  const s = RB.game.s;
  const flags = Object.keys(s.flags).filter((k) => !/^seen|^enter:/.test(k)).sort().map((k) => k + '=' + s.flags[k]);
  return JSON.stringify({ inv: s.inv, words: s.words, vars: s.vars, flags, company: s.company, awarded: s.awarded, quests: s.quests, learn: s.learn && { profile: s.learn.profile } });
});
const nextXY = (p) => p.evaluate(() => { const nb = document.querySelector('.dlg:not(.hidden) .b-next'); if (!RB.ui.dialogue.isOpen() || !nb) return null; const r = nb.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: document.querySelector('.dlg').textContent }; });

const sheet = [];
for (const sp of SPECIES) {
  for (const comp of COMPS) {
    await test(comp + ' × ' + sp + ': greet together from Company › Pet — plays in the world, the animal comes over and acts, nothing gained', async () => {
      const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
      await start(p, comp, sp);
      const before = await snap(p);
      await p.evaluate(() => RB.ui.menu.open('pet'));
      await p.waitForSelector('[data-pet-greet]');
      const bt = await p.evaluate(() => { const e = document.querySelector('[data-pet-greet]'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, text: e.textContent }; });
      assert(bt.h >= 44 && /Greet together with/.test(bt.text), 'the Greet together control (44 px): ' + JSON.stringify(bt));
      await p.mouse.click(bt.x, bt.y);
      await p.waitForFunction(() => RB.script.isRunning(), null, { timeout: 5000 });
      assert(await p.evaluate(() => !RB.ui.menu.isOpen()), 'the folio closed');
      const lines = [];
      let near = null, shotTaken = false;
      for (let i = 0; i < 60; i++) {
        const o = await nextXY(p);
        if (!o) { if (!(await p.evaluate(() => RB.script.isRunning()))) break; await wait(p, 100); continue; }
        if (lines[lines.length - 1] !== o.text) lines.push(o.text);
        const st = await p.evaluate(() => { const P = RB.petWorld.state(), c = RB.world.W.comp; return { d: Math.abs(P.x - c.x) + Math.abs(P.y - c.y), acting: P.acting, moving: P.moving }; });
        if (near == null || st.d < near) near = st.d;
        if (!shotTaken && lines.length >= 2 && !st.moving) { await wait(p, 350); await p.screenshot({ path: path.join(outDir, 'greet_' + comp + '_' + sp + '.png') }); shotTaken = true; }
        await wait(p, 250);
        await p.mouse.click(o.x, o.y);
        await wait(p, 150);
      }
      await p.waitForFunction(() => !RB.script.isRunning() && !RB.ui.dialogue.isOpen(), null, { timeout: 10000 });
      assert(lines.length >= 3, 'a short moment of several lines: ' + lines.length);
      assert(near <= 1, 'the animal came over to your companion (distance ' + near + ')');
      const seenId = await p.evaluate(([c, s]) => !!RB.game.s.seen['pets.greet.' + c + '.' + s], [comp, sp]);
      assert(seenId, 'the scene played was pets.greet.' + comp + '.' + sp);
      assert((await snap(p)) === before, 'nothing gained or lost');
      // replayable, straight away
      assert(await p.evaluate(() => RB.pets.canGreet(RB.game.s) === true), 'it can be played again');
      // the rest route plays the same moment
      const ro = await p.evaluate(() => { const o = RB.pets.restOption(RB.game.s); return o && { label: o.label, run: typeof o.run }; });
      assert(ro && /^Greet the .* together$/.test(ro.label.en) && ro.run === 'function', 'a rest point offers it: ' + JSON.stringify(ro));
      if (!errors.length) sheet.push({ comp, sp });
      assert(!errors.length, 'no page errors: ' + errors.join(' | '));
      await ctx.close();
    });
  }
}

await test('refusals: no pet chosen, the pet hidden in exploration, during a scene — a reason, nothing played', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'mio', 'cat');
  const r = await p.evaluate(async () => {
    const s = RB.game.s, out = {};
    RB.pets.select(s, null);
    out.none = RB.pets.canGreet(s);
    out.noneRest = RB.pets.restOption(s);
    RB.pets.select(s, 'cat');
    RB.game.settings.petWorld = false; RB.game.applySettings && RB.game.applySettings();
    out.hidden = RB.pets.canGreet(s);
    RB.game.settings.petWorld = true; RB.game.applySettings && RB.game.applySettings();
    RB.content.scenes['pets.test.busy'] = RB.script.parse('@scene pets.test.busy\nnarr: まって 。 || Wait.\n', 'test').scenes['pets.test.busy'];
    const run = RB.script.run('pets.test.busy');
    await new Promise((res) => setTimeout(res, 200));
    out.scene = RB.pets.canGreet(s);
    out.played = await RB.pets.greet(s);
    for (let i = 0; i < 10 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((res) => setTimeout(res, 50)); }
    await run;
    for (let i = 0; i < 40 && (RB.script.isRunning() || RB.game.mode() !== 'world'); i++) await new Promise((res) => setTimeout(res, 50));
    out.after = RB.pets.canGreet(s);
    return out;
  });
  assert(/Choose an animal/.test(r.none) && r.noneRest === null, 'no pet: ' + JSON.stringify(r));
  assert(/hidden in exploration/.test(r.hidden), 'hidden: ' + r.hidden);
  assert(/Not in the middle of a scene/.test(r.scene) && r.played === false, 'during a scene: ' + JSON.stringify(r));
  assert(r.after === true, 'afterwards, it can: ' + JSON.stringify(r.after));
  // the Pet page shows the reason instead of playing
  await p.evaluate(() => { RB.pets.select(RB.game.s, 'cat'); RB.game.settings.petWorld = false; RB.game.applySettings && RB.game.applySettings(); RB.ui.menu.open('pet'); });
  await p.waitForSelector('[data-pet-greet]');
  await p.click('[data-pet-greet]');
  await wait(p, 300);
  const msg = await p.evaluate(() => ({ open: RB.ui.menu.isOpen(), running: RB.script.isRunning(), text: (document.querySelector('.pet-live-msg') || {}).textContent }));
  assert(msg.open && !msg.running && /hidden in exploration/.test(msg.text || ''), 'the page says why and plays nothing: ' + JSON.stringify(msg));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await ctx.close();
});

// the contact sheet: all sixteen, cropped round the two of you and the animal
if (sheet.length) {
  const pg = await b.newPage();
  const urls = sheet.map((q) => ({ q, d: 'data:image/png;base64,' + fs.readFileSync(path.join(outDir, 'greet_' + q.comp + '_' + q.sp + '.png')).toString('base64') }));
  const data = await pg.evaluate(async (urls) => {
    const W = 360, H = 250, cols = 4;
    const rows = Math.ceil(urls.length / cols);
    const cv = document.createElement('canvas'); cv.width = cols * W; cv.height = rows * (H + 18);
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#1c2530'; c.fillRect(0, 0, cv.width, cv.height);
    c.font = '13px sans-serif'; c.fillStyle = '#eee';
    for (const [i, u] of urls.entries()) {
      const im = new Image(); im.src = u.d; await im.decode();
      const x = (i % cols) * W, y = Math.floor(i / cols) * (H + 18);
      c.drawImage(im, 640 - W / 2, 400 - H / 2 - 40, W, H, x, y + 18, W, H);
      c.fillText(u.q.comp + ' × ' + u.q.sp, x + 6, y + 13);
    }
    return cv.toDataURL('image/png');
  }, urls);
  fs.writeFileSync(path.join(outDir, 'greet_all.png'), Buffer.from(data.split(',')[1], 'base64'));
  await pg.close();
}

console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
