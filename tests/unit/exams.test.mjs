// Mastery exams and stars (expansion L3; Robin's C-13, C-75): groups from the content, questions per input type, the
// star rule (fewer than 30% assisted or missed, together), retakes of just those slots with the whole exam the
// measure, and "completed with help" kept honestly. Stars unlock nothing. Also What I can do (L5).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const X = RB.exams;
  const s = RB.state.newCampaign({ profile: 'E' });
  s.learn.kanaKnown = 'both';
  RB.game.s = s;
  // the rule
  const sl = (n, off) => Array.from({ length: n }, (_, i) => ({ item: 'k:' + i, r: i < off ? (i % 2 ? 'assisted' : 'missed') : 'independent' }));
  t.ok(X.judge(sl(10, 2)).star && !X.judge(sl(10, 3)).star, 'ten questions: two assisted or missed earn the star, three don\'t');
  t.ok(!X.judge(sl(4, 0)).star, 'fewer than five questions is not an exam');
  t.ok(X.judge(sl(7, 2)).star && !X.judge(sl(7, 3)).star, 'seven: 2/7 is under 30%, 3/7 is not');
  // slots from the runner's results
  t.eq(X.slotOf({ firstTry: false, ok: true }), 'missed', 'a wrong first answer, put right, is missed');
  t.eq(X.slotOf({ firstTry: true, ok: true, help: 'constrain' }), 'assisted', 'counting help: assisted');
  t.eq(X.slotOf({ firstTry: true, ok: true, help: 'conceptual' }), 'independent', 'conceptual help does not count (L2)');
  t.eq(X.slotOf({ firstTry: true, ok: true, revealed: true, assisted: true }), 'assisted', 'the answer shown: assisted');
  t.eq(X.slotOf({ cancelled: true }), null, 'a stopped question records nothing');
  // groups
  const G = X.groups(s);
  const ha = G.find((g) => g.id === 'kana:h:ka');
  t.ok(ha && ha.items.join('') === 'k:かk:きk:くk:けk:こ' && X.offered(s, ha), 'the か row of hiragana, offered when kana are known');
  const f = RB.state.newCampaign({ profile: 'F' }); f.learn.kanaKnown = 'none';
  RB.game.s = f;
  t.ok(!X.offered(f, ha), 'Foundations with no kana taught: not offered yet');
  RB.game.s = s;
  t.ok(G.some((g) => g.id === 'grammar:requests'), 'grammar families come from the game\'s own points');
  t.ok(X.modeOk(s, ha, 'hand') && X.modeOk(s, ha, 'choice') && X.modeOk(s, ha, 'ime'), 'a kana row can be examined writing, choosing and typing');
  t.ok(!X.modeOk(s, ha, 'listen'), 'listening needs a device voice (absent here): not offered, not "missing"');
  for (let n = 0; n < 3; n++) { const q = X.question(s, 'k:か', 'hand', n); t.ok(q && q.kind === 'write' && q.answer === 'か', 'a written question for か (' + n + ')'); }
  // a sitting, a star, and a retake that keeps the whole exam as the measure
  let out = X.finish(s, ha, 'hand', sl(5, 2).map((x, i) => Object.assign(x, { item: ha.items[i] })), false);
  t.ok(!out.star && !RB.records.has(s, 'stars', 'kana:h:ka|hand') && X.state(s, ha, 'hand').helped, '2 of 5 helped: completed with help, no star');
  t.eq(X.retakeItems(s, ha, 'hand'), ['k:か', 'k:き'], 'a retake asks just the assisted and missed ones');
  out = X.finish(s, ha, 'hand', [{ item: 'k:か', r: 'independent' }, { item: 'k:き', r: 'missed' }], true);
  t.ok(out.n === 5 && out.off === 1 && out.star && RB.records.has(s, 'stars', 'kana:h:ka|hand'), 'retake: the whole exam is the measure (1 of 5): a star');
  t.ok(out.newStar, 'the star is new');
  t.ok(!X.finish(s, ha, 'hand', sl(5, 0).map((x, i) => Object.assign(x, { item: ha.items[i] })), false).newStar, 'and awarded once');
  // nothing is unlocked: a star changes no flag, item, word or bond
  const snap = JSON.stringify({ f: s.flags, i: s.inv, w: s.words, b: s.company.bond });
  X.finish(s, G.find((g) => g.id === 'kana:k:ka'), 'choice', sl(5, 0).map((x, i) => Object.assign(x, { item: 'k:' + 'カキクケコ'[i] })), false);
  t.eq(JSON.stringify({ f: s.flags, i: s.inv, w: s.words, b: s.company.bond }), snap, 'stars unlock nothing');
  // What I can do
  const st = RB.content.canDo.find((x) => x.id === 'request');
  t.eq(RB.ui.mastery.canDoState(s, st).status, 'notyet', 'not yet');
  RB.learn.record('g:v_te_kudasai', { ok: true, mode: 'choice', ctx: 'battle:x', ev: 'recog' });
  t.eq(RB.ui.mastery.canDoState(s, st).status, 'begun', 'begun after one success');
  RB.learn.record('g:v_te_kudasai', { ok: true, mode: 'ime', ctx: 'rw.lantern_s', ev: 'typed' });
  t.eq(RB.ui.mastery.canDoState(s, st).status, 'shown', 'shown in two kinds of place');
  t.ok(RB.content.canDo.length >= 60 && RB.content.canDoThemes.length === 10, RB.content.canDo.length + ' statements in ten themes');
  for (const x of RB.content.canDo) for (const id of x.items) if (id[0] === 'g') t.ok(!!RB.grammar.get(id.slice(2)), 'can-do ' + x.id + ': grammar point ' + id + ' exists');
};
