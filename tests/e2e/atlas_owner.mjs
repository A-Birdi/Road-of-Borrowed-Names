// An Atlas step belongs to the journey it was asked in (Agnes 6853081234; Local CL-800, CL-801; Cloud CC-573,
// CC-574), in the browser, on journeys made for the test and the stand-in save slots of a fresh context (never a real
// save). Runs are taken from the real commission board; every line said is recorded.
//  A. real sheets, at a lantern of "a family of endings" (a short road), whose step teaches first (a grammar point
//     never met):
//     1. control, one journey: the grammar card, then the question, answered right (or, when the step offers no
//        choice, with "I don't know", reported as such): the lamp lights, the point is introduced;
//     2. control, one journey: the card, then the question, "Step back for now": the companion's line;
//     3. the card up, another slot loaded (then the same slot loaded again), and the card then closed;
//     4. the question up, another slot loaded, then "Step back for now"; the same slot loaded again, then
//        "I don't know".
//     After 3 and 4: no question opens, no line is said, no battle starts, no Atlas event; the journey loaded is
//     exactly as it was once its load had finished (compared: learn as a whole, the top-level meter, flags, vars,
//     atlas, the History backlog); the old run's counts and objectives are unchanged (compared: its stats, objs, done, survey, names);
//     the old journey's saved record is unchanged (compared: its learn and flags).
//  B. stand-in results (the challenge runner replaced by one returning the given result; this tests each place's
//     branch, not the sheet's ownership), in one journey: the survey's landmark (a survey of the wet roads), an
//     unmoored name and the guardian's legend (a short road): a stale result: no line after the step, no flag, and at
//     the legend no battle; an ordinary "Step back for now": the companion's line, and at the legend its line and
//     then the battle (itself stood in for).
//  C. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/atlas_owner.mjs   (RB_PAGE=<file> for another page)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const STALE = { ok: false, cancelled: true, stale: true }, CANCEL = { ok: false, cancelled: true };

