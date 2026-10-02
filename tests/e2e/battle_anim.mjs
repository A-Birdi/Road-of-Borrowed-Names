// Battle presentation, against the built index.html in Chromium: responses
// and enemy moves are staged from the rules' own fx events (RB.battleSeq,
// RB.battleStage), with real mouse, keyboard and pad input where practical.
// - choice, typing and handwriting reach the same response sequence;
//   wrong and cancelled answers play none; rapid clicks never add one;
// - the acting adventurer, the word on paper at the ACTUAL target, the
//   effect and recovery; the creature's preparation → execution → recovery;
//   Strike on one target, Sweep on both, each target reacting;
// - wards: full block vs partial absorb vs damage vs a raised seal;
// - states: Heat applied/stacked/cleared by water, Shroud applied/cleared by
//   light, Hush and Gathering applied/answered; every rules call once, and
//   the displayed state changes exactly at its beat;
// - reduced motion still shows word + target + outcome; hurrying; a hidden
//   tab; a resize mid-sequence; a companion technique; a revive;
// - the finishing response, then the last line (one mouse click, one Z);
// - three consecutive encounters leave no timers, layers or effects;
// - calm while reading and writing, nothing over the cards or the task;
// - a complete exchange captured as PNG strips (tests/e2e/out/battle_anim/,
//   one copied to docs/screenshots/battle/ with --docs) and the frame cost.
// Usage: node tests/e2e/battle_anim.mjs [filter] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_anim');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [], notes = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const wait = (p, ms) => p.waitForTimeout(ms);

// ---- in-page helpers: rules-call counters, a per-frame sampler, the right option -------------
async function helpers(p) {
  await p.evaluate(() => {
    const pick = (x) => x && { pc: x.pc, comp: x.comp, ward: Object.assign({}, x.ward), heat: x.heat, shroud: !!x.shroud, charged: !!x.charged, silenced: x.silenced || 0, harmony: x.harmony, knots: x.knots };
    const BA = (window.BA = { calls: { playerAct: 0, enemyAct: 0, endRound: 0 }, exch: [], samples: [], sampling: false, pick });
    const L = RB.combatLogic;
    // set a state before the first cards are dealt (e.g. a full Harmony, so the technique is offered)
    const init = L.init;
    L.init = function (...a) { const st = init.apply(this, a); if (BA.onInit) BA.onInit(st); return st; };
    for (const k of ['playerAct', 'enemyAct', 'endRound']) {
      const f = L[k];
      L[k] = function (st, ...a) {
        BA.calls[k]++;
        const before = JSON.parse(JSON.stringify(pick(st)));
        const r = f.call(this, st, ...a);
        BA.exch.push({ k, before, after: pick(st), fx: k === 'playerAct' ? r.fx : k === 'enemyAct' ? r : null });
        return r;
      };
    }
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    BA.sampleOn = () => {
      BA.samples = []; BA.sampling = true;
      const loop = () => {
        if (!BA.sampling) return;
        const d = RB.combat.debug(), f = d.stage.frame;
        BA.samples.push({
          t: performance.now(), phase: d.phase, busy: d.seq.running, kind: d.seq.kind, shown: pick(RB.combat.shown()), real: pick(RB.combat.state()),
          poses: f && f.poses, foe: f && f.foe, foeOff: f && f.foeOff, marks: f && f.marks, effects: f && f.effects, nums: f && f.nums,
          strip: d.stage.strip, bars: [...document.querySelectorAll('.pm-v')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
          fxLayerKids: (document.querySelector('.cb-fx') || { children: [] }).children.length,
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };
    BA.sampleOff = () => { BA.sampling = false; return BA.samples.length; };
    // the centre of the right multiple-choice option for the open step
    BA.right = () => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    };
    BA.wrong = () => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn:not([disabled])')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const q = bs.find((x) => !right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    };
    // (a 'rand' target is resolved when the rules draw an intent; here it becomes you)
    BA.setIntent = (kind, target) => { const st = RB.combat.state(); st.intent = Object.assign(RB.combatLogic.intentDef({}, kind), target ? { target } : {}); if (st.intent.target === 'rand') st.intent.target = 'pc'; RB.combat.refresh(); return st.intent.kind; };
  });
}
// A fresh campaign in a battle; resolves when the response cards are up.
async function battle(p, enemy, o) {
  o = o || {};
  await p.evaluate(([enemy, o]) => {
    const s = RB.game.debugStart(o.map || 'rw.millroad', o.x || 10, o.y || 22, o.comp ? { comp: o.comp } : {});
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.words = (o.words || ['mamoru', 'mizu', 'hikari']).slice();
    BA.onInit = (st) => { if (o.harmony) st.harmony = o.harmony; if (o.intent) st.intent = Object.assign(RB.combatLogic.intentDef({}, o.intent[0]), o.intent[1] ? { target: o.intent[1] } : {}); };
    // the dialogue sheet exists before the battle, as in real play
    if (o.preLine) { RB.ui.dialogue.say({ who: 'narr', en: 'Before.', jp: '' }); RB.ui.dialogue.advance(true); RB.ui.dialogue.advance(true); RB.ui.dialogue.hide(); }
    // every move and note already seen: the dock shows only the responses
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    RB.game.settings.input = o.input || 'choice';
    RB.game.settings.textSpeed = o.speed || 'normal';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.battleSeq.setTimeScale(o.timeScale || 1);
    window.__result = null;
    RB.game.startBattle(enemy, {}).then((r) => { window.__result = r || 'done'; });
  }, [enemy, o]);
  await cards(p);
  if (o.knots) await p.evaluate((n) => { const st = RB.combat.state(); st.knots = st.maxKnots = n; RB.combat.refresh(); }, o.knots);
}
async function cards(p) {
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  await p.waitForSelector('.rcard[data-i]');
  await wait(p, 120);
}
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; }, sel);
async function cardAt(p, match) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, match);
  assert(i != null, 'no enabled response card matching ' + match);
  return center(p, '.rcard[data-i="' + i + '"]');
}
// Choose a response with the mouse and answer it: 'choice' (the right option), 'type'
// (the answer typed into the field + Enter), 'hand' (the character drawn on the pad
// with the mouse, then confirm and submit). Continue is clicked with the mouse.
async function respond(p, match, how, o) {
  how = how || 'choice'; o = o || {};
  // the pointer is moved off first: resting on a word where the last exchange left it, that word's
  // hover help can open over the card about to be pressed
  await p.mouse.move(2, 2);
  await p.waitForTimeout(350);
  const c = await cardAt(p, match);
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal');
  if (how === 'choice') {
    await p.waitForSelector('.chal .mc .btn, .chal[data-kind=order]');
    if (await p.$('.chal .mc .btn')) {
      const r = await p.evaluate(() => BA.right());
      await p.mouse.click(r.x, r.y);
    } else {
      // an "order the words" task (some creatures' questions): the game's own "I don't know" path
      const rv = await center(p, '.chal [data-a=reveal]');
      await p.mouse.click(rv.x, rv.y);
      await p.waitForSelector('.fbwrap .fb-go');
      const g = await center(p, '.fbwrap .fb-go');
      await p.mouse.click(g.x, g.y);
      if (!o.noCompanion) await companionTurn(p, o.comp || {});
      return;
    }
  } else if (how === 'type') {
    await p.waitForSelector('#ime-in');
    await p.focus('#ime-in');
    await p.keyboard.insertText(o.text);
    await p.keyboard.press('Enter');
  } else if (how === 'hand') {
    await p.waitForSelector('.pad-ink');
    await wait(p, 200);
    await drawChar(p, o.char);
    await p.waitForFunction(() => { const r = document.querySelector('.readas'); return r && r.getAttribute('data-state') === 'sure'; }, null, { timeout: 5000 });
    const cf = await center(p, '[data-a=confirm]');
    await p.mouse.click(cf.x, cf.y);
    await wait(p, 100);
    const sb = await center(p, '[data-a=submit]');
    await p.mouse.click(sb.x, sb.y);
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  if (o.noContinue) return;
  const g = await center(p, '.fbwrap[data-fb=ok] .fb-go');
  await p.mouse.click(g.x, g.y);
  // with a companion, their turn comes next: the response is queued until they choose
  if (!o.noCompanion) await companionTurn(p, o.comp || {});
}
// A kanji drawn on the pad with the real mouse, stroke by stroke, along its reference strokes.
async function drawChar(p, ch) {
  const box = await p.evaluate(() => { const r = document.querySelector('.pad-ink').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const strokes = await p.evaluate((ch) => { const ref = RB.recog.reference(ch); return ref.strokes.map((s) => s.map((q) => ({ x: (q.x / ref.box) * 0.8 + 0.1, y: (q.y / ref.box) * 0.8 + 0.1 }))); }, ch);
  for (const s of strokes) {
    await p.mouse.move(box.x + s[0].x * box.w, box.y + s[0].y * box.h);
    await p.mouse.down();
    for (const q of s.slice(1)) await p.mouse.move(box.x + q.x * box.w, box.y + q.y * box.h, { steps: 2 });
    await p.mouse.up();
    await wait(p, 60);
  }
}
// until the exchange has played out: cards back (or a line, or the end), no sequence running
async function idle(p) {
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), res: window.__result }));
    if (!s.busy && (s.cards || s.dlg || s.mode !== 'combat' || s.res)) { await wait(p, 60); return s; }
    await wait(p, 40);
  }
  throw new Error('the exchange did not settle');
}
const trace = (p) => p.evaluate(() => RB.combat.debug().trace);
const samples = (p) => p.evaluate(() => { BA.sampleOff(); return BA.samples; });
const last = (arr, kind) => arr.filter((r) => r.kind === kind).slice(-1)[0];
const seen = (S, f) => S.some(f);
// the frames of one sequence kind in the samples
const during = (S, kind) => S.filter((s) => s.busy && s.kind === kind);
// order of distinct values
function seq(values) { const out = []; for (const v of values) if (v != null && out[out.length - 1] !== v) out.push(v); return out; }

