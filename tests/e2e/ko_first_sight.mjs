// The first sight of Kotonoha (RBN-QA-073), in the BUILT game, headless Chromium, synthetic twelve-chapter campaigns
// in fresh contexts (never a player's save), by both ways of landing: Tetsu's ferry from Saltglass harbour
// (ko.ferry_out) and your own boat (RB.sail.arrive → sea.arrive_kotonoha), both of which call ko.first_sight:
// - the two lines that describe the view ("Beyond the sand stands a tree…", "Leaves are falling like snow…") are shown
//   over a picture of it (src/ui/42g_interlude_firstsight.js); by your companion's line the shore is back, you where
//   you landed; the scene still sets ko_arrived and the island's travel; once Lanternfall is over, Nami's welcome
//   (ko.begin) follows in the world as before and Chapter 9 begins; on the early visit (your own boat, before
//   Lanternfall is over) it does not;
// - the tree's crown (whole at the desktop size; on the phone its outer ends are cut by the picture's sides) and trunk,
//   the beach and the jetty are above the dialogue sheet, and the leaves come down no lower than it, measured in the
//   page, at a desktop size and a phone held upright;
// - a few large gold leaves come down in front of the hill, the beach and the water, each with ink on it, never over
//   the tree's crown or its trunk and roots, none below the sheet; with reduced motion all of them hold, full-size;
// - with reduced motion the picture holds still (two frames alike); with motion it does not (the leaves, the water);
// - a second landing (ko_arrived already set), by either boat, runs no first sight and shows no picture;
// - all four companions' lines run; no console errors, no network requests.
// Usage: node tests/e2e/ko_first_sight.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
// a twelve-chapter journey with Lanternfall over (as tests/e2e/kotonoha.mjs has it), or before it is (the early visit)
const FL = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true };
const EARLY = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true };
const VIEW = [/^Beyond the sand stands a tree/, /^Leaves are falling like snow/];
const COMP = { nao: /^…All of these, words someone wrote/, mio: /^Beautiful… But so many/, ren: /^It may be older than the lantern roads/, suzu: /^Like a shower of paper confetti/ };
const NAMI = /^You came\. I'm Nami/;
const LAND = { ferry: [20, 22], sea: [19, 22] };

