/* Mastery exams and stars (expansion L3; Robin's C-13, C-41, C-75; docs/future/plan/05_LANGUAGE.md).
 *
 * Groups come from the content: kana rows, kanji by theme (the ones met), the words of each region (the ones met),
 * and grammar families (the points met). A group is offered once most of it has been met. An exam is up to ten fresh
 * questions over the group in ONE input type (Write, Choose, Type, or Listen where the device has a Japanese voice).
 * Hints stay available. Each question is a fixed slot that keeps its first committed answer:
 *   independent  right first time, with no counting help (src/learn/40_evidence.js COUNTING)
 *   assisted     right, with counting help (or the answer was shown)
 *   missed       a wrong first answer, even if put right afterwards
 * The star (per input type) needs fewer than 30% of the exam's questions assisted or missed, together: in ten, two may
 * be either and three can't. A retake gives fresh questions for just the assisted and missed slots; the whole exam
 * stays the measure. An exam that falls short is kept honestly as "completed with help".
 *
 * Stars are flair, just for the player: they unlock nothing (no item, route, illustration, Bond or stamp).
 * s.records.stars['<group>|<mode>'] = { t, n, indep }; s.learn.exams['<group>|<mode>'] = { slots, t, star, tries }. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.exams = (function () {
  'use strict';
  const MAX = 10, MIN = 5, OFFER = 0.6, LIMIT = 0.3;
  const MODES = [
    { id: 'hand', en: 'Write', jp: '{書|か}く' },
    { id: 'choice', en: 'Choose', jp: '{選|えら}ぶ' },
    { id: 'ime', en: 'Type', jp: '{打|う}つ' },
    { id: 'listen', en: 'Listen (device voice)', jp: '{聞|き}く' },
  ];
  const ROWS = { a: 'あいうえお', ka: 'かきくけこ', sa: 'さしすせそ', ta: 'たちつてと', na: 'なにぬねの', ha: 'はひふへほ', ma: 'まみむめも', ya: 'やゆよ', ra: 'らりるれろ', wa: 'わをん', ga: 'がぎぐげご', za: 'ざじずぜぞ', da: 'だぢづでど', ba: 'ばびぶべぼ', pa: 'ぱぴぷぺぽ' };
  const REGIONS = { core: 'Everyday words', ch1: 'Reedwake', ch2: 'Saltglass', ch3: 'Cinder Orchard', ch4: 'Snowbell', ch5: 'Lanternfall', ch6: 'The Still Archive' };
  // grammar families (L3: "requests", "conditions"…), from the game's own grammar points (src/lang/40_grammar.js)
  const FAMILIES = {
    particles: { en: 'Particles', ids: ['prt_wa', 'prt_ga', 'prt_wo', 'prt_ni', 'prt_de', 'prt_he', 'prt_to', 'prt_mo', 'prt_no', 'prt_kara_made', 'prt_ya', 'prt_ka', 'prt_yo_ne'] },
    verbs: { en: 'Verb forms', ids: ['v_masu', 'v_masu_forms', 'v_nai', 'v_ta', 'v_te', 'v_te_iru', 'v_tai', 'v_volitional', 'v_potential'] },
    requests: { en: 'Requests and permission', ids: ['v_te_kudasai', 'v_naide_kudasai', 'v_mashou', 'v_temo_ii', 'v_nakereba', 'keigo_kenjo', 'register_polite_plain'] },
    reasons: { en: 'Reasons and contrasts', ids: ['conj_kara', 'conj_node', 'conj_kedo_ga', 'noni', 'prt_shi', 'temo', 'tame'] },
    conditions: { en: 'Conditions and time', ids: ['cond_tara', 'cond_ba', 'cond_to', 'cond_nara', 'toki', 'mae_ato', 'v_te_kara', 'v_nagara'] },
    certainty: { en: 'Certainty and hearsay', ids: ['sou_look', 'sou_hear', 'you_mitai', 'rashii', 'hazu', 'kamo', 'deshou', 'wake'] },
    states: { en: 'Doing, leaving, finishing', ids: ['te_shimau', 'te_oku', 'te_aru', 'te_miru', 'giving', 'te_giving', 'passive', 'causative'] },
  };
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const items = (s) => (s && s.learn && s.learn.items) || {};
  const seen = (s, id) => !!(items(s)[id] && items(s)[id].seen > 0);

  // ---- groups ------------------------------------------------------------------------------------------------
  function groups(s) {
    const out = [];
    for (const k in ROWS) {
      const h = Array.from(ROWS[k]);
      out.push({ id: 'kana:h:' + k, kind: 'kana', en: 'Hiragana: the ' + h[0] + ' row', jp: h.join(''), items: h.map((c) => 'k:' + c) });
      const t = h.map((c) => RB.kana.toKata(c));
      out.push({ id: 'kana:k:' + k, kind: 'kana', en: 'Katakana: the ' + t[0] + ' row', jp: t.join(''), items: t.map((c) => 'k:' + c) });
    }
    if (RB.kanjiInfo) {
      const met = RB.kanjiInfo.met(s);
      for (const th of RB.kanjiInfo.themes()) {
        const chars = RB.kanjiInfo.byTheme(th.id).map((e) => e.ch).filter((c) => met.has(c)).slice(0, 15);
        if (chars.length >= MIN) out.push({ id: 'kanji:' + th.id, kind: 'kanji', en: 'Kanji: ' + th.en, jp: th.jp, items: chars.map((c) => 'j:' + c) });
      }
    }
    if (RB.lex) {
      const by = {};
      for (const id in items(s)) {
        if (id.slice(0, 2) !== 'v:' || !seen(s, id)) continue;
        const e = (RB.lex.bySurface(id.slice(2)) || [])[0];
        const src = e && [].concat(e.src || [])[0];
        if (REGIONS[src]) (by[src] = by[src] || []).push(id);
      }
      for (const src in by) for (let p = 0; p * 15 < by[src].length; p++) {
        const part = by[src].slice(p * 15, p * 15 + 15);
        if (part.length >= MIN) out.push({ id: 'words:' + src + (p ? ':' + (p + 1) : ''), kind: 'words', en: 'Words: ' + REGIONS[src] + (p ? ' (' + (p + 1) + ')' : ''), jp: '', items: part });
      }
    }
    for (const k in FAMILIES) {
      const ids = FAMILIES[k].ids.filter((g) => RB.grammar && RB.grammar.get(g)).map((g) => 'g:' + g);
      if (ids.length >= MIN) out.push({ id: 'grammar:' + k, kind: 'grammar', en: 'Grammar: ' + FAMILIES[k].en, jp: '', items: ids });
    }
    return out;
  }
  // how much of a group has been met; offered from OFFER (60%)
  function metShare(s, g) {
    if (g.kind === 'kana') {
      const taught = s.learn.profile !== 'F' || s.learn.kanaKnown === 'both' || (s.learn.kanaKnown === 'hira' && g.id.indexOf(':h:') > 0);
      if (taught) return 1;
      return g.items.filter((id) => RB.learn.kanaKnown(id.slice(2))).length / g.items.length;
    }
    if (g.kind === 'kanji' || g.kind === 'words') return 1; // built from what was met
    return g.items.filter((id) => seen(s, id)).length / g.items.length;
  }
  const offered = (s, g) => metShare(s, g) >= OFFER;

  // ---- questions -------------------------------------------------------------------------------------------
  // a fresh question for an item in an input type, or null when the item has none in that type. `n` varies it.
  function question(s, id, mode, n) {
    const k = id.slice(0, 1), v = id.slice(2);
    const write = mode === 'hand' || mode === 'ime';
    if (mode === 'listen') {
      const e = k === 'v' ? RB.tasks.findWord(v) : null;
      if (!e) return null;
      const r = RB.util.rng(RB.util.hashStr(id + '|' + n));
      const wrong = r.shuffle(RB.tasks.kanaWordIndex().filter((x) => x.m !== e.m && x.pos === e.pos)).slice(0, 3);
      return { kind: 'listen', item: id, transcript: { jp: e.w !== e.r ? '{' + e.w + '|' + e.r + '}' : e.w, en: e.m }, prompt: { en: 'What does the word mean?' }, options: [{ en: e.m, ok: true }].concat(wrong.map((w) => ({ en: w.m, ok: false, why: { en: 'That would be ' + (w.w !== w.r ? w.w + '（' + w.r + '）' : w.w) + '.' } }))) };
    }
    if (k === 'k') return RB.tasks.kanaStep(v, { bare: n % 2 === 1 });
    if (k === 'j') {
      const info = RB.kanjiInfo && RB.kanjiInfo.get(v);
      const w = info && (info.words || [])[n % Math.max(1, (info.words || []).length)];
      if (!w) return null;
      if (write) return { kind: 'write', item: id, answer: v, accept: [v], mode: 'exact', script: 'any', single: true, prompt: { en: 'Write the kanji in ' + w.r + ' (“' + w.m + '”).' }, explain: { en: (w.w !== w.r ? w.w + '（' + w.r + '）' : w.w) + ' — ' + w.m + '.' } };
      const pool = RB.util.rng(RB.util.hashStr(id + n)).shuffle((RB.kanjiInfo.all ? RB.kanjiInfo.all() : []).filter((e) => e.ch !== v && (e.words || []).length)).slice(0, 3);
      return { kind: 'choose', item: id, prompt: { en: 'Which kanji is in ' + w.r + ' (“' + w.m + '”)?' }, options: [{ jp: '{' + v + '|' + (info.readings[0] || w.r) + '}', ok: true }].concat(pool.map((e) => ({ jp: '{' + e.ch + '|' + (e.readings[0] || '') + '}', ok: false, why: { en: e.ch + ' is in ' + (e.words[0].r) + ' (“' + e.words[0].m + '”).' } }))) };
    }
    if (k === 'v') {
      const st = RB.tasks.vocabStep(v, { recall: write });
      if (!st || (write && st.kind !== 'write')) return null;
      return st;
    }
    if (k === 'g') {
      const ds = RB.content.drills.filter((d) => d.item === id || (Array.isArray(d.item) && d.item.indexOf(id) >= 0)).filter((d) => !write || d.kind === 'write');
      if (!ds.length) return null;
      return JSON.parse(JSON.stringify(ds[n % ds.length]));
    }
    return null;
  }
  // can a group be examined in a mode: enough items have a question of that kind
  function modeOk(s, g, mode) {
    if (mode === 'listen' && !(RB.voice && RB.voice.status && RB.voice.status().localJaCount > 0)) return false;
    return g.items.filter((id) => question(s, id, mode, 0)).length >= MIN;
  }

  // ---- results -----------------------------------------------------------------------------------------------
  const ex = (s) => (isObj(s.learn.exams) ? s.learn.exams : (s.learn.exams = {}));
  const key = (gid, mode) => gid + '|' + mode;
  // a slot's result from the runner's result object
  function slotOf(res) {
    if (!res || res.cancelled) return null;
    if (res.firstTry === false) return 'missed';
    if (res.revealed || res.assisted || (res.help && RB.evidence.COUNTING[res.help])) return 'assisted';
    return 'independent';
  }
  // the star rule (C-75): fewer than 30% assisted or missed, together
  function judge(slots) {
    const n = slots.length;
    const off = slots.filter((x) => x.r !== 'independent').length;
    return { n, off, indep: n - off, star: n >= MIN && off / n < LIMIT };
  }
  // which items an exam asks: up to ten, the ones met first, in a stable shuffle per sitting
  function plan(s, g, mode) {
    const r = RB.util.rng(RB.util.hashStr(g.id + mode + (ex(s)[key(g.id, mode)] ? ex(s)[key(g.id, mode)].tries : 0)));
    const ids = r.shuffle(g.items.filter((id) => question(s, id, mode, 0))).sort((a, b) => (seen(s, b) ? 1 : 0) - (seen(s, a) ? 1 : 0)).slice(0, MAX);
    return ids;
  }
  // record a finished sitting: slots [{ item, r }]; a retake replaces only the slots it re-asked
  function finish(s, g, mode, slots, retake) {
    const k = key(g.id, mode);
    const prev = ex(s)[k];
    let all = slots;
    if (retake && prev) all = prev.slots.map((x) => slots.find((y) => y.item === x.item) || x);
    const j = judge(all);
    const rec = { slots: all, t: Date.now(), star: j.star, tries: ((prev && prev.tries) || 0) + 1 };
    ex(s)[k] = rec;
    let newStar = false;
    if (j.star) newStar = RB.records.award(s, 'stars', k, { n: j.n, indep: j.indep });
    return Object.assign({ newStar, rec }, j);
  }
  // the slots a retake asks again: the assisted and missed ones
  function retakeItems(s, g, mode) {
    const rec = ex(s)[key(g.id, mode)];
    return rec ? rec.slots.filter((x) => x.r !== 'independent').map((x) => x.item) : [];
  }
  function state(s, g, mode) {
    const k = key(g.id, mode);
    const rec = ex(s)[k];
    return { star: RB.records.has(s, 'stars', k), sat: !!rec, helped: !!rec && !RB.records.has(s, 'stars', k), retake: rec ? retakeItems(s, g, mode).length : 0, rec };
  }
  return { MODES, MAX, MIN, LIMIT, groups, offered, metShare, question, modeOk, slotOf, judge, plan, finish, retakeItems, state, key, FAMILIES };
})();
