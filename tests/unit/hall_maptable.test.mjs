// RBN-QA-166 A (Agnes 6375876823; Local CL-252; Cloud CC-155 §5): the first wing's companion-map trial (hall.w1.t6)
// says "On the stone table, an old map", but the station was a plain wooden table with nothing on it. In node:
//  1. one map table, at the trial's own place (hall.w1f2 26,22), with its scene; the same footprint and block as the
//     plain table it replaces; no other map has it;
//  2. the map shows no spring until the trial is done; then one mark, where the floor's pattern puts the spring (the
//     top right for pattern 0, the bottom left for pattern 1), as the scene's answer says (the flat renderer; the drawn
//     art reads the same condition).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, P = RB.props.P, MT = P.hall_maptable || {}; // (on a build without it, the checks fail, not throw)
  const all = Object.entries(C.maps).flatMap(([m, d]) => (d.props || []).filter((p) => p.p === 'hall_maptable').map((p) => [m, p]));
  const [m, pr] = all[0] || [];
  t.ok(all.length === 1 && m === 'hall.w1f2' && pr.x === 26 && pr.y === 22 && pr.scene === 'hall.w1.t6' && pr.o.wing === 'w1' && pr.o.trial === 't6',
    'one map table, at the trial\'s place with its scene (' + all.map(([a, b]) => a + '@' + b.x + ',' + b.y).join(' ') + ')');
  t.ok(MT.w === P.table.w && (MT.h || 1) === (P.table.h || 1) && MT.block === P.table.block && typeof MT.draw2 === 'function',
    'the same footprint and block as the plain table (' + JSON.stringify({ w: MT.w, block: MT.block }) + ')');
  t.ok(!(C.maps['hall.w1f2'].props || []).some((p) => p.p === 'table' && p.x === 26 && p.y === 22), 'no plain table left under it');
  // 2.
  const marks = (done, pat) => {
    if (!MT.draw || !pr) return 'no map table';
    const s = RB.state.newCampaign({ edition: 2 }); RB.game.G.s = s;
    const r = RB.hall.wrec(s, 'w1'); r.pat = pat; if (done) r.trials.t6 = true;
    const fills = [];
    const ctx = { set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; }, fillRect(x, y) { fills.push([this._f, x, y]); } };
    MT.draw(ctx, 0, 0, { wood: ['#000', '#111', '#222', '#333'], stone: ['#000', '#111', '#222', '#333'] }, 0, pr.o);
    const m = fills.filter((f) => f[0] === '#a8322a');
    return m.length ? (m[0][1] > 16 ? 'top right' : 'bottom left') : 'none';
  };
  t.eq([marks(false, 0), marks(false, 1), marks(true, 0), marks(true, 1)], ['none', 'none', 'top right', 'bottom left'],
    'no spring marked before the trial; after it, one mark where the pattern puts it');
};
