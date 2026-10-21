// The Drowned Bell's Keeper shown in the Bell Chamber (RBN-QA-071), in the BUILT game, headless Chromium, synthetic
// campaigns in fresh contexts (never a player's save), from the moment lf.boss_intro plays (lf.bellhall, the lower
// gate drained, as the Ch5 staging fixture has it):
// - before the water heaves the map shows the chamber with its ordinary bell (no picture); the line "The water in
//   front of the bell heaves upwards" is shown over the picture of the water swelling (src/ui/42e_interlude_keeper.js,
//   stage heave); "Pipes twist together …" over the keeper risen (stage rise: its sluice plate is on screen), held
//   through its words and your companion's answer (stage face); the swell, and the keeper down to the water, sit above
//   the dialogue sheet as the page lays it out, at 1280×800 and 390×844;
// - the battle starts as before: lf.keeper, no stepping back, from the script (won here by the automated player,
//   RB.test's 'unravel' policy, as tests/e2e/story_ch5.mjs wins it); the picture is still up as it begins (the
//   battle's own fade takes the screen from it);
// - after it, "The keeper comes apart …" over it sinking (stage apart) and "The pipes that were wound round the bell
//   loosen …" over them falling (stage loosen); then the chamber again with its ordinary bell, no picture left, nothing
//   faded; lf_boss_done set, and the scene ends in exactly the state it ends in with the pictures switched off;
// - with Reduce motion a picture holds still (two moments alike); with motion it moves (they differ);
// - every companion's own lines and gestures (Nao, Mio, Ren, Suzu) play; no page errors, no network requests;
// - a battle that takes the screen from the picture draws itself, not the picture, and a campaign change (back to the
//   title) leaves no picture behind.
// Usage: node tests/e2e/keeper_reveal.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
// the moment: the drowned stair drained, both plugs pulled (tests/e2e/staging_ch56_cases.mjs, lf.boss_intro)
const FL = { rw_arrived: true, departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, sb_hoshino_goes: true, lf_arrived: true, lf_town_intro: true,
  lf_yae_told: true, lf_tokuji_told: true, lf_tokuji_boat: true, lf_tower_entered: true, lf_up_closed: true, lf_gate_a: true, lf_mid_seen: true, lf_shortcut: true, lf_gate_b: true, lf_low_seen: true,
  lf_south_pulled: true, lf_gate_c: true };
const WANT = [[/heaves upwards/, 'heave'], [/Pipes twist together/, 'rise'], [/You must not ring it/, 'rise'], [/comes apart/, 'apart'], [/loosen and fall/, 'loosen']];

