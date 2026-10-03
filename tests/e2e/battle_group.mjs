// Battles with more than one creature, against the built index.html in
// Chromium, with the real mouse, keyboard and touch:
// - the difficulty decides how many come: Relaxed one, Standard two,
//   Demanding three — at the Stacks, the Conduits and in an Atlas room
//   (seeded), and the Atlas guardian with its attendants;
// - choosing the target: a click on the creature (and on its slip), the
//   arrow keys on the slips and [ ]; the ink bracket at its feet, the slip and
//   the cards' "on …" labels follow; a touch tap selects;
// - previews: pointing at (or focusing) a card marks whom it reaches — the
//   target for Unravel, every creature for water — kept through its step,
//   cleared on "Choose a different response";
// - each creature telegraphs and acts in turn (one sequence each); one
//   settles and the others go on; the win after the last; every result is
//   applied once (the rules' state before/after against the fx lists) and the
//   display ends equal to the rules;
// - reduced motion; 320×640 and 200 % text layouts; Next after the battle;
// - captures of a pair and a trio with the target bracket and a group
//   preview (tests/e2e/out/battle_group/; with --docs, WebP copies in
//   docs/screenshots/battle/).
// Usage: node tests/e2e/battle_group.mjs [filter] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_group');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const PHONE = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
const wait = (p, ms) => p.waitForTimeout(ms);
const ALLW = ['mamoru', 'iyasu', 'hikari', 'mizu', 'kaze', 'nawa', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
const MOVES = ['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'];

// In-page helpers: the rules' calls with their state before/after and fx, and the right option.
async function helpers(p) {
  await p.evaluate(() => {
    const pick = (x) => x && { pc: x.pc, comp: x.comp, ward: Object.assign({}, x.ward), silenced: x.silenced || 0, harmony: x.harmony, foes: (x.foes || []).map((f) => ({ knots: f.knots, heat: f.heat, shroud: !!f.shroud, charged: !!f.charged })) };
    const G = (window.G = { calls: { playerAct: 0, compAct: 0, enemyAct: 0, endRound: 0 }, exch: [], pick });
    const L = RB.combatLogic;
    for (const k of ['playerAct', 'compAct', 'enemyAct', 'endRound']) {
      const f = L[k];
      L[k] = function (st, ...a) {
        G.calls[k]++;
        const before = JSON.parse(JSON.stringify(pick(st)));
        const r = f.call(this, st, ...a);
        G.exch.push({ k, before, after: JSON.parse(JSON.stringify(pick(st))), fx: k === 'playerAct' || k === 'compAct' ? r.fx : k === 'enemyAct' ? r : null });
        return r;
      };
    }
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    G.right = () => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const el = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
      el.setAttribute('data-right', '1');
      el.scrollIntoView({ block: 'center' });
      const q = el.getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    };
  });
}
// A campaign placed on a map, then the battle of a group placement there (as walking into it would start it).
async function battle(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map, o.x || 5, o.y || 5, { comp: o.comp || null, flags: o.flags || {} });
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E'; s.learn.difficulty = o.diff;
    s.words = (o.words || []).slice();
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1, group: o.groupTip ? 0 : 1 }, ...o.moves.map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    if (o.groupTip) delete s.tips.group;
    RB.game.settings.input = 'choice';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    if (o.text) { RB.game.settings.textScale = 2; RB.game.applySettings(); }
    RB.battleSeq.setTimeScale(o.timeScale || 3);
    const place = o.place || RB.content.maps[o.map].foes.find((f) => f.id === o.foe);
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: o.map, x: place.x, y: place.y }, foeKey: 'foe:' + o.map + ':' + place.id }).then((r) => { window.__result = r || 'done'; });
  }, Object.assign({ moves: MOVES }, o));
  await cards(p);
}
async function cards(p) {
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (s.cards || s.r) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  await wait(p, 150);
}
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom }; }, sel);
// a real click on the first visible point of an element (scrolled into view; a card taller than
// its scroll box at 200 % text is pressed where it shows)
async function clickVisible(p, sel) {
  // (a panel still sliding in is given a moment to come to rest)
  let pt = null;
  for (let k = 0; k < 12 && (!pt || pt.miss); k++) { if (k) await wait(p, 100); pt = await visiblePoint(p, sel); }
  assert(pt && !pt.miss, sel + ' is not visible anywhere ' + JSON.stringify(pt));
  await p.mouse.click(pt.x, pt.y);
}
function visiblePoint(p, sel) {
  return p.evaluate((q) => {
    const el = document.querySelector(q);
    el.scrollIntoView({ block: 'start' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2;
    for (let y = Math.max(r.top, 0) + 6; y < Math.min(r.bottom, innerHeight); y += 6) { const top = document.elementFromPoint(x, y); if (top && top.closest(q)) return { x, y }; }
    const at = document.elementFromPoint(x, Math.min(innerHeight - 2, Math.max(2, r.top + 8)));
    return { miss: true, r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], vw: [innerWidth, innerHeight], at: at && at.outerHTML.slice(0, 140), text: el.textContent.slice(0, 40) };
  }, sel);
}
const clickCard = async (p, re) => { const sel = await cardSel(p, re); await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await wait(p, 60); const c = await center(p, sel); await p.mouse.click(c.x, c.y); };
const cardSel = async (p, re) => { const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re); assert(i != null, 'no card matching ' + re); return '.rcard[data-i="' + i + '"]'; };
// Answer the open step with the right option (mouse), continue, and take your companion's turn.
async function answer(p, o) {
  await p.waitForSelector('.chal .mc .btn, .chal[data-kind=order]', { timeout: 10000 }).catch(async () => { throw new Error('no task opened: ' + JSON.stringify(await p.evaluate(() => ({ phase: RB.combat.phase(), chal: !!document.querySelector('.chal'), kind: (document.querySelector('.chal') || { dataset: {} }).dataset.kind, dlg: RB.ui.dialogue.isOpen() })))); });
  // the pointer is moved off the options first: left resting on another option's word (where the response
  // card was), its hover word-help card can open over the right option between measuring and clicking
  if (await p.$('.chal .mc .btn')) { await p.mouse.move(2, 2); await wait(p, 120); await p.evaluate(() => G.right()); await clickVisible(p, '.chal .mc .btn[data-right="1"]'); }
  else { await p.click('.chal [data-a=reveal]'); }
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 }).catch(async () => { throw new Error('no feedback after answering: ' + JSON.stringify(await p.evaluate(() => ({ fb: (document.querySelector('.fbwrap') || {}).outerHTML && document.querySelector('.fbwrap').getAttribute('data-fb'), kind: document.querySelector('.chal') && document.querySelector('.chal').dataset.kind, mode: document.querySelector('.chal') && document.querySelector('.chal').dataset.mode })))); });
  await clickVisible(p, '.fbwrap .fb-go');
  return companionTurn(p, (o && o.comp) || {});
}
async function idle(p) {
  for (let i = 0; i < 500; i++) {
    const s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), res: window.__result }));
    if (!s.busy && (s.cards || s.dlg || s.res)) { await wait(p, 60); return s; }
    await wait(p, 40);
  }
  throw new Error('the exchange did not settle');
}
const state = (p) => p.evaluate(() => { const st = RB.combat.state(); return st && { cur: st.cur, n: st.foes.length, foes: st.foes.map((f) => ({ id: f.enemyId, knots: f.knots, max: f.maxKnots, kind: f.intent && f.intent.kind, settled: !!f.settled })) }; });
const marks = (p) => p.evaluate(() => ({ m: RB.combat.marks(), frame: RB.combat.debug().stage.frame && { target: RB.combat.debug().stage.frame.target, preview: RB.combat.debug().stage.frame.preview }, slips: [...document.querySelectorAll('.cb-foe .fs')].map((x) => ({ i: +x.dataset.foe, on: x.classList.contains('on'), pv: x.classList.contains('cb-pv'), checked: x.getAttribute('aria-checked') })) }));
async function flee(p) {
  await p.click('[data-flee]');
  await p.waitForSelector('[role=alertdialog] .foot button');
  await p.click('[role=alertdialog] .foot button >> nth=0');
  await p.waitForFunction(() => window.__result === 'flee' && RB.game.mode() === 'world', null, { timeout: 15000 });
}
async function toWebp(p, png) {
  return p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const cv = document.createElement('canvas'); cv.width = Math.round(img.width / 2); cv.height = Math.round(img.height / 2);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/webp', 0.86).split(',')[1];
  }, png.toString('base64'));
}

