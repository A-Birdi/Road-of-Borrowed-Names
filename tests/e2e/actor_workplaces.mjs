// Work happening without a dialogue box (the world review WR-01, WR-03, WR-06), in the BUILT game, headless
// Chromium, synthetic campaigns started at the room's door in the story state the review names:
//   the Harbourmaster's office (Chapter 2, before the confession), the Cinder glass workshop (Chapter 3,
//   before the festival), the Snowbell inn full of people on the storm night, the Lanternfall bakery (before
//   the bell), and the Archive camp (Chapter 6, on the way up).
// For each, the people are observed for OBSERVE_MS from the doorway: what each does (their habits and the
// held object), whether their work reads as work (an occupation at their station), that no routine moves
// anyone off their place or into the doorway, and that the room is not continuous spectacle (things happening
// at once stay within the cap; resting and listening people stay still between their habits).
// Then idle → conversation → story cue → return to the task, with real key presses:
// - Omi is writing at her desk; you talk to her: the brush stays in her hand through the conversation, no
//   habit plays during it, and once you are back in the world she takes the writing up again;
// - Hiro: his blowpipe keeps turning before anyone speaks (his resting stance holds the pipe, the work loop
//   runs); talking to him (co.hiro_first) the work goes on through his first lines and the gather is held to
//   cool when he says he will listen; afterwards he goes back to the pipe.
// Prints what each person did, for how long the room was watched, and writes stills to
// docs/screenshots/actors/workplace_*.png.
// Usage: node tests/e2e/actor_workplaces.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OBSERVE_MS = 45000;
const out = path.join(root, 'docs/screenshots/actors');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const F2 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const F3 = { ch1_done: true, ch2_done: true, departed: true };
const F4 = { ch1_done: true, ch2_done: true, ch3_done: true, departed: true, sb_storm: true };
const F5 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, departed: true, lf_town_intro: true };
const F6 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, departed: true };
const PLACES = [
  { key: 'office', map: 'sg.office', flags: F2, comp: 'nao', work: { omi: ['write', 'sort'] }, state: 'Chapter 2, before the confession' },
  { key: 'glass', map: 'co.glass', flags: F3, comp: 'mio', work: { hiro: ['glasswork'] }, state: 'Chapter 3, before the festival' },
  { key: 'inn', map: 'sb.inn', flags: F4, comp: 'ren', work: { yae: ['stir', 'tidy', 'countidle'] }, state: 'Chapter 4, the storm night (the inn full of people)' },
  { key: 'bakery', map: 'lf.bakery', flags: F5, comp: 'suzu', work: { lf_masaru: ['knead'] }, state: 'Chapter 5, before the bell (Masaru at his kneading bench)' },
  { key: 'camp', map: 'sa.camp', flags: F6, comp: 'nao', work: { sa_isamu: ['rubhands', 'cupear', 'sitidle'] }, state: 'Chapter 6, on the way up (Isamu waiting by the fire)' },
];
async function start(p, a) {
  await p.evaluate(async (a) => {
    RB.game.debugStart(a.map, null, null, { comp: a.comp, flags: a.flags, dir: 'up' });
    RB.game.settings.textSpeed = 'instant';
    for (const ev of RB.content.maps[a.map].onEnter || []) RB.game.s.flags['enter:' + a.map + ':' + ev.scene] = true;
    RB.staging.seed(2026);
    await new Promise((r) => setTimeout(r, 200));
    for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    RB.staging.resetStats();
  }, a);
}
// drive the open dialogue to its end: advance lines, pick the first reply when a choice comes up
async function finishDialogue(p, onLine) {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ open: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), choice: !!document.querySelector('.choices:not(.hidden) button') }));
    if (onLine) await onLine(i);
    if (st.mode === 'world' && !st.open) return i;
    if (st.choice) await p.evaluate(() => (document.querySelector('.choices:not(.hidden) button')).click());
    else await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(160);
  }
  return -1;
}

