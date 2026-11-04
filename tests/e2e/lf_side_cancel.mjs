// Lanternfall's side quests: "Come back later" is not the exercise done (Agnes 6639438614, findings 1, 9 and 12; Cloud
// CC-522, CC-525; Local CL-689, CL-690; Agnes 6639995441). In Chromium on the built game, on throwaway journeys (never
// a real save), in Lanternfall at step 3 of its main story: the people talked to and the noticeboard used through the
// world's own interact; an exercise to be left is played on the real exercise sheet with the test helper's answering
// switched off for it, and left by its own "Come back later" button; the others answered by the helper; saves made and
// loaded through the game's own save and load:
//  1. Hayato, with Mio: his greeting and request; the form left: the quest started, no red pen, no struck line, the
//     form not left in his hand, the world's own controls back; a save and load; then his request only (no second
//     greeting), the form done: the line struck, the pen, the quest done; then his finished line;
//  2. Umi's log, before the bell, with Nao: the log left from the noticeboard: no answer, the step at 0; then the
//     noticeboard again, the log done: her answer, step 1;
//  3. the fence, after the bell, with Ren: the settlement left with Kohei: step 3, no persimmons; then Kinu, done: the
//     settlement and the persimmons, the quest done;
//  4. Hayato after the ending (Agnes 6641658152; Local CL-695), a synthetic test: the postgame milestone set directly,
//     not a played ending. The form left, a save and load, then the milestone: his talk is his request only (no
//     second greeting), left again, the form not left in his hand, the controls back; then done: the line struck, the
//     pen once, the quest done; then his postgame line;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/lf_side_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro'];

