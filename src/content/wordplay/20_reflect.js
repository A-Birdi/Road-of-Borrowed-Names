/* Companion shiritori: How we played (Practice addendum §14.3), the thoughts a
 * finished game leaves for a quiet rest moment (§14.5), and the texts kept in
 * memories. One reflection per companion, offered once a substantial shared game
 * has been recorded; three personal statements plus Not now, none graded. A
 * cooperative chain is spoken of as a chain (no victory that did not happen); a
 * competitive game's actual winner is named only as a fact. Every reply gives the
 * same once-only point (RB.wordplay.reflect); Not now gives nothing and keeps it.
 *   Nao  practical planning and the pleasure of somebody keeping up
 *   Mio  taking a break; enjoying something without having to be useful
 *   Ren  how a small rule can make an interesting connection
 *   Suzu improvisation, conversational timing, sharing the spotlight */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content.wordplay = RB.content.wordplay || { lines: [], gestures: {}, reflections: {}, thoughts: [], texts: {} };

RB.script.add(`
@scene wp.reflect_nao
# Staged (at a rest place, anywhere it is told): you and Nao turn to each other. Nao looks one way and the other
# (counting exits partway through the game); put off, a nod; then a nod (we were reading the same map), a hand to
# the satchel (same as deliveries) or a glance aside (somebody keeping up); a shrug at your win, an open hand at
# theirs.
!look pc nao
!look nao pc
!gesture nao lookbetween left and=right
?(!wordplay.reflect=cooperative) comp: さっき の しりとり 、 どう だった ？ {俺|おれ} は {途中|とちゅう} から 、 {出口|でぐち} ばかり {数|かぞ}えて た 。 || That game of shiritori — how was it for you? Partway through, I was just counting exits.
?(wordplay.reflect=cooperative) comp: さっき の しりとり 、 {長|なが}く {繋|つな}がった な 。 {俺|おれ} は 、 あんた の {出口|でぐち} を {残|のこ}す の に {必死|ひっし} だった 。 || That chain earlier held together a long way. I was working hard to leave you a way out.
!choice
* どの {終|お}わり が まだ {使|つか}える か 、 {見|み}て いた || I was watching which endings were still available. -> endings
* {次|つぎ} の {言葉|ことば} を {探|さが}す の が {難|むずか}しかった || Finding the next word was the difficult part. -> finding
* {一緒|いっしょ} に {座|すわ}って {遊|あそ}ぶ の が {楽|たの}しかった || I mostly enjoyed sitting down to play together. -> together
* {今|いま} は いい || Not now. -> later
:later
!gesture nao nod pc
comp: ん 。 {急|いそ}ぐ {話|はなし} じゃ ない 。 || Mm. It's not urgent.
!hook wp_reflect_defer
!end
:endings
!gesture nao nod pc
?(!wordplay.reflect=cooperative) comp[smirk]: やっぱり な 。 {途中|とちゅう} から 、 あんた の {手|て} に {迷|まよ}い が なかった 。 {同|おな}じ {地図|ちず} を {見|み}て た わけ だ 。 || Thought so. Partway through, your moves stopped wavering. We were reading the same map.
?(wordplay.reflect=cooperative) comp[smile]: だから {繋|つな}がった ん だ な 。 {二人|ふたり} で {同|おな}じ {地図|ちず} を {見|み}て た 。 || That's why it held. We were both reading the same map.
!hook wp_reflect endings
!goto close
:finding
!gesture nao strap
comp: {分|わ}かる 。 {出口|でぐち} が ある の を {知|し}って いて も 、 {見|み}つける の は {別|べつ} の {話|はなし} だ 。 {配達|はいたつ} と {同|おな}じ だ 。 || I get it. Knowing there's an exit and finding it are two different things. Same as deliveries.
!hook wp_reflect finding
!goto close
:together
!gesture nao aside
comp[smile]: …… そう か 。 {俺|おれ} も だ 。 {誰|だれ} か が ちゃんと ついて きて くれる と 、 {張|は}り{合|あ}い が ある 。 || …Yeah. Me too. It's worth more when somebody's keeping up.
!hook wp_reflect together
:close
?(wordplay.won) !gesture nao shrug
?(wordplay.won) comp[smirk]: …… {勝|か}った の は あんた だった けど な 。 || …Though you were the one who won.
?(wordplay.lost) !gesture nao palm
?(wordplay.lost) comp: {勝|か}った の は {俺|おれ} だ が 、 {楽|らく} じゃ なかった 。 || I won, but it wasn't easy.
comp: また やろう 。 {次|つぎ} も {本気|ほんき} で {行|い}く 。 || Let's play again. I'll go all out next time too.

@scene wp.reflect_mio
# Staged (at a rest place, anywhere it is told): you and Mio turn to each other. A hand to her chin (she hadn't
# thought about medicine once); put off, a nod; then a breath out (not the only one counting slips), an open hand
# (every shelf in her head) or her hands fidget (fun, and of no use: allowed?); her laugh at your win, a head shake
# at hers; a nod: a new rule of hers.
!look pc mio
!look mio pc
!gesture mio chin
?(!wordplay.reflect=cooperative) comp: さっき の しりとり 、 どう でした か 。 {私|わたし} 、 {途中|とちゅう} で {薬|くすり} の こと を {一度|いちど} も {考|かんが}えて いない と {気|き}づきました 。 || How was that game for you? Partway through, I noticed I hadn't thought about medicine once.
?(wordplay.reflect=cooperative) comp: さっき の {札|ふだ} の {列|れつ} 、 {長|なが}く なりました ね 。 {私|わたし} 、 {途中|とちゅう} で {薬|くすり} の こと を {一度|いちど} も {考|かんが}えて いない と {気|き}づきました 。 || That row of slips grew long, didn't it. Partway through, I noticed I hadn't thought about medicine once.
!choice
* どの {終|お}わり が まだ {使|つか}える か 、 {見|み}て いた || I was watching which endings were still available. -> endings
* {次|つぎ} の {言葉|ことば} を {探|さが}す の が {難|むずか}しかった || Finding the next word was the difficult part. -> finding
* {一緒|いっしょ} に {座|すわ}って {遊|あそ}ぶ の が {楽|たの}しかった || I mostly enjoyed sitting down to play together. -> together
* {今|いま} は いい || Not now. -> later
:later
!gesture mio nod pc
comp[smile]: はい 。 また {今度|こんど} 。 || All right. Another time.
!hook wp_reflect_defer
!end
:endings
!gesture mio exhale
comp[smile]: {札|ふだ} を {数|かぞ}えて いた の は 、 {私|わたし} だけ じゃ なかった んです ね 。 {少|すこ}し {安心|あんしん} しました 。 || So I wasn't the only one counting slips. That's a relief.
!hook wp_reflect endings
!goto close
:finding
!gesture mio palm
comp: {私|わたし} も です 。 {頭|あたま} の {中|なか} の {棚|たな} を 、 {全部|ぜんぶ} {開|あ}けて {探|さが}して いる {気分|きぶん} でした 。 || Me too. It felt like opening every shelf in my head.
!hook wp_reflect finding
!goto close
:together
!gesture mio fidget
comp[shy]: …… はい 。 {何|なに} の {役|やく} に も {立|た}たない のに 、 {楽|たの}しかった 。 そう {言|い}って も いい んです ね 。 || …Yes. It wasn't useful for anything, and it was fun. I'm allowed to say that, aren't I.
!hook wp_reflect together
:close
?(wordplay.won) !gesture mio laugh
?(wordplay.won) comp[smile]: {勝|か}った の は あなた でした ね 。 {悔|くや}しい です けど 。 || You were the one who won. It stings a little.
?(wordplay.lost) !gesture mio shake
?(wordplay.lost) comp: {勝|か}った の は {私|わたし} でした が 、 それ は {大事|だいじ} な こと じゃ ありません ね 。 || I won, but that isn't what matters here.
!gesture mio nod pc
comp[smile]: また {休|やす}む {時|とき} に 、 {一局|いっきょく} 。 {私|わたし} の {新|あたら}しい {規則|きそく} です 。 || Another game the next time we rest. A new rule of mine.

@scene wp.reflect_ren
# Staged (at a rest place, anywhere it is told): you and Ren turn to each other. Ren reads from the record of the
# game, and looks back up; put off, a nod; then counting on the fingers (the tally never kept), a hand to the chin
# (like searching for a lamp) or an open hand (one small rule, two people at one table); the glasses for your win,
# a glance aside at theirs (a record doesn't tell everything); a nod.
!look pc ren
!look ren pc
!gesture ren read prop=book
?(!wordplay.reflect=cooperative) comp: {先|さき} ほど の しりとり の {記録|きろく} を 、 {読|よ}み{返|かえ}して いました 。 {最後|さいご} の {一字|いちじ} だけ で 、 {言葉|ことば} が {次|つぎ} の {言葉|ことば} を {呼|よ}ぶ 。 {不思議|ふしぎ} な {決|き}まり です 。 || I was rereading the record of our game. One last kana, and a word calls up the next. A curious rule.
?(wordplay.reflect=cooperative) comp: {先|さき} ほど の {長|なが}い しりとり 、 {記録|きろく} を {読|よ}み{返|かえ}して いました 。 {最後|さいご} の {一字|いちじ} だけ で 、 {言葉|ことば} が {次|つぎ} の {言葉|ことば} を {呼|よ}ぶ 。 {不思議|ふしぎ} な {決|き}まり です 。 || I was rereading the record of our long chain. One last kana, and a word calls up the next. A curious rule.
!choice
* どの {終|お}わり が まだ {使|つか}える か 、 {見|み}て いた || I was watching which endings were still available. -> endings
* {次|つぎ} の {言葉|ことば} を {探|さが}す の が {難|むずか}しかった || Finding the next word was the difficult part. -> finding
* {一緒|いっしょ} に {座|すわ}って {遊|あそ}ぶ の が {楽|たの}しかった || I mostly enjoyed sitting down to play together. -> together
* {今|いま} は いい || Not now. -> later
:later
!gesture ren nod pc
comp[smirk]: {承知|しょうち} しました 。 {記録|きろく} は {逃|に}げません 。 || Understood. The record won't run away.
!hook wp_reflect_defer
!end
:endings
!gesture ren count
comp[smirk]: {私|わたし} も です 。 {終|お}わり の {字|じ} を {帳面|ちょうめん} に {付|つ}けたく なりました 。 {付|つ}けません でした が 。 || Same here. I wanted to keep a tally of the endings in a notebook. I didn't.
!hook wp_reflect endings
!goto close
:finding
!gesture ren chin
comp: {答|こた}え が ある と {分|わ}かって いて も 、 {見|み}つかる まで は ない の と {同|おな}じ 。 {灯|あか}り {探|さが}し に {似|に}て います 。 || Even knowing an answer exists, until you find it, it may as well not. Like searching for a lamp.
!hook wp_reflect finding
!goto close
:together
!gesture ren palm
comp[smile]: …… {同感|どうかん} です 。 {小|ちい}さな {決|き}まり {一|ひと}つ で 、 {二人|ふたり} が {同|おな}じ {机|つくえ} に {座|すわ}る 。 {面白|おもしろ}い もの です 。 || …Agreed. One small rule, and two people sit at the same table. Interesting, that.
!hook wp_reflect together
:close
?(wordplay.won) !gesture ren glasses
?(wordplay.won) comp: {記録|きろく} に よれば 、 {勝|か}った の は あなた です 。 || According to the record, you were the winner.
?(wordplay.lost) !gesture ren aside
?(wordplay.lost) comp: {記録|きろく} に よれば {勝|か}った の は {私|わたし} です が 、 {記録|きろく} は {全部|ぜんぶ} を {語|かた}りません 。 || According to the record I won — but a record doesn't tell everything.
!gesture ren nod pc
comp[smile]: また {一局|いっきょく} 。 {次|つぎ} は {迷|まよ}わない よう に します 。 {多分|たぶん} 。 || Another game sometime. I'll try not to get lost next time. Probably.

@scene wp.reflect_suzu
# Staged (at a rest place, anywhere it is told): you and Suzu turn to each other. Two showman's hands (a stage with
# no script); put off, her laugh; then a nod (someone who reads ahead), she looks away and back (the pause when
# your line won't come) or her open-handed thanks (sharing the spotlight); a small celebration at your lead role,
# an open hand at hers (the applause is for both of us).
!look pc suzu
!look suzu pc
!gesture suzu size
?(!wordplay.reflect=cooperative) comp: さっき の しりとり 、 {楽|たの}しかった わ 。 {台本|だいほん} の ない {舞台|ぶたい} って 、 {久|ひさ}しぶり 。 あなた は どう だった ？ || That game was fun. A stage with no script — it's been a while. How was it for you?
?(wordplay.reflect=cooperative) comp: さっき の しりとり 、 {二人|ふたり} で {台本|だいほん} なし の {舞台|ぶたい} を やった みたい だった わ 。 あなた は どう だった ？ || That chain felt like the two of us putting on a show with no script. How was it for you?
!choice
* どの {終|お}わり が まだ {使|つか}える か 、 {見|み}て いた || I was watching which endings were still available. -> endings
* {次|つぎ} の {言葉|ことば} を {探|さが}す の が {難|むずか}しかった || Finding the next word was the difficult part. -> finding
* {一緒|いっしょ} に {座|すわ}って {遊|あそ}ぶ の が {楽|たの}しかった || I mostly enjoyed sitting down to play together. -> together
* {今|いま} は いい || Not now. -> later
:later
!gesture suzu laugh
comp[laugh]: {了解|りょうかい} 。 {楽屋|がくや} の {話|はなし} は また {今度|こんど} ね 。 || Understood. Backstage talk can wait for another time.
!hook wp_reflect_defer
!end
:endings
!gesture suzu nod pc
comp[smirk]: {先|さき} を {読|よ}む {人|ひと} ね 。 {即興|そっきょう} でも 、 {一番|いちばん} {大事|だいじ} なの は {間|ま} を {読|よ}む こと よ 。 || Someone who reads ahead. Even improvising, what matters most is reading the timing.
!hook wp_reflect endings
!goto close
:finding
!gesture suzu avert pc
comp: {分|わ}かる わ 。 {台詞|せりふ} が {出|で}て こない {時|とき} の あの {間|ま} 。 でも 、 {待|ま}って もらえる {舞台|ぶたい} は {悪|わる}く ない でしょ 。 || I know. That pause when your line won't come. But a stage where someone waits for you isn't so bad, is it.
!hook wp_reflect finding
!goto close
:together
!gesture suzu thanks pc
comp[smile]: …… ふふ 。 {一人|ひとり} で {光|ひかり} を {浴|あ}びる より 、 {二人|ふたり} で {分|わ}けた {方|ほう} が {楽|たの}しい の よ 。 || …Heh. Sharing the spotlight is more fun than standing in it alone.
!hook wp_reflect together
:close
?(wordplay.won) !gesture suzu celebrate
?(wordplay.won) comp[laugh]: {主役|しゅやく} を {取|と}った の は あなた だった けど ね 。 || Though you were the one who took the lead role.
?(wordplay.lost) !gesture suzu palm
?(wordplay.lost) comp: {勝|か}った の は {私|わたし} だけど 、 {拍手|はくしゅ} は {二人|ふたり} {分|ぶん} よ 。 || I won, but the applause is for both of us.
comp[smile]: また {幕|まく} を {開|あ}けましょう 。 {次|つぎ} の {舞台|ぶたい} も {楽|たの}しみ に してる わ 。 || Let's raise the curtain again. I'm looking forward to the next show.
`, 'wordplay/20_reflect');

