/* Chapter 5 side quests:
 *  lf_fence     — Kōhei and Kinu's fence moves every morning (settled once people can argue)
 *  lf_form      — Hayato's form says two things at once
 *  lf_timetable — Tsuya waits for a ferry the timetable says runs */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- the fence that moves every morning ---------------------------------------------------------------------------------------
@scene lf.fence_talk
# Staged: Kōhei and Kinu, either side of the fence, talk across it: he points out his neighbour, they point to the
# persimmon in turn and nod each other an "of course"; you lean in to the row of pulled-up post holes; Kōhei's tired
# shrug, Kinu stretches her aching back; your companion's own answer (Nao looks between them, Mio leans in towards
# Kinu's back, Ren's hand to the chin, Suzu's two hands for back and forth); "of course", "of course". After the
# bell they argue properly (Kinu's flat hand, Kōhei's folded arms, her laugh, his shrug). With the record: you hold
# it up, each points to their own side of the tree and nods the other's "of course", and you look between them.
# Settling it after the bell: the argument again; your two hands for half and half; both think it over; Kinu points
# to the sweeter branch, Kōhei shrugs, she laughs, he nods; both bend to tie the rope round the trunk; your
# companion's own answer; Kinu holds out the dried persimmons.
!if quest.lf_fence>=1 -> record
!if quest.lf_fence -> waiting
!if lf_bell_rung -> loud
!gesture lf_kohei point lf_kinu
lf_kohei: おや 、お{客|きゃく}さん 。{隣|となり} の キヌ さん と 、{垣根|かきね} の {話|はなし} を して いた ところ で ね 。|| Oh, hello there. I was just talking with my neighbour Kinu about the fence.
!look lf_kinu lf_kohei
!gesture lf_kinu nod
lf_kinu[smile]: ええ 。とても {穏|おだ}やか な {話|はなし} です よ 。|| Yes. A very peaceful conversation.
!look lf_kohei lf_kinu
!gesture lf_kohei point prop:orchard
lf_kohei: キヌ さん 、{垣根|かきね} は {柿|かき} の {木|き} の こちら {側|がわ} が いい です よね 。|| Kinu, the fence should go on this side of the persimmon, shouldn't it?
!gesture lf_kinu nod lf_kohei
lf_kinu[smile]: もちろん です 。|| Of course.
!gesture lf_kinu point prop:orchard
lf_kinu: でも 、{柿|かき} の {木|き} の 、あちら {側|がわ} でも いい です よね 。|| But it could go on the far side of the persimmon too, couldn't it?
!gesture lf_kohei nod lf_kinu
lf_kohei[smile]: もちろん です 。|| Of course.
!gesture pc observe prop:hole
narr: ふたり は にこにこ して いる 。{地面|じめん} に は 、{杭|くい} を {抜|ぬ}いた {穴|あな} が いくつ も {並|なら}んで いる 。|| They are both smiling. In the ground, a row of holes where fence posts have been pulled up.
!look lf_kohei pc
!gesture lf_kohei shrug
lf_kohei[tired]: …… {毎朝|まいあさ} 、どちら か が {言|い}い{出|だ}して 、どちら か が 「もちろん」 と {言|い}う 。それ で {垣根|かきね} を {動|うご}かす 。|| …Every morning, one of us suggests something and the other says "of course". So we move the fence.
!gesture lf_kinu stretch
lf_kinu[tired]: {腰|こし} が {痛|いた}くて 。…… もちろん 、{構|かま}いません けれど 。|| My back aches. …Not that I mind, of course.
?(comp=nao) !gesture comp lookbetween lf_kohei and=lf_kinu
?(comp=nao) comp: {二人|ふたり} とも 、{本当|ほんとう} は {譲|ゆず}りたく ない んだ よね 。{顔|かお} に {書|か}いて ある 。|| Neither of you actually wants to give ground, do you. It's written all over your faces.
?(comp=mio) !gesture comp observe lf_kinu
?(comp=mio) comp[worry]: {腰|こし} 、{見|み}せて ください 。…… {湿布|しっぷ} 、{置|お}いて いきます ね 。|| Let me see your back. …I'll leave you a poultice.
?(comp=ren) !gesture comp chin
?(comp=ren) comp: {境|さかい} の {記録|きろく} が ある はず です 。{記録館|きろくかん} で {探|さが}して みましょう 。|| There must be a record of the boundary. Let's look for it at the Records Hall.
?(comp=suzu) !gesture comp size
?(comp=suzu) comp[laugh]: {毎朝|まいあさ} の {公演|こうえん} ね 。{演目|えんもく} は 「{垣根|かきね} {往復|おうふく}」 。|| A daily performance. Today's programme: "The Fence, Back and Forth."
pc: {記録館|きろくかん} に 、{土地|とち} の {記録|きろく} が ある かも しれません 。{探|さが}して みます 。|| There might be a land record at the Records Hall. I'll look.
!gesture lf_kohei nod
lf_kohei: もちろん です 。|| Of course.
!gesture lf_kinu nod
lf_kinu: もちろん です 。|| Of course.
!quest lf_fence start
!end
:loud
!look lf_kinu lf_kohei
!look lf_kohei lf_kinu
!gesture lf_kinu emphatic
lf_kinu[angry]: {垣根|かきね} は {柿|かき} の {木|き} の {手前|てまえ} です ！ {三十年|さんじゅうねん} そう でした ！|| The fence goes on THIS side of the persimmon! It's been that way for thirty years!
!gesture lf_kohei folded
lf_kohei[angry]: いいや 、{向|む}こう だ ！ {親父|おやじ} が そう {言|い}ってた ！|| No, the far side! My father said so!
!gesture lf_kinu laugh
lf_kinu: あら 、{久|ひさ}しぶり に 「いいや」 を {聞|き}きました わ 。|| My, it's been a while since I heard "no".
!gesture lf_kohei shrug
lf_kohei[laugh]: …… {久|ひさ}しぶり に {言|い}った よ 。|| …Been a while since I said it.
pc: {記録館|きろくかん} で 、{土地|とち} の {記録|きろく} を {探|さが}して きましょう か 。|| Shall I go and find the land record at the Records Hall?
!look lf_kinu pc
!gesture lf_kinu nod
lf_kinu: お{願|ねが}い します 。{記録|きろく} が {私|わたし} の {味方|みかた} を する の を 、{見|み}たい わ 。|| Please do. I'd like to see the record take my side.
lf_kohei: {俺|おれ} の {味方|みかた} だ よ 。|| It'll take mine.
!quest lf_fence start
!end
:waiting
!gesture lf_kohei point left
lf_kohei: {記録館|きろくかん} の {右|みぎ} の {机|つくえ} に 、{土地|とち} の {記録|きろく} が ある はず です よ 。|| The land records should be on the desk on the right in the Records Hall.
?(!lf_bell_rung) !gesture lf_kinu nod
?(!lf_bell_rung) lf_kinu: もちろん です 。|| Of course.
?(lf_bell_rung) !gesture lf_kinu laugh
?(lf_bell_rung) lf_kinu: {左|ひだり} の {机|つくえ} です よ 。…… え 、{右|みぎ} ？ あら 。|| The left-hand desk. …Eh? The right? Oh.
!end
:record
!if quest.lf_fence=done -> end
!if lf_bell_rung -> settle
!if quest.lf_fence>=2 -> still
!gesture pc present lf_kohei prop=paper
pc: {記録|きろく} が ありました 。「{東|ひがし} の {境|さかい} は 、{柿|かき} の {木|き} まで と する 。」|| I found the record. "The eastern boundary shall run as far as the persimmon tree."
!gesture lf_kohei point prop:orchard
lf_kohei: {柿|かき} の {木|き} まで 。…… {木|き} の {向|む}こう まで 、と いう こと です ね 。|| As far as the tree. …Meaning up to the far side of the tree.
!gesture lf_kinu nod lf_kohei
lf_kinu[smile]: もちろん です 。|| Of course.
!gesture lf_kinu point prop:orchard
lf_kinu: {柿|かき} の {木|き} まで 。{木|き} の {手前|てまえ} まで 、と いう こと です よね 。|| As far as the tree. Meaning up to this side of it.
!gesture lf_kohei nod lf_kinu
lf_kohei[smile]: もちろん です 。|| Of course.
!gesture pc lookbetween lf_kohei and=lf_kinu
narr: {記録|きろく} は 、{二人|ふたり} の {間|あいだ} で 、{二|ふた}つ の {意味|いみ} に {分|わ}かれた まま だ 。|| Between the two of them, the record just splits into two meanings.
?(comp=nao) !gesture comp shrug
?(comp=nao) comp: {言|い}い{返|かえ}せない と 、{記録|きろく} が あって も {意味|いみ} ない ん だね 。|| If they can't argue back, even a record doesn't help.
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: {反対|はんたい} できない と 、{話|はな}し{合|あ}い も できない んだ 。|| If you can't disagree, you can't talk things through either.
?(comp=ren) !gesture comp size
?(comp=ren) comp: 「まで」 は {境|さかい} を {示|しめ}します が 、{木|き} が {内側|うちがわ} か {外側|そとがわ} か は {示|しめ}しません 。{議論|ぎろん} が {必要|ひつよう} です 。…… {議論|ぎろん} が できれば 。|| まで marks a limit, but not whether the tree is inside or outside it. That needs arguing out. …If they could argue.
?(comp=suzu) !gesture comp palm
?(comp=suzu) comp: {台本|だいほん} は {揃|そろ}った 。あと は 、{役者|やくしゃ} が {喧嘩|けんか} できる よう に なれば ね 。|| The script's ready. Now the actors just need to be able to fight.
!quest lf_fence 2
!end
:still
!gesture lf_kohei shrug
lf_kohei[smile]: {垣根|かきね} は {今朝|けさ} も {動|うご}きました よ 。|| The fence moved again this morning.
!gesture lf_kinu nod
lf_kinu[smile]: もちろん です 。|| Of course.
!end
:settle
!if quest.lf_fence<1 -> end
!look lf_kinu lf_kohei
!look lf_kohei lf_kinu
!gesture lf_kinu emphatic
lf_kinu[angry]: {柿|かき} の {木|き} まで です よ 。{木|き} の {手前|てまえ} まで ！|| As far as the tree. Up to THIS side of it!
!gesture lf_kohei folded
lf_kohei[angry]: {木|き} の {向|む}こう まで だ ！ {木|き} も {含|ふく}めて 「まで」 だ ！|| Up to the far side! まで includes the tree!
narr: {二人|ふたり} は {生|い}き{生|い}き と {言|い}い{争|あらそ}って いる 。{三十年分|さんじゅうねんぶん} の {元気|げんき} が 、{顔|かお} に {戻|もど}って いる 。|| The two of them argue with real life in them. Thirty years' worth of vigour has come back into their faces.
!quest lf_fence 3
!challenge lf.ch_fence
!gesture pc size
pc: {境|さかい} は {幹|みき} の {真|ま}ん{中|なか} 。{柿|かき} の {実|み} は 、{半分|はんぶん} ずつ に しては どう でしょう 。|| How about the line runs through the middle of the trunk, and the fruit is split half and half?
!gesture lf_kohei chin
lf_kohei[think]: …… {半分|はんぶん} か 。|| …Half, eh.
!gesture lf_kinu chin
lf_kinu[think]: {半分|はんぶん} 、ね 。|| Half.
!gesture lf_kinu point prop:orchard
lf_kinu: {反対|はんたい} です 。…… {甘|あま}い ほう の {枝|えだ} は 、{私|わたし} の {側|がわ} です から 。|| I object. …The branch with the sweeter fruit is on my side.
!gesture lf_kohei shrug
lf_kohei[laugh]: それ は {認|みと}める 。{渋|しぶ}い の は {全部|ぜんぶ} こっち だ 。{干|ほ}し{柿|がき} に する しか ない 。|| I'll grant you that. All the astringent ones are on mine. Only good for drying.
!gesture lf_kinu laugh
lf_kinu[laugh]: じゃあ 、{干|ほ}し{柿|がき} は {一緒|いっしょ} に {作|つく}りましょう 。{縁側|えんがわ} は うち の ほう が {広|ひろ}い わ 。|| Then let's make the dried persimmons together. My veranda's bigger.
!gesture lf_kohei nod lf_kinu
lf_kohei: それ に は {反対|はんたい} しない 。|| That, I won't object to.
!gesture lf_kohei bend prop:orchard
!gesture lf_kinu bend prop:orchard
narr: {二人|ふたり} は {柿|かき} の {木|き} の {幹|みき} に 、{縄|なわ} を {一本|いっぽん} {巻|ま}いた 。{垣根|かきね} は 、もう {動|うご}かない 。|| The two of them tie a single rope round the persimmon trunk. The fence won't be moving any more.
?(comp=nao) !gesture comp nod
?(comp=nao) comp[smirk]: {言|い}い{争|あらそ}って 、{決|き}めて 、{笑|わら}ってる 。{順番|じゅんばん} 、{合|あ}ってる じゃん 。|| Argued, decided, laughing. Right order.
?(comp=mio) !gesture comp laugh
?(comp=mio) comp[laugh]: {腰|こし} も 、もう {痛|いた}く ならない ね 。|| No more sore backs, then.
?(comp=ren) !gesture comp exhale
?(comp=ren) comp[smile]: {縄|なわ} が {境|さかい} の {印|しるし} 。{私|わたし} の {言葉|ことば} で は ない の に 、なんだか {嬉|うれ}しい です 。|| A rope for a boundary mark. It isn't my inscription, but somehow I'm pleased.
?(comp=suzu) !gesture comp celebrate
?(comp=suzu) comp[laugh]: {大団円|だいだんえん} ！ {干|ほ}し{柿|がき} の {取|と}り{分|わ}け は 、{帳簿|ちょうぼ} に つけて おく こと ！|| A happy ending! And keep a ledger of who gets which persimmons!
!quest lf_fence done
!gesture lf_kinu present pc prop=seeds
lf_kinu: {去年|きょねん} の {干|ほ}し{柿|がき} 、{少|すこ}し {残|のこ}って いた の 。どうぞ 。|| There were a few dried persimmons left from last year. Please, take them.
!autosave

