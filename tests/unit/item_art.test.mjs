// Item icons (LI-2, src/ui/11_item_art.js; drawings in src/content/item_art/): every item has its own 16×16 authored
// pixel table, well formed (16 rows of 16, every character in its palette, real colours), drawn with enough of a
// palette to read (at least three inks), and unique: no two items share a picture, and none is a near-copy of another.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const A = RB.itemArt;
  t.ok(A && typeof A.def === 'function', 'RB.itemArt exists');
  const items = Object.keys(RB.content.items);
  const missing = items.filter((id) => !A.has(id));
  t.ok(!missing.length, 'every item has its own icon (' + (items.length - missing.length) + ' of ' + items.length + '; missing: ' + missing.join(', ') + ')');
  const stray = A.ids().filter((id) => !RB.content.items[id]);
  t.ok(!stray.length, 'every icon belongs to an item: ' + stray.join(', '));
  const bad = A.ids().map((id) => [id, A.problems(id)]).filter(([, p]) => p.length);
  t.ok(!bad.length, 'every icon is well formed: ' + bad.slice(0, 8).map(([id, p]) => id + ': ' + p.join('; ')).join(' | '));
  // inks: the colours actually used (not counting transparency)
  const colours = (id) => { const a = A.get(id), pal = Object.assign({ o: A.OUT }, a.pal); return new Set(a.px.join('').split('').filter((c) => c !== '.').map((c) => pal[c])); };
  const flat = A.ids().filter((id) => colours(id).size < 3);
  t.ok(!flat.length, 'every icon uses at least three inks: ' + flat.join(', '));
  // unique: compare the pictures as colours per pixel; a near-copy differs in fewer than 12 pixels
  const pic = (id) => { const a = A.get(id), pal = Object.assign({ o: A.OUT }, a.pal); return a.px.join('').split('').map((c) => (c === '.' ? '' : pal[c])); };
  const all = A.ids().map((id) => [id, pic(id)]);
  const near = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    let d = 0;
    for (let k = 0; k < 256 && d < 12; k++) if (all[i][1][k] !== all[j][1][k]) d++;
    if (d < 12) near.push(all[i][0] + '~' + all[j][0] + ' (' + d + ')');
  }
  t.ok(!near.length, 'no two items share a picture or nearly so: ' + near.slice(0, 10).join(', '));
};
