// Browser test: the companion ending extensions and The Pages We Keep in the
// built index.html, each scenario in its own isolated browser context with a
// synthetic campaign (never a real player save).
//
//   node tools/build.mjs && node tests/e2e/pages_ending.mjs [--only endings,legacy,nao,mio,ren,suzu,shots]
//
// Long stretches (the epilogue's walk through the towns, whole expeditions)
// run in the harness's auto mode (RB.test): the real scene runner, dialogue,
// hooks, maps, transitions, saves and combat rules, with lines advanced at
// once, walk-ins not waited for, language steps and battles answered by the
// harness, and every choice made by the same picker (window.__pick). Rooms
// are entered through their real exits and scenes, standing next to things
// rather than walking there. The captured moments ("shots") are played
// through the real UI instead: dialogue Next, choice buttons, the folio.
//
// endings  all four companions: sa.epilogue (towns, sa.end_comp, credits,
//          postgame, the Lantern Hall, Tsuru's introduction) → the passage
//          once, +2, a memory, no other change → nothing more in that visit;
//          back into the Hall later → Page I offered and deferred.
//          Nao's letter stays undelivered, is delivered afterwards with the real
//          scene, and An Unfinished Conversation follows by talking to Nao.
// legacy   an older postgame save through a real slot save + page reload +
//          load: A Conversation We Still Owe Ourselves, deferred once, then had.
// nao      evidence at the gate; save + reload at the camp; the camp talk and an
//          early return; Page III at the homecoming.
// mio      a whole expedition to the road's end, the camp talk put off; Page II
//          and III at the homecoming.
// ren      a defeat after a qualifying event; the homecoming talk put off; save +
//          reload; Page II, then Page III, by talking to Ren in the Hall.
// suzu     a defeat before any event; a second outing (camp talk, early return,
//          Page III); save + reload after the reward; a third outing with "Talk
//          about this road" at the camp and after the homecoming.
// shots    the real UI: Nao's reply in the ending, Suzu's sincere moment, the
//          camp menu, Page III's captions, the card on the wall, the Journey
//          page (wide and phone) and the Company panel.
// Pets belong to another worker: where a pet is needed, RB.pets is a stand-in
// ({ visible: () => true }), the only call these scenes make.
import { serve, launch, page, root } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1].split(',') : null; })();
const OUT = path.join(root, 'tests', 'e2e', 'out', 'pages');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const browser = await launch();
let fails = 0;
const log = (...a) => console.log('  ', ...a);
const check = (cond, msg) => { if (cond) log('ok  ', msg); else { fails++; log('FAIL', msg); } };
const want = (k) => !only || only.includes(k);
const t0 = Date.now();

