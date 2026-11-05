// The Kotonoha townsfolk after the Gardener (editorial row 2: Cloud CC-523 note 2 and CC-525; Agnes 6639995441;
// Local CL-689). Nami, Hamaji, Nana and Mitsu turned to their after-lines only with ko_done, from Otoha's ending; from
// the Gardener (ko_gardener_done, quest step 7) to Otoha they still spoke of going down under the roots. Now their
// after-lines come from the Gardener on; their side-quest entries stay ahead, `post` stays first among their own; and
// Nami's "Tetsu's boat is at the jetty" waits for the report to Otoha (`?(ko_done)`). Tokio and Ao are unchanged. No
// routine, census, keepsake, chapter or travel state changes.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed), the Gardener done through its own root
// arch with the encounter won by the test, and each person reached by their own talk list:
//  1. the talk lists: the four after-entries take ko_done|ko_gardener_done, behind the entries ahead of them as before;
//     Tokio's and Ao's keep ko_done; Nami's boat line takes ko_done;
//  2. before the Gardener (step 4): each of the four, their roots line;
//  3. the Gardener done through its arch, a save and load: each of the four, their after-line; Nami without the boat;
//     the quest at step 7, no ko_done, the chapter and travel state as before; Tokio and Ao still on their chapter 9
//     scenes (their after-entries keep ko_done);
//  4. after Otoha's ending (ko_done): each of the four, their after-line; Nami's boat line;
//  5. the side-quest entries still ahead after the Gardener: Mitsu's Kihei letter and Hatsu, Nami's rumours; `post`
//     still first among their own;
//  6. line for line as on the parent (4b15e52): the four before the Gardener and after the ending, and Tokio and Ao in
//     each phase, with each companion and none; after the Gardener, the ending's after-lines (Nami's without the boat);
//     no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