@scene lf.kohei_done
lf_kohei: {柿|かき} が {熟|う}れたら 、また {喧嘩|けんか} する よ 。どれ が {甘|あま}い か で ね 。|| When the persimmons ripen we'll argue again. Over which are the sweet ones.

@scene lf.kinu_done
lf_kinu: {毎朝|まいあさ} {杭|くい} を {抜|ぬ}かなくて いい って 、{楽|らく} です ね 。{代|か}わり に 、{毎朝|まいあさ} {口|くち} で {言|い}い{合|あ}って います けど 。|| Not having to pull up posts every morning is such a relief. We argue out loud every morning instead.

@scene lf.kohei_post
lf_kohei: {干|ほ}し{柿|がき} 、{今年|ことし} は {二百個|にひゃっこ} だ 。キヌ さん は {百九十九個|ひゃくきゅうじゅうきゅうこ} だ と {言|い}ってる 。|| Two hundred dried persimmons this year. Kinu says a hundred and ninety-nine.
lf_kohei[laugh]: {数|かぞ}え{直|なお}す の が 、{楽|たの}しみ で ね 。|| I'm looking forward to counting them again.

@scene lf.kinu_post
lf_kinu: {数|かぞ}え{直|なお}しましたら 、{百九十八個|ひゃくきゅうじゅうはっこ} でした 。…… {誰|だれ} か が {一|ひと}つ {食|た}べました ね 。|| When I recounted, it was a hundred and ninety-eight. …Someone's eaten one.

