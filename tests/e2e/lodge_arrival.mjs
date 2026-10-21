// RBN-QA-052 (Agnes; Local's walk-in, CL-069): arriving at the Keepers' Lodge (kr.lodge_arrive, first visit), in
// Chromium on the built game, walking in from the ridge as in play (the real exit, the map's onEnter):
//  1. "Out of the maples…" is said where the road comes in (1,18);
//  2. then you walk in under the broken walls to (17,12), facing right, your companion with you (the integrated
//     `!walkto … party max=`), and the walk is made (no fallback);
//  3. for "In the middle of the broken walls a single lamp is lit…" and the companion's line, the lit lamp (20,8) and
//     Hisae (20,10) are on screen, on a desktop and on a phone (before, they were off its edge);
//  4. the scene ends as before (kr_lodge_seen, the quest's next step) and you walk on from there; reduced motion
//     too; no page errors.
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
  ok(lamp && lamp.pc.join() === '17,12,right' && !lamp.pmv && r.fb === 0, tag + ': you have walked in under the walls to (17,12), facing right, the walk made (' + JSON.stringify(lamp && { pc: lamp.pc, fallbacks: r.fb }) + ')');
  ok(lamp && lamp.comp && Math.abs(lamp.comp[0] - 17) + Math.abs(lamp.comp[1] - 12) === 1 && !lamp.cmv, tag + ': your companion beside you, settled (' + JSON.stringify(lamp && lamp.comp) + ')');
  ok(lamp && lamp.lamp && lamp.hisae, tag + ': the lit lamp and Hisae are on screen for the lamp line (' + JSON.stringify(lamp && { view: lamp.view, hisae: lamp.hisaeAt }) + ')');
  ok(compLine && compLine.lamp && compLine.hisae, tag + ': and for the companion\'s line (' + JSON.stringify(compLine && compLine.d.slice(0, 40)) + ')');
  ok(r.after.seen && r.after.quest && r.after.quest.stage >= 2 && r.after.mode === 'world' && r.after.pc.join() === '17,12', tag + ': the scene ends as before, at (17,12) (' + JSON.stringify(r.after) + ')');
  ok(r.moved.join() !== r.after.pc.join(), tag + ': you walk on from there (' + JSON.stringify(r.moved) + ')');
  ok(!r.errors.length, tag + ': no page errors ' + r.errors.slice(0, 2).join(' | '));
}
console.log(`\nlodge_arrival: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
