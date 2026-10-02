// Prints the Creatures B audit table, the delivery timing tables and the pixel budget as
// Markdown, from the game's own registries (for docs/battle/creatures_b.md).
// Usage: node tools/creatures_b_audit.mjs [--json]
import { load } from '../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const CB = RB.creaturesB, EA = RB.enemyArt, Q = RB.battleSeq;
const rows = CB.auditRows();
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
const esc = (s) => String(s).replace(/\|/g, '\\|');
const out = [];
out.push('### Audit (every enemy id of these families)\n');
out.push('| Enemy | Family · options | Native frame · anchor | Idle | Moves → authored acts (frames) | Condition overlays | Reaction poses | Settle | Disposition |');
out.push('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  const opts = Object.keys(r.opts).length ? Object.entries(r.opts).map(([k, v]) => k + '=' + v).join(' ') : '—';
  const moves = r.moves.map((m) => '**' + m.kind + '** ' + (m.kind === 'rest' ? 'rest×4 (answered: prep → balk)' : m.acts.join(' '))).join('<br>');
  out.push('| `' + r.id + '` ' + esc(r.name) + (r.boss ? ' (guardian)' : '') + ' | ' + r.art + ' · ' + esc(opts) + ' | ' + r.frame + ' · ' + esc(r.anchor) + ' | ' + esc(r.idle) + ' | ' + moves + ' | ' + esc(r.overlays.join('; ')) + ' | ' + r.reactions.join(' ') + ' | ' + esc(r.settle) + ' | **' + r.disposition + '** — ' + esc(r.note) + ' |');
}
out.push('\n### Families: anatomy and palette\n');
out.push('| Family | Anatomy | Material palette |');
out.push('|---|---|---|');
for (const id of CB.FAMILIES) { const F = CB.FAMILY[id] || {}; out.push('| ' + id + ' | ' + esc(F.anatomy || '') + ' | ' + esc(F.palette || '') + ' |'); }

// delivery timings: the cues a move produces at Normal speed (Strike aimed at you; Sweep at both)
out.push('\n### Delivery timings (Normal speed, presentation ms from the move\'s start)\n');
out.push('Foe cues are `act start–end`; *contact* is when the sequencer places the first rules result (a second recipient follows 120 ms later); *end* is the end of the creature\'s own performance (the action interval).\n');
out.push('| Family | Move | Foe cues | Effects (start–end) | Contact | End |');
out.push('|---|---|---|---|---|---|');
const SINGLE = { strike: 1, lie: 1, mirror: 1, chill: 1 };
const fxFor = (kind) => (SINGLE[kind] ? [{ t: 'hit', who: 'pc', n: 2 }] : kind === 'sweep' || kind === 'flood' ? [{ t: 'hit', who: 'pc', n: 1 }, { t: 'hit', who: 'comp', n: 1 }] : kind === 'gust' ? [{ t: 'stripWard' }, { t: 'hit', who: 'pc', n: 1 }] : [{ t: kind === 'heat' ? 'heat' : kind, n: 1 }]);
const view = { pc: 10, comp: 10, max: 10, ward: { pc: 0, comp: 0 }, foes: [{ knots: 2, maxKnots: 4 }], cur: 0, knots: 2, maxKnots: 4 };
const famMoves = {};
for (const r of rows) for (const m of r.moves) if (m.kind !== 'rest') (famMoves[r.art] = famMoves[r.art] || new Set()).add(m.kind);
famMoves.spirit = new Set(['strike', 'sweep', 'heat']);
for (const art of CB.FAMILIES) {
  for (const kind of [...(famMoves[art] || [])].sort()) {
    const E = Q.choreo.enemy({ kind, target: 'pc' }, fxFor(kind), { comp: 'mio', reduce: false, view: JSON.parse(JSON.stringify(view)), group: false, foe: 0, art, aim: SINGLE[kind] ? 'pc' : null });
    const foes = E.cues.filter((c) => c.type === 'foe').map((c) => c.act + ' ' + c.at + '–' + (c.at + c.d) + (c.travel ? ' (travel ' + c.travel.shape + ' ' + c.travel.peak + ')' : ''));
    const fx = E.cues.filter((c) => c.type === 'fx' && /^cb[A-Z]/.test(c.name)).map((c) => c.name + ' ' + c.at + '–' + (c.at + c.d));
    const beat = E.cues.find((c) => c.type === 'beat');
    out.push('| ' + art + ' | ' + kind + ' | ' + foes.join('<br>') + ' | ' + fx.join('<br>') + ' | ' + (beat ? beat.at : '—') + ' | ' + E.end + ' |');
  }
}
// the sequencer's own rest / answered-move / reaction timings (fixed): listed once
out.push('\nReactions placed by the sequencer use the family\'s authored poses: `rest` 700 ms (4 poses), an answered move `prep` 320 ms → `balk` 380 ms, `recoil` 260–360 ms, `release` 420–500 ms, `settle` 760 ms (held).\n');

// pixel budget
out.push('\n### Native frames and estimated resident pixels (w × h × 4 × frames)\n');
out.push('| Family | Frame | Idle frames | Authored action frames | One frame | Idle set | Every frame |');
out.push('|---|---|---|---|---|---|---|');
const KiB = 1024, MiB = 1024 * 1024;
let sumAll = 0, maxF = 0;
for (const id of CB.FAMILIES) {
  const b = CB.budget(id);
  sumAll += b.bytesAll; maxF = Math.max(maxF, b.w * b.h * 4);
  out.push('| ' + id + ' | ' + b.w + '×' + b.h + ' | ' + b.idle + ' | ' + b.acts + ' | ' + (b.w * b.h * 4 / KiB).toFixed(0) + ' KiB | ' + (b.bytesIdle / MiB).toFixed(2) + ' MiB | ' + (b.bytesAll / MiB).toFixed(2) + ' MiB |');
}
out.push('\nEvery frame of every family at once would be ' + (sumAll / MiB).toFixed(1) + ' MiB, but RB.enemyArt keeps at most 140 canvases (least recently used first out): at the largest frame that is ' + (140 * maxF / MiB).toFixed(1) + ' MiB, inside the 48 MiB budget, and an encounter uses only its own creatures\' idle sets plus the moves they perform.');
console.log(out.join('\n'));
