// Animated dialogue portraits in the built index.html (src/ui/21_portrait_anim.js, src/engine/35_portraits.js;
// docs/expressive/PORTRAITS.md), driven through the real dialogue (RB.ui.dialogue.say) on a debug map:
//   A. every companion, the player and every NPC with a portrait animates its idle: the dialogue starts the
//      loop; over 20 s of its timeline the blinks come on an irregular cadence (never every frame), the
//      frame changes stay few, a blink changes only the eye area, a breath or tilt moves the figure by one
//      pixel and nothing else; seven of them in real time (pixels change on the canvas, ≤ 8 paints a second)
//   B. every expression tag's lead-in cue plays once when the line appears, in order, then settles: the
//      settled frame is the expression's loop frame and the canvas holds still through the settle window
//   C. a fast reader: advancing early to the same speaker and tag neither restarts nor replays the cue;
//      advancing to another tag starts that cue at once and settles on it; fast-forward shows the still
//   D. Reduce motion: the still expression, painted once, no timer, identical to the still portrait
//   E. hidden: the dialogue closed, the tab hidden, the portrait off-screen — no timers run; resumes after
//   F. the player's portrait follows an equipment change while it is shown
//   G. 50 lines from 14 speakers with random tags: the frame and layer cache stays under its byte cap
//   H. the integer display scale at desktop, short landscape and phone sizes and device-pixel-ratios; the phone
//      layout's portrait never grows (the sheet is no taller than before)
//   I. a real scene (sa.kasane_meet, run by the script runner, advanced only by real clicks on Next): one cue,
//      then a calm loop; the cue ending never advances the line; furigana, word help, history and translation
//      keep working and do not restart the cue; losing focus or the tab and 15 s more of reading add no gesture;
//      a quick advance to another speaker leaves no stale cue or frame; a line shown again cues once per showing
// Usage: node tests/e2e/portrait_anim.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const TAGS = ['surprise', 'laugh', 'smile', 'smirk', 'think', 'worry', 'sad', 'closed', 'angry', 'shy', 'tired'];

async function setup(p, comp) {
  await p.evaluate((comp) => {
    RB.game.debugStart('rw.village', 22, 30, { comp });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = false;
    // one line in the real dialogue; the previous line (if any) is answered first
    window.__say = (who, expr) => {
      RB.ui.dialogue.advance(true);
      RB.ui.dialogue.say({ who, expr: expr || null, jp: 'テスト です 。', en: 'A test line.', sceneId: window.__scene || 'test.portraits' });
    };
    window.__cv = () => document.querySelector('.dlg .portrait');
    window.__snap = () => { const c = window.__cv(); return Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data); };
    window.__diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++; return n; };
    // the changed pixels' bounding box between two RGBA arrays (96×96)
    window.__box = (a, b) => { let x0 = 99, y0 = 99, x1 = -1, y1 = -1; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) { const x = (i / 4) % 96, y = Math.floor(i / 4 / 96); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return x1 < 0 ? null : [x0, y0, x1, y1]; };
    window.__frame = (sj, expr, fr) => { const c = document.createElement('canvas'); c.width = c.height = 96; RB.portraits.paintFrame(c, sj, expr, fr); return Array.from(c.getContext('2d').getImageData(0, 0, 96, 96).data); };
  }, comp);
  await wait(p, 200);
}

