// The Hall's odd-one-out tasks explain the odd card (Batch 2, row 3: CL-739 (a), CL-741/742/759/760; Cloud CC-581,
// CC-582, CC-583; Local CL-812, CL-814, CL-816; Agnes 6757191548, 6768649326, 6868287302). In each wing's two card
// tasks (hall.w<N>.counter0/1), at its four levels, the step's explanation is the odd card's own note: shown after a
// right answer (helped or not) and with the answer when it is revealed, never after a wrong pick (src/ui/65_challenge.js).
// The notes on the cards that follow the rule give their reason and end "This one follows the rule.", never "correct".
// On the content as built:
//  1. the shape: 20 tasks, 4 levels each, one step per level, four cards per step, exactly one of them odd;
//  2. every step's explanation is { en: <the odd card's note> }, and no explanation holds "$" (so nothing in it is
//     substituted when it is shown);
//  3. every one of the 240 rule-following notes ends "This one follows the rule." and none says "correct"; together
//     they are the agreed text (a fingerprint of the 240, as this change writes them);
//  4. among the 80 odd notes only three change: Wing 1's two closing "This is the one." go, and Wing 3 set 2 A3's
//     reason is Agnes's correction (its Japanese kept); with those three put back as they were, the 80 are as before;
//  5. everything else in every Hall task is as before: the cards (their Japanese, which is odd, their order), the
//     prompts, items, levels and contexts, the stretch questions (Grow at Advanced), and every other Hall task; and
//     every task outside the Hall is as before (no sweep): fingerprints taken on the parent, with the counter notes
//     and the new explanations left out.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const J = (o) => JSON.stringify(o, (k, v) => (typeof v === 'function' ? undefined : v));
  const fp = (x) => crypto.createHash('sha256').update(J(x)).digest('hex').slice(0, 16);
  const FOLLOWS = 'This one follows the rule.';
  const ids = [];
  for (let w = 1; w <= 10; w++) for (const k of ['counter0', 'counter1']) ids.push('hall.w' + w + '.' + k);

  // 1. the shape
  const shape = ids.map((id) => {
    const c = C.challenges[id];
    return c ? ['F', 'E', 'I', 'A'].map((tier) => { const s = c.tiers[tier] || []; return [s.length, s[0] ? s[0].options.length : 0, s[0] ? s[0].options.filter((o) => o.ok).length : 0].join(':'); }).join(' ') : 'missing';
  });
  t.ok(shape.every((x) => x === '1:4:1 1:4:1 1:4:1 1:4:1'), '1 20 tasks, 4 levels, one step each, four cards, one odd ' + J(shape.filter((x) => x !== '1:4:1 1:4:1 1:4:1 1:4:1')));
  const steps = [];
  for (const id of ids) for (const tier of ['F', 'E', 'I', 'A']) steps.push({ id, tier, st: C.challenges[id].tiers[tier][0] });

  // 2. the explanation: the odd card's own note
  const badEx = steps.filter(({ st }) => { const odd = st.options.find((o) => o.ok); return !(st.explain && J(st.explain) === J({ en: odd.why.en })); }).map((x) => x.id + ' ' + x.tier);
  t.ok(steps.length === 80 && badEx.length === 0, '2 every one of the 80 steps explains with its odd card\'s note ' + J({ n: steps.length, bad: badEx }));
  t.ok(steps.every(({ st }) => st.explain && typeof st.explain.en === 'string' && st.explain.en.indexOf('$') < 0), '2 no explanation holds "$" (nothing substituted in it)');

  // 3. the 240 notes on the cards that follow the rule
  const rule = [];
  for (const { id, tier, st } of steps) st.options.forEach((o, i) => { if (!o.ok) rule.push({ at: id + ' ' + tier + ' ' + (i + 1), en: o.why ? o.why.en : null }); });
  const badRule = rule.filter((r) => !r.en || !r.en.endsWith(' ' + FOLLOWS) || /correct/i.test(r.en)).map((r) => r.at);
  t.ok(rule.length === 240 && badRule.length === 0, '3 the 240 rule-following notes give a reason and end "' + FOLLOWS + '", none says "correct" ' + J({ n: rule.length, bad: badRule }));
  t.ok(fp(rule) === RULE_FP, '3 the 240 notes are the agreed text ' + J({ fp: fp(rule) }));

  // 4. the 80 odd notes: three changed, as agreed; the rest as before
  const odd = {};
  for (const { id, tier, st } of steps) odd[id + ' ' + tier] = st.options.find((o) => o.ok).why.en;
  const changed = Object.keys(NEW).filter((k) => odd[k] === NEW[k]);
  t.ok(changed.length === 3, '4 the three changed odd notes, as agreed ' + J(Object.keys(NEW).map((k) => [k, odd[k]])));
  const back = Object.assign({}, odd);
  for (const k of Object.keys(OLD)) back[k] = OLD[k];
  t.ok(Object.keys(odd).length === 80 && fp(back) === ODD_FP, '4 with those three put back, the 80 odd notes are as before ' + J({ n: Object.keys(odd).length, fp: fp(back) }));

  // 5. everything else as before: the Hall's tasks without the counter notes and explanations, and every other task
  const strip = (id, c) => {
    if (ids.indexOf(id) < 0) return c;
    const o = RB.util.deepClone(c);
    for (const tier of Object.keys(o.tiers)) for (const st of o.tiers[tier]) { delete st.explain; for (const op of st.options) delete op.why; }
    return o;
  };
  const hall = Object.keys(C.challenges).filter((k) => k.indexOf('hall.') === 0).sort();
  const rest = Object.keys(C.challenges).filter((k) => k.indexOf('hall.') !== 0).sort();
  t.ok(fp(hall.map((k) => [k, strip(k, C.challenges[k])])) === HALL_FP, '5 every Hall task as before: cards, which is odd, order, prompts, items, levels, contexts, stretch questions ' + J({ n: hall.length, fp: fp(hall.map((k) => [k, strip(k, C.challenges[k])])) }));
  t.ok(fp(rest.map((k) => [k, C.challenges[k]])) === REST_FP, '5 every task outside the Hall as before (no sweep) ' + J({ n: rest.length, fp: fp(rest.map((k) => [k, C.challenges[k]])) }));
};

// the three odd notes this change rewrites (Agnes 6868287302; Local CL-816; Cloud CC-583), and what they were
const NEW = {
  'hall.w1.counter0 F': 'A direction takes に: ひだり に まがる.',
  'hall.w1.counter1 F': 'You cross a river with を: かわ を わたる.',
  'hall.w3.counter1 A': 'The counterexample is the completed past event here. For an action to be done as soon as something happens, 次第 looks forward; for this past event: {夜明|よあ}け と ともに {撞|つ}いた.',
};
const OLD = {
  'hall.w1.counter0 F': 'A direction takes に: ひだり に まがる. This is the one.',
  'hall.w1.counter1 F': 'You cross a river with を: かわ を わたる. This is the one.',
  'hall.w3.counter1 A': 'The counterexample: after a noun 次第 means "depending on", and it never tells a past event. {夜明|よあ}け と ともに {撞|つ}いた.',
};
// computed on the parent (6d21b2c), before this change: the 80 odd notes; every Hall task with the counter tasks'
// notes and explanations left out; every task outside the Hall
const ODD_FP = 'aa5fd123a0b2e78f', HALL_FP = 'bc9c76b0738c5e92', REST_FP = 'd5a992f466eec43b';
// computed on this change: the 240 rule-following notes as agreed
const RULE_FP = 'cd7ca5fcdc2d91b6';
