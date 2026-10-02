// Creatures A, against the BUILT index.html in Chromium (battle addendum §18, §23.5): real
// battles in synthetic campaigns (fresh contexts, never a player's save), answered with the real
// mouse.
// - the Flour Moth on the mill road (exterior) and inside the mill (interior), solo: each keeps
//   its own setting and lines; the swoop Strike (prep → arcing approach → contact at 640 →
//   arrest and return → hover), a fully warded Strike (the seal at the contact), a softened hit,
//   Shroud applied (its own powder), persisting quietly, and cleared by light (the same powder
//   dispersing); reduced motion: held key poses, no travel;
// - DIAGNOSTIC FIXTURE: the moth with Mio beside you (a two-person party in a Chapter 1 place —
//   not reachable there in play): a Strike aimed at the companion travels to the companion;
// - one battle per family (wisp, blot, echo, crab, crane, golem, letter, clerk, warden): its own
//   moves delivered (the delivery's acts and effects), each result once, the display equal to the
//   rules;
// - DIAGNOSTIC FIXTURE: three creatures at once (moth, reedling, blot) on the mill road;
// - no page errors anywhere.
// Captures: tests/e2e/out/battle_creatures_a/; with --docs, WebP copies of the key moments in
// docs/screenshots/battle/creatures_a/.
// Usage: node tests/e2e/creatures_a.mjs [filter] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { helpers, battle, cards, respond, idle, during, seq, wait } from './creatures_a_lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_creatures_a');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_a');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [], notes = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 300s')), 300000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1600)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 800 } };
const WORDS = ['mamoru', 'hikari', 'mizu', 'kaze'];
const last = (tr, kind) => tr.filter((r) => r.kind === kind).slice(-1)[0];
const trace = (p) => p.evaluate(() => RB.battleSeq.trace());
const samples = async (p) => { await p.evaluate(() => CA.sampleOff()); return p.evaluate(() => CA.samples); };
// a WebP still of the stage (and a PNG in the scratch folder)
async function still(p, name) {
  const clip = await p.evaluate(() => { const r = document.querySelector('.cb-stage') ? document.querySelector('.cb-stage').getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight }; return { x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), width: Math.round(Math.min(innerWidth, r.width)), height: Math.round(Math.min(innerHeight, r.height)) }; });
  const png = await p.screenshot({ clip });
  fs.writeFileSync(path.join(outDir, name + '.png'), png);
  if (toDocs) {
    const webp = await p.evaluate(async (b64) => { const im = new Image(); await new Promise((r) => { im.onload = r; im.src = 'data:image/png;base64,' + b64; }); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.9); }, png.toString('base64'));
    fs.writeFileSync(path.join(docDir, name + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  }
}
// play one enemy move (the intent set as the rules would draw it), answering with `card`;
// resolves the enemy samples and its trace record
async function move(p, kind, target, card, o) {
  o = o || {};
  await p.evaluate(([k, t, pre]) => {
    CA.setIntent(k, t);
    const st = RB.combat.state();
    for (const key in pre || {}) { if (key === 'ward') Object.assign(st.ward, pre.ward); else st[key] = pre[key]; }
    RB.combat.refresh();
    window.__b0 = RB.battleSeq.stats().counters.beats;
    CA.sampleOn();
  }, [kind, target || null, o.pre || null]);
  const shots = [];
  await respond(p, card, { comp: o.comp ? {} : false });
  if (o.shoot) {
    // a still at the move's contact (the first result shown in the enemy phase)
    await p.waitForFunction(() => RB.combat.phase() === 'enemy' && RB.battleSeq.stats().counters.beats > window.__b0, null, { timeout: 30000, polling: 'raf' }).catch(() => {});
    await still(p, o.shoot);
  }
  await idle(p);
  const S = await samples(p);
  const E = during(S, 'enemy'), tr = last(await trace(p), 'enemy');
  await cards(p); // (a boss's phase line, if one came, is read through)
  return { S, E, tr, acts: seq(E.map((s) => s.foe)), effects: [...new Set(E.flatMap((s) => s.effects || []))], moved: E.some((s) => s.foeOff && (Math.abs(s.foeOff.dx) >= 4 || Math.abs(s.foeOff.dy) >= 4)) };
}
// the rules ran once for the exchange, and every enemy result was shown once
async function onceEach(p, label) {
  const ex = await p.evaluate(() => CA.exch.filter((x) => x.k === 'enemyAct').slice(-1)[0]);
  const tr = last(await trace(p), 'enemy');
  const want = (ex.fx || []).map((f) => f.t), got = tr.beats.map((x) => x.t).filter((t) => t !== 'spent');
  assert(JSON.stringify(got) === JSON.stringify(want), label + ': every result shown once, in the rules\' order (' + got + ' vs ' + want + ')');
  const shown = await p.evaluate(() => { const a = CA.pick(RB.combat.shown()), b = CA.pick(RB.combat.state()); return JSON.stringify(a) === JSON.stringify(b); });
  assert(shown, label + ': the display ends equal to the rules');
}

