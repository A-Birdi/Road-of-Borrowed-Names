// The Practice addendum's foundation (docs/PRACTICE_CONTRACTS.md): the
// s.practice namespace and its migration, per-campaign setup defaults,
// sequence numbers and seeded streams, the learning adapter (one mastery event
// per objective; exposed answers never promote recall), caller-side cooldowns,
// the single activity session (mode, disposal on a campaign change, input
// hold), the Ways to practise and Company section hooks, and the shiritori
// rules core against the addendum's worked fixtures (§26.3).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const P = RB.practice;
  const fresh = (o) => { const s = RB.state.newCampaign({}); s.map = 'rw.village'; Object.assign(s, o || {}); return s; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---- namespace and migration ---------------------------------------------------------------
  const s0 = fresh();
  t.ok(s0.practice && s0.practice.v === 1 && s0.practice.fishing && s0.practice.shiritori && Array.isArray(s0.practice.deskPages), 'a new campaign has an empty practice record');
  t.eq(P.settings(s0).fishingPace, 'off', 'fishing pace is Off for a new campaign');
  t.eq([P.settings(s0).shiritoriFormat, P.settings(s0).shiritoriBand, P.settings(s0).shiritoriLevel, P.settings(s0).shiritoriSupport], ['competitive', 'pocket', 'casual', 'open'], 'shiritori defaults: competitive, Pocket, Casual, Open-book');
  const old = JSON.parse(JSON.stringify(fresh()));
  delete old.practice;
  t.eq(RB.save.validate(old), [], 'a save from before practice validates');
  const mig = RB.save.migrate(JSON.parse(JSON.stringify(old)));
  t.ok(mig.practice && mig.practice.fishing.observed && Object.keys(mig.practice.fishing.observed).length === 0 && P.settings(mig).fishingPace === 'off', 'migrate starts practice empty with pace Off (nothing inferred)');
  const part = JSON.parse(JSON.stringify(fresh()));
  delete part.practice.fishing.calibration; part.practice.future = { keep: 1 };
  RB.save.migrate(part);
  t.ok(part.practice.fishing.calibration && part.practice.future && part.practice.future.keep === 1, 'migrate fills missing keys and keeps unknown future records');
  const bad = JSON.parse(JSON.stringify(fresh())); bad.practice = 'x';
  t.eq(RB.save.validate(bad), ['bad practice'], 'the wrong shape is reported');
  P.addNamespace('__testns', () => ({ a: 1 }));
  const s1 = fresh();
  t.eq(s1.practice.__testns, { a: 1 }, 'a registered namespace gets its defaults in new campaigns');
  const olds1 = JSON.parse(JSON.stringify(s1)); delete olds1.practice.__testns;
  t.eq(RB.save.migrate(olds1).practice.__testns, { a: 1 }, 'and in older saves');

  // ---- sequence and streams ------------------------------------------------------------------
  const a1 = P.seq(s0), a2 = P.seq(s0);
  t.ok(a2 === a1 + 1, 'session numbers increase');
  const r1 = P.stream(s0, 'fish', 'river'), r2 = P.stream(s0, 'fish', 'river'), r3 = P.stream(s0, 'strategy');
  const seqA = [r1(), r1(), r1()], seqB = [r2(), r2(), r2()];
  t.eq(seqA, seqB, 'a named stream is reproducible');
  t.ok(seqA[0] !== r3(), 'and independent of another stream');

  // ---- learning adapter ----------------------------------------------------------------------
  RB.game.s = s0;
  const before = JSON.stringify(s0.learn.items || s0.learn);
  const recs = [];
  const real = RB.learn.record;
  RB.learn.record = (id, r) => { recs.push([id, r.ok, r.mode]); return real(id, r); };
  const ob = P.objectives({ kind: 'lanterns' });
  t.ok(ob.assess('lamp1', 'v:mizu', { firstTry: false, mode: 'hand' }), 'a first confirmed result is one mastery event');
  t.ok(!ob.assess('lamp1', 'v:mizu', { firstTry: true, mode: 'hand', assisted: true }), 'the corrected continuation of the same objective adds none');
  t.ok(!ob.assess('trace1', 'v:hikari', { firstTry: true, mode: 'hand' }, { exposed: true }), 'a traced/copied (exposed) answer never promotes recall');
  t.ok(!ob.assess('cast1', 'v:kaze', { firstTry: true, mode: 'hand' }, { paced: true }), 'a paced (timed) attempt never touches ordinary mastery');
  t.ok(!ob.assess('x', 'v:kaze', { cancelled: true }), 'a cancelled step records nothing');
  t.eq(recs, [['v:mizu', false, 'hand']], 'exactly one mastery record, as first given');
  t.ok(s0.practice.tally.lanterns && s0.practice.tally.lanterns.n === 4 && s0.practice.tally.lanterns.exposed === 1, 'the rest is kept as practice tallies (' + JSON.stringify(s0.practice.tally.lanterns) + ')');
  RB.learn.record = real;
  t.ok(before !== JSON.stringify(s0.learn.items || s0.learn), 'the one event reached the learning record');

  // ---- cooldowns -----------------------------------------------------------------------------
  const cd = P.cooldown();
  cd.push('a', true);
  t.ok(!cd.allow('a'), 'never the identical objective at once');
  cd.push('b', false); cd.push('c', false); cd.push('d', false);
  t.ok(!cd.allow('a'), 'a missed objective waits four objectives (3 later: still waiting)');
  cd.push('e', false);
  t.ok(cd.allow('a'), 'and comes back after four');
  const cd2 = P.cooldown(); cd2.push('x', false); cd2.push('y', false);
  t.ok(cd2.allow('x'), 'a correct objective can return after one other');
  const few = P.pickItems(['v:mizu', 'v:kaze'], 6, P.cooldown());
  t.ok(few.length === 2 && new Set(few).size === 2, 'a short pool gives a short session, never repeats to fill (' + few.join(',') + ')');

  // ---- the activity controller ----------------------------------------------------------------
  RB.game.s = s0;
  RB.game.setBase('world');
  const seen = [];
  RB.bus.on('activity:session-resolved', (e) => seen.push(e.kind + ':' + JSON.stringify(e.result)));
  let disposed = 0, release;
  RB.activity.register('__t', { title: { en: 'Test' }, eligible: () => ({ ok: true }), run: (session) => new Promise((r) => { release = () => { session.set('result'); r({ done: 1 }); }; }), dispose: () => disposed++ });
  RB.activity.register('__no', { eligible: () => ({ ok: false, why: 'Not here.' }), run: async () => ({}) });
  t.eq(await RB.activity.launch('__no', {}), { ok: false, why: 'Not here.' }, 'eligibility is checked at launch');
  const p1 = RB.activity.launch('__t', { source: 'words' });
  await wait(5);
  const sess = RB.activity.active();
  t.ok(sess && sess.kind === '__t' && RB.game.mode() === 'activity' && sess.alive(), 'one session owns the screen; the world is paused (mode activity)');
  t.eq((await RB.activity.launch('__t', {})).ok, false, 'a second session cannot start while one runs');
  release();
  const res = await p1;
  t.ok(res.ok && res.result.done === 1 && !RB.activity.active() && disposed === 1 && !sess.alive(), 'it resolves once, disposes and is no longer alive');
  t.eq(RB.game.mode(), 'activity-exit', 'input is held for a moment so the closing press does nothing else');
  await wait(260);
  t.eq(RB.game.mode(), 'world', 'then the world is back');
  t.eq(seen, ['__t:{"done":1}'], 'activity:session-resolved emitted once');
  const p2 = RB.activity.launch('__t', {});
  await wait(5);
  const sess2 = RB.activity.active();
  RB.bus.emit('campaign:changing', { to: 'load' });
  t.ok(!RB.activity.active() && !sess2.alive() && disposed === 2 && RB.game.mode() === 'world', 'a campaign change disposes the session first: its callbacks are dead');
  release();
  t.eq((await p2).ok, false, 'and its late result is not applied');

  // ---- hooks -----------------------------------------------------------------------------------
  t.ok(typeof RB.ui.companyPages.addSection === 'function', 'Company › Companion accepts sections (Wordplay)');
  P.addActivity({ id: '__a', en: 'A test', order: 1, available: () => true, here: () => false });
  t.ok(P.activities().some((d) => d.id === '__a'), 'Ways to practise has a registry');
  t.ok(/A test/.test(RB.ui.practiceIndex.html(s0)), 'and the Words page lists it');
  t.ok(!/Begin here/.test(RB.ui.practiceIndex.html(s0)), 'never offering to begin away from its place');

  // ---- shiritori rules (§10, §26.3) --------------------------------------------------------------
  const SH = RB.shiritori;
  const B = (r) => { const b = SH.boundary(r); return b.head + b.tail + (b.terminal ? 'ん!' : ''); };
  t.eq(SH.boundary('コーヒー').tail, 'い', 'コーヒー passes い');
  t.eq(SH.boundary('スーパー').tail, 'あ', 'スーパー passes あ, not ぱ');
  t.eq(SH.boundary('おもちゃ').tail, 'や', 'おもちゃ passes や (spelling kept)');
  t.eq(SH.boundary('ぎゅうにゅう').tail, 'う', 'ぎゅうにゅう passes う');
  t.ok(SH.boundary('みかん').terminal, 'みかん ends in ん');
  t.eq(B('ねこ'), 'ねこ', 'ねこ: head ね, tail こ');
  t.eq(SH.norm('ﾈｺ'), 'ねこ', 'half-width ﾈｺ is ねこ');
  t.eq(SH.norm('が'), 'が', 'a decomposed dakuten composes to が');
  t.ok(SH.norm('が') !== SH.norm('か'), 'が and か stay distinct');
  t.eq(SH.norm('  ネコ '), 'ねこ', 'surrounding spaces are trimmed; katakana matches hiragana');
  const E = (id, reading, forms, en, o) => Object.assign({ id, reading, forms, display: { jp: forms[0], en }, nounKind: 'common', lexicalLevel: 'pocket', provenance: [{ source: 'test fixture', reviewed: true }] }, o || {});
  const fx = SH.buildBank({ id: '__fx', entries: [
    E('neko', 'ねこ', ['猫', 'ねこ', 'ネコ'], 'cat'), E('koma', 'こま', ['独楽', 'こま'], 'spinning top'), E('mado', 'まど', ['窓', 'まど'], 'window'),
    E('hashi_b', 'はし', ['橋', 'はし'], 'bridge'), E('hashi_c', 'はし', ['箸', 'はし'], 'chopsticks'), E('shika', 'しか', ['鹿', 'しか'], 'deer'),
    E('kasa', 'かさ', ['傘', 'かさ'], 'umbrella'), E('mikan', 'みかん', ['蜜柑', 'みかん'], 'mandarin'), E('nori', 'のり', ['海苔', 'のり'], 'nori'),
    E('kojo', null, ['工場'], 'factory', { readings: ['こうじょう', 'こうば'] }), E('basu', 'ばす', ['バス', 'ばす'], 'bus'),
  ] });
  t.eq(fx.problems, [], 'the fixture bank validates');
  t.ok(fx.edges.find((x) => x.entry === 'hashi_b').group === fx.edges.find((x) => x.entry === 'hashi_c').group, '橋 and 箸 (both はし) share one repeat-group');
  const rk = SH.resolve(fx, '工場');
  t.ok(rk.matches.length === 1 && rk.matches[0].needsReading && rk.matches[0].edges.length === 2, 'a kanji form with two approved readings asks which (never chosen for you)');
  t.ok(!SH.resolve(fx, 'こうば').matches[0].needsReading, 'typing the reading settles it');
  t.eq(SH.resolve(fx, 'いぬ').matches, [], 'a word outside the bank resolves to nothing (outside this match\'s bank, not "not Japanese")');
  let g = SH.newGame(fx, { starter: 'shika', first: 'pc' });
  t.eq([g.required, g.next, !!g.used[fx.edges.find((x) => x.entry === 'shika').group], g.over], ['か', 'pc', true, null], 'the neutral starter is used and passes its tail');
  const edge = (id) => fx.edges.find((x) => x.entry === id);
  t.eq(SH.check(g, fx, edge('neko'), 'pc').why, 'wrong-head', 'a wrong starting kana is an invalid draft (turn kept)');
  g = SH.newGame(fx, { starter: 'koma', first: 'pc' }); // こま → ま
  SH.play(g, fx, edge('mado'), 'pc');                    // まど → ど: no safe reply
  t.eq(g.over, { winner: 'pc', reason: 'no-safe-reply' }, 'no playable continuation in this bank: the mover wins at once');
  g = SH.newGame(fx, { starter: 'neko', first: 'pc' });  // ねこ → こ
  SH.play(g, fx, edge('koma'), 'pc');
  t.ok(!g.over && g.next === 'cpu' && g.required === 'ま', 'a legal move passes the turn');
  g = SH.newGame(fx, { starter: 'shika', first: 'cpu' }); // しか → か
  t.eq(SH.check(g, fx, edge('kasa'), 'cpu').ok, true, 'かさ is legal from か');
  const g2 = SH.newGame(fx, { starter: 'hashi_b', first: 'pc' }); // はし → し
  t.eq(SH.check(g2, fx, edge('hashi_c'), 'pc').why, 'wrong-head', 'and a homophone could not be replayed anyway');
  g2.required = 'は'; t.eq(SH.check(g2, fx, edge('hashi_c'), 'pc').why, 'repeat', '箸 after 橋: the same group is used');
  const g3 = SH.newGame(fx, { starter: 'nori', first: 'pc' }); // のり → り (none): starter itself leaves no reply
  t.ok(g3.over && g3.over.reason === 'no-safe-reply', 'a starter without replies is detected (banks certify starters with ≥4)');
  const g4 = SH.newGame(fx, { starter: 'koma', first: 'pc' }); g4.required = 'み';
  t.eq(SH.casualMove(g4, fx, RB.util.rng(1)), null, 'with only ん words left the computer concedes, never inventing a move');
  SH.play(g4, fx, edge('mikan'), 'pc');
  t.eq(g4.over, { winner: 'cpu', reason: 'terminal-n' }, 'playing a ん word is the player\'s own loss');
  const g5 = SH.newGame(fx, { starter: 'neko', first: 'cpu' });
  const cm = SH.casualMove(g5, fx, RB.util.rng(7));
  t.ok(cm && cm.head === 'こ' && !cm.terminal, 'Casual chooses a safe legal move (' + (cm && cm.reading) + ')');
  t.eq(SH.concede(SH.newGame(fx, { starter: 'neko' }), 'pc'), { winner: 'cpu', reason: 'human-concession' }, 'conceding is distinct from bank exhaustion');
  const unsafe = SH.resolve(fx, '<img src=x onerror=1>');
  t.eq(unsafe.matches, [], 'markup is never a word');
};
