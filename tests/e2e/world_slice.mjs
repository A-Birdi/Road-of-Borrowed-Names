// The Reedwake slice of the world proof, assembled (expansion P01, W04; docs/future/work/P01_WORLD.md "W04"):
// the village under the proof with a doorway, water, vegetation, lights, two purposeful actions, conversation and
// the customizable player, and one real battle begun there (Suzu and an existing creature, the Reedling) through
// the language UI, the action banner and the Harmony cut-in, back to the far view afterwards. Synthetic sessions
// only (never a real save). Checks and evidence in one run:
//   battle     the battle from the square: graded backdrop (the proof) and the game's own for comparison; the
//              decision, the challenge, the cut-in, the banner; the far view and the proof restored afterwards
//   doorway    into the teahouse (the near view behind the fade) and out again (the far view)
//   player     two looks of the customizable player in the slice (light skin, fitted; deep skin, wide sleeves)
//   overlay    the structural overlay: collisions, exits, things to use, people, the kit's low growth and tall pieces
//   measure    start-up to a controllable scene, the first frame of the village, steady frames, heap and layers
//   record     normal-speed recordings (WebM): the square to the pier, Tomo folding, the doorway, the battle
//   saltglass  W05: the player's looks in the harbour (light and deep skin, fitted and wide sleeves, accessories) at
//              desktop and phone sizes; the crowded battle fixture (three Crabs on the quay) at desktop and phone, with
//              the harbour's grade on the backdrop; a recording of the harbour with Kiyo at work   → .../world/w05/
// Usage: node tests/e2e/world_slice.mjs [section ...]   (default: every section except record)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const doing = (s) => (args.length ? args.includes(s) : s !== 'record');
const D = 'docs/screenshots/world/w04';
fs.mkdirSync(path.join(root, D), { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const written = [];
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 180s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
async function webp(p, png, file, scale = 1) {
  const data = await p.evaluate(async ({ b64, scale }) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth * scale; c.height = i.naturalHeight * scale;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(i, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.9);
  }, { b64: png.toString('base64'), scale });
  fs.writeFileSync(path.join(root, D, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(path.join(D, file));
}
// the dev panel is not part of the picture (it opens a moment after the game is ready)
async function hidePanel(p) {
  await p.waitForSelector('#wl-dev', { timeout: 5000 }).catch(() => null);
  await p.addStyleTag({ content: '#wl-dev{display:none!important}' });
}
const tiles = (p) => p.evaluate(() => { const v = RB.render.viewSize(); return +(v.w / 16).toFixed(1); });
async function settledCam(p) {
  let last = '';
  for (let i = 0; i < 40; i++) { const c = await p.evaluate(() => RB.render.cam.x + ',' + RB.render.cam.y); if (c === last) return; last = c; await wait(p, 150); }
}

// ---- the battle --------------------------------------------------------------------------------------------
async function startSliceBattle(p, o = {}) {
  o = Object.assign({ map: 'rw.village', x: 25, y: 19, enemy: 'rw.reedling', flags: { departed: true } }, o);
  await p.evaluate((o) => {
    const L = RB.combatLogic;
    if (!L.__wl) { const init = L.init; L.init = function (...a) { const st = init.apply(this, a); st.harmony = st.harmonyMax; return st; }; L.__wl = true; }
    const run = RB.challenge.runStep;
    if (!RB.challenge.__wl) { RB.challenge.runStep = (step, x) => { window.__lastStep = step; return run(step, x); }; RB.challenge.__wl = true; }
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'suzu', flags: o.flags });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.difficulty || 'normal';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    if (o.look) s.player.look = o.look;
    Object.assign(RB.game.settings, { input: 'choice', textSpeed: 'normal', battleAnim: 'normal', reducedMotion: false, battleControls: 'adaptive', intentDisplay: 'adaptive', harmonyFlourish: true });
    RB.game.applySettings();
    window.__result = null;
    RB.game.startBattle(o.enemy, Object.assign({ where: { map: o.map, x: o.x, y: o.y }, foeKey: 'wl:' + Date.now() }, o.group ? { group: o.group } : {})).then((r) => { window.__result = r || 'done'; });
  }, o);
}
async function toCards(p) {
  for (let i = 0; i < 800; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
    if (s.cards || s.r) return s;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 25);
  }
  throw new Error('no decision came');
}
async function clickCard(p, re) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  assert(i != null, 'no card matching ' + re);
  await p.mouse.move(2, 2);
  await wait(p, 260);
  const q = '.rcard[data-i="' + i + '"]';
  const c = await p.evaluate((q) => { const el = document.querySelector(q); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(), x = r.left + r.width / 2; for (let y = Math.max(r.top, 0) + 6; y < Math.min(r.bottom, innerHeight); y += 6) { const top = document.elementFromPoint(x, y); if (top && top.closest(q)) return { x, y }; } return null; }, q);
  assert(c, 'the card ' + re + ' is covered');
  await wait(p, 120);
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal', { timeout: 10000 });
}
async function answerRight(p, shot) {
  await p.waitForSelector('.chal .mc .btn', { timeout: 10000 });
  await p.mouse.move(2, 2);
  if (shot) await shot();
  const idx = await p.evaluate(() => {
    const st = window.__lastStep, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    const k = bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))));
    if (k >= 0) { bs[k].setAttribute('data-right', '1'); bs[k].scrollIntoView({ block: 'center' }); }
    return k;
  });
  assert(idx >= 0, 'the right option is on screen');
  await p.click('.chal .mc .btn[data-right="1"]');
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
  await p.evaluate(() => document.querySelector('.fbwrap .fb-go').scrollIntoView({ block: 'center' }));
  await p.click('.fbwrap .fb-go');
}
async function companionPick(p, re) {
  await p.waitForSelector('.ccard', { timeout: 8000 });
  await p.mouse.move(2, 2);
  await wait(p, 300);
  const a = await p.evaluate((m) => { const c = [...document.querySelectorAll('.ccard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent)); if (!c) return null; c.setAttribute('data-pick', '1'); c.scrollIntoView({ block: 'center' }); return c.textContent.replace(/\s+/g, ' ').trim().slice(0, 60); }, re);
  assert(a, 'no companion choice matching ' + re);
  await p.click('.ccard[data-pick="1"]');
}
// the exchange plays out; shots of the cut-in at its hold and of the action banner, once each
async function playOut(p, shots) {
  const seen = { cutin: false, banner: false };
  for (let i = 0; i < 2400; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase && RB.combat.phase(), cut: RB.harmonyCutin.state().state, banner: RB.battleBanner.state().visible, mode: RB.game.mode() }));
    if (!seen.cutin && s.cut === 'holding') { seen.cutin = true; if (shots) await shots.cutin(); }
    if (!seen.banner && s.banner) { seen.banner = true; if (shots) await shots.banner(); }
    if (s.r && s.mode === 'world') return seen;
    if (!s.r && !s.busy && s.cards && s.ph === 'choose') return seen;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 20);
  }
  throw new Error('the exchange did not finish');
}

