/* Manzai (expansion P09; plan 08_CULTURE.md C11): a double act, the funny one (ボケ) saying something absurd and the
 * straight one (ツッコミ) putting it right. The player plays the straight one: spot what is wrong in the line (an
 * impossible claim, a mis-said word, a pun) and choose the retort. Humour and wordplay understood, not imitated; the
 * retorts are standard Japanese. Suzu is the funny one in her journeys; Genta, the theatre's comic, in the others.
 * The audience reacts; nothing is scored. Three bits; the last is Manybridge's own pun (箸 and 橋, both はし). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const no = (en) => ({ en });
  // a bit: the boke line, the right retort, and near misses (low profiles see two options, high profiles three)
  function bit(id, title, boke, ok, w1, why1, w2, why2, item) {
    const low = { kind: 'choose', item, ctx: { jp: boke.jp, en: boke.en }, prompt: { en: 'What is wrong with that? Choose your retort.' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: no(why1) }] };
    const high = { kind: 'choose', item, ctx: { jp: boke.jp, en: '' }, prompt: { en: 'Your retort (two of them are close):' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: no(why1) }, { jp: w2, ok: false, why: no(why2) }] };
    C.challenges[id] = { title, tiers: { F: [low], E: [low], I: [high], A: [high] } };
  }
  bit('mp.manzai_1', T('The double act: the umbrellas', '{漫才|まんざい} ・ {傘|かさ}'),
    T('"Lovely weather today. So I brought three umbrellas."', '{今日|きょう} は いい {天気|てんき} です ね 。 だから 、 {傘|かさ} を {三本|さんぼん} {持|も}って {来|き}ました 。'),
    'いい {天気|てんき} なら 、 {傘|かさ} は いらない でしょう ！',
    '{三本|さんぼん} は {少|すく}ない です ね 。', 'That plays along with the joke instead of putting it right.',
    '{雨|あめ} なら 、 {傘|かさ} は いらない でしょう ！', 'Close, but the weather is lovely: that is the point.', 'v:天気');
  bit('mp.manzai_2', T('The double act: the morning run', '{漫才|まんざい} ・ {走|はし}る'),
    T('"I go for a run every morning. …In my dreams."', 'わたし 、 {毎朝|まいあさ} {走|はし}って います 。 …… {夢|ゆめ} の {中|なか} で 。'),
    'それ は {走|はし}ってる んじゃ なくて 、 {寝|ね}て いる だけ でしょう ！',
    'すごい です ね 。 {毎朝|まいあさ} です か 。', 'That believes it: the joke is that it happens in a dream.',
    'それ は {寝|ね}てる んじゃ なくて 、 {走|はし}って いる だけ でしょう ！', 'Swapped: running is what is not happening.', 'v:夢');
  bit('mp.manzai_3', T('The double act: bridges and chopsticks', '{漫才|まんざい} ・ はし'),
    T('"I crossed the chopsticks and ate my rice with a bridge." ({箸|はし} and {橋|はし} are both はし)', '{箸|はし} を {渡|わた}って 、 {橋|はし} で ご{飯|はん} を {食|た}べました 。'),
    '{反対|はんたい} ！ {橋|はし} を {渡|わた}って 、 {箸|はし} で {食|た}べた ん でしょう ！',
    '{橋|はし} で ご{飯|はん} は 、 おいしい です か ？', 'That asks about the meal: the joke is the two はし swapped.',
    '{反対|はんたい} ！ {箸|はし} を {渡|わた}って 、 {箸|はし} で {食|た}べた ん でしょう ！', 'Only one はし fixed: you cross a bridge ({橋|はし}) and eat with chopsticks ({箸|はし}).', 'v:箸');
})(RB.content);
