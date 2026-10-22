// RBN-QA-108 (Agnes 6351678399, 6347484032; Local CL-222; Cloud CC-127 §5, CC-128 §3): Jinpachi brought the letter
// from his place on the road, off screen for every line. `!walkto <who> pc` walks someone up to you. On a real map
// (a Cloudroad station) with the world's people set by hand:
//  1. the mark: the tile in front of you first, then the nearest within 2 (the larger of the two distances); never an
//     exit or a trigger, a tile the scene holds for someone else, a tile someone stands on or is stepping onto, the end
//     of someone's way here, or your companion's tile or the one they are stepping to; one the walker can reach; none:
//     null;
//  2. the walk: already within 2, nobody moves; set on the mark under Skip seen (now); no mark: nobody moves, recorded
//     as a walk fallback with its reason; someone still on their way to a new place is turned where they are, never set
//     at their way's end first;
//  3. yn.call: the walk after `!chapter yn` and before his first line, on every path; every line, flag and placement
//     as it was (the stations, the Pass at (5,12), Lanternfall's street at (6,18));
//  4. the validator's form and the quest guide: `_walked` is an outcome the guide does not guess.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, SG = RB.staging;
  const map = RB.maps.compile('cr.oiwake');
  const fig = (id, x, y, dir) => ({ id, x, y, fx: x, fy: y, dir: dir || 'down', def: { id }, look: {}, alpha: 1 });
  const world = (o) => {
    const p = fig('pc', 17, 13, o.dir || 'down');
    if (o.at) { p.x = p.fx = o.at[0]; p.y = p.fy = o.at[1]; }
    RB.world.W = Object.assign(RB.world.W || {}, { map, player: p, comp: o.comp || null, npcs: o.npcs || [], extras: o.extras || [], leavers: [] });
    return p;
  };
  SG.enabled(true);
  RB.game.s = RB.state.newCampaign();
  const cheb = (m, p) => Math.max(Math.abs(m[0] - p.x), Math.abs(m[1] - p.y));
  // 1. the mark
  let J = fig('cr_jinpachi', 5, 14), p = world({ npcs: [J] });
  t.eq(SG.markNear(J), [17, 14], 'the tile in front of you first');
  let X = fig('x', 17, 14);
  p = world({ npcs: [J, X] });
  t.eq(SG.markNear(J), [17, 12], 'someone standing there: the nearest free tile (one step, in order)');
  X = fig('x', 17, 15); X.mv = { tx: 17, ty: 14 };
  p = world({ npcs: [J, X] });
  t.ok(String(SG.markNear(J)) !== '17,14', 'not a tile someone is stepping onto');
  const c = fig('nao', 17, 14);
  p = world({ npcs: [J], comp: c });
  t.ok(String(SG.markNear(J)) !== '17,14', 'not your companion\'s tile');
  const c2 = fig('nao', 16, 14); c2.mv = { tx: 17, ty: 14 };
  p = world({ npcs: [J], comp: c2 });
  const mk2 = SG.markNear(J);
  t.ok(String(mk2) !== '17,14' && String(mk2) !== '16,14', 'nor the one they are stepping to');
  X = fig('x', 25, 13); X.route = [[24, 13], [17, 14]];
  p = world({ npcs: [J, X] });
  t.ok(String(SG.markNear(J)) !== '17,14', 'not the end of someone\'s way here');
  // held by the scene for someone else: their walk set them there, then they are elsewhere for now
  X = fig('x', 25, 13);
  p = world({ npcs: [J, X] });
  SG.begin('t.reserve');
  await SG.walkTo(X, 17, 14, null, { now: true });
  X.x = X.fx = 25; X.y = X.fy = 13;
  t.ok(String(SG.markNear(J)) !== '17,14', 'not a tile the scene holds for someone else');
  SG.end(SG.sceneToken());
  // by the trigger at the station's east end: never an exit or a trigger
  J = fig('cr_jinpachi', 20, 12);
  p = world({ npcs: [J], at: [33, 12], dir: 'right' });
  const mT = SG.markNear(J);
  t.ok(mT && cheb(mT, p) <= 2 && !RB.maps.exitAt(map, mT[0], mT[1]) && !map.triggers.some((g) => mT[0] >= g.x && mT[0] < g.x + g.w && mT[1] >= g.y && mT[1] < g.y + g.h), 'beside the way out: never the trigger in front of you (' + mT + ')');
  // every tile within 2 taken: none
  J = fig('cr_jinpachi', 5, 14);
  const crowd = [];
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx || dy) crowd.push(fig('c' + dx + '_' + dy, 17 + dx, 13 + dy));
  p = world({ npcs: [J].concat(crowd) });
  t.eq(SG.markNear(J), null, 'no free tile within 2: no mark');
  // boxed in: none it can reach
  J = fig('cr_jinpachi', 5, 14);
  const box = [[4, 14], [6, 14], [5, 13], [5, 15]].map(([x, y], i) => fig('b' + i, x, y));
  p = world({ npcs: [J].concat(box) });
  t.eq(SG.markNear(J), null, 'a mark it cannot reach is not its mark');
  // over many places of yours, every mark within 2
  const far = [];
  for (const [x, y] of [[12, 12], [20, 17], [11, 11], [22, 14], [30, 13]]) {
    J = fig('cr_jinpachi', 5, 14);
    p = world({ npcs: [J], at: [x, y], dir: 'up' });
    const mk = SG.markNear(J);
    if (!mk || cheb(mk, p) > 2) far.push([x, y, mk]);
  }
  t.eq(far, [], 'every mark within 2 of you');
  // 2. the walk
  SG.resetStats();
  J = fig('cr_jinpachi', 16, 12);
  p = world({ npcs: [J] });
  SG.begin('t.walk');
  let r = await SG.walkNear(J, null, {});
  t.ok(r.ok && J.x === 16 && J.y === 12, 'already within 2: nobody moves, and it counts as arrived');
  J = fig('cr_jinpachi', 5, 14);
  p = world({ npcs: [J] });
  r = await SG.walkNear(J, null, { now: true });
  t.ok(r.ok && J.x === 17 && J.y === 14 && J.dir === 'up', 'under Skip seen: set on the mark at once, facing you (' + JSON.stringify([J.x, J.y, J.dir]) + ')');
  J = fig('cr_jinpachi', 12, 12); J.route = [[11, 12], [10, 12], [5, 14]];
  p = world({ npcs: [J].concat(crowd) });
  const f0 = SG.stats().walkFallbacks || 0;
  r = await SG.walkNear(J, null, {});
  t.ok(!r.ok && r.why === 'no free place within 2' && J.x === 12 && J.y === 12 && !J.route && (SG.stats().walkFallbacks || 0) === f0 + 1,
    'no mark: nobody moves; someone on their way is turned where they are, never set at the way\'s end; recorded as a walk fallback (' + JSON.stringify(r) + ')');
  SG.end(SG.sceneToken());
  // 3. yn.call
  const cmds = C.scenes['yn.call'].cmds;
  const iw = cmds.findIndex((x) => x.op === 'walkto'), ich = cmds.findIndex((x) => x.op === 'chapter'), isay = cmds.findIndex((x) => x.op === 'say');
  t.ok(iw === ich + 1 && iw < isay && !cmds[iw].if && cmds[iw].args.join(' ') === 'cr_jinpachi pc run max=8000' && cmds.filter((x) => x.op === 'walkto').length === 1,
    'yn.call: he walks up to you after the chapter begins and before his first line, on every path');
  const shape = cmds.filter((x) => x.op !== 'walkto').map((x) => [x.op, x.args || null, x.if || null, x.who || null, x.expr || null, x.jp || null, x.en || null]);
  t.eq(crypto.createHash('sha256').update(JSON.stringify(shape)).digest('hex').slice(0, 16), 'ec763a2d1464952b', 'every other command, line and flag as it was');
  const placed = Object.keys(C.maps).flatMap((id) => (C.maps[id].npcs || []).filter((n) => n.id === 'cr_jinpachi' && n.talk === 'yn.call').map((n) => id + '@' + n.x + ',' + n.y));
  t.ok(placed.includes('cr.summit@5,12') && placed.includes('lf.town@6,18') && placed.filter((x) => /,14$/.test(x)).length === placed.length - 2, 'his places as they were: the stations, the Pass, Lanternfall\'s street (' + placed.join(' ') + ')');
  // 4. the guide
  const g = RB.questGuide.analyse('yn_main', Object.assign(RB.state.newCampaign(), {}));
  t.ok(g && typeof g.how === 'string', 'the quest guide reads the scene with the walk in it (' + (g && g.how) + ')');
};
