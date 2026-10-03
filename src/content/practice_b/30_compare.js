/* One Word, Two Moments (Practice addendum §19.1): twelve authored comparisons of two
 * lines from the story, C01–C12, one per contrast category, plus one clearly labelled
 * sample pair of teaching examples (S01) for an empty list. Engine:
 * src/engine/79_compare.js; interface: src/ui/92_compare.js.
 *
 * Every story source is a real line: { scene, line (command index), who, jp (the frozen
 * quotation), en, reading (contextual reading), h (hash of jp and en) }. They were copied
 * from the scenes, and tests/unit/practice_b.test.mjs checks each one against the content
 * (the scene exists, the command is that speaker's line, the hash matches). If a scene is
 * later rewritten, RB.compare.status() stops offering the pair rather than showing a
 * contradiction. `ctx` says where the line is heard (no spoilers beyond the line itself).
 *
 * Questions (q.F/E/I/A) keep the same actual meaning at every level: Foundations shows
 * the translations and asks a simpler relation question; Advanced asks about nuance.
 * No pair is inferred from a shared surface word: each has an authored rationale. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.practiceB = C.practiceB || {};
  const T = (en, jp) => ({ en, jp });
  const opt = (en, ok, why, jp) => (ok ? { en, jp, ok: true } : { en, jp, ok: false, why: { en: why } });
  const choose = (prompt, options, o) => Object.assign({ kind: 'choose', prompt, options }, o || {});
  // a short written answer inside a bounded space (families as in the letters)
  const write = (prompt, replies, o) => Object.assign({ kind: 'write', prompt, replies }, o || {});
  const ok = (parts, en) => ({ ok: true, tone: 'answer', parts, en });

  C.practiceB.compare = [
    {
      id: 'C01', cat: 'referent', catLabel: T('What it points to', '{指|さ}す もの'), word: T('これ (kore), "this"', 'これ'),
      ref: { grammar: 'kosoado' }, item: 'g:kosoado',
      a: { scene: 'rw.mio_first', line: 5, who: 'mio', ctx: T('Mio, at the apothecary, with the blank labels in her hands', '{薬屋|くすりや} で 、 {白|しろ}い ラベル を {手|て} に した ミオ'),
        jp: 'でも 、 {変|へん} なん です 。 {水|みず} に ぬれた なら 、 {紙|かみ} が ふやける はず でしょう 。 これ 、 ぜんぜん ぬれて いない ん です よ 。', en: 'But it\'s strange. If they\'d got wet, the paper would be warped, wouldn\'t it? These aren\'t wet at all.', reading: 'でも、へんなんです。みずにぬれたなら、かみがふやけるはずでしょう。これ、ぜんぜんぬれていないんですよ。', h: '1kwv91i' },
      b: { scene: 'rw.ren_lanterns_done', line: 3, who: 'ren', ctx: T('Ren, by the bridge, once the lanterns are lit', '{灯|あか}り が ともった {後|あと} 、 {橋|はし} の そば の レン'),
        jp: 'ありがとう ございます 。 これ を 。 {灯守|ひもり} の {言葉|ことば} です 。 {私|わたし} より 、 あなた の {手|て} で {書|か}く {方|ほう} が {明|あか}るい でしょう 。', en: 'Thank you. Take this — a keeper\'s word. It\'ll shine brighter written in your hand than in mine.', reading: 'ありがとうございます。これを。ひもりのことばです。わたしより、あなたのてでかくほうがあかるいでしょう。', h: '1ql4edx' },
      q: {
        F: choose(T('Both lines use これ ("this"). What does it point to in each?', '{二|ふた}つ の 「 これ 」 は 、 それぞれ {何|なに} を {指|さ}す ？'), [
          opt('Mio: the labels she holds · Ren: the keeper\'s word he hands over', true),
          opt('Both: the labels', false, 'Ren\'s これ is something he gives you: "a keeper\'s word".'),
          opt('Mio: the medicine · Ren: the lantern', false, 'Mio is talking about paper that should have warped: the labels.'),
        ], { showEn: true }),
        E: choose(T('What does これ point to in each line?', 'それぞれ の 「 これ 」 は {何|なに} ？'), [
          opt('Mio: the labels · Ren: the keeper\'s word', true),
          opt('Mio: the water · Ren: the bridge', false, 'Mio says これ isn\'t wet at all: the paper labels.'),
          opt('The same thing in both', false, 'これ points to whatever is at hand — different things in the two moments.'),
        ]),
        I: write(T('In Ren\'s line, これ is something he hands you. Write what it is, in his words.', 'レン の 「 これ 」 は {何|なん} です か 。 レン の {言葉|ことば} で {書|か}きましょう 。'), [
          ok(['{灯守|ひもり} の {言葉|ことば}'], 'a keeper\'s word'), ok(['{言葉|ことば}'], 'a word'),
          { ok: false, parts: ['ラベル'], en: 'the labels', why: { en: 'That is Mio\'s これ. Ren\'s is "{灯守|ひもり}の{言葉|ことば}".' } },
        ]),
        A: choose(T('Which statement about the two これ is accurate?', '{二|ふた}つ の 「 これ 」 に ついて 、 {正|ただ}しい の は どれ ？'), [
          opt('Both point to something in the speaker\'s hands, but to different things', true, null, 'どちら も {話|はな}し{手|て} の {手元|てもと} の もの を {指|さ}す が 、 {指|さ}す もの は {違|ちが}う'),
          opt('Ren\'s これ refers back to his previous sentence', false, 'He follows これを。 with what it is: a keeper\'s word he is handing over.', 'レン の 「 これ 」 は {前|まえ} の {文|ぶん} を {指|さ}す'),
          opt('Both point to the labels', false, 'Only Mio\'s does.', 'どちら も ラベル を {指|さ}す'),
        ]),
      },
      explain: { en: 'これ ("this") has no fixed meaning: it points to whatever is near the speaker at that moment. In Mio\'s hand it is the labels; in Ren\'s, the keeper\'s word he gives you. The context does the work.' },
    },
    {
      id: 'C02', cat: 'literal-contextual', catLabel: T('Literal or figurative', '{文字|もじ} どおり か 、 たとえ か'), word: T('{重|おも}い (omoi), "heavy"', '{重|おも}い'),
      ref: { word: '重い' }, item: 'v:重い',
      a: { scene: 'rw.mochi_find', line: 2, who: 'narr', ctx: T('Picking up the white cat in the grass', '{草|くさ} の {上|うえ} の {白|しろ}い {猫|ねこ} を {抱|かか}えた {時|とき}'),
        jp: '{抱|かか}え{上|あ}げる と 、 {意外|いがい} と {重|おも}い 。 そして 、 よく {伸|の}びる 。', en: 'When you lift her, she\'s heavier than expected. And she stretches a long way.', reading: 'かかえあげると、いがいとおもい。そして、よくのびる。', h: '15bemcq' },
      b: { scene: 'sg.omi_checking', line: 3, who: 'omi', ctx: T('Harbourmaster Ōmi, sending you round the harbour', '{港|みなと} を {回|まわ}る よう {言|い}う オウミ'),
        jp: 'テツ は {口|くち} が {重|おも}い が 、 {潮|しお} の こと なら {誰|だれ} より {知|し}ってる 。', en: 'Tetsu doesn\'t say much, but no one knows the tides better.', reading: 'テツはくちがおもいが、しおのことならだれよりしってる。', h: '1reantf' },
      q: {
        F: choose(T('In which line does {重|おも}い mean "heavy to lift"?', '「 {持|も}つ と {重|おも}い 」 の {意味|いみ} は どちら ？'), [
          opt('The cat', true), opt('Tetsu', false, 'Tetsu\'s {口|くち}が{重|おも}い is about talking, not weight.'), opt('Both', false, 'Only the cat is lifted.'),
        ], { showEn: true }),
        E: choose(T('テツは{口|くち}が{重|おも}い — what does Ōmi mean?', '「 {口|くち} が {重|おも}い 」 とは ？'), [
          opt('Tetsu doesn\'t say much', true), opt('Tetsu\'s mouth hurts', false, 'Nothing hurts: it is an expression about speech.'), opt('Tetsu is heavy', false, 'It is his mouth that is "heavy": he speaks little.'),
        ]),
        I: choose(T('Choose the meaning of {口|くち}が{重|おも}い.', '「 {口|くち} が {重|おも}い 」 の {意味|いみ} を {選|えら}びましょう 。'), [
          opt('doesn\'t talk much', true, null, 'あまり {話|はな}さない'), opt('eats a lot', false, 'Food isn\'t in it.', 'よく {食|た}べる'), opt('has a sore mouth', false, 'It is not about pain.', '{口|くち} が {痛|いた}い'),
        ]),
        A: choose(T('Which uses {重|おも}い in the same non-literal way as Ōmi\'s line?', 'オウミ の {台詞|せりふ} と {同|おな}じ く 、 たとえ と して の 「 {重|おも}い 」 は どれ ？'), [
          opt('to feel reluctant, low', true, null, '{気|き} が {重|おも}い'), opt('heavy luggage', false, 'Luggage is literally heavy.', '{重|おも}い {荷物|にもつ}'), opt('a heavy stone', false, 'A stone is literally heavy.', '{重|おも}い {石|いし}'),
        ]),
      },
      explain: { en: 'The cat is literally {重|おも}い. In {口|くち}が{重|おも}い the weight is figurative: speech comes slowly, so the person says little. {気|き}が{重|おも}い works the same way for feelings.' },
    },
    {
      id: 'C03', cat: 'request-statement', catLabel: T('Request or statement', '{頼|たの}み か 、 {報告|ほうこく} か'), word: T('{見|み}る (miru), "to look"', '{見|み}る'),
      ref: { grammar: 'v_te_kudasai' }, item: 'g:v_te_kudasai',
      a: { scene: 'sg.wataru_first', line: 4, who: 'wataru', ctx: T('Wataru, at No. 2 warehouse', '{二番|にばん} {倉庫|そうこ} の ワタル'),
        jp: 'よかったら 、 {箱|はこ} を {見|み}て みて ください 。 {僕|ぼく} は …… {帳簿|ちょうぼ} を {確認|かくにん} します ので 。', en: 'Please, look at the crates if you like. I\'ll… check the ledger.', reading: 'よかったら、はこをみてみてください。ぼくは……ちょうぼをかくにんしますので。', h: '1307a5p' },
      b: { scene: 'sg.omi_report', line: 1, who: 'pc', ctx: T('You, reporting back to Harbourmaster Ōmi', 'オウミ に {報告|ほうこく} する あなた'),
        jp: '{三|みっ}つ とも {見|み}ました 。 でも …… {全部|ぜんぶ} が {同|おな}じ {原因|げんいん} では ない と {思|おも}います 。', en: 'We\'ve seen all three. But… I don\'t think they all have the same cause.', reading: 'みっつともみました。でも……ぜんぶがおなじげんいんではないとおもいます。', h: 'cr3pdy' },
      q: {
        F: choose(T('Which line asks someone to do something?', '{誰|だれ} か に {何|なに} か を {頼|たの}んで いる の は どちら ？'), [
          opt('Wataru\'s', true), opt('Yours', false, 'You are reporting what you already did.'), opt('Both', false, '{見|み}ました is a report, not a request.'),
        ], { showEn: true }),
        E: choose(T('{見|み}てみてください and {見|み}ました: what is the difference?', '「 {見|み}て みて ください 」 と 「 {見|み}ました 」 の {違|ちが}い は ？'), [
          opt('A request to look · a report that you looked', true), opt('Both are requests', false, '～ました is the polite past: something done.'), opt('Both report the past', false, '～てください asks for an action.'),
        ]),
        I: write(T('Turn Wataru\'s request into a report that you did it (polite past of {見|み}てみる).', 'ワタル の {頼|たの}み を 、 {終|お}わった {報告|ほうこく} に {変|か}えましょう （ 「 {見|み}て みる 」 の ていねい な {過去|かこ} ）。'), [
          ok(['{見|み}て みました'], 'I (tried and) looked'), ok(['{箱|はこ} を', '{見|み}て みました'], 'I looked at the crates'),
          { ok: false, parts: ['{見|み}て みて ください'], en: 'please look', why: { en: 'That is still the request.' } },
          { ok: false, parts: ['{見|み}ます'], en: 'I will look', why: { en: 'That is a future or habitual statement, not a report that you did it.' } },
        ]),
        A: choose(T('What does よかったら add to Wataru\'s request?', '「 よかったら 」 は ワタル の {頼|たの}み に {何|なに} を {加|くわ}える ？'), [
          opt('It leaves the choice to you — a soft request, almost an offer', true), opt('It turns it into an order', false, 'It does the opposite: it softens.'), opt('It means "if it is good"', false, 'Literally close, but as a phrase it means "if you like".'),
        ]),
      },
      explain: { en: '～てください asks someone to act; ～ました reports that it was done. Wataru\'s よかったら softens his request, and the two lines bracket the same task: asked, then done.' },
    },
    {
      id: 'C04', cat: 'permission-prohibition', catLabel: T('Allowed or forbidden', '{許|ゆる}し か 、 {禁止|きんし} か'), word: T('～て いい / ～ちゃ いけない', '～て いい ・ ～ちゃ いけない'),
      ref: { grammar: 'v_temo_ii' }, item: 'g:v_temo_ii',
      a: { scene: 'rw.hall_gather', line: 7, who: 'tsuru', ctx: T('Keeper Tsuru, in the Lantern Hall, before you choose a companion', '{旅|たび} の {連|つ}れ を {選|えら}ぶ {前|まえ} 、 {灯|あか}り{堂|どう} の ツル'),
        jp: 'ここ で は {好|す}きな だけ {時間|じかん} を かけて いい 。 {話|はな}して 、 {迷|まよ}って 、 {決|き}め{直|なお}して いい 。 でも 、 あの {灯|あか}り が {敷居|しきい} を {越|こ}えたら 、 {旅|たび} の {終|お}わり まで 、 その {二|ふた}つ の {名前|なまえ} を {運|はこ}ぶ 。 {三|みっ}つ{目|め} は {取|と}らない 。', en: 'Take as long as you like in here. Talk, waver, change your mind. But once that lantern crosses the threshold, it carries those two names to the end of the journey. It won\'t take a third.', reading: 'ここではすきなだけじかんをかけていい。はなして、まよって、きめなおしていい。でも、あのあかりがしきいをこえたら、たびのおわりまで、そのふたつのなまえをはこぶ。みっつめはとらない。', h: '3plw8i' },
      b: { scene: 'co.sayo_seats', line: 3, who: 'co_sayo', ctx: T('Sayo, laying out the festival seats', '{祭|まつ}り の {席|せき} を {並|なら}べる サヨ'),
        jp: 'さあ …… {聞|き}いた こと が ない わ 。 {聞|き}いちゃ いけない よう な {気|き} が して 。 {変|へん} よ ね 。', en: 'Hmm… I\'ve never asked. It always felt like something I shouldn\'t. Strange, isn\'t it.', reading: 'さあ……きいたことがないわ。きいちゃいけないようなきがして。へんよね。', h: '1n1ng2e' },
      q: {
        F: choose(T('Which speaker gives permission?', '「 いい 」 と {許|ゆる}して いる の は {誰|だれ} ？'), [
          opt('Tsuru', true), opt('Sayo', false, 'Sayo talks about something that felt forbidden.'), opt('Both', false, 'いけない is the opposite of いい.'),
        ], { showEn: true }),
        E: choose(T('What does Sayo feel she must not do?', 'サヨ は {何|なに} を して は いけない と {感|かん}じて いる ？'), [
          opt('Ask whose seat it is', true), opt('Sit in the empty seat', false, 'She is asked whose seat it is; her {聞|き}いちゃ is about asking.'), opt('Set out the seats', false, 'That is what she is doing.'),
        ]),
        I: choose(T('{聞|き}いちゃいけない is a casual form of…', '「 {聞|き}いちゃ いけない 」 の もと の {形|かたち} は ？'), [
          opt('must not ask', true, null, '{聞|き}いて は いけない'), opt('needn\'t ask', false, 'That removes an obligation; it forbids nothing.', '{聞|き}かなくて も いい'), opt('may ask', false, 'That is permission, the opposite.', '{聞|き}いて も いい'),
        ]),
        A: choose(T('Is Sayo stating a rule?', 'サヨ は きまり を {言|い}って いる ？'), [
          opt('No — ような{気|き}がして makes it a feeling that it was forbidden, not a rule', true), opt('Yes — a village rule', false, 'Nothing in her line names a rule; she only "felt" it.'), opt('Yes — Tsuru forbade it', false, 'Tsuru is in another village and another moment.'),
        ]),
      },
      explain: { en: '～ていい grants permission ("you may"); ～てはいけない — casually ～ちゃいけない — forbids. Sayo wraps hers in ような{気|き}がして, so it is a felt prohibition, not a stated rule.' },
    },
    {
      id: 'C05', cat: 'direct-indirect', catLabel: T('Direct or indirect request', 'まっすぐ な {頼|たの}み 、 {遠回|とおまわ}し な {頼|たの}み'), word: T('～て いただけます か / ～て ください', '～て いただけます か ・ ～て ください'),
      ref: { grammar: 'te_giving' }, item: 'g:te_giving',
      a: { scene: 'rw.ren_first', line: 6, who: 'ren', ctx: T('Ren, meeting you by the bridge', '{橋|はし} で {初|はじ}めて {会|あ}う レン'),
        jp: 'ツル さん が {言|い}って いた {方|かた} です ね 。 {字|じ} が {残|のこ}る と 。 {南|みなみ} の {灯|あか}り と 、 {橋|はし} の {灯|あか}り 。 {記録|きろく} を {読|よ}み{上|あ}げます から 、 {書|か}いて いただけます か 。', en: 'You\'re the one Tsuru mentioned — whose writing stays. The south lantern and the bridge lantern. I\'ll read from the records if you\'ll write.', reading: 'ツルさんがいっていたかたですね。じがのこると。みなみのあかりと、はしのあかり。きろくをよみあげますから、かいていただけますか。', h: '1m6k9nr' },
      b: { scene: 'co.bell_ring', line: 13, who: 'co_tokiwa', ctx: T('Tokiwa, when the old bell suddenly rings', '{古|ふる}い {鐘|かね} が {急|きゅう} に {鳴|な}った {時|とき} の トキワ'),
        jp: '{誰|だれ} が {鳴|な}らした の です か ！ {綱|つな} を {外|はず}して ください 。 {今|いま} すぐ に ！', en: 'Who rang that?! Take that rope down. At once!', reading: 'だれがならしたのですか！つなをはずしてください。いますぐに！', h: '8q057i' },
      q: {
        F: choose(T('Which request is more direct?', 'より まっすぐ な {頼|たの}み は どちら ？'), [
          opt('Tokiwa\'s', true), opt('Ren\'s', false, 'Ren asks a polite question; Tokiwa tells them to do it, now.'), opt('They are the same', false, 'One is a question, one is a command-like request.'),
        ], { showEn: true }),
        E: choose(T('{書|か}いていただけますか — what is Ren doing?', '「 {書|か}いて いただけます か 」 で レン は {何|なに} を して いる ？'), [
          opt('Politely asking you to write', true), opt('Saying that he will write', false, 'He will read; he asks you to write.'), opt('Asking whether you can read', false, 'It is about writing for him.'),
        ]),
        I: write(T('Make Tokiwa\'s request indirect, like Ren\'s: rope … ～ていただけますか.', 'トキワ の {頼|たの}み を 、 レン の よう に 「 ～て いただけます か 」 に しましょう 。'), [
          ok(['{綱|つな} を', '{外|はず}して いただけます か'], 'Could you take the rope down?'), ok(['{外|はず}して いただけます か'], 'Could you take it down?'),
          { ok: false, parts: ['{綱|つな} を', '{外|はず}して ください'], en: 'Take the rope down, please.', why: { en: 'That is her direct form, unchanged.' } },
        ]),
        A: choose(T('Why might Tokiwa use the direct form here?', 'トキワ が ここ で まっすぐ な {形|かたち} を {使|つか}う の は なぜ ？'), [
          opt('Alarm and urgency: she wants it done at once ({今|いま}すぐに)', true), opt('～てください is the most indirect form', false, 'It is direct compared with ～ていただけますか.'), opt('She cannot use polite forms', false, 'She uses です and ください, both polite.'),
        ]),
      },
      explain: { en: 'Both are polite. ～てください asks outright; ～ていただけますか asks whether you would be willing — a question that leaves room to refuse. Ren is asking a stranger a favour; Tokiwa is alarmed.' },
    },
    {
      id: 'C06', cat: 'certainty', catLabel: T('Certain or uncertain', '{確|たし}か か 、 {不確|ふたし}か か'), word: T('かもしれない / {間違|まちが}い ない', 'かもしれない ・ {間違|まちが}い ない'),
      ref: { grammar: 'kamo' }, item: 'g:kamo',
      a: { scene: 'co.tokiwa_confront', line: 4, who: 'co_tokiwa', ctx: T('Tokiwa, weighing the evidence in the Chronicle Hall', '{記録堂|きろくどう} で {証拠|しょうこ} を {量|はか}る トキワ'),
        jp: '{苗木|なえぎ} は {病気|びょうき} で {植|う}え{替|か}えた の かも しれない 。 {窯|かま} は {古|ふる}く なった の かも しれない 。 {帳面|ちょうめん} の {空白|くうはく} は 、 {誰|だれ} か が {書|か}き{忘|わす}れた の かも しれない 。', en: 'The saplings may have been replaced for blight. The kiln may simply have grown old. The gap in the ledger may be someone\'s forgetfulness.', reading: 'なえぎはびょうきでうえかえたのかもしれない。かまはふるくなったのかもしれない。ちょうめんのくうはくは、だれかがかきわすれたのかもしれない。', h: 'vskyv' },
      b: { scene: 'rw.ren_after', line: 1, who: 'ren', ctx: T('Ren, back in Reedwake once the lanterns hold', '{灯|あか}り が {落|お}ち{着|つ}いた {後|あと} の {葦|あし}ノ{瀬|せ} の レン'),
        jp: '{村|むら} の {灯|あか}り は {全部|ぜんぶ} ともって います 。 {毎晩|まいばん} {確|たし}かめて いる ので 、 {間違|まちが}い ありません 。', en: 'Every lantern in the village is lit. I check each night, so there\'s no doubt.', reading: 'むらのあかりはぜんぶともっています。まいばんたしかめているので、まちがいありません。', h: '19gyz5e' },
      q: {
        F: choose(T('Which speaker is sure?', '{確|たし}か だ と {言|い}って いる の は {誰|だれ} ？'), [
          opt('Ren', true), opt('Tokiwa', false, 'かもしれない means "may"; she is not sure.'), opt('Both', false, 'Tokiwa lists possibilities.'),
        ], { showEn: true }),
        E: choose(T('かもしれない means…', '「 かもしれない 」 の {意味|いみ} は ？'), [
          opt('may, might', true), opt('certainly', false, 'That would be {間違|まちが}いない or きっと.'), opt('must not', false, 'That would be いけない.'),
        ]),
        I: choose(T('Why is Ren sure? Choose the reason he gives.', 'レン が {確|たし}か だ と {言|い}える {理由|りゆう} は ？'), [
          opt('He checks every night', true, null, '{毎晩|まいばん} {確|たし}かめて いる から'), opt('All the lanterns exist', false, 'He gives his checking as the reason (～ので).', '{灯|あか}り が {全部|ぜんぶ} ある から'), opt('His teacher said so', false, 'His teacher isn\'t mentioned here.', '{先生|せんせい} が {言|い}った から'),
        ]),
        A: choose(T('Tokiwa repeats かもしれない three times. What is she doing?', 'トキワ が 「 かもしれない 」 を {三度|さんど} {重|かさ}ねる の は ？'), [
          opt('Showing that each clue has another explanation, so nothing is proved yet', true), opt('Agreeing with the evidence', false, 'She offers other explanations for it.'), opt('Accusing someone', false, 'She names no one; she resists a conclusion.'),
        ]),
      },
      explain: { en: '～かもしれない ("may") marks a possibility; {間違|まちが}いありません ("there is no mistake") asserts certainty, and Ren backs it with a reason (～ので). Tokiwa uses possibility to refuse a conclusion.' },
    },
    {
      id: 'C07', cat: 'cause-sequence', catLabel: T('Because, or after', '{理由|りゆう} か 、 {順番|じゅんばん} か'), word: T('から (kara)', 'から'),
      ref: { grammar: 'conj_kara' }, item: 'g:conj_kara',
      a: { scene: 'sg.omi_intro', line: 15, who: 'omi', ctx: T('Harbourmaster Ōmi, when you mention the sunken archive', '{沈|しず}んだ {書庫|しょこ} の {話|はなし} を {聞|き}いた オウミ'),
        jp: '…… {沈|しず}んだ {書庫|しょこ} ？ ああ 、 {岬|みさき} の {沖|おき} の やつ か 。 {子|こ}ども の {怪談|かいだん} だ よ 。 まず は {港|みなと} を {片付|かたづ}けて から に しな 。', en: '…The sunken archive? Oh, the one off the point. That\'s a children\'s ghost story. Sort out the harbour first.', reading: '……しずんだしょこ？ああ、みさきのおきのやつか。こどものかいだんだよ。まずはみなとをかたづけてからにしな。', h: 'aidvpi' },
      b: { scene: 'rw.nao_first', line: 1, who: 'nao', ctx: T('Nao, in the river warehouse', '{川|かわ} の {倉庫|そうこ} の ナオ'),
        jp: '…… {入口|いりぐち} から {来|き}た なら 、 {足元|あしもと} {気|き}を つけて 。 {三|みっ}つ{目|め} の {床板|ゆかいた} 、 {抜|ぬ}けてる から 。', en: '…If you came in the front, watch your step. The third floorboard is gone.', reading: '……いりぐちからきたなら、あしもときをつけて。みっつめのゆかいた、ぬけてるから。', h: '1ycxraj' },
      q: {
        F: choose(T('Which から means "because"?', '「 なぜ なら 」 の から は どちら ？'), [
          opt('Nao\'s', true, null, '{抜|ぬ}けてる から'), opt('Ōmi\'s', false, 'After a て-form, から means "after".', '{片付|かたづ}けて から'), opt('Both', false, 'Ōmi\'s gives an order of events.'),
        ], { showEn: true }),
        E: choose(T('{片付|かたづ}けてからにしな — what does Ōmi want first?', 'オウミ は {先|さき} に {何|なに} を して ほしい ？'), [
          opt('Sort out the harbour', true), opt('Go to the archive', false, 'The archive comes after the harbour, if at all.'), opt('Tell a ghost story', false, 'He calls the archive a ghost story.'),
        ]),
        I: choose(T('Nao\'s line has から twice. What does each mean?', 'ナオ の {台詞|せりふ} の 「 から 」 {二|ふた}つ の {意味|いみ} は ？'), [
          opt('{入口|いりぐち}から: from (a place) · {抜|ぬ}けてるから: because', true), opt('both: because', false, '{入口|いりぐち}から marks where you came from.'), opt('{入口|いりぐち}から: after · {抜|ぬ}けてるから: from', false, 'After a noun, から is "from"; after a plain sentence, "because".'),
        ]),
        A: choose(T('Which sentence keeps Ōmi\'s meaning?', 'オウミ の {意味|いみ} を {保|たも}つ {文|ぶん} は ？'), [
          opt('Let\'s talk about the archive after sorting out the harbour', true, null, '{港|みなと} を {片付|かたづ}けた {後|あと} で 、 {書庫|しょこ} の {話|はなし} を しよう'),
          opt('Let\'s talk about the archive because I\'ll sort out the harbour', false, 'This から gives a reason, which changes the meaning.', '{港|みなと} を {片付|かたづ}ける から 、 {書庫|しょこ} の {話|はなし} を しよう'),
          opt('Let\'s talk about the archive while sorting out the harbour', false, 'ながら is "while": at the same time, not first.', '{港|みなと} を {片付|かたづ}け ながら 、 {書庫|しょこ} の {話|はなし} を しよう'),
        ]),
      },
      explain: { en: 'After a て-form, から means "after" (～てから: sequence). After a plain sentence it means "because" (～から: cause). After a place, "from". Nao\'s single line shows two of them.' },
    },
    {
      id: 'C08', cat: 'completed-intended', catLabel: T('Done, or only meant', '{済|す}んだ こと か 、 つもり か'), word: T('{売|う}る (uru), "to sell"', '{売|う}る'),
      ref: { grammar: 'tsumori' }, item: 'g:tsumori',
      a: { scene: 'sg.wataru_confront', line: 10, who: 'wataru', ctx: T('Wataru, confronted at No. 2 warehouse', '{二番|にばん} {倉庫|そうこ} で {問|と}い{詰|つ}められた ワタル'),
        jp: '{荷|に} を {少|すこ}し ずつ {売|う}って 、 {払|はら}う つもり でした 。 {給料|きゅうりょう} が {出|で}たら 、 {全部|ぜんぶ} {戻|もど}す つもり で 。 ラベル が {勝手|かって} に {変|か}わり{始|はじ}めた とき …… {嵐|あらし} の せい に できる 、 と {思|おも}って しまった ん です 。', en: 'I meant to sell a little cargo at a time and pay it off. To put it all back once the wages came. When the labels started changing by themselves… I thought, I can blame the storm.', reading: 'にをすこしずつうって、はらうつもりでした。きゅうりょうがでたら、ぜんぶもどすつもりで。ラベルがかってにかわりはじめたとき……あらしのせいにできる、とおもってしまったんです。', h: 'nswt9r' },
      b: { scene: 'sg.omi_wataru', line: 34, who: 'omi', ctx: T('Ōmi, deciding what Wataru must do', 'ワタル の {処分|しょぶん} を {決|き}める オウミ'),
        jp: 'だが 、 {荷|に} を {売|う}った の は お{前|まえ} の {落|お}ち{度|ど} だ 。 {売|う}った {分|ぶん} は 、 {給料|きゅうりょう} から {返|かえ}して もらう 。 {灯台|とうだい} と ソウタ に は 、 {自分|じぶん} で {頭|あたま} を {下|さ}げに {行|い}け 。', en: 'But selling the cargo is your fault. You\'ll repay what you sold out of your wages. And you\'ll go to the lighthouse and to Sōta yourself, and apologise.', reading: 'だが、にをうったのはおまえのおちどだ。うったぶんは、きゅうりょうからかえしてもらう。とうだいとソウタには、じぶんであたまをさげにいけ。', h: 'btsulm' },
      q: {
        F: choose(T('Did Wataru actually sell cargo?', 'ワタル は {本当|ほんとう} に {荷|に} を {売|う}った ？'), [
          opt('Yes — Ōmi says {売|う}った (sold)', true), opt('No — he only meant to', false, 'Ōmi\'s {売|う}った and {売|う}った{分|ぶん} ("what you sold") say it happened.'), opt('We can\'t tell', false, 'Ōmi\'s line settles it.'),
        ], { showEn: true }),
        E: choose(T('What did Wataru mean to do but not get to do?', 'ワタル が する つもり だった のに 、 して いない の は ？'), [
          opt('Pay it back / put it all back', true), opt('Sell the cargo', false, 'That part happened: Ōmi says {売|う}った.'), opt('Blame the storm', false, 'He says he thought of it ({思|おも}ってしまった), not that he meant to.'),
        ]),
        I: choose(T('つもりでした tells us…', '「 つもり でした 」 から {分|わ}かる の は ？'), [
          opt('a plan he had, which did not happen as intended', true), opt('a finished action', false, 'Finished actions are in the past form: {売|う}った.'), opt('a promise for the future', false, 'でした puts the intention in the past.'),
        ]),
        A: choose(T('In {売|う}って、{払|はら}うつもりでした, what does つもり cover, given Ōmi\'s line?', 'オウミ の {台詞|せりふ} を ふまえる と 、 「 {売|う}って 、 {払|はら}う つもり でした 」 の つもり は どこ まで ？'), [
          opt('The plan as a whole: the selling happened; the paying back did not', true), opt('Only {売|う}って: he never sold anything', false, 'Ōmi\'s {売|う}った contradicts that.'), opt('Neither: both happened', false, 'Ōmi makes him repay from his wages, so it was not paid back.'),
        ]),
      },
      explain: { en: '～つもりでした ("I meant to…") states a past intention without saying it was carried out; the past form ({売|う}った) states a fact. Read together, the two lines separate what Wataru did from what he only planned.' },
    },
    {
      id: 'C09', cat: 'bounded-open', catLabel: T('An offer with a limit, or without', '{限|かぎ}り の ある {申|もう}し{出|で} 、 ない {申|もう}し{出|で}'), word: T('{宿|やど} (yado), lodging', '{宿|やど}'),
      ref: { grammar: 'prt_dake_shika' }, item: 'g:prt_dake_shika',
      a: { scene: 'rw.tsuru_first', line: 10, who: 'tsuru', ctx: T('Keeper Tsuru, after seeing that your writing holds', 'あなた の {字|じ} が {残|のこ}る の を {見|み}た ツル'),
        jp: 'でも 、 あんた の {字|じ} は {残|のこ}った 。 {手|て} を {貸|か}して おくれ 。 {宿|やど} と {飯|めし} くらい は {出|だ}す よ 。', en: 'But your writing held. Lend me a hand. I can at least give you a bed and meals.', reading: 'でも、あんたのじはのこった。てをかしておくれ。やどとめしくらいはだすよ。', h: 'q303s4' },
      b: { scene: 'co.fusa_first', line: 2, who: 'co_fusa', ctx: T('Fusa, welcoming you to her inn', '{宿|やど} に {迎|むか}えて くれる フサ'),
        jp: '{休|やす}みたく なったら {声|こえ} を かけて 。 {布団|ふとん} は {干|ほ}した ばかり よ 。 {柿|かき} の {匂|にお}い が する かも しれない けど 。', en: 'Just ask when you want to rest. The futons were aired today. They might smell of persimmon.', reading: 'やすみたくなったらこえをかけて。ふとんはほしたばかりよ。かきのにおいがするかもしれないけど。', h: '1xt33ha' },
      q: {
        F: choose(T('Whose offer has a limit?', '{限|かぎ}り の ある {申|もう}し{出|で} は どちら ？'), [
          opt('Tsuru\'s: a bed and meals, that much', true), opt('Fusa\'s', false, 'Fusa says "whenever you want to rest".'), opt('Neither', false, 'Tsuru\'s くらい sets what she can give.'),
        ], { showEn: true }),
        E: choose(T('{休|やす}みたくなったら{声|こえ}をかけて — when can you ask?', 'いつ {声|こえ} を かけて いい ？'), [
          opt('Whenever you want to rest', true), opt('Only tonight', false, 'She gives no time: ～たら means "when(ever)".'), opt('After the festival', false, 'The festival isn\'t a condition here.'),
        ]),
        I: choose(T('What does くらい add to {宿|やど}と{飯|めし}くらいは{出|だ}す?', '「 {宿|やど} と {飯|めし} くらい は {出|だ}す 」 の くらい は ？'), [
          opt('"at least that much": a modest, limited offer', true), opt('"about": roughly a bed', false, 'It isn\'t an estimate of quantity here.'), opt('"only if": a condition', false, 'There is no condition; the help is asked separately.'),
        ]),
        A: choose(T('Which rewording keeps Tsuru\'s offer bounded?', 'ツル の {申|もう}し{出|で} の {限|かぎ}り を {保|たも}つ {言|い}い{換|か}え は ？'), [
          opt('I can give you a bed and meals', true, null, '{宿|やど} と {飯|めし} なら {出|だ}せる'), opt('I\'ll give you anything', false, 'That removes the limit.', '{何|なん} でも {出|だ}す'), opt('Come and stay any time', false, 'That makes it open-ended, like Fusa\'s.', 'いつ でも {泊|と}まり に {来|き}て いい'),
        ]),
      },
      explain: { en: '～くらいは ("at least…") offers a modest, bounded thing; ～たら{声|こえ}をかけて ("ask whenever…") leaves it open. Both are kind; one names its limit.' },
    },
    {
      id: 'C10', cat: 'before-after', catLabel: T('Before or after', '{前|まえ} か {後|あと} か'), word: T('{前|まえ} / {後|あと}', '{前|まえ} ・ {後|あと}'),
      ref: { grammar: 'mae_ato' }, item: 'g:mae_ato',
      a: { scene: 'sg.harbor_first', line: 4, who: 'daigo', ctx: T('Daigo, at the harbour when you arrive in Saltglass', '{潮硝子|しおがらす} に {着|つ}いた {時|とき} 、 {港|みなと} の ダイゴ'),
        jp: '{嵐|あらし} の {後|あと} から 、 ずっと こう だ 。 {荷札|にふだ} も {手紙|てがみ} も {道案内|みちあんない} も 、 みんな {言|い}う こと が {違|ちが}う 。', en: 'Ever since the storm it\'s been like this. Cargo tags, letters, directions — they all say something different.', reading: 'あらしのあとから、ずっとこうだ。にふだもてがみもみちあんないも、みんないうことがちがう。', h: '1c6yhf3' },
      b: { scene: 'rw.bridge_scene', line: 11, who: 'narr', ctx: T('At the teahouse door, after the bridge reaches the far bank', '{橋|はし} が {届|とど}いた {後|あと} 、 {茶屋|ちゃや} の {戸口|とぐち}'),
        jp: 'ふたり が {茶屋|ちゃや} に {入|はい}って いく 。 {戸|と} が {閉|し}まる {前|まえ} に 、 コウジ が {振|ふ}り{返|かえ}って {手|て} を {振|ふ}った 。', en: 'The two of them go into the teahouse. Before the door closes, Kōji turns and waves.', reading: 'ふたりがちゃやにはいっていく。とがしまるまえに、コウジがふりかえっててをふった。', h: '1wj9g1x' },
      q: {
        F: choose(T('Which line is about "before", and which about "after"?', '「 {前|まえ} 」 と 「 {後|あと} 」 は どちら の {台詞|せりふ} ？'), [
          opt('Kōji waves before the door closes · Daigo: since after the storm', true), opt('The other way round', false, 'Daigo says {嵐|あらし}の{後|あと} (after the storm); the narration says {閉|し}まる{前|まえ}に (before it closes).'), opt('Both are "before"', false, 'Daigo\'s is {後|あと}, after.'),
        ], { showEn: true }),
        E: choose(T('{嵐|あらし}の{後|あと}から、ずっとこうだ — since when?', 'いつ から ？'), [
          opt('Since the storm', true), opt('Before the storm', false, '{後|あと} is "after".'), opt('Only during the storm', false, 'ずっと: it has gone on ever since.'),
        ]),
        I: choose(T('{戸|と}が{閉|し}まる{前|まえ}に — when does Kōji wave?', 'コウジ は いつ {手|て} を {振|ふ}った ？'), [
          opt('While the door is still open', true), opt('After it has closed', false, 'Before it closes.'), opt('Before they go in', false, 'They are going in; the wave comes as the door is closing.'),
        ]),
        A: choose(T('What does {後|あと}から add in Daigo\'s line?', 'ダイゴ の 「 {後|あと} から 」 は {何|なに} を {表|あらわ}す ？'), [
          opt('A starting point after the storm, continuing until now', true), opt('"Later on", some unspecified time after', false, 'With ずっと, it marks where an ongoing state began.'), opt('A time before the storm', false, '{後|あと} is after.'),
        ]),
      },
      explain: { en: '～{前|まえ}に places an event before a moment (the door closing); ～の{後|あと}から marks a starting point after one (the storm), and ずっと carries it up to now.' },
    },
    {
      id: 'C11', cat: 'register', catLabel: T('Plain or polite', 'ふつう の {話|はな}し{方|かた} 、 ていねい な {話|はな}し{方|かた}'), word: T('{増|ふ}える (fueru), "to increase"', '{増|ふ}える'),
      ref: { grammar: 'register_polite_plain' }, item: 'g:register_polite_plain',
      a: { scene: 'rw.oto_post', line: 1, who: 'oto', ctx: T('Oto, at the boot shop after your journey', '{旅|たび} を {終|お}えた {後|あと} 、 {靴屋|くつや} の オト'),
        jp: '{西|にし} から {来|く}る {客|きゃく} が {増|ふ}えた よ 。 {道|みち} が {戻|もど}った から だ って 。 {靴|くつ} も {擦|す}り{減|へ}る わけ だ 。 {商売|しょうばい} {繁盛|はんじょう} 。', en: 'More customers coming in from the west. They say it\'s because the roads came back. No wonder soles are wearing thin. Business is booming.', reading: 'にしからくるきゃくがふえたよ。みちがもどったからだって。くつもすりへるわけだ。しょうばいはんじょう。', h: '18vpck4' },
      b: { scene: 'co.shino_post', line: 0, who: 'co_shino', ctx: T('Shino, at her post house after your journey', '{旅|たび} を {終|お}えた {後|あと} 、 {郵便所|ゆうびんじょ} の シノ'),
        jp: '{他|ほか} の {里|さと} から の {手紙|てがみ} が {増|ふ}えました 。 {道|みち} が {戻|もど}った から でしょう 。 {忙|いそが}しく なって 、 {嬉|うれ}しい です 。', en: 'We get more letters from other villages now. The roads are back, I suppose. Busier, and happier for it.', reading: 'ほかのさとからのてがみがふえました。みちがもどったからでしょう。いそがしくなって、うれしいです。', h: '1lnqqq9' },
      q: {
        F: choose(T('Which speaker uses polite です/ます?', 'です ・ ます で {話|はな}して いる の は {誰|だれ} ？'), [
          opt('Shino', true), opt('Oto', false, 'Oto uses plain forms: {増|ふ}えたよ, だって.'), opt('Both', false, 'Only Shino.'),
        ], { showEn: true }),
        E: choose(T('{増|ふ}えたよ (Oto) and {増|ふ}えました (Shino): the difference?', '「 {増|ふ}えた よ 」 と 「 {増|ふ}えました 」 の {違|ちが}い は ？'), [
          opt('The same meaning; plain and polite', true), opt('Different meanings', false, 'Both say the number went up.'), opt('Oto is asking a question', false, 'よ asserts; it doesn\'t ask.'),
        ]),
        I: choose(T('Oto: {戻|もど}ったからだって. Shino: {戻|もど}ったからでしょう. What do だって and でしょう add?', '「 だって 」 と 「 でしょう 」 は {何|なに} を {加|くわ}える ？'), [
          opt('Oto reports what people say; Shino offers her own guess', true), opt('Both are certain', false, 'Neither claims to know for sure.'), opt('Both are questions', false, 'でしょう here is a supposition, not a question.'),
        ]),
        A: write(T('Say Oto\'s first sentence politely, as Shino might.', 'オト の {最初|さいしょ} の {文|ぶん} を 、 シノ の よう に ていねい に {言|い}いましょう 。'), [
          ok(['{西|にし} から {来|く}る {客|きゃく} が', '{増|ふ}えました'], 'More customers come from the west now.'),
          ok(['{西|にし} から {来|く}る お{客|きゃく} さん が', '{増|ふ}えました'], 'More customers come from the west now.'),
          ok(['{西|にし} から {来|く}る {客|きゃく} が', '{増|ふ}えました よ'], 'More customers come from the west now.'),
          { ok: false, parts: ['{西|にし} から {来|く}る {客|きゃく} が', '{増|ふ}えた よ'], en: '(plain)', why: { en: 'That is Oto\'s plain form, unchanged.' } },
        ]),
      },
      explain: { en: 'Oto and Shino say almost the same thing about the roads coming back. Plain {増|ふ}えたよ and polite {増|ふ}えました carry the same fact; だって (hearsay) and でしょう (supposition) show how each knows it.' },
    },
    {
      id: 'C12', cat: 'ambiguity', catLabel: T('A deliberately ambiguous line', 'わざと {二通|ふたとお}り に {読|よ}める {言葉|ことば}'), word: T('{来|こ}なくて いい (konakute ii)', '{来|こ}なくて いい'),
      ref: { grammar: 'v_nakereba' }, item: 'g:v_nakereba',
      a: { scene: 'sg.genzo_grump', line: 4, who: 'genzo', ctx: T('Genzō, at the lighthouse, in a mood', '{灯台|とうだい} で {機嫌|きげん} の {悪|わる}い ゲンゾウ'),
        jp: '{機嫌|きげん} が {悪|わる}い の は 、 {娘|むすめ} の せい だ 。 {手紙|てがみ} を {寄越|よこ}した と {思|おも}ったら 、 「{迎|むか}え に {来|こ}なくて いい 」 だ と さ 。', en: 'If I\'m in a mood, blame my daughter. Finally sends a letter, and it says: "You don\'t have to come and meet me."', reading: 'きげんがわるいのは、むすめのせいだ。てがみをよこしたとおもったら、「むかえにこなくていい」だとさ。', h: '1hi8j6u' },
      b: { scene: 'sg.genzo_truth', line: 4, who: 'pc', ctx: T('You, reading him the rest of the letter', '{手紙|てがみ} の {続|つづ}き を {読|よ}む あなた'),
        jp: '「{来|こ}なくて いい 」 は 、 「{来|く}る な 」 では ありません 。 {膝|ひざ} が {悪|わる}い から 、 {坂|さか} を {下|お}りて {来|こ}なくて いい 、 と いう {意味|いみ} です 。', en: '"You don\'t have to come" isn\'t "don\'t come". It means: your knees are bad, so you needn\'t come down the hill.', reading: '「こなくていい」は、「くるな」ではありません。ひざがわるいから、さかをおりてこなくていい、といういみです。', h: '7f6dbr' },
      q: {
        F: choose(T('Genzō reads {来|こ}なくていい as "don\'t come". What did his daughter mean?', 'ゲンゾウ の {娘|むすめ} は {何|なに} を {言|い}いたかった ？'), [
          opt('You needn\'t come (because of your knees)', true), opt('Don\'t come', false, 'That is how Genzō read it — the letter\'s next lines say otherwise.'), opt('Come quickly', false, 'Nothing in it asks him to hurry.'),
        ], { showEn: true }),
        E: choose(T('{来|こ}なくていい literally says…', '「 {来|こ}なくて いい 」 は {文字|もじ} どおり には ？'), [
          opt('You don\'t have to come', true), opt('You must not come', false, 'That would be {来|き}てはいけない or {来|く}るな.'), opt('Please come', false, 'It is negative: {来|こ}なくて.'),
        ]),
        I: choose(T('Which phrase is the prohibition Genzō thought he heard?', 'ゲンゾウ が {聞|き}き{取|と}った と {思|おも}った {禁止|きんし} は ？'), [
          opt('don\'t come (prohibition)', true, null, '{来|く}る な'), opt('you needn\'t come', false, 'That only removes the need.', '{来|こ}なくて いい'), opt('you may come', false, 'That gives permission.', '{来|き}て も いい'),
        ]),
        A: choose(T('Why is the ambiguity real?', 'この {言葉|ことば} が {本当|ほんとう} に {二通|ふたとお}り に {読|よ}める の は なぜ ？'), [
          opt('～なくていい only removes the obligation; kindness or rejection depends on context — here, the knees settle it', true),
          opt('It is a grammatical error', false, 'It is perfectly grammatical; that is why it can mislead.'),
          opt('It always means "don\'t come"', false, 'Your reading shows it needn\'t.'),
        ]),
      },
      explain: { en: '～なくていい says only that something isn\'t necessary. Whether that is consideration ("spare your knees") or rejection ("stay away") comes from context — which is why Genzō, reading it alone, heard the wrong one.' },
    },

    // ---- a labelled sample pair: teaching examples, not lines from the story ------------------------------
    {
      id: 'S01', sample: true, cat: 'ambiguity', catLabel: T('Sample pair · teaching examples', '{例|れい} ・ {学習|がくしゅう} {用|よう} の {文|ぶん}'), word: T('いい です (ii desu)', 'いい です'),
      ref: { grammar: 'indirectness' }, item: 'g:indirectness',
      a: { teach: true, jp: '「 この {本|ほん} 、 {借|か}りて も いい です か 。 」 「 ええ 、 いい です よ 。 」', en: '"May I borrow this book?" "Yes, that\'s fine."', reading: '「このほん、かりてもいいですか。」「ええ、いいですよ。」' },
      b: { teach: true, jp: '「 お{茶|ちゃ} 、 もう {一杯|いっぱい} どう です か 。 」 「 いえ 、 もう いい です 。 」', en: '"Another cup of tea?" "No, I\'m fine, thanks."', reading: '「おちゃ、もういっぱいどうですか。」「いえ、もういいです。」' },
      q: {
        F: choose(T('In which exchange is いいです a "yes"?', '「 いい です 」 が 「 はい 」 の {意味|いみ} に なる の は どちら ？'), [
          opt('Borrowing the book', true), opt('The tea', false, 'いえ、もういいです declines another cup.'), opt('Both', false, 'The tea reply is a polite "no".'),
        ], { showEn: true }),
        E: choose(T('もういいです after an offer of tea means…', 'お{茶|ちゃ} を {勧|すす}められて 「 もう いい です 」 は ？'), [
          opt('No, thank you', true), opt('Yes, please', false, 'もう ("already, enough") makes it a refusal.'), opt('The tea is good', false, 'It answers the offer, not the taste.'),
        ]),
        I: choose(T('What tells the two いいです apart?', '{二|ふた}つ の 「 いい です 」 を {分|わ}ける の は ？'), [
          opt('The question before it, and ええ / いえ, もう', true), opt('The pitch of the voice only', false, 'Written down, the words around it are enough.'), opt('Nothing — they mean the same', false, 'One permits, one declines.'),
        ]),
        A: choose(T('Why can いいです decline politely?', '「 いい です 」 で ていねい に {断|ことわ}れる の は なぜ ？'), [
          opt('It says "I\'m fine as I am", so the refusal never needs a "no"', true), opt('It is rude', false, 'It is a common, polite refusal.'), opt('It is always negative', false, 'The book example is a yes.'),
        ]),
      },
      explain: { en: 'Teaching examples, not lines from the story. いいです means "it is fine": fine to borrow (a yes), or fine as things are (a polite no). The question and words like ええ, いえ and もう decide which.' },
    },
  ];
})(RB.content);
