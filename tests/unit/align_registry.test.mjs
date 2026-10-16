// AG-1: reviewed alignments (src/content/align/) are used for exactly the displayed line they were reviewed against:
// every entry still matches its line and is used there; the player's name may be anything; a changed line, another
// dialect, or authored:false falls back to the rules; no reviewed relation claims an English part twice.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.jp.speech;
  const entries = S.authoredEntries();
  t.ok(entries.length >= 5, 'reviewed alignments loaded: ' + entries.length);
  const lineOf = (e) => (RB.content.scenes[e.scene].cmds || []).filter((c) => c.op === 'say' && c.jp && c.en)[e.line];
  const shown = (c, name, nameJp) => ({ tokens: RB.jp.render(c.jp, { vars: { name: nameJp }, spacing: true, furigana: true }).tokens, en: c.en.replace(/\$name/g, name) });
  let used = 0, clean = 0;
  for (const e of entries) {
    const c = lineOf(e);
    if (!c || c.jp !== e.jp || c.en !== e.en) continue;
    const { tokens, en } = shown(c, 'Robin', 'ロビン');
    const a = S.align(tokens, en, { name: 'Robin', dia: e.dia });
    if (a.src === 'authored') used++;
    if (S.collisions(a).length === 0 && a.rels.every((r) => r.jp.length && r.en.length)) clean++;
  }
  t.ok(used === entries.length, 'every reviewed alignment is used on its own line: ' + used + ' / ' + entries.length);
  t.ok(clean === entries.length, 'no reviewed relation claims an English part twice, and none is empty');

  // the player's name: any name, the same entry
  const named = entries.find((e) => /\$name/.test(e.jp));
  t.ok(!!named, 'a reviewed line with the player\'s name');
  if (named) {
    const c = lineOf(named);
    const { tokens, en } = shown(c, 'Mary Ann', 'メアリー');
    const a = S.align(tokens, en, { name: 'Mary Ann' });
    const nameRel = a.rels.find((r) => r.jp.some((i) => tokens[i].ph));
    t.ok(a.src === 'authored' && nameRel && a.words[nameRel.en[0]].text === 'Mary', 'with another player name the entry is still used, and the name pairs with it: ' + a.src);
  }
  // a changed line, another dialect, or authored:false: the rules
  const e0 = entries[0], c0 = lineOf(e0);
  const s0 = shown(c0, 'Robin', 'ロビン');
  t.ok(S.align(s0.tokens, s0.en + ' Really.', { name: 'Robin' }).src === 'rules', 'a changed English line falls back to the rules');
  t.ok(S.align(s0.tokens, s0.en, { name: 'Robin', dia: 'kansai' }).src === 'rules', 'the same words in another dialect fall back to the rules');
  t.ok(S.align(s0.tokens, s0.en, { name: 'Robin', authored: false }).src === 'rules', 'authored:false uses the rules');
  // the key: the displayed words, the dialect and the English, independent of the player's name
  t.ok(S.key(s0.tokens, s0.en, { name: 'Robin' }) !== S.key(s0.tokens, s0.en, { name: 'Robin', dia: 'kansai' }), 'the dialect is part of the key');
};