// ---------------------------------------------------------------------------------------------------
await test('choice, typing and handwriting all reach the same response sequence (water on the Heat: flow, 水 on paper at the creature, splash, Heat cleared at the beat)', async () => {
  const sig = {};
  for (const how of ['choice', 'type', 'hand']) {
    const { p, errors, ctx } = await page(b, url, DESK);
    await helpers(p);
    await battle(p, 'rw.reedling', { comp: 'mio', words: ['mizu', 'mamoru', 'hikari'], input: how === 'choice' ? 'choice' : how === 'type' ? 'ime' : 'hand' });
    await p.evaluate(() => { RB.combat.state().heat = 1; BA.setIntent('rest'); });
    await p.evaluate(() => BA.sampleOn());
    await respond(p, 'Cools what is overheating', how, { text: 'みず', char: '水' });
    await idle(p);
    const S = await samples(p);
    const tr = last(await trace(p), 'player');
    assert(tr && tr.meta.card === 'w:mizu' && tr.meta.target === 'foe' && tr.meta.gesture === 'flow' && tr.beats.map((x) => x.t).join() === 'water', how + ': the water response sequence ' + JSON.stringify(tr && { meta: tr.meta, beats: tr.beats }));
    const P = during(S, 'player');
    const poses = seq(P.map((s) => s.poses && s.poses.pc && s.poses.pc.split(':')[0]));
    assert(poses.indexOf('anticipate') >= 0 && poses.indexOf('act') > poses.indexOf('anticipate') && poses.indexOf('recover') > poses.indexOf('act'), how + ': you anticipate, act and recover: ' + poses.join(' → '));
    assert(P.some((s) => s.poses.pc === 'act:flow'), how + ': the gesture is the flowing one');
    assert(!P.some((s) => s.poses.comp && /^act|^anticipate/.test(s.poses.comp)), how + ': the companion does not act on your single response');
    const strip = P.find((s) => s.strip && s.strip.opacity > 0.9);
    assert(strip && /水/.test(strip.strip.text) && /みず/.test(strip.strip.text) && strip.strip.to === 'foe', how + ': 水 (みず) on the paper strip, headed for the creature: ' + JSON.stringify(strip && strip.strip));
    assert(P.some((s) => (s.effects || []).some((e) => /^splash/.test(e))), how + ': a splash at the creature');
    // Heat 1 → 0 exactly once, not before the strip was up
    const hs = P.map((s) => s.shown.heat);
    const firstStrip = P.findIndex((s) => s.strip);
    const cleared = hs.indexOf(0);
    assert(seq(hs).join() === '1,0' && cleared > firstStrip, how + ': the Heat mark goes at the beat, once (' + seq(hs).join('→') + ', strip at frame ' + firstStrip + ', cleared at ' + cleared + ')');
    assert(P.slice(0, cleared).every((s) => s.marks.indexOf('heat:1') >= 0) && P.slice(cleared).every((s) => !s.marks.some((m) => /^heat/.test(m))), how + ': the Heat shimmer shows until the beat and is gone after it');
    sig[how] = [tr.meta.target, tr.meta.gesture, tr.meta.word, tr.beats.map((x) => x.t).join()].join('|');
    const calls = await p.evaluate(() => BA.calls);
    assert(calls.playerAct === 1 && calls.enemyAct === 1, how + ': the rules ran once each: ' + JSON.stringify(calls));
    assert(!errors.length, how + ': ' + errors.join('; '));
    await ctx.close();
  }
  assert(sig.choice === sig.type && sig.type === sig.hand, 'the same sequence for all three input methods: ' + JSON.stringify(sig));
});

