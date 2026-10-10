// The combat rules keep every result they had before the encounter platform (expansion P04: "all existing combat
// results before feature activation"). tools/combat_golden.mjs recorded 1,710 battles (every creature alone and in its
// authored groups, every setting, alone and with each companion, both player models, one slip in four), each as its
// result and a hash of its round-by-round trace. A rule change that alters any of them fails here, by name.
import { load } from '../lib/load.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { cases } from '../../tools/combat_golden.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const was = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'combat_golden.json'), 'utf8')).cases;
  const now = cases(RB);
  t.eq(Object.keys(now).length, Object.keys(was).length, 'the same battles are played (' + Object.keys(was).length + ')');
  const differ = Object.keys(was).filter((k) => was[k] !== now[k]);
  t.eq(differ.slice(0, 12), [], 'every battle ends exactly as recorded (' + differ.length + ' differ)');
};