@scene lf.records_plots
!if quest.lf_fence=done -> done
!if !quest.lf_fence -> plain
!if quest.lf_fence>=1 -> seen
narr: {庭|にわ} の {町|まち} の {土地|とち} の {記録|きろく} 。コウヘイ と キヌ の {家|いえ} の {間|あいだ} の {頁|ページ} を {探|さが}す 。|| Land records for the garden quarter. You look for the page covering Kōhei's and Kinu's houses.
narr: 「{東|ひがし} の {境|さかい} は 、{柿|かき} の {木|き} まで と する 。」|| "The eastern boundary shall run as far as the persimmon tree."
narr: {古|ふる}い {字|じ} だ 。{写|うつ}し{直|なお}されて いない 。{土地|とち} の {記録|きろく} に は 、{争|あらそ}い の {言葉|ことば} が なかった から だろう 。|| Old writing, never recopied — perhaps because a land record contains no words of conflict.
!quest lf_fence 1
!end
:seen
narr: 「{東|ひがし} の {境|さかい} は 、{柿|かき} の {木|き} まで と する 。」|| "The eastern boundary shall run as far as the persimmon tree."
!end
:plain
narr: {庭|にわ} の {町|まち} の {土地|とち} の {記録|きろく} 。{几帳面|きちょうめん} な {線|せん} で 、{区画|くかく} が {引|ひ}いて ある 。|| Land records for the garden quarter, plots drawn in meticulous lines.
!end
:done
narr: {柿|かき} の {木|き} の {頁|ページ} に 、{新|あたら}しい {書|か}き{込|こ}み 。「{境|さかい} は {幹|みき} の {中央|ちゅうおう} 。{実|み} は {折半|せっぱん} 。{異議|いぎ} あり （ {甘|あま}い {枝|えだ} に つき ）」 。|| A new note on the persimmon page: "Boundary: centre of trunk. Fruit: split. Objection noted (re: the sweet branch)."

