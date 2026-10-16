/* Returns (expansion P15g; plan 10_STORY.md §10): Kotonoha matured, and its deepest grove. After the story a second
 * root arch opens at the back of the Garden of Unsent Words, onto a small grove where the names nobody came for are
 * kept. What fills it follows the ending's choice about the Archive: with its doors open as a library
 * (end_archive_library) its readers copy every unclaimed name and the tide brings the copies here, and islanders come
 * to read them; with its doors closed (end_archive_closed) the names drifted here by themselves, and the grove keeps
 * them quietly, as the Archive did. The player reads a leaf, and may leave one of their own (to whom is their choice);
 * Otoha has a word about the grove afterwards. Twelve-chapter journeys only (Kotonoha's maps are). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const ok = (parts, en, result) => ({ parts, ok: true, en, result });
  const no = (parts, en, why, result) => ({ parts, ok: false, en, why: { en: why }, result });
  const G = C.maps['ko.garden'];
  G.props = (G.props || []).concat([{ p: 'ko_rootarch', x: 21, y: 3, if: 'ed>=2&postgame', scene: 'rt.grove_arch' }]);
  C.maps['ko.grove'] = {
    name: T('The Deepest Grove', '{一番|いちばん} {奥|おく} の {森|もり}'), region: G.region, place: G.place, music: G.music, edition: 2, noTravel: true, travelKind: 'dungeon', setting: G.setting, // part of the Root Hollows, as the garden is
    ambient: Object.assign({}, G.ambient, { dark: 0.5 }),
    terrain: K.build(16, 12, '#', (k) => { k.rect(1, 1, 14, 10, '.'); k.rect(7, 11, 2, 1, '.'); k.scatter(',', 6, 1601, [1, 1, 14, 10], '.'); }),
    props: [
      { p: 'ko_camphor', x: 6, y: 3, scene: 'rt.grove_tree' },
      { p: 'ko_leaves', x: 2, y: 2, scene: 'rt.grove_leaf' }, { p: 'ko_leaves', x: 11, y: 2 }, { p: 'ko_leaves', x: 2, y: 7 },
      { p: 'ko_leaves', x: 12, y: 7, scene: 'rt.grove_write' }, { p: 'ko_basket', x: 9, y: 8 },
    ],
    npcs: [],
    exits: [{ x: 7, y: 11, w: 2, h: 1, to: 'ko.garden', tx: 21, ty: 4, dir: 'down' }],
    spawn: { default: [7, 10, 'up'] },
  };

  // the leaf you read (four levels) and the leaf you may leave (your choice of to whom)
  C.challenges['rt.grove_leaf'] = { title: T('A leaf nobody came for', '{誰|だれ} も {取|と}り に {来|こ}なかった {葉|は}'), tiers: {
    F: [ch({ item: 'g:prt_he', ctx: { jp: 'はなこ へ 。 あした 、 はし の うえ で まって います 。 たろう', en: '' }, prompt: T('Who wrote this leaf, and to whom?'),
      options: [o('たろう が 、 はなこ に かいた 。', 1), o('はなこ が 、 たろう に かいた 。', 0, 'へ marks who it is to: はなこ へ. The name at the end is who wrote it.')] })],
    E: [ch({ item: 'g:prt_he', ctx: { jp: '{花子|はなこ} へ 。 {明日|あした} 、 {橋|はし} の {上|うえ} で {待|ま}って います 。 {太郎|たろう}', en: '' }, prompt: T('Who wrote this leaf, to whom, and what does it say?'),
      options: [o('{太郎|たろう} が {花子|はなこ} に 、 {橋|はし} の {上|うえ} で {待|ま}つ と {書|か}いた 。', 1), o('{花子|はなこ} が {太郎|たろう} に 、 {橋|はし} で {待|ま}つ と {書|か}いた 。', 0, 'へ marks who it is to: {花子|はなこ} へ.'), o('{太郎|たろう} が {花子|はなこ} に 、 {来|こ}ないで と {書|か}いた 。', 0, '{待|ま}って います: he is waiting, not turning her away.')] })],
    I: [ch({ item: 'g:v_te_iru', ctx: { jp: '{花子|はなこ} へ 。 {明日|あした} 、 {橋|はし} の {上|うえ} で {待|ま}って います 。 {来|こ}られなくて も 、 {待|ま}って います 。 {太郎|たろう}', en: '' }, prompt: T('What does 来られなくても add?'),
      options: [o('{花子|はなこ} が {来|こ}られなくて も 、 {太郎|たろう} は {待|ま}つ つもり だ 。', 1), o('{花子|はなこ} が {来|こ}なければ 、 {太郎|たろう} は {帰|かえ}る 。', 0, '〜ても: even if. He will wait even if she cannot come.'), o('{太郎|たろう} は {来|こ}られない 。', 0, '{来|こ}られなくても is about her coming, not his.')] })],
    A: [ch({ item: 'g:temo', ctx: { jp: '{花子|はなこ} へ 。 {明日|あした} 、 {橋|はし} の {上|うえ} で {待|ま}って います 。 {来|こ}られなくて も 、 {待|ま}って います 。 {待|ま}つ の は 、 {苦|く} に なりません から 。 {太郎|たろう}', en: '' }, prompt: T('Why, by the leaf, does Tarō not mind waiting?'),
      options: [o('{待|ま}つ こと が 、 {彼|かれ} に とって {苦|く} で は ない から 。', 1), o('{花子|はなこ} が {必|かなら}ず {来|く}る と {知|し}って いる から 。', 0, 'He writes that he will wait even if she cannot come.'), o('{橋|はし} の {上|うえ} が {好|す}き だ から 。', 0, 'The leaf says waiting is no hardship (苦になりません), nothing about liking bridges.')] })],
  } };
  const tiers = (low, high) => ({ F: [low], E: [low], I: [high], A: [high] });
  C.challenges['rt.grove_write'] = { title: T('A leaf of your own', '{自分|じぶん} の {葉|は}'), tiers: tiers(
    F({ id: 'rt.grove_write.low', item: 'g:prt_he', prompt: T('Leave a leaf of your own in the grove. To whom is your choice.'),
      families: [
        ok(['ふるさと の みんな へ 。', 'げんき で います 。'], 'To everyone back home: I\'m well.', 'home'),
        ok(['みち で あった ひと たち へ 。', 'げんき で います 。'], 'To the people I met on the road: I\'m well.', 'road'),
        ok(['まだ あって いない ひと へ 。', 'げんき で います 。'], 'To someone I haven\'t met yet: I\'m well.', 'future'),
        no(['ふるさと の みんな を 。', 'げんき で います 。'], 'Everyone back home (object): I\'m well.', 'A leaf is written to someone: へ, not を.', 'wo'),
      ] }),
    F({ id: 'rt.grove_write.high', item: 'g:prt_he', prompt: T('Leave a leaf of your own in the grove. To whom is your choice.'),
      families: [
        ok(['{故郷|ふるさと} の {皆|みんな} へ 。', 'いつ か 、 {話|はな}し に {帰|かえ}ります 。'], 'To everyone back home: one day I\'ll come back and tell you all of it.', 'home'),
        ok(['{道|みち} で {出会|であ}った {人|ひと} たち へ 。', 'いつ か 、 {話|はな}し に {帰|かえ}ります 。'], 'To the people I met on the road: one day I\'ll come back and tell you all of it.', 'road'),
        ok(['まだ {会|あ}って いない {人|ひと} へ 。', 'いつ か 、 {話|はな}し に {行|い}きます 。'], 'To someone I haven\'t met yet: one day I\'ll come and tell you all of it.', 'future'),
        no(['まだ {会|あ}って いない {人|ひと} へ 。', 'いつ か 、 {話|はな}し に {帰|かえ}ります 。'], 'To someone I haven\'t met yet: one day I\'ll come back and tell you.', 'You can\'t come back to someone you have never met: {行|い}きます, not {帰|かえ}ります.', 'back'),
      ] })) };

  RB.script.add(`
@scene rt.grove_arch
!if rt_grove_seen -> go
narr: {根|ね} の {奥|おく} に 、 {狭|せま}い {道|みち} が {下|くだ}って いる 。 {前|まえ} に は 、 なかった {道|みち} だ 。 || Behind the roots a narrow way goes down. It wasn't there before.
?(comp&comp!=ren) comp: {森|もり} が 、 {育|そだ}った ん だ ね 。 || The grove has grown.
?(comp=ren) comp: {森|もり} が 、 {育|そだ}った ん です ね 。 || The grove has grown.
:go
!warp ko.grove 7 10 up

@scene rt.grove_tree
!if rt_grove_seen -> again
!set rt_grove_seen
narr: {一番|いちばん} {奥|おく} の {木|き} 。 {枝|えだ} と いう {枝|えだ} に 、 {名前|なまえ} の {書|か}かれた {葉|は} が {下|さ}がって いる 。 {誰|だれ} も {取|と}り に {来|こ}なかった {名前|なまえ} だ 。 || The deepest tree. From every branch hang leaves with names written on them: the names nobody came for.
?(end_archive_library) narr: {書庫|しょこ} の {扉|とびら} が {開|ひら}いて から 、 {読|よ}む {人|ひと} たち が 、 {引|ひ}き{取|と}り{手|て} の ない {名前|なまえ} を {一|ひと}つ ずつ {書|か}き{写|うつ}して 、 {潮|しお} に {乗|の}せて いる らしい 。 {島|しま} の {人|ひと} が {読|よ}み に {来|き}て 、 {知|し}って いる {名前|なまえ} を {見|み}つける こと も ある 。 || Since the Archive opened its doors, it seems its readers copy out each unclaimed name and give it to the tide. Islanders come to read them, and now and then someone finds a name they know.
?(end_archive_closed) narr: {書庫|しょこ} の {扉|とびら} が {閉|と}じて から 、 {引|ひ}き{取|と}り{手|て} の ない {名前|なまえ} は 、 {自分|じぶん} で ここ へ {流|なが}れ{着|つ}いた らしい 。 {森|もり} は それ を 、 {書庫|しょこ} が した よう に 、 {静|しず}か に {預|あず}かって いる 。 || Since the Archive closed its doors, the unclaimed names seem to have drifted here by themselves. The grove keeps them quietly, the way the Archive did.
?(!end_archive_library&!end_archive_closed) narr: {名前|なまえ} は 、 {何年|なんねん} も かけて 、 {少|すこ}し ずつ ここ へ {集|あつ}まった らしい 。 || The names seem to have gathered here a few at a time, over many years.
?(comp=nao) comp: {届|とど}かなかった {手紙|てがみ} の {行|い}き{先|さき} 、 ここ に あった の か 。 || So this is where the letters that never arrived end up.
?(comp=mio) comp: {捨|す}てられて いない の ね 。 それ だけ で 、 {少|すこ}し {救|すく}われる わ 。 || Nobody threw them away. That alone is something of a comfort.
?(comp=ren) comp: {灯守|ひもり} が {名前|なまえ} を {読|よ}み{上|あ}げる の と 、 {同|おな}じ です 。 {誰|だれ} か が {覚|おぼ}えて いれば 、 {名前|なまえ} は {消|き}えません 。 || It's the same as the keepers reading out the names. As long as someone remembers, a name doesn't vanish.
?(comp=suzu) comp: {出番|でばん} を {待|ま}って いる {役者|やくしゃ} の {楽屋|がくや} みたい ね 。 || Like a dressing room full of actors waiting for their cue.
?(!comp) narr: {風|かぜ} が {吹|ふ}く と 、 {葉|は} が {一斉|いっせい} に ささやいた 。 || When the wind blows, all the leaves whisper at once.
!end
:again
narr: {名前|なまえ} の {木|き} 。 {葉|は} が 、 また {少|すこ}し {増|ふ}えた {気|き} が する 。 || The tree of names. There seem to be a few more leaves than before.

@scene rt.grove_leaf
narr: {落|お}ち{葉|ば} の {中|なか} に 、 {字|じ} の {読|よ}める {葉|は} が {一枚|いちまい} ある 。 || Among the fallen leaves is one whose writing you can still read.
!challenge rt.grove_leaf
!if var._res=0 -> later
narr: {葉|は} を 、 そっと {木|き} の {根元|ねもと} に {戻|もど}した 。 {誰|だれ} か が 、 いつ か {読|よ}み に {来|く}る かも しれない 。 || You lay the leaf gently back at the foot of the tree. Someone may come for it one day.
!end
:later
narr: {葉|は} は 、 また {後|あと} で {読|よ}もう 。 || You can read the leaf later.

@scene rt.grove_write
!if rt_grove_leaf -> done
narr: {白|しろ}い {葉|は} が {何枚|なんまい} か 、 {籠|かご} に {入|い}って いる 。 {誰|だれ} でも {書|か}いて いい らしい 。 || A few blank leaves lie in a basket. Anyone may write one, it seems.
!challenge rt.grove_write
!if var._res=0 -> later
?(var._forge=home) !var rt_leaf_to = home
?(var._forge=road) !var rt_leaf_to = road
?(var._forge=future) !var rt_leaf_to = future
!if var.rt_leaf_to=0 -> fall
!goto hang
:fall
!var rt_leaf_to = road
:hang
!set rt_grove_leaf
narr: {書|か}いた {葉|は} を 、 {低|ひく}い {枝|えだ} に {結|むす}んだ 。 {誰|だれ} か が {取|と}り に {来|く}る まで 、 {森|もり} が {預|あず}かって くれる 。 || You tie your leaf to a low branch. The grove will keep it until someone comes for it.
!end
:later
narr: {葉|は} は 、 また {後|あと} で {書|か}こう 。 || You can write your leaf later.
!end
:done
?(var.rt_leaf_to=home) narr: {自分|じぶん} の {葉|は} が 、 {揺|ゆ}れて いる 。 「 {故郷|ふるさと} の {皆|みんな} へ 」 。 || Your own leaf sways on its branch: "To everyone back home."
?(var.rt_leaf_to=road) narr: {自分|じぶん} の {葉|は} が 、 {揺|ゆ}れて いる 。 「 {道|みち} で {出会|であ}った {人|ひと} たち へ 」 。 || Your own leaf sways on its branch: "To the people I met on the road."
?(var.rt_leaf_to=future) narr: {自分|じぶん} の {葉|は} が 、 {揺|ゆ}れて いる 。 「 まだ {会|あ}って いない {人|ひと} へ 」 。 || Your own leaf sways on its branch: "To someone I haven't met yet."

@scene rt.otoha_grove
ko_otoha: {奥|おく} の {森|もり} に 、 {行|い}きました ね 。 {名前|なまえ} の {木|き} は 、 {島|しま} で {一番|いちばん} {若|わか}い {木|き} です 。 || You went to the deepest grove. The tree of names is the youngest tree on the island.
?(end_archive_library) ko_otoha: {毎朝|まいあさ} 、 {潮|しお} が {新|あたら}しい {名前|なまえ} を {運|はこ}んで きます 。 {書庫|しょこ} の {人|ひと} たち は 、 {働|はたら}き{者|もの} です ね 。 || Every morning the tide brings new names. The Archive's people are hard workers.
?(end_archive_closed) ko_otoha: {書庫|しょこ} が {閉|と}じて も 、 {名前|なまえ} は {行|い}き{場|ば} を {見|み}つける もの です 。 || Even with the Archive closed, names find somewhere to go.
?(rt_grove_leaf) ko_otoha: あなた の {葉|は} も 、 {見|み}ました よ 。 {風|かぜ} の いい {日|ひ} に は 、 よく {揺|ゆ}れて います 。 || I saw your leaf too. On a good windy day it sways nicely.
`);
  const otoha = C.maps['ko.village'].npcs.find((n) => n.id === 'ko_otoha');
  if (otoha && Array.isArray(otoha.talk)) otoha.talk.unshift({ if: 'ed>=2&postgame&rt_grove_seen&!seen.rt.otoha_grove', scene: 'rt.otoha_grove' });
})(RB.content, RB.mapkit);
