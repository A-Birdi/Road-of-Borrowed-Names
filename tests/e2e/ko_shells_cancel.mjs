// Kotonoha's conches: "Come back later" on the reading is not the telling heard (Agnes 6639438614, finding 13; Cloud
// CC-522, CC-525; Local CL-689; Agnes 6639995441). In Chromium on the built game, on a throwaway journey (never a real
// save), at the tide pools with two conches heard: the conches used through the world's own interact; the shells' sheet
// left by its own cancel button, and the reading left on the real exercise sheet by its own "Come back later" button
// (the test helper's answering switched off for each), answered by the helper otherwise; a save made and loaded through
// the game's own save and load:
//  1. the third conch, the sheet left: "Listen again later", no reading asked, nothing kept, the controls back;
//  2. the conch again, the sheet done, the reading left: "Listen again later", the sheet kept, no telling, no name;
//  3. a save and load, the first conch: no sheet, the reading only, done: the telling and Chitose's name;
//  4. a conch again: its own lines, nothing more;
//  5. with Mio (Agnes 6643454785; Local CL-698), the second conch the last heard: its sheet done, its reading left,
//     no companion's ending; a save and load; the third conch: the reading only, Mio's line once; the first conch:
//     its own lines, nothing more;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/ko_shells_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_arrived', 'ko_ch9', 'ko_otoha_met', 'ko_tell_otoha', 'ko_tell_nami', 'ko_tell_hamaji'];

// a throwaway journey at the tide pools with the companion and the conches already heard
async function open(comp, heard) {
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async ({ DONE, comp, heard }) => {
  const f = {};
  for (const k of DONE.concat(heard)) f[k] = true;
  const s = RB.game.debugStart('ko.tidepools', 24, 13, { comp, dir: 'up', edition: 2, flags: f });
  s.quests.ko_main = { stage: 3, done: false, t: 1 };
  for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
  RB.game.settings.textSpeed = 'instant';
  const opts = { choose: () => 0 };
  RB.test.enable(opts);
  window.__leave = new Set();
  window.__runs = [];
  // a sheet named in window.__leave is played for real and left by its own button
  const leaving = async (sel, fn) => {
    RB.test.disable();
    let label = null;
    const tick = setInterval(() => {
      const teach = document.querySelector('.teach [data-ok]');
      if (teach && teach.offsetParent) { teach.click(); return; }
      const el = document.querySelector(sel);
      if (el && el.offsetParent) { label = el.textContent.trim(); el.click(); }
    }, 150);
    try { return [await fn(), label]; } finally { clearInterval(tick); RB.test.enable(opts); }
  };
  const run = RB.challenge.run;
  RB.challenge.run = async function (id) {
    if (!window.__leave.has(id)) { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok)]); return r; }
    const [r, label] = await leaving('.chal [data-a=leave]', () => run.apply(this, arguments));
    window.__runs.push([id, !!(r && r.ok), !!(r && r.cancelled), label]); return r;
  };
  const shells = RB.hooks.shells;
  RB.hooks.shells = async function (a) {
    if (!window.__leave.has('sheet')) { await shells.apply(this, arguments); window.__runs.push(['sheet', RB.game.s.vars._shells]); return; }
    const [, label] = await leaving('.sh-cancel', () => shells.apply(this, arguments));
    window.__runs.push(['sheet', RB.game.s.vars._shells, label]);
  };
  await new Promise((r) => setTimeout(r, 900));
  RB.world.refreshActors();
  window.__said = [];
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
}, { DONE, comp, heard });
return { p, errors };
}
const conch = (p, x, y, leave) => p.evaluate(async ({ x, y, leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  await RB.test.use(x, y);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  const s = RB.game.s;
  return { said: window.__said.slice(), runs: window.__runs.slice(), told: !!s.flags.ko_tell_shell, kept: !!s.flags['shells_ko.s_first'], mode: RB.game.mode(), sheet: !!document.querySelector('.sh-cancel'), map: RB.world.W.map.id };
}, { x, y, leave });
const has = (said, re) => said.some((x) => re.test(x));
const LATER = /Listen again later/, NAME = /Chitose\. The first keeper had a name/;

const { p, errors } = await open('ren', ['ko_shell_a', 'ko_shell_b']);
const t1 = await conch(p, 24, 11, ['sheet']);
ok(t1.runs.length === 1 && t1.runs[0][0] === 'sheet' && t1.runs[0][1] === 'cancel' && has(t1.said, LATER) && !t1.told && !t1.kept && t1.mode === 'world' && !t1.sheet,
  '1 the third conch, the sheet left by its own button: "Listen again later", no reading asked, nothing kept, the controls back ' + flat({ runs: t1.runs, told: t1.told, kept: t1.kept, mode: t1.mode }));
const t2 = await conch(p, 24, 11, ['ko.shells_read']);
ok(flat(t2.runs) === flat([['sheet', 'ok'], ['ko.shells_read', false, true, 'Come back later']]) && has(t2.said, LATER) && !has(t2.said, NAME) && !t2.told && t2.kept && t2.mode === 'world',
  '2 the conch again, the sheet done, the reading left by "Come back later": "Listen again later", the sheet kept, no telling, no name ' + flat({ runs: t2.runs, told: t2.told, kept: t2.kept }));
const m = await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await new Promise((r) => setTimeout(r, 800)); await RB.test.idle(); return RB.world.W.map.id; });
const t3 = await conch(p, 7, 9, []);
ok(m === 'ko.tidepools' && flat(t3.runs) === flat([['ko.shells_read', true]]) && has(t3.said, NAME) && !has(t3.said, LATER) && t3.told,
  '3 a save and load, the first conch: no sheet, the reading only, done: the telling and Chitose\'s name ' + flat({ m, runs: t3.runs, told: t3.told }));
const t4 = await conch(p, 18, 15, []);
ok(t4.runs.length === 0 && !has(t4.said, NAME) && !has(t4.said, LATER) && t4.said.length === 2 && t4.told,
  '4 a conch again: its own two lines, nothing more ' + flat({ runs: t4.runs, said: t4.said.length }));
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await p.context().close();

// 5. with Mio, the second conch the last heard
{
  const { p, errors } = await open('mio', ['ko_shell_a', 'ko_shell_c']);
  const MIO = /Even if it never arrived, it was true/;
  const u1 = await conch(p, 18, 15, ['ko.shells_read']);
  ok(flat(u1.runs) === flat([['sheet', 'ok'], ['ko.shells_read', false, true, 'Come back later']]) && has(u1.said, LATER) && !has(u1.said, MIO) && !has(u1.said, NAME) && !u1.told && u1.kept && u1.mode === 'world',
    '5 with Mio, the second conch last: the sheet done, the reading left, no telling, no ending of hers ' + flat({ runs: u1.runs, told: u1.told }));
  const m2 = await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await new Promise((r) => setTimeout(r, 800)); await RB.test.idle(); return RB.world.W.map.id; });
  const u2 = await conch(p, 24, 11, []);
  ok(m2 === 'ko.tidepools' && flat(u2.runs) === flat([['ko.shells_read', true]]) && u2.said.filter((x) => MIO.test(x)).length === 1 && has(u2.said, NAME) && u2.told,
    '5 a save and load, the third conch: the reading only, the telling, Mio\'s line once ' + flat({ m2, runs: u2.runs, told: u2.told }));
  const u3 = await conch(p, 7, 9, []);
  ok(u3.runs.length === 0 && !has(u3.said, MIO) && u3.said.length === 2, '5 the first conch: its own two lines, nothing more ' + flat({ said: u3.said.length }));
  ok(!errors.length, '5 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nko_shells_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