// ---------------------------------------------------------------------------------------------------
await test('the setting decides how many come: Relaxed one, Standard two, Demanding three (the Stacks, the Conduits, an Atlas room, the Atlas guardian)', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const got = {};
  for (const diff of ['relaxed', 'normal', 'hard']) {
    for (const [map, foe] of [['sa.stacks', 'w1'], ['sa.conduits', 'g1']]) {
      await battle(p, { map, foe, diff, words: ALLW, comp: 'nao' });
      const s = await state(p);
      const ui = await p.evaluate(() => ({ slips: document.querySelectorAll('.cb-foe .fs').length, group: document.querySelector('.combat-ui').classList.contains('cb-group'), lay: RB.battleStage.stats().lay.foes.length, members: RB.combat.members() }));
      got[diff + ' ' + map] = s.n;
      const want = { relaxed: 1, normal: 2, hard: 3 }[diff];
      assert(s.n === want && ui.lay === want, diff + ' ' + map + ': ' + want + ' creature(s), got ' + JSON.stringify({ s, ui }));
      assert(want === 1 ? ui.slips === 0 && !ui.group : ui.slips === want && ui.group, diff + ' ' + map + ': one slip per creature in a group (and the single slip otherwise) ' + JSON.stringify(ui));
      assert(s.foes[0].id === RB_lead(map, foe), 'the lead is the placed creature');
      await flee(p);
    }
  }
  // an Atlas room from a seeded run: the guardian of a wild room, on its own map, as the generator placed it
  const at = await p.evaluate(() => {
    const s = RB.game.debugStart('rw.hall', 5, 5, {});
    const out = {};
    for (let seed = 3; seed < 40 && !out.id; seed++) {
      const run = RB.atlas.newRun(s, [], { seed });
      const P = RB.atlas.register(run);
      for (const d of Object.values(P.rooms)) if (d.guard) { const id = RB.atlas.mapId(run, d.key); const pl = RB.content.maps[id].foes.find((f) => f.id === 'guard'); if (pl && pl.group) { Object.assign(out, { id, seed, pl, att: P.rooms.x.attendants, boss: RB.content.atlas.climaxes[P.rooms.x.boss].enemy }); s.atlas.run = run; break; } }
    }
    window.__atlas = out;
    return out;
  });
  assert(at.id && at.pl.group.normal.length === 1 && at.pl.group.hard.length === 2, 'a seeded Atlas run places a guardian with a group ' + JSON.stringify(at));
  for (const diff of ['relaxed', 'normal', 'hard']) {
    await p.evaluate(([at, diff]) => {
      const run = RB.game.s.atlas.run;
      const s = RB.game.debugStart(at.id, at.pl.x, at.pl.y + 1, { comp: 'mio' });
      s.atlas.run = run; s.learn.difficulty = diff; s.learn.kanaKnown = 'both'; s.words = ['mamoru', 'iyasu', 'hikari', 'mizu', 'kaze', 'nawa', 'ishi', 'suzu', 'koe', 'honoo'];
      s.tips = { harmony: 1, group: 1, cturn: 1 };
      RB.game.settings.input = 'choice';
      window.__result = null;
      RB.game.startBattle(at.pl.enemy, { place: at.pl, where: { map: at.id, x: at.pl.x, y: at.pl.y }, foeKey: 'foe:' + at.id + ':guard' }).then((r) => { window.__result = r || 'done'; });
    }, [at, diff]);
    await cards(p);
    const s = await state(p);
    assert(s.n === { relaxed: 1, normal: 2, hard: 3 }[diff] && s.foes.slice(1).every((f, i) => f.id === at.pl.group[diff === 'hard' ? 'hard' : 'normal'][i]), 'Atlas room, ' + diff + ': ' + JSON.stringify(s.foes.map((f) => f.id)));
    got[diff + ' atlas'] = s.n;
    await flee(p);
  }
  // the guardian's attendants (as the climax hook starts it)
  for (const diff of ['relaxed', 'normal', 'hard']) {
    const n = await p.evaluate(async ([at, diff]) => {
      RB.game.s.learn.difficulty = diff;
      const L = RB.combatLogic;
      return L.groupFor(at.boss, { group: at.att }, diff);
    }, [at, diff]);
    assert(n.length === { relaxed: 1, normal: 2, hard: 3 }[diff] && n[0] === at.boss, 'the Atlas guardian with ' + (n.length - 1) + ' attendant(s) on ' + diff);
  }
  console.log('   creatures per encounter: ' + JSON.stringify(got));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});
