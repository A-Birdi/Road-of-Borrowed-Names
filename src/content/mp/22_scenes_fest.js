/* Manybridge, Chapter 4: the festival (expansion P09; plan 08_CULTURE.md C10, C10a). Tomi of the committee and the
 * preparations: the core three (lanterns, stalls, the boat procession: forged sentences whose result is the festival's
 * plan, F-42) and the optional three (Matsu's invitation, the food order, the fireworks safety notice). The eve: the
 * committee's yukata (festival dress only, C-46; src/engine/58f_festdress.js). The night: the festival as the party
 * planned it, the games, the noodle stalls, Matsu if she was asked; the fireworks with the companion (a bond event and
 * a kept memory; the S15 rung: anger on others' behalf); the next morning, the chapter's end: the broadsheet, the
 * river open up to Reedwake (F-40), the road north from Saltglass mended. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // Matsu remembers the festival she was asked to
  const lh = C.maps['mb.lockhouse'];
  const matsu = lh && lh.npcs.find((n) => n.id === 'mb_matsu');
  if (matsu) matsu.talk.unshift({ if: 'mb2_done&mp_inv_matsu', scene: 'mp.fest_matsu' });
  // Reedwake: once the river is open (F-40), Kōji's boat goes down to Manybridge (twelve-chapter journeys)
  const tea = C.maps['rw.tea'];
  const koji = tea && tea.npcs.find((n) => n.id === 'koji');
  if (koji) koji.talk.unshift({ if: 'ed>=2&mb2_done', scene: 'mp.river_koji' });
  C.roads.push(['reedwake', 'manybridge', { sea: true, river: true, edition: 2, if: 'mb2_done', ferry: ['mp.river_koji', 'mp.river_up'] }]);
})(RB.content);

RB.script.add(`
@scene mp.tomi_first
!faceplayer
mp_tomi: {祭|まつ}り の {世話役|せわやく} の トミ です 。 {川開|かわびら}き まで 、 あと {少|すこ}し な のに …… {提灯|ちょうちん} の {札|ふだ} も {屋台|やたい} の {名前|なまえ} も 、 {全部|ぜんぶ} {白|しろ}く なって しまって 。 || I'm Tomi, of the festival committee. The Opening of the River is nearly here, and… the lanterns' slips, the stalls' names, all gone white.
mp_tomi: ごめんなさい ね 。 {今|いま} は {手|て} が {離|はな}せない の 。 || I'm sorry. I can't stop just now.

@scene mp.tomi_tasks
!faceplayer
!if quest.mp_main<4 -> busy
!if mp_prep_met -> menu
mp_tomi: マンベエ さん から {聞|き}きました 。 {手伝|てつだ}って くださる の ね ！ || Manbē told me. You're going to help!
mp_tomi: {川開|かわびら}き は 、 {八百橋|やおばし} の {夏|なつ} の {始|はじ}まり の お{祭|まつ}り です 。 {川|かわ} に {舟|ふね} を {出|だ}して 、 {夜|よる} に は {花火|はなび} を {上|あ}げます 。 || The Opening of the River is the festival that starts Manybridge's summer. Boats go out on the river, and at night there are fireworks.
!note mp_kawabiraki
mp_tomi: でも 、 {計画|けいかく} の {紙|かみ} が {白|しろ}く なって 、 {何|なに} を どこ に {置|お}く か 、 {誰|だれ} も {覚|おぼ}えて いない の 。 || But the plans went white, and nobody remembers what goes where.
mp_tomi: {大事|だいじ} な の は {三|みっ}つ 。 {提灯|ちょうちん} と 、 {屋台|やたい} と 、 {舟|ふね} の {行列|ぎょうれつ} 。 どう する か は 、 あなた が {決|き}めて ください 。 その とおり に {作|つく}ります 。 || Three things matter: the lanterns, the stalls and the boat procession. You decide how. We'll build it exactly as you say.
?(comp=nao) comp: {決|き}めた とおり に なる の か 。 {責任|せきにん} {重大|じゅうだい} だ な 。 || It turns out exactly as we decide? That's a lot of responsibility.
?(comp=mio) comp[smile]: わたし たち が {決|き}めた お{祭|まつ}り を 、 {夜|よる} に {見|み}られる んです ね 。 {楽|たの}しみ ！ || And that night we'll see the festival we decided on. I can't wait!
?(comp=ren) comp: {提灯|ちょうちん} の {場所|ばしょ} なら 、 {少|すこ}し は {分|わ}かります 。 {灯守|ひもり} です から 。 || Where lanterns go, I know a little about. I'm a lamp-keeper.
?(comp=suzu) comp[smile]: {舞台|ぶたい} の {演出|えんしゅつ} と {同|おな}じ ね 。 {町|まち} {全体|ぜんたい} が {舞台|ぶたい} よ 。 || It's like directing a show. The whole city's the stage.
!set mp_prep_met
:menu
!if mp_prep_lanterns&mp_prep_stalls&mp_prep_procession&quest.mp_main=4 -> ready
?(quest.mp_main>=5) mp_tomi: {準備|じゅんび} は {大丈夫|だいじょうぶ} 。 あと は {当日|とうじつ} を {待|ま}つ だけ よ 。 || The preparations are fine. Now we just wait for the day.
!choice
* [!mp_prep_lanterns] {提灯|ちょうちん} の {場所|ばしょ} を {決|き}める 。 || Decide where the lanterns go. -> lan
* [!mp_prep_stalls] {屋台|やたい} の {場所|ばしょ} を {決|き}める 。 || Decide where the stalls go. -> st
* [!mp_prep_procession] {舟|ふね} の {順番|じゅんばん} を {決|き}める 。 || Decide the boats' order. -> proc
* [mp_prep_lanterns&mp_prep_stalls&mp_prep_procession&!quest.mp_fest_extra=done] ほか に {手伝|てつだ}える こと は ？ || Is there anything else I can help with? -> extra
* また {後|あと} で 。 || Later. -> end
:lan
!call mp.prep_lanterns
!goto menu
:st
!call mp.prep_stalls
!goto menu
:proc
!call mp.prep_procession
!goto menu
:extra
!call mp.tomi_extra
!goto menu
:ready
!call mp.tomi_ready
!end
:busy
!call mp.tomi_first
:end

@scene mp.prep_lanterns
mp_tomi: {提灯|ちょうちん} {屋|や} さん たち が {待|ま}って います 。 どこ に {吊|つ}るす か 、 {言|い}って あげて ください 。 || The lantern men are waiting. Tell them where to hang them.
!challenge mp.fest_lanterns
!if var._res=0 -> later
?(var._forge=bank) !set mp_lan_bank
?(var._forge=theatre) !set mp_lan_theatre
?(var._forge=bridge) !set mp_lan_bridge
?(var._forge=bank) mp_tomi: {岸|きし} に {沿|そ}って 、 ずっと {光|ひかり} が {続|つづ}く の ね 。 {舟|ふね} から も よく {見|み}える わ 。 || A line of light all along the bank. They'll see it well from the boats.
?(var._forge=theatre) mp_tomi: {芝居小屋|しばいごや} の {前|まえ} ！ {芝居|しばい} の {帰|かえ}り の お{客|きゃく} が {喜|よろこ}ぶ わ 。 || In front of the playhouse! The audience coming out will love it.
?(var._forge=bridge) mp_tomi: {幕橋|まくばし} の {上|うえ} ね 。 {花火|はなび} と {一緒|いっしょ} に {川|かわ} に {映|うつ}る わ 。 || Over the Curtain Bridge. They'll be reflected in the river with the fireworks.
!if mp_lan_bank|mp_lan_theatre|mp_lan_bridge -> done
?(var._forge=river) mp_tomi: …… {川|かわ} の {中|なか} じゃ 、 {消|き}えちゃう わ よ 。 {岸|きし} に {沿|そ}って {吊|つ}るして おきます ね 。 || …In the river they'd go out. I'll have them hung along the bank.
?(!var._forge=river) mp_tomi: {明|あか}るい うち に {灯|とも}したら 、 {夜|よる} まで {持|も}たない わ 。 {暗|くら}く なって から 、 {岸|きし} の {提灯|ちょうちん} を {灯|とも}します ね 。 || Lit in daylight, they'd burn out before night. We'll light the ones along the bank once it's dark.
!set mp_lan_bank
:done
!set mp_prep_lanterns
:later

@scene mp.prep_stalls
mp_tomi: {屋台|やたい} は 、 {毎年|まいとし} {二十|にじゅう} ほど {出|で}ます 。 どこ に {並|なら}べましょう ？ || About twenty stalls come every year. Where shall we set them out?
!challenge mp.fest_stalls
!if var._res=0 -> later
?(var._forge=bank) !set mp_st_bank
?(var._forge=square) !set mp_st_square
?(var._forge=bank) mp_tomi: {岸|きし} に {並|なら}べる の ね 。 {歩|ある}きながら 、 {花火|はなび} も {屋台|やたい} も {楽|たの}しめる わ 。 || Along the bank. People can walk and enjoy the stalls and the fireworks at once.
?(var._forge=square) mp_tomi: {井戸|いど} の {周|まわ}り に {集|あつ}める の ね 。 {座|すわ}って {食|た}べられる わ 。 || Gathered round the well. People can sit and eat.
!if mp_st_bank|mp_st_square -> done
mp_tomi: {橋|はし} の {上|うえ} は 、 {人|ひと} が {通|とお}れなく なる わ 。 {岸|きし} に {並|なら}べて おきます ね 。 || On the bridge nobody could get across. I'll have them set out along the bank.
!set mp_st_bank
:done
!set mp_prep_stalls
:later

@scene mp.prep_procession
mp_tomi: {花火|はなび} の {前|まえ} に 、 {舟|ふね} が {二艘|にそう} {川|かわ} を {下|くだ}ります 。 {太鼓|たいこ} の {舟|ふね} と 、 {提灯|ちょうちん} の {舟|ふね} 。 どちら が {先|さき} ？ || Before the fireworks, two boats go down the river: the drum boat and the lantern boat. Which goes first?
!challenge mp.fest_procession
!if var._res=0 -> later
?(var._forge=drums) !set mp_proc_drums
?(var._forge=lanterns) !set mp_proc_lanterns
?(var._forge=drums) mp_tomi: {太鼓|たいこ} が {先|さき} 。 {音|おと} で みんな を {呼|よ}んで から 、 {光|ひかり} が {来|く}る の ね 。 || The drums first. The sound calls everyone, then the light comes.
?(var._forge=lanterns) mp_tomi: {提灯|ちょうちん} が {先|さき} 。 {静|しず}か に {光|ひかり} が {来|き}て 、 {後|あと} から {太鼓|たいこ} が {鳴|な}る の ね 。 || The lanterns first. The light comes quietly, and the drums sound after.
!if mp_proc_drums|mp_proc_lanterns -> done
mp_tomi: {花火|はなび} の {後|あと} じゃ 、 {誰|だれ} も {見|み}て いない わ 。 {太鼓|たいこ} を {先|さき} に して おきます ね 。 || After the fireworks nobody would be watching. I'll send the drums first.
!set mp_proc_drums
:done
!set mp_prep_procession
:later

@scene mp.tomi_ready
mp_tomi: {提灯|ちょうちん} も 、 {屋台|やたい} も 、 {舟|ふね} も 、 {決|き}まった ！ {紙|かみ} に {書|か}いて 、 {壁|かべ} に {貼|は}って おきます 。 {今度|こんど} は {消|き}えない よう に 、 {毎日|まいにち} {読|よ}み{上|あ}げる わ 。 || Lanterns, stalls, boats: all decided! I'll write it out and pin it on the wall. And so it doesn't fade this time, I'll read it aloud every day.
mp_tomi: そう そう 、 マンベエ さん が {呼|よ}んで いました よ 。 {今夜|こんや} 、 {芝居小屋|しばいごや} で {舞台稽古|ぶたいげいこ} だ そう です 。 || Oh, and Manbē was asking for you. The dress rehearsal is tonight, at the playhouse.
!quest mp_main 5
!journal {祭|まつ}り の {準備|じゅんび} が {決|き}まった 。 {今夜|こんや} は {芝居小屋|しばいごや} で {舞台稽古|ぶたいげいこ} 。 || The festival's plans are made. Tonight, the dress rehearsal at the playhouse.

@scene mp.tomi_extra
!if mp_extra_asked -> list
mp_tomi: {本当|ほんとう} ？ {助|たす}かる わ 。 {残|のこ}り は {三|みっ}つ 。 {水門|すいもん} の マツ さん へ の {招待状|しょうたいじょう} 、 {食|た}べ{物|もの} の {注文|ちゅうもん} 、 それ と {花火|はなび} の {注意書|ちゅういが}き 。 || Really? That's a help. Three things left: an invitation for Matsu at the lock, the food order, and the fireworks safety notice.
!set mp_extra_asked
!quest mp_fest_extra start
:list
!choice
* [!mp_inv_matsu] マツ さん へ の {招待状|しょうたいじょう} 。 || The invitation for Matsu. -> inv
* [!mp_food] {食|た}べ{物|もの} の {注文|ちゅうもん} 。 || The food order. -> food
* [!mp_safety] {花火|はなび} の {注意書|ちゅういが}き 。 || The fireworks safety notice. -> notice
* また {後|あと} で 。 || Later. -> end
:inv
mp_tomi: マツ さん は 、 {四十年|よんじゅうねん} も {水門|すいもん} を {守|まも}って きた {人|ひと} 。 {一度|いちど} も お{祭|まつ}り に {来|き}た こと が ない の 。 {丁寧|ていねい} に 、 でも {温|あたた}かく {書|か}いて ね 。 || Matsu has kept the lock for forty years, and she's never once come to the festival. Write it politely, but warmly.
!challenge mp.fest_invite
?(var._res=1) !set mp_inv_matsu
?(var._res=1) mp_tomi: これ なら 、 きっと {来|き}て くれる わ 。 || With this, I'm sure she'll come.
!goto check
:food
mp_tomi: {焼|や}き{鳥|とり} と おにぎり を 、 {手伝|てつだ}って くれた {人|ひと} {全員|ぜんいん} の {分|ぶん} 。 {数|かぞ}え{方|かた} に {気|き} を つけて ね 。 || Yakitori and rice balls, enough for everyone who helped. Mind how you count them.
!challenge mp.fest_food
?(var._res=1) !set mp_food
?(var._res=1) mp_tomi: {完璧|かんぺき} ！ {当日|とうじつ} 、 {屋台|やたい} の {裏|うら} で {配|くば}る わ 。 || Perfect! I'll hand them out behind the stalls on the day.
!goto check
:notice
mp_tomi: {去年|きょねん} 、 {子供|こども} が {岸|きし} から {落|お}ち そう に なった の 。 {分|わ}かりやすい {注意書|ちゅういが}き が {欲|ほ}しい わ 。 || Last year a child nearly fell off the bank. I want a notice people can understand.
!challenge mp.fest_notice
?(var._res=1) !set mp_safety
?(var._res=1) mp_tomi: ありがとう 。 {縄|なわ} を {張|は}って 、 この {注意書|ちゅういが}き を {掛|か}けて おく わ 。 || Thank you. We'll put up a rope and hang this notice on it.
:check
!if mp_inv_matsu&mp_food&mp_safety -> all
!goto list
:all
mp_tomi: {全部|ぜんぶ} {終|お}わった ！ {今年|ことし} の {川開|かわびら}き は 、 {一番|いちばん} いい お{祭|まつ}り に なる わ よ 。 || All done! This year's Opening is going to be the best festival yet.
!quest mp_fest_extra done
:end

@scene mp.fest_plans
# The committee's table: the plan as decided so far, pinned and read aloud each morning.
narr: {祭|まつ}り の {計画|けいかく} の {紙|かみ} 。 トミ の {字|じ} で 、 {大|おお}きく {書|か}いて ある 。 || The festival's plan, in Tomi's big handwriting.
?(!mp_prep_lanterns&!mp_prep_stalls&!mp_prep_procession) narr: …… まだ {何|なに} も {書|か}いて いない 。 {白|しろ}い {紙|かみ} だけ だ 。 || …Nothing written yet. Only white paper.
?(mp_lan_bank) narr: {提灯|ちょうちん} ： {岸|きし} に {沿|そ}って 。 || Lanterns: along the bank.
?(mp_lan_theatre) narr: {提灯|ちょうちん} ： {芝居小屋|しばいごや} の {前|まえ} 。 || Lanterns: in front of the playhouse.
?(mp_lan_bridge) narr: {提灯|ちょうちん} ： {幕橋|まくばし} の {上|うえ} 。 || Lanterns: over the Curtain Bridge.
?(mp_st_bank) narr: {屋台|やたい} ： {岸|きし} に {並|なら}べる 。 || Stalls: in a line along the bank.
?(mp_st_square) narr: {屋台|やたい} ： {井戸|いど} の {周|まわ}り の {広場|ひろば} 。 || Stalls: in the square round the well.
?(mp_proc_drums) narr: {舟|ふね} ： {太鼓|たいこ} が {先|さき} 、 {提灯|ちょうちん} が {後|あと} 。 || Boats: the drums first, then the lanterns.
?(mp_proc_lanterns) narr: {舟|ふね} ： {提灯|ちょうちん} が {先|さき} 、 {太鼓|たいこ} が {後|あと} 。 || Boats: the lanterns first, then the drums.
?(mp_inv_matsu) narr: マツ さん ： {招待状|しょうたいじょう} を {出|だ}した 。 || Matsu: invitation sent.
?(mp_food) narr: {焼|や}き{鳥|とり} {二十本|にじゅっぽん} 、 おにぎり {三十個|さんじゅっこ} 。 || Twenty skewers of yakitori, thirty rice balls.
?(mp_safety) narr: {注意書|ちゅういが}き ： {縄|なわ} に {掛|か}ける 。 || Safety notice: hung on the rope.

@scene mp.fest_eve
# Staged: the next evening, the committee room; Tomi hands out yukata from a pile; then out into the street at dusk.
!fade out
narr: {次|つぎ} の {日|ひ} の {夕方|ゆうがた} 。 {川開|かわびら}き の {日|ひ} 。 || The next evening. The day of the Opening of the River.
!warp mp.committee 5 5 up
!fade in
mp_tomi: {来|き}た {来|き}た ！ {手伝|てつだ}って くれた {人|ひと} に は 、 {世話役|せわやく} から {浴衣|ゆかた} を {貸|か}す の が {決|き}まり なの 。 さあ 、 {着替|きが}えて ！ || There you are! Everyone who helped gets a yukata lent by the committee: that's the rule. Go on, change!
!note mp_yukata
!set mp_yukata mp_fest_night
!fade out
!fade in
?(comp=nao) comp: …… {袖|そで} が {広|ひろ}い 。 {走|はし}れない ぞ 、 これ 。 {今夜|こんや} は {走|はし}らなくて いい か 。 || …The sleeves are wide. I can't run in this. Well, tonight I don't need to.
?(comp=mio) comp[smile]: {浴衣|ゆかた} なんて 、 {子供|こども} の {時|とき} {以来|いらい} です 。 …… {似合|にあ}って ます か ？ || I haven't worn a yukata since I was a child. …Does it suit me?
?(comp=ren) comp: {帯|おび} の {結|むす}び{方|かた} が {分|わ}からなくて 、 トミ さん に {結|むす}んで もらいました 。 {迷子|まいご} に なる より は 、 {簡単|かんたん} な はず でした が 。 || I couldn't work out the sash, so Tomi tied it for me. It ought to be simpler than getting lost.
?(comp=suzu) comp[smile]: {浴衣|ゆかた} は {衣装|いしょう} と {違|ちが}って 、 {役|やく} が ない の 。 {今夜|こんや} は 、 ただ の わたし 。 || A yukata isn't a costume: it comes with no part. Tonight I'm just me.
mp_tomi: {岸|きし} へ {行|い}って ごらん なさい 。 あなた たち が {決|き}めた お{祭|まつ}り が 、 {待|ま}って いる わ よ 。 || Go down to the bank. The festival you decided on is waiting.
!quest mp_main 6
!warp mp.playhouse 39 7 down
!journal {川開|かわびら}き の {夜|よる} 。 {浴衣|ゆかた} を {着|き}て 、 {岸|きし} へ 。 || The night of the Opening. In yukata, down to the bank.

@scene mp.fest_night
# Staged: the first step onto the bank: the festival laid out as the party planned it; the boats go by in order.
!set mp_fest_walked pt_festival
!music festival
narr: {岸|きし} は 、 {人|ひと} で いっぱい だ 。 || The bank is packed with people.
?(mp_lan_bank) narr: {岸|きし} に {沿|そ}って 、 {提灯|ちょうちん} が どこ まで も {続|つづ}いて いる 。 {水|みず} の {上|うえ} に も 、 もう {一本|いっぽん} の {光|ひかり} の {道|みち} 。 || Lanterns run along the bank as far as you can see, and a second road of light lies on the water.
?(mp_lan_theatre) narr: {芝居小屋|しばいごや} の {前|まえ} に {提灯|ちょうちん} が {並|なら}び 、 のぼり が {赤|あか}く {照|て}らされて いる 。 || Lanterns line the front of the playhouse; the banners glow red in their light.
?(mp_lan_bridge) narr: {幕橋|まくばし} の {上|うえ} に {提灯|ちょうちん} が {揺|ゆ}れて 、 {川|かわ} に {映|うつ}って いる 。 || Lanterns sway over the Curtain Bridge, mirrored in the river.
?(mp_st_bank) narr: {屋台|やたい} が {岸|きし} に {並|なら}び 、 {人|ひと} が {食|た}べながら {歩|ある}いて いる 。 || The stalls stand along the bank, and people walk along eating.
?(mp_st_square) narr: {井戸|いど} の {広場|ひろば} に {屋台|やたい} が {集|あつ}まり 、 {家族|かぞく} が {座|すわ}って {食|た}べて いる 。 || The stalls are gathered in the well square, where families sit and eat.
?(mp_proc_drums) narr: まず 、 {太鼓|たいこ} の {舟|ふね} 。 どん 、 どん 、 と {音|おと} が {川|かわ} を {下|くだ}って いく 。 {後|あと} から 、 {提灯|ちょうちん} の {舟|ふね} が {静|しず}か に {続|つづ}く 。 || First the drum boat: dong, dong, the sound goes down the river. After it, quietly, the lantern boat.
?(mp_proc_lanterns) narr: まず 、 {提灯|ちょうちん} の {舟|ふね} が {静|しず}か に {来|く}る 。 {光|ひかり} が {通|とお}り{過|す}ぎる と 、 {後|あと} から {太鼓|たいこ} が どん 、 と {鳴|な}った 。 || First the lantern boat comes, quietly. As its light passes, the drums sound behind it: dong.
?(mp_safety) narr: {岸|きし} の {端|はし} に は {縄|なわ} が {張|は}られ 、 {注意書|ちゅういが}き が {下|さ}がって いる 。 {子供|こども} たち は 、 {大人|おとな} の {手|て} を {握|にぎ}って いる 。 || A rope runs along the edge of the bank with the notice hanging from it. The children hold the grown-ups' hands.
?(mp_food) narr: {屋台|やたい} の {裏|うら} で は 、 {手伝|てつだ}った {人|ひと} たち に {焼|や}き{鳥|とり} と おにぎり が {配|くば}られて いる 。 || Behind the stalls, the helpers are being handed yakitori and rice balls.
?(mp_inv_matsu) narr: {人込|ひとご}み の {中|なか} に 、 {水門|すいもん} の マツ が いる 。 {少|すこ}し {戸惑|とまど}った {顔|かお} で 、 でも {笑|わら}って いる 。 || In the crowd is Matsu from the lock, looking a little bewildered, but smiling.
?(comp=nao) comp: …… {本当|ほんとう} に 、 {決|き}めた とおり だ 。 {悪|わる}く ない な 。 || …It's exactly as we decided. Not bad.
?(comp=mio) comp[smile]: わたし たち の お{祭|まつ}り だ ！ {屋台|やたい} 、 {全部|ぜんぶ} {回|まわ}りましょう ！ || It's our festival! Let's go round every stall!
?(comp=ren) comp[smile]: {提灯|ちょうちん} が 、 ちゃんと {灯|とも}って います 。 {一|ひと}つ も {消|き}えて いない 。 || The lanterns are all lit. Not one has gone out.
?(comp=suzu) comp[smile]: {幕|まく} が {上|あ}がった わ ね 。 {今夜|こんや} は 、 わたし たち も お{客|きゃく} よ 。 || The curtain's up. Tonight we're the audience too.
narr: {屋台|やたい} の {遊|あそ}び も ある 。 {花火|はなび} は 、 {幕橋|まくばし} の たもと で トミ に {声|こえ} を かければ {始|はじ}まる 。 || There are stall games too. The fireworks begin when you find Tomi at the foot of the Curtain Bridge.
!refresh
!journal {祭|まつ}り が {始|はじ}まった 。 {花火|はなび} の {前|まえ} に 、 {屋台|やたい} を {回|まわ}って も いい 。 || The festival has begun. Before the fireworks, there is time to go round the stalls.

@scene mp.fest_tomi_night
!faceplayer
mp_tomi: {来|き}て くれて ありがとう ！ {花火|はなび} は 、 いつ でも {上|あ}げられる わ 。 {準備|じゅんび} は いい ？ || Thank you for coming! The fireworks can go up any time. Are you ready?
!choice
* {花火|はなび} を {上|あ}げて ください 。 || Please start the fireworks. -> go
* もう {少|すこ}し {屋台|やたい} を {回|まわ}ります 。 || We'll look round the stalls a little longer. -> end
:go
mp_tomi: {任|まか}せて ！ {一番|いちばん} いい {場所|ばしょ} は 、 {橋|はし} の たもと よ 。 || Leave it to me! The best spot is the foot of the bridge.
!call mp.fireworks
:end

@scene mp.fireworks
# Staged: the party at the foot of the Curtain Bridge facing the canal; the sky darkens; the first bloom; soft
# blooms over the canal (reduced motion: a held glow); the companion beside you; the city cheering. A bond event and
# a kept memory (src/content/mp/40_company.js).
!walkto pc 24 24 down
!set mp_fireworks
!music fireworks
narr: ひゅう 、 と {細|ほそ}い {音|おと} が {上|あ}がって 、 {夜空|よぞら} に {最初|さいしょ} の {花|はな} が {開|ひら}いた 。 || A thin whistle climbs, and the first flower opens in the night sky.
narr: {八百|はっぴゃく} の {橋|はし} の {上|うえ} から 、 {一斉|いっせい} に {声|こえ} が {上|あ}がる 。 「たまや ！」 || From all eight hundred bridges at once, a cry goes up: "Tamaya!"
!note mp_tamaya
!look comp pc
!if comp=nao -> nao
!if comp=mio -> mio
!if comp=ren -> ren
!if comp=suzu -> suzu
!goto close
:nao
comp: …… {花火|はなび} って の は 、 {名前|なまえ} が ない な 。 {上|あ}がって 、 {消|き}えて 、 それ で {終|お}わり だ 。 || …Fireworks don't have names, do they. Up, gone, and that's that.
comp: でも 、 {誰|だれ} も {怒|おこ}らない 。 {消|き}える の を {分|わ}かって いて 、 {見|み}に {来|く}る ん だ から 。 || But nobody gets angry. They come knowing it'll fade.
comp[think]: {奈落|ならく} で 、 {俺|おれ} は {怒|おこ}って いた 。 {自分|じぶん} の {荷物|にもつ} でも ない のに 。 {役者|やくしゃ} の {役|やく} なんて 、 {俺|おれ} に は {関係|かんけい} ない のに 。 || Down in the Understage I was angry. It wasn't my parcel. An actor's part has nothing to do with me.
!choice
* {関係|かんけい} ある よ 。 {一緒|いっしょ} に {怒|おこ}って くれて 、 うれしかった 。 || It does. I was glad you were angry with me. -> nao_a
* {誰|だれ} か の ため に {怒|おこ}る の は 、 いい こと だ よ 。 || Being angry for someone else is a good thing. -> nao_b
:nao_a
comp[smile]: …… そう か 。 じゃあ 、 {配達|はいたつ} {先|さき} が {一|ひと}つ {増|ふ}えた って こと に して おく 。 || …Is that so. Then I'll call it one more address on my round.
!goto close
:nao_b
comp[smile]: {人|ひと} の ため に {怒|おこ}れる {奴|やつ} と {歩|ある}く の は 、 {悪|わる}く ない 。 …… お{互|たが}い に な 。 || Walking with someone who gets angry for other people. Not bad. …Goes both ways.
!goto close
:mio
comp[smile]: きれい …… 。 {花火|はなび} の {色|いろ} は 、 {薬|くすり} の {材料|ざいりょう} と {同|おな}じ {物|もの} から {作|つく}る ん です よ 。 {銅|どう} は {青|あお} 、 {塩|しお} は {黄色|きいろ} 。 || Beautiful… Firework colours come from the same things as medicines. Copper for blue, salt for yellow.
comp[think]: {奈落|ならく} で 、 わたし 、 {怒|おこ}って いました 。 {患者|かんじゃ} でも ない {人|ひと} の ため に 。 {薬屋|くすりや} は {怒|おこ}っちゃ いけない と 、 {思|おも}って いた のに 。 || In the Understage I was angry. For people who aren't even my patients. And I thought an apothecary must never get angry.
!choice
* {怒|おこ}る こと も 、 {薬|くすり} に なる かも しれない 。 || Maybe anger can be a medicine too. -> mio_a
* {怒|おこ}って くれて 、 {役者|やくしゃ} さん たち は {助|たす}かった よ 。 || Your anger helped the actors. -> mio_b
:mio_a
comp[smile]: …… {量|りょう} を {間違|まちが}え なければ 、 です ね 。 {覚|おぼ}えて おきます 。 || …As long as the dose is right. I'll remember that.
!goto close
:mio_b
comp[smile]: はい 。 …… {次|つぎ} も 、 {一緒|いっしょ} に {怒|おこ}って ください ね 。 || Yes. …Next time too, be angry alongside me.
!goto close
:ren
comp: {花火|はなび} は 、 {灯|あか}り の {一番|いちばん} {短|みじか}い {形|かたち} です ね 。 {灯守|ひもり} と して は 、 {少|すこ}し {悔|くや}しい くらい {明|あか}るい 。 || Fireworks are the shortest-lived kind of light. As a lamp-keeper, I'm almost jealous of how bright they are.
comp[think]: {奈落|ならく} で 、 わたし は {怒|おこ}って いました 。 {灯守|ひもり} は {静|しず}か で いる べき だ と 、 {師匠|ししょう} に {教|おそ}わった のに 。 || In the Understage I was angry. My teacher taught me a lamp-keeper should stay calm.
!choice
* {静|しず}か な {怒|いか}り も ある よ 。 || There's such a thing as quiet anger. -> ren_a
* {人|ひと} の ため に {怒|おこ}る の は 、 {灯|あか}り を {守|まも}る の と {同|おな}じ だ よ 。 || Being angry for others is like guarding a light. -> ren_b
:ren_a
comp[smile]: …… {静|しず}か な {怒|いか}り 。 いい {言葉|ことば} です 。 {書|か}いて おきます 。 || …Quiet anger. A good phrase. I'll write it down.
!goto close
:ren_b
comp[smile]: {守|まも}る ため の {怒|いか}り 、 です か 。 …… それ なら 、 {師匠|ししょう} も {許|ゆる}して くれる でしょう 。 || Anger in order to guard. …Then my teacher would allow it.
!goto close
:suzu
comp[smile]: {川開|かわびら}き の {花火|はなび} 。 {昔|むかし} は 、 {舞台|ぶたい} の {袖|そで} から {見|み}て いた の 。 {客席|きゃくせき} から {見|み}る の は 、 {初|はじ}めて かも 。 || The Opening's fireworks. I used to watch them from the wings. This might be my first time watching from the audience.
comp[think]: {奈落|ならく} で 、 わたし 、 {本気|ほんき} で {怒|おこ}って いた わ 。 {知|し}らない {役者|やくしゃ} たち の ため に 。 || In the Understage I was truly angry. For actors I don't even know.
?(mp_ev_koume) comp[think]: …… {自分|じぶん} の {手紙|てがみ} は 、 まだ {読|よ}んで も いない のに 。 || …When I haven't even read my own letter yet.
!choice
* {怒|おこ}れる の は 、 {大事|だいじ} に して いる から だ よ 。 || You get angry because you care. -> suzu_a
* [mp_ev_koume] その {手紙|てがみ} は 、 {読|よ}める {時|とき} に {読|よ}めば いい 。 || Read that letter when you're ready. -> suzu_b
* [!mp_ev_koume] {一緒|いっしょ} に {怒|おこ}って くれて 、 ありがとう 。 || Thank you for being angry alongside me. -> suzu_c
:suzu_a
comp[smile]: …… {芝居|しばい} が {好|す}き だから 、 か 。 そう ね 。 まだ 、 {好|す}き みたい 。 || …Because I love the theatre, you mean. Yes. It seems I still do.
!goto close
:suzu_b
comp[smile]: …… うん 。 {幕|まく} が {下|お}りたら 、 {読|よ}む わ 。 {今夜|こんや} は まだ 、 {花火|はなび} の {番|ばん} 。 || …Mm. I'll read it after the curtain. Tonight is still the fireworks' turn.
!goto close
:suzu_c
comp[smile]: お{礼|れい} は {要|い}らない わ 。 {相方|あいかた} でしょう ？ || No thanks needed. We're partners, aren't we?
:close
narr: {大|おお}きな {花火|はなび} が {開|ひら}いて 、 {光|ひかり} が {川|かわ} へ {降|ふ}って いく 。 {名前|なまえ} の {戻|もど}った {町|まち} に 、 {声|こえ} が {響|ひび}く 。 || A great firework opens and its light rains down into the river. Voices ring out across a city with its names returned.
!hook co_bond fest:fireworks
!hook co_remember together fireworks
!call mp.chapter_end

@scene mp.chapter_end
# Staged: fade; the next morning on Playhouse Row: lanterns coming down, boats going upstream for the first time this
# year; Sanpei with the morning's broadsheet; Kakeru with the courier's news; Sōbē's blocks are cut again.
!fade out
!set mb2_done
!quest mp_main done
!warp mp.playhouse 24 23 down
!fade in
narr: {次|つぎ} の {朝|あさ} 。 {川|かわ} を 、 {舟|ふね} が {上|のぼ}って いく 。 {今年|ことし} {初|はじ}めて 、 {葦|あし}ノ{瀬|せ} の {方|ほう} へ 。 || The next morning. Boats are going up the river: for the first time this year, toward Reedwake.
narr: {川開|かわびら}き が {終|お}わって 、 {川|かわ} の {道|みち} が {開|ひら}いた 。 || The Opening is over, and the river road is open.
narr: サンペイ が {刷|す}り{物|もの} を {振|ふ}りながら {走|はし}って くる 。 「{瓦版|かわらばん} ！ {今朝|けさ} の {瓦版|かわらばん} だ よ ！」 || Sanpei comes running, waving a printed sheet. "Broadsheet! This morning's broadsheet!"
!note mp_kawaraban
narr: 「{川開|かわびら}き 、 {無事|ぶじ} {終|お}わる 。 {芝居小屋|しばいごや} の {台本|だいほん} 、 {名前|なまえ} {戻|もど}る 。 {旅|たび} の {者|もの} {二人|ふたり} 、 {奈落|ならく} より {帰|かえ}る 。」 || "The Opening ends safely. The playhouse's script has its names again. Two travellers return from the Understage."
?(press_printed) narr: {隅|すみ} に 、 {小|ちい}さく ： 「{刷|す}り{場|ば} の {話|はなし} 、 {町|まち} で {評判|ひょうばん} 。」 || In the corner, in small type: "The press room's story: the talk of the town."
narr: {飛脚|ひきゃく} の カケル が 、 {人込|ひとご}み を {抜|ぬ}けて {来|く}る 。 || Kakeru the courier pushes through the crowd.
mp_kakeru: {知|し}らせ だ 。 {潮硝子|しおがらす} から {北|きた} へ の {道|みち} が 、 {直|なお}った 。 {道標|みちしるべ} の {名前|なまえ} が 、 {戻|もど}った ん だ 。 {灰実|はいみ} の {里|さと} まで 、 {飛脚|ひきゃく} が また {走|はし}れる 。 || News. The road north from Saltglass is mended: the names on its waymarks are back. Couriers can run all the way to Cinder Orchard again.
?(comp=nao) comp: {北|きた} の {道|みち} か 。 {灰実|はいみ} …… {果樹園|かじゅえん} と {硝子|がらす} の {里|さと} だ な 。 {行|い}こう 。 || The north road. Cinder Orchard… the village of orchards and glass. Let's go.
?(comp=mio) comp: {北|きた} の {道|みち} …… 。 {次|つぎ} は 、 そこ です ね 。 {薬箱|くすりばこ} 、 {詰|つ}め{直|なお}して おきます 。 || The north road… That's where we go next. I'll repack my medicine chest.
?(comp=ren) comp: {北|きた} へ 。 {地図|ちず} は 、 あなた が {持|も}って いて ください 。 {念|ねん} の ため 。 || North. Please keep the map yourself. Just in case.
?(comp=suzu) comp[smile]: {次|つぎ} の {幕|まく} は 、 {北|きた} ね 。 {浴衣|ゆかた} は {返|かえ}した けど 、 {花火|はなび} の {音|おと} は まだ {耳|みみ} に {残|のこ}って いる わ 。 || The next act is in the north, then. I gave the yukata back, but I can still hear the fireworks.
!journal {川開|かわびら}き が {終|お}わり 、 {川|かわ} の {道|みち} が {開|ひら}いた 。 {潮硝子|しおがらす} から {北|きた} へ の {道|みち} も {直|なお}った 。 || The Opening is over and the river road is open. The road north from Saltglass is mended too.
!refresh

@scene mp.fest_matsu
!faceplayer
?(mb2_done) mb_matsu: {花火|はなび} 、 {見|み}た よ 。 {四十年|よんじゅうねん} {分|ぶん} 。 …… {来年|らいねん} も 、 {来|く}る つもり だ 。 || I saw the fireworks. Forty years' worth. …I mean to come next year too.
?(mb2_done) !end
mb_matsu: {招待状|しょうたいじょう} を {書|か}いた の は 、 あんた だろう 。 {丁寧|ていねい} すぎて 、 {断|ことわ}れなかった よ 。 || You wrote the invitation, didn't you. Too polite to refuse.
mb_matsu: {水門|すいもん} から {見|み}る {花火|はなび} は 、 {小|ちい}さかった 。 {近|ちか}く で {見|み}る と 、 {音|おと} が {胸|むね} に {来|く}る ね 。 || From the lock, the fireworks were small. Up close, you feel the bang in your chest.

@scene mp.fest_stall_masa
?(!mp_fest_night&!mb2_done) narr: まさ{屋|や} の {屋台|やたい} 。 {赤|あか}い のれん を {掛|か}けて 、 {準備|じゅんび} {中|ちゅう} だ 。 || Masaya's stall, its red curtain up, getting ready.
?(!mp_fest_night&!mb2_done) !end
?(mb2_done) narr: まさ{屋|や} の {屋台|やたい} 。 {祭|まつ}り が {終|お}わって も 、 ここ で {夏|なつ} の {間|あいだ} {店|みせ} を {出|だ}す らしい 。 || Masaya's stall. They're staying here for the summer, festival or no.
?(mb2_done) !end
narr: まさ{屋|や} の {屋台|やたい} 。 {赤|あか}い のれん の {向|む}こう で 、 {湯気|ゆげ} が {上|あ}がって いる 。 || Masaya's festival stall. Steam rises behind the red curtain.
?(quest.mb_noodle=done) narr: {隣|となり} の ます{屋|や} と 、 {今年|ことし} は {仲良|なかよ}く {張|は}り{合|あ}って いる 。 || This year, Masaya and Masuya are rivals the friendly way.
!if mp_fest_noodles -> ate
!challenge mp.fest_noodles
?(var._res=1) !set mp_fest_noodles
?(var._res=1) narr: {熱|あつ}い そば が {二杯|にはい} 。 {二人|ふたり} で 、 {岸|きし} に {座|すわ}って {食|た}べた 。 || Two bowls of hot soba. You eat them sitting on the bank together.
?(var._res=1) !heal
!end
:ate
narr: もう お{腹|なか} いっぱい だ 。 || You're already full.

@scene mp.fest_stall_masu
?(!mp_fest_night&!mb2_done) narr: ます{屋|や} の {屋台|やたい} 。 {青|あお}い のれん を {掛|か}けて 、 {準備|じゅんび} {中|ちゅう} だ 。 || Masuya's stall, its blue curtain up, getting ready.
?(!mp_fest_night&!mb2_done) !end
?(mb2_done) narr: ます{屋|や} の {屋台|やたい} 。 まさ{屋|や} に {負|ま}けない よう に 、 {夏|なつ} の {間|あいだ} {店|みせ} を {出|だ}す らしい 。 || Masuya's stall. Not to be outdone by Masaya, they're staying for the summer too.
?(mb2_done) !end
narr: ます{屋|や} の {屋台|やたい} 。 {青|あお}い のれん の {向|む}こう で 、 だし の いい {匂|にお}い が する 。 || Masuya's festival stall. A good smell of broth behind the blue curtain.
!if mp_fest_noodles -> ate
!challenge mp.fest_noodles
?(var._res=1) !set mp_fest_noodles
?(var._res=1) narr: {熱|あつ}い うどん が {二杯|にはい} 。 {二人|ふたり} で 、 {岸|きし} に {座|すわ}って {食|た}べた 。 || Two bowls of hot udon. You eat them sitting on the bank together.
?(var._res=1) !heal
!end
:ate
narr: もう お{腹|なか} いっぱい だ 。 || You're already full.

@scene mp.river_koji
# Reedwake, once Chapter 4's festival has opened the river (F-40): Kōji's boat goes down to Manybridge.
!faceplayer koji
koji: {川|かわ} が {開|ひら}いた って な 。 {八百橋|やおばし} まで 、 {舟|ふね} で {下|くだ}れる よう に なった 。 {乗|の}って いく か ？ || I hear the river's open. The boat can go all the way down to Manybridge now. Coming aboard?
!choice
* {八百橋|やおばし} へ {行|い}きます 。 || To Manybridge, please. -> go
* {今日|きょう} は {話|はなし} だけ 。 || Just here to talk today. -> talk
:go
koji: よし 。 {茶|ちゃ} を {飲|の}みながら 、 のんびり {行|い}こう 。 || Right. We'll take it slow and drink tea on the way.
!fade out
narr: {葦|あし} の {間|あいだ} を 、 {舟|ふね} は {川|かわ} を {下|くだ}って いく 。 || The boat slides down the river between the reeds.
!warp mp.playhouse 44 25 up
!fade in
!end
:talk
?(post) !call rw.koji_post
?(!post) !call rw.koji_tea

@scene mp.river_up
# Playhouse Row's landing, once the river is open (F-40): the boat up the river to Reedwake.
narr: {葦|あし}ノ{瀬|せ} へ {上|のぼ}る {舟|ふね} が 、 {岸|きし} に {着|つ}いて いる 。 {乗|の}って いく ？ || A boat bound upriver for Reedwake is moored at the bank. Go aboard?
!choice
* {葦|あし}ノ{瀬|せ} へ {行|い}く 。 || Go to Reedwake. -> go
* まだ {乗|の}らない 。 || Not yet. -> end
:go
!fade out
narr: {舟|ふね} は 、 {流|なが}れ に {逆|さか}らって 、 ゆっくり {川|かわ} を {上|のぼ}って いく 。 || Slowly, against the current, the boat makes its way upriver.
!warp rw.village 45 17 down
!fade in
:end

@scene mp.booth_yoyo
narr: ヨーヨー{釣|つ}り の {屋台|やたい} 。 {水|みず} の {上|うえ} に 、 {言葉|ことば} を {書|か}いた {風船|ふうせん} が {浮|う}いて いる 。 || The water-balloon fishing stall: balloons with words on them bob in the tub.
!hook fest_booth yoyo

@scene mp.booth_wanage
narr: {輪投|わな}げ の {屋台|やたい} 。 {景品|けいひん} の {説明|せつめい} を {聞|き}いて 、 {輪|わ} を {投|な}げる 。 || The ring-toss stall: listen to the prize's description, then throw.
!hook fest_booth wanage

@scene mp.booth_katanuki
narr: {型抜|かたぬ}き の {屋台|やたい} 。 {薄|うす}い {砂糖菓子|さとうがし} の {板|いた} から 、 {形|かたち} を {割|わ}らず に {抜|ぬ}く 。 || The katanuki stall: press a shape out of a thin sugar sheet without breaking it.
!hook fest_booth katanuki

@scene mp.booth_kuji
narr: {言葉|ことば} の くじ {引|び}き の {屋台|やたい} 。 {引|ひ}いた {言葉|ことば} で 、 {文|ぶん} を {作|つく}る 。 || The word lottery stall: draw a word, and make a sentence with it.
!hook fest_booth kuji

@scene mp.booth_taiko
narr: {太鼓|たいこ} の {屋台|やたい} 。 {札|ふだ} に {書|か}いた ドン と カッ の とおり に {叩|たた}く 。 || The taiko stall: beat the drum as the cards say, ドン and カッ.
!hook fest_booth taiko

@scene mp.manbe_after
!faceplayer
mp_manbe: {川開|かわびら}き の {芝居|しばい} 、 {夏|なつ} の {間|あいだ} ずっと {打|う}つ こと に なりました 。 {役者|やくしゃ} たち は 、 {毎朝|まいあさ} {自分|じぶん} の {名前|なまえ} を {台本|だいほん} に {書|か}いて から {舞台|ぶたい} に {上|あ}がります 。 || The Opening's play is running all summer. Every morning the actors write their own names in the script before they go on.
?(comp=suzu) mp_manbe: …… {昔|むかし} 、 スズ と いう {名前|なまえ} の {子役|こやく} が いた そう です よ 。 {番付|ばんづけ} の {隅|すみ} に 、 {小|ちい}さく 。 || …They say there was once a child actor called Suzu. In the corner of a playbill, in small letters.
?(comp=suzu) comp[smile]: そう 。 {小|ちい}さい {字|じ} の {役者|やくしゃ} も 、 {役者|やくしゃ} よ 。 || Yes. An actor in small letters is still an actor.

@scene mp.tomi_hall
!faceplayer
mp_tomi: {祭|まつ}り の {遊|あそ}び は 、 {夏|なつ} の {間|あいだ} ここ で {続|つづ}けて います 。 {屋台|やたい} の {人|ひと} たち も 、 {喜|よろこ}んで いる わ 。 || The festival games carry on here all summer. The stall people are pleased.
?(mp_inv_matsu) mp_tomi: マツ さん 、 {来年|らいねん} の {世話役|せわやく} を {手伝|てつだ}う って 。 {招待状|しょうたいじょう} の おかげ ね 。 || Matsu says she'll help on next year's committee. Thanks to your invitation.

@scene mp.door_festhall
narr: {祭|まつ}り の {道具|どうぐ} を しまう {蔵|くら} 。 {今|いま} は {鍵|かぎ} が かかって いる 。 || The storehouse for the festival's things. Locked for now.
`, 'mp/22_scenes_fest.js');