const FIRST_FP = 'b02f364051b9f9d1';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/lf_council_fence.test.mjs) --------------------------------------------------
  let lines = [], enc = [];
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
  RB.game.startEncounter = async (id) => { enc.push(id); return { result: 'win', outcome: '' }; };
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.challenge.run = async (id) => { RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'ko-after-lines-test'; st.map = o.map || 'ko.village'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, ko_ch9: true, ko_otoha_met: true }, o.flags || {});
    st.quests.ko_main = typeof o.main === 'object' ? o.main : { stage: o.main === undefined ? 4 : o.main, done: false, t: 1 };
    for (const [k, v] of Object.entries(o.quests || {})) st.quests[k] = typeof v === 'object' ? v : { stage: v, done: false, t: 1 };
    Object.assign(st.seen, o.seen || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id) => { lines = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines.slice(); };
  const WHERE = { ko_nami: 'ko.village', ko_hamaji: 'ko.village', ko_nana: 'ko.village', ko_mitsu: 'ko.lodge', ko_tokio: 'ko.village', ko_ao: 'ko.village' };
  const npcOf = (id) => (C.maps[WHERE[id]].npcs || []).find((x) => x.id === id);
  const talkOf = (id) => { const map = WHERE[id]; s.map = map; RB.world.W.map = { id: map, def: C.maps[map] }; const n = npcOf(id); if (!n || (n.if && !S.test(s, n.if))) return null; return ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene; };
  const talk = async (id) => { const sc = talkOf(id); return { sc, lines: sc ? await run(sc) : [] }; };
  const FOUR = ['ko_nami', 'ko_hamaji', 'ko_nana', 'ko_mitsu'];
  const ROOTS = { ko_nami: /^You're going down into the Root Hollows\?/, ko_hamaji: /^Under the roots, it joins the sea\./, ko_nana: /^You're going under the roots\? It's dark there\./, ko_mitsu: /^You're going under the roots\? …I'll have something warm/ };
  const AFTER = { ko_nami: /^The leaves are back to as many as I can row/, ko_hamaji: /^One more story to tell the grandchildren/, ko_nana: /^Welcome back! Tell me about under the roots/, ko_mitsu: /^Welcome back! Here, the soup I promised/ };
  const BOAT = /^If you're going back to the mainland, Tetsu's boat is at the jetty\.$/;
  const has = (ls, re) => ls.some((l) => re.test(l.en));
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));
  const gardener = async () => { s.map = 'ko.garden'; RB.world.W.map = { id: 'ko.garden', def: C.maps['ko.garden'] }; const p = (C.maps['ko.garden'].props || []).find((x) => x.scene && /^ko\.garden/.test(x.scene) && (!x.if || S.test(s, x.if))); enc = []; await run(p && p.scene); return { arch: p && p.scene, enc: enc.slice() }; };
  const snapshot = () => ({ main: s.quests.ko_main.done ? 'done' : s.quests.ko_main.stage, gardener: !!s.flags.ko_gardener_done, done: !!s.flags.ko_done, travel: flat(s.travel || {}), chapter: s.chapter });

  // 1. the talk lists
  {
    const a = {};
    for (const id of FOUR) {
      const tl = npcOf(id).talk, ia = tl.findIndex((x) => x.scene === 'ko.' + id.slice(3) + '_after'), ip = tl.findIndex((x) => x.scene === 'ko.' + id.slice(3) + '_post');
      a[id] = { after: tl[ia] && tl[ia].if, ip, ia, n: tl.length };
    }
    const keep = ['ko_tokio', 'ko_ao'].map((id) => { const tl = npcOf(id).talk; const e = tl.find((x) => x.scene === 'ko.' + id.slice(3) + '_after'); return e && e.if; });
    const boat = C.scenes['ko.nami_after'].cmds.find((x) => x.op === 'say' && BOAT.test(x.en));
    t.ok(FOUR.every((id) => a[id].after === 'ko_done|ko_gardener_done' && a[id].ip >= 0 && a[id].ip < a[id].ia) && flat(keep) === '["ko_done","ko_done"]' && boat && boat.if === 'ko_done',
      '1 the talk lists: the four after-entries from the Gardener, behind their post; Tokio and Ao keep ko_done; Nami\'s boat line takes ko_done ' + flat({ a, keep, boat: boat && boat.if }));
  }

  // 2. before the Gardener (step 4)
  {
    fresh({ main: 4 });
    const got = {};
    for (const id of FOUR) { const r = await talk(id); got[id] = { sc: r.sc, roots: has(r.lines, ROOTS[id]), after: has(r.lines, AFTER[id]) }; }
    t.ok(FOUR.every((id) => got[id].sc === 'ko.' + id.slice(3) + '_ch9' && got[id].roots && !got[id].after),
      '2 before the Gardener (step 4): each of the four, their roots line ' + flat(got));
  }

  // 3. the Gardener done through its arch; a save and load; the four, Tokio and Ao
  {
    fresh({ main: 6, map: 'ko.garden' });
    const before = snapshot();
    const g = await gardener();
    const after = snapshot();
    loadSave(saved());
    const got = {};
    for (const id of FOUR) { const r = await talk(id); got[id] = { sc: r.sc, roots: has(r.lines, ROOTS[id]), after: has(r.lines, AFTER[id]), boat: has(r.lines, BOAT) }; }
    const tokio1 = await talk('ko_tokio'), ao1 = await talk('ko_ao');
    t.ok(g.arch === 'ko.gardener' && flat(g.enc) === '["ko.gardener"]' && after.gardener && !after.done && after.main === 7 && after.travel === before.travel && after.chapter === before.chapter &&
      FOUR.every((id) => got[id].sc === 'ko.' + id.slice(3) + '_after' && got[id].after && !got[id].roots && !got[id].boat) &&
      tokio1.sc === 'ko.tokio_ch9' && ao1.sc === 'ko.ao_ch9',
      '3 the Gardener done through its arch, a save and load: each of the four, their after-line, Nami without the boat; step 7, no ko_done, travel and chapter as before; Tokio and Ao still on their chapter 9 scenes, not their after-lines ' +
      flat({ g, before, after, got, tokio: tokio1.sc, ao: ao1.sc }));
  }

  // 4. after Otoha's ending
  {
    fresh({ main: { stage: 7, done: true, t: 1 }, flags: { ko_gardener_done: true, ko_done: true } });
    const got = {};
    for (const id of FOUR) { const r = await talk(id); got[id] = { sc: r.sc, after: has(r.lines, AFTER[id]), boat: has(r.lines, BOAT) }; }
    t.ok(FOUR.every((id) => got[id].sc === 'ko.' + id.slice(3) + '_after' && got[id].after && got[id].boat === (id === 'ko_nami')),
      '4 after Otoha\'s ending: each of the four, their after-line; Nami\'s boat line ' + flat(got));
  }

  // 5. the entries ahead still ahead after the Gardener; post first among their own
  {
    const g = { main: 7, flags: { ko_gardener_done: true } };
    fresh(Object.assign({}, g, { quests: { ko_kihei: 1 } }));
    const hatsu = talkOf('ko_mitsu');
    fresh(Object.assign({}, g, { flags: { ko_gardener_done: true, ko_kihei_mitsu: true } }));
    const letter = talkOf('ko_mitsu');
    fresh(Object.assign({}, g, { seen: { 'ko.rumour_tetsu': true } }));
    const rumours = talkOf('ko_nami');
    fresh(Object.assign({}, g, { flags: { ko_gardener_done: true, postgame: true } }));
    const post = FOUR.map((id) => talkOf(id));
    t.ok(hatsu === 'ko.mitsu_hatsu' && letter === 'ko.mitsu_letter' && rumours === 'ko.rumours' && flat(post) === flat(FOUR.map((id) => 'ko.' + id.slice(3) + '_post')),
      '5 after the Gardener, the entries ahead still ahead (Mitsu\'s Hatsu and Kihei letter, Nami\'s rumours), and post first among their own ' + flat({ hatsu, letter, rumours, post }));
  }

  // 6. line for line
  {
    const got = {}, ok = [];
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp, main: 4 });
      for (const id of FOUR.concat(['ko_tokio', 'ko_ao'])) got['before:' + comp + ':' + id] = fp((await talk(id)).lines);
      fresh({ comp, main: { stage: 7, done: true, t: 1 }, flags: { ko_gardener_done: true, ko_done: true } });
      const end = {};
      for (const id of FOUR.concat(['ko_tokio', 'ko_ao'])) { end[id] = (await talk(id)).lines; got['ending:' + comp + ':' + id] = fp(end[id]); }
      fresh({ comp, main: 7, flags: { ko_gardener_done: true } });
      for (const id of FOUR) {
        const g = (await talk(id)).lines;
        const want = end[id].filter((l) => !BOAT.test(l.en));
        ok.push({ comp, id, same: fp(g) === fp(want) });
      }
      for (const id of ['ko_tokio', 'ko_ao']) got['gardener:' + comp + ':' + id] = fp((await talk(id)).lines);
    }
    t.ok(fp(got) === FIRST_FP && ok.every((x) => x.same) && !errors.length,
      '6 line for line as on the parent: the four before the Gardener and after the ending, Tokio and Ao in each phase, each companion and none; after the Gardener, the ending\'s after-lines (Nami\'s without the boat); no scene error ' +
      flat({ fp: fp(got), n: Object.keys(got).length, bad: ok.filter((x) => !x.same), errors }));
  }
  console.error = cerr;
};
