// The companion's turn in battle, against the built index.html in Chromium,
// with the real mouse and keyboard:
// - after the response's one language step succeeds, the response is queued
//   (nothing applied yet) and the companion's support menu opens — no
//   language step in it;
// - "Back to <you>" (a click, or Escape) returns to your choice with nothing
//   lost: the rules were not called, resolve, knots, harmony and the
//   once-per-encounter uses are exactly as before;
// - confirming resolves in order: your response, the companion's action,
//   then each creature (the rules' calls and the sequences on screen);
// - the actions on offer follow the story: the first at recruitment, the
//   second after chapter 2, the third with the companion's personal quest,
//   the fourth and fifth with the two late alliances; a newly learned one is
//   announced once;
// - previews: pointing at an action marks whom it acts on (the target, every
//   creature, or you both); choosing another creature during the menu moves
//   it, and the action then acts on that creature.
// Usage: node tests/e2e/companion_turn.mjs [filter]
import { serve, launch, page, companionTurn } from './lib.mjs';

const only = process.argv.slice(2).find((a) => !a.startsWith('--'));
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 240s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const wait = (p, ms) => p.waitForTimeout(ms);
const ALLW = ['mamoru', 'iyasu', 'hikari', 'mizu', 'kaze', 'nawa', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
const MOVES = ['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'];
const QUEST = { nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio', suzu: 'co_suzu' };

// the rules' calls (in order, with the state before/after) and the right option of the open step
async function helpers(p) {
  await p.evaluate(() => {
    const pick = (x) => x && { pc: x.pc, comp: x.comp, ward: Object.assign({}, x.ward), harmony: x.harmony, cur: x.cur, uses: Object.assign({}, x.compUses), foes: (x.foes || []).map((f) => ({ knots: f.knots, heat: f.heat, shroud: !!f.shroud, charged: !!f.charged, soften: f.soften || 0, kind: f.intent && f.intent.kind })) };
    const G = (window.G = { calls: [], exch: [], pick });
    const L = RB.combatLogic;
    for (const k of ['playerAct', 'compAct', 'enemyAct', 'endRound']) {
      const f = L[k];
      L[k] = function (st, ...a) {
        G.calls.push(k);
        const before = JSON.parse(JSON.stringify(pick(st)));
        const r = f.call(this, st, ...a);
        G.exch.push({ k, arg: k === 'compAct' ? a[0] : null, cur: st.cur, before, after: JSON.parse(JSON.stringify(pick(st))), fx: k === 'playerAct' || k === 'compAct' ? r.fx : k === 'enemyAct' ? r : null });
        return r;
      };
    }
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; window.__steps = (window.__steps || 0) + 1; return run(step, o); };
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
    G.snap = () => { const st = RB.combat.state(); return JSON.parse(JSON.stringify(Object.assign(pick(st), { round: st.round, resolve: Object.assign({}, RB.game.s.resolve) }))); };
  });
}
// a campaign on a map of the last chapter, then a group placement's battle there
async function battle(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map, 5, 5, { comp: o.comp, flags: o.flags || {} });
    for (const q of o.quests || []) s.quests[q] = { stage: 9, done: true };
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.diff || 'normal';
    s.words = o.words.slice();
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, group: 1 }, o.tips || {}, ...o.moves.map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    RB.game.settings.input = 'choice';
    RB.battleSeq.setTimeScale(3);
    const place = RB.content.maps[o.map].foes.find((f) => f.id === o.foe);
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: o.map, x: place.x, y: place.y }, foeKey: 'foe:' + o.map + ':' + place.id }).then((r) => { window.__result = r || 'done'; });
  }, Object.assign({ moves: MOVES, words: ALLW }, o));
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
const cardSel = async (p, re) => { const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re); assert(i != null, 'no card matching ' + re); return '.rcard[data-i="' + i + '"]'; };
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
// choose a response and do its step right (the mouse); then Continue: the companion's menu opens
async function queue(p, re) {
  const c = await center(p, await cardSel(p, re || 'Unravel'));
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal .mc .btn', { timeout: 10000 });
  const r = await p.evaluate(() => G.right());
  await p.mouse.click(r.x, r.y);
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
  await p.click('.fbwrap .fb-go');
  await p.waitForSelector('.ccard', { timeout: 10000 });
  await wait(p, 320);
}
async function idle(p) {
  for (let i = 0; i < 500; i++) {
    const s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), res: window.__result }));
    if (!s.busy && (s.cards || s.dlg || s.res)) { await wait(p, 60); return s; }
    await wait(p, 40);
  }
  throw new Error('the exchange did not settle');
}
const menu = (p) => p.evaluate(() => ({
  phase: RB.combat.phase(),
  head: (document.querySelector('.cb-dock-h') || {}).textContent,
  queued: (document.querySelector('.cb-queued') || {}).textContent,
  back: (document.querySelector('[data-back]') || {}).textContent,
  acts: [...document.querySelectorAll('.ccard')].map((c) => ({ a: c.getAttribute('data-a'), text: c.textContent.replace(/\s+/g, ' ').trim(), off: c.disabled, fresh: c.classList.contains('fresh') })),
  task: !!document.querySelector('.chal'),
  coach: (document.querySelector('.cb-coach') || {}).textContent || '',
}));
const marks = (p) => p.evaluate(() => RB.combat.marks());
async function flee(p) {
  await p.click('[data-flee]');
  await p.waitForSelector('[role=alertdialog] .foot button');
  await p.click('[role=alertdialog] .foot button >> nth=0');
  await p.waitForFunction(() => window.__result === 'flee' && RB.game.mode() === 'world', null, { timeout: 15000 });
}
// aim at the creature with the most knots (it will not settle this exchange), by a click on its slip
async function aimAtStrongest(p) {
  const i = await p.evaluate(() => { const st = RB.combat.state(); let k = 0; st.foes.forEach((f, j) => { if (f.knots > st.foes[k].knots) k = j; }); return k; });
  if (await p.$('.cb-foe .fs[data-foe="' + i + '"]')) { await p.click('.cb-foe .fs[data-foe="' + i + '"]'); await wait(p, 120); }
  assert((await p.evaluate(() => RB.combat.state().cur)) === i, 'aimed at creature ' + i);
  return i;
}

