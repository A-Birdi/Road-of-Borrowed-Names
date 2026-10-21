// RBN-QA-063 (Agnes 6312452003/6313070247/6313310257; Local CL-094..CL-097; Cloud CC-052..CC-054, option C′): after
// a quarrel at the lodge, the companion "gets up and goes off" but kept walking behind you. Now the three lodge maps
// (the lodge, Hisae's hut, the caretakers' room) carry a follower-only rule, followerAway 'kr_quarrel&!kr_makeup_done&
// !kr_quarrel_back': while it holds your companion does not walk with you there, and is otherwise still with you (the
// party, battles, the Ledger, the pet's rule). The departure lines are followed by `!refresh comp`; kr.makeup sets
// kr_quarrel_back and refreshes before the apology. In Chromium on the built game, from the registers themselves (as
// lodge_evening does):
//  1. Nao, Mio and Suzu, asking: the follower is there as the departure line is told, gone after it, and stays gone
//     while you walk about the lodge; the party is unchanged; the animal (Suzu's run has one) is shown as before;
//     walking to Hisae as a tap on her does (to a free tile beside her, not the lamp) and talking, the companion is
//     back at your side for the apology, made up, and walks with you after;
//     from each side of Hisae you can reach, with the household gathered round the lamp (QA-062's staging), they come
//     back beside you, in view, on nobody's tile (yours included);
//  2. mid-quarrel: a load in the same session, and the game opened afresh with that save: still away at the lodge;
//     leaving for the ridge (with you there), coming back (away), Hisae's hut and the caretakers' room (away), quick
//     travel from the lodge (with you where you arrive);
//  3. a save made up before this rule (kr_quarrel and kr_makeup_done, no kr_quarrel_back), opened afresh: with you;
//  4. the quiet branches: no quarrel, with you throughout;
//  5. Ren: the evening's walk to the ridge runs as before (no quarrel; kr_apart); apart, told and back, the lodge
//     follows the old rule (away while apart, the animal too; with you once back); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/lodge_quarrel.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_hisae_met: true, kr_moths_done: true, kr_lodge_seen: true,
  kr_stele_read: true, kr_rhyme_heard: true, kr_scroll_done: true, kr_cave2_open: true, kr_rite_done: true, kr_cave_lit: true, kr_ghost_calmed: true, kr_kikyo_lodge: true };
const LEAVE = /walks off into the dark|goes off towards Hisae|goes off beyond the broken wall|walks off towards the ridge/;
const SORRY = /said too much back there|sorry about earlier/i;

const now = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s, pw = RB.petWorld && RB.petWorld.state();
  return { map: W.map.id, follower: !!W.comp, fpos: W.comp ? [W.comp.x, W.comp.y] : null, pc: [W.player.x, W.player.y], comp: s.comp, pet: pw ? pw.shown : null,
    quarrel: !!s.flags.kr_quarrel, made: !!s.flags.kr_makeup_done, back: !!s.flags.kr_quarrel_back, apart: !!s.flags.kr_apart };
});
// read the dialogue to its end, recording each line as shown (with whether the follower is on the map then), choosing
// `pick` at every choice
async function drive(p, pick, max = 400, until) {
  const lines = [];
  for (let i = 0; i < max; i++) {
    const st = await p.evaluate(() => ({ open: RB.ui.dialogue.isOpen(), text: ((document.querySelector('.dlg, .dialogue') || {}).textContent || '').replace(/\s+/g, ' '), running: !!(RB.script.isRunning && RB.script.isRunning()), follower: !!RB.world.W.comp, fpos: RB.world.W.comp ? [RB.world.W.comp.x, RB.world.W.comp.y] : null, pc: [RB.world.W.player.x, RB.world.W.player.y], map: RB.game.s.map, seen: !!RB.game.s.flags.kr_evening_seen }));
    if (st.open && (!lines.length || lines[lines.length - 1].text !== st.text)) lines.push(st);
    if (st.open) await p.evaluate((pick) => { const cs = [...document.querySelectorAll('.choices button, .dchoice button')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else RB.ui.dialogue.advance(true); }, pick);
    if (!st.running && !st.open && i > 10 && (!until || until(st))) break;
    await p.waitForTimeout(80);
  }
  return lines;
}
// from the registers to the end of the evening (kr.evening on the lodge's entry at night)
async function evening(comp, pick, o = {}) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([FL, comp, pet]) => {
    const s = RB.game.debugStart('kr.cave3', 12, 5, { dir: 'up', edition: RB.edition.forNew(), comp, flags: Object.assign({}, FL) });
    if (pet) { RB.pets.meet(s, 'cat'); RB.pets.select(s, 'cat'); }
    RB.state.setQuest(RB.game.s, 'kr_main', 5);
    RB.game.settings.textSpeed = 'instant';
    RB.script.run('kr.registers');
  }, [FL, comp, !!o.pet]);
  // (to the end of the evening: on the lodge, kr.evening told, nothing running)
  const lines = await drive(p, pick, 500, (st) => st.map === 'kr.lodge' && st.seen);
  return { p, errors, lines, end: await now(p) };
}
const walk = async (p, key, ms) => { await p.keyboard.down(key); await p.waitForTimeout(ms); await p.keyboard.up(key); await p.waitForTimeout(250); };
// go to Hisae at her lamp as a tap on her does (the path to a free tile beside her, then the talk; the lamp's own tile
// (20,8) is not stood on), and read it through, choosing `pick`; where you stood to talk is recorded
async function hisae(p, pick) {
  await p.evaluate(() => RB.world.tapTile(20, 9));
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 20000 });
  const from = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  const lines = await drive(p, pick, 300);
  lines.from = from;
  return lines;
}
const where = async (p, map, x, y, dir) => { await p.evaluate(async ([map, x, y, dir]) => { await RB.game.transition(map, x, y, dir); }, [map, x, y, dir]); await p.waitForTimeout(900); return now(p); };

