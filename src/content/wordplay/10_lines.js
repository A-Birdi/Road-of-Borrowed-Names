/* Companion shiritori: what each companion says and does at the table
 * (Practice addendum §14.4). One shared game; four people playing it.
 *   Nao  leans in, checks the exits from the current kana, an understated finger-tap;
 *        acknowledges a route closed or an escape spent; competitive, never dismissive.
 *   Mio  lays out and straightens the word slips, listens, smiles at a familiar noun;
 *        plays sharply without turning timid or praising every move.
 *   Ren  reads the reading again, pushes up the glasses, draws the lamp closer; admits a
 *        mistaken plan plainly, with dry humour rather than infallibility.
 *   Suzu expressive anticipation and small flourishes, settling down while you write;
 *        enjoys a real contest and takes a loss theatrically, never cheating or mocking.
 * Categories (≥ 14 with the reflection scenes in 20_reflect.js): invite, rules, thinking, move,
 * newword, escape, trap, win, loss, coop, stop, resume, firstclear (+ reflect). Repeated ones
 * have at least two lines. No mockery of mistakes, no sulking, no secret mercy, no lecture.
 * `facts` narrows a line to what actually happened (by: who escaped; reason: how a game ended). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content.wordplay = RB.content.wordplay || { lines: [], gestures: {}, reflections: {}, thoughts: [], texts: {} };

(function (W) {
  'use strict';
  const L = (comp, cat, rows) => rows.forEach((r, i) => W.lines.push(Object.assign({ id: comp + '.' + cat + '.' + (i + 1), comp, cat }, r)));

  // ---- Nao -------------------------------------------------------------------------------------------
  L('nao', 'invite', [
    { expr: 'smirk', jp: '{休|やす}む ついで に 、 しりとり でも どう だ 。 {手加減|てかげん} は しない ぞ 。', en: 'While we\'re resting — how about shiritori? I won\'t go easy on you.' },
  ]);
  L('nao', 'rules', [
    { jp: '{前|まえ} の {言葉|ことば} の {最後|さいご} の {字|じ} から {始|はじ}める 。 ん で {終|お}わったら {負|ま}け 。 {一度|いちど} {出|で}た {言葉|ことば} は もう {使|つか}えない 。', en: 'Start from the last kana of the word before. End on ん and you lose. A word that\'s been played can\'t be played again.' },
    { expr: 'smirk', jp: '{出口|でぐち} の ない {字|じ} を {渡|わた}されたら 、 そこ で {終|お}わり だ 。 {逆|ぎゃく} も {同|おな}じ だ ぞ 。', en: 'Get handed a kana with no way out, and that\'s the end. Works the other way too.' },
  ]);
  L('nao', 'thinking', [
    { expr: 'think', jp: '…… {出口|でぐち} は 、 まだ {残|のこ}ってる な 。', en: '…There are still ways out.', gesture: 'Nao leans forward, checking the exits from this kana, one fingertip tapping the table.' },
    { expr: 'think2', jp: '{待|ま}て 。 {今|いま} {数|かぞ}えてる 。', en: 'Hang on. I\'m counting.', gesture: 'Nao taps the table once, twice, counting under the breath.' },
  ]);
  L('nao', 'move', [
    { jp: '{次|つぎ} 、 あんた の {番|ばん} だ 。', en: 'Your move.' },
    { expr: 'smirk', jp: 'よし 。 {道|みち} は {繋|つな}がった 。', en: 'Right. The road still connects.' },
    { jp: '{悪|わる}く ない {手|て} だ 。 {俺|おれ} も {考|かんが}える 。', en: 'Not a bad move. Now I have to think.' },
  ]);
  L('nao', 'newword', [
    { jp: '{今|いま} の 、 {知|し}らない {言葉|ことば} だった か ？ {意味|いみ} は {札|ふだ} に {書|か}いて ある 。', en: 'Was that one new to you? The meaning\'s on the slip.' },
    { jp: '{配達|はいたつ} で {覚|おぼ}えた {言葉|ことば} だ 。 {役|やく} に {立|た}つ ぞ 。', en: 'A word I picked up on deliveries. It comes in handy.' },
  ]);
  L('nao', 'escape', [
    { facts: { by: 'cpu' }, expr: 'surprise', jp: '{危|あぶ}なかった 。 {逃|に}げ{道|みち} が {一|ひと}つ しか なかった 。', en: 'Close one. There was only one way out.' },
    { facts: { by: 'pc' }, jp: 'その {字|じ} 、 {残|のこ}り {一|ひと}つ だった ぞ 。 よく {見|み}つけた な 。', en: 'That kana had one word left. Good find.' },
    { facts: { by: 'cpu' }, jp: '…… {一本|いっぽん} だけ {道|みち} が {残|のこ}って た 。 {助|たす}かった 。', en: '…One road was left. Lucky.' },
    { facts: { by: 'pc' }, expr: 'smirk', jp: 'その {字|じ} で {抜|ぬ}けた か 。 {出口|でぐち} を {見|み}てる な 。', en: 'Got out through that kana? You\'re watching the exits.' },
  ]);
  L('nao', 'trap', [
    { expr: 'smirk', jp: '{悪|わる}い な 。 その {字|じ} の {出口|でぐち} は 、 もう {全部|ぜんぶ} {使|つか}って ある 。', en: 'Sorry. Every way out of that kana\'s already been used.' },
    { jp: '{道|みち} を {閉|と}じた 。 {今回|こんかい} は {俺|おれ} の {勝|か}ち だ 。', en: 'I closed the road. This one\'s mine.' },
  ]);
  L('nao', 'win', [
    { expr: 'surprise', jp: '…… {出口|でぐち} が ない 。 {参|まい}った 、 あんた の {勝|か}ち だ 。', en: '…No way out. You\'ve got me. You win.' },
    { expr: 'smile', jp: '{逃|に}げ{道|みち} を {使|つか}い{切|き}った か 。 {見事|みごと} だ 。', en: 'I\'d spent all my escapes. Well played.' },
  ]);
  L('nao', 'loss', [
    { jp: '{俺|おれ} の {勝|か}ち だ な 。 でも 、 {最後|さいご} まで {道|みち} を {探|さが}して た の は {分|わ}かった 。', en: 'My win. But I could see you were looking for a way right to the end.' },
    { facts: { reason: 'terminal-n' }, jp: 'ん で {終|お}わった な 。 {次|つぎ} は その {前|まえ} に {出口|でぐち} を {探|さが}そう 。', en: 'It ended on ん. Next time we\'ll look for an exit before that.' },
    { facts: { reason: 'human-concession' }, jp: '{降参|こうさん} か 。 {了解|りょうかい} 。 {残|のこ}って た {言葉|ことば} 、 {後|あと} で {見|み}る か ？', en: 'Conceding? Understood. Want to look at the words that were left, after?' },
    { facts: { reason: 'terminal-n' }, jp: 'ん が {付|つ}いた な 。 {惜|お}しい 。 そこ まで の {手|て} は {悪|わる}く なかった 。', en: 'It ended in ん. A shame — the moves up to there weren\'t bad.' },
    { facts: { reason: 'human-concession' }, jp: '{分|わ}かった 、 ここ まで に しよう 。 {勝|か}ち は {俺|おれ} だ が 、 {楽|たの}しかった 。', en: 'All right, we\'ll stop there. The win\'s mine, but it was fun.' },
  ]);
  L('nao', 'coop', [
    { expr: 'smile', jp: '{最後|さいご} まで {繋|つな}がった 。 {二人|ふたり} で {運|はこ}んだ {荷物|にもつ} みたい だ な 。', en: 'It held together to the end. Like a load we carried between us.' },
    { jp: '{目標|もくひょう} に {届|とど}いた 。 {悪|わる}く ない {道|みち} だった 。', en: 'We reached the mark. Not a bad road.' },
  ]);
  L('nao', 'stop', [
    { jp: 'ここ まで に しよう 。 {続|つづ}き は いつ でも いい 。', en: 'Let\'s stop here. We can pick it up any time.' },
    { expr: 'smile', jp: '{休|やす}む の も {仕事|しごと} の うち だ 。', en: 'Resting\'s part of the job too.' },
  ]);
  L('nao', 'resume', [
    { jp: '{続|つづ}き から だ な 。 {前|まえ} の {言葉|ことば} は {覚|おぼ}えてる 。', en: 'From where we left off. I remember the last word.' },
    { expr: 'smirk', jp: '{書|か}き{留|と}めて おいた 。 {続|つづ}けよう 。', en: 'I kept a note of it. Let\'s carry on.' },
  ]);
  L('nao', 'firstclear', [
    { expr: 'smile', jp: 'この {組|く}み{合|あ}わせ で は 、 あんた が {先|さき} に {勝|か}った な 。 {覚|おぼ}えて おく 。', en: 'At this setting, you got the first win. I\'ll remember that.' },
  ]);

  // ---- Mio -------------------------------------------------------------------------------------------------
  L('mio', 'invite', [
    { expr: 'shy', jp: '{少|すこ}し 、 しりとり を しません か 。 …… {役|やく} に {立|た}たない {遊|あそ}び を 、 {練習|れんしゅう} {中|ちゅう} なん です 。', en: 'Shall we play a little shiritori? …I\'m practising games that aren\'t useful for anything.' },
  ]);
  L('mio', 'rules', [
    { jp: '{前|まえ} の {言葉|ことば} の {最後|さいご} の {字|じ} で {始|はじ}めます 。 ん で {終|お}わる {言葉|ことば} は {負|ま}け 、 {同|おな}じ {言葉|ことば} は {一度|いちど} だけ です 。', en: 'Begin with the last kana of the word before. A word ending in ん loses, and each word only once.' },
    { expr: 'smile', jp: '{言葉|ことば} の {札|ふだ} は {並|なら}べて おきます ね 。 {使|つか}った {札|ふだ} は こちら に {寄|よ}せます 。', en: 'I\'ll lay the word slips out. Used ones go over here.' },
  ]);
  L('mio', 'thinking', [
    { expr: 'think', jp: '…… {少|すこ}し {待|ま}って ください 。', en: '…Give me a moment.', gesture: 'Mio straightens the row of word slips while thinking.' },
    { expr: 'think2', jp: 'ええと 、 この {字|じ} から なら ……', en: 'Let me see — from this kana…', gesture: 'Mio lifts one slip, considers it, and sets it back.' },
  ]);
  L('mio', 'move', [
    { jp: 'では 、 これ で 。', en: 'This one, then.' },
    { expr: 'smile', jp: 'あなた の {番|ばん} です 。 {急|いそ}ぎません よ 。', en: 'Your turn. No hurry.' },
    { jp: '{札|ふだ} が {増|ふ}えて きました ね 。', en: 'The slips are adding up.' },
  ]);
  L('mio', 'newword', [
    { jp: '{今|いま} の {言葉|ことば} 、 {初|はじ}めて です か ？ {意味|いみ} は {札|ふだ} に {書|か}いて あります 。', en: 'Was that word new? The meaning\'s on the slip.' },
    { expr: 'smile', jp: '{私|わたし} も 、 {昔|むかし} は {知|し}らなかった {言葉|ことば} です 。', en: 'That\'s one I didn\'t know once, either.' },
  ]);
  L('mio', 'escape', [
    { facts: { by: 'cpu' }, expr: 'worry', jp: '…… {最後|さいご} の {一枚|いちまい} でした 。 {危|あぶ}なかった です 。', en: '…That was the last slip for it. That was close.' },
    { facts: { by: 'pc' }, expr: 'smile', jp: '{残|のこ}り {一|ひと}つ の {言葉|ことば} 、 よく {見|み}つけました ね 。', en: 'You found the only one left.' },
    { facts: { by: 'cpu' }, jp: '{一|ひと}つ だけ 、 {残|のこ}って いました 。 {助|たす}かりました 。', en: 'Just one was left. That saved me.' },
    { facts: { by: 'pc' }, jp: 'その {字|じ} 、 もう {最後|さいご} の {一枚|いちまい} でした よ 。', en: 'That kana was down to its last slip.' },
  ]);
  L('mio', 'trap', [
    { jp: 'ごめんなさい 。 その {字|じ} の {札|ふだ} は 、 もう {全部|ぜんぶ} こちら に あります 。', en: 'I\'m sorry. All the slips for that kana are already over here.' },
    { expr: 'smile', jp: '{今回|こんかい} は 、 {私|わたし} の {勝|か}ち です 。 …… {遠慮|えんりょ} は しません でした 。', en: 'This time, I win. …I didn\'t hold back.' },
  ]);
  L('mio', 'win', [
    { expr: 'smile', jp: '…… {続|つづ}けられません 。 あなた の {勝|か}ち です 。 {悔|くや}しい です けど 、 {楽|たの}しかった 。', en: '…I can\'t continue. You win. It stings, but it was fun.' },
    { expr: 'surprise', jp: '{札|ふだ} が {一枚|いちまい} も {残|のこ}って いません 。 {見事|みごと} です 。', en: 'Not a single slip left for me. Well done.' },
  ]);
  L('mio', 'loss', [
    { expr: 'smile', jp: '{私|わたし} の {勝|か}ち です 。 …… もう {一局|いっきょく} 、 {付|つ}き{合|あ}って くれます か 。', en: 'My win. …Will you keep me company for another?' },
    { facts: { reason: 'terminal-n' }, jp: 'ん で {終|お}わって しまいました ね 。 {次|つぎ} は 、 その {札|ふだ} を {最後|さいご} まで {取|と}って おきましょう 。', en: 'It ended on ん. Next time, let\'s hold that slip back to the very end.' },
    { facts: { reason: 'human-concession' }, jp: '{降参|こうさん} です ね 。 {分|わ}かりました 。 {残|のこ}って いた {札|ふだ} 、 {後|あと} で {一緒|いっしょ} に {見|み}ましょう か 。', en: 'You concede? All right. Shall we look at the slips that were left, afterwards?' },
    { facts: { reason: 'terminal-n' }, jp: 'ん の {札|ふだ} でした ね 。 {決|き}まり です から 、 {私|わたし} の {勝|か}ち です 。', en: 'That was an ん slip. Rules are rules, so it\'s my win.' },
    { facts: { reason: 'human-concession' }, jp: 'はい 、 {降参|こうさん} を {受|う}け{取|と}りました 。 {無理|むり} を しない の は 、 いい こと です 。', en: 'Yes, concession accepted. Not pushing yourself is a good thing.' },
  ]);
  L('mio', 'coop', [
    { expr: 'smile', jp: '{最後|さいご} まで {続|つづ}きました 。 …… {誰|だれ} の {役|やく} に も {立|た}たない のに 、 {楽|たの}しい です ね 。', en: 'We made it to the end. …It\'s no use to anyone, and it\'s still fun.' },
    { jp: '{二人|ふたり} で {並|なら}べた {札|ふだ} 、 きれい です ね 。', en: 'The slips we laid out together look lovely.' },
  ]);
  L('mio', 'stop', [
    { jp: 'ここ で {休|やす}みましょう 。 {続|つづ}き は 、 また 。', en: 'Let\'s rest here. More another time.' },
    { expr: 'smile', jp: '{無理|むり} は しない 。 {私|わたし} の {規則|きそく} です 。', en: 'No pushing. One of my rules.' },
  ]);
  L('mio', 'resume', [
    { jp: '{札|ふだ} は そのまま に して あります 。 {続|つづ}けましょう 。', en: 'I left the slips as they were. Let\'s continue.' },
    { expr: 'smile', jp: 'どこ まで でした っけ 。 …… ああ 、 ここ です ね 。', en: 'Where were we? …Ah, here.' },
  ]);
  L('mio', 'firstclear', [
    { expr: 'smile', jp: 'この {組|く}み{合|あ}わせ で 、 あなた の {初|はじ}めて の {勝|か}ち です ね 。 {記録|きろく} して おきます 。', en: 'Your first win at this setting. I\'ll write it down.' },
  ]);

  // ---- Ren --------------------------------------------------------------------------------------------------
  L('ren', 'invite', [
    { expr: 'smile', jp: '{灯|あか}り も {落|お}ち{着|つ}いた こと です し 、 しりとり を {一局|いっきょく} 、 いかが です か 。', en: 'The lamps are settled — a game of shiritori, perhaps?' },
  ]);
  L('ren', 'rules', [
    { jp: '{読|よ}み の {最後|さいご} の {字|じ} で {繋|つな}ぎます 。 {漢字|かんじ} の {形|かたち} で は なく 、 {読|よ}み です 。', en: 'We connect on the last kana of the reading. Not the kanji\'s shape — the reading.' },
    { expr: 'think', jp: '{伸|の}ばす {音|おと} で {終|お}わる {言葉|ことば} は 、 その {前|まえ} の {音|おと} の {母音|ぼいん} を {渡|わた}します 。 {小|ちい}さい {字|じ} は {大|おお}きく して {渡|わた}します 。', en: 'A word ending in ー passes the vowel before it. A small kana passes its full-size form.' },
  ]);
  L('ren', 'thinking', [
    { expr: 'think', jp: '…… {読|よ}み を {確|たし}かめて います 。', en: '…Checking the reading.', gesture: 'Ren pushes up the glasses and reads the last slip again.' },
    { expr: 'think2', jp: '{少々|しょうしょう} お{待|ま}ち を 。 {灯|あか}り を {寄|よ}せます 。', en: 'One moment. Let me bring the lamp closer.', gesture: 'Ren draws the lamp a little closer to the slips.' },
  ]);
  L('ren', 'move', [
    { jp: 'では 、 こちら を 。', en: 'Then, this one.' },
    { expr: 'smile', jp: '{繋|つな}がりました 。 {小|ちい}さな {決|き}まり です が 、 {面白|おもしろ}い 。', en: 'Connected. A small rule, but an interesting one.' },
    { jp: 'あなた の {番|ばん} です 。', en: 'Your turn.' },
  ]);
  L('ren', 'newword', [
    { jp: '{記録|きろく} に ない {言葉|ことば} でした か 。 {意味|いみ} は {札|ふだ} に {添|そ}えて あります 。', en: 'Was that one missing from your records? Its meaning is on the slip.' },
    { expr: 'smile', jp: '{本|ほん} で {覚|おぼ}えた {言葉|ことば} です 。 {声|こえ} に {出|だ}す の は {初|はじ}めて です が 。', en: 'A word I learned from books. First time I\'ve said it aloud.' },
  ]);
  L('ren', 'escape', [
    { facts: { by: 'cpu' }, expr: 'surprise', jp: '…… {一|ひと}つ だけ {残|のこ}って いました 。 {推測|すいそく} が {当|あ}たりました 。', en: '…Just one was left. My inference held.' },
    { facts: { by: 'pc' }, jp: 'その {字|じ} の {言葉|ことば} 、 {最後|さいご} の {一|ひと}つ でした 。 よく {見|み}て います ね 。', en: 'That was the last word for that kana. You\'re watching closely.' },
    { facts: { by: 'cpu' }, jp: '…… {最後|さいご} の {一|ひと}つ でした 。 {記録|きろく} を {付|つ}けて いて {良|よ}かった 。', en: '…That was the last one. Good thing I kept a record.' },
    { facts: { by: 'pc' }, expr: 'smile', jp: '{残|のこ}り {一|ひと}つ を {選|えら}びました か 。 {正確|せいかく} です 。', en: 'You chose the only one left. Precise.' },
  ]);
  L('ren', 'trap', [
    { jp: '{申|もう}し{訳|わけ} ない 。 その {字|じ} の {言葉|ことば} は 、 {全部|ぜんぶ} {使|つか}われて います 。 {記録|きろく} に よれば 。', en: 'My apologies. Every word for that kana has been used — according to the record.' },
    { expr: 'smirk', jp: '{今回|こんかい} は {私|わたし} が {先|さき} に {道|みち} を {閉|と}じました 。', en: 'This time I closed the road first.' },
  ]);
  L('ren', 'win', [
    { expr: 'surprise', jp: '…… {続|つづ}き が ありません 。 {計画|けいかく} が {外|はず}れました 。 あなた の {勝|か}ち です 。', en: '…No continuation. My plan missed. You win.' },
    { expr: 'smirk', jp: '{私|わたし} の {負|ま}け です 。 {三回|さんかい} {確|たし}かめて 、 {四回目|よんかいめ} に {迷|まよ}う 。 いつも の {癖|くせ} です 。', en: 'I lose. Checked three times, lost on the fourth — my usual habit.' },
  ]);
  L('ren', 'loss', [
    { jp: '{私|わたし} の {勝|か}ち です 。 {途中|とちゅう} まで は 、 {本当|ほんとう} に {分|わ}かりません でした 。', en: 'My win. Up to the middle, I genuinely couldn\'t tell.' },
    { facts: { reason: 'terminal-n' }, expr: 'think', jp: 'ん で {終|お}わりました ね 。 {決|き}まり は {決|き}まり です が 、 {惜|お}しい 。', en: 'It ended on ん. Rules are rules, but that was close.' },
    { facts: { reason: 'human-concession' }, jp: '{降参|こうさん} 、 {承知|しょうち} しました 。 {残|のこ}って いた {言葉|ことば} は 、 {振|ふ}り{返|かえ}り で {見|み}られます 。', en: 'Concession noted. You can see the words that were left when we look back.' },
    { facts: { reason: 'terminal-n' }, jp: 'ん で {終|お}わる {言葉|ことば} でした 。 {私|わたし} の {勝|か}ち に {数|かぞ}えます が 、 {気|き} に しない で ください 。', en: 'That word ends in ん. It counts as my win, but don\'t let it trouble you.' },
    { facts: { reason: 'human-concession' }, jp: '{分|わ}かりました 。 {今回|こんかい} は {私|わたし} の {勝|か}ち と して {記録|きろく} します 。', en: 'Understood. I\'ll record this one as my win.' },
  ]);
  L('ren', 'coop', [
    { expr: 'smile', jp: '{目標|もくひょう} の {長|なが}さ に {届|とど}きました 。 {小|ちい}さな {決|き}まり で 、 ここ まで {繋|つな}がる 。', en: 'We reached the length we aimed for. A small rule, and it connects this far.' },
    { jp: '{二人|ふたり} の {記録|きろく} です 。 {大事|だいじ} に して おきます 。', en: 'A record of the two of us. I\'ll keep it carefully.' },
  ]);
  L('ren', 'stop', [
    { jp: 'ここ で {区切|くぎ}りましょう 。 {記録|きろく} は {逃|に}げません 。', en: 'Let\'s break here. The record won\'t run away.' },
    { expr: 'smile', jp: '{休|やす}む の も {大切|たいせつ} です 。', en: 'Resting matters too.' },
  ]);
  L('ren', 'resume', [
    { jp: '{記録|きろく} の {続|つづ}き から {始|はじ}めましょう 。', en: 'Let\'s begin where the record leaves off.' },
    { expr: 'smirk', jp: '{前回|ぜんかい} の {最後|さいご} の {言葉|ことば} 、 {覚|おぼ}えて います 。 {正確|せいかく} に 。', en: 'I remember the last word from before. Precisely.' },
  ]);
  L('ren', 'firstclear', [
    { expr: 'smile', jp: 'この {条件|じょうけん} で の {初|はじ}めて の {勝|か}ち 、 {記録|きろく} しました 。', en: 'Your first win under these conditions — recorded.' },
  ]);

  // ---- Suzu ---------------------------------------------------------------------------------------------------
  L('suzu', 'invite', [
    { expr: 'laugh', jp: 'ねえ 、 {幕間|まくあい} に しりとり しない ？ {本気|ほんき} で {行|い}く わ よ 。', en: 'Hey, shiritori for the interval? I\'m playing for real.' },
  ]);
  L('suzu', 'rules', [
    { jp: '{前|まえ} の {言葉|ことば} の {最後|さいご} の {字|じ} から {始|はじ}める の 。 ん で {終|お}わったら {幕|まく} 。 {同|おな}じ {言葉|ことば} は {再演|さいえん} {禁止|きんし} よ 。', en: 'You start from the last kana of the word before. End on ん and the curtain falls. No encores of the same word.' },
    { expr: 'smile', jp: '{相手|あいて} に {続|つづ}き の ない {字|じ} を {渡|わた}せたら 、 {拍手|はくしゅ} もの よ 。', en: 'Hand your partner a kana with no follow-up, and that\'s worth applause.' },
  ]);
  L('suzu', 'thinking', [
    { expr: 'smile', jp: 'ふふ 、 {待|ま}って 。 {今|いま} いい の が {浮|う}かび そう 。', en: 'Heh, wait. Something good is coming to me.', gesture: 'Suzu drums the table in anticipation, then stills both hands.' },
    { expr: 'think', jp: 'さあ 、 {何|なに} で {返|かえ}そう かしら 。', en: 'Now, what shall I answer with?', gesture: 'Suzu twirls a slip between two fingers before laying it down.' },
  ]);
  L('suzu', 'move', [
    { expr: 'laugh', jp: 'はい 、 {次|つぎ} の {場面|ばめん} ！', en: 'And — next scene!' },
    { expr: 'smirk', jp: 'どう ？ {今|いま} の {繋|つな}ぎ 、 {悪|わる}く ない でしょ 。', en: 'Well? Not a bad transition, was it?' },
    { jp: 'あなた の {番|ばん} よ 。 ゆっくり どうぞ 。', en: 'Your turn. Take your time.' },
  ]);
  L('suzu', 'newword', [
    { jp: '{今|いま} の 、 {知|し}らない {言葉|ことば} だった ？ {札|ふだ} に {意味|いみ} が ある わ 。', en: 'Was that one new to you? The meaning\'s on the slip.' },
    { expr: 'smile', jp: '{旅|たび} の {途中|とちゅう} で {覚|おぼ}えた {言葉|ことば} よ 。', en: 'A word I picked up on tour.' },
  ]);
  L('suzu', 'escape', [
    { facts: { by: 'cpu' }, expr: 'surprise', jp: '{危|あぶ}ない ！ {最後|さいご} の {一|ひと}つ で {切|き}り{抜|ぬ}けた わ 。', en: 'Close! Got through on the very last one.' },
    { facts: { by: 'pc' }, expr: 'laugh', jp: '{残|のこ}り {一|ひと}つ を {見|み}つける なんて 、 {見事|みごと} な {即興|そっきょう} ね 。', en: 'Finding the very last one — a fine improvisation.' },
    { facts: { by: 'cpu' }, expr: 'laugh', jp: 'ふう 、 {最後|さいご} の {一|ひと}つ ！ {心臓|しんぞう} に {悪|わる}い わ 。', en: 'Phew, the very last one! Bad for my heart.' },
    { facts: { by: 'pc' }, expr: 'laugh', jp: 'その {字|じ} 、 {最後|さいご} の {一|ひと}つ だった の よ 。 {拍手|はくしゅ} ！', en: 'That kana was down to its last word. Applause!' },
  ]);
  L('suzu', 'trap', [
    { expr: 'smirk', jp: '{幕|まく} よ 。 その {字|じ} の {言葉|ことば} は 、 もう {全部|ぜんぶ} {舞台|ぶたい} に {出|で}た わ 。', en: 'Curtain. Every word for that kana has already been on stage.' },
    { expr: 'laugh', jp: '{今回|こんかい} は {私|わたし} の {見|み}せ{場|ば} ね 。', en: 'This time the big scene is mine.' },
  ]);
  L('suzu', 'win', [
    { expr: 'surprise', jp: '…… {続|つづ}き が ない ！ ああ 、 {悔|くや}しい 。 {見事|みごと} な {幕切|まくぎ}れ よ 。', en: '…No follow-up! Oh, that stings. A fine final curtain.' },
    { expr: 'laugh', jp: '{負|ま}けた わ 。 {拍手|はくしゅ} ！ …… {次|つぎ} は {取|と}り{返|かえ}す けど ね 。', en: 'I lost. Applause! …I\'ll win it back next time, though.' },
  ]);
  L('suzu', 'loss', [
    { expr: 'smile', jp: '{私|わたし} の {勝|か}ち 。 でも 、 {途中|とちゅう} は {本当|ほんとう} に いい {勝負|しょうぶ} だった わ 。', en: 'My win. But it was a really good contest along the way.' },
    { facts: { reason: 'terminal-n' }, jp: 'ん で {幕|まく} ね 。 {惜|お}しい ！ {次|つぎ} の {舞台|ぶたい} で {取|と}り{返|かえ}しましょう 。', en: 'It ended on ん. So close! Win it back at the next show.' },
    { facts: { reason: 'human-concession' }, jp: '{降参|こうさん} ね 。 {了解|りょうかい} 。 {楽屋|がくや} で {振|ふ}り{返|かえ}り しましょう か 。', en: 'Conceding? Understood. Shall we go over it backstage?' },
    { facts: { reason: 'terminal-n' }, jp: 'ん が {来|き}ちゃった わ ね 。 でも 、 {舞台|ぶたい} は {何度|なんど} でも {開|ひら}ける わ 。', en: 'Along came ん. But the stage can open as many times as we like.' },
    { facts: { reason: 'human-concession' }, jp: '{降参|こうさん} 、 {受|う}け{付|つ}けました 。 {次|つぎ} の {舞台|ぶたい} も {待|ま}ってる わ よ 。', en: 'Concession received. I\'ll be waiting for the next show.' },
  ]);
  L('suzu', 'coop', [
    { expr: 'laugh', jp: '{最後|さいご} まで {繋|つな}がった ！ {二人|ふたり} の {舞台|ぶたい} 、 {大成功|だいせいこう} よ 。', en: 'It held all the way! A two-person show, a great success.' },
    { expr: 'smile', jp: '{息|いき} が {合|あ}って た わ ね 。 {間|ま} の {取|と}り{方|かた} も 。', en: 'We were in step. Our timing, too.' },
  ]);
  L('suzu', 'stop', [
    { jp: '{今日|きょう} は ここ で お{休|やす}み 。 {続|つづ}き は また ね 。', en: 'That\'s the show for today. More another time.' },
    { expr: 'smile', jp: '{幕間|まくあい} よ 。 {休|やす}む の も {舞台|ぶたい} の うち 。', en: 'Interval. Resting\'s part of the show.' },
  ]);
  L('suzu', 'resume', [
    { expr: 'laugh', jp: '{第二幕|だいにまく} の {始|はじ}まり ！ {前|まえ} の {場面|ばめん} は {覚|おぼ}えてる わ 。', en: 'Act two — curtain up! I remember the last scene.' },
    { jp: 'お{待|ま}たせ 。 {続|つづ}き から よ 。', en: 'Sorry to keep you. We pick up where we were.' },
  ]);
  L('suzu', 'firstclear', [
    { expr: 'laugh', jp: 'この {組|く}み{合|あ}わせ で 、 あなた の {初|はじ}めて の {勝|か}ち ね 。 {帳簿|ちょうぼ} に {書|か}いて おく わ 。', en: 'Your first win at this setting. I\'ll write it in the ledger.' },
  ]);

  // ---- table presence (§14.4): what each one does while you play; presentation only -------------------
  // motion: a short CSS gesture on their portrait (none with reduced motion; never endless)
  W.gestures = {
    nao: { motion: 'lean', seat: 'Nao sits forward at the low table, satchel set aside.', write: 'Nao sits back and waits, saying nothing while you write.', end: 'Nao lets out a breath and sits back.' },
    mio: { motion: 'arrange', seat: 'Mio lays the word slips out in a neat row.', write: 'Mio folds both hands and listens while you write.', end: 'Mio gathers the slips into a tidy stack.' },
    ren: { motion: 'lamp', seat: 'Ren sets the lamp beside the slips and pushes up the glasses.', write: 'Ren turns the lamp a little toward your side and waits.', end: 'Ren reads the chain from the first slip to the last.' },
    suzu: { motion: 'flourish', seat: 'Suzu sits down with a small flourish of the sleeves.', write: 'Suzu goes still and quiet while you write.', end: 'Suzu gives a little bow over the table.' },
  };
})(RB.content.wordplay);
