// The council after the bell and Kinu's fence, in Chromium (editorial row 1: Cloud CC-523 note 1 and CC-525; Agnes
// 6639995441; Local CL-689). On the built game, on throwaway journeys (never a real save): Kohei and Tami talked to
// through the world's own interact; the fence's exercise answered by the test helper, or played on the real exercise
// sheet and left by its own "Come back later" button; the move to the Council Chamber by the game's own transition;
// a save made and loaded through the game's own save and load:
//  1. the fence settled through Kohei, with Suzu; a save and load; then the council: Kinu doesn't raise the fence, no
//     "Next week!", Tami's "…Next item. The Archive up the mountain." once; the rest of the council as before, and
//     the chapter ends;
//  2. the fence unsettled (step 2), with Nao: Kinu raises it, Tami's "Next week!", not the new line;
//  3. the fence left at its exercise, with Ren: step 3; then the council: as unsettled;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/lf_council_fence.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_bell_rung', 'lf_after_town'];

async function at(p, map, x, y, comp, quests) {
  await p.evaluate(async ({ DONE, map, x, y, comp, quests }) => {
    const f = {};
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart(map, x, y, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.lf_main = { stage: 7, done: false, t: 1 };
    for (const [k, v] of Object.entries(quests || {})) s.quests[k] = { stage: v, done: false, t: 1 };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.test.enable({});
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
      try { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok), !!(r && r.cancelled), label]); return r; } finally { clearInterval(tick); RB.test.enable({}); }
    };
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push([l.who || 'narr', l.en || '']); return say.apply(this, arguments); };
  }, { DONE, map, x, y, comp, quests });
}
const act = (p, who, leave) => p.evaluate(async ({ who, leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  await RB.test.talk(who);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice(), mode: RB.game.mode(), map: RB.world.W.map.id };
}, { who, leave });
const toCouncil = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.game.transition('lf.council', 7, 8, 'up', {});
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const state = (p) => p.evaluate(() => { const s = RB.game.s; const q = (id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : '-'); return { fence: q('lf_fence'), main: q('lf_main'), ch5: !!s.flags.ch5_done }; });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const count = (said, re, who) => said.filter(([w, en]) => re.test(en) && (!who || w === who)).length;
const B = {
  kinu: /^Madam Chair, regarding the fence!$/, nextWeek: /^Next week! …Next item\. The Archive up the mountain\.$/, next: /^…Next item\. The Archive up the mountain\.$/,
  order: /^Order! …Not that anyone's quieting down/, comply: /^Now I can say it\. I am unable to comply\.$/, back: /^One for, one against\. …Good\. The council is back\.$/,
};
const view = (t) => ({ kinu: count(t.said, B.kinu, 'lf_kinu'), nextWeek: count(t.said, B.nextWeek, 'lf_yae'), next: count(t.said, B.next, 'lf_yae'), order: count(t.said, B.order), comply: count(t.said, B.comply), back: count(t.said, B.back), mode: t.mode });

// 1. settled through Kohei, with Suzu; a save and load; the council
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.gardens', 13, 9, 'suzu', { lf_fence: 2 });
  const k = await act(p, 'lf_kohei');
  const s1 = await state(p);
  ok(flat(k.runs) === flat([['lf.ch_fence', true]]) && s1.fence === 'done', '1 the fence settled through Kohei: done ' + flat({ runs: k.runs, s1 }));
  const m1 = await saveLoad(p);
  const m2 = await toCouncil(p);
  const c = await act(p, 'lf_yae');
  const v = view(c), s2 = await state(p);
  ok(m1 === 'lf.gardens' && m2 === 'lf.council' && v.kinu === 0 && v.nextWeek === 0 && v.next === 1 && v.order === 1 && v.comply === 1 && v.back === 1 && v.mode === 'world' && s2.main === 'done' && s2.ch5,
    '1 a save and load, then the council: Kinu doesn\'t raise the fence, no "Next week!", Tami\'s "…Next item." once; the rest as before; the chapter ends ' + flat({ m1, m2, v, s2 }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. unsettled (step 2), with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.council', 7, 8, 'nao', { lf_fence: 2 });
  const c = await act(p, 'lf_yae');
  const v = view(c), s = await state(p);
  ok(v.kinu === 1 && v.nextWeek === 1 && v.next === 0 && v.order === 1 && v.comply === 1 && v.back === 1 && s.fence === 2 && s.main === 'done',
    '2 unsettled: Kinu raises the fence, Tami\'s "Next week!", not the new line ' + flat({ v, s }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 3. left at its exercise, with Ren
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.gardens', 13, 9, 'ren', { lf_fence: 2 });
  const k = await act(p, 'lf_kohei', ['lf.ch_fence']);
  const s1 = await state(p);
  await toCouncil(p);
  const c = await act(p, 'lf_yae');
  const v = view(c);
  ok(flat(k.runs) === flat([['lf.ch_fence', false, true, 'Come back later']]) && s1.fence === 3 && v.kinu === 1 && v.nextWeek === 1 && v.next === 0,
    '3 the fence left by "Come back later": step 3; then the council as unsettled ' + flat({ runs: k.runs, s1, v }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nlf_council_fence: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