if (doing('battle')) {
  await test('the slice battle: Suzu and a Reedling from the square, the language UI, the cut-in and the banner; the backdrop takes the slice\'s light; the game\'s own framing in battle; the far view and the proof afterwards', async () => {
    // the game's own battle start, for comparison
    {
      const { p, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
      await startSliceBattle(p);
      await toCards(p);
      await wait(p, 400);
      await webp(p, await p.screenshot(), 'battle_start_game.webp');
      await ctx.close();
    }
    const { p, ctx, errors, requests } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
    await hidePanel(p);
    await startSliceBattle(p);
    await toCards(p);
    await wait(p, 400);
    assert(await tiles(p) === 22.5, 'a battle keeps the game\'s own framing under the proof (22.5 tiles at 1440), not the far view: ' + await tiles(p));
    await webp(p, await p.screenshot(), 'battle_start_proof.webp');
    // the grade lies on the backdrop: with the proof's light off the same moment draws differently
    const graded = await p.evaluate(() => { const cv = document.querySelector('canvas'), g = cv.getContext('2d'); const a = g.getImageData(0, 0, 200, 120).data; RB.worldLook.set({ light: false }); RB.render.frame(performance.now()); const b2 = g.getImageData(0, 0, 200, 120).data; RB.worldLook.set({ light: true }); let d = 0; for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b2[i]) + Math.abs(a[i + 2] - b2[i + 2]); return d / (a.length / 4); });
    assert(graded > 1, 'the backdrop should take the slice\'s light: mean difference ' + graded.toFixed(2));
    await clickCard(p, 'With Suzu');
    await answerRight(p, async () => { await wait(p, 250); await webp(p, await p.screenshot(), 'battle_language.webp'); });
    await companionPick(p, 'Join');
    const seen = await playOut(p, {
      cutin: async () => webp(p, await p.screenshot(), 'battle_cutin.webp'),
      banner: async () => webp(p, await p.screenshot(), 'battle_banner.webp'),
    });
    assert(seen.cutin, 'the Harmony cut-in should have played');
    assert(seen.banner, 'the action banner should have shown');
    // finish the encounter if the technique didn't (respond until it ends)
    for (let k = 0; k < 6 && !(await p.evaluate(() => window.__result)); k++) {
      await clickCard(p, '.');
      await answerRight(p);
      const cc = await p.$('.ccard');
      if (cc) await companionPick(p, '.');
      await playOut(p, null);
    }
    await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 20000 });
    await settledCam(p);
    await wait(p, 400);
    const after = await p.evaluate(() => ({ active: RB.worldLook.active(RB.world.W.map), map: RB.world.W.map.id }));
    assert(after.active && after.map === 'rw.village', 'the proof after the battle: ' + JSON.stringify(after));
    assert(await tiles(p) === 45, 'the far view after the battle');
    await webp(p, await p.screenshot(), 'after_battle.webp');
    assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
    await ctx.close();
  });
}

