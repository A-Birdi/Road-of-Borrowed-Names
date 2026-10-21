// RBN-QA-061 (Agnes 6312435506; proposal agreed by Local CL-095 and Cloud CC-052): after the registers, the night at the
// lodge said "Keep the vigil at the lodge, through the night" but its next step was the Room of Wicks, "no way there from
// here just now": the vigil is reached only through Hisae's own warp. Stage 6 now names, while the evening is not yet
// done, whoever brings the vigil about: Ren at the ridge's lamp once Hisae has said where he went (Ren's route), and
// otherwise Hisae at her lamp. In Chromium on the built game, reading the guide (the Next line, its targets):
//  1. Ren: before Hisae has told you, Hisae; told, Ren on the ridge; back together, Hisae;
//  2. Suzu, Mio and Nao: in a quarrel not yet made up, Hisae; made up (or the quiet branch), Hisae;
//  3. after Hisae's warp into the Room of Wicks (the evening done): no authored step, derived as before;
//  4. never "no way there" before the vigil; each target is live (its NPC is there in this state); reading the guide
//     changes no flag or quest; a save and load keeps the same answer; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_vigil.mjs
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


const KR = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_moths_done: true, kr_moths_kept: true, kr_juzo_met: true, kr_lodge_seen: true,
  kr_stele_read: true, kr_rhyme_heard: true, kr_scroll_done: true, kr_cave2_open: true, kr_rite_done: true, kr_cave_lit: true, kr_ghost_calmed: true,
  // (as the registers leave it: read, night, back at the lodge, the evening seen)
  kr_registers_read: true, kr_night: true, kr_evening_seen: true };
const at = (f) => Object.assign({}, KR, f);
// (on CC-011 these states read "Next: The Room of Wicks — no way there from here just now.", Agnes's report)
const hisae = (r) => r.how === 'authored' && r.targets.length === 1 && r.targets[0].indexOf('kr.lodge:kr_hisae_n') === 0 && !nowhere(r) && r.live && r.pure;
// 1. Ren
{
  const before = await guide('kr.lodge', 20, 6, at({ kr_apart: true, kr_ren_lamp_known: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp: 'ren' });
  ok(hisae(before), 'Ren, before Hisae has told you: Hisae at her lamp (' + sum(before) + ')');
  const told = await guide('kr.lodge', 20, 6, at({ kr_apart: true, kr_ren_lamp_known: true, kr_hisae_told_ren: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp: 'ren' });
  ok(told.how === 'authored' && told.targets.length === 1 && told.targets[0].indexOf('kr.ridge:kr_ren_n') === 0 && !nowhere(told) && told.live && told.pure, 'Ren, Hisae has told you: Ren at the ridge\'s lamp (' + sum(told) + ')');
  const back = await guide('kr.lodge', 20, 6, at({ kr_apart: true, kr_ren_lamp_known: true, kr_hisae_told_ren: true, kr_ren_back: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp: 'ren' });
  ok(hisae(back), 'Ren, back together: Hisae at her lamp (' + sum(back) + ')');
  const saved = await guide('kr.lodge', 20, 6, at({ kr_apart: true, kr_ren_lamp_known: true, kr_hisae_told_ren: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp: 'ren', save: true });
  ok(saved.targets.length === 1 && saved.targets[0].indexOf('kr.ridge:kr_ren_n') === 0, 'after a save and load: the same answer (' + sum(saved) + ')');
}
// 2. Suzu, Mio, Nao
for (const comp of ['suzu', 'mio', 'nao']) {
  const quarrel = await guide('kr.lodge', 20, 6, at({ kr_quarrel: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp });
  const made = await guide('kr.lodge', 20, 6, at({ kr_quarrel: true, kr_makeup_done: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp });
  const quiet = await guide('kr.lodge', 20, 6, at({ kr_makeup_done: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp });
  ok(hisae(quarrel) && hisae(made) && hisae(quiet), comp + ': in a quarrel, made up, or the quiet branch: Hisae at her lamp (' + JSON.stringify([quarrel, made, quiet].map((r) => r.targets.concat(r.next))) + ')');
}
// 3. after the warp
{
  const r = await guide('kr.vigil', 9, 10, at({ kr_makeup_done: true, kr_evening_done: true }), [['kr_main', 6]], 'kr_main', { chapter: 7, comp: 'suzu' });
  ok(r.how !== 'authored' && !nowhere(r) && r.pure, 'after Hisae\'s warp (in the Room of Wicks, the evening done): no authored step, derived as before (' + sum(r) + ')');
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
console.log(`\nguide_vigil: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
