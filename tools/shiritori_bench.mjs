// Shiritori opponent-strength benchmark (Practice addendum §12.5, §23.4).
//
//   node tools/shiritori_bench.mjs [--pairs 200] [--threads 3] [--live 60] [--no-write]
//
// For each fixed band (pocket, everyday, extended) and each pairing (Casual–Thoughtful,
// Casual–Sharp, Thoughtful–Sharp), opening/seed pair i (i = 0 … pairs−1) uses the
// certified starter bank.starters[i mod n] and strategy seed i+1 for both games of
// the pair: once with the lower level responding first, once with the higher level
// first (reversed seats). With 200 pairs that is 3 × 3 × 200 × 2 = 3,600 complete
// games. Every move comes from RB.shiritori.chooseMove with node budgets only
// (o.sync, o.safeguard:false) and the per-turn stream RB.shiritori.strategyRng(seed,
// state, bank, level), so the games are reproducible; each move's wall time is
// recorded to report how often the elapsed safeguards (100/250/500 ms) would have
// cut a search short on this machine. --live N also plays N games per band with the
// real cooperative driver and safeguards switched on, and reports their fallbacks.
//
// Paired uncertainty: the unit is the opening/seed pair (score = the higher level's
// wins in its two games ÷ 2); 10,000 bootstrap resamples of pairs (seeded) give a 95%
// percentile interval. The 55% target is a tuning hypothesis, not a promise.
// Writes docs/practice/shiritori_bench.md and docs/practice/shiritori_bench.json.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { load, root } from '../tests/lib/load.mjs';

var BANDS = ['pocket', 'everyday', 'extended'];
var PAIRINGS = [['casual', 'thoughtful'], ['casual', 'sharp'], ['thoughtful', 'sharp']];
var SAFEGUARD = { thoughtful: 100, sharp: 250 };

function loadRB() {
  globalThis.__RB_TEST__ = true;
  return load(['core', 'lang', 'engine/71_shiritori.js', 'engine/72_shiritori_ai.js', 'content/shiritori'], { __RB_TEST__: true });
}
// one complete game; seat 'pc' responds first after the neutral starter
async function playGame(RB, b, starter, seed, first, second, o) {
  const SH = RB.shiritori;
  const g = SH.newGame(b, { starter, first: 'pc' });
  const lv = { pc: first, cpu: second };
  const moves = [];
  const t0 = performance.now();
  while (!g.over) {
    const level = lv[g.next];
    const a = performance.now();
    const m = await SH.chooseMove(g, b, level, SH.strategyRng(seed, g, b, level), o);
    const ms = performance.now() - a;
    moves.push({ level, depth: m.depth, exact: m.exact, mode: m.mode, nodes: m.nodes, ms, fallback: m.fallback, exactAborted: m.exactAborted || null, live: m.live });
    if (!m.edge) { SH.concede(g, g.next); break; }
    SH.play(g, b, m.edge);
  }
  return { winner: lv[g.over.winner], winnerSeat: g.over.winner === 'pc' ? 'first' : 'second', reason: g.over.reason, chain: SH.moves(g), moves, ms: performance.now() - t0, words: g.history.map((h) => h.reading).join(' ') };
}

async function job({ band, pairing, pairs, live }) {
  const RB = loadRB();
  const b = RB.shiritori.bank(band);
  const [lo, hi] = PAIRINGS[pairing];
  const out = [];
  for (let i = 0; i < pairs; i++) {
    const starter = b.starters[i % b.starters.length], seed = i + 1;
    for (const order of ['lo-first', 'hi-first']) {
      const [f, s] = order === 'lo-first' ? [lo, hi] : [hi, lo];
      const r = await playGame(RB, b, starter, seed, f, s, { sync: true, safeguard: false });
      out.push(Object.assign({ band, pairing: lo + '-' + hi, pair: i, seed, starter, order, higherWon: r.winner === hi }, r));
    }
  }
  const liveGames = [];
  for (let i = 0; i < live; i++) {
    const starter = b.starters[i % b.starters.length], seed = 5000 + i;
    const r = await playGame(RB, b, starter, seed, i % 2 ? lo : hi, i % 2 ? hi : lo, {});
    liveGames.push(Object.assign({ band, pairing: lo + '-' + hi, seed, starter }, r));
  }
  return { out, liveGames };
}

if (!isMainThread) {
  job(workerData).then((r) => parentPort.postMessage(r));
} else {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : d; };
  const pairs = opt('--pairs', 200), threads = opt('--threads', Math.max(1, Math.min(3, os.cpus().length - 1))), live = opt('--live', 0);
  const write = !args.includes('--no-write');
  const t0 = Date.now();
  const jobs = [];
  BANDS.forEach((band) => PAIRINGS.forEach((p, pairing) => jobs.push({ band, pairing, pairs, live: pairing === 2 ? live : 0 })));
  const results = [], liveAll = [];
  let next = 0;
  const self = fileURLToPath(import.meta.url);
  await Promise.all(Array.from({ length: threads }, () => (async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const r = await new Promise((res, rej) => { const w = new Worker(self, { workerData: j }); w.on('message', res); w.on('error', rej); });
      results.push(...r.out); liveAll.push(...r.liveGames);
      console.log('done', j.band, PAIRINGS[j.pairing].join('-'), r.out.length, 'games', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
  })()));
  const wall = (Date.now() - t0) / 1000;
  report(results, liveAll, { pairs, threads, wall, write });
}

