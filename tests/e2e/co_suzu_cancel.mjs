// Suzu's first words: "Come back later" is not the truth told (QA-186; Cloud CC-610; Agnes 6913897483; Local CL-848). In
// Chromium on the built game, on throwaway journeys (never a real save), in the Glass Workshop of Cinder Orchard with
// "A Seat Kept Until Spring" at step 3 and the Kiln done: Suzu and Hiro talked to through the world's own interact; her
// first-line challenge, when it is to be left, played on the real challenge sheet with the test helper's answering
// switched off for it and left by its own "Come back later" button; otherwise answered by the helper; saves made and
// loaded through the game's own save and load (Suzu's way of speaking set first, so loading asks nothing):
//  A. Nao with you, the globe carried: Suzu in the workshop, left: the first telling and her request only, no Hiro
//     line, the globe kept, not done, no autosave; she is still there; then Hiro's talk, left: her request only, still
//     nothing; a save and load: she is still there and still nothing; then Suzu again: her request and the whole
//     ending once, and she has gone;
//  B. Suzu with you, the Kiln page already with Tokiwa: Hiro's talk, left: the first telling and her request only, no
//     assembly, still in the workshop; a save and load; Hiro's talk again: her request, the ending, and the assembly,
//     which goes on to the festival;
//  C. a success with no cancel first (Nao, the globe): the lines spoken, as a fingerprint to compare with the parent's
//     page;
//  the song asked for after a cancel and after the ending is printed (recorded, not judged); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/co_suzu_cancel.mjs
import { createHash } from 'node:crypto';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const CH = 'co.c_suzu';
const DONE = ['departed', 'ch1_done', 'ch2_done', 'co_chronicle_read', 'co_kiln_done'];

// the Glass Workshop, the quest at step 3; challenges named in window.__leave are played on the real sheet and left by
// "Come back later"
async function at(p, o) {
  await p.evaluate(async ({ DONE, o }) => {
    const f = {};
    for (const k of DONE.concat(o.page ? ['co_tokiwa_page'] : [])) f[k] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.suzuSpeech = 'standard';
    const s = RB.game.debugStart('co.glass', 6, 7, { comp: o.comp, dir: 'up', edition: 2, flags: f });
    s.quests.co_main = { stage: 7, done: false, t: 1 };
    s.quests.co_suzu = { stage: 3, done: false, t: 2 };
    if (o.globe) RB.state.give(s, 'co_globe', 1);
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
    window.__autosaves = 0;
    const as = RB.save.autosave;
    RB.save.autosave = function () { window.__autosaves++; return as.apply(this, arguments); };
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push([l.who || '', l.en || '']); return say.apply(this, arguments); };
  }, { DONE, o });
}
const state = (p) => p.evaluate(() => {
  const s = RB.game.s, q = s.quests.co_suzu;
  return { done: !!s.flags.co_suzu_done, qdone: !!q.done, globe: s.inv.co_globe || 0, handed: !!s.flags.co_hiro_globe, told: !!s.flags.co_suzu_told,
    ledger: s.notebook.filter((n) => n.id === 'co_suzu_ledger').length, assembly: !!s.seen['co.assembly'], map: RB.world.W.map.id,
    suzuThere: RB.world.W.npcs.some((n) => n.id === 'suzu'), autosaves: window.__autosaves, song: RB.audio.currentSong ? RB.audio.currentSong() : null,
    mapSong: RB.world.musicFor(RB.world.W.map.def, s) || null };
});
// (someone not there to talk to is reported, not thrown: on a build without the guard a cancelled scene has finished)
const talk = (p, who, leave) => p.evaluate(async ({ who, leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []); window.__autosaves = 0;
  await RB.test.idle();
  if (!RB.world.W.npcs.some((n) => n.id === who)) return { said: [], runs: [], missing: true };
  await RB.test.talk(who); await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice(), missing: false };
}, { who, leave });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  window.__autosaves = 0;
  return RB.world.W.map.id;
});
const BEATS = { brief: /That boy is Hiro/, request: /help me with one thing\. The first line/, furnace: /The furnace hums low/, globe: /We found this at the back of the kiln/ };
const heard = (said) => Object.keys(BEATS).filter((k) => said.some((x) => BEATS[k].test(x[1])));
const hiro = (said) => said.filter((x) => x[0] === 'hiro').length;
const nothing = (s) => !s.done && !s.qdone && !s.handed && !s.assembly && s.autosaves === 0 && s.map === 'co.glass';
const cancelled = (runs) => runs.length === 1 && runs[0][0] === CH && runs[0][2] === true && runs[0][3] === 'Come back later';

