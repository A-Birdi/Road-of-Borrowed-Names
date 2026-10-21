// A picture's layers built ahead belong to the showing they were asked for (RBN-QA-072 refine; Agnes 6322740894):
// RB.interlude.ahead() (`!interlude <id> <stage>… ahead`) and the crossing's own look ahead to its next moment
// (src/ui/42f_interlude_crossing.js) do nothing once that showing has passed: a clear (the scene's end), a campaign
// change (a load that works or fails) or another showing of the same picture since. Layers built ahead for a picture
// never shown are given up by the clear that ends their generation, even with nothing showing. In Chromium on the
// built game, from a synthetic campaign of the shipped edition, each case with the idle callback the browser has and
// again with the setTimeout fallback (no requestIdleCallback), using a test picture that records what it is asked to
// build (and the release of the pictures' layers), and the crossing itself:
//  1. ahead, then a clear before its turn: nothing built;
//  2. ahead, then a load before its turn (one that fails, an empty slot; one that works): nothing built;
//  3. ahead with nothing shown, its turn come: built (the control); then a clear with nothing shown releases the
//     layers once, and a second clear does not again;
//  4. shown, ahead, then a clear before its turn: nothing built; shown, ahead, its turn come: built, and the clear
//     releases once;
//  5. shown, ahead, cleared and shown again (a newer showing of the same picture) before its turn: the old turn builds
//     nothing; a new ahead for the newer showing builds;
//  6. the crossing's own look ahead (out → leaves): asked, then cleared before its turn: it never builds, and nothing
//     of the crossing's layers is held after; asked, then cleared and shown again at the same moment: it never builds
//     for the old showing, only for the newer one;
//  7. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/interlude_ahead.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