// ---- statistics -------------------------------------------------------------------------------
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function bootstrap(scores, seed) {
  const R = rng(seed), n = scores.length, means = [];
  for (let k = 0; k < 10000; k++) { let s = 0; for (let i = 0; i < n; i++) s += scores[Math.floor(R() * n)]; means.push(s / n); }
  means.sort((a, b) => a - b);
  return [means[249], means[9749]];
}
function pct(x) { return (100 * x).toFixed(1) + '%'; }
function median(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0; }
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

function report(results, liveAll, meta) {
  let rev = 'unknown';
  try { rev = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim(); } catch (e) { /* not a checkout */ }
  const dirty = (() => { try { return execFileSync('git', ['status', '--porcelain', 'src'], { cwd: root }).toString().trim() ? ' (with uncommitted changes under src/)' : ''; } catch (e) { return ''; } })();
  const L = [];
  L.push('# Shiritori opponent-strength benchmark', '');
  L.push('Generated by `node tools/shiritori_bench.mjs --pairs ' + meta.pairs + ' --threads ' + meta.threads + (liveAll.length ? ' --live ' + (liveAll.length / BANDS.length) : '') + '` from the source at `' + rev + '`' + dirty + ' with Node ' + process.version + ' on ' + os.cpus().length + ' shared CPUs (load average ' + os.loadavg().map((x) => x.toFixed(1)).join(' / ') + ' at the end). Wall time ' + (meta.wall / 60).toFixed(1) + ' min for ' + results.length + ' games.', '');
  L.push('**Method.** Each band × pairing plays opening/seed pairs i = 0…' + (meta.pairs - 1) + ': starter `bank.starters[i mod n]`, strategy seed `i+1` (per-turn stream `RB.shiritori.strategyRng(seed, state, bank, level)`), once with the lower level responding first and once reversed. Moves use node budgets only (Thoughtful 4,000, Sharp 30,000, exact endgame 100,000 over ≤12 reachable groups), so every game here is reproducible. No companion theme is set (no thematic tie-breaks). The higher level\'s score for a pair is its wins in the two games ÷ 2; the 95% interval is a percentile bootstrap over pairs (10,000 resamples, seed 12345). The 55% target is a hypothesis, not a promise. Heuristic values are not probabilities.', '');
  // headline table
  L.push('## Results by band and pairing', '');
  L.push('| band | pairing | games | higher level wins | 95% CI (pairs) | ≥55%? | higher wins as first / second responder | first-responder wins | chain mean / median | terminations |');
  L.push('|---|---|---:|---:|---|---|---|---:|---|---|');
  const summary = {};
  for (const band of BANDS) for (const [lo, hi] of PAIRINGS) {
    const key = lo + '-' + hi;
    const G = results.filter((r) => r.band === band && r.pairing === key);
    if (!G.length) continue;
    const byPair = {};
    for (const r of G) (byPair[r.pair] = byPair[r.pair] || []).push(r);
    const scores = Object.values(byPair).map((p) => p.filter((r) => r.higherWon).length / p.length);
    const [ciLo, ciHi] = bootstrap(scores, 12345);
    const hw = G.filter((r) => r.higherWon).length / G.length;
    const hiFirst = G.filter((r) => r.order === 'hi-first'), loFirst = G.filter((r) => r.order === 'lo-first');
    const firstWins = G.filter((r) => r.winnerSeat === 'first').length / G.length;
    const reasons = {};
    for (const r of G) reasons[r.reason] = (reasons[r.reason] || 0) + 1;
    const chains = G.map((r) => r.chain);
    summary[band + ':' + key] = { games: G.length, higher: hw, ci: [ciLo, ciHi], firstWins, chainMean: mean(chains), chainMedian: median(chains) };
    L.push('| ' + band + ' | ' + lo + ' vs ' + hi + ' | ' + G.length + ' | ' + pct(hw) + ' | ' + pct(ciLo) + ' – ' + pct(ciHi) + ' | ' + (ciLo >= 0.55 ? 'yes' : hw >= 0.55 ? 'point estimate only' : 'no') + ' | ' + pct(hiFirst.filter((r) => r.higherWon).length / hiFirst.length) + ' / ' + pct(loFirst.filter((r) => r.higherWon).length / loFirst.length) + ' | ' + pct(firstWins) + ' | ' + mean(chains).toFixed(1) + ' / ' + median(chains) + ' | ' + Object.entries(reasons).map(([k, v]) => k + ' ' + v).join(', ') + ' |');
  }
  L.push('');
  // search statistics
  L.push('## Search depth, exactness and time', '');
  L.push('Per searched move (Thoughtful and Sharp only). `exact` = the chosen move\'s evaluation was proven (immediate win, exact endgame, or a search with no heuristic leaf). Times are wall-clock milliseconds on this shared machine in synchronous mode; "over safeguard" counts moves that took longer than the level\'s elapsed safeguard (Thoughtful 100 ms, Sharp 250 ms; an exact attempt has its own 500 ms) and would have fallen back to the last completed depth with the safeguard on.', '');
  L.push('| band | level | moves | modes (search / exact / immediate / only move) | completed depth mean (search mode) | depth range | exact | nodes mean / max | ms median / p99 / max | over safeguard | exact attempts that hit the node ceiling |');
  L.push('|---|---|---:|---|---:|---|---:|---|---|---:|---:|');
  for (const band of BANDS) for (const level of ['thoughtful', 'sharp']) {
    const M = [];
    for (const r of results) if (r.band === band) for (const m of r.moves) if (m.level === level) M.push(m);
    if (!M.length) continue;
    const S = M.filter((m) => m.mode === 'search');
    const cnt = (k) => M.filter((m) => m.mode === k).length;
    const ms = M.map((m) => m.ms).sort((a, b) => a - b);
    const nodes = M.map((m) => m.nodes);
    const depths = S.map((m) => m.depth);
    L.push('| ' + band + ' | ' + level + ' | ' + M.length + ' | ' + [cnt('search'), cnt('exact'), cnt('immediate'), cnt('only-move')].join(' / ') + ' | ' + mean(depths).toFixed(2) + ' | ' + (depths.length ? Math.min(...depths) + '–' + Math.max(...depths) : '-') + ' | ' + pct(M.filter((m) => m.exact).length / M.length) + ' | ' + mean(nodes).toFixed(0) + ' / ' + Math.max(...nodes) + ' | ' + median(ms).toFixed(1) + ' / ' + ms[Math.floor(ms.length * 0.99)].toFixed(1) + ' / ' + ms[ms.length - 1].toFixed(1) + ' | ' + M.filter((m) => m.ms > SAFEGUARD[level] + (m.mode === 'exact' ? 500 : 0)).length + ' | ' + M.filter((m) => m.exactAborted === 'nodes').length + ' |');
  }
  L.push('');
  if (liveAll.length) {
    const lm = liveAll.flatMap((g) => g.moves.filter((m) => m.level === 'thoughtful' || m.level === 'sharp'));
    L.push('## Live driver check', '');
    L.push(liveAll.length + ' further Thoughtful–Sharp games were played with the real cooperative driver (yielding every 8 ms) and the elapsed safeguards on. Fallbacks: ' + lm.filter((m) => m.fallback).length + ' of ' + lm.length + ' searched moves (' + pct(lm.filter((m) => m.fallback).length / Math.max(1, lm.length)) + '); exact attempts stopped by time: ' + lm.filter((m) => m.exactAborted === 'time').length + '. These games depend on timing and are not part of the paired results.', '');
  }
  // openings
  L.push('## Opening-specific results', '');
  L.push('Per band and certified starter, over all three pairings: the higher level\'s share of wins and the first responder\'s share of wins. A starter whose first responder always (or never) wins regardless of level would indicate a forced opening.', '');
  for (const band of BANDS) {
    const G = results.filter((r) => r.band === band);
    if (!G.length) continue;
    const by = {};
    for (const r of G) (by[r.starter] = by[r.starter] || []).push(r);
    L.push('**' + band + '**: ' + Object.keys(by).sort().map((s) => '`' + s.slice(2) + '` ' + pct(by[s].filter((r) => r.higherWon).length / by[s].length) + ' / ' + pct(by[s].filter((r) => r.winnerSeat === 'first').length / by[s].length) + ' (' + by[s].length + ')').join(' · '), '');
  }
  L.push('## Seeds and records', '');
  L.push('Pair i uses strategy seed i+1 and starter `bank.starters[i mod n]` (n = 18 / 20 / 20 for the current banks); seats: `lo-first` then `hi-first`. Per-game records with every move\'s level, completed depth, exactness, mode and node count are in `docs/practice/shiritori_bench.json` (depth string: one token per move, `x` = exact, `i` = immediate win, `o` = only move, `c` = Casual).', '');
  const md = L.join('\n') + '\n';
  console.log(md);
  if (meta.write) {
    fs.writeFileSync(path.join(root, 'docs', 'practice', 'shiritori_bench.md'), md);
    const compact = results.map((r) => ({ b: r.band[0], p: r.pairing, i: r.pair, seed: r.seed, s: r.starter, o: r.order, w: r.winner, seat: r.winnerSeat, why: r.reason, chain: r.chain, d: r.moves.map((m) => (m.mode === 'casual' ? 'c' : m.mode === 'immediate' ? 'i' : m.mode === 'only-move' ? 'o' : m.depth + (m.exact ? 'x' : ''))).join('.') }));
    fs.writeFileSync(path.join(root, 'docs', 'practice', 'shiritori_bench.json'), JSON.stringify({ rev, generated: 'tools/shiritori_bench.mjs', summary, games: compact }) + '\n');
  }
}
