// RBN-QA-130 (Agnes 6349358989, 6349514956; Local CL-218): once the retired actor's quest is done, Ginnojō's line looked
// back on a show that never plays ("…Forty years on, it's the same sound."), straight after he says he will do his
// turn tonight. His line now says the last line has come back and his body remembers the beat, true that night and
// on any later day:
//  1. yn.ginnojo_idle says the new line, once, and nothing else; the old line is gone from every scene;
//  2. his talk order is unchanged: the idle line once yn_actor_done is set, his quest scene before;
//  3. the quest's last lines still promise the turn, and nothing said after `!quest yn_actor done` speaks of it as
//     done (no line of his or Suzu's tells of the show in the past);
//  4. the new line has its ledger entry, self-reviewed, under its own key; the old entry is gone; every kanji has
//     its reading.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const NEW = '{最後|さいご} の {台詞|せりふ} が 、 {戻|もど}って {来|き}た 。 …… {四十年|よんじゅうねん} {経|た}って も 、 {笑|わら}い が {来|く}る {間|ま} は 、 {体|からだ} が {覚|おぼ}えて いる 。';
  const OLD = '{同|おな}じ {音|おと} だった よ';
  // 1. the line
  const idle = C.scenes['yn.ginnojo_idle'];
  const says = idle.cmds.filter((c) => c.op === 'say');
  t.ok(says.length === 1 && says[0].who === 'yn_ginnojo' && says[0].jp === NEW && !says[0].if, 'yn.ginnojo_idle: Ginnojō says the new line, once');
  t.ok(says[0] && says[0].en === 'The last line\'s come back. …Forty years on, my body still knows the beat where the laugh comes.', 'its English');
  const old = Object.entries(C.scenes).filter(([, sc]) => JSON.stringify(sc.cmds).includes(OLD)).map(([id]) => id);
  t.eq(old, [], 'the old line is in no scene');
  // 2. the talk order
  let talk = null;
  for (const a of C.maps['yn.playhouse'].npcs || []) if (a.id === 'yn_ginnojo') talk = a.talk;
  t.ok(Array.isArray(talk) && talk.length === 2 && talk[0].if === 'yn_actor_done' && talk[0].scene === 'yn.ginnojo_idle' && !talk[1].if && talk[1].scene === 'yn.ginnojo',
    'his talk: the idle line once yn_actor_done is set, his quest scene before');
  // 3. the quest's end and what follows it
  const quest = Object.values(C.scenes).find((sc) => sc.cmds.some((c) => c.op === 'quest' && /yn_actor\s+done/.test((c.args || []).join(' '))));
  t.ok(quest, 'a scene finishes the quest: ' + (quest && quest.id));
  if (quest) {
    const i = quest.cmds.findIndex((c) => c.op === 'quest' && /yn_actor\s+done/.test((c.args || []).join(' ')));
    const before = quest.cmds.slice(0, i).filter((c) => c.op === 'say').map((c) => c.jp).join(' ');
    t.ok(before.includes('{今夜|こんや} 、 {一席|いっせき} やる よ'), 'before it, he still says he will do his turn tonight');
    const after = quest.cmds.slice(i + 1).filter((c) => c.op === 'say');
    t.ok(after.every((c) => !/だった|やった|{演|えん}じた/.test(c.jp)), 'nothing said after it in that scene tells of the show in the past');
  }
  t.ok(says.every((c) => !/だった|やった|{演|えん}じた/.test(c.jp)), 'nor does the idle line');
  // 4. the ledger and the readings
  const ledger = JSON.parse(fs.readFileSync(path.join(root, 'docs/review/language/yn.json'), 'utf8'));
  const mine = Object.entries(ledger).filter(([k]) => k.startsWith('scene:yn.ginnojo_idle#'));
  t.ok(mine.length === 1 && mine[0][1].jp === NEW && mine[0][1].status === 'self-reviewed' && /RBN-QA-130/.test(mine[0][1].ref), 'one ledger entry, the new line, self-reviewed under RBN-QA-130');
  t.ok(!Object.values(ledger).some((e) => e && typeof e.jp === 'string' && e.jp.includes(OLD)), 'the old line\'s entry is gone');
  const bare = RB.jp.plain(NEW.replace(/\{[^}]*\}/g, '')).match(/[一-鿿々]/g);
  t.ok(!bare, 'every kanji in the line carries its reading');
};
