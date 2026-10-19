/* The Archive road's Living World (C-87; docs/future/work/LW1_AUTHORING.md): the last chapter's road, road events
 * only (no routines, no return keys). Its mood is the chapter's: the land quiet near the Hush's source; in a
 * twelve-chapter journey the colour drains and the lanterns' name slips peel off and drift uphill (sa2/10_approach.js)
 * until the Hush is settled (`sa_hush_down`); afterwards the colour is back and people walk the road down again.
 * W5 sa.road: the first time you climb it, a name slip from one of Lanternfall's lamps, caught on a thorn on its way
 *   up; read its name and it stops pulling (a keepsake). Then now and then: a paper crane holding words someone never
 *   said; wildflowers to tell apart by shape, the colour gone (or the light going); a traveller going up, puzzled by
 *   the box of sandals left "for those coming down". */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;
  const J = (jp, en) => ({ jp, en }); // a challenge's title: Japanese first (L.T is en, jp)
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
引っ掛かる|ひっかかる|v5r|I|to get caught (on something), to snag
分かれる|わかれる|v1|I|to divide, to split (into parts)
履き替え|はきかえ|n|I|a change of footwear (はきかえにどうぞ: for changing into)
切れ端|きれはし|n|I|a scrap, an offcut (of paper or cloth)
`), 'living');

  // each stands where it happens (RE-1): the name slip caught on a thorn bush under the middle terrace; the paper crane
  // glinting in a bush by the waystone at the foot of the road; the flower card by the box of sandals; a traveller
  // going up, at that box
  L.road('sa_road', { maps: ['sa.road'],
    unique: { id: 'slip', scene: 'sa.lw_road_slip', at: { props: [{ p: 'bush', x: 20, y: 14, meet: true }, { p: 'pet_papers', x: 19, y: 14, meet: true }] } },
    variants: [
      { id: 'crane', scene: 'sa.lw_road_crane', at: { props: [{ p: 'bush', x: 11, y: 23, meet: true }, { p: 'sparkle', x: 12, y: 23, meet: true }] } },
      { id: 'grey', scene: 'sa.lw_road_grey', at: { props: [{ p: 'fw_note', x: 23, y: 8, meet: true }] } },
      { id: 'sandals', scene: 'sa.lw_road_sandals', at: { who: [{ char: 'lw_rd_traveller', x: 26, y: 8, dir: 'left' }] } },
    ],
    stamp: { title: ['{書庫|しょこ} への {坂道|さかみち}', 'the Archive road'], ink: '#5a5a6e' } });
  C.items.lw_sa_slip = { name: T('Name slip: "Fish Street"', '{名札|なふだ} 「{魚|さかな}{通|どお}り」'), key: true,
    desc: 'A name slip from one of Lanternfall\'s lamp shades, caught on a thorn on the Archive road on its way uphill. Nagi has long since written the street\'s names again. A keepsake.' };
  C.notes.lw_sa_slips = { title: T('Name slips on the road', '{坂道|さかみち} の {名札|なふだ}'), fiction: true,
    jp: '{書庫|しょこ} への {坂道|さかみち} で は 、 {灯籠|とうろう} の {名札|なふだ} が {剥|は}がれて 、 {風|かぜ} も ない のに {上|うえ} へ {上|のぼ}って いく 。 {名前|なまえ} を {読|よ}んで やる と 、 {止|と}まる 。',
    en: 'On the Archive road, name slips peel off lantern shades and drift uphill though there is no wind. Read the name, and a slip stops.' };

  C.challenges['sa.lw_slip'] = { title: J('{剥|は}がれた {名札|なふだ}', 'A peeled-off name slip'), tiers: {
    F: [ch({ item: 'v:魚', ctx: { jp: 'なふだ ： 「さか □ どおり@通り」 （きえかけ の じ@字） 。 となり に 、 ちいさな さかな の え 。', en: '' }, prompt: { en: 'What does the slip say?' },
      options: [o('さかな どおり@通り', 1), o('さか どおり@通り', 0, 'Look at the picture beside it: a fish, さかな.'), o('さくら どおり@通り', 0, 'The picture is a fish, not a blossom.')] })],
    E: [ch({ item: 'v:通り', ctx: { jp: '{名札|なふだ} ： 「{魚|さかな} □ □」 。 {灯落|ひおち} の {灯|あか}り の {笠|かさ} に {貼|は}る 、 {通|とお}り の {名札|なふだ} の {形|かたち} だ 。', en: '' }, prompt: { en: 'Which name fits a street\'s slip?' },
      options: [o('{魚|さかな}{通|どお}り', 1), o('{魚|さかな} の {店|みせ}', 0, 'That is a shop, not a street.'), o('{魚|さかな} の {骨|ほね}', 0, 'Lamp shades carry street names.')] })],
    I: [ch({ item: 'g:relative_clause', ctx: { jp: '{名札|なふだ} の {裏|うら} ： 「{朝|あさ} {一番|いちばん} に 、 {舟|ふね} が {魚|さかな} を {運|はこ}んで くる {通|とお}り 。 ナギ」', en: '' }, prompt: { en: 'Which street is it?' },
      options: [o('{魚|さかな}{通|どお}り', 1), o('{記録館|きろくかん} の {前|まえ} の {通|とお}り', 0, 'No boats come to the Records Hall with fish.'), o('{庭|にわ} の {町|まち} の {通|とお}り', 0, 'Boats bringing fish: by the canal.')] })],
    A: [ch({ item: 'g:ni_chigainai', ctx: { jp: '{名札|なふだ} ： 「{魚|さかな}{通|どお}り」 。 {裏|うら} に {日付|ひづけ} 。 {灯落|ひおち} の {鐘|かね} が {鳴|な}る {前|まえ} の {日付|ひづけ} だ 。', en: '' }, prompt: { en: 'What can you tell about this slip?' },
      options: [o('{鐘|かね} が {鳴|な}る {前|まえ} に {剥|は}がれて 、 ここ まで {上|のぼ}って きた に {違|ちが}いない', 1), o('{鐘|かね} の {後|あと} に {書|か}かれた に {違|ちが}いない', 0, 'It is dated before the bell.'), o('この {坂道|さかみち} で {書|か}かれた に {違|ちが}いない', 0, 'It names a Lanternfall street: it was written there, for a lamp.')] })],
  } };
  C.challenges['sa.lw_crane'] = { title: J('{紙|かみ} の {鶴|つる}', 'A paper crane'), tiers: {
    F: [ch({ item: 'v:行ってらっしゃい', ctx: { jp: 'つる@鶴 の なか の じ@字 ： 「いってらっしゃい 。 きをつけて 。」', en: '' }, prompt: { en: 'When do people say this?' },
      options: [o('だれか が でかける とき@時', 1), o('だれか が かえって@帰る きた とき@時', 0, 'That would be おかえり.'), o('ねる まえ', 0, 'That would be おやすみ.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{鶴|つる} の {中|なか} の {字|じ} ： 「{気|き} を つけて {行|い}って きて ください 。 {夕方|ゆうがた} に は 、 {帰|かえ}って きて ください ね 。」', en: '' }, prompt: { en: 'What does the writer want?' },
      options: [o('{夕方|ゆうがた} まで に {帰|かえ}って きて ほしい', 1), o('{一緒|いっしょ} に {行|い}きたい', 0, 'They are staying; the other is going.'), o('もう {会|あ}いたく ない', 0, '帰ってきてね: come back.')] })],
    I: [ch({ item: 'g:noni', ctx: { jp: '「{言|い}おう と {思|おも}って いた のに 、 {言|い}えなかった 。 {行|い}かないで 、 と 。」', en: '' }, prompt: { en: 'What happened?' },
      options: [o('「{行|い}かないで」 と {言|い}いたかった が 、 {言|い}えなかった', 1), o('「{行|い}かないで」 と {言|い}った', 0, 'のに…言えなかった: they meant to, and could not.'), o('{行|い}って ほしかった', 0, '行かないで: don\'t go.')] })],
    A: [ch({ item: 'g:adv_zu_ni_wa_irarenai', ctx: { jp: '「{書|か}かず に は いられなかった 。 {渡|わた}す つもり は ない けれど 。」', en: '' }, prompt: { en: 'Why was this written?' },
      options: [o('{書|か}かず に いられなかった から 。 {渡|わた}す ため で は ない 。', 1), o('{相手|あいて} に {渡|わた}す ため', 0, '渡すつもりはない: they never meant to hand it over.'), o('{誰|だれ} か に {頼|たの}まれた から', 0, 'ずにはいられなかった: they could not help it.')] })],
  } };
  C.challenges['sa.lw_grey'] = { title: J('{色|いろ} の ない {花|はな}', 'Flowers without colour'), tiers: {
    F: [ch({ item: 'v:紫', ctx: { jp: 'ふだ ： 「むらさき の はな@花 は 、 せ が たかい 。 あかい はな@花 は 、 ひくい 。」', en: '' }, prompt: { en: 'Which flower is the purple one?' },
      options: [o('いちばん せ が たかい はな@花', 1), o('いちばん ひくい はな@花', 0, 'ひくい is the red one.')] })],
    E: [ch({ item: 'g:comp_yori_hou', ctx: { jp: '{札|ふだ} ： 「{紫|むらさき} の {花|はな} は 、 {黄色|きいろ} の {花|はな} より {背|せ} が {高|たか}い です 。 {赤|あか} が {一番|いちばん} {低|ひく}い です 。」 {三本|さんぼん} の {花|はな} は 、 {背|せ} の {高|たか}さ が どれ も {違|ちが}う 。', en: '' }, prompt: { en: 'Which do you pick?' },
      options: [o('{一番|いちばん} {背|せ} の {高|たか}い {花|はな}', 1), o('{真|ま}ん{中|なか} の {高|たか}さ の {花|はな}', 0, 'That is the yellow one.'), o('{一番|いちばん} {低|ひく}い {花|はな}', 0, 'That is the red one.')] })],
    I: [ch({ item: 'g:no_pronoun', ctx: { jp: '{札|ふだ} ： 「{花|はな} が {五|いつ}つ に {分|わ}かれて いる の が 、 {紫|むらさき} です 。 {丸|まる}い の は {黄色|きいろ} です 。」', en: '' }, prompt: { en: 'Which is the purple one?' },
      options: [o('{花|はな} が {五|いつ}つ に {分|わ}かれて いる の', 1), o('{丸|まる}い の', 0, '丸いの is the yellow.')] })],
    A: [ch({ item: 'g:adv_sasuga_semete', ctx: { jp: '{札|ふだ} の {裏|うら} ： 「{色|いろ} が {見|み}えなくとも 、 せめて {形|かたち} で {分|わ}かる よう に 。 オヨネ」', en: '' }, prompt: { en: 'Why did Oyone describe the shapes?' },
      options: [o('{色|いろ} が {見|み}えなくて も 、 {形|かたち} で なら {分|わ}かる よう に', 1), o('{色|いろ} の {名前|なまえ} を {知|し}らない から', 0, 'せめて: at least by shape, if not by colour.'), o('{形|かたち} の {方|ほう} が {美|うつく}しい から', 0, 'It is about being able to tell them apart.')] })],
  } };
  C.challenges['sa.lw_sandals'] = { title: J('わらじ の {箱|はこ}', 'The box of sandals'), tiers: {
    F: [ch({ item: 'v:下り', ctx: { jp: 'ふだ ： 「くだり の かた@方 へ 。 はきかえ@履き替え に どうぞ 。」', en: '' }, prompt: { en: 'Who are these sandals for?' },
      options: [o('やま から おりて くる ひと', 1), o('やま へ のぼる ひと', 0, 'くだり: going down.')] })],
    E: [ch({ item: 'v:上り', ctx: { jp: '{札|ふだ} ： 「{下|くだ}り の {方|かた} へ 。 {上|のぼ}り の {方|かた} に は 、 {小屋|こや} で {差|さ}し{上|あ}げます 。」', en: '' }, prompt: { en: 'The traveller is going up. Where can they get sandals?' },
      options: [o('{上|うえ} の {小屋|こや} で', 1), o('この {箱|はこ} から', 0, 'The box is for those coming down.'), o('{灯落|ひおち} で', 0, '小屋で差し上げます: at the hut.')] })],
    I: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{札|ふだ} ： 「{上|のぼ}り の {方|かた} に は 、 {小屋|こや} で お{渡|わた}し いたします 。 ── {最後|さいご} の {灯|ひ} の {小屋|こや}」', en: '' }, prompt: { en: 'Who will hand the sandals over?' },
      options: [o('{小屋|こや} の {人|ひと}', 1), o('{上|のぼ}る {旅人|たびびと} {自身|じしん}', 0, 'お渡しいたします is the writer\'s own humble act.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: '{旅人|たびびと} ： 「{下|くだ}り の {方|かた} の 、 か …… 。 {帰|かえ}って くる {人|ひと} の ため の もの なん です ね 。」', en: '' }, prompt: { en: 'What has the traveller understood?' },
      options: [o('わらじ は 、 {人|ひと} が {帰|かえ}って くる と {思|おも}って {置|お}いて ある', 1), o('{上|のぼ}る {人|ひと} は {帰|かえ}れない', 0, 'The box assumes people do come back.'), o('わらじ は {売|う}り{物|もの} だ', 0, 'Nothing says they are sold: they are left for whoever comes down.')] })],
  } };

  L.scenes(`
