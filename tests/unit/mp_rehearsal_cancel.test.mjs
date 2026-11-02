// Manbē's rehearsal: "Come back later" is not a finished rehearsal (Agnes 6572551337; Local CL-640; Cloud CC-477). The
// rehearsal on Playhouse Row (mp.rehearsal) asks three challenges and read none of their results, so cancelling all
// three gave Manbē's praise, the actors in their places, mp_rehearsal_done, mp_fest_heard and step 4. Now each challenge
// is followed by `?(var._res=0) !end`. With synthetic campaigns only: the real scene runner (the dialogue stubbed), the
// challenges answered or cancelled by the test as the runner returns them (src/ui/65_challenge.js: a cancel returns
// { ok: false, cancelled: true } before its chal: flag is set; done, the flag is set), saves round-tripped through the
// save's own migration:
//  1. the scene: a guard straight after each of its three challenges, and nowhere else;
//  2. a cancel at each challenge on its own: no praise after it and no next task, none of the ending, no flags, no
//     journal line, step 3 kept, and no chal: flag for the cancelled challenge (only those done before it);
//  3. then Manbē's talk starts it again from the blocking, and all three done gives the whole ending once;
//  4. a cancel, a save and load, then the retry; a cancel in his first meeting (step 2), then the retry at step 3;
//  5. all three done the first time: as before, with Suzu and without;
//  6. a challenge done before elsewhere (Sakutarō's shares the matinée line) does not let a cancel through;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const CH = ['mp.rehearse_block', 'mp.rehearse_line', 'mp.rehearse_book'];

  // ---- a minimal stage (as tests/unit/nao_relay.test.mjs) --------------------------------------------------------------
  let lines = [], cancel = new Set(), asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
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
  if (RB.staging) RB.staging.walkTo = async () => {};
  // the runner's two outcomes (src/ui/65_challenge.js 794–801): cancelled before the flag; done, the flag set
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'mp-rehearsal-test'; st.map = 'mp.playhouse'; st.comp = o.comp === undefined ? 'ren' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_arrived: true, mp_sobe_met: true, mp_theatre_seen: true }, o.flags || {});
    st.quests.mp_main = { stage: o.stage || 3, done: false, t: 1 };
    st.vars = {};
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const manbeTalk = () => { const n = (C.maps['mp.playhouse'].npcs || []).find((x) => x.id === 'mp_manbe' && (!x.if || S.test(s, x.if))); return n ? ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const BEATS = { praise1: /Yes, now we can see it/, task3: /Last, the prompt-book/, places: /One by one the actors find their places/, moves: /The play moves again/, tomi: /help Tomi of the committee/, suzu: /A name pencilled in/ };
  const heard = () => Object.keys(BEATS).filter((k) => said(BEATS[k]));
  const st = () => ({ stage: s.quests.mp_main.stage, done: !!s.flags.mp_rehearsal_done, fest: !!s.flags.mp_fest_heard, journal: (s.journal || []).length, chal: CH.filter((c) => s.flags['chal:' + c]), res: s.vars._res });
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  // 1. the scene
  {
    const cmds = C.scenes['mp.rehearsal'].cmds;
    const at = cmds.map((c, i) => (c.op === 'challenge' ? i : -1)).filter((i) => i >= 0);
    const guarded = at.map((i) => cmds[i + 1] && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0');
    const ends = cmds.filter((c) => c.op === 'end').length;
    t.ok(at.length === 3 && at.map((i) => cmds[i].args[0]).join() === CH.join() && guarded.every(Boolean) && ends === 3,
      '1 the rehearsal: a guard straight after each of its three challenges, and no other end ' + flat({ ch: at.map((i) => cmds[i].args[0]), guarded, ends }));
  }

  // 2 and 3. a cancel at each challenge on its own; then the retry from the blocking
  const before = { 0: [], 1: ['praise1'], 2: ['praise1', 'task3'] };
  for (let k = 0; k < 3; k++) {
    fresh();
    const talk = manbeTalk();
    await run(talk, { cancel: [CH[k]] });
    const a = st(), h = heard(), q = asked.slice();
    t.ok(talk === 'mp.manbe_rehearse' && flat(q) === flat(CH.slice(0, k + 1)) && flat(h) === flat(before[k]) && a.stage === 3 && !a.done && !a.fest && a.journal === 0 && a.res === 0 && flat(a.chal) === flat(CH.slice(0, k)),
      '2 "Come back later" at challenge ' + (k + 1) + ' (' + CH[k] + '): no praise after it, no next task, none of the ending, step 3, no flags or journal, only the challenges done before it flagged ' + flat({ talk, q, h, a }));
    const again = manbeTalk();
    await run(again);
    const b = st(), h2 = heard();
    t.ok(again === 'mp.manbe_rehearse' && flat(asked) === flat(CH) && ['praise1', 'task3', 'places', 'moves', 'tomi'].every((x) => h2.includes(x)) && b.stage === 4 && b.done && b.fest && b.journal === 1 && b.chal.length === 3,
      '3 then Manbē\'s talk starts it again from the blocking, and all three done: the whole ending once ' + flat({ again, asked, h2, b }));
  }

  // 4. a cancel, a save and load, then the retry; a cancel in his first meeting, then the retry at step 3
  {
    fresh();
    await run(manbeTalk(), { cancel: [CH[1]] });
    loadSave(saved());
    const a = st(), talk = manbeTalk();
    await run(talk);
    const b = st();
    t.ok(a.stage === 3 && !a.done && talk === 'mp.manbe_rehearse' && b.stage === 4 && b.done && b.journal === 1 && said(BEATS.moves),
      '4 a cancel at the matinée line, a save and load: still step 3, and the retry finishes it ' + flat({ a, talk, b }));
  }
  {
    fresh({ stage: 2 });
    const first = manbeTalk();
    await run(first, { cancel: [CH[0]] });
    const a = st(), meet = said(/I'm Manbē, the manager here/);
    const talk = manbeTalk();
    await run(talk);
    const b = st();
    t.ok(first === 'mp.manbe_first' && meet && a.stage === 3 && !a.done && !a.fest && talk === 'mp.manbe_rehearse' && b.stage === 4 && b.done && b.journal === 1,
      '4 his first meeting (step 2), the blocking cancelled: he has introduced himself and it is step 3, not done; his next talk is the rehearsal again, and it finishes ' + flat({ first, a, talk, b }));
  }

  // 5. all three done the first time: as before, with Suzu and without
  for (const comp of ['ren', 'suzu']) {
    fresh({ comp });
    await run(manbeTalk());
    const a = st(), h = heard();
    const want = ['praise1', 'task3', 'places', 'moves', 'tomi'].concat(comp === 'suzu' ? ['suzu'] : []);
    t.ok(flat(h) === flat(want) && a.stage === 4 && a.done && a.fest && a.journal === 1 && a.chal.length === 3 && s.journal[0].en === 'The rehearsal went well. Now help Tomi of the festival committee.',
      '5 all three done the first time (' + comp + '): the ending as before ' + flat({ h, a }));
  }
  {
    fresh({ comp: 'suzu' });
    await run(manbeTalk(), { cancel: [CH[2]] });
    t.ok(!said(BEATS.suzu) && !said(BEATS.moves) && !s.flags.mp_rehearsal_done, '5 with Suzu, the prompt-book cancelled: not her line about pencilled names either ' + flat(heard()));
  }

  // 6. a challenge done before elsewhere does not let a cancel through
  {
    fresh({ flags: { 'chal:mp.rehearse_line': true } });
    await run(manbeTalk(), { cancel: [CH[1]] });
    const a = st();
    t.ok(!said(BEATS.task3) && !a.done && a.stage === 3 && a.res === 0, '6 the matinée line already done for Sakutarō, cancelled here: the rehearsal still stops there ' + flat({ h: heard(), a }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
