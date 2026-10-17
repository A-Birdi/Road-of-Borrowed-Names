// FR-1 (Foundations clarity): a new journey's mistakes cost nothing unless chosen otherwise, while an explicit choice
// and a save's own setting stay; the kana a story task needs are introduced just in time (only those, at most four);
// Foundations choice options are made of kana the player has met; a single kana gets feedback at its own scale; the
// opening letter quest starts and ends with the story, and the town requests' report stage is reached when they are all
// done in any order.
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });

  // ---- F17: the default, explicit choices, saves ----
  t.eq(RB.state.newCampaign().learn.assist, 'assist', 'a new journey without a choice: Assisted (no mistake cost)');
  t.eq(RB.state.newCampaign({ assist: 'normal' }).learn.assist, 'normal', 'an explicit Standard choice is kept');
  t.eq(['E', 'I', 'A'].map((pr) => RB.state.newCampaign({ profile: pr }).learn.assist), ['assist', 'assist', 'assist'], 'every level starts Assisted unless chosen otherwise');
  t.eq(RB.state.newCampaign({ difficulty: 'hard' }).learn.difficulty, 'hard', 'tactical difficulty stays its own axis');
  if (RB.save && RB.save.migrate) {
    const old = RB.state.newCampaign({ assist: 'normal' });
    t.eq(RB.save.migrate(old).learn.assist, 'normal', 'a save that chose Standard keeps it on load');
    const legacy = RB.state.newCampaign(); delete legacy.learn.assist;
    t.eq(RB.save.migrate(legacy).learn.assist, 'assist', 'a save with no setting at all gets the new default');
  }

  // ---- F01/F02: just in time ----
  const s = RB.state.newCampaign({ profile: 'F' });
  RB.game.s = s;
  s.learn.profile = 'F';
  s.learn.kanaKnown = 'none';
  s.learn.taught = {};
  'あいうえおかきくけこさしすせそたちつてとなにぬねの'.split('').forEach((c) => (s.learn.taught[c] = true));
  const g = RB.lessons.kanaFor(s, 'rw.c_mill_gears');
  t.eq(g.chars, ['よ', 'ん'], 'the gear plates need only よ and ん, not the h row');
  t.ok(g.words.some((w) => w.w === 'よん' && w.m === 'four'), 'the words are the task\'s own (よん, four)');
  t.eq(RB.lessons.kanaFor(s, 'rw.c_mill_lantern').chars, [], 'the loft lantern (あしのせ) needs nothing new');
  const s2 = Object.assign({}, s, { learn: Object.assign({}, s.learn, { taught: Object.assign({}, s.learn.taught, { よ: true, ん: true }) }) });
  t.eq(RB.lessons.kanaFor(s2, 'rw.c_mill_gears').chars, [], 'with よ and ん already met, the gears need nothing (no repeat on a second visit)');
  t.eq(RB.lessons.kanaFor(Object.assign({}, s, { learn: Object.assign({}, s.learn, { kanaKnown: 'hira' }) }), 'rw.c_mill_gears').chars, [], 'someone who knows hiragana gets no introduction');
  t.ok(!Object.keys(RB.game.s.learn.items || {}).length, 'looking creates no learning record');
  // a plain row lesson after a just-in-time introduction shows only what is still new
  s.learn.taught['よ'] = true;
  const ng = RB.lessons.nextGroup(s);
  t.eq(ng.g.id, 'h_ha', 'the next row is still the h row');
  // the scene asks for it in place
  const mill = RB.content.scenes['rw.m1_gears'];
  if (mill) t.ok(JSON.stringify(mill).includes('rw.c_mill_gears'), 'the gears scene names its challenge for the lesson');

  // ---- F03: options made of met kana ----
  s.learn.taught = {};
  'あいうえお'.split('').forEach((c) => (s.learn.taught[c] = true));
  const o = RB.challenge.choicesFor({ kind: 'write', item: 'k:お', answer: 'お', accept: ['お'], mode: 'kana', single: true }).map((x) => x.text);
  t.ok(o.includes('お') && o.length >= 3, 'the お question keeps the answer and at least two others: ' + o.join(' '));
  t.ok(o.every((x) => 'あいうえお'.includes(x)), 'and every option is a vowel already met (no ぉ, を, オ yet): ' + o.join(' '));
  // every vowel, at many review-clock turns (the order and the candidates drawn change with the turn)
  let unfair = [];
  for (const ch of 'あいうえお') for (let turn = 0; turn < 12; turn++) {
    s.learn.clockN = turn; if (RB.learn.tick) RB.learn.tick();
    const os = RB.challenge.choicesFor({ kind: 'write', item: 'k:' + ch, answer: ch, accept: [ch], mode: 'kana', single: true }).map((x) => x.text);
    if (os.length < 3 || os.some((x) => !'あいうえお'.includes(x))) unfair.push(ch + ':' + os.join(''));
  }
  t.eq(unfair, [], 'after the vowel lesson, every vowel question offers only vowels (at least three options)');
  s.learn.kanaKnown = 'both';
  const o2 = RB.challenge.choicesFor({ kind: 'write', item: 'k:お', answer: 'お', accept: ['お'], mode: 'kana', single: true }).map((x) => x.text);
  t.ok(o2.some((x) => !'あいうえお'.includes(x)), 'someone who knows every kana still gets the contrasts: ' + o2.join(' '));
  s.learn.kanaKnown = 'none';

  // ---- F04: a single kana's feedback at its own scale ----
  const fb = (got, want) => (RB.answers.check(got, { answer: want, accept: [want], mode: 'kana', input: 'choice' }).feedback || []).map((f) => f.en).join(' ');
  t.ok(/basic vowel o/.test(fb('を', 'お')) && !/object particle/.test(fb('を', 'お')), 'を for お: the basic vowel, not a grammar note: ' + fb('を', 'お'));
  t.ok(/full-size/.test(fb('ぉ', 'お')), 'ぉ for お: on its own it is full-size: ' + fb('ぉ', 'お'));
  t.ok(/object particle/.test(fb('みずお', 'みずを')), 'in a word, the particle explanation stays: ' + fb('みずお', 'みずを'));
  t.ok(!/stomach/.test(fb('い', 'う')) && /う \(u\)/.test(fb('い', 'う')), 'い for う: the kana and its sound, not the word 胃: ' + fb('い', 'う'));

  // ---- F06–F08: the letter quest and the report stage ----
  const q = RB.state.newCampaign();
  q.flags.rw_arrived = true;
  RB.state.autoQuests(q);
  t.ok(q.quests.rw_letter && !q.quests.rw_letter.done, 'arriving starts "A Letter for Keeper Tsuru"');
  q.flags.rw_met_tsuru = true;
  RB.state.autoQuests(q);
  t.ok(q.quests.rw_letter && q.quests.rw_letter.done, 'meeting Tsuru finishes it');
  const r = RB.state.newCampaign();
  RB.state.setQuest(r, 'rw_labels', 0);
  ['rw_bottles_done', 'rw_letters_done', 'rw_lanterns_done', 'rw_suzu_told', 'rw_hana_cups'].forEach((f) => (r.flags[f] = true));
  RB.state.setQuest(r, 'rw_labels', 1);
  t.eq(r.quests.rw_labels.stage, 2, 'with every request done, the quest moves on to "report to Tsuru", in any order');
};