if (doing('doorway')) {
  await test('the doorway: into the teahouse (the near view, behind the fade) and back out (the far view)', async () => {
    const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
    await hidePanel(p);
    await p.evaluate(() => { RB.game.debugStart('rw.village', 30, 17, { comp: 'suzu', flags: { departed: true }, dir: 'up' }); });
    await settledCam(p);
    assert(await tiles(p) === 45, 'far view outside');
    await webp(p, await p.screenshot({ clip: { x: 520, y: 180, width: 400, height: 300 } }), 'doorway_1_outside.webp', 2);
    // walk up to the door (30, 15) and through it
    await p.keyboard.down('ArrowUp'); await wait(p, 900); await p.keyboard.up('ArrowUp');
    await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'rw.tea', null, { timeout: 8000 });
    await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 8000 });
    await settledCam(p);
    await wait(p, 300);
    assert(await tiles(p) === 22.5, 'the near view inside');
    await webp(p, await p.screenshot(), 'doorway_2_inside.webp');
    await p.keyboard.down('ArrowDown'); await wait(p, 1600); await p.keyboard.up('ArrowDown');
    await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'rw.village', null, { timeout: 8000 });
    // (coming back in for the first time plays the village's first-visit scene: read through it)
    for (let i = 0; i < 400 && (await p.evaluate(() => RB.game.mode() !== 'world')); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await wait(p, 40); }
    await settledCam(p);
    await wait(p, 300);
    assert(await tiles(p) === 45, 'the far view outside again');
    await webp(p, await p.screenshot({ clip: { x: 520, y: 180, width: 400, height: 300 } }), 'doorway_3_out_again.webp', 2);
    assert(!errors.length, 'errors: ' + errors.join('; '));
    await ctx.close();
  });
}

if (doing('player')) {
  await test('the customizable player in the slice: two looks, lit and shaded with the scene', async () => {
    const LOOKS = [
      ['light_fitted', { skin: 0, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'tunic', acc: ['glasses'] }],
      ['deep_wide', { skin: 5, hair: 'short', hairColor: 1, outfit: 4, shape: 'robe', acc: ['flower'] }],
    ];
    for (const [tag, look] of LOOKS) {
      const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
      await hidePanel(p);
      // beside the teahouse, half in its shade and half in sun, Suzu alongside
      await p.evaluate((look) => { const s = RB.game.debugStart('rw.village', 33, 15, { comp: 'suzu', flags: { departed: true } }); s.player.look = Object.assign({}, s.player.look, look); RB.world.enter('rw.village', 33, 15, 'down'); }, look);
      await settledCam(p);
      await wait(p, 500);
      const c = await p.evaluate(() => RB.render.tileToCss(33, 15));
      await webp(p, await p.screenshot({ clip: { x: Math.round(c.x - 90), y: Math.round(c.y - 80), width: 200, height: 140 } }), 'player_' + tag + '.webp', 3);
      const shade = await p.evaluate(() => RB.worldLook.shadeAt(RB.world.W.map, RB.world.W.player));
      assert(shade > 0, tag + ': the player beside the teahouse should stand in its shade (' + shade + ')');
      assert(!errors.length, 'errors: ' + errors.join('; '));
      await ctx.close();
    }
  });
}