// ---------------------------------------------------------------------------------------------------
await test('the Flour Moth on the mill road (exterior, solo): its own lines; the swoop Strike, a warded Strike, a softened hit; Shroud applied, persisting, cleared', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const lines = await battle(p, { map: 'rw.millroad', x: 11, y: 10, foe: 'f3', words: WORDS });
  assert(lines.join(' ').includes('drifts out of the mill'), 'the exterior placement\'s own line: ' + lines.join(' | '));
  await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 8; RB.combat.refresh(); });
  // an unblocked Strike: prep → exec (travel) → recover, the hit at 640 on the presentation clock
  let M = await move(p, 'strike', 'pc', 'unravel', { shoot: toDocs ? 'moth_ext_strike_contact' : null });
  assert(M.tr.meta.kind === 'strike' && M.tr.beats.map((x) => x.t).join() === 'hit', 'the strike hits you: ' + JSON.stringify(M.tr.beats));
  assert(Math.abs(M.tr.beats[0].at - 640) <= 40, 'the hit shows at the swoop\'s contact (640 ms): ' + M.tr.beats[0].at);
  assert(M.acts.join(' ').indexOf('prep exec') >= 0 && M.acts.lastIndexOf('recover') > M.acts.indexOf('exec'), 'aim → approach → recover: ' + M.acts.join(' → '));
  assert(M.moved, 'the moth travels bodily toward you (and back)');
  const maxDx = Math.min(...M.E.map((s) => (s.foeOff ? s.foeOff.dx : 0)));
  assert(maxDx < -40, 'a real approach, not a twitch (' + maxDx + ' art px toward you)');
  const backHome = M.E.slice(-3).every((s) => !s.foeOff || (Math.abs(s.foeOff.dx) <= 2 && Math.abs(s.foeOff.dy) <= 2));
  assert(backHome, 'it is home again, hovering, by the end');
  assert(M.effects.some((e) => /^wingWake/.test(e)) && M.effects.some((e) => /^scaleShed>pc/.test(e)) && M.effects.some((e) => /^impact>pc/.test(e)) && !M.effects.some((e) => /^dart/.test(e)), 'its own swoop (wing scales at the contact), the impact on you, no generic dart: ' + M.effects.join(', '));
  assert(M.E.some((s) => s.poses && s.poses.pc === 'hit'), 'you react to the real hit');
  await onceEach(p, 'strike');
  notes.push('moth strike (exterior): acts ' + M.acts.join('→') + '; beat at ' + M.tr.beats[0].at + ' ms; trace end ' + M.tr.meta.end + ' (presentation ms)');
  // a fully intercepted Strike: protect on you — the seal blocks at the moth's contact
  M = await move(p, 'strike', 'pc', 'protect.*on you', { shoot: toDocs ? 'moth_ext_ward_contact' : null });
  assert(M.tr.beats.map((x) => x.t).join() === 'countered', 'the ward answers it: ' + JSON.stringify(M.tr.beats));
  assert(Math.abs(M.tr.beats[0].at - 640) <= 40 && M.effects.indexOf('sealBlock>pc') >= 0, 'the seal blocks at the contact (' + M.tr.beats[0].at + ')');
  assert(M.moved && M.acts.indexOf('recover') > 0 && !M.effects.some((e) => /^impact/.test(e)), 'it swoops, meets the seal and is thrown back — no hit: ' + M.effects.join(', '));
  assert(!M.E.some((s) => s.poses && s.poses.pc === 'hit'), 'you do not flinch from a blow that never landed');
  await onceEach(p, 'warded strike');
  // a softened hit: one ward point absorbs part of the blow, the rest lands
  M = await move(p, 'strike', 'pc', 'unravel', { pre: { ward: { pc: 1, comp: 0 } }, shoot: toDocs ? 'moth_ext_softened' : null });
  assert(M.tr.beats.map((x) => x.t).join() === 'block,hit', 'block, then the smaller hit: ' + JSON.stringify(M.tr.beats));
  assert(M.effects.indexOf('sealBlock>pc') >= 0 && M.effects.some((e) => /^impact>pc/.test(e)), 'the seal intercepts, then the smaller impact');
  await onceEach(p, 'softened strike');
  // Shroud: applied at its cue, a quiet veil persisting, cleared by light (the same powder dispersing)
  M = await move(p, 'shroud', null, 'unravel', { shoot: toDocs ? 'moth_ext_shroud_release' : null });
  const sm = seq(M.E.map((s) => (s.marks || []).indexOf('shroud') >= 0));
  assert(sm.join() === 'false,true' && M.effects.indexOf('veilRelease') >= 0 && M.effects.indexOf('mistRoll') >= 0, 'Shroud: its powder released, settling over its knots at the beat: ' + sm + ' ' + M.effects.join(', '));
  assert(M.tr.meta.end >= 1440 && Math.abs(M.tr.beats[0].at - 760) <= 40, 'Shroud\'s performance ~1,450 ms, the veil at 760: end ' + M.tr.meta.end + ', beat ' + M.tr.beats[0].at);
  await wait(p, 600);
  const veil = await p.evaluate(() => RB.combat.debug().stage.frame.marks);
  assert(veil.indexOf('shroud') >= 0, 'the veil persists between moves');
  if (toDocs) await still(p, 'moth_ext_shroud_persisting');
  await p.evaluate(() => { CA.setIntent('rest'); CA.sampleOn(); });
  await respond(p, 'Shows what is hidden', { comp: false });
  await idle(p);
  const S = await samples(p), P = during(S, 'player');
  assert(seq(P.map((s) => (s.marks || []).indexOf('shroud') >= 0)).join() === 'true,false' && P.some((s) => (s.effects || []).indexOf('mistPart') >= 0), 'light clears it: the same veil disperses at the beat');
  // resources: every distinct moth frame this battle drew (idle, posed, prewarmed), as raw RGBA
  await wait(p, 2500);
  const cache = await p.evaluate(() => CA.cache());
  notes.push('cache (moth battle, all variants + Shroud + prewarm): ' + cache.frames + ' frames, ' + cache.MiB + ' MiB raw RGBA (prewarm pending ' + cache.pending + ')');
  assert(cache.MiB < 48, 'within the 48 MiB budget: ' + JSON.stringify(cache));
  assert(!errors.length, errors.join('; '));
  notes.push('moth exterior placement lines: ' + lines.slice(0, 1).join(' ').slice(0, 90));
  await ctx.close();
});

