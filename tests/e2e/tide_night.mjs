// RBN-QA-089 (Agnes 6333258281; Local CL-165; Cloud CC-089): the Tide Calendar's end, the spring-tide night on the
// point, was told over the daytime tide pools though its own scene promised a picture. Now it has its pictures
// (`ko.tide_night`, src/ui/43k_seq_ko.js): the point under the full moon as the tide draws out, then the leaves rising.
// In Chromium on the built game, from the real trigger (the calendar stone in the tide pools, the ring whole, the next
// spring tide read; the language tasks are stand-ins that pass, not under test here):
//  1. read slowly: the first line under `point`, the wind's line and every line after it under `rise`, each shot's
//     action over and held while you read; every line of the scene in order, your companion's own; then the pictures
//     gone, the quest done once, ko_tide_night set, and the world exactly as before (the map, everyone's place, your
//     companion beside you, the daylight);
//  2. Reduce motion: the same lines and shots, each shot's picture held at once;
//  2b. the rising leaves, by their pixels (the world canvas, outside the far water's band where the moon's glints come
//     and go): the drawing held at the end of the lift is the same picture 1.5 s later; "Replay shot" (R) brings the
//     leaves back down to the flat and lifts them again, and the picture it settles to is the same held picture; with
//     Reduce motion the held picture is there at once and is that same composition; and the drawing itself, for one
//     moment of the lift, is the same however long the shot has been up (time in the shot is not what moves them);
//  3. the scene seen before (played once in this campaign) and passed over with the sequence's own "Skip scene": it
//     asks nothing, runs through, the pictures gone, the quest done once, ko_tide_night set, the world as before;
//  4. a resize in the middle (to an upright phone and back): the sequence goes on, its focus above the sheet;
//  5. a load in the middle: the pictures gone, nothing completed, the world as the save has it; played again, it
//     completes once;
//  6. a reload of the page in the middle, then that save loaded: the same;
//  7. the stone afterwards: no second night, no second completion;
//  8. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/tide_night.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FLAGS = ['ch1_done', 'ch2_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'departed', 'ko_ch9', 'ko_arrived', 'ko_otoha_met', 'ko_lowtide'];
const errorsAll = [];

async function setup(p, o) {
  await p.evaluate(([FLAGS, o]) => {
    const flags = {}; FLAGS.forEach((f) => (flags[f] = true));
    const s = RB.game.debugStart('ko.tidepools', 29, 4, { dir: 'up', edition: RB.edition.forNew(), comp: o.comp, flags });
    RB.state.setQuest(s, 'ko_tide', 2);
    if (o.seen) s.seen['ko.tide_night'] = true;
    const st = RB.game.settings;
    st.textSpeed = 'instant'; st.suzuSpeech = 'standard'; st.skipSeen = !!o.seen; st.reducedMotion = !!o.reduce;
    RB.game.applySettings && RB.game.applySettings();
    // the language tasks of the ring are stand-ins that pass (not under test here)
    RB.challenge.run = async () => ({ ok: true });
    RB.world.enter('ko.tidepools', 29, 4, 'up', { fresh: true });
    window.__quests = [];
    const toast = RB.ui.toast;
    RB.ui.toast = function (t) { if (t && /^quest_/.test(t.kind)) window.__quests.push(t.kind); return toast.apply(this, arguments); };
    RB.ui.toast.__w = true;
  }, [FLAGS, o]);
  await p.waitForTimeout(900);
}
const world = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s;
  return { map: W.map.id, pc: [W.player.x, W.player.y], comp: W.comp ? [W.comp.x, W.comp.y] : null,
    npcs: W.npcs.map((n) => n.id + '@' + n.x + ',' + n.y).sort().join(' '), tint: JSON.stringify((W.map.def.ambient || {}).tint || null),
    night: !!(RB.render.nightNow && RB.render.nightNow()), quest: s.quests.ko_tide ? (s.quests.ko_tide.done ? 'done' : s.quests.ko_tide.stage) : null, flag: !!s.flags.ko_tide_night };
});
const seqNow = () => { const q = RB.sequence.state(); return q ? { id: q.id, shot: q.shot, state: q.state } : null; };
// the scene from the stone, every line read for readMs; the sequence state at each line (on first sight and as read).
// A press while a shot's action is still playing finishes the action and leaves the line (the sequence system's rule),
// so a line still shown 500 ms after a press is pressed again; the presses are counted per line.
async function play(p, readMs, during) {
  await p.evaluate(() => RB.world.interact());
  const lines = [];
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate((sq) => ({ d: RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(), run: RB.script.isRunning(), seq: (0, eval)('(' + sq + ')')() }), seqNow.toString());
    if (st.d) {
      const key = (st.d.who || '') + ': ' + String(st.d.en || '').slice(0, 50);
      if (!lines.length || lines[lines.length - 1].d !== key) {
        lines.push({ d: key, who: st.d.who, seq: st.seq });
        if (during) { const stop = await during(lines.length - 1, lines[lines.length - 1]); if (stop) return { lines, stopped: true }; }
        await p.waitForTimeout(readMs);
        lines[lines.length - 1].after = await p.evaluate((sq) => (0, eval)('(' + sq + ')')(), seqNow.toString());
        await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
        lines[lines.length - 1].presses = 1; lines[lines.length - 1].at = Date.now();
      } else if (Date.now() - lines[lines.length - 1].at > 500) {
        await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
        lines[lines.length - 1].presses++; lines[lines.length - 1].at = Date.now();
      }
      await p.waitForTimeout(60);
      continue;
    }
    if (!st.run && lines.length) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(900);
  return { lines };
}
const shotOf = (L) => L.seq && L.seq.id === 'ko.tide_night' ? L.seq.shot : null;
const expectShots = (r) => {
  const sh = r.lines.map(shotOf);
  const wind = r.lines.findIndex((l) => /wind changes/.test(l.d));
  return { first: sh[0], wind, ok: sh[0] === 'point' && wind === 1 && sh.slice(1).every((x) => x === 'rise') };
};

