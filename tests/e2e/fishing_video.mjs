// A short screen recording of A Quiet Cast in the built game (not part of the
// default suite): at the Reedwake riverbank with Nao and the cat, the station
// is inspected, Cast is chosen from its scene, and one whole catch is played
// with the mouse — the cast, the wait, the bite, the situation and Yasu's
// note, the answer on the challenge sheet, the line/rod/water action, the
// fish landed, the observation page, the release. Then the harbour with Suzu
// and the tanuki for a second catch (Skip waiting is used there).
// Writes a WebM (Playwright's recorder). Synthetic campaign; no save touched.
// Usage: node tests/e2e/fishing_video.mjs [out.webm]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const out = path.resolve(process.argv[2] || path.join(root, 'docs/screenshots/fishing/fishing_catch.webm'));
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(root, 'tests/e2e/out/fishing_video/raw');
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, recordVideo: { dir, size: { width: 960, height: 570 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
const pause = (ms) => p.waitForTimeout(ms);
async function clickSel(sel) {
  const el = p.locator(sel).first();
  await el.waitFor({ state: 'visible', timeout: 15000 });
  await el.scrollIntoViewIfNeeded();
  const q = await el.boundingBox();
  await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2, { steps: 12 });
  await pause(220);
  await p.mouse.click(q.x + q.width / 2, q.y + q.height / 2);
  await p.mouse.move(6, 6, { steps: 4 });
}
async function start(site, comp, pet) {
  await p.evaluate(({ site, comp, pet }) => {
    const S = RB.fishing.site(site);
    const seen = {};
    for (const m of ['rw.village', 'rw.road', 'sg.harbor']) for (const ev of (RB.content.maps[m].onEnter || [])) seen['enter:' + m + ':' + ev.scene] = true;
    const s = RB.game.debugStart(S.map, S.stand.x, S.stand.y, { dir: S.stand.dir, comp, flags: Object.assign({ postgame: true, rw_echo_done: true, departed: true, rw_arrived: true, rw_mill_open: true }, seen) });
    RB.game.settings.textSpeed = 'normal'; RB.game.settings.input = 'choice';
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    s.company.pets[pet] = { name: 'Koma', reading: 'コマ', look: RB.petArt.LOOK_ORDER[pet][0], met: { t: Date.now(), map: S.map } };
    s.company.pet = pet;
  }, { site, comp, pet });
  await pause(900);
}
async function answer() {
  await p.waitForSelector('.chal');
  await pause(1600); // time to read the task
  const info = await p.evaluate(() => { const a = RB.fishing.st(RB.game.s).active, k = RB.fishing.situation(a.situation).tasks[a.profile]; const pl = (x) => RB.tasks.plain(x).replace(/\s/g, ''); return { kind: k.kind, ok: k.kind === 'choose' ? k.options.filter((x) => x.ok).map((x) => pl(x.jp)) : k.kind === 'write' ? (k.accept || [k.answer]).map(pl) : k.answer.map(pl) }; });
  const txt = '(el) => { const c = el.cloneNode(true); c.querySelectorAll("rt,.enline").forEach((x) => x.remove()); return c.textContent.replace(/\\s/g, ""); }';
  if (info.kind === 'write') await clickSel('.chal [data-mode=choice]');
  if (info.kind === 'order') {
    for (const piece of info.ok) { const i = await p.evaluate(({ piece, txt }) => [...document.querySelectorAll('.chal .tiles .tile')].findIndex((b) => eval(txt)(b) === piece), { piece, txt }); await clickSel('.chal .tiles .tile >> nth=' + i); }
    await clickSel('.chal [data-a=submit]');
  } else {
    const i = await p.evaluate(({ ok, txt }) => [...document.querySelectorAll('.chal .choice')].findIndex((b) => ok.indexOf(eval(txt)(b)) >= 0), { ok: info.ok, txt });
    await clickSel('.chal .choice >> nth=' + i);
  }
  await pause(1300);
  await clickSel('.chal [data-a=continue]');
}
async function catchOne(skip) {
  await clickSel('.fish-panel [data-k=discover]');
  await pause(700);
  await clickSel('.fish-panel [data-k=cast]');
  if (skip) { await pause(900); await clickSel('.fish-panel [data-k=skip]'); }
  await p.waitForSelector('.fish-panel [data-k=take]', { timeout: 9000 });
  await pause(1500);
  await clickSel('.fish-panel [data-k=take]');
  await pause(2600); // reading the situation and the note
  await clickSel('.fish-panel [data-k=answer]');
  await answer();
  await p.waitForSelector('.fish-panel [data-k=release]', { timeout: 12000 });
  await pause(3000); // the observation page stays until dismissed
  await clickSel('.fish-panel [data-k=release]');
  await p.waitForSelector('.fish-panel [data-k=again]', { timeout: 12000 });
  await pause(1500);
}
const T0 = Date.now();
await start('fish.reedwake.current', 'nao', 'cat');
// the station in the world: Look, read the note, choose Cast
await p.keyboard.press('Enter');
for (let i = 0; i < 12; i++) {
  await pause(1300);
  if (await p.evaluate(() => !!document.querySelector('.choices:not(.hidden) .choice'))) break;
  await p.keyboard.press('Enter');
}
await pause(800);
const castI = await p.evaluate(() => [...document.querySelectorAll('.choices:not(.hidden) .choice')].findIndex((c) => /Cast/.test(c.textContent)));
await clickSel('.choices:not(.hidden) .choice >> nth=' + castI);
await p.waitForSelector('.fish-panel [data-k=cast]');
await pause(1500);
await catchOne(false);
await clickSel('.fish-panel [data-k=leave]');
await pause(2200);
await start('fish.saltglass.harbor', 'suzu', 'tanuki');
await p.evaluate(() => RB.activity.launch('fishing', { source: 'world-prop', site: 'fish.saltglass.harbor' }));
await p.waitForSelector('.fish-panel [data-k=cast]');
await pause(1200);
// (the first cast here waits: it is the first catch of this campaign; Skip shows from the second)
await catchOne(false);
await clickSel('.fish-panel [data-k=leave]');
await pause(1800);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(raw, out);
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB, ' + Math.round((Date.now() - T0) / 1000) + ' s)' + (errors.length ? ' errors: ' + errors.join('; ') : ''));
await b.close();
srv.close();
process.exit(errors.length ? 1 : 0);
