// The illustrated sequences of Chapters 5 and 6 (src/ui/43e_seq_ch5.js, 43f_seq_ch6.js; docs/expressive/SHOTS.md §5,
// §6, §7b) in the BUILT game, headless Chromium, data-driven: each run starts the scene from a synthetic starting
// point (RB.game.debugStart at the scene's place with the flags and items its callers give) and is played with real
// clicks on Next and on the replies, on every branch the scenes have:
//   ch5.bell  lf.bell_touch: "Ring the bell" with each companion (their lines and their own gesture differ), once
//             on the Foundations profile (the kana lesson and its practice shown over the held shot, the challenge
//             left for later with its own "Come back later"), and "Not yet" (the scene ends; the picture goes)
//   ch5.boat  lf.boat_to_tower: "Row out" (the crossing lifted out of the fade, then the tower) and "Not yet"
//   ch6.toya  sa.toya_read: with and without Tōya's bell, with each companion
//   ch6.ren   sa.shelf_ren: Ren's open branch by "Take it back" and by "You decide"; "Leave it" and another companion
//             (no sequence)
// Checks, per run: the shots shown, in order, and every phase of each reached; the scene's state afterwards (flags,
// items, quests, the place) — the world as the sequence left it (HX52); no page error; nothing of the player left;
// for one run of each kept sequence, the Shared memory's read-only replay (the same beats and shots; nothing changed).
// Per sequence: 8 s idle moves nothing on; Previous looks back read-only (campaign state unchanged) and Next
// rejoins without moving on; Skip scene asks first (unseen), Keep watching keeps the line, a confirmed skip stops at
// the challenge / the end and runs the state lines once; reduced motion holds each action's end at once and no
// shake fires; at 1280×720, 390×844 and 844×390 every shot's focal area stays above the dialogue sheet at every line.
// Challenges (other than the one left for later) are answered by the game's own test solver (RB.test.solveStep
// through the real answer checker), wrapped round RB.challenge.run for the run.
// Usage: node tests/e2e/sequence_chapters_56.mjs [--only ch5.bell,ch6.toya,ch6.ren] [--shots | --shots-only]
//   --shots: also write the evidence stills (each shot at its hold, three sizes) to docs/screenshots/sequences/;
//   --shots-only: only the three-size runs (section 4) and their stills
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const oi = args.indexOf('--only'), ONLY = oi >= 0 ? args[oi + 1].split(',') : null;
const SHOTS = args.includes('--shots') || args.includes('--shots-only'), SHOTS_ONLY = args.includes('--shots-only');
const IDLE = 8000;
const OUT = path.join(root, 'docs/screenshots/sequences');
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const wait = (p, ms) => p.waitForTimeout(ms);
const SIZES = [['1280x720', { width: 1280, height: 720 }, 1], ['390x844', { width: 390, height: 844 }, 3], ['844x390', { width: 844, height: 390 }, 3]];

