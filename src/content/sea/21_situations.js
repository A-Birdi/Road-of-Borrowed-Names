/* What happens on a voyage (expansion P11c; plan W7 "sea situations"; src/engine/72v_sail.js draws them once per voyage
 * from the 'sea' stream). Either way you travel they happen: sailing yourself, at points along the way; with the crew
 * sailing, one after another before arrival. First-time situations of a route and story ones are never skipped.
 *   hail      a passing boat calls across the water; answer it
 *   fog       fog comes down; read the light's signal on the chart's key
 *   cargo     a crate in the water; read where it was bound
 *   creature  something comes aboard; settle it, or ease it back over the side
 *   bird      a sea bird with a message tied to its leg
 *   seal      seals on the rocks: a sight for the log
 *   trouble   something goes wrong on board (a sail, a line, the rudder's fastener, a hatch): mend it now, with its words, or
 *             leave it for port; until then she only sails a little slower. Calm lines, never a warning.
 *   first     the first voyage on a route: what you see the first time
 * Each one's `log` is what the travel log says of it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.seaSituations = Object.assign(C.seaSituations || {}, {
    hail: { kind: 'hail', scene: 'sea.sit_hail', weight: 3, log: T('', 'A fishing boat hailed you, and you answered.') },
    fog: { kind: 'fog', scene: 'sea.sit_fog', weight: 2, log: T('', 'Fog came down; the light on the point showed the way.') },
    cargo: { kind: 'cargo', scene: 'sea.sit_cargo', weight: 2, log: T('', 'A crate in the water, its label still readable.') },
    creature: { kind: 'creature', scene: 'sea.sit_creature', weight: 1, if: 'ch4_done', log: T('', 'Something came aboard with a wave.') },
    bird: { kind: 'bird', scene: 'sea.sit_bird', weight: 2, log: T('', 'A gull brought a message from Shiori.') },
    seal: { kind: 'seal', scene: 'sea.sit_seal', weight: 2, log: T('', 'Seals on the rocks, watching you go by.') },
    t_sail: { kind: 'trouble', scene: 'sea.sit_sail', weight: 1, log: T('', 'The sail tore.') },
    t_line: { kind: 'trouble', scene: 'sea.sit_line', weight: 1, log: T('', 'A line frayed.') },
    t_rudder: { kind: 'trouble', scene: 'sea.sit_rudder', weight: 1, log: T('', 'The rudder\'s fastener worked loose.') },
    t_hatch: { kind: 'trouble', scene: 'sea.sit_hatch', weight: 1, log: T('', 'The hatch began to leak.') },
    first_ko: { kind: 'first', first: 'saltglass-kotonoha', scene: 'sea.first_ko', log: T('', 'The first time between Saltglass and the island: written leaves on the water.') },
    first_mb: { kind: 'first', first: 'manybridge-saltglass', scene: 'sea.first_mb', log: T('', 'The first time along the coast between Saltglass and Manybridge: the river mouth and its bridges.') },
  });
})(RB.content);

RB.script.add(`
@scene sea.sit_hail
# A fishing boat hails: answer its call.
narr: {漁船|ぎょせん} が {近|ちか}づいて きた 。 {舳先|へさき} で 、 {日焼|ひや}け した {漁師|りょうし} が {手|て} を {振|ふ}って いる 。 || A fishing boat draws near. At its bow, a sunburnt fisher is waving.
narr: 「おーい ！ {潮硝子|しおがらす} の {港|みなと} は 、 {開|あ}いて いる か ？」 || "Ahoy! Is Saltglass harbour open?"
!challenge sea.hail
!if var._res=0 -> late
narr: 「ありがとう よ ！ {気|き} を {付|つ}けて な ！」 {漁船|ぎょせん} は {帆|ほ} を {張|は}って 、 {離|はな}れて いった 。 || "Thanks! Take care!" The fishing boat sets its sail and draws away.
!hook sail_log person a fisher
!end
:late
narr: {答|こた}える {前|まえ} に 、 {漁船|ぎょせん} は {波|なみ} の {向|む}こう へ {行|い}って しまった 。 {手|て} を {振|ふ}る と 、 {振|ふ}り{返|かえ}して くれた 。 || Before you can answer, the fishing boat is away beyond the waves. You wave, and they wave back.

@scene sea.sit_fog
# Fog: the light on the point flashes its own pattern; the chart's key says which light is which.
narr: {急|きゅう} に {霧|きり} が {出|で}て きた 。 {陸|りく} も {島|しま} も {見|み}えない 。 || Fog comes down all at once. No land, no islands.
narr: {霧|きり} の {向|む}こう で 、 {光|ひかり} が {点|つ}いて は {消|き}える 。 || Somewhere beyond the fog, a light comes and goes.
!challenge sea.fog
?(var._res=1) narr: {光|ひかり} の {数|かず} で 、 どこ の {灯台|とうだい} か {分|わ}かった 。 {舵|かじ} を {少|すこ}し {切|き}って 、 {霧|きり} を {抜|ぬ}ける 。 || The count of the flashes tells you which light it is. A touch on the tiller, and you're out of the fog.
?(var._res=0) narr: {乗組員|のりくみいん} が {笑|わら}う 。 「{慌|あわ}て なくて いい 。 {霧|きり} は 、 {待|ま}てば {晴|は}れる 。」 {少|すこ}し {待|ま}つ と 、 {本当|ほんとう} に {晴|は}れた 。 || The crew laughs. "No need to hurry. Fog lifts if you wait." You wait a little, and it does.
!hook sail_log sight fog

@scene sea.sit_cargo
# A crate in the water: read its label.
narr: {木箱|きばこ} が {一|ひと}つ 、 {波|なみ} に {揺|ゆ}れて いる 。 {札|ふだ} が まだ {付|つ}いて いる 。 || A wooden crate bobs on the waves, its label still on.
!challenge sea.cargo
?(var._res=1) narr: {鉤|かぎ} で {引|ひ}き{寄|よ}せて 、 {船|ふね} に {上|あ}げた 。 {八百橋|やおばし} の {取引所|とりひきじょ} へ 、 {誰|だれ} か が {届|とど}けて くれる だろう 。 || You hook it in and haul it aboard. Someone will get it to Manybridge's Exchange.
?(var._res=0) narr: {札|ふだ} の {字|じ} が {波|なみ} で {滲|にじ}んで 、 {最後|さいご} まで {読|よ}めなかった 。 {箱|はこ} は {流|なが}れて いった 。 || The waves have blurred the label's letters past reading. The crate drifts away.
!hook sail_log sight crate

@scene sea.sit_creature
# Something comes aboard with a wave: settle it, or ease it back into the sea.
narr: {大|おお}きな {波|なみ} と {一緒|いっしょ} に 、 {何|なに} か が {甲板|かんぱん} に {上|あ}がって きた 。 ぷるぷる {震|ふる}えて いる 。 || With a big wave, something slops aboard. It's quivering.
!choice
* {鎮|しず}める 。 || Settle it. -> fight
* そっと {海|うみ} へ {帰|かえ}す 。 || Ease it back into the sea. -> back
:fight
!battle ko.jelly
?(var._res=1) narr: {静|しず}か に なった それ を 、 {海|うみ} へ {帰|かえ}した 。 || Quiet now, it goes back over the side.
!hook sail_log sight creature
!end
:back
narr: {桶|おけ} で すくって 、 {海|うみ} へ {帰|かえ}した 。 ぷかぷか {浮|う}いて 、 {離|はな}れて いく 。 || You scoop it up in a bucket and tip it back into the sea. It bobs away.
!hook sail_log sight creature

@scene sea.sit_bird
# A gull with a message tied to its leg: Shiori's tide book, by gull.
narr: {鴎|かもめ} が {一羽|いちわ} 、 {帆柱|ほばしら} に {止|と}まった 。 {足|あし} に 、 {小|ちい}さな {紙|かみ} が {結|むす}んで ある 。 || A gull lands on the mast. A slip of paper is tied to its leg.
!challenge sea.bird
narr: {鴎|かもめ} は {一声|ひとこえ} {鳴|な}いて 、 {飛|と}んで いった 。 || The gull gives one cry and flies off.
!hook sail_log person Shiori

@scene sea.sit_seal
# Seals on the rocks: a sight for the log.
narr: {岩|いわ} の {上|うえ} に 、 {海豹|あざらし} が {三頭|さんとう} 。 {顔|かお} を {上|あ}げて 、 {船|ふね} を {見送|みおく}って いる 。 || Three seals on a rock, heads up, watching the boat go by.
?(comp=nao) comp: {仕事|しごと} が ない って の は 、 いい もん だ な 。 || Must be nice, having no deliveries.
?(comp=mio) comp[smile]: {日向|ひなた}ぼっこ ね 。 …… {羨|うらや}ましい 。 || Sunbathing. …I'm jealous.
?(comp=ren) comp: {三頭|さんとう} とも 、 {同|おな}じ {方|ほう} を {向|む}いて います 。 {風上|かざかみ} です ね 。 || All three facing the same way. Into the wind.
?(comp=suzu) comp[laugh]: {観客|かんきゃく} が {三人|さんにん} ！ {手|て} を {振|ふ}って おこう か な 。 || An audience of three! I'll give them a wave.
!hook sail_log sight seals

# ---- something goes wrong on board: mend it now, or in port ------------------------------------------------------------
@scene sea.sit_sail
narr: {風|かぜ} に {煽|あお}られて 、 {帆|ほ} の {端|はし} が {裂|さ}けた 。 || A gust catches the sail, and its edge tears.
narr: {乗組員|のりくみいん} が {言|い}う 。 「{今|いま} {縫|ぬ}う か 、 {港|みなと} で {直|なお}す か 。 どっち でも {着|つ}きます よ 。」 || The crew says, "Stitch it now or mend it in port. She'll get us there either way."
!hook sail_damage sail
!choice
* {今|いま} {縫|ぬ}う 。 || Stitch it now. -> now
* {港|みなと} で {直|なお}す 。 || Leave it for port. -> end
:now
!challenge sea.mend_sail
?(var._res=1) !hook sail_mend
?(var._res=1) narr: {針|はり} と {糸|いと} で 、 {裂|さ}け{目|め} を {縫|ぬ}い{合|あ}わせた 。 {帆|ほ} が また {風|かぜ} を {受|う}ける 。 || With needle and thread you stitch the tear. The sail takes the wind again.
?(var._res=0) narr: 「{港|みなと} で {直|なお}しましょう 。 {急|いそ}ぐ {旅|たび} じゃ ない 。」 || "We'll mend it in port. We're in no hurry."
@scene sea.sit_line
narr: {帆|ほ} を {張|は}る {綱|つな} が 、 {一本|いっぽん} {擦|す}り{切|き}れかけて いる 。 || One of the lines that hold the sail is fraying.
narr: {乗組員|のりくみいん} が {言|い}う 。 「{今|いま} {結|むす}び{直|なお}す か 、 {港|みなと} で {替|か}える か 。 どっち でも {着|つ}きます よ 。」 || The crew says, "Tie it fresh now, or change it in port. She'll get us there either way."
!hook sail_damage line
!choice
* {今|いま} {結|むす}び{直|なお}す 。 || Tie it fresh now. -> now
* {港|みなと} で {替|か}える 。 || Leave it for port. -> end
:now
!challenge sea.mend_line
?(var._res=1) !hook sail_mend
?(var._res=1) narr: {傷|いた}んだ ところ を {切|き}って 、 {結|むす}び{直|なお}した 。 || You cut out the worn stretch and tie it fresh.
?(var._res=0) narr: 「{港|みなと} で {替|か}えましょう 。 {急|いそ}ぐ {旅|たび} じゃ ない 。」 || "We'll change it in port. We're in no hurry."
@scene sea.sit_rudder
narr: {舵|かじ} が 、 {少|すこ}し ぐらぐら する 。 {舵|かじ} の {留|と}め{具|ぐ} が {緩|ゆる}んで きた らしい 。 || The rudder has a wobble in it. Its fastener seems to be working loose.
narr: {乗組員|のりくみいん} が {言|い}う 。 「{今|いま} {締|し}める か 、 {港|みなと} で {見|み}て もらう か 。 どっち でも {着|つ}きます よ 。」 || The crew says, "Tighten it now, or have the yard look at it. She'll get us there either way."
!hook sail_damage rudder
!choice
* {今|いま} {締|し}める 。 || Tighten it now. -> now
* {港|みなと} で {見|み}て もらう 。 || Leave it for port. -> end
:now
!challenge sea.mend_rudder
?(var._res=1) !hook sail_mend
?(var._res=1) narr: {木槌|きづち} で {留|と}め{具|ぐ} を {打|う}ち{込|こ}んだ 。 {舵|かじ} が しっかり した 。 || You knock the fastener home with a mallet. The rudder is steady again.
?(var._res=0) narr: 「{港|みなと} で {見|み}て もらいましょう 。 {急|いそ}ぐ {旅|たび} じゃ ない 。」 || "We'll have the yard look at it. We're in no hurry."
@scene sea.sit_hatch
narr: {甲板|かんぱん} の {蓋|ふた} の {隙間|すきま} から 、 {波|なみ} の {水|みず} が {少|すこ}し ずつ {入|はい}って くる 。 || Through a gap in the deck hatch, a little seawater is getting in.
narr: {乗組員|のりくみいん} が {言|い}う 。 「{今|いま} {塞|ふさ}ぐ か 、 {港|みなと} で {直|なお}す か 。 どっち でも {着|つ}きます よ 。」 || The crew says, "Plug it now or fix it in port. She'll get us there either way."
!hook sail_damage hatch
!choice
* {今|いま} {塞|ふさ}ぐ 。 || Plug it now. -> now
* {港|みなと} で {直|なお}す 。 || Leave it for port. -> end
:now
!challenge sea.mend_hatch
?(var._res=1) !hook sail_mend
?(var._res=1) narr: {布|ぬの} と {木|き} の {楔|くさび} で 、 {隙間|すきま} を {塞|ふさ}いだ 。 || You stop the gap with cloth and a wooden wedge.
?(var._res=0) narr: 「{港|みなと} で {直|なお}しましょう 。 {水|みず} は {汲|く}み{出|だ}せば いい 。」 || "We'll fix it in port. We can bail meanwhile."

# ---- the first time on a route --------------------------------------------------------------------------------------
@scene sea.first_ko
narr: {沖|おき} に {出|で}る と 、 {波|なみ} の {間|あいだ} に {金色|きんいろ} の {葉|は} が {浮|う}いて いる 。 {字|じ} が {書|か}いて ある 。 || Out at sea, golden leaves float between the waves. There is writing on them.
?(var.sea_to=kotonoha) narr: {葉|は} は みんな 、 {西|にし} へ {流|なが}れて いく 。 {船|ふね} と {同|おな}じ {方|ほう} へ 。 || All of them drift west, the way the boat is going.
?(!var.sea_to=kotonoha) narr: {葉|は} は みんな 、 {西|にし} へ {流|なが}れて いく 。 {島|しま} の {方|ほう} へ 。 || All of them drift west, back towards the island.
!hook sail_log sight leaves
@scene sea.first_mb
?(var.sea_to=manybridge) narr: {海岸|かいがん} に {沿|そ}って {東|ひがし} へ 。 やがて {川口|かわぐち} が {開|ひら}けて 、 {橋|はし} が {幾|いく}つ も {重|かさ}なって {見|み}えて きた 。 || East along the coast. At last the river mouth opens out, and bridge after bridge comes into view, one behind another.
?(!var.sea_to=manybridge) narr: {振|ふ}り{返|かえ}る と 、 {八百橋|やおばし} の {橋|はし} が {幾|いく}つ も {重|かさ}なって 、 {遠|とお}ざかって いく 。 || Looking back, Manybridge's bridges stand one behind another, growing smaller.
!hook sail_log sight bridges
`);
