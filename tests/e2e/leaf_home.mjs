// A leaf sent home from the Wind Stone is seen to go (RBN-QA-076; Agnes 6318288260, Local CL-114): each of Kotonoha's
// eight ko.sent_* scenes, as its line is read, lifts one written leaf off the stone and carries it away on the wind
// (east, or north for Snowbell, as its line says); with Reduce motion the leaf lies still on the stone while the line is
// read, and is gone after it. In Chromium on the built game, from a synthetic campaign of the shipped edition:
//  1. the scenes: each ko.sent_* has one `!beat leafhome.<way>` straight after its wind sound and one
//     `!beat leafhome.end` straight after its line, east but for Snowbell's north; no other scene has a leafhome beat
//     (the Wind Stone's own scene, its wrong answer and "Not now" included);
//  2. what a return does is unchanged, run by the scene itself: the leaf taken from you, its flag set, the count up by
//     one, the wind sound once, the toast, the scene back on the map;
//  3. in motion (Reduce motion off), at 1280×800 and at 390×844 on a phone: the leaf drawn on screen (gold where it was
//     drawn), starting at the stone's top, then higher and farther east (or, for Snowbell, higher with no more than its
//     sway sideways), fading at the end, and gone within 2 s, with nothing left drawn;
//  4. with Reduce motion: the leaf lies on the stone's top, the same place in every frame, while the line is read, and
//     is gone after it;
//  5. while Skip seen runs (the game's fast-forward), nothing is drawn; a load that changes the campaign during a
//     flight takes the leaf away;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/leaf_home.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const FLAGS = { departed: true, ko_arrived: true, ko_ch9: true, ch5_done: true, ko_otoha_met: true, ch4_done: true };
async function start(p, still, item) {
  await p.evaluate(async ({ still, item, FLAGS }) => {
    const s = RB.game.debugStart('ko.village', 25, 18, { comp: 'suzu', flags: FLAGS, dir: 'up', edition: RB.edition.forNew() });
    s.chapter = 9; s.quests.ko_main = { stage: 2, done: false, t: 1 };
    if (item) RB.state.give(s, item, 1);
    RB.game.settings.reducedMotion = !!still; RB.game.settings.textSpeed = 'instant'; RB.game.settings.questGuide = 'off';
    RB.game.applySettings();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    let last = '', same = 0;
    while (same < 3 && performance.now() - t0 < 30000) { await new Promise((r) => setTimeout(r, 100)); const k = RB.render.cam.x + ',' + RB.render.cam.y; same = k === last ? same + 1 : 0; last = k; }
  }, { still, item, FLAGS });
}
// where the leaf was last drawn, and how much of it is gold on screen there (the canvas is the buffer at a whole scale)
const look = (p) => p.evaluate(() => {
  const LH = RB.leafHome || { last: () => null, state: () => null }; // (absent before RBN-QA-076)
  const d = LH.last(), st = LH.state(), R = RB.render, cam = R.cam;
  const top = { x: Math.round((st ? st.x : 26) * R.TS * R.ART - cam.x * R.ART) - 9, y: Math.round((st ? st.y : 14) * R.TS * R.ART - cam.y * R.ART) + 1 };
  let gold = null;
  if (d) {
    const cv = document.getElementById('world'), g = cv.getContext('2d'), s = cv.width / Math.round(R.viewSize().w * R.ART);
    gold = 0;
    for (let y = d.y - 1; y <= d.y + 8; y++) for (let x = d.x - 1; x <= d.x + 19; x++) {
      const px = g.getImageData(Math.floor(x * s + s / 2), Math.floor(y * s + s / 2), 1, 1).data;
      if (px[0] - px[2] > 60 && px[0] > 140 && px[1] > 100) gold++;
    }
  }
  return { st, d, gold, top, dlg: RB.ui.dialogue.isOpen() };
});
async function runScene(p, id) {
  await p.evaluate((id) => {
    window.__done = false; window.__sfx = []; window.__toasts = [];
    const sfx = RB.audio.sfx; RB.audio.sfx = function (n, ...a) { window.__sfx.push(n); return sfx.call(this, n, ...a); };
    const toast = RB.ui.toast; RB.ui.toast = function (o, ...a) { window.__toasts.push(o && o.en); return toast.call(this, o, ...a); };
    RB.script.run(id).then(() => { window.__done = true; });
  }, id);
}
async function finish(p) {
  for (let i = 0; i < 60 && !(await p.evaluate(() => window.__done)); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(120); }
  return p.evaluate(() => window.__done);
}