# ---- the form that says two things ---------------------------------------------------------------------------------------------------------
@scene lf.hayato
# Staged: Hayato's nod, and he holds out the form with his worried question; his head goes down at a form nobody can
# read; your companion's own answer (Nao and Ren lean in to the form, Mio's hand to her chin, Suzu counts the five
# writers). Before the bell he looks away, unable to cross out anyone's request, and hands you his red pen; you
# strike the line; his nod. After the bell: his firm flat hand, and he strikes it out himself; he gives you the pen
# to keep. Later: an open hand for his senior's saying.
!if quest.lf_form -> again
!gesture lf_hayato nod pc
lf_hayato: あ 、{先|さき} ほど の 。{記録館|きろくかん} へ ようこそ 。|| Ah, it's you from earlier. Welcome to the Records Hall.
!gesture lf_hayato present pc prop=paper hold
lf_hayato[worry]: …… あの 、{少|すこ}し だけ 、{見|み}て いただけません か 。この {書類|しょるい} 。|| …Um, could you possibly take a quick look at this form?
lf_hayato: {住民|じゅうみん} の {申請書|しんせいしょ} です 。{各課|かくか} から 「この {一文|いちぶん} を {足|た}して ほしい」 と {言|い}われて 、{全部|ぜんぶ} 「かしこまりました」 と {足|た}して いったら …… 。|| It's the residents' application form. Every department asked me to add a sentence, and I said "certainly" to all of them, and added them all, and…
!gesture lf_hayato lowered
lf_hayato[sad]: {何|なに} を {言|い}って いる の か 、{誰|だれ} に も わからなく なりました 。|| Now nobody can tell what it's saying.
?(comp=nao) !gesture comp observe lf_hayato
?(comp=nao) comp: …… {封筒|ふうとう} に {宛名|あてな} を {五|いつ}つ {書|か}いた みたい な もん だ 。|| …It's like an envelope with five addresses on it.
?(comp=mio) !gesture comp chin
?(comp=mio) comp: {薬|くすり} も 、{混|ま}ぜすぎる と {毒|どく} に なる の 。{書類|しょるい} も {同|おな}じ かも ね 。|| Mix too many medicines and you get poison. Maybe forms are the same.
?(comp=ren) !gesture comp observe lf_hayato
?(comp=ren) comp: {拝見|はいけん} します 。…… これ は 、{迷路|めいろ} です ね 。{私|わたし} が {迷|まよ}う の も {無理|むり} は ない 。|| May I? …This is a maze. No wonder I'm lost.
?(comp=suzu) !gesture comp count
?(comp=suzu) comp: {脚本家|きゃくほんか} が {五人|ごにん} いる {芝居|しばい} と {同|おな}じ ね 。{最後|さいご} に は {全員|ぜんいん} {死|し}ぬ か {結婚|けっこん} する の 。|| Same as a play with five writers. By the end, everyone either dies or gets married.
!quest lf_form start
!challenge lf.ch_form2
!quest lf_form 1
!if lf_bell_rung -> strike
!gesture lf_hayato aside
lf_hayato: {消|け}す べき {一文|いちぶん} は 、わかりました 。…… でも 、{私|わたし} に は {消|け}せない んです 。{誰|だれ} か の {頼|たの}み を {断|ことわ}る こと に なる ので 。|| I understand which sentence should go. …But I can't cross it out. It would mean refusing someone's request.
!gesture lf_hayato handover pc prop=brush
!gesture pc receive lf_hayato
narr: ハヤト は {赤|あか}ペン を 、こちら に {差|さ}し{出|だ}した 。|| Hayato holds out his red pen to you.
lf_hayato: …… お{願|ねが}い します 。|| …Please.
!gesture pc write lf_hayato
narr: {一本|いっぽん} {線|せん} を {引|ひ}く 。「{同意|どうい} しない {場合|ばあい} は 、{同意|どうい} した もの と みなします 。」 が 、{消|き}えた 。|| You draw one line. "If you do not agree, you will be deemed to have agreed" is gone.
!gesture lf_hayato nod pc
lf_hayato[smile]: …… {読|よ}める 。{書類|しょるい} が 、{一|ひと}つ の こと を {言|い}って います 。|| …It's readable. The form says one thing.
!goto done
:strike
!gesture lf_hayato emphatic
lf_hayato[laugh]: …… では 、{消|け}します ！ {自分|じぶん} で ！|| …Then I'm crossing it out! Myself!
!gesture lf_hayato write
narr: ハヤト は {赤|あか}ペン で 、{勢|いきお}い よく {線|せん} を {引|ひ}いた 。{紙|かみ} が {少|すこ}し {破|やぶ}れた 。|| Hayato strikes the line out with such vigour that the paper tears a little.
!gesture lf_hayato handover pc prop=brush
!gesture pc receive lf_hayato
lf_hayato: {新|あたら}しい の を {用意|ようい} します 。…… この {赤|あか}ペン は 、{記念|きねん} に {差|さ}し{上|あ}げます 。|| I'll draw up a fresh one. …Please keep this red pen as a memento.
:done
!quest lf_form done
!gesture lf_hayato palm pc
lf_hayato: {断|ことわ}れない {事務員|じむいん} は 、{半分|はんぶん} しか {事務員|じむいん} じゃ ない 。…… {先輩|せんぱい} の {口癖|くちぐせ} でした 。やっと {意味|いみ} が わかりました 。|| "A clerk who can't say no is only half a clerk." …My senior used to say that. Now I finally get it.
!autosave
!end
:again
!call lf.hayato_done

