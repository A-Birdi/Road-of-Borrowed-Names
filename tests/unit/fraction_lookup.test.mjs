// Word Help on a fraction's whole (RBN-QA-132; Agnes 6353618099; Local CL-231): a number + 分 read ぶん before の is
// read as a fraction (三分の一 = 1/3), not "3 × minute(s)" (src/lang/70_lookup_ext.js). In node:
//  1. Tamotsu's three lines (三分の一, read さんぶん since the Tier A fixes) and a line of its own each way (1/3, 1/4);
//  2. its neighbours are not fractions: 十分 (じゅうぶん, "enough", also before の), the minutes (さんぷん, じゅっぷん,
//     じゅうごふん, also before の), an ordinary counter, and portions (〜人分).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const lines = [];
  for (const [id, sc] of Object.entries(RB.content.scenes)) {
    const walk = (o) => { if (!o || typeof o !== 'object') return; if (typeof o.jp === 'string' && o.jp.includes('{三分|さんぶん} の')) lines.push([id, o.jp]); for (const k in o) if (k !== 'jp') walk(o[k]); };
    walk(sc);
  }
  t.eq(lines.map((l) => l[0]).sort(), ['co.assembly', 'co.tamotsu', 'co.tokiwa_confront'], 'Tamotsu\'s three lines carry 三分 read さんぶん');
  const at = (jp, surf) => { const tk = RB.jp.render(jp, { spacing: true, vars: {}, furigana: true }).tokens; return RB.jp.lookup(tk.find((x) => x.surface === surf)); };
  for (const [id, jp] of lines) {
    const r = at(jp, '三分');
    t.ok(r.reading === 'さんぶん' && r.forms.join() === 'fraction (〜分の〜)' && /1\/3/.test(r.entry.m) && !/minute/.test(r.entry.m), `${id}: Word Help reads 三分 as a fraction (${r.reading}; ${r.forms}; ${r.entry.m})`);
  }
  // the neighbours: 十分 "enough", the minutes (also before の), an ordinary counter; and portions (〜人分) as the game's
  // own lines have them, whatever they read: each the same with the rule as the line's lookup gives without it
  // the rule itself, on a line of its own: a whole and a part (three and four)
  for (const [jp, w, frac] of [['{三分|さんぶん} の {一|いち} 。', '三分', '1/3'], ['{四分|よんぶん} の {三|さん} 。', '四分', '1/4']]) {
    const r = at(jp, w);
    t.ok(!!r && (r.forms || []).join() === 'fraction (〜分の〜)' && r.entry.m.includes(frac) && !/minute/.test(r.entry.m), `${jp}: a fraction's whole (${r && r.entry && r.entry.m})`);
  }
  // (十分 read じゅっぷん, "ten minutes", is glossed from the lexicon's 十分 じゅうぶん "enough" with or without this rule;
  // that is reported on its own, so here it is only required not to become a fraction)
  const keep = [['{十分|じゅうぶん} だ 。', '十分', /enough/], ['{十分|じゅうぶん} の {量|りょう} 。', '十分', /enough/], ['{三分|さんぷん} で {終|お}わる 。', '三分', /^3 × minute/],
    ['{三分|さんぷん} の {休|やす}み 。', '三分', /^3 × minute/], ['{十分|じゅっぷん} の {休|やす}み 。', '十分', /./], ['{十五分|じゅうごふん} {待|ま}つ 。', '十五分', /fifteen minutes/],
    ['{三回|さんかい} の {鐘|かね} 。', '三回', /^3 × times/]];
  for (const [jp, w, re] of keep) {
    const r = at(jp, w);
    t.ok(!!r && !!r.entry && re.test(r.entry.m) && (r.forms || []).join() !== 'fraction (〜分の〜)' && !/1\//.test(r.entry.m), `${jp}: ${w} is not read as a fraction (${r && r.entry && r.entry.m})`);
  }
  const portions = ['{十人分|じゅうにんぶん}', '{二人分|ふたりぶん}', '{三人分|さんにんぶん}'].map((w) => at(w + ' の {米|こめ} 。', RB.jp.plain(w)));
  t.ok(portions.every((r) => r && (r.forms || []).join() !== 'fraction (〜分の〜)' && !/1\//.test((r.entry && r.entry.m) || '')), 'portions (〜人分) before の are not read as fractions (' + portions.map((r) => r && r.entry ? r.entry.m : r && r.unknown ? 'unknown' : '?').join('; ') + ')');
};
