// RBN-QA-102 (Cloud CC-113 §2; Agnes 6338768853; Local CL-186): a scene that reads its lines over black (`!fade out` …
// `!fade in`) and is ended by a change of campaign never runs its own fade back in, and nothing else lifted the black:
// after a load from the middle of the fog wait at Umagaeshi (cr.wait_fog) the journey was back in the world, no scene
// and no dialogue, under a black screen. And a load replaces the campaign only after it has read its save (and perhaps
// asked about another tab): until then a scene waiting on a fade or a !wait went on, a line, a flag, a warp. Now a
// change of campaign lifts the fade with every other layer, a fade under way belongs to the campaign it began in, and
// the old scene ends from the moment the change begins. In Chromium on the built game, from the fog wait:
//  1. through the real History -> Ledger -> Save & Load -> Load a journey -> Load, at its first line (read over black):
//     the loaded journey is in the world, no scene, no dialogue, the screen lit (no fade, not veiled); you walk;
//  2. Return to title from the same place: the title not under black;
//  3. the fog wait played through without interruption still reads its night over black and ends lit;
//  4. the save read held back 2.5 s and the load begun as the scene's fade out begins: while it loads, nothing of the
//     old scene goes on (no line, no flag, no warp; the lines offered meanwhile are advanced, as a player would);
//     after it, lit and in the world, the fog not waited, the screen still lit a second later;
//  5. the same, the load begun as its fade back in begins (the night's lines read first);
//  6. the load held at the "another tab" question, then Cancel: the journey kept, nothing of the scene went on while
//     the question was up (no fog waited, no phase, no warp, no line), lit, and you walk;
//  7. loaded again and again (held back at the fade out, then at the fade back in): lit each time, and the fog wait
//     then played through reads its night over black and ends lit;
//  8. a door's transition under way, its fade out held, and a load done inside it: the loaded journey stays where it
//     was saved; the old door goes no further (no map entered, no name, no checkpoint); the modes are the journey's
//     own; you walk and the next door works (RBN-QA-102 refine, Agnes 6340882225);
//  9. the same, the load cancelled at the "another tab" question: the journey kept, the door not taken, not left
//     in a transition: lit, you walk, the next door works;
//  10. a load begun as the door's fade back in begins (the new map already entered), that fade held: the same as 8;
//  11. a load after the door has been taken: the door's own name and checkpoint, then the saved journey as saved;
//  12. loads again and again: inside one door's fade out, then inside the next door's fade back in, then a door taken
//      with no load: each load as saved, and the last door taken in full (Local CL-198);
//  13. a journey loaded inside a door's fade out, then a new door taken before the old door's fade has settled: when
//      the old one settles, the new door's own mode is still there (the old takes away only its own), and the new door
//      is taken in full (Agnes 6342104644);
//  14. the same after a load cancelled at the "another tab" question: the old door's entry goes, the new door's stays;
//  15. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const allErrors = [];
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true };
for (let n = 1; n <= 5; n++) Object.assign(DONE, { ['cr_st' + n]: true, ['cr_lamp' + n]: true, ['cr_given' + n]: true });

