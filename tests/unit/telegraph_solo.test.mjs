// RBN-QA-003 (Agnes, QA): travelling alone, a move aimed at "both" must not be told as "both of you". Every telegraph
// line that names the two of you (ふたり / 二人, "both", "the two of you") has, for the same move and tier, a wording for
// one in RB.content.intentTextSolo, and that wording names no second person; the wording is used only without a
// companion (src/ui/80_combat.js linePool).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const TWO_JP = /ふたり|\{二人\|ふたり\}|二人/, TWO_EN = /\bboth\b|two of you/i;
  const need = [];
  for (const k in C.intentText) for (const lv in C.intentText[k]) for (const l of C.intentText[k][lv]) if (TWO_JP.test(l.jp) || TWO_EN.test(l.en)) need.push([k, lv]);
  t.ok(need.length >= 6, 'telegraph lines that name the two of you: ' + need.map((x) => x.join(' ')).join(', '));
  for (const [k, lv] of need) {
    const solo = (C.intentTextSolo[k] || {})[lv] || [];
    t.ok(solo.length > 0, k + ' ' + lv + ': a wording for one');
    t.ok(solo.every((l) => !TWO_JP.test(l.jp) && !TWO_EN.test(l.en) && !/\$/.test(l.jp)), k + ' ' + lv + ': it names no second person and no run-time name');
  }
  // the moves with a solo wording are aimed at both (the engine's target), and nothing else is
  const INT = RB.combat && RB.combat.INTENTS ? RB.combat.INTENTS : null;
  if (INT) for (const k in C.intentTextSolo) t.eq(INT[k] && INT[k].target, 'both', k + ' is a move at both');
};
