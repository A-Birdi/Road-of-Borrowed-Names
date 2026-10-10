/* East Landing's language tasks (expansion P11d; plan R6: repair jobs A15, notices A17, negotiation with the old
 * owners). Each is the same question at the four profiles. Real things are labelled real: 一尺, the old measure. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const task = (id, title, tiers) => (C.challenges[id] = { title, tiers });

  // ---- Genroku's terms ------------------------------------------------------------------------------------------------
  task('el.terms', T('ゲンロク の {条件|じょうけん}', 'Genroku\'s terms'), {
    F: [ch({ item: 'v:名前', ctx: { jp: 'ゲンロク ： わし の わたしば だ 。 なまえ を かえる な 。', en: '' }, prompt: { en: 'Which promise answers him?' }, options: [o('なまえ は 「ひがし の わたしば」 の まま です 。', 1), o('あたらしい なまえ に しましょう 。', 0, 'He said: don\'t change the name.'), o('かわり に さかな を あげます 。', 0, 'It isn\'t a trade he wants: he wants the name kept.')] })],
    E: [ch({ item: 'v:条件', ctx: { jp: 'ゲンロク ： {条件|じょうけん} は {三|みっ}つ だ 。 {名前|なまえ} は そのまま 。 {鐘|かね} を また {鳴|な}らす 。 {掃除|そうじ} は わし が {続|つづ}ける 。', en: '' }, prompt: { en: 'Which proposal meets all three?' }, options: [o('{名前|なまえ} も {鐘|かね} も {残|のこ}して 、 {掃除|そうじ} は ゲンロク さん に お{願|ねが}い します 。', 1), o('{名前|なまえ} は {新|あたら}しく して 、 {鐘|かね} を {鳴|な}らします 。', 0, 'The name stays: that was his first condition.'), o('{掃除|そうじ} は {若|わか}い {人|ひと} が やります から 、 {休|やす}んで ください 。', 0, 'Kindly meant, but he asked to keep the sweeping himself.')] })],
    I: [ch({ item: 'v:決める', ctx: { jp: 'ゲンロク ： {勝手|かって} に {直|なお}される の は {御免|ごめん} だ 。', en: '' }, prompt: { en: 'He won\'t have it done over his head. How do you put it, so that he decides?' }, options: [o('{直|なお}して も いい か どう か 、 ゲンロク さん に {決|き}めて ほしい ん です 。', 1), o('もう {直|なお}す こと に {決|き}まって います 。', 0, 'That is exactly "over his head": ask him to decide.'), o('{直|なお}さない と 、 {港長|こうちょう} に {怒|おこ}られます よ 。', 0, 'A threat, and someone else\'s: let him decide.')] })],
    A: [ch({ item: 'v:従来', ctx: { jp: '{一|ひと}つ 、 {名|な} を {改|あらた}めぬ こと 。 {一|ひと}つ 、 {鐘|かね} を {再|ふたた}び {吊|つ}る こと 。 {一|ひと}つ 、 {掃|は}き{手|て} は {従来|じゅうらい} どおり と する こと 。', en: '' }, prompt: { en: 'Genroku has written his terms in an old, formal style. What does he ask?' }, options: [o('{名前|なまえ} を {変|か}えない 。 {鐘|かね} を また {吊|つ}るす 。 {掃除|そうじ} は {今|いま} まで どおり {彼|かれ} が する 。', 1), o('{名前|なまえ} を {改|あらた}める 。 {鐘|かね} を {外|はず}す 。 {掃除|そうじ} は {誰|だれ} か に {任|まか}せる 。', 0, '～ぬ is an old negative: 改めぬ, do not change.'), o('{名前|なまえ} を {変|か}えない 。 {鐘|かね} を {新|あたら}しく する 。 {掃除|そうじ} は {当番|とうばん} で する 。', 0, '再び吊る: hang (the old one) again; 従来どおり: as before, his.')] })],
  });

  // ---- the notice ---------------------------------------------------------------------------------------------------
  task('el.notice', T('{手伝|てつだ}い の {貼|は}り{紙|がみ}', 'The notice'), {
    F: [{ kind: 'order', item: 'g:prt_de', prompt: { en: 'Put the notice together: tomorrow morning, at East Landing, help wanted.' }, tiles: ['あした の あさ 、', 'ひがし の わたしば で 、', 'てつだい を さがして います 。'], answer: ['あした の あさ 、', 'ひがし の わたしば で 、', 'てつだい を さがして います 。'], orderHint: { en: 'When, where (で), then what.' } }],
    E: [{ kind: 'order', item: 'g:prt_de', prompt: { en: 'Put the notice together: when, where, what.' }, tiles: ['{明日|あした} の {朝|あさ} 、', '{東|ひがし} の {渡|わた}し{場|ば} で 、', '{手伝|てつだ}い を {探|さが}して います 。'], answer: ['{明日|あした} の {朝|あさ} 、', '{東|ひがし} の {渡|わた}し{場|ば} で 、', '{手伝|てつだ}い を {探|さが}して います 。'], orderHint: { en: 'The time, the place with で, and the verb last.' } }],
    I: [ch({ item: 'v:手伝い', prompt: { en: 'Which notice tells a reader everything they need?' }, options: [o('{明日|あした} の {朝|あさ} 、 {東|ひがし} の {渡|わた}し{場|ば} で {水路|すいろ} を {掘|ほ}ります 。 {手|て} を {貸|か}して くれる {人|ひと} は 、 {来|き}て ください 。', 1), o('{手|て} を {貸|か}して くれる {人|ひと} は 、 {来|き}て ください 。', 0, 'Come where, and when? A notice needs the time and the place.'), o('{東|ひがし} の {渡|わた}し{場|ば} で {水路|すいろ} を {掘|ほ}りました 。', 0, 'The past tense reports work done; a notice asks for help ahead.')] })],
    A: [ch({ item: 'v:募集', prompt: { en: 'A public notice wants a formal register. Which reads as one?' }, options: [o('{東|ひがし} の {渡|わた}し{場|ば} の {再建|さいけん} に つき 、 {手伝|てつだ}い を {募集|ぼしゅう} します 。 {明朝|みょうちょう} 、 {現地|げんち} に お{集|あつ}まり ください 。', 1), o('{渡|わた}し{場|ば} 、 {直|なお}す から さ 、 {明日|あした} {来|き}て よ 。', 0, 'Friendly, but far too casual for a public notice.'), o('{東|ひがし} の {渡|わた}し{場|ば} の {再建|さいけん} に つき 、 {手伝|てつだ}い を {募集|ぼしゅう} します 。', 0, 'Formal, but it never says when or where to come.')] })],
  });

  // ---- the channel -----------------------------------------------------------------------------------------------------
  task('el.channel', T('{水路|すいろ} を {掘|ほ}る', 'Digging the channel'), {
    F: [{ kind: 'order', item: 'v:掘る', prompt: { en: 'Tell Daigo the order: measure the depth, mark it with stakes, dig between the marks.' }, tiles: ['ふかさ を はかって', 'くい で しるし を つけて', 'しるし の あいだ を ほる'], answer: ['ふかさ を はかって', 'くい で しるし を つけて', 'しるし の あいだ を ほる'], orderHint: { en: 'Measure, mark, dig.' } }],
    E: [{ kind: 'order', item: 'v:掘る', prompt: { en: 'Tell Daigo the order.' }, tiles: ['{深|ふか}さ を {測|はか}って', '{杭|くい} で {印|しるし} を {付|つ}けて', '{印|しるし} の {間|あいだ} を {掘|ほ}る'], answer: ['{深|ふか}さ を {測|はか}って', '{杭|くい} で {印|しるし} を {付|つ}けて', '{印|しるし} の {間|あいだ} を {掘|ほ}る'], orderHint: { en: 'Measure the depth, mark the line with stakes, then dig.' } }],
    I: [{ kind: 'order', item: 'g:v_te_kara', prompt: { en: 'Four steps: wait for the tide, then measure, mark and dig.' }, tiles: ['{潮|しお} が {引|ひ}いて から', '{深|ふか}さ を {測|はか}り', '{杭|くい} で {印|しるし} を {付|つ}けて', '{印|しるし} の {間|あいだ} を {掘|ほ}る'], answer: ['{潮|しお} が {引|ひ}いて から', '{深|ふか}さ を {測|はか}り', '{杭|くい} で {印|しるし} を {付|つ}けて', '{印|しるし} の {間|あいだ} を {掘|ほ}る'], orderHint: { en: '～てから first: nothing is dug under water.' } }],
    A: [ch({ item: 'v:干潮', ctx: { jp: '{作業|さぎょう} は {干潮|かんちょう} の {前後|ぜんご} {二時間|にじかん} に {限|かぎ}る 。 {満|み}ち{潮|しお} の {際|さい} は 、 {杭|くい} を {抜|ぬ}かず に {引|ひ}き{上|あ}げる こと 。', en: '' }, prompt: { en: 'Hama\'s written rule for the work. What does it say?' }, options: [o('{潮|しお} が {一番|いちばん} {引|ひ}く {頃|ころ} の {前後|ぜんご} {二時間|にじかん} だけ {掘|ほ}る 。 {潮|しお} が {満|み}ちて きたら 、 {杭|くい} は {残|のこ}して {上|あ}がる 。', 1), o('{二時間|にじかん} ごと に {掘|ほ}る 。 {満|み}ち{潮|しお} に なったら 、 {杭|くい} を {抜|ぬ}いて {帰|かえ}る 。', 0, '抜かずに: without pulling the stakes out, so the marks stay.'), o('{満|み}ち{潮|しお} の {時|とき} だけ {掘|ほ}る 。', 0, '干潮 is low tide: dig around low water.')] })],
  });

  // ---- the jetty's planks --------------------------------------------------------------------------------------------
  task('el.jetty', T('{桟橋|さんばし} の {板|いた}', 'The jetty\'s planks'), {
    F: [ch({ item: 'g:counters', ctx: { jp: 'すきま は 3 メートル 。 いた は 1 まい で 30 センチ 。', en: '' }, prompt: { en: 'How many planks fill the gap?' }, options: [o('10 まい', 1), o('3 まい', 0, '3 metres is 300 centimetres: 300 ÷ 30.'), o('30 まい', 0, 'Each plank is 30 centimetres wide: 300 ÷ 30 = 10.')] })],
    E: [ch({ item: 'g:counters', ctx: { jp: '{隙間|すきま} は 3 メートル 。 {板|いた} は {一枚|いちまい} で 30 センチ 。', en: '' }, prompt: { en: 'How many planks fill the gap?' }, options: [o('{十枚|じゅうまい}', 1), o('{三枚|さんまい}', 0, '3 metres is 300 centimetres: 300 ÷ 30.'), o('{三十枚|さんじゅうまい}', 0, 'Each plank is 30 centimetres wide: ten of them.')] })],
    I: [ch({ item: 'g:counters', ctx: { jp: '{隙間|すきま} が {二|ふた}つ ある 。 {一|ひと}つ は 1.5 メートル 、 もう {一|ひと}つ は 1.2 メートル 。 {板|いた} は {一枚|いちまい} 30 センチ 。', en: '' }, prompt: { en: 'How many planks in all?' }, options: [o('{九枚|きゅうまい}', 1), o('{五枚|ごまい}', 0, 'That fills the first gap only; the second needs four more.'), o('{二十七枚|にじゅうななまい}', 0, '150 ÷ 30 = 5 and 120 ÷ 30 = 4: nine.')] })],
    A: [ch({ item: 'v:尺', ctx: { jp: '{作業台|さぎょうだい} の {刻|きざ}み{目|め} は 、 {一尺|いっしゃく} ごと 。 {隙間|すきま} は {刻|きざ}み{目|め} {十|とお} {分|ぶん} 。 {板|いた} は {一枚|いちまい} {一尺|いっしゃく} {幅|はば} 。', en: '' }, prompt: { en: 'Hama measures on her notched workbench (real: 一尺 is an old measure, about 30 cm). How many planks?' }, options: [o('{十枚|じゅうまい}', 1), o('{一枚|いちまい}', 0, 'Ten notches is ten 尺; each plank is one 尺 wide.'), o('{三十枚|さんじゅうまい}', 0, '一尺 is about 30 cm, but the gap is counted in 尺: ten.')] })],
  });
})(RB.content);
