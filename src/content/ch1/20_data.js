/* Chapter 1 data: Reedwake cast, quests, items, notes, challenges,
 * activities and enemies. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // ---- cast ------------------------------------------------------------------
  ch('oto', { name: { en: 'Oto', jp: 'オト' }, voice: { pitch: 0.95 },
    look: { skin: 3, hair: 'wrap', hairColor: 1, wrapCol: '#6a4a3a', cloth: ['#8a6a4a', '#6a5038', '#c8a060'], shape: 'apron', acc: ['toolbelt'] },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#6a4a3a', collar: 'apron', bg: '#3a2e24' } });
  ch('bunta', { name: { en: 'Bunta', jp: 'ブンタ' }, voice: { pitch: 0.75 },
    look: { skin: 2, hair: 'shaved', hairColor: 0, cloth: ['#7a6a4a', '#5a4a34', '#c8a060'], shape: 'tunic', acc: ['beard', 'toolbelt'] },
    portrait: { eyes: 'round', style: 'shaved', beard: true, bg: '#34302a' } });
  ch('kiku', { name: { en: 'Kiku', jp: 'キク' }, voice: { pitch: 0.9 },
    look: { skin: 1, hair: 'bun', hairColor: 5, cloth: ['#7a4a6a', '#5a3450', '#e8c8a0'], shape: 'robe', acc: ['glasses'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', acc: ['glasses'], bg: '#34283a' } });
  ch('yasu', { name: { en: 'Old Yasu', jp: 'ヤス' }, voice: { pitch: 0.7 },
    look: { skin: 5, hair: 'shaved', hairColor: 6, cloth: ['#4a6a7a', '#3a5460', '#d8c8a0'], shape: 'tunic', acc: ['hat', 'beard', 'cane'], hatCol: '#b8a068', age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', beard: '#d8d4d0', acc: ['hat'], hatCol: '#b8a068', bg: '#243440' } });
  ch('mame', { name: { en: 'Mame', jp: 'マメ' }, voice: { pitch: 1.35 },
    look: { skin: 2, hair: 'twintails', hairColor: 2, cloth: ['#e0a040', '#c08030', '#6a8ab0'], shape: 'tunic', size: 'child', acc: [] },
    portrait: { eyes: 'round', style: 'twintails', blush: true, bg: '#3a3424' } });
  ch('sae', { name: { en: 'Sae', jp: 'サエ' }, voice: { pitch: 1.1 },
    look: { skin: 2, hair: 'ponytail', hairColor: 2, cloth: ['#d8d0c0', '#b8b0a0', '#8a6a4a'], shape: 'apron', acc: ['headband'], bandCol: '#8a6a4a' },
    portrait: { eyes: 'round', style: 'ponytail', collar: 'apron', acc: ['headband'], bandCol: '#8a6a4a', bg: '#343230' } });
  ch('tomo', { name: { en: 'Tomo', jp: 'トモ' }, voice: { pitch: 1.05 },
    look: { skin: 4, hair: 'long', hairColor: 0, cloth: ['#5a7a9a', '#46607a', '#e8d8b0'], shape: 'dress', acc: ['basket'] },
    portrait: { eyes: 'soft', style: 'long', bg: '#2a3440' } });
  ch('echo', { name: { en: 'The Mill Echo', jp: 'こだま' }, voice: { pitch: 1.2 },
    look: { custom: 'spirit', col: '#a8c8d8' },
    portrait: { skin: ['#c8dce8', '#a8bcc8'], hair: ['#8aa0b0', '#a8bcc8', '#e8f4fc'], cloth: ['#8aa0b0', '#6a8090', '#e8f4fc'], style: 'long', eyes: 'soft', acc: ['hood'], hoodCol: '#8aa0b0', bg: '#14202a' } });

  // ---- quests --------------------------------------------------------------------
  C.quests.rw_labels = { main: true, chapter: 1, title: { jp: '{嵐|あらし} の あと の ラベル', en: 'Labels After the Storm' },
    stages: [
      { jp: 'ツル に {頼|たの}まれた 。 {広場|ひろば} の {人|ひと} たち に {話|はなし} を {聞|き}こう 。', en: 'Keeper Tsuru asked for help. Ask around the square: Mio\'s shop, the river warehouse, the bridge, and the teahouse.' },
      { jp: '{白|しろ}く なった ラベル は まだ ある 。 {話|はなし} を {聞|き}いて いない {人|ひと} は ？', en: 'More blank labels to untangle. Who haven\'t you helped yet? (Mio, Nao at the warehouse, Ren at the bridge, Suzu in the square, Hana\'s teahouse.)' },
      { jp: 'みんな の {話|はなし} を ツル に {伝|つた}えよう 。', en: 'Tell Keeper Tsuru what everyone found. She is in the square.' },
    ] };
  C.quests.rw_mill = { main: true, chapter: 1, title: { jp: '{呼|よ}び{返|かえ}す {水車|すいしゃ}{小屋|ごや}', en: 'The Mill That Calls Back' },
    stages: [
      { jp: '{北|きた} の {道|みち} を {通|とお}って 、 {水車|すいしゃ}{小屋|ごや} へ {行|い}こう 。', en: 'Take the north path along the river to the old mill.' },
      { jp: '{水車|すいしゃ}{小屋|ごや} の {中|なか} へ 。 {止|と}まった {歯車|はぐるま} を {調|しら}べよう 。', en: 'Go inside the mill. The jammed gears are the place to start.' },
      { jp: '{屋根裏|やねうら} で {聞|き}こえる {声|こえ} を {聞|き}こう 。', en: 'Climb to the loft and listen to the voices up there.' },
      { jp: '{石臼|いしうす} の ところ で 、 こだま と {向|む}き{合|あ}おう 。', en: 'Face the echo at the millstone on the ground floor.' },
      { jp: '{橋|はし} が {届|とど}いた か {見|み}に {行|い}こう 。', en: 'Go and see whether the bridge reaches the far bank now.' },
    ] };
  C.quests.rw_depart = { main: true, chapter: 1, title: { jp: 'ふたり の {名前|なまえ}', en: 'Two Names' },
    stages: [
      { jp: '{灯|あか}り{堂|どう} に {行|い}こう 。 {誰|だれ} と {旅|たび} を する か 、 {決|き}める {時|とき} だ 。', en: 'Go to the Lantern Hall. It\'s time to decide who will travel with you.' },
      { jp: '{西|にし} の {灯|ひ} の {道|みち} へ 。 {潮硝子|しおがらす} を {目指|めざ}そう 。', en: 'Take the lantern road west, toward Saltglass.' },
    ] };
  C.quests.rw_tools = { chapter: 1, title: { jp: '{借|か}りた {道具|どうぐ}', en: 'Borrowed Tools' },
    stages: [
      { jp: 'ブンタ は キク が かんな を {返|かえ}さない と {言|い}う 。 キク の {話|はなし} も {聞|き}こう 。', en: 'Bunta says Kiku never returned his plane. Hear Kiku\'s side too (her house is south of the square).' },
      { jp: '{二人|ふたり} の {貸|か}し{借|か}り の {記録|きろく} が ある らしい 。 {工房|こうぼう} の {作業台|さぎょうだい} を {見|み}よう 。', en: 'There may be a record of who borrowed what. Look at the workbench in Bunta\'s workshop.' },
      { jp: '{記録|きろく} の こと を {二人|ふたり} に {話|はな}そう 。', en: 'Tell both of them what the record says.' },
    ] };
  C.quests.rw_boots = { chapter: 1, title: { jp: 'オト の {看板|かんばん}', en: 'Oto\'s Sign' },
    stages: [
      { jp: 'オト の {店|みせ} の {看板|かんばん} が {白|しろ}く なった 。 {店|みせ} の {中|なか} の {木箱|きばこ} を {見|み}て みよう 。', en: 'The sign over Oto\'s shop went blank. Look through the crate of old stock inside.' },
      { jp: '{看板|かんばん} の {字|じ} を オト に {伝|つた}えよう 。', en: 'Tell Oto what the sign should say.' },
    ] };
  C.quests.rw_crossroads = { chapter: 1, title: { jp: '{辻|つじ} の {道標|みちしるべ}', en: 'The Crossroads Signpost' },
    stages: [
      { jp: '{村|むら} の {西|にし} の {道標|みちしるべ} が {白|しろ}い 。 {調|しら}べて {直|なお}そう 。', en: 'The signpost at the village\'s west edge is blank. Examine it and restore its arms.' },
    ] };
  C.quests.rw_founding = { chapter: 1, title: { jp: 'ヤス の {昔話|むかしばなし}', en: 'Old Yasu\'s Story' },
    stages: [
      { jp: 'ヤス は {村|むら} の {始|はじ}まり を {覚|おぼ}えて いる らしい 。 {桟橋|さんばし} で {聞|き}こう 。', en: 'Old Yasu remembers how Reedwake began. Hear it on the pier.' },
    ] };
  C.quests.rw_teahouse = { chapter: 1, title: { jp: '{朝|あさ} の {茶屋|ちゃや}', en: 'The Morning Rush' },
    stages: [
      { jp: 'ハナ の {茶屋|ちゃや} が {忙|いそが}しい 。 {注文|ちゅうもん} を {手伝|てつだ}おう 。', en: 'Hana\'s teahouse is busy. Help take the orders.' },
    ] };

  // ---- items ------------------------------------------------------------------------
  const it = (id, d) => (C.items[id] = d);
  it('rw_letter', { name: { jp: '{紹介状|しょうかいじょう}', en: 'Letter of introduction' }, desc: 'Addressed to Keeper Tsuru of Reedwake, in a hand you trust.', key: true });
  it('rw_record', { name: { jp: '{灯|あか}り の {記録|きろく}', en: 'Ren\'s lantern records' }, desc: 'Copied names and distances for Reedwake\'s lanterns. Precise, and a little water-stained.', key: true });
  it('rw_plane', { name: { jp: 'かんな', en: 'Bunta\'s plane' }, desc: 'A woodworker\'s plane with a nick in the blade. It was under his own bench all along.', key: true });
  it('rw_shuttle', { name: { jp: '{杼|ひ}', en: 'Kiku\'s shuttle' }, desc: 'A loom shuttle, worn smooth.', key: true });
  it('rw_wheel_pin', { name: { jp: '{歯車|はぐるま} の {軸|じく}', en: 'Gear pin' }, desc: 'An iron pin from the mill\'s gear train.', key: true });
  it('rw_reed_charm', { name: { jp: '{葦|あし} の {守|まも}り', en: 'Reed charm' }, desc: 'Braided by Mame. In battle you begin behind a small ward.', slot: 'charm', effect: { startWard: 1 } });
  it('rw_boots_good', { name: { jp: '{丈夫|じょうぶ}な {長靴|ながぐつ}', en: 'Sturdy boots' }, desc: 'Oto\'s work. They never slip, and they make your stride a touch quicker on long roads.', slot: 'tool', effect: { walk: 1 } });
  it('rw_ribbon', { name: { jp: '{色褪|いろあ}せた リボン', en: 'Faded ribbon' }, desc: 'A keepsake to wear, tied in your hair. It changes nothing but how you look.', slot: 'cosmetic', acc: 'ribbon', wear: { ribbonCol: '#b98088' } });
  it('rw_mill_charm', { name: { jp: '{石臼|いしうす} の {守|まも}り', en: 'Millstone charm' }, desc: 'The miller\'s round stone charm. In battle, you start with one point of harmony.', slot: 'charm', effect: { harmonyStart: 1 } });
  it('rw_tea_leaves', { name: { jp: 'お{茶|ちゃ} の {葉|は}', en: 'Tea leaves' }, desc: 'A twist of Hana\'s morning tea.' });
  it('rw_salve', { name: { jp: 'ミオ の {軟膏|なんこう}', en: 'Mio\'s salve' }, desc: 'Labelled, dated and initialled. Of course.' });

  // ---- notebook lore -------------------------------------------------------------------
  C.notes.rw_roads = { title: { jp: '{灯|ひ} の {道|みち}', en: 'The lantern roads' }, fiction: true,
    en: 'In this world, each lantern shade carries the name of the place ahead and a keeper\'s promise that the road leads there. While the names are kept, the roads hold together. (Fiction: this is the story\'s magic, not Japanese custom.)' };
  C.notes.rw_himori = { title: { jp: '{灯守|ひもり}', en: 'Lantern keepers (himori)' }, fiction: true,
    en: '灯守 (ひもり) is this story\'s title for the people who tend the lanterns and rewrite their names. It is a coined word made from 灯 (light, lamp) and 守 (keeping, guarding) — fictional, not a real job title.' };
  C.notes.rw_hush = { title: { jp: '{静寂|しじま}', en: 'The Hush (shijima)' }, fiction: true,
    jp: '{静寂|しじま} は 「{静|しず}けさ」 と いう {意味|いみ} の {古|ふる}い {言葉|ことば} 。',
    en: 'しじま is a real, somewhat literary word for stillness or silence. In this story, keepers use it for the quiet force that lifts names from things. That use is fiction.' };
  C.notes.rw_founding = { title: { jp: '{葦|あし}ノ{瀬|せ} の はじまり', en: 'How Reedwake began' },
    en: 'Old Yasu\'s account: once there were only reeds and a shallow ford. A ferryman started carrying people across; keepers raised the first lantern and wrote the name Ashinose on it; after a great flood the village built a bridge — and kept the ferry anyway, "because a bridge can\'t wave back".' };
  C.notes.rw_mill = { title: { jp: '{水車|すいしゃ}{小屋|ごや} の こだま', en: 'The mill\'s echo' }, fiction: true,
    en: 'Names lifted by the Hush don\'t vanish at once. At the old mill they gathered like water behind a jammed wheel, and the voices that went with them kept repeating — the "calling back".' };

  // ---- challenges ------------------------------------------------------------------------
  const X = C.challenges;
  X['rw.c_road_lantern'] = { title: { jp: '{道|みち} の {灯|あか}り', en: 'The roadside lantern' },
    tiers: {
      F: [{ kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'The lantern\'s shade is blank. The road leads to the village of Ashinose (Reedwake). Write its name on the shade.' }, answer: 'あしのせ', accept: ['あしのせ'], mode: 'kana', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose — "the shallows of the reeds". The village is called Reedwake in English.' } }],
      E: [
        { kind: 'write', item: 'g:prt_he', ctx: { jp: 'あしのせ ＿ いく みち', en: 'The road that goes (to) Ashinose' }, prompt: { en: 'The old writing has lost one small word. Which particle marks the direction "to"?' }, template: { before: 'あしのせ', after: 'いく みち' }, answer: 'へ', accept: ['へ', 'に'], mode: 'kana', choices: ['へ', 'を', 'で'], explain: { en: 'へ (pronounced e) marks direction; に also works here ("to Ashinose"). を would make Ashinose the thing you pass along, which doesn\'t fit.' } },
        { kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Now write the village name itself on the shade (Ashinose).' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'reading', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose (Reedwake).' } },
      ],
      I: [
        { kind: 'choose', item: 'c:rw_lantern1', ctx: { jp: '{灯|ひ} の {消|き}えた {道|みち} は 、 {行|ゆ}き{先|さき} を {忘|わす}れる 。', en: 'A road whose lantern has gone out forgets where it leads.' }, prompt: { en: 'An older line is carved into the post. What does it say happens?' },
          options: [{ en: 'The road forgets where it leads.', ok: true }, { en: 'Travellers forget their names.', ok: false, why: { en: '忘れる here has 道 (the road) as its subject, and 行き先 (destination) as what is forgotten.' } }, { en: 'The lantern will light itself again.', ok: false, why: { en: 'Nothing here says it relights; 消えた is "went out".' } }],
          explain: { en: '行き先 (ゆきさき/いきさき) means "destination". 灯の消えた道 = "a road whose light has gone out" — here の marks the subject inside a noun-modifying clause.' } },
        { kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Restore the destination on the shade: the village of Ashinose (kana or kanji).' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'reading', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:rw_lantern1a', ctx: { jp: '{名|な} を {失|うしな}いし {道|みち} 、 {往|ゆ}く{先|さき} を {知|し}らず 。', en: '' }, prompt: { en: 'The oldest line on the post is in a literary style. Which modern sentence says the same thing?' },
          options: [{ jp: '{名前|なまえ} を なくした {道|みち} は 、 どこ へ {行|い}く の か わからない 。', ok: true }, { jp: '{名前|なまえ} の ない {道|みち} を {行|い}って は いけない 。', ok: false, why: { en: 'There is no prohibition in the original; 知らず is simply "does not know".' } }, { jp: '{道|みち} の {名前|なまえ} を {知|し}らない {人|ひと} は {先|さき} へ {進|すす}めない 。', ok: false, why: { en: 'The subject that "does not know" is the road itself, not a traveller.' } }],
          explain: { en: 'Literary 〜し is a past form (≈ 〜た) used before a noun: 失いし道 = 失った道. 〜ず is the literary negative (≈ 〜ない). 往く is an old way of writing 行く.' } },
        { kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Write the destination\'s name on the shade (kana or kanji).' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'reading', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose.' } },
      ],
    } };

  X['rw.c_bottles'] = { title: { jp: 'ミオ の {薬瓶|くすりびん}', en: 'Mio\'s bottles' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:傷', prompt: { en: 'Mio: "This salve is for cuts." Write the label: kizu (wound).' }, answer: 'きず', accept: ['きず', '傷'], mode: 'kana', explain: { jp: 'きず', en: 'きず (kizu) — a wound or cut.' } },
        { kind: 'write', item: 'v:痒み', prompt: { en: 'Mio: "And this one is for itching." Write the label: kayumi (itch).' }, answer: 'かゆみ', accept: ['かゆみ', '痒み'], mode: 'kana', explain: { jp: 'かゆみ', en: 'かゆみ (kayumi) — itchiness.' } },
      ],
      E: [
        { kind: 'choose', item: 'c:rw_bottle1', ctx: { jp: 'あかい びん ： ねつ が ある とき に のむ 。', en: '' }, prompt: { en: 'Mio\'s notebook. What is the red bottle for?' },
          options: [{ en: 'For when you have a fever — you drink it.', ok: true }, { en: 'For cuts — you spread it on.', ok: false, why: { en: 'ねつ is fever, and のむ is "drink".' } }, { en: 'For coughs at night.', ok: false, why: { en: 'Nothing about coughing (せき) or night (よる).' } }],
          explain: { en: 'ねつ が ある とき = "when (you) have a fever". とき means "when/at the time".' } },
        { kind: 'write', item: 'g:prt_ni', ctx: { jp: 'みどり の びん ： きず ＿ ぬる 。', en: 'Green bottle: spread (it) on a cut.' }, prompt: { en: 'One particle has been lifted from the note. Which one marks where you spread the salve?' }, template: { before: 'きず', after: 'ぬる 。' }, answer: 'に', accept: ['に'], mode: 'kana', choices: ['に', 'を', 'で'], explain: { en: 'に marks the place something is put onto. きずをぬる would mean you are painting the cut itself as the object — not what Mio means.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:rw_bottle2', ctx: { jp: '{熱|ねつ} が {下|さ}がらない {場合|ばあい} は 、 {一日|いちにち} {三回|さんかい} まで {飲|の}んで よい 。 ただし 、 {空腹|くうふく} の とき は {避|さ}ける こと 。', en: '' }, prompt: { en: 'Which label matches Mio\'s instructions?' },
          options: [{ en: 'If the fever won\'t come down: up to three times a day. Not on an empty stomach.', ok: true }, { en: 'Three times a day, always on an empty stomach.', ok: false, why: { en: '空腹のときは避けること means avoid taking it on an empty stomach.' } }, { en: 'Once a day until the fever goes up.', ok: false, why: { en: '下がらない = does not go down; 三回まで = up to three times.' } }],
          explain: { en: '〜場合は = "in cases where…"; 〜てよい = "may…"; ただし = "however / provided that".' } },
        { kind: 'choose', item: 'c:rw_koto', prompt: { en: 'In 「空腹のときは避けること」, what is こと doing at the end?' },
          options: [{ en: 'It makes a written instruction: "avoid it (when…)."', ok: true }, { en: 'It turns the sentence into a question.', ok: false, why: { en: 'Questions use か; こと at the end of a written rule is an instruction.' } }, { en: 'It means "the thing I avoided".', ok: false, why: { en: 'That would be a past relative clause, 避けたこと.' } }],
          explain: { en: 'Dictionary form + こと at the end of rules, notices and instructions means "(you are) to do…".' } },
      ],
      A: [
        { kind: 'choose', item: 'c:rw_bottle3', ctx: { jp: '{効|き}き{目|め} が ない わけ で は ない が 、 {子|こ}ども に は {勧|すす}めかねる 。', en: '' }, prompt: { en: 'A note from Mio\'s old teacher, tucked behind the blue bottle. What is it saying?' },
          options: [{ en: 'It does work, but I can\'t recommend it for children.', ok: true }, { en: 'It doesn\'t work at all, especially on children.', ok: false, why: { en: '〜わけではない denies a conclusion: "it\'s not that it has no effect".' } }, { en: 'It works well and is ideal for children.', ok: false, why: { en: '〜かねる is a polite "cannot (bring myself to)".' } }],
          explain: { en: '〜わけではない softens by denying the obvious inference; 〜かねる is a formal way to say one is unable or unwilling.' } },
        { kind: 'choose', item: 'c:rw_bottle4', prompt: { en: 'Mio wants a customer-facing warning for the same bottle. Which wording suits a label handed to strangers?' },
          options: [{ jp: '{小|ちい}さな お{子|こ}さま に は ご{使用|しよう} を お{控|ひか}え ください 。', ok: true }, { jp: '{子|こ}ども に {使|つか}う な 。', ok: false, why: { en: 'A bare prohibitive (〜な) is blunt, even rude, on a shop label.' } }, { jp: '{子|こ}ども に は たぶん だめ かも 。', ok: false, why: { en: 'Casual and vague; a warning label should be clear and polite.' } }],
          explain: { en: 'お子さま, ご使用, お控えください: honorific and humble forms that are standard on public notices.' } },
      ],
    } };

  X['rw.c_lantern_s'] = { title: { jp: '{南|みなみ} の {灯|あか}り', en: 'The south lantern' },
    tiers: {
      F: [{ kind: 'write', item: 'v:潮硝子', prompt: { en: 'Ren reads from the records: "The south lantern points to Shiogarasu — Saltglass, the harbour town." Write its name on the shade.' }, answer: 'しおがらす', accept: ['しおがらす'], mode: 'kana', explain: { jp: '{潮硝子|しおがらす}', en: 'Shiogarasu (Saltglass).' } }],
      E: [
        { kind: 'choose', item: 'c:rw_rec1', ctx: { jp: '{南|みなみ} の {灯|あか}り ： しおがらす まで {二日|ふつか}', en: '' }, prompt: { en: 'Ren\'s record for the south lantern. How far is Saltglass?' },
          options: [{ en: 'Two days', ok: true }, { en: 'Two hours', ok: false, why: { en: 'Hours would be 二時間 (にじかん).' } }, { en: 'Ten days', ok: false, why: { en: 'Ten days is 十日 (とおか).' } }],
          explain: { en: '二日 is read ふつか — "two days" (also "the 2nd of the month"). まで = "as far as, until".' } },
        { kind: 'write', item: 'v:潮硝子', prompt: { en: 'Write the destination\'s name on the shade (Shiogarasu).' }, answer: 'しおがらす', accept: ['しおがらす', '潮硝子'], mode: 'reading', explain: { jp: '{潮硝子|しおがらす}', en: 'Saltglass.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:rw_rec2', ctx: { jp: '{嵐|あらし} の {前|まえ} は 「 しおがらす まで {二日|ふつか} 」 と {書|か}いて あった はず だ が 、 {記録|きろく} に よって は {三日|みっか} と ある 。 {橋|はし} が {流|なが}された {年|とし} の もの だ 。', en: '' }, prompt: { en: 'Ren frowns at two records. Why do some say three days?' },
          options: [{ en: 'They were written the year the bridge was washed away, when the way was longer.', ok: true }, { en: 'Ren copied them wrongly before the storm.', ok: false, why: { en: 'はずだ expresses Ren\'s expectation about the old writing, not a mistake.' } }, { en: 'Saltglass moved further away after the storm.', ok: false, why: { en: 'The records point to the bridge (橋が流された年), not to the town moving.' } }],
          explain: { en: '〜によっては = "depending on (which)…"; 〜はずだ = "should have been, as far as I know".' } },
        { kind: 'write', item: 'v:潮硝子', prompt: { en: 'Write the destination\'s name on the shade (kana or kanji).' }, answer: 'しおがらす', accept: ['しおがらす', '潮硝子'], mode: 'reading', explain: { jp: '{潮硝子|しおがらす}', en: 'Saltglass.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:rw_rec3', ctx: { jp: '{道|みち} の {名|な} は 、 {書|か}き{手|て} が それ を {信|しん}じて いなければ 、 {根|ね} を {張|は}らない 。', en: '' }, prompt: { en: 'A line in Ren\'s teacher\'s handwriting. What does it suggest about why Ren\'s names keep sliding off?' },
          options: [{ en: 'The writer must believe the promise the name makes — and Ren is not sure anymore.', ok: true }, { en: 'Names only take hold if the ink is fresh.', ok: false, why: { en: 'Nothing about ink; the condition is 信じていなければ — "unless (the writer) believes it".' } }, { en: 'Only the original writer can rewrite a name.', ok: false, why: { en: '書き手 means whoever writes, not the first writer.' } }],
          explain: { en: '根を張る (to put down roots) is used figuratively here: the name "takes hold". 〜なければ〜ない is a double negative: "won\'t… unless…".' } },
        { kind: 'write', item: 'v:潮硝子', prompt: { en: 'Write the destination\'s name on the shade (kana or kanji).' }, answer: 'しおがらす', accept: ['しおがらす', '潮硝子'], mode: 'reading', explain: { jp: '{潮硝子|しおがらす}', en: 'Saltglass.' } },
      ],
    } };

  X['rw.c_lantern_b'] = { title: { jp: '{橋|はし} の {灯|あか}り', en: 'The bridge lantern' },
    tiers: {
      F: [{ kind: 'write', item: 'v:向こう', prompt: { en: 'The bridge lantern should name the far bank: mukou (the far side). Write it.' }, answer: 'むこう', accept: ['むこう', '向こう'], mode: 'kana', explain: { jp: 'むこう', en: 'むこう — "over there, the other side".' } }],
      E: [
        { kind: 'write', item: 'v:向こう岸', prompt: { en: 'Write the name on the bridge lantern: mukougishi (the far bank).' }, answer: 'むこうぎし', accept: ['むこうぎし', '向こう岸'], mode: 'reading', explain: { jp: '{向|む}こう{岸|ぎし}', en: 'The far bank. 岸 (きし) becomes ぎし in the compound.' } },
        { kind: 'choose', item: 'c:rw_rec4', ctx: { jp: '{橋|はし} の {灯|あか}り ： むこうぎし と 、 わたしもり の なまえ', en: '' }, prompt: { en: 'The record says the bridge lantern held two things. What was the second?' },
          options: [{ en: 'The ferryman\'s name', ok: true }, { en: 'The name of the bridge', ok: false, why: { en: 'わたしもり is a ferry keeper (ferryman).' } }, { en: 'Tomorrow\'s weather', ok: false, why: { en: 'なまえ is "name".' } }],
          explain: { en: '渡し守 (わたしもり) is an old word for a ferryman.' } },
      ],
      I: [
        { kind: 'write', item: 'v:向こう岸', prompt: { en: 'Write the name on the bridge lantern: the far bank (kana or kanji).' }, answer: 'むこうぎし', accept: ['むこうぎし', '向こう岸'], mode: 'reading', explain: { jp: '{向|む}こう{岸|ぎし}', en: 'The far bank.' } },
        { kind: 'choose', item: 'c:rw_rec5', ctx: { jp: '{向|む}こう{岸|ぎし} の {灯|あか}り に は 、 {渡|わた}し{守|もり} の {名|な} も {添|そ}えて ある 。 {片方|かたほう} だけ で は 、 {橋|はし} は {届|とど}かない 。', en: '' }, prompt: { en: 'Why won\'t the bridge reach even with the far bank\'s name restored?' },
          options: [{ en: 'The lantern also needs the ferryman\'s name; one name alone isn\'t enough.', ok: true }, { en: 'The bridge was never finished.', ok: false, why: { en: 'The record says the bridge reaches when both names are there.' } }, { en: 'Only a ferryman may light it.', ok: false, why: { en: '添えてある = "is added alongside"; it is about the name, not who lights it.' } }],
          explain: { en: '〜も添えてある = "is also written alongside"; 片方だけでは = "with only one of them".' } },
      ],
      A: [
        { kind: 'write', item: 'v:向こう岸', prompt: { en: 'Write the name on the bridge lantern: the far bank (kana or kanji).' }, answer: 'むこうぎし', accept: ['むこうぎし', '向こう岸'], mode: 'reading', explain: { jp: '{向|む}こう{岸|ぎし}', en: 'The far bank.' } },
        { kind: 'choose', item: 'c:rw_rec6', ctx: { jp: '{渡|わた}し{守|もり} の {名|な} を {欠|か}いた まま で は 、 {橋|はし} と いえど も {向|む}こう{岸|ぎし} に {届|とど}く べく も ない 。', en: '' }, prompt: { en: 'A formal note under the lantern\'s frame. What is its point?' },
          options: [{ en: 'Without the ferryman\'s name, even a bridge cannot possibly reach the far bank.', ok: true }, { en: 'A bridge should never be named after a ferryman.', ok: false, why: { en: '欠いたままでは = "while (it) lacks…"; nothing forbids anything.' } }, { en: 'The ferryman is supposed to repair the bridge.', ok: false, why: { en: 'べくもない means "there is no way that…", not a duty.' } }],
          explain: { en: '〜といえども = "even though it is…"; 〜べくもない = "there is no possibility of…" (formal).' } },
      ],
    } };

  X['rw.c_mill_gears'] = { title: { jp: '{止|と}まった {歯車|はぐるま}', en: 'The jammed gears' },
    tiers: {
      F: [{ kind: 'order', item: 'c:rw_gears_f', prompt: { en: 'The gear plates are numbered in kana. Set them in counting order: ichi, ni, san, yon.' }, tiles: ['いち=(one)', 'に=(two)', 'さん=(three)', 'よん=(four)'], answer: ['いち=(one)', 'に=(two)', 'さん=(three)', 'よん=(four)'], orderHint: { en: 'いち (1), に (2), さん (3), よん (4).' } }],
      E: [{ kind: 'order', item: 'c:rw_gears_e', ctx: { jp: 'まず 、 つぎ に 、 それから 、 さいご に', en: '' }, prompt: { en: 'Each plate starts with a sequence word. Put them in order.' }, tiles: ['まず', 'つぎ に', 'それから', 'さいご に'], answer: ['まず', 'つぎ に', 'それから', 'さいご に'], orderHint: { en: 'まず "first", つぎに "next", それから "after that", さいごに "finally".' } }],
      I: [{ kind: 'order', item: 'g:v_te_kara', ctx: { jp: '「 {軸|じく} を {入|い}れて から 、 {歯車|はぐるま} を {回|まわ}す 。 {回|まわ}す {前|まえ} に 、 {水門|すいもん} を {少|すこ}し {開|あ}けて おく 。 {石臼|いしうす} は {最後|さいご} に {下|お}ろす 。 」', en: '' }, prompt: { en: 'Sae\'s father\'s instructions. Put the steps in the order you must do them.' },
        tiles: ['{水門|すいもん} を {少|すこ}し {開|あ}ける', '{軸|じく} を {入|い}れる', '{歯車|はぐるま} を {回|まわ}す', '{石臼|いしうす} を {下|お}ろす'],
        answer: ['{水門|すいもん} を {少|すこ}し {開|あ}ける', '{軸|じく} を {入|い}れる', '{歯車|はぐるま} を {回|まわ}す', '{石臼|いしうす} を {下|お}ろす'],
        alts: [['{軸|じく} を {入|い}れる', '{水門|すいもん} を {少|すこ}し {開|あ}ける', '{歯車|はぐるま} を {回|まわ}す', '{石臼|いしうす} を {下|お}ろす']],
        orderHint: { en: '〜てから = after…; 〜前に = before…; 〜ておく = do in advance; 最後に = last.' } }],
      A: [{ kind: 'choose', item: 'c:rw_gears_a', ctx: { jp: '「 {水門|すいもん} を {開|あ}けず に {歯車|はぐるま} を {回|まわ}そう もの なら 、 {石臼|いしうす} が {空回|からまわ}り して {焼|や}け{付|つ}き かねない 。 {軸|じく} を {入|い}れ{替|か}える の は 、 {水|みず} が {落|お}ち{着|つ}いて から に {限|かぎ}る 。 」', en: '' }, prompt: { en: 'The miller\'s log. Which plan follows it safely?' },
        options: [{ en: 'Open the sluice first; once the water settles, replace the pin; then turn the gears.', ok: true }, { en: 'Turn the gears first to test them, then open the sluice.', ok: false, why: { en: '〜ずに〜ようものなら warns of what happens if you turn them without opening the sluice.' } }, { en: 'Replace the pin while the water is rushing, to save time.', ok: false, why: { en: '〜に限る = "it\'s best (only) to…" — after the water has settled.' } }],
        explain: { en: '〜ようものなら = "if you were to (do something rash)…"; 〜かねない = "could well (happen)"; 〜に限る = "nothing beats…, it\'s best to…".' } }],
    } };

  X['rw.c_mill_lantern'] = { title: { jp: '{水車|すいしゃ}{小屋|ごや} の {灯|あか}り', en: 'The mill lantern' },
    tiers: {
      F: [{ kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Relight the mill lantern with the village\'s name: Ashinose.' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'kana', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose.' } }],
      E: [{ kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Relight the mill lantern with the village\'s name (Ashinose).' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'reading', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose.' } }],
      I: [{ kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Relight the mill lantern with the village\'s name (kana or kanji).' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'reading', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose.' } }],
      A: [{ kind: 'write', item: 'v:葦ノ瀬', prompt: { en: 'Relight the mill lantern with the village\'s name (kana or kanji).' }, answer: 'あしのせ', accept: ['あしのせ', '葦ノ瀬'], mode: 'reading', explain: { jp: '{葦|あし}ノ{瀬|せ}', en: 'Ashinose.' } }],
    } };

  X['rw.c_boots_sign'] = { title: { jp: 'オト の {看板|かんばん}', en: 'Oto\'s sign' },
    tiers: {
      F: [{ kind: 'write', item: 'v:靴', prompt: { en: 'The sign should say what Oto mends: kutsu (shoes).' }, answer: 'くつ', accept: ['くつ', '靴'], mode: 'kana', explain: { jp: 'くつ', en: 'くつ — shoes.' } }],
      E: [{ kind: 'write', item: 'v:靴屋', prompt: { en: 'A shoe shop is a kutsuya. Write the sign (kana or kanji).' }, answer: 'くつや', accept: ['くつや', '靴屋'], mode: 'reading', explain: { jp: '{靴屋|くつや}', en: '〜屋 (や) makes a shop or trade: 本屋 bookshop, 花屋 florist.' } }],
      I: [{ kind: 'choose', item: 'c:rw_sign_i', ctx: { jp: '「 {修理|しゅうり} {承|うけたまわ}ります 」', en: '' }, prompt: { en: 'Oto found the old sign\'s second line. What does it tell customers?' },
        options: [{ en: 'Repairs taken on (we accept repair work).', ok: true }, { en: 'Closed for repairs.', ok: false, why: { en: 'That would be 修理中 or 休業.' } }, { en: 'Repairs cost extra.', ok: false, why: { en: '承ります is a humble "we accept / will undertake".' } }],
        explain: { en: '承る (うけたまわる) is humble: "to receive, accept (an order)". It\'s common on shop signs.' } }],
      A: [{ kind: 'choose', item: 'c:rw_sign_a', ctx: { jp: '「 {靴|くつ} の {修理|しゅうり} 、 {何|なん}なり と お{申|もう}し{付|つ}け ください 」', en: '' }, prompt: { en: 'Oto wonders if this old wording still suits her shop. What tone does it strike?' },
        options: [{ en: 'Very courteous: "Whatever shoe repairs you need, please do ask."', ok: true }, { en: 'A demand that customers explain their complaints.', ok: false, why: { en: 'お申し付けください politely invites orders or requests.' } }, { en: 'Casual and joking.', ok: false, why: { en: '何なりと and お〜ください are formal.' } }],
        explain: { en: '何なりと = "anything at all"; 申し付ける = "to instruct/order (someone below you)" — with お〜ください the shop humbly invites your requests.' } }],
    } };

  X['rw.c_tools'] = { title: { jp: '{貸|か}し{借|か}り の {記録|きろく}', en: 'The tally of loans' },
    tiers: {
      F: [{ kind: 'choose', item: 'c:rw_tally_f', ctx: { jp: 'かんな ： キク が かえした 。 ひ ： ブンタ が かりた まま 。', en: 'Plane: Kiku returned it. Shuttle: Bunta still has it (borrowed).' }, prompt: { en: 'The tally carved under the bench. What does it show?' },
        options: [{ en: 'Kiku gave the plane back; Bunta still has Kiku\'s shuttle.', ok: true }, { en: 'Kiku still has the plane.', ok: false, why: { en: 'かえした means "returned".' } }, { en: 'Bunta returned the shuttle.', ok: false, why: { en: 'かりた まま means "still borrowed".' } }],
        explain: { en: 'かえす = to return (something); かりる = to borrow; 〜たまま = still in that state.' } }],
      E: [{ kind: 'choose', item: 'v:貸す', ctx: { jp: '{三月|さんがつ} ： ブンタ が キク に かんな を かした 。 {四月|しがつ} ： キク が かんな を かえした 。 {四月|しがつ} ： ブンタ が キク に ひ を かりた 。', en: '' }, prompt: { en: 'Read the tally (かす = lend, かりる = borrow, かえす = return). Where are the tools now?' },
        options: [{ en: 'The plane is back with Bunta; Bunta also has Kiku\'s shuttle.', ok: true }, { en: 'Kiku has both tools.', ok: false, why: { en: 'キクがかんなをかえした: Kiku returned the plane.' } }, { en: 'Bunta lent the shuttle to Kiku.', ok: false, why: { en: 'ブンタがキクにひをかりた: Bunta borrowed the shuttle FROM Kiku.' } }],
        explain: { en: 'AがBにXをかす: A lends X to B. AがBにXをかりる: A borrows X from B.' } }],
      I: [{ kind: 'choose', item: 'g:te_giving', ctx: { jp: '{四月|しがつ} 、 キク に {杼|ひ} を {貸|か}して もらった 。 かんな は {返|かえ}して もらった はず だ が 、 どこ に {置|お}いた か {覚|おぼ}えて いない 。 ── ブンタ', en: '' }, prompt: { en: 'Bunta\'s own note, in his handwriting. What does it reveal?' },
        options: [{ en: 'He borrowed Kiku\'s shuttle, and the plane probably did come back — he just can\'t remember where he put it.', ok: true }, { en: 'Kiku borrowed the shuttle from Bunta.', ok: false, why: { en: '貸してもらった: Bunta received the favour of Kiku lending it.' } }, { en: 'Bunta is sure Kiku never returned the plane.', ok: false, why: { en: '返してもらったはずだ = "it should have been returned to me".' } }],
        explain: { en: '〜てもらう = have someone do something for you; 〜はずだ = "should be (as far as I know)".' } }],
      A: [{ kind: 'choose', item: 'c:rw_tally_a', ctx: { jp: 'かんな は {確|たし}か に {返|かえ}した 。 もっとも 、 {杼|ひ} を {貸|か}した まま {催促|さいそく} も して いない の だ から 、 {人|ひと} の こと を とやかく {言|い}える {立場|たちば} で も ない のだ が 。 ── キク', en: '' }, prompt: { en: 'Kiku\'s note in the margin. What is she implying with her second sentence?' },
        options: [{ en: 'She never asked for her own shuttle back either, so she can\'t really criticise him.', ok: true }, { en: 'She is too important to argue with a carpenter.', ok: false, why: { en: 'とやかく言える立場でもない is self-deprecating: "I\'m hardly in a position to criticise".' } }, { en: 'She never lent anything to Bunta.', ok: false, why: { en: '杼を貸したまま = "the shuttle is still out on loan (from her)".' } }],
        explain: { en: 'もっとも = "mind you"; 催促する = press for, chase up; 〜立場ではない = not in a position to.' } }],
    } };

  X['rw.c_mr_lantern'] = { title: { jp: '{水車|すいしゃ}{小屋|ごや} へ の {灯|あか}り', en: 'The mill road lantern' },
    tiers: {
      F: [{ kind: 'write', item: 'v:水車小屋', prompt: { en: 'Ren reads: "This lantern names the water mill — suishagoya." Write it on the shade.' }, answer: 'すいしゃごや', accept: ['すいしゃごや', '水車小屋'], mode: 'kana', explain: { jp: '{水車|すいしゃ}{小屋|ごや}', en: 'A water mill (literally "waterwheel hut"). 小屋 (こや) becomes ごや in the compound.' } }],
      E: [
        { kind: 'choose', item: 'v:水車小屋', ctx: { jp: 'この {灯|あか}り の {名前|なまえ} は 、 {三十年|さんじゅうねん} {変|か}わって いない 。', en: '' }, prompt: { en: 'What does Ren\'s record say about this lantern\'s name?' },
          options: [{ en: 'It hasn\'t changed in thirty years.', ok: true }, { en: 'It changes every thirty days.', ok: false, why: { en: '年 is years; 日 would be days.' } }, { en: 'It was changed thirty years ago.', ok: false, why: { en: '変わっていない = has not changed.' } }] },
        { kind: 'write', item: 'v:水車小屋', prompt: { en: 'Write the lantern\'s name: the water mill (suishagoya).' }, answer: 'すいしゃごや', accept: ['すいしゃごや', '水車小屋'], mode: 'reading', explain: { jp: '{水車|すいしゃ}{小屋|ごや}', en: 'Water mill.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:rw_mr_i', ctx: { jp: '{迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 。', en: '' }, prompt: { en: 'Ren\'s teacher\'s advice. Which paraphrase keeps its meaning?' },
          options: [{ jp: 'わから なく なったら 、 {最初|さいしょ} の {名前|なまえ} を {使|つか}いなさい 。', ok: true }, { jp: '{古|ふる}い {名前|なまえ} は {捨|す}てて 、 {新|あたら}しく {付|つ}けなさい 。', ok: false, why: { en: 'The advice is to go back TO the oldest name, not discard it.' } }, { jp: '{道|みち} に {迷|まよ}う の は 、 {名前|なまえ} が {古|ふる}い から だ 。', ok: false, why: { en: 'It gives an instruction (戻れ), not a cause.' } }],
          explain: { en: '戻れ is the plain imperative of 戻る — a teacher\'s blunt instruction.' } },
        { kind: 'write', item: 'v:水車小屋', prompt: { en: 'Write the lantern\'s name (kana or kanji).' }, answer: 'すいしゃごや', accept: ['すいしゃごや', '水車小屋'], mode: 'reading', explain: { jp: '{水車|すいしゃ}{小屋|ごや}', en: 'Water mill.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:rw_mr_a', ctx: { jp: '{名|な} は {呼|よ}ばれて こそ {名|な} で ある 。 {誰|だれ} に も {呼|よ}ばれなく なった {名|な} は 、 {灯|あか}り に {書|か}いて も {長|なが}く は {持|も}たない 。', en: '' }, prompt: { en: 'A note tied to the lantern post. What does it imply about why names are fading?' },
          options: [{ en: 'A name lives by being used; one nobody calls anymore won\'t hold, even if written.', ok: true }, { en: 'Names must be shouted to be written.', ok: false, why: { en: '〜てこそ = "only when… (is it truly…)", not a rule about shouting.' } }, { en: 'Lantern names last longer than spoken ones.', ok: false, why: { en: 'It says written names do NOT last long if no one calls them.' } }],
          explain: { en: '〜てこそ emphasises a necessary condition: "a name is a name precisely because it is called".' } },
        { kind: 'write', item: 'v:水車小屋', prompt: { en: 'Write the lantern\'s name (kana or kanji).' }, answer: 'すいしゃごや', accept: ['すいしゃごや', '水車小屋'], mode: 'reading', explain: { jp: '{水車|すいしゃ}{小屋|ごや}', en: 'Water mill.' } },
      ],
    } };

  // ---- activities ------------------------------------------------------------------------
  const A = C.activities;
  A['rw.a_letters'] = { type: 'letters', title: { jp: 'ぬれた {手紙|てがみ}', en: 'Soaked letters' },
    recipients: [
      { id: 'oto', name: { en: 'Oto', jp: 'オト' }, desc: { F: { jp: 'くつ を なおす ひと', en: 'mends shoes' }, E: { jp: '{靴|くつ} を {直|なお}す {人|ひと}', en: 'mends shoes' } } },
      { id: 'kiku', name: { en: 'Kiku', jp: 'キク' }, desc: { F: { jp: 'ぬの を おる ひと', en: 'weaves cloth' }, E: { jp: '{布|ぬの} を {織|お}る {人|ひと}', en: 'weaves cloth' } } },
      { id: 'hana', name: { en: 'Hana', jp: 'ハナ' }, desc: { F: { jp: 'おちゃ の みせ の ひと', en: 'runs the teahouse' }, E: { jp: '{茶屋|ちゃや} の {人|ひと}', en: 'runs the teahouse' } } },
      { id: 'yasu', name: { en: 'Old Yasu', jp: 'ヤス' }, desc: { F: { jp: 'さかな を とる ひと', en: 'catches fish' }, E: { jp: '{漁師|りょうし}', en: 'a fisherman' } } },
      { id: 'bunta', name: { en: 'Bunta', jp: 'ブンタ' }, desc: { F: { jp: 'いす や つくえ を つくる ひと', en: 'makes chairs and tables' }, E: { jp: '{大工|だいく}', en: 'a carpenter' } } },
    ],
    letters: [
      { to: 'oto', items: ['v:靴'], text: { F: { jp: 'くつ の しゅうり 、 おねがい します 。', en: 'Please repair my shoes.' }, E: { jp: '{先週|せんしゅう} {預|あず}けた ブーツ を 、 {雨|あめ} が {降|ふ}る {前|まえ} に {取|と}り に {行|い}きます 。', en: 'I\'ll come for the boots I left last week before it rains.' }, I: { jp: 'かかと が {減|へ}って きた ので 、 {張|は}り{替|か}えて いただけません か 。 {急|いそ}ぎ で は ありません 。', en: 'The heels are wearing down; could you replace them? No hurry.' }, A: { jp: '{先日|せんじつ} は {無理|むり} を {聞|き}いて いただき 、 {恐縮|きょうしゅく} です 。 おかげ で {雨|あめ} の {日|ひ} も {足元|あしもと} が {心強|こころづよ}い かぎり です 。', en: 'I\'m grateful you took on my difficult request the other day. Thanks to you, my footing feels sure even on rainy days.' } },
        hint: { en: 'Who would care about boots, heels or footing?' }, why: { en: 'Everything in it is about footwear — Oto\'s trade.' } },
      { to: 'kiku', items: ['v:糸'], text: { F: { jp: 'あかい いと を みっつ ください 。', en: 'Three red threads, please.' }, E: { jp: '{赤|あか}い {布|ぬの} を {来週|らいしゅう} まで に {織|お}って もらえます か 。', en: 'Could you weave some red cloth for me by next week?' }, I: { jp: '{祭|まつ}り に {間|ま}に{合|あ}う よう 、 {帯|おび} を {一本|いっぽん} お{願|ねが}い したい の です が 。', en: 'I\'d like to ask for a sash, in time for the festival.' }, A: { jp: '{色|いろ} は お{任|まか}せ します 。 あの {藍|あい} の {深|ふか}さ は 、 あなた に しか {出|だ}せない と {母|はは} も {申|もう}して おりました 。', en: 'I leave the colour to you. My mother always said no one but you could bring out that depth of indigo.' } },
        hint: { en: 'Thread, cloth, weaving, dye — who works with those?' }, why: { en: 'Weaving and dye — that\'s Kiku.' } },
      { to: 'hana', items: ['v:お茶'], text: { F: { jp: 'おちゃ の はっぱ を とどけます 。', en: 'I\'ll deliver the tea leaves.' }, E: { jp: '{新|あたら}しい お{茶|ちゃ} の {葉|は} が {入|はい}りました 。 {明日|あした} {届|とど}けます 。', en: 'The new tea leaves are in. I\'ll deliver them tomorrow.' }, I: { jp: 'いつも の {量|りょう} で は {足|た}りない と おっしゃって いた ので 、 {今回|こんかい} は {倍|ばい} に して おきました 。', en: 'You said the usual amount wasn\'t enough, so I\'ve doubled it this time.' }, A: { jp: '{毎朝|まいあさ} {二杯|にはい} ずつ と {伺|うかが}って おります ので 、 {少|すこ}し {多|おお}め に お{分|わ}け しました 。 どなた の {分|ぶん} か は 、 {野暮|やぼ} な ので {聞|き}きません 。', en: 'I hear it\'s two cups every morning, so I\'ve given you a little extra. Whose second cup it is, I won\'t be so crude as to ask.' } },
        hint: { en: 'Tea, cups in the morning… who serves tea here?' }, why: { en: 'Tea leaves — for Hana\'s teahouse. (Two cups every morning…)' } },
      { to: 'yasu', items: ['v:網'], text: { F: { jp: 'あたらしい あみ が できました 。', en: 'Your new net is ready.' }, E: { jp: '{破|やぶ}れた {網|あみ} は {直|なお}しました 。 {桟橋|さんばし} に {置|お}いて あります 。', en: 'I\'ve mended the torn net. It\'s on the pier.' }, I: { jp: '{川|かわ} の {水|みず} が {引|ひ}いたら 、 また {舟|ふね} を {出|だ}せる でしょう 。 {網|あみ} は それ まで {預|あず}かって おきます 。', en: 'Once the river goes down, you\'ll be able to take the boat out again. I\'ll keep the net until then.' }, A: { jp: '{引|ひ}き{潮|しお} を {待|ま}つ {間|あいだ} に 、 {昔|むかし} の {渡|わた}し の {話|はなし} でも {聞|き}かせて ください 。 {網|あみ} の {繕|つくろ}い は その {駄賃|だちん} と いう こと で 。', en: 'While we wait for the water to drop, tell me about the old ferry. Mending the net can be my fee for the story.' } },
        hint: { en: 'Nets, boats, the river — who fishes?' }, why: { en: 'A net and a boat — Old Yasu the fisherman.' } },
      { to: 'bunta', items: ['v:椅子'], text: { F: { jp: 'いす の あし が おれました 。', en: 'A chair leg broke.' }, E: { jp: '{嵐|あらし} で {棚|たな} が {倒|たお}れました 。 {直|なお}して もらえます か 。', en: 'A shelf fell over in the storm. Could you fix it?' }, I: { jp: '{戸|と} が {閉|し}まらなく なった の は 、 たぶん {湿気|しっけ} の せい です 。 {削|けず}って いただけます か 。', en: 'The door won\'t close anymore — probably the damp. Could you plane it down?' }, A: { jp: '{扉|とびら} の {建|た}て{付|つ}け が {悪|わる}く 、 {閉|し}める たび に {軋|きし}む {始末|しまつ} です 。 お{手|て}すき の {折|おり} に でも 。', en: 'The door hangs badly and creaks every time I shut it. Whenever you have a spare moment.' } },
        hint: { en: 'Chairs, shelves, doors — who works wood?' }, why: { en: 'Carpentry — Bunta.' } },
    ] };

  A['rw.a_signpost'] = { type: 'signpost', title: { jp: '{辻|つじ} の {道標|みちしるべ}', en: 'The crossroads signpost' },
    places: [
      { id: 'mill', jp: '{水車|すいしゃ}{小屋|ごや}', r: 'すいしゃごや', en: 'the water mill', item: 'v:水車小屋' },
      { id: 'village', jp: '{村|むら}', r: 'むら', en: 'the village', item: 'v:村' },
      { id: 'river', jp: '{川|かわ}', r: 'かわ', en: 'the river', item: 'v:川' },
    ],
    arms: [
      { dir: 'east', to: 'village', clue: { F: { jp: 'ひがし に は いえ が たくさん ある 。', en: 'To the east there are many houses.' }, E: { jp: '{東|ひがし} へ {行|い}く と 、 {家|いえ} が {並|なら}んで いる 。', en: 'Go east and houses line the way.' }, I: { jp: '{東|ひがし} の {道|みち} は 、 {井戸|いど} の ある {広場|ひろば} に {出|で}る 。', en: 'The east road comes out at the square with the well.' }, A: { jp: '{東|ひがし} へ {折|お}れれば 、 {人家|じんか} の {灯|ひ} が {軒|のき} を {連|つら}ねる 。', en: 'Turn east and the lights of houses stand eave to eave.' } }, why: 'houses mean the village' },
      { dir: 'north', to: 'mill', clue: { F: { jp: 'きた に いく と 、 みず で まわる いえ が ある 。', en: 'Go north and there is a house that turns with water.' }, E: { jp: '{北|きた} の {道|みち} を {行|い}く と 、 {水|みず} の {力|ちから} で {粉|こな} を ひく ところ が ある 。', en: 'Along the north road is a place that grinds flour with water power.' }, I: { jp: '{川|かわ} に {沿|そ}って {北|きた} へ {上|のぼ}る と 、 {大|おお}きな {輪|わ} が {回|まわ}って いた {建物|たてもの} に {着|つ}く 。', en: 'Follow the river north and you reach a building where a great wheel used to turn.' }, A: { jp: '{北|きた} は 、 {今|いま} は {止|と}まった ままの {輪|わ} が 、 かつて {村|むら} の {糧|かて} を {挽|ひ}いて いた {場所|ばしょ} へ {通|つう}じる 。', en: 'North leads to the place where a wheel, now standing still, once ground the village\'s bread.' } }, why: 'a wheel turned by water — the mill' },
      { dir: 'south', to: 'river', clue: { F: { jp: 'みなみ に は みず が ながれて いる 。', en: 'To the south, water is flowing.' }, E: { jp: '{南|みなみ} へ {下|お}りる と 、 {舟|ふね} が つないで ある 。', en: 'Go down south and boats are tied up.' }, I: { jp: '{南|みなみ} の {坂|さか} を {下|くだ}れば 、 {渡|わた}し{場|ば} の {跡|あと} が ある 。', en: 'Down the south slope are the remains of the old ferry landing.' }, A: { jp: '{南|みなみ} に {下|くだ}れば 、 {葦|あし} の {茂|しげ}る {瀬|せ} が {村|むら} の {名|な} の {由来|ゆらい} を {物語|ものがた}る 。', en: 'Head south and the reed-choked shallows tell you where the village got its name.' } }, why: 'water, boats and the ferry landing — the river' },
    ] };

  A['rw.a_history'] = { type: 'history', title: { jp: '{葦|あし}ノ{瀬|せ} の はじまり', en: 'How Reedwake began' }, teller: 'yasu', note: 'rw_founding', item: 'c:rw_founding',
    fragments: [
      { F: { jp: 'むかし 、 ここ に は あし しか なかった 。', en: 'Long ago, there was nothing here but reeds.', short: 'あし しか なかった' }, E: { jp: '{昔|むかし} 、 ここ に は {葦|あし} と {浅|あさ}い {瀬|せ} しか なかった 。', en: 'Long ago there was nothing here but reeds and shallow water.', short: '{葦|あし} と {瀬|せ} だけ' }, I: { jp: '{昔|むかし} は な 、 {葦|あし} と {浅瀬|あさせ} ばかり で 、 {人|ひと} なんて {住|す}んで いなかった 。', en: 'Back then, see, it was all reeds and shallows — nobody lived here at all.', short: '{葦|あし} と {浅瀬|あさせ} ばかり' }, A: { jp: '{遡|さかのぼ}れば 、 この {辺|あた}り は {葦|あし} の {生|お}い{茂|しげ}る {浅瀬|あさせ} に {過|す}ぎず 、 {人|ひと} の {気配|けはい} など {皆無|かいむ} だった そう な 。', en: 'Go back far enough, they say, and this was nothing but reed-grown shallows, without a trace of people.', short: '{人|ひと} の {気配|けはい} は {皆無|かいむ}' } },
      { F: { jp: 'わたしもり が ひと を むこう へ はこんだ 。', en: 'A ferryman carried people to the other side.', short: 'わたしもり が はこんだ' }, E: { jp: 'ある {日|ひ} 、 {渡|わた}し{守|もり} が {人|ひと} を {舟|ふね} で {運|はこ}び はじめた 。', en: 'One day a ferryman began carrying people across by boat.', short: '{渡|わた}し{守|もり} が {来|き}た' }, I: { jp: 'そこ へ {渡|わた}し{守|もり} が {来|き}て 、 {客|きゃく} を {向|む}こう{岸|ぎし} へ {運|はこ}ぶ よう に なった 。', en: 'Then a ferryman came, and started taking passengers to the far bank.', short: '{渡|わた}し{守|もり} が {客|きゃく} を {運|はこ}ぶ' }, A: { jp: 'やがて {一人|ひとり} の {渡|わた}し{守|もり} が {棹|さお} を {差|さ}し 、 {往来|おうらい} が {生|う}まれた 。', en: 'In time a lone ferryman set his pole to the water, and traffic across was born.', short: '{往来|おうらい} が {生|う}まれた' } },
      { F: { jp: 'ひもり が 「 あしのせ 」 と かいた 。', en: 'Lantern keepers wrote "Ashinose".', short: '「 あしのせ 」 と かいた' }, E: { jp: '{灯守|ひもり} が {最初|さいしょ} の {灯|あか}り に 「 {葦|あし}ノ{瀬|せ} 」 と {書|か}いた 。', en: 'Keepers wrote "Ashinose" on the first lantern.', short: '{最初|さいしょ} の {灯|あか}り' }, I: { jp: '{人|ひと} が {集|あつ}まる と 、 {灯守|ひもり} が {灯|あか}り を {立|た}てて 、 「 {葦|あし}ノ{瀬|せ} 」 と {名|な} を {入|い}れた 。', en: 'When people gathered, the keepers put up a lantern and gave it the name "Ashinose".', short: '{灯|あか}り に {名|な} を {入|い}れた' }, A: { jp: '{人|ひと} が {寄|よ}り{集|つど}う に つれ 、 {灯守|ひもり} が {灯|あか}り を {掲|かか}げ 、 「 {葦|あし}ノ{瀬|せ} 」 の {名|な} を {記|しる}した 。', en: 'As people gathered, keepers raised a lantern and inscribed the name "Ashinose".', short: '「 {葦|あし}ノ{瀬|せ} 」 と {記|しる}した' } },
      { F: { jp: 'おおみず の あと 、 はし を つくった 。', en: 'After the great flood, they built a bridge.', short: 'はし を つくった' }, E: { jp: '{大水|おおみず} の あと で 、 {橋|はし} を {作|つく}った 。 でも 、 {舟|ふね} も やめなかった 。', en: 'After the great flood they built a bridge. But they kept the boat too.', short: '{橋|はし} を {作|つく}った' }, I: { jp: '{大水|おおみず} で {流|なが}された あと 、 {橋|はし} を {架|か}けた が 、 {渡|わた}し も {残|のこ}した 。 {橋|はし} は {手|て} を {振|ふ}って くれん から な 。', en: 'After the flood washed everything away, they put up a bridge — and kept the ferry too. A bridge can\'t wave back, you see.', short: '{橋|はし} を {架|か}けた' }, A: { jp: '{大水|おおみず} の {後|のち} 、 {橋|はし} を {架|か}けて なお {渡|わた}し を {廃|はい}さなかった の は 、 {橋|はし} が {手|て} を {振|ふ}り{返|かえ}して は くれぬ から だ と いう 。', en: 'After the flood they built a bridge and still didn\'t abolish the ferry — because, it\'s said, a bridge will never wave back to you.', short: '{渡|わた}し を {廃|はい}さなかった' } },
    ],
    question: {
      F: { kind: 'choose', item: 'c:rw_founding_q', prompt: { en: 'Why did Reedwake keep the ferry after building the bridge?' }, options: [{ en: 'Because a bridge can\'t wave back.', ok: true }, { en: 'Because the bridge was too narrow.', ok: false }, { en: 'Because the ferryman was the mayor.', ok: false }] },
      E: { kind: 'choose', item: 'c:rw_founding_q', prompt: { en: 'What is the last thing that happened in Yasu\'s story?' }, options: [{ en: 'They built a bridge but kept the boat.', ok: true }, { en: 'The ferryman left.', ok: false }, { en: 'The keepers wrote the name.', ok: false, why: { en: 'That happened before the flood.' } }] },
      I: { kind: 'choose', item: 'c:rw_founding_q', prompt: { en: 'What does Yasu mean by 「橋は手を振ってくれんからな」?' }, options: [{ en: 'A ferryman is a person you can greet; a bridge is just a way across.', ok: true }, { en: 'The bridge was too dangerous to cross.', ok: false }, { en: 'People wave to each other from the bridge.', ok: false }], explain: { en: 'くれん is a casual, older-sounding negative of くれる (= くれない).' } },
      A: { kind: 'choose', item: 'c:rw_founding_q', prompt: { en: 'What does the story suggest the village valued in keeping the ferry?' }, options: [{ en: 'The human connection a crossing can carry, not just the crossing itself.', ok: true }, { en: 'Tradition for its own sake, even when useless.', ok: false }, { en: 'Distrust of engineering after the flood.', ok: false }], explain: { en: '廃さなかった = did not abolish; 〜くれぬ is literary (= くれない).' } },
    } };

  A['rw.a_orders'] = { type: 'orders', title: { jp: '{朝|あさ} の {茶屋|ちゃや}', en: 'The morning rush' },
    menu: [
      { id: 'tea', jp: 'お{茶|ちゃ}', en: 'tea' }, { id: 'rice', jp: 'おにぎり', en: 'rice ball' }, { id: 'fish', jp: '{焼|や}き{魚|ざかな}', en: 'grilled fish' },
      { id: 'soup', jp: 'みそ{汁|しる}', en: 'miso soup' }, { id: 'dango', jp: 'だんご', en: 'dumplings (dango)' },
    ],
    customers: [
      { who: 'yasu', want: { tea: 2 }, items: ['v:お茶'], line: { F: { jp: 'おちゃ を ふたつ 。', en: 'Two teas.' }, E: { jp: 'お{茶|ちゃ} を {二|ふた}つ ください 。', en: 'Two teas, please.' }, I: { jp: 'わし と {孫|まご} の {分|ぶん} 、 お{茶|ちゃ} を {頼|たの}む よ 。', en: 'Tea for me and my grandchild, please.' }, A: { jp: 'いつも の を 、 {連|つ}れ の {分|ぶん} も {合|あ}わせて な 。', en: 'The usual — and the same again for my companion.' } }, hint: { F: { jp: 'ふたつ', en: 'ふたつ means two.' }, I: { en: 'For him AND his grandchild — how many?' }, A: { en: '"The usual" is tea (ask Hana), plus the same for his companion.' } } },
      { who: 'bunta', want: { rice: 3, tea: 1 }, items: ['v:おにぎり'], line: { F: { jp: 'おにぎり みっつ と おちゃ 。', en: 'Three rice balls and a tea.' }, E: { jp: 'おにぎり を {三|みっ}つ と 、 お{茶|ちゃ} を {一|ひと}つ 。', en: 'Three rice balls and one tea.' }, I: { jp: 'おにぎり {三|みっ}つ 。 あ 、 お{茶|ちゃ} も {一杯|いっぱい} {付|つ}けて くれ 。', en: 'Three rice balls. Oh, and add a cup of tea.' }, A: { jp: '{腹|はら} が {減|へ}って しょうがない 。 おにぎり を {三|みっ}つ 、 {茶|ちゃ} は {一杯|いっぱい} で {十分|じゅうぶん} だ 。', en: 'I\'m starving. Three rice balls — one cup of tea will do.' } }, hint: { en: 'みっつ = three; ひとつ / 一杯 = one.' } },
      { who: 'mame', want: { dango: 2 }, items: ['v:団子'], line: { F: { jp: 'だんご ！ ふたつ ！', en: 'Dango! Two!' }, E: { jp: 'だんご を {二|ふた}つ ください ！', en: 'Two dango, please!' }, I: { jp: 'だんご ひとつ …… じゃ なくて 、 やっぱり ふたつ ！', en: 'One dango… no wait, two after all!' }, A: { jp: 'だんご 、 ひとつ で {我慢|がまん} しよう と {思|おも}った けど 、 {無理|むり} ！ ふたつ ！', en: 'I was going to make do with one dango, but I can\'t! Two!' } }, hint: { en: 'She changed her mind — listen to the end.' } },
      { who: 'kiku', want: { soup: 1, fish: 1 }, items: ['v:味噌汁'], line: { F: { jp: 'みそしる と さかな を ひとつ ずつ 。', en: 'One miso soup and one fish.' }, E: { jp: 'みそ{汁|しる} と {焼|や}き{魚|ざかな} を {一|ひと}つ ずつ お{願|ねが}い します 。', en: 'A miso soup and a grilled fish, please — one each.' }, I: { jp: '{魚|さかな} が ある なら 、 みそ{汁|しる} と {一緒|いっしょ} に いただこう かしら 。', en: 'If there\'s fish, I think I\'ll have it with a miso soup.' }, A: { jp: '{焼|や}き{魚|ざかな} が まだ {残|のこ}って いる なら 、 {汁物|しるもの} を {添|そ}えて いただける かしら 。', en: 'If there\'s any grilled fish left, might I have it with a bowl of soup?' } }, hint: { en: '〜ずつ = each. 汁物 = soup.' } },
    ] };

  // ---- enemies -----------------------------------------------------------------------------
  const EN = C.enemies;
  const pool = { tags: ['reedwake'], E: ['v:川', 'v:橋', 'v:水', 'v:雨', 'v:名前'], I: [], A: [] };
  EN['rw.reedling'] = { name: { en: 'Reedling', jp: '{葦|あし}の{子|こ}' }, art: 'wisp', artOpts: { col: '#b8d88a' }, look: { custom: 'wisp', col: '#b8d88a' }, region: 'reedwake', bg: 'reedwake', knots: 2, pool, pattern: ['strike', 'rest', 'strike', 'sweep'],
    intro: { jp: '{葦|あし} の {間|あいだ} から 、 {名前|なまえ} を なくした {光|ひかり} が {浮|う}かんで きた 。', en: 'From between the reeds rises a light that has lost its name.' },
    settle: { jp: '{光|ひかり} は {静|しず}か に {葦|あし} の {中|なか} へ {戻|もど}って いった 。', en: 'The light settles quietly back among the reeds.' } };
  EN['rw.dustmoth'] = { name: { en: 'Flour Moth', jp: '{粉|こな}{蛾|が}' }, art: 'moth', artOpts: { col: '#e8e0d0', col2: '#b8a888' }, look: { custom: 'moth', col: '#e8e0d0' }, region: 'reedwake', bg: 'mill', knots: 2, pool, pattern: ['shroud', 'strike', 'rest', 'strike'],
    intro: { jp: '{白|しろ}い {粉|こな} を まとった {蛾|が} が 、 {羽|はね} の {字|じ} を {隠|かく}して いる 。', en: 'A moth dusted in white flour is hiding the letters on its wings.' },
    settle: { jp: '{羽|はね} の {字|じ} が {読|よ}める よう に なる と 、 {蛾|が} は {窓|まど} から {飛|と}んで いった 。', en: 'Once the letters on its wings can be read, the moth flutters out through the window.' } };
  EN['rw.inkblot'] = { name: { en: 'Runoff Blot', jp: 'にじみ' }, art: 'blot', artOpts: { col: '#2a2a44' }, look: { custom: 'blot', col: '#2a2a44' }, region: 'reedwake', bg: 'mill', knots: 3, pool, pattern: ['strike', 'mend', 'rest', 'sweep'],
    intro: { jp: '{流|なが}れ{落|お}ちた {字|じ} が 、 {水|みず}たまり の よう に {集|あつ}まって いる 。', en: 'Letters that ran in the rain have pooled together like a puddle.' },
    settle: { jp: 'にじんだ {字|じ} は 、 もと の {形|かたち} を {思|おも}い{出|だ}して {乾|かわ}いた 。', en: 'The smeared letters remember their shapes and dry.' } };
  EN['rw.mill_echo'] = { name: { en: 'The Mill Echo', jp: 'こだま' }, art: 'echo', artOpts: { col: '#a8c8d8' }, region: 'reedwake', bg: 'mill', knots: 4, boss: true, music: 'boss', pool,
    pattern: ['strike', 'heat', 'strike', 'rest'],
    intents: {
      'mirror:1': { power: 2, target: 'rand',
        text: {
          F: { jp: '「 きて ね 」 …… 「 こないで ね 」 。', en: '"Come, okay?" … "Don\'t come, okay?"' },
          E: { jp: '「 {明日|あした} も {来|き}て ね 」 …… 「 {明日|あした} は {来|こ}ないで ね 」 。', en: '"Come again tomorrow." … "Don\'t come tomorrow."' },
          I: { jp: '「 {雨|あめ} が やんだら 、 {渡|わた}って おいで 」 …… 「 {雨|あめ} が やんで も 、 {渡|わた}って は だめ 」 。', en: '"When the rain stops, come across." … "Even if the rain stops, you mustn\'t cross."' },
          A: { jp: '「 {待|ま}ってる から 、 {急|いそ}がなくて いい よ 」 …… 「 {待|ま}ってない から 、 {急|いそ}がなくて いい よ 」 。', en: '"I\'ll be waiting, so there\'s no need to hurry." … "I won\'t be waiting, so there\'s no need to hurry."' },
        },
        truth: {
          F: { kind: 'choose', item: 'g:v_naide_kudasai', prompt: { en: 'The echo repeated Hana\'s words wrong. What did it change?' }, options: [{ en: 'It turned "come" (きて) into "don\'t come" (こないで).', ok: true }, { en: 'It changed nothing.', ok: false }, { en: 'It changed "come" into "go".', ok: false }], explain: { en: 'こないで = "please don\'t come" — the ないで form asks someone not to do something.' } },
          E: { kind: 'choose', item: 'g:v_naide_kudasai', prompt: { en: 'What did the echo change?' }, options: [{ en: '"Come again tomorrow" became "Don\'t come tomorrow".', ok: true }, { en: '"Tomorrow" became "today".', ok: false }, { en: 'It changed who was speaking.', ok: false }], explain: { en: '来て (きて) vs 来ないで (こないで); も "too, again" vs は (contrast).' } },
          I: { kind: 'choose', item: 'g:temo', prompt: { en: 'What did the echo change?' }, options: [{ en: 'A condition to cross ("when it stops") became a ban ("even if it stops, don\'t").', ok: true }, { en: 'It only changed the weather.', ok: false }, { en: 'It changed a question into a statement.', ok: false }], explain: { en: '〜たら = "when/once"; 〜ても = "even if"; 〜てはだめ = "must not".' } },
          A: { kind: 'choose', item: 'c:rw_echo_a', prompt: { en: 'The two sentences end the same way. How does the meaning change?' }, options: [{ en: 'Reassurance ("no rush, I\'ll wait") becomes dismissal ("no rush — no one\'s waiting").', ok: true }, { en: 'Nothing changes; both mean "take your time".', ok: false, why: { en: 'The reason clause flips from 待ってる to 待ってない.' } }, { en: 'Both are threats.', ok: false }], explain: { en: 'The same 〜から (because) clause frames the ending: identical words, opposite feeling.' } },
        } },
      'plea:1': {
        text: {
          F: { jp: 'だれ を まって いた の ？', en: 'Who was I waiting for?' },
          E: { jp: '{毎朝|まいあさ} 、 {誰|だれ} を {待|ま}って いた の ？', en: 'Who was I waiting for, every morning?' },
          I: { jp: '{二|ふた}つ{目|め} の お{茶|ちゃ} が {冷|さ}める まで 、 {誰|だれ} を {待|ま}って いた ん だろう 。', en: 'Who was I waiting for, until the second cup went cold?' },
          A: { jp: '{名前|なまえ} だけ が {抜|ぬ}け{落|お}ちて 、 {待|ま}つ こと だけ が {残|のこ}った 。 ── {私|わたし} は 、 {誰|だれ} を ？', en: 'Only the name fell away; only the waiting remained. Who was I…?' },
        },
        answer: {
          F: { kind: 'choose', item: 'c:rw_echo_plea', prompt: { en: 'Answer it: who was Hana waiting for?' }, options: [{ jp: 'コウジ', en: 'Kōji — her brother, the ferryman', ok: true }, { jp: 'ツル', en: 'Tsuru — the keeper', ok: false, why: { en: 'Tsuru lives on this side of the river.' } }, { jp: 'マメ', en: 'Mame — the child', ok: false, why: { en: 'Mame has dango, not tea.' } }] },
          E: { kind: 'choose', item: 'c:rw_echo_plea', prompt: { en: 'Answer it: who crossed the bridge each morning for tea?' }, options: [{ en: 'Kōji, the ferryman from the far bank, Hana\'s brother.', ok: true }, { en: 'Nobody; Hana drinks both cups.', ok: false }, { en: 'The keeper, Tsuru.', ok: false }] },
          I: { kind: 'choose', item: 'c:rw_echo_plea', prompt: { en: 'Answer it in a way that returns the name.' }, options: [{ jp: '{向|む}こう{岸|ぎし} の {渡|わた}し{守|もり} 、 コウジ さん を {待|ま}って いた ん です 。', ok: true }, { jp: 'もう {誰|だれ} も {待|ま}たなくて いい ん です 。', ok: false, why: { en: 'That would soothe it by erasing the name — the Hush\'s answer, not yours.' } }, { jp: '{待|ま}って いた の は 、 あなた {自身|じしん} です 。', ok: false, why: { en: 'Poetic, but the name it lost is Kōji.' } }] },
          A: { kind: 'choose', item: 'c:rw_echo_plea', prompt: { en: 'Which reply gives the name back without dismissing the waiting?' }, options: [{ jp: '{待|ま}って いた の は コウジ さん です 。 {待|ま}つ こと は 、 {忘|わす}れなくて いい 。', ok: true }, { jp: '{忘|わす}れて しまった なら 、 それ で いい じゃ ない です か 。', ok: false, why: { en: 'Accepting the loss is exactly what the Hush wants.' } }, { jp: '{誰|だれ} で も いい から 、 {待|ま}つ の は やめましょう 。', ok: false, why: { en: 'It dismisses both the name and the waiting.' } }] },
        } },
    },
    phases: [
      { at: 2, pattern: ['mirror:1', 'strike', 'heat', 'mirror:1'], line: { jp: '{言葉|ことば} が 、 {少|すこ}し ずつ {裏返|うらがえ}って {聞|き}こえる 。', en: 'The words start coming back to you slightly turned inside out.' }, teach: { en: 'New: the echo repeats real words but changes them (Mirror). Choose "See through" and say what it changed — that stops the blow and loosens a knot.' } },
      { at: 1, pattern: ['plea:1', 'rest', 'plea:1'], line: { jp: 'こだま は {静|しず}か に なり 、 {一|ひと}つ だけ {尋|たず}ねた 。', en: 'The echo grows quiet and asks a single question.' }, teach: { en: 'New: a Plea. It isn\'t attacking — it is asking. Choose "Answer" and reply to what it is really asking.' } },
    ],
    intro: { jp: '{石臼|いしうす} の {上|うえ} で 、 {村|むら} じゅう の {声|こえ} が {渦|うず} を {巻|ま}いて いる 。', en: 'Above the millstone, the voices of the whole village are turning in a slow whirlpool.' },
    settle: { jp: '「 ── コウジ 。 そう 、 コウジ 。 」 {声|こえ} は ひとつ ずつ ほどけて 、 {川|かわ} へ {帰|かえ}って いった 。', en: '"…Kōji. Yes — Kōji." One by one the voices come untied and go home to the river.' },
    reward: { words: ['mizu'] } };
})(RB.content);