const report = [];
for (const a of PLACES) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, a);
  const obs = await p.evaluate(async (ms) => {
    const W = RB.world.W, t0 = performance.now();
    const homes = Object.fromEntries(W.npcs.map((n) => [n.id, [n.x, n.y]]));
    const keys = {}, held = {};
    let evMax = 0, doorway = 0;
    const exits = W.map.exits.map((e) => e.x + ',' + e.y);
    while (performance.now() - t0 < ms) {
      const evs = new Set();
      for (const n of W.npcs) {
        const r = n.stg && n.stg.run;
        if (r && r.owner === 'idle' && W.time >= r.t0 && !r.done) evs.add(r.ev);
        const f = RB.staging.frameOf(n, performance.now(), false, 'i0');
        (keys[n.id] = keys[n.id] || new Set()).add(f && f.key ? f.key : 'plain');
        if (f && f.key && f.key.includes('/')) held[n.id] = (held[n.id] || new Set()).add(f.key.split('/')[1].split(/[~:*]/)[0]);
        if (exits.includes(n.x + ',' + n.y)) doorway++;
      }
      evMax = Math.max(evMax, evs.size);
      await new Promise((r) => setTimeout(r, 150));
    }
    const per = {};
    for (const e of RB.staging.trace()) { const id = e.who.split('@')[0]; (per[id] = per[id] || []).push(e.h + (e.why !== 'idle' ? ' (' + e.why + ')' : '')); }
    const moved = W.npcs.filter((n) => !(n.def && n.def.wander) && (n.x !== homes[n.id][0] || n.y !== homes[n.id][1])).map((n) => n.id);
    const st = RB.staging.state();
    return { per, keys: Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, v.size])), held: Object.fromEntries(Object.entries(held).map(([k, v]) => [k, [...v]])), evMax, cap: RB.staging.stats().cap, moved, doorway, people: W.npcs.map((n) => n.id),
      cls: Object.fromEntries(st.actors.map((x) => [x.id, x.cls + '/' + x.tier + (x.rest ? ' rest ' + x.rest : '')])) };
  }, OBSERVE_MS);
  await p.screenshot({ path: path.join(out, 'workplace_' + a.key + '.png') });
  const line = a.key + ' (' + a.map + ', ' + a.state + ', watched ' + OBSERVE_MS / 1000 + ' s from the door): ' + obs.people.map((id) => id + ' [' + (obs.cls[id] || '') + '] ' + (obs.per[id] || ['—']).join(', ') + (obs.held[id] ? ' holding ' + obs.held[id].join('/') : '')).join('; ');
  console.log('     ' + line);
  report.push(line);
  for (const [who, kinds] of Object.entries(a.work)) {
    const did = (obs.per[who] || []).filter((h) => kinds.some((k) => h.startsWith(k)));
    ok(did.length >= 1 || (who === 'hiro' && (obs.held.hiro || []).some((x) => /^pipe/.test(x))), a.key + ': ' + who + ' works at their station before anyone speaks (' + (did.join(', ') || (obs.held[who] || []).join('/')) + ')');
  }
  ok(obs.moved.length === 0 && obs.doorway === 0, a.key + ': no routine moves anyone off their place or into the doorway');
  ok(obs.evMax <= Math.min(4, obs.cap), a.key + ': not continuous spectacle — at most ' + obs.evMax + ' thing(s) happening at once (cap ' + obs.cap + ')');
  ok(errors.length === 0, a.key + ': no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- Omi: writing → conversation → back to writing ------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, PLACES[0]);
  // walk up to the desk (5,5) and face Omi across it; wait until she is writing
  await p.evaluate(() => { RB.world.enter('sg.office', 5, 5, 'up'); });
  const writing = await p.evaluate(async () => {
    const W = RB.world.W, omi = W.npcs.find((n) => n.id === 'omi');
    const t0 = performance.now();
    while (performance.now() - t0 < 40000) { const r = omi.stg && omi.stg.run; if (r && r.id === 'write' && W.time - r.t0 > 300) return true; await new Promise((r) => setTimeout(r, 60)); }
    return false;
  });
  ok(writing, 'Omi is writing at her desk (the brush moving) before you speak');
  await p.keyboard.press('KeyZ');
  await p.waitForTimeout(250);
  const inTalk = await p.evaluate(() => {
    const W = RB.world.W, omi = W.npcs.find((n) => n.id === 'omi');
    const f = RB.staging.frameOf(omi, performance.now(), false, 'i0');
    return { open: RB.ui.dialogue.isOpen(), held: omi.stg && omi.stg.held ? omi.stg.held.kind : null, key: f && f.key, dir: omi.dir, idleRuns: W.npcs.filter((n) => n.stg && n.stg.run && n.stg.run.owner === 'idle').length };
  });
  ok(inTalk.open && inTalk.held === 'brush' && /\/brush/.test(inTalk.key || ''), 'talking to her, the brush stays in her hand (' + JSON.stringify(inTalk) + ')');
  ok(inTalk.idleRuns === 0 && inTalk.dir === 'down', 'she attends to you (facing you across the desk) and no habit plays during the conversation');
  await finishDialogue(p);
  const back = await p.evaluate(async () => {
    const W = RB.world.W, omi = W.npcs.find((n) => n.id === 'omi');
    const t0 = performance.now();
    while (performance.now() - t0 < 12000) { const r = omi.stg && omi.stg.run; if (r && r.id === 'write') return { ms: Math.round(performance.now() - t0), held: omi.stg.held }; await new Promise((r) => setTimeout(r, 60)); }
    return null;
  });
  ok(back && !back.held, 'back in the world she takes up the writing again (' + (back ? back.ms + ' ms after the conversation' : 'not seen') + '), the brush back in the work');
  ok(errors.length === 0, 'Omi: no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}
// ---- Hiro: the work before, during and after his introduction --------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, PLACES[1]);
  await p.evaluate(() => { RB.world.enter('co.glass', 3, 5, 'right'); });
  const before = await p.evaluate(async () => {
    const W = RB.world.W, h = W.npcs.find((n) => n.id === 'hiro');
    const keys = new Set(), t0 = performance.now();
    while (performance.now() - t0 < 9000) { const f = RB.staging.frameOf(h, performance.now(), false, 'i0'); if (f && f.key) keys.add(f.key.slice(2).replace(/[~:*].*$/, '')); await new Promise((r) => setTimeout(r, 80)); }
    return [...keys];
  });
  ok(before.some((k) => /^(pipehold|pipe[123]|blow)\//.test(k)) && new Set(before.filter((k) => /pipe[ABC]/.test(k)).map((k) => k.split('/')[1])).size >= 2, 'before anyone speaks, Hiro holds the blowpipe at his bench and turns it (' + before.slice(0, 6).join(' ') + ')');
  await p.keyboard.press('KeyZ');
  const during = [];
  await finishDialogue(p, async (i) => {
    const s = await p.evaluate(() => { const h = RB.world.W.npcs.find((n) => n.id === 'hiro'); const f = RB.staging.frameOf(h, performance.now(), false, 'i0'); const sh = RB.ui.dialogue.shown(); return { line: sh ? (sh.en || '').slice(0, 30) : null, run: h.stg && h.stg.run ? h.stg.run.id : null, key: f && f.key }; });
    if (s.line && !during.some((d) => d.line === s.line)) during.push(s);
  });
  console.log('     Hiro during co.hiro_first: ' + during.map((d) => '"' + d.line + '" ' + d.run + ' ' + (d.key || '')).join(' | '));
  ok(during.length >= 2 && during[0].run === 'glasswork' && /pipe[ABC]/.test(during[0].key || ''), 'his first line: the pipe keeps turning ("can\'t let go")');
  ok(during.some((d) => d.run === 'cool' && /pipecool/.test(d.key || '')), 'when he says he will listen, the gather is held still to cool');
  const after = await p.evaluate(async () => {
    const W = RB.world.W, h = W.npcs.find((n) => n.id === 'hiro');
    const t0 = performance.now();
    while (performance.now() - t0 < 15000) { const r = h.stg && h.stg.run; if (r && r.id === 'glasswork' && r.owner === 'idle') return Math.round(performance.now() - t0); await new Promise((r) => setTimeout(r, 80)); }
    return null;
  });
  ok(after != null, 'afterwards he goes back to the pipe (' + after + ' ms)');
  await p.screenshot({ path: path.join(out, 'workplace_glass_after.png') });
  ok(errors.length === 0, 'Hiro: no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}
fs.writeFileSync(path.join(out, 'workplaces.txt'), report.join('\n') + '\n');
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
