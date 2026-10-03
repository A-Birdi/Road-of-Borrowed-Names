// Lines said in the dark, and the wait at the tide-watcher's window (the owner's report of 2026-10-03),
// in the BUILT game, headless Chromium, synthetic campaigns in fresh contexts (never a player's save):
// - while a scene has the screen faded to black (`!fade out` … `!fade in`), the line said in the dark is
//   shown above the black: the dialogue sheet is the element on top at its own centre, its Next button
//   takes a real click, History (L) opens above the black too; once the screen has cleared, nothing is
//   left raised;
// - choosing "We'll wait here" with Shiori (Chapter 2) shows the wait as a picture — the view from her
//   window — instead of a black screen: the tide goes out over the lines (the sand road comes up from both
//   ends, then all of it), Shiori says it is time, the road lies dry from the point to the island, a fog
//   gathers on the road and only there; then the room again, with the quest moved on as before;
// - the picture keeps the island, the road and the lighthouse above the dialogue sheet, on a desktop, the
//   owner's window size and a phone held either way; with reduced motion each stage is one still picture;
// - an interlude a scene leaves showing is cleared when the scene ends;
// - no console errors, no network requests.
// Usage: node tests/e2e/interludes.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = { ch1_done: true, departed: true };

// the element on top at the centre of the dialogue text, and the fade's state
const onTop = (p) => p.evaluate(() => {
  const box = document.querySelector('#ui > .dlg'), fade = document.querySelector('#overlay > .fade');
  const txt = box && box.querySelector('.txt');
  if (!txt || box.classList.contains('hidden')) return { shown: false };
  const r = txt.getBoundingClientRect(), el = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 20));
  return { shown: true, top: !!(el && el.closest('.dlg')), dark: fade.classList.contains('on') && +getComputedStyle(fade).opacity > 0.95, text: txt.innerText.split('\n')[0], veiled: document.body.classList.contains('veiled') };
});
const lineIs = (p, re) => p.waitForFunction((src) => { const t = document.querySelector('#ui > .dlg:not(.hidden) .txt'); return !!t && new RegExp(src).test(t.innerText); }, re, { timeout: 8000 }).then(() => true, () => false);

