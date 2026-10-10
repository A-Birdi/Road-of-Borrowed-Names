/* Exploration actions (expansion P05; docs/future/plan/06_WORLD.md W9, W11–W17): templates that turn a compact
 * description into a Field Inkweaving puzzle (src/engine/55_fieldweave.js: objects, a state, rules, an outcome, and
 * its three layers kept apart) or a case (src/engine/59_cases.js: observations and the player's own hypotheses).
 * No new engine: each template only writes the definitions those engines already run, and a few pure functions the
 * screens (src/ui/57b_verbs.js) and the tests share.
 *
 *   notice    W9   compose a notice from supported pieces; people visibly follow what it says (placements on
 *                  `puzzle.<id>.behaviour`); different valid notices work differently; unsuitable wording is
 *                  understood as unclear and blocks nothing
 *   courier   W11  plan several deliveries around who is where on each leg of the round (legs, not clocks);
 *                  every plan that reaches every recipient works
 *   repair    W12  inspect, read the instructions, use the tools the job supplies in order, test; a wrong step
 *                  explains itself and changes nothing
 *   network   W13  water (or air) across connected rooms, on several maps: change one gate, the levels settle
 *                  (connected open basins agree, in one bounded pass); required ways stay reachable
 *   observe   W14  a machine's pattern, watched (pausable, step by step) and adjusted; the diagram and the moving
 *                  prop read the same state; no timing is ever asked for
 *   follow    W14  an activity that follows written instructions step by step (folding, a recipe)
 *   route     W15  redirect a creature with light, shade, sound or a sign; a complete way without a fight; a sound
 *                  always has words and a visible cue
 *   layers    W16  compare an old plan with today's place (the marks line up with the map); observations are
 *                  made where they are; several readings may be valid
 *   blocking  W17  place actors and props on a stage from directions (positions, entrances, exits, "next to
 *                  them"); rehearse as often as you like; scenery cannot be stood in
 *
 * Fixtures (src/content/verbs/00_fixtures.js) are `fixture: true`: eligible and on the map only in a throwaway
 * development session that sets the flag dev_verbs (?dev=verbs), never in a journey. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

RB.verbs = (function () {
  'use strict';
  const KINDS = {};
  const SPECS = {};
  const FW = () => RB.fieldweave;
  const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
  const T = (en, jp) => ({ en, jp });
  const DEV = 'dev_verbs';
  const gateOf = (spec) => (spec.fixture ? DEV : spec.if || null);
  const andIf = (a, b) => (a && b ? a + '&' + b : a || b || undefined);

  function kind(name, impl) { KINDS[name] = impl; }
  // define(kind, spec): check it, write its definitions, place it; returns the spec (with .errors, [] when sound)
  function define(kindName, spec) {
    const K = KINDS[kindName];
    if (!K) throw new Error('verbs: unknown kind ' + kindName);
    if (!spec || !spec.id) throw new Error('verbs: a ' + kindName + ' needs an id');
    // (conditions name it as puzzle.<id>.<key> or case.<id>: an id with a dot would be read as a key)
    if (/[^\w]/.test(spec.id)) throw new Error('verbs: an id is letters, digits and _ only: ' + spec.id);
    spec.kind = kindName;
    spec.errors = K.check ? K.check(spec) : [];
    SPECS[spec.id] = spec;
    const def = K.build ? K.build(spec) : null;
    if (def) {
      def.verb = kindName;
      if (spec.fixture) { def.fixture = true; def.eligible = DEV; }
      else if (spec.if) def.eligible = spec.if;
      FW().define(def);
    }
    if (K.place) K.place(spec);
    return spec;
  }
  const get = (id) => SPECS[id] || null;
  const list = (kindName) => Object.keys(SPECS).map((k) => SPECS[k]).filter((x) => !kindName || x.kind === kindName);

  // ---- placing things on the maps (content adds, never rewrites) ---------------------------------------------
  // (a map compiled before something was added to it is compiled afresh next time)
  function mapDef(id) { if (RB.maps && RB.maps.forget) RB.maps.forget(id); return RB.content && RB.content.maps ? RB.content.maps[id] : null; }
  // a map's size from its definition (checks run while content loads, before anything is compiled)
  function sizeOf(id) { const d = RB.content.maps[id]; if (!d || !d.terrain) return null; return { w: Math.max.apply(null, d.terrain.map((r) => r.length)), h: d.terrain.length }; }
  // the prop you examine to open the action's sheet (one shared scene: the prop carries the id)
  function addProp(spec, at, extra) {
    const m = mapDef(at.map || spec.map);
    if (!m) return;
    m.props = m.props || [];
    m.props.push(Object.assign({ p: at.prop || 'signblank', x: at.x, y: at.y, scene: 'vb.open', o: { vb: spec.id, part: at.part || null }, if: andIf(gateOf(spec), at.if) }, extra || {}));
  }
  function addNpc(spec, map, n) {
    const m = mapDef(map);
    if (!m) return;
    m.npcs = m.npcs || [];
    m.npcs.push(Object.assign({}, n, { if: andIf(gateOf(spec), n.if) }));
  }

  // ---- reachability on a map (navigation safety) ---------------------------------------------------------------
  // Can every way out of `map` still be reached from `from` with `blocked` tiles taken (people standing, a crowd)?
  // [] when so; otherwise the exits cut off.
  function cutOff(map, from, blocked) {
    let m;
    try { m = RB.maps.compile(map); } catch (e) { return ['no map ' + map]; }
    const bad = new Set((blocked || []).map((t) => t[0] + ',' + t[1]));
    const free = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y) && !bad.has(x + ',' + y);
    const seen = new Set(), q = [];
    for (const [x, y] of from) if (free(x, y)) { seen.add(x + ',' + y); q.push([x, y]); }
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (!seen.has(k) && free(nx, ny)) { seen.add(k); q.push([nx, ny]); }
      }
    }
    const out = [];
    for (const e of m.exits) {
      let ok = false;
      for (let y = e.y; y < e.y + (e.h || 1) && !ok; y++) for (let x = e.x; x < e.x + (e.w || 1) && !ok; x++) if (seen.has(x + ',' + y)) ok = true;
      if (!ok) out.push(e.to || e.x + ',' + e.y);
    }
    return out;
  }
  const around = (x, y, w, h) => { const out = []; for (let yy = y - 1; yy <= y + (h || 1); yy++) for (let xx = x - 1; xx <= x + (w || 1); xx++) if (yy === y - 1 || yy === y + (h || 1) || xx === x - 1 || xx === x + (w || 1)) out.push([xx, yy]); return out; };

  // ---- the state space (W13, W15: every reachable state, bounded) -------------------------------------------------
  // explore(def, acts, max): BFS over the states the named acts can reach from def.init; { states, edges, capped }
  function explore(def, acts, max) {
    max = max || 4096;
    const key = (st) => JSON.stringify(Object.keys(st).sort().map((k) => [k, st[k]]));
    const start = clone(def.init);
    const states = new Map([[key(start), start]]);
    const edges = new Map();
    const q = [start];
    while (q.length && states.size < max) {
      const st = q.shift(), k0 = key(st), out = [];
      for (const a of acts) {
        const r = typeof a === 'function' ? null : FW()._actRule(def, st, a);
        if (!r || !r.set) continue;
        const patch = typeof r.set === 'function' ? r.set(clone(st), null) : r.set;
        if (!patch) continue;
        const next = Object.assign(clone(st), clone(patch));
        const k = key(next);
        out.push(k);
        if (!states.has(k)) { states.set(k, next); q.push(next); }
      }
      edges.set(k0, out);
    }
    return { states, edges, capped: states.size >= max, key };
  }
  // from every reachable state, can some state where pred holds still be reached? (no softlock)
  function alwaysReachable(ex, pred) {
    const good = new Set([...ex.states].filter(([, st]) => pred(st)).map(([k]) => k));
    // reverse closure from the good states
    const rev = new Map();
    for (const [k, outs] of ex.edges) for (const o of outs) { if (!rev.has(o)) rev.set(o, []); rev.get(o).push(k); }
    const ok = new Set(good), q = [...good];
    while (q.length) { const k = q.shift(); for (const p of rev.get(k) || []) if (!ok.has(p)) { ok.add(p); q.push(p); } }
    return [...ex.states.keys()].filter((k) => !ok.has(k));
  }

  // ---- W9 · notices ------------------------------------------------------------------------------------------------
  // spec: { id, map, x, y, prop, title, slots: [{ key, label, options: [{ id, jp, en }] }],
  //         readings: [{ when: { key: id | [ids] }, behaviour, heard: { jp, en } }], unclear: { jp, en },
  //         goal: [behaviours], start: 'none', people: { behaviour: [{ char, x, y, dir }] }, keepsake? }
  function readingOf(spec, st) {
    const filled = spec.slots.every((sl) => st[sl.key] != null);
    if (!filled) return null;
    for (const r of spec.readings) if (Object.keys(r.when).every((k) => [].concat(r.when[k]).indexOf(st[k]) >= 0)) return r;
    return { behaviour: 'unclear', heard: spec.unclear || T('People read it, frown, and carry on as before.', '{読|よ}んだ {人|ひと} は {首|くび} を かしげて 、 {今|いま} まで どおり に した 。') };
  }
  const composed = (spec, st) => spec.slots.map((sl) => st[sl.key] || '').join('|');
  // the notice's words as they stand (the slots' Japanese in order)
  function noticeText(spec, st) {
    const jp = [], en = [];
    for (const sl of spec.slots) { const o = sl.options.find((x) => x.id === st[sl.key]); jp.push(o ? o.jp : '＿＿'); en.push(o ? o.en : '…'); }
    return { jp: jp.join(' '), en: en.join(' ') };
  }
  kind('notice', {
    check(spec) {
      const e = [];
      if (!spec.slots || !spec.slots.length) e.push('a notice needs pieces');
      if (!spec.readings || !spec.readings.length) e.push('a notice needs readings');
      if (!spec.goal || !spec.readings.some((r) => spec.goal.indexOf(r.behaviour) >= 0)) e.push('no reading reaches the goal');
      const valid = new Set(spec.readings.map((r) => r.behaviour).concat(['unclear', spec.start || 'none']));
      for (const b in spec.people || {}) if (!valid.has(b)) e.push('people for an unknown behaviour ' + b);
      // words and movement agree: a behaviour people follow has people to show it, and the reading says it
      for (const r of spec.readings) if (!r.heard || !r.heard.jp || !r.heard.en) e.push('reading ' + r.behaviour + ' has no words for what people understood');
      return e;
    },
    build(spec) {
      const init = { behaviour: spec.start || 'none', posted: '' };
      const values = {};
      for (const sl of spec.slots) { init[sl.key] = null; values[sl.key] = sl.options.map((o) => o.id); }
      return {
        id: spec.id, map: spec.map, region: spec.region || null,
        objects: { board: { x: spec.x, y: spec.y, w: 2, name: spec.title, weave: false } },
        init, values, arrange: spec.slots.map((sl) => sl.key), arrangeObj: 'board',
        rules: [{
          act: 'post',
          // posting the same words again changes nothing (once); unclear words are posted too, and followed by no one
          set: (st) => { const r = readingOf(spec, st); return r ? { behaviour: r.behaviour, posted: composed(spec, st) } : null; },
          say: (b, a) => { const r = readingOf(spec, b); if (!r) return [T('The notice is not finished yet.', 'まだ {書|か}き{終|お}わって いない 。')]; return b.posted === composed(spec, b) ? [T('That notice is already up.', 'その {貼|は}り{紙|がみ} は もう {貼|は}って ある 。')] : [r.heard]; },
        }],
        complete: { behaviour: spec.goal },
        methods: spec.readings.filter((r) => spec.goal.indexOf(r.behaviour) >= 0).map((r) => ({ id: 'notice:' + r.behaviour, if: { behaviour: r.behaviour } })),
        reward: spec.keepsake ? { keepsake: spec.keepsake } : null,
      };
    },
    place(spec) {
      addProp(spec, { x: spec.x, y: spec.y, prop: spec.prop || 'noticeboard' });
      let n = 0;
      for (const b in spec.people || {}) for (const p of spec.people[b]) addNpc(spec, spec.map, { id: 'vbp_' + spec.id + '_' + (n++), char: p.char, x: p.x, y: p.y, dir: p.dir || 'down', talk: p.talk, if: 'puzzle.' + spec.id + '.behaviour=' + b });
    },
  });
  // navigation safety (W9: unsuitable wording cannot softlock): for each behaviour, the people it places leave every
  // way out reachable from in front of the board. [] when safe.
  function noticeSafety(spec) {
    const out = [];
    const from = around(spec.x, spec.y, 2, 1);
    for (const b of Object.keys(spec.people || {}).concat(['unclear'])) {
      const tiles = (spec.people[b] || []).map((p) => [p.x, p.y]);
      const cut = cutOff(spec.map, from, tiles);
      if (cut.length) out.push(b + ' cuts off ' + cut.join(', '));
    }
    return out;
  }

  // ---- W11 · courier rounds ------------------------------------------------------------------------------------------
  // spec: { id, map, x, y, prop, title, legs: [{ jp, en }], stops: { key: { jp, en, map } }, start,
  //         recipients: { who: { name: { jp, en }, at: [stop for leg 0, leg 1, …] } },
  //         parcels: [{ id, to, jp, en }] }
  // A plan is one stop per leg. A parcel is delivered when the plan stands at its recipient's stop on a leg.
  function courierCheck(spec, plan) {
    const out = [];
    for (const pc of spec.parcels) {
      const r = spec.recipients[pc.to];
      const leg = plan.findIndex((stop, i) => stop && r.at[i] === stop);
      out.push({ parcel: pc.id, ok: leg >= 0, leg, where: leg >= 0 ? null : r.at.map((s0, i) => ({ leg: i, stop: s0 })) });
    }
    return { ok: out.every((x) => x.ok), parcels: out };
  }
  kind('courier', {
    check(spec) {
      const e = [];
      for (const pc of spec.parcels || []) { const r = spec.recipients[pc.to]; if (!r) e.push('no recipient ' + pc.to); else if (r.at.length !== spec.legs.length) e.push(pc.to + ' has no place on every leg'); }
      // several plans work: count them
      const stops = Object.keys(spec.stops || {});
      let ok = 0;
      const walk = (i, plan) => { if (i === spec.legs.length) { if (courierCheck(spec, plan).ok) ok++; return; } for (const st of stops) walk(i + 1, plan.concat([st])); };
      if (stops.length && spec.legs.length <= 6) walk(0, []);
      spec.plans = ok;
      if (!ok) e.push('no plan reaches every recipient');
      return e;
    },
    build(spec) {
      const init = { checked: '', delivered: false };
      const values = {};
      spec.legs.forEach((l, i) => { init['leg' + i] = null; values['leg' + i] = Object.keys(spec.stops); });
      return {
        id: spec.id, map: spec.map, objects: { desk: { x: spec.x, y: spec.y, name: spec.title, weave: false } },
        init, values, arrange: spec.legs.map((l, i) => 'leg' + i), arrangeObj: 'desk',
        rules: [{ act: 'go', set: (st) => (courierCheck(spec, spec.legs.map((l, i) => st['leg' + i])).ok ? { delivered: true } : null) }],
        complete: { delivered: true },
      };
    },
    place(spec) { addProp(spec, { x: spec.x, y: spec.y, prop: spec.prop || 'desk' }); },
  });

  // ---- W12 · repair jobs ----------------------------------------------------------------------------------------------
  // spec: { id, map, x, y, prop, name, parts: { key: { jp, en } }, read: [{ jp, en }], tools: [{ id, jp, en }],
  //         steps: [{ part, tool, done: { jp, en } }], ran: { jp, en } }
  function repairSay(spec, st, tool, part) {
    const s = spec.steps[st.step], P = spec.parts, tl = spec.tools.find((x) => x.id === tool);
    if (!s) return T('It is already mended. Try it.', 'もう {直|なお}って いる 。 {動|うご}かして みよう 。');
    if (s.part === part && s.tool === tool) return s.done;
    if (spec.steps.slice(0, st.step).some((x) => x.part === part && x.tool === tool)) return T('That part is already done.', 'そこ は もう {終|お}わって いる 。');
    if (s.part !== part && spec.steps.slice(st.step).some((x) => x.part === part)) return T('Not yet: the instructions start with the ' + P[s.part].en + '.', 'まだ だ 。 {先|さき} に ' + P[s.part].jp + ' だ 。');
    return T('The ' + tl.en + ' does not suit the ' + P[part].en + '. Nothing is harmed.', P[part].jp + ' に ' + tl.jp + ' は {合|あ}わない 。 {何|なに} も {傷|いた}んで いない 。');
  }
  kind('repair', {
    check(spec) {
      const e = [];
      const tools = new Set((spec.tools || []).map((t) => t.id));
      for (const s of spec.steps || []) { if (!tools.has(s.tool)) e.push('step needs a tool the job does not supply: ' + s.tool); if (!spec.parts[s.part]) e.push('no part ' + s.part); if (!s.done) e.push('a step without words'); }
      if (spec.needs) e.push('a repair job supplies its materials: no prerequisite items');
      return e;
    },
    build(spec) {
      const rules = [
        { act: 'inspect', set: { inspected: true }, obs: 'inspected', say: () => spec.inspect ? [spec.inspect] : [] },
        { act: 'read', set: { read: true }, obs: 'read', say: () => spec.read.slice() },
        { act: 'test', set: (st) => (st.step >= spec.steps.length ? { ran: true } : null),
          say: (b) => (b.step >= spec.steps.length ? [spec.ran || T('It runs.', '{動|うご}いた 。')] : [T('It still will not run. Something is left to do: the instructions say what.', 'まだ {動|うご}かない 。 {説明|せつめい} を {読|よ}めば 、 {何|なに} が {残|のこ}って いる か {分|わ}かる 。')]) },
      ];
      for (const t of spec.tools) for (const p in spec.parts) {
        rules.push({ act: 'use:' + t.id + '@' + p, obj: 'machine',
          set: (st) => { const s = spec.steps[st.step]; return s && s.part === p && s.tool === t.id ? { step: st.step + 1 } : null; },
          say: (b) => [repairSay(spec, b, t.id, p)] });
      }
      return {
        id: spec.id, map: spec.map, region: spec.region || null,
        objects: { machine: { x: spec.x, y: spec.y, name: spec.name, weave: false } },
        init: { step: 0, inspected: false, read: false, ran: false }, values: { step: spec.steps.map((s, i) => i).concat([spec.steps.length]) },
        rules, complete: { ran: true }, after_acts: ['inspect', 'read', 'test'],
        reward: spec.keepsake ? { keepsake: spec.keepsake } : null,
      };
    },
    place(spec) { addProp(spec, { x: spec.x, y: spec.y, prop: spec.prop || 'cs_workbench' }); },
  });

  // ---- W13 · connected mechanisms ------------------------------------------------------------------------------------
  // spec: { id, name, medium: 'water' | 'air', levels: 3, basins: { key: { map, x, y, prop, jp, en, level } },
  //         gates: { key: { between: [a, b], map, x, y, prop, jp, en, open: bool } }, sources: [basins], drains: [basins],
  //         required: [{ id, basin, max | min, jp, en }], goal: { basin: level } }
  // Water settles in one pass (no iteration, so no cycle can run away): basins joined by open gates form a body; a
  // body with a source is full, else one with a drain is empty, else it keeps its water, shared out evenly (rounded
  // down). Connected open basins always agree.
  function settle(spec, st) {
    const keys = Object.keys(spec.basins);
    const parent = {};
    const find = (k) => (parent[k] === k ? k : (parent[k] = find(parent[k])));
    for (const k of keys) parent[k] = k;
    for (const g in spec.gates) if (st['g_' + g] === 'open') { const [a, b] = spec.gates[g].between; parent[find(a)] = find(b); }
    const groups = {};
    for (const k of keys) (groups[find(k)] = groups[find(k)] || []).push(k);
    const L = spec.levels || 3, out = {};
    for (const r in groups) {
      const ms = groups[r];
      let lv;
      if (ms.some((k) => (spec.sources || []).indexOf(k) >= 0)) lv = L;
      else if (ms.some((k) => (spec.drains || []).indexOf(k) >= 0)) lv = 0;
      else lv = Math.floor(ms.reduce((a, k) => a + (+st['b_' + k] || 0), 0) / ms.length);
      for (const k of ms) out['b_' + k] = lv;
    }
    return out;
  }
  const passable = (spec, st, r) => { const v = +st['b_' + r.basin] || 0; return (r.max == null || v <= r.max) && (r.min == null || v >= r.min); };
  kind('network', {
    check(spec) {
      const e = [];
      for (const g in spec.gates) for (const b of spec.gates[g].between) if (!spec.basins[b]) e.push('gate ' + g + ' joins an unknown basin ' + b);
      return e;
    },
    build(spec) {
      const init = {};
      for (const b in spec.basins) init['b_' + b] = spec.basins[b].level || 0;
      for (const g in spec.gates) init['g_' + g] = spec.gates[g].open ? 'open' : 'shut';
      Object.assign(init, settle(spec, init));
      const objects = {}, keyMap = {}, maps = [];
      const add = (k, n) => { objects[k] = { map: n.map, x: n.x, y: n.y, name: T(n.en, n.jp), weave: n.weave ? undefined : false }; if (maps.indexOf(n.map) < 0) maps.push(n.map); };
      for (const b in spec.basins) { add(b, spec.basins[b]); keyMap['b_' + b] = spec.basins[b].map; }
      for (const g in spec.gates) { add(g, spec.gates[g]); keyMap['g_' + g] = spec.gates[g].map; }
      const rules = [];
      for (const g in spec.gates) {
        const flip = (to) => (st) => { const n = Object.assign({}, st, { ['g_' + g]: to }); return Object.assign({ ['g_' + g]: to }, settle(spec, n)); };
        const gj = spec.gates[g];
        rules.push({ act: 'open:' + g, obj: g, if: { ['g_' + g]: 'shut' }, set: flip('open'), say: (b, a) => [moved(spec, b, a, T('You open the ' + gj.en + '.', gj.jp + ' を {開|あ}けた 。'))] });
        rules.push({ act: 'shut:' + g, obj: g, if: { ['g_' + g]: 'open' }, set: flip('shut'), say: (b, a) => [moved(spec, b, a, T('You close the ' + gj.en + '.', gj.jp + ' を {閉|し}めた 。'))] });
        if (gj.weave) rules.push({ weave: gj.weave, obj: g, set: (st) => flip(st['g_' + g] === 'open' ? 'shut' : 'open')(st), say: (b, a) => [moved(spec, b, a, T('The ' + gj.en + ' moves.', gj.jp + ' が {動|うご}いた 。'))] });
      }
      const goal = {};
      for (const k in spec.goal || {}) goal['b_' + k] = spec.goal[k];
      return { id: spec.id, map: Object.values(spec.basins)[0].map, maps, keyMap, objects, init, rules, complete: Object.keys(goal).length ? goal : null, noReset: !!spec.noReset };
    },
    place(spec) {
      for (const b in spec.basins) if (spec.basins[b].prop) addProp(spec, Object.assign({ part: b }, spec.basins[b]));
      for (const g in spec.gates) addProp(spec, Object.assign({ part: g, prop: 'lf_lever' }, spec.gates[g]));
      for (const r of spec.required || []) for (const t of r.tiles || []) addProp(spec, { map: r.map, x: t[0], y: t[1], prop: r.prop || 'crate', part: r.id, if: 'puzzle.' + spec.id + '.b_' + r.basin + (r.max != null ? '>' + r.max : '<' + r.min) }, { scene: null, text: r.look || null, o: { vb: spec.id, part: r.id, barrier: true } });
    },
  });
  // what the water did, in words: each basin whose level changed, near or far (the effect is traced, W13)
  function moved(spec, b, a, first) {
    const lines = [first];
    for (const k in spec.basins) {
      const d = (+a['b_' + k] || 0) - (+b['b_' + k] || 0);
      if (!d) continue;
      const n = spec.basins[k], far = n.map !== (RB.game && RB.game.s ? RB.game.s.map : n.map);
      lines.push(T((far ? 'Somewhere off in the ' : 'The ') + n.en + (d > 0 ? ' fills' : ' drains') + ' (' + LEVEL_EN[a['b_' + k]] + ').', (far ? '{遠|とお}く で 、 ' : '') + n.jp + ' の {水|みず} が ' + (d > 0 ? '{増|ふ}えた' : '{減|へ}った') + ' 。'));
    }
    return { en: lines.map((l) => l.en).join(' '), jp: lines.map((l) => l.jp).join(' ') };
  }
  const LEVEL_EN = ['empty', 'low', 'half full', 'full', 'brimming'];
  // the network's soundness over every reachable state: levels agree within each open body; every required way can
  // always be opened again. { problems: [], states }
  function networkSafety(spec) {
    const def = FW().get(spec.id);
    const acts = [];
    for (const g in spec.gates) acts.push('open:' + g, 'shut:' + g);
    const ex = explore(def, acts);
    const problems = [];
    for (const [k, st] of ex.states) {
      const again = Object.assign({}, st, settle(spec, st));
      if (Object.keys(again).some((x) => again[x] !== st[x])) problems.push('unsettled state ' + k);
    }
    for (const r of spec.required || []) {
      const stuck = alwaysReachable(ex, (st) => passable(spec, st, r));
      if (stuck.length) problems.push(r.id + ' cannot be reopened from ' + stuck.length + ' states');
    }
    return { problems, states: ex.states.size, capped: ex.capped };
  }

  // ---- W14 · observation-first mechanisms, and instructions to follow ---------------------------------------------
  // spec: { id, map, x, y, prop, name, beat (ms), parts: [{ key, jp, en, states: { s: { jp, en } } }],
  //         phases: { id: { jp, en, parts: { key: s } } }, base: [phase ids], adjustments: [{ id, jp, en, op, a, b }],
  //         goal: [phase ids], clues: [{ id, phase, jp, en }] }
  //   op 'swap' a b (two phases change places), 'remove' a, 'insert' a after b, 'replace' a with b
  // The adjustments made, not the order they were made in, decide the pattern (each applies in the spec's order),
  // so undoing and redoing never leaves a different machine.
  function pattern(spec, adj) {
    const on = String(adj || '').split(',').filter(Boolean);
    let p = spec.base.slice();
    for (const A of spec.adjustments) {
      if (on.indexOf(A.id) < 0) continue;
      if (A.op === 'swap') { const i = p.indexOf(A.a), j = p.indexOf(A.b); if (i >= 0 && j >= 0) { p[i] = A.b; p[j] = A.a; } }
      else if (A.op === 'remove') p = p.filter((x) => x !== A.a);
      else if (A.op === 'insert') { const j = p.indexOf(A.b); if (j >= 0 && p.indexOf(A.a) < 0) p.splice(j + 1, 0, A.a); }
      else if (A.op === 'replace') p = p.map((x) => (x === A.a ? A.b : x));
    }
    return p;
  }
  // the phase shown at time t (ms) — the sheet's diagram and the prop on the map both draw from this
  function phaseAt(spec, st, t) { const p = pattern(spec, st.adj); return p.length ? p[Math.floor(Math.max(0, t) / (spec.beat || 900)) % p.length] : null; }
  kind('observe', {
    check(spec) {
      const e = [];
      for (const id of spec.base) if (!spec.phases[id]) e.push('no phase ' + id);
      for (const c of spec.clues || []) if (!spec.phases[c.phase]) e.push('a clue in an unknown phase ' + c.phase);
      // the goal can be reached by some set of adjustments
      const ids = spec.adjustments.map((a) => a.id);
      let ok = false;
      for (let m = 0; m < (1 << ids.length) && !ok; m++) { const adj = ids.filter((x, i) => m & (1 << i)).join(','); if (pattern(spec, adj).join() === spec.goal.join()) ok = true; }
      if (!ok) e.push('no set of adjustments reaches the goal');
      return e;
    },
    build(spec) {
      const rules = spec.adjustments.map((A) => ({
        act: 'adjust:' + A.id, obj: 'machine',
        set: (st) => { const L = String(st.adj || '').split(',').filter(Boolean); const i = L.indexOf(A.id); if (i >= 0) L.splice(i, 1); else L.push(A.id); return { adj: L.join(',') }; },
        say: (b, a) => [String(a.adj).split(',').indexOf(A.id) >= 0 ? T('You make the adjustment: ' + A.en + '.', A.jp + ' 。') : T('You undo it: ' + A.en + '.', A.jp + ' を {元|もと} に {戻|もど}した 。')],
      }));
      for (const c of spec.clues || []) rules.push({ act: 'note:' + c.id, obs: c.id });
      return {
        id: spec.id, map: spec.map, objects: { machine: { x: spec.x, y: spec.y, name: spec.name, weave: false } },
        init: { adj: '' }, rules, complete: (st) => pattern(spec, st.adj).join() === spec.goal.join(),
      };
    },
    place(spec) { addProp(spec, { x: spec.x, y: spec.y, prop: spec.prop || 'lf_wheel' }); },
  });
  // spec: { id, map, x, y, prop, name, steps: [{ jp, en, options: [{ id, jp, en, ok, why: { jp, en } }] }], done: { jp, en } }
  kind('follow', {
    check(spec) { return spec.steps.filter((s) => s.options.filter((o) => o.ok).length < 1).map(() => 'a step with no right action'); },
    build(spec) {
      const rules = [];
      spec.steps.forEach((s, i) => s.options.forEach((o) => rules.push({ act: 'do:' + i + ':' + o.id, if: { step: i }, set: o.ok ? { step: i + 1 } : null, say: [o.ok ? (o.say || T('Done.', 'できた 。')) : o.why] })));
      return { id: spec.id, map: spec.map, objects: { work: { x: spec.x, y: spec.y, name: spec.name, weave: false } }, init: { step: 0 }, values: { step: spec.steps.map((s, i) => i).concat([spec.steps.length]) }, rules, complete: { step: spec.steps.length } };
    },
    place(spec) { addProp(spec, { x: spec.x, y: spec.y, prop: spec.prop || 'table' }); },
  });

  // ---- W15 · creature routing ------------------------------------------------------------------------------------------
  // spec: { id, map, creature: { enemy, at: { route: [x, y] | null } }, start, goal: [routes],
  //         means: [{ id, obj: { key, x, y, prop, jp, en }, family | act, from: [routes], to, say: { jp, en }, fx, sound }] }
  kind('route', {
    check(spec) {
      const e = [];
      for (const m of spec.means) if (m.sound && (!m.say || !m.say.jp || !m.say.en || !m.fx)) e.push('a sound needs words and a visible cue: ' + m.id);
      for (const r of [spec.start].concat(spec.means.map((m) => m.to))) if (!(r in spec.creature.at)) e.push('no place for route ' + r);
      // a complete way without a fight
      const seen = new Set([spec.start]), q = [spec.start];
      while (q.length) { const r = q.shift(); for (const m of spec.means) if (m.from.indexOf(r) >= 0 && !seen.has(m.to)) { seen.add(m.to); q.push(m.to); } }
      if (!spec.goal.some((g) => seen.has(g))) e.push('no way to the goal without a fight');
      return e;
    },
    build(spec) {
      const objects = {};
      for (const m of spec.means) objects[m.obj.key] = { x: m.obj.x, y: m.obj.y, name: T(m.obj.en, m.obj.jp) };
      const rules = spec.means.map((m) => Object.assign(m.family ? { weave: m.family } : { act: m.act }, { obj: m.obj.key, if: { route: m.from }, set: { route: m.to }, say: [m.say], fx: m.fx || null, obs: 'routed:' + m.id }));
      return { id: spec.id, map: spec.map, objects, init: { route: spec.start }, values: { route: Object.keys(spec.creature.at) }, rules, complete: { route: spec.goal }, noReset: true };
    },
    place(spec) {
      for (const m of spec.means) if (!spec.means.some((o) => o !== m && o.obj.key === m.obj.key && spec.means.indexOf(o) < spec.means.indexOf(m))) addProp(spec, { x: m.obj.x, y: m.obj.y, prop: m.obj.prop || 'lantern', part: m.obj.key });
      const m = mapDef(spec.map);
      if (!m) return;
      m.foes = m.foes || [];
      for (const r in spec.creature.at) {
        const at = spec.creature.at[r];
        if (at) m.foes.push({ id: 'vbf_' + spec.id + '_' + r, enemy: spec.creature.enemy, x: at[0], y: at[1], if: andIf(gateOf(spec), 'puzzle.' + spec.id + '.route=' + r) });
      }
    },
  });

  // ---- W16 · layered sites -------------------------------------------------------------------------------------------
  // spec: { id (the case), map, title, question, plan: { x, y, prop, title, from: { jp, en },
  //           marks: [{ id, x, y, jp, en, now: 'present'|'missing'|'moved', to: [x, y], obs: { jp, en } }] },
  //         hypotheses: [{ id, label: { jp, en }, from: [mark ids], correct }], sufficient: [[mark ids]], near: 2 }
  const clueId = (spec, mk) => spec.id + '.' + mk;
  kind('layers', {
    check(spec) {
      const e = [];
      const marks = new Set(spec.plan.marks.map((m) => m.id));
      const m = sizeOf(spec.map);
      if (!m) e.push('no map ' + spec.map);
      for (const mk of spec.plan.marks) {
        if (m && (mk.x < 0 || mk.y < 0 || mk.x >= m.w || mk.y >= m.h)) e.push('mark ' + mk.id + ' is off the map');
        if (!mk.obs || !mk.obs.jp) e.push('mark ' + mk.id + ' has no observation');
      }
      for (const h of spec.hypotheses) for (const f of h.from || []) if (!marks.has(f)) e.push('hypothesis ' + h.id + ' rests on no mark ' + f);
      if (!spec.hypotheses.some((h) => h.correct)) e.push('no valid reading');
      return e;
    },
    build(spec) {
      const C = RB.content;
      for (const mk of spec.plan.marks) {
        C.clues[clueId(spec, mk.id)] = { id: clueId(spec, mk.id), case: spec.id, kind: 'place', title: T(mk.en, mk.jp), source: { en: 'Here, compared with the old plan', map: spec.map }, jp: mk.obs.jp, en: mk.obs.en, sure: true, obs: { en: mk.obs.en }, lang: mk.lang || [] };
      }
      C.cases[spec.id] = {
        id: spec.id, region: spec.region || null, title: spec.title, question: spec.question, verb: 'layers',
        clues: spec.plan.marks.map((mk) => clueId(spec, mk.id)),
        hypotheses: spec.hypotheses.map((h) => Object.assign({}, h, { from: (h.from || []).map((f) => clueId(spec, f)) })),
        sufficient: (spec.sufficient || []).map((set) => set.map((f) => clueId(spec, f))),
        hints: spec.hints || [], result: spec.result || null,
      };
      return null;
    },
    place(spec) {
      addProp(spec, { x: spec.plan.x, y: spec.plan.y, prop: spec.plan.prop || 'noticeboard' });
      const m = mapDef(spec.map);
      if (!m) return;
      m.triggers = m.triggers || [];
      const r = spec.near == null ? 1 : spec.near;
      // a mark's place: the square round it, or its own area where that square would cover another place's tile
      for (const mk of spec.plan.marks) m.triggers.push({ id: 'vb_' + spec.id + '_' + mk.id, ...(mk.area || { x: mk.x - r, y: mk.y - r, w: 2 * r + 1, h: 2 * r + 1 }), scene: 'vb.mark', vb: spec.id, mark: mk.id, if: andIf(gateOf(spec), 'case.' + spec.id + '&!clue.' + clueId(spec, mk.id)) });
    },
  });
  // comparing at a mark's place: the observation, made where it is (once)
  function compareAt(s, id, markId) {
    const spec = SPECS[id];
    if (!spec || !RB.cases) return null;
    const mk = spec.plan.marks.find((x) => x.id === markId);
    if (!mk) return null;
    if (!RB.cases.known(s, id)) RB.cases.open(s, id);
    const r = RB.cases.observe(s, clueId(spec, markId));
    return { mark: mk, fresh: r === 'new' };
  }
  // concluding: a hypothesis the evidence supports; any valid reading resolves the case, kept as the player's own
  function conclude(s, id, hid) {
    const cd = RB.content.cases[id];
    if (!cd || !RB.cases.choose(s, id, hid)) return { ok: false, why: 'unavailable' };
    const h = cd.hypotheses.find((x) => x.id === hid);
    if (!RB.cases.sufficient(s, id)) return { ok: false, why: 'evidence' };
    if (!h.correct) { RB.cases.rule(s, id, hid); return { ok: false, why: 'mismatch', mismatch: h.mismatch || null }; }
    RB.cases.resolve(s, id, 'reasoned');
    return { ok: true, hypothesis: hid };
  }

  // ---- W17 · stage-blocking ------------------------------------------------------------------------------------------
  // spec: { id, map, x, y, prop, name, stage: { w, h, scenery: [[x, y]], front: 'bottom' },
  //         pieces: [{ id, jp, en, kind: 'actor'|'prop', pron?: { jp, en } }],
  //         directions: [{ jp, en, want: { who, at: [x, y] } | { who, wing: 'left'|'right' } | { who, next: other, side? } }] }
  // Stage left and right are the audience's (上手 kamite is the audience's right). Positions: 'x,y', 'wing:left',
  // 'wing:right', or null (not placed).
  function cellOf(v) { if (!v || /^wing:/.test(v)) return null; const [x, y] = v.split(',').map(Number); return [x, y]; }
  function blockingCheck(spec, st) {
    const scen = new Set((spec.stage.scenery || []).map((t) => t.join(',')));
    const out = spec.directions.map((d) => {
      const w = d.want, v = st[w.who];
      let ok = false;
      if (w.at) ok = v === w.at.join(',');
      else if (w.wing) ok = v === 'wing:' + w.wing;
      else if (w.next) { const a = cellOf(v), b = cellOf(st[w.next]); ok = !!(a && b && a[1] === b[1] && Math.abs(a[0] - b[0]) === 1 && (!w.side || (w.side === 'right' ? a[0] > b[0] : a[0] < b[0]))); }
      return { ok, d };
    });
    const clash = [];
    const used = {};
    for (const p of spec.pieces) { const c = cellOf(st[p.id]); if (!c) continue; const k = c.join(','); if (scen.has(k)) clash.push(p.id); if (used[k]) clash.push(p.id); used[k] = p.id; }
    return { ok: out.every((x) => x.ok) && !clash.length, directions: out, clash };
  }
  kind('blocking', {
    check(spec) {
      const e = [];
      const ids = new Set(spec.pieces.map((p) => p.id));
      const scen = new Set((spec.stage.scenery || []).map((t) => t.join(',')));
      for (const d of spec.directions) {
        if (!ids.has(d.want.who)) e.push('a direction for no piece ' + d.want.who);
        if (d.want.at && scen.has(d.want.at.join(','))) e.push('a direction into the scenery');
        if (d.want.next && !ids.has(d.want.next)) e.push('"next to" no piece ' + d.want.next);
      }
      return e;
    },
    build(spec) {
      const init = { rehearsed: '', staged: false };
      const values = {};
      const cells = [];
      for (let y = 0; y < spec.stage.h; y++) for (let x = 0; x < spec.stage.w; x++) cells.push(x + ',' + y);
      for (const p of spec.pieces) { init[p.id] = null; values[p.id] = cells.concat(['wing:left', 'wing:right']); }
      return {
        id: spec.id, map: spec.map, objects: { stage: { x: spec.x, y: spec.y, name: spec.name, weave: false } },
        init, values, arrange: spec.pieces.map((p) => p.id), arrangeObj: 'stage',
        rules: [{ act: 'rehearse', set: (st) => (blockingCheck(spec, st).ok ? { staged: true } : null) }],
        complete: { staged: true },
      };
    },
    place(spec) { addProp(spec, { x: spec.x, y: spec.y, prop: spec.prop || 'co_stage' }); },
  });
  // the path a piece takes in rehearsal, from its wing to its place, around the scenery (cells; null when walled in)
  function rehearsalPath(spec, from, to) {
    const W = spec.stage.w, H = spec.stage.h;
    const scen = new Set((spec.stage.scenery || []).map((t) => t.join(',')));
    const start = from === 'wing:left' ? [-1, H - 1] : [W, H - 1];
    const goal = cellOf(to);
    if (!goal) return [];
    const k = (p) => p.join(','), prev = new Map([[k(start), null]]), q = [start];
    while (q.length) {
      const c = q.shift();
      if (c[0] === goal[0] && c[1] === goal[1]) { const out = []; let x = k(c); while (x) { out.unshift(x.split(',').map(Number)); x = prev.get(x); } return out; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = [c[0] + dx, c[1] + dy];
        if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= H || scen.has(k(n)) || prev.has(k(n))) continue;
        prev.set(k(n), k(c)); q.push(n);
      }
    }
    return null;
  }

  // ---- the shared scene and hooks --------------------------------------------------------------------------------
  // a prop of an action, examined: its sheet (src/ui/57b_verbs.js)
  RB.hooks.vb_open = async (a, ctx) => {
    const pr = ctx && ctx.prop;
    const id = (pr && pr.o && pr.o.vb) || a[0];
    if (!id || !SPECS[id]) return;
    if (RB.verbSheets && RB.verbSheets.open) { RB.ui.dialogue.hide(); await RB.verbSheets.open(id, { part: pr && pr.o ? pr.o.part : null }); }
  };
  // a marked place of a layered site, reached: compare it with the old plan, there
  RB.hooks.vb_mark = async (a, ctx) => {
    const tr = ctx && ctx.trigger, s = RB.game && RB.game.s;
    if (!tr || !s) return;
    const r = compareAt(s, tr.vb, tr.mark);
    if (r && r.fresh) await RB.script.runInline([{ who: 'narr', jp: r.mark.obs.jp, en: r.mark.obs.en }]);
  };
  // (the two scenes, vb.open and vb.mark, are added with the world's tables: src/content/world/00_system.js)

  return {
    kind, define, get, list, KINDS, DEV,
    cutOff, explore, alwaysReachable,
    readingOf, noticeText, noticeSafety, composed,
    courierCheck,
    repairSay,
    settle, passable, networkSafety, LEVEL_EN,
    pattern, phaseAt,
    compareAt, conclude, clueId,
    blockingCheck, rehearsalPath, cellOf,
  };
})();
