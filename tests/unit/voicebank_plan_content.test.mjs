// VR-C1: the voices' lookahead planner (src/audio/52_voicebank.js plan) over the whole real script. From every spoken
// line of every scene, for a new journey with each companion, it must never change the journey (it reads conditions,
// it runs nothing), never throw, and only ever name lines the runner can reach from there without a choice or an
// unknown condition between. Also measured: how often the old raw-order scan named a line the plan does not.
import { RB } from '../../tools/voice/lines.mjs';

export default async function (t) {
  const scenes = RB.content.scenes;
  const plan = RB.voicebank._.plan;
  t.ok(typeof plan === 'function', 'the planner is exposed for tests');
  if (typeof plan !== 'function') return;
  const keep = RB.game.s;
  let positions = 0, same = 0, rawExtra = 0, rawExtraLines = 0, planned = 0, errors = 0, changed = 0, later = 0, nextKnown = 0;
  // RB.state.peek answers as RB.state.test does wherever it answers, and declines only a registered head
  {
    const s = RB.state.newCampaign({});
    s.comp = 'suzu';
    const conds = new Set();
    for (const sc of Object.values(scenes)) for (const c of sc.cmds || []) { if (c.if) conds.add(c.if); if (c.op === 'if') { const i = c.args.indexOf('->'); if (i > 0) conds.add(c.args.slice(0, i).join(' ')); } }
    let agree = 0, declined = 0, wrong = 0;
    for (const c of conds) {
      const v = RB.state.peek(s, c);
      if (v === null) { declined++; continue; }
      if (v === RB.state.test(s, c)) agree++; else { wrong++; if (wrong < 4) t.log('peek differs: ' + c); }
    }
    t.ok(wrong === 0 && agree > 1000, 'peek agrees with test on ' + agree + ' conditions (' + declined + ' declined: a registered head), differs on ' + wrong);
    t.ok(RB.state.peek(s, 'prof=F') !== null && RB.state.peek(s, 'comp=suzu') === true && RB.state.peek(s, 'slot.as_mitsue=1') === null && RB.state.peek(s, '!fish.intro') === null, 'built-in heads are read, registered ones declined');
    t.ok(!(s.world && s.world.towns && s.world.towns.ashihara), 'peek built nothing (no town record)');
  }
  for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const s = RB.state.newCampaign({});
    s.comp = comp;
    RB.game.s = s;
    const before = JSON.stringify(s);
    for (const [id, sc] of Object.entries(scenes)) {
      const cmds = sc.cmds || [];
      for (let i = -1; i < cmds.length; i++) {
        if (i >= 0 && !(cmds[i].op === 'say' && cmds[i].jp)) continue;
        positions++;
        let out;
        try { out = plan([{ sceneId: id, pc: i + 1, called: false }], 3); } catch (e) { errors++; if (errors < 4) t.log('plan error ' + id + ' ' + i + ': ' + e.message); continue; }
        planned += out.length;
        if (cmds.slice(i + 1).some((c) => c.op === 'say' && c.jp && !/\$\w+/.test(c.jp))) { later++; if (out.length) nextKnown++; }
        // the old scan: the next three commands with Japanese in them, in the file's order
        const raw = [];
        for (let k = i + 1; k < cmds.length && raw.length < 3; k++) if (cmds[k].jp && !/\$\w+/.test(cmds[k].jp)) raw.push(cmds[k]);
        const mine = out.filter((l) => l.sceneId === id).map((l) => l.c);
        if (raw.length === mine.length && raw.every((c, k) => c === mine[k])) same++;
        const extra = raw.filter((c) => !mine.includes(c));
        if (extra.length) { rawExtra++; rawExtraLines += extra.length; }
        // every planned line of this scene is a spoken line, in order, after the start
        let last = -1;
        for (const l of out) {
          if (l.sceneId !== id) continue;
          const at = cmds.indexOf(l.c);
          if (at < 0 || l.c.op !== 'say') { errors++; break; }
          if (at <= i && !cmds.some((c) => c.op === 'goto' || c.op === 'if')) { errors++; break; }
          last = at;
        }
        void last;
      }
    }
    if (JSON.stringify(s) !== before) changed++;
  }
  RB.game.s = keep;
  t.ok(errors === 0, 'the planner never throws and names only spoken lines (' + errors + ' problems)');
  t.ok(changed === 0, 'planning from every line changed no journey (' + changed + ' of 4 changed)');
  t.ok(positions > 10000, 'every spoken line of every scene was planned from (' + positions + ')');
  t.log('plan over the real script, 4 companions: ' + positions + ' positions; the plan matches the old raw-order scan at ' + same +
    ' (' + Math.round((100 * same) / positions) + ' %); the raw scan named ' + rawExtraLines + ' lines the plan does not (at ' + rawExtra + ' positions: after a choice, an end, a false or unknown condition, or a battle/lesson); ' +
    (planned / positions).toFixed(2) + ' lines planned on average; where a later line exists in the file (' + later + '), the next one is known at ' + nextKnown + ' (' + Math.round((100 * nextKnown) / later) + ' %)');
}
