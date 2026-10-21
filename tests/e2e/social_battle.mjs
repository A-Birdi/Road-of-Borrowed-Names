// RBN-QA-056 (Agnes; proposal agreed by Local CL-073 and Cloud CC-044): a conversation with a creature in it
// (`kind: 'social'` with a `lead`) runs on the battle screen (src/engine/90_game.js startEncounter -> startBattle), whose
// stepFor had no social or gesture branch: choosing a social action threw on `card.word.lex`, the battle came down, and
// the Teller's Shadow's trigger started it again at every step. Now the battle screen builds those steps as the
// encounter screen does. In Chromium on the built game, with the real buttons:
//  1. the Teller's Shadow from the Copying Room's own trigger: each correction gives its own question (its authored
//     task, choice), the understanding moves as authored, the account put right ends it (`right`, the stairs open);
//     stepping on the trigger again starts nothing; no page errors;
//  2. a wrong answer first: the battle stays up, the same question can be answered;
//  3. all nine conversations with a creature (kr.shadow_gate, kr.ghost_lectern, kr.hyakuwa, cr.courier, ko.gardener,
//     yn.kettle, gd.sg, gd.lf, gd.mb): every social action offered is chosen once with its own question when it has
//     one; the battle stays up until an authored ending; no page errors;
//  4. the companion's gesture (cr.courier, yn.kettle), offered once the understanding is full (set so as the test's
//     setup): no writing asked, played, no page errors.
//  5. with a standing plan for the companion's turn (Protect, Reveal, Press), on the Shadow with each companion and a
//     spot check of the other eight: each social action applied once, the understanding one step at a time.
// Each card is pressed on its English label: pressing the Japanese label's words is RBN-QA-057 (card_press.mjs).
// Usage: node tools/build.mjs && node tests/e2e/social_battle.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_moths_done: true, kr_rite_done: true };

