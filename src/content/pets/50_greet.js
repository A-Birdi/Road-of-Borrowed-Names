/* Greeting together (addendum §6.3, §19.2): the sixteen companion × animal moments.
 *
 * Opt-in only: Company › Pet › "Greet together" (in the world, never in a scene, a puzzle or a battle), and a
 * rest point's menu when the companionship module offers RB.company.addRestOption (RB.pets.restOption). Each
 * is short, plays in the world where you are (the animal walks over to your companion, then acts), gives
 * nothing and takes nothing, and is replayable. No player-authored text is spoken: lines say "the cat",
 * never the name you chose.
 *
 * World animations used (RB.pets.WORLD_ANIM): affection, sit, settle, lookup, sniff, mirror, curl, hop, back,
 * blink, call, bow, aloof — each scene a different sequence. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';

  RB.script.add(`
# ---- Nao --------------------------------------------------------------------------------------------------
@scene pets.greet.nao.cat
!hook pet_come comp
narr: ナオ が しゃがんで 、 {手紙|てがみ} の {束|たば} を {猫|ねこ} の {前|まえ} に {出|だ}す 。 || Nao crouches and holds a bundle of letters out to the cat.
!hook pet_do sniff
nao[smirk]: {言|い}って おく が 、 お{前|まえ} {宛|あ}て は {一通|いっつう} も ない ぞ 。 || Just so you know, not one of these is addressed to you.
!hook pet_do affection
narr: {猫|ねこ} は {束|たば} の {角|かど} に {頬|ほお} を こすりつけた 。 || The cat rubs its cheek against the corner of the bundle.
nao: {受|う}け{取|と}り の {印|しるし} か 。 {確|たし}か に 。 || That's your signature for it, then. Received.

@scene pets.greet.nao.dog
!hook pet_come comp
narr: {犬|いぬ} が ナオ の {足元|あしもと} に {来|き}て 、 {座|すわ}った 。 || The dog comes to Nao's feet and sits.
!hook pet_do lookup
nao: {次|つぎ} の {町|まち} まで の {道|みち} 、 {覚|おぼ}えてる か ? || Remember the road to the next town?
!hook pet_do hop
narr: しっぽ が {大|おお}きく {揺|ゆ}れた 。 || The tail swings wide.
nao[smile]: よし 。 {頼|たよ}り に してる ぞ 、 {相棒|あいぼう} 。 || Good. I'm counting on you, partner.

@scene pets.greet.nao.bird
!hook pet_come comp
narr: ナオ が {腕|うで} を {低|ひく}く {出|だ}す と 、 {小鳥|ことり} が ぴょん と {跳|と}んだ 。 || Nao holds his arm out low, and the little bird hops up.
!hook pet_do mirror
nao[smirk]: {肩|かた} まで は {貸|か}す 。 {鞄|かばん} の {紐|ひも} を つつく の は なし だ 。 || You can have as far as my shoulder. No pecking the satchel strap.
!hook pet_do affection
narr: {小鳥|ことり} は {羽|はね} を {整|ととの}えて 、 {聞|き}こえない ふり を した 。 || The bird preens and pretends not to have heard.

@scene pets.greet.nao.tanuki
!hook pet_come comp
narr: たぬき が ナオ の {鞄|かばん} の {匂|にお}い を かいで いる 。 || The tanuki is sniffing Nao's satchel.
!hook pet_do sniff
nao: {中身|なかみ} は {手紙|てがみ} だけ だ 。 {食|た}べ{物|もの} は ない 。 || It's only letters in there. Nothing to eat.
!hook pet_do sit
narr: たぬき は {鞄|かばん} の {横|よこ} に {座|すわ}り{込|こ}んで 、 {動|うご}かない 。 || The tanuki sits down beside the satchel and doesn't budge.
nao[laugh]: {見張|みは}り の つもり か 。 {給料|きゅうりょう} は {出|で}ない ぞ 。 || Standing guard, are you? There's no pay in it.

# ---- Mio --------------------------------------------------------------------------------------------------
@scene pets.greet.mio.cat
!hook pet_come comp
narr: ミオ が {指|ゆび} の {先|さき} で 、 {猫|ねこ} の あご の {下|した} を かく 。 || Mio scratches under the cat's chin with a fingertip.
!hook pet_do affection
mio[smile]: ここ が いい の ね 。 {知|し}ってる よ 。 || That's the spot, isn't it. I know.
!hook pet_do curl
narr: {猫|ねこ} は ミオ の {横|よこ} で {丸|まる}く なった 。 || The cat curls up beside Mio.

@scene pets.greet.mio.dog
!hook pet_come comp
narr: ミオ が しゃがんで 、 {犬|いぬ} の {前足|まえあし} を そっと {持|も}ち{上|あ}げる 。 || Mio crouches and gently lifts one of the dog's front paws.
!hook pet_do sit
mio: とげ は {刺|さ}さって ない 。 {足|あし} の {裏|うら} も きれい 。 || No thorns. The pads are fine.
!hook pet_do hop
mio[laugh]: はいはい 、 {診察|しんさつ} は {終|お}わり 。 {元気|げんき} で よろしい 。 || All right, all right, the check-up's over. Healthy as can be.

@scene pets.greet.mio.bird
!hook pet_come comp
narr: ミオ が {小|ちい}さな {声|こえ} で 、 {歌|うた} を {口|くち}ずさむ 。 || Mio hums a little tune under her breath.
!hook pet_do lookup
narr: {小鳥|ことり} は {首|くび} を かしげて 、 {聞|き}いて いる 。 || The bird tilts its head, listening.
!hook pet_do settle
mio[shy]: {下手|へた} な {歌|うた} で 、 {眠|ねむ}く なっちゃった ? || Did my bad singing make you sleepy?

@scene pets.greet.mio.tanuki
!hook pet_come comp
narr: ミオ が {拾|ひろ}った {葉|は} を {一枚|いちまい} 、 たぬき に {見|み}せる 。 || Mio shows the tanuki a leaf she's picked up.
!hook pet_do sniff
mio: これ は {薬草|やくそう} じゃ なくて 、 ただ の {葉|は} よ 。 || This isn't a herb. It's just a leaf.
!hook pet_do back
narr: たぬき は くしゃみ を {一|ひと}つ して 、 {少|すこ}し {下|さ}がって {座|すわ}った 。 {不満|ふまん} そう だ 。 || The tanuki sneezes once, backs off a little and sits. It looks put out.
mio[laugh]: {頭|あたま} に のせて 、 {化|ば}ける の か と {思|おも}った 。 || I thought you'd put it on your head and change into something.

# ---- Ren --------------------------------------------------------------------------------------------------
@scene pets.greet.ren.cat
!hook pet_come comp
narr: レン が {膝|ひざ} を ついて 、 {猫|ねこ} と {目|め} の {高|たか}さ を {合|あ}わせる 。 || Ren kneels to bring his eyes level with the cat's.
!hook pet_do lookup
ren: ゆっくり まばたき を する と 、 {猫|ねこ} は {安心|あんしん} する そう です 。 || They say a slow blink reassures a cat.
!hook pet_do blink
narr: {猫|ねこ} も 、 ゆっくり と まばたき を {返|かえ}した 。 || The cat blinks slowly back.
ren[smile]: {返事|へんじ} を もらいました 。 || I've had my reply.

@scene pets.greet.ren.dog
!hook pet_come comp
narr: レン が {本|ほん} を {開|ひら}いて 、 {一行|いちぎょう} {読|よ}み{上|あ}げる 。 || Ren opens a book and reads a line aloud.
!hook pet_do lookup
ren: 「 {道|みち} は 、 {歩|ある}いた {人|ひと} の {数|かず} だけ ある 。 」 || "There are as many roads as there are people who have walked them."
!hook pet_do curl
narr: {犬|いぬ} は レン の {足元|あしもと} に {伏|ふ}せて 、 {目|め} を {閉|と}じた 。 || The dog lies down at Ren's feet and closes his eyes.
ren[closed]: よい {聞|き}き{手|て} です 。 || A good listener.

@scene pets.greet.ren.bird
!hook pet_come comp
narr: {小鳥|ことり} が レン の {前|まえ} に {降|お}りて 、 {一声|ひとこえ} {鳴|な}いた 。 くちばし が {開|ひら}く の が {見|み}えた 。 || The bird drops down in front of Ren and gives one call; you see its beak open.
!hook pet_do call
ren[think]: {鳥|とり} の {言葉|ことば} は 、 まだ {読|よ}めません 。 {辞書|じしょ} が {要|い}ります ね 。 || I can't read bird yet. I'll need a dictionary.
!hook pet_do hop
narr: {小鳥|ことり} は もう {一度|いちど} 、 {跳|は}ねた 。 || The bird hops once more.
ren[smile]: {今|いま} の は 、 たぶん 「 {行|い}こう 」 です 。 || That one, I think, meant "let's go".

@scene pets.greet.ren.tanuki
!hook pet_come comp
narr: レン が {丁寧|ていねい} に {頭|あたま} を {下|さ}げる 。 || Ren bows politely.
!hook pet_do bow
narr: たぬき も 、 {頭|あたま} を ぺこり と {下|さ}げた 。 || The tanuki bobs its head down too.
ren[laugh]: {礼儀|れいぎ} {正|ただ}しい 。 {私|わたし} より {上手|じょうず} です 。 || Very proper. Better at it than I am.
!hook pet_do curl
narr: それから 、 レン の {影|かげ} の {中|なか} で {丸|まる}く なった 。 || Then it curls up in Ren's shadow.

# ---- Suzu -------------------------------------------------------------------------------------------------
@scene pets.greet.suzu.cat
!hook pet_come comp
suzu: {本日|ほんじつ} の {主役|しゅやく} 、 ご{登場|とうじょう} ! || And now, entering: the star of today's show!
!hook pet_do aloof
narr: {猫|ねこ} は {横|よこ} を {向|む}いて 、 しっぽ の {先|さき} だけ {動|うご}かした 。 || The cat looks away and flicks only the tip of its tail.
suzu[laugh]: {大物|おおもの} は {拍手|はくしゅ} に {応|こた}えない 。 {分|わ}かる 。 || Stars don't bow for applause. I get it.
!hook pet_do affection
narr: {少|すこ}し して 、 {猫|ねこ} は スズ の {膝|ひざ} に {頭|あたま} を ぶつけた 。 || After a moment, the cat bumps its head against Suzu's knee.

@scene pets.greet.suzu.dog
!hook pet_come comp
narr: スズ が {手|て} を {叩|たた}いて 、 {拍子|ひょうし} を とる 。 || Suzu claps out a rhythm.
!hook pet_do hop
suzu[smile]: いち 、 に 、 さん 、 はい ! || One, two, three, go!
!hook pet_do mirror
narr: {犬|いぬ} は {首|くび} を かしげて 、 それから {反対|はんたい} に も かしげた 。 || The dog tilts his head one way, then the other.
suzu[laugh]: {振|ふ}り{付|つ}け 、 {変|か}えた でしょ ! || You changed the choreography!

@scene pets.greet.suzu.bird
!hook pet_come comp
narr: スズ が {短|みじか}く {口笛|くちぶえ} を {吹|ふ}く 。 || Suzu whistles a short phrase.
!hook pet_do call
narr: {小鳥|ことり} が くちばし を {開|ひら}いて 、 {同|おな}じ {節|ふし} を {返|かえ}した 。 || The bird opens its beak and sends the same phrase back.
!hook pet_do mirror
suzu[surprise]: {今|いま} の 、 {完璧|かんぺき} じゃない ? {二重唱|にじゅうしょう} 、 {決定|けってい} ! || Wait, that was perfect! A duet it is!

@scene pets.greet.suzu.tanuki
!hook pet_come comp
suzu: では 、 {見得|みえ} を {切|き}ります ! || And now: the pose!
narr: スズ が {片足|かたあし} を {踏|ふ}み{出|だ}して 、 {大|おお}きく {構|かま}える 。 || Suzu stamps one foot forward and strikes a grand pose.
!hook pet_do mirror
narr: たぬき も {後|うし}ろ{足|あし} で {立|た}って 、 {前足|まえあし} を {上|あ}げた 。 || The tanuki stands on its hind legs and raises its forepaws too.
!hook pet_do lookup
suzu[laugh]: {完璧|かんぺき} ! {看板|かんばん} {役者|やくしゃ} は あなた ね 。 || Perfect! You're the headliner.
`, 'pets/greet');

  // rest points: offered through the companionship module's rest menu when it is present
  const reg = () => {
    if (reg.done || !RB.company || typeof RB.company.addRestOption !== 'function') return;
    RB.company.addRestOption((s) => RB.pets.restOption(s));
    reg.done = true;
  };
  reg();
  if (RB.bus) RB.bus.on('map:enter', reg);
})();
