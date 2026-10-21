// RBN-QA-066 (Agnes 6313977773/6314520575; Local CL-102; Cloud CC-057): "Ren takes a lamp and walks off towards the
// ridge", and Ren kept walking behind you at the lodge until you left it; at the Ridge Light, back together, the
// ridge's Ren went at the scene's end and nobody walked with you until the next map. Now kr.ren_evening reads the
// follower again after `!set kr_apart` (`!refresh comp`), and kr.ren_lantern, after `!unset kr_apart`, refreshes the
// people (the ridge's Ren goes) and then the follower (beside you, QA-063's placement). In Chromium on the built game,
// from the registers themselves (their warp, kr.evening on the lodge's entry at night), with an animal along:
//  1. the walk-off: Ren is with you as the line is told and gone after it; still gone while you walk about the lodge
//     and after Hisae tells you where Ren went; the animal hidden with them, as before (noCompanion '!kr_apart');
//  2. the reunion on the ridge (a tap on the ridge's Ren, the scene answered through its name): Ren walks with you
//     on the spot, beside you and not on your tile, the ridge's Ren gone (one Ren), the animal back; the arc's flags
//     and journal as before; Ren follows as you walk;
//  3. a load in the same session and the game opened afresh with a save made after the reunion: Ren with you;
//     leaving the ridge and coming back: with you; no quarrel flags at any point; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ren_apart.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_moths_done: true, kr_lodge_seen: true,
  kr_stele_read: true, kr_rhyme_heard: true, kr_scroll_done: true, kr_cave2_open: true, kr_rite_done: true, kr_cave_lit: true, kr_ghost_calmed: true, kr_kikyo_lodge: true };

