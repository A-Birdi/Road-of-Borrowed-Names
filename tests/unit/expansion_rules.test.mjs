// The expansion's content rules (tools/expansion_rules.mjs): each catches what it should, and nothing in today's
// content breaks them (tools/validate_grandfather.json is empty).
import fs from 'node:fs';
import { load, root } from '../lib/load.mjs';
import { expansionRules } from '../../tools/expansion_rules.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const GF = JSON.parse(fs.readFileSync(root + '/tools/validate_grandfather.json', 'utf8'));
  t.ok(!GF.tiers.length && !GF.unknown.length && !GF.fiction.length, 'no exceptions: every existing challenge, token and note passes');
  t.eq(expansionRules(RB, RB.content, { grandfather: GF }).errors, [], 'today\'s content passes every rule');
  // synthetic content that breaks each rule
  const step = { kind: 'choose', options: [{ en: 'a', ok: true }] };
  const C = {
    challenges: {
      'mb.three': { tiers: { F: [step], E: [step], I: [step] } },
      'mb.early': { tiers: { F: [step], E: [step], I: [step], A: [step] }, concepts: ['mod_both'] },
      'mb.hear': { tiers: { F: [{ kind: 'listen' }], E: [step], I: [step], A: [step] } },
      'mb.ok': { tiers: { F: [step], E: [step], I: [step], A: [step] }, concepts: ['mod_two'] },
    },
    notes: { mb_lore: { title: { en: 'x' } }, mb_real: { fiction: false } },
    scenes: {
      'mb.leak': { cmds: [{ op: 'say', jp: 'あ', en: 'The Kotonoha shore is far.' }] },
      'mb.leak.post': { cmds: [{ op: 'say', jp: 'あ', en: 'Kotonoha, after it all.' }] },
      'ko.fine': { cmds: [{ op: 'say', jp: 'あ', en: 'Kotonoha at last.' }] },
    },
    reveals: { ko: ['Kotonoha'] },
    chapterOfPrefix: { mb: 'mb1', ko: 'ko' },
  };
  RB.phase.concept('mod_both', { kind: 'modifier', ch: 'kr', taught: 'kr_protect2' });
  RB.phase.concept('mod_two', { kind: 'modifier', ch: 'mb1', taught: 'mb_unravel2' });
  const r = expansionRules(RB, C, { unknownTok: new Map([['ナゾ', 'mb.leak:1']]) });
  const has = (re) => r.errors.some((e) => re.test(e));
  t.ok(has(/mb\.three: missing tier A/), 'a missing tier is an error');
  t.ok(has(/no lexicon entry for ナゾ/), 'an unknown token is an error');
  t.ok(has(/note mb_lore: say whether/) && !has(/mb_real/), 'lore without a fiction flag is an error; a flagged note is not');
  t.ok(has(/mb\.leak: names Kotonoha/) && !has(/mb\.leak\.post/) && !has(/ko\.fine/), 'a later chapter named early is an error; post-story and its own chapter are not');
  t.ok(has(/mb\.early \(mb1\): uses mod_both, taught later \(kr\)/) && !has(/mb\.ok/), 'a concept used before it is taught is an error');
  t.ok(has(/mb\.hear\[F\]\[0\]: a listening step needs a transcript/), 'a listening step without a transcript is an error');
  t.eq(r.errors.length, 6, 'and nothing else: ' + r.errors.join(' | '));
  const g = expansionRules(RB, C, { grandfather: { tiers: ['mb.three'] }, unknownTok: new Map() });
  t.ok(!g.errors.some((e) => /mb\.three/.test(e)) && g.found.tiers.indexOf('mb.three') >= 0, 'a named exception is allowed, and still listed');
};
