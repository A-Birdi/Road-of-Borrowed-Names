/* Companion shiritori: the rules core (Practice addendum §10–§12). The
 * Roadside House Rules, word-bank building, the public game state and the
 * Casual policy live here; the banks (src/content/shiritori/), the searching
 * opponents (72_shiritori_ai.js) and the table UI are built on this contract
 * (docs/PRACTICE_CONTRACTS.md, docs/practice/shiritori_engine.md).
 *
 *   RB.shiritori.RULES                 'roadside-1'
 *   RB.shiritori.norm(text)            NFKC, trimmed, katakana → hiragana (matching copy)
 *   RB.shiritori.inspect(text)         { key, script, why } why: empty|markup|unsupported-script|internal-punctuation|null
 *   RB.shiritori.boundary(reading)     { head, tail, terminal } under the house rules
 *   RB.shiritori.validateEntry(e, o)   problems with one bank entry ([] when fine); o.strict: the full §11.2 contract
 *   RB.shiritori.buildBank(def)        { id, version, hash, manifest, entries, groups, edges, byHead, … }
 *   RB.shiritori.addBank(def) / bank(id) / banks()
 *   RB.shiritori.defineWords(list) / word(id) / words() / texts()   the shipped word registry
 *   RB.shiritori.snapshot(bank) / thaw(snapshot)   frozen data a suspended game needs (§21.5)
 *   RB.shiritori.resolve(bank, text)   what a typed/written/selected input could be (+ why nothing)
 *   RB.shiritori.newGame(bank, o)      a game from a neutral starter; pickStarter(bank, rng, recent)
 *   RB.shiritori.check / play / concede / safeReplies / safeGroups / legalEdges / moves / status
 *   RB.shiritori.casualMove(state, bank, rng)   uniform among safe groups, or null (concede)
 *
 * Entries: { id, lemmaId?, repeatGroup?, reading | readings[], forms[], display:{jp,en},
 *   nounKind: 'common'|'established-compound', themes?, lexicalLevel, head?, tail?, provenance[] }.
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
  const LEVELS = ['pocket', 'everyday', 'extended'];
  const NOUN_KINDS = ['common', 'established-compound'];

  function toHira(str) {
    let o = '';
    for (const ch of str) {
      const c = ch.codePointAt(0);
      o += c >= 0x30a1 && c <= 0x30f6 ? String.fromCodePoint(c - 0x60) : ch;
    }
    return o;
  }
  // A matching copy only: the original string is kept for display. The
  // spacing (voiced) sound marks ゛゜ (U+309B/U+309C) become the combining
  // marks first, so NFKC composes か゛ into が just as it does a decomposed or
  // half-width spelling (ｶﾞ). Nothing inside the word is removed.
  function norm(text) {
    if (text == null) return '';
    let t = String(text).replace(/゛/g, '゙').replace(/゜/g, '゚');
    try { t = t.normalize('NFKC'); } catch (e) { /* very old engines: compare as typed */ }
    return toHira(t.trim());
  }
  const isKana = (ch) => /^[ぁ-ゖー]$/.test(ch);
  const isKanjiCh = (ch) => /^[㐀-䶿一-鿿豈-﫿々]$/u.test(ch);

  // What kind of input this is, before looking anything up (§10.3, §23.4):
  // markup and unsupported scripts are never words; internal spaces and
  // punctuation are not removed to manufacture one.
  function inspect(text) {
    const raw = text == null ? '' : String(text);
    const key = norm(raw);
    let why = null, script = '';
    if (!key) why = 'empty';
    else if (/[<>&"'`]/.test(raw) || /[<>&"'`]/.test(key)) why = 'markup';
    else {
      const kinds = new Set();
      let punct = false, other = false;
      for (const ch of key) {
        if (isKana(ch)) kinds.add('kana');
        else if (isKanjiCh(ch)) kinds.add('kanji');
        else if (/[\s　・、。，．,.\-‐－―〜～!?！？()（）「」『』\[\]【】:;：；/／]/.test(ch)) punct = true;
        else other = true;
      }
      script = kinds.size === 2 ? 'mixed' : kinds.size ? Array.from(kinds)[0] : '';
      if (other) why = 'unsupported-script';
      else if (punct) why = kinds.size ? 'internal-punctuation' : 'unsupported-script';
    }
    return { input: raw, key, script, why };
  }
  // Plain English reasons for an invalid draft or an unmatched input (the turn is kept).
  const WHY = {
    'empty': 'Nothing to play yet.',
    'markup': 'That is not a word in this match.',
    'unsupported-script': 'Write the word in kana or kanji; letters and other symbols are not read as words here.',
    'internal-punctuation': 'Spaces and punctuation inside a word are not removed; try the word without them.',
    'outside-bank': "That word is outside this match's word bank.",
    'not-in-bank': "That word is outside this match's word bank.",
    'needs-reading': 'Choose which reading you mean.',
    'wrong-head': 'That word does not start with the required kana.',
    'repeat': 'That word (or one read the same way) has already been played in this match.',
    'over': 'This game has finished.',
    'not-your-turn': 'It is not your turn.',
  };
  const safeText = (s) => (RB.util && RB.util.esc ? RB.util.esc(String(s == null ? '' : s).slice(0, 60)) : '');

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
  // o.strict: every field of the §11.2 data contract, and authored boundaries
  // (head/tail, or per reading in boundaries[]) must equal the computed ones.
  function validateEntry(e, o) {
    o = o || {};
    const p = [];
    if (!e || !e.id) return ['entry without id'];
    const rs = readingsOf(e);
    if (!rs.length) p.push(e.id + ': no reading');
    rs.forEach((r, i) => {
      if (r !== norm(r)) p.push(e.id + ': reading not in canonical hiragana: ' + r);
      if (!Array.from(r).every(isKana)) p.push(e.id + ': reading has non-kana: ' + r);
      if (/ーー/.test(r) || r[0] === 'ー') p.push(e.id + ': unsupported long-vowel structure: ' + r);
      const b = boundary(r);
      if (!b || !b.tail) p.push(e.id + ': no tail for ' + r);
      else if (SMALL[b.head] || b.head === 'ー' || b.head === 'ん') p.push(e.id + ': cannot start with ' + b.head);
      const auth = e.boundaries ? e.boundaries[i] : i === 0 && (e.head || e.tail) ? { head: e.head, tail: e.tail } : null;
      if (b && auth && (auth.head !== b.head || auth.tail !== b.tail)) p.push(e.id + ': authored boundary ' + auth.head + '…' + auth.tail + ' differs from the house rule ' + b.head + '…' + b.tail + ' for ' + r);
      if (b && o.strict && !auth) p.push(e.id + ': no authored head/tail for ' + r);
    });
    if (!Array.isArray(e.forms) || !e.forms.length) p.push(e.id + ': no forms');
    else for (const f of e.forms) {
      const k = inspect(f);
      if (k.why && k.why !== 'internal-punctuation') p.push(e.id + ': form ' + JSON.stringify(f) + ' is not playable (' + k.why + ')');
    }
    if (!e.display || !e.display.jp || !e.display.en) p.push(e.id + ': no display');
    if (e.nounKind && NOUN_KINDS.indexOf(e.nounKind) < 0) p.push(e.id + ': nounKind ' + e.nounKind);
    if (o.strict) {
      if (!e.lemmaId) p.push(e.id + ': no lemmaId');
      if (!e.repeatGroup) p.push(e.id + ': no repeatGroup');
      if (!e.nounKind) p.push(e.id + ': no nounKind');
      if (LEVELS.indexOf(e.lexicalLevel) < 0) p.push(e.id + ': lexicalLevel ' + e.lexicalLevel);
      if (!Array.isArray(e.themes) || !e.themes.length) p.push(e.id + ': no themes');
      if (!Array.isArray(e.provenance) || !e.provenance.length || !e.provenance.every((x) => x && x.source && typeof x.reviewed === 'boolean')) p.push(e.id + ': provenance');
      if (e.display && /[<>&]/.test(e.display.en || '')) p.push(e.id + ': markup in the English meaning');
    }
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
    const seenId = {};
    for (const e of entries) {
      if (seenId[e.id]) problems.push(e.id + ': duplicate id');
      seenId[e.id] = true;
      problems.push(...validateEntry(e, def.strict ? { strict: true } : {}));
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
    const groups = {}, edges = [], byHead = {}, forms = {}, entryById = {}, groupOf = {};
    for (const e of entries) {
      const gid = find(e._g0);
      delete e._g0;
      entryById[e.id] = e;
      groupOf[e.id] = gid;
      const G = (groups[gid] = groups[gid] || { id: gid, entries: [], readings: [], heads: [], tails: [], terminal: true, themes: [] });
      G.entries.push(e.id);
      for (const t of e.themes || []) if (G.themes.indexOf(t) < 0) G.themes.push(t);
      readingsOf(e).forEach((r, i) => {
        const rr = norm(r), b = boundary(rr);
        if (!b || !b.tail) return;
        const edge = { id: e.id + '#' + i, entry: e.id, reading: rr, head: b.head, tail: b.tail, terminal: b.terminal, group: gid };
        edges.push(edge);
        (byHead[b.head] = byHead[b.head] || []).push(edge);
        if (G.readings.indexOf(rr) < 0) G.readings.push(rr);
        if (G.heads.indexOf(b.head) < 0) G.heads.push(b.head);
        if (!b.terminal) { G.terminal = false; if (G.tails.indexOf(b.tail) < 0) G.tails.push(b.tail); }
      });
      for (const f of e.forms.concat(readingsOf(e))) { const k = norm(f); (forms[k] = forms[k] || new Set()).add(e.id); }
    }
    const starters = (def.starters || []).slice();
    for (const s of starters) if (!edges.some((x) => x.entry === s || x.id === s)) problems.push('starter ' + s + ' is not in bank ' + def.id);
    const canon = JSON.stringify(entries.map((e) => [e.id, readingsOf(e), e.forms, e.repeatGroup || '']));
    const hash = RB.util.hashStr(canon).toString(36);
    const groupIds = Object.keys(groups).sort();
    const manifest = { id: def.id, version: def.version || 1, rules: RULES, hash, groupCount: groupIds.length, entryCount: entries.length, groups: groupIds, entries: entries.map((e) => e.id) };
    return {
      id: def.id, version: def.version || 1, rules: RULES, hash, manifest, title: def.title || null,
      entries, entryById, groupOf, groups, groupCount: groupIds.length, edges, byHead, forms, byReading, problems,
      starters, meta: def.meta || {},
    };
  }
  const BANKS = {};
  function addBank(def) { const b = buildBank(def); BANKS[b.id] = b; return b; }
  const bank = (id) => BANKS[id] || null;
  const banks = () => Object.keys(BANKS);

  // ---- the shipped word registry (src/content/shiritori/) -------------------------------------
  // Words are defined once; a fixed bank lists the entry ids it uses. texts()
  // exposes every display text to tools/validate.mjs (furigana on every kanji).
  const WORDS = {};
  function defineWords(list) {
    for (const e of list || []) WORDS[e.id] = e;
    return Object.keys(WORDS).length;
  }
  const word = (id) => WORDS[id] || null;
  const words = () => Object.keys(WORDS).sort().map((id) => WORDS[id]);
  const texts = () => words().map((e) => ({ id: e.id, display: e.display }));

  // ---- frozen snapshots (§21.5) ----------------------------------------------------------------
  // Everything a suspended game needs to finish under its original bank, as
  // plain data: readings, forms, groups, display texts and starters. thaw()
  // rebuilds the bank and refuses a snapshot whose content hash has changed.
  function snapshot(b) {
    return {
      v: 1, id: b.id, version: b.version, rules: b.rules, hash: b.hash, starters: b.starters.slice(),
      entries: b.entries.map((e) => {
        const o = { id: e.id, r: readingsOf(e), f: e.forms.slice(), jp: e.display.jp, en: e.display.en };
        if (e.repeatGroup) o.g = e.repeatGroup;
        if (e.themes && e.themes.length) o.t = e.themes.slice();
        return o;
      }),
    };
  }
  function thaw(snap) {
    if (!snap || snap.v !== 1 || !Array.isArray(snap.entries)) return { ok: false, why: 'unreadable' };
    if (snap.rules !== RULES) return { ok: false, why: 'rules-changed' };
    const entries = snap.entries.map((x) => ({ id: x.id, readings: x.r, forms: x.f, repeatGroup: x.g, themes: x.t || [], display: { jp: x.jp, en: x.en }, nounKind: 'common' }));
    let b;
    try { b = buildBank({ id: snap.id, version: snap.version, entries, starters: snap.starters }); } catch (e) { return { ok: false, why: 'unreadable' }; }
    if (b.hash !== snap.hash) return { ok: false, why: 'hash-mismatch' };
    return { ok: true, bank: b };
  }

  // What an input could be (§10.2): every entry whose approved form or reading
  // matches, with the reading edges it allows. A kanji form with several approved
  // readings needs the player's choice; nothing is chosen to make a move legal.
  function resolve(b, text) {
    const ins = inspect(text);
    const k = ins.key;
    if (!k) return { input: text, key: k, matches: [], why: 'empty', display: safeText(text) };
    // an explicitly approved spelling may carry internal formatting; nothing else is stripped
    const lookup = ins.why === null || ins.why === 'internal-punctuation';
    const ids = lookup && b.forms[k] ? Array.from(b.forms[k]).sort() : [];
    const matches = ids.map((id) => {
      const e = b.entryById[id];
      const typedReading = b.byReading[k] && b.byReading[k].indexOf(id) >= 0;
      const edges = b.edges.filter((x) => x.entry === id && (!typedReading || x.reading === k));
      return { entry: e, edges, needsReading: !typedReading && new Set(edges.map((x) => x.reading)).size > 1 };
    });
    return { input: text, key: k, matches, why: matches.length ? null : ins.why || 'outside-bank', display: safeText(text) };
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
  // A certified starter, avoiding the recent ones until all have been used (§13.4 rematch).
  function pickStarter(b, rng, recent) {
    const list = b.starters.length ? b.starters : [];
    if (!list.length) return null;
    const rec = recent || [];
    const fresh = list.filter((s) => rec.indexOf(s) < 0);
    const pool = fresh.length ? fresh : list.filter((s) => s !== rec[rec.length - 1]);
    const use = pool.length ? pool : list;
    return use[Math.floor((rng ? rng() : 0) * use.length)];
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
    delete state.cpuChoice; // a stored computer decision belongs to the turn it was made for
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
  // The public situation for the table: required kana, who moves, how many
  // unused safe replies and ん-only words remain for that kana.
  function status(state, b) {
    const legal = state.over ? [] : legalEdges(state, b);
    const safe = legal.filter((x) => !x.terminal);
    return {
      required: state.required, next: state.next, over: state.over,
      safeReplies: safe.length, safeGroups: new Set(safe.map((x) => x.group)).size,
      terminalOnly: !safe.length && legal.length > 0, chain: moves(state), usedGroups: Object.keys(state.used).length,
    };
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

  return {
    RULES, SMALL, VOW, LEVELS, WHY, toHira, norm, inspect, safeText, boundary, validateEntry, readingsOf, buildBank, addBank, bank, banks,
    defineWords, word, words, texts, snapshot, thaw, resolve, newGame, pickStarter, legalEdges, safeReplies, safeGroups, check, play, concede,
    moves, status, casualMove, other,
  };
})();
