// Agnes, RBN-QA-011: after Chapter 2 of a twelve-chapter journey the way on is Tetsu's ferry east to Manybridge (the
// north road from the coast road fork is washed out on purpose until Manybridge's two chapters are done, `mb2_done`),
// but the journal and Omi said "north to Cinder Orchard", and at the fork Suzu's "then east" read like the fork's own
// east road (which walks back to Reedwake). The gate and the order are unchanged; the words now follow the journey.
// In the game, each through a save written and loaded again:
//  1. twelve chapters, Omi's last scene and the end of Chapter 2: Omi names Tetsu's ferry (and the Gull, as before),
//     nothing shown mentions the north road, the journal ends on Tetsu; after loading, it still does; Tetsu first
//     gives his lead into "The Name Nobody Calls" (once), then offers the ferry, and it sails east to Manybridge;
//  2. a twelve-chapter save from before the fix (its journal ends on the north road), loaded: walking onto the north
//     road gives the notice, the narrator's word that Manybridge is the harbour ferry's and not a walk, the journal
//     corrected, and you back on the coast road; a second try adds no second note; saved and loaded, the note stays;
//  3. six chapters (the development switch; the shipped game begins only twelve-chapter journeys): the end of Chapter 2
//     journals the north road, Omi speaks of it, and the north exit leads to Cinder Orchard's road;
//  4. twelve chapters once Manybridge is done: the fork has no notice and its north exit leads on; Omi speaks of the
//     north road again.
// Usage: node tools/build.mjs && node tests/e2e/route_after_ch2.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// Chapter 1 behind you, Saltglass's story told (as tests/e2e/staging_ch12_cases.mjs SB, with Omi's last scene to come)
const SG = {
  rw_arrived: true, rw_road_lit: true, rw_echo_done: true, rw_mill_open: true, departed: true, ch1_done: true, sg_arrived: true, sg_harbor_seen: true,
  sg_tide_read: true, sg_tide_low: true, sg_fog_cleared: true, sg_boss_done: true, sg_returned: true, sg_ferry_done: true,
};
const DONE = Object.assign({}, SG, { ch2_done: true, sg_ferry_running: true });
const NORTH = 'Take the north road out of the coast road fork to Cinder Orchard.';
const EAST = 'A new line on the ferry board: east. Ask Tetsu at the harbour.';

async function start(p, o) {
  await p.evaluate(async (o) => {
    RB.test.enable({ battle: 'unravel', choose: () => o.pick || 0 });
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'suzu', flags: o.flags, dir: o.dir || 'up', edition: o.edition });
    s.chapter = 2;
    s.quests.sg_main = { stage: o.done ? 9 : 9, done: !!o.done, t: 1 };
    s.seen['sg.tetsu_history'] = true;
    if (o.journal) s.journal = o.journal.map((en) => ({ jp: '', en, t: 1 }));
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, o);
}
// a scene played through (lines advance, the first reply is chosen); the English of every line shown
const play = (p, id) => p.evaluate(async (id) => {
  const s = RB.game.s, n = s.backlog.length;
  await RB.script.run(id);
  await RB.test.idle();
  return s.backlog.slice(n).map((l) => l.en || '');
}, id);
const state = (p) => p.evaluate(() => {
  const s = RB.game.s, W = RB.world.W;
  return { map: W.map && W.map.id, x: W.player.x, y: W.player.y, ed: s.edition, journal: (s.journal || []).map((e) => e.en),
    flags: { ch2_done: !!s.flags.ch2_done, mb_east_noted: !!s.flags.mb_east_noted, mb_arrived: !!s.flags.mb_arrived } };
});
const last = (st) => st.journal[st.journal.length - 1] || '';
// written to a slot and loaded again as a player does (the same path as Load: migration, edition, the world)
async function saveAndLoad(p) {
  await p.evaluate(async () => { await RB.test.idle(); await RB.save.writeSlot(1, RB.game.s, { force: true }); await RB.game.loadCampaign(1); });
  await p.waitForFunction(() => RB.game.s && RB.world.W.map && RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 20000 });
  await p.waitForTimeout(600);
  return state(p);
}
// one step by real movement from x,y; then the outcome: on `map` (and at `at`, if given), nothing moving, no scene
async function walk(p, x, y, dir, map, at) {
  const n = await p.evaluate(async ([x, y, dir]) => { await RB.test.idle(); const n = RB.game.s.backlog.length; RB.test.place(x, y, dir); await RB.test.step(dir); return n; }, [x, y, dir]);
  const settled = () => p.waitForFunction(([m, at]) => {
    const W = RB.world.W;
    return W.map && W.map.id === m && (!at || (W.player.x === at[0] && W.player.y === at[1])) && !W.player.mv && RB.game.mode() === 'world' && !RB.script.isRunning();
  }, [map, at || null], { timeout: 20000, polling: 50 }).then(() => true, () => false);
  let reached = await settled();
  await p.waitForTimeout(400);
  if (reached) reached = await settled();
  const lines = await p.evaluate((n) => RB.game.s.backlog.slice(n).map((l) => l.en || ''), n);
  return { reached, lines };
}
const north = (lines) => lines.filter((l) => /north road/i.test(l) && !/washed away/.test(l));

