// RBN-QA-174 (Agnes 6380435020, 6380554586; Local CL-272, CL-273, CL-274): a voyage the crew sails is seen at sea, and
// the fog is shown. In Chromium on the built game, with throwaway sessions (a journey is written only to a test slot in
// this browser context):
//  1. the crew sails from Manybridge to Saltglass with the fog (the situation set for the test): its lines and its
//     challenge on the coastal sea with the fog on; "The crew lowers the sail…" at Saltglass's water, the boat brought
//     there in the dark of a fade with no transition (the town count and records, beats and visits as they were); docked at
//     Saltglass, the fog gone; the log's entry (crew, the fog, nothing else); and against the old way: one transition
//     more (to the sea, as when you sail yourself; the town count +2 in all, a solo voyage's two), no autosave, no
//     map's entry events, the same scenes as before, the voyage's draws untouched, the sea map marked visited (as a
//     solo voyage marks it);
//  2. a load straight after docking: at Saltglass, no fog, no voyage, no sea map;
//  3. sailing yourself: the fog scene at sea has the fog, gone when it ends; you are still at sea;
//  4. the crew taking over at sea: no second transition to the sea, the boat brought to Saltglass's water, docked;
//  5. crew against solo, the same voyage from the same start: the town count, every town's record, the beats seen, the
//     roads and the places visited the same after either (so whatever a town's routine does on your return is too);
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/crew_voyage_sea.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const errorsAll = [];

async function start(p, o) {
  await p.evaluate(async (o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true };
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'mio', flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.visited['mb.pier'] = true; s.visited['sg.harbor'] = true;
    await RB.hooks.sail_boat(['chidori', 'ちどり']);
    s.sea.at = o.at;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.world.refreshActors();
    // what the voyage does, as it happens: every line (where, and whether the fog is on), each challenge, each scene
    // begun, each autosave, each transition
    window.__L = []; window.__C = []; window.__S = []; window.__A = 0; window.__T = [];
    const fogOn = () => { const a = RB.staging.ambienceNow(); return !!(a && a.ambient && a.ambient.haze); };
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) {
      const W = RB.world.W;
      const w = RB.game.s.world || {};
      window.__L.push({ en: String((l && l.en) || '').slice(0, 50), map: W.map.id, at: [W.player.x, W.player.y], fog: fogOn(), town: JSON.stringify({ moves: w.moves, towns: w.towns, beats: w.beats }), visited: Object.keys(RB.game.s.visited || {}).length });
      return say.apply(this, arguments);
    };
    RB.challenge.run = async (id) => { const W = RB.world.W; window.__C.push({ id, map: W.map.id, fog: fogOn() }); await new Promise((r) => setTimeout(r, 200)); return { ok: true, firstTry: true }; };
    const run = RB.script.run;
    RB.script.run = function (id) { window.__S.push(id); return run.apply(this, arguments); };
    RB.save.autosave = async () => { window.__A++; };
    const tr = RB.game.transition;
    RB.game.transition = function (m) { window.__T.push(m); return tr.apply(this, arguments); };
  }, o);
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
async function settle(p, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }));
    if (st.mode === 'world' && !st.dlg && !st.run) return true;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  return false;
}
const snap = (p) => p.evaluate(() => {
  const s = RB.game.s, a = RB.staging.ambienceNow();
  return { map: RB.world.W.map.id, moves: (s.world && s.world.moves) || 0, visited: Object.keys(s.visited || {}).sort(), streams: J0(s.streams), n: s.sea.n, voyage: !!s.sea.voyage,
    fog: !!(a && a.ambient && a.ambient.haze), log: s.sea.log.length ? Object.assign({}, s.sea.log[s.sea.log.length - 1], { t: 0 }) : null };
  function J0(x) { return JSON.stringify(x || null); }
});
const water = (p, port) => p.evaluate((port) => { const P = RB.sail.port(port); return P && P.sea ? [P.sea.x, P.sea.y] : null; }, port);

