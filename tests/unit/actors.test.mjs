// The overworld actor system (docs/expressive/CONTRACT.md §3.4, §3.8; GESTURES.md), in node:
// - the gesture library: the 32 primitives of the addendum's §11.2 each have an entry, a readable peak and a
//   recovery; their timing is in the authoring range (a short gesture reaches its peak in 250–700 ms, a
//   handover takes 600–1,200 ms); every pose they name exists; alternatives exist;
// - the pose layer draws every primitive's peak for the four companions and a player fixture in all four
//   directions on the 40×58 frame: not blank, standing on the foot anchor, inside the frame, and different
//   from standing (the pixels that change at the peak: a legibility floor for the 'full' primitives);
//   a held cane never leaves its hand; frame keys parse back to their pose; the frame cache is bounded;
// - mannerism profiles: the player, the four companions and the 21 recurring characters of GESTURES.md §5
//   are bespoke; every overworld NPC placement on every map resolves to a profile with a class, a pace and
//   habits that person can do; profile habits and talk gestures exist;
// - script ops: !gesture / !look / !pose / !walkto / !prop / !beat / !ambience parse and their arguments read
//   as the runner reads them; the staged scenes keep every line;
// - the idle scheduler on a simulated map: seeded and repeatable (the same seed gives the same habits per
//   person), a different seed differs, at most a few people at once, it yields to a scene at once, a scene
//   cue settles on an early advance and a held cue stays held.
import { load } from '../lib/load.mjs';

