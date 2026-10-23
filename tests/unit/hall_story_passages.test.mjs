// RBN-QA-166 B (Agnes 6375876823, 6376014281; Local CL-252; Cloud CC-155 §5, CC-156 §5): in each wing's story room the
// task asked you to put "the four pictures" back in order, but what you arrange are four written passages (the
// scroll's words under its pictures). The prompts and hints now say so (B1: the English UI text only; the narration,
// which is recorded, as it was). In node, for the ten wings' story tasks:
//  1. no prompt, hint or reason says "picture"; each prompt names the passages;
//  2. everything else in them is as before: tiles, answers, items, kinds, the hints' substance and the follow-up
//     question (hashed without the prompts, "passage" read back as "picture", against the task head before RBN-QA-166).
import { load } from '../lib/load.mjs';
import { createHash } from 'node:crypto';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const ids = [];
  for (let w = 1; w <= 10; w++) ids.push('hall.w' + w + '.story');
  ids.push('hall.w10.story_q');
  const tasks = ids.map((id) => [id, C.challenges[id]]);
  t.ok(tasks.every(([, c]) => c && c.tiers), 'the ten story tasks and the last wing\'s follow-up are there');
  // 1.
  const said = [];
  for (const [id, c] of tasks) for (const [tier, steps] of Object.entries(c.tiers)) for (const s of steps) {
    const shown = JSON.stringify([s.prompt, s.orderHint, (s.options || []).map((o) => o.why)]);
    if (/picture/i.test(shown)) said.push(id + ' ' + tier + ': ' + shown.slice(0, 120));
    if (id.endsWith('.story') && !/passages/.test(s.prompt.en)) said.push(id + ' ' + tier + ' prompt: ' + s.prompt.en);
  }
  t.eq(said, [], 'no prompt, hint or reason says "picture"; each prompt names the passages');
  // 2.
  const h = createHash('sha256');
  // (the prompts are left out: they are what changed; in the hints and reasons the one word is read back)
  for (const [id, c] of tasks) h.update(id + JSON.stringify(c.tiers, (k, v) => (k === 'prompt' ? undefined : typeof v === 'string' ? v.replace(/passages?/g, (m) => (m === 'passage' ? 'picture' : 'pictures')) : v)) + JSON.stringify(c.stretchA || null));
  t.eq(h.digest('hex').slice(0, 16), '332a459c10a48fc7', 'everything else in them as before (tiles, answers, items, kinds, the hints\' substance, the follow-up)');
};
