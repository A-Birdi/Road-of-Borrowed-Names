// Agnes, RBN-QA-036: at Yukimiya Inn, clicking Yae (behind the counter, between a pot and the bottles, no free place
// beside her) did nothing; clicking the counter below her talked to her. A tap on a person walks to a free place
// beside them; with none, it now walks to the place in front of a counter beside them, faces it and talks across it,
// as the action key does there (src/engine/50_world.js tapTile, acrossSpots). In the game:
//  1. from the inn's door, a tap on Yae: you walk to the counter's front (13,4), face it, and Yae's scene starts;
//  2. already there, facing away: a tap on Yae turns you and talks at once;
//  3. a tap on the counter itself is unchanged (from below it talks to Yae across it; from the door it is read at its
//     left end);
//  4. someone with a free place beside them (Natsume by the hearth): walked to beside, as before;
//  5. the cross-game reach of the change: every person placed beside a counter (or an `across` prop) on any map,
//     listed (the fallback acts only when no place beside them can be reached);
//  6. Sousuke behind the post shelter's desk (an `across` prop; RBN-QA-038): from the entrance and from either side;
//  7. the walk remembers whom it is for (Agnes's REFINE of fa14eda): if, while you walk, Yae is taken away, moves,
//     or someone else takes her place, or the counter is replaced by something else, nobody else is talked to and
//     nothing else is read; a new tap during the walk cancels it; and with no counter between you (an unrelated
//     prop in its place) a tap on Yae does nothing.
// Usage: node tools/build.mjs && node tests/e2e/counter_tap.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, ch3_done: true, sb_arrived: true, sb_hamlet_seen: true };

async function start(p, x, y, dir, map) {
  await p.evaluate(async ([x, y, dir, FL, map]) => {
    const s = RB.game.debugStart(map || 'sb.inn', x, y, { comp: 'suzu', flags: FL, dir, edition: 2 });
    s.chapter = 4; s.quests.sb_lamp = { stage: 0, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, [x, y, dir, FL, map]);
}
// tap a tile; wait for a scene (or for the walk to end without one); who spoke first, and where you stand
async function tap(p, x, y) {
  return p.evaluate(async ([x, y]) => {
    const s = RB.game.s, n = s.backlog.length, W = RB.world.W;
    RB.world.tapTile(x, y);
    const t0 = performance.now();
    while (performance.now() - t0 < 12000) {
      if (RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown()) break;
      if (!W.path && !W.player.mv && performance.now() - t0 > 1500) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    const l = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
    return { scene: RB.script.isRunning() ? (RB.script.current ? RB.script.current() : true) : null, who: l ? l.who || null : null, en: l ? l.en : null,
      at: [W.player.x, W.player.y], dir: W.player.dir, said: s.backlog.slice(n).map((e) => e.who || '') };
  }, [x, y]);
}

// 1. from the door
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 8, 9, 'up');
  const r = await tap(p, 13, 2);
  ok(r.at[0] === 13 && r.at[1] === 4 && r.dir === 'up', 'a tap on Yae walks you to the counter\'s front, facing it (' + r.at + ' ' + r.dir + ')');
  ok(r.who === 'yae' || r.said.includes('yae'), 'and Yae speaks (' + r.who + ': ' + r.en + ')');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}
// 2. already at the counter's front, facing away
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 13, 4, 'down');
  const r = await tap(p, 13, 2);
  ok(r.at[0] === 13 && r.at[1] === 4 && r.dir === 'up' && (r.who === 'yae' || r.said.includes('yae')), 'there already: you turn and Yae speaks (' + r.dir + ', ' + r.who + ')');
  await p.context().close();
}
// 3. the counter itself, unchanged: from below it, a tap on it talks to Yae across it (Agnes's workaround); from the
//    door its nearest side is its left end, where its own description is read (the same on CC-008)
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 13, 6, 'up');
  const r = await tap(p, 13, 3);
  ok(r.at[0] === 13 && r.at[1] === 4 && (r.who === 'yae' || r.said.includes('yae')), 'from below, a tap on the counter talks to Yae across it (' + r.who + ', at ' + r.at + ')');
  await p.context().close();
}
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 8, 9, 'up');
  const r = await tap(p, 13, 3);
  ok(r.at[0] === 11 && r.at[1] === 3 && r.who === 'narr', 'from the door, a tap on the counter reads it from its left end, as before (' + r.who + ', at ' + r.at + ')');
  await p.context().close();
}
// 4. someone with a free place beside them
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 8, 9, 'up');
  const r = await tap(p, 5, 4);
  const d = Math.abs(r.at[0] - 5) + Math.abs(r.at[1] - 4);
  ok(d === 1 && (r.who === 'natsume' || r.said.includes('natsume')), 'Natsume (free beside): walked to beside and talked, as before (' + r.at + ', ' + r.who + ')');
  await p.context().close();
}
// 5. the reach: people placed beside a counter on any map
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const list = await p.evaluate(() => {
    const out = [];
    for (const id in RB.content.maps) {
      let m; try { m = RB.maps.compile(id); } catch (e) { continue; }
      const props = (m.props || []).filter((pr) => pr.p === 'counter' || pr.across);
      if (!props.length) continue;
      const at = (x, y) => props.find((pr) => { const pd = RB.props.P[pr.p] || {}; const w = pr.w || pd.w || 1, h = pr.h || pd.h || 1; return x >= pr.x && x < pr.x + w && y >= pr.y && y < pr.y + h; });
      for (const n of (m.def && m.def.npcs) || m.npcs || []) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (at(n.x + dx, n.y + dy)) { out.push(id + ':' + (n.char || n.id) + '@' + n.x + ',' + n.y); break; }
    }
    return out;
  });
  console.log('     people beside a counter: ' + list.length + '\n       ' + list.join('\n       '));
  ok(list.some((x) => /^sb\.inn:yae@13,2$/.test(x)), 'the reach is listed (' + list.length + ' placements beside a counter, Yae among them)');
  await p.context().close();
}
// 6. Sousuke at the post shelter's desk, from the entrance and from either side
for (const [sx, sy, from] of [[5, 6, 'the entrance'], [2, 4, 'the left of the room'], [8, 4, 'the right of the room']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, sx, sy, 'up', 'sb.post');
  const r = await tap(p, 7, 2);
  ok(r.at[0] === 7 && r.at[1] === 4 && r.dir === 'up' && (r.who === 'sousuke' || r.said.includes('sousuke')), 'Sousuke from ' + from + ': across the desk, facing it, and he speaks (' + r.at + ' ' + r.dir + ', ' + r.who + ')');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}
