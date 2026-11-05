// Kihei's leaf on the wind (editorial row 3: Cloud CC-523 note 3 and CC-525, option (a); the text agreed in Agnes
// 6640417567 and Local CL-690). The wind ending narrated "You walk up to the village's Wind Stone with Kihei…", but
// the scene plays at the tide pools and moves no one: you were still at the tide pools when he was gone. Now the
// choice reads "Send it on the wind, towards the Wind Stone." and the ending "At the tide pools, you give the leaf to
// the wind. It flies off towards the village's Wind Stone. Kihei takes off his cap and watches it go." (a new key,
// with no recording until voice work resumes). The preview, Kihei's last word, the disappearance, the quest result
// and the other two ends are unchanged.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed, the choices picked by the test), Kihei
// reached by his own talk list at the tide pools:
//  1. the scene: the choice and the ending carry the agreed JP/EN; the ending's key is new; the preview line stays;
//  2. the wind end through Kihei's talk: the choice offered with the new text; the preview, then "Send it."; the new
//     ending once, not the old; his last word and the disappearance; the letter taken, ko_kihei_wind, the quest done;
//     still at the tide pools, with no move; "Think again" first goes back to the menu with nothing changed;
//  3. a save and load before the choice, then the wind end: the same;
//  4. Mitsu's line after the wind end ("…last night I dreamt my grandmother was laughing") unchanged;
//  5. line for line as on the parent (eedfa87): the Mitsu and keep ends, and the wind end with its ending masked, each
//     companion and none; no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

