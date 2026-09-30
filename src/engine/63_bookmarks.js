/* Sentence bookmarks (addendum §20.1): "Keep this sentence" on the line in
 * the dialogue box, on a line in the dialogue history, or on a readable
 * inscription (the lines a sign, notice or tablet shows in the same box).
 *
 * A kept sentence is stored in the campaign (s.bookmarks) as it was shown:
 * the original Japanese with its reading markup, the placeholder values it
 * was shown with (the player's or companion's name then), the faithful
 * English as it read then, who said it or what it was written on, where,
 * and a compact reference to its source (scene, prop or encounter) with a
 * hash of the source text. The page never re-reads the source to display a
 * bookmark: a later content change cannot silently give it another meaning.
 * If the source line has changed or gone, the bookmark says it is a saved
 * excerpt (status()).
 *
 * Event-time context: every line shown in the dialogue box gets a small
 * context record on its dialogue-history entry (entry.k: map, source,
 * placeholder values, resolved English, the speaker's name then), so a line
 * kept later from the history is still truthful. History entries from before
 * this existed have none; a sentence kept from one says its names are shown
 * as they are now (approx).
 *
 * Keeping never records learning: no mastery, no counts, no introduction.
 * Optional practice from a kept sentence uses the game's own vocabulary
 * recognition template with real lexicon meanings and records nothing.
 *
 *   RB.bookmarks.capture(line, entry, s)   context for a line being shown
 *   RB.bookmarks.chose(opt, s)             context for a reply being chosen
 *   RB.bookmarks.keep(s, entry)            keep (returns the bookmark, or a reason)
 *   RB.bookmarks.find(s, entry)            the bookmark for this line, if kept
 *   RB.bookmarks.remove / rename / setNote
 *   RB.bookmarks.status(b)                 'ok' | 'changed' | 'removed' | 'unknown'
 *   RB.bookmarks.wordsOf(b)                lexicon words in a kept sentence
 *   RB.bookmarks.usesOf(s, noted)          kept sentences that use a noted word
 *   RB.bookmarks.practiceSteps(b, n)       optional practice steps (no record) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.bookmarks = (function () {
  'use strict';
  const MAX = 300;          // kept sentences per campaign (never evicted: Keep says when full)
  const TITLE_MAX = 60;     // characters (code points)
  const NOTE_MAX = 280;
  const PH = /\$([A-Za-z][A-Za-z0-9]*)/g;
  const hash = (jp, en) => RB.util.hashStr(String(jp || '') + '||' + String(en || '')).toString(36);

  // ---- user text: plain, bounded, no control or direction-override characters ----
  function clean(t, max, multiline) {
    let x = String(t == null ? '' : t).replace(/\r\n?/g, '\n');
    x = x.replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g : /[\u0000-\u001F\u007F-\u009F]/g, ' ');
    x = x.replace(/[\u200B-\u200F\u2028-\u202E\u2060-\u2069\uFEFF]/g, '');
    if (multiline) x = x.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    else x = x.replace(/\s+/g, ' ');
    x = x.trim();
    const cps = Array.from(x);
    return cps.length > max ? cps.slice(0, max).join('').trim() : x;
  }

  // ---- event-time context --------------------------------------------------------------------
  const placeholders = (jp) => { const out = []; String(jp || '').replace(PH, (m, k) => { if (out.indexOf(k) < 0) out.push(k); return m; }); return out; };
  function varsFor(jp) {
    const ks = placeholders(jp);
    if (!ks.length || !RB.script) return null;
    const all = RB.script.jpVars();
    const v = {};
    for (const k of ks) if (Object.prototype.hasOwnProperty.call(all, k)) v[k] = String(all[k]);
    return Object.keys(v).length ? v : null;
  }
  const liveMap = (s) => { const W = RB.world && RB.world.W; return (W && W.map && W.map.id) || (s && s.map) || null; };
  // the prop in front of the player (the one being read), when it is the source of this line
  function propInFront(line) {
    const W = RB.world && RB.world.W;
    if (!W || !W.map || !W.player || !RB.world.frontTile) return null;
    const [fx, fy] = RB.world.frontTile();
    for (const pr of W.map.props || []) {
      const pd = (RB.props && RB.props.P && RB.props.P[pr.p]) || {};
      const pw = pr.w || pd.w || 1, ph = pr.h || pd.h || 1;
      if (!(fx >= pr.x && fx < pr.x + pw && fy >= pr.y && fy < pr.y + ph)) continue;
      if (line.sceneId ? pr.scene === line.sceneId : pr.text && pr.text.jp === line.jp) return pr;
    }
    return null;
  }
  function sourceOf(line, s) {
    const m = liveMap(s);
    const inBattle = RB.combat && RB.combat.state && RB.combat.state();
    if (line.sceneId) {
      const pr = line.who === 'narr' && !inBattle ? propInFront(line) : null;
      return pr ? { k: 'sc', id: line.sceneId, o: pr.p, x: pr.x, y: pr.y } : { k: 'sc', id: line.sceneId };
    }
    if (inBattle) { const c = RB.combat.context && RB.combat.context(); return { k: 'bt', id: c ? c.id : null }; }
    const pr = line.who === 'narr' ? propInFront(line) : null;
    if (pr) return { k: 'pr', m, x: pr.x, y: pr.y, o: pr.p };
    return { k: 'ln' };
  }
  // Called for every line shown in the dialogue box (src/ui/20_dialogue.js):
  // the context is kept on the line's dialogue-history entry.
  let lastLine = null;
  function capture(line, entry, s) {
    s = s || (RB.game && RB.game.s);
    if (!line || !entry || !s) return null;
    flushChoice(s);
    lastLine = line;
    const k = { m: liveMap(s), src: sourceOf(line, s) };
    const v = varsFor(line.jp);
    if (v) k.v = v;
    const en = line.en && RB.script ? RB.script.enVars(line.en) : line.en || '';
    if (en !== (line.en || '')) k.e = en;
    if (line.who === 'pc') k.n = { en: s.player.name, jp: s.player.nameJp || s.player.name };
    entry.k = k;
    return k;
  }
  // A reply chosen from the choices: its history entry is added by the scene
  // runner right after, so the context waits here until that entry exists.
  let pendingChoice = null;
  function chose(opt, s) {
    s = s || (RB.game && RB.game.s);
    if (!opt || !s) return;
    // (the reply belongs to the scene of the line it answers)
    const cur = lastLine;
    const k = { m: liveMap(s), src: cur && cur.sceneId ? { k: 'sc', id: cur.sceneId } : { k: 'ln' } };
    const v = varsFor(opt.jp);
    if (v) k.v = v;
    const en = opt.en && RB.script ? RB.script.enVars(opt.en) : opt.en || '';
    if (en !== (opt.en || '')) k.e = en;
    k.n = { en: s.player.name, jp: s.player.nameJp || s.player.name };
    pendingChoice = { jp: opt.jp, en: opt.en, k, n: s.backlog.length };
    setTimeout(() => flushChoice(s), 0);
  }
  function flushChoice(s) {
    const p = pendingChoice;
    if (!p || !s || !s.backlog) return;
    for (let i = s.backlog.length - 1; i >= Math.max(0, p.n - 2); i--) {
      const e = s.backlog[i];
      if (e && e.choice && !e.k && e.jp === p.jp && e.en === p.en) { e.k = p.k; pendingChoice = null; return; }
    }
    if (s.backlog.length > p.n + 4) pendingChoice = null; // the reply was never recorded here: drop the wait
  }

  // ---- keeping -----------------------------------------------------------------------------------
  const eligible = (entry) => !!(entry && typeof entry.jp === 'string' && entry.jp.trim());
  const list = (s) => (Array.isArray(s.bookmarks) ? s.bookmarks : (s.bookmarks = []));
  // the English as it read when the line was shown (or now, for an old history entry)
  const enOf = (entry) => (entry.k && entry.k.e != null ? entry.k.e : entry.en && RB.script ? RB.script.enVars(entry.en) : entry.en || '');
  const keyOf = (who, jp, en) => hash(String(who || '') + '|' + jp, en);
  function find(s, entry) {
    if (!s || !eligible(entry)) return null;
    const key = keyOf(entry.who, entry.jp, enOf(entry));
    return list(s).find((b) => b.key === key) || null;
  }
  function placeName(mapId) {
    if (!mapId) return null;
    if (/^atlas\./.test(mapId)) return { en: 'The Unwritten Atlas', jp: '{書|か}かれて いない {地図|ちず}' };
    const d = RB.content.maps[mapId];
    return d && d.name ? { en: d.name.en, jp: d.name.jp || '' } : null;
  }
  function whoName(entry) {
    if (entry.who === 'narr') return null;
    if (entry.who === 'pc') {
      const n = entry.k && entry.k.n;
      const s = RB.game && RB.game.s;
      return n ? { en: n.en, jp: n.jp } : s ? { en: s.player.name, jp: s.player.nameJp || s.player.name } : null;
    }
    const c = RB.content.chars[entry.who];
    return c && c.name ? { en: c.name.en, jp: c.name.jp || '' } : { en: String(entry.who), jp: '' };
  }
  // Keep a line: a dialogue-history entry { who, jp, en, choice?, k? } or a
  // line being shown with its entry's context. Returns { ok, b } or { ok: false, why }.
  function keep(s, entry) {
    if (!s) return { ok: false, why: 'none' };
    if (!eligible(entry)) return { ok: false, why: 'ineligible' };
    const had = find(s, entry);
    if (had) return { ok: true, b: had, already: true };
    const L = list(s);
    if (L.length >= MAX) return { ok: false, why: 'full', max: MAX };
    const k = entry.k || null;
    const v = k ? k.v || null : varsFor(entry.jp);
    const en = enOf(entry);
    const src = k && k.src ? Object.assign({}, k.src) : { k: 'ln' };
    const map = (k && k.m) || (src.k === 'pr' ? src.m : null) || null;
    const b = {
      id: 'bm' + RB.util.uid(), t: Date.now(), key: keyOf(entry.who, entry.jp, en),
      jp: entry.jp, en, who: entry.who || 'narr', wn: whoName(entry),
      src, map, place: placeName(map), h: hash(entry.jp, entry.en), title: '', note: '',
    };
    if (v) b.v = v;
    if (src.o) b.obj = src.o;
    if (entry.choice) b.choice = true;
    if (!k) b.approx = true; // an old history entry: names are as they are now
    L.push(b);
    return { ok: true, b };
  }
  function byId(s, id) { return list(s).find((b) => b.id === id) || null; }
  function remove(s, id) {
    const L = list(s), i = L.findIndex((b) => b.id === id);
    if (i < 0) return false;
    L.splice(i, 1);
    return true;
  }
  function rename(s, id, title) { const b = byId(s, id); if (!b) return null; b.title = clean(title, TITLE_MAX, false); return b; }
  function setNote(s, id, note) { const b = byId(s, id); if (!b) return null; b.note = clean(note, NOTE_MAX, true); return b; }

  // ---- the source, now ---------------------------------------------------------------------------
  // 'ok': the line is still in its source; 'changed': the source exists but the
  // line (Japanese or English) is not there any more; 'removed': the source is
  // gone; 'unknown': no source that can be checked (a generated or unrecorded line).
  function status(b) {
    const src = (b && b.src) || {};
    const C = RB.content;
    const same = (jp, en) => jp != null && hash(jp, en) === b.h;
    const tierHas = (x) => {
      if (!x) return false;
      if (x.jp != null || x.en != null) return same(x.jp, x.en);
      return ['F', 'E', 'I', 'A'].some((t) => x[t] && same(x[t].jp, x[t].en));
    };
    if (src.k === 'sc') {
      const sc = C.scenes[src.id];
      if (!sc) return 'removed';
      for (const c of sc.cmds) {
        if (c.op === 'say' && same(c.jp, c.en)) return 'ok';
        if (c.op === 'choice' && c.opts.some((o) => same(o.jp, o.en))) return 'ok';
      }
      return 'changed';
    }
    if (src.k === 'pr') {
      const m = C.maps[src.m];
      if (!m) return 'removed';
      const pr = (m.props || []).find((p) => p.x === src.x && p.y === src.y && (!src.o || p.p === src.o));
      if (!pr) return 'removed';
      return pr.text && same(pr.text.jp, pr.text.en) ? 'ok' : 'changed';
    }
    if (src.k === 'bt') {
      const e = src.id && C.enemies[src.id];
      if (!e) return 'removed';
      if (tierHas(e.intro) || tierHas(e.settle) || (e.phases || []).some((p) => tierHas(p.line))) return 'ok';
      // a placement's own lines (a foe placed on a map)
      for (const id in C.maps) for (const f of C.maps[id].foes || []) {
        if (f.enemy !== src.id) continue;
        const pl = f.place || f;
        if (tierHas(pl.intro) || tierHas(pl.settle)) return 'ok';
      }
      return 'changed';
    }
    return 'unknown';
  }

  // ---- the words in a kept sentence ---------------------------------------------------------------
  const CONTENT = (e) => e && e.pos && ['prt', 'aux', 'suf', 'name', 'cop'].indexOf(e.pos) < 0;
  // (a kept sentence never changes, so its words are worked out once per session)
  const WORDS = new Map();
  function wordsOf(b) {
    if (!b) return [];
    const key = b.id + '|' + b.jp;
    if (!WORDS.has(key)) { if (WORDS.size > 1000) WORDS.clear(); WORDS.set(key, parseWords(b)); }
    return WORDS.get(key);
  }
  function parseWords(b) {
    const out = [];
    if (!RB.jp || !RB.jp.parse) return out;
    let toks;
    try { toks = RB.jp.parse(b.jp, Object.assign({}, b.v || {})); } catch (e) { return out; }
    for (const t of toks) {
      if (t.punct || t.ph || !/[぀-ヿ一-鿿々]/.test(t.surface)) continue;
      let info = null;
      try { info = RB.jp.lookup(t); } catch (e) { info = null; }
      if (!info || info.unknown) continue;
      out.push({ surface: t.surface, reading: t.reading, lemma: info.lemma || t.surface, entry: info.entry || null });
    }
    return out;
  }
  // A noted word (s.notebook, kind 'word', id 'w:<lemma>|<reading>') and the
  // kept sentences that use it: only sentences the player kept, so never a
  // line they have not seen.
  function notedLemma(n) { const x = String(n.id || '').slice(2).split('|')[0]; return x || n.surface || ''; }
  // every kept sentence by the words in it (dictionary form, surface, lexicon headword)
  function wordIndex(s) {
    const m = new Map();
    for (const b of list(s)) for (const w of wordsOf(b)) for (const k of [w.lemma, w.surface, w.entry && w.entry.w]) {
      if (!k) continue;
      let a = m.get(k);
      if (!a) m.set(k, (a = new Set()));
      a.add(b);
    }
    return m;
  }
  // idx: a wordIndex(s) to reuse when asking for several words
  function usesOf(s, n, idx) {
    idx = idx || wordIndex(s);
    const hit = new Set();
    for (const k of [notedLemma(n), n.surface]) for (const b of idx.get(k) || []) hit.add(b);
    return list(s).filter((b) => hit.has(b));
  }

  // ---- optional practice ------------------------------------------------------------------------------
  // The game's own word-recognition template (as RB.tasks.vocabStep builds it:
  // "What does this word mean?", the word with its reading, the lexicon
  // meaning as the one right option and other words' meanings of the same part
  // of speech as the rest) for up to n content words of the sentence. Built
  // here without RB.tasks.vocabStep because that reads the learning record
  // through RB.learn.rec, which creates records; these steps carry no learning
  // item, so running them records nothing (and the caller passes noRecord).
  // The option order comes from its own seeded generator, not a game stream.
  function practiceSteps(b, n) {
    const out = [], seen = new Set();
    if (!RB.tasks || !RB.tasks.kanaWordIndex) return out;
    const index = RB.tasks.kanaWordIndex();
    const label = (e) => (e.w !== e.r ? e.w : e.r);
    for (const w of wordsOf(b)) {
      const e = w.entry;
      if (!CONTENT(e) || !e.m || !e.r || seen.has(e.w)) continue;
      const pool = index.filter((x) => x.m !== e.m && x.pos === e.pos && x.w !== e.w && x.r !== e.r);
      if (pool.length < 2) continue;
      const rr = RB.util.rng(RB.util.hashStr(b.id + '|' + e.w) | 0);
      const wrong = rr.shuffle(pool.slice()).slice(0, 3);
      seen.add(e.w);
      out.push({
        kind: 'choose', fromBookmark: b.id,
        prompt: { en: 'What does this word mean?' }, ctx: { jp: e.w !== e.r ? '{' + e.w + '|' + e.r + '}' : e.w, big: true },
        options: [{ en: e.m, ok: true }].concat(wrong.map((x) => ({ en: x.m, ok: false, why: { en: 'That would be ' + label(x) + '（' + x.r + '）.' } }))),
        explain: { en: label(e) + '（' + e.r + '）: ' + e.m + (e.n ? '. ' + e.n : '') },
      });
      if (out.length >= (n || 3)) break;
    }
    return out;
  }

  // ---- load-time normalisation (RB.save.addMigration; registered from src/content/words) ----
  // Keeps every record; fills an id where one is missing; never invents history.
  function migrate(st) {
    if (!Array.isArray(st.bookmarks)) return;
    for (const b of st.bookmarks) {
      if (!b || typeof b !== 'object') continue;
      if (!b.id) b.id = 'bm' + RB.util.uid();
      if (typeof b.title !== 'string') b.title = '';
      if (typeof b.note !== 'string') b.note = '';
      if (!b.key && typeof b.jp === 'string') b.key = keyOf(b.who, b.jp, b.en || '');
    }
  }

  return { capture, chose, keep, find, remove, rename, setNote, byId, status, wordsOf, usesOf, wordIndex, practiceSteps, eligible, clean, migrate, placeName, MAX, TITLE_MAX, NOTE_MAX, _hash: hash };
})();