async function start(p, before) {
  await p.evaluate(async (DONE) => {
    const s = RB.game.debugStart('cr.umagaeshi', 17, 13, { dir: 'up', edition: RB.edition.forNew(), comp: 'mio', flags: DONE });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.quests.cr_main = { stage: 2, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant';
    await RB.save.manualSave(1);
  }, DONE);
  await p.waitForTimeout(900);
  if (before) await before();
  await p.evaluate(() => { RB.script.run('cr.wait_fog'); });
  for (let i = 0; i < 50 && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) await p.waitForTimeout(100);
}
const screen = (p) => p.evaluate(() => ({ dark: document.querySelector('#overlay > .fade').classList.contains('on'), veiled: document.body.classList.contains('veiled'), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), map: RB.world.W.map && RB.world.W.map.id, line: RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown() ? RB.ui.dialogue.shown().en.slice(0, 30) : null }));
const click = (p, re) => p.evaluate((src) => { const re = new RegExp(src); const bt = [...document.querySelectorAll('button')].filter((x) => x.offsetParent).find((x) => re.test(x.textContent.trim())); if (bt) { bt.click(); return true; } return false; }, re.source);
async function toSaveLoad(p) {
  await p.evaluate(() => { const h = [...document.querySelectorAll('.dlg button')].find((x) => /History/.test(x.textContent)); if (h) h.click(); });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const s = document.querySelector('.ledger-save'); if (s) s.click(); });
  await p.waitForTimeout(700);
}
async function walks(p) {
  const a = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  await p.evaluate(() => { RB.world.W.player.dir = 'down'; });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(300); await p.keyboard.up('ArrowDown'); await p.waitForTimeout(400);
  const b2 = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  return a.join() !== b2.join();
}

