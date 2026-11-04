// The Cloudroad's everlasting lamps: "Come back later" is not the name said (Agnes 6639438614, findings 14 and 15;
// Cloud CC-522, CC-525; Local CL-689; Agnes 6639995441). In Chromium on the built game, on a throwaway journey (never a
// real save), at Oiwake with the relay's ledger, Ren in the party: the lamp used through the world's own interact; the
// naming left on the real exercise sheet by its own "Come back later" button (the test helper's answering switched off
// for it), answered by the helper otherwise; the departure reached by walking onto its own trigger; a save made and
// loaded through the game's own save and load:
//  1. the lamp left: not lit, no name called, the palanquin not there, the world's own controls back;
//  2. the departure walked onto: it asks for the lamp first, and you stay at the station;
//  3. a save and load, the lamp again, named: lit, the name called once, the palanquin there;
//  4. the departure walked onto: past the lamp (no asking for it), the plan made, and on to the first leg;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/cr_lamp_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'cr_called', 'cr_given1', 'cr_st1'];

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async ({ DONE }) => {
  const f = {};
  for (const k of DONE) f[k] = true;
  const s = RB.game.debugStart('cr.oiwake', 28, 12, { comp: 'ren', dir: 'up', edition: 2, flags: f });
  s.inv = Object.assign(s.inv || {}, { cr_ledger: 1 });
  for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
  RB.game.settings.textSpeed = 'instant';
  const opts = { choose: () => 0 };
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
const look = () => p.evaluate(() => { const s = RB.game.s, W = RB.world.W; const live = W.map.props.filter((q) => !q.if || RB.state.test(s, q.if)); return { lit: !!s.flags.cr_lamp1, kago: live.some((q) => q.scene === 'cr.ride'), dark: live.some((q) => q.scene === 'cr.lamp1'), mode: RB.game.mode(), map: W.map.id, x: W.player.x }; });
const lamp = (leave) => p.evaluate(async ({ leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  await RB.test.use(29, 10);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice() };
}, { leave });
const depart = () => p.evaluate(async () => {
  window.__said = []; window.__runs = [];
  await RB.test.idle();
  RB.test.place(33, 12, 'right');
  await RB.test.step('right');
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 600)); await RB.test.idle();
  return { said: window.__said.slice(), map: RB.world.W.map.id };
});
const has = (said, re) => said.some((x) => re.test(x));
const LIT = /light comes up in the paper windows/, ASK = /give the station's lamp its name back/;

const t1 = await lamp(['cr.name1']);
const l1 = await look();
ok(flat(t1.runs) === flat([['cr.name1', false, true, 'Come back later']]) && !has(t1.said, LIT) && !l1.lit && l1.dark && !l1.kago && l1.mode === 'world',
  '1 the lamp left by "Come back later": not lit, no name called, the dark lamp still there, no palanquin, the controls back ' + flat({ runs: t1.runs, l1 }));
const d1 = await depart();
ok(has(d1.said, ASK) && d1.map === 'cr.oiwake', '2 the departure walked onto: it asks for the lamp first, and you stay at the station ' + flat({ said: d1.said.slice(0, 2), map: d1.map }));
const m = await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await new Promise((r) => setTimeout(r, 800)); await RB.test.idle(); return RB.world.W.map.id; });
const t3 = await lamp([]);
const l3 = await look();
ok(m === 'cr.oiwake' && flat(t3.runs) === flat([['cr.name1', true]]) && t3.said.filter((x) => LIT.test(x)).length === 1 && l3.lit && !l3.dark && l3.kago,
  '3 a save and load, the lamp named: lit, the name called once, the palanquin there ' + flat({ m, runs: t3.runs, l3 }));
const d2 = await depart();
ok(!has(d2.said, ASK) && has(d2.said, /weigh what you've heard/) && d2.map === 'cr.leg1', '4 the departure walked onto: past the lamp, the plan made, and on to the first leg ' + flat({ said: d2.said.slice(0, 2), map: d2.map }));
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await p.context().close();

await b.close();
srv.close();
console.log(`\ncr_lamp_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
