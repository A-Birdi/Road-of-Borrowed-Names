// Pets in battle and the overworld parity pass (battle addendum §11, §20, §23.1, §23.5), in the BUILT game, in
// headless Chromium with synthetic, session-only debug campaigns (never a player's save). The game's Math.random
// is seeded by the test (an init script) and reseeded just before each battle, so runs are comparable.
//
// Battles (the Flour Moth on the mill road; the real mouse picks responses, answers and companion actions):
//  - no pet, a cat, a dog, a bird and a tanuki, and a cat hidden by the setting, with Mio: no page errors; the
//    tasks put in front of you, every sequence's schedule (each cue's time, type, length, actor, pose, effect)
//    and the end state are identical for all six; each shown species reacted (actions and the creature's
//    moves) and the hidden one never appeared;
//  - while it plays, sampled through every exchange: the pet's box never contains an adventurer's foot anchor
//    and never overlaps the intent box or any badge element; at 390×844 too; travelling alone too;
//  - reduced motion: the pet holds key poses (no hops) and the battle completes.
// Overworld (each regional style; the base build 982c8df and this build side by side):
//  - walking and turning with the keyboard and a target-aware click on an interactable: the same tiles, facing
//    and interaction outcome in both builds; no page errors;
//  - the sprite frame, foot anchor, figure heights in every direction and frame (player and companion), and door
//    fit (no figure taller than before: an adult 50 + hat 4 + outline 2 = 56 art px) are unchanged; collision identical;
//  - a half-turn is drawn through a pivot (the game's facing changes at once), none with reduced motion.
// Usage: node tests/e2e/battle_pets_overworld.mjs [--battles-only|--world-only]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const outDir = path.join(root, 'tests/e2e/out/battle_pets_overworld');
fs.mkdirSync(outDir, { recursive: true });
const BASE = 'tests/e2e/out/battle_pets_overworld/base_index.html';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 300s')), 300000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + ': ' + e.message); console.log('FAIL ' + name + ': ' + (e.stack || e.message)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const only = process.argv.find((a) => a === '--battles-only' || a === '--world-only');
// a seeded Math.random from the start (test instrumentation), and window.__reseed(n)
const SEED = `(() => { let s = 0x2545F491; const f = () => { s = (s + 0x6d2b79f5) | 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; Math.random = f; window.__reseed = (n) => { s = n | 0; }; })();`;
async function open(o) {
  const ctx = await b.newContext({ viewport: o.viewport || { width: 1280, height: 800 } });
  await ctx.addInitScript(SEED);
  return page(b, url + (o.page || ''), { context: ctx });
}

