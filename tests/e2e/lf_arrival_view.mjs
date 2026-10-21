// The view on the first arrival above Lanternfall (RBN-QA-064), in the BUILT game, headless Chromium, synthetic
// campaigns in fresh contexts (never a player's save):
// - in lf.arrive the two lines that describe the view ("Indigo roofs, narrow canals…", "…only the top of an old
//   tower…") are shown over a picture of it (src/ui/42d_interlude_valley.js); the first line, the chapter card and
//   every line after them (the companion's, yours) are on the road with the map shown, the player where they stood;
//   the scene still sets lf_arrived and Chapter 5;
// - the roofs, the canals' lamps and the tower's top are above the dialogue sheet, measured in the page, at a
//   desktop size and a phone held upright;
// - with reduced motion the picture holds still (two frames alike); with motion it does not (the lamps, the lake);
// - a second visit (lf_arrived already set) runs no arrival and shows no picture;
// - no console errors, no network requests.
// Usage: node tests/e2e/lf_arrival_view.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { rw_arrived: true, departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true };
const VIEW = [/^Indigo roofs, narrow canals/, /only the top of an old tower/];
const AT = [2, 13];

async function start(p, comp, reduce, flags) {
  await p.evaluate(async ([comp, reduce, flags, AT]) => {
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = reduce; RB.game.applySettings();
    const s = RB.game.debugStart('lf.road', AT[0], AT[1], { comp, flags, dir: 'right' });
    s.chapter = 4;
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 800 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    // the chapter card, as it comes up (and whether a picture was showing then)
    window.__cards = [];
    new MutationObserver(() => {
      const t = document.querySelector('.banner .en');
      if (t && !window.__cards.some((c) => c.en === t.textContent)) window.__cards.push({ en: t.textContent, picture: RB.interlude.state() });
    }).observe(document.body, { childList: true, subtree: true });
  }, [comp, reduce, flags, AT]);
}
// the dialogue sheet's top, measured in the page, as a row of the art buffer; and the art's own idea of it
const sheet = (p) => p.evaluate(() => {
  const cv = document.getElementById('world'), box = document.querySelector('#ui > .dlg:not(.hidden)');
  if (!cv || !box) return null;
  const a = cv.getBoundingClientRect(), r = box.getBoundingClientRect(), A = RB.interlude.ART.lf_valley, pr = A && A.probe();
  return { row: ((r.top - a.top) / a.height) * (pr ? pr.h : RB.render.viewSize().h * RB.render.ART), pr };
});