// ---- A. every speaking portrait has an idle loop ----------------------------------------------------------
{
  const { p, errors, requests } = await page(b, url);
  await setup(p, 'suzu');
  const r = await p.evaluate(() => {
    const ids = ['pc', ...Object.keys(RB.content.chars).filter((id) => id !== 'narr' && RB.portraits.subject(id))];
    const out = [];
    for (const id of ids) {
      window.__say(id, null);
      const st = RB.portraitAnim.state();
      const tl = RB.portraitAnim.timeline(id, null, { ms: 20000 });
      const fr = tl.frames;
      const blinks = [];
      fr.forEach((f, i) => { if (f.fr.lids === 'half' && (!i || !fr[i - 1].fr.lids) && fr[i + 1] && fr[i + 1].fr.lids === 'closed') blinks.push(f.t); }); // a squint is not a blink
      const gaps = blinks.slice(1).map((t, i) => t - blinks[i]);
      // the densest second of frame changes
      let dense = 0;
      for (let i = 0; i < fr.length; i++) { let n = 0; for (let j = i; j < fr.length && fr[j].t < fr[i].t + 1000; j++) n++; dense = Math.max(dense, n); }
      // pixels: each distinct idle frame against the rest frame
      const sj = RB.portraits.subject(id);
      const rest = window.__frame(sj, 'neutral', null);
      let maxDiff = 0, blinkOut = 0, kinds = new Set();
      const seen = new Set();
      for (const f of fr) {
        if (seen.has(f.k) || !f.k) continue;
        seen.add(f.k);
        const px = window.__frame(sj, 'neutral', f.fr);
        const n = window.__diff(rest, px);
        maxDiff = Math.max(maxDiff, n);
        for (const k in f.fr) kinds.add(k);
        // a blink (nothing else moving) changes the eyes only
        if (f.fr.lids && Object.keys(f.fr).length === 1) { const bx = window.__box(rest, px); if (bx && (bx[0] < 22 || bx[2] > 74 || bx[1] < 34 || bx[3] > 58)) blinkOut++; }
      }
      out.push({ id, animating: !!(st && st.animating && st.scheduled), changes: fr.length, blinks: blinks.length, minGap: gaps.length ? Math.min(...gaps.filter((g) => g > 600)) : null, doubles: gaps.filter((g) => g <= 600).length, dense, maxDiff, blinkOut, kinds: [...kinds].sort().join(',') });
    }
    return out;
  });
  const bad = (f) => r.filter(f).map((x) => x.id);
  assert(r.length >= 88, `${r.length} speaking portraits (the player and every character with portrait art)`);
  assert(!bad((x) => !x.animating).length, 'every one starts an idle loop when it speaks' + (bad((x) => !x.animating).length ? ': not ' + bad((x) => !x.animating) : ''));
  assert(!bad((x) => x.blinks < 2).length, 'every one blinks at least twice in 20 s' + (bad((x) => x.blinks < 2).length ? ': not ' + bad((x) => x.blinks < 2) : ''));
  assert(!bad((x) => x.blinks > 9).length, 'and never constantly (≤ 9 blinks in 20 s): ' + Math.max(...r.map((x) => x.blinks)) + ' at most');
  const gaps = r.map((x) => x.minGap).filter((g) => g != null);
  assert(Math.min(...gaps) >= 2000, `blinks on an irregular cadence: shortest gap between blinks ${Math.min(...gaps)} ms (a double blink aside: ${r.reduce((a, x) => a + x.doubles, 0)} in all)`);
  assert(!bad((x) => x.dense > 8).length, 'at most 8 frame changes in any second (busiest ' + Math.max(...r.map((x) => x.dense)) + ')' + (bad((x) => x.dense > 8).length ? ': ' + bad((x) => x.dense > 8) : ''));
  assert(!bad((x) => x.changes < 8).length, 'each loop changes its frame (breath, blink …) at least 8 times in 20 s' + (bad((x) => x.changes < 8).length ? ': ' + bad((x) => x.changes < 8) : ''));
  assert(!bad((x) => x.blinkOut).length, 'a blink changes only the eye area' + (bad((x) => x.blinkOut).length ? ': ' + bad((x) => x.blinkOut) : ''));
  assert(!bad((x) => x.maxDiff > 96 * 96 * 0.45 || x.maxDiff < 20).length, `each idle frame differs from the rest frame by 20 … 45 % of the pixels at most (largest ${Math.max(...r.map((x) => x.maxDiff))} of 9216, a one-pixel breath)`);
  console.log('     motions: ' + ['nao', 'mio', 'ren', 'suzu', 'pc', 'omi', 'wataru', 'tsuru', 'kasane', 'hoshino', 'hana', 'kanta', 'mochi', 'sa_clerk'].map((id) => { const x = r.find((y) => y.id === id); return id + ' {' + x.kinds + '} ' + x.blinks + ' blinks'; }).join('; '));
  // real time: the canvas itself changes, with few paints
  const live = [];
  for (const id of ['nao', 'mio', 'ren', 'suzu', 'pc', 'omi', 'kanta']) {
    await p.evaluate((id) => { RB.portraitAnim.resetStats(); window.__say(id, null); window.__shots = [window.__snap()]; }, id);
    for (let i = 0; i < 18; i++) { await wait(p, 250); await p.evaluate(() => window.__shots.push(window.__snap())); }
    live.push(await p.evaluate((id) => {
      const s = RB.portraitAnim.stats();
      const distinct = new Set(window.__shots.map((x) => x.join(','))).size;
      return { id, paints: s.paints, distinct, blink: s.log.some((l) => /closed/.test(l.k)), ms: s.paintMs / Math.max(1, s.paints), max: s.maxPaintMs };
    }, id));
  }
  for (const x of live) assert(x.distinct >= 2 && x.paints >= 3 && x.paints <= 8 * 4.6 && x.blink, `${x.id} in real time: ${x.paints} paints in 4.5 s, ${x.distinct} distinct canvases among 19 samples, a blink seen; ${x.ms.toFixed(2)} ms a paint (max ${x.max.toFixed(1)})`);
  assert(!errors.length && !requests.length, 'no page errors or network requests' + (errors.length ? ': ' + errors.slice(0, 3) : ''));
  await p.context().close();
}

