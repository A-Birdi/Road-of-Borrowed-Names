// RBN-QA-127 (Agnes 6347939181, 6348214241; Local CL-222; Cloud CC-129 §6): the yukata walk read its narration, the
// confession, the choice and the reply over the hall's doorway, and only then did yn.end bring up the night valley
// (the bridge, both lit houses, the crowd in yukata). Now the walk opens on that same valley shot, held through the
// confession and the choice, and yn.end carries the sequence on instead of beginning it again:
//  1. yn.walk begins the yn.end sequence on its valley shot after the dusk and before "That evening…", on every path
//     (no condition; the no-companion path goes from there to the vow), and hands it to yn.end with its last command;
//  2. nothing else in the three scenes changed: every line (speaker, expression, condition, text), every voice key, both
//     choices and where they lead, yn_hand / yn_side, the yn:walk bond once before the vow, the labels, and yn.end
//     command for command (its own begin, shots and end);
//  3. the Records page for yn.end reads the same beats for every companion (read from yn.end alone, as before);
//  4. the runtime rule: a begin of the very sequence already on screen in this campaign is carried on (one begin, the
//     same instance, the shot kept); with nothing on screen yn.end begins as before; another sequence on screen is
//     replaced, never carried on; the same sequence left from another campaign is begun anew;
//  5. the hand-over exists only here: each other sequence is begun by exactly one scene, and no other scene calls a
//     sequence's own scene while it is open.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, Q = RB.sequence;
  const walk = C.scenes['yn.walk'].cmds;
  // 1
  const firstSay = walk.findIndex((c) => c.op === 'say');
  const head = walk.slice(0, firstSay).map((c) => [c.op].concat(c.args || []).join(' ') + (c.if ? ' ?(' + c.if + ')' : ''));
  t.eq(head, ['ambience dusk', 'sequence yn.end begin', 'shot valley'], 'the walk opens on the valley shot, after the dusk, before its first line, on every path');
  t.ok(/^その/.test(walk[firstSay].jp) && walk[firstSay].who === 'narr', 'its first line is still "That evening…"');
  t.eq(walk.filter((c) => c.op === 'sequence' || c.op === 'shot').length, 2, 'no other sequence or shot op in the walk (the confession and the choice hold the valley)');
  const last = walk[walk.length - 1], hook = walk[walk.length - 2];
  t.ok(last.op === 'call' && last.args[0] === 'yn.end' && !last.if, 'the walk hands the sequence to yn.end with its last command');
  t.ok(hook.op === 'hook' && hook.args.join(' ') === 'co_bond yn:walk' && walk.filter((c) => c.op === 'hook').length === 1, 'the yn:walk bond, once, just before the vow');
  const none = walk.findIndex((c) => c.op === 'if' && c.args.join(' ') === 'comp=none -> vow');
  t.ok(none > firstSay && none < walk.findIndex((c) => c.op === 'choice'), 'with no companion the walk goes from the valley to the vow, before the choice');
  // 2
  const h = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const shape = (id, skip) => C.scenes[id].cmds.filter((c) => !(skip && (c.op === 'sequence' || c.op === 'shot'))).map((c) => [c.op, c.args || null, c.if || null, c.who || null, c.expr || null, c.jp || null, c.en || null, c.opts ? c.opts.map((o) => [o.jp, o.en, o.to, o.if || null]) : null]);
  // (the fingerprints of the CC-020 cut, 1272636: the walk without its two new commands, the confession, yn.end whole)
  t.eq([h(shape('yn.walk', true)), h(shape('yn.confess')), h(shape('yn.end'))], ['bbd4db4244424958', '6cf03d9f3e6835b6', '22c184adc7c606a9'],
    'every line, choice, flag and command of the walk, the confession and yn.end is as on the cut');
  t.eq(h(['yn.walk', 'yn.confess', 'yn.end'].map((id) => Object.keys(C.scenes[id].labels || {}))), 'bf5ad73fd9f3f00d', 'the same labels');
  const keys = [];
  for (const id of ['yn.walk', 'yn.confess', 'yn.end']) for (const c of C.scenes[id].cmds) if (c.op === 'say') keys.push(id + '#' + crypto.createHash('sha256').update(String(c.jp), 'utf8').digest('hex').slice(0, 10));
  t.ok(keys.length === 24 && h(keys) === '9beb1bcda3718f09', 'the same 24 voice keys (scene + text), so every recording still plays');
  const sets = walk.filter((c) => c.op === 'set').map((c) => c.args.join(' '));
  t.eq(sets, ['yn_hand', 'yn_side'], 'yn_hand and yn_side, one per reply');
  // 3
  const beats = {}, want = { none: '418c9b7190e50a2f', nao: 'd908390c6484839e', mio: '5df4f9e0e7c2a794', ren: 'e49b5ff5538162c6', suzu: '47858ce01c2fd92c' };
  for (const comp of [null, 'nao', 'mio', 'ren', 'suzu']) beats[comp || 'none'] = h(RB.volume.beats('yn.end', (cond) => RB.state.test(Object.assign(RB.state.newCampaign(), { comp }), cond), comp));
  t.eq(beats, want, 'the Records page for yn.end reads the same beats for every companion');
  const sb = RB.volume.beats('yn.end', (cond) => RB.state.test(Object.assign(RB.state.newCampaign(), { comp: 'suzu' }), cond), 'suzu');
  t.ok(sb.length === 3 && sb.every((b) => b.line.sceneId === 'yn.end') && sb[0].shot === 'valley', 'its beats are yn.end\'s own lines, from the valley (the walk is not part of the page): ' + sb.map((b) => b.shot).join(', '));
  // 4
  const s = RB.state.newCampaign(); RB.game.s = s; s.comp = 'suzu';
  const st = () => { const x = Q.stats(), i = Q.active() ? Q.state() : null; return { begun: x.begun, disposed: x.disposed, carried: x.carried, id: i && i.id, shot: i && i.shot, tok: i && i.tok }; };
  const b0 = st();
  await Q.cmd('yn.end', 'begin'); Q.toShot('valley');
  const a = st();
  await Q.cmd('yn.end', 'begin'); Q.toShot('valley');
  const b = st();
  t.ok(a.id === 'yn.end' && a.shot === 'valley' && b.begun === a.begun && b.carried === a.carried + 1 && b.tok === a.tok && b.shot === 'valley' && b.disposed === a.disposed,
    'yn.end called from the walk: carried on (no second begin, the same instance, the valley kept) ' + JSON.stringify([b0, a, b]));
  Q.toShot('ridge'); await Q.cmd('yn.end', 'end');
  const c = st();
  t.ok(!c.id && c.disposed === a.disposed + 1, 'and ended once, by yn.end');
  await Q.cmd('yn.end', 'begin');
  const d = st();
  t.ok(d.id === 'yn.end' && d.begun === c.begun + 1 && d.carried === c.carried, 'yn.end on its own, nothing on screen: it begins, as before');
  const other = Q.ids().find((i) => i !== 'yn.end');
  await Q.cmd(other, 'begin');
  const e = st();
  t.ok(e.id === other && e.begun === d.begun + 1 && e.disposed === d.disposed + 1 && e.carried === d.carried, 'another sequence on screen is replaced, not carried on (' + other + ')');
  RB.game.s = RB.state.newCampaign();
  await Q.cmd(other, 'begin');
  const f = st();
  t.ok(f.begun === e.begun + 1 && f.tok !== e.tok && f.carried === e.carried, 'the same sequence left from another campaign is begun anew');
  Q.dispose('test');
  // 5
  const by = {};
  for (const [id, sc] of Object.entries(C.scenes)) for (const x of sc.cmds) if (x.op === 'sequence' && (x.args[1] || 'begin') === 'begin') (by[x.args[0]] = by[x.args[0]] || []).push(id);
  t.eq(Object.entries(by).filter(([, v]) => v.length > 1).map(([k, v]) => k + ': ' + v.join(', ')), ['yn.end: yn.end, yn.walk'], 'only yn.end is begun by two scenes (the walk and its own)');
  const hand = [];
  for (const [id, sc] of Object.entries(C.scenes)) {
    let open = null;
    for (const x of sc.cmds) {
      if (x.op === 'sequence') open = (x.args[1] || 'begin') === 'begin' ? x.args[0] : null;
      else if (x.op === 'call' && open && Q.get(open).scene === x.args[0]) hand.push(id + ' → ' + x.args[0]);
    }
  }
  t.eq(hand, ['yn.walk → yn.end'], 'the only hand-over is the walk\'s');
};
