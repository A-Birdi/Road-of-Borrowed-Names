// Councillor Tami's flood count and her revisit (one row, the tests kept distinct: Cloud CC-411 and CC-414; Local
// CL-570 and CL-573; Agnes 6549001897 and 6549667967; built as listed in CC-539).
// The flood count: she said everyone in the lower quarter fled and only Tōya didn't come back, against the ledger's
// "Twelve dead" and the memorial's twelve names. Now "Many people in the lower quarter fled to high ground" and "Tōya
// didn't come back.", and the lf_toya note says "Many people in the lower quarter got out in time".
// The revisit: on an immediate repeat she said "Day three", and in the twelve-chapter edition told you to rest before
// going up the mountain, though the letter's sea route comes first. Now "Day three." is gone in both editions, and the
// edition-2 line is "Rest in town before you set off". Edition 1's line, its key and its recording are unchanged; the
// lexicon keeps 三日目 for the practice pools. Old recordings are kept, unused; the new keys await re-recording.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed, the exercises answered by the test), Tami
// reached by her own talk list in the Council Chamber:
//  F1. the flood lines: their JP/EN, their new keys, the old keys said nowhere, her lowered head still before the
//      second, the staging comment quoting the new line;
//  F2. the minutes through to their exercise: the new lines once, the old never; told, step 5;
//  F3. the note in both languages, given with the minutes; the ledger still "Twelve dead";
//  F4. the minutes (the two lines masked), the ledger and the memorial, line for line as on the parent, each companion
//      and none, before and after the bell;
//  R1. the revisit lines: 755 without "Day three" (a new key), 756 split by edition (edition 1's key unchanged, the
//      edition-2 line new); 三日目 still in the lexicon;
//  R2. edition 1, an immediate repeat: the new 755 and the mountain line;
//  R3. edition 2, an immediate repeat: the new 755 and "set off"; the letter (ko.call) not read again;
//  R4. edition 2 after Kotonoha: her Cloudroad scenes first, as on the parent (cr.yae, then cr.yae_again until cr_done);
//      then, and after yn_done: the same as R3; R5. after the ending: her postgame scene;
//  R6. the first meeting, the letter and the rewards, line for line and state for state as on the parent, both
//      editions, each companion and none (the quest's clock stamp left out); no scene ended on an error from the runner.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

