/* Manybridge, Chapter 4: the side content's scenes (expansion P09). The census continued (three plaques; Sen keeps
 * the register), A Ghostwriter's Debt (Shinobu, Ryūsui; the encounter is in 35_ghost.js), The Apprentice Printer
 * (Miyo; Sōbē), and Kansuke's new riddles. The language is in 15_side.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // the people elsewhere who take part: Sen (the census), Sōbē (the apprentice), Kanta (the ghostwriter's evidence)
  const npcIn = (id) => { for (const m in C.maps) { const n = (C.maps[m].npcs || []).find((x) => x.id === id && Array.isArray(x.talk)); if (n) return n; } return null; };
  const sen = npcIn('mb_sen');
  if (sen) {
    const at = sen.talk.findIndex((t) => t.scene === 'mb.sen_after');
    sen.talk.splice(at < 0 ? 0 : at, 0,
      { if: 'quest.mp_census=1', scene: 'mp.census_done' },
      { if: 'ed>=2&mb1_done&!quest.mp_census', scene: 'mp.census_start' });
  }
  const sobe = npcIn('mp_sobe');
  if (sobe) sobe.talk.unshift({ if: 'quest.mp_apprentice=1', scene: 'mp.sobe_miyo' });
  const kanta = npcIn('mp_kanta');
  if (kanta) kanta.talk.unshift({ if: 'quest.mp_ghost=1&!mp_ghost_kanta', scene: 'mp.ghost_kanta' });
})(RB.content);

RB.script.add(`
# ---- the census, continued: Blockprint and Playhouse Rows' plaques ----
@scene mp.census_start
!faceplayer
mb_sen: {版木|はんぎ} の {通|とお}り と {芝居|しばい} の {通|とお}り に も 、 {名前|なまえ} の {消|き}えた {橋|はし} の {札|ふだ} が {三|みっ}つ あります 。 {帳面|ちょうめん} の {続|つづ}き 、 お{願|ねが}い できます か 。 || Blockprint Row and Playhouse Row have three bridge plaques gone blank too. Could you help me with the rest of the register?
!quest mp_census start
mb_sen: {名前|なまえ} は 、 {近|ちか}く の {人|ひと} が {覚|おぼ}えて います 。 {札|ふだ} を {見|み}たら 、 {周|まわ}り の {人|ひと} の {話|はなし} を {聞|き}いて ください 。 || The people nearby remember the names. When you see a plaque, listen to what the people around it say.

@scene mp.census_done
!faceplayer
mb_sen: {三|みっ}つ とも ！ これ で 、 {帳面|ちょうめん} の {続|つづ}き も {埋|う}まりました 。 || All three! That fills in the rest of the register.
mb_sen: お{礼|れい} に 、 {刷|す}り{場|ば} で {刷|す}った {町|まち} の {刷|す}り{物|もの} です 。 {橋|はし} の {名前|なまえ} が 、 {一|ひと}つ {残|のこ}らず {入|はい}って います 。 || As thanks, a print of the city from the press room. Every bridge has its name on it.
!quest mp_census done
!journal {版木|はんぎ} と {芝居|しばい} の {通|とお}り の {橋|はし} の {名前|なまえ} を 、 セン に {届|とど}けた 。 || Took the names of Blockprint and Playhouse Rows' bridges to Sen.

@scene mp.plaque_hangi
?(mb_pl_hangi) narr: {橋|はし} の {札|ふだ} に 、 「{版木橋|はんぎばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Woodblock Bridge."
?(mb_pl_hangi) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mp_census) !end
narr: {近|ちか}く で 、 カンタ が {版木|はんぎ} を {抱|かか}えて {渡|わた}って いく 。 || Nearby, Kanta goes over the bridge with an armful of woodblocks.
!challenge mb.census_hangi
!set mb_pl_hangi
!var mp_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mp_census>=3) !quest mp_census 1

@scene mp.plaque_sumi
?(mb_pl_sumi) narr: {橋|はし} の {札|ふだ} に 、 「{墨橋|すみばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Ink Bridge."
?(mb_pl_sumi) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mp_census) !end
narr: {橋|はし} の {下|した} の {水|みず} が 、 {黒|くろ}く {濁|にご}って いる 。 {飛脚|ひきゃく} の カケル が {走|はし}って {来|き}て 、 {何|なに} か {言|い}った 。 || The water under the bridge is cloudy black. Kakeru the courier runs up and says something.
!challenge mb.census_sumi
!set mb_pl_sumi
!var mp_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mp_census>=3) !quest mp_census 1

@scene mp.plaque_maku
?(mb_pl_maku) narr: {橋|はし} の {札|ふだ} に 、 「{幕橋|まくばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Curtain Bridge."
?(mb_pl_maku) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mp_census) !end
narr: {欄干|らんかん} に 、 {大|おお}きな {布|ぬの} を {干|ほ}した {跡|あと} が ある 。 {太鼓|たいこ} の ハヤシ が 、 {岸|きし} から {声|こえ} を かけて きた 。 || The railing has the marks of a great cloth hung to dry. Hayashi the drummer calls out from the bank.
!challenge mb.census_maku
!set mb_pl_maku
!var mp_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mp_census>=3) !quest mp_census 1

# ---- A Ghostwriter's Debt ----
@scene mp.shinobu_first
!faceplayer
?(mp_ghost_heard) mp_shinobu: …… {証拠|しょうこ} が なければ 、 {誰|だれ} も {信|しん}じない わ 。 || …Without evidence, nobody will believe it.
?(mp_ghost_heard) !end
narr: {狭|せま}い {部屋|へや} 。 {机|つくえ} に も {床|ゆか} に も 、 {原稿|げんこう} が {積|つ}んで ある 。 || A cramped room. Manuscripts are stacked on the desk and the floor.
mp_shinobu: …… {人気作家|にんきさっか} の リュウスイ の {本|ほん} 、 {読|よ}んだ こと が ある ？ あれ は 、 {全部|ぜんぶ} わたし が {書|か}いた の 。 || …Have you read Ryūsui, the popular author? I wrote all of it.
mp_shinobu: {十年|じゅうねん} {前|まえ} 、 {家|いえ} の {借金|しゃっきん} を あの {人|ひと} が {払|はら}って くれた 。 その {代|か}わり に 、 わたし の {話|はなし} は {全部|ぜんぶ} 、 あの {人|ひと} の {名前|なまえ} で {出|で}る 。 || Ten years ago he paid off my family's debt. In return, every story of mine goes out under his name.
mp_shinobu: {今|いま} 、 {本|ほん} から {作者|さくしゃ} の {名前|なまえ} が {消|き}えて いる でしょう 。 でも わたし の {名前|なまえ} は 、 {最初|さいしょ} から どこ に も ない 。 {消|き}える {前|まえ} に 、 {一度|いちど} で いい から 、 {書|か}いて ほしい の 。 || The authors' names are fading from the books now. But mine was never on them to begin with. Before it fades for good, I'd like it written down. Just once.
?(comp=nao) comp[angry]: {差出人|さしだしにん} を {書|か}かない {手紙|てがみ} は 、 {届|とど}いて も {返事|へんじ} が {来|こ}ない 。 …… {十年|じゅうねん} も か 。 || A letter with no sender's name gets no reply, even when it arrives. …For ten years.
?(comp=mio) comp[angry]: {十年|じゅうねん} も …… 。 {借金|しゃっきん} の {返|かえ}し{方|かた} に して は 、 {長|なが}すぎます 。 || Ten years… That's far too long to be paying off a debt.
?(comp=ren) comp: {書|か}かれない {名前|なまえ} は 、 {一番|いちばん} {先|さき} に {消|き}えます 。 {急|いそ}ぎましょう 。 || A name that's never written is the first to fade. We should hurry.
?(comp=suzu) comp[angry]: {番付|ばんづけ} に {名前|なまえ} の ない {役者|やくしゃ} と {同|おな}じ ね 。 {舞台|ぶたい} に は {立|た}って いる のに 。 || Like an actor left off the playbill. On stage all the same.
mp_shinobu: {証拠|しょうこ} が なければ 、 {誰|だれ} も {信|しん}じない わ 。 {机|つくえ} の {原稿|げんこう} を {見|み}て 。 それ から 、 {刷|す}り{場|ば} の {子|こ} が 、 {何|なに} か {覚|おぼ}えて いる かも 。 || Without evidence nobody will believe it. Look at the manuscripts on my desk. And the boy at the press might remember something.
!set mp_ghost_heard
!quest mp_ghost start
!quest mp_ghost 1 quiet
!journal シノブ の {話|はなし} を {聞|き}いた 。 {証拠|しょうこ} を {集|あつ}めて 、 リュウスイ と {話|はな}す 。 || Heard Shinobu out. Gather the evidence, then talk to Ryūsui.

@scene mp.manuscripts
?(!quest.mp_ghost) narr: {原稿|げんこう} の {山|やま} 。 {几帳面|きちょうめん} な {字|じ} で 、 {一枚|いちまい} ずつ {日付|ひづけ} が {入|はい}って いる 。 || A heap of manuscripts, each page dated in a careful hand.
?(!quest.mp_ghost) !end
?(item.mp_manuscript|quest.mp_ghost=done) narr: {原稿|げんこう} の {山|やま} 。 {一番|いちばん} {大事|だいじ} な {一束|ひとたば} は 、 あなた が {預|あず}かって いる 。 || The heap of manuscripts. The bundle that matters most, you have.
?(item.mp_manuscript|quest.mp_ghost=done) !end
narr: {一番|いちばん} {上|うえ} の {束|たば} に 、 {題|だい} が ある 。 リュウスイ の {一番|いちばん} {売|う}れた {本|ほん} と 、 {同|おな}じ {題|だい} だ 。 || The top bundle has a title on it: the same title as Ryūsui's best-selling book.
!challenge mp.ghost_date
!if var._res=0 -> later
mp_shinobu: …… {持|も}って いって 。 わたし が {持|も}って いて も 、 {誰|だれ} も {見|み}ない から 。 || …Take it. While I keep it, nobody sees it.
!give mp_manuscript
:later

@scene mp.ghost_kanta
!faceplayer
mp_kanta: リュウスイ さん の {原稿|げんこう} ？ {持|も}って {来|く}る の は 、 いつ も シノブ さん です よ 。 リュウスイ さん は 、 {刷|す}り{場|ば} に {来|き}た こと が ない です 。 || Ryūsui's manuscripts? Shinobu always brings them. Ryūsui's never once been to the press.
mp_kanta: {親方|おやかた} は 、 {知|し}って いて {黙|だま}って いる みたい だけど 。 || The master knows and keeps quiet about it, I think.
!set mp_ghost_kanta
!journal カンタ は 、 {原稿|げんこう} を {持|も}って {来|く}る の は いつ も シノブ だ と {言|い}った 。 || Kanta says it is always Shinobu who brings the manuscripts.

@scene mp.shinobu_evidence
!faceplayer
?(!item.mp_manuscript) mp_shinobu: {机|つくえ} の {原稿|げんこう} 、 {見|み}て くれた ？ {日付|ひづけ} が {入|はい}って いる の 。 || Did you look at the manuscripts on my desk? They're dated.
?(!mp_ghost_kanta) mp_shinobu: {刷|す}り{場|ば} の カンタ くん に も 、 {聞|き}いて みて 。 || Ask Kanta at the press, too.
?(item.mp_manuscript&mp_ghost_kanta) mp_shinobu: …… リュウスイ の {家|いえ} は 、 {通|とお}り の {向|む}こう 。 わたし も {行|い}く わ 。 {怖|こわ}い けど 。 || …Ryūsui's house is across the street. I'll come too. I'm scared, but I'll come.

@scene mp.ryusui
!faceplayer
!if quest.mp_ghost=1&item.mp_manuscript&mp_ghost_kanta -> meet
?(mp_ghost_broker) mp_ryusui: {直|なお}す ところ を {言|い}う の は 、 {書|か}く より {易|やさ}しい 。 …… {少|すこ}し だけ な 。 || Saying what to fix is easier than writing. …A little.
?(mp_ghost_broker) !end
mp_ryusui: …… {何|なん} の {用|よう} だ 。 {私|わたし} は {忙|いそが}しい 。 {次|つぎ} の {本|ほん} を {書|か}いて いる ところ で ね 。 || …What do you want? I'm busy. I'm in the middle of writing my next book.
!end
:meet
!call mp.ryusui_meet

@scene mp.ryusui_meet
# Staged: Ryūsui at his door, a pen in his hand with no ink on it; Shinobu comes across the street and stands a step
# behind you.
narr: シノブ が {通|とお}り を {渡|わた}って きて 、 あなた の {後|うし}ろ に {立|た}った 。 || Shinobu comes across the street and stands behind you.
mp_ryusui: …… {何|なん} の {用|よう} だ 。 {私|わたし} は {忙|いそが}しい 。 {次|つぎ} の {本|ほん} を {書|か}いて いる ところ で ね 。 || …What do you want? I'm busy. I'm in the middle of writing my next book.
!encounter mp.ghost
!call mp.ghost_after

@scene mp.ghost_after
?(mp_ghost_broker) mp_shinobu: {二人|ふたり} の {名前|なまえ} …… 。 わたし の {名前|なまえ} が 、 {本|ほん} に {載|の}る 。 ありがとう 。 || Both names… My name, in a book. Thank you.
?(mp_ghost_exposed) mp_shinobu: …… {皆|みな} が 、 {知|し}って しまった 。 これ で よかった の か 、 まだ {分|わ}からない 。 でも 、 {次|つぎ} の {本|ほん} に は 、 わたし の {名前|なまえ} が {入|はい}る 。 || …Everyone knows now. I don't know yet whether that was right. But the next book will have my name on it.
?(!mp_ghost_broker&!mp_ghost_exposed) mp_shinobu: …… また {今度|こんど} に しましょう 。 {原稿|げんこう} は 、 {逃|に}げない から 。 || …Let's try another time. The manuscripts aren't going anywhere.
?(!mp_ghost_broker&!mp_ghost_exposed) !end
!quest mp_ghost done
?(mp_ghost_broker) !journal シノブ と リュウスイ の {名前|なまえ} が 、 {次|つぎ} の {本|ほん} に {並|なら}ぶ こと に なった 。 || Shinobu's and Ryūsui's names will stand side by side on the next printing.
?(mp_ghost_exposed) !journal {芝居|しばい} の {通|とお}り の {皆|みな} が 、 {本当|ほんとう} の {作者|さくしゃ} を {知|し}った 。 リュウスイ は {家|いえ} から {出|で}て こない 。 || All of Playhouse Row knows who really wrote the books. Ryūsui does not come out of his house.

@scene mp.shinobu_after
!faceplayer
?(mp_ghost_broker) mp_shinobu: リュウスイ さん が 、 {毎朝|まいあさ} {来|き}て 、 わたし の {原稿|げんこう} を {読|よ}む の 。 {直|なお}す ところ を {言|い}って くれる 。 {十年|じゅうねん} {前|まえ} は 、 いい {作家|さっか} だった の よ 。 || Ryūsui comes every morning and reads my pages. He tells me what to fix. He was a good writer, ten years ago.
?(mp_ghost_exposed) mp_shinobu: {本屋|ほんや} の {人|ひと} が 、 わたし の {名前|なまえ} を {覚|おぼ}えて くれた 。 …… リュウスイ さん は 、 {町|まち} を {出|で}て いった わ 。 {手紙|てがみ} を {一通|いっつう} だけ {残|のこ}して 。 || The booksellers know my name now. …Ryūsui has left the city. He left just one letter.
?(!mp_ghost_broker&!mp_ghost_exposed) mp_shinobu: {書|か}いて いる わ 。 {名前|なまえ} は まだ ない けど 。 || I'm writing. Still without a name on it.

# ---- The Apprentice Printer ----
@scene mp.miyo_first
!faceplayer
?(!mp_miyo_met) mp_miyo: お{兄|にい}ちゃん の カンタ は 、 {刷|す}り{場|ば} で {働|はたら}いて いる の 。 わたし も {刷|す}り{師|し} に なりたい 。 でも {親方|おやかた} は 、 「まだ {早|はや}い」 って 。 || My brother Kanta works at the press. I want to be a printer too. But the master says I'm too young.
?(!mp_miyo_met) mp_miyo: …… {活字|かつじ} の {並|なら}べ{方|かた} 、 {教|おし}えて くれる ？ {組|く}めたら 、 {親方|おやかた} に {見|み}せる の ！ || …Will you show me how type is set? If I can set a forme, I'll show the master!
?(!mp_miyo_met) !quest mp_apprentice start
?(!mp_miyo_met) !set mp_miyo_met
?(!quest.mp_apprentice) !quest mp_apprentice start
!choice
* {教|おし}えて あげる 。 || I'll show you. -> teach
* また {今度|こんど} 。 || Another time. -> end
:teach
!challenge mp.miyo_teach
!if var._res=0 -> end
narr: ミヨ は {言|い}われた とおり に 、 {活字|かつじ} を {一|ひと}つ ずつ {拾|ひろ}って 、 {小|ちい}さな {版|はん} を {組|く}んだ 。 || Miyo does exactly as you said: picks the type one piece at a time and sets a small forme.
mp_miyo: できた ！ {親方|おやかた} に {見|み}せて きて ！ わたし が {持|も}って いく と 、 {叱|しか}られる から 。 || Done! Take it to the master! If I take it, I'll get told off.
!quest mp_apprentice 1
:end

@scene mp.miyo_teach
!faceplayer
mp_miyo: {親方|おやかた} に 、 {見|み}せて くれた ？ {仕事場|しごとば} に いる よ 。 || Did you show the master? He's in the workshop.

@scene mp.sobe_miyo
!faceplayer
narr: ミヨ の {組|く}んだ {版|はん} を 、 {宗兵衛|そうべえ} に {見|み}せた 。 || You show Sōbē the forme Miyo set.
mp_sobe: …… {行|ぎょう} が {揃|そろ}って いる 。 {逆|さか}さま も {正|ただ}しい 。 {誰|だれ} が {組|く}んだ ？ || …The lines are even. The type is the right way round, backwards. Who set this?
mp_sobe: ミヨ か 。 {教|おし}えた の は 、 あんた だ な 。 {教|おし}え{方|かた} が いい 。 {説明|せつめい} が {正|ただ}しい と 、 {手|て} も {正|ただ}しく {動|うご}く 。 || Miyo. And you taught her. You teach well: when the explanation is right, the hands move right.
mp_sobe: {明日|あした} から 、 {刷|す}り{場|ば} に {来|こ}い と {言|い}って くれ 。 カンタ の {隣|となり} で 。 || Tell her to come to the press from tomorrow. Next to Kanta.
!quest mp_apprentice done
!journal ミヨ は {刷|す}り{場|ば} の {見習|みなら}い に なった 。 || Miyo is an apprentice at the press now.

@scene mp.miyo_after
!faceplayer
mp_miyo: {明日|あした} から 、 {刷|す}り{場|ば} ！ お{兄|にい}ちゃん より 、 {早|はや}く {組|く}める よう に なる ！ || The press, from tomorrow! I'm going to set type faster than my brother!
`, 'mp/24_scenes_side.js');
