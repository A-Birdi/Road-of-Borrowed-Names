// Genta's comic: "Come back later" is not a bit performed (Agnes 6572919095; Local CL-642; Cloud CC-479). The comic on
// Playhouse Row (mp.manzai) asks three challenges and read none of their results, so cancelling all three gave the
// audience's laughter, the praise, "An unexpected talent", mp_manzai_done and, with Suzu, mp_ev_suzu_act. Now each
// challenge is followed by `?(var._res=0) !end`. With synthetic campaigns only: the real scene runner (the dialogue
// stubbed), the challenges answered or cancelled by the test as the runner returns them (src/ui/65_challenge.js: a
// cancel returns { ok: false, cancelled: true } before its chal: flag is set; done, the flag is set), saves
// round-tripped through the save's own migration:
//  1. the scene: a guard straight after each of its three challenges, and nowhere else;
//  2. with Mio (Genta's own act) and with Suzu (her act), a cancel at each challenge on its own: no laughter after it,
//     no next joke, no praise, mp_manzai_done unset (and mp_ev_suzu_act with Suzu), only the bits done before it
//     flagged; then Genta's talk offers the comic again, and all three done give the whole ending once;
//  3. a cancel, a save and load, then the retry;
//  4. all three done the first time: as before, by both routes;
//  5. after the chapter (mb2_done), Genta's after-talk, whether the comic was done or not, as before;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const CH = ['mp.manzai_1', 'mp.manzai_2', 'mp.manzai_3'];

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
    st.id = 'mp-comic-test'; st.map = 'mp.playhouse'; st.comp = o.comp === undefined ? 'mio' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_sobe_met: true, mp_theatre_seen: true }, o.flags || {});
    st.quests.mp_main = { stage: 4, done: false, t: 1 };
    st.vars = {};
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const gentaTalk = () => { const n = (C.maps['mp.playhouse'].npcs || []).find((x) => x.id === 'mp_genta' && (!x.if || S.test(s, x.if))); if (!n) return null; return typeof n.talk === 'string' ? n.talk : ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const BEATS = { joke1: /I brought three umbrellas/, giggles: /A ripple of giggles/, joke2: /I go for a run every morning/, child: /A child in the front row/, joke3: /crossed the chopsticks/, roars: /The house roars/, genta: /Great straight work/, suzu: /Thank you, partner/, talent: /An unexpected talent/ };
  const heard = () => Object.keys(BEATS).filter((k) => said(BEATS[k]));
  const st = () => ({ done: !!s.flags.mp_manzai_done, suzuAct: !!s.flags.mp_ev_suzu_act, chal: CH.filter((c) => s.flags['chal:' + c]), res: s.vars._res });
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));
  const ALL = { mio: ['joke1', 'giggles', 'joke2', 'child', 'joke3', 'roars', 'genta', 'talent'], suzu: ['joke1', 'giggles', 'joke2', 'child', 'joke3', 'roars', 'suzu'] };
  const UPTO = [['joke1'], ['joke1', 'giggles', 'joke2'], ['joke1', 'giggles', 'joke2', 'child', 'joke3']];

  // 1. the scene
  {
    const cmds = C.scenes['mp.manzai'].cmds;
    const at = cmds.map((c, i) => (c.op === 'challenge' ? i : -1)).filter((i) => i >= 0);
    const guarded = at.map((i) => cmds[i + 1] && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0');
    const ends = cmds.filter((c) => c.op === 'end').length;
    t.ok(at.length === 3 && at.map((i) => cmds[i].args[0]).join() === CH.join() && guarded.every(Boolean) && ends === 3,
      '1 the comic: a guard straight after each of its three challenges, and no other end ' + flat({ ch: at.map((i) => cmds[i].args[0]), guarded, ends }));
  }

  // 2. a cancel at each challenge on its own, by both routes; then the retry
  for (const comp of ['mio', 'suzu']) {
    const route = comp === 'suzu' ? 'mp.genta' : 'mp.genta_act';
    for (let k = 0; k < 3; k++) {
      fresh({ comp });
      const talk = gentaTalk();
      await run(talk, { cancel: [CH[k]] });
      const a = st(), h = heard();
      t.ok(talk === route && flat(asked) === flat(CH.slice(0, k + 1)) && flat(h) === flat(UPTO[k]) && !a.done && !a.suzuAct && a.res === 0 && flat(a.chal) === flat(CH.slice(0, k)) && gentaTalk() === route,
        '2 ' + comp + ', "Come back later" at bit ' + (k + 1) + ': no laughter after it, no next joke, no praise, not done' + (comp === 'suzu' ? ' (nor her act)' : '') + ', only the bits before it flagged; Genta\'s talk offers it again ' + flat({ talk, asked, h, a }));
      await run(gentaTalk());
      const b = st(), h2 = heard();
      t.ok(flat(asked) === flat(CH) && ALL[comp].every((x) => h2.includes(x)) && b.done && b.suzuAct === (comp === 'suzu') && b.chal.length === 3,
        '2 ' + comp + ', then the retry: the comic from the first bit, all three done, the whole ending once ' + flat({ asked, h2, b }));
    }
  }

  // 3. a cancel, a save and load, then the retry
  {
    fresh({ comp: 'suzu' });
    await run(gentaTalk(), { cancel: [CH[2]] });
    loadSave(saved());
    const a = st(), talk = gentaTalk();
    await run(talk);
    const b = st();
    t.ok(!a.done && !a.suzuAct && talk === 'mp.genta' && b.done && b.suzuAct && said(BEATS.suzu),
      '3 Suzu, the last bit cancelled, a save and load: not done, and the retry finishes it ' + flat({ a, talk, b }));
  }

  // 4. all three done the first time, by both routes
  for (const comp of ['mio', 'suzu']) {
    fresh({ comp });
    await run(gentaTalk());
    const a = st(), h = heard();
    t.ok(flat(h) === flat(ALL[comp]) && a.done && a.suzuAct === (comp === 'suzu') && a.chal.length === 3 && gentaTalk() === (comp === 'suzu' ? 'mp.genta' : 'mp.genta_act'),
      '4 all three done the first time (' + comp + '): the ending as before ' + flat({ h, a }));
  }

  // 5. after the chapter
  for (const done of [false, true]) {
    fresh({ flags: Object.assign({ mb2_done: true }, done ? { mp_manzai_done: true } : {}) });
    t.eq(gentaTalk(), 'mp.genta_after', '5 after the chapter, the comic ' + (done ? 'done' : 'never done') + ': Genta\'s after-talk, as before');
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
