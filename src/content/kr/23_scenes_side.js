/* The Keepers' Road, Chapter 7: the side stories (expansion P10; R8's five).
 *   The Pilgrim's Stamp Book (kr_stamps): Iwa's dropped book, carried round the three lantern shrines for her.
 *   Three Tellings of the Fox Bridge (kr_fox): in 20_scenes_road.js (Shōzō, Kame, the register, the shrine board).
 *   The Keeper Who Stayed (kr_hisae): whether and how to tell Hisae the order is gone. Three permanent outcomes,
 *     each with what you mean to do shown before you commit (E17).
 *   The Rhyme of the Oil Cache (kr_cache): the children's song read as a map (the tellings, kr.t_cache).
 *   The Teacher's Inkstone (kr_inkstone): Tsuru's teacher's inkstone, sent down from Aya's teahouse; Tsuru's reply is
 *     held there for you (collected on any later visit; F-56).
 * Each reaches an authored end; every end is fine to have. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene kr.iwa_thanks
!faceplayer
kr_iwa[surprise]: まあ ！ わたし の {御朱印帳|ごしゅいんちょう} ！ {石段|いしだん} で {落|お}とした の ね 。 ありがとう 。 || Oh! My stamp book! I dropped it on the steps. Thank you.
kr_iwa: …… {実|じつ} は ね 、 {膝|ひざ} が {痛|いた}くて 、 もう {祠|ほこら} まで {登|のぼ}れない の 。 {悪|わる}い けど 、 この {帳面|ちょうめん} を {持|も}って 、 {三|みっ}つ の {祠|ほこら} を {回|まわ}って くれない ？ || …The truth is, my knees hurt and I can't climb to the shrines any more. I'm sorry to ask, but would you take the book round the three shrines for me?
kr_iwa: {麓|ふもと} の {祠|ほこら} 、 {石段|いしだん} の {上|うえ} の {祠|ほこら} 、 {狐|きつね} の {祠|ほこら} 。 {印|しるし} は 、 {祠|ほこら} の {前|まえ} で {手|て} を {合|あ}わせれば {押|お}せる わ 。 || The shrine at the foot, the one above the steps, and the fox shrine. Put your hands together before each, and you can press the seal.
!quest kr_stamps 1
!journal イワ さん の {代|か}わり に 、 {三|みっ}つ の {祠|ほこら} の {印|しるし} を もらおう 。 || Collect the three shrines' seals for Iwa.

@scene kr.iwa_done
!faceplayer
kr_iwa[happy]: {三|みっ}つ と も ！ …… {見|み}て 、 {灯|ひ} の {印|しるし} が {並|なら}んで いる 。 {願|ねが}い が かなう わ 。 || All three! …Look, the lamps' seals side by side. My wish will come true.
!take kr_stampbook
!quest kr_stamps done
kr_iwa: {願|ねが}い ？ {内緒|ないしょ} よ 。 …… この {道|みち} に 、 また {灯|ひ} が {点|つ}きます よう に 、 だった の 。 もう かなった けど ね 。 || My wish? That's a secret. …That the lamps on this road would be lit again, it was. And it's come true already.
narr: あなた の {旅|たび} の {判子帳|はんこちょう} に も 、 {祠|ほこら} の {印|しるし} が {押|お}されて いる 。 || The shrines' seals are pressed in your own Road Stamp Book too.

@scene kr.iwa_idle
!faceplayer
?(quest.kr_stamps=1) kr_iwa: {祠|ほこら} は {三|みっ}つ 。 {麓|ふもと} と 、 {石段|いしだん} の {上|うえ} と 、 {狐|きつね} の {祠|ほこら} よ 。 || Three shrines: at the foot, above the steps, and the fox shrine.
?(quest.kr_stamps=1) !end
?(!quest.kr_stamps) kr_iwa[worry]: {御朱印帳|ごしゅいんちょう} が ない の 。 {石段|いしだん} の どこか で {落|お}とした の かしら 。 || My stamp book's gone. I must have dropped it somewhere on the steps.
?(!quest.kr_stamps) !end
kr_iwa[smile]: {膝|ひざ} が よく なったら 、 {館|やかた} の {方|ほう} の {社|やしろ} に も {行|い}って みたい わ 。 || When my knees are better, I'd like to visit the shrine up by the hall too.

@scene kr.iwa_after
!faceplayer
kr_iwa[happy]: {灯|ひ} の ある {道|みち} は 、 {膝|ひざ} に も {優|やさ}しい の よ 。 {夜|よる} でも {歩|ある}ける から 。 || A lit road is kinder on the knees. You can walk it at night.

@scene kr.seiji_after
!faceplayer
kr_seiji: {古|ふる}い {社|やしろ} に {着|つ}きました 。 {祖父|そふ} の {代|か}わり の お{参|まい}り も 、 できました 。 || I reached the old shrine, and made my grandfather's visit for him.
kr_seiji: {館|やかた} の {戸|と} は 、 やっぱり {閉|し}まって いました 。 {社|やしろ} の {人|ひと} が {言|い}う に は 、 「{百|ひゃく} の {話|はなし} を {知|し}る {者|もの} だけ が {開|あ}けられる」 そう です よ 。 || The hall's door was shut, as they said. The shrine's keeper told me "only one who knows the hundred tales can open it".

@scene kr.hisae_after
!faceplayer
?(kr_hisae_plain) kr_hisae: {仲間|なかま} は もう いない 。 …… なら 、 {新|あたら}しい {仲間|なかま} を {育|そだ}てる まで さ 。 ソラ が {筋|すじ} が いい 。 || The others are gone. …Then I'll raise new ones. Sora has a knack for it.
?(kr_hisae_register) kr_hisae: {最後|さいご} の {頁|ページ} の {次|つぎ} に 、 {新|あたら}しい {頁|ページ} を {書|か}き{始|はじ}めた よ 。 「{灯|ひ} 、 {戻|もど}る」 。 || After the last page, I've started a new one. "The lamps return."
?(kr_hisae_silent) kr_hisae: {手紙|てがみ} を {書|か}いて いる の さ 。 {他|ほか} の {道|みち} の {灯守|ひもり} たち へ 。 {灯|ひ} が {戻|もど}った と 、 {知|し}らせて やらない と ね 。 || I'm writing letters. To the keepers on the other roads. They ought to know the lamps are back.
?(!kr_hisae_plain&!kr_hisae_register&!kr_hisae_silent) kr_hisae: {灯|ひ} が ある と 、 {夜|よる} が {短|みじか}い 。 {年寄|としよ}り に は ありがたい よ 。 || With the lamps lit, the nights are short. A mercy for an old woman.

@scene kr.hisae_truth
# The Keeper Who Stayed (E17): what to tell Hisae, permanent, with the intention shown before you commit.
!faceplayer
!if quest.kr_hisae=done -> done
kr_hisae: {記録|きろく} を {読|よ}んだ ん だろう 。 {顔|かお} に {書|か}いて ある よ 。 {何|なに} か {言|い}いたい こと が ある ん じゃ ない かい 。 || You read the registers. It's written on your face. Something you want to tell me?
!choice
* {仲間|なかま} は みんな {山|やま} を {下|お}りた と 、 そのまま {伝|つた}える 。 || Tell her plainly that the others all went down the mountain. -> plain
* {記録|きろく} の {最後|さいご} の {頁|ページ} を 、 {一緒|いっしょ} に {読|よ}む 。 || Read the register's last page with her. -> register
* {何|なに} も {言|い}わない 。 {仲間|なかま} は どこか に いる と {信|しん}じさせて おく 。 || Say nothing, and let her keep believing they are out there somewhere. -> silent
* {今|いま} は {話|はな}さない 。 || Not now. -> end
:plain
narr: あなた は 、 ヒサエ に はっきり {伝|つた}える つもり だ 。 {仲間|なかま} は もう いない と 。 {後|あと} で {取|と}り{消|け}す こと は できない 。 || You mean to tell Hisae straight out that the others are gone. It can't be taken back.
!choice
* {伝|つた}える 。 || Tell her. -> plain_go
* やめて おく 。 || Think again. -> end
:plain_go
kr_hisae: …… そう かい 。 || …Is that so.
narr: ヒサエ は {長|なが}い あいだ 、 {灯|ひ} を {見|み}て いた 。 || Hisae looks at her lamp for a long time.
kr_hisae: {知|し}って いた よ 。 {知|し}りたく なかった だけ さ 。 …… {言|い}って くれて 、 ありがとう 。 || I knew. I only didn't want to know. …Thank you for saying it.
!set kr_hisae_plain
!goto close
:register
narr: あなた は 、 {記録|きろく} の {最後|さいご} の {頁|ページ} を ヒサエ と {一緒|いっしょ} に {読|よ}む つもり だ 。 {言葉|ことば} で は なく 、 {記録|きろく} に {語|かた}らせる 。 {後|あと} で {取|と}り{消|け}す こと は できない 。 || You mean to read the register's last page with Hisae: let the record say it, not you. It can't be taken back.
!choice
* {一緒|いっしょ} に {読|よ}む 。 || Read it with her. -> register_go
* やめて おく 。 || Think again. -> end
:register_go
narr: 「{最後|さいご} の {一人|ひとり} 、 {山|やま} を {下|お}りる 。 ヒサエ のみ {残|のこ}る 。」 ヒサエ は {指|ゆび} で その {字|じ} を なぞった 。 || "The last one goes down the mountain. Only Hisae remains." Hisae traces the characters with her finger.
kr_hisae: {自分|じぶん} の {名前|なまえ} が 、 {最後|さいご} の {字|じ} か 。 …… なら 、 {次|つぎ} の {頁|ページ} は わたし が {書|か}く よ 。 || My own name, the last word written. …Then I'll write the next page myself.
!set kr_hisae_register
!goto close
:silent
narr: あなた は 、 {何|なに} も {言|い}わない つもり だ 。 ヒサエ は {仲間|なかま} に {手紙|てがみ} を {書|か}き{続|つづ}ける だろう 。 {後|あと} で {取|と}り{消|け}す こと は できない 。 || You mean to say nothing. Hisae will go on writing letters to the others. It can't be taken back.
!choice
* {言|い}わない 。 || Say nothing. -> silent_go
* やめて おく 。 || Think again. -> end
:silent_go
kr_hisae: …… {何|なに} も ない なら 、 いい さ 。 {仲間|なかま} へ の {手紙|てがみ} を 、 {書|か}き{上|あ}げない と ね 。 || …Nothing? Then that's fine. I must finish my letter to the others.
!set kr_hisae_silent
:close
!quest kr_hisae done
!journal ヒサエ に 、 {仲間|なかま} の こと を どう {伝|つた}える か {決|き}めた 。 || You decided what to tell Hisae about the others.
!end
:done
kr_hisae: {記録|きろく} の こと は 、 もう いい よ 。 || Enough about the registers now.
:end

@scene kr.hisae_inkstone
# The Teacher's Inkstone: given at dawn; sent from Aya's teahouse; Tsuru answers.
!faceplayer
kr_hisae: {葦|あし}ノ{瀬|せ} から {来|き}た ん だろう 。 これ を ツル に {届|とど}けて おくれ 。 あの {子|こ} の {師匠|ししょう} が 、 ここ で {使|つか}って いた {硯|すずり} さ 。 || You came from Reedwake, didn't you. Take this to Tsuru. Her teacher used this inkstone here.
kr_hisae: {麓|ふもと} の {茶屋|ちゃや} の アヤ に {頼|たの}めば 、 {油|あぶら} の {荷|に} と {一緒|いっしょ} に {下|した} へ {送|おく}って くれる よ 。 || Ask Aya at the teahouse at the foot. She'll send it down with the oil carriers.
!give kr_inkstone
!quest kr_inkstone 0
!journal ヒサエ から 、 ツル さん の {師匠|ししょう} の {硯|すずり} を {預|あず}かった 。 {麓|ふもと} の {茶屋|ちゃや} から {送|おく}ろう 。 || Hisae gave you Tsuru's teacher's inkstone. Send it from the teahouse at the foot.

@scene kr.aya_inkstone
!faceplayer
kr_aya: {硯|すずり} を {葦|あし}ノ{瀬|せ} の ツル さん へ ？ {任|まか}せて 。 {油|あぶら} の {荷|に} は 、 {明日|あした} {下|お}りる わ 。 || An inkstone for Tsuru of Reedwake? Leave it to me. The oil carriers go down tomorrow.
kr_aya: {返事|へんじ} が {来|き}たら 、 ここ で {預|あず}かって おく から ね 。 また {寄|よ}って 。 || If a reply comes, I'll keep it here for you. Do drop by again.
!take kr_inkstone
!quest kr_inkstone 1
!journal {硯|すずり} を ツル さん へ {送|おく}った 。 {返事|へんじ} は 、 {麓|ふもと} の {茶屋|ちゃや} に {届|とど}く 。 || The inkstone is on its way to Tsuru. Her reply will come to the teahouse at the foot.

@scene kr.inkstone_reply
!faceplayer
kr_aya[smile]: {来|き}た わ よ 、 {葦|あし}ノ{瀬|せ} から ！ ツル さん の {返事|へんじ} 。 || It's come, from Reedwake! Tsuru's reply.
narr: ツル の {字|じ} は 、 {細|ほそ}くて 、 {少|すこ}し {震|ふる}えて いる 。 || Tsuru's hand is fine, and a little shaky.
tsuru: {硯|すずり} 、 {確|たし}か に {受|う}け{取|と}った よ 。 {師匠|ししょう} の {手|て} の {跡|あと} が 、 まだ {残|のこ}って いる 。 || The inkstone arrived safely. My teacher's hand has left its mark on it still.
tsuru: ヒサエ さん が {生|い}きて いた と は ね 。 {子供|こども} の {頃|ころ} 、 {泣|な}いて ばかり の {師匠|ししょう} を 、 {叱|しか}って くれた {人|ひと} だ そう だ よ 。 || To think Hisae is still alive. When my teacher was a child who did nothing but cry, Hisae was the one who scolded them, I'm told.
tsuru: この {硯|すずり} で 、 ヒサエ さん に {返事|へんじ} を {書|か}く よ 。 {道|みち} の {灯|ひ} を ありがとう 。 || I'll write to Hisae with this inkstone. Thank you for the lamps on the road.
!quest kr_inkstone done

@scene kr.cache_spot
# The Rhyme of the Oil Cache: a broken lantern down the little path; where to dig is the tellings' (kr.t_cache).
!if kr_cache_found -> found
narr: {尾根|おね} の {小道|こみち} の {先|さき} に 、 {壊|こわ}れた {灯籠|とうろう} 。 {足元|あしもと} の {土|つち} が 、 {少|すこ}し {柔|やわ}らかい 。 || At the end of the little path off the ridge, a broken lantern. The ground at its foot is a little soft.
!if !kr_rhyme_heard -> later
!if !kr_stele_read -> later
narr: {歌|うた} と 、 {碑|ひ} と 、 クマゾウ の {話|はなし} 。 {油|あぶら} を どこ で {探|さが}す か 、 {比|くら}べて {決|き}めよう 。 || The song, the stele and Kumazō's memory: compare them and decide where to look for the oil.
!hook tellings kr.t_cache
!if var._tell=cancel -> later
!if var._tell=no -> nothing
?(var._tell=ok) narr: {尾根|おね} の {灯籠|とうろう} の {下|した} を 、 {一|ひと}つ ずつ {掘|ほ}り{返|かえ}した 。 {最後|さいご} に 、 {小道|こみち} の {先|さき} の {壊|こわ}れた {灯籠|とうろう} の {下|した} から 、 かめ@甕 が {出|で}て きた 。 || You dig under the ridge's lanterns one after another. Last of all, under the broken lantern down the little path, a jar.
?(var._tell=best) narr: {壊|こわ}れた {灯籠|とうろう} の {下|した} を {掘|ほ}る と 、 すぐ に {蓋|ふた} の {付|つ}いた かめ@甕 が {出|で}て きた 。 || You dig under the broken lantern, and almost at once a lidded jar comes up.
!set kr_cache_found
!give kr_oil
!quest kr_cache done
narr: {中|なか} は {菜種|なたね} の {油|あぶら} 。 {封|ふう} が {固|かた}くて 、 まだ {使|つか}える 。 || Rapeseed oil, sealed tight and still good.
?(comp=mio) comp[smile]: {封|ふう} の {仕方|しかた} が 、 {丁寧|ていねい} です ね 。 {灯守|ひもり} は 、 {後|あと} の {人|ひと} の こと を {考|かんが}えて いた ん だ わ 。 || Such careful sealing. The keepers were thinking of whoever came after them.
?(comp=nao) comp: {何十年|なんじゅうねん} {前|まえ} の {荷|に} が 、 やっと {届|とど}いた な 。 || A delivery decades late, finally arrived.
?(comp=ren) comp[happy]: {灯守|ひもり} の {油|あぶら} です 。 …… これ で 、 {灯|ひ} が もう {何|なん} {晩|ばん} か もちます 。 || Keepers' oil. …That will keep the lamps going a few more nights.
?(comp=suzu) comp[laugh]: {子供|こども} の {歌|うた} が {宝|たから} の {地図|ちず} 。 {芝居|しばい} に したい くらい ね 。 || A children's song as a treasure map. I'd put it on the stage.
!end
:nothing
narr: {言|い}われた ところ を {掘|ほ}って みた が 、 {何|なに} も {出|で}て こない 。 {歌|うた} の 「{三|みっ}つ{目|め}」 は 、 {当|あ}て に ならない の かも しれない 。 || You dig where that reading says, and find nothing. Perhaps the song's "the third" can't be relied on.
!end
:later
narr: {狐橋|きつねばし} の {子供|こども} の {歌|うた} と 、 {尾根|おね} の {碑|ひ} 。 {手|て}がかり が {揃|そろ}ったら 、 また {来|こ}よう 。 || The Fox Bridge children's song and the ridge's stele: come back when you have both.
!end
:found
narr: {掘|ほ}り{出|だ}した {穴|あな} が 、 {残|のこ}って いる 。 || The hole you dug is still there.

@scene kr.cache_jar
narr: {灯守|ひもり} の {油|あぶら} の かめ@甕 。 もう {空|から} だ 。 || The keepers' oil jar, empty now.
`, 'kr/side');