@scene sa.lw_road_slip
# Road event (W5): the Archive road's own, the first time you climb it. A lamp's name slip, caught on a thorn on its
# way uphill.
narr: {白|しろ}い {紙|かみ} の {切|き}れ{端|はし} が 、 {風|かぜ} も ない のに 、 {坂|さか} を {上|のぼ}って いく 。 {一枚|いちまい} が 、 {茨|いばら} に {引|ひ}っ{掛|か}かって {震|ふる}えて いる 。 || Scraps of white paper are travelling uphill, though there is no wind. One has caught on a thorn and hangs there, trembling.
narr: {灯籠|とうろう} の {笠|かさ} から {剥|は}がれた {名札|なふだ} らしい 。 {墨|すみ} が {薄|うす}く 、 {字|じ} が {半分|はんぶん} {消|き}えて いる 。 || A name slip, peeled off a lantern's shade by the look of it. The ink is pale, and half the writing has gone.
!challenge sa.lw_slip
!if var._res=0 -> later
narr: 「{魚|さかな}{通|どお}り」 。 {名前|なまえ} を {読|よ}んだ とたん 、 {上|うえ} へ {引|ひ}っ{張|ぱ}る {力|ちから} が {消|き}えた 。 || "Fish Street." The moment you read the name, the pull uphill stops.
narr: {灯落|ひおち} の {通|とお}り の {名札|なふだ} だ 。 {手帳|てちょう} に {挟|はさ}んで おこう 。 || One of Lanternfall's street names. You tuck it into your notebook.
!give lw_sa_slip
!note lw_sa_slips
!hook road_done sa_road slip
!end
:later
narr: {名札|なふだ} は {茨|いばら} から {外|はず}れて 、 また {坂|さか} を {上|のぼ}って いった 。 || The slip comes free of the thorn and goes on up the slope.

