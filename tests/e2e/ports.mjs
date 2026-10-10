// Sazanami and East Landing (expansion P11d; src/content/sz/, src/content/el/), in Chromium on the built game, with
// throwaway sessions (no journey saved):
//  1. Sazanami: west along Saltglass's road into the hamlet, its first sight; the boat at the jetty, the chart from
//     there, the crew sailing her to Saltglass; phone width;
//  2. East Landing: round Saltglass's east beach onto the inlet, its first sight; rebuilt, the bell, the planks and
//     the boat at its jetty, and the chart from there.
// Usage: node tests/e2e/ports.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
async function start(p, o) {
  await p.evaluate(async (o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true };
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: o.comp || 'mio', flags: Object.assign(done, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.visited['mb.pier'] = true; s.visited['sg.harbor'] = true;
    s.quests.sea_licence = { stage: o.stage, done: false };
    Object.assign(s.vars, o.vars || {});
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.world.refreshActors();
  }, o || {});
}
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
async function until(p, fn, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await p.evaluate(fn)) return true;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  throw new Error('timed out waiting for ' + String(fn).slice(0, 120));
}
const step = async (p, key, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.down(key); await p.waitForTimeout(170); await p.keyboard.up(key); await p.waitForTimeout(80); } };
const shots = process.env.PORTS_SHOTS || '';


await test('Sazanami: up the coast road on foot, the first sight, the boat at the jetty, the crew sails her home', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'sg.road', x: 1, y: 10, stage: 6, flags: { sea_boat: true } });
  await p.evaluate(() => { RB.game.s.sea = { boat: { name: 'かもめ', hull: 'pilot' }, at: 'sazanami', trim: 1, n: 0, seen: {}, log: [] }; });
  await step(p, 'ArrowLeft', 2);
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sz.hamlet', null, { timeout: 15000 });
  await until(p, () => RB.game.s.flags.sz_seen && RB.game.mode() === 'world' && !RB.script.isRunning());
  const here = await p.evaluate(() => ({ npcs: RB.world.W.npcs.map((n) => n.id).sort(), travel: !!RB.game.s.travel.sazanami }));
  assert(here.travel && ['sz_isaku', 'sz_mina', 'sz_riku', 'sz_uki', 'sz_yone'].every((id) => here.npcs.includes(id)), 'the hamlet and its people: ' + JSON.stringify(here));
  if (shots) await p.screenshot({ path: shots + '/sazanami.png' });
  // the boat at the jetty: the chart from Sazanami
  const boat = await p.evaluate(() => RB.content.maps['sz.hamlet'].props.find((q) => q.scene === 'sea.boat'));
  assert(boat && await p.evaluate((b) => RB.state.test(RB.game.s, b.if), boat), 'the boat lies at Sazanami\'s jetty');
  // (the voyage's situations are drawn from a seeded stream; this one has only the coast's first voyage, no choices)
  await p.evaluate((b) => { RB.sail.plan = () => ({ sits: ['first_sz'], wind: 'up' }); RB.script.run('sea.boat', { prop: b }); }, boat);
  await toChoice(p);
  await pick(p, /Open the chart/);
  await p.waitForSelector('.sea-dest[data-to=saltglass]');
  const dots = await p.$$eval('.sea-chart circle', (xs) => xs.length);
  await p.click('.sea-dest[data-to=saltglass]');
  await p.click('.sea-mode[data-mode=crew]');
  await until(p, () => RB.world.W.map && RB.world.W.map.id === 'sg.harbor' && RB.game.mode() === 'world' && !RB.script.isRunning(), 20000);
  const w = await p.evaluate(() => ({ at: RB.game.s.sea.at, log: RB.game.s.sea.log.map((e) => e.from + '>' + e.to) }));
  assert(dots >= 2 && w.at === 'saltglass' && w.log.join() === 'sazanami>saltglass', 'sailed home from Sazanami: ' + JSON.stringify(w));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
  const ph = await page(b, url, { viewport: { width: 400, height: 820 } });
  await start(ph.p, { map: 'sz.hamlet', x: 22, y: 15, stage: 6 });
  await ph.p.evaluate(() => { RB.game.s.flags.sz_seen = true; });
  await ph.p.waitForTimeout(400);
  const fit = await ph.p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  assert(fit, 'the hamlet at phone width: nothing scrolls sideways');
  if (shots) await ph.p.screenshot({ path: shots + '/sazanami_phone.png' });
  assert(!ph.errors.length, 'no page errors: ' + ph.errors.join(' | '));
  await ph.p.close();
});

await test('East Landing: round the east beach, the first sight; rebuilt, its bell, its jetty and the boat', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'sg.harbor', x: 54, y: 28, stage: 7 });
  await step(p, 'ArrowRight', 2);
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'el.landing', null, { timeout: 15000 });
  await until(p, () => RB.game.s.flags.el_seen && RB.game.mode() === 'world' && !RB.script.isRunning());
  const before = await p.evaluate(() => ({ silt: RB.world.W.map.props.filter((q) => q.p === 'el_silt' && RB.state.test(RB.game.s, q.if)).length, broken: RB.world.W.map.props.filter((q) => q.p === 'el_brokenplanks' && RB.state.test(RB.game.s, q.if)).length }));
  assert(before.silt === 3 && before.broken === 2, 'silted, planks missing: ' + JSON.stringify(before));
  if (shots) await p.screenshot({ path: shots + '/eastlanding_before.png' });
  await p.close();
  const q = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(q.p, { map: 'el.landing', x: 18, y: 12, stage: 7, flags: { el_seen: true, el_notice: true, el_channel: true, el_jetty: true, el_bell: true, el_done: true, sea_boat: true } });
  await q.p.evaluate(() => { RB.game.s.sea = { boat: { name: 'かもめ', hull: 'pilot' }, at: 'eastlanding', trim: 1, n: 0, seen: {}, log: [] }; RB.world.refreshActors(); });
  await q.p.waitForTimeout(400);
  const after = await q.p.evaluate(() => {
    const ok = (q) => !q.if || RB.state.test(RB.game.s, q.if);
    const P = RB.world.W.map.props;
    return { silt: P.filter((x) => x.p === 'el_silt' && ok(x)).length, broken: P.filter((x) => x.p === 'el_brokenplanks' && ok(x)).length, bell: P.some((x) => x.p === 'cs_bellpost' && ok(x)), boat: P.some((x) => x.scene === 'sea.boat' && ok(x)), volunteers: RB.world.W.npcs.filter((n) => /^el_(daigo|sota|hama)$/.test(n.id)).length };
  });
  assert(!after.silt && !after.broken && after.bell && after.boat && !after.volunteers, 'rebuilt: the channel dug, the jetty whole, the bell up, the boat at the jetty, the volunteers gone home: ' + JSON.stringify(after));
  if (shots) await q.p.screenshot({ path: shots + '/eastlanding_after.png' });
  const boat = await q.p.evaluate(() => RB.content.maps['el.landing'].props.find((x) => x.scene === 'sea.boat'));
  await q.p.evaluate((bt) => { RB.script.run('sea.boat', { prop: bt }); }, boat);
  await toChoice(q.p);
  await pick(q.p, /Open the chart/);
  await q.p.waitForSelector('.sea-dest');
  const dests = await q.p.$$eval('.sea-dest', (xs) => xs.map((x) => x.dataset.to).sort());
  assert(dests.includes('saltglass') && dests.includes('manybridge'), 'the chart from East Landing: ' + dests.join());
  assert(!q.errors.length && !errors.length, 'no page errors: ' + q.errors.concat(errors).join(' | '));
  await q.p.close();
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
