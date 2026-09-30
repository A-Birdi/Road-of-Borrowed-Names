/* Cases: permanent evidence records for the deduction cases of the Living
 * Company and Discovery addendum (§15, §16; docs/addendum/cases.md).
 *
 * Content (src/content/cases/) defines
 *   RB.content.cases[id] = { id, quest, region, keepsake, title, question,
 *     clues: [clue ids], groups: { name: [clue ids] } (equivalent evidence),
 *     hypotheses: [{ id, label, from: [clue ids] (when it can be chosen),
 *       place: { map, x, y } | { map, npc } (where it points), placeBy: [clue ids],
 *       correct?: true }],
 *     sufficient: [[clue id | group name, …], …] (evidence that establishes it),
 *     hints: [{ level, kind: 'nudge'|'compare'|'step'|'solution', spoiler, jp, en,
 *       discloses?: hypothesis id (navigation it may show) }],
 *     method?(s, rec) (how it was resolved: a stable id for reactions),
 *     acknowledge?(s, rec) (lines naming only what was actually observed),
 *     talk? (a scene for Company's "Discuss a discovered case") }
 *   RB.content.clues[id] = { case, title, kind: 'document'|'object'|'speaker'|'place',
 *     source: { en, jp?, who?, map }, jp, en, lang: [{ w, en }], sure: true|false,
 *     obs: { en } (what was observed, in plain words), diagram?: id, alt?: { en },
 *     fromSeen?: scene id (an older save that saw this scene has observed it) }
 *
 * State (campaign-local, docs/ADDENDUM_CONTRACTS.md §1):
 *   s.discovery.cases[id] = { stage: 'open'|'done', t, hypothesis, support: [],
 *     note, tried: { hid: t }, done, method, evidence: [], sheet? }
 *   s.discovery.clues[cid] = { t, map, case (null until the case is known), bm? }
 *   s.discovery.hints['case:' + id] = reasoning-help level asked for (0…n)
 *   s.discovery.hints['clue:' + cid] = 1 once language help was opened
 * Observed and Concluded stay apart: clues are what was seen or heard (with
 * who said it and whether they were sure); the hypothesis is the player's own
 * choice from a bounded authored set; only the world (a delivery, a match)
 * confirms it. Nothing is auto-connected and nothing is graded from free text.
 *
 * Conditions: case.<id> (known), case.<id>=open|done, case.<id>.hyp=<hid>,
 * case.<id>.tried=<hid>, case.<id>.hint>=N, clue.<cid> (observed).
 * Scene hooks (!hook …): case_clue, case_open, case_page, case_rule,
 * case_resolve, case_react, case_ack, case_bookmark.
 * Company (worker C1): RB.cases.discussable(s), RB.cases.topics(s). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content.cases = RB.content.cases || {};
RB.content.clues = RB.content.clues || {};

RB.cases = (function () {
  'use strict';
  const NOTE_MAX = 200;   // grapheme clusters in a personal note
  const COMPARE_MAX = 3;  // observations side by side
  const SUPPORT_MAX = 4;  // supporting observations marked for a hypothesis

  function D(s) {
    if (!s.discovery || typeof s.discovery !== 'object') s.discovery = RB.state.newCampaign().discovery;
    const d = s.discovery;
    for (const k of ['cases', 'clues', 'hints', 'known', 'pins']) if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = {};
    return d;
  }
  const def = (id) => RB.content.cases[id] || null;
  const clueDef = (id) => RB.content.clues[id] || null;
  const now = () => Date.now();

  // ---- plain text (notes) ----------------------------------------------------------------
  let seg = null;
  function graphemes(str) {
    str = String(str == null ? '' : str);
    try {
      if (!seg && typeof Intl !== 'undefined' && Intl.Segmenter) seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      if (seg) return Array.from(seg.segment(str), (x) => x.segment);
    } catch (e) { /* older engines: code points */ }
    return Array.from(str);
  }
  // Player-authored text is plain text: control characters removed (a line
  // break becomes a space), trimmed, at most `max` grapheme clusters. Never
  // markup: every renderer escapes it.
  function clean(text, max) {
    const flat = String(text == null ? '' : text).replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    const g = graphemes(flat);
    const m = max == null ? NOTE_MAX : max;
    return { text: g.slice(0, m).join(''), length: Math.min(g.length, m), cut: g.length > m };
  }

  // ---- records -------------------------------------------------------------------------------
  const rec = (s, id) => D(s).cases[id] || null;
  const known = (s, id) => !!rec(s, id);
  const solved = (s, id) => !!(rec(s, id) && rec(s, id).stage === 'done');
  const observed = (s, cid) => !!D(s).clues[cid];
  function fresh() { return { stage: 'open', t: now(), hypothesis: null, support: [], note: '', tried: {}, done: null, method: null, evidence: [] }; }
  function norm(r) {
    if (!r.support || !Array.isArray(r.support)) r.support = [];
    if (!r.tried || typeof r.tried !== 'object') r.tried = {};
    if (typeof r.note !== 'string') r.note = '';
    if (!Array.isArray(r.evidence)) r.evidence = [];
    if (r.stage !== 'done') r.stage = 'open';
    if (r.hypothesis === undefined) r.hypothesis = null;
    return r;
  }

  // Record that a clue was observed. Kept even before its case is known (and
  // tied to the case when it is); observing again changes nothing.
  function observe(s, cid) {
    const c = clueDef(cid);
    if (!c) return false;
    const d = D(s);
    if (d.clues[cid]) return 'again';
    d.clues[cid] = { t: now(), map: s.map || null, case: known(s, c.case) ? c.case : null };
    if (!known(s, c.case)) d.clues[cid].early = true;
    if (c.known && RB.known) RB.known.note(s, c.known.map, c.known.id, c.known);
    RB.bus.emit('case:clue', { id: cid, case: c.case });
    return 'new';
  }
  // Recognise a case: its record starts, clues seen earlier are tied to it,
  // and its Journey entry appears (the quest, if it has one).
  function open(s, id) {
    const cd = def(id);
    if (!cd) return null;
    const d = D(s);
    if (d.cases[id]) return norm(d.cases[id]);
    const r = d.cases[id] = fresh();
    const t = now();
    for (const cid in d.clues) {
      const c = clueDef(cid), x = d.clues[cid];
      if (!c || c.case !== id || x.case) continue;
      x.case = id;
      // noticed a moment ago, right here (the scene that opened the case): not "before you knew"
      if (x.early && x.map === (s.map || null) && t - x.t < 120000) delete x.early;
    }
    if (cd.quest && !s.quests[cd.quest]) RB.state.setQuest(s, cd.quest, 'start');
    RB.bus.emit('case:open', { id });
    return r;
  }
  function bookmark(s, cid, on) {
    const x = D(s).clues[cid];
    if (!x) return false;
    if (on === false) delete x.bm; else x.bm = 1;
    return true;
  }

  // ---- evidence ------------------------------------------------------------------------------
  // the observed clues of a case, in the order the case lists them
  function evidence(s, id) {
    const cd = def(id);
    if (!cd) return [];
    return (cd.clues || []).filter((cid) => observed(s, cid));
  }
  // clues observed before their case was recognised and bookmarked (loose)
  function loose(s) {
    const d = D(s);
    return Object.keys(d.clues).filter((cid) => { const c = clueDef(cid); return c && d.clues[cid].bm && !known(s, c.case); });
  }
  // a clue id or an equivalence group ("the current fixture": the counter or the bell)
  function has(s, id, key) {
    const cd = def(id);
    const grp = cd && cd.groups && cd.groups[key];
    return grp ? grp.some((cid) => observed(s, cid)) : observed(s, key);
  }
  // Does what was observed establish the answer? Any one authored sufficient set.
  function sufficient(s, id) {
    const cd = def(id);
    return !!(cd && (cd.sufficient || []).some((set) => set.every((k) => has(s, id, k))));
  }

  // ---- hypotheses (the player's own, from a bounded authored set) ----------------------------------
  function hypDef(id, hid) { const cd = def(id); return cd && (cd.hypotheses || []).find((h) => h.id === hid) || null; }
  const reachable = (s, h) => !h.from || !h.from.length || h.from.some((cid) => observed(s, cid));
  function hyps(s, id) {
    const cd = def(id), r = rec(s, id);
    if (!cd) return [];
    return (cd.hypotheses || []).filter((h) => reachable(s, h) || (r && (r.hypothesis === h.id || r.tried[h.id]))).map((h) => ({
      id: h.id, label: h.label, place: placeOf(s, h), chosen: !!(r && r.hypothesis === h.id), tried: !!(r && r.tried[h.id]), mismatch: r && r.tried[h.id] ? h.mismatch || null : null,
    }));
  }
  function placeOf(s, h) {
    if (!h.place) return null;
    if (h.placeBy && h.placeBy.length && !h.placeBy.some((cid) => observed(s, cid))) return null; // a place you have not found yet
    return h.place;
  }
  function choose(s, id, hid) {
    const r = rec(s, id) || open(s, id);
    if (!r || r.stage === 'done') return false;
    if (hid == null) { r.hypothesis = null; changed(); return true; }
    const h = hypDef(id, hid);
    if (!h || !(reachable(s, h) || r.tried[hid])) return false;
    r.hypothesis = hid;
    changed();
    RB.bus.emit('case:hypothesis', { id, hypothesis: hid });
    return true;
  }
  function setSupport(s, id, list) {
    const r = rec(s, id);
    if (!r) return false;
    const cd = def(id);
    r.support = (list || []).filter((cid, i, a) => a.indexOf(cid) === i && (cd.clues || []).includes(cid) && observed(s, cid)).slice(0, SUPPORT_MAX);
    return true;
  }
  function setNote(s, id, text) {
    const r = rec(s, id);
    if (!r) return null;
    const c = clean(text, NOTE_MAX);
    r.note = c.text;
    return c;
  }
  // A wrong hypothesis tested in the world: kept as a fact ("tried, and
  // why it did not fit"), never a penalty. The choice itself stays the player's.
  function rule(s, id, hid) {
    const r = rec(s, id) || open(s, id);
    if (!r || !hypDef(id, hid)) return false;
    if (!r.tried[hid]) r.tried[hid] = now();
    changed();
    return true;
  }

  // ---- help: language, navigation, reasoning -------------------------------------------------------
  const hintKey = (id) => 'case:' + id;
  function hintLevel(s, id) { return +D(s).hints[hintKey(id)] || 0; }
  function hintsOf(id) { const cd = def(id); return (cd && cd.hints) || []; }
  // Reasoning help, one step at a time; free, and remembered across saves.
  function askHint(s, id) {
    const n = hintLevel(s, id), max = hintsOf(id).length;
    if (n >= max) return null;
    D(s).hints[hintKey(id)] = n + 1;
    changed();
    return hintsOf(id)[n];
  }
  function langHelp(s, cid) { if (clueDef(cid)) D(s).hints['clue:' + cid] = 1; }
  const langOpen = (s, cid) => !!D(s).hints['clue:' + cid];
  // Where markers may point for a concealed step: the destination the player
  // chose (once its place is known), or one a requested hint disclosed.
  function markAt(s, id) {
    const r = rec(s, id);
    if (!r || r.stage === 'done') return null;
    if (r.hypothesis) {
      const h = hypDef(id, r.hypothesis);
      const p = h && placeOf(s, h);
      if (p) return p;
    }
    const lvl = hintLevel(s, id);
    for (let i = Math.min(lvl, hintsOf(id).length) - 1; i >= 0; i--) {
      const hn = hintsOf(id)[i];
      if (hn && hn.discloses) { const h = hypDef(id, hn.discloses); if (h && h.place) return h.place; }
    }
    return null;
  }

  // ---- resolution ------------------------------------------------------------------------------------
  function methodOf(s, id) {
    const cd = def(id), r = rec(s, id);
    if (cd && cd.method) return cd.method(s, r, api);
    if (hintLevel(s, id) >= hintsOf(id).length && hintsOf(id).length) return 'helped';
    return sufficient(s, id) ? 'reasoned' : 'early';
  }
  // Commit the result once (unique id case:<id>:done): the record, the
  // evidence it rested on (only what was observed), the keepsake, the quest.
  // Presentation (dialogue, reactions) comes after and never writes state.
  function resolve(s, id, how) {
    const cd = def(id);
    if (!cd) return false;
    const r = rec(s, id) || open(s, id);
    if (r.stage === 'done') return false;
    const first = RB.state.once(s, 'case:' + id + ':done');
    r.method = how || methodOf(s, id);
    r.stage = 'done';
    r.done = now();
    r.evidence = evidence(s, id);
    const right = (cd.hypotheses || []).find((h) => h.correct);
    if (right) r.hypothesis = right.id;
    if (cd.keepsake) RB.discovery.keepsake(s, cd.keepsake, { kind: 'case', id });
    if (cd.quest) RB.state.setQuest(s, cd.quest, 'done');
    changed();
    if (first) RB.bus.emit('discovery:resolved', { kind: 'case', id, region: cd.region || null, method: r.method, id2: 'case:' + id + ':done' });
    return first;
  }
  // the companion's reaction to this resolution (chosen once, stable on reload)
  function reaction(s, id) {
    const r = rec(s, id);
    if (!r || r.stage !== 'done' || !RB.company) return null;
    return RB.company.react(s, { id: 'case:' + id + ':done', event: 'case:' + id, facts: { method: r.method } });
  }

  // ---- words for the record ------------------------------------------------------------------------------
  const placeName = (map) => { const m = RB.content.maps[map]; return m && m.name ? m.name : null; };
  // A factual recap: what is being investigated, what has been observed and
  // where, the chosen hypothesis. The answer only if it was found.
  function recap(s, id) {
    const cd = def(id), r = rec(s, id);
    if (!cd || !r) return null;
    const ev = evidence(s, id);
    const places = [];
    for (const cid of ev) { const c = clueDef(cid); const pn = placeName(c.source && c.source.map); if (pn && !places.some((p) => p.en === pn.en)) places.push(pn); }
    const h = r.hypothesis ? hypDef(id, r.hypothesis) : null;
    return {
      question: cd.question, observed: ev.length, places, hypothesis: h ? h.label : null,
      tried: Object.keys(r.tried).map((hid) => hypDef(id, hid)).filter(Boolean).map((x) => x.label),
      done: r.stage === 'done', result: r.stage === 'done' ? cd.result || null : null,
    };
  }
  // Company (worker C1): is there a case to talk about, and which
  function discussable(s) { return !!s && Object.keys(D(s).cases).some((id) => def(id)); }
  function topics(s) {
    if (!s) return [];
    return Object.keys(D(s).cases).filter((id) => def(id)).map((id) => {
      const cd = def(id), r = rec(s, id);
      return { id: 'case:' + id, case: id, title: cd.title, state: r.stage, scene: cd.talk || null, recap: recap(s, id), open: () => show(id) };
    });
  }
  // open the folio at this case's record (from an Inspect view or Company)
  function show(id) {
    if (RB.ui && RB.ui.casebook) RB.ui.casebook.select(id);
    if (RB.ui && RB.ui.menu) {
      if (RB.ui.menu.isOpen()) RB.ui.menu.open('cases');
      else RB.ui.menu.open('cases');
    }
  }
  function changed() { if (RB.questMarks) RB.questMarks.refresh(); }

  // ---- older saves ------------------------------------------------------------------------------------------
  // Only what the save itself records: a clue whose scene the save has seen,
  // a case whose quest was started. Unknown ids are kept, never deleted.
  function migrate(st) {
    const d = D(st);
    for (const id in d.cases) if (d.cases[id] && typeof d.cases[id] === 'object') norm(d.cases[id]); else delete d.cases[id];
    for (const cid in RB.content.clues) {
      const c = RB.content.clues[cid];
      if (c.fromSeen && st.seen && st.seen[c.fromSeen] && !d.clues[cid]) d.clues[cid] = { t: 0, map: null, case: d.cases[c.case] ? c.case : null, legacy: true };
    }
    for (const id in RB.content.cases) {
      const cd = RB.content.cases[id];
      const q = cd.quest && st.quests && st.quests[cd.quest];
      if (q && !d.cases[id]) { d.cases[id] = fresh(); d.cases[id].t = q.t || 0; }
      const r = d.cases[id];
      if (r && r.stage === 'done' && cd.quest && st.quests && !(st.quests[cd.quest] && st.quests[cd.quest].done)) RB.state.setQuest(st, cd.quest, 'done');
      if (r) for (const cid of cd.clues || []) if (d.clues[cid] && !d.clues[cid].case) d.clues[cid].case = id;
    }
  }
  // (registered by src/ui/59_casebook.js: RB.save is defined after this file)

  // ---- conditions ----------------------------------------------------------------------------------------------
  RB.state.addTerm('case', (s, rest, op, val, num, cmp) => {
    const parts = rest.split('.');
    const r = s.discovery && s.discovery.cases && s.discovery.cases[parts[0]];
    const sub = parts[1];
    if (!sub) return op ? (r ? cmp(val === 'known' ? 'known' : r.stage, op, val === 'known' ? 'known' : val) : cmp('none', op, val)) : !!r;
    if (!r) return op === '!=';
    if (sub === 'hyp') return cmp(r.hypothesis || 'none', op || '=', val);
    if (sub === 'tried') return op ? (op === '!=' ? !r.tried[val] : !!r.tried[val]) : Object.keys(r.tried).length > 0;
    if (sub === 'hint') return cmp(+((s.discovery.hints || {})['case:' + parts[0]] || 0), op || '>=', num(val));
    return false;
  });
  RB.state.addTerm('clue', (s, rest) => !!(s.discovery && s.discovery.clues && s.discovery.clues[rest]));

  // ---- scene hooks ----------------------------------------------------------------------------------------------
  RB.hooks = RB.hooks || {};
  const S = () => RB.game.s;
  // !hook case_clue <clue id>: observed (a note on the page when its case is known)
  RB.hooks.case_clue = async (args) => {
    const s = S(), cid = args[0], c = clueDef(cid);
    const res = observe(s, cid);
    if (res === 'new' && c && known(s, c.case) && RB.ui && RB.ui.toast && !args.includes('quiet')) {
      await RB.ui.toast({ kind: 'note', jp: '{記録|きろく} に {書|か}き{加|くわ}えた', en: 'Added to your case record: ' + (c.title ? c.title.en : '') });
    }
  };
  // !hook case_open <id>
  RB.hooks.case_open = async (args) => {
    const s = S(), id = args[0], cd = def(id);
    if (!cd || known(s, id)) return;
    open(s, id);
    if (RB.ui && RB.ui.toast) await RB.ui.toast({ kind: 'quest_new', jp: cd.title.jp, en: cd.title.en + ' (Journey › Cases)' });
  };
  // !hook case_page <id>: the folio opens at the record (the last command of an Inspect scene)
  RB.hooks.case_page = async (args) => { if (RB.ui && RB.ui.dialogue) RB.ui.dialogue.hide(); show(args[0]); };
  // !hook case_rule <id> <hypothesis>: tested in the world, and it did not fit
  RB.hooks.case_rule = async (args) => { rule(S(), args[0], args[1]); };
  // !hook case_bookmark <clue id>
  RB.hooks.case_bookmark = async (args) => { bookmark(S(), args[0], true); };
  // !hook case_resolve <id> [method]: var._res = 1 the first time
  RB.hooks.case_resolve = async (args) => { const s = S(); s.vars._res = resolve(s, args[0], args[1] || null) ? 1 : 0; };
  // !hook case_ack <id>: the acknowledgement names only what was actually observed
  RB.hooks.case_ack = async (args) => {
    const s = S(), cd = def(args[0]);
    if (!cd || !cd.acknowledge) return;
    for (const l of cd.acknowledge(s, rec(s, args[0]), api) || []) await RB.ui.dialogue.say({ who: l.who === 'comp' ? (s.comp || s.provisional || 'narr') : l.who, expr: l.expr || null, jp: l.jp, en: l.en, sceneId: 'case:' + args[0] });
  };
  // !hook case_react <id>: the companion's reaction (the Company's say() when it exists)
  RB.hooks.case_react = async (args) => {
    const s = S(), id = args[0], r = rec(s, id);
    if (!r || r.stage !== 'done' || !(s.comp || s.provisional)) return;
    const ev = { id: 'case:' + id + ':done', event: 'case:' + id, facts: { method: r.method } };
    if (RB.company && RB.company.say) { await RB.company.say(s, ev); return; }
    const pick = reaction(s, id);
    if (!pick) return;
    for (const l of pick.lines) await RB.ui.dialogue.say({ who: l.who || s.comp || s.provisional, expr: l.expr || null, jp: l.jp, en: l.en, sceneId: 'case:' + id });
  };

  const api = {
    NOTE_MAX, COMPARE_MAX, SUPPORT_MAX, def, clueDef, rec, known, solved, observed, observe, open, bookmark, evidence, loose, has, sufficient,
    hyps, hypDef, placeOf, choose, setSupport, setNote, rule, hintLevel, hintsOf, askHint, langHelp, langOpen, markAt, methodOf, resolve, reaction,
    recap, discussable, topics, show, graphemes, clean, migrate, _D: D,
  };
  return api;
})();
