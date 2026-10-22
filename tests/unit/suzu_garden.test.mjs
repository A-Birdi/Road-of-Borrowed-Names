// RBN-QA-125 (Agnes 6351678399; Local CL-222, CL-226; Cloud CC-128 §7): Suzu's night apart was played in the Upper
// House's reception, under a night tint, with no garden in sight. Now the inn's back garden is illustrated
// (src/ui/43m_seq_yn.js, yn.suzu_garden). In node:
//  1. the definition: two compositions (the garden; the two of you on her stone), each one drawing, naming its phases
//     (each one-time action ≤ 1.6 s) and reporting its focal area and safe areas; a title with readings; the scene it
//     belongs to; not a page of the travel volume (a cutaway for one companion's night) and no Company memory of its
//     own (the scene keeps its own, yn_garden);
//  2. the script: the garden is up before the first line and stays through her coming back (comp_back, yn_apart
//     unset); the stone for the choice; the end last, after the evening's flags, the bond, the memory and her place
//     beside you, so it dissolves back to the room's own map; nothing warps, battles or starts an encounter inside;
//     the room scene still calls it on her night;
//  3. every line, choice, flag and hook of the scene as it was (a fingerprint without the sequence's own commands);
//  4. the volume: no page for it, every other page as it was.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SQ = RB.sequence, C = RB.content, ID = 'yn.suzu_garden';
  // ---- 1. the definition
  const d = SQ.get(ID);
  t.ok(!!d, 'yn.suzu_garden is defined');
  if (!d) return;
  const shots = Object.values(d.shots);
  t.eq(Object.keys(d.shots), ['garden', 'stone'], 'two compositions: the garden, then the two of you on her stone');
  t.ok(shots.every((s) => typeof s.draw === 'function' && s.phases.length && s.phases.every((ph) => ph.id && ph.ms > 0 && ph.ms <= 1600)), 'every shot draws and names its phases (each one-time action ≤ 1.6 s)');
  t.ok(shots.every((s) => typeof s.focus === 'function' && s.safe && s.safe.wide && s.safe.narrow && s.safe.land), 'every shot reports its focal area and its safe areas');
  t.ok(d.scene === ID && d.chapter === 'yn' && d.title && /\{.+\|.+\}/.test(d.title.jp), 'its scene, its chapter and a title with readings');
  t.ok(d.page === false && !d.memory, 'not a page of the travel volume, and no Company memory of its own');
  // ---- 2. the script
  const cmds = C.scenes[ID].cmds;
  const at = (f) => cmds.findIndex(f);
  const iB = at((c) => c.op === 'sequence' && c.args[0] === ID && (c.args[1] || 'begin') === 'begin');
  const iG = at((c) => c.op === 'shot' && c.args[0] === 'garden'), iS = at((c) => c.op === 'shot' && c.args[0] === 'stone');
  const iE = at((c) => c.op === 'sequence' && c.args[0] === ID && c.args[1] === 'end');
  const iSay = at((c) => c.op === 'say'), iBack = at((c) => c.op === 'hook' && c.args[0] === 'comp_back');
  const iUnset = at((c) => c.op === 'unset' && c.args[0] === 'yn_apart'), iChoice = at((c) => c.op === 'choice');
  t.ok(iB >= 0 && iG === iB + 1 && iG < iSay && cmds.slice(0, iB).every((c) => c.op !== 'say'), 'the garden is up before the first line');
  t.ok(iG < iBack && iBack < iUnset && iUnset < iS && cmds.slice(iG + 1, iS).every((c) => c.op !== 'shot'), 'and stays through her coming back to you (comp_back, yn_apart unset)');
  t.ok(iS === iChoice - 1, 'the two of you on her stone for the choice');
  t.ok(iE === cmds.length - 1 && ['yn_suzu_back', 'yn_eve_done'].every((f) => at((c) => c.op === 'set' && c.args[0] === f) < iE) && at((c) => c.op === 'refresh') < iE,
    'it ends last, after the evening\'s flags, the bond, the memory and her place beside you');
  t.eq(cmds.filter((c) => ['warp', 'encounter', 'battle', 'shake', 'sequence'].includes(c.op) && !(c.op === 'sequence' && c.args[0] === ID)).map((c) => c.op), [], 'nothing inside warps, battles or starts another sequence');
  const room = C.scenes['yn.kami_room'].cmds;
  const iIf = room.findIndex((c) => c.op === 'if' && /yn_suzu_night&!yn_suzu_back/.test(JSON.stringify(c.args)) && /suzu/.test(JSON.stringify(c.args).split('yn_suzu_back')[1]));
  t.ok(iIf >= 0 && room.some((c) => c.op === 'call' && c.args[0] === ID), 'the room scene still calls it on her night (' + JSON.stringify(room[iIf] && room[iIf].args) + ')');
  // ---- 3. every line, choice, flag and hook as it was (choices without their source line numbers)
  const shape = cmds.filter((c) => !['sequence', 'shot'].includes(c.op)).map((c) => [c.op, c.args || null, c.if || null, c.who || null, c.expr || null, c.jp || null, c.en || null, c.opts ? JSON.stringify(c.opts.map((o) => [o.jp, o.en, o.to, o.if])) : null]);
  t.eq(crypto.createHash('sha256').update(JSON.stringify(shape)).digest('hex').slice(0, 16), '82df2aebbe853025', 'every line, choice, flag and hook of the scene as it was');
  // ---- 4. the volume
  const pages = RB.volume.pages();
  t.ok(!pages.some((p) => p.id === ID || p.seq === ID), 'no page of the travel volume for it');
  t.ok(pages.filter((p) => p.key === 'yn').map((p) => p.id).join(' ') === 'yn.kettle yn.end', 'Steamhollow\'s pages as they were (' + pages.filter((p) => p.key === 'yn').map((p) => p.id).join(' ') + ')');
};
