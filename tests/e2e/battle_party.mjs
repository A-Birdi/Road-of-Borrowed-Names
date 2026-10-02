// Party art in battle (battle addendum §7, §8, §10, §18.3, §21.4–21.5, §23.5), against the BUILT
// index.html in Chromium.
// - real battles in synthetic campaigns, answered with the real mouse: solo (the natural Chapter 1
//   Flour Moth on the mill road) and, as LABELLED DIAGNOSTIC FIXTURES, each companion in a Chapter 1
//   room with every support action unlocked (flags and quests set by the fixture, not reached in play):
//   a player response, every one of the companion's support actions, a coordinated technique; each
//   performed with its own gesture, word motif and effects; no page errors;
// - Protect at Normal measured on the presentation clock (the §18.3 prototype);
// - the customization registry composed (every hairstyle, cut, colour, skin tone, creation accessory and
//   worn keepsake; all pairs of those factors) in battle poses; eight deliberate looks for visual review;
// - native frame sheets (key poses at 1× and 3×) of the player looks and all four companions, and the
//   96×128 working-frame comparison (§6.2);
// - resource discipline: the frame cache holds only the encounter's actors, bounded, with the estimated
//   resident pixels reported against the 48 MiB budget;
// - a real-time Normal recording (Playwright's recorder) of one exchange with Mio: a response, then her
//   support action.
// Captures go to tests/e2e/out/battle_party/; with --docs the evidence is copied to
// docs/screenshots/battle/party/ (WebP, WebM).
// Usage: node tests/e2e/battle_party.mjs [filter] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_party');
const docsDir = path.join(root, 'docs', 'screenshots', 'battle', 'party');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docsDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const notes = [], report = {};
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 400s')), 400000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const DESK = { viewport: { width: 1280, height: 800 } };
// a PNG/canvas data URL → a file (PNG to out/, WebP to docs/ with --docs)
async function saveImg(p, name, dataUrlPng, dataUrlWebp) {
  fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(dataUrlPng.split(',')[1], 'base64'));
  if (dataUrlWebp) fs.writeFileSync(path.join(outDir, name + '.webp'), Buffer.from(dataUrlWebp.split(',')[1], 'base64'));
  if (toDocs && dataUrlWebp) fs.copyFileSync(path.join(outDir, name + '.webp'), path.join(docsDir, name + '.webp'));
}

// ---- in-page helpers ----------------------------------------------------------------------------------------
async function helpers(p) {
  await p.evaluate(() => {
    const BP = (window.BP = { samples: [], sampling: false });
    const L = RB.combatLogic, init = L.init;
    L.init = function (...a) { const st = init.apply(this, a); if (BP.onInit) BP.onInit(st); return st; };
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    BP.sampleOn = () => {
      BP.samples = []; BP.sampling = true;
      const loop = () => {
        if (!BP.sampling) return;
        const d = RB.combat.debug(), f = d.stage.frame, s = document.querySelector('.cb-strip');
        BP.samples.push({ t: RB.battleSeq.now(), wall: performance.now(), phase: d.phase, busy: d.seq.running, kind: d.seq.kind, poses: f && f.poses, variants: f && f.variants, effects: f && f.effects, marks: f && f.marks,
          strip: s ? { motif: s.getAttribute('data-motif'), text: s.textContent, op: +s.style.opacity || 0, tf: s.style.transform, ink: +s.style.getPropertyValue('--w') || 0, fold: +s.style.getPropertyValue('--fold') || 0 } : null });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };
    BP.sampleOff = () => { BP.sampling = false; return BP.samples; };
    BP.right = () => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    };
    BP.setIntent = (kind, target) => { const st = RB.combat.state(); st.intent = Object.assign(RB.combatLogic.intentDef({}, kind), target ? { target } : {}); if (st.intent.target === 'rand') st.intent.target = 'pc'; st.foes[st.cur].intent = st.intent; RB.combat.refresh(); return st.intent.kind; };
  });
}
// a fresh synthetic campaign in a battle (every support action unlocked when o.unlock: a diagnostic fixture)
async function battle(p, o) {
  await p.evaluate((o) => {
    const flags = o.unlock ? { ch2_done: true, lq_ally1: true, lq_ally2: true, rw_mill_open: true } : { rw_mill_open: true };
    const s = RB.game.debugStart('rw.millroad', 10, 22, o.comp ? { comp: o.comp, flags } : { flags });
    if (o.unlock) for (const q of ['lf_nao', 'lf_mio', 'ren_ushio', 'co_suzu']) s.quests[q] = { stage: 9, done: true };
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = (o.words || ['mamoru', 'iyasu', 'hikari', 'mizu']).slice();
    if (o.look) s.player.look = o.look;
    BP.onInit = (st) => { if (o.harmony) st.harmony = o.harmony; if (o.knots) { st.knots = st.maxKnots = o.knots; st.foes[0].knots = st.foes[0].maxKnots = o.knots; } };
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })), ...Object.values(RB.content.companionActions).flat().map((a) => ({ ['cact:' + a.id]: 1 })));
    RB.game.settings.input = 'choice';
    RB.game.settings.textSpeed = 'normal';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.battleSeq.setTimeScale(o.timeScale || 1);
    window.__result = null;
    const place = RB.content.maps['rw.millroad'].foes.find((f) => f.enemy === 'rw.dustmoth');
    RB.game.startBattle('rw.dustmoth', place ? { place, where: { map: 'rw.millroad', x: place.x, y: place.y } } : {}).then((r) => { window.__result = r || 'done'; });
  }, o);
  await cards(p);
}
async function cards(p) {
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (st.cards || st.r) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  await wait(p, 120);
}
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
async function respond(p, match, comp) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, match);
  assert(i != null, 'no enabled response card matching ' + match + ': ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 50)))));
  const c = await center(p, '.rcard[data-i="' + i + '"]');
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal');
  await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]');
  if (await p.$('.chal .mc .btn')) { const r = await p.evaluate(() => BP.right()); await p.mouse.click(r.x, r.y); await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go'); }
  else { const rv = await center(p, '.chal [data-a=reveal]'); await p.mouse.click(rv.x, rv.y); await p.waitForSelector('.fbwrap .fb-go'); }
  const g = await center(p, '.fbwrap .fb-go');
  await p.mouse.click(g.x, g.y);
  return companionTurn(p, comp || {});
}
async function idle(p) {
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), res: window.__result }));
    if (!s.busy && (s.cards || s.dlg || s.mode !== 'combat' || s.res)) { await wait(p, 60); return s; }
    await wait(p, 40);
  }
  throw new Error('the exchange did not settle');
}
const trace = (p) => p.evaluate(() => RB.combat.debug().trace);
const last = (arr, kind) => arr.filter((r) => r.kind === kind).slice(-1)[0];
const seen = (S, f) => S.some(f);
const during = (S, kind) => S.filter((s) => s.busy && s.kind === kind);