// ---- B. lead-in cues once per line, then the loop ------------------------------------------------------------
const WHO = { surprise: 'kanta', laugh: 'suzu', smile: 'mio', smirk: 'nao', think: 'ren', worry: 'mio', sad: 'wataru', closed: 'kasane', angry: 'omi', shy: 'suzu', tired: 'fuki' };
{
  const { p, errors } = await page(b, url);
  await setup(p, 'nao');
  for (const tag of TAGS) {
    const who = WHO[tag];
    // timed inside the page from the moment the line is said: a snapshot just after the cue and one at the
    // end of the settle window (the loop holds still for 400 ms after a cue before blinks and breath resume)
    const r = await p.evaluate(async ({ who, tag }) => {
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      window.__say('narr', null); // a narrated line between: the next portrait is a fresh appearance
      window.__scene = 'test.cue.' + tag;
      const tl = RB.portraitAnim.timeline(who, tag, { ms: 4000, scene: window.__scene });
      RB.portraitAnim.resetStats();
      const t0 = performance.now();
      window.__say(who, tag);
      const atEnd = (t) => { let k = tl.frames[0].k; for (const f of tl.frames) if (f.t <= t) k = f.k; return k; };
      await sleep(Math.max(0, tl.cueEnd + 40 - (performance.now() - t0)));
      const a = window.__snap();
      await sleep(Math.max(0, tl.cueEnd + 360 - (performance.now() - t0)));
      const s = RB.portraitAnim.stats();
      return { beats: tl.frames.filter((f) => f.t < tl.cueEnd).map((f) => f.k), settled: atEnd(tl.cueEnd), cueEnd: tl.cueEnd, keys: s.log.map((l) => l.k), cues: s.cues, still: window.__diff(a, window.__snap()) };
    }, { who, tag });
    const want = r.beats.concat(r.beats[r.beats.length - 1] === r.settled ? [] : [r.settled]);
    let j = 0;
    for (const k of r.keys) { const at = want.indexOf(k, j); if (at >= 0) j = at + 1; else { j = -999; break; } }
    assert(r.cues === 1 && r.keys[0] === want[0] && j > 0 && r.keys[r.keys.length - 1] === r.settled && r.still === 0,
      `${tag} (${who}): the cue plays once — ${r.beats.length} beats in ${Math.round(r.cueEnd)} ms, ${r.keys.length} frames painted in order — then settles on the loop frame and holds (${r.still} px change in the settle window)` +
      (r.keys[r.keys.length - 1] !== r.settled ? ' [settled ' + r.keys[r.keys.length - 1] + ' want ' + r.settled + ']' : '') + (j <= 0 ? ' [order ' + JSON.stringify(r.keys) + ' vs ' + JSON.stringify(want) + ']' : ''));
  }
  assert(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3) : ''));

  // ---- C. a fast reader -------------------------------------------------------------------------------------
  const c = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const atEnd = (tl, t) => { let k = tl.frames[0].k; for (const f of tl.frames) if (f.t <= t) k = f.k; return k; };
    window.__say('narr', null);
    window.__scene = 'test.fast';
    const tl = RB.portraitAnim.timeline('suzu', 'laugh', { ms: 3000, scene: window.__scene });
    RB.portraitAnim.resetStats();
    const until = async (t0, ms) => sleep(Math.max(0, ms - (performance.now() - t0)));
    let t0 = performance.now();
    window.__say('suzu', 'laugh');
    await sleep(150);
    window.__say('suzu', 'laugh'); // advanced early: the same speaker and tag
    const st1 = RB.portraitAnim.state();
    await until(t0, tl.cueEnd + 150); // inside the settle window
    const s1 = RB.portraitAnim.stats();
    const first = s1.log.map((l) => l.k);
    const settledLaugh = RB.portraitAnim.state().key;
    // advanced early to another tag: its cue starts at once and settles
    const tl2 = RB.portraitAnim.timeline('suzu', 'sad', { ms: 3000, scene: window.__scene, prevTag: 'laugh' });
    RB.portraitAnim.resetStats();
    window.__say('suzu', 'laugh');
    await sleep(120);
    RB.portraitAnim.resetStats();
    t0 = performance.now();
    window.__say('suzu', 'sad');
    const atOnce = RB.portraitAnim.stats().log.map((l) => l.k);
    await until(t0, tl2.cueEnd + 150);
    const s2 = RB.portraitAnim.stats();
    // fast-forward (skip seen): the still expression, no cue and no timer
    RB.portraitAnim.resetStats();
    window.__scene = 'test.seen';
    RB.game.s.seen['test.seen'] = true; // skip-seen applies to a scene already seen
    RB.game.setFastForward(true);
    window.__say('nao', 'surprise');
    const ff = { st: RB.portraitAnim.state(), cues: RB.portraitAnim.stats().cues };
    RB.game.setFastForward(false);
    return { cues1: s1.cues, restart: first.filter((k) => k === tl.frames[0].k).length, settledLaugh, wantLaugh: atEnd(tl, tl.cueEnd + 150), st1cue: !!(st1 && st1.cue),
      cues2: s2.cues, atOnce, sadFirst: tl2.frames[0].k, sadSettled: s2.log[s2.log.length - 1].k, wantSad: atEnd(tl2, tl2.cueEnd + 150), ff };
  });
  assert(c.cues1 === 1 && c.restart === 1 && c.st1cue, `advancing early to the same tag keeps the cue running once (cues ${c.cues1}, first beat painted ${c.restart}×)`);
  assert(c.settledLaugh === c.wantLaugh, 'and it settles on the laugh loop frame');
  assert(c.cues2 === 1 && c.atOnce[0] === c.sadFirst && c.sadSettled === c.wantSad, `advancing early to another tag starts its cue at once (first frame ${JSON.stringify(c.atOnce[0])}) and settles on its loop (${JSON.stringify(c.sadSettled)})`);
  assert(c.ff.cues === 0 && c.ff.st && !c.ff.st.animating && !c.ff.st.scheduled, 'fast-forward shows the still expression: no cue, no timer');
  await p.context().close();
}

