// The Moss Lantern, named (Cloud CC-403; Local CL-561; Agnes 6547199277): after a peaceful naming the battle screen said
// the conclusion's own text ("The Moss Lantern, named, steps back onto its base. A small light shows in it.") and then
// the creature's settle line, one after the other, with the procedure's done line already in the log. In Chromium on
// the built game, on throwaway journeys (never a real save), on the Cedar Steps facing the Moss Lantern, met as the map
// meets it (the action key), its battle played through the real battle screen (the cards pressed, the reading
// answered right in choice mode, the action confirmed with "Do it"), every line said and every log line recorded:
//  1. with Nao, named: once named, one line said: the settle line, never the conclusion's text; the log has the step's
//     result and the done line, once each; then the map: the flag, the creature gone, the procedure recorded done,
//     and the lit lantern where it stood (the tile in front is now the lantern, whose own scene plays);
//  2. with Mio, Push past it first: its line in the log and the battle goes on; then named: the settle line only, as
//     in 1, and the same on the map;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/moss_named.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];
const SETTLE = /^Named, the lantern settles back onto its base, and a little light shows in its fire box\.$/;
const CONCL = /steps back onto its base\. A small light shows in it/;
const DONE = 'Called by its name, the Moss Lantern settles back onto its base and lets you by.';
const CALLED = 'The moss stirs. The lantern stops, listening.';
const PUSHED = 'The lantern doesn\'t budge an inch; it only plants itself more firmly.';

