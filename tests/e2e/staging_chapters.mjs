// One performed overworld interaction per chapter, staged with the scene direction ops (docs/expressive/
// SCENES.md "Performed overworld"; the Chapter 2 showcase is tests/e2e/staging_wataru.mjs), in the BUILT game,
// headless Chromium. Each scene is started where it really plays (its map, the speaker at their place, you in
// front of them), from a synthetic campaign in the state the scene needs — a fixture of the moment, not a
// campaign played to it. A challenge inside a scene (Mio's refusal) is answered by a stand-in that reports
// success (the challenge runner itself is tested elsewhere). For every branch:
// - the scene plays to its end with its cues on the people it names (and nobody's idle life during it);
// - with staging switched off it ends in exactly the same state (flags, inventory, quests, variables, notes,
//   seen): staging changes nothing;
// - nobody ever shares a tile or stands on furniture; afterwards the people moved for the scene are back at
//   their places and your companion is beside you;
// plus what each scene is about:
//   Ch1 rw.hana_first (both replies): Hana looks to the two cups and you turn with her; the cup is held out;
//   Ch3 co.suzu_night (both replies): the night line is said over the room, not over black — the fade is
//        only the time changing; Suzu sits on the edge of the raised floor at night (scene ambience, gone at
//        the end), her account book in her hands, and stands when she decides to help;
//   Ch4 sb.yae: Yae counts the years on her fingers, and points the way north;
//   Ch5 lf.mio_refuse (before and after the bell): Mio steps up to the counter, your hand on her back on the
//        line that says so, her refusal with a flat hand, Tadashi's stamp held up;
//   Ch6 sa.isamu_return: the folio passes from your hand to Isamu's, seated at the fire, and he reads it.
// Evidence: docs/screenshots/actors/ch<N>_<scene>_<line>.png
//
// Then every staged overworld scene of Chapters 1 to 4 (docs/expressive/reports/staging_ch1_ch2.md,
// staging_ch3_ch4.md), data-driven: tests/e2e/staging_ch12_cases.mjs and staging_ch34_cases.mjs hold each scene's fixture and the branches that matter (choice picks, the
// four companions, the flags that change what is said), tests/e2e/staging_runner.mjs plays them (what it checks
// per branch is listed at its top: the scene ends, every cue names somebody there who can make it, every
// authored position is reached, nobody shares a tile or stands on furniture, no idle life, everyone where the
// world expects them afterwards, the expected gestures; and per scene, reduced motion keeps the cues, their
// order and the outcome, and staged and unstaged end in the same state). About 8 minutes per chapter.
// Evidence: docs/screenshots/staging/ch1_ch2/, docs/screenshots/staging/ch3_ch4/
// Chapters 5 and 6 the same way (docs/expressive/reports/staging_ch5_ch6.md): tests/e2e/staging_ch56_cases.mjs.
// Evidence: docs/screenshots/staging/ch5_ch6/
// And the staged scenes outside the chapter folders — the long quests, the deduction cases, The Pages We Keep, the
// pet vignettes and the other material not tied to one chapter (docs/expressive/reports/staging_lq_misc.md):
// tests/e2e/staging_misc_cases.mjs, played the same way (--ch=misc). Evidence: docs/screenshots/staging/misc/
// Usage: node tests/e2e/staging_chapters.mjs [--ch=1|2|3|4|5|6|misc|showcase] [--only=<scene prefix>,…] [--branches]
//   --ch=1 … --ch=6 / --ch=misc: only that chapter's (or group's) data-driven cases (no showcase); --ch=showcase: only
//   the showcase above
//   --only: only the cases whose scene id starts with one of the prefixes
//   --branches: compare every branch (not only each scene's first) with reduced motion and unstaged
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { runCases } from './staging_runner.mjs';
import { CH12 } from './staging_ch12_cases.mjs';
import { CH34 } from './staging_ch34_cases.mjs';
import { CH56 } from './staging_ch56_cases.mjs';
import { MISC } from './staging_misc_cases.mjs';