// ---- D. Reduce motion ------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, 'nao');
  const r = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    RB.game.settings.reducedMotion = true;
    RB.portraitAnim.resetStats();
    window.__say('nao', 'smirk');
    const st = RB.portraitAnim.state();
    const a = window.__snap();
    await sleep(2500);
    const same = window.__diff(a, window.__snap());
    const s = RB.portraitAnim.stats();
    const c = document.createElement('canvas'); c.width = c.height = 96; RB.portraits.draw(c, 'nao', 'smirk');
    const still = Array.from(c.getContext('2d').getImageData(0, 0, 96, 96).data);
    // switched on while a line is animating: the next frame change shows the still and stops
    RB.game.settings.reducedMotion = false;
    window.__say('mio', 'laugh');
    await sleep(200);
    RB.game.settings.reducedMotion = true;
    await sleep(1500);
    const st2 = RB.portraitAnim.state();
    const c2 = document.createElement('canvas'); c2.width = c2.height = 96; RB.portraits.draw(c2, 'mio', 'laugh');
    const d2 = window.__diff(window.__snap(), Array.from(c2.getContext('2d').getImageData(0, 0, 96, 96).data));
    RB.game.settings.reducedMotion = false;
    return { animating: st.animating, scheduled: st.scheduled, paints: s.paints, ticks: s.ticks, cues: s.cues, same, still: window.__diff(a, still), st2, d2 };
  });
  assert(!r.animating && !r.scheduled && r.paints === 1 && r.ticks === 0 && r.cues === 0, `Reduce motion: no loop, no cue, no timer — one paint (${r.paints}), ${r.ticks} timer ticks in 2.5 s`);
  assert(r.same === 0 && r.still === 0, `the portrait is the held expression, identical to the still portrait (${r.same} px change in 2.5 s, ${r.still} px from the still)`);
  assert(r.st2 && !r.st2.animating && !r.st2.scheduled && r.d2 === 0, 'turned on mid-line, the portrait drops to the still expression and stops');
  assert(!errors.length, 'no page errors');
  await p.context().close();
}

