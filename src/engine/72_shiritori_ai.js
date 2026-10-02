/* Companion shiritori: the computer opponents (Practice addendum §12).
 *
 *   RB.shiritori.chooseMove(state, bank, level, rng, o) -> Promise<{
 *       edge|null (null = concede: only ん words or nothing left), level, depth, exact,
 *       nodes, fallback, provisional:false, value, proof, label, mode, iterations, … }>
 *     level: 'partner' | 'casual' | 'thoughtful' | 'sharp'. The choice depends only on
 *     the public state, the bank, the level, o.companion (thematic tie-breaks among
 *     equal evaluations) and the seeded rng — never on the player's draft, learning
 *     record, pets, sound or animation settings (the API does not take them).
 *     o: { companion, sync (no yielding; tests/benchmark), safeguard (false = node
 *     budgets only), clock, yield, yieldMs (8) }.
 *   RB.shiritori.decide(state, bank, level, rng, o)   chooseMove, stored in
 *     state.cpuChoice before it is shown, and returned again (no reroll) until played.
 *   RB.shiritori.strategyRng(seed, state, bank, level) a per-turn strategy stream.
 *   RB.shiritori.analyse(state, bank, o) -> Promise<{ notes, one }>   post-match review:
 *     overlooked replies, missed immediate wins, restricting moves, a forced finish only
 *     when the exact solver exhausted the position, and (o.deep) bounded-search
 *     preferences labelled "looked stronger within the checked moves".
 *   RB.shiritori.ai   { POLICY, EXACT, THEMES, compile, liveGroups, solve, heuristic }
 *
 * Search (§12.1–§12.3): a compiled public-state graph (repeat-groups × boundary kana,
 * one move per distinct group/head/tail), an explicit-stack alpha–beta negamax that
 * can pause at any node — so it yields at least every 8 ms on the page's thread,
 * which needs no Worker (the page CSP allows none) — iterative deepening under
 * deterministic node budgets, and a memoized exact solver W(S,h) over the groups
 * still reachable from the required kana when there are 12 or fewer. Terminal
 * results dominate the mobility heuristic H; elapsed safeguards fall back to the
 * last completed depth and say so. ん-ending words are never searched or played. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (SH) {
  'use strict';
  const STRATEGY = 'roadside-ai-1';
  const POLICY = {
    partner: { kind: 'partner' },
    casual: { kind: 'casual' },
    thoughtful: { kind: 'search', nodes: 4000, target: 2, maxDepth: 2, safeguardMs: 100 },
    sharp: { kind: 'search', nodes: 30000, target: 4, maxDepth: 64, safeguardMs: 250 },
  };
  const EXACT = { groups: 12, nodes: 100000, safeguardMs: 500 };
  const THEMES = { nao: ['practical'], mio: ['household', 'care'], ren: ['writing', 'light'], suzu: ['performing', 'art'] };
  const YIELD_MS = 8;
  const WIN = 100000;          // terminal values: ±(WIN − ply); heuristic values stay far below
  const PROVEN = WIN - 10000;
  const EPS = 1e-9;
  const LOG2P1 = new Float64Array(512);
  for (let i = 0; i < LOG2P1.length; i++) LOG2P1[i] = Math.log2(1 + i);
  const l2 = (n) => (n < 512 ? LOG2P1[n] : Math.log2(1 + n));
  const defaultClock = () => (globalThis.performance && performance.now ? performance.now() : Date.now());

  // ---- the compiled graph ------------------------------------------------------------------------
  const CACHE = new WeakMap();
  function compile(b) {
    let c = CACHE.get(b);
    if (c) return c;
    const gids = Object.keys(b.groups).sort();
    const gi = {};
    gids.forEach((g, i) => (gi[g] = i));
    const kana = [], ki = {};
    const K = (ch) => (ki[ch] !== undefined ? ki[ch] : (ki[ch] = kana.push(ch) - 1));
    const byKey = new Map(), moves = [];
    for (const e of b.edges) {
      K(e.head); K(e.tail);
      if (e.terminal) continue;
      const key = gi[e.group] + '|' + e.head + '|' + e.tail;
      let m = byKey.get(key);
      if (!m) { m = { i: moves.length, g: gi[e.group], h: ki[e.head], t: ki[e.tail], edges: [] }; byKey.set(key, m); moves.push(m); }
      m.edges.push(e);
    }
    const headMoves = kana.map(() => []);
    for (const m of moves) headMoves[m.h].push(m.i);
    c = {
      bank: b, gids, gi, kana, ki, moves, G: gids.length, K: kana.length,
      MG: Int32Array.from(moves.map((m) => m.g)), MT: Int32Array.from(moves.map((m) => m.t)),
      headMoves: headMoves.map((l) => Int32Array.from(l)),
      // scratch stamps for distinct counting (outer and inner loops)
      gS1: new Int32Array(gids.length), gS2: new Int32Array(gids.length), tS: new Int32Array(kana.length), st1: 0, st2: 0,
    };
    CACHE.set(b, c);
    return c;
  }
  function usedArray(c, state) {
    const u = new Uint8Array(c.G);
    for (const g in state.used) if (state.used[g] && c.gi[g] !== undefined) u[c.gi[g]] = 1;
    return u;
  }
  // distinct unused groups with a safe move from kana k
  function replyGroups(c, used, k) {
    const list = c.headMoves[k];
    if (!list) return 0;
    const s = ++c.st2;
    let n = 0;
    for (let j = 0; j < list.length; j++) { const g = c.MG[list[j]]; if (!used[g] && c.gS2[g] !== s) { c.gS2[g] = s; n++; } }
    return n;
  }
  function safeMoveList(c, used, k) {
    const list = c.headMoves[k], out = [];
    if (list) for (let j = 0; j < list.length; j++) if (!used[c.MG[list[j]]]) out.push(list[j]);
    return out;
  }
  // The leaf (§12.2): terminal check first — no safe move is a loss now, a move that
  // leaves no safe reply is a win next ply — then the mobility heuristic
  //   H = log2(1+safeMoveGroups) + 0.25·log2(1+distinctSafeTails) − 0.20·mean(log2(1+opponentReplyGroups))
  // from the side to move. Returns { v, heuristic }.
  const LEAF = { v: 0, heuristic: false };
  function leaf(c, used, k, ply) {
    const list = c.headMoves[k];
    const s = ++c.st1;
    let groups = 0, tails = 0, n = 0, sum = 0;
    if (list) for (let j = 0; j < list.length; j++) {
      const mi = list[j], g = c.MG[mi];
      if (used[g]) continue;
      n++;
      if (c.gS1[g] !== s) { c.gS1[g] = s; groups++; }
      const t = c.MT[mi];
      if (c.tS[t] !== s) { c.tS[t] = s; tails++; }
      used[g] = 1;
      const r = replyGroups(c, used, t);
      used[g] = 0;
      if (r === 0) { LEAF.v = WIN - (ply + 1); LEAF.heuristic = false; return LEAF; }
      sum += l2(r);
    }
    if (!n) { LEAF.v = -(WIN - ply); LEAF.heuristic = false; return LEAF; }
    LEAF.v = l2(groups) + 0.25 * l2(tails) - 0.2 * (sum / n);
    LEAF.heuristic = true;
    return LEAF;
  }
  function heuristic(state, b) {
    const c = compile(b), k = c.ki[state.required];
    if (k === undefined) return { v: -(WIN), terminal: true };
    const r = leaf(c, usedArray(c, state), k, 0);
    return { v: r.v, terminal: !r.heuristic };
  }

  // ---- alpha–beta negamax as a resumable task ------------------------------------------------------
  // One node = one position whose moves were generated (interior or leaf).
  function Search(c, used, budget) {
    this.c = c; this.used = used; this.budget = budget; this.nodes = 0; this.heur = 0;
    this.stack = []; this.result = undefined; this.aborted = null; this.tick = 0;
  }
  // a node: either a value (leaf/terminal) or a frame to expand
  Search.prototype.open = function (k, depth, alpha, beta, ply) {
    const c = this.c, used = this.used;
    if (this.nodes >= this.budget) { this.aborted = 'nodes'; return null; }
    this.nodes++;
    if (depth <= 0) { const r = leaf(c, used, k, ply); if (r.heuristic) this.heur++; return { v: r.v }; }
    const list = c.headMoves[k];
    const ms = [], rs = [];
    if (list) for (let j = 0; j < list.length; j++) {
      const mi = list[j], g = c.MG[mi];
      if (used[g]) continue;
      used[g] = 1;
      const r = replyGroups(c, used, c.MT[mi]);
      used[g] = 0;
      if (r === 0) return { v: WIN - (ply + 1) }; // a move that leaves no safe reply: proven win
      ms.push(mi); rs.push(r);
    }
    if (!ms.length) return { v: -(WIN - ply) };
    // restrictive replies first (better pruning), stable for determinism
    const order = ms.map((m, i) => i).sort((a, b) => rs[a] - rs[b] || ms[a] - ms[b]).map((i) => ms[i]);
    return { f: { k, depth, alpha, beta, ply, list: order, i: 0, best: -Infinity, g: -1, cv: undefined } };
  };
  // run until done (true) or the clock passes the deadline (false); aborted on the node budget
  Search.prototype.step = function (clock, deadline) {
    const st = this.stack, c = this.c, used = this.used;
    while (st.length) {
      if ((++this.tick & 31) === 0 && deadline !== Infinity && clock() >= deadline) return false;
      const f = st[st.length - 1];
      if (f.cv !== undefined) {
        const v = -f.cv;
        f.cv = undefined;
        used[f.g] = 0;
        if (v > f.best) f.best = v;
        if (v > f.alpha) f.alpha = v;
        if (f.alpha >= f.beta) f.i = f.list.length;
        continue;
      }
      if (f.i >= f.list.length) {
        st.pop();
        if (st.length) st[st.length - 1].cv = f.best; else this.result = f.best;
        continue;
      }
      const mi = f.list[f.i++];
      f.g = c.MG[mi];
      used[f.g] = 1;
      const n = this.open(c.MT[mi], f.depth - 1, -f.beta, -f.alpha, f.ply + 1);
      if (!n) { unwindStack(st, used); return true; }
      if (n.f) st.push(n.f); else f.cv = n.v;
    }
    return true;
  };
  // Restore `used` after an abort. Every frame below the top has its current move
  // applied; the top frame's last group is either applied or already released, and
  // never one an ancestor holds, so releasing each frame's last group is exact.
  function unwindStack(st, used) {
    for (const f of st) if (f.g >= 0) used[f.g] = 0;
    st.length = 0;
  }
  Search.prototype.unwind = function () { unwindStack(this.stack, this.used); };
  Search.prototype.start = function (k, depth, alpha, beta, ply) {
    this.result = undefined;
    const n = this.open(k, depth, alpha, beta, ply);
    if (!n) return false;
    if (n.f) this.stack.push(n.f); else this.result = n.v;
    return true;
  };

  // ---- exact endgame: memoized W(S,h) over the reachable groups ----------------------------------
  // Groups that cannot be reached from the required kana through unused safe
  // moves can never be played, so they do not change the result.
  function reachable(c, used, k0) {
    const seenK = new Uint8Array(c.K), seenG = new Uint8Array(c.G), live = [];
    const q = [k0];
    seenK[k0] = 1;
    while (q.length) {
      const k = q.pop(), list = c.headMoves[k];
      for (let j = 0; j < list.length; j++) {
        const mi = list[j], g = c.MG[mi];
        if (used[g]) continue;
        if (!seenG[g]) { seenG[g] = 1; live.push(g); }
        const t = c.MT[mi];
        if (!seenK[t]) { seenK[t] = 1; q.push(t); }
      }
    }
    return live;
  }
  function liveGroups(state, b) {
    const c = compile(b), k = c.ki[state.required];
    return k === undefined ? 0 : reachable(c, usedArray(c, state), k).length;
  }
  // Values for the side to move: a win in d plies is EXV − d, a loss in d plies −(EXV − d).
  const EXV = 1000;
  function Exact(c, used, k0, budget, maxLive) {
    this.c = c; this.used = used; this.budget = budget; this.nodes = 0; this.aborted = null;
    const live = reachable(c, used, k0);
    this.live = live; this.ok = live.length <= maxLive;
    this.bit = new Int32Array(c.G).fill(-1);
    live.forEach((g, i) => (this.bit[g] = i));
    this.memo = new Map();
    this.stack = []; this.result = undefined; this.tick = 0;
  }
  Exact.prototype.mask = function () { let m = 0; for (let i = 0; i < this.live.length; i++) if (this.used[this.live[i]]) m |= 1 << i; return m; };
  Exact.prototype.open = function (k, mask) {
    const key = mask * this.c.K + k;
    const hit = this.memo.get(key);
    if (hit !== undefined) return { v: hit };
    if (this.nodes >= this.budget) { this.aborted = 'nodes'; return null; }
    this.nodes++;
    const c = this.c, used = this.used, list = c.headMoves[k], ms = [], rs = [];
    for (let j = 0; j < list.length; j++) {
      const mi = list[j], g = c.MG[mi];
      if (used[g]) continue;
      used[g] = 1;
      const r = replyGroups(c, used, c.MT[mi]);
      used[g] = 0;
      if (r === 0) { this.memo.set(key, EXV - 1); return { v: EXV - 1 }; }
      ms.push(mi); rs.push(r);
    }
    if (!ms.length) { this.memo.set(key, -EXV); return { v: -EXV }; }
    const order = ms.map((m, i) => i).sort((a, b) => rs[a] - rs[b] || ms[a] - ms[b]).map((i) => ms[i]);
    return { f: { k, mask, key, list: order, i: 0, best: -Infinity, g: -1, cv: undefined } };
  };
  Exact.prototype.step = function (clock, deadline) {
    const st = this.stack, c = this.c, used = this.used;
    while (st.length) {
      if ((++this.tick & 31) === 0 && deadline !== Infinity && clock() >= deadline) return false;
      const f = st[st.length - 1];
      if (f.cv !== undefined) {
        const vc = f.cv;
        f.cv = undefined;
        used[f.g] = 0;
        const v = vc < 0 ? -vc - 1 : -vc + 1;
        if (v > f.best) f.best = v;
        if (v > 0) f.i = f.list.length; // a proven win: the result of this position is settled
        continue;
      }
      if (f.i >= f.list.length) {
        st.pop();
        this.memo.set(f.key, f.best);
        if (st.length) st[st.length - 1].cv = f.best; else this.result = f.best;
        continue;
      }
      const mi = f.list[f.i++];
      f.g = c.MG[mi];
      used[f.g] = 1;
      const n = this.open(c.MT[mi], f.mask | (1 << this.bit[f.g]));
      if (!n) { unwindStack(st, used); return true; }
      if (n.f) st.push(n.f); else f.cv = n.v;
    }
    return true;
  };
  Exact.prototype.unwind = function () { unwindStack(this.stack, this.used); };
  Exact.prototype.start = function (k) {
    this.result = undefined;
    const n = this.open(k, this.mask());
    if (!n) return false;
    if (n.f) this.stack.push(n.f); else this.result = n.v;
    return true;
  };

  // ---- the cooperative driver -------------------------------------------------------------------
  function yielder(o) {
    if (o.yield) return o.yield;
    if (typeof MessageChannel === 'function') {
      const ch = new MessageChannel(), q = [];
      ch.port1.onmessage = () => { const r = q.shift(); if (r) r(); };
      if (ch.port1.unref) ch.port1.unref();
      return () => new Promise((r) => { q.push(r); ch.port2.postMessage(0); });
    }
    return () => new Promise((r) => setTimeout(r, 0));
  }
  // Runs task.step until it finishes, yielding whenever the current slice has used
  // yieldMs (8 ms). The slice deadline belongs to the whole decision, not to one task,
  // so consecutive root moves cannot add up to a longer stretch. After each yield the
  // task stops (false) once the clock has passed `until`, its elapsed safeguard.
  async function drive(task, run, until) {
    if (run.sync) { task.step(run.clock, Infinity); return true; }
    for (;;) {
      const done = task.step(run.clock, run.sliceStart + run.yieldMs);
      if (done) return true;
      endSlice(run, run.clock());
      await run.yieldFn();
      run.sliceStart = run.clock();
      if (run.sliceStart >= until) return false;
    }
  }
  function endSlice(run, now) {
    const d = now - run.sliceStart;
    run.slices++; run.computeMs += d; if (d > run.maxSliceMs) run.maxSliceMs = d;
  }

  // ---- tie-breaks: equal evaluations only ----------------------------------------------------------
  function themedEdges(edges, companion, bank) {
    const want = THEMES[companion];
    if (!want) return [];
    return edges.filter((e) => { const en = bank.entryById[e.entry]; return en && (en.themes || []).some((t) => want.indexOf(t) >= 0); });
  }
  function pickEdge(edges, companion, bank, rng) {
    if (edges.length === 1) return edges[0];
    const th = themedEdges(edges, companion, bank);
    const pool = th.length ? th : edges;
    return pool[Math.floor(rng() * pool.length)];
  }
  function pickAmong(c, moveIdx, companion, rng) {
    let pool = moveIdx;
    if (THEMES[companion] && moveIdx.length > 1) {
      const th = moveIdx.filter((mi) => themedEdges(c.moves[mi].edges, companion, c.bank).length);
      if (th.length) pool = th;
    }
    const mi = pool.length === 1 ? pool[0] : pool[Math.floor(rng() * pool.length)];
    return { mi, edge: pickEdge(c.moves[mi].edges, companion, c.bank, rng), tied: moveIdx.length, themed: pool !== moveIdx };
  }

  // ---- policies ------------------------------------------------------------------------------------
  function partnerMove(state, b, rng, companion) {
    // the learning partner keeps the chain going: prefer words that leave you a
    // reply, and more than one where possible (a small local degree check)
    const safe = SH.safeReplies(state, b);
    if (!safe.length) return null;
    const scored = safe.map((e) => {
      const used = Object.assign({}, state.used); used[e.group] = true;
      const n = new Set((b.byHead[e.tail] || []).filter((x) => !used[x.group] && !x.terminal).map((x) => x.group)).size;
      return { e, s: Math.min(n, 3) };
    });
    const best = Math.max(...scored.map((x) => x.s));
    const pool = scored.filter((x) => x.s === best).map((x) => x.e);
    return pool[Math.floor(rng() * pool.length)];
  }

  async function searchMove(state, b, pol, rng, o, run) {
    const c = compile(b);
    const k = c.ki[state.required];
    const used = usedArray(c, state);
    const root = k === undefined ? [] : safeMoveList(c, used, k);
    const out = { depth: 0, exact: false, nodes: 0, fallback: false, reason: null, value: null, proof: null, mode: 'search', iterations: [], live: null, tied: 0, themed: false };
    if (!root.length) return Object.assign(out, { edge: null, mode: 'concede', exact: true, proof: 'loss' });
    // terminal check first: a word that leaves no safe reply wins at once
    const wins = root.filter((mi) => { used[c.MG[mi]] = 1; const r = replyGroups(c, used, c.MT[mi]); used[c.MG[mi]] = 0; return r === 0; });
    out.nodes = 1;
    if (wins.length) {
      const p = pickAmong(c, wins, o.companion, rng);
      return Object.assign(out, { edge: p.edge, depth: 1, exact: true, proof: 'win', value: WIN - 1, mode: 'immediate', tied: p.tied, themed: p.themed });
    }
    if (root.length === 1) {
      return Object.assign(out, { edge: pickEdge(c.moves[root[0]].edges, o.companion, b, rng), mode: 'only-move', depth: 0 });
    }
    // exact endgame when few reachable groups remain
    const live = reachable(c, used, k).length;
    out.live = live;
    if (live <= EXACT.groups) {
      const ex = new Exact(c, used, k, EXACT.nodes, EXACT.groups);
      const vals = [];
      let stop = null;
      const exUntil = run.safeguard ? run.clock() + EXACT.safeguardMs : Infinity;
      for (const mi of root) {
        const g = c.MG[mi];
        used[g] = 1;
        let finished = true;
        if (ex.start(c.MT[mi]) && ex.result === undefined) finished = await drive(ex, run, exUntil);
        if (!finished) ex.unwind();
        used[g] = 0;
        if (!finished) { stop = 'time'; break; }
        if (ex.aborted || ex.result === undefined) { stop = 'nodes'; break; }
        const vc = ex.result;
        vals.push({ mi, v: vc < 0 ? -vc - 1 : -vc + 1 });
      }
      out.nodes += ex.nodes;
      out.exactNodes = ex.nodes;
      if (!stop) {
        const best = Math.max(...vals.map((x) => x.v));
        const p = pickAmong(c, vals.filter((x) => x.v === best).map((x) => x.mi), o.companion, rng);
        return Object.assign(out, { edge: p.edge, depth: best > 0 ? EXV - best : EXV + best, exact: true, proof: best > 0 ? 'win' : 'loss', value: best > 0 ? WIN - (EXV - best) : -(WIN - (EXV + best)), mode: 'exact', tied: p.tied, themed: p.themed });
      }
      out.exactAborted = stop; // the bounded search below decides; this attempt is reported separately
    }
    // iterative deepening negamax under the node budget
    const S = new Search(c, used, pol.nodes);
    let order = root.slice(), done = null;
    for (let depth = 1; depth <= pol.maxDepth; depth++) {
      const vals = new Map();
      let best = -Infinity, ok = true, heurBefore = S.heur;
      const nodesBefore = S.nodes;
      for (const mi of order) {
        const g = c.MG[mi];
        used[g] = 1;
        let finished = true;
        // depth 1 always completes (at most one leaf per root move); deeper ones obey the safeguard
        if (S.start(c.MT[mi], depth - 1, -Infinity, best === -Infinity ? Infinity : -(best - EPS), 1) && S.result === undefined) finished = await drive(S, run, depth === 1 || !run.safeguard ? Infinity : run.t0 + pol.safeguardMs);
        if (!finished) S.unwind();
        used[g] = 0;
        if (!finished) { ok = false; out.fallback = true; out.reason = 'time'; break; }
        if (S.aborted || S.result === undefined) { ok = false; out.reason = 'nodes'; break; }
        const v = -S.result;
        vals.set(mi, v);
        if (v > best) best = v;
      }
      out.iterations.push({ depth, nodes: S.nodes - nodesBefore, complete: ok, heuristicLeaves: S.heur - heurBefore });
      if (!ok) break;
      done = { depth, vals, best, heuristic: S.heur - heurBefore };
      order = order.slice().sort((a, b) => vals.get(b) - vals.get(a) || order.indexOf(a) - order.indexOf(b));
      if (done.heuristic === 0) break;                      // the whole tree was searched: deeper adds nothing
      if (Math.abs(best) >= PROVEN && best > 0) break;     // a proven win was found
      if (S.nodes >= pol.nodes) { out.reason = 'nodes'; break; }
      if (run.safeguard && run.clock() - run.t0 >= pol.safeguardMs) { out.fallback = true; out.reason = 'time'; break; }
    }
    out.nodes += S.nodes;
    if (!done) { // not even depth 1 completed (only possible with a tiny budget or safeguard)
      const p = pickAmong(c, root, o.companion, rng);
      return Object.assign(out, { edge: p.edge, depth: 0, exact: false, fallback: true, mode: 'fallback-uniform' });
    }
    const tiedMoves = order.filter((mi) => done.vals.get(mi) >= done.best - EPS);
    const p = pickAmong(c, tiedMoves, o.companion, rng);
    const proven = Math.abs(done.best) >= PROVEN;
    return Object.assign(out, {
      edge: p.edge, depth: done.depth, value: done.best, exact: proven || done.heuristic === 0,
      proof: proven ? (done.best > 0 ? 'win' : 'loss') : done.heuristic === 0 ? 'complete' : null, tied: p.tied, themed: p.themed,
    });
  }

  SH.chooseMove = async function (state, bank, level, rng, o) {
    o = o || {};
    const pol = POLICY[level] || POLICY.casual;
    const clock = o.clock || defaultClock;
    const t0 = clock();
    const run = { sync: !!o.sync, clock, yieldMs: o.yieldMs || YIELD_MS, yieldFn: o.sync ? null : yielder(o), t0, sliceStart: t0, slices: 0, computeMs: 0, maxSliceMs: 0, safeguard: o.safeguard !== false };
    const base = { level, strategy: STRATEGY, provisional: false, depth: 0, exact: false, nodes: 0, fallback: false, value: null, proof: null };
    if (!rng) rng = RB.util.rng(1);
    let res;
    if (state.over) res = Object.assign(base, { edge: null, mode: 'over' });
    else if (pol.kind === 'partner') { const e = partnerMove(state, bank, rng, o.companion); res = Object.assign(base, { edge: e, mode: e ? 'partner' : 'concede', depth: e ? 1 : 0 }); }
    else if (pol.kind === 'casual') { const e = SH.casualMove(state, bank, rng); res = Object.assign(base, { edge: e, mode: e ? 'casual' : 'concede' }); }
    else {
      res = Object.assign(base, await searchMove(state, bank, pol, rng, o, run));
      res.target = pol.target;
    }
    const t1 = clock();
    if (!run.sync) endSlice(run, t1); // the final slice, up to the answer
    res.elapsedMs = t1 - run.t0;
    res.computeMs = run.sync ? res.elapsedMs : run.computeMs;
    res.slices = run.slices;
    res.maxSliceMs = run.sync ? res.elapsedMs : run.maxSliceMs;
    res.label = res.edge == null ? (res.mode === 'concede' ? 'no-safe-reply' : 'none') : res.exact ? 'exact' : pol.kind === 'search' ? 'estimated' : 'none';
    return res;
  };

  // A per-turn strategy stream: the same seed, state, bank and level give the same
  // choice, and nothing decorative can shift it (§12.3).
  SH.strategyRng = function (seed, state, bank, level) {
    return RB.util.rng(RB.util.hashStr([seed, bank.hash, level, state.history.length, state.required].join('|')));
  };
  // Decide once per turn and keep the decision (before any animation): a reload or
  // a reopened table gets the same move back instead of a reroll.
  SH.decide = async function (state, bank, level, rng, o) {
    const turn = state.history.length;
    const c = state.cpuChoice;
    if (c && c.turn === turn && c.level === level) return Object.assign({}, c, { edge: c.edge ? bank.edges.find((x) => x.id === c.edge) || null : null, stored: true });
    const r = await SH.chooseMove(state, bank, level, rng, o);
    if (state.history.length !== turn) return r; // the state moved on while thinking: do not store
    state.cpuChoice = { turn, level, edge: r.edge ? r.edge.id : null, depth: r.depth, exact: r.exact, label: r.label, nodes: r.nodes, fallback: r.fallback, value: r.value, mode: r.mode };
    return r;
  };

  // Exhaustive solve of a position (tests, analysis): { done, win, plies, nodes, winning:[edge ids] }
  async function solve(state, bank, o) {
    o = o || {};
    const c = compile(bank), k = c.ki[state.required];
    const used = usedArray(c, state);
    if (k === undefined || !safeMoveList(c, used, k).length) return { done: true, win: false, plies: 0, nodes: 0, winning: [] };
    const budget = o.nodes || EXACT.nodes;
    const ex = new Exact(c, used, k, budget, o.maxLive || 1e9);
    if (!ex.ok) return { done: false, nodes: 0, why: 'too-many-groups', live: ex.live.length };
    const clock = o.clock || defaultClock;
    const t0 = clock();
    const run = { sync: !!o.sync, clock, yieldMs: o.yieldMs || YIELD_MS, yieldFn: o.sync ? null : yielder(o), t0, sliceStart: t0, slices: 0, computeMs: 0, maxSliceMs: 0 };
    const until = o.safeguardMs ? t0 + o.safeguardMs : Infinity;
    const winning = [];
    let best = -Infinity;
    for (const mi of safeMoveList(c, used, k)) {
      const g = c.MG[mi];
      used[g] = 1;
      let finished = true;
      if (ex.start(c.MT[mi]) && ex.result === undefined) finished = await drive(ex, run, until);
      if (!finished) ex.unwind();
      used[g] = 0;
      if (!finished || ex.aborted || ex.result === undefined) return { done: false, nodes: ex.nodes, why: finished ? 'nodes' : 'time', live: ex.live.length };
      const vc = ex.result, v = vc < 0 ? -vc - 1 : -vc + 1;
      if (v > 0) for (const e of c.moves[mi].edges) winning.push(e.id);
      if (v > best) best = v;
    }
    return { done: true, win: best > 0, plies: best > 0 ? EXV - best : EXV + best, nodes: ex.nodes, winning, live: ex.live.length };
  }

  // ---- post-match review (§13.5) --------------------------------------------------------------------
  SH.analyse = async function (state, bank, o) {
    o = o || {};
    const notes = [];
    const H = state.history;
    // replay positions
    const pos = [];
    const sim = { used: {}, required: null, next: null };
    sim.used[H[0].group] = true;
    sim.required = H[0].tail;
    for (let i = 1; i < H.length; i++) {
      pos.push({ i, actor: H[i].actor, used: Object.assign({}, sim.used), required: sim.required });
      sim.used[H[i].group] = true;
      sim.required = H[i].tail;
    }
    const groupsAfter = (used, tail) => new Set((bank.byHead[tail] || []).filter((x) => !used[x.group] && !x.terminal).map((x) => x.group)).size;
    for (const p of pos) {
      const h = H[p.i];
      const st = { used: p.used, required: p.required };
      const safe = SH.safeReplies(st, bank);
      const opts = Array.from(new Set(safe.map((x) => x.group)));
      if (h.tail === 'ん' && opts.length) {
        notes.push({ kind: 'overlooked', turn: p.i, actor: p.actor, label: 'fact', proven: true, replies: opts.length, examples: safe.slice(0, 4).map((x) => x.entry), en: 'A ん word ended the game while ' + opts.length + ' safe repl' + (opts.length === 1 ? 'y' : 'ies') + ' remained (e.g. ' + safe.slice(0, 3).map((x) => x.reading).join(', ') + ').' });
        continue;
      }
      const u2 = Object.assign({}, p.used); u2[h.group] = true;
      const left = groupsAfter(u2, h.tail);
      const alts = safe.filter((x) => x.group !== h.group).map((x) => { const u3 = Object.assign({}, p.used); u3[x.group] = true; return { x, left: groupsAfter(u3, x.tail) }; });
      const winAlt = alts.filter((a) => a.left === 0);
      if (left > 0 && winAlt.length) notes.push({ kind: 'missed-win', turn: p.i, actor: p.actor, label: 'proven', proven: true, examples: winAlt.slice(0, 3).map((a) => a.x.entry), en: 'Turn ' + p.i + ': ' + winAlt.slice(0, 2).map((a) => a.x.reading).join(' or ') + ' would have left no safe reply.' });
      if (left > 0 && left <= 2) notes.push({ kind: 'restricting', turn: p.i, actor: p.actor, label: 'fact', proven: true, left, en: 'Turn ' + p.i + ': ' + h.reading + ' left only ' + left + ' safe repl' + (left === 1 ? 'y' : 'ies') + '.' });
      const fewer = alts.filter((a) => a.left > 0 && a.left < left);
      if (fewer.length && left > 2) { const m = fewer.reduce((a, b) => (b.left < a.left ? b : a)); notes.push({ kind: 'fewer-replies', turn: p.i, actor: p.actor, label: 'fact', proven: true, left, alt: m.x.entry, altLeft: m.left, en: 'Turn ' + p.i + ': ' + h.reading + ' left ' + left + ' safe replies; ' + m.x.reading + ' would have left ' + m.left + '.' }); }
    }
    if (state.over && /concession/.test(state.over.reason)) {
      const loser = state.over.reason === 'human-concession' ? 'pc' : 'cpu';
      const st = { used: sim.used, required: sim.required };
      const safe = SH.safeReplies(st, bank);
      if (safe.length) notes.push({ kind: 'overlooked', turn: H.length, actor: loser, label: 'fact', proven: true, replies: new Set(safe.map((x) => x.group)).size, examples: safe.slice(0, 4).map((x) => x.entry), en: 'Safe replies were still in the bank: ' + safe.slice(0, 3).map((x) => x.reading).join(', ') + '.' });
    }
    // a forced finish, only where the exact solver exhausted the position
    if (state.over && state.over.winner && (state.over.reason === 'no-safe-reply' || state.over.reason === 'terminal-n' || /concession/.test(state.over.reason))) {
      const W = state.over.winner;
      let from = null;
      for (let j = pos.length - 1; j >= 0; j--) {
        const p = pos[j];
        const r = await solve({ used: p.used, required: p.required }, bank, { nodes: o.nodes || EXACT.nodes, sync: o.sync, clock: o.clock, yield: o.yield });
        if (!r.done) break;
        const moverWins = r.win;
        if ((p.actor === W && moverWins) || (p.actor !== W && !moverWins)) from = { turn: p.i, plies: r.plies, mover: p.actor };
        else break;
      }
      if (from) notes.push({ kind: 'forced-finish', turn: from.turn, actor: W, label: 'proven', proven: true, plies: from.plies, en: 'From turn ' + from.turn + ' the finish was forced (proven by an exhaustive search of that position).' });
    }
    // bounded-search preferences (opt-in): never stated as proof unless exact
    if (o.deep) {
      const who = o.actor || 'pc';
      for (const p of pos) {
        if (p.actor !== who || H[p.i].tail === 'ん') continue;
        const st = { used: p.used, required: p.required, history: H.slice(0, p.i), over: null, next: p.actor };
        const r = await SH.chooseMove(st, bank, 'sharp', RB.util.rng(p.i), { sync: o.sync, clock: o.clock, yield: o.yield, safeguard: o.safeguard });
        if (!r.edge || r.edge.group === H[p.i].group) continue;
        const u2 = Object.assign({}, p.used); u2[H[p.i].group] = true;
        if (r.exact && r.proof === 'win') notes.push({ kind: 'proven-alternative', turn: p.i, actor: who, label: 'proven', proven: true, alt: r.edge.entry, en: 'Turn ' + p.i + ': ' + r.edge.reading + ' was a proven forced win.' });
        else if (!r.exact && r.value != null) notes.push({ kind: 'checked-preference', turn: p.i, actor: who, label: 'checked', proven: false, depth: r.depth, alt: r.edge.entry, en: 'Turn ' + p.i + ': ' + r.edge.reading + ' looked stronger within the checked moves (' + r.depth + ' plies).' });
      }
    }
    const rank = ['missed-win', 'overlooked', 'forced-finish', 'restricting', 'proven-alternative', 'fewer-replies', 'checked-preference'];
    const one = notes.slice().sort((a, b) => rank.indexOf(a.kind) - rank.indexOf(b.kind) || b.turn - a.turn)[0] || null;
    return { notes, one, strategy: STRATEGY, provisional: false };
  };

  // ---- starter certification (§11.3) ----------------------------------------------------------------
  // A neutral starter is certified when its tail has at least four safe initial
  // responses (distinct repeat-groups) and, under exhaustive two-ply search, the
  // first responder cannot win at once (aWin) and the second player cannot force a
  // win at ply 2 (bForced). `exposure` counts first responses that would allow an
  // immediate second-ply win: a legitimate trap, reported but not disqualifying.
  function starterCheck(b, edge) {
    const c = compile(b);
    const used = new Uint8Array(c.G);
    const g0 = c.gi[edge.group];
    used[g0] = 1;
    const k = c.ki[edge.tail];
    const A = edge.terminal || k === undefined ? [] : safeMoveList(c, used, k);
    const replies = new Set(Array.from(A, (mi) => c.MG[mi])).size;
    let aWin = false, bForced = A.length > 0, exposure = 0;
    for (const ma of A) {
      used[c.MG[ma]] = 1;
      const B = safeMoveList(c, used, c.MT[ma]);
      if (!B.length) aWin = true;
      let kill = false;
      for (const mb of B) {
        used[c.MG[mb]] = 1;
        if (!replyGroups(c, used, c.MT[mb])) kill = true;
        used[c.MG[mb]] = 0;
        if (kill) break;
      }
      if (kill) exposure++; else bForced = false;
      used[c.MG[ma]] = 0;
    }
    return { edge: edge.id, entry: edge.entry, tail: edge.tail, replies, aWin, bForced, exposure, ok: !edge.terminal && replies >= 4 && !aWin && !bForced };
  }
  function certifyStarters(b) {
    return b.edges.filter((e) => !e.terminal).map((e) => starterCheck(b, e));
  }

  SH.ai = { STRATEGY, POLICY, EXACT, THEMES, WIN, compile, liveGroups, solve, heuristic, reachable, starterCheck, certifyStarters };
})(RB.shiritori);