// ---- in-page helpers: the choice picker and the expedition driver -------------------------------------
const HELPERS = `
window.__pick = (texts) => {
  const s = RB.game.s, c = s && s.comp, P = c && RB.pages.PROJECT[c], plan = window.__plan || {};
  const idx = (re) => texts.findIndex((t) => re.test(t));
  const eq = (str) => texts.indexOf(str);
  if (P) {
    const th = Object.keys(P.themes);
    if (texts.some((t) => th.some((k) => P.themes[k].en === t))) return plan.theme === 'later' ? idx(/^Not now/) : eq(P.themes[plan.theme || th[0]].en);
    const as = Object.keys(P.aspects);
    const asp = s.atlas.run ? plan.aspect : (plan.aspectHome || plan.aspect);
    if (texts.some((t) => as.some((k) => P.aspects[k].en === t))) return asp === 'later' ? texts.length - 1 : eq(P.aspects[asp || as[0]].en);
    const p = RB.pages.state(s);
    if (p && P.captions[p.theme].some((x) => texts.includes(x.en))) return plan.caption === 'later' ? texts.length - 1 : eq(P.captions[p.theme][plan.caption || 0].en);
    const rp = RB.pages.REPLY[c];
    if (texts.some((t) => rp.some((r) => r.en === t))) return Math.max(0, texts.indexOf((rp.find((r) => r.id === plan.reply) || rp[0]).en));
  }
  if (idx(/^Go on/) >= 0) {
    if (plan.camp === 'talk' && idx(/Talk about the page/) >= 0) return idx(/Talk about the page/);
    if (plan.camp === 'road' && idx(/Talk about this road/) >= 0) return idx(/Talk about this road/);
    return plan.after === 'home' ? idx(/Head home/) : idx(/^Go on/);
  }
  if (idx(/Let's talk now/) >= 0) return plan.home === 'later' ? idx(/^Later/) : idx(/Let's talk now/);
  if (idx(/^Tell me/) >= 0) return plan.home === 'later' ? idx(/^Later/) : idx(/^Tell me/);
  if (idx(/finish it now/) >= 0) return plan.finish === 'later' ? idx(/Another time/) : idx(/finish it now/);
  if (idx(/Listen to Suzu/) >= 0) return Math.max(0, idx(new RegExp(plan.suzuRead || 'Listen')));
  if (idx(/Set out on an unwritten road/) >= 0) return idx(/Not now/);
  return 0;
};
window.__auto = (on) => { if (on) RB.test.enable({ choose: (opts) => { const i = window.__pick(opts.map((o) => RB.script.enVars(o.en || ''))); return i < 0 ? 0 : i; } }); else RB.test.disable(); };
// An expedition on a quiet road, room by room. o: { defeatBefore, defeatAfter, stopAtCamp, resume }
window.__outing = async (o) => {
  o = o || {};
  const T = RB.test, AT = RB.atlas, s = () => RB.game.s, log = [];
  const idle = () => T.idle(60000);
  if (!o.resume) { AT._debug.flags.chooseMod = 3; AT._debug.flags.autoSteps = true; await RB.hooks.atlas_start([], {}); await idle(); }
  const present = (pp) => !pp.if || RB.state.test(s(), pp.if);
  const def = () => RB.content.maps[s().map];
  const DIR = [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']];
  const stand = (x, y) => { const m = RB.world.W.map; for (const [dx, dy, dir] of DIR) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || RB.maps.blockedStatic(m, nx, ny) || RB.maps.exitAt(m, nx, ny)) continue; T.place(nx, ny, dir); return true; } return false; };
  const use = async (x, y) => { await T.use(x, y); await idle(); };
  const exitVia = async (e) => {
    const locked = e.locked && !(e.unlock && RB.state.test(s(), e.unlock));
    if (locked) { stand(e.x, e.y); await RB.script.run(e.locked); await idle(); return; }
    await RB.game.transition(e.to, e.tx, e.ty, e.dir || 'up'); await idle();
  };
  const lose = async () => {
    RB.content.enemies['atlas.test_squall'] = Object.assign({}, RB.content.enemies['atlas.crane'], { name: { jp: 'テスト', en: 'Test squall' }, knots: 9, pattern: ['sweep'] });
    // the harness would play this battle to a win (the companion wards and
    // misdirects); the loss itself is decided here, everything after it is the game's
    const b = T.battle; T.battle = () => 'lose';
    try { await RB.game.startBattle('atlas.test_squall', {}); } finally { T.battle = b; }
    await idle();
  };
  for (let guard = 0; guard < 26; guard++) {
    const run = s().atlas.run;
    if (!run) return { how: 'over', log };
    const key = run.room, room = AT._debug.plan()[key];
    log.push(key + ':' + room.kind + (room.obj ? ':' + room.obj.type : ''));
    if (o.defeatBefore && key === 't') { await lose(); return { how: 'defeat', log }; }
    if (room.obj && room.obj.type === 'doors') {
      const tab = def().props.find((pp) => pp.scene === 'atlas.doors.clue'); if (tab) await use(tab.x, tab.y);
      await exitVia(def().exits.find((e) => e.correct)); continue;
    }
    for (let i = 0; i < 6; i++) { const pr = def().props.find((pp) => pp.scene === 'atlas.obj' && present(pp)); if (!pr) break; await use(pr.x, pr.y); }
    for (let i = 0; i < 4; i++) { const n = RB.world.W.npcs.find((a) => a.def && a.def.name && !s().flags['atlas_r_name_' + key + '_' + a.id.replace('atlas_n', '')]); if (!n) break; await T.talk(n.id); await idle(); }
    for (let i = 0; i < 2; i++) { const f = RB.world.W.foes.find((a) => a.id === 'guard'); if (!f) break; await use(f.x, f.y); }
    for (let i = 0; i < 4; i++) { const pr = def().props.find((pp) => pp.scene === 'atlas.relic.find' && present(pp)); if (!pr) break; await use(pr.x, pr.y); }
    if (o.defeatAfter && key === 't') { await lose(); return { how: 'defeat', log }; }
    if (room.kind === 'camp') {
      if (o.stopAtCamp) return { how: 'camp', log };
      const st = def().props.find((pp) => pp.scene === 'atlas.camp');
      await use(st.x, st.y);
      if (!s().atlas.run) return { how: 'early', log };
    }
    if (room.kind === 'climax') { const g = RB.world.W.npcs.find((a) => a.id === 'atlas_guardian'); if (g) { await T.talk(g.id); await idle(); } }
    if (room.kind === 'extract') { const w = def().props.find((pp) => pp.scene === 'atlas.extract.room'); await use(w.x, w.y); return { how: s().atlas.run ? 'stuck' : 'complete', log }; }
    const e = def().exits.find((x) => !x.door) || def().exits[0];
    const before = s().map;
    await exitVia(e);
    if (s().map === before) return { how: 'stuck', log };
  }
  return { how: s().atlas.run ? 'stuck' : 'over', log };
};
`;
const helpers = (p) => p.evaluate((H) => { (0, eval)(H); }, HELPERS);
async function fresh(vp) {
  const r = await page(browser, url, { viewport: vp || { width: 1280, height: 800 } });
  await helpers(r.p);
  return r;
}
const S = (p, f, a) => p.evaluate(f, a);
const plan = (p, o) => p.evaluate((o) => { window.__plan = o; }, o);
const project = (p) => S(p, () => { const x = RB.pages.state(RB.game.s); return x ? JSON.parse(JSON.stringify(x)) : null; });
const awards = (p) => S(p, () => ['ending', 'project:1', 'project:2', 'project:3'].map((k) => RB.game.s.company.bond[k] || 0).join(','));
const backlogHas = (p, re) => p.evaluate((re) => RB.game.s.backlog.some((l) => new RegExp(re).test((l.en || '') + (l.jp || ''))), re);
const outing = (p, o) => p.evaluate(async (o) => { window.__auto(true); const r = await window.__outing(o); return r; }, o || {});
const autoRun = (p, fn, a) => p.evaluate(async ([fn, a]) => { window.__auto(true); const f = (0, eval)('(' + fn + ')'); const r = await f(a); await RB.test.idle(60000); return r; }, [fn.toString(), a]);
async function reloadVia(p, slot) {
  await p.evaluate(async (slot) => { RB.save.setCurrent(slot, 0); await RB.save.writeSlot(slot, RB.game.s, { force: true }); }, slot);
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 30000 });
  await helpers(p);
  return p.evaluate(async (slot) => { RB.game.settings.textSpeed = 'instant'; RB.ui.title.hide(); const ok = await RB.game.loadCampaign(slot); window.__auto(true); await RB.test.idle(60000); return ok; }, slot);
}
// A post-story campaign in Reedwake whose ending passage has been had (or not: legacy).
async function postgame(p, comp, o) {
  await p.evaluate(([comp, o]) => {
    const flags = { rw_echo_done: true, departed: true, rw_koji_back: true, rw_hall_gather: true, bridge_fixed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, lf_bell_rung: true, post: true, postgame: true, ch6_done: true, sa_done: true, sa_ren_took: true, sa_ren_decided: true, co_suzu_done: true };
    const s = RB.game.debugStart('rw.village', 21, 10, { comp, profile: 'F', flags, dir: 'up' });
    RB.game.settings.textSpeed = 'instant';
    s.atlas.unlocked = true; s.seen['rw.atlas_intro'] = true;
    const q = { nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio', suzu: 'co_suzu' }[comp];
    s.quests[q] = { stage: 9, done: true };
    if (!o.legacy) RB.company.memory(s, { id: 'ending:' + comp, kind: 'reflections', title: { jp: '{橋|はし}', en: 'x' }, pq: true, replyId: 'quiet' });
  }, [comp, o || {}]);
}
const enterHall = (p) => autoRun(p, async () => { await RB.test.go('rw.hall', 5, 8, 'up'); });
const chat = (p) => autoRun(p, async () => { RB.game.companionTalk(); await RB.test.wait(80); });
async function finish(name, r) {
  check(r.errors.length === 0, name + ': no console/page errors' + (r.errors.length ? ': ' + r.errors.slice(0, 3).join(' | ') : ''));
  check(r.requests.length === 0, name + ': no external requests');
  await r.ctx.close();
}

// ---- the real UI, for the captured moments --------------------------------------------------------------
async function uiStep(p) {
  return p.evaluate(() => {
    const shown = (el) => el && !el.classList.contains('hidden') && el.offsetParent !== null;
    const q = window.__shots || [];
    const ch = document.querySelector('.choices');
    if (shown(ch)) {
      const bs = [...ch.querySelectorAll('button')];
      const texts = bs.map((b) => { const e = b.querySelector('.enline') || b.querySelector('.en'); return (e ? e.textContent : b.textContent).trim(); });
      if (q.length && texts.some((t) => new RegExp(q[0][0]).test(t))) return 'shot:' + q.shift()[1];
      const i = window.__pick(texts);
      const b = bs[i] || bs[0];
      b.click(); return 'choice';
    }
    const dlg = document.querySelector('.dlg');
    if (shown(dlg)) {
      if (q.length && new RegExp(q[0][0]).test(dlg.textContent)) return 'shot:' + q.shift()[1];
      dlg.querySelector('.b-next').click(); return 'dialogue';
    }
    const c = document.querySelector('.banner-layer');
    if (c) { c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return 'card'; }
    return null;
  });
}
async function settle(p, ms = 240000) {
  const t = Date.now();
  let idle = 0;
  while (Date.now() - t < ms) {
    const a = await uiStep(p);
    if (a && a.startsWith('shot:')) { await p.waitForTimeout(150); await p.screenshot({ path: path.join(OUT, a.slice(5) + '.png') }); continue; }
    if (a) { idle = 0; await p.waitForTimeout(20); continue; }
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), running: RB.script.isRunning() }));
    if (st.mode === 'world' && !st.running) { idle++; if (idle > 3) return true; }
    await p.waitForTimeout(80);
  }
  await p.screenshot({ path: path.join(OUT, 'timeout.png') });
  throw new Error('timed out waiting for the world');
}
const shots = (p, list) => p.evaluate((list) => { window.__shots = list; }, list);