async function begin(p, comp) {
  await p.evaluate(([comp, FLAGS, WORDS]) => {
    const s = RB.game.debugStart('kr.steps', 14, 10, { comp, dir: 'up', edition: RB.edition.forNew(), flags: FLAGS });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.learn.kanaKnown = 'both'; s.learn.profile = 'F'; s.learn.difficulty = 'normal';
    s.words = WORDS.slice();
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'fast'; RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
    RB.save.autosave = async () => {};
    const runStep = RB.challenge.runStep;
    RB.challenge.runStep = (step, x) => { window.__step = step; return runStep(step, x); };
    // every line said, and the log line by line as it is written
    window.__said = []; window.__lines = []; window.__scenes = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push({ who: l.who || null, en: l.en || '' }); return say.apply(this, arguments); };
    const run = RB.script.run;
    RB.script.run = function (id) { window.__scenes.push(id); return run.apply(this, arguments); };
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('cl-l')) window.__lines.push(n.textContent.replace(/\s+/g, ' ').trim()); })
      .observe(document.body, { childList: true, subtree: true });
  }, [comp, FLAGS, WORDS]);
  await p.waitForTimeout(800);
}
// on to your next choice (dialogue advanced, notes closed, the action confirmed as asked, the companion's turn taken),
// or back on the map
async function toChoose(p) {
  for (let i = 0; i < 400; i++) {
    const v = await p.evaluate(() => ({ mode: RB.game.mode(), inBattle: RB.game.inBattle(), dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])'), coach: !!document.querySelector('[data-coach-ok]'), ccard: !!document.querySelector('.ccard'),
      doIt: [...document.querySelectorAll('.csheet .pbtn')].some((x) => x.offsetParent && /^\s*Do it\s*$/.test(x.textContent)) }));
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (!v.inBattle && v.mode === 'world') return v;
    if (v.doIt) { await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((x) => x.offsetParent && /^\s*Do it\s*$/.test(x.textContent)).click()); await p.waitForTimeout(150); continue; }
    if (v.coach) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); continue; }
    if (v.ccard) { await p.mouse.move(2, 2); await companionTurn(p).catch(() => {}); continue; }
    if (v.ph === 'choose' && v.cards) { await p.waitForTimeout(250); return v; }
    await p.waitForTimeout(80);
  }
  return null;
}
async function press(p, re) {
  const i = await p.evaluate((src) => { const re = new RegExp(src); const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => re.test(((x.querySelector('.rc-en') || {}).textContent || x.textContent || '').trim())); return c ? c.getAttribute('data-i') : null; }, re.source);
  if (i == null) return false;
  for (let k = 0; k < 8; k++) {
    await p.evaluate((i) => { const c = document.querySelector('.rcard[data-i="' + i + '"]'); if (c) c.click(); }, i);
    await p.waitForTimeout(250);
    if (await p.evaluate(() => RB.combat.phase() !== 'choose' || !!document.querySelector('.chal, .csheet .pbtn'))) return true;
  }
  return false;
}
// the open reading answered in choice mode (the option the step itself marks right), right first time
async function answerRight(p) {
  await p.waitForSelector('.chal', { timeout: 15000 });
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn');
  await p.evaluate(() => {
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(window.__step).filter((o) => o.ok).map((o) => txt(html(o)));
    const btn = [...document.querySelectorAll('.chal .mc .btn:not([disabled])')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
    if (btn) btn.click();
  });
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 15000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// the Moss Lantern met as the map meets it: facing it, the action key
async function meet(p) {
  const before = await p.evaluate(() => ({ front: RB.world.frontAction(), foe: RB.world.W.foes.some((f) => f.id === 'moss1') }));
  await p.keyboard.press('z');
  const v = await toChoose(p);
  return { before, v };
}
// back on the map: what the campaign kept, and what stands where the Moss Lantern stood
async function after(p) {
  return p.evaluate(async () => {
    const s = RB.game.s, W = RB.world.W;
    const lamp = W.map.props.find((x) => x.p === 'kr_toro' && x.x === 14 && x.y === 9);
    const o = { map: s.map, flag: s.flags.kr_moss1_named === true, foeKey: s.flags['foe:kr.steps:moss1'] === true, foe: W.foes.some((f) => f.id === 'moss1'), proc: s.enc && s.enc.proc && s.enc.proc.kr_moss,
      front: RB.world.frontAction(), lamp: !!lamp && RB.state.test(s, lamp.if) && !!(lamp.o && lamp.o.lit) };
    window.__scenes = [];
    RB.world.interact();
    await new Promise((r) => setTimeout(r, 400));
    o.scenes = window.__scenes.slice();
    return o;
  });
}

// 1. with Nao, named
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 'nao');
  const m = await meet(p);
  await p.evaluate(() => { window.__said = []; window.__lines = []; });
  const pressed = await press(p, /Call it by its name/);
  if (pressed) await answerRight(p);
  const end = await toChoose(p);
  const r = await p.evaluate(() => ({ said: window.__said.slice(), lines: window.__lines.slice() }));
  ok(m.before.foe && m.before.front && m.before.front.kind === 'foe' && pressed && end && end.mode === 'world', '1 met facing it, named through the battle screen, back on the map ' + flat({ before: m.before, pressed, end }));
  ok(r.said.length === 1 && SETTLE.test(r.said[0].en) && !r.said.some((x) => CONCL.test(x.en)), '1 once named, one line said: the settle line, not the conclusion\'s text ' + flat(r.said));
  ok(r.lines.filter((x) => x.includes(CALLED)).length === 1 && r.lines.filter((x) => x.includes(DONE)).length === 1, '1 the log: the step\'s result and the done line, once each ' + flat(r.lines));
  const a = await after(p);
  await p.waitForTimeout(300);
  for (let i = 0; i < 20 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); }
  ok(a.map === 'kr.steps' && a.flag && a.foeKey && !a.foe && flat(a.proc) === flat({ done: true, version: 1 }) && a.lamp && a.front && a.front.kind === 'prop' && a.scenes[0] === 'kr.toro_fern',
    '1 the map: the flag, the creature gone, the procedure done, the lit lantern where it stood, its own scene ' + flat(a));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. with Mio, Push past it first
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 'mio');
  const m = await meet(p);
  await p.evaluate(() => { window.__said = []; window.__lines = []; });
  const pushed = await press(p, /Push past it/);
  if (pushed) await answerRight(p);
  const mid = await toChoose(p);
  const r1 = await p.evaluate(() => ({ said: window.__said.slice(), lines: window.__lines.slice(), named: RB.combat.state() && RB.combat.state().enc && RB.combat.state().enc.proc.machine.named }));
  ok(m.before.front && m.before.front.kind === 'foe' && pushed && mid && mid.inBattle && r1.lines.some((x) => x.includes(PUSHED)) && r1.named === 'no' && !r1.said.some((x) => SETTLE.test(x.en) || CONCL.test(x.en)),
    '2 Push past it: its line in the log, nothing called, the battle goes on ' + flat({ pushed, mid, r1 }));
  await p.evaluate(() => { window.__said = []; window.__lines = []; });
  const called = await press(p, /Call it by its name/);
  if (called) await answerRight(p);
  const end = await toChoose(p);
  const r2 = await p.evaluate(() => ({ said: window.__said.slice(), lines: window.__lines.slice() }));
  ok(called && end && end.mode === 'world' && r2.said.length === 1 && SETTLE.test(r2.said[0].en) && r2.lines.filter((x) => x.includes(DONE)).length === 1,
    '2 then named: the settle line only, and the done line in the log ' + flat({ said: r2.said, end }));
  const a = await after(p);
  ok(a.flag && !a.foe && a.lamp && a.front && a.front.kind === 'prop' && a.scenes[0] === 'kr.toro_fern', '2 the map as in 1 ' + flat(a));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nmoss_named: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