// set up the moment and start the scene; o.noPictures: the same scene with the pictures switched off (the state check)
async function begin(p, comp, reduce, o) {
  return p.evaluate(async ([FL, comp, reduce, o]) => {
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = reduce; RB.game.applySettings();
    const s = RB.game.debugStart('lf.bellhall', 8, 5, { comp, flags: FL, dir: 'down' });
    s.quests.lf_main = { stage: 7, done: false, t: 1 };
    // the creatures on the maps stay out of it (a patrol reaching you would start another battle)
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    RB.save.autosave = async () => {};
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 800 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    // the world as the scene begins: the chamber, its bell unrung on the map, no picture over it
    const bellOn = (W.map.def.props || []).filter((pr) => pr.p === 'lf_bigbell' && (!pr.if || RB.state.test(s, pr.if)));
    const before = { map: W.map.id, picture: RB.interlude.active(), override: !!RB.render.getOverride(), bell: bellOn.map((pr) => !!(pr.o && pr.o.rung)) };
    // what happens, in order: pictures shown and cleared, lines said, the battle begun, the cues given
    const log = [];
    window.__log = log;
    const show0 = RB.interlude.show, clear0 = RB.interlude.clear;
    RB.interlude.show = function (id, stage) { log.push({ t: 'show', id, stage }); if (o.noPictures) return; return show0.apply(this, arguments); };
    RB.interlude.clear = function () { log.push({ t: 'clear' }); return clear0.apply(this, arguments); };
    const say0 = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (line) { log.push({ t: 'say', en: line && line.en, who: line && line.who, stage: (RB.interlude.state() || {}).stage || null }); return say0.apply(this, arguments); };
    const cue0 = RB.staging.cue, pose0 = RB.staging.pose;
    const who = (ref) => (typeof ref === 'string' ? ref : ref === W.comp ? 'comp' : ref === W.player ? 'pc' : '?');
    RB.staging.cue = function (ref, g) { log.push({ t: 'cue', who: who(ref), g }); return cue0.apply(this, arguments); };
    RB.staging.pose = function (ref, g) { log.push({ t: 'pose', who: who(ref), g }); return pose0.apply(this, arguments); };
    // the battle as the script starts it; won by the automated player (RB.test, as the Ch5 story run wins it)
    const sb = RB.game.startBattle;
    RB.game.startBattle = async function (id, opts) {
      log.push({ t: 'battle', id, opts: JSON.parse(JSON.stringify(opts || {})), picture: RB.interlude.state() && RB.interlude.state().stage });
      RB.test.enable({ battle: 'unravel' });
      try { const r = await sb.apply(this, arguments); log.push({ t: 'won', r }); return r; } finally { RB.test.disable(); }
    };
    window.__done = false; window.__err = null;
    RB.script.run('lf.boss_intro').then(() => { window.__done = true; }, (e) => { window.__err = String(e); window.__done = true; });
    return before;
  }, [FL, comp, reduce, o || {}]);
}
const nextLine = (p, last) => p.waitForFunction((last) => { const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown(); if (l && RB.ui.dialogue.isOpen() && (l.en || '') !== last) return l.en; return window.__done ? '__done' : false; }, last, { timeout: 60000, polling: 50 }).then((h) => h.jsonValue(), () => '__timeout');
// the picture's probe against the dialogue sheet as the page lays it out (CSS px), and the colour on screen at the
// keeper's sluice plate, over the swell and on the open water beside it (to its right, away from your lamp); at the
// plate also the brightest brass within 2 px of it (plateNear): the keeper's idle frames move it by a pixel or two, and
// on one of them the point itself is on the plate's shaded rim (85,55,32: still the plate, just too dark for brass)
const measure = (p) => p.evaluate(() => {
  const A = RB.interlude.ART && RB.interlude.ART.lf_keeper, pr = A && A.probe ? A.probe() : null;
  const cv = document.getElementById('world'), cr = cv.getBoundingClientRect(), dlg = document.querySelector('#ui > .dlg:not(.hidden)');
  if (!pr || !dlg) return { pr: null, sheet: dlg ? dlg.getBoundingClientRect().top : null };
  const k = cr.height / pr.h, kx = cv.width / pr.w, ky = cv.height / pr.h, g = cv.getContext('2d');
  const at = (x, y) => { const d = g.getImageData(Math.round(x * kx) - 1, Math.round(y * ky) - 1, 3, 3).data; let r = 0, gg = 0, bb = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; } return [r / 9, gg / 9, bb / 9].map(Math.round); };
  const near = (x, y, R) => { let m = null; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const d = g.getImageData(Math.round((x + dx) * kx), Math.round((y + dy) * ky), 1, 1).data; if (d[0] - d[2] > 40 && (!m || d[0] > m[0])) m = [d[0], d[1], d[2]]; } return m; };
  return { pr, sheet: dlg.getBoundingClientRect().top, css: { keeperTop: cr.top + pr.keeper.y * k, water: cr.top + pr.water * k, swellTop: cr.top + pr.swell.y * k, bellTop: cr.top + pr.bell.y * k, canvasTop: cr.top },
    plate: at(pr.plate[0], pr.plate[1]), plateNear: near(pr.plate[0], pr.plate[1], 2), swell: at(pr.swell.x + pr.swell.w / 2, pr.water - Math.round(pr.swell.h * 0.45)), open: at(Math.min(pr.w - 6, pr.swell.x + pr.swell.w + 14), pr.water - Math.round(pr.swell.h * 0.45)) };
});
const brass = (c) => !!c && c[0] > 90 && c[0] - c[2] > 40;
const lum = (c) => (c ? c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 : 0);
const frameOf = (p) => p.evaluate(() => document.getElementById('world').toDataURL());

