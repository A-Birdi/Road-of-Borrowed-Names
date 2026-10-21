// Tetsu's boat between Saltglass and Kotonoha (RBN-QA-072), in the BUILT game, headless Chromium, synthetic campaigns
// of the shipped edition in fresh contexts (never a player's save):
//  1. out (ko.ferry_out, from Tetsu at Saltglass harbour): its two lines over the crossing's picture (the point and the
//     lighthouse falling behind; then the leaves on the open sea), each at its own moment, and no other line over it;
//     the picture gone, and the screen dark, when the shore is entered, and never drawn with the shore; the shore at
//     20,22 as before; on a first visit ko.first_sight follows (and ko.begin), on a later trip neither;
//  2. back (ko.ferry_back, the boat at the island's jetty): its prompt and choice as before, with no picture; on "go"
//     the evening moment on its line, then Saltglass harbour at 33,28 with nothing of the picture left; on "Not yet"
//     no picture at all and nothing changed (the place, the flags, the variables);
//  3. what each line names (the point and its lighthouse; the leaves on the water, the nearer ones the island's written
//     gold leaves with ink on them; the tree on the island and the sun) is above the dialogue sheet, measured in the
//     page, at 1280×800 and 390×844;
//  4. with reduced motion each moment holds still (two frames alike); with motion it lives (two frames differ);
//  5. the timing, with instant text and lines that move on by themselves, each scene reached as it always is (from
//     Tetsu's question, from the jetty's prompt): its lead-in (the choice → its line), lead-out (its last line → the
//     warp) and whole length from the choice (medians of 3), against what it had before (its 400 ms fade, then the
//     line; the warp at once after the last line); Skip seen runs ko.ferry_out through to the shore as before;
//  6. no page errors, no network requests.
// Usage: node tests/e2e/ko_crossing.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
// a twelve-chapter journey with Lanternfall over: Tetsu's board has the island's line (Saltglass's own arrival scenes
// and the letters from home already seen, so no other scene starts at the harbour)
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_called: true, sg_arrived: true, sg_harbor_seen: true, lq_letters: true };
const LATER = Object.assign({ ko_arrived: true, ko_ch9: true }, FL);
const OUT = [/^The boat clears the lighthouse/, /^Past noon, gold leaves/], BACK = /^The boat heads east/;
const SIGHT = /^Beyond the sand stands a tree/, NAMI = /^You came\. I'm Nami/;
// the first sight's two view lines, over its own picture of the island (ko_first_sight, RBN-QA-073), not the crossing's
const SIGHT_VIEW = [SIGHT, /^Leaves are falling like snow/];