// ---- 1. the crew sails from Manybridge, with the fog; 2. a load straight after docking -------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'mb.pier', x: 16, y: 17, at: 'manybridge' });
  const boat = await p.evaluate(() => RB.content.maps['mb.pier'].props.find((q) => q.scene === 'sea.boat'));
  await p.evaluate((bt) => { window.__plan = RB.sail.plan; RB.sail.plan = () => ({ sits: ['fog'], wind: 'up' }); RB.script.run('sea.boat', { prop: bt }); }, boat);
  await toChoice(p);
  await pick(p, /Open the chart/);
  await p.waitForSelector('.sea-dest[data-to=saltglass]');
  await p.click('.sea-dest[data-to=saltglass]');
  const before = await snap(p);
  await p.evaluate(() => { window.__L = []; window.__C = []; window.__S = []; window.__A = 0; window.__T = []; });
  await p.click('.sea-mode[data-mode=crew]');
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sg.harbor', null, { timeout: 30000 }).catch(() => {});
  const settled = await settle(p);
  await p.evaluate(() => { RB.sail.plan = window.__plan; });
  const after = await snap(p);
  const R = await p.evaluate(() => ({ L: window.__L, C: window.__C, S: window.__S, A: window.__A, T: window.__T }));
  const fogLines = R.L.filter((l) => /Fog comes down|beyond the fog|count of the flashes|crew laughs/.test(l.en));
  const arriveLine = R.L.find((l) => /lowers the sail/.test(l.en));
  const sgWater = await water(p, 'saltglass');
  ok(fogLines.length >= 2 && fogLines.every((l) => l.map === 'sea.coast' && l.fog) && R.C.length === 1 && R.C[0].map === 'sea.coast' && R.C[0].fog,
    'the crew\'s voyage: the fog\'s lines and its challenge on the coastal sea, with the fog on (' + J({ fogLines, C: R.C }) + ')');
  const lastFog = fogLines[fogLines.length - 1];
  ok(arriveLine && arriveLine.map === 'sea.coast' && sgWater && arriveLine.at[0] === sgWater[0] && arriveLine.at[1] === sgWater[1] && !arriveLine.fog,
    '"The crew lowers the sail…" at Saltglass\'s water, no fog (' + J({ arriveLine: Object.assign({}, arriveLine, { town: undefined }), sgWater }) + ')');
  ok(lastFog && arriveLine && lastFog.town === arriveLine.town && lastFog.visited === arriveLine.visited,
    'the boat brought to Saltglass\'s water and the arrival\'s line: the town count, every town\'s record and the beats seen, and the places visited, all as they were at the fog\'s last line (' + J({ before: lastFog && lastFog.town.slice(0, 80), same: lastFog && arriveLine && lastFog.town === arriveLine.town }) + ')');
  ok(settled && after.map === 'sg.harbor' && !after.fog && !after.voyage && after.n === before.n + 1 && after.log && after.log.mode === 'crew' && after.log.to === 'saltglass' && J(after.log.sits) === J(['fog']),
    'docked at Saltglass, the fog gone; the log: the crew sailed, the fog, nothing else (' + J({ settled, after: Object.assign({}, after, { visited: undefined, streams: undefined }) }) + ')');
  ok(J(R.T) === J(['sea.coast', 'sg.harbor']) && after.moves - before.moves === 2 && R.A === 0 && J(R.S) === J(['sea.sit_fog', 'sea.crew_arrive', 'sea.arrive_saltglass', 'sg.harbor_first', 'lq.letters_home']) && after.streams === before.streams,
    'one transition to the sea and one to the dock (the town count +2, as a solo voyage), no autosave, the same scenes as before (the fog, the crew\'s arrival, Saltglass\'s, the harbour\'s first visit, the letters home), the draws untouched (' + J({ T: R.T, moves: after.moves - before.moves, A: R.A, S: R.S, streams: after.streams === before.streams }) + ')');
  const newVisits = after.visited.filter((m) => before.visited.indexOf(m) < 0);
  ok(J(newVisits) === J(['sea.coast']) || J(newVisits) === '[]',
    'visited: the coastal sea at most, as a solo voyage marks it (' + J(newVisits) + ')');
  // 2. a load straight after docking
  const loaded = await p.evaluate(async () => {
    RB.save.setCurrent(3, 0);
    await RB.save.writeSlot(3, RB.game.s, { force: true });
    const okL = await RB.game.loadCampaign(3);
    await new Promise((r) => setTimeout(r, 900));
    const a = RB.staging.ambienceNow();
    return { okL, map: RB.world.W.map.id, fog: !!(a && a.ambient && a.ambient.haze), voyage: !!RB.game.s.sea.voyage, n: RB.game.s.sea.n };
  });
  ok(loaded.map === 'sg.harbor' && !loaded.fog && !loaded.voyage && loaded.n === after.n, 'a load straight after docking: at Saltglass, no fog, no voyage (' + J(loaded) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 3. sailing yourself: the fog scene at sea -------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'sg.harbor', x: 35, y: 33, at: 'saltglass' });
  await p.evaluate(async () => { RB.sail.plan = () => ({ sits: [], wind: 'up' }); await RB.hooks.sail_trial(['saltglass', 'manybridge']); });
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.__L = []; window.__C = []; RB.script.run('sea.sit_fog'); });
  await settle(p);
  const R = await p.evaluate(() => { const a = RB.staging.ambienceNow(); return { L: window.__L, C: window.__C, map: RB.world.W.map.id, fogAfter: !!(a && a.ambient && a.ambient.haze) }; });
  ok(R.L.length >= 2 && R.L.every((l) => l.map === 'sea.coast' && l.fog) && R.C.length === 1 && R.C[0].fog && R.map === 'sea.coast' && !R.fogAfter,
    'sailing yourself: the fog scene at sea has the fog, gone when it ends; still at sea (' + J(R) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 4. the crew taking over at sea -------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'sg.harbor', x: 35, y: 33, at: 'saltglass' });
  await p.evaluate(async () => { RB.sail.plan = () => ({ sits: [], wind: 'up' }); await RB.hooks.sail_trial(['saltglass', 'manybridge']); });
  await p.waitForTimeout(600);
  const before = await snap(p);
  await p.evaluate(() => { window.__L = []; window.__T = []; RB.script.run('sea.crew_take'); });
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id !== 'sea.coast', null, { timeout: 30000 }).catch(() => {});
  await settle(p);
  const after = await snap(p);
  const R = await p.evaluate(() => ({ L: window.__L, T: window.__T }));
  const mbWater = await water(p, 'manybridge');
  const arriveLine = R.L.find((l) => /lowers the sail/.test(l.en));
  ok(J(R.T) === J(['mb.pier']) && arriveLine && arriveLine.map === 'sea.coast' && mbWater && arriveLine.at[0] === mbWater[0] && arriveLine.at[1] === mbWater[1] && after.map === 'mb.pier' && after.moves - before.moves === 1 && after.log && after.log.mode === 'crew',
    'the crew taking over at sea: no second transition to the sea; brought to Manybridge\'s water, then docked (' + J({ T: R.T, arriveLine, mbWater, map: after.map, moves: after.moves - before.moves, mode: after.log && after.log.mode }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 5. crew against solo: the same voyage, the same records after it -----------------------------------------------------
{
  const world = [];
  for (const mode of ['crew', 'self']) {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
    await start(p, { map: 'mb.pier', x: 16, y: 17, at: 'manybridge' });
    const boat = await p.evaluate(() => RB.content.maps['mb.pier'].props.find((q) => q.scene === 'sea.boat'));
    await p.evaluate((bt) => { RB.sail.plan = () => ({ sits: [], wind: 'up' }); RB.script.run('sea.boat', { prop: bt }); }, boat);
    await toChoice(p);
    await pick(p, /Open the chart/);
    await p.waitForSelector('.sea-dest[data-to=saltglass]');
    await p.click('.sea-dest[data-to=saltglass]');
    await p.click('.sea-mode[data-mode=' + mode + ']');
    if (mode === 'self') {
      // sailed yourself: out on the sea, then brought in at Saltglass by the same arrival (the way her water's offer does)
      await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sea.coast', null, { timeout: 30000 }).catch(() => {});
      await settle(p);
      await p.evaluate(async () => { await RB.sail.arrive(RB.game.s, 'saltglass'); });
    }
    await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sg.harbor', null, { timeout: 30000 }).catch(() => {});
    await settle(p);
    world.push(await p.evaluate(() => { const w = RB.game.s.world || {}; return { map: RB.world.W.map.id, moves: w.moves, towns: w.towns, beats: w.beats, roads: w.roads, visited: Object.keys(RB.game.s.visited || {}).sort() }; }));
    errorsAll.push(...errors);
    await ctx.close();
  }
  const [crew, self] = world;
  ok(crew.map === 'sg.harbor' && self.map === 'sg.harbor' && J(crew) === J(self),
    'crew against solo, Manybridge to Saltglass with nothing on the way: the town count, every town\'s record (its tick, slots, left-at and flags), the beats seen, the roads and the places visited are the same after either (' + J({ crew: { moves: crew.moves, towns: Object.keys(crew.towns || {}), visited: crew.visited.length }, self: { moves: self.moves, towns: Object.keys(self.towns || {}), visited: self.visited.length }, same: J(crew) === J(self) }) + ')');
}
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
