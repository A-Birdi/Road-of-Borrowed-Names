// Quest guidance (src/engine/56_questguide.js): where the next step of each
// quest happens.
// - Every stage of every quest in the game has a derived place (static
//   analysis: conditions not about the quest itself count as unknown), an
//   authored `at`, is marked intentionally open (`at: 'open'`), or is a
//   stage that is set and passed within one scene. The whole list is
//   printed with QG_LIST=1.
// - Live analysis on real states: the people who can help now (and only
//   they), what a blocked step is waiting for, places you cannot reach yet
//   not preferred, a quest that waits on the journey.
// - The words: every generated nudge and "Next:" line is valid markup with
//   furigana on every kanji, uses words the lexicon knows, and has English.
// - Following: the main road by default, a chosen quest, unfollow; old
//   saves (no `follow`) load and default sensibly; the save schema and its
//   validation are unchanged; the setting defaults to markers and hints.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide;
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p || (e.x != null ? e.x + ',' + e.y : ''));
  const whereXY = (e) => where(e) + (e.kind === 'prop' ? '@' + e.x + ',' + e.y : '');
  const list = !!process.env.QG_LIST;

  // ---- 1. every stage of every quest ---------------------------------------------------------
  let withTarget = 0, open = 0, passing = 0, authored = 0, missing = [];
  const staticOf = {};
  for (const qid in C.quests) {
    C.quests[qid].stages.forEach((stg, k) => {
      const st = RB.state.newCampaign();
      st.quests[qid] = { stage: k, done: false, t: 1 };
      const r = G.analyse(qid, st, { static: true, derive: !stg.at });
      const auth = stg.at ? G.analyse(qid, st) : null;
      const key = qid + '[' + k + ']';
      staticOf[key] = r.targets.map(where);
      let tag;
      if (stg.at === 'open') { open++; tag = 'open'; }
      else if (stg.at) { authored++; tag = 'authored ' + auth.targets.map(where).join(', '); t.ok(auth.targets.length > 0, key + ': authored at names a place'); }
      else if (r.targets.length) { withTarget++; tag = r.targets.map(where).join(', '); }
      else if (G.passing(qid, k)) { passing++; tag = 'passes within one scene'; }
      else { missing.push(key); tag = 'MISSING'; }
      if (list) t.log(key.padEnd(18) + ' ' + tag + '  | ' + stg.en.slice(0, 60));
    });
  }
  t.log('quest stages: ' + withTarget + ' derived, ' + authored + ' authored, ' + open + ' open, ' + passing + ' pass within one scene, ' + missing.length + ' missing');
  t.eq(missing, [], 'every quest stage has a place for its next step (or is marked open)');

  // representative static targets, one or more per chapter
  const has = (key, w) => t.ok((staticOf[key] || []).includes(w), key + ' → ' + w + ' (got ' + (staticOf[key] || []).join(', ') + ')');
  has('rw_mill[1]', 'rw.mill1:prop:gears');
  has('rw_tools[1]', 'rw.carpenter:prop:table');
  has('rw_boots[1]', 'rw.house1:npc:oto');
  has('sg_main[0]', 'sg.office:npc:omi');
  has('sg_main[5]', 'sg.tidehut:npc:shiori');
  has('sg_cove[2]', 'sg.cove:prop:net');
  has('co_main[5]', 'co.terraces:npc:co_tamotsu');
  has('co_count[1]', 'co.village:npc:co_kotaro');
  has('sb_lamp[0]', 'sb.inn:npc:yae');
  has('sb_goats[1]', 'sb.goatshed:prop:sign');
  has('lf_main[5]', 'lf.sluice:npc:lf_tokuji');
  has('lf_timetable[0]', 'lf.ferry:prop:noticeboard');
  has('sa_main[8]', 'sa.gate:npc:kasane');
  has('sa_isamu[0]', 'sa.memories:prop:shelf');
  t.eq(staticOf['sg_main[0]'], ['sg.office:npc:omi'], 'the nearest stage only: sg_main[0] is Ōmi, not later steps');
  t.ok(G.passing('lf_mio', 0) && G.passing('lf_mio', 1) && G.passing('lf_form', 0), 'stages passed within one scene are recognised');
  t.ok(!G.passing('sg_main', 0) && !G.passing('rw_labels', 1), 'stages left between scenes are not');

  // ---- 2. live analysis on real states ---------------------------------------------------------
  const mk = (flags, quests, extra) => {
    const st = RB.state.newCampaign();
    for (const f of flags) st.flags[f] = true;
    for (const [q, v] of Object.entries(quests)) RB.state.setQuest(st, q, v);
    return Object.assign(st, { map: 'rw.village', travel: { reedwake: true } }, extra || {});
  };
  const live = (qid, st) => { const r = G.analyse(qid, st); return { how: r.how, t: r.targets.map(whereXY).sort() }; };
  const RW = ['rw_arrived', 'rw_road_lit', 'rw_met_tsuru'];
  let r = live('rw_labels', mk(RW, { rw_labels: 0 }));
  t.eq(r.t, ['rw.apoth:npc:mio', 'rw.tea:npc:hana', 'rw.village:npc:ren', 'rw.village:npc:suzu', 'rw.warehouse:npc:nao'], 'rw_labels at the start: the five people to ask (Ren for the lanterns), not Tsuru');
  r = live('rw_labels', mk(RW.concat(['rw_met_ren', 'rw_letters_done', 'rw_bottles_done']), { rw_labels: 1 }));
  t.eq(r.t, ['rw.tea:npc:hana', 'rw.village:npc:suzu', 'rw.village:prop:deadlantern@20,22', 'rw.village:prop:deadlantern@32,18'], 'rw_labels half done: only those not yet helped (Hana, Suzu, the two lanterns)');
  r = live('rw_labels', mk(RW.concat(['rw_met_ren', 'rw_letters_done', 'rw_bottles_done', 'rw_suzu_told', 'rw_hana_cups', 'rw_lantern_s']), { rw_labels: 1 }));
  t.eq(r.t, ['rw.village:prop:deadlantern@32,18'], 'one lantern lit: only the other one');
  t.eq(r.how, 'needs', '… found through what Tsuru’s report is waiting for');
  r = live('rw_labels', mk(RW.concat(['rw_met_ren', 'rw_letters_done', 'rw_bottles_done', 'rw_lanterns_done', 'rw_suzu_told', 'rw_hana_cups']), { rw_labels: 1 }));
  t.eq(r.t, ['rw.village:npc:tsuru'], 'rw_labels, everyone helped: Tsuru');
  r = live('rw_mill', mk(RW.concat(['rw_mill_open']), { rw_labels: 'done', rw_mill: 0 }));
  t.eq(r.t, ['rw.millroad:npc:mio'], 'rw_mill 0: Mio on the mill road (the gears need the pin she gives)');
  const SG = { comp: 'mio', map: 'sg.harbor', travel: { reedwake: true, saltglass: true } };
  r = live('sg_main', mk(['ch1_done', 'departed', 'sg_arrived'], { sg_main: 1 }, SG));
  t.eq(r.t.map((x) => x.replace(/@.*/, '')).filter((x, i, a) => a.indexOf(x) === i), ['sg.harbor:npc:tetsu', 'sg.inn:npc:tamae', 'sg.warehouse:prop:crate'], 'sg_main 1: the three contradictions (not the Drowned Archive, which cannot be reached yet)');
  r = live('sg_main', mk(['ch1_done', 'departed', 'sg_arrived'], { sg_main: 3 }, SG));
  t.eq(r.t, ['sg.glass:npc:asahi', 'sg.harbor:npc:kiyo', 'sg.lighthouse:npc:genzo'], 'sg_main 3: the glassworks, the fish market and the lighthouse');
  r = live('sg_cove', mk(['ch1_done', 'departed', 'sg_arrived'], { sg_main: 3, sg_cove: 0 }, SG));
  t.ok(r.t.includes('sg.harbor:npc:daigo') && r.t.includes('sg.harbor:npc:tobi'), 'sg_cove 0: people to ask for directions (a count that grows): ' + r.t.join(', '));
  const CO = { comp: 'nao', map: 'co.village', travel: { cinder: true } };
  r = live('co_main', mk(['ch2_done', 'departed', 'co_arrived', 'co_met_sayo', 'co_suspect', 'co_chronicle_read'], { co_main: 3 }, CO));
  t.eq(r.t, ['co.glass:npc:co_isao', 'co.terraces:npc:co_ume', 'co.village:npc:co_goro'], 'co_main 3: Ume, Gorō and Isao');
  r = live('co_main', mk(['ch2_done', 'departed', 'co_arrived', 'co_met_sayo'], { co_main: 1 }, CO));
  t.eq(r.how, 'many', 'co_main 1 ("look around"): too many places, none marked');
  const LF = { comp: 'suzu', map: 'lf.town', travel: { lanternfall: true } };
  r = live('lf_akari', mk(['ch4_done', 'departed', 'lf_arrived', 'lf_town_intro'], { lf_main: 3, lf_akari: 0 }, LF));
  t.eq([r.how, r.t], ['waiting', []], 'lf_akari 0 waits on the main road: nothing marked, Akari not targeted before the bell');
  r = live('lf_main', mk(['ch4_done', 'departed', 'lf_arrived', 'lf_town_intro'], { lf_main: 0 }, LF));
  t.eq(r.t, ['lf.records:npc:lf_tadashi'], 'lf_main 0: the Records Hall');
  r = live('rw_depart', mk(['rw_echo_done', 'departed'], { rw_depart: 1 }, { comp: 'suzu', map: 'rw.road' }));
  t.eq([r.how, r.t], ['authored', ['sg.road:enter:']], 'rw_depart 1: authored — the coast road');
  // reachability: a scene warp counts as a way (Tokuji's boat to the tower)
  const lfst = mk(['ch4_done', 'departed', 'lf_arrived', 'lf_town_intro'], { lf_main: 6 }, LF);
  const reach = G.reachable(lfst);
  t.ok(reach && reach.has('lf.sluice'), 'the sluice shore is reachable from the town');

  // ---- 3. the words ------------------------------------------------------------------------------
  const lineProblems = (l, w) => {
    const bad = [];
    if (!l || !l.jp || !l.en) return [w + ': empty'];
    for (const e of RB.jp.validate(l.jp)) bad.push(w + ': ' + e.msg + ' in ' + l.jp);
    for (const tk of RB.jp.parse(l.jp)) {
      if (tk.punct || /^[\d\s]+$/.test(tk.surface)) continue;
      const a = RB.jp.lookup(tk);
      if (!a || !a.entry) bad.push(w + ': unknown word ' + tk.surface + ' in ' + l.jp);
    }
    return bad;
  };
  const probs = [], generic = new Set();
  let lines = 0;
  const s0 = RB.state.newCampaign();
  RB.game.s = s0;
  for (const qid in C.quests) {
    C.quests[qid].stages.forEach((stg, k) => {
      const st = RB.state.newCampaign();
      st.quests[qid] = { stage: k, done: false, t: 1 };
      const res = G.analyse(qid, st, { static: true, derive: true });
      const r2 = stg.at && stg.at !== 'open' ? G.analyse(qid, st) : res;
      for (const tg of r2.targets) if (tg.kind === 'prop' && G.nameOf(tg).en === 'something') generic.add(tg.p);
      RB.game.s = st;
      const N = G.nudges(qid, st);
      for (const ls of N.lines) for (const l of ls) { lines++; probs.push(...lineProblems(l, qid + '[' + k + ']')); }
      for (const l of G.nextLines(r2)) { lines++; probs.push(...lineProblems(l, qid + '[' + k + '] next')); }
      if (stg.hint) probs.push(...lineProblems(stg.hint, qid + '[' + k + '] hint'));
    });
  }
  RB.game.s = null;
  t.log('generated guidance lines checked: ' + lines);
  t.eq(probs.slice(0, 12), [], 'every generated line has furigana on every kanji, known words and English');
  t.eq([...generic], [], 'every prop that is a target has a name (not just "something")');
  // directions read both ways
  t.eq(G.compass(5, 0).en, 'east', 'compass: east'); t.eq(G.compass(0, -5).en, 'north', 'compass: north (y grows southward)');
  t.eq(G.compass(-4, 4).en, 'south-west', 'compass: south-west'); t.eq(G.compass(1, 0), null, 'compass: right by you');

  // ---- 4. following, old saves, settings -------------------------------------------------------------
  const s = mk(RW, { rw_labels: 0, rw_tools: 0 });
  s.quests.rw_tools.t = s.quests.rw_labels.t + 5; // advanced more recently
  RB.game.s = s;
  t.eq(G.followed(s), 'rw_labels', 'nothing chosen: the main road is followed (even if a side quest moved more recently)');
  G.follow('rw_tools');
  t.eq([G.followed(s), G.chosen(s)], ['rw_tools', true], 'follow a side quest');
  G.unfollow('rw_tools');
  t.eq([G.followed(s), 'follow' in s], ['rw_labels', false], 'unfollow a side quest: back to the main road');
  G.unfollow('rw_labels');
  t.eq([G.followed(s), s.follow], [null, '-'], 'unfollow the main road: nothing followed');
  G.follow('rw_labels');
  RB.state.setQuest(s, 'rw_labels', 'done');
  RB.state.setQuest(s, 'rw_mill', 0);
  t.eq(G.followed(s), 'rw_mill', 'a followed quest that is finished hands over to the main road');
  // a main quest of an earlier chapter left open (rw_depart never completes) is not followed by default
  const s2 = mk(['departed'], { sg_main: 0 }, { chapter: 2 });
  RB.state.setQuest(s2, 'rw_depart', 1); s2.quests.rw_depart.t = s2.quests.sg_main.t + 10;
  RB.game.s = s2;
  t.eq(G.followed(s2), 'sg_main', 'Chapter 2: the main road is sg_main, not the open Chapter 1 quest');
  RB.state.setQuest(s2, 'sg_main', 'done'); s2.chapter = 6;
  t.eq(G.followed(s2), null, 'after the story: nothing followed by default');
  RB.game.s = null;
  t.ok(!('follow' in RB.state.newCampaign()), 'a new campaign has no follow field (the save schema is unchanged)');
  const old = RB.state.newCampaign();
  old.map = 'rw.village'; old.x = 5; old.y = 5;
  RB.state.setQuest(old, 'rw_labels', 1);
  const oldJson = JSON.parse(JSON.stringify(old));
  t.eq(RB.save.validate(oldJson), [], 'an old save (no follow) validates');
  const mig = RB.save.migrate(oldJson);
  t.ok(!('follow' in mig) && G.followed(mig) === 'rw_labels', 'an old save loads and follows the main road');
  const withF = Object.assign(JSON.parse(JSON.stringify(old)), { follow: 'rw_labels' });
  t.eq(RB.save.validate(withF), [], 'a save with follow validates the same way');
  t.eq(RB.game.defaultSettings().questGuide, 'full', 'the setting defaults to markers and hints');
  t.eq(G.mode(), 'full', 'no settings record: markers and hints');
  // every map belongs to a place on the chart
  const noPlace = Object.keys(C.maps).filter((m) => !G.placeOf(m));
  t.eq(noPlace, [], 'every map belongs to a place on the route chart');
};
