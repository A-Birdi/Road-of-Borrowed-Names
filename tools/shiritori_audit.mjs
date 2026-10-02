// Shiritori bank certification audits (Practice addendum §11.3).
//
//   node tools/shiritori_audit.mjs            writes docs/practice/shiritori_banks/<bank>.md for
//                                             pocket, everyday and extended, and prints a summary
//   node tools/shiritori_audit.mjs --check    the same checks, no files written (exit 1 on failure)
//
// Every figure is computed here from the bank's reading edges with this tool's own
// loops (not the engine's search code), then compared with the engine: its repeat-
// groups (RB.shiritori.buildBank) and its starter certification
// (RB.shiritori.ai.certifyStarters). Certification means: the bank has its target
// number of repeat-groups (or is reported incomplete), no non-ん word's ending lacks a
// safe reply in the initial bank, and at least twelve stored starters each have four
// or more safe initial responses and no forced terminal win within two plies under
// exhaustive shallow search. It is not a proof that either seat can force a win.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load, root } from '../tests/lib/load.mjs';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
const SH = RB.shiritori;
const OUTDIR = path.join(root, 'docs', 'practice', 'shiritori_banks');
const EXCL = path.join(OUTDIR, 'exclusions.json');
const exclusions = fs.existsSync(EXCL) ? JSON.parse(fs.readFileSync(EXCL, 'utf8')) : { candidates: [] };
let rev = 'unknown';
try { rev = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim(); } catch (e) { /* not a checkout */ }

// ---- independent graph helpers ------------------------------------------------------------
function graph(b) {
  const safe = b.edges.filter((e) => !e.terminal);
  const startsWith = {}; // kana -> Set(group)
  for (const e of safe) (startsWith[e.head] = startsWith[e.head] || new Set()).add(e.group);
  const endsWith = {};   // kana -> Set(group) of non-ん words ending there
  for (const e of safe) (endsWith[e.tail] = endsWith[e.tail] || new Set()).add(e.group);
  return { safe, startsWith, endsWith };
}
const repliesExcept = (G, kana, group) => Array.from(G.startsWith[kana] || []).filter((g) => g !== group);
function movesFrom(G, used, kana) { return G.safe.filter((e) => e.head === kana && !used.has(e.group)); }
function shallow(G, starter) {
  const used = new Set([starter.group]);
  const A = movesFrom(G, used, starter.tail);
  const replies = new Set(A.map((e) => e.group)).size;
  let aWin = false, bForced = A.length > 0, exposure = 0;
  for (const a of A) {
    used.add(a.group);
    const B = movesFrom(G, used, a.tail);
    if (!B.length) aWin = true;
    let kill = false;
    for (const r of B) { used.add(r.group); if (!movesFrom(G, used, r.tail).length) kill = true; used.delete(r.group); if (kill) break; }
    if (kill) exposure++; else bForced = false;
    used.delete(a.group);
  }
  return { replies, aWin, bForced, exposure, ok: replies >= 4 && !aWin && !bForced };
}
const kanaOrder = (a, b) => a.localeCompare(b, 'ja');
const word = (b, id) => { const e = b.entryById[id]; return e ? e.display.jp.replace(/\{([^|}]*)\|([^}]*)\}/g, '$1') + '（' + SH.readingsOf(e).join('・') + '）' : id; };
const groupLabel = (b, gid) => b.groups[gid].entries.map((id) => word(b, id)).join(' / ');

