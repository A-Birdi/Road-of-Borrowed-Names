// The council after the bell and Kinu's fence (editorial row 1: Cloud CC-523 note 1 and CC-525; Agnes 6639995441;
// Local CL-689). The council (lf.yae_after) always had Kinu raise the fence and Tami wave it off to next week. But the
// fence is settled after the bell too, so it can be settled before the council meets. Now, with quest lf_fence done,
// Kinu doesn't raise it, Tami's flat hand towards her goes with it, and Tami says only "…Next item. The Archive up the
// mountain." (a new key, with no recording until voice work resumes). With the fence unsettled, nothing changes.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed), the fence settled through Kohei's own
// talk, and the council reached by Tami's own talk list:
//  1. the scene: the three commands' condition, the new line and its key;
//  2. the council with no fence quest, and with the fence at step 1, at step 2, and left at its exercise (step 3):
//     Kinu raises it, Tami's "Next week!" and her flat hand towards Kinu; not the new line;
//  3. the fence settled through Kohei, then the council: no Kinu, no "Next week!", no flat hand; the new line once, in
//     their place; every other line and cue as unsettled; the chapter ends as before;
//  4. the fence settled, a save and load, then the council: the same as 3;
//  5. the unsettled council line for line as on the parent (80cc31b), with each companion and none, in both editions;
//     the settled council is that, with the two lines replaced by the new one; Tami's later line ("The council's still
//     going") the same either way; no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