@scene lf.hayato_done
!if lf_bell_rung -> after
lf_hayato: {線|せん} を {引|ひ}いた {書類|しょるい} 、{課長|かちょう} も 「もちろん」 と {通|とお}して くれました 。…… {誰|だれ} も {反対|はんたい} できない の は 、{時|とき} に は {便利|べんり} です ね 。|| The form with the line struck out — my section chief approved it with "of course". …Sometimes nobody being able to object is handy.
!end
:after
lf_hayato[laugh]: {今|いま} は {課長|かちょう} に 「その {線|せん} は {引|ひ}きすぎ だ」 と {叱|しか}られて います 。{最高|さいこう} です 。|| Now my section chief scolds me: "You've struck out too much." It's wonderful.

@scene lf.hayato_post
lf_hayato: いらっしゃいませ 。{申請書|しんせいしょ} は 、{今|いま} は {一頁|いちページ} {半|はん} です 。{反対|はんたい} の {欄|らん} も あります 。|| Welcome. The application form is a page and a half now. It has a box for objections.
?(end_archive_library) lf_hayato: {山|やま} の {書庫|しょこ} に {写|うつ}し を {出|だ}す とき は 、{必|かなら}ず {署名|しょめい} を {入|い}れます 。{誰|だれ} が {書|か}いた か 、わかる よう に 。|| Whenever we send a copy up to the Archive, we always sign it now. So everyone knows who wrote it.

