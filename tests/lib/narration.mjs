// The narration that depends on the Japanese level (P18 Plan B, Robin's C-89): every `say` in the compiled scenes whose
// condition reads the level (prof…), grouped into sets of variants and evaluated with the game's own condition test
// (RB.state.test, with the Hall's terms) at every level, with the Hall's Grow route on and off. Used by
// tests/unit/profile_narration.test.mjs (selection) and tests/e2e/profile_narration.mjs (rendering).
//   narration(RB).analyse({ sceneId: [cmd] }) → { lines, sets: [{ scene, at, lines: [{ i, line, if, jp, en, who }], cov }],
//     overlaps, never };  .kindOf(set) → 'complete' | 'Foundations only' | 'Advanced only' | 'gap: …'
export const LV = ['F', 'E', 'I', 'A'];
export const ALL = LV.flatMap((P) => [P, P + '+']);
export function narration(RB) {
  const atomRe = /^(!?)([\w.]+)(?:(>=|<=|!=|=|>|<)(.*))?$/;
  const isLevel = (a) => /^!?prof\b/.test(a), isGrow = (a) => /\.route=grow$/.test(a);
  const growWing = (cond) => { const m = String(cond).match(/hall\.(w\d+)\.route=grow/); return m ? m[1] : null; };
  // the terms other than the level and Grow: the same for every variant of a line
  const ctxOf = (cond) => { const set = new Set(); for (const cj of String(cond).split('|')) for (const a of cj.split('&')) if (!isLevel(a) && !isGrow(a)) set.add(a); return [...set].sort().join('&'); };
  // a state where those terms hold as written (flags, seen scenes, variables, the Hall's pattern through its own
  // record), at level P, with the wing's Grow route chosen or not (RB.hall.setChoice)
  function stateFor(ctx, P, grow, wing) {
    const s = RB.state.newCampaign({ profile: P });
    s.learn.profile = P;
    for (const a of ctx ? ctx.split('&') : []) {
      const m = a.match(atomRe);
      if (!m || m[1]) continue;
      const [, , key, op, val] = m, head = key.split('.')[0], rest = key.slice(head.length + 1);
      if (!op) { if (head === 'seen') s.seen[rest] = true; else s.flags[key] = true; }
      else if (op === '=') {
        if (head === 'hall' && rest.split('.')[1] === 'pat') RB.hall.wrec(s, rest.split('.')[0]).pat = +val;
        else if (head === 'var') s.vars[rest] = val;
        else if (head === 'comp') s.comp = val;
        else s.vars[key] = /^-?\d+$/.test(val) ? +val : val;
      }
    }
    if (wing && grow) RB.hall.setChoice(s, wing, { route: 'grow' });
    return s;
  }
  // scenes: { id: [cmd] } → { lines, sets: [{scene, at, lines, cov}], overlaps, never }
  function analyse(scenes) {
    const out = { lines: 0, sets: [], overlaps: [], never: [] };
    for (const id in scenes) {
      let run = null;
      const flush = () => { if (run) out.sets.push(...run.sets); run = null; };
      scenes[id].forEach((c, i) => {
        if (c.op !== 'say' || !/\bprof\b/.test(String(c.if || ''))) { flush(); return; }
        out.lines++;
        const ctx = ctxOf(c.if), wing = growWing(c.if);
        if (!run || run.ctx !== ctx || run.who !== c.who) { flush(); run = { ctx, who: c.who, wing: null, sets: [] }; }
        if (wing) run.wing = wing;
        const cov = {};
        for (const P of LV) for (const g of [false, true]) if (RB.state.test(stateFor(ctx, P, g, wing || run.wing), c.if)) cov[P + (g ? '+' : '')] = true;
        if (!Object.keys(cov).length) out.never.push(id + ' line ' + (c.line || i) + ': ' + c.if);
        let set = run.sets[run.sets.length - 1];
        const overlap = set && Object.keys(cov).some((k) => set.cov[k]);
        if (set && overlap && Object.keys(set.cov).length < ALL.length) out.overlaps.push(id + ' line ' + (c.line || i) + ': shown with another variant at ' + Object.keys(cov).filter((k) => set.cov[k]).join(' '));
        if (!set || overlap) { set = { scene: id, at: c.line || i, lines: [], cov: {} }; run.sets.push(set); }
        Object.assign(set.cov, cov);
        set.lines.push({ i, line: c.line, if: c.if, jp: c.jp, en: c.en, who: c.who });
      });
      flush();
    }
    return out;
  }
  const kindOf = (set) => { const k = ALL.filter((x) => set.cov[x]).join(' '); return k === ALL.join(' ') ? 'complete' : k === 'F F+' ? 'Foundations only' : k === 'A A+' ? 'Advanced only' : 'gap: ' + (k || 'none'); };

  return { analyse, kindOf, stateFor };
}
