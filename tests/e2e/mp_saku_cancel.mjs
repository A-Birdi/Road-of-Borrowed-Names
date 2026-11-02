// Sakutarō's rehearsal: "Come back later" is not his lines found (Local CL-641; Cloud CC-478; Agnes 6573166180). In
// Chromium on the built game, on throwaway journeys (never a real save), on Playhouse Row with "The Missing Lead Actor" at
// step 1: Sakutarō talked to through the world's own interact; the matinée line, when it is to be left, played on the
// real challenge sheet with the test helper's answering switched off for it and left by its own "Come back later"
// button; otherwise answered by the helper; saves made and loaded through the game's own save and load:
//  1. left: his request only, none of his closing lines, step 1 and not done, no journal line or reward; still by the
//     canal; then talked to again straight away: his closing lines, the quest done, and he has moved on;
//  2. after Manbē's rehearsal (the matinée line already done there) and the Understage: left, still nothing; a save and
//     load; then the retry: his line for after the Understage, and the quest done;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/mp_saku_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const CH = 'mp.rehearse_line';
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mp_sobe_met', 'mp_theatre_seen'];

// Playhouse Row, "The Missing Lead Actor" at step 1, every map's once-only arrival scene already seen; challenges named
// in window.__leave are played on the real sheet and left by "Come back later"
async function at(p, extra) {
  await p.evaluate(async ({ DONE, extra }) => {
    const f = {};
    for (const k of DONE.concat(extra || [])) f[k] = true;
    const s = RB.game.debugStart('mp.playhouse', 30, 25, { comp: 'mio', dir: 'up', edition: 2, flags: f });
    s.quests.mp_main = { stage: 4, done: false, t: 1 };
    s.quests.mp_actor = { stage: 1, done: false, t: 2 };
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
  }, { DONE, extra });
}
const state = (p) => p.evaluate((CH) => { const s = RB.game.s; const q = s.quests.mp_actor; return { stage: q.stage, done: !!q.done, reward: !!s.flags.mp_actor_done, journal: (s.journal || []).length, chal: !!s.flags['chal:' + CH], saku: RB.world.W.npcs.some((n) => n.id === 'mp_saku') }; }, CH);
// (Sakutarō not there to talk to is reported, not thrown: on a build without the guard a cancelled rehearsal has finished)
const talk = (p, leave) => p.evaluate(async (leave) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  if (!RB.world.W.npcs.some((n) => n.id === 'mp_saku')) return { said: [], runs: [], missing: true };
  await RB.test.talk('mp_saku'); await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice(), missing: false };
}, leave);
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const BEATS = { request: /From the afternoon show's lines/, before: /The part's name is still blank/, after: /The part's name was back in the script already/, on: /As Sakutarō, my own name/ };
const heard = (said) => Object.keys(BEATS).filter((k) => said.some((x) => BEATS[k].test(x)));

// 1. left; talked to again straight away
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, []);
  const t1 = await talk(p, [CH]);
  const s1 = await state(p);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['request']) && flat(t1.runs) === flat([[CH, false, true, 'Come back later']]) && s1.stage === 1 && !s1.done && !s1.reward && s1.journal === 0 && !s1.chal && s1.saku,
    '1 the matinée line left by "Come back later": his request only, none of his closing lines, step 1 and not done, no journal or reward; still by the canal ' + flat({ h: heard(t1.said), runs: t1.runs, s1 }));
  const t2 = await talk(p, []);
  const s2 = await state(p);
  ok(!t2.missing && flat(heard(t2.said)) === flat(['request', 'before', 'on']) && s2.done && s2.reward && s2.journal === 1 && s2.chal && !s2.saku,
    '1 talked to again straight away: his closing lines, the quest done, and he has moved on ' + flat({ missing: t2.missing, h: heard(t2.said), s2 }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. after Manbē's rehearsal and the Understage: left; a save and load; the retry
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, ['mp_rehearsal_done', 'chal:' + CH, 'mp_under_done']);
  const t1 = await talk(p, [CH]);
  const s1 = await state(p);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['request']) && t1.runs.length === 1 && t1.runs[0][2] && !s1.done && !s1.reward && s1.journal === 0 && s1.saku,
    '2 the matinée line already done in Manbē\'s rehearsal, left here: still nothing, and he is still there ' + flat({ h: heard(t1.said), runs: t1.runs, s1 }));
  const m = await saveLoad(p);
  const t2 = await talk(p, []);
  const s2 = await state(p);
  ok(m === 'mp.playhouse' && !t2.missing && flat(heard(t2.said)) === flat(['request', 'after', 'on']) && s2.done && s2.reward && s2.journal === 1 && !s2.saku,
    '2 a save and load, then the retry: his line for after the Understage, the quest done, and he has moved on ' + flat({ m, missing: t2.missing, h: heard(t2.said), s2 }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nmp_saku_cancel: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
