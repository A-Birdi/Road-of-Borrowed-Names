// RBN-QA-050 (Agnes): the fare repaid at Hana's teahouse (lq.fare_pay, rw.tea), in Chromium on the built game, played
// from each side you can talk to Chigusa from (west, east, above), with your companion along:
//  1. before you talk to her she sits at the small table (her teahouse stance), and she is still seated for "I've been
//     sitting here since morning";
//  2. at "Let's begin." she stands and walks round to Kōji's side (4,6), facing him (5,6, facing her): the walk is made
//     (no fallback) from every side;
//  3. side by side for the repayment: the coins in her hands, the fare book in his (and he still faces her, the open book
//     between them, not turned to you: Local CL-066), the seal from him to her, each at its line; your companion by the
//     door (3,7), off her tile and out of the way;
//  4. the scene ends as before (the quest step, Chigusa on her way); no page errors.
// The same scene reached by speaking to Kōji first (CC-625, Agnes 6927046186): his talk runs lq.fare_pay_koji, which
// calls lq.fare_pay, and only on that route you step aside to (5,7), facing him, as Chigusa rises, so her mark at (4,6)
// is free whichever side of him you spoke from. From each of his four sides, (4,6) (5,5) (5,7) (6,6), with each of the
// four companions, and with none:
//  5. you stay where you spoke from until she rises; at the coins, the book and the seal you are on (5,7) facing up
//     (Chigusa on (4,6) facing him, Kōji on (5,6), your companion on (3,7)); on Chigusa's own route you are never
//     moved. Kōji at the coins still faces the side you spoke to him from (he turned to you; nothing in the scene
//     turns him before the book): from (5,5) and (6,6) that is now an empty tile. At the book he faces her (kojiFaces
//     and kojiSees below);
//  6. no two figures on one tile at any point the test looks (each line, and every 100 ms between lines), and not one
//     walk falls back, yours included;
//  7. after the scene: the quest step and lq_fare_paid, the world again, and a step of input moves you that way;
//  8. saved there and loaded again (in the same session, and once with the game opened afresh): you are back on the
//     tile and facing you ended on, with both scenes recorded as seen on Kōji's route (lq.fare_pay_koji only there);
//  9. Skip seen taken at "Let's begin." (the scene seen before), so the walks are placements: the same end, on Kōji's
//     route from his four sides and on Chigusa's from her west.
// Usage: node tools/build.mjs && node tests/e2e/fare_pay_staging.mjs   (EVIDENCE=<dir> also saves frames;
// RB_PAGE=<file> runs it against another build in the tree's root, e.g. the parent's page as a control)
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const ev = process.env.EVIDENCE;
if (ev) fs.mkdirSync(ev, { recursive: true });
const FL = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, rw_koji_back: true, rw_echo_done: true, lq_fare_found: true };
const J = JSON.stringify;

// where everyone stands, as staging sees it; and any tile with two figures on it
const lookFn = () => {
  const st = RB.staging.state(), f = (id) => st.actors.find((a) => a.id === id) || null;
  const c = f('lq_chigusa'), k = f('koji'), m = f('comp'), W = RB.world.W, pl = W.player;
  const tiles = {};
  for (const a of st.actors) { const key = a.x + ',' + a.y; (tiles[key] = tiles[key] || []).push(a.id); }
  const shared = Object.entries(tiles).filter(([, ids]) => ids.length > 1).map(([t, ids]) => t + ' ' + ids.join('+'));
  // (dir: the way each is drawn facing, a scene's !look or turn over the walking direction)
  return { chigusa: c && { at: [c.x, c.y], dir: c.look || c.dir, pose: c.pose, rest: c.rest, held: c.held }, koji: k && { at: [k.x, k.y], dir: k.look || k.dir, held: k.held }, comp: m && [m.x, m.y], pc: [pl.x, pl.y], pcDir: pl.dir, shared, fallbacks: RB.staging.stats().walkFallbacks };
};

