/* Manybridge, Chapter 3: the people (expansion P08; docs/future/work/P08_MANYBRIDGE.md). A trading house, the porters,
 * the Tally Exchange, the lock under it, and the canal folk. Kansai is the city's own speech, but what they say in
 * the game is standard Japanese, with a few of the city's set phrases that word help explains (F-33); Suzu's own
 * lines have her Kansai versions as everywhere. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // Fujiko: head of Fujiya, the trading house whose shipments keep arriving at the wrong warehouse. Quick, exact and
  // kinder than she sounds; she buys Saltglass fish and Reedwake rice.
  ch('mb_fujiko', {
    name: { en: 'Fujiko', jp: 'フジコ' }, voice: { pitch: 0.92 },
    look: { skin: 1, hair: 'bun', hairColor: 1, cloth: ['#5a5a8a', '#44446a', '#d8c8a0'], shape: 'robe', acc: ['book'] },
    portrait: { eyes: 'narrow', style: 'bun', pins: true, collar: 'high', acc: [], bg: '#2a2c44' },
  });
  // Gonta: a canal porter, big and sheepish. He sent a barge the wrong way on purpose, to hide a crate he dropped.
  ch('mb_gonta', {
    name: { en: 'Gonta', jp: 'ゴンタ' }, voice: { pitch: 0.7 },
    look: { skin: 4, hair: 'shaved', hairColor: 1, cloth: ['#4a6a8a', '#3a5470', '#e8e0cc'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'round', style: 'shaved', acc: ['headband'], bandCol: '#e8e0cc', bg: '#24323e' },
  });
  // Sen: the Tally Exchange's clerk. Reads every notice to the letter, and expects others to.
  ch('mb_sen', {
    name: { en: 'Sen', jp: 'セン' }, voice: { pitch: 1.06 },
    look: { skin: 2, hair: 'bob', hairColor: 0, cloth: ['#2e3a5e', '#222c48', '#ece6d6'], shape: 'coat', acc: ['glasses', 'pencil'] },
    portrait: { eyes: 'soft', style: 'bob', collar: 'high', acc: ['glasses', 'pencil'], bg: '#1e2638' },
  });
  // Heiji: a rice dealer who will not pay for rice he never found.
  ch('mb_heiji', {
    name: { en: 'Heiji', jp: 'ヘイジ' }, voice: { pitch: 0.82 },
    look: { skin: 3, hair: 'short', hairColor: 5, cloth: ['#7a5a3a', '#5e442c', '#d8b070'], shape: 'coat', acc: ['hat'], hatCol: '#5e442c', age: 'old' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['hat'], hatCol: '#5e442c', age: 'old', bg: '#33281e' },
  });
  // Matsu: keeper of the lock under the Exchange. Opens for nobody she does not know.
  ch('mb_matsu', {
    name: { en: 'Matsu', jp: 'マツ' }, voice: { pitch: 0.78 },
    look: { skin: 2, hair: 'wrap', hairColor: 6, cloth: ['#4e5a50', '#3c463e', '#b89a6a'], shape: 'robe', acc: ['lamp'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'wrap', age: 'old', acc: [], bg: '#222a26' },
  });
  // Kansuke: an old boatman who gives directions only in riddles.
  ch('mb_kansuke', {
    name: { en: 'Kansuke', jp: 'カンスケ' }, voice: { pitch: 0.74 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#6a7a6a', '#525e52', '#d8c8a0'], shape: 'tunic', acc: ['hat', 'beard'], hatCol: '#b8a070', age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', beard: '#c8c8c8', acc: ['hat'], hatCol: '#b8a070', age: 'old', bg: '#283028' },
  });
  // Masa and Masu: two noodle stalls, まさ屋 and ます屋, two signs a kana apart.
  ch('mb_masa', {
    name: { en: 'Masa', jp: 'マサ' }, voice: { pitch: 0.86 },
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#e8e2d0', '#c8c0aa', '#8a3a3a'], shape: 'apron', acc: ['headband'], bandCol: '#8a3a3a' },
    portrait: { eyes: 'round', style: 'short', collar: 'apron', acc: ['headband'], bandCol: '#8a3a3a', bg: '#3a2a26' },
  });
  ch('mb_masu', {
    name: { en: 'Masu', jp: 'マス' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'ponytail', hairColor: 2, cloth: ['#e8e2d0', '#c8c0aa', '#3a4e8a'], shape: 'apron', acc: ['headband'], bandCol: '#3a4e8a' },
    portrait: { eyes: 'soft', style: 'ponytail', collar: 'apron', acc: ['headband'], bandCol: '#3a4e8a', bg: '#262c3a' },
  });
  // Yoshi: keeps the dead-letter office under the Exchange, where letters nobody could deliver wait.
  ch('mb_yoshi', {
    name: { en: 'Yoshi', jp: 'ヨシ' }, voice: { pitch: 0.95 },
    look: { skin: 0, hair: 'long', hairColor: 4, cloth: ['#6a5a4a', '#524436', '#c8b490'], shape: 'robe', acc: ['glasses', 'scarf'], scarfCol: '#8a6a4a', age: 'old' },
    portrait: { eyes: 'soft', style: 'long', age: 'old', acc: ['glasses'], bg: '#30281e' },
  });
  // Kayo and her son Ichi, who is lost one night in the canals (and found).
  ch('mb_kayo', {
    name: { en: 'Kayo', jp: 'カヨ' }, voice: { pitch: 1.02 },
    look: { skin: 4, hair: 'braid', hairColor: 1, cloth: ['#8a6a8a', '#6a506a', '#e8d8b8'], shape: 'apron', acc: ['basket'] },
    portrait: { eyes: 'soft', style: 'braid', collar: 'apron', bg: '#33263a' },
  });
  ch('mb_ichi', {
    name: { en: 'Ichi', jp: 'イチ' }, voice: { pitch: 1.25 },
    look: { skin: 4, hair: 'spiky', hairColor: 1, cloth: ['#c8a050', '#a08040', '#6a4a2a'], shape: 'tunic', acc: [], size: 'child' },
    portrait: { eyes: 'round', style: 'spiky', bg: '#3a3020' },
  });
  // Zenzō: owns the oldest warehouse on the row, and is looking for his grandfather's contract.
  ch('mb_zenzo', {
    name: { en: 'Zenzō', jp: 'ゼンゾウ' }, voice: { pitch: 0.76 },
    look: { skin: 1, hair: 'short', hairColor: 6, cloth: ['#5a4a3a', '#46382c', '#c8b490'], shape: 'coat', acc: ['cane', 'glasses'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', acc: ['glasses'], bg: '#2c241c' },
  });
  // the porters and the market, for the city's crowd
  ch('mb_take', {
    name: { en: 'Take', jp: 'タケ' }, voice: { pitch: 0.8 },
    look: { skin: 5, hair: 'short', hairColor: 1, cloth: ['#4a6a8a', '#3a5470', '#e8e0cc'], shape: 'tunic', acc: ['headband'], bandCol: '#4a6a8a' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#4a6a8a', bg: '#24323e' },
  });
  ch('mb_uno', {
    name: { en: 'Uno', jp: 'ウノ' }, voice: { pitch: 1.04 },
    look: { skin: 3, hair: 'bun', hairColor: 2, cloth: ['#8a7a4a', '#6e623a', '#e8e0cc'], shape: 'apron', acc: ['basket'] },
    portrait: { eyes: 'soft', style: 'bun', collar: 'apron', bg: '#36301e' },
  });

  // ---- notebook (the honest label the plan asks for: Manybridge is fictional) -----------------------------------------
  C.notes = C.notes || {};
  C.notes.mb_yaobashi = {
    title: { jp: '{八百橋|やおばし} と いう {名前|なまえ}', en: 'The name "Eight Hundred Bridges"' }, fiction: false,
    jp: '{江戸|えど} {時代|じだい} の {大坂|おおさか} は 、 {橋|はし} が {多|おお}くて 「{八百八橋|はっぴゃくやばし}」 と {呼|よ}ばれた 。 {八百橋|やおばし} は 、 その {呼|よ}び{名|な} を {借|か}りた {作|つく}り{話|ばなし} の {町|まち} 。',
    en: 'Edo-period Osaka had so many bridges that it was nicknamed "the eight hundred and eight bridges" (八百八橋, happyaku-ya-bashi); 八百 means "very many" as much as "eight hundred". Manybridge is a fictional city that borrows the nickname, not a picture of Osaka.',
  };
  C.notes.mb_three_causes = {
    title: { jp: '{米|こめ} の {行方|ゆくえ}', en: 'Where the rice went' }, fiction: true,
    jp: '{札|ふだ} の {条件|じょうけん} の {読|よ}み{違|ちが}い 、 {隠|かく}した {失敗|しっぱい} 、 そして {白|しろ}く なった {橋|はし} の {札|ふだ} 。',
    en: 'Three causes tangled together at the Exchange: a tally\'s condition read two ways ("full" is not "shut"), a porter hiding a mistake, and a blank plaque at the turn. Only the last was the Hush (fiction).',
  };
})(RB.content);