async function setup(p, o) {
  await p.evaluate(([o, WORDS]) => {
    if (!RB.challenge.__watched) { const run = RB.challenge.runStep; RB.challenge.runStep = function (step) { window.__steps.push({ title: step.title, item: step.item, kind: step.kind }); return run.apply(this, arguments); }; RB.challenge.__watched = true; }
    window.__steps = []; window.__res = null;
    const s = RB.game.debugStart(o.map, o.x, o.y, { edition: RB.edition.forNew(), comp: o.comp, dir: o.dir || 'down', flags: o.flags || {} });
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.world.refreshActors();
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.textSpeed = 'instant';
    RB.game.settings.compPlan = o.plan || 'ask'; RB.game.applySettings();
    // the encounter's own result, wherever it was started
    const se = RB.game.startEncounter;
    RB.game.startEncounter = function () { const r = se.apply(this, arguments); Promise.resolve(r).then((v) => { window.__res = v || { result: null }; }, (e) => { window.__res = { error: String(e) }; }); return r; };
    if (o.enc) RB.game.startEncounter(o.enc, {});
  }, [o, WORDS]);
}
const view = (p) => p.evaluate(() => {
  const st = RB.combat.state(), E = st && st.enc;
  return { combat: !!st, phase: RB.combat.phase(), u: E && E.social ? E.social.understanding : null, used: E && E.social ? Object.keys(E.social.used) : [],
    chal: !!document.querySelector('.chal'), ccard: !!document.querySelector('.ccard'), sheet: !!document.querySelector('.csheet .pbtn'),
    cards: [...document.querySelectorAll('.rcard[data-i]')].filter((x) => !x.disabled).map((x) => ({ i: x.getAttribute('data-i'), en: ((x.querySelector('.rc-en') || {}).textContent || '').trim() })),
    dlg: RB.ui.dialogue.isOpen(), res: window.__res, mode: RB.game.mode() };
});
// answer the open language step: wrong first when asked, then right (choice mode)
async function answer(p, wrongFirst) {
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn', { timeout: 8000 });
  const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
  let wrongSeen = false;
  for (let k = 0; k < n; k++) {
    await p.evaluate((k) => { const b = [...document.querySelectorAll('.chal .mc .btn')][k]; if (b && !b.disabled) b.click(); }, k);
    await p.waitForTimeout(120);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    if (!wrongSeen) wrongSeen = true;
    // a wrong choice: its feedback, then the question again
    const again = await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) .fb-go, .fbwrap:not([data-fb=ok]) [data-a=retry]'); if (g) { g.click(); return true; } return false; });
    if (again) await p.waitForTimeout(150);
    if (wrongFirst) { wrongFirst = false; }
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 8000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  return wrongSeen;
}
// drive the encounter with the real buttons: each social action once, the gesture when offered, then Wait
async function drive(p, id, o = {}) {
  const def = await p.evaluate((id) => { const d = RB.content.encounters[id]; return { actions: (d.social.actions || []).map((a) => ({ id: a.id, en: a.label.en, task: !!a.task })), gesture: d.social.gesture ? d.social.gesture.name.en : null, conclusions: (d.conclusions || []).map((c) => c.id) }; }, id);
  const chosen = [], tasks = [];
  let gestured = false, downEarly = false, wrongSeen = false, lastUsed = [];
  const us = [];
  const t0 = Date.now();
  for (let i = 0; i < 400 && Date.now() - t0 < 150000; i++) {
    const v = await view(p);
    if (v.used.length) { lastUsed = v.used; await p.evaluate(() => { const st = RB.combat.state(); if (st && st.enc && st.enc.social) window.__usedCounts = Object.assign({}, st.enc.social.used); }); }
    if (v.phase === 'choose' && v.u != null && us[us.length - 1] !== v.u) us.push(v.u);
    if (v.res) break;
    if (!v.combat && i > 20) { downEarly = true; break; }
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (v.chal) { const w = await answer(p, o.wrongFirst && !wrongSeen); wrongSeen = wrongSeen || w; continue; }
    // (the pointer moved off first: left on a keyword, its word note can cover the companion's cards)
    if (v.ccard) { await p.mouse.move(2, 2); await p.waitForTimeout(320); await companionTurn(p).catch(() => {}); continue; }
    if (v.sheet) { await p.evaluate(() => { const b = document.querySelector('.csheet .pbtn'); if (b) b.click(); }); await p.waitForTimeout(100); continue; }
    if (v.phase === 'choose' && v.cards.length) {
      if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); continue; }
      let pick = def.gesture && !gestured && v.cards.find((c) => c.en === def.gesture), act = null;
      if (pick) gestured = true;
      if (!pick) { act = def.actions.find((a) => !chosen.includes(a.id) && v.cards.some((c) => c.en === a.en)); if (act) pick = v.cards.find((c) => c.en === act.en); }
      if (!pick) pick = v.cards.find((c) => /^Wait/.test(c.en)) || v.cards[0];
      const before = await p.evaluate(() => window.__steps.length);
      // by its label, as you see it (the cards are dealt afresh after a choice is used: an index can go stale); a
      // press in the dock's first moments is ignored on purpose, so press again until the choice is taken
      const esc = pick.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const card = p.locator('.rcard[data-i]:not([disabled])', { has: p.locator('.rc-en', { hasText: new RegExp('^\\s*' + esc + '\\s*$') }) }).first();
      for (let k = 0; k < 8; k++) {
        // (the dealt cards slide into place, over one another for a moment: press once none is still moving)
        for (let q = 0; q < 40; q++) { if (await p.evaluate(() => [...document.querySelectorAll('.rcard')].every((el) => el.getAnimations().every((a) => a.playState !== 'running')))) break; await p.waitForTimeout(80); }
        // pressed on its English label (the Japanese label's words are word-help tokens with their own index: pressing
        // them is RBN-QA-057, tested on its own)
        const pt = await p.evaluate((label) => {
          const el = [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].find((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim() === label);
          const en = el && el.querySelector('.rc-en');
          if (!en) return null;
          en.scrollIntoView({ block: 'nearest' });
          const r = en.getBoundingClientRect(), x = r.left + Math.min(r.width / 2, 40), y = r.top + r.height / 2;
          const hit = document.elementFromPoint(x, y);
          return hit && hit.closest('.rcard[data-i]') === el && !hit.closest('.jt') ? { x, y } : null;
        }, pick.en);
        if (pt) { await p.mouse.move(pt.x, pt.y); await p.waitForTimeout(150); await p.mouse.click(pt.x, pt.y); }
        await p.waitForTimeout(250);
        if (await p.evaluate(() => RB.combat.phase() !== 'choose' || !!document.querySelector('.chal, .csheet .pbtn'))) break;
      }
      if (act) { chosen.push(act.id); if (act.task) tasks.push(act.id); }
      if (o.onPick) await o.onPick(pick, before);
      continue;
    }
    await p.waitForTimeout(80);
  }
  const end = await view(p);
  const steps = await p.evaluate(() => window.__steps);
  const used = lastUsed;
  if (process.env.TRACE) console.log('  (' + id + ': ' + Math.round((Date.now() - t0) / 1000) + ' s)');
  const counts = await p.evaluate(() => window.__usedCounts || null);
  return { def, chosen, tasks, gestured, downEarly, wrongSeen, steps, used, us, counts, res: end.res, end };
}