// ---------------------------------------------------------------------------------------------------
await test('a wrong answer or a cancelled response plays no success sequence; a slip is shown as a −1 before the response', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'mio', knots: 4 });
  await p.evaluate(() => BA.sampleOn());
  const c = await cardAt(p, 'unravel');
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal .mc .btn');
  const w = await p.evaluate(() => BA.wrong());
  await p.mouse.click(w.x, w.y);
  await p.waitForSelector('.fbwrap[data-fb=no]');
  await wait(p, 600);
  let st = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), runs: RB.battleSeq.stats().counters.runs, calls: BA.calls.playerAct, phase: RB.combat.phase() }));
  assert(!st.busy && st.runs === 0 && st.calls === 0 && st.phase === 'challenge', 'a wrong answer: nothing plays, nothing is applied ' + JSON.stringify(st));
  const leave = await center(p, '.chal [data-a=leave]');
  await p.mouse.click(leave.x, leave.y);
  await cards(p);
  st = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), runs: RB.battleSeq.stats().counters.runs, calls: BA.calls.playerAct }));
  assert(!st.busy && st.runs === 0 && st.calls === 0, 'cancelled: nothing plays ' + JSON.stringify(st));
  let S = await samples(p);
  assert(!S.some((s) => s.poses && /anticipate|act|recover/.test(s.poses.pc || '')) && !S.some((s) => s.strip), 'no gesture and no strip while answering wrongly or cancelling');
  // a wrong answer then the right one: the slip costs 1 (shown first), then the response plays
  await p.evaluate(() => BA.sampleOn());
  const c2 = await cardAt(p, 'unravel');
  await p.mouse.click(c2.x, c2.y);
  await p.waitForSelector('.chal .mc .btn');
  const w2 = await p.evaluate(() => BA.wrong());
  await p.mouse.click(w2.x, w2.y);
  await p.waitForSelector('.fbwrap[data-fb=no]');
  assert(!(await p.evaluate(() => RB.battleSeq.busy())), 'still nothing while the task is open');
  const r2 = await p.evaluate(() => BA.right());
  await p.mouse.click(r2.x, r2.y);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  await companionTurn(p);
  await idle(p);
  S = await samples(p);
  const tr = last(await trace(p), 'player');
  assert(tr.beats[0].t === 'cost' && tr.beats[1].t === 'unravel', 'the slip beat comes first, then the knot: ' + tr.beats.map((x) => x.t).join());
  assert(seen(S, (s) => (s.nums || []).indexOf('pc:-1') >= 0) && seen(S, (s) => (s.effects || []).some((e) => /^drop/.test(e))), 'the slip shows as an ink drop and −1 on you');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('rapid input: repeated clicks on a card and on Continue never queue a second response', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'mio', knots: 4 });
  const c = await cardAt(p, 'unravel');
  for (let i = 0; i < 4; i++) await p.mouse.click(c.x, c.y, { delay: 5 });
  await p.waitForSelector('.chal .mc .btn');
  assert((await p.evaluate(() => document.querySelectorAll('.chal').length)) === 1, 'one challenge for four clicks');
  const r = await p.evaluate(() => BA.right());
  await p.mouse.click(r.x, r.y);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  const g = await center(p, '.fbwrap[data-fb=ok] .fb-go');
  for (let i = 0; i < 4; i++) await p.mouse.click(g.x, g.y, { delay: 5 });
  await p.keyboard.press('z'); await p.keyboard.press('Enter');
  // the extra presses chose nothing in your companion's turn: it is still open, then chosen once
  await wait(p, 120);
  const open = await p.evaluate(() => ({ menu: document.querySelectorAll('.ccard').length, phase: RB.combat.phase(), calls: BA.calls.playerAct }));
  assert(open.menu > 0 && open.phase === 'companion' && open.calls === 0, 'the companion\'s turn is open and nothing has resolved yet: ' + JSON.stringify(open));
  await companionTurn(p);
  await idle(p);
  const d = await p.evaluate(() => ({ calls: BA.calls, runs: RB.combat.debug().trace.map((r) => r.kind), knots: RB.combat.state().knots }));
  assert(d.calls.playerAct === 1 && d.calls.enemyAct === 1 && d.runs.join() === 'player,companion,enemy' && d.knots === 3, 'one response, one companion action, one enemy move, one knot: ' + JSON.stringify(d));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('enemy turns: a Strike on one target, a Sweep over both; preparation → execution → recovery, and each actual target reacts', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.dustmoth', { comp: 'nao', words: ['mizu', 'mamoru'], knots: 4 });
  // Strike aimed at the companion; みず with no Heat changes nothing, so the blow lands
  await p.evaluate(() => { BA.setIntent('strike', 'comp'); BA.sampleOn(); });
  await respond(p, 'Cools what is overheating');
  await idle(p);
  let S = await samples(p), E = during(S, 'enemy');
  let tr = last(await trace(p), 'enemy');
  assert(tr.meta.kind === 'strike' && tr.beats.map((x) => x.t + ':' + x.who).join() === 'hit:comp', 'the strike hits the companion only: ' + JSON.stringify(tr.beats));
  const acts = seq(E.map((s) => s.foe));
  assert(acts.join(' ').indexOf('prep exec') >= 0 && acts.indexOf('recover') > acts.indexOf('exec'), 'the creature prepares, strikes, recovers: ' + acts.join(' → '));
  assert(E.some((s) => s.foeOff && Math.abs(s.foeOff.dx) >= 6), 'the moth moves toward its target (not a whole-scene shake)');
  // (a creature with its own delivery shows its own approach instead of the generic streak: the Flour Moth swoops — Creatures A)
  assert(E.some((s) => (s.effects || []).some((x) => /^(dart|wingWake|scaleShed)>comp$/.test(x))) && E.some((s) => (s.effects || []).indexOf('impact>comp') >= 0), 'a focused streak (or the creature\'s own swoop) and an impact on the companion');
  assert(E.some((s) => s.poses.comp === 'hit') && !E.some((s) => s.poses.pc === 'hit'), 'the companion recoils; you do not');
  const cv = seq(E.map((s) => s.shown.comp));
  assert(cv.length === 2, 'the companion\'s resolve changes once, at contact: ' + cv.join('→'));
  const hitAt = E.findIndex((s) => s.shown.comp !== E[0].shown.comp);
  assert(E.slice(0, hitAt).every((s) => s.poses.comp !== 'hit') && E[hitAt].bars[1] && E[hitAt].bars[1].includes(E[hitAt].shown.comp + ' / '), 'the reaction and the bar change at the contact beat, together: ' + E[hitAt].bars[1]);
  // positions come back (no drift after the recoil)
  const endPose = await p.evaluate(() => RB.combat.debug().stage.anchors);
  // Sweep over both
  await p.evaluate(() => { BA.setIntent('sweep'); BA.sampleOn(); });
  await respond(p, 'Cools what is overheating');
  await idle(p);
  S = await samples(p); E = during(S, 'enemy');
  tr = last(await trace(p), 'enemy');
  const order = tr.beats.filter((x) => x.t === 'hit');
  assert(order.map((x) => x.who).join() === 'pc,comp' && order[1].at > order[0].at, 'the sweep reaches you, then your companion: ' + JSON.stringify(order));
  assert(E.some((s) => s.poses.pc === 'hit') && E.some((s) => s.poses.comp === 'hit'), 'both react');
  assert(E.some((s) => (s.effects || []).indexOf('arc') >= 0), 'one arc passes over both');
  const endPose2 = await p.evaluate(() => RB.combat.debug().stage.anchors);
  assert(Math.abs(endPose.pc.feet.x - endPose2.pc.feet.x) === 0 && Math.abs(endPose.comp.feet.y - endPose2.comp.feet.y) === 0, 'stable positions after the reactions');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('wards: a full block braces, a partial absorb intercepts then flinches, plain damage recoils; a raised seal catches the blow', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'nao', words: ['mizu', 'mamoru'], knots: 5 });
  const exchange = async (ward, match) => {
    await p.evaluate((w) => { const st = RB.combat.state(); st.ward.pc = w; BA.setIntent('strike', 'pc'); BA.sampleOn(); }, ward);
    await respond(p, match || 'Cools what is overheating');
    await idle(p);
    const S = await samples(p);
    return { E: during(S, 'enemy'), tr: last(await trace(p), 'enemy') };
  };
  // full block: ward 4 against a blow of 2
  let { E, tr } = await exchange(4);
  assert(tr.beats.map((x) => x.t).join() === 'block', 'fully absorbed: only a block ' + JSON.stringify(tr.beats));
  assert(E.some((s) => s.poses.pc === 'brace') && !E.some((s) => s.poses.pc === 'hit'), 'you brace; no injury reaction');
  assert(E.some((s) => (s.effects || []).indexOf('sealBlock>pc') >= 0), 'the seal takes the blow');
  const marks = seq(E.map((s) => (s.marks.find((m) => /^ward:pc/.test(m)) || 'none')));
  assert(marks.join() === 'ward:pc:4,ward:pc:2', 'the seal tags go from 4 to 2 at the beat: ' + marks.join('→'));
  // partial: ward 1
  ({ E, tr } = await exchange(1));
  const bt = tr.beats.map((x) => x.t);
  assert(bt.join() === 'block,hit' && tr.beats[1].at - tr.beats[0].at >= 90, 'partly absorbed: the ward intercepts, then a smaller hit ' + JSON.stringify(tr.beats));
  const pp = seq(E.map((s) => s.poses.pc));
  assert(pp.indexOf('brace') >= 0 && pp.indexOf('hit') > pp.indexOf('brace'), 'brace, then a flinch: ' + pp.join('→'));
  // plain damage
  ({ E, tr } = await exchange(0));
  assert(tr.beats.map((x) => x.t).join() === 'hit' && E.some((s) => s.poses.pc === 'hit') && !E.some((s) => s.poses.pc === 'brace'), 'unwarded: a hit and a recoil');
  // a ward raised in front of the aimed-at one: the seal waits for the blow, then catches it
  await p.evaluate(() => { RB.combat.state().ward.pc = 0; BA.setIntent('strike', 'pc'); BA.sampleOn(); });
  await respond(p, 'protect.*on you');
  await idle(p);
  const S = await samples(p);
  const P = during(S, 'player'), EE = during(S, 'enemy');
  const t2 = last(await trace(p), 'enemy');
  assert(t2.beats.map((x) => x.t).join() === 'countered', 'the blow is countered ' + JSON.stringify(t2.beats));
  assert(P.some((s) => s.strip && s.strip.to === 'pc' && /守/.test(s.strip.text)), '守る on paper over you (the protected one)');
  assert(EE.slice(0, 5).every((s) => s.marks.indexOf('ward:pc:1') >= 0), 'the raised seal stands while it winds up');
  assert(EE.some((s) => (s.effects || []).indexOf('sealBlock>pc') >= 0) && EE.some((s) => s.poses.pc === 'brace') && !EE.some((s) => s.poses.pc === 'hit'), 'the seal catches it: brace, no hit');
  assert(!EE.slice(-3).some((s) => s.marks.some((m) => /^ward:pc/.test(m))), 'the spent seal is gone afterwards');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('states: Heat applied, stacked and cleared by water; Shroud applied and cleared by light — marks follow the beats', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'mio', words: ['mizu', 'hikari', 'mamoru'], knots: 6 });
  const turn = async (intent, match) => {
    await p.evaluate((k) => { BA.setIntent(k); BA.sampleOn(); }, intent);
    await respond(p, match);
    await idle(p);
    return samples(p);
  };
  let S = await turn('heat', 'unravel'), E = during(S, 'enemy');
  let hm = seq(E.map((s) => s.marks.find((m) => /^heat/.test(m)) || 'none'));
  assert(hm.join() === 'none,heat:1', 'Heat 1 appears at its beat: ' + hm.join('→'));
  assert(E.some((s) => s.foe === 'cast') && E.some((s) => (s.effects || []).indexOf('embers') >= 0), 'the creature casts; embers burst');
  S = await turn('heat', 'unravel'); E = during(S, 'enemy');
  hm = seq(E.map((s) => s.marks.find((m) => /^heat/.test(m)) || 'none'));
  assert(hm.join() === 'heat:1,heat:2', 'stacked to Heat 2: ' + hm.join('→'));
  assert(/Heat 2/.test(await p.textContent('.cb-foe')), 'its slip says Heat 2');
  S = await turn('rest', 'Cools what is overheating');
  let P = during(S, 'player');
  hm = seq(P.map((s) => s.marks.find((m) => /^heat/.test(m)) || 'none'));
  assert(hm.join() === 'heat:2,none' && P.some((s) => (s.effects || []).some((e) => /^splash/.test(e))), 'water: a splash with steam, Heat cleared at the beat: ' + hm.join('→'));
  S = await turn('shroud', 'unravel'); E = during(S, 'enemy');
  let sm = seq(E.map((s) => s.marks.indexOf('shroud') >= 0));
  assert(sm.join() === 'false,true' && E.some((s) => (s.effects || []).indexOf('mistRoll') >= 0), 'Shroud: mist rolls over its knots at the beat');
  S = await turn('rest', 'Shows what is hidden'); P = during(S, 'player');
  sm = seq(P.map((s) => s.marks.indexOf('shroud') >= 0));
  assert(sm.join() === 'true,false' && P.some((s) => (s.effects || []).some((e) => /^flash/.test(e))) && P.some((s) => (s.effects || []).indexOf('mistPart') >= 0), 'light: a revealing flash, the mist parts at the beat');
  assert(P.some((s) => s.poses.pc === 'act:raise'), 'light is raised, not thrown');
  assert(!P.some((s) => (s.effects || []).some((e) => /^impact/.test(e))), 'no impact: light reveals, it does not hit');
  const calls = await p.evaluate(() => BA.calls);
  assert(calls.playerAct === 5 && calls.enemyAct === 5, 'five exchanges, the rules ran once each: ' + JSON.stringify(calls));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('states: Hush on the party and Gathering on the creature, applied and answered (bell, rope)', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  // (not Ren: his lamp answers a Gathering by itself)
  await battle(p, 'rw.reedling', { comp: 'nao', words: ['suzu', 'nawa', 'mizu'], knots: 6 });
  const turn = async (intent, match) => {
    await p.evaluate((k) => { BA.setIntent(k); BA.sampleOn(); }, intent);
    await respond(p, match);
    await idle(p);
    return samples(p);
  };
  let S = await turn('silence', 'unravel'), E = during(S, 'enemy');
  assert(seq(E.map((s) => s.marks.indexOf('hush') >= 0)).join() === 'false,true' && E.some((s) => (s.effects || []).indexOf('hushWave') >= 0), 'Hush: a pale wave reaches you, the mark stays over the party');
  assert(/Hushed/.test(await p.textContent('.cb-foe')), 'its slip says Hushed');
  S = await turn('rest', 'breaks a hush');
  let P = during(S, 'player');
  assert(seq(P.map((s) => s.marks.indexOf('hush') >= 0)).join() === 'true,false' && P.some((s) => (s.effects || []).some((e) => /^rings/.test(e))), 'the bell: rings spread, the hush breaks at the beat');
  let tr = last(await trace(p), 'player');
  assert(tr.meta.target === 'party', 'the bell answers for both of you (the party): ' + tr.meta.target);
  S = await turn('charge', 'Cools what is overheating'); E = during(S, 'enemy');
  assert(seq(E.map((s) => s.marks.indexOf('charge') >= 0)).join() === 'false,true' && E.some((s) => (s.effects || []).indexOf('gather') >= 0), 'Gathering: motes spiral in, then circle it');
  S = await turn('rest', 'Holds something in place'); P = during(S, 'player');
  assert(seq(P.map((s) => s.marks.indexOf('charge') >= 0)).join() === 'true,false' && P.some((s) => (s.effects || []).some((e) => /^rope/.test(e))) && P.some((s) => (s.effects || []).indexOf('scatter') >= 0), 'the rope: a loop cinches, the gathered force spills away at the beat');
  // a Gathering left alone is spent in its next Strike: the mark goes with that blow, not later
  await p.evaluate(() => { RB.combat.state().charged = true; RB.combat.refresh(); });
  S = await turn('strike', 'Cools what is overheating'); E = during(S, 'enemy');
  const te = last(await trace(p), 'enemy'), spentAt = E.findIndex((s) => s.marks.indexOf('charge') < 0);
  assert(te.beats.map((x) => x.t).join() === 'hit,spent' && spentAt > 0 && spentAt < E.length - 10 && E.some((s) => (s.effects || []).indexOf('scatter') >= 0), 'Gathering spent in the blow: the mark goes at contact (' + te.beats.map((x) => x.t + '@' + x.at).join(', ') + ')');
  // several states at once stay bounded: Heat + Shroud + Gathering + Hush + wards
  await p.evaluate(() => { const st = RB.combat.state(); st.heat = 2; st.shroud = true; st.charged = true; st.silenced = 1; st.ward.pc = 3; st.ward.comp = 2; RB.combat.refresh(); BA.sampleOn(); });
  await wait(p, 400);
  S = await samples(p);
  const m = S[S.length - 1].marks;
  assert(['heat:2', 'shroud', 'charge', 'hush', 'ward:pc:3', 'ward:comp:2'].every((x) => m.indexOf(x) >= 0) && m.length <= 8, 'all states marked at once, one mark each: ' + m.join(', '));
  await p.screenshot({ path: path.join(outDir, 'states_all.png') });
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('every result is applied once by the rules and shown once: the display steps at the beats and ends equal to the rules', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'mio', words: ['mizu', 'iyasu', 'mamoru'], knots: 6 });
  const kinds = [['sweep', 'Restores 3 resolve'], ['strike', 'unravel'], ['heat', 'unravel'], ['rest', 'Cools what is overheating']];
  for (const [k, m] of kinds) {
    await p.evaluate((k) => { BA.setIntent(k, k === 'strike' ? 'comp' : null); BA.sampleOn(); }, k);
    await respond(p, m);
    await idle(p);
    const S = await samples(p);
    const X = await p.evaluate(() => BA.exch.slice(-3));
    const pa = X.find((x) => x.k === 'playerAct'), ea = X.find((x) => x.k === 'enemyAct');
    const end = S[S.length - 1];
    assert(JSON.stringify(end.shown) === JSON.stringify(end.real), k + ': the screen ends showing exactly the rules\' state ' + JSON.stringify(end.shown) + ' vs ' + JSON.stringify(end.real));
    // each field shown changes no more often than the beats that change it
    const P = during(S, 'player'), E = during(S, 'enemy');
    const tp = last(await trace(p), 'player'), te = last(await trace(p), 'enemy');
    const hits = (who) => te.beats.filter((x) => x.t === 'hit' && x.who === who).length + te.beats.filter((x) => x.t === 'comp').length;
    assert(seq(E.map((s) => s.shown.pc)).length - 1 <= hits('pc'), k + ': your resolve changed once per result on you ' + seq(E.map((s) => s.shown.pc)).join('→'));
    assert(seq(P.map((s) => s.shown.knots)).length - 1 <= tp.beats.filter((x) => x.t === 'unravel').length, k + ': knots change once per Unravel');
    // before the first beat of each sequence the screen still shows the state from before it
    const firstP = P.findIndex((s) => JSON.stringify(s.shown) !== JSON.stringify(P[0].shown));
    assert(JSON.stringify(P[0].shown) === JSON.stringify(pa.before) || firstP < 0, k + ': the response starts from the displayed state before the rules ran');
    assert(ea && JSON.stringify(E[0].shown) === JSON.stringify(ea.before), k + ': the enemy turn starts from the state before its move');
  }
  const c = await p.evaluate(() => BA.calls);
  assert(c.playerAct === 4 && c.enemyAct === 4 && c.endRound === 4, 'the rules ran once per exchange: ' + JSON.stringify(c));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('reduced motion: the word, its target and the outcome still show — with no movement or particles', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.dustmoth', { comp: 'mio', words: ['mamoru', 'mizu'], knots: 5, reduce: true });
  await p.evaluate(() => { BA.setIntent('strike', 'pc'); BA.sampleOn(); });
  await respond(p, 'protect.*on mio');
  await idle(p);
  const S = await samples(p), P = during(S, 'player'), E = during(S, 'enemy');
  const st = P.filter((s) => s.strip && s.strip.opacity > 0.9);
  assert(st.length >= 10 && /守/.test(st[0].strip.text) && st[0].strip.to === 'comp', 'the word 守る is on paper for a while, over your companion (' + st.length + ' frames)');
  const anc = await p.evaluate(() => { const d = RB.combat.debug().stage; return { head: d.anchors.comp.head, k: d.cssPerArt }; });
  const r = st[0].strip.rect, hx = anc.head.x * anc.k;
  assert(Math.abs(r.x + r.w / 2 - hx) < 90 && r.y + r.h <= anc.head.y * anc.k + 4, 'the strip hangs over the companion\'s head ' + JSON.stringify({ r, hx }));
  assert(new Set(st.map((s) => s.strip.rect.x + ',' + s.strip.rect.y)).size === 1, 'it does not travel (no movement) ' + [...new Set(st.map((s) => s.strip.rect.x + ',' + s.strip.rect.y + ':' + s.phase))].join(' '));
  assert(P.concat(E).every((s) => !s.foeOff || (s.foeOff.dx === 0 && s.foeOff.dy === 0)), 'the creature does not move');
  assert(E.some((s) => s.poses.pc === 'hit') && E.some((s) => (s.nums || []).indexOf('pc:-2') >= 0), 'the blow on you still shows: a flinch pose and −2');
  assert(seq(P.map((s) => s.marks.find((m) => /^ward:comp/.test(m)) || 'none')).join() === 'none,ward:comp:2', 'the ward before your companion appears (2 tags)');
  // stillness: the canvas does not change while you choose, nor through the creature's waiting turn
  const still = (ms) => p.evaluate(async (ms) => {
    const cv = document.getElementById('world'), g = cv.getContext('2d');
    const a = g.getImageData(0, 0, cv.width, cv.height).data;
    await new Promise((r) => setTimeout(r, ms));
    const c = g.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]) > 24) n++;
    return n;
  }, ms);
  await wait(p, 1000); // what the last exchange left (a number, a mote) has gone
  const d1 = await still(400);
  assert(d1 < 50, 'reduced motion: the scene is still while you choose (' + d1 + ' px changed in 400 ms)');
  await p.evaluate(() => BA.setIntent('rest'));
  await respond(p, 'unravel');
  await p.waitForFunction(() => RB.combat.phase() === 'enemy');
  await wait(p, 60);
  const d2 = await still(300);
  assert(d2 < 50, 'reduced motion: nothing moves through its waiting turn (' + d2 + ' px changed in 300 ms)');
  await idle(p);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('hurry: Z or a click on the battle shortens a sequence; the outcome is the same; the key is used up', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'mio', knots: 6 });
  await p.evaluate(() => BA.setIntent('rest'));
  await respond(p, 'unravel');
  await idle(p);
  const normal = last(await trace(p), 'player').dur;
  await p.evaluate(() => BA.setIntent('rest'));
  await respond(p, 'unravel');
  await wait(p, 150);
  await p.keyboard.press('z');
  await idle(p);
  const tz = last(await trace(p), 'player');
  assert(tz.hurried && tz.dur < normal * 0.75 && tz.beats[0].t === 'unravel', 'Z hurries it (' + tz.dur + ' ms vs ' + normal + ' ms) and the knot still comes loose');
  await p.evaluate(() => BA.setIntent('strike', 'pc'));
  await respond(p, 'unravel');
  await p.waitForFunction(() => RB.combat.phase() === 'enemy');
  await wait(p, 160);
  const stage = await p.evaluate(() => { const r = document.querySelector('.cb-stage').getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.3 }; });
  await p.mouse.click(stage.x, stage.y);
  await idle(p);
  const te = last(await trace(p), 'enemy');
  assert(te.hurried && te.beats.some((x) => x.t === 'hit'), 'a click on the battle hurries the enemy turn; the blow still lands');
  const s = await p.evaluate(() => ({ knots: RB.combat.state().knots, calls: BA.calls, top: RB.ui.topLayer() && RB.ui.topLayer().name }));
  assert(s.knots === 3 && s.calls.playerAct === 3 && s.top === 'cards', 'same outcomes, and the cards are back on top: ' + JSON.stringify(s));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('a hidden tab settles the sequence at once (no stale burst on return); a resize mid-sequence keeps everyone attached', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'mio', knots: 6 });
  await p.evaluate(() => BA.setIntent('strike', 'pc'));
  await respond(p, 'unravel');
  await p.waitForFunction(() => RB.combat.phase() === 'player');
  await wait(p, 120);
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await wait(p, 300);
  let s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), tr: RB.combat.debug().trace.map((r) => r.kind + ':' + r.settled), shown: BA.pick(RB.combat.shown()), real: BA.pick(RB.combat.state()) }));
  assert(!s.busy && s.tr.join() === 'player:hidden,companion:hidden,enemy:hidden' && JSON.stringify(s.shown) === JSON.stringify(s.real), 'hidden: every sequence of the exchange (yours, your companion\'s, its move) settled at once, the screen equals the rules ' + JSON.stringify(s));
  await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); BA.sampleOn(); });
  await wait(p, 600);
  const S = await samples(p);
  assert(!S.some((x) => x.busy) && !S.some((x) => (x.effects || []).length) && !S.some((x) => x.strip), 'back: nothing replays');
  // resize mid-sequence
  await p.evaluate(() => BA.setIntent('rest'));
  await respond(p, 'unravel');
  await p.waitForFunction(() => { const s = RB.combat.debug().stage.strip; return s && s.opacity > 0.5; });
  await p.setViewportSize({ width: 390, height: 844 });
  await wait(p, 250);
  s = await p.evaluate(() => { const d = RB.combat.debug().stage; const st = document.querySelector('.cb-stage').getBoundingClientRect(); return { strip: d.strip && d.strip.rect, stage: { x: st.left, y: st.top, w: st.width, h: st.height }, pc: d.anchors.pc && d.anchors.pc.feet, k: d.cssPerArt, busy: RB.battleSeq.busy() }; });
  assert(s.strip && s.strip.x >= s.stage.x - 1 && s.strip.x + s.strip.w <= s.stage.x + s.stage.w + 1 && s.strip.y >= s.stage.y - 1, 'after the resize the strip is inside the new stage ' + JSON.stringify(s));
  assert(s.pc.x * s.k < 390, 'you stand inside the narrower view');
  await idle(p);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('a companion technique: both act together; a revive: your companion helps you up', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.reedling', { comp: 'ren', knots: 6, harmony: 3 });
  await p.evaluate(() => { BA.setIntent('rest'); BA.sampleOn(); });
  await respond(p, 'Lantern Ward');
  await idle(p);
  let S = await samples(p), P = during(S, 'player');
  const tr = last(await trace(p), 'player');
  assert(tr.meta.actors.join() === 'pc,comp' && P.some((s) => s.poses.pc && s.poses.pc.startsWith('act')) && P.some((s) => s.poses.comp === 'act:ward'), 'you and Ren act together: ' + JSON.stringify(tr.meta));
  assert(P.some((s) => (s.effects || []).indexOf('link') >= 0) && P.some((s) => (s.effects || []).indexOf('sealForm>comp') >= 0), 'a thread of light joins your hands; seals rise before both');
  const wm = P[P.length - 1].marks;
  assert(wm.indexOf('ward:pc:4') >= 0 && wm.indexOf('ward:comp:4') >= 0, 'both wards show 4 tags (1 + 3): ' + wm.join(','));
  // revive
  await p.evaluate(() => { const st = RB.combat.state(); st.pc = 1; st.ward.pc = 0; st.ward.comp = 0; BA.setIntent('strike', 'pc'); RB.combat.refresh(); BA.sampleOn(); });
  await respond(p, 'unravel');
  await idle(p);
  S = await samples(p);
  const rv = last(await trace(p), 'revive');
  assert(rv && rv.beats[0].t === 'revive', 'the revive plays');
  const pcPoses = seq(S.filter((s) => s.busy).map((s) => s.poses.pc && s.poses.pc.split(':')[0]));
  assert(pcPoses.indexOf('down') >= 0 && pcPoses.lastIndexOf('recover') > pcPoses.indexOf('down') && pcPoses.slice(pcPoses.indexOf('down')).join() === 'down,recover,ready', 'down, then back up: ' + pcPoses.join('→'));
  const fin = await p.evaluate(() => ({ shown: RB.combat.shown().pc, real: RB.combat.state().pc }));
  assert(fin.shown === fin.real && fin.real === 4, 'resolve shown after the revive: ' + JSON.stringify(fin));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('the finishing response lets the creature settle, then the last line takes one mouse click (and, separately, one Z)', async () => {
  for (const how of ['mouse', 'z']) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1600, height: 816 } });
    await helpers(p);
    await battle(p, 'rw.reedling', { comp: 'mio', knots: 1, preLine: true });
    await p.evaluate(() => BA.sampleOn());
    await respond(p, 'unravel');
    await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 15000 });
    const S = await samples(p);
    const F = during(S, 'finish');
    const tr = last(await trace(p), 'finish');
    assert(tr && tr.beats.map((x) => x.t).join().startsWith('unravel'), how + ': the finishing sequence ' + JSON.stringify(tr && tr.beats));
    assert(F.some((s) => s.foe === 'settle') && F.some((s) => (s.effects || []).indexOf('release') >= 0) && F.some((s) => s.poses.pc === 'cheer'), how + ': the creature settles, light rises, you ease');
    const at = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), layer: RB.battleSeq.stats().layer, final: RB.combat.debug().stage.final }));
    assert(!at.busy && !at.layer && at.final, how + ': the line opens after the sequence, with no input hook left ' + JSON.stringify(at));
    await wait(p, 400);
    const bl = await p.evaluate(() => RB.game.s.backlog.length);
    if (how === 'mouse') {
      const r = await p.evaluate(() => { const b = document.querySelector('.dlg:not(.hidden) .b-next'); const q = b.getBoundingClientRect(); const x = q.left + q.width / 2, y = q.top + q.height / 2; const top = document.elementFromPoint(x, y); return { x, y, onTop: !!(top && top.closest('.b-next')) }; });
      assert(r.onTop, 'Next is on top');
      await p.mouse.click(r.x, r.y); await wait(p, 250);
      if (await p.evaluate(() => RB.ui.dialogue.isOpen())) { await p.mouse.click(r.x, r.y); await wait(p, 250); }
    } else {
      await p.keyboard.press('z'); await wait(p, 250);
      if (await p.evaluate(() => RB.ui.dialogue.isOpen())) { await p.keyboard.press('z'); await wait(p, 250); }
    }
    await p.waitForFunction(() => window.__result === 'win' && RB.game.mode() === 'world', null, { timeout: 15000 });
    assert((await p.evaluate(() => RB.game.s.backlog.length)) === bl, how + ': one input, one line: back to the map with nothing skipped');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------------------------------