// the whole scene for one companion; returns what it saw
async function play(p, comp, reduce, o) {
  o = o || {};
  const before = await begin(p, comp, reduce, o);
  let last = '', i = 0;
  const lines = [], probes = {};
  let still = null;
  for (; i < 30; i++) {
    const l = await nextLine(p, last);
    if (l === '__done' || l === '__timeout') break;
    last = l;
    const want = (WANT.find(([re]) => re.test(l)) || [null, null])[1];
    // (each one-time action has played out: the swell up, the keeper risen, the legs gone under, the pipes fallen)
    await p.waitForTimeout(o.noPictures ? 60 : want === 'rise' || want === 'apart' ? 3100 : 1900);
    const st = await p.evaluate(() => { const s = RB.interlude.state(); return { stage: s && s.stage, override: !!RB.render.getOverride(), fade: !!document.querySelector('#overlay > .fade.on'), map: RB.world.W.map.id }; });
    lines.push({ en: l, want, stage: st.stage, override: st.override, fade: st.fade });
    if (!o.noPictures && (want === 'heave' || want === 'rise' || want === 'apart') && !probes[want]) probes[want] = await measure(p);
    if (!o.noPictures && st.stage === 'face' && still == null) {
      probes.face = await measure(p);
      const a = await frameOf(p); await p.waitForTimeout(900); const b2 = await frameOf(p);
      still = a === b2;
    }
    await p.evaluate(() => RB.ui.dialogue.advance(true));
  }
  await p.waitForFunction(() => window.__done, null, { timeout: 30000 }).catch(() => {});
  const after = await p.evaluate(() => {
    const s = RB.game.s, W = RB.world.W;
    const bellOn = (W.map.def.props || []).filter((pr) => pr.p === 'lf_bigbell' && (!pr.if || RB.state.test(s, pr.if)));
    const quests = Object.fromEntries(Object.entries(s.quests).map(([k, q]) => [k, { stage: q.stage, done: q.done }]));
    return {
      err: window.__err, log: window.__log, map: W.map.id, picture: RB.interlude.active(), override: !!RB.render.getOverride(), fade: !!document.querySelector('#overlay > .fade.on'),
      bell: bellOn.map((pr) => !!(pr.o && pr.o.rung)), done: !!s.flags.lf_boss_done,
      state: JSON.stringify({ flags: Object.keys(s.flags).filter((f) => !/^enter:|^named:|^trig:|^foe:/.test(f)).sort(), inv: s.inv, quests, vars: s.vars, notes: s.notebook.map((x) => x.id).sort(), comp: s.comp || null }),
    };
  });
  return { before, lines, probes, still, after };
}