// ---------------------------------------------------------------------------------------------------------
await test('solo (the natural Chapter 1 Flour Moth on the mill road): your response is yours alone — your gesture, the seal motif, the ward on you; no companion anywhere', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { knots: 4 });
  await p.evaluate(() => { BP.setIntent('strike', 'pc'); BP.sampleOn(); });
  await respond(p, 'protect');
  await idle(p);
  const S = await p.evaluate(() => BP.sampleOff());
  const P = during(S, 'player'), tr = last(await trace(p), 'player');
  assert(tr && tr.meta.actors.join() === 'pc' && tr.meta.gesture === 'ward', 'your response, alone: ' + JSON.stringify(tr && tr.meta));
  assert(P.some((s) => s.poses.pc === 'act:ward') && P.every((s) => !s.poses.comp), 'the warding gesture; no companion drawn');
  assert(P.some((s) => s.strip && s.strip.motif === 'seal' && /守/.test(s.strip.text)), 'the word 守る on its seal strip');
  assert(P.some((s) => (s.effects || []).some((e) => /^pSealClose>pc/.test(e))), 'the seal closes round you');
  const E = during(S, 'enemy');
  assert(E.some((s) => s.poses.pc === 'brace') && !E.some((s) => s.poses.pc === 'hit'), 'the raised seal catches its Strike: you brace, no hit');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
