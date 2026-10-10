/* Manybridge, Chapter 3: barge routing (expansion P08; plan R1 "Route goods and people by saying who sends what to
 * whom"; 05_LANGUAGE.md L9). The porters' canal table: say who sends what to whom, by which way, and the barge goes
 * where the sentence sends it, right or wrong (src/ui/89e_canal.js shows it; the judging is the forge step's own).
 * Several plans are accepted where Japanese has several (に, へ and まで for where it goes; either order).
 *
 * The canal map below is the porters' painted board: the Long Canal across, the Cross Canal from the north (Fujiya's
 * dock on it), the harbour canal south to the pier, and the channel to the Back Canal and Warehouse Row in the east. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  const ok = (parts, en, result, o) => Object.assign({ parts, ok: true, en, result }, o || {});
  const no = (parts, en, why, result) => ({ parts, ok: false, en, why: { en: why }, result });

  // ---- the porters' canal board ------------------------------------------------------------------------------------
  C.canals = C.canals || {};
  const LONG = 37, CROSS = 65, BACK = 54.5, CHAN = 98.5, HARB = 50;
  const toLong = [[CROSS, 22], [CROSS, LONG]];
  C.canals['mb.canal_city'] = {
    vb: [120, 72],
    water: [[0, 34, 104, 6], [62, 0, 6, 34], [96, 40, 5, 12], [84, 52, 36, 5], [47, 40, 6, 32]],
    bridges: [
      { id: 'fuda', x: 22, y: 33, w: 3, h: 8, name: T('Tally Bridge', '{札橋|ふだばし}') },
      { id: 'naka', x: 40, y: 33, w: 3, h: 8, name: T('Middle Bridge', '{中橋|なかばし}') },
      { id: 'kura', x: 82, y: 33, w: 3, h: 8, name: T('Storehouse Bridge', '{蔵橋|くらばし}') },
      { id: 'fuji', x: 61, y: 12, w: 8, h: 3, name: T('Wisteria Bridge', '{藤橋|ふじばし}') },
      { id: 'nishi', x: 92, y: 51, w: 3, h: 7, name: T('West Bridge', '{西橋|にしばし}') },
      { id: 'higashi', x: 110, y: 51, w: 3, h: 7, name: T('East Bridge', '{東橋|ひがしばし}') },
      { id: 'minato', x: 46, y: 60, w: 8, h: 3, name: T('Harbour Bridge', '{港橋|みなとばし}') },
    ],
    places: {
      fujiya: { x: 74, y: 22, jp: '{藤屋|ふじや}', en: 'Fujiya' },
      tally: { x: 36, y: 24, jp: '{札場|ふだば}', en: 'the Tally Exchange' },
      inn: { x: 12, y: 48, jp: '{川屋|かわや}', en: 'Kawaya, the inn' },
      heiji_w: { x: 90, y: 64, jp: 'ヘイジ の {西|にし} の {蔵|くら}', en: 'Heiji\'s west storehouse' },
      heiji_e: { x: 108, y: 64, jp: 'ヘイジ の {東|ひがし} の {蔵|くら}', en: 'Heiji\'s east storehouse' },
      pier: { x: 62, y: 66, jp: '{渡|わた}し{場|ば}', en: 'the ferry pier' },
    },
    start: 'fujiya',
    routes: {
      heiji_w: { path: toLong.concat([[CHAN, LONG], [CHAN, BACK], [90, BACK]]), to: 'heiji_w', say: { en: 'The barge ties up at Heiji\'s west storehouse.' } },
      heiji_e: { path: toLong.concat([[CHAN, LONG], [CHAN, BACK], [108, BACK]]), to: 'heiji_e', say: { en: 'The barge ties up at Heiji\'s east storehouse — the other one.' } },
      fetch: { path: toLong.concat([[CHAN, LONG], [CHAN, BACK], [90, BACK], [CHAN, BACK], [CHAN, LONG], [CROSS, LONG], [CROSS, 22]]), to: 'fujiya', say: { en: 'The barge goes to Heiji\'s to fetch rice from there, finds none, and comes back to Fujiya with Fujiya\'s rice still aboard.' } },
      inn: { path: toLong.concat([[12, LONG]]), to: 'inn', say: { en: 'The barge ties up below Kawaya; the cook comes down for the fish.' } },
      tally: { path: toLong.concat([[36, LONG]]), to: 'tally', say: { en: 'The barge ties up below the Tally Exchange. Nobody there wants a load of fish.' } },
      pier: { path: toLong.concat([[HARB, LONG], [HARB, 66]]), to: 'pier', say: { en: 'The barge goes down to the ferry pier, and the fish nearly go back to Saltglass.' } },
      linger: { path: toLong.concat([[12, LONG]]), to: 'inn', say: { en: 'The barge reaches Kawaya and the porter stands about on the quay, delivering nothing, until dusk.' } },
      stay: { path: [[CROSS, 22]], to: 'fujiya', say: { en: 'The barge stays at Fujiya\'s dock: the porter waits for word that is never coming.' } },
    },
  };

  // ---- job 1: Fujiya's rice to Heiji's west storehouse ------------------------------------------------------------
  C.challenges['mb.route1'] = { title: T('Send the rice', '{米|こめ} を {送|おく}る'),
    tiers: {
      F: [F({ id: 'mb.route1.F', canal: 'mb.canal_city', item: 'g:prt_kara_made',
        prompt: T('Send Fujiya\'s rice to Heiji\'s west storehouse (にし の くら): "from Fujiya, to Heiji\'s west storehouse, rice, send."'),
        families: [
          ok(['ふじや から', 'ヘイジ さん の にし の くら に', 'こめ を', 'おくります 。'], 'From Fujiya, I send rice to Heiji\'s west storehouse.', 'heiji_w'),
          ok(['ふじや から', 'ヘイジ さん の にし の くら まで', 'こめ を', 'おくります 。'], 'From Fujiya, I send rice as far as Heiji\'s west storehouse.', 'heiji_w'),
          no(['ふじや から', 'ヘイジ さん の ひがし の くら に', 'こめ を', 'おくります 。'], 'From Fujiya, I send rice to Heiji\'s east storehouse.', 'ひがし is east; the west storehouse is にし.', 'heiji_e'),
          no(['ヘイジ さん の にし の くら から', 'ふじや に', 'こめ を', 'おくります 。'], 'From Heiji\'s west storehouse, I send rice to Fujiya.', 'から marks where it starts, に where it goes: that sends it the other way.', 'fetch'),
        ] })],
      E: [F({ id: 'mb.route1.E', canal: 'mb.canal_city', item: 'g:prt_kara_made',
        prompt: T('Fujiko wants her rice sent from Fujiya to Heiji\'s west storehouse. Tell the porter.'),
        families: [
          ok(['{藤屋|ふじや} から', 'ヘイジ さん の {西|にし} の {蔵|くら} まで', '{米|こめ} を', '{送|おく}って ください 。'], 'Please send the rice from Fujiya to Heiji\'s west storehouse.', 'heiji_w'),
          ok(['{藤屋|ふじや} から', 'ヘイジ さん の {西|にし} の {蔵|くら} に', '{米|こめ} を', '{送|おく}って ください 。'], 'Please send the rice from Fujiya to Heiji\'s west storehouse.', 'heiji_w'),
          ok(['{藤屋|ふじや} から', 'ヘイジ さん の {西|にし} の {蔵|くら} へ', '{米|こめ} を', '{送|おく}って ください 。'], 'Please send the rice from Fujiya towards Heiji\'s west storehouse.', 'heiji_w'),
          no(['ヘイジ さん の {西|にし} の {蔵|くら} から', '{藤屋|ふじや} まで', '{米|こめ} を', '{送|おく}って ください 。'], 'Please send the rice from Heiji\'s west storehouse to Fujiya.', 'から is where it starts and まで where it goes: swapped, the barge goes to Heiji\'s to fetch rice.', 'fetch'),
          no(['{藤屋|ふじや} から', 'ヘイジ さん の {東|ひがし} の {蔵|くら} まで', '{米|こめ} を', '{送|おく}って ください 。'], 'Please send the rice from Fujiya to Heiji\'s east storehouse.', '{東|ひがし} is east; Fujiko asked for the west storehouse, {西|にし}.', 'heiji_e'),
        ] })],
      I: [F({ id: 'mb.route1.I', canal: 'mb.canal_city', item: 'g:prt_kara_made',
        prompt: T('Tell the porter to take the rice from Fujiya, under the Storehouse Bridge ({蔵橋|くらばし}), to Heiji\'s west storehouse.'),
        families: [
          ok(['{藤屋|ふじや} から', '{蔵橋|くらばし} の {下|した} を {通|とお}って', 'ヘイジ さん の {西|にし} の {蔵|くら} まで', '{米|こめ} を {運|はこ}んで ください 。'], 'Please carry the rice from Fujiya, under the Storehouse Bridge, to Heiji\'s west storehouse.', 'heiji_w'),
          ok(['{蔵橋|くらばし} の {下|した} を {通|とお}って', '{藤屋|ふじや} から', 'ヘイジ さん の {西|にし} の {蔵|くら} まで', '{米|こめ} を {運|はこ}んで ください 。'], 'Going under the Storehouse Bridge, please carry the rice from Fujiya to Heiji\'s west storehouse.', 'heiji_w'),
          no(['{藤屋|ふじや} から', '{蔵橋|くらばし} の {下|した} を {通|とお}って', 'ヘイジ さん の {東|ひがし} の {蔵|くら} まで', '{米|こめ} を {運|はこ}んで ください 。'], 'Please carry the rice from Fujiya, under the Storehouse Bridge, to Heiji\'s east storehouse.', 'That names the east storehouse ({東|ひがし}); Fujiko wants the west ({西|にし}).', 'heiji_e'),
          no(['ヘイジ さん の {西|にし} の {蔵|くら} から', '{蔵橋|くらばし} の {下|した} を {通|とお}って', '{藤屋|ふじや} まで', '{米|こめ} を {運|はこ}んで ください 。'], 'Please carry the rice from Heiji\'s west storehouse, under the Storehouse Bridge, to Fujiya.', 'から and まで are the wrong way round: that brings rice from Heiji\'s.', 'fetch'),
        ] })],
      A: [F({ id: 'mb.route1.A', canal: 'mb.canal_city', item: 'g:cond_ba',
        prompt: T('Fujiko: "Send it to the west storehouse, unless Heiji\'s people say otherwise." Pass it on so the barge leaves now.'),
        families: [
          ok(['ヘイジ さん の {方|ほう} から', '{特|とく}に {指示|しじ} が なければ', '{西|にし} の {蔵|くら} に', '{届|とど}けて ください 。'], 'Unless Heiji\'s side says otherwise, please deliver it to the west storehouse.', 'heiji_w'),
          ok(['{特|とく}に {指示|しじ} が なければ', 'ヘイジ さん の {西|にし} の {蔵|くら} に', '{届|とど}けて ください 。'], 'Unless there are other instructions, please deliver it to Heiji\'s west storehouse.', 'heiji_w'),
          no(['ヘイジ さん の {方|ほう} から', '{指示|しじ} が あれば', '{西|にし} の {蔵|くら} に', '{届|とど}けて ください 。'], 'If Heiji\'s side gives instructions, please deliver it to the west storehouse.', 'あれば makes the instructions the condition for going at all: the porter waits for them. なければ (unless there are any) lets the barge go now.', 'stay'),
          no(['ヘイジ さん の {方|ほう} から', '{特|とく}に {指示|しじ} が なければ', '{東|ひがし} の {蔵|くら} に', '{届|とど}けて ください 。'], 'Unless Heiji\'s side says otherwise, please deliver it to the east storehouse.', 'Fujiko said the west storehouse ({西|にし}).', 'heiji_e'),
        ] })],
    },
  };

  // ---- job 2: Saltglass fish for Kawaya, the inn -------------------------------------------------------------------
  C.challenges['mb.route2'] = { title: T('Fish for the inn', '{川屋|かわや} の {魚|さかな}'),
    tiers: {
      F: [F({ id: 'mb.route2.F', canal: 'mb.canal_city', item: 'g:prt_ni',
        prompt: T('Send the dried fish to Kawaya, the inn (かわや).'),
        families: [
          ok(['かわや に', 'さかな を', 'おくります 。'], 'I send fish to Kawaya.', 'inn'),
          ok(['かわや へ', 'さかな を', 'おくります 。'], 'I send fish towards Kawaya.', 'inn'),
          no(['ふだば に', 'さかな を', 'おくります 。'], 'I send fish to the Tally Exchange.', 'ふだば is the Tally Exchange; the inn is かわや.', 'tally'),
        ] })],
      E: [F({ id: 'mb.route2.E', canal: 'mb.canal_city', item: 'g:prt_he',
        prompt: T('The dried fish from Saltglass are for Kawaya, the inn. Tell the porter.'),
        families: [
          ok(['{潮硝子|しおがらす} の {干物|ひもの} を', '{川屋|かわや} に', '{届|とど}けて ください 。'], 'Please deliver the Saltglass dried fish to Kawaya.', 'inn'),
          ok(['{潮硝子|しおがらす} の {干物|ひもの} を', '{川屋|かわや} へ', '{届|とど}けて ください 。'], 'Please take the Saltglass dried fish to Kawaya.', 'inn'),
          ok(['{川屋|かわや} に', '{潮硝子|しおがらす} の {干物|ひもの} を', '{届|とど}けて ください 。'], 'To Kawaya, please deliver the Saltglass dried fish.', 'inn'),
          no(['{潮硝子|しおがらす} の {干物|ひもの} を', '{札場|ふだば} に', '{届|とど}けて ください 。'], 'Please deliver the Saltglass dried fish to the Tally Exchange.', '{札場|ふだば} is the Tally Exchange; the inn is {川屋|かわや}.', 'tally'),
          no(['{潮硝子|しおがらす} に', '{干物|ひもの} を', '{届|とど}けて ください 。'], 'Please deliver dried fish to Saltglass.', '{潮硝子|しおがらす} に sends it to Saltglass; {潮硝子|しおがらす} の {干物|ひもの} is the fish from Saltglass.', 'pier'),
        ] })],
      I: [F({ id: 'mb.route2.I', canal: 'mb.canal_city', item: 'g:cond_tara',
        prompt: T('The fish go to Kawaya; if the cook isn\'t there, the porter should leave them with the inn\'s owner. Say both.'),
        families: [
          ok(['{干物|ひもの} は {川屋|かわや} に {届|とど}けて 、', '{料理人|りょうりにん} が いなかったら', '{女将|おかみ} さん に {渡|わた}して ください 。'], 'Deliver the fish to Kawaya, and if the cook isn\'t there, give them to the owner.', 'inn'),
          ok(['{干物|ひもの} は {川屋|かわや} へ {届|とど}けて 、', '{料理人|りょうりにん} が いなかったら', '{女将|おかみ} さん に {渡|わた}して ください 。'], 'Take the fish to Kawaya, and if the cook isn\'t there, give them to the owner.', 'inn'),
          no(['{干物|ひもの} は {札場|ふだば} に {届|とど}けて 、', '{料理人|りょうりにん} が いなかったら', '{女将|おかみ} さん に {渡|わた}して ください 。'], 'Deliver the fish to the Tally Exchange, and if the cook isn\'t there, give them to the owner.', '{札場|ふだば} is the Tally Exchange; the inn is {川屋|かわや}.', 'tally'),
          no(['{料理人|りょうりにん} が いたら', '{干物|ひもの} を {川屋|かわや} に {届|とど}けて ください 。'], 'If the cook is there, deliver the fish to Kawaya.', 'いたら makes the cook being there the condition for going at all, so the porter waits to hear. いなかったら (if not there) is the back-up plan.', 'stay'),
        ] })],
      A: [F({ id: 'mb.route2.A', canal: 'mb.canal_city', item: 'g:prt_ni',
        prompt: T('The inn\'s owner asked for the fish "by the evening, if at all possible". Pass it on, keeping her politeness, so the porter goes now.'),
        families: [
          ok(['できれば {夕方|ゆうがた} まで に', '{川屋|かわや} の {女将|おかみ} さん に', '{干物|ひもの} を {届|とど}けて いただけます か 。'], 'Could you deliver the fish to the owner of Kawaya by the evening, if possible?', 'inn'),
          ok(['{川屋|かわや} の {女将|おかみ} さん に', 'できれば {夕方|ゆうがた} まで に', '{干物|ひもの} を {届|とど}けて いただけます か 。'], 'To the owner of Kawaya — could you deliver the fish by the evening, if possible?', 'inn'),
          no(['できれば {夕方|ゆうがた} まで', '{川屋|かわや} で', '{干物|ひもの} を {届|とど}けて いただけます か 。'], 'Could you be delivering fish at Kawaya until the evening?', 'まで alone is "until" and で is where the work happens: the porter would stand at Kawaya delivering until dusk. まで に is "by", and に says who it is for.', 'linger'),
        ] })],
    },
  };
})(RB.content);