const DONE5 = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, sb_hoshino_goes: true };
const SETUP = {
  'lf.bell_touch': { at: ['lf.bellhall', 8, 5, 'down'], flags: Object.assign({ lf_tower_entered: true, lf_gate_a: true, lf_gate_b: true, lf_gate_c: true, lf_boss_done: true, lf_tokuji_boat: true }, DONE5), quests: [['lf_main', 8]] },
  'lf.boat_to_tower': { at: ['lf.sluice', 18, 17, 'down'], flags: Object.assign({ lf_tokuji_told: true, lf_tokuji_boat: true }, DONE5), quests: [['lf_main', 6]] },
  'sa.toya_read': { at: ['sa.heart', 12, 9, 'up'], flags: Object.assign({ ch5_done: true, sa_arrived: true, sa_hush_down: true }, DONE5), give: ['sa_letter_kasane', 'sa_toya_reply', 'sa_notice'], quests: [['sa_main', 5]] },
  'sa.shelf_ren': { at: ['sa.memories', 4, 7, 'up'], flags: Object.assign({ ch5_done: true, sa_arrived: true, sa_promise_done: true }, DONE5), quests: [['sa_main', 4], ['ren_ushio', 1]] },
};
const BELL = ['bell', 'gong', 'town', 'hall'], TOYA = ['folio', 'floor', 'turned', 'bell', 'decide'], REN = ['open', 'face', 'ren'];
const RUNS = [
  { name: 'ch5.bell · ring · Nao · Foundations (the kana lesson and the challenge over the held shot)', seq: 'ch5.bell', scene: 'lf.bell_touch', comp: 'nao', profile: 'F', live: true, choose: ['Ring the bell'], shots: BELL,
    after: (r) => r.flags.lf_bell_rung && r.map === 'lf.sluice' && r.q.lf_main === 9 && r.mem },
  { name: 'ch5.bell · ring · Mio', seq: 'ch5.bell', scene: 'lf.bell_touch', comp: 'mio', choose: ['Ring the bell'], shots: BELL, after: (r) => r.flags.lf_bell_rung && r.map === 'lf.sluice' && r.mem, replay: true },
  { name: 'ch5.bell · ring · Ren', seq: 'ch5.bell', scene: 'lf.bell_touch', comp: 'ren', choose: ['Ring the bell'], shots: BELL, after: (r) => r.flags.lf_bell_rung && r.map === 'lf.sluice' },
  { name: 'ch5.bell · ring · Suzu', seq: 'ch5.bell', scene: 'lf.bell_touch', comp: 'suzu', choose: ['Ring the bell'], shots: BELL, after: (r) => r.flags.lf_bell_rung && r.map === 'lf.sluice' },
  { name: 'ch5.bell · Not yet · Mio (the scene ends; the picture goes; nothing rung)', seq: 'ch5.bell', scene: 'lf.bell_touch', comp: 'mio', choose: ['Not yet'], shots: ['bell'],
    after: (r) => !r.flags.lf_bell_rung && r.map === 'lf.bellhall' && !r.mem && r.world },
  { name: 'ch5.boat · Row out · Suzu (lifted out of the fade; the tower after)', seq: 'ch5.boat', scene: 'lf.boat_to_tower', comp: 'suzu', choose: ['Row out'], shots: ['cross'],
    after: (r) => r.map === 'lf.tower_top' && !r.dark && r.world },
  { name: 'ch5.boat · Not yet (no sequence)', seq: 'ch5.boat', scene: 'lf.boat_to_tower', comp: 'mio', choose: ['Not yet'], shots: [], after: (r) => r.map === 'lf.sluice' && !r.dark && r.world },
  { name: 'ch6.toya · with Tōya\'s bell · Ren', seq: 'ch6.toya', scene: 'sa.toya_read', comp: 'ren', bell: true, shots: TOYA,
    after: (r) => r.flags.sa_toya_read && !r.inv.sa_letter_kasane && r.inv.lf_toya_bell && r.q.sa_main === 6 && r.mem, replay: true },
  { name: 'ch6.toya · without the bell · Mio', seq: 'ch6.toya', scene: 'sa.toya_read', comp: 'mio', bell: false, shots: TOYA.filter((x) => x !== 'bell'), after: (r) => r.flags.sa_toya_read && !r.inv.sa_letter_kasane },
  { name: 'ch6.toya · with Tōya\'s bell · Nao', seq: 'ch6.toya', scene: 'sa.toya_read', comp: 'nao', bell: true, shots: TOYA, after: (r) => r.flags.sa_toya_read && r.inv.lf_toya_bell },
  { name: 'ch6.toya · without the bell · Suzu', seq: 'ch6.toya', scene: 'sa.toya_read', comp: 'suzu', bell: false, shots: TOYA.filter((x) => x !== 'bell'), after: (r) => r.flags.sa_toya_read },
  { name: 'ch6.ren · Ren · "Take it back" (the open branch)', seq: 'ch6.ren', scene: 'sa.shelf_ren', comp: 'ren', choose: ['Take it back'], shots: REN,
    after: (r) => r.flags.sa_ren_took && r.q.ren_ushio === 'done' && r.map === 'sa.memories' && r.mem && r.world, replay: true },
  { name: 'ch6.ren · Ren · "You decide" (the open branch, after Ren\'s own line)', seq: 'ch6.ren', scene: 'sa.shelf_ren', comp: 'ren', choose: ['You decide'], shots: REN,
    after: (r) => r.flags.sa_ren_took && r.q.ren_ushio === 'done' && r.mem },
  { name: 'ch6.ren · Ren · "Leave it" (no sequence)', seq: 'ch6.ren', scene: 'sa.shelf_ren', comp: 'ren', choose: ['Leave it. You already'], shots: [], chal: 0,
    after: (r) => r.flags.sa_ren_left && !r.flags.sa_ren_took && !r.mem && r.world },
  { name: 'ch6.ren · Mio (Ren not here: the folio carried home unopened; no sequence)', seq: 'ch6.ren', scene: 'sa.shelf_ren', comp: 'mio', choose: ['Don\'t open it'], shots: [], chal: 0,
    after: (r) => r.flags.sa_ren_carried && r.inv.sa_ren_folio && !r.mem && r.world },
].filter((R) => !ONLY || ONLY.includes(R.seq));