// ---- battles ---------------------------------------------------------------------------------------------------
async function battle(o) {
  const { p, errors, ctx } = await open(o);
  await p.evaluate(([o]) => {
    const s = RB.game.debugStart('rw.millroad', 11, 13, { dir: 'up', comp: o.comp, flags: { rw_mill_open: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari', 'mizu'];
    RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'fast';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); if (o.look) RB.pets.setLook(s, o.pet, o.look); }
    if (o.hide) RB.game.settings.petBattle = false;
    // instrumentation: the steps you are given and every sequence's schedule (read only)
    window.__steps = []; window.__seq = []; window.__samples = [];
    const run = RB.challenge.runStep; RB.challenge.runStep = (step, x) => { window.__step = step; window.__steps.push([step.kind, step.item, step.answer, (step.accept || []).join('|'), step.mode]); return run(step, x); };
    const srun = RB.battleSeq.run;
    RB.battleSeq.run = (kind, cues, meta) => { window.__seq.push([kind, meta && meta.end, cues.map((c) => [c.at, c.type, c.d || 0, c.who || c.side || null, c.pose || c.act || null, c.gesture || null, c.name || null, c.f ? c.f.t + ':' + (c.f.who || '') + ':' + (c.f.n || 0) : null])]); return srun(kind, cues, meta); };
    // the moth telegraphs a Strike each round, so every exchange has a creature's move near you
    RB.bus.on('present:scene', (e) => { if (e.phase === 'calm') setTimeout(() => { const st = RB.combat.state(); if (!st) return; st.intent = Object.assign(RB.combatLogic.intentDef({}, 'strike'), { target: 'pc' }); st.foes[0].intent = st.intent; st.shroud = false; st.foes[0].shroud = false; RB.combat.refresh(); }, 0); });
    // sample the pet's place against the foot anchors and the intent box / badges, every 120 ms
    window.__sampler = setInterval(() => {
      const L = RB.battleStage.lay && RB.battleStage.lay(); const st = RB.battlePets.stats();
      if (!L || !st.on || !st.art) return;
      const cv = document.querySelector('canvas'); const cr = cv.getBoundingClientRect(); const cp = st.cssPerArt;
      const box = st.art; const inBox = (a) => a && a.x >= box.x && a.x <= box.x + box.w && a.y >= box.y && a.y <= box.y + box.h;
      const css = { x0: cr.left + box.x * cp, y0: cr.top + box.y * cp, x1: cr.left + (box.x + box.w) * cp, y1: cr.top + (box.y + box.h) * cp };
      const over = [...document.querySelectorAll('.intent, [class*="badge"], [data-badge]')].filter((el) => el.offsetParent).map((el) => el.getBoundingClientRect()).filter((r) => r.width && r.left < css.x1 && r.right > css.x0 && r.top < css.y1 && r.bottom > css.y0).length;
      window.__samples.push({ pc: inBox(L.pc), comp: inBox(L.comp), over, place: st.place, base: st.base });
    }, 120);
  }, [o]);
  const pause = (ms) => p.waitForTimeout(ms);
  const center = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
  const clickAt = async (pt) => { await p.mouse.move(pt.x, pt.y, { steps: 4 }); await p.mouse.click(pt.x, pt.y); };
  await p.evaluate(() => { window.__reseed(777); RB.game.startBattle('rw.dustmoth', {}); });
  async function lines() { for (let i = 0; i < 20 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await pause(300); const pt = await center('.dlg:not(.hidden) .b-next'); if (pt) await clickAt(pt); else await p.evaluate(() => RB.ui.dialogue.advance(true)); await pause(150); } }
  await pause(500); await lines();
  await p.evaluate(() => { const st = RB.combat.state(); if (st) { st.knots = st.maxKnots = 3; st.foes[0].knots = st.foes[0].maxKnots = 3; RB.combat.refresh(); } });
  const notes = async () => { const g = await p.evaluate(() => { const x = [...document.querySelectorAll('.cb-coach button, [data-coach-ok]')].find((y) => /got it/i.test(y.textContent)); if (!x) return null; const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); if (g) { await clickAt(g); await pause(200); } };
  for (let r = 0; r < 6 && (await p.evaluate(() => RB.game.mode())) === 'combat' && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); r++) {
    await p.waitForFunction(() => !!document.querySelector('.rcard[data-i]') && RB.combat.phase && RB.combat.phase() === 'choose', null, { timeout: 30000 });
    await pause(500); await notes();
    const want = r === 1 ? '守る|protect' : 'unravel';
    const c = await p.evaluate((src) => { const re = new RegExp(src, 'i'); const cards = [...document.querySelectorAll('.rcard')].filter((e) => !e.disabled); const x = cards.find((e) => re.test(e.textContent)) || cards.find((e) => /unravel/i.test(e.textContent)) || cards[0]; x.scrollIntoView({ block: 'nearest' }); const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, want);
    await clickAt(c);
    await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]', { timeout: 15000 });
    await pause(400);
    if (await p.$('.chal .mc .btn')) {
      const pt = await p.evaluate(() => {
        const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
        const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
        const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
        const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
        const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
        return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
      });
      await clickAt(pt);
    } else await clickAt(await center('.chal [data-a=reveal]'));
    await p.waitForSelector('.fbwrap .fb-go', { timeout: 15000 });
    await pause(300);
    await clickAt(await center('.fbwrap .fb-go'));
    await companionTurn(p, { delay: 400 });
    await p.waitForFunction(() => RB.ui.dialogue.isOpen() || (RB.combat.phase && ['choose', 'idle', 'outro'].includes(RB.combat.phase()) && !document.querySelector('.chal') && !RB.battleSeq.busy()), null, { timeout: 30000 });
    await pause(300);
  }
  const res = await p.evaluate(() => {
    clearInterval(window.__sampler);
    const st = RB.combat.state && RB.combat.state();
    return { steps: window.__steps, seq: window.__seq, samples: window.__samples, pet: RB.battlePets.stats(), cache: RB.petArt.cacheStats(), end: st ? { pc: st.pc, comp: st.comp, harmony: st.harmony, knots: st.foes.map((f) => f.knots), round: st.round } : null };
  });
  if (o.shot) await p.screenshot({ path: path.join(outDir, o.shot) });
  await lines();
  await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 20000 }).catch(() => {});
  res.mode = await p.evaluate(() => RB.game.mode());
  res.errors = errors.slice();
  await ctx.close();
  return res;
}
const h = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 12);

