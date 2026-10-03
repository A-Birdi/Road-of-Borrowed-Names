// The Harmony portrait flourish and the four stage performances (Harmony addendum §5, §7, §8, §9, §20,
// §23.1–§23.2), against the BUILT index.html in Chromium, in synthetic campaigns (fresh profiles; real mouse
// clicks for every choice: the technique's card, the right answer, Continue, "Join the technique"):
//   core      4 pairings × Normal / Fast / Instant × reduced motion off / on = 24 configurations: exactly one
//             cut-in per committed technique in Normal and Fast, none in Instant; the effective look, the
//             real companion, the technique's action and its targets; entering → holding → fading → disposed
//             on the presentation clock, gone before the first result; the same rules' state afterwards in
//             every configuration of a pairing, with the portrait Off, and with a pet shown or hidden
//   never     no cut-in on meter fill, a support action, hovering or focusing the technique (its preview), a
//             cancelled task or backing out of the companion's menu
//   plan      Keep visible + Expanded, a group of three, a finishing technique, Adaptive + Expanded on a phone
//   geometry  1648×840, 1440×900, 1280×720, 768×1024, 390×844, 320×640, 844×390 at 100 % and 200 % text: the
//             fit mode and footprint; no drawn pixel of the portrait within 12 px of any protected rectangle
//             (measured here, independently of the overlay); the menus, feet, creatures and camera unmoved
//   frozen    the frame with the overlay shown and hidden, everything frozen: identical outside the overlay
//   life      Skip, a hidden tab, a campaign change, word help opening, a resize mid-action
//   cycles    20 techniques in one page: listeners, layers, timers and caches bounded
//   dev       the ?dev=harmony viewer: refused on a normal page; labelled synthetic; plays each pairing
//   painted   the painted path with its SYNTHETIC sample (Suzu): the art's timeline of states, sizes from the
//             API, the compact pair at a fractional CSS scale on a 3× phone
// With --docs: real-time WebM captures of each pairing at Normal (1280×720), frame sheets of each stage
// performance with the portrait Off, and the 390×844 compact cut-in, in docs/screenshots/harmony/cutin/.
// Usage: node tests/e2e/harmony_cutin.mjs [filter] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'harmony_cutin');
const docsDir = path.join(root, 'docs', 'screenshots', 'harmony', 'cutin');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docsDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const report = { when: new Date().toISOString(), browser: 'Chromium (Playwright, headless), software canvas, device pixel ratio 1, shared 4-core Linux machine — not a physical device' };
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  const t0 = Date.now();
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 600 s')), 600000))]); pass++; console.log('PASS ' + name + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String((e && e.stack) || e).slice(0, 2400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
// wait for a selector and let go of the handle at once: a handle the test keeps holds that element's whole
// (detached) subtree alive in the page, which reads as a per-encounter DOM and listener leak in the cycles test
const waitSel = (p, sel, o) => p.waitForSelector(sel, o).then((h) => { if (h) return h.dispose(); });
const NAME = { nao: 'Nao', mio: 'Mio', ren: 'Ren', suzu: 'Suzu' };
const TECHNAME = { nao: 'Read the Opening', mio: 'Clearwater Draught', ren: 'Lantern Ward', suzu: 'Curtain Call' };
const COMPS = ['nao', 'mio', 'ren', 'suzu'];

