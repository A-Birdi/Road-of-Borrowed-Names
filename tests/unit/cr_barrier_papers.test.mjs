// The Barrier papers (editorial row 4: Agnes 6644985524; Cloud CC-532; Local CL-700; Agnes 6645340596). At Sumi's
// table you write your names into the papers again; when Ujie opened them, nothing said the names had gone, and yet he
// went on as if they had ("Your names have faded from them", "But there are no names on the papers"). Now one narrator
// line, on the interview path only: "Ujie unfolds the papers. The names you wrote at Sumi's table have gone. The paper
// is blank again." (a new key, with no recording until voice work resumes). Every other line is unchanged.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed, the exercises answered by the test),
// Sumi and Ujie reached by their own talk lists in the Barrier office:
//  1. the scene: the line straight after the three guards (passed, fetching, Sumi first), before Ujie's first line;
//     its JP/EN; its key;
//  2. the branches without it: Sumi not yet seen (Ujie sends you to her), fetching, the guarantee brought back,
//     passed, and after the chapter;
//  3. Sumi, then Ujie: the line once, before his first; the interview; the companion stays; fetching;
//  4. Sumi, a save and load, then Ujie: the same; then Ujie again: fetching, without it;
//  5. line for line as on the parent (5faca9c): Sumi's scene, and Ujie's interview path with the new line left out,
//     with each companion and none; no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

