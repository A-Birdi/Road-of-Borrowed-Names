/* Chapter 3 — Suzu's story: the comforting lie that outlived its purpose.
 * Full personal quest when Suzu is the companion (comp=suzu); a shorter
 * cameo version otherwise (she arrives for the festival). Both versions end
 * in the same workshop scene, where Hiro's answer is his own. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.suzu_night
# Staged (Chapter 3 performed interaction): the fade covers only the time changing; Suzu is found
# sitting on the edge of the inn's raised floor at night, and tells it from there (her account book
# in her hands); she stands when she decides to help. Ambience is presentation only (!ambience).
!if comp!=suzu -> end
!if seen.co.suzu_night_done -> end
!fade out
!music companion_suzu
!ambience night_in
!walkto comp 8 4 down now
!pose comp sitlook
!fade in
narr: その {夜|よる} 。 {宿|やど} の {縁側|えんがわ} に 、 スズ が {一人|ひとり} で {座|すわ}って いた 。 || That night, Suzu is sitting alone on the inn's veranda.
!walkto pc 7 4 right
!pose comp sit
!look comp pc
comp[smile]: あら 、 {眠|ねむ}れない の ？ {私|わたし} も 。 {枕|まくら} が {変|か}わる と ダメ な の よ 。 {旅芸人|たびげいにん} の くせ に 。 || Oh, can't sleep? Me neither. A new pillow always gets me. And me a travelling performer.
pc: スズ 。 この {里|さと} に 、 {来|き}た こと が ある ん だろう 。 || Suzu. You've been to this village before, haven't you.
!gesture comp laugh
comp[laugh]: {来|き}た こと ？ ある ある 。 {百回|ひゃっかい} くらい 。 {柿|かき} を {食|た}べ に 。 || Been here? Oh, loads. A hundred times. For the persimmons.
!gesture comp lowered hold
comp[closed]: …… || …
comp: …… {一回|いっかい} だけ 。 {二十年前|にじゅうねんまえ} 。 {一座|いちざ} で 、 {秋祭|あきまつ}り の {舞台|ぶたい} に {立|た}つ はず だった 。 {私|わたし} は {十六|じゅうろく} で 、 {初|はじ}めて {台詞|せりふ} を もらった {年|とし} 。 || …Once. Twenty years ago. With the troupe — we were booked for the autumn festival. I was sixteen. The first year I had lines of my own.
comp: {前|まえ} の {晩|ばん} に 、 {火事|かじ} が あった 。 {上|うえ} の {段|だん} が {燃|も}えた 。 {私|わたし} たち の {天幕|てんまく} は {水路|すいろ} の {下|した} に あって 、 {下|お}りて くる {子|こ}ども たち を {数|かぞ}えて いた 。 || The night before, there was a fire. The upper terraces burned. Our tents were at the bottom of the channel, and we counted the children as they came down.
!gesture pc listen comp
pc: {覚|おぼ}えて いる の か 。 {里|さと} の {人|ひと} は {誰|だれ} も …… || You remember it. Nobody in the village…
comp: {私|わたし} たち は {次|つぎ} の {朝|あさ} に {発|た}った から 。 {静寂|しじま} が {来|き}た の は 、 たぶん {冬|ふゆ} 。 {私|わたし} だけ 、 {取|と}られ {損|そこ}ねた の ね 。 || We left the next morning. I think the Hush came that winter. I'm the one it missed.
!gesture comp touchhair then=lowered hold
comp[sad]: その {朝|あさ} 、 {小|ちい}さな {男|おとこ} の {子|こ} が {私|わたし} の リボン を {引|ひ}っ{張|ぱ}って 、 「 お{母|かあ}さん は どこ ？ 」 って {聞|き}いた の 。 || That morning a little boy tugged at my ribbon and asked me, "Where's my mum?"
comp: {私|わたし} は {知|し}ってた 。 {窯|かま} の {人|ひと} で 、 {上|うえ} へ {行|い}った まま {戻|もど}らなかった 。 || I knew. She worked the kiln. She went up the hill and didn't come back.
comp: {私|わたし} は {言|い}った 。 「 お{母|かあ}さん は {一座|いちざ} と {一緒|いっしょ} に {先|さき} へ {行|い}った の 。 {春|はる} に なったら {帰|かえ}って くる よ 」 って 。 || I told him: "Your mum's gone on ahead with the troupe. She'll be back when spring comes."
!gesture comp avert pc hold
comp[closed]: …… {台詞|せりふ} の {稽古|けいこ} より 、 ずっと {上手|じょうず} に {言|い}えた 。 || …I delivered it far better than any line I'd rehearsed.
pc: その {子|こ} が …… || That boy…
!gesture comp nod pc
comp: ヒロ 。 {広場|ひろば} の {空|あ}いた {席|せき} 。 {毎年|まいとし} {誰|だれ} か の ため に {空|あ}けて ある って 、 サヨ さん が {言|い}ってた でしょ 。 || Hiro. The empty seat in the square. Sayo said someone keeps it free every year, didn't she.
!prop comp accountbook
!gesture comp read prop=accountbook hold
narr: スズ は {小|ちい}さな {帳簿|ちょうぼ} を {取|と}り{出|だ}して 、 {最後|さいご} の {頁|ページ} を {開|ひら}いた 。 {丁寧|ていねい} な {字|じ} が {並|なら}んで いる 。 || Suzu takes out a little account book and opens it at the last page. Neat lines of names and figures.
comp: {私|わたし} ね 、 {借|か}り は {全部|ぜんぶ} {書|か}いて おく の 。 {宿代|やどだい} 、 {傘|かさ} 、 {貸|か}して もらった {針|はり} {一本|いっぽん} まで 。 {返|かえ}したら {線|せん} を {引|ひ}く 。 || I write down every debt, you know. Lodgings, umbrellas, a single needle someone lent me. When I pay, I cross it out.
!gesture comp present pc prop=accountbook hold
comp: {線|せん} が {引|ひ}けて ない の は 、 これ だけ 。 || This is the only one I've never crossed out.
narr: 「 ヒロ ── {本当|ほんとう} の こと {一|ひと}つ 。 {未払|みはら}い 。 」 || "Hiro — one truth. Unpaid."
!gesture comp read prop=accountbook hold
comp: {何年|なんねん} か して 、 {手紙|てがみ} を {書|か}いた こと が ある 。 {本当|ほんとう} の こと を 。 でも {封|ふう} を する {前|まえ} に 、 {字|じ} が {全部|ぜんぶ} {白|しろ}く {消|き}えた 。 || A few years later I wrote him a letter. The truth. But before I could seal it, every word faded to white.
!prop comp -
!gesture comp laugh
comp[laugh]: {嘘|うそ} は {残|のこ}って 、 {本当|ほんとう} は {消|き}える 。 {皮肉|ひにく} でしょ ？ あの {夜|よる} の こと で 、 {静寂|しじま} が {取|と}らなかった の は 、 {私|わたし} の {嘘|うそ} だけ 。 {痛|いた}い ところ が {一|ひと}つ も ない から 。 || The lie stays; the truth fades. Ironic, isn't it? Of everything about that night, the only thing the Hush didn't take was my lie. There's nothing in it that hurts.
!choice
* {今|いま} なら 、 {届|とど}く かも しれない 。 || Maybe now it could reach him. -> reach
* {無理|むり} に {話|はな}さなくて いい 。 || You don't have to tell him. -> push
:reach
!gesture comp chin hold
comp[think]: …… {里|さと} が {火事|かじ} を {思|おも}い{出|だ}せば 、 {本当|ほんとう} の こと も {字|じ} に {残|のこ}る 。 そう いう こと ね 。 || …If the village remembers the fire, the truth will stay on the page too. That's what you mean.
!goto both
:push
!gesture comp shake
comp[smile]: {優|やさ}しい の ね 。 でも それ 、 {二十年前|にじゅうねんまえ} の {私|わたし} と {同|おな}じ {台詞|せりふ} よ 。 || You're kind. But that's exactly the line I gave myself twenty years ago.
!goto both
:both
!pose comp -
!gesture comp nod pc
comp: {火事|かじ} を {取|と}り{戻|もど}す の を 、 {手伝|てつだ}う わ 。 {全部|ぜんぶ} {終|お}わったら 、 {言|い}う 。 {今度|こんど} は {字|じ} が {消|き}えない よう に 。 || I'll help you bring the fire back. And when it's done, I'll tell him. So that this time the words don't fade.
!gesture comp palm pc
comp[smirk]: …… その {前|まえ} に 、 ヒロ が {今|いま} {何|なに} を {信|しん}じてる か 、 {確|たし}かめたい 。 {付|つ}いて {来|き}て くれる ？ {観客|かんきゃく} が いる と 、 {私|わたし} 、 {強|つよ}い の 。 || …Before that, I want to know what Hiro believes now. Will you come? I'm braver with an audience.
!note co_suzu_ledger
!quest co_suzu 1
!set co_suzu_told
!call co.suzu_night_done
!autosave

@scene co.suzu_night_done
!music cinder

@scene co.suzu_ask
pc: {広場|ひろば} の {空|あ}いた {席|せき} 、 {誰|だれ} の ため の {席|せき} です か 。 || The empty seat in the square — who is it for?
hiro[think]: …… {母|はは} の だ 。 || …My mother's.
hiro: {俺|おれ} が {七|なな}つ の {年|とし} に 、 {旅|たび} の {一座|いちざ} と {一緒|いっしょ} に {先|さき} へ {行|い}った 。 {春|はる} に {帰|かえ}る 、 って 。 || The year I was seven, she went on ahead with a travelling troupe. Said she'd be back in spring.
hiro[smirk]: {春|はる} は {二十回|にじゅっかい} {来|き}た 。 {変|へん} な {話|はなし} だろ 。 {分|わ}かってる 。 || Spring has come twenty times. Strange story, I know.
hiro: {赤|あか}い リボン の {姉|ねえ}ちゃん が 、 そう {教|おし}えて くれた 。 {顔|かお} は {覚|おぼ}えて ない 。 リボン だけ 。 || A girl with a red ribbon told me. I don't remember her face. Just the ribbon.
?(comp=suzu) narr: スズ の {手|て} が 、 {色褪|いろあ}せた リボン に {触|ふ}れて 、 すぐ {離|はな}れた 。 || Suzu's hand brushes her faded ribbon, and drops away.
hiro: {席|せき} を {空|あ}けて おく の は …… {習|なら}わし だ 。 {待|ま}ってる わけ じゃ ない 。 たぶん 。 || Keeping the seat is… a habit. It's not that I'm waiting. Probably.
hiro: {他|ほか} に {何|なに} か {理由|りゆう} が ある {気|き} が する んだ が 、 {考|かんが}える と {頭|あたま} が {白|しろ}く なる 。 || I feel there's some other reason, but when I try to think about it, my head goes white.
?(comp=suzu) comp[smile]: …… {素敵|すてき} な {習|なら}わし ね 。 ありがとう 、 {話|はな}して くれて 。 || …It's a lovely custom. Thank you for telling us.
?(comp=suzu) hiro: …… あんた 、 どこ か で {会|あ}った か ？ || …Have we met?
?(comp=suzu) comp[laugh]: {旅芸人|たびげいにん} の {顔|かお} は 、 みんな どこ か で {見|み}た {顔|かお} よ 。 || Every travelling performer has a face you've seen somewhere.
?(comp=suzu) narr: {工房|こうぼう} を {出|で}る と 、 スズ は {一度|いちど} だけ {振|ふ}り{返|かえ}った 。 || Outside the workshop, Suzu looks back just once.
?(comp=suzu) comp: …… リボン だけ {覚|おぼ}えてる 、 か 。 {私|わたし} も {同|おな}じ よ 。 あの {子|こ} の {顔|かお} より 、 {引|ひ}っ{張|ぱ}られた リボン の {感|かん}じ の {方|ほう} を {覚|おぼ}えてる 。 || …He remembers only the ribbon. Same for me. I remember the tug on the ribbon better than his face.
?(comp=suzu) comp: {今|いま} {言|い}って も 、 {火事|かじ} ごと {頭|あたま} から {滑|すべ}り{落|お}ちる だけ 。 {窯|かま} が {記録|きろく} を {返|かえ}して から に する わ 。 || If I told him now, it'd slide off his mind with the rest of the fire. I'll wait until the kiln gives its record back.
!set co_suzu_asked
!quest co_suzu 2

@scene co.suzu_c_square
!if co_suzu_c_met -> again
suzu[surprise]: …… あら ！ $name ！ {葦|あし}ノ{瀬|せ} {以来|いらい} ね 。 {世|よ} の {中|なか} って 、 {舞台|ぶたい} が {狭|せま}い わ 。 || …Well! $name! Not since Reedwake. What a small stage the world is.
?(comp=nao) suzu: ナオ も 。 {相変|あいか}わらず {出口|でぐち} ばかり {見|み}てる の ね 。 || And Nao. Still watching the exits, I see.
?(comp=nao) comp[smirk]: {職業病|しょくぎょうびょう} だ よ 。 {久|ひさ}しぶり 、 スズ 。 || Occupational habit. Long time, Suzu.
?(comp=mio) suzu: ミオ も ！ {薬箱|くすりばこ} 、 {今日|きょう} も {重|おも}そう ね 。 || Mio too! Your medicine box looks as heavy as ever.
?(comp=mio) comp[smile]: スズ さん 。 お{元気|げんき} そう で よかった 。 || Suzu. I'm glad you look well.
?(comp=ren) suzu: レン まで 。 {道|みち} に {迷|まよ}わず に {来|こ}られた の ？ {奇跡|きせき} ね 。 || Even Ren. You made it here without getting lost? A miracle.
?(comp=ren) comp: {三回|さんかい} {迷|まよ}いました 。 {四回目|よんかいめ} で {着|つ}きました 。 || I got lost three times. The fourth time, I arrived.
pc: スズ も {祭|まつ}り に ？ || You're here for the festival too?
suzu[laugh]: {呼|よ}ばれて ない けど 、 {呼|よ}ばれた こと に した の 。 サヨ さん に {手紙|てがみ} を {出|だ}したら 、 {舞台|ぶたい} を {一枠|ひとわく} くれた わ 。 || Nobody invited me, so I invited myself. I wrote to Sayo and she gave me a slot on the stage.
suzu[closed]: …… ねえ 、 ガラス {職人|しょくにん} の ヒロ って {人|ひと} 、 どこ で {働|はたら}いてる か {知|し}ってる ？ || …Say, do you know where a glassblower called Hiro works?
pc: {東|ひがし} の {工房|こうぼう} だ よ 。 {知|し}り{合|あ}い ？ || The workshop to the east. Do you know him?
suzu[smile]: {知|し}り{合|あ}い …… じゃ ない わ 。 {向|む}こう は {私|わたし} を {覚|おぼ}えて ない もの 。 || Know him… no. He wouldn't remember me.
suzu: …… {夜|よる} は フサ さん の {宿|やど} に いる から 。 {暇|ひま} が あったら {来|き}て 。 {観客|かんきゃく} が {一人|ひとり} {欲|ほ}しい の 。 || …I'm staying at Fusa's inn. If you've a moment this evening, come by. I need an audience of one.
!set co_suzu_c_met
!quest co_suzu 0
!end
:again
suzu: {夜|よる} は フサ さん の {宿|やど} よ 。 {待|ま}ってる 。 …… {急|いそ}がなくて いい けど 。 || I'm at Fusa's inn in the evenings. I'll be waiting. …No hurry, though.

@scene co.suzu_c_inn
suzu[smile]: {来|き}て くれた 。 {座|すわ}って 。 {甘酒|あまざけ} 、 {奢|おご}る わ 。 {帳簿|ちょうぼ} に は {書|か}かない で おいて あげる 。 || You came. Sit. The amazake's on me — and I won't even write it in my book.
suzu: {二十年前|にじゅうねんまえ} 、 {一座|いちざ} で この {里|さと} の {秋祭|あきまつ}り に {来|き}た の 。 {前|まえ} の {晩|ばん} に {火事|かじ} が あって …… {上|うえ} の {段|だん} が {燃|も}えた 。 || Twenty years ago I came here with my troupe for the festival. The night before, there was a fire… the upper terraces burned.
?(comp=nao) comp: …… {里|さと} の {人|ひと} は {誰|だれ} も {覚|おぼ}えて ない 。 {記録|きろく} に も ない 。 || …Nobody here remembers. It isn't in the records.
?(comp=mio) comp[worry]: {火事|かじ} …… やっぱり 。 だから {火傷|やけど} の {薬|くすり} が 、 どこ に も ない ん です ね 。 || A fire… I knew it. That's why there's no burn salve anywhere.
?(comp=ren) comp[think]: {記録|きろく} から も {人|ひと} から も {消|き}えた {火事|かじ} 。 {灯|ひ} の {名|な} と {同|おな}じ {消|き}え{方|かた} です 。 || A fire gone from the records and from people. It vanished the way lantern names do.
suzu: {私|わたし} は {次|つぎ} の {朝|あさ} に {里|さと} を {出|で}た から 、 {全部|ぜんぶ} {覚|おぼ}えてる 。 {窯|かま} の {女|おんな} の {人|ひと} が {上|うえ} へ {行|い}って 、 {戻|もど}らなかった こと も 。 || I left the next morning, so I remember all of it. Including the woman from the kiln who went up the hill and never came back.
suzu[sad]: その {人|ひと} の {息子|むすこ} に 、 {私|わたし} 、 {嘘|うそ} を ついた の 。 「 お{母|かあ}さん は {一座|いちざ} と {先|さき} へ {行|い}った 。 {春|はる} に {帰|かえ}って くる 」 って 。 || I lied to her son. I told him, "Your mum's gone on ahead with the troupe. She'll be back in spring."
suzu: その {子|こ} が ヒロ 。 {広場|ひろば} の {空|あ}いた {席|せき} の 。 || That boy is Hiro. The one with the empty seat in the square.
narr: スズ は {帳簿|ちょうぼ} を {開|ひら}いて {見|み}せた 。 「 ヒロ ── {本当|ほんとう} の こと {一|ひと}つ 。 {未払|みはら}い 。 」 || Suzu opens her account book to show you: "Hiro — one truth. Unpaid."
suzu: {手紙|てがみ} で {返|かえ}そう と した こと も ある 。 {字|じ} が {白|しろ}く {消|き}えた わ 。 {嘘|うそ} だけ が {残|のこ}る の 。 {痛|いた}く ない から 。 || I tried to pay it by letter once. The words faded white. Only the lie stays — it doesn't hurt anyone, you see.
suzu[closed]: …… お{願|ねが}い が ある の 。 ヒロ が {今|いま} 、 あの {席|せき} を どう {思|おも}ってる か 、 {聞|き}いて きて くれない ？ {私|わたし} が {聞|き}く と 、 {顔|かお} に {出|で}ちゃう から 。 || …I've a favour to ask. Would you find out what Hiro thinks about that seat now? If I ask, it'll show on my face.
!set co_suzu_c_inn co_suzu_told
!note co_suzu_ledger
!quest co_suzu 1

@scene co.suzu_c_wait
!if co_suzu_asked&!co_suzu_c_reported -> report
suzu: {急|いそ}がなくて いい わ 。 {二十年|にじゅうねん} {待|ま}たせた ん だ もの 。 {数日|すうじつ} くらい 。 || No rush. I've kept him waiting twenty years. What's a few days.
!end
:report
pc: ヒロ は 、 {赤|あか}い リボン の {姉|ねえ}ちゃん を {覚|おぼ}えて いた 。 {顔|かお} は {覚|おぼ}えて ない けど 、 リボン だけ は 。 || Hiro remembers a girl with a red ribbon. Not her face — just the ribbon.
suzu[sad]: …… そう 。 {私|わたし} も 、 あの {子|こ} の {顔|かお} より 、 リボン を {引|ひ}っ{張|ぱ}られた {感|かん}じ の {方|ほう} を {覚|おぼ}えてる 。 || …I see. Same for me. I remember the tug on the ribbon better than his face.
suzu: {今|いま} {言|い}って も 、 {火事|かじ} ごと {頭|あたま} から {滑|すべ}り{落|お}ちる だけ ね 。 {窯|かま} の {記録|きろく} が {戻|もど}ったら …… その {時|とき} に {言|い}う 。 {約束|やくそく} する わ 。 {帳簿|ちょうぼ} に {書|か}いて おく 。 || If I told him now, it'd slide off his mind along with the fire. When the kiln's record comes back… I'll tell him then. I promise. I'll write it in my book.
!set co_suzu_c_reported

@scene co.suzu_truth
!if !co_suzu_told -> brief
:start
!music companion_suzu
suzu[closed]: …… {入|はい}る {前|まえ} に 、 {一|ひと}つ だけ {手伝|てつだ}って 。 {最初|さいしょ} の {一言|ひとこと} 。 {台詞|せりふ} は {得意|とくい} な の 。 {本当|ほんとう} の {台詞|せりふ} {以外|いがい} は 。 || …Before we go in, help me with one thing. The first line. I'm good with lines. Just not true ones.
!challenge co.c_suzu
narr: {工房|こうぼう} の {炉|ろ} が 、 {低|ひく}く {唸|うな}って いる 。 ヒロ は {吹|ふ}き{竿|ざお} の {先|さき} で 、 {橙色|だいだいいろ} の ガラス を {回|まわ}して いた 。 || The furnace hums low. Hiro is turning a gather of orange glass on the end of his blowpipe.
hiro: {悪|わる}い 。 {今|いま} {手|て} が {離|はな}せない 。 {話|はなし} なら 、 そこ で 。 || Sorry. Can't put this down. If you want to talk, go ahead.
suzu[smile]: {大丈夫|だいじょうぶ} 。 {手|て} は {止|と}めない で 。 その {方|ほう} が 、 {私|わたし} も {言|い}い やすい 。 || That's fine. Don't stop. It's easier for me that way too.
suzu: ヒロ 。 {赤|あか}い リボン の {姉|ねえ}ちゃん を {覚|おぼ}えてる 、 って {言|い}った よ ね 。 || Hiro. You said you remember a girl with a red ribbon.
narr: スズ は {色褪|いろあ}せた リボン を ほどいて 、 {作業台|さぎょうだい} の {上|うえ} に {置|お}いた 。 {昔|むかし} は {赤|あか}かった の だろう 。 || Suzu unties her faded ribbon and lays it on the workbench. It must have been red, once.
hiro[surprise]: …… || …
suzu[laugh]: {色|いろ} は {落|お}ちた けど 、 {物持|ものも}ち は いい の 。 {借|か}り も ね 。 …… ごめん 。 {冗談|じょうだん} で {逃|に}げる の は 、 ここ まで に する 。 || The colour's gone, but I keep things. Debts too. …Sorry. That's the last joke I'll hide behind.
suzu[closed]: あの {朝|あさ} 、 {私|わたし} は {嘘|うそ} を ついた 。 || That morning, I lied to you.
suzu: {君|きみ} の お{母|かあ}さん は 、 {一座|いちざ} と {一緒|いっしょ} に {行|い}って ない 。 {前|まえ} の {晩|ばん} の {火事|かじ} で 、 {亡|な}くなった の 。 {上|うえ} の {水門|すいもん} を {開|あ}け に {行|い}って 、 {戻|もど}らなかった 。 || Your mother didn't go with the troupe. She died in the fire the night before. She went up to open the top water gate, and she didn't come back.
suzu: {私|わたし} は それ を {知|し}って いて 、 {春|はる} に {帰|かえ}る って {言|い}った 。 {慰|なぐさ}め の つもり だった 。 でも それ は 、 {君|きみ} から {泣|な}く {時間|じかん} を {取|と}り{上|あ}げた 。 || I knew, and I told you she'd be back in spring. I meant it as comfort. But it took away your time to cry.
narr: ヒロ は {答|こた}えない 。 {竿|さお} を {回|まわ}し{続|つづ}け 、 ガラス を {炉|ろ} に {戻|もど}し 、 また {取|と}り{出|だ}す 。 {形|かたち} が ゆっくり {丸|まる}く なって いく 。 || Hiro doesn't answer. He keeps the pipe turning, returns the glass to the furnace, draws it out again. Slowly, it rounds into shape.
narr: {長|なが}い {時間|じかん} が {経|た}った 。 || A long time passes.
hiro: …… {火事|かじ} 。 || …A fire.
hiro: {変|へん} だ な 。 {昨日|きのう} まで 、 その {言葉|ことば} を {聞|き}いて も {何|なに} も {浮|う}かばなかった 。 {今|いま} は …… {煙|けむり} の におい が する 。 || Strange. Until yesterday, that word called up nothing. Now… I can smell smoke.
hiro: {母|はは} の {手|て} は 、 いつも {火傷|やけど} の {跡|あと} だらけ だった 。 {上|うえ} へ {行|い}く {前|まえ} 、 {俺|おれ} の {頭|あたま} に この {手拭|てぬぐ}い を {巻|ま}いた 。 「 {火|ひ} の {粉|こ} が {熱|あつ}い から ね 」 って 。 || My mother's hands were always covered in burn scars. Before she went up, she tied this cloth round my head. "The sparks are hot," she said.
narr: ヒロ は {額|ひたい} の {手拭|てぬぐ}い に 、 {一瞬|いっしゅん} だけ {触|ふ}れた 。 || For a moment, Hiro touches the cloth tied round his forehead.
hiro: 「 {振|ふ}り{返|かえ}らない で 」 。 {振|ふ}り{返|かえ}らなかった 。 {二十年|にじゅうねん} 。 || "Don't look back." I didn't. For twenty years.
hiro[sad]: …… {怒|おこ}ってる か 、 と {聞|き}かれたら 、 {怒|おこ}ってる 。 {嘘|うそ} に じゃ ない 。 {七|なな}つ の {子|こ} に {本当|ほんとう} の こと を {言|い}える {十六|じゅうろく} なんて 、 いない 。 || …If you're asking whether I'm angry — I am. Not about the lie. No sixteen-year-old could have told a seven-year-old the truth.
hiro: あんた が {行|い}っちまった こと に 、 だ 。 {母|はは} は {一座|いちざ} と {行|い}った 、 と {聞|き}いた 。 それ から {一座|いちざ} も 、 あんた も {行|い}った 。 {俺|おれ} は {二人|ふたり} {分|ぶん} 、 {待|ま}ってた ん だ 。 || It's that you left. I was told my mother went with the troupe. Then the troupe left, and you with it. I was waiting for two people.
suzu[sad]: …… うん 。 || …Yes.
narr: ヒロ は ガラス を {竿|さお} から {外|はず}し 、 {灰|はい} の {中|なか} に そっと {置|お}いた 。 {丸|まる}い {火屋|ほや} が 、 {橙色|だいだいいろ} に {光|ひか}って いる 。 || Hiro breaks the glass from the pipe and lays it gently in the ash. A round lantern globe, glowing orange.
hiro: {席|せき} は 、 {今年|ことし} も {空|あ}けて おく 。 でも {今年|ことし} は 、 {母|はは} の {名前|なまえ} を {書|か}く 。 {帰|かえ}って くる {人|ひと} の {席|せき} じゃ ない 。 {覚|おぼ}えて いる {人|ひと} の {席|せき} だ 。 || I'll keep the seat free this year too. But this year I'll write her name on it. Not a seat for someone coming back. A seat for someone remembered.
hiro: それ と …… あんた は 、 {隣|となり} に {座|すわ}れ 。 {祭|まつ}り {二十回|にじゅっかい} {分|ぶん} 、 {貸|か}して ある 。 {一回|いっかい} ずつ {返|かえ}して もらう 。 || And… you sit next to it. You owe me twenty festivals. You can pay them back one at a time.
suzu[surprise]: …… {帳簿|ちょうぼ} に 、 {書|か}いて いい ？ || …Can I write that in my book?
hiro[smirk]: {好|す}き に しろ 。 {線|せん} は {引|ひ}く な よ 。 「 {一部|いちぶ} {返済|へんさい} 」 だ 。 || Suit yourself. Don't cross it out, mind. "Paid in part."
narr: スズ は {帳簿|ちょうぼ} を {開|ひら}き 、 {震|ふる}える {字|じ} で {一行|いちぎょう} {書|か}き{足|た}した 。 {今度|こんど} は 、 {字|じ} は {消|き}えなかった 。 || Suzu opens her book and adds a line in an unsteady hand. This time, the words do not fade.
!choice
* （ {何|なに} も {言|い}わず に {見守|みまも}る ） || (Say nothing. Let them have this.) -> quiet
* スズ は 、 これ を {言|い}う ため に {戻|もど}って {来|き}た ん だ 。 || Suzu came back to say this. -> speak
:speak
hiro: {分|わ}かってる 。 {二十年|にじゅうねん} {遅|おく}れ でも 、 {来|き}た 。 …… それ は {数|かぞ}える 。 || I know. Twenty years late, but she came. …That counts.
!goto after
:quiet
narr: {炉|ろ} の {音|おと} だけ が 、 しばらく {続|つづ}いた 。 || For a while there's only the sound of the furnace.
:after
!if !item.co_globe -> finish
pc: {窯|かま} の {奥|おく} で 、 これ を {見|み}つけた 。 || We found this at the back of the kiln.
narr: {三十個|さんじゅっこ} の {中|なか} で 、 {一|ひと}つ だけ {割|わ}れず に {残|のこ}った {火屋|ほや} 。 {底|そこ} に {小|ちい}さく 「 トモエ 」 と {刻|きざ}まれて いる 。 || The one lantern globe of the thirty that didn't break. Scratched small on its base: トモエ.
hiro[sad]: …… {母|はは} の {字|じ} だ 。 {最後|さいご} の {一|ひと}つ が 、 いつも {上手|うま}く いかない わけ だ 。 {俺|おれ} は ずっと 、 {三十個目|さんじゅっこめ} を {作|つく}ってた ん だ な 。 || …That's her hand. No wonder the last one never came out right. I've been making the thirtieth all along.
!take co_globe
!set co_hiro_globe
:finish
?(comp=suzu) comp: …… $name 。 ありがとう 。 {客席|きゃくせき} に いて くれて 。 || …$name. Thank you. For staying in your seat.
?(comp=nao) comp: …… {届|とど}いた な 。 {二十年|にじゅうねん} {遅|おく}れ の {配達|はいたつ} だ 。 {受取人|うけとりにん} の {返事|へんじ} まで 、 {込|こ}み で 。 || …Delivered. Twenty years late. And the recipient wrote back, too.
?(comp=mio) comp[sad]: …… {本当|ほんとう} の こと は 、 {痛|いた}い 。 でも 、 {痛|いた}い まま に しない 。 ヒロ さん は 、 もう {始|はじ}めて いる んです ね 。 || …The truth hurts. But he's not leaving it hurting. Hiro's already started, hasn't he.
?(comp=ren) comp: {名|な} の ない {席|せき} に 、 {名|な} が {入|はい}る 。 …… {今日|きょう} 、 {一番|いちばん} {美|うつく}しい {書|か}き{直|なお}し を {見|み}ました 。 || A name on a nameless seat. …That's the most beautiful rewriting I've seen today.
!set co_suzu_done
!quest co_suzu done
!autosave
!if co_tokiwa_page -> assemble
narr: {外|そと} は もう {暗|くら}く なり かけて いる 。 {記録堂|きろくどう} で トキワ が {待|ま}って いる 。 || Outside it's getting dark. Tokiwa is waiting at the Chronicle Hall.
!end
:assemble
narr: {遠|とお}く で 、 {手鐘|てがね} の {音|おと} が {響|ひび}いた 。 トキワ が 、 {里|さと} の {人|ひと} を {広場|ひろば} に {呼|よ}んで いる 。 || In the distance a handbell rings. Tokiwa is calling the village to the square.
!call co.assembly
!end
:brief
suzu[closed]: …… {先|さき} に 、 {話|はな}して おく わ ね 。 {二十年前|にじゅうねんまえ} 、 {私|わたし} は {一座|いちざ} で この {里|さと} に いた 。 {火事|かじ} の {次|つぎ} の {朝|あさ} 、 {小|ちい}さな {男|おとこ} の {子|こ} に {嘘|うそ} を ついた 。 お{母|かあ}さん は {一座|いちざ} と {先|さき} へ {行|い}った 、 {春|はる} に {帰|かえ}る 、 って 。 || …Let me tell you first. Twenty years ago I was here with a troupe. The morning after the fire, I lied to a little boy. I told him his mother had gone ahead with the troupe and would be back in spring.
suzu: その {子|こ} が ヒロ 。 {帳簿|ちょうぼ} に 、 {二十年|にじゅうねん} {線|せん} を {引|ひ}けない {借|か}り が ある の 。 {今日|きょう} 、 {返|かえ}す 。 || That boy is Hiro. There's a debt in my book I haven't been able to cross out for twenty years. Today I pay it.
!set co_suzu_told
!note co_suzu_ledger
!goto start

@scene co.suzu_c_after
suzu[smile]: {明日|あした} 、 {発|た}つ わ 。 {次|つぎ} の {町|まち} で 、 {次|つぎ} の {舞台|ぶたい} 。 …… {来年|らいねん} の {秋|あき} は 、 {予定|よてい} が {入|はい}ってる の 。 {隣|となり} の {席|せき} に ね 。 || I'm off tomorrow. Next town, next stage. …Next autumn I'm booked, though. The seat next door.
suzu: {帳簿|ちょうぼ} の {最後|さいご} の {頁|ページ} 、 {見|み}る ？ 「 {一部|いちぶ} {返済|へんさい} 」 。 {線|せん} を {引|ひ}かない {借|か}り が ある なんて 、 {知|し}らなかった 。 || Want to see the last page of my book? "Paid in part." I never knew there were debts you don't cross out.
?(comp=nao) suzu: ナオ 。 あなた の {鞄|かばん} の {底|そこ} の {手紙|てがみ} 、 {重|おも}そう ね 。 …… {私|わたし} が {言|い}える {立場|たちば} じゃ ない けど 。 || Nao. The letter at the bottom of your bag looks heavy. …Not that I'm one to talk.
?(comp=nao) comp: …… {余計|よけい} な お{世話|せわ} だ 。 {分|わ}かってる よ 。 || …Mind your own business. I know.

@scene co.suzu_c_post
suzu[laugh]: あら 、 $name ！ {今年|ことし} も {返済|へんさい} に {来|き}た の 。 {残|のこ}り 、 {十八回|じゅうはっかい} 。 {利子|りし} は {柿|かき} で {払|はら}ってる わ 。 || Oh, $name! Here to make this year's payment. Eighteen to go. I'm paying the interest in persimmons.
?(end_kasane_trial) suzu: {灯落|ひおち} で 、 {番人|ばんにん} さん が {皆|みな} の {前|まえ} に {立|た}った ん です って ね 。 {観客|かんきゃく} の {前|まえ} に {立|た}つ の は 、 {怖|こわ}い の よ 。 {私|わたし} は {知|し}ってる 。 || I heard the keeper stood before everyone in Lanternfall. Standing in front of an audience is frightening. I'd know.
?(end_kasane_keeper) suzu: {番人|ばんにん} さん は 、 {山|やま} で {書庫|しょこ} を {守|まも}ってる の よ ね 。 {誰|だれ} か が {見|み}て いて くれる の は 、 {悪|わる}く ない こと よ 。 {観客|かんきゃく} が いれば 、 {人|ひと} は {逃|に}げない から 。 || The keeper's minding the archive in the mountains, isn't it. Having someone watch you isn't a bad thing. With an audience, people don't run.

@scene co.fest_suzu_c
suzu[smile]: {次|つぎ} が {私|わたし} の {番|ばん} な の 。 {二十年前|にじゅうねんまえ} に {踊|おど}る はず だった {演目|えんもく} 。 {台詞|せりふ} は {三|みっ}つ だけ 。 {全部|ぜんぶ} 、 {本当|ほんとう} の こと よ 。 || I'm on next. The piece I was meant to dance twenty years ago. Only three lines. All of them true.
suzu: {見|み}て て 。 {観客|かんきゃく} {一名|いちめい} 、 {最後|さいご} まで {席|せき} を {立|た}たず に ね 。 || Watch me. Audience of one, stay in your seat to the end.
`, 'ch3/suzu');
