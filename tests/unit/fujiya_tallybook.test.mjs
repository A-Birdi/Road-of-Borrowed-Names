// 先々代 at Fujiya (Agnes 6353337774, 6353618099; Local CL-232): the tally book's line said the rubbings were taken by
// "Fujiya's grandmother", but 先々代 is the head of the house two generations back, and the source settles no family
// relationship (Fujiko's own clue speaks of her grandmother; the map's comment said grandfather). The English is now
// neutral, the Japanese (and so its voice key and ledger key) unchanged, and the ledger's English matches. In node.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const c = RB.content.scenes['mb.fujiya_tallybook'].cmds.find((x) => x.op === 'say' && /先々代/.test(x.jp));
  t.ok(!!c && c.jp === '{古|ふる}い {帳面|ちょうめん} 。 {藤屋|ふじや} の {先々代|せんせんだい} が 、 {橋|はし} の {札|ふだ} を {紙|かみ} に {写|うつ}し{取|と}った {拓本|たくほん} が {挟|はさ}まって いる 。', 'the Japanese is as it was');
  t.ok(!!c && c.en === 'An old ledger. Tucked inside are rubbings of the bridges\' plaques, taken by the head of Fujiya two generations back.' && !/grand(mother|father)/i.test(c.en), 'the English names the head of the house two generations back, and no relative (' + (c && c.en) + ')');
  const led = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'review', 'language', 'mb.json'), 'utf8'));
  const e = Object.entries(led).filter(([k, v]) => k.startsWith('scene:mb.fujiya_tallybook#') && v.jp === c.jp);
  t.ok(e.length === 1 && e[0][1].en === c.en, 'its language-ledger entry carries the same English (' + (e[0] && e[0][0]) + ')');
};