# ---- the timetable with no "no" --------------------------------------------------------------------------------------------------------------
@scene lf.tsuya
# Staged: Tsuya looks out over the water for the three o'clock boat, thinks over the timetable with a hand to her
# chin and laughs it off; your companion's own answer (Nao shakes their head, Mio looks her over against the chill,
# Ren's open hand for the broken promise, Suzu looks away); you point to the ferry office. With the truth: your open
# hand; her attention, then a nod; after the bell, she looks over to the ferry office crossly and laughs at herself;
# your companion's own answer (Nao offers to write on her basket, Mio's and Ren's nods, Suzu notes it).
!if quest.lf_timetable>=1 -> tell
!if quest.lf_timetable -> waiting
!gesture lf_tsuya lookroad right
lf_tsuya[smile]: あら 、こんにちは 。{舟|ふね} を {待|ま}って いる の 。{三時|さんじ} の {舟|ふね} 。|| Oh, hello. I'm waiting for the boat. The three o'clock.
lf_tsuya: {東岸|ひがしぎし} に {妹|いもうと} が いて ね 。{甘酒|あまざけ} を {持|も}って いく {約束|やくそく} なの 。|| My sister lives on the east shore. I promised to bring her amazake.
!look lf_tsuya pc
!gesture lf_tsuya chin
lf_tsuya[think]: {時刻表|じこくひょう} に は 、「{三時|さんじ} の {便|びん} は {当分|とうぶん} {出|で}ます」 って {書|か}いて ある の よ 。でも 、もう {二月|ふたつき} 、{一度|いちど} も {来|こ}ない の 。|| The timetable says "the three o'clock boat will run for the time being". But it hasn't come once in two months.
!gesture lf_tsuya laugh
lf_tsuya: {渡|わた}し{場|ば} の ウミ さん に {聞|き}いて も 、「もちろん {出|で}ます」 って 。…… じゃあ 、{明日|あした} は {来|く}る わ ね 。|| When I ask Umi at the ferry office, she says "of course it runs". …So it'll come tomorrow, I expect.
?(comp=nao) !gesture comp shake
?(comp=nao) comp: {二月|ふたつき} も ？ {誰|だれ} か が 「{来|こ}ない よ」 って {言|い}えば {済|す}む {話|はなし} なのに 。|| Two months? One person saying "it's not coming" would've sorted it.
?(comp=mio) !gesture comp observe lf_tsuya
?(comp=mio) comp[worry]: {雨|あめ} の {日|ひ} も ここ に ？ {体|からだ} を {冷|ひ}やして は だめ です よ 。|| Even on rainy days? You mustn't let yourself get chilled.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: {時刻表|じこくひょう} は 、{約束|やくそく} の {一種|いっしゅ} です 。{守|まも}られない {約束|やくそく} が {貼|は}って ある の は 、よく ありません 。|| A timetable is a kind of promise. It's not good to have a broken promise pinned up.
?(comp=suzu) !gesture comp aside
?(comp=suzu) comp: {来|こ}ない {役者|やくしゃ} を {待|ま}つ {客|きゃく} ほど 、{悲|かな}しい もの は ない わ 。|| There's nothing sadder than an audience waiting for an actor who isn't coming.
!gesture pc point 35,29
pc: {時刻表|じこくひょう} を {見|み}て きます 。|| I'll go and look at the timetable.
!gesture lf_tsuya nod pc
lf_tsuya[smile]: まあ 、ご{親切|しんせつ} に 。|| Oh, how kind.
!quest lf_timetable start
!end
:waiting
!gesture lf_tsuya lookroad right
lf_tsuya: {三時|さんじ} の {舟|ふね} 、{今日|きょう} は {来|く}る かしら ね 。|| I wonder if the three o'clock will come today.
!end
:tell
!gesture pc palm lf_tsuya
pc: ツヤ さん 。{三時|さんじ} の {舟|ふね} は 、{当分|とうぶん} {出|で}ません 。{舟|ふね} の {修理|しゅうり} を して いる んです 。|| Tsuya. The three o'clock boat isn't running for now. They're repairing the boat.
pc: {昼|ひる} の {十二時|じゅうにじ} の {舟|ふね} なら 、{毎日|まいにち} {出|で}て います 。|| The twelve o'clock, at noon, runs every day.
!if lf_bell_rung -> argue
!gesture lf_tsuya listen pc
lf_tsuya[surprise]: …… まあ 。|| …Oh my.
!gesture lf_tsuya nod
lf_tsuya[smile]: もちろん です わ 。{明日|あした} から 、{十二時|じゅうにじ} に {来|き}ます 。|| Of course. From tomorrow I'll come at twelve.
narr: 「もちろん」 だ けれど 、ツヤ の {目|め} は 、ちゃんと {時刻|じこく} を {覚|おぼ}えた {目|め} だった 。|| It's "of course" — but Tsuya's eyes have properly taken in the time.
!goto done
:argue
!gesture lf_tsuya lookroad 35,29
lf_tsuya[angry]: ええっ ！ {二月|ふたつき} も {待|ま}った のに ！ …… ウミ さん に 、ひと{言|こと} {言|い}って こなくちゃ 。|| What! After two months of waiting! …I must go and have a word with Umi.
!look lf_tsuya pc
!gesture lf_tsuya laugh
lf_tsuya[laugh]: …… ふふ 。{怒|おこ}る の って 、{久|ひさ}しぶり 。{甘酒|あまざけ} が {温|あたた}まる わ 。|| …Heh. Getting cross — it's been ages. It'll keep the amazake warm.
:done
?(comp=nao) !gesture comp write lf_tsuya
?(comp=nao) comp[smile]: {十二時|じゅうにじ} 。{忘|わす}れない よう に 、{籠|かご} に {書|か}いて おこう か 。|| Twelve o'clock. Shall I write it on your basket so you don't forget?
?(comp=mio) !gesture comp nod lf_tsuya
?(comp=mio) comp: {甘酒|あまざけ} 、{冷|さ}めない うち に {届|とど}くと いい です ね 。|| I hope the amazake gets there while it's still warm.
?(comp=ren) !gesture comp nod
?(comp=ren) comp: これ で {約束|やくそく} が {一|ひと}つ 、{正|ただ}しく {貼|は}り{直|なお}されました 。|| That's one promise pinned back up correctly.
?(comp=suzu) !gesture comp write
?(comp=suzu) comp: {開演|かいえん} {時刻|じこく} の {変更|へんこう} 、{承|うけたまわ}りました ！|| Change of curtain time, duly noted!
lf_tsuya: {若|わか}い {人|ひと} に は 、これ を 。{渡|わた}し{場|ば} の ウミ さん が 、{余|あま}った {帽子|ぼうし} を くれた の 。{私|わたし} に は {大|おお}きくて 。|| For you, young one. Umi at the ferry office gave me a spare cap, but it's too big for me.
!quest lf_timetable done
!autosave