await test('three consecutive encounters leave no timers, input hooks, strips, layers or effects behind', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const after = [];
  for (let n = 0; n < 3; n++) {
    await battle(p, n === 1 ? 'rw.dustmoth' : 'rw.reedling', { comp: 'mio', knots: 1 });
    await respond(p, 'unravel');
    for (let i = 0; i < 100 && (await p.evaluate(() => RB.game.mode())) === 'combat'; i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await wait(p, 80); }
    await p.waitForFunction(() => RB.game.mode() === 'world' && window.__result);
    await wait(p, 300);
    after.push(await p.evaluate(() => ({ seq: RB.battleSeq.stats(), stage: RB.battleStage.stats(), overlay: document.querySelectorAll('.combat-ui').length, fx: document.querySelectorAll('.cb-fx, .cb-strip, .cb-seqkey').length, top: RB.ui.topLayer() && RB.ui.topLayer().name, panel: document.body.classList.contains('in-panel') })));
  }
  for (const [i, a] of after.entries()) {
    assert(!a.seq.running && a.seq.timers === 0 && !a.seq.layer && !a.seq.pointer && !a.seq.attached, 'encounter ' + (i + 1) + ': the sequencer is idle and detached ' + JSON.stringify(a.seq));
    assert(!a.stage.active && a.stage.strips === 0 && a.stage.layers === 0 && a.overlay === 0 && a.fx === 0 && !a.top && !a.panel, 'encounter ' + (i + 1) + ': no stage, strip, overlay or layer left ' + JSON.stringify(a));
  }
  const runs = await p.evaluate(() => RB.battleSeq.stats().counters);
  assert(runs.runs === runs.done && runs.watchdogs === 0, 'every sequence finished, none by the watchdog ' + JSON.stringify(runs));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('learning stays central: ready while choosing (and choosing support), calm while writing; nothing drawn over the cards or the task, no focus taken', async () => {
  for (const vp of [DESK, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 }]) {
    const { p, errors, ctx } = await page(b, url, vp);
    await helpers(p);
    await battle(p, 'rw.dustmoth', { comp: 'suzu', knots: 4 });
    await p.evaluate(() => BA.sampleOn());
    await wait(p, 500);
    let S = await samples(p);
    const ready = (x) => x === 'ready' || /^guard/.test(x || '');
    assert(S.every((s) => s.phase === 'choose' && ready(s.poses.pc) && ready(s.poses.comp) && !(s.effects || []).length && !s.strip && !s.fxLayerKids), vp.viewport.width + ': ready stances, no effects and no strip while choosing ' + JSON.stringify(S[0] && S[0].poses));
    const hit = await p.evaluate(() => { const c = document.querySelector('.rcard[data-i="0"]').getBoundingClientRect(); const e = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2); return !!(e && e.closest('.rcard')); });
    assert(hit, 'the first card is on top at its centre');
    const c = await cardAt(p, 'unravel');
    await p.mouse.click(c.x, c.y);
    await p.waitForSelector('.chal .mc .btn');
    await p.evaluate(() => BA.sampleOn());
    await wait(p, 400);
    S = await samples(p);
    const focus = await p.evaluate(() => { const a = document.activeElement; return a && a.closest('.chal') ? 'chal' : a && a.tagName; });
    assert(S.every((s) => s.phase === 'challenge' && s.poses.pc === 'calm' && !(s.effects || []).length && !s.strip), 'calm while the task is open; nothing drawn');
    assert(focus === 'chal' || focus === 'BODY', 'focus stays with the task: ' + focus);
    const r = await p.evaluate(() => BA.right()); await p.mouse.click(r.x, r.y);
    // (the pointer is moved off the option first: resting on its word, the word's hover help can open over Continue)
    await p.mouse.move(2, 2);
    await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go'); await p.click('.fbwrap[data-fb=ok] .fb-go');
    // your companion's turn: ready again, nothing drawn over the menu, no focus taken from it
    await p.waitForSelector('.ccard');
    await p.evaluate(() => BA.sampleOn());
    await wait(p, 300);
    S = await samples(p);
    assert(S.every((s) => s.phase === 'companion' && ready(s.poses.pc) && ready(s.poses.comp) && !(s.effects || []).length && !s.strip), 'ready while your companion chooses; nothing drawn');
    const cf = await p.evaluate(() => { const a = document.activeElement; return a && a.closest('.cb-dock') ? 'dock' : a && a.tagName; });
    assert(cf === 'dock' || cf === 'BODY', 'focus stays with the companion\'s menu: ' + cf);
    await companionTurn(p);
    await idle(p);
    const back = await p.evaluate(() => ({ top: RB.ui.topLayer() && RB.ui.topLayer().name, recap: (document.querySelector('.clog.recap') || {}).textContent || '' }));
    assert(back.top === 'cards' && /ほどく/.test(back.recap) && /knot/.test(back.recap), 'the cards come back on top with a recap of the last exchange: ' + JSON.stringify(back));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------------------------------
// A complete exchange, captured: calm readiness → your response → its move → the reaction and
// states → recovery. The presentation clock is slowed for the capture (RB.battleSeq.setTimeScale).
async function captureExchange(name, vp, o) {
  const { p, errors, ctx } = await page(b, url, vp);
  await helpers(p);
  await battle(p, o.enemy, { comp: o.comp, words: o.words, knots: 4, timeScale: 0.2, reduce: !!o.reduce });
  await p.evaluate(([pre, it]) => { const st = RB.combat.state(); Object.assign(st, pre); BA.setIntent(it[0], it[1]); RB.combat.refresh(); }, [o.pre || {}, o.intent]);
  await cards(p);
  // the scene with its slips: left of the dock on wide screens, down to the party slip on phones
  const clip = await p.evaluate(() => {
    const d = document.querySelector('.cb-dock').getBoundingClientRect(), pa = document.querySelector('.cb-party').getBoundingClientRect();
    return d.left > innerWidth * 0.4 ? { x: 0, y: 0, width: Math.round(d.left - 4), height: innerHeight } : { x: 0, y: 0, width: innerWidth, height: Math.round(Math.min(innerHeight, pa.bottom + 4)) };
  });
  const shots = [];
  const snap = async (label) => { shots.push({ label, png: await p.screenshot({ clip }) }); };
  await snap('1 · calm: choosing');
  const c = await cardAt(p, o.card);
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal .mc .btn');
  const r = await p.evaluate(() => BA.right()); await p.mouse.click(r.x, r.y);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.evaluate(() => { window.__b0 = RB.battleSeq.stats().counters.beats; });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  // your companion's turn (the response is queued); then everything plays in order
  if (o.comp) await companionTurn(p, o.compPick || {});
  const when = async (label, fn, arg) => { await p.waitForFunction(fn, arg, { timeout: 20000, polling: 'raf' }); await snap(label); };
  await when('2 · anticipation', () => { const f = RB.combat.debug().stage.frame; return f && f.poses.pc && f.poses.pc.startsWith('anticipate'); });
  await when('3 · gesture, the word on paper', () => { const d = RB.combat.debug().stage; return d.strip && d.strip.opacity > 0.9 && d.frame.poses.pc.startsWith('act'); });
  await when('4 · on its target', () => { const d = RB.combat.debug(); return d.phase === 'player' && d.seq.counters.beats > window.__b0; });
  await when('5 · recovery', () => { const f = RB.combat.debug().stage.frame; return f && /^recover/.test(f.poses.pc || ''); });
  await when('6 · its move: preparation', () => { const d = RB.combat.debug(); return d.phase === 'enemy' && d.stage.frame.foe === 'prep'; });
  await when('7 · execution', () => { const d = RB.combat.debug(); return d.phase === 'enemy' && d.stage.frame.foe === 'exec' && d.stage.frame.effects.length; });
  await when('8 · contact, reaction', () => { const d = RB.combat.debug(); return d.phase === 'enemy' && Object.values(d.stage.frame.poses).some((x) => x === 'hit' || x === 'brace') && d.stage.frame.nums.length; });
  await when('9 · its recovery', () => { const d = RB.combat.debug(); return d.phase === 'enemy' && d.stage.frame.foe === 'recover'; });
  await p.waitForFunction(() => RB.combat.phase() === 'choose', null, { timeout: 20000 });
  await wait(p, 300);
  await snap('10 · calm again, states shown');
  for (const [i, s] of shots.entries()) fs.writeFileSync(path.join(outDir, name + '_' + String(i + 1).padStart(2, '0') + '.png'), s.png);
  const strip = await compose(shots, clip);
  fs.writeFileSync(path.join(outDir, name + '_strip.png'), strip.png);
  const frames = await p.evaluate(() => RB.combat.debug().frames);
  await p.evaluate(() => RB.battleSeq.setTimeScale(1));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  return { strip, frames, n: shots.length };
}
// Frames tiled with labels (two rows, or `cols` per row), drawn in a blank page's canvas; PNG and WebP out.
async function compose(shots, clip, perRow) {
  const pg = await b.newPage();
  const out = await pg.evaluate(async ([urls, labels, w, h, perRow]) => {
    const imgs = await Promise.all(urls.map((u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; })));
    const sc = Math.min(1, (perRow ? 420 : 520) / w), cw = Math.round(w * sc), ch = Math.round(h * sc), lab = 26;
    const cols = perRow || Math.ceil(imgs.length / 2), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas');
    cv.width = cols * cw + (cols + 1) * 6; cv.height = rows * (ch + lab) + (rows + 1) * 6;
    const g = cv.getContext('2d');
    g.fillStyle = '#1c1a26'; g.fillRect(0, 0, cv.width, cv.height);
    imgs.forEach((im, i) => {
      const x = 6 + (i % cols) * (cw + 6), y = 6 + Math.floor(i / cols) * (ch + lab + 6);
      g.imageSmoothingEnabled = true; g.drawImage(im, x, y, cw, ch);
      g.fillStyle = '#efe4c8'; g.font = '600 15px system-ui, sans-serif'; g.fillText(labels[i], x + 4, y + ch + 18);
    });
    return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.86), w: cv.width, h: cv.height };
  }, [shots.map((s) => 'data:image/png;base64,' + s.png.toString('base64')), shots.map((s) => s.label), clip.width, clip.height, perRow || 0]);
  await pg.close();
  return { png: Buffer.from(out.png.split(',')[1], 'base64'), webp: Buffer.from(out.webp.split(',')[1], 'base64'), w: out.w, h: out.h };
}