const ARGS = process.argv.slice(2);
const arg = (k) => { const a = ARGS.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const CH = arg('ch'), ONLY = (arg('only') || '').split(',').filter(Boolean);

const out = path.join(root, 'docs/screenshots/actors');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const C1 = { rw_arrived: true, rw_met_tsuru: true };
const C3 = { rw_arrived: true, departed: true, ch1_done: true, ch2_done: true, co_chronicle_read: true };
const C4 = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true };
const C5 = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_town_intro: true };
const C6 = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true };
const CASES = [
  { ch: 1, scene: 'rw.hana_first', map: 'rw.tea', at: [2, 4, 'up'], comp: null, flags: C1, pick: [0, 1], speaker: 'hana', expect: { hana: ['observe', 'present'], pc: ['listen'] }, shots: [1, 6] },
  { ch: 3, scene: 'co.suzu_night', map: 'co.inn', at: null, comp: 'suzu', flags: C3, pick: [0, 1], expect: { comp: ['lowered', 'read', 'present'] }, shots: [0, 9, 14] },
  { ch: 4, scene: 'sb.yae', map: 'sb.inn', at: [13, 4, 'up'], comp: 'ren', flags: C4, pick: [0], expect: { yae: ['count', 'point'], comp: ['glasses'] }, shots: [5, 8] },
  { ch: 5, scene: 'lf.mio_refuse', map: 'lf.records', at: [7, 5, 'up'], comp: 'mio', flags: C5, quests: { lf_mio: 2 }, pick: [0], expect: { comp: ['emphatic', 'fidget'], pc: ['touchback'] }, shots: [3, 4, 8] },
  { ch: 5, scene: 'lf.mio_refuse', map: 'lf.records', at: [7, 5, 'up'], comp: 'mio', flags: Object.assign({ lf_bell_rung: true }, C5), quests: { lf_mio: 2 }, pick: [0], expect: { comp: ['emphatic'] }, branch: 'after the bell' },
  { ch: 6, scene: 'sa.isamu_return', map: 'sa.camp', at: [15, 11, 'right'], comp: 'mio', flags: C6, items: { sa_folio_isamu: 1 }, quests: { sa_isamu: 'start' }, pick: [0], expect: { pc: ['handover'], sa_isamu: ['receive', 'read'], comp: ['present'] }, shots: [0, 2, 6] },
];