// A. Nao with you, the globe carried
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { comp: 'nao', globe: true });
  const s0 = await state(p);
  const t1 = await talk(p, 'suzu', [CH]);
  const s1 = await state(p);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['brief', 'request']) && t1.said.length === 3 && hiro(t1.said) === 0 && cancelled(t1.runs) && nothing(s1) && s1.globe === 1 && s1.told && s1.ledger === 1 && s1.suzuThere,
    'A Suzu in the workshop, left by "Come back later": the first telling and her request only, no Hiro line, the globe kept, not done, no autosave; she is still there ' + flat({ h: heard(t1.said), n: t1.said.length, runs: t1.runs, s1 }));
  console.log('     music: before ' + s0.song + ' (the workshop\'s own: ' + s0.mapSong + '), after the cancel ' + s1.song);
  const t2 = await talk(p, 'hiro', [CH]);
  const s2 = await state(p);
  ok(!t2.missing && flat(heard(t2.said)) === flat(['request']) && t2.said.length === 1 && cancelled(t2.runs) && nothing(s2) && s2.globe === 1 && s2.ledger === 1 && s2.suzuThere,
    'A then Hiro\'s talk, left: her request only (the first telling is not repeated), still nothing ' + flat({ h: heard(t2.said), n: t2.said.length, runs: t2.runs, s2 }));
  const m = await saveLoad(p);
  const s3 = await state(p);
  ok(m === 'co.glass' && nothing(s3) && s3.globe === 1 && s3.told && s3.suzuThere, 'A saved and loaded: still in the workshop, she is still there, and still nothing ' + flat(s3));
  const t3 = await talk(p, 'suzu', []);
  const s4 = await state(p);
  ok(!t3.missing && t3.said.length > 0 && BEATS.request.test(t3.said[0][1]) && flat(heard(t3.said)) === flat(['request', 'furnace', 'globe']) && hiro(t3.said) > 0 && t3.runs.length === 1 && t3.runs[0][1] === true &&
    s4.done && s4.qdone && s4.handed && s4.globe === 0 && s4.autosaves === 1 && !s4.assembly && !s4.suzuThere,
    'A then Suzu again: her request, then the whole ending once (the globe handed over, done, one autosave); she has gone ' + flat({ h: heard(t3.said), n: t3.said.length, runs: t3.runs, s4 }));
  console.log('     music: after the ending ' + s4.song);
  ok(!errors.length, 'A no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// B. Suzu with you, the Kiln page with Tokiwa
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { comp: 'suzu', page: true });
  const t1 = await talk(p, 'hiro', [CH]);
  const s1 = await state(p);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['brief', 'request']) && t1.said.length === 3 && hiro(t1.said) === 0 && cancelled(t1.runs) && nothing(s1) && !s1.suzuThere,
    'B Hiro\'s talk with Suzu, the page with Tokiwa, left: the first telling and her request only, no assembly, still in the workshop ' + flat({ h: heard(t1.said), n: t1.said.length, runs: t1.runs, s1 }));
  console.log('     music: after the cancel ' + s1.song + ' (the workshop\'s own: ' + s1.mapSong + ')');
  const m = await saveLoad(p);
  const t2 = await talk(p, 'hiro', []);
  const s2 = await state(p);
  ok(m === 'co.glass' && !t2.missing && t2.said.length > 0 && BEATS.request.test(t2.said[0][1]) && !heard(t2.said).includes('brief') && heard(t2.said).includes('furnace') && hiro(t2.said) > 0 &&
    t2.runs.length >= 1 && t2.runs[0][0] === CH && t2.runs[0][1] === true && s2.done && s2.qdone && s2.assembly && s2.map === 'co.festival' && s2.autosaves >= 1,
    'B saved and loaded, Hiro\'s talk again: her request, the ending, and the assembly, which goes on to the festival ' + flat({ m, h: heard(t2.said), n: t2.said.length, runs: t2.runs, s2 }));
  console.log('     music: after the ending and the assembly ' + s2.song);
  ok(!errors.length, 'B no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// C. a success with no cancel first
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { comp: 'nao', globe: true });
  const t1 = await talk(p, 'suzu', []);
  const s1 = await state(p);
  const fp = createHash('sha256').update(flat({ said: t1.said, runs: t1.runs })).digest('hex').slice(0, 16);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['brief', 'request', 'furnace', 'globe']) && s1.done && s1.handed && s1.autosaves === 1 && !s1.suzuThere,
    'C a success with no cancel first: the first telling, her request and the whole ending; fp=' + fp + ' lines=' + t1.said.length);
  ok(!errors.length, 'C no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nco_suzu_cancel: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