// 1. the Teller's Shadow from the Copying Room's own trigger
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, { map: 'kr.cave2', x: 21, y: 4, dir: 'right', comp: 'suzu', flags: FL });
  await p.waitForTimeout(600);
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(260); await p.keyboard.up('ArrowRight');
  let started = false;
  for (let i = 0; i < 60 && !started; i++) { await p.waitForTimeout(150); const v = await view(p); if (v.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); started = v.combat; }
  ok(started, 'the Copying Room trigger opens the Teller\'s Shadow on the battle screen');
  const firstU = [];
  const r = await drive(p, 'kr.shadow_gate', { wrongFirst: true, onPick: async (pick) => { firstU.push([pick.en, (await view(p)).combat]); } });
  const s = await p.evaluate(() => ({ open: !!RB.game.s.flags.kr_cave2_open, mode: RB.game.mode(), stairs: RB.world.W.map.props.some((q) => q.p === 'stairs' && (!q.if || RB.state.test(RB.game.s, q.if))) }));
  ok(r.used.length === 3 && r.steps.filter((x) => x.title === 'Say it').length >= 3 && !r.downEarly,
    'each correction gives its own question ("Say it"), is taken, and the battle stays up (' + JSON.stringify({ used: r.used, steps: r.steps.map((x) => x.title), downEarly: r.downEarly }) + ')');
  ok(r.wrongSeen, 'a wrong answer first: its feedback, the battle still up, then the right one');
  ok(r.res && r.res.result === 'win' && r.res.outcome === 'right' && s.open && s.stairs && s.mode === 'world', 'the account put right ends it: right, the stairs down open (' + JSON.stringify({ res: r.res, s }) + ')');
  await p.evaluate(() => { const P = RB.world.W.player; P.x = 21; P.y = 4; P.fx = 21; P.fy = 4; P.dir = 'right'; });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(260); await p.keyboard.up('ArrowRight');
  await p.waitForTimeout(900);
  const again = await view(p);
  ok(!again.combat && !again.dlg && again.mode === 'world', 'stepping on the trigger again starts nothing (' + JSON.stringify({ combat: again.combat, mode: again.mode }) + ')');
  ok(!errors.length, 'the Teller\'s Shadow: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}
// 3. all nine conversations with a creature, started directly
for (const [id, comp] of [['kr.shadow_gate', 'ren'], ['kr.ghost_lectern', 'suzu'], ['kr.hyakuwa', 'suzu'], ['cr.courier', 'nao'], ['ko.gardener', 'mio'], ['yn.kettle', 'suzu'], ['gd.sg', 'suzu'], ['gd.lf', 'ren'], ['gd.mb', 'nao']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, { map: 'rw.millroad', x: 10, y: 22, comp, enc: id, flags: FL });
  const r = await drive(p, id);
  const all = r.def.actions.length;
  const said = r.steps.filter((x) => x.title === 'Say it' || r.def.actions.some((a) => a.title && a.title === x.title)).length;
  ok(!r.downEarly && r.res && r.res.result && r.used.length >= 1 && r.used.every((u) => r.chosen.includes(u)) && said >= r.used.filter((u) => r.def.actions.find((a) => a.id === u && a.task)).length,
    id + ': ' + r.used.length + ' of ' + all + ' social actions taken with the real buttons (' + said + ' questions said), gesture ' + (r.gestured ? 'chosen' : 'not offered') + '; ended ' + JSON.stringify(r.res));
  ok(!r.res || !r.res.outcome || r.def.conclusions.includes(r.res.outcome) || /^(left|settled|flee)$/.test(r.res.outcome), id + ': an authored ending (' + JSON.stringify({ outcome: r.res && r.res.outcome, authored: r.def.conclusions }) + ')');
  ok(!errors.length, id + ': no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}
// 4. the companion's gesture on the battle screen (offered once the understanding is full: set so here, as the test's
// own setup, then pressed with the real button): no language task, its effect, the battle still up or ended as authored
for (const [id, comp] of [['cr.courier', 'nao'], ['yn.kettle', 'suzu']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, { map: 'rw.millroad', x: 10, y: 22, comp, enc: id, flags: FL });
  // (the understanding full from the start, before the first choice is dealt)
  await p.waitForFunction(() => { const st = RB.combat.state(); return !!(st && st.enc && st.enc.social); }, null, { timeout: 15000 });
  const g = await p.evaluate((id) => { const st = RB.combat.state(); st.enc.social.understanding = st.enc.social.max; return RB.content.encounters[id].social.gesture.name.en; }, id);
  for (let i = 0; i < 150; i++) { const v = await view(p); if (v.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); if (v.phase === 'choose' && v.cards.length) break; await p.waitForTimeout(100); }
  await p.waitForTimeout(600);
  if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); await p.waitForTimeout(300); }
  const offered = await p.evaluate((g) => [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].some((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim() === g), g);
  const pt = await p.evaluate((g) => { const el = [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].find((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim() === g); const en = el && el.querySelector('.rc-en'); if (!en) return null; const r = en.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 40), y: r.top + r.height / 2 }; }, g);
  const before = await p.evaluate(() => window.__steps.length);
  if (pt) { await p.mouse.move(pt.x, pt.y); await p.waitForTimeout(150); await p.mouse.click(pt.x, pt.y); }
  let after = null;
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(150); after = await view(p); if (after.ccard) { await p.mouse.move(2, 2); await p.waitForTimeout(320); await companionTurn(p).catch(() => {}); } if (after.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true)); if (after.res || (after.phase === 'choose' && after.u === 0)) break; }
  const steps = await p.evaluate((n) => window.__steps.slice(n), before);
  ok(offered && pt && !steps.length && after && (after.res || after.u === 0), id + ': the companion\'s gesture is offered, pressed, asks for no writing, and is played (understanding spent: ' + JSON.stringify({ offered, steps, u: after && after.u, res: after && after.res }) + ')');
  ok(!errors.length, id + ' gesture: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}
// 5. with a standing plan for the companion's turn (Protect, Reveal, Press): each correction is applied once, its
// understanding +1 (the plan's look-ahead never acts on the live conversation; Local CL-082)
for (const [plan, comp] of [['protect', 'nao'], ['reveal', 'ren'], ['press', 'mio'], ['protect', 'suzu'], ['press', 'nao'], ['reveal', 'suzu']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, { map: 'rw.millroad', x: 10, y: 22, comp, enc: 'kr.shadow_gate', flags: FL, plan });
  const r = await drive(p, 'kr.shadow_gate');
  const once = r.counts && Object.values(r.counts).every((n) => n === 1);
  const steps = r.us.every((u, i) => i === 0 || u - r.us[i - 1] <= 1);
  ok(once && steps && r.res && r.res.outcome === 'right' && r.used.length === 3, 'plan ' + plan + ' (' + comp + '): each correction applied once, the understanding one at a time, ended right (' + JSON.stringify({ counts: r.counts, us: r.us, res: r.res }) + ')');
  ok(!errors.length, 'plan ' + plan + ' (' + comp + '): no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// and a spot check of the other eight with a plan
for (const [id, comp, plan] of [['kr.ghost_lectern', 'suzu', 'protect'], ['kr.hyakuwa', 'ren', 'reveal'], ['cr.courier', 'nao', 'press'], ['ko.gardener', 'mio', 'protect'], ['yn.kettle', 'suzu', 'reveal'], ['gd.sg', 'suzu', 'press'], ['gd.lf', 'ren', 'protect'], ['gd.mb', 'nao', 'reveal']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, { map: 'rw.millroad', x: 10, y: 22, comp, enc: id, flags: FL, plan });
  const r = await drive(p, id);
  const once = r.counts && Object.values(r.counts).every((n) => n === 1);
  ok(once && r.res && r.res.result && !r.downEarly, id + ' with plan ' + plan + ': each social action applied once, an authored ending (' + JSON.stringify({ counts: r.counts, us: r.us, res: r.res }) + ')');
  ok(!errors.length, id + ' with plan ' + plan + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nsocial_battle: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
