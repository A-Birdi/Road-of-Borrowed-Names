/* The Mill Road's events (C-87, W5; docs/future/work/LW1_ROLLOUT.md). The road up to the old mill is Chapter 1's own
 * (the narrows, the reed bed, the wheel); its events start once you have set out (`when: 'departed'`), for a walk back
 * up to the turning wheel, never in the middle of the first chapter. The first time: Sakuzō, a farmer taking buckwheat
 * to be ground, whose sack tags the rain has blurred. Then now and then: the narrows lantern's oil note, the reed
 * cutters' rule, a child fishing by the wheel. Scene ids are `rw.`: they name nothing beyond Reedwake. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L, C) {
  'use strict';
  const T = L.T;
  RB.lex.add(RB.lex.parseTable(`
サクゾウ|サクゾウ|name|F|Sakuzō, a farmer who takes his buckwheat up the Mill Road (fictional)
挽く|ひく|v5k|I|to grind (grain into flour), to mill
粉挽き|こなひき|n|A|a miller; grinding flour
湿る|しめる|v5r|I|to become damp
湿り気|しめりけ|n|A|dampness, moisture
後日|ごじつ|n|A|another day, at a later date
煤|すす|n|A|soot
刈る|かる|v5r|I|to cut (grass, reeds, hair), to mow
葦刈り|あしかり|n|A|reed cutting; a reed cutter
生える|はえる|v1|I|to grow (of plants, hair), to come up
釣れる|つれる|v1|I|(of fish) to be caught, to bite
おや||int|E|oh! (mild surprise)
頼りない|たよりない|adj-i|A|unreliable; feeble, faint (頼りなく揺れる: to flicker feebly)
`));
  // a farmer on his way up to the mill (a road's own face)
  C.chars.lw_sakuzo = { name: T('Sakuzō', 'サクゾウ'), voice: { pitch: 0.84 },
    look: { skin: 2, hair: 'short', hairColor: 5, cloth: ['#6a5a3a', '#4e4430', '#d8c8a0'], shape: 'tunic', acc: ['headband'], bandCol: '#d8d0b8', age: 'old' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#d8d0b8', bg: '#2e3024' } };
  C.maps['rw.millroad'].npcs.push({ id: 'lw_sakuzo', x: 9, y: 21, dir: 'down', if: 'departed&!lw_rw_mill_sacks_done', talk: 'rw.lw_road_mill_sacks' });
  C.maps['rw.millroad'].props.push({ p: 'cart', x: 8, y: 20, if: 'departed&!lw_rw_mill_sacks_done' });
  // each stands where it happens (RE-1): Sakuzō by his cart (placed above), a sack unloaded at either end of it; the
  // oil note on a post beside the narrows lantern; a reed-cutter on the river bank in the reeds, the sign by him; a
  // child under the turning wheel, the sign beside the mill
  L.road('rw_mill', { maps: ['rw.millroad'], when: 'departed',
    unique: { id: 'sacks', scene: 'rw.lw_road_mill_sacks', at: { props: [{ p: 'lf_floursacks', x: 7, y: 20, meet: true }, { p: 'lf_floursacks', x: 10, y: 20, meet: true }] } },
    variants: [
      { id: 'oil', scene: 'rw.lw_road_mill_oil', at: { props: [{ p: 'fw_postnote', x: 8, y: 17, meet: true }] } },
      { id: 'reeds', scene: 'rw.lw_road_mill_reeds', at: { who: [{ char: 'lw_rd_worker', x: 17, y: 10, dir: 'right' }], props: [{ p: 'sign', x: 17, y: 8, meet: true }] } },
      { id: 'fish', scene: 'rw.lw_road_mill_fish', at: { who: [{ char: 'lw_rd_child', x: 15, y: 4, dir: 'up' }], props: [{ p: 'sign', x: 13, y: 4, meet: true }] } },
    ],
    stamp: { title: ['{水車|すいしゃ}{小屋|ごや} へ の {道|みち}', 'the Mill Road'], motif: 'path', ink: '#4a6a3a' } });
  C.notes.lw_water_mills = { title: T('Water mills', '{水車|すいしゃ}{小屋|ごや}'), fiction: false,
    jp: '{水車|すいしゃ}{小屋|ごや} は 、 {昔|むかし} 、 {多|おお}く の {村|むら} の {川|かわ} に あった 。 そば@蕎麦=(buckwheat) や {麦|むぎ} を {粉|こな} に {挽|ひ}いたり 、 {米|こめ} を {白|しろ}く したり した 。 {村|むら} の {人|ひと} は {順番|じゅんばん} に {使|つか}った 。',
    en: 'Water mills once stood on the streams of many Japanese villages, grinding buckwheat and wheat into flour and polishing rice. The village took turns to use them.' };

  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  C.challenges['rw.lw_sacks'] = { title: T('The blurred tags', '{濡|ぬ}れた {札|ふだ}'), tiers: {
    F: [ch({ item: 'v:今日', ctx: { jp: 'ふだ ： 「きょう ひく@挽く 。」 ・ 「らいしゅう ひく@挽く 。」', en: '' }, prompt: { en: 'Two sacks, two tags. Which sack goes to the mill today?' }, options: [o('「きょう」 の ふくろ', 1), o('「らいしゅう」 の ふくろ', 0, 'らいしゅう is next week.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{札|ふだ} ： 「{今日|きょう} 、 {挽|ひ}いて ください 。」 ・ 「{来週|らいしゅう} まで 、 {倉|くら} に {置|お}いて ください 。」', en: '' }, prompt: { en: 'What happens to the second sack?' }, options: [o('{来週|らいしゅう} まで {倉|くら} に {置|お}く', 1), o('{今日|きょう} {挽|ひ}く', 0, 'That is the first tag.'), o('{来週|らいしゅう} から {倉|くら} に {置|お}く', 0, 'まで: it stays in the store until next week.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{札|ふだ} ： 「{濡|ぬ}れて いたら 、 {先|さき} に {挽|ひ}く こと 。 {乾|かわ}いて いる {物|もの} は 、 {後|あと} で いい 。」 （{左|ひだり} の {袋|ふくろ} は {濡|ぬ}れて いる 。）', en: '' }, prompt: { en: 'Which sack goes to the mill today?' }, options: [o('{濡|ぬ}れて いる {左|ひだり} の {袋|ふくろ}', 1), o('{乾|かわ}いて いる {右|みぎ} の {袋|ふくろ}', 0, '乾いている物は後でいい: the dry one can wait.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{粉挽|こなひ}き の {貼|は}り{紙|がみ} ： 「{湿|しめ}った {袋|ふくろ} を お{持|も}ち の {方|かた} は 、 {先|さき} に お{持|も}ち ください 。 {乾|かわ}いた {物|もの} は 、 {後日|ごじつ} で {結構|けっこう} です 。」 （{左|ひだり} の {袋|ふくろ} は {湿|しめ}って いる 。）', en: '' }, prompt: { en: 'The miller\'s notice is polite. Which sack does it want brought first?' }, options: [o('{湿|しめ}った {左|ひだり} の {袋|ふくろ}', 1), o('{乾|かわ}いた {右|みぎ} の {袋|ふくろ}', 0, '後日で結構です: another day will do for dry ones.'), o('どちら が {先|さき} でも いい', 0, '先にお持ちください: the damp ones first.')] })],
  } };
  C.challenges['rw.lw_oil'] = { title: T('The lantern\'s oil', '{灯|ひ} の {油|あぶら}'), tiers: {
    F: [ch({ item: 'v:少し', ctx: { jp: 'ふだ ： 「あぶら は すこし だけ 。 いっぱい いれないで@入れる 。」', en: '' }, prompt: { en: 'How much oil should you put in?' }, options: [o('すこし だけ', 1), o('いっぱい', 0, 'いっぱい いれないで: don\'t fill it up.')] })],
    E: [ch({ item: 'g:prt_dake_shika', ctx: { jp: '{札|ふだ} ： 「{油|あぶら} は {少|すこ}し だけ {入|い}れて ください 。 {多|おお}い と 、 {煙|けむり} が {出|で}ます 。」', en: '' }, prompt: { en: 'Why only a little?' }, options: [o('{多|おお}い と {煙|けむり} が {出|で}る から', 1), o('{油|あぶら} が {高|たか}い から', 0, 'The note gives smoke as the reason.')] })],
    I: [ch({ item: 'g:v_sugiru', ctx: { jp: '{札|ふだ} ： 「{油|あぶら} を {入|い}れすぎる と 、 {煤|すす} で {紙|かみ} が {黒|くろ}く なる 。 {半分|はんぶん} まで に して おく こと 。」', en: '' }, prompt: { en: 'How full should you fill it?' }, options: [o('{半分|はんぶん} まで', 1), o('いっぱい まで', 0, '入れすぎると: too much, and the soot blackens the paper.'), o('{少|すこ}し も {入|い}れない', 0, 'It asks for up to half, not none.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: '{札|ふだ} ： 「この {灯|ひ} は 、 {村|むら} の {者|もの} が {交代|こうたい} で {守|まも}って いる 。 {通|とお}る {人|ひと} が {油|あぶら} を {足|た}して くれる と 、 {助|たす}かる 。」', en: '' }, prompt: { en: 'What is the note asking of passers-by?' }, options: [o('{油|あぶら} を {足|た}して ほしい', 1), o('{灯|ひ} を {消|け}して ほしい', 0, 'They want it kept lit.'), o('{交代|こうたい} で {番|ばん} を して ほしい', 0, 'The villagers take turns; passers-by are only asked to top up the oil.')] })],
  } };
  C.challenges['rw.lw_reeds'] = { title: T('The reed cutters\' rule', '{葦|あし}{刈|か}り の {決|き}まり'), tiers: {
    F: [ch({ item: 'v:根', ctx: { jp: 'ふだ ： 「あし@葦 を かる とき は 、 ね@根 を きらないで ください 。」', en: '' }, prompt: { en: 'What must reed cutters leave alone?' }, options: [o('ね@根', 1), o('あし@葦 の うえ', 0, 'ね is the root. The tops may be cut.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{立|た}て{札|ふだ} ： 「{葦|あし} を {刈|か}る {時|とき} は 、 {根|ね} を {切|き}らないで ください 。」', en: '' }, prompt: { en: 'What does the sign ask?' }, options: [o('{根|ね} を {切|き}らない', 1), o('{葦|あし} を {刈|か}らない', 0, 'Cutting the reeds is fine; only not the roots.')] })],
    I: [ch({ item: 'g:cond_ba', ctx: { jp: '{立|た}て{札|ふだ} ： 「{根|ね} を {残|のこ}して おけば 、 {来年|らいねん} も また {生|は}えて くる 。」', en: '' }, prompt: { en: 'Why leave the roots?' }, options: [o('{来年|らいねん} も また {生|は}えて くる から', 1), o('{根|ね} は {使|つか}えない から', 0, 'The sign says nothing about using them.'), o('{来年|らいねん} {刈|か}る から', 0, '残しておけば: leave them, and the reeds grow back.')] })],
    A: [ch({ item: 'g:casual_contractions', ctx: { jp: '{葦|あし}{刈|か}り ： 「{根|ね} まで {抜|ぬ}いちゃう {人|ひと} が いる ん だ よ 。 {来年|らいねん} の こと も {考|かんが}えて ほしい もん だ ね 。」', en: '' }, prompt: { en: 'What is the reed cutter grumbling about?' }, options: [o('{根|ね} まで {抜|ぬ}く {人|ひと} が いる こと', 1), o('{葦|あし} が もう {生|は}えない こと', 0, 'Not yet: it is the people pulling up the roots.'), o('{来年|らいねん} は {刈|か}れない こと', 0, 'They want people to think about next year, that is all.')] })],
  } };
  C.challenges['rw.lw_fish'] = { title: T('Fishing by the wheel', '{水車|すいしゃ} の そば の {釣|つ}り'), tiers: {
    F: [ch({ item: 'v:近く', ctx: { jp: 'ふだ ： 「すいしゃ の ちかく で つり を しないで ください 。」', en: '' }, prompt: { en: 'Where should the child not fish?' }, options: [o('すいしゃ の ちかく', 1), o('むら の はし@端', 0, 'The sign is about the wheel.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{札|ふだ} ： 「{水車|すいしゃ} の {近|ちか}く で {釣|つ}り を しないで ください 。 {下|しも} の {橋|はし} から なら 、 いい です 。」', en: '' }, prompt: { en: 'Where may you fish?' }, options: [o('{下|しも} の {橋|はし} から', 1), o('{水車|すいしゃ} の {近|ちか}く', 0, 'しないでください: not near the wheel.')] })],
    I: [ch({ item: 'g:rashii', ctx: { jp: '{子|こ}ども ： 「{水車|すいしゃ} の {下|した} に は 、 {魚|さかな} が {集|あつ}まる らしい ん だ 。 でも 、 {近|ちか}づく と {危|あぶ}ない って 。」', en: '' }, prompt: { en: 'What has the child heard?' }, options: [o('{魚|さかな} が {集|あつ}まる けれど 、 {近|ちか}づく と {危|あぶ}ない', 1), o('{水車|すいしゃ} の {下|した} に は {魚|さかな} が いない', 0, 'らしい: the fish gather there, people say.'), o('{近|ちか}づいて も {大丈夫|だいじょうぶ}', 0, '危ないって: they were told it is dangerous.')] })],
    A: [ch({ item: 'g:casual_contractions', ctx: { jp: '{子|こ}ども ： 「{危|あぶ}ない の は {分|わ}かってる けど さ 。 ここ が {一番|いちばん} {釣|つ}れる ん だ もん 。」', en: '' }, prompt: { en: 'Why does the child want to fish here anyway?' }, options: [o('ここ が {一番|いちばん} {釣|つ}れる から', 1), o('{危|あぶ}ない と {知|し}らない から', 0, '分かってる: they know it is dangerous.')] })],
  } };

  L.scenes(`
@scene rw.lw_road_mill_sacks
# Road event (W5): the Mill Road's own, the first time you walk up it after setting out
!look lw_sakuzo pc
lw_sakuzo: おや 、 {旅|たび} の {人|ひと} 。 ちょうど いい ところ に 。 || Oh, a traveller. Just the person.
lw_sakuzo: {水車|すいしゃ} が また {回|まわ}る よう に なった ので 、 そば@蕎麦=(buckwheat) を {挽|ひ}いて もらおう と {思|おも}って ね 。 || The wheel's turning again, so I thought I'd have my buckwheat ground.
lw_sakuzo: ところが 、 {雨|あめ} で {袋|ふくろ} の {札|ふだ} が {濡|ぬ}れて しまって 。 どれ を {今日|きょう} {持|も}って いけば いい か 、 {読|よ}んで くれない か 。 || But the rain's got at the tags on my sacks. Could you read me which one to take up today?
!challenge rw.lw_sacks
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り=(just as) に 、 {今日|きょう} の {袋|ふくろ} を {荷車|にぐるま} の {前|まえ} に {載|の}せ{替|か}えた 。 || As the tag says, you move today's sack to the front of the cart.
lw_sakuzo[laugh]: ありがたい 。 これ で {順番|じゅんばん} を {間違|まちが}えず に すむ@済む 。 || Much obliged. Now I won't get my turn wrong.
!note lw_water_mills
!set lw_rw_mill_sacks_done
!hook road_done rw_mill sacks
!refresh
!end
:later
lw_sakuzo: いや 、 {急|いそ}がない よ 。 {水車|すいしゃ} は {逃|に}げない から ね 。 || Oh, there's no hurry. The wheel's not going anywhere.

@scene rw.lw_road_mill_oil
narr: {狭|せま}い {道|みち} の {灯|ひ} が 、 {細|ほそ}く {揺|ゆ}れて いる 。 {柱|はしら} に {油|あぶら} の {缶|かん} と {札|ふだ} が {下|さ}がって いる 。 || The lantern in the narrows is guttering. A tin of oil and a note hang from its post.
!challenge rw.lw_oil
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り=(just as) に {油|あぶら} を {足|た}す と 、 {灯|ひ} は {落|お}ち{着|つ}いて {明|あか}るく なった 。 || You top up the oil as the note says, and the flame steadies and brightens.
!hook road_done rw_mill oil
!end
:later
narr: {灯|ひ} は {頼|たよ}りなく {揺|ゆ}れて いる 。 || The flame still wavers.

@scene rw.lw_road_mill_reeds
narr: {葦|あし} の {茂|しげ}み で 、 {誰|だれ} か が {鎌|かま} で {葦|あし} を {刈|か}って いる 。 {立|た}て{札|ふだ} が ある 。 || In the reed bed someone is cutting reeds with a sickle. There is a sign.
!challenge rw.lw_reeds
!if var._res=0 -> later
narr: {根|ね} を {残|のこ}して {刈|か}る の を {手伝|てつだ}う と 、 {葦|あし}{刈|か}り は {笑|わら}って {頭|あたま} を {下|さ}げた 。 || You help cut, leaving the roots, and the reed cutter smiles and bows.
!hook road_done rw_mill reeds
!end
:later
narr: {葦|あし}{刈|か}り は {黙|だま}って {刈|か}り{続|つづ}けて いる 。 || The reed cutter works on in silence.

@scene rw.lw_road_mill_fish
narr: {水車|すいしゃ} の そば で 、 {子|こ}ども が {釣|つ}り{竿|ざお} を {持|も}って いる 。 {立|た}て{札|ふだ} が ある 。 || By the wheel a child is holding a fishing rod. There is a sign.
!challenge rw.lw_fish
!if var._res=0 -> later
narr: {札|ふだ} を {一緒|いっしょ} に {読|よ}む と 、 {子|こ}ども は {下|しも} の {橋|はし} の {方|ほう} へ {走|はし}って いった 。 || You read the sign together, and the child runs off towards the bridge downstream.
!hook road_done rw_mill fish
!end
:later
narr: {子|こ}ども は {水車|すいしゃ} の そば から {動|うご}かない 。 || The child won't budge from beside the wheel.
`);
})(RB.living, RB.content);
