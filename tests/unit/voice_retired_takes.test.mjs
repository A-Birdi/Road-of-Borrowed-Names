// Takes on the review list whose line has since left the game's script (Agnes 6355139781; Local CL-237): RV0047 retires
// Nao's first co.b_nao4 line, which has a take (r1-f25c42a39756bbfb). The listening page takes each take's English from
// the current script by the line's key, so without more it would show that take with no English. A small data file,
// docs/future/voice/production/run/RETIRED_TAKES.json, keeps each retired take's words as recorded, pinned to the
// batch's source revision; tools/voice/review_page.mjs uses it only when a take's key no longer resolves, and marks the
// take retired and unused. No audio is changed, made or re-keyed. In node:
//  1. the file's schema; each retired take is on the review list, and none of its line keys resolves in the script now;
//     each keeps those keys, as on the review list, for tracing;
//  2. the committed page shows each retired take with its English as recorded and marked retired (the revision, why);
//  3. no other take is marked retired, and every take whose key resolves shows the script's English, exactly.
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../lib/load.mjs';

export default async (t) => {
  const P = (...a) => path.join(root, ...a);
  const rt = JSON.parse(fs.readFileSync(P('docs/future/voice/production/run/RETIRED_TAKES.json'), 'utf8'));
  const list = JSON.parse(fs.readFileSync(P('docs/future/voice/production/run/REVIEW_LIST.json'), 'utf8'));
  const items = new Map();
  for (const g of list.groups || []) for (const it of g.items || []) items.set(it.id, it);
  globalThis.__RB_TEST__ = true;
  const { allLines } = await import('../../tools/voice/lines.mjs');
  const keys = new Set(allLines().map((l) => l.key));
  // ---- 1.
  t.ok(rt.schema === 'rbn.voice.retired-takes/1' && Array.isArray(rt.retired) && rt.retired.length >= 1 && rt.retired.every((r) => r.id && /^[0-9a-f]{40}$/.test(r.sourceRevision || '') && r.en && r.retiredBy),
    'the retired takes: schema, each with its id, a full source revision, its English and why (' + rt.retired.map((r) => r.id).join(', ') + ')');
  const bad = rt.retired.filter((r) => { const it = items.get(r.id); return !it || (it.lineKeys || []).some((k) => keys.has(k)); });
  t.eq(bad.map((r) => r.id), [], 'each is on the review list, and none of its line keys resolves in the script now');
  // (the keys it was recorded under, kept with it for tracing; Local CL-246)
  const untraced = rt.retired.filter((r) => JSON.stringify(r.lineKeys || null) !== JSON.stringify((items.get(r.id) || {}).lineKeys || []));
  t.eq(untraced.map((r) => r.id), [], 'each keeps the line keys it was recorded under, as on the review list (' + rt.retired.map((r) => (r.lineKeys || []).join(',')).join(' ') + ')');
  t.ok(rt.retired.some((r) => r.id === 'r1-f25c42a39756bbfb' && /RV0047/.test(r.retiredBy) && /^Heard about the bell\?/.test(r.en)), 'Nao\'s retired bell line is kept with the English it was recorded with');
  // ---- 2. and 3.
  const html = fs.readFileSync(P('docs/future/voice/production/run/REVIEW_LISTENING.html'), 'utf8');
  const page = JSON.parse(html.match(/<script type="application\/json" id="list">([\s\S]*?)<\/script>/)[1]);
  const shown = page.groups.flatMap((g) => g.items);
  const byId = new Map(rt.retired.map((r) => [r.id, r]));
  const marked = shown.filter((x) => x.retired);
  const wrong = marked.filter((x) => { const r = byId.get(x.id); return !r || x.en !== r.en || x.retired.rev !== r.sourceRevision.slice(0, 7) || x.retired.by !== r.retiredBy; });
  t.ok(marked.length >= rt.retired.length && wrong.length === 0 && rt.retired.every((r) => marked.some((x) => x.id === r.id)), 'the page shows each retired take with its recorded English, marked retired with the revision and why (' + marked.length + ' listings)');
  t.ok(/Retired · unused/.test(html), 'and the card says so: "Retired · unused"');
  const others = shown.filter((x) => !byId.has(x.id));
  t.ok(others.every((x) => !x.retired), 'no other take is marked retired (' + others.length + ' listings)');
  // (the current words win: a take whose line is in the script shows that line's English exactly; Agnes 6374203241)
  const line = new Map(allLines().map((l) => [l.key, l]));
  const live = shown.filter((x) => (items.get(x.id) || {}).lineKeys && items.get(x.id).lineKeys.some((k) => line.has(k)));
  const off = live.filter((x) => x.en !== line.get(items.get(x.id).lineKeys.find((k) => line.has(k))).en);
  t.ok(live.length > 100 && off.length === 0, 'every take whose line is in the script shows that line\'s English (' + live.length + ' listings' + (off.length ? '; not: ' + off.slice(0, 3).map((x) => x.id).join(', ') : '') + ')');
};