// ---- E. nothing runs while hidden ------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, 'mio');
  const ticks = () => p.evaluate(() => RB.portraitAnim.stats().ticks);
  // the dialogue closed
  await p.evaluate(() => { window.__say('mio', null); });
  await wait(p, 400);
  await p.evaluate(() => RB.ui.dialogue.hide());
  let t0 = await ticks(); await wait(p, 2000); let t1 = await ticks();
  const st = await p.evaluate(() => RB.portraitAnim.state());
  assert(st === null && t1 === t0, `the dialogue closed: no portrait state, ${t1 - t0} ticks in 2 s`);
  // the tab hidden
  await p.evaluate(() => { window.__say('suzu', null); });
  await wait(p, 300);
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  t0 = await ticks(); await wait(p, 2500); t1 = await ticks();
  const sch = await p.evaluate(() => RB.portraitAnim.state().scheduled);
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await wait(p, 2500);
  const t2 = await ticks();
  assert(t1 === t0 && !sch && t2 > t1, `the tab hidden: ${t1 - t0} ticks in 2.5 s and no timer; visible again: ${t2 - t1} ticks in 2.5 s`);
  // the portrait off-screen
  await p.evaluate(() => { document.querySelector('.dlg').style.transform = 'translate(-50%, 3000px)'; });
  await wait(p, 400);
  t0 = await ticks(); await wait(p, 2500); t1 = await ticks();
  await p.evaluate(() => { document.querySelector('.dlg').style.transform = ''; });
  await wait(p, 2500);
  const t3 = await ticks();
  assert(t1 === t0 && t3 > t1, `the portrait off-screen: ${t1 - t0} ticks in 2.5 s; back on screen: ${t3 - t1}`);
  assert(!errors.length, 'no page errors');

  // ---- F. the player's portrait follows the equipment ------------------------------------------------------------
  const f = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const s = RB.game.s;
    // the canvas against the frame the animation says it shows, drawn afresh for a subject
    const exact = (sj) => { const st = RB.portraitAnim.state(); return window.__diff(window.__snap(), window.__frame(sj, st.expr, st.fr)); };
    window.__say('pc', null);
    await sleep(100);
    const before = window.__snap();
    const sj0 = RB.portraits.subject('pc', RB.equip.look(s));
    const e0 = exact(sj0);
    RB.equip.equip(s, 'co_straw_hat');
    await sleep(60);
    const sj1 = RB.portraits.subject('pc', RB.equip.look(s));
    const st1 = RB.portraitAnim.state();
    const r1 = { diff: window.__diff(before, window.__snap()), boxTop: (window.__box(before, window.__snap()) || [])[1], newSubject: st1.subj === sj1.key && sj0.key !== sj1.key, exact: exact(sj1), animating: st1.animating && st1.scheduled };
    await sleep(1500);
    const later = exact(sj1);
    RB.equip.unequip(s, 'cosmetic');
    await sleep(60);
    return Object.assign(r1, { e0, later, back: exact(sj0), backSubject: RB.portraitAnim.state().subj === sj0.key });
  });
  assert(f.e0 === 0 && f.diff > 300 && f.newSubject && f.exact === 0, `equipping a hat while the player's line is shown repaints the portrait at once with the new look (${f.diff} px change, from row ${f.boxTop}; the canvas is exactly the new look's frame)`);
  assert(f.animating && f.later === 0, 'and it keeps animating with the new look');
  assert(f.backSubject && f.back === 0, 'taking it off brings the old look back');
  await p.context().close();
}

