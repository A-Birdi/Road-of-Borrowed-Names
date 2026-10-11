/* Returns (expansion P15g; sealed S14, each arc's "Postgame"): the four companions' beats after the story, in
 * twelve-chapter journeys, each with the companion it belongs to.
 *  - Suzu: the troupe passes through Manybridge's festival hall, and Suzu and you do the double act for them: three
 *    new bits, you as the straight one, the same shape as Playhouse Row's (src/content/mp/31_manzai.js). Koume laughs
 *    first. In the morning the troupe goes on ahead, this time to wait (rt_troupe_seen; Tomi remembers the summer).
 *  - Nao: at Kirishita Sakichi's letter of the week is waiting, and Nao opens it there and then; Nao runs a letter of
 *    yours down the relay (to whom is your choice), and the reply is waiting next time.
 *  - Mio: Kikue visits the festival hall on her holiday, with a jar of her own, labelled 「未定」 (undecided).
 *  - Ren: Hisae and Ren walk the Keepers' Road on the night all its lamps are lit, and Ren says the night's saying.
 * Each visitor stands in the festival hall only with the companion whose beat it is, and goes when it is over. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const POST = 'ed>=2&postgame';
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  const ok = (parts, en, result) => ({ parts, ok: true, en, result });
  const no = (parts, en, why, result) => ({ parts, ok: false, en, why: { en: why }, result });
  const tiers = (low, high) => ({ F: [low], E: [low], I: [high], A: [high] });

  // ---- Suzu: the double act, for the troupe ----------------------------------------------------------------------------------
  // a bit as in Playhouse Row: the funny one's line, the right retort, and near misses (two options low, three high)
  function bit(id, title, boke, right, w1, why1, w2, why2, item) {
    const low = ch({ item, ctx: { jp: boke.jp, en: boke.en }, prompt: T('What is wrong with that? Choose your retort.'), options: [o(right, 1), o(w1, 0, why1)] });
    const high = ch({ item, ctx: { jp: boke.jp, en: '' }, prompt: T('Your retort (two of them are close):'), options: [o(right, 1), o(w1, 0, why1), o(w2, 0, why2)] });
    C.challenges[id] = { title, tiers: tiers(low, high) };
  }
  bit('rt.troupe_1', T('The double act: the books', '{漫才|まんざい} ・ {帳簿|ちょうぼ}'),
    T('"My books are perfect. Every month, exactly zero. …So\'s my purse."', 'わたし 、 {帳簿|ちょうぼ} は {完璧|かんぺき} です 。 {毎月|まいつき} 、 ぴったり ゼロ 。 …… {財布|さいふ} も ゼロ 。'),
    'それ は {完璧|かんぺき} じゃ なくて 、 お{金|かね} が ない だけ でしょう ！',
    'すごい 。 {毎月|まいつき} ぴったり です か 。', 'That believes her: the joke is that zero in the purse is nothing to boast of.',
    'それ は お{金|かね} が ない んじゃ なくて 、 {完璧|かんぺき} な だけ でしょう ！', 'Swapped: being perfect is what isn\'t true.', 'v:帳簿');
  bit('rt.troupe_2', T('The double act: the hot spring', '{漫才|まんざい} ・ {温泉|おんせん}'),
    T('"In Steamhollow I got into the hot spring every night. …With my clothes on."', '{湯|ゆ}ノ{谷|たに} で 、 {毎晩|まいばん} {温泉|おんせん} に {入|はい}りました 。 …… {服|ふく} を {着|き}た まま 。'),
    '{服|ふく} は {脱|ぬ}いで から {入|はい}る もの でしょう ！',
    '{温泉|おんせん} は 、 {気持|きも}ち いい です よね 。', 'That plays along: the joke is the clothes.',
    '{服|ふく} は {着|き}て から {入|はい}る もの でしょう ！', 'Swapped: you take your clothes off first (脱いでから).', 'g:v_te_kara');
  bit('rt.troupe_3', T('The double act: rain and sweets', '{漫才|まんざい} ・ あめ'),
    T('"When the rain came, I stood with my mouth open, looking up. I thought something sweet would fall." ({雨|あめ} and {飴|あめ} are both あめ)', '{雨|あめ} が {降|ふ}って きた から 、 {口|くち} を {開|あ}けて 、 {上|うえ} を {向|む}いて いました 。 {甘|あま}い の が {降|ふ}る と {思|おも}って 。'),
    'それ は {飴|あめ} ！ {空|そら} から {降|ふ}る の は {雨|あめ} でしょう ！',
    '{甘|あま}かった です か ？', 'That asks about the taste: the joke is the two あめ mixed up.',
    'それ は {雨|あめ} ！ {空|そら} から {降|ふ}る の は {飴|あめ} でしょう ！', 'Swapped: rain ({雨|あめ}) falls from the sky; the sweet is {飴|あめ}.', 'v:飴');

  // ---- Nao: the week's letter, and one of yours down the relay -----------------------------------------------------------
  C.challenges['rt.nao_letter'] = { title: T('Sakichi\'s letter', 'サキチ の {手紙|てがみ}'), tiers: {
    F: [ch({ item: 'v:急ぐ', ctx: { jp: 'なお へ 。 とうげ の ゆき が とけた 。 かじか が なきはじめた 。 いそがなくて いい 。 でも 、 おちゃ は いれて おく 。 さきち', en: '' }, prompt: T('What does Sakichi say about coming?'),
      options: [e('No hurry, but the tea will be ready.', 1), e('Come at once.', 0, 'いそがなくて いい: there is no need to hurry.')] })],
    E: [ch({ item: 'v:急ぐ', ctx: { jp: 'ナオ へ 。 {峠|とうげ} の {雪|ゆき} が {溶|と}けた 。 カジカ が {鳴|な}き{始|はじ}めた 。 {急|いそ}がなくて いい 。 でも 、 お{茶|ちゃ} は {入|い}れて おく 。 サキチ', en: '' }, prompt: T('What does Sakichi say about coming, and what is the news?'),
      options: [e('The snow on the pass has melted and the frogs have started singing; no hurry, but there will be tea.', 1), e('The pass is snowed in; do not come.', 0, '{雪|ゆき}が{溶|と}けた: the snow has melted.'), e('Bring tea when you come.', 0, 'お{茶|ちゃ}は{入|い}れておく: Sakichi will make it.')] })],
    I: [ch({ item: 'g:te_oku', ctx: { jp: 'ナオ へ 。 {峠|とうげ} の {雪|ゆき} が {溶|と}けて 、 カジカ が {鳴|な}き{始|はじ}めた 。 {棚|たな} の お{前|まえ} の {段|だん} は 、 {空|あ}けて おいた 。 {急|いそ}がなくて いい が 、 {茶|ちゃ} は {毎晩|まいばん} {入|い}れて おく 。 サキチ', en: '' }, prompt: T('What has Sakichi got ready for Nao?'),
      options: [e('Nao\'s pigeonhole, left empty for their letters; and tea, made every night in case they come.', 1), e('A pigeonhole full of letters Nao has not collected.', 0, '{空|あ}けておいた: left empty, ready.'), e('Nothing: the tea is for Sakichi.', 0, '〜ておく: done ahead, for someone who may come.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: 'ナオ へ 。 {峠|とうげ} の {雪|ゆき} も {溶|と}け 、 カジカ が {鳴|な}き{始|はじ}めた 。 お{前|まえ} の {段|だん} は {空|あ}けて ある 。 {返事|へんじ} は {急|いそ}がん で いい 。 {茶|ちゃ} だけ は 、 {毎晩|まいばん} {二人分|ふたりぶん} {入|い}れて おる 。 サキチ', en: '' }, prompt: T('What is Sakichi really saying?'),
      options: [e('No hurry for a reply, but a visit would be welcome: there is tea for two every night.', 1), e('Reply at once.', 0, '{急|いそ}がんでいい: no need to hurry.'), e('Sakichi has a guest staying.', 0, 'The second cup is the one kept for Nao.')] })],
  } };
  C.challenges['rt.nao_send'] = { title: T('A letter for the relay', '{継|つ}ぎ{飛脚|びきゃく} に {頼|たの}む {手紙|てがみ}'), tiers: tiers(
    F({ id: 'rt.nao_send.low', item: 'g:prt_he', prompt: T('Write a short letter for Nao to carry. To whom is your choice.'),
      families: [
        ok(['ひろ へ 。', 'また まつり に いきます 。'], 'To Hiro: I\'ll come to the festival again.', 'hiro'),
        ok(['つる さん へ 。', 'げんき で います 。'], 'To Tsuru: I\'m well.', 'tsuru'),
        ok(['ひさえ さん へ 。', 'また みち を あるきます 。'], 'To Hisae: I\'ll walk the road again.', 'hisae'),
        no(['ひろ を 。', 'また まつり に いきます 。'], 'Hiro (object): I\'ll come to the festival again.', 'A letter is written to someone: へ, not を.', 'wo'),
      ] }),
    F({ id: 'rt.nao_send.high', item: 'g:prt_he', prompt: T('Write a short letter for Nao to carry. To whom is your choice.'),
      families: [
        ok(['ヒロ へ 。', '{今年|ことし} の {祭|まつ}り に も 、 {必|かなら}ず {行|い}きます 。'], 'To Hiro: I\'ll be at this year\'s festival too, without fail.', 'hiro'),
        ok(['ツル さん へ 。', '{元気|げんき} で います 。 {灯|あか}り{堂|どう} の {皆|みな}さん に よろしく 。'], 'To Tsuru: I\'m well. My regards to everyone at the Lantern Hall.', 'tsuru'),
        ok(['ヒサエ さん へ 。', '{灯|ひ} の {点|つ}く {晩|ばん} に 、 また {歩|ある}き に {行|い}きます 。'], 'To Hisae: I\'ll come and walk the road again on the night the lamps are lit.', 'hisae'),
        no(['ヒロ へ 。', '{去年|きょねん} の {祭|まつ}り に も 、 {必|かなら}ず {行|い}きます 。'], 'To Hiro: I\'ll be at last year\'s festival too, without fail.', 'Last year has gone: {去年|きょねん} can\'t take {行|い}きます.', 'past'),
      ] })) };

  // ---- Mio: Kikue's jar -----------------------------------------------------------------------------------------------------
  C.challenges['rt.kikue_label'] = { title: T('Kikue\'s label', 'キクエ の {札|ふだ}'), tiers: {
    F: [ch({ item: 'v:決める', ctx: { jp: 'きめて いない こと 。 あけないで 。', en: '' }, prompt: T('What is in the jar, by its label?'),
      options: [e('Things not decided yet.', 1), e('Medicine for colds.', 0, 'きめて いない こと: things not decided.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{未定|みてい} 。 {中身|なかみ} ： {決|き}めて いない こと 。 {開|あ}けないで ください 。', en: '' }, prompt: T('What does the label say, and ask?'),
      options: [e('It holds what she hasn\'t decided yet; please don\'t open it.', 1), e('It holds what she hasn\'t decided; please open it and decide for her.', 0, '{開|あ}けないでください: please don\'t open it.'), e('It is empty; please fill it.', 0, '{中身|なかみ}: the contents, which are written there.')] })],
    I: [ch({ item: 'g:temo', ctx: { jp: '{未定|みてい} 。 {中身|なかみ} ： {店|みせ} を {閉|し}める か 、 {誰|だれ} か に {譲|ゆず}る か 。 {効|き}き{目|め} ： {飲|の}んで も {分|わ}からない 。', en: '' }, prompt: T('What hasn\'t Kikue decided, and what does the label say it does?'),
      options: [e('Whether to close the shop or hand it on; and taking it won\'t tell you.', 1), e('Whether to close the shop; taking it tells you the answer.', 0, '{飲|の}んでも{分|わ}からない: even if you take it, you won\'t know.'), e('Which medicine to sell; it cures indecision.', 0, 'The contents are about the shop itself.')] })],
    A: [ch({ item: 'v:未定', ctx: { jp: '{未定|みてい} 。 {中身|なかみ} ： {店|みせ} を {畳|たた}む か {譲|ゆず}る か の {迷|まよ}い 。 {効能|こうのう} ： {特|とく}に なし 。 {用法|ようほう} ： {急|いそ}がず 、 {時々|ときどき} {振|ふ}って みる こと 。', en: '' }, prompt: T('What are the directions for use?'),
      options: [e('Don\'t hurry; give it a shake now and then.', 1), e('Take it three times a day.', 0, '{用法|ようほう}: {急|いそ}がず、{時々|ときどき}{振|ふ}ってみること.'), e('Throw it away once you have decided.', 0, 'The label says nothing about throwing it away.')] })],
  } };

  // ---- Ren: the night's saying --------------------------------------------------------------------------------------------
  C.challenges['rt.ren_saying'] = { title: T('The night\'s saying', '{今夜|こんや} の {言葉|ことば}'), tiers: {
    F: [ch({ item: 'g:cond_tara', ctx: { jp: 'まよったら 、 いちばん ふるい なまえ に もどれ 。', en: '' }, prompt: T('What does the saying tell you to do?'),
      options: [e('If you get lost, go back to the oldest name.', 1), e('Once you go back to the oldest name, you will get lost.', 0, 'まよったら: if (when) you get lost.')] })],
    E: [ch({ item: 'g:cond_tara', ctx: { jp: '{迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 。', en: '' }, prompt: T('What does the saying tell you to do?'),
      options: [e('If you get lost, go back to the oldest name.', 1), e('Once you go back to the oldest name, you will get lost.', 0, '{迷|まよ}ったら: if (when) you get lost.'), e('Never use the old names.', 0, '{戻|もど}れ: go back (to them).')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 。 …… {迷|まよ}わなかったら 、 {先|さき} へ {進|すす}め 。', en: '' }, prompt: T('Ren says the saying; Hisae adds a line. What does Hisae add?'),
      options: [e('If you don\'t get lost, keep going.', 1), e('If you get lost, keep going.', 0, '{迷|まよ}わなかったら: if you don\'t get lost.'), e('Don\'t go any further.', 0, '{先|さき}へ{進|すす}め: go on ahead.')] })],
    A: [ch({ item: 'g:cond_nara', ctx: { jp: '{迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 。 …… {迷|まよ}う と {分|わ}かって いる なら 、 {最初|さいしょ} から {誰|だれ} か と {歩|ある}け 。', en: '' }, prompt: T('Ren says the saying; Hisae adds a line. What does Hisae add?'),
      options: [e('If you know you\'ll get lost, walk with someone from the start.', 1), e('If you know the way, walk alone.', 0, '{迷|まよ}うと{分|わ}かっているなら: if you know you will get lost.'), e('Once you are lost, find someone.', 0, '{最初|さいしょ}から: from the very start, before you are lost.')] })],
  } };

  // ---- placements -------------------------------------------------------------------------------------------------------------
  const hall = C.maps['mp.festhall'];
  hall.npcs = hall.npcs.concat([
    { id: 'yn_koume', x: 4, y: 6, dir: 'right', if: POST + '&comp=suzu&!rt_troupe_seen', talk: 'rt.troupe' },
    { id: 'yn_shinza', x: 10, y: 6, dir: 'left', if: POST + '&comp=suzu&!rt_troupe_seen', talk: 'rt.troupe' },
    { id: 'yn_kikue', x: 10, y: 6, dir: 'left', if: POST + '&comp=mio&!rt_kikue_seen', talk: 'rt.kikue_jar' },
  ]);
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id && Array.isArray(n.talk));
  const sakichi = npc('cr.kirishita', 'cr_sakichi');
  if (sakichi) sakichi.talk.unshift(
    { if: POST + '&comp=nao&!rt_nao_read', scene: 'rt.nao_sakichi' },
    { if: POST + '&comp=nao&rt_nao_due&!rt_nao_told', scene: 'rt.nao_reply' },
    { if: POST + '&comp=nao&!rt_nao_sent', scene: 'rt.nao_write' });
  // the reply comes back while you are away: it is due once you have left Kirishita and come again
  const kiri = C.maps['cr.kirishita'];
  kiri.onEnter = (kiri.onEnter || []).concat([{ scene: 'rt.nao_due', if: POST + '&rt_nao_sent&!rt_nao_due' }]);
  const hisae = npc('kr.lodge', 'kr_hisae');
  if (hisae) hisae.talk.unshift({ if: POST + '&comp=ren&!rt_ren_walk', scene: 'rt.ren_walk' });

  RB.script.add(`
@scene rt.troupe
!faceplayer
yn_koume: スズ ！ {八百橋|やおばし} を {通|とお}る のに 、 {会|あ}わず に {行|い}ける わけ ない でしょ 。 || Suzu! We could hardly come through Manybridge without seeing you.
yn_shinza: {一晩|ひとばん} だけ 、 {会所|かいしょ} を {借|か}りた 。 {客|きゃく} は 、 {一座|いちざ} {全員|ぜんいん} だ 。 || We've borrowed the hall for one night. The audience is the whole troupe.
yn_koume: {二人|ふたり} の {漫才|まんざい} 、 {見|み}に {行|い}く って {言|い}った でしょ 。 …… {見|み}せて 。 || I said I'd come and see the two of you do your act. …So show me.
suzu[laugh]: …… {相方|あいかた} 、 {出番|でばん} よ 。 || …Partner, you're on.
!choice
* {舞台|ぶたい} に {出|で}る || Go on -> act
* {少|すこ}し {待|ま}って もらう || Ask them to wait -> wait
:wait
yn_koume: {待|ま}つ の は {慣|な}れてる わ 。 …… {今夜|こんや} {中|じゅう} なら ね 。 || I'm used to waiting. …As long as it's tonight.
!end
:act
!fade out
narr: {会所|かいしょ} の {奥|おく} に 、 {即席|そくせき} の {舞台|ぶたい} 。 {客席|きゃくせき} に は 、 {一座|いちざ} の {顔|かお} が {並|なら}んで いる 。 || A makeshift stage at the back of the hall. In the seats, the troupe's faces in a row.
!fade in
suzu: はい 、 どうも どうも ！ わたし 、 {帳簿|ちょうぼ} は {完璧|かんぺき} です 。 {毎月|まいつき} 、 ぴったり ゼロ 。 …… {財布|さいふ} も ゼロ 。 || Hello, hello! My books are perfect. Every month, exactly zero. …So's my purse.
!challenge rt.troupe_1
narr: {最初|さいしょ} に {笑|わら}った の は 、 コウメ だった 。 {次|つぎ} に シンザ 。 {一座|いちざ} {全員|ぜんいん} が 、 {知|し}って いる {話|はなし} だ 。 || Koume laughs first. Then Shinza. Every one of them knows this story.
suzu: この {前|まえ} 、 {湯|ゆ}ノ{谷|たに} で 、 {毎晩|まいばん} {温泉|おんせん} に {入|はい}りました 。 …… {服|ふく} を {着|き}た まま 。 || The other day in Steamhollow, I got into the hot spring every night. …With my clothes on.
!challenge rt.troupe_2
narr: シンザ が 、 {膝|ひざ} を {叩|たた}いて {笑|わら}って いる 。 {湯|ゆ}ノ{谷|たに} に は 、 {一座|いちざ} も いた 。 || Shinza slaps his knee. The troupe was in Steamhollow too.
suzu: {昨日|きのう} は ね 、 {雨|あめ} が {降|ふ}って きた から 、 {口|くち} を {開|あ}けて 、 {上|うえ} を {向|む}いて いました 。 {甘|あま}い の が {降|ふ}る と {思|おも}って 。 || Yesterday the rain came, so I stood with my mouth open, looking up. I thought something sweet would fall.
!challenge rt.troupe_3
narr: {最後|さいご} の {洒落|しゃれ} で 、 {会所|かいしょ} が {揺|ゆ}れた 。 || The last pun shakes the hall.
yn_koume: …… {悔|くや}しい けど 、 いい {相方|あいかた} ね 。 {間|ま} が いい 。 || …I hate to say it, but that's a good partner. Good timing.
suzu[smile]: でしょう ？ {返|かえ}さない わ よ 。 || Isn't it? I'm not giving this one back.
yn_shinza: {明日|あした} の {朝|あさ} 、 {一座|いちざ} は {次|つぎ} の {町|まち} へ {出|で}る 。 {今度|こんど} は {置|お}いて {行|い}く ん じゃ ない 。 {先|さき} に {行|い}って 、 {待|ま}って いる だけ だ 。 || In the morning the troupe moves on to the next town. This time we're not leaving you behind. We're only going on ahead to wait.
!fade out
!set rt_troupe_seen
narr: {翌朝|よくあさ} 、 {一座|いちざ} の {荷車|にぐるま} は 、 {街道|かいどう} の {先|さき} へ {消|き}えて いった 。 || The next morning, the troupe's carts disappear down the highway.
!fade in
suzu: …… {次|つぎ} の {幕|まく} 、 {楽|たの}しみ ね 。 || …I'm looking forward to the next act.

@scene rt.nao_sakichi
!faceplayer
!set rt_nao_read
cr_sakichi: ナオ 、 {今週|こんしゅう} の {分|ぶん} だ 。 {昨日|きのう} {着|つ}いた 。 || Nao. This week's. It came yesterday.
narr: ナオ は 、 その {場|ば} で {封|ふう} を {切|き}った 。 || Nao opens it then and there.
nao: …… {前|まえ} は 、 {何年|なんねん} も {待|ま}たせた のに な 。 || …I used to keep these waiting for years.
!challenge rt.nao_letter
?(var._res=1) nao[smile]: カジカ か 。 …… {聞|き}き に {来|こ}い って こと だ な 。 || Kajika frogs. …That means come and listen.
nao: {返事|へんじ} は 、 {今夜|こんや} {書|か}く 。 {明日|あした} の {朝|あさ} 、 {継|つ}ぎ{飛脚|びきゃく} で {下|くだ}る から 。 || I'll write the reply tonight. I'm running the relay down in the morning.
!call rt.nao_write

@scene rt.nao_write
nao: $name も 、 {何|なに} か {出|だ}す か ？ {俺|おれ} が {運|はこ}ぶ 。 {一週間|いっしゅうかん} で {届|とど}く 。 || Got anything to send? I'll carry it. It'll get there within the week.
!choice
* {書|か}く || Write one -> write
* {今|いま} は いい || Not now -> no
:write
!challenge rt.nao_send
!if var._res=0 -> no
?(var._forge=hiro) !var rt_nao_to = hiro
?(var._forge=tsuru) !var rt_nao_to = tsuru
?(var._forge=hisae) !var rt_nao_to = hisae
!set rt_nao_sent
nao: {預|あず}かった 。 {鞄|かばん} が {重|おも}い の は 、 {悪|わる}く ない 。 || Got it. A heavy satchel isn't a bad thing.
!end
:no
nao: いつ でも いい 。 {継|つ}ぎ{飛脚|びきゃく} は 、 {毎朝|まいあさ} {出|で}る 。 || Any time. The relay runs every morning.

@scene rt.nao_due
!set rt_nao_due

@scene rt.nao_reply
!faceplayer
!set rt_nao_told
cr_sakichi: お{前|まえ} さん に も 、 {返事|へんじ} が {来|き}て いる ぞ 。 || There's a reply for you too.
?(var.rt_nao_to=hiro) narr: ヒロ から 。 「 {手紙|てがみ} 、 {届|とど}いた 。 {窯|かま} の {火|ひ} は {無事|ぶじ} だ 。 {祭|まつ}り に は {来|こ}い 。 」 || From Hiro: "Got your letter. The kiln fire's safe. Come to the festival."
?(var.rt_nao_to=tsuru) narr: ツル から 。 「 {毎朝|まいあさ} 、 {読|よ}み{上|あ}げて います 。 {灯|あか}り{堂|どう} の {皆|みな} が 、 {覚|おぼ}えて しまいました 。 」 || From Tsuru: "I read it aloud every morning. Everyone at the Lantern Hall knows it by heart now."
?(var.rt_nao_to=hisae) narr: ヒサエ から 。 「 {手紙|てがみ} は 、 {灯|ひ} の {横|よこ} に {置|お}いて ある よ 。 {夜|よる} が また {短|みじか}く なった 。 」 || From Hisae: "I keep your letter beside the lamp. The nights are shorter again."
nao[smile]: {六日|むいか} で {着|つ}いた 。 {記録|きろく} だ 。 || Six days. A record.
?(talk.d.nao_address=station) nao: {俺|おれ} の {段|だん} に も 、 もう {一通|いっつう} {来|き}て た 。 …… {今度|こんど} は 、 ちゃんと {取|と}り に {来|き}た ぞ 。 || There was another one in my pigeonhole too. …And this time I came to collect it.

@scene rt.kikue_jar
!faceplayer
yn_kikue: あら 、 ミオ ちゃん 。 {休|やす}み を もらって 、 {祭|まつ}り の {遊|あそ}び を {見|み}に {来|き}た の 。 {一人|ひとり} で {旅|たび} を する なんて 、 {何十年|なんじゅうねん} ぶり かしら 。 || Oh, Mio. I've taken a holiday and come to see the festival games. Travelling on my own: I can't remember when I last did.
mio[surprise]: キクエ さん 。 …… その {壺|つぼ} は ？ || Kikue. …What's that jar?
yn_kikue: {私|わたし} の よ 。 {札|ふだ} も 、 ちゃんと {書|か}いた の 。 || Mine. I wrote a label for it, too.
!challenge rt.kikue_label
mio[laugh]: …… {札|ふだ} を {付|つ}けた ん です ね 。 {決|き}めて いない こと に 。 || …You put a label on it. On the things you haven't decided.
yn_kikue: {年|とし} を {取|と}る と ね 、 {決|き}めて いない こと も 、 どこ に {置|お}いた か {分|わ}から なく なる の 。 だから 、 {書|か}いて おく の よ 。 || When you get to my age, you forget where you put the things you haven't decided. So I write it down.
mio: わたし の は 、 {札|ふだ} なし の まま に します 。 || I'll keep mine without a label.
yn_kikue: それ で いい の 。 {壺|つぼ} の {数|かず} だけ 、 {決|き}め{方|かた} が ある わ 。 || That's as it should be. There are as many ways of deciding as there are jars.
!fade out
!set rt_kikue_seen
narr: キクエ は {輪投|わな}げ を {三回|さんかい} やって 、 {一回|いっかい} も {入|はい}らず 、 {満足|まんぞく} そう に {帰|かえ}って いった 。 || Kikue plays the ring toss three times, gets none on, and goes home looking thoroughly pleased.
!fade in

@scene rt.ren_walk
!faceplayer
kr_hisae: {今夜|こんや} は 、 {道|みち} の {灯|ひ} を {端|はし} から {順|じゅん} に 、 {一晩|ひとばん} で {点|つ}けて {回|まわ}る {晩|ばん} さ 。 {昔|むかし} の {灯守|ひもり} は 、 {年|とし} に {一度|いちど} 、 そう した もん だ 。 || Tonight's the night we go along the road lighting every lamp in turn, all in one night. The old keepers did it once a year.
kr_hisae: {一緒|いっしょ} に {歩|ある}く かい 、 レン 。 {道|みち} を {歩|ある}く {灯守|ひもり} なら 、 もう {迷|まよ}わない だろう ？ || Will you walk it with me, Ren? A keeper who walks the road doesn't get lost any more, surely?
ren[laugh]: …… {約束|やくそく} は できません 。 || …I can't promise that.
!choice
* {一緒|いっしょ} に {行|い}く || Go with them -> go
* また {今度|こんど} || Another time -> no
:no
kr_hisae: {灯|ひ} は {逃|に}げない よ 。 {毎年|まいとし} {点|つ}ける から ね 。 || The lamps won't run away. We light them every year.
!end
:go
!fade out
!ambience night
narr: {日|ひ} が {沈|しず}む {前|まえ} に 、 {三人|さんにん} で {道|みち} の {麓|ふもと} まで {下|お}りた 。 {暗|くら}く なる と 、 ヒサエ が {灯|ひ} を {入|い}れ 、 レン が {名|な} を {呼|よ}ぶ 。 || Before sunset the three of you go down to the foot of the road. When dark falls, Hisae lights each lamp and Ren calls its name.
!fade in
narr: {迎|むか}え の {灯|ひ} 、 {杉|すぎ} の {灯|ひ} 、 {羊歯|しだ} の {灯|ひ} 、 {狐|きつね} の {灯|ひ} 。 {灯籠|とうろう} が {一|ひと}つ ずつ 、 {暗|くら}い {道|みち} に {点|とも}って いく 。 || The Welcoming Light, the Cedar Light, the Fern Light, the Fox Light. One by one, the lanterns come alight along the dark road.
narr: {尾根|おね} の {端|はし} の {灯籠|とうろう} の {前|まえ} で 、 ヒサエ は {火|ひ} を レン に {渡|わた}した 。 || At the lantern at the end of the ridge, Hisae hands the flame to Ren.
ren: {尾根|おね} の {灯|ひ} 。 …… {今夜|こんや} は 、 {迷|まよ}わず に {着|つ}きました 。 || The Ridge Light. …Tonight I got here without getting lost.
ren: {今夜|こんや} の {言葉|ことば} です 。 || Tonight's saying.
!challenge rt.ren_saying
kr_hisae: {尾根|おね} の {灯|ひ} まで 、 {一度|いちど} も {迷|まよ}わなかった ね 。 || All the way to the Ridge Light, and not lost once.
ren[smile]: {二人|ふたり} が {一緒|いっしょ} でした から 。 || I had the two of you with me.
!set rt_ren_walk
narr: {宿坊|しゅくぼう} に {戻|もど}った の は 、 {夜明|よあ}け {近|ちか}く だった 。 {振|ふ}り{返|かえ}る と 、 {道|みち} の {灯|ひ} が {一本|いっぽん} の {線|せん} に なって いた 。 || It's nearly dawn when you get back to the lodge. Looking back, the road's lamps make a single line.
`);
})(RB.content);
