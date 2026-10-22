// The audit's Tier A reading fixes (CC-021 phase 2a F01–F07, F10–F12, F14–F17 and F13's 開け閉め; phase 1's 何 → なん,
// except 「三十の何だったんだ」, which stays an open question), as re-tiered in CC-022 and put in the backlog by CL-046;
// built with RBN-QA-132 (三分の一, F14; Agnes 6353337774; Local CL-231). Display only: each fix changes a furigana
// reading (or its grouping), never the words, so the spoken text of every line is unchanged. In node:
//  1. at each listed place the old markup is gone and the corrected one is there, as many times as listed;
//  2. the spoken text (the line without readings or spacing) is the same before and after, and the reading changed;
//  3. every Kansai "=" key still matches the standard line it stands for;
//  4. Tamotsu's three lines read 三分 as さんぶん (RBN-QA-132); what Word Help makes of it is
//     tests/unit/fraction_lookup.test.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

// [finding, file under src/, old markup, corrected markup, places]
const FIXES = [
  ['F01', 'content/cases/50_react.js', '{教|おし}わった', '{教|おそ}わった', 1],
  ['F01', 'content/ch3/44_scenes_people2.js', '{教|おし}わった', '{教|おそ}わった', 1],
  ['F02', 'content/ch4/30_scenes_hamlet.js', '{遅|おそ}れる', '{遅|おく}れる', 1],
  ['F02', 'content/yn/22_scenes_town.js', '{遅|おそ}れて', '{遅|おく}れて', 1],
  ['F03', 'content/hall/22_w2_scenes.js', '{明|あか}かり', '{明|あ}かり', 1],
  ['F04', 'content/01_inkweaving.js', '{凍|こお}える', '{凍|こご}える', 1],
  ['F05', 'content/yn/33_creatures.js', '{跳|は}び{出|だ}して', '{跳|と}び{出|だ}して', 1],
  ['F06', 'content/ch6/52_scenes_climax.js', '{消|け}える', '{消|き}える', 1],
  ['F07', 'content/zzz_living/52_cr.js', '{霧|きり} を {食|く}べる', '{霧|きり} を {食|た}べる', 1],
  ['F10', 'content/pastimes/20_scenes.js', '{お願|ねが}い', 'お{願|ねが}い', 1],
  ['F11', 'content/ch5/20_town.js', 'と {書|か}かれて {入|い}って いる', 'と {書|か}かれて {入|はい}って いる', 1],
  ['F11', 'content/practice_b/20_proof.js', '{箱|はこ} に {入|い}って いる', '{箱|はこ} に {入|はい}って いる', 1],
  ['F11', 'content/returns/10_kotonoha.js', '{籠|かご} に {入|い}って いる', '{籠|かご} に {入|はい}って いる', 1],
  ['F11', 'content/yn/22_scenes_town.js', '{籠|かご} に {入|い}った {卵|たまご}', '{籠|かご} に {入|はい}った {卵|たまご}', 1],
  ['F11', 'content/zzz_living/50_lf.js', '{額|がく} に {入|い}った', '{額|がく} に {入|はい}った', 1],
  ['F11', 'content/mb/21_scenes_main.js', '{干物|ひもの} 、 {入|い}りました', '{干物|ひもの} 、 {入|はい}りました', 1],
  ['F12', 'content/ko/23_scenes_people.js', '{一枚|いちまい} ぐらい {入|はい}れて くれる', '{一枚|いちまい} ぐらい {入|い}れて くれる', 1],
  ['F13', 'content/ch6/40_learn.js', '{開|ひら}け{閉|し}め', '{開|あ}け{閉|し}め', 1],
  ['F14', 'content/ch3/40_scenes_main.js', '{三分|さんぶ} の {一|いち}', '{三分|さんぶん} の {一|いち}', 1],
  ['F14', 'content/ch3/42_scenes_people.js', '{三分|さんぶ} の {一|いち}', '{三分|さんぶん} の {一|いち}', 1],
  ['F14', 'content/ch3/43_scenes_end.js', '{三分|さんぶ} の {一|いち}', '{三分|さんぶん} の {一|いち}', 1],
  ['F15', 'content/ch6/51_scenes_archive.js', '{何百|なんびゃく} {回|かい}', '{何百回|なんびゃっかい}', 1],
  ['F16', 'content/hall/25_w5_scenes.js', '{何|なん}{十|じゅう} {杯|ぱい}', '{何十杯|なんじゅっぱい}', 1],
  ['F17', 'content/dialect/kansai_99_hall.js', '{百|ひゃく} {本|ほん}', '{百本|ひゃっぽん}', 2],
  ['F17', 'content/hall/20_scenes_hall.js', '{百|ひゃく} {本|ほん}', '{百本|ひゃっぽん}', 1],
  ['H022', 'content/ch1/30_scenes_arrival.js', '{何|なに} と {書|か}けば', '{何|なん} と {書|か}けば', 1],
  ['H022', 'content/ch2/21_scenes_main.js', 'まだ {何|なに} とも', 'まだ {何|なん} とも', 1],
  ['H022', 'content/ch3/44_scenes_people2.js', '{何|なに} の {話|はなし} かしら', '{何|なん} の {話|はなし} かしら', 1],
  ['H022', 'content/ch6/50_scenes_road.js', '{何|なに} の {音|おと} も しない', '{何|なん} の {音|おと} も しない', 1],
  ['H022', 'content/ch6/52_scenes_climax.js', '{何|なに} と でも {取|と}れる', '{何|なん} と でも {取|と}れる', 1],
  ['H022', 'content/hall/31_w7_scenes.js', '{何|なに} の こと か', '{何|なん} の こと か', 4],
  ['H022', 'content/dialect/kansai_99_hall.js', '{何|なに} の こと か', '{何|なん} の こと か', 4],
  ['H022', 'content/hall/15_w1_learning.js', '{地図|ちず} の {何|なに} です か', '{地図|ちず} の {何|なん} です か', 1],
  ['H022', 'content/mb/23_scenes_under.js', '{何|なに} の {車輪|しゃりん} か', '{何|なん} の {車輪|しゃりん} か', 1],
  ['H022', 'content/pages/40_topics.js', '{何|なに} でも {入|い}れられる', '{何|なん} でも {入|い}れられる', 1],
  ['H022', 'content/wordplay/20_reflect.js', '{何|なに} の {役|やく} に も {立|た}たない', '{何|なん} の {役|やく} に も {立|た}たない', 1],
  ['H022', 'content/yn/20_scenes_call.js', '{何|なに} の {音|おと} も しない', '{何|なん} の {音|おと} も しない', 2],
  ['H022', 'content/yn/23_scenes_vents.js', '{何|なに} の {音|おと} も {来|こ}ない', '{何|なん} の {音|おと} も {来|こ}ない', 1],
  ['H022', 'content/yn/33_creatures.js', '{何|なに} の {音|おと} も {来|こ}ない', '{何|なん} の {音|おと} も {来|こ}ない', 1],
  ['H022', 'content/zzz_living/21_el.js', '{何|なに} の {形|かたち} か', '{何|なん} の {形|かたち} か', 1],
];

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const spoken = (jp) => RB.jp.plain(jp).replace(/\s+/g, '');
  // ---- 1. the places
  const bad = [];
  for (const [id, file, old, fix, n] of FIXES) {
    const s = fs.readFileSync(path.join(root, 'src', file), 'utf8');
    const o = s.split(old).length - 1, f = s.split(fix).length - 1;
    if (o !== 0 || f < n) bad.push(`${id} ${file}: old ×${o}, corrected ×${f} (want 0 and ${n})`);
  }
  t.eq(bad, [], 'every Tier A place carries the corrected reading and none the old (' + FIXES.reduce((a, r) => a + r[4], 0) + ' places in ' + new Set(FIXES.map((r) => r[1])).size + ' files)');
  // ---- 2. display only
  const said = FIXES.filter(([, , old, fix]) => spoken(old) !== spoken(fix)).map((r) => r[0] + ' ' + r[2]);
  t.eq(said, [], 'the spoken text is unchanged by every fix (the words stay; only the reading moves)');
  const same = FIXES.filter(([, , old, fix]) => RB.jp.reading(old) === RB.jp.reading(fix)).map((r) => r[0] + ' ' + r[2]);
  t.eq(same, [], 'and every fix changes the reading shown');
  // ---- 3. the Kansai keys
  t.eq(RB.dialect.errors(), [], 'every Kansai "=" key still matches its standard line');
  // ---- 4. Tamotsu's 三分
  const lines = [];
  for (const [id, sc] of Object.entries(RB.content.scenes)) {
    const walk = (o) => { if (!o || typeof o !== 'object') return; if (typeof o.jp === 'string' && o.jp.includes('{三分|さんぶん} の')) lines.push([id, o.jp]); for (const k in o) if (k !== 'jp') walk(o[k]); };
    walk(sc);
  }
  t.eq(lines.map((l) => l[0]).sort(), ['co.assembly', 'co.tamotsu', 'co.tokiwa_confront'], 'Tamotsu\'s three lines read 三分 as さんぶん');
};
