/* Unwritten Atlas — generator self-check.
 * RB.atlas.selfCheck(n) generates n expeditions across all four learning
 * profiles, every route modifier (alone and in pairs), every companion and
 * every unlock tier, and verifies each one:
 *   - the route graph reaches the road home from the threshold;
 *   - every map passes the same geometry checks as tools/validate.mjs
 *     (equal rows, walkable spawn, exits landing on walkable non-exit tiles,
 *     known props, NPCs/foes on walkable tiles, scene references);
 *   - every room is solvable in stages: with nothing solved, every
 *     interactable is reachable; with the room solved, every exit is reachable
 *     (optional foes and unanswered optional names still standing), and a
 *     gated exit is NOT reachable before its gate opens;
 *   - every objective yields a valid language step with an existing item at
 *     every profile (including Foundations with and without taught kana);
 *   - every battle's enemy exists, its intents are valid and authored, and it
 *     is winnable with Unravel alone for every companion, at normal and hard
 *     tactics, with and without a light word, with no relics / all relics /
 *     each charm. Returns {ok, errors, warnings, stats}. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const AT = RB.atlas, C = RB.content, A = C.atlas;
  const LV = ['F', 'E', 'I', 'A'];
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function modSets() {
    const out = [[]];
    for (const m of A.modifierOrder) out.push([m]);
    for (let i = 0; i < A.modifierOrder.length; i++) for (let j = i + 1; j < A.modifierOrder.length; j++) out.push([A.modifierOrder[i], A.modifierOrder[j]]);
    return out;
  }
  function allKana() {
    const H = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょ';
    return Array.from(H + RB.kana.toKata(H) + 'ー');
  }

  // Walkability for a compiled atlas map under a set of flags.
  function walker(m, def, flags, opt) {
    opt = opt || {};
    const fake = RB.state.newCampaign();
    fake.flags = flags;
    fake.learn.profile = opt.profile || 'I';
    const cond = new Map();
    const test = (c) => { if (!cond.has(c)) cond.set(c, RB.state.test(fake, c)); return cond.get(c); };
    const extra = new Set(opt.block || []);
    const blocked = (x, y) => {
      if (x < 0 || y < 0 || x >= m.w || y >= m.h) return true;
      if (m.block[y * m.w + x]) return true;
      if (extra.has(x + ',' + y)) return true;
      for (const p of m.props) {
        if (!p.if) continue;
        const pd = RB.props.P[p.p];
        if (!pd || !pd.block || p.block === false) continue;
        const pw = p.w || pd.w, ph = p.h || pd.h;
        if (x >= p.x && x < p.x + pw && y >= p.y && y < p.y + ph && test(p.if)) return true;
      }
      for (const n of def.npcs || []) if (n.x === x && n.y === y && (!n.if || test(n.if))) return true;
      for (const f of def.foes || []) if (f.x === x && f.y === y && !flags['foe:' + m.id + ':' + f.id]) return true;
      return false;
    };
    const exitAt = (x, y) => m.exits.find((e) => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h && (!e.if || test(e.if)));
    return { blocked, exitAt };
  }
  function bfs(m, W, sx, sy) {
    const seen = new Set();
    if (W.blocked(sx, sy)) return seen;
    const q = [[sx, sy]];
    seen.add(sx + ',' + sy);
    while (q.length) {
      const [x, y] = q.shift();
      if (W.exitAt(x, y) && !(x === sx && y === sy)) continue; // exits are destinations, not corridors
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || W.blocked(nx, ny)) continue;
        seen.add(k);
        q.push([nx, ny]);
      }
    }
    return seen;
  }
  const adjacentTo = (seen, x, y, w, h) => {
    w = w || 1; h = h || 1;
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
      const edge = (yy === y - 1 || yy === y + h) !== (xx === x - 1 || xx === x + w);
      if (edge && seen.has(xx + ',' + yy)) return true;
    }
    return false;
  };

  function selfCheck(n, opts) {
    n = n || 200;
    opts = opts || {};
    const errors = [], warnings = [];
    const E = (m) => { if (errors.length < 400) errors.push(m); };
    const Wn = (m) => { if (warnings.length < 400) warnings.push(m); };
    const stats = { runs: 0, rooms: 0, maps: 0, profiles: { F: 0, E: 0, I: 0, A: 0 }, mods: {}, patterns: {}, objectives: {}, enemies: {}, sims: 0, steps: 0, pathMin: 99, pathMax: 0, relicsPlaced: 0, names: 0 };
    const sets = modSets();
    const simCache = new Map();
    const saved = RB.game.s;
    const KANA = allKana();
    const scenesOk = (id, where) => { if (id && !C.scenes[id]) E(where + ': missing scene ' + id); };
    try {
      for (let i = 0; i < n; i++) {
        const P = LV[i % 4];
        const comp = COMPS[Math.floor(i / 4) % 4];
        const mods = sets[i % sets.length];
        const s = RB.state.newCampaign({ profile: P });
        s.comp = comp;
        s.flags.postgame = true;
        s.atlas.completed = Math.floor(i / 16) % 4;
        s.atlas.started = i;
        if (P === 'F') { s.learn.taught = {}; if (i % 8 !== 0) for (const ch of KANA) s.learn.taught[ch] = true; }
        RB.game.s = s;
        const run = AT.newRun(s, mods, { seed: (Math.imul(0x9e3779b1, i + 1) ^ (opts.salt || 0)) >>> 0 });
        const b = AT.buildMaps(run);
        for (const id in b.maps) C.maps[id] = b.maps[id];
        try {
          checkRun(run, b, P, { E, Wn, stats, simCache, scenesOk });
        } catch (err) {
          E('run ' + run.id + ': exception ' + (err && err.stack || err));
        } finally {
          for (const id in b.maps) delete C.maps[id];
          RB.maps.invalidate();
        }
        stats.runs++;
        stats.profiles[P]++;
        for (const m of mods) stats.mods[m] = (stats.mods[m] || 0) + 1;
      }
    } finally {
      RB.game.s = saved;
    }
    return { ok: errors.length === 0, errors, warnings, stats };
  }

  function checkRun(run, b, P, X) {
    const { E, Wn, stats, simCache, scenesOk } = X;
    const plan = b.plan;
    const where = (k) => 'run ' + run.id + ' [' + (run.mods.join('+') || 'plain') + ',' + P + ',' + run.comp + '] room ' + k;
    // ---- route graph
    const seen = new Set(['t']);
    const q = ['t'];
    while (q.length) { const k = q.shift(); for (const nx of plan.rooms[k].next) if (!seen.has(nx)) { if (!plan.rooms[nx]) E(where(k) + ': next room ' + nx + ' missing'); else { seen.add(nx); q.push(nx); } } }
    if (!seen.has('z')) E(where('t') + ': the road home is not reachable');
    const lens = [];
    const walk = (k, d) => { if (k === 'z') { lens.push(d); return; } for (const nx of plan.rooms[k].next) walk(nx, d + 1); };
    walk('t', 1);
    stats.pathMin = Math.min(stats.pathMin, Math.min.apply(null, lens));
    stats.pathMax = Math.max(stats.pathMax, Math.max.apply(null, lens));
    // ---- rooms
    for (const key in plan.rooms) {
      const d = plan.rooms[key];
      const id = AT.mapId(run, key);
      const def = b.maps[id];
      stats.rooms++;
      stats.maps++;
      stats.patterns[d.pattern] = (stats.patterns[d.pattern] || 0) + 1;
      if (d.obj) stats.objectives[d.obj.type] = (stats.objectives[d.obj.type] || 0) + 1;
      stats.relicsPlaced += d.caches.filter((c) => c.kind === 'relic').length;
      stats.names += d.names.length;
      let m;
      try { m = RB.maps.compile(id); } catch (err) { E(where(key) + ': compile ' + err.message); continue; }
      // geometry (as tools/validate.mjs)
      const w0 = def.terrain[0].length;
      if (def.terrain.some((r) => r.length !== w0)) E(where(key) + ': terrain rows differ in width');
      if (def.terrain.length !== A.patterns[d.pattern].h) E(where(key) + ': wrong height');
      const walkStatic = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !m.block[y * m.w + x];
      const sp = def.spawn.default;
      if (!walkStatic(sp[0], sp[1])) E(where(key) + ': spawn not walkable');
      if (RB.maps.exitAt(m, sp[0], sp[1])) E(where(key) + ': spawn on an exit');
      for (const e of m.exits) {
        const T = b.maps[e.to];
        if (!T) { E(where(key) + ': exit to unknown map ' + e.to); continue; }
        const tm = RB.maps.compile(e.to);
        if (e.tx < 0 || e.ty < 0 || e.tx >= tm.w || e.ty >= tm.h || tm.block[e.ty * tm.w + e.tx]) E(where(key) + ': exit lands on blocked tile');
        else if (tm.exits.some((x) => e.tx >= x.x && e.tx < x.x + x.w && e.ty >= x.y && e.ty < x.y + x.h)) E(where(key) + ': exit lands on an exit');
        if (e.locked) scenesOk(e.locked, where(key));
      }
      for (const p of def.props) { if (!RB.props.P[p.p]) E(where(key) + ': unknown prop ' + p.p); if (p.scene) scenesOk(p.scene, where(key)); }
      for (const nn of def.npcs) { if (!walkStatic(nn.x, nn.y)) E(where(key) + ': npc on blocked tile'); scenesOk(nn.talk, where(key)); if (nn.name && !A.names[nn.name] && nn.id !== 'atlas_guardian') E(where(key) + ': unknown name ' + nn.name); }
      for (const f of def.foes) { if (!C.enemies[f.enemy]) E(where(key) + ': unknown enemy ' + f.enemy); if (!walkStatic(f.x, f.y)) E(where(key) + ': foe on blocked tile'); scenesOk(f.scene, where(key)); }
      for (const t of def.triggers) scenesOk(t.scene, where(key));
      for (const ev of def.onEnter) scenesOk(ev.scene, where(key));
      if (d.next.length && !m.exits.length) E(where(key) + ': no exits but has next rooms');
      if (d.kind === 'fork' || d.kind === 'camp') { if (m.exits.length !== 2) E(where(key) + ': fork/camp needs 2 exits'); }
      if (d.obj && d.obj.type === 'doors') {
        if (m.exits.length !== 3) E(where(key) + ': doors room needs 3 exits');
        if (m.exits.filter((e) => e.correct).length !== 1) E(where(key) + ': doors room needs exactly one correct door');
      }
      // ---- staged reachability
      const gateFlags = {};
      const allFlags = {};
      // stage A: nothing solved
      const WA = walker(m, def, gateFlags, { profile: P });
      const RA = bfs(m, WA, sp[0], sp[1]);
      // stage B: room solved (objective, lamps, promise flags, guard down, climax won, required names answered)
      if (d.obj) {
        allFlags[AT.FLAG(d.obj.id)] = true;
        for (let i = 0; i < 3; i++) allFlags[AT.FLAG(d.obj.id + '_' + i)] = true;
      }
      allFlags[AT.FLAG('pr1')] = true; allFlags[AT.FLAG('pr2')] = true; allFlags[AT.FLAG('climax')] = true;
      for (const c of d.caches) allFlags[AT.FLAG(key + '_' + c.id)] = false;
      def.npcs.forEach((nn, i) => { if (nn.required) allFlags[AT.FLAG('name_' + key + '_' + i)] = true; });
      if (d.guard) allFlags['foe:' + id + ':guard'] = true;
      // optional foes stay (their whole patrol box is treated as solid)
      const box = [];
      for (const f of def.foes) if (f.id !== 'guard') for (let dy = -(f.patrol || 0); dy <= (f.patrol || 0); dy++) for (let dx = -(f.patrol || 0); dx <= (f.patrol || 0); dx++) box.push((f.x + dx) + ',' + (f.y + dy));
      const WB = walker(m, def, allFlags, { profile: P, block: box });
      const RB_ = bfs(m, WB, sp[0], sp[1]);
      const WB2 = walker(m, def, allFlags, { profile: P });
      const RB2 = bfs(m, WB2, sp[0], sp[1]);
      // interactables before anything is solved
      for (const p of def.props) {
        if (!p.scene || (p.if && !RB.state.test(Object.assign(RB.state.newCampaign(), { flags: gateFlags }), p.if))) continue;
        if (p.cache) continue;
        const pd = RB.props.P[p.p];
        if (!adjacentTo(RA, p.x, p.y, p.w || pd.w, p.h || pd.h)) E(where(key) + ': ' + p.p + ' (' + p.scene + ') at ' + p.x + ',' + p.y + ' not reachable before solving');
      }
      def.npcs.forEach((nn) => { if (!adjacentTo(RA, nn.x, nn.y)) E(where(key) + ': npc ' + nn.id + ' not reachable'); });
      for (const f of def.foes) if (!adjacentTo(RA, f.x, f.y) && !adjacentTo(RB2, f.x, f.y)) Wn(where(key) + ': foe ' + f.id + ' cannot be reached');
      for (const t of def.triggers) { let ok = false; for (let x = t.x; x < t.x + t.w; x++) if (RA.has(x + ',' + t.y)) ok = true; if (!ok) E(where(key) + ': climax trigger not reachable'); }
      // exits once solved (with optional foes' patrol boxes still in the way)
      for (const e of m.exits) {
        let ok = false;
        for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) if (RB_.has(x + ',' + y)) ok = true;
        if (!ok) E(where(key) + ': exit to ' + e.to.split('.')[2] + ' at ' + e.x + ',' + e.y + ' not reachable once solved (' + d.pattern + '/' + d.variant + (d.mirror ? '/mirror' : '') + ')');
      }
      // caches reachable once solved
      for (const p of def.props) if (p.cache && !adjacentTo(RB2, p.x, p.y)) E(where(key) + ': cache ' + p.cache + ' at ' + p.x + ',' + p.y + ' not reachable');
      // gates actually gate
      const gated = def.props.some((p) => (p.p === 'atlas_veil' || p.p === 'water') && p.if && p.if !== 'false' && p.if.indexOf('pr1') < 0 && p.if.indexOf('pr2') < 0);
      if (gated && d.kind !== 'climax') {
        for (const e of m.exits) { let open = false; for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) if (RA.has(x + ',' + y)) open = true; if (open) E(where(key) + ': gated exit reachable before the room is solved'); }
      }
      if (d.kind === 'climax') {
        // the guardian's exit opens only after the fight; the trigger line spans the room
        for (const e of m.exits) { let open = false; for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) if (RA.has(x + ',' + y)) open = true; if (open) E(where(key) + ': climax exit reachable before the guardian'); }
      }
      // ---- language: every objective at every profile
      const tryProfiles = LV;
      const checkSteps = (label, steps, prof) => {
        if (!steps || !steps.length) { E(where(key) + ': ' + label + ' has no step at ' + prof); return; }
        for (const st of steps) {
          X.stats.steps++;
          if (!st) { E(where(key) + ': ' + label + ' produced no step at ' + prof); continue; }
          for (const e of AT.validStep(st)) E(where(key) + ': ' + label + ' [' + prof + '] ' + (st.id || '') + ' ' + e);
          if (!AT.itemExists(st.item)) E(where(key) + ': ' + label + ' [' + prof + '] item missing ' + JSON.stringify(st.item));
          const prepared = RB.tasks.prepare(st);
          for (const e of AT.validStep(prepared)) E(where(key) + ': ' + label + ' prepared [' + prof + '] ' + e);
        }
      };
      const savedProf = RB.game.s.learn.profile;
      for (const prof of tryProfiles) {
        RB.game.s.learn.profile = prof;
        if (d.obj && d.obj.type !== 'doors' && d.obj.type !== 'name') checkSteps(d.obj.type, AT.objectiveSteps(d.obj, run, prof), prof);
        if (d.obj && d.obj.type === 'doors') {
          const clue = AT.doorClue(d.obj, prof);
          if (!clue) E(where(key) + ': no door clue at ' + prof);
          else if (RB.jp.validate(clue.jp).length) E(where(key) + ': door clue markup');
        }
        d.names.forEach((nm) => checkSteps('name ' + nm.id, AT.objectiveSteps({ type: 'name', seed: 7 }, run, prof, { name: nm.id }), prof));
        if (d.kind === 'climax') checkSteps('legend ' + d.boss, AT.objectiveSteps({ type: 'legend', seed: 11 }, run, prof, { boss: d.boss }), prof);
      }
      RB.game.s.learn.profile = savedProf;
      if (d.names.length && d.obj && d.obj.type === 'name' && !def.npcs.some((nn) => nn.required)) E(where(key) + ': name objective without a required name');
      // ---- battles
      const enemies = def.foes.map((f) => f.enemy);
      if (d.kind === 'climax') enemies.push(A.climaxes[d.boss].enemy);
      for (const en of enemies) {
        stats.enemies[en] = (stats.enemies[en] || 0) + 1;
        const key2 = en + '|' + run.mods.slice().sort().join('+');
        if (simCache.has(key2)) { const r = simCache.get(key2); if (r) E(where(key) + ': ' + r); continue; }
        let problem = null;
        const ip = AT.intentProblems(en, run.mods);
        if (ip.length) problem = ip.join('; ');
        const allRelics = A.relicOrder.slice();
        const relicSets = [[], allRelics];
        outer: for (const comp of COMPS) for (const diff of ['normal', 'hard']) for (const light of [false, true]) for (const rs of relicSets) {
          const r = AT.simBattle(en, { comp, difficulty: diff, knowsLight: light, relics: rs, mods: run.mods });
          stats.sims++;
          if (!r.win) { problem = en + ' not winnable with Unravel alone (' + comp + ', ' + diff + (light ? ', knows light' : '') + (rs.length ? ', all relics' : '') + ', mods ' + (run.mods.join('+') || 'none') + ')' + (r.stall ? ' — stalls' : ''); break outer; }
        }
        if (!problem) for (const charm of ['reed', 'tide', 'page', 'mirror']) for (const comp of COMPS) {
          const r = AT.simBattle(en, { comp, difficulty: 'normal', knowsLight: true, relics: [], mods: run.mods, charm });
          stats.sims++;
          if (!r.win) { problem = en + ' not winnable with charm ' + charm + ' (' + comp + ')'; break; }
        }
        simCache.set(key2, problem);
        if (problem) E(where(key) + ': ' + problem);
      }
    }
  }

  AT.selfCheck = selfCheck;
  AT._check = { walker, bfs, modSets };
})();
