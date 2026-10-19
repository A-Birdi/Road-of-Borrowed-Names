/* The prologue's six captions, and the list of spoken lines the game shows outside its compiled scenes.
 *
 * The prologue (src/ui/40_create.js) shows these over the shots drawn by src/ui/41*_prologue_*.js; the narrator says
 * them (Robin, 2026-10-19: "every line in-game should have spoken lines").
 *
 * RB.content.spokenLines: lines shown by the game's own code rather than by a scene's commands, each with the scene id
 * the game shows it under. tools/voice/lines.mjs lists them with the scenes' lines, so they are recorded like any
 * other line; the voicebank (src/audio/52_voicebank.js) finds a line's recording by that scene id and its Japanese.
 *   { scene, who: 'narr' | 'pc' | a character id, jp, en, expr?, file }
 * RB.content.spokenSources: functions returning such lines, for a part of the game that makes them from its own data
 * (a shut door's words, a marked object's: src/engine/50_world.js). The code that shows a line passes the same scene id
 * (sceneId) to the dialogue strip.
 */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content.spokenLines = RB.content.spokenLines || [];
RB.content.spokenSources = RB.content.spokenSources || [];

// Six shots: the title's lantern road, Hana's teahouse twice, the riverbank lantern, the bridge, and the traveller
// walking up the road into the distance (draw: the shot's kind for RB.prologueArt).
RB.content.prologue = [
  { jp: '{灯|ひ} の {道|みち} は 、 {通|とお}った {場所|ばしょ} の {名前|なまえ} を {覚|おぼ}えている 。', en: 'The lantern roads remember the name of every place they pass through.', draw: 'road' },
  { jp: '{夜明|よあ}け 、 {茶屋|ちゃや} の ハナ は お{茶|ちゃ} を ふたつ いれた 。', en: 'At dawn, Hana at the teahouse poured two cups of tea.', draw: 'tea' },
  { jp: 'でも 、 ふたつ{目|め} が {誰|だれ} の ため なのか 、 {思|おも}い{出|だ}せなかった 。', en: 'But she could not remember who the second cup was for.', draw: 'cup' },
  { jp: '{川|かわ}べり の {灯|あか}り から 、 {名前|なまえ} が ひと{文字|もじ} ずつ {消|き}えていった 。', en: 'On the riverbank, the name on a lantern faded, one letter at a time.', draw: 'lantern' },
  { jp: '{朝|あさ} に なって も {橋|はし} は あった 。 ただ 、 {向|む}こう{岸|ぎし} に は もう {届|とど}かない 。', en: 'By morning the bridge was still there. It just no longer reached the other bank.', draw: 'bridge' },
  { jp: 'そして 、 {古|ふる}い {文字|もじ} を {読|よ}める {旅人|たびびと} が ひとり 、 {葦|あし}ノ{瀬|せ} へ {歩|ある}いていた 。', en: 'And a traveller who could still read the old letters was walking toward Reedwake.', draw: 'walker' },
];
for (const s of RB.content.prologue) RB.content.spokenLines.push({ scene: 'prologue', who: 'narr', jp: s.jp, en: s.en, file: 'content/00_prologue' });
