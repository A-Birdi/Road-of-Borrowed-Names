/* Lanternfall's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md). Once the bell has rung and
 * the chapter is over (`ch5_done`):
 * W2 routines: Nagi does the lamp rounds (the avenue, the garden shrine's lamp, the old street names in the Records
 *   Hall), Shū lets the council's pots and the shared persimmon grow as they like, Masaru takes a break at Ritsu's
 *   while the dough rises or loads bread on the ferry (a note on his door says where).
 * W3 Setsu at the inn and Ritsu at her café can be asked after people; Registrar Tadashi, by the book, will not say.
 * W1 beats: registered, Jinpachi at the west gate with the Cloudroad's call (Kotonoha done) and the printed objections
 *   on the square (returns/30_towns.js, after the story); added, the old minutes framed in the Council Chamber once
 *   the leaf はんたい is home from Kotonoha, and a guest come down the north road once Steamhollow is done.
 * W5 the Lantern Road (lf.road): Rokusuke's leaking oil cask the first time you come down it; then now and then a
 *   notice blown off the town's board, a traveller on the bench who would rather not be helped, a lamp the wind put out.
 * W6 return keys (besides the waystone "…路", cr/20_scenes_call.js): the drowned quarter's lamps, lit block by block
 *   (ごとに, the Cloudroad); a box sealed with every kind of stamp in the Records Hall (あらゆる, Kotonoha); the
 *   charter chest that opens to the town as one (全体, Steamhollow). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;
  const J = (jp, en) => ({ jp, en }); // a challenge's title: Japanese first (L.T is en, jp)
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
丁目|ちょうめ|ctr|I|block (a numbered district of a town: 一丁目, 二丁目…)
二丁目|にちょうめ|n|I|2nd block (of a town district)
三丁目|さんちょうめ|n|I|3rd block (of a town district)
五丁目|ごちょうめ|n|I|5th block (of a town district)
下町通り|したまちどおり|name|I|Lower Town Street (Lanternfall's drowned street; fictional)
格別|かくべつ|adj-na|A|exceptional, something else
会釈|えしゃく|vs|A|a slight bow, a nod of greeting
何事|なにごと|n|I|what, anything (何事もなかったように: as if nothing had happened)
受理|じゅり|vs|A|acceptance (of a document, a petition)
保留|ほりゅう|vs|A|putting on hold, pending
審議|しんぎ|vs|A|deliberation, a hearing (in a council)
鍵穴|かぎあな|n|I|keyhole
菜種油|なたねあぶら|n|A|rapeseed oil (once burned in lamps)
`), 'living');

  // ---- the town -------------------------------------------------------------------------------------------------
  L.town('lanternfall', {
    maps: ['lf.town', 'lf.gardens', 'lf.sluice', 'lf.records', 'lf.council', 'lf.clerks', 'lf.inn', 'lf.cafe', 'lf.bakery', 'lf.ferry', 'lf.tokuji'],
    care: ['ko_done', 'cr_done', 'yn_done', 'sa_hush_down'],
    after: 'ch5_done',
  });

  // ---- W2: routines -----------------------------------------------------------------------------------------------
  // Nagi, the lamplighter: the avenue (Nagi's placement), the garden shrine's lamp, the Records Hall's old street names
  C.maps['lf.gardens'].props.push({ p: 'lantern', x: 27, y: 10, o: { lit: true }, scene: 'lf.lw_shrine_lamp' });
  L.routine('lanternfall', 'lf_nagi', { base: 'lf.town:lf_nagi', slots: [
    { map: 'lf.gardens', x: 27, y: 11, dir: 'up', perform: 'tend', line: ['{祠|ほこら} の {灯|あか}り も 、 わたし の {仕事|しごと} 。 {毎晩|まいばん} 、 {湖|みずうみ} の {方|ほう} を {照|て}らす の 。', 'The shrine\'s lamp is my job too. Every night it shines out over the lake.'] },
    { map: 'lf.records', x: 13, y: 9, dir: 'up', perform: 'read', line: ['{昔|むかし} の {通|とお}り の {名前|なまえ} を {調|しら}べて いる の 。 {笠|かさ} に {書|か}く {名前|なまえ} が 、 また {増|ふ}えちゃう よ 。', 'I\'m looking up the old street names. Even more names to fit on the shades.'] },
  ] });
  // Shū, the gardener: the topiary (his placement), the pots before the council, the persimmon both gardens share
  L.routine('lanternfall', 'lf_shu', { base: 'lf.gardens:lf_shu', slots: [
    { map: 'lf.town', x: 17, y: 12, dir: 'up', perform: 'prune', line: ['{議会|ぎかい} の {前|まえ} の {鉢|はち} も 、 {好|す}きな {形|かたち} に {伸|の}ばして いる 。 {文句|もんく} が ある なら 、 {議会|ぎかい} に {書|か}いて {出|だ}せば いい 。', 'The pots in front of the council too: I let them grow how they like. Anyone who minds can put it in writing to the council.'] },
    { map: 'lf.gardens', x: 14, y: 5, dir: 'up', perform: 'prune', line: ['{柿|かき} の {枝|えだ} を {切|き}る {前|まえ} に 、 {二人|ふたり} に {聞|き}いた 。 {二人|ふたり} とも 「いや」 だった 。 …… {今日|きょう} は 、 {見|み}る だけ だ 。', 'Before cutting a persimmon branch I asked them both. Both said no. …Today I just look.'] },
  ] });
  // Masaru, the baker: the kneading bench (his placement), Ritsu's café while the dough rises, the ferry landing
  L.routine('lanternfall', 'lf_masaru', { base: 'lf.bakery:lf_masaru', slots: [
    { map: 'lf.cafe', x: 6, y: 6, dir: 'right', line: ['{生地|きじ} が {膨|ふく}らむ まで 、 リツ さん の {店|みせ} で {一休|ひとやす}み だ 。 {待|ま}つ の も 、 パン {作|づく}り の うち さ ！', 'Till the dough\'s risen, I\'m taking a break at Ritsu\'s. Waiting\'s part of baking!'] },
    { map: 'lf.town', x: 38, y: 28, dir: 'left', perform: 'carry', line: ['{渡|わた}し{舟|ぶね} に パン を {積|つ}む ん だ 。 {頼|たの}まれた {数|かず} だけ 、 な ！', 'Loading bread onto the ferry. Only as many as were ordered, mind!'] },
  ] });
  L.away('lanternfall', 'lf_masaru', { map: 'lf.bakery', x: 6, y: 5, p: 'fw_note', line: ['{貼|は}り{紙|がみ} 。 「{配達|はいたつ} {中|ちゅう} 。 {喫茶|きっさ} か 、 {渡|わた}し{場|ば} に います 。 マサル」', 'A note: "Out delivering. At the café, or the ferry landing. —Masaru"'] });

  // ---- W3: who can be asked after whom ---------------------------------------------------------------------------
  L.asks('lf_setsu');
  L.knows('lf_setsu', { lf_nagi: 'routine', lf_kei: 'routine', lf_masaru: 'routine', lf_ritsu: 'routine', lf_tsuya: 'routine', lf_shu: 'loose', umi: 'loose', lf_tokuji: 'loose', lf_hayato: 'loose', lf_yae: 'loose' });
  L.asks('lf_ritsu');
  L.knows('lf_ritsu', { lf_masaru: 'routine', lf_setsu: 'routine', lf_nagi: 'routine', lf_hayato: 'routine', lf_kei: 'loose', lf_kohei: 'loose', lf_kinu: 'loose', lf_tadashi: 'loose', akari: 'loose', lf_shu: 'loose' });
  L.asks('lf_tadashi');
  L.cold('lf_tadashi', ['{個人|こじん} の {居場所|いばしょ} は 、 {記録|きろく} に ございません 。', 'The whereabouts of private persons are not a matter of record.']);
  L.usual('lf_kei', ['ケイ ちゃん なら 、 {大通|おおどお}り で {遊|あそ}んで います よ 。', 'Kei? Playing on the avenue, usually.']);
  L.usual('lf_ritsu', ['リツ さん は 、 {南|みなみ} の {通|とお}り の {喫茶|きっさ} です よ 。', 'Ritsu\'s at her café on the south lane.']);
  L.usual('lf_setsu', ['セツ さん は {灯|あか}り{宿|やど} です 。 いつも {受付|うけつけ} に います 。', 'Setsu\'s at the Lamplit Inn, always at the front desk.']);
  L.usual('lf_tsuya', ['ツヤ さん は 、 {渡|わた}し{場|ば} の {岸|きし} で {舟|ふね} を {待|ま}って います よ 。', 'Tsuya waits for the boat down at the ferry landing.']);
  L.usual('lf_hayato', ['ハヤト さん は 、 {記録館|きろくかん} の {窓口|まどぐち} です 。', 'Hayato\'s at the Records Hall counter.']);

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  // registered: the relay runner at the west gate (cr/01_region.js: ed>=2&ko_done&!cr_called), the printed
  // objections on the square (returns/30_towns.js, after the story)
  L.beat('lanternfall', { id: 'jinpachi', when: 'ed>=2&ko_done&!cr_called', en: 'A relay runner waiting at the west gate', jp: '{西|にし} の {門|もん} の {飛脚|ひきゃく}' });
  L.beat('lanternfall', { id: 'objections', when: 'ed>=2&postgame', en: 'Printed objections on the square', jp: '{刷|す}られた {反対|はんたい} {意見|いけん}' });
  // added: the leaf はんたい home from Kotonoha (ko_ret_lf; Tami's own line, ko.back_lf, was there): the minutes,
  // framed where the council can see them
  L.beat('lanternfall', { id: 'minutes', when: 'ko_ret_lf', en: 'The old minutes, framed in the Council Chamber', jp: '{議会|ぎかい}{堂|どう} の {古|ふる}い {議事録|ぎじろく}' });
  C.maps['lf.council'].props.push({ p: 'ko_frame', x: 5, y: 2, if: 'beat.lanternfall.minutes', scene: 'ko.lw_lf_minutes' });
  // added: Steamhollow done, the north road open: a guest who came down it, at the Lamplit Inn
  L.beat('lanternfall', { id: 'guest', when: 'ed>=2&yn_done', en: 'A guest come down the north road', jp: '{北|きた} の {道|みち} から の お{客|きゃく}' });
  C.chars.lw_lf_guest = { name: T('A guest from Steamhollow', '{湯|ゆ}ノ{谷|たに} の {客|きゃく}'), voice: { pitch: 0.95 },
    look: { skin: 2, hair: 'bun', hairColor: 3, cloth: ['#7a5a6a', '#5e4452', '#e8dcc8'], shape: 'robe', acc: ['scarf'], scarfCol: '#e8c84a' },
    portrait: { eyes: 'soft', style: 'bun', acc: ['scarf'], scarfCol: '#e8c84a', bg: '#2e2228' } };
  C.maps['lf.inn'].npcs.push({ id: 'lw_lf_guest', x: 8, y: 7, dir: 'left', if: 'beat.lanternfall.guest', talk: 'yn.lw_lf_guest' });
  L.talk('lf.inn:lf_setsu', [{ if: 'beat.lanternfall.guest&!seen.yn.lw_lf_setsu_guest', scene: 'yn.lw_lf_setsu_guest' }]);

  // ---- W5: the Lantern Road -----------------------------------------------------------------------------------------
  C.chars.lw_lf_carter = { name: T('Rokusuke', 'ロクスケ'), voice: { pitch: 0.82 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#6a5a3a', '#544630', '#d8c8a0'], shape: 'tunic', acc: ['headband'], bandCol: '#c8a868' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#c8a868', bg: '#2e2a20' } };
  const R = C.maps['lf.road'];
  R.npcs.push({ id: 'lw_lf_carter', x: 22, y: 14, dir: 'left', if: '!lw_lf_oil_done', talk: 'lf.lw_road_oil' });
  R.props.push({ p: 'cart', x: 20, y: 14, if: '!lw_lf_oil_done' }, { p: 'barrel', x: 19, y: 15, if: '!lw_lf_oil_done' });
  L.road('lf_road', { maps: ['lf.road'],
    unique: { id: 'oil', scene: 'lf.lw_road_oil' },
    variants: [{ id: 'notice', scene: 'lf.lw_road_notice' }, { id: 'bench', scene: 'lf.lw_road_bench' }, { id: 'lantern', scene: 'lf.lw_road_lantern' }],
    stamp: { title: ['{灯落|ひおち}{坂|ざか}', 'the Lantern Road'], ink: '#4a4a8a' } });
  C.notes.lw_lf_oil = { title: T('Lamp oil', '{灯|あか}り の {油|あぶら}'), fiction: false,
    jp: '{昔|むかし} の {行灯|あんどん} は 、 {菜種油|なたねあぶら} を {燃|も}やして いた 。 {油|あぶら} を {売|う}り {歩|ある}く {人|ひと} も いた 。',
    en: 'Before kerosene, Japanese paper lamps (andon) burned rapeseed oil, and oil sellers went from town to town with it. (Real history; Rokusuke and the casks are the game\'s.)' };
  C.notes.lw_lf_notices = { title: T('Lanternfall\'s notices', '{灯落|ひおち} の {掲示|けいじ}'), fiction: true,
    jp: '{灯落|ひおち} の {掲示|けいじ} は 、 「〜こと」 「〜ないこと」 で {終|お}わる 。 {誰|だれ} が {書|か}いた か は {書|か}かない 。',
    en: 'Lanternfall\'s notices end in 〜こと ("is to be done") and 〜ないこと ("is not to be done"), and never say who wrote them. (Rules written with こと are real Japanese; the town is the game\'s.)' };

  C.challenges['lf.lw_oil'] = { title: J('{樽|たる} の {札|ふだ}', 'The cask\'s card'), tiers: {
    F: [ch({ item: 'v:栓', ctx: { jp: 'ふだ ： 「あぶら が もれたら 、 まず せん を しめる 。 つぎ に 、 たる を たてる 。」', en: '' }, prompt: { en: 'Oil is leaking. What does the card say to do first?' },
      options: [o('せん を しめる', 1), o('たる を たてる', 0, 'つぎに: that comes second.'), o('ひ を つける', 0, 'Nowhere on the card, and never near oil.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{札|ふだ} ： 「{油|あぶら} が {漏|も}れたら 、 まず {栓|せん} を {締|し}めて ください 。 それでも {止|と}まらない とき は 、 {樽|たる} を {立|た}てて ください 。」', en: '' }, prompt: { en: 'The plug is tight, but oil is still dripping. What next?' },
      options: [o('{樽|たる} を {立|た}てる', 1), o('{栓|せん} を {抜|ぬ}く', 0, 'That would let it all out.'), o('{油|あぶら} を {拭|ふ}く', 0, 'それでも止まらないときは: when it still won\'t stop, stand the cask up.')] })],
    I: [ch({ item: 'g:cond_ba', ctx: { jp: '{札|ふだ} ： 「{栓|せん} を {締|し}めなければ 、 {樽|たる} を {動|うご}かして は いけない 。 {火|ひ} を {近|ちか}づけて は いけない 。」', en: '' }, prompt: { en: 'The plug is not tight yet. Can you move the cask?' },
      options: [o('まだ {動|うご}かして は いけない 。 {先|さき} に {栓|せん} を {締|し}める 。', 1), o('{火|ひ} を {近|ちか}づけなければ 、 {動|うご}かして も いい 。', 0, 'The fire is a rule of its own. Unless the plug is tight (締めなければ), the cask stays put.'), o('すぐ {動|うご}かさなければ ならない 。', 0, 'The card says the opposite: 動かしてはいけない.')] })],
    A: [ch({ item: 'g:lf_kaneru', ctx: { jp: 'ロクスケ ： 「{私|わたし} {一人|ひとり} で は 、 この {樽|たる} は {立|た}て かねます 。 なにしろ {重|おも}い もの で ……」', en: '' }, prompt: { en: 'What is Rokusuke telling you?' },
      options: [o('{一人|ひとり} で は {立|た}てられない 。 {手|て} を {貸|か}して ほしい 。', 1), o('{樽|たる} を {立|た}てる つもり は ない 。', 0, '〜かねます is a polite "cannot", not "will not".'), o('もう {樽|たる} を {立|た}てた 。', 0, 'The cask is still on its side.')] })],
  } };
  C.challenges['lf.lw_notice'] = { title: J('{飛|と}んで きた {掲示|けいじ}', 'A notice on the wind'), tiers: {
    F: [ch({ item: 'v:舟', ctx: { jp: 'かみ ： 「かぜ が つよい ひ は 、 ふね は でません 。 わたしば」', en: '' }, prompt: { en: 'Where does this notice belong?' },
      options: [o('わたしば （ふね の じむしょ）', 1), o('パン や', 0, 'It is about boats: ふね は でません.'), o('やど', 0, 'It is signed わたしば, the ferry office.')] })],
    E: [ch({ item: 'g:v_temo_ii', ctx: { jp: '{紙|かみ} ： 「{記録館|きろくかん} の {本|ほん} を {外|そと} へ {持|も}ち{出|だ}して は いけません 。 {中|なか} で {読|よ}んで も いい です 。」', en: '' }, prompt: { en: 'Which board did this notice blow off?' },
      options: [o('{記録館|きろくかん} の {掲示板|けいじばん}', 1), o('{喫茶|きっさ} の メニュー', 0, 'It is about the Hall\'s books.'), o('{渡|わた}し{場|ば} の {時刻表|じこくひょう}', 0, 'No boats in it: books, and where you may read them.')] })],
    I: [ch({ item: 'g:v_nakereba', ctx: { jp: '{紙|かみ} ： 「{議会|ぎかい} で {話|はな}したい {人|ひと} は 、 {前|まえ} の {日|ひ} まで に {名前|なまえ} を {書|か}かなければ ならない 。 {書|か}かなくて も 、 {聞|き}く だけ なら いい 。」', en: '' }, prompt: { en: 'You only want to listen at the council. What must you do?' },
      options: [o('{何|なに} も しなくて いい 。 {聞|き}く だけ なら {名前|なまえ} は {要|い}らない 。', 1), o('{前|まえ} の {日|ひ} まで に {名前|なまえ} を {書|か}く 。', 0, 'That is for those who want to speak.'), o('{議会|ぎかい} に は {入|はい}れない 。', 0, '聞くだけならいい: listening is fine.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: '{紙|かみ} ： 「{運河|うんが} で の {釣|つ}り は 、 ご{遠慮|えんりょ} ください 。 {灯落|ひおち} {町|まち} {議会|ぎかい}」', en: '' }, prompt: { en: 'What is the council saying, however gently?' },
      options: [o('{運河|うんが} で {釣|つ}り を して は いけない 。', 1), o('{釣|つ}り を {遠慮|えんりょ} しないで 、 {楽|たの}しんで ほしい 。', 0, 'ご遠慮ください is a polite way of forbidding.'), o('{釣|つ}り {人|びと} は {議会|ぎかい} に {来|き}て ほしい 。', 0, 'It asks people not to fish, nothing more.')] })],
  } };
  C.challenges['lf.lw_bench'] = { title: J('{腰掛|こしか}け の {旅人|たびびと}', 'The traveller on the bench'), tiers: {
    F: [ch({ item: 'v:大丈夫', ctx: { jp: 'たびびと ： 「ありがとう 。 でも 、 だいじょうぶ です 。 すこし やすんだら 、 あるけます 。」', en: '' }, prompt: { en: 'You offered to carry their bundle. What do they want?' },
      options: [o('じぶん で もつ 。 すこし やすむ だけ 。', 1), o('にもつ を もって ほしい 。', 0, 'だいじょうぶです: thanks, but no need.')] })],
    E: [ch({ item: 'v:結構', ctx: { jp: '{旅人|たびびと} ： 「いえいえ 、 {結構|けっこう} です 。 {荷物|にもつ} は {軽|かる}い ん です よ 。 {足|あし} が {少|すこ}し {疲|つか}れた だけ で 。」', en: '' }, prompt: { en: 'What does 結構です mean here?' },
      options: [o('「いいえ 、 {要|い}りません」 と いう {意味|いみ}', 1), o('「とても いい 、 {持|も}って ください」 と いう {意味|いみ}', 0, 'Offered help, けっこうです is a polite "no, thank you".'), o('「{荷物|にもつ} が {重|おも}い」 と いう {意味|いみ}', 0, '荷物は軽いんです: it is light.')] })],
    I: [ch({ item: 'g:indirectness', ctx: { jp: '{旅人|たびびと} ： 「お{気持|きも}ち は {嬉|うれ}しい ん です けど 、 ちょっと …… 。 {自分|じぶん} の {足|あし} で {町|まち} まで {歩|ある}きたくて 。」', en: '' }, prompt: { en: 'What should you do?' },
      options: [o('{無理|むり} に {手伝|てつだ}わない 。 {先|さき} に {行|い}く 。', 1), o('もう {一度|いちど} {強|つよ}く {頼|たの}む 。', 0, 'ちょっと… with a reason: a gentle no. Pressing again would be rude.'), o('{荷物|にもつ} を {黙|だま}って {持|も}つ 。', 0, 'They want to walk it on their own feet.')] })],
    A: [ch({ item: 'g:lf_kaneru', ctx: { jp: '{旅人|たびびと} ： 「ご{親切|しんせつ} は ありがたい の です が 、 お{受|う}け いたし かねます 。 {自分|じぶん} で {決|き}めた {旅|たび} です ので 。」', en: '' }, prompt: { en: 'How does the traveller answer your offer?' },
      options: [o('{丁寧|ていねい} に {断|ことわ}って いる 。 {自分|じぶん} で {歩|ある}きたい から 。', 1), o('{喜|よろこ}んで {受|う}けて いる 。', 0, 'いたしかねます: a formal "I am unable to accept".'), o('{怒|おこ}って いる 。', 0, 'ありがたいのですが: they are grateful, only firm.')] })],
  } };
  C.challenges['lf.lw_lantern'] = { title: J('{消|き}えた {灯籠|とうろう}', 'The lamp the wind put out'), tiers: {
    F: [ch({ item: 'v:待つ', ctx: { jp: 'ふだ ： 「かぜ が やむ まで 、 ひ を つけない で ください 。」 （いま も かぜ が つよい）', en: '' }, prompt: { en: 'The wind is still strong. What do you do?' },
      options: [o('かぜ が やむ まで まつ', 1), o('すぐ ひ を つける', 0, 'やむまで: until the wind drops.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{札|ふだ} ： 「{風|かぜ} が {止|や}む まで 、 {火|ひ} を {入|い}れないで ください 。 {灯落|ひおち} {灯|あか}り {番|ばん}」', en: '' }, prompt: { en: 'When may you light it again?' },
      options: [o('{風|かぜ} が {止|や}んで から', 1), o('{風|かぜ} が {強|つよ}い うち に', 0, 'まで: not until it stops.'), o('{灯|あか}り {番|ばん} が {来|き}て から', 0, 'The card asks only that the wind has dropped.')] })],
    I: [ch({ item: 'g:temo', ctx: { jp: '{札|ふだ} ： 「{風|かぜ} が {止|や}んで も 、 {芯|しん} が {濡|ぬ}れて いたら 、 {先|さき} に {芯|しん} を {切|き}る こと 。」 {芯|しん} は {雨|あめ} で {濡|ぬ}れて いる 。', en: '' }, prompt: { en: 'The wind has dropped. What first?' },
      options: [o('{濡|ぬ}れた {芯|しん} を {切|き}って から 、 {火|ひ} を {入|い}れる', 1), o('すぐ {火|ひ} を {入|い}れる', 0, '風が止んでも: even once it has dropped, a wet wick is cut first.'), o('{芯|しん} が {乾|かわ}く まで {帰|かえ}る', 0, 'The card says to cut it, not wait.')] })],
    A: [ch({ item: 'g:kagiri', ctx: { jp: '{札|ふだ} ： 「{風|かぜ} の ある {限|かぎ}り 、 {火|ひ} を {入|い}れる べからず 。 ── ナギ」 （{昔|むかし} の {言|い}い{方|かた} を まねた {札|ふだ}）', en: '' }, prompt: { en: 'What does Nagi\'s card (in mock-old style) say?' },
      options: [o('{風|かぜ} が ある {間|あいだ} は 、 {火|ひ} を {入|い}れて は いけない 。', 1), o('{風|かぜ} が あれば 、 {必|かなら}ず {火|ひ} を {入|い}れる 。', 0, 'べからず is the old "must not".'), o('{火|ひ} を {入|い}れる と 、 {風|かぜ} が {止|や}む 。', 0, '限り: "as long as" there is wind.')] })],
  } };

  // ---- W6: return keys ----------------------------------------------------------------------------------------------
  L.seal('lf_lamps', { map: 'lf.sluice', x: 9, y: 16, p: 'deadlantern', needs: 'mod_goto', opens: 'lw_lf_lamps_lit', scene: 'cr.lw_lf_lamps_open',
    hint: ['{浅瀬|あさせ} に {沈|しず}んだ {灯籠|とうろう} 。 {笠|かさ} に 「{二丁目|にちょうめ}」 。 {一丁目|いっちょうめ} から {順|じゅん} に {火|ひ} を {送|おく}らない と 、 {点|つ}かない よう だ 。', 'A lantern sunk in the shallows. On its shade: "2nd Block". It seems it won\'t light unless the flame is passed along from the 1st Block, block by block, in order.'],
    openedLabel: ['{下町|したまち} の {灯|あか}り', 'The Lower Town\'s lamps'], after: { p: 'lantern', o: { lit: true }, scene: 'cr.lw_lf_lamps_after' } });
  L.seal('lf_objections', { map: 'lf.records', x: 15, y: 7, p: 'chest', needs: 'mod_arayuru', opens: 'lw_lf_box_open', scene: 'ko.lw_lf_box_open', if: 'ed>=2',
    hint: ['{判子|はんこ} で {封|ふう} を された {箱|はこ} 。 「{承認|しょうにん}」 「{受理|じゅり}」 「{保留|ほりゅう}」 …… {違|ちが}う {種類|しゅるい} の {判子|はんこ} が 、 {何十|なんじゅう} も {重|かさ}ねて {押|お}して ある 。', 'A box sealed shut with stamps: "Approved", "Received", "Pending"… dozens of stamps of every kind, one over another.'],
    openedLabel: ['{判子|はんこ} の {箱|はこ}', 'The box of stamps, opened'], after: { p: 'chest', o: { open: true }, scene: 'ko.lw_lf_box_after' } });
  L.seal('lf_charter', { map: 'lf.council', x: 1, y: 7, p: 'chest', needs: 'mod_zentai', opens: 'lw_lf_charter_open', scene: 'yn.lw_lf_charter_open', if: 'ed>=2',
    hint: ['{古|ふる}い {箱|はこ} 。 {鍵穴|かぎあな} が {十二|じゅうに} も ある 。 {蓋|ふた} に 「{町|まち} が {一|ひと}つ に なって {開|あ}ける こと」 。', 'An old chest with twelve keyholes. On the lid: "To be opened by the town as one."'],
    openedLabel: ['{町|まち} の {約定|やくじょう}', 'The town\'s charter'], after: { p: 'chest', o: { open: true }, scene: 'yn.lw_lf_charter_after' } });
  C.notes.lw_lf_lower_town = { title: T('The Lower Town', '{下町|したまち}'), fiction: true,
    jp: '{湖|みずうみ} の {浅瀬|あさせ} に は 、 {昔|むかし} の {下町|したまち} の {灯籠|とうろう} が {沈|しず}んで いる 。 {一丁目|いっちょうめ} から {五丁目|ごちょうめ} まで 。 {通|とお}り の {名前|なまえ} は 「{下町|したまち}{通|どお}り」 。',
    en: 'In the lake\'s shallows lie the lamps of the old Lower Town, block by block, from the 1st to the 5th. The street was called Lower Town Street. Nagi has a shade for it now.' };
  C.notes.lw_lf_objections = { title: T('The box of objections', '{反対|はんたい} の {箱|はこ}'), fiction: true,
    jp: '{記録館|きろくかん} が 「{受理|じゅり}」 も 「{却下|きゃっか}」 も せず に 、 {判子|はんこ} で {閉|と}じ{込|こ}めた {紙|かみ} 。 {小|ちい}さな 「いいえ」 が 、 {何百|なんびゃく} も 。',
    en: 'Slips the Records Hall neither accepted nor rejected, but stamped shut in a box: hundreds of small "no"s from the quiet years. They are all on Tadashi\'s desk now, to be heard.' };
  C.notes.lw_lf_charter = { title: T('Lanternfall\'s charter', '{灯落|ひおち} の {約定|やくじょう}'), fiction: true,
    jp: '「{灯落|ひおち} の {者|もの} は 、 {誰|だれ} でも 、 {反対|はんたい} して よい 。 {反対|はんたい} は 、 {最後|さいご} まで {聞|き}く こと 。」',
    en: 'The first lines of the town\'s founding charter: "Anyone in Lanternfall may object. An objection is to be heard to the end."' };

  L.scenes(`
@scene lf.lw_shrine_lamp
narr: {祠|ほこら} の {横|よこ} の {灯籠|とうろう} 。 {湖|みずうみ} の {方|ほう} を {向|む}いて {灯|とも}って いる 。 || A lamp beside the shrine, lit and turned towards the lake.

@scene ko.lw_lf_minutes
narr: {額|がく} に {入|い}った {古|ふる}い {議事録|ぎじろく} 。 {一行|いちぎょう} だけ 、 {字|じ} が {新|あたら}しく {見|み}える 。 「はんたい」 。 || Old minutes in a frame. One word looks newer than the rest: はんたい, "against".
narr: {下|した} に 、 タミ の {字|じ} 。 「{昔|むかし} の {誰|だれ} か へ 。 {聞|き}こえました 。」 || Beneath, in Tami's hand: "To whoever it was, long ago: we heard you."

@scene yn.lw_lf_guest
!faceplayer lw_lf_guest
lw_lf_guest: {湯|ゆ}ノ{谷|たに} から 、 {北|きた} の {道|みち} を {下|お}りて {来|き}ました 。 {霧|きり} が {晴|は}れて 、 {灯落|ひおち} まで {一本道|いっぽんみち} です よ 。 || I came down the north road from Steamhollow. The mist has cleared: it's one road all the way to Lanternfall.
lw_lf_guest[smile]: {猫|ねこ} の {形|かたち} の パン が ある と {聞|き}いて 、 {来|き}て みた ん です 。 {湯|ゆ} の {後|あと} の パン は 、 {格別|かくべつ} です から 。 || I heard there was bread shaped like a cat, so I came to see. Bread after a hot bath is something else.

@scene yn.lw_lf_setsu_guest
!faceplayer lf_setsu
!gesture lf_setsu palm pc
lf_setsu[smile]: {北|きた} の {道|みち} から 、 お{客|きゃく}さま が {来|く}る よう に なりました 。 {湯|ゆ}ノ{谷|たに} の {方|かた} は 、 {朝|あさ} から {風呂|ふろ} は {沸|わ}いて いる か と {聞|き}かれます の 。 || Guests have started coming down the north road. The ones from Steamhollow ask if the bath's hot from first thing in the morning.
lf_setsu[laugh]: 「{沸|わ}いて おりません 」 と 、 ちゃんと {申|もう}し{上|あ}げて います わ 。 || "It is not," I tell them. Properly.

@scene lf.lw_road_oil
# Road event (W5): the Lantern Road's own, the first time you come down it. Rokusuke, bringing lamp oil down to
# Lanternfall, has a cask that has started to leak, and the card that says what to do.
!look lw_lf_carter pc
lw_lf_carter: おーい 、 そこ の {人|ひと} ！ {手|て} を {貸|か}して くれ ！ {樽|たる} から {油|あぶら} が {漏|も}れて いる ん だ 。 || Hey there! Lend a hand! Oil's leaking from one of my casks.
lw_lf_carter: {灯落|ひおち} の {灯|あか}り の {油|あぶら} だ 。 {樽|たる} に {札|ふだ} が {付|つ}いて いる が 、 {慌|あわ}てて {字|じ} が {頭|あたま} に {入|はい}らない 。 {読|よ}んで くれ ！ || It's oil for Lanternfall's lamps. There's a card on the cask, but I'm in such a state the words won't go in. Read it to me!
!challenge lf.lw_oil
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り に {栓|せん} を {締|し}め 、 {二人|ふたり} で {樽|たる} を {立|た}てた 。 {油|あぶら} は もう {一滴|いってき} も {漏|も}れない 。 || You tighten the plug as the card says, and the two of you stand the cask upright. Not another drop leaks out.
lw_lf_carter[laugh]: {助|たす}かった ！ {礼|れい} を {言|い}う よ 。 || That's saved me! Thank you.
?(!lf_bell_rung) lw_lf_carter: …… {灯落|ひおち} は {毎月|まいつき} {油|あぶら} を {倍|ばい} {頼|たの}む くせ に 、 「もう {要|い}らない」 と は {一度|いちど} も {言|い}わない 。 {変|へん} な {町|まち} だ よ 。 || …Lanternfall orders twice the oil every month, and never once says "that's enough". Strange town.
?(lf_bell_rung) lw_lf_carter: …… {灯落|ひおち} は {近|ちか}ごろ 、 「{今月|こんげつ} は {半分|はんぶん} で いい」 と {言|い}う よう に なった 。 {売|う}り{上|あ}げ は {減|へ}った が 、 {話|はなし} が {通|つう}じる 。 || …Lately Lanternfall's started saying "half will do this month". I sell less, but you can talk to them.
!set lw_lf_oil_done
!note lw_lf_oil
!hook road_done lf_road oil
!refresh
!end
:later
lw_lf_carter: …… {自分|じぶん} で なんとか {押|お}さえて おく 。 また {通|とお}ったら 、 {頼|たの}む よ 。 || …I'll hold it shut myself somehow. If you pass this way again, give me a hand.

@scene lf.lw_road_notice
narr: {風|かぜ} に {飛|と}ばされた {紙|かみ} が 、 {足元|あしもと} に {落|お}ちて きた 。 {灯落|ひおち} の {掲示|けいじ} の {一枚|いちまい} らしい 。 || A sheet of paper blows down at your feet: one of Lanternfall's notices, by the look of it.
!challenge lf.lw_notice
!if var._res=0 -> later
narr: {畳|たた}んで {持|も}って おく 。 {町|まち} に {下|お}りたら 、 {元|もと} の {掲示板|けいじばん} に {戻|もど}せる 。 || You fold it and keep it. Down in town, it can go back on its own board.
!note lw_lf_notices
!hook road_done lf_road notice
!end
:later
narr: {紙|かみ} は また {風|かぜ} に {乗|の}って 、 {坂|さか} を {下|くだ}って いった 。 || The paper catches the wind again and goes tumbling down the slope.

@scene lf.lw_road_bench
narr: {古|ふる}い {腰掛|こしか}け で 、 {旅人|たびびと} が {一人|ひとり} 、 {足|あし} を {休|やす}めて いる 。 {大|おお}きな {包|つつ}み を {抱|かか}えて いる 。 || On the old bench a traveller rests their feet, a big bundle in their arms.
pc: {荷物|にもつ} 、 {持|も}ちましょう か 。 || Shall I carry that for you?
!challenge lf.lw_bench
!if var._res=0 -> later
narr: {無理|むり} に は {手伝|てつだ}わず 、 {会釈|えしゃく} を して {先|さき} へ {行|い}く 。 {後|うし}ろ で 、 {旅人|たびびと} が {小|ちい}さく {笑|わら}った 。 「{聞|き}いて くれて 、 ありがとう 。」 || You don't press it; you nod and go on. Behind you, the traveller laughs softly. "Thank you for asking."
!hook road_done lf_road bench
!end
:later
narr: {旅人|たびびと} は {困|こま}った よう に {笑|わら}って 、 {包|つつ}み を {抱|かか}え{直|なお}した 。 || The traveller smiles awkwardly and takes a firmer hold on the bundle.

@scene lf.lw_road_lantern
narr: {道|みち} の {灯籠|とうろう} が {一|ひと}つ 、 {風|かぜ} で {消|き}えて いる 。 {柱|はしら} に 、 ナギ の {字|じ} の {札|ふだ} が {下|さ}がって いる 。 || One of the road's lanterns has blown out. A card in Nagi's hand hangs on its post.
!challenge lf.lw_lantern
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り に {待|ま}って 、 {芯|しん} を {整|ととの}え 、 {火|ひ} を {入|い}れた 。 {灯籠|とうろう} は 、 {何事|なにごと} も なかった よう に {灯|とも}って いる 。 || You wait as the card says, see to the wick, and light it. The lantern burns as if nothing had happened.
!hook road_done lf_road lantern
!end
:later
narr: {灯籠|とうろう} は {暗|くら}い まま だ 。 {町|まち} の {灯|あか}り {番|ばん} が 、 そのうち {来|く}る だろう 。 || The lantern stays dark. The town's lamplighter will be along sooner or later.

@scene cr.lw_lf_lamps_open
!gesture pc kneel prop:deadlantern
narr: {一丁目|いっちょうめ} の {灯籠|とうろう} に {火|ひ} を {入|い}れ 、 その {火|ひ} を {二丁目|にちょうめ} へ 、 {三丁目|さんちょうめ} へ 。 {継|つ}ぎ{飛脚|びきゃく} が {宿|しゅく} ごと に {手紙|てがみ} を {渡|わた}す よう に 、 {丁目|ちょうめ} ごと に {送|おく}って いく 。 || You light the 1st Block's lantern and pass its flame on to the 2nd, then the 3rd: block by block, the way the relay hands a letter on station by station.
!sfx bell
narr: {浅瀬|あさせ} の {下|した} で 、 {灯籠|とうろう} が {一列|いちれつ} に {灯|とも}った 。 {水|みず} の {底|そこ} に 、 {昔|むかし} の {通|とお}り が {一本|いっぽん} 、 {浮|う}かび{上|あ}がる 。 || Under the shallows the lanterns come up in a line, and on the bottom of the lake an old street shows itself.
narr: {最後|さいご} の {灯籠|とうろう} の {笠|かさ} に 、 {通|とお}り の {名前|なまえ} 。 「{下町|したまち}{通|どお}り」 。 || On the shade of the last lantern, the street's name: Lower Town Street.
narr: ナギ に {教|おし}えたら 、 {笠|かさ} が {一枚|いちまい} {増|ふ}える だろう 。 || Tell Nagi, and there'll be one more shade to write.
!note lw_lf_lower_town

@scene cr.lw_lf_lamps_after
narr: {浅瀬|あさせ} の {灯籠|とうろう} が 、 {丁目|ちょうめ} ごと に {灯|とも}って いる 。 「{下町|したまち}{通|どお}り」 。 || The lanterns in the shallows burn block by block. Lower Town Street.

@scene ko.lw_lf_box_open
!gesture pc observe prop:chest
narr: {承認|しょうにん} 、 {受理|じゅり} 、 {保留|ほりゅう} 、 {確認|かくにん} …… どの {種類|しゅるい} の {判子|はんこ} に も {効|き}く {言葉|ことば} が 、 {一|ひと}つ ある 。 あらゆる {封|ふう} を 、 {一度|いちど} に ほどく 。 || Approved, received, pending, checked… there is one word that answers a stamp of any kind. Every kind of seal comes undone at once.
narr: {箱|はこ} の {中|なか} は 、 {小|ちい}さな {紙|かみ} で いっぱい だ 。 「{丸|まる} に {反対|はんたい}」 「{四角|しかく} に {反対|はんたい}」 「{休|やす}み が ほしい 。 シュウ」 。 || The box is full of little slips. "Against round." "Against square." "I would like a day off. —Shū."
narr: {記録館|きろくかん} が 、 {受|う}け{取|と}り も {断|ことわ}り も せず に 、 {閉|と}じ{込|こ}めた 「いいえ」 だ 。 || The "no"s the Hall would neither take nor turn down, and so shut away.
!look lf_tadashi pc
lf_tadashi: …… {全部|ぜんぶ} 、 {受理|じゅり} いたします 。 {審議|しんぎ} は 、 {長|なが}く なります が 。 || …I shall accept every one. The hearings will take a long while.
!note lw_lf_objections

@scene ko.lw_lf_box_after
narr: {空|から} の {箱|はこ} 。 {判子|はんこ} の {跡|あと} だけ が 、 {蓋|ふた} に {残|のこ}って いる 。 || An empty box, only the marks of the stamps left on its lid.

@scene yn.lw_lf_charter_open
!gesture pc observe prop:chest
narr: {鍵穴|かぎあな} は {十二|じゅうに} 。 {一|ひと}つ ずつ {回|まわ}して も 、 {他|ほか} が {閉|し}まる 。 {十二|じゅうに} の {錠|じょう} を 、 {全体|ぜんたい} で {一|ひと}つ の もの と して {扱|あつか}う と 、 {蓋|ふた} は {静|しず}か に {開|あ}いた 。 || Twelve keyholes. Turn them one at a time and the others close again. Treat the twelve locks as one whole, and the lid opens quietly.
narr: {中|なか} に は 、 {黄色|きいろ}く なった {紙|かみ} が {一枚|いちまい} 。 {町|まち} の {始|はじ}まり の {約定|やくじょう} だ 。 || Inside lies a single yellowed sheet: the town's founding charter.
narr: 「{灯落|ひおち} の {者|もの} は 、 {誰|だれ} でも 、 {反対|はんたい} して よい 。 {反対|はんたい} は 、 {最後|さいご} まで {聞|き}く こと 。」 || "Anyone in Lanternfall may object. An objection is to be heard to the end."
!look lf_yae pc
lf_yae[smile]: …… {最初|さいしょ} から 、 {書|か}いて あった の ね 。 {次|つぎ} の {議会|ぎかい} で 、 {読|よ}み{上|あ}げます 。 {誰|だれ} か が {反対|はんたい} する でしょう けど 。 || …It was written down from the very beginning. I'll read it out at the next council. Somebody will object, I expect.
!note lw_lf_charter

@scene yn.lw_lf_charter_after
narr: {開|あ}いた {箱|はこ} 。 {約定|やくじょう} は 、 タミ が {議会|ぎかい} の {卓|たく} に {移|うつ}した 。 || The open chest. Tami has moved the charter to the council table.
`);
})(RB.living);