@scene sa.lw_road_crane
narr: {道|みち} の {脇|わき} の {茂|しげ}み に 、 {白|しろ}い {紙|かみ} の {鶴|つる} が {一羽|いちわ} {引|ひ}っ{掛|か}かって いる 。 {羽|はね} の {内側|うちがわ} に 、 {字|じ} が {透|す}けて {見|み}える 。 || A white paper crane is caught in a bush by the road. Writing shows through from the inside of its wings.
narr: そっと {開|ひら}いて みる 。 || You open it carefully.
!challenge sa.lw_crane
!if var._res=0 -> later
narr: {誰|だれ} か が {言|い}えなかった {言葉|ことば} だ 。 {鶴|つる} を {元|もと} の {形|かたち} に {折|お}って 、 {道標|みちしるべ} の {上|うえ} に 、 {坂|さか} の {下|した} へ {向|む}けて {置|お}いた 。 || Words someone never managed to say. You fold the crane back into shape and set it on the waystone, facing downhill.
?(sa_hush_down) narr: {風|かぜ} が {吹|ふ}いて 、 {鶴|つる} は {町|まち} の {方|ほう} へ {下|くだ}って いった 。 || A breeze lifts it, and the crane sails off down towards the town.
!hook road_done sa_road crane
!end
:later
narr: {鶴|つる} を {元|もと} の {茂|しげ}み に {戻|もど}した 。 || You put the crane back in its bush.