@scene lf.tsuya_done
lf_tsuya: {十二時|じゅうにじ} の {舟|ふね} で 、{妹|いもうと} の ところ へ {行|い}って きた の 。{甘酒|あまざけ} 、{喜|よろこ}んで くれた わ 。|| I went to my sister's on the twelve o'clock boat. She loved the amazake.
lf_tsuya[laugh]: 「{二月|ふたつき} も {何|なに} を してた の」 って {叱|しか}られた けど 。|| Though she scolded me: "What were you doing for two months?"

@scene lf.tsuya_post
lf_tsuya: {今日|きょう} は {妹|いもうと} が こっち へ {来|く}る の 。{三時|さんじ} の {舟|ふね} で 。…… {今|いま} は 、ちゃんと {来|く}る の よ 。|| My sister's coming over today. On the three o'clock. …It really comes now.

@scene lf.timetable
# Staged: you lean in to the ferry timetable and bend to the last character in its different ink; asking for the
# log, you turn to Umi, who brings it over from behind the counter and hands it to you; you notice the draft slip in
# her drawer; her hands fidget over her own handwriting and her head goes down. After the bell: you lean in to the
# new notice and bend to the old one still pinned underneath; Umi holds up the log.
!if lf_bell_rung -> fixed
!gesture pc observe prop:noticeboard
narr: {渡|わた}し{場|ば} の {時刻表|じこくひょう} 。「{東岸|ひがしぎし} {行|ゆ}き ： {九時|くじ} 、{十二時|じゅうにじ} 、{十五時|じゅうごじ} 」 。|| The ferry timetable. "To the east shore: 9:00, 12:00, 15:00."
narr: {下|した} に {貼|は}り{紙|がみ} 。「{十五時|じゅうごじ} の {便|びん} は 、{当分|とうぶん} の {間|あいだ} {出|で}ます 。」|| A notice pasted underneath: "The 15:00 boat will run for the time being."
!gesture pc bend prop:noticeboard
narr: 「{出|で}ます」 の {最後|さいご} の {一字|いちじ} だけ 、{墨|すみ} の {色|いろ} が {少|すこ}し {違|ちが}う 。|| Only the last character of 出ます is in a slightly different ink.
!if !quest.lf_timetable -> end
!if quest.lf_timetable>=1 -> end
!choice
* ウミ に {日誌|にっし} を {見|み}せて もらう || Ask Umi to show you the ferry log -> log
* やめて おく || Leave it -> end
:log
!look pc umi
pc: ウミ さん 、{舟|ふね} の {日誌|にっし} を {見|み}せて いただけます か 。|| Umi, may I see the ferry log?
!walkto umi 6 2 down
umi: かしこまりました 。|| Certainly.
!gesture umi handover pc prop=book
!gesture pc receive umi
narr: {差|さ}し{出|だ}された {日誌|にっし} に は 、{毎日|まいにち} {同|おな}じ {三行|さんぎょう} 。「{九時|くじ} {出航|しゅっこう} 。{十二時|じゅうにじ} {出航|しゅっこう} 。{十五時|じゅうごじ} {欠航|けっこう} 。」|| The log she hands over has the same three lines every day. "9:00 sailed. 12:00 sailed. 15:00 cancelled."
!gesture pc observe umi
narr: {引|ひ}き{出|だ}し から 、{下書|したが}き の {紙|かみ} が {一枚|いちまい} はみ{出|だ}して いる 。|| A draft slip is poking out of her drawer.
!challenge lf.ch_timetable
!gesture umi fidget
umi[worry]: …… それ は 、{私|わたし} の {字|じ} です 。{最初|さいしょ} は 、ちゃんと 「{出|で}ません」 と {書|か}いた んです 。|| …That's my handwriting. At first, I did write "will not run".
!gesture umi lowered
umi[sad]: {次|つぎ} の {朝|あさ} {来|き}たら 、「ません」 が 「ます」 に なって いて 。…… {書|か}き{直|なお}そう と する と 、{手|て} が {止|と}まる んです 。|| When I came in the next morning, ません had turned into ます. …Whenever I try to write it again, my hand stops.
!quest lf_timetable 1
!end
:fixed
!gesture pc observe prop:noticeboard
narr: {時刻表|じこくひょう} の {貼|は}り{紙|がみ} が 、{新|あたら}しく なって いる 。|| The notice on the timetable has been replaced.
narr: 「{十五時|じゅうごじ} の {便|びん} は 、{船体|せんたい} {修理|しゅうり} の ため 、{当分|とうぶん} の {間|あいだ} {運休|うんきゅう} いたします 。」|| "The 15:00 boat is suspended for the time being, for hull repairs."
narr: {下|した} に 、{大|おお}きな {字|じ} で {書|か}き{足|た}して ある 。「{本当|ほんとう} に 、{出|で}ません 。」|| Added underneath in big letters: "It really does NOT run."
!if !quest.lf_timetable -> end
!if quest.lf_timetable>=1 -> end
!gesture pc bend prop:noticeboard
narr: {新|あたら}しい {貼|は}り{紙|がみ} の {下|した} に 、{古|ふる}い {貼|は}り{紙|がみ} が まだ {残|のこ}って いる 。「{十五時|じゅうごじ} の {便|びん} は 、{当分|とうぶん} の {間|あいだ} {出|で}ます 。」|| Under the new notice, the old one is still pinned: "The 15:00 boat will run for the time being."
!gesture umi present pc prop=book
umi: {日誌|にっし} を {見|み}て ください 。{最初|さいしょ} から 、ずっと {出|で}て いない んです 。|| Look at the log. It hasn't sailed once, from the very start.
!challenge lf.ch_timetable
!quest lf_timetable 1

