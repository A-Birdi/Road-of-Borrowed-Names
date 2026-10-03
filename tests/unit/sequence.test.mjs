// Illustrated sequences with manual advancement (src/ui/43_sequence.js; docs/expressive/CONTRACT.md §3.5,
// SHOTS.md §0), in node:
// - the player's state machine on a fake clock: entering → presenting → holding, and holding for a minute
//   (and an hour) with nothing moving on; a press during the entrance only completes the dissolve; an early
//   advance settles the action at its end; phases only go forward; reduced motion holds each action's end at
//   once; Previous looks back over reached beats and Next rejoins the live beat without moving it on;
//   Replay plays a shot's actions again in order and ends at the same hold; dispose is final; tokens grow;
// - the registry: the prologue and the three first sequences, 3–6 compositions each (the prologue six), every
//   shot drawable and every phase named;
// - the scripts: every !sequence opened and closed in its scene, every !shot a shot of the open sequence,
//   no !shake inside, the state commands still in the scenes, every line kept;
// - the skip control's look-ahead: unseen lines ahead (following !goto/!if/!call), nothing unseen once seen,
//   and it stops at a choice;
// - the campaign record s.seq: empty in a new campaign and filled in by migrate for an older save.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SQ = RB.sequence;

  // ---- the state machine on a fake clock ----------------------------------------------------------------
  let T = 1000;
  SQ.define('test.seq', { enter: 350, shots: {
    a: { phases: [['one', 1000], ['two', 500]], draw() {} },
    b: { phases: { only: 800 }, draw() {} },
    c: { draw() {} },
  } });
  const mkP = (still) => new SQ.Player('test.seq', { now: () => T, still: () => !!still });
  const fakeBuf = { cv: { width: 10, height: 10 }, w: 10, h: 10 };
  let p = mkP();
  t.ok(p.toShot('a'), 'a shot starts');
  t.eq(p.state, 'presenting', 'the first shot with nothing to dissolve from presents at once');
  p.setFrom({ fake: 1 });
  t.eq(p.state, 'entering', 'given a picture to dissolve from (the map), it enters');
  T += 200; p.tick(T);
  t.eq(p.state, 'entering', 'still dissolving at 200 ms');
  T += 200; p.tick(T);
  t.eq(p.state, 'presenting', 'the one-time action plays after the entrance');
  t.ok(p.kAt(0, T) < 0.1, 'the action has only just begun (k ' + p.kAt(0, T).toFixed(2) + ')');
  T += 1000; p.tick(T);
  t.eq(p.state, 'holding', 'then it holds');
  const beats0 = p.beats.length;
  for (let i = 0; i < 60; i++) { T += 1000; p.tick(T); }
  t.eq([p.state, p.beats.length, p.cur.id, p.cur.pi], ['holding', beats0, 'a', 0], 'a minute idle: still holding the same shot and beat (nothing advances on time)');
  T += 3600e3; p.tick(T);
  t.eq(p.state, 'holding', 'an hour idle: still holding');
  // phases go forward only
  p.phase('two');
  t.eq([p.state, p.cur.pi], ['presenting', 1], 'a later phase starts its own action');
  t.eq(p.kAt(0, T), 1, 'the earlier phase stays at its end');
  p.phase('one');
  t.eq(p.cur.pi, 1, 'phases never go back');
  // an early advance settles at the end
  p.advance();
  t.eq([p.state, p.kAt(1, T)], ['advancing', 1], 'the reader moving on settles the action at its end state');
  p.beat({ jp: 'x', en: 'line 1' });
  t.eq(p.state, 'holding', 'the next line on the same shot holds (its action had finished)');
  // a new shot: dissolve from the last frame; a press during it only completes the dissolve
  p.last = fakeBuf;
  RB.sprites.makeCanvas = () => ({ getContext: () => ({ drawImage() {} }) });
  p.toShot('b');
  t.eq(p.state, 'entering', 'a new shot dissolves in from the previous one');
  t.ok(p.settleEntrance(), 'a press during the entrance is used up completing it');
  t.eq(p.state, 'presenting', '…and the action starts; the beat has not moved');
  t.ok(!p.settleEntrance(), 'a second press is not absorbed again (it reaches the dialogue)');
  p.beat({ jp: 'y', en: 'line 2' });
  T += 900; p.tick(T);
  t.eq(p.state, 'holding', 'b holds after its action');
  // review: Previous / Next
  const b1 = p.prev();
  t.eq([p.state, b1 && b1.line.en, b1 && b1.shot], ['reviewing', 'line 1', 'a'], 'Previous shows the earlier beat with its shot');
  t.eq(p.view(), { shot: 'a', pi: 1, review: true }, 'the reviewed shot at the phase it had');
  t.eq(p.prev(), null, 'no earlier beat than the first');
  for (let i = 0; i < 30; i++) { T += 1000; p.tick(T); }
  t.eq(p.state, 'reviewing', 'looking back waits as long as the reader likes');
  const r = p.fwd();
  t.ok(r && r.live, 'Next walks forward and rejoins the live beat');
  t.eq([p.state, p.beats.length, p.cur.id], ['holding', 2, 'b'], '…without moving it on (same beats, same shot, holding)');
  // replay
  t.ok(p.replay(), 'Replay this shot');
  t.eq(p.state, 'presenting', 'the shot\'s action plays again');
  t.ok(p.kAt(0, T) < 0.05, 'from its beginning');
  T += 900; p.tick(T);
  t.eq([p.state, p.rep], ['holding', null], 'and it ends at the same hold');
  // reduced motion
  const q = mkP(true);
  q.toShot('a');
  t.eq([q.kAt(0, T), q.state], [1, 'holding'], 'reduced motion: the action\'s end state at once');
  // dispose; tokens
  const tok = p.tok;
  p.dispose();
  t.eq([p.state, p.toShot('a'), p.prev(), p.replay()], ['disposed', false, null, false], 'a disposed player does nothing more');
  t.ok(mkP().tok > tok, 'each player has a newer token');
  // a shot that does not exist
  const warn0 = console.warn; console.warn = () => {};
  t.ok(!mkP().toShot('nope'), 'an unknown shot is refused');
  console.warn = warn0;

  // ---- the registry --------------------------------------------------------------------------------------
  for (const [id, lo, hi] of [['prologue', 6, 6], ['ch1.bridge', 3, 6], ['ch2.notice', 3, 6], ['ch2.plate', 3, 6]]) {
    const d = SQ.get(id);
    t.ok(!!d, id + ' is defined');
    if (!d) continue;
    const shots = Object.values(d.shots);
    t.ok(shots.length >= lo && shots.length <= hi, id + ': ' + shots.length + ' compositions');
    t.ok(shots.every((s) => typeof s.draw === 'function' && s.phases.length && s.phases.every((ph) => ph.id && ph.ms >= 0 && ph.ms <= 6000)), id + ': every shot draws and names its phases (actions ≤ 6 s)');
    if (id !== 'prologue') t.ok(shots.every((s) => s.phases.every((ph) => ph.ms <= 1600)), id + ': each one-time action is short (≤ 1.6 s)');
    if (id !== 'prologue') t.ok(shots.every((s) => typeof s.focus === 'function'), id + ': every shot reports its focal area (tests check it stays above the sheet)');
  }

  // ---- the scripts ------------------------------------------------------------------------------------------
  const C = RB.content;
  const used = {};
  for (const [sid, seq] of [['rw.bridge_scene', 'ch1.bridge'], ['sg.omi_wataru', 'ch2.notice'], ['sg.asahi_name', 'ch2.plate']]) {
    const sc = C.scenes[sid], cmds = sc.cmds;
    const b = cmds.findIndex((c) => c.op === 'sequence' && c.args[0] === seq && (c.args[1] || 'begin') === 'begin');
    const e = cmds.findIndex((c) => c.op === 'sequence' && c.args[0] === seq && c.args[1] === 'end');
    t.ok(b >= 0 && e > b, sid + ': ' + seq + ' begins and ends in the scene');
    const inside = cmds.slice(b + 1, e);
    const bad = inside.filter((c) => c.op === 'shot' && !(SQ.get(seq).shots[c.args[0]] && (!c.args[1] || SQ.get(seq).shots[c.args[0]].phases.some((p) => p.id === c.args[1]))));
    t.eq(bad.map((c) => c.args.join(' ')), [], sid + ': every !shot names a shot (and phase) of ' + seq);
    t.ok(!inside.some((c) => c.op === 'shake'), sid + ': no !shake inside the sequence');
    used[seq] = new Set(inside.filter((c) => c.op === 'shot').map((c) => c.args[0]));
    t.eq([...used[seq]].sort(), Object.keys(SQ.get(seq).shots).sort(), sid + ': every composition of ' + seq + ' is used');
    t.ok(inside.filter((c) => c.op === 'say').length >= 3, sid + ': the sequence carries the scene\'s own lines (' + inside.filter((c) => c.op === 'say').length + ')');
  }
  // the scenes' lines and state commands are unchanged (counts as before the sequences: SHOTS.md)
  const count = (sid, op) => C.scenes[sid].cmds.filter((c) => c.op === op).length;
  t.eq([count('rw.bridge_scene', 'say'), count('rw.bridge_scene', 'set'), count('rw.bridge_scene', 'quest'), count('rw.bridge_scene', 'move')], [14, 2, 2, 1], 'rw.bridge_scene keeps its lines and state commands');
  t.eq([count('sg.asahi_name', 'say'), count('sg.asahi_name', 'take'), count('sg.asahi_name', 'give'), count('sg.asahi_name', 'fade')], [5, 1, 1, 2], 'sg.asahi_name keeps its lines, the card taken, the plate given, its fades');
  t.eq([count('sg.omi_wataru', 'take'), count('sg.omi_wataru', 'set'), count('sg.omi_wataru', 'note')], [1, 1, 1], 'sg.omi_wataru keeps the notice taken once, its flag and note');
  // the conditional phase only on Wataru's own route
  const soft = C.scenes['sg.omi_wataru'].cmds.find((c) => c.op === 'shot' && c.args[1] === 'soften');
  t.ok(soft && soft.if === 'sg_wataru_self', 'Ōmi\'s softened look is a phase of Wataru\'s own route only');

  // ---- the skip control's look-ahead ------------------------------------------------------------------------------
  const P = RB.script.parse(`
@scene t.skip
!sequence s1 begin
narr: A || one
!if flag_x -> later
narr: B || two
:later
!call t.sub
!sequence s1 end
narr: D || after
@scene t.sub
narr: C || three
@scene t.choice
!sequence s1 begin
narr: A || one
!choice
* x || x -> y
:y
narr: Z || unseen after the choice
!sequence s1 end
`, 'test');
  const sc = P.scenes['t.skip'], st = (c) => c === 'flag_x';
  RB.content.scenes['t.sub'] = P.scenes['t.sub'];
  const H = (jp, en) => SQ.lineHash({ jp, en });
  t.ok(SQ.aheadUnseen(sc, 0, 's1', new Set(), () => false), 'unseen lines ahead');
  t.ok(!SQ.aheadUnseen(sc, 0, 's1', new Set([H('A', 'one'), H('B', 'two'), H('C', 'three')]), () => false), 'all seen (the called scene too): nothing unseen');
  t.ok(SQ.aheadUnseen(sc, 0, 's1', new Set([H('A', 'one'), H('B', 'two')]), () => false), 'a line in a called scene counts');
  t.ok(!SQ.aheadUnseen(sc, 0, 's1', new Set([H('A', 'one'), H('C', 'three')]), st), 'the branch the state takes (B skipped by !if): only its lines count');
  t.ok(!SQ.aheadUnseen(sc, 0, 's1', new Set([H('A', 'one'), H('B', 'two'), H('C', 'three')].concat([])), () => false) && !SQ.aheadUnseen(P.scenes['t.choice'], 0, 's1', new Set([H('A', 'one')]), () => false), 'it stops at a choice (a skip never passes one)');

  // ---- the campaign record ------------------------------------------------------------------------------------------
  const s0 = RB.state.newCampaign({});
  t.eq(s0.seq, {}, 'a new campaign has an empty record of sequences seen');
  const old = JSON.parse(JSON.stringify(s0)); delete old.seq;
  RB.save.migrate(old);
  t.eq(old.seq, {}, 'an older save gains it on load (migrate); nothing else is needed');
  const rec = SQ.seenRec(old, 'ch1.bridge');
  t.eq(rec, { n: 0, h: [] }, 'a sequence\'s record starts empty');
};