for (const mode of ['idle', 'setTimeout']) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async (mode) => {
    if (mode === 'setTimeout') { window.requestIdleCallback = undefined; }
    RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu', flags: { departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    await RB.save.manualSave(1);
    window.__prep = []; window.__rel = 0;
    RB.prologueArt.kit.onRelease(() => { window.__rel++; });
    // a picture that only records what it is asked to build, and when (the generation then)
    RB.interlude.ART.zz_ahead = { stages: ['a', 'b'], prepare(w, h, vb, st) { window.__prep.push({ st, gen: RB.interlude.generation() }); }, draw(c, w, h) { c.fillStyle = '#123'; c.fillRect(0, 0, w, h); } };
  }, mode);
  const wait = (ms) => p.waitForTimeout(ms);
  const look = () => p.evaluate(() => ({ prep: window.__prep.slice(), rel: window.__rel, gen: RB.interlude.generation(), pic: RB.interlude.state() && RB.interlude.state().id }));
  const reset = () => p.evaluate(() => { RB.interlude.clear(); window.__prep = []; window.__rel = 0; });
  const tag = `(${mode})`;

  // 1. ahead, then a clear before its turn
  await reset();
  await p.evaluate(() => { RB.interlude.ahead('zz_ahead', ['b']); RB.interlude.clear(); });
  await wait(500);
  let L = await look();
  ok(!L.prep.length, `${tag} ahead, then a clear before its turn: nothing built (${JSON.stringify(L.prep)})`);

  // 2. ahead, then a load before its turn (one that fails, one that works)
  for (const [how, slot] of [['fails (an empty slot)', 3], ['works', 1]]) {
    await reset();
    const res = await p.evaluate(async (slot) => { RB.interlude.ahead('zz_ahead', ['b']); try { return 'ok ' + (await RB.game.loadCampaign(slot, 'manual')); } catch (e) { return 'failed'; } }, slot);
    await wait(500);
    L = await look();
    ok(!L.prep.length && !L.pic, `${tag} ahead, then a load that ${how} before its turn (${res}): nothing built, no picture (${JSON.stringify(L)})`);
  }

  // 3. ahead with nothing shown: built (the control); a clear with nothing shown releases those layers once
  await reset();
  await p.evaluate(() => RB.interlude.ahead('zz_ahead', ['b']));
  await wait(500);
  L = await look();
  const built = L.prep.length === 1 && L.prep[0].st === 'b';
  await p.evaluate(() => RB.interlude.clear());
  const r1 = await look();
  await p.evaluate(() => RB.interlude.clear());
  const r2 = await look();
  ok(built && r1.rel === L.rel + 1 && r2.rel === r1.rel, `${tag} ahead with nothing shown, its turn come: built (the control); a clear with nothing shown gives those layers up once, a second clear not again (releases ${L.rel} → ${r1.rel} → ${r2.rel}; ${JSON.stringify(L.prep)})`);

  // 4. shown, ahead, cleared before its turn; shown, ahead, its turn come
  await reset();
  await p.evaluate(() => { RB.interlude.show('zz_ahead', 'a'); RB.interlude.ahead('zz_ahead', ['b']); RB.interlude.clear(); });
  await wait(500);
  L = await look();
  ok(!L.prep.length && !L.pic, `${tag} shown, ahead, then cleared before its turn: nothing built after the clear (${JSON.stringify(L.prep)})`);
  await reset();
  await p.evaluate(() => { RB.interlude.show('zz_ahead', 'a'); RB.interlude.ahead('zz_ahead', ['b']); });
  await wait(500);
  L = await look();
  await p.evaluate(() => RB.interlude.clear());
  const c1 = await look();
  ok(L.prep.length === 1 && L.pic === 'zz_ahead' && c1.rel === L.rel + 1 && !c1.pic, `${tag} shown, ahead, its turn come: built for the shown picture; its clear gives the layers up once (${JSON.stringify(L.prep)}; releases ${L.rel} → ${c1.rel})`);

  // 5. a newer showing of the same picture before the old turn
  await reset();
  const g5 = await p.evaluate(() => { RB.interlude.show('zz_ahead', 'a'); RB.interlude.ahead('zz_ahead', ['b']); RB.interlude.clear(); RB.interlude.show('zz_ahead', 'a'); return RB.interlude.generation(); });
  await wait(500);
  const L5 = await look();
  await p.evaluate(() => RB.interlude.ahead('zz_ahead', ['b']));
  await wait(500);
  L = await look();
  ok(!L5.prep.length && L.prep.length === 1 && L.prep[0].gen === g5 && L.pic === 'zz_ahead', `${tag} shown, ahead, cleared and shown again before its turn: the old turn builds nothing; a new ahead builds for the newer showing (old: ${JSON.stringify(L5.prep)}; new: ${JSON.stringify(L.prep)}, generation ${g5})`);
  await reset();

  // 6. the crossing's own look ahead (out → leaves), cleared (and shown again) between its asking and its turn
  for (const again of [false, true]) {
    await p.evaluate(() => { RB.interlude.clear(); RB.interlude.show('ko_crossing', 'out'); });
    // (in the same frame as the draw that asks: before any idle time or timer can come round)
    const r = await p.evaluate((again) => new Promise((res) => {
      let a0 = null;
      const tick = () => {
        const P = RB.interlude.ART.ko_crossing.probe();
        if (P && a0 == null) a0 = P.ahead.asked;
        if (P && P.ahead.asked > a0) {
          const g0 = P.ahead.gen, ran0 = P.ahead.ran.slice();
          RB.interlude.clear();
          if (again) RB.interlude.show('ko_crossing', 'out');
          res({ g0, ran0 });
        } else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), again);
    await wait(again ? 2200 : 1200);
    const P = await p.evaluate(() => { const A = RB.interlude.ART.ko_crossing, P = A.probe(); return { ran: P.ahead.ran, gen: RB.interlude.generation(), cached: P.cached, pic: RB.interlude.state() }; });
    if (!again) ok(!P.ran.includes(r.g0) && !P.pic && P.cached === 0, `${tag} the crossing's look ahead asked, then cleared before its turn: it never builds for that showing, and none of the crossing's layers is held after (built for ${JSON.stringify(P.ran)}, the old showing ${r.g0}; layers held ${P.cached})`);
    else ok(!P.ran.includes(r.g0) && P.ran.includes(P.gen) && P.pic && P.pic.id === 'ko_crossing', `${tag} the crossing's look ahead asked, then cleared and the same moment shown again: it builds only for the newer showing (built for ${JSON.stringify(P.ran)}; old ${r.g0}, newer ${P.gen})`);
  }
  await p.evaluate(() => RB.interlude.clear());
  ok(!errors.length, `${tag} no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}
console.log(`\ninterlude_ahead: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