const FIRST_FP = 'd1e86b452ac451af';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);

  // ---- a minimal stage (as tests/unit/ko_after_lines.test.mjs) ----------------------------------------------------
  let lines = [], offered = [], picks = [], moved = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who || 'narr', jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { offered.push(opts.map((o) => o.en)); return picks.length ? picks.shift() : 0; };
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
  RB.game.transition = async (map) => { moved.push(map); };
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async (who, x, y) => { moved.push('walk ' + who + ' ' + x + ',' + y); };
  RB.challenge.run = async (id) => { RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'ko-kihei-wind-test'; st.map = o.map || 'ko.tidepools'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, ko_ch9: true, ko_otoha_met: true, ko_kihei_met: true }, o.flags || {});
    st.quests.ko_main = { stage: 4, done: false, t: 1 };
    st.quests.ko_kihei = { stage: 2, done: false, t: 1 };
    st.inv = Object.assign({ ko_kihei_letter: 1 }, o.inv || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, p) => { lines = []; offered = []; moved = []; picks = (p || []).slice(); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines.slice(); };
  const talkOf = (map, id) => { s.map = map; RB.world.W.map = { id: map, def: C.maps[map] }; const n = (C.maps[map].npcs || []).find((x) => x.id === id); if (!n || (n.if && !S.test(s, n.if))) return null; return ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene; };
  const talk = async (map, id, p) => { const sc = talkOf(map, id); const ls = sc ? await run(sc, p) : []; return { sc, lines: ls, offered: offered.slice(), moved: moved.slice() }; };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  const CHOICE = { jp: '{風|かぜ} に {乗|の}せて 、 {風石|かぜいし} の {方|ほう} へ {送|おく}る 。', en: 'Send it on the wind, towards the Wind Stone.' };
  const END = { jp: '{潮|しお}だまり で 、 {葉|は} を {風|かぜ} に {乗|の}せた 。 {葉|は} は {村|むら} の {風石|かぜいし} の {方|ほう} へ {飛|と}んで いく 。 キヘイ が {帽子|ぼうし} を {取|と}って 、 {見送|みおく}る 。',
    en: 'At the tide pools, you give the leaf to the wind. It flies off towards the village\'s Wind Stone. Kihei takes off his cap and watches it go.' };
  const OLD_KEY = 'ko.kihei_choose#efe7d1269e';
  const B = { old: /^You walk up to the village's Wind Stone with Kihei/, end: /^At the tide pools, you give the leaf to the wind\./, preview: /^\(The letter rides the wind to Hatsu/, late: /^…I'm late, Hatsu\.$/,
    gone: /^When the leaf was out of sight, Kihei was gone too\.$/, dream: /^…Come to think of it, last night I dreamt my grandmother was laughing\./ };
  const count = (ls, re) => ls.filter((l) => re.test(l.en)).length;
  const st = () => ({ quest: s.quests.ko_kihei.done ? 'done' : s.quests.ko_kihei.stage, wind: !!s.flags.ko_kihei_wind, letter: (s.inv || {}).ko_kihei_letter || 0, map: s.map });
  // the menu: 0 Mitsu, 1 the wind, 2 keep, 3 not now; then each preview's own choice: 0 do it, 1 think again
  const WIND = [1, 0], WIND_AFTER_AGAIN = [1, 1, 1, 0], MITSU = [0, 0], KEEP = [2, 0];

  // 1. the scene
  {
    const sc = C.scenes['ko.kihei_choose'], c = sc.cmds;
    const menu = c.find((x) => x.op === 'choice' && (x.opts || []).length >= 4) || null;
    const opts = menu ? menu.opts : [];
    const wind = opts.find((o) => o && /Wind Stone/.test(o.en || ''));
    const end = c.find((x) => x.op === 'say' && B.end.test(x.en || ''));
    const old = c.find((x) => x.op === 'say' && B.old.test(x.en || ''));
    const preview = c.find((x) => x.op === 'say' && B.preview.test(x.en || ''));
    const a = { wind: wind && { jp: wind.jp, en: wind.en }, end: end && { jp: end.jp, en: end.en, key: keyOf('ko.kihei_choose', end.jp) }, old: !!old, preview: !!preview };
    t.ok(wind && wind.jp === CHOICE.jp && wind.en === CHOICE.en && end && end.jp === END.jp && end.en === END.en && a.end.key !== OLD_KEY && !old && preview,
      '1 the scene: the choice and the ending carry the agreed JP/EN; the ending\'s key is new; the old ending gone; the preview stays ' + flat(a));
  }

  // 2. the wind end through Kihei's talk; "Think again" first
  {
    fresh();
    const r0 = await talk('ko.tidepools', 'ko_kihei', [1, 1, 3]);
    const a = Object.assign(st(), { sc: r0.sc, menu: r0.offered[0], preview: count(r0.lines, B.preview), end: count(r0.lines, B.end), offers: r0.offered.length });
    const r = await talk('ko.tidepools', 'ko_kihei', WIND);
    const b = Object.assign(st(), { sc: r.sc, end: count(r.lines, B.end), old: count(r.lines, B.old), late: count(r.lines, B.late), gone: count(r.lines, B.gone), moved: r.moved, after: talkOf('ko.tidepools', 'ko_kihei') });
    t.ok(a.sc === 'ko.kihei_choose' && a.menu && a.menu[1] === CHOICE.en && a.preview === 1 && a.end === 0 && a.quest === 2 && !a.wind && a.letter === 1 && a.offers === 3,
      '2a Kihei\'s talk: the choice offered with the new text; the preview, then "Think again" back to the menu, then "Not now": nothing changed ' + flat(a));
    t.ok(b.sc === 'ko.kihei_choose' && b.end === 1 && b.old === 0 && b.late === 1 && b.gone === 1 && b.quest === 'done' && b.wind && b.letter === 0 && b.map === 'ko.tidepools' && !b.moved.length && b.after === null,
      '2b then the wind: the new ending once, not the old; his last word and the disappearance; the letter taken, ko_kihei_wind, the quest done; still at the tide pools, no move; he is gone ' + flat(b));
  }

  // 3. a save and load before the choice; "Think again" once; then the wind
  {
    fresh({ comp: 'suzu' });
    loadSave(saved());
    const r = await talk('ko.tidepools', 'ko_kihei', WIND_AFTER_AGAIN);
    const a = Object.assign(st(), { end: count(r.lines, B.end), old: count(r.lines, B.old), previews: count(r.lines, B.preview), offers: r.offered.length });
    t.ok(a.end === 1 && a.old === 0 && a.previews === 2 && a.offers === 4 && a.quest === 'done' && a.wind && a.letter === 0 && a.map === 'ko.tidepools',
      '3 a save and load, "Think again" once, then the wind: the same ' + flat(a));
  }

  // 4. Mitsu afterwards
  {
    fresh({ flags: { ko_kihei_wind: true }, map: 'ko.lodge' });
    s.quests.ko_kihei = { stage: 2, done: true, t: 1 };
    s.flags.ko_gardener_done = true; s.flags.ko_done = true; s.quests.ko_main = { stage: 7, done: true, t: 1 };
    const r = await talk('ko.lodge', 'ko_mitsu');
    t.ok(r.sc === 'ko.mitsu_after' && count(r.lines, B.dream) === 1, '4 Mitsu after the wind end: her dream line, unchanged ' + flat({ sc: r.sc, n: r.lines.length }));
  }

  // 5. line for line as on the parent
  {
    const got = {}, ok = [];
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp });
      got['mitsu:' + comp] = fp((await talk('ko.tidepools', 'ko_kihei', MITSU)).lines);
      fresh({ comp });
      got['keep:' + comp] = fp((await talk('ko.tidepools', 'ko_kihei', KEEP)).lines);
      fresh({ comp });
      const w = (await talk('ko.tidepools', 'ko_kihei', WIND)).lines;
      got['wind:' + comp] = fp(w.map((l) => (B.end.test(l.en) || B.old.test(l.en) ? { who: l.who, masked: true } : l)));
      ok.push({ comp, n: count(w, B.end) });
    }
    t.ok(fp(got) === FIRST_FP && ok.every((x) => x.n === 1) && !errors.length,
      '5 line for line as on the parent: the Mitsu and keep ends, and the wind end with its ending masked, each companion and none; no scene error ' +
      flat({ fp: fp(got), n: Object.keys(got).length, ok, errors }));
  }
  console.error = cerr;
};
