/* Sailing (expansion P11c; plan 06_WORLD.md W7–W8; docs/future/work/P11_SEA.md). The boat, the sea chart, the two
 * ways to travel, the situations of a voyage, something going wrong on board, and the travel log. Twelve-chapter
 * journeys only: the boat is earned through A Licence for the Open Sea (src/content/sea/).
 *
 *   The sea is an ordinary map with `sea: true`: its open water is sailable and its land is not (the tiles below), the
 *   traveller and the companion stand in the boat (src/ui/89v_sail.js draws it), and a step's length follows the wind
 *   and the sail. Nothing runs out, pursues or sinks: a sail set wrong, or a torn one not yet mended, only makes the
 *   trip a little longer.
 *
 *   C.ports[id] = { place, pos? (its own dot on the sea chart, else its place's), name { jp, en }, dock { map, x, y,
 *                   dir } (where you stand ashore by the boat), sea { x, y, dir } (where the boat puts out),
 *                   zone { x, y, w, h } (the water off the port, on the sea map),
 *                   if: cond (the port takes boats), reach: cond (reached other than by sea), arrive: scene (run ashore
 *                   after each arrival by boat; its lines carry their own conditions, e.g. the first landing) }
 *   C.seaSituations[id] = { kind: 'hail'|'fog'|'cargo'|'creature'|'bird'|'seal'|'trouble'|'first'|'story', scene,
 *                   routes?: ['a-b', …] (either way round), first?: route (once, the first voyage on it), story?: cond
 *                   (never skipped while it holds), once?: bool, weight?: n }
 *
 *   A voyage: chosen on the chart (from where the boat lies, to a port reached), then sailed yourself (the sea map) or
 *   by the crew (straight to arrival); both switchable: "let the crew sail" at any time at sea, and the chart's choice
 *   each time. Its situations are drawn once from the 'sea' stream when it begins and kept with it, so a reload never
 *   re-rolls them; first-time situations of the route and story ones come first and are never skipped (in the crew's
 *   sailing they interrupt the skip). Every voyage writes an entry in the travel log (route, how, sights, words,
 *   people): a section of the travel volume.
 *
 *   s.sea = { boat { name, hull }, at (port), dmg (null | 'sail' | 'line' | 'rudder' | 'hatch'), trim (0 close-hauled,
 *             1 half, 2 full), n (voyages made), seen { situation: n }, log [entry…], voyage (under way) }
 *   Conditions read flags: sea_boat (the boat is yours), sea_port_<id> (a port reached by sea), sea_dmg (something to
 *   mend), and vars: var.sea_at, var.sea_n. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.sail = (function () {
  'use strict';
  const C = () => RB.content;
  const S = () => RB.game && RB.game.s;
  const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const TRIMS = [
    { id: 0, jp: '{帆|ほ} を {絞|しぼ}る', en: 'Sheeted in' },
    { id: 1, jp: '{帆|ほ} を {半分|はんぶん}', en: 'Half out' },
    { id: 2, jp: '{帆|ほ} を {張|は}る', en: 'Full out' },
  ];
  const WINDS = ['up', 'right', 'down', 'left']; // where the wind comes FROM: up = from the north
  const WIND_NAME = { up: { jp: '{北|きた}', en: 'north' }, right: { jp: '{東|ひがし}', en: 'east' }, down: { jp: '{南|みなみ}', en: 'south' }, left: { jp: '{西|にし}', en: 'west' } };
  const DMG = ['sail', 'line', 'rudder', 'hatch'];

  // ---- the sea's tiles: water you can sail, land you cannot ------------------------------------------------------
  (function tiles() {
    const T = RB.tiles && RB.tiles.T;
    if (!T || T.sea) return;
    T.sea = Object.assign({}, T.water, { id: 'sea', walk: true, water: true, step: 'splash' });
    T.seashoal = Object.assign({}, T.shallow, { id: 'seashoal', walk: true, water: true, step: 'splash' });
    T.isle = Object.assign({}, T.grass, { id: 'isle', walk: false });
    T.isleSand = Object.assign({}, T.sand, { id: 'isleSand', walk: false });
  })();
  // the legend a sea map uses: '~' open sea, 'w' shoal water (both sailable); land, sand, rock and cliff are solid
  const LEGEND = { '~': { tile: 'sea' }, w: { tile: 'seashoal' }, '.': { tile: 'isle' }, s: { tile: 'isleSand' }, h: { tile: 'isleSand', prop: 'rock' }, T: { tile: 'isle', prop: 'tree' }, r: { tile: 'isle', prop: 'rock' } };

  // ---- state -----------------------------------------------------------------------------------------------------
  function of(s) {
    s = s || S();
    if (!s) return null;
    if (!isObj(s.sea)) s.sea = {};
    const q = s.sea;
    if (!isObj(q.seen)) q.seen = {};
    if (!Array.isArray(q.log)) q.log = [];
    if (q.trim == null) q.trim = 1;
    if (q.n == null) q.n = 0;
    return q;
  }
  const owns = (s) => !!(s && s.flags && s.flags.sea_boat);
  const onSea = (map) => !!(map && map.def && map.def.sea);
  const active = (s) => { s = s || S(); return !!(s && s.sea && s.sea.voyage); };
  function syncVars(s) {
    const q = of(s);
    s.vars = s.vars || {};
    s.vars.sea_at = q.at || '';
    s.vars.sea_to = (q.voyage && q.voyage.to) || '';
    s.vars.sea_n = q.n;
    if (q.dmg) s.flags.sea_dmg = true; else delete s.flags.sea_dmg;
  }

  // ---- ports and the chart ---------------------------------------------------------------------------------------
  const port = (id) => (C().ports || {})[id] || null;
  const portIds = () => Object.keys(C().ports || {});
  const open = (s, id) => { const p = port(id); return !!p && (!p.if || RB.state.test(s, p.if)); };
  function reached(s, id) {
    const p = port(id);
    if (!p) return false;
    if (s.flags['sea_port_' + id]) return true;
    if (p.reach && RB.state.test(s, p.reach)) return true;
    return !!(s.visited && s.visited[p.dock.map]);
  }
  // where the boat can go from here: ports open and reached, but the one it lies at
  function destinations(s, from) {
    return portIds().filter((id) => id !== from && open(s, id) && reached(s, id));
  }
  // which port's water a sea tile is in
  function portAt(x, y) {
    for (const id of portIds()) {
      const z = port(id).zone;
      if (z && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return id;
    }
    return null;
  }
  const route = (a, b) => [a, b].sort().join('-');

  // ---- wind and sail -----------------------------------------------------------------------------------------------
  // the point of sail for a heading: run (wind from behind), reach (from the side), beat (from ahead)
  function pointOf(heading, wind) {
    if (wind === OPP[heading]) return 'run';
    if (wind === heading) return 'beat';
    return 'reach';
  }
  const BEST = { run: 2, reach: 1, beat: 0 };
  const POINT = { run: 1.0, reach: 0.9, beat: 1.45 };
  const OFF = [1, 1.35, 1.7];
  // how long one step takes: never forever, never failure; a sail set wrong or something unmended only slows it
  function stepDur(dir, s) {
    s = s || S();
    const q = of(s), v = q.voyage;
    const wind = (v && v.wind) || 'left';
    const pt = pointOf(dir, wind);
    const off = Math.abs((q.trim | 0) - BEST[pt]);
    const dmg = q.dmg ? 1.25 : 1;
    return Math.round(150 * POINT[pt] * OFF[off] * dmg);
  }
  // what the pennant tells: the point of sail and whether the sail suits it
  function sailState(s, heading) {
    const q = of(s), v = q.voyage;
    const wind = (v && v.wind) || 'left';
    const pt = pointOf(heading || 'up', wind);
    return { wind, windName: WIND_NAME[wind], point: pt, best: BEST[pt], trim: q.trim | 0, good: (q.trim | 0) === BEST[pt], dmg: q.dmg || null };
  }
  function setTrim(s, k) { const q = of(s); q.trim = Math.max(0, Math.min(2, k | 0)); return q.trim; }

  // ---- a voyage: its situations, drawn once ----------------------------------------------------------------------
  function eligible(s, a, b) {
    const out = [];
    const SIT = C().seaSituations || {};
    const q = of(s), r = route(a, b);
    for (const id in SIT) {
      const d = SIT[id];
      if (d.first || d.story) continue;
      if (d.routes && !d.routes.some((x) => route.apply(null, x.split('-')) === r)) continue;
      if (d.once && q.seen[id]) continue;
      if (d.if && !RB.state.test(s, d.if)) continue;
      if (d.kind === 'trouble' && q.dmg) continue;
      out.push(id);
    }
    return out;
  }
  function plan(s, a, b) {
    const SIT = C().seaSituations || {};
    const q = of(s), r = route(a, b);
    const forced = [];
    // the route's first-time situation, once; story situations whose condition holds
    for (const id in SIT) {
      const d = SIT[id];
      if (d.first && route.apply(null, d.first.split('-')) === r && !q.seen[id]) forced.push(id);
      else if (d.story && RB.state.test(s, d.story) && !q.seen[id] && (!d.routes || d.routes.some((x) => route.apply(null, x.split('-')) === r))) forced.push(id);
    }
    // a trial round the point (from a port back to it) has no drawn situations and a set wind: the lesson is the sail
    if (a === b) return { sits: forced, wind: 'left' };
    const key = 'voyage:' + q.n;
    const drawn = RB.streams.fixed(s, key, 'sea', (draw) => {
      const pool = eligible(s, a, b);
      const n = pool.length ? 1 + (draw() < 0.45 ? 1 : 0) : 0;
      const out = [];
      for (let i = 0; i < n && pool.length; i++) {
        const tot = pool.reduce((t, id) => t + ((SIT[id] && SIT[id].weight) || 1), 0);
        let x = draw() * tot, k = 0;
        for (; k < pool.length - 1; k++) { x -= (SIT[pool[k]].weight || 1); if (x < 0) break; }
        out.push(pool.splice(k, 1)[0]);
      }
      const wind = WINDS[Math.floor(draw() * 4)];
      return { sits: out, wind };
    });
    RB.streams.consume(s, key);
    return { sits: forced.concat(drawn.sits), wind: drawn.wind };
  }
  // the distance the boat sails between two ports, in steps (by the sea map's own coordinates)
  function distance(a, b) {
    const A = port(a), B = port(b);
    if (!A || !B) return 30;
    return Math.max(8, Math.abs(A.sea.x - B.sea.x) + Math.abs(A.sea.y - B.sea.y));
  }
  // begin: from where the boat lies, to `to`, sailed by `mode` ('self' | 'crew')
  function begin(s, from, to, mode) {
    const q = of(s);
    const p = api.plan(s, from, to), d = distance(from, to); // (through the api, so a test can set a voyage's situations)
    // situations spaced over the voyage (at a third, then two thirds of the way, for the self-sailed voyage)
    const sits = p.sits.map((id, i) => ({ id, at: Math.max(3, Math.round(d * (i + 1) / (p.sits.length + 1))), done: false }));
    q.voyage = { from, to, mode, wind: p.wind, steps: 0, sits, sights: [], words: [], people: [], crewFrom: null, offered: from };
    syncVars(s);
    return q.voyage;
  }
  // the next situation due (sailing yourself, at its step), or any left (when the crew sails)
  function due(s, all) {
    const v = of(s).voyage;
    if (!v) return null;
    return v.sits.find((x) => !x.done && (all || v.steps >= x.at)) || null;
  }
  async function runSituation(s, x) {
    const d = (C().seaSituations || {})[x.id];
    x.done = true;
    const q = of(s);
    q.seen[x.id] = (q.seen[x.id] | 0) + 1;
    if (d && d.scene && RB.content.scenes[d.scene]) await RB.script.run(d.scene);
  }
  // a step at sea (src/engine/50_world.js calls it after each step on a sea map)
  let busy = false;
  async function onStep() {
    const s = S(), W = RB.world.W;
    if (!s || !active(s) || busy || !onSea(W.map)) return;
    const v = of(s).voyage;
    v.steps++;
    const x = due(s);
    if (x) { busy = true; try { await runSituation(s, x); } finally { busy = false; } return; }
    // the sea map's own triggers (a mark to round on a trial), as on land: `if`, and `once` per journey
    const p = W.player;
    for (const tr of W.map.triggers || []) {
      if (p.x < tr.x || p.x >= tr.x + tr.w || p.y < tr.y || p.y >= tr.y + tr.h) continue;
      if (tr.if && !RB.state.test(s, tr.if)) continue;
      const onceKey = 'trig:' + W.map.id + ':' + (tr.id || tr.x + ',' + tr.y);
      if (tr.once && s.flags[onceKey]) continue;
      if (tr.once) s.flags[onceKey] = true;
      busy = true;
      try { await RB.script.run(tr.scene, { trigger: tr }); } finally { busy = false; }
      return;
    }
    // in a port's water: the destination docks; another port reached offers to
    const at = portAt(W.player.x, W.player.y);
    // (a trial, out and back to the same port, puts in nowhere else)
    if (at && (at === v.to || v.from !== v.to && reached(s, at) && open(s, at)) && v.offered !== at) {
      v.offered = at;
      busy = true;
      try { await RB.script.run('sea.dock_' + at, { port: at }); } finally { busy = false; }
    } else if (!at) v.offered = null;
  }
  // arrive at `to`: the log's entry, the boat lies there, ashore by it
  async function arrive(s, to, opts) {
    const q = of(s), v = q.voyage;
    if (!v) return;
    const P = port(to);
    q.n++;
    q.at = to;
    s.flags['sea_port_' + to] = true;
    const entry = { n: q.n, from: v.from, to, mode: v.crewFrom != null ? (v.crewFrom > 0 ? 'both' : 'crew') : v.mode, wind: v.wind,
      sights: v.sights.slice(), words: v.words.slice(), people: v.people.slice(), sits: v.sits.filter((x) => x.done).map((x) => x.id), ch: s.chapter || 0, t: Date.now() };
    q.log.push(entry);
    if (q.log.length > 200) q.log.shift();
    q.voyage = null;
    syncVars(s);
    if (!(opts && opts.noWarp) && P) await RB.game.transition(P.dock.map, P.dock.x, P.dock.y, P.dock.dir || 'down', { inScript: true });
    // the port's own arrival by boat (the first landing on the island, say), when it has one
    if (P && P.arrive && RB.content.scenes[P.arrive] && !(opts && opts.noWarp)) await RB.script.run(P.arrive, { port: to });
    return entry;
  }
  // the crew takes over: what situations are left still happen (story ones are never skipped), then arrival.
  // From port the crossing is seen at sea, as when you sail her yourself: the boat on the sea map at the port's water
  // (the same one transition as putting out yourself); a crew taking over at sea stays where she is. She comes
  // alongside at the destination's water (placed there in the dark of a fade, on the same map), then docks (RBN-QA-174).
  // When she cannot be placed there (the water taken, or no staging), the arrival is told over the dark and she is seen
  // next at the dock. A campaign change (a load, even one cancelled; a new journey; the title) ends the crossing where it
  // is, as it ends the scene it runs in: nothing more is run, placed or arrived for the journey left (a cancelled load
  // leaves this voyage open where she is, to be sailed on).
  let campTok = 0;
  if (RB.bus) RB.bus.on('campaign:changing', () => { campTok++; });
  async function crew(s) {
    const q = of(s), v = q.voyage;
    if (!v) return;
    const tok = campTok, live = () => tok === campTok && S() === s && q.voyage === v;
    v.crewFrom = v.steps;
    const W = RB.world.W, A = port(v.from), B = port(v.to);
    if (!onSea(W.map) && A && A.sea) await RB.game.transition(C().seaMap || 'sea.coast', A.sea.x, A.sea.y, A.sea.dir || 'down', { inScript: true });
    let x;
    while (live() && (x = due(s, true))) await runSituation(s, x);
    if (!live()) return;
    let dark = false;
    if (onSea(W.map) && B && B.sea) {
      await RB.ui.fade(true, 220);
      if (!live()) return;
      const placed = RB.staging ? await RB.staging.walkTo('pc', B.sea.x, B.sea.y, B.sea.dir || null, { now: true }) : false;
      if (!live()) return;
      if (placed) await RB.ui.fade(false, 220);
      else dark = true;
    }
    // (a campaign change while the screen lightens again must not begin the arrival's line on the journey loaded)
    if (!live()) return;
    if (RB.content.scenes['sea.crew_arrive']) await RB.script.run('sea.crew_arrive');
    if (!live()) return;
    await arrive(s, v.to);
    if (dark && S() === s && tok === campTok) await RB.ui.fade(false, 220);
  }
  // put out: the boat on the sea map at the port's water, or the crew's crossing
  async function putOut(s, from, to, mode) {
    const v = begin(s, from, to, mode);
    if (mode === 'crew') { await crew(s); return v; }
    const P = port(from);
    const m = C().seaMap || 'sea.coast';
    await RB.game.transition(m, P.sea.x, P.sea.y, P.sea.dir || 'down', { inScript: true });
    return v;
  }
  // something goes wrong on board (a situation): mend now, or later in port
  function damage(s, kind) { const q = of(s); q.dmg = DMG.indexOf(kind) >= 0 ? kind : 'sail'; syncVars(s); return q.dmg; }
  function mend(s) { const q = of(s); const had = q.dmg; q.dmg = null; syncVars(s); return had; }
  // what a voyage noted, for the log
  function note(s, kind, what) {
    const v = of(s).voyage;
    const list = v && { sight: v.sights, word: v.words, person: v.people }[kind];
    if (list && list.indexOf(what) < 0) list.push(what);
  }

  // ---- the scenes' hooks ------------------------------------------------------------------------------------------
  //   !hook sail_chart <port>    the chart at this port's boat: choose where and how (var._sail: 'self' | 'crew' |
  //                              'cancel'); the voyage begins
  //   !hook sail_crew            let the crew sail from here (at sea)
  //   !hook sail_dock [port]     dock at the voyage's destination (or the port given): arrive
  //   !hook sail_damage <kind>   something goes wrong on board
  //   !hook sail_mend            mended (now, or in port)
  //   !hook sail_log <sight|word|person> <id>   the voyage notes it for the log
  //   !hook sail_boat <hull> [name]  the boat is yours (A Licence for the Open Sea)
  //   !hook sail_trial <from> <to>   a voyage that the story sets (the sea trial, the maiden voyage), sailed yourself
  RB.hooks = RB.hooks || {};
  RB.hooks.sail_chart = async (a, ctx) => {
    const s = S(), from = a[0] || (ctx && ctx.prop && ctx.prop.o && ctx.prop.o.port) || of(s).at || 'saltglass';
    const pick = RB.ui.sail && RB.ui.sail.chart ? await RB.ui.sail.chart(s, from) : null;
    if (!pick || !pick.to) { s.vars._sail = 'cancel'; return; }
    s.vars._sail = pick.mode;
    await putOut(s, from, pick.to, pick.mode);
  };
  RB.hooks.sail_crew = async () => { const s = S(); if (active(s)) await crew(s); };
  RB.hooks.sail_dock = async (a, ctx) => { const s = S(); const v = of(s).voyage; if (!v) return; await arrive(s, a[0] || (ctx && ctx.port) || v.to); };
  RB.hooks.sail_damage = async (a) => { damage(S(), a[0]); };
  RB.hooks.sail_mend = async () => { mend(S()); };
  RB.hooks.sail_log = async (a) => { note(S(), a[0], a.slice(1).join(' ')); };
  RB.hooks.sail_boat = async (a) => {
    const s = S(), q = of(s);
    q.boat = Object.assign({}, q.boat || {}, { hull: a[0] || (q.boat && q.boat.hull) || 'chidori' });
    if (a[1]) q.boat.name = a.slice(1).join(' ');
    s.flags.sea_boat = true;
    if (!q.at) q.at = 'saltglass';
    syncVars(s);
  };
  RB.hooks.sail_trial = async (a) => { const s = S(); await putOut(s, a[0], a[1], 'self'); };
  //   !hook sail_name [keep]     name the boat in kana (the yards): var._res 1 when a name is painted, 0 if put off;
  //                              `keep` offers to keep the hull's old name (ちどり)
  RB.hooks.sail_name = async (a) => {
    const s = S(), q = of(s);
    const keep = a[0] === 'keep' ? 'ちどり' : null;
    // an automated run names the boat at once (the old name when offered, else はやて) and logs it
    const auto = RB.test && RB.test.auto ? keep || 'はやて' : null;
    if (auto) RB.test.log.push({ t: 'activity', kind: 'sail_name', auto });
    const name = auto || (RB.ui.sail && RB.ui.sail.nameBoat ? await RB.ui.sail.nameBoat(s, { keep, current: (q.boat && q.boat.name) || '' }) : null);
    if (!name) { s.vars._res = 0; return; }
    q.boat = Object.assign({}, q.boat || {}, { name });
    s.vars.sea_kept = keep && name === keep ? 1 : 0;
    s.vars._res = 1;
  };
  //   !hook sail_cabin           below to the cabin from the boat at this port (the port is remembered for coming up)
  //   !hook sail_ashore          up from the cabin, onto the pier by the boat
  //   !hook sail_open <page>     the Ledger at a page (the cabin's shelf, volume, Distractions corner)
  RB.hooks.sail_cabin = async (a, ctx) => {
    const s = S(), q = of(s);
    q.at = a[0] || (ctx && ctx.prop && ctx.prop.o && ctx.prop.o.port) || q.at || 'saltglass';
    syncVars(s);
    await RB.game.transition('sea.cabin', 5, 5, 'up', { inScript: true });
  };
  RB.hooks.sail_ashore = async () => {
    const s = S(), P = port(of(s).at) || port('saltglass');
    await RB.game.transition(P.dock.map, P.dock.x, P.dock.y, P.dock.dir || 'down', { inScript: true });
  };
  RB.hooks.sail_open = async (a) => { if (RB.ui.menu && RB.ui.menu.open) RB.ui.menu.open(a[0]); };
  // a name the sign-writers can paint: one to five hiragana; not starting with ん or a small kana; a small ゃゅょ only
  // after a kana of the い column; a small っ never last. Returns null when it is fine, or why not ({ jp, en }).
  const SMALL = 'ゃゅょ', ICOL = 'きしちにひみりぎじぢびぴ';
  function nameProblem(k) {
    k = String(k || '');
    const ch = Array.from(k);
    if (!ch.length) return { jp: '{名前|なまえ} が まだ ない 。', en: 'Choose at least one kana.' };
    if (ch.length > 5) return { jp: '{五文字|ごもじ} まで 。', en: 'Five kana at most: the sign-writers need room for 丸.' };
    if (ch.some((c) => !/[\u3041-\u3093]/.test(c))) return { jp: 'ひらがな だけ 。', en: 'Hiragana only.' };
    if (('んっ' + SMALL).indexOf(ch[0]) >= 0) return { jp: '「' + ch[0] + '」 で は {始|はじ}まらない 。', en: 'A name can\'t begin with ' + ch[0] + '.' };
    for (let i = 1; i < ch.length; i++) if (SMALL.indexOf(ch[i]) >= 0 && ICOL.indexOf(ch[i - 1]) < 0) return { jp: '「' + ch[i] + '」 は 、 い の {段|だん} の {後|あと} だけ 。', en: 'A small ' + ch[i] + ' only follows a kana ending in i (き, し, ち…).' };
    if (ch[ch.length - 1] === 'っ') return { jp: '「っ」 で は {終|お}わらない 。', en: 'A name can\'t end with a small っ.' };
    return null;
  }
  // the boat's name, as painted: kana, always followed by 丸 (`$boat {丸|まる}` in a line); in English, "Chidori-maru"
  function boatName(s) {
    const q = of(s), k = (q && q.boat && q.boat.name) || '';
    if (!k) return { jp: '', en: '' };
    const ro = RB.kana && RB.kana.romaji ? RB.kana.romaji(k) : k;
    return { jp: k, en: ro.charAt(0).toUpperCase() + ro.slice(1) + '-maru' };
  }

  const api = { of, owns, active, onSea, port, portIds, open, reached, destinations, portAt, route, pointOf, stepDur, sailState, setTrim, TRIMS, WIND_NAME,
    plan, begin, distance, due, onStep, arrive, crew, putOut, damage, mend, note, boatName, nameProblem, LEGEND, syncVars };
  return api;
})();
