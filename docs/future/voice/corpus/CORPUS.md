# VA-1 · VS01 · The frozen audition corpus

Built by `node tools/voice/corpus.mjs` from `tools/voice/corpus_selection.mjs` and the package's matrix; the full records are in `audition_corpus.json`. No audio has been generated. Text from later chapters is hidden here (its spoiler level is shown); fixtures are labelled.

**Accounting per provider configuration:** 83 directed cases + 14 neutral controls = 97 takes, 3244 characters of spoken Japanese (directed 2792, controls 452). Casting screen: 19 roles × 3 voices × 2 anchor lines = 114 takes, 3594 characters. Repairs: at most one per flawed directed cell (2792 characters if every cell needed one). Upper bound per configuration: **9630 characters**. Sources: 76 game lines, 7 noncanonical fixtures; spoiler levels {"none":58,"early":16,"later":5,"sealed":4}.

| Case | Speaker | Delivery | Source | Spoiler | Spoken text | Control |
|---|---|---|---|---|---|---|
| N01 | narrator_female | Warm welcome | `mb.arrive#0d3c70ae76` | early | 運河の上に、橋が次から次へと架かっている。八百の橋の町、八百橋だ。 | yes |
| N02 | narrator_female | Plain observation | `rw.mio_first#167cceb1a6` | none | 話しながら、ミオは瓶を一本ずつほんの少し回して、向きをそろえている。 |  |
| N03 | narrator_female | Wonder and discovery | `rw.road_lantern#e5c6b4bb38` | none | 指で触れると、紙の奥に古い字の形が、かすかに感じられた。 |  |
| N04 | narrator_female | Pastoral calm | `rw.village_first#176a1a2a8f` | none | 川の音。干された網。屋根を直す槌の音。 |  |
| N05 | narrator_female | Gentle humor | `rw.mr_enter#9ba348bae0` | none | 道の途中に、見覚えのある顔が四つ。ツルの言ったとおり、心配性の連中が先に来ていた。 |  |
| N06 | narrator_female | Inquiry and uncertainty | `rw.mr_narrows#70ac35955b` | none | 歌でも歌えば、違う響きになるだろうか。 |  |
| N07 | narrator_female | Suspense | `rw.mr_narrows#9e01db6a1c` | none | 崖の間に入ると、自分の足音が何重にも返ってきた。声が壁のように押してくる。 | yes |
| N08 | narrator_female | Sudden alarm | `co.bell_ring#f43542d3ae` | early | 梯子の上の人が飛び降り、誰かが桶を掴み、皆が一斉に水路へ走り出した。誰も何も言わずに。 |  |
| N09 | narrator_female | Determined momentum | `sb.fuki_notebook#f09fa6c171` | early | 決まりは頭に入った。広場の鐘の柱へ行こう。 |  |
| N10 | narrator_female | Solemn gravity | `co.upper_stone#726f6ff830` | early | 「火は来る。火は去る。石は黙って残る。」 |  |
| N11 | narrator_female | Sorrow and loss | `sa.shelf_grief3#254d32a017` | sealed | (sealed: hidden in the review list) | yes |
| N12 | narrator_female | Compassion and reassurance | `rw.mr_mio#ff28dafedc` | none | ミオはサエに茶碗を握らせ、目を見て話す。 |  |
| N13 | narrator_female | Private reflection | `rw.tea_cups#261858cdca` | none | 茶碗がふたつ。ひとつは縁が少し欠けている。長いあいだ同じ人が使ってきたのだろう。 |  |
| N14 | narrator_female | Celebration and relief | `cr.lw_turns#4bbd46f0a7` | later | (later: hidden in the review list) |  |
| N15 | narrator_female | Bittersweet closure | `rw.seeoff#83cc997a4b` | none | 朝。灯の道の入口まで、何人かが見送りに来てくれた。 |  |
| N16 | narrator_female | Precise explanation | `mb.exchange_first#bb98c9ce8c` | early | 長い運河の向こうに、大きな瓦屋根の建物が見える。札場だ。商人が札を掛けて、取引を決める所。 | yes |
| SUZU01 | suzu | Warm invitation | `sg.road_bench#a8104441f0` | none | ……少しだけ、座っていこうか。幕が上がる前の、深呼吸。 |  |
| SUZU02 | suzu | Comic flourish | `rw.suzu_first#9fa6f75f9e` | none | さあさあ、旅のお方！嵐の夜の不思議な話、聞いていかない？お代は笑顔ひとつ！ |  |
| SUZU03 | suzu | Concern | `sg.arrive#832c48e8c8` | none | ……変ね。市場の声が聞こえない。港は、もっとうるさいはずよ。 |  |
| SUZU04 | suzu | Sincere apology | `rw.hall_suzu#7ee78bfa29` | none | 昔、一つだけ、終わらせていない嘘があるの。灰実の方でね。 | yes |
| SUZU05 | suzu | Shared resolve | `sg.check_clues#e27367500d` | none | 帳簿を合わせるための嘘は、一つでは終わらないの。……会いに行きましょう。 |  |
| NAO01 | nao | Practical explanation | `rw.mr_nao#a5bc3a90e9` | none | 別の道もある。小屋の裏、背の高い葦の向こう。獣道が上まで続いてる。 |  |
| NAO02 | nao | Dry humor | `rw.b_nao1#439cf06928` | none | 葦ノ瀬の道は全部覚えた。三日でな。……嘘だ。二日。 |  |
| NAO03 | nao | Urgent warning | `rw.mr_nao2#4ae937dd39` | none | 上で何かあったら、走って逃げろ。逃げるのは負けじゃない。配達人の常識だ。 | yes |
| NAO04 | nao | Honest vulnerability | `sg.ch2_end#eb01825c6c` | none | 届けるべきじゃないと思った。今も、半分はそう思ってる。 |  |
| NAO05 | nao | Decisive encouragement | `rw.depart#8d9ba77c31` | none | よし。道は俺に任せろ。行き先は、あんたが決めろ。 |  |
| MIO01 | mio | Calm explanation | `rw.mr_mio#f309384cff` | none | 落ち着くお茶を煎じています。薬というより、温かいものを持っていると、人は少し楽になるので。 |  |
| MIO02 | mio | Light teasing | `rw.mr_mio2#c040763c1a` | none | サエさんは大丈夫。次はあなたの番ですよ。ちゃんと帰ってきてください。薬の在庫が心配なので。 |  |
| MIO03 | mio | Focused concern | `rw.mio_first#91376b0f89` | none | 嵐のあと、ラベルが全部白くなってしまって。似た色の薬が多いので、間違えると危ないんです。 |  |
| MIO04 | mio | Regret or apology | `sg.ch2_end#3ce3dd453e` | none | わたし、頼まれたら断れないでしょう。薬の代金も、「後でいいよ」って、何人にも言ってる。 |  |
| MIO05 | mio | Confident reassurance | `rw.mr_mio#843f4387a2` | none | 「気のせい」とは言いません。何かが起きているのは本当です。でも、それはあなたのせいじゃない。 | yes |
| REN01 | ren | Thoughtful observation | `sg.road_marker#aa19fdaf1f` | none | 古い形の道標です。石に彫った字は、紙よりずっと長く残ります。 |  |
| REN02 | ren | Quiet amusement | `rw.b_ren1#cff2bf7a69` | none | 灯りの持ち手、今朝も磨きました。靴は……明日磨きます。毎日そう言っていますが。 | yes |
| REN03 | ren | Measured warning | `sg.crate_glued#2cb3563fda` | none | 灯台の油を「廃棄」に？……灯守として、見過ごせません。灯りの油は命綱です。 |  |
| REN04 | ren | Vulnerable admission | `sg.ch2_end#d933dbeed3` | none | 師匠の教えは、一字一句覚えています。でも、顔が……思い出せないのです。今夜、初めてそれが怖くなりました。 |  |
| REN05 | ren | Protective certainty | `rw.hall_ren#ff041a4238` | none | 光栄です。一つ約束を。灯りが扉を越えたら、私は旅の終わりまであなたの隣にいます。道に迷うのも、隣で。 |  |
| PCA01 | pc | Curious question | `co.suzu_ask#b9287ba3cc` | early | 広場の空いた席、誰のための席ですか。 |  |
| PCA02 | pc | Lighthearted delight | `sg.b_mio_temper#061f7e139c` | none | ゲンゾウさん、ちょっと嬉しそうだったよ。 |  |
| PCA03 | pc | Firm resolve | `sg.da_boss#8f63375065` | none | その手紙は、港の人たちのものです。 | yes |
| PCA04 | pc | Vulnerable apology | `sb.quiet_nao#154af5001b` | early | 誰かの名前を忘れるのが怖い。静寂に持っていかれたら、忘れたことも忘れるかもしれない。 |  |
| PCA05 | pc | Warm reassurance | `co.kotaro#baec657ab3` | early | 悪くないよ。鐘は、鳴らすためにあるんだ。 |  |
| PCB01 | pc | Curious question | `co.suzu_ask#b9287ba3cc` | early | 広場の空いた席、誰のための席ですか。 |  |
| PCB02 | pc | Lighthearted delight | `sg.b_mio_temper#061f7e139c` | none | ゲンゾウさん、ちょっと嬉しそうだったよ。 |  |
| PCB03 | pc | Firm resolve | `sg.da_boss#8f63375065` | none | その手紙は、港の人たちのものです。 | yes |
| PCB04 | pc | Vulnerable apology | `sb.quiet_nao#154af5001b` | early | 誰かの名前を忘れるのが怖い。静寂に持っていかれたら、忘れたことも忘れるかもしれない。 |  |
| PCB05 | pc | Warm reassurance | `co.kotaro#baec657ab3` | early | 悪くないよ。鐘は、鳴らすためにあるんだ。 |  |
| NPC01_1 | chiyo | Curious discovery | `sb.kanta#1c4aa2f483` | early | やった！赤い実の灯り、ちゃんと残ってたでしょ！ |  |
| NPC01_2 | chiyo | Brief disappointment that resolves calmly | `sb.chiyo#09da9a5aa3` | early | 勝った！でも、ほんとはね、本物の灯りがつくほうが、うれしい。 |  |
| NPC02_1 | ko_ao | Earnest explanation | `ko.ao_lesson#e9fd5a5933` | later | (later: hidden in the review list) |  |
| NPC02_2 | ko_ao | Excited good news | `ko.ao_post#e7cb30989b` | later | (later: hidden in the review list) |  |
| NPC03_1 | persona_npc03 | Polite nervousness | **fixture** | none | あの、配達の見習いです。この手紙、こちらで合っていますか。 |  |
| NPC03_2 | persona_npc03 | Proud relief | **fixture** | none | 全部、時間どおりに届けました！……よかった。 |  |
| NPC04_1 | persona_npc04 | Routine practical explanation | **fixture** | none | 釘は、先に穴を開けてから打つんです。そうしないと、板が割れます。 |  |
| NPC04_2 | persona_npc04 | Embarrassed correction | **fixture** | none | あ、すみません。今のは間違いです。三寸じゃなくて、二寸でした。 |  |
| NPC05_1 | persona_npc05 | Welcoming sales greeting | **fixture** | none | いらっしゃいませ。今朝とれた野菜ですよ。どうぞ、見ていってください。 |  |
| NPC05_2 | persona_npc05 | Firm but courteous refusal | **fixture** | none | 申し訳ありませんが、値引きはできません。その代わり、一つおまけしますね。 | yes |
| NPC06_1 | sota | Brisk directions | `sg.sota_wait#5f1fe6c8e0` | none | 網は入り江の奥、崖の下の岩に掛けてあります。 |  |
| NPC06_2 | sota | Sincere gratitude | `sg.sota_nets#234d83e96e` | none | 網！ありがとう！これで明日から沖に……じゃなくて、岸から釣りができる！ |  |
| NPC07_1 | kiyo | Confident reassurance | `sg.kiyo_fish#c1fda865ce` | none | ソウタは岸で釣ってる。沖にはまだ出さないよ。灯台の灯が元に戻るまではね。 |  |
| NPC07_2 | kiyo | Controlled frustration | `sg.kiyo_idle#d3892b466d` | none | 安いよ、安いよ！……って言いたいんだけど、魚がないんだよね。網が入り江に置きっぱなしでさ。 |  |
| NPC08_1 | co_tokiwa | Formal instruction | `co.tokiwa#203f06ac0a` | early | 年代記は机の上です。頁を折らないように、お願いしますね。 | yes |
| NPC08_2 | co_tokiwa | Warm off-duty humor | `co.tokiwa_intro#67945c18c8` | early | 開村から百二十年、一年も欠けていません。字が汚い年はありますが。私の見習い時代など。 |  |
| NPC09_1 | tsuru | Reflective storytelling | `rw.tsuru_first#7e3890f78c` | none | わたしが書き直しても、すぐに滑り落ちる。年のせいだと言われればそれまでだけどね。 |  |
| NPC09_2 | tsuru | Spirited, clear encouragement | `rw.tsuru_first#b0aa1f82ca` | none | でも、あんたの字は残った。手を貸しておくれ。宿と飯くらいは出すよ。 | yes |
| NPC10_1 | tetsu | Steady technical explanation | `sg.tetsu_first#c232304626` | none | 渡し船は満ち潮で出る。四十年変わらん。今は、港長が船を止めてるがな。 |  |
| NPC10_2 | tetsu | Tender remembrance | `sg.tetsu_history#d859bccc01` | none | ……鐘が鳴ると、親父は必ず船を止めて、帽子を取った。理由は聞かなかった。 |  |
| NPC11_1 | hall_kohaku | Precise information | `hall.w10.kohaku#4a49b28f2c` | sealed | (sealed: hidden in the review list) |  |
| NPC11_2 | hall_kohaku | Wry amusement | **fixture** | none | 地図は正確です。道のほうが、ときどき勝手に曲がりますが。 |  |
| NPC12_1 | hall_ibuki | Easy welcome | `hall.w6.t6#32b35522e9` | sealed | (sealed: hidden in the review list) |  |
| NPC12_2 | hall_ibuki | Serious boundary-setting | `hall.w6.t9#b1e6b938b6` | sealed | (sealed: hidden in the review list) | yes |
| SUZU_K01 | suzu (Kansai) | Warm invitation | `sg.road_bench#a8104441f0@kansai` | none | ……ちょっとだけ、座っていこうか。幕が上がる前の、深呼吸や。 |  |
| SUZU_K02 | suzu (Kansai) | Comic flourish | `rw.suzu_first#9fa6f75f9e@kansai` | none | さあさあ、旅のお方！嵐の夜の不思議な話、聞いていかへん？お代は笑顔ひとつでええで！ |  |
| SUZU_K03 | suzu (Kansai) | Concern | `sg.arrive#832c48e8c8@kansai` | none | ……変やな。市場の声が聞こえへん。港は、もっとうるさいはずやで。 |  |
| SUZU_K04 | suzu (Kansai) | Sincere apology | `rw.hall_suzu#7ee78bfa29@kansai` | none | 昔、一つだけ、終わらせてへん嘘があるねん。灰実の方でな。 |  |
| SUZU_K05 | suzu (Kansai) | Shared resolve | `sg.check_clues#e27367500d@kansai` | none | 帳簿合わせるための嘘は、一つでは終わらへんねん。……会いに行こうか。 |  |
| J01 | narrator_female | Names and unusual readings | `rw.arrive#468a284f8e` | none | 葦ノ瀬の灯守、ツルさんへの紹介状を持って、東へ歩く。 |  |
| J02 | narrator_female | Numbers and counters | `lf.timetable#d0a10c0c09` | later | (later: hidden in the review list) |  |
| J03 | narrator_female | Negation and conditions | `sb.gallery_note#b914a611fa` | later | (later: hidden in the review list) |  |
| J04 | narrator_female | Controlled same-text test: confirmation | `rw.mr_reeds#b74f83f303` | none | 何か小さなものが、毎晩ここを通っているのだろう。 |  |
| J05 | narrator_female | Controlled same-text test: doubt | `rw.mr_reeds#b74f83f303` | none | 何か小さなものが、毎晩ここを通っているのだろう。 |  |
| J06 | narrator_female | Quotation and speaker boundary | `rw.mr_enter#4ce19ffc24` | none | 誰も「一緒に行こう」とは言わない。それぞれ、自分のやり方で手を貸そうとしている。 |  |
| J07 | narrator_female | Long sentence and clause grouping | `lq.letters_home#cffd841e0d` | early | 「コウジの渡し小屋の先に、名前のない灯りがある。ヤスは昔、その先の村に住んでいたそうだ。大きな柿の木のある村で、大水の後、村の者は舟で川を下った。潮硝子の船乗りにでも聞いてみておくれ。ツル」 |  |
| J08 | narrator_female | Mora and sound distinctions | `rw.apoth_table#b6f3f774aa` | none | 帳面が開いている。細かい字で、薬の分量と日付がびっしり書いてある。帳面の字は消えていない。 |  |

