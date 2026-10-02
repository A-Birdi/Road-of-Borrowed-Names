// RBN-02 (battle addendum §2.2), the generators beyond the recall step: every generated "write the
// word" prompt names the script it accepts — "in hiragana" / "in katakana", "or in kanji" when the
// written form is accepted too — instead of a vague "kana" that the answer check does not honour.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn'], { __RB_TEST__: true });
  const A = RB.tasks.askScript;
  t.eq(A('みず', '水'), 'in hiragana, or in kanji', 'a word with a kanji form');
  t.eq(A('みず', null), 'in hiragana', 'kanji not on offer');
  t.eq(A('みず', 'みず'), 'in hiragana', 'no separate written form');
  t.eq(A('パン', 'パン'), 'in katakana', 'a katakana word');
  // the battle weave, the field weave and the copying desk build their prompts with it
  for (const f of ['src/ui/80_combat.js', 'src/ui/57_weave.js', 'src/ui/89_desk.js']) {
    const src = fs.readFileSync(f, 'utf8');
    t.ok(!/Write the word for[^\n]*\(kana or kanji\)/.test(src), f + ': no "(kana or kanji)" write prompt');
    t.ok(/RB\.tasks\.askScript\(/.test(src), f + ': names the script with RB.tasks.askScript');
  }
};