// ---- in the page ------------------------------------------------------------------------------------------
// A recorder (every animation frame): the cut-in's state, the banner, the phase, the actors' poses; and the
// independent measurement of what the portrait must keep clear of, with a pixel-level overlap test.
async function install(p) {
  await p.evaluate(() => {
    if (window.__HC) return;
    const HC = (window.__HC = { frames: [], on: false, checks: [] });
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__lastStep = step; return run(step, o); };
    const L = RB.combatLogic, init = L.init;
    L.init = function (...a) { const st = init.apply(this, a); if (HC.onInit) HC.onInit(st); return st; };
    const vis = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return null; return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    // what the addendum protects (§5.3), measured from the page itself
    HC.rects = () => {
      const out = [], add = (id, r) => { if (r) out.push(Object.assign({ id }, r)); };
      const root = document.querySelector('.combat-ui');
      if (!root) return out;
      add('status', vis(root.querySelector('.cb-party')));
      for (const bn of root.querySelectorAll('.cb-banner')) add('banner', vis(bn));
      add('intent', vis(root.querySelector('.intent')));
      add('responses', vis(root.querySelector('.cb-dock')));
      add('skip', vis(root.querySelector('.cb-skip')));
      add('settings', vis(root.querySelector('.cb-set')));
      for (const e of root.querySelectorAll('.cb-foe, .cb-foe [data-foe], .cb-ib, .cb-icard')) add('plate', vis(e));
      const st = RB.battleStage.stats(), cp = st.cssPerArt, L = st.lay;
      if (L) {
        for (const f of L.foes) add('creature', { x: f.left * cp, y: f.top * cp, w: (f.right - f.left) * cp, h: (Math.max(f.bottom, f.ky) - f.top) * cp });
        add('party', { x: L.party.x * cp, y: L.party.y * cp, w: L.party.w * cp, h: L.party.h * cp });
      }
      return out;
    };
    // the drawn pixels of the portrait (its canvas as displayed) against every rect kept 12 px clear
    HC.overlap = () => {
      const c = document.querySelector('.cb-cutin');
      if (!c) return null;
      const r = c.getBoundingClientRect(), op = +getComputedStyle(c).opacity;
      const sx = r.width / c.width, sy = r.height / c.height;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const hits = [];
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, drawn = 0;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { drawn++; const X = r.left + x * sx, Y = r.top + y * sy; x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X + sx); y1 = Math.max(y1, Y + sy); }
      // (e: 1/50 of an art pixel — at a fractional scale the canvas's displayed size is rounded to the layout's
      // 1/64 px, so a row that starts exactly 12 px away would otherwise count as inside by a few thousandths)
      const e = 0.02;
      for (const R of HC.rects()) {
        const ax = Math.floor((R.x - 12 - r.left) / sx + e), bx = Math.ceil((R.x + R.w + 12 - r.left) / sx - e), ay = Math.floor((R.y - 12 - r.top) / sy + e), by = Math.ceil((R.y + R.h + 12 - r.top) / sy - e);
        let n = 0;
        for (let y = Math.max(0, ay); y < Math.min(c.height, by); y++) for (let x = Math.max(0, ax); x < Math.min(c.width, bx); x++) if (d[(y * c.width + x) * 4 + 3] > 8) n++;
        if (n) hits.push({ id: R.id, px: n, r: [Math.round(R.x), Math.round(R.y), Math.round(R.w), Math.round(R.h)] });
      }
      return { hits, op, drawn, visible: { x: Math.round(Math.max(0, x0)), y: Math.round(y0), w: Math.round(x1 - Math.max(0, x0)), h: Math.round(y1 - y0) }, vw: innerWidth, vh: innerHeight };
    };
    const tick = () => {
      if (HC.on) {
        const s = RB.harmonyCutin.state(), bn = RB.battleBanner.state(), cur = RB.battleSeq.current(), f = RB.combat.debug().stage.frame;
        const st2 = RB.battleStage.stats(), pe = document.querySelector('.cb-party'), pr = pe && pe.getBoundingClientRect();
        const lay = st2.lay ? JSON.stringify({ pc: st2.lay.pc, comp: st2.lay.comp, foes: st2.lay.foes.map((x) => [x.ex, x.ey]), scale: st2.lay.scale, ps: st2.lay.ps, cp: st2.cssPerArt, party: pr ? [Math.round(pr.left), Math.round(pr.top), Math.round(pr.width), Math.round(pr.height)] : null }) : null;
        const row = { lay, wall: performance.now(), pt: RB.battleSeq.now(), seqT: cur ? cur.t : null, kind: cur ? cur.kind : null, state: s.state, token: s.token, op: s.opacity, dx: s.dx, phase: s.phase, el: document.querySelectorAll('.cb-cutin').length, banner: bn.visible ? bn.side + ':' + bn.text : null, poses: f && f.poses, fx: f && f.effects && f.effects.slice(0, 12), knots: RB.combat.shown() && RB.combat.shown().foes.map((x) => x.knots) };
        if (s.state === 'holding' || s.state === 'fading' || (s.state === 'entering' && HC.checkEntering)) { if (HC.frames.length % (HC.every || 3) === 0) { const o = HC.overlap(); if (o) { row.ov = o.hits; row.vis = o.visible; } } }
        HC.frames.push(row);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
// a synthetic campaign in the Mill with the Flour Moth (alone or a group of its kind), Harmony full
async function setup(p, o) {
  await install(p);
  // (one encounter at a time: an open one is left first, as Step back would)
  if (await p.evaluate(() => RB.game.mode() === 'combat' && !window.__result)) { await toCards(p); await leave(p); }
  for (let i = 0; i < 200 && (await p.evaluate(() => RB.game.mode() === 'combat')); i++) await wait(p, 25);
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp || null, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.foes > 2 ? 'hard' : 'normal';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    if (o.look) s.player.look = o.look;
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    Object.assign(RB.game.settings, { input: 'choice', textSpeed: 'normal', battleAnim: o.anim || 'normal', reducedMotion: !!o.reduce, battleControls: o.controls || 'adaptive', intentDisplay: o.intents || 'adaptive', harmonyFlourish: o.flourish !== false, petBattle: o.petBattle !== false, textScale: o.text || 1 });
    RB.game.applySettings();
    RB.battleSeq.setTimeScale(o.timeScale || 1);
    window.__HC.onInit = (st) => {
      st.harmony = o.harmony != null ? o.harmony : st.harmonyMax;
      if (o.knots) for (const f of st.foes) { f.knots = f.maxKnots = o.knots; }
      if (o.knots) { st.knots = st.maxKnots = o.knots; }
      if (o.cond) for (const f of st.foes) Object.assign(f, o.cond);
      if (o.cond) Object.assign(st, o.cond);
      if (o.pc != null) st.pc = o.pc;
    };
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null;
    RB.game.startBattle(place.enemy, Object.assign({ place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'hc:' + Math.random() }, o.foes > 1 ? { group: Array(o.foes - 1).fill(place.enemy) } : {})).then((r) => { window.__result = r || 'done'; });
  }, o);
  await toCards(p);
}
async function toCards(p) {
  for (let i = 0; i < 800; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
    if (s.cards || s.r) return s;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 25);
  }
  throw new Error('no decision came');
}
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 20) }; }, sel);
async function clickCard(p, re) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  assert(i != null, 'no card matching ' + re + ': ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 40)))));
  await p.mouse.move(2, 2);
  await wait(p, 260);
  // a real click on a visible point of that very card (a scrolled dock can leave another card under a
  // naive centre point)
  const q = '.rcard[data-i="' + i + '"]';
  const c = await p.evaluate((q) => {
    const el = document.querySelector(q);
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2;
    for (let y = Math.max(r.top, 0) + 6; y < Math.min(r.bottom, innerHeight); y += 6) { const top = document.elementFromPoint(x, y); if (top && top.closest(q)) return { x, y }; }
    return null;
  }, q);
  assert(c, 'the card ' + re + ' is covered');
  await wait(p, 120);
  await p.mouse.click(c.x, c.y);
  await waitSel(p, '.chal', { timeout: 10000 });
}
async function answerRight(p) {
  await waitSel(p, '.chal .mc .btn', { timeout: 10000 });
  await p.mouse.move(2, 2);
  const idx = await p.evaluate(() => {
    const st = window.__lastStep, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    const k = bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))));
    if (k >= 0) { bs[k].setAttribute('data-right', '1'); bs[k].scrollIntoView({ block: 'center' }); }
    return k;
  });
  assert(idx >= 0, 'the right option is on screen');
  await p.click('.chal .mc .btn[data-right="1"]');
  await waitSel(p, '.fbwrap .fb-go', { timeout: 10000 });
  await p.evaluate(() => document.querySelector('.fbwrap .fb-go').scrollIntoView({ block: 'center' }));
  await p.click('.fbwrap .fb-go');
}
// the companion's menu: "Join the technique" (or a support action by its text, or Back)
async function companionPick(p, re) {
  await waitSel(p, '.ccard', { timeout: 8000 });
  await p.mouse.move(2, 2);
  await wait(p, 300); // (the menu ignores presses in its first 250 ms)
  const a = await p.evaluate((m) => { const c = [...document.querySelectorAll('.ccard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent)); if (!c) return null; c.setAttribute('data-pick', '1'); c.scrollIntoView({ block: 'center' }); return c.textContent.replace(/\s+/g, ' ').trim().slice(0, 60); }, re);
  assert(a, 'no companion choice matching ' + re + ': ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.ccard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 40)))));
  await p.click('.ccard[data-pick="1"]');
  return a;
}
// the exchange plays to the next decision (or the end of the encounter)
async function settle(p) {
  let s = null;
  for (let i = 0; i < 1600; i++) {
    s = await p.evaluate(() => ({ r: window.__result, busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase() }));
    if (s.r || (!s.busy && s.cards && s.ph === 'choose')) return s;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 25);
  }
  const more = await p.evaluate(() => { const c = RB.battleSeq.current(); return { mode: RB.game.mode(), cur: c ? { kind: c.kind, t: c.t } : null, paused: RB.battleSeq.paused ? RB.battleSeq.paused() : null, hidden: document.hidden, sheets: [...document.querySelectorAll('[aria-modal="true"], .csheet, .chal')].map((e) => e.className).slice(0, 6) }; });
  throw new Error('the exchange did not finish ' + JSON.stringify(Object.assign({}, s, more)));
}
// one committed technique with real clicks; returns what was recorded
async function technique(p, comp, o) {
  o = o || {};
  await p.evaluate((every) => { const HC = window.__HC; HC.frames = []; HC.every = every || 3; HC.checkEntering = false; HC.on = true; HC.s0 = RB.harmonyCutin.stats(); HC.trace0 = RB.battleSeq.trace().length; HC.look0 = JSON.stringify(RB.equip.look(RB.game.s)); HC.target0 = RB.combat.state().cur; }, o.every);
  await clickCard(p, 'With ' + NAME[comp]);
  await answerRight(p);
  await companionPick(p, 'Join');
  if (o.during) await o.during();
  const s = await settle(p);
  await wait(p, 80);
  return p.evaluate((won) => {
    const HC = window.__HC; HC.on = false;
    const s1 = RB.harmonyCutin.stats(), tr = RB.battleSeq.trace().slice(HC.trace0);
    const tech = tr.find((r) => (r.kind === 'player' || r.kind === 'finish') && r.meta && r.meta.card === 'tech');
    return { won, relaid: s1.relaid - HC.s0.relaid, started: s1.started - HC.s0.started, disposed: s1.disposed - HC.s0.disposed, suppressed: s1.suppressed, fallbacks: s1.fallbacks.length - HC.s0.fallbacks.length, fallback: s1.fallbacks[s1.fallbacks.length - 1] || null, last: RB.harmonyCutin.last(), layers: s1.layers, look0: HC.look0, target0: HC.target0,
      tech: tech && { kind: tech.kind, dur: tech.dur, beats: tech.beats, fired: tech.fired, settled: tech.settled, hurried: tech.hurried, meta: { action: tech.meta.action && tech.meta.action.id, actors: tech.meta.actors, target: tech.meta.target, gesture: tech.meta.gesture, end: tech.meta.end } },
      frames: HC.frames };
  }, s.r || null);
}
// the rules' state after the exchange (compared across presentation settings) and the learning record's counts
const signature = (p) => p.evaluate(() => {
  const s = RB.game.s, st = RB.combat.state();
  const rules = st ? { pc: st.pc, comp: st.comp, harmony: st.harmony, round: st.round, cur: st.cur, ward: st.ward, compUses: st.compUses, foes: st.foes.map((f) => ({ knots: f.knots, kind: f.intent && f.intent.kind, heat: f.heat, shroud: f.shroud, charged: f.charged, settled: !!f.settled })) } : null;
  const items = Object.values(s.learn.items || {});
  const sum = (k) => items.reduce((m, r) => m + (r[k] || 0), 0);
  return JSON.stringify({ result: window.__result, rules, won: s.vars.battlesWon || 0, words: s.words, learn: { stats: s.learn.stats, records: items.length, seen: sum('seen'), ok: sum('ok'), bad: sum('bad') }, phase: RB.combat.phase() });
});
async function leave(p) {
  if (await p.evaluate(() => !!window.__result)) return;
  await p.evaluate(() => { const f = document.querySelector('.cb-dock [data-flee]'); if (f) f.click(); });
  await waitSel(p, '.csheet button', { timeout: 4000 }).catch(() => null);
  await p.evaluate(() => { const bs = [...document.querySelectorAll('.csheet button')].filter((x) => /Step back/.test(x.textContent)); if (bs.length) bs[bs.length - 1].click(); });
  for (let i = 0; i < 300 && !(await p.evaluate(() => !!window.__result)); i++) await wait(p, 20);
}
const firstResult = (r) => Math.min(...r.tech.beats.filter((x) => x.t !== 'cost').map((x) => x.at));
const markAt = (last, st) => { const m = last.marks.find((x) => x.state === st); return m ? m.at : null; };

// ---------------------------------------------------------------------------------------------------------
const core = [];
await test('core: 4 pairings × Normal / Fast / Instant × reduced motion off / on (24) — one cut-in per committed technique in Normal and Fast, none in Instant; the right look, companion, action and targets; disposed before the first result; the same rules\' state in every configuration, with the portrait Off and with a pet shown or hidden', async () => {
  const sigs = {};
  for (const comp of COMPS) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
    const variants = [];
    for (const anim of ['normal', 'fast', 'instant']) for (const reduce of [false, true]) variants.push({ anim, reduce });
    variants.push({ anim: 'normal', reduce: false, flourish: false, label: 'portrait off' });
    if (comp === 'mio') { variants.push({ anim: 'normal', reduce: false, pet: 'cat', petBattle: true, label: 'pet shown' }); variants.push({ anim: 'normal', reduce: false, pet: 'cat', petBattle: false, label: 'pet hidden' }); }
    for (const v of variants) {
      await setup(p, Object.assign({ comp, knots: 6, pc: 8 }, v));
      const r = await technique(p, comp);
      const sig = await signature(p);
      (sigs[comp] = sigs[comp] || []).push({ v, sig });
      const tag = comp + ' ' + v.anim + (v.reduce ? ' reduced' : '') + (v.label ? ' (' + v.label + ')' : '');
      assert(r.tech && r.tech.meta.actors.join() === 'pc,comp', tag + ': the technique played as one action of you both ' + JSON.stringify(r.tech && r.tech.meta));
      const row = { comp, anim: v.anim, reduce: v.reduce, label: v.label || null, started: r.started, why: r.last && r.started ? r.last.why : null, fit: r.started ? r.last.fit : null, variant: r.started ? r.last.variant : null, scale: r.started ? r.last.scale : null, marks: r.started ? r.last.marks.map((m) => m.state + '@' + m.at) : [], firstResult: firstResult(r), techMs: r.tech.dur, end: r.tech.meta.end, kind: r.tech.kind };
      core.push(row);
      const seen = r.frames.filter((f) => f.el > 0);
      if (v.anim === 'instant' || v.flourish === false) {
        assert(r.started === 0 && !seen.length, tag + ': no portrait at any frame ' + JSON.stringify({ started: r.started, frames: seen.length }));
        if (v.anim === 'instant') assert(!r.frames.some((f) => f.banner), tag + ': Instant — no banner either');
        if (v.flourish === false) assert(r.tech.fired.includes('cutin') && r.frames.some((f) => f.poses && /act:/.test(f.poses.comp || '')), tag + ': portrait Off — the stage performance plays unchanged (the cue is there, the layer is not)');
        continue;
      }
      assert(r.started === 1 && r.disposed === 1 && r.layers === 0, tag + ': exactly one cut-in, disposed, no layer left ' + JSON.stringify({ started: r.started, disposed: r.disposed, layers: r.layers, fb: r.fallback }));
      const L = r.last;
      assert(L.why === 'done' && L.comp === comp && /:pc:tech$/.test(L.action) && L.action === r.tech.meta.action, tag + ': its own action, the real companion ' + JSON.stringify({ why: L.why, comp: L.comp, action: L.action }));
      assert(JSON.stringify(L.look) === r.look0, tag + ': the player\'s effective look as worn at the action\'s start');
      assert(['entering', 'holding', 'fading', 'disposed'].every((s) => markAt(L, s) != null), tag + ': entering → holding → fading → disposed ' + JSON.stringify(L.marks));
      const dz = markAt(L, 'disposed'), fr = firstResult(r);
      const want = v.anim === 'fast' ? 687 : 780;
      assert(dz >= want - 1 && dz <= want + 120 && dz < fr, tag + ': disposed at ' + dz + ' ms (target ' + want + ') — before the first result at ' + fr + ' ms');
      // the cut-in only while the technique's own blue banner names it, never after
      const vis = seen.filter((f) => f.state !== 'inactive');
      assert(vis.length && vis.every((f) => f.banner && f.banner.startsWith('party:') && f.banner.includes(NAME[comp]) && f.banner.includes(TECHNAME[comp])), tag + ': shown only inside the blue banner\'s interval for "' + NAME[comp] + ' — ' + TECHNAME[comp] + '"');
      // the fade is continuous, not a pop; reduced motion never travels
      const fades = L.trace.filter((x) => x[1] === 'f').map((x) => x[2]);
      assert(fades.length >= (v.anim === 'fast' ? 4 : 6) && fades.every((x, i) => !i || x <= fades[i - 1] + 1e-6) && fades[fades.length - 1] < 0.2, tag + ': a smooth fade (' + fades.length + ' steps, ' + fades.map((x) => x.toFixed(2)).join(' ') + ')');
      if (v.reduce) assert(L.trace.every((x) => x[3] === 0) && L.trace.filter((x) => x[1] === 'e').some((x) => x[2] < 0.9), tag + ': reduced motion — a fade in where it stands, no travel');
      else assert(L.trace.filter((x) => x[1] === 'e').some((x) => x[3] < 0) && L.trace.filter((x) => x[1] !== 'e').every((x) => x[3] === 0), tag + ': slides in from the left, then stands still while it holds and fades');
      // the target the technique acted on is the one chosen (Suzu alone: that one too)
      assert(r.tech.meta.target === 'foe', tag + ': aimed at the chosen creature ' + r.tech.meta.target);
      if (!v.reduce && v.anim === 'normal' && !v.label) {
        // one full capture per pairing at frame resolution (for the record)
        report['timeline_' + comp] = { cue: 'cutin @0', marks: L.marks, frames: L.trace.length, trace: L.trace, results: r.tech.beats, fired: r.tech.fired, sequenceEnd: r.tech.meta.end, wallMs: r.tech.dur, placement: { fit: L.fit, variant: L.variant, scale: L.scale, footprint: L.footprint, faceH: L.faceH, view: L.view } };
      }
      assert(!errors.length, tag + ': ' + errors.join('; '));
    }
    // what it cost (this machine, headless): starting a portrait (placement + first drawing) and each frame
    report['cost_' + comp] = await p.evaluate(() => ({ cutin: RB.harmonyCutin.stats().cost, artBuild: RB.harmonyArt.stats().bustBuildMs, artCache: { busts: RB.harmonyArt.stats().busts, compositions: RB.harmonyArt.stats().compositions, MiB: +(RB.harmonyArt.stats().bytes / 1048576).toFixed(2) }, figures: RB.battlers.budget() }));
    await ctx.close();
  }
  // identical rules' state across every presentation configuration of a pairing (and pets shown/hidden)
  const bad = [];
  for (const comp of COMPS) { const s0 = sigs[comp][0].sig; for (const x of sigs[comp]) if (x.sig !== s0) bad.push(comp + ' ' + JSON.stringify(x.v) + ': ' + x.sig + ' vs ' + s0); }
  report.core = core;
  assert(!bad.length, 'the same rules\' state in every configuration: ' + bad.join('\n'));
});

// ---------------------------------------------------------------------------------------------------------
await test('never: meter fill, a support action, hovering and focusing the technique, a cancelled task, backing out of the companion\'s menu — no cut-in; then the committed technique — exactly one', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await setup(p, { comp: 'mio', knots: 8, harmony: 2, pc: 8 });
  const started = () => p.evaluate(() => RB.harmonyCutin.stats().started);
  const s0 = await started();
  // Harmony fills (an Unravel answered right on the first try) with Mio's support action: no portrait
  await p.evaluate(() => { window.__HC.frames = []; window.__HC.on = true; });
  await clickCard(p, 'unravel');
  await answerRight(p);
  const act = await companionPick(p, 'Warm draught|draught|salve');
  await settle(p);
  const full = await p.evaluate(() => RB.combat.state().harmony >= RB.combat.state().harmonyMax);
  assert(full && (await started()) === s0, 'meter fill and a support action (' + act + '): Harmony full, no cut-in');
  // the technique offered: hover it and focus it (its preview) — nothing
  const tc = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => /With Mio/.test(x.textContent)); return c && c.getAttribute('data-i'); });
  assert(tc != null, 'the technique is offered');
  const c = await center(p, '.rcard[data-i="' + tc + '"]');
  await p.mouse.move(c.x, c.y);
  await wait(p, 500);
  await p.evaluate((i) => document.querySelector('.rcard[data-i="' + i + '"]').focus(), tc);
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowUp');
  await wait(p, 400);
  assert((await started()) === s0, 'hover and focus (the preview): no cut-in');
  // open its task, then back out ("Choose a different response")
  await clickCard(p, 'With Mio');
  await waitSel(p, '.chal', { timeout: 8000 });
  const back = await p.evaluate(() => { const bt = [...document.querySelectorAll('.chal button')].find((x) => /different response/i.test(x.textContent)); if (bt) bt.click(); return !!bt; });
  assert(back, 'the task offers "Choose a different response"');
  await toCards(p);
  assert((await started()) === s0, 'a cancelled task: no cut-in');
  // answer it, then back out of the companion's menu
  await clickCard(p, 'With Mio');
  await answerRight(p);
  await waitSel(p, '.ccard', { timeout: 8000 });
  await wait(p, 300);
  const backed = await p.evaluate(() => { const bt = [...document.querySelectorAll('.cb-dock button, .ccard')].find((x) => /^\s*(Back|Choose a different)/i.test(x.textContent)); if (bt) { bt.click(); return bt.textContent.trim().slice(0, 40); } return null; });
  if (backed) { await toCards(p); assert((await started()) === s0, 'backing out of the companion\'s menu (' + backed + '): no cut-in'); }
  // now the real, committed technique: exactly one
  const r = await technique(p, 'mio');
  assert(r.started === 1 && r.last.why === 'done', 'the committed technique: exactly one cut-in ' + JSON.stringify({ started: r.started, why: r.last && r.last.why }));
  report.never = { metersFill: true, support: act, backedOutOfCompanionMenu: !!backed, then: r.started };
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
// geometry and the combination plan: one technique per scene, the drawn pixels checked against what is protected
const geo = [];
async function scene(sc) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: sc.w, height: sc.h } });
  await setup(p, Object.assign({ knots: sc.knots || 6, pc: 8 }, sc));
  const r = await technique(p, sc.comp, { every: 1 });
  const during = r.frames.filter((f) => f.ov);
  const hitsAfterEntry = during.filter((f) => f.state !== 'entering' && f.ov.length);
  // the layouts the technique passed through (feet, creatures, scale, the status dock), in order: compared
  // with the same scene played with the portrait Off — the overlay must not move any of them
  const lays = [];
  for (const f of r.frames) if ((f.kind === 'player' || f.kind === 'finish') && f.lay && lays[lays.length - 1] !== f.lay) lays.push(f.lay);
  const L = r.started ? r.last : null;
  const row = { name: sc.name, view: sc.w + '×' + sc.h, text: (sc.text || 1) * 100 + '%', comp: sc.comp, controls: sc.controls || 'adaptive', intents: sc.intents || 'adaptive', foes: sc.foes || 1, shown: r.started, displayed: L ? L.displayed : false, why: L ? L.why : null, fit: L ? L.fit : 'omitted', variant: L && L.variant, scale: L && L.scale, faceH: L && L.faceH, footprint: L && L.footprint, footprintShare: L ? { w: +(L.footprint.w / sc.w * 100).toFixed(1), h: +(L.footprint.h / sc.h * 100).toFixed(1), area: +(L.footprint.w * L.footprint.h / (sc.w * sc.h) * 100).toFixed(1) } : null, checkedFrames: during.length, overlaps: hitsAfterEntry.length, fallback: r.fallback ? { reason: r.fallback.reason, tried: r.fallback.tried } : null, layouts: lays.length, relaid: r.relaid, disposedAt: L ? markAt(L, 'disposed') : null, firstResult: firstResult(r) };
  if (!sc.flourishOffRun) geo.push(row);
  await ctx.close();
  return { row, r, errors, hitsAfterEntry, lays };
}
const VIEWS = [[1648, 840], [1440, 900], [1280, 720], [768, 1024], [390, 844], [320, 640], [844, 390]];
await test('geometry: seven viewports at 100 % and 200 % text — the fit mode and footprint recorded; no drawn pixel within 12 px of a protected rectangle; nothing else moves; 390×844 uses the designed compact pair (faces ≥ 64 px)', async () => {
  let k = 0;
  const bad = [];
  for (const [w, h] of VIEWS) for (const text of [1, 2]) {
    const comp = COMPS[k++ % 4];
    let sc;
    try { sc = await scene({ name: w + 'x' + h + (text > 1 ? ' 200%' : ''), w, h, text, comp }); } catch (e) { bad.push(w + 'x' + h + ' ' + text * 100 + '%: ' + String(e && e.message || e).slice(0, 400)); continue; }
    const { row, errors, hitsAfterEntry } = sc;
    if (hitsAfterEntry.length) console.log('    overlap: ' + JSON.stringify(hitsAfterEntry[0].ov) + ' visible ' + JSON.stringify(hitsAfterEntry[0].vis));
    console.log('  ' + row.view + ' ' + row.text + ' ' + comp + ': ' + (row.shown && row.displayed ? row.fit + ' ' + row.variant + ' ×' + row.scale + ' faces ' + row.faceH + ' px, footprint ' + JSON.stringify(row.footprint) + ' (' + JSON.stringify(row.footprintShare) + ')' : 'omitted — ' + (row.fallback && row.fallback.reason)) + '; frames checked ' + row.checkedFrames + ', overlaps ' + row.overlaps + ', layouts ' + row.layouts + ', placed again ' + row.relaid);
    if (hitsAfterEntry.length) bad.push(row.name + ': ' + JSON.stringify(hitsAfterEntry[0].ov));
    if ((w === 1280 || w === 390 || (w === 1648 && text === 1))) {
      // the same scene with the portrait Off: the very same layouts, in the same order
      const off = await scene({ name: row.name + ' (portrait off)', w, h, text, comp, flourish: false, flourishOffRun: true });
      row.sameLayoutAsPortraitOff = JSON.stringify(off.lays) === JSON.stringify(sc.lays);
      if (!row.sameLayoutAsPortraitOff) bad.push(row.name + ': the layout differs from the same scene with the portrait Off ' + JSON.stringify({ on: sc.lays.length, off: off.lays.length }));
    }
    if (row.shown && !(row.disposedAt < row.firstResult)) bad.push(row.name + ': not gone before the first result');
    if (errors.length) bad.push(row.name + ': ' + errors.join('; '));
    if (w === 390 && text === 1 && !(row.shown && row.variant === 'compact' && row.faceH >= 64)) bad.push('390×844: not the designed compact pair ' + JSON.stringify(row));
    if (w === 1648 && text === 1 && !(row.shown && row.variant === 'standard')) bad.push('1648×840: not the standard pair ' + JSON.stringify(row));
  }
  report.geometry = geo.slice();
  assert(!bad.length, bad.join('\n'));
});
await test('plan: Keep visible + Expanded (Ren), a group of three (Suzu: one portrait), a finishing technique (Nao), Adaptive + Expanded on a phone (Mio) — one cut-in each, nothing covered', async () => {
  const plan = [
    { name: 'Keep visible + Expanded, 1280×720, Ren', w: 1280, h: 720, comp: 'ren', controls: 'keep', intents: 'expanded' },
    { name: 'Keep visible + Expanded, 1648×840, Suzu', w: 1648, h: 840, comp: 'suzu', controls: 'keep', intents: 'expanded' },
    { name: 'group of three, 1280×720, Suzu', w: 1280, h: 720, comp: 'suzu', foes: 3 },
    { name: 'group of three, 1648×840, Mio', w: 1648, h: 840, comp: 'mio', foes: 3 },
    { name: 'group of two, 1920×1080, Nao', w: 1920, h: 1080, comp: 'nao', foes: 2 },
    { name: 'finishing technique, 1280×720, Nao', w: 1280, h: 720, comp: 'nao', knots: 2 },
    { name: 'Adaptive + Expanded, 390×844, Mio', w: 390, h: 844, comp: 'mio', intents: 'expanded' },
    { name: 'Keep visible, 390×844, Mio', w: 390, h: 844, comp: 'mio', controls: 'keep' },
  ];
  const bad = [];
  for (const sc of plan) {
    const { row, r, errors, hitsAfterEntry } = await scene(sc);
    console.log('  ' + sc.name + ': ' + (row.shown ? row.fit + ' ' + row.variant + ' ×' + row.scale : 'omitted — ' + (row.fallback && row.fallback.reason)) + ', overlaps ' + row.overlaps + ', ' + r.tech.kind + (r.won ? ' (won: ' + r.won + ')' : ''));
    if (hitsAfterEntry.length) bad.push(sc.name + ': ' + JSON.stringify(hitsAfterEntry[0].ov));
    if (row.shown > 1 || (row.shown === 0 && !row.fallback)) bad.push(sc.name + ': ' + row.shown + ' cut-ins');
    // a group: one portrait for the whole technique — or, where the formation fills the left side, none (the
    // recorded fallback) — never one per creature; Suzu's turns every creature's move
    if (sc.foes > 1 && !(row.shown <= 1 && (row.shown === 1 ? row.displayed : !!row.fallback))) bad.push(sc.name + ': one portrait (or the recorded fallback) for the whole group ' + JSON.stringify(row));
    if (sc.foes > 1 && sc.comp === 'suzu' && r.tech.beats.filter((x) => x.t === 'unravel').length !== sc.foes) bad.push(sc.name + ': every creature\'s knot freed ' + JSON.stringify(r.tech.beats));
    if (sc.knots === 2 && !(r.won === 'win' && r.tech.kind === 'finish' && row.shown === 1 && row.disposedAt < row.firstResult)) bad.push(sc.name + ': the finishing technique ' + JSON.stringify({ won: r.won, kind: r.tech.kind, shown: row.shown }));
    if (errors.length) bad.push(sc.name + ': ' + errors.join('; '));
  }
  report.plan = geo.slice(-plan.length);
  assert(!bad.length, bad.join('\n'));
});

