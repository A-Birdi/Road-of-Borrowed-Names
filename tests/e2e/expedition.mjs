// The Flood Cellars, P07's pilot expedition, in Chromium on the built game, with throwaway sessions:
//  1. the whole loop: the hatch in the River Warehouse and its preview card (Go down), B1 (the notice taught and
//     answered, the bench, the lamp mended and rested at), B2 (the sluice worked, the water gone, the ladder's grate
//     opened from below and climbed), the Map page's Expedition plan, the outflow door, the stamp, climbing out.
//     Scenes, choices and language steps run through the game's automated player (RB.test), which checks every
//     canonical answer against the real answer checker;
//  2. a defeat: the expedition starts again from the foot of the ladder; the water, the lamp, the creatures, the
//     stations and condition reset; the grate, the floors seen and what was learned kept (the battle's outcome is
//     given; the defeat flow after it is the game's own);
//  3. one real battle on the battle screen in the cellars: a wrong answer before the right one, a step back; the
//     resolve carried is the blows only, the mistake given back;
//  4. the notice by hand at all four profiles, through every input route: choosing (mouse), putting the notice in
//     order (tiles), typing (the IME field), handwriting (the pad, reference strokes);
//  5. a delver in the lamp room: the aid first; a remembered moment adds to it; a wrong one takes nothing away;
//  6. phone width: the preview card and the plan fit; every kanji with its reading; no errors, no network.
// Captures in docs/screenshots/expedition/.
// Usage: node tests/e2e/expedition.mjs [filter]
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'expedition');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
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
// a twelve-chapter journey after Chapter 2, in the River Warehouse
async function start(p, o) {
  o = o || {};
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map || 'rw.warehouse', o.x || 5, o.y || 6, { comp: o.comp === undefined ? 'mio' : o.comp, flags: Object.assign({ departed: true, ch1_done: true, ch2_done: true }, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    if (o.auto) RB.test.enable({ choose: () => 0 });
    RB.save.setCurrent(4, 0); // a throwaway session's slot, so the autosaves are written
  }, o);
}
const S = (p) => p.evaluate(() => {
  const s = RB.game.s, e = RB.expedition.of(s);
  return { map: s.map, x: s.x, y: s.y, mode: RB.game.mode(), on: !!e, floor: e ? e.floor : null, restarts: e ? e.restarts : null, pc: s.resolve.pc, comp: s.resolve.comp, max: s.resolve.max,
    flags: Object.keys(s.flags).filter((k) => /cellars|foe:rw\.cellar/.test(k)), bench: RB.expedition.stationLeft(s, 'bench'), spring: RB.expedition.stationLeft(s, 'spring'), lamp: RB.expedition.stationLeft(s, 'lamp'),
    problems: RB.test.auto ? RB.test.problems || [] : [] };
});
const idle = (p) => p.evaluate(() => RB.test.idle(30000));

