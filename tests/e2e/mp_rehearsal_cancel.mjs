// Manbē's rehearsal: "Come back later" is not a finished rehearsal (Agnes 6572551337; Local CL-640; Cloud CC-477). In
// Chromium on the built game, on throwaway journeys (never a real save), on Playhouse Row at step 3 of the main story:
// Manbē talked to through the world's own interact; a challenge to be left is played on the real challenge sheet with the
// test helper's answering switched off for it, and left by its own "Come back later" button; the others answered by the
// helper; saves made and loaded through the game's own save and load:
//  1. the blocking left: Manbē's opening line only, no praise or next task, none of the ending, step 3, no flags or
//     journal line, and no chal: flag for it;
//  2. with Suzu, the prompt-book left after the first two done: their praise, then nothing of the ending (not her line
//     about pencilled names either); only the first two chal: flags;
//  3. a save and load, then Manbē's talk again: the rehearsal from the blocking, all three done, the whole ending once,
//     step 4 and its journal line, and Manbē gone from the stage door's spot as before;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/mp_rehearsal_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const CH = ['mp.rehearse_block', 'mp.rehearse_line', 'mp.rehearse_book'];
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mp_sobe_met', 'mp_theatre_seen'];

// Playhouse Row at step 3, every map's once-only arrival scene already seen; challenges named in window.__leave are
// played on the real sheet and left by "Come back later"
async function at(p, comp) {
  await p.evaluate(async ({ DONE, comp }) => {
    const f = {};
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart('mp.playhouse', 22, 14, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.mp_main = { stage: 3, done: false, t: 1 };
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
  }, { DONE, comp });
}
const state = (p) => p.evaluate((CH) => { const s = RB.game.s; return { stage: s.quests.mp_main.stage, done: !!s.flags.mp_rehearsal_done, fest: !!s.flags.mp_fest_heard, journal: (s.journal || []).length, chal: CH.filter((c) => s.flags['chal:' + c]), manbe: RB.world.W.npcs.some((n) => n.id === 'mp_manbe') }; }, CH);
// (Manbē not there to talk to is reported, not thrown: on a build without the guard a cancelled rehearsal has finished)
const talk = (p, leave) => p.evaluate(async (leave) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  if (!RB.world.W.npcs.some((n) => n.id === 'mp_manbe')) return { said: [], runs: [], missing: true };
  await RB.test.talk('mp_manbe'); await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
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
const BEATS = { opening: /Blocking first/, praise1: /Yes, now we can see it/, task3: /Last, the prompt-book/, places: /One by one the actors find their places/, moves: /The play moves again/, tomi: /help Tomi of the committee/, suzu: /A name pencilled in/ };
const heard = (said) => Object.keys(BEATS).filter((k) => said.some((x) => BEATS[k].test(x)));

// 1 and 3: the blocking left; a save and load; the retry
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'ren');
  const t1 = await talk(p, [CH[0]]);
  const s1 = await state(p);
  ok(flat(heard(t1.said)) === flat(['opening']) && flat(t1.runs) === flat([[CH[0], false, true, 'Come back later']]) && s1.stage === 3 && !s1.done && !s1.fest && s1.journal === 0 && s1.chal.length === 0 && s1.manbe,
    '1 the blocking left by "Come back later": his opening line only, no praise, none of the ending, step 3, no flags or journal, no chal: flag, Manbē still there ' + flat({ h: heard(t1.said), runs: t1.runs, s1 }));
  const m = await saveLoad(p);
  const t2 = await talk(p, []);
  const s2 = await state(p);
  ok(m === 'mp.playhouse' && flat(t2.runs.map((r) => r[0])) === flat(CH) && t2.runs.every((r) => r[1]) && flat(heard(t2.said)) === flat(['opening', 'praise1', 'task3', 'places', 'moves', 'tomi']) && s2.stage === 4 && s2.done && s2.fest && s2.journal === 1 && s2.chal.length === 3 && !s2.manbe,
    '3 a save and load, then his talk: the rehearsal from the blocking, all three done, the whole ending once, step 4 and its journal line, and Manbē gone from here as before ' + flat({ m, runs: t2.runs, h: heard(t2.said), s2 }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2: with Suzu, the prompt-book left after the first two done
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'suzu');
  const t1 = await talk(p, [CH[2]]);
  const s1 = await state(p);
  ok(flat(heard(t1.said)) === flat(['opening', 'praise1', 'task3']) && flat(t1.runs.map((r) => r.slice(0, 2))) === flat([[CH[0], true], [CH[1], true], [CH[2], false]]) && t1.runs[2][2] && s1.stage === 3 && !s1.done && s1.journal === 0 && flat(s1.chal) === flat(CH.slice(0, 2)),
    '2 with Suzu, the prompt-book left after the first two: their praise, then nothing of the ending, not her line either; only the first two flagged ' + flat({ h: heard(t1.said), runs: t1.runs, s1 }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nmp_rehearsal_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
