/* Chapter 4 — Snowbell (雪鈴 ゆきすず): cast, quests, items, notebook lore
 * and the fast-travel place. Story bible: docs/STORY.md (chapter 4).
 * Flags other chapters may read:
 *   ch4_done, sb_lamp_lit, sb_archive_found, sb_ushio_sketch, sb_ren_ushio1,
 *   sb_hoshino_stays | sb_hoshino_goes | sb_hoshino_both (how Hoshino chose),
 *   item sb_reply_letter (Hoshino's reply for Akari in Lanternfall). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);

  // ---- cast (12 named residents) --------------------------------------------------
  ch('hoshino', { name: { en: 'Hoshino', jp: 'ホシノ' }, voice: { pitch: 0.78 },
    look: { skin: 1, hair: 'short', hairColor: 6, cloth: ['#3e4a66', '#2e3850', '#c8b070'], shape: 'coat', acc: ['glasses', 'beard', 'scarf'], scarfCol: '#8a4a3a', age: 'old' },
    portrait: { eyes: 'soft', style: 'short', age: 'old', beard: '#e8e4e0', acc: ['glasses', 'scarf'], scarfCol: '#8a4a3a', collar: 'high', bg: '#1e2638' } });
  ch('yae', { name: { en: 'Yae', jp: 'ヤエ' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'wrap', hairColor: 1, wrapCol: '#b8483a', cloth: ['#6a4a5a', '#503848', '#e8dcc8'], shape: 'apron', acc: [] },
    portrait: { eyes: 'round', style: 'wrap', wrapCol: '#b8483a', collar: 'apron', bg: '#3a2a2a' } });
  ch('sousuke', { name: { en: 'Sousuke', jp: 'ソウスケ' }, voice: { pitch: 0.88 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#2e4a5a', '#223a48', '#d8b060'], shape: 'coat', acc: ['hat', 'glasses', 'satchel'], hatCol: '#2e3a4a' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat', 'glasses'], hatCol: '#2e3a4a', collar: 'high', bg: '#22303a' } });
  ch('tetsuji', { name: { en: 'Tetsuji', jp: 'テツジ' }, voice: { pitch: 0.7 },
    look: { skin: 4, hair: 'shaved', hairColor: 5, cloth: ['#7a5a3a', '#5a4028', '#c8b890'], shape: 'tunic', acc: ['beard', 'hat'], hatCol: '#6a5a4a' },
    portrait: { eyes: 'sharp', style: 'shaved', beard: '#8a8a90', acc: ['hat'], hatCol: '#6a5a4a', bg: '#342a22' } });
  ch('natsume', { name: { en: 'Natsume', jp: 'ナツメ' }, voice: { pitch: 1.12 },
    look: { skin: 2, hair: 'braid', hairColor: 2, cloth: ['#8a6a3a', '#6a5028', '#e8d8b8'], shape: 'tunic', acc: ['scarf'], scarfCol: '#c8a060' },
    portrait: { eyes: 'soft', style: 'braid', acc: ['scarf'], scarfCol: '#c8a060', blush: true, bg: '#3a3224' } });
  ch('fuki', { name: { en: 'Fuki', jp: 'フキ' }, voice: { pitch: 0.92 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#5a3a4a', '#44283a', '#d8c8a8'], shape: 'robe', acc: ['scarf', 'cane'], scarfCol: '#6a8aa8', age: 'old' },
    portrait: { eyes: 'sharp', style: 'bun', age: 'old', acc: ['scarf'], scarfCol: '#6a8aa8', bg: '#2e2434' } });
  ch('kanta', { name: { en: 'Kanta', jp: 'カンタ' }, voice: { pitch: 1.4 },
    look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#b84a3a', '#963a2e', '#e8d8b0'], shape: 'tunic', size: 'child', acc: ['scarf'], scarfCol: '#e8c040' },
    portrait: { eyes: 'round', style: 'short', acc: ['scarf'], scarfCol: '#e8c040', blush: true, bg: '#3a2624' } });
  ch('chiyo', { name: { en: 'Chiyo', jp: 'チヨ' }, voice: { pitch: 1.45 },
    look: { skin: 1, hair: 'bob', hairColor: 0, cloth: ['#4a7ab0', '#3a6090', '#f0e0c0'], shape: 'dress', size: 'child', acc: ['headband'], bandCol: '#e86a8a' },
    portrait: { eyes: 'round', style: 'bob', acc: ['headband'], bandCol: '#e86a8a', bg: '#24304a' } });
  ch('rokuta', { name: { en: 'Rokuta', jp: 'ロクタ' }, voice: { pitch: 1.35 },
    look: { skin: 4, hair: 'spiky', hairColor: 2, cloth: ['#5a8a4a', '#467038', '#e0d0a0'], shape: 'tunic', size: 'child', acc: ['hat'], hatCol: '#4a6a8a' },
    portrait: { eyes: 'sharp', style: 'spiky', acc: ['hat'], hatCol: '#4a6a8a', bg: '#26362a' } });
  ch('sachi', { name: { en: 'Sachi', jp: 'サチ' }, voice: { pitch: 1.02 },
    look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#8a7a5a', '#6a5c44', '#c86a5a'], shape: 'dress', acc: ['basket'] },
    portrait: { eyes: 'soft', style: 'long', mole: true, bg: '#34302a' } });
  ch('denji', { name: { en: 'Denji', jp: 'デンジ' }, voice: { pitch: 0.72 },
    look: { skin: 5, hair: 'shaved', hairColor: 6, cloth: ['#5a5a4a', '#44443a', '#b89a6a'], shape: 'tunic', acc: ['beard', 'toolbelt'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', beard: '#d8d4d0', bg: '#2e2e26' } });
  ch('hayate', { name: { en: 'Hayate', jp: 'ハヤテ' }, voice: { pitch: 0.9 },
    look: { skin: 3, hair: 'ponytail', hairColor: 0, cloth: ['#4a5a3a', '#3a4a2e', '#a88a5a'], shape: 'coat', acc: ['cape'], capeCol: '#8a8a7a' },
    portrait: { eyes: 'sharp', style: 'ponytail', acc: ['cape'], capeCol: '#8a8a7a', collar: 'high', bg: '#26302a' } });
  // Voices that speak only in scenes (not placed on a map).
  ch('sb_lampvoice', { name: { en: 'The lamp', jp: '{灯|ひ}' }, bodiless: true, voice: { pitch: 1.2 },
    look: { custom: 'spirit', col: '#cfe4ff' },
    portrait: { skin: ['#d8e8f8', '#b8c8d8'], hair: ['#a8c0d8', '#c8d8e8', '#f4faff'], cloth: ['#8aa8c8', '#6a88a8', '#f4faff'], style: 'long', eyes: 'soft', acc: ['hood'], hoodCol: '#a8c0d8', bg: '#101a2c' } });

  // ---- quests ------------------------------------------------------------------------
  C.quests.sb_lamp = { main: true, chapter: 4, title: { jp: '{雪鈴|ゆきすず} の {灯|あか}り', en: 'The Light Above Snowbell' },
    stages: [
      { jp: '{天文台|てんもんだい} の {灯|あか}り が {消|き}えて いる 。 {宿|やど} で {話|はなし} を {聞|き}こう 。', en: 'The observatory lamp above the hamlet is dark. Ask about it at the inn, Yukimiya.' },
      { jp: '{天文台|てんもんだい} へ の {坂|さか} の {下|した} に 、 ホシノ の {家|いえ} が ある 。 {会|あ}い に {行|い}こう 。', en: 'Hoshino the astronomer lives at the foot of the observatory path, in the north of the hamlet. Go and see him.' },
      { jp: 'アカリ から の {手紙|てがみ} が {届|とど}かない 。 {郵便|ゆうびん}{小屋|ごや} の ソウスケ に {聞|き}こう 。', en: 'Letters from Hoshino\'s daughter Akari stopped arriving. Ask Sousuke at the post shelter near the hamlet entrance.' },
      { jp: 'アカリ の {手紙|てがみ} を ホシノ に {届|とど}けよう 。', en: 'You have Akari\'s letters, in order. Bring them to Hoshino.' },
      { jp: '{吹雪|ふぶき} が {来|く}る 。 {宿|やど} へ {急|いそ}ごう 。', en: 'A snowstorm is coming. Get to the inn.' },
      { jp: '{雪見屋|ゆきみや} で {吹雪|ふぶき} が {過|す}ぎる の を {待|ま}とう 。 {部屋|へや} は {二階|にかい} だ 。', en: 'Wait out the storm at Yukimiya. When you are ready to rest, your room is upstairs.' },
      { jp: '{吹雪|ふぶき} が やんだ 。 {星|ほし} の {石段|いしだん} を {上|のぼ}って 、 {天文台|てんもんだい} へ {行|い}こう 。', en: 'The storm has passed. Climb the Star Stair, past Hoshino\'s house, to the observatory.' },
      { jp: '{凍|こお}った {天文台|てんもんだい} の {中|なか} を 、 {上|うえ} へ {進|すす}もう 。', en: 'Find a way up through the frozen observatory to the lamp room at the top.' },
      { jp: '{丸屋根|まるやね} の {部屋|へや} で 、 {灯|あか}り を ともそう 。', en: 'Relight the lamp under the dome.' },
    ] };
  C.quests.sb_goats = { chapter: 4, title: { jp: '{多|おお}すぎる ヤギ', en: 'Too Many Goats' },
    stages: [
      { jp: 'テツジ の {小屋|こや} に 、 {知|し}らない ヤギ が いる らしい 。 {誰|だれ} か の ヤギ が {迷|まよ}いこんだ の か ？', en: 'Tetsuji counted two goats too many in his shed. Is anyone missing goats? The goat shed itself may tell you something too.' },
      { jp: 'ヤギ {小屋|こや} の {柱|はしら} に 、 {書|か}き{置|お}き が ある 。 よく {読|よ}もう 。', en: 'There is a note pinned to a post in the goat shed. Read it carefully.' },
      { jp: 'わかった こと を テツジ に {伝|つた}えよう 。', en: 'Tell Tetsuji what the note says. He is by the goat pen.' },
    ] };
  C.quests.sb_bell = { chapter: 4, title: { jp: '{鐘|かね} の {柱|はしら}', en: 'The Bell-Post' },
    stages: [
      { jp: 'フキ は かぜ を ひいて いる 。 フキ の {家|いえ} で {帳面|ちょうめん} を {読|よ}んで 、 {鐘|かね} の {決|き}まり を {確|たし}かめよう 。', en: 'Fuki has a cold, and the signal board has gone blank. Read her notebook at her house and work out the bell signals.' },
      { jp: '{広場|ひろば} の {鐘|かね} の {柱|はしら} で 、 {昼|ひる} の {鐘|かね} を {鳴|な}らそう 。', en: 'Ring the noon signal at the bell-post in the square.' },
      { jp: 'フキ に {知|し}らせよう 。', en: 'Let Fuki know how it went.' },
    ] };
  C.quests.sb_snow = { chapter: 4, title: { jp: '{雪像|せつぞう} コンテスト', en: 'The Snow-Sculpture Contest' },
    stages: [
      { jp: '{子|こ}ども たち が {審査員|しんさいん} を {探|さが}して いる 。 {広場|ひろば} の {雪像|せつぞう} を {見|み}て まわろう 。', en: 'The children want a judge. Look at each of the three snow sculptures in the square.' },
      { jp: '{説明|せつめい} の {札|ふだ} と {雪像|せつぞう} を {比|くら}べて 、 カンタ に {結果|けっか} を {伝|つた}えよう 。', en: 'Compare the description cards with the sculptures, then give Kanta your verdict.' },
    ] };

  // ---- items ---------------------------------------------------------------------------
  const it = (id, d) => (C.items[id] = d);
  it('sb_akari_letters', { name: { jp: 'アカリ の {手紙|てがみ}', en: 'Akari\'s letters' }, desc: 'Four letters in the same careful hand, their addresses washed blank. Now in order.', key: true });
  it('sb_obs_key', { name: { jp: '{天文台|てんもんだい} の {鍵|かぎ}', en: 'Observatory key' }, desc: 'Brass, warm from Hoshino\'s pocket. The bow is shaped like a small star.', key: true });
  it('sb_ushio_sketch', { name: { jp: 'ウシオ の {似顔絵|にがおえ}', en: 'Sketch of Ushio' }, desc: 'Hoshino\'s pencil sketch of a travelling lantern keeper, with a line of their teaching in the margin.', key: true });
  it('sb_reply_letter', { name: { jp: 'ホシノ の {返事|へんじ}', en: 'Hoshino\'s reply' }, desc: 'A letter for Akari, a clerk in Lanternfall. The address line is left for you to fill in when you find her.', key: true });
  it('sb_goat_bell', { name: { jp: 'ヤギ の {鈴|すず}', en: 'Goat bell' }, desc: 'Tetsuji\'s spare. It sounds exactly like "don\'t panic". In battle you stand a little steadier (+1 resolve).', slot: 'charm', effect: { resolve: 1 } });
  it('sb_bell_cord', { name: { jp: '{鐘|かね} の {綱|つな}', en: 'Bell-rope braid' }, desc: 'Fuki braided it from an old bell rope. You begin each encounter already in step (+1 harmony).', slot: 'charm', effect: { harmonyStart: 1 } });
  it('sb_scarf', { name: { jp: '{手編|てあ}み の マフラー', en: 'Hand-knitted scarf' }, desc: 'Sachi\'s work, in the colours the children chose. It changes nothing but how you look (and how warm).', slot: 'cosmetic', acc: 'scarf' });
  it('sb_cheese', { name: { jp: 'ヤギ の チーズ', en: 'Goat cheese' }, desc: 'Wrapped in cloth. Tetsuji says it\'s better the second week. It is the first week.' });
  it('sb_amazake', { name: { jp: '{甘酒|あまざけ}', en: 'Amazake' }, desc: 'Sweet, warm, non-alcoholic rice drink from Yae\'s pot, in a stoppered flask.' });

  // ---- notebook lore ---------------------------------------------------------------------
  C.notes.sb_snowbell = { title: { jp: '{雪鈴|ゆきすず}', en: 'Snowbell' },
    en: 'A hamlet of eleven households below the old observatory. The pass to Lanternfall closes for most of the winter, so outgoing letters wait in the post shelter "for the thaw". The bell-post in the square tells the hamlet the time, the weather and when to bring the goats in.' };
  C.notes.sb_lamp = { title: { jp: '{天文台|てんもんだい} の {灯|あか}り', en: 'The observatory lamp' }, fiction: true,
    en: 'Hoshino promised his daughter Akari that the observatory lamp would stay lit until she came home. He wrote her name on its shade, as keepers write place names on lanterns. When the Hush lifted the name, the lamp went out and the cold moved in. (Fiction: the way a written name keeps a lamp alight is this story\'s magic.)' };
  C.notes.sb_tsuzumi = { title: { jp: '{鼓星|つづみぼし}', en: 'Tsuzumiboshi (Orion)' },
    jp: '{鼓星|つづみぼし} は オリオン{座|ざ} の {古|ふる}い {呼|よ}び{名|な} の ひとつ 。',
    en: '鼓星 (つづみぼし, "drum stars") is a real traditional Japanese name for Orion: its outline looks like an hourglass-shaped tsuzumi drum. In winter it stands in the southern sky in the evening; like all stars, it reaches the same place about two hours earlier each month.' };
  C.notes.sb_letters = { title: { jp: '{手紙|てがみ} の {書|か}き{方|かた}', en: 'How letters are written' },
    en: 'Formal Japanese letters often open with 拝啓 (はいけい) and a seasonal greeting (時候の挨拶, e.g. 寒さが厳しくなりました), and close with 敬具 (けいぐ). Family letters usually skip these, but a seasonal line is still common and warm. Akari writes to her father in polite です/ます with plain slips when she is moved; Hoshino writes back in plain speech.' };
  C.notes.sb_counters = { title: { jp: '{匹|ひき} と {頭|とう}', en: 'Counting animals: 匹 and 頭' },
    en: '匹 (ひき/びき/ぴき) counts small and medium animals; 頭 (とう) counts large animals and livestock. Goats can take either: a farmer counting his herd may say 十頭, while newborn kids are easily 二匹. Sound changes: 一匹 いっぴき, 二匹 にひき, 三匹 さんびき.' };
  C.notes.sb_bell_signals = { title: { jp: '{鐘|かね} の {決|き}まり', en: 'The bell-post signals' },
    en: 'Snowbell\'s own custom (invented for this hamlet): one stroke at seven in the morning, two at noon, three at five in the evening for bringing the goats in; short strokes again and again when a storm is coming; one long stroke, a pause, and another when someone is lost.' };
  C.notes.sb_archive_light = { title: { jp: '{動|うご}かない {光|ひかり}', en: 'The light that doesn\'t move' }, fiction: true,
    en: 'Hoshino\'s old observing log records a white light low in the southeast, above Lanternfall, that stays in the same place all night while the stars wheel past it. It is not a star. Someone keeps a lamp burning high in the mountains there — the Still Archive.' };
  C.notes.sb_ushio = { title: { jp: '{灯守|ひもり} ウシオ', en: 'The keeper Ushio' }, fiction: true,
    en: 'Seven winters ago a travelling lantern keeper called Ushio stayed three nights at the observatory, asked Hoshino about the light that doesn\'t move, and set off up the mountain toward it. Hoshino drew a sketch. In the margin, in another hand: 「名は灯に、灯は人に、人は名に。」 — "A name to the lamp, the lamp to people, people to the name."' };
  C.notes.sb_honoo = { title: { jp: '{炎|ほのお} と {火|ひ}', en: 'Flame and fire' },
    en: '火 (ひ) is fire in general — a fire, a light, heat. 炎 (ほのお) is the flame itself, the visible tongues of burning. You light a 火; you watch its 炎. In Inkweaving (fiction), ほのお warms against cold and also gives light.' };

  // ---- fast travel -------------------------------------------------------------------------
  C.places.snowbell = { name: { en: 'Snowbell', jp: '{雪鈴|ゆきすず}' }, map: 'sb.hamlet', x: 22, y: 33, dir: 'up', pos: [330, 90], region: 'snowbell', hub: true, desc: 'A mountain hamlet beneath the old observatory.' };
})(RB.content);
