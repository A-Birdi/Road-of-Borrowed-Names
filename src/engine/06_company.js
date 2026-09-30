/* The shared core of the Living Company and Discovery addendum
 * (docs/ADDENDUM_CONTRACTS.md): the few calls every new system uses, so that
 * awards happen once, memories are kept truthfully, and a companion's
 * reaction to what actually happened is chosen from authored lines and then
 * stays the same across reloads.
 *
 *   RB.company.award(s, id, pts)      a unique bond event (at most once)
 *   RB.company.score(s) / stage(s)    derived bond (capped at 12) and its words
 *   RB.company.memory(s, m)           a shared memory (at most once per id)
 *   RB.company.addReactions(list)     authored reactions (data)
 *   RB.company.react(s, ev)           choose (once) and return a reaction
 *   RB.discovery.keepsake(s, id, how) record a keepsake discovery (at most once)
 *
 * Nothing here changes play: bond never alters battle, rewards or answers. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content.keepsakes = RB.content.keepsakes || {}; // id -> { name:{jp,en}, desc, region, art, source }

RB.company = (function () {
  'use strict';
  const CAP = 12;
  // the displayed bond, never the number (addendum §8.1)
  const STAGES = [
    [0, 'walking', { en: 'Walking Together', jp: '{並|なら}んで {歩|ある}く' }],
    [3, 'rhythm', { en: 'Finding a Rhythm', jp: '{歩調|ほちょう} が {合|あ}う' }],
    [6, 'trusted', { en: 'Trusted Company', jp: '{信頼|しんらい} できる {道連|みちづ}れ' }],
    [10, 'lasting', { en: 'A Lasting Bond', jp: '{続|つづ}く {絆|きずな}' }],
  ];
  const C = (s) => s.company || (s.company = RB.state.newCampaign().company);

  // A unique bond event: recorded once (its id is the event), never removed.
  // Returns true only the first time. Callers decide eligibility (who, when).
  function award(s, id, pts) {
    if (!s.comp) return false; // the committed companion owns the relationship
    const c = C(s);
    if (c.bond[id] != null) return false;
    if (!RB.state.once(s, 'bond:' + s.comp + ':' + id)) return false;
    c.bond[id] = pts == null ? 1 : pts;
    RB.bus.emit('company:bond', { id, pts: c.bond[id] });
    return true;
  }
  function score(s) {
    const b = (s.company && s.company.bond) || {};
    let n = 0;
    for (const k in b) n += +b[k] || 0;
    return Math.max(0, Math.min(CAP, n));
  }
  function stage(s) {
    const n = score(s);
    let cur = STAGES[0];
    for (const st of STAGES) if (n >= st[0]) cur = st;
    return { id: cur[1], label: cur[2] };
  }

  // A shared memory: { id, kind: 'together'|'pets'|'discoveries'|'reflections',
  // title:{jp,en}, text:{jp,en}, reply?:{jp,en}, map?, ref? }. Kept once per id,
  // with an event-time snapshot of the place and of any pet's name then.
  function memory(s, m) {
    const c = C(s);
    if (!m || !m.id || c.memories.some((x) => x.id === m.id)) return false;
    const pet = c.pet && c.pets[c.pet] ? { species: c.pet, name: c.pets[c.pet].name } : null;
    c.memories.push(Object.assign({ t: Date.now(), map: s.map, comp: s.comp || null, pet }, m));
    RB.bus.emit('company:memory', { id: m.id, kind: m.kind });
    return true;
  }

  // Authored reactions (addendum §7.5): { id, comp, event, when?, tone?,
  // priority?, lines: [{ jp, en, who? }] }. `event` names what happened (e.g.
  // 'puzzle:f1'); `when` is a condition on the state (RB.state.test) and may
  // also test facts of the event through `facts` (an object of equalities).
  const REACT = [];
  function addReactions(list) { for (const r of list) REACT.push(r); }
  // Choose a reaction for event ev = { id (unique resolution), event, facts }
  // for the committed (or provisional) companion. The choice is stored under
  // ev.id, so a reload or replay shows the same one. Returns the entry or null.
  function react(s, ev) {
    const comp = s.comp || s.provisional;
    if (!comp || !ev || !ev.id) return null;
    const c = C(s);
    const kept = c.react[ev.id];
    if (kept) return REACT.find((r) => r.id === kept) || null;
    const facts = ev.facts || {};
    const ok = REACT.filter((r) => r.comp === comp && r.event === ev.event && (!r.when || RB.state.test(s, r.when)) &&
      (!r.facts || Object.keys(r.facts).every((k) => facts[k] === r.facts[k])));
    if (!ok.length) return null;
    const top = Math.max(...ok.map((r) => r.priority || 0));
    const best = ok.filter((r) => (r.priority || 0) === top);
    const pick = best[RB.util.hashStr(ev.id) % best.length]; // deterministic, not the game's random stream
    c.react[ev.id] = pick.id;
    return pick;
  }
  return { award, score, stage, memory, addReactions, react, reactions: REACT, STAGES, CAP };
})();

RB.discovery = (function () {
  'use strict';
  // Record that a keepsake was discovered or entrusted (historical, not the
  // current inventory). At most once; the first time returns true.
  function keepsake(s, id, how) {
    const d = s.discovery || (s.discovery = RB.state.newCampaign().discovery);
    if (d.keepsakes[id]) return false;
    if (!RB.state.once(s, 'keepsake:' + id)) return false;
    d.keepsakes[id] = { t: Date.now(), map: s.map, how: how || null };
    RB.bus.emit('keepsake:found', { id });
    return true;
  }
  return { keepsake };
})();

// conditions: keepsake.id, bond>=trusted (by stage id), memory.id
RB.state.addTerm('keepsake', (s, rest) => !!(s.discovery && s.discovery.keepsakes[rest]));
RB.state.addTerm('memory', (s, rest) => !!(s.company && s.company.memories.some((m) => m.id === rest)));
RB.state.addTerm('bond', (s, rest, op, val, num, cmp) => {
  const order = RB.company.STAGES.map((x) => x[1]);
  const cur = order.indexOf(RB.company.stage(s).id);
  const want = order.indexOf(val);
  return want < 0 ? cmp(RB.company.score(s), op || '>=', num(val)) : cmp(cur, op || '>=', want);
});
