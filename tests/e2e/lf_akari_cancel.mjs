// Row A in Chromium (Agnes 6639438614; Cloud CC-522, CC-525, CC-526; Local CL-693, CL-695; Agnes 6640720415,
// 6641781747): Akari's letters and Tadashi's form. On the built game, on throwaway journeys (never a real save): the
// people talked to through the world's own interact; an exercise to be left is played on the real exercise sheet with
// the test helper's answering switched off for it, and left by its own "Come back later" button; the others answered by
// the helper; each choice picked as listed; saves made and loaded through the game's own save and load; the ending is a
// synthetic postgame flag, not a played ending:
//  1. Akari before the bell, with Nao: the first telling, Not now: her story and apology, the letter kept; her talk:
//     the letter given and left: no reading, the letter kept, the controls back, the letter not left in your hand; a
//     save and load; then given: the reading once, the letter gone;
//  2. Akari after the ending (synthetic), with Mio: the letter put off before the bell, a save and load, the ending;
//     her talk is the informed offer, not her after-the-ending line; given and left; then given: the reading and her
//     news; her own letter left: step 2, she stays; then her request only, done once; then her after-the-ending line;
//  3. Tadashi, with Ren: his welcome and the form left: step 1, no slip, the form not left in his hand, the controls
//     back; then your request only, the form done: the slip;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/lf_akari_cancel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro'];

// a Lanternfall map, every map's once-only arrival scene already seen; exercises named in window.__leave are played
// on the real sheet and left by "Come back later"; window.__picks are the choices, in order (0 when they run out)
async function at(p, map, x, y, comp, flags, quests, inv) {
  await p.evaluate(async ({ DONE, map, x, y, comp, flags, quests, inv }) => {
    const f = Object.assign({}, flags);
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart(map, x, y, { comp, dir: 'up', edition: 2, flags: f });
    for (const [k, v] of Object.entries(quests || {})) s.quests[k] = { stage: v, done: false, t: 1 };
    s.inv = Object.assign(s.inv || {}, inv || {});
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    window.__picks = [];
    window.__offered = [];
    const opts = { choose: (o) => { window.__offered.push(o.map((x) => x.en)); return window.__picks.length ? window.__picks.shift() : 0; } };
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
  }, { DONE, map, x, y, comp, flags, quests, inv });
}
const act = (p, who, leave, picks) => p.evaluate(async ({ who, leave, picks }) => {
  window.__said = []; window.__runs = []; window.__offered = []; window.__leave = new Set(leave || []); window.__picks = (picks || []).slice();
  await RB.test.idle();
  const before = RB.game.mode();
  await RB.test.talk(who);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  const n = RB.world.W.npcs.find((a) => a.id === who), pc = RB.world.W.player;
  return { said: window.__said.slice(), runs: window.__runs.slice(), offered: window.__offered.slice(), modes: [before, RB.game.mode()], held: n ? !!(n.stg && n.stg.held) : null, pcHeld: !!(pc && pc.stg && pc.stg.held) };
}, { who, leave, picks });
const state = (p) => p.evaluate(() => { const s = RB.game.s; const q = (id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : '-'); return { akari: q('lf_akari'), main: q('lf_main'), letter: (s.inv || {}).sb_reply_letter || 0, slip: (s.inv || {}).lf_request_slip || 0, leave: !!s.flags.lf_akari_leave }; });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const has = (said, re) => said.some((x) => re.test(x));
const count = (said, re) => said.filter((x) => re.test(x)).length;
const B = {
  story: /Every letter I write comes back "address unknown"/, sorry: /I'm sorry\. Telling a visitor all this/, give: /I've brought a letter from your father/, father: /Father's handwriting\. It shakes a little/,
  news: /Listen! This morning I turned down overtime/, ask2: /Would you check the address with me/, leave: /I'll have to scold him/, post: /I got back from leave yesterday/,
  welcome: /Welcome to the Public Records Hall/, ask: /I'd like to look into the bell tower in the lake/, received: /Duly received/,
};
const GIVE = 'Give her Hoshino\'s letter', NOW = 'Not now', GOON = 'Go on without giving her Hoshino\'s letter';
const LEFT = (id) => flat([[id, false, true, 'Come back later']]);

