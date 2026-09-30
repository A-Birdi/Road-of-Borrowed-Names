/* Companionship content, part 3: asking for input (addendum §7.4). At a few authored
 * moments the companion has a question: a discreet note over their head (and a
 * Talk button on the HUD) — never a pop-up. Two or three sincere replies plus
 * Not now; none is an affection test and none changes anything in the story.
 * Each has a context predicate (when), an expiry, and a result-aware follow-up
 * (after) that replaces the question if the player resolves the situation first.
 * Rules: src/engine/58_companion.js refresh()/pending(). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (CC) {
  'use strict';
  CC.invites.push(
    // Saltglass: someone re-labelled the cargo by hand; before Wataru is confronted
    { id: 'inv.sg_hands', when: 'quest.sg_main>=3&!ch2_done', solved: 'sg_wataru_self|sg_wataru_confessed', expire: 'ch2_done',
      scene: 'co.inv_sg_hands', after: 'co.inv_sg_hands_after', title: { jp: '{手|て} で {貼|は}り{替|か}えた ラベル', en: 'Labels changed by hand' } },
    // Cinder Orchard: the kiln's record is found; before the village decides at dusk
    { id: 'inv.co_fire', when: 'quest.co_main>=7&!co_restored', solved: 'co_restored', expire: 'ch3_done',
      scene: 'co.inv_co_fire', after: 'co.inv_co_fire_after', title: { jp: '{痛|いた}い {記憶|きおく}', en: 'A painful memory' } },
    // Lanternfall: a town that can only say "certainly"; before the bell
    { id: 'inv.lf_word', when: 'quest.lf_main>=2&!lf_bell_rung', solved: 'lf_bell_rung', expire: 'ch5_done',
      scene: 'co.inv_lf_word', after: 'co.inv_lf_word_after', title: { jp: '{言|い}えない {言葉|ことば}', en: 'The word you couldn\'t say' } },
  );
})(RB.content.company);

RB.script.add(`
@scene co.inv_sg_hands
?(comp=nao) comp[think]: {誰|だれ} か が {手|て} で ラベル を {貼|は}り{替|か}えた 。 {嵐|あらし} の せい じゃ ない 。 …… {見|み}つけたら 、 あんた は どう したい ？ || Someone swapped those labels by hand. Not the storm. …When we find them, what do you want to happen?
?(comp=mio) comp[worry]: {手|て} で {貼|は}り{替|か}えた ラベル …… {誰|だれ} か 、 {困|こま}って いた の かも しれません 。 {見|み}つけたら 、 どう しましょう か 。 || Labels swapped by hand… Maybe someone was in trouble. When we find them, what should we do?
?(comp=ren) comp[think]: {記録|きろく} を {手|て} で {書|か}き{換|か}えた {人|ひと} が います 。 {見|み}つけた {時|とき} の こと を 、 {先|さき} に {決|き}めて おきたい 。 あなた は どう {思|おも}います か 。 || Someone rewrote the record by hand. I'd like to decide beforehand what we do when we find them. What do you think?
?(comp=suzu) comp[smirk]: {帳簿|ちょうぼ} を いじった {人|ひと} が いる わ ね 。 {数字|すうじ} は {嘘|うそ} を つかない けど 、 {人|ひと} は つく 。 …… {見|み}つけたら 、 どう する ？ || Someone's been fiddling the books. Numbers don't lie, but people do. …When we find them, what do we do?
!choice
* まず {話|はなし} を {聞|き}きたい || I'd hear them out first. -> hear
* {自分|じぶん} で {言|い}って ほしい || I'd want them to own up themselves. -> self
* {港長|こうちょう} に {決|き}めて もらう || The harbourmaster should decide. -> omi
* {今|いま} は いい || Not now. -> later
:hear
?(comp=nao) comp: {理由|りゆう} を {聞|き}く の は {賛成|さんせい} だ 。 {聞|き}いて から 、 {逃|に}げ{道|みち} を {塞|ふさ}ぐ 。 {順番|じゅんばん} の {問題|もんだい} だ な 。 || Hearing the reason first, I'm for. Hear them, then block the exits. It's a matter of order.
?(comp=mio) comp[smile]: よかった 。 {困|こま}って いる {人|ひと} ほど 、 {話|はな}す の に {時間|じかん} が かかります から 。 || Good. The more trouble someone's in, the longer it takes them to talk.
?(comp=ren) comp: {記録|きろく} を {直|なお}す {前|まえ} に 、 {書|か}いた {人|ひと} の {声|こえ} を {聞|き}く 。 {灯守|ひもり} の やり{方|かた} と {同|おな}じ です 。 || Before correcting a record, hear the voice of whoever wrote it. Same as a keeper's way.
?(comp=suzu) comp: {楽屋|がくや} の {話|はなし} を {聞|き}いて から {幕|まく} を {上|あ}げる 、 ね 。 {賛成|さんせい} 。 {嘘|うそ} に は たいてい 、 {事情|じじょう} って いう {前振|まえふ}り が ある の 。 || Hear the backstage story before raising the curtain. Agreed. A lie usually comes with a set-up called "circumstances".
!hook co_answer inv.sg_hands hear
!end
:self
?(comp=nao) comp: {自分|じぶん} で {下|お}ろす {荷物|にもつ} が 、 {一番|いちばん} {軽|かる}く なる 。 …… {俺|おれ} も そう {思|おも}う 。 || A load you set down yourself ends up lightest. …I think so too.
?(comp=mio) comp[think]: {自分|じぶん} で {言|い}えたら 、 その {人|ひと} は {少|すこ}し {楽|らく} に なれる 。 …… でも 、 {無理|むり} に {言|い}わせる の は いや です 。 || If they can say it themselves, it'll be a little easier for them. …But I don't want to force it out of them.
?(comp=ren) comp: {書|か}き{換|か}えた {手|て} で 、 {書|か}き{直|なお}す 。 それ が できれば 、 {一番|いちばん} {正確|せいかく} です 。 || The hand that changed it changes it back. If that's possible, it's the most accurate.
?(comp=suzu) comp[laugh]: {自分|じぶん} で {帳尻|ちょうじり} を {合|あ}わせる の が 、 {一番|いちばん} {利子|りし} が {安|やす}い の よ 。 {経験者|けいけんしゃ} {談|だん} 。 || Balancing your own books costs the least interest. Speaking from experience.
!hook co_answer inv.sg_hands self
!end
:omi
?(comp=nao) comp: {港|みなと} の こと は {港|みなと} が {決|き}める 、 か 。 {筋|すじ} は {通|とお}ってる 。 {俺|おれ} なら 、 {先|さき} に {本人|ほんにん} と {話|はな}す けど な 。 || The harbour decides the harbour's business. Fair enough. I'd talk to them first myself, though.
?(comp=mio) comp: オウミ さん は {厳|きび}しい けど 、 {公平|こうへい} な {方|かた} です 。 {優|やさ}しい だけ で は 、 {港|みなと} は {回|まわ}りません ね 。 || Ōmi is strict, but fair. A harbour can't run on kindness alone.
?(comp=ren) comp: {責任|せきにん} を {持|も}つ {人|ひと} に {預|あず}ける 。 {正|ただ}しい {手順|てじゅん} です 。 …… {冷|つめ}たく {聞|き}こえた なら 、 {私|わたし} の {言|い}い{方|かた} の せい です 。 || Entrust it to whoever's responsible. The correct procedure. …If that sounded cold, blame my phrasing.
?(comp=suzu) comp: {港長|こうちょう} さん に {任|まか}せる の も 、 {立派|りっぱ} な {演出|えんしゅつ} ね 。 {私|わたし} なら 、 {本人|ほんにん} に {台詞|せりふ} を {言|い}わせる けど 。 || Leaving it to the harbourmaster is fine direction too. I'd give them the line to say themselves, though.
!hook co_answer inv.sg_hands omi
!end
:later
?(comp=nao) comp: ん 。 {急|いそ}ぐ {話|はなし} じゃ ない 。 || Mm. No rush.
?(comp=mio) comp[smile]: はい 。 また {今度|こんど} 。 || Of course. Another time.
?(comp=ren) comp: {承知|しょうち} しました 。 {頭|あたま} の {隅|すみ} に {置|お}いて おきます 。 || Understood. I'll keep it in a corner of my mind.
?(comp=suzu) comp: {了解|りょうかい} 。 {次|つぎ} の {幕|まく} で ね 。 || Got it. Next act, then.
!hook co_defer inv.sg_hands

@scene co.inv_sg_hands_after
?(comp=nao&sg_wataru_self) comp: {貼|は}り{替|か}えた の は ワタル だった な 。 {自分|じぶん} で {言|い}い に {行|い}った 。 {自分|じぶん} で {下|お}ろした {荷物|にもつ} だ 。 あれ で よかった と {思|おも}う 。 || It was Wataru who swapped them. He went and said so himself. A load he put down himself. I think that was right.
?(comp=nao&!sg_wataru_self) comp: {貼|は}り{替|か}えた の は ワタル だった な 。 {俺|おれ} たち が {港長|こうちょう} に {話|はな}して 、 あいつ も {黙|だま}って ついて {来|き}た 。 {黙|だま}って いる の を やめた なら 、 {十分|じゅうぶん} だ 。 || It was Wataru who swapped them. We told the harbourmaster, and he followed us in. If he's done keeping quiet, that's enough.
?(comp=mio&sg_wataru_self) comp: ワタル さん 、 {自分|じぶん} の {口|くち} で {言|い}えました ね 。 {手|て} が {震|ふる}えて いた けど 、 {逃|に}げなかった 。 || Wataru managed to say it in his own words. His hands were shaking, but he didn't run.
?(comp=mio&!sg_wataru_self) comp: {私|わたし} たち から {伝|つた}えた こと 、 {正|ただ}しかった と {思|おも}います 。 {一人|ひとり} で {背負|せお}わせる に は 、 {重|おも}すぎる {荷物|にもつ} でした 。 || I think it was right that we told them. That load was too heavy to leave him carrying alone.
?(comp=ren&sg_wataru_self) comp: {書|か}き{換|か}えた {本人|ほんにん} が 、 {自分|じぶん} で {訂正|ていせい} を {申|もう}し{出|で}ました 。 {記録|きろく} と して は 、 {一番|いちばん} {良|よ}い {形|かたち} です 。 || The man who altered it asked to correct it himself. As records go, the best form.
?(comp=ren&!sg_wataru_self) comp: {報告|ほうこく} は {私|わたし} たち が しました 。 {訂正|ていせい} は 、 これから ワタル さん が {自分|じぶん} の {字|じ} で する でしょう 。 || We made the report. The corrections, Wataru will make in his own hand from now on.
?(comp=suzu&sg_wataru_self) comp: {自分|じぶん} で {台詞|せりふ} を {言|い}った わ ね 、 ワタル さん 。 {震|ふる}える {声|こえ} の {台詞|せりふ} は 、 よく {届|とど}く の よ 。 || Wataru said his line himself. A line said in a shaking voice carries.
?(comp=suzu&!sg_wataru_self) comp: {台詞|せりふ} を {代|か}わり に {言|い}う の も 、 {時|とき} に は {必要|ひつよう} 。 {本人|ほんにん} が {舞台|ぶたい} に {立|た}って いれば 、 それ で いい の 。 || Sometimes someone has to say the line for you. As long as he's on the stage, that's enough.
!hook co_done inv.sg_hands

@scene co.inv_co_fire
?(comp=nao) comp[think]: {窯|かま} の {記録|きろく} を {持|も}って {帰|かえ}る 。 {火事|かじ} を {思|おも}い{出|だ}す か どう か は 、 {里|さと} が {決|き}める 。 …… あんた なら 、 {取|と}り{戻|もど}したい か ？ {自分|じぶん} の {痛|いた}い {記憶|きおく} でも 。 || We're taking the kiln's record back. Whether they remember the fire is the village's to decide. …Would you want it back? A painful memory of your own?
?(comp=mio) comp[think]: {痛|いた}い {記憶|きおく} を {取|と}り{戻|もど}す の は 、 {苦|にが}い {薬|くすり} を {飲|の}む の に {似|に}て います 。 …… あなた なら 、 {飲|の}みます か 。 || Taking back a painful memory is like swallowing bitter medicine. …Would you take it?
?(comp=ren) comp[think]: {記録|きろく} を {返|かえ}せば 、 {里|さと} は {火事|かじ} を {思|おも}い{出|だ}す 。 {悲|かな}しみ も {一緒|いっしょ} に 。 …… {自分|じぶん} の こと なら 、 あなた は {取|と}り{戻|もど}したい です か 。 || If the record goes back, the village remembers the fire. The grief with it. …If it were yours, would you want it back?
?(comp=suzu) comp[closed]: {二十年|にじゅうねん} {分|ぶん} の {忘|わす}れ{物|もの} を {返|かえ}し に {行|い}く の ね 。 …… ねえ 、 あなた なら 、 {返|かえ}して ほしい ？ {痛|いた}い {記憶|きおく} でも 。 || We're going to return twenty years of lost property. …Tell me — would you want yours back? Even a painful memory?
!choice
* {取|と}り{戻|もど}したい 。 {痛|いた}くて も || Yes — even if it hurts. -> yes
* {自分|じぶん} で {選|えら}びたい || I'd want to be the one who chooses. -> choose
* {分|わ}からない || I honestly don't know. -> unsure
* {今|いま} は いい || Not now. -> later
:yes
?(comp=nao) comp: …… {重|おも}くて も {自分|じぶん} の {荷物|にもつ} 、 か 。 {俺|おれ} も たぶん 、 そう {言|い}う 。 || …Your own load, even if it's heavy. I'd probably say the same.
?(comp=mio) comp: {苦|にが}い {薬|くすり} でも 、 {効|き}く なら 。 …… でも 、 {一人|ひとり} で {飲|の}ませたく は ありません 。 || Bitter medicine, if it works. …But I wouldn't want you to swallow it alone.
?(comp=ren) comp[closed]: …… そう です か 。 {私|わたし} は 、 まだ {答|こた}え を {出|だ}せて いません 。 {師匠|ししょう} の {顔|かお} の こと に なる と 。 || …I see. I still haven't found my answer. Not when it comes to my teacher's face.
?(comp=suzu) comp: {痛|いた}い {台詞|せりふ} を {台本|だいほん} から {削|けず}ったら 、 {芝居|しばい} に ならない もの ね 。 || Cut the painful lines from a script and it isn't a play any more.
!hook co_answer inv.co_fire yes
!end
:choose
?(comp=nao) comp: {聞|き}かれ も せず に {持|も}って いかれる の が 、 {一番|いちばん} {腹|はら} が {立|た}つ 。 {分|わ}かる よ 。 || Having it taken without being asked — that's what makes me angriest. I get it.
?(comp=mio) comp[smile]: {選|えら}べる こと が 、 {一番|いちばん} {大事|だいじ} です よね 。 {薬|くすり} も 、 {飲|の}む か どう か は {患者|かんじゃ} さん が {決|き}める もの です 。 || Being able to choose matters most. With medicine too, the patient decides whether to take it.
?(comp=ren) comp: {預|あず}ける の も 、 {取|と}り{戻|もど}す の も 、 {本人|ほんにん} が {選|えら}ぶ 。 {灯守|ひもり} の {心得|こころえ} に {加|くわ}えたい {一行|いちぎょう} です 。 || Setting it down and taking it back — the person chooses both. A line I'd like to add to the keepers' rules.
?(comp=suzu&quest.co_suzu>=1) comp[sad]: {配役|はいやく} は {本人|ほんにん} に {選|えら}ばせろ 、 か 。 …… {私|わたし} が {二十年前|にじゅうねんまえ} に {忘|わす}れた こと ね 。 || Let people choose their own part. …The thing I forgot twenty years ago.
?(comp=suzu&!quest.co_suzu>=1) comp: {配役|はいやく} は {本人|ほんにん} に {選|えら}ばせる 。 {演出家|えんしゅつか} の {基本|きほん} よ 。 || Let people choose their own part. A director's first rule.
!hook co_answer inv.co_fire choose
!end
:unsure
?(comp=nao) comp: {分|わ}からない 、 で いい ん じゃ ない か 。 {即答|そくとう} できる {奴|やつ} の ほう が {怪|あや}しい 。 || "I don't know" is fine. Anyone who answers that straight off is suspect.
?(comp=mio) comp: {分|わ}からない の が 、 {普通|ふつう} だ と {思|おも}います 。 {私|わたし} も 、 {分|わ}かりません 。 || Not knowing seems normal to me. I don't know either.
?(comp=ren) comp: {分|わ}からない 、 と {言|い}える の は {正確|せいかく} です 。 {私|わたし} も 、 {同|おな}じ {欄|らん} に {丸|まる} を つけます 。 || Being able to say "I don't know" is accurate. I'd tick the same box.
?(comp=suzu) comp[smile]: {分|わ}からない 。 {正直|しょうじき} な {答|こた}え ね 。 {客席|きゃくせき} で {一番|いちばん} {多|おお}い {答|こた}え でも ある わ 。 || "I don't know." An honest answer. The most common one in any audience, too.
!hook co_answer inv.co_fire unsure
!end
:later
?(comp=nao) comp: ん 。 {祭|まつ}り の {前|まえ} に {重|おも}い {話|はなし} も な 。 || Mm. Heavy talk before a festival, anyway.
?(comp=mio) comp[smile]: はい 。 お{茶|ちゃ} でも {飲|の}み ながら 、 また 。 || Of course. Over a cup of tea, some other time.
?(comp=ren) comp: {分|わ}かりました 。 {急|いそ}ぐ {話|はなし} で は ありません 。 || Understood. It isn't urgent.
?(comp=suzu) comp: {幕間|まくあい} に また {聞|き}く わ 。 || I'll ask again in the interval.
!hook co_defer inv.co_fire

@scene co.inv_co_fire_after
?(comp=nao) comp: {里|さと} は {思|おも}い{出|だ}す {方|ほう} を {選|えら}んだ 。 {誰|だれ} か に {決|き}められた ん じゃ なく 、 {自分|じぶん} たち で 。 …… それ が {一番|いちばん} {大事|だいじ} だ 。 || The village chose to remember. Not decided for them — by themselves. …That's what matters most.
?(comp=mio) comp: {皆|みな} さん 、 {泣|な}いて いた けど 、 {顔色|かおいろ} は {悪|わる}く なかった です 。 {痛|いた}み を {取|と}り{戻|もど}す の も 、 {治|なお}る {途中|とちゅう} なん です ね 。 || People were crying, but their colour wasn't bad. Taking back the pain is part of healing too.
?(comp=ren) comp: {預|あず}けた {人|ひと} たち が 、 {自分|じぶん} で {取|と}り{戻|もど}す と {決|き}めた 。 …… {覚|おぼ}えて おきます 。 {自分|じぶん} の {番|ばん} が {来|き}た {時|とき} の ため に 。 || The people who gave it up decided to take it back themselves. …I'll remember that. For when my own turn comes.
?(comp=suzu) comp[smile]: {二十年|にじゅうねん} {遅|おく}れ の {幕|まく} が 、 やっと {上|あ}がった わ 。 {客|きゃく} は {泣|な}いて 、 {笑|わら}って 。 …… いい {舞台|ぶたい} だった 。 || The curtain finally went up, twenty years late. The audience cried and laughed. …A good show.
!hook co_done inv.co_fire

@scene co.inv_lf_word
?(comp=nao) comp[think]: この {町|まち} で は 、 {誰|だれ} も 「 いいえ 」 と {言|い}えない 。 …… あんた が {一日|いちにち} 「 かしこまりました 」 しか {言|い}えなかったら 、 {何|なに} が {一番|いちばん} {困|こま}る ？ || Nobody in this town can say "no". …If you could only say "certainly" for a day, what would you miss most?
?(comp=mio) comp[think]: 「 かしこまりました 」 しか {言|い}えない {一日|いちにち} を {想像|そうぞう} して いました 。 …… あなた なら 、 {何|なに} が {言|い}えなくて {一番|いちばん} {困|こま}ります か 。 || I've been imagining a day when all I could say was "certainly". …For you, what would be hardest not to be able to say?
?(comp=ren) comp[think]: {言葉|ことば} を {一|ひと}つ {取|と}られた {町|まち} です 。 …… もし {一|ひと}つ だけ {守|まも}れる と したら 、 あなた は どの {言葉|ことば} を {守|まも}ります か 。 || A town that's had one word taken. …If you could keep just one, which word would you keep?
?(comp=suzu) comp: 「 かしこまりました 」 だけ の {台本|だいほん} 。 {私|わたし} なら {三日|みっか} で {逃|に}げる わ 。 …… あなた は ？ {一番|いちばん} {言|い}えなくて {困|こま}る {台詞|せりふ} 、 {何|なに} ？ || A script that only says "certainly". I'd run away in three days. …And you? Which line would you miss most?
!choice
* 「 いいえ 」 || "No." -> no
* 「 {分|わ}からない 」 || "I don't know." -> dunno
* 「 {待|ま}って 」 || "Wait." -> wait
* {今|いま} は いい || Not now. -> later
:no
?(comp=nao) comp: だろう な 。 {断|ことわ}れない {返事|へんじ} は 、 {返事|へんじ} じゃ ない 。 || Figures. A reply you can't refuse isn't a reply.
?(comp=mio) comp[sad]: {私|わたし} も です 。 …… {言|い}える {町|まち} に いた {時|とき} も 、 {私|わたし} は {言|い}えなかった けど 。 || Me too. …Though even where I could say it, I never did.
?(comp=ren) comp[smirk]: 「 いいえ 」 。 {師匠|ししょう} が {一番|いちばん} よく {使|つか}った {言葉|ことば} です 。 {私|わたし} に {向|む}かって 、 {毎日|まいにち} 。 || "No." My teacher's favourite word. Aimed at me, every day.
?(comp=suzu) comp: 「 いいえ 」 が ない {芝居|しばい} は 、 {山場|やまば} が ない の 。 {誰|だれ} も ぶつからない から 。 || A play without "no" has no climax. Nobody ever clashes.
!hook co_answer inv.lf_word no
!end
:dunno
?(comp=nao) comp: {分|わ}からない 、 か 。 それ が {言|い}えない と 、 {分|わ}かった ふり を する しか ない 。 {一番|いちばん} {危|あぶ}ない {道|みち} だ 。 || "I don't know." Without it, you can only pretend you do. The most dangerous road there is.
?(comp=mio) comp: 「 {分|わ}からない 」 が {言|い}えない お{医者|いしゃ} さん は 、 {怖|こわ}い です 。 {薬師|くすし} も {同|おな}じ です ね 。 || A doctor who can't say "I don't know" is frightening. Apothecaries too.
?(comp=ren) comp: 「 {不明|ふめい} 」 と {正直|しょうじき} に {書|か}く 。 {記録係|きろくがかり} の {一番|いちばん} {大事|だいじ} な {仕事|しごと} です 。 || Writing "unknown" honestly. The most important job a record-keeper has.
?(comp=suzu) comp[smile]: 「 {分|わ}からない 」 。 {台本|だいほん} に は {書|か}けない けど 、 {一番|いちばん} {正直|しょうじき} な {台詞|せりふ} よ 。 || "I don't know." You can't write it into a script, but it's the most honest line there is.
!hook co_answer inv.lf_word dunno
!end
:wait
?(comp=nao) comp[smirk]: 「 {待|ま}って 」 。 …… {配達人|はいたつにん} に は {耳|みみ} の {痛|いた}い {言葉|ことば} だ な 。 でも 、 {確|たし}か に {要|い}る 。 || "Wait." …Not a word couriers like hearing. But you do need it.
?(comp=mio) comp: 「 {待|ま}って 」 。 {急|いそ}ぐ {人|ひと} を {止|と}める {言葉|ことば} 。 {薬|くすり} より {効|き}く {時|とき} が あります 。 || "Wait." A word that stops people rushing. Sometimes it works better than medicine.
?(comp=ren) comp: 「 {待|ま}って 」 。 …… {道|みち} に {迷|まよ}う {前|まえ} に 、 {私|わたし} に {言|い}って ほしい {言葉|ことば} です 。 || "Wait." …A word I'd like said to me before I get lost.
?(comp=suzu) comp: 「 {待|ま}って 」 。 {幕|まく} を {下|お}ろす {前|まえ} に {言|い}う {台詞|せりふ} ね 。 {言|い}えない と 、 {芝居|しばい} は {勝手|かって} に {終|お}わる 。 || "Wait." The line before the curtain comes down. Without it, the play just ends on its own.
!hook co_answer inv.lf_word wait
!end
:later
?(comp=nao) comp: ん 。 {鐘|かね} の {後|あと} でも いい 。 || Mm. After the bell's fine too.
?(comp=mio) comp: はい 。 {急|いそ}ぎません 。 || Of course. There's no hurry.
?(comp=ren) comp: {承知|しょうち} しました 。 || Understood.
?(comp=suzu) comp: {了解|りょうかい} 。 {次|つぎ} の {場|ば} で 。 || Got it. Next scene.
!hook co_defer inv.lf_word

@scene co.inv_lf_word_after
?(comp=nao) comp: {鐘|かね} が {鳴|な}って 、 {町|まち} {中|じゅう} 「 いいえ 」 だらけ だ 。 …… {断|ことわ}れる {相手|あいて} に なら 、 {渡|わた}せる もの も ある 。 || Since the bell, the whole town is full of "no". …To someone who can refuse, there are things you can finally hand over.
?(comp=mio&quest.lf_mio=done) comp[smile]: {町|まち} も {私|わたし} も 、 {断|ことわ}れる よう に なりました ね 。 || The town and I can both say no now.
?(comp=mio&!quest.lf_mio=done) comp: {断|ことわ}れる {町|まち} に 、 {戻|もど}りました ね 。 …… {私|わたし} も 、 {練習|れんしゅう} しない と 。 || The town can refuse again. …I ought to practise too.
?(comp=ren) comp: {言葉|ことば} が {一|ひと}つ 、 {町|まち} に {帰|かえ}って きました 。 {灯|あか}り の {名前|なまえ} が {戻|もど}る の と 、 {同|おな}じ {音|おと} が しました 。 || One word has come home to the town. It sounded just like a lantern's name coming back.
?(comp=suzu) comp[laugh]: {鐘|かね} の {後|あと} の {野次|やじ} 、 {聞|き}いた ？ {最高|さいこう} の {初日|しょにち} だった わ 。 || Did you hear the heckling after the bell? The best opening night there is.
!hook co_done inv.lf_word
`, 'company/30_invites');