async function runScene(p, c, o) {
  return p.evaluate(async ([c, o]) => {
    RB.game.debugStart(c.map, c.at ? c.at[0] : null, c.at ? c.at[1] : null, { comp: c.comp || undefined, flags: c.flags, dir: c.at ? c.at[2] : 'up' });
    const s = RB.game.s;
    if (!c.comp) s.comp = null, RB.world.placeCompanion();
    for (const [k, n] of Object.entries(c.items || {})) RB.state.give(s, k, n);
    for (const [k, st] of Object.entries(c.quests || {})) RB.state.setQuest(s, k, st);
    for (const ev of RB.content.maps[c.map].onEnter || []) s.flags['enter:' + c.map + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.staging.enabled(o.staged);
    RB.staging.seed(5);
    // a stand-in for the challenge (answered correctly); the challenge runner is tested elsewhere
    RB.challenge.run = async () => ({ ok: true });
    await new Promise((r) => setTimeout(r, 400));
    const W = RB.world.W;
    const homes = Object.fromEntries(W.npcs.map((n) => [n.id, [n.x, n.y]]));
    const log = [];
    const cue0 = RB.staging.cue;
    RB.staging.cue = function (ref, gid) { log.push({ who: typeof ref === 'string' ? ref : ref === W.player ? 'pc' : ref === W.comp ? 'comp' : ref.id, g: gid }); return cue0.apply(this, arguments); };
    const clash = [], furn = [], idle = [], info = { blackOnNight: null, sitting: 0, ambience: 0 };
    let watching = true;
    const watch = () => {
      if (!watching) return;
      // (a following companion on your own tile at a doorway is the game's follow rule, not staging)
      const follow = W.comp && !RB.staging.owned(W.comp) && W.comp.x === W.player.x && W.comp.y === W.player.y;
      const all = W.npcs.concat(W.extras || [], W.comp && !follow ? [W.comp] : [], [W.player]);
      const seen = new Map();
      for (const a of all) for (const [x, y] of [[a.x, a.y]].concat(a.mv ? [[a.mv.tx, a.mv.ty]] : [])) {
        const k = x + ',' + y;
        if (seen.has(k) && seen.get(k) !== a) clash.push(k);
        seen.set(k, a);
        if (RB.maps.blockedStatic(W.map, x, y)) furn.push((a.id || 'pc') + '@' + k);
      }
      if (RB.script.isRunning()) {
        for (const a of all) if (a.stg && a.stg.run && a.stg.run.owner === 'idle') idle.push(a.id || 'pc');
        if (RB.staging.ambienceNow()) info.ambience++;
        if (W.comp) { const f = RB.staging.frameOf(W.comp, performance.now(), false, 'i0'); if (f && f.key && /\+sit|^p:sit/.test(f.key)) info.sitting++; }
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    let done = false;
    RB.script.run(c.scene).then(() => { done = true; });
    let n = 0, picks = (c.pick || [0]).slice(o.pick || 0);
    let seenLines = s.backlog.length;
    const lines = [];
    for (let i = 0; i < 600 && !done; i++) {
      await new Promise((r) => setTimeout(r, 30));
      const ch = document.querySelector('.choices:not(.hidden) button');
      if (ch) { const bs = document.querySelectorAll('.choices:not(.hidden) button'); (bs[o.pick || 0] || bs[0]).click(); await new Promise((r) => setTimeout(r, 120)); continue; }
      const sh = RB.ui.dialogue.shown();
      if (!sh || !RB.ui.dialogue.isOpen() || s.backlog.length === seenLines) continue;
      seenLines = s.backlog.length;
      // the night line of Suzu's scene: is the screen black under it?
      if (/That night, Suzu/.test(sh.en || '')) info.blackOnNight = document.querySelector('.fade').classList.contains('on');
      await new Promise((r) => setTimeout(r, o.dwell));
      lines.push((sh.who || '') + ': ' + (sh.en || '').slice(0, 40));
      if (o.shots && o.shots.includes(n)) { window.__shotReady = n; await new Promise((r) => { const w = () => (window.__shotReady == null ? r() : setTimeout(w, 30)); w(); }); }
      n++;
      RB.ui.dialogue.advance(true);
    }
    const t0 = performance.now();
    while (!done && performance.now() - t0 < 6000) await new Promise((r) => setTimeout(r, 50));
    await new Promise((r) => setTimeout(r, 3000));
    watching = false;
    RB.staging.cue = cue0;
    const quests = Object.fromEntries(Object.entries(s.quests).map(([k, q]) => [k, { stage: q.stage, done: q.done }]));
    const state = JSON.stringify({ flags: Object.keys(s.flags).filter((f) => !/^enter:|^named:|^trig:/.test(f)).sort(), inv: s.inv, quests, vars: s.vars, notes: s.notebook.map((x) => x.id).sort(), seen: Object.keys(s.seen).sort() });
    const away = W.npcs.filter((a) => homes[a.id] && (a.x !== homes[a.id][0] || a.y !== homes[a.id][1]) && !(a.def && a.def.wander)).map((a) => a.id + '@' + a.x + ',' + a.y);
    const comp = W.comp ? Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) : 0;
    return { done, lines, log, state, clash: [...new Set(clash)], furn: [...new Set(furn)], idle: [...new Set(idle)], info, away, comp, ambienceAfter: !!RB.staging.ambienceNow() };
  }, [c, o]);
}

for (const c of (CH && CH !== 'showcase') || ONLY.length ? [] : CASES) {
  for (const pick of c.pick || [0]) {
    const tag = 'Ch' + c.ch + ' ' + c.scene + (c.branch ? ' (' + c.branch + ')' : '') + ((c.pick || [0]).length > 1 ? ' (reply ' + (pick + 1) + ')' : '');
    const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    // screenshots at the chosen lines (taken while the run waits)
    const shooter = (async () => {
      for (let i = 0; i < 400; i++) {
        const n = await p.evaluate(() => window.__shotReady).catch(() => null);
        if (n != null) { await p.screenshot({ path: path.join(out, 'ch' + c.ch + '_' + c.scene + (c.branch ? '_after' : '') + '_' + String(n).padStart(2, '0') + '.png') }); await p.evaluate(() => { window.__shotReady = null; }); }
        await p.waitForTimeout(80);
        if (await p.evaluate(() => window.__stopShots).catch(() => true)) break;
      }
    })();
    const r = await runScene(p, c, { staged: true, dwell: 600, pick, shots: pick === 0 ? c.shots : null });
    await p.evaluate(() => { window.__stopShots = true; });
    await shooter;
    ok(r.done && r.lines.length >= 3, tag + ': plays to its end (' + r.lines.length + ' lines)');
    for (const [who, gs] of Object.entries(c.expect)) {
      const got = r.log.filter((x) => x.who === who || (who === 'comp' && x.who === c.comp)).map((x) => x.g);
      ok(gs.every((g) => got.includes(g)), tag + ': ' + who + ' performs ' + gs.join(', ') + ' (cued: ' + [...new Set(got)].join(', ') + ')');
    }
    ok(r.clash.length === 0 && r.furn.length === 0, tag + ': nobody shares a tile or stands on furniture (' + r.clash.concat(r.furn).slice(0, 3).join(' ') + ')');
    ok(r.idle.length === 0, tag + ': no idle life during the scene (' + r.idle.join(' ') + ')');
    ok(r.away.length === 0 && r.comp <= 2, tag + ': afterwards people are back at their places and your companion beside you (' + r.away.join(' ') + '; companion ' + r.comp + ' tiles away)');
    if (c.scene === 'co.suzu_night') {
      ok(r.info.blackOnNight === false, 'Ch3: "That night, Suzu is sitting alone…" is said over the room, not over a black screen');
      ok(r.info.sitting > 10 && r.info.ambience > 10 && !r.ambienceAfter, 'Ch3: Suzu sits on the raised floor\'s edge in the night ambience, which ends with the scene (' + r.info.sitting + ' frames sitting)');
    }
    const u = await runScene(p, c, { staged: false, dwell: 20, pick });
    ok(u.done && u.state === r.state, tag + ': staged and unstaged end in the same state' + (u.state === r.state ? '' : '\n      staged   ' + r.state + '\n      unstaged ' + u.state));
    ok(errors.length === 0, tag + ': no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
    await p.context().close();
  }
}
// ---- Chapters 1 to 6, every staged overworld scene ------------------------------------------------------------
if (CH !== 'showcase') {
  const cases = CH12.concat(CH34, CH56, MISC).filter((c) => (!CH || String(c.ch) === CH || c.group === CH) && (!ONLY.length || ONLY.some((f) => c.scene.startsWith(f))));
  const t0 = Date.now();
  let cur = null, runs = 0, from = '';
  // a fresh page every 20 branches (and its page errors checked when it is let go)
  const release = async () => {
    if (!cur) return;
    ok(cur.errors.length === 0, 'Chapter cases from ' + from + ': no page errors' + (cur.errors.length ? ': ' + cur.errors.slice(0, 2).join(' | ') : ''));
    await cur.p.context().close();
    cur = null;
  };
  await runCases(cases, {
    ok, dwell: 60, branches: ARGS.includes('--branches'),
    page: async () => { if (cur && runs % 20 === 0) await release(); if (!cur) cur = await page(b, url, { viewport: { width: 960, height: 640 } }); return cur.p; },
    after: async (p, c) => { runs++; if (runs % 20 === 1) from = c.scene; },
  });
  await release();
  console.log('Chapter cases: ' + cases.length + ' scenes in ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s');
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
