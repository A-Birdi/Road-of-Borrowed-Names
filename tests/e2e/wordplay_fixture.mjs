// TEST-ONLY shiritori fixture bank for the wordplay tests (unit and browser). It is
// never registered by the game: the real Pocket/Everyday/Extended banks come from the
// shiritori engine (src/content/shiritori/). Tests register this one under the id
// they need with RB.shiritori.addBank. Words are ordinary nouns with their usual
// readings; the set is small and shaped for testing (homophones, two readings,
// long-vowel and small-kana tails, ん words), not a certified bank.
const E = (id, reading, forms, jp, en, o) => Object.assign({ id, reading, forms, display: { jp, en }, nounKind: 'common', lexicalLevel: 'pocket', provenance: [{ source: 'wordplay test fixture', reviewed: false }] }, o || {});

export const FIXTURE_ENTRIES = [
  E('neko', 'ねこ', ['猫', 'ねこ', 'ネコ'], '{猫|ねこ}', 'cat'),
  E('koma', 'こま', ['独楽', 'こま'], 'こま', 'spinning top'),
  E('mado', 'まど', ['窓', 'まど'], '{窓|まど}', 'window'),
  E('dougu', 'どうぐ', ['道具', 'どうぐ'], '{道具|どうぐ}', 'tool'),
  E('gunte', 'ぐんて', ['軍手', 'ぐんて'], '{軍手|ぐんて}', 'work gloves'),
  E('tegami', 'てがみ', ['手紙', 'てがみ'], '{手紙|てがみ}', 'letter'),
  E('mikan', 'みかん', ['蜜柑', 'みかん'], 'みかん', 'mandarin orange'),
  E('mizu', 'みず', ['水', 'みず'], '{水|みず}', 'water'),
  E('zukan', 'ずかん', ['図鑑', 'ずかん'], '{図鑑|ずかん}', 'illustrated guide'),
  E('kasa', 'かさ', ['傘', 'かさ'], '{傘|かさ}', 'umbrella'),
  E('sakana', 'さかな', ['魚', 'さかな'], '{魚|さかな}', 'fish'),
  E('natsu', 'なつ', ['夏', 'なつ'], '{夏|なつ}', 'summer'),
  E('tsukue', 'つくえ', ['机', 'つくえ'], '{机|つくえ}', 'desk'),
  E('eki', 'えき', ['駅', 'えき'], '{駅|えき}', 'station'),
  E('kitsune', 'きつね', ['狐', 'きつね'], 'きつね', 'fox'),
  E('kodomo', 'こども', ['子供', 'こども'], '{子供|こども}', 'child'),
  E('mori', 'もり', ['森', 'もり'], '{森|もり}', 'forest'),
  E('risu', 'りす', ['りす', 'リス'], 'りす', 'squirrel'),
  E('suika', 'すいか', ['西瓜', 'すいか'], 'すいか', 'watermelon'),
  E('kagami', 'かがみ', ['鏡', 'かがみ'], '{鏡|かがみ}', 'mirror'),
  E('mimi', 'みみ', ['耳', 'みみ'], '{耳|みみ}', 'ear'),
  E('hashi_b', 'はし', ['橋', 'はし'], '{橋|はし}', 'bridge'),
  E('hashi_c', 'はし', ['箸', 'はし'], '{箸|はし}', 'chopsticks'),
  E('shika', 'しか', ['鹿', 'しか'], '{鹿|しか}', 'deer'),
  E('kame', 'かめ', ['亀', 'かめ'], '{亀|かめ}', 'turtle'),
  E('megane', 'めがね', ['眼鏡', 'めがね'], '{眼鏡|めがね}', 'glasses'),
  E('nezumi', 'ねずみ', ['鼠', 'ねずみ'], 'ねずみ', 'mouse'),
  E('kojo', null, ['工場'], '{工場|こうじょう}', 'factory', { readings: ['こうじょう', 'こうば'] }),
  E('ushi', 'うし', ['牛', 'うし'], '{牛|うし}', 'cow'),
  E('basu', 'ばす', ['バス'], 'バス', 'bus'),
  E('nori', 'のり', ['海苔', 'のり'], 'のり', 'nori seaweed'),
  E('nodo', 'のど', ['喉', 'のど'], 'のど', 'throat'),
  E('ringo', 'りんご', ['林檎', 'りんご'], 'りんご', 'apple'),
  E('goma', 'ごま', ['胡麻', 'ごま'], 'ごま', 'sesame'),
  E('makura', 'まくら', ['枕', 'まくら'], '{枕|まくら}', 'pillow'),
  E('rakuda', 'らくだ', ['らくだ', 'ラクダ'], 'らくだ', 'camel'),
  E('daikon', 'だいこん', ['大根', 'だいこん'], '{大根|だいこん}', 'daikon radish'),
  E('coffee', 'こーひー', ['コーヒー'], 'コーヒー', 'coffee'),
  E('inu', 'いぬ', ['犬', 'いぬ'], '{犬|いぬ}', 'dog'),
  E('nuigurumi', 'ぬいぐるみ', ['ぬいぐるみ'], 'ぬいぐるみ', 'stuffed toy'),
  E('super', 'すーぱー', ['スーパー'], 'スーパー', 'supermarket'),
  E('ame', 'あめ', ['雨', 'あめ'], '{雨|あめ}', 'rain'),
  E('omocha', 'おもちゃ', ['おもちゃ'], 'おもちゃ', 'toy'),
  E('yama', 'やま', ['山', 'やま'], '{山|やま}', 'mountain'),
  E('gyuunyuu', 'ぎゅうにゅう', ['牛乳', 'ぎゅうにゅう'], '{牛乳|ぎゅうにゅう}', 'milk'),
  E('umi', 'うみ', ['海', 'うみ'], '{海|うみ}', 'sea'),
  E('isu', 'いす', ['椅子', 'いす'], 'いす', 'chair'),
  E('enpitsu', 'えんぴつ', ['鉛筆', 'えんぴつ'], '{鉛筆|えんぴつ}', 'pencil'),
  E('tsuki', 'つき', ['月', 'つき'], '{月|つき}', 'moon'),
  E('kimono', 'きもの', ['着物', 'きもの'], '{着物|きもの}', 'kimono'),
  E('monosashi', 'ものさし', ['物差し', 'ものさし'], '{物差|ものさ}し', 'ruler'),
  E('kaki', 'かき', ['柿', 'かき'], '{柿|かき}', 'persimmon'),
  // a little more room around み, ず, し, う so test games stay open
  E('michi', 'みち', ['道', 'みち'], '{道|みち}', 'road'),
  E('mise', 'みせ', ['店', 'みせ'], '{店|みせ}', 'shop'),
  E('chizu', 'ちず', ['地図', 'ちず'], '{地図|ちず}', 'map'),
  E('zutsuu', 'ずつう', ['頭痛', 'ずつう'], '{頭痛|ずつう}', 'headache'),
  E('zukei', 'ずけい', ['図形', 'ずけい'], '{図形|ずけい}', 'figure, shape'),
  E('suzume', 'すずめ', ['すずめ'], 'すずめ', 'sparrow'),
  E('medaka', 'めだか', ['めだか'], 'めだか', 'killifish'),
  E('shio', 'しお', ['塩', 'しお'], '{塩|しお}', 'salt'),
  E('shima', 'しま', ['島', 'しま'], '{島|しま}', 'island'),
  E('oni', 'おに', ['鬼', 'おに'], '{鬼|おに}', 'ogre'),
  E('niwa', 'にわ', ['庭', 'にわ'], '{庭|にわ}', 'garden'),
  E('wani', 'わに', ['わに'], 'わに', 'crocodile'),
  E('senaka', 'せなか', ['背中', 'せなか'], '{背中|せなか}', 'back (of the body)'),
  E('usagi', 'うさぎ', ['うさぎ'], 'うさぎ', 'rabbit'),
  E('ginkou', 'ぎんこう', ['銀行', 'ぎんこう'], '{銀行|ぎんこう}', 'bank'),
  E('okashi', 'おかし', ['お菓子', 'おかし'], 'おかし', 'sweets'),
];
// openings with at least four safe replies in this fixture: ねこ (こ: こま, こども, 工場, コーヒー)
// and しか / すいか (か: かさ, かがみ, かめ, かき)
export const FIXTURE_STARTERS = ['neko', 'shika', 'suika'];
export function fixtureDef(id, o) {
  o = o || {};
  return { id, version: o.version || 1, entries: JSON.parse(JSON.stringify(o.entries || FIXTURE_ENTRIES)), starters: (o.starters || FIXTURE_STARTERS).slice(), meta: { fixture: true } };
}
// tiny banks for exact scenarios (§26.2: a real restrictive-ending win; exhaustion vs concession)
export const TINY = {
  // こま → ま: the player plays まど (→ ど) and no ど word exists: no playable continuation
  trap: { entries: ['koma', 'mado', 'makura', 'rakuda', 'daikon', 'goma', 'neko', 'kodomo', 'mori', 'risu', 'suika', 'kasa', 'sakana'], starters: ['neko'] },
};
export function tinyDef(id, name) {
  const t = TINY[name];
  return fixtureDef(id, { entries: FIXTURE_ENTRIES.filter((e) => t.entries.indexOf(e.id) >= 0), starters: t.starters });
}
