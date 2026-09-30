/* Companion reactions to the two cases (addendum §7.5, §9; contract §7):
 * data for RB.company.addReactions, event 'case:<id>', facts.method = how it
 * was actually resolved (the case definitions' method()). Every companion has
 * a line for every method; the choice is stored once per resolution, so a
 * reload shows the same one. Asking for help is never judged. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const R = [];
  const add = (event, comp, method, lines) => R.push({ id: event.replace(':', '_') + '_' + comp + '_' + method, comp, event, facts: { method }, priority: 1, lines });
  const L = (jp, en, expr) => ({ jp, en, expr: expr || null });

  // ---- Case A: the parcel ----------------------------------------------------------------------
  add('case:parcel', 'nao', 'reasoned', [L('{記録|きろく} を {読|よ}んで 、 {台|だい} と {鈴|すず} を {確|たし}かめて 、 それ から {渡|わた}す 。 …… {配達|はいたつ} の お{手本|てほん} だ よ 。', 'Read the record, checked the bench and the bell, then handed it over. …Textbook delivery.', 'smile')]);
  add('case:parcel', 'nao', 'early', [L('{鈴|すず} の {印|しるし} で {分|わ}かった の か 。 {勘|かん} じゃ なくて 、 {目|め} が いい ん だ な 。', 'You knew it by the bell\'s mark. That\'s not luck, that\'s a good eye.', 'smirk')]);
  add('case:parcel', 'nao', 'helped', [L('{届|とど}いた なら 、 それ で いい 。 {道|みち} を {聞|き}く の も {配達人|はいたつにん} の {仕事|しごと} だ 。', 'It got there, and that\'s what counts. Asking the way is part of a courier\'s job too.')]);
  add('case:parcel', 'mio', 'reasoned', [L('{一|ひと}つ ずつ {確|たし}かめて 、 {間違|まちが}えず に {届|とど}けられました ね 。 ハマ さん 、 {嬉|うれ}しそう でした 。', 'You checked each thing in turn and got it to the right person. Hama looked so pleased.', 'smile')]);
  add('case:parcel', 'mio', 'early', [L('あの {呼|よ}び{鈴|りん} を {見|み}て 、 すぐ {分|わ}かった んです ね 。 すごい 。', 'You saw that call bell and knew straight away. Impressive.', 'surprise')]);
  add('case:parcel', 'mio', 'helped', [L('{分|わ}からない とき に {聞|き}く の は 、 {大事|だいじ} な こと です 。 {小包|こづつみ} も 、 ちゃんと {届|とど}きました 。', 'Asking when you don\'t know is important. And the parcel got where it was going.', 'smile')]);
  add('case:parcel', 'ren', 'reasoned', [L('{宛名|あてな} 、 {記録|きろく} 、 {今|いま} の {道具|どうぐ} 。 {三|みっ}つ が {一|ひと}つ の {場所|ばしょ} を {指|さ}した 。 {灯|ひ} の {名|な} を {読|よ}む の と {同|おな}じ {手順|てじゅん} です 。', 'The address, the record, the tools as they are now: all three pointed to one place. The same way one reads a lantern\'s name.')]);
  add('case:parcel', 'ren', 'early', [L('{印|しるし} を {覚|おぼ}えて いた の です ね 。 {私|わたし} は {道|みち} は {覚|おぼ}えられません が 、 {印|しるし} なら …… {少|すこ}し は 。', 'You remembered the mark. I can\'t remember roads, but marks… a little.')]);
  add('case:parcel', 'ren', 'helped', [L('{教|おし}わった {道|みち} で も 、 {歩|ある}いた の は あなた です 。', 'Even on a road someone pointed out, you were the one who walked it.')]);
  add('case:parcel', 'suzu', 'reasoned', [L('{伏線|ふくせん} を ぜんぶ {回収|かいしゅう} ！ {帳簿|ちょうぼ} も {合|あ}った し 、 {気持|きも}ち いい わ 。', 'Every thread tied up! And the books balance. Lovely.', 'laugh')]);
  add('case:parcel', 'suzu', 'early', [L('{最後|さいご} の {幕|まく} まで {待|ま}たず に {犯人|はんにん} を {当|あ}てる {観客|かんきゃく} 、 いる の よ ね 。 あなた みたい な 。', 'There\'s always someone in the audience who guesses before the last act. Someone like you.', 'smirk')]);
  add('case:parcel', 'suzu', 'helped', [L('{台本|だいほん} を {覗|のぞ}いて も 、 {舞台|ぶたい} は {舞台|ぶたい} 。 {届|とど}けた の は {本物|ほんもの} よ 。', 'Peek at the script if you like; the performance is still real. That was a real delivery.', 'smile')]);

  // ---- Case B: the view --------------------------------------------------------------------------------
  const perspective = {
    nao: L('{裏|うら} から {見|み}て た から {合|あ}わなかった 。 …… {分|わ}かって みれば 、 {単純|たんじゅん} な {話|はなし} だ な 。', 'We were looking at it from the back, that\'s why nothing matched. …Simple, once you see it.', 'smirk'),
    mio: L('{同|おな}じ {景色|けしき} でも 、 {向|む}き が {違|ちが}う と {別|べつ} の {場所|ばしょ} に {見|み}える んです ね 。 {人|ひと} の {話|はなし} も 、 {時々|ときどき} そう です 。', 'The same view can look like another place when you face it the other way. People\'s stories are like that sometimes.'),
    ren: L('{正|ただ}しい {側|がわ} から {見|み}れば 、 {迷|まよ}う こと は ない 。 …… {地図|ちず} も 、 そう で あって ほしい です 。', 'Seen from the right side, there\'s no getting lost. …I wish maps worked like that.'),
    suzu: L('{袖|そで} から {見|み}た {舞台|ぶたい} と 、 {客席|きゃくせき} から {見|み}た {舞台|ぶたい} 。 {同|おな}じ {芝居|しばい} なのに ね 。', 'The stage from the wings, and the stage from the seats. The same play, all the same.', 'smile'),
  };
  for (const c in perspective) {
    add('case:view', c, 'noticed', [perspective[c]]);
    add('case:view', c, 'compared', [perspective[c]]);
  }
  add('case:view', 'nao', 'note', [L('{描|か}いた {本人|ほんにん} の {書|か}き{置|お}き が {決|き}め{手|て} か 。 {手紙|てがみ} は {読|よ}んで おく もの だ な 。', 'The artist\'s own note settled it. Always worth reading the letter.', 'smile')]);
  add('case:view', 'nao', 'helped', [L('{裏返|うらがえ}す だけ 、 か 。 {聞|き}いて {損|そん} は なかった な 。', 'Just turn it over, eh. No harm in asking.')]);
  add('case:view', 'mio', 'note', [L('{宿|やど} の {帳面|ちょうめん} に {残|のこ}って いた {言葉|ことば} が 、 {今|いま} に なって {役|やく}に{立|た}った んです ね 。', 'A few lines left in an inn\'s guestbook turned out to matter, all this time later.', 'smile')]);
  add('case:view', 'mio', 'helped', [L('{分|わ}かって しまえば 、 {怖|こわ}く ない でしょう 。 {景色|けしき} も 、 ちゃんと {見|み}られました し 。', 'Once you know, it isn\'t daunting at all. And we got to see the view properly.', 'smile')]);
  add('case:view', 'ren', 'note', [L('{描|か}き{手|て} が {自分|じぶん} で {印|しるし} の {意味|いみ} を {書|か}き{残|のこ}して いた 。 {記録|きろく} を {残|のこ}す {人|ひと} は 、 {信用|しんよう} できます 。', 'The artist wrote down what her mark meant. People who leave records can be trusted.')]);
  add('case:view', 'ren', 'helped', [L('{方角|ほうがく} を {人|ひと} に {尋|たず}ねる の は 、 {私|わたし} の {得意|とくい} {分野|ぶんや} です 。 {恥|は}ずかしい こと で は ありません 。', 'Asking someone the way is my speciality. There\'s nothing embarrassing about it.')]);
  add('case:view', 'suzu', 'note', [L('{種|たね} を {書|か}いた {紙|かみ} を 、 {宿|やど} に {置|お}いて いく {手品師|てじなし} なんて ね 。 {粋|いき} だ わ 。', 'A magician who leaves the secret written down at an inn. How stylish.', 'laugh')]);
  add('case:view', 'suzu', 'helped', [L('{種明|たねあ}かし を {聞|き}いて も 、 この {景色|けしき} は {色褪|いろあ}せない わ よ 。', 'Knowing how the trick works doesn\'t make this view any less lovely.', 'smile')]);

  if (RB.company && RB.company.addReactions) RB.company.addReactions(R);
  RB.content.caseReactions = R;
})();
