/* Companionship content, part 6: the campaign's existing decisions (addendum §7.6).
 * The audit and its four-companion coverage table are in docs/addendum/companion_decisions.md.
 * Here: (1) forward recording for replies the story keeps no flag for; (2) the
 * decisions a companion may think about afterwards (CC.decisions: a newly set
 * flag becomes the "recent result" on the Company page); (3) the short thoughts
 * that fill a missing perspective. None changes an outcome, none adds a bond
 * award, none infers a moral position from completion alone. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (CC, K) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  // ---- forward recording (older saves: no record, and the lines that use it fall back to neutral) ----
  const RECORD = {
    'co.suzu_night': ['suzu_night', { reach: 'reach', push: 'push' }],
    'co.suzu_truth': ['suzu_truth', { quiet: 'quiet', speak: 'speak' }],
    'sb.charts_sketch': ['ren_sketch', { keep: 'keep', onward: 'onward' }],
    'sb.quiet_nao': ['quiet_night', { push: 'push', listen: 'listen', share: 'share' }],
    'sb.quiet_mio': ['quiet_night', { reassure: 'reassure', honest: 'honest', share: 'share' }],
    'sb.quiet_ren': ['quiet_night', { recite: 'recite', keep: 'keep', hope: 'hope' }],
    'sb.quiet_suzu': ['quiet_night', { which: 'which', wait: 'wait', helped: 'helped' }],
    'sa.shelf_ren': ['ren_folio', { rtake: 'take', rleave: 'leave', ryours: 'yours' }],
    'sa.heart_kasane': ['sa_heart', { wrong: 'wrong', toya: 'toya' }],
  };
  CC.recorded = [];
  for (const sid in RECORD) {
    const [id, map] = RECORD[sid];
    for (const label in map) CC.recorded.push({ scene: sid, label, id, value: map[label], ok: K.recordAt(sid, label, id, map[label]) });
  }

  // ---- decisions a companion may think about afterwards ------------------------------------------------
  CC.decisions.push(
    { id: 'sg_wataru', flags: ['sg_wataru_self', 'sg_wataru_confessed'] },
    { id: 'co_asm', flags: ['co_asm_names', 'co_asm_living', 'co_asm_ume'] },
    { id: 'ren_shelf', flags: ['sa_ren_told', 'sa_ren_carried'] },
    { id: 'sa_heart' }, // recorded forward (talk.d.sa_heart), no flag
  );
  const D = (comp, on, when, text) => CC.thoughts.push({ comp, kind: 'recent', on: 'dec:' + on, when, text });

  // Saltglass: who took Wataru's confession to the harbourmaster (the scene's choice had no companion line)
  D('nao', 'sg_wataru', 'sg_wataru_self', T('ワタル は {自分|じぶん} の {足|あし} で {港長|こうちょう} の {所|ところ} へ {行|い}った 。 {俺|おれ} たち は {後|うし}ろ を {歩|ある}いた だけ だ 。 それ で いい 。', 'Wataru walked to the harbourmaster on his own feet. We only walked behind him. That\'s how it should be.'));
  D('nao', 'sg_wataru', 'sg_wataru_confessed', T('{俺|おれ} たち が {先|さき} に {話|はな}した 。 {本人|ほんにん} に {言|い}わせる {手|て} も あった けど 、 {黙|だま}って {待|ま}たせる より は いい 。', 'We spoke first. We could have made him say it himself — but it beat leaving him waiting in silence.'));
  D('mio', 'sg_wataru', 'sg_wataru_self', T('{自分|じぶん} の {口|くち} で {言|い}えた ワタル さん は 、 {少|すこ}し {楽|らく} に なった と {思|おも}います 。 {苦|にが}い {薬|くすり} を 、 {自分|じぶん} で {飲|の}んだ ん です 。', 'Saying it in his own words must have eased Wataru a little. He took the bitter medicine himself.'));
  D('mio', 'sg_wataru', 'sg_wataru_confessed', T('{私|わたし} たち から {伝|つた}えて 、 よかった と {思|おも}います 。 {一人|ひとり} で {言|い}わせる に は 、 {重|おも}すぎる {話|はなし} でした 。', 'I think it was right that we told them. It was too heavy a thing to make him say alone.'));
  D('ren', 'sg_wataru', 'sg_wataru_self', T('{書|か}き{換|か}えた {本人|ほんにん} が 、 {自分|じぶん} で {訂正|ていせい} を {申|もう}し{出|で}た 。 {記録|きろく} と して は 、 {一番|いちばん} {良|よ}い {形|かたち} です 。', 'The man who altered the record asked to correct it himself. As records go, the best form there is.'));
  D('ren', 'sg_wataru', 'sg_wataru_confessed', T('{報告|ほうこく} は {私|わたし} たち が しました 。 {訂正|ていせい} は 、 これから ワタル さん が {自分|じぶん} の {字|じ} で する でしょう 。', 'We made the report. The corrections, Wataru will make in his own hand from now on.'));
  D('suzu', 'sg_wataru', 'sg_wataru_self', T('{自分|じぶん} で {台詞|せりふ} を {言|い}った わ ね 、 ワタル さん 。 {震|ふる}える {声|こえ} の {台詞|せりふ} は 、 よく {届|とど}く の よ 。', 'Wataru said his line himself. A line said in a shaking voice carries.'));
  D('suzu', 'sg_wataru', 'sg_wataru_confessed', T('{台詞|せりふ} を {代|か}わり に {言|い}う の も 、 {時|とき} に は {必要|ひつよう} 。 {本人|ほんにん} が {舞台|ぶたい} に {立|た}って いれば 、 それ で いい の 。', 'Sometimes someone has to say the line for you. As long as he\'s on the stage, that\'s enough.'));

  // Cinder Orchard: the first line of the chronicle (the companions spoke to the outcome, not to the choice)
  D('nao', 'co_asm', 'co_asm_names', T('{名前|なまえ} から {読|よ}んだ の は 、 {正|ただ}しい {順番|じゅんばん} だ と {思|おも}う 。 {宛名|あてな} が {先|さき} 、 {中身|なかみ} は {後|あと} だ 。', 'Reading the names first was the right order, I think. Address first, contents after.'));
  D('nao', 'co_asm', 'co_asm_living', T('{草刈|くさか}り から か 。 {生|い}きてる {奴|やつ} の {逃|に}げ{道|みち} を {先|さき} に {作|つく}る 。 {俺|おれ} でも そう {言|い}った 。', 'Starting with the grass-cutting. Make a way out for the living first. I\'d have said the same.'));
  D('nao', 'co_asm', 'co_asm_ume', T('ウメ {婆|ばあ}さん に {話|はな}させた の は 、 よかった 。 {預|あず}けて ない {人|ひと} の {言葉|ことば} は 、 {重|おも}さ が {違|ちが}う 。', 'Letting Grandma Ume speak was good. Words from someone who never handed anything over weigh differently.'));
  D('mio', 'co_asm', 'co_asm_names', T('{名前|なまえ} が {読|よ}まれる たび に 、 {誰|だれ} か が {息|いき} を {呑|の}んで いました 。 {痛|いた}い けど 、 {必要|ひつよう} な {痛|いた}み です 。', 'Each time a name was read, someone caught their breath. It hurts, but it\'s a pain they need.'));
  D('mio', 'co_asm', 'co_asm_living', T('{生|い}きて いる {人|ひと} の こと を {先|さき} に 。 …… {薬師|くすし} と して は 、 {一番|いちばん} {安心|あんしん} する {始|はじ}め{方|かた} でした 。', 'The living first. …As an apothecary, that was the most reassuring way to begin.'));
  D('mio', 'co_asm', 'co_asm_ume', T('ウメ さん 、 {眠|ねむ}れない {理由|りゆう} が {分|わ}かって 、 ほっと した {顔|かお} を して いました ね 。', 'Ume looked relieved to finally know why she couldn\'t sleep.'));
  D('ren', 'co_asm', 'co_asm_names', T('{五|いつ}つ の {名前|なまえ} から {始|はじ}まる {頁|ページ} 。 {灯守|ひもり} と して は 、 {文句|もんく} の ない {一行目|いちぎょうめ} です 。', 'A page that begins with five names. As a keeper, I couldn\'t ask for a better first line.'));
  D('ren', 'co_asm', 'co_asm_living', T('{防火帯|ぼうかたい} から {書|か}く 。 {記録|きろく} は {過去|かこ} の ため だけ で は なく 、 {明日|あした} の ため に も ある 。 {良|よ}い {判断|はんだん} でした 。', 'Beginning with the firebreaks. Records aren\'t only for the past; they\'re for tomorrow too. A sound judgement.'));
  D('ren', 'co_asm', 'co_asm_ume', T('{覚|おぼ}え{続|つづ}けた {人|ひと} の {声|こえ} から {始|はじ}める 。 {記録|きろく} より {先|さき} に {声|こえ} が ある 。 {師匠|ししょう} も そう {言|い}った でしょう 。', 'Beginning with the voice of the one who kept remembering. The voice comes before the record. My teacher would have agreed.'));
  D('suzu', 'co_asm', 'co_asm_names', T('{最初|さいしょ} に {名前|なまえ} を {呼|よ}ぶ 。 {幕|まく} が {上|あ}がる {前|まえ} の {点呼|てんこ} みたい だった 。 {全員|ぜんいん} 、 ちゃんと {舞台|ぶたい} に いた わ 。', 'Calling the names first. Like the roll call before curtain up. Everyone was there on stage.'));
  D('suzu', 'co_asm', 'co_asm_living', T('{草刈|くさか}り から ！ {涙|なみだ} の {前|まえ} に {鎌|かま} 。 {現実的|げんじつてき} で 、 {私|わたし} は {好|す}き よ 。', 'Grass-cutting first! Sickles before tears. Practical — I like it.'));
  D('suzu', 'co_asm', 'co_asm_ume', T('ウメ さん に {台詞|せりふ} を {渡|わた}した の 、 いい {演出|えんしゅつ} だった わ 。 {一番|いちばん} {覚|おぼ}えて いた {人|ひと} が 、 {一番|いちばん} {最初|さいしょ} 。', 'Handing the line to Ume was good direction. The one who remembered most, first.'));

  // The Still Archive: leaving Ren's folio where it was (only the carried choice had companion lines)
  D('nao', 'ren_shelf', 'sa_ren_told', T('レン の {荷物|にもつ} は 、 {棚|たな} に {置|お}いて きた 。 {取|と}り に {行|い}く か どう か も 、 {本人|ほんにん} が {決|き}める こと だ 。', 'We left Ren\'s parcel on the shelf. Whether to come for it is Ren\'s to decide too.'));
  D('mio', 'ren_shelf', 'sa_ren_told', T('レン さん の {分|ぶん} は 、 {置|お}いて きました ね 。 {場所|ばしょ} を {伝|つた}える だけ 。 それ が 、 {一番|いちばん} {優|やさ}しい {渡|わた}し{方|かた} かも しれません 。', 'We left Ren\'s there, didn\'t we. Only telling Ren where it is. That might be the kindest way to hand it over.'));
  D('suzu', 'ren_shelf', 'sa_ren_told', T('レン の {荷物|にもつ} 、 {預|あず}かり{証|しょう} だけ {持|も}って {帰|かえ}る の ね 。 {受|う}け{取|と}る か どう か は 、 {本人|ほんにん} の {出番|でばん} 。', 'We\'re bringing home only the claim ticket for Ren\'s parcel. Whether to collect it is Ren\'s cue.'));

  // The heart of the Hush: what the player said to Kasane (recorded from now on)
  D('nao', 'sa_heart', 'talk.d.sa_heart=wrong', T('「 {誰|だれ} も {頼|たの}んで ない 」 か 。 …… {配達人|はいたつにん} が {一番|いちばん} {言|い}いたい {文句|もんく} を 、 {先|さき} に {言|い}われた な 。', '"No one asked you." …You beat me to the complaint every courier most wants to make.'));
  D('nao', 'sa_heart', 'talk.d.sa_heart=toya', T('トウヤ の {紙切|かみき}れ の {話|はなし} から {入|はい}った の は 、 よかった と {思|おも}う 。 {責|せ}める より {先|さき} に 、 {宛先|あてさき} を {確|たし}かめた ん だ 。', 'Starting with Tōya\'s note was good, I think. Before blaming, you checked who it was addressed to.'));
  D('mio', 'sa_heart', 'talk.d.sa_heart=wrong', T('「 {間違|まちが}って いる 」 と {言|い}える こと 。 {灯落|ひおち} で {取|と}り{戻|もど}した もの を 、 あなた は ちゃんと {使|つか}いました ね 。', 'Being able to say "you\'re wrong". You used what Lanternfall got back, properly.'));
  D('mio', 'sa_heart', 'talk.d.sa_heart=toya', T('{責|せ}める {前|まえ} に 、 {話|はなし} を {聞|き}く 。 …… カサネ さん も 、 {三十年|さんじゅうねん} {誰|だれ} か に {聞|き}いて ほしかった の かも しれません 。', 'Listening before blaming. …Perhaps Kasane had wanted someone to listen for thirty years.'));
  D('ren', 'sa_heart', 'talk.d.sa_heart=wrong', T('{反対|はんたい} を {言|い}う 。 {師匠|ししょう} が {最後|さいご} まで した こと を 、 あなた が {言葉|ことば} に しました 。', 'Saying no to it. What my teacher did to the very end, you put into words.'));
  D('ren', 'sa_heart', 'talk.d.sa_heart=toya', T('{記録|きろく} の {原本|げんぽん} に {戻|もど}る 。 トウヤ さん の {写|うつ}し から {始|はじ}めた の は 、 {灯守|ひもり} の やり{方|かた} でした 。', 'Going back to the original record. Beginning with Tōya\'s copy was a keeper\'s way of doing it.'));
  D('suzu', 'sa_heart', 'talk.d.sa_heart=wrong', T('{一番|いちばん} {言|い}いにくい {台詞|せりふ} を 、 {一番|いちばん} {最初|さいしょ} に {言|い}った わ ね 。 {客席|きゃくせき} から {見|み}て て 、 {震|ふる}えた わ 。', 'You said the hardest line first. Watching from the audience, I shivered.'));
  D('suzu', 'sa_heart', 'talk.d.sa_heart=toya', T('{相手|あいて} の {台本|だいほん} を {読|よ}んで から {舞台|ぶたい} に {上|あ}がる 。 {一番|いちばん} {怖|こわ}い {共演者|きょうえんしゃ} の やり{方|かた} よ 。 {褒|ほ}めてる の 。', 'Reading the other actor\'s script before stepping on stage. The most formidable kind of co-star. That\'s a compliment.'));
})(RB.content.company, RB.company);
