/* New Game+'s farewell (expansion P06, K9; Robin's C-54, C-66; docs/future/plan/10_STORY.md §9a): the companion of
 * the journey that ended says goodbye before the new one begins, whichever slot it goes to and however it began (the
 * end of the story, the Journey, or the Inn Ledger). Spoken by the originating journey's companion, never another.
 * Short and spoiler-free: it names nothing of the story. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  // P14 (10_STORY.md §9a, sealed S13): each companion has unfinished work where the ending left them, so cannot come;
  // the lanterns brighten and the road folds back to the morning in Reedwake; goodbye for now, never forever; and the
  // memories (what you learned, your stars, the illustrations) come with you. A short solo version for a journey ended
  // before a companion was chosen.
  C.ngFarewell = {
    nao: [
      { who: 'nao', jp: 'また {最初|さいしょ} から か 。 …… {悪|わる}く ない 。', en: 'From the beginning again, huh. …Not bad.' },
      { who: 'nao', jp: '{俺|おれ} は 、 {一緒|いっしょ} に は {行|い}けない 。 {鞄|かばん} に 、 まだ {届|とど}けて ない {手紙|てがみ} が ある 。 {書|か}き{直|なお}す {宛名|あてな} も 。', en: 'I can\'t come with you. There are letters in the satchel I haven\'t delivered yet. Addresses to rewrite, too.' },
      { who: 'nao', jp: '{道|みち} は {覚|おぼ}えて いる だろう 。 {言葉|ことば} も な 。', en: 'You remember the road. The words, too.' },
      { who: 'nao', jp: '…… {泣|な}く な よ 。 {俺|おれ} も {泣|な}かない 。 また な 。 {向|む}こう で も 、 ちゃんと {届|とど}けろ よ 。 {自分|じぶん} の {名前|なまえ} を 。', en: '…Don\'t cry. I won\'t either. See you. Over there, deliver it properly. Your own name.' },
    ],
    mio: [
      { who: 'mio', jp: '{行|い}って しまう の ね 。', en: 'So you\'re going.' },
      { who: 'mio', jp: '{私|わたし} は {一緒|いっしょ} に {行|い}けない の 。 {棚|たな} に 、 まだ {札|ふだ} の ない {瓶|びん} が ある し 、 {断|ことわ}り{方|かた} の {練習|れんしゅう} も {途中|とちゅう} だ から 。', en: 'I can\'t come with you. There are still jars on my shelves without labels, and I\'m only halfway through learning to say no.' },
      { who: 'mio', jp: '{大丈夫|だいじょうぶ} 。 {覚|おぼ}えた こと は 、 {消|き}えない から 。', en: 'It\'s all right. What you learned won\'t fade.' },
      { who: 'mio', jp: '…… {泣|な}いて ない わ よ 。 {風|かぜ} の せい 。 …… また 、 どこ か の {道|みち} で 。', en: '…I\'m not crying. It\'s the wind. …Until another road, somewhere.' },
    ],
    ren: [
      { who: 'ren', jp: '{新|あたら}しい ページ を {開|ひら}く の です ね 。', en: 'You\'re opening a new page, then.' },
      { who: 'ren', jp: 'わたし は 、 ここ に {残|のこ}ります 。 {名前|なまえ} を {呼|よ}び{戻|もど}す {灯|ひ} が 、 まだ たくさん あります 。 {師匠|ししょう} の {教|おし}え も 、 {一晩|ひとばん} に {一|ひと}つ ずつ 、 {誰|だれ} か に {伝|つた}えたい 。', en: 'I\'ll stay here. There are still many lamps whose names need calling back. And my teacher\'s sayings: I\'d like to pass them on to someone, one a night.' },
      { who: 'ren', jp: '{前|まえ} の ページ は {消|き}えません 。 {紙|かみ} の {下|した} に 、 ちゃんと {残|のこ}って います 。', en: 'The pages before don\'t disappear. They stay, under the paper.' },
      { who: 'ren', jp: '…… {迷|まよ}わない で ください ね 。 わたし が {言|い}う の も {何|なん} です が 。 どうか 、 お{元気|げんき} で 。 また 、 お{会|あ}い しましょう 。', en: '…Don\'t get lost, all right? Coming from me, I know. Please, take care. Let\'s meet again.' },
    ],
    suzu: [
      { who: 'suzu', jp: 'もう {次|つぎ} の {幕|まく} ？', en: 'The next act, already?' },
      { who: 'suzu', jp: '{私|わたし} は {行|い}けない わ 。 {芝居|しばい} の {台本|だいほん} が 、 まだ {書|か}き{終|お}わって ない し 、 {一座|いちざ} の {初日|しょにち} も {近|ちか}い の 。', en: 'I can\'t come. The script still isn\'t finished, and the troupe\'s opening night is close.' },
      { who: 'suzu', jp: '…… いい わ 。 {拍手|はくしゅ} で {送|おく}り{出|だ}して あげる 。 {泣|な}く の は 、 {幕|まく} が {下|お}りて から に する 。', en: '…All right. I\'ll send you off with applause. I\'ll save the crying for after the curtain.' },
      { who: 'suzu', jp: '{次|つぎ} の {舞台|ぶたい} で も 、 {主役|しゅやく} は あなた よ 。 …… また ね 、 {相方|あいかた} 。', en: 'On the next stage too, the lead is you. …See you, partner.' },
    ],
    solo: [
      { who: 'narr', jp: '{遠|とお}く で 、 {誰|だれ} か が {手|て} を {振|ふ}った {気|き} が した 。', en: 'Far off, someone seems to wave.' },
    ],
  };
  C.ngFarewellEnd = [
    { who: 'narr', jp: '{道|みち} の {灯|ひ} が 、 {一|ひと}つ ずつ {明|あか}るく なる 。 {道|みち} が {後|うし}ろ へ {折|お}り{返|かえ}して 、 {葦|あし}ノ{瀬|せ} に {着|つ}いた {朝|あさ} へ {続|つづ}いて いく 。', en: 'The lanterns along the road brighten one by one. The road folds back on itself, to the morning you first came to Reedwake.' },
    { who: 'narr', jp: '{覚|おぼ}えた {言葉|ことば} 、 {星|ほし} 、 {見|み}た {絵|え} は 、 {一緒|いっしょ} に {持|も}って {行|い}ける 。', en: 'The words you learned, your stars and the illustrations you saw: they come with you.' },
    { who: 'narr', jp: '{新|あたら}しい {旅|たび} が 、 {始|はじ}まる 。', en: 'A new journey begins.' },
  ];
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ records/10_ngplus [ngplus.farewell]
= もう {次|つぎ} の {幕|まく} ？ || The next act, already?
> もう {次|つぎ} の {幕|まく} なん ？ || The next act, already?
@ records/10_ngplus [ngplus.farewell]
= {私|わたし} は {行|い}けない わ 。 {芝居|しばい} の {台本|だいほん} が 、 まだ {書|か}き{終|お}わって ない し 、 {一座|いちざ} の {初日|しょにち} も {近|ちか}い の 。 || I can't come. The script still isn't finished, and the troupe's opening night is close.
> {私|わたし} は {行|い}かれへん わ 。 {芝居|しばい} の {台本|だいほん} が 、 まだ {書|か}き{終|お}わって へん し 、 {一座|いちざ} の {初日|しょにち} も {近|ちか}い ねん 。 || I can't come. The script still isn't finished, and the troupe's opening night is close.
@ records/10_ngplus [ngplus.farewell]
= …… いい わ 。 {拍手|はくしゅ} で {送|おく}り{出|だ}して あげる 。 {泣|な}く の は 、 {幕|まく} が {下|お}りて から に する 。 || …All right. I'll send you off with applause. I'll save the crying for after the curtain.
> …… ええ よ 。 {拍手|はくしゅ} で {送|おく}り{出|だ}したる 。 {泣|な}く の は 、 {幕|まく} が {下|お}りて から に する わ 。 || …All right. I'll send you off with applause. I'll save the crying for after the curtain.
@ records/10_ngplus [ngplus.farewell]
= {次|つぎ} の {舞台|ぶたい} で も 、 {主役|しゅやく} は あなた よ 。 …… また ね 、 {相方|あいかた} 。 || On the next stage too, the lead is you. …See you, partner.
> {次|つぎ} の {舞台|ぶたい} で も 、 {主役|しゅやく} は あんた や で 。 …… ほな また な 、 {相方|あいかた} 。 || On the next stage too, the lead's you. …See you, partner.
`);
})(RB.content);
