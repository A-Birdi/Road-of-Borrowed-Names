// The Upper House front desk, told as it is (Agnes 6553467222, 6553636474; Local CL-594; Cloud CC-430). In Chromium on
// the built game, on throwaway journeys (never a real save), Tokuzō's desk taken from his own scene (yn.rooms_start),
// each guest's words answered right in choice mode:
//  1. every step right first time: the end ("How it ended") names the groups (Oshige, the four villagers and Yasuke have
//     rooms tonight; the traveller has booked Plum from tomorrow) and never says every newcomer has a room for the
//     night; the record above it has the fuller done line; then Tokuzō thanks tonight's guests, once, on screen in
//     English, his Japanese as before; the room under the stairs, a towel and a yukata, yn_main at 3;
//  2. a wrong turn put right at every step: the same end and the same thanks;
//  3. one step taken, then stepped away (cancelled): no end, no thanks, nothing given, no flag, yn_main still at 2; the
//     scene ends there (a step-away ends it: src/engine/70_script.js), nothing said after the desk, as before;
//  no bare kanji in the end; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/yn_desk_copy.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const assert = (c, m) => { if (!c) throw new Error(m); };
const flat = (x) => JSON.stringify(x);
const CONC = 'Oshige, the four villagers and Yasuke have rooms tonight. The traveller has booked Plum from tomorrow.';
const DONE = 'Every newcomer has a room tonight, and the man without a booking has the Plum room from tomorrow.';
const THANKS = 'Everyone staying tonight is safely in their room. …Thank you. Truly.';
const TOKUZO_JP = '{皆|みな}さま 、 {無事|ぶじ} に お{部屋|へや} へ 。 …… ありがとう ございました 。 {本当|ほんとう} に 。';
const ASK = 'Could you hear what each guest would like and choose a room that suits? I\'ll write out the tags.';

async function bareKanji(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    for (const rootEl of document.querySelectorAll(scope)) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!/[一-鿿々]/.test(n.nodeValue)) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], [aria-hidden="true"]')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out;
  }, scope);
}
// a twelve-chapter journey in Steamhollow, Chapter 11 under way, at the Upper House's desk
async function start(p, o) {
  await p.evaluate((o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_called: true, yn_arrived: true, yn_rokubei_met: true };
    const s = RB.game.debugStart('yn.upper', 20, 14, { comp: o.comp, flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
    s.quests.yn_main = { stage: 2, done: false };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
    // the lines the dialogue is given, kept for the test (the dialogue itself runs as usual)
    window.__lines = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l.who || '', jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
    const run = RB.challenge.runStep;
    RB.challenge.runStep = function (step) { window.__step = step; return run.apply(this, arguments); };
  }, o || {});
}
// answer the open language step correctly in choice mode
async function answer(p) {
  await p.waitForSelector('.chal');
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  if (await p.evaluate(() => document.querySelector('.chal').getAttribute('data-kind') === 'order')) {
    const want = await p.evaluate(() => window.__step.answer.map((x) => RB.tasks.plain(x).replace(/\s/g, '')));
    for (const piece of want) {
      const i = await p.evaluate((piece) => { const t = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); }; return [...document.querySelectorAll('.chal .tiles .tile')].findIndex((b) => t(b) === piece); }, piece);
      assert(i >= 0, 'no piece ' + piece);
      await p.click('.chal .tiles .tile >> nth=' + i);
    }
    await p.click('.chal [data-a=submit]');
  } else {
    await p.waitForSelector('.chal .mc .btn');
    const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
    for (let k = 0; k < n; k++) {
      await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
      await p.waitForTimeout(80);
      if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    }
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// a confirmation that may or may not come
const maybeConfirm = async (p, re) => {
  for (let k = 0; k < 30; k++) {
    if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) {
      await p.evaluate((m) => { const xs = [...document.querySelectorAll('.csheet .pbtn')]; (xs.find((x) => new RegExp(m, 'i').test(x.textContent)) || xs[0]).click(); }, re);
      return true;
    }
    if (await p.evaluate(() => !!document.querySelector('.enc-end') || (!!document.querySelector('.enc-card') && !document.querySelector('.chal')) || !document.querySelector('.enc-sheet'))) return false;
    await p.waitForTimeout(100);
  }
  return false;
};
// one card by its English, its language step answered, until the record moves on (or the desk is over)
async function play(p, label) {
  await p.waitForSelector('.enc-card');
  const before = await p.evaluate(() => (document.querySelector('.enc-log') || {}).textContent || '');
  const found = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && x.textContent.replace(/\s+/g, ' ').includes(m)); if (c) c.click(); return !!c; }, label);
  assert(found, 'no card "' + label + '": ' + await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 60)).join(' | ')));
  if (await p.evaluate(() => new Promise((r) => setTimeout(() => r(!!document.querySelector('.chal')), 400)))) await answer(p);
  for (let k = 0; k < 3; k++) if (!(await maybeConfirm(p, 'Nothing this time'))) break;
  await p.waitForFunction((b) => !!document.querySelector('.enc-end') || (!!document.querySelector('.enc-card') && ((document.querySelector('.enc-log') || {}).textContent || '') !== b), before, { timeout: 20000 });
}
// Tokuzō's scene through the game: its dialogue advanced, the desk played by the plan ('away': stepped away)
async function scene(p, plan) {
  await p.evaluate(() => { window.__done = false; window.__screens = []; RB.script.run('yn.rooms_start').then(() => { window.__done = true; }); });
  const out = { ends: [], logs: [], kanji: [] };
  plan = plan.slice();
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate(() => ({ done: window.__done, open: RB.ui.dialogue.isOpen(), screen: (document.querySelector('.dlg:not(.hidden)') || {}).textContent || '', end: !!document.querySelector('.enc-end'), card: !!document.querySelector('.enc-card') && !document.querySelector('.chal') && !document.querySelector('.csheet'), choice: document.querySelectorAll('.choices:not(.hidden) button').length }));
    if (st.done) return out;
    if (st.end) {
      out.ends.push(await p.evaluate(() => document.querySelector('.enc-end').textContent.replace(/\s+/g, ' ').trim()));
      out.logs.push(await p.evaluate(() => (document.querySelector('.enc-log') || {}).textContent || ''));
      out.kanji.push(...await bareKanji(p, '.enc-end'));
      await p.click('.enc-sheet [data-ok]');
      await p.waitForFunction(() => !document.querySelector('.enc-end'), null, { timeout: 10000 });
    } else if (st.card && plan.length) {
      const next = plan.shift();
      if (next === 'away') {
        await p.click('.enc-sheet [data-away]');
        assert(await maybeConfirm(p, '^Step away$'), 'no "Step away?" asked');
      } else await play(p, next);
    } else if (st.choice) await p.evaluate(() => document.querySelectorAll('.choices:not(.hidden) button')[0].click());
    else if (st.open) {
      await p.evaluate((sc) => { window.__screens.push(sc); }, st.screen);
      await p.evaluate(() => RB.ui.dialogue.advance(true));
    }
    await p.waitForTimeout(40);
  }
  throw new Error('the scene did not finish: ' + flat(plan));
}
const after = (p) => p.evaluate(() => {
  const s = RB.game.s;
  return { lines: window.__lines, screens: window.__screens, rooms: !!s.flags.yn_rooms_done, all: !!s.flags.yn_rooms_all, towel: !!s.inv.yn_towel, yukata: !!s.inv.yn_yukata, stage: s.quests.yn_main.stage };
});