// ---------------------------------------------------------------------------------------------------------
await test('frozen frame: with everything frozen during the hold, the frame with the overlay shown and hidden is identical outside the overlay (1280×720 and 390×844)', async () => {
  const res = [];
  for (const [w, h, comp] of [[1280, 720, 'suzu'], [390, 844, 'ren'], [1648, 840, 'mio']]) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: w, height: h } });
    await setup(p, { comp, knots: 6 });
    await clickCard(p, 'With ' + NAME[comp]);
    await answerRight(p);
    await companionPick(p, 'Join');
    // well into the hold (the menus' withdrawal long finished), then freeze
    await p.waitForFunction(() => { const s = RB.harmonyCutin.state(); return s.state === 'holding' && s.t >= 380; }, null, { timeout: 8000, polling: 'raf' });
    // freeze: the frame loop draws nothing more (the presentation clock stops with it)
    const rect = await p.evaluate(() => { window.__frame0 = RB.render.frame; RB.render.frame = () => {}; const r = document.querySelector('.cb-cutin').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    await wait(p, 120);
    const on = await p.screenshot();
    await p.evaluate(() => { document.querySelector('.cb-cutin').style.visibility = 'hidden'; });
    await wait(p, 120);
    const off = await p.screenshot();
    await p.evaluate(() => { document.querySelector('.cb-cutin').style.visibility = ''; });
    await wait(p, 120);
    const on2 = await p.screenshot(); // (shown again: anything that differs here moves by itself, not by the overlay)
    // the same pair with the DOM controls drawn above the scene (Skip, the banner) hidden in both: Chromium
    // re-rasterises their text and gradients when the layer beneath them repaints, by a level or two
    await p.evaluate(() => { for (const e of document.querySelectorAll('.cb-skip, .cb-banner')) e.style.visibility = 'hidden'; });
    await wait(p, 120);
    const on3 = await p.screenshot();
    await p.evaluate(() => { document.querySelector('.cb-cutin').style.visibility = 'hidden'; });
    await wait(p, 120);
    const off3 = await p.screenshot();
    await p.evaluate(() => { document.querySelector('.cb-cutin').style.visibility = ''; for (const e of document.querySelectorAll('.cb-skip, .cb-banner')) e.style.visibility = ''; RB.render.frame = window.__frame0; });
    const cmp = await p.evaluate(async ([a, bb, r]) => {
      const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = u; });
      const [ia, ib] = await Promise.all([load(a), load(bb)]);
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
      const g = c.getContext('2d'); g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
      g.clearRect(0, 0, c.width, c.height); g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
      let outside = 0, inside = 0, box = null;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4, d = da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2];
        if (!d) continue;
        if (x >= Math.floor(r.x) && x < Math.ceil(r.x + r.w) && y >= Math.floor(r.y) && y < Math.ceil(r.y + r.h)) inside++;
        else { outside++; box = box ? [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)] : [x, y, x, y]; }
      }
      return { outside, inside, box };
    }, ['data:image/png;base64,' + on.toString('base64'), 'data:image/png;base64,' + off.toString('base64'), rect]);
    const self = await p.evaluate(async ([a, bb]) => {
      const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = u; });
      const [ia, ib] = await Promise.all([load(a), load(bb)]);
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
      const g = c.getContext('2d'); g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
      g.clearRect(0, 0, c.width, c.height); g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0, box = null;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; box = box ? [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)] : [x, y, x, y]; } }
      return { n, box };
    }, ['data:image/png;base64,' + on.toString('base64'), 'data:image/png;base64,' + on2.toString('base64')]);
    cmp.selfChange = self;
    const bare = await p.evaluate(async ([a, bb, r]) => {
      const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = u; });
      const [ia, ib] = await Promise.all([load(a), load(bb)]);
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
      const g = c.getContext('2d'); g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
      g.clearRect(0, 0, c.width, c.height); g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
      let outside = 0, maxd = 0;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        if (x >= Math.floor(r.x) && x < Math.ceil(r.x + r.w) && y >= Math.floor(r.y) && y < Math.ceil(r.y + r.h)) continue;
        const i = (y * c.width + x) * 4, d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
        if (d) { outside++; maxd = Math.max(maxd, d); }
      }
      return { outside, maxd };
    }, ['data:image/png;base64,' + on3.toString('base64'), 'data:image/png;base64,' + off3.toString('base64'), rect]);
    cmp.bare = bare;
    res.push({ view: w + '×' + h, comp, overlay: rect, changedOutside: cmp.outside, changedInside: cmp.inside, outsideBox: cmp.box, shownTwice: cmp.selfChange, withoutSkipAndBanner: cmp.bare });
    if (toDocs && w === 390) {
      // the compact cut-in on a phone, as shown (WebP)
      const webp = await p.evaluate(async (u) => { const i = new Image(); await new Promise((r) => { i.onload = r; i.src = u; }); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d').drawImage(i, 0, 0); return c.toDataURL('image/webp', 0.9); }, 'data:image/png;base64,' + on.toString('base64'));
      fs.writeFileSync(path.join(docsDir, 'compact_390x844_' + comp + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
    }
    await settle(p);
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
  report.frozen = res;
  console.log('  ' + JSON.stringify(res));
  // the scene and every other surface identical outside the overlay; the only differences anywhere outside it
  // are Chromium re-rasterising the text controls above the scene (Skip, the banner) — measured, reported
  assert(res.every((x) => x.withoutSkipAndBanner.outside === 0 && x.changedInside > 1000), 'identical outside the overlay (and the overlay itself drawn): ' + JSON.stringify(res));
});

// ---------------------------------------------------------------------------------------------------------
await test('life: Skip settles once and clears it; a hidden tab, a campaign change and word help opening clear it; a resize mid-action places the same instance again (no replay, nothing spent twice); the committing press never skips it', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const out = {};
  const midCut = async (comp, fn) => {
    await setup(p, { comp, knots: 8 });
    const s0 = await p.evaluate(() => RB.harmonyCutin.stats().started);
    await clickCard(p, 'With ' + NAME[comp]);
    await answerRight(p);
    await companionPick(p, 'Join');
    await p.waitForFunction(() => RB.harmonyCutin.state().state === 'holding', null, { timeout: 8000, polling: 'raf' });
    const tok = await p.evaluate(() => RB.harmonyCutin.state().token);
    const r = await fn(tok);
    const after = await p.evaluate(() => ({ s: RB.harmonyCutin.stats(), last: RB.harmonyCutin.last(), layers: document.querySelectorAll('.cb-cutin').length, harmony: RB.combat.state() && RB.combat.state().harmony }));
    return Object.assign({ started: after.s.started - s0, why: after.last && after.last.why, layers: after.layers, harmony: after.harmony }, r || {});
  };
  // Skip: a fresh press on Skip during the hold
  out.skip = await midCut('suzu', async () => {
    const c = await center(p, '.cb-skip:not([hidden])');
    await p.mouse.click(c.x, c.y);
    await wait(p, 60);
    const s = await p.evaluate(() => ({ st: RB.harmonyCutin.state().state, layers: document.querySelectorAll('.cb-cutin').length }));
    await settle(p);
    const tr = await p.evaluate(() => RB.battleSeq.trace().filter((x) => x.meta && x.meta.card === 'tech').slice(-1)[0]);
    return { now: s, settled: tr.settled, beats: tr.beats.map((x) => x.t).join() };
  });
  assert(out.skip.started === 1 && out.skip.why === 'skip' && out.skip.now.layers === 0 && out.skip.settled === 'skip' && out.skip.beats === 'unravel,tech', 'Skip: settled once, the portrait gone at once, every result applied once ' + JSON.stringify(out.skip));
  // a hidden tab
  out.hidden = await midCut('nao', async () => {
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const s = await p.evaluate(() => ({ st: RB.harmonyCutin.state().state, layers: document.querySelectorAll('.cb-cutin').length }));
    await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await settle(p);
    return { now: s };
  });
  assert(out.hidden.why === 'hidden' && out.hidden.now.layers === 0, 'a hidden tab: cleared at once, no stale portrait on return ' + JSON.stringify(out.hidden));
  // word help opening over the battle mid-action
  out.help = await midCut('mio', async () => {
    const opened = await p.evaluate(() => { const a = document.querySelector('.cb-party .cb-harmony, .cb-party .kw'); if (a) RB.combatHelp.show(a, 'focus'); return RB.combatHelp.isOpen(); });
    await wait(p, 60);
    const s = await p.evaluate(() => ({ st: RB.harmonyCutin.state().state, layers: document.querySelectorAll('.cb-cutin').length }));
    await p.evaluate(() => RB.combatHelp.hide());
    await settle(p);
    return { opened, now: s };
  });
  assert(!out.help.opened || (/^layer/.test(out.help.why) && out.help.now.layers === 0), 'word help opening: the portrait is removed, never animated over it ' + JSON.stringify(out.help));
  // resize mid-action: the same instance placed again
  out.resize = await midCut('ren', async (tok) => {
    await p.setViewportSize({ width: 1648, height: 840 });
    await wait(p, 120);
    const s = await p.evaluate(() => Object.assign(RB.harmonyCutin.state(), { relaid: RB.harmonyCutin.stats().relaid, started: RB.harmonyCutin.stats().started }));
    await settle(p);
    await p.setViewportSize({ width: 1280, height: 720 });
    return { token: tok, now: { token: s.token, state: s.state, fit: s.fit, variant: s.variant, relaid: s.relaid } };
  });
  assert(out.resize.started === 1 && out.resize.now.relaid >= 1 && (out.resize.now.token === out.resize.token || out.resize.now.state === 'inactive') && (out.resize.why === 'done' || out.resize.why === 'resize-invalid'), 'resize: placed again from the same action (no replay, one start) ' + JSON.stringify(out.resize));
  // a campaign change (load / new / title) mid-action
  // (a real change of campaign, as Load, New or Return to title make: the battle is abandoned whole —
  // src/ui/80_combat.js — so the exchange does not continue; the next setup starts from the map)
  out.campaign = await midCut('suzu', async () => {
    await p.evaluate(() => RB.game.debugStart('rw.mill1', 7, 9, { comp: 'suzu' }));
    await wait(p, 60);
    return { now: await p.evaluate(() => ({ st: RB.harmonyCutin.state().state, layers: document.querySelectorAll('.cb-cutin').length, spans: RB.harmonyCutin.stats().spans, mode: RB.game.mode(), seq: !!RB.battleSeq.current() })) };
  });
  // (the battle's own abandon runs first — its scene exit disposes the portrait as 'exit'; the cut-in's
  // campaign listener then clears its caches)
  assert((out.campaign.why === 'campaign' || out.campaign.why === 'exit') && out.campaign.now.layers === 0 && out.campaign.now.spans === 0 && out.campaign.now.mode !== 'combat' && !out.campaign.now.seq, 'a campaign change: cleared with its caches, the battle gone with it ' + JSON.stringify(out.campaign));
  // the committing press: "Join" started the action; it neither skipped nor hurried the portrait
  await setup(p, { comp: 'nao', knots: 8 });
  const r = await technique(p, 'nao');
  out.press = { why: r.last.why, hurried: r.tech.hurried, settled: r.tech.settled };
  assert(r.last.why === 'done' && !r.tech.hurried && !r.tech.settled, 'the press that committed the technique does not skip or hurry it ' + JSON.stringify(out.press));
  // a direct check of the gate: no cut-in starts while a reading layer (the language task) is open
  await clickCard(p, 'unravel');
  const gate = await p.evaluate(() => { const before = RB.harmonyCutin.stats().suppressed.sheet || 0; const tok = RB.harmonyCutin.start({ type: 'cutin', comp: 'nao' }, RB.battleSeq.now(), null); return { tok, sheet: (RB.harmonyCutin.stats().suppressed.sheet || 0) - before }; });
  out.gate = gate;
  assert(gate.tok === null && gate.sheet === 1, 'with the language task open no cut-in can start ' + JSON.stringify(gate));
  report.life = out;
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('cycles: 20 techniques (each pairing, Normal / Fast / reduced, a few with a pet) in one page — event listeners, layers, timers and caches stay bounded', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Performance.enable');
  const rows = [];
  for (let k = 0; k < (process.env.HC_CYCLES ? +process.env.HC_CYCLES : 20); k++) {
    const comp = COMPS[k % 4];
    await setup(p, { comp, knots: 6, anim: k % 5 === 4 ? 'fast' : 'normal', reduce: k % 7 === 3, timeScale: 2, pet: k % 6 === 1 ? 'cat' : null, flourish: !process.env.HC_OFF });
    const r = await technique(p, comp, { every: 6 });
    await leave(p);
    await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
    await wait(p, 120);
    const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
    const s = await p.evaluate(() => { const H = RB.harmonyCutin.stats(), A = RB.harmonyArt.stats(); const cnt = (q) => document.querySelectorAll(q).length; return { left: { combat: cnt('.combat-ui'), chal: cnt('.chal'), sheet: cnt('.csheet, .scrim'), strips: cnt('.cb-strip'), fx: cnt('.cb-fx'), all: cnt('*') }, mode: RB.game.mode(), layers: document.querySelectorAll('.cb-cutin').length, live: H.live, listening: H.listening, spans: H.spans, busts: A.busts, comps: A.compositions, artMiB: +(A.bytes / 1048576).toFixed(2), timers: RB.battleSeq.stats().timers, frames: RB.battlers.budget().frames }; });
    if (process.env.HC_DUMP) {
      const out = {};
      for (const ex of ['window', 'document', 'document.body', 'document.getElementById("ui") || document.body.firstElementChild']) {
        const { result } = await cdp.send('Runtime.evaluate', { expression: ex });
        const ls = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
        const by = {}; for (const l of ls.listeners) by[l.type] = (by[l.type] || 0) + 1;
        out[ex.slice(0, 14)] = by;
      }
      console.log('    listeners ' + (k + 1) + ': ' + JSON.stringify(out));
    }
    rows.push({ k: k + 1, comp, shown: r.started, listeners: m.JSEventListeners, nodes: m.Nodes, heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), ...s });
  }
  report.cycles = rows;
  const a = rows[4], z = rows[rows.length - 1];
  console.log('  from cycle 5 to 20: listeners ' + a.listeners + ' → ' + z.listeners + ', nodes ' + a.nodes + ' → ' + z.nodes + ', heap ' + a.heapMB + ' → ' + z.heapMB + ' MB, art caches ' + z.busts + ' busts / ' + z.comps + ' compositions (' + z.artMiB + ' MiB), figure frames ' + z.frames);
  assert(rows.every((r) => r.layers === 0 && r.live === 0 && !r.listening && r.timers === 0), 'no layer, instance, listener or timer left after any cycle ' + JSON.stringify(rows.find((r) => r.layers || r.live || r.listening || r.timers)));
  // what the portrait and the performances own stays bounded: no layer, instance, listener or timer of theirs
  // outlives a technique; the art and span caches and the figure frames stay under their caps. Chrome's own
  // page-wide counters must not grow with the encounters either. (They once grew by about 13 listeners and
  // 210 nodes an encounter: that was this harness keeping Playwright element handles from waitForSelector,
  // each holding a finished learning task's detached panel alive; waitSel lets go of them.)
  assert(z.spans <= 8 && z.busts <= 24 && z.comps <= 16 && z.frames <= 720 && rows.every((r) => r.left.combat === 0 && r.left.strips === 0 && r.left.fx === 0), 'bounded: spans ' + z.spans + ', busts ' + z.busts + ', compositions ' + z.comps + ', frames ' + z.frames + ', battle layers left ' + JSON.stringify(z.left));
  assert(z.nodes - a.nodes <= 40 && z.listeners - a.listeners <= 20, 'page-wide counters stay flat from cycle 5 on: nodes ' + a.nodes + ' → ' + z.nodes + ', listeners ' + a.listeners + ' → ' + z.listeners);
  assert(process.env.HC_OFF || rows.filter((r) => r.shown === 1).length === rows.length, 'one cut-in in each technique');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('setting: "Harmony portrait flourish" is On by default (also for an older settings record), sits with the Battles settings, and a real click turns it Off and saves it', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const def = await p.evaluate(() => ({ now: RB.game.settings.harmonyFlourish, enabled: RB.harmonyCutin.enabled() }));
  assert(def.now === true && def.enabled, 'On by default ' + JSON.stringify(def));
  // an older record without the key: still On (presentation only; nothing else changes)
  const old = await p.evaluate(() => { delete RB.game.settings.harmonyFlourish; return RB.harmonyCutin.enabled(); });
  assert(old === true, 'an older settings record (no key) counts as On');
  await p.evaluate(() => { RB.game.settings.harmonyFlourish = true; RB.ui.settings.open(); });
  await waitSel(p, '.folio-settings [data-grp="learning"]', { timeout: 8000 });
  await p.click('.folio-settings [data-grp="learning"]');
  await waitSel(p, '[data-sw="harmonyFlourish"]', { timeout: 8000 });
  const row = await p.evaluate(() => { const i = document.querySelector('[data-sw="harmonyFlourish"]'); const f = i.closest('.field'); const prev = f.previousElementSibling; return { label: f.textContent.replace(/\s+/g, ' ').trim(), checked: i.checked, afterBattles: !!(prev && /What creatures are about to do/.test(prev.textContent)) }; });
  assert(/Harmony portrait flourish/.test(row.label) && row.checked && row.afterBattles, 'the switch, On, beside the Battles settings ' + JSON.stringify(row));
  await p.evaluate(() => document.querySelector('[data-sw="harmonyFlourish"]').scrollIntoView({ block: 'center' }));
  await p.click('[data-sw="harmonyFlourish"]', { force: true });
  await p.waitForFunction(() => RB.game.settings.harmonyFlourish === false, null, { timeout: 4000 });
  const saved = await p.evaluate(async () => { const s = await RB.save.loadSettings(); return s && s.harmonyFlourish; });
  assert(saved === false && !(await p.evaluate(() => RB.harmonyCutin.enabled())), 'Off, saved with the settings');
  report.setting = { default: def.now, olderRecord: old, row: row.label, savedOff: saved === false };
  await p.evaluate(() => { RB.ui.settings.close(); RB.game.settings.harmonyFlourish = true; });
  // in battle: the battle's own settings sheet offers it (presentation only); opened while a portrait holds, the
  // encounter pauses with the portrait where it stands; turned Off there, the portrait goes on resuming and the
  // technique plays on unchanged
  await setup(p, { comp: 'suzu', knots: 8 });
  await clickCard(p, 'With Suzu');
  await answerRight(p);
  await companionPick(p, 'Join');
  await p.waitForFunction(() => RB.harmonyCutin.state().state === 'holding', null, { timeout: 8000, polling: 'raf' });
  const opened = await p.evaluate(() => RB.ui.settings.openBattle && RB.ui.settings.openBattle());
  let inSheet = null;
  if (opened) {
    await waitSel(p, '.folio-bset [data-grp="battle"]', { timeout: 8000 });
    await p.click('.folio-bset [data-grp="battle"]');
    await waitSel(p, '.folio-bset [data-sw="harmonyFlourish"]', { timeout: 8000 });
    const t0 = await p.evaluate(() => RB.harmonyCutin.state().t);
    await wait(p, 300);
    inSheet = await p.evaluate((t0) => ({ paused: RB.battleSeq.paused && RB.battleSeq.paused(), state: RB.harmonyCutin.state().state, still: RB.harmonyCutin.state().t === t0, checked: document.querySelector('.folio-bset [data-sw="harmonyFlourish"]').checked }), t0);
    await p.evaluate(() => document.querySelector('.folio-bset [data-sw="harmonyFlourish"]').scrollIntoView({ block: 'center' }));
    await p.click('.folio-bset label.switch:has([data-sw="harmonyFlourish"])');
    await p.waitForFunction(() => RB.game.settings.harmonyFlourish === false, null, { timeout: 4000 });
    await p.evaluate(() => RB.ui.settings.close());
    await settle(p);
    inSheet.after = await p.evaluate(() => ({ why: RB.harmonyCutin.last().why, layers: document.querySelectorAll('.cb-cutin').length, tech: RB.battleSeq.trace().filter((x) => x.meta && x.meta.card === 'tech').slice(-1)[0].beats.map((b) => b.t).join() }));
  }
  report.setting.battleSheet = { opened: !!opened, inSheet };
  assert(opened && inSheet.paused && inSheet.state === 'holding' && inSheet.still && inSheet.checked && inSheet.after.why === 'off' && inSheet.after.layers === 0 && inSheet.after.tech === 'unravel,tech', 'the battle\'s sheet: paused with the portrait where it stood; Off there removes it on resuming; the technique completes ' + JSON.stringify(report.setting.battleSheet));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('dev viewer (?dev=harmony): refused on a normal page; on a dev page the panel is labelled synthetic, and each pairing\'s cut-in and stage performance play on demand without touching the rules', async () => {
  const plain = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const refused = await plain.p.evaluate(() => ({ allowed: RB.harmonyCutin.dev.allowed(), battle: RB.harmonyCutin.dev.battle({ comp: 'suzu' }), panel: RB.harmonyCutin.dev.panel(), el: !!document.getElementById('harmony-dev') }));
  assert(!refused.allowed && refused.battle === false && refused.panel === null && !refused.el, 'not reachable in normal play ' + JSON.stringify(refused));
  await plain.ctx.close();
  const { p, errors, ctx } = await page(b, url + '?dev=harmony', { viewport: { width: 1280, height: 720 } });
  await waitSel(p, '#harmony-dev', { timeout: 10000 });
  const label = await p.evaluate(() => document.getElementById('harmony-dev').textContent);
  assert(/Synthetic fixture/.test(label) && /no rules applied/.test(label), 'the panel says it is a synthetic fixture: ' + label.slice(0, 120));
  const out = [];
  for (const comp of COMPS) {
    await p.evaluate((c) => RB.harmonyCutin.dev.battle({ comp: c, foes: c === 'suzu' ? 2 : 1, anim: 'normal', reduce: false, flourish: true }), comp);
    await toCards(p);
    const before = await p.evaluate(() => JSON.stringify(RB.combat.state()));
    const s0 = await p.evaluate(() => RB.harmonyCutin.stats().started);
    const f0 = await p.evaluate(() => RB.harmonyCutin.stats().fallbacks.length);
    await p.evaluate(() => { window.__devDone = null; RB.harmonyCutin.dev.play({}).then((r) => { window.__devDone = r ? r.kind : 'refused'; }); });
    await p.waitForFunction(() => window.__devDone, null, { timeout: 15000 });
    const r = await p.evaluate((f0) => ({ done: window.__devDone, started: RB.harmonyCutin.stats().started, last: RB.harmonyCutin.last(), fb: RB.harmonyCutin.stats().fallbacks.slice(f0).map((x) => x.reason), after: JSON.stringify(RB.combat.state()), trace: RB.battleSeq.trace().slice(-1)[0] }), f0);
    const cutins = r.started - s0;
    out.push({ comp, foes: comp === 'suzu' ? 2 : 1, kind: r.done, cutins, fit: cutins ? r.last && r.last.fit : 'omitted', fallback: cutins ? null : r.fb[0] || null, beats: r.trace.beats.length, same: before === r.after });
    // one cut-in — or, for the group (two creatures at 1280×720, the left one's box over the party's side), the
    // fit order's recorded omission, exactly as in play; the performance plays either way, no result applied
    const one = cutins === 1 || (comp === 'suzu' && cutins === 0 && r.fb.length === 1);
    assert(r.done === 'dev' && one && r.trace.beats.length === 0 && before === r.after, comp + ': the synthetic playback shows one cut-in (or its recorded fallback) and the performance, applies no result ' + JSON.stringify(out[out.length - 1]));
  }
  report.devViewer = out;
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
// The painted path (docs/harmony/contract/CONTRACT.md) with its SYNTHETIC sample (tests/fixtures/harmony_sample:
// Suzu and the player only), installed into the page as a build with art embedded would: the overlay plays the
// art's own timeline of states on the presentation clock, takes its sizes from NATIVE / fitScale / the canvas,
// and on a phone at device pixel ratio 3 accepts the compact pair's fractional CSS scale.
await test('painted sample (synthetic, Suzu): the art\'s timeline of states played in order (Normal, Fast; reduced motion: the last state alone); sizes from the API; 390×844 at device pixel ratio 3 — the compact pair at a fractional CSS scale; nothing covered', async () => {
  const { importSet } = await import('../../tools/harmony/importer.mjs');
  const dir = path.join(outDir, 'sample_assets');
  const imp = importSet(path.join(root, 'tests/fixtures/harmony_sample/incoming'), { out: dir, replace: true });
  assert(imp.report.ok, 'the synthetic sample imports ' + JSON.stringify(imp.report.summary));
  const files = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.png'))) files[f] = fs.readFileSync(path.join(dir, f)).toString('base64');
  const assets = { manifest: imp.manifest, files };
  const rows = [], bad = [];
  for (const v of [{ w: 1280, h: 720, anim: 'normal' }, { w: 1280, h: 720, anim: 'fast' }, { w: 1280, h: 720, anim: 'normal', reduce: true }, { w: 390, h: 844, dpr: 3, anim: 'normal' }]) {
    const tag = v.w + '×' + v.h + (v.dpr ? ' @' + v.dpr + 'x' : '') + ' ' + v.anim + (v.reduce ? ' reduced' : '');
    const { p, errors, ctx } = await page(b, url, { viewport: { width: v.w, height: v.h }, dpr: v.dpr || 1 });
    // (a look the sample covers: its player files are a coat or a robe with ponytail or curly hair)
    await setup(p, { comp: 'suzu', knots: 6, pc: 8, anim: v.anim, reduce: !!v.reduce, look: { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower'] } });
    const inst = await p.evaluate(async (assets) => {
      const r = RB.harmonyRaster.install(assets);
      const look = RB.equip.look(RB.game.s);
      await RB.harmonyArt.prepare([{ comp: 'suzu', look, variant: 'standard' }, { comp: 'suzu', look, variant: 'compact' }], { async: true });
      return { ok: r.ok, errors: r.errors, active: RB.harmonyRaster.active(), timeline: RB.harmonyArt.timeline ? RB.harmonyArt.timeline('suzu') : null, native: RB.harmonyArt.NATIVE, dpr: devicePixelRatio };
    }, assets);
    if (!(inst.ok && inst.active && Array.isArray(inst.timeline) && inst.timeline.length >= 3)) { bad.push(tag + ': not installed ' + JSON.stringify(inst).slice(0, 300)); await ctx.close(); continue; }
    let held = null;
    const r = await technique(p, 'suzu', { every: 1, during: async () => {
      await p.waitForFunction(() => RB.harmonyCutin.state().state === 'holding', null, { timeout: 8000, polling: 'raf' });
      held = await p.evaluate(() => { const e = document.querySelector('.cb-cutin'), q = e.getBoundingClientRect(), s = RB.harmonyCutin.state(); return { cw: e.width, ch: e.height, css: [+q.width.toFixed(2), +q.height.toFixed(2)], top: +q.top.toFixed(2), scale: s.scale, variant: s.variant, fit: s.fit, phase: s.phase, rect: s.rect, footprint: s.footprint, relaid: RB.harmonyCutin.stats().relaid, party: RB.harmonyCutin.protectedRects().filter((r) => r.id === 'party' || r.id === 'status').map((r) => [r.id, Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h)]) }; });
    } });
    const L = r.last;
    // the states shown, in order (consecutive frames merged), against the timeline's own order
    const seq = [];
    for (const x of L.trace) if (seq[seq.length - 1] !== x[4]) seq.push(x[4]);
    const SEGN = { in: 0, hold: 1, out: 2 };
    const order = inst.timeline.slice().sort((a, b) => (SEGN[a.seg] + a.from) - (SEGN[b.seg] + b.from)).map((e) => e.phase);
    const pos = seq.map((ph) => order.indexOf(ph));
    const src = await p.evaluate(([look, phs, variant]) => phs.map((ph) => RB.harmonyArt.compose({ comp: 'suzu', look: JSON.parse(look), phase: ph, variant }).painted), [r.look0, seq, L.variant]);
    const row = { view: tag, started: r.started, why: L && L.why, fit: L && L.fit, variant: L && L.variant, scale: L && L.scale, faceH: L && L.faceH, held, states: seq, timeline: order, painted: src, overlaps: r.frames.filter((f) => f.ov && f.state !== 'entering' && f.ov.length).length, checkedFrames: r.frames.filter((f) => f.ov).length, disposedAt: L ? markAt(L, 'disposed') : null, firstResult: firstResult(r) };
    rows.push(row);
    console.log('  ' + tag + ': ' + (L ? L.fit + ' ' + L.variant + ' ×' + L.scale + ', faces ' + L.faceH + ' px; states ' + seq.join(' → ') : 'none'));
    if (r.started !== 1 || !L || L.why !== 'done') { bad.push(tag + ': one cut-in, done ' + JSON.stringify({ started: r.started, why: L && L.why, fb: r.fallback && r.fallback.reason })); await ctx.close(); continue; }
    if (src.some((x) => !x || x.suzu !== 'painted' || x.pc !== 'painted')) bad.push(tag + ': every state shown is painted ' + JSON.stringify(src));
    if (v.reduce) { if (seq.length !== 1 || seq[0] !== order[order.length - 1]) bad.push(tag + ': reduced motion — the last state alone ' + JSON.stringify(seq)); }
    else {
      if (pos.some((k) => k < 0) || pos.some((k, i) => i && k < pos[i - 1])) bad.push(tag + ': the states in the timeline\'s order ' + JSON.stringify({ seq, order }));
      if (seq[0] !== order[0] || seq[seq.length - 1] !== order[order.length - 1] || new Set(seq).size < Math.min(4, new Set(order).size)) bad.push(tag + ': from the first state to the last, most of them seen ' + JSON.stringify({ seq, order }));
    }
    if (!held || held.cw !== inst.native[held.variant].w || held.ch !== inst.native[held.variant].h || Math.abs(held.css[0] - held.cw * held.scale) > 0.51 || Math.abs(held.css[1] - held.ch * held.scale) > 0.51) bad.push(tag + ': the canvas at the art\'s native size, shown at the placement\'s scale ' + JSON.stringify({ held, native: inst.native }));
    if (v.dpr && !(held && held.variant === 'compact' && Math.abs(held.scale * v.dpr - Math.round(held.scale * v.dpr)) < 1e-6)) bad.push(tag + ': the compact pair at whole device pixels per art pixel ' + JSON.stringify(held));
    if (row.overlaps) { const f = r.frames.find((f) => f.ov && f.state !== 'entering' && f.ov.length); bad.push(tag + ': ' + row.overlaps + ' frames within 12 px of a protected rectangle, e.g. ' + JSON.stringify({ ov: f.ov, vis: f.vis, pl: L.footprint })); }
    if (!(row.disposedAt < row.firstResult)) bad.push(tag + ': gone before the first result ' + JSON.stringify({ disposedAt: row.disposedAt, firstResult: row.firstResult }));
    if (errors.length) bad.push(tag + ': ' + errors.join('; '));
    await ctx.close();
  }
  report.painted = { note: 'SYNTHETIC sample (tests/fixtures/harmony_sample), not the game\'s art', rows };
  assert(!bad.length, bad.join('\n'));
});

// ---------------------------------------------------------------------------------------------------------
// Evidence (--docs): real-time captures of each pairing at Normal (1280×720), and frame sheets of each stage
// performance with the portrait Off (the presentation clock slowed ×0.25 so each sampled moment is exact).
if (toDocs) await test('evidence: a real-time WebM of each pairing at Normal (1280×720); frame sheets of each stage performance with the portrait Off', async () => {
  const dir = path.join(outDir, 'raw-video');
  fs.mkdirSync(dir, { recursive: true });
  const vids = {};
  for (const comp of COMPS) {
    const c2 = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
    const p = await c2.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(url);
    await p.waitForFunction(() => window.__RB_READY__ === true);
    await setup(p, { comp, knots: 6, pc: 8 });
    await wait(p, 600);
    const r = await technique(p, comp);
    await wait(p, 900);
    const video = p.video();
    await c2.close();
    const dst = path.join(docsDir, 'technique_' + comp + '_normal_1280x720.webm');
    fs.copyFileSync(await video.path(), dst);
    vids[comp] = { file: path.relative(root, dst), bytes: fs.statSync(dst).size, shown: r.started, fit: r.last && r.last.fit };
    assert(r.started === 1 && !errors.length, comp + ': recorded with its cut-in ' + errors.join('; '));
  }
  report.videos = vids;
  // frame sheets: the portrait Off, the clock at ×0.25, the party's region captured at fixed presentation times
  const sheets = {};
  for (const comp of COMPS) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
    await setup(p, { comp, knots: 6, flourish: false, timeScale: 0.25 });
    await clickCard(p, 'With ' + NAME[comp]);
    await answerRight(p);
    await companionPick(p, 'Join');
    await p.waitForFunction(() => RB.battleSeq.current() && RB.battleSeq.current().kind === 'player', null, { timeout: 8000, polling: 'raf' });
    const box = await p.evaluate(() => { const st = RB.battleStage.stats(), cp = st.cssPerArt, L = st.lay.party; return { x: Math.max(0, Math.round(L.x * cp - 20)), y: Math.max(0, Math.round(L.y * cp - 40)), width: Math.round(L.w * cp + 60), height: Math.round(L.h * cp + 50) }; });
    const T = await p.evaluate((c) => RB.partyChoreo.TECH[c], comp);
    const times = [0, 300, T.pAt + T.pAnt * 0.6, T.pAt + T.pAnt, T.pAt + T.pAnt + T.pAct * 0.2, T.pAt + T.pAnt + T.pAct * 0.35, T.pAt + T.pAnt + T.pAct * 0.5, T.pAt + T.pAnt + T.pAct * 0.62, T.pAt + T.pAnt + T.pAct, T.contact + 100, T.rec + 60 + T.recD * 0.5, T.end - 20].map(Math.round);
    const shots = [];
    for (const tt of times) {
      await p.waitForFunction((tt) => { const c = RB.battleSeq.current(); return !c || c.t >= tt; }, tt, { timeout: 20000, polling: 'raf' });
      const at = await p.evaluate(() => (RB.battleSeq.current() || {}).t);
      shots.push({ label: (at == null ? 'end' : at + ' ms'), png: await p.screenshot({ clip: box }) });
    }
    const out = await p.evaluate(async ([urls, labels]) => {
      const imgs = await Promise.all(urls.map((u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; })));
      const w = imgs[0].width, h = imgs[0].height, cols = 6, lab = 20, gap = 4, rows = Math.ceil(imgs.length / cols);
      const cv = document.createElement('canvas'); cv.width = cols * (w + gap) + gap; cv.height = rows * (h + lab + gap) + gap;
      const g = cv.getContext('2d'); g.fillStyle = '#1c1a26'; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
      imgs.forEach((im, i) => { const x = gap + (i % cols) * (w + gap), y = gap + Math.floor(i / cols) * (h + lab + gap); g.drawImage(im, x, y); g.fillStyle = '#efe4c8'; g.font = '600 13px system-ui, sans-serif'; g.fillText(labels[i], x + 4, y + h + 15); });
      return cv.toDataURL('image/webp', 0.88);
    }, [shots.map((s) => 'data:image/png;base64,' + s.png.toString('base64')), shots.map((s) => s.label)]);
    const dst = path.join(docsDir, 'stage_' + comp + '_portrait_off.webp');
    fs.writeFileSync(dst, Buffer.from(out.split(',')[1], 'base64'));
    sheets[comp] = { file: path.relative(root, dst), bytes: fs.statSync(dst).size, times };
    await p.evaluate(() => RB.battleSeq.setTimeScale(4));
    await settle(p);
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
  report.sheets = sheets;
});

const rp = path.join(outDir, 'report.json');
fs.writeFileSync(rp, JSON.stringify(report, null, 1));
if (toDocs) {
  // the measured record kept with the evidence (timelines, placements, geometry, cleanup)
  const keep = { when: report.when, browser: report.browser, cost: Object.fromEntries(COMPS.map((c) => [c, report['cost_' + c]])), setting: report.setting, core: report.core, geometry: report.geometry, plan: report.plan, frozen: report.frozen, life: report.life, cycles: report.cycles, devViewer: report.devViewer, painted: report.painted, never: report.never, videos: report.videos, sheets: report.sheets, timelines: Object.fromEntries(COMPS.map((c) => [c, report['timeline_' + c]])) };
  fs.writeFileSync(path.join(docsDir, 'cutin_results.json'), JSON.stringify(keep, null, 1));
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