if (only !== '--world-only') {
  const runs = {};
  await test('battles with no pet, each species and a hidden pet: no page errors; identical tasks, schedule and end state', async () => {
    const SET = { none: {}, cat: { pet: 'cat' }, dog: { pet: 'dog', look: 'blacktan' }, bird: { pet: 'bird' }, tanuki: { pet: 'tanuki', look: 'graybrown' }, hidden: { pet: 'cat', hide: true } };
    for (const k in SET) runs[k] = await battle(Object.assign({ comp: 'mio', shot: 'battle_' + k + '.png' }, SET[k]));
    const bad = Object.entries(runs).filter(([, r]) => r.errors.length || r.mode !== 'world').map(([k, r]) => k + ': ' + r.mode + ' ' + r.errors.join(' | '));
    assert(!bad.length, 'every battle completed without page errors: ' + bad.join('; '));
    const base = runs.none;
    assert(base.seq.length >= 6 && base.steps.length >= 3, 'the battle ran (' + base.seq.length + ' sequences, ' + base.steps.length + ' tasks)');
    const sig = (r) => ({ steps: h(r.steps), seq: h(r.seq), end: h(r.end) });
    const diff = Object.keys(runs).filter((k) => JSON.stringify(sig(runs[k])) !== JSON.stringify(sig(base))).map((k) => k + ' ' + JSON.stringify(sig(runs[k])) + ' vs ' + JSON.stringify(sig(base)));
    assert(!diff.length, 'identical tasks, sequence schedules and end state: ' + diff.join('; '));
    console.log('   sequences ' + base.seq.length + ' (' + base.seq.map((s) => s[0]).join(',') + '); tasks ' + base.steps.length + '; schedule ' + h(base.seq));
  });
  await test('each shown species reacted to the party and the creature, inside its place; the hidden one never appeared', async () => {
    for (const k of ['cat', 'dog', 'bird', 'tanuki']) {
      const r = runs[k];
      assert(r && r.pet.on && r.pet.stats.reactions >= 2 && r.pet.stats.impacts >= 1 && r.pet.stats.preps >= 1, k + ' reacted: ' + JSON.stringify(r && r.pet.stats));
      assert(r.samples.length > 30, k + ' sampled ' + r.samples.length + ' frames');
      const onFoot = r.samples.filter((s) => s.pc || s.comp).length, over = r.samples.filter((s) => s.over).length;
      assert(!onFoot && !over, k + ': never on a foot anchor (' + onFoot + ') nor over the intent box or a badge (' + over + ')');
      assert(r.pet.trace.every((x) => !('target' in x) && !('hp' in x)), k + ': its record carries no target or health');
      console.log('   ' + k + ': reactions ' + r.pet.stats.reactions + ' (secondary ' + r.pet.stats.secondary + ', fitted ' + r.pet.stats.fitted + ', skipped ' + r.pet.stats.skipped + '), braces ' + r.pet.stats.preps + ', flinches ' + r.pet.stats.impacts + ', settles ' + r.pet.stats.settles + '; place ' + [...new Set(r.samples.map((q) => q.place))].join('/') + '; density ' + r.pet.density + '; pet frame cache ' + r.cache.size + ' frames, ' + Math.round(r.cache.bytes / 1024) + ' KiB of pixels (built ' + r.cache.built + ')');
    }
    assert(!runs.hidden.pet.on && !runs.hidden.samples.length && !runs.none.pet.on, 'hidden by the setting / no pet: never drawn');
  });
  await test('travelling alone, at 390×844, and with reduced motion: in its place, battle completes, no page errors', async () => {
    const solo = await battle({ comp: null, pet: 'cat', shot: 'battle_solo_cat.png' });
    const phone = await battle({ comp: 'nao', pet: 'tanuki', viewport: { width: 390, height: 844 }, shot: 'battle_phone_tanuki.png' });
    const red = await battle({ comp: 'ren', pet: 'bird', reduce: true, shot: 'battle_reduced_bird.png' });
    for (const [k, r] of [['solo', solo], ['phone', phone], ['reduced', red]]) {
      assert(!r.errors.length && r.mode === 'world', k + ': completed without page errors: ' + r.errors.join(' | '));
      assert(r.pet.on && r.samples.length > 10 && !r.samples.some((s) => s.pc || s.comp || s.over), k + ': in its place, clear of feet and badges (' + r.samples.length + ' samples; places ' + [...new Set(r.samples.map((s) => s.place))].join(',') + ')');
    }
    assert(red.pet.stats.reactions >= 1, 'reduced motion still reacts (held key poses)');
  });
}

