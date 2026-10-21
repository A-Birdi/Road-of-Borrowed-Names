// RBN-QA-042 (Agnes; Local's refinements): the small tsu っ/ッ and the long-vowel mark ー have no reading of their own.
// rōmaji() writes them as an apostrophe and a dash (conventions for inside a word), so a kana question or hint never
// shows those marks as if they were readings: the bare question names the mark in words (and never prints つ/ツ or
// the mark itself, which would make it copying), a word's blank hints with the same name, the explanation shows what
// the mark does in real words, and only the target is accepted. rōmaji() itself is unchanged.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const K = RB.kana, T = RB.tasks;
  const s = RB.state.newCampaign({ profile: 'E' });
  s.learn.kanaKnown = 'both';
  RB.game.s = s;

  t.eq(K.romaji('っ'), "'", 'romaji() is unchanged: a lone small tsu is still its apostrophe convention');
  t.eq(K.romaji('ー'), '-', 'romaji() is unchanged: a lone long-vowel mark is still a dash');
  const CASES = { っ: ['hiragana', 'Write the small tsu (sokuon) in hiragana.'], ッ: ['katakana', 'Write the small tsu (sokuon) in katakana.'], ー: ['katakana', 'Write the long-vowel mark.'] };
  for (const ch in CASES) {
    const [sc, prompt] = CASES[ch];
    const b = T.kanaStep(ch, { bare: true });
    t.eq(b.prompt.en, prompt, ch + ': the bare question names the mark in words');
    t.ok(!/['’“”-]|つ|ツ/.test(b.prompt.en.replace('long-vowel', 'long vowel')) && b.prompt.en.indexOf(ch) < 0, ch + ': no apostrophe, dash, つ/ツ or the mark itself in the question (' + b.prompt.en + ')');
    t.eq(b.accept, [ch], ch + ': only the target is accepted');
    t.eq(b.script, sc === 'katakana' ? 'kata' : 'hira', ch + ': written in ' + sc);
    t.ok(/doubles the consonant|lengthens the vowel/.test(b.explain.en) && !/'|read -/.test(b.explain.en), ch + ': the explanation shows what it does (' + b.explain.en + ')');
  }
  // in a word: the blank's hint names the mark
  for (const ch of ['っ', 'ッ']) {
    const w = T.kanaStep(ch, {});
    if (w.template) {
      t.ok(/\(small tsu \(sokuon\)\)/.test(w.prompt.en) && !/\('\)/.test(w.prompt.en), ch + ': in a word the blank hints "small tsu (sokuon)" (' + w.prompt.en + ')');
      t.eq(w.accept, [ch], ch + ': in a word only the target is accepted');
    } else t.ok(true, ch + ': no known word with it in this campaign (bare question only)');
  }
  // the lesson groups' own labels exist for these marks (the lesson page shows them, not rōmaji())
  const labels = {};
  for (const g of RB.kanaLessons.groups) for (const x of g.kana) if (x.k === 'っ' || x.k === 'ッ' || x.k === 'ー') labels[x.k] = x.r;
  t.ok(labels['っ'] && labels['っ'] !== "'" && labels['ー'] && labels['ー'] !== '-', 'the lessons label っ and ー in words (' + JSON.stringify(labels) + ')');
  // the full-size つ/ツ keep their ordinary question
  t.eq(T.kanaStep('つ', { bare: true }).prompt.en, 'Write the hiragana for “tsu”.', 'つ keeps its ordinary question');
  t.eq(T.kanaStep('ツ', { bare: true }).prompt.en, 'Write the katakana for “tsu”.', 'ツ keeps its ordinary question');
};
