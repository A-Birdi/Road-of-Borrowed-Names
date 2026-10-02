/* Companion shiritori: the rules core (Practice addendum §10–§12). The
 * Roadside House Rules, word-bank building, the public game state and the
 * Casual policy live here; the full banks, the searching opponents and the
 * table UI are built on this contract (docs/PRACTICE_CONTRACTS.md).
 *
 *   RB.shiritori.RULES                 'roadside-1'
 *   RB.shiritori.norm(text)            NFKC, trimmed, katakana → hiragana (matching copy)
 *   RB.shiritori.boundary(reading)     { head, tail, terminal } under the house rules
 *   RB.shiritori.validateEntry(e)      problems with one bank entry ([] when fine)
 *   RB.shiritori.buildBank(def)        { id, version, hash, entries, groups, edges, byHead, … }
 *   RB.shiritori.addBank(def) / bank(id) / banks()
 *   RB.shiritori.resolve(bank, text)   what a typed/written/selected input could be
 *   RB.shiritori.newGame(bank, o)      a game from a neutral starter
 *   RB.shiritori.check / play / concede / safeReplies / safeGroups / legalEdges
 *   RB.shiritori.casualMove(state, bank, rng)   uniform among safe groups, or null (concede)
 *
 * Entries: { id, lemmaId?, repeatGroup?, reading | readings[], forms[], display:{jp,en},
 *   nounKind: 'common'|'established-compound', themes?, lexicalLevel, provenance[] }.
 * Both sides use exactly the same frozen bank; nothing here consults a
 * dictionary, the player's learning record or the network. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.shiritori = (function () {
  'use strict';
  const RULES = 'roadside-1';
  const SMALL = { 'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ', 'ゕ': 'か', 'ゖ': 'け' };
  // the vowel each kana ends in (for a final ー)
  const VOW = {};
  [['あ', 'あかがさざただなはばぱまやらわぁゃゎ'], ['い', 'いきぎしじちぢにひびぴみりぃゐ'], ['う', 'うくぐすずつづぬふぶぷむゆるぅゅっゔ'], ['え', 'えけげせぜてでねへべぺめれぇゑ'], ['お', 'おこごそぞとどのほぼぽもよろをぉょ']]
    .forEach(([v, ks]) => { for (const k of ks) VOW[k] = v; });

  function toHira(str) {
    let o = '';
    for (const ch of str) {
      const c = ch.codePointAt(0);
      o += c >= 0x30a1 && c <= 0x30f6 ? String.fromCodePoint(c - 0x60) : ch;
    }
    return o;
  }
  // a matching copy only: the original string is kept for display
  function norm(text) {
    if (text == null) return '';
    let t = String(text);
    try { t = t.normalize('NFKC'); } catch (e) { /* very old engines: compare as typed */ }
    return toHira(t.trim());
  }
  const isKana = (ch) => /^[ぁ-ゖー]$/.test(ch);

  // head and tail under the Roadside House Rules (§10.3)
  function boundary(reading) {
    const r = Array.from(norm(reading));
    if (!r.length) return null;
    const head = r[0];
    let i = r.length - 1;
    let tail = r[i];
    if (tail === 'ー') {
      let j = i - 1;
      while (j >= 0 && r[j] === 'ー') j--;
      tail = j >= 0 ? VOW[r[j]] || null : null; // the vowel of the preceding mora
    } else if (SMALL[tail]) tail = SMALL[tail]; // final small kana: its full-size form, for the boundary only
    return { head, tail, terminal: tail === 'ん' };
  }

  function readingsOf(e) { return (e.readings && e.readings.length ? e.readings : [e.reading]).filter(Boolean); }
  function validateEntry(e) {
    const p = [];
    if (!e || !e.id) return ['entry without id'];
    const rs = readingsOf(e);
    if (!rs.length) p.push(e.id + ': no reading');
    for (const r of rs) {
      if (r !== norm(r)) p.push(e.id + ': reading not in canonical hiragana: ' + r);
      if (!Array.from(r).every(isKana)) p.push(e.id + ': reading has non-kana: ' + r);
      const b = boundary(r);
      if (!b || !b.tail) p.push(e.id + ': no tail for ' + r);
      else if (SMALL[b.head] || b.head === 'ー' || b.head === 'ん') p.push(e.id + ': cannot start with ' + b.head);
    }
    if (!Array.isArray(e.forms) || !e.forms.length) p.push(e.id + ': no forms');
    if (!e.display || !e.display.jp || !e.display.en) p.push(e.id + ': no display');
    if (e.nounKind && e.nounKind !== 'common' && e.nounKind !== 'established-compound') p.push(e.id + ': nounKind ' + e.nounKind);
    return p;
  }

  // ---- banks ----------------------------------------------------------------------------------
  // Repeat-groups: an entry's own group, joined with every entry sharing a
  // canonical reading (homophones never give two uses) — union-find.
  function buildBank(def) {
    const entries = def.entries.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const parent = {};
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) { if (a < b) parent[b] = a; else parent[a] = b; } };
    const byReading = {};
    const problems = [];
    for (const e of entries) {
      problems.push(...validateEntry(e));
      const g0 = 'g:' + (e.repeatGroup || e.lemmaId || e.id);
      if (!(g0 in parent)) parent[g0] = g0;
      e._g0 = g0;
      for (const r of readingsOf(e)) {
        const key = 'r:' + norm(r);
        if (!(key in parent)) parent[key] = key;
        union(g0, key);
        (byReading[norm(r)] = byReading[norm(r)] || []).push(e.id);
      }
    }
    const groups = {}, edges = [], byHead = {}, forms = {}, entryById = {};
    for (const e of entries) {
      const gid = find(e._g0);
      delete e._g0;
      entryById[e.id] = e;
      (groups[gid] = groups[gid] || { id: gid, entries: [] }).entries.push(e.id);
      readingsOf(e).forEach((r, i) => {
        const rr = norm(r), b = boundary(rr);
        if (!b || !b.tail) return;
        const edge = { id: e.id + '#' + i, entry: e.id, reading: rr, head: b.head, tail: b.tail, terminal: b.terminal, group: gid };
        edges.push(edge);
        (byHead[b.head] = byHead[b.head] || []).push(edge);
      });
      for (const f of e.forms.concat(readingsOf(e))) { const k = norm(f); (forms[k] = forms[k] || new Set()).add(e.id); }
    }
    const canon = JSON.stringify(entries.map((e) => [e.id, readingsOf(e), e.forms, e.repeatGroup || '']));
    return {
      id: def.id, version: def.version || 1, rules: RULES, hash: RB.util.hashStr(canon).toString(36),
      entries, entryById, groups, groupCount: Object.keys(groups).length, edges, byHead, forms, byReading, problems,
      starters: (def.starters || []).slice(), meta: def.meta || {},
    };
  }
  const BANKS = {};
  function addBank(def) { const b = buildBank(def); BANKS[b.id] = b; return b; }
  const bank = (id) => BANKS[id] || null;
  const banks = () => Object.keys(BANKS);

  // What an input could be (§10.2): every entry whose approved form or reading
  // matches, with the reading edges it allows. A kanji form with several approved
  // readings needs the player's choice; nothing is chosen to make a move legal.
  function resolve(b, text) {
    const k = norm(text);
    if (!k) return { input: text, key: k, matches: [] };
    const ids = b.forms[k] ? Array.from(b.forms[k]) : [];
    const matches = ids.map((id) => {
      const e = b.entryById[id];
      const typedReading = b.byReading[k] && b.byReading[k].indexOf(id) >= 0;
      const edges = b.edges.filter((x) => x.entry === id && (!typedReading || x.reading === k));
      return { entry: e, edges, needsReading: !typedReading && new Set(edges.map((x) => x.reading)).size > 1 };
    });
    return { input: text, key: k, matches };
  }

  // ---- the game (public state only) ------------------------------------------------------------
  const other = (a) => (a === 'pc' ? 'cpu' : 'pc');
  function newGame(b, o) {
    o = o || {};
    const st = b.edges.find((x) => x.entry === o.starter || x.id === o.starter) || b.edges[0];
    const state = {
      rules: RULES, bank: b.id, bankVersion: b.version, bankHash: b.hash,
      used: {}, required: st.tail, next: o.first || 'pc', over: null,
      history: [{ actor: 'start', edge: st.id, entry: st.entry, reading: st.reading, group: st.group, tail: st.tail }],
    };
    state.used[st.group] = true;
    if (!safeReplies(state, b).length) state.over = { winner: other(state.next), reason: 'no-safe-reply' };
    return state;
  }
  const legalEdges = (state, b, head) => (b.byHead[head || state.required] || []).filter((x) => !state.used[x.group]);
  const safeReplies = (state, b, head) => legalEdges(state, b, head).filter((x) => !x.terminal);
  const safeGroups = (state, b, head) => Array.from(new Set(safeReplies(state, b, head).map((x) => x.group)));
  // an invalid draft is not a move: it is explained and the turn is kept (§10.4)
  function check(state, b, edge, actor) {
    if (state.over) return { ok: false, why: 'over' };
    if (actor && actor !== state.next) return { ok: false, why: 'not-your-turn' };
    if (!edge || !b.edges.some((x) => x.id === edge.id)) return { ok: false, why: 'not-in-bank' };
    if (edge.head !== state.required) return { ok: false, why: 'wrong-head' };
    if (state.used[edge.group]) return { ok: false, why: 'repeat' };
    return { ok: true, terminal: edge.terminal };
  }
  function play(state, b, edge, actor, extra) {
    const c = check(state, b, edge, actor || state.next);
    if (!c.ok) return c;
    const who = actor || state.next;
    state.used[edge.group] = true;
    state.history.push(Object.assign({ actor: who, edge: edge.id, entry: edge.entry, reading: edge.reading, group: edge.group, tail: edge.tail }, extra || {}));
    if (edge.terminal) { state.over = { winner: other(who), reason: 'terminal-n' }; return { ok: true, over: state.over }; }
    state.required = edge.tail;
    state.next = other(who);
    if (!safeReplies(state, b).length) state.over = { winner: who, reason: 'no-safe-reply' };
    return { ok: true, over: state.over };
  }
  function concede(state, actor) {
    if (state.over) return state.over;
    state.over = { winner: other(actor), reason: actor === 'pc' ? 'human-concession' : 'cpu-concession' };
    return state.over;
  }
  // committed non-ん word moves by the two players (the starter excluded; §10.1)
  function moves(state, actor) {
    return state.history.filter((h) => h.actor !== 'start' && (!actor || h.actor === actor) && h.tail !== 'ん').length;
  }

  // Casual (§12.2): uniform seeded choice among safe groups, then among that
  // group's safe readings; no planning, no illegal moves, no hidden mercy.
  function casualMove(state, b, rng) {
    const groups = safeGroups(state, b);
    if (!groups.length) return null; // only ん words (or nothing) left: the computer concedes
    const g = groups[Math.floor(rng() * groups.length)];
    const opts = safeReplies(state, b).filter((x) => x.group === g);
    return opts[Math.floor(rng() * opts.length)];
  }

  return { RULES, SMALL, VOW, toHira, norm, boundary, validateEntry, readingsOf, buildBank, addBank, bank, banks, resolve, newGame, legalEdges, safeReplies, safeGroups, check, play, concede, moves, casualMove, other };
})();
