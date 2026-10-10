/* Snowbell in twelve-chapter journeys (Chapter 6 there; expansion P10; plan 03_ENCOUNTERS.md E23): three more kinds
 * of creature, met only in a twelve-chapter journey (`ed>=2` on their placements), and one changed-world line.
 *   sb.bat       Icicle Bat, in the gallery: Chill from above, then a Gust that strips a ward.
 *   sb.hare      Snow Hare, on the observatory path: a Sweep of kicked-up snow, then Chill.
 *   sb.starling  Starling Wisp, among the star charts: a Shroud that light alone clears (wind will not).
 * Interim art on existing families with their own palettes (F-36's rule; their own families are P16 art under AC-1,
 * C-82). The six-chapter game's Snowbell is unchanged. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const EN = C.enemies;
  const pool = EN['sb.fox'] && EN['sb.fox'].pool;

  EN['sb.bat'] = { setting: 'indoor', name: { en: 'Icicle Bat', jp: 'つらら コウモリ' }, art: 'moth', artOpts: { col: '#5a6a8a', col2: '#d8e8f8' }, look: { custom: 'moth', col: '#7a8aa8' },
    region: 'snowbell', bg: 'observatory', knots: 2, pool, pattern: ['chill', 'gust', 'rest', 'strike'],
    intents: {
      chill: { text: {
        F: { jp: 'つらら が おちて くる ！', en: 'Icicles are falling!' },
        E: { jp: '{天井|てんじょう} から 、 つらら が {落|お}ちて くる ！', en: 'Icicles are falling from the ceiling!' },
        I: { jp: '{羽|はね} を {一度|いちど} {動|うご}かす と 、 つらら が {次々|つぎつぎ} {落|お}ちて くる 。 {温|あたた}める もの が あれば …… 。', en: 'One beat of its wings and icicles fall one after another. If only something could warm them…' },
        A: { jp: '{冷|つめ}たい {風|かぜ} と {一緒|いっしょ} に 、 つらら が {頭|あたま} の {上|うえ} から {降|ふ}って くる 。', en: 'Icicles rain down from overhead on a freezing wind.' },
      } },
    },
    intro: { jp: '{天井|てんじょう} の つらら の {間|あいだ} に 、 コウモリ が {逆|さか}さ に {下|さ}がって いる 。 {羽|はね} を {広|ひろ}げる と 、 {冷|つめ}たい {風|かぜ} が {落|お}ちて くる 。', en: 'A bat hangs upside down among the icicles on the ceiling. When it spreads its wings, cold air falls.' },
    settle: { jp: 'コウモリ は つらら の {間|あいだ} に {戻|もど}って 、 {羽|はね} を たたんだ 。', en: 'The bat goes back among the icicles and folds its wings.' } };

  EN['sb.hare'] = { setting: 'outdoor', name: { en: 'Snow Hare', jp: '{雪|ゆき}ウサギ' }, art: 'sb_snowfox', look: { custom: 'snowfox' },
    region: 'snowbell', bg: 'snowbell', knots: 2, pool, pattern: ['sweep', 'chill', 'rest'],
    intents: {
      sweep: { text: {
        F: { jp: 'ゆき を けりあげた ！', en: 'It kicked up the snow!' },
        E: { jp: '{雪|ゆき} を {蹴|け}り{上|あ}げて 、 ふたり に かけた ！', en: 'It kicked up the snow and threw it over you both!' },
        I: { jp: '{跳|は}ねる たび に {雪|ゆき} が {舞|ま}い{上|あ}がって 、 ふたり を {包|つつ}む 。', en: 'Every bound throws up snow, and it closes around you both.' },
        A: { jp: '{雪|ゆき} を {蹴|け}って {駆|か}け{回|まわ}り 、 {辺|あた}り を {真|ま}っ{白|しろ}に した 。', en: 'It races round kicking up snow until everything is white.' },
      } },
    },
    intro: { jp: '{雪|ゆき} の {中|なか} から 、 {白|しろ}い ウサギ が {跳|と}び{出|だ}した 。 {後|うし}ろ {足|あし} で 、 {雪|ゆき} を {蹴|け}り{上|あ}げる 。', en: 'A white hare bursts out of the snow, kicking it up with its hind legs.' },
    settle: { jp: 'ウサギ は {耳|みみ} を {一度|いちど} {動|うご}かして 、 {雪|ゆき} の {中|なか} へ {消|き}えた 。', en: 'The hare twitches its ears once and vanishes into the snow.' } };

  EN['sb.starling'] = { setting: 'indoor', name: { en: 'Starling Wisp', jp: 'ムクドリ の {灯|ひ}' }, art: 'wisp', artOpts: { col: '#f0e0a0' }, look: { custom: 'wisp', col: '#f0e0a0' },
    region: 'snowbell', bg: 'observatory', knots: 2, pool, pattern: ['shroud', 'strike', 'rest'],
    intents: {
      // its signature: a shroud that wind cannot lift, only light
      shroud: { counters: ['light'], text: {
        F: { jp: 'ほし が ひかり を かくした 。 かぜ では はれない 。', en: 'The star hid its light. Wind won\'t clear it.' },
        E: { jp: '{星|ほし} が {光|ひかり} を {隠|かく}した 。 {風|かぜ} で は {晴|は}れない 。 {光|ひかり} で なければ 。', en: 'The star hid its light. Wind won\'t clear it; only light will.' },
        I: { jp: '{星|ほし} の {光|ひかり} が {霧|きり} の よう に {広|ひろ}がった 。 {風|かぜ} で は {散|ち}らない 。 {光|ひかり} だけ が {晴|は}らせる 。', en: 'Starlight spreads like fog. Wind won\'t scatter it; only light can clear it.' },
        A: { jp: '{星|ほし} の {光|ひかり} が {重|おも}く {垂|た}れ{込|こ}める 。 {風|かぜ} に は {動|うご}かず 、 {光|ひかり} に だけ {晴|は}れる 。', en: 'Starlight hangs heavy in the air. Wind won\'t move it; it clears for light alone.' },
      } },
    },
    intro: { jp: '{星図|せいず} の {星|ほし} が {一|ひと}つ 、 {紙|かみ} から {抜|ぬ}け{出|だ}して {飛|と}んで いる 。 {群|む}れ から はぐれた ムクドリ の よう に 。', en: 'One star has slipped off the star chart and is flying about, like a starling lost from its flock.' },
    settle: { jp: '{星|ほし} は {星図|せいず} の {上|うえ} に {戻|もど}って 、 {元|もと} の {場所|ばしょ} で {光|ひか}った 。', en: 'The star goes back onto the chart and shines in its old place.' } };

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'sb.bat': 'sb2', 'sb.hare': 'sb2', 'sb.starling': 'sb2' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: a twelve-chapter Snowbell creature (P10, E23) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    RB.creaturesA.auditEnemy('sb.bat', 'moth', 'incomplete', note);
    RB.creaturesA.auditEnemy('sb.starling', 'wisp', 'incomplete', note);
  }

  // ---- placements: twelve-chapter journeys only --------------------------------------------------------------------
  const place = (mapId, f) => { const m = C.maps[mapId]; if (m) (m.foes = m.foes || []).push(Object.assign({ if: 'ed>=2' }, f)); };
  place('sb.obs_gallery', { id: 'x1', enemy: 'sb.bat', x: 10, y: 11, patrol: 2 });
  place('sb.obs_path', { id: 'x2', enemy: 'sb.hare', x: 20, y: 31, patrol: 2 });
  place('sb.obs_charts', { id: 'x3', enemy: 'sb.starling', x: 12, y: 9, patrol: 1 });

  // ---- a changed-world line: word of Manybridge has reached the hamlet --------------------------------------------
  const rokuta = (C.maps['sb.hamlet'] && C.maps['sb.hamlet'].npcs || []).filter((n) => n.id === 'rokuta' && n.talk && typeof n.talk !== 'string');
  for (const n of rokuta) n.talk = [{ if: 'ed>=2&mb2_done&!post&!sb2_rokuta_city', scene: 'sb2.rokuta_city' }].concat(n.talk);
  RB.script.add(`
@scene sb2.rokuta_city
# Twelve-chapter journeys: Rokuta has heard of a town of eight hundred bridges.
!faceplayer
rokuta: なあ 、 {橋|はし} が {八百|はっぴゃく} も ある {町|まち} って 、 {本当|ほんとう} に ある の か ？ || Hey, is there really a town with eight hundred bridges?
rokuta[smirk]: …… {嘘|うそ} だ 。 {数|かぞ}えた やつ 、 いない だろ 。 || …Liar. Nobody's ever counted them.
?(comp=nao) comp: {数|かぞ}えた やつ は いない 。 だから 「{八百|やお}」 なんだ 。 たくさん と いう {意味|いみ} だ よ 。 || Nobody has. That's why it's "yao": it just means a great many.
!set sb2_rokuta_city
`, 'sb2/world');
})(RB.content);
