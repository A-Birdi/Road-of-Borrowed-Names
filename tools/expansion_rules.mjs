// The expansion's content rules (docs/future/plan/02_FOUNDATIONS.md S1, S5; playbook P02), used by tools/validate.mjs
// and tested by tests/unit/expansion_rules.test.mjs.
//  1. every challenge has all four tiers (F, E, I, A);
//  2. every Japanese token has a lexicon entry;
//  3. every lore note says whether it is invented (fiction: true) or real culture (fiction: false) (spec line 32);
//  4. phases: no scene names a later chapter's people, places or story terms (C.reveals: chapter key -> terms; a
//     scene's chapter from its id's prefix, C.chapterOfPrefix; post-story scenes, '.post' or '_post' in the id, are
//     free);
//  5. concepts: a challenge's declared concepts (responses, constructions, modifiers) are taught by its chapter;
//  6. no task needs hearing: a listening step carries a transcript.
// opts.grandfather: { tiers, unknown, fiction } exceptions that predate the rules; opts.unknownTok: Map token -> where.
export function expansionRules(RB, C, opts = {}) {
  const GF = Object.assign({ tiers: [], unknown: [], fiction: [] }, opts.grandfather || {});
  const errors = [], found = { tiers: [], unknown: [], fiction: [] };
  const E = (m) => errors.push(m);
  for (const id in C.challenges) {
    const ch = C.challenges[id];
    if (!ch.tiers) continue;
    const miss = ['F', 'E', 'I', 'A'].filter((k) => !ch.tiers[k]);
    if (!miss.length) continue;
    found.tiers.push(id);
    if (GF.tiers.indexOf(id) < 0) E('challenge ' + id + ': missing tier ' + miss.join(', ') + ' (new content needs all four)');
  }
  for (const [k, w] of opts.unknownTok || []) {
    found.unknown.push(k);
    if (GF.unknown.indexOf(k) < 0) E(w + ': no lexicon entry for ' + k + ' (new content: add it to the chapter\'s lex file)');
  }
  for (const id in C.notes) {
    const n = C.notes[id];
    if (typeof n.fiction === 'boolean') continue;
    found.fiction.push(id);
    if (GF.fiction.indexOf(id) < 0) E('note ' + id + ': say whether it is fiction (fiction: true) or real culture (fiction: false)');
  }
  const order = RB.edition.ORDER;
  const chOf = (id) => { const pre = String(id).split(/[._]/)[0]; return (C.chapterOfPrefix || {})[pre] || null; };
  const reveals = C.reveals || {};
  for (const id in C.scenes) {
    const k = chOf(id);
    if (!k || /\.post\b|_post\b/.test(id)) continue;
    const at = order.indexOf(k);
    for (const later of order.slice(at + 1)) for (const term of reveals[later] || []) {
      for (const c of C.scenes[id].cmds) if (c.op === 'say' && ((c.jp && c.jp.indexOf(term) >= 0) || (c.en && c.en.indexOf(term) >= 0))) E(id + ': names ' + term + ' (introduced in ' + later + ', after ' + k + ')');
    }
  }
  const CON = RB.phase.concepts();
  for (const id in C.challenges) {
    const ch = C.challenges[id];
    const k = ch.ch || chOf(id);
    for (const cid of ch.concepts || []) {
      const d = CON[cid];
      if (!d) { E('challenge ' + id + ': unknown concept ' + cid); continue; }
      if (k && d.ch && order.indexOf(d.ch) > order.indexOf(k)) E('challenge ' + id + ' (' + k + '): uses ' + cid + ', taught later (' + d.ch + ')');
    }
  }
  const listen = (st, where) => { if (st && st.kind === 'listen' && !(st.transcript && st.transcript.jp)) E(where + ': a listening step needs a transcript (no task may need hearing)'); };
  for (const id in C.challenges) for (const k in C.challenges[id].tiers || {}) C.challenges[id].tiers[k].forEach((st, i) => listen(st, 'challenge ' + id + '[' + k + '][' + i + ']'));
  return { errors, found };
}