await test('a complete exchange, captured frame by frame (calm → response → its move → reaction → recovery); frame cost measured', async () => {
  const a = await captureExchange('exchange_unravel_strike', DESK, { enemy: 'rw.dustmoth', comp: 'mio', words: ['mamoru', 'mizu', 'hikari'], card: 'unravel', intent: ['strike', 'comp'], pre: { heat: 1 } });
  const bb = await captureExchange('exchange_ward_sweep', DESK, { enemy: 'rw.reedling', comp: 'nao', words: ['mamoru', 'mizu', 'hikari'], card: 'protect.*on nao', intent: ['sweep'] });
  const c = await captureExchange('exchange_phone_water', { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 }, { enemy: 'rw.inkblot', comp: 'suzu', words: ['mizu', 'mamoru'], card: 'Cools what is overheating', intent: ['strike', 'pc'], pre: { heat: 2 } });
  notes.push('captures: ' + [a, bb, c].map((x) => x.n + ' frames, strip ' + x.strip.w + '×' + x.strip.h).join('; '));
  if (toDocs) {
    const dd = path.join(root, 'docs', 'screenshots', 'battle');
    fs.mkdirSync(dd, { recursive: true });
    fs.writeFileSync(path.join(dd, 'exchange_unravel_strike.webp'), a.strip.webp);
    fs.writeFileSync(path.join(dd, 'exchange_ward_sweep.webp'), bb.strip.webp);
    fs.writeFileSync(path.join(dd, 'exchange_phone_water.webp'), c.strip.webp);
    notes.push('copied the strips to docs/screenshots/battle/ (WebP)');
  }
  // frame cost at normal speed, a few exchanges (drawing the whole battle: backdrop, stage, effects)
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'rw.dustmoth', { comp: 'mio', knots: 8 });
  for (const [k, m] of [['sweep', 'unravel'], ['heat', 'unravel'], ['strike', 'protect.*on you'], ['shroud', 'unravel'], ['rest', 'Cools what is overheating']]) {
    await p.evaluate((k) => BA.setIntent(k, k === 'strike' ? 'pc' : null), k);
    await respond(p, m);
    await idle(p);
  }
  const f = await p.evaluate(() => RB.combat.debug().frames);
  notes.push('frame cost (1280×800, headless Chromium, software canvas): all frames avg ' + f.avg + ' ms, max ' + f.max + ' ms over ' + f.n + ' frames; during sequences avg ' + f.seqAvg + ' ms, max ' + f.seqMax + ' ms over ' + f.seqN + ' frames');
  assert(f.seqAvg < 8, 'drawing stays cheap during sequences (avg ' + f.seqAvg + ' ms)');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});