function audit(id) {
  const b = SH.bank(id);
  const fails = [];
  if (!b) return { id, fails: ['bank missing'], md: '' };
  const G = graph(b);
  const target = (b.meta && b.meta.target) || 0;
  // groups recomputed independently: entries joined by declared repeatGroup and by identical reading
  const parent = {};
  const find = (x) => { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; };
  const uni = (x, y) => { x = find(x); y = find(y); if (x !== y) parent[x] = y; };
  for (const e of b.entries) { parent['e:' + e.id] = 'e:' + e.id; const rg = 'g:' + (e.repeatGroup || e.id); parent[rg] = parent[rg] || rg; uni('e:' + e.id, rg); for (const r of SH.readingsOf(e)) { const k = 'r:' + r; parent[k] = parent[k] || k; uni('e:' + e.id, k); } }
  const myGroups = new Set(b.entries.map((e) => find('e:' + e.id)));
  if (myGroups.size !== b.groupCount) fails.push('repeat-group count differs from the engine: ' + myGroups.size + ' vs ' + b.groupCount);
  for (const e of b.entries) for (const f of b.entries) if (e.id < f.id && (find('e:' + e.id) === find('e:' + f.id)) !== (b.groupOf[e.id] === b.groupOf[f.id])) fails.push('grouping of ' + e.id + ' and ' + f.id + ' differs from the engine');
  if (b.problems.length) fails.push(...b.problems.map((p) => 'entry problem: ' + p));
  const readings = b.edges.length;
  const aliases = b.entries.reduce((n, e) => n + e.forms.filter((f) => SH.norm(f) !== SH.norm(SH.readingsOf(e)[0])).length, 0);
  const kinds = {}, themes = {};
  for (const e of b.entries) { kinds[e.nounKind] = (kinds[e.nounKind] || 0) + 1; for (const t of e.themes || []) themes[t] = (themes[t] || 0) + 1; }
  const terminalGroups = Object.values(b.groups).filter((g) => g.terminal).length;
  const homophoneGroups = Object.values(b.groups).filter((g) => g.entries.length > 1);
  // closure: every non-ん word's tail has a safe reply from another group
  const deadEnds = G.safe.filter((e) => !repliesExcept(G, e.tail, e.group).length);
  if (deadEnds.length) fails.push('non-ん dead-end endings: ' + deadEnds.map((e) => e.entry + '→' + e.tail).join(', '));
  if (b.groupCount < target) fails.push('incomplete: ' + b.groupCount + ' of ' + target + ' repeat-groups');
  // per-boundary table
  const kanaSet = new Set();
  for (const e of b.edges) { kanaSet.add(e.head); if (!e.terminal) kanaSet.add(e.tail); }
  const rows = Array.from(kanaSet).sort(kanaOrder).map((k) => {
    const starts = G.startsWith[k] ? G.startsWith[k].size : 0;
    const ends = G.endsWith[k] ? G.endsWith[k].size : 0;
    const outTails = new Set(G.safe.filter((e) => e.head === k).map((e) => e.tail)).size;
    const nWords = new Set(b.edges.filter((e) => e.head === k && e.terminal).map((e) => e.group)).size;
    return { k, starts, ends, outTails, nWords };
  });
  const endings = rows.filter((r) => r.ends > 0);
  const one = endings.filter((r) => r.starts === 1), two = endings.filter((r) => r.starts === 2), more = endings.filter((r) => r.starts > 2);
  // fragile loops: a self-loop word on a low-reply kana, or a low-reply ending whose
  // every reply leads to another low-reply ending
  const low = new Set(endings.filter((r) => r.starts <= 2).map((r) => r.k));
  const fragile = [];
  for (const r of endings.filter((x) => low.has(x.k))) {
    const outs = G.safe.filter((e) => e.head === r.k);
    if (outs.some((e) => e.tail === r.k)) fragile.push(r.k + ' (a word starting and ending in ' + r.k + ': ' + outs.filter((e) => e.tail === r.k).map((e) => word(b, e.entry)).join(', ') + ')');
    else if (outs.length && outs.every((e) => low.has(e.tail))) fragile.push(r.k + ' → ' + Array.from(new Set(outs.map((e) => e.tail))).join('/') + ' (every reply ends on another one- or two-reply kana)');
  }
  const concentration = endings.filter((r) => r.ends >= 2 * r.starts && r.starts <= 3).map((r) => r.k + ' (' + r.ends + ' words end here, ' + r.starts + ' start here)');
  // starters
  const all = G.safe.map((e) => Object.assign({ e }, shallow(G, e)));
  const certified = all.filter((x) => x.ok);
  const engine = SH.ai.certifyStarters(b);
  const engineOk = new Set(engine.filter((x) => x.ok).map((x) => x.edge));
  const mismatch = all.filter((x) => x.ok !== engineOk.has(x.e.id));
  if (mismatch.length) fails.push('starter certification differs from the engine for ' + mismatch.map((x) => x.e.id).join(', '));
  const stored = b.starters.map((s) => { const e = b.edges.find((x) => x.entry === s || x.id === s); const r = e ? shallow(G, e) : null; return { s, e, r }; });
  for (const x of stored) if (!x.r || !x.r.ok) fails.push('stored starter ' + x.s + ' is not certified');
  if (stored.filter((x) => x.r && x.r.ok).length < 12) fails.push('fewer than 12 certified stored starters');
  const exl = (exclusions.candidates || []).filter((x) => !b.entryById[x.id]);

  const L = [];
  L.push('# Shiritori bank audit: ' + (b.title ? b.title.en : id) + ' (`' + id + '`)', '');
  L.push('Generated by `node tools/shiritori_audit.mjs` from the source at `' + rev + '` (plus any uncommitted edits at that time). Rules `' + b.rules + '`, bank version ' + b.version + ', content hash `' + b.hash + '`.', '');
  L.push('**Certification: ' + (fails.length ? 'FAILED' : 'passed') + '.** ' + (fails.length ? fails.join('; ') : 'Target size, initial-bank closure and the shallow opening checks hold. This is not a proof that either seat can force a win, and it is not native-speaker review.'), '');
  L.push('## Counts', '');
  L.push('| Measure | Value |', '|---|---:|');
  L.push('| Repeat-groups (target ' + target + ') | ' + b.groupCount + (b.groupCount >= target ? '' : ' (incomplete)') + ' |');
  L.push('| Entries (senses) | ' + b.entries.length + ' |');
  L.push('| Accepted readings (reading edges) | ' + readings + ' |');
  L.push('| Spelling aliases (approved forms other than the kana reading) | ' + aliases + ' |');
  L.push('| Groups whose every reading ends in ん (losing words) | ' + terminalGroups + ' |');
  L.push('| Groups joining homophone senses | ' + homophoneGroups.length + ' |');
  L.push('| Distinct starting kana / non-ん ending kana | ' + rows.filter((r) => r.starts).length + ' / ' + endings.length + ' |');
  L.push('| Noun kinds | ' + Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ') + ' |');
  L.push('| Documented exclusions (candidates not in this bank) | ' + exl.length + ' |', '');
  L.push('Themes: ' + Object.entries(themes).sort((a, b2) => b2[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', ') + '.', '');
  if (homophoneGroups.length) L.push('Homophone groups (one use per match): ' + homophoneGroups.map((g) => g.entries.map((x) => word(b, x)).join(' + ')).join('; ') + '.', '');
  L.push('## Replies per boundary kana (initial bank)', '');
  L.push('`start` = repeat-groups with a safe (non-ん) reading starting with the kana; `end` = non-ん groups ending on it; `tails` = distinct endings reachable from it; `ん` = losing words starting with it.', '');
  L.push('| kana | start | end | tails | ん |', '|---|---:|---:|---:|---:|');
  for (const r of rows) L.push('| ' + r.k + ' | ' + r.starts + ' | ' + r.ends + ' | ' + r.outTails + ' | ' + r.nWords + ' |');
  L.push('');
  L.push('## Closure', '');
  L.push(deadEnds.length ? 'Non-ん words with no safe reply: ' + deadEnds.map((e) => word(b, e.entry)).join(', ') + '.' : 'No non-ん word ends on a kana without a safe reply from another repeat-group. (Depletion traps later in a game are legitimate.)', '');
  L.push('- Endings with exactly one reply (' + one.length + '): ' + (one.map((r) => r.k + ' ← ' + Array.from(G.startsWith[r.k]).map((g) => groupLabel(b, g)).join('')).join('; ') || 'none') + '.');
  L.push('- Endings with two replies (' + two.length + '): ' + (two.map((r) => r.k).join(' ') || 'none') + '.');
  L.push('- Endings with more than two replies (' + more.length + '): ' + (more.map((r) => r.k).join(' ') || 'none') + '.');
  L.push('- Fragile loops: ' + (fragile.join('; ') || 'none') + '.');
  L.push('- High-concentration targets (at least twice as many words end on the kana as start with it, and three or fewer start with it): ' + (concentration.join('; ') || 'none') + '.', '');
  L.push('## Starters', '');
  L.push(certified.length + ' of ' + all.length + ' non-ん readings would qualify as certified starters; the engine agrees on ' + (all.length - mismatch.length) + ' of ' + all.length + '. Stored starters (' + stored.length + '):', '');
  L.push('| starter | tail | safe responses | responder wins at once | forced win at ply 2 | responses exposing a ply-2 trap |', '|---|---|---:|---|---|---:|');
  for (const x of stored) L.push('| ' + word(b, x.e ? x.e.entry : x.s) + ' | ' + (x.e ? x.e.tail : '?') + ' | ' + (x.r ? x.r.replies : '-') + ' | ' + (x.r ? (x.r.aWin ? 'yes' : 'no') : '-') + ' | ' + (x.r ? (x.r.bForced ? 'yes' : 'no') : '-') + ' | ' + (x.r ? x.r.exposure : '-') + ' |');
  L.push('');
  L.push('Seat advantage from these openings is not proven here (full-bank search is not exhaustive); see docs/practice/shiritori_bench.md for measured results by seat.', '');
  if (exl.length) {
    L.push('## Documented exclusions', '');
    const byWhy = {};
    for (const x of exl) (byWhy[x.why] = byWhy[x.why] || []).push(x.reading);
    for (const w of Object.keys(byWhy).sort()) L.push('- ' + w + ' (' + byWhy[w].length + '): ' + byWhy[w].join('、') + '.');
    L.push('');
  }
  return { id, fails, md: L.join('\n'), summary: { groups: b.groupCount, target, entries: b.entries.length, readings, aliases, terminalGroups, deadEnds: deadEnds.length, one: one.length, two: two.length, certified: certified.length, stored: stored.length, hash: b.hash } };
}

let bad = 0;
for (const id of ['pocket', 'everyday', 'extended']) {
  const r = audit(id);
  console.log(id.padEnd(9), JSON.stringify(r.summary), r.fails.length ? 'FAIL: ' + r.fails.join('; ') : 'certified');
  if (r.fails.length) bad++;
  if (!checkOnly && r.md) { fs.mkdirSync(OUTDIR, { recursive: true }); fs.writeFileSync(path.join(OUTDIR, id + '.md'), r.md + '\n'); }
}
// nesting
const P = SH.bank('pocket'), E = SH.bank('everyday'), X = SH.bank('extended');
if (P && E && X) {
  const sub = (a, b) => a.entries.every((e) => b.entryById[e.id]);
  const nested = sub(P, E) && sub(E, X);
  console.log('nested Pocket ⊆ Everyday ⊆ Extended:', nested);
  if (!nested) bad++;
  const nn = ['のり', 'のど'].every((r) => P.edges.some((e) => e.reading === r && !e.terminal));
  console.log('Pocket has のり and のど:', nn);
  if (!nn) bad++;
}
process.exit(bad ? 1 : 0);