// ---- G. the cache stays bounded over a long conversation --------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, 'ren');
  const g = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const ids = ['ren', 'nao', 'mio', 'suzu', 'pc', 'omi', 'wataru', 'tsuru', 'kasane', 'hoshino', 'hana', 'kanta', 'genzo', 'co_tokiwa'];
    const tags = [null, 'surprise', 'laugh', 'smile', 'smirk', 'think', 'worry', 'sad', 'closed', 'angry', 'shy', 'tired'];
    const r = RB.util.rng(7);
    const cap = RB.portraits.cacheStats().cap;
    let over = 0, maxBytes = 0, maxEntries = 0;
    RB.portraitAnim.resetStats();
    for (let i = 0; i < 50; i++) {
      window.__scene = 'test.long.' + Math.floor(i / 10);
      window.__say(ids[Math.floor(r() * ids.length)], tags[Math.floor(r() * tags.length)]);
      await sleep(i % 5 === 0 ? 900 : 160);
      const c = RB.portraits.cacheStats();
      if (c.bytes > cap) over++;
      maxBytes = Math.max(maxBytes, c.bytes); maxEntries = Math.max(maxEntries, c.entries);
    }
    const s = RB.portraitAnim.stats();
    return { over, maxBytes, maxEntries, cap, evicted: s.cache.evicted, frames: s.cache.frames, layers: s.cache.layers, paints: s.paints, paintMs: s.paintMs, maxPaintMs: s.maxPaintMs, layerMs: s.cache.layerMs, heap: performance.memory ? performance.memory.usedJSHeapSize : null };
  });
  assert(g.over === 0 && g.maxBytes <= g.cap, `50 lines, 14 speakers: the cache peaked at ${(g.maxBytes / 1048576).toFixed(2)} MiB / ${(g.cap / 1048576).toFixed(0)} MiB, ${g.maxEntries} entries (${g.frames} frames and ${g.layers} layers drawn, ${g.evicted} evicted)`);
  console.log(`     paints: ${g.paints}, ${(g.paintMs / g.paints).toFixed(2)} ms average, ${g.maxPaintMs.toFixed(1)} ms the slowest (a new person's first frame); layer ms: ` + Object.entries(g.layerMs).map(([k, v]) => k + ' ' + v.toFixed(0)).join(', ') + (g.heap ? `; JS heap ${(g.heap / 1048576).toFixed(1)} MiB` : ''));
  // shrink the cap: it still holds
  const h = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    RB.portraits.setCacheCap(1024 * 1024);
    let over = 0;
    for (const id of ['ren', 'nao', 'mio', 'suzu', 'omi', 'wataru']) { window.__say(id, 'think'); await sleep(200); if (RB.portraits.cacheStats().bytes > 1024 * 1024) over++; }
    const c = RB.portraits.cacheStats();
    RB.portraits.setCacheCap(8 * 1024 * 1024);
    return { over, bytes: c.bytes, entries: c.entries };
  });
  assert(h.over === 0, `with a 1 MiB cap the cache stays at ${(h.bytes / 1048576).toFixed(2)} MiB (${h.entries} entries) and the portraits still draw`);
  assert(!errors.length, 'no page errors');
  await p.context().close();
}