async function start(p, R0, o) {
  o = o || {};
  const R = { scene: R0.scene, comp: R0.comp, profile: R0.profile, bell: R0.bell, live: !!R0.live };
  await p.evaluate(async ([R, SU, o]) => {
    const st = SU[R.scene];
    const s = RB.game.debugStart(st.at[0], st.at[1], st.at[2], { comp: R.comp, profile: R.profile || 'E', flags: Object.assign({}, st.flags), dir: st.at[3] });
    if (R.profile === 'F') s.learn.kanaKnown = 'hira';
    for (const it of (st.give || []).concat(R.bell ? ['lf_toya_bell'] : [])) RB.state.give(s, it, 1);
    for (const [q, n] of st.quests || []) s.quests[q] = { stage: n, done: false };
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    // the challenge answered by the game's own test solver (unless this run meets it as a player would)
    if (!window.__realRun) window.__realRun = RB.challenge.run;
    RB.challenge.run = R.live ? window.__realRun : async (id, ctx) => { window.__chal = (window.__chal || []).concat(id); RB.test.enable({}); try { return await window.__realRun(id, ctx); } finally { RB.test.disable(); } };
    // a shake anywhere is counted (none may fire inside a sequence)
    if (!window.__shakeReal) window.__shakeReal = RB.ui.shake;
    window.__shakes = 0; RB.ui.shake = (...a) => { window.__shakes++; return window.__shakeReal(...a); };
    await new Promise((r) => setTimeout(r, 400));
    window.__done = false; window.__chal = [];
    RB.script.run(R.scene).then(() => { window.__done = true; });
  }, [R, SETUP, o]);
}
const S = (p) => p.evaluate(() => {
  const d = RB.ui.dialogue, top = RB.ui.topLayer && RB.ui.topLayer();
  return { seq: RB.sequence.state(), en: (d.shown() || {}).en || null, open: d.isOpen(), n: RB.game.s.backlog.length, done: window.__done, layer: top ? top.name : null,
    choices: !!document.querySelector('.choices:not(.hidden) .choice'), confirm: !!document.querySelector('.csheet'), reviewing: document.querySelector('#ui .dlg') ? document.querySelector('#ui .dlg').classList.contains('reviewing') : false,
    focus: RB.sequence.focus(), mode: RB.game.mode() };
});
const campaign = (p) => p.evaluate(() => { const s = RB.game.s; const q = Object.fromEntries(Object.entries(s.quests).map(([k, v]) => [k, { stage: v.stage, done: v.done }])); return JSON.stringify({ flags: s.flags, vars: s.vars, inv: s.inv, q, notes: s.notebook.map((n) => n.id), company: s.company, words: s.words, learn: Object.keys(s.learn.items).length, seq: s.seq, map: s.map, x: s.x, y: s.y }); });
const settled = (p) => p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state !== 'entering'; }, null, { timeout: 5000 }).catch(() => {});
const holding = (p) => p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state === 'holding'; }, null, { timeout: 6000 }).catch(() => {});
// Next (a real click), then wait for what follows it: the next line, a reply to choose, a lesson or challenge,
// or the scene's end (so no click lands on a line before it has been looked at)
async function next(p, s) {
  await p.click('#ui .dlg .b-next');
  await p.waitForFunction((n0) => window.__done || RB.game.s.backlog.length !== n0 || !!document.querySelector('.choices:not(.hidden) .choice') || ['lesson', 'challenge', 'teach'].includes((RB.ui.topLayer() || {}).name), s.n, { timeout: 6000 }).catch(() => {});
  await wait(p, 40);
}
// a real click on a control found in the page (marked for the click, then unmarked)
async function clickIn(p, find) {
  const ok2 = await p.evaluate((find) => {
    const top = RB.ui.topLayer && RB.ui.topLayer(), el = top && top.el ? top.el : document;
    for (const sel of find) { const bt = [...el.querySelectorAll(sel)].find((x) => x.offsetParent !== null && !x.disabled); if (bt) { bt.setAttribute('data-t56', 'go'); return true; } }
    return false;
  }, find);
  if (!ok2) return false;
  await p.click('[data-t56="go"]').catch(() => {});
  await p.evaluate(() => { const x = document.querySelector('[data-t56="go"]'); if (x) x.removeAttribute('data-t56'); });
  return true;
}
// the focal rectangle of the shot on screen against the sheet's top (buffer rows)
const focusOk = (s) => { if (!s.seq || !s.focus || !s.seq.wh) return null; const f = s.focus, [w] = s.seq.wh, vb = s.seq.vb; return f.y >= -2 && f.y + f.h <= vb + 4 && f.x >= -4 && f.x + f.w <= w + 4; };
// Phone captures are taken at the device's pixel ratio and written at CSS size as small WebP files
async function still(p, file) {
  const png = await p.screenshot();
  const webp = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const d = window.devicePixelRatio || 1, c = document.createElement('canvas'); c.width = Math.round(img.width / d); c.height = Math.round(img.height / d);
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.8);
  }, png.toString('base64'));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(webp.split(',')[1], 'base64'));
}
// Play the scene with real clicks to its end. Returns what was shown and the campaign afterwards.
async function play(p, R, o) {
  o = o || {};
  const shots = [], phases = {}, bad = [], lines = [];
  let picks = (R.choose || []).slice(), lessons = 0, leftForLater = 0, overLayer = [], seqLines = 0;
  for (let i = 0; i < 260; i++) {
    const s = await S(p);
    if (s.done) break;
    if (s.seq) {
      if (!shots.includes(s.seq.shot)) shots.push(s.seq.shot);
      (phases[s.seq.shot] = phases[s.seq.shot] || new Set()).add(s.seq.phase);
    }
    if (s.layer === 'lesson' || s.layer === 'challenge' || s.layer === 'teach') {
      // over the held shot: the picture stays where it was
      overLayer.push(s.seq ? s.seq.shot : null);
      if (s.layer === 'lesson') lessons++;
      if (s.layer === 'challenge') leftForLater++;
      if (!(await clickIn(p, ['[data-a=leave]', '.go[data-a=next]', '[data-a=next]', '[data-ok]']))) await wait(p, 120);
      await wait(p, 160);
      continue;
    }
    if (s.choices) {
      const want = picks.shift();
      await wait(p, 120);
      await p.click('.choices .choice:has-text("' + want + '")');
      await wait(p, 120);
      continue;
    }
    if (s.open && s.en && !s.reviewing) {
      if (s.seq) {
        await settled(p);
        if (o.check) { const s2 = await S(p); const f = focusOk(s2); if (f === false) bad.push({ shot: s2.seq.shot, line: (s2.en || '').slice(0, 30), f: s2.focus, vb: s2.seq.vb, wh: s2.seq.wh }); }
        if (o.stills) { await holding(p); await wait(p, 260); const s3 = await S(p); if (s3.seq) await still(p, R.seq + '_' + s3.seq.shot + '_' + o.stills + '.webp'); }
      }
      lines.push(s.en);
      if (s.seq) seqLines++;
      await next(p, s);
      continue;
    }
    await wait(p, 90);
  }
  await p.waitForFunction(() => window.__done === true, null, { timeout: 10000 }).catch(() => {});
  await wait(p, 700);
  const r = await p.evaluate((seq) => {
    const s = RB.game.s, St = RB.sequence.stats();
    return { flags: s.flags, inv: s.inv, map: RB.world.W.map.id, q: Object.fromEntries(Object.entries(s.quests).map(([k, v]) => [k, v.done ? 'done' : v.stage])),
      mem: !!((s.company && s.company.memories) || []).find((m) => m.id === 'seq:' + seq), dark: !!document.querySelector('#overlay > .fade.on'), world: RB.render.worldVisible(),
      left: { live: St.live, listeners: St.listeners, timers: St.timers, overlays: St.overlays, ctrl: document.querySelectorAll('.seq-ctrl').length, out: document.querySelectorAll('.seq-out').length },
      shakes: window.__shakes, chal: window.__chal, seen: s.seq && s.seq[seq] ? s.seq[seq].n : 0 };
  }, R.seq);
  return Object.assign(r, { shots, phases: Object.fromEntries(Object.entries(phases).map(([k, v]) => [k, [...v]])), bad, lessons, leftForLater, overLayer, lines, seqLines });
}

