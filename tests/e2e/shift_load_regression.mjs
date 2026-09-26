/* Targeted Shift/Load regressions (hotfix: Run leaked into movement direction
 * and froze the frame loop; Load/Continue left the title backdrop drawn over
 * the world and blocked world pointer input).
 *
 *   node tests/e2e/shift_load_regression.mjs [--html index.html]
 *        [--fixture tests/fixtures/shift_load_legacy.json] [--origin | --inline] [--report out.json]
 *
 * Modes:
 *   default   real file:// navigation of the HTML (IndexedDB where the browser
 *             allows it for file URLs; the storage mode is recorded per test)
 *   --origin  served from a stable http://127.0.0.1 origin by a local static
 *             server (normal IndexedDB); includes real page-reload persistence
 *   --inline  page.setContent, session-only storage — NOT a persistence test
 * The legacy fixture is a synthetic campaign saved by the pre-hotfix build
 * (development test data only; the game has no save import/export).
 * World visibility is asserted by world sprites being drawn AND the canvas
 * pixels differing from the title backdrop, not only by state/music.
 */
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { chromium, root } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (key, fallback) => (args.includes(key) ? args[args.indexOf(key) + 1] : fallback);
const htmlPath = path.resolve(opt('--html', path.join(root, 'index.html')));
const inline = args.includes('--inline');
const origin = args.includes('--origin');
const mode = inline ? 'inline-session-only' : origin ? 'http-origin' : 'file-navigation';
const fixture = JSON.parse(await fs.readFile(opt('--fixture', path.join(root, 'tests/fixtures/shift_load_legacy.json')), 'utf8'));
const html = await fs.readFile(htmlPath, 'utf8');

