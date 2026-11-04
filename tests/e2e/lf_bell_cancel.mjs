// Lanternfall's bell: "Come back later" is not the inscription read (Agnes 6639438614, finding 10; Cloud CC-522,
// CC-525; Local CL-689; Agnes 6639995441). In Chromium on the built game, on a throwaway journey (never a real save), in
// the bell hall with the keeper settled: the bell used through the world's own interact; the reading left on the real
// exercise sheet by its own "Come back later" button (the test helper's answering switched off for it), answered by the
// helper otherwise; Ring or Not yet chosen by the test; a save made and loaded through the game's own save and load:
//  1. the reading left: nothing of its meaning, no choice, not rung; the bell's illustrated sequence gone and the
//     world's own controls back, the queued events after the scene run out;
//  2. the bell again: no second kana group taught; the reading, its meaning, Ring / Not yet; Not yet: not rung;
//  3. a save and load, the bell again: no exercise, the meaning and the choice; Ring: rung, the main story at step 9;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/lf_bell_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_boss_done'];

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async ({ DONE }) => {
  const f = {};
  for (const k of DONE) f[k] = true;
  const s = RB.game.debugStart('lf.bellhall', 7, 9, { comp: 'mio', dir: 'up', edition: 2, flags: f });
  s.quests.lf_main = { stage: 8, done: false, t: 1 };
  for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
  RB.game.settings.textSpeed = 'instant';
  window.__pick = 0;
  const opts = { choose: () => window.__pick };
  RB.test.enable(opts);
  window.__leave = new Set();
  window.__runs = [];
  const run = RB.challenge.run;
  RB.challenge.run = async function (id) {
    if (!window.__leave.has(id)) { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok)]); return r; }
    RB.test.disable();
    let label = null;
    const tick = setInterval(() => {
      const teach = document.querySelector('.teach [data-ok]');
      if (teach && teach.offsetParent) { teach.click(); return; }
      const leave = document.querySelector('.chal [data-a=leave]');
      if (leave && leave.offsetParent) { label = leave.textContent.trim(); leave.click(); }
    }, 150);
    try { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok), !!(r && r.cancelled), label]); return r; } finally { clearInterval(tick); RB.test.enable(opts); }
  };
  await new Promise((r) => setTimeout(r, 900));
  RB.world.refreshActors();
  window.__said = [];
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
}, { DONE });
const bell = (leave, pick) => p.evaluate(async ({ leave, pick }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []); window.__pick = pick;
  await RB.test.idle();
  const g0 = RB.game.s.learn.kanaGroup;
  await RB.test.use(7, 7);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 600)); await RB.test.idle();
  const s = RB.game.s;
  return { said: window.__said.slice(), runs: window.__runs.slice(), g0, g1: s.learn.kanaGroup, rung: !!s.flags.lf_bell_rung, main: s.quests.lf_main.stage, seq: !!RB.sequence.state(), mode: RB.game.mode(), map: RB.world.W.map.id };
}, { leave, pick });
const has = (said, re) => said.some((x) => re.test(x));
const MEANING = /When this bell rings, flee to high ground/;

const t1 = await bell(['lf.ch_bell'], 0);
ok(flat(t1.runs) === flat([['lf.ch_bell', false, true, 'Come back later']]) && !has(t1.said, MEANING) && !t1.rung && t1.main === 8 && !t1.seq && t1.mode === 'world' && t1.map === 'lf.bellhall',
  '1 the reading left by "Come back later": no meaning, no choice, not rung, step 8; the sequence gone and the controls back ' + flat({ runs: t1.runs, rung: t1.rung, seq: t1.seq, mode: t1.mode, g: [t1.g0, t1.g1] }));
const t2 = await bell([], 1);
ok(flat(t2.runs) === flat([['lf.ch_bell', true]]) && t2.g1 === t1.g1 && has(t2.said, MEANING) && !t2.rung && !t2.seq && t2.mode === 'world',
  '2 the bell again: no second kana group; read, its meaning, the choice; Not yet: not rung ' + flat({ runs: t2.runs, g: [t1.g1, t2.g1], rung: t2.rung }));
const m = await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await new Promise((r) => setTimeout(r, 800)); await RB.test.idle(); return RB.world.W.map.id; });
const t3 = await bell([], 0);
ok(m === 'lf.bellhall' && t3.runs.length === 0 && t3.g1 === t2.g1 && has(t3.said, MEANING) && t3.rung && t3.main === 9,
  '3 a save and load, the bell again: no exercise and no lesson, the meaning and the choice; Ring: rung, step 9 ' + flat({ m, runs: t3.runs, rung: t3.rung, main: t3.main, map: t3.map }));
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await p.context().close();

await b.close();
srv.close();
console.log(`\nlf_bell_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