// on Saltglass harbour by Tetsu (the ferry), or out on the sea by the island's jetty with a voyage under way (your boat)
async function start(p, how, comp, reduce, flags) {
  return p.evaluate(async ([how, comp, reduce, flags]) => {
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = reduce; RB.game.applySettings();
    const s = how === 'ferry' ? RB.game.debugStart('sg.harbor', 34, 30, { comp, flags, dir: 'up' }) : RB.game.debugStart('sea.coast', 16, 35, { comp, flags, dir: 'right' });
    s.edition = 2; s.chapter = 8;
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 800 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    window.__pics = 0;
    const tick = () => { if (RB.interlude.active()) window.__pics++; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    return { key: s.chapterKey || null };
  }, [how, comp, reduce, flags]);
}
// land: the ferry's scene, or the boat's arrival at the island (as the voyage's dock does it); neither awaited, as the
// scene waits for the reader
async function land(p, how) {
  await p.evaluate((how) => {
    if (how === 'ferry') { RB.script.run('ko.ferry_out'); return; }
    const s = RB.game.s;
    s.flags.sea_boat = true;
    RB.sail.begin(s, 'saltglass', 'kotonoha', 'self');
    window.__landed = false;
    RB.sail.arrive(s, 'kotonoha').then(() => { window.__landed = true; });
  }, how);
  if (how !== 'ferry') await p.waitForFunction(() => RB.script.isRunning() || window.__landed, null, { timeout: 20000 });
}
// the dialogue sheet's top, measured in the page, as a row of the art buffer; and the art's own idea of it
const sheet = (p) => p.evaluate(() => {
  const cv = document.getElementById('world'), box = document.querySelector('#ui > .dlg:not(.hidden)');
  const A = RB.interlude.ART.ko_first_sight, pr = A && A.probe ? A.probe() : null;
  if (!cv || !box) return { row: null, pr };
  const a = cv.getBoundingClientRect(), r = box.getBoundingClientRect();
  return { row: ((r.top - a.top) / a.height) * (pr ? pr.h : RB.render.viewSize().h * RB.render.ART), pr };
});
// the large gold leaves in the frame on screen (RBN-QA-073 refine): each one's box, and in it the pixels of the
// leaves' gold and of their ink, read from the canvas; and what they keep clear of (the crown, the trunk and roots)
const goldLook = (p) => p.evaluate(() => {
  const P = RB.interlude.ART.ko_first_sight && RB.interlude.ART.ko_first_sight.probe();
  if (!P || !P.gold) return null;
  const cv = document.getElementById('world'), g = cv.getContext('2d'), kx = cv.width / P.w, ky = cv.height / P.h;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const GOLD = ['#a8822e', '#d0a844', '#e8c868'].map(rgb), INK = rgb('#2a2434');
  const near = (d, i, c) => Math.abs(d[i] - c[0]) <= 14 && Math.abs(d[i + 1] - c[1]) <= 14 && Math.abs(d[i + 2] - c[2]) <= 14;
  const leaves = P.gold.now.map(({ box, len }) => {
    const X0 = Math.floor(box[0] * kx), Y0 = Math.floor(box[1] * ky), W = Math.max(1, Math.ceil((box[2] + 1) * kx) - X0), H = Math.max(1, Math.ceil((box[3] + 1) * ky) - Y0);
    const d = g.getImageData(X0, Y0, W, H).data;
    let gold = 0, ink = 0;
    for (let y = box[1]; y <= box[3]; y++) for (let x = box[0]; x <= box[2]; x++) {
      const i = ((Math.floor((y + 0.5) * ky) - Y0) * W + (Math.floor((x + 0.5) * kx) - X0)) * 4;
      if (GOLD.some((c) => near(d, i, c))) gold++; else if (near(d, i, INK)) ink++;
    }
    return { box, len: Math.round(len), gold, ink };
  });
  return { n: P.gold.n, vb: P.vb, clear: P.gold.clear, leaves };
});
// the large gold leaves judged (RBN-QA-073 refine): every full-size one gold with ink on it (at least two in motion, all
// of them held still), none over the crown or the trunk and its roots, none below the sheet
const hit = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
function judgeGold(G, still) {
  const big = G.leaves.filter((l) => l.len >= 14), read = big.filter((l) => l.gold >= 20 && l.ink >= 2);
  const over = G.leaves.filter((l) => hit(l.box, G.clear.crown) || hit(l.box, G.clear.trunk) || l.box[3] >= G.vb);
  return { big, read, over, pass: G.n >= 3 && G.n <= 6 && G.leaves.length <= G.n && (still ? read.length === G.n : read.length >= 2) && read.length === big.length && !over.length };
}
// In motion a leaf can be caught just coming into view (still small, its ink not yet drawn) or turned edge-on (Local
// CL-126: once only one full-size leaf was on screen), so the leaves are read at their best over a few moments (up to
// five, 150 ms apart); every moment read must still keep them all off the tree and above the sheet. Held still, one look.
async function goldBest(p, still) {
  let best = null, looks = 0;
  const overAny = [];
  for (let i = 0; i < (still ? 1 : 5); i++) {
    if (i) await p.waitForTimeout(150);
    const G = await goldLook(p);
    if (!G) continue;
    looks++;
    const j = judgeGold(G, still);
    overAny.push(...j.over);
    if (!best || j.pass || j.read.length > best.j.read.length) best = { G, j };
    if (j.pass) break;
  }
  return best && Object.assign(best.G, { looks, overAny });
}
// every line until the scenes are over: what it says, who says it, and what the screen shows meanwhile
async function lines(p, onView) {
  let last = '';
  const out = [];
  for (let i = 0; i < 40; i++) {
    // (done once no scene has run for a while: the welcome that follows a landing by boat starts just after it)
    const l = await p.waitForFunction((last) => {
      const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown();
      if (l && RB.ui.dialogue.isOpen() && (l.en || '') !== last) { window.__idle = 0; return { en: l.en, who: l.who || l.speaker || '' }; }
      if (RB.script.isRunning() || RB.game.mode() !== 'world') { window.__idle = 0; return false; }
      window.__idle = window.__idle || performance.now();
      return performance.now() - window.__idle > 800 ? '__done' : false;
    }, last, { timeout: 60000, polling: 100 }).then((h) => h.jsonValue(), () => '__timeout');
    if (l === '__done' || l === '__timeout') break;
    last = l.en;
    await p.waitForTimeout(700);
    const st = await p.evaluate(() => ({ pic: RB.interlude.state(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y] }));
    const row = Object.assign({ en: l.en, who: l.who }, st);
    if (VIEW.some((re) => re.test(l.en)) && onView) row.view = await onView(p, out.filter((x) => x.view).length);
    out.push(row);
    await p.evaluate(() => RB.ui.dialogue.advance(true));
  }
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 30000 }).catch(() => {});
  return out;
}