// ---- 1. twelve chapters: the end of Chapter 2, saved and loaded, then Tetsu --------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.office', x: 5, y: 5, flags: SG, edition: 2 });
  const lines = await play(p, 'sg.omi_final');
  let st = await state(p);
  ok(st.ed === 2 && st.flags.ch2_done && st.map === 'sg.inn', '1 twelve chapters: Omi\'s last scene plays through the end of Chapter 2 to the morning at the Gull (' + st.map + ')');
  ok(lines.some((l) => /Tetsu's boat is going east to Manybridge.*the Gull/.test(l)), '1 Omi names Tetsu\'s ferry east, and the night at the Gull');
  ok(north(lines).length === 0, '1 nothing shown mentions the north road' + (north(lines).length ? ' (' + north(lines)[0] + ')' : ''));
  ok(last(st) === EAST && !st.journal.includes(NORTH), '1 the journal ends on Tetsu ("' + last(st) + '")');
  const after = await play(p, 'sg.omi_after');
  ok(north(after).length === 0 && after.length >= 1, '1 Omi afterwards says nothing of the north road (' + after.join(' | ').slice(0, 80) + ')');
  st = await saveAndLoad(p);
  ok(st.ed === 2 && last(st) === EAST && st.flags.mb_east_noted, '1 saved and loaded: still twelve chapters, the journal still ends on Tetsu');
  await p.evaluate(async () => { await RB.game.transition('sg.harbor', 30, 28, 'right'); });
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sg.harbor' && !RB.script.isRunning(), null, { timeout: 20000 });
  await p.waitForTimeout(1200);
  // first, once, his lead into "The Name Nobody Calls" (the hamlet across Reedwake's river); then the ferry
  let n = await p.evaluate(() => RB.game.s.backlog.length);
  await p.evaluate(async () => { await RB.test.talk('tetsu'); await RB.test.idle(); });
  const lead = await p.evaluate((n) => RB.game.s.backlog.slice(n).map((l) => l.en || ''), n);
  ok(lead.some((l) => /persimmon/.test(l)) && !lead.some((l) => /new line on the board/.test(l)), '1 Tetsu\'s first talk after the archive: his lead, the persimmon village (once)');
  n = await p.evaluate(() => RB.game.s.backlog.length);
  await p.evaluate(async () => { await RB.test.talk('tetsu'); await RB.test.idle(); });
  await p.waitForFunction(() => RB.world.W.map && /^mb\./.test(RB.world.W.map.id) && !RB.script.isRunning(), null, { timeout: 30000 }).catch(() => {});
  const told = await p.evaluate((n) => RB.game.s.backlog.slice(n).map((l) => l.en || ''), n);
  st = await state(p);
  ok(told.some((l) => /new line on the board\. East\. Manybridge/.test(l)), '1 Tetsu: "There\'s a new line on the board. East. Manybridge." (' + told.join(' | ').slice(0, 160) + ')');
  ok(/^mb\./.test(st.map) && st.flags.mb_arrived, '1 "We\'ll go to Manybridge": the ferry sails east, you arrive (' + st.map + ')');
  ok(errors.length === 0, '1 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 2. a twelve-chapter save from before the fix, loaded; the fork -------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.road', x: 16, y: 3, flags: DONE, edition: 2, done: true, journal: ['Get some sleep.', NORTH] });
  let st = await saveAndLoad(p);
  ok(st.ed === 2 && last(st) === NORTH && !st.flags.mb_east_noted, '2 the old save loads as it was: twelve chapters, its journal still on the north road');
  let w = await walk(p, 16, 1, 'up', 'sg.road', [16, 2]);
  st = await state(p);
  ok(w.reached, '2 walking onto the north road: the notice, and you are back on the coast road (16,2)');
  ok(w.lines.some((l) => /washed away in the storm/.test(l)), '2 the notice: the bridge washed away');
  ok(w.lines.some((l) => /Manybridge lies east, but not on foot: Tetsu's ferry/.test(l)), '2 the narrator: Manybridge is the harbour ferry\'s, not a walk (told apart from the fork\'s east road)');
  ok(last(st) === EAST, '2 the journal is corrected: "' + last(st) + '"');
  w = await walk(p, 16, 1, 'up', 'sg.road', [16, 2]);
  st = await state(p);
  ok(w.reached && st.journal.filter((e) => e === EAST).length === 1, '2 a second try: the notice again, no second note (' + st.journal.filter((e) => e === EAST).length + ')');
  st = await saveAndLoad(p);
  ok(last(st) === EAST && st.flags.mb_east_noted, '2 saved and loaded: the corrected journal stays');
  w = await walk(p, 38, 10, 'right', 'rw.road');
  ok(w.reached, '2 the fork\'s east road still walks to Reedwake (unchanged)');
  ok(errors.length === 0, '2 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 3. six chapters ---------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.office', x: 5, y: 5, flags: SG, edition: 1 });
  const lines = await play(p, 'sg.omi_final');
  let st = await state(p);
  ok(st.ed === 1 && st.flags.ch2_done, '3 six chapters: Omi\'s last scene plays through the end of Chapter 2');
  ok(lines.some((l) => /north road's open again.*the Gull/.test(l)), '3 Omi speaks of the north road (his recorded line)');
  ok(last(st) === NORTH && !st.journal.includes(EAST), '3 the journal ends on the north road to Cinder Orchard');
  await p.evaluate(async () => { await RB.game.transition('sg.road', 16, 3, 'up'); });
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sg.road' && !RB.script.isRunning(), null, { timeout: 20000 });
  await p.waitForTimeout(1200);
  const w = await walk(p, 16, 1, 'up', 'co.road');
  ok(w.reached && !w.lines.some((l) => /washed away/.test(l)), '3 the north exit leads to Cinder Orchard\'s road, with no notice');
  ok(errors.length === 0, '3 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 4. twelve chapters, once Manybridge is done ------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.road', x: 16, y: 3, flags: Object.assign({}, DONE, { mb_arrived: true, mb1_done: true, mb2_done: true }), edition: 2, done: true });
  const st = await saveAndLoad(p);
  ok(st.ed === 2, '4 twelve chapters, Manybridge done: saved and loaded');
  const w = await walk(p, 16, 1, 'up', 'co.road');
  ok(w.reached && !w.lines.some((l) => /washed away/.test(l)), '4 the fork has no notice and its north exit leads to Cinder Orchard\'s road');
  await p.evaluate(async () => { await RB.game.transition('sg.office', 5, 5, 'up'); });
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'sg.office' && !RB.script.isRunning(), null, { timeout: 20000 });
  const after = await play(p, 'sg.omi_after');
  ok(after.some((l) => /north road's open/.test(l)), '4 Omi speaks of the north road again (' + after.join(' | ').slice(0, 80) + ')');
  ok(errors.length === 0, '4 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

await b.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
