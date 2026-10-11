/* Steamhollow, Chapter 11: the two inns (expansion P13b; docs/future/work/P13_STEAMHOLLOW.md; plan R3 A42–A46, C13).
 *
 * The Upper House (上の湯): Oritsu the proprietress and her exacting rules; Tokuzō's front desk and the newcomers'
 * rooms (the reservations, an activity on the encounter platform: yn.rooms in 31_encounters.js); Okiyo and the house
 * rules (read from the framed sign, yn.rules_kami); your own small room under the stairs; the bath.
 * The Lower House (下の湯): Tahei's side of the quarrel; Kane, who keeps the books and the peace; a guest's complaint
 * that never says what it means (yn.complaint); the house rules on one short board, different from the Upper House's
 * (yn.rules_shimo; hot springs vary by place, and the game says so); the open-air bath.
 *
 * The baths follow pronouns (C-56; src/engine/58y_baths.js): she/her the women's bath, he/him the men's, they/them and
 * custom pronouns choose once (s.vars.bath_side: 1 men's, 2 women's, 3 reserved, 貸切) and the choice is kept. Mio
 * and Suzu use the women's bath; Nao and Ren, in character and always the same, the reserved one (Nao: a courier
 * washes fast, alone, at odd hours; Ren: the reserved bath has a lamp of its own). When you and your companion are on
 * different sides you talk over the bamboo partition (yn_bath_apart). Towel-wrapped, nonsexual, warm and funny; with
 * the comfort setting on Summarised the bath itself is told in a sentence and the conversation stays.
 * Suzu's lines have Kansai versions (kansai_99_yn.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene yn.kami_first
# The Upper House's lobby: tatami, polished wood, a hush the street doesn't have. Okiyo greets every guest the same way.
!set yn_kami_seen
!faceplayer yn_okiyo
yn_okiyo: いらっしゃいませ 。 {上|かみ}の{湯|ゆ} へ 、 ようこそ お{越|こ}し くださいました 。 || Welcome. Thank you for coming to the Upper House.
yn_okiyo: …… {申|もう}し{訳|わけ} ございません 。 ただいま 、 {満室|まんしつ} で ございまして …… 。 || …We do apologise. We are fully booked at present…
narr: {帳場|ちょうば} の {奥|おく} で 、 {眼鏡|めがね} の {番頭|ばんとう} が {帳面|ちょうめん} と {人|ひと} の {列|れつ} の {間|あいだ} で {目|め} を {回|まわ}して いる 。 || Behind the front desk a clerk in spectacles is going round in circles between his book and a line of people.
?(comp=suzu) comp[smirk]: 「{満室|まんしつ} で ございまして 」 の {後|あと} に 、 {何|なに} も {続|つづ}かない の が 、 {老舗|しにせ} の {断|ことわ}り{方|かた} よ 。 {覚|おぼ}えて おいて 。 || "We are fully booked…" and then nothing after it: that's how an old house says no. Remember it.

@scene yn.oritsu_first
# Oritsu: third of her line, exacting, proud of the house's rules; her side of the quarrel, in her own polished way.
!set yn_oritsu_met
!faceplayer
yn_oritsu: {上|かみ}の{湯|ゆ} の {女将|おかみ} 、 オリツ で ございます 。 {湯守|ゆもり} の {頭|かしら} から 、 お{話|はなし} は {伺|うかが}って おります 。 || I am Oritsu, proprietress of the Upper House. The head bath-keeper has told me about you.
yn_oritsu: {当館|とうかん} は 、 {祖母|そぼ} の {代|だい} から 、 {湯|ゆ} の {決|き}まり を {大切|たいせつ} に して まいりました 。 {静|しず}か に 、 {清|きよ}く 。 それ が {上|かみ}の{湯|ゆ} で ございます 。 || Since my grandmother's day this house has held to the rules of the bath. Quiet, and clean. That is the Upper House.
yn_oritsu: {下|しも}の{湯|ゆ} が {新|あたら}しく {作|つく}った {露天風呂|ろてんぶろ} は 、 {大変|たいへん} な {量|りょう} の {湯|ゆ} を {使|つか}う と {聞|き}いて おります 。 …… {当館|とうかん} の {湯|ゆ} が ぬるい の は 、 その せい で は ない か と 。 || I am told the open-air bath the Lower House has newly built uses a great deal of water. …I cannot help wondering whether that is why our own water has gone lukewarm.
?(comp=nao) comp[closed]: 「{聞|き}いて おります 」 か 。 {見|み}た わけ じゃ ない な 。 || "I am told." So you haven't seen it.
?(comp=mio) comp[think]: ぬるい {湯|ゆ} は 、 {長|なが}く {入|はい}る と かえって {体|からだ} を {冷|ひ}やします 。 {困|こま}って いる {人|ひと} は 、 {本当|ほんとう} に いる と {思|おも}います 。 || Lukewarm water chills you if you stay in long. I do think people are suffering for it.
?(comp=ren) comp[think]: {祖母|そぼ} の {代|だい} から の {決|き}まり 。 …… その {前|まえ} の {決|き}まり も 、 あった はず です 。 || Rules from her grandmother's day. …There must have been rules before those, too.
?(comp=suzu) comp[smirk]: {完璧|かんぺき} な {敬語|けいご} で 、 {相手|あいて} の {宿|やど} を {刺|さ}す 。 {見事|みごと} な {台詞回|せりふまわ}し ね 。 || Running the other house through in perfect honorifics. Beautifully delivered.

@scene yn.oritsu_idle
!faceplayer
!if yn_rooms_done -> roomed
yn_oritsu: {帳場|ちょうば} の トクゾウ が 、 {手|て} が {足|た}りず に {困|こま}って おります 。 お{手伝|てつだ}い いただければ 、 {部屋|へや} の {一|ひと}つ くらい は 、 {何|なん} と か いたしましょう 。 || Tokuzō at the desk is short of hands. If you would help him, I shall find a room for you somehow.
!end
:roomed
yn_oritsu: {階段|かいだん} の {下|した} の {小部屋|こべや} 、 お{気|き}に {召|め}しました か 。 {狭|せま}い ところ で 、 {恐|おそ}れ{入|い}ります 。 || The little room under the stairs: is it to your liking? I'm afraid it is cramped.

@scene yn.tokuzo
!faceplayer
yn_tokuzo: はい 、 はい 、 ただいま ！ …… あ 、 {失礼|しつれい} いたしました 。 {帳場|ちょうば} の トクゾウ で ございます 。 || Yes, yes, right away! …Ah, I beg your pardon. Tokuzō, at the desk.
?(quest.yn_main<2) yn_tokuzo: {湯守|ゆもり} の {頭|かしら} の お{知|し}り{合|あ}い で ございます か 。 {後|のち}ほど 、 ぜひ お{話|はなし} を 。 || A friend of the head bath-keeper? Later, I'd be glad of a word.

@scene yn.rooms_start
# Tokuzō's front desk: the newcomers from the ridge villages and their needs, a change, and a guest who must be told
# no, politely. The encounter is the reservation board (yn.rooms). Whatever happens, the newcomers get rooms tonight
# and you get the little room under the stairs.
!faceplayer
yn_tokuzo: ああ 、 {助|たす}かります ！ {尾根|おね} の {村|むら} から {下|お}りて {来|き}た {方|かた} が 、 {次|つぎ} から {次|つぎ} へ と …… 。 {空|あ}いて いる {部屋|へや} は 、 {帳面|ちょうめん} の とおり で ございます 。 || Oh, what a help! People down from the ridge villages, one after another… The free rooms are as the book shows.
yn_tokuzo: お{客|きゃく}さま の ご{希望|きぼう} を {伺|うかが}って 、 {合|あ}う {部屋|へや} を {決|き}めて いただけます か 。 {私|わたくし} は 、 {札|ふだ} を {書|か}きます ので 。 || Could you hear what each guest would like and choose a room that suits? I'll write out the tags.
?(comp=suzu) comp[smile]: {帳面|ちょうめん} の {仕事|しごと} ね 。 …… ふふ 、 {血|ち} が {騒|さわ}ぐ わ 。 || Ledger work. …Heh. It stirs the blood.
!encounter yn.rooms
!if var._res=0 -> later
!set yn_rooms_done
yn_tokuzo: {皆|みな}さま 、 {無事|ぶじ} に お{部屋|へや} へ 。 …… ありがとう ございました 。 {本当|ほんとう} に 。 || Everyone safely in their rooms. …Thank you. Truly.
!faceplayer yn_oritsu
yn_oritsu: {拝見|はいけん} して おりました 。 {断|ことわ}り {方|かた} が 、 {上手|じょうず} で いらっしゃる 。 || I was watching. You decline gracefully.
yn_oritsu: {階段|かいだん} の {下|した} に 、 {小|ちい}さな {部屋|へや} が ございます 。 {狭|せま}い ところ です が 、 お{使|つか}い ください 。 {手拭|てぬぐ}い と {浴衣|ゆかた} も 、 どうぞ 。 || There is a small room under the stairs. It is cramped, but please make use of it. And a towel and a yukata, if you please.
!give yn_towel
!give yn_yukata
narr: {浴衣|ゆかた} は 、 {左側|ひだりがわ} を {上|うえ} に {重|かさ}ねて {着|き}る 。 {右側|みぎがわ} を {上|うえ} に する の は 、 {亡|な}くなった {人|ひと} の {着方|きかた} だ 。 （{本当|ほんとう} の {習|なら}わし ） || A yukata is worn left side over right. Right over left is how the dead are dressed. (A real custom.)
!quest yn_main 3
!journal {上|かみ}の{湯|ゆ} の {帳場|ちょうば} を {手伝|てつだ}い 、 {階段|かいだん} の {下|した} の {部屋|へや} を もらった 。 {下|しも}の{湯|ゆ} の {話|はなし} も {聞|き}こう 。 || You helped at the Upper House's desk and were given the room under the stairs. Hear the Lower House's side too.
!autosave
!end
:later
yn_tokuzo: …… {少|すこ}し {休|やす}んで から 、 また お{願|ねが}い できます か 。 {札|ふだ} は 、 {途中|とちゅう} まで {書|か}いて おきます 。 || …Could you come back to it after a rest? I'll keep the tags written up to where we were.

@scene yn.tokuzo_after
!faceplayer
yn_tokuzo: {湯|ゆ} の {取|と}り{決|き}め 、 {帳場|ちょうば} に も {貼|は}りました 。 {字|じ} が {綺麗|きれい} だ と 、 {評判|ひょうばん} で ございます よ 。 || I've put up the spring agreement at the desk too. Everyone remarks on how neatly it's written.

@scene yn.kami_desk
narr: {帳場|ちょうば} の {予約|よやく} {帳|ちょう} 。 {松|まつ} 、 {竹|たけ} 、 {梅|うめ} 、 {離|はな}れ 。 {部屋|へや} の {名前|なまえ} の {横|よこ} に 、 {客|きゃく} の {名前|なまえ} が {小|ちい}さく {並|なら}んで いる 。 || The desk's reservation book: Pine, Bamboo, Plum, the Annex. Beside each room's name, guests' names in small writing.
?(yn_rooms_done) narr: {新|あたら}しい {名前|なまえ} の {横|よこ} に 、 「{尾根|おね} より 」 と {書|か}き{添|そ}えて ある 。 || Beside the newest names someone has added: "From the ridge."

@scene yn.kami_rules
# The Upper House's rules, framed by the stair. Real customs (washing first, towels out of the water, quiet) labelled as
# real; the house's own (the hours, the evening swap of the men's and women's baths) as the house's.
narr: {額|がく} に {入|はい}った 「{入浴|にゅうよく} の {心得|こころえ} 」 。 {筆|ふで} の {字|じ} が {丁寧|ていねい} だ 。 || A framed notice, "Bathing etiquette", in careful brushwork.
narr: 「{一|いち} 、 {湯船|ゆぶね} に {入|はい}る {前|まえ} に 、 {体|からだ} を {流|なが}して ください 。 {二|に} 、 {手拭|てぬぐ}い を {湯船|ゆぶね} に {入|い}れて は いけません 。 {三|さん} 、 {湯|ゆ} の {中|なか} で は 、 お{静|しず}か に 。 {四|よん} 、 {夜|よる} {十時|じゅうじ} に 、 {男湯|おとこゆ} と {女湯|おんなゆ} が {入|い}れ{替|か}わります 。 {五|ご} 、 {入浴|にゅうよく} は {朝|あさ} {六時|ろくじ} から {夜|よる} {十二時|じゅうにじ} まで 。」 || "1. Rinse yourself before getting into the bath. 2. Towels must not go into the water. 3. Quiet in the bath, please. 4. At ten at night the men's and women's baths change sides. 5. Bathing from six in the morning until midnight."
narr: （{一|いち} から {三|さん} は 、 {多|おお}く の {温泉|おんせん} の {本当|ほんとう} の {習|なら}わし 。 {四|よん} と {五|ご} は 、 この {宿|やど} の {決|き}まり 。 {温泉|おんせん} に よって {違|ちが}う 。 ） || (1 to 3 are real customs at most hot springs. 4 and 5 are this inn's own. They differ from place to place.)
!if yn_rules_kami -> end
!challenge yn.rules_kami
!set yn_rules_kami
:end

@scene yn.okiyo_rules
!faceplayer
yn_okiyo: お{風呂|ふろ} の {決|き}まり 、 ご{存|ぞん}じ です か 。 {階段|かいだん} の {横|よこ} に 、 {額|がく} が ございます 。 {湯船|ゆぶね} の {前|まえ} に 、 {必|かなら}ず かけ{湯|ゆ} を お{願|ねが}い いたします ね 。 || Do you know the bath rules? There's a framed notice by the stairs. Please be sure to rinse before you get in.
?(!yn_rules_kami) yn_okiyo: {手拭|てぬぐ}い は 、 {頭|あたま} の {上|うえ} に 。 {湯|ゆ} に は {入|い}れない で くださいまし 。 {皆|みな}さま の {湯|ゆ} です から 。 || Your towel goes on your head. Never in the water, please. The water is everyone's.

@scene yn.okiyo_idle
!faceplayer
yn_okiyo: {十時|じゅうじ} に {入|い}れ{替|か}わります から 、 {暖簾|のれん} の {色|いろ} を よく ご{覧|らん} に なって くださいまし ね 。 {藍|あい} が {男湯|おとこゆ} 、 {赤|あか} が {女湯|おんなゆ} 、 {茶|ちゃ} が {貸切|かしきり} で ございます 。 || The baths change at ten, so do check the curtains' colours. Indigo is the men's, red the women's, brown the reserved bath.

@scene yn.kami_room
!if yn_mio_night&!yn_mio_back -> mio
!if yn_suzu_night&!yn_suzu_back -> suzu
!if yn_rooms_done -> room
narr: {階段|かいだん} の {上|うえ} は 、 お{客|きゃく} の {部屋|へや} だ 。 || Up the stairs are the guests' rooms.
!end
:room
narr: {階段|かいだん} の {下|した} の {小|ちい}さな {部屋|へや} 。 {布団|ふとん} が {一|ひと}つ {敷|し}いて あり 、 {窓|まど} から {湯気|ゆげ} が {見|み}える 。 || The little room under the stairs. A futon laid out, steam drifting past the window.
!choice
* {休|やす}む || Rest -> rest
* やめて おく || Not now -> no
:rest
!inn
:no
!end
:mio
!call yn.mio_sleep
!end
:suzu
!call yn.suzu_garden

@scene yn.bath_kami
!if !yn_rooms_done -> guests
!call yn.bath_side
!warp yn.kami_bath 7 8 up
!call yn.bath_scene
!end
:guests
yn_okiyo: {申|もう}し{訳|わけ} ございません 。 お{風呂|ふろ} は 、 お{泊|と}まり の お{客|きゃく}さま だけ で ございます 。 || I'm terribly sorry. The baths are for staying guests only.

@scene yn.bath_shimo
!call yn.bath_side
!warp yn.shimo_bath 2 9 right
!call yn.bath_scene

@scene yn.bath_side
# Which bath: she/her the women's, he/him the men's; they/them and custom choose once, kept (C-56). The companion's
# own side, always the same (Mio and Suzu the women's; Nao and Ren the reserved bath).
!if var.bath_side>=1 -> known
!if pron=she -> she
!if pron=he -> he
narr: {暖簾|のれん} が {三|みっ}つ 。 {藍色|あいいろ} の 「{男湯|おとこゆ} 」 、 {赤|あか} の 「{女湯|おんなゆ} 」 、 {茶色|ちゃいろ} の 「{貸切風呂|かしきりぶろ} 」 。 {貸切|かしきり} は 、 {一人|ひとり} で も 、 {連|つ}れ と でも {入|はい}れる {小|ちい}さな {湯|ゆ} だ 。 || Three curtains: indigo for the men's bath, red for the women's, brown for the reserved bath, a small bath you can take alone or with your party.
narr: どの {湯|ゆ} に {入|はい}る ？ （この {後|あと} も 、 {同|おな}じ {湯|ゆ} に {入|はい}る 。 ） || Which bath will you use? (You'll use the same one from now on.)
!choice
* {男湯|おとこゆ} || The men's bath -> m
* {女湯|おんなゆ} || The women's bath -> w
* {貸切風呂|かしきりぶろ} || The reserved bath -> r
:m
!var bath_side = 1
!goto known
:w
!var bath_side = 2
!goto known
:r
!var bath_side = 3
!goto known
:she
!var bath_side = 2
!goto known
:he
!var bath_side = 1
:known
!unset yn_bath_apart
?(comp=mio&!var.bath_side=2) !set yn_bath_apart
?(comp=suzu&!var.bath_side=2) !set yn_bath_apart
?(comp=nao&!var.bath_side=3) !set yn_bath_apart
?(comp=ren&!var.bath_side=3) !set yn_bath_apart

@scene yn.bath_scene
# Every time you step into a bath: the bath itself (or a sentence, with the comfort setting on Summarised); the first
# time anywhere, the companion's bath beat (yn.bath_beat).
?(bathview=shown) narr: {洗|あら}い{場|ば} で {腰掛|こしか}け に {座|すわ}り 、 {桶|おけ} で {湯|ゆ} を {浴|あ}びて から 、 {湯船|ゆぶね} に {入|はい}る 。 {手拭|てぬぐ}い は {畳|たた}んで {頭|あたま} の {上|うえ} 。 {熱|あつ}い {湯|ゆ} が 、 {肩|かた} まで {来|く}る 。 || You sit on a stool at the washing place, rinse off with a bucket, then step into the bath, towel folded on your head. Hot water up to your shoulders.
?(bathview=summarised) narr: {体|からだ} を {流|なが}して から 、 {湯|ゆ} に {浸|つ}かった 。 || You rinse off, then soak.
?(yn_bath_apart) narr: {竹|たけ} の {垣根|かきね} の {向|む}こう から 、 {聞|き}き{慣|な}れた {声|こえ} が する 。 || From beyond the bamboo partition comes a familiar voice.
!if yn_bathed -> again
!set yn_bathed
!call yn.bath_beat
!end
:again
?(comp=nao) comp: …… {寝|ね}る な よ 。 {湯|ゆ} の {中|なか} で {寝|ね}る の が 、 {一番|いちばん} {危|あぶ}ない ん だ 。 || …Don't fall asleep. Falling asleep in the bath is the most dangerous thing you can do.
?(comp=mio) comp[smile]: {長湯|ながゆ} は {禁物|きんもつ} です よ 。 {十分|じゅっぷん} くらい で 、 {一度|いちど} {上|あ}がりましょう 。 || Don't stay in too long. Ten minutes or so, then get out for a bit.
?(comp=ren) comp: {湯気|ゆげ} の {向|む}こう の {灯|ひ} が 、 また {丸|まる}い です 。 || The lamp beyond the steam is round again.
?(comp=suzu) comp[laugh]: ああ …… {極楽|ごくらく} 、 {極楽|ごくらく} 。 {一度|いちど} {言|い}って みたかった の 。 || Ahh… paradise, paradise. I always wanted to say that.

@scene yn.bath_beat
# The companion's bath scene, once (R3 Companions): Nao, a courier's sore feet and finally sitting still; Mio, the
# waters' medicinal claims on the board by the bath, read honestly; Ren, the valley's lanterns through the steam;
# Suzu, her old idol, who is said to take these very waters. Warm and funny, towel-wrapped.
?(comp=nao) comp[closed]: …… {足|あし} が 、 じん と する 。 {湯|ゆ} に {入|い}れる と 、 {自分|じぶん} の {足|あし} が どれ だけ {歩|ある}いた か {分|わ}かる な 。 || …My feet are tingling. Put them in hot water and you find out how far they've walked.
?(comp=nao) comp: {飛脚|ひきゃく} は 、 {座|すわ}る と {負|ま}け だ と {教|おそ}わった 。 …… でも 、 {今|いま} は {座|すわ}って いる 。 {負|ま}けて いる {気|き} は 、 しない 。 || Couriers are taught that sitting down means you've lost. …But I'm sitting now. It doesn't feel like losing.
?(comp=nao) comp[smirk]: {誰|だれ} に も {言|い}う な よ 。 {俺|おれ} が {湯|ゆ} で {溶|と}けて いた こと 。 || Don't tell anyone I melted in the bath.
?(comp=mio) comp[think]: {湯船|ゆぶね} の {横|よこ} の {板|いた} に 、 「{効能|こうのう} 」 が {書|か}いて あります 。 {神経痛|しんけいつう} 、 {筋肉痛|きんにくつう} 、 {疲|つか}れ …… 「{失恋|しつれん} 」 ？ || The board by the bath lists "benefits". Neuralgia, sore muscles, fatigue… "a broken heart"?
?(comp=mio) comp[laugh]: …… {最後|さいご} の は 、 {薬|くすり} で は ない です ね 。 でも 、 {温|あたた}まる と 、 {少|すこ}し {楽|らく} に なる の は 、 {本当|ほんとう} です 。 そこ まで なら 、 {嘘|うそ} じゃ ない 。 || …That last one isn't medicine. But warming up does ease things a little, that's true. Up to there, it's not a lie.
?(comp=mio) comp[smile]: {効|き}く こと と 、 {効|き}く と {言|い}いたい こと は 、 {分|わ}けて {書|か}く べき です 。 …… {私|わたし} の {棚|たな} も 、 そう したい 。 || What works and what someone wants to say works should be written separately. …I want my own shelves to be like that.
?(comp=ren) comp: {湯気|ゆげ} の {向|む}こう に 、 {灯|ひ} が {三|みっ}つ {見|み}えます 。 {丸|まる}くて 、 {輪郭|りんかく} が ない 。 {名前|なまえ} を {呼|よ}ぶ {前|まえ} の {灯|ひ} みたい です 。 || Beyond the steam I can see three lamps. Round, with no edges. Like lamps before anyone's called their names.
?(comp=ren) comp[laugh]: …… ちなみに 、 {貸切|かしきり} の {湯|ゆ} に {来|く}る まで 、 {二回|にかい} {間違|まちが}えました 。 {一回|いっかい} は {台所|だいどころ} でした 。 || …Incidentally, I took two wrong turns on the way to the reserved bath. One of them was the kitchen.
?(comp=ren) comp[smile]: {湯|ゆ} の {中|なか} で は 、 {灯守|ひもり} の {言葉|ことば} を {一|ひと}つ も {思|おも}い{出|だ}せません 。 …… たまに は 、 それ で いい の かも しれません 。 || In the bath I can't remember a single keepers' saying. …Maybe that's all right, now and then.
?(comp=suzu) comp[shy]: …… ここ の {湯|ゆ} に 、 ギンノジョウ が {来|き}て いる って {噂|うわさ} 、 {聞|き}いた ？ {八百橋|やおばし} の {芝居町|しばいまち} の 、 {伝説|でんせつ} の {喜劇|きげき} {役者|やくしゃ} よ 。 || …Have you heard the rumour that Ginnojō takes these waters? The legendary comic actor of Manybridge's Playhouse Row.
?(comp=suzu) comp[laugh]: {十六|じゅうろく} の {時|とき} 、 {彼|かれ} の {間|ま} の {取|と}り{方|かた} を 、 {毎晩|まいばん} {真似|まね} した の 。 {一座|いちざ} の {皆|みな} に 、 {似|に}て ない って {笑|わら}われた けど 。 || When I was sixteen I copied his timing every night. Everyone in the troupe laughed and said it was nothing like him.
?(comp=suzu) comp[smile]: もし {会|あ}えたら …… {何|なに} {言|い}おう 。 {湯|ゆ} の {中|なか} で {台詞|せりふ} を {考|かんが}える の 、 {初|はじ}めて よ 。 || If I meet him… what would I say? First time I've ever worked out lines in a bath.
?(yn_bath_apart) narr: {垣根|かきね} {越|ご}し の {話|はなし} は 、 {湯気|ゆげ} と {一緒|いっしょ} に {上|うえ} へ {昇|のぼ}って いった 。 || The talk over the partition rises with the steam.
!hook co_bond yn:bath

@scene yn.wash
narr: {洗|あら}い{場|ば} 。 {木|き} の {腰掛|こしか}け と {桶|おけ} 。 {湯船|ゆぶね} に {入|はい}る {前|まえ} に 、 ここ で {体|からだ} を {流|なが}す 。 （かけ{湯|ゆ} 。 {本当|ほんとう} の {習|なら}わし ） || The washing place: wooden stools and buckets. You rinse off here before getting into the bath. (Kakeyu: a real custom.)

@scene yn.soak
narr: {肩|かた} まで {湯|ゆ} に {浸|つ}かって 、 {指|ゆび} が しわしわ に なる まで {動|うご}かず に いた 。 || You sink in to your shoulders and stay still until your fingers wrinkle.
!heal
narr: {体|からだ} の {芯|しん} まで 、 {温|あたた}まった 。 || You're warm right through.

@scene yn.shimo_first
# The Lower House: loud, warm, a hearth in the middle of the floor, guests' laughter; the master's voice over all of it.
!set yn_shimo_seen
narr: {下|しも}の{湯|ゆ} の {土間|どま} は 、 {笑|わら}い{声|ごえ} と {囲炉裏|いろり} の {煙|けむり} で いっぱい だ 。 || The Lower House's earthen-floored entrance is full of laughter and smoke from the hearth.
yn_tahei: おう 、 {入|はい}れ {入|はい}れ ！ {満員|まんいん} だ が 、 {土間|どま} で よければ {座|すわ}って いけ ！ || Hey, come in, come in! We're full, but if the floor'll do, sit yourselves down!
?(comp=nao) comp[smirk]: {上|かみ}の{湯|ゆ} と は 、 {音|おと} の {量|りょう} が {違|ちが}う な 。 || A different volume from the Upper House.
?(comp=suzu) comp[laugh]: こっち は {大衆演劇|たいしゅうえんげき} の {楽屋|がくや} みたい 。 {好|す}き よ 。 || This one's like the dressing room of a popular theatre. I like it.

@scene yn.tahei_first
# Tahei's side: the outdoor bath takes no more water than the old one; the Upper House has doubled its guests since the
# newcomers came; the Lower House's half of the day comes in cold.
!set yn_shimo_heard
!faceplayer
yn_tahei: {下|しも}の{湯|ゆ} の {主|あるじ} 、 タヘエ だ 。 {上|かみ}の{湯|ゆ} の {女将|おかみ} に 、 {何|なに} か {吹|ふ}き{込|こ}まれた か ？ || Tahei, master of the Lower House. Has the Upper House's proprietress been filling your ears?
yn_tahei: {露天風呂|ろてんぶろ} は 、 {俺|おれ} が {自分|じぶん} で {掘|ほ}った 。 {湯|ゆ} は {前|まえ} の {湯船|ゆぶね} と {同|おな}じ {量|りょう} だ 。 {空|そら} の {下|した} に {出|だ}した だけ だ ！ || I dug that open-air bath myself. It holds the same water as the old indoor one. I just moved it out under the sky!
yn_tahei: それ より 、 {上|かみ}の{湯|ゆ} は {尾根|おね} の {人|ひと} を {入|い}れて 、 {客|きゃく} が {倍|ばい} だ 。 {湯|ゆ} を {分|わ}ける {時計|とけい} は {半日|はんにち} ずつ と {言|い}う が 、 {俺|おれ} たち の {半日|はんにち} は 、 {冷|つめ}たい {湯|ゆ} しか {来|こ}ねえ ！ || What's more, the Upper House has taken in folk from the ridge and doubled its guests. The clock that divides the water says half a day each, but our half day brings nothing but cold water!
!choice
* {下|しも}の{湯|ゆ} も 、 {尾根|おね} の {人|ひと} を {入|い}れて います か 。 || Has the Lower House taken in people from the ridge too? -> ridge
* {湯|ゆ} を {分|わ}ける {時計|とけい} ？ || The clock that divides the water? -> clock
:ridge
yn_tahei: …… {入|い}れて ない と は {言|い}って ねえ 。 {土間|どま} に {寝|ね}てる の が 、 {六人|ろくにん} いる 。 {金|かね} は {取|と}って ねえ 。 {言|い}う な よ 。 || …I didn't say we hadn't. There are six of them sleeping on the floor here. Not charging them. Don't spread it around.
!set yn_tahei_ridge
!goto end
:clock
yn_tahei: {湯元|ゆもと} の {湯分|ゆわ}け に 、 {古|ふる}い {水時計|みずどけい} が ある 。 {湯守|ゆもり} が それ を {見|み}て 、 {半日|はんにち} ごと に {湯|ゆ} を {切|き}り{替|か}える 。 …… {最近|さいきん} 、 {時計|とけい} が {狂|くる}ってる ん じゃ ねえ か と {思|おも}う が な 。 || At the divider over the source there's an old water clock. The bath-keepers watch it and switch the water every half day. …Lately I wonder if the clock's gone wrong.
!set yn_clock_heard
:end
?(comp=nao) comp: {両方|りょうほう} 、 「{聞|き}いた {話|はなし} 」 で {喧嘩|けんか} して いる な 。 {見|み}た やつ が いない 。 || Both of them are fighting over things they've heard. Nobody's actually looked.
?(comp=mio) comp[worry]: {冷|つめ}たい {湯|ゆ} しか {来|こ}ない なら 、 {下|しも}の{湯|ゆ} の お{客|きゃく} は {風邪|かぜ} を {引|ひ}きます 。 …… {本当|ほんとう} に {困|こま}って いる の は 、 {泊|と}まって いる {人|ひと} たち です 。 || If only cold water comes, the Lower House's guests will catch cold. …The ones really suffering are the guests.
?(comp=ren) comp[think]: {水時計|みずどけい} 。 {古|ふる}い {決|き}まり の {一番|いちばん} {古|ふる}い {部分|ぶぶん} です ね 。 {見|み}て みたい 。 || A water clock. The oldest part of the old agreement. I'd like to see it.
?(comp=suzu) comp[smile]: {土間|どま} に {六人|ろくにん} 、 {無料|むりょう} で 。 …… {口|くち} は {悪|わる}い けど 、 いい {座長|ざちょう} ね 、 この {人|ひと} 。 || Six on the floor, free of charge. …Rough tongue, but he'd make a good troupe master.
!journal {下|しも}の{湯|ゆ} の タヘエ は 、 {上|かみ}の{湯|ゆ} の {客|きゃく} が {倍|ばい} に なり 、 {自分|じぶん} たち の {湯|ゆ} は {冷|つめ}たい と {言|い}う 。 {両方|りょうほう} の {話|はなし} を {聞|き}いた 。 || Tahei of the Lower House says the Upper House has doubled its guests and his own water comes in cold. You've heard both sides.

@scene yn.tahei_idle
!faceplayer
yn_tahei: {上|かみ}の{湯|ゆ} の {女将|おかみ} と 、 {一度|いちど} {湯|ゆ} の {中|なか} で {話|はな}せれば な 。 {湯|ゆ} の {中|なか} じゃ 、 {誰|だれ} も {大声|おおごえ} は {出|だ}せねえ 。 || If only the proprietress and I could talk it over in the bath once. Nobody can shout in the bath.
?(!yn_rules_shimo) yn_tahei: {風呂|ふろ} は {奥|おく} だ 。 {決|き}まり は {板|いた} に {書|か}いて ある 。 {少|すく}ねえ ぞ 。 || The bath's out the back. The rules are on the board. There aren't many.

@scene yn.tahei_after
!faceplayer
yn_tahei: {月|つき} に {一度|いちど} 、 {寄合所|よりあいじょ} で {女将|おかみ} と {喧嘩|けんか} する こと に なった 。 {紙|かみ} に {書|か}いて ある 。 {書|か}いて ある {喧嘩|けんか} は 、 {悪|わる}く ねえ 。 || Once a month I'm to have it out with the proprietress at the guild hall. It's written on paper. A quarrel that's written down isn't so bad.

@scene yn.kane
!faceplayer
yn_kane: いらっしゃい 。 {下|しも}の{湯|ゆ} の カネ です 。 {主人|しゅじん} の {声|こえ} が {大|おお}きくて 、 ごめんなさい ね 。 || Welcome. I'm Kane, of the Lower House. Sorry my husband's so loud.

@scene yn.complaint_start
# Kane: a guest is unhappy and won't say why. The complaint encounter (yn.complaint): what Zenroku says, what he means.
!faceplayer
yn_kane: {奥|おく} の ゼンロク さん 、 {何|なに} か {気|き}に {入|い}らない みたい なの 。 でも 、 {何|なに} が {嫌|いや} な の か 、 {言|い}って くれない の よ 。 || Mr Zenroku in the back seems unhappy about something. But he won't tell me what.
yn_kane: {話|はなし} を {聞|き}いて みて くれる ？ {私|わたし} が {聞|き}く と 、 「いえいえ 、 {結構|けっこう} です 」 しか {言|い}わない の 。 || Would you try talking to him? When I ask, all he says is "No, no, it's quite all right."
!encounter yn.complaint
!if var._enc=walked -> walked
!if var._res=0 -> later
!set yn_complaint_done
?(var._enc=moved) yn_kane: {上|かみ}の{湯|ゆ} の {梅|うめ} の {間|ま} へ ？ {女将|おかみ} が {承知|しょうち} したの ？ …… {上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ} で 、 {客|きゃく} を {譲|ゆず}り{合|あ}う なんて 、 {何年|なんねん} ぶり かしら 。 || To the Upper House's Plum room? The proprietress agreed? …The Upper and Lower Houses passing guests between them. How many years has it been?
?(var._enc=stayed) yn_kane: {部屋|へや} を {替|か}えず に 、 {泊|と}まって くれる って 。 {尾根|おね} の {人|ひと} たち の こと 、 {私|わたし} も {気|き}を {付|つ}ける わ 。 || He'll stay, without changing rooms. I'll keep an eye on the ridge folk too.
yn_kane: ありがとう 。 {言|い}わない こと を {聞|き}く の は 、 {難|むずか}しい わ ね 。 || Thank you. Hearing what someone doesn't say is hard, isn't it.
!end
:walked
!set yn_complaint_done
yn_kane: …… {行|い}っちゃった わ ね 。 {大丈夫|だいじょうぶ} 、 {後|あと} で {私|わたし} から {話|はな}して みる 。 {尾根|おね} の {人|ひと} たち は 、 {静|しず}か な {隅|すみ} に {移|うつ}って もらう わ 。 || …Off he went. Never mind, I'll have a word with him later. I'll move the ridge folk to a quieter corner.
!end
:later
yn_kane: {無理|むり} しないで 。 また {今度|こんど} で いい わ 。 || Don't push yourself. Another time is fine.

@scene yn.kane_idle
!faceplayer
yn_kane: ゼンロク さん 、 {今朝|けさ} は {笑|わら}って いた わ 。 || Mr Zenroku was smiling this morning.

@scene yn.kane_after
!faceplayer
yn_kane: {取|と}り{決|き}め の {写|うつ}し 、 {帳場|ちょうば} に {貼|は}った わ 。 {主人|しゅじん} は 、 {毎朝|まいあさ} {読|よ}んで は {文句|もんく} を {言|い}ってる けど 。 || I've put a copy of the agreement up at the desk. My husband reads it every morning and grumbles.

@scene yn.zenroku
!faceplayer
yn_zenroku: いえいえ 、 {何|なに} も 。 {結構|けっこう} な お{宿|やど} です よ 。 …… ええ 、 {結構|けっこう} です 。 || No, no, nothing at all. A fine inn. …Yes, quite fine.
?(yn_shimo_heard) narr: {口|くち} で は そう {言|い}い ながら 、 ゼンロク は {耳|みみ} を {押|お}さえて いる 。 || Saying so, Zenroku has a hand over his ear.

@scene yn.zenroku_idle
!faceplayer
yn_zenroku: いや 、 {話|はなし} を {聞|き}いて もらえて 、 {助|たす}かりました 。 {言|い}いにくい こと も 、 ある もの で 。 || Well, I'm glad someone heard me out. Some things are hard to say.

@scene yn.shimo_desk
narr: {下|しも}の{湯|ゆ} の {帳場|ちょうば} 。 {帳面|ちょうめん} の {字|じ} は {几帳面|きちょうめん} で 、 {土間|どま} の {六人|ろくにん} の {名前|なまえ} の {横|よこ} に は 、 {値段|ねだん} が {書|か}いて ない 。 || The Lower House's desk. The ledger is kept in a meticulous hand, and beside the names of the six on the floor, no price is written.

@scene yn.shimo_rules
# The Lower House's rules: few, and not the Upper House's (the house's own, labelled); the real customs the same.
narr: {板|いた} に {墨|すみ} で 、 {大|おお}きく {三行|さんぎょう} 。 || Three big lines of ink on a board.
narr: 「{体|からだ} を {流|なが}して から {入|はい}る こと 。 {手拭|てぬぐ}い は {湯|ゆ} に {入|い}れない こと 。 {露天風呂|ろてんぶろ} は 、 {一晩中|ひとばんじゅう} {入|はい}って よい 。」 || "Rinse before you get in. Towels stay out of the water. The open-air bath is open all night."
narr: （{上|かみ}の{湯|ゆ} に は {時間|じかん} の {決|き}まり が ある が 、 {下|しも}の{湯|ゆ} に は ない 。 {入|い}れ{替|か}え も ない 。 {宿|やど} に よって {違|ちが}う 。 ） || (The Upper House has hours; the Lower House has none, and no swapping of sides. Every inn is different.)
!if yn_rules_shimo -> end
!challenge yn.rules_shimo
!set yn_rules_shimo
:end
`);