async function start(p, o) {
  await p.evaluate(async (o) => {
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.game.debugStart(o.map, o.at[0], o.at[1], { edition: RB.edition.forNew(), comp: o.comp || 'nao', flags: o.flags, dir: o.dir || 'down' });
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 800 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    // every entry into a map, and whether the picture was still up then and the screen dark; every frame the
    // picture is up over a map other than the one the scene began on (window.__from, set as each scene starts)
    window.__enters = []; window.__over = []; window.__from = W.map.id;
    const enter0 = RB.world.enter;
    RB.world.enter = function (id, x, y, dir) { window.__enters.push({ map: id, at: [x, y], dir, pic: RB.interlude.active(), dark: !!document.querySelector('#overlay > .fade.on') }); return enter0.apply(this, arguments); };
    // (the crossing's picture over a place it isn't: the first sight's own picture on the shore is not it, RBN-QA-073)
    (function tick() { const st = RB.interlude.state(); if (st && st.id === 'ko_crossing' && W.map && W.map.id !== window.__from && window.__over.length < 5) window.__over.push(W.map.id); requestAnimationFrame(tick); })();
  }, o);
}
// the dialogue sheet's top, measured in the page, as a row of the art buffer; and the picture's own idea of things
const sheet = (p) => p.evaluate(() => {
  const cv = document.getElementById('world'), box = document.querySelector('#ui > .dlg:not(.hidden)'), A = RB.interlude.ART.ko_crossing, pr = A && A.probe();
  if (!cv || !box || !pr) return { pr };
  const a = cv.getBoundingClientRect(), r = box.getBoundingClientRect();
  // the nearer leaves on the water, read from the canvas: in each one's box the pixels of the written leaf's gold and
  // of its ink (src/ui/42g_interlude_firstsight.js goldLeaf)
  const g = cv.getContext('2d'), kx = cv.width / pr.w, ky = cv.height / pr.h;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const GOLD = ['#a8822e', '#d0a844', '#e8c868'].map(rgb), INK = rgb('#2a2434');
  const near = (d, i, c) => Math.abs(d[i] - c[0]) <= 14 && Math.abs(d[i + 1] - c[1]) <= 14 && Math.abs(d[i + 2] - c[2]) <= 14;
  const read = (pr.leaves && pr.leaves.near || []).map(({ box, len }) => {
    const X0 = Math.floor(box[0] * kx), Y0 = Math.floor(box[1] * ky), W = Math.max(1, Math.ceil((box[2] + 1) * kx) - X0), H = Math.max(1, Math.ceil((box[3] + 1) * ky) - Y0);
    const d = g.getImageData(X0, Y0, W, H).data;
    let gold = 0, ink = 0;
    for (let y = box[1]; y <= box[3]; y++) for (let x = box[0]; x <= box[2]; x++) {
      const i = ((Math.floor((y + 0.5) * ky) - Y0) * W + (Math.floor((x + 0.5) * kx) - X0)) * 4;
      if (GOLD.some((c) => near(d, i, c))) gold++; else if (near(d, i, INK)) ink++;
    }
    return { len, gold, ink, box };
  });
  return { row: ((r.top - a.top) / a.height) * pr.h, pr, nearRead: read };
});
const frame = (p) => p.evaluate(() => document.getElementById('world').toDataURL());
// Reads a scene through: each line (what was showing once it had settled), each choice (answered by plan.choose)
async function drive(p, plan) {
  const seen = [];
  let last = '';
  for (let i = 0; i < 60; i++) {
    const s = await p.waitForFunction((last) => {
      const ch = document.querySelector('#ui .choices:not(.hidden)');
      if (ch && ch.querySelector('.choice')) return { choice: [...ch.querySelectorAll('.choice')].map((e) => e.textContent) };
      const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown();
      if (l && RB.ui.dialogue.isOpen() && (l.en || '') !== last) return { en: l.en };
      return !RB.script.isRunning() ? { done: true } : false;
    }, last, { timeout: 60000, polling: 50 }).then((h) => h.jsonValue(), () => ({ timeout: true }));
    if (s.done || s.timeout) break;
    if (s.choice) {
      const k = plan.choose(s.choice);
      seen.push({ choice: s.choice, picked: k, pic: await p.evaluate(() => RB.interlude.state()) });
      await p.evaluate((k) => document.querySelectorAll('#ui .choices:not(.hidden) .choice')[k].click(), k);
      await p.waitForTimeout(200);
      continue; // (the line asked over stays up until the next one: it is not read again)
    }
    last = s.en;
    await p.waitForTimeout(1000); // (the picture brings itself up from the dark in about half a second)
    const rec = Object.assign({ en: s.en }, await p.evaluate(() => ({ pic: RB.interlude.state(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], dark: !!document.querySelector('#overlay > .fade.on') })));
    if (rec.pic && plan.onPicture) await plan.onPicture(rec);
    seen.push(rec);
    await p.evaluate(() => RB.ui.dialogue.advance(true));
  }
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 30000 }).catch(() => {});
  return seen;
}
// a picture line's checks: the stage it should be at, laid out above the sheet with what the line names above it
function checkAbove(tag, stg, pr) {
  const P = pr && pr.pr;
  if (!P || pr.row == null) { ok(false, `${tag}: ${stg}: the picture's layout and the sheet could be read`); return; }
  const top = Math.min(pr.row, P.vb), w = P.w;
  ok(P.vb <= pr.row + 1, `${tag}: ${stg}: the picture lays out above the sheet it measured (vb ${P.vb}, sheet at row ${pr.row.toFixed(1)} of ${P.h})`);
  if (stg === 'out') {
    ok(P.point.top > 0 && P.point.bottom < Math.min(top, P.stern.top) && P.point.lighthouseX > w * 0.1 && P.point.lighthouseX < w * 0.9,
      `${tag}: out: the point and its lighthouse in view above the boat and the sheet (rows ${P.point.top}–${P.point.bottom}, lighthouse at x ${P.point.lighthouseX} of ${w}; the stern from row ${P.stern.top}, sheet ${top.toFixed(0)})`);
    ok(P.stern.top < top, `${tag}: out: the stern's rail above the sheet (row ${P.stern.top})`);
  } else if (stg === 'leaves') {
    ok(P.leaves.n === 14 && P.leaves.top > P.yH && P.leaves.bottom < top && P.leaves.inView >= 10,
      `${tag}: leaves: the leaves on the water between the horizon and the sheet (${P.leaves.inView} of ${P.leaves.n} in view, rows ${P.leaves.top}–${P.leaves.bottom}, horizon ${P.yH}, sheet ${top.toFixed(0)})`);
    ok(P.bow.top < top, `${tag}: leaves: the bow's stem above the sheet (row ${P.bow.top})`);
    // the nearer ones are the island's written leaves: gold, with ink on them (as its first sight draws them)
    const nr = pr.nearRead || [], written = nr.filter((l) => l.gold >= 12 && l.ink >= 2);
    ok(nr.length >= 3 && written.length >= Math.ceil(nr.length * 0.75) && nr.every((l) => l.box[3] < top),
      `${tag}: leaves: the nearer leaves are written gold leaves (${written.length} of ${nr.length} gold with ink: ${nr.map((l) => `${l.len}px gold ${l.gold} ink ${l.ink}`).join('; ')})`);
  } else {
    ok(P.tree.top > 0 && P.tree.base < top && P.tree.left >= 0 && P.tree.right <= w,
      `${tag}: back: the great tree on the island whole, above the sheet (rows ${P.tree.top}–${P.tree.base}, x ${P.tree.left}–${P.tree.right} of ${w}; sheet ${top.toFixed(0)})`);
    ok(P.sun.y + P.sun.r < top && P.sun.x - P.sun.r >= 0 && P.sun.x + P.sun.r <= w, `${tag}: back: the evening sun in view above the sheet (${P.sun.x},${P.sun.y} r ${P.sun.r})`);
  }
}
const pick = (re) => (opts) => Math.max(0, opts.findIndex((t) => re.test(t)));