const now = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s, pw = RB.petWorld && RB.petWorld.state();
  return { map: W.map.id, follower: !!W.comp, fpos: W.comp ? [W.comp.x, W.comp.y] : null, pc: [W.player.x, W.player.y], comp: s.comp, pet: pw ? pw.shown : null,
    ridgeRen: W.npcs.filter((n) => n.id === 'kr_ren_n').length, apart: !!s.flags.kr_apart, told: !!s.flags.kr_hisae_told_ren, back: !!s.flags.kr_ren_back,
    crossroads: !!s.flags.kr_ren_crossroads, quarrel: Object.keys(s.flags).some((f) => /^kr_quarrel|^kr_makeup/.test(f) && s.flags[f]), journal: (s.journal || []).length };
});
// read the dialogue to its end (choosing `pick`; a challenge answered by trying its choices), recording each line
async function drive(p, pick, max = 500) {
  const lines = [];
  for (let i = 0; i < max; i++) {
    const st = await p.evaluate(() => ({ open: RB.ui.dialogue.isOpen(), text: ((document.querySelector('.dlg, .dialogue') || {}).textContent || '').replace(/\s+/g, ' '), running: !!(RB.script.isRunning && RB.script.isRunning()), follower: !!RB.world.W.comp, map: RB.game.s.map, chal: !!document.querySelector('.chal .mc .btn') }));
    if (st.chal) {
      const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
      for (let k = 0; k < n; k++) {
        await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
        await p.waitForTimeout(150);
        if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
        await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) .fb-go, .fbwrap:not([data-fb=ok]) [data-a=retry]'); if (g) g.click(); });
        await p.waitForTimeout(150);
      }
      await p.evaluate(() => { const g = document.querySelector('.fbwrap[data-fb=ok] .fb-go'); if (g) g.click(); });
      await p.waitForTimeout(300);
      continue;
    }
    if (st.open && (!lines.length || lines[lines.length - 1].text !== st.text)) lines.push(st);
    if (st.open) await p.evaluate((pick) => { const cs = [...document.querySelectorAll('.choices button, .dchoice button')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else RB.ui.dialogue.advance(true); }, pick);
    if (!st.running && !st.open && i > 10) break;
    await p.waitForTimeout(80);
  }
  return lines;
}
const walk = async (p, key, ms) => { await p.keyboard.down(key); await p.waitForTimeout(ms); await p.keyboard.up(key); await p.waitForTimeout(300); };
const where = async (p, map, x, y, dir) => { await p.evaluate(async ([map, x, y, dir]) => { await RB.game.transition(map, x, y, dir); }, [map, x, y, dir]); await p.waitForTimeout(900); return now(p); };

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate((FL) => {
  const s = RB.game.debugStart('kr.cave3', 12, 5, { dir: 'up', edition: RB.edition.forNew(), comp: 'ren', flags: Object.assign({}, FL) });
  RB.pets.meet(s, 'cat'); RB.pets.select(s, 'cat');
  RB.state.setQuest(RB.game.s, 'kr_main', 5);
  RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice';
  RB.script.run('kr.registers');
}, FL);
// 1. the walk-off
let lines = [];
for (let i = 0; i < 6 && !(await p.evaluate(() => RB.game.s.map === 'kr.lodge' && !!RB.game.s.flags.kr_evening_seen && !RB.script.isRunning())); i++) lines = lines.concat(await drive(p, 0));
const leave = lines.find((l) => /walks off towards the ridge/.test(l.text));
const off = await now(p);
ok(leave && leave.follower && !off.follower && off.apart && off.comp === 'ren' && off.pet === false && !off.quarrel, 'the walk-off: Ren with you as the line is told, gone after it, still your companion; the animal hidden with them (' + JSON.stringify({ atLine: leave && leave.follower, off }) + ')');
await walk(p, 'ArrowLeft', 500);
const mid = await now(p);
await p.evaluate(() => RB.world.tapTile(20, 9));
await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 20000 }).catch(() => {});
await drive(p, 0);
const told = await now(p);
ok(!mid.follower && mid.pc.join() !== off.pc.join() && !told.follower && told.told && !errors.length, 'walking about the lodge and after Hisae has told you: Ren still away (' + JSON.stringify({ mid: { follower: mid.follower, pc: mid.pc }, told }) + ')');
// 2. the reunion on the ridge
const ridge = await where(p, 'kr.ridge', 40, 10, 'left');
// every frame from here: each Ren drawn (the people, the ones walking off, those walked in, foes, the follower), so a
// second Ren for even a frame is seen (Agnes 6315726597: the ridge's Ren walking off while the follower stands)
await p.evaluate(() => {
  const W = RB.world.W, who = (n) => (n.def && (n.def.char || n.def.id)) || n.id, R = (window.__ren = { max: 0, frames: 0, dup: null, first: null });
  const tick = () => {
    const drawn = [['npcs', W.npcs], ['leavers', W.leavers], ['extras', W.extras], ['foes', W.foes]].flatMap(([k, l]) => (l || []).filter((n) => who(n) === 'ren' && (n.alpha == null || n.alpha > 0)).map((n) => k + '@' + n.x + ',' + n.y + ' a' + (n.alpha == null ? 1 : +n.alpha.toFixed(2))));
    if (W.comp && W.comp.id === 'ren') { drawn.push('comp@' + W.comp.x + ',' + W.comp.y); if (!R.first) R.first = [W.comp.x, W.comp.y]; }
    R.frames++; R.max = Math.max(R.max, drawn.length);
    if (drawn.length > 1 && !R.dup) R.dup = drawn;
    if (!R.stop) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.evaluate(() => RB.world.tapTile(37, 10));
await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 20000 }).catch(() => {});
const j0 = (await now(p)).journal;
const said = await drive(p, 1, 800);
await p.waitForTimeout(800);
const back = await now(p);
await p.waitForTimeout(2500);
const ren = await p.evaluate(() => { window.__ren.stop = true; return window.__ren; });
const beside = back.fpos && Math.abs(back.fpos[0] - back.pc[0]) + Math.abs(back.fpos[1] - back.pc[1]) === 1;
ok(ridge.ridgeRen === 1 && !ridge.follower && said.some((l) => /It's lit/.test(l.text)) && back.follower && beside && back.ridgeRen === 0 && back.pet === true && back.back && back.crossroads && !back.apart && back.journal === j0 + 1 && !back.quarrel, 'the reunion: Ren walks with you on the spot, beside you and not on your tile, the ridge\'s Ren gone, the animal back; the arc as before (' + JSON.stringify({ ridge: { ridgeRen: ridge.ridgeRen, follower: ridge.follower }, back }) + ')');
await walk(p, 'ArrowRight', 600); await walk(p, 'ArrowDown', 400);
await p.waitForTimeout(800);
const follows = await now(p);
ok(ren.frames > 60 && ren.max === 1 && !ren.dup && ren.first && ren.first.join() === '37,10', 'one Ren drawn at every frame from the tap through the reunion and after (' + ren.frames + ' frames): the ridge\'s Ren is the one who comes with you, from where they stood (' + JSON.stringify({ max: ren.max, firstDuplicate: ren.dup, followerFirstAt: ren.first }) + ')');
ok(follows.follower && follows.pc.join() !== back.pc.join() && Math.abs(follows.fpos[0] - follows.pc[0]) + Math.abs(follows.fpos[1] - follows.pc[1]) <= 1, 'Ren follows as you walk (' + JSON.stringify(follows) + ')');
// 3. loads and re-entry
await p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); });
await p.waitForTimeout(1500);
const same = await now(p);
const lodge = await where(p, 'kr.lodge', 1, 18, 'right');
const again = await where(p, 'kr.ridge', 42, 10, 'left');
await p.reload();
await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
await p.evaluate(async () => { await RB.game.loadCampaign(1, 'manual'); });
await p.waitForTimeout(1500);
const fresh = await now(p);
ok(same.follower && lodge.follower && again.follower && again.ridgeRen === 0 && fresh.map === 'kr.ridge' && fresh.follower && fresh.ridgeRen === 0 && ![same, lodge, again, fresh].some((x) => x.quarrel) && !errors.length, 'a load in the same session, the lodge and back, and the game opened afresh: Ren with you, one Ren; no quarrel flags; no page errors (' + JSON.stringify({ same: same.follower, lodge: lodge.follower, again: again.follower, fresh, errors: errors.slice(0, 2) }) + ')');
// 4. (synthetic, Local CL-107) the companion standing here having walked in to speak (an extra) when `!refresh comp`
//    brings them back: that figure becomes the follower, never a second one. No authored scene reaches this today
//    (the six `!refresh comp`s), so a two-line scene of the test's own stands in.
{
  const { p: q, errors: e2 } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await q.evaluate((FL) => {
    RB.game.debugStart('kr.lodge', 20, 13, { dir: 'up', edition: RB.edition.forNew(), comp: 'ren', flags: Object.assign({}, FL, { kr_night: true, kr_evening_seen: true, kr_apart: true }) });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice';
    RB.script.add('@scene t.extra\nren: うん 。 || Yes.\n!unset kr_apart\n!refresh comp\nren: いこう 。 || Let\'s go.');
  }, FL);
  await q.waitForTimeout(1500);
  await q.evaluate(() => {
    const W = RB.world.W, who = (n) => (n.def && (n.def.char || n.def.id)) || n.id, R = (window.__ren = { max: 0, frames: 0, dup: null, first: null });
    const tick = () => {
      const drawn = [['npcs', W.npcs], ['leavers', W.leavers], ['extras', W.extras], ['foes', W.foes]].flatMap(([k, l]) => (l || []).filter((n) => who(n) === 'ren' && (n.alpha == null || n.alpha > 0)).map((n) => k + '@' + n.x + ',' + n.y));
      if (W.comp && W.comp.id === 'ren') { drawn.push('comp@' + W.comp.x + ',' + W.comp.y); if (!R.first) R.first = [W.comp.x, W.comp.y]; }
      R.frames++; R.max = Math.max(R.max, drawn.length);
      if (drawn.length > 1 && !R.dup) R.dup = drawn;
      if (!R.stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    RB.script.run('t.extra');
  });
  await q.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 10000 }).catch(() => {});
  await q.waitForTimeout(2500);
  const ex = await q.evaluate(() => { const W = RB.world.W, e = W.extras.find((n) => ((n.def && (n.def.char || n.def.id)) || n.id) === 'ren'); return e ? (e.mv ? [e.mv.tx, e.mv.ty] : [e.x, e.y]) : null; });
  await q.evaluate(() => RB.ui.dialogue.advance(true));
  await q.waitForTimeout(1500);
  const ren = await q.evaluate(() => { window.__ren.stop = true; const W = RB.world.W; return Object.assign({}, window.__ren, { follower: W.comp ? [W.comp.x, W.comp.y] : null, extras: W.extras.length }); });
  // (where the extra stands, or the tile it is stepping onto)
  ok(ex && ren.max === 1 && !ren.dup && ren.first && ren.first.join() === ex[0] + ',' + ex[1] && ren.follower && !e2.length, '(synthetic) Ren walked in to speak, then `!refresh comp`: that Ren becomes the follower where they stand (or are stepping to), one Ren at every frame (' + JSON.stringify({ extraAt: ex, max: ren.max, firstDuplicate: ren.dup, followerFirstAt: ren.first, frames: ren.frames, errors: e2.slice(0, 2) }) + ')');
  await q.close();
}
console.log(`\nren_apart: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
