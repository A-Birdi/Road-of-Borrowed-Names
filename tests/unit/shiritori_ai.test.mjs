// Shiritori opponents (Practice addendum §12, §23.4): the engine's exact solver and
// bounded search against independent naive implementations on deterministic
// generated states (abstract test-only graphs: their "readings" are random kana
// strings that never appear in the game), plus determinism, legality, concession,
// node and time safeguards, the 8 ms yield cadence, exact/estimated labels, thematic
// tie-breaks among equal evaluations only, stored decisions and the review notes.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SH = RB.shiritori, AI = SH.ai;
  const WIN = AI.WIN;
  const ALPH = 'かきくけこさしすせそたちつ';
  // an abstract test graph: n entries with random 2–3 kana readings (some ending in ん)
  function gen(seed, n, alph) {
    const r = RB.util.rng(seed), A = alph || ALPH, entries = [];
    for (let i = 0; i < n; i++) {
      let s = '';
      const len = 2 + Math.floor(r() * 2);
      for (let j = 0; j < len; j++) s += A[Math.floor(r() * A.length)];
      if (r() < 0.07) s += 'ん';
      entries.push({ id: 'z' + i, reading: s, forms: [s], display: { jp: s, en: 'test' }, nounKind: 'common', themes: [r() < 0.3 ? 'practical' : 'other'] });
    }
    return SH.buildBank({ id: 'gen' + seed, entries });
  }
  // a mid-game state: a starter, then k random safe moves
  function midState(b, seed, k) {
    const r = RB.util.rng(seed * 7919 + 1);
    const starts = b.edges.filter((e) => !e.terminal);
    const g = SH.newGame(b, { starter: starts[Math.floor(r() * starts.length)].id, first: r() < 0.5 ? 'pc' : 'cpu' });
    for (let i = 0; i < k && !g.over; i++) {
      const s = SH.safeReplies(g, b);
      if (!s.length) break;
      SH.play(g, b, s[Math.floor(r() * s.length)]);
    }
    return g;
  }
  // ---- independent reference implementations ----
  const movesOf = (b, used, h) => {
    const seen = new Set(), out = [];
    for (const e of b.edges) if (e.head === h && !e.terminal && !used[e.group] && !seen.has(e.group + '|' + e.tail)) { seen.add(e.group + '|' + e.tail); out.push(e); }
    return out;
  };
  const replyCount = (b, used, h) => new Set(b.edges.filter((e) => e.head === h && !e.terminal && !used[e.group]).map((e) => e.group)).size;
  function naiveWin(b, used, h, memo) {
    const key = Object.keys(used).filter((g) => used[g]).sort().join(',') + '@' + h;
    if (memo.has(key)) return memo.get(key);
    let w = false;
    for (const e of movesOf(b, used, h)) { const u = Object.assign({}, used, { [e.group]: true }); if (!naiveWin(b, u, e.tail, memo)) { w = true; break; } }
    memo.set(key, w);
    return w;
  }
  function naiveH(b, used, h, ply) {
    const ms = movesOf(b, used, h);
    if (!ms.length) return -(WIN - ply);
    const groups = new Set(ms.map((m) => m.group)).size, tails = new Set(ms.map((m) => m.tail)).size;
    let sum = 0;
    for (const m of ms) { const r = replyCount(b, Object.assign({}, used, { [m.group]: true }), m.tail); if (r === 0) return WIN - (ply + 1); sum += Math.log2(1 + r); }
    return Math.log2(1 + groups) + 0.25 * Math.log2(1 + tails) - 0.2 * (sum / ms.length);
  }
  function naiveNeg(b, used, h, depth, ply) {
    if (depth === 0) return naiveH(b, used, h, ply);
    const ms = movesOf(b, used, h);
    if (!ms.length) return -(WIN - ply);
    for (const m of ms) if (replyCount(b, Object.assign({}, used, { [m.group]: true }), m.tail) === 0) return WIN - (ply + 1);
    let best = -Infinity;
    for (const m of ms) best = Math.max(best, -naiveNeg(b, Object.assign({}, used, { [m.group]: true }), m.tail, depth - 1, ply + 1));
    return best;
  }
  function naiveRoot(b, state, depth) {
    let best = -Infinity;
    for (const m of movesOf(b, state.used, state.required)) best = Math.max(best, -naiveNeg(b, Object.assign({}, state.used, { [m.group]: true }), m.tail, depth - 1, 1));
    return best;
  }
  const S = { sync: true, safeguard: false };

  // ---- A: exact solver and searched levels vs the independent solver (small graphs) ----
  let nA = 0, solveAgree = 0, winFound = 0, winCases = 0, illegal = 0, conceded = 0, concedeOk = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const b = gen(seed, 9 + (seed % 9), 'かきくけこさしすせ');
    for (let s = 0; s < 8; s++) {
      const g = midState(b, seed * 31 + s, s % 3);
      if (g.over) continue;
      nA++;
      const w = naiveWin(b, g.used, g.required, new Map());
      const r = await AI.solve(g, b, { sync: true });
      if (r.done && r.win === w) solveAgree++;
      for (const lv of ['thoughtful', 'sharp']) {
        const m = await SH.chooseMove(g, b, lv, RB.util.rng(seed + s), S);
        if (!m.edge) { conceded++; if (!SH.safeReplies(g, b).length) concedeOk++; continue; }
        if (SH.check(g, b, m.edge, g.next).ok !== true || m.edge.terminal) illegal++;
        // a winning move leaves the opponent in a lost position
        if (w) { winCases++; if (!naiveWin(b, Object.assign({}, g.used, { [m.edge.group]: true }), m.edge.tail, new Map())) winFound++; }
      }
    }
  }
  t.ok(nA >= 500, 'part A covers ' + nA + ' generated states');
  t.eq(solveAgree, nA, 'the exact solver W(S,h) agrees with an independent solver on every generated state (' + solveAgree + '/' + nA + ')');
  t.eq(winFound, winCases, 'Thoughtful and Sharp always play a winning move when the position is a proven win (≤12 reachable groups: exact endgame) (' + winFound + '/' + winCases + ')');
  t.eq(illegal, 0, 'no searched move is illegal or ends in ん');
  t.eq(concedeOk, conceded, 'the computer concedes only when no safe reply exists');

  // ---- B: bounded search values vs naive negamax of the same §12.2 evaluation ----
  let nB = 0, agreeB = 0, nC = 0, agreeC = 0;
  const firstBad = [];
  for (let seed = 101; seed <= 180; seed++) {
    const b = gen(seed, 40 + (seed % 12), 'かきくけこさしすせ');
    for (let s = 0; s < 8; s++) {
      const g = midState(b, seed * 17 + s, s * 2);
      if (g.over || AI.liveGroups(g, b) <= AI.EXACT.groups) continue;
      const m = await SH.chooseMove(g, b, 'thoughtful', RB.util.rng(s), S);
      if (m.mode !== 'search' || m.depth !== 2) continue;
      nB++;
      const ref = naiveRoot(b, g, 2);
      if (Math.abs(ref - m.value) < 1e-9) agreeB++; else if (firstBad.length < 3) firstBad.push([seed, s, ref, m.value]);
    }
  }
  t.ok(nB >= 300, 'part B covers ' + nB + ' generated states');
  t.eq(agreeB, nB, 'Thoughtful (alpha–beta, explicit stack, depth 2) gives the same root value as a naive negamax with the same terminal checks and heuristic H (' + agreeB + '/' + nB + ')' + (firstBad.length ? ' ' + JSON.stringify(firstBad) : ''));
  // Sharp at a fixed depth 3 (the deeper reference is too slow to run naively at the real limit)
  const sharp = AI.POLICY.sharp, keep = sharp.maxDepth;
  sharp.maxDepth = 3;
  try {
    for (let seed = 201; seed <= 260; seed++) {
      const b = gen(seed, 34 + (seed % 8), 'かきくけこさしすせ');
      for (let s = 0; s < 5; s++) {
        const g = midState(b, seed * 13 + s, s * 2 + 1);
        if (g.over || AI.liveGroups(g, b) <= AI.EXACT.groups) continue;
        const m = await SH.chooseMove(g, b, 'sharp', RB.util.rng(s), S);
        if (m.mode !== 'search' || m.depth !== 3) continue;
        nC++;
        if (Math.abs(naiveRoot(b, g, 3) - m.value) < 1e-9) agreeC++;
      }
    }
  } finally { sharp.maxDepth = keep; }
  t.ok(nC >= 100, 'part C covers ' + nC + ' generated states');
  t.eq(agreeC, nC, 'Sharp\'s iterative deepening (depth 3) matches the naive negamax root value (' + agreeC + '/' + nC + ')');
  t.ok(nA + nB + nC >= 1000, 'at least 1,000 deterministic generated states compared (' + (nA + nB + nC) + ')');
  t.log('generated states: A (exact solver, ' + winCases + ' winning-position move checks) ' + nA + ', B (Thoughtful vs naive) ' + nB + ', C (Sharp depth 3 vs naive) ' + nC);

  // ---- real banks ----
  const X = SH.bank('extended'), P = SH.bank('pocket');
  t.ok(X && P, 'the fixed banks are registered');
  // a position found by playing random safe moves until a predicate holds
  function findState(b, seed, pred) {
    for (let tries = 0; tries < 300; tries++) {
      const r = RB.util.rng(seed * 104729 + tries);
      const g = SH.newGame(b, { starter: b.starters[Math.floor(r() * b.starters.length)], first: 'cpu' });
      for (let i = 0; i < 400 && !g.over; i++) {
        if (pred(g)) return g;
        const s = SH.safeReplies(g, b);
        SH.play(g, b, s[Math.floor(r() * s.length)]);
      }
    }
    return null;
  }
  const busy = (b) => (g) => !g.over && SH.safeGroups(g, b).length >= 6 && AI.liveGroups(g, b) > 40 && !SH.safeReplies(g, b).some((e) => !SH.safeReplies(Object.assign({}, g, { used: Object.assign({}, g.used, { [e.group]: true }) }), b, e.tail).length);
  const xs = findState(X, 5, busy(X));
  t.ok(!!xs, 'found a busy Extended position (' + (xs && SH.safeGroups(xs, X).length) + ' safe groups to move)');
  // determinism: same seed → same move; sync and chunked give the same result; extra options are ignored
  for (const lv of ['casual', 'partner', 'thoughtful', 'sharp']) {
    const a = await SH.chooseMove(xs, X, lv, RB.util.rng(42), S);
    const b2 = await SH.chooseMove(xs, X, lv, RB.util.rng(42), S);
    const c = await SH.chooseMove(xs, X, lv, RB.util.rng(42), { safeguard: false });
    const d = await SH.chooseMove(xs, X, lv, RB.util.rng(42), Object.assign({ pet: 'tanuki', petHidden: true, sound: 'off', reducedMotion: true, banter: 'quiet' }, S));
    t.ok(a.edge && b2.edge && a.edge.id === b2.edge.id && c.edge.id === a.edge.id && d.edge.id === a.edge.id, lv + ': the same seed gives the same move, chunked or not, whatever pets/sound/motion say (' + a.edge.reading + ')');
  }
  t.ok(xs.cpuChoice === undefined && !Object.keys(xs).some((k) => /pet|sound/.test(k)), 'chooseMove does not write to the game state');
  // budgets and labels on a big position
  const th = await SH.chooseMove(xs, X, 'thoughtful', RB.util.rng(1), S);
  const sh = await SH.chooseMove(xs, X, 'sharp', RB.util.rng(1), S);
  t.ok(th.nodes - (th.exactNodes || 0) <= 4000 && th.depth === 2 && th.label === 'estimated', 'Thoughtful: ≤4,000 nodes, 2 plies, estimated (' + th.nodes + ' nodes)');
  t.ok(sh.nodes - (sh.exactNodes || 0) <= 30000 && sh.depth >= 4 && sh.label === 'estimated', 'Sharp: ≤30,000 nodes, ≥4 plies, estimated (' + sh.nodes + ' nodes, depth ' + sh.depth + ')');
  t.ok(sh.iterations.every((it, i) => it.depth === i + 1), 'Sharp deepens one ply at a time');
  // time safeguards with a fake clock (1 ms per reading): fall back to the last completed depth
  let now = 0;
  const fake = () => (now += 1);
  const tf = await SH.chooseMove(xs, X, 'sharp', RB.util.rng(1), { clock: fake, yield: async () => {} });
  t.ok(tf.fallback && tf.reason === 'time' && tf.depth >= 1 && tf.depth < sh.depth && tf.edge && tf.label === 'estimated', 'Sharp past 250 ms: the last completed depth (' + tf.depth + '), marked as a fallback');
  now = 0;
  const tt = await SH.chooseMove(xs, X, 'thoughtful', RB.util.rng(1), { clock: () => (now += 120), yield: async () => {} });
  t.ok(tt.fallback && tt.depth === 1 && tt.edge, 'Thoughtful past 100 ms falls back to depth 1');
  // yield cadence: slices never exceed 8 ms of (fake) time
  now = 0;
  let yields = 0;
  const ty = await SH.chooseMove(xs, X, 'sharp', RB.util.rng(1), { clock: () => (now += 0.25), yield: async () => { yields++; }, safeguard: false });
  t.ok(yields > 3 && ty.maxSliceMs <= 8 + 0.25 * 3, 'the search yields at least every 8 ms (' + yields + ' yields, longest slice ' + ty.maxSliceMs.toFixed(2) + ' ms)');
  t.ok(ty.edge.id === sh.edge.id && ty.nodes === sh.nodes, 'yielding does not change the result');
  // exact endgame: label exact, proof win/loss
  const endg = findState(P, 900, (g) => !g.over && AI.liveGroups(g, P) <= 12 && AI.liveGroups(g, P) >= 5 && SH.safeGroups(g, P).length >= 2);
  t.ok(!!endg, 'found a Pocket endgame with 4–12 reachable groups');
  if (endg) {
    const e = await SH.chooseMove(endg, P, 'sharp', RB.util.rng(3), S);
    const ref = naiveWin(P, endg.used, endg.required, new Map());
    t.ok((e.mode === 'exact' || e.mode === 'immediate') && e.label === 'exact' && (e.proof === 'win') === ref, 'the endgame is solved exactly and labelled (' + e.mode + ', ' + e.proof + ')');
    now = 0;
    const et = await SH.chooseMove(endg, P, 'thoughtful', RB.util.rng(3), { clock: () => (now += 50), yield: async () => {} });
    t.ok(et.edge && (et.mode === 'immediate' || et.mode === 'exact' || et.exactAborted === 'time' || et.mode === 'only-move'), 'a slow exact attempt gives way to the bounded search (' + et.mode + (et.exactAborted ? ', exact ' + et.exactAborted : '') + ')');
  }
  // the exact ceiling: a solve that needs more nodes reports it did not finish
  const big = await AI.solve(xs, X, { sync: true, nodes: 500 });
  t.ok(!big.done, 'an unfinished exhaustive search is reported as unfinished, never as a proof');
  // concession: only ん words left
  const nState = { used: {}, required: 'み', next: 'cpu', over: null, history: [{ actor: 'start' }] };
  for (const g of Object.keys(P.groups)) if (!P.groups[g].terminal && P.groups[g].heads.indexOf('み') >= 0) nState.used[g] = true;
  const cz = await SH.chooseMove(nState, P, 'sharp', RB.util.rng(1), S);
  t.ok(cz.edge === null && cz.label === 'no-safe-reply', 'with only ん words left the computer concedes (みかん is never played)');
  // thematic tie-breaks: only among equal evaluations
  // two mirror-image branches (こま… and こめ…) evaluate identically by construction
  const E2 = (id, r, th) => ({ id, reading: r, forms: [r], display: { jp: r, en: id }, themes: [th] });
  const tie = SH.buildBank({ id: 'tie', entries: [
    E2('start', 'たこ', 'other'), E2('b', 'こま', 'practical'), E2('c', 'こめ', 'art'),
    E2('b2', 'まつ', 'other'), E2('c2', 'めつ', 'other'), E2('b3', 'まき', 'other'), E2('c3', 'めき', 'other'),
  ] });
  for (const lv of ['thoughtful', 'sharp']) {
    const picks = { nao: new Set(), suzu: new Set(), none: new Set() };
    for (let s = 0; s < 40; s++) for (const who of ['nao', 'suzu', 'none']) {
      const g = SH.newGame(tie, { starter: 'start', first: 'cpu' }); // たこ → こ: こま or こめ
      const m = await SH.chooseMove(g, tie, lv, RB.util.rng(s), Object.assign({ companion: who === 'none' ? null : who }, S));
      picks[who].add(m.edge.entry + ':' + m.tied);
    }
    t.eq([...picks.nao], ['b:2'], lv + ': Nao breaks an equal-evaluation tie towards a practical noun');
    t.eq([...picks.suzu], ['c:2'], lv + ': Suzu breaks it towards an art noun');
    t.eq([...picks.none].sort(), ['b:2', 'c:2'], lv + ': with no thematic preference both tied moves occur');
  }
  // themes never override a better evaluation: Nao still takes the immediate win
  const win = SH.buildBank({ id: 'win', entries: [
    { id: 'a', reading: 'さか', forms: ['さか'], display: { jp: 'さか', en: 'a' }, themes: ['other'] },
    { id: 'b', reading: 'かさ', forms: ['かさ'], display: { jp: 'かさ', en: 'b' }, themes: ['practical'] },
    { id: 'c', reading: 'かね', forms: ['かね'], display: { jp: 'かね', en: 'c' }, themes: ['other'] },
    { id: 'd', reading: 'さし', forms: ['さし'], display: { jp: 'さし', en: 'd' }, themes: ['other'] },
  ] });
  const gw = SH.newGame(win, { starter: 'a', first: 'cpu' });
  const mw = await SH.chooseMove(gw, win, 'thoughtful', RB.util.rng(1), Object.assign({ companion: 'nao' }, S));
  t.eq(mw.edge.entry, 'c', 'a themed word never replaces a better result (かね leaves no reply; かさ would not)');
  // decide(): stored before showing, no reroll
  const gd = midState(X, 77, 4);
  const d1 = await SH.decide(gd, X, 'sharp', SH.strategyRng(7, gd, X, 'sharp'), S);
  const d2 = await SH.decide(gd, X, 'sharp', RB.util.rng(999), S);
  t.ok(gd.cpuChoice && d2.stored && d2.edge.id === d1.edge.id, 'decide() stores the choice and returns it again instead of rerolling');
  SH.play(gd, X, d1.edge);
  t.ok(gd.cpuChoice === undefined, 'playing the move clears the stored choice');
  const r1 = SH.strategyRng(7, gd, X, 'sharp')(), r2 = SH.strategyRng(7, gd, X, 'sharp')();
  t.ok(r1 === r2, 'the strategy stream is a pure function of seed, bank, level and turn');
  // the learning partner leaves a reply when one exists
  let leaves = 0, possible = 0;
  for (let s = 0; s < 60; s++) {
    const g = midState(P, 300 + s, 6);
    if (g.over) continue;
    const opts = SH.safeReplies(g, P).filter((e) => SH.safeReplies(Object.assign({}, g, { used: Object.assign({}, g.used, { [e.group]: true }) }), P, e.tail).length);
    if (!opts.length) continue;
    possible++;
    const m = await SH.chooseMove(g, P, 'partner', RB.util.rng(s), S);
    if (SH.safeReplies(Object.assign({}, g, { used: Object.assign({}, g.used, { [m.edge.group]: true }) }), P, m.edge.tail).length) leaves++;
  }
  t.eq(leaves, possible, 'the learning partner never closes the chain when a continuing word exists (' + leaves + '/' + possible + ')');
  t.log('learning partner: ' + leaves + '/' + possible + ' positions with a continuing word');
  // Casual is uniform among safe groups
  const gc = SH.newGame(X, { starter: X.starters[0], first: 'cpu' });
  const groups = SH.safeGroups(gc, X), counts = {};
  for (let s = 0; s < 3000; s++) { const m = await SH.chooseMove(gc, X, 'casual', RB.util.rng(s + 1), S); counts[m.edge.group] = (counts[m.edge.group] || 0) + 1; }
  const exp = 3000 / groups.length, chi = groups.reduce((a, g) => a + Math.pow((counts[g] || 0) - exp, 2) / exp, 0);
  t.log('casual uniformity: chi-square ' + chi.toFixed(1) + ' over ' + groups.length + ' groups, 3,000 seeds');
  t.ok(Object.keys(counts).length === groups.length && chi < 3 * groups.length + 20, 'Casual picks every safe group about equally often (χ² ' + chi.toFixed(1) + ', ' + groups.length + ' groups)');

  // ---- full games: every computer move legal, finite, ends truthfully ----
  let games = 0, bad = 0;
  const levels = ['casual', 'partner', 'thoughtful', 'sharp'];
  for (let i = 0; i < 24; i++) {
    const b = [P, SH.bank('everyday'), X][i % 3];
    const g = SH.newGame(b, { starter: b.starters[i % b.starters.length], first: i % 2 ? 'pc' : 'cpu' });
    const lv = { pc: levels[i % 4], cpu: levels[(i + 1) % 4] };
    let guard = 0;
    while (!g.over && guard++ < 400) {
      const m = await SH.chooseMove(g, b, lv[g.next], RB.util.rng(i * 100 + guard), S);
      if (!m.edge) { SH.concede(g, g.next); break; }
      if (SH.check(g, b, m.edge, g.next).ok !== true) { bad++; break; }
      SH.play(g, b, m.edge);
    }
    games++;
    if (!g.over || !(g.over.reason === 'no-safe-reply' || /concession/.test(g.over.reason))) bad++;
    if (g.over && g.over.reason === 'no-safe-reply' && SH.safeReplies(g, b).length) bad++;
  }
  t.eq(bad, 0, games + ' complete games between all levels: legal moves only, a truthful ending each time');

  // ---- review notes ----
  const tiny = SH.buildBank({ id: 'tiny', entries: [
    { id: 'a', reading: 'たこ', forms: ['たこ'], display: { jp: 'たこ', en: 'a' } },
    { id: 'b', reading: 'こま', forms: ['こま'], display: { jp: 'こま', en: 'b' } },
    { id: 'c', reading: 'まど', forms: ['まど'], display: { jp: 'まど', en: 'c' } },
    { id: 'd', reading: 'こし', forms: ['こし'], display: { jp: 'こし', en: 'd' } },
    { id: 'e', reading: 'しか', forms: ['しか'], display: { jp: 'しか', en: 'e' } },
    { id: 'f', reading: 'まめ', forms: ['まめ'], display: { jp: 'まめ', en: 'f' } },
    { id: 'g', reading: 'めだか', forms: ['めだか'], display: { jp: 'めだか', en: 'g' } },
  ] });
  const ga = SH.newGame(tiny, { starter: 'a', first: 'pc' }); // たこ → こ
  SH.play(ga, tiny, tiny.edges.find((e) => e.entry === 'b')); // pc こま → ま (まど would win at once for cpu)
  SH.play(ga, tiny, tiny.edges.find((e) => e.entry === 'f')); // cpu まめ → め
  SH.play(ga, tiny, tiny.edges.find((e) => e.entry === 'g')); // pc めだか → か: no reply, pc wins
  const an = await SH.analyse(ga, tiny, { sync: true });
  t.ok(an.notes.some((n) => n.kind === 'missed-win' && n.actor === 'cpu' && n.proven), 'review: a missed immediate win (まど) is a proven fact');
  t.ok(an.notes.some((n) => n.kind === 'forced-finish' && n.proven), 'review: a forced finish is reported because the exact solver exhausted the position');
  const gb = SH.newGame(tiny, { starter: 'a', first: 'pc' });
  SH.concede(gb, 'pc');
  const an2 = await SH.analyse(gb, tiny, { sync: true });
  t.ok(an2.notes.some((n) => n.kind === 'overlooked' && n.actor === 'pc'), 'review: conceding while replies existed lists the overlooked replies');
  const gl = midState(X, 21, 3);
  SH.concede(gl, gl.next);
  const an3 = await SH.analyse(gl, X, { sync: true, nodes: 2000 });
  t.ok(!an3.notes.some((n) => n.kind === 'forced-finish'), 'review: no forced finish is claimed where the exhaustive search could not finish');
  const an4 = await SH.analyse(gl, X, { sync: true, deep: true, actor: gl.history[1] ? gl.history[1].actor : 'pc', safeguard: false });
  t.ok(an4.notes.filter((n) => n.kind === 'checked-preference').every((n) => !n.proven && n.label === 'checked' && /looked stronger within the checked moves/.test(n.en)), 'review: bounded-search preferences are labelled "looked stronger within the checked moves", never proven');
};
