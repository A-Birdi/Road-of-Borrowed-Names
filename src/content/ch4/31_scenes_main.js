/* Chapter 4 main quest, part 1: Hoshino's promise, the unaddressed post,
 * Akari's letters, the storm and the hearth (the word ほのお). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sb.hoshino
!if sb_obs_open -> waiting_up
!if quest.sb_lamp>=3 -> letters
!if quest.sb_lamp>=2 -> waiting
narr: {部屋|へや} じゅう に {星図|せいず} が {広|ひろ}げて ある 。 {窓|まど} の そば の {老人|ろうじん} は 、 {望遠鏡|ぼうえんきょう} で は なく 、 {坂|さか} の {下|した} を {見|み}て いた 。 || Star charts are spread all over the room. The old man by the window isn't looking through his telescope — he's watching the road below the slope.
hoshino[surprise]: …… おや 。 {郵便|ゆうびん} かね 。 いや 、 {冬|ふゆ} に {郵便|ゆうびん} は {来|こ}ない な 。 すまない 、 {癖|くせ} で ね 。 || …Oh. Is that the post? No — no post comes in winter. Forgive me. Habit.
hoshino: ホシノ だ 。 {星|ほし} を {見|み}る の が {仕事|しごと} だった 。 {今|いま} は …… {坂|さか} を {見|み}る の が {仕事|しごと} だ ね 。 || I'm Hoshino. Watching stars was my work. These days… it seems my work is watching the road.
pc: {天文台|てんもんだい} の {灯|あか}り の こと で {来|き}ました 。 || We came about the observatory lamp.
hoshino[sad]: …… そう か 。 ヤエ さん だ ね 。 || …I see. Yae sent you.
hoshino: {娘|むすめ} が いる 。 アカリ と いう 。 {灯落|ひおち} の {役所|やくしょ} で 、 {書記|しょき} を して いる 。 || I have a daughter. Akari. She's a clerk at the records office in Lanternfall.
hoshino: {出|で}て いく {朝|あさ} 、 わたし は {約束|やくそく} した 。 あの {灯|あか}り を 、 おまえ が {帰|かえ}る まで {消|け}さない 、 と 。 || The morning she left, I made a promise. That lamp won't go out until you come home.
hoshino: {灯|あか}り の {笠|かさ} に は 、 あの {子|こ} の {名前|なまえ} を {書|か}いた 。 {灯守|ひもり} の {真似事|まねごと} だ よ 。 {帰|かえ}り{道|みち} の {目印|めじるし} に なる よう に 。 || I wrote her name on the lamp's shade. Playing at being a lantern keeper. So it would mark her way home.
?(comp=ren) comp[surprise]: {名前|なまえ} を {灯|あか}り に …… 。 それ は {真似事|まねごと} では ありません 。 {灯守|ひもり} の {仕事|しごと} そのもの です 。 || A name on a lamp… That's not playing at it. That's exactly what a keeper does.
?(comp=ren) hoshino[smile]: {本物|ほんもの} の {灯守|ひもり} に そう {言|い}われる と 、 {照|て}れる ね 。 || Coming from a real keeper, that makes me blush.
hoshino: {十日|とおか} {前|まえ} の {晩|ばん} 、 {灯|あか}り が {消|き}えた 。 {油|あぶら} も {芯|しん} も ある のに 、 どう して も つかない 。 || Ten nights ago, the lamp went out. There's oil, there's a wick, and it simply won't light.
hoshino: {次|つぎ} の {朝|あさ} に は 、 {石段|いしだん} も {天文台|てんもんだい} も 、 {氷|こおり} に {閉|と}じ{込|こ}められて いた 。 || By the next morning the stair and the whole observatory were locked in ice.
hoshino[sad]: それ に …… {手紙|てがみ} も {来|こ}なく なった 。 || And… the letters stopped coming too.
hoshino: アカリ は {秋|あき} から {毎月|まいつき} {書|か}いて くれた 。 {冬|ふゆ} は {峠|とうげ} が {閉|し}まる から 、 {冬|ふゆ} の {手紙|てがみ} が {届|とど}く の は {春|はる} だ 。 それ は わかって いる 。 || Akari wrote every month from autumn on. The pass closes in winter, so winter letters arrive in spring. I know that.
hoshino: だが 、 {秋|あき} の うち に {届|とど}く はず の {手紙|てがみ} も 、 {来|こ}なかった 。 わたし が {出|だ}した {手紙|てがみ} は 、 {宛名|あてな} が {真|ま}っ{白|しろ} に なって {戻|もど}って きた 。 || But even the letters that should have come in autumn never arrived. And the ones I sent came back with the address gone perfectly white.
?(comp=nao) comp[angry]: {宛名|あてな} が {消|き}えた ？ …… それ 、 {配達人|はいたつにん} に とって は {最悪|さいあく} の {話|はなし} だ 。 || The address vanished? …For a courier, that's the worst thing you can hear.
?(comp=mio) comp[worry]: {出|だ}した {手紙|てがみ} が {戻|もど}って くる の は 、 {届|とど}かない より つらい です ね 。 || Having your letter come back is worse than it never arriving.
?(comp=ren) comp[think]: {宛名|あてな} は 、 {手紙|てがみ} の {行|ゆ}き{先|さき} の {名前|なまえ} です 。 {灯|あか}り の {名前|なまえ} と {同|おな}じ よう に 、 {持|も}って いかれた の でしょう 。 || An address is the name of where a letter is going. It must have been taken, just like a lamp's name.
?(comp=suzu) comp: {返事|へんじ} が {来|こ}ない の と 、 {出|だ}した {手紙|てがみ} が {帰|かえ}って くる の 。 どっち が {堪|こた}える かな 。 …… {後|あと} の ほう だ ね 。 || No reply, or your own letter coming home. Which hurts more? …The second.
hoshino: {郵便|ゆうびん}{小屋|ごや} の ソウスケ くん に {聞|き}いて みて くれない か 。 わたし は …… {戻|もど}って きた {手紙|てがみ} を これ {以上|いじょう} {見|み}る の が 、 {怖|こわ}くて ね 。 || Would you ask young Sousuke at the post shelter? I… I'm afraid to see any more letters come back.
!quest sb_lamp 2
!note sb_lamp
!end
:waiting_up
hoshino: {石段|いしだん} は とけた かね 。 わたし も {支度|したく} を して いる ところ だ 。 {先|さき} に {行|い}って おくれ 。 {灯|あか}り の {前|まえ} で {会|あ}おう 。 || Has the stair melted? I'm getting ready myself. Go on ahead. We'll meet at the lamp.
!end
:waiting
hoshino: ソウスケ くん の {小屋|こや} は 、 {村|むら} の {入|い}り{口|ぐち} の {近|ちか}く だ 。 {屋根|やね} の {黒|くろ}い {建物|たてもの} だよ 。 || Sousuke's shelter is near the entrance to the hamlet. The building with the dark roof.
!end
:letters
hoshino[surprise]: その {字|じ} は …… 。 || That handwriting…
narr: ホシノ は {震|ふる}える {指|ゆび} で {紐|ひも} を ほどき 、 {一通|いっつう} ずつ 、 {順番|じゅんばん} に {読|よ}んで いった 。 || With trembling fingers, Hoshino unties the string and reads the letters one by one, in order.
hoshino: 「 {秋風|あきかぜ} が {冷|つめ}たく なって きました 。 お{父|とう}さん 、 ちゃんと {食|た}べて います か 。 」 || "The autumn wind is turning cold. Father, are you eating properly?"
hoshino[laugh]: …… {食|た}べて いる よ 。 {時々|ときどき} は 。 || …I am. Sometimes.
hoshino: 「 {役所|やくしょ} の {仕事|しごと} に も {慣|な}れました 。 {毎晩|まいばん} 、 {橋|はし} の {上|うえ} から {北|きた} の {山|やま} を {見|み}ます 。 {灯|あか}り が {見|み}える と 、 {安心|あんしん} して {眠|ねむ}れます 。 」 || "I've got used to the work at the office. Every evening I look at the northern mountains from the bridge. When I can see the lamp, I can sleep easy."
hoshino: 「 {近頃|ちかごろ} 、 {役所|やくしょ} の {人|ひと} たち が 、 {何|なに} を {頼|たの}まれて も 『 かしこまりました 』 と しか {言|い}いません 。 {少|すこ}し {変|へん} です 。 」 || "Lately the people at the office only ever say 'Certainly', whatever they're asked. It's a little strange."
?(comp=nao) comp[think]: …… 「 かしこまりました 」 しか {言|い}わない 、 か 。 {覚|おぼ}えて おこう 。 || …Only ever "certainly". I'll remember that.
?(comp=ren) comp[think]: {断|ことわ}る {言葉|ことば} が 、 {消|き}えて いる …… ？ || The words for refusing are disappearing…?
hoshino[sad]: {最後|さいご} の {手紙|てがみ} だ 。 || The last one.
hoshino: 「 {初雪|はつゆき} は もう {降|ふ}りました か 。 {最近|さいきん} 、 {灯|あか}り が {見|み}えない {夜|よる} が あります 。 {霧|きり} の せい だ と {思|おも}う けど 、 {心配|しんぱい} です 。 お{父|とう}さん 、 {無理|むり} しないで ね 。 」 || "Has the first snow fallen yet? Lately there are nights I can't see the lamp. I think it's the mist, but I worry. Father — don't overdo it, okay?"
hoshino: ………… 。 || ………
hoshino: …… あの {子|こ} は 、 {見|み}て いた んだ ね 。 {毎晩|まいばん} 。 || …She was watching. Every night.
hoshino[sad]: それ なのに わたし は 、 {灯|あか}り を {守|まも}れなかった 。 || And I couldn't keep the lamp alight.
?(comp=nao) comp: {消|け}した の は あんた じゃ ない 。 {宛名|あてな} を {消|け}した の と {同|おな}じ {奴|やつ} だ よ 。 || It wasn't you who put it out. It's the same thing that wiped the addresses.
?(comp=mio) comp[worry]: ホシノ さん の せい じゃ ありません 。 {約束|やくそく} を {破|やぶ}った わけ じゃ ない 。 {奪|うば}われた んです 。 || It isn't your fault. You didn't break your promise. It was taken from you.
?(comp=ren) comp: {笠|かさ} の {名前|なまえ} が {消|き}えた の でしょう 。 {名前|なまえ} を {書|か}き{直|なお}せば 、 {灯|ひ} は {戻|もど}る かも しれません 。 || The name on the shade must have been lifted. If the name is written again, the flame may come back.
?(comp=suzu) comp[smile]: {約束|やくそく} を {破|やぶ}る の と 、 {約束|やくそく} を {盗|ぬす}まれる の は 、 ぜんぜん {違|ちが}う よ 。 {客席|きゃくせき} から {見|み}て も 、 ね 。 || Breaking a promise and having one stolen are completely different. Anyone in the audience could tell you.
hoshino: …… {天文台|てんもんだい} へ {上|のぼ}ろう 。 {氷|こおり} が どう だろう と 。 || …I'll go up to the observatory. Ice or no ice.
!take sb_akari_letters
!quest sb_lamp 4
!if quest.sb_bell=done -> ring
!sfx bell
!shake
narr: その とき 、 {広場|ひろば} の {鐘|かね} が {鳴|な}った 。 {短|みじか}く 、 {何度|なんど} も 、 {急|せ}かす よう に 。 || Just then, the bell in the square rings — short strokes, again and again, urgently.
hoshino[surprise]: {吹雪|ふぶき} の {鐘|かね} だ 。 フキ さん 、 {寝込|ねこ}んで いる のに …… 。 || That's the storm bell. And Fuki laid up in bed…
hoshino: {今日|きょう} は {上|のぼ}れない 。 {宿|やど} へ {行|い}こう 。 {吹雪|ふぶき} の {夜|よる} は 、 {村|むら} じゅう が {雪見屋|ゆきみや} に {集|あつ}まる {決|き}まり なんだ 。 || No climbing today. To the inn. On storm nights the whole hamlet gathers at Yukimiya — that's the rule.
!call sb.storm_start
!end
:ring
narr: {窓|まど} の {外|そと} で 、 {風|かぜ} の {音|おと} が {変|か}わった 。 {空|そら} が {急|きゅう} に {暗|くら}く なる 。 || Outside, the wind changes its voice. The sky darkens all at once.
hoshino[surprise]: {吹雪|ふぶき} が {来|く}る 。 フキ さん は {寝込|ねこ}んで いる …… {鐘|かね} を {鳴|な}らす {者|もの} が いない 。 || A storm's coming. And Fuki's laid up… there's no one to ring the bell.
?(comp) comp: $name 、 {鐘|かね} の {決|き}まり 、 {覚|おぼ}えてる よね ？ {行|い}こう ！ || $name, you remember the bell rules, right? Let's go!
!warp sb.hamlet 22 16 up
!sfx wind
narr: {広場|ひろば} は もう {雪|ゆき} {煙|けむり} で {白|しろ}い 。 {梯子|はしご} を {上|のぼ}り 、 {凍|こお}った {綱|つな} を {握|にぎ}る 。 || The square is already white with blowing snow. You climb the ladder and grip the frozen rope.
:ringchoice
!choice
* {朝|あさ} の {合図|あいず} ： {一回|いっかい} || The morning signal: once. -> wrong
* {夕方|ゆうがた} の {合図|あいず} ： {三回|さんかい} || The evening signal: three times. -> wrong
* {短|みじか}く 、 {何度|なんど} も || Short strokes, again and again. -> right
* {長|なが}く {一回|いっかい} 、 {休|やす}んで もう {一回|いっかい} || One long, a pause, then another. -> wrong
:wrong
narr: {手|て} が {止|と}まる 。 {違|ちが}う 。 それ は {吹雪|ふぶき} の {合図|あいず} じゃ ない 。 フキ の {帳面|ちょうめん} を {思|おも}い{出|だ}す 。 || Your hand stops. No — that isn't the storm signal. You think back to Fuki's notebook.
!goto ringchoice
:right
!sfx bell
!wait 200
!sfx bell
!wait 200
!sfx bell
!wait 200
!sfx bell
narr: カン 、 カン 、 カン 、 カン ！ {家々|いえいえ} の {戸|と} が {開|あ}き 、 {人|ひと} が {飛|と}び{出|だ}して くる 。 テツジ が ヤギ を {追|お}い 、 サチ が カンタ の {手|て} を {引|ひ}く 。 みんな が {宿|やど} へ {向|む}かって いく 。 || Clang, clang, clang, clang! Doors fly open and people spill out. Tetsuji herds his goats; Sachi pulls Kanta along by the hand. Everyone heads for the inn.
!set sb_rang_storm
?(comp=nao) comp: {間|ま}に{合|あ}った 。 …… {鐘|かね} って の は 、 {一番|いちばん} {速|はや}い {手紙|てがみ} だ な 。 || Made it. …A bell's the fastest letter there is.
?(comp=mio) comp[smile]: みんな 、 {聞|き}こえた みたい です 。 {行|い}きましょう 、 わたし たち も 。 || Looks like everyone heard it. Come on — us too.
?(comp=ren) comp: {音|おと} が {届|とど}く {範囲|はんい} は 、 {灯|あか}り より {広|ひろ}い 。 {雪|ゆき} の {日|ひ} は {特|とく} に 。 {石|いし} の {言葉|ことば} どおり です 。 || Sound carries further than light, on snowy days especially. Just as the stone on the road said.
?(comp=suzu) comp[laugh]: {満員|まんいん} {御礼|おんれい} ！ …… って 、 {言|い}ってる {場合|ばあい} じゃ ない か 。 {走|はし}ろう ！ || A full house! …Not really the time, is it. Run!
!call sb.storm_start
`, 'ch4/main-hoshino');

RB.script.add(`
@scene sb.sousuke
!if sb_akari_ordered -> after
!if sb_letters_done -> bundle
!if quest.sb_lamp>=2 -> ask
sousuke: {郵便|ゆうびん}{小屋|ごや} へ ようこそ 。 {春|はる} まで {何|なに} も {出|で}ません が 、 {預|あず}かる こと は できます 。 || Welcome to the post shelter. Nothing goes out until spring, but I can hold things for you.
sousuke[think]: {冬|ふゆ} の {郵便|ゆうびん}{屋|や} の {仕事|しごと} は 、 {待|ま}つ こと です 。 {得意|とくい} です よ 。 || A winter postmaster's job is waiting. I'm very good at it.
!end
:ask
sousuke[worry]: ホシノ さん の {手紙|てがみ} です か 。 …… {実|じつ} は 、 {困|こま}って いる んです 。 || Mr Hoshino's letters? …To be honest, I'm at a loss.
sousuke: {秋|あき} の {最後|さいご} の {郵便|ゆうびん} は 、 ちゃんと {届|とど}いた んです 。 でも {袋|ふくろ} を {開|あ}けたら 、 {宛名|あてな} が ぜんぶ {消|き}えて いた 。 {封筒|ふうとう} は {真|ま}っ{白|しろ} です 。 || The last post of autumn did arrive. But when I opened the sack, every address had gone. The envelopes are blank.
sousuke: {人|ひと} の {手紙|てがみ} を {開|あ}けて {読|よ}む わけ に は いきません 。 だから 、 {誰|だれ} に も {渡|わた}せない まま 、 {棚|たな} に …… 。 || I can't very well open other people's letters and read them. So there they sit on the shelf, undelivered…
?(comp=nao) comp: {開|あ}けなくて いい 。 {灯|あか}り に {透|す}かせば 、 {中身|なかみ} が {少|すこ}し {読|よ}める こと が ある 。 {配達人|はいたつにん} の {知恵|ちえ} だ 。 || No need to open them. Hold them up to a lamp and you can often read a bit of what's inside. Courier's trick.
?(comp!=nao) comp[think]: {封|ふう} を {切|き}らず に 、 {透|す}けて {見|み}える {文|ぶん} だけ {読|よ}めば …… ？ || What if we just read the lines that show through, without breaking the seals…?
sousuke[surprise]: …… なるほど 。 {灯|あか}り に {透|す}かせば 、 {少|すこ}し は {読|よ}める かも しれません 。 {手伝|てつだ}って もらえます か 。 || …I see. Held up to the lamp, a little might be readable. Would you help me?
!lesson kana
!activity sb.a_letters
!if var._res=0 -> stop
!set sb_letters_done
sousuke[smile]: {届|とど}け{先|さき} が わかった ！ …… {冬|ふゆ} の {郵便|ゆうびん}{屋|や} に も 、 {配達|はいたつ} の {仕事|しごと} が できました 。 || They have somewhere to go! …Even a winter postmaster gets to make deliveries.
!goto bundle
:stop
sousuke: {急|いそ}ぎません 。 {手紙|てがみ} は {待|ま}つ の に {慣|な}れて います から 。 || No hurry. Letters are used to waiting.
!end
:bundle
sousuke[think]: それ と …… これ です 。 || And then… there's this.
narr: {紐|ひも} で {束|たば}ねた {封筒|ふうとう} が {四|よっ}つ 。 どれ も {同|おな}じ 、 {丁寧|ていねい} な {字|じ} だ 。 {宛名|あてな} は やはり {白|しろ}い 。 || Four envelopes tied with string, all in the same careful hand. The addresses, again, are blank.
sousuke: {差出人|さしだしにん} の {名前|なまえ} も {消|き}えて います が 、 この {字|じ} …… {子|こ}ども の ころ から {知|し}って います 。 アカリ さん の {字|じ} です 。 || The sender's name has gone too, but this handwriting… I've known it since we were children. It's Akari's.
sousuke: {秋|あき} から {毎月|まいつき} 、 {書|か}いて いた んです ね 。 {消印|けしいん} も {消|き}えて いて 、 どれ が {先|さき} か わかりません 。 || She must have written every month since autumn. The postmarks are gone too; I can't tell which came first.
?(comp=mio) comp[smile]: {順番|じゅんばん} に {並|なら}べて から {渡|わた}しましょう 。 {最初|さいしょ} から {読|よ}めた ほう が 、 きっと いい です 。 || Let's put them in order before we hand them over. It'll be better if he can read them from the beginning.
?(comp=nao) comp: {書|か}き{出|だ}し の {季節|きせつ} の {言葉|ことば} を {見|み}れば 、 {順番|じゅんばん} は わかる はず だ 。 || Look at the seasonal phrase each one opens with and the order should come out.
?(comp=ren) comp: {季節|きせつ} の {挨拶|あいさつ} は 、 {手紙|てがみ} の {日付|ひづけ} の よう な もの です 。 {読|よ}んで みましょう 。 || The seasonal greeting works like a date on a letter. Let's read them.
?(comp=suzu) comp: {四幕|よんまく} の お{芝居|しばい} だ ね 。 {順番|じゅんばん} を {間違|まちが}えたら 、 {話|はなし} が めちゃくちゃ に なる 。 || A play in four acts. Get them out of order and the story's a mess.
!challenge sb.c_akari_order
!if var._res=0 -> stop2
!set sb_akari_ordered
!give sb_akari_letters
!note sb_letters
sousuke: ホシノ さん に {届|とど}けて ください 。 …… {本当|ほんとう} は 、 わたし が {配達|はいたつ} したい けど 。 {今日|きょう} は あなた たち の {仕事|しごと} です 。 || Please take them to Mr Hoshino. …Truth be told, I'd like to deliver them myself. But today it's your job.
!quest sb_lamp 3
!end
:stop2
sousuke: {束|たば} は ここ に {置|お}いて おきます 。 いつ でも どうぞ 。 || I'll keep the bundle here. Come back any time.
!end
:after
!if sb_lamp_lit -> lit
!if sb_storm -> morning
sousuke: ホシノ さん 、 {読|よ}めました か 。 …… そう です か 。 よかった 。 || Did Mr Hoshino read them? …I see. Good.
!end
:morning
sousuke: {天文台|てんもんだい} へ {行|い}く んです ね 。 {灯|あか}り が ついたら 、 {灯落|ひおち} から も {見|み}える 。 {手紙|てがみ} より {速|はや}い {便|たよ}り です 。 || You're going up to the observatory? Once the lamp's lit, they'll see it from Lanternfall. News faster than any letter.
!end
:lit
sousuke[smile]: {灯|あか}り は 、 {宛名|あてな} の ない {手紙|てがみ} みたい な もの です ね 。 {見|み}る {人|ひと} {全員|ぜんいん} に {届|とど}く 。 || A lamp's a bit like a letter with no address. It reaches everyone who looks.

@scene sb.post_shelf
narr: {小|ちい}さな {仕切|しき}り の {一|ひと}つ {一|ひと}つ に 、 {手紙|てがみ} が {眠|ねむ}って いる 。 {札|ふだ} に は {家|いえ} の {名前|なまえ} 。 どれ も {春|はる} を {待|ま}って いる 。 || A letter sleeps in each little pigeonhole. Each hole is labelled with a household's name. All of them are waiting for spring.
?(!sb_letters_done) narr: いちばん {上|うえ} の {段|だん} だけ 、 {宛名|あてな} の {真|ま}っ{白|しろ}い {封筒|ふうとう} が {積|つ}まれて いる 。 || Only the top row holds a stack of envelopes with blank addresses.

@scene sb.post_sacks
narr: {郵便|ゆうびん} の {袋|ふくろ} 。 {札|ふだ} に 「 {灯落|ひおち} {行|ゆ}き ・ {春|はる} {一番|いちばん} 」 。 || A mailbag. Its tag says: "For Lanternfall — first thing in spring."

@scene sb.post_notice
narr: {壁|かべ} の {貼|は}り{紙|がみ} 。 「 {冬|ふゆ} の あいだ 、 {手紙|てがみ} は {雪|ゆき} {解|ど}け を {待|ま}ちます 。 {急|いそ}ぎ の {用|よう} は 、 {鐘|かね} で どうぞ 。 」 || A notice on the wall: "Through the winter, letters wait for the thaw. For urgent matters, please use the bell."
`, 'ch4/main-post');

RB.script.add(`
@scene sb.storm_start
!set sb_storm
!music -
!sfx wind
!warp sb.inn 8 9 up
!music inn
narr: {夕方|ゆうがた} に は 、 {雪見屋|ゆきみや} の {囲炉裏|いろり} の まわり に 、 {村|むら} の {人|ひと} が ほとんど {集|あつ}まって いた 。 {外|そと} で は 、 {風|かぜ} が {戸|と} を {叩|たた}いて いる 。 || By evening nearly everyone in the hamlet has gathered round Yukimiya's hearth. Outside, the wind is hammering at the door.
?(sb_rang_storm) fuki[smile]: {吹雪|ふぶき} の {鐘|かね} を {鳴|な}らした の は 、 あんた かい 。 {若|わか}い {腕|うで} の {音|おと} だった 。 …… {間|ま}に{合|あ}った よ 。 {全員|ぜんいん} 。 || Was it you who rang the storm bell? It had the sound of young arms. …Everyone made it. Every last one.
!quest sb_lamp 5
!autosave
!call sb.yae_storm

@scene sb.yae_storm
!if sb_hearth_done -> later
!if sb_orders_done -> hearth
yae: さあ さあ 、 {座|すわ}って 。 {吹雪|ふぶき} の {晩|ばん} は {長|なが}い よ 。 …… {旅|たび} の お{二人|ふたり} 、 {悪|わる}い けど ちょっと {手|て} を {貸|か}して くれる ？ {注文|ちゅうもん} が {追|お}いつかない の 。 || Sit, sit. A storm night is a long one. …You two travellers — sorry, but could you lend a hand? I can't keep up with the orders.
yae: {甘酒|あまざけ} 、 しょうが{湯|ゆ} 、 ヤギ の ミルク 。 {注文|ちゅうもん} を よく {聞|き}いて 、 お{盆|ぼん} に のせて ね 。 {数|かず} も {大事|だいじ} だよ 。 || Amazake, ginger tea, goat's milk. Listen carefully to each order and put it on the tray. The numbers matter too.
!activity sb.a_hearth_orders
!if var._res=0 -> skip
yae[laugh]: {助|たす}かった ！ {数|かず} も {間違|まちが}えなかった し 。 うち で {働|はたら}かない ？ || That saved me! And you didn't get a single count wrong. Want a job here?
!set sb_orders_done
!goto hearth
:skip
yae: いい の いい の 。 {座|すわ}って て 。 わたし が やる から 。 || It's fine, it's fine. Sit down. I'll do it.
!set sb_orders_done
:hearth
!call sb.hearth_fails
!end
:later
yae: {火|ひ} の {番|ばん} は わたし に {任|まか}せて 。 もう {大丈夫|だいじょうぶ} 。 {部屋|へや} は {二階|にかい} だよ 。 {布団|ふとん} 、 {敷|し}いて おいた から ね 。 || Leave the fire to me — it'll be fine now. Your room's upstairs. I've laid out the futons.

@scene sb.hearth_fails
narr: その とき 、 {囲炉裏|いろり} の {火|ひ} が 、 すうっ と {小|ちい}さく なった 。 {風|かぜ} も {入|はい}って いない のに 。 || Then the hearth fire shrinks — just like that. No draught came in.
!shake
yae[surprise]: あれ ？ {薪|まき} は {足|た}りてる のに …… 。 || What? There's plenty of wood…
denji[think]: {天文台|てんもんだい} の {灯|あか}り が {消|き}えた {晩|ばん} と {同|おな}じ だ 。 {火|ひ} が {急|きゅう} に {冷|つめ}たく なる 。 || Same as the night the observatory lamp went out. The fire just goes cold.
narr: {部屋|へや} の {隅|すみ} から 、 {白|しろ}い {霜|しも} が {這|は}って くる 。 {子|こ}ども たち が {母親|ははおや} に しがみつく 。 || White frost creeps in from the corners of the room. The children cling to their mothers.
?(comp=nao) comp: $name 。 {書|か}ける か ？ {火|ひ} の {言葉|ことば} だ 。 …… {水|みず} の {字|じ} の 、 {逆|ぎゃく} の やつ 。 || $name. Can you write it? A word for fire… the opposite of that water one.
?(comp=mio) comp[worry]: $name 、 {火|ひ} を {支|ささ}える {言葉|ことば} を 。 {子|こ}ども たち の {唇|くちびる} が {青|あお}い 。 || $name — a word to hold the fire up. The children's lips are turning blue.
?(comp=ren) comp: $name 、 「 ほのお 」 です 。 {灯守|ひもり} が {最初|さいしょ} に {習|なら}う {字|じ} の {一|ひと}つ 。 わたし が {形|かたち} を {示|しめ}します 。 あなた が {書|か}いて ください 。 || $name — "honoo", flame. One of the first words a keeper learns. I'll show you the shape; you write it.
?(comp=suzu) comp[smile]: {見|み}せ{場|ば} だよ 、 $name 。 「 ほのお 」 の {字|じ} で 、 この {部屋|へや} を もう {一度|いちど} {明|あか}るく して 。 || Your big moment, $name. Write "honoo" and light this room up again.
!lesson kana
!challenge sb.c_honoo
!if var._res=0 -> fail
!sfx light
narr: {書|か}いた {字|じ} が {灰|はい} の {上|うえ} に {落|お}ちる と 、 {炎|ほのお} が {立|た}ち{上|あ}がった 。 {赤|あか}く 、 {高|たか}く 、 {温|あたた}かく 。 {霜|しも} が {音|おと} も なく {引|ひ}いて いく 。 || The written word falls onto the ash and the flames stand up — red, tall, warm. The frost withdraws without a sound.
!word honoo
!set sb_hearth_done
!note sb_honoo
yae[laugh]: …… まあ ！ うち の {囲炉裏|いろり} が 、 こんな に {元気|げんき} な の は {久|ひさ}しぶり だ よ 。 || …My! My hearth hasn't been this lively in years.
kanta[surprise]: すげえ ！ {字|じ} で {火|ひ} が ついた ！ || Whoa! The writing lit the fire!
hoshino[think]: …… {炎|ほのお} 。 そう か 。 あの {灯|あか}り も 、 {名前|なまえ} と {炎|ほのお} が あれば …… 。 || …Flame. I see. That lamp too — with its name, and a flame…
?(comp=nao) comp[smirk]: {火|ひ} を {起|お}こす {配達人|はいたつにん} 。 {新|あたら}しい {商売|しょうばい} に なる な 。 || A courier who lights fires. That could be a new line of business.
?(comp=mio) comp[smile]: よかった 。 …… {子|こ}ども たち の {顔|かお} に 、 {色|いろ} が {戻|もど}って きました 。 || Thank goodness. …The colour's coming back to the children's faces.
?(comp=ren) comp: {明日|あした} 、 {上|のぼ}りましょう 。 {名前|なまえ} を {書|か}き{直|なお}す の は 、 {灯守|ひもり} の {仕事|しごと} です から 。 || Tomorrow, let's climb. Rewriting a name is a keeper's job, after all.
?(comp=suzu) comp[laugh]: {大|だい}{成功|せいこう} ！ {明日|あした} の {公演|こうえん} は 、 {山|やま} の {上|うえ} だ ね 。 || A triumph! Tomorrow's performance is up the mountain, then.
!autosave
!end
:fail
yae: {大丈夫|だいじょうぶ} 、 {薪|まき} を {足|た}せば …… 。 {落|お}ち{着|つ}いたら 、 もう {一度|いちど} {火|ひ} を {見|み}て くれる ？ || It's all right, if I add more wood… When you're ready, will you look at the fire again?
!end

@scene sb.storm_hoshino
!if sb_hearth_done -> warm
hoshino: {吹雪|ふぶき} の {晩|ばん} は 、 アカリ が {小|ちい}さい ころ 、 {天文台|てんもんだい} で {寝|ね}た もの だ 。 {灯|あか}り の {下|した} で ね 。 {怖|こわ}がり だった から 。 || On storm nights, when Akari was small, we'd sleep up at the observatory. Under the lamp. She was a fearful little thing.
!end
:warm
hoshino: {手紙|てがみ} を 、 もう {三回|さんかい} {読|よ}んだ よ 。 {読|よ}む たび に 、 {違|ちが}う ところ で {泣|な}きそう に なる 。 {年|とし} だ ね 。 || I've read the letters three more times. Each time, a different line nearly makes me cry. Age, I suppose.
hoshino: …… {明日|あした} 、 {頼|たの}む よ 。 {今夜|こんや} は {休|やす}んで おくれ 。 {若|わか}い {人|ひと} の {夜|よる} は 、 {話|はなし} を する ため に ある 。 || …Tomorrow, then. Rest tonight. Young people's nights are for talking.
`, 'ch4/main-storm');

RB.script.add(`
@scene sb.room_futon
narr: {布団|ふとん} は ふかふか で 、 {日|ひ} の {匂|にお}い が する 。 ヤエ が {吹雪|ふぶき} の {前|まえ} に {干|ほ}して おいた らしい 。 || The futon is soft and smells of sunshine. Yae must have aired it before the storm.

@scene sb.room_table
narr: {盆|ぼん} の {上|うえ} に 、 {湯呑|ゆの}み が {二|ふた}つ と 、 {干|ほ}し{柿|がき} が {二|ふた}つ 。 {宿|やど} の {心遣|こころづか}い だ 。 || On the tray: two teacups and two dried persimmons. The inn's thoughtfulness.

@scene sb.room_stay
narr: {夜|よる} は まだ {長|なが}い 。 {下|した} に {降|お}りる {理由|りゆう} は ない 。 || The night is still long. There's no reason to go downstairs.

@scene sb.morning_hoshino
hoshino: おはよう 。 よく {眠|ねむ}れた かね 。 わたし は …… {久|ひさ}しぶり に 、 {夢|ゆめ} も {見|み}ず に {眠|ねむ}った よ 。 || Good morning. Did you sleep? I… for once I slept without dreaming.
hoshino: {頼|たの}み が ある 。 {天文台|てんもんだい} へ {上|のぼ}って 、 {灯|あか}り を ともして くれない か 。 わたし の {足|あし} では 、 {凍|こお}った {石段|いしだん} は {無理|むり} だ 。 || I have a favour to ask. Would you climb to the observatory and relight the lamp? My legs won't manage a frozen stair.
!give sb_obs_key
hoshino: {石段|いしだん} の {氷|こおり} は 、 {昨夜|ゆうべ} の あの {字|じ} で とかせる はず だ 。 {扉|とびら} は この {鍵|かぎ} で {開|あ}く 。 {中|なか} の こと は …… デンジ に {聞|き}いた ね 。 あの {丸屋根|まるやね} を いっしょ に {建|た}てた {男|おとこ} だ 。 || The ice on the stair should melt with that word from last night. This key opens the door. As for inside… Denji told you, didn't he. He built the dome with me.
hoshino: {道|みち} が {開|ひら}けたら 、 わたし も {後|あと} から {行|い}く 。 {灯|あか}り の {前|まえ} で 、 {待|ま}って いて くれ 。 || Once the way is clear, I'll follow. Wait for me at the lamp.
?(comp=mio) comp[worry]: ホシノ さん 、 {無理|むり} は しないで ください ね 。 {石段|いしだん} は わたし たち が {先|さき} に {確|たし}かめます から 。 || Please don't push yourself, Mr Hoshino. We'll check the stair first.
?(comp=nao) comp: {後|あと} から {来|く}る なら 、 {道|みち} は {開|あ}けて おく 。 {近道|ちかみち} が ある なら 、 なおさら だ 。 || If you're coming after us, we'll keep the way open. All the more if there's a shortcut.
!set sb_obs_open
!quest sb_lamp 6
!autosave

@scene sb.hoshino_charts
narr: {机|つくえ} の {上|うえ} の {星図|せいず} 。 {星|ほし} の {名前|なまえ} の {横|よこ} に 、 {鉛筆|えんぴつ} で {小|ちい}さく {日付|ひづけ} が {書|か}き{込|こ}んで ある 。 どれ も 、 アカリ の {手紙|てがみ} が {届|とど}いた {日|ひ} だ 。 || Star charts on the desk. Beside some of the star names, dates are pencilled in small. Every one is a day one of Akari's letters arrived.
?(comp=ren) comp: {星|ほし} の {記録|きろく} と 、 {娘|むすめ} さん の {記録|きろく} が 、 {同|おな}じ {紙|かみ} に ある 。 …… {良|よ}い {記録|きろく} の {付|つ}け{方|かた} です 。 || The record of the stars and the record of his daughter, on the same sheet. …A good way to keep records.

@scene sb.hoshino_window
narr: {窓|まど} の {前|まえ} の {望遠鏡|ぼうえんきょう} は 、 {空|そら} で は なく 、 {坂|さか} の {下|した} に {向|む}けられて いる 。 {接眼|せつがん} {部|ぶ} だけ が 、 {手|て} の {脂|あぶら} で {光|ひか}って いた 。 || The telescope by the window points down the slope rather than at the sky. Only the eyepiece shines, polished by hands.
?(sb_lamp_lit) narr: {今|いま} は {空|そら} に {向|む}け{直|なお}して ある 。 {鼓星|つづみぼし} の {方角|ほうがく} だ 。 || It has been turned back toward the sky now — toward the Drum Stars.

@scene sb.hoshino_shelf
narr: {棚|たな} に 、 {子|こ}ども {向|む}け の {星|ほし} の {本|ほん} が {一冊|いっさつ} 。 {表紙|ひょうし} が すり{切|き}れて いる 。 {裏|うら} に 、 {大人|おとな} の {字|じ} で 「 アカリ へ 。 {五歳|ごさい} の {誕生日|たんじょうび} に 」 。 || On the shelf, one children's book about the stars, its cover worn through. Inside the back, in an adult's hand: "To Akari, on your fifth birthday."

@scene sb.hoshino_letters_box
!if sb_akari_ordered -> read
narr: {卓|たく} の {上|うえ} に 、 {封筒|ふうとう} が {積|つ}んで ある 。 どれ も {宛名|あてな} が {真|ま}っ{白|しろ} で 、 {戻|もど}って きた もの らしい 。 {差出人|さしだしにん} の {欄|らん} に だけ 、 「 ホシノ 」 。 || Envelopes are piled on the low table. Every address is perfectly blank; they must be the ones that came back. Only the sender line says "Hoshino".
!end
:read
narr: {戻|もど}って きた {手紙|てがみ} の {山|やま} の {隣|となり} に 、 アカリ の {四通|よんつう} が 、 {順番|じゅんばん} どおり に {並|なら}べて ある 。 || Beside the pile of returned letters, Akari's four lie in a neat row, in order.

@scene sb.hoshino_after
!if post -> end
hoshino[smile]: {灯|あか}り の {下|した} で {書|か}いた {手紙|てがみ} だ 。 {頼|たの}んだ よ 。 {宛名|あてな} は …… {君|きみ} たち が {見|み}つけて くれる だろう 。 || That letter was written under the lamp. I'm counting on you. The address… I trust you'll find it.
?(sb_hoshino_goes) hoshino: {春|はる} に なったら 、 わたし も {下|くだ}る 。 {灯|あか}り は カンタ と フキ さん に {任|まか}せた 。 {約束|やくそく} を {人|ひと} に {預|あず}ける の は 、 {思|おも}った より {怖|こわ}く なかった よ 。 || Come spring, I'll go down too. I've left the lamp to Kanta and Fuki. Handing a promise to someone else wasn't as frightening as I thought.
?(sb_hoshino_both) hoshino: {毎晩|まいばん} {灯|あか}り を ともして 、 {春|はる} に なったら {会|あ}い に {行|い}く 。 {欲張|よくば}り な {年寄|としよ}り だ ね 。 || I'll light the lamp every night, and when spring comes I'll go and see her. A greedy old man, aren't I.
?(sb_hoshino_stays) hoshino: {毎晩|まいばん} 、 {上|のぼ}って いる よ 。 {誰|だれ} も {見|み}て いない {夜|よる} も ね 。 {約束|やくそく} は 、 {見|み}られる ため に ある ん じゃ ない から 。 || I climb up every night. Even on nights no one's watching. A promise isn't there to be seen.

@scene sb.hoshino_home_post
!call sb.hoshino_post

@scene sb.hoshino_post
hoshino[smile]: やあ 、 $name 。 {灯|あか}り は {今夜|こんや} も ついて いる よ 。 || Hello, $name. The lamp's lit tonight as well.
?(sb_hoshino_both) hoshino: {春|はる} に {灯落|ひおち} で アカリ に {会|あ}って きた 。 {役所|やくしょ} で 「 いいえ 」 と {言|い}える よう に なった って 、 {得意|とくい} そう だった 。 || I went down to Lanternfall in spring and saw Akari. She was proud she can say "no" at the office now.
?(!sb_hoshino_both) hoshino: アカリ から {返事|へんじ} が {来|き}た 。 {橋|はし} の {上|うえ} から 、 {毎晩|まいばん} {見|み}て いる そう だ 。 {今度|こんど} の {夏|なつ} 、 {帰|かえ}って くる よ 。 || Akari wrote back. She says she watches from the bridge every night. She's coming home this summer.
?(end_archive_library) hoshino: {山|やま} の {書庫|しょこ} が {開|ひら}かれた {図書館|としょかん} に なった と {聞|き}いて 、 {星図|せいず} の {写|うつ}し を {送|おく}った 。 {動|うご}かない {光|ひかり} の {記録|きろく} も ね 。 || When I heard the mountain archive had become an open library, I sent them a copy of my star charts. The records of the light that doesn't move, too.
?(end_archive_closed) hoshino: {南東|なんとう} の {動|うご}かない {光|ひかり} は 、 {消|き}えた よ 。 {星|ほし} だけ に なった {空|そら} は 、 {少|すこ}し {寂|さび}しい が 、 きれい だ 。 || The unmoving light in the southeast has gone out. A sky of nothing but stars is a little lonely, but beautiful.

@scene sb.eve_hoshino
hoshino[smile]: {見|み}て ごらん 。 {下|した} の {町|まち} まで {届|とど}いて いる はず だ 。 || Look. It should reach all the way to the town below.
hoshino: {君|きみ} たち が {灯落|ひおち} へ {下|くだ}る {道|みち} は 、 ハヤテ が {明日|あした} {開|あ}けて くれる そう だ 。 …… アカリ に 、 よろしく 。 || Hayate says he'll clear the road down to Lanternfall for you tomorrow. …Give Akari my love.
`, 'ch4/main-hoshino2');