// a fresh context: slot 2 holds another journey (quiet: its arrival scenes already seen); slot 1 an Atlas journey in
// room `room` of a run taken from the board (with a fixed seed, when given)
async function setup(offer, len, room, seed) {
  const pg = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const { p } = pg;
  await p.evaluate(async (seed) => {
    const o = RB.game.debugStart('rw.village', 22, 18, { edition: 2, comp: 'nao', flags: { departed: true, postgame: true, ch2_done: true } });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) o.flags['enter:' + m + ':' + ev.scene] = true;
    o.player.name = 'Other'; o.learn.kanaKnown = 'both'; o.learn.profile = 'E';
    await RB.save.writeSlot(2, o, { force: true });
    const s = RB.game.debugStart('rw.hall', 5, 6, { comp: 'mio', flags: { departed: true, postgame: true, ch2_done: true } });
    s.edition = 2; s.player.name = 'Atlas'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.atlas.unlocked = true;
    for (const g of RB.exams.FAMILIES.requests.ids) s.learn.items['g:' + g] = { id: 'g:' + g, seen: 3, ok: 1, bad: 3, box: 0, last: 0, due: 0, cool: 0 };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    if (seed != null) RB.atlas._debug.flags.seed = seed;
  }, seed);
  await p.evaluate(() => { RB.test.enable({ choose: () => 0 }); window.__u = RB.test.use(7, 3).catch((e) => { window.__uerr = String(e); }); });
  await p.waitForSelector('.ab-folio [data-a="take"]');
  await p.check('input[name="ab-offer"][value="' + offer + '"]');
  await p.check('input[name="ab-len"][value="' + len + '"]');
  await p.click('.ab-folio [data-a="take"]');
  await p.evaluate(() => window.__u);
  await p.evaluate(() => RB.test.idle(30000));
  await p.evaluate(async (room) => {
    const run = RB.game.s.atlas.run, id = RB.atlas.mapId(run, room), d = RB.content.maps[id], sp = d.spawn.default;
    await RB.game.transition(id, sp[0], sp[1], 'up');
    await RB.test.idle(30000);
    RB.test.disable();
    await RB.save.writeSlot(1, RB.game.s, { force: true });
    // what is said, what the runner is asked, battles, Atlas events
    window.__lines = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__lines.push(l.en || l.jp || '?'); return say.apply(this, arguments); };
    window.__real = RB.challenge.runStep; window.__stub = null;
    RB.challenge.runStep = (step, o) => { window.__step = step; window.__lines.push('STEP'); return window.__stub ? Promise.resolve(window.__stub) : window.__real(step, o); };
    window.__battles = [];
    const sb = RB.game.startBattle;
    RB.game.startBattle = (id, o) => { window.__battles.push(id); return window.__battleStub ? Promise.resolve('lose') : sb(id, o); };
    window.__ev = [];
    RB.bus.on('atlas:event', (e) => window.__ev.push(e && e.id));
    window.__quiet = async () => { for (let i = 0; i < 80 && (RB.ui.dialogue.isOpen() || RB.script.isRunning()); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); } };
    window.__load = async (slot) => {
      await RB.game.loadCampaign(slot, 'manual');
      Object.assign(RB.game.settings, { textSpeed: 'instant', input: 'choice', lightbulb: false }); RB.game.applySettings();
      await new Promise((r) => setTimeout(r, 500));
      await window.__quiet();
    };
    window.__snap = () => { const s = RB.game.s; return JSON.stringify({ learn: s.learn, meter: s.meter, flags: s.flags, vars: s.vars, atlas: s.atlas, backlog: s.backlog }); };
    window.__runJ = (run) => JSON.stringify(run ? { stats: run.stats, objs: run.objs, done: run.done, survey: run.survey || null, names: run.names } : null);
    window.__saved = async (slot) => { const r = await RB.save.read(slot, 'manual'); return JSON.stringify(r.state.learn) + JSON.stringify(r.state.flags); };
    window.__right = () => {
      const st = window.__step, txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.learnUi.mixed(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      return [...document.querySelectorAll('.chal .mc .btn, .chal .mc .choice')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())) || null;
    };
    window.__finish = async (how) => {
      const chal = document.querySelector('.chal');
      if (!chal) return 'no sheet';
      if (how === 'leave') chal.querySelector('[data-a=leave]').click();
      else if (how === 'reveal') chal.querySelector('[data-a=reveal]').click();
      else {
        const tab = chal.querySelector('[data-mode=choice]');
        if (tab && tab.getAttribute('aria-selected') !== 'true') { tab.click(); await new Promise((r) => setTimeout(r, 200)); }
        // a step with no choices to make (an order, say): answered with "I don't know" instead, which also completes it
        const bt = window.__right();
        if (bt) bt.click(); else { chal.querySelector('[data-a=reveal]').click(); how = 'revealed (no choice in a ' + (window.__step && window.__step.kind) + ' step)'; }
      }
      await new Promise((r) => setTimeout(r, 400));
      const c = [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent));
      if (c) c.click();
      await new Promise((r) => setTimeout(r, 600));
      return how === 'right' ? 'done' : how;
    };
    window.__gotIt = () => { const t = document.querySelector('.teach'); if (!t) return false; (t.querySelector('[data-ok]') || t.querySelector('button')).click(); return true; };
    window.__propIn = (room, pred) => { const run = RB.game.s.atlas.run, d = RB.content.maps[RB.atlas.mapId(run, room)]; return d.props.find(pred); };
    window.__goto = async (room) => {
      const run = RB.game.s.atlas.run, id = RB.atlas.mapId(run, room), d = RB.content.maps[id], sp = d.spawn.default;
      await RB.game.transition(id, sp[0], sp[1], 'up');
      await new Promise((r) => setTimeout(r, 300));
      await window.__quiet();
    };
  }, room);
  return pg;
}
// advance the dialogue until `what` is on screen ('teach' | 'chal' | 'step': the runner was asked); what was seen
async function until(p, what, n = 200) {
  for (let i = 0; i < n; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), teach: !!document.querySelector('.teach'), chal: !!document.querySelector('.chal'), step: window.__lines.includes('STEP') }));
    if (st[what]) return what;
    if (what === 'step' && st.teach) await p.evaluate(() => window.__gotIt());
    else if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(50);
  }
  return null;
}
const afterStep = (p) => p.evaluate(() => window.__lines.slice(window.__lines.lastIndexOf('STEP') + 1));