// =====================================================================================================
// 1. Fresh endings through the real epilogue, all four companions
// =====================================================================================================
if (want('endings')) for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  console.log('\n== fresh ending: ' + comp);
  const r = await fresh();
  const p = r.p;
  await p.evaluate((comp) => {
    const flags = { rw_echo_done: true, departed: true, rw_koji_back: true, rw_hall_gather: true, bridge_fixed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, lf_bell_rung: true,
      end_mem_return: true, end_archive_library: true, end_kasane_trial: true, sa_ren_took: true, sa_ren_decided: true, co_suzu_done: true, sa_hush_down: true };
    const s = RB.game.debugStart('sa.road', 3, 22, { comp, profile: 'E', flags, dir: 'down' });
    RB.game.settings.textSpeed = 'instant';
    s.learn.kanaKnown = 'both';
    s.quests.sa_main = { stage: 6, done: false };
    if (comp === 'nao') s.quests.lf_nao = { stage: 1, done: false }; // the letter is still in the bag
    if (comp === 'mio') { s.quests.lf_mio = { stage: 9, done: true }; s.company.pets.cat = { name: 'Koma' }; s.company.pet = 'cat'; RB.pets = { visible: () => true }; }
    if (comp === 'ren') { s.quests.ren_ushio = { stage: 9, done: true }; for (const k of ['ch2', 'ch3', 'ch4', 'ch5']) s.company.bond[k] = 1; s.company.bond.pq = 3; RB.company.memory(s, { id: 'test:mill', kind: 'discoveries', title: { jp: '{水車|すいしゃ} の {道|みち}', en: 'The Mill Road' }, comp: 'ren' }); }
    if (comp === 'suzu') s.quests.co_suzu = { stage: 9, done: true };
    window.__plan = { reply: { nao: 'home', mio: 'carry', ren: 'lost', suzu: 'onstage' }[comp], theme: 'later' };
  }, comp);
  const st0 = Date.now();
  const res = await autoRun(p, async () => {
    const before = JSON.stringify([RB.game.s.inv]);
    await RB.script.run('sa.epilogue');
    for (let i = 0; i < 120 && !RB.game.s.seen['rw.atlas_intro']; i++) { await RB.test.wait(120); if (!RB.script.isRunning() && RB.game.mode() === 'world') await RB.test.idle(20000); }
    await RB.test.idle(20000);
    await RB.test.wait(400);
    await RB.test.idle(20000);
    const s = RB.game.s;
    const out = { before, inv: JSON.stringify([s.inv]), map: s.map, post: !!s.flags.postgame, intro: !!s.seen['rw.atlas_intro'], stacked: !!s.seen['pages.enter_offer'], mem: s.company.memories.filter((m) => /^ending/.test(m.id)).map((m) => m.id + ':' + m.replyId + ':' + m.pq), ending: s.company.bond.ending || 0, problems: RB.test.problems.slice(0, 3) };
    // out of the Hall and back in: now the companion offers Page I (the plan puts it off)
    await RB.test.go('rw.village', 21, 10, 'down');
    await RB.test.go('rw.hall', 5, 8, 'up');
    for (let i = 0; i < 60 && !s.seen['pages.enter_offer']; i++) await RB.test.wait(100);
    await RB.test.idle(20000);
    out.offer = !!s.seen['pages.enter_offer']; out.proj = !!RB.pages.state(s);
    return out;
  });
  check(res.map === 'rw.hall' && res.post && res.intro && res.problems.length === 0, comp + ': the epilogue ends in the Lantern Hall with the Atlas introduced (' + ((Date.now() - st0) / 1000).toFixed(0) + ' s)' + (res.problems.length ? ' ' + JSON.stringify(res.problems) : ''));
  check(res.mem.length === 1 && res.mem[0].indexOf('ending:' + comp) === 0 && res.ending === 2, comp + ': the passage played once: +2 bond, one memory (' + res.mem.join() + ')');
  check(res.inv === res.before, comp + ': no item given or taken by the passage (no second gift)');
  check(!res.stacked && res.offer && !res.proj, comp + ': Page I is not stacked onto the ending; offered on coming back into the Lantern Hall, and deferred without cost');
  if (comp === 'nao') {
    check(await backlogHas(p, "haven't delivered"), 'nao: the undelivered letter acknowledged, no answer spoiled');
    check(!(await backlogHas(p, "I haven't written back")), 'nao: the epilogue in Lanternfall does not pretend Umi has the letter');
    const un = await autoRun(p, async () => {
      await RB.test.go('lf.ferry', 5, 7, 'up');
      await RB.script.run('lf.nao_deliver');
      await RB.test.idle();
      const waiting = RB.game.s.quests.lf_nao.done && (RB.pages.pending(RB.game.s) || {}).id === 'unfinished';
      RB.game.companionTalk();
      await RB.test.wait(80); await RB.test.idle();
      return { waiting, had: RB.game.s.company.memories.some((m) => m.id === 'unfinished:nao') && !RB.pages.needUnfinished(RB.game.s) };
    });
    check(un.waiting, 'nao: delivered after the ending with the real scene; the follow-up is waiting');
    check(un.had, 'nao: An Unfinished Conversation, by talking to Nao (no boss, no credits)');
    check((await awards(p)).startsWith('2,'), 'nao: no second ending award');
  }
  if (comp === 'mio') check(await backlogHas(p, 'The cat sniffs'), 'mio: the cat (shown) has a quiet background beat');
  if (comp === 'ren') check(await backlogHas(p, 'The Mill Road'), 'ren: a recorded shared moment is recalled by its title');
  if (comp === 'suzu') check(await backlogHas(p, 'without a costume'), 'suzu: one sincere moment, off the stage');
  const rep = await autoRun(p, async () => {
    const snap = () => JSON.stringify([RB.game.s.company.bond, RB.game.s.company.memories.length, RB.game.s.awarded, RB.game.s.inv]);
    const a = snap();
    await RB.script.run('sa.end_comp');
    return a === snap();
  });
  check(rep, comp + ': running the ending again awards nothing');
  await finish(comp + ' ending', r);
}