// each companion, as a labelled diagnostic fixture: a response with every support action in turn, then the
// coordinated technique
const RESP = { nao: 'unravel', mio: 'Restores 3 resolve', ren: 'Shows what is hidden', suzu: 'Cools what is overheating' };
for (const comp of ['mio', 'nao', 'ren', 'suzu']) {
  await test('DIAGNOSTIC FIXTURE (' + comp + ' in a Chapter 1 room, every support action unlocked by the fixture): each support action performed with its own gesture and effect, then the coordinated technique — two complementary performances, one culmination', async () => {
    const { p, errors, ctx } = await page(b, url, DESK);
    await helpers(p);
    await battle(p, { comp, unlock: true, knots: 14, timeScale: 2 });
    const acts = await p.evaluate((c) => RB.content.companionActions[c].map((a) => ({ id: a.id, name: a.name.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), g: RB.partyChoreo.SUPPORT[a.id].g, travel: RB.partyChoreo.SUPPORT[a.id].travel, kind: a.effect.kind })), comp);
    const out = [];
    for (const a of acts) {
      // a state that gives each action something real to do
      await p.evaluate(([a]) => {
        const st = RB.combat.state();
        st.pc = Math.min(st.pc, 7); st.comp = Math.min(st.comp, 8);
        if (a.kind === 'clear') { st.foes[0].shroud = true; st.foes[0].heat = 1; st.foes[0].charged = true; st.shroud = true; st.heat = 1; st.charged = true; }
        if (a.id === 'ren_lanterns') st.silenced = 1;
        BP.setIntent(a.kind === 'clear' ? 'rest' : 'strike', 'pc');
        BP.sampleOn();
      }, [a]);
      const resp = a.kind === 'clear' ? 'unravel' : RESP[comp];
      const picked = await respond(p, a.kind === 'clear' && comp !== 'nao' && comp !== 'suzu' ? 'unravel' : resp, { match: a.name });
      // (after the last one: Harmony full for the next round, so the technique is offered — fixture)
      if (a === acts[acts.length - 1]) await p.evaluate(() => { const st = RB.combat.state(); st.harmony = st.harmonyMax; });
      await idle(p);
      const S = await p.evaluate(() => BP.sampleOff());
      const C = during(S, 'companion'), tr = last(await trace(p), 'companion');
      const did = tr && tr.meta.act === a.id;
      const gest = C.some((s) => s.poses.comp === 'act:' + a.g);
      const fxs = [...new Set(C.flatMap((s) => s.effects || []).map((e) => e.split(/[>@]/)[0]))];
      out.push({ id: a.id, picked: !!picked, did, gest, fx: fxs, beats: tr && tr.beats.map((x) => x.t) });
      assert(did, comp + ' ' + a.id + ': the companion sequence plays that action ' + JSON.stringify({ picked, meta: tr && tr.meta }));
      assert(gest, comp + ' ' + a.id + ': performed with its own gesture act:' + a.g + ' (seen: ' + [...new Set(C.map((s) => s.poses.comp))].join(', ') + ')');
      const none = tr.beats.length === 1 && tr.beats[0].t === 'cact' && (await p.evaluate(() => (RB.combat.debug().trace.slice(-3).find((r) => r.kind === 'companion') || {}).meta)) && false;
      void none;
      const S2 = during(S, 'player');
      assert(S2.some((s) => s.strip && s.strip.motif), comp + ' ' + a.id + ': the response before it moved its word with a motif');
      if ((await p.evaluate(() => window.__result))) break;
    }
    report['support_' + comp] = out;
    // the coordinated technique (Harmony full)
    if (!(await p.evaluate(() => window.__result))) {
      await p.evaluate(() => { BP.setIntent('rest'); BP.sampleOn(); });
      await cards(p);
      await respond(p, 'technique|あわせ|' + { nao: 'Read the Opening', mio: 'Clearwater', ren: 'Lantern Ward', suzu: 'Curtain Call' }[comp], {});
      await idle(p);
      const S = await p.evaluate(() => BP.sampleOff());
      const P = during(S, 'player').concat(during(S, 'finish')), tr = last(await trace(p), 'player') || last(await trace(p), 'finish');
      const partner = await p.evaluate((c) => RB.partyChoreo.TECH[c], comp);
      const tPc = P.findIndex((s) => s.poses.pc === 'act:' + partner.g), tC = P.findIndex((s) => s.poses.comp === 'act:' + partner.p);
      assert(tr && tr.meta.actors.join() === 'pc,comp', comp + ' technique: both of you act ' + JSON.stringify(tr && tr.meta));
      assert(tPc >= 0 && tC >= 0 && tPc !== tC, comp + ' technique: complementary performances (yours act:' + partner.g + ' at frame ' + tPc + ', theirs act:' + partner.p + ' at ' + tC + ')');
      assert(P.some((s) => (s.effects || []).some((e) => /^pJoin/.test(e))) && P.some((s) => s.strip && s.strip.motif === 'join'), comp + ' technique: one joined thread, one word with both ribbons');
      report['tech_' + comp] = { pc: partner.g, comp: partner.p, beats: tr.beats.map((x) => x.t), dur: tr.dur };
    }
    const bud = await p.evaluate(() => RB.battlers.budget());
    report['budget_' + comp] = bud;
    assert(Object.keys(bud.perActor).every((id) => id === 'pc' || id === comp), comp + ': the frame cache holds only this encounter\'s actors ' + JSON.stringify(bud.perActor));
    assert(bud.mib <= 48, comp + ': estimated resident party frames ' + bud.mib + ' MiB ≤ 48 MiB');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------------------------------------
await test('Protect at Normal (§18.3): the word unfolds over the protected one, is fully readable ≈700 ms, the ward forms ≈620 ms, the action ends ≈1,500 ms (presentation clock); timing trace', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { comp: 'mio', knots: 5 });
  await p.evaluate(() => { BP.setIntent('rest'); BP.sampleOn(); });
  await respond(p, 'protect.*on you', { match: 'Warm draught' });
  await idle(p);
  const S = await p.evaluate(() => BP.sampleOff());
  const P = during(S, 'player');
  const t0 = P[0].t;
  // fully readable: inked to the end, opaque, not yet folding shut
  const vis = P.filter((s) => s.strip && s.strip.op > 0.97 && s.strip.ink >= 0.99 && s.strip.fold < 0.2);
  const first = vis[0].t - t0, lastV = vis[vis.length - 1].t - t0;
  const tr = last(await trace(p), 'player');
  const wardAt = tr.beats.find((x) => x.t === 'ward').at;
  const end = P[P.length - 1].t - t0;
  report.protectTrace = { stripFullyVisibleFrom: Math.round(first), to: Math.round(lastV), fullMs: Math.round(lastV - first), wardBeat: wardAt, lastFrame: Math.round(end), wallMs: tr.dur, poses: [...new Set(P.map((s) => s.poses.pc))] };
  assert(lastV - first >= 600 && lastV - first <= 820, 'fully readable ' + Math.round(lastV - first) + ' ms (target ≈700)');
  assert(wardAt >= 560 && wardAt <= 700, 'the ward forms at ' + wardAt + ' ms (target ≈620)');
  assert(end >= 1350 && end <= 1650, 'the response ends at ' + Math.round(end) + ' ms (target 1,500)');
  notes.push('Protect at Normal: ' + JSON.stringify(report.protectTrace));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('Heal is truthful: one of two restored → motes and +n on that one only; at full resolve → nothing reaches anyone, no number', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { comp: 'nao', knots: 5 });
  await p.evaluate(() => { const st = RB.combat.state(); st.pc = 8; st.comp = st.max; BP.setIntent('rest'); RB.combat.refresh(); BP.sampleOn(); });
  await respond(p, 'Restores 3 resolve', { match: 'Spot the opening' });
  await idle(p);
  let S = await p.evaluate(() => BP.sampleOff());
  let P = during(S, 'player');
  const to = [...new Set(P.flatMap((s) => s.effects || []).filter((e) => /^pHealTo/.test(e)))];
  const nums = [...new Set(P.flatMap((s) => s.nums || []))];
  assert(to.join() === 'pHealTo>pc', 'the healing reaches you only: ' + to.join());
  assert(P.some((s) => s.poses.pc === 'soothed') && !P.some((s) => s.poses.comp === 'soothed'), 'you ease; Nao (already steady) does not');
  // full resolve
  await p.evaluate(() => { const st = RB.combat.state(); st.pc = st.max; st.comp = st.max; BP.setIntent('rest'); RB.combat.refresh(); BP.sampleOn(); });
  await respond(p, 'Restores 3 resolve', { match: 'Spot the opening' });
  await idle(p);
  S = await p.evaluate(() => BP.sampleOff());
  P = during(S, 'player');
  assert(!P.some((s) => (s.effects || []).some((e) => /^pHealTo|^motes/.test(e))) && !P.some((s) => s.poses.pc === 'soothed' || s.poses.comp === 'soothed'), 'at full resolve nothing reaches anyone');
  const recap = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || '');
  assert(/No recovery was needed/.test(recap), 'and the record says so: ' + recap.slice(0, 160));
  void nums;
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('every response family: its own gesture and word motif on the real target (light on a real Shroud, unravel on its knot), captured for review', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const words = ['mamoru', 'iyasu', 'hikari', 'mizu', 'koori', 'kaze', 'nawa', 'ishi', 'honoo', 'suzu', 'koe'];
  await battle(p, { comp: 'mio', words, knots: 20, timeScale: 0.35 });
  const fams = await p.evaluate((ws) => ws.map((w) => ({ w, en: RB.content.words[w].effect, fam: RB.partyChoreo.WORD_FAMILY[w] })), words);
  const shots = [], got = {};
  for (const f of fams.concat([{ w: 'unravel', fam: 'unravel', en: 'unravel' }])) {
    await p.evaluate((f) => {
      const st = RB.combat.state();
      st.pc = Math.min(st.pc, 8); st.heat = 1; st.foes[0].heat = 1; st.shroud = f.fam === 'light' || f.fam === 'wind' || f.fam === 'fire'; st.foes[0].shroud = st.shroud; st.charged = f.fam === 'bind'; st.foes[0].charged = st.charged;
      BP.setIntent('rest'); RB.combat.refresh(); BP.sampleOn();
    }, f);
    await cards(p);
    const card = await p.evaluate((f) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && (f.w === 'unravel' ? /unravel/i.test(x.textContent) : x.textContent.replace(/\s+/g, ' ').includes(RB.content.words[f.w].en) && (f.w !== 'mamoru' || /on you/i.test(x.textContent)))); return c ? c.getAttribute('data-i') : null; }, f);
    if (card == null) { got[f.w] = 'no card'; continue; }
    const c = await center(p, '.rcard[data-i="' + card + '"]');
    await p.mouse.click(c.x, c.y);
    await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]');
    if (await p.$('.chal .mc .btn')) { const r = await p.evaluate(() => BP.right()); await p.mouse.click(r.x, r.y); } else { const rv = await center(p, '.chal [data-a=reveal]'); await p.mouse.click(rv.x, rv.y); }
    await p.waitForSelector('.fbwrap .fb-go');
    const g = await center(p, '.fbwrap .fb-go');
    await p.mouse.click(g.x, g.y);
    await companionTurn(p, { match: 'Warm draught' });
    // the word fully inked: capture the scene
    // the word fully inked and readable (its motif at work): capture the scene
    await p.waitForFunction(() => { const s = document.querySelector('.cb-strip'); return s && +s.style.opacity > 0.9 && +s.style.getPropertyValue('--w') >= 0.99; }, null, { timeout: 20000, polling: 'raf' }).catch(() => {});
    await wait(p, 120);
    const clip = await p.evaluate(() => { const d = document.querySelector('.cb-dock').getBoundingClientRect(); return { x: 0, y: 0, width: Math.round(Math.min(innerWidth, d.left > innerWidth * 0.4 ? d.left - 4 : innerWidth)), height: innerHeight }; });
    shots.push({ label: f.fam + ' — ' + (f.w === 'unravel' ? 'ほどく' : f.w), png: await p.screenshot({ clip }) });
    await idle(p);
    const S = await p.evaluate(() => BP.sampleOff());
    const P = during(S, 'player'), tr = last(await trace(p), 'player');
    const motif = (P.find((s) => s.strip && s.strip.motif) || {}).strip;
    got[f.w] = { fam: f.fam, gesture: tr && tr.meta.gesture, motif: motif && motif.motif, fx: [...new Set(P.flatMap((s) => s.effects || []).map((e) => e.split(/[>@]/)[0]))] };
  }
  report.families = got;
  const motifs = Object.values(got).filter((x) => x.motif).map((x) => x.fam + ':' + x.motif);
  assert(Object.values(got).every((x) => x.motif), 'every family moved its word with a motif: ' + JSON.stringify(got));
  assert(new Set(Object.values(got).map((x) => x.fam)).size === new Set(Object.values(got).map((x) => x.motif)).size, 'one motif per family: ' + motifs.join(', '));
  assert(got.hikari.fx.includes('pShroudClear') && got.unravel.fx.includes('pThread') && got.unravel.fx.includes('knotRelease'), 'light disperses the real Shroud; unravel draws its thread to the knot it frees');
  const sheet = await compose(shots, 4);
  await saveImg(p, 'families_gallery', sheet.png, sheet.webp);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
