/* Manybridge, Chapter 3: the side content's language (expansion P08; side quests R1 1, 2, 6, 7):
 *  - the Bridge-Name Census: each bridge's name, read back from what is around it (a notice, what people call it,
 *    where it goes), so Sen can write it into the register again and the plaque be cut anew;
 *  - the Rival Noodle Stalls: まさ屋 and ます屋, two signs a kana apart; a notice for each that customers can't mix up;
 *  - Boatman's Riddles: Kansuke's riddles, one at a time, repeatable (a pastime on the Distractions tab);
 *  - the Lost Contract: an old canal plan read against today's row, to find a bricked-up door.
 * Every step has F, E, I and A. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const no = (en) => ({ en });
  const F = (o) => Object.assign({ kind: 'forge' }, o);

  // ---- the Bridge-Name Census: one challenge per bridge -------------------------------------------------------------
  // clue: what tells you the name ({ jp, en }); name: markup ({札橋|ふだばし}); kana: its reading; near: a near-miss name
  // (markup, reading, why); the four profiles: F chooses the kana, E chooses the written name, I writes its reading,
  // A chooses from the clue alone (no English) among three.
  const BRIDGES = {
    minato: { clue: T('The ferry timetable: "Ferry pier, below the Harbour Bridge."', '「{港橋|みなとばし} の {下|した} の {渡|わた}し{場|ば}」'), name: '{港橋|みなとばし}', kana: 'みなとばし', en: 'Harbour Bridge',
      near: ['{札橋|ふだばし}', 'ふだばし', 'The timetable names the bridge above the pier: {港橋|みなとばし}.'], third: ['{中橋|なかばし}', 'なかばし'] },
    fuda: { clue: T('Take: "The one in front of the Tally Exchange. Tally Bridge, what else?"', '「{札場|ふだば} の {前|まえ} の {橋|はし} だ から 、 {札橋|ふだばし} さ 。」'), name: '{札橋|ふだばし}', kana: 'ふだばし', en: 'Tally Bridge',
      near: ['{藤橋|ふじばし}', 'ふじばし', 'Take names it for the Exchange in front of it: {札橋|ふだばし}.'], third: ['{東橋|ひがしばし}', 'ひがしばし'] },
    naka: { clue: T('Uno: "Between the Tally Bridge and the Storehouse Bridge, the one in the middle."', '「{札橋|ふだばし} と {蔵橋|くらばし} の {真|ま}ん{中|なか} に ある から 、 {中橋|なかばし} 。」'), name: '{中橋|なかばし}', kana: 'なかばし', en: 'Middle Bridge',
      near: ['{蔵橋|くらばし}', 'くらばし', 'The Storehouse Bridge is one end; the one in the middle is {中橋|なかばし}.'], third: ['{西橋|にしばし}', 'にしばし'] },
    kura: { clue: T('An old porter\'s tally: "Over the Storehouse Bridge to the warehouses."', '「{蔵橋|くらばし} を {渡|わた}って 、 {蔵|くら} の {並|なら}び へ 。」'), name: '{蔵橋|くらばし}', kana: 'くらばし', en: 'Storehouse Bridge',
      near: ['{中橋|なかばし}', 'なかばし', 'The tally names the bridge to the storehouses: {蔵橋|くらばし}.'], third: ['{港橋|みなとばし}', 'みなとばし'] },
    fuji: { clue: T('Fujiko: "It\'s the bridge Grandmother planted the wisteria by. Wisteria Bridge."', '「{祖母|そぼ} が {藤|ふじ} を {植|う}えた {橋|はし} だ よ 。 {藤橋|ふじばし} 。」'), name: '{藤橋|ふじばし}', kana: 'ふじばし', en: 'Wisteria Bridge',
      near: ['{札橋|ふだばし}', 'ふだばし', 'Fujiko names it for the wisteria: {藤橋|ふじばし}.'], third: ['{東橋|ひがしばし}', 'ひがしばし'] },
    nishi: { clue: T('Kansuke: "Where the Back Canal begins, the west end: the West Bridge."', '「{裏堀|うらぼり} の {西|にし} の {端|はし} の {橋|はし} 。 {西橋|にしばし} だ 。」'), name: '{西橋|にしばし}', kana: 'にしばし', en: 'West Bridge',
      near: ['{東橋|ひがしばし}', 'ひがしばし', '{西|にし} is west; this is the west end.'], third: ['{中橋|なかばし}', 'なかばし'] },
    higashi: { clue: T('Ichi: "The one where the water runs away east. East Bridge!"', '「{水|みず} が {東|ひがし} へ {流|なが}れる {所|ところ} の 、 {東橋|ひがしばし} ！」'), name: '{東橋|ひがしばし}', kana: 'ひがしばし', en: 'East Bridge',
      near: ['{西橋|にしばし}', 'にしばし', 'The water runs east: {東|ひがし}. {東橋|ひがしばし}.'], third: ['{港橋|みなとばし}', 'みなとばし'] },
  };
  C.mbBridges = BRIDGES;
  for (const id in BRIDGES) {
    const b = BRIDGES[id];
    C.challenges['mb.census_' + id] = { title: T('A bridge\'s name: ' + b.en, b.name),
      tiers: {
        F: [{ kind: 'choose', item: 'k:hira', ctx: { jp: b.clue.jp, en: b.clue.en }, prompt: { en: 'What is this bridge called? Choose its name in kana.' },
          options: [{ jp: b.kana, ok: true }, { jp: b.near[1], ok: false, why: no(b.near[2]) }] }],
        E: [{ kind: 'choose', ctx: { jp: b.clue.jp, en: b.clue.en }, prompt: { en: 'What is this bridge called?' },
          options: [{ jp: b.name, ok: true }, { jp: b.near[0], ok: false, why: no(b.near[2]) }, { jp: b.third[0], ok: false, why: no('That is another bridge of the city.') }] }],
        I: [{ kind: 'write', ctx: { jp: b.clue.jp, en: '' }, prompt: { en: 'Write the bridge\'s name for the register, in hiragana.' }, answer: b.kana, accept: [b.kana, b.name.replace(/\{([^|}]+)\|[^}]+\}/g, '$1')], mode: 'reading',
          explain: { jp: b.name, en: b.en + '.' } }],
        A: [{ kind: 'choose', ctx: { jp: b.clue.jp, en: '' }, prompt: { en: 'From what you were told, which name goes into the register?' },
          options: [{ jp: b.name, ok: true }, { jp: b.near[0], ok: false, why: no(b.near[2]) }, { jp: b.third[0], ok: false, why: no('That is another bridge of the city.') }] }],
      } };
  }

  // ---- the Rival Noodle Stalls ------------------------------------------------------------------------------------
  // Each stall's notice tells customers which one it is by what they can see: the colour of the curtain and where
  // it stands. Masa's: red curtain, by the bridge; Masu's: blue curtain, in front of the well.
  const noodle = (who, colour, place, other) => ({
    title: T('A notice for ' + (who === 'masa' ? 'Masa\'s' : 'Masu\'s') + ' stall', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}'),
    tiers: {
      F: [F({ id: 'mb.noodle_' + who + '.F', item: 'g:prt_no', prompt: T('Write ' + (who === 'masa' ? 'Masa\'s' : 'Masu\'s') + ' notice: "the ' + colour.en + ' curtain\'s ' + (who === 'masa' ? 'まさや' : 'ますや') + '".'),
        families: [
          { parts: [colour.kana + ' のれん の', who === 'masa' ? 'まさや' : 'ますや', 'です 。'], ok: true, en: 'This is ' + (who === 'masa' ? 'Masaya' : 'Masuya') + ', the one with the ' + colour.en + ' curtain.' },
          { parts: [other.kana + ' のれん の', who === 'masa' ? 'まさや' : 'ますや', 'です 。'], ok: false, en: 'This is the one with the ' + other.en + ' curtain.', why: { en: 'Its curtain is ' + colour.en + ' (' + colour.kana + ').' } },
        ] })],
      E: [F({ id: 'mb.noodle_' + who + '.E', item: 'g:prt_no', prompt: T('Write ' + (who === 'masa' ? 'Masa\'s' : 'Masu\'s') + ' notice so nobody mixes the stalls up: its curtain is ' + colour.en + ', and it is ' + place.en + '.'),
        families: [
          { parts: [place.jp, 'の', colour.jp + ' のれん が', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}', 'です 。'], ok: true, en: 'The ' + colour.en + ' curtain ' + place.en + ' is ' + (who === 'masa' ? 'Masaya' : 'Masuya') + '.' },
          { parts: [colour.jp + ' のれん が', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}', 'です 。'], ok: true, en: 'The ' + colour.en + ' curtain is ' + (who === 'masa' ? 'Masaya' : 'Masuya') + '.' },
          { parts: [place.jp, 'の', other.jp + ' のれん が', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}', 'です 。'], ok: false, en: 'The ' + other.en + ' curtain ' + place.en + ' is ' + (who === 'masa' ? 'Masaya' : 'Masuya') + '.', why: { en: 'That is the other stall\'s colour.' } },
        ] })],
      I: [F({ id: 'mb.noodle_' + who + '.I', item: 'g:relative_clause', prompt: T('Describe the stall in one phrase before its name: "' + (who === 'masa' ? 'Masaya' : 'Masuya') + ', the one ' + place.en + ' with the ' + colour.en + ' curtain".'),
        families: [
          { parts: [place.jp + ' に ある', colour.jp + ' のれん の', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}'], ok: true, en: (who === 'masa' ? 'Masaya' : 'Masuya') + ', the ' + colour.en + '-curtained one ' + place.en + '.' },
          { parts: [colour.jp + ' のれん の', place.jp + ' に ある', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}'], ok: true, en: (who === 'masa' ? 'Masaya' : 'Masuya') + ', with the ' + colour.en + ' curtain, ' + place.en + '.' },
          { parts: [place.jp + ' に ある', other.jp + ' のれん の', who === 'masa' ? 'まさ{屋|や}' : 'ます{屋|や}'], ok: false, en: 'The ' + other.en + '-curtained one ' + place.en + '.', why: { en: 'Wrong colour: that is the rival\'s.' } },
        ] })],
      A: [F({ id: 'mb.noodle_' + who + '.A', item: 'g:indirectness', prompt: T('Word the notice so it tells customers where to go without running down the stall next door.'),
        families: [
          { parts: [colour.jp + ' のれん が {目印|めじるし} です 。', 'お{間違|まちが}え の ない よう に 。'], ok: true, en: 'Look for the ' + colour.en + ' curtain. So that you don\'t mistake us.' },
          { parts: [colour.jp + ' のれん が {目印|めじるし} です 。', '{隣|となり} の {店|みせ} は まずい です 。'], ok: false, en: 'Look for the ' + colour.en + ' curtain. The shop next door is awful.', why: { en: 'That runs down the rival: the notice should only help people find this stall.' } },
        ] })],
    },
  });
  C.challenges['mb.noodle_masa'] = noodle('masa', { en: 'red', jp: '{赤|あか}い', kana: 'あかい' }, { en: 'by the bridge', jp: '{橋|はし} の そば' }, { en: 'blue', jp: '{青|あお}い', kana: 'あおい' });
  C.challenges['mb.noodle_masu'] = noodle('masu', { en: 'blue', jp: '{青|あお}い', kana: 'あおい' }, { en: 'in front of the well', jp: '{井戸|いど} の {前|まえ}' }, { en: 'red', jp: '{赤|あか}い', kana: 'あかい' });

  // ---- Boatman's Riddles (なぞなぞ) --------------------------------------------------------------------------------
  // Kansuke's riddles, in the order he tells them; the first is about the first bridge (evidence of its name).
  const RIDDLES = [
    { q: T('"I tie bank to bank, and I never come undone. What am I?"', '{岸|きし} と {岸|きし} を {結|むす}んで 、 {決|けっ}して ほどけない もの 、 なあんだ 。'), a: 'むすび', w: ['ほどき', 'Untying is the opposite.'], w2: ['むかし', 'That is "long ago".'], en: 'musubi: a tie, a knot (and the first bridge\'s name begins so)' },
    { q: T('"The more you take away from me, the bigger I get. What am I?"', 'とれば とる ほど 、 {大|おお}きく なる もの 、 なあんだ 。'), a: 'あな', w: ['やま', 'Taking from a mountain makes it smaller.'], w2: ['かわ', 'A river does not grow when you take from it.'], en: 'ana: a hole' },
    { q: T('"It has a mouth but never eats; it has a bed but never sleeps. What is it?"', '{口|くち} が ある のに {食|た}べない 、 {床|とこ} が ある のに {寝|ね}ない もの 、 なあんだ 。'), a: 'かわ', w: ['ふね', 'A boat has no bed.'], w2: ['はし', 'A bridge has no mouth.'], en: 'kawa: a river (its mouth, its bed)' },
    { q: T('"Up it goes and down it comes, and it never moves an inch. What is it?"', '{上|あ}がったり {下|さ}がったり する のに 、 {少|すこ}し も {動|うご}かない もの 、 なあんだ 。'), a: 'かいだん', w: ['ふね', 'A boat moves.'], w2: ['みず', 'Water moves.'], en: 'kaidan: a staircase' },
    { q: T('"It runs and runs but has no legs. What is it?"', '{足|あし} が ない のに 、 ずっと {走|はし}って いる もの 、 なあんだ 。'), a: 'みず', w: ['いぬ', 'A dog has legs.'], w2: ['ふね', 'A boat is rowed; it doesn\'t run by itself.'], en: 'mizu: water (running water)' },
    { q: T('"Everyone has one, and other people use yours more than you do. What is it?"', 'だれ でも {持|も}って いて 、 {自分|じぶん} より {人|ひと} が よく {使|つか}う もの 、 なあんだ 。'), a: 'なまえ', w: ['かさ', 'You use your own umbrella most.'], w2: ['てがみ', 'Not everyone has a letter.'], en: 'namae: your name' },
  ];
  C.mbRiddles = RIDDLES;
  RIDDLES.forEach((r, i) => {
    C.challenges['mb.riddle_' + (i + 1)] = { title: T('Kansuke\'s riddle', 'なぞなぞ'),
      tiers: {
        F: [{ kind: 'choose', item: 'k:hira', ctx: { jp: r.q.jp, en: r.q.en }, prompt: { en: 'What is the answer?' },
          options: [{ jp: r.a, ok: true }, { jp: r.w[0], ok: false, why: no(r.w[1]) }], explain: { jp: r.a, en: r.en } }],
        E: [{ kind: 'choose', ctx: { jp: r.q.jp, en: r.q.en }, prompt: { en: 'What is the answer?' },
          options: [{ jp: r.a, ok: true }, { jp: r.w[0], ok: false, why: no(r.w[1]) }, { jp: r.w2[0], ok: false, why: no(r.w2[1]) }], explain: { jp: r.a, en: r.en } }],
        I: [{ kind: 'write', ctx: { jp: r.q.jp, en: '' }, prompt: { en: 'Answer the riddle in hiragana.' }, answer: r.a, accept: [r.a], mode: 'reading', explain: { jp: r.a, en: r.en } }],
        A: [{ kind: 'write', ctx: { jp: r.q.jp, en: '' }, prompt: { en: 'Answer the riddle in hiragana (no hints).' }, answer: r.a, accept: [r.a], mode: 'reading', explain: { jp: r.a, en: r.en } }],
      } };
  });
  if (RB.pastimes) RB.pastimes.define('mb_riddles', {
    order: 45, title: T('Boatman\'s Riddles', '{船頭|せんどう} の なぞなぞ'), kind: 'game', companion: false,
    venue: T('Kansuke\'s mooring on Warehouse Row, Manybridge.', '{八百橋|やおばし} の {蔵|くら} の {並|なら}び'),
    met: (s) => !!(s && s.flags && s.flags.mb_riddles_met && RB.edition && RB.edition.of(s) >= 2),
    blurb: T('An old boatman who gives directions only in riddles. One at a time, as often as you like.', '{道|みち} を なぞなぞ で {教|おし}える {船頭|せんどう} 。'),
    howto: [T('Talk to Kansuke at his mooring. He tells one riddle at a time.', 'カンスケ に {話|はな}しかける 。'), T('There is no hurry and no penalty: a riddle you miss comes round again.', '{急|いそ}がなくて いい 。')],
    records: (s) => [{ en: 'Riddles solved', value: Math.min(RIDDLES.length, (s.vars && s.vars.mb_riddles) || 0) + ' of ' + RIDDLES.length }],
  });

  // ---- the Exchange's offers (R1, A46/A48): a tally's conditions, and the one that cannot be kept --------------------
  // Sen asks for one of the day's tallies to be checked before it goes up. F reads a deadline in kana, E a deadline and
  // a destination, I a chain of conditions (〜なら・〜たら・〜なければ), A a contract's exception clause.
  C.challenges['mb.offers'] = { title: T('Today\'s tallies', '{今日|きょう} の {札|ふだ}'),
    tiers: {
      F: [{ kind: 'choose', item: 'g:prt_kara_made', ctx: { jp: '「こめ 、 じっぴょう 。 あした まで に 。」', en: 'A tally: "Rice, ten bales. By tomorrow." The barge from the rice fields takes three days.' },
        prompt: { en: 'Which part of the tally can\'t be kept?' },
        options: [{ jp: 'あした まで に', ok: true }, { jp: 'じっぴょう', ok: false, why: no('Ten bales is only how much. The barge takes three days: "by tomorrow" (あした まで に) is what can\'t be kept.') },
          { jp: 'こめ', ok: false, why: no('Rice is only what is sent.') }] }],
      E: [{ kind: 'choose', item: 'g:prt_kara_made', ctx: { jp: '「{干物|ひもの} 、 {百枚|ひゃくまい} 。 {三日|みっか} まで に {藤屋|ふじや} へ 。 {代金|だいきん} は {着|つ}いて から 。」', en: 'Today is the first day of the month. The Saltglass boat takes four days.' },
        prompt: { en: 'Which condition can\'t be kept?' },
        options: [{ jp: '{三日|みっか} まで に', ok: true }, { jp: '{藤屋|ふじや} へ', ok: false, why: no('Fujiya is only where it goes. Four days from the first is the fifth: {三日|みっか} まで に (by the third) is too soon.') },
          { jp: '{代金|だいきん} は {着|つ}いて から', ok: false, why: no('Paying once it arrives is easy to keep.') }] }],
      I: [{ kind: 'choose', item: 'g:cond_tara', ctx: { jp: '「{雨|あめ} なら 、 {舟|ふね} は {出|だ}さない 。 {晴|は}れたら 、 {朝|あさ} {出|だ}す 。 {明日|あした} {着|つ}かなければ 、 {代金|だいきん} は {払|はら}わない 。」', en: '' },
        prompt: { en: 'Tomorrow will be rainy all day, and the trip takes a day. Which line makes this deal impossible to keep?' },
        options: [{ jp: '{明日|あした} {着|つ}かなければ 、 {代金|だいきん} は {払|はら}わない 。', ok: true },
          { jp: '{雨|あめ} なら 、 {舟|ふね} は {出|だ}さない 。', ok: false, why: no('That one is only sensible. But with no boat in the rain, the load cannot arrive tomorrow, and {明日|あした} {着|つ}かなければ makes it unpaid whatever happens.') },
          { jp: '{晴|は}れたら 、 {朝|あさ} {出|だ}す 。', ok: false, why: no('〜たら: if it clears. Tomorrow it won\'t, so this line never comes into force.') }] }],
      A: [{ kind: 'choose', item: 'g:cond_ba', ctx: { jp: '「{特|とく}に {問題|もんだい} が なければ 、 {十日|とおか} {以内|いない} に {納|おさ}める もの と する 。 ただし 、 {運河|うんが} が {使|つか}えない {場合|ばあい} は 、 この {限|かぎ}り で ない 。」', en: '' },
        prompt: { en: 'The Long Canal is closed for repairs all month. What does the tally mean now?' },
        options: [{ en: 'The ten-day promise no longer binds the seller while the canal is closed.', ok: true },
          { en: 'The seller must still deliver within ten days, by road if need be.', ok: false, why: no('ただし … この {限|かぎ}り で ない: "but … this does not apply". With the canal unusable, the ten days do not bind.') },
          { en: 'The buyer must pay at once, before the goods arrive.', ok: false, why: no('The tally says nothing about paying early.') }] }],
    } };

  // ---- the Lost Contract: the old plan against today's row ---------------------------------------------------------
  C.challenges['mb.lc_plan'] = { title: T('The old canal plan', '{古|ふる}い {運河|うんが} の {図|ず}'),
    tiers: {
      F: [{ kind: 'choose', ctx: { jp: '{東橋|ひがしばし} から {三|みっ}つ め の くら 。 いりぐち は うんが の ほう 。', en: 'The old plan: the third storehouse from the East Bridge; its door faces the canal.' }, prompt: { en: 'Today the third storehouse from the East Bridge has no door on the canal side. What does that tell you?' },
        options: [{ en: 'The door was there once, and has been walled up.', ok: true }, { en: 'The plan is about another city.', ok: false, why: no('The plan names the East Bridge and the canal: it is this row.') }] }],
      E: [{ kind: 'choose', ctx: { jp: '{東橋|ひがしばし} から {三|みっ}つ{目|め} の {蔵|くら} 。 {戸|と} は {運河|うんが} の {方|ほう} を {向|む}いて いる 。', en: '' }, prompt: { en: 'Which storehouse does the old plan describe, and which way did its door face?' },
        options: [{ en: 'The third from the East Bridge; its door faced the canal.', ok: true }, { en: 'The third from the West Bridge; its door faced the road.', ok: false, why: no('{東橋|ひがしばし}: the East Bridge. {運河|うんが} の {方|ほう}: towards the canal.') }, { en: 'Three storehouses by the canal, all with doors.', ok: false, why: no('{三|みっ}つ{目|め} is "the third one".') }] }],
      I: [{ kind: 'choose', ctx: { jp: '{東橋|ひがしばし} から {数|かぞ}えて {三|みっ}つ{目|め} の {蔵|くら} は 、 {運河|うんが} に {面|めん}した {戸|と} から {出入|でい}り する こと 。', en: '' }, prompt: { en: 'Today that storehouse\'s canal side is a plain wall with newer plaster. What follows?' },
        options: [{ en: 'Someone walled the door up after the plan was drawn.', ok: true }, { en: 'The storehouse has always been entered from the road.', ok: false, why: no('The plan says its door faced the canal ({運河|うんが} に {面|めん}した {戸|と}).') }, { en: 'The plan counts from the West Bridge.', ok: false, why: no('{東橋|ひがしばし} から {数|かぞ}えて: counting from the East Bridge.') }] }],
      A: [{ kind: 'choose', ctx: { jp: '{東橋|ひがしばし} より {三|みっ}つ{目|め} の {蔵|くら} 、 {運河|うんが} {側|がわ} より {出入|でい}り の こと 。 {右|みぎ} 、 {藤屋|ふじや} と の {約定書|やくじょうしょ} を {納|おさ}める 。', en: '' }, prompt: { en: 'What does the old plan\'s note say is kept there, and how did one enter?' },
        options: [{ en: 'The agreement with Fujiya is kept there; one went in from the canal side.', ok: true }, { en: 'Fujiya\'s rice is kept there; one went in from the road.', ok: false, why: no('{約定書|やくじょうしょ} is a written agreement; {運河|うんが} {側|がわ} より: from the canal side.') }, { en: 'Nothing; the storehouse was given to Fujiya.', ok: false, why: no('{納|おさ}む: it is kept (stored) there.') }] }],
    } };
})(RB.content);