// ---- 1–4: the crossing out on a first visit and back, at both sizes, with and without motion -------------------
for (const [comp, W, H, reduce] of [['nao', 1280, 800, false], ['mio', 390, 844, true], ['ren', 390, 844, false], ['suzu', 1280, 800, true]]) {
  const tag = `${comp} ${W}×${H}${reduce ? ' reduced motion' : ''}`;
  const { p, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  await start(p, { map: 'sg.harbor', at: [34, 28], comp, reduce, flags: FL });
  const frames = {};
  const onPicture = async (rec) => {
    if (rec.pic.id !== 'ko_crossing') return; // (the first sight's own picture: tests/e2e/ko_first_sight.mjs)
    const stg = rec.pic.stage;
    checkAbove(tag, stg, await sheet(p));
    const a = await frame(p); await p.waitForTimeout(900); frames[stg] = a === await frame(p);
  };
  // out, from Tetsu: his lines and the choice, "We'll go", then the crossing and the shore
  await p.evaluate(() => { RB.script.run('ko.ferry_tetsu', { npc: 'tetsu' }); });
  const out = await drive(p, { choose: pick(/go to Kotonoha/), onPicture });
  const lines = out.filter((r) => r.en), wrong = [];
  for (const r of lines) {
    const want = OUT[0].test(r.en) ? 'out' : OUT[1].test(r.en) ? 'leaves' : SIGHT_VIEW.some((re) => re.test(r.en)) ? 'ko_first_sight' : null;
    const got = r.pic && r.pic.id === 'ko_crossing' ? r.pic.stage : r.pic ? r.pic.id : null;
    if (got !== want || (want && r.dark)) wrong.push(`"${r.en.slice(0, 34)}": ${got || 'none'}${r.dark ? ' (dark)' : ''} (want ${want || 'none'})`);
  }
  const ch = out.find((r) => r.choice);
  ok(ch && !ch.pic && /go to Kotonoha/.test(ch.choice[ch.picked]), `${tag}: out: Tetsu's choice as before, no picture over it (${ch ? ch.choice.join(' / ') : '-'})`);
  ok(!wrong.length && lines.filter((r) => OUT.some((re) => re.test(r.en))).length === 2, `${tag}: out: its two lines over the picture at their moments (the point, then the leaves), every other line without it (but the first sight's own two, over its own picture)${wrong.length ? ' — ' + wrong.join('; ') : ''}`);
  const after = lines.filter((r) => !OUT.some((re) => re.test(r.en)) && r.map === 'ko.shore');
  const enters = await p.evaluate(() => window.__enters), over = await p.evaluate(() => window.__over);
  const shore = enters.find((e) => e.map === 'ko.shore');
  ok(shore && !shore.pic && shore.dark && shore.at.join() === '20,22' && shore.dir === 'up' && !over.length, `${tag}: out: the picture gone and the screen dark when the shore is entered (at ${shore && shore.at}, ${shore && shore.dir}); never up over the shore (${JSON.stringify(shore)}, ${over.join(',') || 'none'})`);
  ok(after.length && SIGHT.test(after[0].en) && after.every((r) => !r.pic || (r.pic.id === 'ko_first_sight' && SIGHT_VIEW.some((re) => re.test(r.en)))) && after.some((r) => NAMI.test(r.en)), `${tag}: out: first visit: ko.first_sight follows on the shore ("${after[0] ? after[0].en.slice(0, 32) : '-'}"), its view lines over its own picture, then ko.begin; nothing of the crossing's picture (${after.length} lines)`);
  const end1 = await p.evaluate(() => ({ pic: RB.interlude.active(), map: RB.world.W.map.id, arrived: RB.state.test(RB.game.s, 'ko_arrived'), ch9: RB.state.test(RB.game.s, 'ko_ch9') }));
  ok(!end1.pic && end1.map === 'ko.shore' && end1.arrived && end1.ch9, `${tag}: out: after it, on the shore, ko_arrived and ko_ch9 set, nothing of the picture left (${JSON.stringify(end1)})`);
  // back, from the jetty: the prompt, "Go back", the evening moment, Saltglass
  await p.evaluate(() => { window.__enters = []; window.__from = RB.world.W.map.id; RB.script.run('ko.ferry_back'); });
  const back = await drive(p, { choose: pick(/Go back to Saltglass/), onPicture });
  const bl = back.filter((r) => r.en), bc = back.find((r) => r.choice);
  ok(bl.length === 2 && /tied up at the jetty/.test(bl[0].en) && !bl[0].pic && bc && !bc.pic, `${tag}: back: the prompt and the choice as before, no picture over them (${bl.map((r) => r.en.slice(0, 24)).join(' | ')})`);
  ok(bl[1] && BACK.test(bl[1].en) && bl[1].pic && bl[1].pic.id === 'ko_crossing' && bl[1].pic.stage === 'back' && !bl[1].dark, `${tag}: back: its line over the evening moment (${bl[1] && JSON.stringify(bl[1].pic)})`);
  const be = await p.evaluate(() => ({ enters: window.__enters, over: window.__over, pic: RB.interlude.active(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], dir: RB.world.W.player.dir }));
  const harbor = be.enters.find((e) => e.map === 'sg.harbor');
  ok(harbor && !harbor.pic && harbor.dark && !be.over.length && !be.pic && be.map === 'sg.harbor' && be.at.join() === '33,28' && be.dir === 'up', `${tag}: back: the picture gone and the screen dark when the harbour is entered, never up over it; Saltglass at 33,28 facing up as before (${JSON.stringify({ harbor, over: be.over, map: be.map, at: be.at, dir: be.dir })})`);
  if (reduce) ok(frames.out && frames.leaves && frames.back, `${tag}: with reduced motion each moment holds still (two frames alike: ${JSON.stringify(frames)})`);
  else ok(frames.out === false && frames.leaves === false && frames.back === false, `${tag}: with motion each moment lives (two frames differ: ${JSON.stringify(frames)})`);
  ok(!errors.length, `${tag}: no page errors${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`);
  ok(!requests.length, `${tag}: no network requests`);
  await p.close();
}

// ---- 1: a later trip (the island reached before, Chapter 9 begun): the pictures, then the shore and nothing else --
{
  const tag = 'later trip 1280×800';
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.harbor', at: [34, 28], comp: 'ren', flags: LATER });
  await p.evaluate(() => { RB.script.run('ko.ferry_tetsu_again', { npc: 'tetsu' }); });
  const r = await drive(p, { choose: pick(/To Kotonoha/) });
  const lines = r.filter((x) => x.en), pics = lines.filter((x) => x.pic).map((x) => x.pic.stage);
  const end = await p.evaluate(() => ({ enters: window.__enters, pic: RB.interlude.active(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y] }));
  ok(pics.join() === 'out,leaves' && lines.filter((x) => OUT.some((re) => re.test(x.en))).length === 2, `${tag}: the two lines over the picture at their moments (${pics.join(', ')})`);
  ok(!lines.some((x) => SIGHT.test(x.en) || NAMI.test(x.en)) && end.map === 'ko.shore' && end.at.join() === '20,22' && !end.pic && end.enters.length === 1 && !end.enters[0].pic,
    `${tag}: no first sight and no Chapter 9 beginning; the shore at 20,22, nothing of the picture left (${lines.map((x) => x.en.slice(0, 18)).join(' | ')})`);
  ok(!errors.length, `${tag}: no page errors${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`);
  await p.close();
}

// ---- 2: "Not yet" at the jetty: no picture, nothing changes ---------------------------------------------------------
{
  const tag = '"Not yet" 1280×800';
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'ko.shore', at: [22, 21], comp: 'mio', flags: LATER, dir: 'down' });
  const before = await p.evaluate(() => JSON.stringify({ f: RB.game.s.flags, v: RB.game.s.vars, map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y] }));
  await p.evaluate(() => { window.__picEver = false; (function tick() { if (RB.interlude.active()) window.__picEver = true; requestAnimationFrame(tick); })(); });
  await p.evaluate(() => { RB.script.run('ko.ferry_back'); });
  const r = await drive(p, { choose: pick(/Not yet/) });
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => JSON.stringify({ f: RB.game.s.flags, v: RB.game.s.vars, map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y] }));
  const st = await p.evaluate(() => ({ ever: window.__picEver, enters: window.__enters.length, dark: !!document.querySelector('#overlay > .fade.on') }));
  ok(r.filter((x) => x.en).length === 1 && r.some((x) => x.choice && /Not yet/.test(x.choice[x.picked])), `${tag}: the prompt and the choice, "Not yet" taken (${r.map((x) => x.en ? x.en.slice(0, 24) : 'choice').join(' | ')})`);
  ok(!st.ever && !st.enters && !st.dark && before === after, `${tag}: no picture at any moment, no warp, no dark; the place, flags and variables unchanged (${JSON.stringify(st)})`);
  ok(!errors.length, `${tag}: no page errors${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`);
  await p.close();
}