// stable origin: one server for the whole run (same port → same IndexedDB origin across reloads)
let srv = null, baseUrl = null;
if (origin) {
  srv = http.createServer((req, res) => {
    if (req.url.split('?')[0] !== '/') { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(html);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  baseUrl = 'http://127.0.0.1:' + srv.address().port + '/';
}

const browser = await chromium.launch({ headless: true });
const results = [];
let page, context, errors, storageMode, titleSample;

// a coarse grid of canvas pixels (the display canvas the renderer draws into)
const sampleCanvas = () => page.evaluate(() => {
  const c = document.getElementById('world');
  const g = c.getContext('2d');
  const out = [];
  for (let j = 1; j < 12; j++) for (let i = 1; i < 16; i++) {
    const d = g.getImageData(Math.floor(c.width * i / 16), Math.floor(c.height * j / 12), 1, 1).data;
    out.push(d[0], d[1], d[2]);
  }
  return out;
});

async function boot(seed = true) {
  context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await context.newPage(); errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setDefaultTimeout(5000);
  if (inline) await page.setContent(html, { waitUntil: 'load' });
  else if (origin) await page.goto(baseUrl);
  else await page.goto(pathToFileURL(htmlPath).href);
  await page.waitForFunction(() => window.__RB_READY__ === true);
  storageMode = await page.evaluate(() => RB.save.status().mode);
  if (seed) await page.evaluate(async (s) => { await RB.save.writeSlot(1, s, { force: true }); RB.ui.title.show(); }, fixture);
  await page.waitForTimeout(250);
  titleSample = await sampleCanvas(); // the title backdrop, for the visibility check
}
async function load(which = 'manual') {
  if (which === 'continue') await page.locator('.title [data-a="continue"]').click();
  else {
    await page.locator('.title [data-a="load"]').click();
    const action = which === 'auto' ? 'loadauto' : which === 'predeparture' ? 'loadpre' : 'load';
    const btn = page.locator(`[data-slot="1"] [data-a="${action}"]`);
    // recovery points (older autosave, pre-departure) live in the record's Manage area
    await btn.waitFor({ state: 'attached' });
    if (!(await btn.isVisible())) await page.locator('[data-slot="1"] [data-a="manage"]').click();
    await btn.click();
  }
  await page.waitForFunction(() => RB.game.mode() === 'world' && !!RB.world.W.player);
}
async function checkLive() {
  const before = await page.evaluate(() => RB.world.W.time);
  await page.waitForTimeout(220);
  const after = await page.evaluate(() => RB.world.W.time);
  assert(after > before + 30, `world loop stopped: ${before} -> ${after}`);
  assert.deepEqual(errors, [], `page errors: ${errors.join('; ')}`);
}
async function spyWorld() {
  await page.evaluate(() => { window.__worldSprites = 0; const get = RB.sprites.get; RB.sprites.get = function (...a) { window.__worldSprites++; return get.apply(this, a); }; });
}
async function checkWorldVisible() {
  await page.waitForTimeout(180);
  assert((await page.evaluate(() => window.__worldSprites)) > 0, 'no world sprites rendered: title/other override still active');
  assert.equal(await page.locator('.title').count(), 0);
  assert.equal(await page.locator('.hud').count(), 1);
  // the pixels on screen must no longer be the title backdrop
  const now = await sampleCanvas();
  let differing = 0;
  for (let i = 0; i < now.length; i += 3) if (Math.abs(now[i] - titleSample[i]) + Math.abs(now[i + 1] - titleSample[i + 1]) + Math.abs(now[i + 2] - titleSample[i + 2]) > 30) differing++;
  assert(differing > now.length / 3 * 0.4, `canvas still looks like the title backdrop (${differing}/${now.length / 3} sample points changed)`);
}
async function test(name, fn, { seed = true } = {}) {
  const t = Date.now();
  try { await boot(seed); await fn(); assert.deepEqual(errors, []); results.push({ name, pass: true, ms: Date.now() - t, storageMode }); console.log('PASS', name, '[' + storageMode + ']'); }
  catch (e) { results.push({ name, pass: false, ms: Date.now() - t, error: e.message, pageErrors: errors?.slice(), storageMode }); console.log('FAIL', name, e.message); }
  finally { if (context) await context.close(); }
}
try {
  for (const key of ['ShiftLeft', 'ShiftRight']) await test(`${key} alone remains stationary and keeps animating`, async () => {
    await load(); const pos = await page.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
    await page.keyboard.down(key); await page.waitForTimeout(220);
    assert.equal(await page.evaluate(() => RB.input.dir()), null, 'run action leaked into direction');
    assert.equal(await page.evaluate(() => RB.input.running()), true);
    await checkLive(); await page.keyboard.up(key);
    assert.deepEqual(await page.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]), pos); await checkLive();
  });
  await test('Movement then Shift keeps direction and uses 105 ms run steps', async () => {
    await load(); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(220); await page.keyboard.down('ShiftLeft');
    assert.equal(await page.evaluate(() => RB.input.dir()), 'right');
    await page.waitForFunction(() => RB.world.W.player.mv?.dur === 105);
    await checkLive(); await page.keyboard.up('ArrowRight'); await page.keyboard.up('ShiftLeft'); await checkLive();
  });
  await test('Shift then movement runs; releasing direction while Shift stays held is safe', async () => {
    await load(); await page.keyboard.down('ShiftLeft'); await page.waitForTimeout(120); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => RB.world.W.player.mv?.dur === 105); await page.keyboard.up('ArrowRight'); await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => RB.input.dir()), null); await checkLive(); await page.keyboard.up('ShiftLeft');
  });
  await test('Releasing run while direction stays held returns to 160 ms walking', async () => {
    await load(); await page.keyboard.down('ShiftRight'); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => RB.world.W.player.mv?.dur === 105); await page.keyboard.up('ShiftRight');
    await page.waitForFunction(() => RB.world.W.player.mv?.dur === 160); await page.keyboard.up('ArrowRight'); await checkLive();
  });
  await test('Remapped Run key is still a modifier, not a direction', async () => {
    await load(); await page.evaluate(() => RB.input.setBinds({ run: ['KeyR'] })); await page.keyboard.down('KeyR');
    assert.equal(await page.evaluate(() => RB.input.dir()), null); assert.equal(await page.evaluate(() => RB.input.running()), true); await checkLive();
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => RB.world.W.player.mv?.dur === 105);
    await page.keyboard.up('KeyR'); await page.keyboard.up('ArrowRight'); await checkLive();
  });
  await test('Focus loss clears movement and run state', async () => {
    await load(); await page.keyboard.down('ArrowRight'); await page.keyboard.down('ShiftLeft');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await page.evaluate(() => RB.input.dir()), null); assert.equal(await page.evaluate(() => RB.input.running()), false);
    await page.keyboard.up('ArrowRight'); await page.keyboard.up('ShiftLeft'); await checkLive();
  });
  await test('Text-field Shift and typing do not control the world', async () => {
    await load(); await page.evaluate(() => { const el = document.createElement('input'); el.id = 'hotfix-input'; document.body.appendChild(el); el.focus(); });
    await page.keyboard.down('ShiftLeft'); await page.keyboard.press('KeyD');
    assert.equal(await page.evaluate(() => RB.input.dir()), null); assert.equal(await page.evaluate(() => RB.input.running()), false);
    await page.keyboard.up('ShiftLeft'); await page.evaluate(() => document.querySelector('#hotfix-input').remove()); await checkLive();
  });
  await test('Invalid movement token is rejected without ending the frame loop', async () => {
    await load(); await page.evaluate(() => { const dir = RB.input.dir; window.__restoreDirection = () => (RB.input.dir = dir); RB.input.dir = () => 'run'; });
    await checkLive(); await page.evaluate(() => window.__restoreDirection()); await checkLive();
  });
  await test('Manual Load shows world and preserves old-build campaign data', async () => {
    await spyWorld(); await load(); await checkWorldVisible();
    const state = await page.evaluate(() => ({ player: RB.game.s.player, flags: RB.game.s.flags, inv: RB.game.s.inv, quests: RB.game.s.quests, learn: RB.game.s.learn, map: RB.game.s.map, comp: RB.game.s.comp }));
    for (const k of Object.keys(state)) assert.deepEqual(state[k], fixture[k], `changed legacy field ${k}`);
    await page.keyboard.press('KeyC'); assert.notEqual(await page.evaluate(() => RB.game.mode()), 'world'); await page.keyboard.press('Escape'); await checkLive();
  });
  await test('Continue from title restores a visible world', async () => { await spyWorld(); await load('continue'); await checkWorldVisible(); await checkLive(); });
  await test('Load autosave restores a visible world', async () => {
    await page.evaluate(async (s) => { await RB.save.writeRecovery(1, s, 'auto', null); }, fixture); await spyWorld(); await load('auto'); await checkWorldVisible(); await checkLive();
  });
  await test('Load pre-departure recovery restores a visible world', async () => {
    await page.evaluate(async (s) => { await RB.save.writeRecovery(1, s, 'predeparture', null); }, fixture); await spyWorld(); await load('predeparture'); await checkWorldVisible(); await checkLive();
  });
  await test('Repeated title -> load -> run cycles keep rendering and stay responsive', async () => {
    for (let i = 0; i < 3; i++) {
      await spyWorld(); await load(); await checkWorldVisible(); await page.keyboard.press('ShiftLeft'); await checkLive();
      if (i < 2) { await page.evaluate(() => RB.game.toTitle()); await page.waitForTimeout(250); titleSample = await sampleCanvas(); }
    }
  });
  await test('New Game through real UI still enters a visible controllable world', async () => {
    await page.locator('.title [data-a="new"]').click(); await page.locator('[data-slot="2"] [data-a="start"]').click();
    await page.locator('[data-a="skip"]').click(); await page.locator('#nm').fill('Regression hero');
    for (let i = 0; i < 3; i++) await page.locator('[data-a="next"]').click(); // four creation steps
    await page.locator('[data-k="profile"][data-v="E"]').click();
    await page.locator('[data-k="input"][data-v="choice"]').click(); await page.locator('[data-a="go"]').click();
    for (let n = 0; n < 60; n++) { if (await page.evaluate(() => RB.game.mode() === 'world')) break; await page.keyboard.press('Enter'); await page.waitForTimeout(100); }
    assert.equal(await page.evaluate(() => RB.game.mode()), 'world'); await spyWorld(); await checkWorldVisible(); await page.keyboard.press('ShiftLeft'); await checkLive();
  }, { seed: false });
  await test('New campaign API clears a prior title override itself', async () => {
    await page.evaluate(async () => { RB.ui.title.hide(); const s = RB.state.newCampaign({ profile: 'E' }); RB.game.settings.textSpeed = 'instant'; await RB.game.startNewCampaign(2, s); });
    for (let n = 0; n < 60; n++) { if (await page.evaluate(() => RB.game.mode() === 'world')) break; await page.keyboard.press('Enter'); await page.waitForTimeout(100); }
    await spyWorld(); await checkWorldVisible(); await checkLive();
  });
  if (!inline) {
    await test('Actual page reload preserves a saved campaign and loads visibly', async () => {
      await load(); await page.evaluate(() => RB.save.manualSave(1)); await page.reload(); await page.waitForFunction(() => window.__RB_READY__ === true);
      await page.waitForTimeout(250); titleSample = await sampleCanvas();
      await spyWorld(); await load(); await checkWorldVisible(); await checkLive();
    });
    await test('Reload and load leave other existing campaigns untouched', async () => {
      // a second, different campaign in slot 3 must survive reloads and loading slot 1
      const other = Object.assign(JSON.parse(JSON.stringify(fixture)), { id: 'other-slot-3', map: 'rw.village', x: 22, y: 30, flags: { rw_arrived: true, rw_met_tsuru: true } });
      other.player.name = 'Other campaign';
      await page.evaluate(async (s) => { await RB.save.writeSlot(3, s, { force: true }); }, other);
      const before = await page.evaluate(async () => { const r = await RB.save.read(3, 'manual'); return JSON.stringify({ id: r.state.id, name: r.state.player.name, map: r.state.map, flags: r.state.flags }); });
      await page.reload(); await page.waitForFunction(() => window.__RB_READY__ === true);
      await page.waitForTimeout(250); titleSample = await sampleCanvas();
      await spyWorld(); await load(); await checkWorldVisible(); await page.keyboard.press('ShiftLeft'); await checkLive();
      const after = await page.evaluate(async () => {
        const list = await RB.save.list();
        const r = await RB.save.read(3, 'manual');
        const one = await RB.save.read(1, 'manual');
        return { slots: list.filter((x) => x && !x.empty).length, s3: JSON.stringify({ id: r.state.id, name: r.state.player.name, map: r.state.map, flags: r.state.flags }), s1name: one.state.player.name };
      });
      assert.equal(after.s3, before, 'slot 3 changed after reload + loading slot 1');
      assert.equal(after.s1name, fixture.player.name, 'slot 1 campaign lost');
      assert(after.slots >= 2, 'expected at least two saved slots, got ' + after.slots);
    });
  }
} finally { await browser.close(); if (srv) srv.close(); }
const report = {
  htmlPath: path.relative(root, htmlPath) || htmlPath, mode, browserVersion: browser.version(), tests: results,
  passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).length,
  storageModes: [...new Set(results.map((r) => r.storageMode).filter(Boolean))],
  limitations: inline ? ['Inline execution uses session-only storage: not a persistence test.'] : [],
};
const reportPath = opt('--report', path.join(root, 'tests/e2e/out', 'shift-load-results-' + mode + '.json'));
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(`${report.passed}/${results.length} passed (${mode}; storage: ${report.storageModes.join(', ')}); report ${path.relative(root, reportPath)}`);
if (report.failed) process.exitCode = 1;