// ---- A. real sheets at a teach-first lantern ------------------------------------------------------------------------
{
  // seed 2: a short road whose rooms include one with unmoored names (for B)
  const { p, ctx, errors } = await setup('themed:endings', 'short', 'p1', 2);
  const useLamp = () => p.evaluate(() => { window.__lines.length = 0; const l = window.__propIn('p1', (q) => q.p === 'atlas_lamp' && q.scene === 'atlas.obj' && q.lamp === 0); window.__lamp = l; window.__hook = RB.test.use(l.x, l.y); return { x: l.x, y: l.y, obj: l.obj }; });
  // 1. control: the card, the question, the right answer
  await p.evaluate(() => window.__load(1));
  const lamp = await useLamp();
  const saw = await until(p, 'teach');
  const card = saw && (await p.evaluate(() => /Grammar/.test(document.querySelector('.teach').textContent)));
  await p.evaluate(() => window.__gotIt());
  const q = await until(p, 'chal');
  const fin = await p.evaluate(() => window.__finish('right'));
  for (let i = 0; i < 100 && (await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.script.isRunning())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(50); }
  const lit = await p.evaluate((o) => ({ lit: !!RB.game.s.flags['atlas_r_' + o + '_0'], intro: RB.learn.introduced(window.__step.topicItem), teachFirst: !!window.__step.teachFirst }), lamp.obj);
  ok(card && q === 'chal' && (fin === 'done' || /^revealed/.test(fin)) && lit.lit && lit.intro && lit.teachFirst, 'A1 one journey: the grammar card first, then the question, answered (right where it offers a choice): the lamp lights, the point introduced ' + flat({ saw, card, q, fin, lit }));
  // 2. control: the card, the question, "Step back for now"
  await p.evaluate(() => window.__load(1));
  await useLamp();
  await until(p, 'teach'); await p.evaluate(() => window.__gotIt()); await until(p, 'chal');
  await p.evaluate(() => window.__finish('leave'));
  await p.waitForTimeout(400);
  const back = await afterStep(p);
  ok(back.length === 1 && back[0] === 'Don\'t push it. We\'ll come back.', 'A2 one journey: "Step back for now": the companion\'s line, as before ' + flat(back));
  // 3, 4: another journey loaded at the card or at the question
  async function staleA(name, o) {
    await p.evaluate(() => window.__load(1));
    await useLamp();
    let open = await until(p, 'teach');
    if (o.at === 'chal') { await p.evaluate(() => window.__gotIt()); open = await until(p, 'chal'); }
    await p.evaluate(() => { window.__oldRun = RB.game.s.atlas.run; window.__oldRunJ = window.__runJ(window.__oldRun); });
    await p.evaluate((slot) => window.__load(slot), o.into);
    const base = await p.evaluate(() => ({ lines: window.__lines.length, battles: window.__battles.length, ev: window.__ev.length, name: RB.game.s.player.name }));
    const savedA = await p.evaluate(() => window.__saved(1));
    const before = await p.evaluate(() => window.__snap());
    if (o.at === 'chal') await p.evaluate((f) => window.__finish(f), o.finish);
    else await p.evaluate(() => window.__gotIt());
    await p.waitForTimeout(1500);
    const after = await p.evaluate(() => window.__snap());
    const got = await p.evaluate((base) => ({ chal: !!document.querySelector('.chal'), teach: !!document.querySelector('.teach'), dlg: RB.ui.dialogue.isOpen(), lines: window.__lines.slice(base.lines), battles: window.__battles.length - base.battles, ev: window.__ev.slice(base.ev), oldRun: window.__runJ(window.__oldRun) === window.__oldRunJ }), base);
    const savedA2 = await p.evaluate(() => window.__saved(1));
    const okd = open && !got.chal && !got.teach && !got.dlg && !got.lines.length && !got.battles && !got.ev.length && before === after && got.oldRun && savedA === savedA2;
    ok(okd, 'A' + name + ' (into ' + base.name + '): no question, no line, no battle, no Atlas event; the journey loaded exactly as before; the old run\'s counts unchanged; the old saved record unchanged '
      + flat({ open, got, same: before === after, savedSame: savedA === savedA2 }));
  }
  await staleA('3 the grammar card up, another slot loaded, the card then closed', { at: 'teach', into: 2 });
  await staleA('3 the grammar card up, the same slot loaded again, the card then closed', { at: 'teach', into: 1 });
  await staleA('4 the question up, another slot loaded, then "Step back for now"', { at: 'chal', into: 2, finish: 'leave' });
  await staleA('4 the question up, the same slot loaded again, then "I don\'t know"', { at: 'chal', into: 1, finish: 'reveal' });

  // ---- B. stand-in results: the unmoored name and the guardian's legend (same short road) ----------------------------
  async function nameCase(res) {
    await p.evaluate(() => window.__load(1));
    // the room of this road with an unmoored name in it
    const where = await p.evaluate(() => { const pl = RB.atlas._debug.plan(); for (const k in pl) { const n = pl[k].npcs.find((x) => x.name); if (n) return { key: k, npc: n.id }; } return null; });
    if (!where) return { st: 'no room with a name', out: {}, after: [] };
    await p.evaluate((k) => window.__goto(k), where.key);
    await p.evaluate(([res, npc]) => { window.__stub = res; window.__lines.length = 0; window.__done = false; window.__npc = npc; RB.hooks.atlas_name([], { npc }).then(() => { window.__done = true; }); }, [res, where.npc]);
    const st = await until(p, 'step');
    for (let i = 0; i < 40 && !(await p.evaluate(() => window.__done)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(50); }
    const out = await p.evaluate((key) => ({ done: window.__done, flag: !!RB.game.s.flags[RB.atlas.FLAG('name_' + key + '_' + window.__npc.replace('atlas_n', ''))], room: key, npc: window.__npc }), where.key);
    await p.evaluate(() => { window.__stub = null; });
    return { st, out, after: await afterStep(p) };
  }
  let r = await nameCase(STALE);
  ok(r.st === 'step' && r.out.done && !r.out.flag && !r.after.length, 'B (stand-in) an unmoored name, a stale result: no line after the step, no flag ' + flat(r));
  r = await nameCase(CANCEL);
  ok(r.st === 'step' && r.out.done && !r.out.flag && r.after.length === 1 && r.after[0] === 'Don\'t push it. We\'ll come back.', 'B (stand-in) an unmoored name, "Step back for now": the companion\'s line, as before ' + flat(r));
  async function legendCase(res) {
    await p.evaluate(() => window.__load(1));
    await p.evaluate(() => window.__goto('x'));
    await p.evaluate((res) => { window.__stub = res; window.__battleStub = true; window.__battles.length = 0; window.__lines.length = 0; window.__done = false; RB.hooks.atlas_climax().then(() => { window.__done = true; }); }, res);
    const st = await until(p, 'step', 400);
    for (let i = 0; i < 60 && !(await p.evaluate(() => window.__done)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(50); }
    const out = await p.evaluate(() => ({ done: window.__done, battles: window.__battles.slice() }));
    await p.evaluate(() => { window.__stub = null; window.__battleStub = false; });
    return { st, out, after: await afterStep(p) };
  }
  r = await legendCase(STALE);
  ok(r.st === 'step' && r.out.done && !r.out.battles.length && !r.after.length, 'B (stand-in) the guardian\'s legend, a stale result: no further line and no battle ' + flat(r));
  r = await legendCase(CANCEL);
  ok(r.st === 'step' && r.out.done && r.out.battles.length === 1 && r.after[0] === 'Your words have not quite reached it yet — but it is listening.', 'B (stand-in) the guardian\'s legend, "Step back for now": its line, then the battle, as before ' + flat(r));
  ok(!errors.length, 'C no page errors (the short road)' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

// ---- B. stand-in results: the survey's landmark (a survey of the wet roads) ---------------------------------------
{
  const { p, ctx, errors } = await setup('survey:water', 'standard', 'p1');
  async function surveyCase(res) {
    await p.evaluate(() => window.__load(1));
    await p.evaluate((res) => {
      window.__stub = res; window.__lines.length = 0; window.__done = false;
      const m = window.__propIn('p1', (q) => q.scene === 'atlas.survey.mark');
      window.__mark = m;
      RB.hooks.atlas_survey([], { prop: m }).then(() => { window.__done = true; });
    }, res);
    const st = await until(p, 'step');
    for (let i = 0; i < 40 && !(await p.evaluate(() => window.__done)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(50); }
    const out = await p.evaluate(() => ({ done: window.__done, flag: !!RB.game.s.flags[RB.atlas.FLAG('survey_' + (window.__mark.survey || 'p1'))] }));
    await p.evaluate(() => { window.__stub = null; });
    return { st, out, after: await afterStep(p) };
  }
  let r = await surveyCase(STALE);
  ok(r.st === 'step' && r.out.done && !r.out.flag && !r.after.length, 'B (stand-in) a survey\'s landmark, a stale result: no line after the step, no flag ' + flat(r));
  r = await surveyCase(CANCEL);
  ok(r.st === 'step' && r.out.done && !r.out.flag && r.after.length === 1 && r.after[0] === 'Don\'t push it. We\'ll come back.', 'B (stand-in) a survey\'s landmark, "Step back for now": the companion\'s line, as before ' + flat(r));
  ok(!errors.length, 'C no page errors (the survey)' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
