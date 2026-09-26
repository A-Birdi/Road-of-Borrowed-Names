/* Chapter 3 — Cinder Orchard (灰実の里 はいみのさと): cast, quests, items,
 * notebook lore and the fast-travel place. Story bible: docs/STORY.md (ch. 3).
 * All ids use the prefix co / co_.
 * Flags other chapters may read:
 *   ch3_done           chapter finished (road north to Snowbell opens)
 *   co_restored        the village chose to restore the memory of the fire
 *   co_suzu_done       Suzu told Hiro the truth (companion or cameo version)
 *   co_bell_done       Gorō's bell has a rope again (it rings at dusk now)
 *   co_hiro_seat_named Hiro's festival seat now carries his mother's name */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);

  // ---- cast (13 residents + one remembered) ----------------------------------------
  ch('co_hiro', { name: { en: 'Hiro', jp: 'ヒロ' }, voice: { pitch: 0.86 },
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#4a5656', '#384444', '#c8603a'], shape: 'apron', acc: ['headband'], bandCol: '#c8603a' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['headband'], bandCol: '#c8603a', collar: 'apron', bg: '#3a2a24' } });
  ch('co_tokiwa', { name: { en: 'Tokiwa', jp: 'トキワ' }, voice: { pitch: 0.82 },
    look: { skin: 1, hair: 'short', hairColor: 1, cloth: ['#3e4450', '#2c3038', '#b8a070'], shape: 'robe', acc: ['glasses', 'book'] },
    portrait: { eyes: 'narrow', style: 'short', parted: true, acc: ['glasses'], collar: 'high', bg: '#2a2630' } });
  ch('co_ume', { name: { en: 'Grandma Ume', jp: 'ウメ' }, voice: { pitch: 0.9 },
    look: { skin: 3, hair: 'bun', hairColor: 6, cloth: ['#7a5a3a', '#5e4430', '#d8b060'], shape: 'tunic', acc: ['basket'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', bg: '#3a3024' } });
  ch('co_goro', { name: { en: 'Old Gorō', jp: 'ゴロウ' }, voice: { pitch: 0.7 },
    look: { skin: 4, hair: 'shaved', hairColor: 5, cloth: ['#5a4a3a', '#44382c', '#a03a2a'], shape: 'coat', acc: ['beard'], age: 'old' },
    portrait: { eyes: 'round', style: 'shaved', age: 'old', beard: '#b8b4b0', collar: 'high', bg: '#34282a' } });
  ch('co_tamotsu', { name: { en: 'Tamotsu', jp: 'タモツ' }, voice: { pitch: 0.8 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#3a5a6a', '#2a4450', '#8ac0c8'], shape: 'tunic', acc: ['toolbelt', 'hat'], hatCol: '#6a7a5a' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['hat'], hatCol: '#6a7a5a', bg: '#243038' } });
  ch('co_nobu', { name: { en: 'Nobu', jp: 'ノブ' }, voice: { pitch: 0.74 },
    look: { skin: 2, hair: 'wrap', hairColor: 1, wrapCol: '#6a5a8a', cloth: ['#6a4a3a', '#503828', '#c8a878'], shape: 'apron', acc: ['beard'] },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#6a5a8a', beard: true, collar: 'apron', bg: '#302a34' } });
  ch('co_sayo', { name: { en: 'Sayo', jp: 'サヨ' }, voice: { pitch: 1.12 },
    look: { skin: 1, hair: 'ponytail', hairColor: 2, cloth: ['#c8603a', '#a04a2a', '#f0d890'], shape: 'dress', acc: ['book'] },
    portrait: { eyes: 'round', style: 'ponytail', bg: '#3e2a22' } });
  ch('co_kotaro', { name: { en: 'Kotarō', jp: 'コタロウ' }, voice: { pitch: 1.45 },
    look: { skin: 2, hair: 'spiky', hairColor: 3, cloth: ['#d8a040', '#b88830', '#5a7a4a'], shape: 'tunic', size: 'child', acc: [] },
    portrait: { eyes: 'round', style: 'spiky', blush: true, bg: '#3a3222' } });
  ch('co_fusa', { name: { en: 'Fusa', jp: 'フサ' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'bob', hairColor: 0, cloth: ['#8a4a5a', '#6a3a46', '#f0e0c0'], shape: 'apron', acc: ['flower'], flowerCol: '#f0a050' },
    portrait: { eyes: 'soft', style: 'bob', acc: ['flower'], flowerCol: '#f0a050', collar: 'apron', bg: '#3a2630' } });
  ch('co_shino', { name: { en: 'Shino', jp: 'シノ' }, voice: { pitch: 1.05 },
    look: { skin: 2, hair: 'braid', hairColor: 2, cloth: ['#4a6a4a', '#3a543a', '#e0c068'], shape: 'coat', acc: ['satchel', 'glasses'] },
    portrait: { eyes: 'round', style: 'braid', acc: ['glasses'], bg: '#26342a' } });
  ch('co_isao', { name: { en: 'Master Isao', jp: 'イサオ' }, voice: { pitch: 0.72 },
    look: { skin: 3, hair: 'shaved', hairColor: 5, cloth: ['#5a4a42', '#443630', '#d87a3a'], shape: 'apron', acc: ['beard'], age: 'old' },
    portrait: { eyes: 'sharp', style: 'shaved', age: 'old', beard: '#a8a4a0', collar: 'apron', bg: '#3a2420' } });
  ch('co_asa', { name: { en: 'Asa', jp: 'アサ' }, voice: { pitch: 1.1 },
    look: { skin: 4, hair: 'short', hairColor: 3, cloth: ['#6a7a3a', '#54622c', '#e0b050'], shape: 'tunic', acc: ['hat', 'basket'], hatCol: '#d8b868' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#d8b868', bg: '#2e3422' } });
  ch('co_heita', { name: { en: 'Heita', jp: 'ヘイタ' }, voice: { pitch: 0.98 },
    look: { skin: 3, hair: 'spiky', hairColor: 2, cloth: ['#7a6a4a', '#5e5038', '#6a8a4a'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0d0' },
    portrait: { eyes: 'soft', style: 'spiky', acc: ['headband'], bandCol: '#e8e0d0', bg: '#303424' } });
  ch('co_tomoe', { name: { en: 'Tomoe', jp: 'トモエ' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#a05a3a', '#80462c', '#e8c890'], shape: 'apron', acc: ['headband'], bandCol: '#c8603a' },
    portrait: { eyes: 'narrow', style: 'long', acc: ['headband'], bandCol: '#c8603a', collar: 'apron', bg: '#4a2618' } });
  ch('co_warden', { name: { en: 'The Kiln Warden', jp: '{窯|かま}の{番人|ばんにん}' }, voice: { pitch: 0.6 },
    look: { custom: 'golem', col: '#8a6a5a' },
    portrait: { skin: ['#8a6a5a', '#6a4a3a'], hair: ['#4a3028', '#6a4a3a', '#f0a060'], cloth: ['#6a4a3a', '#4a3028', '#8fb8b0'], style: 'shaved', eyes: 'sharp', iris: '#ffd070', bg: '#2a120c' } });

  // ---- quests ---------------------------------------------------------------------------
  C.quests.co_main = { main: true, chapter: 3, title: { jp: '{火事|かじ} の ない {里|さと}', en: 'The Orchard That Never Burned' },
    stages: [
      { jp: '{灰実|はいみ}の{里|さと} に {着|つ}いた 。 {広場|ひろば} で {祭|まつ}り の {準備|じゅんび} を して いる {人|ひと} に {声|こえ} を かけよう 。', en: 'You have reached Cinder Orchard. Someone in the square is busy with the festival — say hello.' },
      { jp: '{祭|まつ}り の {準備|じゅんび} に 、 どこ か {合|あ}わない ところ が ある 。 {広場|ひろば} や {工房|こうぼう} を {見|み}て まわろう 。', en: 'Something about this festival doesn\'t fit. Look around the square, the workshops and the lookout — and listen.' },
      { jp: '{記録堂|きろくどう} で 、 {里|さと} の {記録|きろく} を {読|よ}ませて もらおう 。', en: 'Ask Tokiwa to let you read the orchard\'s chronicle in the Chronicle Hall (north-east, across the channel).' },
      { jp: '{里|さと} の {人|ひと} が {半分|はんぶん} {覚|おぼ}えて いる こと を {聞|き}こう 。 ウメ 、 ゴロウ 、 イサオ 。', en: 'Gather what people half-remember: Grandma Ume on the terraces, Old Gorō at the lookout, and Master Isao at the glass workshop.' },
      { jp: '{集|あつ}めた {記録|きろく} を {記録堂|きろくどう} へ {持|も}って いこう 。', en: 'Take the planting book and the kiln ledger to the Chronicle Hall and set them beside the chronicle.' },
      { jp: '{上|うえ} の {段|だん} へ の {道|みち} は 、 {水番|みずばん} の タモツ が {開|あ}けられる 。', en: 'Tokiwa wants the kiln\'s own record. Tamotsu, who keeps the channel, can open the way up past the terraces.' },
      { jp: '{上|うえ} の {段|だん} を {越|こ}えて 、 {古|ふる}い {工房|こうぼう} {通|どお}り と {封|ふう}じられた {窯|かま} へ 。', en: 'Climb through the upper terraces to the old workshop row and the sealed kiln.' },
      { jp: '{窯|かま} で {見|み}つけた もの を 、 {里|さと} へ {持|も}ち{帰|かえ}ろう 。', en: 'Bring what you found in the kiln back down to Tokiwa at the Chronicle Hall.' },
      { jp: '{夕方|ゆうがた} 、 {里|さと} の {人|ひと} たち が {広場|ひろば} に {集|あつ}まる 。', en: 'At dusk the whole village gathers in the square. Tokiwa is waiting for you there.' },
      { jp: '{祭|まつ}り の {夜|よる} だ 。', en: 'It\'s the night of the festival. Walk among the lanterns; when you\'re ready, climb the lookout.' },
    ] };
  C.quests.co_suzu = { chapter: 3, title: { jp: '{春|はる} まで {空|あ}けて おく {席|せき}', en: 'A Seat Kept Until Spring' },
    stages: [
      { jp: 'スズ は この {里|さと} を {知|し}って いる らしい 。 フサ の {宿|やど} で {話|はなし} を {聞|き}こう 。', en: 'Suzu knows this village better than she lets on. Find a quiet moment with her at Fusa\'s inn.' },
      { jp: 'ヒロ は {空|あ}いた {席|せき} を どう {思|おも}って いる の だろう 。', en: 'What does Hiro believe about the empty seat? Ask him — gently. He works in the glass workshop.' },
      { jp: '{本当|ほんとう} の こと を {言|い}う の は 、 {窯|かま} が {記録|きろく} を {返|かえ}して から だ 。', en: 'Suzu will tell Hiro once the truth can hold. First, the kiln has to give back what it keeps.' },
      { jp: '{里|さと} が {集|あつ}まる {前|まえ} に 、 スズ と ヒロ の {工房|こうぼう} へ 。', en: 'Before the village gathers, go with Suzu to Hiro\'s workshop.' },
    ] };
  C.quests.co_count = { chapter: 3, title: { jp: '{数|かぞ}え{方|かた} ちがい', en: 'Thirty of What?' },
    stages: [
      { jp: 'ノブ は {三十|さんじゅう} の {何|なに} か を {作|つく}った 。 サヨ が {本当|ほんとう} に {頼|たの}んだ もの は ？', en: 'Nobu the potter made thirty of something nobody wants. Find out what Sayo actually ordered.' },
      { jp: '{注文|ちゅうもん} を {届|とど}けた の は コタロウ だ 。', en: 'Kotarō carried the order to the pottery. Ask him what he said.' },
      { jp: 'ノブ の ため に 、 {正|ただ}しい {注文書|ちゅうもんしょ} を {書|か}こう 。', en: 'Write Nobu a correct order slip — the counters matter.' },
    ], reward: { items: { co_ash_cup: 1 } } };
  C.quests.co_signs = { chapter: 3, title: { jp: '{段々畑|だんだんばたけ} の {道|みち}しるべ', en: 'Signposts on the Terraces' },
    stages: [
      { jp: 'アサ の {道|みち}しるべ の {文字|もじ} が {消|き}えた 。 {段々畑|だんだんばたけ} を よく {見|み}て 、 {書|か}き{直|なお}そう 。', en: 'The names on Asa\'s terrace signposts have faded away. Look at where each arm points, and write the names back.' },
    ], reward: { items: { co_straw_hat: 1 } } };
  C.quests.co_bell = { chapter: 3, title: { jp: '{綱|つな} の ない {鐘|かね}', en: 'The Bell Without a Rope' },
    stages: [
      { jp: 'ゴロウ は {鐘|かね} の {綱|つな} が ほしい 。 {水門|すいもん} の {綱|つな} なら 、 タモツ が {持|も}って いる 。', en: 'Old Gorō wants a rope for the lookout bell. Tamotsu keeps spare rope for the channel gates.' },
      { jp: '{綱|つな} を ゴロウ に {届|とど}けよう 。', en: 'Bring the rope to Gorō at the lookout.' },
    ] };

  // ---- items ------------------------------------------------------------------------------
  const it = (id, d) => (C.items[id] = d);
  it('co_plantbook', { name: { jp: '{植|う}え{付|つ}け{帳|ちょう}', en: 'Terrace planting book' }, desc: 'Grandma Ume\'s record of every tree set on the terraces, in three different hands. One page lists two hundred saplings in a single spring.', key: true });
  it('co_kilnbook', { name: { jp: '{窯|かま} の {帳面|ちょうめん}', en: 'Kiln ledger' }, desc: 'Master Isao\'s firing log. It stops mid-autumn, twenty years ago, and starts again the next spring in a different hand.', key: true });
  it('co_logpage', { name: { jp: '{窯焚|かまだ}き {日誌|にっし} の {最後|さいご} の {頁|ページ}', en: 'The kiln log\'s last page' }, desc: 'Brittle, scorched at one corner, written fast. Found sealed inside the great kiln.', key: true });
  it('co_rope', { name: { jp: '{水門|すいもん} の {綱|つな}', en: 'Channel-gate rope' }, desc: 'Tamotsu\'s spare hemp rope, still smelling faintly of river mud.', key: true });
  it('co_ash_cup', { name: { jp: '{灰釉|はいゆう} の {湯呑|ゆの}み', en: 'Ash-glazed cup' }, desc: 'Nobu\'s thanks. The glaze is made from orchard ash; it runs green where it pooled in the kiln.' });
  it('co_straw_hat', { name: { jp: '{麦|むぎ}わら{帽子|ぼうし}', en: 'Terrace straw hat' }, desc: 'Asa\'s spare. A keepsake to wear; it changes only how you look.', slot: 'cosmetic', acc: 'hat' });
  it('co_leaf_pin', { name: { jp: '{紅葉|もみじ} の {髪飾|かみかざ}り', en: 'Maple-leaf hairpin' }, desc: 'Grandma Ume\'s pin, pressed on you "because it suits a traveller". Cosmetic.', slot: 'cosmetic', acc: 'flower' });
  it('co_glass_beads', { name: { jp: 'ガラス の {耳飾|みみかざ}り', en: 'Glass-bead earrings' }, desc: 'Hiro\'s work: two drops of amber glass, the colour of the festival lanterns. Cosmetic.', slot: 'cosmetic', acc: 'earrings' });
  it('co_hoshigaki', { name: { jp: '{干|ほ}し{柿|がき}', en: 'Dried persimmons' }, desc: 'A string of Fusa\'s dried persimmons, sweet as honey. Good for the road.' });

  // ---- notebook lore -------------------------------------------------------------------------
  C.notes.co_orchard = { title: { jp: '{灰実|はいみ}の{里|さと}', en: 'Cinder Orchard' },
    jp: '{山|やま} の {斜面|しゃめん} に {段々畑|だんだんばたけ} と {果樹園|かじゅえん} が ある 。 {灰|はい} を {含|ふく}む {土|つち} は {柿|かき} と ガラス に {向|む}いて いる 。',
    en: 'A hillside village of terraced fields and orchards. Its ashy soil suits persimmons, and the ash also goes into glass and pottery glazes. The autumn festival is the heart of the year.' };
  C.notes.co_firebreak = { title: { jp: '{火除|ひよ}け{道|みち}', en: 'Firebreak paths' },
    jp: '{木|き} や {草|くさ} を {刈|か}った {帯|おび} の よう な {道|みち} 。 {火|ひ} が {広|ひろ}がる の を {止|と}める 。',
    en: 'A firebreak is a strip cleared of trees and grass so that a fire has nothing to cross. It only works if someone keeps cutting it. The orchard\'s founders cut three across the terraces; the village stopped tending them twenty years ago.' };
  C.notes.co_kiln = { title: { jp: '{登|のぼ}り{窯|がま}', en: 'The climbing kiln' },
    jp: '{斜面|しゃめん} に {沿|そ}って {部屋|へや} が {並|なら}ぶ {窯|かま} 。 {下|した} の {部屋|へや} の {熱|ねつ} が {上|うえ} の {部屋|へや} を {温|あたた}める 。',
    en: 'A noborigama ("climbing kiln") is a chain of chambers built up a slope: heat from each chamber rises to warm the next. Cinder Orchard\'s great kiln fired glass in its upper chamber — an invention of this story, though climbing kilns themselves are real.' };
  C.notes.co_fire = { title: { jp: '{二十年前|にじゅうねんまえ} の {火事|かじ}', en: 'The fire twenty years ago' },
    jp: '{十月|じゅうがつ} {十四日|じゅうよっか} の {夜|よる} 、 {大窯|おおがま} から {火|ひ} が {出|で}た 。 {上|うえ} の {段|だん} と {工房|こうぼう} {通|どお}り が {焼|や}け 、 {五人|ごにん} が {亡|な}くなった 。',
    en: 'On the night of the fourteenth of the tenth month, twenty years ago, fire broke out of the great kiln in a dry mountain wind. The upper terraces and the workshop row burned. Five people died, among them the glassblower Tomoe, who went up to open the channel\'s top gate. The firebreaks held; the lower village was saved.' };
  C.notes.co_hush_fire = { title: { jp: '{預|あず}けた {痛|いた}み', en: 'The grief they gave away' }, fiction: true,
    jp: '{火事|かじ} の {冬|ふゆ} 、 {白|しろ} い {服|ふく} の {旅人|たびびと} が {来|き}て 、 {悲|かな}しみ を {預|あず}かる と {言|い}った 。',
    en: '(Fiction) The winter after the fire, a soft-spoken traveller in white came to the orchard and offered to keep people\'s grief for them. Some asked. The Hush took the grief — and then the fire itself, the records, and the habit of cutting the firebreaks, from everyone.' };
  C.notes.co_hist_ume = { title: { jp: 'けむり の におい', en: 'Ume: the smell of smoke' },
    jp: '{雨|あめ} の ない {秋|あき} 、 {山|やま} から の {風|かぜ} 、 けむり 、 {水路|すいろ} 、 {黒|くろ} い {段|だん} 。',
    en: 'Ume\'s account: a rainless autumn; a wind off the mountain on festival eve; she woke to smoke and a red sky; everyone went down along the channel; at dawn the upper terraces were black.' };
  C.notes.co_hist_goro = { title: { jp: '{一度|いちど} だけ {鳴|な}った {鐘|かね}', en: 'Gorō: the bell that rang once' },
    jp: '{夜中|よなか} に {鐘|かね} を {鳴|な}らした 。 {腕|うで} が {痛|いた}く なる まで 。',
    en: 'Gorō\'s account: he saw a light on the upper terraces from the lookout, rang the bell until his arms gave out, watched lanterns run down to the channel with buckets — and in the morning the rope was gone.' };
  C.notes.co_hist_isao = { title: { jp: '{最後|さいご} の {窯焚|かまだ}き', en: 'Isao: the last firing' },
    jp: '{祭|まつ}り の {灯籠|とうろう} の {火屋|ほや} を {焼|や}いて いた 。 {風|かぜ} が {変|か}わった 。',
    en: 'Isao\'s account: they were firing thirty lantern globes for the festival; Tomoe was watching the fire; the wind turned; he pulled an iron door shut with his bare hand; he cannot remember what came after, only the burn.' };
  C.notes.co_suzu_ledger = { title: { jp: 'スズ の {帳簿|ちょうぼ}', en: 'Suzu\'s account book' },
    jp: '「 ヒロ ── {本当|ほんとう} の こと {一|ひと}つ 。 {未払|みはら}い 。 」',
    en: 'A line in the back of Suzu\'s neat little ledger of debts, twenty years old: "Hiro — one truth. Unpaid."' };

  // ---- fast travel ------------------------------------------------------------------------------
  C.places.cinder = { name: { en: 'Cinder Orchard', jp: '{灰実|はいみ}の{里|さと}' }, map: 'co.village', x: 3, y: 18, dir: 'right', pos: [270, 200], region: 'cinder', hub: true, desc: 'Terraced orchards, glass and pottery workshops, and a festival with a perfect record.' };
})(RB.content);
