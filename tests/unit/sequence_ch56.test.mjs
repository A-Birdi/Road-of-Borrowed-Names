// The illustrated sequences of Chapters 5 and 6 (src/ui/43e_seq_ch5.js, 43f_seq_ch6.js; docs/expressive/SHOTS.md §5,
// §6, §7b, §8.4), in node:
// - the registry: ch5.bell and ch6.toya with 3–6 compositions each, ch5.boat (the one-line faded passage) with one,
//   ch6.ren (the personal questline's insert) with three;
//   every shot draws, names its phases (each one-time action short) and reports its focal area;
// - the scripts: each sequence begun and ended in its scene, every !shot a shot (and phase) of it, every composition
//   used, no !shake inside; the Chapter 6 bell shot and its phases only where Tōya's bell is carried; the crossing
//   begun after the scene's own fade (so the dark lifts over it) and ended before the warp; Ren's folio only on the
//   open branch (after its state lines, both ways in reaching it), never on "Leave it" or the companion-not-Ren path;
// - the scenes' lines and state commands are those of the scenes before the sequences (the counts as at da9751c, and
//   sa.shelf_ren's as at b07c492: only presentation ops were added, and the bell scene's !shake became the gong
//   shot's own swing).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SQ = RB.sequence, C = RB.content;

  // ---- the registry ------------------------------------------------------------------------------------------
  for (const [id, lo, hi, scene] of [['ch5.bell', 3, 6, 'lf.bell_touch'], ['ch6.toya', 3, 6, 'sa.toya_read'], ['ch5.boat', 1, 1, 'lf.boat_to_tower'], ['ch6.ren', 3, 3, 'sa.shelf_ren']]) {
    const d = SQ.get(id);
    t.ok(!!d, id + ' is defined');
    if (!d) continue;
    const shots = Object.values(d.shots);
    t.ok(shots.length >= lo && shots.length <= hi, id + ': ' + shots.length + ' compositions');
    t.ok(d.scene === scene && d.title && /\{.+\|.+\}/.test(d.title.jp), id + ': its scene and a title (the Japanese with its readings)');
    t.ok(shots.every((s) => typeof s.draw === 'function' && s.phases.length && s.phases.every((ph) => ph.id && ph.ms > 0 && ph.ms <= 1600)), id + ': every shot draws and names its phases (each one-time action ≤ 1.6 s)');
    t.ok(shots.every((s) => typeof s.focus === 'function' && s.safe && s.safe.wide && s.safe.narrow && s.safe.land), id + ': every shot reports its focal area and its safe areas (wide, narrow, a phone on its side)');
  }

  // ---- the scripts --------------------------------------------------------------------------------------------
  const inside = {};
  for (const [sid, seq] of [['lf.bell_touch', 'ch5.bell'], ['sa.toya_read', 'ch6.toya'], ['lf.boat_to_tower', 'ch5.boat'], ['sa.shelf_ren', 'ch6.ren']]) {
    const cmds = C.scenes[sid].cmds;
    const b = cmds.findIndex((c) => c.op === 'sequence' && c.args[0] === seq && (c.args[1] || 'begin') === 'begin');
    const e = cmds.findIndex((c) => c.op === 'sequence' && c.args[0] === seq && c.args[1] === 'end');
    t.ok(b >= 0 && e > b, sid + ': ' + seq + ' begins and ends in the scene');
    const ins = inside[seq] = cmds.slice(b + 1, e);
    const def = SQ.get(seq);
    const bad = ins.filter((c) => c.op === 'shot' && !(def.shots[c.args[0]] && (!c.args[1] || def.shots[c.args[0]].phases.some((p) => p.id === c.args[1]))));
    t.eq(bad.map((c) => c.args.join(' ')), [], sid + ': every !shot names a shot (and phase) of ' + seq);
    t.ok(!ins.some((c) => c.op === 'shake'), sid + ': no !shake inside the sequence');
    t.eq([...new Set(ins.filter((c) => c.op === 'shot').map((c) => c.args[0]))].sort(), Object.keys(def.shots).sort(), sid + ': every composition of ' + seq + ' is used');
    // a phase is started only after its shot is on (phases only go forward, in their order)
    const order = {};
    let okOrder = true, cur = null;
    for (const c of ins) {
      if (c.op !== 'shot') continue;
      const ph = def.shots[c.args[0]].phases.map((p) => p.id);
      if (!c.args[1]) { cur = c.args[0]; order[cur] = 0; continue; }
      const j = ph.indexOf(c.args[1]);
      if (c.args[0] !== cur || j <= (order[cur] || 0)) okOrder = false;
      order[cur] = j;
    }
    t.ok(okOrder, sid + ': each phase follows its own shot, in the shot\'s order');
  }
  // the bell scene: the first shot held through the lesson, the challenge and the choice; "Not yet" ends the scene
  const bt = C.scenes['lf.bell_touch'].cmds;
  const bIdx = (op, a0) => bt.findIndex((c) => c.op === op && (a0 == null || c.args[0] === a0));
  t.ok(bIdx('sequence') < bIdx('lesson') && bIdx('lesson') < bIdx('challenge') && bIdx('challenge') < bIdx('choice') && !bt.slice(bIdx('sequence'), bIdx('choice')).some((c) => c.op === 'shot' && c.args[0] !== 'bell'), 'lf.bell_touch: the bell shot is held through the lesson, the challenge and the choice');
  t.ok(bt[bIdx('sequence') - 1].op === 'if' && /lf_boss_done/.test(bt[bIdx('sequence') - 1].args.join(' ')), 'lf.bell_touch: the sequence begins after the keeper\'s guard (never before the boss)');
  const endB = bt.findIndex((c) => c.op === 'sequence' && c.args[1] === 'end');
  t.ok(bt[endB + 1].op === 'fade' && bt[endB + 1].args[0] === 'out', 'lf.bell_touch: the sequence ends before the scene\'s own fade to the shore');
  // Chapter 6: the bell's shot only with the bell
  const toya = inside['ch6.toya'];
  const bellOps = toya.filter((c) => c.op === 'shot' && c.args[0] === 'bell');
  t.ok(bellOps.length === 3 && bellOps.every((c) => c.if === 'item.lf_toya_bell'), 'sa.toya_read: Tōya\'s bell shot and its phases only where the bell is carried');
  // the crossing: begun after the scene's own fade (lifted out of the dark), ended before the warp
  const bo = C.scenes['lf.boat_to_tower'].cmds, sb = bo.findIndex((c) => c.op === 'sequence' && c.args[1] === 'begin'), se = bo.findIndex((c) => c.op === 'sequence' && c.args[1] === 'end');
  t.ok(bo[sb - 1].op === 'fade' && bo[sb - 1].args[0] === 'out' && bo[se + 1].op === 'warp', 'lf.boat_to_tower: the crossing begins in the fade\'s dark and ends before the warp to the tower');
  t.ok(bo.findIndex((c) => c.op === 'label' || (c.op === 'choice')) < sb, 'lf.boat_to_tower: "Not yet" never starts it (the sequence is inside the "Row out" branch)');
  // Ren's folio: inside the open branch only, after its state lines; both answers that open it reach it
  const sr = C.scenes['sa.shelf_ren'], rc = sr.cmds, L = sr.labels;
  const rb = rc.findIndex((c) => c.op === 'sequence' && c.args[0] === 'ch6.ren' && c.args[1] === 'begin'), re = rc.findIndex((c) => c.op === 'sequence' && c.args[0] === 'ch6.ren' && c.args[1] === 'end');
  t.ok(L.ropen >= 0 && L.rleave > L.ropen && rb > L.ropen && re > rb && re < L.rleave && rc.slice(re + 1, L.rleave).every((c) => c.op !== 'say'), 'sa.shelf_ren: ch6.ren begins and ends inside the open branch (:ropen), its last line the glasses');
  t.ok(rc.slice(L.ropen, rb).every((c) => c.op !== 'say') && ['set', 'quest'].every((op) => rc.slice(L.ropen, rb).some((c) => c.op === op)), 'sa.shelf_ren: the branch\'s flag and quest lines run before the sequence begins (once, as before)');
  t.ok(rb > L.ropen && L.rtake < L.ropen && rc.slice(L.rtake, L.ropen).every((c) => !['goto', 'end', 'choice'].includes(c.op)) && rc.slice(L.ryours, L.rtake).some((c) => c.op === 'goto' && c.args[0] === 'ropen'), 'sa.shelf_ren: "Take it back" falls through to it and "You decide" goes to it');
  t.ok(rc.every((c, i) => !(c.op === 'sequence' || c.op === 'shot') || (i >= rb && i <= re)), 'sa.shelf_ren: no sequence or shot op outside the open branch (never on "Leave it", Mio\'s or anyone\'s carried-home path)');
  t.ok(inside['ch6.ren'].some((c) => c.op === 'challenge' && c.args[0] === 'sa.ren_reply'), 'sa.shelf_ren: Ren\'s reply challenge is met inside the sequence');
  t.ok(SQ.get('ch6.ren').memory === true && SQ.get('ch6.ren').memo && /Ren/.test(SQ.get('ch6.ren').memo.en), 'ch6.ren: kept as a memory, with its line in the album');

  // ---- the scenes' lines and state commands as they were -----------------------------------------------------------
  const count = (sid) => { const o = {}; for (const c of C.scenes[sid].cmds) o[c.op] = (o[c.op] || 0) + 1; return o; };
  const pick = (o, keys) => keys.map((k) => o[k] || 0);
  const K = ['say', 'set', 'note', 'quest', 'take', 'give', 'journal', 'challenge', 'lesson', 'choice', 'music', 'sfx', 'fade', 'warp', 'autosave', 'checkpoint', 'call'];
  t.eq(pick(count('lf.bell_touch'), K), [26, 1, 1, 4, 0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 2, 1, 1], 'lf.bell_touch keeps its lines and state commands (the !shake alone became the gong shot\'s swing)');
  t.eq(count('lf.bell_touch').shake || 0, 0, 'lf.bell_touch: its one !shake is now the shot\'s own action');
  t.eq(pick(count('lf.boat_to_tower'), K), [3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0], 'lf.boat_to_tower keeps its lines, its fades and its warp');
  t.eq(pick(count('sa.toya_read'), K), [23, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0], 'sa.toya_read keeps its lines, the folio taken once, its flag, note, quest and journal');
  t.eq(pick(count('sa.shelf_ren'), K), [31, 4, 0, 2, 0, 1, 0, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0], 'sa.shelf_ren keeps its lines, flags, quest lines, the folio given, its challenge, choices and music');
  t.eq([count('sa.shelf_ren').sequence, count('sa.shelf_ren').shot, count('sa.shelf_ren').shake || 0], [2, 7, 0], 'sa.shelf_ren: only the two sequence ops and seven shot ops were added');
};
