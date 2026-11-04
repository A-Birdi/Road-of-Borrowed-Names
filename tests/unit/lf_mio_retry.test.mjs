// Mio's recipe (lf_mio, step 1): "Come back later" is not the recipe read, and the recipe is read again from the
// Company page (Agnes 6639438614; Cloud CC-522, CC-527; Local CL-692, CL-693, CL-694; Agnes 6640720415, 6641511048).
// The first telling ran its exercise and went on, whatever it returned, to her reading of the recipe and step 2. Now
// the exercise is followed by `?(var._res=0) !end`. The quest's retry (src/content/ch5/05_cast.js) is offered under
// Talk with Mio on the Company page while step 1 waits (src/ui/53_company_pages.js questRetry), and the scene's retry
// entry is her request only, then Read it together / Not now. No invitation, no topic record, nothing in
// src/engine/58_companion.js. With synthetic campaigns only: the real scene runner (the dialogue stubbed), the first
// telling reached by the avenue's own arrival event (src/engine/90_game.js runEnterEvents), the exercise answered or
// cancelled by the test as the runner returns it, saves round-tripped through the save's own migration:
//  1. the content: the guard straight after the exercise; the retry entry and its choice; the facing towards the
//     Records Hall on the first telling only; the retry's metadata; step 1 open, with the agreed hint shown by the
//     guide; the only way into the scene in the world is the avenue's arrival, while the quest has not begun;
//  2. the first telling from the avenue's arrival, cancelled: the telling up to her request, step 1, nothing of her
//     reading; the retry offered; then the arrival events again, exit and re-entry, other people's talk, a save and
//     load: nothing starts by itself; world talk to Mio is never the recipe;
//  3. the retry, Not now: her request only, nothing asked, nothing changed, still offered;
//  4. the retry, read and cancelled: her request only, unchanged, still offered;
//  5. the retry, read: her reading once, step 2, the retry gone, Tadashi next (his talk list and the guide); the scene
//     again runs nothing;
//  6. off Lanternfall (an outdoor map and an interior): the retry walks no one and turns no one towards the avenue's
//     Records Hall; her lines as in Lanternfall;
//  7. the companion's topics: the first telling's cancel and the retries leave the talk records exactly as they were
//     (nothing waiting, the Lanternfall invitation waiting, that invitation deferred); while the recipe waits, a due
//     invitation, and after the bell a due reflection, is still enrolled;
//  8. after the bell (the town's after-bell scene first on arrival): the recipe still offered, and read;
//  9. not offered: another companion, no companion, step 2, done, a finished save from before; the scene runs nothing
//     for them;
// 10. cancelled twice, a save and load, then read: everything once; a stale result of 0 before a reading, and of 1
//     before a cancel, changes nothing;
// 11. the first telling read at once, line for line as on the parent (fingerprint taken on the parent, 1fc213d); no
//     scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/lf_side_cancel.test.mjs) ----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], choice = 0, walks = [], cues = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => choice;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async () => {};
  RB.save.autosave = async () => {};
  const name = (w) => String((w && (w.id || w.name)) || w);
  if (RB.staging) {
    RB.staging.walkTo = async (who, x, y) => { walks.push([name(who), x, y]); };
    const cue = RB.staging.cue;
    RB.staging.cue = function (who, g) { cues.push([name(who), g]); return cue.apply(this, arguments); };
  }
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, lf_arrived: true, lf_town_intro: true };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  // in Lanternfall's avenue, the main quest at the town's second step, Mio in the party; the recipe not begun unless
  // `stage` is given
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'lf-mio-retry-test'; st.map = o.map || 'lf.town'; st.comp = o.comp === undefined ? 'mio' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, DONE, o.flags || {});
    st.quests.lf_main = { stage: 2, done: false, t: 1 };
    if (o.stage !== undefined) st.quests.lf_mio = o.stage === 'done' ? { stage: 2, done: true, t: 1 } : { stage: o.stage, done: false, t: 1 };
    st.vars = Object.assign({}, o.vars || {});
    // every map's arrival scene seen already, except the avenue's two (Mio's recipe, and the town after the bell)
    for (const m in C.maps) for (const ev of C.maps[m].onEnter || []) if (m !== 'lf.town') st.flags['enter:' + m + ':' + ev.scene] = true;
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  // every scene the runner is asked for, and its end
  let started = null;
  const realRun = RB.script.run;
  RB.script.run = function (id) { const p = realRun.apply(this, arguments); if (started) started.push({ id, p }); return p; };
  const reset = (o = {}) => { lines = []; asked = []; walks = []; cues = []; cancel = new Set(o.cancel || []); choice = o.choice || 0; };
  const run = async (id, o = {}) => { reset(o); try { await realRun(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  // the game's own arrival events (src/engine/90_game.js runEnterEvents), each scene they start run to its end
  const events = async (o = {}) => { reset(o); started = []; RB.game.runEnterEvents(); const mine = started; started = null; for (const x of mine) await x.p; return mine.map((x) => x.id); };
  const enter = (id, o) => { s.map = id; RB.world.W.map = { id, def: C.maps[id] }; RB.bus.emit('map:enter', { id }); return events(o); };
  // what starts when something is done in the world (a talk, world talk to Mio): the scenes started, run to their end
  const watch = async (fn, o = {}) => { reset(o); started = []; await fn(); const mine = started; started = null; for (const x of mine) await x.p; return mine.map((x) => x.id); };
  const here = (map) => (C.maps[map].npcs || []).filter((n) => !n.if || S.test(s, n.if));
  const talkOf = (map, id) => { const n = here(map).find((x) => x.id === id); return n ? ((Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  // the Company page's retry for the companion with you (null when it is not offered), and the click: the page's own
  // test of it, then its scene
  const offered = () => (RB.ui.companyPages && RB.ui.companyPages.questRetry ? RB.ui.companyPages.questRetry(s, s.comp) : null);
  const retry = async (o = {}) => { const qr = offered(); if (!qr) { reset(o); return null; } await run(qr.scene, o); return qr.scene; };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => { use(RB.save.migrate(JSON.parse(text))); RB.bus.emit('map:enter', { id: s.map }); };
  const stage = () => (s.quests.lf_mio ? (s.quests.lf_mio.done ? 'done' : s.quests.lf_mio.stage) : null);
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p || '');
  const B = {
    first: /As you walk down the avenue/, ask: /Will you read the recipe with me/, read: /This isn't medicine/, cant: /I can't make it/,
    tadashi: /I have to go and tell Tadashi/, come: /Will you come with me\? If my voice/,
  };
  const said = (re) => lines.some((l) => re.test(l.en));
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const reading = () => ['read', 'cant', 'tadashi', 'come'].map((k) => count(B[k]));

  // 1. the content
  {
    const sc = C.scenes['lf.mio_start'], cmds = sc.cmds;
    const i = cmds.findIndex((c) => c.op === 'challenge' && c.args[0] === 'lf.ch_recipe');
    const next = cmds[i + 1];
    const lr = cmds.filter((c) => c.op === 'gesture' && c.args[1] === 'lookroad');
    const ask = cmds.findIndex((c) => c.op === 'choice');
    const q = C.quests.lf_mio, st1 = q.stages[1];
    // the scene's ways in, anywhere in the world: the maps' arrival events, triggers, people and things, and the
    // companion's banter
    const refs = [];
    for (const m in C.maps) { const d = C.maps[m]; for (const k of ['onEnter', 'triggers', 'npcs', 'props']) if (JSON.stringify(d[k] || []).includes('"lf.mio_start"')) refs.push(m + ':' + k); }
    const enterEv = (C.maps['lf.town'].onEnter || []).find((e) => e.scene === 'lf.mio_start');
    const banter = (C.banter || []).filter((b) => b.scene === 'lf.mio_start').length;
    fresh({ stage: 1 });
    const nud = G.nudges('lf_mio', s);
    const hint = !!st1.hint && nud.lines.flat().some((l) => l.en === st1.hint.en && l.jp === st1.hint.jp);
    const a = { i, next, lr: lr.map((c) => c.if || null), ask: ask > i ? 'after' : ask, labels: ['recipe', 'read', 'retry', 'ask'].every((l) => sc.labels[l] != null),
      retry: q.retry, at: st1.at, hen: st1.hint && st1.hint.en, how: G.analyse('lf_mio', s).how, hint, refs, enterIf: enterEv && enterEv.if, banter };
    t.ok(i > 0 && next.op === 'end' && next.if === 'var._res=0' && cmds.slice(i + 2).findIndex((c) => c.op === 'say') >= 0 && a.labels && sc.labels.read === i && sc.labels.recipe < sc.labels.read &&
      flat(a.lr) === '["var.mio_retry=0"]',
      '1a the scene: the guard straight after the exercise; the retry\'s entry at her holding out the recipe; the facing towards the Records Hall on the first telling only ' + flat({ i, next, lr: a.lr, labels: a.labels }));
    t.ok(a.retry && a.retry.when === 'quest.lf_mio=1' && a.retry.scene === 'lf.mio_start' && a.retry.title.en === 'The recipe to read together' && a.retry.title.jp === '{一緒|いっしょ} に {読|よ}む {処方|しょほう}' &&
      a.at === 'open' && a.hen === 'Read it with Mio on the Company page: Talk with Mio, then \'The recipe to read together\'. Anywhere safe.' && a.how === 'open' && a.hint,
      '1b the retry\'s metadata and its agreed title; step 1 open, with the agreed hint shown by the guide ' + flat({ retry: a.retry, at: a.at, how: a.how, hint: a.hint }));
    t.ok(flat(a.refs) === '["lf.town:onEnter"]' && /comp=mio/.test(a.enterIf) && /!quest\.lf_mio(&|$)/.test(a.enterIf) && a.banter === 0,
      '1c the only way into the scene in the world is the avenue\'s arrival, with Mio, while the quest has not begun ' + flat({ refs: a.refs, enterIf: a.enterIf, banter: a.banter }));
  }

  // 2. the first telling from the avenue's arrival, cancelled; then nothing starts by itself
  {
    fresh();
    const ids0 = await enter('lf.town', { cancel: ['lf.ch_recipe'] });
    const a = { ids0, asked: asked.slice(), first: said(B.first), ask: count(B.ask), reading: reading(), walks: walks.length, stage: stage(), offered: !!offered() };
    const again = [];
    again.push(...await events());
    // exit and re-entry, the arrival's once-only mark taken away too: its condition alone keeps it out
    again.push(...await enter('lf.road'));
    delete s.flags['enter:lf.town:lf.mio_start'];
    again.push(...await enter('lf.town'));
    // other people's talk on the avenue, each followed by the arrival events as after every scene
    const people = here('lf.town').filter((n) => n.talk).slice(0, 4);
    for (const n of people) { const sc = talkOf('lf.town', n.id); if (sc) { again.push(...await watch(() => realRun(sc))); again.push(...await events()); } }
    // a save and load
    loadSave(saved());
    again.push(...await events());
    // world talk to Mio (src/engine/90_game.js companionTalk: a waiting topic or a rest setting first, else banter)
    const chat = await watch(async () => { RB.game.companionTalk(); });
    const b = { again, chat, stage: stage(), offered: !!offered(), mio: again.concat(chat).includes('lf.mio_start'), people: people.length };
    t.ok(flat(a.ids0) === '["lf.mio_start"]' && flat(a.asked) === '["lf.ch_recipe"]' && a.first && a.ask === 1 && flat(a.reading) === '[0,0,0,0]' && a.walks === 2 && a.stage === 1 && a.offered,
      '2a the first telling from the avenue\'s arrival, cancelled: the telling up to her request, step 1, nothing of her reading; the retry offered ' + flat(a));
    t.ok(!b.mio && b.stage === 1 && b.offered && b.people > 0 && !b.chat.includes('lf.mio_start'),
      '2b then the arrival events again, exit and re-entry, other people\'s talk, a save and load, world talk to Mio: nothing starts the recipe; still step 1 and offered ' + flat(b));
  }

  // 3, 4 and 5. the retry: Not now; read and cancelled; read
  {
    fresh();
    await enter('lf.town', { cancel: ['lf.ch_recipe'] });
    const sc = await retry({ choice: 1 });
    const a = { sc, n: lines.length, ask: count(B.ask), asked: asked.slice(), stage: stage(), offered: !!offered(), walks: walks.length };
    await retry({ choice: 0, cancel: ['lf.ch_recipe'] });
    const b = { n: lines.length, ask: count(B.ask), asked: asked.slice(), stage: stage(), offered: !!offered(), reading: reading() };
    await retry({ choice: 0 });
    const c = { asked: asked.slice(), ask: count(B.ask), reading: reading(), first: said(B.first), stage: stage(), offered: offered(), tadashi: talkOf('lf.records', 'lf_tadashi'),
      guide: G.analyse('lf_mio', s).targets.map(where) };
    await run('lf.mio_start');
    const d = { n: lines.length, asked: asked.slice(), stage: stage() };
    t.ok(a.sc === 'lf.mio_start' && a.n === 1 && a.ask === 1 && !a.asked.length && a.stage === 1 && a.offered && a.walks === 0,
      '3 the retry, Not now: her request only, nothing asked, nothing changed, still offered ' + flat(a));
    t.ok(b.n === 1 && b.ask === 1 && flat(b.asked) === '["lf.ch_recipe"]' && b.stage === 1 && b.offered && flat(b.reading) === '[0,0,0,0]',
      '4 the retry, read and cancelled: her request only, unchanged, still offered ' + flat(b));
    t.ok(flat(c.asked) === '["lf.ch_recipe"]' && c.ask === 1 && flat(c.reading) === '[1,1,1,1]' && !c.first && c.stage === 2 && c.offered === null && c.tadashi === 'lf.mio_refuse' &&
      c.guide.includes('lf.records:npc:lf_tadashi') && d.n === 0 && !d.asked.length && d.stage === 2,
      '5 the retry, read: her reading once, step 2, the retry gone, Tadashi next (his talk list and the guide); the scene again runs nothing ' + flat({ c, d }));
  }

  // 6. off Lanternfall: an outdoor map and an interior
  {
    const got = {};
    for (const map of ['lf.town', 'cr.nakayama', 'sg.office']) {
      fresh({ stage: 1, map });
      await retry({ choice: 0 });
      got[map] = { ok: !!C.maps[map], lines: fp(lines), walks: walks.length, lookroad: cues.filter((c) => c[1] === 'lookroad').length, stage: stage() };
    }
    fresh();
    await enter('lf.town');
    const first = { walks: walks.length, lookroad: cues.filter((c) => c[1] === 'lookroad').length };
    const off = ['cr.nakayama', 'sg.office'].map((m) => got[m]);
    t.ok(off.every((g) => g.ok && g.walks === 0 && g.lookroad === 0 && g.stage === 2 && g.lines === got['lf.town'].lines) && got['lf.town'].walks === 0 && got['lf.town'].lookroad === 0 &&
      first.walks === 2 && first.lookroad === 1,
      '6 off Lanternfall (outdoor and interior): the retry walks no one and turns no one towards the avenue\'s Records Hall, her lines as in Lanternfall; the first telling keeps both ' + flat({ got, first }));
  }

  // 7. the companion's topics
  {
    const K = RB.company;
    const res = {};
    for (const kind of ['none', 'waiting', 'deferred']) {
      fresh();
      if (kind !== 'none') { RB.bus.emit('map:enter', { id: s.map }); }
      if (kind === 'deferred') { const tk = s.company.talk; tk[tk._pending] = Object.assign({}, tk[tk._pending], { st: 'deferred' }); }
      const before = flat(s.company);
      await events({ cancel: ['lf.ch_recipe'] });
      await retry({ choice: 1 });
      await retry({ choice: 0, cancel: ['lf.ch_recipe'] });
      res[kind] = { same: flat(s.company) === before, pending: (s.company && s.company.talk && s.company.talk._pending) || null, stage: stage() };
    }
    // while the recipe waits: a due invitation is enrolled; after the bell (it is solved), a due reflection
    fresh({ stage: 1 });
    K.refresh(s);
    const inv = K.pending(s);
    fresh({ stage: 1, flags: { lf_bell_rung: true, lf_after_town: true } });
    K.refresh(s);
    const rf = K.pending(s);
    const w = { inv: inv && inv.id, rf: rf && rf.id, reflect: rf && rf.reflect, offered: !!offered() };
    t.ok(res.none.same && res.waiting.same && res.deferred.same && res.waiting.pending === 'inv.lf_word' && res.deferred.pending === 'inv.lf_word' && ['none', 'waiting', 'deferred'].every((k) => res[k].stage === 1) &&
      w.inv === 'inv.lf_word' && w.reflect === true && w.offered,
      '7 the first telling\'s cancel and the retries leave the talk records exactly as they were; while the recipe waits a due invitation, and after the bell a due reflection, is still enrolled ' + flat({ res, w }));
  }

  // 8. after the bell
  {
    fresh({ stage: 1, flags: { lf_bell_rung: true } });
    const ids = await enter('lf.town');
    const after = await events();
    const a = { ids, after, offered: !!offered() };
    await retry({ choice: 0 });
    const b = { reading: reading(), stage: stage(), offered: offered(), tadashi: talkOf('lf.records', 'lf_tadashi') };
    t.ok(a.ids[0] === 'lf.after_town' && !a.ids.includes('lf.mio_start') && !a.after.includes('lf.mio_start') && a.offered && flat(b.reading) === '[1,1,1,1]' && b.stage === 2 && b.offered === null && b.tadashi === 'lf.mio_refuse',
      '8 after the bell, the town\'s after-bell scene first on arrival: the recipe still offered, and read; Tadashi next ' + flat({ a, b }));
  }

  // 9. not offered
  {
    const cases = {};
    const check = async (k, o) => { fresh(o); const off = !!offered(); await run('lf.mio_start'); cases[k] = { off, n: lines.length, asked: asked.length }; };
    await check('nao', { comp: 'nao', stage: 1 });
    await check('alone', { comp: null, stage: 1 });
    await check('step2', { stage: 2 });
    await check('done', { stage: 'done', flags: { lf_mio_done: true } });
    await check('before', { stage: 'done', flags: { lf_mio_done: true, lf_bell_rung: true } });
    const ok = !cases.nao.off && !cases.alone.off && ['step2', 'done', 'before'].every((k) => !cases[k].off && cases[k].n === 0 && cases[k].asked === 0);
    t.ok(ok, '9 not offered with another companion, no companion, at step 2, done, or a finished save from before; the scene runs nothing for the last three ' + flat(cases));
  }

  // 10. cancelled twice, a save and load, then read; a stale result
  {
    fresh();
    let readN = 0;
    await enter('lf.town', { cancel: ['lf.ch_recipe'] }); readN += count(B.read);
    await retry({ choice: 0, cancel: ['lf.ch_recipe'] }); readN += count(B.read);
    loadSave(saved());
    const off = !!offered();
    await retry({ choice: 0 }); readN += count(B.read);
    const a = { off, readN, stage: stage() };
    fresh({ stage: 1, vars: { _res: 0 } });
    await retry({ choice: 0 });
    const b0 = stage();
    fresh({ stage: 1, vars: { _res: 1 } });
    await retry({ choice: 0, cancel: ['lf.ch_recipe'] });
    const b1 = { stage: stage(), read: said(B.read) };
    t.ok(a.off && a.readN === 1 && a.stage === 2 && b0 === 2 && b1.stage === 1 && !b1.read,
      '10 cancelled twice, a save and load, then read: everything once; a stale result of 0 before a reading, and of 1 before a cancel, changes nothing ' + flat({ a, b0, b1 }));
  }

  // 11. the first telling read at once, line for line as on the parent
  {
    fresh();
    await enter('lf.town');
    const a = { fp: fp(lines), stage: stage(), n: lines.length };
    t.ok(a.fp === FIRST_FP && a.stage === 2, '11 the first telling read at once, line for line as on the parent ' + flat(a));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
  RB.script.run = realRun;
};
// computed on the parent (1fc213d): the first telling's lines, read at once from the avenue's arrival
const FIRST_FP = '93fe2a51c208a228';
