/* Manybridge, Chapter 4: the festival preparations' language (expansion P09; plan 08_CULTURE.md C10, "Planning
 * produces the festival you see"). The core three (F-42): the lanterns (directions, W17), the stalls (routing and
 * space, L9) and the boat procession's order (sequence: 〜てから, 前に). Each is a forged sentence with several right
 * answers: the plan you say is the plan the festival has (the scene reads its result and sets mp_lan_*, mp_st_*,
 * mp_proc_*). A wrong sentence says why. The optional three are choices: the invitation to Matsu (register), the food
 * order (counters), the fireworks safety notice; each adds something seen on the night. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  const ok = (parts, en, result) => ({ parts, ok: true, en, result });
  const no = (parts, en, why, result) => ({ parts, ok: false, en, why: { en: why }, result });
  const w = (en) => ({ en });
  // the same task for two profiles each: kana sentences for F and E's first meeting, then the fuller form
  const tiers = (low, high) => ({ F: [low], E: [low], I: [high], A: [high] });

  C.challenges['mp.fest_lanterns'] = { title: T('The lanterns', '{提灯|ちょうちん}'),
    tiers: tiers(
      F({ id: 'mp.fest_lanterns.low', item: 'g:v_te_kudasai', prompt: T('Tell the lantern men where to hang the lanterns: along the bank, in front of the playhouse, or over the bridge. It is your choice.'),
        families: [
          ok(['ちょうちん を', 'きし に そって', 'つるして ください 。'], 'Please hang the lanterns along the bank.', 'bank'),
          ok(['ちょうちん を', 'しばいごや の まえ に', 'つるして ください 。'], 'Please hang the lanterns in front of the playhouse.', 'theatre'),
          ok(['ちょうちん を', 'はし の うえ に', 'つるして ください 。'], 'Please hang the lanterns over the bridge.', 'bridge'),
          no(['ちょうちん を', 'かわ の なか に', 'つるして ください 。'], 'Please hang the lanterns in the river.', 'かわ の なか: in the river. They would go out.', 'river'),
        ] }),
      F({ id: 'mp.fest_lanterns.high', item: 'g:cond_tara', prompt: T('Tell the lantern men where to hang them and when to light them: once it is dark. Where is your choice.'),
        families: [
          ok(['{暗|くら}く なったら 、', '{岸|きし} に {沿|そ}った {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'Once it is dark, please light the lanterns along the bank.', 'bank'),
          ok(['{暗|くら}く なったら 、', '{芝居小屋|しばいごや} の {前|まえ} の {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'Once it is dark, please light the lanterns in front of the playhouse.', 'theatre'),
          ok(['{暗|くら}く なったら 、', '{橋|はし} の {上|うえ} の {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'Once it is dark, please light the lanterns over the bridge.', 'bridge'),
          no(['{明|あか}るい うち に 、', '{岸|きし} に {沿|そ}った {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'While it is still light, please light the lanterns along the bank.', 'Tomi wants them lit once it is dark ({暗|くら}く なったら), not in daylight.', 'early'),
        ] })),
  };

  C.challenges['mp.fest_stalls'] = { title: T('The stalls', '{屋台|やたい}'),
    tiers: tiers(
      F({ id: 'mp.fest_stalls.low', item: 'g:prt_ni', prompt: T('Where do the stalls go? Along the bank, or gathered in the square by the well. Your choice.'),
        families: [
          ok(['やたい は', 'きし に ならべて', 'ください 。'], 'Please line the stalls up along the bank.', 'bank'),
          ok(['やたい は', 'ひろば に あつめて', 'ください 。'], 'Please gather the stalls in the square.', 'square'),
          no(['やたい は', 'はし の うえ に ならべて', 'ください 。'], 'Please line the stalls up on the bridge.', 'はし の うえ: on the bridge. Nobody could cross.', 'bridge'),
        ] }),
      F({ id: 'mp.fest_stalls.high', item: 'g:prt_kara_made', prompt: T('Where do the stalls go? Along the bank from the bridge to the playhouse, or round the well in the square. Your choice.'),
        families: [
          ok(['{屋台|やたい} は', '{橋|はし} から {芝居小屋|しばいごや} まで 、 {岸|きし} に', '{並|なら}べて ください 。'], 'Please line the stalls along the bank, from the bridge to the playhouse.', 'bank'),
          ok(['{屋台|やたい} は', '{井戸|いど} の {周|まわ}り の {広場|ひろば} に', '{集|あつ}めて ください 。'], 'Please gather the stalls in the square round the well.', 'square'),
          no(['{屋台|やたい} は', '{橋|はし} の {上|うえ} に', '{並|なら}べて ください 。'], 'Please line the stalls up on the bridge.', '{橋|はし} の {上|うえ}: on the bridge. Nobody could cross.', 'bridge'),
        ] })),
  };

  C.challenges['mp.fest_procession'] = { title: T('The boat procession', '{舟|ふね} の {行列|ぎょうれつ}'),
    tiers: tiers(
      F({ id: 'mp.fest_procession.low', item: 'g:v_te_kara', prompt: T('Which boat goes first, the drums or the lanterns? Your choice: the other follows.'),
        families: [
          ok(['たいこ の ふね が でて から 、', 'ちょうちん の ふね を', 'だして ください 。'], 'Once the drum boat has gone, please send out the lantern boat.', 'drums'),
          ok(['ちょうちん の ふね が でて から 、', 'たいこ の ふね を', 'だして ください 。'], 'Once the lantern boat has gone, please send out the drum boat.', 'lanterns'),
          no(['はなび が おわって から 、', 'ふね を', 'だして ください 。'], 'Once the fireworks are over, please send out the boats.', 'はなび が おわって から: after the fireworks. The boats go out before them.', 'late'),
        ] }),
      F({ id: 'mp.fest_procession.high', item: 'g:mae_ato', prompt: T('Before the fireworks: which boat goes first, the drums or the lanterns? Your choice.'),
        families: [
          ok(['{花火|はなび} の {前|まえ} に 、', '{太鼓|たいこ} の {舟|ふね} が {出|で}て から', '{提灯|ちょうちん} の {舟|ふね} を {出|だ}して ください 。'], 'Before the fireworks, once the drum boat has gone, please send out the lantern boat.', 'drums'),
          ok(['{花火|はなび} の {前|まえ} に 、', '{提灯|ちょうちん} の {舟|ふね} が {出|で}て から', '{太鼓|たいこ} の {舟|ふね} を {出|だ}して ください 。'], 'Before the fireworks, once the lantern boat has gone, please send out the drum boat.', 'lanterns'),
          no(['{花火|はなび} が {終|お}わって から 、', '{太鼓|たいこ} の {舟|ふね} が {出|で}て から', '{提灯|ちょうちん} の {舟|ふね} を {出|だ}して ください 。'], 'After the fireworks are over, once the drum boat has gone, please send out the lantern boat.', 'Tomi wants the boats out before the fireworks ({花火|はなび} の {前|まえ} に), not after.', 'late'),
        ] })),
  };

  // the optional three
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  C.challenges['mp.fest_invite'] = { title: T('An invitation for Matsu', '{招待状|しょうたいじょう}'),
    tiers: {
      F: [ch({ item: 'g:v_te_kudasai', prompt: w('Matsu, the lock-keeper, is older than you and not a close friend. Which invitation is right for her?'), options: [{ jp: 'まつり に 、 ぜひ きて ください 。', ok: true }, { jp: 'まつり 、 こい よ 。', ok: false, why: w('こい よ is far too rough for Matsu.') }] })],
      E: [ch({ item: 'g:v_te_kudasai', prompt: w('Matsu, the lock-keeper, is older than you and not a close friend. Which invitation is right for her?'), options: [{ jp: '{川開|かわびら}き に 、 ぜひ {来|き}て ください 。', ok: true }, { jp: '{川開|かわびら}き 、 {来|こ}い よ 。', ok: false, why: w('{来|こ}い よ is far too rough for Matsu.') }] })],
      I: [ch({ item: 'g:keigo_sonkei', prompt: w('The invitation for Matsu: which is respectful, and still warm?'), options: [{ jp: '{川開|かわびら}き に 、 ぜひ お{越|こ}し ください 。', ok: true }, { jp: '{川開|かわびら}き に 、 {来|き}て も いい です よ 。', ok: false, why: w('That sounds as if you were giving her permission.') }, { jp: '{川開|かわびら}き 、 {来|こ}い よ 。', ok: false, why: w('Far too rough for Matsu.') }] })],
      A: [ch({ item: 'g:keigo_sonkei', prompt: w('The invitation for Matsu: which is respectful, and still warm?'), options: [{ jp: '{川開|かわびら}き に 、 ぜひ お{越|こ}し ください 。', ok: true }, { jp: '{川開|かわびら}き に 、 {来|き}て も いい です よ 。', ok: false, why: w('That sounds as if you were giving her permission.') }, { jp: '{川開|かわびら}き に 、 {参|まい}り ください 。', ok: false, why: w('{参|まい}る is humble: it lowers the one who comes. For Matsu, raise her: お{越|こ}し ください.') }] })],
    } };
  C.challenges['mp.fest_food'] = { title: T('The food order', '{食|た}べ{物|もの} の {注文|ちゅうもん}'),
    tiers: {
      F: [ch({ item: 'g:counters', prompt: w('Order twenty skewers of yakitori and thirty rice balls.'), options: [{ jp: 'やきとり を にじゅっぽん 、 おにぎり を さんじゅっこ 。', ok: true }, { jp: 'やきとり を にじゅっこ 、 おにぎり を さんじゅっぽん 。', ok: false, why: w('Skewers are counted with ほん (本); rice balls with こ (個).') }] })],
      E: [ch({ item: 'g:counters', prompt: w('Order twenty skewers of yakitori and thirty rice balls.'), options: [{ jp: '{焼|や}き{鳥|とり} を {二十本|にじゅっぽん} 、 おにぎり を {三十個|さんじゅっこ} 。', ok: true }, { jp: '{焼|や}き{鳥|とり} を {二十個|にじゅっこ} 、 おにぎり を {三十本|さんじゅっぽん} 。', ok: false, why: w('Skewers are counted with {本|ほん}; rice balls with {個|こ}.') }] })],
      I: [ch({ item: 'g:counters', prompt: w('Tomi\'s order: twenty skewers, thirty rice balls, and five bottles of tea. Which order is right?'), options: [{ jp: '{焼|や}き{鳥|とり} {二十本|にじゅっぽん} 、 おにぎり {三十個|さんじゅっこ} 、 お{茶|ちゃ} {五本|ごほん} 。', ok: true }, { jp: '{焼|や}き{鳥|とり} {二十本|にじゅっぽん} 、 おにぎり {三十個|さんじゅっこ} 、 お{茶|ちゃ} {五枚|ごまい} 。', ok: false, why: w('Bottles are counted with {本|ほん}; {枚|まい} is for flat things.') }, { jp: '{焼|や}き{鳥|とり} {二十枚|にじゅうまい} 、 おにぎり {三十個|さんじゅっこ} 、 お{茶|ちゃ} {五本|ごほん} 。', ok: false, why: w('Skewers are long and thin: {本|ほん}.') }] })],
      A: [ch({ item: 'g:counters', prompt: w('Tomi\'s order: twenty skewers, thirty rice balls, and five bottles of tea. Which order is right?'), options: [{ jp: '{焼|や}き{鳥|とり} {二十本|にじゅっぽん} 、 おにぎり {三十個|さんじゅっこ} 、 お{茶|ちゃ} {五本|ごほん} 。', ok: true }, { jp: '{焼|や}き{鳥|とり} {二十本|にじゅっぽん} 、 おにぎり {三十個|さんじゅっこ} 、 お{茶|ちゃ} {五枚|ごまい} 。', ok: false, why: w('Bottles are counted with {本|ほん}; {枚|まい} is for flat things.') }, { jp: '{焼|や}き{鳥|とり} {二十枚|にじゅうまい} 、 おにぎり {三十個|さんじゅっこ} 、 お{茶|ちゃ} {五本|ごほん} 。', ok: false, why: w('Skewers are long and thin: {本|ほん}.') }] })],
    } };
  C.challenges['mp.fest_notice'] = { title: T('The safety notice', '{花火|はなび} の {注意書|ちゅういが}き'),
    tiers: {
      F: [ch({ item: 'g:v_naide_kudasai', prompt: w('The notice for the fireworks: people should keep back from the bank.'), options: [{ jp: 'はなび の あいだ は 、 きし に ちかづかないで ください 。', ok: true }, { jp: 'はなび の あいだ は 、 きし に ちかづいて ください 。', ok: false, why: w('That asks people to come close to the edge.') }] })],
      E: [ch({ item: 'g:v_naide_kudasai', prompt: w('The notice for the fireworks: people should keep back from the bank.'), options: [{ jp: '{花火|はなび} の {間|あいだ} は 、 {岸|きし} に {近|ちか}づかないで ください 。', ok: true }, { jp: '{花火|はなび} の {間|あいだ} は 、 {岸|きし} に {近|ちか}づいて ください 。', ok: false, why: w('That asks people to come close to the edge.') }] })],
      I: [ch({ item: 'g:v_naide_kudasai', prompt: w('The notice: keep back from the bank during the fireworks, and children stay with a grown-up.'), options: [{ jp: '{花火|はなび} の {間|あいだ} は {岸|きし} に {近|ちか}づかないで ください 。 お{子|こ}さん は {大人|おとな} から {離|はな}れないで ください 。', ok: true }, { jp: '{花火|はなび} の {間|あいだ} は {岸|きし} に {近|ちか}づいて ください 。 お{子|こ}さん は {大人|おとな} から {離|はな}れて ください 。', ok: false, why: w('Both halves say the opposite.') }, { jp: '{花火|はなび} の {間|あいだ} は {岸|きし} に {近|ちか}づかないで ください 。 お{子|こ}さん は {大人|おとな} から {離|はな}れて ください 。', ok: false, why: w('The second half sends the children away from the grown-ups.') }] })],
      A: [ch({ item: 'g:v_naide_kudasai', prompt: w('The notice, in the committee\'s formal style: keep back from the bank; children stay with a grown-up.'), options: [{ jp: '{花火|はなび} {打|う}ち{上|あ}げ {中|ちゅう} は 、 {岸|きし} へ の {立|た}ち{入|い}り を ご{遠慮|えんりょ} ください 。 お{子|こ}さま は {保護者|ほごしゃ} の {方|かた} と ご{一緒|いっしょ} に 。', ok: true }, { jp: '{花火|はなび} {打|う}ち{上|あ}げ {中|ちゅう} は 、 {岸|きし} へ の {立|た}ち{入|い}り を ご{自由|じゆう} に どうぞ 。 お{子|こ}さま は {保護者|ほごしゃ} の {方|かた} と ご{一緒|いっしょ} に 。', ok: false, why: w('ご{自由|じゆう} に どうぞ invites people onto the bank.') }, { jp: '{花火|はなび} {打|う}ち{上|あ}げ {中|ちゅう} は 、 {岸|きし} へ の {立|た}ち{入|い}り を ご{遠慮|えんりょ} ください 。 お{子|こ}さま だけ で どうぞ 。', ok: false, why: w('お{子|こ}さま だけ で: the children on their own.') }] })],
    } };
  // the festival noodles (the stalls Masaya and Masuya keep side by side): two bowls, one for each of you
  C.challenges['mp.fest_noodles'] = { title: T('Two bowls, please', '{二杯|にはい} ください'),
    tiers: {
      F: [ch({ item: 'g:counters', prompt: w('Order two bowls: one for you, one for your companion.'), options: [{ jp: 'ふたつ ください 。', ok: true }, { jp: 'ふたり ください 。', ok: false, why: w('ふたり counts people, not bowls.') }] })],
      E: [ch({ item: 'g:counters', prompt: w('Order two bowls of noodles.'), options: [{ jp: '{二杯|にはい} ください 。', ok: true }, { jp: '{二本|にほん} ください 。', ok: false, why: w('Bowls (and cups) are counted with {杯|はい}; {本|ほん} is for long thin things.') }] })],
      I: [ch({ item: 'g:counters', prompt: w('Order two bowls of noodles and one bottle of tea.'), options: [{ jp: '{二杯|にはい} と 、 お{茶|ちゃ} を {一本|いっぽん} ください 。', ok: true }, { jp: '{二本|にほん} と 、 お{茶|ちゃ} を {一杯|いっぱい} ください 。', ok: false, why: w('Swapped: bowls are {杯|はい}, bottles {本|ほん}.') }, { jp: '{二枚|にまい} と 、 お{茶|ちゃ} を {一本|いっぽん} ください 。', ok: false, why: w('{枚|まい} is for flat things.') }] })],
      A: [ch({ item: 'g:counters', prompt: w('Two bowls of noodles, one with extra spring onion, and one bottle of tea.'), options: [{ jp: '{二杯|にはい} 、 {一杯|いっぱい} は ねぎ {多|おお}め で 。 お{茶|ちゃ} も {一本|いっぽん} 。', ok: true }, { jp: '{二杯|にはい} 、 {一本|いっぽん} は ねぎ {多|おお}め で 。 お{茶|ちゃ} も {一杯|いっぱい} 。', ok: false, why: w('The bowl is {一杯|いっぱい}; the bottle is {一本|いっぽん}.') }, { jp: '{二杯|にはい} 、 {一杯|いっぱい} は ねぎ {抜|ぬ}き で 。 お{茶|ちゃ} も {一本|いっぽん} 。', ok: false, why: w('ねぎ {抜|ぬ}き is without spring onion.') }] })],
    } };
})(RB.content);