// ---- 1. a load from the middle, the real way -----------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p);
  const mid = await screen(p);
  await toSaveLoad(p);
  await click(p, /^Load a journey/);
  await p.waitForTimeout(700);
  await p.evaluate(() => { const bt = [...document.querySelectorAll('button.primary')].filter((x) => x.offsetParent && x.textContent.trim() === 'Load')[0]; if (bt) bt.click(); });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim() === 'Load'); const bt = bs[bs.length - 1]; if (bt) bt.click(); });
  await p.waitForTimeout(2500);
  const after = await screen(p), w = await walks(p);
  ok(mid.dark && mid.line && !after.dark && !after.veiled && !after.run && !after.dlg && after.mode === 'world' && after.map === 'cr.umagaeshi' && w,
    'a load through History -> Ledger -> Save & Load from the fog wait\'s line over black: the journey in the world, lit, and you walk (' + JSON.stringify({ mid, after, walks: w }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 2. return to the title from the same place ----------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p);
  const mid = await screen(p);
  await toSaveLoad(p);
  await p.evaluate(() => { const o = document.querySelector('.sv-opt[data-a="title"]'); if (o) o.click(); });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim() === 'Return to title'); const bt = bs[bs.length - 1]; if (bt) bt.click(); });
  await p.waitForTimeout(2000);
  const title = await p.evaluate(() => ({ dark: document.querySelector('#overlay > .fade').classList.contains('on'), veiled: document.body.classList.contains('veiled'), playing: !!(RB.game.G && RB.game.G.playing) }));
  ok(mid.dark && !title.dark && !title.veiled && !title.playing, 'Return to title from the line over black: the title is not under black (' + JSON.stringify({ mid, title }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 3. played through ---------------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p);
  const first = await screen(p);
  for (let i = 0; i < 80 && (await p.evaluate(() => RB.script.isRunning() || RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(250); }
  await p.waitForTimeout(1500);
  const end = await screen(p);
  ok(first.dark && !end.dark && !end.veiled && !end.run, 'the fog wait played through: its night read over black, and it ends lit (' + JSON.stringify({ first, end }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- the load held back: what the old scene does meanwhile -------------------------------------------------------------
// (installed before the scene starts: every line offered and every map entered while the load is under way is logged;
// the save read waits 2.5 s; a load begins as the named fade begins)
async function hold(p, o) {
  await p.evaluate((o) => {
    const L = (window.__log = { lines: [], enters: [], loading: 0, results: [] });
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (L.loading) L.lines.push(String((l && l.en) || '').slice(0, 40)); return say.apply(this, arguments); };
    const enter = RB.world.enter;
    RB.world.enter = function (id) { if (L.loading) L.enters.push(id); return enter.apply(this, arguments); };
    const read = RB.save.read;
    RB.save.read = async function () { await new Promise((r) => setTimeout(r, o.delay || 2500)); return read.apply(this, arguments); };
    if (o.busy) { const claim = RB.save.claim; RB.save.claim = async function () { RB.save.claim = claim; return 'busy'; }; }
    const fade = RB.ui.fade;
    window.__loadOn = o.on;
    window.__load = () => { L.loading++; return RB.game.loadCampaign(1).then((x) => { L.loading--; L.results.push(x); }, (e) => { L.loading--; L.results.push('error ' + e); }); };
    RB.ui.fade = function (out) {
      const r = fade.apply(this, arguments);
      if (window.__loadOn && window.__loadOn === (out ? 'out' : 'in')) { window.__loadOn = null; window.__load(); }
      return r;
    };
  }, o);
}
// while the load is under way, any line the old scene offers is advanced, as a player would
async function whileLoading(p, during) {
  for (let i = 0; i < 120; i++) {
    const st = await p.evaluate(() => ({ loading: window.__log.loading, dlg: RB.ui.dialogue.isOpen(), q: [...document.querySelectorAll('.confirm-scrim p.q')].some((x) => x.offsetParent && /another tab/.test(x.textContent)) }));
    if (!st.loading && i > 2) break;
    if (during) await during(st);
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
    await p.waitForTimeout(100);
  }
}
const oldState = (p) => p.evaluate(() => ({ waited: !!RB.game.s.flags.cr_fog_waited, phase: RB.game.s.vars.cr_phase, map: RB.world.W.map && RB.world.W.map.id }));

// ---- 4. the load begun as the fade out begins, its save read held back ---------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, async () => hold(p, { on: 'out' }));
  await whileLoading(p);
  await p.waitForTimeout(1200);
  const L = await p.evaluate(() => window.__log), after = await screen(p), st = await oldState(p), w = await walks(p);
  ok(L.results.length === 1 && L.results[0] === true && L.lines.length === 0 && !L.enters.includes('cr.leg5') && !after.dark && !after.veiled && !after.run && !after.dlg && after.mode === 'world' && after.map === 'cr.umagaeshi' && !st.waited && w,
    'the save read held back, the load begun as the fade out begins: nothing of the old scene goes on meanwhile, and after it the journey is lit, in the world, the fog not waited; you walk (' + JSON.stringify({ L, after, st, walks: w }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 5. the load begun as the fade back in begins --------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, async () => hold(p, { on: 'in' }));
  for (let i = 0; i < 40 && (await p.evaluate(() => !!window.__loadOn)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(200); }
  await whileLoading(p);
  await p.waitForTimeout(1200);
  const L = await p.evaluate(() => window.__log), after = await screen(p), st = await oldState(p);
  ok(L.results.length === 1 && L.results[0] === true && L.lines.length === 0 && !L.enters.includes('cr.leg5') && !after.dark && !after.veiled && !after.run && !after.dlg && after.mode === 'world' && after.map === 'cr.umagaeshi' && !st.waited,
    'the load begun as the fade back in begins: no morning line and no warp meanwhile; after it, lit, in the world, the fog not waited (' + JSON.stringify({ L, after, st }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 6. the load held at the "another tab" question, then Cancel ---------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, async () => hold(p, { on: 'out', busy: true, delay: 200 }));
  let asked = false, t0 = Date.now();
  await whileLoading(p, async (st) => {
    if (st.q) asked = true;
    if (st.q && Date.now() - t0 > 3000) await click(p, /^Cancel$/);
  });
  await p.waitForTimeout(1000);
  const L = await p.evaluate(() => window.__log), after = await screen(p), st = await oldState(p), w = await walks(p);
  ok(asked && L.results.length === 1 && L.results[0] === false && L.lines.length === 0 && !L.enters.length && !st.waited && st.phase !== 5 && st.map === 'cr.umagaeshi' && !after.dark && !after.veiled && !after.run && !after.dlg && after.mode === 'world' && w,
    'held at the "another tab" question, then Cancel: the journey kept, nothing of the scene went on while it was asked (no fog waited, no phase, no warp, no line), lit, and you walk (' + JSON.stringify({ asked, L, after, st, walks: w }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 7. loads again and again: one held back at the fade out, one at the fade back in, then the fog wait as ever --------
{
  const { p, errors } = await page(b, url);
  await start(p, async () => hold(p, { on: 'out' }));
  await whileLoading(p);
  await p.waitForTimeout(800);
  await p.evaluate(() => { window.__loadOn = 'in'; RB.script.run('cr.wait_fog'); });
  for (let i = 0; i < 60 && (await p.evaluate(() => !!window.__loadOn)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(200); }
  await whileLoading(p);
  await p.waitForTimeout(1500);
  const L = await p.evaluate(() => window.__log), after = await screen(p), st = await oldState(p);
  const ok1 = L.results.length === 2 && L.results.every((x) => x === true) && L.lines.length === 0 && !L.enters.includes('cr.leg5') && !after.dark && !after.veiled && !after.run && !after.dlg && after.mode === 'world' && after.map === 'cr.umagaeshi' && !st.waited;
  // then the fog wait, uninterrupted, as ever
  await p.evaluate(() => { RB.script.run('cr.wait_fog'); });
  for (let i = 0; i < 50 && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) await p.waitForTimeout(100);
  const first = await screen(p);
  for (let i = 0; i < 80 && (await p.evaluate(() => RB.script.isRunning() || RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(250); }
  await p.waitForTimeout(1500);
  const end = await screen(p);
  ok(ok1 && first.dark && !end.dark && !end.veiled && !end.run && end.map === 'cr.leg5',
    'loaded twice, held back at the fade out and at the fade back in: lit, in the world, the fog not waited; then the fog wait reads its night over black and ends lit on the road (' + JSON.stringify({ L, after, st, first, end }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 8–9. a door's transition under way when the campaign changes (Agnes 6340882225) -------------------------------------
// The transition's fade out is held 1.5 s, so the load (or its question) happens inside it: the transition must go no
// further once the campaign has begun to change (no map entered, no name, no checkpoint, no arrival), and must leave
// the new or kept journey's modes alone, so you walk and the next door works.
async function doorSetup(p, o) {
  await p.evaluate(async (DONE) => {
    const s = RB.game.debugStart('cr.umagaeshi', 17, 13, { dir: 'up', edition: RB.edition.forNew(), comp: 'mio', flags: DONE });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    delete s.flags['named:cr.leg5']; delete s.flags['enter:cr.leg5:cr.leg5_first'];
    s.quests.cr_main = { stage: 2, done: false, t: 1 };
    await RB.save.manualSave(1);
  }, DONE);
  await p.waitForTimeout(900);
  await hold(p, Object.assign({ delay: 1 }, o));
  await p.evaluate(() => {
    const f = RB.ui.fade; window.__slow = 0;
    // __slow = 1 or 'out' holds the next fade out __slowMs (1.5 s) after it ends; 'in', the next fade back in. Each
    // held fade is listed in __held, marked done as it settles.
    window.__held = [];
    RB.ui.fade = function (out) {
      const r = f.apply(this, arguments);
      if (window.__slow && (window.__slow === 'in' ? !out : out)) {
        window.__slow = 0;
        const h = { out, done: false }, ms = window.__slowMs || 1500;
        window.__held.push(h);
        return r.then(() => new Promise((res) => setTimeout(() => { h.done = true; res(); }, ms)));
      }
      return r;
    };
    const d = RB.content.maps['cr.leg5'].spawn.default;
    window.__door = () => RB.game.transition('cr.leg5', d[0], d[1], d[2] || 'right');
  });
}
const doorState = (p) => p.evaluate(() => ({ map: RB.world.W.map && RB.world.W.map.id, named: !!RB.game.s.flags['named:cr.leg5'], cp: RB.game.s.checkpoint ? RB.game.s.checkpoint.map : null, modes: RB.game.G.modes.slice(), dark: document.querySelector('#overlay > .fade').classList.contains('on'), veiled: document.body.classList.contains('veiled'), run: RB.script.isRunning() }));
// the journey as it was saved (at Umagaeshi; leg 5 never named, never a checkpoint), in the world
const asSaved = (st) => st.map === 'cr.umagaeshi' && !st.named && st.cp !== 'cr.leg5' && JSON.stringify(st.modes) === '["world"]' && !st.dark && !st.veiled;
{
  const { p, errors } = await page(b, url);
  await doorSetup(p, {});
  await p.evaluate(() => { window.__slow = 1; window.__door(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { window.__load(); });
  await whileLoading(p);
  await p.waitForTimeout(2500);
  const L = await p.evaluate(() => window.__log), after = await doorState(p), w = await walks(p);
  await p.evaluate(() => window.__door());
  await p.waitForTimeout(1500);
  const next = await doorState(p);
  ok(L.results.length === 1 && L.results[0] === true && after.map === 'cr.umagaeshi' && !after.named && after.cp !== 'cr.leg5' && JSON.stringify(after.modes) === '["world"]' && !after.dark && !after.veiled && w && next.map === 'cr.leg5' && JSON.stringify(next.modes) === '["world"]',
    'a load inside a door\'s fade out: the loaded journey stays where it was saved, the old door goes no further (no map, name or checkpoint), the modes are the journey\'s own; you walk, and the next door works (' + JSON.stringify({ L, after, walks: w, next }) + ')');
  allErrors.push(...errors); await p.close();
}
{
  const { p, errors } = await page(b, url);
  await doorSetup(p, { busy: true });
  await p.evaluate(() => { window.__slow = 1; window.__door(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { window.__load(); });
  let asked = false;
  await whileLoading(p, async (st) => { if (st.q) { asked = true; await click(p, /^Cancel$/); } });
  await p.waitForTimeout(2500);
  const L = await p.evaluate(() => window.__log), after = await doorState(p), w = await walks(p);
  await p.evaluate(() => window.__door());
  await p.waitForTimeout(1500);
  const next = await doorState(p);
  ok(asked && L.results.length === 1 && L.results[0] === false && after.map === 'cr.umagaeshi' && JSON.stringify(after.modes) === '["world"]' && !after.dark && !after.veiled && w && next.map === 'cr.leg5' && JSON.stringify(next.modes) === '["world"]',
    'a load cancelled at the "another tab" question inside a door\'s fade out: the journey kept, the door not taken, not left in a transition: lit, you walk, and the next door works (' + JSON.stringify({ asked, L, after, walks: w, next }) + ')');
  allErrors.push(...errors); await p.close();
}

{
  // 10. the load begun as the door's fade back in begins: the map is already entered, the fade back in held
  const { p, errors } = await page(b, url);
  await doorSetup(p, {});
  await p.evaluate(() => { window.__slow = 'in'; window.__loadOn = 'in'; window.__door(); });
  await p.waitForTimeout(150);
  await whileLoading(p);
  await p.waitForTimeout(2500);
  const L = await p.evaluate(() => window.__log), after = await doorState(p), w = await walks(p);
  await p.evaluate(() => window.__door());
  await p.waitForTimeout(1500);
  const next = await doorState(p);
  ok(L.results.length === 1 && L.results[0] === true && asSaved(after) && w && next.map === 'cr.leg5' && JSON.stringify(next.modes) === '["world"]',
    'a load begun as a door\'s fade back in begins, the new map already entered: the loaded journey as saved (no name or checkpoint from the old door), the modes its own; you walk, and the next door works (' + JSON.stringify({ L, after, walks: w, next }) + ')');
  allErrors.push(...errors); await p.close();
}
{
  // 11. a load after the door has been taken
  const { p, errors } = await page(b, url);
  await doorSetup(p, {});
  await p.evaluate(() => window.__door());
  await p.waitForTimeout(2000);
  const taken = await doorState(p);
  await p.evaluate(() => { window.__load(); });
  await whileLoading(p);
  await p.waitForTimeout(1500);
  const L = await p.evaluate(() => window.__log), after = await doorState(p), w = await walks(p);
  ok(taken.map === 'cr.leg5' && taken.named && taken.cp === 'cr.leg5' && L.results.length === 1 && L.results[0] === true && asSaved(after) && w,
    'a load after a door has been taken: the door named and checkpointed its map, then the loaded journey is as saved, the modes its own, and you walk (' + JSON.stringify({ taken, L, after, walks: w }) + ')');
  allErrors.push(...errors); await p.close();
}
{
  // 12. loads again and again: inside one door's fade out, inside the next door's fade back in, then a door with no load
  const { p, errors } = await page(b, url);
  await doorSetup(p, {});
  await p.evaluate(() => { window.__slow = 1; window.__door(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { window.__load(); });
  await whileLoading(p);
  await p.waitForTimeout(2500);
  const one = await doorState(p);
  await p.evaluate(() => { window.__slow = 'in'; window.__loadOn = 'in'; window.__door(); });
  await p.waitForTimeout(150);
  await whileLoading(p);
  await p.waitForTimeout(2500);
  const two = await doorState(p), w = await walks(p);
  await p.evaluate(() => window.__door());
  await p.waitForTimeout(2000);
  const L = await p.evaluate(() => window.__log), last = await doorState(p);
  ok(L.results.length === 2 && L.results.every((x) => x === true) && asSaved(one) && asSaved(two) && w && last.map === 'cr.leg5' && last.named && last.cp === 'cr.leg5' && JSON.stringify(last.modes) === '["world"]' && !last.dark,
    'loads again and again (inside one door\'s fade out, then inside the next door\'s fade back in): each journey as saved; then a door with no load is taken in full, named and checkpointed, the modes the journey\'s own (' + JSON.stringify({ L, one, two, walks: w, last }) + ')');
  allErrors.push(...errors); await p.close();
}

// 13–14. a new door taken before the old door's held fade has settled, after a load (replaced, or cancelled)
for (const cancel of [false, true]) {
  const { p, errors } = await page(b, url);
  await doorSetup(p, cancel ? { busy: true } : {});
  await p.evaluate(() => { window.__slow = 1; window.__door(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { window.__load(); });
  let asked = false;
  await whileLoading(p, async (st) => { if (cancel && st.q) { asked = true; await click(p, /^Cancel$/); } });
  const before = await p.evaluate(() => ({ oldDone: window.__held[0].done, modes: RB.game.G.modes.slice() }));
  await p.evaluate(() => { window.__slowMs = 3000; window.__slow = 1; window.__door(); });
  for (let i = 0; i < 40 && !(await p.evaluate(() => window.__held[0].done)); i++) await p.waitForTimeout(100);
  await p.waitForTimeout(150);
  const mid = await doorState(p), newOpen = await p.evaluate(() => !!window.__held[1] && !window.__held[1].done);
  for (let i = 0; i < 60 && !(await p.evaluate(() => !!window.__held[1] && window.__held[1].done)); i++) await p.waitForTimeout(100);
  await p.waitForTimeout(1000);
  const L = await p.evaluate(() => window.__log), end = await doorState(p);
  ok((!cancel || asked) && L.results.length === 1 && L.results[0] === !cancel && !before.oldDone && newOpen && JSON.stringify(mid.modes) === '["world","transition"]' && end.map === 'cr.leg5' && end.named && end.cp === 'cr.leg5' && JSON.stringify(end.modes) === '["world"]' && !end.dark && !end.veiled,
    (cancel ? 'a load cancelled' : 'a journey loaded') + ' inside a door\'s fade out, then a new door taken before the old door\'s fade has settled: as the old one settles the new door\'s mode is still there, and the new door is taken in full, named and checkpointed, the modes the journey\'s own (' + JSON.stringify({ asked, L, before, mid, newOpen, end }) + ')');
  allErrors.push(...errors); await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
