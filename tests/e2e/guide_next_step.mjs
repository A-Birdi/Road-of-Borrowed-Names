// RBN-QA-045 (Agnes; four-stage data-only scope agreed by Agnes 6310021858, Local CL-075, Cloud CC-044): the guide named
// a later, unreachable step ("… no way there from here just now") while the step in front of you was still to do. Each
// of these stages now names its own next step while it is undone (`atIf`), then the derivation as before. In Chromium on
// the built game, reading the guide (the Next line, its targets, the markers):
//  1. sb_lamp 6: the ice on the Star Stair until it is melted, from the inn and from the hamlet; after the thaw, the
//     observatory's dial as before;
//  2. sb_lamp 7: the observing log in the chart room until it is read; after it, not the log;
//  3. kr_main 4: all eight combinations of the rite's three tellings: the first one missing, in the rite's order (the
//     stele, Hinata's song, Kikyō on the ridge, or at the lodge once she has moved there); all three: the rite's desk in
//     the cave as before; never the Deepest Shelves, never "no way there";
//  4. kr_main 5: the Teller's Shadow in the Copying Room until it lets you by; after it, the registers as before;
//  5. each target is live (its NPC is there in this state); reading the guide changes no flag or quest; a save and load
//     keeps the same answer; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_next_step.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);

async function guide(map, x, y, flags, quests, qid, o = {}) {
  return p.evaluate(async ([map, x, y, flags, quests, qid, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp: o.comp || 'suzu', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    if (o.chapter != null) s.chapter = o.chapter;
    for (const w of o.words || []) if (!s.words.includes(w)) s.words.push(w);
    RB.game.settings.textSpeed = 'instant';
    let t = Date.now() - 100000;
    for (const [q, v] of quests) { RB.state.setQuest(s, q, v); s.quests[q].t = (t += 1000); }
    if (o.save) { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); }
    const S = RB.game.s;
    RB.questGuide.reset(); RB.questMarks.refresh();
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); }
    RB.questMarks.refresh();
    await new Promise((r) => setTimeout(r, 200));
    const before = JSON.stringify([S.flags, S.quests]);
    const G = RB.questGuide, r = G.targets(qid);
    const next = G.nextLines(r).map((l) => l.en);
    const marks = RB.questMarks.marks().marks.map((k) => ({ kind: k.kind, id: k.id, tx: k.tx, ty: k.ty, dir: k.dir }));
    const after = JSON.stringify([S.flags, S.quests]);
    const live = r.targets.every((tg) => {
      if (tg.kind !== 'npc') return true;
      const n = (RB.content.maps[tg.map].npcs || []).find((q) => q.id === tg.id);
      return !!n && (!n.if || RB.state.test(S, n.if));
    });
    return { how: r.how, stage: S.quests[qid].stage, targets: r.targets.map((tg) => tg.map + ':' + (tg.id || tg.p || tg.kind) + (tg.x != null ? '@' + tg.x + ',' + tg.y : '')), next, marks, pure: before === after, live };
  }, [map, x, y, flags, quests, qid, o]);
}
const nowhere = (r) => r.next.some((l) => /no way there/i.test(l));
const sum = (r) => JSON.stringify({ how: r.how, targets: r.targets, next: r.next, marks: r.marks.slice(0, 3) });

