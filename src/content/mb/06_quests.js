/* Manybridge, Chapter 3: quests and items (expansion P08). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.quests.mb_main = {
    main: true, chapter: 'mb1',
    title: T('{八百|はっぴゃく} の {橋|はし}', 'Eight Hundred Bridges'),
    stages: [
      T('{藤橋|ふじばし} の {向|む}こう の {藤屋|ふじや} で 、 {女将|おかみ} の フジコ に {話|はなし} を {聞|き}こう 。', 'Find Fujiko, the mistress of Fujiya, over the Wisteria Bridge: her rice keeps going astray.'),
      T('{藤屋|ふじや} の {隣|となり} の {荷運|にはこ}び{屋|や} で 、 {次|つぎ} の {荷|に} を {運河|うんが} の {盤|ばん} から {送|おく}ろう 。', 'At the porters\' office next to Fujiya, send the next loads from the canal board.'),
      T('{札場|ふだば} で 、 {米|こめ} の {揉|も}め{事|ごと} の {間|あいだ} に {入|はい}ろう 。', 'At the Tally Exchange, stand between Fujiko, Heiji and the porter Gonta.'),
      T('{札場|ふだば} の {下|した} の {宛先不明|あてさきふめい} の {係|かかり} で 、 {一番|いちばん} {古|ふる}い {宛名|あてな} を {探|さが}そう 。', 'At the dead-letter office under the Tally Exchange, look for the oldest address.'),
      T('{宿|やど} の {川屋|かわや} で {休|やす}もう 。 …… {夜|よる} に イチ が {迷子|まいご} に なったら 、 {蔵|くら} の {並|なら}び を {探|さが}そう 。', 'Rest at Kawaya, the inn. If Ichi is lost in the night, search Warehouse Row.'),
      T('{閘門番|こうもんばん} の マツ に 、 {閘門|こうもん} を {開|あ}けて もらおう 。', 'Ask Matsu, the lock-keeper, to open the lock (her house is at the east end of the Long Canal).'),
      T('{閘門|こうもん} の {下|した} 、 {地下|ちか} の {水路|すいろ} を {進|すす}んで 、 {一番|いちばん} の {橋|はし} を {探|さが}そう 。', 'Go down through the lock into the Undercroft and find the first bridge.'),
      T('{橋|はし} の {名前|なまえ} が {戻|もど}った 。 {札場|ふだば} の セン に {伝|つた}えよう 。', 'The bridge has its name back. Tell Sen at the Tally Exchange.'),
    ],
    reward: { flags: ['mb_main_done'] },
  };
  C.quests.mb_census = {
    chapter: 'mb1',
    title: T('{橋|はし} の {名前|なまえ} {調|しら}べ', 'The Bridge-Name Census'),
    stages: [
      Object.assign(T('{白|しろ}く なった {橋|はし} の {札|ふだ} の {名前|なまえ} を 、 {周|まわ}り の {人|ひと} や {札|ふだ} から {探|さが}して 、 セン に {伝|つた}えよう 。', 'Find the names of the blank plaques from the people and notices around them, and give them to Sen. (Seven bridges here: the pier, the Exchange district and Warehouse Row.)'), { at: [{ map: 'mb.pier' }, { map: 'mb.exchange' }, { map: 'mb.kura' }] }),
      T('{七|なな}つ の {橋|はし} の {名前|なまえ} を セン に {届|とど}けよう 。', 'Take the seven bridges\' names to Sen at the Tally Exchange.'),
    ],
    reward: { items: { mb_bridgemap: 1 } },
  };
  C.quests.mb_noodle = {
    chapter: 'mb1',
    title: T('{二|ふた}つ の {屋台|やたい}', 'The Rival Noodle Stalls'),
    stages: [
      T('まさ{屋|や} と ます{屋|や} 、 {客|きゃく} が {間違|まちが}えない {張|は}り{紙|がみ} を {書|か}こう 。', 'Write each noodle stall a notice its customers can\'t mix up.'),
    ],
    reward: { flags: ['mb_noodle_done'] },
  };
  C.quests.mb_lc = {
    chapter: 'mb1',
    title: T('{失|な}くした {約定書|やくじょうしょ}', 'The Lost Contract'),
    stages: [
      T('ゼンゾウ の {古|ふる}い {運河|うんが} の {図|ず} を 、 {今|いま} の {蔵|くら} の {並|なら}び と {比|くら}べよう 。', 'Compare Zenzō\'s old canal plan with Warehouse Row as it is today.'),
      T('{塗|ぬ}り{込|こ}められた {戸|と} を {開|あ}けて もらおう 。 {荷運|にはこ}び の {力|ちから} が {要|い}る 。', 'Get the walled-up door opened: it will take a porter\'s strength.'),
      T('{見|み}つけた {約定書|やくじょうしょ} を ゼンゾウ に {届|とど}けよう 。', 'Take what you found to Zenzō.'),
    ],
    reward: { flags: ['mb_lc_done'] },
  };

  const it = (id, d) => (C.items[id] = d);
  it('mb_letter', { name: T('{古|ふる}い {手紙|てがみ}', 'A forty-year-old letter'), key: true, desc: 'From the dead-letter office. "To the bridge-keeper of Mu…bi Bridge." The rest of the address has faded.' });
  it('mb_bridgemap', { name: T('{橋|はし} の {刷|す}り{物|もの}', 'A printed bridge map'), desc: 'Sen\'s thanks for the census: the Exchange district and Warehouse Row, every bridge named. Printed in Blockprint Row.' });
  it('mb_contract', { name: T('{約定書|やくじょうしょ}', 'The old agreement'), key: true, desc: 'Found behind a walled-up door: the agreement between Zenzō\'s grandfather and Fujiya, sixty years old.' });
})(RB.content);
