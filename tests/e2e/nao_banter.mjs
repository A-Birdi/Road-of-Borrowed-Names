// Nao's bond talk on the way to the Still Archive, sa.b_nao1 (Agnes 6556069393; Local CL-604, CL-606; Cloud CC-443). In
// Chromium on the built game, at the Archive's camp (a rest stop), on throwaway journeys (never a real save), talking to
// Nao through the game's own talk, its rest menu read and answered with the real buttons:
//  1. before Kasane is met, the letter delivered: the menu offers "Just chat", and choosing it plays this talk, its
//     two lines in their new English ("…Think her father will answer her reply?", "It's fine if no reply comes.");
//  2. before Kasane, the letter not delivered (stage 1): no "Just chat" (no banter here before Kasane);
//  3. after Kasane, the letter delivered: "Just chat" plays the next banter, never this one;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/nao_banter.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, lf_bell_rung: true };

async function at(p, quest, flags) {
  await p.evaluate(([quest, flags]) => {
    RB.game.inBattle = () => false;
    const s = RB.game.debugStart('sa.camp', 13, 15, { edition: RB.edition.forNew(), comp: 'nao', dir: 'up', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.seen['sa.camp_first'] = true;
    if (quest === 'done') { RB.state.setQuest(s, 'lf_nao', 'done'); s.flags.lf_nao_done = true; } else if (quest != null) RB.state.setQuest(s, 'lf_nao', quest);
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    // the two journey reflections already heard (they would otherwise take this talk first), and none pending
    const talk = s.company.talk;
    for (const id of ['reflect:travel', 'reflect:keep']) talk[id] = { st: 'done' };
    talk._pending = null;
    RB.company.sync(s, 'live'); RB.company.refresh(s); RB.bus.emit('company:changed', {});
    window.__pending = RB.company.pending(s);
    window.__runs = [];
    if (!RB.script.run.__rec) { const r = RB.script.run; RB.script.run = function (id, ...a) { window.__runs.push(String(id)); return r.call(this, id, ...a); }; RB.script.run.__rec = true; }
  }, [quest, Object.assign({}, FLAGS, flags || {})]);
  await p.waitForTimeout(600);
  return p.evaluate(() => window.__pending);
}
// play a dialogue through with real clicks on Next
async function playThrough(p) {
  const lines = [];
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ ch: document.querySelectorAll('.choices:not(.hidden) .choice').length, dlg: !!document.querySelector('.dlg:not(.hidden)'), run: RB.script.isRunning(), line: (document.querySelector('.dlg:not(.hidden)') || {}).textContent || '' }));
    if (st.ch) break;
    if (st.dlg) { lines.push(st.line.replace(/\s+/g, ' ')); await p.locator('.dlg .b-next').click(); await p.waitForTimeout(90); continue; }
    if (!st.run) break;
    await p.waitForTimeout(80);
  }
  return lines;
}
// talking to Nao: the rest menu's choices; then the named one pressed (or Not now) and the dialogue played through
async function talkToNao(p, want) {
  await p.evaluate(() => { window.__runs.length = 0; RB.game.companionTalk(); });
  await p.waitForSelector('.choices:not(.hidden) .choice', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(200);
  const choices = await p.evaluate(() => Array.from(document.querySelectorAll('.choices:not(.hidden) .choice')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()));
  let i = choices.findIndex((c) => want.test(c));
  if (i < 0) i = choices.findIndex((c) => /Not now/.test(c));
  if (i >= 0) { await p.waitForTimeout(150); await p.locator('.choices .choice').nth(i).click(); }
  const lines = await playThrough(p);
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 15000 }).catch(() => {});
  const runs = await p.evaluate(() => window.__runs.slice());
  return { choices, lines, runs };
}

// 1. before Kasane, the letter delivered
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const pend = await at(p, 'done');
  const r = await talkToNao(p, /Just chat/);
  ok(!pend && r.choices.some((c) => /Just chat/.test(c)) && r.runs.includes('sa.b_nao1'), '1 before Kasane, the letter delivered (nothing pending): "Just chat" is offered and plays this talk ' + flat({ pend, choices: r.choices, runs: r.runs }));
  ok(r.lines.some((l) => /Think her father will answer her reply\?/.test(l)) && r.lines.some((l) => /It's fine if no reply comes\./.test(l)) && !r.lines.some((l) => /Think she'll write back|if she doesn't/.test(l)),
    '1 its two lines in their new English ' + flat(r.lines.slice(0, 4)));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. before Kasane, the letter not delivered
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 1);
  const r = await talkToNao(p, /^$/);
  ok(r.choices.length > 0 && !r.choices.some((c) => /Just chat/.test(c)) && !r.runs.includes('sa.b_nao1'), '2 before Kasane, the letter not delivered: no "Just chat", and not this talk ' + flat({ choices: r.choices, runs: r.runs }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3. after Kasane, the letter delivered
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'done', { sa_met_kasane: true });
  const r = await talkToNao(p, /Just chat/);
  ok(r.choices.some((c) => /Just chat/.test(c)) && r.runs.includes('sa.b_nao2') && !r.runs.includes('sa.b_nao1'), '3 after Kasane, the letter delivered: "Just chat" plays the next banter, never this one ' + flat({ choices: r.choices, runs: r.runs }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nnao_banter: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
