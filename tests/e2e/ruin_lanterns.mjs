// RBN-QA-054 (Agnes; refined by Agnes 6308995228 and Local CL-072): at the ruined third waystation on the Maple Ridge
// (kr.ridge), looking at either dark lantern after Hisae gave her oil said only "still dark"; the lighting (kr.moths, the
// Wick Moths' defence) started only from the strip of path north of them. Now the lanterns start the same scene. In
// Chromium on the built game:
//  1. before Hisae: either lantern says it is dark and that someone at the lodge may know; no battle, nothing set;
//  2. after Hisae, the real defence from each lantern and from its north and outer side: the lines, then the battle
//     (its lanterns to protect, the ridge's scenery); stepping back leaves it undone, with no quest step or journal
//     line, and the lantern starts it again;
//  3. the endings (the battle stood in for by its result and the conclusion's own flags, as sequence_world does):
//     kept (or held) and a lantern out both complete the step once (kr_main 4, one journal line), kr_moths_kept only for
//     the first; a lost defence leaves it undone and it can be tried again;
//  4. after it: the lanterns are lit and say so (the keepsake scene, unchanged); neither they nor the old strip start
//     the battle again; repeated presses start it once;
//  5. the strip itself still starts it, as before; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ruin_lanterns.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_lodge_seen: true };

