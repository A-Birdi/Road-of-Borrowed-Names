// RBN-QA-049 (Agnes): the Reedwake road's "Geese on the road" event shows its geese, in Chromium on the built game. The
// event is placed by the road (rw_road, 'geese'), you face the child and press the action key, and the real challenge
// is answered right (or left with "Come back later" for the miss branch):
//  1. placed: the flock (one actor, lw_rd_geese) on the road's south lane ahead of the child and to one side, so
//     the road can still be walked end to end past them; the flock is drawn (its sprite has pixels);
//  2. answered right: before the line that says every goose crossed, the flock stands on the pond's verge (16,7) and
//     the child beside them (15,8); when the event is seen through, both go (the road event's own clearing);
//  3. the miss branch: nothing crosses; flock and child stay where they were;
//  4. a tap on the flock plays the same event scene (never another line, never a foe);
//  5. reduced motion: the same end positions; no page errors anywhere.
// Usage: node tools/build.mjs && node tests/e2e/geese_event.mjs   (EVIDENCE=<dir> also saves frames)
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const ev = process.env.EVIDENCE;
if (ev) fs.mkdirSync(ev, { recursive: true });

async function start(o = {}) {
  const { p, errors } = await page(b, url, { viewport: o.vp || { width: 1180, height: 757 } });
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.road', o.at ? o.at[0] : 15, o.at ? o.at[1] : 12, { comp: 'suzu', dir: o.dir || 'up', flags: { departed: true, ch1_done: true, rw_road_lit: true, rw_arrived: true, lw_rw_cart_done: true } });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false; RB.game.settings.reducedMotion = !!o.reduced; RB.game.applySettings();
    const R = RB.town.rec(s); R.roads.rw_road = { unique: 'solved', solved: { cart: true }, offered: 1, here: { id: 'geese' }, visit: R.moves, lastMap: 'rw.road' };
    s.flags['roadev.rw_road.geese'] = true;
    RB.world.refreshActors();
  }, o);
  await p.waitForTimeout(900);
  return { p, errors };
}
const where = (p) => p.evaluate(() => { const W = RB.world.W, f = (id) => { const n = W.npcs.find((a) => a.id === id); return n ? [n.x, n.y] : null; }; return { geese: f('lw_rd_geese'), child: f('lw_rd_child2'), pl: [W.player.x, W.player.y] }; });
// talk (the action key on whoever is in front), then press through: answer right or leave the challenge; returns what
// stood where at each line
async function play(p, answer, shotName) {
  const beats = [];
  let shot = 0;
  await p.evaluate(() => RB.world.interact());
  for (let i = 0; i < 160; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? String(d.en || '').slice(0, 200) : null, mode: RB.game.mode(), run: RB.script.isRunning(), opts: [...document.querySelectorAll('button')].filter((x) => x.offsetParent && /まで|まつ|とおる/.test(x.textContent)).length }; });
    if (st.d) {
      if (!beats.length || beats[beats.length - 1].d !== st.d) { await p.waitForTimeout(250); beats.push({ d: st.d, ...(await where(p)) }); if (ev && shotName) await p.screenshot({ path: path.join(ev, shotName + '_' + (++shot) + '.png') }); }
      await p.click('.dlg .b-next').catch(() => {});
      await p.waitForTimeout(150);
      continue;
    }
    const cont = await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /^\s*(Continue|Next|OK)\b/.test(x.textContent)); if (bt) { bt.click(); return true; } return false; });
    if (cont) { await p.waitForTimeout(300); continue; }
    if (answer === 'wrong') {
      const left = await p.evaluate(() => { const nt = [...document.querySelectorAll('*')].some((x) => x.offsetParent && x.children.length === 0 && /^Not that one/.test((x.textContent || '').trim())); if (!nt) return false; const bt = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /Come back later/.test(x.textContent)); if (bt) { bt.click(); return true; } return false; });
      if (left) { await p.waitForTimeout(400); continue; }
    }
    if (st.opts) {
      await p.evaluate((a) => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && /まで|まつ|とおる/.test(x.textContent)); const want = bs.find((x) => (a === 'right' ? /全部|ぜんぶ|ゆっくり/ : /走|はし/).test(x.textContent) && !x.disabled); (want || bs[0]).click(); }, answer);
      await p.waitForTimeout(400);
      continue;
    }
    if (!st.run && st.mode === 'world' && beats.length) break;
    await p.waitForTimeout(150);
  }
  await p.waitForTimeout(600);
  return { beats, end: await where(p) };
}