async function run(e, comp, o) {
  o = o || {};
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate(([e, comp, FL, skip]) => {
    // (a journey of the edition a new game has: a save of an older one, loaded, offers New Game+ first)
    const s = RB.game.debugStart('rw.tea', e.x, e.y, { comp, dir: e.dir, flags: FL, edition: RB.edition.forNew() });
    s.quests.lq_fare = { stage: 4, done: false, t: 1 };
    // (Skip seen is offered on a line of a scene seen before)
    if (skip) { s.seen['lq.fare_pay'] = true; if (e.route === 'koji') s.seen['lq.fare_pay_koji'] = true; RB.game.settings.skipSeen = true; }
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W;
    if (comp && e.compAt && W.comp) Object.assign(W.comp, { x: e.compAt[0], y: e.compAt[1], fx: e.compAt[0], fy: e.compAt[1], mv: null, dir: e.compAt[2] });
  }, [e, comp, FL, !!o.skip]);
  await p.waitForTimeout(1500);
  const look = () => p.evaluate(lookFn);
  const before = await look();
  await p.evaluate(() => RB.world.interact());
  const beats = [], shared = [];
  let shot = 0, skipped = false, held = 0;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); const k = document.querySelector('.dlg .b-skip'); return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 160) : null, run: RB.script.isRunning(), mode: RB.game.mode(), skip: !!(k && k.offsetParent && !k.classList.contains('hidden')) }; });
    const now = await look();
    if (now.shared.length) shared.push({ line: st.d, shared: now.shared });
    if (st.d) {
      if (!beats.length || beats[beats.length - 1].d !== st.d) {
        held = 0;
        if (!skipped) await p.waitForTimeout(350);
        beats.push({ d: st.d, ...(skipped ? now : await look()) });
        if (ev && !skipped) await p.screenshot({ path: path.join(ev, e.name + '_' + (comp || 'none') + (o.skip ? '_skip' : '') + '_' + (++shot) + '.png') });
        // Skip seen at "Let's begin.": what follows, the walks included, goes by at once
        if (o.skip && !skipped && /Let's begin/.test(st.d) && st.skip) { skipped = true; await p.evaluate(() => document.querySelector('.dlg .b-skip').click()); await p.waitForTimeout(100); continue; }
        // (one press per line: a press while the same line is still up would be carried into the next)
        if (!skipped) await p.click('.dlg .b-next').catch(() => {});
      } else if (skipped && ++held > 20) { held = 0; await p.click('.dlg .b-next').catch(() => {}); }
      await p.waitForTimeout(skipped ? 50 : 150);
      continue;
    }
    if (!st.run && st.mode === 'world' && beats.length) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(800);
  const after = await p.evaluate(() => ({ quest: RB.game.s.quests.lq_fare, paid: !!RB.game.s.flags.lq_fare_paid, mode: RB.game.mode(), run: RB.script.isRunning(), ff: RB.game.fastForward() }));
  const end = await look();
  return { p, before, beats, shared, skipped, after, end, errors };
}

// a step of input: towards a free tile beside you (not a wall, a figure or the door), the key pressed briefly as a
// player would (you move that way: a press held a moment longer can carry you a second tile)
async function stepOnce(p) {
  const pick = await p.evaluate(() => {
    const W = RB.world.W, pl = W.player, D = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
    for (const d of ['left', 'right', 'up', 'down']) { const x = pl.x + D[d][0], y = pl.y + D[d][1]; if (!RB.world.blocked(x, y, { except: pl }) && !RB.maps.exitAt(W.map, x, y)) return { d, from: [pl.x, pl.y], to: [x, y] }; }
    return null;
  });
  if (!pick) return { pick, at: null };
  const key = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[pick.d];
  let at = null;
  for (let t = 0; t < 4; t++) {
    await p.keyboard.down(key); await p.waitForTimeout(150); await p.keyboard.up(key); await p.waitForTimeout(400);
    at = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
    if (at.join() !== pick.from.join()) break;
  }
  const D = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[pick.d];
  const dx = at[0] - pick.from[0], dy = at[1] - pick.from[1], n = Math.abs(dx) + Math.abs(dy);
  return { pick, at, moved: n >= 1 && dx === D[0] * n && dy === D[1] * n };
}
const load = (p) => p.evaluate(() => Promise.race([RB.game.loadCampaign(1, 'manual').then((v) => v !== false), new Promise((r) => setTimeout(() => r('timed out'), 15000))]));
const where = (p) => p.evaluate(() => { const s = RB.game.s, pl = RB.world.W.player; return { map: s.map, at: [pl.x, pl.y], dir: pl.dir, saved: [s.x, s.y, s.dir], seenKoji: !!s.seen['lq.fare_pay_koji'], seenPay: !!s.seen['lq.fare_pay'], paid: !!s.flags.lq_fare_paid, quest: s.quests.lq_fare && s.quests.lq_fare.stage, mode: RB.game.mode() }; });

