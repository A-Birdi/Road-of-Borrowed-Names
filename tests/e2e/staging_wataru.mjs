// The §14 showcase, Wataru and the Harbourmaster (`sg.omi_wataru`, src/content/ch2/21_scenes_main.js), staged on
// the overworld, in the BUILT game, headless Chromium. Each run starts exactly where the confrontation leaves
// the party (`!warp sg.office 5 6 up`, then `!call sg.omi_wataru`) with the flags its choice set — a synthetic
// fixture of that moment, not a campaign played to it. For both routes (sg_wataru_self: Wataru speaks for
// himself; otherwise the party opens) × the four companions (8 combinations):
// - the right performer leads: on Wataru's route he takes the forward place at the desk's corner before his
//   first line and the party stays behind him; on the party's route you step up to the desk and open, and
//   Wataru steps up into his own admission on his line;
// - Omi's acknowledgement (a restrained nod on "…you came and said it yourself") only on Wataru's route;
// - the companion's reaction is the actual companion's (Mio a nod, Suzu weighing with both hands, Nao looking
//   between Omi and Wataru, Ren turning to Omi then a nod; Suzu's later aside a lowered head);
// - the notice: you hold it out and it passes to Wataru's hands on the line that says so (the !take stays the
//   only inventory change), and he reads it;
// - the same scene with staging switched off ends in exactly the same state (flags, inventory, quests,
//   variables, notes, seen scenes): staging changes no state;
// - no two people ever share a tile and nobody stands on furniture, at any frame of the scene;
// - nobody's idle life plays during it, and Suzu's hand-on-hip stance does not show in this conversation;
// - the scene ends with the office arranged plausibly (Omi at her desk, nobody on the desk, Wataru on his way
//   out of the door, your companion beside you);
// - a fast reader (advancing as soon as each line shows) leaves no gesture half-way: every cue settles at its
//   hold or ends when the line moves on;
// - with reduced motion every cue shows its held key pose (no in-betweens).
// Evidence: docs/screenshots/actors/wataru_<route>_<line>.png; with --video, a clip of each route.
// Usage: node tests/e2e/staging_wataru.mjs [--video]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const VIDEO = process.argv.includes('--video');
const out = path.join(root, 'docs/screenshots/actors');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true, sg_clue_asahi: true, sg_clue_genzo: true, sg_clue_kiyo: true, sg_wataru_confessed: true };