// ---------------------------------------------------------------------------------------------------
await test('queued response, the companion\'s menu, Back with nothing lost (click and Escape), then confirm: response, companion, creatures in that order', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'sa.stacks', foe: 'w1', diff: 'normal', comp: 'mio', flags: { ch2_done: true }, tips: { cturn: 1 } });
  const pn = await p.evaluate(() => RB.game.s.player.name);
  await aimAtStrongest(p);
  const s0 = await p.evaluate(() => G.snap());
  const steps0 = await p.evaluate(() => window.__steps || 0);
  // 1) the response's step, then the menu: the response waits, nothing is applied
  await queue(p, 'Unravel');
  let m = await menu(p);
  assert(m.phase === 'companion' && /turn/.test(m.head) && /Unravel/.test(m.queued) && new RegExp('Back to ' + pn).test(m.back) && m.acts.length === 2 && !m.task, 'the menu: the queued response, Back to ' + pn + ', Mio\'s two actions, no task ' + JSON.stringify(m));
  let calls = await p.evaluate(() => G.calls);
  assert(!calls.length, 'nothing resolved while the response is queued: ' + calls.join());
  assert(JSON.stringify(await p.evaluate(() => G.snap())) === JSON.stringify(s0), 'the state is as it was');
  assert((await p.evaluate(() => window.__steps)) === steps0 + 1, 'one language step for the response, none for the companion');
  // 2) Back (a click): your choice again, nothing lost
  await p.click('[data-back]');
  await cards(p);
  m = await menu(p);
  calls = await p.evaluate(() => G.calls);
  const s1 = await p.evaluate(() => G.snap());
  assert(m.phase === 'choose' && !m.acts.length && !calls.length && JSON.stringify(s1) === JSON.stringify(s0), 'Back: your choice again, the rules untouched, resolve/knots/harmony/uses as before ' + JSON.stringify({ phase: m.phase, calls, s0, s1 }));
  // 3) queue again, Back with Escape (the keyboard)
  await queue(p, 'Unravel');
  await p.keyboard.press('Escape');
  await cards(p);
  m = await menu(p);
  assert(m.phase === 'choose' && !(await p.evaluate(() => G.calls)).length && JSON.stringify(await p.evaluate(() => G.snap())) === JSON.stringify(s0), 'Escape is Back too, with nothing lost');
  // 4) queue, confirm Mio's draught: response, then her action, then each creature
  await queue(p, 'Unravel');
  const picked = await companionTurn(p, { match: 'Warm draught', delay: 0 });
  assert(/Warm draught/.test(picked), 'chose the draught: ' + picked);
  await idle(p);
  calls = await p.evaluate(() => G.calls);
  assert(calls.join() === 'playerAct,compAct,enemyAct,endRound', 'the rules resolve in order: ' + calls.join());
  const ex = await p.evaluate(() => G.exch);
  assert(ex[0].after.foes[ex[0].cur].knots === s0.foes[s0.cur].knots - 1, 'your Unravel freed a knot (applied once)');
  assert(ex[1].arg === 'mio_draught' && ex[1].fx.some((f) => f.t === 'heal'), 'then her draught');
  const tr = await p.evaluate(() => RB.combat.debug().trace.map((x) => ({ kind: x.kind, foe: x.meta && x.meta.foe })));
  const kinds = tr.map((x) => x.kind).filter((k) => k === 'player' || k === 'companion' || k === 'enemy');
  const iP = kinds.indexOf('player'), iC = kinds.indexOf('companion'), iE = kinds.indexOf('enemy');
  const standing = ex[1].after.foes.filter((f) => f.knots > 0).length;
  assert(standing === 2, 'both creatures still stand');
  assert(iP >= 0 && iC > iP && iE > iC && kinds.slice(iE).every((k) => k === 'enemy') && kinds.filter((k) => k === 'enemy').length === standing, 'on screen: your response, her action, then each of the two creatures ' + JSON.stringify(tr));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('what each companion can do follows the story (recruitment, chapter 2, personal quest, two late alliances); a new action is announced once', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  // every companion, every stage of the story, by the rules on a real campaign state
  const table = await p.evaluate((QUEST) => {
    const out = {};
    const moth = Object.assign({ id: 'sa.moth' }, RB.content.enemies['sa.moth']);
    for (const who of ['nao', 'mio', 'ren', 'suzu']) {
      out[who] = { rows: [] };
      const stages = [[{}, []], [{ ch2_done: true }, []], [{ ch2_done: true }, [QUEST[who]]], [{ ch2_done: true, lq_ally1: true }, [QUEST[who]]], [{ ch2_done: true, lq_ally1: true, lq_ally2: true }, [QUEST[who]]]];
      for (const [flags, quests] of stages) {
        const s = RB.state.newCampaign({});
        s.comp = who;
        Object.assign(s.flags, flags);
        for (const q of quests) s.quests[q] = { stage: 9, done: true };
        const st = RB.combatLogic.init(moth, s, {});
        out[who].rows.push(RB.combatLogic.compOptions(st, s, { kind: 'unravel' }).filter((o) => !o.locked).map((o) => o.def.id));
      }
      // a late alliance alone does not open the personal quest's action
      const s = RB.state.newCampaign({}); s.comp = who; Object.assign(s.flags, { ch2_done: true, lq_ally1: true });
      out[who].lateOnly = RB.combatLogic.compOptions(RB.combatLogic.init(moth, s, {}), s, { kind: 'unravel' }).filter((o) => !o.locked).map((o) => o.def.id);
    }
    return out;
  }, QUEST);
  for (const [who, { rows }] of Object.entries(table)) {
    assert(rows.map((r) => r.length).join() === '1,2,3,4,5', who + ': 1, 2, 3, 4, 5 actions along the story ' + JSON.stringify(rows));
    assert(rows.every((r, i) => i === 0 || rows[i - 1].every((id) => r.includes(id))), who + ': nothing is taken away later');
    assert(table[who].lateOnly.length === 3 && !table[who].lateOnly.includes(rows[2].find((id) => !rows[1].includes(id))), who + ': the personal quest\'s action needs the quest');
  }
  // the menu itself: Suzu before and after chapter 2; "Draw its eye" is new once
  await battle(p, { map: 'sa.conduits', foe: 'g1', diff: 'relaxed', comp: 'suzu', flags: {}, tips: { cturn: 1, 'cact:suzu_heckle': 1 } });
  await queue(p, 'Unravel');
  let m = await menu(p);
  assert(m.acts.length === 1 && /Heckle/.test(m.acts[0].text), 'at recruitment: Heckle only ' + JSON.stringify(m.acts));
  await p.click('[data-back]');
  await cards(p);
  await flee(p);
  await battle(p, { map: 'sa.conduits', foe: 'g1', diff: 'relaxed', comp: 'suzu', flags: { ch2_done: true }, tips: { cturn: 1, 'cact:suzu_heckle': 1 } });
  await queue(p, 'Unravel');
  m = await menu(p);
  const eye = m.acts.find((a) => /Draw its eye/.test(a.text));
  assert(m.acts.length === 2 && eye && eye.fresh && /New/.test(eye.text) && /new move: Draw its eye/i.test(m.coach), 'after chapter 2: Draw its eye, marked New and announced ' + JSON.stringify(m));
  await companionTurn(p, { match: 'Heckle', delay: 0 });
  await idle(p);
  const r = await p.evaluate(() => window.__result);
  assert(!r, 'the fight goes on to a second exchange');
  // (whatever response is open now: its move may have closed Unravel for a round)
  await queue(p, 'Unravel|water|wind|light|stone');
  m = await menu(p);
  assert(!m.acts.some((a) => a.fresh) && !/new move/i.test(m.coach), 'announced once: the next menu has no New and no note ' + JSON.stringify(m));
  await p.click('[data-back]');
  const seen = await p.evaluate(() => RB.game.s.tips['cact:suzu_eye']);
  assert(seen, 'the announcement is remembered in the campaign\'s tips');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('previews of the companion\'s actions: the target, every creature, you both; another creature chosen during the menu is the one it acts on', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'sa.stacks', foe: 'w1', diff: 'normal', comp: 'suzu', flags: { ch2_done: true, lq_ally1: true, lq_ally2: true }, quests: ['co_suzu'], tips: { cturn: 1, 'cact:suzu_heckle': 1, 'cact:suzu_eye': 1, 'cact:suzu_encore': 1, 'cact:suzu_feint': 1, 'cact:suzu_finale': 1 } });
  const cur0 = await aimAtStrongest(p);
  await queue(p, 'Unravel');
  const hoverAct = async (re) => {
    const a = await p.evaluate((re) => { const c = [...document.querySelectorAll('.ccard')].find((x) => new RegExp(re, 'i').test(x.textContent)); c.scrollIntoView({ block: 'center' }); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, re);
    await p.mouse.move(a.x, a.y);
    await wait(p, 120);
    return marks(p);
  };
  let m = await hoverAct('Heckle');
  assert(m.preview && m.preview.foes.join() === String(cur0) && !m.preview.allies.length, 'Heckle marks the target ' + JSON.stringify(m));
  m = await hoverAct('Grand gesture');
  assert(m.preview && m.preview.foes.slice().sort().join() === '0,1', 'the Grand gesture marks both creatures ' + JSON.stringify(m));
  // choose the other creature during the menu: the mark and the action follow
  const other = cur0 === 0 ? 1 : 0;
  await p.click('.cb-foe .fs[data-foe="' + other + '"]');
  await wait(p, 150);
  m = await marks(p);
  assert(m.target === other, 'the other creature is now the one the companion aims at ' + JSON.stringify(m));
  const lab = await p.evaluate(() => [...document.querySelectorAll('.ccard')].find((x) => /Heckle/.test(x.textContent)).querySelector('.rc-tgt').textContent);
  m = await hoverAct('Heckle');
  assert(m.preview.foes.join() === String(other), 'Heckle now marks it ' + JSON.stringify(m) + ' (' + lab + ')');
  await companionTurn(p, { match: 'Heckle', delay: 0 });
  await idle(p);
  const ex = await p.evaluate(() => G.exch);
  const pa = ex.find((x) => x.k === 'playerAct'), ca = ex.find((x) => x.k === 'compAct');
  assert(pa.cur === cur0 && pa.after.foes[cur0].knots === pa.before.foes[cur0].knots - 1, 'your response still acted on your target');
  assert(ca.arg === 'suzu_heckle' && ca.fx.some((f) => f.t === 'soften' && f.foe === other), 'Suzu heckled the creature chosen during her menu ' + JSON.stringify(ca.fx));
  assert((await p.evaluate(() => RB.combat.state() && RB.combat.state().cur)) === cur0, 'and your target stays yours');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('the late alliances\' actions on screen: Nao takes half of a blow at you, Suzu draws every eye, Ren stands in front', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const late = { flags: { ch2_done: true, lq_ally1: true, lq_ally2: true } };
  const strikeAtYou = () => p.evaluate(() => { const st = RB.combat.state(); for (const f of st.foes) f.intent = Object.assign({}, f.intent, { kind: 'strike', target: 'pc', label: 'Strike' }); RB.combat.refresh(); });
  const seen = {};
  for (const [comp, act] of [['nao', 'Take half'], ['suzu', 'Grand gesture'], ['ren', 'Stand in front']]) {
    await battle(p, Object.assign({ map: 'sa.stacks', foe: 'w1', diff: 'normal', comp, tips: { cturn: 1 } }, late));
    await p.evaluate(() => { G.calls.length = 0; G.exch.length = 0; });
    await aimAtStrongest(p);
    await strikeAtYou();
    await queue(p, 'Unravel');
    const picked = await companionTurn(p, { match: act, delay: 0 });
    assert(new RegExp(act).test(picked), comp + ': chose ' + act + ' (' + picked + ')');
    await idle(p);
    const ex = await p.evaluate(() => G.exch);
    const ca = ex.find((x) => x.k === 'compAct'), ea = ex.find((x) => x.k === 'enemyAct');
    const hits = ea.fx.filter((f) => f.t === 'hit' || f.t === 'block');
    const log = await p.evaluate(() => document.querySelector('.clog').textContent.replace(/\s+/g, ' '));
    seen[comp] = { hits: hits.map((f) => f.who + f.n).join(' '), log: log.slice(0, 160) };
    if (comp === 'nao') assert(ea.fx.some((f) => f.t === 'comp' && f.share) && hits.some((f) => f.who === 'pc') && hits.some((f) => f.who === 'comp') && /takes half/.test(log), 'Take half: the blows at you are shared, and the log says so ' + JSON.stringify(seen.nao));
    if (comp === 'suzu') assert(ca.fx.filter((f) => f.t === 'draw').length === 2 && !hits.some((f) => f.who === 'pc'), 'Grand gesture: both creatures\' blows go to Suzu (or her flourish turns one aside) ' + JSON.stringify(seen.suzu));
    if (comp === 'ren') assert(ca.after.ward.pc === ca.before.ward.pc + 3, 'Stand in front: a 3-point ward before you ' + JSON.stringify(ca));
    const shown = await p.evaluate(() => { const v = RB.combat.shown(), st = RB.combat.state(); return v && st && v.pc === st.pc && v.comp === st.comp && v.ward.pc === st.ward.pc; });
    assert(shown, comp + ': the screen ends equal to the rules');
    await flee(p);
  }
  console.log('   ' + JSON.stringify(seen));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
