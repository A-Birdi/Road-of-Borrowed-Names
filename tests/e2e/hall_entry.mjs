// Agnes, RBN-QA-005 (the owner's feedback, relayed): on entering the Lantern Hall for the companion choice, the four
// appeared inside the room at once. Now you walk in, the four come in through the door after you, one after another,
// and take their places round you; the scene's first line comes once they have (src/content/ch1/32_scenes_depart.js
// rw.hall_gather, `!refresh arrive`: src/engine/50_world.js arriveOnFoot, arrivals). In the game, through the door:
//  - none of the four is in the hall as you come in; each first shows at the way in (the door or the mat inside it),
//    and no two people are ever drawn on top of each other (the four, you and Tsuru, sampled every frame);
//  - each ends at their place (Nao 2,5 · Mio 8,5 · Ren 3,7 · Suzu 6,7) facing the room, you at 5,6 facing Tsuru, and
//    the way to the door (5,7 · 5,8 · 5,9) is clear; the narrator's line shows only once all four are there;
//  - Skip during the entrance, and reduced motion: the same places;
//  - going out and coming back in: the scene does not play again and nobody walks in (they are simply there);
//  - the choice itself is unchanged: asking Mio makes her the one chosen.
// EVIDENCE=<dir> keeps four frames of the entrance there (not committed).
// Usage: node tools/build.mjs && node tests/e2e/hall_entry.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const HOME = { nao: [2, 5], mio: [8, 5], ren: [3, 7], suzu: [6, 7] };
const FOUR = Object.keys(HOME);
// the evening of the Lantern Hall (as tests/e2e/staging_ch12_cases.mjs RH)
const RH = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_bottles_done: true, rw_letters_done: true, rw_lanterns_done: true, rw_suzu_told: true,
  rw_hana_cups: true, rw_met_nao: true, rw_met_ren: true, rw_met_suzu: true, rw_mill_open: true, rw_mr_mio: true, rw_mr_nao: true, rw_mr_ren: true,
  rw_mr_suzu: true, rw_gears: true, rw_loft_done: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true, rw_evening: true, rw_night: true,
};

