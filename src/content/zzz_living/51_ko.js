/* Kotonoha's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md). Once the tree has settled
 * (`ko_done`):
 * W2 routines: Hamaji mends the nets on the shore too, and eats at Mitsu's; Tokio counts in the keepers' hall or on
 *   the tide line (a card on the census board says where); Nana has letters with Yoshino or the moon with Koyomi.
 * W3 Mitsu at the lodging house and Yoshino in the hall can be asked after people; Tokio, mid-count, won't be asked.
 *   The island's own rumour told several ways (ko/31_tellings.js, zz_ko_mainland.js) is registered, not repeated.
 * W1 beats: registered, the leaf at the tide pools once the Keepers' Road is done (an early visit by your own boat)
 *   and the grove of unclaimed names after the story (returns/10_kotonoha.js); added, a postbox once the Cloudroad's
 *   relay runs again, and Mitsu's footbath once Steamhollow is done.
 * W5 no land road: the island is reached by sea, whose situations are their own (sea/21_situations.js).
 * W6 return keys: the old tide stone, read tide by tide (ごとに, the Cloudroad); the ring of baskets round the
 *   camphor, lifted as one (全体, Steamhollow); a letter in the hall for whoever carries post over the mountains
 *   (the Cloudroad's relay run). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;

  RB.lex.add(RB.lex.parseTable(`
足湯|あしゆ|n|I|a footbath
刻み|きざみ|n|I|a notch, a cut mark
押し葉|おしば|n|I|a pressed leaf
`), 'living');

  // ---- the island --------------------------------------------------------------------------------------------------
  L.town('kotonoha', {
    maps: ['ko.shore', 'ko.village', 'ko.hall', 'ko.otoha', 'ko.lodge', 'ko.terraces', 'ko.tidepools'],
    care: ['cr_done', 'yn_done', 'sa_hush_down'],
    after: 'ko_done',
  });

  // ---- W2: routines -----------------------------------------------------------------------------------------------
  // Hamaji, the net-mender: the village racks (his placement), the shore's nets, a bowl at Mitsu's
  L.routine('kotonoha', 'ko_hamaji', { base: 'ko.village:ko_hamaji', slots: [
    { map: 'ko.shore', x: 27, y: 10, dir: 'up', perform: 'mend', line: ['{浜|はま} の {網|あみ} も {見|み}て おかん と な 。 {潮|しお} が {変|か}われば 、 {網|あみ} も {傷|いた}む 。', 'Got to see to the nets on the shore as well. When the tides change, the nets wear.'] },
    { map: 'ko.lodge', x: 7, y: 6, dir: 'up', line: ['ミツ の {汁|しる} は 、 {何年|なんねん} {食|く}って も {飽|あ}きん 。 …… {本人|ほんにん} に は {言|い}う な よ 。', 'Years of Mitsu\'s soup and I\'m not tired of it. …Don\'t tell her I said so.'] },
  ] });
  // Tokio, the census keeper: the census board (his placement), the hall's shelves, the tide line
  L.routine('kotonoha', 'ko_tokio', { base: 'ko.village:ko_tokio', slots: [
    { map: 'ko.hall', x: 11, y: 7, dir: 'up', perform: 'sort', line: ['{館|やかた} の {帳面|ちょうめん} と 、 {村|むら} の {帳面|ちょうめん} を {合|あ}わせて います 。 …… {一枚|いちまい} {合|あ}いません 。 {困|こま}りました 。', 'I\'m checking the hall\'s ledger against the village\'s. …One leaf doesn\'t match. Most vexing.'] },
    { map: 'ko.shore', x: 13, y: 18, dir: 'down', perform: 'tally', line: ['{浜|はま} の {葉|は} を {数|かぞ}えて います 。 {今朝|けさ} は {七枚|ななまい} 。 {数|かぞ}えられる {数|かず} です 。', 'I\'m counting the leaves on the shore. Seven this morning. A number one can count.'] },
  ] });
  L.away('kotonoha', 'ko_tokio', { map: 'ko.village', x: 15, y: 12, p: 'fw_note', line: ['{札|ふだ} 。 「{数|かぞ}え に {出|で}て います 。 {館|やかた} か 、 {浜|はま} 。 トキオ」', 'A card on the board: "Out counting. The hall, or the shore. —Tokio"'] });
  // Nana: by the well (her placement), letters with Yoshino in the hall, the moon with Koyomi at the tide pools
  L.routine('kotonoha', 'ko_nana', { base: 'ko.village:ko_nana', slots: [
    { map: 'ko.hall', x: 5, y: 7, dir: 'up', perform: 'read', line: ['ヨシノ {先生|せんせい} に 、 {字|じ} を {習|なら}って いる の 。 アオ より {先|さき} に {覚|おぼ}える ん だ から ！', 'I\'m learning letters from Miss Yoshino. I\'m going to learn them before Ao does!'] },
    { map: 'ko.tidepools', x: 28, y: 5, dir: 'right', line: ['コヨミ さん に 、 お{月|つき}さま の {形|かたち} を {教|おし}えて もらって いる の 。 {今日|きょう} は {半分|はんぶん} ！', 'Koyomi\'s teaching me the moon\'s shapes. Today it\'s half!'] },
  ] });

  // ---- W3: who can be asked after whom ---------------------------------------------------------------------------
  L.asks('ko_mitsu');
  L.knows('ko_mitsu', { ko_hamaji: 'routine', ko_tokio: 'routine', ko_nana: 'routine', ko_ao: 'routine', ko_yoshino: 'routine', ko_otoha: 'routine', ko_nami: 'routine', ko_koyomi: 'loose' });
  L.asks('ko_yoshino');
  L.knows('ko_yoshino', { ko_nana: 'routine', ko_ao: 'routine', ko_mitsu: 'routine', ko_otoha: 'routine', ko_tokio: 'loose', ko_hamaji: 'loose', ko_koyomi: 'loose', ko_nami: 'loose' });
  L.asks('ko_tokio');
  L.cold('ko_tokio', ['…… {今|いま} 、 {数|かぞ}えて いる ところ です 。 {話|はな}し{掛|か}けられる と 、 {数|かず} を {忘|わす}れます 。', '…I\'m in the middle of a count. If you talk to me, I\'ll lose my number.']);
  L.usual('ko_otoha', ['オトハ {婆|ばあ}さま なら 、 {風石|かぜいし} の そば に いらっしゃいます よ 。', 'Grandmother Otoha? By the Wind Stone.']);
  L.usual('ko_nami', ['ナミ さん は 、 {館|やかた} の {前|まえ} か 、 {舟|ふね} の ところ 。', 'Nami? In front of the hall, or down by her boat.']);
  L.usual('ko_ao', ['アオ なら 、 {籠|かご} を {持|も}って {村|むら} の {中|なか} を {走|はし}り{回|まわ}って いる わ 。', 'Ao runs round the village with his basket.']);
  L.usual('ko_yoshino', ['ヨシノ さん は 、 {館|やかた} で {子|こ}ども たち に {字|じ} を {教|おし}えて います 。', 'Yoshino teaches the children their letters in the hall.']);
  L.usual('ko_mitsu', ['ミツ さん は {宿|やど} です よ 。 いつも {鍋|なべ} の {前|まえ} 。', 'Mitsu\'s at the lodging house. Always by the pot.']);
  L.usual('ko_koyomi', ['コヨミ さん は 、 {西|にし} の {潮|しお}だまり 。 {暦|こよみ} の {石|いし} の そば です 。', 'Koyomi\'s at the western tide pools, by the calendar stone.']);

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  // registered: the tide pools' leaf from the Keepers' Road's lantern plate (ko/10_maps.js, kr_done): new on a return
  // only for whoever came early by their own boat, so the beat holds between such a visit and the chapter's start
  // (never before the island has been seen); and the grove of unclaimed names behind the garden (returns, postgame)
  L.beat('kotonoha', { id: 'leaf_kr', when: 'ed>=2&ko_arrived&kr_done&!ko_ch9', en: 'A new leaf at the tide pools', jp: '{潮|しお}だまり の {新|あたら}しい {葉|は}' });
  L.beat('kotonoha', { id: 'grove', when: 'ed>=2&postgame', en: 'A grove behind the garden under the roots', jp: '{根|ね} の {下|した} の {庭|にわ} の {奥|おく} の {森|もり}' });
  // added: the relay running again (the Cloudroad done): letters can leave the island now
  L.beat('kotonoha', { id: 'mailbox', when: 'ed>=2&cr_done', en: 'A postbox by the path', jp: '{道|みち} の {横|よこ} の {郵便|ゆうびん}{箱|ばこ}' });
  C.maps['ko.village'].props.push({ p: 'mailbox', x: 22, y: 27, if: 'beat.kotonoha.mailbox', scene: 'cr.lw_ko_mailbox' });
  L.talk('ko.village:ko_tokio', [{ if: 'beat.kotonoha.mailbox&!seen.cr.lw_ko_tokio_mail', scene: 'cr.lw_ko_tokio_mail' }]);
  // added: Steamhollow done: a footbath outside Mitsu's, after the valley's fashion
  L.beat('kotonoha', { id: 'footbath', when: 'ed>=2&yn_done', en: 'A footbath outside the lodging house', jp: '{宿|やど} の {前|まえ} の {足湯|あしゆ}' });
  C.maps['ko.village'].props.push({ p: 'yn_footbath', x: 30, y: 15, if: 'beat.kotonoha.footbath', scene: 'yn.lw_ko_footbath' });
  L.talk('ko.lodge:ko_mitsu', [
    { if: 'beat.kotonoha.footbath&!seen.yn.lw_ko_mitsu_footbath', scene: 'yn.lw_ko_mitsu_footbath' },
    { if: 'beat.kotonoha.mailbox&!seen.cr.lw_ko_mitsu_mail', scene: 'cr.lw_ko_mitsu_mail' },
  ]);

  // ---- W6: return keys ----------------------------------------------------------------------------------------------
  L.seal('ko_tide', { map: 'ko.tidepools', x: 32, y: 2, p: 'ko_tidestone', needs: 'mod_goto', opens: 'lw_ko_tide_read', scene: 'cr.lw_ko_tide_open',
    hint: ['{古|ふる}い {暦|こよみ} の {石|いし} 。 {刻|きざ}み が {多|おお}すぎて 、 どこ から {読|よ}めば いい か {分|わ}からない 。 {一行|いちぎょう} だけ {読|よ}める 。 「{潮|しお} {一|ひと}つ に 、 {刻|きざ}み {一|ひと}つ」 。', 'An old calendar stone, so crowded with notches you can\'t tell where to begin. One line can be read: "One notch for each tide."'],
    openedLabel: ['{古|ふる}い {潮|しお} の {暦|こよみ}', 'The old tide calendar, read'], after: { p: 'ko_tidestone', scene: 'cr.lw_ko_tide_after' } });
  L.seal('ko_crown', { map: 'ko.crown', x: 20, y: 8, p: 'ko_basket', needs: 'mod_zentai', opens: 'lw_ko_crown_open', scene: 'yn.lw_ko_crown_open',
    hint: ['{楠|くす} の {根元|ねもと} に 、 {古|ふる}い {籠|かご} が {輪|わ} に なって {並|なら}んで いる 。 {一|ひと}つ {持|も}ち{上|あ}げよう と する と 、 {全部|ぜんぶ} が {重|おも}く なる 。', 'Old baskets stand in a ring round the camphor\'s roots. Try to lift one, and all of them grow heavy.'],
    openedLabel: ['{籠|かご} の {輪|わ}', 'The ring of baskets, lifted'], after: { p: 'ko_basket', scene: 'yn.lw_ko_crown_after' } });
  L.seal('ko_letter', { map: 'ko.hall', x: 10, y: 2, p: 'fw_postnote', needs: 'ed>=2&cr_done', opens: 'lw_ko_letter_sent', scene: 'cr.lw_ko_letter_open',
    hint: ['{壁|かべ} に {古|ふる}い {手紙|てがみ} が {留|と}めて ある 。 {封|ふう} の {上|うえ} に 、 {走|はし}る {人|ひと} の {印|しるし} 。 「{山|やま} を {越|こ}えて {届|とど}ける {人|ひと} に {渡|わた}す こと」 。', 'An old letter pinned to the wall, a running figure stamped on its seal. "To be given to one who carries letters over the mountains."'],
    openedLabel: ['{五十年|ごじゅうねん} {前|まえ} の {手紙|てがみ}', 'The fifty-year-old letter, on its way'], after: { p: 'fw_postnote', scene: 'cr.lw_ko_letter_after' } });
  C.items.lw_ko_tiderubbing = { name: T('Tide-stone rubbing', '{潮|しお} の {暦|こよみ} の {写|うつ}し'), key: true,
    desc: 'A rubbing of the old tide calendar at Kotonoha\'s tide pools: one notch for each tide. Koyomi has a copy of her own now. A keepsake.' };
  C.notes.lw_ko_old_tides = { title: T('The old tide calendar', '{古|ふる}い {潮|しお} の {暦|こよみ}'), fiction: true,
    jp: '{古|ふる}い {暦|こよみ} は 、 {潮|しお} ごと に {刻|きざ}み を {一|ひと}つ {入|い}れた 。 {刻|きざ}み を {追|お}えば 、 {次|つぎ} の {大潮|おおしお} が {分|わ}かる 。',
    en: 'The old calendar cut one notch for each tide; follow the notches and you can tell when the next spring tide comes. (Spring tides, 大潮, really do come twice a month, with the new and the full moon; the stone is the game\'s.)' };
  C.notes.lw_ko_first_leaf = { title: T('The first leaf', '{最初|さいしょ} の {葉|は}'), fiction: true,
    jp: '{大楠|おおくす} の {根元|ねもと} の {籠|かご} の {輪|わ} の {下|した} に 、 {押|お}し{葉|ば} が {一枚|いちまい} 。 {字|じ} は 「{葉|は}」 だけ 。 {最初|さいしょ} の {葉守|はもり} たち が 、 {最初|さいしょ} に {拾|ひろ}った {葉|は} らしい 。 {葉|は} は {今|いま} も そこ に ある 。',
    en: 'Under the ring of baskets at the camphor\'s foot, one pressed leaf with a single character on it: 葉, "leaf". The first keepers\' first leaf, it seems. It stays where it was.' };
  C.notes.lw_ko_letter = { title: T('A letter fifty years late', '{五十年|ごじゅうねん} {遅|おく}れ の {手紙|てがみ}'), fiction: true,
    jp: '{島|しま} の {誰|だれ} か が 、 {雲|くも} の {上|うえ} の {宿|しゅく} へ {書|か}いた {手紙|てがみ} 。 {継|つ}ぎ{飛脚|びきゃく} が {途切|とぎ}れて 、 {出|だ}せなかった 。 {今|いま} は 、 ナミ の {舟|ふね} と {飛脚|ひきゃく} の {足|あし} で 、 {山|やま} を {越|こ}えて いく 。',
    en: 'A letter someone on the island wrote to the station above the clouds. The relay broke off, and it never went. Now it goes over the mountains by Nami\'s boat and the runners\' feet.' };

  L.scenes(`
@scene cr.lw_ko_mailbox
narr: {新|あたら}しい {郵便|ゆうびん}{箱|ばこ} 。 {札|ふだ} が {付|つ}いて いる 。 || A new postbox, with a card on it.
narr: 「{手紙|てがみ} は 、 ナミ が {舟|ふね} で {陸|りく} へ {運|はこ}びます 。 {山|やま} の {向|む}こう へ も 、 {継|つ}ぎ{飛脚|びきゃく} で {届|とど}きます 。」 || "Nami takes letters to the mainland by boat. Over the mountains too, by the relay."

@scene cr.lw_ko_tokio_mail
!faceplayer
ko_tokio: {手紙|てがみ} の {葉|は} が 、 {今月|こんげつ} は {三枚|さんまい} {減|へ}りました 。 {出|だ}せる {箱|はこ} が できた から 、 でしょう か 。 || The letter-leaves are down by three this month. Because there's a box to post them in now, perhaps.
ko_tokio: …… {帳面|ちょうめん} に は 、 {理由|りゆう} は {書|か}きません が 。 || …I don't write reasons in the ledger, mind.

@scene cr.lw_ko_mitsu_mail
!faceplayer
ko_mitsu[happy]: {郵便|ゆうびん}{箱|ばこ} 、 {見|み}た ？ {山|やま} の {上|うえ} の {道|みち} を {走|はし}る {飛脚|ひきゃく} さん が 、 {島|しま} の {手紙|てがみ} も {運|はこ}んで くれる ん です って 。 || Have you seen the postbox? The runners on the road over the mountains will carry the island's letters too, they say.
ko_mitsu: {陸|りく} から {来|き}た お{客|きゃく} さん たち に 、 やっと {返事|へんじ} が {書|か}ける わ 。 || I can finally write back to the guests who came from the mainland.

@scene yn.lw_ko_footbath
narr: {宿|やど} の {前|まえ} の {足湯|あしゆ} 。 {湯|ゆ} は {鍋|なべ} で {沸|わ}かした もの らしい 。 {札|ふだ} ： 「{湯|ゆ}ノ{谷|たに} の まね です 。 どうぞ 。 ミツ」 || A footbath outside the lodging house, the water heated in a pot by the look of it. A card: "Copied from Steamhollow. Please, help yourself. —Mitsu"
narr: {足|あし} を {入|い}れる と 、 {海|うみ} の {風|かぜ} で {冷|ひ}えた {体|からだ} が {温|あたた}まった 。 || You put your feet in, and the warmth climbs up through a body chilled by the sea wind.

@scene yn.lw_ko_mitsu_footbath
!faceplayer
ko_mitsu[happy]: {湯|ゆ}ノ{谷|たに} から {来|き}た お{客|きゃく} さん に {教|おし}わった の 。 {足湯|あしゆ} よ 。 || A guest from Steamhollow showed me. A footbath!
ko_mitsu[laugh]: {温泉|おんせん} は ない けど 、 {鍋|なべ} で {沸|わ}かせば {同|おな}じ ！ …… たぶん ね 。 || There's no hot spring here, but boil it in a pot and it's the same! …More or less.

@scene cr.lw_ko_tide_open
!gesture pc read prop:ko_tidestone
narr: {潮|しお} ごと に 、 {刻|きざ}み を {一|ひと}つ ずつ {追|お}って いく 。 {満|み}ちて 、 {引|ひ}いて 、 また {満|み}ちて 。 {飛脚|ひきゃく} が {宿|しゅく} ごと に {名前|なまえ} を {呼|よ}んだ よう に 。 || Tide by tide, you follow the notches one at a time: in, out, in again, the way the runners called each station's name in turn.
narr: {刻|きざ}み の {列|れつ} が 、 {一|ひと}つ の {暦|こよみ} に なった 。 {次|つぎ} の {大潮|おおしお} の {日|ひ} まで 、 {読|よ}める 。 || The rows of notches come together into a calendar, and you can read it right up to the next spring tide.
!look ko_koyomi pc
ko_koyomi: …… {古|ふる}い {暦|こよみ} を {読|よ}める {人|ひと} が いる なんて 。 {写|うつ}し を {取|と}って おいて ください 。 わたし の {暦|こよみ} に も 、 {書|か}き{足|た}します 。 || …Someone who can read the old calendar. Do take a rubbing. I'll add it to my own.
!give lw_ko_tiderubbing
!note lw_ko_old_tides

@scene cr.lw_ko_tide_after
narr: {古|ふる}い {潮|しお} の {暦|こよみ} の {石|いし} 。 {刻|きざ}み の {読|よ}み{方|かた} は 、 もう {分|わ}かる 。 || The old tide-calendar stone. You know how to read its notches now.

@scene yn.lw_ko_crown_open
!gesture pc bend prop:ko_basket
narr: {籠|かご} を {一|ひと}つ ずつ で は なく 、 {輪|わ} {全体|ぜんたい} を {一|ひと}つ の もの と して {持|も}ち{上|あ}げる 。 {籠|かご} は {羽|はね} の よう に {軽|かる}く なった 。 || Not one basket at a time: you lift the whole ring as one thing, and the baskets come up light as feathers.
narr: {輪|わ} の {下|した} の {窪|くぼ}み に 、 {押|お}し{葉|ば} が {一枚|いちまい} 。 {字|じ} は {一|ひと}つ だけ 。 「{葉|は}」 。 || In the hollow under the ring lies a single pressed leaf. One character on it: 葉, "leaf".
narr: {最初|さいしょ} の {葉守|はもり} たち が 、 {最初|さいしょ} に {拾|ひろ}った {葉|は} らしい 。 {籠|かご} を {元|もと} に {戻|もど}し 、 {葉|は} は そこ に {残|のこ}した 。 オトハ {婆|ばあ}さま に は 、 {話|はな}して おこう 。 || The first keepers' first leaf, it seems. You set the baskets back and leave the leaf where it lies. Grandmother Otoha should hear about it.
!note lw_ko_first_leaf

@scene yn.lw_ko_crown_after
narr: {楠|くす} の {根元|ねもと} の {籠|かご} の {輪|わ} 。 {下|した} に {最初|さいしょ} の {葉|は} が {眠|ねむ}って いる 。 || The ring of baskets at the camphor's foot, the first leaf asleep beneath it.

@scene cr.lw_ko_letter_open
!gesture pc observe prop:fw_postnote
narr: {封|ふう} の {上|うえ} の {印|しるし} を 、 {今|いま} は {知|し}って いる 。 {継|つ}ぎ{飛脚|びきゃく} の {印|しるし} だ 。 {山|やま} を {越|こ}えて {手紙|てがみ} を {運|はこ}んだ {人|ひと} に なら 、 {渡|わた}して いい 。 || You know the mark on the seal now: the relay's. It may be given to someone who has carried letters over the mountains.
!look ko_yoshino pc
ko_yoshino: {五十年|ごじゅうねん} {前|まえ} 、 {島|しま} の {誰|だれ} か が 、 {雲|くも} の {上|うえ} の {宿|しゅく} へ {書|か}いた {手紙|てがみ} です 。 {飛脚|ひきゃく} が {来|こ}なく なって 、 {出|だ}せなかった の 。 || Someone on the island wrote it fifty years ago, to the station above the clouds. The runners stopped coming, and it never went.
ko_yoshino[smile]: ナミ が {陸|りく} へ {運|はこ}んで 、 {飛脚|ひきゃく} が {山|やま} を {越|こ}えて {届|とど}けて くれます 。 …… {館|やかた} の {仕事|しごと} が 、 {一|ひと}つ {終|お}わりました 。 || Nami will take it to the mainland, and the runners will carry it over the mountains. …That's one of the hall's jobs done.
!note lw_ko_letter

@scene cr.lw_ko_letter_after
narr: {手紙|てがみ} が {留|と}めて あった {所|ところ} 。 {今|いま} は 、 {小|ちい}さな {紙|かみ} が {一枚|いちまい} 。 「{出|だ}しました 。 ヨシノ」 || Where the letter was pinned, a little slip now: "Sent. —Yoshino"
`);
})(RB.living);
