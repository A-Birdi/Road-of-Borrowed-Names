// Agnes, RBN-QA-022: Cinder Orchard's clues may be found in any order, and the third starts the synthesis (co.suspect:
// "Crossing the square, your feet stop on their own." … "Let's go to the Chronicle Hall. I want to see that
// chronicle."). With the chronicle's desk last, it played at the desk, inside the hall. Now the synthesis plays where it
// fits: in the square at once; at the desk, staged there (no square, no pointing to the hall you are in) and on into
// the chronicle with Tokiwa; anywhere else (the road, the glass workshop, Ume's house), as you next come into the
// village. No line is new; the two square lines are kept for every order but the desk's. In the game:
//  1. the desk last: the "No fire" entry, the synthesis at the desk without the square or the pointing line, Tokiwa's
//     chronicle at once; step 2 then 3; still in the hall;
//  2. a save written at the desk right after the synthesis, loaded: the desk gives Tokiwa's chronicle (step 3);
//  3. the square last (the seat): the synthesis at once with both square lines (unchanged);
//  4. the glass workshop's beam, 5. the road's marker, 6. Ume's beam last: nothing there (saved and loaded too); coming
//     into the village, the synthesis with both square lines; step 2;
//  7. the desk early (one clue before): its note only, no synthesis.
// Usage: node tools/build.mjs && node tests/e2e/cinder_clue_order.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// a twelve-chapter journey (the shipped edition): Cinder Orchard is Chapter 5, after Manybridge
const BASE = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, co_arrived: true, co_met_sayo: true, 'enter:co.village:co.village_first': true };
const SQUARE = /Crossing the square, your feet stop/, POINT = /Let's go to the Chronicle Hall/, SYNTH = /I know a lot of good liars/;
const NOFIRE = /every year has the same words added: "No fire\."/, TOKIWA = /The chronicle\. From the founding/;

async function start(p, o) {
  await p.evaluate(async (o) => {
    RB.test.enable({ battle: 'unravel', choose: () => 0 });
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'suzu', flags: Object.assign({}, o.flags), dir: o.dir || 'up', edition: 2 });
    s.chapter = 5;
    s.learn.kanaKnown = 'both'; // (no kana lesson before the chronicle's task, as tests/e2e/story_ch3.mjs's I profile)
    s.quests.co_main = { stage: o.stage || 1, done: false, t: 1 };
    s.vars.co_clues = o.clues;
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, o);
}
const state = (p) => p.evaluate(() => {
  const s = RB.game.s;
  return { map: RB.world.W.map.id, step: s.quests.co_main.stage, suspect: !!s.flags.co_suspect, read: !!s.flags.co_chronicle_read, clues: s.vars.co_clues, off: s.vars._co_off || 0, desk: s.vars._co_desk || 0 };
});
// use a prop (stand by it, interact) and play what follows; the English of every line shown
const use = (p, x, y) => p.evaluate(async ([x, y]) => { const n = RB.game.s.backlog.length; await RB.test.use(x, y); await RB.test.idle(); return RB.game.s.backlog.slice(n).map((l) => l.en || ''); }, [x, y]);
const go = (p, map, x, y) => p.evaluate(async ([map, x, y]) => { const n = RB.game.s.backlog.length; await RB.test.go(map, x, y, 'down'); await RB.test.idle(); return RB.game.s.backlog.slice(n).map((l) => l.en || ''); }, [map, x, y]);
async function saveAndLoad(p) {
  await p.evaluate(async () => { await RB.test.idle(); await RB.save.writeSlot(1, RB.game.s, { force: true }); await RB.game.loadCampaign(1); });
  await p.waitForFunction(() => RB.game.s && RB.world.W.map && RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 20000 });
  await p.waitForTimeout(600);
  return state(p);
}
const has = (lines, re) => lines.some((l) => re.test(l));
const brief = (lines) => lines.join(' | ').slice(0, 220);

