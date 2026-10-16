// Which companions say a line written for "whoever travels with you" (`comp`): RV-0160 (C-95, Robin 2026-10-16:
// "fix the production plan's companion-branch attribution"). A line's own condition was not enough: a scene that jumps
// with `!if comp=ren -> ren` puts every line under that label in Ren's mouth only, though the lines themselves carry
// no condition. Shared by tools/voice/fullgame_count.mjs and tools/voice/production_manifest.mjs.
//   branches(scene)            per command, the companion whose branch it sits in (or null)
//   companionsOf(line, branch) { comps: [...], basis: 'condition' | 'branch' | 'scene-name' | 'open' }
// The same branch analysis as tools/review/register_extract.mjs (RV-1), which the review read the script with.
export const COMPS = ['nao', 'mio', 'ren', 'suzu'];

// per command, the companion whose branch it is in (forward jumps; a label reached from one companion only)
export function branches(sc) {
  const cmds = sc.cmds || [];
  const at = {};
  for (const l in sc.labels || {}) (at[sc.labels[l]] = at[sc.labels[l]] || []).push(l);
  const into = {};
  const add = (label, who) => (into[label] = into[label] || new Set()).add(who || 'ANY');
  const out = [];
  let cur = null;
  cmds.forEach((c, idx) => {
    if (at[idx]) {
      const prev = cmds[idx - 1];
      const ins = new Set();
      for (const l of at[idx]) for (const w of into[l] || []) ins.add(w);
      if (prev && !/^(end|goto|depart|warp)$/.test(prev.op) && !(prev.op === 'call' && !prev.if)) ins.add(cur || 'ANY');
      cur = ins.size === 1 && !ins.has('ANY') ? [...ins][0] : null;
    }
    out[idx] = cur;
    if (c.op === 'if' && c.args && c.args[1] === '->') {
      const m = /(?:^|&)comp=(nao|mio|ren|suzu)/.exec(c.args[0]);
      add(c.args[2], m ? m[1] : cur);
      // `!if comp!=suzu -> end`: only Suzu carries on past it
      const n = /^comp!=(nao|mio|ren|suzu)$/.exec(c.args[0]);
      if (n) cur = n[1];
    } else if (c.op === 'end' && /^comp!=(nao|mio|ren|suzu)$/.test(c.if || '')) {
      cur = /^comp!=(nao|mio|ren|suzu)$/.exec(c.if)[1]; // `?(comp!=suzu) !end`: only Suzu carries on
    } else if (c.op === 'choice' && c.opts) {
      for (const o of c.opts) if (o.to) add(o.to, cur);
    } else if (c.op === 'goto' && c.args) add(c.args[0], /comp=(nao|mio|ren|suzu)/.test(c.if || '') ? /comp=(nao|mio|ren|suzu)/.exec(c.if)[1] : cur);
  });
  return out;
}

// the companions a condition allows (`comp=` / `comp!=` / `party=`; `&` narrows, `|` widens); null: it says nothing
function byCondition(cond) {
  if (!cond) return null;
  let said = false;
  const out = new Set();
  for (const a of String(cond).split('|')) {
    let allowed = COMPS.slice();
    for (const t of a.split('&')) {
      const m = /^(?:comp|party)(=|!=)(\w+)$/.exec(t.trim());
      if (!m || !COMPS.includes(m[2])) continue;
      said = true;
      allowed = m[1] === '=' ? allowed.filter((c) => c === m[2]) : allowed.filter((c) => c !== m[2]);
    }
    allowed.forEach((c) => out.add(c));
  }
  return said ? [...out] : null;
}

// line: { scene, if }; branch: the companion of the branch the line sits in (from branches()), or null
export function companionsOf(line, branch) {
  const c = byCondition(line.if);
  if (c && c.length < COMPS.length) return { comps: c, basis: 'condition' };
  if (branch && COMPS.includes(branch)) return { comps: c ? c.filter((x) => x === branch) : [branch], basis: 'branch' };
  // a scene named for one companion (co.t_ren_stars) is that companion's: a naming convention, so marked as such
  const n = /(?:^|[._])(nao|mio|ren|suzu)(?:$|[._\d])/.exec(line.scene || '');
  if (n) return { comps: [n[1]], basis: 'scene-name' };
  return { comps: c || COMPS.slice(), basis: c ? 'condition' : 'open' };
}