## NPC casting targets and what the game establishes

- **npc01**: Chiyo: a child (look.size child), a girl ("her win", Rokuta of Chiyo), the snow-sculpture contest at Snowbell.
- **npc02**: Ao: a child (look.size child; "the only big child", Nana three years younger), a boy ("Ao takes a leaf from his basket", narration), Kotonoha's leaf-picker.
- **npc03**: Audition persona, not a game character: the game has no adolescent girl whose age is established.
- **npc04**: Audition persona, not a game character: the game has no adolescent boy apprentice whose age is established.
- **npc05**: Audition persona, not a game character: no young woman stallholder's age is established in the game.
- **npc06**: Sōta: a fisher, Kiyo's son, "worried about his nets" (he/him); a young adult by family role (lives with his mother, who keeps him ashore), not by a stated age.
- **npc07**: Kiyo: the fishmonger, Sōta's mother (she/her); middle-aged by family role, not by a stated age; a market stall rather than the profile's inn or craft.
- **npc08**: Tokiwa: Cinder Orchard's recorder, keeper of the chronicle (a records clerk), he/him ("Tokiwa says he's calling everyone", Sayo); the chronicle's year in "a different hand" is his from his apprentice days twenty years before, so not young: middle age by role, not by a stated age.
- **npc09**: Tsuru: Reedwake's lantern keeper, "an old woman leaning on a cane" (narration; look.age old).
- **npc10**: Tetsu: the ferryman (look.age old), "this old man" (Nao).
- **npc11**: Kohaku: the Hall's last keeper's apprentice (they/them, documented in src/content/hall/01_region.js); an adult apprentice, age not stated.
- **npc12**: Ibuki: the young keeper of the toll gate (they/them, documented in src/content/hall/01_region.js); a keeper rather than the profile's artisan, host or traveller, the nearest documented nonbinary adult with these two deliveries.