// ---- 1. read slowly, each companion; 2. Reduce motion ------------------------------------------------------------
for (const [comp, reduce] of [['mio', false], ['nao', false], ['ren', false], ['suzu', false], ['mio', true]]) {
  const { p, errors } = await page(b, url);
  await setup(p, { comp, reduce });
  const before = await world(p);
  const r = await play(p, reduce ? 300 : 2700);
  const after = await world(p);
  const tag = comp + (reduce ? ', Reduce motion' : ', read slowly');
  const sh = expectShots(r);
  ok(sh.ok && r.lines.length >= 4, tag + ': the first line under the point at night, the wind\'s line and every line after it under the rising leaves (' + JSON.stringify(r.lines.map((l) => [l.d.slice(0, 24), shotOf(l)])) + ')');
  ok(r.lines.every((l) => !l.after || (l.after.id === 'ko.tide_night' && l.after.state === 'holding')), tag + ': each shot\'s action over and held while the line is read (' + JSON.stringify(r.lines.map((l) => l.after && l.after.state)) + ')');
  ok(r.lines.length === 4 && r.lines[2].who === 'ko_koyomi' && r.lines[3].who === comp, tag + ': Koyomi\'s line, then your companion\'s own (' + JSON.stringify(r.lines.map((l) => l.who)) + ')');
  ok(r.lines.every((l) => l.presses === 1), tag + ': each line read after its picture has settled goes on with one press (' + JSON.stringify(r.lines.map((l) => l.presses)) + ')');
  const q = await p.evaluate(() => ({ seq: RB.sequence.state(), quests: window.__quests.slice() }));
  ok(!q.seq && after.quest === 'done' && after.flag && q.quests.length === 1, tag + ': then the pictures gone, the quest done once, ko_tide_night set (' + JSON.stringify({ seq: q.seq, quest: after.quest, toasts: q.quests.length }) + ')');
  ok(after.map === before.map && after.npcs === before.npcs && after.tint === before.tint && after.night === before.night && JSON.stringify(after.pc) === JSON.stringify(before.pc) && after.comp && Math.abs(after.comp[0] - after.pc[0]) + Math.abs(after.comp[1] - after.pc[1]) <= 1,
    tag + ': the world exactly as before: the map, everyone\'s place, your companion beside you, the daylight (' + JSON.stringify({ before, after }) + ')');
  errorsAll.push(...errors); await p.close();
}