// 1. Nao, Mio and Suzu, asking
for (const comp of ['nao', 'mio', 'suzu']) {
  const r = await evening(comp, 0, { pet: comp === 'suzu' });
  const leave = r.lines.find((l) => LEAVE.test(l.text));
  ok(leave && leave.follower && !r.end.follower && r.end.comp === comp && r.end.quarrel && !r.end.made && !r.errors.length, comp + ': with you as the departure line is told, gone after it; still your companion (' + JSON.stringify({ atLine: leave && leave.follower, end: r.end }) + ')');
  await walk(r.p, 'ArrowLeft', 500);
  const mid = await now(r.p);
  await walk(r.p, 'ArrowRight', 500);
  await r.p.waitForTimeout(2000);
  const free = await now(r.p);
  ok(!mid.follower && !free.follower && (mid.pc[0] !== r.end.pc[0] || mid.pc[1] !== r.end.pc[1]) && (comp !== 'suzu' || (mid.pet === true && free.pet === true)), comp + ': walking about the lodge, they stay away' + (comp === 'suzu' ? '; the animal is shown, as before' : '') + ' (' + JSON.stringify({ from: r.end.pc, mid, free }) + ')');
  const said = await hisae(r.p, 0);
  const sorry = said.find((l) => SORRY.test(l.text));
  const after = await now(r.p);
  const near = sorry && sorry.fpos && Math.abs(sorry.fpos[0] - sorry.pc[0]) + Math.abs(sorry.fpos[1] - sorry.pc[1]) <= 1;
  const beside = Math.abs(said.from[0] - 20) + Math.abs(said.from[1] - 9) === 1 && said.from.join() !== '20,8';
  ok(beside && sorry && sorry.follower && near && after.follower && after.made && after.back && after.comp === comp, comp + ': walking to Hisae (a tap on her) and talking, they are back at your side for the apology, and it is made up (' + JSON.stringify({ from: said.from, sorry: sorry && { follower: sorry.follower, fpos: sorry.fpos, pc: sorry.pc }, after }) + ')');
  await walk(r.p, 'ArrowUp', 600); await walk(r.p, 'ArrowLeft', 600);
  await r.p.waitForTimeout(1500);
  const later = await now(r.p);
  ok(later.follower && !r.errors.length, comp + ': after making up, they walk with you; no page errors (' + JSON.stringify({ later, errors: r.errors.slice(0, 2) }) + ')');
  await r.p.close();
}
// 1b. the apology from each side of Hisae you can reach, with the household gathered round the lamp as the evening
// leaves them (RBN-QA-062's staging, run here as kr.evening runs it: Mokichi (18,9), Sora (19,10), Kikyō (22,9)): you
// walk there (a tap on the tile), face her and talk; they come back beside you, in view, on nobody's tile, yours
// included (Local CL-101)
for (const [sx, sy, dir] of [[19, 9, 'right'], [21, 9, 'left'], [20, 10, 'up']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate((FL) => {
    RB.game.debugStart('kr.lodge', 20, 13, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags: Object.assign({}, FL, { kr_night: true, kr_evening_seen: true, kr_quarrel: true }) });
    RB.game.settings.textSpeed = 'instant';
    RB.script.add('@scene t.gather\n!walkto kr_mokichi 18 9 right now stay\n!walkto kr_sora 19 10 up now stay\n!walkto kr_kikyo 22 9 left now stay');
    RB.script.run('t.gather');
  }, FL);
  await p.waitForTimeout(1200);
  const before = await now(p);
  await p.evaluate(([x, y]) => RB.world.tapTile(x, y), [sx, sy]);
  await p.waitForFunction(([x, y]) => RB.world.W.player.x === x && RB.world.W.player.y === y && !RB.world.W.player.mv, [sx, sy], { timeout: 15000 }).catch(() => {});
  await p.evaluate((dir) => { RB.world.W.player.dir = dir; RB.world.interact(); }, dir);
  const lines = await drive(p, 0, 300);
  const sorry = lines.find((l) => SORRY.test(l.text));
  const at = await p.evaluate(() => {
    const W = RB.world.W, cam = RB.render.cam, v = RB.render.viewSize(), c = W.comp;
    const others = W.npcs.filter((n) => c && n.x === c.x && n.y === c.y).map((n) => n.id);
    return { others, seen: !!c && c.x * 16 + 8 >= cam.x && c.x * 16 + 8 <= cam.x + v.w && c.y * 16 + 8 >= cam.y && c.y * 16 + 8 <= cam.y + v.h, household: ['kr_mokichi', 'kr_sora', 'kr_kikyo'].map((id) => { const n = W.npcs.find((q) => q.id === id); return n ? [n.x, n.y].join() : null; }) };
  });
  const w = await now(p);
  const ok1 = sorry && sorry.follower && sorry.pc.join() === sx + ',' + sy && sorry.fpos.join() !== sorry.pc.join() && Math.abs(sorry.fpos[0] - sx) + Math.abs(sorry.fpos[1] - sy) === 1;
  ok(!before.follower && ok1 && !at.others.length && at.seen && at.household.join(' ') === '18,9 19,10 22,9' && w.made && !errors.length, 'from (' + sx + ',' + sy + '), with the household gathered: back beside you for the apology, in view, on nobody\'s tile (' + JSON.stringify({ sorry: sorry && { fpos: sorry.fpos, pc: sorry.pc }, at, made: w.made, errors: errors.slice(0, 1) }) + ')');
  await p.close();
}
// 2. mid-quarrel: loads, leaving and coming back, the interiors, quick travel
{
  const r = await evening('suzu', 0, { pet: true });
  ok(r.end.quarrel && !r.end.made && !r.end.follower, 'mid-quarrel: the quarrel has begun (' + JSON.stringify(r.end) + ')');
  await r.p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); });
  await r.p.waitForTimeout(1500);
  const same = await now(r.p);
  ok(same.map === 'kr.lodge' && !same.follower && same.comp === 'suzu' && same.quarrel, 'mid-quarrel, a load in the same session: still away at the lodge (' + JSON.stringify(same) + ')');
  const ridge = await where(r.p, 'kr.ridge', 42, 10, 'left');
  const lodge = await where(r.p, 'kr.lodge', 1, 18, 'right');
  const hut = await where(r.p, 'kr.hisae', 4, 5, 'up');
  const room = await where(r.p, 'kr.lodge_in', 4, 6, 'up');
  const out = await where(r.p, 'kr.lodge', 33, 10, 'down');
  ok(ridge.map === 'kr.ridge' && ridge.follower && lodge.map === 'kr.lodge' && !lodge.follower && hut.map === 'kr.hisae' && !hut.follower && room.map === 'kr.lodge_in' && !room.follower && !out.follower && [ridge, lodge, hut, room, out].every((x) => x.comp === 'suzu'),
    'mid-quarrel: on the ridge they are with you; back at the lodge, in Hisae\'s hut and in the caretakers\' room, away (' + JSON.stringify({ ridge: ridge.follower, lodge: lodge.follower, hut: hut.follower, room: room.follower, out: out.follower }) + ')');
  // quick travel from the lodge (the Map tab's Travel), to a place in another region
  const go = await r.p.evaluate(() => {
    const s = RB.game.s, ids = Object.keys(RB.content.places).filter((id) => { const pl = RB.content.places[id]; return pl.hub && (pl.edition || 1) <= RB.edition.of(s) && !/^kr\./.test(pl.map); });
    for (const id of ids) s.travel[id] = true;
    RB.ui.menu.open('map');
    return { id: ids[0], ok: RB.travel.status(s.map).ok };
  });
  await r.p.waitForSelector('[data-go="' + go.id + '"]', { timeout: 5000 });
  await r.p.click('[data-go="' + go.id + '"]');
  await r.p.waitForTimeout(1800);
  for (let i = 0; i < 40 && await r.p.evaluate(() => RB.ui.dialogue.isOpen() || !!(RB.script.isRunning && RB.script.isRunning())); i++) { await r.p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await r.p.waitForTimeout(100); }
  const there = await now(r.p);
  ok(go.ok && there.map !== 'kr.lodge' && !/^kr\./.test(there.map) && there.follower && there.comp === 'suzu', 'mid-quarrel, quick travel from the lodge: with you where you arrive (' + JSON.stringify({ go, there }) + ')');
  // the game opened afresh with the mid-quarrel save
  await r.p.reload();
  await r.p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
  await r.p.evaluate(async () => { await RB.game.loadCampaign(1, 'manual'); });
  await r.p.waitForTimeout(1500);
  const fresh = await now(r.p);
  ok(fresh.map === 'kr.lodge' && !fresh.follower && fresh.comp === 'suzu' && fresh.quarrel && !fresh.made && !r.errors.length, 'mid-quarrel, the game opened afresh with that save: still away at the lodge; no page errors (' + JSON.stringify({ fresh, errors: r.errors.slice(0, 2) }) + ')');
  await r.p.close();
}
// 3. a save made up before this rule (kr_quarrel and kr_makeup_done, no kr_quarrel_back)
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async (FL) => {
    RB.game.debugStart('kr.lodge', 20, 12, { dir: 'up', edition: RB.edition.forNew(), comp: 'mio', flags: Object.assign({}, FL, { kr_night: true, kr_evening_seen: true, kr_quarrel: true, kr_makeup_done: true }) });
    await RB.save.manualSave(1);
  }, FL);
  const here = await now(p);
  await p.reload();
  await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
  await p.evaluate(async () => { await RB.game.loadCampaign(1, 'manual'); });
  await p.waitForTimeout(1500);
  const fresh = await now(p);
  ok(here.follower && fresh.map === 'kr.lodge' && fresh.follower && fresh.made && !fresh.back && !errors.length, 'a save made up before this rule, opened afresh: with you at the lodge (' + JSON.stringify({ here: here.follower, fresh }) + ')');
  await p.close();
}
// 4. the quiet branches
for (const comp of ['nao', 'mio', 'suzu']) {
  const r = await evening(comp, 1);
  await walk(r.p, 'ArrowLeft', 500);
  await r.p.waitForTimeout(1200);
  const free = await now(r.p);
  const back = await where(r.p, 'kr.ridge', 42, 10, 'left'), again = await where(r.p, 'kr.lodge', 1, 18, 'right');
  ok(!r.lines.some((l) => LEAVE.test(l.text)) && r.end.follower && !r.end.quarrel && r.end.made && free.follower && back.follower && again.follower && !r.errors.length, comp + ', not asking: no quarrel; with you throughout, there and back (' + JSON.stringify({ end: r.end, free: free.follower, ridge: back.follower, lodge: again.follower }) + ')');
  await r.p.close();
}
// 5. Ren
{
  const r = await evening('ren', 0, { pet: true });
  const leave = r.lines.find((l) => LEAVE.test(l.text));
  ok(leave && !r.end.quarrel && r.end.apart && r.end.comp === 'ren' && !r.errors.length, 'ren: the evening\'s walk to the ridge runs as before: kr_apart, no quarrel (' + JSON.stringify({ end: r.end }) + ')');
  await r.p.close();
  for (const [name, flags, apart] of [['apart', { kr_apart: true }, true], ['told', { kr_apart: true, kr_hisae_told_ren: true }, true], ['back', { kr_hisae_told_ren: true, kr_ren_back: true }, false]]) {
    const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await p.evaluate(([FL, flags]) => {
      const s = RB.game.debugStart('kr.lodge', 20, 12, { dir: 'up', edition: RB.edition.forNew(), comp: 'ren', flags: Object.assign({}, FL, { kr_night: true, kr_evening_seen: true }, flags) });
      RB.pets.meet(s, 'cat'); RB.pets.select(s, 'cat'); RB.petWorld.place();
    }, [FL, flags]);
    await p.waitForTimeout(900);
    const w = await now(p);
    ok(w.follower === !apart && w.pet === !apart && w.comp === 'ren' && !errors.length, 'ren, ' + name + ': at the lodge as before: ' + (apart ? 'away, and the animal too' : 'with you, and the animal') + ' (' + JSON.stringify(w) + ')');
    await p.close();
  }
}
console.log(`\nlodge_quarrel: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
