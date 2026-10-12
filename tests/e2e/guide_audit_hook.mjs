// The Quest Guide audit's hook, installed in the page (`await p.evaluate(installAudit, opts)`), shared by the
// whole-game audit (tests/e2e/quest_guide_audit.mjs) and its focused reproduction (tests/e2e/quest_guide_wrapped.mjs).
// Before every scene started from the world while a quest is followed, the guidance is asked where the quest's next
// step is (fresh, from the live state; an arrival scene's once-flag, set just before it runs, is taken off first).
// Every scene run inside that one is followed too, with the followed quest's stage before and after it: talking to a
// person who can be asked after others starts "Have you seen…?" (wb.ask, src/ui/53w_whereabouts.js), and only its
// Talk runs that person's own conversation, from inside it. When the followed quest moves on, the move is put down to
// the scene that was running when it happened: the innermost scene whose own run saw the stage rise, else the scene
// started from the world. Nothing is credited to a conversation that did not run (the wrapper's Talk branch not
// taken, a scene only named in its context). The verdict (`judge`): a hit when that scene is one the guidance pointed
// at and, for a person's conversation, the guidance pointed at that same person there.
// opts.wrongAt (a negative control only): the guidance's answer for the followed quest replaced by one target there,
// { map, kind, id, scene }, to show that a move the guidance did not point at is still reported as a miss.
// Results: window.__qgAudit (one record per scene started from the world), window.__qgJudge (the verdict).
export function installAudit(opts) {
  opts = opts || {};
  const log = (window.__qgAudit = window.__qgAudit || []);
  const stage = (q) => { const x = RB.game.s && RB.game.s.quests[q]; return x ? (x.done ? 999 : x.stage) : -1; };
  const judge = (r) => {
    const sc = r.at.scene;
    if (!r.scenes.includes(sc)) return false;
    if (!r.at.npc) return true;
    const people = r.targets.filter((t) => t.kind === 'npc' && t.scenes.includes(sc));
    return !people.length || people.some((t) => t.id === r.at.npc && t.map === r.map);
  };
  window.__qgJudge = judge;
  let cur = null;
  const orig = RB.script.run;
  RB.script.run = function (id, ctx) {
    const s = RB.game.s;
    // a scene run inside the one being followed
    if (cur && RB.script.isRunning()) {
      const q = cur.q;
      const rec = { scene: id, npc: (ctx && ctx.npc) || null, before: stage(q), after: null };
      cur.runs.push(rec);
      const pr = orig.call(this, id, ctx);
      Promise.resolve(pr).then(() => { rec.after = stage(q); });
      return pr;
    }
    let pend = null;
    if (s && !RB.script.isRunning()) {
      const q = RB.questGuide.followed(s);
      if (q) {
        const t0 = performance.now();
        let st = s;
        const key = 'enter:' + s.map + ':' + id;
        if (s.flags[key] && (RB.content.maps[s.map].onEnter || []).some((ev) => ev.scene === id)) { st = Object.assign({}, s, { flags: Object.assign({}, s.flags) }); delete st.flags[key]; }
        let r = RB.questGuide.analyse(q, st);
        if (opts.wrongAt) r = { how: 'control', targets: [{ map: opts.wrongAt.map, kind: opts.wrongAt.kind, id: opts.wrongAt.id, opts: [{ scene: opts.wrongAt.scene }] }] };
        const ms = performance.now() - t0;
        const targets = r.targets.map((t) => ({ map: t.map, kind: t.kind, id: t.id || t.p || null, scenes: (t.opts || []).map((o) => o.scene) }));
        pend = {
          q, before: stage(q), how: r.how, targets, scenes: [...new Set(targets.flatMap((t) => t.scenes))],
          way: r.targets.map((t) => t.map + ':' + (t.id || t.p || t.kind)), map: s.map, scene: id,
          npc: (ctx && ctx.npc) || null, talk: (ctx && ctx.talk) || null, runs: [], ms: Math.round(ms),
        };
      }
    }
    if (pend) cur = pend;
    const pr = orig.call(this, id, ctx);
    if (pend) Promise.resolve(pr).then(() => {
      if (cur === pend) cur = null;
      const now = stage(pend.q);
      const runs = pend.runs.map((x) => ({ scene: x.scene, npc: x.npc, from: x.before, to: x.after }));
      if (now > pend.before) {
        const inner = pend.runs.filter((x) => x.after != null && x.after > x.before).pop();
        const at = inner ? { scene: inner.scene, npc: inner.npc, via: pend.scene } : { scene: pend.scene, npc: pend.npc, via: null };
        // a quiet (bookkeeping) update: the scene raised the stage only with `!quest … quiet`
        const sc = RB.content.scenes[at.scene];
        const quiet = !!sc && sc.cmds.some((c) => c.op === 'quest' && c.args[0] === pend.q && c.args.includes('quiet')) && !sc.cmds.some((c) => c.op === 'quest' && c.args[0] === pend.q && !c.args.includes('quiet'));
        log.push({
          q: pend.q, from: pend.before, to: now, scene: at.scene + (at.via ? ' (in ' + at.via + ')' : ''), at, started: pend.scene, npc: pend.npc,
          talk: pend.talk, runs, map: pend.map, how: pend.how, targets: pend.targets, hit: judge({ at, scenes: pend.scenes, targets: pend.targets, map: pend.map }),
          quiet, way: pend.way, ms: pend.ms,
        });
      } else log.push({ q: pend.q, none: true, started: pend.scene, npc: pend.npc, talk: pend.talk, runs, ms: pend.ms });
    });
    return pr;
  };
}
