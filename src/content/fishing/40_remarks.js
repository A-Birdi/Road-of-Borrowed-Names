/* A Quiet Cast — the companions by the water (Practice addendum §8.3). At
 * least six functional remarks per companion: first outing, patient wait,
 * ordinary catch, new discovery, voluntary stop and completed survey (the
 * repeatable ones with two variants, so no praise loop). The rules for when
 * they speak (one per catch, two ambient per three casts, none over an open
 * answer, Quiet chatter drops them) are in src/ui/86_fishing.js.
 *
 * Nao watches practical details and may joke about choosing not to hurry; Mio
 * makes room for the observation and treats stopping as a normal decision;
 * Ren is precise about the record without being an infallible fish expert;
 * Suzu gives an ordinary catch a little theatre and never mocks a mistake.
 * Also: the shared reflection after all nine (three replies of the player's,
 * the companion's answer to each) and the two Shared Memories' texts. No bond. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (F) {
  'use strict';
  const L = (jp, en, expr) => ({ jp, en, expr: expr || null });
  F.addRemarks('nao', {
    first: [L('{釣|つ}り か 。 {配達|はいたつ} と {違|ちが}って 、 {待|ま}つ の も {仕事|しごと} の うち だ な 。', 'Fishing, huh. Not like deliveries — here the waiting is part of the job.', 'smirk')],
    wait: [
      L('{急|いそ}ぐ の が {仕事|しごと} だった が …… {今日|きょう} は {急|いそ}がない 。 {決|き}めた 。', 'Hurrying used to be my job… Today I\'m not hurrying. Decided.', 'smirk'),
      L('{浮|う}き の {向|む}き 、 {悪|わる}く ない 。 {糸|いと} の {結|むす}び{目|め} も {見|み}て おいた 。', 'The float sits fine. I checked the knot on the line, too.'),
    ],
    catch: [
      L('よし 。 {一匹|いっぴき} 、 ちゃんと {届|とど}いた な 。', 'Right. One delivered, safe and sound.', 'smile'),
      L('{力|ちから} を {入|い}れすぎなかった の が {良|よ}かった 。', 'Good thing you didn\'t put too much into it.'),
    ],
    discover: [
      L('{見|み}た こと ない {顔|かお} だ 。 {記録|きろく} に {入|い}れて おけ 。', 'Never seen that face. Put it in the record.'),
      L('{新顔|しんがお} か 。 {届|とど}け{先|さき} は ヤス の {帳面|ちょうめん} だ な 。', 'A new face. Its delivery address is Yasu\'s notebook, then.', 'smirk'),
    ],
    stop: [
      L('ここ で {切|き}り{上|あ}げる か 。 {悪|わる}く ない {判断|はんだん} だ 。', 'Calling it here? Not a bad call.'),
      L('{続|つづ}き は また {今度|こんど} で いい 。 {川|かわ} は {逃|に}げない 。', 'The rest can wait for another time. The river isn\'t going anywhere.'),
    ],
    survey: [L('{三種類|さんしゅるい} 、 {揃|そろ}った な 。 ヤス の {頼|たの}み 、 {確|たし}か に {届|とど}けた ぞ 。', 'Three kinds, all there. Yasu\'s request — delivered.', 'smile')],
    reflectAsk: [L('{全部|ぜんぶ} {埋|う}まった な 。 …… どう だった ？', 'Every page filled. …So how was it?')],
    reflect: [
      L('{待|ま}つ の が {好|す}き 、 か 。 {俺|おれ} も {少|すこ}し {分|わ}かって きた 。', 'You liked the waiting? I\'m starting to see it myself.', 'smile'),
      L('{場所|ばしょ} で {違|ちが}う 。 {道|みち} と {同|おな}じ だ な 。 {一本|いっぽん} ずつ {覚|おぼ}える しか ない 。', 'Different by the spot. Same as roads. You learn them one at a time.'),
      L('…… {俺|おれ} も だ 。 {言|い}わせる な 。', '…Same here. Don\'t make me say it.', 'smirk'),
    ],
  });
  F.addRemarks('mio', {
    first: [L('{竿|さお} を {持|も}つ の 、 {久|ひさ}しぶり ？ わたし は ここ で {見|み}てる ね 。', 'Has it been a while since you held a rod? I\'ll watch from here.', 'smile')],
    wait: [
      L('{急|いそ}がなくて いい よ 。 {水|みず} の {音|おと} を {聞|き}いてる だけ で 、 {十分|じゅうぶん} 。', 'No need to hurry. Just listening to the water is enough.'),
      L('{光|ひかり} が {水|みず} に {映|うつ}って 、 きれい ね 。', 'The light on the water — it\'s lovely.', 'smile'),
    ],
    catch: [
      L('ちょっと {場所|ばしょ} を {空|あ}ける ね 。 よく {見|み}て あげて 。', 'I\'ll make a little room. Have a good look at it.'),
      L('{元気|げんき}そう 。 {早|はや}め に {水|みず} に {返|かえ}して あげよう ね 。', 'It looks well. Let\'s get it back in the water soon.'),
    ],
    discover: [
      L('はじめて {見|み}る {子|こ} だ ね 。 {絵|え} に {残|のこ}して おこう 。', 'One we\'ve never seen. Let\'s keep a picture of it.', 'smile'),
      L('この {子|こ} の {名前|なまえ} 、 わたし も {覚|おぼ}えて おく ね 。', 'I\'ll remember this one\'s name too.'),
    ],
    stop: [
      L('ここ まで に する ？ うん 、 それ で いい と {思|おも}う 。', 'Stopping here? Mm, I think that\'s good.', 'smile'),
      L('やめる の も 、 ちゃんと した {選|えら}び{方|かた} だ よ 。', 'Stopping is a proper choice too, you know.'),
    ],
    survey: [L('{三種類|さんしゅるい} 、 そろった ね 。 ヤス さん 、 {喜|よろこ}ぶ と {思|おも}う 。', 'Three kinds. I think Yasu will be glad.', 'smile')],
    reflectAsk: [L('{九|きゅう}{種類|しゅるい} 、 {全部|ぜんぶ} 。 …… {何|なに} が {一番|いちばん} {残|のこ}ってる ？', 'All nine. …What stays with you most?')],
    reflect: [
      L('{待|ま}つ {時間|じかん} って 、 {何|なに} も しなくて いい {時間|じかん} だ もん ね 。 わたし も {好|す}き 。', 'Waiting is time when you\'re allowed to do nothing. I like it too.', 'smile'),
      L('{同|おな}じ {水|みず} でも 、 {住|す}む {場所|ばしょ} が ある の ね 。 {薬草|やくそう} と {同|おな}じ 。', 'Even in the same water, everyone has their place. Like herbs.'),
      L('…… うん 。 {役|やく} に {立|た}たない {時間|じかん} が 、 {一番|いちばん} よかった 。', '…Mm. The time that wasn\'t useful for anything was the best part.', 'shy'),
    ],
  });
  F.addRemarks('ren', {
    first: [L('{記録|きろく} の {清書|せいしょ} は {私|わたし} が しましょう か 。 …… {魚|さかな} の {名前|なまえ} は 、 {正直|しょうじき} 、 {自信|じしん} が ありません が 。', 'Shall I make the fair copy of the record? …Though, honestly, I\'m not confident about fish names.', 'think')],
    wait: [
      L('{待|ま}つ {時間|じかん} は 、 {記録|きろく} に は {書|か}けません ね 。 {惜|お}しい こと です 。', 'Waiting can\'t be written into a record. A pity.'),
      L('{浮|う}き は まだ {沈|しず}んで いません 。 …… {私|わたし} の {見|み}る {限|かぎ}り は 。', 'The float hasn\'t gone under yet. …As far as I can tell.', 'think'),
    ],
    catch: [
      L('{場所|ばしょ} と {種類|しゅるい} 、 {書|か}き{留|と}めました 。 {大|おお}きさ は {書|か}きません 。 {測|はか}って いない ので 。', 'Place and kind, noted. I won\'t write a size — we didn\'t measure it.'),
      L('{同|おな}じ {種類|しゅるい} でも 、 {見|み}た {場所|ばしょ} は {書|か}いて おきます 。', 'Even for a kind we know, I\'ll note where we saw it.'),
    ],
    discover: [
      L('{新|あたら}しい {種類|しゅるい} です 。 {名前|なまえ} の {書|か}き{方|かた} は 、 {後|あと} で ヤス さん に {確|たし}かめましょう 。', 'A new kind. Let\'s check with Yasu later how its name is written.', 'think'),
      L('{初|はじ}めて の {記録|きろく} です 。 …… {私|わたし} の {字|じ} より 、 あなた の {字|じ} の ほう が {読|よ}みやすい かも しれません 。', 'A first record. …Your handwriting may be easier to read than mine.', 'smile'),
    ],
    stop: [
      L('ここ で {筆|ふで} を {置|お}きます か 。 {良|よ}い {区切|くぎ}り です 。', 'Putting the brush down here? A good place to stop.'),
      L('{今|いま} の {記録|きろく} は 、 これ で {十分|じゅうぶん} です 。', 'The record is quite enough as it stands.'),
    ],
    survey: [L('{三種類|さんしゅるい} 。 {調査|ちょうさ} と して は {小|ちい}さい です が 、 {正確|せいかく} です 。', 'Three kinds. Small, as surveys go — but accurate.', 'smile')],
    reflectAsk: [L('{九|きゅう}{種類|しゅるい} の {見開|みひら}き です 。 …… {感想|かんそう} を {一行|いちぎょう} 、 {添|そ}えます か 。', 'A spread of nine. …Shall we add one line of thoughts?')],
    reflect: [
      L('{待|ま}つ {時間|じかん} の ほう が 、 {記録|きろく} より {長|なが}い 。 それ が {良|よ}かった の かも しれません 。', 'The waiting was longer than the record. Perhaps that was the good part.'),
      L('{場所|ばしょ} が {違|ちが}えば 、 {答|こた}え も {違|ちが}う 。 {小|ちい}さな {決|き}まり が 、 {面白|おもしろ}い {違|ちが}い を {作|つく}ります ね 。', 'A different place, a different answer. A small rule makes for interesting differences.', 'think'),
      L('…… {私|わたし} も です 。 {記録|きろく} に は {書|か}きません が 。', '…As did I. Though I won\'t write that in the record.', 'smile'),
    ],
  });
  F.addRemarks('suzu', {
    first: [L('{水辺|みずべ} の {舞台|ぶたい} 、 {開幕|かいまく} です ！ …… {静|しず}か な {舞台|ぶたい} だ けど ね 。', 'The waterside stage — curtain up! …A quiet stage, mind.', 'laugh')],
    wait: [
      L('{待|ま}つ {間|あいだ} も {芝居|しばい} の うち 。 {間|ま} って 、 {大事|だいじ} な の よ 。', 'The waiting is part of the play. A good pause matters.', 'smile'),
      L('しー 。 {主役|しゅやく} は まだ {楽屋|がくや} に いる みたい 。', 'Shh. The star still seems to be in the dressing room.'),
    ],
    catch: [
      L('はい 、 {拍手|はくしゅ} ！ …… {魚|さかな} に は {聞|き}こえない けど 。', 'And — applause! …Not that the fish can hear it.', 'laugh'),
      L('{立派|りっぱ} な {登場|とうじょう} でした 。 {退場|たいじょう} は {水|みず} の {中|なか} へ 、 どうぞ 。', 'A splendid entrance. Exit into the water, if you please.', 'smile'),
    ],
    discover: [
      L('{新人|しんじん} さん ね ！ {名前|なまえ} 、 {覚|おぼ}えて おかなくちゃ 。', 'A newcomer! I must remember the name.', 'surprise'),
      L('{初舞台|はつぶたい} ！ ちゃんと {記録|きろく} に {残|のこ}る わ よ 。', 'A debut! It goes in the record.', 'laugh'),
    ],
    stop: [
      L('{幕|まく} を {下|お}ろす の も 、 {演出|えんしゅつ} の うち 。 いい {終|お}わり{方|かた} よ 。', 'Bringing the curtain down is part of the show. A good ending.', 'smile'),
      L('ここ で {終演|しゅうえん} ね 。 また {来|き}ましょう 。', 'That\'s the final curtain for now. Let\'s come again.'),
    ],
    survey: [L('{三幕|さんまく} {揃|そろ}って 、 {大団円|だいだんえん} ！ ヤス さん に {見|み}せ に {行|い}こう 。', 'All three acts — a grand finale! Let\'s go and show Yasu.', 'laugh')],
    reflectAsk: [L('{九|きゅう}{種類|しゅるい} 、 {全員|ぜんいん} {集合|しゅうごう} ！ …… ねえ 、 どう だった ？', 'All nine, assembled on stage! …So, how was it?', 'smile')],
    reflect: [
      L('{待|ま}つ {時間|じかん} は 、 {一番|いちばん} {大事|だいじ} な {間|ま} よ 。 {分|わ}かってる わ ね 。', 'The waiting is the most important pause of all. You understand that.', 'smile'),
      L('{舞台|ぶたい} が {変|か}われば 、 {出演者|しゅつえんしゃ} も {変|か}わる 。 {当然|とうぜん} ね ！', 'Change the stage and the cast changes. Naturally!', 'laugh'),
      L('…… {主役|しゅやく} を {分|わ}け{合|あ}う の 、 {悪|わる}く ない でしょ 。', '…Sharing the spotlight isn\'t bad, is it.', 'shy'),
    ],
  });
  // the player's three replies in the reflection (personal statements, not graded answers)
  F.addRemarks('__reflect', {
    choices: [
      L('{待|ま}つ {時間|じかん} が 、 {思|おも}った より {好|す}き だった 。', 'I liked the waiting more than I expected.'),
      L('{同|おな}じ {水辺|みずべ} でも 、 {場所|ばしょ} で {違|ちが}う {魚|さかな} が いた 。', 'Even by the same water, each spot had different fish.'),
      L('{一緒|いっしょ} に {座|すわ}って いられた の が 、 よかった 。', 'Being able to sit here together was the good part.'),
    ],
    solo: [L('{見開|みひら}き を {閉|と}じる 。 {水|みず} の {音|おと} が 、 まだ {聞|き}こえる 。', 'You close the spread. The sound of the water is still there.')],
    spread: [L('{九|きゅう}{種類|しゅるい} の {記録|きろく} が 、 {帳面|ちょうめん} の {見開|みひら}き に {並|なら}んだ 。', 'Nine records lie side by side across the notebook\'s spread.')],
  });
  // the two Shared Memories (RB.company.memory; never bond)
  F.addRemarks('__memories', {
    outing: {
      title: { jp: '{水辺|みずべ} で {過|す}ごした {時間|じかん}', en: 'Time by the water' },
      text: { jp: '{一緒|いっしょ} に {竿|さお} を {出|だ}して 、 {魚|さかな} を よく {見|み}て 、 {同|おな}じ {水|みず} に {逃|に}がした 。', en: 'We cast a line together, looked closely at what came up, and let it go into the same water.' },
      reply: {
        nao: { jp: '{待|ま}つ の も {仕事|しごと} の うち 、 って {言|い}った ろ 。', en: 'Told you: the waiting is part of the job.' },
        mio: { jp: '{見|み}てる だけ で 、 {楽|たの}しかった よ 。', en: 'Just watching was a pleasure.' },
        ren: { jp: '{場所|ばしょ} と {種類|しゅるい} 、 {正確|せいかく} に {残|のこ}して あります 。', en: 'Place and kind, kept accurately.' },
        suzu: { jp: '{静|しず}か な {舞台|ぶたい} も 、 {悪|わる}く ない わ ね 。', en: 'A quiet stage isn\'t bad either.' },
      },
    },
    reflection: {
      title: { jp: '{九|きゅう}{種類|しゅるい} の {見開|みひら}き', en: 'The nine-fish spread' },
      text: { jp: 'ヤス の {帳面|ちょうめん} に 、 {九|きゅう}{種類|しゅるい} の {記録|きろく} が {揃|そろ}った 。 {一緒|いっしょ} に {振|ふ}り{返|かえ}った 。', en: 'Nine kinds, side by side in Yasu\'s notebook. We looked back over them together.' },
    },
  });
})(RB.fishing);