(function (W) {
  'use strict';
  // the scene for the committed companion
  W.reflections = { nao: 'wp.reflect_nao', mio: 'wp.reflect_mio', ren: 'wp.reflect_ren', suzu: 'wp.reflect_suzu' };
  // what the player said (the memory keeps the reply as it was chosen)
  W.texts = {
    memTogether: { jp: 'しりとり', en: 'A game of shiritori' },
    memClear: { jp: '{初|はじ}めて の {勝|か}ち', en: 'A first shiritori win' },
    memSharp: { jp: '{鋭|するど}い {相手|あいて} に {勝|か}った', en: 'A win against Sharp play' },
    memReflect: { jp: 'どう {遊|あそ}んだ か', en: 'How we played' },
    replies: {
      endings: { jp: 'どの {終|お}わり が まだ {使|つか}える か 、 {見|み}て いた', en: 'I was watching which endings were still available.' },
      finding: { jp: '{次|つぎ} の {言葉|ことば} を {探|さが}す の が {難|むずか}しかった', en: 'Finding the next word was the difficult part.' },
      together: { jp: '{一緒|いっしょ} に {座|すわ}って {遊|あそ}ぶ の が {楽|たの}しかった', en: 'I mostly enjoyed sitting down to play together.' },
    },
    desc: {
      coop: { jp: 'しりとり を {一緒|いっしょ} に {続|つづ}けた 。' },
      win: { jp: 'しりとり で {勝|か}った 。' },
      loss: { jp: 'しりとり で {負|ま}けた 。' },
    },
  };
  // a recent game's thought, for a quiet rest moment only (kind 'rest'): after a story topic, the
  // companion's own quest, an owed ending or a Pages conversation; gone after 8 minutes of play or a chapter
  const T = (comp, kind, jp, en) => W.thoughts.push({ comp, kind: 'rest', when: 'wordplay.recent=' + kind, prio: 5, text: { jp, en } });
  T('nao', 'win', 'さっき の {負|ま}け 、 どこ で {出口|でぐち} を {使|つか}い{切|き}った か 、 まだ {考|かんが}えて いる 。', 'Still working out where I spent my last exit in that game.');
  T('nao', 'loss', 'さっき の {勝負|しょうぶ} 、 あんた は {最後|さいご} まで {粘|ねば}った な 。', 'You held on right to the end in that game.');
  T('nao', 'coop', '{二人|ふたり} で {繋|つな}いだ しりとり 、 {悪|わる}く なかった 。', 'That chain we built together wasn\'t bad.');
  T('nao', 'stop', 'しりとり の {続|つづ}き は 、 いつ でも いい 。', 'We can pick the shiritori up again any time.');
  T('mio', 'win', '{負|ま}けた のに 、 {気持|きも}ち が {軽|かる}い んです 。 {不思議|ふしぎ} です 。', 'I lost, and I feel lighter. Strange.');
  T('mio', 'loss', '{勝|か}った のに 、 {一番|いちばん} {覚|おぼ}えて いる の は あなた の {言葉|ことば} です 。', 'I won, but what I remember most are your words.');
  T('mio', 'coop', '{札|ふだ} を {並|なら}べる の 、 {薬|くすり} を {並|なら}べる より {楽|たの}しかった です 。', 'Laying out word slips was more fun than laying out medicine.');
  T('mio', 'stop', '{休|やす}む の が 、 {少|すこ}し {上手|じょうず} に なった {気|き} が します 。', 'I think I\'m getting a little better at resting.');
  T('ren', 'win', '{私|わたし} の {計画|けいかく} の どこ が {外|はず}れた か 、 {記録|きろく} を {見直|みなお}して います 。', 'I\'m going back over the record to see where my plan went wrong.');
  T('ren', 'loss', '{勝|か}った {試合|しあい} の {記録|きろく} ほど 、 {読|よ}み{返|かえ}す と {粗|あら} が {見|み}えます 。', 'The record of a game you won shows its flaws most when you reread it.');
  T('ren', 'coop', '{二人|ふたり} の {言葉|ことば} が 、 {一本|いっぽん} の {線|せん} に なりました 。', 'Our words made a single line.');
  T('ren', 'stop', 'きり の {良|よ}い ところ で {止|と}める の も 、 {記録|きろく} の うち です 。', 'Stopping at a good place is part of record-keeping too.');
  T('suzu', 'win', '{負|ま}けた {舞台|ぶたい} ほど 、 {次|つぎ} が {楽|たの}しみ に なる の よ 。', 'The shows I lose make me look forward to the next one most.');
  T('suzu', 'loss', '{勝|か}った けど 、 {一番|いちばん} {覚|おぼ}えて いる の は あなた の {返|かえ}し よ 。', 'I won, but what I remember most is how you answered.');
  T('suzu', 'coop', '{二人|ふたり} の {舞台|ぶたい} 、 また やりたい わ 。', 'I\'d like to do our two-person show again.');
  T('suzu', 'stop', '{幕間|まくあい} も {舞台|ぶたい} の うち よ 。', 'The interval is part of the show too.');
  // the companionship module's thought registry (src/engine/58_companion.js) shows them at rest stops
  if (RB.content.company && Array.isArray(RB.content.company.thoughts)) for (const t of W.thoughts) RB.content.company.thoughts.push(t);
})(RB.content.wordplay);
