// Sailing (expansion P11c; src/engine/72v_sail.js, src/ui/89v_sail.js), in Chromium on the built game, with throwaway
// sessions (no journey saved):
//  1. the boat at Saltglass's pier: the chart lists the ports reached (Manybridge) and asks how to go; "sail her
//     yourself" puts the boat out on the coastal sea, the strip shows the wind, the sail and the heading; a step takes
//     longer with the sail set wrong for the wind and shorter set right (Q steps through the settings); a situation
//     happens on the way (seals); Manybridge's water offers to bring her in, and the boat lies there after;
//  2. the crew sails her home: a sail tears on the way (left for port, never a warning), the voyage arrives anyway,
//     and the harbour's people mend her; the cabin below (the bunk, the way back up); the travel log in the travel
//     volume; the keyboard and the touch strip; at phone width the strip fits and nothing scrolls sideways.
// Usage: node tests/e2e/sailing.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const STEP = (m) => { if (process.env.SAIL_DEBUG) console.log('  · ' + m); };
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
async function start(p, o) {
  await p.evaluate(async (o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true };
    const s = RB.game.debugStart(o.map || 'sg.harbor', o.x || 35, o.y || 33, { comp: o.comp || 'mio', flags: Object.assign(done, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.visited['mb.pier'] = true; s.visited['sg.harbor'] = true;
    await RB.hooks.sail_boat(['chidori', 'ちどり']);
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.world.refreshActors();
  }, o || {});
}
// advance the dialogue until a choice (or the scene ends); then pick by text
async function toChoice(p, ms = 6000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await p.$('.choices:not(.hidden) .choice')) return p.$$eval('.choices:not(.hidden) .choice', (xs) => xs.map((x) => x.textContent));
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  return null;
}
const pick = (p, re) => p.locator('.choices:not(.hidden) .choice').filter({ hasText: re }).first().click();
async function settle(p, ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }));
    if (st.mode === 'world' && !st.dlg && !st.run) return true;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  return false;
}
// wait for a condition, reading on through any lines on the way
async function until(p, fn, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await p.evaluate(fn)) return true;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  throw new Error('timed out waiting for ' + String(fn).slice(0, 120));
}
const where = (p) => p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, at: RB.game.s.sea.at, n: RB.game.s.sea.n, dmg: RB.game.s.sea.dmg || null, voyage: !!RB.game.s.sea.voyage }));

