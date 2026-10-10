/* Delvers (expansion P07; plan D8; src/engine/98b_delvers.js; F-31): six people the journey has met, from Reedwake to
 * Snowbell, who may be found in the depths: in the Flood Cellars (the lamp room on B1, or by the spring on B2) and at
 * the Unwritten Atlas's camp. Each has an aid (always given), and one memory question from a moment the player saw
 * with them (their source scene): answering it adds a little more; a wrong answer takes nothing away. The new
 * chapters' people join with their chapters. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const D = RB.delvers;
  RB.lex.add(RB.lex.parseTable(`
奇遇|きぐう|n|A|coincidence, a chance meeting
`), 'expeditions');
  D.define('yasu', { char: 'yasu', source: 'rw.yasu_after', aid: 'rest' });
  D.define('hana', { char: 'hana', source: 'rw.hana_first', aid: 'rest' });
  D.define('fuku', { char: 'fuku', source: 'sg.fuku_idle', aid: 'rest' });
  D.define('wataru', { char: 'wataru', source: 'sg.wataru_first', aid: 'shortcut' });
  D.define('goro', { char: 'co_goro', source: 'co.goro', aid: 'rest' });
  D.define('hoshino', { char: 'hoshino', source: 'sb.hoshino', aid: 'guide' });

  // where they may be in the cellars: the lamp room on B1, the west end of the south hall on B2
  const xp = RB.expedition.get('cellars');
  if (xp) {
    xp.delvers = { b1: { map: 'rw.cellar1', x: 35, y: 11, dir: 'down' }, b2: { map: 'rw.cellar2', x: 2, y: 16, dir: 'right' } };
    xp.delverChance = 0.5;
    for (const fl in xp.delvers) {
      const at = xp.delvers[fl], m = C.maps[at.map];
      for (const d of D.list()) m.npcs = (m.npcs || []).concat([{ id: d.char, char: d.char, x: at.x, y: at.y, dir: at.dir, arrive: 'here', leave: 'here', if: 'xp_cellars_dv_' + d.id + '_' + fl + '&!xp_cellars_dv_met', talk: [{ scene: 'dv.' + d.id }] }]);
    }
  }
})(RB.content);

RB.script.add(`
@scene dv.yasu
!faceplayer
yasu: おう 。 こんな {所|ところ} で {会|あ}う と は な 。 {水|みず} の {音|おと} が した から 、 {来|き}て みた んだ 。 || Well. Fancy meeting you here. I heard water, so I came to have a look.
yasu: {座|すわ}って いけ 。 {年寄|としよ}り の {茶|ちゃ} だ が 、 {温|あたた}まる ぞ 。 || Sit down a while. An old man's tea, but it'll warm you.
!hook dv_aid yasu
yasu: …… {川|かわ} の こと 、 {前|まえ} に {話|はな}した な 。 {俺|おれ} は {何|なん} と {言|い}った ？ || …I told you something about the river once. What did I say?
!choice
* {川|かわ} は {正直|しょうじき} だ 。 || That the river is honest: it shows you when it rises and when it falls. -> right
* {川|かわ} は {怖|こわ}い 。 || That the river is frightening. -> wrong
* {川|かわ} は {名前|なまえ} を {覚|おぼ}えて いる 。 || That the river remembers names. -> wrong
:right
yasu: よく {覚|おぼ}えて いた な 。 …… {覚|おぼ}えて いて くれる {人|ひと} も 、 {悪|わる}く ない 。 || You remembered. …People who remember aren't so bad either.
!hook dv_bonus yasu
!hook dv_met yasu 1
!end
:wrong
yasu: …… まあ 、 {年寄|としよ}り の {話|はなし} だ 。 {気|き} に する な 。 || …Well, an old man's talk. Don't let it trouble you.
!hook dv_met yasu 0

@scene dv.hana
!faceplayer
hana: あら 、 {奇遇|きぐう} ね 。 お{茶|ちゃ} の {葉|は} を {探|さが}しに {来|き}た の よ 。 || Oh, what a coincidence. I came looking for tea leaves.
hana: {一杯|いっぱい} どうぞ 。 {今日|きょう} は ふたつ {入|い}れて も 、 {飲|の}む {人|ひと} が いる わ 。 || Have a cup. Today, if I pour two, there's someone to drink the second.
!hook dv_aid hana
hana: {初|はじ}めて {会|あ}った {朝|あさ} 、 わたし が {何|なに} を {入|い}れて いた か 、 {覚|おぼ}えて いる ？ || The first morning we met, do you remember what I'd poured?
!choice
* お{茶|ちゃ} を ふたつ 。 || Two cups of tea: one for someone she couldn't remember. -> right
* お{茶|ちゃ} を みっつ 。 || Three cups of tea. -> wrong
* お{酒|さけ} を ひとつ 。 || One cup of sake. -> wrong
:right
hana: …… そう 。 ふたつ 。 {覚|おぼ}えて いて くれて 、 ありがとう 。 || …Yes. Two. Thank you for remembering.
!hook dv_bonus hana
!hook dv_met hana 1
!end
:wrong
hana: ふふ 、 {前|まえ} の こと だ もの ね 。 || Heh. It was a while ago, after all.
!hook dv_met hana 0

@scene dv.fuku
!faceplayer
fuku: まあ 、 こんな {所|ところ} で 。 {風|かぜ} の ない {日|ひ} は 、 {少|すこ}し {歩|ある}きたく なる の よ 。 || Well, of all places. On days without wind I feel like walking a little.
fuku: {少|すこ}し {休|やす}んで いきなさい 。 {急|いそ}ぐ {旅|たび} でも 、 {座|すわ}る {時間|じかん} は ある わ 。 || Rest a little. Even on a journey in a hurry, there's time to sit.
!hook dv_aid fuku
fuku: ベンチ で {誰|だれ} と {将棋|しょうぎ} を {指|さ}して いた か 、 {話|はな}した かしら 。 || Did I ever tell you who I used to play shōgi with on the bench?
!choice
* イサム さん 。 || Isamu, from up the west lane. -> right
* {旦那|だんな} さん 。 || Her husband. -> wrong
* アサヒ ちゃん 。 || Little Asahi. -> wrong
:right
fuku: そう 、 イサム さん 。 {覚|おぼ}えて いて くれた の ね 。 || Yes, Isamu. You remembered.
!hook dv_bonus fuku
!hook dv_met fuku 1
!end
:wrong
fuku: いい の よ 。 {名前|なまえ} は 、 わたし が {覚|おぼ}えて いる から 。 || That's all right. I remember the name for both of us.
!hook dv_met fuku 0

@scene dv.wataru
!faceplayer
wataru: あっ 、 {皆|みな}さん ！ {迷子|まいご} の {荷物|にもつ} を {探|さが}しに {来|き}た ん です 。 {仕事|しごと} の {癖|くせ} で …… 。 || Oh — it's you! I came looking for lost parcels. Occupational habit…
wataru: この {先|さき} の {道|みち} 、 {帳簿|ちょうぼ} に {書|か}き{写|うつ}して おきました 。 よかったら 。 || I copied the way ahead into my ledger. In case it helps.
!hook dv_aid wataru
wataru: {嵐|あらし} の {夜|よる} 、 {僕|ぼく} の {倉庫|そうこ} で {何|なに} が {起|お}きた か 、 {覚|おぼ}えて います か 。 || Do you remember what happened in my warehouse on the night of the storm?
!choice
* ラベル が {全部|ぜんぶ} {剥|は}がれた 。 || All the labels came off. -> right
* {倉庫|そうこ} が {燃|も}えた 。 || The warehouse burned. -> wrong
* {箱|はこ} が {流|なが}された 。 || The crates were washed away. -> wrong
:right
wataru: そう です 、 {全部|ぜんぶ} ！ …… {思|おも}い{出|だ}す と 、 まだ {手|て} が {震|ふる}えます 。 || That's right, every one! …My hands still shake when I think of it.
!hook dv_bonus wataru
!hook dv_met wataru 1
!end
:wrong
wataru: あはは 、 {僕|ぼく} の {話|はなし} なんて 、 {忘|わす}れて {当然|とうぜん} です よ 。 || Ha ha, no wonder you've forgotten my story.
!hook dv_met wataru 0

@scene dv.goro
!faceplayer
co_goro: おお 、 {若|わか}い の 。 {鐘|かね} の {綱|つな} に {使|つか}える {縄|なわ} を {探|さが}して おる ところ じゃ 。 || Oh, it's you young folk. I'm looking for a rope fit for the bell.
co_goro: {休|やす}んで いけ 。 わし も {腰|こし} を {下|お}ろす ところ だった 。 || Have a rest. I was just about to sit down myself.
!hook dv_aid goro
co_goro: {鐘|かね} は {磨|みが}いて おかん と 、 どう なる と {言|い}った かの ？ || What did I say happens to a bell if you don't polish it?
!choice
* {音|おと} が {曇|くも}る 。 || Its voice clouds over. -> right
* {錆|さ}びて {割|わ}れる 。 || It rusts and cracks. -> wrong
* {誰|だれ} も {鳴|な}らさなく なる 。 || Nobody rings it any more. -> wrong
:right
co_goro: そう じゃ 。 {鳴|な}らさん {鐘|かね} でも な 。 || That's it. Even a bell nobody rings.
!hook dv_bonus goro
!hook dv_met goro 1
!end
:wrong
co_goro: {年寄|としよ}り の {話|はなし} は 、 {長|なが}くて {覚|おぼ}えきれん から の 。 || An old man's stories go on too long to keep.
!hook dv_met goro 0

@scene dv.hoshino
!faceplayer
hoshino: …… おや 。 {郵便|ゆうびん} かね 。 いや 、 {違|ちが}う な 。 {道|みち} を {見|み}に {来|き}た んだ 。 || …Oh. The post? No, of course not. I came to look at the road.
hoshino: この {先|さき} の {様子|ようす} は 、 {見|み}て きた よ 。 {話|はな}して おこう 。 || I've seen what lies ahead. Let me tell you.
!hook dv_aid hoshino
hoshino: {娘|むすめ} の {名前|なまえ} を 、 {覚|おぼ}えて いる かね 。 || Do you remember my daughter's name?
!choice
* アカリ 。 || Akari. -> right
* ヤエ 。 || Yae. -> wrong
* ホシ 。 || Hoshi. -> wrong
:right
hoshino: …… そう 、 アカリ だ 。 {名前|なまえ} を {呼|よ}ばれる と 、 {少|すこ}し {近|ちか}く なる 。 || …Yes, Akari. When someone says her name, she feels a little closer.
!hook dv_bonus hoshino
!hook dv_met hoshino 1
!end
:wrong
hoshino: いい んだ 。 {私|わたし} が {何度|なんど} でも {言|い}う から 。 || It's all right. I'll say it as often as it takes.
!hook dv_met hoshino 0
`, 'expeditions/40_delvers.js');