const RUNS = [
  ['ferry', 'nao', 1280, 800, false, FL], ['ferry', 'mio', 390, 844, true, FL],
  ['sea', 'ren', 390, 844, false, FL], ['sea', 'suzu', 1280, 800, true, EARLY],
];
for (const [how, comp, W, H, reduce, flags] of RUNS) {
  const early = flags === EARLY;
  const tag = `${how === 'ferry' ? 'Tetsu\'s ferry' : 'your own boat' + (early ? ' (early)' : '')}, ${comp} ${W}×${H}${reduce ? ' reduced motion' : ''}`;
  const { p, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  const before = await start(p, how, comp, reduce, flags);
  await land(p, how);
  const ls = await lines(p, async (p, k) => {
    const m = await sheet(p);
    m.gold = await goldBest(p, reduce);
    if (k === 0) m.still = await p.evaluate(async () => { const a = document.getElementById('world').toDataURL(); await new Promise((r) => setTimeout(r, 900)); return a === document.getElementById('world').toDataURL(); });
    return m;
  });
  const end = await p.evaluate(() => ({ pic: RB.interlude.active(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], arrived: !!RB.game.s.flags.ko_arrived, ch9: !!RB.game.s.flags.ko_ch9, travel: !!RB.game.s.travel.kotonoha, key: RB.game.s.chapterKey || null, pics: window.__pics }));
  const v = ls.map((l, i) => (VIEW.some((re) => re.test(l.en)) ? i : -1)).filter((i) => i >= 0);
  const wrong = ls.filter((l) => !!(l.pic && l.pic.id === 'ko_first_sight') !== VIEW.some((re) => re.test(l.en))).map((l) => `"${l.en.slice(0, 36)}": ${l.pic ? 'picture' : 'map'}`);
  ok(v.length === 2 && v[1] === v[0] + 1 && !wrong.length, `${tag}: the picture over exactly the two lines of the view, every other line (${ls.length - v.length}) on the map${wrong.length ? ' — ' + wrong.join('; ') : ''}`);
  ok(v.length === 2 && ls[v[0]].pic && ls[v[1]].pic && ls[v[0]].pic.id === 'ko_first_sight' && ls[v[1]].pic.id === 'ko_first_sight', `${tag}: both view lines over the island's first sight (${v.map((i) => JSON.stringify(ls[i].pic)).join(', ')})`);
  const after = v.length ? ls[v[1] + 1] : null;
  ok(after && COMP[comp].test(after.en) && after.who === comp && !after.pic && after.map === 'ko.shore' && after.at.join() === LAND[how].join(), `${tag}: by ${comp}'s own line the shore is back, you where you landed (${after ? `"${after.en.slice(0, 30)}" ${after.who} ${after.pic ? 'picture' : 'map'} ${after.map} ${after.at}` : '-'})`);
  const nami = ls.findIndex((l) => NAMI.test(l.en));
  if (early) ok(nami < 0 && !end.ch9 && end.key === before.key, `${tag}: the early visit: no welcome from Nami, no Chapter 9 (ko_ch9 ${end.ch9}, chapter ${before.key} → ${end.key})`);
  else ok(nami > v[1] + 1 && !ls[nami].pic && ls[nami].map === 'ko.shore' && end.ch9 && end.key === 'ko', `${tag}: then Nami's welcome in the world as before, and Chapter 9 (line ${nami + 1} of ${ls.length}, ${nami >= 0 ? (ls[nami].pic ? 'picture' : 'map') + ' ' + ls[nami].map : '-'}, ko_ch9 ${end.ch9}, chapter ${end.key})`);
  ok(!end.pic && end.map === 'ko.shore' && end.arrived && end.travel, `${tag}: after the scenes nothing is left showing, on the shore, ko_arrived and the island's travel set (${JSON.stringify(end)})`);
  for (const [k, l] of v.map((i) => ls[i]).entries()) {
    const m = l.view, P = m && m.pr;
    if (!P || m.row == null) { ok(false, `${tag}: view line ${k + 1}: the picture's layout could be read against the sheet`); continue; }
    const top = Math.min(m.row, P.vb);
    ok(P.vb <= m.row + 1, `${tag}: view line ${k + 1}: the picture lays out above the sheet it measured (vb ${P.vb}, sheet at row ${m.row.toFixed(1)} of ${P.h})`);
    // (whole at the desktop size; on the phone held upright its outer ends are cut by the picture's sides: Agnes 6321061529)
    const whole = P.crown.left > 0 && P.crown.right < P.w - 1;
    ok(P.crown.top > 0 && P.crown.bottom < top && P.crown.right - P.crown.left > P.w * 0.6 && (whole || H > W), `${tag}: view line ${k + 1}: the tree's crown above the sheet, spread over the island, ${whole ? 'whole' : 'its outer ends cut by the picture\'s sides'} (rows ${P.crown.top}–${P.crown.bottom}, columns ${P.crown.left}–${P.crown.right} of ${P.w}; sheet ${top.toFixed(0)})`);
    ok(P.trunk.base < top && P.trunk.top < P.trunk.base, `${tag}: view line ${k + 1}: its trunk down to the hill above the sheet (rows ${P.trunk.top}–${P.trunk.base})`);
    ok(P.sand.top < P.sand.water && P.sand.water < top && P.jetty.top < top, `${tag}: view line ${k + 1}: the beach and the jetty's far end in view above the sheet (sand ${P.sand.top}–${P.sand.water}, jetty from ${P.jetty.top})`);
    // the large gold leaves (RBN-QA-073 refine; Agnes 6321061529, Local CL-121): a few, each a gold leaf with ink on it,
    // none over the crown or the trunk and its roots, none below the sheet; with reduced motion all of them, whole
    const G = m.gold;
    if (!G) ok(false, `${tag}: view line ${k + 1}: the gold leaves could be read`);
    else {
      const { read } = judgeGold(G, reduce);
      ok(judgeGold(G, reduce).pass && !G.overAny.length,
        `${tag}: view line ${k + 1}: ${G.leaves.length} of ${G.n} large gold leaves on screen, ${read.length} full-size, each gold with ink on it${G.looks > 1 ? ` (the best of ${G.looks} moments)` : ''}; none over the tree or below the sheet at any moment read (${G.leaves.map((l) => `${l.len}px gold ${l.gold} ink ${l.ink} at ${l.box.join(',')}`).join('; ')}; clear of crown ${G.clear.crown.join(',')}, trunk ${G.clear.trunk.map(Math.round).join(',')}${G.overAny.length ? '; over: ' + G.overAny.map((l) => l.box.join(',')).join(' | ') : ''})`);
    }
    ok(P.leaves.n >= 50 && P.leaves.bottom <= m.row + 1, `${tag}: view line ${k + 1}: ${P.leaves.n} leaves coming down, none lower than the sheet (to row ${P.leaves.bottom}, sheet ${m.row.toFixed(1)})`);
  }
  const still = v.length ? ls[v[0]].view && ls[v[0]].view.still : null;
  if (reduce) ok(still === true, `${tag}: with reduced motion the picture holds still (two frames alike)`);
  else ok(still === false, `${tag}: with motion the picture lives (two frames differ: the leaves, the water)`);
  ok(!errors.length, `${tag}: no console errors${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`);
  ok(!requests.length, `${tag}: no network requests`);
  await p.close();
}

// a second landing: the island has been reached before, so neither boat brings its first sight or the picture
for (const how of ['ferry', 'sea']) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, how, 'nao', false, Object.assign({ ko_arrived: true, ko_ch9: true }, FL));
  await land(p, how);
  const ls = await lines(p);
  await p.waitForTimeout(400);
  const end = await p.evaluate(() => ({ pics: window.__pics, pic: RB.interlude.active(), map: RB.world.W.map.id }));
  ok(!ls.some((l) => VIEW.some((re) => re.test(l.en))) && !end.pics && !end.pic && end.map === 'ko.shore', `second landing by ${how === 'ferry' ? 'the ferry' : 'your own boat'}: no first sight and no picture (${ls.length} lines; frames with a picture: ${end.pics}; on ${end.map})`);
  ok(!errors.length, `second landing by ${how}: no console errors${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`);
  await p.close();
}
console.log(`\nko_first_sight: ${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