// ---- 1. the desk last ---------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.hall', x: 6, y: 6, flags: Object.assign({ co_clue_seat: true, co_clue_beam: true }, BASE), clues: 2 });
  const lines = await use(p, 5, 3);
  const st = await state(p);
  ok(has(lines, NOFIRE), '1 the desk last: the chronicle\'s added "No fire" (the third clue)');
  ok(has(lines, SYNTH) && st.suspect, '1 the synthesis plays at the desk (your companion\'s line; co_suspect)');
  ok(!has(lines, SQUARE), '1 no "Crossing the square" inside the hall');
  ok(!has(lines, POINT), '1 no "Let\'s go to the Chronicle Hall" while you stand in it');
  ok(has(lines, TOKIWA) && st.read && st.step === 3, '1 on into the chronicle with Tokiwa: read, step 3 (' + st.step + ')');
  const iS = lines.findIndex((l) => SYNTH.test(l)), iN = lines.findIndex((l) => NOFIRE.test(l)), iT = lines.findIndex((l) => TOKIWA.test(l));
  ok(iN >= 0 && iN < iS && iS < iT, '1 in that order: the entry, the synthesis, Tokiwa');
  ok(st.map === 'co.hall' && st.desk === 0, '1 still in the hall; the desk marker cleared (' + st.map + ')');
  const ld = await saveAndLoad(p);
  ok(ld.read && ld.step === 3 && ld.suspect, '1 saved and loaded: as it was');
  ok(errors.length === 0, '1 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 2. saved at the desk just after the synthesis, loaded -----------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.hall', x: 6, y: 6, flags: Object.assign({ co_clue_seat: true, co_clue_beam: true, co_clue_chron: true, co_suspect: true }, BASE), clues: 3, stage: 2 });
  let st = await saveAndLoad(p);
  ok(st.suspect && !st.read && st.step === 2 && st.map === 'co.hall', '2 a save at the desk after the synthesis loads at step 2, the chronicle not yet read');
  const lines = await use(p, 5, 3);
  st = await state(p);
  ok(has(lines, TOKIWA) && st.read && st.step === 3, '2 the desk then gives the chronicle with Tokiwa: read, step 3');
  ok(!has(lines, SYNTH) && !has(lines, SQUARE), '2 no second synthesis');
  ok(errors.length === 0, '2 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 3. the square last (the seat): unchanged --------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.village', x: 26, y: 20, flags: Object.assign({ co_clue_beam: true, co_clue_chron: true }, BASE), clues: 2 });
  const lines = await use(p, 26, 18);
  const st = await state(p);
  ok(st.suspect && st.step === 2 && st.map === 'co.village', '3 the square last: the synthesis at once, step 2');
  ok(has(lines, SQUARE) && has(lines, SYNTH) && has(lines, POINT), '3 with "Crossing the square" and "Let\'s go to the Chronicle Hall" (' + brief(lines.filter((l) => SQUARE.test(l) || POINT.test(l))) + ')');
  ok(errors.length === 0, '3 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 4-6. the third clue away from the square: it waits for the village --------------------------------------------
for (const c of [
  { n: 4, what: 'the glass workshop\'s beam', map: 'co.glass', x: 8, y: 4, at: [8, 2], flags: { co_clue_seat: true, co_clue_chron: true }, set: 'co_clue_beam' },
  { n: 5, what: 'the road\'s marker', map: 'co.road', x: 22, y: 11, at: [22, 9], flags: { co_clue_seat: true, co_clue_beam: true }, set: 'co_clue_marker' },
  { n: 6, what: 'Ume\'s beam', map: 'co.ume', x: 5, y: 4, at: [5, 2], flags: { co_clue_seat: true, co_clue_beam: true }, set: 'co_clue_smoke' },
]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: c.map, x: c.x, y: c.y, flags: Object.assign({}, c.flags, BASE), clues: 2 });
  const lines = await use(p, c.at[0], c.at[1]);
  let st = await state(p);
  const got = await p.evaluate((f) => !!RB.game.s.flags[f], c.set);
  ok(got && st.clues === 3, c.n + ' ' + c.what + ' last: the third clue counted');
  ok(!st.suspect && st.step === 1 && !has(lines, SQUARE) && !has(lines, SYNTH) && st.map === c.map, c.n + ' no synthesis there (' + st.map + ', step ' + st.step + ')');
  ok(st.off === 0, c.n + ' the away marker cleared');
  st = await saveAndLoad(p);
  ok(!st.suspect && st.clues === 3 && st.step === 1, c.n + ' saved and loaded: three clues, no synthesis yet');
  const into = await go(p, 'co.village', 24, 14);
  st = await state(p);
  ok(st.suspect && st.step === 2 && st.map === 'co.village', c.n + ' coming into the village: the synthesis, step 2');
  ok(has(into, SQUARE) && has(into, SYNTH) && has(into, POINT), c.n + ' with both square lines, in the square (' + brief(into.filter((l) => SQUARE.test(l) || POINT.test(l))) + ')');
  ok(errors.length === 0, c.n + ' no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 7. the desk early: its note only ------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.hall', x: 6, y: 6, flags: Object.assign({ co_clue_seat: true }, BASE), clues: 1 });
  const lines = await use(p, 5, 3);
  const st = await state(p);
  ok(has(lines, NOFIRE) && st.clues === 2 && !st.suspect && !st.read && st.step === 1, '7 the desk second: its note, two clues, no synthesis, no chronicle yet');
  ok(!has(lines, TOKIWA), '7 Tokiwa\'s chronicle waits for the synthesis (as before)');
  ok(errors.length === 0, '7 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
