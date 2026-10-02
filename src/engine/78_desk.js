/* The copying desk (Practice addendum §16): four directly selectable modes
 * that practise different things, and up to six personal pages per campaign.
 *
 *   trace    numbered reference strokes underneath  → guided motor practice only
 *   copy     the model in its own pane beside        → copying practice, never recall
 *   prompt   meaning and context first; the model     → one ordinary untimed assessment,
 *            only through help                          only when the answer was not exposed
 *   typeset  an approved word in a readable layout    → personal decoration, not handwriting
 *
 * Cards: the twenty base concepts (src/content/practice_a/10_text.js), each
 * resolved to an existing lexicon record and its contextual reading, plus
 * words from the notebook with at most eight displayed grapheme clusters
 * whose every character has real reference stroke data.
 *
 * Pages live in s.practice.deskPages, shared with the Proofreader's Tray
 * (one six-page budget). A page record:
 *   { id, kind: 'desk'|'proof', word?, reading?, mode: 'trace'|'copy'|'prompt'|'typeset'|'proof',
 *     strokes?: [{ ch, s: [packed stroke, …] }],   actual vector strokes, compacted (pack/unpack)
 *     typeset?: { jp, layout?, paper?, lines? },     an explicit typeset specification
 *     label, bytes, saved, created, updated }
 *
 *   RB.practiceDesk.keepPage(s, page) -> Promise<{ ok, id?, replaced?, cancelled?, updated?,
 *        saved?, why?, error?, page }>   (why: 'cancelled' | 'too-large' | 'error' | 'invalid' when
 *        not kept; 'no-slot' | 'read-only' | 'session' when kept but not saved)
 *     Normalises and compacts the page, refuses one over 256 KiB, and at six pages asks
 *     the chooser (the replace/cancel sheet with previews, src/ui/89_desk.js) which page
 *     to replace; nothing is ever removed without that explicit choice. It then writes
 *     the campaign (an autosave). A refused write puts the pages back as they were, so
 *     ordinary saving keeps working, and reports saved: false (the art stays on screen,
 *     marked unsaved). No slot / read-only / session-only storage: kept in the journey,
 *     saved: false with the reason.
 *   RB.practiceDesk.setChooser(fn)   fn(s, pages, page) -> Promise<{ replace: id } | null>
 *   pack(ink) / unpack(strokes)      [{ ch, strokes: [[{x,y}]] }] in 0..1 box units <-> compact
 *   pages(s, kind?), rename(s, id, label), removePage(s, id) (explicit only), persist(s)
 *   cards(s), notebookCards(s), graphemes(t), writable(t), forms(card)
 *   record(s, ob, objId, card, mode, res, o)  the learning adapter for one desk task
 * Timestamps are records (created/updated), never eligibility. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.practiceDesk = (function () {
  'use strict';
  const MAX_PAGES = 6;
  const MAX_BYTES = 256 * 1024;
  const MAX_LABEL = 40;
  const MAX_CLUSTERS = 8;
  const MODES = ['trace', 'copy', 'prompt', 'typeset'];
  const KINDS = ['desk', 'proof'];
  // the writing desk is a real table in an inn, with no quest of its own (sg.inn: the
  // small table by the chair at 9,7; the player sits facing it from 9,6, 8,7 or 9,8)
  const PLACES = [{ map: 'sg.inn', x: 9, y: 7, prop: 'smalltable' }];

  // what is on the practice shelf, and a practice memento pinned on Company › Shared memories
  // instead of a keepsake (only by an explicit choice): 'source:id' keys
  RB.practice.addNamespace('mementoDisplay', () => ({ shelf: null, pin: null }), (x) => (x && typeof x === 'object' ? x : null));
  RB.practice.addNamespace('desk', () => ({ v: 1, last: { card: null, mode: 'trace', form: 'kanji' } }), (x) => {
    if (!x || typeof x !== 'object') return null;
    if (!x.last || typeof x.last !== 'object') x.last = { card: null, mode: 'trace', form: 'kanji' };
    if (MODES.indexOf(x.last.mode) < 0) x.last.mode = 'trace';
    return x;
  });

  const here = (s) => !!(s && PLACES.some((p) => p.map === s.map));
  const placeOf = (s) => (s && PLACES.find((p) => p.map === s.map)) || null;
  // offered from Chapter 2 on (Saltglass, where the desk is)
  const unlocked = (s) => !!(s && ((s.chapter | 0) >= 2 || (s.visited && s.visited['sg.inn']) || (s.flags && s.flags.ch1_done)));

  // ---- cards ------------------------------------------------------------------------------------------
  function graphemes(t) {
    t = String(t || '');
    try {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) return Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(t), (x) => x.segment);
    } catch (e) { /* fall through */ }
    return Array.from(t);
  }
  // every character (one code point per cluster) has real reference strokes
  function writable(t) {
    const g = graphemes(t);
    return g.length > 0 && g.length <= MAX_CLUSTERS && g.every((c) => Array.from(c).length === 1 && !!(RB.recog && RB.recog.reference(c)));
  }
  const ruby = (w, r) => (w && r && w !== r && RB.jp && RB.jp.rubyize ? RB.jp.rubyize(w, r) || w : w);
  function base() { return ((RB.content.practiceA && RB.content.practiceA.cards) || []).map((c) => Object.assign({ w: c.word }, c)); }
  function decorate(c) {
    const e = RB.lex.get(c.w, c.r);
    return Object.assign({}, c, { m: e ? e.m : c.en, lex: !!e, mark: ruby(c.w, c.r), introduced: RB.learn.introduced(c.item) });
  }
  function cards(s) { void s; return base().map(decorate); }
  // eligible known words from the notebook: an existing lexicon record (by the noted
  // lemma and reading), at most eight displayed clusters, real stroke data for each
  function notebookCards(s) {
    const out = [], seen = new Set(base().map((c) => c.item));
    for (const n of (s && s.notebook) || []) {
      if (!n || n.kind !== 'word' || typeof n.id !== 'string') continue;
      const m = /^w:([^|]*)\|(.*)$/.exec(n.id);
      const lemma = m ? m[1] : n.surface, reading = m ? m[2] : n.reading;
      const e = (lemma && reading && RB.lex.get(lemma, reading)) || null;
      if (!e || !writable(e.w)) continue;
      const item = 'v:' + e.w;
      if (seen.has(item)) continue;
      seen.add(item);
      out.push({ id: 'nb:' + e.w + '|' + e.r, en: e.m, w: e.w, r: e.r, item, accept: e.w !== e.r ? [e.r, e.w] : [e.r], notebook: true, m: e.m, lex: true, mark: ruby(e.w, e.r), introduced: true });
    }
    return out;
  }
  function find(s, id) { return cards(s).concat(notebookCards(s)).find((c) => c.id === id) || null; }
  // the written forms a page can practise: the word as usually written, and its kana
  function forms(card) {
    const out = [];
    if (writable(card.w)) out.push({ id: 'kanji', text: card.w });
    if (card.r !== card.w && writable(card.r)) out.push({ id: 'kana', text: card.r });
    return out;
  }

  // ---- compact vector strokes --------------------------------------------------------------------------
  // Points in 0..1 box units, simplified (Ramer-Douglas-Peucker), quantised to 12 bits
  // and written as two base-64 digits per coordinate: about 4 bytes a point.
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const Q = 4095;
  const enc = (v) => { const n = Math.max(0, Math.min(Q, Math.round(v * Q))); return B64[n >> 6] + B64[n & 63]; };
  const dec = (a, b) => ((B64.indexOf(a) << 6) | B64.indexOf(b)) / Q;
  function rdp(pts, tol) {
    if (pts.length < 3) return pts.slice();
    const keep = new Array(pts.length).fill(false);
    keep[0] = keep[pts.length - 1] = true;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const [i, j] = stack.pop();
      const a = pts[i], b = pts[j];
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1e-9;
      let best = -1, bi = -1;
      for (let k = i + 1; k < j; k++) {
        const p = pts[k];
        const d = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / L;
        if (d > best) { best = d; bi = k; }
      }
      if (best > tol) { keep[bi] = true; stack.push([i, bi], [bi, j]); }
    }
    return pts.filter((p, k) => keep[k]);
  }
  function packStroke(st, tol) {
    const pts = (st || []).filter((p) => p && isFinite(p.x) && isFinite(p.y)).map((p) => ({ x: Math.max(0, Math.min(1, p.x)), y: Math.max(0, Math.min(1, p.y)) }));
    return rdp(pts, tol).map((p) => enc(p.x) + enc(p.y)).join('');
  }
  function unpackStroke(str) {
    const out = [];
    str = String(str || '');
    for (let i = 0; i + 3 < str.length; i += 4) out.push({ x: dec(str[i], str[i + 1]), y: dec(str[i + 2], str[i + 3]) });
    return out;
  }
  // ink: [{ ch, strokes: [[{x,y}]] }]  →  [{ ch, s: ['…'] }]
  function pack(ink, tol) {
    return (ink || []).map((c) => ({ ch: String(c.ch || ''), s: (c.strokes || []).map((st) => packStroke(st, tol == null ? 0.0015 : tol)).filter((x) => x.length >= 4) }));
  }
  function unpack(strokes) { return (strokes || []).map((c) => ({ ch: c.ch, strokes: (c.s || []).map(unpackStroke) })); }

  // UTF-8 byte length of the stored record (no TextEncoder needed)
  function utf8(str) {
    let n = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c < 0x80) n += 1; else if (c < 0x800) n += 2;
      else if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; } else n += 3;
    }
    return n;
  }
  function measure(page) { const p = Object.assign({}, page, { bytes: 0 }); const n0 = utf8(JSON.stringify(p)); p.bytes = n0; return utf8(JSON.stringify(p)); }

  // ---- page records ------------------------------------------------------------------------------------------
  const cleanLabel = (t) => String(t == null ? '' : t).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL);
  // page: { kind?, word, reading, mode, ink? (raw strokes) | strokes? (packed), typeset?, label, id? }
  function makePage(s, o, now) {
    const mode = o.mode;
    const kind = KINDS.indexOf(o.kind) >= 0 ? o.kind : 'desk';
    if (kind === 'desk' && MODES.indexOf(mode) < 0) throw new Error('mode');
    const t = typeof now === 'number' ? now : Date.now(); // a record of when, never a gate
    const rec = { id: o.id || 'page-' + RB.practice.seq(s), kind, mode: mode || kind, label: cleanLabel(o.label) || 'Practice page', saved: false, created: o.created || t, updated: t, bytes: 0 };
    if (o.word != null) rec.word = String(o.word).slice(0, 64);
    if (o.reading != null) rec.reading = String(o.reading).slice(0, 64);
    if (o.item) rec.item = String(o.item).slice(0, 80);
    if (o.ink) rec.strokes = pack(o.ink);
    else if (o.strokes) rec.strokes = o.strokes.map((c) => ({ ch: String(c.ch || ''), s: (c.s || []).map(String) }));
    if (o.typeset) rec.typeset = JSON.parse(JSON.stringify(o.typeset));
    if (rec.strokes && !rec.strokes.some((c) => c.s.length)) delete rec.strokes;
    if (kind === 'desk' && mode !== 'typeset' && !rec.strokes) throw new Error('no strokes');
    if (kind === 'desk' && mode === 'typeset' && !rec.typeset) throw new Error('no typeset');
    if (kind === 'desk' && mode === 'typeset') delete rec.strokes; // a typeset page never carries handwriting
    // compact further while over budget (coarser simplification of the same strokes)
    rec.bytes = measure(rec);
    for (let tol = 0.004; rec.bytes > MAX_BYTES && rec.strokes && tol <= 0.064; tol *= 2) {
      rec.strokes = rec.strokes.map((c) => ({ ch: c.ch, s: c.s.map((x) => packStroke(unpackStroke(x), tol)) }));
      rec.bytes = measure(rec);
    }
    return rec;
  }
  const handwritten = (p) => !!(p && p.strokes && p.strokes.length && p.mode !== 'typeset');

  let chooser = null;
  function setChooser(fn) { chooser = typeof fn === 'function' ? fn : null; }
  function list(s) { const p = RB.practice.of(s); if (!Array.isArray(p.deskPages)) p.deskPages = []; return p.deskPages; }
  function pages(s, kind) { return list(s).filter((p) => p && typeof p === 'object' && (!kind || p.kind === kind)); }

  // Write the campaign so the pages are kept. Pages are marked saved only by a write
  // that succeeded; anything else says why it is not saved.
  async function persist(s) {
    const L = list(s);
    const was = L.map((p) => !!(p && p.saved));
    const sv = RB.save;
    if (!sv || !sv.current || !sv.autosave) return { saved: false, why: 'no-storage' };
    const cur = sv.current();
    if (!RB.game || RB.game.s !== s) return { saved: false, why: 'not-current' };
    if (!cur || cur.slot == null) return { saved: false, why: 'no-slot' };
    if (cur.readOnly) return { saved: false, why: 'read-only' };
    const session = sv.status && sv.status().mode === 'session';
    if (!session) L.forEach((p) => { if (p && typeof p === 'object') p.saved = true; });
    let rec = null;
    try { rec = await sv.autosave('progress'); } catch (e) { rec = null; }
    if (!rec) { L.forEach((p, i) => { if (p && typeof p === 'object') p.saved = was[i] === true; }); return { saved: false, why: 'error' }; }
    if (session) return { saved: false, why: 'session' };
    return { saved: true };
  }

  async function keepPage(s, page) {
    if (!s || !RB.practice.of(s)) return { ok: false, error: 'no-campaign' };
    let rec;
    try { rec = makePage(s, page || {}); } catch (e) { return { ok: false, error: 'invalid', why: 'invalid' }; }
    rec.bytes = measure(rec);
    if (rec.bytes > MAX_BYTES) return { ok: false, error: 'too-large', why: 'too-large', bytes: rec.bytes, page: rec };
    const L = list(s);
    const before = L.slice();
    let replaced = null, updated = false;
    const at = L.findIndex((x) => x && x.id === rec.id);
    if (at >= 0) { rec.created = L[at].created || rec.created; L[at] = rec; updated = true; }
    else if (L.length >= MAX_PAGES) {
      // six pages are kept: only an explicit choice replaces one (with previews), or nothing happens
      const pick = chooser ? await chooser(s, L.slice(), rec) : null;
      if (!pick || !pick.replace) return { ok: false, cancelled: true, why: 'cancelled', page: rec };
      if (RB.game && RB.game.s && RB.game.s !== s) return { ok: false, cancelled: true, why: 'cancelled', error: 'campaign-changed', page: rec };
      const L2 = list(s);
      const j = L2.findIndex((x) => x && x.id === pick.replace);
      if (j < 0) return { ok: false, cancelled: true, why: 'cancelled', error: 'gone', page: rec };
      replaced = L2[j].id;
      before.length = 0; before.push(...L2);
      L2.splice(j, 1, rec);
      unpoint(s, replaced);
    } else L.push(rec);
    const sv = await persist(s);
    if (!sv.saved && sv.why === 'error') {
      // the write was refused: put the pages back so ordinary saving keeps working;
      // the new art stays on screen, marked unsaved (the caller keeps `page`)
      const L3 = list(s);
      L3.length = 0; L3.push(...before);
      rec.saved = false;
      return { ok: false, saved: false, why: 'error', error: 'storage', page: rec };
    }
    return { ok: true, id: rec.id, replaced: replaced || undefined, updated: updated || undefined, saved: !!sv.saved, why: sv.why, page: rec };
  }
  // the practice shelf / pinned display never points at a page that is gone
  function unpoint(s, id) {
    const d = RB.practice.of(s).mementoDisplay;
    if (!d) return;
    if (d.shelf === 'desk:' + id) d.shelf = null;
    if (d.pin === 'desk:' + id) d.pin = null;
  }
  function rename(s, id, label) {
    const p = list(s).find((x) => x && x.id === id);
    if (!p) return false;
    const l = cleanLabel(label);
    if (!l) return false;
    p.label = l;
    p.updated = Date.now();
    p.bytes = measure(p);
    return true;
  }
  // explicit removal only (the player chose "Remove this page" and confirmed)
  function removePage(s, id) {
    const L = list(s);
    const i = L.findIndex((x) => x && x.id === id);
    if (i < 0) return false;
    L.splice(i, 1);
    unpoint(s, id);
    return true;
  }

  // ---- learning records for one desk task -----------------------------------------------------------------
  // trace / copy: the model was in view → motor or copying practice, never recall;
  // typeset: decoration (the word, its reading and meaning were shown);
  // prompt: one ordinary assessment unless the answer was exposed (the model, the
  // answer, the chart or other help, or the word was shown earlier in this sitting).
  function record(s, ob, objId, card, mode, res, o) {
    o = o || {};
    if (mode === 'trace' || mode === 'copy') {
      ob.assess(objId, card.item, { firstTry: true, mode: 'hand' }, { kind: 'copying', exposed: true, s });
      RB.practice.tally(s, 'desk', { [mode]: 1 });
      return { counted: false, exposed: true };
    }
    if (mode === 'typeset') {
      RB.learn.markIntroduced(card.item);
      RB.practice.tally(s, 'desk', { typeset: 1 });
      return { counted: false, exposed: true };
    }
    if (mode === 'prompt') {
      if (!res || res.cancelled) return { counted: false, exposed: false };
      const exposed = !!(o.exposed || res.assisted);
      const counted = ob.assess(objId, (o.step && o.step.item) || card.item, res, { kind: 'copying', exposed, s });
      RB.practice.tally(s, 'desk', { prompt: 1, promptExposed: exposed ? 1 : 0 });
      return { counted, exposed };
    }
    return { counted: false, exposed: false };
  }
  function remember(s, last) { const d = RB.practice.of(s).desk; d.last = Object.assign({}, d.last, last); }

  // ---- loading: pages read from storage are saved; unknown records are kept ----------------------------------
  function migrate(st) {
    const p = st && st.practice;
    if (!p) return;
    if (!Array.isArray(p.deskPages)) p.deskPages = [];
    for (const pg of p.deskPages) if (pg && typeof pg === 'object') pg.saved = true;
  }

  // ---- Practice mementos: the desk's kept pages ------------------------------------------------------------
  RB.practice.addMementoSource({
    id: 'desk', order: 30,
    list(s) {
      return pages(s, 'desk').map((p) => ({
        id: p.id, page: p, handwriting: handwritten(p),
        title: { jp: p.word ? ruby(p.word, p.reading) : '', en: p.label },
        kind: handwritten(p) ? 'Your handwriting · ' + ({ trace: 'traced', copy: 'copied beside the model', prompt: 'written from a prompt' }[p.mode] || p.mode) : 'Typeset practice page — not handwriting',
        note: p.saved ? '' : 'Not saved yet',
        draw: (cv, o) => (RB.ui && RB.ui.deskPage ? RB.ui.deskPage.draw(cv, p, o) : null),
        html: p.mode === 'typeset' && RB.ui && RB.ui.deskPage ? () => RB.ui.deskPage.typesetHtml(p) : null,
      }));
    },
  });

  return {
    MAX_PAGES, MAX_BYTES, MAX_LABEL, MAX_CLUSTERS, MODES, PLACES, here, placeOf, unlocked,
    graphemes, writable, cards, notebookCards, find, forms, ruby,
    pack, unpack, packStroke, unpackStroke, utf8, measure, makePage, handwritten,
    setChooser, pages, keepPage, persist, rename, removePage, record, remember, migrate,
    chooser: () => chooser,
  };
})();