// =====================================================================================================
// 2. An older postgame save: A Conversation We Still Owe Ourselves
// =====================================================================================================
if (want('legacy')) {
  console.log('\n== legacy postgame save');
  const r = await fresh();
  const p = r.p;
  await postgame(p, 'suzu', { legacy: true });
  const ok = await reloadVia(p, 5);
  check(ok && (await S(p, () => RB.pages.needRetro(RB.game.s))), 'legacy: saved to a slot, page reloaded, loaded; the conversation is owed');
  await plan(p, { home: 'later' });
  await enterHall(p);
  check(await S(p, () => !!RB.game.s.seen['pages.enter_retro'] && RB.pages.needRetro(RB.game.s)), 'legacy: offered once on entering the Lantern Hall; "later" keeps it');
  await plan(p, { reply: 'seat' });
  await chat(p);
  const st = await S(p, () => ({ mem: RB.game.s.company.memories.map((m) => m.id), ending: RB.game.s.company.bond.ending, owed: RB.pages.needRetro(RB.game.s), offer: RB.pages.offerOpen(RB.game.s) }));
  check(st.mem.includes('ending_retro:suzu') && st.ending === 2 && !st.owed, 'legacy: had by talking to Suzu: +2 once, a memory marked as told afterwards');
  check(st.offer, 'legacy: afterwards the project can be offered');
  await chat(p);
  check((await awards(p)).startsWith('2,') && (await S(p, () => RB.game.s.company.memories.filter((m) => /^ending/.test(m.id)).length)) === 1, 'legacy: talking again adds nothing');
  await finish('legacy', r);
}

