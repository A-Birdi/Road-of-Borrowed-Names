// Exploration actions (expansion P05, W9 and W11–W17; src/engine/55b_verbs.js, the fixtures in
// src/content/verbs/00_fixtures.js). The playbook's evidence: words and movement agree and a notice changes things
// once; unsuitable wording cannot cut off a way; every courier plan that reaches every recipient works; a repair's
// wrong step explains itself and changes nothing; water settles in one pass, connected bodies agree, the effect
// reaches the other map, and a required way can always be reopened; a machine's pattern depends on what was
// adjusted, never on timing; a creature can always be moved without a fight, and a sound has words and a cue; a
// layered site's observations line up with the map and several readings may be valid; stage directions are checked
// position by position, scenery cannot be stood in, and rehearsing again costs nothing. Fixtures never reach a
// journey.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const V = RB.verbs, FW = RB.fieldweave, C = RB.content;
  const camp = (dev = true) => { const s = RB.state.newCampaign({}); s.id = 'verbs-test'; s.map = 'rw.road'; if (dev) s.flags.dev_verbs = true; RB.game.s = s; return s; };
  const changes = [];
  RB.bus.on('world:changed', (e) => changes.push(e));

  // ---- every fixture is sound, and none reaches a journey ---------------------------------------------------------
  const KINDS = ['notice', 'courier', 'repair', 'network', 'observe', 'follow', 'route', 'layers', 'blocking'];
  t.eq(KINDS.filter((k) => V.list(k).length), KINDS, 'one fixture of every kind');
  for (const v of V.list()) t.eq(v.errors, [], v.id + ' (' + v.kind + ') passes its own checks');
  {
    const s = camp(false);
    for (const m of ['rw.road', 'sg.road']) {
      t.eq(FW.objectsOn(s, m).filter((o) => o.def.verb).length, 0, m + ': no action objects in a journey');
      const def = C.maps[m];
      t.ok((def.props || []).filter((p) => p.o && p.o.vb).every((p) => !RB.state.test(s, p.if)), m + ': their props are not there');
      t.ok((def.npcs || []).filter((n) => /^vbp_/.test(n.id)).every((n) => !RB.state.test(s, n.if)), m + ': nor their people');
      t.ok((def.foes || []).filter((n) => /^vbf_/.test(n.id)).every((n) => !RB.state.test(s, n.if)), m + ': nor their creatures');
    }
    t.eq(FW.list().filter((d) => d.verb).length, 0, 'the authored puzzles\' list stays as it was');
    t.throws = (fn) => { try { fn(); return false; } catch (e) { return true; } };
    t.ok(t.throws(() => V.define('notice', { id: 'bad.id' })), 'an id with a dot is refused (conditions would misread it)');
  }

  // ---- W9 · notices -----------------------------------------------------------------------------------------------
  {
    const s = camp(), spec = V.get('vb_notice');
    const at = (who) => RB.world.mapsWith(who).filter((m) => m === 'rw.road').length;
    const placeOf = (who) => C.maps['rw.road'].npcs.filter((n) => n.char === who && RB.state.test(s, n.if)).map((n) => n.x + ',' + n.y);
    t.eq(placeOf('tobi'), ['25,13'], 'before: people mill in front of the board, in one place each');
    t.eq(FW.act(s, 'vb_notice', 'post').effective, false, 'an unfinished notice cannot be posted');
    FW.arrange(s, 'vb_notice', { where: 'left', do: 'run' });
    let r = FW.act(s, 'vb_notice', 'post');
    t.eq([r.effective, FW.stateOf(s, 'vb_notice').behaviour, r.completed], [true, 'unclear', false], 'unsuitable words: posted, understood as unclear, not a solution');
    t.eq(placeOf('tobi'), ['25,13'], 'and nobody moves: words and movement agree');
    r = FW.act(s, 'vb_notice', 'post');
    t.eq([r.effective, r.say[0].en], [false, 'That notice is already up.'], 'posting the same words again changes nothing: once');
    FW.arrange(s, 'vb_notice', { do: 'line' });
    r = FW.act(s, 'vb_notice', 'post');
    t.eq([FW.stateOf(s, 'vb_notice').behaviour, r.completed, r.method], ['queue_left', true, 'notice:queue_left'], 'a notice people follow: they queue on the left');
    t.ok(r.say[0].en.indexOf('left') >= 0 && r.say[0].jp.indexOf('{左|ひだり}') >= 0, 'what they understood, in both languages');
    t.eq(placeOf('tobi'), ['24,13'], 'and they stand where it said, one place each');
    t.eq(at('tobi'), 1, 'one person, one place');
    FW.arrange(s, 'vb_notice', { where: 'road' });
    r = FW.act(s, 'vb_notice', 'post');
    t.eq([r.effective, r.stale, FW.stateOf(s, 'vb_notice').behaviour], [false, true, 'queue_left'], 'once followed, the notice stays: the result is kept');
    // a different valid notice works differently
    const s2 = camp();
    FW.arrange(s2, 'vb_notice', { where: 'right', do: 'wait' });
    const r2 = FW.act(s2, 'vb_notice', 'post');
    t.eq([FW.stateOf(s2, 'vb_notice').behaviour, r2.completed], ['queue_right', true], 'another valid notice: they queue on the right instead');
    t.eq(V.noticeText(spec, FW.stateOf(s2, 'vb_notice')).jp, '{右|みぎ} に {待|ま}って ください', 'the notice reads as written');
    // navigation safety
    t.eq(V.noticeSafety(spec), [], 'no wording, followed or not, cuts off a way out of the road');
    const wall = Object.assign({}, spec, { people: { none: [], unclear: [], on_road: [] } });
    for (let y = 0; y < 18; y++) wall.people.on_road.push({ char: 'x', x: 16, y });
    t.ok(V.noticeSafety(wall).some((x) => /^on_road cuts off/.test(x)), 'a crowd that would block the road is caught: ' + V.noticeSafety(wall).join('; '));
  }

  // ---- W11 · courier rounds ----------------------------------------------------------------------------------------
  {
    const s = camp(), spec = V.get('vb_courier');
    t.ok(spec.plans >= 2, 'several plans work (' + spec.plans + ')');
    const good1 = V.courierCheck(spec, ['harbour', 'tea', 'square']), good2 = V.courierCheck(spec, ['tea', 'inn', 'square']);
    t.ok(good1.ok && good2.ok, 'two different rounds that reach everyone');
    const bad = V.courierCheck(spec, ['tea', 'tea', 'inn']);
    const fuku = bad.parcels.find((p) => p.parcel === 'medicine');
    t.ok(!bad.ok && !fuku.ok && fuku.where.length === 3, 'a round that misses Fuku says where she is on each leg');
    FW.arrange(s, 'vb_courier', { leg0: 'tea', leg1: 'tea', leg2: 'inn' });
    t.eq(FW.act(s, 'vb_courier', 'go').effective, false, 'setting out on a round that misses someone: not yet');
    FW.arrange(s, 'vb_courier', { leg0: 'harbour', leg1: 'tea', leg2: 'square' });
    t.eq(FW.act(s, 'vb_courier', 'go').completed, true, 'a round that reaches everyone: delivered');
    t.ok(!/clock|minute|hour|timer/i.test(JSON.stringify(spec)), 'legs of a round, never a clock');
  }

  // ---- W12 · repair jobs ---------------------------------------------------------------------------------------------
  {
    const s = camp(), spec = V.get('vb_repair');
    let r = FW.act(s, 'vb_repair', 'use:oil@well');
    t.eq([r.effective, r.say[0].en], [false, 'Not yet: the instructions start with the glass.'], 'out of order: explained, nothing changes');
    r = FW.act(s, 'vb_repair', 'use:scissors@glass');
    t.ok(!r.effective && /does not suit the glass\. Nothing is harmed/.test(r.say[0].en), 'the wrong tool: explained, nothing harmed: ' + r.say[0].en);
    t.ok(!FW.act(s, 'vb_repair', 'test').completed, 'testing too early: it still will not run, and says so');
    t.ok(FW.act(s, 'vb_repair', 'read').say.length === 3, 'the instructions, three steps');
    for (const st of spec.steps) t.ok(FW.act(s, 'vb_repair', 'use:' + st.tool + '@' + st.part).effective, 'step: ' + st.tool + ' on the ' + st.part);
    r = FW.act(s, 'vb_repair', 'use:cloth@glass');
    t.eq(r.say[0].en, 'It is already mended. Try it.', 'after the last step, the next is to test it');
    t.eq(FW.act(s, 'vb_repair', 'test').completed, true, 'tested: it runs');
    t.eq(V.KINDS.repair.check(Object.assign({}, spec, { tools: spec.tools.slice(1) })).length > 0, true, 'a job that does not supply a needed tool is refused');
    t.eq(V.KINDS.repair.check(Object.assign({}, spec, { needs: 'item.oil' })).length > 0, true, 'and one that asks you to bring materials');
  }

  // ---- W13 · connected mechanisms -------------------------------------------------------------------------------------
  {
    const s = camp(), spec = V.get('vb_network');
    const st = () => FW.stateOf(s, 'vb_network');
    t.eq([st().b_pond, st().b_ditch, st().b_ford, st().b_outflow], [3, 0, 0, 0], 'the start: the pond full, the rest drained');
    // the barrier at the ford follows the water
    const barrier = (ss) => (C.maps['sg.road'].props || []).filter((p) => p.o && p.o.barrier && RB.state.test(ss, p.if)).length;
    t.eq(barrier(s), 0, 'the ford is passable');
    changes.length = 0;
    let r = FW.act(s, 'vb_network', 'open:g1');
    t.eq([st().b_ditch, st().b_ford, st().b_outflow], [3, 3, 3], 'opening the pond sluice with the rest open: the water runs through to the ford');
    t.ok(changes.some((e) => e.map === 'sg.road' && e.prop === 'vb_network.b_ford') && changes.some((e) => e.map === 'rw.road' && e.prop === 'vb_network.b_ditch'), 'the change reaches both maps');
    t.ok(/Somewhere off in the ford fills/.test(r.say[0].en) || /ford fills/.test(r.say[0].en), 'and is traced in words: ' + r.say[0].en);
    t.eq(barrier(s), 2, 'the ford floods: the way across is shut');
    t.eq(r.completed, false, 'the channel is full but the ford is flooded: not the outcome');
    FW.act(s, 'vb_network', 'shut:g2');
    t.eq([st().b_ditch, st().b_ford], [3, 0], 'closing the ford sluice: the channel stays full, the ford drains out');
    t.ok(FW.peek(s, 'vb_network').done, 'the channel full and the ford passable: done');
    t.eq(barrier(s), 0, 'and the way across is open again');
    // the model
    for (const [k, x] of V.explore(FW.get('vb_network'), Object.keys(spec.gates).flatMap((g) => ['open:' + g, 'shut:' + g])).states) {
      const again = Object.assign({}, x, V.settle(spec, x));
      if (JSON.stringify(again) !== JSON.stringify(x)) { t.ok(false, 'unsettled: ' + k); break; }
    }
    const safe = V.networkSafety(spec);
    t.eq([safe.problems, safe.capped], [[], false], 'every reachable state settles, and the way across can always be reopened (' + safe.states + ' states)');
    // a network that could trap you is caught
    const trap = JSON.parse(JSON.stringify(spec));
    trap.id = 'vb_trap'; trap.drains = []; delete trap.gates.g3; trap.gates.g2.open = true;
    trap.basins = { pond: spec.basins.pond, ditch: spec.basins.ditch, ford: spec.basins.ford };
    const trapDef = V.KINDS.network.build(trap);
    trapDef.id = 'vb_trap'; FW.define(Object.assign(trapDef, { verb: 'network' }));
    t.ok(V.networkSafety(trap).problems.some((p) => /crossing cannot be reopened/.test(p)), 'a ford that, once flooded, could never drain again is caught');
    // saved and loaded
    const s2 = JSON.parse(JSON.stringify(s));
    t.eq(FW.stateOf(s2, 'vb_network'), st(), 'a map reload keeps the water where it was');
  }

  // ---- W14 · observation-first mechanisms; instructions to follow ------------------------------------------------------
  {
    const s = camp(), spec = V.get('vb_observe');
    t.eq(V.pattern(spec, ''), ['turn', 'knock', 'lift', 'stuck'], 'the machine as it is');
    t.eq(V.pattern(spec, 'ring,oil,order'), V.pattern(spec, 'order,oil,ring'), 'the adjustments made decide the pattern, not the order they were made in');
    t.eq(V.pattern(spec, 'oil,ring').join(), 'turn,strike,lift', 'without changing the order, the hammer still strikes before it rises');
    const seq = [0, 900, 1800, 2700, 3600].map((ms) => V.phaseAt(spec, { adj: '' }, ms));
    t.eq(seq, ['turn', 'knock', 'lift', 'stuck', 'turn'], 'the phase shown at each moment, cycling (the diagram and the prop share it)');
    t.ok(FW.act(s, 'vb_observe', 'note:catch_dry'), 'an observation');
    t.ok(FW.peek(s, 'vb_observe').seen.catch_dry, 'is kept');
    FW.act(s, 'vb_observe', 'adjust:oil'); FW.act(s, 'vb_observe', 'adjust:ring');
    t.eq(FW.peek(s, 'vb_observe').done, false, 'two of three: not yet');
    let r = FW.act(s, 'vb_observe', 'adjust:ring');
    t.eq(FW.stateOf(s, 'vb_observe').adj, 'oil', 'an adjustment can be undone');
    t.ok(/undo/.test(r.say[0].en), 'and says so');
    FW.act(s, 'vb_observe', 'adjust:order'); r = FW.act(s, 'vb_observe', 'adjust:ring');
    t.ok(r.completed, 'turn, lift, strike: done');
    t.ok(FW.peek(s, 'vb_observe').seen.catch_dry, 'and the observation is still there');
    t.ok(!/\btiming\b|\bquick(ly)?\b|\bin time\b|\bbefore it stops\b/i.test(JSON.stringify(spec.adjustments)), 'no adjustment asks for timing');
    // follow
    const s3 = camp();
    r = FW.act(s3, 'vb_follow', 'do:0:corner');
    t.eq([r.effective, r.say[0].en], [false, 'Not yet: in half first.'], 'the wrong fold: explained, nothing changes');
    for (const a of ['do:0:half', 'do:1:corners']) t.ok(FW.act(s3, 'vb_follow', a).effective, a);
    t.eq(FW.act(s3, 'vb_follow', 'do:0:half').effective, false, 'a step already done does not repeat');
    t.ok(FW.act(s3, 'vb_follow', 'do:2:open').completed, 'folded');
  }

  // ---- W15 · creature routing -----------------------------------------------------------------------------------------
  {
    const s = camp(); s.map = 'sg.road';
    const spec = V.get('vb_route');
    const foesHere = () => (C.maps['sg.road'].foes || []).filter((f) => /^vbf_/.test(f.id) && RB.state.test(s, f.if)).map((f) => f.x + ',' + f.y);
    t.eq(foesHere(), ['18,20'], 'the fog wisp sits in front of the way down, in one place');
    let r = FW.weave(s, 'vb_route', 'bellpost', 'mizu', { mode: 'choice' });
    t.eq(r.effective, false, 'water on the bell post: nothing (plain feedback, never a language failure)');
    r = FW.weave(s, 'vb_route', 'lamp', 'hikari', { mode: 'choice', assisted: false });
    t.eq([FW.stateOf(s, 'vb_route').route, r.completed], ['shade', true], 'light on the lamp: it drifts into the shade, and the way is clear');
    t.eq(foesHere(), ['16,18'], 'it is now by the wall');
    t.eq(FW.peek(s, 'vb_route').log.slice(-1)[0].lang.mode, 'choice', 'the language step is recorded as it happened');
    t.eq(FW.weave(s, 'vb_route', 'bellpost', 'suzu', { mode: 'hand' }).effective, false, 'once it is out of the way, it stays where it went');
    // another journey: the bell, straight away
    const s4 = camp(); s4.map = 'sg.road';
    r = FW.weave(s4, 'vb_route', 'bellpost', 'suzu', { mode: 'hand' });
    t.eq([FW.stateOf(s4, 'vb_route').route, r.completed], ['away', true], 'or the bell sends it off down the road');
    RB.game.s = s4;
    t.eq((C.maps['sg.road'].foes || []).filter((f) => /^vbf_/.test(f.id) && RB.state.test(s4, f.if)).length, 0, 'gone');
    t.ok(r.say[0].jp && r.say[0].en && r.fx === 'ring', 'the sound has words in both languages and a visible cue');
    t.ok(V.KINDS.route.check(Object.assign({}, spec, { means: [Object.assign({}, spec.means[1], { say: null })] })).some((e) => /words and a visible cue/.test(e)), 'a sound without words is refused');
    t.ok(V.KINDS.route.check(Object.assign({}, spec, { means: [] })).some((e) => /without a fight/.test(e)), 'and a creature that could only be fought');
  }

  // ---- W16 · layered sites -----------------------------------------------------------------------------------------------
  {
    const spec = V.get('vb_layers');
    const m = RB.maps.compile('rw.road');
    t.ok(spec.plan.marks.every((mk) => mk.x >= 0 && mk.y >= 0 && mk.x < m.w && mk.y < m.h), 'the old plan\'s marks line up with today\'s map');
    const trig = C.maps['rw.road'].triggers.filter((x) => x.vb === 'vb_layers');
    t.eq(trig.length, 3, 'a place to compare at each mark');
    const s = camp();
    t.ok(trig.every((x) => !RB.state.test(s, x.if)), 'not before you have read the plan');
    RB.cases.open(s, 'vb_layers');
    t.ok(trig.every((x) => RB.state.test(s, x.if)), 'then, each until you have compared it');
    t.eq(V.conclude(s, 'vb_layers', 'filled').ok, false, 'no reading before any observation');
    const c1 = V.compareAt(s, 'vb_layers', 'well');
    t.ok(c1.fresh && RB.cases.observed(s, 'vb_layers.well'), 'compared where it is: observed');
    t.eq(V.compareAt(s, 'vb_layers', 'well').fresh, false, 'once');
    t.ok(!RB.state.test(s, trig.find((x) => x.mark === 'well').if), 'and that place stops asking');
    let r = V.conclude(s, 'vb_layers', 'filled');
    t.eq([r.ok, r.why], [false, 'evidence'], 'one observation is not enough');
    V.compareAt(s, 'vb_layers', 'trough');
    r = V.conclude(s, 'vb_layers', 'never');
    t.eq([r.ok, r.why], [false, 'mismatch'], 'a reading the stones contradict: tried, kept as a fact, no penalty');
    r = V.conclude(s, 'vb_layers', 'covered');
    t.ok(r.ok && s.discovery.cases.vb_layers.hypothesis === 'covered', 'another valid reading resolves it, and stays the player\'s own');
    const s2 = camp();
    RB.cases.open(s2, 'vb_layers'); V.compareAt(s2, 'vb_layers', 'well'); V.compareAt(s2, 'vb_layers', 'stone');
    t.ok(V.conclude(s2, 'vb_layers', 'filled').ok && s2.discovery.cases.vb_layers.hypothesis === 'filled', 'as does the first');
  }

  // ---- W17 · stage-blocking ------------------------------------------------------------------------------------------------
  {
    const s = camp(), spec = V.get('vb_blocking');
    const check = (o) => V.blockingCheck(spec, Object.assign({ hana: null, tetsu: null, lantern: null }, o));
    let c = check({ hana: '2,2', lantern: '3,2', tetsu: 'wing:left' });
    t.eq(c.directions.map((d) => d.ok), [true, true, false], 'position by position: Tetsu is in the wrong wing');
    c = check({ hana: '2,2', lantern: '1,2', tetsu: 'wing:right' });
    t.ok(c.ok, '"next to her" either side; kamite is the audience\'s right');
    c = check({ hana: '2,2', lantern: '2,1', tetsu: 'wing:right' });
    t.eq(c.directions[1].ok, false, 'behind her is not next to her');
    c = check({ hana: '0,0', lantern: '1,0', tetsu: 'wing:right' });
    t.ok(!c.ok && c.clash.indexOf('hana') >= 0, 'nobody stands in the scenery');
    c = check({ hana: '2,2', lantern: '2,2', tetsu: 'wing:right' });
    t.ok(!c.ok && c.clash.length, 'nor two in one place');
    FW.arrange(s, 'vb_blocking', { hana: '2,2', lantern: '3,1', tetsu: 'wing:right' });
    t.eq(FW.act(s, 'vb_blocking', 'rehearse').completed, false, 'a rehearsal that does not match');
    t.eq(FW.peek(s, 'vb_blocking').log.filter((l) => l.r === 'rehearse').length, 0, 'leaves no mark: rehearse again freely');
    FW.arrange(s, 'vb_blocking', { lantern: '3,2' });
    t.ok(FW.act(s, 'vb_blocking', 'rehearse').completed, 'it matches: staged');
    const path = V.rehearsalPath(spec, 'wing:left', '0,1');
    t.ok(path && path.every(([x, y]) => !(x === 0 && y === 0) && !(x === 4 && y === 0)), 'walking on, nobody passes through the scenery');
  }

  // ---- the Japanese: furigana on every kanji, every token in a dictionary, English beside it -------------------------
  {
    const errs = [], unknown = new Map();
    const jcheck = (line, where) => {
      if (!line) return;
      for (const p of RB.jp.validate(line)) errs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(line)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
        if (info.unknown && !unknown.has(tk.surface)) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where, seen = new Set()) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']', seen)); return; }
      if (typeof o.jp === 'string') { jcheck(o.jp, where); if (typeof o.en !== 'string' || !o.en) errs.push(where + ': no English'); }
      for (const k in o) if (k !== 'jp' && o[k] && typeof o[k] === 'object') walk(o[k], where + '.' + k, seen);
    };
    for (const v of V.list()) {
      walk(v, v.id);
      const def = FW.get(v.id);
      if (!def) continue;
      // computed words, in the states the fixture reaches
      const states = [def.init, Object.assign({}, def.init, { step: 1 }), Object.assign({}, def.init, { posted: 'x' })];
      for (const r of def.rules) if (typeof r.say === 'function') for (const st of states) { try { walk(r.say(st, Object.assign({}, st, typeof r.set === 'function' ? r.set(st) || {} : r.set || {})), v.id + ' ' + r.id + ' computed'); } catch (e) { errs.push(v.id + ' ' + r.id + ': ' + e.message); } }
    }
    const rs = V.get('vb_repair');
    for (let k = 0; k <= rs.steps.length; k++) for (const tl of rs.tools) for (const p in rs.parts) walk(V.repairSay(rs, { step: k }, tl.id, p), 'repair say');
    walk(RB.town.LINES.sighting({ en: 'X', jp: '{港|みなと}' }, false), 'town sighting');
    walk(RB.town.LINES.sighting({ en: 'X', jp: null }, true), 'town sighting here');
    walk(RB.town.LINES.routine({ en: 'Tomo' }, [{ en: 'A', jp: '{港|みなと}' }, { en: 'B', jp: '{宿|やど}' }]), 'town routine');
    walk(RB.town.LINES.routine({ en: 'Tomo' }, []), 'town routine, no places');
    walk(RB.town.LINES.uncertain({ en: 'Tomo' }, { en: 'A', jp: '{港|みなと}' }), 'town uncertain');
    walk(RB.town.LINES.uncertain({ en: 'Tomo' }, null), 'town uncertain, nowhere');
    walk(RB.town.LINES.refusal(), 'town refusal');
    walk(RB.town.LINES.unknown(), 'town unknown');
    t.eq(errs, [], 'every Japanese string of the templates and fixtures has furigana on every kanji, and English beside it');
    t.eq([...unknown.entries()].map(([k, w]) => k + ' (' + w + ')'), [], 'every token has a dictionary entry');
  }

  // ---- quiet puzzle spaces -----------------------------------------------------------------------------------------------
  {
    const maps = new Set();
    for (const v of V.list()) if (v.kind !== 'route') maps.add(v.map || (v.basins && Object.values(v.basins)[0].map));
    for (const m of maps) t.ok(!(C.maps[m].foes || []).some((f) => f.patrol && !/^vbf_/.test(f.id)), m + ': no roaming creature where something is examined');
  }
};