// set up the moment of the warp; run the scene, advancing like a reader (dwell ms per line), recording
async function runScene(p, o) {
  return p.evaluate(async (o) => {
    const flags = Object.assign({}, o.base, o.self ? { sg_wataru_self: true } : {});
    RB.game.debugStart('sg.office', 5, 6, { comp: o.comp, flags, dir: 'up' });
    RB.state.give(RB.game.s, 'sg_notice', 1);
    RB.state.setQuest(RB.game.s, 'sg_main', 4);
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.staging.enabled(o.staged !== false);
    RB.staging.seed(99);
    await new Promise((r) => setTimeout(r, 400));
    const W = RB.world.W;
    // the cue log: who was cued with what, on which line
    const log = [];
    const cue0 = RB.staging.cue;
    RB.staging.cue = function (ref, gid) { const sh = RB.ui.dialogue.shown(); log.push({ who: typeof ref === 'string' ? ref : ref === W.player ? 'pc' : ref === W.comp ? 'comp' : ref.id, g: gid, prev: sh ? (sh.en || '').slice(0, 40) : null }); return cue0.apply(this, arguments); };
    // every frame: nobody shares a tile, nobody stands on furniture, nobody idles
    const clash = [], furn = [], idle = [], hip = [], nonStill = [];
    let watching = true;
    const watch = () => {
      if (!watching) return;
      const all = W.npcs.concat(W.extras || []).concat(W.comp ? [W.comp] : [], [W.player]);
      const seen = new Map();
      for (const a of all) {
        for (const [x, y] of [[a.x, a.y]].concat(a.mv ? [[a.mv.tx, a.mv.ty]] : [])) {
          const k = x + ',' + y;
          if (seen.has(k) && seen.get(k) !== a) clash.push(k + ' ' + (a.id || 'pc') + '/' + (seen.get(k).id || 'pc'));
          seen.set(k, a);
          if (RB.maps.blockedStatic(W.map, x, y)) furn.push((a.id || 'pc') + '@' + k);
        }
        if (!RB.script.isRunning()) continue; // (before the scene starts and after it ends, life goes on)
        if (a.stg && a.stg.run && a.stg.run.owner === 'idle') idle.push(a.id || 'pc');
        if (W.comp && a === W.comp && W.comp.id === 'suzu') { const f = RB.staging.frameOf(a, performance.now(), false, 'i0'); if (f && f.key && /^p:hip\b/.test(f.key)) hip.push(f.key); }
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    const lines = [];
    let done = false;
    RB.script.run('sg.omi_wataru').then(() => { done = true; });
    const pos = (id) => { const a = id === 'pc' ? W.player : id === 'comp' ? W.comp : W.npcs.find((n) => n.id === id); return a ? [a.x, a.y] : null; };
    let seenLines = RB.game.s.backlog.length;
    for (let i = 0; i < 400 && !done; i++) {
      await new Promise((r) => setTimeout(r, 30));
      const sh = RB.ui.dialogue.shown();
      // a new line is on screen (the history grows by one per line shown)
      if (!sh || !RB.ui.dialogue.isOpen() || RB.game.s.backlog.length === seenLines) continue;
      seenLines = RB.game.s.backlog.length;
      await new Promise((r) => setTimeout(r, o.dwell));
      const st = RB.staging.state();
      const at = (id) => { const a = st.actors.find((x) => x.id === id); return a ? { run: a.run && a.run.id, holding: a.run && a.run.holding, held: a.held, pose: a.pose, x: a.x, y: a.y } : null; };
      const fresh = [];
      for (const a of st.actors) if (a.run && a.run.owner === 'scene' && !a.run.holding) fresh.push(a.id);
      if (o.reduce) for (const a of st.actors) if (a.run && a.run.owner === 'scene' && !a.run.still) nonStill.push(a.id + ':' + a.run.id);
      lines.push({ who: sh.who, en: (sh.en || '').slice(0, 48), omi: at('omi'), wataru: at('wataru_office'), pc: at('pc'), comp: at('comp'), wpos: pos('wataru_office'), ppos: pos('pc'), cpos: pos('comp') });
      const T0 = W.time;
      RB.ui.dialogue.advance(true);
      // right after the advance: anything cued before it still running half-way? (settled = none; the cues
      // of the next line start after the advance and do not count)
      await new Promise((r) => setTimeout(r, 0));
      const all = W.npcs.concat(W.comp ? [W.comp] : [], [W.player]);
      lines[lines.length - 1].unsettled = all.filter((a) => a.stg && a.stg.run && a.stg.run.owner === 'scene' && !a.stg.run.holding && !a.stg.run.loop && !a.stg.run.done && a.stg.run.t0 < T0 && !a.stg.run.chain).map((a) => (a.id || 'pc') + ':' + a.stg.run.id);
    }
    const t0 = performance.now();
    while (!done && performance.now() - t0 < 5000) await new Promise((r) => setTimeout(r, 50));
    await new Promise((r) => setTimeout(r, 2600));
    watching = false;
    RB.staging.cue = cue0;
    const s = RB.game.s;
    const omi = W.npcs.find((n) => n.id === 'omi');
    const quests = Object.fromEntries(Object.entries(s.quests).map(([k, q]) => [k, { stage: q.stage, done: q.done }])); // (not the time stamp)
    const state = JSON.stringify({ flags: Object.keys(s.flags).filter((f) => !/^enter:|^named:|^trig:/.test(f)).sort(), inv: s.inv, quests, vars: s.vars, notes: s.notebook.map((n) => n.id).sort(), seen: Object.keys(s.seen).sort() });
    const end = { omi: omi ? [omi.x, omi.y, omi.dir] : null, onDesk: [[4, 4], [5, 4]].some(([x, y]) => W.npcs.concat(W.comp ? [W.comp] : [], [W.player]).some((a) => a.x === x && a.y === y)),
      wataruHere: W.npcs.some((n) => n.id === 'wataru_office'), wataruLeaving: (W.leavers || []).some((n) => n.id === 'wataru_office'), pc: [W.player.x, W.player.y], comp: W.comp ? [W.comp.x, W.comp.y] : null };
    return { done, lines, log, nonStill, clash: [...new Set(clash)], furn: [...new Set(furn)], idle: [...new Set(idle)], hip: hip.length, state, end };
  }, o);
}

const COMPS = ['mio', 'suzu', 'nao', 'ren'];
const EXPECT = { mio: 'nod', suzu: 'size', nao: 'lookbetween', ren: 'listen' };
for (const self of [true, false]) for (const comp of COMPS) {
  const route = self ? 'Wataru\'s route' : 'the party\'s route';
  const tag = (self ? 'self' : 'party') + '/' + comp;
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await runScene(p, { base: BASE, comp, self, dwell: 650, staged: true });
  const L = r.lines;
  ok(r.done && L.length >= 18, tag + ': the scene plays to its end (' + L.length + ' lines)');
  // who leads
  if (self) {
    const first = L[0];
    ok(first.who === 'wataru' && first.wpos && first.wpos[0] === 6 && first.wpos[1] === 4 && first.ppos[0] === 5 && first.ppos[1] === 6, tag + ': Wataru takes the forward place at the desk before his first line; you stay behind his lead (' + JSON.stringify([first.wpos, first.ppos]) + ')');
  } else {
    const first = L[0], second = L[1];
    ok(first.who === 'pc' && first.ppos[0] === 5 && first.ppos[1] === 5 && first.wpos && first.wpos[0] === 7, tag + ': you step up to the desk and open while Wataru is still back at his place (' + JSON.stringify([first.ppos, first.wpos]) + ')');
    ok(second.who === 'wataru' && second.wpos && second.wpos[0] === 6 && second.wpos[1] === 4, tag + ': Wataru steps up into his own admission on his line (' + JSON.stringify(second.wpos) + ')');
  }
  // Omi's acknowledgement only on Wataru's route
  const omiNods = r.log.filter((c) => c.who === 'omi' && c.g === 'nod');
  ok(self ? omiNods.length === 1 : omiNods.length === 0, tag + ': Omi\'s acknowledgement ' + (self ? 'comes once, on his own route' : 'does not come on the party\'s route') + ' (' + omiNods.length + ')');
  const ackLine = L.find((l) => /came and said it yourself/.test(l.en));
  ok(self ? !!ackLine : !ackLine, tag + ': the conditional line ' + (self ? 'is there' : 'is not there') + ', as written');
  // the companion's own reaction
  const compCues = r.log.filter((c) => c.who === 'comp').map((c) => c.g);
  ok(compCues.includes(EXPECT[comp]) && Object.entries(EXPECT).every(([c, g]) => c === comp || g === 'listen' || g === 'nod' || !compCues.includes(g)), tag + ': the companion reacts as ' + comp + ' (' + compCues.join(', ') + ')');
  ok(comp === 'suzu' ? compCues.includes('lowered') : !compCues.includes('lowered'), tag + ': Suzu\'s lowered head after the notice only when she is there');
  // the notice
  const hand = L.find((l) => /final notice back/.test(l.en)), read = L.find((l) => /open it\. Now/.test(l.en));
  ok(hand && read && read.wataru && read.wataru.held === 'notice' && read.wataru.run === 'read' && !(read.pc && read.pc.held), tag + ': the notice passes from your hand to Wataru\'s, and he reads it (' + JSON.stringify(read && read.wataru) + ')');
  ok(r.clash.length === 0, tag + ': nobody ever shares a tile (' + r.clash.slice(0, 3).join(' ') + ')');
  ok(r.furn.length === 0, tag + ': nobody stands on or walks through furniture (' + r.furn.slice(0, 3).join(' ') + ')');
  ok(r.idle.length === 0, tag + ': no idle life plays during the scene (' + r.idle.slice(0, 3).join(' ') + ')');
  if (comp === 'suzu') ok(r.hip === 0, tag + ': Suzu\'s hand-on-hip stance does not show in this conversation');
  ok(r.end.omi && r.end.omi[0] === 5 && r.end.omi[1] === 3 && !r.end.onDesk && !r.end.wataruHere && r.end.comp && Math.abs(r.end.comp[0] - r.end.pc[0]) + Math.abs(r.end.comp[1] - r.end.pc[1]) <= 2,
    tag + ': the office is arranged plausibly at the end (' + JSON.stringify(r.end) + ')');
  // the same scene unstaged: the same state
  const u = await runScene(p, { base: BASE, comp, self, dwell: 40, staged: false });
  ok(u.done && u.state === r.state, tag + ': staged and unstaged end in the same state (flags, inventory, quests, variables, notes, seen)' + (u.state === r.state ? '' : '\n      staged   ' + r.state + '\n      unstaged ' + u.state));
  ok(errors.length === 0, tag + ': no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  if (comp === 'mio') console.log('     ' + route + ' / Mio: ' + L.map((l) => l.who + ':' + (l.wataru && l.wataru.run || '-') + '/' + (l.omi && l.omi.run || '-')).join(' '));
  await p.context().close();
}
// ---- a fast reader; reduced motion ---------------------------------------------------------------------------------------
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await runScene(p, { base: BASE, comp: 'nao', self: true, dwell: 20, staged: true });
  const un = r.lines.filter((l) => l.unsettled && l.unsettled.length);
  ok(r.done && un.length === 0, 'a fast reader: when a line moves on early, every gesture of it settles (held or ended), none is left half-way (' + JSON.stringify(un.slice(0, 2)) + ')');
  const rr = await runScene(p, { base: BASE, comp: 'mio', self: false, dwell: 120, staged: true, reduce: true });
  ok(rr.done && rr.log.length > 10 && rr.nonStill.length === 0, 'reduced motion: every cue shows its held key pose, no in-betweens (' + rr.log.length + ' cues; ' + rr.nonStill.slice(0, 3).join(' ') + ')');
  await p.context().close();
}
// ---- stills of both routes ---------------------------------------------------------------------------------------------------
for (const self of [true, false]) {
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const route = self ? 'self' : 'party';
  await p.evaluate(async ([BASE, self]) => {
    RB.game.debugStart('sg.office', 5, 6, { comp: 'mio', flags: Object.assign({}, BASE, self ? { sg_wataru_self: true } : {}), dir: 'up' });
    RB.state.give(RB.game.s, 'sg_notice', 1);
    RB.game.settings.textSpeed = 'instant';
    await new Promise((r) => setTimeout(r, 400));
    window.__done = false;
    RB.script.run('sg.omi_wataru').then(() => { window.__done = true; });
  }, [BASE, self]);
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(700);
    const sh = await p.evaluate(() => { const s = RB.ui.dialogue.shown(); return { done: window.__done, en: s ? s.en : '' }; });
    if (sh.done) break;
    if (/sold the cargo|It was me|Make them|company's fault|not dismissing|final notice back|open it\. Now|back to the warehouse/.test(sh.en)) await p.screenshot({ path: path.join(out, 'wataru_' + route + '_' + String(i).padStart(2, '0') + '.png'), clip: { x: 300, y: 60, width: 680, height: 600 } });
    await p.evaluate(() => RB.ui.dialogue.advance(true));
  }
  await p.context().close();
}
if (VIDEO) {
  const dir = path.join(out, 'video');
  fs.mkdirSync(dir, { recursive: true });
  for (const self of [true, false]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir, size: { width: 960, height: 600 } } });
    const { p } = await page(b, url, { context: ctx });
    await p.evaluate(async ([BASE, self]) => {
      RB.game.debugStart('sg.office', 5, 6, { comp: 'mio', flags: Object.assign({}, BASE, self ? { sg_wataru_self: true } : {}), dir: 'up' });
      RB.state.give(RB.game.s, 'sg_notice', 1);
      RB.game.settings.textSpeed = 'fast';
      await new Promise((r) => setTimeout(r, 400));
      window.__done = false;
      RB.script.run('sg.omi_wataru').then(() => { window.__done = true; });
    }, [BASE, self]);
    for (let i = 0; i < 40; i++) {
      await p.waitForTimeout(1500);
      if (await p.evaluate(() => window.__done)) break;
      await p.evaluate(() => RB.ui.dialogue.advance(false));
      await p.waitForTimeout(60);
      await p.evaluate(() => RB.ui.dialogue.advance(false));
    }
    await p.waitForTimeout(1500);
    const v = p.video();
    await ctx.close();
    fs.renameSync(await v.path(), path.join(dir, 'wataru_omi_' + (self ? 'self' : 'party') + '_route.webm'));
    console.log('     clip docs/screenshots/actors/video/wataru_omi_' + (self ? 'self' : 'party') + '_route.webm');
  }
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