// 1. placed, and the road still walkable
{
  const { p, errors } = await start();
  const w = await where(p);
  ok(w.geese && w.geese[0] === 14 && w.geese[1] === 10 && w.child && w.child[0] === 15 && w.child[1] === 11, 'placed: the flock on the road ahead of the child (' + JSON.stringify(w) + ')');
  // the road (rows 9-10) walked end to end past the flock and the child: a search over the free tiles
  const road = await p.evaluate(() => {
    const W = RB.world.W, free = (x, y) => x >= 0 && x < W.map.w && y >= 8 && y <= 11 && !RB.world.blocked(x, y, { except: W.player, ignorePlayer: true });
    const seen = new Set(['1,9']), q = [[1, 9]];
    while (q.length) { const [x, y] = q.shift(); if (x === W.map.w - 2) return true; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && free(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
    return false;
  });
  ok(road, 'the road can still be walked end to end past the flock and the child');
  const px = await p.evaluate(() => { const cv = RB.sprites.get({ custom: 'geese' }, 'right', 0); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  ok(px > 60, 'the flock is drawn (' + px + ' pixels)');
  if (ev) await p.screenshot({ path: path.join(ev, 'placed.png') });
  ok(!errors.length, 'placed: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. answered right
for (const reduced of [false, true]) {
  const { p, errors } = await start({ reduced });
  const r = await play(p, 'right', reduced ? null : 'right');
  const crossed = r.beats.find((x) => /every last goose|crosses|cross/i.test(x.d) && !/crossing the road/.test(x.d));
  ok(crossed && crossed.geese && crossed.geese.join() === '16,7' && crossed.child && crossed.child.join() === '15,8', (reduced ? 'reduced motion: ' : '') + 'right: on the line that says they crossed, the flock is on the pond\'s verge and the child after them (' + JSON.stringify(crossed) + ')');
  ok(!r.end.geese && !r.end.child, (reduced ? 'reduced motion: ' : '') + 'right: seen through, both go on their way (' + JSON.stringify(r.end) + ')');
  ok(!errors.length, (reduced ? 'reduced motion: ' : '') + 'right: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. the miss branch
{
  const { p, errors } = await start();
  const r = await play(p, 'wrong', 'miss');
  const racket = r.beats.find((x) => /racket/.test(x.d));
  ok(racket && racket.geese && racket.geese.join() === '14,10' && racket.child.join() === '15,11', 'miss: nothing crosses; flock and child where they were (' + JSON.stringify(racket) + ')');
  ok(r.end.geese && r.end.geese.join() === '14,10', 'miss: after the scene the flock is still on the road (' + JSON.stringify(r.end) + ')');
  ok(!errors.length, 'miss: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 4. a tap on the flock
{
  const { p, errors } = await start({ at: [13, 10], dir: 'right' });
  const first = await p.evaluate(async () => { RB.world.interact(); for (let i = 0; i < 60; i++) { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); if (d) return { en: d.en, scene: RB.script.current ? RB.script.current() : null, mode: RB.game.mode() }; await new Promise((r) => setTimeout(r, 50)); } return { mode: RB.game.mode() }; });
  ok(first && /flock of geese/.test(first.en || '') && first.mode !== 'battle', 'a tap on the flock plays the event\'s own scene (' + JSON.stringify(first) + ')');
  ok(!errors.length, 'tap: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\ngeese_event: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
