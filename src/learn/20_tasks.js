/* Task generation. A "step" is one language interaction:
 *   {kind:'write', item, prompt:{en,jp}, ctx, template:{before,after}, answer, accept[], mode, choices?, explain, script}
 *   {kind:'choose', item, prompt, ctx, options:[{jp,en,ok,why}], explain}
 *   {kind:'order', item, prompt, ctx, tiles:[...], answer:[...], alts:[[...]], explain}
 * Authored steps come from challenges/drills; others are generated from
 * mastery items. For Foundations, only taught kana are ever asked for; other
 * characters are shown pre-filled (spec §10: help before testing). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.content.drills = RB.content.drills || [];
RB.content.addDrills = function (list, tag) {
  for (const d of list) {
    if (tag && !d.tags) d.tags = [tag];
    RB.content.drills.push(d);
  }
};

RB.tasks = (function () {
  'use strict';
  const LV = { F: 0, E: 1, I: 2, A: 3 };

  function profile() {
    return RB.game.s ? RB.game.s.learn.profile : 'F';
  }
  function plain(s) {
    return RB.jp && RB.jp.plain ? RB.jp.plain(s) : String(s).replace(/\{([^|}]+)\|[^}]+\}/g, '$1').replace(/ /g, '');
  }
  function readingOf(s) {
    return RB.jp && RB.jp.reading ? RB.jp.reading(s).replace(/\s/g, '') : plain(s);
  }

  // ---- lexicon helpers ------------------------------------------------------------
  let kanaWords = null;
  function kanaWordIndex() {
    if (kanaWords) return kanaWords;
    kanaWords = [];
    if (!RB.lex) return kanaWords;
    for (const e of RB.lex.all()) {
      if (!e || !e.r || e.pos === 'prt' || e.pos === 'aux' || e.pos === 'suf') continue;
      if (e.w !== e.r && !(RB.kana.isKanaString && RB.kana.isKanaString(e.w))) {
        // kanji words are fine too: we ask for the kana reading
      }
      if (e.r.length < 2 || e.r.length > 5) continue;
      if (!RB.kana.isKanaString(e.r)) continue;
      kanaWords.push(e);
    }
    return kanaWords;
  }
  function wordsWith(ch, known) {
    return kanaWordIndex().filter((e) => e.r.indexOf(ch) >= 0 && (e.lv === 'F' || e.lv === 'E') && Array.from(e.r).every((c) => c === ch || known(c)));
  }
  function wordLabel(e) {
    return e.w !== e.r ? e.w : e.r;
  }

  // ---- item → step --------------------------------------------------------------------
  function kanaStep(ch, opts) {
    opts = opts || {};
    const known = (c) => RB.learn.kanaKnown(c);
    const ws = wordsWith(ch, known);
    const rom = RB.kana.romaji(ch);
    const kata = RB.kana.isKata(ch);
    if (ws.length && !opts.bare) {
      const r = RB.util.rng((RB.learn.clock() * 7919 + ch.charCodeAt(0)) | 0);
      const e = r.pick(ws);
      const word = kata ? RB.kana.toKata(e.r) : e.r;
      const i = word.indexOf(ch);
      return {
        kind: 'write', item: 'k:' + ch, answer: ch, accept: [ch], mode: 'kana', script: kata ? 'kata' : 'hira',
        prompt: { en: 'Complete the word “' + e.m + '”: write the missing ' + (kata ? 'katakana' : 'hiragana') + ' (' + rom + ').', jp: '' },
        template: { before: word.slice(0, i), after: word.slice(i + 1) },
        word: { w: e.w, r: word, m: e.m },
        explain: { en: word + ' (' + RB.kana.romaji(word) + ') — ' + e.m + '.' },
        single: true,
      };
    }
    return {
      kind: 'write', item: 'k:' + ch, answer: ch, accept: [ch], mode: 'kana', script: kata ? 'kata' : 'hira',
      prompt: { en: 'Write the ' + (kata ? 'katakana' : 'hiragana') + ' for “' + rom + '”.' },
      explain: { en: ch + ' is read ' + rom + '.' }, single: true,
    };
  }
  // "in hiragana", "in katakana", "in hiragana or in kanji" … for a lexicon entry's recall task
  function scriptAsk(e) { return askScript(e.r, e.w); }
  // the script a written answer is accepted in, named (RBN-02): "in hiragana", "in katakana", or
  // "in hiragana, or in kanji" when the written form `w` is also accepted
  function askScript(r, w) {
    const sc = RB.kana.isKata(String(r || '')[0]) ? 'katakana' : 'hiragana';
    return w && w !== r ? 'in ' + sc + ', or in kanji' : 'in ' + sc;
  }
  function vocabStep(key, opts) {
    opts = opts || {};
    const e = findWord(key);
    if (!e) return null;
    const r = RB.learn.rec('v:' + e.w);
    const recall = opts.recall != null ? opts.recall : r.box >= 2;
    const allKnown = Array.from(e.r).every((c) => RB.learn.kanaKnown(c));
    if (recall && allKnown) {
      return {
        kind: 'write', item: 'v:' + e.w, answer: e.r, accept: e.w !== e.r ? [e.r, e.w] : [e.r], mode: 'reading',
        script: RB.kana.isKata(e.r[0]) ? 'kata' : 'hira',
        // the prompt states exactly what the check accepts: the word's own kana script (and
        // its kanji spelling, when it has one); the other kana script is not this word
        prompt: { en: 'Write the word for “' + e.m + '” ' + scriptAsk(e) + '.' },
        explain: { en: wordLabel(e) + (e.w !== e.r ? '（' + e.r + '）' : '') + ' — ' + e.m + (e.n ? '. ' + e.n : '.') },
      };
    }
    // recognition: show the word, choose its meaning
    const pool = kanaWordIndex().filter((x) => x.m !== e.m && x.pos === e.pos && x.w !== e.w);
    const rr = RB.util.rng((RB.learn.clock() * 104729 + e.r.length) | 0);
    const wrong = rr.shuffle(pool).slice(0, 3);
    const jp = e.w !== e.r ? '{' + e.w + '|' + e.r + '}' : e.w;
    return {
      kind: 'choose', item: 'v:' + e.w,
      prompt: { en: 'What does this word mean?' }, ctx: { jp, big: true },
      options: [{ en: e.m, ok: true }].concat(wrong.map((w) => ({ en: w.m, ok: false, why: { en: 'That would be ' + wordLabel(w) + '（' + w.r + '）.' } }))),
      explain: { en: wordLabel(e) + '（' + e.r + '）: ' + e.m + (e.n ? '. ' + e.n : '') },
    };
  }
  function findWord(key) {
    if (!RB.lex) return null;
    const [w, r] = key.split('|');
    return (r && RB.lex.get(w, r)) || (RB.lex.bySurface(w) || [])[0] || (RB.lex.byReading(w) || [])[0] || null;
  }
  function drillsFor(item) {
    return RB.content.drills.filter((d) => d.item === item || (Array.isArray(d.item) && d.item.indexOf(item) >= 0));
  }
  function fromItem(id, opts) {
    const k = id.slice(0, 1), v = id.slice(2);
    if (k === 'k') return kanaStep(v, opts);
    if (k === 'v') {
      const d = drillsFor(id);
      if (d.length && Math.random() < 0.5) return clone(RB.util.rng(RB.learn.clock()).pick(d));
      return vocabStep(v, opts);
    }
    const d = drillsFor(id);
    if (!d.length) return null;
    return clone(RB.util.rng((RB.learn.clock() * 13) | 0).pick(d));
  }
  function clone(o) {
    return RB.util.deepClone(o);
  }

  // Drills matching tags at the player's level (or nearest lower level).
  function drillPool(tags, lv) {
    lv = lv || profile();
    const want = LV[lv];
    const ok = (d) => !tags || !tags.length || (d.tags || []).some((t) => tags.indexOf(t) >= 0);
    for (let l = want; l >= 0; l--) {
      const ds = RB.content.drills.filter((d) => LV[d.lv] === l && ok(d));
      if (ds.length) return ds;
    }
    return [];
  }

  // Pool of item ids for the current profile, e.g. for a battle knot.
  function itemPool(spec) {
    const p = profile();
    spec = spec || {};
    if (p === 'F' && RB.learn.taughtKana()) {
      const t = RB.learn.taughtKana();
      const kana = Object.keys(t).filter((c) => t[c]);
      const extra = (spec.F || []).filter((id) => id.startsWith('v:') || (id.startsWith('k:') && t[id.slice(2)]));
      return kana.map((c) => 'k:' + c).concat(extra);
    }
    const base = (spec[p] || []).slice();
    const drills = drillPool(spec.tags, p).map((d) => (Array.isArray(d.item) ? d.item[0] : d.item) || 'd:' + d.id);
    if (p === 'F') {
      // Foundations with kana already known: basic kana plus the spec's words
      const H = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
      const set = RB.game.s.learn.kanaKnown === 'both' ? H + RB.kana.toKata(H) : H;
      return Array.from(set).map((c) => 'k:' + c).concat(base, drills);
    }
    return base.concat(drills);
  }
  // Build one step for a pool item id (handles 'd:' drill ids).
  function stepFor(id) {
    if (id.startsWith('d:')) {
      const d = RB.content.drills.find((x) => x.id === id.slice(2));
      return d ? clone(d) : null;
    }
    return fromItem(id);
  }
  // Pick and build a knot/practice step from a spec, with sensible fallbacks.
  function next(spec, opts) {
    opts = opts || {};
    const pool = itemPool(spec);
    const ids = RB.learn.pick(pool, 4, opts);
    for (const id of ids) {
      const st = stepFor(id);
      if (st) return prepare(st);
    }
    // Fallback: a kana the player knows (or any basic kana).
    const t = RB.learn.taughtKana();
    const kana = t ? Object.keys(t) : ['あ', 'い', 'う', 'え', 'お'];
    return prepare(kanaStep(kana[Math.floor(Math.random() * kana.length)] || 'あ', { bare: true }));
  }

  // Adapt an authored step to the player's profile and knowledge.
  function prepare(step) {
    step = clone(step);
    if (step.kind === 'write' && profile() === 'F' && RB.learn.taughtKana() && (step.mode === 'kana' || step.mode === 'reading') && !step.single) {
      const ans = plain(step.answer);
      const chars = Array.from(ans);
      const knownIdx = chars.map((c, i) => (RB.kana.isKana(c) && RB.learn.kanaKnown(c) ? i : -1)).filter((i) => i >= 0);
      if (knownIdx.length < chars.length) {
        // Blank a single taught kana; everything else is shown.
        if (knownIdx.length) {
          const recs = knownIdx.map((i) => ({ i, r: RB.learn.rec('k:' + chars[i]) }));
          recs.sort((a, b) => a.r.box - b.r.box || a.r.last - b.r.last);
          const i = recs[0].i;
          const before = (step.template ? step.template.before : '') + chars.slice(0, i).join('');
          const after = chars.slice(i + 1).join('') + (step.template ? step.template.after : '');
          step.template = { before, after };
          step.fullAnswer = ans;
          step.answer = chars[i];
          step.accept = [chars[i]];
          step.mode = 'kana';
          step.item = ['k:' + chars[i]].concat(step.item ? [].concat(step.item) : []);
          step.prompt = { en: (step.prompt && step.prompt.en ? step.prompt.en + ' ' : '') + 'Write the missing kana (' + RB.kana.romaji(chars[i]) + ').' };
          step.single = true;
          // authored whole-word choices no longer fit a one-kana blank:
          // let the choice mode build kana options (answer + confusables)
          delete step.choices;
        } else {
          // Nothing taught yet in this answer: copy it with the model shown.
          step.copy = true;
          step.prompt = { en: (step.prompt && step.prompt.en ? step.prompt.en + ' ' : '') + 'Copy the inscription shown (it hasn\'t been taught yet — this is just practice).' };
        }
      }
    }
    return step;
  }

  // Resolve a challenge's steps for the current profile (or, for the Grow route, opts.profile: L18).
  function stepsOf(ch, opts) {
    const p = (opts && opts.profile) || profile();
    if (ch.tiers) {
      for (let l = LV[p]; l >= 0; l--) {
        const key = Object.keys(LV).find((k) => LV[k] === l);
        if (ch.tiers[key]) return ch.tiers[key].map(prepare);
      }
      for (let l = LV[p] + 1; l <= 3; l++) {
        const key = Object.keys(LV).find((k) => LV[k] === l);
        if (ch.tiers[key]) return ch.tiers[key].map(prepare);
      }
    }
    return (ch.steps || []).map(prepare);
  }

  return { fromItem, kanaStep, vocabStep, prepare, stepsOf, next, drillPool, itemPool, stepFor, findWord, plain, readingOf, kanaWordIndex, askScript, LV };
})();