// ---- 2b. the rising leaves, by their pixels: held, Replay, Reduce motion ---------------------------------------------
// Frames of the world canvas are kept in the page; each comparison leaves out the far water's band (rows hz…far of the
// shot's own geometry, where the moon's glints come and go) and counts the leaves' gold in the sky above it.
const grab = (p, name) => p.evaluate((name) => {
  const w = document.getElementById('world'), c = document.createElement('canvas');
  c.width = w.width; c.height = w.height; c.getContext('2d').drawImage(w, 0, 0);
  const q = RB.sequence.state(), V = RB.seqKit.stage(q.wh[0], q.wh[1], q.vb).vb, ky = w.height / q.wh[1];
  const band = [Math.floor((Math.round(V * 0.36) - 1) * ky), Math.ceil((Math.round(V * 0.46) + 2) * ky)];
  window.__fr = window.__fr || {};
  window.__fr[name] = { d: c.getContext('2d').getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height, band, state: q.state, k: q.k, shot: q.shot };
  const F = window.__fr[name];
  let gold = 0;
  for (let y = 0; y < band[0]; y++) for (let x = 0; x < F.w; x++) { const i = (y * F.w + x) * 4, r = F.d[i], g = F.d[i + 1], bl = F.d[i + 2]; if (r > 150 && g > 110 && bl < 150 && r > bl + 50) gold++; }
  F.gold = gold;
  return { state: q.state, k: q.k, shot: q.shot, gold, band };
}, name);
const differ = (p, a, b) => p.evaluate(([a, b]) => {
  const A = window.__fr[a], B = window.__fr[b];
  if (!A || !B || A.w !== B.w || A.h !== B.h) return -1;
  let n = 0;
  for (let y = 0; y < A.h; y++) { if (y >= A.band[0] && y <= A.band[1]) continue; for (let x = 0; x < A.w; x++) { const i = (y * A.w + x) * 4; if (A.d[i] !== B.d[i] || A.d[i + 1] !== B.d[i + 1] || A.d[i + 2] !== B.d[i + 2]) n++; } }
  return n;
}, [a, b]);
const holding = (p) => p.waitForFunction(() => { const q = RB.sequence.state(); return q && q.shot === 'rise' && q.state === 'holding' && !q.replaying; }, null, { timeout: 8000 }).then(() => true).catch(() => false);
const heldPics = {};
for (const reduce of [false, true]) {
  const { p, errors } = await page(b, url);
  await setup(p, { comp: 'mio', reduce });
  const tag = reduce ? 'Reduce motion' : 'full motion';
  let res = null;
  await play(p, 300, async (i, L) => {
    if (i !== 2) return false; // Koyomi's line, under the risen leaves
    const h0 = await holding(p);
    const A = await grab(p, 'held');
    await p.waitForTimeout(1500);
    const B = await grab(p, 'later');
    await p.keyboard.press('KeyR');
    await p.waitForTimeout(reduce ? 200 : 120);
    const C = await grab(p, 'replay');
    const h1 = await holding(p);
    await p.waitForTimeout(200);
    const D = await grab(p, 'again');
    res = { h0, h1, A, B, C, D, hold: await differ(p, 'held', 'later'), early: await differ(p, 'held', 'replay'), settled: await differ(p, 'held', 'again') };
    heldPics[tag] = await p.evaluate(() => { const F = window.__fr.held; return { w: F.w, h: F.h, band: F.band, sum: Array.from(F.d.filter((v, i) => i % 4 !== 3 && (Math.floor(i / 4 / F.w) < F.band[0] || Math.floor(i / 4 / F.w) > F.band[1]))).reduce((s, v, i) => (s + v * ((i % 7) + 1)) % 1000000007, 0) }; });
    return false;
  });
  const sum = res && { h0: res.h0, h1: res.h1, gold: [res.A.gold, res.B.gold, res.C.gold, res.D.gold], k: [res.A.k, res.C.k], hold: res.hold, early: res.early, settled: res.settled };
  ok(res && res.h0 && res.A.gold >= 20 && res.hold === 0, tag + ': the leaves risen and the picture held: the same pixels 1.5 s later (' + JSON.stringify(sum) + ')');
  if (!reduce) ok(res && res.C.gold < res.A.gold * 0.5 && res.early > 0, tag + ': "Replay shot" brings the leaves back down to the flat (the sky\'s gold falls) and lifts them again (' + JSON.stringify(sum) + ')');
  ok(res && res.h1 && res.settled === 0 && res.D.gold === res.A.gold, tag + ': after Replay it settles to the same held picture (' + JSON.stringify(sum) + ')');
  errorsAll.push(...errors); await p.close();
}
ok(heldPics['full motion'] && heldPics['Reduce motion'] && heldPics['full motion'].sum === heldPics['Reduce motion'].sum, 'Reduce motion holds the same composition the lift ends in (' + JSON.stringify(heldPics) + ')');
// the drawing itself: one moment of the lift drawn with the shot up 3 s and up a minute is the same picture
{
  const { p, errors } = await page(b, url);
  const d = await p.evaluate(() => {
    const sd = RB.sequence.get('ko.tide_night').shots.rise, W = 640, H = 400, vb = Math.round(H * 0.64), out = {};
    const cast = { pc: RB.seqDev.PC, comp: { id: 'mio', look: RB.content.chars.mio.look } };
    const pic = (k, since) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      sd.draw(g, W, H, 5000, { seq: 'ko.tide_night', shot: 'rise', phase: 'lift', pi: 0, k, at: () => k, since, vb, still: false, review: false, hold: k >= 1, cast, test: () => false, t: 5000, sd });
      return g.getImageData(0, 0, W, H).data; };
    const n = (a, b) => { let x = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) x++; return x; };
    for (const k of [0.3, 1]) out[k] = n(pic(k, 3000), pic(k, 60000));
    out.lift = n(pic(0, 3000), pic(1, 3000));
    return out;
  });
  ok(d['0.3'] === 0 && d['1'] === 0 && d.lift > 0, 'the drawing at one moment of the lift is the same picture whether the shot has been up 3 s or a minute; the lift itself moves the leaves (' + JSON.stringify(d) + ')');
  errorsAll.push(...errors); await p.close();
}

