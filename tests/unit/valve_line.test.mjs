// RBN-QA-121 (Agnes 6346458503; Cloud CC-126 §7): in the Channel, the wheel at either end describes itself as a small
// wheel piped to the big valve in the middle chamber, then the shared forward line said "You turn the big valve" while
// you stood at the small one. Now that line says only "the valve", true wherever it is turned:
//  1. the forward line: 「{弁|べん} を {回|まわ}す 。 …」 / "You turn the valve. …", with no 大きな and no "big"; the rest of it as
//     it was;
//  2. unchanged: the reverse line (already the plain 弁), the end wheels' own line, the calls (both ends through
//     yn.shutter_end, the middle through yn.shutter directly), the flag and the refreshes;
//  3. the language ledger holds the new line, self-reviewed for this change, and no longer the old one.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const NEW = { jp: '{弁|べん} を {回|まわ}す 。 {下|した} の {通|とお}り{道|みち} に {湯気|ゆげ} が {流|なが}れ{込|こ}み 、 {上|うえ} の {通|とお}り{道|みち} が {晴|は}れた 。', en: 'You turn the valve. Steam floods the lower passage, and the upper one clears.' };
  const OLD = '{大|おお}きな {弁|べん} を {回|まわ}す 。 {下|した} の {通|とお}り{道|みち} に {湯気|ゆげ} が {流|なが}れ{込|こ}み 、 {上|うえ} の {通|とお}り{道|みち} が {晴|は}れた 。';
  // 1. the forward line
  const cmds = C.scenes['yn.shutter'].cmds;
  const says = cmds.filter((c) => c.op === 'say');
  const fwd = says[0], back = says[1];
  t.ok(fwd && fwd.jp === NEW.jp && fwd.en === NEW.en && !/大きな|{大|おお}きな/.test(fwd.jp) && !/\bbig\b/i.test(fwd.en), 'the forward line says "the valve": ' + (fwd && fwd.en));
  // 2. unchanged around it
  t.ok(back && back.jp === '{弁|べん} を {戻|もど}す 。 {湯気|ゆげ} は {上|うえ} の {通|とお}り{道|みち} へ {戻|もど}り 、 {下|した} が {晴|は}れた 。' && back.en === 'You turn the valve back. The steam returns to the upper passage, and the lower clears.', 'the reverse line as it was');
  const end = C.scenes['yn.shutter_end'].cmds;
  t.ok(end.length === 2 && end[0].op === 'say' && /{小|ちい}さな {弁|べん} の {輪|わ}/.test(end[0].jp) && /small valve wheel/.test(end[0].en) && end[1].op === 'call' && end[1].args[0] === 'yn.shutter', 'the end wheels\' own line as it was, and they call the shared valve scene');
  const ops = cmds.map((c) => c.op + (c.op === 'say' ? '' : ':' + (c.args || []).join(' ')));
  t.ok(JSON.stringify(ops) === JSON.stringify(['if:yn_shutter -> back', 'say', 'set:yn_shutter', 'sfx:wind', 'refresh:', 'end:', 'say', 'unset:yn_shutter', 'refresh:']), 'the flag and the refreshes as they were (' + ops.join(', ') + ')');
  const valves = C.maps['yn.vents2'].props.filter((p) => p.p === 'yn_valve').map((p) => p.x + ',' + p.y + ':' + p.scene);
  t.ok(JSON.stringify([...new Set(valves)].sort()) === JSON.stringify(['19,15:yn.shutter', '29,5:yn.shutter_end', '4,18:yn.shutter_end']), 'the middle valve and the two end wheels as they were (' + [...new Set(valves)].join(' ') + ')');
  // 3. the ledger
  const led = JSON.parse(fs.readFileSync(path.join(root, 'docs/review/language/yn.json'), 'utf8'));
  const entries = Object.entries(led.entries || led);
  const now = entries.filter(([k, e]) => k.startsWith('scene:yn.shutter#') && e && e.jp === NEW.jp);
  const was = entries.filter(([, e]) => e && e.jp === OLD);
  t.ok(now.length === 1 && now[0][1].status === 'self-reviewed' && /^RBN-QA-121 self-review/.test(now[0][1].ref) && now[0][1].en === NEW.en && !was.length, 'the ledger holds the new line, self-reviewed for this change, and not the old one');
};