function RB_lead(map, foe) { return { 'sa.stacks:w1': 'sa.wraith', 'sa.conduits:g1': 'sa.ghost' }[map + ':' + foe]; }

// ---------------------------------------------------------------------------------------------------
await test('choosing the target: a click on the creature and on its slip, arrow keys on the slips and [ ]; the bracket, the slip and the cards follow; screen-reader labels', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'sa.stacks', foe: 'w1', diff: 'hard', words: ALLW, comp: 'mio' });
  const s0 = await state(p);
  assert(s0.n === 3, 'three creatures');
  const m0 = await marks(p);
  assert(m0.m.target === s0.cur && m0.frame.target === s0.cur && m0.slips.find((x) => x.i === s0.cur).on && m0.slips.filter((x) => x.on).length === 1, 'one target: its bracket is drawn and its slip is marked ' + JSON.stringify(m0));
  // a click on another creature on the stage (where only it is drawn)
  const other = (s0.cur + 1) % 3;
  const pt = await p.evaluate((i) => {
    const d = RB.combat.debug().stage, h = d.hits.find((q) => q.i === i), k = d.cssPerArt;
    // a point of its drawing that no other creature covers
    for (let yy = h.y + 4; yy < h.y + h.h; yy += 3) for (let xx = h.x + 2; xx < h.x + h.w; xx += 3) if (RB.battleStage.foeAt(xx, yy) === i) { const e = document.elementFromPoint(xx, yy); if (e && e.classList.contains('cb-hit')) return { x: xx, y: yy, k }; }
    return null;
  }, other);
  assert(pt, 'the creature can be pressed somewhere on the stage');
  await p.mouse.click(pt.x, pt.y);
  await wait(p, 120);
  let m = await marks(p), s = await state(p);
  assert(s.cur === other && m.m.target === other && m.frame.target === other && m.slips.find((x) => x.i === other).on && m.slips.find((x) => x.i === other).checked === 'true', 'the click on the stage moved the target: ' + JSON.stringify({ cur: s.cur, m }));
  const label = await p.evaluate((i) => { const c = [...document.querySelectorAll('.rcard')].find((x) => /Unravel/.test(x.textContent)); return c.querySelector('.rc-tgt').textContent; }, other);
  const short = s.foes[other].id === 'sa.moth' ? 'Moth' : s.foes[other].id === 'sa.crane' ? 'Crane' : 'Wraith';
  assert(new RegExp('on the ' + short, 'i').test(label), 'Unravel now says whom it acts on: ' + label);
  // Adaptive: the target is its plate (paper, the bracket); Expanded: the telegraph leads with the target's
  const plateOn = await p.evaluate(() => { const e = document.querySelector('.cb-foe .fs.on'); return e ? +e.dataset.foe : null; });
  assert(plateOn === other, 'the new target\'s plate is marked ' + plateOn);
  await p.evaluate(() => { RB.game.settings.intentDisplay = 'expanded'; RB.combat.refresh(); });
  const telegraph = await p.evaluate(() => document.querySelector('.intent .it-block').getAttribute('data-foe'));
  assert(+telegraph === other, 'Expanded: the telegraph leads with the new target\'s');
  await p.evaluate(() => { RB.game.settings.intentDisplay = 'adaptive'; RB.combat.refresh(); });
  // its slip, with the mouse
  const third = [0, 1, 2].find((i) => i !== other && i !== s0.cur);
  await p.click('.cb-foe .fs[data-foe="' + third + '"]');
  await wait(p, 100);
  s = await state(p);
  assert(s.cur === third, 'a click on a slip chooses that creature');
  // the keyboard: focus the slips (Tab reaches the radio group), arrows move the target; [ and ] anywhere
  await p.focus('.cb-foe .fs.on');
  const order = await p.evaluate(() => RB.battleStage.stats().lay.visual);
  await p.keyboard.press('ArrowRight');
  await wait(p, 100);
  s = await state(p);
  const nextVisual = order[(order.indexOf(third) + 1) % 3];
  const fk = await p.evaluate(() => { const a = document.activeElement; return { slip: a && a.classList.contains('fs') ? +a.dataset.foe : null, focusVisible: a && a.matches(':focus-visible') }; });
  assert(s.cur === nextVisual && fk.slip === nextVisual && fk.focusVisible, 'ArrowRight on the slips moves the target to the next creature across the stage, with visible focus ' + JSON.stringify({ cur: s.cur, fk, order }));
  await p.focus('.rcard[data-i]');
  await p.keyboard.press(']');
  await wait(p, 100);
  s = await state(p);
  assert(s.cur === order[(order.indexOf(nextVisual) + 1) % 3], '] steps the target on, from the responses too');
  await p.keyboard.press('[');
  await wait(p, 100);
  s = await state(p);
  assert(s.cur === nextVisual, '[ steps it back');
  // screen readers: a radio group of creatures, each named with its knots and its move; the change announced
  const sr = await p.evaluate(() => ({ group: document.querySelector('.cb-foe [role=radiogroup]') && document.querySelector('.cb-foe [role=radiogroup]').getAttribute('aria-labelledby'), labels: [...document.querySelectorAll('.cb-foe .fs')].map((x) => x.getAttribute('aria-label')), live: (document.querySelector('.cb-sr') || {}).textContent, hitsHidden: document.querySelector('.cb-stage').getAttribute('aria-hidden') }));
  assert(sr.group && sr.labels.every((l) => /knots, about to |settled/.test(l)) && /Target: /.test(sr.live) && sr.hitsHidden === 'true', 'screen-reader labels: ' + JSON.stringify(sr));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  // touch: a tap on a creature selects it (no hover needed)
  const T = await page(b, url, PHONE(390, 844));
  await helpers(T.p);
  await battle(T.p, { map: 'sa.stacks', foe: 'w1', diff: 'normal', words: ALLW, comp: 'nao' });
  const st = await state(T.p);
  const o2 = st.cur === 0 ? 1 : 0;
  const tp = await T.p.evaluate((i) => { const d = RB.combat.debug().stage, h = d.hits.find((q) => q.i === i); for (let yy = h.y + 4; yy < h.y + h.h; yy += 3) for (let xx = h.x + 2; xx < h.x + h.w; xx += 3) if (RB.battleStage.foeAt(xx, yy) === i) { const e = document.elementFromPoint(xx, yy); if (e && e.classList.contains('cb-hit')) return { x: xx, y: yy }; } return null; }, o2);
  assert(tp, 'on a phone the creature can be tapped');
  await T.p.touchscreen.tap(tp.x, tp.y);
  await wait(T.p, 120);
  assert((await state(T.p)).cur === o2, 'a tap on the creature chose it');
  await T.p.touchscreen.tap(...Object.values(await T.p.evaluate((i) => { const r = document.querySelector('.cb-foe .fs[data-foe="' + i + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, st.cur)));
  await wait(T.p, 120);
  assert((await state(T.p)).cur === st.cur, 'a tap on a slip chose that creature');
  assert(!T.errors.length, T.errors.join('; '));
  await T.ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('previews: Unravel marks the target, water marks every creature, heal both of you; kept while its step is open; cleared by "Choose a different response"', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'sa.stacks', foe: 'w1', diff: 'hard', words: ALLW, comp: 'mio' });
  const s0 = await state(p);
  const hover = async (re) => { const sel = await cardSel(p, re); await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await wait(p, 60); const c = await center(p, sel); await p.mouse.move(c.x, c.y); await wait(p, 120); return marks(p); };
  let m = await hover('Unravel');
  assert(JSON.stringify(m.m.preview.foes) === JSON.stringify([s0.cur]) && m.frame.preview.foes.join() === String(s0.cur) && m.slips.filter((x) => x.pv).map((x) => x.i).join() === String(s0.cur), 'Unravel under the pointer marks the target only ' + JSON.stringify(m));
  m = await hover('みず\\s*water');
  assert(m.m.preview.foes.slice().sort().join() === '0,1,2' && m.frame.preview.foes.length === 3 && m.slips.every((x) => x.pv), 'water marks every creature at once ' + JSON.stringify(m));
  m = await hover('heal, soothe');
  const party = await p.evaluate(() => [...document.querySelectorAll('.cb-party .pm')].map((x) => x.classList.contains('cb-pv')));
  assert(m.m.preview.allies.join() === 'pc,comp' && m.frame.preview.allies.length === 2 && party.every(Boolean) && !m.slips.some((x) => x.pv), 'heal marks you both, no creature ' + JSON.stringify({ m, party }));
  await p.mouse.move(640, 5);
  await wait(p, 120);
  m = await marks(p);
  assert(!m.m.preview && !m.slips.some((x) => x.pv), 'leaving the cards: the marks go');
  // keyboard focus previews too
  await p.focus(await cardSel(p, 'wind'));
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowUp');
  await wait(p, 120);
  m = await marks(p);
  assert(m.m.preview && m.m.preview.foes.length >= 1, 'keyboard focus on a card previews it ' + JSON.stringify(m.m));
  // choose water: the preview stays while its step is open
  await clickCard(p, 'みず\\s*water');
  await p.waitForSelector('.chal');
  await wait(p, 200);
  m = await marks(p);
  const situ = await p.evaluate(() => document.querySelector('.chal .cb-situ').textContent.replace(/\s+/g, ' '));
  assert(m.m.preview && m.m.preview.foes.length === 3 && m.frame.preview.foes.length === 3 && /on all three/i.test(situ), 'during the step the preview is kept, and the task says whom it acts on: ' + JSON.stringify(m.m) + ' | ' + situ);
  // back out: the preview drops back
  await p.click('.chal [data-a=leave]');
  await cards(p);
  // (the pointer, left where the button was, may now rest on a card: move it off)
  await p.mouse.move(640, 5);
  await wait(p, 120);
  m = await marks(p);
  assert(!m.m.preview && !m.slips.some((x) => x.pv) && m.frame.preview == null, '"Choose a different response": the marks are gone ' + JSON.stringify(m));
  const calls = await p.evaluate(() => G.calls.playerAct);
  assert(calls === 0, 'and nothing was applied');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('each creature telegraphs and acts in turn; one settles and the others go on; the win after the last; every result applied once, the display equal to the rules', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'sa.stacks', foe: 'm1', diff: 'hard', words: ALLW, comp: 'ren' });
  const s0 = await state(p);
  assert(s0.n === 3 && s0.foes.every((f) => f.id === 'sa.moth'), 'three moths: ' + JSON.stringify(s0));
  const tele = await p.evaluate(() => [...document.querySelectorAll('.cb-foe .fs .fs-it')].map((x) => x.textContent.trim()));
  assert(tele.length === 3 && tele.every((t) => t.length > 2), 'every creature\'s move is on its slip before you choose: ' + JSON.stringify(tele));
  let rounds = 0, settledSeen = false;
  while (rounds < 12) {
    rounds++;
    const before = await state(p);
    const standing = before.foes.map((f, i) => (f.knots > 0 ? i : -1)).filter((i) => i >= 0);
    // unravel the target (the stage keeps the one with the fewest knots targeted, as a player would)
    const tgt = standing.sort((a, b2) => before.foes[a].knots - before.foes[b2].knots)[0];
    await p.click('.cb-foe .fs[data-foe="' + tgt + '"]');
    const un = await cardSel(p, 'Unravel');
    await p.click(un);
    await answer(p);
    const r = await idle(p);
    // this exchange's sequences: from your response on
    const tr = await p.evaluate(() => { const T = RB.combat.debug().trace; let i = T.length - 1; while (i > 0 && T[i].kind !== 'player' && T[i].kind !== 'finish') i--; return T.slice(i).map((x) => ({ kind: x.kind, foe: x.meta && x.meta.foe, beats: x.beats.map((y) => y.t) })); });
    const after = await state(p);
    // (the winning exchange ends with the finish, then the last line)
    if (r.res || !after || tr.some((x) => x.kind === 'finish')) break;
    // the creatures that stood after your response each had their own sequence, in order
    const enemies = tr.filter((x) => x.kind === 'enemy');
    const actedFoes = enemies.map((x) => x.foe);
    const stoodAfter = after.foes.map((f, i) => (f.knots > 0 || before.foes[i].knots > 0 ? i : -1)).filter((i) => i >= 0);
    assert(enemies.length >= 1 && actedFoes.every((f, k) => k === 0 || f > actedFoes[k - 1]), 'each creature acts in turn, in order: ' + JSON.stringify(tr));
    if (after.foes.some((f, i) => f.settled && !before.foes[i].settled)) {
      settledSeen = true;
      const i = after.foes.findIndex((f, k) => f.settled && !before.foes[k].settled);
      const seen = await p.evaluate((i) => ({ slip: document.querySelector('.cb-foe .fs[data-foe="' + i + '"]').classList.contains('down'), log: document.querySelector('.clog').textContent, drawn: RB.battleStage.stats().settled[i], cur: RB.combat.state().cur }), i);
      assert(seen.slip && seen.drawn && /settles/.test(seen.log) && seen.cur !== i && after.foes.some((f) => f.knots > 0), 'one settled: its slip says so, it is drawn settled, its line is logged, the target moves on and the others go on ' + JSON.stringify(seen));
      assert(!actedFoes.includes(i), 'the settled creature no longer acts');
    }
    void stoodAfter;
  }
  await p.waitForFunction(() => window.__result || RB.ui.dialogue.isOpen(), null, { timeout: 15000 });
  assert(settledSeen, 'at least one creature settled while others stood');
  // every rules call applied once; each call's fx accounts for the change it made
  const ex = await p.evaluate(() => G.exch);
  for (const e of ex.filter((x) => x.k === 'enemyAct')) {
    const hits = e.fx.filter((f) => f.t === 'hit');
    const lost = (e.before.pc - e.after.pc) + (e.before.comp - e.after.comp);
    const hitSum = hits.reduce((n, f) => n + f.n, 0);
    assert(lost === hitSum || e.fx.some((f) => f.t === 'comp'), 'the resolve lost in an exchange is the sum of its hits (' + lost + ' vs ' + hitSum + ')');
    assert(e.fx.every((f) => f.foe != null), 'every result names the creature that made it');
  }
  const calls = await p.evaluate(() => G.calls);
  assert(calls.playerAct === rounds && calls.enemyAct >= rounds - 1 && calls.enemyAct <= rounds, 'one response and one enemy exchange per round: ' + JSON.stringify(calls) + ' rounds ' + rounds);
  // the win after the last, then the last line, then back in the world
  for (let i = 0; i < 40 && !(await p.evaluate(() => window.__result)); i++) { if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.click('.dlg:not(.hidden) .b-next').catch(() => {}); await wait(p, 150); }
  const fin = await p.evaluate(() => ({ r: window.__result, flag: RB.game.s.flags['foe:sa.stacks:m1'], mode: RB.game.mode() }));
  assert(fin.r === 'win' && fin.flag === true && fin.mode === 'world', 'won; the placement\'s own flag is set once: ' + JSON.stringify(fin));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('reduced motion; 320×640 and 200 % text; the Next after the battle takes one click', async () => {
  for (const [vp, o] of [[PHONE(320, 640), {}], [PHONE(320, 640), { text: 2 }], [DESK, { reduce: true }], [PHONE(844, 390), {}]]) {
    const { p, errors, ctx } = await page(b, url, vp);
    await helpers(p);
    await battle(p, Object.assign({ map: 'sa.conduits', foe: 'g1', diff: 'hard', words: ALLW, comp: 'suzu' }, o));
    const tag = vp.viewport.width + '×' + vp.viewport.height + (o.text ? ' 200%' : '') + (o.reduce ? ' reduced' : '');
    // the dock slides in from the side when it fills (by design): measure once nothing is mid-transition, or a
    // loaded machine catches it half way in and it reads as running off the side
    await p.waitForFunction(() => !document.getAnimations().some((a) => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.combat-ui') && !a.effect.target.closest('.cb-stage, .cb-fx')), null, { timeout: 5000 }).catch(() => {});
    const lay = await p.evaluate(() => {
      const vw = innerWidth, ov = [];
      for (const e of document.querySelectorAll('.combat-ui *')) { if (e.closest('.cb-fx') || e.closest('.cb-stage')) continue; const r = e.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1)) ov.push(e.tagName + '.' + e.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); }
      const slips = [...document.querySelectorAll('.cb-foe .fs')].map((e) => {
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        // its content: the lines in flow, the padding and the border (a slip is as tall as what it says)
        const inner = [...e.children].filter((c) => getComputedStyle(c).position !== 'absolute').reduce((n, c) => n + c.getBoundingClientRect().height, 0);
        const box = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
        return { w: Math.round(r.width), h: Math.round(r.height), content: Math.round(Math.max(inner + box, parseFloat(cs.minHeight) || 0)) };
      });
      return { ov, slips, stageH: Math.round(document.querySelector('.cb-stage').getBoundingClientRect().height), scrollW: document.querySelector('.combat-ui').scrollWidth, cw: document.querySelector('.combat-ui').clientWidth };
    });
    assert(!lay.ov.length && lay.scrollW <= lay.cw + 1, tag + ': nothing runs off the side ' + JSON.stringify(lay));
    assert(lay.slips.length === 3 && lay.slips.every((s) => s.h >= 44 && s.w >= 44), tag + ': three slips, each at least a 44 px target ' + JSON.stringify(lay.slips));
    // compact: the row of slips is as tall as the fullest slip's lines (never stretched into a tall box that squeezes the stage)
    assert(Math.max(...lay.slips.map((s) => s.h)) <= Math.max(...lay.slips.map((s) => s.content)) + 6, tag + ': the slips stay compact ' + JSON.stringify(lay.slips));
    // (a 320×640 portrait phone keeps the stage's 60 px minimum, as with one creature: noted in docs/COMBAT_NOTES.md)
    if (!o.text) assert(lay.stageH >= (vp.viewport.height < 700 && vp.viewport.width < 600 ? 60 : 120), tag + ': the stage keeps room for the creatures (' + lay.stageH + ' px)');
    if (o.reduce) {
      const cv = await p.evaluate(async () => { const c = document.getElementById('world'), g = c.getContext('2d'); const a = g.getImageData(0, 0, c.width, c.height).data; await new Promise((r) => setTimeout(r, 400)); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - d[i]) + Math.abs(a[i + 1] - d[i + 1]) + Math.abs(a[i + 2] - d[i + 2]) > 24) n++; return n; });
      assert(cv < 50, tag + ': the scene is still while you choose (' + cv + ' px changed)');
      // hover water: the marks are still too
      const ws = await cardSel(p, 'みず\\s*water');
      await p.evaluate((s2) => document.querySelector(s2).scrollIntoView({ block: 'center' }), ws);
      await wait(p, 60);
      const c = await center(p, ws);
      await p.mouse.move(c.x, c.y);
      await wait(p, 200);
      const cv2 = await p.evaluate(async () => { const c = document.getElementById('world'), g = c.getContext('2d'); const a = g.getImageData(0, 0, c.width, c.height).data; await new Promise((r) => setTimeout(r, 300)); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - d[i]) + Math.abs(a[i + 1] - d[i + 1]) + Math.abs(a[i + 2] - d[i + 2]) > 24) n++; return n; });
      assert(cv2 < 50, tag + ': preview marks do not move (' + cv2 + ' px changed)');
    }
    // (at 200 % text the layout is what is checked; the fight is then played at normal size)
    if (o.text) await p.evaluate(() => { RB.game.settings.textScale = 1; RB.game.applySettings(); });
    // play it out with Unravel (the target nearest to settling), then the last line with one click on Next
    for (let k = 0; k < 30 && !(await p.evaluate(() => window.__result)); k++) {
      if (await p.evaluate(() => RB.ui.dialogue.isOpen())) break;
      const t2 = await p.evaluate(() => { const st = RB.combat.state(); const up = RB.combatLogic.standing(st).sort((a, b2) => st.foes[a].knots - st.foes[b2].knots); return up[0]; });
      await p.evaluate((i) => RB.combat.target(i), t2);
      const dis = await p.evaluate(() => { const u = [...document.querySelectorAll('.rcard[data-i]')].find((x) => /Unravel/.test(x.textContent)); return !u || u.disabled; });
      const sel = await cardSel(p, dis ? (await p.evaluate(() => RB.combat.state().silenced)) ? 'bell' : 'wind' : 'Unravel');
      await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
      await clickVisible(p, sel);
      await answer(p);
      await idle(p);
    }
    await p.waitForFunction(() => RB.ui.dialogue.isOpen() || window.__result, null, { timeout: 20000 }).catch(async () => { throw new Error(tag + ': the battle did not end ' + JSON.stringify(await p.evaluate(() => ({ phase: RB.combat.phase(), st: RB.combat.state() && RB.combat.state().foes.map((f) => f.knots) })))); });
    // the last line: Next is on top and takes the mouse (a long line on a small screen may
    // first finish writing out or scroll, as any line does: at most three clicks)
    let clicks = 0;
    await wait(p, 600);
    while (!(await p.evaluate(() => window.__result)) && clicks < 3) {
      const nx = await p.evaluate(() => { const b0 = document.querySelector('.dlg:not(.hidden) .b-next'); if (!b0) return null; const q = b0.getBoundingClientRect(); const x = q.left + q.width / 2, y = q.top + q.height / 2; const top = document.elementFromPoint(x, y); return { x, y, onTop: !!(top && top.closest('.b-next')) }; });
      if (!nx) { await wait(p, 200); continue; }
      assert(nx.onTop, tag + ': Next is on top after the battle');
      await p.mouse.click(nx.x, nx.y);
      clicks++;
      await wait(p, 500);
    }
    await p.waitForFunction(() => window.__result, null, { timeout: 15000 }).catch(async () => {
      throw new Error(tag + ': Next did not end the battle in ' + clicks + ' clicks ' + JSON.stringify(await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), text: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent, phase: RB.combat.phase(), mode: RB.game.mode() }))));
    });
    assert((await p.evaluate(() => window.__result)) === 'win', tag + ': won');
    assert(!errors.length, tag + ': ' + errors.join('; '));
    await ctx.close();
  }
});