const FIRST_FP = '8d8f1d46b8e847af';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);

  // ---- a minimal stage (as tests/unit/lf_side_cancel.test.mjs) ----------------------------------------------------
  let lines = [], cues = [], cancel = new Set(), asked = [];
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
  if (RB.staging) {
    RB.staging.walkTo = async () => {};
    const cue0 = RB.staging.cue;
    RB.staging.cue = (ref, gid, o, ctx) => { cues.push(ref + ' ' + gid + ' ' + flat(o || {})); try { return cue0.call(RB.staging, ref, gid, o, ctx); } catch (e) { return null; } };
  }
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: o.ed || 2 });
    st.id = 'lf-council-fence-test'; st.map = o.map || 'lf.council'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true,
      lf_bell_rung: true, lf_after_town: true }, o.flags || {});
    st.quests.lf_main = { stage: 7, done: false, t: 1 };
    for (const [k, v] of Object.entries(o.quests || {})) st.quests[k] = typeof v === 'object' ? v : { stage: v, done: false, t: 1 };
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; cues = []; asked = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const talkOf = (map, id) => { s.map = map; RB.world.W.map = { id: map, def: C.maps[map] }; const n = (C.maps[map].npcs || []).find((x) => x.id === id && (!x.if || S.test(s, x.if))); return n ? ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  const talk = async (map, id, o) => { const sc = talkOf(map, id); await run(sc, o); return sc; };
  const council = async () => { const sc = await talk('lf.council', 'lf_yae'); return { sc, lines: lines.slice(), cues: cues.slice() }; };
  const settle = async (o) => { const sc = await talk('lf.gardens', 'lf_kohei', o); return sc; };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));
  const q = (id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : '-');

  const NEW = { jp: '…… {次|つぎ} 。{山|やま} の {上|うえ} の {書庫|しょこ} の こと 。', en: '…Next item. The Archive up the mountain.' };
  const B = { kinu: /^Madam Chair, regarding the fence!$/, nextWeek: /^Next week! …Next item\. The Archive up the mountain\.$/, next: /^…Next item\. The Archive up the mountain\.$/,
    later: /The council is still in session|still going|Day three/ };
  const count = (ls, re) => ls.filter((l) => re.test(l.en)).length;
  const palm = (cs) => cs.filter((c) => /^lf_yae palm /.test(c) && /lf_kinu/.test(c)).length;
  const view = (r) => ({ sc: r.sc, kinu: count(r.lines, B.kinu), nextWeek: count(r.lines, B.nextWeek), next: count(r.lines, B.next), palm: palm(r.cues), n: r.lines.length });

  // 1. the scene
  {
    const sc = C.scenes['lf.yae_after'], c = sc.cmds;
    const kinu = c.find((x) => x.op === 'say' && x.who === 'lf_kinu' && B.kinu.test(x.en));
    const old = c.find((x) => x.op === 'say' && x.who === 'lf_yae' && B.nextWeek.test(x.en));
    const nu = c.filter((x) => x.op === 'say' && x.who === 'lf_yae' && B.next.test(x.en));
    const g = c.find((x) => x.op === 'gesture' && x.args[0] === 'lf_yae' && x.args[1] === 'palm' && x.args[2] === 'lf_kinu');
    const i = c.indexOf(kinu);
    const a = { kinu: kinu && kinu.if, palm: g && g.if, old: old && old.if, nu: nu.map((x) => ({ if: x.if, jp: x.jp, en: x.en })), order: [c.indexOf(g) - i, c.indexOf(old) - i, c.indexOf(nu[0]) - i],
      key: nu[0] && keyOf('lf.yae_after', nu[0].jp), oldKey: old && keyOf('lf.yae_after', old.jp) };
    t.ok(a.kinu === '!quest.lf_fence=done' && a.palm === '!quest.lf_fence=done' && a.old === '!quest.lf_fence=done' && nu.length === 1 && a.nu[0].if === 'quest.lf_fence=done' &&
      a.nu[0].jp === NEW.jp && a.nu[0].en === NEW.en && flat(a.order) === '[1,2,3]' && a.key !== a.oldKey,
      '1 the scene: Kinu\'s line, Tami\'s flat hand and her "Next week!" while unsettled; the new line once settled, straight after; a new key ' + flat(a));
  }

  // 2. unsettled: no fence quest; step 1; step 2; left at its exercise (step 3)
  {
    const got = {};
    fresh();
    got.none = Object.assign(view(await council()), { q: q('lf_fence') });
    fresh({ quests: { lf_fence: 1 } });
    got.step1 = Object.assign(view(await council()), { q: q('lf_fence') });
    fresh({ quests: { lf_fence: 2 } });
    got.step2 = Object.assign(view(await council()), { q: q('lf_fence') });
    fresh({ quests: { lf_fence: 2 } });
    const k = await settle({ cancel: ['lf.ch_fence'] });
    got.left = Object.assign(view(await council()), { k, asked: asked.length, q: q('lf_fence') });
    const ok = Object.values(got).every((v) => v.sc === 'lf.yae_after' && v.kinu === 1 && v.nextWeek === 1 && v.next === 0 && v.palm === 1);
    t.ok(ok && got.none.q === '-' && got.step1.q === 1 && got.step2.q === 2 && got.left.k === 'lf.fence_talk' && got.left.q === 3,
      '2 unsettled (no quest, step 1, step 2, left at the exercise): Kinu raises it, Tami\'s "Next week!" and flat hand; not the new line ' + flat(got));
  }

  // 3. settled through Kohei, then the council
  {
    fresh({ quests: { lf_fence: 2 } });
    const u = await council();
    fresh({ quests: { lf_fence: 2 } });
    const k = await settle();
    const fq = q('lf_fence');
    const r = await council();
    const a = Object.assign(view(r), { k, fq, done: !!s.flags.ch5_done, main: q('lf_main') });
    const iu = u.lines.findIndex((l) => B.kinu.test(l.en));
    const expect = u.lines.slice(0, iu).concat([{ who: 'lf_yae', en: NEW.en }], u.lines.slice(iu + 2));
    const sameLines = r.lines.length === expect.length && r.lines.every((l, i) => l.who === expect[i].who && l.en === expect[i].en && (i === iu || l.jp === expect[i].jp));
    const ip = u.cues.findIndex((c) => /^lf_yae palm /.test(c) && /lf_kinu/.test(c));
    const sameCues = flat(r.cues) === flat(u.cues.slice(0, ip).concat(u.cues.slice(ip + 1)));
    const nl = r.lines[iu] || {};
    t.ok(a.k === 'lf.fence_talk' && a.fq === 'done' && a.sc === 'lf.yae_after' && a.kinu === 0 && a.nextWeek === 0 && a.next === 1 && a.palm === 0 && nl.who === 'lf_yae' &&
      nl.en === NEW.en && RB.jp.plain(nl.jp).replace(/\s+/g, '') === RB.jp.plain(NEW.jp).replace(/\s+/g, '') && sameLines && sameCues && a.done && a.main === 'done',
      '3 settled through Kohei, then the council: no Kinu, no "Next week!", no flat hand; the new line once, in their place; every other line and cue as unsettled; the chapter ends ' +
      flat(Object.assign(a, { at: iu, sameLines, sameCues, n: [u.lines.length, r.lines.length] })));
  }

  // 4. settled, a save and load, then the council
  {
    fresh({ quests: { lf_fence: 1 } });
    await settle();
    const fq = q('lf_fence');
    loadSave(saved());
    const a = Object.assign(view(await council()), { fq, fq2: q('lf_fence') });
    t.ok(a.fq === 'done' && a.fq2 === 'done' && a.kinu === 0 && a.nextWeek === 0 && a.next === 1 && a.palm === 0,
      '4 settled from step 1, a save and load, then the council: the same as 3 ' + flat(a));
  }

  // 5. line for line: the unsettled council as on the parent; the settled one as that with the new line; Tami later
  {
    const got = {}, ok = [];
    for (const ed of [1, 2]) for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ ed, comp, quests: { lf_fence: 2 } });
      const u = await council();
      got['council:' + ed + ':' + comp] = fp(u.lines);
      const ul = await council();
      got['later:' + ed + ':' + comp] = fp(ul.lines);
      fresh({ ed, comp, quests: { lf_fence: 2 } });
      await settle();
      const r = await council();
      const iu = u.lines.findIndex((l) => B.kinu.test(l.en));
      const want = u.lines.slice(0, iu).concat([r.lines[iu]], u.lines.slice(iu + 2));
      const rl = await council();
      ok.push({ ed, comp, settled: fp(r.lines) === fp(want) && B.next.test((r.lines[iu] || {}).en), later: ul.sc === 'lf.yae_after' && fp(rl.lines) === fp(ul.lines) && count(rl.lines, B.kinu) === 0 });
    }
    t.ok(fp(got) === FIRST_FP && ok.every((x) => x.settled && x.later) && !errors.length,
      '5 the unsettled council and Tami\'s later line, line for line as on the parent, each companion and none, both editions; settled, the same with the new line in their place; no scene error ' +
      flat({ fp: fp(got), n: Object.keys(got).length, bad: ok.filter((x) => !x.settled || !x.later), errors }));
  }
};
