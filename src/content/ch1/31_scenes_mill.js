/* Chapter 1 scenes: the mill road (each candidate's approach), the mill,
 * the Mill Echo, and Kōji's return. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene rw.mr_enter
narr: {川|かわ} {沿|ぞ}い の {細|ほそ}い {道|みち} 。 {上流|じょうりゅう} から 、 {誰|だれ} か が {誰|だれ} か を {呼|よ}ぶ {声|こえ} が 、 かすか に {聞|き}こえる 。 || A narrow path along the river. From upstream you can faintly hear someone calling someone.
narr: {道|みち} の {途中|とちゅう} に 、 {見覚|みおぼ}え の ある {顔|かお} が {四|よっ}つ 。 ツル の {言|い}った とおり 、 {心配|しんぱい} {性|しょう} の {連中|れんちゅう} が {先|さき} に {来|き}て いた 。 || Along the way are four familiar faces. Just as Tsuru said, the worriers got here first.
narr: {誰|だれ} も 「 {一緒|いっしょ} に {行|い}こう 」 と は {言|い}わない 。 それぞれ 、 {自分|じぶん} の やり{方|かた} で {手|て} を {貸|か}そう と して いる 。 || None of them says "let's go together". Each is trying to help in their own way.
!quest rw_mill 0 quiet
!autosave

@scene rw.mr_sae
# Staged: Sae starts back from you (a voice?), then holds herself; when she can say no more, her head
# goes down, and Mio, beside her, kneels to her box of medicines (you look round at her).
!faceplayer sae
!gesture sae recoil pc
sae[worry]: {来|こ}ないで …… あ 、 ごめんなさい 。 {人|ひと} だ 。 {声|こえ} じゃ ない 。 || Don't come… oh, sorry. You're a person. Not a voice.
!gesture sae guard hold
sae: {粉屋|こなや} の サエ です 。 {父|ちち} の {水車|すいしゃ}{小屋|ごや} …… {嵐|あらし} の {夜|よる} から 、 {誰|だれ} も いない のに 、 {昔|むかし} の {声|こえ} が {呼|よ}ぶ ん です 。 {死|し}んだ {父|ちち} の {声|こえ} も 。 || I'm Sae, the miller's daughter. My father's mill… since the storm night, with nobody inside, old voices keep calling. Even my late father's.
!gesture sae lowered hold
!gesture mio kneel hold
!gesture pc listen mio
narr: サエ は {震|ふる}えて いて 、 それ {以上|いじょう} {話|はな}せない 。 {隣|となり} で ミオ が {薬|くすり} の {箱|はこ} を {開|ひら}いて いる 。 || Sae is shaking and can't say more. Next to her, Mio is opening a box of medicines.

@scene rw.mr_sae2
!faceplayer sae
sae: {歯車|はぐるま} の {軸|じく} 、 {使|つか}って ください 。 {父|ちち} なら 、 きっと そう {言|い}う から 。 || Use the gear pin, please. It's what my father would have said.
?(rw_echo_done) sae[smile]: {水車|すいしゃ} が {回|まわ}る {音|おと} 、 {久|ひさ}しぶり に {聞|き}きました 。 ありがとう 。 || I haven't heard the wheel turning in so long. Thank you.

@scene rw.mr_mio
# Staged: Mio holds the warm cup she has brewed, puts it in Sae's hands and turns to her; Sae's head goes
# down over her confession; Mio's nod; Sae looks away, then at you, and gives up the pin; Mio's nod to her.
!faceplayer mio
!prop mio cup
mio: {落|お}ち{着|つ}く お{茶|ちゃ} を {煎|せん}じて います 。 {薬|くすり} と いう より 、 {温|あたた}かい もの を {持|も}って いる と 、 {人|ひと} は {少|すこ}し {楽|らく} に なる ので 。 || I'm brewing a calming tea. It's less the medicine than holding something warm — people feel a little better.
!gesture mio handover sae
!gesture sae receive mio hold
narr: ミオ は サエ に {茶碗|ちゃわん} を {握|にぎ}らせ 、 {目|め} を {見|み}て {話|はな}す 。 || Mio puts a cup in Sae's hands and speaks to her, meeting her eyes.
!gesture mio palm sae
mio: 「 {気|き} の せい 」 と は {言|い}いません 。 {何|なに} か が {起|お}きて いる の は {本当|ほんとう} です 。 でも 、 それ は あなた の せい じゃ ない 。 || I won't tell you it's your imagination. Something really is happening. But it isn't your fault.
!gesture sae lowered hold
sae[think]: …… {父|ちち} の {声|こえ} が 、 「 {軸|じく} を {抜|ぬ}いて おけ 」 って {言|い}った ん です 。 {嵐|あらし} の {夜|よる} に 。 {怖|こわ}くて 、 {歯車|はぐるま} の {軸|じく} を {抜|ぬ}いて {逃|に}げた 。 だから {水車|すいしゃ} が {止|と}まった ん です 。 || …My father's voice said "pull the pin out". On the storm night. I was scared, so I pulled the gear pin and ran. That's why the wheel stopped.
!gesture mio nod sae
mio: {持|も}って いる の ね 。 …… {返|かえ}しても いい と {思|おも}える まで 、 {待|ま}つ から 。 || You still have it. …I'll wait until you feel you can give it back.
!gesture sae avert pc hold
sae: …… いいえ 。 あなた たち に {渡|わた}します 。 {止|と}まった ままの {父|ちち} の {水車|すいしゃ} なんて 、 {嫌|いや} です 。 || …No. I'll give it to you. I don't want my father's wheel standing still.
!give rw_wheel_pin
!gesture mio nod sae
mio[smile]: よく {言|い}えました 。 …… {私|わたし} は ここ で サエ さん と いる 。 {気|き}を つけて ね 。 || Well said. …I'll stay here with Sae. Be careful.
!set rw_mr_mio
!quest rw_mill 1 quiet

@scene rw.mr_mio2
!faceplayer mio
mio: サエ さん は {大丈夫|だいじょうぶ} 。 {次|つぎ} は あなた の {番|ばん} です よ 。 ちゃんと {帰|かえ}って きて ください 。 {薬|くすり} の {在庫|ざいこ} が {心配|しんぱい} なので 。 || Sae's all right. Now it's your turn — come back in one piece, please. I'm worried about my stock of medicine.
mio[smirk]: …… {冗談|じょうだん} です 。 {半分|はんぶん} は 。 || …Joking. Half joking.

@scene rw.mr_ren
!faceplayer ren
ren: この {灯|あか}り 、 {名前|なまえ} は 「 すいしゃごや 」 。 {記録|きろく} に よれば 、 {三十年|さんじゅうねん} {変|か}わって いない 。 || This lantern's name is "suishagoya" — water mill. According to the records it hasn't changed in thirty years.
ren[think]: {先生|せんせい} は {言|い}って いました 。 「 {迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 」 。 …… {道|みち} に {迷|まよ}う の は 、 {私|わたし} の {得意|とくい} {分野|ぶんや} です が 。 || My teacher used to say, "When lost, go back to the oldest name." …Getting lost is my speciality, admittedly.
ren: {書|か}いて いただけます か 。 {私|わたし} は {読|よ}み{上|あ}げる {係|かかり} で 。 || Would you write? I'll be in charge of reading aloud.
!set rw_mr_ren_talked

@scene rw.mr_lantern
!if rw_mr_ren_talked -> go
!call rw.mr_ren
:go
!challenge rw.c_mr_lantern
!if var._res=0 -> end
!sfx lantern
narr: {灯|あか}り が ともる と 、 {川|かわ} {沿|ぞ}い の もや が {少|すこ}し {薄|うす}く なった 。 || As the lantern lights, the haze along the river thins a little.
ren[smile]: …… ありがとう 。 {灯|あか}り が {一|ひと}つ ともる と 、 {道|みち} が {一|ひと}つ {思|おも}い{出|だ}す 。 {先生|せんせい} の {口癖|くちぐせ} です 。 || …Thank you. Light one lantern and the road remembers one thing. My teacher used to say that.
!set rw_mr_ren

@scene rw.mr_ren2
!faceplayer ren
ren: {私|わたし} は ここ で {灯|あか}り を {見|み}て います 。 {消|き}えそう に なったら 、 {大声|おおごえ} で {歌|うた}います 。 {音痴|おんち} です が 、 {効果|こうか} は ある はず です 。 || I'll keep watch on the lantern here. If it starts to go out, I'll sing loudly. I'm tone-deaf, but it should be effective.

@scene rw.mr_nao
# Staged: Nao points out the narrows and turns to the reeds as they name the other way (you look); when
# you have read the reeds yourself, a nod and a look between the two ways; if they clear them they go to
# the reeds and kneel to part them (side-on); if you take the narrows they point you to the way out.
!faceplayer nao
!if !rw_mr_obs_reeds -> tell
nao: {葦|あし} 、 {見|み}て きた な 。 どう {思|おも}った ？ || You've been looking at the reeds. What did you make of them?
!choice
* {下|した} に {細|ほそ}い {道|みち} が ある 。 {茎|くき} は {曲|ま}がってる だけ || There's a track underneath. The stalks are only bent aside. -> read
* ただ の {葦|あし} に {見|み}えた || They looked like plain reeds to me. -> tell
:read
!gesture nao nod pc
nao[smirk]: よく {見|み}てる 。 {獣道|けものみち} だ 。 {毎晩|まいばん} {何|なに} か が {通|とお}ってる 。 {折|お}らず に {分|わ}ければ 、 {人|ひと} も {通|とお}れる 。 || Sharp eyes. It's an animal track; something uses it every night. Part the reeds without breaking them and people can use it too.
!gesture nao lookbetween 6,15 and=12,16
nao: {崖|がけ} の {方|ほう} は 、 {声|こえ} に {押|お}し{戻|もど}される 。 どっち に する ？ || The narrows push you back with voices. Which way do you want?
!goto choose
:tell
!gesture nao point 6,15
nao: {先|さき} に {見|み}て きた 。 {狭|せま}い {崖|がけ} の {間|あいだ} で 、 {声|こえ} が {全部|ぜんぶ} {跳|は}ね{返|かえ}って くる 。 {通|とお}ろう と する と 、 {押|お}し{戻|もど}される 。 || I went ahead. In the narrows between the cliffs, every voice bounces back at you. Try to go through and you get pushed back.
!look nao 12,16
!gesture pc listen 12,16
nao: {別|べつ} の {道|みち} も ある 。 {小屋|こや} の {裏|うら} 、 {背|せ} の {高|たか}い {葦|あし} の {向|む}こう 。 {獣道|けものみち} が {上|うえ} まで {続|つづ}いてる 。 || There's another way. Behind the shed, past the tall reeds — an animal track that goes all the way up.
:choose
!choice
* {葦|あし} を {分|わ}けて もらう || Ask Nao to clear the reeds. -> clear
* {崖|がけ} の {道|みち} を {行|い}く || I'll try the narrows. -> narrows
:clear
!look pc nao
!look nao 12,16
nao: {了解|りょうかい} 。 …… {葦|あし} を {折|お}る の は {悪|わる}い けど 、 {春|はる} に は また {生|は}える 。 {道|みち} は {生|は}えない 。 || Got it. …Feels bad breaking reeds, but they grow back in spring. Paths don't.
!set rw_mr_nao
!sfx wind
!walkto nao 11 17 right
!gesture nao kneel 12,17 hold
narr: ナオ が {葦|あし} を {押|お}し{倒|たお}して 、 {細|ほそ}い {道|みち} を {作|つく}った 。 || Nao flattens the reeds, making a narrow path.
!end
:narrows
!look pc nao
!look nao pc
!gesture nao point 10,25
nao[smirk]: {正面|しょうめん} から か 。 {嫌|きら}い じゃ ない 。 {無理|むり} だったら {戻|もど}って きな 。 {出口|でぐち} は ここ に ある 。 || Straight through the front, huh. I don't hate it. If it's no good, come back. The exit's right here.

@scene rw.mr_nao2
!faceplayer nao
nao: {上|うえ} で {何|なに} か あったら 、 {走|はし}って {逃|に}げろ 。 {逃|に}げる の は {負|ま}け じゃ ない 。 {配達人|はいたつにん} の {常識|じょうしき} だ 。 || If anything happens up there, run. Running isn't losing. That's just courier sense.

@scene rw.mr_narrows
!if rw_mr_suzu|rw_echo_done -> end
!hook mr_heading
!if var._mr_down=1 -> down
narr: {崖|がけ} の {間|あいだ} に {入|はい}る と 、 {自分|じぶん} の {足音|あしおと} が {何重|なんじゅう} に も {返|かえ}って きた 。 {声|こえ} が {壁|かべ} の よう に {押|お}して くる 。 || As you step between the cliffs, your own footsteps come back many times over. The voices push against you like a wall.
narr: 「 …… どこ ？ …… どこ ？ …… どこ ？ 」 || "…Where? …Where? …Where?"
!move pc down 2
narr: {押|お}し{戻|もど}された 。 {声|こえ} は いつも 、 {最後|さいご} に {聞|き}こえた {音|おと} を {一|ひと}つ だけ {返|かえ}して くる 。 || You're pushed back. Each time, the voices throw back just one sound: the last one they caught.
narr: {歌|うた} でも {歌|うた}えば 、 {違|ちが}う {響|ひび}き に なる だろう か 。 || Maybe a song would change the echo.
!set rw_mr_obs_echo
!end
:down
?(!rw_mr_down_seen) narr: {声|こえ} は {背中|せなか} で {響|ひび}く だけ で 、 {下|くだ}る {足|あし} を {止|と}めない 。 {水車|すいしゃ}{小屋|ごや} へ {向|む}かう {人|ひと} だけ を {押|お}し{返|かえ}す らしい 。 || The voices echo at your back, but they don't stop you going down. They only seem to push back whoever heads for the mill.
!set rw_mr_down_seen

@scene rw.mr_reeds
!if rw_mr_nao -> end
narr: {背|せ} の {高|たか}い {葦|あし} が 、 {壁|かべ} の よう に びっしり {生|は}えて いる 。 {押|お}して も {通|とお}れない 。 || Tall reeds grow packed together like a wall. Pushing gets you nowhere.
narr: {根元|ねもと} に 、 {踏|ふ}み{固|かた}められた {細|ほそ}い {筋|すじ} が {一本|いっぽん} 、 {奥|おく} へ {続|つづ}いて いる 。 {茎|くき} は {折|お}れて いない 。 {横|よこ} に {曲|ま}がって いる だけ だ 。 || At their roots a thin, trodden line runs on into them. The stalks along it aren't broken, only bent aside.
narr: {何|なに} か {小|ちい}さな もの が 、 {毎晩|まいばん} ここ を {通|とお}って いる の だろう 。 || Something small must go through here every night.
!set rw_mr_obs_reeds

@scene rw.mr_suzu_talk
# Staged: Suzu shows off the cliffs like a theatre and gives the idea of a round with both hands; if
# you sing, you both turn to the narrows and she conducts the cliff with an open hand; then she turns
# back to you, pleased with herself.
!faceplayer suzu
!if !rw_mr_obs_echo -> intro
suzu: {崖|がけ} に {入|はい}って みた の ？ {声|こえ} は どう だった ？ || You went into the narrows? What were the voices like?
!choice
* {最後|さいご} の {音|おと} を {一|ひと}つ ずつ {返|かえ}して くる || They throw back the last sound they caught, one at a time. -> read
* ただ {押|お}し{返|かえ}された || They just pushed me back. -> intro
:read
!gesture suzu size
suzu[laugh]: {一|ひと}つ ずつ ！ それ なら {話|はなし} は {早|はや}い 。 {二|ふた}つ {同時|どうじ} に {聞|き}かせれば いい の 。 {同|おな}じ {歌|うた} を {少|すこ}し ずらして 、 {輪唱|りんしょう} で 。 || One at a time! Then it's easy. We give it two at once: the same song, slightly staggered, as a round.
!goto choose
:intro
!gesture suzu point 6,14
suzu: この {崖|がけ} 、 いい {響|ひび}き ！ {劇場|げきじょう} に したい くらい 。 …… ただ 、 {客|きゃく} が {悪|わる}い 。 {同|おな}じ セリフ しか {言|い}わない 。 || These cliffs have wonderful acoustics! I'd love to make it a theatre. …Only, the audience is terrible. They only have one line.
!look suzu pc
!gesture suzu size
suzu: {繰|く}り{返|かえ}す {相手|あいて} に は 、 {輪唱|りんしょう} を ぶつける の 。 {同|おな}じ {歌|うた} を 、 {少|すこ}し ずらして 。 そう する と 、 どっち が どっち か わからなく なって 、 {黙|だま}る 。 || Against something that repeats, you throw a round at it. The same song, slightly staggered. It loses track of which is which and goes quiet.
:choose
!choice
* {一緒|いっしょ} に {歌|うた}う || Sing with her. -> sing
* {本当|ほんとう} に {効|き}く の ？ || Does that really work? -> ask
:ask
!gesture suzu laugh
suzu[laugh]: {知|し}らない ！ {初|はじ}めて やる もの 。 …… でも 、 {怖|こわ}い とき に {歌|うた}う の は 、 {昔|むかし} から {効|き}く の よ 。 {少|すく}なくとも 、 {歌|うた}って いる {方|ほう} に は 。 || No idea! I've never tried it. …But singing when you're scared has always worked — for the singer, at least.
:sing
!look pc 6,15
!look suzu 6,15
!gesture suzu palm
narr: スズ が {歌|うた}い{出|だ}し 、 {少|すこ}し {遅|おく}れて あなた も {歌|うた}う 。 {崖|がけ} の {声|こえ} は {二|ふた}つ の {歌|うた} を {追|お}いかけ 、 やがて {追|お}いつけなく なって 、 {静|しず}か に なった 。 || Suzu starts to sing, and a beat later you join in. The cliff-voices chase both songs, fall behind, and finally go quiet.
!music companion_suzu
!look pc suzu
!look suzu pc
!gesture suzu celebrate
suzu[smile]: …… ほら 。 {拍手|はくしゅ} は {後|あと} で まとめて ちょうだい 。 || …There. Save the applause for later.
!set rw_mr_suzu
!music mystery

@scene rw.mr_suzu2
!faceplayer suzu
suzu: {私|わたし} は ここ で {崖|がけ} の お{客|きゃく} を {見張|みは}ってる 。 {文句|もんく} を {言|い}い{出|だ}したら 、 {二番|にばん} を {歌|うた}う から 。 || I'll keep an eye on the cliff audience. If they start complaining, I'll sing the second verse.

@scene rw.mr_rock
narr: {大|おお}きな {石|いし} だ 。 {動|うご}かない 。 || A big rock. It won't budge.

@scene rw.mr_wheel
narr: {水車|すいしゃ} は {止|と}まって いる 。 {水|みず} が {羽根|はね} を {押|お}して も 、 きしむ だけ で {回|まわ}らない 。 || The waterwheel is still. The water pushes against the paddles; it only creaks, it doesn't turn.

@scene rw.mr_marker
narr: 「 {北|きた} 、 {水車|すいしゃ}{小屋|ごや} 。 {南|みなみ} 、 {葦|あし}ノ{瀬|せ} 。 」 {石|いし} の {字|じ} は {無事|ぶじ} だ 。 || "North: the water mill. South: Ashinose." The carved words are safe.

@scene rw.m1_enter
narr: {薄暗|うすぐら}い {小屋|こや} の {中|なか} 。 {粉|こな} の {匂|にお}い が まだ {残|のこ}って いる 。 || Inside the dim mill, the smell of flour still lingers.
narr: 「 …… あした も きて ね …… 」 「 …… おかえり …… 」 {声|こえ} が 、 {梁|はり} の {上|うえ} から {降|ふ}って くる 。 || "…Come again tomorrow…" "…Welcome back…" Voices drift down from the beams.
?(party=nao) narr: || (You think of Nao's advice: know where the exit is. It's behind you.)
!quest rw_mill 1 quiet
!checkpoint rw.mill1 7 10 up
!autosave

@scene rw.m1_gears
# Staged: you lean in to the jammed gears; you reach in and set the pin; at the faint heat you turn to the
# millstone, and the bang of the trapdoor makes you look up at the ladder.
!if !item.rw_wheel_pin -> nopin
!gesture pc observe 10,2 hold
narr: {歯車|はぐるま} の {真|ま}ん{中|なか} に 、 {軸|じく} を {通|とお}す {穴|あな} が ある 。 {板|いた} に は {番号|ばんごう} の ような {字|じ} が {刻|きざ}まれて いる 。 || There's a hole in the middle of the gears for a pin. Plates carved with something like numbers.
!lesson kana
!challenge rw.c_mill_gears
!if var._res=0 -> end
!take rw_wheel_pin
!sfx chest
!gesture pc handover 10,2
narr: {軸|じく} が はまり 、 {歯車|はぐるま} が {重|おも}たげ に {回|まわ}り{出|だ}した 。 {外|そと} で 、 {水車|すいしゃ} の きしむ {音|おと} が {変|か}わる 。 || The pin slots in, and the gears begin to turn, heavily. Outside, the creak of the waterwheel changes.
narr: {床|ゆか} の {下|した} の {水路|すいろ} に 、 {冷|つめ}たい {水|みず} が {戻|もど}って きた 。 {歯車|はぐるま} の {板|いた} の {字|じ} の {中|なか} に 、 {一|ひと}つ だけ {数字|すうじ} で は ない {字|じ} が ある 。 「 {水|みず} 」 。 || Cold water runs back into the millrace under the floor. Among the characters on the gear plates, one isn't a number: the character for water, mizu.
!word mizu
!gesture pc listen 6,4
narr: 「 みず 」 。 {熱|あつ}く なった もの を {冷|ひ}やす {言葉|ことば} だ 。 {部屋|へや} の {真|ま}ん{中|なか} の {石臼|いしうす} から 、 かすか に {熱|ねつ} を {感|かん}じる 。 || Mizu — water: a word that cools whatever has grown hot. From the millstone in the middle of the room, you feel a faint heat.
!gesture pc flinch 2,2
narr: {梯子|はしご} の {上|うえ} の {扉|とびら} が 、 がたん と {開|ひら}いた 。 || The trapdoor above the ladder bangs open.
!set rw_gears
!quest rw_mill 2
!autosave
!end
:nopin
!gesture pc observe 10,2
narr: {歯車|はぐるま} の {真|ま}ん{中|なか} の {軸|じく} が {抜|ぬ}けて いる 。 これ では {回|まわ}らない 。 {誰|だれ} か が {持|も}って いった の だろう か 。 || The pin through the middle of the gears is missing. They won't turn like this. Did someone take it?

@scene rw.m1_ladder
!if !rw_gears -> shut
!warp rw.mill2 2 6 up
!end
:shut
narr: {梯子|はしご} の {上|うえ} の {扉|とびら} は 、 {止|と}まった {歯車|はぐるま} の {軸|じく} に {押|お}さえられて {開|ひら}かない 。 || The trapdoor at the top of the ladder is held shut by the jammed gear shaft.

@scene rw.m1_stairs
!if !rw_gears -> dark
!warp rw.mill0 2 7 up
!end
:dark
narr: {階段|かいだん} の {下|した} は {水|みず} の {音|おと} で いっぱい だ 。 {水車|すいしゃ} が {止|と}まって いる {間|あいだ} は 、 {危|あぶ}なくて {降|お}りられない 。 || The stairs lead down into the roar of water. While the wheel is jammed it's too dangerous to go down.

@scene rw.m1_stone
!if rw_echo_done -> quiet
narr: {大|おお}きな {石臼|いしうす} 。 {触|さわ}る と 、 かすか に {温|あたた}かい 。 {誰|だれ} も {回|まわ}して いない のに 。 || A great millstone. It's faintly warm to the touch, though no one is turning it.
!end
:quiet
narr: {石臼|いしうす} は {静|しず}か に {回|まわ}って いる 。 もう {温|あたた}かく ない 。 || The millstone turns quietly. It isn't warm anymore.

@scene rw.m2_voice1
narr: 「 ── 、 まって よ ！ おいて かないで ！ 」 {小|ちい}さな {女|おんな}の{子|こ} の {声|こえ} 。 {名前|なまえ} の ところ だけ 、 {音|おと} が {抜|ぬ}けて いる 。 || "—, wait for me! Don't leave me behind!" A little girl's voice. Only the name is missing, a hole in the sound.
!set rw_v1

@scene rw.m2_voice2
narr: 「 {橋|はし} が {流|なが}された {年|とし} から 、 ── が {渡|わた}し を {始|はじ}めて くれた 。 {川|かわ} の {向|む}こう に {住|す}む {変|か}わり{者|もの} だ 。 」 {年|とし} を {取|と}った {男|おとこ} の {声|こえ} 。 || "Since the year the bridge was washed away, — has been running the ferry for us. An odd one who lives across the river." An old man's voice.
!set rw_v2

@scene rw.m2_voice3
narr: 「 {明日|あした} も {来|き}て ね 、 ── 。 お{茶|ちゃ} 、 いれて おく から 。 」 {大人|おとな} に なった 、 {同|おな}じ {女|おんな} の {人|ひと} の {声|こえ} 。 || "Come again tomorrow, —. I'll have the tea ready." The same woman's voice, grown up.
?(rw_hana_cups) narr: …… ハナ の {声|こえ} だ 。 || …It's Hana's voice.
!set rw_v3

@scene rw.m2_ledger
narr: {粉屋|こなや} の {帳面|ちょうめん} 。 {客|きゃく} の {名前|なまえ} の {欄|らん} は 、 どれ も {白|しろ}い 。 || The miller's ledger. The column of customers' names is blank throughout.
narr: …… ただ 、 {粉|こな} の しみ の {下|した} に 、 {子|こ}ども の {字|じ} で {落書|らくが}き が {残|のこ}って いた 。 || …Except that under a flour stain, a child's doodle survives.
narr: 「 コウジ の ぶん 」 。 {小|ちい}さな {茶碗|ちゃわん} の {絵|え} が {添|そ}えて ある 。 || "Kōji's share." A small teacup is drawn beside it.
!set rw_ledger
!journal コウジ …… ? || A child's doodle in the mill ledger: "Kōji's share", with a teacup.

@scene rw.m2_lantern
!if rw_loft_done -> done
narr: {屋根裏|やねうら} の {古|ふる}い {灯|あか}り 。 {水車|すいしゃ}{小屋|ごや} の {灯|あか}り は 、 {村|むら} の {名前|なまえ} を {背負|せお}って いた はず だ 。 || The old lantern in the loft. The mill's lantern used to carry the village's name.
!lesson kana
!challenge rw.c_mill_lantern
!if var._res=0 -> end
!sfx lantern
narr: {灯|あか}り に 「 {葦|あし}ノ{瀬|せ} 」 が ともる 。 {下|した} から 、 {石臼|いしうす} の {低|ひく}い {唸|うな}り が {聞|き}こえ{始|はじ}めた 。 {声|こえ} が {一|ひと}つ {所|ところ} に {集|あつ}まって いく 。 || "Ashinose" lights up on the lantern. From below, the millstone begins a low hum. The voices are gathering in one place.
!set rw_loft_done
!quest rw_mill 3
!autosave
!end
:done
narr: {灯|あか}り は {静|しず}か に ともって いる 。 || The lantern burns quietly.

@scene rw.m0_chest
# Staged: you kneel at the old box to take out the charm.
!gesture pc kneel 13,3
narr: {古|ふる}い {箱|はこ} の {中|なか} に 、 {丸|まる}い {石|いし} の {守|まも}り が {入|はい}って いた 。 {粉屋|こなや} が {水車|すいしゃ} の {無事|ぶじ} を {祈|いの}った もの らしい 。 || Inside an old box is a round stone charm. It seems the miller used to pray for the wheel's safety with it.
!give rw_mill_charm
!set rw_m0_chest

@scene rw.m1_boss
# Staged: you face the millstone where the voices swirl, start at the echo's words, and stand still to
# understand them (no gesture on that line); remembering the word on the gear plate, a hand to your chin;
# after the battle you look up at the voices leaving, and round towards the wheel outside.
!music hush
!gesture pc listen 6,4 hold
narr: {石臼|いしうす} の {上|うえ} に 、 {声|こえ} が {渦|うず} を {巻|ま}いて いる 。 {聞|き}いた こと の ある {声|こえ} 、 {知|し}らない {声|こえ} 、 {名前|なまえ} の ない {呼|よ}び{声|ごえ} 。 || Above the millstone, voices swirl. Voices you know, voices you don't, calls with no names in them.
!gesture pc flinch 6,4
echo: …… おかえり 。 …… あした も 。 …… まって 。 || …Welcome back. …Tomorrow too. …Wait.
narr: この {声|こえ} たち は {怒|おこ}って いる の では ない 。 {行|い}き{場|ば} を なくして いる だけ だ 。 || These voices aren't angry. They've just lost their way home.
!if word.mizu -> fight
!gesture pc chin
narr: {石臼|いしうす} が {熱|あつ}く なって いく 。 {床|ゆか} の {下|した} で は 、 {水路|すいろ} の {水|みず} が {鳴|な}って いる 。 {歯車|はぐるま} の {板|いた} に あった {字|じ} を {思|おも}い{出|だ}す 。 「 {水|みず} 」 。 || The millstone is growing hot. Under the floor, the millrace is running. You remember the character on the gear plate: mizu, water.
!word mizu
:fight
!battle rw.mill_echo noflee
!if var._res=0 -> end
!set rw_echo_done bridge_fixed
!quest rw_mill 4
!music wonder
!gesture pc lookroad up
narr: {声|こえ} が ほどけて いく 。 {梁|はり} から 、 {屋根裏|やねうら} から 、 {外|そと} の {川|かわ} へ 。 || The voices come untied — from the beams, from the loft, out to the river.
!gesture pc listen 10,2
narr: {外|そと} で 、 {水車|すいしゃ} が {大|おお}きく {一|ひと}つ {回|まわ}った 。 || Outside, the waterwheel makes one great turn.
!note rw_mill
!lesson kana
!fade out
!warp rw.village 31 17 right
!fade in
!call rw.bridge_scene
`, 'ch1/31_mill');

RB.script.add(`
@scene rw.bridge_scene
!music wonder
# Illustrated (src/ui/43a_seq_ch1.js; docs/expressive/SHOTS.md §1): the pictures carry these lines; the state lines after the end run once, as before.
!sequence ch1.bridge begin
!shot reach
narr: {橋|はし} の {先|さき} が 、 {向|む}こう{岸|ぎし} に {届|とど}いて いた 。 {最初|さいしょ} から そう だった か の よう に 。 || The end of the bridge reaches the far bank, as if it always had.
!shot reach door
narr: {向|む}こう{岸|ぎし} の {小屋|こや} から 、 {帽子|ぼうし} を かぶった {男|おとこ} が 、 {茶碗|ちゃわん} を {持|も}って {出|で}て きた 。 || From the hut on the far bank, a man in a hat comes out, carrying a teacup.
!shot cup
!move koji left 10 260
narr: {茶屋|ちゃや} の {戸|と} が {開|あ}いた 。 {杖|つえ} を ついた ツル も 、 {広場|ひろば} から やって くる 。 || The teahouse door opens. Tsuru comes over from the square, leaning on her cane.
!shot hana
hana[surprise]: …… コウジ ？ || …Kōji?
koji[smile]: よう 、 {姉|ねえ}さん 。 {橋|はし} が {届|とど}かなくて さ 。 {三日|みっか} も {茶|ちゃ} を {飲|の}み{損|そこ}ねた 。 || Hey, sis. The bridge wouldn't reach. I've missed three days of tea.
!shot hana lift
koji: {自分|じぶん} の {茶碗|ちゃわん} で {飲|の}む の が {決|き}まり だろ 。 {忘|わす}れた の か ？ || Drinking from my own cup is the rule, isn't it? Did you forget?
!shot close
hana[sad]: {忘|わす}れて …… いた の 。 ごめん ね 。 {本当|ほんとう} に 、 {忘|わす}れて いた 。 || I… had forgotten. I'm sorry. I really had.
koji[think]: …… そう か 。 {俺|おれ} も {向|む}こう で 、 {誰|だれ} の {所|ところ} へ {渡|わた}る はず だった か 、 わからなく なってた 。 {茶碗|ちゃわん} だけ {持|も}って 、 {岸|きし} に {座|すわ}ってた 。 || …I see. Over there, I'd lost track of who I was meant to be crossing to. I just sat on the bank holding my cup.
!shot close smile
hana[smile]: {入|はい}って 。 お{茶|ちゃ} 、 いれる から 。 {今度|こんど} は ちゃんと 、 あんた の {分|ぶん} 。 || Come in. I'll pour the tea. Properly, this time — yours.
!shot door
narr: ふたり が {茶屋|ちゃや} に {入|はい}って いく 。 {戸|と} が {閉|し}まる {前|まえ} に 、 コウジ が {振|ふ}り{返|かえ}って {手|て} を {振|ふ}った 。 || The two of them go into the teahouse. Before the door closes, Kōji turns and waves.
# (the two are indoors before the picture dissolves back: the refresh behind it takes them in at once, HX52)
!set rw_koji_back
!refresh
!sequence ch1.bridge end
!quest rw_mill done
tsuru: …… {橋|はし} は {手|て} を {振|ふ}らない 。 {渡|わた}し {守|もり} は {振|ふ}る 。 ヤス の {口癖|くちぐせ} だ よ 。 || …A bridge doesn't wave. A ferryman does. That's Yasu's old saying.
!faceplayer tsuru
tsuru: よく やった 。 でも 、 {終|お}わり じゃ ない 。 {名前|なまえ} を {持|も}って いった {何|なに} か は 、 {川|かわ} の {下|しも} へ 、 {西|にし} へ {向|む}かった 。 {灯|ひ} の {道|みち} に {沿|そ}って ね 。 || Well done. But it isn't over. Whatever carried the names away went downriver — west, along the lantern road.
tsuru: {今夜|こんや} 、 {灯|あか}り{堂|どう} に {来|き}て おくれ 。 あの {四人|よにん} も {呼|よ}んで おく 。 {話|はな}す こと が ある 。 || Come to the Lantern Hall tonight. I'll call those four as well. There's something we need to talk about.
!fade out 900
!set rw_night rw_evening
!refresh
!music reedwake_night
!fade in 900
narr: {日|ひ} が {暮|く}れた 。 {村|むら} の {灯|あか}り が 、 {一|ひと}つ ずつ ともって いく 。 || The sun goes down. One by one, the village lanterns come on.
!quest rw_depart 0
!autosave
`, 'ch1/31_bridge');
