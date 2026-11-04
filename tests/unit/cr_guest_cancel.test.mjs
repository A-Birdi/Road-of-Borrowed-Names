// Otaki's guest book: "Come back later" is not the book read (Agnes 6642343825; Cloud CC-529; Local CL-697; Agnes
// 6643111905). The settlement ran its reading exercise and went on, whatever it returned, to the reconciliation
// (Otaki, Seibe and Tatsu), the book taken back, the quest done and the companion's line. Now the exercise is
// followed by `?(var._res=0) !end`, and her talk entry for a held book (src/content/cr/25_side.js) offers it again.
// With synthetic campaigns only: the real scene runner (the dialogue stubbed), the scene reached through her own talk
// list, the exercise answered or cancelled by the test as the runner returns it, saves round-tripped through the
// save's own migration:
//  1. the scene: the guard straight after the exercise, before the reconciliation;
//  2. a cancel: her two opening lines only; the book kept, step 1, no reconciliation, no companion's line, Tatsu still
//     there, and her talk still offers the book;
//  3. then the retry through her talk: the reconciliation and the companion's line once, the book taken, the quest
//     done, Tatsu gone; then her usual talk;
//  4. cancelled twice, a save and load, then done: everything once;
//  5. a result left over from another exercise changes nothing;
//  6. a held book after the chapter's end (cr_done): her talk still offers it ahead of her after-chapter line; a
//     cancel keeps it; then done;
//  7. a save that settled it before: her usual talk, no exercise;
//  8. the first-time path line for line as on the parent with each companion and none (fingerprints taken on the
//     parent, bc7a861); Suzu's line shown in her Kansai when that is her setting; no scene ended on an error from
//     the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/lf_side_cancel.test.mjs) ----------------------------------------------------
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
  if (!RB.game.G.settings) RB.game.G.settings = {};
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  // at Nakayama with the book back from Sakashita (step 1), the station reached
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'cr-guest-cancel-test'; st.map = 'cr.nakayama'; st.comp = o.comp === undefined ? 'mio' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, cr_called: true, cr_st4: true, cr_guest_started: true, cr_guest_found: true }, o.flags || {});
    st.quests.cr_guest = o.done ? { stage: 1, done: true, t: 1 } : { stage: 1, done: false, t: 1 };
    st.inv = Object.assign({}, o.done ? {} : { cr_guestbook: 1 });
    st.vars = Object.assign({}, o.vars || {});
    RB.game.settings.suzuSpeech = o.speech || 'standard';
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const talk = (map, id) => { const n = (C.maps[map].npcs || []).find((x) => x.id === id && (!x.if || S.test(s, x.if))); return n ? ((Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  const tatsu = () => (C.maps['cr.nakayama'].npcs || []).some((n) => n.id === 'cr_tatsu' && (!n.if || S.test(s, n.if)));
  const said = (re) => lines.some((l) => re.test(l.en));
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const B = { open: /The guest book! Thank goodness/, seibe: /The Take stays open at night/, tatsu: /It's my fault for being late/, comp: /Read what's written|Both being right|The record's back|A ledger never lies/ };
  const st = () => ({ book: (s.inv && s.inv.cr_guestbook) || 0, quest: s.quests.cr_guest.done ? 'done' : s.quests.cr_guest.stage, tatsu: tatsu() });
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  // 1. the scene
  {
    const cmds = C.scenes['cr.guest_settle'].cmds, i = cmds.findIndex((c) => c.op === 'challenge' && c.args[0] === 'cr.guest_book');
    const firstSay = cmds.slice(i + 1).findIndex((c) => c.op === 'say');
    t.ok(i > 0 && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0' && firstSay === 1,
      '1 the scene: the guard straight after the exercise, before the reconciliation ' + flat({ i, next: cmds[i + 1] }));
  }

  // 2 and 3. a cancel; then the retry through her talk
  {
    fresh();
    const r0 = talk('cr.nakayama', 'cr_otaki');
    await run(r0, { cancel: ['cr.guest_book'] });
    const a = Object.assign(st(), { r0, asked: asked.slice(), open: said(B.open), seibe: said(B.seibe), comp: said(B.comp), n: lines.length, r1: talk('cr.nakayama', 'cr_otaki') });
    await run(a.r1);
    const b = Object.assign(st(), { asked: asked.slice(), open: said(B.open), seibe: count(B.seibe), tatsuLine: count(B.tatsu), comp: count(B.comp), r2: talk('cr.nakayama', 'cr_otaki') });
    t.ok(a.r0 === 'cr.guest_settle' && flat(a.asked) === '["cr.guest_book"]' && a.open && a.n === 2 && !a.seibe && !a.comp && a.book === 1 && a.quest === 1 && a.tatsu && a.r1 === 'cr.guest_settle',
      '2 a cancel: her two opening lines only; the book kept, step 1, no reconciliation, no companion\'s line, Tatsu still there, her talk still offers the book ' + flat(a));
    t.ok(flat(b.asked) === '["cr.guest_book"]' && b.open && b.seibe === 1 && b.tatsuLine === 1 && b.comp === 1 && b.book === 0 && b.quest === 'done' && !b.tatsu && b.r2 === 'cr.otaki',
      '3 then the retry: the reconciliation and the companion\'s line once, the book taken, the quest done, Tatsu gone; then her usual talk ' + flat(b));
  }

  // 4. cancelled twice, a save and load, then done
  {
    fresh();
    let seibe = 0;
    await run(talk('cr.nakayama', 'cr_otaki'), { cancel: ['cr.guest_book'] }); seibe += count(B.seibe);
    await run(talk('cr.nakayama', 'cr_otaki'), { cancel: ['cr.guest_book'] }); seibe += count(B.seibe);
    loadSave(saved());
    const r = talk('cr.nakayama', 'cr_otaki');
    await run(r); seibe += count(B.seibe);
    const a = Object.assign(st(), { r, seibe });
    t.ok(a.r === 'cr.guest_settle' && a.seibe === 1 && a.quest === 'done' && a.book === 0, '4 cancelled twice, a save and load, then done: everything once ' + flat(a));
  }

  // 5. a result left over from another exercise changes nothing
  {
    fresh({ vars: { _res: 0 } });
    await run('cr.guest_settle');
    const a = st();
    fresh({ vars: { _res: 1 } });
    await run('cr.guest_settle', { cancel: ['cr.guest_book'] });
    const b = Object.assign(st(), { seibe: said(B.seibe) });
    t.ok(a.quest === 'done' && b.quest === 1 && b.book === 1 && !b.seibe, '5 a stale result of 0 before a reading, and of 1 before a cancel, change nothing ' + flat({ a, b }));
  }

  // 6. a held book after the chapter's end
  {
    fresh({ flags: { cr_done: true } });
    const r0 = talk('cr.nakayama', 'cr_otaki');
    await run(r0, { cancel: ['cr.guest_book'] });
    const a = Object.assign(st(), { r0, r1: talk('cr.nakayama', 'cr_otaki') });
    await run(a.r1);
    const b = Object.assign(st(), { r2: talk('cr.nakayama', 'cr_otaki') });
    t.ok(a.r0 === 'cr.guest_settle' && a.book === 1 && a.quest === 1 && a.r1 === 'cr.guest_settle' && b.quest === 'done' && b.book === 0 && b.r2 === 'cr.otaki_after',
      '6 after the chapter\'s end: her talk offers the held book ahead of her after-chapter line; a cancel keeps it; then done, then her after-chapter line ' + flat({ a, b }));
  }

  // 7. a save that settled it before
  {
    fresh({ done: true });
    const r = talk('cr.nakayama', 'cr_otaki');
    await run(r);
    t.ok(r === 'cr.otaki' && asked.length === 0, '7 a save that settled it before: her usual talk, no exercise ' + flat({ r, asked }));
  }

  // 8. the first-time path, line for line as before; Suzu's Kansai
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp });
      await run(talk('cr.nakayama', 'cr_otaki'));
      got[String(comp)] = fp(lines);
    }
    fresh({ comp: 'suzu', speech: 'kansai' });
    await run(talk('cr.nakayama', 'cr_otaki'));
    // (the runner hands the line on under her own name; the dialogue box applies her setting when it shows it)
    const mine = lines.find((l) => /A ledger never lies/.test(l.en));
    const shown = mine && RB.dialect && RB.dialect.line ? RB.dialect.line(mine.who, { jp: mine.jp, en: mine.en }) : null;
    const kansai = !!(shown && shown.dia === 'kansai' && /つかへん/.test(shown.jp));
    t.ok(fp(got) === FIRST_FP && kansai, '8 the first-time path, line for line as on the parent with each companion and none; Suzu\'s line in her Kansai ' + flat({ fp: fp(got), kansai }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (bc7a861): the first-time path's lines with each companion and none
const FIRST_FP = '4790cbb616101398';
