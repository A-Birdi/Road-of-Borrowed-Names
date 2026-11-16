// Sanpei and the Ghostwriter: after the ending, his testimony comes before the broadsheet (QA-208; Cloud CC-610;
// Agnes 6913897483; Local CL-848). Two files add to Sanpei's talk list in the pressroom: the Ghostwriter's testimony
// (src/content/mp/24_scenes_side.js, while "A Ghostwriter's Debt" is at step 1 and he has not given it) and the
// broadsheet's last editions (src/content/returns/30_towns.js, after the ending). The second put itself at the front,
// so after the ending the broadsheet always came first and the testimony, which Ryusui's meeting needs, could not be
// heard. Now the broadsheet goes straight after the testimony entry (at the front if there is none); no gate, no new
// text. With synthetic campaigns only: Sanpei's talk resolved by the game's own resolver (RB.town.talkOption) and played
// by the real scene runner (the dialogue stubbed, the headline challenge answered); saves round-tripped through the
// save's own migration:
//  1. the list: testimony, broadsheet, then his two older entries, in that order;
//  2. after the ending, the quest at step 1, no testimony yet: the testimony first, then the broadsheet;
//  3. a reload in between, at either point: the same order;
//  4. the broadsheet again after later deeds: no once-only gate, and each edition reports what is true now;
//  5. Ryusui's meeting: reachable with the testimony and the manuscript, the manuscript either seeded (synthetic) or
//     obtained by playing Shinobu's manuscript scene; not before the testimony; the quest guide's step names Sanpei
//     before the testimony;
//  6. after the ending without the quest, with the quest done, or with the testimony already given: the broadsheet
//     first, as before;
//  7. before the ending: the testimony while the quest asks for it, and otherwise his older talk, as before;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);

  // ---- a minimal stage (as tests/unit/mp_saku_cancel.test.mjs) ------------------------------------------------------------
  let lines = [], asked = [];
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
  RB.audio.playSong = () => {};
  RB.challenge.run = async (id) => { asked.push(id); RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  // Ryusui's meeting itself is long (it ends the quest): while his talk is played, an empty stand-in takes its place, so
  // only whether his talk reaches it is checked (the quest guide, which reads the real scene, is asked without it)
  const MEET = C.scenes['mp.ryusui_meet'], STAND_IN = { id: 'mp.ryusui_meet', cmds: [], labels: {} };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const BASE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mp_sobe_met', 'mp_theatre_seen'];
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'sanpei-order-test'; st.map = 'mp.pressroom'; st.x = 5; st.y = 6; st.comp = 'mio';
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    for (const f of BASE) st.flags[f] = true;
    if (o.post) Object.assign(st.flags, { postgame: true, mb2_done: true });
    if (o.mb2) st.flags.mb2_done = true;
    Object.assign(st.flags, o.flags || {});
    if (o.ghost != null) st.quests.mp_ghost = o.ghost === 'done' ? { stage: 1, done: true, t: 2 } : { stage: o.ghost, done: false, t: 2 };
    if (o.ghost != null && o.ghost !== 0) st.flags.mp_ghost_heard = true;
    if (o.manuscript) S.give(st, 'mp_manuscript', 1);
    st.vars = {};
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  // the runner's console is the whole process's (tests/lib/load.mjs gives each file Node's own): put it back whatever
  // happens, so a later test's scene errors still print (CL-860, Agnes 6921074159)
  try {
    const run = async (id) => { lines = []; asked = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
    const saveLoad = () => use(RB.save.migrate(JSON.parse(JSON.stringify(s))));
    const sanpeiDef = (C.maps['mp.pressroom'].npcs || []).find((n) => n.id === 'mp_sanpei');
    const next = () => { const o = RB.town.talkOption(s, sanpeiDef); return o ? o.scene : null; };
    const talk = async () => { const sc = next(); await run(sc); return sc; };
    const ryusuiDef = Object.values(C.maps).flatMap((m) => m.npcs || []).find((n) => n.id === 'mp_ryusui');
    const said = (re) => lines.some((l) => re.test(l.en));
    const TESTIMONY = /Shinobu always brings them/;
    const EDITIONS = { fest: 'as_fest_done', library: 'end_archive_library' };

    // 1. the list
    {
      const order = sanpeiDef.talk.map((x) => x.scene);
      t.ok(flat(order) === flat(['mp.ghost_sanpei', 'rt.sanpei_last', 'mp.sanpei_after', 'mp.sanpei_press']), '1 Sanpei\'s talk list: the testimony, the broadsheet, then his older talk ' + flat(order));
    }

    // 2 and 3. after the ending, the quest at step 1: the testimony, then the broadsheet; a reload at either point
    for (const reload of ['none', 'before', 'between']) {
      fresh({ post: true, ghost: 1 });
      if (reload === 'before') saveLoad();
      const a = await talk();
      const heardIt = s.flags.mp_ghost_sanpei && said(TESTIMONY) && (s.journal || []).length === 1;
      if (reload === 'between') saveLoad();
      const b = await talk();
      t.ok(a === 'mp.ghost_sanpei' && heardIt && b === 'rt.sanpei_last' && flat(asked) === flat(['rt.headline']),
        (reload === 'none' ? '2' : '3') + ' after the ending, the quest at step 1' + (reload === 'none' ? '' : ', a reload ' + reload + ' the testimony') + ': the testimony first, then the broadsheet ' + flat({ a, b, asked }));
    }

    // 4. the broadsheet again after later deeds
    {
      fresh({ post: true, ghost: 1 });
      await talk(); await talk();
      const first = lines.map((l) => l.en);
      s.flags[EDITIONS.fest] = true; s.flags[EDITIONS.library] = true;
      const sc = await talk();
      const again = lines.map((l) => l.en);
      t.ok(sc === 'rt.sanpei_last' && again.length === first.length + 2 && flat(asked) === flat(['rt.headline']), '4 the broadsheet again after the festival and the library: no once-only gate, two more headlines ' + flat({ sc, first: first.length, again: again.length }));
    }

    // 5. Ryusui's meeting
    const meet = async () => {
      const o = RB.town.talkOption(s, ryusuiDef);
      s.seen['mp.ryusui_meet'] = false;
      C.scenes['mp.ryusui_meet'] = STAND_IN;
      try { await run(o.scene); } finally { C.scenes['mp.ryusui_meet'] = MEET; }
      return { scene: o.scene, met: !!s.seen['mp.ryusui_meet'] };
    };
    {
      fresh({ post: true, ghost: 1, manuscript: true });
      const before = await meet();
      t.ok(before.scene === 'mp.ryusui' && !before.met, '5 seeded manuscript, before the testimony: Ryusui does not meet you ' + flat(before));
      await talk();
      const after = await meet();
      t.ok(after.met, '5 seeded manuscript (synthetic), after the testimony: his talk reaches the meeting ' + flat(after));
    }
    {
      fresh({ post: true, ghost: 1 });
      const map = Object.keys(C.maps).find((m) => (C.maps[m].props || []).some((p) => p.scene === 'mp.manuscripts'));
      await run('mp.manuscripts');
      const got = (s.inv.mp_manuscript || 0) === 1 && flat(asked) === flat(['mp.ghost_date']);
      await talk();
      const after = await meet();
      t.ok(got && s.flags.mp_ghost_sanpei && after.met, '5 manuscript obtained by playing Shinobu\'s manuscript scene (' + map + '), then the testimony: his talk reaches the meeting ' + flat({ got, after }));
    }
    {
      fresh({ post: true, ghost: 1 });
      RB.questGuide.reset();
      const r = RB.questGuide.targets('mp_ghost', s);
      const names = (r.targets || []).map((x) => x.id || x.p || x.kind);
      const next = RB.questGuide.nextLines(r).map((l) => l.en).join(' | ');
      t.ok(names.includes('mp_sanpei') && /Sanpei, in The Press Room/.test(next), '5 the quest guide\'s step after the ending, before the testimony: Sanpei among its targets, and named ' + flat({ how: r.how, names, next }));
    }

    // 6. after the ending: the broadsheet first, as before
    for (const [label, o] of [['without the quest', {}], ['the quest done', { ghost: 'done' }], ['the testimony already given', { ghost: 1, flags: { mp_ghost_sanpei: true } }]]) {
      fresh(Object.assign({ post: true }, o));
      t.ok(next() === 'rt.sanpei_last', '6 after the ending, ' + label + ': the broadsheet first ' + next());
    }

    // 7. before the ending, as before
    for (const [label, o, want] of [['the quest at step 1', { ghost: 1 }, 'mp.ghost_sanpei'], ['no quest, before Manybridge II ends', {}, 'mp.sanpei_press'], ['no quest, after it', { mb2: true }, 'mp.sanpei_after']]) {
      fresh(o);
      t.ok(next() === want, '7 before the ending, ' + label + ': ' + want + ' (' + next() + ')');
    }

    t.ok(!errors.length, 'no scene ended on an error ' + errors.slice(0, 3).join(' | '));
  } finally {
    console.error = cerr;
  }
};