await test('the Flour Moth inside the mill (interior, solo): its own lines, its own setting; the same swoop', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  const lines = await battle(p, { map: 'rw.mill1', x: 7, y: 8, foe: 'm1a', words: WORDS, flags: { rw_gears: true } });
  assert(lines.join(' ').includes('hiding the letters'), 'the interior placement\'s own line: ' + lines.join(' | '));
  const setting = await p.evaluate(() => ({ indoor: RB.render.enclosed(RB.world.W.map), map: RB.world.W.map.id }));
  assert(setting.indoor && setting.map === 'rw.mill1', 'inside the mill: ' + JSON.stringify(setting));
  await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 6; RB.combat.refresh(); });
  const M = await move(p, 'strike', 'pc', 'unravel', { shoot: toDocs ? 'moth_int_strike_contact' : null });
  assert(M.tr.beats.map((x) => x.t).join() === 'hit' && M.moved && M.acts.indexOf('exec') > 0, 'the swoop inside the mill too');
  await onceEach(p, 'interior strike');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('reduced motion: the moth\'s Strike keeps its meaning — held key poses, no travel, the hit at its contact', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'rw.millroad', x: 11, y: 10, foe: 'f3', words: WORDS, reduce: true });
  await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 6; RB.combat.refresh(); });
  const M = await move(p, 'strike', 'pc', 'unravel');
  assert(M.tr.beats.map((x) => x.t).join() === 'hit', 'the hit still shows');
  assert(M.E.every((s) => !s.foeOff || (s.foeOff.dx === 0 && s.foeOff.dy === 0)), 'no travel with reduced motion');
  assert(M.acts.indexOf('prep') >= 0 && M.acts.indexOf('exec') > 0 && M.acts.indexOf('recover') > 0, 'aim, strike and recovery still read (held poses): ' + M.acts.join('→'));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('DIAGNOSTIC FIXTURE (Mio beside you on the mill road; not reachable there in play): a Strike aimed at the companion travels to the companion', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'rw.millroad', x: 11, y: 10, foe: 'f3', words: WORDS, comp: 'mio' });
  await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 6; RB.combat.refresh(); });
  const M = await move(p, 'strike', 'comp', 'unravel', { comp: true, shoot: toDocs ? 'moth_diag_party_strike_comp' : null });
  assert(M.tr.beats.map((x) => x.t + ':' + x.who).join() === 'hit:comp', 'the companion is hit: ' + JSON.stringify(M.tr.beats));
  const d = await p.evaluate(() => { const L = RB.battleStage.lay(); return { comp: RB.battleStage.anchor('comp', 'chest'), pc: RB.battleStage.anchor('pc', 'chest'), foe: { x: L.foes[0].ex, y: L.foes[0].ey }, scale: L.scale }; });
  const far = M.E.reduce((m, s) => (s.foeOff && s.foeOff.dx < m.dx ? s.foeOff : m), { dx: 0, dy: 0 });
  // the deepest point of its approach lies on the line toward the companion's chest (not yours)
  const toComp = Math.atan2(d.comp.y - d.foe.y, d.comp.x - d.foe.x), toPc = Math.atan2(d.pc.y - d.foe.y, d.pc.x - d.foe.x), got = Math.atan2(far.dy, far.dx);
  assert(Math.abs(got - toComp) < Math.abs(got - toPc) + 0.02, 'it swoops at the companion: ' + JSON.stringify({ got, toComp, toPc }));
  assert(M.E.some((s) => s.poses && s.poses.comp === 'hit') && !M.E.some((s) => s.poses && s.poses.pc === 'hit'), 'the companion recoils; you do not');
  await onceEach(p, 'strike at the companion');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