@scene lf.umi
# Staged: Umi's open hand over the counter; her "of course" with a nod, then she bites her lip (a fidget, the
# narration); your companion's own answer (Nao's hand goes to the satchel strap, Mio's guarded hand, Suzu's open
# hand towards her).
!gesture umi palm pc
umi: {渡|わた}し{場|ば} の {事務所|じむしょ} へ ようこそ 。{切符|きっぷ} です か 、{郵便|ゆうびん} です か 。|| Welcome to the ferry office. Tickets, or post?
pc: {三時|さんじ} の {舟|ふね} は {出|で}ます か 。|| Does the three o'clock boat run?
!gesture umi nod
umi: もちろん {出|で}ます 。|| Of course it runs.
!gesture umi fidget
narr: そう {言|い}って から 、ウミ は {自分|じぶん} の {唇|くちびる} を {噛|か}んだ 。|| Having said it, Umi bites her lip.
?(comp=nao) !gesture comp strap
?(comp=nao) comp[closed]: …… 。|| …
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: …… {言|い}いたい こと と 、{口|くち} から {出|で}る こと が 、{違|ちが}う みたい 。|| …What she wants to say and what comes out of her mouth seem to be different.
?(comp=suzu) !gesture comp palm umi
?(comp=suzu) comp: {台詞|せりふ} と {本音|ほんね} が ずれてる 。{観客|かんきゃく} に は 、ちゃんと わかる わ よ 。|| Her line and her real feelings are out of step. The audience can always tell.

@scene lf.umi_after
# Staged: after the bell Umi's flat hand for "does NOT run!"; she holds up her father's letter; with Nao (the letter
# delivered), an open hand to them for the reply, and Nao's nod.
!gesture umi emphatic
umi[angry]: {三時|さんじ} の {舟|ふね} は {出|で}ません ！ …… ああ 、すっきり した 。|| The three o'clock does NOT run! …Oh, that feels good.
?(comp!=nao) !gesture umi present pc prop=letter
?(comp!=nao) umi: …… {配達人|はいたつにん} の ナオ さん から 、{父|ちち} の {手紙|てがみ} を {受|う}け{取|と}りました 。{一年|いちねん} {遅|おく}れ で 。|| …A courier called Nao brought me a letter from my father. A year late.
?(comp!=nao) umi: {怒|おこ}りました 。{思|おも}いっきり 。…… それ から 、{一行|いちぎょう} だけ {返事|へんじ} を {書|か}きました 。|| I got angry. Really angry. …Then I wrote one line back.
?(comp!=nao) umi[smile]: 「{読|よ}みました」 。それ だけ 。{許|ゆる}す か どう か は 、まだ {決|き}めて いません 。{決|き}めなくて いい と 、{父|ちち} が {書|か}いて いた ので 。|| "I read it." That's all. I haven't decided whether I forgive him. He wrote that I didn't have to.
?(comp=nao&quest.lf_nao=done) !gesture umi palm comp
?(comp=nao&quest.lf_nao=done) umi: …… ナオ さん 。{返事|へんじ} 、ちゃんと {届|とど}けて ね 。|| …Nao. Make sure that reply gets there.
?(comp=nao&quest.lf_nao=done) !gesture comp nod umi
?(comp=nao&quest.lf_nao=done) comp: {届|とど}ける 。{約束|やくそく} する 。…… {必要|ひつよう} なら 、じゃ なくて ね 。|| I'll deliver it. That's a promise. …Not an "if it's needed" one, either.

@scene lf.umi_post
umi: {渡|わた}し{場|ば} の {事務所|じむしょ} です 。{本日|ほんじつ} の {十五時|じゅうごじ} の {便|びん} は 、{出|で}ます 。{本当|ほんとう} に 。|| Ferry office. Today's 15:00 boat will run. Truly.
?(comp=nao) umi: {父|ちち} から 、{返事|へんじ} の {返事|へんじ} が {来|き}ました 。{字|じ} が ひどく {揺|ゆ}れて いて 、{半分|はんぶん} しか {読|よ}めません 。…… それ で いい んです 。|| A reply to my reply came from my father. The writing shakes so badly I can only read half. …That's all right.
?(comp!=nao) umi: {父|ちち} は {灯|ひ} の {道|みち} を {上|のぼ}って いった そう です 。{一度|いちど} 、{会|あ}い に {行|い}って みよう か と {思|おも}って います 。…… {決|き}めて は いません 。{思|おも}って いる だけ 。|| They say my father went up the lantern road. I'm thinking of going to see him once. …I haven't decided. Just thinking.
`, 'ch5/side');