// ---------------------------------------------------------------------------------------------------
// --gallery: every response and every enemy action family, captured at its beat (the moment
// its result reaches the screen), tiled into two sheets for review. Not part of the default run.
if (args.includes('--gallery')) await test('gallery: every response and enemy action family at its beat', async () => {
  const RESP = [
    ['ほどく Unravel → a thread to the knot it frees', { enemy: 'rw.reedling', comp: 'mio', card: 'unravel', intent: ['strike', 'pc'] }],
    ['守る on Nao → a seal before the ally', { enemy: 'rw.reedling', comp: 'nao', card: 'protect.*on nao', intent: ['rest'] }],
    ['癒す → motes on both, +3 each', { enemy: 'rw.reedling', comp: 'mio', words: ['iyasu', 'mizu'], card: 'Restores 3 resolve', intent: ['rest'], pre: { pc: 6, comp: 5 } }],
    ['水 → a splash on the Heat, steam', { enemy: 'co.ember', comp: 'suzu', card: 'Cools what is overheating', intent: ['rest'], pre: { heat: 2 } }],
    ['光 → a revealing flash; the mist parts', { enemy: 'sg.moth', comp: 'ren', card: 'Shows what is hidden', intent: ['rest'], pre: { shroud: true } }],
    ['風 → wind through the mist', { enemy: 'sg.moth', comp: 'nao', words: ['kaze', 'mizu'], card: 'Blows away mist', intent: ['rest'], pre: { shroud: true } }],
    ['縄 → a rope cinches; Gathering spills', { enemy: 'sg.golem', comp: 'mio', words: ['nawa', 'mizu'], card: 'Holds something in place', intent: ['rest'], pre: { charged: true } }],
    ['石 → a stone seal at your feet (Gust)', { enemy: 'sb.ghost', comp: 'nao', words: ['ishi', 'mizu'], card: 'Stands firm', intent: ['gust'] }],
    ['炎 → warmth against the Chill', { enemy: 'sb.fox', comp: 'mio', words: ['honoo', 'mizu'], card: 'Warms against cold', intent: ['chill', 'pc'] }],
    ['鈴 → rings; the Hush breaks', { enemy: 'sa.wraith', comp: 'nao', words: ['suzu', 'mizu'], card: 'breaks a hush', intent: ['rest'], pre: { silenced: 1 } }],
    ['声 → a voice into the silence', { enemy: 'sa.wraith', comp: 'mio', words: ['koe', 'mizu'], card: 'Speaks up into silence', intent: ['rest'], pre: { silenced: 1 } }],
    ['こたえる Answer → a note to the Plea', { enemy: 'sg.letter', comp: 'nao', card: 'Reply to what', intent: ['plea'] }],
    ['みぬく See through → the lie cracks', { enemy: 'sg.tideclerk', comp: 'nao', card: 'Point out what is false', intent: ['lie', 'pc'] }],
    ['あわせ Read the Opening (Nao) → two knots', { enemy: 'rw.reedling', comp: 'nao', card: 'Read the Opening', intent: ['rest'], harmony: 3 }],
    ['あわせ Clearwater Draught (Mio)', { enemy: 'rw.reedling', comp: 'mio', card: 'Clearwater Draught', intent: ['rest'], harmony: 3, pre: { pc: 5, heat: 1 } }],
    ['あわせ Lantern Ward (Ren) → seals before both', { enemy: 'rw.reedling', comp: 'ren', card: 'Lantern Ward', intent: ['rest'], harmony: 3 }],
    ['あわせ Curtain Call (Suzu)', { enemy: 'rw.reedling', comp: 'suzu', card: 'Curtain Call', intent: ['rest'], harmony: 3 }],
    ['reduced motion: 守る, still', { enemy: 'rw.reedling', comp: 'nao', card: 'protect.*on you', intent: ['rest'], reduce: true }],
  ];
  const FOE = [
    ['Strike (crab) → one target', { enemy: 'sg.crab', comp: 'mio', intent: ['strike', 'comp'] }],
    ['Sweep (crane) → both', { enemy: 'sg.crane', comp: 'nao', intent: ['sweep'] }],
    ['Flood (golem) → both', { enemy: 'sg.golem', comp: 'mio', intent: ['flood'] }],
    ['Gust (lantern) → wards torn, you hit', { enemy: 'sb.ghost', comp: 'nao', intent: ['gust'], pre: { ward: { pc: 2, comp: 2 } } }],
    ['Chill (fox) → frost on one', { enemy: 'sb.fox', comp: 'nao', intent: ['chill', 'pc'] }],
    ['False promise (clerk) → one', { enemy: 'sg.tideclerk', comp: 'nao', intent: ['lie', 'comp'] }],
    ['Mirror (echo) → one', { enemy: 'sa.echo', comp: 'mio', intent: ['mirror', 'pc'] }],
    ['Heat (ember) → shimmer, embers', { enemy: 'co.ember', comp: 'nao', intent: ['heat'] }],
    ['Shroud (moth) → mist over its knots', { enemy: 'sg.moth', comp: 'nao', intent: ['shroud'] }],
    ['Gathering (golem) → motes circle it', { enemy: 'co.golem', comp: 'nao', intent: ['charge'] }],
    ['Re-tying (blot) → a knot re-tied', { enemy: 'rw.inkblot', comp: 'nao', intent: ['mend'], knotsTied: 5 }],
    ['Hush (wraith) → a mark over you', { enemy: 'sa.wraith', comp: 'nao', intent: ['silence'] }],
    ['Plea (letter) → an unanswered note', { enemy: 'sg.letter', comp: 'nao', intent: ['plea'] }],
    ['Waiting (bell)', { enemy: 'atlas.bell', comp: 'nao', intent: ['rest'], card: 'Cools what is overheating' }],
    ['Countered (wisp) → its move fizzles', { enemy: 'rw.reedling', comp: 'nao', intent: ['heat'], card: 'Cools what is overheating' }],
    ['Blocked by 守る → the seal catches it', { enemy: 'rw.dustmoth', comp: 'mio', intent: ['strike', 'pc'], card: 'protect.*on you' }],
    ['Partly absorbed → intercept, then flinch', { enemy: 'rw.dustmoth', comp: 'mio', intent: ['strike', 'pc'], pre: { ward: { pc: 1, comp: 0 } } }],
    ['Suzu\'s flourish → the blow meets air', { enemy: 'sg.crab', comp: 'suzu', intent: ['strike', 'pc'], pre: { pc: 4 } }],
  ];
  const shoot = async (label, o, side) => {
    console.log('  gallery: ' + label);
    const { p, errors, ctx } = await page(b, url, DESK);
    await helpers(p);
    await battle(p, o.enemy, { comp: o.comp, words: o.words || ['mizu', 'mamoru', 'hikari'], knots: 6, timeScale: 0.25, harmony: o.harmony, reduce: !!o.reduce, intent: o.intent });
    await p.evaluate(([pre, it, tied]) => {
      const st = RB.combat.state();
      for (const k in pre) { if (k === 'ward') Object.assign(st.ward, pre.ward); else st[k] = pre[k]; }
      if (tied) st.knots = tied;
      BA.setIntent(it[0], it[1]);
      window.__b0 = RB.battleSeq.stats().counters.beats;
    }, [o.pre || {}, o.intent, o.knotsTied || 0]);
    const clip = await p.evaluate(() => { const r = document.querySelector('.cb-stage').getBoundingClientRect(); const pa = document.querySelector('.cb-party').getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(Math.max(0, r.top - 40)), width: Math.round(r.width), height: Math.round(Math.min(innerHeight, pa.top) - Math.max(0, r.top - 40)) }; });
    await respond(p, o.card || 'unravel');
    if (side === 'resp') await p.waitForFunction(() => /player|finish/.test(RB.combat.phase()) && RB.battleSeq.stats().counters.beats > window.__b0, null, { timeout: 20000, polling: 'raf' });
    else {
      await p.waitForFunction(() => RB.combat.phase() === 'enemy', null, { timeout: 20000, polling: 'raf' });
      await p.evaluate(() => { window.__b1 = RB.battleSeq.stats().counters.beats; });
      await p.waitForFunction(() => RB.combat.phase() === 'enemy' && RB.battleSeq.stats().counters.beats > window.__b1, null, { timeout: 20000, polling: 'raf' });
    }
    await wait(p, 320);
    const png = await p.screenshot({ clip });
    fs.writeFileSync(path.join(outDir, 'gallery_' + side + '_' + label.replace(/[^A-Za-z]+/g, '_').replace(/^_|_$/g, '').slice(0, 28).toLowerCase() + '.png'), png);
    assert(!errors.length, label + ': ' + errors.join('; '));
    await ctx.close();
    return { label, png, clip };
  };
  const resp = [], foe = [];
  for (const [l, o] of RESP) resp.push(await shoot(l, o, 'resp'));
  for (const [l, o] of FOE) foe.push(await shoot(l, o, 'foe'));
  const r1 = await compose(resp, resp[0].clip, 6), r2 = await compose(foe, foe[0].clip, 6);
  fs.writeFileSync(path.join(outDir, 'gallery_responses.png'), r1.png);
  fs.writeFileSync(path.join(outDir, 'gallery_enemy_moves.png'), r2.png);
  if (toDocs) {
    const dd = path.join(root, 'docs', 'screenshots', 'battle');
    fs.mkdirSync(dd, { recursive: true });
    fs.writeFileSync(path.join(dd, 'gallery_responses.webp'), r1.webp);
    fs.writeFileSync(path.join(dd, 'gallery_enemy_moves.webp'), r2.webp);
  }
  notes.push('gallery: ' + resp.length + ' responses, ' + foe.length + ' enemy moves');
});

await b.close(); srv.close();
for (const n of notes) console.log('note: ' + n);
console.log('\n' + results.join('\n') + '\n\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
