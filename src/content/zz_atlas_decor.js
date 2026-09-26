/* Settlement details restored by completed Unwritten Atlas expeditions
 * (flags atlas_restore_1..6, set by src/atlas/50_run.js; see docs/ATLAS.md).
 * Each is a small visible change with an interactable line. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const add = (map, props) => { if (C.maps[map]) C.maps[map].props = (C.maps[map].props || []).concat(props); };
  // 1 — Reedwake: a freshly painted signboard by Kōji's ferry landing
  add('rw.village', [{ p: 'sign', x: 47, y: 17, scene: 'at.decor_ferry', if: 'atlas_restore_1' }]);
  // 2 — Saltglass: a crate of returned cargo tags by the harbour office
  add('sg.harbor', [{ p: 'crate', x: 18, y: 11, scene: 'at.decor_tags', if: 'atlas_restore_2' }]);
  // 3 — Cinder Orchard: named saplings along the firebreak
  add('co.village', [
    { p: 'bush', x: 5, y: 8, if: 'atlas_restore_3' }, { p: 'bush', x: 7, y: 8, if: 'atlas_restore_3' },
    { p: 'stone_marker', x: 9, y: 8, scene: 'at.decor_saplings', if: 'atlas_restore_3' },
    { p: 'bush', x: 11, y: 8, if: 'atlas_restore_3' },
  ]);
  // 4 — Snowbell: waymarker stones back on the Star Stair
  add('sb.obs_path', [
    { p: 'stone_marker', x: 16, y: 37, scene: 'at.decor_mark300', if: 'atlas_restore_4' },
    { p: 'stone_marker', x: 8, y: 23, scene: 'at.decor_mark200', if: 'atlas_restore_4' },
    { p: 'stone_marker', x: 20, y: 15, scene: 'at.decor_mark100', if: 'atlas_restore_4' },
  ]);
  // 5 — Lanternfall: a second board for objections
  add('lf.town', [{ p: 'noticeboard', x: 29, y: 17, scene: 'at.decor_objections', if: 'atlas_restore_5' }]);
  // 6 — the lantern road: a new lantern with a new place name
  add('rw.road', [{ p: 'lantern', x: 9, y: 8, o: { lit: true }, scene: 'at.decor_lantern', if: 'atlas_restore_6' }]);
  RB.lex.add(RB.lex.parseTable(`
看板|かんばん|n|E|signboard
渡し場|わたしば|n|I|ferry landing
夜明け|よあけ|n|I|dawn
苗木|なえぎ|n|A|sapling
抜く|ぬく|v5k|E|to pull out
名札|なふだ|n|I|name tag
反対|はんたい|vs|E|opposition, objection
意見|いけん|n|E|opinion
歓迎|かんげい|vs|I|welcome
書き込み|かきこみ|n|I|written note, entry (on a board or page)
灯籠|とうろう|n|I|stone/paper lantern
火袋|ひぶくろ|n|A|light chamber (the lit box of a lantern)
新田|しんでん|n|A|newly reclaimed fields; (in place names) a newly settled village
葦原|あしはら|n|A|reed plain
荷札|にふだ|n|I|cargo tag, luggage label
持ち主|もちぬし|n|I|owner
道標|みちしるべ|n|A|waymarker, signpost
  `), 'atlas_decor');
})(RB.content);

RB.script.add(`
@scene at.decor_ferry
narr: {新|あたら}しい {看板|かんばん} だ 。 ペンキ が まだ {乾|かわ}いて いない 。 || A new signboard. The paint isn't dry yet.
narr: 「 {渡|わた}し{場|ば} ── {夜明|よあ}け に {出|で}ます 」 || "Ferry landing — we cross at dawn."
?(comp) comp: {前|まえ} の {看板|かんばん} は 、 {字|じ} が {消|き}えて いた よね 。 || The old sign had lost its letters, hadn't it?

@scene at.decor_mark300
narr: {新|あたら}しい {道標|みちしるべ} だ 。 「 {天文台|てんもんだい} まで あと {三百|さんびゃく}{段|だん} 」 || A new waymarker. "Observatory: 300 steps to go."

@scene at.decor_mark200
narr: 「 {天文台|てんもんだい} まで あと {二百|にひゃく}{段|だん} 」 || "Observatory: 200 steps to go."
?(comp) comp: {雪|ゆき} が {降|ふ}って も 、 これ なら {迷|まよ}わない ね 。 || Even in snow, nobody will get lost now.

@scene at.decor_mark100
narr: 「 {天文台|てんもんだい} まで あと {百|ひゃく}{段|だん} 。 {灯|あか}り が {見|み}えたら 、 もう すぐ 」 || "Observatory: 100 steps to go. Once you can see the lamp, you're nearly there."

@scene at.decor_tags
narr: {港|みなと} {事務所|じむしょ} の {前|まえ} に 、 {木箱|きばこ} が {一|ひと}つ {置|お}いて ある 。 {中|なか} は {荷札|にふだ} で いっぱい だ 。 || A wooden crate stands outside the harbour office, full of cargo tags.
narr: 「 {持|も}ち{主|ぬし} に {返|かえ}りました 。 {読|よ}めない {字|じ} は 、 もう ありません 」 || "Returned to their owners. There are no unreadable letters left."
?(comp) comp: {字|じ} が {戻|もど}る と 、 {荷物|にもつ} も {帰|かえ}れる んだ ね 。 || When the letters come back, the cargo can go home too.

@scene at.decor_saplings
narr: {苗木|なえぎ} {一本|いっぽん} ずつ に 、 {小|ちい}さな {名札|なふだ} が ついて いる 。 || Every sapling has a small name tag.
narr: 「 この {苗木|なえぎ} に は {名前|なまえ} が あります 。 {抜|ぬ}かないで ください 」 || "These saplings have names. Please don't pull them up."

@scene at.decor_objections
narr: {掲示板|けいじばん} の {隣|となり} に 、 もう {一枚|いちまい} {板|いた} が {増|ふ}えて いる 。 || Beside the notice board, a second board has appeared.
narr: 「 {反対|はんたい} {意見|いけん} {歓迎|かんげい} 」 || "Objections welcome."
narr: {下|した} に は 、 {小|ちい}さな {字|じ} の {書|か}き{込|こ}み が {何|なん}{行|ぎょう} も ある 。 || Below it, line after line has been written in small handwriting.

@scene at.decor_lantern
narr: {新|あたら}しい {灯籠|とうろう} だ 。 {火袋|ひぶくろ} に 、 {知|し}らない {地名|ちめい} が {書|か}いて ある 。 || A new lantern. On its light-box is the name of a place you don't know.
narr: 「 {葦原|あしはら}{新田|しんでん} 」 || "Ashihara Shinden" — shinden, "new fields": the old way of naming a newly settled village.
?(comp) comp: {去年|きょねん} は 、 なかった {村|むら} だ ね 。 || That village wasn't there last year.
`, 'zz_atlas_decor');