async function done(name, wrongFirst, comp) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, { comp });
  const steps = await p.evaluate(() => RB.content.encounters['yn.rooms'].procedure.steps.map((st) => ({ good: st.actions.find((a) => a.ok).label.en, bad: st.actions.find((a) => !a.ok).label.en })));
  const plan = [];
  for (const st of steps) { if (wrongFirst) plan.push(st.bad); plan.push(st.good); }
  const r = await scene(p, plan);
  const a = await after(p);
  const end = r.ends[0] || '';
  ok(r.ends.length === 1 && end.includes(CONC) && !/for the night|every newcomer/i.test(end) && r.logs[0].includes(DONE) && !r.kanji.length,
    name + ': the end names the groups, never every newcomer for the night; the done line in the record above it; no bare kanji ' + flat({ end, done: r.logs[0] && r.logs[0].includes(DONE), kanji: r.kanji }));
  const thanks = a.lines.filter((l) => l.who === 'yn_tokuzo' && l.jp === TOKUZO_JP);
  const shown = a.screens.filter((x) => x.includes(THANKS)).length;
  ok(thanks.length === 1 && thanks[0].en === THANKS && shown >= 1 && !a.lines.some((l) => /safely in their rooms/.test(l.en)),
    name + ': then Tokuzō thanks tonight\'s guests, once, on screen in English; his Japanese as before ' + flat({ thanks: thanks.map((l) => l.en), shown }));
  ok(a.rooms && a.all && a.towel && a.yukata && a.stage === 3,
    name + ': the room under the stairs, a towel and a yukata, yn_main at 3, as before ' + flat({ rooms: a.rooms, all: a.all, towel: a.towel, yukata: a.yukata, stage: a.stage }));
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await done('1 right first time (Suzu with you)', false, 'suzu');
await done('2 a wrong turn put right at every step (Ren with you)', true, 'ren');

{
  const name = '3 one step, then stepped away';
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, { comp: 'mio' });
  const first = await p.evaluate(() => RB.content.encounters['yn.rooms'].procedure.steps[0].actions.find((a) => a.ok).label.en);
  const r = await scene(p, [first, 'away']);
  const a = await after(p);
  // (the lines before the desk: Tokuzō's two, and nothing after them)
  const last = a.lines.map((l) => l.en).lastIndexOf(ASK);
  ok(!r.ends.length && !a.lines.some((l) => l.who === 'yn_tokuzo' && (l.jp === TOKUZO_JP || l.en === THANKS)) && !a.screens.some((x) => x.includes(THANKS)) &&
    last >= 0 && last === a.lines.length - 1,
    name + ': no end and no thanks; the scene ends there, nothing said after the desk ' + flat({ ends: r.ends.length, after: a.lines.slice(last + 1).map((l) => l.en) }));
  ok(!a.rooms && !a.all && !a.towel && !a.yukata && a.stage === 2,
    name + ': nothing given, no flag, yn_main still at 2, as before ' + flat({ rooms: a.rooms, all: a.all, towel: a.towel, stage: a.stage }));
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nyn_desk_copy: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