// 7. things that change while you walk to the counter's front
async function tapThen(p, x, y, change) {
  return p.evaluate(async ([x, y, change]) => {
    const s = RB.game.s, n = s.backlog.length, W = RB.world.W;
    const yae = RB.world.actorById('yae'), nat = RB.world.actorById('natsume');
    const counterIx = () => W.map.props.findIndex((pr) => { const pd = RB.props.P[pr.p] || {}; const w = pr.w || pd.w || 1; return (pr.p === 'counter' || pr.across) && pr.y === 3 && 13 >= pr.x && 13 < pr.x + w; });
    const swapCounter = () => { const i = counterIx(), pr = W.map.props[i], pd = RB.props.P[pr.p] || {}; W.map.props[i] = { p: 'crate', x: pr.x, y: pr.y, w: pr.w || pd.w || 1, text: { jp: 'はこ が ある 。', en: 'A crate stands here.' } }; };
    if (change === 'barrier') swapCounter();
    RB.world.tapTile(x, y);
    const len0 = W.path ? W.path.length : 0, t1 = performance.now();
    const walked = len0 > 0;
    while (W.path && W.path.length > Math.max(1, len0 - 2) && performance.now() - t1 < 6000) await new Promise((r) => setTimeout(r, 20));
    if (change === 'remove') W.npcs.splice(W.npcs.indexOf(yae), 1);
    if (change === 'move') { const to = [[6, 6], [6, 7], [6, 5]].find(([a, b]) => !RB.world.blocked(a, b)) || [6, 6]; yae.x = to[0]; yae.y = to[1]; yae.fx = to[0]; yae.fy = to[1]; }
    if (change === 'replace') { W.npcs.splice(W.npcs.indexOf(yae), 1); nat.x = 13; nat.y = 2; nat.fx = 13; nat.fy = 2; }
    if (change === 'counter') swapCounter();
    if (change === 'retap') RB.world.tapTile(10, 8);
    const t0 = performance.now();
    while (performance.now() - t0 < 12000) {
      if (RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown()) break;
      if (!W.path && !W.player.mv && performance.now() - t0 > 1500) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    const l = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
    return { walked, who: l ? l.who || null : null, en: l ? l.en : null, at: [W.player.x, W.player.y], said: s.backlog.slice(n).map((e) => (e.who || '') + ':' + (e.en || '').slice(0, 40)), running: RB.script.isRunning() };
  }, [x, y, change]);
}
for (const [change, what, check] of [
  ['remove', 'Yae is taken away while you walk: nobody is talked to, nothing is read', (r) => !r.said.length && !r.who && !r.running],
  ['move', 'Yae moves (off your way) while you walk: you go on to her where she is now and she speaks; the counter is not read', (r) => (r.who === 'yae' || r.said.some((w) => w.startsWith('yae:'))) && r.said.every((w) => w.startsWith('yae:'))],
  ['replace', 'someone else takes Yae\'s place while you walk: they are not talked to, nothing is read', (r) => !r.said.length && !r.who && !r.running],
  ['counter', 'the counter is replaced by something else while you walk: it is not read, nobody is talked to', (r) => !r.said.length && !r.who && !r.running],
  ['retap', 'a new tap during the walk cancels it: nobody is talked to, and the walk to the counter is not finished', (r) => !r.said.length && !r.who && !(r.at[0] === 13 && r.at[1] === 4)],
  ['barrier', 'no counter between you (something else in its place): a tap on Yae does nothing', (r) => !r.walked && !r.said.length && !r.who],
]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 8, 9, 'up');
  const r = await tapThen(p, 13, 2, change);
  ok(check(r), what + ' (said ' + JSON.stringify(r.said) + ', at ' + r.at + ')');
  ok(!errors.length, change + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}
console.log(`\ncounter_tap: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
