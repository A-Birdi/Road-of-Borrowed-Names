/* The Cloudroad, Chapter 10: the language tasks of the road (expansion P12). Each station's everlasting lamp is relit
 * by its name, read from the relay's ledger (継ぎ飛脚の帳面: the seven stations in order, from the bottom of the road
 * up) and the place itself: F reads the kana list and counts, E the names in kanji, I what a name says about its place
 * (追分, where the road divides; 馬返し, where the horses turn back), A an old way of writing the reason (〜なれば,
 * labelled classical and never needed to go on). The reports and the relay's messages are in 31_reports.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  // the seven stations: the name in kana and in kanji, what it says about the place, and what the place looks like
  const ST = [
    { n: 1, kana: 'おいわけ', kanji: '{追分|おいわけ}', word: '追分', means: T('{道|みち} が {二|ふた}つ に {分|わ}かれる {所|ところ}', 'where the road divides'), sees: T('{灯|ひ} の {道|みち} と {古|ふる}い {街道|かいどう} が 、 ここ で {分|わ}かれる 。', 'The Lantern Road and the old highway part here.') },
    { n: 2, kana: 'すぎのき', kanji: '{杉|すぎ}ノ{木|き}', word: '杉', means: T('{大|おお}きな {杉|すぎ} の {木|き}', 'the great cedar'), sees: T('{宿場|しゅくば} の {真|ま}ん{中|なか} に 、 {大|おお}きな {杉|すぎ} が {立|た}って いる 。', 'A great cedar stands in the middle of the station.') },
    { n: 3, kana: 'さかした', kanji: '{坂下|さかした}', word: '坂下', means: T('{坂|さか} の {下|した}', 'the foot of the slope'), sees: T('{宿場|しゅくば} の {上|うえ} から 、 {長|なが}い {坂|さか} が {始|はじ}まる 。', 'A long slope begins above the station.') },
    { n: 4, kana: 'なかやま', kanji: '{中山|なかやま}', word: '中山', means: T('{山|やま} の {中|なか}ほど', 'halfway up the mountain'), sees: T('{麓|ふもと} と {峠|とうげ} の 、 ちょうど {真|ま}ん{中|なか} だ 。', 'Exactly halfway between the foot of the mountain and the pass.') },
    { n: 5, kana: 'うまがえし', kanji: '{馬返|うまがえ}し', word: '馬返し', means: T('{馬|うま} が {引|ひ}き{返|かえ}す {所|ところ}', 'where the horses turn back'), sees: T('ここ から {先|さき} は {道|みち} が {険|けわ}しく 、 {馬|うま} は {登|のぼ}れない 。', 'Beyond here the road is too steep for horses.') },
    { n: 6, kana: 'きりした', kanji: '{霧下|きりした}', word: '霧下', means: T('{霧|きり} の {下|した}', 'below the mist'), sees: T('{関所|せきしょ} の ある {辺|あた}り は 、 いつも {霧|きり} の {中|なか} だ 。 ここ は その {下|した} 。', 'Up by the checkpoint it is always misty. This is just below it.') },
    { n: 7, kana: 'くもい', kanji: '{雲居|くもい}', word: '雲居', means: T('{雲|くも} の ある {所|ところ}', 'where the clouds are'), sees: T('{雲|くも} が {足|あし}の{下|した} に ある 。', 'The clouds are below your feet.') },
  ];
  const ledgerKana = ST.map((s) => s.n + ' ' + s.kana).join(' 、 ');
  const ledgerKanji = ST.map((s) => s.kanji).join(' 、 ');
  const ORD = ['', 'いちばん め', 'にばん め', 'さんばん め', 'よんばん め', 'ごばん め', 'ろくばん め', 'ななばん め'];
  const ORDK = ['', '{一番目|いちばんめ}', '{二番目|にばんめ}', '{三番目|さんばんめ}', '{四番目|よんばんめ}', '{五番目|ごばんめ}', '{六番目|ろくばんめ}', '{七番目|ななばんめ}'];
  const near = (n) => [n - 1, n + 1].filter((k) => k >= 1 && k <= 7).concat(n === 1 ? [3] : n === 7 ? [5] : []).slice(0, 2).map((k) => ST[k - 1]);
  for (const s of ST) {
    const others = near(s.n);
    C.challenges['cr.name' + s.n] = { title: T(s.kanji + ' の {常夜灯|じょうやとう}', 'The lamp at station ' + s.n), tiers: {
      F: [ch({ item: 'v:' + s.word, ctx: { jp: 'ちょうめん ： 「' + ledgerKana + '」 （した から じゅんばん に） 。 ここ は ' + ORD[s.n] + ' の しゅく 。', en: '' }, prompt: { en: 'The ledger lists the stations from the bottom of the road up. This is station ' + s.n + '. What is its name?' }, options: [o(s.kana, 1)].concat(others.map((x) => o(x.kana, 0, 'That is station ' + x.n + ' on the ledger; this is station ' + s.n + '.'))) })],
      E: [ch({ item: 'v:' + s.word, ctx: { jp: '{帳面|ちょうめん} ： 「' + ledgerKanji + '」 。 {下|した} から {順|じゅん} に {書|か}いて ある 。 ここ は ' + ORDK[s.n] + ' の {宿|しゅく} だ 。', en: '' }, prompt: { en: 'This is station ' + s.n + ' from the bottom. Which name is it?' }, options: [o(s.kanji, 1)].concat(others.map((x) => o(x.kanji, 0, 'The ledger counts from the bottom: ' + x.word + ' is station ' + x.n + '.'))) })],
      I: [ch({ item: 'v:' + s.word, ctx: { jp: s.sees.jp + ' {帳面|ちょうめん} の {名前|なまえ} は 、 どれ も {場所|ばしょ} の {様子|ようす} を {表|あらわ}して いる 。', en: '' }, prompt: { en: 'Which name fits this place? (' + s.sees.en + ')' }, options: [o(s.kanji + ' （' + s.means.jp + '）', 1)].concat(others.map((x) => o(x.kanji + ' （' + x.means.jp + '）', 0, x.word + ' means "' + x.means.en + '": that is not this place.'))) })],
      A: [ch({ item: 'v:' + s.word, ctx: { jp: '{台|だい} の {字|じ} ： 「{此処|ここ} 、 ' + s.means.jp + ' なれば 、 □□ と {云|い}ふ 。」 （{古|ふる}い {書|か}き{方|かた}）', en: '' }, prompt: { en: 'On the lamp\'s base, in an old style (optional): "This place being ' + s.means.en + ', it is called …". Which name?' }, options: [o(s.kanji, 1)].concat(others.map((x) => o(x.kanji, 0, 'なれば gives the reason: "since it is ' + s.means.en + '". That is ' + s.word + ', not ' + x.word + '.'))) })],
    } };
  }
  C.cloudroad = C.cloudroad || {};
  C.cloudroad.ST = ST;
})(RB.content);