// compAt: where your companion stands when you walked up to that tile (the one way in, or in from the door or the
// room), as tests/e2e/staging_runner.mjs sets it: with a wall behind you, the follow rule alone puts them on your own
// tile. kojiFaces: the way Kōji faces at the coins, and kojiSees what is there. He turns to you when you speak to him,
// and nothing turns him to Chigusa until the book (`!look koji lq_chigusa`): so on his route he still faces the side
// you spoke from, the same direction as on 315b770. The same direction is not the same picture: from (5,5) and (6,6)
// you have stepped to (5,7), so he faces the tile you left, empty (Agnes 6928616034); the screen itself is compared
// apart from this test (CC-626). On Chigusa's route he faces her
const CHIGUSA = [{ route: 'chigusa', name: 'west', x: 5, y: 4, dir: 'right', kojiFaces: 'left', kojiSees: 'her' }, { route: 'chigusa', name: 'east', x: 7, y: 4, dir: 'left', compAt: [7, 3, 'down'], kojiFaces: 'left', kojiSees: 'her' }, { route: 'chigusa', name: 'above', x: 6, y: 3, dir: 'down', compAt: [5, 3, 'right'], kojiFaces: 'left', kojiSees: 'her' }];
const KOJI = [{ route: 'koji', name: 'koji-west', x: 4, y: 6, dir: 'right', compAt: [4, 7, 'up'], kojiFaces: 'left', kojiSees: 'her, on the tile you spoke from' }, { route: 'koji', name: 'koji-above', x: 5, y: 5, dir: 'down', kojiFaces: 'up', kojiSees: 'the tile you spoke from, now empty' }, { route: 'koji', name: 'koji-below', x: 5, y: 7, dir: 'up', compAt: [4, 7, 'right'], kojiFaces: 'down', kojiSees: 'you, still there' }, { route: 'koji', name: 'koji-east', x: 6, y: 6, dir: 'left', compAt: [6, 7, 'up'], kojiFaces: 'right', kojiSees: 'the tile you spoke from, now empty' }];
const COMPS = ['suzu', 'nao', 'mio', 'ren'];
const RUNS = [];
for (const e of CHIGUSA.concat(KOJI)) for (const comp of COMPS) RUNS.push({ e, comp });
// no companion (set up directly: the scene's companion lines and walk are guarded ?(comp))
RUNS.push({ e: KOJI[0], comp: null }, { e: CHIGUSA[0], comp: null });
// Skip seen at "Let's begin."
for (const e of KOJI.concat([CHIGUSA[0]])) RUNS.push({ e, comp: 'suzu', skip: true });

