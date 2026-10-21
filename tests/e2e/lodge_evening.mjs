// RBN-QA-062 (Agnes 6312452003; Local CL-094/CL-096; Cloud CC-052/CC-053): after the registers, the warp to the lodge
// at night told "around Hisae's lamp, Mokichi's family and Kikyō are gathered" while they stood at their day places
// and you stayed at the cave's doorway. Now kr.evening places whoever is at the lodge tonight round the lamp (scene-
// owned, left there for the rest of the visit) and walks you and your companion to it before the line. In Chromium on
// the built game, from the registers themselves (kr.registers run as the desk runs it, its warp, kr.evening on entry):
//  1. at the gathering line: you at (20,7) facing the lamp, your companion beside you, Mokichi, Sora and (when she has
//     moved to the lodge) Kikyō round the lamp with Hisae; the lamp, Hisae and all of them in view, on a desktop
//     (1280 × 800) and a phone (390 × 844); without Kikyō at the lodge, no Kikyō;
//  2. each companion's branch (Ren, Nao, Mio, Suzu) runs as before, its choice answered (Ren goes up the ridge; the
//     others, answered the quiet way, make up), and ends with them still gathered; 12 s later they are still there;
//  3. talking to Mokichi where he stands runs his own scene (kr.mokichi); the way to Hisae is open;
//  4. the visit's end: leaving and coming back, or the game opened afresh with a save made there (one made while they
//     were gathered, and one made after coming back), finds them at their usual places (visit-only staging); a load
//     without leaving the map in the same session finds them as they stood; the evening is never told again; no page
//     errors.
// (Mokichi, Sora and Kikyō are placed round the lamp before the line, not seen walking there; you and your companion
// walk.)
// Usage: node tools/build.mjs && node tests/e2e/lodge_evening.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_moths_done: true, kr_lodge_seen: true,
  kr_stele_read: true, kr_rhyme_heard: true, kr_scroll_done: true, kr_cave2_open: true, kr_rite_done: true, kr_cave_lit: true, kr_ghost_calmed: true };