// ---- I. a real line in a real scene, advanced by real clicks -------------------------------------------------------
{
  const { p, errors, requests } = await page(b, url);
  await p.evaluate(() => {
    RB.game.debugStart('sa.camp', 16, 17, { comp: 'nao' });
    RB.game.settings.textSpeed = 'normal';
    RB.game.settings.reducedMotion = false;
    RB.portraitAnim.resetStats();
    window.__err = null;
    RB.script.run('sa.kasane_meet').catch((e) => { window.__err = String(e); });
    window.__snap = () => { const c = document.querySelector('.dlg .portrait'); return Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data); };
    window.__diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++; return n; };
    window.__bare = () => { const out = []; for (const root of document.querySelectorAll('.dlg:not(.hidden) .txt')) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) { if (/[一-鿿]/.test(n.nodeValue) && !n.parentElement.closest('ruby, rt')) out.push(n.nodeValue.trim()); } } return out; };
  });
  const shown = () => p.evaluate(() => { const s = RB.ui.dialogue.shown(); return s ? { who: s.who, en: s.en } : null; });
  const stats = () => p.evaluate(() => { const s = RB.portraitAnim.stats(); return { cues: s.cues, paints: s.paints, log: s.log, st: RB.portraitAnim.state() }; });
  // Next by a real click until a line matches (the first click on a revealing line shows the rest of it)
  async function nextUntil(pred, max) {
    for (let i = 0; i < (max || 30); i++) {
      const s = await shown();
      if (s && pred(s)) return s;
      await p.click('.dlg .b-next');
      await wait(p, 260);
    }
    return null;
  }
  const first = await nextUntil((s) => s.who === 'kasane');
  const a0 = await stats();
  assert(first && /Welcome to the Still Archive/.test(first.en) && a0.cues === 1 && a0.st.cue && a0.st.cue.tag === 'tired', `the scene's first Kasane line [tired] opens with one cue (${a0.cues})`);
  await wait(p, 3000);
  const a1 = await stats(), s1 = await shown();
  assert(s1.en === first.en && a1.cues === 1 && a1.st.animating && a1.st.cue.t > a1.st.cue.end, 'the cue has ended and the line is still shown: the animation never advances it; the loop goes on');
  const fur = await p.evaluate(() => ({ ruby: document.querySelectorAll('.dlg:not(.hidden) .txt ruby').length, bare: window.__bare() }));
  assert(fur.ruby > 0 && !fur.bare.length, `furigana on every kanji of the line (${fur.ruby} readings)` + (fur.bare.length ? ' bare: ' + fur.bare : ''));
  // word help (on by default; switched on if not): open a word, close it
  if (await p.evaluate(() => document.querySelector('.dlg .b-words').getAttribute('aria-pressed') !== 'true')) { await p.click('.dlg .b-words'); await wait(p, 150); }
  await p.locator('.dlg .txt .jt >> nth=1').click();
  await wait(p, 300);
  const h = await p.evaluate(() => ({ help: !!document.querySelector('.help'), pressed: document.querySelector('.dlg .b-words').getAttribute('aria-pressed') }));
  await p.keyboard.press('Escape');
  await wait(p, 200);
  const h2 = await p.evaluate(() => !!document.querySelector('.help'));
  const s2 = await shown(), a2 = await stats();
  assert(h.help && h.pressed === 'true' && !h2 && s2.en === first.en && a2.cues === 1, 'word help opens on a word and closes; the line stays and the cue is not replayed');
  // history: open it with the History button, find the line, close it
  await p.click('.dlg .b-log');
  await p.waitForFunction(() => RB.ui.menu.isOpen(), null, { timeout: 5000 });
  await wait(p, 200);
  const hist = await p.evaluate((en) => document.body.textContent.includes(en.slice(0, 30)), first.en);
  await p.click('[data-folio-close]');
  await p.waitForFunction(() => !RB.ui.menu.isOpen(), null, { timeout: 5000 });
  await wait(p, 200);
  const s3 = await shown(), a3 = await stats();
  assert(hist && s3.en === first.en && a3.cues === 1 && a3.st.animating, 'the history lists the line and closes back to it; the portrait keeps its loop, no cue again');
  // the translation toggle (when offered)
  const trv = await p.evaluate(() => !document.querySelector('.dlg .b-tr').classList.contains('hidden'));
  if (trv) { await p.click('.dlg .b-tr'); await wait(p, 150); await p.click('.dlg .b-tr'); await wait(p, 150); }
  // losing focus and the tab
  await p.evaluate(() => { window.dispatchEvent(new Event('blur')); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await wait(p, 2000);
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  // long reading: 15 s more on the same line
  await p.evaluate(() => { window.__t0 = performance.now(); });
  await wait(p, 15000);
  const lr = await p.evaluate(() => {
    const s = RB.portraitAnim.stats();
    const ts = s.log.filter((l) => l.t >= window.__t0).map((l) => l.t);
    let dense = 0;
    for (let i = 0; i < ts.length; i++) { let n = 0; for (let j = i; j < ts.length && ts[j] < ts[i] + 1000; j++) n++; dense = Math.max(dense, n); }
    return { cues: s.cues, n: ts.length, dense, en: RB.ui.dialogue.shown().en, st: RB.portraitAnim.state() };
  });
  assert(lr.cues === 1 && lr.en === first.en && lr.st.animating && lr.dense <= 8 && lr.n <= 15 * 4, `${trv ? "translation toggled twice, " : ""}focus and the tab lost and back, then 15 s more of reading: still one cue, the same line, a calm loop (${lr.n} frame changes in 15 s, at most ${lr.dense} in any second)`);
  // Next by a real click: Kasane goes on without a tag (no cue)
  await p.click('.dlg .b-next');
  await wait(p, 260);
  const s4 = await shown(), a4 = await stats();
  assert(s4.who === 'kasane' && s4.en !== first.en && a4.cues === 1 && !a4.st.cue && a4.st.expr === 'neutral', 'one real click advances to her next line (no tag): no cue');
  // a quick advance from Nao's angry line to Kasane's next line
  const nao = await nextUntil((s) => s.who === 'nao');
  const an = await stats();
  await p.click('.dlg .b-next'); await wait(p, 40); await p.click('.dlg .b-next');
  await wait(p, 120);
  const after = await p.evaluate(() => ({ shown: RB.ui.dialogue.shown(), st: RB.portraitAnim.state(), log: RB.portraitAnim.stats().log }));
  const since = after.log.filter((l) => l.t > an.log[an.log.length - 1].t);
  const lastNao = since.map((l) => l.who).lastIndexOf('nao');
  const firstKasane = since.findIndex((l) => l.who === 'kasane');
  await wait(p, 1500);
  const exact = await p.evaluate(() => { const st = RB.portraitAnim.state(); const c = document.createElement('canvas'); c.width = c.height = 96; RB.portraits.paintFrame(c, RB.portraits.subject(st.who), st.expr, st.fr); const d = Array.from(c.getContext('2d').getImageData(0, 0, 96, 96).data); return { who: st.who, d: window.__diff(window.__snap(), d) }; });
  assert(nao && an.st.who === 'nao' && an.st.cue && an.st.cue.tag === 'angry' && after.shown.who === 'kasane' && after.st.who === 'kasane' && after.st.cue && after.st.cue.tag === 'tired' && (lastNao < 0 || lastNao < firstKasane) && exact.who === 'kasane' && exact.d === 0,
    'a quick advance from Nao [angry] to Kasane [tired]: her cue starts at once, no Nao frame is painted after hers, and 1.5 s later the canvas is exactly her loop frame');
  // the same line shown again (as on a replay): one cue per showing, never more while it is read
  const rep = await p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const l = RB.content.scenes['sa.kasane_meet'].cmds.find((c) => c.op === 'say' && c.who === 'kasane' && c.expr === 'surprise');
    const c0 = RB.portraitAnim.stats().cues;
    for (let i = 0; i < 4; i++) {
      RB.ui.dialogue.advance(true); RB.ui.dialogue.say({ who: 'narr', jp: 'テスト', en: 'A moment.' });
      RB.ui.dialogue.advance(true); RB.ui.dialogue.say({ who: l.who, expr: l.expr, jp: l.jp, en: l.en, sceneId: 'sa.kasane_meet' });
      await sleep(1600);
    }
    return { cues: RB.portraitAnim.stats().cues - c0 };
  });
  assert(rep.cues === 4, `a line shown four times (narration between) cues once per showing: ${rep.cues}`);
  const err = await p.evaluate(() => window.__err);
  assert(!errors.length && !requests.length && !err, 'no page errors, script errors or network requests' + (errors.length ? ': ' + errors.slice(0, 3) : '') + (err ? ' ' + err : ''));
  await p.context().close();
}