const FIRST_FP = 'fc46e48618ca511b';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);

  // ---- a minimal stage (as tests/unit/ko_kihei_wind.test.mjs) -----------------------------------------------------
  let lines = [], asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who || 'narr', jp: l.jp || '', en: l.en || '' }); };
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
  RB.challenge.run = async (id) => { asked.push(id); RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const MAP = 'cr.barrier_office';
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'cr-barrier-papers-test'; st.map = MAP; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true }, o.flags || {});
    st.quests.cr_main = { stage: 4, done: false, t: 1 };
    st.inv = Object.assign({}, o.inv || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id) => { lines = []; asked = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines.slice(); };
  const talkOf = (id) => { s.map = MAP; RB.world.W.map = { id: MAP, def: C.maps[MAP] }; const n = (C.maps[MAP].npcs || []).find((x) => x.id === id); if (!n || (n.if && !S.test(s, n.if))) return null; return ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene; };
  const talk = async (id) => { const sc = talkOf(id); const ls = sc ? await run(sc) : []; return { sc, lines: ls, asked: asked.slice() }; };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  const LINE = { jp: 'ウジエ が {手形|てがた} を {開|ひら}く 。 スミ の {台|だい} で {書|か}いた {名前|なまえ} が 、 {消|き}えて いる 。 {紙|かみ} は 、 また {白|しろ}い 。',
    en: 'Ujie unfolds the papers. The names you wrote at Sumi\'s table have gone. The paper is blank again.' };
  const B = { line: /^Ujie unfolds the papers\. The names you wrote at Sumi's table have gone\. The paper is blank again\.$/, first: /^I am Ujie, keeper of the Mist Barrier/, sumiFirst: /^Please show your papers to Sumi first\.$/,
    regards: /^Please give my regards to Lady Shizu of Kumoi\.$/, safe: /^Take care\. A safe journey/ };
  const count = (ls, re) => ls.filter((l) => re.test(l.en)).length;
  const at = (ls, re) => ls.findIndex((l) => re.test(l.en));
  const st = () => ({ seals: !!s.flags.cr_seals_checked, fetching: !!s.flags.cr_fetching, apart: !!s.flags.cr_apart, main: s.quests.cr_main.done ? 'done' : s.quests.cr_main.stage });

  // 1. the scene
  {
    const sc = C.scenes['cr.ujie'], c = sc.cmds;
    const i = c.findIndex((x) => x.op === 'say' && B.line.test(x.en || ''));
    const guards = c.slice(0, i).filter((x) => x.op === 'if').map((x) => x.args.join(' '));
    const next = c[i + 1];
    const a = { i, guards, next: next && next.who, nextEn: next && (next.en || '').slice(0, 40), jp: c[i] && c[i].jp, en: c[i] && c[i].en, who: c[i] && (c[i].who || 'narr'), if: c[i] && c[i].if, key: c[i] && keyOf('cr.ujie', c[i].jp) };
    t.ok(i > 0 && guards.length === 3 && /cr_passed/.test(guards[0]) && /cr_fetching/.test(guards[1]) && /!cr_seals_checked/.test(guards[2]) && a.next === 'cr_ujie' && B.first.test(next.en) &&
      a.jp === LINE.jp && a.en === LINE.en && a.who === 'narr' && !a.if && a.key === 'cr.ujie#509c334a6e',
      '1 the scene: the narrator\'s line straight after the three guards, before Ujie\'s first line; its JP/EN; key cr.ujie#509c334a6e ' + flat(a));
  }

  // 2. the branches without it
  {
    const got = {};
    fresh();
    got.sumiFirst = (await talk('cr_ujie'));
    fresh({ flags: { cr_seals_checked: true, cr_fetching: true, cr_apart: true } });
    got.fetching = (await talk('cr_ujie'));
    fresh({ flags: { cr_seals_checked: true, cr_fetching: true, cr_apart: true }, inv: { cr_proof: 1 } });
    got.back = (await talk('cr_ujie'));
    fresh({ flags: { cr_seals_checked: true, cr_passed: true } });
    got.passed = (await talk('cr_ujie'));
    fresh({ flags: { cr_seals_checked: true, cr_passed: true, cr_done: true } });
    got.after = (await talk('cr_ujie'));
    const v = Object.fromEntries(Object.entries(got).map(([k, r]) => [k, { sc: r.sc, line: count(r.lines, B.line), n: r.lines.length }]));
    t.ok(Object.values(v).every((x) => x.line === 0 && x.n > 0) && v.sumiFirst.sc === 'cr.ujie' && count(got.sumiFirst.lines, B.sumiFirst) === 1 && v.fetching.sc === 'cr.ujie' && count(got.fetching.lines, B.regards) === 1 &&
      v.back.sc === 'cr.barrier_back' && v.passed.sc === 'cr.ujie' && count(got.passed.lines, B.safe) === 1 && v.after.sc === 'cr.ujie_after',
      '2 without it: Sumi not yet seen, fetching, the guarantee brought back, passed, after the chapter ' + flat(v));
  }

  // 3. Sumi, then Ujie
  {
    fresh();
    const a = await talk('cr_sumi');
    const s1 = st();
    const b = await talk('cr_ujie');
    const v = Object.assign(st(), { sumi: a.sc, sumiAsked: a.asked, s1, ujie: b.sc, line: count(b.lines, B.line), at: at(b.lines, B.line), first: at(b.lines, B.first), asked: b.asked });
    t.ok(v.sumi === 'cr.sumi' && v.s1.seals && v.ujie === 'cr.ujie' && v.line === 1 && v.at === 0 && v.first === 1 && flat(v.asked) === '["cr.interview"]' && v.fetching && v.apart && v.main === 5,
      '3 Sumi, then Ujie: the line once, before his first; the interview; the companion stays; fetching, step 5 ' + flat(v));
  }

  // 4. Sumi, a save and load, then Ujie; then Ujie again
  {
    fresh({ comp: 'suzu' });
    await talk('cr_sumi');
    loadSave(saved());
    const b = await talk('cr_ujie');
    const c = await talk('cr_ujie');
    const v = { line: count(b.lines, B.line), at: at(b.lines, B.line), again: c.sc, againLine: count(c.lines, B.line), regards: count(c.lines, B.regards) };
    t.ok(v.line === 1 && v.at === 0 && v.again === 'cr.ujie' && v.againLine === 0 && v.regards === 1,
      '4 Sumi, a save and load, then Ujie: the line once, first; then Ujie again (fetching): without it ' + flat(v));
  }

  // 5. line for line as on the parent
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp });
      got['sumi:' + comp] = fp((await talk('cr_sumi')).lines);
      got['ujie:' + comp] = fp((await talk('cr_ujie')).lines.filter((l) => !B.line.test(l.en)));
    }
    t.ok(fp(got) === FIRST_FP && !errors.length,
      '5 line for line as on the parent: Sumi\'s scene, and Ujie\'s interview path with the new line left out, each companion and none; no scene error ' + flat({ fp: fp(got), n: Object.keys(got).length, errors }));
  }
  console.error = cerr;
};