// ---- 3. seen before, passed over with the sequence's own "Skip scene" ----------------------------------------------
{
  // (seen before: the night played through once in this campaign, its record of seen lines kept, then the ring's state
  // put back to before it, the one way to meet the scene a second time; inside a sequence the dialogue's "Skip seen"
  // gives way to the sequence's "Skip scene", src/styles/51_sequence.css)
  const { p, errors } = await page(b, url);
  await setup(p, { comp: 'ren' });
  await play(p, 50);
  const rec = await p.evaluate(() => { const s = RB.game.s; const r = s.seq && s.seq['ko.tide_night']; s.quests.ko_tide = { stage: 2, done: false, t: Date.now() }; delete s.flags.ko_tide_night; window.__quests = []; RB.world.W.player.dir = 'up'; return r ? { n: r.n, h: (r.h || []).length } : null; });
  const before = await world(p);
  await p.evaluate(() => RB.world.interact());
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() && !!document.querySelector('#ui .dlg .b-sskip'), null, { timeout: 8000 }).catch(() => {});
  const vis = await p.evaluate(() => { const k = document.querySelector('#ui .dlg .b-sskip'); return !!(k && k.offsetParent && !k.disabled); });
  if (vis) await p.click('#ui .dlg .b-sskip');
  await p.waitForTimeout(200);
  const asked = await p.evaluate(() => !!document.querySelector('.csheet button'));
  await p.waitForFunction(() => !RB.sequence.active() && !RB.script.isRunning(), null, { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(900);
  const a = await world(p), q = await p.evaluate(() => ({ seq: RB.sequence.state(), quests: window.__quests.slice(), n: RB.game.s.seq && RB.game.s.seq['ko.tide_night'] && RB.game.s.seq['ko.tide_night'].n }));
  ok(rec && rec.h > 0 && vis && !asked && !q.seq && a.quest === 'done' && a.flag && q.quests.length === 1 && a.map === before.map && a.npcs === before.npcs && JSON.stringify(a.pc) === JSON.stringify(before.pc),
    'seen before, passed over with "Skip scene": nothing asked, it runs through, the pictures gone, the quest done once, ko_tide_night set, the world as before (' + JSON.stringify({ rec, vis, asked, n: q.n, quest: a.quest, toasts: q.quests.length }) + ')');
  errorsAll.push(...errors); await p.close();
}

// ---- 4. a resize in the middle --------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, { comp: 'suzu' });
  const seen = [];
  const r = await play(p, 900, async (i, L) => {
    if (shotOf(L) !== 'rise' || seen.length) return false;
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(900);
    seen.push(await p.evaluate(() => ({ seq: RB.sequence.state() && RB.sequence.state().shot, f: RB.sequence.focus(), vb: RB.sequence.state() && RB.sequence.state().vb })));
    await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(900);
    seen.push(await p.evaluate(() => ({ seq: RB.sequence.state() && RB.sequence.state().shot, f: RB.sequence.focus(), vb: RB.sequence.state() && RB.sequence.state().vb })));
    return false;
  });
  const a = await world(p);
  ok(seen.length === 2 && seen.every((x) => x.seq === 'rise' && x.f && x.vb && x.f.y >= 0 && x.f.y + x.f.h <= x.vb + 1) && a.quest === 'done',
    'a resize to an upright phone and back in the middle: the sequence goes on, its focus above the sheet, then completes (' + JSON.stringify(seen) + ')');
  void r; errorsAll.push(...errors); await p.close();
}