// ---- H. integer display scale ------------------------------------------------------------------------------------
for (const v of [
  { name: 'desktop 1280×800 @1 (kept: the owner chose 116 over 96)', viewport: { width: 1280, height: 800 }, dpr: 1, want: 116 },
  { name: 'desktop 1280×800 @2 (kept)', viewport: { width: 1280, height: 800 }, dpr: 2, want: 116 },
  { name: 'desktop 1280×800 @1.5', viewport: { width: 1280, height: 800 }, dpr: 1.5, want: 128 },
  { name: 'desktop 1280×800 @1.25 (kept)', viewport: { width: 1280, height: 800 }, dpr: 1.25, want: 116 },
  { name: 'short landscape 844×390 @3', viewport: { width: 844, height: 390 }, dpr: 3, want: 96 },
  { name: 'phone 390×844 @3', viewport: { width: 390, height: 844 }, dpr: 3, want: 64 },
  { name: 'phone 390×844 @2 (kept)', viewport: { width: 390, height: 844 }, dpr: 2, want: 64 },
  { name: 'phone 390×844 @1 (the phone layout never grows: kept)', viewport: { width: 390, height: 844 }, dpr: 1, want: 64 },
  { name: 'phone 412×915 @2.625 (kept)', viewport: { width: 412, height: 915 }, dpr: 2.625, want: 64 },
  { name: 'narrow window 560×800 @1 (kept)', viewport: { width: 560, height: 800 }, dpr: 1, want: 64 },
]) {
  const { p, errors } = await page(b, url, { viewport: v.viewport, dpr: v.dpr });
  await setup(p, 'mio');
  await p.evaluate(() => window.__say('mio', 'smile'));
  await wait(p, 150);
  const r = await p.evaluate(() => { const c = window.__cv(); const w = parseFloat(getComputedStyle(c).width); return { w, dev: w * devicePixelRatio, box: Math.round(document.querySelector('.dlg').getBoundingClientRect().height) }; });
  const whole = Math.abs(r.dev / 96 - Math.round(r.dev / 96)) < 0.01;
  assert(Math.abs(r.w - v.want) < 0.6 && !errors.length, `${v.name}: the portrait is ${r.w} CSS px = ${r.dev.toFixed(0)} device px (${whole ? Math.round(r.dev / 96) + '× the art' : (r.dev / 96).toFixed(2) + '×'}); the dialogue box ${r.box} px tall`);
  await p.context().close();
}

await b.close();
srv.close();
console.log(fail ? `\n${fail} FAILED` : '\nall passed');
process.exit(fail ? 1 : 0);
