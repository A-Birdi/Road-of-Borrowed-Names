// RBN-QA-173 (Agnes 6380383097, 6380554586; Local CL-271): Sazanami's fishing station "among the rocks, a rod lashed
// to it" is drawn so: a low shelf of rock under its stand (coast_shelf, flat, never solid) and the stake among rocks
// with a lashed rod (fish_station's 'rocks' look, this station only). In Chromium on the built game, with throwaway
// journeys:
//  1. after the story: the shelf at the stand (34,19), the station at (34,20) with the rocks look; the islet's and
//     Saltglass's stations still the quay's; before the story neither shelf nor station;
//  2. nothing else changes: the tiles, what is solid (the map's collision, a digest the same as on CC-021's build), the
//     stand walkable, the stake solid;
//  3. from the stand, facing the stake, the station's menu opens as before (Cast, Fishing notes, …);
//  4. the shelf is drawn under whoever stands on it (its depth below theirs, as the renderer computes it; not pixels);
//  4b. the flat renderer (Agnes 6381589930): the station on the rocks has its two rocks, the lashed rod and its line;
//     every other station draws exactly its stake and notice, as before;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/rocky_station.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const errorsAll = [];
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true };

async function begin(p, map, x, y, post, dir) {
  await p.evaluate(async ([map, x, y, flags, dir]) => {
    RB.game.debugStart(map, x, y, { edition: RB.edition.forNew(), comp: 'suzu', flags, dir });
    RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 400));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
  }, [map, x, y, Object.assign({}, DONE, post ? { postgame: true, ngp_offered: true } : {}), dir || 'down']);
}
// the props standing now (their conditions read), the collision digest, a few tiles
const here = (p) => p.evaluate(() => {
  const m = RB.world.W.map, s = RB.game.s;
  const props = m.props.filter((q) => (q.p === 'coast_shelf' || q.p === 'fish_station') && (!q.if || RB.state.test(s, q.if))).map((q) => [q.p, q.x, q.y, (q.o && q.o.kind) || null]);
  let h = 0;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) h = (h * 31 + (RB.maps.blockedStatic(m, x, y) ? 1 : 0) + x * 7 + y) | 0;
  const tile = (x, y) => { const t = RB.maps.tileAt(m, x, y); return t && t.id; };
  return { map: m.id, props, solid: h, stand: { tile: tile(34, 19), blocked: RB.maps.blockedStatic(m, 34, 19) }, stake: { tile: tile(34, 20), blocked: RB.maps.blockedStatic(m, 34, 20) } };
});

const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
// ---- 1. and 2. ----------------------------------------------------------------------------------------------------------------
await begin(p, 'sz.hamlet', 34, 18, true);
const post = await here(p);
await begin(p, 'sz.hamlet', 34, 18, false);
const before = await here(p);
ok(J(post.props) === J([['coast_shelf', 34, 19, null], ['fish_station', 34, 20, 'rocks']]) && J(before.props) === '[]',
  'after the story: the shelf at the stand and the station with the rocks look; before it, neither (' + J({ post: post.props, before: before.props }) + ')');
const others = [];
for (const [map, x, y] of [['sea.islet', 9, 11], ['sg.harbor', 27, 28]]) {
  await begin(p, map, x, y, true);
  others.push(await here(p));
}
ok(others.every((o) => o.props.length === 1 && o.props[0][0] === 'fish_station' && o.props[0][3] === 'quay'),
  'the islet\'s and Saltglass\'s stations keep the quay\'s look; no shelf there (' + J(others.map((o) => [o.map, o.props])) + ')');
ok(post.stand.tile === 'shallow' && !post.stand.blocked && post.stake.blocked && post.stand.tile === before.stand.tile && post.stake.tile === before.stake.tile,
  'nothing else changes: the stand still shallows and walkable, the stake solid, the same tiles (' + J({ stand: post.stand, stake: post.stake }) + ')');
ok(post.solid === -1043801987,
  'what is solid at Sazanami after the story: the same digest as on CC-021\'s build (' + post.solid + ')');
// ---- 3. the station's menu from the stand -------------------------------------------------------------------------------------
await begin(p, 'sz.hamlet', 34, 19, true, 'down');
await p.evaluate(() => { const m = RB.world.W.map; const st = m.props.find((q) => q.p === 'fish_station'); window.__done = false; RB.script.run(st.scene, { prop: st }).then(() => { window.__done = true; }); });
let choices = null;
for (let i = 0; i < 80 && !choices; i++) {
  if (await p.$('.choices:not(.hidden) .choice')) choices = await p.$$eval('.choices:not(.hidden) .choice', (xs) => xs.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  else { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await p.waitForTimeout(60); }
}
ok(choices && choices.some((c) => /Cast/.test(c)) && choices.some((c) => /Fishing notes/.test(c)), 'from the stand, the station\'s menu opens as before (' + J(choices) + ')');
if (choices) await p.locator('.choices:not(.hidden) .choice').last().click();
// ---- 4. the shelf under whoever stands on it ----------------------------------------------------------------------------------
const depth = await p.evaluate(() => {
  const TS = 16, P = RB.props.P.coast_shelf;
  if (!P) return { missing: true };
  const shelfZ = (19 + 1) * TS - (P.block === false ? 12 : 0) - 0.5, standZ = 19 * TS + TS;
  return { shelfZ, standZ, block: P.block };
});
ok(depth.block === false && depth.shelfZ < depth.standZ, 'the shelf is flat and never solid, drawn below whoever stands on it (' + J(depth) + ')');
// ---- 4b. the flat renderer --------------------------------------------------------------------------------------------------
const flat = await p.evaluate(() => {
  const P = RB.props.P.fish_station;
  const fills = (o) => { const out = []; const c = { set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; }, fillRect(x, y, w, h) { out.push(this._f + ':' + x + ',' + y + ',' + w + ',' + h); } }; P.draw(c, 0, 0, null, 0, o); return out; };
  return { rocks: fills({ kind: 'rocks' }), quay: fills({ kind: 'quay' }), river: fills({ kind: 'river' }), pond: fills({ kind: 'pond' }), none: fills({}) };
});
const OLD = ['#7a5a36:7,2,2,12', '#efe4c8:9,4,4,3'];
ok(['quay', 'river', 'pond', 'none'].every((k) => J(flat[k]) === J(OLD)) && flat.rocks.some((f) => f.startsWith('#5e5a54')) && flat.rocks.some((f) => f.startsWith('#8a6a3a')) && flat.rocks.some((f) => f.startsWith('#cfd2cc')) && OLD.every((f) => flat.rocks.includes(f)),
  'the flat renderer: on the rocks, its two rocks, the lashed rod and its line with the stake and notice; every other station exactly as before (' + J({ rocks: flat.rocks.length, quay: flat.quay }) + ')');
errorsAll.push(...errors);
await ctx.close();
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