// ---------------------------------------------------------------------------------------------------
await test('captures: a pair and a trio with the target bracket and a group preview', async () => {
  const shots = [];
  for (const [name, vp, o, hoverRe] of [
    ['pair_target_1280x800', DESK, { map: 'sa.stacks', foe: 'w1', diff: 'normal', comp: 'nao' }, null],
    ['trio_water_preview_1280x800', DESK, { map: 'sa.stacks', foe: 'w1', diff: 'hard', comp: 'mio' }, 'みず\\s*water'],
    ['trio_target_390x844', PHONE(390, 844), { map: 'sa.conduits', foe: 'g2', diff: 'hard', comp: 'suzu' }, null],
    ['pair_companion_turn_1280x800', DESK, { map: 'sa.conduits', foe: 'c1', diff: 'normal', comp: 'ren', flags: { ch2_done: true } }, 'companion'],
  ]) {
    const { p, errors, ctx } = await page(b, url, vp);
    await helpers(p);
    await battle(p, Object.assign({ words: ALLW }, o));
    if (hoverRe === 'companion') {
      await p.click(await cardSel(p, 'Unravel'));
      await p.waitForSelector('.chal .mc .btn');
      const r = await p.evaluate(() => G.right()); await p.mouse.click(r.x, r.y);
      await p.waitForSelector('.fbwrap .fb-go'); await p.click('.fbwrap .fb-go');
      await p.waitForSelector('.ccard');
      await wait(p, 350);
      const c = await center(p, '.ccard:not([disabled])');
      await p.mouse.move(c.x, c.y);
    } else if (hoverRe) {
      const sel = await cardSel(p, hoverRe);
      await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
      const c = await center(p, sel);
      await p.mouse.move(c.x, c.y);
    }
    await wait(p, 400);
    const png = await p.screenshot();
    fs.writeFileSync(path.join(outDir, name + '.png'), png);
    shots.push({ name, webp: await toWebp(p, png) });
    assert(!errors.length, name + ': ' + errors.join('; '));
    await ctx.close();
  }
  if (toDocs) {
    const dd = path.join(root, 'docs', 'screenshots', 'battle');
    for (const s of shots) fs.writeFileSync(path.join(dd, 'group_' + s.name + '.webp'), Buffer.from(s.webp, 'base64'));
    console.log('   copied ' + shots.length + ' WebP captures to docs/screenshots/battle/');
  }
  console.log('   captures in tests/e2e/out/battle_group/: ' + shots.map((s) => s.name).join(', '));
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
