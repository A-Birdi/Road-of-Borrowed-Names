/* New Game+'s farewell (expansion P06, K9; Robin's C-54, C-66; docs/future/plan/10_STORY.md §9a): the companion of
 * the journey that ended says goodbye before the new one begins, whichever slot it goes to and however it began (the
 * end of the story, the Journey, or the Inn Ledger). Spoken by the originating journey's companion, never another.
 * Short and spoiler-free: it names nothing of the story. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.ngFarewell = {
    nao: [
      { who: 'nao', jp: 'また {最初|さいしょ} から か 。 …… {悪|わる}く ない 。', en: 'From the beginning again, huh. …Not bad.' },
      { who: 'nao', jp: '{道|みち} は {覚|おぼ}えて いる だろう 。 {言葉|ことば} も な 。', en: 'You remember the road. The words, too.' },
      { who: 'nao', jp: '{向|む}こう で も 、 ちゃんと {届|とど}けろ よ 。 {自分|じぶん} の {名前|なまえ} を 。', en: 'Over there, deliver it properly. Your own name.' },
    ],
    mio: [
      { who: 'mio', jp: '{行|い}って しまう の ね 。', en: 'So you\'re going.' },
      { who: 'mio', jp: '{大丈夫|だいじょうぶ} 。 {覚|おぼ}えた こと は 、 {消|き}えない から 。', en: 'It\'s all right. What you learned won\'t fade.' },
      { who: 'mio', jp: '…… また 、 どこ か の {道|みち} で 。', en: '…Until another road, somewhere.' },
    ],
    ren: [
      { who: 'ren', jp: '{新|あたら}しい ページ を {開|ひら}く の です ね 。', en: 'You\'re opening a new page, then.' },
      { who: 'ren', jp: '{前|まえ} の ページ は {消|き}えません 。 {紙|かみ} の {下|した} に 、 ちゃんと {残|のこ}って います 。', en: 'The pages before don\'t disappear. They stay, under the paper.' },
      { who: 'ren', jp: 'どうか 、 お{元気|げんき} で 。', en: 'Please, take care.' },
    ],
    suzu: [
      { who: 'suzu', jp: 'もう {次|つぎ} の {幕|まく} ？', en: 'The next act, already?' },
      { who: 'suzu', jp: '…… いい わ 。 {拍手|はくしゅ} で {送|おく}り{出|だ}して あげる 。', en: '…All right. I\'ll send you off with applause.' },
      { who: 'suzu', jp: '{次|つぎ} の {舞台|ぶたい} で も 、 {主役|しゅやく} は あなた よ 。', en: 'On the next stage too, the lead is you.' },
    ],
  };
  C.ngFarewellEnd = { who: 'narr', jp: '{新|あたら}しい {旅|たび} が 、 {始|はじ}まる 。', en: 'A new journey begins.' };
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ records/10_ngplus:31 [ngplus.farewell]
= もう {次|つぎ} の {幕|まく} ？ || The next act, already?
> もう {次|つぎ} の {幕|まく} なん ？ || The next act, already?
@ records/10_ngplus:32 [ngplus.farewell]
= …… いい わ 。 {拍手|はくしゅ} で {送|おく}り{出|だ}して あげる 。 || …All right. I'll send you off with applause.
> …… ええ よ 。 {拍手|はくしゅ} で {送|おく}り{出|だ}したる 。 || …All right. I'll send you off with applause.
@ records/10_ngplus:33 [ngplus.farewell]
= {次|つぎ} の {舞台|ぶたい} で も 、 {主役|しゅやく} は あなた よ 。 || On the next stage too, the lead is you.
> {次|つぎ} の {舞台|ぶたい} で も 、 {主役|しゅやく} は あんた や で 。 || On the next stage too, the lead's you.
`);
})(RB.content);
