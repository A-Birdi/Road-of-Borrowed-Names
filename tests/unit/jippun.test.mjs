// 十分 read じゅっぷん, "ten minutes", was glossed "enough" in Word Help: the lexicon's only 十分 was じゅうぶん. Inventory
// first (Agnes 6353888589; Local CL-234, CL-235): of every number + 分 in the game's Japanese, only these were wrong. One
// lexicon entry, 十分 じゅっぷん "ten minutes"; the lookup takes the entry whose reading matches. In node, at every place in
// src/ where 十分 is written (scenes, challenges, drills, the atlas sign): read じゅっぷん, "ten minutes"; read じゅうぶん,
// "enough"; and the other number + 分 words read as before (minutes, fifteen minutes; Tamotsu's fraction).
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const look = (jp, w) => { const tk = RB.jp.render(jp, { spacing: true, vars: {}, furigana: true }).tokens; const x = tk.find((k) => k.surface === w); return x ? RB.jp.lookup(x) : null; };
  // every Japanese string in src/ that writes a number + 分 with its reading, from the source itself
  const found = [];
  const scan = (dir) => { for (const f of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, f.name); if (f.isDirectory()) scan(p); else if (/\.js$/.test(f.name)) for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/\{([一二三四五六七八九十百千何]+分)\|([^}]+)\}/g); if (m) for (const g of m) found.push({ file: path.relative(root, p), line: l, g }); } } };
  scan(path.join(root, 'src'));
  // (each word looked up alone: its reading decides these, not its neighbours)
  const rows = found.map((f) => { const [, w, r] = f.g.match(/\{(.+)\|(.+)\}/); const res = look(f.g, w); return { file: f.file, w, r, m: res && res.entry ? res.entry.m : null }; });
  const bad = rows.filter((x) => (x.r === 'じゅっぷん' && x.m !== 'ten minutes') || (x.r === 'じゅうぶん' && x.m !== 'enough') || (/ぷん$|ふん$/.test(x.r) && !/minute/.test(x.m || '')));
  const jip = rows.filter((x) => x.r === 'じゅっぷん');
  t.ok(jip.length >= 5 && jip.some((x) => /atlas/.test(x.file)), `十分 read じゅっぷん is written in ${jip.length} places, the atlas sign among them (${[...new Set(jip.map((x) => x.file))].join(', ')})`);
  t.eq(bad.map((x) => x.file + ' ' + x.w + ' ' + x.r + ': ' + x.m), [], `every number + 分 (${rows.length}) reads as its reading says: じゅっぷん "ten minutes", じゅうぶん "enough", the minutes as minutes`);
  t.ok(look('{十分|じゅっぷん} の {休|やす}み 。', '十分').entry.m === 'ten minutes' && look('{十分|じゅうぶん} の {量|りょう} 。', '十分').entry.m === 'enough', 'before の as well: 十分 じゅっぷん is ten minutes, 十分 じゅうぶん is enough');
};
