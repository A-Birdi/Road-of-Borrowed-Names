// Suzu's first words: "Come back later" is not the truth told (QA-186; Cloud CC-610; Agnes 6913897483; Local CL-848).
// co.suzu_truth asks the first-line challenge (co.c_suzu) and read no result, so cancelling it played Hiro's answer, took
// the globe, finished "A Seat Kept Until Spring", autosaved and, with the Kiln page already with Tokiwa, called the
// assembly. Now the challenge is followed by `?(var._res=0) !end`, and nothing else changes. With synthetic campaigns
// only: the real scene runner (the dialogue stubbed), the challenge answered or cancelled by the test as the runner
// returns it (src/ui/65_challenge.js: a cancel returns { ok: false, cancelled: true }), saves round-tripped through the
// save's own migration. The assembly itself draws pictures, which need a page: here it is replaced by an empty stand-in,
// so only whether it is reached is checked (the browser test, tests/e2e/co_suzu_cancel.mjs, plays it).
//  1. the scene: a guard straight after its challenge; its two other ends as before;
//  2. the workshop route (Suzu waiting there, Nao with you, the globe carried): a cancel gives the first telling and her
//     request only: no Hiro line, the globe kept, no co_suzu_done, the quest at step 3 and not done, no autosave, no
//     decision record; the first telling's flag and its ledger note stay (they come before the challenge); the scene
//     is marked seen, as any scene that ends early is; both routes still lead back to it;
//  3. the retry straight away: her request without the first telling, then the whole ending, once;
//  4. a second cancel, then a save and load, then the retry through Hiro's talk (the other route);
//  5. Hiro's route with Suzu as companion and the Kiln page with Tokiwa: a cancel reaches no assembly; a save and load;
//     the retry reaches the assembly once;
//  6. a success with no cancel first, on each route: its fingerprint (every line spoken and the state it leaves) is
//     printed, to be compared with the same test on the parent's tree;
//  the music the scene asks for is recorded; no scene ended on an error from the runner.
import { createHash } from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const CH = 'co.c_suzu', SC = 'co.suzu_truth';

  // ---- a minimal stage (as tests/unit/mp_saku_cancel.test.mjs) ------------------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], saves = 0, songs = [];
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
  RB.save.autosave = async () => { saves++; };
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.audio.playSong = (id) => { songs.push(id); };
  RB.audio.stopSong = () => { songs.push('-'); };
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  // the assembly: an empty stand-in (see above); `!call` marks it seen when it is reached
  C.scenes['co.assembly'] = { id: 'co.assembly', cmds: [], labels: {} };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'co-suzu-test'; st.map = 'co.glass'; st.comp = o.comp || 'nao';
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, co_chronicle_read: true, co_kiln_done: true }, o.page ? { co_tokiwa_page: true } : {});
    st.quests.co_main = { stage: 7, done: false, t: 1 };
    st.quests.co_suzu = { stage: 3, done: false, t: 2 };
    if (o.globe) S.give(st, 'co_globe', 1);
    st.vars = {};
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; songs = []; saves = 0; cancel = new Set(o.cancel ? [CH] : []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const saveLoad = () => use(RB.save.migrate(JSON.parse(JSON.stringify(s))));
  // the two routes back: Suzu in the workshop (a companion elsewhere), and Hiro's talk while the quest is at step 3
  const workshop = () => { const n = (C.maps['co.glass'].npcs || []).find((x) => x.id === 'suzu' && (!x.if || S.test(s, x.if))); return n ? n.talk : null; };
  const hiroTruth = () => S.test(s, 'quest.co_suzu=3&!co_suzu_done');
  const said = (re) => lines.some((l) => re.test(l.en));
  const BRIEF = /That boy is Hiro/, REQUEST = /help me with one thing\. The first line/, FURNACE = /The furnace hums low/;
  const st = () => ({
    done: !!s.flags.co_suzu_done, q: s.quests.co_suzu.stage, qdone: !!s.quests.co_suzu.done, globe: (s.inv.co_globe || 0), handed: !!s.flags.co_hiro_globe,
    told: !!s.flags.co_suzu_told, ledger: s.notebook.filter((n) => n.id === 'co_suzu_ledger').length, record: !!(s.company && s.company.talk && s.company.talk['d.suzu_truth']),
    assembly: !!s.seen['co.assembly'], seen: !!s.seen[SC], autosaves: saves, hiro: lines.filter((l) => l.who === 'hiro').length,
  });
  const nothing = (x) => !x.done && x.q === 3 && !x.qdone && !x.handed && x.autosaves === 0 && !x.record && !x.assembly && x.hiro === 0;
  const fp = (st0) => createHash('sha256').update(flat({ lines: lines.map((l) => [l.who, l.jp, l.en]), asked, songs, st: st0 })).digest('hex').slice(0, 16);

  // 1. the scene
  {
    const cmds = C.scenes[SC].cmds;
    const i = cmds.findIndex((c) => c.op === 'challenge');
    const ends = cmds.filter((c) => c.op === 'end').map((c) => c.if);
    t.ok(cmds[i].args[0] === CH && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0' && flat(ends) === flat(['var._res=0', null, null]),
      '1 the scene: a guard straight after its challenge; its two other ends (the plain ending, and after the assembly) as before ' + flat({ ch: cmds[i].args[0], ends }));
  }

  // 2 and 3. the workshop route: a cancel; the retry straight away
  {
    fresh({ comp: 'nao', globe: true });
    await run(SC, { cancel: true });
    const a = st();
    t.ok(said(BRIEF) && said(REQUEST) && !said(FURNACE) && lines.length === 3 && flat(asked) === flat([CH]) && nothing(a) && a.globe === 1,
      '2 workshop route, a cancel: the first telling and her request only; no Hiro line, the globe kept, not done, no autosave, no record ' + flat({ n: lines.length, asked, a }));
    t.ok(a.told && a.ledger === 1 && a.seen, '2 the first telling\'s flag and its ledger note stay; the scene is marked seen, as any scene that ends early is ' + flat(a));
    t.ok(workshop() === SC && hiroTruth(), '2 both routes still lead back to it: Suzu in the workshop, and Hiro\'s talk');
    t.ok(flat(songs) === flat(['companion_suzu']), '2 the music asked for: her theme only, and nothing after the cancel ' + flat(songs));
    await run(SC);
    const b = st();
    t.ok(!said(BRIEF) && lines[0] && REQUEST.test(lines[0].en) && said(FURNACE) && flat(asked) === flat([CH]) && b.done && b.qdone && b.handed && b.globe === 0 && b.autosaves === 1 && b.record && !b.assembly && b.hiro > 0 && b.ledger === 1,
      '3 the retry straight away: her request without the first telling, then the whole ending once (the globe handed over, done, one autosave, the record) ' + flat({ n: lines.length, asked, b }));
    t.ok(workshop() === null && !hiroTruth(), '3 after it: Suzu no longer waits in the workshop, and Hiro\'s talk no longer leads to it');
  }

  // 4. a second cancel; a save and load; the retry through Hiro's talk
  {
    fresh({ comp: 'nao', globe: true });
    await run(SC, { cancel: true });
    await run(SC, { cancel: true });
    const a = st();
    t.ok(!said(BRIEF) && lines.length === 1 && REQUEST.test(lines[0].en) && nothing(a) && a.globe === 1 && a.ledger === 1,
      '4 a second cancel: her request only, still nothing ' + flat({ n: lines.length, a }));
    saveLoad();
    t.ok(workshop() === SC && hiroTruth() && nothing(Object.assign(st(), { autosaves: 0 })) && (s.inv.co_globe || 0) === 1, '4 saved and loaded: both routes still lead back to it, and still nothing');
    await run('co.hiro');
    const b = st();
    t.ok(!said(BRIEF) && lines[0] && REQUEST.test(lines[0].en) && b.done && b.qdone && b.handed && b.globe === 0 && b.autosaves === 1 && !b.assembly,
      '4 the retry through Hiro\'s talk: her request, then the whole ending once ' + flat({ n: lines.length, b }));
  }

  // 5. Hiro's route, Suzu as companion, the Kiln page with Tokiwa
  {
    fresh({ comp: 'suzu', page: true });
    await run('co.hiro', { cancel: true });
    const a = st();
    t.ok(said(BRIEF) && said(REQUEST) && !said(FURNACE) && lines.length === 3 && nothing(a) && !a.assembly,
      '5 Hiro\'s route with Suzu, the Kiln page with Tokiwa, a cancel: the first telling and her request only, no assembly ' + flat({ n: lines.length, a }));
    t.ok(workshop() === null && hiroTruth(), '5 the way back with Suzu as companion is Hiro\'s talk (she is not also waiting in the workshop)');
    saveLoad();
    await run('co.hiro');
    const b = st();
    t.ok(!said(BRIEF) && lines[0] && REQUEST.test(lines[0].en) && b.done && b.qdone && b.autosaves === 1 && b.assembly && !b.handed,
      '5 saved and loaded, the retry: her request, the ending, and the assembly reached once ' + flat({ n: lines.length, b }));
  }

  // 6. a success with no cancel first: its fingerprint, for the parent's tree
  for (const o of [{ comp: 'nao', globe: true, via: SC }, { comp: 'mio', via: SC, page: true }, { comp: 'suzu', via: 'co.hiro', page: true }, { comp: 'ren', via: 'co.hiro', globe: true }]) {
    fresh(o);
    await run(o.via);
    const x = st();
    const label = '6 a success, ' + o.comp + ' by ' + o.via + (o.page ? ', the page with Tokiwa' : '') + (o.globe ? ', the globe' : '') + ': fp=' + fp(x) + ' lines=' + lines.length + ' ' + flat({ asked, songs });
    t.ok(said(BRIEF) && said(REQUEST) && said(FURNACE) && x.done && x.qdone && x.autosaves === 1 && x.assembly === !!o.page && x.handed === !!o.globe, label);
    t.log(label);
  }

  t.ok(!errors.length, 'no scene ended on an error ' + errors.slice(0, 3).join(' | '));
};
