/* Steamhollow, Chapter 11: the mediation, the agreement and 全体 (expansion P13e; docs/future/work/P13_STEAMHOLLOW.md;
 * plan R3 "a mediation encounter rather than a fight", E8, A17; sealed S4). The morning after the Kettle settles,
 * Rokubei brings the Upper House, the Lower House and the guild to the long table, with Aki speaking for the spring.
 * The encounter (yn.mediation, 31_encounters.js) has several authored ends and none is a defeat; the better ones keep
 * the disagreement honest rather than pretending it away (S4: the mediation rehearses the final chapter's question, how
 * to keep promises among people who disagree). Then the agreement written together, in words you help choose
 * (yn.agreement, 30_learning.js), and 全体: the valley agrees as a whole (the chapter's growth, taught here, C-74).
 * That evening the town is out in yukata (27_scenes_comp.js: the walk, the quiet confession, the vow), and the chapter
 * ends with the north road open. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // that evening, stepping out of the hall into the street: the walk and the end
  const up = C.maps['yn.upper'];
  if (up) up.onEnter = (up.onEnter || []).concat([{ scene: 'yn.walk', if: 'yn_mediated&!yn_done' }]);
})(RB.content);

RB.script.add(`
@scene yn.mediation_start
# Morning at the guild hall. Everyone at the long table; the town at the door. Rokubei asks you to lead it.
!faceplayer
yn_rokubei: {皆|みな} 、 {集|あつ}まった 。 {上|かみ}の{湯|ゆ} 、 {下|しも}の{湯|ゆ} 、 {湯守|ゆもり} 。 {湯|ゆ} の {代|か}わり に は 、 アキ が {座|すわ}る 。 {湯|ゆ} の {顔色|かおいろ} が {分|わ}かる の は 、 あいつ だけ だ 。 || Everyone's here. The Upper House, the Lower House, the bath-keepers. Aki sits in for the spring. She's the only one who can read its face.
yn_rokubei: {俺|おれ} は {湯守|ゆもり} だ から 、 {中立|ちゅうりつ} に は なれない 。 …… {話|はなし} の {舵|かじ} を 、 {取|と}って くれない か 。 || I'm a bath-keeper, so I can't be neutral. …Would you take the helm of the talk?
?(comp=nao&yn_nao_madeup) comp: {全員|ぜんいん} に {言|い}わせて やれ 。 {最後|さいご} まで 。 …… {昨日|きのう} {言|い}った こと は 、 {取|と}り{消|け}す 。 || Let every one of them have their say. All the way. …What I said yesterday, I take back.
?(comp=mio) comp[smile]: {大丈夫|だいじょうぶ} 。 {断|ことわ}る の も 、 {聞|き}く の も 、 {練習|れんしゅう} して きました から 。 {隣|となり} に います 。 || It's all right. I've practiced saying no, and listening. I'm right beside you.
?(comp=ren&yn_ren_madeup) comp[smile]: {一番|いちばん} {古|ふる}い {名前|なまえ} と 、 {一番|いちばん} {新|あたら}しい {名前|なまえ} 。 {両方|りょうほう} を {同|おな}じ {灯|ひ} に 。 || The oldest name and the newest. Both on the same lamp.
?(comp=suzu) comp[smirk]: {幕|まく} が {上|あ}がる わ 。 {台本|だいほん} は ない けど 、 {客|きゃく} は {本気|ほんき} よ 。 || Curtain up. There's no script, but the audience means it.
!encounter yn.mediation
!set yn_mediated
?(var._enc=together) !set yn_med_together
?(var._enc=measured) !set yn_med_measured
?(var._enc=open) !set yn_med_open
?(var._enc=adjourned) !set yn_med_adjourned
?(var._enc=walked_out) !set yn_med_adjourned
!call yn.agreement_write
!call yn.zentai
!quest yn_main 7
!journal {二|ふた}つ の {宿|やど} と {湯守|ゆもり} と {湯|ゆ} が 、 {一|ひと}つ の {取|と}り{決|き}め を {書|か}いた 。 {谷|たに} {全体|ぜんたい} で {決|き}めた こと だ 。 || The two houses, the guild and the spring wrote one agreement together. The whole valley decided it.
!autosave

@scene yn.agreement_write
# The written agreement (A17): you help word it, clause by clause; whatever the conclusion, it is written down, and
# the disagreement it keeps is written down too.
yn_rokubei: {決|き}まった こと は 、 {紙|かみ} に {書|か}こう 。 {決|き}まらなかった こと も 、 {決|き}まらなかった と {書|か}く 。 {言葉|ことば} を {選|えら}ぶ の を 、 {手伝|てつだ}って くれ 。 || What we've decided, we'll put on paper. What we haven't decided, we'll write down as not decided. Help us choose the words.
?(yn_med_adjourned) yn_rokubei: …… {今日|きょう} は {決|き}まらなかった 。 だが 、 「{来月|らいげつ} {又|また} {話|はな}す 」 と {書|か}く こと は できる 。 それ も {取|と}り{決|き}め だ 。 || …Nothing was settled today. But we can write "We will talk again next month". That's an agreement too.
!challenge yn.agreement
!give yn_agreement
narr: {上|かみ}の{湯|ゆ} の {女将|おかみ} と {下|しも}の{湯|ゆ} の {主|あるじ} が 、 {一行|いちぎょう} ずつ {交代|こうたい} で {清書|せいしょ} した 。 {二人|ふたり} と も 、 {相手|あいて} の {字|じ} を {横目|よこめ} で {見|み}て いる 。 || The proprietress and the master write out the fair copy a line each, in turn. Each keeps an eye on the other's handwriting.
?(yn_med_together) yn_oritsu: {露天風呂|ろてんぶろ} の こと は 、 {納得|なっとく} して おりません 。 {紙|かみ} に も 、 そう {書|か}いて ございます 。 …… それ で 、 よろしい の です ね 。 || I am not reconciled to the open-air bath. It says so on the paper, too. …And that is all right, is it.
?(yn_med_together) yn_tahei: {俺|おれ} も {納得|なっとく} して ねえ 。 {来月|らいげつ} 、 {寄合所|よりあいじょ} で {続|つづ}き を やろう じゃ ねえ か 。 || I'm not reconciled either. Let's carry on next month, at the hall.
?(yn_med_measured) yn_tahei: {時計|とけい} が {動|うご}けば 、 {文句|もんく} は ねえ 。 …… {女将|おかみ} の {顔|かお} を {見|み}る と 、 まだ {腹|はら} は {立|た}つ が な 。 || If the clock runs, I've no complaints. …Seeing her face still riles me, mind.
?(yn_med_open) yn_oritsu: {意見|いけん} は {違|ちが}う まま で ございます 。 ただ 、 {違|ちが}う と {書|か}いて ある の は 、 {悪|わる}く ございません 。 || Our views remain different. But to have it written that they differ is not a bad thing.

@scene yn.zentai
# C-74: 全体, the valley agreeing as a whole: Rokubei, reading the agreement's last line aloud.
!if mod_zentai -> end
yn_rokubei: {最後|さいご} の {一行|いちぎょう} を {読|よ}む ぞ 。 「この {取|と}り{決|き}め は 、 {湯|ゆ}ノ{谷|たに} {全体|ぜんたい} で {守|まも}る 。」 || I'll read the last line. "This agreement shall be kept by Steamhollow as a whole."
yn_rokubei: {上|かみ}の{湯|ゆ} だけ でも 、 {下|しも}の{湯|ゆ} だけ でも ない 。 {湯守|ゆもり} だけ でも ない 。 {尾根|おね} から {来|き}た {人|ひと} も {入|はい}る 。 {谷|たに} を {一|ひと}つ の {体|からだ} と して {見|み}る 。 それ が 「{全体|ぜんたい} 」 だ 。 || Not the Upper House alone, not the Lower House alone. Not only the bath-keepers. The folk from the ridge too. You look at the valley as one body. That's "as a whole".
?(comp=nao) comp: {全体|ぜんたい} か 。 {一人|ひとり} ずつ じゃ なく 、 {丸|まる}ごと 。 …… {守|まも}る {時|とき} に も 、 {使|つか}える {言葉|ことば} だ な 。 || As a whole. Not one by one: all of it. …A word you could use when you're protecting people, too.
?(comp=mio) comp[smile]: {体|からだ} {全体|ぜんたい} を {診|み}る 。 {薬師|くすし} も 、 {同|おな}じ {言葉|ことば} を {使|つか}います 。 || Look at the body as a whole. Healers use the same word.
?(comp=ren) comp[think]: {灯|ひ} {一|ひと}つ ずつ で は なく 、 {道|みち} {全体|ぜんたい} を {照|て}らす 。 …… {覚|おぼ}えました 。 || Not each lamp alone, but lighting the whole road. …I've got it.
?(comp=suzu) comp[laugh]: {一座|いちざ} {全体|ぜんたい} で {一|ひと}つ の {芝居|しばい} 。 {舞台|ぶたい} の {基本|きほん} よ 。 || The whole company, one play. That's stagecraft one-oh-one.
!set mod_zentai
!teach mod_zentai
:end

@scene yn.end
# The chapter's end: the vow, after the walk (yn.walk). The valley out in yukata, the lanterns lit, the north road open;
# above it, the silent mountain and the road to the Archive.
# Illustrated (src/ui/43m_seq_yn.js): the lit valley and the bridge; the silent ridge and the companion's resolve.
# Called from the walk (yn.walk), the sequence is already up on the valley shot and is carried on, not begun again
# (RBN-QA-127); run on its own, it begins here as before.
!sequence yn.end begin
!shot valley
narr: {谷|たに} の {提灯|ちょうちん} が {全部|ぜんぶ} {点|つ}いた 。 {赤|あか}い {橋|はし} の {上|うえ} を 、 {上|かみ}の{湯|ゆ} の {客|きゃく} と {下|しも}の{湯|ゆ} の {客|きゃく} が 、 {同|おな}じ {下駄|げた} の {音|おと} で {歩|ある}いて いる 。 || Every lantern in the valley is lit. On the red bridge, guests of the Upper House and the Lower House walk with the same clack of wooden sandals.
!shot ridge
narr: {北|きた} の {尾根|おね} の {上|うえ} は 、 {今夜|こんや} も {音|おと} が ない 。 || Above the north ridge, tonight as every night, there is no sound.
!shot ridge comp
?(comp=nao) comp[closed]: …… {最後|さいご} まで {走|はし}る 。 {届|とど}ける {先|さき} が 、 {静|しず}か すぎて も な 。 お{前|まえ} と {一緒|いっしょ} に 。 || …I'll run it to the end. Even if the place we're delivering to is too quiet. With you.
?(comp=mio) comp: {怖|こわ}い です 。 でも 、 {怖|こわ}い と {言|い}える {人|ひと} が {隣|となり} に いる 。 …… {最後|さいご} まで 、 {一緒|いっしょ} に {行|い}きます 。 || I'm afraid. But there's someone beside me I can say so to. …I'll go with you to the end.
?(comp=ren) comp: {名前|なまえ} を {奪|うば}われた {灯|ひ} が 、 あの {上|うえ} に ある なら 。 {全部|ぜんぶ} 、 {呼|よ}び{戻|もど}します 。 {約束|やくそく} です 。 || If the lamps whose names were taken are up there, I'll call every one of them back. That's a promise.
?(comp=suzu) comp: {最後|さいご} の {幕|まく} ね 。 …… {相方|あいかた} が いる なら 、 どんな {客|きゃく} の {前|まえ} でも {舞台|ぶたい} に {立|た}てる わ 。 {行|い}きましょ 。 || The last act, then. …With a partner, I can stand up in front of any house. Let's go.
!sequence yn.end end
!set yn_done
!quest yn_main done
!travel steamhollow
!journal {湯|ゆ}ノ{谷|たに} は 、 {意見|いけん} が {違|ちが}う まま {一|ひと}つ の {取|と}り{決|き}め を {守|まも}る こと に した 。 {北|きた} の {道|みち} が {開|ひら}いた 。 {尾根|おね} の {上|うえ} の {静|しず}けさ の {先|さき} に 、 {書庫|しょこ} への {坂道|さかみち} が ある 。 || Steamhollow has chosen to keep one agreement while still disagreeing. The north road is open. Beyond the silence on the ridge lies the slope to the Archive.
!toast {第十一章|だいじゅういっしょう} {完|かん} || Chapter 11 complete
!autosave
`);
