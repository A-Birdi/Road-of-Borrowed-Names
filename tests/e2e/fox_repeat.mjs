// Three Tellings of the Fox Bridge, talking to Shōzō again once they are settled (Local CL-560; Cloud CC-402; Agnes
// 6546934577). In Chromium on the built game, on throwaway journeys (never a real save), Shōzō talked to as a player does
// (pressed at him, the automated player answering as asked):
//  1. settled, before the chapter's end: he says only "The board's being painted now.", twice; no choice offered, no
//     opening line, no quest toast; the quest, the chosen telling and the board as they were;
//  2. the whole route in one journey: before it is settled, the opening and the register; read, the comparison; settled
//     (the tellings answered by the automated player); then talked to again: only the board's line;
//  3. after the chapter's end, settled: his after-chapter talk, as before;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/fox_repeat.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const KR = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_fox_seen: true, kr_shozo_met: true };
const REG = 'Ask to see the hamlet\'s register.', CMP = 'Compare the tellings.';
const BOARD = 'The board\'s being painted now.';
const OPEN = /All three say something different/;

// as tests/e2e/kr_fox_route.mjs: a journey at the Fox Bridge, the automated player answering each choice as asked
async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart('kr.fox', 5, 12, { dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    s.comp = null;
    if (o.quest) s.quests.kr_fox = o.quest;
    Object.assign(s.vars, o.vars || {});
    for (const k of o.seen || []) s.seen[k] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    window.__want = []; window.__offered = [];
    RB.test.enable({ choose: (opts) => { window.__offered.push(opts.map((x) => x.en)); const w = window.__want.shift(); const i = opts.findIndex((x) => x.en === w); return i >= 0 ? i : opts.findIndex((x) => /^Later/.test(x.en)); } });
    await new Promise((r) => setTimeout(r, 800));
    RB.world.refreshActors();
    window.__said = []; window.__toasts = [];
    const say = RB.ui.dialogue.say, toast = RB.ui.toast;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
    RB.ui.toast = function (x) { if (x && x.kind) window.__toasts.push(x.kind + ':' + (x.en || '')); return toast.apply(this, arguments); };
  }, o);
}
const talk = (p, want) => p.evaluate(async (want) => {
  window.__said = []; window.__offered = []; window.__toasts = []; window.__want = want.slice();
  await RB.test.talk('kr_shozo'); await RB.test.idle();
  const s = RB.game.s;
  return { said: window.__said.slice(), offered: window.__offered.slice(), q: s.quests.kr_fox || null, board: !!s.flags.kr_fox_board, telling: (s.vars.tell_kr || {}).t_fox || null, toasts: window.__toasts.slice() };
}, want);

// 1. settled, before the chapter's end
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: Object.assign({ kr_record_read: true, kr_fox_board: true }, KR), quest: { stage: 99, done: true, t: 1 }, seen: ['kr.kame', 'kr.fox_shrine'], vars: { tell_kr: { t_fox: 'record' } } });
  const a = await talk(p, [CMP]);
  const c = await talk(p, [CMP]);
  ok(flat(a.said) === flat([BOARD]) && flat(c.said) === flat([BOARD]) && !a.offered.length && !c.offered.length && !a.toasts.length && !c.toasts.length,
    '1 settled, before the chapter\'s end: only the board\'s line, twice; no choice, no opening, no toast ' + flat({ a: a.said, c: c.said, offered: a.offered.concat(c.offered) }));
  ok(c.q && c.q.done && c.board && c.telling === 'record', '1 the quest, the chosen telling and the board as they were ' + flat({ q: c.q, telling: c.telling, board: c.board }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. the whole route in one journey, then talked to again
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: KR, quest: { stage: 0, done: false, t: 1 }, seen: ['kr.kame', 'kr.fox_shrine'] });
  const r = await talk(p, [REG, CMP]);
  const again = await talk(p, [CMP]);
  ok(OPEN.test(r.said[0] || '') && flat(r.offered) === flat([[REG, 'Later.'], [CMP, 'Later.']]) && r.q && r.q.done && r.board && r.toasts.filter((x) => /^quest_done:/.test(x)).length === 1,
    '2 before it is settled: the opening, the register, the comparison, settled once ' + flat({ said0: r.said[0], offered: r.offered, toasts: r.toasts }));
  ok(flat(again.said) === flat([BOARD]) && !again.offered.length && !again.toasts.length, '2 then talked to again: only the board\'s line ' + flat(again));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3. after the chapter's end, settled
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: Object.assign({ kr_done: true, kr_record_read: true, kr_fox_board: true }, KR), quest: { stage: 99, done: true, t: 1 }, vars: { tell_kr: { t_fox: 'both' } } });
  const runs = await p.evaluate(async () => {
    const r = [], run0 = RB.script.run;
    RB.script.run = function (id) { r.push(id); return run0.apply(this, arguments); };
    try { await RB.test.talk('kr_shozo'); await RB.test.idle(); } finally { RB.script.run = run0; }
    return r;
  });
  ok(runs[0] === 'kr.shozo_after', '3 after the chapter\'s end: his after-chapter talk, as before ' + flat(runs.slice(0, 3)));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nfox_repeat: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