// one battle per family: [family, map, enemy, [move, target, card, expectations]…]
const FAMS = [
  ['wisp', 'rw.millroad', 'rw.reedling', [['strike', 'pc', 'unravel', { travel: true, fx: /^wispTrail/ }], ['sweep', null, 'unravel', { travel: true, fx: /^arc/ }]]],
  ['blot', 'rw.mill1', 'rw.inkblot', [['strike', 'pc', 'unravel', { travel: true, fx: /^inkLash/ }], ['mend', null, 'unravel', { fx: /^mendThread/, act: 'cast' }]]],
  ['echo', 'sa.stacks', 'sa.echo', [['strike', 'pc', 'unravel', { travel: true, fx: /^shardVolley/ }], ['mirror', 'pc', 'unravel', { fx: /^pane/ }]]],
  ['crab', 'sg.road', 'sg.crab', [['strike', 'pc', 'unravel', { travel: true, fx: /^clawSnap/ }], ['mend', null, 'unravel', { fx: /^mendThread/, act: 'cast' }]]],
  ['crane', 'sa.road', 'sa.crane', [['strike', 'pc', 'unravel', { travel: true, fx: /^paperCut/ }], ['gust', null, 'unravel', { fx: /^(gust|paperFlurry)/ }]]],
  ['golem', 'co.kiln', 'co.golem', [['strike', 'pc', 'unravel', { travel: true, fx: /^stoneDust/ }], ['charge', null, 'unravel', { fx: /^gather/, act: 'cast' }]]],
  ['sg_letter', 'sg.da_reading', 'sg.letter', [['plea', null, 'unravel', { fx: /^note/, act: 'cast' }], ['sweep', null, 'unravel', { travel: true, fx: /^(arc|paperCut)/ }]]],
  ['clerk', 'lf.stacks', 'lf.stamp', [['strike', 'pc', 'unravel', { travel: true, fx: /^stampSeal/ }], ['lie', 'pc', 'unravel', { fx: /^pane/ }]]],
  ['warden', 'co.kiln', 'co.warden', [['strike', 'pc', 'unravel', { fx: /^kilnBolt/ }], ['heat', null, 'unravel', { fx: /^(kilnStoke|embers)/, act: 'cast' }]]],
];
for (const [fam, map, enemy, moves] of FAMS) {
  await test('family ' + fam + ' (' + enemy + ' in ' + map + '): its own moves delivered, each result once, the display equal to the rules', async () => {
    const { p, errors, ctx } = await page(b, url, DESK);
    await helpers(p);
    await battle(p, { map, enemy, words: WORDS });
    await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 6; RB.combat.refresh(); });
    let k = 0;
    for (const [kind, target, card, want] of moves) {
      const M = await move(p, kind, target, card, { shoot: toDocs && k === 0 ? 'family_' + fam + '_' + kind : null });
      k++;
      assert(M.tr && M.tr.meta.kind === kind, fam + ' ' + kind + ': the move played (' + (M.tr && M.tr.meta.kind) + ')');
      if (want.travel) assert(M.moved, fam + ' ' + kind + ': it travels bodily toward its target');
      if (want.fx) assert(M.effects.some((e) => want.fx.test(e)), fam + ' ' + kind + ': its own effect ' + want.fx + ' in ' + M.effects.join(', '));
      if (want.act) assert(M.acts.indexOf(want.act) >= 0, fam + ' ' + kind + ': ' + want.act + ' in ' + M.acts.join('→'));
      assert(M.acts.indexOf('prep') >= 0 || M.acts.indexOf('cast') >= 0, fam + ' ' + kind + ': a visible preparation or gesture: ' + M.acts.join('→'));
      await onceEach(p, fam + ' ' + kind);
      notes.push(fam + ' ' + kind + ': acts ' + M.acts.join('→') + '; results ' + M.tr.beats.map((x) => x.t + '@' + x.at).join(', '));
    }
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

await test('DIAGNOSTIC FIXTURE (three creatures on the mill road: moth, reedling, blot — not a Chapter 1 encounter): each acts in turn with its own delivery; no page errors', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, { map: 'rw.millroad', x: 11, y: 10, enemy: 'rw.dustmoth', group: ['rw.reedling', 'rw.inkblot'], diff: 'hard', words: WORDS, comp: 'nao' });
  const n = await p.evaluate(() => RB.combat.members());
  assert(n.length === 3, 'three creatures: ' + n.join(', '));
  // (enough knots that none settles before its turn)
  await p.evaluate(() => { const st = RB.combat.state(); for (const f of st.foes) { f.knots = f.maxKnots = 4; } RB.combat.refresh(); CA.setIntent('strike', 'pc', 0); CA.setIntent('strike', 'comp', 1); CA.setIntent('strike', 'pc', 2); CA.sampleOn(); });
  await respond(p, 'unravel', { comp: {} });
  await p.waitForFunction(() => RB.combat.phase() === 'enemy' && RB.combat.debug().stage.frame.foes.some((f) => f.act === 'exec'), null, { timeout: 30000, polling: 'raf' }).catch(() => {});
  if (toDocs) await still(p, 'group_trio_diagnostic');
  await idle(p);
  const tr = (await trace(p)).filter((r) => r.kind === 'enemy').slice(-3);
  assert(tr.length === 3 && tr.every((r) => r.meta.kind === 'strike'), 'three strikes, one after another: ' + tr.map((r) => r.meta.kind));
  const S = await samples(p);
  const acted = new Set(S.flatMap((s) => (s.foes || []).filter((f) => f.act === 'exec').map((f) => f.i)));
  assert(acted.size === 3, 'each creature performed its own approach: ' + [...acted]);
  const stage = await p.evaluate(() => RB.battleStage.stats().lay.foes.length);
  await wait(p, 3000);
  const cache = await p.evaluate(() => CA.cache());
  notes.push('cache (diagnostic trio: moth, reedling, blot): ' + cache.frames + ' distinct frames drawn, ' + cache.MiB + ' MiB raw RGBA; at most ' + cache.heldMiB + ' MiB held by the 140-frame LRU (prewarm pending ' + cache.pending + ')');
  assert(cache.heldMiB < 48, 'within the 48 MiB budget: ' + JSON.stringify(cache));
  assert(stage === 3, 'three on the stage');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log('\n' + results.join('\n'));
for (const n of notes) console.log('note: ' + n);
console.log(pass + ' passed, ' + fail + ' failed');
fs.writeFileSync(path.join(outDir, 'creatures_a_results.txt'), results.join('\n') + '\n' + notes.map((n) => 'note: ' + n).join('\n') + '\n' + pass + ' passed, ' + fail + ' failed\n');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
