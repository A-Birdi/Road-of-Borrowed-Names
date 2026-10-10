/* Manybridge, Chapter 4: quests and items (expansion P09). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.quests.mp_main = {
    main: true, chapter: 'mb2',
    title: T('{版木|はんぎ} と {灯|あか}り', 'Blockprint and Footlights'),
    stages: [
      T('{版木|はんぎ} の {通|とお}り の {宗兵衛|そうべえ} の {仕事場|しごとば} を {訪|たず}ねよう 。', 'Visit master Sōbē\'s workshop in Blockprint Row: his woodblocks are going blank.'),
      T('{刷|す}り{場|ば} で 、 {知|し}らせ を {一枚|いちまい} {刷|す}って 、 {宗兵衛|そうべえ} に {見|み}せよう 。', 'At the press room, print a notice and show it to Sōbē.'),
      T('{芝居|しばい} の {通|とお}り の {芝居小屋|しばいごや} で 、 マンベエ に {会|あ}おう 。', 'Go to the playhouse on Playhouse Row and find Manbē: his script is losing its characters\' names.'),
      T('{芝居小屋|しばいごや} の けいこ を {手伝|てつだ}おう 。', 'Help with the rehearsal at the playhouse.'),
      T('{祭|まつ}り の {世話役|せわやく} の トミ を {手伝|てつだ}おう 。', 'Help Tomi of the festival committee get the Opening of the River ready.'),
      T('{舞台|ぶたい} の {下|した} の {奈落|ならく} へ {下|お}りて 、 {名前|なまえ} を {取|と}り{戻|もど}そう 。', 'Go down into the Understage beneath the stage and bring the names back.'),
      T('{川開|かわびら}き の {夜|よる} 。 {岸|きし} へ {行|い}こう 。', 'The night of the Opening of the River. Go down to the bank.'),
    ],
    reward: { flags: ['mp_main_done'] },
  };
  C.quests.mp_census = {
    chapter: 'mb2',
    title: T('{橋|はし} の {名前|なまえ} {調|しら}べ ・ {二|に}', 'The Bridge-Name Census, continued'),
    stages: [
      Object.assign(T('{版木|はんぎ} と {芝居|しばい} の {通|とお}り の {橋|はし} の {札|ふだ} 、 {三|みっ}つ の {名前|なまえ} を {探|さが}そう 。', 'Find the names of the three blank plaques in Blockprint and Playhouse Rows.'), { at: [{ map: 'mp.blockprint' }, { map: 'mp.playhouse' }] }),
      T('{三|みっ}つ の {名前|なまえ} を {札場|ふだば} の セン に {届|とど}けよう 。', 'Take the three names to Sen at the Tally Exchange.'),
    ],
    reward: { items: { mp_cityprint: 1 } },
  };
  C.quests.mp_apprentice = {
    chapter: 'mb2',
    title: T('{見習|みなら}い の {見習|みなら}い', 'The Apprentice Printer'),
    stages: [
      T('ミヨ に 、 {活字|かつじ} の {並|なら}べ{方|かた} を {教|おし}えよう 。', 'Show Miyo how type is set: you explain, she sets.'),
      T('ミヨ が {組|く}んだ {版|はん} を 、 {宗兵衛|そうべえ} に {見|み}せよう 。', 'Take the forme Miyo set to Sōbē.'),
    ],
    reward: { flags: ['mp_apprentice_done'] },
  };
  C.quests.mp_actor = {
    chapter: 'mb2',
    title: T('{消|き}えた {看板役者|かんばんやくしゃ}', 'The Missing Lead Actor'),
    stages: [
      T('{岸|きし} に {座|すわ}って いる サクタロウ に {話|はなし} を {聞|き}こう 。', 'Talk to Sakutarō, sitting by the canal: he has lost his stage name, and his nerve with it.'),
      T('サクタロウ と 、 {台詞|せりふ} の けいこ を しよう 。', 'Rehearse his lines with him.'),
    ],
    reward: { flags: ['mp_actor_done'] },
  };
  C.quests.mp_ghost = {
    chapter: 'mb2',
    title: T('{代筆|だいひつ} の {貸|か}し', 'A Ghostwriter\'s Debt'),
    stages: [
      T('シノブ の {話|はなし} を {聞|き}こう 。', 'Hear Shinobu out: her stories went out under another writer\'s name.'),
      T('{証拠|しょうこ} を {集|あつ}めて 、 リュウスイ と {話|はな}そう 。', 'Gather the evidence, then talk to Ryūsui.'),
    ],
    reward: { flags: ['mp_ghost_done'] },
  };
  C.quests.mp_fest_extra = {
    chapter: 'mb2',
    title: T('{祭|まつ}り の {準備|じゅんび} ・ {寄|よ}り{道|みち}', 'Festival preparations: the extras'),
    stages: [
      T('トミ の {頼|たの}み の {残|のこ}り （ {招待状|しょうたいじょう} 、 {食|た}べ{物|もの} 、 {花火|はなび} の {注意書|ちゅういが}き ） を {手伝|てつだ}おう 。', 'Help Tomi with the rest of her list: the invitations, the food order, the fireworks safety notice.'),
    ],
    reward: { flags: ['mp_fest_extra_done'] },
  };

  const it = (id, d) => (C.items[id] = d);
  it('mp_cityprint', { name: T('{八百橋|やおばし} の {刷|す}り{物|もの}', 'A print of Manybridge'), desc: 'Sen\'s thanks for the second census: the whole city, every bridge named, from Blockprint Row\'s press.' });
  it('mp_playbill', { name: T('{古|ふる}い {番付|ばんづけ}', 'An old playbill'), key: true, desc: 'From the stage door. A troupe\'s playbill from years ago; Suzu took it and said it was nothing.' });
  it('mp_manuscript', { name: T('{原稿|げんこう}', 'A manuscript'), key: true, desc: 'Shinobu\'s first draft, in her hand, dated a season before the printed book.' });
})(RB.content);