// a Lanternfall map at main step 3, every map's once-only arrival scene already seen; exercises named in window.__leave
// are played on the real sheet and left by "Come back later"
async function at(p, map, x, y, comp, flags, quests) {
  await p.evaluate(async ({ DONE, map, x, y, comp, flags, quests }) => {
    const f = Object.assign({}, flags);
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart(map, x, y, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.lf_main = { stage: 3, done: false, t: 1 };
    for (const [k, v] of Object.entries(quests || {})) s.quests[k] = { stage: v, done: false, t: 1 };
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
  }, { DONE, map, x, y, comp, flags, quests });
}
const act = (p, how, leave) => p.evaluate(async ({ how, leave }) => {
  window.__said = []; window.__runs = []; window.__leave = new Set(leave || []);
  await RB.test.idle();
  const before = RB.game.mode();
  if (how.talk) await RB.test.talk(how.talk); else await RB.test.use(how.x, how.y);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  const n = how.talk && RB.world.W.npcs.find((a) => a.id === how.talk);
  return { said: window.__said.slice(), runs: window.__runs.slice(), modeBefore: before, modeAfter: RB.game.mode(), held: n ? !!(n.stg && n.stg.held) : null };
}, { how, leave });
const state = (p) => p.evaluate(() => { const s = RB.game.s; const q = (id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : '-'); return { form: q('lf_form'), timetable: q('lf_timetable'), fence: q('lf_fence'), pen: (s.inv || {}).lf_red_pen || 0, hoshi: (s.inv || {}).lf_hoshigaki || 0, chal: Object.keys(s.flags).filter((k) => /^chal:lf\.ch_(form2|timetable|fence)$/.test(k)) }; });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const has = (said, re) => said.some((x) => re.test(x));
const B = {
  hello: /it's you from earlier/, post: /The application form is a page and a half now/, ask: /could you possibly take a quick look/, struck: /You draw one line|strikes the line out/, done: /approved it with "of course"/,
  umi: /That's my handwriting/, settle: /How about the line runs through the middle/, persimmons: /dried persimmons left from last year/,
};

// 1. Hayato, with Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.records', 8, 6, 'mio', {}, {});
  const t1 = await act(p, { talk: 'lf_hayato' }, ['lf.ch_form2']);
  const s1 = await state(p);
  ok(has(t1.said, B.hello) && has(t1.said, B.ask) && !has(t1.said, B.struck) && flat(t1.runs) === flat([['lf.ch_form2', false, true, 'Come back later']]) && s1.form === 0 && s1.pen === 0 && s1.chal.length === 0 && t1.held === false && t1.modeAfter === t1.modeBefore,
    '1 Hayato\'s form left by "Come back later": his greeting and request, then nothing more; the quest started, no pen, no chal: flag, the form not left in his hand, the controls back ' + flat({ runs: t1.runs, s1, held: t1.held, modes: [t1.modeBefore, t1.modeAfter] }));
  const m = await saveLoad(p);
  const t2 = await act(p, { talk: 'lf_hayato' }, []);
  const s2 = await state(p);
  ok(m === 'lf.records' && !has(t2.said, B.hello) && has(t2.said, B.ask) && has(t2.said, B.struck) && flat(t2.runs) === flat([['lf.ch_form2', true]]) && s2.form === 'done' && s2.pen === 1,
    '1 a save and load, then his talk: his request only, the form done, the line struck, the pen, the quest done ' + flat({ m, runs: t2.runs, s2 }));
  const t3 = await act(p, { talk: 'lf_hayato' }, []);
  ok(has(t3.said, B.done) && !t3.runs.length && (await state(p)).pen === 1, '1 then his finished line, and nothing asked ' + flat({ said: t3.said.slice(0, 2) }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. Umi's log, before the bell, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.ferry', 6, 5, 'nao', {}, { lf_timetable: 0 });
  const t1 = await act(p, { x: 7, y: 2 }, ['lf.ch_timetable']);
  const s1 = await state(p);
  ok(flat(t1.runs) === flat([['lf.ch_timetable', false, true, 'Come back later']]) && !has(t1.said, B.umi) && s1.timetable === 0 && t1.modeAfter === t1.modeBefore,
    '2 the log left from the noticeboard: no answer from Umi, the step at 0, the controls back ' + flat({ runs: t1.runs, s1 }));
  const t2 = await act(p, { x: 7, y: 2 }, []);
  const s2 = await state(p);
  ok(flat(t2.runs) === flat([['lf.ch_timetable', true]]) && has(t2.said, B.umi) && s2.timetable === 1,
    '2 the noticeboard again, the log done: her answer, step 1 ' + flat({ runs: t2.runs, s2 }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 3. the fence, after the bell, with Ren
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.gardens', 13, 9, 'ren', { lf_bell_rung: true }, { lf_fence: 2 });
  const t1 = await act(p, { talk: 'lf_kohei' }, ['lf.ch_fence']);
  const s1 = await state(p);
  ok(flat(t1.runs) === flat([['lf.ch_fence', false, true, 'Come back later']]) && !has(t1.said, B.settle) && s1.fence === 3 && s1.hoshi === 0 && t1.modeAfter === t1.modeBefore,
    '3 the settlement left with Kohei: no proposal, step 3, no persimmons, the controls back ' + flat({ runs: t1.runs, s1 }));
  const t2 = await act(p, { talk: 'lf_kinu' }, []);
  const s2 = await state(p);
  ok(flat(t2.runs) === flat([['lf.ch_fence', true]]) && has(t2.said, B.settle) && has(t2.said, B.persimmons) && s2.fence === 'done' && s2.hoshi === 1,
    '3 then Kinu, done: the settlement and the persimmons, the quest done ' + flat({ runs: t2.runs, s2 }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 4. Hayato after the ending (synthetic: the postgame milestone set directly)
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.records', 8, 6, 'mio', {}, {});
  const t1 = await act(p, { talk: 'lf_hayato' }, ['lf.ch_form2']);
  const m = await saveLoad(p);
  await p.evaluate(async () => { const s = RB.game.s; s.flags.lf_bell_rung = true; s.flags.postgame = true; RB.world.refreshActors(); await RB.test.idle(); });
  const t2 = await act(p, { talk: 'lf_hayato' }, ['lf.ch_form2']);
  const s2 = await state(p);
  ok(flat(t1.runs) === flat([['lf.ch_form2', false, true, 'Come back later']]) && m === 'lf.records' && !has(t2.said, B.hello) && !has(t2.said, B.post) && has(t2.said, B.ask) && !has(t2.said, B.struck) && flat(t2.runs) === flat([['lf.ch_form2', false, true, 'Come back later']]) && s2.form === 0 && s2.pen === 0 && t2.held === false && t2.modeAfter === t2.modeBefore,
    '4 the form left, a save and load, the ending (synthetic): his request only, not his postgame line; left again: the quest still started, no pen, the form not left in his hand, the controls back ' + flat({ m, runs: t2.runs, s2, held: t2.held }));
  const t3 = await act(p, { talk: 'lf_hayato' }, []);
  const s3 = await state(p);
  ok(!has(t3.said, B.hello) && has(t3.said, B.ask) && has(t3.said, B.struck) && flat(t3.runs) === flat([['lf.ch_form2', true]]) && s3.form === 'done' && s3.pen === 1 && t3.held === false,
    '4 then done: the line struck, the pen once, the quest done ' + flat({ runs: t3.runs, s3 }));
  const t4 = await act(p, { talk: 'lf_hayato' }, []);
  ok(has(t4.said, B.post) && !t4.runs.length && (await state(p)).pen === 1, '4 then his postgame line, and nothing asked ' + flat({ said: t4.said.slice(0, 1) }));
  ok(!errors.length, '4 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nlf_side_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
