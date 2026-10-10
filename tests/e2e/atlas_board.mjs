// The Atlas's commission board (expansion P07, plan D7; src/atlas/80_commissions.js, src/ui/89c_atlas_board.js) in
// Chromium on the built game, with throwaway sessions:
//  1. the board in the Lantern Hall: practice topics from the evidence, the errands, the surveys; a commission and a
//     length chosen; the card says the topic, what is new, the rooms on the way and the rules; taking it starts the
//     run with its shape (a short road: no camp);
//  2. a lantern of "a family of endings": the grammar card of a point never met comes first, then the question,
//     answered through the real challenge screen; the lamp lights;
//  3. a survey of the wet roads: a landmark verified in the first room; the Atlas panel counts it;
//  4. the Cartographer's Atlas page with a finished survey; the board at phone width; every kanji with its reading;
//     no errors, no network. Captures in docs/screenshots/atlas_board/.
// Usage: node tests/e2e/atlas_board.mjs [filter]
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'atlas_board');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
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
// a twelve-chapter journey after the story, in the Lantern Hall, with evidence that requests are hard
async function start(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.hall', 5, 6, { comp: 'mio', flags: { departed: true, postgame: true, ch2_done: true } });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.atlas.unlocked = true;
    for (const g of RB.exams.FAMILIES.requests.ids) s.learn.items['g:' + g] = { id: 'g:' + g, seen: 3, ok: 1, bad: 3, box: 0, last: 0, due: 0, cool: 0 };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    RB.save.setCurrent(4, 0);
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    window.__right = () => {
      const st = window.__step, txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.learnUi.mixed(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      return [...document.querySelectorAll('.chal .mc .btn')].findIndex((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
    };
  });
}
// the board through its prop: choose an offer and a length, take it
async function takeFromBoard(p, offer, length, shot) {
  await p.evaluate(() => { RB.test.enable({ choose: () => 0 }); window.__u = RB.test.use(7, 2).catch((e) => { window.__uerr = String(e); }); });
  await p.waitForSelector('.ab-folio [data-a="take"]');
  await p.check('input[name="ab-offer"][value="' + offer + '"]');
  await p.check('input[name="ab-len"][value="' + length + '"]');
  await p.waitForTimeout(80);
  const card = await p.textContent('.ab-card');
  assert(!(await bareKanji(p, '.ab-folio')).length, 'kanji with readings on the board: ' + (await bareKanji(p, '.ab-folio')));
  if (shot) await p.screenshot({ path: path.join(out, shot) });
  await p.click('.ab-folio [data-a="take"]');
  await p.evaluate(() => window.__u);
  await p.evaluate(() => RB.test.idle(30000));
  return card;
}
const runInfo = (p) => p.evaluate(() => { const s = RB.game.s, r = s.atlas.run; const pl = r ? RB.atlas.planOf(r) : null; return r ? { map: s.map, c: r.commission, rooms: Object.keys(pl.rooms), p1: pl.rooms.p1.pattern, obj: pl.rooms.p1.obj } : { map: s.map }; });

await test('the board: offers from the evidence, the card, and a short road taken', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p);
  const card = await takeFromBoard(p, 'themed:endings', 'short', 'board.png');
  assert(/Topic/.test(card) && /new to you/.test(card) && /rooms on the way/.test(card) && /fixed when you set out/.test(card), 'the card: topic, what is new, rooms, the rules: ' + card.slice(0, 400));
  const r = await runInfo(p);
  assert(r.map.indexOf('atlas.') === 0 && r.c && r.c.id === 'themed:endings' && r.c.length === 'short' && r.rooms.indexOf('c') < 0, 'the run began with its commission, a short road with no camp: ' + JSON.stringify(r).slice(0, 300));
  const lists = await p.evaluate(() => null);
  void lists;
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a lantern of the family of endings: the grammar card first, then the question; the lamp lights', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p);
  await takeFromBoard(p, 'themed:endings', 'short');
  const r = await runInfo(p);
  assert(r.p1 === 'lanterns' && r.obj && r.obj.type === 'lanterns', 'the path room leans on lanterns: ' + r.p1);
  // into the lantern room, then a lamp by hand
  const lamp = await p.evaluate(async () => {
    const run = RB.game.s.atlas.run, id = RB.atlas.mapId(run, 'p1'), d = RB.content.maps[id];
    const sp = d.spawn.default;
    await RB.game.transition(id, sp[0], sp[1], 'up');
    await RB.test.idle(30000);
    RB.test.disable();
    const l = d.props.find((q) => q.p === 'atlas_lamp' && q.scene === 'atlas.obj' && q.lamp === 0);
    window.__u2 = RB.test.use(l.x, l.y);
    return { x: l.x, y: l.y, obj: l.obj };
  });
  // the narration, then the grammar card (a point never met), then the challenge
  let saw = null;
  for (let i = 0; i < 200 && !saw; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), teach: !!document.querySelector('.teach'), chal: !!document.querySelector('.chal') }));
    if (st.teach) saw = 'teach'; else if (st.chal) saw = 'chal'; else if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(50);
  }
  assert(saw === 'teach', 'a grammar card before the question (got ' + saw + ')');
  const teach = await p.textContent('.teach');
  assert(/Grammar/.test(teach), 'the card is the grammar point\'s: ' + teach.slice(0, 120));
  assert(!(await bareKanji(p, '.teach')).length, 'kanji with readings on the card');
  await p.screenshot({ path: path.join(out, 'teach_first.png') });
  await p.evaluate(() => { const bt = [...document.querySelectorAll('.teach button')].find((x) => /Continue|Got it|OK|Next/i.test(x.textContent)) || document.querySelector('.teach button'); bt.click(); });
  await p.waitForSelector('.chal .mc .btn');
  const info = await p.evaluate(() => ({ item: window.__step && (window.__step.topicItem || window.__step.item), i: window.__right() }));
  assert(info.i >= 0, 'the right option found: ' + JSON.stringify(info));
  assert(await p.evaluate((it) => RB.atlasCommissions.themed('endings').topic.items.indexOf(it) >= 0, info.item), 'the question is about the topic: ' + info.item);
  await p.screenshot({ path: path.join(out, 'topic_lamp.png') });
  await p.evaluate((i) => document.querySelectorAll('.chal .mc .btn')[i].click(), info.i);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  for (let i = 0; i < 100; i++) { const d = await p.evaluate(() => RB.ui.dialogue.isOpen()); if (d) await p.evaluate(() => RB.ui.dialogue.advance(true)); else if (await p.evaluate(() => !RB.script.isRunning())) break; await p.waitForTimeout(50); }
  const lit = await p.evaluate((o) => !!RB.game.s.flags['atlas_r_' + o + '_0'] && RB.learn.introduced(window.__step.topicItem), lamp.obj);
  assert(lit, 'the lamp is lit and the point is now introduced');
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a survey of the wet roads: a landmark verified; the panel counts it', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p);
  await takeFromBoard(p, 'survey:water', 'standard');
  const r = await runInfo(p);
  assert(['crossing', 'tide', 'pool'].indexOf(r.p1) >= 0, 'the path room is one of the wet roads: ' + r.p1);
  const res = await p.evaluate(async () => {
    const run = RB.game.s.atlas.run, id = RB.atlas.mapId(run, 'p1'), d = RB.content.maps[id];
    const sp = d.spawn.default;
    await RB.game.transition(id, sp[0], sp[1], 'up');
    await RB.test.idle(30000);
    const m = d.props.find((q) => q.scene === 'atlas.survey.mark');
    await RB.test.use(m.x, m.y);
    return { marks: run.survey && run.survey.marks, flag: !!RB.game.s.flags['atlas_r_survey_p1'], problems: RB.test.problems || [] };
  });
  assert(res.marks && res.marks.p1 && res.flag, 'the landmark verified: ' + JSON.stringify(res));
  assert(!res.problems.length, 'the landmark task\'s answer is accepted: ' + JSON.stringify(res.problems));
  await p.evaluate(() => document.querySelector('.atlas-chip').click());
  await p.waitForSelector('.folio');
  const panel = await p.textContent('.folio');
  assert(/Commission/.test(panel) && /Landmarks verified on the road so far: 1 of 1/.test(panel), 'the Atlas panel counts it: ' + panel.slice(0, 500));
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings in the panel');
  await p.screenshot({ path: path.join(out, 'survey_panel.png') });
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('the Cartographer\'s Atlas page; the board at phone width', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  await start(p);
  // a finished survey of the lantern roads, recorded by the commissions' own rule
  await p.evaluate(() => {
    const s = RB.game.s, K = RB.atlasCommissions;
    const c = K.commission(K.offers(s).find((o) => o.id === 'survey:lantern'), 'standard');
    const run = RB.atlas.newRun(s, [], { seed: 13 }); run.commission = c;
    RB.atlas.register(run);
    const pl = RB.atlas.planOf(run);
    run.path = []; let k = pl.start; while (k) { run.path.push(k); k = pl.rooms[k].next[0]; }
    run.survey = { marks: {} };
    for (const key of run.path) { const d = RB.content.maps[RB.atlas.mapId(run, key)]; if (d.atlas.survey) run.survey.marks[key] = true; }
    K.finished(s, run, 'complete');
    RB.atlas.unregister(run.id);
    RB.ui.menu.open('map');
  });
  await p.waitForSelector('.folio');
  await p.evaluate(() => { const bt = [...document.querySelectorAll('[data-mv]')].find((x) => x.dataset.mv === 'cartographer'); bt.click(); });
  await p.waitForSelector('.ab-route');
  const txt = await p.textContent('.folio');
  assert(/Cartographer/.test(txt) && /surveyed/.test(txt) && /Not surveyed yet/.test(txt), 'one page surveyed, two still to do: ' + txt.slice(0, 300));
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio')));
  assert(await noOverflow(p), 'nothing scrolls sideways');
  await p.screenshot({ path: path.join(out, 'cartographer_phone.png') });
  await p.evaluate(() => RB.ui.menu.close());
  await p.evaluate(() => RB.test.idle(30000));
  await p.evaluate(() => { RB.test.enable({ choose: () => 0 }); window.__u = RB.test.use(7, 2); });
  await p.waitForSelector('.ab-folio [data-a="take"]');
  assert(await noOverflow(p), 'the board fits the phone');
  await p.screenshot({ path: path.join(out, 'board_phone.png') });
  await p.click('.ab-folio [data-a="no"]');
  await p.evaluate(() => window.__u);
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