@scene sa.lw_road_grey
?(ed>=2&!sa_hush_down) narr: {道|みち} の {脇|わき} の {野|の}の{花|はな} が 、 {色|いろ} を なくして@無くす いる 。 {赤|あか} も {紫|むらさき} も 、 {同|おな}じ {灰色|はいいろ} だ 。 || The wildflowers by the path have lost their colour. Red and purple alike, the same grey.
?(!ed>=2|sa_hush_down) narr: {道|みち} の {脇|わき} に 、 {野|の}の{花|はな} が {咲|さ}いて いる 。 {夕方|ゆうがた} の {光|ひかり} で 、 {色|いろ} が よく {分|わ}からない 。 || Wildflowers bloom by the path. In the evening light their colours are hard to tell apart.
narr: {小|ちい}さな {札|ふだ} が {立|た}って いる 。 「{小屋|こや} の {灯|ひ} の {横|よこ} に {飾|かざ}る 、 {紫|むらさき} の {花|はな} を {一本|いっぽん} 。 {最後|さいご} の {灯|ひ} の {小屋|こや}」 || A little card stands among them: "One purple flower, to put by the hut's lamp. —The Last Lamp Hut"
!challenge sa.lw_grey
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り に {一本|いっぽん} {選|えら}んで 、 わらじ の {箱|はこ} の {上|うえ} に {置|お}いた 。 {小屋|こや} の {人|ひと} が {通|とお}れば 、 {持|も}って {行|い}く だろう 。 || You pick one as the card describes and lay it on the box of sandals. Someone from the hut will take it up when they pass.
!hook road_done sa_road grey
!end
:later
narr: どれ が {紫|むらさき} か 、 {分|わ}からない まま だ 。 || You still can't tell which one is the purple.

@scene sa.lw_road_sandals
narr: わらじ の {箱|はこ} の {前|まえ} で 、 {旅人|たびびと} が {一人|ひとり} 、 {擦|す}り{切|き}れた わらじ を {見下|みお}ろして いる 。 {上|のぼ}って いく {途中|とちゅう} らしい 。 || By the box of sandals a traveller stands looking down at a worn-out pair. On the way up, by the look of it.
!challenge sa.lw_sandals
!if var._res=0 -> later
narr: {小屋|こや} で {新|あたら}しい わらじ が もらえる と {分|わ}かって 、 {旅人|たびびと} は {頭|あたま} を {下|さ}げ 、 {坂|さか} を {上|のぼ}って いった 。 || Knowing a new pair waits at the hut, the traveller bows and goes on up the slope.
?(post) narr: {帰|かえ}り に は 、 この {箱|はこ} の わらじ を {履|は}く の だろう 。 || On the way back down, they'll wear a pair from this box.
!hook road_done sa_road sandals
!end
:later
narr: {旅人|たびびと} は {首|くび} を かしげて 、 {箱|はこ} の {前|まえ} で {迷|まよ}って いる 。 || The traveller tilts their head, hesitating in front of the box.
`);
})(RB.living);