await test('the whole loop: preview, B1, B2, the sluice, the shortcut, the plan, the door, the stamp, out', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { auto: true });
  // the hatch: its scene shows the card and waits for the player
  await p.evaluate(() => { window.__u = RB.test.use(7, 3).catch((e) => { window.__uerr = String(e); }); });
  await p.waitForSelector('.xp-folio [data-a="go"]');
  const card = await p.textContent('.xp-folio');
  assert(/Language/.test(card) && /て ある/.test(card) && /Size/.test(card) && /Two floors/.test(card), 'the card names the language and the size: ' + card.slice(0, 300));
  assert(/carries/.test(card) && /1 rest bench/.test(card) && /1 spring/.test(card) && /mended/.test(card) && /entrance/.test(card) && /plain sight/.test(card) && /stay open/.test(card) && /climb out/.test(card), 'the card states every rule: ' + card);
  assert(!(await bareKanji(p, '.xp-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.xp-folio')));
  await p.screenshot({ path: path.join(out, 'preview.png') });
  await p.click('.xp-folio [data-a="go"]');
  await p.evaluate(() => window.__u);
  await idle(p);
  let st = await S(p);
  assert(st.map === 'rw.cellar1' && st.on && st.floor === 0 && st.pc === st.max, 'down the ladder: B1, on the expedition, at full resolve: ' + JSON.stringify(st));
  await p.waitForSelector('.xp-chip:not(.hidden)');
  assert(/You \d+\/\d+/.test(await p.textContent('.xp-chip')) && /Mio/.test(await p.textContent('.xp-chip')), 'the chip shows carried resolve: ' + await p.textContent('.xp-chip'));
  await p.screenshot({ path: path.join(out, 'b1.png') });
  // the notice: the construction taught, then asked
  await p.evaluate(() => RB.test.use(5, 17));
  st = await S(p);
  assert(st.flags.includes('xpk_cellars_taught') && (await p.evaluate(() => !!RB.game.s.learn.items['g:te_aru'])), 'the notice teaches 〜て ある and records it: ' + JSON.stringify(st.flags));
  // the bench: +4, one more
  await p.evaluate(() => { RB.game.s.resolve.pc = 5; return RB.test.use(3, 9); });
  st = await S(p);
  assert(st.pc === 9 && st.bench === 1, 'the bench: 5 → 9, one use left: ' + JSON.stringify(st));
  // the lamp room: mended, then a rest
  await p.evaluate(() => RB.test.use(36, 8));
  st = await S(p);
  assert(st.flags.includes('xp_cellars_lamp_fixed') && st.flags.includes('xpk_cellars_lamp_known'), 'the lamp mended: ' + JSON.stringify(st.flags));
  await p.evaluate(() => { RB.game.s.resolve.pc = 3; return RB.test.use(36, 8); });
  st = await S(p);
  assert(st.pc === 7 && st.lamp === 0, 'its rest: 3 → 7, used up: ' + JSON.stringify(st));
  // down the stairs (the real exit, so the autosave of a floor's entry happens)
  await p.evaluate(() => { RB.test.place(30, 5, 'up'); });
  await p.evaluate(() => RB.test.step('up'));
  await idle(p);
  st = await S(p);
  assert(st.map === 'rw.cellar2' && st.floor === 1, 'down the stairs: B2: ' + JSON.stringify(st));
  const saved = await p.evaluate(async () => { const r = await RB.save.read(4, 'auto'); return r && r.state ? { map: r.state.map, xp: !!r.state.expedition, pc: r.state.resolve.pc } : null; });
  assert(saved && saved.map === 'rw.cellar2' && saved.xp && saved.pc === 7, 'the autosave at the floor\'s entry holds the visit and the carried resolve: ' + JSON.stringify(saved));
  assert(await p.evaluate(() => RB.maps.blockedStatic(RB.world.W.map, 20, 5)), 'the north passage is under water');
  // the sluice (a procedure, played by the automated player through the encounter rules)
  await p.evaluate(() => RB.test.use(28, 14));
  st = await S(p);
  assert(st.flags.includes('xp_cellars_drained') && !(await p.evaluate(() => RB.maps.blockedStatic(RB.world.W.map, 20, 5))), 'the sluice worked: the water gone: ' + JSON.stringify(st.flags));
  // the ladder: the grate opened from below, then climbed
  await p.evaluate(() => RB.test.use(31, 3));
  await idle(p);
  st = await S(p);
  assert(st.flags.includes('xpk_cellars_sc_ladder') && st.map === 'rw.cellar1' && st.x === 8 && st.y === 21, 'the shortcut opened and climbed: back by the first ladder: ' + JSON.stringify(st));
  // the plan in the Ledger
  await p.evaluate(() => RB.ui.menu.open('expedition'));
  await p.waitForSelector('.xp-plan');
  const plan = await p.evaluate(() => ({ n: document.querySelectorAll('.xp-plan').length, here: document.querySelectorAll('.xp-plan .xp-here').length, st: document.querySelectorAll('.xp-plan .xp-st').length, sc: document.querySelectorAll('.xp-plan .xp-sc.on').length, text: document.querySelector('.folio .leafbox').textContent, right: /Places to rest/.test(document.querySelector('.folio .leafbox').textContent) }));
  assert(plan.n === 2 && plan.here === 1 && plan.st === 3 && plan.sc === 2, 'both floors drawn, you on one, three rest places, the shortcut open at both ends: ' + JSON.stringify(plan).slice(0, 300));
  assert(/1 use left/.test(plan.text) && /Used up/.test(plan.text) && /stays open/.test(plan.text), 'uses left in words: ' + plan.text.slice(0, 400));
  assert(!(await bareKanji(p, '.folio .leafbox')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio .leafbox')));
  await p.screenshot({ path: path.join(out, 'plan.png') });
  await p.evaluate(() => RB.ui.menu.close());
  await idle(p);
  // down the opened grate, the outflow door
  await p.evaluate(() => { RB.test.place(8, 21, 'down'); });
  await p.evaluate(() => RB.test.step('down'));
  await idle(p);
  st = await S(p);
  assert(st.map === 'rw.cellar2', 'down the grate: B2 by the outflow chamber: ' + JSON.stringify(st));
  await p.evaluate(() => { RB.game.s.flags['foe:rw.cellar2:d3'] = true; RB.world.refreshActors(); return RB.test.use(28, 1); });
  await idle(p);
  st = await S(p);
  const after = await p.evaluate(() => ({ done: !!RB.game.s.flags.xpk_cellars_done, stamp: RB.stampBook.pressed(RB.game.s, 'xp.cellars'), cp: RB.game.s.checkpoint }));
  assert(after.done && after.stamp, 'the door: the cellars done, the stamp pressed: ' + JSON.stringify(after));
  assert(st.map === 'rw.warehouse' && !st.on && st.pc === st.max && after.cp.map === 'rw.warehouse', 'climbed out: the warehouse, the visit over, full resolve, the checkpoint here: ' + JSON.stringify(st) + JSON.stringify(after.cp));
  assert(!st.problems.length, 'every canonical answer accepted, the sluice concluded: ' + JSON.stringify(st.problems).slice(0, 600));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('defeat: the cellars start again from the ladder; the grate, the floors seen and the learning kept', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // a save resumed on B2 without the expedition (an interrupted entry): walking onto it began a fresh visit
  await start(p, { map: 'rw.cellar2', x: 10, y: 18, flags: { xpk_cellars_sc_ladder: true, xpk_cellars_taught: true } });
  let st = await S(p);
  assert(st.on && st.floor === 1, 'resumed on B2: a fresh visit begun: ' + JSON.stringify(st));
  await p.evaluate(() => {
    const s = RB.game.s;
    Object.assign(s.flags, { xp_cellars_drained: true, xp_cellars_lamp_fixed: true, 'foe:rw.cellar2:d1': true, 'foe:rw.cellar1:c2': true });
    s.resolve.pc = 4; RB.expedition.useStation(s, 'spring');
    s.resolve.pc = 2;
    s.learn.items['g:te_aru'] = s.learn.items['g:te_aru'] || { seen: 1 };
    // the battle screen's outcome is given (a defeat); the flow after it is the game's own
    window.__realStart = RB.combat.start;
    RB.combat.start = async () => 'lose';
    window.__res = null;
    RB.game.startBattle('rw.inkblot', { where: { map: 'rw.cellar2', x: 16, y: 19 } }).then((r) => { window.__res = r; });
  });
  await p.waitForFunction(() => window.__res === 'lose' && RB.game.mode() === 'world', null, { timeout: 20000 });
  await p.evaluate(() => { RB.combat.start = window.__realStart; });
  st = await S(p);
  const notice = await p.evaluate(() => document.querySelector('.notices') ? document.querySelector('.notices').textContent : '');
  assert(st.map === 'rw.cellar1' && st.x === 4 && st.y === 20 && st.on && st.restarts === 1, 'woke at the foot of the ladder, the visit restarted: ' + JSON.stringify(st));
  assert(/starts again from its entrance/.test(notice), 'and the game says so: ' + notice);
  assert(!st.flags.includes('xp_cellars_drained') && !st.flags.includes('xp_cellars_lamp_fixed') && !st.flags.some((k) => /^foe:/.test(k)), 'the water back, the lamp out, the creatures returned: ' + JSON.stringify(st.flags));
  assert(st.spring === 1 && st.bench === 2 && st.pc === st.max, 'stations and condition back: ' + JSON.stringify(st));
  assert(st.flags.includes('xpk_cellars_sc_ladder') && st.flags.includes('xpk_cellars_taught') && (await p.evaluate(() => !!RB.game.s.learn.items['g:te_aru'] && RB.expedition.floorSeen(RB.game.s, 'cellars', 'b2'))), 'kept: the grate, what was taught, the learning record, the floors seen');
  assert(await p.evaluate(() => !!RB.world.W.map.exits.find((e) => e.x === 8 && e.y === 22) && !!RB.maps.exitAt(RB.world.W.map, 8, 22)), 'the shortcut down is still open');
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a real battle in the cellars: the blow carried, the mistake given back', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'rw.cellar1', x: 16, y: 4, comp: null, profile: 'F' });
  await p.evaluate(() => {
    RB.game.settings.input = 'choice';
    const s = RB.game.s; s.words = ['mamoru', 'mizu', 'hikari'];
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    window.__right = () => {
      const st = window.__step, txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.learnUi.mixed(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      return [...document.querySelectorAll('.chal .mc .btn')].map((x, i) => ({ i, ok: right.includes(x.textContent.replace(/\s+/g, ' ').trim()) }));
    };
    window.__result = null;
    RB.game.startBattle('rw.reedling', {}).then((r) => { window.__result = r; });
  });
  for (let i = 0; i < 200; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') }));
    if (s.cards) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.rcard[data-i]');
  const tracked = await p.evaluate(() => { const st = RB.combat.state(); return !!(st && st.acct); });
  assert(tracked, 'the battle screen began the expedition\'s accounting');
  await p.waitForTimeout(200);
  await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && /mamoru|Protect|まもる|守/i.test(x.textContent)) || document.querySelector('.rcard[data-i]'); c.click(); });
  await p.waitForSelector('.chal .mc .btn');
  const opts = await p.evaluate(() => window.__right());
  const wrong = opts.find((o) => !o.ok), right = opts.find((o) => o.ok);
  assert(wrong && right, 'a right and a wrong option: ' + JSON.stringify(opts));
  await p.evaluate((i) => document.querySelectorAll('.chal .mc .btn')[i].click(), wrong.i);
  await p.waitForTimeout(150);
  await p.evaluate((i) => document.querySelectorAll('.chal .mc .btn')[i].click(), right.i);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  // wait for the exchange to settle (the creature's move included), then read the pools
  // (the exchange is over once its round has closed: the answer's cost, then the creature's move)
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => { const st = RB.combat.state(); return { busy: RB.battleSeq && RB.battleSeq.busy(), round: st ? st.round : 0, cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), res: window.__result }; });
    if (s.res) break;
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); continue; }
    if (!s.busy && s.cards && s.round >= 1) break;
    await p.waitForTimeout(40);
  }
  const pools = await p.evaluate(() => { const st = RB.combat.state(), P = st.acct.pools.pc; return { pc: st.pc, max: st.max, mist: P.mist, rest: P.rest, camp: RB.game.s.resolve.max }; });
  assert(pools.mist >= 1, 'the wrong answer counted as a language mistake: ' + JSON.stringify(pools));
  const expected = Math.max(1, Math.min(pools.camp, pools.pc + Math.min(pools.mist, pools.max - pools.pc) - (pools.max - pools.camp)));
  if (!(await p.evaluate(() => window.__result))) {
    await p.click('[data-flee]');
    await p.waitForSelector('[role=alertdialog] .foot button');
    await p.evaluate(() => [...document.querySelectorAll('[role=alertdialog] .foot button')].find((x) => /step back/i.test(x.textContent)).click());
  }
  await p.waitForFunction(() => window.__result && RB.game.mode() === 'world', null, { timeout: 20000 });
  const st = await S(p);
  assert(st.pc === expected && st.pc === st.max - pools.rest, 'after stepping back: resolve ' + st.pc + ' = what the blows cost (' + pools.rest + ' of ' + st.max + '); the mistake (' + pools.mist + ') given back');
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