// 1. sb_lamp 6
const SB = { ch3_done: true, departed: true, sb_hamlet_seen: true, sb_arrived: true, sb_storm: true, sb_hearth_done: true, sb_morning: true, sb_obs_open: true };
{
  const inn = await guide('sb.inn', 7, 8, SB, [['sb_lamp', 6]], 'sb_lamp', { words: ['honoo'] });
  ok(inn.targets.includes('sb.hamlet:sb_icewall@30,1') && !nowhere(inn) && inn.next.some((l) => /the ice/.test(l)), 'sb_lamp 6, in the inn after the key: the ice on the Star Stair, not the dial (' + sum(inn) + ')');
  const out = await guide('sb.hamlet', 35, 9, SB, [['sb_lamp', 6]], 'sb_lamp', { words: ['honoo'] });
  ok(out.targets.includes('sb.hamlet:sb_icewall@30,1') && !nowhere(out) && out.marks.length > 0, 'sb_lamp 6, in the hamlet: the ice, marked (' + sum(out) + ')');
  const thaw = await guide('sb.hamlet', 30, 2, Object.assign({}, SB, { sb_stair_open: true }), [['sb_lamp', 6]], 'sb_lamp', { words: ['honoo'] });
  ok(thaw.how !== 'authored' && thaw.targets.some((t) => /^sb\.obs_hall:/.test(t)) && !thaw.targets.some((t) => /icewall/.test(t)), 'sb_lamp 6, after the thaw: the observatory\'s dial, as before (' + sum(thaw) + ')');
  ok([inn, out, thaw].every((r) => r.pure && r.live), 'sb_lamp 6: reading the guide changes nothing; targets live');
}
// 2. sb_lamp 7
{
  const SB7 = Object.assign({}, SB, { sb_stair_open: true, sb_dial1: true });
  const log = await guide('sb.obs_hall', 10, 3, SB7, [['sb_lamp', 7]], 'sb_lamp', { words: ['honoo'] });
  ok(log.targets.includes('sb.obs_charts:sb_starchart@4,5') && !nowhere(log), 'sb_lamp 7, before the log is read: the observing log in the chart room (' + sum(log) + ')');
  const read = await guide('sb.obs_charts', 8, 9, Object.assign({}, SB7, { sb_log_solved: true }), [['sb_lamp', 7]], 'sb_lamp', { words: ['honoo'] });
  ok(read.how !== 'authored' && !read.targets.includes('sb.obs_charts:sb_starchart@4,5'), 'sb_lamp 7, the log read: on up, as derived, not the log (' + sum(read) + ')');
  ok(log.pure && read.pure && log.live && read.live, 'sb_lamp 7: reading the guide changes nothing; targets live');
}
// 3. kr_main 4: the rite's three tellings, all eight combinations (and Kikyō on the ridge or at the lodge)
const KR = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_moths_done: true, kr_moths_kept: true, kr_juzo_met: true, kr_lodge_seen: true };
for (let k = 0; k < 8; k++) {
  const stele = !!(k & 1), rhyme = !!(k & 2), scroll = !!(k & 4);
  for (const lodge of scroll ? [true] : [false, true]) {
    const f = Object.assign({}, KR, stele ? { kr_stele_read: true } : {}, rhyme ? { kr_rhyme_heard: true } : {}, scroll ? { kr_scroll_done: true } : {}, lodge ? { kr_kikyo_met: true, kr_ridge_ghost_done: true, kr_kikyo_lodge: true } : {});
    const r = await guide('kr.ridge', 29, 12, f, [['kr_main', 4]], 'kr_main', { chapter: 7 });
    const want = !stele ? 'kr.ridge:kr_stele@14,8' : !rhyme ? 'kr.fox:kr_hinata' : !scroll ? (lodge ? 'kr.lodge:kr_kikyo' : 'kr.ridge:kr_kikyo') : null;
    const label = 'kr_main 4, ' + ['stele', 'song', 'scroll'].filter((n, i) => k & (1 << i)).join('+') + (k ? '' : 'none') + ' in hand' + (!scroll ? (lodge ? ', Kikyō at the lodge' : ', Kikyō on the ridge') : '');
    if (want) ok(r.targets.length && r.targets[0].indexOf(want) === 0 && !nowhere(r) && r.live && r.pure, label + ': ' + want + ' (' + sum(r) + ')');
    else ok(r.targets.some((t) => /^kr\.cave1:/.test(t)) && !r.targets.some((t) => /^kr\.cave3:/.test(t)) && !r.next.some((l) => /Deepest Shelves/.test(l)) && r.pure, label + ': the rite\'s desk in the cave, as before (' + sum(r) + ')');
  }
}
// 4. kr_main 5
{
  const K5 = Object.assign({}, KR, { kr_stele_read: true, kr_rhyme_heard: true, kr_scroll_done: true, kr_kikyo_lodge: true, kr_rite_done: true });
  const gate = await guide('kr.cave2', 14, 20, K5, [['kr_main', 5]], 'kr_main', { chapter: 7 });
  ok(gate.targets.includes('kr.cave2:spot@22,4') && !nowhere(gate) && !gate.next.some((l) => /Deepest Shelves/.test(l)), 'kr_main 5, before the Teller\'s Shadow: the Shadow at the Copying Room\'s stairs (' + sum(gate) + ')');
  const by = await guide('kr.cave2', 14, 20, Object.assign({}, K5, { kr_cave2_open: true }), [['kr_main', 5]], 'kr_main', { chapter: 7 });
  ok(by.how !== 'authored' && by.targets.some((t) => /^kr\.cave3:/.test(t)), 'kr_main 5, the Shadow passed: the registers, as before (' + sum(by) + ')');
  ok(gate.pure && by.pure, 'kr_main 5: reading the guide changes nothing');
}
// 5. after a save and load
{
  const r = await guide('kr.ridge', 29, 12, Object.assign({}, KR, { kr_stele_read: true }), [['kr_main', 4]], 'kr_main', { chapter: 7, save: true });
  ok(r.targets.length && r.targets[0].indexOf('kr.fox:kr_hinata') === 0 && !nowhere(r), 'after a save and load: the same next step (Hinata) (' + sum(r) + ')');
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
console.log(`\nguide_next_step: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