if (doing('overlay')) {
  await test('the structural overlay: collisions, exits, things to use, people, low growth and tall pieces over the proof', async () => {
    const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
    await hidePanel(p);
    await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 18, { comp: 'suzu', flags: { departed: true } }); });
    await settledCam(p);
    await wait(p, 600);
    const n = await p.evaluate(() => {
      const m = RB.world.W.map, k = RB.render.viewSize().scale * 16;
      const cv = document.createElement('canvas'); cv.id = 'wl-overlay'; cv.width = innerWidth; cv.height = innerHeight;
      cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:99998';
      document.body.appendChild(cv);
      const g = cv.getContext('2d'), at = (x, y) => RB.render.tileToCss(x, y);
      let blocked = 0;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (RB.maps.blockedStatic(m, x, y)) { blocked++; const a = at(x, y); g.fillStyle = 'rgba(220,40,40,0.28)'; g.fillRect(a.x, a.y, k, k); }
      g.lineWidth = 2;
      for (const e of (m.def.exits || []).concat(m.exits || [])) { const a = at(e.x, e.y); g.strokeStyle = 'rgba(40,120,255,0.95)'; g.strokeRect(a.x + 1, a.y + 1, (e.w || 1) * k - 2, (e.h || 1) * k - 2); }
      for (const q of m.props) if (q.scene || q.text) { const a = at(q.x, q.y); g.strokeStyle = 'rgba(255,210,40,0.95)'; g.strokeRect(a.x + 2, a.y + 2, k - 4, k - 4); }
      for (const s of RB.worldKit.shrubs(m)) { const a = at(s.x, s.y); g.strokeStyle = 'rgba(80,230,90,0.9)'; g.setLineDash([3, 2]); g.strokeRect(a.x + 3, a.y + 3, k - 6, k - 6); g.setLineDash([]); }
      for (const q of m.props) if (q.p === 'reeds') { const a = at(q.x, q.y); g.fillStyle = 'rgba(40,220,230,0.5)'; g.fillRect(a.x + k / 2 - 2, a.y + k / 2 - 2, 4, 4); }
      for (const a0 of RB.world.W.npcs.concat([RB.world.W.player, RB.world.W.comp].filter(Boolean))) { const a = at(a0.fx, a0.fy); g.fillStyle = 'rgba(240,60,220,0.95)'; g.beginPath(); g.arc(a.x + k / 2, a.y + k / 2, 4, 0, Math.PI * 2); g.fill(); }
      // the legend
      g.fillStyle = 'rgba(20,20,30,0.82)'; g.fillRect(10, innerHeight - 118, 330, 108);
      g.font = '13px sans-serif';
      [['rgba(220,40,40,0.9)', 'solid tile (the game\'s collision, unchanged)'], ['rgba(40,120,255,0.95)', 'exit or doorway'], ['rgba(255,210,40,0.95)', 'something to use'], ['rgba(80,230,90,0.9)', 'kit: low growth (walk-through)'], ['rgba(40,220,230,0.9)', 'kit: cattails (on solid reed tiles)'], ['rgba(240,60,220,0.95)', 'a person']].forEach(([c, t], i) => { g.fillStyle = c; g.fillRect(20, innerHeight - 108 + i * 16, 10, 10); g.fillStyle = '#f4f0e6'; g.fillText(t, 38, innerHeight - 99 + i * 16); });
      return blocked;
    });
    await webp(p, await p.screenshot(), 'overlay_structure.webp');
    assert(n > 100, 'the village has solid tiles: ' + n);
    assert(!errors.length, 'errors: ' + errors.join('; '));
    await ctx.close();
  });
}