// 1. the scenes
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(() => {
    const S = RB.content.scenes, out = {}, others = [];
    for (const id of Object.keys(S)) {
      const cmds = S[id].cmds || [], beats = cmds.map((c, i) => [c, i]).filter(([c]) => c.op === 'beat' && /^leafhome\./.test(c.args[0] || ''));
      if (/^ko\.sent_/.test(id)) {
        const iw = cmds.findIndex((c) => c.op === 'sfx' && c.args[0] === 'wind');
        const b0 = beats[0], b1 = beats[1];
        out[id] = { n: beats.length, way: b0 && b0[0].args[0], afterWind: !!b0 && b0[1] === iw + 1, lineThen: !!b0 && cmds[b0[1] + 1] && cmds[b0[1] + 1].op === 'say', end: !!b1 && b1[0].args[0] === 'leafhome.end' && b1[1] === b0[1] + 2, toast: !!b1 && cmds[b1[1] + 1] && cmds[b1[1] + 1].op === 'toast' };
      } else if (beats.length) others.push(id);
    }
    return { out, others };
  });
  const ids = Object.keys(r.out).sort();
  ok(ids.length === 8 && ids.every((id) => { const o = r.out[id]; return o.n === 2 && o.afterWind && o.lineThen && o.end && o.toast && o.way === (id === 'ko.sent_sb' ? 'leafhome.north' : 'leafhome.east'); }), `each of the eight ko.sent_* scenes: the leaf's beat straight after its wind sound, then its line, then the end beat, then its toast; east but for Snowbell's north (${JSON.stringify(r.out)})`);
  ok(!r.others.length, `no other scene has a leafhome beat, the Wind Stone's own (its wrong answer, "Not now") included (${JSON.stringify(r.others)})`);
  ok(!errors.length, `no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}

// 2, 3: in motion, at both sizes (Reedwake's leaf east; at the desktop size also Snowbell's north)
for (const [lay, opts] of [['desktop 1280×800', { viewport: { width: 1280, height: 800 } }], ['phone 390×844', { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 }]]) {
  const { p, errors } = await page(b, url, opts);
  if (opts.touch) await p.evaluate(() => { RB.game.settings.touch = 'on'; RB.game.applySettings(); });
  for (const [k, way] of lay.startsWith('desktop') ? [['rw', 'east'], ['sb', 'north']] : [['rw', 'east']]) {
    await start(p, false, 'ko_leaf_' + k);
    const before = await p.evaluate(() => ({ inv: RB.game.s.inv['ko_leaf_' + 'rw'] || 0, ret: (RB.game.s.vars || {}).ko_ret || 0 }));
    await runScene(p, 'ko.sent_' + k);
    const seen = [];
    for (let i = 0; i < 9; i++) { await p.waitForTimeout(i ? 180 : 60); seen.push(await look(p)); }
    const done = await finish(p);
    await p.waitForTimeout(700);
    const after = await look(p);
    const flow = await p.evaluate((k) => ({ inv: RB.game.s.inv['ko_leaf_' + k] || 0, flag: !!RB.game.s.flags['ko_ret_' + k], ret: (RB.game.s.vars || {}).ko_ret || 0, sfx: window.__sfx, toasts: window.__toasts, mode: RB.game.mode() }), k);
    const fl = seen.filter((s) => s.st && s.d && !s.st.still && s.d.alpha === 1 && s.d.flat);
    const first = seen.find((s) => s.d), mid = fl[Math.min(fl.length - 1, 3)];
    if (k === 'rw') ok(done && flow.inv === 0 && flow.flag && flow.ret === before.ret + 1 && flow.sfx.filter((n) => n === 'wind').length === 1 && flow.toasts.length === 1 && /Reedwake/.test(flow.toasts[0] || '') && flow.mode === 'world', `${lay}: what the return does is unchanged: the leaf taken, its flag set, the count ${before.ret} → ${flow.ret}, the wind once (${JSON.stringify(flow.sfx)}), the toast "${flow.toasts[0]}", back on the map (${flow.mode})`);
    ok(first && Math.abs(first.d.x - first.top.x) <= 3 && first.d.y <= first.top.y + 1 && first.d.y >= first.top.y - 12, `${lay} (${k}, ${way}): the leaf starts at the stone's top (first drawn at ${first && [first.d.x, first.d.y]}, the top ${first && [first.top.x, first.top.y]}, u ${first && first.d.u && first.d.u.toFixed(2)})`);
    ok(fl.length >= 3 && fl.every((s) => s.gold >= 12), `${lay} (${k}): the leaf on screen while it flies, gold where it is drawn (${fl.map((s) => s.gold).join(', ')} gold px at ${fl.map((s) => s.d.u.toFixed(2)).join(', ')})`);
    if (way === 'east') ok(mid && mid.d.y < first.d.y - 25 && mid.d.x > first.d.x + 20, `${lay} (${k}): higher and farther east as it goes (from ${first && [first.d.x, first.d.y]} to ${mid && [mid.d.x, mid.d.y]} at u ${mid && mid.d.u.toFixed(2)})`);
    else ok(mid && mid.d.y < first.d.y - 25 && mid.d.y >= 0 && Math.abs(mid.d.x - first.d.x) <= 8, `${lay} (${k}): higher, no farther sideways than its sway (from ${first && [first.d.x, first.d.y]} to ${mid && [mid.d.x, mid.d.y]})`);
    ok(seen.some((s) => s.d && s.d.alpha < 1) || seen[seen.length - 1].st === null, `${lay} (${k}): it fades at the end (alphas ${seen.map((s) => (s.d ? s.d.alpha.toFixed(2) : '-')).join(' ')})`);
    ok(after.st === null, `${lay} (${k}): gone within 2 s, nothing left drawn (${JSON.stringify(after.st)})`);
  }
  ok(!errors.length, `${lay}: no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}

// 4, 5: held still; Skip seen; a load mid-flight
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, true, 'ko_leaf_rw');
  await runScene(p, 'ko.sent_rw');
  const frames = [];
  for (let i = 0; i < 4; i++) { await p.waitForTimeout(i ? 250 : 120); frames.push(await look(p)); }
  const done = await finish(p);
  await p.waitForTimeout(400);
  const after = await look(p);
  const on = frames.filter((f) => f.st && f.st.still && f.dlg && f.d);
  ok(on.length === 4 && on.every((f) => f.d.x === on[0].d.x && f.d.y === on[0].d.y && f.gold >= 12) && Math.abs(on[0].d.x - on[0].top.x) <= 1 && Math.abs(on[0].d.y - on[0].top.y) <= 1, `with Reduce motion: the leaf lies on the stone's top, in the same place in every frame, while the line is read (${on.map((f) => [f.d.x, f.d.y, f.gold]).join(' | ')}; the top ${on[0] && [on[0].top.x, on[0].top.y]})`);
  ok(done && after.st === null, `with Reduce motion: gone after the line (${JSON.stringify(after.st)})`);
  // Skip seen: the game's fast-forward on, the scene run, nothing drawn
  await start(p, false, 'ko_leaf_sg');
  await p.evaluate(() => RB.game.setFastForward(true));
  await runScene(p, 'ko.sent_sg');
  await p.waitForTimeout(250);
  const ff = await look(p);
  await p.evaluate(() => RB.game.setFastForward(false));
  await finish(p);
  ok(ff.st === null && !ff.d, `while Skip seen runs, nothing drawn (${JSON.stringify(ff.st)}, last drawn ${JSON.stringify(ff.d)})`);
  // a load that changes the campaign mid-flight
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  await start(p, false, 'ko_leaf_mb');
  await runScene(p, 'ko.sent_mb');
  await p.waitForTimeout(250);
  const mid = await look(p);
  const res = await p.evaluate(async () => { try { return 'ok ' + (await RB.game.loadCampaign(1, 'manual')); } catch (e) { return 'failed ' + e.message; } });
  await p.waitForTimeout(300);
  const gone = await look(p);
  ok(mid.st && !mid.st.still && gone.st === null, `a load that changes the campaign mid-flight (${res}) takes the leaf away (before: ${JSON.stringify(mid.st)}; after: ${JSON.stringify(gone.st)})`);
  ok(!errors.length, `held still, Skip seen and the load: no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}

console.log(`\nleaf_home: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
