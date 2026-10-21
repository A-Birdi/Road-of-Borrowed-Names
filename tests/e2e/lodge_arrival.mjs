// RBN-QA-052 (Agnes; Local's walk-in, CL-069): arriving at the Keepers' Lodge (kr.lodge_arrive, first visit), in
// Chromium on the built game, walking in from the ridge as in play (the real exit, the map's onEnter):
//  1. "Out of the maples…" is said where the road comes in (1,18);
//  2. then you walk in under the broken walls to (15,12), facing up (Agnes's refinement: clear of the stele, the dark
//     lantern and Sora's spot), your companion with you (the integrated `!walkto … party max=`), the walk made (no
//     fallback);
//  3. for "In the middle of the broken walls a single lamp is lit…" and the companion's line, the lit lamp (20,8) and
//     Hisae (20,10) are on screen, on a desktop and on a phone (before, they were off its edge);
//  4. the scene ends as before (kr_lodge_seen, the quest's next step) and you walk on from there; reduced motion
//     too; no page errors;
//  5. (Agnes) entering again: no scene; at night after the cave: kr.evening as before, no walk-in; with your companion
//     away (kr_apart): the walk-in alone, nobody brought; a load during the walk: the loaded journey, nothing walking.
// Usage: node tools/build.mjs && node tests/e2e/lodge_arrival.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true };

