// The bell tower's three gate plates: "Come back later" is not the plate read (QA-191; Cloud CC-610; Agnes 6913897483;
// Local CL-848). In Chromium on the built game, on throwaway journeys (never a real save), inside the tower at
// "read each gate plate" (lf_main step 7), Nao with you: each plate, wheel and lever used through the world's own
// interact; a plate's reading challenge, when it is to be left, played on the real challenge sheet with the test
// helper's answering switched off for it and left by its own "Come back later" button; otherwise answered by the
// helper; every choice its first option (turn the wheel, pull the plug, open or close the door); saves made and loaded
// through the game's own save and load. For each plate (A on the Upper Floor, B in the Gate Works, C on the Drowned
// Stair), two journeys:
//  1. left, and never read: the plate's first line only, no _read flag and no rule; then (A) the lower wheel stuck says
//     "read it first" and no read commentary, (B) the west plug stuck says "a plate on the north wall" and not the
//     recalled line; then the gate worked in its right order all the same: open, the plate still not read;
//  2. left; a save and load: not read, and the plate asks again (left again); then read: the rule and the flag; then
//     (A) the lower wheel stuck gives Nao's commentary, (B) the west plug stuck gives the recalled line; then the gate
//     worked in its right order: open;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/lf_plate_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_yae_told', 'lf_tokuji_told', 'lf_tokuji_boat', 'lf_akari_key', 'lf_stacks_open', 'lf_ledger_seen',
  'lf_conduit_seen', 'lf_tower_entered'];

const PLATES = [
  { k: 'A', map: 'lf.tower_upper', at: [10, 10], plate: [5, 2], ch: 'lf.ch_gate1', flag: 'lf_plate_a_read', pre: [], first: /^A bronze plate, engraved with instructions for the gates\.$/,
    rule: /^"Unless the upper gate is closed, the lower gate will not open\."$/, stuck: [17, 9], unread: /^There's a bronze plate on the wall nearby\. Better read it first\.$/,
    read: /^"Unless it's closed, it won't open\." Upper first\.$/, gate: [[2, 5], [17, 9]], open: 'lf_gate_a' },
  { k: 'B', map: 'lf.tower_mid', at: [10, 4], plate: [9, 3], ch: 'lf.ch_gate2', flag: 'lf_plate_b_read', pre: ['lf_gate_a', 'lf_mid_seen', 'lf_shortcut'], first: /^The second bronze plate\. More writing on this one\.$/,
    rule: /^"Unless the east door is open, the west plug cannot be pulled\."$/, stuck: [1, 8], unread: /^There's a plate on the north wall\.$/,
    read: /^You recall the plate's first line: "Unless the east door is open, the west plug cannot be pulled\."$/, gate: [[20, 8], [1, 8], [20, 8]], open: 'lf_gate_b' },
  { k: 'C', map: 'lf.tower_low', at: [10, 4], plate: [3, 2], ch: 'lf.ch_gate3', flag: 'lf_plate_c_read', pre: ['lf_gate_a', 'lf_gate_b', 'lf_mid_seen', 'lf_shortcut', 'lf_mid_drained'], first: /^The third plate\.$/,
    rule: /^"Until the south plug is pulled, the north plug must not be touched\."$/, stuck: null, gate: [[2, 14], [16, 3]], open: 'lf_gate_c' },
];

async function at(p, P) {
  await p.evaluate(async ({ BASE, P }) => {
    const f = {};
    for (const k of BASE.concat(P.pre)) f[k] = true;
    RB.game.settings.textSpeed = 'instant';
    const s = RB.game.debugStart(P.map, P.at[0], P.at[1], { comp: 'nao', dir: 'up', edition: 2, flags: f });
    s.quests.lf_main = { stage: 7, done: false, t: 1 };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
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
  }, { BASE, P });
}
const use = (p, xy, leave) => p.evaluate(async ({ xy, leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  await RB.test.use(xy[0], xy[1]); await RB.test.idle(); await new Promise((r) => setTimeout(r, 300)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice() };
}, { xy, leave });
const flags = (p, names) => p.evaluate((names) => Object.fromEntries(names.map((n) => [n, !!RB.game.s.flags[n]])), names);
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const has = (said, re) => said.some((x) => re.test(x));
const cancelled = (u, ch) => u.runs.length === 1 && u.runs[0][0] === ch && u.runs[0][2] === true && u.runs[0][3] === 'Come back later';

for (const P of PLATES) {
  // 1. left, and never read
  {
    const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await at(p, P);
    const u1 = await use(p, P.plate, [P.ch]);
    const f1 = await flags(p, [P.flag]);
    ok(cancelled(u1, P.ch) && u1.said.length === 1 && P.first.test(u1.said[0]) && !has(u1.said, P.rule) && !f1[P.flag],
      P.k + '1 plate ' + P.k + ' left by "Come back later": its first line only; no flag, no rule ' + flat({ said: u1.said, runs: u1.runs, f1 }));
    if (P.stuck) {
      const u2 = await use(p, P.stuck, []);
      ok(has(u2.said, P.unread) && !has(u2.said, P.read), P.k + '1 then stuck: the unread cue, not the read one ' + flat(u2.said));
    }
    for (const xy of P.gate) await use(p, xy, []);
    const f2 = await flags(p, [P.open, P.flag]);
    ok(f2[P.open] && !f2[P.flag], P.k + '1 the gate worked in its right order all the same: open, the plate still not read ' + flat(f2));
    ok(!errors.length, P.k + '1 no page errors ' + errors.slice(0, 2).join(' | '));
    await p.context().close();
  }
  // 2. left; saved and loaded; asked again; read
  {
    const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await at(p, P);
    const u1 = await use(p, P.plate, [P.ch]);
    const m = await saveLoad(p);
    const f1 = await flags(p, [P.flag]);
    const u2 = await use(p, P.plate, [P.ch]);
    ok(cancelled(u1, P.ch) && m === P.map && !f1[P.flag] && cancelled(u2, P.ch) && !has(u2.said, P.rule),
      P.k + '2 left, saved and loaded: not read, and the plate asks again ' + flat({ m, f1, u2 }));
    const u3 = await use(p, P.plate, []);
    const f2 = await flags(p, [P.flag]);
    ok(u3.runs.length === 1 && u3.runs[0][1] === true && has(u3.said, P.rule) && f2[P.flag], P.k + '2 then read: the rule and the flag ' + flat({ said: u3.said, runs: u3.runs }));
    if (P.stuck) {
      const u4 = await use(p, P.stuck, []);
      ok(has(u4.said, P.read) && !has(u4.said, P.unread), P.k + '2 then stuck: the read cue, not the unread one ' + flat(u4.said));
    }
    for (const xy of P.gate) await use(p, xy, []);
    const f3 = await flags(p, [P.open]);
    ok(f3[P.open], P.k + '2 the gate worked in its right order: open ' + flat(f3));
    ok(!errors.length, P.k + '2 no page errors ' + errors.slice(0, 2).join(' | '));
    await p.context().close();
  }
}

console.log(`\nlf_plate_cancel: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
