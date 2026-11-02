// Sakutarō's rehearsal: "Come back later" is not his lines found (Local CL-641; Cloud CC-478; Agnes 6573166180). His
// rehearsal (mp.saku_rehearse) asks the matinée-line challenge and read no result, so cancelling it gave his closing
// lines, finished "The Missing Lead Actor" and moved him on, with no retry. Now the challenge is followed by
// `?(var._res=0) !end`. With synthetic campaigns only: the real scene runner (the dialogue stubbed), the challenge
// answered or cancelled by the test as the runner returns it (src/ui/65_challenge.js: a cancel returns
// { ok: false, cancelled: true } before its chal: flag is set; done, the flag is set), saves round-tripped through the
// save's own migration:
//  1. the scene: a guard straight after its challenge, and its one other end (a finished quest) as before;
//  2. a cancel: none of his closing lines, the quest at step 1 and not done, no journal line, no reward flag, no chal:
//     flag; he is still by the canal and his talk is the rehearsal again;
//  3. the retry straight away: his closing lines, the quest done, the reward, the journal line once; he moves on;
//  4. a cancel, a save and load, then the retry;
//  5. done before the Understage and after it: his line for each, as before;
//  6. the matinée line already done in Manbē's rehearsal, cancelled here: still nothing (the flag does not count);
//  7. the quest already done: the scene says nothing and asks nothing, and he is not by the canal, as before;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const CH = 'mp.rehearse_line';

  // ---- a minimal stage (as tests/unit/mp_rehearsal_cancel.test.mjs) -----------------------------------------------------
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
    st.id = 'mp-saku-test'; st.map = 'mp.playhouse'; st.comp = o.comp === undefined ? 'mio' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_sobe_met: true, mp_theatre_seen: true }, o.flags || {});
    st.quests.mp_main = { stage: 4, done: false, t: 1 };
    st.quests.mp_actor = o.done ? { stage: 1, done: true, t: 2 } : { stage: 1, done: false, t: 2 };
    st.vars = {};
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  // Sakutarō where the map's own conditions put him, and the scene his talk plays there
  const where = () => Object.keys(C.maps).filter((m) => (C.maps[m].npcs || []).some((n) => n.id === 'mp_saku' && (!n.if || S.test(s, n.if))));
  const sakuTalk = () => { const n = (C.maps['mp.playhouse'].npcs || []).find((x) => x.id === 'mp_saku' && (!x.if || S.test(s, x.if))); if (!n) return null; return typeof n.talk === 'string' ? n.talk : ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const BEFORE = /The part's name is still blank/, AFTER = /The part's name was back in the script already/, ON = /As Sakutarō, my own name/;
  const st = () => ({ stage: s.quests.mp_actor.stage, done: !!s.quests.mp_actor.done, reward: !!s.flags.mp_actor_done, journal: (s.journal || []).length, chal: !!s.flags['chal:' + CH], res: s.vars._res, where: where() });
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  // 1. the scene
  {
    const cmds = C.scenes['mp.saku_rehearse'].cmds;
    const i = cmds.findIndex((c) => c.op === 'challenge');
    const ends = cmds.filter((c) => c.op === 'end').map((c) => c.if);
    t.ok(cmds[i].args[0] === CH && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0' && flat(ends) === flat(['quest.mp_actor=done', 'var._res=0']),
      '1 his rehearsal: a guard straight after its challenge; its other end, a finished quest, as before ' + flat({ ch: cmds[i].args[0], ends }));
  }

  // 2 and 3. a cancel; the retry straight away
  {
    fresh();
    const talk = sakuTalk(), here = where();
    await run(talk, { cancel: [CH] });
    const a = st(), closing = [BEFORE, AFTER, ON].filter((re) => said(re)).length;
    t.ok(talk === 'mp.saku_rehearse' && flat(here) === flat(['mp.playhouse']) && flat(asked) === flat([CH]) && said(/From the afternoon show's lines/) && closing === 0 && a.stage === 1 && !a.done && !a.reward && a.journal === 0 && !a.chal && a.res === 0 && flat(a.where) === flat(['mp.playhouse']) && sakuTalk() === 'mp.saku_rehearse',
      '2 "Come back later": none of his closing lines, step 1 and not done, no journal or reward, no chal: flag; still by the canal, and his talk is the rehearsal again ' + flat({ talk, here, asked, closing, a }));
    await run(sakuTalk());
    const b = st();
    t.ok(said(BEFORE) && !said(AFTER) && said(ON) && b.done && b.reward && b.journal === 1 && s.journal[0].en === 'Sakutarō has decided to go on stage under his own name.' && b.chal && !b.where.includes('mp.playhouse') && b.where.length === 1,
      '3 the retry straight away: his closing lines, the quest done, the reward, the journal line once; he has moved on ' + flat(b));
  }

  // 4. a cancel, a save and load, then the retry
  {
    fresh();
    await run(sakuTalk(), { cancel: [CH] });
    loadSave(saved());
    const a = st(), talk = sakuTalk();
    await run(talk);
    const b = st();
    t.ok(a.stage === 1 && !a.done && talk === 'mp.saku_rehearse' && b.done && b.reward && b.journal === 1 && said(ON),
      '4 a cancel, a save and load: still step 1, and the retry finishes it ' + flat({ a, talk, b }));
  }

  // 5. done before the Understage and after it
  for (const under of [false, true]) {
    fresh({ flags: under ? { mp_under_done: true } : {} });
    await run(sakuTalk());
    const a = st();
    t.ok((under ? said(AFTER) && !said(BEFORE) : said(BEFORE) && !said(AFTER)) && said(ON) && a.done && a.reward && a.journal === 1,
      '5 done ' + (under ? 'after' : 'before') + ' the Understage: his line for it, the quest done, as before ' + flat(a));
  }

  // 6. the matinée line already done in Manbē's rehearsal, cancelled here
  {
    fresh({ flags: { mp_rehearsal_done: true, 'chal:mp.rehearse_line': true } });
    await run(sakuTalk(), { cancel: [CH] });
    const a = st();
    t.ok(![BEFORE, AFTER, ON].some((re) => said(re)) && !a.done && !a.reward && a.journal === 0 && a.res === 0 && sakuTalk() === 'mp.saku_rehearse',
      '6 the matinée line already done for Manbē, cancelled here: still nothing, and he asks again ' + flat(a));
  }

  // 7. the quest already done
  {
    fresh({ done: true, flags: { mp_actor_done: true } });
    const here = where(), talk = sakuTalk();
    await run('mp.saku_rehearse');
    t.ok(!lines.length && !asked.length && talk === null && !here.includes('mp.playhouse') && here.length === 1,
      '7 the quest already done: the scene says and asks nothing, and he is not by the canal, as before ' + flat({ here, talk, n: lines.length }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