async function run(comp, o = {}) {
  const { p, errors } = await page(b, url, { viewport: o.vp || { width: 1180, height: 757 } });
  await p.evaluate(([comp, FL, o]) => {
    RB.game.debugStart('kr.ridge', 42, 10, { comp, dir: 'right', flags: FL });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = !!o.reduced; RB.game.applySettings();
  }, [comp, FL, o]);
  await p.waitForTimeout(900);
  const fb0 = await p.evaluate(() => RB.staging.stats().walkFallbacks);
  // the real exit onto the lodge's map
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(450); await p.keyboard.up('ArrowRight');
  const look = () => p.evaluate(() => {
    const W = RB.world.W, cam = RB.render.cam, v = RB.render.viewSize();
    const inView = (x, y) => x * 16 + 8 >= cam.x + 8 && x * 16 + 8 <= cam.x + v.w - 8 && y * 16 + 8 >= cam.y + 8 && y * 16 + 8 <= cam.y + v.h - 8;
    const c = W.comp, h = W.npcs.find((n) => n.id === 'kr_hisae');
    return { map: W.map.id, pc: [W.player.x, W.player.y, W.player.dir], pmv: !!W.player.mv, comp: c ? [c.x, c.y] : null, cmv: !!(c && c.mv),
      lamp: inView(20, 8), hisae: !!(h && inView(h.x, h.y)), hisaeAt: h ? [h.x, h.y] : null,
      view: [Math.round(cam.x / 16 * 10) / 10, Math.round(cam.y / 16 * 10) / 10, Math.round(v.w / 16 * 10) / 10, Math.round(v.h / 16 * 10) / 10] };
  });
  const beats = [];
  for (let i = 0; i < 160; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 120) : null, run: RB.script.isRunning(), mode: RB.game.mode() }; });
    if (st.d) {
      // (one press per line)
      if (!beats.length || beats[beats.length - 1].d !== st.d) { await p.waitForTimeout(400); beats.push({ d: st.d, ...(await look()) }); await p.click('.dlg .b-next').catch(() => {}); }
      await p.waitForTimeout(150);
      continue;
    }
    if (!st.run && st.mode === 'world' && beats.length) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(600);
  const after = await p.evaluate(() => ({ seen: !!RB.game.s.flags.kr_lodge_seen, quest: RB.game.s.quests.kr_main, mode: RB.game.mode(), pc: [RB.world.W.player.x, RB.world.W.player.y] }));
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(350); await p.keyboard.up('ArrowDown'); await p.waitForTimeout(400);
  const moved = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  const fb = (await p.evaluate(() => RB.staging.stats().walkFallbacks)) - fb0;
  await p.close();
  return { beats, after, moved, fb, errors };
}
for (const [comp, o, tag] of [['suzu', {}, 'suzu'], ['ren', {}, 'ren'], ['nao', { reduced: true }, 'nao, reduced motion'], ['suzu', { vp: { width: 390, height: 844 } }, 'suzu, a phone']]) {
  const r = await run(comp, o);
  const first = r.beats.find((x) => /Out of the maples/.test(x.d)), lamp = r.beats.find((x) => /single lamp is lit/.test(x.d)), compLine = r.beats[r.beats.indexOf(lamp) + 1];
  ok(first && first.map === 'kr.lodge' && first.pc[0] <= 2 && first.pc[1] === 18, tag + ': "Out of the maples…" is said where the road comes in (' + JSON.stringify(first && first.pc) + ')');
  ok(lamp && lamp.pc.join() === '15,12,up' && !lamp.pmv && r.fb === 0, tag + ': you have walked in under the walls to (15,12), facing up, the walk made (' + JSON.stringify(lamp && { pc: lamp.pc, fallbacks: r.fb }) + ')');
  ok(lamp && lamp.comp && Math.abs(lamp.comp[0] - 15) + Math.abs(lamp.comp[1] - 12) === 1 && !lamp.cmv, tag + ': your companion beside you, settled (' + JSON.stringify(lamp && lamp.comp) + ')');
  ok(lamp && lamp.lamp && lamp.hisae, tag + ': the lit lamp and Hisae are on screen for the lamp line (' + JSON.stringify(lamp && { view: lamp.view, hisae: lamp.hisaeAt }) + ')');
  ok(compLine && compLine.lamp && compLine.hisae, tag + ': and for the companion\'s line (' + JSON.stringify(compLine && compLine.d.slice(0, 40)) + ')');
  ok(r.after.seen && r.after.quest && r.after.quest.stage >= 2 && r.after.mode === 'world' && r.after.pc.join() === '15,12', tag + ': the scene ends as before, at (15,12) (' + JSON.stringify(r.after) + ')');
  ok(r.moved.join() !== r.after.pc.join(), tag + ': you walk on from there (' + JSON.stringify(r.moved) + ')');
  ok(!r.errors.length, tag + ': no page errors ' + r.errors.slice(0, 2).join(' | '));
}
// 5. the other ways in (Agnes 6308698313)
async function enter(comp, flags, o = {}) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate(([comp, flags, o]) => {
    RB.game.debugStart('kr.ridge', 42, 10, Object.assign(o.edition ? { edition: RB.edition.forNew() } : {}, { comp, dir: 'right', flags }));
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  }, [comp, flags, o]);
  await p.waitForTimeout(900);
  // (a real manual save, in the test's own fresh browser profile)
  if (o.save) await p.evaluate(async () => { await RB.save.manualSave(1); });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(450); await p.keyboard.up('ArrowRight');
  const st = () => p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); const W = RB.world.W; return { map: W.map.id, pc: [W.player.x, W.player.y], pmv: !!W.player.mv, comp: W.comp ? W.comp.id || 'comp' : null, d: d ? String(d.en || '').slice(0, 60) : null, run: RB.script.isRunning(), scene: (RB.staging.state().scene || {}).id || null, dlg: !!RB.ui.dialogue.isOpen() }; });
  return { p, errors, st };
}
{
  const { p, errors, st } = await enter('suzu', Object.assign({ kr_lodge_seen: true }, FL));
  await p.waitForTimeout(1500);
  const r = await st();
  ok(r.map === 'kr.lodge' && !r.d && !r.run && r.pc[0] <= 2 && r.pc[1] === 18, 'entering again: no arrival scene, no walk-in (' + JSON.stringify(r) + ')');
  ok(!errors.length, 'entering again: no page errors');
  await p.close();
}
{
  const { p, errors, st } = await enter('ren', Object.assign({ kr_lodge_seen: true, kr_night: true }, FL));
  let r = null;
  for (let i = 0; i < 40 && !(r && r.d); i++) { await p.waitForTimeout(150); r = await st(); }
  ok(r && /Stars over the lodge/.test(r.d || '') && r.pc[0] <= 2 && r.pc[1] === 18, 'at night after the cave: kr.evening as before, said where you come in, no walk-in (' + JSON.stringify(r) + ')');
  ok(!errors.length, 'night: no page errors');
  await p.close();
}
{
  const { p, errors, st } = await enter('ren', Object.assign({ kr_apart: true }, FL));
  const seen = [];
  for (let i = 0; i < 100; i++) {
    const r = await st();
    if (r.d) { if (seen[seen.length - 1] !== r.d) { seen.push(r.d); if (/single lamp is lit/.test(r.d)) { seen.at = r; } await p.click('.dlg .b-next').catch(() => {}); } await p.waitForTimeout(200); continue; }
    if (!r.run && seen.length) break;
    await p.waitForTimeout(120);
  }
  ok(seen.at && seen.at.pc.join() === '15,12' && seen.at.comp === null, 'your companion away (kr_apart): you walk in alone, nobody brought (' + JSON.stringify(seen.at) + ')');
  ok(!errors.length, 'companion away: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
{
  const { p, errors, st } = await enter('suzu', Object.assign({ mb2_done: true }, FL), { edition: true, save: true });
  let r = null;
  for (let i = 0; i < 60; i++) { r = await st(); if (r.d) break; await p.waitForTimeout(150); }
  await p.click('.dlg .b-next').catch(() => {});
  let walking = null;
  for (let i = 0; i < 60; i++) { const q = await st(); if (q.pc.join() !== '1,18') { walking = q; break; } await p.waitForTimeout(80); }
  const loaded = await p.evaluate(async () => { try { return await RB.game.loadCampaign(1, 'manual'); } catch (e) { return 'refused: ' + e.message; } });
  await p.waitForTimeout(1200);
  const a = await st(); await p.waitForTimeout(1500); const z = await st();
  ok(walking && loaded === true && a.map === 'kr.ridge' && a.pc.join() === '42,10' && !a.run && !a.scene && z.pc.join() === a.pc.join() && !z.pmv, 'a load during the walk: the saved journey on the ridge, nothing walking, no scene (' + JSON.stringify({ walking: walking && walking.pc, loaded, after: a, later: z.pc }) + ')');
  console.log('note load mid-walk: dialogue box open after the load: ' + a.dlg + ' (RBN-QA-053 if true)');
  ok(!errors.length, 'load: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nlodge_arrival: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