// ---- 5. a load in the middle; 6. a reload of the page in the middle -----------------------------------------------
for (const how of ['load', 'reload']) {
  const { p, errors } = await page(b, url);
  await setup(p, { comp: 'nao' });
  await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); });
  const before = await world(p);
  const r = await play(p, 400, async (i, L) => {
    if (shotOf(L) !== 'rise') return false;
    if (how === 'reload') { await p.reload(); await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 }); await p.waitForTimeout(1500); }
    await p.evaluate(async () => { await RB.game.loadCampaign(4); });
    await p.waitForTimeout(1500);
    return true;
  });
  const mid = await p.evaluate(() => ({ seq: RB.sequence.state(), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen() }));
  const a = await world(p);
  ok(r.stopped && !mid.seq && !mid.run && !mid.dlg && a.quest === 2 && !a.flag && a.map === before.map && a.npcs === before.npcs,
    'a ' + how + ' in the middle: the pictures gone, nothing completed, the world as the save has it (' + JSON.stringify({ mid, quest: a.quest, flag: a.flag }) + ')');
  // played again from the stone: it completes once (the toasts are counted afresh after a reload)
  await p.evaluate(() => { RB.challenge.run = async () => ({ ok: true }); window.__quests = []; const toast = RB.ui.toast; if (!toast.__w) { RB.ui.toast = function (t) { if (t && /^quest_/.test(t.kind)) window.__quests.push(t.kind); return toast.apply(this, arguments); }; RB.ui.toast.__w = true; } RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard'; });
  await p.evaluate(() => { const W = RB.world.W; W.player.dir = 'up'; });
  const r2 = await play(p, 200);
  const b2 = await world(p), q = await p.evaluate(() => window.__quests.length);
  ok(expectShots(r2).ok && b2.quest === 'done' && b2.flag && q === 1, 'after the ' + how + ', played again: its pictures, then the quest done once (' + JSON.stringify({ shots: r2.lines.map(shotOf), quest: b2.quest, toasts: q }) + ')');
  errorsAll.push(...errors); await p.close();
}

// ---- 7. the stone afterwards ------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, { comp: 'mio' });
  await play(p, 100);
  await p.evaluate(() => { window.__quests = []; window.__began = 0; RB.bus.on && RB.bus.on('sequence:begin', () => { window.__began++; }); });
  const r = await play(p, 100);
  const a = await world(p), q = await p.evaluate(() => ({ began: window.__began, quests: window.__quests.length }));
  ok(a.quest === 'done' && !r.lines.some((l) => shotOf(l)) && q.quests === 0, 'the stone afterwards: no second night, no second completion (' + JSON.stringify({ lines: r.lines.map((l) => l.d.slice(0, 30)), began: q.began, toasts: q.quests }) + ')');
  errorsAll.push(...errors); await p.close();
}

ok(!errorsAll.length, 'no page errors ' + errorsAll.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