const FP_FLOOD = '0e5db1b236ea354b';
const FP_FIRST = '72f169ec2f41dcba';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);

  // ---- a minimal stage (as tests/unit/lf_council_fence.test.mjs) --------------------------------------------------
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
  if (RB.audio) { RB.audio.playSong = () => {}; RB.audio.stopSong = () => {}; }
  RB.challenge.run = async (id) => { asked.push(id); RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: o.ed || 2 });
    st.id = 'lf-tami-lines-test'; st.map = o.map || 'lf.council'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true }, o.flags || {});
    st.quests.lf_main = { stage: o.main === undefined ? 4 : o.main, done: false, t: 1 };
    st.inv = Object.assign({}, o.inv || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id) => { lines = []; asked = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines.slice(); };
  const talkOf = (map, id) => { s.map = map; RB.world.W.map = { id: map, def: C.maps[map] }; const n = (C.maps[map].npcs || []).find((x) => x.id === id); return n ? ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  const tami = async () => { const sc = talkOf('lf.council', 'lf_yae'); return { sc, lines: sc ? await run(sc) : [], asked: asked.slice() }; };
  const count = (ls, re) => ls.filter((l) => re.test(l.en)).length;

  const F = {
    l516: { jp: 'その {夜|よる} 、トウヤ は {鐘楼|しょうろう} の {鍵|かぎ} を {持|も}ち{出|だ}して 、{塔|とう} へ {走|はし}った 。{鐘|かね} は {鳴|な}った 。{下町|したまち} の {多|おお}く の {人|ひと} が 、{高|たか}い {所|ところ} へ {逃|に}げた 。{私|わたし} も ね 。',
      en: 'That night Tōya took the bell tower key and ran to the tower. The bell rang. Many people in the lower quarter fled to high ground. Me included.', key: 'lf.yae_minutes#fb9d9070ae' },
    l518: { jp: 'トウヤ は 、{戻|もど}らなかった 。', en: 'Tōya didn\'t come back.', key: 'lf.yae_minutes#7f18ab53ce' },
    old: ['lf.yae_minutes#e5a9e125f0', 'lf.yae_minutes#ec099d66ae'],
    note: { jp: 'カサネ の {弟|おとうと} 。{鐘|かね} を {鳴|な}らしに {塔|とう} へ {走|はし}った 。{下町|したまち} の {多|おお}く の {人|ひと} は {逃|に}げられた が 、トウヤ は {戻|もど}らなかった 。',
      en: 'Kasane\'s younger brother, a messenger. He ran to the tower to ring the warning bell. Many people in the lower quarter got out in time; Tōya did not come back. His last conversation with Kasane was an argument about that message.' },
  };
  const R = {
    l755: { jp: '{議会|ぎかい} は まだ {続|つづ}いて います よ 。{誰|だれ} も {賛成|さんせい} しない 。{素晴|すば}らしい 。', en: 'The council is still in session. Nobody agrees on anything. Marvellous.', key: 'lf.yae_after#e6cc3d8eb1' },
    ed1: { key: 'lf.yae_after#a82e9b0804', en: 'Rest in town before you go up the mountain. The inn can say "full" now, so book early.' },
    ed2: { jp: '{出発|しゅっぱつ} する {前|まえ} に 、{町|まち} で {休|やす}んで いきなさい 。{宿|やど} も 、もう {満室|まんしつ} と {言|い}える よう に なった から 、{早|はや}め に ね 。', en: 'Rest in town before you set off. The inn can say "full" now, so book early.', key: 'lf.yae_after#00ce50b6a1' },
    oldKey: 'lf.yae_after#fed918b663',
  };
  const RE = { l516: /^That night Tōya took the bell tower key/, many: /Many people in the lower quarter fled/, everyone: /Everyone in the lower quarter/, l518: /^Tōya didn't come back\.$/, only: /Only Tōya/,
    l755: /^The council is still in session\. Nobody agrees/, day3: /Day three/, ed1: /^Rest in town before you go up the mountain/, ed2: /^Rest in town before you set off/, letter: /^"Leaves with writing on them are washing up/ };
  const allSays = () => { const out = []; for (const id in C.scenes) for (const c of C.scenes[id].cmds) if (c.op === 'say' && c.jp) out.push(keyOf(id, c.jp)); return out; };

  // ---------------------------------------------------------------- the flood count ---------------------------------
  // F1
  {
    const c = C.scenes['lf.yae_minutes'].cmds;
    const i516 = c.findIndex((x) => x.op === 'say' && RE.l516.test(x.en || '')), i518 = c.findIndex((x) => x.op === 'say' && RE.l518.test(x.en || ''));
    const a516 = c[i516] || {}, a518 = c[i518] || {}, g = c[i518 - 1] || {};
    const keys = allSays();
    const src = fs.readFileSync(path.join(root, 'src', 'content', 'ch5', '22_main.js'), 'utf8');
    const a = { j516: a516.jp === F.l516.jp, e516: a516.en === F.l516.en, k516: keyOf('lf.yae_minutes', a516.jp), j518: a518.jp === F.l518.jp, e518: a518.en === F.l518.en, who518: a518.who, expr518: a518.expr,
      k518: keyOf('lf.yae_minutes', a518.jp), gesture: g.op === 'gesture' && flat(g.args), oldGone: F.old.every((k) => !keys.includes(k)),
      comment: /her head goes down again at "Tōya\n# didn't come back"/.test(src) && !/"Only Tōya/.test(src) };
    t.ok(a.j516 && a.e516 && a.k516 === F.l516.key && a.j518 && a.e518 && a.who518 === 'lf_yae' && a.k518 === F.l518.key && a.gesture === '["lf_yae","lowered","hold"]' && a.oldGone && a.comment,
      'F1 the flood lines: the agreed JP/EN, the new keys, the old keys said nowhere, her lowered head before the second, the staging comment quoting the new line ' + flat(a));
  }
  // F2
  {
    fresh({ main: 4, inv: { lf_minutes: 1 }, flags: { lf_bell_rung: false } });
    const r = await tami();
    const a = { sc: r.sc, l516: count(r.lines, RE.many), l518: count(r.lines, RE.l518), everyone: count(r.lines, RE.everyone), only: count(r.lines, RE.only), asked: r.asked, told: !!s.flags.lf_yae_told, main: s.quests.lf_main.stage,
      order: r.lines.findIndex((l) => RE.l516.test(l.en)) < r.lines.findIndex((l) => RE.l518.test(l.en)) };
    t.ok(a.sc === 'lf.yae_minutes' && a.l516 === 1 && a.l518 === 1 && a.everyone === 0 && a.only === 0 && a.order && flat(a.asked) === '["lf.ch_minutes"]' && a.told && a.main === 5,
      'F2 the minutes through to their exercise: the new lines once, in order, the old never; told, step 5 ' + flat(a));
  }
  // F3
  {
    fresh({ main: 4, inv: { lf_minutes: 1 } });
    const r = await tami();
    const has = r.sc === 'lf.yae_minutes' && (s.notebook || []).filter((e) => e.id === 'lf_toya').length === 1;
    const n = C.notes.lf_toya || {};
    const led = C.scenes['lf.stacks_ledger'].cmds.filter((x) => x.op === 'say').map((x) => x.en).join(' ');
    t.ok(has && n.jp === F.note.jp && n.en === F.note.en && /Twelve dead/.test(led),
      'F3 the note in both languages, given with the minutes; the ledger still "Twelve dead" ' + flat({ has, jp: n.jp === F.note.jp, en: n.en === F.note.en, ledger: /Twelve dead/.test(led) }));
  }
  // F4
  {
    const got = {};
    const mask = (ls) => ls.map((l) => (RE.l516.test(l.en) || RE.l518.test(l.en) || /^Only Tōya/.test(l.en) ? { who: l.who, masked: true } : l));
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) for (const bell of [false, true]) {
      fresh({ comp, main: 4, inv: { lf_minutes: 1 }, flags: bell ? { lf_bell_rung: true } : {} });
      got['minutes:' + comp + ':' + bell] = fp(mask((await tami()).lines));
      fresh({ comp, map: 'lf.stacks', main: 3, flags: bell ? { lf_bell_rung: true } : {} });
      got['ledger:' + comp + ':' + bell] = fp(await run('lf.stacks_ledger'));
      fresh({ comp, map: 'lf.town', flags: bell ? { lf_bell_rung: true } : {} });
      got['memorial:' + comp + ':' + bell] = fp(await run('lf.memorial'));
    }
    t.ok(fp(got) === FP_FLOOD, 'F4 the minutes (the two lines masked), the ledger and the memorial, line for line as on the parent, each companion and none, before and after the bell ' + flat({ fp: fp(got), n: Object.keys(got).length }));
  }

  // ---------------------------------------------------------------- the revisit -------------------------------------
  // R1
  {
    const sc = C.scenes['lf.yae_after'], c = sc.cmds, from = sc.labels.later;
    const later = c.slice(from).filter((x) => x.op === 'say');
    const l755 = later.find((x) => RE.l755.test(x.en || '')) || {}, e1 = later.find((x) => RE.ed1.test(x.en || '')) || {}, e2 = later.find((x) => RE.ed2.test(x.en || '')) || {};
    const keys = allSays();
    const lex = RB.lex && RB.lex.bySurface ? RB.lex.bySurface('三日目').length : -1;
    const a = { j755: l755.jp === R.l755.jp, e755: l755.en === R.l755.en, k755: keyOf('lf.yae_after', l755.jp), if755: l755.if || null, e1if: e1.if, e1key: keyOf('lf.yae_after', e1.jp), e1en: e1.en === R.ed1.en,
      e2if: e2.if, e2jp: e2.jp === R.ed2.jp, e2en: e2.en === R.ed2.en, e2key: keyOf('lf.yae_after', e2.jp), oldGone: !keys.includes(R.oldKey), day3: c.some((x) => x.op === 'say' && /三日目/.test(x.jp || '')), lex };
    t.ok(a.j755 && a.e755 && a.k755 === R.l755.key && !a.if755 && a.e1if === 'ed<2' && a.e1key === R.ed1.key && a.e1en && a.e2if === 'ed>=2' && a.e2jp && a.e2en && a.e2key === R.ed2.key && a.oldGone && !a.day3 && a.lex > 0,
      'R1 the revisit lines: 755 without "Day three" (new key), 756 split by edition (edition 1 key unchanged, edition 2 new); 三日目 still in the lexicon ' + flat(a));
  }
  // R2, R3
  for (const ed of [1, 2]) {
    fresh({ ed, main: 7, flags: { lf_bell_rung: true, lf_after_town: true } });
    const first = await tami();
    const called = !!s.flags.ko_called, quest = flat(s.quests.ko_main || null);
    const again = await tami();
    const a = { first: first.sc, again: again.sc, l755: count(again.lines, RE.l755), day3: count(again.lines, RE.day3), ed1: count(again.lines, RE.ed1), ed2: count(again.lines, RE.ed2),
      letter1: count(first.lines, RE.letter), letter: count(again.lines, RE.letter), called, quest2: flat(s.quests.ko_main || null) === quest, n: again.lines.length };
    const ok = a.first === 'lf.yae_after' && a.again === 'lf.yae_after' && a.l755 === 1 && a.day3 === 0 && a.n === 2 && a.letter === 0 && a.quest2 &&
      (ed === 1 ? a.ed1 === 1 && a.ed2 === 0 && a.letter1 === 0 && !a.called : a.ed1 === 0 && a.ed2 === 1 && a.letter1 === 1 && a.called);
    t.ok(ok, 'R' + (ed + 1) + ' edition ' + ed + ', an immediate repeat: the new 755 and ' + (ed === 1 ? 'the mountain line' : '"set off"; the letter not read again') + ' ' + flat(a));
  }
  // R4, R5
  {
    const got = {};
    const at = (f) => { fresh({ ed: 2, main: 7, flags: Object.assign({ lf_bell_rung: true, lf_after_town: true, ch5_done: true, ko_called: true }, f) }); s.quests.lf_main = { stage: 7, done: true, t: 1 }; };
    at({ ko_done: true }); got.ko_done = talkOf('lf.council', 'lf_yae');
    at({ ko_done: true, cr_yae_told: true }); got.cr_yae_told = talkOf('lf.council', 'lf_yae');
    for (const [k, f] of [['cr_done', { ko_done: true, cr_yae_told: true, cr_done: true }], ['yn_done', { ko_done: true, cr_yae_told: true, cr_done: true, yn_done: true }]]) {
      at(f);
      const r = await tami();
      got[k] = { sc: r.sc, l755: count(r.lines, RE.l755), ed2: count(r.lines, RE.ed2), ed1: count(r.lines, RE.ed1), day3: count(r.lines, RE.day3), n: r.lines.length };
    }
    fresh({ ed: 2, main: 7, flags: { lf_bell_rung: true, lf_after_town: true, ch5_done: true, postgame: true } });
    const p = await tami();
    t.ok(got.ko_done === 'cr.yae' && got.cr_yae_told === 'cr.yae_again' && [got.cr_done, got.yn_done].every((x) => x.sc === 'lf.yae_after' && x.l755 === 1 && x.ed2 === 1 && x.ed1 === 0 && x.day3 === 0 && x.n === 2) &&
      p.sc === 'lf.yae_post' && count(p.lines, RE.l755) === 0,
      'R4/R5 edition 2 after Kotonoha: her Cloudroad scenes first, as on the parent; then, and after yn_done, the new 755 and "set off"; after the ending, her postgame scene ' + flat({ got, post: p.sc }));
  }
  // R6
  {
    const got = {}, leaf = {};
    for (const ed of [1, 2]) for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ ed, comp, main: 7, flags: { lf_bell_rung: true, lf_after_town: true } });
      const r = await tami();
      leaf[ed + ':' + comp] = Object.prototype.hasOwnProperty.call(s.inv, 'ko_leaf_lf') ? s.inv.ko_leaf_lf : 'absent';
      // The one entry that differs from the parent: the call's quiet give of Kotonoha's leaf (edition 2), which the
      // parent read as a count of NaN (written as null) and now gives as one (RB.state.itemArgs; Cloud CC-561, CC-566).
      // The fingerprint keeps the parent's value for it; the check after it pins the new one.
      const inv = s.inv.ko_leaf_lf === 1 ? Object.assign({}, s.inv, { ko_leaf_lf: NaN }) : s.inv;
      got[ed + ':' + comp] = fp({ lines: r.lines, main: { stage: s.quests.lf_main.stage, done: s.quests.lf_main.done }, ch5: !!s.flags.ch5_done, inv, travel: s.travel || {} });
    }
    t.ok(fp(got) === FP_FIRST && !errors.length, 'R6 the first meeting, the letter and the rewards, line for line and state for state as on the parent, both editions, each companion and none; no scene error ' +
      flat({ fp: fp(got), n: Object.keys(got).length, errors }));
    const want = {};
    for (const ed of [1, 2]) for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) want[ed + ':' + comp] = ed === 2 ? 1 : 'absent';
    t.eq(leaf, want, 'R6 the call\'s quiet leaf: held as one in edition 2 (the parent held NaN, saved as null), not given in edition 1');
  }
  console.error = cerr;
};