// =====================================================================================================
// 3. The Pages We Keep, all four companions
// =====================================================================================================
async function acceptPage1(p, comp, theme) {
  await plan(p, { theme });
  await enterHall(p);
  const pr = await project(p);
  check(pr && pr.stage === 1 && pr.theme === theme && (await awards(p)) === '0,1,0,0', comp + ': Page I accepted when entering the Lantern Hall (' + theme + '): +1');
}
if (want('nao')) {
  console.log('\n== nao: early return from the camp');
  const r = await fresh();
  const p = r.p;
  await postgame(p, 'nao');
  await acceptPage1(p, 'nao', 'next');
  let o = await outing(p, { stopAtCamp: true });
  let pr = await project(p);
  check(o.how === 'camp' && pr.ev && pr.ev.ret === null, 'nao: a real event recorded on the way (' + (pr.ev && pr.ev.kind) + ': "' + (pr.ev && pr.ev.desc.en) + '"; rooms ' + o.log.join(' ') + ')');
  const ok = await reloadVia(p, 6);
  const pr2 = await project(p);
  check(ok && pr2.ev && pr2.ev.id === pr.ev.id && (await S(p, () => !!RB.game.s.atlas.run && RB.pages.campOpen(RB.game.s))), 'nao: save + reload at the camp after the evidence: the run and the page survive');
  await plan(p, { camp: 'talk', aspect: 'decide', after: 'home', home: 'now', finish: 'now', caption: 1 });
  o = await outing(p, { resume: true });
  pr = await project(p);
  check(o.how === 'early' && pr.stage === 3 && pr.where === 'camp' && pr.ev.ret === 'early', 'nao: the camp talk, an early return, Page III at the homecoming (' + o.how + ')');
  check((await awards(p)) === '0,1,1,1' && (await S(p, () => !!RB.game.s.discovery.keepsakes.pages_nao)), 'nao: +1 × 3 and the Folded Route Card, once');
  check(await backlogHas(p, 'turned back on|Turning back'), 'nao: the early return is told as a real decision');
  await autoRun(p, async () => { await RB.test.use(7, 1); });
  check(await backlogHas(p, 'A folded route card is pinned'), 'nao: the finished card can be looked at on the Lantern Hall wall');
  await finish('nao', r);
}
if (want('mio')) {
  console.log('\n== mio: a whole expedition, the camp talk put off');
  const r = await fresh();
  const p = r.p;
  await postgame(p, 'mio');
  await acceptPage1(p, 'mio', 'pause');
  await plan(p, { camp: 'talk', aspect: 'later', aspectHome: 'stop', after: 'go', home: 'now', finish: 'now', caption: 0 });
  const o = await outing(p, {});
  const pr = await project(p);
  check(o.how === 'complete' && pr.stage === 3 && pr.where === 'home' && pr.ev.ret === 'complete', 'mio: to the road\'s end; Page II and III at the homecoming (' + o.how + '; ' + o.log.join(' ') + ')');
  check((await awards(p)) === '0,1,1,1' && (await S(p, () => !!RB.game.s.discovery.keepsakes.pages_mio && RB.game.s.atlas.completed === 1 && !!RB.game.s.flags.atlas_restore_1)), 'mio: +1 × 3, the Tea-Place Card, and the expedition\'s own rewards as usual');
  await autoRun(p, async () => { await RB.test.go('rw.tea', 4, 7, 'up'); await RB.test.use(4, 1); });
  check(await backlogHas(p, 'two teacups drawn on it'), 'mio: the card is up in Hana\'s teahouse');
  await finish('mio', r);
}
if (want('ren')) {
  console.log('\n== ren: a defeat after a qualifying event');
  const r = await fresh();
  const p = r.p;
  await postgame(p, 'ren');
  await acceptPage1(p, 'ren', 'unsure');
  await plan(p, { home: 'later' });
  const o = await outing(p, { defeatAfter: true });
  let pr = await project(p);
  check(o.how === 'defeat' && pr.stage === 1 && pr.ev && pr.ev.ret === 'defeat', 'ren: the event from before the defeat is kept; the road sent you home (' + JSON.stringify({ how: o.how, stage: pr.stage, ev: pr.ev && pr.ev.kind, ret: pr.ev && pr.ev.ret, log: o.log }) + ')');
  check(await S(p, () => RB.game.s.map === 'rw.hall' && (RB.pages.pending(RB.game.s, 'hall') || {}).id === 'home2'), 'ren: the homecoming talk put off: it waits in the Hall');
  const ok = await reloadVia(p, 4);
  check(ok && (await S(p, () => RB.game.s.map === 'rw.hall' && RB.pages.home2Open(RB.game.s))), 'ren: save + reload before the homecoming talk: still waiting');
  await plan(p, { aspect: 'unknown', finish: 'later' });
  await chat(p);
  pr = await project(p);
  check(pr.stage === 2 && pr.where === 'home' && (await awards(p)) === '0,1,1,0', 'ren: Page II at home by talking to Ren; Page III put off');
  check(await backlogHas(p, 'folded us up and sent us back'), 'ren: the defeat is told as the road sending you home');
  await plan(p, { caption: 1 });
  await chat(p);
  pr = await project(p);
  check(pr.stage === 3 && (await awards(p)) === '0,1,1,1' && (await S(p, () => !!RB.game.s.discovery.keepsakes.pages_ren)), 'ren: Page III by talking to Ren again: the Annotated Lantern Page');
  await finish('ren', r);
}
if (want('suzu')) {
  console.log('\n== suzu: a defeat before any event, then two more outings');
  const r = await fresh();
  const p = r.p;
  await postgame(p, 'suzu');
  await acceptPage1(p, 'suzu', 'quiet');
  const o0 = await outing(p, { defeatBefore: true });
  let pr = await project(p);
  check(o0.how === 'defeat' && pr.stage === 1 && !pr.ev && !!pr.lastEmpty, 'suzu: defeated before anything happened: the page stays open, nothing made up');
  check(await backlogHas(p, 'Called off before the curtain'), 'suzu: "there will be another road"');
  check((await awards(p)) === '0,1,0,0', 'suzu: no loss, no award');
  await plan(p, { camp: 'talk', aspect: 'watch', after: 'home', home: 'now', finish: 'now', caption: 1, suzuRead: 'Listen' });
  const o1 = await outing(p, {});
  pr = await project(p);
  check(o1.how === 'early' && pr.stage === 3 && pr.ev.ret === 'early', 'suzu: second outing: the camp talk, an early return, Page III');
  check(await backlogHas(p, 'Not in her stage voice'), 'suzu: the optional reading is only listened to');
  const ok = await reloadVia(p, 3);
  const aw = await awards(p);
  const again = await S(p, () => [RB.pages.page3(RB.game.s, 0), RB.discovery.keepsake(RB.game.s, 'pages_suzu', 'x')]);
  check(ok && aw === '0,1,1,1' && again.join() === 'false,false', 'suzu: save + reload after the reward: nothing lost, nothing can be awarded twice (' + aw + ')');
  const b0 = await S(p, () => JSON.stringify(RB.game.s.company.bond));
  await plan(p, { camp: 'road', after: 'home' });
  await outing(p, {});
  const heard1 = await S(p, () => Object.keys(RB.game.s.company.talk).filter((k) => k.startsWith('road:')));
  check(heard1.length === 1, 'suzu: third outing: one topic at the camp (' + heard1.join() + ')');
  check(await S(p, () => (RB.pages.pending(RB.game.s, 'hall') || {}).id === 'road'), 'suzu: after the homecoming one topic waits; nothing plays by itself');
  await chat(p);
  const heard2 = await S(p, () => Object.keys(RB.game.s.company.talk).filter((k) => k.startsWith('road:')));
  check(heard2.length === 2 && !(await S(p, () => RB.pages.pending(RB.game.s, 'hall'))), 'suzu: talking to her gives the homecoming topic, then ordinary chat');
  check((await S(p, () => JSON.stringify(RB.game.s.company.bond))) === b0, 'suzu: topics award no bond');
  await finish('suzu', r);
}