// ---- 5: the timing, and Skip seen ------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.harbor', at: [34, 28], comp: 'nao', flags: LATER });
  const T = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const marks = [], say0 = RB.ui.dialogue.say, tr0 = RB.game.transition;
    RB.ui.dialogue.say = function () { marks.push(['line', performance.now()]); return say0.apply(this, arguments); };
    RB.game.transition = function () { marks.push(['warp', performance.now()]); return tr0.apply(this, arguments); };
    const runs = { outIn: [], outOut: [], outAll: [], backIn: [], backOut: [], backAll: [] };
    // (each scene as it is always reached: ko.ferry_out from Tetsu's "Where to?" and its choice, ko.ferry_back from the
    // jetty's prompt and its choice; it starts as the choice is taken)
    async function timed(id, ctx) {
      marks.length = 0;
      const ch0 = RB.ui.dialogue.choose; let tc = 0;
      RB.ui.dialogue.choose = function () { const r = ch0.apply(this, arguments); tc = performance.now(); return r; };
      await RB.script.run(id, ctx);
      RB.ui.dialogue.choose = ch0;
      const t1 = performance.now();
      while (RB.script.isRunning()) await sleep(5);
      const L = marks.filter((m) => m[0] === 'line').map((m) => m[1]), warp = (marks.find((m) => m[0] === 'warp') || [])[1];
      return { all: t1 - tc, lead: L[1] - tc, out: warp - L.filter((t) => t < warp).pop() };
    }
    for (let i = 0; i < 3; i++) {
      RB.test.enable({ choose: () => 0 }); // (lines move on 5 ms after they show; a choice takes its first reply)
      let m = await timed('ko.ferry_tetsu_again', { npc: 'tetsu' });
      runs.outIn.push(m.lead); runs.outOut.push(m.out); runs.outAll.push(m.all);
      await sleep(300);
      m = await timed('ko.ferry_back');
      runs.backIn.push(m.lead); runs.backOut.push(m.out); runs.backAll.push(m.all);
      RB.test.disable();
      await sleep(300);
    }
    RB.ui.dialogue.say = say0; RB.game.transition = tr0;
    const med = (a) => { const s = a.slice().sort((x, y) => x - y); return Math.round(s[s.length >> 1]); };
    const out = {};
    for (const [k, v] of Object.entries(runs)) out[k] = med(v);
    return out;
  });
  console.log('     timing (ms, medians of 3, instant text, lines moving on 5 ms after they show; from the choice): ' + JSON.stringify(T));
  // before: each scene's (first) line came 400 ms (its fade) after the choice, and the warp straight after its last line
  ok(T.outIn <= 400 + 60 && T.backIn <= 400 + 60, `timing: each scene's line comes as its own 400 ms fade ends, as before (lead-in from the choice: out ${T.outIn} ms, back ${T.backIn} ms)`);
  ok(T.outOut <= 100 && T.backOut <= 100, `timing: the warp follows the last line at once, as before (lead-out out ${T.outOut} ms, back ${T.backOut} ms: the line's own 5 ms and a frame or two)`);
  // Skip seen: the scenes seen before, Skip on the first line; the rest runs through to the shore
  const S = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    RB.game.settings.skipSeen = true; RB.game.s.seen['ko.ferry_out'] = true;
    RB.script.run('ko.ferry_out');
    for (let k = 0; k < 400 && !(RB.ui.dialogue.isOpen() && /lighthouse/.test((RB.ui.dialogue.shown() || {}).en || '')); k++) await sleep(5);
    const btn = document.querySelector('#ui > .dlg .b-skip'), shown = btn && !btn.classList.contains('hidden');
    const t0 = performance.now();
    btn.click();
    while (RB.script.isRunning() && performance.now() - t0 < 20000) await sleep(5);
    return { shown, ms: Math.round(performance.now() - t0), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], pic: RB.interlude.active(), ff: RB.game.fastForward() };
  });
  console.log('     Skip seen from the first line to the end of the scene: ' + S.ms + ' ms');
  ok(S.shown && !S.pic && S.map === 'ko.shore' && S.at.join() === '20,22' && S.ms < 2500, `Skip seen: offered on the seen scene's line, runs on to the shore at 20,22 with nothing of the picture left (${JSON.stringify(S)})`);
  ok(!errors.length, `timing: no page errors${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`);
  await p.close();
}

console.log(`\nko_crossing: ${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
