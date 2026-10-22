// RBN-QA-127 (Agnes 6347939181, 6348214241; Local CL-222; Cloud CC-129 §6): the yukata walk opens on the vow's own
// valley shot (the bridge, both lit houses, the crowd in yukata) and holds it through the confession and the choice;
// yn.end carries the same sequence on and ends it. In Chromium on the built game, with throwaway journeys, coming out of
// the hall into the upper town after the mediation as a player does:
//  1. every companion with each reply, and no companion: "That evening…" is shown over the valley; every line of the
//     walk, the confession, the choice and the reply is shown over it, and the vow's lines over the valley and then the
//     ridge, one sequence throughout (begun once, the same instance, carried on once, ended once by yn.end and never
//     replaced); then yn_hand or yn_side as answered (neither with no companion), the yn:walk bond once, the chapter's
//     end (yn_done), the sequence's record once;
//  2. Skip: Escape asks first and Keep watching keeps the line and the picture; a confirmed Skip scene stops at the
//     choice with the valley still up, nothing chosen, nothing of the reply or the vow given; then it plays on as before;
//  3. reduced motion: every shot shown is at its end state at once, the walk as in 1;
//  4. a journey loaded mid-walk (saved before it): nothing left on screen or running, nothing of the walk kept; coming
//     out again plays the walk from its first line over the valley, once;
//  5. yn.end on its own (nothing on screen): it begins its sequence itself, on the valley, as before; the Records page
//     reads its beats from yn.end alone (the walk is not part of it);
//  6. the Records replay after the walk: read only (the journey unchanged, no second reward), the vow's lines, not
//     the walk's;
//  7. no page errors.
// RB_CAPS=<dir> also saves stills of the first line and the choice (for the owner; never committed).
// Usage: node tools/build.mjs && node tests/e2e/yukata_walk_shot.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const CAPS = process.env.RB_CAPS || null;
if (CAPS) fs.mkdirSync(CAPS, { recursive: true });
const BASE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true,
  yn_called: true, yn_arrived: true, yn_kami_seen: true, yn_shimo_seen: true, yn_lower_seen: true, yn_rooms_done: true, yn_kettle_settled: true, yn_evening: true, yn_eve_started: true, yn_eve_done: true, yn_mediated: true };
const FIRST = /^That evening the whole valley is out in yukata/, VOW = /^Every lantern in the valley is lit/, RIDGE = /^Above the north ridge/;
const errorsAll = [];