const RUNS = [['nao', 1280, 800, false], ['mio', 390, 844, false], ['ren', 1280, 800, true], ['suzu', 390, 844, true]];
for (const [comp, W, H, reduce] of RUNS) {
  const tag = `${comp} ${W}×${H}${reduce ? ' reduced motion' : ''}`;
  const { p, ctx, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  const r = await play(p, comp, reduce);
  const L = r.after.log || [];
  // 1. before the water heaves: the map, its ordinary bell; on "heaves" the swell; on "Pipes twist together" the keeper
  ok(r.before.map === 'lf.bellhall' && !r.before.picture && !r.before.override && r.before.bell.length === 1 && r.before.bell[0] === false, `${tag}: before the water heaves, the chamber on the map with its ordinary bell and no picture (${JSON.stringify(r.before)})`);
  const firstShow = L.findIndex((e) => e.t === 'show'), firstSay = L.findIndex((e) => e.t === 'say');
  ok(firstShow >= 0 && firstSay > firstShow && L[firstShow].stage === 'heave' && L.slice(0, firstShow).every((e) => e.t !== 'say'), `${tag}: no picture before the scene's first line; the swell comes up with "heaves" (first picture ${firstShow >= 0 ? L[firstShow].stage : 'none'})`);
  const wrong = r.lines.filter((x) => x.want && x.stage !== x.want).map((x) => `"${x.en.slice(0, 32)}": ${x.stage} (want ${x.want})`);
  ok(r.lines.filter((x) => x.want).length === 5 && !wrong.length, `${tag}: each line it tells over its picture${wrong.length ? ' — ' + wrong.join('; ') : ''}`);
  const iBattle = L.findIndex((e) => e.t === 'battle');
  const compBefore = L.filter((e, j) => e.t === 'say' && j < iBattle && !WANT.some(([re]) => re.test(e.en || '')));
  ok(compBefore.length === 1 && compBefore[0].stage === 'face', `${tag}: your companion's answer to it is said over the keeper (${compBefore.map((e) => e.stage || 'map').join(',') || 'no line'})`);
  const P = r.probes;
  const sw = P.heave, kp = P.rise, kf = P.face;
  ok(!!(sw && sw.pr) && sw.css.swellTop < sw.sheet && sw.css.water <= sw.sheet + 0.5 && lum(sw.swell) > lum(sw.open) + 6 && !brass(sw.plate) && !brass(sw.plateNear), `${tag}: on "heaves" the water swells in front of the bell, above the sheet, no keeper yet${sw && sw.pr ? ` (water ${Math.round(sw.css.water)} / sheet ${Math.round(sw.sheet)}; swell ${sw.swell} vs open water ${sw.open})` : ' (no picture)'}`);
  for (const [nm, m] of [['"Pipes twist together"', kp], ['your companion\'s answer', kf]]) {
    ok(!!(m && m.pr) && brass(m.plateNear) && m.css.keeperTop >= m.css.canvasTop - 0.5 && m.css.water <= m.sheet + 0.5, `${tag}: on ${nm} the keeper stands in the water, its sluice plate on screen, crown to water above the dialogue sheet${m && m.pr ? ` (keeper ${Math.round(m.css.keeperTop)}–${Math.round(m.css.water)}, sheet ${Math.round(m.sheet)}, plate ${m.plate}, brightest within 2 px ${m.plateNear})` : ' (no picture)'}`);
  }
  // 2. the battle as before; the aftermath; the chamber again
  const bt = L[iBattle];
  ok(!!bt && bt.id === 'lf.keeper' && bt.opts.noFlee === true && bt.opts.inScript === true && L.some((e) => e.t === 'won' && e.r === 'win'), `${tag}: the battle starts as before (${bt ? bt.id + ' noFlee ' + bt.opts.noFlee : 'none'}) and is won`);
  ok(!!bt && bt.picture === 'face', `${tag}: the picture is still up as the battle begins (its fade takes the screen from it): ${bt && bt.picture}`);
  const ap = P.apart;
  ok(!!(ap && ap.pr) && ap.css.water <= ap.sheet + 0.5, `${tag}: after the battle, the keeper coming apart in the water before the bell, above the sheet`);
  const tail = r.lines.slice(r.lines.findIndex((x) => x.want === 'loosen') + 1);
  ok(tail.length >= 1 && tail.every((x) => !x.stage && !x.override && !x.fade), `${tag}: after the pipes fall, the chamber again on the map for your companion's word (${tail.map((x) => (x.stage || 'map') + (x.fade ? '/dark' : '')).join(',') || 'no line'})`);
  ok(!r.after.err && r.after.done && r.after.map === 'lf.bellhall' && !r.after.picture && !r.after.override && !r.after.fade && r.after.bell.length === 1 && r.after.bell[0] === false, `${tag}: the scene ends on the chamber with its ordinary bell, no picture left, lf_boss_done set (${JSON.stringify({ err: r.after.err, done: r.after.done, map: r.after.map, picture: r.after.picture, bell: r.after.bell })})`);
  // 3. reduced motion: still; with motion: it moves
  ok(reduce ? r.still === true : r.still === false, `${tag}: ${reduce ? 'with Reduce motion the picture holds still (two moments alike)' : 'with motion the picture moves (two moments differ)'}`);
  // 4. the companion's own lines and gestures
  const cues = L.filter((e) => (e.t === 'cue' || e.t === 'pose') && e.who === 'comp').map((e) => e.g);
  const wantCues = { nao: ['point', 'nod'], mio: ['guard', 'observe'], ren: ['lampup', 'observe'], suzu: ['point', 'palm'] }[comp];
  ok(wantCues.every((g) => cues.includes(g)) && L.filter((e) => e.t === 'say' && (e.who === 'comp' || e.who === comp)).length === 2, `${tag}: ${comp}'s own two lines and gestures play (${cues.join(', ')})`);
  ok(!errors.length, `${tag}: no page errors${errors.length ? ' — ' + errors[0].slice(0, 140) : ''}`);
  ok(!requests.length, `${tag}: no network requests`);
  // the same scene with the pictures switched off ends in exactly the same state
  if (comp === 'nao') {
    const { p: p2, ctx: c2 } = await page(b, url, { viewport: { width: W, height: H } });
    const r2 = await play(p2, comp, reduce, { noPictures: true });
    ok(r2.after.state === r.after.state, `${tag}: the pictures change nothing: the same end state as with them switched off${r2.after.state === r.after.state ? '' : '\n      with    ' + r.after.state + '\n      without ' + r2.after.state}`);
    await c2.close();
  }
  await ctx.close();
}

// 5. a battle that takes the screen from the picture draws itself (the real battle screen, not the automated player),
// and a campaign change leaves no picture behind
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async (FL) => {
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    const s = RB.game.debugStart('lf.bellhall', 8, 5, { comp: 'nao', flags: FL, dir: 'down' });
    s.quests.lf_main = { stage: 7, done: false, t: 1 };
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 900));
    RB.script.run('lf.boss_intro');
  }, FL);
  let last = '';
  for (let i = 0; i < 6; i++) {
    const l = await nextLine(p, last);
    if (l === '__done' || l === '__timeout') break;
    last = l;
    await p.waitForTimeout(150);
    await p.evaluate(() => RB.ui.dialogue.advance(true));
    if (await p.evaluate(() => !!(RB.combat.state && RB.combat.state()))) break;
  }
  await p.waitForFunction(() => RB.combat.state && RB.combat.state() && RB.combat.phase() !== 'idle', null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(1200);
  const inB = await p.evaluate(() => ({ battle: !!(RB.combat.state && RB.combat.state()), enemy: RB.combat.context() && RB.combat.context().id, noFlee: !!(RB.combat.state() && RB.combat.state().noFlee), picture: RB.interlude.state() && RB.interlude.state().stage, drawn: RB.render.getOverride() ? RB.render.getOverride().toString().slice(0, 60) : null }));
  ok(inB.battle && inB.enemy === 'lf.keeper' && inB.noFlee, `the real battle screen: lf.keeper, no stepping back (${JSON.stringify({ battle: inB.battle, enemy: inB.enemy, noFlee: inB.noFlee })})`);
  // the battle's draw is its own: the picture's frame no longer draws (a frame of the picture would carry its stage)
  const drawsPicture = await p.evaluate(async () => {
    const A = RB.interlude.ART && RB.interlude.ART.lf_keeper; if (!A) return null;
    let n = 0; const d0 = A.draw; A.draw = function () { n++; return d0.apply(this, arguments); };
    await new Promise((r) => setTimeout(r, 500)); A.draw = d0; return n;
  });
  ok(drawsPicture === 0, `while the battle is up it draws itself, not the picture (${drawsPicture} picture frames drawn)`);
  await p.evaluate(() => RB.game.toTitle());
  await p.waitForTimeout(800);
  const t = await p.evaluate(() => ({ picture: RB.interlude.active(), state: RB.interlude.state() }));
  ok(!t.picture, `a campaign change (back to the title) leaves no picture behind (${JSON.stringify(t.state)})`);
  ok(!errors.length, `the battle hand-off: no page errors${errors.length ? ' — ' + errors[0].slice(0, 140) : ''}`);
  await ctx.close();
}

console.log(`\nkeeper_reveal: ${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