// from the village, in front of the hall's door, through it as a player does (the fade, the hall's arrival scene)
async function enterHall(p, o) {
  await p.evaluate(async ([RH, o]) => {
    const s = RB.game.debugStart('rw.village', 21, 9, { dir: 'up', flags: RH, edition: RB.edition.forNew() });
    s.quests.rw_depart = { stage: 0, done: false, t: Date.now() };
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduced;
    RB.game.applySettings();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    // every frame: who is drawn where (the four, you, Tsuru), and whether a line is showing
    window.__hs = [];
    const ids = ['nao', 'mio', 'ren', 'suzu', 'tsuru'];
    const t1 = performance.now();
    const tick = () => {
      if (performance.now() - t1 > 20000) return;
      const m = W.map ? W.map.id : null, row = { t: performance.now() - t1, map: m, line: null, a: {} };
      const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown();
      if (l) row.line = l.who + ':' + String(l.en || '').slice(0, 24);
      row.a.pc = { x: W.player.fx, y: W.player.fy, alpha: 1, dir: W.player.dir };
      if (m === 'rw.hall') for (const id of ids) { const n = W.npcs.find((q) => q.id === id); if (n) row.a[id] = { x: n.fx, y: n.fy, alpha: n.alpha == null ? 1 : n.alpha, dir: n.dir }; }
      window.__hs.push(row);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    RB.game.transition('rw.hall', 5, 8, 'up');
  }, [RH, o || {}]);
}
// the samples once the hall's first line shows (at most 20 s)
async function untilLine(p) {
  await p.waitForFunction(() => (window.__hs || []).some((r) => r.map === 'rw.hall' && r.line), null, { timeout: 20000 }).catch(() => {});
  return p.evaluate(() => window.__hs.filter((r) => r.map === 'rw.hall'));
}
const visible = (a) => a && a.alpha > 0.05;
function overlaps(rows) {
  const out = [];
  for (const r of rows) {
    const who = Object.keys(r.a).filter((k) => visible(r.a[k]));
    for (let i = 0; i < who.length; i++) for (let j = i + 1; j < who.length; j++) {
      const A = r.a[who[i]], B = r.a[who[j]];
      if (Math.hypot(A.x - B.x, A.y - B.y) < 0.9) out.push(who[i] + '/' + who[j] + ' @' + Math.round(r.t) + 'ms (' + A.x.toFixed(2) + ',' + A.y.toFixed(2) + ' · ' + B.x.toFixed(2) + ',' + B.y.toFixed(2) + ')');
    }
  }
  return out;
}
const placed = (p) => p.evaluate((HOME) => {
  const W = RB.world.W, o = {};
  for (const id of Object.keys(HOME)) { const n = W.npcs.find((q) => q.id === id); o[id] = n ? [n.x, n.y, n.dir, n.alpha == null ? 1 : n.alpha, !!(n.route || n.mv || n.wait > 0)] : null; }
  o.pc = [W.player.x, W.player.y, W.player.dir];
  o.blocked = [[5, 7], [5, 8], [5, 9]].filter(([x, y]) => W.npcs.some((n) => n.x === x && n.y === y)).map((t) => t.join(','));
  return o;
}, HOME);
const atHome = (pl) => FOUR.every((id) => pl[id] && pl[id][0] === HOME[id][0] && pl[id][1] === HOME[id][1] && pl[id][3] === 1 && !pl[id][4]);
// Next through the rest of the scene (it ends at the quest step and the autosave)
async function drain(p) {
  for (let i = 0; i < 60; i++) {
    const on = await p.evaluate(() => !!(RB.ui.dialogue.shown && RB.ui.dialogue.shown()));
    if (!on) { if (await p.evaluate(() => RB.game.mode() === 'world')) return true; await p.waitForTimeout(120); continue; }
    await p.click('.dlg .b-next').catch(() => {});
    await p.waitForTimeout(90);
  }
  return false;
}

// ---- the entrance, as played ------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await enterHall(p);
  const ev = process.env.EVIDENCE;
  if (ev) {
    fs.mkdirSync(ev, { recursive: true });
    // four moments: you walking in; the first of them in the doorway; two more inside; everyone in place, the first line
    const shot = async (name) => p.screenshot({ path: path.join(ev, name + '.png') });
    await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'rw.hall', null, { timeout: 10000 });
    await p.waitForTimeout(250); await shot('1_you_walk_in');
    await p.waitForFunction(() => RB.world.W.npcs.some((n) => ['nao', 'mio', 'ren', 'suzu'].includes(n.id) && n.alpha > 0.6), null, { timeout: 10000 }).catch(() => {});
    await shot('2_first_in_the_doorway');
    await p.waitForFunction(() => RB.world.W.npcs.filter((n) => ['nao', 'mio', 'ren', 'suzu'].includes(n.id) && n.alpha > 0.6).length >= 3, null, { timeout: 10000 }).catch(() => {});
    await shot('3_coming_in');
  }
  const rows = await untilLine(p);
  if (ev) await p.screenshot({ path: path.join(ev, '4_settled_first_line.png') });
  const first = rows.find((r) => r.line);
  const atEntry = rows.find((r) => r.a.pc && r.a.pc.y >= 7.9);
  assert(atEntry && FOUR.every((id) => !visible(atEntry.a[id])), 'as you come in, none of the four is in the room yet');
  const firstSeen = {};
  for (const r of rows) for (const id of FOUR) if (!firstSeen[id] && visible(r.a[id])) firstSeen[id] = { x: r.a[id].x, y: r.a[id].y, t: Math.round(r.t) };
  assert(FOUR.every((id) => firstSeen[id] && firstSeen[id].y >= 7.9 && Math.abs(firstSeen[id].x - 5) < 0.6), 'each first shows at the way in (the door or the mat): ' + JSON.stringify(firstSeen));
  const order = FOUR.slice().sort((a, b) => firstSeen[a].t - firstSeen[b].t), gaps = order.slice(1).map((id, i) => firstSeen[id].t - firstSeen[order[i]].t);
  assert(gaps.every((g) => g >= 300), 'they come in one after another (' + order.join(' → ') + ', ' + gaps.join(' / ') + ' ms apart)');
  const ov = overlaps(rows);
  assert(!ov.length, 'nobody is drawn on top of anyone else, any frame (' + rows.length + ' frames)' + (ov.length ? ': ' + ov.slice(0, 4).join('; ') : ''));
  const pl = await placed(p);
  assert(first && /^narr:/.test(first.line) && FOUR.every((id) => first.a[id] && first.a[id].x === HOME[id][0] && first.a[id].y === HOME[id][1] && first.a[id].alpha === 1), 'the first line shows once all four are at their places (' + (first && first.line) + ')');
  assert(atHome(pl) && pl.nao[2] === 'right' && pl.mio[2] === 'left' && pl.ren[2] === 'right' && pl.suzu[2] === 'left', 'each settles at their place round you, facing in: ' + JSON.stringify(pl));
  assert(pl.pc[0] === 5 && pl.pc[1] === 6 && pl.pc[2] === 'up' && !pl.blocked.length, 'you stand at 5,6 facing Tsuru, and the way to the door is clear (' + JSON.stringify(pl.pc) + ', blocked: ' + pl.blocked.join(' ') + ')');
  assert(await drain(p), 'the scene plays to its end');
  const after = await p.evaluate(() => ({ step: (RB.game.s.quests.rw_depart || {}).stage, gathered: !!RB.game.s.flags.rw_hall_gather }));
  assert(after.gathered && after.step === 0, 'the gathering is done and Two Names is at its step (' + JSON.stringify(after) + ')');
  // out and back in: no arrival scene, nobody walking in
  await p.evaluate(async () => { await RB.game.transition('rw.village', 21, 9, 'down'); });
  await p.waitForTimeout(400);
  await drain(p); // (the village may have something of its own to say as you come out)
  await p.evaluate(() => { window.__hs = []; });
  await p.evaluate(async () => { await RB.game.transition('rw.hall', 5, 8, 'up'); });
  await p.waitForTimeout(700);
  const again = await placed(p);
  const scene = await p.evaluate(() => { const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown(); return l ? l.who + ': ' + l.en : null; });
  assert(atHome(again) && !scene, 'coming back in: no scene, and the four are already at their places, nobody walking (' + JSON.stringify(again) + (scene ? '; a line: ' + scene : '') + ')');
  // the choice is as before: asking Mio
  await p.evaluate(async () => { RB.test.enable({ choose: () => 0 }); await RB.script.run('rw.hall_mio'); RB.test.disable(); });
  assert(await p.evaluate(() => RB.game.s.provisional === 'mio'), 'asking Mio makes her the one chosen, as before');
  assert(!errors.length, 'no page errors ' + errors.join(' | '));
  await p.context().close();
}

// ---- Skip during the entrance; reduced motion --------------------------------------------------------------------
for (const v of [{ name: 'Skip during the entrance', skip: true }, { name: 'reduced motion', reduced: true }]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await enterHall(p, { reduced: v.reduced });
  if (v.skip) {
    await p.waitForFunction(() => RB.world.W.npcs.some((n) => n.id === 'nao' || n.id === 'mio'), null, { timeout: 10000 }).catch(() => {});
    await p.evaluate(() => RB.game.setFastForward(true));
  }
  await untilLine(p);
  const pl = await placed(p);
  assert(atHome(pl) && pl.pc[0] === 5 && pl.pc[1] === 6 && !pl.blocked.length, v.name + ': the same places (' + JSON.stringify(pl) + ')');
  if (v.skip) await p.evaluate(() => RB.game.setFastForward(false));
  assert(!errors.length, v.name + ': no page errors ' + errors.join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
