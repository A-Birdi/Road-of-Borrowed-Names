/* Unwritten Atlas — seeded expedition generator.
 * A run is plain JSON in RB.game.s.atlas.run: {v, id, seed, mods, comp, tier,
 * climax, fresh, room, path, done, objs, relics, ...}. Everything about the
 * route (rooms, patterns, mirroring, objectives, foes, caches, names) is
 * derived deterministically from those fields by plan(); buildMaps() turns
 * the plan into ordinary map definitions registered as
 * RB.content.maps['atlas.<runId>.<room>']. prepare(state) re-registers them
 * after loading a save (src/engine/80_save.js calls it before validation).
 *
 * Route shape (a small adventure, not a list of quizzes):
 *   threshold → path room → fork ─┬─ branch A (1–2 rooms) ─┐
 *                                 └─ branch B (1–2 rooms) ─┴→ camp ─┬─ branch C ─┐
 *                                                                   └─ branch D ─┴→ guardian → road home */
var RB = (globalThis.RB = globalThis.RB || {});

RB.atlas = (function () {
  'use strict';
  const C = RB.content, A = C.atlas, U = RB.util;
  const GEN_V = 1;
  const LV = ['F', 'E', 'I', 'A'];
  const FLAG = (k) => 'atlas_r_' + k;

  // ---- run creation --------------------------------------------------------------------------
  function hallSpot() {
    const d = C.maps['rw.hall'];
    const sp = d && d.spawn && d.spawn.default;
    return sp ? { map: 'rw.hall', x: sp[0], y: sp[1] - 1, dir: 'down' } : { map: 'rw.hall', x: 5, y: 7, dir: 'down' };
  }
  function climaxPool(tier) {
    return tier >= 2 ? ['cartographer', 'bell', 'gate'] : tier >= 1 ? ['cartographer', 'bell'] : ['cartographer'];
  }
  function newRun(s, mods, opts) {
    opts = opts || {};
    const a = s.atlas;
    const started = (a.started || 0);
    const seed = opts.seed != null ? opts.seed >>> 0 : U.hashStr(String(s.id) + '#atlas#' + started) >>> 0;
    const tier = Math.min(3, a.completed || 0);
    const r = U.rng(seed ^ 0x5bd1e995);
    const pool = climaxPool(tier);
    const notes = new Set((s.notebook || []).map((n) => n.id));
    const run = {
      v: GEN_V,
      id: seed.toString(36),
      seed,
      mods: (mods || []).filter((m) => A.modifiers[m]).slice(0, 2),
      comp: s.comp || null,
      tier,
      climax: opts.climax || pool[(started === 0 ? 0 : r.int(pool.length))],
      fresh: A.nameOrder.filter((n) => !notes.has('atlas_name_' + n)),
      room: 't', path: ['t'],
      done: {}, objs: {}, relics: [], combos: [], names: [], keepsakes: [],
      lantern: (mods || []).indexOf('escort') >= 0 ? { hp: 5, max: 5 } : null,
      promises: 0, bonusKnots: 0, lastWrong: null,
      stats: { battles: 0, won: 0, objectives: 0, steps: 0, mistakes: 0, rooms: 1 },
      started: Date.now(),
    };
    return run;
  }

  // ---- planning ---------------------------------------------------------------------------------
  const PATH_POOL = ['lanterns', 'crossing', 'doors', 'grove', 'stacks', 'court', 'tide', 'margin', 'pool'];
  const BRANCH = {
    lantern: ['lanterns', 'crossing', 'doors', 'court', 'margin', 'stacks', 'tide'],
    wild: ['stacks', 'margin', 'pool', 'tide'],
    names: ['grove', 'pool'],
    long: ['crossing', 'doors', 'lanterns', 'court', 'margin', 'stacks', 'grove'],
  };
  A.branchTypes = {
    lantern: { name: { jp: '{灯|あか}り の ついた {道|みち}', en: 'the lantern-lit road' }, hint: { jp: 'こちら の {道|みち} に は 、 まだ {灯|あか}り が {残|のこ}って いる 。', en: 'Lanterns still burn along this way. Something to restore, and something left behind by someone.' } },
    wild: { name: { jp: '{書|か}かれて いない {道|みち}', en: 'the unwritten road' }, hint: { jp: 'こちら は {白紙|はくし} の まま だ 。 {何|なに}か が {動|うご}いて いる 。', en: 'This way is still blank, and something is moving in it. A guardian blocks the way — and guards something worth having.' } },
    names: { name: { jp: '{声|こえ} の する {道|みち}', en: 'the road of voices' }, hint: { jp: 'こちら から 、 {誰|だれ}か を {呼|よ}ぶ {声|こえ} が {聞|き}こえる 。', en: 'Voices this way — names looking for home. Listening is the work here.' } },
    long: { name: { jp: '{遠回|とおまわ}り の {道|みち}', en: 'the long way round' }, hint: { jp: 'こちら は {遠回|とおまわ}り だ が 、 {落|お}とし{物|もの} が {多|おお}い らしい 。', en: 'The long way round: two rooms instead of one, but more has been dropped along it.' } },
  };
  const FOES_BY = {
    lanterns: ['atlas.lamp', 'atlas.moth'], crossing: ['atlas.crane', 'atlas.crab'], doors: ['atlas.echo', 'atlas.toll', 'atlas.milestone'],
    grove: ['atlas.stray', 'atlas.fox'], stacks: ['atlas.blot', 'atlas.moth', 'atlas.milestone', 'atlas.toll'], court: ['atlas.toll', 'atlas.milestone'],
    tide: ['atlas.crab', 'atlas.crane'], margin: ['atlas.moth', 'atlas.crane', 'atlas.blot', 'atlas.lamp'], pool: ['atlas.echo', 'atlas.stray', 'atlas.fox'],
  };

  function plan(run) {
    const r = U.rng(run.seed);
    const mods = new Set(run.mods || []);
    const rooms = {};
    const R = (key, d) => (rooms[key] = Object.assign({ key, next: [], caches: [], foes: [], names: [], obj: null, guard: null }, d));
    const pick = (arr) => arr[r.int(arr.length)];
    const variantOf = (pat) => r.int(A.patterns[pat].variants.length);
    const dressOf = (pat) => pick(A.patterns[pat].dress);
    const mirror = () => mods.has('mirror');
    const objOf = (pat, prefer) => {
      const o = A.patterns[pat].objectives;
      if (prefer && o.indexOf(prefer) >= 0) return prefer;
      return o.length ? pick(o) : null;
    };
    let promiseNo = 0;
    const room = (key, pat, kind, branch, opts) => {
      opts = opts || {};
      const d = R(key, { pattern: pat, variant: variantOf(pat), dress: dressOf(pat), mirror: mirror(), kind, branch: branch || null });
      let otype = opts.obj !== undefined ? opts.obj : objOf(pat);
      if (mods.has('promises') && opts.promise && ['court', 'stacks', 'margin'].indexOf(pat) >= 0) otype = 'promise';
      if (kind === 'wild') otype = null;
      if (otype) {
        const o = { id: 'o_' + key, type: otype, seed: (run.seed ^ U.hashStr(key)) >>> 0 };
        if (otype === 'lanterns') o.lamps = 2 + r.int(2);
        if (otype === 'doors') { o.correct = pick(['L', 'M', 'R']); o.clue = r.int(4); }
        if (otype === 'promise' && mods.has('promises')) o.promise = ++promiseNo;
        d.obj = o;
      }
      return d;
    };
    // Pools
    let foePool = C.atlas.regular.slice();
    if (run.tier >= 2) foePool = foePool.concat(C.atlas.combosFoes);
    const foeFor = (pat) => {
      let base = (FOES_BY[pat] || foePool).slice();
      if (run.tier >= 2 && r() < 0.35) base = base.concat(C.atlas.combosFoes);
      return pick(base);
    };
    const freshNames = (run.fresh && run.fresh.length ? run.fresh : A.nameOrder).slice();
    const allNames = A.nameOrder.slice();
    const namesUsed = new Set();
    const nextName = () => {
      const list = freshNames.filter((n) => !namesUsed.has(n));
      const n = list.length ? pick(list) : pick(allNames.filter((x) => !namesUsed.has(x)).concat(allNames));
      namesUsed.add(n);
      return n;
    };
    // relics
    const general = C.atlas.relicOrder.filter((k) => !C.atlas.relics[k].comp);
    const compRelic = C.atlas.relicOrder.find((k) => C.atlas.relics[k].comp === run.comp) || null;
    const relicQueue = r.shuffle(general);
    let cacheNo = 0;
    const cache = (d, kind, where) => {
      let relic = null;
      if (kind === 'relic') relic = relicQueue.shift() || pick(general);
      d.caches.push({ id: 'c' + (++cacheNo), kind, relic, where: where || 'spot' });
    };

    // ---- layer 0: threshold
    const t = room('t', 'threshold', 'entry', null, { obj: 'inscription' });
    // ---- layer 1: path room
    let p1pat = pick(PATH_POOL);
    if (mods.has('promises')) p1pat = 'court';
    else if (mods.has('lowtide') && r() < 0.6) p1pat = pick(['tide', 'crossing']);
    else if (mods.has('crowd') && r() < 0.6) p1pat = pick(['grove', 'pool']);
    const p1 = room('p1', p1pat, 'path', null, { promise: true });
    t.next = ['p1'];
    // ---- layer 2: fork
    const f1 = room('f1', 'fork', 'fork', null, { obj: null });
    p1.next = ['f1'];
    const types1 = r.shuffle(['lantern', 'wild', 'names', 'long'].concat(mods.has('crowd') ? ['names'] : []));
    const bt1 = [types1[0], types1.find((x) => x !== types1[0])];
    const branchRooms = (prefix, type, usedPats) => {
      const keys = [];
      const n = type === 'long' ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const pool = BRANCH[type].filter((p) => usedPats.indexOf(p) < 0);
        let pat = pick(pool.length ? pool : BRANCH[type]);
        if (mods.has('lowtide') && type !== 'names' && r() < 0.4 && usedPats.indexOf('tide') < 0 && BRANCH[type].indexOf('tide') >= 0) pat = 'tide';
        usedPats.push(pat);
        const key = prefix + (i + 1);
        const d = room(key, pat, type === 'wild' ? 'wild' : 'branch', type, { promise: prefix === 'd' || prefix === 'e' });
        if (type === 'wild') d.guard = { enemy: foeFor(pat) };
        keys.push(key);
      }
      for (let i = 0; i < keys.length - 1; i++) rooms[keys[i]].next = [keys[i + 1]];
      return keys;
    };
    const used = [p1pat];
    const A1 = branchRooms('a', bt1[0], used);
    const B1 = branchRooms('b', bt1[1], used);
    f1.next = [A1[0], B1[0]];
    f1.branches = [bt1[0], bt1[1]];
    // ---- layer 3: camp
    const camp = room('c', 'camp', 'camp', null, { obj: null });
    rooms[A1[A1.length - 1]].next = ['c'];
    rooms[B1[B1.length - 1]].next = ['c'];
    const types2 = r.shuffle(['lantern', 'wild', 'names'].concat(mods.has('crowd') ? ['names'] : []));
    const bt2 = [types2[0], types2.find((x) => x !== types2[0])];
    const used2 = [];
    const D = branchRooms('d', bt2[0], used2);
    const E = branchRooms('e', bt2[1], used2);
    camp.next = [D[0], E[0]];
    camp.branches = [bt2[0], bt2[1]];
    if (mods.has('promises')) cache(camp, 'relic', 'promise');
    // ---- layer 4: guardian, layer 5: road home
    const x = room('x', 'climax', 'climax', null, { obj: null });
    x.boss = C.atlas.climaxes[run.climax] ? run.climax : 'cartographer';
    rooms[D[D.length - 1]].next = ['x'];
    rooms[E[E.length - 1]].next = ['x'];
    if (mods.has('promises')) cache(x, 'relic', 'promise');
    const z = room('z', 'extract', 'extract', null, { obj: null });
    x.next = ['z'];

    // ---- contents: names, foes, caches
    for (const key in rooms) {
      const d = rooms[key];
      const pat = d.pattern;
      if (d.obj && d.obj.type === 'name') {
        d.names.push({ id: nextName(), required: true });
        const extra = mods.has('crowd') ? 2 : d.branch === 'names' ? 1 : r() < 0.4 ? 1 : 0;
        for (let i = 0; i < extra; i++) d.names.push({ id: nextName(), required: false });
      } else if (mods.has('crowd') && ['grove', 'pool'].indexOf(pat) >= 0) {
        d.names.push({ id: nextName(), required: false });
      }
      const foeSpots = countAnchors(pat, d.variant, '&');
      if (foeSpots && ['path', 'branch', 'wild'].indexOf(d.kind) >= 0) {
        let nFoes = d.kind === 'wild' ? 1 : r() < (mods.has('crowd') ? 0.2 : 0.55) ? 1 : 0;
        if (mods.has('crowd') && d.kind === 'wild') nFoes = 0;
        for (let i = 0; i < Math.min(nFoes, foeSpots); i++) d.foes.push({ enemy: foeFor(pat) });
      }
      if (d.kind === 'branch' || d.kind === 'wild') {
        const spots = countAnchors(pat, d.variant, '$');
        if (spots) {
          if (d.kind === 'wild' && r() < 0.5) cache(d, 'keepsake');
          else if (d.branch !== 'names') cache(d, 'relic');
        }
      }
      if (mods.has('lowtide') && countAnchors(pat, d.variant, '[')) cache(d, 'relic', 'lowtide');
    }
    // ---- groups: more creatures to a placement on Standard and Demanding (RB.combatLogic.groupFor;
    // Relaxed always meets one). Chosen from the room's own creatures with a stream of their
    // own per room, so the rest of a run's plan (and runs already under way) stay as they were.
    // A guardian brings one more on Standard and two on Demanding; a roaming creature
    // sometimes one more on Standard and one or two on Demanding. The expedition's guardian
    // brings attendants of its own (one, or two on Demanding).
    const regular = C.atlas.regular;
    for (const key in rooms) {
      const d = rooms[key];
      const gr = U.rng((run.seed ^ U.hashStr('group:' + key)) >>> 0);
      const from = (FOES_BY[d.pattern] || regular).filter((id) => regular.indexOf(id) >= 0);
      const two = () => { const a = from[gr.int(from.length)], b = from[gr.int(from.length)]; return [a, b]; };
      if (d.guard) { const [a, b] = two(); d.guard.group = { normal: [a], hard: [a, b] }; }
      for (const f of d.foes) { const [a, b] = two(); f.group = { normal: gr() < 0.5 ? [a] : [], hard: gr() < 0.5 ? [a, b] : [a] }; }
    }
    {
      const ATT = { cartographer: ['atlas.stray', 'atlas.moth'], bell: ['atlas.echo', 'atlas.lamp'], gate: ['atlas.milestone', 'atlas.toll'] };
      const gr = U.rng((run.seed ^ U.hashStr('group:climax')) >>> 0);
      const pool = (ATT[x.boss] || ATT.cartographer).slice();
      const a = pool.splice(gr.int(pool.length), 1)[0], b = pool[0];
      x.attendants = { normal: [a], hard: [a, b] };
    }
    // The companion's own relic: somewhere on a branch (both sides of fork 1 when possible).
    if (compRelic) {
      const hosts = [A1[0], B1[0]].map((k) => rooms[k]).filter((d) => countAnchors(d.pattern, d.variant, '$'));
      const host = hosts.length ? pick(hosts) : null;
      if (host) {
        const c = host.caches.find((c) => c.kind === 'relic' && c.where === 'spot');
        if (c) c.relic = compRelic; else host.caches.unshift({ id: 'c' + (++cacheNo), kind: 'relic', relic: compRelic, where: 'spot' });
      }
    }
    return { run: run.id, rooms, start: 't', end: 'z' };
  }

  // ---- template helpers ---------------------------------------------------------------------------
  function rowsOf(pat, variant) {
    const p = A.patterns[pat];
    const v = p.variants[variant] || p.variants[0];
    return v.map((row) => (row.length < p.w ? row + 'X'.repeat(p.w - row.length) : row));
  }
  const anchorCache = new Map();
  function countAnchors(pat, variant, ch) {
    const k = pat + '/' + variant + '/' + ch;
    if (!anchorCache.has(k)) anchorCache.set(k, rowsOf(pat, variant).join('').split(ch).length - 1);
    return anchorCache.get(k);
  }
  const ANCHORS = '@123!?$%&GK<W([)]}-IUVNJHMZ';
  const DECO_W = { M: 2 };

  // ---- map building ---------------------------------------------------------------------------------
  function mapId(run, key) { return 'atlas.' + run.id + '.' + key; }

  function buildRoom(run, planR, d) {
    const mods = new Set(run.mods || []);
    const pat = A.patterns[d.pattern];
    const W = pat.w, H = pat.h;
    let rows = rowsOf(d.pattern, d.variant).map((row) => Array.from(row));
    if (d.mirror) rows = rows.map((row) => row.slice().reverse());
    const dress = A.dressings[d.dress] || {};
    const floor = pat.floor;
    const spots = {};
    const deco = [];
    const at = (ch, x, y) => (spots[ch] = spots[ch] || []).push([x, y]);
    const r = U.rng((run.seed ^ U.hashStr('room:' + d.key)) >>> 0);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const ch = rows[y][x];
        if (ANCHORS.indexOf(ch) < 0) { rows[y][x] = dress[ch] || ch; continue; }
        at(ch, x, y);
        switch (ch) {
          case 'W': rows[y][x] = 'B'; break;
          case '(': rows[y][x] = mods.has('lowtide') ? 'w' : '~'; break;
          case '[': rows[y][x] = mods.has('lowtide') ? 'w' : '~'; break;
          case ')': case ']': case '}': rows[y][x] = mods.has('promises') ? floor : 'X'; break;
          case 'Z': rows[y][x] = 'X'; deco.push({ p: 'atlas_fold', x, y, text: { jp: '{後|うし}ろ の {道|みち} は 、 {紙|かみ} の {端|はし} の よう に {折|お}り{畳|たた}まれて いる 。', en: 'The road behind you has folded itself shut, like the corner of a page.' } }); break;
          default:
            rows[y][x] = floor;
            if (A.decoProps[ch]) {
              const w = DECO_W[ch] || 1;
              deco.push({ p: A.decoProps[ch], x: d.mirror && w > 1 ? x - (w - 1) : x, y });
            }
        }
      }
    }
    // Decorative scatter (seeded) on plain ground, never on anchors or the main path.
    const scatter = { meadow: [',', ';'], shore: ['s', '.'], snow: ['*'], ash: ['a', '.'], paper: ['p', 'Y'], stone: ['+'] }[d.dress] || [','];
    for (let i = 0; i < 6; i++) {
      const x = 1 + r.int(W - 2), y = 3 + r.int(H - 6);
      const ch = rows[y][x];
      if (ch === '.' || ch === 'p' || ch === '*' || ch === 's' || ch === 'a') {
        if (!Object.values(spots).some((arr) => arr.some(([ax, ay]) => ax === x && ay === y))) rows[y][x] = scatter[r.int(scatter.length)];
      }
    }
    const terrain = rows.map((row) => row.join(''));
    const id = mapId(run, d.key);
    const sp = spawnOf(run, d);
    const def = {
      name: pat.name, region: 'atlas', music: pat.music || 'atlas', noTravel: true, noCheckpoint: true,
      ambient: ambientFor(run, d),
      legend: { X: { tile: 'atlas_blank' }, Y: { tile: 'atlas_sketch' } },
      terrain, props: deco.slice(), npcs: [], foes: [], exits: [], triggers: [],
      onEnter: [{ scene: 'atlas.room.' + d.pattern, once: true }],
      spawn: { default: [sp[0], sp[1], 'up'] },
      atlas: { run: run.id, room: d.key, pattern: d.pattern, kind: d.kind },
    };
    const gateFlag = d.kind === 'wild' ? 'foe:' + id + ':guard' : d.kind === 'climax' ? FLAG('climax') : d.obj ? FLAG(d.obj.id) : null;
    // gate veils
    for (const [x, y] of spots['!'] || []) def.props.push(gateFlag ? { p: 'atlas_veil', x, y, if: '!' + gateFlag } : { p: 'atlas_veil', x, y, if: 'false' });
    // bridge gaps (Unfinished Bridge): water over the planks until the sign is restored
    for (const [x, y] of spots.W || []) def.props.push({ p: 'water', x, y, if: '!' + (gateFlag || 'false') });
    // promise veils and caches
    for (const [x, y] of spots[')'] || []) if (mods.has('promises')) def.props.push({ p: 'atlas_veil', x, y, if: '!' + FLAG(d.kind === 'climax' ? 'pr2' : 'pr1') });
    // objective props
    const o = d.obj;
    const q = spots['?'] || [];
    if (o && (o.type === 'inscription' || o.type === 'promise')) {
      const [x, y] = q[0];
      def.props.push({ p: 'atlas_stone', x, y, scene: 'atlas.obj', obj: o.id, if: '!' + FLAG(o.id) });
      def.props.push({ p: 'atlas_stone', x, y, o: { done: true }, text: o.type === 'promise' ? { jp: '{約束|やくそく} が {読|よ}める よう に なった 。', en: 'The promise can be read again.' } : { jp: '{言葉|ことば} が {石|いし} に {戻|もど}って いる 。', en: 'The word is back on the stone.' }, if: FLAG(o.id) });
    } else if (o && o.type === 'sign') {
      const [x, y] = q[0];
      def.props.push({ p: 'signblank', x, y, scene: 'atlas.obj', obj: o.id, if: '!' + FLAG(o.id) });
      def.props.push({ p: 'sign', x, y, text: { jp: '{立|た}て{札|ふだ} は 、 もう {読|よ}める 。', en: 'The sign reads properly again.' }, if: FLAG(o.id) });
    } else if (o && o.type === 'lanterns') {
      q.slice(0, o.lamps).forEach(([x, y], i) => {
        def.props.push({ p: 'atlas_lamp', x, y, o: { lit: false }, scene: 'atlas.obj', obj: o.id, lamp: i, if: '!' + FLAG(o.id + '_' + i) });
        def.props.push({ p: 'atlas_lamp', x, y, if: FLAG(o.id + '_' + i) });
      });
    } else if (o && o.type === 'doors') {
      const [kx, ky] = (spots.K || q)[0];
      def.props.push({ p: 'atlas_stone', x: kx, y: ky, scene: 'atlas.doors.clue', obj: o.id });
    } else if (q.length && d.kind === 'fork') {
      def.props.push({ p: 'atlas_sign', x: q[0][0], y: q[0][1], scene: 'atlas.fork.sign' });
    } else if (q.length && d.kind === 'camp') {
      def.props.push({ p: 'stump', x: q[0][0], y: q[0][1], scene: 'atlas.camp' });
    } else if (q.length && d.kind === 'extract') {
      def.props.push({ p: 'atlas_waystone', x: q[0][0], y: q[0][1], scene: 'atlas.extract.room' });
    }
    // exits
    const exitSlots = ['1', '2', '3'].map((k) => (spots[k] || [])[0]).filter(Boolean);
    const target = (key) => { const nd = planR.rooms[key]; const tsp = spawnOf(run, nd); return { to: mapId(run, key), tx: tsp[0], ty: tsp[1] }; };
    if (d.kind === 'fork' || d.kind === 'camp') {
      exitSlots.slice(0, 2).forEach(([x, y], i) => {
        const key = d.next[i];
        def.exits.push(Object.assign({ x, y, w: 1, h: 1, dir: 'up', locked: 'atlas.fork.ask', unlock: FLAG('took_' + d.key + '_' + i), branch: d.branches[i], slot: i }, target(key)));
      });
    } else if (o && o.type === 'doors') {
      const bySide = exitSlots.slice().sort((a, b) => a[0] - b[0]);
      const sides = ['L', 'M', 'R'];
      bySide.forEach(([x, y], i) => {
        def.exits.push(Object.assign({ x, y, w: 1, h: 1, dir: 'up', locked: 'atlas.doors.step', door: sides[i], correct: sides[i] === o.correct, unlock: sides[i] === o.correct ? FLAG(o.id) : undefined }, target(d.next[0])));
      });
      // door lamps (by screen position): the correct door's lamp is unlit for Intermediate/Advanced clues
      const lamps = (spots['<'] || []).slice().sort((a, b) => a[0] - b[0]);
      lamps.forEach(([x, y], i) => {
        if (sides[i] === o.correct) {
          def.props.push({ p: 'atlas_lamp', x, y, if: 'prof<=E' });
          def.props.push({ p: 'atlas_lamp', x, y, o: { lit: false }, if: 'prof>=I' });
        } else def.props.push({ p: 'atlas_lamp', x, y });
      });
    } else if (d.next.length) {
      for (const [x, y] of exitSlots.slice(0, 1)) def.exits.push(Object.assign({ x, y, w: 1, h: 1, dir: 'up' }, target(d.next[0])));
    }
    // unmoored names
    const nspots = spots['%'] || [];
    d.names.forEach((n, i) => {
      if (!nspots[i]) return;
      const nd = A.names[n.id];
      def.npcs.push({ id: 'atlas_n' + i, x: nspots[i][0], y: nspots[i][1], dir: 'down', look: { custom: 'atlas_name', col: nd.col }, talk: 'atlas.name.talk', name: n.id, required: n.required, if: '!' + FLAG('name_' + d.key + '_' + i) });
    });
    // guardian of a wild room
    if (d.guard) {
      const g = (spots.G || [])[0];
      def.foes.push({ id: 'guard', enemy: d.guard.enemy, x: g[0], y: g[1], patrol: 0, aggro: false, scene: 'atlas.foe.won', group: d.guard.group });
    }
    // optional foes
    const fspots = spots['&'] || [];
    d.foes.forEach((f, i) => { if (fspots[i]) def.foes.push({ id: 'f' + i, enemy: f.enemy, x: fspots[i][0], y: fspots[i][1], patrol: 1, aggro: true, scene: 'atlas.foe.won', group: f.group }); });
    // caches
    const cspots = { spot: (spots.$ || []).slice(), lowtide: (spots['['] || []).slice(), promise: (spots[']'] || []).slice() };
    for (const c of d.caches) {
      const s = cspots[c.where].shift();
      if (!s) continue;
      def.props.push({ p: 'atlas_cache', x: s[0], y: s[1], scene: 'atlas.relic.find', cache: c.id, if: '!' + FLAG(d.key + '_' + c.id) });
    }
    // climax: guardian presence + trigger line
    if (d.kind === 'climax') {
      const g = (spots.G || [])[0];
      const en = C.enemies[C.atlas.climaxes[d.boss].enemy];
      def.npcs.push({ id: 'atlas_guardian', x: g[0], y: g[1], dir: 'down', look: en.look, talk: 'atlas.climax', if: '!' + FLAG('climax') });
      const tl = spots['-'] || [];
      if (tl.length) {
        const xs = tl.map((p) => p[0]);
        def.triggers.push({ x: Math.min.apply(null, xs), y: tl[0][1], w: Math.max.apply(null, xs) - Math.min.apply(null, xs) + 1, h: 1, scene: 'atlas.climax', if: '!' + FLAG('climax'), id: 'climax' });
      }
      def.ambient = Object.assign({}, def.ambient, { dark: 0.25, playerLight: 60 });
    }
    return { id, def };
  }
  // Entry point. If the tile behind the entry is blank page, the player stands
  // one step further in so the companion has room to follow in behind.
  function spawnOf(run, d) {
    const pat = A.patterns[d.pattern];
    const rows = rowsOf(d.pattern, d.variant);
    for (let y = 0; y < rows.length; y++) {
      const x = rows[y].indexOf('@');
      if (x < 0) continue;
      const below = rows[y + 1] ? rows[y + 1][x] : 'X';
      const above = y > 0 ? rows[y - 1][x] : 'X';
      const yy = (below === 'X' || below === 'Z') && ':.+ps,'.indexOf(above) >= 0 ? y - 1 : y;
      return [d.mirror ? pat.w - 1 - x : x, yy];
    }
    return [Math.floor(pat.w / 2), pat.h - 2];
  }
  function ambientFor(run, d) {
    const mods = new Set(run.mods || []);
    const amb = { weather: d.kind === 'extract' ? 'motes' : 'pages' };
    if (mods.has('fog')) Object.assign(amb, { tint: 'rgba(226,228,232,0.28)', dark: 0.12, playerLight: 70, weather: 'motes' });
    if (mods.has('lowtide') && (d.pattern === 'tide' || d.pattern === 'crossing')) amb.tint = 'rgba(180,210,220,0.10)';
    return amb;
  }

  function buildMaps(run, planR) {
    planR = planR || plan(run);
    const out = {};
    for (const key in planR.rooms) {
      const { id, def } = buildRoom(run, planR, planR.rooms[key]);
      out[id] = def;
    }
    return { plan: planR, maps: out };
  }
  const registered = new Map(); // runId -> {plan, ids}
  function register(run) {
    const hit = registered.get(run.id);
    if (hit && hit.seed === run.seed) {
      for (const id in hit.maps) C.maps[id] = hit.maps[id];
      return hit.plan;
    }
    const b = buildMaps(run);
    for (const id in b.maps) C.maps[id] = b.maps[id];
    registered.set(run.id, { seed: run.seed, plan: b.plan, maps: b.maps });
    return b.plan;
  }
  function unregister(runId) {
    const hit = registered.get(runId);
    for (const id in C.maps) if (id.startsWith('atlas.' + runId + '.')) delete C.maps[id];
    registered.delete(runId);
    if (hit && RB.maps && RB.maps.invalidate) RB.maps.invalidate();
  }
  function planOf(run) {
    const hit = registered.get(run.id);
    return hit ? hit.plan : register(run);
  }

  // ---- restoring a saved run --------------------------------------------------------------------------
  function toHall(state) {
    const h = hallSpot();
    state.map = h.map; state.x = h.x; state.y = h.y; state.dir = h.dir;
    state.flags = state.flags || {};
    state.flags.atlas_restored_to_hall = true;
  }
  function cleanFlags(state, runId) {
    if (!state || !state.flags) return;
    for (const k of Object.keys(state.flags)) {
      if (k.startsWith('atlas_r_') || (runId && k.indexOf('atlas.' + runId + '.') >= 0) || /^(foe|enter|trig|named):atlas\./.test(k)) delete state.flags[k];
    }
    if (state.visited) for (const k of Object.keys(state.visited)) if (k.startsWith('atlas.')) delete state.visited[k];
  }
  function prepare(state) {
    if (!state || typeof state !== 'object') return;
    const onAtlas = typeof state.map === 'string' && state.map.startsWith('atlas.');
    const run = state.atlas && state.atlas.run;
    if (!run) {
      if (onAtlas) { toHall(state); cleanFlags(state); }
      return;
    }
    try {
      if (run.v !== GEN_V || typeof run.seed !== 'number' || !run.id) throw new Error('incompatible run');
      const p = register(run);
      if (!onAtlas) {
        // A run without a room to stand in: end it quietly (notes already written stay).
        state.atlas.run = null;
        cleanFlags(state, run.id);
        return;
      }
      const parts = state.map.split('.');
      if (parts[1] !== run.id || !p.rooms[parts[2]]) throw new Error('room not in run');
      // stand somewhere valid
      const m = RB.maps.compile(state.map);
      if (typeof state.x !== 'number' || typeof state.y !== 'number' || m.block[state.y * m.w + state.x] || RB.maps.exitAt(m, state.x, state.y)) {
        const sp = m.def.spawn.default;
        state.x = sp[0]; state.y = sp[1]; state.dir = 'up';
      }
      run.room = parts[2];
      state.checkpoint = hallSpot();
    } catch (e) {
      if (typeof console !== 'undefined' && !globalThis.__RB_TEST__) console.warn('atlas: run could not be restored —', e.message);
      try { unregister(run.id); } catch (e2) { /* ignore */ }
      state.atlas.run = null;
      cleanFlags(state, run.id);
      toHall(state);
    }
  }

  // ---- objective language steps --------------------------------------------------------------------------
  function itemKey(d) { return (Array.isArray(d.item) ? d.item[0] : d.item) || 'd:' + d.id; }
  function drillsAt(pred, P) {
    const i = LV.indexOf(P);
    for (let l = i; l >= 0; l--) { const ds = C.drills.filter((d) => d.lv === LV[l] && pred(d)); if (ds.length) return ds; }
    for (let l = i + 1; l < 4; l++) { const ds = C.drills.filter((d) => d.lv === LV[l] && pred(d)); if (ds.length) return ds; }
    return [];
  }
  const byTag = (tag) => (d) => (d.tags || []).indexOf(tag) >= 0;
  // Mastery-aware choice among drills: due/weak/new first (RB.learn.pick keeps
  // cooldowns so a just-missed item never comes straight back), never the item
  // missed in the previous objective, ties broken by the objective's seed.
  function chooseDrill(ds, seed, run) {
    if (!ds.length) return null;
    const items = Array.from(new Set(ds.map(itemKey)));
    let ranked = [];
    try { ranked = RB.learn.pick(items, items.length); } catch (e) { ranked = items.slice(); }
    const last = run && run.lastWrong;
    ranked = ranked.filter((id) => id !== last);
    if (!ranked.length) ranked = items.filter((id) => id !== last);
    if (!ranked.length) ranked = items;
    const r = U.rng(seed >>> 0);
    const top = ranked.slice(0, Math.min(3, ranked.length));
    const id = top[r.int(top.length)];
    const cands = ds.filter((d) => itemKey(d) === id);
    return U.deepClone(cands[r.int(cands.length)]);
  }
  function profileOf() { return RB.game && RB.game.s ? RB.game.s.learn.profile : 'E'; }
  // Returns the list of steps for an objective at profile P (lanterns: one per lamp).
  function objectiveSteps(o, run, P, extra) {
    P = P || profileOf();
    extra = extra || {};
    const seed = (o.seed ^ U.hashStr(P)) >>> 0;
    switch (o.type) {
      case 'inscription': return [chooseDrill(drillsAt(byTag('atlas_ins'), P), seed, run)];
      case 'sign': return [chooseDrill(drillsAt(byTag('atlas_sign'), P), seed, run)];
      case 'promise': return [chooseDrill(drillsAt(byTag('atlas_promise'), P), seed, run)];
      case 'legend': return [chooseDrill(drillsAt(byTag('atlas_legend_' + extra.boss), P), seed, run)];
      case 'name': return [chooseDrill(drillsAt(byTag('atlas_name_' + extra.name), P), seed, run)];
      case 'lanterns': {
        const out = [];
        for (let i = 0; i < (o.lamps || 2); i++) out.push(lampStep(o, run, P, i, seed));
        return out;
      }
      case 'doors': return [];
    }
    return [];
  }
  // Lamp 0 revisits something weak (if anything is due and off cooldown);
  // the others use familiar atlas material at the player's level.
  function lampStep(o, run, P, i, seed) {
    if (i === 0 && RB.game && RB.game.s) {
      try {
        const weak = RB.learn.weakest(10).filter((id) => id !== (run && run.lastWrong));
        const ids = RB.learn.pick(weak, 3, { allowNew: false });
        for (const id of ids) {
          if (!weak.length || weak.indexOf(id) < 0) continue;
          const st = RB.tasks.stepFor(id);
          if (st && validStep(st).length === 0) { st.title = st.title || 'A lantern that remembers something you found hard'; return st; }
        }
      } catch (e) { /* fall through to atlas material */ }
    }
    const ds = drillsAt(byTag('atlas_knot'), P);
    const pickSeed = (seed ^ (i * 2654435761)) >>> 0;
    const st = chooseDrill(ds.filter((d) => !(run && run._lampUsed && run._lampUsed.indexOf(itemKey(d)) >= 0)), pickSeed, run) || chooseDrill(ds, pickSeed, run);
    if (run) { run._lampUsed = (run._lampUsed || []).concat([itemKey(st)]); if (run._lampUsed.length > 6) run._lampUsed.shift(); }
    return st;
  }
  function doorClue(o, P) {
    const T = A.doorClues[P] || A.doorClues.E;
    const list = T[o.correct] || T['*'];
    return list[(o.clue || 0) % list.length];
  }

  // ---- step validation (mirrors tools/validate.mjs) ---------------------------------------------------------
  function jErrs(line) {
    if (line == null || line === '') return [];
    if (typeof line !== 'string') return ['not a string'];
    return RB.jp.validate(line).map((p) => (p.msg || p.code) + ' in “' + line.slice(0, 40) + '”');
  }
  function validStep(s) {
    const e = [];
    if (!s || typeof s !== 'object') return ['step missing'];
    if (s.ctx) e.push(...jErrs(s.ctx.jp));
    if (s.prompt) e.push(...jErrs(s.prompt.jp));
    if (s.explain) e.push(...jErrs(s.explain.jp));
    if (s.kind === 'write') {
      if (!s.answer) e.push('write step without answer');
      const acc = (s.accept || [s.answer]).map((a) => RB.jp.plain(a));
      if (s.answer && acc.indexOf(RB.jp.plain(s.answer)) < 0) e.push('answer not in accept list');
      if (s.template) { e.push(...jErrs(s.template.before)); e.push(...jErrs(s.template.after)); }
      if (['kana', 'reading', 'exact', 'meaning'].indexOf(s.mode || 'kana') < 0) e.push('bad mode');
    } else if (s.kind === 'choose') {
      if (!s.options || !s.options.some((o) => o.ok)) e.push('choose step has no correct option');
      for (const o of s.options || []) e.push(...jErrs(o.jp));
    } else if (s.kind === 'order') {
      if (!s.tiles || !s.answer) e.push('order step needs tiles and answer');
      else if (s.tiles.slice().sort().join('|') !== s.answer.slice().sort().join('|')) e.push('order tiles and answer differ');
      for (const a of s.alts || []) if (a.slice().sort().join('|') !== s.tiles.slice().sort().join('|')) e.push('order alt uses other tiles');
      for (const t of s.tiles || []) e.push(...jErrs(t));
    } else e.push('unknown step kind ' + s.kind);
    return e;
  }
  function itemExists(id) {
    if (!id) return false;
    if (Array.isArray(id)) return id.every(itemExists);
    const k = id.slice(0, 2), v = id.slice(2);
    if (k === 'k:') return !!(RB.kana && RB.kana.isKana(v));
    if (k === 'v:') return !!((RB.lex.bySurface(v) || []).length || (RB.lex.byReading(v) || []).length);
    if (k === 'g:') return !!(RB.grammar && RB.grammar.get(v));
    if (k === 'c:' || k === 'd:') {
      if (C.drills.some((d) => d.item === id || d.id === v)) return true;
      if (/^c:atlas_doors_[FEIA]$/.test(id)) return true;
      for (const n in A.intents) for (const part of ['answer', 'truth']) { const t = A.intents[n][part]; if (t) for (const lv in t) if (t[lv].item === id) return true; }
      return false;
    }
    return false;
  }

  return {
    GEN_V, newRun, plan, buildMaps, register, unregister, planOf, prepare, cleanFlags, toHall, hallSpot, mapId, spawnOf,
    objectiveSteps, lampStep, chooseDrill, drillsAt, doorClue, validStep, itemExists, rowsOf, countAnchors, climaxPool, FLAG,
    _registered: registered,
  };
})();