async function at(flags, o = {}) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate(([flags, o]) => {
    const s = RB.game.debugStart('kr.ridge', 29, 12, { edition: RB.edition.forNew(), comp: 'suzu', dir: 'down', flags });
    // no arrival scene or wanderer interferes
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'kr_main', 3);
    RB.world.refreshActors();
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
    window.__enc = [];
    const real = RB.game.startEncounter;
    if (o.stub) {
      // the battle stood in for: its result and its conclusion's own flags, as the encounter sets them
      RB.game.startEncounter = async (id) => { window.__enc.push(id); await new Promise((r) => setTimeout(r, 300)); Object.assign(RB.game.s.flags, o.stub.flags || {}); return { result: o.stub.result, outcome: o.stub.outcome || null }; };
    } else RB.game.startEncounter = function (id) { window.__enc.push(id); return real.apply(this, arguments); };
  }, [Object.assign({}, FL, flags), o]);
  await p.waitForTimeout(700);
  return { p, errors };
}
const st = (p) => p.evaluate(() => {
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(), s = RB.game.s;
  return { line: d ? String(d.en || '') : null, run: RB.script.isRunning(), mode: RB.game.mode(), combat: !!RB.combat.state(), enc: window.__enc.slice(),
    done: !!s.flags.kr_moths_done, kept: !!s.flags.kr_moths_kept, stage: s.quests.kr_main && s.quests.kr_main.stage,
    journal: (s.journal || []).filter((j) => /ridge's lanterns are lit/.test(j.en || '')).length, pos: [RB.world.W.player.x, RB.world.W.player.y] };
});
// stand at (x,y) facing dir and press the action key; read every line until the scene ends or a battle opens
async function look(p, x, y, dir, o = {}) {
  await p.evaluate(([x, y, dir]) => { const P = RB.world.W.player; P.x = x; P.y = y; P.fx = x; P.fy = y; P.dir = dir; }, [x, y, dir]);
  await p.waitForTimeout(200);
  await p.keyboard.press('Enter');
  if (o.twice) { await p.waitForTimeout(60); await p.keyboard.press('Enter'); await p.keyboard.press('Enter'); }
  const lines = [];
  for (let i = 0; i < 80; i++) {
    await p.waitForTimeout(150);
    const r = await st(p);
    if (r.combat) return { lines, r };
    if (r.line && lines[lines.length - 1] !== r.line) lines.push(r.line);
    if (r.line) { await p.click('.dlg .b-next').catch(() => {}); continue; }
    if (!r.run && r.mode === 'world' && i > 3) return { lines, r };
  }
  return { lines, r: await st(p) };
}
const has = (lines, re) => lines.some((l) => re.test(l));
// the lanterns: west (27,14) and east (31,14); each from the north and from its outer side
const SIDES = [['west lantern from the north', 27, 13, 'down'], ['west lantern from the west', 26, 14, 'right'], ['east lantern from the north', 31, 13, 'down'], ['east lantern from the east', 32, 14, 'left']];

// 1. before Hisae
{
  const { p, errors } = await at({});
  for (const [name, x, y, dir] of [SIDES[0], SIDES[3]]) {
    const { lines, r } = await look(p, x, y, dir);
    ok(has(lines, /still dark/) && has(lines, /Someone at the lodge may know/) && !has(lines, /Hisae's oil/) && !r.combat && !r.enc.length && !r.done && r.stage === 3 && !r.journal,
      'before Hisae, the ' + name + ': dark, ask at the lodge; no battle, nothing set (' + JSON.stringify({ lines, enc: r.enc, done: r.done }) + ')');
  }
  ok(!errors.length, 'before Hisae: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. after Hisae: the real defence from each lantern and side; stepping back leaves it undone, and it starts again
{
  const { p, errors } = await at({ kr_hisae_met: true });
  let n = 0;
  for (const [name, x, y, dir] of SIDES) {
    const { lines, r } = await look(p, x, y, dir);
    n++;
    const ctx = await p.evaluate(() => { const c = RB.combat.context(); const o = document.querySelector('.cb-obj'); return { c, obj: o ? o.textContent.replace(/\s+/g, ' ').trim() : '' }; });
    ok(has(lines, /still dark/) && has(lines, /With Hisae's oil, you light the two lanterns/) && has(lines, /moths that drink the flame/) && r.combat && r.enc.length === n && r.enc[n - 1] === 'kr.wick_ridge' && /lantern/i.test(ctx.obj) && ctx.c && ctx.c.bg,
      'the ' + name + ': lit with Hisae\'s oil, and the Wick Moths\' defence opens once, its lanterns to keep, the ridge\'s scenery (' + JSON.stringify({ lines: lines.slice(1), enc: r.enc.length, bg: ctx.c && ctx.c.bg, obj: ctx.obj.slice(0, 60) }) + ')');
    // your first turn: "Step back from this encounter"
    // (the battle's opening lines read through first)
    for (let i = 0; i < 100; i++) { if (await p.evaluate(() => !!(document.querySelector('.cb-dock [data-flee]') || {}).offsetParent)) break; await p.click('.dlg .b-next', { timeout: 300 }).catch(() => {}); await p.waitForTimeout(200); }
    await p.waitForTimeout(400);
    await p.click('.cb-dock [data-flee]').catch(() => {});
    // its confirmation: "Step back" (not "Stay")
    await p.waitForTimeout(500);
    await p.locator('button', { hasText: /^Step back$/ }).last().click({ timeout: 5000 }).catch(() => {});
    let q = null;
    for (let i = 0; i < 60; i++) { await p.waitForTimeout(150); q = await st(p); if (q.line) await p.click('.dlg .b-next').catch(() => {}); if (!q.combat && !q.run && q.mode === 'world') break; }
    ok(q && !q.combat && !q.run && q.mode === 'world' && !q.done && !q.kept && q.stage === 3 && !q.journal,
      'the ' + name + ', stepped back: the journey goes on, undone, no quest step or journal line (' + JSON.stringify({ mode: q && q.mode, done: q && q.done, stage: q && q.stage, journal: q && q.journal }) + ')');
  }
  ok(!errors.length, 'the real defence: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. the endings
for (const [name, stub, kept] of [
  ['kept (both lanterns burning)', { result: 'win', outcome: 'kept', flags: { kr_moths_kept: true } }, true],
  ['held (six rounds, both standing)', { result: 'win', outcome: 'held', flags: { kr_moths_kept: true } }, true],
  ['a lantern out', { result: 'end', outcome: 'out' }, false],
]) {
  const { p, errors } = await at({ kr_hisae_met: true }, { stub });
  const { lines, r } = await look(p, 26, 14, 'right');
  ok(r.enc.length === 1 && r.done && r.kept === kept && r.stage === 4 && r.journal === 1 && has(lines, kept ? /Both lights burned to the end/ : /One light went out/),
    name + ': done once, the quest\'s step and one journal line, kr_moths_kept ' + kept + ' (' + JSON.stringify({ enc: r.enc.length, done: r.done, kept: r.kept, stage: r.stage, journal: r.journal, last: lines[lines.length - 1] }) + ')');
  // 4. after it: lit, saying so; neither lantern nor the old strip starts it again
  const again = await look(p, 32, 14, 'left');
  const lit = await p.evaluate(() => RB.world.W.map.props.filter((q) => q.p === 'kr_toro' && q.y === 14 && (!q.if || RB.state.test(RB.game.s, q.if))).map((q) => !!(q.o && q.o.lit)));
  ok(lit.length === 2 && lit.every(Boolean) && has(again.lines, /not gone out since the night of the moths/) && again.r.enc.length === 1 && again.r.journal === 1,
    name + ', afterwards: both lanterns lit, and looking at one says so (the keepsake scene); no second battle (' + JSON.stringify({ lit, lines: again.lines.slice(0, 1), enc: again.r.enc.length }) + ')');
  await p.evaluate(() => { const P = RB.world.W.player; P.x = 28; P.y = 12; P.fx = 28; P.fy = 12; P.dir = 'up'; });
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(450); await p.keyboard.up('ArrowUp');
  await p.waitForTimeout(900);
  const z = await st(p);
  ok(z.pos[1] <= 11 && !z.run && z.enc.length === 1 && z.journal === 1, name + ', afterwards: the old strip starts nothing (' + JSON.stringify({ pos: z.pos, run: z.run, enc: z.enc.length }) + ')');
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3b. a lost defence: undone, and it can be tried again
{
  const { p, errors } = await at({ kr_hisae_met: true }, { stub: { result: 'lose' } });
  const { r } = await look(p, 27, 13, 'down');
  ok(r.enc.length === 1 && !r.done && !r.kept && r.stage === 3 && !r.journal, 'lost: undone, no quest step or journal line (' + JSON.stringify({ enc: r.enc.length, done: r.done, stage: r.stage }) + ')');
  const t = await look(p, 31, 13, 'down');
  ok(t.r.enc.length === 2, 'lost: the lantern starts it again (' + t.r.enc.length + ' starts)');
  ok(!errors.length, 'lost: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 4b. repeated presses at a lantern start it once
{
  const { p, errors } = await at({ kr_hisae_met: true }, { stub: { result: 'win', outcome: 'kept', flags: { kr_moths_kept: true } } });
  const { r } = await look(p, 27, 13, 'down', { twice: true });
  ok(r.enc.length === 1 && r.done && r.journal === 1, 'repeated presses: one battle, one journal line (' + JSON.stringify({ enc: r.enc.length, journal: r.journal }) + ')');
  ok(!errors.length, 'repeated presses: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 5. the strip north of the lanterns still starts it, as before
{
  const { p, errors } = await at({ kr_hisae_met: true }, { stub: { result: 'win', outcome: 'kept', flags: { kr_moths_kept: true } } });
  await p.evaluate(() => { const P = RB.world.W.player; P.x = 28; P.y = 12; P.fx = 28; P.fy = 12; P.dir = 'up'; });
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(450); await p.keyboard.up('ArrowUp');
  let r = null;
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(150); r = await st(p); if (r.line) await p.click('.dlg .b-next').catch(() => {}); if (r.done && !r.run) break; }
  ok(r && r.enc.length === 1 && r.done && r.stage === 4 && r.journal === 1, 'the strip north of the lanterns starts it as before (' + JSON.stringify({ enc: r && r.enc.length, done: r && r.done, stage: r && r.stage }) + ')');
  ok(!errors.length, 'strip: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nruin_lanterns: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
