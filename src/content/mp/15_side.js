/* Manybridge, Chapter 4: the side content's language (expansion P09; R1 side quests 1, 3, 4, 7):
 *  - the Bridge-Name Census, continued: Blockprint and Playhouse Rows' three plaques (C.mbCensus, src/content/mb/15_side.js);
 *  - more of Kansuke's riddles (printing and the theatre), 7 to 10, once Chapter 4 has begun;
 *  - A Ghostwriter's Debt: the manuscript's date read against the printed book's (the evidence);
 *  - The Apprentice Printer (A39): the player explains how type is set, and why, and Miyo sets it.
 * Every step has F, E, I and A. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const no = (en) => ({ en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);

  // ---- the census, continued ----------------------------------------------------------------------------------------
  const BRIDGES = {
    hangi: { clue: T('Kanta: "It\'s in front of the master\'s workshop. The blocks go over it. Woodblock Bridge!"', '「{親方|おやかた} の {仕事場|しごとば} の {前|まえ} の {橋|はし} 。 {版木|はんぎ} を {運|はこ}ぶ から 、 {版木橋|はんぎばし} ！」'), name: '{版木橋|はんぎばし}', kana: 'はんぎばし', en: 'Woodblock Bridge',
      near: ['{墨橋|すみばし}', 'すみばし', 'Kanta names it for the woodblocks carried over it: {版木橋|はんぎばし}.'], third: ['{幕橋|まくばし}', 'まくばし'] },
    sumi: { clue: T('Hayate: "The ink-makers wash their brushes under it, so the water\'s black. Ink Bridge."', '「{墨屋|すみや} が {下|した} で {筆|ふで} を {洗|あら}う から 、 {水|みず} が {黒|くろ}い 。 {墨橋|すみばし} だ 。」'), name: '{墨橋|すみばし}', kana: 'すみばし', en: 'Ink Bridge',
      near: ['{版木橋|はんぎばし}', 'はんぎばし', 'The water under it is black with ink: {墨|すみ}. {墨橋|すみばし}.'], third: ['{中橋|なかばし}', 'なかばし'] },
    maku: { clue: T('Hayashi: "They wash the theatre\'s curtain and hang it on this bridge to dry. Curtain Bridge, see?"', '「{芝居小屋|しばいごや} の {幕|まく} を {洗|あら}って 、 この {橋|はし} に {干|ほ}す ん だ 。 だから {幕橋|まくばし} 。」'), name: '{幕橋|まくばし}', kana: 'まくばし', en: 'Curtain Bridge',
      near: ['{墨橋|すみばし}', 'すみばし', 'The theatre\'s curtain is dried on it: {幕|まく}. {幕橋|まくばし}.'], third: ['{版木橋|はんぎばし}', 'はんぎばし'] },
  };
  C.mpBridges = BRIDGES;
  if (C.mbCensus) for (const id in BRIDGES) C.mbCensus(id, BRIDGES[id]);

  // ---- Kansuke's new riddles (he promised new ones) --------------------------------------------------------------
  const MORE = [
    { q: T('"I stand backwards, and print the letters the right way round. What am I?"', '{逆|さか}さま に {立|た}って 、 {正|ただ}しい {字|じ} を {刷|す}る もの 、 なあんだ 。'), a: 'かつじ', w: ['かがみ', 'A mirror shows things backwards, but nothing is printed from it.'], w2: ['ほん', 'A book is printed; it does not print.'], en: 'katsuji: movable type (each letter cast backwards)' },
    { q: T('"The more I write, the shorter I get. What am I?"', '{書|か}けば {書|か}く ほど 、 {短|みじか}く なる もの 、 なあんだ 。'), a: 'えんぴつ', w: ['ふで', 'A brush does not get shorter as it writes.'], w2: ['かみ', 'Paper does not write.'], en: 'enpitsu: a pencil' },
    { q: T('"In the theatre everyone can see me, and nobody looks. I wear black. What am I?"', '{芝居|しばい} で 、 みんな に {見|み}えて いる のに 、 だれ も {見|み}ない もの 、 なあんだ 。 {黒|くろ}い {服|ふく} を {着|き}て いる よ 。'), a: 'くろこ', w: ['やくしゃ', 'Everyone looks at the actors.'], w2: ['まく', 'The curtain is not dressed in black.'], en: 'kuroko: the stagehands in black, who by convention are not there' },
    { q: T('"When I open, everyone falls quiet; when I close, everyone claps. What am I?"', '{開|ひら}く と みんな {静|しず}か に なって 、 {閉|し}まる と みんな {手|て} を {叩|たた}く もの 、 なあんだ 。'), a: 'まく', w: ['と', 'Nobody claps when a door shuts.'], w2: ['かさ', 'Nobody falls quiet for an umbrella.'], en: 'maku: the theatre curtain' },
  ];
  const RIDDLES = C.mbRiddles || [];
  const at = RIDDLES.length;
  MORE.forEach((r, k) => {
    const i = at + k;
    RIDDLES.push(r);
    C.challenges['mb.riddle_' + (i + 1)] = { title: T('Kansuke\'s riddle', 'なぞなぞ'),
      tiers: {
        F: [ch({ item: 'k:hira', ctx: { jp: r.q.jp, en: r.q.en }, prompt: { en: 'What is the answer?' }, options: [{ jp: r.a, ok: true }, { jp: r.w[0], ok: false, why: no(r.w[1]) }], explain: { jp: r.a, en: r.en } })],
        E: [ch({ ctx: { jp: r.q.jp, en: r.q.en }, prompt: { en: 'What is the answer?' }, options: [{ jp: r.a, ok: true }, { jp: r.w[0], ok: false, why: no(r.w[1]) }, { jp: r.w2[0], ok: false, why: no(r.w2[1]) }], explain: { jp: r.a, en: r.en } })],
        I: [{ kind: 'write', ctx: { jp: r.q.jp, en: '' }, prompt: { en: 'Answer the riddle in hiragana.' }, answer: r.a, accept: [r.a], mode: 'reading', explain: { jp: r.a, en: r.en } }],
        A: [{ kind: 'write', ctx: { jp: r.q.jp, en: '' }, prompt: { en: 'Answer the riddle in hiragana (no hints).' }, answer: r.a, accept: [r.a], mode: 'reading', explain: { jp: r.a, en: r.en } }],
      } };
  });

  // ---- A Ghostwriter's Debt: the manuscript's date ----------------------------------------------------------------
  // Shinobu's draft, in her hand, is dated in the spring; Ryūsui's printed book came out in the summer.
  C.challenges['mp.ghost_date'] = { title: T('The manuscript\'s date', '{原稿|げんこう} の {日付|ひづけ}'),
    tiers: {
      F: [ch({ item: 'k:hira', ctx: { jp: 'げんこう ： はる 。 ほん ： なつ 。', en: 'On the manuscript, in Shinobu\'s hand: はる. In the printed book: なつ.' }, prompt: { en: 'Which came first?' },
        options: [{ jp: 'げんこう', ok: true }, { jp: 'ほん', ok: false, why: no('はる (spring) comes before なつ (summer): the manuscript came first.') }] })],
      E: [ch({ item: 'v:春', ctx: { jp: '{原稿|げんこう} の {日付|ひづけ} ： {春|はる} 。 {本|ほん} の {日付|ひづけ} ： {夏|なつ} 。', en: 'The manuscript and the printed book, side by side.' }, prompt: { en: 'What do the dates show?' },
        options: [{ jp: '{原稿|げんこう} の ほう が {先|さき} です 。', ok: true }, { jp: '{本|ほん} の ほう が {先|さき} です 。', ok: false, why: no('{春|はる} (spring) comes before {夏|なつ} (summer).') }, { jp: '{同|おな}じ {日|ひ} です 。', ok: false, why: no('Two different seasons.') }] })],
      I: [ch({ item: 'g:mae_ato', ctx: { jp: '{原稿|げんこう} は {春|はる} に {書|か}かれた 。 {本|ほん} は {夏|なつ} に {出|で}た 。', en: '' }, prompt: { en: 'Which sentence states what the dates prove?' },
        options: [{ jp: '{本|ほん} が {出|で}る {前|まえ} に 、 シノブ さん は もう {書|か}いて いた 。', ok: true }, { jp: '{本|ほん} が {出|で}た {後|あと} で 、 シノブ さん が {書|か}き{写|うつ}した 。', ok: false, why: no('That is what Ryūsui would like it to mean: the dates say the opposite.') }, { jp: '{本|ほん} と {原稿|げんこう} は 、 {同|おな}じ {日|ひ} に できた 。', ok: false, why: no('Spring and summer are not the same day.') }] })],
      A: [ch({ item: 'g:hazu', ctx: { jp: '{原稿|げんこう} は {春|はる} の {日付|ひづけ} で 、 シノブ の {字|じ} 。 {本|ほん} は {夏|なつ} 、 リュウスイ の {名前|なまえ} で {出|で}た 。', en: '' }, prompt: { en: 'Which conclusion does the evidence support, and no more?' },
        options: [{ jp: '{少|すく}なくとも 、 {本|ほん} より {先|さき} に シノブ さん の {原稿|げんこう} が あった はず だ 。', ok: true }, { jp: 'リュウスイ さん は 、 {一行|いちぎょう} も {書|か}けない はず だ 。', ok: false, why: no('The dates prove the order, not what Ryūsui can or cannot write.') }, { jp: 'シノブ さん が 、 リュウスイ さん の {本|ほん} を {写|うつ}した はず だ 。', ok: false, why: no('The manuscript is older than the book: it cannot be a copy of it.') }] })],
    } };

  // ---- The Apprentice Printer (A39): you explain, Miyo sets ----------------------------------------------------------
  C.challenges['mp.miyo_teach'] = { title: T('Showing Miyo how type is set', '{活字|かつじ} の {組|く}み{方|かた}'),
    tiers: {
      F: [ch({ item: 'g:v_te_kudasai', prompt: { en: 'Tell Miyo the steps in order: first pick out the type, next line it up, last print.' },
        options: [{ jp: 'まず 、 かつじ を えらんで ください 。 つぎ に 、 ならべて ください 。 さいご に 、 すって ください 。', ok: true },
          { jp: 'まず 、 すって ください 。 つぎ に 、 かつじ を えらんで ください 。', ok: false, why: no('Printing comes last: the type has to be chosen and set first.') }] })],
      E: [ch({ item: 'g:conj_kara', prompt: { en: 'Miyo asks why the type is set backwards. Explain.' },
        options: [{ jp: '{活字|かつじ} は {逆|さか}さま に {並|なら}べます 。 {刷|す}る と 、 {正|ただ}しく なります から 。', ok: true },
          { jp: '{活字|かつじ} は {逆|さか}さま に {並|なら}べます 。 {読|よ}みにくい です から 。', ok: false, why: no('That gives a reason against it. It is set backwards because printing turns it the right way round.') },
          { jp: '{活字|かつじ} は {正|ただ}しく {並|なら}べます 。 {刷|す}る と 、 {逆|さか}さま に なります から 。', ok: false, why: no('Set the right way round, it would print backwards.') }] })],
      I: [ch({ item: 'g:te_oku', prompt: { en: 'Explain to Miyo why a proof is pulled before the real printing.' },
        options: [{ jp: '{刷|す}る {前|まえ} に 、 {一枚|いちまい} {試|ため}し に {刷|す}って おいて ください 。 {間違|まちが}い が あって も 、 {直|なお}せます から 。', ok: true },
          { jp: '{刷|す}った {後|あと} で 、 {一枚|いちまい} {試|ため}し に {刷|す}って ください 。 {間違|まちが}い は {直|なお}せません から 。', ok: false, why: no('A proof after the printing is too late: that is the point of pulling it first.') },
          { jp: '{刷|す}る {前|まえ} に 、 {全部|ぜんぶ} {刷|す}って おいて ください 。 {間違|まちが}い が あって も 、 {直|なお}せます から 。', ok: false, why: no('Printing everything first is not a proof: one sheet is.') }] })],
      A: [ch({ item: 'g:you_ni_suru', prompt: { en: 'Explain the spacing rule so that it says what it is for.' },
        options: [{ jp: '{読|よ}む {人|ひと} が {迷|まよ}わない よう に 、 {行|ぎょう} の {間|あいだ} を {揃|そろ}えて おく ん だ よ 。', ok: true },
          { jp: '{読|よ}む {人|ひと} が {迷|まよ}う よう に 、 {行|ぎょう} の {間|あいだ} を {揃|そろ}えて おく ん だ よ 。', ok: false, why: no('That says the spacing is there to confuse the reader.') },
          { jp: '{読|よ}む {人|ひと} が {迷|まよ}わない よう に 、 {行|ぎょう} の {間|あいだ} を {変|か}えて おく ん だ よ 。', ok: false, why: no('Changing the spacing line to line is what would lose a reader: keep it even.') }] })],
    } };
})(RB.content);