const where = (p) => p.evaluate(() => {
  const W = RB.world.W, cam = RB.render.cam, v = RB.render.viewSize();
  const inView = (x, y) => x * 16 + 8 >= cam.x + 8 && x * 16 + 8 <= cam.x + v.w - 8 && y * 16 + 8 >= cam.y + 8 && y * 16 + 8 <= cam.y + v.h - 8;
  const at = (id) => { const n = W.npcs.find((q) => q.id === id); return n ? { at: [n.x, n.y], dir: n.dir, seen: inView(n.x, n.y) } : null; };
  return { map: RB.game.s.map, pc: [W.player.x, W.player.y, W.player.dir], comp: W.comp ? [W.comp.x, W.comp.y] : null, lamp: inView(20, 8),
    hisae: at('kr_hisae_n'), mokichi: at('kr_mokichi'), sora: at('kr_sora'), kikyo: at('kr_kikyo') };
});
// from the registers to the end of the evening; the gathering line's moment recorded
async function evening(o) {
  const { p, errors } = await page(b, url, { viewport: o.viewport || { width: 1280, height: 800 } });
  await p.evaluate(([FL, o]) => {
    const f = Object.assign({}, FL, o.kikyo === false ? {} : { kr_kikyo_lodge: true });
    RB.game.debugStart('kr.cave3', 12, 5, { dir: 'up', edition: RB.edition.forNew(), comp: o.comp || 'suzu', flags: f });
    RB.state.setQuest(RB.game.s, 'kr_main', 5);
    RB.game.settings.textSpeed = 'instant';
    RB.script.run('kr.registers');
  }, [FL, o]);
  let line = null;
  for (let i = 0; i < 500; i++) {
    const st = await p.evaluate(() => ({ open: RB.ui.dialogue.isOpen(), text: (document.querySelector('.dlg, .dialogue') || {}).textContent || '', running: !!(RB.script.isRunning && RB.script.isRunning()), map: RB.game.s.map, seen: !!RB.game.s.flags.kr_evening_seen }));
    if (st.map === 'kr.lodge' && /gathered/.test(st.text) && !line) line = await where(p);
    if (st.open) await p.evaluate((pick) => { const cs = [...document.querySelectorAll('.choices button, .dchoice button')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else RB.ui.dialogue.advance(true); }, o.pick || 0);
    // (the evening told and over: between the registers' end on the lodge and kr.evening's start there is a moment with
    // nothing running and nothing open, Local CL-104)
    if (st.map === 'kr.lodge' && st.seen && !st.running && !st.open && i > 20) break;
    await p.waitForTimeout(80);
  }
  return { p, errors, line, end: await where(p) };
}
const gathered = (w, kikyo) => w && w.map === 'kr.lodge' && w.pc[0] === 20 && w.pc[1] === 7 && w.pc[2] === 'down' && w.lamp && w.hisae && w.hisae.seen
  && w.mokichi && w.mokichi.at.join() === '18,9' && w.mokichi.seen && w.sora && w.sora.at.join() === '19,10' && w.sora.seen
  && (kikyo ? w.kikyo && w.kikyo.at.join() === '22,9' && w.kikyo.seen : !w.kikyo);

// 1. desktop and phone, with and without Kikyō
for (const [name, viewport, kikyo] of [['desktop', { width: 1280, height: 800 }, true], ['phone', { width: 390, height: 844 }, true], ['desktop, Kikyō not at the lodge', { width: 1280, height: 800 }, false]]) {
  const r = await evening({ viewport, kikyo });
  ok(gathered(r.line, kikyo) && r.line.comp && Math.abs(r.line.comp[0] - 20) + Math.abs(r.line.comp[1] - 7) === 1, name + ': at the gathering line, you face the lamp with your companion beside you, and everyone there is round it, in view (' + JSON.stringify(r.line) + ')');
  ok(!r.errors.length, name + ': no page errors ' + r.errors.slice(0, 2).join(' | '));
  await r.p.close();
}
// 2. each companion's branch; still there 12 s later
for (const comp of ['ren', 'nao', 'mio', 'suzu']) {
  const r = await evening({ comp, pick: comp === 'ren' ? 0 : 1 });
  await r.p.waitForTimeout(12000);
  const later = await where(r.p);
  const branch = await r.p.evaluate(() => ({ apart: !!RB.game.s.flags.kr_apart, quarrel: !!RB.game.s.flags.kr_quarrel, made: !!RB.game.s.flags.kr_makeup_done, seen: !!RB.game.s.flags.kr_evening_seen }));
  // the branch's own outcome, from its choice: Ren goes up the ridge (kr_apart); the others, answered the quiet way,
  // make up there and then (kr_makeup_done, no quarrel)
  const answered = comp === 'ren' ? branch.apart && !branch.quarrel : branch.made && !branch.quarrel && !branch.apart;
  ok(gathered(r.end, true) && later.mokichi.at.join() === '18,9' && later.sora.at.join() === '19,10' && later.kikyo.at.join() === '22,9' && branch.seen && answered && !r.errors.length, comp + ': the branch runs as before, its choice answered ' + JSON.stringify(branch) + ', and 12 s later they are still round the lamp (' + JSON.stringify({ later }) + ')');
  // 3. Mokichi's own scene where he stands, and the way to Hisae open
  if (comp === 'suzu') {
    const talk = await r.p.evaluate(async () => {
      const W = RB.world.W, m = W.npcs.find((q) => q.id === 'kr_mokichi');
      const ran = [], run = RB.script.run;
      RB.script.run = function (id) { ran.push(id); return run.apply(this, arguments); };
      RB.world.W.player.x = 18; RB.world.W.player.y = 8; RB.world.W.player.dir = 'down';
      RB.world.interact();
      await new Promise((res) => setTimeout(res, 600));
      const said = RB.ui.dialogue.isOpen();
      for (let i = 0; i < 40 && (RB.ui.dialogue.isOpen() || (RB.script.isRunning && RB.script.isRunning())); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((res) => setTimeout(res, 80)); }
      W.player.x = 20; W.player.y = 7;
      const free = [[19, 9], [21, 9], [20, 10]].some(([x, y]) => !RB.world.blocked(x, y));
      RB.script.run = run;
      return { said, ran, at: [m.x, m.y], free };
    });
    ok(talk.said && talk.ran[0] === 'kr.mokichi' && talk.free, 'suzu: talking to Mokichi where he stands runs his scene, kr.mokichi; a tile beside Hisae is free (' + JSON.stringify(talk) + ')');
  }
  await r.p.close();
}
// 4. the visit ends: leaving and coming back, or the game opened afresh with a save made there, finds them at their
// usual places and the evening is not told again (visit-only staging, Agnes 6313056423); a load made without leaving
// the map, in the same session, finds them as they stood (the world keeps the figures already on the map)
{
  const r = await evening({ comp: 'suzu', pick: 1 });
  const same = await r.p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await new Promise((res) => setTimeout(res, 1500)); return { open: RB.ui.dialogue.isOpen() }; });
  const w0 = await where(r.p);
  ok(!same.open && w0.mokichi.at.join() === '18,9' && w0.sora.at.join() === '19,10', 'a load in the same session, without leaving the lodge: as they stood, the evening not told again (' + JSON.stringify({ mokichi: w0.mokichi.at, sora: w0.sora.at }) + ')');
  const back = await r.p.evaluate(async () => {
    await RB.game.transition('kr.ridge', 42, 10, 'left');
    await new Promise((res) => setTimeout(res, 800));
    await RB.game.transition('kr.lodge', 1, 18, 'right');
    await new Promise((res) => setTimeout(res, 1500));
    return { open: RB.ui.dialogue.isOpen(), running: !!(RB.script.isRunning && RB.script.isRunning()) };
  });
  const w1 = await where(r.p);
  ok(!back.open && !back.running && w1.mokichi.at.join() === '6,13' && w1.kikyo.at.join() === '24,13' && w1.hisae.at.join() === '20,9', 'leaving for the ridge and coming back: their usual places, Hisae at her lamp, the evening not told again (' + JSON.stringify({ back, mokichi: w1.mokichi.at, sora: w1.sora.at, kikyo: w1.kikyo.at }) + ')');
  await r.p.evaluate(async () => { await RB.save.manualSave(2); });
  // the game opened afresh, with each save: slot 1 made while they were gathered, slot 2 after coming back
  for (const [slot, when] of [[1, 'made while they were gathered'], [2, 'made after coming back']]) {
    await r.p.reload();
    await r.p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
    const fresh = await r.p.evaluate(async (slot) => { await RB.game.loadCampaign(slot, 'manual'); await new Promise((res) => setTimeout(res, 1500)); return { map: RB.game.s.map, pc: [RB.world.W.player.x, RB.world.W.player.y], open: RB.ui.dialogue.isOpen(), running: !!(RB.script.isRunning && RB.script.isRunning()) }; }, slot);
    const w2 = await where(r.p);
    ok(fresh.map === 'kr.lodge' && !fresh.open && !fresh.running && w2.mokichi.at.join() === '6,13' && w2.kikyo.at.join() === '24,13' && w2.hisae.at.join() === '20,9', 'the game opened afresh with the save ' + when + ': their usual places, the evening not told again (' + JSON.stringify({ fresh, mokichi: w2.mokichi.at, sora: w2.sora.at, kikyo: w2.kikyo.at }) + ')');
  }
  ok(!r.errors.length, 'the visit\'s end: no page errors ' + r.errors.slice(0, 2).join(' | '));
  await r.p.close();
}
console.log(`\nlodge_evening: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