if (doing('measure')) {
  await test('measurements: start-up, the village\'s first frame, steady frames, heap and layers (recorded, not thresholds)', async () => {
    const rows = [];
    for (const [tag, q, vp, dpr] of [['game 1440×900', '', { width: 1440, height: 900 }, 1], ['proof 1440×900', '?dev=world', { width: 1440, height: 900 }, 1], ['game 375×667 (3×)', '', { width: 375, height: 667 }, 3], ['proof 375×667 (3×)', '?dev=world', { width: 375, height: 667 }, 3]]) {
      const ready = [], first = [], steady = [], heap = [];
      for (let run = 0; run < 3; run++) {
        const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: dpr > 1, hasTouch: dpr > 1 });
        const p = await ctx.newPage();
        const t0 = Date.now();
        await p.goto(url + q);
        await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 20000 });
        ready.push(Date.now() - t0);
        const f = await p.evaluate(() => { const t1 = performance.now(); RB.game.debugStart('rw.village', 22, 18, { comp: 'suzu', flags: { departed: true } }); RB.render.frame(performance.now()); return performance.now() - t1; });
        first.push(f);
        await wait(p, 600);
        steady.push(await p.evaluate(() => { RB.render.frame(4000); const t1 = performance.now(); for (let i = 0; i < 40; i++) RB.render.frame(5000 + i * 16); return (performance.now() - t1) / 40; }));
        const cdp = await ctx.newCDPSession(p);
        await cdp.send('Performance.enable');
        const m = await cdp.send('Performance.getMetrics');
        heap.push((m.metrics.find((x) => x.name === 'JSHeapUsedSize') || {}).value / 1048576);
        await ctx.close();
      }
      const med = (a) => a.slice().sort((x, y) => x - y)[1];
      rows.push({ tag, ready: Math.round(med(ready)), first: Math.round(med(first)), steady: +med(steady).toFixed(1), heapMB: +med(heap).toFixed(1) });
    }
    console.log('  measurements (medians of 3; headless Chromium, software raster):');
    for (const r of rows) console.log('   ', JSON.stringify(r));
    fs.writeFileSync(path.join(root, D, 'measurements.json'), JSON.stringify({ note: 'headless Chromium 1194 (Playwright 1.56.1), software raster; medians of 3 runs; ms and MB', rows }, null, 1) + '\n');
    written.push(path.join(D, 'measurements.json'));
  });
}

if (doing('record')) {
  // normal-speed recordings at 960×540 (the far view: 30 tiles across), each a few seconds
  const rec = async (file, setup, run) => {
    const dir = path.join(root, D, '.rec');
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
    const { p } = await page(b, url + '?dev=world', { context: ctx });
    await hidePanel(p);
    await setup(p);
    await run(p);
    const v = p.video();
    await ctx.close();
    const src = await v.path();
    fs.renameSync(src, path.join(root, D, file));
    fs.rmSync(dir, { recursive: true, force: true });
    written.push(path.join(D, file));
  };
  await test('recordings at normal speed', async () => {
    await rec('rec_square_to_pier.webm', (p) => p.evaluate(() => { RB.game.debugStart('rw.village', 24, 21, { comp: 'suzu', flags: { departed: true } }); }), async (p) => {
      await settledCam(p); await wait(p, 800);
      await p.evaluate(() => RB.world.tapTile(32, 25));
      await wait(p, 14000);
    });
    await rec('rec_tomo_folding.webm', (p) => p.evaluate(() => { RB.game.debugStart('rw.village', 11, 26, { comp: 'suzu', flags: { departed: true } }); }), async (p) => { await settledCam(p); await wait(p, 13000); });
    await rec('rec_doorway.webm', (p) => p.evaluate(() => { const s = RB.game.debugStart('rw.village', 30, 18, { comp: 'suzu', flags: { departed: true }, dir: 'up' }); s.flags['enter:rw.village:rw.village_first'] = true; }), async (p) => {
      await settledCam(p); await wait(p, 900);
      await p.keyboard.down('ArrowUp'); await wait(p, 1300); await p.keyboard.up('ArrowUp');
      await wait(p, 2200);
      await p.keyboard.down('ArrowDown'); await wait(p, 1700); await p.keyboard.up('ArrowDown');
      await wait(p, 2200);
    });
    await rec('rec_battle.webm', (p) => startSliceBattle(p), async (p) => {
      await toCards(p); await wait(p, 900);
      await clickCard(p, 'With Suzu');
      await wait(p, 600);
      await answerRight(p);
      await companionPick(p, 'Join');
      await playOut(p, null);
      await wait(p, 1500);
    });
    for (const f of ['rec_square_to_pier.webm', 'rec_tomo_folding.webm', 'rec_doorway.webm', 'rec_battle.webm']) {
      const kb = Math.round(fs.statSync(path.join(root, D, f)).size / 1024);
      console.log('   ', f, kb + ' KB');
      assert(kb < 6000, f + ' is too large for the repository: ' + kb + ' KB');
    }
  });
}