// ---- 1. a line in the dark is readable, clickable, and History opens over it ----------------------
for (const [W, H] of [[1280, 800], [390, 844]]) {
  const { p, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  await p.evaluate(async () => {
    RB.game.debugStart('sg.tidehut', 4, 5, { comp: 'mio', dir: 'up', flags: { ch1_done: true, departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.script.add('@scene test.dark\nnarr: まえ || Before the dark.\n!fade out\nnarr: くらい || Said in the dark.\nnarr: まだ || Still dark.\n!fade in\nnarr: あと || After the dark.\n', 'test');
    await new Promise((r) => setTimeout(r, 200));
    RB.script.run('test.dark');
  });
  await lineIs(p, 'Before the dark');
  await p.keyboard.press('z');
  const inDark = await lineIs(p, 'Said in the dark');
  await p.waitForTimeout(600);
  const a = await onTop(p);
  ok(inDark && a.shown && a.dark && a.top, `${W}×${H}: the line said in the dark is on top of the black (shown ${a.shown}, dark ${a.dark}, sheet on top ${a.top})`);
  // History over the black
  await p.keyboard.press('l');
  await p.waitForTimeout(500);
  const hist = await p.evaluate(() => {
    const s = document.querySelector('#ui > .folio-scrim'); if (!s) return { open: false };
    const r = s.querySelector('.folio').getBoundingClientRect(), el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { open: true, top: !!(el && el.closest('.folio-scrim')), said: s.innerText.includes('Said in the dark') };
  });
  ok(hist.open && hist.top && hist.said, `${W}×${H}: History opened in the dark is on top and has the line (open ${hist.open}, on top ${hist.top})`);
  // Escape steps back through History's pages and then closes it
  for (let i = 0; i < 4 && (await p.evaluate(() => !!document.querySelector('#ui > .folio-scrim'))); i++) { await p.keyboard.press('Escape'); await p.waitForTimeout(350); }
  // the Next button takes a real click
  const nb = await p.evaluate(() => { const r = document.querySelector('#ui > .dlg .b-next').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.mouse.click(nb[0], nb[1]);
  const still = await lineIs(p, 'Still dark');
  const c = await onTop(p);
  ok(still && c.dark && c.top, `${W}×${H}: a real click on Next moves on to the next line, still readable in the dark`);
  await p.keyboard.press('z');
  const after = await lineIs(p, 'After the dark');
  await p.waitForTimeout(700);
  const d = await onTop(p);
  ok(after && !d.dark && !d.veiled, `${W}×${H}: after the fade-in the room is back and nothing is left raised (veiled ${d.veiled})`);
  ok(!errors.length && !requests.length, `${W}×${H}: no console errors (${errors.length}) and no network requests (${requests.length})`);
  await p.close();
}

// ---- 2. the tide wait --------------------------------------------------------------------------------
async function tideScene(p, o) {
  await p.evaluate(async (o) => {
    RB.game.debugStart('sg.tidehut', 4, 4, { comp: o.comp, dir: 'up', flags: { ch1_done: true, departed: true } });
    RB.game.s.quests.sg_main = { stage: 5 };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 300));
    RB.world.refreshActors();
    window.__sceneDone = false;
    // the real conversation: talk to Shiori (she teaches the tide table first), then choose to wait
    RB.game.s.flags.sg_tide_read = true;
    RB.script.run('sg.shiori_tide', { npc: 'shiori' }).then(() => { window.__sceneDone = true; });
  }, o);
}
// the world canvas as a fingerprint and a count of colours (a picture, not a flat screen)
const picture = (p) => p.evaluate(() => {
  const cv = document.getElementById('world'), g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  g.canvas.width = 200; g.canvas.height = 120; g.drawImage(cv, 0, 0, 200, 120);
  const d = g.getImageData(0, 0, 200, 120).data, cols = new Set(); let h = 0;
  for (let i = 0; i < d.length; i += 4) { cols.add((d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3)); h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0; }
  return { cols: cols.size, h };
});
const istate = (p) => p.evaluate(() => ({ st: RB.interlude.state(), world: RB.render.worldVisible(), map: RB.world.W.map && RB.world.W.map.id }));
// the picture drawn into a canvas of a known size, for pixel checks (same code as on screen)
const probeArt = (p, W, H, VB) => p.evaluate(([W, H, VB]) => {
  const A = RB.interlude.ART.tide_wait, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true });
  const st = RB.interlude.state();
  A.draw(c, W, H, performance.now(), { stage: st.stage, since: st.since, vb: VB, still: RB.game.reducedMotion() });
  const pr = A.probe(W, H, VB), px = (x, y) => Array.from(c.getImageData(Math.round(x), Math.round(y), 1, 1).data.slice(0, 3));
  const mid = { x: (pr.tip.x + pr.end.x) / 2, y: (pr.tip.y + pr.end.y) / 2 };
  // a column of open water to the right of the road, between it and the glass
  const sea = px(pr.glassX - 30, (pr.yH + pr.yS) / 2);
  return { pr, mid: px(mid.x, mid.y - 1), sea, nearTip: px(pr.tip.x + (pr.end.x - pr.tip.x) * 0.12, pr.tip.y + (pr.end.y - pr.tip.y) * 0.12) };
}, [W, H, VB]);
const isSand = (c) => c[0] > 170 && c[1] > 160 && c[0] >= c[2] + 8;
const isWater = (c) => c[2] > c[0] + 20;
const isFog = (c) => c[0] > 200 && c[1] > 205 && c[2] > 215 && Math.abs(c[0] - c[2]) < 30;

for (const [W, H, comp] of [[1280, 800, 'suzu'], [2000, 1090, 'mio'], [390, 844, 'ren'], [844, 390, 'nao']]) {
  const tag = `${W}×${H}`;
  const { p, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  await tideScene(p, { comp });
  // Shiori asks; choose to wait with a real key press on the first reply
  const asked = await p.waitForFunction(() => !!document.querySelector('#ui > .choices:not(.hidden) .choice'), null, { timeout: 8000 }).then(() => true, () => false);
  ok(asked, `${tag}: Shiori asks whether we will wait`);
  // the reply "We'll wait here", focused and chosen with a real key press
  await p.evaluate(() => { const c = [...document.querySelectorAll('#ui > .choices .choice')].find((e) => /wait here/.test(e.innerText)); c.focus(); });
  await p.keyboard.press('Enter');
  const first = await lineIs(p, 'drinking the weak tea');
  await p.waitForTimeout(900);
  const s1 = await istate(p), a1 = await onTop(p), pic1 = await picture(p);
  ok(first && s1.st && s1.st.stage === 'wait' && !s1.world, `${tag}: the wait is a picture, not the map (interlude ${JSON.stringify(s1.st)})`);
  ok(a1.shown && a1.top && !a1.dark, `${tag}: the first line is shown over it, not over a black screen (dark ${a1.dark})`);
  ok(pic1.cols >= 40, `${tag}: it is a picture (${pic1.cols} colours in a 200×120 sample)`);
  // the picture's layout above the sheet: measure where the sheet's top is and probe the art at that size
  const geo = await p.evaluate(() => { const cv = document.getElementById('world'), a = cv.getBoundingClientRect(), b2 = document.querySelector('#ui > .dlg').getBoundingClientRect(); return { top: (b2.top - a.top) / a.height, cw: cv.width, ch: cv.height }; });
  const PW = 640, PH = Math.round(640 * H / W), VB = Math.floor(geo.top * 25) / 25 * PH;
  const e1 = await probeArt(p, PW, PH, VB);
  ok(e1.pr.yS < VB && e1.pr.tip.y < VB && e1.pr.end.y < VB, `${tag}: the sill, the point's tip and the island stand above the dialogue sheet (sill row ${e1.pr.yS} < ${Math.round(VB)})`);
  ok(e1.pr.roadDry < 0.15 && isWater(e1.sea), `${tag}: at first the road is under water (${(e1.pr.roadDry * 100).toFixed(0)} % dry)`);
  // the tide goes out while the line stays up
  await p.waitForTimeout(9000);
  const e2 = await probeArt(p, PW, PH, VB), pic2 = await picture(p);
  ok(e2.pr.q > e1.pr.q && e2.pr.roadDry > e1.pr.roadDry && e2.pr.roadDry < 0.9, `${tag}: the tide goes out over the line (level ${e1.pr.q} → ${e2.pr.q} of 48; road dry ${(e1.pr.roadDry * 100).toFixed(0)} → ${(e2.pr.roadDry * 100).toFixed(0)} %)`);
  ok(isSand(e2.nearTip), `${tag}: the road has come up from the point (sand by the tip: ${e2.nearTip})`);
  ok(pic2.h !== pic1.h, `${tag}: the picture on screen changed with it`);
  // on to Shiori's "It's time" (past the companion's line)
  for (let i = 0; i < 3 && !(await p.evaluate(() => /It's time/.test((document.querySelector('#ui > .dlg .txt') || {}).innerText || ''))); i++) { await p.keyboard.press('z'); await p.waitForTimeout(250); }
  const time = await lineIs(p, "It's time");
  await p.waitForTimeout(2800);
  const s3 = await istate(p), e3 = await probeArt(p, PW, PH, VB);
  ok(time && s3.st && s3.st.stage === 'road', `${tag}: Shiori says it is time over the window (stage ${s3.st && s3.st.stage})`);
  ok(e3.pr.roadDry > 0.85 && isSand(e3.mid) && isWater(e3.sea), `${tag}: the white sand road lies dry from the point to the island (its crown ${(e3.pr.roadDry * 100).toFixed(0)} % dry; its middle ${e3.mid}; the sea beside it ${e3.sea})`);
  await p.keyboard.press('z');
  await lineIs(p, 'white sand road');
  await p.keyboard.press('z');
  const fogLine = await lineIs(p, 'thick white fog');
  await p.waitForTimeout(3200);
  const s4 = await istate(p), e4 = await probeArt(p, PW, PH, VB);
  ok(fogLine && s4.st && s4.st.stage === 'fog' && isFog(e4.mid) && isWater(e4.sea), `${tag}: a fog sits on the road and only there (the road's middle ${e4.mid}; the sea beside it ${e4.sea})`);
  await p.keyboard.press('z');
  const worry = await lineIs(p, 'Windless fog');
  await p.waitForTimeout(500);
  const s5 = await istate(p), a5 = await onTop(p);
  ok(worry && !s5.st && s5.world && s5.map === 'sg.tidehut' && !a5.dark, `${tag}: then the room again for Shiori's worry (interlude ${JSON.stringify(s5.st)}, map ${s5.map})`);
  for (let i = 0; i < 8 && !(await p.evaluate(() => window.__sceneDone)); i++) { await p.keyboard.press('z'); await p.waitForTimeout(300); }
  const st5 = await p.evaluate(() => ({ done: window.__sceneDone, q: RB.game.s.quests.sg_main && RB.game.s.quests.sg_main.stage, low: !!RB.game.s.flags.sg_tide_low }));
  ok(st5.done && st5.q === 6 && st5.low, `${tag}: the scene ends and the quest moves on as before (sg_main ${st5.q}, tide low ${st5.low})`);
  ok(!errors.length && !requests.length, `${tag}: no console errors (${errors.length}${errors.length ? ': ' + errors[0] : ''}) and no network requests (${requests.length})`);
  await p.close();
}

// ---- 3. reduced motion: each stage is one still picture ----------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await tideScene(p, { comp: 'mio', reduce: true });
  await p.waitForFunction(() => !!document.querySelector('#ui > .choices:not(.hidden) .choice'), null, { timeout: 8000 });
  await p.evaluate(() => { const c = [...document.querySelectorAll('#ui > .choices .choice')].find((e) => /wait here/.test(e.innerText)); c.focus(); });
  await p.keyboard.press('Enter');
  await lineIs(p, 'drinking the weak tea');
  await p.waitForTimeout(700);
  const a = await picture(p); await p.waitForTimeout(1500); const bb = await picture(p);
  const L1 = await p.evaluate(() => RB.interlude.ART.tide_wait.probe(640, 400, 300).L);
  ok(a.h === bb.h, `reduced motion: the wait holds one picture (${a.h === bb.h ? 'same' : 'changed'} after 1.5 s; tide level ${L1})`);
  for (let i = 0; i < 3 && !(await p.evaluate(() => /It's time/.test((document.querySelector('#ui > .dlg .txt') || {}).innerText || ''))); i++) { await p.keyboard.press('z'); await p.waitForTimeout(250); }
  await p.waitForTimeout(200);
  const L2 = await p.evaluate(() => RB.interlude.ART.tide_wait.probe(640, 400, 300).L);
  ok(L1 === 0.55 && L2 === 1, `reduced motion: the tide steps (${L1} while waiting, ${L2} at once when it is time)`);
  ok(!errors.length, 'reduced motion: no console errors');
  await p.close();
}

// ---- 4. an interlude a scene leaves showing ends with the scene; the cost of a frame -------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(async () => {
    RB.game.debugStart('sg.tidehut', 4, 5, { comp: 'mio', dir: 'up', flags: { ch1_done: true, departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.script.add('@scene test.left\n!interlude tide_wait road\nnarr: うみ || The sea.\n', 'test');
    const done = RB.script.run('test.left');
    await new Promise((r) => setTimeout(r, 300));
    const during = RB.interlude.state();
    RB.ui.dialogue.advance(true);
    await done;
    await new Promise((r) => setTimeout(r, 100));
    // the cost of drawing it: the first frame builds its layers, later ones reuse them
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 400; const c = cv.getContext('2d');
    RB.interlude.show('tide_wait', 'wait');
    const A = RB.interlude.ART.tide_wait, t0 = performance.now();
    A.draw(c, 640, 400, 0, { stage: 'wait', since: 0, vb: 300, still: false });
    const first = performance.now() - t0, times = [];
    for (let i = 0; i < 30; i++) { const t1 = performance.now(); A.draw(c, 640, 400, i * 16, { stage: 'fog', since: 4000, vb: 300, still: false }); times.push(performance.now() - t1); }
    RB.interlude.clear();
    times.sort((a, b) => a - b);
    return { during, after: RB.interlude.state(), world: RB.render.worldVisible(), first: Math.round(first), median: +times[15].toFixed(1), worst: +times[29].toFixed(1) };
  });
  ok(r.during && r.during.stage === 'road' && !r.after && r.world, `a picture left showing is cleared when its scene ends (during ${JSON.stringify(r.during)}, after ${JSON.stringify(r.after)}, map shown ${r.world})`);
  ok(r.median < 12, `a frame of the picture costs ${r.median} ms (median of 30; worst ${r.worst}; the first, building its layers, ${r.first} ms)`);
  ok(!errors.length, 'no console errors');
  await p.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
