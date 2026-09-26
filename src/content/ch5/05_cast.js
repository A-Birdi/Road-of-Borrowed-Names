/* Chapter 5 — Lanternfall (灯落 ひおち): cast, items, quests, notes, place.
 * Story bible: docs/STORY.md. Prefix: lf / lf_. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // People who belong to other chapters' stories too are defined only if an
  // earlier chapter has not already defined them (keeps one look per person).
  const shared = (id, d) => { if (!C.chars[id]) C.chars[id] = d; };

  // ---- Lanternfall residents ------------------------------------------------------
  ch('lf_tadashi', {
    name: { en: 'Registrar Tadashi', jp: 'タダシ' }, voice: { pitch: 0.82 },
    look: { skin: 1, hair: 'short', hairColor: 5, cloth: ['#3a3860', '#2a2848', '#d8d0bc'], pants: '#2a2838', shape: 'coat', acc: ['glasses', 'book'] },
    portrait: { eyes: 'narrow', style: 'short', collar: 'high', acc: ['glasses'], bg: '#262440' },
  });
  ch('lf_hayato', {
    name: { en: 'Hayato', jp: 'ハヤト' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'short', hairColor: 0, cloth: ['#5a5890', '#46447a', '#e8e0cc'], pants: '#2e2c44', shape: 'tunic', acc: ['book'] },
    portrait: { eyes: 'round', style: 'short', collar: 'high', bg: '#2c2a48' },
  });
  ch('lf_yae', {
    name: { en: 'Councillor Yae', jp: 'ヤエ' }, voice: { pitch: 0.78 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#6a3a5a', '#502a44', '#e8c070'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', collar: 'high', pins: true, bg: '#3a2438' },
  });
  ch('lf_tetsu', {
    name: { en: 'Tetsu', jp: 'テツ' }, voice: { pitch: 0.7 },
    look: { skin: 4, hair: 'shaved', hairColor: 5, cloth: ['#4a5a5a', '#3a4848', '#c8a060'], shape: 'tunic', acc: ['beard', 'hat'], hatCol: '#6a5a44', age: 'old' },
    portrait: { eyes: 'sharp', style: 'shaved', beard: true, age: 'old', acc: ['hat'], hatCol: '#6a5a44', scar: true, bg: '#22303a' },
  });
  ch('lf_tsuya', {
    name: { en: 'Tsuya', jp: 'ツヤ' }, voice: { pitch: 0.9 },
    look: { skin: 1, hair: 'bun', hairColor: 5, cloth: ['#8a6a5a', '#6e5446', '#e0d0b0'], shape: 'robe', acc: ['basket'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', bg: '#3a3028' },
  });
  ch('lf_sota', {
    name: { en: 'Sōta', jp: 'ソウタ' }, voice: { pitch: 0.8 },
    look: { skin: 3, hair: 'short', hairColor: 5, cloth: ['#5a6a4a', '#46543a', '#c8b080'], shape: 'tunic', acc: ['toolbelt'] },
    portrait: { eyes: 'round', style: 'short', beard: '#8a8a90', bg: '#2e3626' },
  });
  ch('lf_kinu', {
    name: { en: 'Kinu', jp: 'キヌ' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'bob', hairColor: 6, cloth: ['#8a4a4a', '#6e3a3a', '#f0e0c0'], shape: 'apron', acc: ['flower'], flowerCol: '#e8b4d0' },
    portrait: { eyes: 'sharp', style: 'bob', collar: 'apron', acc: ['flower'], flowerCol: '#e8b4d0', mole: true, bg: '#3a2626' },
  });
  ch('lf_kanta', {
    name: { en: 'Kanta', jp: 'カンタ' }, voice: { pitch: 0.75 },
    look: { skin: 3, hair: 'wrap', hairColor: 1, wrapCol: '#f4f0e8', cloth: ['#c8a878', '#a88a5e', '#f4f0e8'], shape: 'apron', acc: [] },
    portrait: { eyes: 'round', style: 'wrap', wrapCol: '#f4f0e8', collar: 'apron', blush: true, bg: '#3a3024' },
  });
  ch('lf_ritsu', {
    name: { en: 'Ritsu', jp: 'リツ' }, voice: { pitch: 1.08 },
    look: { skin: 2, hair: 'bob', hairColor: 9, cloth: ['#3a3440', '#2a2430', '#e8d8c0'], shape: 'apron', acc: ['earrings'] },
    portrait: { eyes: 'soft', style: 'bob', collar: 'apron', acc: ['earrings'], bg: '#2e2634' },
  });
  ch('lf_setsu', {
    name: { en: 'Setsu', jp: 'セツ' }, voice: { pitch: 0.98 },
    look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#4c7e6a', '#3e6a58', '#f4d884'], shape: 'robe', acc: [] },
    portrait: { eyes: 'soft', style: 'long', collar: 'high', bg: '#243a30' },
  });
  ch('lf_nagi', {
    name: { en: 'Nagi', jp: 'ナギ' }, voice: { pitch: 1.02 },
    look: { skin: 3, hair: 'curly', hairColor: 3, cloth: ['#5a4a3a', '#46382c', '#ffd27a'], shape: 'coat', acc: ['lamp', 'headband'], bandCol: '#ffd27a' },
    portrait: { eyes: 'round', style: 'curly', acc: ['headband'], bandCol: '#ffd27a', bg: '#3a3020' },
  });
  ch('lf_kei', {
    name: { en: 'Kei', jp: 'ケイ' }, voice: { pitch: 1.3 },
    look: { skin: 3, hair: 'twintails', hairColor: 3, cloth: ['#e8b4d0', '#c890b0', '#fcf8ec'], shape: 'dress', size: 'child', acc: [] },
    portrait: { eyes: 'round', style: 'twintails', blush: true, bg: '#3a2a38' },
  });
  ch('lf_shu', {
    name: { en: 'Shū', jp: 'シュウ' }, voice: { pitch: 0.88 },
    look: { skin: 2, hair: 'short', hairColor: 0, cloth: ['#4c7e6a', '#3e6a58', '#b4a48c'], shape: 'tunic', acc: ['hat'], hatCol: '#c8b078' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#c8b078', bg: '#24362c' },
  });
  // Tōya exists in this chapter only as an echo in the drowned tower.
  ch('lf_toya', {
    name: { en: 'A young voice', jp: '{若|わか}い {声|こえ}' }, voice: { pitch: 1.05 },
    look: { skin: 1, hair: 'spiky', hairColor: 2, cloth: ['#6c8cbc', '#4a6c9c', '#e0e8f8'], shape: 'tunic', acc: ['scarf'], scarfCol: '#e0e8f8' },
    portrait: { eyes: 'round', style: 'spiky', acc: ['scarf'], scarfCol: '#e0e8f8', bg: '#1a2a44' },
  });
  // Cross-chapter people (Nao's letter; Hoshino's daughter from Snowbell).
  shared('umi', {
    name: { en: 'Umi', jp: 'ウミ' }, voice: { pitch: 1.0 },
    look: { skin: 3, hair: 'ponytail', hairColor: 7, cloth: ['#2e6a6e', '#225256', '#e8b070'], shape: 'coat', acc: ['hat'], hatCol: '#2a3a4a' },
    portrait: { eyes: 'sharp', style: 'ponytail', acc: ['hat'], hatCol: '#2a3a4a', collar: 'high', bg: '#1e3438' },
  });
  shared('akari', {
    name: { en: 'Akari', jp: 'アカリ' }, voice: { pitch: 1.05 },
    look: { skin: 1, hair: 'braid', hairColor: 1, cloth: ['#4c4a78', '#3a3860', '#e8e0cc'], shape: 'tunic', acc: ['scarf'], scarfCol: '#b8d4f0' },
    portrait: { eyes: 'soft', style: 'braid', acc: ['scarf'], scarfCol: '#b8d4f0', collar: 'high', bg: '#262a44' },
  });

  // ---- items --------------------------------------------------------------------------
  const it = (id, d) => (C.items[id] = d);
  it('lf_visitor_pass', { name: { jp: '{来訪者|らいほうしゃ}{証|しょう}', en: "Visitor's pass" }, key: true, desc: 'Issued by the gate clerk of Lanternfall. Every box on it says "approved".' });
  it('lf_request_slip', { name: { jp: '{閲覧|えつらん}{許可|きょか}{証|しょう}', en: 'Reading permit' }, key: true, desc: 'Permission to read the public records. Stamped twice, once on each side, both times "certainly".' });
  it('lf_stacks_key', { name: { jp: '{地下|ちか}{書庫|しょこ}の {鍵|かぎ}', en: 'Basement stacks key' }, key: true, desc: 'A brass key Akari slid across her desk while saying you had better not go.' });
  it('lf_minutes', { name: { jp: '{古|ふる}い {議事録|ぎじろく}', en: 'The old minutes' }, key: true, desc: 'Council minutes from thirty years ago, the only copy the Hush did not smooth over. Full of people disagreeing.' });
  it('lf_toya_bell', { name: { jp: 'トウヤ の {鈴|すず}', en: "Tōya's hand bell" }, key: true, desc: 'A messenger\'s small brass bell. Old Tetsu kept it for thirty years and never once rang it.' });
  it('lf_hoshigaki', { name: { jp: '{干|ほ}し{柿|がき}', en: 'Dried persimmons' }, desc: 'From the tree Sōta and Kinu finally agreed to share. Sweet, a little chewy, argued over.' });
  it('lf_ferry_cap', { name: { jp: '{渡|わた}し{舟|ぶね}の {帽子|ぼうし}', en: 'Ferry cap' }, slot: 'cosmetic', acc: 'hat', desc: 'A spare ferry clerk\'s cap from Umi\'s office. Makes people ask you when the next boat leaves.' });
  it('lf_red_pen', { name: { jp: '{赤|あか}ペン', en: 'Red pen' }, desc: 'Hayato\'s correcting pen. He says a clerk who cannot cross things out is only half a clerk.' });
  it('lf_bell_shard', { name: { jp: '{鐘|かね}の {欠片|かけら}', en: 'Bell fragment' }, slot: 'charm', desc: 'A chip of bronze from the drowned bell. It hums faintly when someone near you is about to say no.' });

  // ---- notes (notebook lore) ----------------------------------------------------------
  const nt = (id, d) => (C.notes[id] = d);
  nt('lf_certainly', {
    title: { jp: '「かしこまりました」の {町|まち}', en: 'The town of "Certainly"' }, fiction: true,
    jp: '{灯落|ひおち} では 、{誰|だれ} も 「いいえ」 と {言|い}えない 。{返事|へんじ} は 「かしこまりました」 か 「もちろん です」 だけ 。',
    en: 'In Lanternfall no one can say "no". The only answers left are "certainly" and "of course". (Fiction: this is the Hush at work, not a feature of Japanese.)',
  });
  nt('lf_refusal', {
    title: { jp: '{断|ことわ}り の {言葉|ことば}', en: 'Ways of saying no' },
    jp: 'ちょっと… 、〜かねます 、{結構|けっこう} です 、{遠慮|えんりょ} します 、お{断|ことわ}り します 。',
    en: 'Real Japanese often refuses indirectly. ちょっと… ("that\'s a bit…") trails off and lets the listener finish the thought. 〜かねます is a polite, formal "I am unable to". けっこうです means "no, thank you" when offered something. えんりょします ("I\'ll refrain") is a gentle decline. おことわりします is a clear, polite refusal. Which one fits depends on who is asking and what is at stake.',
  });
  nt('lf_conduits', {
    title: { jp: 'しじま の {管|くだ}', en: 'The hush conduits' }, fiction: true,
    jp: '{町|まち} の {地下|ちか} を {通|とお}る {古|ふる}い {管|くだ} 。{上|のぼ}り の {印|しるし} 。{名前|なまえ} と 「いいえ」 を {山|やま} の {上|うえ} へ {運|はこ}んで いる 。',
    en: 'Old pipes under the town, stamped "uphill". They carry names, and every "no" people would have said, up the mountain towards the Still Archive. (Fictional.)',
  });
  nt('lf_flood', {
    title: { jp: '{三十年前|さんじゅうねんまえ} の {洪水|こうずい}', en: 'The flood, thirty years ago' },
    jp: '{高瀬|たかせ} と {灯落|ひおち} は {水門|すいもん} の こと で {何週間|なんしゅうかん} も {言|い}い{争|あらそ}った 。{最後|さいご} の {返事|へんじ} は 「{必要|ひつよう} なら {開|あ}ける」 だった 。',
    en: 'Takase, upstream, and Lanternfall argued about the sluice gates for weeks. Takase\'s last reply was "we\'ll open it if it\'s needed." Lanternfall read it as a reassurance; Takase meant it as a warning. That night the gate opened and the lower quarter drowned.',
  });
  nt('lf_promise', {
    title: { jp: '「{必要|ひつよう} なら {開|あ}ける」', en: '"We\'ll open it if it\'s needed"' },
    jp: '{誰|だれ} に とって の 「{必要|ひつよう}」 か 。{誰|だれ} が {決|き}める の か 。',
    en: 'Needed by whom? Decided by whom? なら marks a condition but not who judges it. Lanternfall heard "only if it truly comes to that — and we\'ll tell you". Takase meant "when we judge it necessary". Both readings are grammatical; context and trust decide.',
  });
  nt('lf_toya', {
    title: { jp: 'トウヤ', en: 'Tōya' },
    jp: 'カサネ の {弟|おとうと} 。{鐘|かね} を {鳴|な}らしに {塔|とう} へ {走|はし}った 。{下町|したまち} の {人|ひと} は {逃|に}げられた が 、トウヤ は {戻|もど}らなかった 。',
    en: 'Kasane\'s younger brother, a messenger. He ran to the tower to ring the warning bell. The lower quarter got out in time; Tōya did not come back. His last conversation with Kasane was an argument about that message.',
  });
  nt('lf_bell', {
    title: { jp: '{沈|しず}んだ {鐘|かね}', en: 'The drowned bell' },
    jp: '「この {鐘|かね} が {鳴|な}ったら 、{高|たか}い {所|ところ} へ {逃|に}げよ 。」',
    en: 'The inscription on Lanternfall\'s old warning bell: "When this bell rings, flee to high ground." A bell that exists to say: no, not here, not now, go.',
  });

  // ---- quests ---------------------------------------------------------------------------
  const S = (jp, en) => ({ jp, en });
  C.quests.lf_main = {
    main: true, chapter: 5,
    title: { jp: '{水底|みなそこ} の {鐘|かね}', en: 'The Bell Under the Water' },
    stages: [
      S('{記録館|きろくかん} で 、{沈|しず}んだ {鐘楼|しょうろう} の こと を {聞|き}く 。', 'Ask at the Public Records Hall (north side of the main avenue) about the drowned bell tower.'),
      S('{窓口|まどぐち} で {閲覧|えつらん} の {申請書|しんせいしょ} を {出|だ}して 、{左|ひだり} の {机|つくえ} の {台帳|だいちょう} を {読|よ}む 。', 'File a records request at the Records Hall counter, then read the flood-year ledger on the desk to the left.'),
      S('{洪水|こうずい} の {年|とし} の {記録|きろく} は 「{特記|とっき}{事項|じこう} なし」 。{事務所|じむしょ} の アカリ に {聞|き}いて みる 。', 'The flood year\'s ledger says "nothing of note". Ask Akari in the clerks\' office (north-east).'),
      S('{記録館|きろくかん} の {地下|ちか}{書庫|しょこ} を {調|しら}べる 。', 'Search the basement stacks under the Records Hall (stairs behind the counter).'),
      S('{古|ふる}い {議事録|ぎじろく} を {議会|ぎかい} の ヤエ に {見|み}せる 。', 'Show the old minutes to Councillor Yae in the Council Chamber.'),
      S('{水門|すいもん} の テツ に 、{洪水|こうずい} の {夜|よる} の こと を {聞|き}く 。', 'Ask old Tetsu, by the sluice gates south of town, about the night of the flood.'),
      S('テツ の {舟|ふね} で {鐘楼|しょうろう} へ {渡|わた}る 。', 'Take Tetsu\'s boat from the sluice landing out to the bell tower.'),
      S('{水門|すいもん} の {札|ふだ} を {読|よ}み 、{鐘|かね} の {間|ま} の {水|みず} を {抜|ぬ}く 。', 'Inside the tower: read each gate plate carefully and drain the way down to the bell chamber.'),
      S('{沈|しず}んだ {鐘|かね} を {鳴|な}らす 。', 'Ring the drowned bell.'),
      S('{灯落|ひおち} に {戻|もど}って 、{何|なに} が {変|か}わった か {見|み}る 。', 'Go back to Lanternfall and see what has changed. Councillor Yae is calling a meeting.'),
    ],
    reward: { flags: ['lf_main_reward'] },
  };
  C.quests.lf_fence = {
    chapter: 5, title: { jp: '{毎朝|まいあさ} {動|うご}く {垣根|かきね}', en: 'The Fence That Moves Every Morning' },
    stages: [
      S('ソウタ と キヌ は {垣根|かきね} の {場所|ばしょ} で {困|こま}って いる 。{記録館|きろくかん} で {土地|とち} の {記録|きろく} を {探|さが}す 。', 'Sōta and Kinu keep agreeing about their fence and it moves every morning. Look for the old boundary record in the Records Hall.'),
      S('{境界|きょうかい} の {記録|きろく} を ふたり に {見|み}せる 。', 'Show the boundary record to Sōta and Kinu in the garden quarter.'),
      S('ふたり は まだ {何|なん} でも 「もちろん」 と {言|い}う 。{言|い}い{争|あらそ}える よう に なったら 、また {来|く}る 。', 'They still say "of course" to everything. Come back once people in Lanternfall can argue again.'),
      S('やっと {言|い}い{争|あらそ}える ふたり の {話|はなし} を {聞|き}いて 、{垣根|かきね} を {決|き}める 。', 'Now that they can argue, help Sōta and Kinu settle the fence line.'),
    ],
    reward: { items: { lf_hoshigaki: 1 } },
  };
  C.quests.lf_form = {
    chapter: 5, title: { jp: '{二|ふた}つ の こと を {言|い}う {書類|しょるい}', en: 'The Form That Says Two Things' },
    stages: [
      S('ハヤト の {書類|しょるい} は {自分|じぶん} と {矛盾|むじゅん} して いる 。どこ が おかしい か {読|よ}む 。', 'Hayato\'s form contradicts itself. Read it at his counter in the Records Hall and find where.'),
      S('ひとつ の {意味|いみ} に なる よう に 、{書|か}き{直|なお}し を {選|えら}ぶ 。', 'Choose a rewrite that makes the clause mean one thing.'),
    ],
    reward: { items: { lf_red_pen: 1 } },
  };
  C.quests.lf_timetable = {
    chapter: 5, title: { jp: '「{運休|うんきゅう}」 の ない {時刻表|じこくひょう}', en: 'The Timetable With No "No"' },
    stages: [
      S('ツヤ は {来|こ}ない {舟|ふね} を {毎日|まいにち} {待|ま}って いる 。{渡|わた}し{場|ば} の {時刻表|じこくひょう} を {読|よ}む 。', 'Tsuya waits every day for a ferry that never comes. Read the timetable at the ferry office.'),
      S('{本当|ほんとう} に {出|で}る {舟|ふね} を ツヤ に {教|おし}える 。', 'Tell Tsuya when a boat really leaves.'),
    ],
    reward: { items: { lf_ferry_cap: 1 } },
  };
  C.quests.lf_akari = {
    chapter: 5, title: { jp: '{雪鈴|ゆきすず} へ の {手紙|てがみ}', en: 'A Letter to Snowbell' },
    stages: [
      S('アカリ の {手紙|てがみ} は 「{宛先|あてさき}{不明|ふめい}」 で {戻|もど}って くる 。', 'Akari\'s letters home keep coming back "address unknown". There may be nothing to do until the Hush loosens its grip.'),
      S('{鐘|かね} が {鳴|な}った 。アカリ に {会|あ}い に {行|い}く 。', 'The bell has rung. Visit Akari in the clerks\' office.'),
      S('アカリ の {封筒|ふうとう} に {宛先|あてさき} を {書|か}く {手伝|てつだ}い を する 。', 'Help Akari write the address on her envelope.'),
    ],
    reward: { flags: ['lf_akari_letter'] },
  };
  C.quests.lf_nao = {
    chapter: 5, title: { jp: 'ウミ へ の {手紙|てがみ}', en: 'The Letter for Umi' },
    stages: [
      S('ナオ は ウミ に {渡|わた}す {手紙|てがみ} を {持|も}って いる 。{渡|わた}し{場|ば} の {事務所|じむしょ} へ {一緒|いっしょ} に {行|い}く 。', 'Nao is carrying a letter for Umi, a ferry clerk here. Go with Nao to the ferry office (south-east, by the canal).'),
      S('「いいえ」 と {言|い}えない ウミ に 、ナオ は {手紙|てがみ} を {渡|わた}さない 。{鐘|かね} の あと で また {来|く}る 。', 'Umi cannot say no, so Nao will not hand it over. Come back after the bell.'),
      S('ナオ と {一緒|いっしょ} に 、ウミ に {手紙|てがみ} を {届|とど}ける 。', 'Deliver the letter to Umi, with Nao.'),
    ],
  };
  C.quests.lf_mio = {
    chapter: 5, title: { jp: '{声|こえ} に {出|だ}す 「いいえ」', en: 'A No, Out Loud' },
    stages: [
      S('{町|まち} の {人|ひと} が みんな 、ミオ に {頼|たの}み{事|ごと} を {持|も}って くる 。', 'Everyone in town has started bringing Mio their requests, and she is saying yes to all of them.'),
      S('{登記官|とうきかん} が {町|まち} {全体|ぜんたい} の 「しずめ{薬|ぐすり}」 を {頼|たの}んだ 。ミオ と {処方|しょほう} を {読|よ}む 。', 'The Registrar has ordered a "quieting draught" for the whole town. Read the recipe with Mio.'),
      S('ミオ に は {言|い}う こと が ある 。{記録館|きろくかん} の タダシ の ところ へ {一緒|いっしょ} に {行|い}く 。', 'Mio has something to say. Go with her to Registrar Tadashi in the Records Hall.'),
    ],
  };

  // ---- fast travel -------------------------------------------------------------------------------
  C.places.lanternfall = {
    name: { en: 'Lanternfall', jp: '{灯落|ひおち}' }, map: 'lf.town', x: 2, y: 17, dir: 'right', pos: [420, 170],
    region: 'lanternfall', hub: true, desc: 'An orderly town of records, canals and lantern-lined avenues.',
  };
})(RB.content);