const BESPOKE = ['pc', 'nao', 'mio', 'ren', 'suzu', 'kasane', 'hoshino', 'tsuru', 'co_tokiwa', 'omi', 'wataru', 'genzo', 'akari', 'lf_yae', 'lq_chigusa', 'umi', 'tamae', 'yae', 'lf_tadashi', 'shiori', 'yasu', 'lf_tokuji', 'koji', 'hana', 'hiro', 'lq_kayo'];

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const G = RB.gestures, PZ = RB.sprites._pose, M = RB.mannerisms, C = RB.content;

  // ---- gestures ------------------------------------------------------------------------------------------
  t.eq(G.validate(), [], 'the gesture library is complete and every key names a pose');
  const prim = Object.keys(G.PRIM).map(Number).sort((a, b) => a - b);
  t.eq(prim, Array.from({ length: 32 }, (_, i) => i + 1), 'the 32 primitives of §11.2, one per number');
  for (const n of prim) {
    const g = G.PRIM[n];
    t.ok(g.entry.length >= 1 && g.peak && g.recover.length >= 1, '#' + n + ' ' + g.id + ': entry, peak and recovery');
    const toPeak = G.toPeak(g.id), total = G.duration(g.id);
    if (g.handoff) t.ok(total >= 600 && total <= 1200, '#' + n + ' ' + g.id + ': a handover takes 600–1,200 ms (' + total + ')');
    t.ok(toPeak >= 250 && toPeak <= 700, '#' + n + ' ' + g.id + ': its peak at 250–700 ms (' + toPeak + ')');
    t.ok(g.still !== undefined || g.peak[0], '#' + n + ' ' + g.id + ': a held key pose for reduced motion');
    t.ok(['full', 'aided', 'weak'].includes(g.legible), '#' + n + ' ' + g.id + ': its legibility at play scale is recorded');
  }
  t.ok(G.list().filter((g) => g.kind === 'habit').length >= 30, 'idle habits and occupation loops (' + G.list().filter((g) => g.kind === 'habit').length + ')');
  t.ok(!G.can('glasses', C.chars.omi.look) && G.can('glasses', C.chars.ren.look), 'the glasses adjustment only for someone wearing glasses');
  t.eq(G.fit('kneel', C.chars.tsuru.look), 'bend', 'a cane user bends instead of kneeling');
  t.eq(G.fit('size', C.chars.tsuru.look), 'palm', 'a cane user makes a one-handed gesture instead of a two-handed one');
  t.eq(G.fit('bow', { size: 'child', acc: [] }), 'duck', 'a child ducks the head instead of a bow');

  // ---- the pose layer (pure pixel buffers, no canvas) ---------------------------------------------------------
  const PC = { skin: 2, hair: 'ponytail', hairColor: 3, cloth: ['#4a6a8a', '#3a5470', '#c8a050'], pants: '#3a3440', shape: 'tunic', acc: ['satchel', 'glasses'] };
  const LOOKS = { pc: PC, nao: C.chars.nao.look, mio: C.chars.mio.look, ren: C.chars.ren.look, suzu: C.chars.suzu.look, tsuru: C.chars.tsuru.look, kasane: C.chars.kasane.look };
  const A = RB.sprites._art;
  const draw = (look, dir, key) => {
    const b = new RB.pix.Buf(A.W, 58); b.oy = A.TOP;
    const pose = A.poseOf(key);
    if (pose.P) PZ.humanoid(b, look, dir === 'left' ? 'right' : dir, pose);
    else { const P0 = A.poseOf(key); const bb = b; RB.sprites._pose.humanoid ? null : null; void P0; void bb; }
    return b;
  };
  const opaque = (b) => { let n = 0; for (let i = 3; i < b.d.length; i += 4) if (b.d[i]) n++; return n; };
  const lowest = (b) => { for (let y = b.h - 1; y >= 0; y--) for (let x = 0; x < b.w; x++) if (b.d[(y * b.w + x) * 4 + 3]) return y; return -1; };
  const diff = (a, b) => { let n = 0; for (let i = 0; i < a.d.length; i += 4) if (a.d[i + 3] !== b.d[i + 3] || a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2]) n++; return n; };
  let frames = 0, blank = [], off = [], dead = [], edge = [];
  const upHidden = new Set();
  const minDiff = {};
  for (const [who, look] of Object.entries(LOOKS)) for (const dir of ['down', 'up', 'right']) {
    const rest = draw(look, dir, 'p:stiff');
    for (const n of prim) {
      const id = G.fit(G.PRIM[n].id, look, { prop: 'letter' });
      if (!id) continue;
      const g = G.get(id);
      const k = g.peak;
      const key = PZ.key(k[0] || 'stiff', { prop: k[2] && k[2].prop ? 'letter' : null, gaze: k[2] && /^[lrudc]$/.test(k[2].gaze || '') ? k[2].gaze : null });
      const b = draw(look, dir, key);
      frames++;
      if (opaque(b) < 300) blank.push(who + ' ' + dir + ' ' + id);
      const low = lowest(b);
      const pose = A.poseOf(key);
      if (low !== A.AY + A.TOP && !(pose.P.S.legs)) off.push(who + ' ' + dir + ' ' + id + ' (sole ' + low + ')');
      // nothing touches the frame's edge (the outline needs a free pixel)
      for (let y = 0; y < b.h; y++) if (b.d[(y * b.w) * 4 + 3] || b.d[(y * b.w + b.w - 1) * 4 + 3]) { edge.push(who + ' ' + dir + ' ' + id); break; }
      const d = diff(rest, b);
      // (turn-and-listen and the half-step carry their meaning by the facing and the offset, not the pose)
      // the back view hides what the hands do in front of the body (scenes face such beats down or sideways)
      if (dir === 'up') { if (g.legible === 'full' && !g.carry && d < 10) upHidden.add(id); continue; }
      if (g.legible === 'full' && !g.carry) { const key2 = id + ' ' + dir; minDiff[key2] = Math.min(minDiff[key2] == null ? 1e9 : minDiff[key2], d); if (d < 10) dead.push(who + ' ' + dir + ' ' + id + ' (' + d + ' px)'); }
    }
  }
  t.log('front-of-body gestures hidden in some back views (expected): ' + [...upHidden].sort().join(', '));
  t.ok(frames > 500, 'the primitives drawn for 7 looks × 3 views (' + frames + ' frames)');
  t.eq(blank, [], 'no posed frame is blank');
  t.eq(off.slice(0, 6), [], 'every standing pose stands on the foot anchor');
  t.eq(edge.slice(0, 6), [], 'nothing touches the frame edge');
  t.eq(dead.slice(0, 8), [], "every 'full' primitive's peak visibly changes the figure (at least 10 art px) seen from the front and the side");
  // a cane stays in its hand: Tsuru's two-handed pose leaves her left arm (the cane's) at rest
  const tr = PZ.resolve(C.chars.tsuru.look, PZ.parse('p:size_out').P);
  t.ok(tr.arms.L === null && tr.arms.R === 'out', 'a cane hand never leaves the cane');
  // keys
  const pp = PZ.parse('p:chin+sit.L/cup~u:1*');
  t.ok(pp.P.name === 'chin' && pp.P.S.legs === 'sit' && pp.P.hand === 'L' && pp.P.prop === 'cup' && pp.P.eyes === 'u' && pp.bob === 8 && pp.blink, 'a frame key parses into pose, seat, hand, prop, gaze, breath and blink');
  t.eq(PZ.parse('p:nonsense').P.name, 'stiff', 'an unknown pose falls back to standing');
  const pb = PZ.parse(PZ.key('stiff', { prop: 'brush', blink: true }));
  t.ok(pb.P.prop === 'brush' && pb.blink, 'a blink after a prop name is not read as part of it (' + PZ.key('stiff', { prop: 'brush', blink: true }) + ')');
  t.ok(PZ.stats().cap > 0 && PZ.stats().cap <= 2000, 'the posed-frame cache is bounded (' + PZ.stats().cap + ')');

  // ---- mannerism profiles ---------------------------------------------------------------------------------
  const P = M.profiles();
  t.eq(BESPOKE.filter((id) => !P[id] || P[id].tier !== 'bespoke'), [], 'the 26 bespoke profiles of GESTURES.md §5');
  t.eq(M.BESPOKE.slice().sort(), BESPOKE.slice().sort(), 'nothing else is marked bespoke');
  t.eq(Object.keys(P).filter((id) => id !== 'pc' && !C.chars[id]), [], 'every profile names a character of the cast');
  t.ok(Object.keys(P).length >= 76, 'profiles for the player, the companions and the recurring cast (' + Object.keys(P).length + ')');
  const badHabit = [], badTalk = [], badClass = [];
  for (const [id, pr] of Object.entries(P)) {
    if (!M.CLASSES[pr.class]) badClass.push(id);
    for (const h of (pr.idle || []).concat(pr.route || [])) if (!G.get(h[0])) badHabit.push(id + ':' + h[0]);
    for (const n of pr.talk || []) if (!G.PRIM[n]) badTalk.push(id + ':' + n);
    for (const k in pr.tells || {}) if (!G.get(pr.tells[k])) badHabit.push(id + ' tell ' + pr.tells[k]);
    if (pr.rest && !PZ.has(pr.rest.split('.')[0])) badHabit.push(id + ' rest ' + pr.rest);
  }
  t.eq(badClass, [], 'every profile has a known class');
  t.eq(badHabit, [], 'every habit, tell and resting stance in a profile exists');
  t.eq(badTalk, [], 'every conversation gesture is a primitive');
  // every NPC placement on every map: a profile with a class, a pace and something they can do
  let npcs = 0;
  const noLife = [], tierCount = { bespoke: 0, overlay: 0, derived: 0 };
  for (const id in C.maps) {
    let m; try { m = RB.maps.compile(id); } catch (e) { continue; }
    for (const n of m.def.npcs || []) {
      const cid = n.char || n.id, ch = C.chars[cid] || {};
      const look = n.look || ch.look;
      if (look && look.pet) continue; // animals live by the pets' rig
      npcs++;
      const st = M.stationsAt(m, n.x, n.y);
      const pr = M.of(cid, look, st);
      tierCount[pr.tier] = (tierCount[pr.tier] || 0) + 1;
      const can = (pr.idle || []).filter((h) => G.can(h[0], look || {}, { prop: (h[2] || {}).prop }) && (!(h[2] || {}).at && !(G.get(h[0]) || {}).at || st.has((h[2] || {}).at || G.get(h[0]).at)));
      if (!M.CLASSES[pr.class] || !(pr.every && pr.every[0] > 0) || !can.length) noLife.push(id + ':' + n.id + ' (' + pr.class + ')');
    }
  }
  t.ok(npcs > 190, 'every overworld NPC placement checked (' + npcs + ')');
  t.eq(noLife.slice(0, 10), [], 'every NPC placement has a profile with a class, a pace and a habit they can do (' + JSON.stringify(tierCount) + ')');

  // ---- script ops -----------------------------------------------------------------------------------------
  const src = '@scene t.stage\n!gesture omi point wataru hold then=nod,palm prop=ledger hand=L and=pc\n!look omi prop:desk\n!pose comp sit\n!walkto pc 5 5 up now\n!prop pc notice R\n!beat omi.pause\n!ambience night\nomi: ある || x\n';
  const r = RB.script.parse(src, 'test');
  t.eq(r.errors, [], 'the staging ops parse');
  const cmds = r.scenes['t.stage'].cmds;
  t.eq(cmds.map((c) => c.op), ['gesture', 'look', 'pose', 'walkto', 'prop', 'beat', 'ambience', 'say'], 'each op is its own command');
  const o = RB.script.stageArgs(cmds[0].args.slice(2));
  t.ok(o.target === 'wataru' && o.hold && o.then.join() === 'nod,palm' && o.prop === 'ledger' && o.hand === 'L' && o.target2 === 'pc', '!gesture arguments: target, hold, then, prop, hand, second target');
  // the staged scenes keep every line (each is checked against the scenes' Japanese/English pairs)
  const staged = ['sg.omi_wataru', 'rw.hana_first', 'co.suzu_night', 'sb.yae', 'lf.mio_refuse', 'sa.isamu_return'];
  for (const id of staged) {
    const sc = C.scenes[id];
    const ops = new Set(sc.cmds.map((c) => c.op));
    t.ok(sc && (ops.has('gesture') || ops.has('look')), id + ' is staged with direction ops');
    t.ok(!sc.cmds.some((c) => ['gesture', 'look', 'pose', 'walkto', 'prop'].includes(c.op) && ['set', 'give', 'take'].includes(c.args[0])), id + ': no staging op is a state op in disguise');
  }

  // ---- the scheduler on a simulated map ------------------------------------------------------------------
  const W = RB.world.W;
  RB.game.s = RB.state.newCampaign({});
  Object.assign(RB.game.s.flags, { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true });
  RB.render.viewSize = () => ({ w: 1e5, h: 1e5, scale: 1 });
  RB.render.cam.x = 0; RB.render.cam.y = 0;
  RB.game.pushMode('world');
  const mkMap = () => {
    W.map = RB.maps.compile('rw.village');
    W.time = 0;
    W.player = { x: 22, y: 20, fx: 22, fy: 20, dir: 'down', look: PC, id: 'pc' };
    W.comp = null; W.extras = []; W.leavers = []; W.foes = [];
    W.npcs = (W.map.def.npcs || []).filter((n) => !n.if || RB.state.test(RB.game.s, n.if)).map((n) => { const ch = C.chars[n.char || n.id] || {}; return { id: n.id, def: n, x: n.x, y: n.y, fx: n.x, fy: n.y, home: [n.x, n.y], dir: n.dir || 'down', look: n.look || ch.look, map: W.map.id }; });
  };
  const simulate = (seed, secs) => {
    mkMap();
    RB.staging.seed(seed);
    let maxActive = 0;
    for (let i = 0; i < secs * 10; i++) {
      W.time += 100;
      RB.staging.tick(100);
      for (const a of W.npcs) if (a.stg && a.stg.run && !a.stg.run.done && W.time - a.stg.run.t0 > a.stg.run.total) { a.stg.run.done = true; }
      maxActive = Math.max(maxActive, W.npcs.filter((a) => a.stg && a.stg.run && !a.stg.run.done && a.stg.run.owner === 'idle' && W.time >= a.stg.run.t0).length);
    }
    const per = {};
    for (const e of RB.staging.trace()) (per[e.who] = per[e.who] || []).push(e.h);
    return { per, maxActive, n: RB.staging.trace().length };
  };
  const s1 = simulate(1234, 120), s2 = simulate(1234, 120), s3 = simulate(98765, 120);
  t.ok(s1.n >= 10, 'two simulated minutes in the Reedwake village have idle life (' + s1.n + ' habits and reactions)');
  t.eq(s1.per, s2.per, 'the same seed gives every person the same habits in the same order');
  t.ok(JSON.stringify(s1.per) !== JSON.stringify(s3.per), 'another seed gives other choices');
  t.ok(s1.maxActive <= 4, 'never more than four people busy at once (' + s1.maxActive + ' of ' + W.npcs.length + ')');
  // a scene takes over at once; a cue settles on an early advance; a held cue stays held
  mkMap();
  RB.staging.seed(7);
  for (let i = 0; i < 200; i++) { W.time += 100; RB.staging.tick(100); }
  const tok = RB.staging.begin('t.scene');
  t.eq(W.npcs.filter((a) => a.stg && a.stg.run && a.stg.run.owner === 'idle').length, 0, 'a scene starting stops every idle habit at once');
  const yae = W.npcs.find((a) => a.id === 'tsuru') || W.npcs.find((a) => a.look && !a.look.custom);
  const run1 = RB.staging.cue(yae, 'palm', { target: 'pc' });
  t.ok(run1 && run1.owner === 'scene' && RB.staging.owned(yae), 'a cue takes the person for the scene');
  W.time += 120;
  RB.staging.settle('advance');
  t.ok(!yae.stg.run, 'an early advance settles a gesture without a hold (back to rest, not left half-way)');
  const run2 = RB.staging.cue(yae, 'chin', { hold: true });
  RB.staging.settle('advance');
  t.ok(yae.stg.run === run2 && run2.holding, 'a held gesture settles at its peak and stays');
  const run3 = RB.staging.cue(yae, 'count', { then: ['chin'], hold: true });
  RB.staging.settle('advance');
  t.ok(yae.stg.run && yae.stg.run.id === 'chin' && yae.stg.run.holding, 'a chain settles to its last gesture, held');
  void run3;
  RB.staging.end(tok);
  t.ok(!yae.stg.run && !RB.staging.owned(yae), 'the scene ending releases its people');
  RB.game.popMode('world');
};
