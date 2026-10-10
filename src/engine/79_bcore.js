/* Practice suite B — shared core for the villagers' correspondence, the
 * Proofreader's Tray and One Word, Two Moments (Practice addendum §17–§19;
 * docs/practice/suite_b.md). Loaded before 79_compare.js, 79_letters.js and
 * 79_proof.js, which use it at run time.
 *
 *   RB.practiceB.PLACE                 the correspondence furniture: the post box in
 *                                      Shino's Post House (co.post, tile 7,5)
 *   RB.practiceB.atPlace(s)            standing in that room
 *   RB.practiceB.worldSafe()           { ok, why }: no scene, battle, challenge or
 *                                      creature close by (the companion need not be here)
 *   RB.practiceB.launchAfterScene(kind, ctx)
 *                                      the post box's scene asks for an activity; it
 *                                      starts once that scene has ended (an activity
 *                                      never starts inside a running scene)
 *   RB.practiceB.space(families)       the bounded answer space of authored replies
 *   RB.practiceB.match(space, text, o) which authored reply a confirmed text is, or null
 *   RB.practiceB.partsMatch(families, picked)  the same for a reply built from pieces
 *   RB.practiceB.cooldown(rec)         RB.practice.cooldown() primed with the
 *                                      namespace's recent objectives (spans sessions)
 *   RB.practiceB.note(rec, objId, missed)  remember an objective for that cooldown
 *   RB.practiceB.firstAssessment(rec, objId)  true once per objective per campaign
 *   RB.practiceB.keepPage(s, page, ask)  a kept practice page, through the writing
 *                                      desk's shared six-page budget when it exists
 *
 * Answer spaces are explicit and finite: every reply a letter (or a repair) can
 * read is authored as a family of approved parts; typed or handwritten text is
 * compared with those realisations only (kanji or kana per word, spaces and
 * punctuation ignored). Text outside them is reported as outside the practice's
 * coverage, never as a grammar error. The expected answer never reaches the
 * recogniser. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.practiceB = (function () {
  'use strict';
  const PLACE = {
    map: 'co.post', prop: 'mailbox', x: 7, y: 5,
    name: { en: "Shino's Post House, Cinder Orchard", jp: 'シノ の {郵便所|ゆうびんじょ} （ {灰実|はいみ} の {里|さと} ）' },
  };
  const atPlace = (s) => !!(s && s.map === PLACE.map);

  // The world is calm enough to sit down at the tray: no scene, battle or challenge on top,
  // and no creature within six steps. Unlike a companion conversation this does not need the
  // companion beside you (§3.2: other activities need their source object, not the companion).
  function worldSafe() {
    const g = RB.game;
    if (!g || !g.s) return { ok: false, why: 'Not in a campaign.' };
    if (RB.script && RB.script.isRunning && RB.script.isRunning()) return { ok: false, why: 'Not in the middle of a scene.' };
    const modes = ((g.G && g.G.modes) || []).filter((m) => m !== 'menu');
    const top = modes.length ? modes[modes.length - 1] : g.mode();
    if (top !== 'world') return { ok: false, why: 'Not just now.' };
    const W = RB.world && RB.world.W;
    if (W && W.player && (W.foes || []).some((f) => Math.abs(f.x - W.player.x) + Math.abs(f.y - W.player.y) <= 6)) return { ok: false, why: 'Not with a creature close by.' };
    return { ok: true };
  }

  // ---- starting an activity from the post box's scene -------------------------------------
  let pending = null;
  function launchAfterScene(kind, ctx) { pending = { kind, ctx: Object.assign({ source: 'world-prop' }, ctx || {}) }; }
  function flush() {
    if (!pending) return;
    const p = pending;
    pending = null;
    setTimeout(() => {
      if (!RB.activity || !RB.game || !RB.game.s) return;
      if (RB.script.isRunning() || RB.game.mode() !== 'world') return;
      RB.activity.launch(p.kind, p.ctx);
    }, 0);
  }
  if (RB.bus) {
    RB.bus.on('story:settled', flush);
    RB.bus.on('campaign:changing', () => { pending = null; });
  }

  // ---- bounded answer spaces --------------------------------------------------------------------
  const HAND_ONE = {};
  function handFold(t) {
    if (!Object.keys(HAND_ONE).length && RB.answers && RB.answers.HAND_SAME) RB.answers.HAND_SAME.forEach((g) => Array.from(g).forEach((c) => { HAND_ONE[c] = g[0]; }));
    return Array.from(t).map((c) => HAND_ONE[c] || c).join('');
  }
  const norm = (t) => (RB.answers && RB.answers.normKana ? RB.answers.normKana(t) : String(t || '').replace(/[\s　。、！？!?,.]/g, ''));
  // every way to write a markup line: each ruby group as its kanji or as its reading
  function writings(markup) {
    let toks;
    try { toks = RB.jp.parse(markup); } catch (e) { return [norm(markup)]; }
    let outs = [''];
    for (const t of toks) {
      if (t.punct) continue;
      for (const sg of t.segs) {
        const opts = sg.r != null && sg.r !== sg.t ? [sg.t, sg.r] : [sg.t];
        const next = [];
        for (const o of outs) for (const x of opts) next.push(o + x);
        outs = next.length > 512 ? next.slice(0, 512) : next;
      }
    }
    // a long reply has more mixes than are listed: its all-kana and all-kanji writings are always among them
    // (typed answers are usually one or the other)
    try { outs.push(RB.jp.reading(markup), RB.jp.plain(markup)); } catch (e) { /* the mixes above stand */ }
    return Array.from(new Set(outs.map(norm)));
  }
  // A family: { parts:[markup…], also?:[[markup…]…], ok, tone, en, why? }. A part that
  // starts with '?' may be left out. Sentences (parts ending in 。 ！ ？) may come in either
  // order unless the family says `fixed`.
  const OPT = (p) => typeof p === 'string' && p[0] === '?';
  const bare = (p) => (OPT(p) ? p.slice(1) : p);
  const isEnd = (p) => /[。！？]\s*$/.test(bare(p));
  function sequences(f) {
    const out = [];
    for (const base of [f.parts].concat(f.also || [])) {
      // optional parts: every subset of them
      const optIdx = base.map((p, i) => (OPT(p) ? i : -1)).filter((i) => i >= 0);
      const n = Math.min(optIdx.length, 6);
      for (let m = 0; m < 1 << n; m++) {
        const seq = base.filter((p, i) => { const k = optIdx.indexOf(i); return k < 0 || k >= n || m & (1 << k); }).map(bare);
        if (seq.length) out.push(seq);
        // sentence order: the sentences of a reply may be swapped (two at most)
        if (!f.fixed) {
          const sents = [];
          let cur = [];
          seq.forEach((p) => { cur.push(p); if (isEnd(p)) { sents.push(cur); cur = []; } });
          if (cur.length) sents.push(cur);
          if (sents.length === 2) out.push(sents[1].concat(sents[0]));
        }
      }
    }
    const seen = new Set();
    return out.filter((q) => { const k = q.join('\u0001'); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  // the answer space: every normalised writing of every authored reply → its family
  function space(families) {
    const map = new Map();
    families.forEach((f, i) => {
      for (const seq of sequences(f)) for (const w of writings(seq.join(' '))) {
        if (!w) continue;
        if (!map.has(w)) map.set(w, i);
        const hw = handFold(w);
        if (!map.has('h:' + hw)) map.set('h:' + hw, i);
      }
    });
    return { families, map, size: map.size };
  }
  // which family a confirmed text belongs to: { i, family } or null (outside the space)
  function match(sp, text, o) {
    const n = norm(text);
    if (!n) return null;
    let i = sp.map.get(n);
    if (i == null && o && o.handwritten) i = sp.map.get('h:' + handFold(n));
    return i == null ? null : { i, family: sp.families[i] };
  }
  // a reply built from pieces (an array of the parts' markup, in order)
  function partsMatch(families, picked) {
    const key = picked.map((p) => norm(RB.jp.plain(p))).join('\u0001');
    for (let i = 0; i < families.length; i++) {
      for (const seq of sequences(families[i])) if (seq.map((p) => norm(RB.jp.plain(p))).join('\u0001') === key) return { i, family: families[i] };
    }
    // the same words in one go (a piece split differently) still count
    const flat = norm(picked.map((p) => RB.jp.plain(p)).join(''));
    for (let i = 0; i < families.length; i++) for (const seq of sequences(families[i])) if (norm(seq.map((p) => RB.jp.plain(p)).join('')) === flat) return { i, family: families[i] };
    return null;
  }
  // the pieces a family set offers: every part of every family (deduplicated, in a stable order) plus extras
  function pieces(families, extra) {
    const out = [];
    const add = (p) => { const b = bare(p); if (out.indexOf(b) < 0) out.push(b); };
    families.forEach((f) => [f.parts].concat(f.also || []).forEach((q) => q.forEach(add)));
    (extra || []).forEach(add);
    return out;
  }
  // the canonical written reply of a family (all its parts, optional ones included)
  const replyOf = (f) => f.parts.map(bare).join(' ');
  const shortest = (families) => Math.min.apply(null, families.filter((f) => f.ok).map((f) => Math.min.apply(null, sequences(f).map((q) => Array.from(norm(RB.jp.reading(q.join(' ')))).length))));

  // ---- learning evidence across sessions -------------------------------------------------------------
  // The suite's activities assess through RB.practice.objectives (one mastery event per
  // objective within a session). Across sessions an authored objective is assessed once per
  // campaign: a later replay is practice (a tally), not another promotion.
  function firstAssessment(rec, objId) {
    if (!rec) return false;
    rec.assessed = rec.assessed && typeof rec.assessed === 'object' ? rec.assessed : {};
    if (rec.assessed[objId]) return false;
    return true;
  }
  function markAssessed(rec, objId) { if (rec) { rec.assessed = rec.assessed || {}; rec.assessed[objId] = 1; } }
  // RB.practice.cooldown(), primed with this activity's last objectives so that "not the same
  // one at once; a missed one waits four" holds from one sitting to the next
  function cooldown(rec) {
    const cd = RB.practice.cooldown();
    for (const h of (rec && rec.recent) || []) cd.push(h.id, !!h.m);
    return cd;
  }
  function note(rec, objId, missed, cd) {
    if (!rec) return;
    rec.recent = Array.isArray(rec.recent) ? rec.recent : [];
    rec.recent.push(missed ? { id: objId, m: 1 } : { id: objId });
    if (rec.recent.length > 8) rec.recent.splice(0, rec.recent.length - 8);
    if (cd) cd.push(objId, !!missed);
  }

  // ---- kept practice pages (addendum §16.3, §18.3) ------------------------------------------------
  // The writing desk (suite A) owns the six-page budget in s.practice.deskPages and provides
  // RB.practiceDesk.keepPage(s, page) with its own replace/cancel sheet. Until it is merged,
  // this fallback enforces the same rule: at most six pages, each at most 256 KiB, and a
  // seventh only by explicitly replacing one (ask(pages) → index to replace, or -1 to cancel).
  const MAX_PAGES = 6, MAX_BYTES = 256 * 1024;
  const bytesOf = (o) => { try { return new Blob([JSON.stringify(o)]).size; } catch (e) { return JSON.stringify(o).length * 3; } };
  async function keepPage(s, page, ask) {
    if (RB.practiceDesk && typeof RB.practiceDesk.keepPage === 'function') return RB.practiceDesk.keepPage(s, page);
    const P = RB.practice.of(s);
    if (!P) return { ok: false, why: 'none' };
    const pages = Array.isArray(P.deskPages) ? P.deskPages : (P.deskPages = []);
    const rec = Object.assign({}, page);
    rec.bytes = bytesOf(rec);
    if (rec.bytes > MAX_BYTES) return { ok: false, why: 'too-big' };
    const same = pages.findIndex((p) => p && p.id === rec.id);
    if (same >= 0) { rec.created = pages[same].created || rec.created; rec.updated = Date.now(); pages[same] = Object.assign(rec, { saved: true }); return { ok: true, page: pages[same], updated: true }; }
    if (pages.length >= MAX_PAGES) {
      const k = ask ? await ask(pages.slice()) : -1;
      if (k == null || k < 0 || k >= pages.length) return { ok: false, why: 'cancelled' };
      const old = pages[k];
      pages[k] = Object.assign(rec, { saved: true });
      return { ok: true, page: pages[k], replaced: old };
    }
    pages.push(Object.assign(rec, { saved: true }));
    return { ok: true, page: rec };
  }
  const pages = (s, kind) => { const P = RB.practice.of(s); return P && Array.isArray(P.deskPages) ? P.deskPages.filter((p) => p && (!kind || p.kind === kind)) : []; };

  // a bounded, plain label (the player's own text)
  const cleanLabel = (t) => (RB.bookmarks && RB.bookmarks.clean ? RB.bookmarks.clean(t, 40, false) : String(t || '').slice(0, 40));

  return {
    PLACE, atPlace, worldSafe, launchAfterScene, _pending: () => pending,
    norm, writings, sequences, space, match, partsMatch, pieces, replyOf, shortest, handFold,
    firstAssessment, markAssessed, cooldown, note,
    keepPage, pages, bytesOf, cleanLabel, MAX_PAGES, MAX_BYTES,
  };
})();
