// Creatures A: the timing table of every family's delivery, generated from the deliveries
// themselves (Normal speed, presentation ms). Not a test (run-unit only runs *.test.mjs).
// Usage: node tests/unit/creatures_a_timing.mjs [--md]
import { load } from '../lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const A = RB.creaturesA, Q = RB.battleSeq;
const RESULT = { strike: [{ t: 'hit', who: 'pc', n: 2 }], lie: [{ t: 'hit', who: 'pc', n: 2 }], mirror: [{ t: 'hit', who: 'pc', n: 2 }], chill: [{ t: 'hit', who: 'pc', n: 2 }], sweep: [{ t: 'hit', who: 'pc', n: 2 }, { t: 'hit', who: 'comp', n: 2 }], flood: [{ t: 'hit', who: 'pc', n: 2 }, { t: 'hit', who: 'comp', n: 2 }], gust: [{ t: 'stripWard' }, { t: 'hit', who: 'pc', n: 2 }], heat: [{ t: 'heat', n: 1 }], shroud: [{ t: 'shroud' }], charge: [{ t: 'charge' }], mend: [{ t: 'mend' }], silence: [{ t: 'silence' }], plea: [{ t: 'plea' }] };
const SINGLE = { strike: 1, lie: 1, mirror: 1, chill: 1 };
const used = {};
for (const id of Object.keys(A.audit.enemies)) {
  const e = RB.content.enemies[id], ks = new Set();
  const add = (k) => ks.add(String(k).split(':')[0]);
  (e.pattern || []).forEach(add); (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add)); Object.keys(e.intents || {}).forEach(add);
  for (const k of ks) if (k !== 'rest') (used[e.art] = used[e.art] || new Set()).add(k);
}
const rows = [];
for (const art of A.FAMILIES) for (const kind of [...(used[art] || [])].sort()) {
  const fam = SINGLE[kind] ? 'strike' : kind === 'sweep' || kind === 'flood' || kind === 'gust' ? 'sweep' : 'cast';
  const D = Q.deliveryOf(art, kind, fam);
  const variants = SINGLE[kind] ? [['hit', RESULT[kind], false], ['ward', [{ t: 'countered', kind }], true], ['softened', [{ t: 'block', who: 'pc', n: 1 }, { t: 'hit', who: 'pc', n: 1 }], false]] : [['', RESULT[kind], false]];
  for (const [vn, fx, ward] of variants) {
    const r = D({ kind, fam, me: 0, aimed: 'pc', dir: SINGLE[kind] ? 'pc' : fam === 'sweep' ? 'party' : null, fv: { knots: 2, maxKnots: 3 }, comp: 'mio', countered: ward, wardBlock: ward, ctx: { reduce: false, view: {}, foeCol: '#888' }, T: Q.T, foeCue: (o) => Object.assign({ type: 'foe', foe: 0 }, o), fx });
    const foe = r.cues.filter((c) => c.type === 'foe').map((c) => c.at + '–' + (c.at + c.d) + ' ' + c.act + (c.family ? '.' + c.family : '') + (c.travel ? ' (' + c.travel.shape + ' → ' + c.travel.to + (c.travel.peak ? ' ' + c.travel.peak : '') + (c.travel.arc ? ', arc ' + c.travel.arc : '') + ')' : '')).join('; ');
    const efx = r.cues.filter((c) => c.type === 'fx').map((c) => c.name + '@' + c.at).join(', ');
    rows.push({ art, kind: kind + (vn ? ' (' + vn + ')' : ''), contact: r.contact, end: r.end, foe, efx });
  }
}
if (process.argv.includes('--md')) {
  console.log('| Family | Move | Contact | End | Creature cues (ms, act.frame-set, travel) | Effects (name@ms) |');
  console.log('|---|---|---:|---:|---|---|');
  for (const r of rows) console.log('| ' + r.art + ' | ' + r.kind + ' | ' + r.contact + ' | ' + r.end + ' | ' + r.foe + ' | ' + r.efx + ' |');
} else for (const r of rows) console.log(r.art.padEnd(10), r.kind.padEnd(18), String(r.contact).padStart(5), String(r.end).padStart(5), ' ', r.foe);
