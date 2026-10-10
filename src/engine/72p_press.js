/* The press (expansion P09; plan 08_CULTURE.md C15, 06_WORLD.md W10; Robin's R1 "craft stories from building blocks
 * of words, without restraint… experience their rating by interacting with people around the world who happen to be
 * reading their printed story"; C-24: bounded blocks). The rules; the screen is src/ui/89p_press.js.
 *
 * Bounded freedom, honest reactions:
 *   - A work is a kind ('story' or 'notice') and one block per slot (RB.content.press.kinds[kind].slots). Blocks are
 *     authored sentences with tags; some unlock as the journey goes on (a condition). Any combination may be printed:
 *     absurd and funny works are welcome. Nothing is graded when composing.
 *   - The game never pretends to understand text it cannot read: readers react only to the blocks' tags.
 *   - Setting the type by hand is optional practice; its feedback is the language runner's, and the printed page is
 *     always the block's own sentence. Proofreading is not reader taste, and readers never comment on language.
 *   - Circulating a version (posted at the press, left at an inn, or given out at a stall: no money, a favour
 *     economy) places a bounded number of reactions (3–5) on readers around the world: each reader's first rule
 *     whose tags hold, the more specific first. Talking to a reader with a reaction waiting hears it, once.
 *   - Revising makes a new version and new reactions. No sales, paper stock or popularity: nothing to grind.
 * The record (s.practice.press, made at the first printing; New Game+ carries it as practice, F-03):
 *   { v: 1, version, kind, blocks: { slot: blockId }, tags, where, rx: { reader: ruleIndex }, heard: { reader: version },
 *     printed: { story: n, notice: n } }
 * A reader's waiting reaction is the flag press_rx_<reader> (so a talk option can wait on it). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.press = (function () {
  'use strict';
  const C = () => (RB.content && RB.content.press) || { kinds: {}, blocks: {}, readers: [] };
  const MAX_RX = 5, MIN_RX = 3;

  const kind = (k) => C().kinds[k] || null;
  const block = (id) => { for (const slot in C().blocks) { const b = C().blocks[slot].find((x) => x.id === id); if (b) return Object.assign({ slot }, b); } return null; };
  // the blocks a slot offers now (unlocked by the journey)
  function offered(s, slot) {
    return (C().blocks[slot] || []).filter((b) => !b.unlock || (s && RB.state.test(s, b.unlock)));
  }
  // a composition: { kind, blocks: { slot: id } } → complete when every slot has an offered block
  function complete(s, comp) {
    const k = comp && kind(comp.kind);
    return !!k && k.slots.every((slot) => comp.blocks && comp.blocks[slot] && offered(s, slot).some((b) => b.id === comp.blocks[slot]));
  }
  // its tags: every block's, plus the kind
  function tagsOf(comp) {
    const out = new Set(['kind:' + comp.kind]);
    for (const slot in comp.blocks || {}) { const b = block(comp.blocks[slot]); if (b) for (const t of b.tags || []) out.add(t); }
    return [...out].sort();
  }
  // the page: the blocks' sentences in slot order
  function lines(comp) {
    const k = kind(comp.kind);
    return k ? k.slots.map((slot) => block(comp.blocks[slot])).filter(Boolean) : [];
  }
  // does a rule's tag list hold ('sea', '!sad': all must hold; '!' negates)
  function holds(when, tags) {
    return [].concat(when || []).every((t) => (t[0] === '!' ? tags.indexOf(t.slice(1)) < 0 : tags.indexOf(t) >= 0));
  }
  const specificity = (when) => [].concat(when || []).length;
  // the reactions a set of tags draws: [{ reader, rule }], 3–5, the most specific first, ties in a seeded order
  function reactions(s, tags, version) {
    const out = [];
    for (const r of C().readers) {
      if (r.if && s && !RB.state.test(s, r.if)) continue; // a reader the journey has not met yet
      const i = (r.rules || []).findIndex((ru) => holds(ru.when, tags));
      if (i >= 0) out.push({ reader: r.id, rule: i, spec: specificity(r.rules[i].when) });
    }
    const seed = RB.util && RB.util.hashStr ? RB.util.hashStr(tags.join(',') + '#' + version) : version;
    const rnd = (id) => (RB.util && RB.util.hashStr ? RB.util.hashStr(id + '#' + seed) : id.length) % 1000;
    out.sort((a, b) => b.spec - a.spec || rnd(a.reader) - rnd(b.reader));
    // the specific ones (a rule with tags), then fallbacks only to reach the minimum
    const spec = out.filter((x) => x.spec > 0), fall = out.filter((x) => x.spec === 0);
    const pick = spec.slice(0, MAX_RX);
    for (const f of fall) if (pick.length < MIN_RX) pick.push(f);
    return pick.map((x) => ({ reader: x.reader, rule: x.rule }));
  }
  const of = (s) => (s && s.practice && s.practice.press) || null;
  // print and circulate a composition: a new version, its reactions placed (the record is made here)
  function circulate(s, comp, where) {
    if (!s || !complete(s, comp)) return null;
    const p = RB.practice.of(s);
    if (!p.press || typeof p.press !== 'object') p.press = { v: 1, version: 0, printed: { story: 0, notice: 0 }, heard: {} };
    const rec = p.press;
    // the reactions of the version before are taken off the readers (a revision replaces them)
    for (const id in rec.rx || {}) delete s.flags['press_rx_' + id];
    rec.version += 1;
    rec.kind = comp.kind;
    rec.blocks = Object.assign({}, comp.blocks);
    rec.tags = tagsOf(comp);
    rec.where = where || 'board';
    rec.printed[comp.kind] = (rec.printed[comp.kind] || 0) + 1;
    rec.rx = {};
    for (const x of reactions(s, rec.tags.concat(['where:' + rec.where]), rec.version)) { rec.rx[x.reader] = x.rule; s.flags['press_rx_' + x.reader] = true; }
    s.flags.press_printed = true;
    if (comp.kind === 'notice') s.flags.press_notice = true;
    return rec;
  }
  // a reader's waiting reaction (or null)
  function waiting(s, readerId) {
    const rec = of(s), r = C().readers.find((x) => x.id === readerId);
    if (!rec || !r || !rec.rx || rec.rx[readerId] == null || !s.flags['press_rx_' + readerId]) return null;
    const rule = r.rules[rec.rx[readerId]];
    return rule ? { reader: r, rule, version: rec.version } : null;
  }
  // heard: the reaction is taken off the reader, once per version
  function hear(s, readerId) {
    const w = waiting(s, readerId);
    if (!w) return null;
    delete s.flags['press_rx_' + readerId];
    of(s).heard[readerId] = w.version;
    return w;
  }
  // every reaction still waiting, for the press's own page ("who is reading it")
  function waitingAll(s) {
    const rec = of(s);
    return rec ? Object.keys(rec.rx || {}).filter((id) => s.flags['press_rx_' + id]).map((id) => C().readers.find((r) => r.id === id)).filter(Boolean) : [];
  }
  // checks for the content (the validator and tests): every slot offers a block from the start, every rule's tags
  // exist on some block (or are a kind or a place), every reader has a fallback or is reachable by some tag
  function check() {
    const errs = [], P = C(), known = new Set();
    for (const slot in P.blocks) for (const b of P.blocks[slot]) for (const t of b.tags || []) known.add(t);
    for (const k in P.kinds) { known.add('kind:' + k); for (const slot of P.kinds[k].slots) if (!(P.blocks[slot] || []).some((b) => !b.unlock)) errs.push('press: slot ' + slot + ' offers nothing at the start'); }
    for (const w of ['board', 'inn', 'stall']) known.add('where:' + w);
    for (const r of P.readers) {
      if (!(r.rules || []).length) errs.push('press: reader ' + r.id + ' has no rules');
      for (const ru of r.rules || []) for (const t of [].concat(ru.when || [])) { const tt = t[0] === '!' ? t.slice(1) : t; if (!known.has(tt)) errs.push('press: reader ' + r.id + ' waits for an unknown tag ' + tt); }
    }
    return errs;
  }
  return { kind, block, offered, complete, tagsOf, lines, holds, reactions, of, circulate, waiting, hear, waitingAll, check, MAX_RX, MIN_RX };
})();

// a reader's reaction, heard in the world: `!hook press_react <reader>` (src/content/mp/ scenes add it to the readers'
// talk, waiting on press_rx_<reader>)
RB.hooks = RB.hooks || {};
RB.hooks.press_react = async (a) => {
  const s = RB.game && RB.game.s;
  const w = s && RB.press.hear(s, a && a[0]);
  if (!w) return;
  const who = w.reader.who || w.reader.id;
  await RB.ui.dialogue.say({ who, jp: w.rule.jp, en: w.rule.en, sceneId: 'mp.press_react' });
};