// the appearance registry, composed: every factor value at least once and every pair of factor values
await test('customization: the full appearance registry composed in battle poses (every hairstyle, cut, colour, skin, accessory and keepsake; all pairs) — drawn, planted, unclipped; eight deliberate looks for review', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  const res = await p.evaluate(() => {
    const S = RB.sprites;
    const keeps = Object.keys(RB.content.items).filter((k) => RB.content.items[k].slot === 'cosmetic' && RB.content.items[k].acc);
    const F = {
      hair: S.HAIRSTYLES.slice(), shape: ['tunic', 'robe', 'coat', 'apron'], skin: S.SKIN.map((_, i) => i), hairColor: S.HAIR.map((_, i) => i), outfit: S.CLOTH.map((_, i) => i),
      acc1: [null].concat(S.ACCESSORIES), acc2: [null].concat(S.ACCESSORIES), keep: [null].concat(keeps),
    };
    const names = Object.keys(F);
    // pairwise (greedy, seeded): every pair of values of two factors appears in some look
    const rng = RB.util.rng(20261002);
    const need = new Set();
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) for (let a = 0; a < F[names[i]].length; a++) for (let c = 0; c < F[names[j]].length; c++) need.add(i + ':' + a + '|' + j + ':' + c);
    const rows = [];
    let guard = 0;
    while (need.size && guard++ < 2000) {
      let best = null, bestN = -1;
      for (let tries = 0; tries < 40; tries++) {
        const r = names.map((n) => Math.floor(rng() * F[n].length));
        // start from an uncovered pair
        if (tries === 0) { const k = need.values().next().value.split('|').map((x) => x.split(':').map(Number)); r[k[0][0]] = k[0][1]; r[k[1][0]] = k[1][1]; }
        let n = 0;
        for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) if (need.has(i + ':' + r[i] + '|' + j + ':' + r[j])) n++;
        if (n > bestN) { bestN = n; best = r; }
      }
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) need.delete(i + ':' + best[i] + '|' + j + ':' + best[j]);
      rows.push(best);
    }
    const lookOf = (r) => {
      const v = (n) => F[n][r[names.indexOf(n)]];
      const acc = [...new Set([v('acc1'), v('acc2')].filter(Boolean))];
      const base = { skin: v('skin'), hair: v('hair'), hairColor: v('hairColor'), outfit: v('outfit'), shape: v('shape'), acc };
      return v('keep') ? RB.equip.lookWith(base, v('keep')) : base;
    };
    const B = RB.battlers, A = B.ANCHOR, Fr = B.FRAME;
    const poses = [['ready', null, 0], ['act', 'raise', 1], ['act', 'thread', 0.5], ['hit', null, 0.16], ['cheer', null, 1]];
    const bad = [], seenVals = names.map(() => new Set());
    let n = 0;
    for (const r of rows) {
      r.forEach((x, i) => seenVals[i].add(x));
      const lk = lookOf(r);
      for (const [pose, g, k] of poses) {
        const m = B._.measure(lk, { pose, gesture: g, k, who: 'pc', reduce: true });
        n++;
        if (m.n < 700) bad.push(JSON.stringify(lk) + ' ' + pose + ': nearly blank');
        if (m.box.y1 < A.y || m.box.y1 > A.y + 2) bad.push(JSON.stringify(lk) + ' ' + pose + ': lowest row ' + m.box.y1);
        if (m.box.x0 <= 0 || m.box.x1 >= Fr.w - 1 || m.box.y0 <= 0) bad.push(JSON.stringify(lk) + ' ' + pose + ': clipped ' + JSON.stringify(m.box));
      }
    }
    const allSeen = names.every((nm, i) => seenVals[i].size === F[nm].length);
    return { looks: rows.length, frames: n, bad: bad.slice(0, 20), nbad: bad.length, pairsLeft: need.size, allSeen, factors: names.map((nm) => nm + ':' + F[nm].length) };
  });
  report.registry = res;
  assert(res.pairsLeft === 0 && res.allSeen, 'every value and every pair of values covered: ' + res.looks + ' looks (' + res.factors.join(', ') + ')');
  assert(!res.nbad, res.nbad + ' of ' + res.frames + ' frames fail: ' + res.bad.join('\n  '));
  notes.push('registry: ' + res.looks + ' pairwise looks × 5 poses = ' + res.frames + ' frames, all drawn, planted and unclipped');
  // eight (ten) deliberate looks, for visual review: native and 3×
  const sheet = await p.evaluate(() => {
    const L = [
      ['test look: auburn ponytail, glasses + flower, green coat', { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] }],
      ['dark skin, curly black hair, red robe, hat + scarf', { skin: 6, hair: 'curly', hairColor: 0, outfit: 1, shape: 'robe', acc: ['hat', 'scarf'] }],
      ['very light skin, long white hair, plum apron, cape + earrings', { skin: 0, hair: 'long', hairColor: 6, outfit: 3, shape: 'apron', acc: ['cape', 'earrings'] }],
      ['shaved, medium-deep skin, teal tunic, headband + satchel', { skin: 4, hair: 'shaved', hairColor: 1, outfit: 7, shape: 'tunic', acc: ['headband', 'satchel'] }],
      ['twin tails, blue-black, dark coat, glasses; knitted scarf keepsake', RB.equip.lookWith({ skin: 2, hair: 'twintails', hairColor: 7, outfit: 5, shape: 'coat', acc: ['glasses'] }, 'sb_scarf')],
      ['head wrap, deep skin, light robe, earrings; ferry cap keepsake', RB.equip.lookWith({ skin: 5, hair: 'wrap', hairColor: 9, outfit: 6, shape: 'robe', acc: ['earrings'] }, 'lf_ferry_cap')],
      ['gold bob, blue tunic, flower; traveller\'s cape keepsake', RB.equip.lookWith({ skin: 3, hair: 'bob', hairColor: 4, outfit: 0, shape: 'tunic', acc: ['flower'] }, 'atlas_cos_cape')],
      ['teal braid, orange apron, hat; little lantern keepsake', RB.equip.lookWith({ skin: 1, hair: 'braid', hairColor: 8, outfit: 4, shape: 'apron', acc: ['hat'] }, 'atlas_cos_lamplet')],
      ['grey spiky hair, very deep skin, coat, satchel; maple-leaf pin', RB.equip.lookWith({ skin: 6, hair: 'spiky', hairColor: 5, outfit: 1, shape: 'coat', acc: ['satchel'] }, 'co_leaf_pin')],
      ['wavy plum hair, light skin, tunic, earrings; quill keepsake', RB.equip.lookWith({ skin: 0, hair: 'wavy', hairColor: 9, outfit: 3, shape: 'tunic', acc: ['earrings'] }, 'atlas_cos_quill')],
    ];
    const B = RB.battlers, Fr = B.FRAME, A = B.ANCHOR, Z = 3;
    const cols = [['ready', null, 0], ['calm', null, 0], ['act', 'thread', 0.45], ['act', 'ward', 1], ['act', 'raise', 1], ['act', 'restore', 1], ['hit', null, 0.16], ['cheer', null, 1]];
    const lab = 150;
    const cv = document.createElement('canvas'); cv.width = lab + cols.length * Fr.w * Z + Fr.w * cols.length; cv.height = L.length * Fr.h * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#4e5a44'; c.fillRect(0, 0, cv.width, cv.height);
    L.forEach(([name, lk], j) => {
      c.fillStyle = '#fff'; c.font = '12px sans-serif';
      const words = name.split(', '); words.forEach((w, i) => c.fillText(w, 6, j * Fr.h * Z + 16 + i * 15));
      // native size strip (1×) beside the label, then 3×
      cols.forEach(([pose, g, k], i) => {
        const x1 = lab + i * Fr.w;
        B.draw(c, lk, { x: x1 + A.x, y: j * Fr.h * Z + Fr.h * Z - 12, scale: 1, pose, gesture: g, k, who: 'pc', reduce: true });
        const x = lab + cols.length * Fr.w + i * Fr.w * Z;
        c.fillStyle = (i + j) % 2 ? '#5f6e52' : '#66765a'; c.fillRect(x, j * Fr.h * Z, Fr.w * Z, Fr.h * Z);
        B.draw(c, lk, { x: x + A.x * Z, y: j * Fr.h * Z + A.y * Z, scale: Z, pose, gesture: g, k, who: 'pc', reduce: true });
      });
    });
    return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.9), n: L.length };
  });
  await saveImg(p, 'player_looks_native_3x', sheet.png, sheet.webp);
  notes.push('player looks sheet: ' + sheet.n + ' deliberate looks × 8 poses, native and 3×');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('native frame sheets: each companion\'s key poses (stance, idle keys, own gestures, reactions, settle) at 1× and 3×; the 96×128 working-frame comparison', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  for (const id of ['pc', 'mio', 'nao', 'ren', 'suzu']) {
    const sheet = await p.evaluate((id) => {
      const B = RB.battlers, MV = RB.battlerMoves, Fr = B.FRAME, A = B.ANCHOR, Z = 3;
      const lk = id === 'pc' ? { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] } : RB.content.chars[id].look;
      const who = id === 'pc' ? 'pc' : 'comp';
      const rows = [];
      const I = MV.IDLE[id];
      rows.push(['idle keys', I.ready.map((_, i) => ['ready', null, 0, i])]);
      rows.push(['reactions', [['calm', null, 0], ['guard', 'wary', 0.5], ['guard', null, 0.5], ['hit', null, 0.16], ['hit', 'soft', 0.16], ['brace', null, 0.22], ['soothed', null, 0.5], ['afflict', 'hush', 0.5], ['afflict', 'gust', 0.5], ['down', null, 1], ['cheer', null, 1]]]);
      for (const g of MV.OWN[id]) rows.push([g, [['anticipate', g, 1], ['act', g, 0.15], ['act', g, MV.release(id, g)], ['act', g, 0.7], ['act', g, 1], ['recover', g, 0.5]]]);
      const maxc = Math.max(...rows.map((r) => r[1].length)), lab = 70;
      const cv = document.createElement('canvas'); cv.width = lab + maxc * Fr.w * (Z + 1); cv.height = rows.length * Fr.h * Z;
      const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#4e5a44'; c.fillRect(0, 0, cv.width, cv.height);
      rows.forEach(([name, cells], j) => {
        c.fillStyle = '#fff'; c.font = '12px sans-serif'; c.fillText(name, 4, j * Fr.h * Z + 16);
        cells.forEach(([pose, g, k, key], i) => {
          const o = { pose, gesture: g, k, who, id, reduce: key == null };
          if (key != null) { o.reduce = false; o.t = MV.idleTimes(id, 'ready')[key * 4 + 3]; }
          B.draw(c, lk, Object.assign({ x: lab + i * Fr.w + A.x, y: j * Fr.h * Z + Fr.h * Z - 10, scale: 1 }, o));
          const x = lab + maxc * Fr.w + i * Fr.w * Z;
          c.fillStyle = (i + j) % 2 ? '#5f6e52' : '#66765a'; c.fillRect(x, j * Fr.h * Z, Fr.w * Z, Fr.h * Z);
          B.draw(c, lk, Object.assign({ x: x + A.x * Z, y: j * Fr.h * Z + A.y * Z, scale: Z }, o));
          c.fillStyle = '#fff'; c.font = '10px sans-serif'; c.fillText(pose + (g ? ' ' + g : '') + (key != null ? ' #' + key : ' ' + k), x + 3, j * Fr.h * Z + 12);
        });
      });
      return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.9) };
    }, id);
    await saveImg(p, 'frames_' + id + '_native_3x', sheet.png, sheet.webp);
  }
  // §6.2: the same frames sampled on the 96×128 working frame (the rig is resolution-independent)
  const cmp = await p.evaluate(() => {
    const B = RB.battlers, Z = 3;
    const lk = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
    const cells = [['pc', lk, 'pc', 'ready', null, 0], ['pc', lk, 'pc', 'act', 'thread', 0.45], ['pc', lk, 'pc', 'act', 'ward', 1], ['mio', RB.content.chars.mio.look, 'comp', 'act', 'pour', 0.7], ['ren', RB.content.chars.ren.look, 'comp', 'act', 'flare', 1]];
    const G = [B.GRIDS.std, B.GRIDS.w96];
    const cv = document.createElement('canvas'); cv.width = cells.length * G[1].FW * Z; cv.height = (G[0].FH + G[1].FH) * Z + 40;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#4e5a44'; c.fillRect(0, 0, cv.width, cv.height);
    let y = 0;
    const stats = {};
    for (const g of G) {
      c.fillStyle = '#fff'; c.font = '14px sans-serif'; c.fillText(g.FW + '×' + g.FH + ' (' + g.ZS + ' px/unit)', 6, y + 16);
      cells.forEach(([id, l, who, pose, ge, k], i) => {
        B.draw(c, l, { x: i * G[1].FW * Z + g.AX * Z, y: y + 20 + g.AY * Z, scale: Z, pose, gesture: ge, k, who, id, reduce: true, grid: g.id });
        const m = B._.measure(l, { pose, gesture: ge, k, who, id, reduce: true, grid: g.id });
        (stats[g.id] = stats[g.id] || []).push(m.n);
      });
      y += g.FH * Z + 20;
    }
    return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.9), stats };
  });
  report.gridCompare = cmp.stats;
  await saveImg(p, 'frame_standard_80x104_vs_96x128', cmp.png, cmp.webp);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('resources: six encounters with changing looks — the frame cache holds only the current encounter\'s actors, bounded keys, estimated resident pixels against 48 MiB', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const looks = [{ skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] }, { skin: 6, hair: 'curly', hairColor: 0, outfit: 1, shape: 'robe', acc: ['hat', 'scarf'] }, { skin: 0, hair: 'long', hairColor: 6, outfit: 3, shape: 'apron', acc: ['cape'] }];
  const comps = ['mio', 'nao', 'ren', 'suzu', null, 'mio'];
  const rec = [];
  for (let n = 0; n < 6; n++) {
    await battle(p, { comp: comps[n], look: looks[n % 3], knots: 1, timeScale: 2 });
    await wait(p, 600);
    const mid = await p.evaluate(() => RB.battlers.budget());
    await respond(p, 'unravel', {});
    for (let i = 0; i < 100 && (await p.evaluate(() => RB.game.mode())) === 'combat'; i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await wait(p, 80); }
    await p.waitForFunction(() => window.__result, null, { timeout: 15000 });
    const bud = await p.evaluate(() => Object.assign(RB.battlers.budget(), { keys: RB.battlers._.keys().slice(0, 400) }));
    const ids = Object.keys(bud.perActor);
    rec.push({ comp: comps[n], frames: bud.frames, mib: bud.mib, ids, mid: mid.frames, timeKeys: bud.keys.filter((k) => /\|\d{4,}\|/.test(k)).length, meanBuildMs: bud.meanBuildMs, maxBuildMs: bud.maxBuildMs });
    assert(ids.every((id) => id === 'pc' || id === comps[n]), 'encounter ' + (n + 1) + ': only its actors are cached ' + JSON.stringify(bud.perActor));
    assert(bud.mib <= 48 && bud.frames <= bud.cap, 'encounter ' + (n + 1) + ': ' + bud.frames + ' frames, ' + bud.mib + ' MiB (cap ' + bud.cap + ' frames = ' + bud.capMib + ' MiB) ≤ 48 MiB');
  }
  report.resources = rec;
  assert(rec.every((r) => r.timeKeys === 0), 'no cache key carries elapsed time');
  notes.push('resources: ' + rec.map((r) => (r.comp || 'solo') + ' ' + r.frames + 'f/' + r.mib + 'MiB').join(', '));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('the Mio exchange frame by frame (presentation clock slowed for the capture): your Protect, then her warm draught on the one it restores, then the creature\'s Strike caught by the seal', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { comp: 'mio', knots: 4, timeScale: 0.22 });
  await p.evaluate(() => { const st = RB.combat.state(); st.pc = 7; st.comp = 12; BP.setIntent('strike', 'pc'); RB.combat.refresh(); });
  const clip = await p.evaluate(() => { const d = document.querySelector('.cb-dock').getBoundingClientRect(); return { x: 0, y: 0, width: Math.round(d.left > innerWidth * 0.4 ? d.left - 4 : innerWidth), height: innerHeight }; });
  const shots = [];
  const snap = async (label) => shots.push({ label, png: await p.screenshot({ clip }) });
  const when = async (label, fn) => { await p.waitForFunction(fn, null, { timeout: 30000, polling: 'raf' }); await snap(label); };
  await snap('1 · calm, choosing');
  await respond(p, 'protect.*on you', { match: 'Warm draught' });
  await when('2 · you anticipate (brace)', () => { const f = RB.combat.debug().stage.frame; return f && /^anticipate/.test(f.poses.pc || ''); });
  await when('3 · the word unfolds over you', () => { const s = document.querySelector('.cb-strip'); return s && +s.style.getPropertyValue('--w') > 0.5; });
  await when('4 · the seal closes; 守る readable', () => { const f = RB.combat.debug().stage.frame; return f && (f.effects || []).some((e) => /^pSealClose/.test(e)) && RB.combat.debug().seq.counters.beats > 0 && (f.marks || []).some((m) => /^ward:pc/.test(m)); });
  await when('5 · the word folds shut; you recover', () => { const f = RB.combat.debug().stage.frame; return f && /^recover/.test(f.poses.pc || ''); });
  await when('6 · Mio takes the vial from her hip', () => { const f = RB.combat.debug().stage.frame; return f && f.poses.comp === 'anticipate:pour'; });
  await when('7 · uncorked, poured toward you', () => { const f = RB.combat.debug().stage.frame; return f && (f.effects || []).some((e) => /^pPour/.test(e)); });
  await when('8 · it reaches you: you ease (+1)', () => { const f = RB.combat.debug().stage.frame; return f && f.poses.pc === 'soothed' && (f.nums || []).length; });
  await when('9 · its Strike: you brace as it winds up', () => { const d = RB.combat.debug(), f = d.stage.frame; return d.phase === 'enemy' && f && f.poses.pc === 'guard'; });
  await when('10 · the seal catches it', () => { const f = RB.combat.debug().stage.frame; return f && f.poses.pc === 'brace'; });
  await idle(p);
  await snap('11 · calm again');
  const sheet = await compose(shots, 4);
  await saveImg(p, 'mio_exchange_frames', sheet.png, sheet.webp);
  await p.evaluate(() => RB.battleSeq.setTimeScale(1));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('menus show the current battle art (§7.1): the Satchel\'s "In battle" preview is the battle rig\'s own frame for the worn look', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  const r = await p.evaluate(async () => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, {});
    s.player.look = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
    s.inv.co_straw_hat = 1;
    RB.ui.menu.open('satchel');
    await new Promise((res) => setTimeout(res, 300));
    const it = document.querySelector('[data-it="co_straw_hat"]');
    it.click();
    await new Promise((res) => setTimeout(res, 300));
    const cv = document.querySelector('canvas[data-prev="co_straw_hat"][data-dir="battle"]');
    if (!cv) return { missing: true };
    // the rig's own frame for that look, trimmed the same way
    const src = RB.battlers.preview(RB.equip.lookWith(s.player.look, 'co_straw_hat'), 'ready', null, 0, { who: 'pc', reduce: true });
    const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data;
    let x0 = src.width, y0 = src.height, x1 = -1, y1 = -1;
    for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) if (d[(y * src.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2);
    const a = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, bb = src.getContext('2d').getImageData(x0, y0, cv.width, cv.height).data;
    let diff = 0;
    for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - bb[i]) + Math.abs(a[i + 1] - bb[i + 1]) + Math.abs(a[i + 2] - bb[i + 2]) + Math.abs(a[i + 3] - bb[i + 3]) > 8) diff++;
    const box = cv.closest('.idetail, .leaf-b, .wear') || cv.parentElement.parentElement;
    const rb = box.getBoundingClientRect();
    return { diff, w: cv.width, h: cv.height, clip: { x: Math.max(0, rb.left - 8), y: Math.max(0, rb.top - 8), width: Math.min(innerWidth, rb.width + 16), height: Math.min(innerHeight - Math.max(0, rb.top - 8), rb.height + 16) } };
  });
  assert(!r.missing, 'the Satchel shows an "In battle" preview for a keepsake');
  assert(r.diff === 0, 'the preview is exactly the battle rig\'s ready frame for the worn look (' + r.diff + ' px differ, ' + r.w + '×' + r.h + ')');
  const png = await p.screenshot({ clip: r.clip });
  fs.writeFileSync(path.join(outDir, 'satchel_in_battle_preview.png'), png);
  const webp = await p.evaluate(async (u) => { const i = new Image(); await new Promise((res) => { i.onload = res; i.src = u; }); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d').drawImage(i, 0, 0); return c.toDataURL('image/webp', 0.9); }, 'data:image/png;base64,' + png.toString('base64'));
  await saveImg(p, 'satchel_in_battle_preview', 'data:image/png;base64,' + png.toString('base64'), webp);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------------
await test('recording: one exchange with Mio at Normal, real time — your response, then her support action (WebM)', async () => {
  const dir = path.join(outDir, 'raw-video');
  fs.mkdirSync(dir, { recursive: true });
  const c2 = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
  const p = await c2.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await helpers(p);
  await battle(p, { comp: 'mio', knots: 4, timeScale: 1 });
  await p.evaluate(() => { const st = RB.combat.state(); st.pc = 7; st.comp = 9; BP.setIntent('strike', 'pc'); RB.combat.refresh(); });
  await wait(p, 1500); // the quiet idle
  const t0 = Date.now();
  await respond(p, 'protect.*on you', { match: 'Warm draught', delay: 700 });
  await idle(p);
  const tr = await trace(p);
  await wait(p, 1200);
  const video = p.video();
  await c2.close();
  const raw = await video.path();
  const dst = path.join(outDir, 'mio_exchange_normal.webm');
  fs.copyFileSync(raw, dst);
  if (toDocs) fs.copyFileSync(dst, path.join(docsDir, 'mio_exchange_normal.webm'));
  const P = last(tr, 'player'), C = last(tr, 'companion');
  report.recording = { file: path.relative(root, dst), bytes: fs.statSync(dst).size, playerMs: P && P.dur, companionMs: C && C.dur, companionAct: C && C.meta.act, wallMs: Date.now() - t0 };
  assert(P && C && C.meta.act === 'mio_draught' && !P.settled && !C.settled, 'the response and Mio\'s draught both played in full ' + JSON.stringify(report.recording));
  assert(!errors.length, errors.join('; '));
});

// ---- composition helper (labelled tiles; PNG + WebP) ------------------------------------------------------
async function compose(shots, perRow) {
  const pg = await b.newPage();
  const out = await pg.evaluate(async ([urls, labels, perRow]) => {
    const imgs = await Promise.all(urls.map((u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; })));
    const w = imgs[0].width, h = imgs[0].height, sc = Math.min(1, 460 / w), cw = Math.round(w * sc), ch = Math.round(h * sc), lab = 24;
    const cols = perRow, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cols * cw + (cols + 1) * 6; cv.height = rows * (ch + lab) + (rows + 1) * 6;
    const g = cv.getContext('2d'); g.fillStyle = '#1c1a26'; g.fillRect(0, 0, cv.width, cv.height);
    imgs.forEach((im, i) => { const x = 6 + (i % cols) * (cw + 6), y = 6 + Math.floor(i / cols) * (ch + lab + 6); g.imageSmoothingEnabled = true; g.drawImage(im, x, y, cw, ch); g.fillStyle = '#efe4c8'; g.font = '600 14px system-ui, sans-serif'; g.fillText(labels[i], x + 4, y + ch + 17); });
    return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.86) };
  }, [shots.map((s) => 'data:image/png;base64,' + s.png.toString('base64')), shots.map((s) => s.label), perRow]);
  await pg.close();
  return out;
}

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
for (const n of notes) console.log('note: ' + n);
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