// the notice's steps by hand: choosing, ordering, typing, handwriting
async function answerByHand(p, route) {
  const step = await p.evaluate(() => { const s = window.__step; return { kind: s.kind, answer: s.answer, tiles: s.tiles }; });
  if (step.kind === 'choose') {
    await p.waitForSelector('.chal .mc .btn');
    const i = await p.evaluate(() => window.__right().find((o) => o.ok).i);
    await p.evaluate((i) => document.querySelectorAll('.chal .mc .btn')[i].click(), i);
  } else if (step.kind === 'order') {
    await p.waitForSelector('.order-line');
    for (let k = 0; k < step.answer.length; k++) {
      await p.evaluate((piece) => { const d = document.createElement('div'); d.innerHTML = RB.ui.jhtml(piece); const want = d.textContent.trim(); const t = [...document.querySelectorAll('.tiles .tile[data-add]')].find((x) => x.textContent.trim() === want); if (!t) throw new Error('no tile ' + want + ' among ' + [...document.querySelectorAll('.tiles .tile[data-add]')].map((x) => x.textContent.trim()).join(' / ')); t.click(); }, step.answer[k]);
      await p.waitForTimeout(30);
    }
    await p.click('.chal [data-a="submit"]');
  } else if (step.kind === 'write' && route === 'ime') {
    await p.evaluate(() => { const t = document.querySelector('.chal-tabs .ptab[data-mode="ime"]'); if (t) t.click(); });
    await p.waitForSelector('#ime-in');
    await p.fill('#ime-in', await p.evaluate((a) => RB.tasks.plain(a), step.answer));
    await p.press('#ime-in', 'Enter');
  } else if (step.kind === 'write' && route === 'hand') {
    await p.evaluate(() => { const t = document.querySelector('.chal-tabs .ptab[data-mode="hand"]'); if (t) t.click(); });
    await p.waitForSelector('.pad-box canvas.pad-ink');
    const chars = Array.from(await p.evaluate((a) => RB.tasks.plain(a), step.answer));
    for (const ch of chars) {
      const read = await p.evaluate(async (ch) => {
        const ref = RB.recog.reference(ch), r = RB.util.rng(11);
        const strokes = ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, t: 1000 + i * 16 })));
        RB.pad.__last._inject(strokes);
        await new Promise((res) => setTimeout(res, 60));
        return document.querySelector('.readas') ? document.querySelector('.readas').textContent : '';
      }, ch);
      if (!new RegExp(ch).test(read)) throw new Error('the pad read ' + read + ' for ' + ch);
      await p.click('[data-a=confirm]');
    }
    await p.click('.chal [data-a="submit"]');
  } else throw new Error('no route for ' + step.kind + ' / ' + route);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  return step.kind + (step.kind === 'write' ? '/' + route : '');
}
await test('the notice by hand at every profile: choosing, ordering, typing, handwriting', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const routes = { F: 'hand', E: 'ime', I: 'ime', A: 'hand' };
  const used = new Set();
  for (const prof of ['F', 'E', 'I', 'A']) {
    await start(p, { map: 'rw.cellar1', x: 5, y: 19, profile: prof });
    await p.evaluate((route) => {
      RB.game.settings.input = route;
      const run = RB.challenge.runStep;
      if (!RB.challenge.__wrapped) { RB.challenge.__wrapped = true; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); }; }
      window.__right = () => {
        const st = window.__step, txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
        const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.learnUi.mixed(o.en) + '</span>' : '');
        const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
        return [...document.querySelectorAll('.chal .mc .btn')].map((x, i) => ({ i, ok: right.includes(x.textContent.replace(/\s+/g, ' ').trim()) }));
      };
      window.__done = null;
      RB.challenge.run('xp.c_notice', {}).then((r) => { window.__done = r; });
    }, routes[prof]);
    const n = await p.evaluate(() => RB.tasks.stepsOf(RB.content.challenges['xp.c_notice']).length);
    for (let k = 0; k < n; k++) {
      await p.waitForSelector('.chal');
      await p.waitForTimeout(80);
      if (!(await bareKanji(p, '.chal')).length) { /* fine */ } else throw new Error(prof + ': kanji without readings: ' + (await bareKanji(p, '.chal')));
      if (k === 0) await p.screenshot({ path: path.join(out, 'notice_' + prof + '.png') });
      await p.evaluate((k) => { window.__step = RB.tasks.stepsOf(RB.content.challenges['xp.c_notice'])[k]; }, k); // (run() calls its steps directly)
      used.add(prof + ':' + (await answerByHand(p, routes[prof])));
    }
    await p.waitForFunction(() => window.__done && window.__done.ok, null, { timeout: 10000 });
  }
  const kinds = [...used].map((x) => x.split(':')[1]);
  assert(['choose', 'order', 'write/ime', 'write/hand'].every((k) => kinds.includes(k)), 'every route met the construction: ' + [...used].join(', '));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a delver in the lamp room: the aid first, a remembered moment adds to it, a wrong one takes nothing away', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const meet = async (pick) => {
    await start(p, { map: 'rw.cellar1', x: 34, y: 10, auto: true });
    await p.evaluate((pick) => {
      const s = RB.game.s;
      s.seen['rw.yasu_after'] = true;
      s.flags.xp_cellars_dv_yasu_b1 = true; delete s.flags.xp_cellars_dv_met;
      s.resolve.pc = 4; s.resolve.comp = 4;
      RB.test.enable({ choose: () => pick });
      RB.world.refreshActors();
    }, pick);
    const before = await p.evaluate(() => !!RB.world.W.npcs.find((n) => n.id === 'yasu'));
    await p.evaluate(() => RB.test.talk('yasu'));
    return Object.assign({ before }, await p.evaluate(() => ({ pc: RB.game.s.resolve.pc, comp: RB.game.s.resolve.comp, rec: RB.game.s.delvers, met: !!RB.game.s.flags.xp_cellars_dv_met, still: !!RB.world.W.npcs.find((n) => n.id === 'yasu'), notice: document.querySelector('.notices') ? document.querySelector('.notices').textContent : '' })));
  };
  const right = await meet(0);
  assert(right.before && right.pc === 12 && right.rec && right.rec.remembered.yasu && right.met && !right.still, 'remembered: the rest (+4) and the moment (+4) from 4, kept as met and remembered; Yasu goes on his way: ' + JSON.stringify(right).slice(0, 300));
  assert(/A rest with them/.test(right.notice) && /Remembering it together/.test(right.notice), 'both said: ' + right.notice);
  const wrong = await meet(1);
  assert(wrong.pc === 8 && wrong.met && !(wrong.rec.remembered || {}).yasu, 'not remembered: the rest is still given (4 → 8), nothing taken: ' + JSON.stringify(wrong).slice(0, 300));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('phone width: the preview card and the plan fit', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  await start(p, { auto: true });
  await p.evaluate(() => { window.__u = RB.test.use(7, 3); });
  await p.waitForSelector('.xp-folio [data-a="go"]');
  assert(await noOverflow(p), 'the card fits the phone');
  await p.screenshot({ path: path.join(out, 'preview_phone.png') });
  await p.click('.xp-folio [data-a="go"]');
  await p.evaluate(() => window.__u);
  await idle(p);
  await p.evaluate(() => RB.ui.menu.open('expedition'));
  await p.waitForSelector('.xp-plan');
  const w = await p.evaluate(() => { const r = document.querySelector('.xp-plan').getBoundingClientRect(); return { w: r.width, vw: innerWidth }; });
  assert(w.w > 200 && w.w <= w.vw, 'the plan is drawn at the page\'s width: ' + JSON.stringify(w));
  assert(await noOverflow(p), 'nothing scrolls sideways');
  await p.screenshot({ path: path.join(out, 'plan_phone.png') });
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
