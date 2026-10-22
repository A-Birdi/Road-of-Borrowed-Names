// RV0115 (the register audit; Agnes 6352566901, 6353618099; Local CL-232): in Suzu's Kansai line for lf.b_suzu2,
// 値切られても断られへんから ("She can't say no when folks haggle"), Word Help read 断られへん through 〜へん alone, as the
// passive negative 断られない "isn't refused", against her English and the standard line's 断れない. One Kansai lexicon
// entry now reads this word as the Kansai potential, "can't refuse" (standard 断れない); her words, and so her voice key,
// are unchanged. In node:
//  1. her line is as it was;
//  2. Word Help on 断られへん: "can't refuse", standard 断れない, no passive;
//  3. the real passive before it (値切られて) is still a passive;
//  4. every other 〜られへん in her Kansai lines is still read through 〜へん (= 〜ない), as before.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const LINE = 'リツ の {店|みせ} 、 {帳簿|ちょうぼ} が めちゃくちゃ や で 。 {値切|ねぎ}られて も {断|ことわ}られへん から 、 {団子|だんご} が {半額|はんがく} {以下|いか} や 。';
  // ---- 1.
  const src = fs.readFileSync(path.join(root, 'src', 'content', 'dialect', 'kansai_50_ch5.js'), 'utf8');
  t.ok(src.includes('> ' + LINE + ' || '), 'her Kansai line is as it was');
  // ---- 2.
  const toks = RB.jp.render(LINE, { spacing: true, vars: {}, furigana: true }).tokens;
  const at = (s) => toks.findIndex((x) => x.surface === s);
  const d = RB.dialect.lookupIn(toks, at('断られへん'));
  const m = d && (d.meaning || (d.entry && d.entry.m));
  t.ok(!!d && /can't refuse/.test(m) && d.dia && d.dia.std === '断れない' && !(d.forms || []).some((f) => /passive/.test(f)) && /断れない/.test(RB.dialect.note(d)), `断られへん: "${m}", standard ${d && d.dia && d.dia.std}, forms [${d && d.forms}]`);
  // ---- 3.
  const p = RB.dialect.lookupIn(toks, at('値切られて')) || RB.jp.lookup(toks[at('値切られて')]);
  t.ok((p.forms || []).some((f) => /passive/.test(f)), '値切られて is still a passive (' + p.forms + ')');
  // ---- 4.
  const others = [];
  for (const f of fs.readdirSync(path.join(root, 'src', 'content', 'dialect'))) {
    for (const l of fs.readFileSync(path.join(root, 'src', 'content', 'dialect', f), 'utf8').split('\n')) {
      if (!l.startsWith('> ') || !l.includes('られへん')) continue;
      const tk = RB.jp.render(l.slice(2).split(' || ')[0], { spacing: true, vars: {}, furigana: true }).tokens;
      tk.forEach((x, i) => { if (/られへん$/.test(x.surface) && x.surface !== '断られへん') others.push([x.surface, RB.dialect.lookupIn(tk, i)]); });
    }
  }
  const off = others.filter(([s, r]) => !r || !r.dia || r.dia.std !== s.replace(/へん$/, 'ない') || /can't refuse/.test(r.meaning || '')).map(([s, r]) => s + ' → ' + (r && r.dia ? r.dia.std : 'none'));
  t.ok(others.length >= 10 && !off.length, `every other 〜られへん (${others.length}) is still read as 〜られない${off.length ? ': ' + off.join(', ') : ''}`);
};