if (args.includes('saltglass')) {
  const D5 = 'docs/screenshots/world/w05';
  fs.mkdirSync(path.join(root, D5), { recursive: true });
  const save5 = async (p, png, file, scale = 1) => { await webp(p, png, '../w05/' + file, scale); };
  const SG = { departed: true, ch1_done: true, sg_arrived: true };
  await test('W05 the player in the harbour: light and deep skin, fitted and wide sleeves, accessories; desktop and phone', async () => {
    const LOOKS = [
      ['light_fitted_glasses', { skin: 0, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'tunic', acc: ['glasses'] }],
      ['deep_wide_flower', { skin: 5, hair: 'short', hairColor: 1, outfit: 4, shape: 'robe', acc: ['flower'] }],
      ['medium_coat_scarf', { skin: 3, hair: 'long', hairColor: 6, outfit: 1, shape: 'coat', acc: ['scarf'] }],
    ];
    for (const v of [{ tag: 'd1440', viewport: { width: 1440, height: 900 }, dpr: 1, s: 3 }, { tag: 'p375', viewport: { width: 375, height: 667 }, dpr: 3, mobile: true, s: 1 }]) {
      for (const [tag, look] of LOOKS) {
        const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: v.viewport, dpr: v.dpr, mobile: v.mobile, touch: v.mobile });
        await hidePanel(p);
        // on the quay by a lamp post and its banner, Suzu alongside
        await p.evaluate(({ look, SG }) => { const s = RB.game.debugStart('sg.harbor', 25, 25, { comp: 'suzu', flags: SG }); s.player.look = Object.assign({}, s.player.look, look); RB.world.enter('sg.harbor', 25, 25, 'down'); }, { look, SG });
        await settledCam(p);
        await wait(p, 500);
        const c = await p.evaluate(() => RB.render.tileToCss(25, 25));
        const k = await p.evaluate(() => RB.render.viewSize().scale * 16);
        const clip = { x: Math.max(0, Math.round(c.x - k * 3)), y: Math.max(0, Math.round(c.y - k * 2.5)), width: Math.round(k * 7), height: Math.round(k * 4.5) };
        await save5(p, await p.screenshot({ clip }), 'player_' + v.tag + '_' + tag + '.webp', v.s);
        assert(!errors.length, 'errors: ' + errors.join('; '));
        await ctx.close();
      }
    }
  });
  await test('W05 the crowded battle fixture: three Crabs on the quay with Suzu, desktop and phone; the backdrop takes the harbour\'s light', async () => {
    for (const v of [{ tag: 'd1440', viewport: { width: 1440, height: 900 }, dpr: 1 }, { tag: 'p375', viewport: { width: 375, height: 667 }, dpr: 3, mobile: true }]) {
      let gameTiles = null; // a battle keeps the game's own framing under the proof (C-80)
      for (const q of ['', '?dev=world']) {
        const { p, ctx, errors, requests } = await page(b, url + q, { viewport: v.viewport, dpr: v.dpr, mobile: v.mobile, touch: v.mobile });
        if (q) await hidePanel(p);
        await startSliceBattle(p, { map: 'sg.harbor', x: 25, y: 26, enemy: 'sg.crab', group: ['sg.crab', 'sg.crab'], flags: SG, difficulty: 'hard' });
        await toCards(p);
        await wait(p, 500);
        const st = await p.evaluate(() => ({ foes: RB.combat.state().foes.length, cards: document.querySelectorAll('.rcard[data-i]').length }));
        assert(st.foes === 3 && st.cards > 0, 'three creatures and a decision: ' + JSON.stringify(st));
        const t = await tiles(p);
        if (!q) gameTiles = t;
        else assert(t === gameTiles, 'the battle under the proof should keep the game\'s framing: ' + t + ' tiles across, the game ' + gameTiles);
        await save5(p, await p.screenshot(), 'battle_crowded_' + v.tag + (q ? '_proof' : '_game') + '.webp');
        assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
        await ctx.close();
      }
    }
  });
  await test('W05 a recording of the harbour: the market with Kiyo at work, gulls, the quay', async () => {
    const dir = path.join(root, D5, '.rec');
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
    const { p } = await page(b, url + '?dev=world', { context: ctx });
    await hidePanel(p);
    await p.evaluate((SG) => { RB.game.debugStart('sg.harbor', 31, 21, { comp: 'suzu', flags: SG, dir: 'up' }); }, SG);
    await settledCam(p);
    await wait(p, 15000);
    const vid = p.video();
    await ctx.close();
    fs.renameSync(await vid.path(), path.join(root, D5, 'rec_harbour_market.webm'));
    fs.rmSync(dir, { recursive: true, force: true });
    written.push(path.join(D5, 'rec_harbour_market.webm'));
    const kb = Math.round(fs.statSync(path.join(root, D5, 'rec_harbour_market.webm')).size / 1024);
    console.log('    rec_harbour_market.webm', kb + ' KB');
    assert(kb < 6000, 'too large: ' + kb);
  });
}

await b.close();
srv.close();
console.log('wrote ' + written.length + ' files:\n  ' + written.join('\n  '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
