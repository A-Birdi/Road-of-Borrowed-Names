// Every Japanese line in the expansion's new content has a self-review entry (docs/review/language/; C-26).
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';
import { lines } from '../../tools/review_ledger.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const L = lines(RB);
  const led = {};
  const missing = [];
  for (const l of L) {
    if (!led[l.prefix]) { const f = path.join(root, 'docs', 'review', 'language', l.prefix + '.json'); led[l.prefix] = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; }
    const e = led[l.prefix][l.key];
    if (!e || e.status !== 'self-reviewed' || !e.ref) missing.push(l.key);
  }
  t.ok(!missing.length, missing.length + ' new-content lines without a self-review entry: ' + missing.slice(0, 8).join(', '));
  t.ok(!JSON.stringify(led).includes('native-reviewed'), 'no entry claims a native review');
};