// ---- 1. every branch, played through with real clicks ---------------------------------------------------------
for (const R of SHOTS_ONLY ? [] : RUNS) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, R);
  const r = await play(p, R, { check: true });
  ok(JSON.stringify(r.shots) === JSON.stringify(R.shots), R.name + ': the shots shown, in order: ' + r.shots.join(' → ') + (R.shots.length ? '' : ' (none)'));
  if (R.shots.length) {
    const defs = await p.evaluate((id) => Object.fromEntries(Object.entries(RB.sequence.get(id).shots).map(([k, v]) => [k, v.phases.map((x) => x.id)])), R.seq);
    const missing = R.shots.filter((sh) => R.choose && R.choose[0] === 'Not yet' ? false : JSON.stringify((r.phases[sh] || []).slice().sort()) !== JSON.stringify(defs[sh].slice().sort()));
    ok(!missing.length, R.name + ': every phase of each shot reached on its line ' + (missing.length ? JSON.stringify(missing.map((m) => [m, r.phases[m]])) : ''));
  }
  ok(R.after(r), R.name + ': the state afterwards (the world as the sequence left it) ' + JSON.stringify({ map: r.map, dark: r.dark, world: r.world, mem: r.mem, q: { lf_main: r.q.lf_main, sa_main: r.q.sa_main } }));
  ok(!r.bad.length, R.name + ': every line\'s shot keeps its focal area above the sheet (1280×720) ' + (r.bad.length ? JSON.stringify(r.bad.slice(0, 2)) : ''));
  ok(r.left.live === 0 && r.left.listeners === 0 && r.left.timers === 0 && r.left.overlays === 0 && r.left.ctrl === 0 && r.left.out === 0, R.name + ': nothing of the player left after the scene ' + JSON.stringify(r.left));
  ok(r.shakes === 0, R.name + ': no screen shake (' + r.shakes + ')');
  if (R.live) {
    ok(r.lessons > 0 && r.leftForLater > 0 && r.overLayer.every((x) => x === 'bell'), R.name + ': the kana lesson and the challenge came up over the held first shot (' + JSON.stringify({ lessons: r.lessons, challenge: r.leftForLater, under: [...new Set(r.overLayer)] }) + ')');
  } else if (R.seq !== 'ch5.boat') { const want = R.chal != null ? R.chal : 1; ok(r.chal.length === want, R.name + (want ? ': the challenge met once inside the sequence (' : ': no challenge on this branch (') + r.chal.join(',') + ')'); }
  if (R.replay) {
    // the kept memory (Company › Shared memories) replays read-only: the same beats, shot by shot
    const before = await campaign(p);
    await p.evaluate((seq) => { const m = RB.game.s.company.memories.find((x) => x.id === 'seq:' + seq); window.__rp = m ? m.ref.beats.length : 0; window.__rpDone = false; RB.sequence.replay(m.ref).then(() => { window.__rpDone = true; }); }, R.seq);
    const seen = [];
    for (let i = 0; i < 60; i++) {
      const v = await p.evaluate(() => RB.sequence.viewState());
      if (!v) break;
      if (!seen.includes(v.shot)) seen.push(v.shot);
      if (v.i >= v.n - 1) { await p.keyboard.press('Escape'); break; }
      await p.waitForFunction(() => { const x = RB.sequence.viewState(); return !x || x.state !== 'entering'; }, null, { timeout: 4000 }).catch(() => {});
      await p.click('.seq-view [data-a=next]');
      await wait(p, 60);
    }
    await p.waitForFunction(() => window.__rpDone === true, null, { timeout: 5000 }).catch(() => {});
    const rp = await p.evaluate(() => window.__rp);
    ok(rp > 0 && rp === r.seqLines, R.name + ': its kept memory holds the beats shown in the sequence (' + rp + ' of ' + r.seqLines + '; no picture stored) and replays them');
    ok(JSON.stringify(seen) === JSON.stringify(R.shots), R.name + ': the replay shows the same shots in the same order');
    ok((await campaign(p)) === before, R.name + ': the replay changed nothing in the campaign');
  }
  ok(!errors.length, R.name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 2. per sequence: idle, Previous read-only, Skip (asked; Keep watching; stops where it should) ----------------
const SEQS = [
  { seq: 'ch5.bell', R: RUNS.find((x) => x.seq === 'ch5.bell' && !x.live && x.choose[0] !== 'Not yet'), idleAt: /Words are cast/, stopAt: 'challenge' },
  { seq: 'ch5.boat', R: RUNS.find((x) => x.seq === 'ch5.boat' && x.shots.length), idleAt: /row out/, stopAt: 'end' },
  { seq: 'ch6.toya', R: RUNS.find((x) => x.seq === 'ch6.toya' && x.bell), idleAt: /folio/, stopAt: 'challenge' },
  { seq: 'ch6.ren', R: RUNS.find((x) => x.seq === 'ch6.ren' && x.replay), idleAt: /opens the folio/, stopAt: 'challenge' },
].filter((x) => x.R);
for (const X of SHOTS_ONLY ? [] : SEQS) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, X.R);
  // to the first line of the sequence (answering the reply that leads into it)
  for (let i = 0; i < 40; i++) {
    const s = await S(p);
    if (s.seq && s.open && s.en && X.idleAt.test(s.en)) break;
    if (s.choices) { await p.click('.choices .choice:has-text("' + X.R.choose[0] + '")'); await wait(p, 150); continue; }
    if (s.open && s.en) { await settled(p); await p.click('#ui .dlg .b-next'); }
    await wait(p, 120);
  }
  await holding(p);
  const i0 = await S(p);
  await wait(p, IDLE);
  const i1 = await S(p);
  ok(i0.seq && i1.seq && i1.n === i0.n && i1.en === i0.en && i1.seq.shot === i0.seq.shot && i1.seq.beats === i0.seq.beats && i1.seq.state === 'holding', X.seq + ': ' + IDLE / 1000 + ' s idle — same line, same shot, holding (' + (i1.seq ? i1.seq.shot + '/' + i1.seq.phase + ' ' + i1.seq.state : 'none') + ')');
  // one more line on, then Previous (read-only) and Next back
  if (X.seq !== 'ch5.boat') {
    await p.click('#ui .dlg .b-next'); await wait(p, 120); await settled(p); await holding(p);
    const live = await S(p), before = await campaign(p);
    await p.keyboard.press('KeyP'); await wait(p, 120);
    const v1 = await S(p);
    await p.keyboard.press('KeyR'); await wait(p, 120);
    await p.keyboard.press('Enter'); await wait(p, 160);
    const v2 = await S(p), after = await campaign(p);
    ok(v1.reviewing && v1.en !== live.en && v1.seq.review >= 0, X.seq + ': Previous (P) looks back at the line before');
    ok(!v2.reviewing && v2.en === live.en && v2.n === live.n && v2.seq.beats === live.seq.beats, X.seq + ': Next comes back to the live line without moving it on');
    ok(after === before, X.seq + ': looking back and replaying the shot changed no campaign state');
  }
  // Skip scene: asked first (part of the scene is new); Keep watching keeps the line; then skip
  const k0 = await S(p);
  await p.keyboard.press('Escape'); await wait(p, 160);
  const k1 = await S(p);
  ok(k1.confirm && k1.n === k0.n, X.seq + ': Escape opens the skip question (never skips by itself)');
  await p.click('.csheet button:has-text("Keep watching")'); await wait(p, 160);
  const k2 = await S(p);
  ok(!k2.confirm && k2.n === k0.n && k2.en === k0.en && k2.seq, X.seq + ': Keep watching keeps the line');
  await p.click('#ui .dlg .b-sskip').catch(async () => { await p.evaluate(() => document.querySelector('#ui .dlg .seq-ctrl').classList.add('open')); await p.click('#ui .dlg .b-sskip'); });
  await wait(p, 160);
  if (X.stopAt === 'end') {
    // (the crossing has one line: with nothing new ahead of it, Skip goes on without asking)
    const kq = await S(p);
    ok(!kq.confirm, X.seq + ': nothing new ahead of its one line — Skip scene goes on without asking');
  } else {
    ok((await S(p)).confirm, X.seq + ': Skip scene asks first when part of the scene is new');
    await p.click('.csheet button:has-text("Skip scene")');
  }
  if (X.stopAt === 'challenge') {
    await p.waitForFunction(() => (window.__chal || []).length > 0, null, { timeout: 10000 }).catch(() => {});
    await wait(p, 600);
    const k3 = await S(p);
    ok(k3.seq && !k3.seq.skip && k3.open && (await p.evaluate(() => window.__chal.length)) === 1, X.seq + ': a confirmed skip stops at the challenge (met once; the next line waits, still in the sequence: ' + (k3.seq ? k3.seq.shot : '-') + ')');
    // and once more to the end: the state lines run once, the sequence counted once
    await p.click('#ui .dlg .b-sskip').catch(() => {}); await wait(p, 160);
    if ((await S(p)).confirm) await p.click('.csheet button:has-text("Skip scene")');
    for (let i = 0; i < 30; i++) { const s = await S(p); if (s.done) break; if (s.choices) { await p.click('.choices .choice:has-text("' + X.R.choose[0] + '")').catch(() => {}); } else if (!s.seq && s.open) await p.click('#ui .dlg .b-next').catch(() => {}); else if (s.seq && s.open && !s.seq.skip) { await p.click('#ui .dlg .b-sskip').catch(() => {}); await wait(p, 120); if ((await S(p)).confirm) await p.click('.csheet button:has-text("Skip scene")'); } await wait(p, 200); }
  } else {
    await p.waitForFunction(() => window.__done === true, null, { timeout: 10000 }).catch(() => {});
  }
  await p.waitForFunction(() => window.__done === true, null, { timeout: 15000 }).catch(() => {});
  await wait(p, 600);
  const r = await p.evaluate((seq) => ({ seen: RB.game.s.seq[seq] ? RB.game.s.seq[seq].n : 0, map: RB.world.W.map.id, flags: RB.game.s.flags, inv: RB.game.s.inv, q: RB.game.s.quests, live: RB.sequence.active(), dark: !!document.querySelector('#overlay > .fade.on') }), X.seq);
  const okEnd = X.seq === 'ch5.bell' ? r.flags.lf_bell_rung && r.map === 'lf.sluice' && r.q.lf_main.stage === 9 : X.seq === 'ch5.boat' ? r.map === 'lf.tower_top' && !r.dark
    : X.seq === 'ch6.ren' ? r.flags.sa_ren_took && r.q.ren_ushio.done : r.flags.sa_toya_read && !r.inv.sa_letter_kasane && r.q.sa_main.stage === 6;
  ok(!r.live && r.seen === 1 && okEnd, X.seq + ': skipped to its end — the state lines ran once, the sequence counted once, the world where the scene leaves it ' + JSON.stringify({ seen: r.seen, map: r.map }));
  ok(!errors.length, X.seq + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 3. reduced motion: each action's end state at once after the dissolve; no shake ------------------------------
for (const X of SHOTS_ONLY ? [] : SEQS) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, X.R, { reduce: true });
  const notHeld = [];
  for (let i = 0; i < 200; i++) {
    const s = await S(p);
    if (s.done) break;
    if (s.choices) { await p.click('.choices .choice:has-text("' + X.R.choose[0] + '")'); await wait(p, 150); continue; }
    if (s.open && s.en) {
      if (s.seq) { await settled(p); await wait(p, 40); const s2 = await S(p); if (s2.seq && !(s2.seq.state === 'holding' && s2.seq.k === 1)) notHeld.push(s2.seq.shot + '/' + s2.seq.phase + ':' + s2.seq.state + ':' + s2.seq.k); }
      await next(p, s);
      continue;
    }
    await wait(p, 90);
  }
  const sh = await p.evaluate(() => ({ shakes: window.__shakes }));
  ok(!notHeld.length, X.seq + ': reduced motion — every line\'s shot at its end state at once after the dissolve ' + (notHeld.length ? JSON.stringify(notHeld.slice(0, 3)) : ''));
  ok(sh.shakes === 0, X.seq + ': no shake with reduced motion (' + sh.shakes + ')');
  ok(!errors.length, X.seq + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 4. the focal areas at three screen shapes, every line of the fullest branch (and the evidence stills) ---------
for (const [tag, vp, dpr] of SIZES) {
  for (const X of SEQS) {
    const { p, errors, ctx } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
    await start(p, X.R);
    const r = await play(p, X.R, { check: true, stills: SHOTS ? tag : null });
    ok(!r.bad.length && r.shots.length === X.R.shots.length, tag + ' ' + X.seq + ': every shot (' + r.shots.join(', ') + ') keeps its focal area above the sheet at every line ' + (r.bad.length ? JSON.stringify(r.bad.slice(0, 3)) : ''));
    ok(!errors.length, tag + ' ' + X.seq + ': no page errors ' + errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
