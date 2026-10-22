// RBN-QA-124 (Agnes 6347127013, 6351678399, 6350945110; Local CL-222, CL-226; Cloud CC-127 §8, CC-128 §3): Suzu's
// evening at the little theatre said the house was packed, with the ridge's people on the floor, and showed Ginnojō
// alone; Koume "walked straight over" from wherever she stood. With synthetic journeys, the scene played through the
// real runner (dialogue collected, the warp entering the map without its fade):
//  1. the condition head `scene.<id>`: true only while that scene runs for this journey, on its own or called; false
//     before and after, for any other journey object, and after a journey is replaced; never guessed ahead (peek);
//  2. the scene's commands: the theatre marked seen before the warp (its daytime introduction never follows), the
//     night's light, Koume's walk before her first line and the narration for each outcome; every other command,
//     line and flag as it was;
//  3. the audience: seven townsfolk without lines or names (four on the benches, three newcomers from the ridge on the
//     floor), there only while the scene runs; their places on the benches' own tiles or free floor, clear of every
//     other placement here, the way down from the stage, your place and your companion's, the way out;
//  4. the evening played: every line with the house full and the night's light; Koume walks up to you (within 2) and
//     the narration says so; with no free place near you she stays where she is and the narration has her call out;
//     afterwards nobody of the audience is left, the light is the room's own, and nothing of them is in the journey;
//  5. outside the evening (before it, after the valley's story), the theatre has no audience.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, W = () => RB.world.W;
  const AUD = C.playhouseAudience || [];
  const map = C.maps['yn.playhouse'];
  const SHOW = 'yn.suzu_evening';

  // ---- a minimal stage: the real runner, with dialogue collected and the warp entering the map at once ------------
  let lines = [], onWarp = null;
  const snap = () => {
    const w = W(), k = w.npcs.find((n) => n.id === 'yn_koume');
    return { map: w.map && w.map.id, aud: w.npcs.filter((n) => AUD.includes(n.id)).map((n) => n.id + '@' + n.x + ',' + n.y).sort(), koume: k ? [k.x, k.y] : null,
      pc: [w.player.x, w.player.y], comp: w.comp ? [w.comp.x, w.comp.y] : null, term: S.test(RB.game.s, 'scene.' + SHOW), amb: RB.staging.ambienceNow() };
  };
  RB.ui.dialogue.say = async (l) => { lines.push(Object.assign({ who: l.who, en: l.en || '' }, snap())); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.game.transition = async (id, x, y, dir) => { RB.world.enter(id, x, y, dir || 'down', {}); if (onWarp) onWarp(); };
  RB.staging.enabled(true);
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'pa-test'; s.map = o.map || 'yn.lower'; s.x = 35; s.y = 10; s.comp = o.comp === undefined ? 'suzu' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    for (const f of o.flags || []) s.flags[f] = true;
    RB.game.G.s = s;
    RB.world.enter(s.map, s.x, s.y, 'up', {});
    return s;
  };
  const run = async (id) => { lines = []; await RB.script.run(id); return lines; };
  RB.game.setFastForward(true); // (Skip: a walk is set at its end at once; the runner's own wait, without a frame loop)

  // ---- 1. the condition head ------------------------------------------------------------------------------------------
  RB.script.add('@scene t.outer\nnarr: そと 。 || Outer.\n!call t.inner\nnarr: また そと 。 || Outer again.\n\n@scene t.inner\nnarr: なか 。 || Inner.\n', 't');
  let s = fresh();
  const probe = [];
  RB.ui.dialogue.say = async (l) => { probe.push([l.en, S.test(RB.game.s, 'scene.t.outer'), S.test(RB.game.s, 'scene.t.inner'), S.test(RB.game.s, '!scene.t.inner'), S.test(S.newCampaign({ edition: 2 }), 'scene.t.outer')]); };
  const before = S.test(s, 'scene.t.outer');
  await RB.script.run('t.outer');
  const after = S.test(s, 'scene.t.outer') || S.test(s, 'scene.t.inner');
  t.eq(probe, [['Outer.', true, false, true, false], ['Inner.', true, true, false, false], ['Outer again.', true, false, true, false]],
    'scene.<id>: true while that scene runs, on its own or called from another; false for any other journey object');
  t.ok(!before && !after, 'scene.<id>: false before the scene and after it ends');
  t.eq(S.peek(s, 'scene.t.outer'), null, 'never guessed ahead: the voice lookahead\'s peek answers "not known now"');
  // a journey replaced while the scene runs (a load or a new journey): nothing of the old run is counted
  probe.length = 0;
  RB.ui.dialogue.say = async (l) => { if (l.en === 'Outer.') { RB.bus.emit('campaign:changing'); probe.push(S.test(RB.game.s, 'scene.t.outer')); } };
  await RB.script.run('t.outer');
  t.eq(probe, [false], 'a journey replaced while the scene runs: the scene no longer counts as running');
  RB.ui.dialogue.say = async (l) => { lines.push(Object.assign({ who: l.who, en: l.en || '' }, snap())); };

  // ---- 2. the scene's commands ----------------------------------------------------------------------------------------
  const cmds = C.scenes[SHOW].cmds;
  const at = (f) => cmds.findIndex(f);
  const iSeen = at((c) => c.op === 'set' && (c.args || [])[0] === 'yn_playhouse_seen'), iWarp = at((c) => c.op === 'warp'), iAmb = at((c) => c.op === 'ambience');
  const iWalk = at((c) => c.op === 'walkto'), iK = at((c) => c.who === 'yn_koume');
  const iW1 = at((c) => c.if === 'var._walked=1'), iW0 = at((c) => c.if === 'var._walked=0');
  t.ok(iSeen === 0 && iWarp === 1 && iAmb === 2 && cmds[iAmb].args[0] === 'night_in' && !cmds[iSeen].if && !cmds[iAmb].if,
    'the theatre marked seen before the warp (its daytime introduction never follows); the night\'s light from the warp on');
  t.ok(iWalk > iAmb && iWalk === iW1 - 1 && iW0 === iW1 + 1 && iK === iW0 + 1 && !cmds[iWalk].if && cmds[iWalk].args.join(' ') === 'yn_koume pc' && cmds.filter((c) => c.op === 'walkto').length === 1,
    'Koume walks up to you after the show and before her first line, on every path; then the narration for what happened');
  t.ok(iW1 >= 0 && /walks straight over/.test(cmds[iW1].en) && iW0 >= 0 && cmds[iW0].en === 'When the show ends, Koume calls out to you.' && !/stage/.test(cmds[iW0].en) && !/舞台/.test(cmds[iW0].jp),
    'she walked: the line as it was; she could not: she calls out to you, said without a place (never "from the stage")');
  const added = (c) => (c.op === 'set' && (c.args || [])[0] === 'yn_playhouse_seen') || (c.op === 'ambience' && (c.args || [])[0] === 'night_in') || c.op === 'walkto' || c.if === 'var._walked=0';
  const shape = cmds.filter((c) => !added(c)).map((c) => [c.op, c.args || null, c.if === 'var._walked=1' ? null : c.if || null, c.who || null, c.expr || null, c.jp || null, c.en || null]);
  t.eq(crypto.createHash('sha256').update(JSON.stringify(shape)).digest('hex').slice(0, 16), '52e5a9c1bc031aab', 'every other command, line and flag of the evening as it was');

  // ---- 3. the audience ------------------------------------------------------------------------------------------------
  const defs = map.npcs.filter((n) => AUD.includes(n.id));
  const others = map.npcs.filter((n) => !AUD.includes(n.id));
  const benches = map.props.filter((p) => p.p === 'bench').flatMap((p) => [[p.x, p.y], [p.x + 1, p.y]].map(String));
  const props = map.props.filter((p) => p.p !== 'bench').map((p) => String([p.x, p.y]));
  const prof = (id) => (RB.mannerisms.profiles()[id] || {});
  const sit = defs.filter((n) => prof(n.id).rest === 'sit'), floor = defs.filter((n) => prof(n.id).rest === 'sitlap');
  t.ok(AUD.length === 7 && defs.length === 7 && sit.length === 4 && floor.length === 3, 'seven of them: four on the benches, three on the floor (' + AUD.join(' ') + ')');
  t.ok(defs.every((n) => n.if === 'scene.' + SHOW && !n.talk && !n.look && !C.chars[n.id] && n.dir === 'up'), 'there only while the evening runs; no lines, no name, the world\'s own looks; facing the stage');
  t.ok(sit.every((n) => benches.includes(String([n.x, n.y])) && n.block === false) && floor.every((n) => !benches.includes(String([n.x, n.y])) && n.block !== false),
    'on the benches: on a bench\'s own tiles (block false); on the floor: on the floor');
  const m = RB.maps.compile('yn.playhouse');
  const exitT = map.exits.map((e) => String([e.x, e.y])).concat(map.props.filter((p) => p.p === 'exitmat').map((p) => String([p.x, p.y])));
  t.ok(floor.every((n) => !RB.maps.blockedStatic(m, n.x, n.y) && !props.includes(String([n.x, n.y]))), 'the floor places are free floor (no wall, stage edge or prop)');
  const spots = defs.map((n) => String([n.x, n.y]));
  t.ok(new Set(spots).size === 7 && !spots.some((x) => others.some((o) => String([o.x, o.y]) === x)) && !spots.some((x) => exitT.includes(x)),
    'every place its own: none on another placement here (Koume, Shinza, Ginnojō, the sign painter\'s place in his round), the way out or its mat');
  t.ok(defs.every((n) => n.x !== 6 && n.x !== 7 && Math.max(Math.abs(n.x - 8), Math.abs(n.y - 7)) >= 2), 'clear of the way down from the stage (x 6–7) and of your place and the tiles round it (8,7)');
  t.ok(defs.every((n) => prof(n.id).class === 'town' && prof(n.id).tier === 'overlay'), 'each seated with the town\'s small habits');
  t.ok(RB.town.findable().every((p) => !AUD.includes(p)), 'never someone you can ask after');

  // ---- 4. the evening played ------------------------------------------------------------------------------------------
  s = fresh();
  const room = RB.maps.compile('yn.playhouse');
  let L = await run(SHOW);
  const full = (l) => l.map === 'yn.playhouse' && l.aud.length === 7 && l.term && l.amb && l.amb.night;
  t.ok(L.length >= 8 && L.every(full), 'every line of the evening with the house full and the night\'s light (' + L.length + ' lines)');
  const K = L.filter((l) => l.who === 'yn_koume');
  const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  t.ok(s.vars._walked === 1 && K.length === 2 && K.every((l) => l.koume && cheb(l.koume, l.pc) <= 2 && !AUD.some((id) => l.aud.includes(id + '@' + l.koume.join()))),
    'Koume walks up to you: within 2 for her lines, on a tile of her own (' + JSON.stringify(K.map((l) => [l.koume, l.pc, l.comp])) + ')');
  t.ok(L.some((l) => /walks straight over/.test(l.en)) && !L.some((l) => /calls out to you/.test(l.en)), 'and the narration says she walked over');
  // her way down: from the stage to her mark, past the audience, the benches and your companion
  const kDef = map.npcs.find((n) => n.id === 'yn_koume');
  t.ok(kDef.x === 7 && kDef.y === 3 && !RB.maps.blockedStatic(room, K[0].koume[0], K[0].koume[1]), 'she came from her place on the stage (7,3) to a floor tile');
  let w = snap();
  t.ok(!w.aud.length && !w.term && !w.amb && !S.test(s, '!yn_playhouse_seen') && !s.seen['yn.playhouse_first'],
    'afterwards: nobody of the audience left, the room\'s own light, the theatre seen without its daytime introduction (' + JSON.stringify(w) + ')');
  t.ok(!/yn_aud_/.test(JSON.stringify(s)), 'nothing of the audience is in the journey (no sighting, no flag, no record)');
  // no free place within 2 of you: she stays where she is, and calls out
  s = fresh();
  onWarp = () => {
    const ww = W(), p = ww.player, tpl = ww.npcs[0];
    let k = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = p.x + dx, y = p.y + dy;
      if ((!dx && !dy) || RB.maps.blockedStatic(ww.map, x, y) || RB.maps.exitAt(ww.map, x, y)) continue;
      if ((ww.comp && ww.comp.x === x && ww.comp.y === y) || ww.npcs.concat(ww.extras).some((n) => n.x === x && n.y === y)) continue;
      ww.extras.push(Object.assign(Object.create(Object.getPrototypeOf(tpl)), tpl, { id: 'crowd' + k++, x, y, fx: x, fy: y, mv: null, route: null, def: { id: 'crowd' }, extra: true }));
    }
  };
  L = await run(SHOW);
  onWarp = null;
  const K0 = L.filter((l) => l.who === 'yn_koume');
  t.ok(s.vars._walked === 0 && K0.length === 2 && K0.every((l) => l.koume && l.koume.join() === '7,3') && L.some((l) => l.en === 'When the show ends, Koume calls out to you.') && !L.some((l) => /walks straight over/.test(l.en)),
    'no free place within 2 of you: she stays where she is and the narration has her call out to you (' + JSON.stringify(K0.map((l) => l.koume)) + ')');
  t.ok(L.every(full), 'and the house is full for every line');
  w = snap();
  t.ok(!w.aud.length && !w.term, 'afterwards nobody of the audience is left');

  // ---- 5. outside the evening ------------------------------------------------------------------------------------------
  const empty = [];
  for (const [label, flags] of [['before the evening', []], ['the evening done', ['yn_eve_done', 'yn_suzu_crossroads', 'yn_apart']], ['the valley\'s story done', ['yn_done', 'yn_eve_done']]]) {
    s = fresh({ map: 'yn.playhouse', flags });
    RB.world.refreshActors();
    if (snap().aud.length) empty.push(label);
  }
  t.eq(empty, [], 'outside the evening the theatre has no audience (before it, after it, after the valley\'s story)');
};
