// Otaki's guest book: "Come back later" is not the book read (Agnes 6642343825; Cloud CC-529; Local CL-697; Agnes
// 6643111905). In Chromium on the built game, on a throwaway journey (never a real save), at Nakayama with the book
// back from Sakashita, Mio in the party: Otaki talked to through the world's own interact; the reading left on the
// real exercise sheet by its own "Come back later" button (the test helper's answering switched off for it),
// answered by the helper otherwise; a save made and loaded through the game's own save and load:
//  1. the reading left: her two opening lines only, no reconciliation, no line from Mio, the book still in the bag,
//     step 1, Tatsu still there, the world's own controls back;
//  2. a save and load, then her talk again: the book read, the reconciliation and Mio's line once, the book taken,
//     the quest done, Tatsu gone;
//  3. then her usual talk, and nothing asked;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/cr_guest_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'cr_called', 'cr_st4', 'cr_guest_started', 'cr_guest_found'];

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async ({ DONE }) => {
  const f = {};
  for (const k of DONE) f[k] = true;
  const s = RB.game.debugStart('cr.nakayama', 8, 13, { comp: 'mio', dir: 'up', edition: 2, flags: f });
  s.quests.cr_guest = { stage: 1, done: false, t: 1 };
  s.inv = Object.assign(s.inv || {}, { cr_guestbook: 1 });
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
const talk = (leave) => p.evaluate(async ({ leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  const before = RB.game.mode();
  await RB.test.talk('cr_otaki');
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  const s = RB.game.s;
  RB.world.refreshActors();
  return { said: window.__said.slice(), runs: window.__runs.slice(), book: (s.inv || {}).cr_guestbook || 0, quest: s.quests.cr_guest.done ? 'done' : s.quests.cr_guest.stage, tatsu: RB.world.W.npcs.some((n) => n.id === 'cr_tatsu'), modes: [before, RB.game.mode()] };
}, { leave });
const has = (said, re) => said.some((x) => re.test(x));
const OPEN = /The guest book! Thank goodness/, SEIBE = /The Take stays open at night/, USUAL = /Welcome to the Matsuba/;
// the companion's line after the reconciliation (Mio's here; the unit test checks each companion's)
const COMP = /Read what's written|Both being right|The record's back|A ledger never lies/;

const t1 = await talk(['cr.guest_book']);
// (Agnes 6644061563: exactly her two opening lines, Mio's line absent, and the world's own mode, not only the mode before)
ok(flat(t1.runs) === flat([['cr.guest_book', false, true, 'Come back later']]) && has(t1.said, OPEN) && t1.said.length === 2 && !has(t1.said, SEIBE) && !has(t1.said, COMP) && t1.book === 1 && t1.quest === 1 && t1.tatsu && flat(t1.modes) === '["world","world"]',
  '1 the reading left by "Come back later": her two opening lines only, no reconciliation, no line from Mio, the book still in the bag, step 1, Tatsu still there, the world\'s controls back ' + flat({ runs: t1.runs, n: t1.said.length, book: t1.book, quest: t1.quest, tatsu: t1.tatsu, modes: t1.modes }));
const m = await p.evaluate(async () => { await RB.test.idle(); await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await new Promise((r) => setTimeout(r, 800)); await RB.test.idle(); return RB.world.W.map.id; });
const t2 = await talk([]);
ok(m === 'cr.nakayama' && flat(t2.runs) === flat([['cr.guest_book', true]]) && t2.said.filter((x) => SEIBE.test(x)).length === 1 && t2.said.filter((x) => COMP.test(x)).length === 1 && t2.book === 0 && t2.quest === 'done' && !t2.tatsu && t2.modes[1] === 'world',
  '2 a save and load, then her talk: the book read, the reconciliation and Mio\'s line once, the book taken, the quest done, Tatsu gone, the world\'s controls back ' + flat({ m, runs: t2.runs, book: t2.book, quest: t2.quest, tatsu: t2.tatsu }));
const t3 = await talk([]);
ok(has(t3.said, USUAL) && !t3.runs.length && !has(t3.said, SEIBE), '3 then her usual talk, and nothing asked ' + flat({ said: t3.said.slice(0, 1) }));
ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
await p.context().close();

await b.close();
srv.close();
console.log(`\ncr_guest_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
