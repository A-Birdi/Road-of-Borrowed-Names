// Genta's comic: "Come back later" is not a bit performed (Agnes 6572919095; Local CL-642; Cloud CC-479). In Chromium on
// the built game, on throwaway journeys (never a real save), on Playhouse Row: Genta talked to through the world's own
// interact; a bit to be left is played on the real challenge sheet with the test helper's answering switched off for it,
// and left by its own "Come back later" button; the others answered by the helper; saves made and loaded through the
// game's own save and load:
//  1. with Mio (Genta's own act), the second bit left: the first bit's laughter only, no second laugh, no third joke, no
//     praise, not done; a save and load; Genta's talk offers it again, and all three done give the whole ending once;
//  2. with Suzu (her act), the first bit left: nothing after it, not done, and not her act either; Genta's talk straight
//     away offers it again, and all three done give her thanks and the act;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/mp_comic_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const CH = ['mp.manzai_1', 'mp.manzai_2', 'mp.manzai_3'];
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mp_sobe_met', 'mp_theatre_seen'];

// Playhouse Row, every map's once-only arrival scene already seen; challenges named in window.__leave are played on the
// real sheet and left by "Come back later"
async function at(p, comp) {
  await p.evaluate(async ({ DONE, comp }) => {
    const f = {};
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart('mp.playhouse', 28, 16, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.mp_main = { stage: 4, done: false, t: 1 };
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
const state = (p) => p.evaluate((CH) => { const s = RB.game.s; return { done: !!s.flags.mp_manzai_done, suzuAct: !!s.flags.mp_ev_suzu_act, chal: CH.filter((c) => s.flags['chal:' + c]), genta: RB.world.W.npcs.some((n) => n.id === 'mp_genta') }; }, CH);
const talk = (p, leave) => p.evaluate(async (leave) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  if (!RB.world.W.npcs.some((n) => n.id === 'mp_genta')) return { said: [], runs: [], missing: true };
  await RB.test.talk('mp_genta'); await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
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
const BEATS = { joke1: /I brought three umbrellas/, giggles: /A ripple of giggles/, joke2: /I go for a run every morning/, child: /A child in the front row/, joke3: /crossed the chopsticks/, roars: /The house roars/, genta: /Great straight work/, suzu: /Thank you, partner/, talent: /An unexpected talent/ };
const heard = (said) => Object.keys(BEATS).filter((k) => said.some((x) => BEATS[k].test(x)));

// 1. Mio, the second bit left; a save and load; the retry
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'mio');
  const t1 = await talk(p, [CH[1]]);
  const s1 = await state(p);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['joke1', 'giggles', 'joke2']) && flat(t1.runs) === flat([[CH[0], true], [CH[1], false, true, 'Come back later']]) && !s1.done && flat(s1.chal) === flat([CH[0]]) && s1.genta,
    '1 Mio, the second bit left by "Come back later": the first laugh only, no second laugh, no third joke, no praise, not done ' + flat({ h: heard(t1.said), runs: t1.runs, s1 }));
  const m = await saveLoad(p);
  const t2 = await talk(p, []);
  const s2 = await state(p);
  ok(m === 'mp.playhouse' && !t2.missing && flat(t2.runs.map((r) => r[0])) === flat(CH) && flat(heard(t2.said)) === flat(['joke1', 'giggles', 'joke2', 'child', 'joke3', 'roars', 'genta', 'talent']) && s2.done && !s2.suzuAct && s2.chal.length === 3,
    '1 a save and load, then Genta\'s talk: the comic again, all three done, the whole ending once ' + flat({ m, h: heard(t2.said), s2 }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. Suzu, the first bit left; the retry straight away
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'suzu');
  const t1 = await talk(p, [CH[0]]);
  const s1 = await state(p);
  ok(!t1.missing && flat(heard(t1.said)) === flat(['joke1']) && flat(t1.runs) === flat([[CH[0], false, true, 'Come back later']]) && !s1.done && !s1.suzuAct && s1.chal.length === 0 && s1.genta,
    '2 Suzu, the first bit left: nothing after it, not done, and not her act ' + flat({ h: heard(t1.said), runs: t1.runs, s1 }));
  const t2 = await talk(p, []);
  const s2 = await state(p);
  ok(!t2.missing && flat(heard(t2.said)) === flat(['joke1', 'giggles', 'joke2', 'child', 'joke3', 'roars', 'suzu']) && s2.done && s2.suzuAct && s2.chal.length === 3,
    '2 Genta\'s talk straight away: the comic again, all three done, her thanks and the act ' + flat({ h: heard(t2.said), s2 }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nmp_comic_cancel: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