// ---- overworld --------------------------------------------------------------------------------------------------
const REGIONS = [['rw.village', null], ['rw.mill1', null], ['sg.harbor', [27, 8]], ['sg.da_sluice', null], ['co.village', [8, 18]], ['co.kiln', null], ['sb.hamlet', null], ['sb.obs_hall', null], ['lf.town', [6, 17]], ['lf.tower_mid', null], ['sa.camp', null], ['sa.reading', null], ['rw.tea', null], ['atlas', null]];
const LATE = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, rw_mill_open: true, departed: true, ch1_done: true };
async function worldRun(pg, map, at, opts) {
  opts = opts || {};
  const { p, errors, ctx } = await open({ page: pg });
  const start = await p.evaluate(async ([map, at, LATE, reduce]) => {
    if (map === 'atlas') {
      // an Atlas room: a run from a fixed seed, its threshold room (the generator's own maps)
      const s0 = RB.game.debugStart('rw.hall', 5, 7, { dir: 'up', comp: 'mio', flags: LATE });
      const run = RB.atlas.newRun(s0, [], { seed: 4242 }); s0.atlas.run = run; RB.atlas.register(run);
      map = RB.atlas.mapId(run, 't');
      const sp0 = RB.content.maps[map].spawn.default;
      RB.world.enter(map, sp0[0], sp0[1], 'up');
    } else {
    const m = RB.content.maps[map];
    const sp = at || (m.spawn && (m.spawn.default || Object.values(m.spawn)[0])) || [5, 5, 'down'];
    RB.game.debugStart(map, sp[0], sp[1], { dir: sp[2] || 'down', comp: 'mio', flags: LATE });
    }
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = !!reduce; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 250));
    for (let i = 0; i < 80 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 30)); }
    const s = RB.game.s; RB.pets.meet(s, 'cat'); RB.pets.select(s, 'cat');
    const P = RB.world.W.player; return { x: P.x, y: P.y, dir: P.dir };
  }, [map, at, LATE, !!opts.reduce]);
  const idle = () => p.waitForFunction(() => !RB.world.W.player.mv && !RB.ui.dialogue.isOpen(), null, { timeout: 5000 }).catch(() => {});
  if (opts.keyed) {
    // real key presses from the start (a smoke check that the keyboard turns and walks; not compared)
    const keyed = [];
    for (const k of ['ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowLeft', 'ArrowUp']) { await idle(); await p.keyboard.down(k); await wait(p, 200); await p.keyboard.up(k); await wait(p, 250); await idle(); keyed.push(await p.evaluate(() => { const P = RB.world.W.player; return [P.x, P.y, P.dir]; })); }
    const out = { start, keyed, errors: errors.slice() };
    await ctx.close();
    return out;
  }
  const trace = [];
  const turns = [];
  // turning and walking through the movement call the keyboard makes (RB.world._tryMove: a turn when the
  // direction differs, else one step), each settled before the next — exact, where a key held for a few ms
  // can turn or step depending on frame timing; then a few real key presses as a smoke check (not compared)
  const seq = ['left', 'left', 'right', 'up', 'up', 'down', 'right', 'right', 'down', 'left'];
  for (const k of seq) {
    await idle();
    const before = await p.evaluate(() => { const P = RB.world.W.player; return P.dir; });
    await p.evaluate((k) => RB.world._tryMove(k), k);
    await wait(p, 40);
    // the drawing of a half-turn: sampled right after the key
    const vw = await p.evaluate(() => { const P = RB.world.W.player; return { dir: P.dir, drawn: P._turn ? P._turn.kind : null, vd: P._vd }; });
    turns.push([before, vw.dir, vw.drawn]);
    await wait(p, 230); await idle();
    trace.push(await p.evaluate(() => { const P = RB.world.W.player; return [P.x, P.y, P.dir]; }));
  }
  // a target-aware click on the nearest interactable prop (walk there, face it, interact once)
  const tgt = await p.evaluate(() => {
    const W = RB.world.W, m = W.map, P = W.player;
    let best = null;
    for (const q of m.props) {
      if (!(q.scene || q.text) || (q.if && !RB.state.test(RB.game.s, q.if))) continue;
      const d = Math.abs(q.x - P.x) + Math.abs(q.y - P.y);
      const c = RB.render.tileToCss(q.x + 0.5, q.y + 0.5);
      if (c.x < 20 || c.y < 20 || c.x > innerWidth - 20 || c.y > innerHeight - 20) continue;
      if (!best || d < best.d) best = { d, x: q.x, y: q.y, p: q.p, cx: c.x, cy: c.y };
    }
    return best;
  });
  let inter = null;
  if (tgt) {
    await p.mouse.click(tgt.cx, tgt.cy);
    const opened = await p.waitForFunction(() => RB.ui.dialogue.isOpen() || RB.game.mode() !== 'world', null, { timeout: 8000 }).then(() => true).catch(() => false);
    const P = await p.evaluate(() => { const P = RB.world.W.player; return [P.x, P.y, P.dir]; });
    inter = { prop: tgt.p, at: [tgt.x, tgt.y], opened, player: P };
    for (let i = 0; i < 60 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 40); }
  }
  // the figure and collision geometry in this build
  const geom = await p.evaluate(() => {
    const SP = RB.sprites, s = RB.game.s;
    const bbox = (cv) => { const c = cv.getContext('2d'); const d = c.getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 100) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
    const frames = [0, 1, 2, 3, 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'i0', 'i1', 'i2', 'i3'];
    const fig = {};
    for (const [who, look] of [['pc', RB.equip.look(s)], ['mio', RB.content.chars.mio.look], ['ren', RB.content.chars.ren.look]]) for (const d of ['down', 'up', 'left', 'right']) fig[who + ':' + d] = frames.map((f) => bbox(SP.getArt(look, d, f)));
    let maxH = 0; for (const k in fig) for (const bb of fig[k]) maxH = Math.max(maxH, bb[3] - bb[1] + 1);
    const m = RB.world.W.map; let bits = ''; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) bits += RB.maps.blockedStatic(m, x, y) ? 1 : 0;
    // the shared appearance source: the world draws the same looks the battle draws
    const same = JSON.stringify(RB.world.W.player.look) === JSON.stringify(RB.equip.look(s)) && (!RB.world.W.comp || JSON.stringify(RB.world.W.comp.look) === JSON.stringify(RB.content.chars[s.comp].look));
    return { frame: SP.FRAME, anchor: SP.ANCHOR, fig, maxH, coll: bits, same };
  });
  const shot = opts.shot ? path.join(outDir, opts.shot) : null;
  if (shot) await p.screenshot({ path: shot });
  const r = { start, trace, turns, inter, geom: { frame: geom.frame, anchor: geom.anchor, fig: h(geom.fig), maxH: geom.maxH, coll: h(geom.coll), same: geom.same }, errors: errors.slice() };
  await ctx.close();
  return r;
}
if (only !== '--battles-only') {
  const report = [];
  for (const [map, at] of REGIONS) {
    await test('overworld ' + map + ': walking, turning and a click on an interactable — the same tiles, facing and outcome as the base build; footprint, anchors, figure heights, door fit and collision unchanged', async () => {
      const a = await worldRun(BASE, map, at), n = await worldRun('', map, at, { shot: 'world_' + map + '.png' });
      assert(!a.errors.length && !n.errors.length, map + ': no page errors: ' + a.errors.concat(n.errors).join(' | '));
      assert(JSON.stringify(a.trace) === JSON.stringify(n.trace), map + ': the same walk ' + JSON.stringify(a.trace) + ' vs ' + JSON.stringify(n.trace));
      assert(new Set(n.trace.map((q) => q[0] + ',' + q[1])).size >= 2 || map === 'rw.tea', map + ': it actually walked: ' + JSON.stringify(n.trace));
      const kd = await worldRun('', map, at, { keyed: true });
      assert(!kd.errors.length && new Set([kd.start.x + ',' + kd.start.y].concat(kd.keyed.map((q) => q[0] + ',' + q[1]))).size >= 2, map + ': real key presses walk: ' + JSON.stringify(kd));
      assert(JSON.stringify(a.inter) === JSON.stringify(n.inter), map + ': the same interaction ' + JSON.stringify(a.inter) + ' vs ' + JSON.stringify(n.inter));
      assert(!n.inter || n.inter.opened, map + ': the click on ' + (n.inter && n.inter.prop) + ' reached it and opened its interaction');
      assert(JSON.stringify(a.geom) === JSON.stringify(n.geom), map + ': frame, anchor, figure boxes and collision unchanged ' + JSON.stringify(a.geom) + ' vs ' + JSON.stringify(n.geom));
      assert(n.geom.maxH <= a.geom.maxH && n.geom.maxH <= 56 && n.geom.same, map + ': no figure taller than before (' + n.geom.maxH + ' vs ' + a.geom.maxH + ' art px incl. the outline: an adult 50 + a hat or bun 4 + 2 outline rows; a house door frame is 38) and the shared appearance source');
      report.push(map + ' ' + n.trace.length + ' moves, ' + (n.inter ? n.inter.prop + (n.inter.opened ? ' opened' : ' -') : 'no target'));
      console.log('   ' + report[report.length - 1] + '; figure max ' + n.geom.maxH + ' art px');
    });
  }
  await test('a half-turn is drawn through a pivot while the facing changes at once; a quarter turn settles; reduced motion snaps', async () => {
    const n = await worldRun('', 'rw.village', null);
    const half = n.turns.filter((q) => q[0] && q[1] && ({ up: 'down', down: 'up', left: 'right', right: 'left' })[q[0]] === q[1]);
    assert(half.length >= 1 && half.every((q) => q[2] === 'half' || q[2] === null), 'half turns seen: ' + JSON.stringify(half));
    assert(half.some((q) => q[2] === 'half'), 'at least one half-turn was drawn through its pivot: ' + JSON.stringify(n.turns));
    const r = await worldRun('', 'rw.village', null, { reduce: true });
    assert(r.turns.every((q) => q[2] === null), 'reduced motion: no pivot: ' + JSON.stringify(r.turns));
    assert(JSON.stringify(r.trace) === JSON.stringify(n.trace), 'and the same walk');
  });
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
fs.writeFileSync(path.join(outDir, 'results.txt'), results.join('\n') + '\n');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