// =====================================================================================================
// 4. The captured moments, through the real UI
// =====================================================================================================
if (want('shots')) {
  console.log('\n== captures (real UI)');
  // the ending: Nao's reply, and Suzu's moment off the stage
  for (const comp of ['nao', 'suzu']) {
    const r = await fresh();
    const p = r.p;
    await p.evaluate((comp) => {
      const s = RB.game.debugStart('rw.village', 22, 12, { comp, profile: 'E', flags: { departed: true, bridge_fixed: true, rw_koji_back: true, lf_bell_rung: true, sa_ren_took: true, co_suzu_done: true }, dir: 'down' });
      RB.game.settings.textSpeed = 'instant'; s.learn.kanaKnown = 'both';
      s.quests[{ nao: 'lf_nao', suzu: 'co_suzu' }[comp]] = { stage: 9, done: true };
      window.__plan = { reply: comp === 'nao' ? 'walk' : 'onstage' };
      RB.script.run('sa.end_comp');
    }, comp);
    await shots(p, comp === 'nao' ? [["Let's walk the next road", 'ending_reply_nao_1280x800']] : [['without a costume', 'ending_suzu_offstage_1280x800']]);
    await settle(p);
    check(fs.existsSync(path.join(OUT, comp === 'nao' ? 'ending_reply_nao_1280x800.png' : 'ending_suzu_offstage_1280x800.png')), 'shots: the ending passage (' + comp + ') captured');
    await finish('shots ' + comp, r);
  }
  // the camp menu, the captions, the card on the wall, the folio pages
  {
    const r = await fresh();
    const p = r.p;
    await postgame(p, 'nao');
    await acceptPage1(p, 'nao', 'back');
    await outing(p, { stopAtCamp: true });
    await p.evaluate(() => {
      window.__auto(false);
      window.__plan = { camp: 'talk', aspect: 'home', after: 'home', home: 'now', finish: 'now', caption: 1 };
      const st = RB.content.maps[RB.game.s.map].props.find((pp) => pp.scene === 'atlas.camp');
      RB.test.use(st.x, st.y);
    });
    await shots(p, [['Talk about the page', 'camp_menu_1280x800'], ['If you get lost, call out', 'page3_caption_nao_1280x800']]);
    await settle(p);
    check((await project(p)).stage === 3, 'shots: the camp talk and Page III played through the real UI');
    await shots(p, [['folded route card', 'wall_card_nao_1280x800']]);
    await p.evaluate(() => { RB.test.use(7, 1); });
    await settle(p);
    // the card on the wall with nobody standing in front of it
    await p.evaluate(() => { RB.test.place(5, 3, 'right'); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, 'wall_card_hall_1280x800.png') });
    await p.evaluate(() => { RB.ui.menu.open('journey'); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { const b = document.querySelector('[data-jv="pages"]'); if (b) b.click(); });
    await p.waitForTimeout(400);
    const jt = await S(p, () => (document.querySelector('.pages-page') || {}).textContent || '');
    check(/Page III/.test(jt) && /Pinned up on the Lantern Hall wall/.test(jt) && /Turned back from the camp/.test(jt), 'shots: Journey › The Pages We Keep shows the three pages and how the road ended');
    await p.screenshot({ path: path.join(OUT, 'journey_pages_1280x800.png') });
    await p.evaluate(() => { RB.ui.menu.open('companion'); });
    await p.waitForTimeout(400);
    const ct = await S(p, () => (document.querySelector('.pages-shared') || {}).textContent || '');
    check(/An Address for Tomorrow/.test(ct), 'shots: Company shows the shared page');
    await p.evaluate(() => { const b = document.querySelector('.pages-shared'); if (b) b.scrollIntoView({ block: 'center' }); });
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(OUT, 'company_panel_1280x800.png') });
    await finish('shots pages', r);
  }
  // the same Journey page on a phone
  {
    const r = await fresh({ width: 390, height: 844 });
    const p = r.p;
    await postgame(p, 'mio');
    await p.evaluate(() => { const s = RB.game.s; s.company.project = { v: 1, comp: 'mio', stage: 3, theme: 'share', caption: 0, aspect: 'turns', where: 'camp', t1: 1, ev: { run: 'x', id: 'o', kind: 'lanterns', desc: { jp: '', en: 'gave the blank lanterns back their words and lit them' }, title: { jp: '{白|しろ}い {灯籠|とうろう} の {列|れつ}', en: 'The row of blank lanterns' }, mods: [], branch: 'lantern', pet: null, ret: 'complete' }, road: {} }; RB.discovery.keepsake(s, 'pages_mio', 'test'); RB.ui.menu.open('journey'); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { const b = document.querySelector('[data-jv="pages"]'); if (b) b.click(); });
    await p.waitForTimeout(400);
    const fit = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, iw: innerWidth, art: !!document.querySelector('.pages-memento canvas') }));
    check(fit.w <= fit.iw + 1 && fit.art, 'phone: the Journey page fits 390 px, the memento drawn (' + fit.w + ' px)');
    await p.screenshot({ path: path.join(OUT, 'journey_pages_390x844.png') });
    await finish('phone', r);
  }
}

// ---- curated captures for docs/screenshots/pages (WebP) -------------------------------------------------
const DOCS = path.join(root, 'docs', 'screenshots', 'pages');
const pngs = fs.readdirSync(OUT).filter((f) => f.endsWith('.png') && f !== 'timeout.png');
if (want('shots') && pngs.length) {
  fs.mkdirSync(DOCS, { recursive: true });
  const cv = await browser.newPage();
  for (const f of pngs) {
    const data = 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
    const b64 = await cv.evaluate(async (data) => {
      const img = new Image(); img.src = data; await img.decode();
      const k = img.width > 800 ? 0.75 : 1;
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.85).split(',')[1];
    }, data);
    fs.writeFileSync(path.join(DOCS, f.replace(/\.png$/, '.webp')), Buffer.from(b64, 'base64'));
  }
  await cv.close();
  log('captures:', pngs.join(', '));
}
await browser.close();
srv.close();
console.log('\npages_ending: ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s wall clock (auto mode for long stretches; not a playtime measurement)');
console.log(fails ? fails + ' failure(s)' : 'all ok');
process.exit(fails ? 1 : 0);