await test('sail her yourself: the chart, the strip at sea, wind and sail, a situation on the way, docking at Manybridge', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p);
  // the boat lies by the pier
  const boat = await p.evaluate(() => RB.content.maps['sg.harbor'].props.find((q) => q.scene === 'sea.boat'));
  assert(boat && await p.evaluate((b) => RB.state.test(RB.game.s, b.if), boat), 'the boat lies at Saltglass\'s pier once she is yours');
  await p.evaluate((b) => { window.__sc = false; RB.script.run('sea.boat', { prop: b }).then(() => { window.__sc = true; }); }, boat);
  const menu = await toChoice(p);
  assert(menu && menu.some((t) => /Open the chart/.test(t)) && menu.some((t) => /cabin/.test(t)) && !menu.some((t) => /mend/.test(t)), 'the boat: chart, cabin (nothing to mend): ' + menu);
  await pick(p, /Open the chart/);
  await p.waitForSelector('.sea-folio .sea-dest');
  const dests = await p.$$eval('.sea-dest', (xs) => xs.map((x) => x.dataset.to));
  assert(dests.join() === 'manybridge', 'the chart lists the ports reached: ' + dests.join());
  await p.click('.sea-dest[data-to=manybridge]');
  await p.waitForSelector('.sea-mode[data-mode=self]');
  await p.click('.sea-mode[data-mode=self]');
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sea.coast' && RB.game.mode() === 'world', null, { timeout: 15000 });
  await settle(p);
  await p.waitForSelector('.sea-strip:not(.hidden) .sea-trim');
  const strip = await p.$eval('.sea-strip', (e) => e.textContent);
  assert(/wind from the/.test(strip) && /To Manybridge/.test(strip) && /Let the crew sail/.test(strip), 'the strip: wind, heading, the crew: ' + strip.slice(0, 200));
  // the sail and the wind: a step's length follows them
  const timing = await p.evaluate(() => {
    const s = RB.game.s, v = s.sea.voyage; v.wind = 'left'; // wind from the west: sailing east, it is behind you
    const out = {};
    for (const k of [0, 1, 2]) { RB.sail.setTrim(s, k); out[k] = RB.sail.stepDur('right', s); }
    out.beat = (RB.sail.setTrim(s, 0), RB.sail.stepDur('left', s));
    RB.sail.setTrim(s, 1);
    return out;
  });
  assert(timing[2] < timing[1] && timing[1] < timing[0], 'wind behind: full sail is quickest, sheeted in slowest: ' + JSON.stringify(timing));
  // face east (a turn, not a step), then Q steps through the settings: half, then full
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(40); await p.keyboard.up('ArrowRight');
  await p.waitForFunction(() => RB.world.W.player.dir === 'right');
  await p.keyboard.press('KeyQ');
  assert(await p.evaluate(() => RB.game.s.sea.trim === 2), 'Q sets the sail out full');
  await p.waitForFunction(() => /draws well/.test(document.querySelector('.sea-strip').textContent));
  // a situation on the way: seals at the third step
  await p.evaluate(() => { RB.game.s.sea.voyage.sits = [{ id: 'seal', at: 3, done: false }]; });
  for (let i = 0; i < 4; i++) { await p.keyboard.down('ArrowRight'); await p.waitForTimeout(170); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(60); }
  const saw = await p.evaluate(() => RB.ui.dialogue.isOpen() && /seals|海豹/.test(document.body.textContent));
  assert(saw, 'the seals, at the third step');
  await settle(p);
  const steps = await p.evaluate(() => RB.game.s.sea.voyage.steps);
  assert(steps >= 3, 'the voyage counts its steps: ' + steps);
  // on to Manybridge's water: the boat is brought in
  await p.evaluate(() => { const P = RB.world.W.player; P.x = P.fx = 58; P.y = P.fy = 8; if (RB.world.W.comp) { RB.world.W.comp.x = RB.world.W.comp.fx = 57; RB.world.W.comp.y = RB.world.W.comp.fy = 8; } });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(150); await p.keyboard.up('ArrowRight');
  const dock = await toChoice(p);
  assert(dock && dock.some((t) => /Bring her in/.test(t)), 'Manybridge\'s water offers to bring her in: ' + dock);
  await pick(p, /Bring her in/);
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'mb.pier', null, { timeout: 15000 });
  await settle(p);
  const w = await where(p);
  assert(w.at === 'manybridge' && w.n === 1 && !w.voyage && w.x === 16 && w.y === 17, 'ashore at Manybridge\'s pier, the boat lying there: ' + JSON.stringify(w));
  const log = await p.evaluate(() => RB.game.s.sea.log[0]);
  assert(log.from === 'saltglass' && log.to === 'manybridge' && log.mode === 'self' && log.sits.includes('seal') && log.sights.includes('seals'), 'the log\'s entry: ' + JSON.stringify(log));
  assert(await p.evaluate(() => RB.game.s.flags.sea_port_manybridge && RB.game.s.vars.sea_at === 'manybridge'), 'reached by sea');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the crew sails her home: a torn sail left for port, mended there; the cabin; the travel log; phone width', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 400, height: 820 } });
  await start(p, { map: 'mb.pier', x: 16, y: 17 });
  await p.evaluate(() => { RB.game.s.sea.at = 'manybridge'; });
  const boat = await p.evaluate(() => RB.content.maps['mb.pier'].props.find((q) => q.scene === 'sea.boat'));
  // the crew's voyage, with a sail that tears on the way
  await p.evaluate((b) => { window.__plan = RB.sail.plan; RB.sail.plan = () => ({ sits: ['t_sail'], wind: 'up' }); RB.script.run('sea.boat', { prop: b }); }, boat);
  await toChoice(p);
  await pick(p, /Open the chart/);
  await p.waitForSelector('.sea-dest[data-to=saltglass]');
  const geo = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  assert(geo, 'the chart fits a phone');
  await p.click('.sea-dest[data-to=saltglass]');
  await p.click('.sea-mode[data-mode=crew]');
  const torn = await toChoice(p, 10000);
  assert(torn && torn.some((t) => /Leave it for port/.test(t)), 'the sail tears: stitch it now, or leave it for port: ' + torn);
  const calm = await p.evaluate(() => document.body.textContent);
  assert(/either way/.test(calm) && !/warning|danger|careful/i.test(calm.slice(-2000)), 'calm words, never a warning');
  await pick(p, /Leave it for port/);
  await until(p, () => RB.world.W.map && RB.world.W.map.id === 'sg.harbor');
  await settle(p);
  await p.evaluate(() => { RB.sail.plan = window.__plan; });
  let w = await where(p);
  assert(w.at === 'saltglass' && w.dmg === 'sail' && w.n === 1, 'home anyway, the sail still torn: ' + JSON.stringify(w));
  const log = await p.evaluate(() => RB.game.s.sea.log[0]);
  assert(log.mode === 'crew' && log.sits.includes('t_sail'), 'the log says the crew sailed, and what happened: ' + JSON.stringify(log));
STEP('home');
  // the harbour's people mend her
  const sboat = await p.evaluate(() => RB.content.maps['sg.harbor'].props.find((q) => q.scene === 'sea.boat'));
  await p.evaluate((b) => { RB.script.run('sea.boat', { prop: b }); }, sboat);
  const m2 = await toChoice(p);
  assert(m2.some((t) => /mend her/.test(t)), 'something to mend: the harbour offers: ' + m2);
  await pick(p, /mend her/);
  await settle(p);
  assert(await p.evaluate(() => !RB.game.s.sea.dmg && !RB.game.s.flags.sea_dmg), 'mended');
STEP('mended');
  // below to the cabin, the bunk, and back up
  await p.evaluate((b) => { RB.script.run('sea.boat', { prop: b }); }, sboat);
  await toChoice(p);
  await pick(p, /cabin/);
  await until(p, () => RB.world.W.map && RB.world.W.map.id === 'sea.cabin');
  await settle(p);
STEP('in the cabin');
  await p.evaluate(() => { RB.game.s.resolve.pc = 1; RB.script.run('sea.cabin_bunk'); });
  await settle(p);
  assert(await p.evaluate(() => RB.game.s.resolve.pc === RB.game.s.resolve.max), 'the bunk rests you');
STEP('rested');
  await p.evaluate(() => { RB.script.run('sea.cabin_up'); });
  await until(p, () => RB.world.W.map && RB.world.W.map.id === 'sg.harbor');
  w = await where(p);
  assert(w.x === 35 && w.y === 33, 'up on the pier by the boat: ' + JSON.stringify(w));
STEP('ashore');
  // the travel volume's log
  await settle(p);
  await p.evaluate(() => RB.ui.menu.open('volume'));
  await p.waitForSelector('.sea-log .sea-entry');
  const entry = await p.$eval('.sea-log', (e) => e.textContent);
  assert(/Voyage 1: Manybridge to Saltglass/.test(entry) && /The crew sailed/.test(entry) && /sail tore/.test(entry), 'the travel log in the volume: ' + entry.slice(0, 200));
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no sideways scroll on a phone');
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
