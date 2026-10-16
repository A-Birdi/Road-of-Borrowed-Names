// Checks the item icons (LI-2) without a browser: coverage for the given item-id prefixes, each icon's problems
// (src/ui/11_item_art.js problems()), fewer than three inks, and near-copies of any other icon (fewer than 12 pixels
// differ). tests/unit/item_art.test.mjs holds the same rules for every item.
// Usage: node tools/art/item_icons_check.mjs [rw,sg,cs]
import { load } from '../../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const A = RB.itemArt;
const pre = (process.argv[2] || '').split(',').filter(Boolean);
const items = Object.keys(RB.content.items).filter((id) => !pre.length || pre.includes(id.split('_')[0])).sort();
const missing = items.filter((id) => !A.has(id));
const pal = (id) => Object.assign({ o: A.OUT }, A.get(id).pal);
const pic = (id) => A.get(id).px.join('').split('').map((c) => (c === '.' ? '' : pal(id)[c]));
let bad = 0;
for (const id of items.filter((x) => A.has(x))) {
  const p = A.problems(id);
  const inks = new Set(pic(id).filter(Boolean)).size;
  if (inks < 3) p.push('only ' + inks + ' inks');
  if (p.length) { bad++; console.log('PROBLEM ' + id + ': ' + p.join('; ')); }
}
const all = A.ids().map((id) => [id, pic(id)]);
let near = 0;
for (const id of items.filter((x) => A.has(x))) {
  const me = pic(id);
  for (const [o, q] of all) {
    if (o === id) continue;
    let d = 0;
    for (let k = 0; k < 256 && d < 12; k++) if (me[k] !== q[k]) d++;
    if (d < 12) { near++; console.log('NEAR-COPY ' + id + ' ~ ' + o + ' (' + d + ' pixels differ)'); }
  }
}
console.log((items.length - missing.length) + ' of ' + items.length + ' items have icons' + (missing.length ? '; missing: ' + missing.join(', ') : '') + '; problems: ' + bad + '; near-copies: ' + near);
process.exit(missing.length || bad || near ? 1 : 0);
