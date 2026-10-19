// The route chart's coast (Robin, 2026-10-19: Saltglass, Sazanami and the places near them were drawn in the sea, so
// the road to Sazanami did not read as one you could walk): every place stands on land, north of the coast by more
// than its dot, but a place out at sea (Kotonoha), which sits on its own island with sea all round it; the curve drawn
// stays within a few units of the coast it is checked against.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const K = RB.ui.menu.chartCoast, P = RB.content.places;
  t.ok(K && K.COAST.length > 3, 'the chart has a coast');
  for (const id in P) {
    const [x, y] = P[id].pos;
    if (K.ISLES[id]) {
      const [rx, ry] = K.ISLES[id];
      const shore = Math.max(K.coastAt(x - rx), K.coastAt(x), K.coastAt(x + rx));
      t.ok(y - ry > shore + 2, id + ': an island, with sea between it and the coast (top ' + (y - ry) + ', coast ' + shore.toFixed(1) + ')');
    } else {
      t.ok(y <= K.coastAt(x) - 8, id + ' stands on land: ' + y + ' against the coast at ' + K.coastAt(x).toFixed(1));
    }
  }
  // the drawn curve, sampled, against the straight coast
  const nums = K.coastPath().replace(/[MC]/g, ' ').trim().split(/\s+/).map(Number);
  let worst = 0, at = null;
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const p0 = [nums[i - 2], nums[i - 1]], c1 = [nums[i], nums[i + 1]], c2 = [nums[i + 2], nums[i + 3]], p3 = [nums[i + 4], nums[i + 5]];
    for (let k = 0; k <= 20; k++) {
      const u = k / 20, v = 1 - u;
      const bx = v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p3[0];
      const by = v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p3[1];
      const d = Math.abs(by - K.coastAt(bx));
      if (d > worst) { worst = d; at = [bx.toFixed(1), by.toFixed(1)]; }
    }
  }
  t.ok(worst <= 3, 'the drawn coast stays within 3 units of the coast checked against (worst ' + worst.toFixed(2) + ' at ' + at + ')');
};
