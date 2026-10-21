// RBN-QA-048 (Agnes): the coast road's fog event (sg.lw_road_fog) shows its fog, in Chromium on the built game. The
// traveller is placed by the road event, you face them and press the action key, and the real challenge is answered
// right (or left with "Come back later" for the miss branch). At each beat the scene's ambience and the world canvas are
// sampled (luminance and saturation of small patches):
//  1. before talking: no fog;
//  2. from "Fog comes up off the sea" through the challenge: the scene's `fog` ambience; the road ahead pale and
//     washed of colour, you and the traveller nearly as before (clear around you), the fork lantern and the sign still
//     there (lighter, not lost);
//  3. answered right: the fog stays through the line that says it lifts and is gone after it; answered wrong: it stays
//     through "you decide to wait" and is gone when the scene ends; free roam is clear, as before;
//  4. reduced motion: the same picture (the haze is still); a phone: the same beats; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/fog_event.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

async function run(answer, o = {}) {
  const { p, errors } = await page(b, url, { viewport: o.vp || { width: 1180, height: 757 } });
  await p.evaluate((o) => {
    const s = RB.game.debugStart('sg.road', 18, 10, { comp: 'suzu', dir: 'up', flags: { departed: true, ch1_done: true, ch2_done: true } });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false; RB.game.settings.reducedMotion = !!o.reduced; RB.game.applySettings();
    const R = RB.town.rec(s); R.roads.sg_road = { unique: 'solved', solved: { lamp: true }, offered: 1, here: { id: 'fog' }, visit: R.moves, lastMap: 'sg.road' };
    RB.world.refreshActors();
  }, o);
  await p.waitForTimeout(900);
  const here = await p.evaluate(() => { const n = RB.world.W.npcs.find((a) => a.id === 'lw_rd_traveller' || (a.char || a.def && a.def.char) === 'lw_rd_traveller'); return n ? [n.id, n.x, n.y] : RB.world.W.npcs.map((a) => a.id).slice(0, 40); });
  // the world canvas: mean luminance and saturation far from you (the road ahead) and next to you
  const sample = () => p.evaluate(() => {
    const cv = document.querySelector('canvas'), g = cv.getContext('2d');
    const W = RB.world.W, cam = RB.render.cam, v = RB.render.viewSize(), sx = cv.width / v.w, sy = cv.height / v.h;
    const at = (tx, ty) => { const x = Math.round((tx * 16 + 8 - cam.x) * sx), y = Math.round((ty * 16 + 8 - cam.y) * sy); const d = g.getImageData(x - 6, y - 6, 12, 12).data; let L = 0, S = 0; for (let i = 0; i < d.length; i += 4) { const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); L += (mx + mn) / 2; S += mx - mn; } const n = d.length / 4; return [Math.round(L / n), Math.round(S / n)]; };
    const amb = RB.staging.ambienceNow();
    return { scene: !!amb, haze: amb && amb.ambient ? amb.ambient.haze || 0 : 0, far: at(W.player.x + 9, W.player.y - 5), far2: at(W.player.x - 9, W.player.y + 4), near: at(W.player.x, W.player.y - 1), lamp: at(17, 8), sign: at(20, 12) };
  });
  const before = await sample();
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; RB.world.interact(); });
  const beats = [];
  for (let i = 0; i < 120; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? String(d.en || '').slice(0, 200) : null, mode: RB.game.mode(), run: RB.script.isRunning(), opts: [...document.querySelectorAll('button')].filter((x) => x.offsetParent && /灯籠|とうろう/.test(x.textContent)).length }; });
    if (st.d) {
      if (!beats.length || beats[beats.length - 1].d !== st.d) { await p.waitForTimeout(250); const sm = await sample(); beats.push({ d: st.d, ...sm });  }
      if (o.skipAt && beats.length === o.skipAt) { await p.evaluate(() => RB.ui.onAction && RB.ui.onAction('skip')); }
      await p.click('.dlg .b-next').catch(() => {});
      await p.waitForTimeout(150);
      continue;
    }
    const cont = await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /^\s*(Continue|Next|OK)\b/.test(x.textContent)); if (bt) { bt.click(); return true; } return false; });
    if (cont) { await p.waitForTimeout(300); continue; }
    if (answer === 'wrong') {
      const left = await p.evaluate(() => { const nt = [...document.querySelectorAll('*')].some((x) => x.offsetParent && /^Not that one/.test((x.textContent || '').trim()) && x.children.length === 0); if (!nt) return false; const bt = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /Come back later/.test(x.textContent)); if (bt) { bt.click(); return true; } return false; });
      if (left) { await p.waitForTimeout(400); continue; }
    }
    if (st.opts) {
      await p.waitForTimeout(250);
      const sm = await sample(); beats.push({ d: '[challenge]', ...sm });
      
      await p.evaluate((a) => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && /灯籠|とうろう/.test(x.textContent)); const want = bs.find((x) => (a === 'right' ? /北|きた/ : /坂|さか/).test(x.textContent)); (want || bs[0]).click(); }, answer);
      await p.waitForTimeout(400);
      continue;
    }
    if (!st.run && st.mode === 'world' && beats.length) break;
    // anything else the challenge shows (feedback, Continue): the first visible button in its sheet
    await p.evaluate(() => { const bt = [...document.querySelectorAll('.ch-sheet button, .challenge button, [class*=chal] button')].find((x) => x.offsetParent); if (bt) bt.click(); });
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(500);
  const after = await sample();
  // a save and reload afterwards: the map's own light (no fog)
  const reload = await p.evaluate(() => { const amb = RB.staging.ambienceNow(); return { amb: amb ? 'scene' : null, mapAmb: JSON.stringify((RB.world.W.map.def || {}).ambient || {}) }; });
  const r = { answer, reduced: !!o.reduced, phone: !!o.vp, traveller: here, before, beats, after, reload, errors: errors.slice(0, 3) };
  await p.close();
  return r;
}
const near = (a, b, d) => Math.abs(a - b) <= d;
const R = await run('right');
const first = R.beats.find((x) => /^Fog comes up/.test(x.d)), lifts = R.beats.find((x) => /fog lifts/.test(x.d)), after = R.beats.find((x) => x.haze === 0 && R.beats.indexOf(x) > R.beats.indexOf(lifts));
ok(R.before.haze === 0 && !R.before.scene, 'before talking: no fog (' + JSON.stringify(R.before) + ')');
ok(first && first.haze > 0 && first.far[0] - R.before.far[0] > 40 && first.far[1] < R.before.far[1] / 2, 'with the first line the road ahead is pale and washed of colour (' + JSON.stringify(first) + ')');
ok(first && near(first.near[0], R.before.near[0], 20), 'you and the traveller stay plain (near luminance ' + (first && first.near[0]) + ' against ' + R.before.near[0] + ')');
ok(first && first.lamp[0] >= R.before.lamp[0] && first.sign[0] - R.before.sign[0] < 30 && first.sign[1] > 20, 'the fork lantern glows through and the sign is lighter, not lost (' + JSON.stringify(first && { lamp: first.lamp, sign: first.sign }) + ')');
ok(R.beats.filter((x) => x.d === '[challenge]').every((x) => x.haze > 0), 'the fog stays through the challenge');
ok(lifts && lifts.haze > 0 && after && after.haze === 0, 'right: it is still there on the line that says it lifts, and gone after it');
ok(R.after.haze === 0 && near(R.after.far[0], R.before.far[0], 4) && R.reload.amb === null, 'right: free roam is as before (' + JSON.stringify(R.after.far) + ' against ' + JSON.stringify(R.before.far) + ')');
ok(!R.errors.length, 'right: no page errors ' + R.errors.join(' | '));
const M = await run('wrong');
const wait = M.beats.find((x) => /decide to wait/.test(x.d));
ok(wait && wait.haze > 0, 'wrong (Come back later): the fog stays through "you decide to wait"');
ok(M.after.haze === 0 && near(M.after.far[0], M.before.far[0], 4), 'wrong: gone when the scene ends; free roam as before');
ok(!M.errors.length, 'wrong: no page errors ' + M.errors.join(' | '));
const S = await run('right', { reduced: true });
const sFirst = S.beats.find((x) => /^Fog comes up/.test(x.d)), sAgain = S.beats.find((x) => /inside the fog/.test(x.d));
ok(sFirst && sAgain && JSON.stringify(sFirst.far) === JSON.stringify(sAgain.far) && sFirst.haze > 0, 'reduced motion: the same still haze line to line (' + JSON.stringify(sFirst && sFirst.far) + ')');
ok(S.after.haze === 0 && !S.errors.length, 'reduced motion: gone after, no page errors');
const P = await run('right', { vp: { width: 390, height: 844 } });
const pFirst = P.beats.find((x) => /^Fog comes up/.test(x.d));
ok(pFirst && pFirst.haze > 0 && P.after.haze === 0 && !P.errors.length, 'a phone (390x844): the same beats, no page errors');
console.log(`\nfog_event: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
