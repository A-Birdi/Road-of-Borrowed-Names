// Fishing pace: calibration and the separate timing records (Practice addendum
// §7.4, §7.5, §21.3, §23.3). Nearest-rank p75 on known arrays; Gentle/Brisk at
// 0, 11, 12 and 24 samples; excluded repairs; pointer classes; representation
// changes; outliers; budgets over 180 s; fixed accepted budgets; layout
// applicability; recalibration; records capped at 50 and kept out of mastery.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.paceCore;
  const fresh = () => RB.state.newCampaign({});

  // ---- nearest-rank percentile -----------------------------------------------------------------
  const seq = (n) => Array.from({ length: n }, (_, i) => i + 1);
  t.eq(C.p75(seq(12)), 9, 'p75 of 1..12 is the 9th value (rank ceil(0.75×12) = 9)');
  t.eq(C.p75(seq(24)), 18, 'p75 of 1..24 is the 18th');
  t.eq(C.p75(seq(4)), 3, 'p75 of 1..4 is the 3rd');
  t.eq(C.p75([7]), 7, 'p75 of one value is that value');
  t.eq(C.p75([30, 10, 20]), 30, 'unsorted input; rank ceil(2.25) = 3');
  t.eq(C.p75(seq(100)), 75, 'p75 of 1..100 is 75');
  t.eq(C.p75(seq(13)), 10, 'p75 of 1..13: rank ceil(9.75) = 10');
  t.eq([C.percentile(seq(10), 50), C.percentile(seq(10), 90)], [5, 9], 'p50 and p90 of 1..10');
  t.eq(C.p75([]), null, 'no samples: no percentile');

  // ---- presets ----------------------------------------------------------------------------------
  t.eq([C.presets(12000).gentle, C.presets(12000).brisk], [27, 18], 'the addendum\'s example: B = 12 s gives Gentle 27 s and Brisk 18 s');
  t.eq([C.presets(15000).gentle, C.presets(15000).brisk], [32, 22], 'B = 15 s: 1.8×15+5 = 32 exactly (integer arithmetic, no float overshoot to 33); 1.25×15+3 = 21.75 → 22');
  t.eq([C.presets(10000).gentle, C.presets(4000).brisk], [23, 8], 'exact boundaries are not rounded up: 23 and 8');
  t.eq([C.presets(1).gentle, C.presets(1).brisk], [6, 4], 'any fraction of a second rounds up (ceil)');
  const big = C.presets(100000);
  t.eq([big.gentle, big.gentleOver, big.brisk, big.briskOver], [185, true, 128, false], 'B = 100 s: Gentle 185 s is reported over 180 (not clamped), Brisk 128 s still fits');

  // ---- buckets and authored complexity ----------------------------------------------------------
  const RIGHT = { kind: 'write', answer: 'みぎ', accept: ['みぎ', '{右|みぎ}'], mode: 'kana' };
  t.eq(C.representations(RIGHT), ['kana', 'mixed'], 'みぎ / 右 offers Kana and Supported mixed-kanji writing');
  t.eq(C.complexity(RIGHT, 'kana'), { units: 2 }, 'kana: 2 units');
  t.eq(C.complexity(RIGHT, 'mixed'), { units: 2, strokes: 5 }, 'mixed: 右 is 2 kana-equivalent units, 5 reference strokes');
  const kk = C.bucketKey({ input: 'hand', pointer: 'mouse', repr: 'kana', cx: C.complexity(RIGHT, 'kana') });
  const km = C.bucketKey({ input: 'hand', pointer: 'mouse', repr: 'mixed', cx: C.complexity(RIGHT, 'mixed') });
  t.eq([kk.key, km.key], ['hand.mouse.kana.l1', 'hand.mouse.mixed.l1.s1'], 'kana-only and mixed-kanji answers are different buckets');
  t.eq(['mouse', 'touch', 'pen'].map((p) => C.bucketKey({ input: 'hand', pointer: p, repr: 'kana', cx: { units: 2 } }).key), ['hand.mouse.kana.l1', 'hand.touch.kana.l1', 'hand.pen.kana.l1'], 'each pointer class has its own handwriting bucket');
  t.eq(C.bucketKey({ input: 'hand', pointer: 'key', repr: 'kana', cx: { units: 2 } }).reason, 'unknown', 'a keyboard is not a handwriting pointer');
  t.eq(C.bucketKey({ input: 'ime', repr: 'kana', cx: { units: 4 } }).key, 'ime.kana.l2', 'typing (IME) has its own samples');
  t.eq(C.bucketKey({ input: 'choice', pointer: 'touch', repr: 'select', cx: C.complexity({ kind: 'choose', options: [1, 2, 3] }, 'select') }).key, 'select.touch.choose.o2-4', 'selection has its own (selection pace) samples');
  t.eq(C.bucketKey({ input: 'order', pointer: 'mouse', repr: 'select', cx: C.complexity({ kind: 'order', tiles: ['a', 'b', 'c'] }, 'select') }).key, 'select.mouse.order.l2', 'arranging pieces is a selection bucket by piece count');
  t.eq([1, 2, 3, 4, 5, 8, 9].map(C.lenBucket), ['l1', 'l1', 'l2', 'l2', 'l3', 'l3', null], 'length buckets 1–2, 3–4, 5–8; over 8 none');
  t.eq([1, 8, 9, 20, 21, 40, 41].map(C.strokeBucket), ['s1', 's1', 's2', 's2', 's3', 's3', null], 'stroke buckets 1–8, 9–20, 21–40; over 40 none');
  const LONG = { kind: 'write', answer: 'ゆっくりひきよせる', accept: ['ゆっくりひきよせる'], mode: 'kana' };
  t.eq(C.complexity(LONG, 'kana'), { untimed: 'too-long' }, 'an answer over 8 units is untimed in this release');
  t.eq(C.bucketKey({ input: 'hand', pointer: 'mouse', repr: 'kana', cx: C.complexity(LONG, 'kana') }).reason, 'too-long', 'and has no bucket');
  const HEAVY = { kind: 'write', answer: '{議論|ぎろん}', accept: ['{議論|ぎろん}'], mode: 'exact', pace: { mixed: { units: 3, strokes: 35 } } };
  t.eq(C.complexity(HEAVY, 'mixed'), { units: 3, strokes: 35, authored: true }, 'an authored complexity is used as given');
  t.eq(C.complexity(Object.assign({}, HEAVY, { pace: { mixed: { units: 3, strokes: 41 } } }), 'mixed'), { untimed: 'too-long' }, 'over 40 reference strokes is untimed');
  const ALT = { kind: 'write', answer: 'みぎ', accept: ['みぎ', 'みぎがわ', 'みぎのほうへゆっくり'], mode: 'kana' };
  t.eq(C.complexity(ALT, 'kana'), { units: 4 }, 'the longest accepted SHORT variant sets the conservative bucket (みぎがわ, 4); a variant over 8 is not used');
  t.eq(C.complexity({ kind: 'write', answer: 'right', mode: 'meaning' }, 'kana'), { unknown: 'no-variant' }, 'an English meaning answer cannot be compared (Off or Custom only)');
  t.eq(C.ALL_BUCKETS.length, 36 + 6 + 28, 'the bucket set is finite: 36 handwriting, 6 typing, 28 selection');
  t.ok(C.ALL_BUCKETS.every(C.isBucket) && !C.isBucket('hand.mouse.kana.l9'), 'only defined buckets exist');

  // ---- calibration at 0, 11, 12, 24 samples -------------------------------------------------------
  const s = fresh();
  const K = 'hand.mouse.kana.l1';
  let b = C.budgets(s, { key: K });
  t.eq([b.reason, b.samples, b.gentle, b.brisk, b.needed], ['collecting', 0, null, null, 12], '0 samples: Gentle and Brisk are not prepared');
  for (let i = 1; i <= 11; i++) C.addSample(s, K, i * 1000);
  b = C.budgets(s, { key: K });
  t.eq([b.reason, b.samples, b.gentle], ['collecting', 11, null], '11 samples: still not prepared (no fixed fallback pretending to be personal)');
  C.addSample(s, K, 12000);
  b = C.budgets(s, { key: K });
  t.eq([b.reason, b.samples, b.B, b.gentle, b.brisk], ['proposal', 12, 9000, 22, 15], '12 samples (1..12 s): B = p75 = 9 s; Gentle ceil(21.2) = 22, Brisk ceil(14.25) = 15, offered, not yet accepted');
  for (let i = 13; i <= 24; i++) C.addSample(s, K, i * 1000);
  b = C.budgets(s, { key: K });
  t.eq([b.samples, b.B, b.gentle, b.brisk], [24, 18000, 38, 26], '24 samples (1..24 s): B = 18 s; Gentle 38, Brisk 26');
  C.addSample(s, K, 25000);
  t.eq(s.practice.fishing.calibration.buckets[K].s.length, 24, 'only the latest 24 are kept');
  t.eq(s.practice.fishing.calibration.buckets[K].s[0], 2000, 'the oldest (1 s) was dropped');
  t.ok(!C.addSample(s, 'hand.mouse.kana.l9', 1000) && !C.addSample(s, K, NaN), 'no sample outside the finite set or of no duration');

  // ---- accepted budgets stay fixed; layout applicability; recalibration --------------------------------
  const acc = C.accept(s, K, 'L', 1);
  t.eq([acc.gentle, acc.brisk, acc.layout], [C.presets(C.p75(s.practice.fishing.calibration.buckets[K].s)).gentle, C.presets(C.p75(s.practice.fishing.calibration.buckets[K].s)).brisk, 'L'], 'pressing Ready on the offer fixes the budgets');
  for (let i = 0; i < 24; i++) C.addSample(s, K, 1000);
  b = C.budgets(s, { key: K, layout: 'L' });
  t.eq([b.reason, b.gentle, b.brisk], ['ok', acc.gentle, acc.brisk], 'new faster successes cannot quietly make the next cast harder');
  b = C.budgets(s, { key: K, layout: 'S' });
  t.eq([b.reason, b.gentle, b.brisk], ['layout', null, null], 'a different pad layout makes the accepted preset inapplicable');
  t.eq(s.practice.fishing.calibration.buckets[K].s.length, 24, '…without discarding the stored samples');
  t.eq(C.budgets(s, { key: 'hand.touch.kana.l1' }).reason, 'collecting', 'another pointer class has its own (empty) bucket: the mouse preset does not apply to touch');
  t.eq(C.budgets(s, { key: 'hand.mouse.mixed.l1.s1' }).reason, 'collecting', 'nor to mixed-kanji writing');
  t.eq(C.recalibrate(s, K), 1, 'Recalibrate sets the bucket aside');
  b = C.budgets(s, { key: K });
  t.eq([b.reason, b.samples, b.accepted], ['collecting', 0, null], 'and the next 12 untimed answers prepare new times');

  // ---- outliers ----------------------------------------------------------------------------------------
  const s2 = fresh();
  for (let i = 0; i < 11; i++) C.addSample(s2, K, 5000);
  C.addSample(s2, K, 600000);
  b = C.budgets(s2, { key: K });
  t.eq([b.B, b.gentle, b.brisk], [5000, 14, 10], 'one 10-minute outlier among 12 does not move B (p75 = 5 s)');
  const s3 = fresh();
  for (let i = 0; i < 8; i++) C.addSample(s3, K, 5000);
  for (let i = 0; i < 4; i++) C.addSample(s3, K, 200000);
  b = C.budgets(s3, { key: K });
  t.eq([b.B, b.gentle, b.brisk, b.reason, b.proposed.gentle, b.proposed.brisk], [200000, null, null, 'proposal', 365, 253], 'a third of long answers: both over 180 s; none is offered and nothing is clamped (365 / 253 reported)');

  // ---- what is a sample: exclusions -------------------------------------------------------------------
  const clean = { clock: 'measure', submitted: 'correct' };
  t.eq(C.exclusions(clean), [], 'a measured, untimed, correct, unrepaired answer is a sample');
  t.eq(C.exclusions(Object.assign({}, clean, { repair: 1 })), ['recognition-repair'], 'a recognition repair excludes it');
  t.eq(C.exclusions(Object.assign({}, clean, { reveal: true })), ['answer-shown'], 'so does a shown answer');
  t.eq(C.exclusions(Object.assign({}, clean, { submitted: 'correct-after-correction' })), ['content-correction'], 'and a content correction');
  t.eq(C.exclusions(Object.assign({}, clean, { pointerCancel: 1, inputChanged: true })), ['input-changed', 'pointer-cancel'], 'and an interrupted input');
  t.eq(C.exclusions(Object.assign({}, clean, { reprChanged: true })), ['representation-changed'], 'and a changed representation');
  t.eq(C.exclusions({ clock: 'timed', submitted: 'correct' }), ['timed'], 'a timed answer is never a calibration sample');
  t.eq(C.exclusions({ clock: 'none', submitted: 'correct' }), ['not-measured-from-ready'], 'nor an Off answer without Ready');

  // ---- records: separate, bounded, never mastery ----------------------------------------------------------
  const s4 = fresh();
  const learnBefore = JSON.stringify(s4.learn);
  for (let i = 0; i < 60; i++) C.record(s4, { at: i, taskId: 'C02/E', profile: 'E', paceKind: 'gentle', clock: 'timed', budgetMs: 27000, activeMs: 1000 + i, expired: i % 5 === 0, onTime: i % 5 !== 0, convertedToUntimed: i % 5 === 0 ? 'expired' : null, pauseReasons: { help: 1 }, inputMode: 'hand', pointerClass: 'mouse', representationClass: 'kana', bucket: K, assistance: [], recognitionRepair: false, submittedResult: 'correct', sample: false, excluded: ['timed'], junk: 'x' });
  const recent = s4.practice.fishing.recentAttempts;
  t.eq(recent.length, 50, 'recent attempt details are capped at 50');
  t.eq([recent[0].n, recent[49].n], [11, 60], 'the oldest go first; numbering continues');
  const want = ['paceKind', 'budgetMs', 'activeMs', 'expired', 'pauseReasons', 'inputMode', 'pointerClass', 'profile', 'taskId', 'representationClass', 'assistance', 'recognitionRepair', 'submittedResult'];
  t.ok(want.every((k) => k in recent[0]), 'each record keeps the §7.5 fields');
  t.ok(!('junk' in recent[0]), 'and nothing else');
  t.eq(JSON.stringify(s4.learn), learnBefore, 'timing records never touch ordinary mastery');
  t.eq(C.summary(s4), '40 responses completed at your chosen pace.', 'the summary counts on-time correct responses among the kept 50 (every 5th expired)');
  const s5 = fresh();
  C.record(s5, { clock: 'timed', onTime: true, submittedResult: 'correct' });
  C.record(s5, { clock: 'timed', onTime: true, submittedResult: 'correct' });
  C.record(s5, { clock: 'timed', onTime: true, submittedResult: 'correct' });
  C.record(s5, { clock: 'timed', onTime: false, expired: true, submittedResult: 'correct' });
  t.eq(C.summary(s5), 'Three responses completed at your chosen pace.', 'a small optional summary; an expiry is not an error tally');
  const s6 = fresh();
  C.record(s6, { paceKind: 'brisk', clock: 'timed', expired: true, submittedResult: 'correct' });
  C.record(s6, { paceKind: 'brisk', clock: 'timed', expired: false, onTime: true, submittedResult: 'correct' });
  C.record(s6, { paceKind: 'brisk', clock: 'timed', expired: false, submittedResult: 'stepped-away' });
  C.record(s6, { paceKind: 'gentle', clock: 'measure', sample: false, excluded: ['recognition-repair'], taskId: 'Q01/F' });
  const d6 = C.diagnostics(s6);
  t.eq(d6.byKind.brisk, { completed: 2, expired: 1, interrupted: 1, expiryRate: 0.5 }, 'expiry rate = expired / completed paced attempts, leaving early excluded');
  t.eq(d6.excluded, [{ n: 4, taskId: 'Q01/F', bucket: null, excluded: ['recognition-repair'] }], 'developer diagnostics list excluded samples with their reasons');

  // ---- defaults and old saves ----------------------------------------------------------------------------
  t.eq(RB.practice.settings(fresh()).fishingPace, 'off', 'pace is Off for every new campaign');
  const old = JSON.parse(JSON.stringify(fresh()));
  delete old.practice;
  const mig = RB.save.migrate(old);
  t.eq([RB.practice.settings(mig).fishingPace, C.budgets(mig, { key: K }).reason], ['off', 'collecting'], 'an old save starts Off and uncalibrated');
  const odd = fresh();
  odd.practice.fishing.calibration = { buckets: { [K]: { s: [1000, 'x', -5, 2000], acc: 7 } } };
  C.cal(odd);
  t.eq(odd.practice.fishing.calibration.buckets[K], { s: [1000, 2000], acc: null }, 'stored calibration is validated (bad values dropped)');
};