// 1. Akari before the bell, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.clerks', 5, 6, 'nao', {}, { lf_main: 1 }, { sb_reply_letter: 1 });
  const t1 = await act(p, 'akari', [], [1]);
  const s1 = await state(p);
  ok(flat(t1.offered) === flat([[GIVE, NOW]]) && has(t1.said, B.story) && has(t1.said, B.sorry) && !has(t1.said, B.give) && s1.letter === 1 && s1.akari === 0,
    '1 the first telling before the bell, Not now: her story and apology, the letter kept ' + flat({ offered: t1.offered, s1 }));
  const t2 = await act(p, 'akari', ['lf.ch_akari_addr'], [0]);
  const s2 = await state(p);
  ok(flat(t2.offered) === flat([[GIVE, NOW]]) && !has(t2.said, B.story) && has(t2.said, B.give) && !has(t2.said, B.father) && flat(t2.runs) === LEFT('lf.ch_akari_addr') && s2.letter === 1 && t2.modes[1] === 'world' && !t2.pcHeld,
    '1 her talk: the letter given and left by "Come back later": no reading, the letter kept, the world\'s controls back, the letter not left in your hand ' + flat({ runs: t2.runs, s2, modes: t2.modes, pcHeld: t2.pcHeld }));
  const m = await saveLoad(p);
  const t3 = await act(p, 'akari', [], [0]);
  const s3 = await state(p);
  ok(m === 'lf.clerks' && count(t3.said, B.father) === 1 && flat(t3.runs) === flat([['lf.ch_akari_addr', true]]) && s3.letter === 0,
    '1 a save and load, then given: the reading once, the letter gone ' + flat({ m, runs: t3.runs, s3 }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. Akari after the ending (synthetic), with Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.clerks', 5, 6, 'mio', {}, { lf_main: 1 }, { sb_reply_letter: 1 });
  await act(p, 'akari', [], [1]);
  const m = await saveLoad(p);
  await p.evaluate(async () => { const s = RB.game.s; s.flags.lf_bell_rung = true; s.flags.postgame = true; s.quests.lf_main = { stage: 9, done: true, t: 1 }; RB.world.refreshActors(); await RB.test.idle(); });
  const t1 = await act(p, 'akari', ['lf.ch_akari_addr'], [0]);
  const s1 = await state(p);
  ok(m === 'lf.clerks' && flat(t1.offered) === flat([[GIVE, GOON]]) && !has(t1.said, B.post) && has(t1.said, B.give) && !has(t1.said, B.news) && flat(t1.runs) === LEFT('lf.ch_akari_addr') && s1.letter === 1 && s1.akari === 1 && t1.modes[1] === 'world',
    '2 the letter put off before the bell, a save and load, the ending: her talk is the informed offer, not her after-the-ending line; given and left: the end, step 1, the letter kept ' + flat({ m, offered: t1.offered, runs: t1.runs, s1 }));
  const t2 = await act(p, 'akari', ['lf.ch_akari_addr2'], [0]);
  const s2 = await state(p);
  ok(count(t2.said, B.father) === 1 && count(t2.said, B.news) === 1 && count(t2.said, B.ask2) === 1 && !has(t2.said, B.leave) && flat(t2.runs) === flat([['lf.ch_akari_addr', true], ['lf.ch_akari_addr2', false, true, 'Come back later']]) && s2.letter === 0 && s2.akari === 2 && !s2.leave && t2.modes[1] === 'world',
    '2 then given: the reading and her news; her own letter left: step 2, she stays ' + flat({ runs: t2.runs, s2 }));
  const t3 = await act(p, 'akari', [], []);
  const s3 = await state(p);
  ok(!t3.offered.length && !has(t3.said, B.news) && count(t3.said, B.ask2) === 1 && count(t3.said, B.leave) === 1 && flat(t3.runs) === flat([['lf.ch_akari_addr2', true]]) && s3.akari === 'done' && s3.leave,
    '2 then her request only, done once ' + flat({ runs: t3.runs, s3 }));
  const t4 = await act(p, 'akari', [], []);
  ok(has(t4.said, B.post) && !t4.runs.length, '2 then her after-the-ending line, and nothing asked ' + flat({ said: t4.said.slice(0, 1) }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 3. Tadashi, with Ren
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'lf.records', 8, 6, 'ren', {}, { lf_main: 0 }, {});
  const t1 = await act(p, 'lf_tadashi', ['lf.ch_form'], []);
  const s1 = await state(p);
  ok(has(t1.said, B.welcome) && has(t1.said, B.ask) && !has(t1.said, B.received) && flat(t1.runs) === LEFT('lf.ch_form') && s1.main === 1 && s1.slip === 0 && t1.held === false && t1.modes[1] === 'world',
    '3 Tadashi: his welcome and your request; the form left: step 1, no slip, the form not left in his hand, the world\'s controls back ' + flat({ runs: t1.runs, s1, held: t1.held, modes: t1.modes }));
  const t2 = await act(p, 'lf_tadashi', [], []);
  const s2 = await state(p);
  ok(!has(t2.said, B.welcome) && count(t2.said, B.ask) === 1 && count(t2.said, B.received) === 1 && flat(t2.runs) === flat([['lf.ch_form', true]]) && s2.slip === 1,
    '3 then your request only, the form done: the slip ' + flat({ runs: t2.runs, s2 }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nlf_akari_cancel: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