async function start(p, o) {
  await p.evaluate(([o, BASE]) => {
    const s = RB.game.debugStart('yn.guild', 7, 6, { dir: 'down', edition: RB.edition.forNew(), comp: o.comp || undefined, flags: Object.assign({}, BASE, o.flags || {}) });
    if (!o.comp) s.comp = null;
    // every other arrival scene already played: coming out of the hall plays the walk, as it does after the mediation
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) if (ev.scene !== 'yn.walk') s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = true;
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.save.autosave = async () => {};
    window.__ev = []; window.__bond = [];
    if (!window.__busOn) {
      window.__busOn = true;
      RB.bus.on('sequence:begin', (e) => window.__ev.push(['begin', e.id, e.tok]));
      RB.bus.on('sequence:end', (e) => window.__ev.push(['end', e.id, e.tok, e.why || (e.skipped ? 'skipped' : 'ended')]));
      RB.bus.on('company:bond', (e) => window.__bond.push(e.id));
    }
  }, [o, BASE]);
  await p.waitForTimeout(400);
}
// (through the game's own transition: a map's enter events run there, never in RB.world.enter; not awaited, as the
// transition leaves the walk running when it returns)
const comeOut = (p) => p.evaluate(() => { window.__st0 = Object.assign({}, RB.sequence.stats()); RB.game.transition('yn.upper', 10, 12, 'down'); });
const S = (p) => p.evaluate(() => {
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
  return { seq: RB.sequence.state(), n: RB.game.s.backlog.length, en: d ? String(d.en || '') : null, who: d ? d.who || '' : null,
    ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((c) => c.textContent.trim()), confirm: !!document.querySelector('.csheet'),
    card: !!document.querySelector('.banner-layer'), run: RB.script.isRunning(), ended: window.__ev.some((e) => e[0] === 'end' && e[1] === 'yn.end') };
});
const settled = (p) => p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state !== 'entering'; }, null, { timeout: 5000 }).catch(() => {});
const cap = async (p, name) => { if (CAPS) await p.screenshot({ path: path.join(CAPS, name + '.png') }); };
// play from here to the end of yn.end: Next on each line (after any dissolve), the reply by `pick` (0 hand, 1 side);
// returns every line shown with the sequence on screen at it, and the choice as it was put up
async function walk(p, pick, o) {
  o = o || {};
  const lines = [];
  let choice = null, lastN = -1;
  for (let i = 0; i < 500; i++) {
    const s = await S(p);
    if (s.ended && !s.run) break;
    if (s.ended && !s.en && !s.ch.length) { await p.waitForTimeout(120); continue; }
    if (s.confirm) { await p.locator('.csheet button', { hasText: 'Keep watching' }).click(); continue; }
    if (s.ch.length) {
      if (!choice) { choice = { opts: s.ch, seq: s.seq && { id: s.seq.id, shot: s.seq.shot, tok: s.seq.tok } }; if (o.capName) await cap(p, o.capName + '_choice'); }
      if (o.stopAtChoice) return { lines, choice };
      await p.locator('.choices:not(.hidden) .choice').nth(pick || 0).click(); await p.waitForTimeout(150);
      continue;
    }
    if (s.card) { await p.locator('.banner-layer').click().catch(() => {}); await p.waitForTimeout(600); continue; }
    if (s.en != null) {
      if (s.n !== lastN) {
        lastN = s.n;
        await settled(p);
        const t = await S(p);
        lines.push({ who: t.who, en: t.en.slice(0, 60), seq: t.seq && { id: t.seq.id, shot: t.seq.shot, phase: t.seq.phase, tok: t.seq.tok, state: t.seq.state, k: t.seq.k } });
        if (lines.length === 1 && o.capName) await cap(p, o.capName + '_first');
        if (o.until && o.until.test(t.en)) return { lines, choice };
      }
      await p.locator('#ui .dlg .b-next').click({ timeout: 3000 }).catch(() => {});
      await p.waitForTimeout(60);
      continue;
    }
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(400);
  return { lines, choice };
}
const after = (p) => p.evaluate(() => {
  const s = RB.game.s, st = RB.sequence.stats(), s0 = window.__st0 || {};
  return { done: !!s.flags.yn_done, hand: !!s.flags.yn_hand, side: !!s.flags.yn_side, bond: window.__bond.filter((x) => x === 'yn:walk').length, bondKept: (s.company && s.company.bond || {})['yn:walk'] != null,
    rec: s.seq && s.seq['yn.end'] ? s.seq['yn.end'].n : null, ev: window.__ev.slice(), live: RB.sequence.active(), d: { begun: st.begun - s0.begun, carried: st.carried - s0.carried, ended: st.ended - s0.ended, disposed: st.disposed - s0.disposed } };
});
// one sequence from the first line to the last: yn.end, one instance; the shots in order
function oneSequence(lines) {
  const toks = new Set(lines.map((l) => l.seq && l.seq.tok));
  return lines.length && lines.every((l) => l.seq && l.seq.id === 'yn.end') && toks.size === 1;
}
const shotsOf = (lines) => lines.map((l) => l.seq ? l.seq.shot : '-');

// ---- 1. every companion with each reply, and no companion --------------------------------------------------------------------
for (const [comp, pick] of [['nao', 0], ['nao', 1], ['mio', 0], ['mio', 1], ['ren', 0], ['ren', 1], ['suzu', 0], ['suzu', 1], [null, 0]]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, { comp });
  await comeOut(p);
  const capName = CAPS && (comp === 'suzu' || !comp) && pick === 0 ? 'walk_' + (comp || 'none') + '_1280' : null;
  const r = await walk(p, pick, { capName });
  const a = await after(p);
  const tag = (comp || 'no companion') + (comp ? (pick ? ', side by side' : ', hand') : '');
  const want = comp ? 8 : 3;
  const vow = r.lines.findIndex((l) => VOW.test(l.en)), ridge = r.lines.findIndex((l) => RIDGE.test(l.en));
  const walkShots = shotsOf(r.lines.slice(0, vow + 1));
  ok(r.lines.length === want && FIRST.test(r.lines[0].en) && r.lines[0].seq && r.lines[0].seq.id === 'yn.end' && r.lines[0].seq.shot === 'valley' && oneSequence(r.lines)
    && walkShots.every((x) => x === 'valley') && ridge === vow + 1 && shotsOf(r.lines.slice(ridge)).every((x) => x === 'ridge'),
    tag + ': "That evening…" over the valley; the walk' + (comp ? ', the confession, the choice and the reply' : '') + ' over it; the vow over the valley then the ridge; one sequence (' + JSON.stringify(r.lines.map((l) => [l.who, l.en.slice(0, 18), l.seq && l.seq.shot, l.seq && l.seq.tok])) + ')');
  if (comp) ok(r.choice && r.choice.opts.length === 2 && r.choice.seq && r.choice.seq.id === 'yn.end' && r.choice.seq.shot === 'valley' && r.choice.seq.tok === r.lines[0].seq.tok, tag + ': the choice is put up over the valley, the same sequence (' + JSON.stringify(r.choice) + ')');
  else ok(!r.choice, tag + ': no choice');
  const begins = a.ev.filter((e) => e[0] === 'begin'), ends = a.ev.filter((e) => e[0] === 'end');
  ok(begins.length === 1 && begins[0][1] === 'yn.end' && ends.length === 1 && ends[0][1] === 'yn.end' && ends[0][2] === begins[0][2] && ends[0][3] === 'ended' && a.d.begun === 1 && a.d.carried === 1 && a.d.ended === 1 && !a.live,
    tag + ': begun once, carried on once by yn.end, ended once by it, never replaced (' + JSON.stringify({ ev: a.ev, d: a.d }) + ')');
  ok(a.done && a.rec === 1 && (comp ? (pick ? a.side && !a.hand : a.hand && !a.side) : !a.hand && !a.side) && (comp ? a.bond === 1 && a.bondKept : a.bond === 0),
    tag + ': ' + (comp ? (pick ? 'yn_side' : 'yn_hand') + ', the yn:walk bond once, ' : 'no reply flag, no bond, ') + 'the chapter\'s end, the sequence recorded once (' + JSON.stringify({ done: a.done, hand: a.hand, side: a.side, bond: a.bond, rec: a.rec }) + ')');
  if (comp === 'suzu' && pick === 0) {
    // 6. the Records replay after the walk: read only, the vow's lines
    const before = await p.evaluate(() => { const s = JSON.parse(JSON.stringify(RB.game.s)); delete s.playtime; return JSON.stringify(s); });
    await p.evaluate(() => { RB.ui.menu.open('volume'); });
    await p.waitForSelector('[data-a="watch"][data-page="yn.end"]', { timeout: 8000 }).catch(() => {});
    const can = await p.evaluate(() => !!document.querySelector('[data-a="watch"][data-page="yn.end"]'));
    let seen = [], during = null;
    if (can) {
      await p.click('[data-a="watch"][data-page="yn.end"]');
      await p.waitForSelector('.seq-view', { timeout: 8000 }).catch(() => {});
      for (let k = 0; k < 6; k++) {
        const t = await p.evaluate(() => { const v = document.querySelector('.seq-view'); return v ? v.textContent.replace(/\s+/g, ' ').slice(0, 400) : null; });
        if (t) seen.push(t);
        if (!during) during = await p.evaluate(() => ({ live: RB.sequence.stats().live, view: RB.sequence.stats().view }));
        await p.evaluate(() => { const n = document.querySelector('.seq-view [data-a="next"]'); if (n) n.click(); });
        await p.waitForTimeout(500);
      }
      await p.evaluate(() => { const c = document.querySelector('.seq-view [data-a="skip"]'); if (c) c.click(); });
      await p.waitForFunction(() => !document.querySelector('.seq-view'), null, { timeout: 8000 }).catch(() => {});
    }
    await p.evaluate(() => { if (RB.ui.menu.isOpen && RB.ui.menu.isOpen()) RB.ui.menu.close(); });
    const after2 = await p.evaluate(() => { const s = JSON.parse(JSON.stringify(RB.game.s)); delete s.playtime; return JSON.stringify(s); });
    const all = seen.join(' | ');
    ok(can && during && during.view === 1 && during.live === 0 && /Every lantern in the valley/.test(all) && !/That evening the whole valley/.test(all) && after2 === before && (await p.evaluate(() => window.__bond.filter((x) => x === 'yn:walk').length)) === 1,
      'the Records replay after the walk: the vow\'s lines (not the walk\'s), read only: the journey unchanged, no second reward (' + JSON.stringify({ can, during, same: after2 === before, first: (seen[0] || '').slice(0, 120) }) + ')');
  }
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2. Skip: asks first; Keep watching keeps the line; a confirmed skip stops at the choice -------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, { comp: 'ren' });
  await comeOut(p);
  await p.waitForFunction(() => !!document.querySelector('#ui > .dlg:not(.hidden) .seq-ctrl'), null, { timeout: 10000 }).catch(() => {});
  await settled(p);
  const live = await S(p);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const asked = (await S(p)).confirm;
  await p.locator('.csheet button', { hasText: 'Keep watching' }).click().catch(() => {}); await p.waitForTimeout(150);
  const k = await S(p);
  ok(FIRST.test(live.en) && asked && !k.confirm && k.n === live.n && k.en === live.en && k.seq && k.seq.tok === live.seq.tok && k.seq.shot === 'valley',
    'Escape asks first; Keep watching keeps the line and the valley (' + JSON.stringify({ asked, en: k.en && k.en.slice(0, 30), shot: k.seq && k.seq.shot }) + ')');
  await p.locator('#ui .dlg .b-sskip').click(); await p.waitForTimeout(150);
  await p.locator('.csheet button', { hasText: 'Skip scene' }).click();
  await p.waitForFunction(() => !!document.querySelector('.choices:not(.hidden) .choice'), null, { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(600);
  const c = await p.evaluate(() => ({ seq: RB.sequence.state(), hand: !!RB.game.s.flags.yn_hand, side: !!RB.game.s.flags.yn_side, done: !!RB.game.s.flags.yn_done, bond: window.__bond.filter((x) => x === 'yn:walk').length, ch: document.querySelectorAll('.choices:not(.hidden) .choice').length, confess: RB.game.s.backlog.some((l) => /lamp that went out/.test(l.en || '')) }));
  ok(c.ch === 2 && c.seq && c.seq.id === 'yn.end' && c.seq.shot === 'valley' && c.seq.tok === live.seq.tok && !c.seq.skip && c.confess && !c.hand && !c.side && !c.done && !c.bond,
    'a confirmed Skip scene stops at the choice over the valley (the same sequence), nothing chosen, nothing of the reply or the vow given (' + JSON.stringify(c) + ')');
  const r = await walk(p, 1);
  const a = await after(p);
  ok(a.side && !a.hand && a.done && a.bond === 1 && a.rec === 1 && a.ev.filter((e) => e[0] === 'begin').length === 1 && a.ev.filter((e) => e[0] === 'end').length === 1 && r.lines.every((l) => l.seq && l.seq.tok === live.seq.tok),
    'then it plays on as before: the reply, the vow, the chapter\'s end, one sequence (' + JSON.stringify({ d: a.d, ev: a.ev }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 3. reduced motion ------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, { comp: 'mio', reduce: true });
  await p.evaluate(() => {
    window.__bad = [];
    const tick = () => { const s = RB.sequence.state(); if (s && (s.state === 'presenting' || s.state === 'holding') && !(s.state === 'holding' && s.k === 1) && window.__bad.length < 5) window.__bad.push(s.shot + '/' + s.state + '/' + s.k); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await comeOut(p);
  const r = await walk(p, 0);
  const a = await after(p);
  const bad = await p.evaluate(() => window.__bad);
  ok(r.lines.length === 8 && FIRST.test(r.lines[0].en) && r.lines[0].seq.shot === 'valley' && r.lines.every((l) => l.seq && l.seq.k === 1) && !bad.length && oneSequence(r.lines) && a.hand && a.done && a.bond === 1,
    'reduced motion: every shot at its end state at once; the walk as before, one sequence (' + JSON.stringify({ bad, k: r.lines.map((l) => l.seq && l.seq.k) }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 4. a journey loaded mid-walk --------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 } });
  await start(p, { comp: 'suzu' });
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  await comeOut(p);
  const r = await walk(p, 0, { until: /^In the crowd, your hands brush once/, capName: CAPS ? 'walk_suzu_390' : null });
  const mid = await S(p);
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(1, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await p.waitForTimeout(1200);
  const g = await p.evaluate(() => ({ seq: RB.sequence.state(), live: RB.sequence.active(), ctrl: !!document.querySelector('.seq-ctrl'), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), map: RB.world.W.map.id,
    hand: !!RB.game.s.flags.yn_hand, side: !!RB.game.s.flags.yn_side, done: !!RB.game.s.flags.yn_done, bond: (RB.game.s.company && RB.game.s.company.bond || {})['yn:walk'] != null, rec: !!(RB.game.s.seq && RB.game.s.seq['yn.end']), walked: !!RB.game.s.flags['enter:yn.upper:yn.walk'], ev: window.__ev.slice() }));
  ok(r.lines.length >= 3 && mid.seq && mid.seq.shot === 'valley' && ld === 'loaded' && !g.seq && !g.live && !g.ctrl && !g.run && !g.dlg && g.map === 'yn.guild' && !g.hand && !g.side && !g.done && !g.bond && !g.rec && !g.walked
    && g.ev.some((e) => e[0] === 'end' && e[1] === 'yn.end' && e[3] === 'campaign'),
    'a journey loaded mid-walk (at the hands brushing): nothing left on screen or running, nothing of the walk kept (' + JSON.stringify({ ld, lines: r.lines.length, g }) + ')');
  await p.evaluate(() => { RB.save.autosave = async () => {}; window.__ev = []; window.__bond = []; });
  await comeOut(p);
  const r2 = await walk(p, 1);
  const a = await after(p);
  ok(r2.lines.length === 8 && FIRST.test(r2.lines[0].en) && r2.lines[0].seq && r2.lines[0].seq.shot === 'valley' && oneSequence(r2.lines) && a.d.begun === 1 && a.side && a.done && a.bond === 1,
    'coming out again plays the walk from "That evening…" over the valley, once (' + JSON.stringify({ n: r2.lines.length, d: a.d }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 5. yn.end on its own; the Records page's beats ---------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, { comp: 'nao' });
  await p.evaluate(() => { RB.world.enter('yn.upper', 10, 12, 'down', {}); RB.game.s.flags['enter:yn.upper:yn.walk'] = true; });
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.__ev = []; window.__st0 = Object.assign({}, RB.sequence.stats()); RB.script.run('yn.end'); });
  const r = await walk(p, 0);
  const a = await after(p);
  const pg = await p.evaluate(() => RB.volume.beats('yn.end', (c) => RB.state.test(RB.game.s, c), RB.game.s.comp).map((x) => [x.shot, x.line.sceneId, x.line.en.slice(0, 30)]));
  ok(r.lines.length === 3 && VOW.test(r.lines[0].en) && r.lines[0].seq && r.lines[0].seq.shot === 'valley' && oneSequence(r.lines) && a.d.begun === 1 && a.d.carried === 0 && a.d.ended === 1 && a.done,
    'yn.end on its own, nothing on screen: it begins its sequence itself, on the valley, as before (' + JSON.stringify({ lines: r.lines.map((l) => [l.en.slice(0, 20), l.seq && l.seq.shot]), d: a.d }) + ')');
  ok(pg.length === 3 && pg.every((x) => x[1] === 'yn.end') && pg[0][0] === 'valley' && /^Every lantern/.test(pg[0][2]), 'the Records page reads yn.end\'s own beats, from the valley (' + JSON.stringify(pg) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