for (const [comp, W, H, reduce] of [['nao', 1280, 800, false], ['mio', 390, 844, true], ['ren', 390, 844, false], ['suzu', 1280, 800, true]]) {
  const tag = `${comp} ${W}×${H}${reduce ? ' reduced motion' : ''}`;
  const { p, errors, requests } = await page(b, url, { viewport: { width: W, height: H } });
  await start(p, comp, reduce, FL);
  await p.evaluate(() => { RB.script.run('lf.arrive'); }); // (not awaited: the scene waits for the reader)
  let last = '', wrong = [], seen = 0, pics = 0, firstComp = null, probes = [], frames = null, n = 0;
  for (let i = 0; i < 40; i++) {
    const l = await p.waitForFunction((last) => { const l = RB.ui.dialogue.shown && RB.ui.dialogue.shown(); if (l && RB.ui.dialogue.isOpen() && (l.en || '') !== last) return { en: l.en, who: l.who || l.speaker || '' }; return !RB.script.isRunning() ? '__done' : false; }, last, { timeout: 60000, polling: 100 }).then((h) => h.jsonValue(), () => '__timeout');
    if (l === '__done' || l === '__timeout') break;
    last = l.en; n++;
    await p.waitForTimeout(700);
    const st = await p.evaluate(() => ({ pic: RB.interlude.state(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y] }));
    const want = VIEW.some((re) => re.test(l.en));
    const shows = !!(st.pic && st.pic.id === 'lf_valley');
    if (shows) pics++;
    if (shows !== want) wrong.push(`"${l.en.slice(0, 40)}": ${shows ? 'picture' : 'road'} (want ${want ? 'picture' : 'road'})`);
    if (want) {
      seen++;
      probes.push(await sheet(p));
      if (seen === 1) frames = await p.evaluate(async () => { const a = document.getElementById('world').toDataURL(); await new Promise((r) => setTimeout(r, 900)); return a === document.getElementById('world').toDataURL(); });
    } else if (seen === 2 && !firstComp) firstComp = Object.assign({ en: l.en }, st);
    await p.evaluate(() => RB.ui.dialogue.advance(true));
  }
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 30000 }).catch(() => {});
  const end = await p.evaluate(() => ({ pic: RB.interlude.active(), map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], arrived: RB.state.test(RB.game.s, 'lf_arrived'), chapter: RB.game.s.chapter, cards: window.__cards }));
  ok(!wrong.length && n >= 6, `${tag}: the two lines of the view over the picture, the other ${n - 2} lines on the road${wrong.length ? ' — ' + wrong.join('; ') : ''}`);
  ok(seen === 2 && pics === 2, `${tag}: the picture over exactly two lines, the two that describe the view (${pics} with the picture, ${seen} of the view)`);
  ok(firstComp && !firstComp.pic && firstComp.map === 'lf.road' && firstComp.at.join() === AT.join(), `${tag}: by the first line after them ("${firstComp ? firstComp.en.slice(0, 30) : '-'}") the road is back, the player where they stood (${firstComp ? firstComp.map + ' ' + firstComp.at : '-'})`);
  ok(!end.pic && end.map === 'lf.road' && end.at.join() === AT.join(), `${tag}: after the scene nothing is left showing, still on the road where you stood`);
  ok(end.arrived && end.chapter === 5, `${tag}: lf_arrived set and Chapter 5 (${end.arrived}, ${end.chapter})`);
  ok(end.cards.length === 1 && /Chapter 5/.test(end.cards[0].en) && !end.cards[0].picture, `${tag}: the chapter card, once, over the road (${JSON.stringify(end.cards)})`);
  for (const [k, pr] of probes.entries()) {
    const P = pr && pr.pr;
    if (!P) { ok(false, `${tag}: line ${k + 1}: the picture's layout could be read`); continue; }
    const top = Math.min(pr.row, P.vb);
    ok(P.vb <= pr.row + 1, `${tag}: line ${k + 1}: the picture lays out above the sheet it measured (vb ${P.vb}, sheet at row ${pr.row.toFixed(1)} of ${P.h})`);
    ok(P.roofs.n === 11 && P.roofs.bottom < top && P.roofs.top > 0, `${tag}: line ${k + 1}: all ${P.roofs.n} roofs above the sheet (rows ${P.roofs.top}–${P.roofs.bottom}, sheet ${top.toFixed(0)})`);
    ok(P.lamps.n === 27 && P.lamps.bottom < top && P.canalLights.n === 7 && P.canalLights.bottom < top, `${tag}: line ${k + 1}: the lamps in their rows and the canals' lights above the sheet (lamps to row ${P.lamps.bottom}, canal lights to ${P.canalLights.bottom})`);
    ok(P.tower.top > 0 && P.tower.base < top && P.tower.x > P.w * 0.15 && P.tower.x < P.w * 0.85, `${tag}: line ${k + 1}: the tower's top in the lake above the sheet (rows ${P.tower.top}–${P.tower.base}, x ${P.tower.x} of ${P.w})`);
  }
  if (reduce) ok(frames === true, `${tag}: with reduced motion the picture holds still (two frames alike)`);
  else ok(frames === false, `${tag}: with motion the picture lives (two frames differ: the lamps, the lake)`);
  ok(!errors.length, `${tag}: no console errors${errors.length ? ' — ' + errors[0].slice(0, 120) : ''}`);
  ok(!requests.length, `${tag}: no network requests`);
  await p.close();
}

// a second visit: the arrival has happened, so entering the road runs no arrival and shows no picture
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'nao', false, Object.assign({ lf_arrived: true }, FL));
  const r = await p.evaluate(async () => {
    RB.game.runEnterEvents();
    const seen = { pic: false, run: false };
    for (let i = 0; i < 30; i++) { if (RB.interlude.active()) seen.pic = true; if (RB.script.isRunning()) seen.run = true; await new Promise((r) => setTimeout(r, 50)); }
    return seen;
  });
  ok(!r.pic && !r.run, `second visit: no arrival runs and no picture shows (${JSON.stringify(r)})`);
  ok(!errors.length, `second visit: no console errors${errors.length ? ' — ' + errors[0].slice(0, 120) : ''}`);
  await p.close();
}
console.log(`\nlf_arrival_view: ${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