for (const { e, comp, skip } of RUNS) {
  const r = await run(e, comp, { skip }), tag = e.name + ' (' + (comp || 'no companion') + ')' + (skip ? ', Skip seen' : '');
  const koji = e.route === 'koji', start = [e.x, e.y].join(), mark = koji ? '5,7' : start;
  const at = (re) => r.beats.find((x) => re.test(x.d));
  const since = at(/sitting here since morning/), begin = at(/Let's begin/), coins = at(/lays (the )?coins|coins in front/i), book = at(/Write your name/), seal = at(/the pledge/i);
  ok(r.before.chigusa && r.before.chigusa.rest === 'sit' && r.before.chigusa.at.join() === '6,4' && r.before.pc.join() === start, tag + ': before you talk she sits at the small table, and you are where you spoke from (' + J({ c: r.before.chigusa, pc: r.before.pc }) + ')');
  if (skip) {
    ok(r.skipped, tag + ': Skip seen offered at "Let\'s begin." and taken');
    ok(begin && begin.pc.join() === start, tag + ': until then you stay where you spoke from (' + J(begin && begin.pc) + ')');
  } else {
    ok(since && since.chigusa.at.join() === '6,4' && since.chigusa.rest === 'sit' && !since.chigusa.pose && since.pc.join() === start, tag + ': still seated for "sitting here since morning", and you not yet moved (' + J(since && { c: since.chigusa, pc: since.pc }) + ')');
    ok(coins && coins.chigusa.at.join() === '4,6' && coins.chigusa.dir === 'right' && coins.chigusa.pose === 'stiff' && coins.koji.at.join() === '5,6' && coins.koji.dir === e.kojiFaces && coins.fallbacks === r.before.fallbacks, tag + ': at the coins she stands beside Kōji, facing him, the walk made; he faces ' + e.kojiFaces + ', towards ' + e.kojiSees + ' (' + J(coins && { c: coins.chigusa, k: coins.koji, fb: coins.fallbacks - r.before.fallbacks }) + ')');
    ok(coins && coins.chigusa.held === 'coins', tag + ': the coins in her hands');
    ok(coins && coins.pc.join() === mark && (!koji || coins.pcDir === 'up'), tag + (koji ? ': you stand aside on (5,7), facing up to Kōji' : ': you are not moved') + ' (' + J(coins && { pc: coins.pc, dir: coins.pcDir }) + ')');
    ok(book && book.koji.held === 'book' && book.koji.dir === 'left' && book.koji.at.join() === '5,6' && book.chigusa.at.join() === '4,6' && book.pc.join() === mark, tag + ': the fare book in his hands, held out to her, facing her, and you still at ' + mark + ' (' + J(book && { k: book.koji, c: book.chigusa.at, pc: book.pc }) + ')');
    ok(seal && (seal.chigusa.held === 'stamp' || seal.koji.held === 'stamp') && seal.pc.join() === mark, tag + ': the seal passes between them (' + J(seal && { c: seal.chigusa.held, k: seal.koji.held, pc: seal.pc }) + ')');
    if (comp) ok(coins && J(coins.comp) === '[3,7]', tag + ': your companion by the door, off her tile (' + J(coins && coins.comp) + ')');
    else ok(coins && coins.comp === null, tag + ': no companion figure (' + J(coins && coins.comp) + ')');
  }
  ok(!r.shared.length, tag + ': no two figures on one tile at any point looked at ' + J(r.shared.slice(0, 3)));
  ok(r.end.fallbacks === r.before.fallbacks, tag + ': not one walk fell back (' + (r.end.fallbacks - r.before.fallbacks) + ')');
  ok(r.after.paid && r.after.quest && r.after.quest.stage === 5 && r.after.mode === 'world' && !r.after.run && !r.after.ff && r.end.pc.join() === mark && (!koji || r.end.pcDir === 'up'), tag + ': the scene ends as before, you on ' + mark + (koji ? ' facing up' : '') + ' (' + J({ after: r.after, pc: r.end.pc, dir: r.end.pcDir }) + ')');
  const p = r.p;
  let ended = null, stepped = null, loaded = null;
  if (!skip) {
    ended = await where(p);
    await p.evaluate(async () => { await RB.save.manualSave(1); });
  }
  stepped = await stepOnce(p);
  ok(stepped.pick && stepped.moved, tag + ': control is yours again: a step of input moves you that way (' + J(stepped) + ')');
  if (!skip) {
    const got = await load(p);
    await p.waitForTimeout(1500);
    loaded = Object.assign(await where(p), { load: got });
    const want = (w) => w.load === true && w.map === 'rw.tea' && w.at.join() === ended.at.join() && w.dir === ended.dir && w.saved.join() === ended.saved.join() && w.at.join() === mark && w.seenPay && w.seenKoji === koji && w.paid && w.quest === 5 && w.mode === 'world';
    ok(ended.at.join() === mark && ended.saved.join() === ended.at.concat([ended.dir]).join() && want(loaded), tag + ': saved there and loaded: you are back on ' + mark + ' facing ' + ended.dir + ', lq_fare_paid, quest step 5, ' + (koji ? 'both scenes seen' : 'lq.fare_pay seen and lq.fare_pay_koji not') + ' (' + J({ ended, loaded }) + ')');
    if (comp === 'suzu' && (e.name === 'koji-west' || e.name === 'west')) {
      await p.reload();
      await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
      const got2 = await load(p);
      await p.waitForTimeout(1500);
      const fresh = Object.assign(await where(p), { load: got2 });
      ok(want(fresh), tag + ': the game opened afresh with that save: the same (' + J(fresh) + ')');
    }
  }
  ok(!r.errors.length, tag + ': no page errors ' + r.errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nfare_pay_staging: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
