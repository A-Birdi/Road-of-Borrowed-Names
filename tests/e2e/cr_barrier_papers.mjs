// The Barrier papers, in Chromium (editorial row 4: Agnes 6644985524; Cloud CC-532; Local CL-700; Agnes 6645340596).
// On the built game, on throwaway journeys (never a real save): Sumi and Ujie talked to through the world's own
// interact in the Barrier office, their exercises answered by the test helper; a save made and loaded through the
// game's own save and load:
//  1. with Ren: Ujie before Sumi: he sends you to her, without the line; Sumi; a save and load; Ujie: the narrator's
//     "Ujie unfolds the papers. The names you wrote at Sumi's table have gone. The paper is blank again." once, before
//     his first line; the interview; fetching; then Ujie again: his regards to Lady Shizu, without the line;
//  2. with Mio: Sumi, then Ujie: the line once, first;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/cr_barrier_papers.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done'];

async function at(p, comp) {
  await p.evaluate(async ({ DONE, comp }) => {
    const f = {};
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart('cr.barrier_office', 8, 7, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.cr_main = { stage: 4, done: false, t: 1 };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.test.enable({});
    window.__runs = [];
    const run = RB.challenge.run;
    RB.challenge.run = async function (id) { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok)]); return r; };
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push([l.who || 'narr', l.en || '']); return say.apply(this, arguments); };
  }, { DONE, comp });
}
const act = (p, who) => p.evaluate(async (who) => {
  window.__said = []; window.__runs = [];
  await RB.test.idle();
  await RB.test.talk(who);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice(), mode: RB.game.mode() };
}, who);
const state = (p) => p.evaluate(() => { const s = RB.game.s; return { seals: !!s.flags.cr_seals_checked, fetching: !!s.flags.cr_fetching, main: s.quests.cr_main.done ? 'done' : s.quests.cr_main.stage }; });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const B = { line: /^Ujie unfolds the papers\. The names you wrote at Sumi's table have gone\. The paper is blank again\.$/, first: /^I am Ujie, keeper of the Mist Barrier/, sumiFirst: /^Please show your papers to Sumi first\.$/,
  regards: /^Please give my regards to Lady Shizu of Kumoi\.$/ };
const count = (said, re) => said.filter(([, en]) => re.test(en)).length;
const idx = (said, re) => said.findIndex(([, en]) => re.test(en));

// 1. with Ren
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'ren');
  const u0 = await act(p, 'cr_ujie');
  ok(count(u0.said, B.sumiFirst) === 1 && count(u0.said, B.line) === 0, '1 Ujie before Sumi: he sends you to her, without the line ' + flat(u0.said));
  const s0 = await act(p, 'cr_sumi');
  const st0 = await state(p);
  const m = await saveLoad(p);
  const u1 = await act(p, 'cr_ujie');
  const st1 = await state(p);
  ok(st0.seals && m === 'cr.barrier_office' && count(u1.said, B.line) === 1 && idx(u1.said, B.line) === 0 && idx(u1.said, B.first) === 1 && u1.said[0][0] === 'narr' &&
    flat(u1.runs) === flat([['cr.interview', true]]) && st1.fetching && st1.main === 5 && u1.mode === 'world',
    '1 Sumi, a save and load, then Ujie: the line once, before his first; the interview; fetching ' + flat({ sumi: s0.runs, m, first: u1.said.slice(0, 2), runs: u1.runs, st1 }));
  const u2 = await act(p, 'cr_ujie');
  ok(count(u2.said, B.regards) === 1 && count(u2.said, B.line) === 0, '1 then Ujie again (fetching): his regards, without the line ' + flat(u2.said));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. with Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'mio');
  await act(p, 'cr_sumi');
  const u = await act(p, 'cr_ujie');
  ok(count(u.said, B.line) === 1 && idx(u.said, B.line) === 0 && idx(u.said, B.first) === 1, '2 with Mio: Sumi, then Ujie: the line once, first ' + flat(u.said.slice(0, 2)));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\ncr_barrier_papers: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
