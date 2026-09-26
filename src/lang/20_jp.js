/* RB.jp — Japanese line markup: parse, render (ruby HTML), plain/reading text,
 * validation, table-driven deinflection and lightbulb lookup.
 * See docs/LANGUAGE.md for the markup specification. No DOM access. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.jp = (function () {
  'use strict';
  const K = RB.kana;
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);

  // Punctuation split off from word tokens (ー is a kana, not punctuation).
  const PUNCT = new Set(Array.from(
    '。、！？「」『』…‥―・（）〜～，．：；【】〈〉《》“”‘’〔〕♪　—–!?,.:;"()~\n'
  ));
  const OPENERS = new Set(Array.from('「『（【〈《“‘〔('));
  const isPunct = (ch) => PUNCT.has(ch);

  let defaultVars = {};
  function setVars(v) {
    defaultVars = Object.assign({}, v || {});
  }
  function mergedVars(v) {
    return Object.assign({}, defaultVars, v || {});
  }

  // ---- tokenizer --------------------------------------------------------------
  // Splits on single ASCII spaces, keeping spaces inside {…} and =(…).
  function splitRaw(line) {
    const out = [];
    let cur = '';
    let brace = 0;
    let paren = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (paren > 0) {
        cur += c;
        if (c === '(') paren++;
        else if (c === ')') paren--;
        continue;
      }
      if (c === '=' && line[i + 1] === '(' && brace === 0) {
        cur += '=(';
        i++;
        paren = 1;
        continue;
      }
      if (c === '{') brace++;
      else if (c === '}') brace = Math.max(0, brace - 1);
      if (c === ' ' && brace === 0) {
        if (cur) out.push(cur);
        cur = '';
        continue;
      }
      cur += c;
    }
    if (cur) out.push(cur);
    return out;
  }

  function findTopLevel(s, needle) {
    let brace = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '{') brace++;
      else if (c === '}') brace = Math.max(0, brace - 1);
      else if (brace === 0 && s.startsWith(needle, i)) return i;
    }
    return -1;
  }

  function punctToken(ch) {
    return { surface: ch, reading: ch, segs: [{ t: ch, r: null }], lemma: null, gloss: null, punct: true, ph: null };
  }

  // Parses one raw (space-delimited) token into one or more tokens.
  function parseRaw(raw, vars, errs) {
    let body = raw;
    let lemma = null;
    let gloss = null;
    let trailing = '';
    const gi = findTopLevel(raw, '=(');
    if (gi >= 0) {
      let depth = 0;
      let j = gi + 1;
      for (; j < raw.length; j++) {
        if (raw[j] === '(') depth++;
        else if (raw[j] === ')') {
          depth--;
          if (depth === 0) break;
        }
      }
      if (j >= raw.length) {
        errs.push({ code: 'unclosed_gloss', msg: 'Gloss "=(" is not closed with ")"', token: raw });
        gloss = raw.slice(gi + 2);
      } else {
        gloss = raw.slice(gi + 2, j);
        trailing = raw.slice(j + 1);
      }
      body = raw.slice(0, gi);
      if (!gloss.trim()) errs.push({ code: 'empty_gloss', msg: 'Empty =() gloss', token: raw });
      if (K.hasKanji(gloss)) errs.push({ code: 'kanji_in_gloss', msg: 'A gloss is shown as English help text; it must not contain bare kanji', token: raw });
      gloss = gloss.trim();
    }
    const ai = findTopLevel(body, '@');
    if (ai >= 0) {
      lemma = body.slice(ai + 1);
      body = body.slice(0, ai);
      // punctuation stuck to the end of the lemma belongs after the token
      let k = lemma.length;
      while (k > 0 && isPunct(lemma[k - 1])) k--;
      trailing = lemma.slice(k) + trailing;
      lemma = lemma.slice(0, k);
      if (!lemma) errs.push({ code: 'empty_lemma', msg: 'Empty @lemma', token: raw });
      if (lemma.includes('{')) lemma = plainOfSegs(scanSegs(lemma, vars, [])); // tolerate markup in lemma
    }
    const out = [];
    const words = [];
    let segs = [];
    const flush = () => {
      if (!segs.length) return;
      const tk = makeWord(segs);
      out.push(tk);
      words.push(tk);
      segs = [];
    };
    scanBody(body, vars, errs, raw, (piece) => {
      if (piece.punct) {
        flush();
        out.push(punctToken(piece.t));
      } else segs.push(piece);
    });
    flush();
    if (words.length) {
      const last = words[words.length - 1];
      last.lemma = lemma || null;
      last.gloss = gloss;
    } else if (lemma || gloss != null) {
      errs.push({ code: 'suffix_without_word', msg: '@lemma or =(gloss) without a word before it', token: raw });
    }
    for (const ch of trailing) {
      if (isPunct(ch)) out.push(punctToken(ch));
      else {
        errs.push({ code: 'text_after_gloss', msg: 'Only punctuation may follow =(gloss)', token: raw });
        out.push(makeWord([{ t: ch, r: null }]));
      }
    }
    return out;
  }

  // Walks a token body; emits {t, r, ph?} segments and {punct:true, t} pieces.
  function scanBody(body, vars, errs, raw, emit) {
    let plain = '';
    const flushPlain = () => {
      if (plain) emit({ t: plain, r: null });
      plain = '';
    };
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === '{') {
        flushPlain();
        const close = body.indexOf('}', i + 1);
        const nextOpen = body.indexOf('{', i + 1);
        if (close < 0) {
          errs.push({ code: 'unbalanced_braces', msg: 'Ruby group "{" is not closed', token: raw });
          plain += body.slice(i + 1);
          break;
        }
        if (nextOpen >= 0 && nextOpen < close) errs.push({ code: 'nested_brace', msg: 'Ruby groups cannot be nested', token: raw });
        const inner = body.slice(i + 1, close);
        const bar = inner.indexOf('|');
        if (bar < 0) {
          errs.push({ code: 'missing_bar', msg: 'Ruby group needs {base|reading}', token: raw });
          emit({ t: inner, r: null });
        } else {
          const b = inner.slice(0, bar);
          const r = inner.slice(bar + 1);
          if (r.includes('|')) errs.push({ code: 'extra_bar', msg: 'Ruby group has more than one "|"', token: raw });
          if (!b) errs.push({ code: 'empty_base', msg: 'Ruby group has an empty base', token: raw });
          if (!r) errs.push({ code: 'empty_reading', msg: 'Ruby group has an empty reading', token: raw });
          else if (K.hasKanji(r)) errs.push({ code: 'reading_has_kanji', msg: 'Ruby reading contains kanji: ' + r, token: raw });
          else if (!K.isKanaString(r.replace(/\|/g, ''))) errs.push({ code: 'reading_not_kana', msg: 'Ruby reading must be kana: ' + r, token: raw });
          emit({ t: b, r: r.replace(/\|/g, '') });
        }
        i = close;
        continue;
      }
      if (c === '}') {
        errs.push({ code: 'unbalanced_braces', msg: 'Stray "}"', token: raw });
        continue;
      }
      if (c === '|') {
        errs.push({ code: 'stray_bar', msg: 'Stray "|" outside a ruby group', token: raw });
        continue;
      }
      if (c === '$') {
        const m = /^\$([A-Za-z][A-Za-z0-9]*)/.exec(body.slice(i));
        if (!m) {
          errs.push({ code: 'bad_placeholder', msg: '"$" must be followed by a placeholder name', token: raw });
          plain += c;
          continue;
        }
        flushPlain();
        const name = m[1];
        const v = vars && Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : null;
        emit({ t: v != null ? v : '$' + name, r: null, ph: name });
        i += m[0].length - 1;
        continue;
      }
      if (isPunct(c)) {
        flushPlain();
        emit({ punct: true, t: c });
        continue;
      }
      plain += c === '_' ? ' ' : c;
    }
    flushPlain();
  }
  function scanSegs(body, vars, errs) {
    const segs = [];
    scanBody(body, vars, errs, body, (p) => {
      if (!p.punct) segs.push(p);
    });
    return segs;
  }
  function plainOfSegs(segs) {
    return segs.map((s) => s.t).join('');
  }
  function makeWord(segs) {
    const surface = segs.map((s) => s.t).join('');
    const reading = segs.map((s) => (s.r != null ? s.r : s.t)).join('');
    const ph = segs.find((s) => s.ph);
    return { surface, reading, segs, lemma: null, gloss: null, punct: false, ph: ph ? ph.ph : null };
  }

  // parse(line[, vars]) → tokens. Placeholders are substituted when vars given.
  function parse(line, vars, _errs) {
    const errs = _errs || [];
    if (typeof line !== 'string') {
      errs.push({ code: 'not_string', msg: 'Line is not a string' });
      return [];
    }
    const v = vars ? mergedVars(vars) : Object.keys(defaultVars).length ? mergedVars() : null;
    const out = [];
    for (const raw of splitRaw(line)) out.push(...parseRaw(raw, v, errs));
    // Context for lookup: the word token directly before (no punctuation between).
    for (let i = 1; i < out.length; i++) if (!out[i].punct && !out[i - 1].punct) out[i].after = out[i - 1].surface;
    return out;
  }

  // ---- output ---------------------------------------------------------------
  function plain(line, vars) {
    return parse(line, mergedVars(vars)).map((t) => t.surface).join('');
  }
  function reading(line, vars) {
    return parse(line, mergedVars(vars)).map((t) => t.reading).join('');
  }
  function segHtml(s, furi) {
    if (s.r != null && furi) return '<ruby>' + esc(s.t) + '<rt>' + esc(s.r) + '</rt></ruby>';
    return esc(s.t);
  }
  /* render(line, {spacing, vars, furigana}) → {html, tokens}
   * Word tokens → <span class="jt" data-i="N" tabindex="0">…</span> (N indexes
   * tokens); ruby → <ruby>漢<rt>かん</rt></ruby>; punctuation is not wrapped. */
  function render(line, opts) {
    opts = opts || {};
    const furi = opts.furigana !== false;
    const tokens = parse(line, mergedVars(opts.vars));
    let html = '';
    let prevWord = false;
    tokens.forEach((tk, i) => {
      if (tk.punct) {
        html += tk.surface === '\n' ? '<br>' : esc(tk.surface);
        prevWord = false;
        return;
      }
      if (opts.spacing && prevWord) html += ' ';
      html += '<span class="jt" data-i="' + i + '" tabindex="0">' + tk.segs.map((s) => segHtml(s, furi)).join('') + '</span>';
      prevWord = true;
    });
    return { html, tokens };
  }

  // Mixed text: English (or any text) with optional {漢字|かんじ} ruby groups.
  // Everything else is escaped verbatim (spaces kept). Used for help text,
  // grammar explanations and feedback messages.
  function renderMixed(text, opts) {
    const furi = !opts || opts.furigana !== false;
    return String(text == null ? '' : text).split(/(\{[^{}|]*\|[^{}|]*\})/).map((part) => {
      const m = /^\{([^{}|]*)\|([^{}|]*)\}$/.exec(part);
      return m ? segHtml({ t: m[1], r: m[2] }, furi) : esc(part);
    }).join('');
  }
  function plainMixed(text) {
    return String(text == null ? '' : text).replace(/\{([^{}|]*)\|([^{}|]*)\}/g, '$1');
  }
  function validateMixed(text) {
    const probs = [];
    const s = String(text == null ? '' : text);
    s.split(/(\{[^{}|]*\|[^{}|]*\})/).forEach((part) => {
      const m = /^\{([^{}|]*)\|([^{}|]*)\}$/.exec(part);
      if (m) {
        if (!m[1]) probs.push({ code: 'empty_base', msg: 'Ruby group has an empty base', token: part });
        if (!m[2]) probs.push({ code: 'empty_reading', msg: 'Ruby group has an empty reading', token: part });
        else if (!K.isKanaString(m[2])) probs.push({ code: 'reading_not_kana', msg: 'Ruby reading must be kana', token: part });
      } else {
        if (/[{}|]/.test(part)) probs.push({ code: 'unbalanced_braces', msg: 'Malformed ruby group', token: part });
        for (const ch of part) if (K.isKanji(ch)) { probs.push({ code: 'kanji_outside_ruby', msg: 'Kanji without furigana: ' + ch, token: part }); break; }
      }
    });
    return probs;
  }

  /* validate(line) → [{code, msg, token}]. Empty list = OK. */
  function validate(line) {
    const errs = [];
    const tokens = parse(line, null, errs);
    for (const tk of tokens) {
      if (tk.punct) continue;
      for (const s of tk.segs) {
        if (s.r == null && !s.ph && K.hasKanji(s.t)) {
          errs.push({ code: 'kanji_outside_ruby', msg: 'Kanji without furigana in "' + tk.surface + '"', token: tk.surface });
          break;
        }
      }
    }
    return errs;
  }

  /* rubyize(w, r) → markup with okurigana aligned, e.g. ('食べる','たべる') →
   * '{食|た}べる'; falls back to a word-level group '{今日|きょう}'. */
  function rubyize(w, r) {
    w = String(w || '');
    r = String(r || '');
    if (!K.hasKanji(w)) return w;
    if (!r || w === r) return w;
    const runs = [];
    for (const ch of w) {
      const kan = K.isKanji(ch);
      const last = runs[runs.length - 1];
      if (last && last.kan === kan) last.t += ch;
      else runs.push({ kan, t: ch });
    }
    const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('^' + runs.map((x) => (x.kan ? '(.+?)' : escRe(K.toHira(x.t)))).join('') + '$');
    const m = re.exec(K.toHira(r));
    if (!m) return '{' + w + '|' + r + '}';
    let gi = 1;
    return runs.map((x) => (x.kan ? '{' + x.t + '|' + m[gi++] + '}' : x.t)).join('');
  }

  // ---- deinflection -----------------------------------------------------------
  // Type flags (bitmask). A rule applies to the source word, or to a candidate
  // whose type intersects rule.inM; the result gets type rule.outM.
  const T = { V1: 1, V5: 2, VK: 4, VS: 8, ADJ: 16, NOUN: 32, NA: 64, TE: 128, TA: 256, KS: 512, ARU: 1024 };
  const VERB = T.V1 | T.V5 | T.VK | T.VS | T.KS | T.ARU;
  const TYPE_NAMES = [[T.V1, 'v1'], [T.V5, 'v5'], [T.KS, 'v5k-s'], [T.ARU, 'v5aru'], [T.VK, 'vk'], [T.VS, 'vs'], [T.ADJ, 'adj-i'], [T.NOUN, 'n'], [T.NA, 'adj-na'], [T.TE, 'te'], [T.TA, 'ta']];
  const typeName = (m) => TYPE_NAMES.filter(([f]) => m & f).map(([, n]) => n).join('|');

  // Godan dictionary ending → [a, i, e, o, te, ta]
  const G5 = {
    う: ['わ', 'い', 'え', 'お', 'って', 'った'],
    く: ['か', 'き', 'け', 'こ', 'いて', 'いた'],
    ぐ: ['が', 'ぎ', 'げ', 'ご', 'いで', 'いだ'],
    す: ['さ', 'し', 'せ', 'そ', 'して', 'した'],
    つ: ['た', 'ち', 'て', 'と', 'って', 'った'],
    ぬ: ['な', 'に', 'ね', 'の', 'んで', 'んだ'],
    ぶ: ['ば', 'び', 'べ', 'ぼ', 'んで', 'んだ'],
    む: ['ま', 'み', 'め', 'も', 'んで', 'んだ'],
    る: ['ら', 'り', 'れ', 'ろ', 'って', 'った'],
  };
  const COL = { a: 0, i: 1, e: 2, o: 3, te: 4, ta: 5 };
  // Irregular stems: [stem, dictionary form]
  const SURU = { a: ['し'], i: ['し'], te: ['して'], ta: ['した'] };
  const KURU = { a: ['こ', '来'], i: ['き', '来'], te: ['きて', '来て'], ta: ['きた', '来た'] };

  const RULES = [];
  function rule(from, to, inM, outM, d, extra) {
    RULES.push(Object.assign({ from, to, inM, outM, d }, extra || {}));
  }
  // Adds a suffix to every verb class. col: which stem the suffix attaches to.
  function verbRule(col, suffix, inM, d, extra) {
    extra = extra || {};
    // ichidan: stem = dictionary form minus る (a/i stems identical)
    if (col === 'a' || col === 'i') rule(suffix, 'る', inM, T.V1, d, extra);
    else if (col === 'te') rule('て' + suffix, 'る', inM, T.V1, d, extra);
    else if (col === 'ta') rule('た' + suffix, 'る', inM, T.V1, d, extra);
    // る-ending godan rules also serve the honorific v5aru verbs (おっしゃって, いらっしゃらない…)
    for (const end in G5) rule(G5[end][COL[col]] + suffix, end, inM, end === 'る' && col !== 'i' ? (T.V5 | T.ARU) : T.V5, d, extra);
    if (col === 'te' || col === 'ta') {
      // 行く: 行って / 行った
      rule((col === 'te' ? 'って' : 'った') + suffix, 'く', inM, T.KS, d, extra);
    }
    if (col === 'i') rule('い' + suffix, 'る', inM, T.ARU, d, extra); // いらっしゃいます etc.
    if (SURU[col]) SURU[col].forEach((st) => rule(st + suffix, 'する', inM, T.VS, d, Object.assign({ whole: true }, extra)));
    if (KURU[col]) KURU[col].forEach((st) => rule(st + suffix, st === '来' || st.startsWith('来') ? '来る' : 'くる', inM, T.VK, d, Object.assign({ whole: true }, extra)));
  }

  // Polite ～ます family
  verbRule('i', 'ます', 0, 'polite (～ます)');
  verbRule('i', 'ました', T.TA, 'polite past (～ました)');
  verbRule('i', 'ません', 0, 'polite negative (～ません)');
  verbRule('i', 'ませんでした', T.TA, 'polite past negative (～ませんでした)');
  verbRule('i', 'ましょう', 0, 'polite volitional: "let\'s …" (～ましょう)');
  verbRule('i', 'まして', T.TE, 'polite て-form (～まして)');
  // Plain past / て-form (te:true marks the bare て-form step)
  verbRule('ta', '', T.TA, 'past (～た)');
  verbRule('te', '', T.TE, 'て-form (～て)', { te: true });
  // Negative (the ない form behaves like an い-adjective)
  verbRule('a', 'ない', T.ADJ, 'negative (～ない)');
  verbRule('a', 'ず', 0, 'negative, written style (～ず)');
  verbRule('a', 'ずに', 0, 'without doing (～ずに)');
  verbRule('a', 'ざる', 0, 'negative, classical attributive (～ざる)');
  verbRule('a', 'ぬ', 0, 'negative, old-fashioned (～ぬ)');
  rule('せず', 'する', 0, T.VS, 'negative, written style (～ず)', { whole: true });
  rule('せずに', 'する', 0, T.VS, 'without doing (～ずに)', { whole: true });
  rule('せざる', 'する', 0, T.VS, 'negative, classical attributive (～ざる)', { whole: true });
  // Desire
  verbRule('i', 'たい', T.ADJ, 'want to (～たい)');
  verbRule('i', 'なさい', 0, 'firm polite command (～なさい)');
  verbRule('i', 'そう', T.NA, 'looks like it will … (～そう)');
  verbRule('i', 'すぎる', T.V1, 'too much (～すぎる)');
  verbRule('i', 'ながら', 0, 'while (～ながら)');
  verbRule('i', 'やすい', T.ADJ, 'easy to (～やすい)');
  verbRule('i', '', 0, 'stem form (used in compounds and polite patterns)', { stem: true });
  verbRule('i', 'にくい', T.ADJ, 'hard to (～にくい)');
  // Volitional
  rule('よう', 'る', 0, T.V1, 'volitional: "let\'s …" / "I\'ll …" (～よう)');
  for (const end in G5) rule(G5[end][COL.o] + 'う', end, 0, T.V5, 'volitional: "let\'s …" / "I\'ll …" (～おう)');
  rule('しよう', 'する', 0, T.VS, 'volitional: "let\'s …" / "I\'ll …" (～よう)', { whole: true });
  rule('こよう', 'くる', 0, T.VK, 'volitional: "let\'s …" / "I\'ll …" (～よう)', { whole: true });
  rule('来よう', '来る', 0, T.VK, 'volitional: "let\'s …" / "I\'ll …" (～よう)', { whole: true });
  // Conditional ～ば
  rule('れば', 'る', 0, T.V1, 'conditional (～ば)');
  for (const end in G5) rule(G5[end][COL.e] + 'ば', end, 0, T.V5, 'conditional (～ば)');
  rule('すれば', 'する', 0, T.VS, 'conditional (～ば)', { whole: true });
  rule('くれば', 'くる', 0, T.VK, 'conditional (～ば)', { whole: true });
  rule('来れば', '来る', 0, T.VK, 'conditional (～ば)', { whole: true });
  // ～たら / ～たり (on top of the past form)
  rule('たら', 'た', 0, T.TA, 'conditional (～たら)');
  rule('だら', 'だ', 0, T.TA, 'conditional (～たら)');
  rule('たり', 'た', 0, T.TA, 'listing actions (～たり)');
  rule('だり', 'だ', 0, T.TA, 'listing actions (～たり)');
  rule('なら', '', 0, VERB | T.ADJ | T.NOUN | T.TA, 'conditional "if (that is the case)" (～なら)');
  // Imperative / prohibition
  rule('ろ', 'る', 0, T.V1, 'imperative (command form)');
  rule('よ', 'る', 0, T.V1, 'imperative, written style (～よ)');
  for (const end in G5) rule(G5[end][COL.e], end, 0, T.V5, 'imperative (command form)');
  rule('しろ', 'する', 0, T.VS, 'imperative (command form)', { whole: true });
  rule('せよ', 'する', 0, T.VS, 'imperative, written style (～せよ)', { whole: true });
  rule('こい', 'くる', 0, T.VK, 'imperative (command form)', { whole: true });
  rule('来い', '来る', 0, T.VK, 'imperative (command form)', { whole: true });
  rule('い', 'る', 0, T.ARU, 'imperative / request form');
  rule('るな', 'る', 0, T.V1 | T.V5, 'prohibition "don\'t …" (～な)');
  for (const end in G5) if (end !== 'る') rule(end + 'な', end, 0, T.V5, 'prohibition "don\'t …" (～な)');
  rule('するな', 'する', 0, T.VS, 'prohibition "don\'t …" (～な)', { whole: true });
  rule('くるな', 'くる', 0, T.VK, 'prohibition "don\'t …" (～な)', { whole: true });
  rule('来るな', '来る', 0, T.VK, 'prohibition "don\'t …" (～な)', { whole: true });
  // Passive / potential (results are ichidan verbs, so they can inflect further)
  rule('られる', 'る', T.V1, T.V1, 'passive or potential (～られる)');
  rule('れる', 'る', T.V1, T.V1, 'potential, casual form without ら (～れる)');
  for (const end in G5) {
    rule(G5[end][COL.a] + 'れる', end, T.V1, T.V5, 'passive (～れる)');
    rule(G5[end][COL.e] + 'る', end, T.V1, T.V5, 'potential "can …" (～える)');
    rule(G5[end][COL.a] + 'せる', end, T.V1, T.V5, 'causative "make / let …" (～せる)');
    if (end !== 'す') rule(G5[end][COL.a] + 'される', end, T.V1, T.V5, 'causative-passive "be made to …" (～される)');
  }
  rule('される', 'する', T.V1, T.VS, 'passive (～される)', { whole: true });
  rule('させる', 'する', T.V1, T.VS, 'causative "make / let …" (～させる)', { whole: true });
  rule('こられる', 'くる', T.V1, T.VK, 'passive or potential (～られる)', { whole: true });
  rule('来られる', '来る', T.V1, T.VK, 'passive or potential (～られる)', { whole: true });
  rule('させる', 'る', T.V1, T.V1, 'causative "make / let …" (～させる)');
  rule('こさせる', 'くる', T.V1, T.VK, 'causative "make / let …" (～させる)', { whole: true });
  rule('来させる', '来る', T.V1, T.VK, 'causative "make / let …" (～させる)', { whole: true });
  // ～て + auxiliary (afterTe: the bare て-form step before it is folded away)
  const TE_AUX = [
    ['いる', T.V1, '～ている: ongoing action or resulting state'],
    ['る', T.V1, 'casual ～てる (= ～ている)'],
    ['しまう', T.V5, '～てしまう: completely / regrettably'],
    ['おく', T.V5, '～ておく: do in advance / leave as is'],
    ['ある', T.V5, '～てある: has been done (and stays that way)'],
    ['いく', T.V5 | T.KS, '～ていく: go on doing / do and go'],
    ['くる', T.VK, '～てくる: start to / do and come back'],
    ['みる', T.V1, '～てみる: try doing'],
    ['あげる', T.V1, '～てあげる: do for someone'],
    ['くれる', T.V1, '～てくれる: someone does (it) for me/us'],
    ['もらう', T.V5, '～てもらう: have someone do (it) for me'],
    ['いただく', T.V5, '～ていただく: humbly receive a favour'],
    ['ください', 0, 'request "please …" (～てください)'],
    ['も', 0, 'even if / even though (～ても)'],
    ['は', 0, '～ては: if / when (often before a warning)'],
    ['から', 0, 'after doing (～てから)'],
  ];
  TE_AUX.forEach(([aux, inM, d]) => {
    rule('て' + aux, 'て', inM, T.TE, d, { afterTe: true });
    rule('で' + aux, 'で', inM, T.TE, d, { afterTe: true });
  });
  rule('ちゃう', 'て', T.V5, T.TE, 'casual ～ちゃう (= ～てしまう)', { afterTe: true });
  rule('じゃう', 'で', T.V5, T.TE, 'casual ～じゃう (= ～でしまう)', { afterTe: true });
  rule('とく', 'て', T.V5, T.TE, 'casual ～とく (= ～ておく)', { afterTe: true });
  rule('どく', 'で', T.V5, T.TE, 'casual ～どく (= ～でおく)', { afterTe: true });
  rule('ちゃ', 'て', 0, T.TE, 'casual ～ちゃ (= ～ては)', { afterTe: true });
  // ～ない compounds
  rule('ないで', 'ない', 0, T.ADJ, 'without doing / don\'t (～ないで)');
  rule('ないでください', 'ない', 0, T.ADJ, 'request "please don\'t …" (～ないでください)');
  rule('なければならない', 'ない', T.ADJ, T.ADJ, 'obligation "must …" (～なければならない)');
  rule('なければいけない', 'ない', T.ADJ, T.ADJ, 'obligation "must …" (～なければいけない)');
  rule('なくてはならない', 'ない', T.ADJ, T.ADJ, 'obligation "must …" (～なくてはならない)');
  rule('なくてはいけない', 'ない', T.ADJ, T.ADJ, 'obligation "must …" (～なくてはいけない)');
  rule('なくてもいい', 'ない', 0, T.ADJ, '"don\'t have to …" (～なくてもいい)');
  rule('なきゃ', 'ない', 0, T.ADJ, 'casual "must …" (～なきゃ)');
  rule('なくちゃ', 'ない', 0, T.ADJ, 'casual "must …" (～なくちゃ)');
  // い-adjectives (also ない / たい forms, which inflect like adjectives)
  rule('かった', 'い', T.TA, T.ADJ, 'past (～かった)');
  rule('くない', 'い', T.ADJ, T.ADJ, 'negative (～くない)');
  rule('くて', 'い', T.TE, T.ADJ, 'て-form (～くて)');
  rule('ければ', 'い', 0, T.ADJ, 'conditional (～ければ)');
  rule('く', 'い', 0, T.ADJ, 'adverb form (～く)');
  rule('さ', 'い', T.NOUN, T.ADJ, 'noun form: "-ness" (～さ)');
  rule('そう', 'い', T.NA, T.ADJ, 'looks … (～そう)');
  rule('すぎる', 'い', T.V1, T.ADJ, 'too … (～すぎる)');
  rule('くなる', 'い', T.V5, T.ADJ, 'become … (～くなる)');
  rule('くする', 'い', T.VS, T.ADJ, 'make (something) … (～くする)');
  // いい / よい (いい inflects on the よい stem)
  [['よかった', T.TA, 'past (～かった)'], ['よくない', T.ADJ, 'negative (～くない)'], ['よくて', T.TE, 'て-form (～くて)'],
    ['よければ', 0, 'conditional (～ければ)'], ['よさそう', T.NA, 'looks … (～そう)'], ['よく', 0, 'adverb form (～く)']]
    .forEach(([f, inM, d]) => rule(f, 'いい', inM, T.ADJ, d, { whole: true }));
  // Copula after nouns / な-adjectives (cop: lookup prefers to show these as a
  // separate word, e.g. 先生 + です).
  const COP = { cop: true };
  rule('です', '', 0, T.NOUN | T.ADJ | T.TA, 'polite ～です', COP);
  rule('でした', '', T.TA, T.NOUN, 'polite past "was" (～でした)', COP);
  rule('だ', '', 0, T.NOUN, 'plain "is" (～だ)', COP);
  rule('だった', '', T.TA, T.NOUN, 'plain past "was" (～だった)', COP);
  rule('じゃない', '', T.ADJ, T.NOUN, 'plain negative "is not" (～じゃない)', COP);
  rule('ではない', '', T.ADJ, T.NOUN, 'plain negative "is not" (～ではない)', COP);
  rule('じゃありません', '', 0, T.NOUN, 'polite negative "is not" (～じゃありません)', COP);
  rule('ではありません', '', 0, T.NOUN, 'polite negative "is not" (～ではありません)', COP);
  rule('じゃありませんでした', '', 0, T.NOUN, 'polite past negative "was not" (～じゃありませんでした)', COP);
  rule('ではありませんでした', '', 0, T.NOUN, 'polite past negative "was not" (～ではありませんでした)', COP);
  rule('でしょう', '', 0, T.NOUN | VERB | T.ADJ | T.TA, 'probably / "…, right?" (～でしょう)', COP);
  rule('だろう', '', 0, T.NOUN | VERB | T.ADJ | T.TA, 'probably, plain (～だろう)', COP);
  rule('な', '', 0, T.NA, 'な before a noun (な-adjective)');
  rule('に', '', 0, T.NA, 'adverb form (～に)');

  const RULE_INDEX = new Map();
  RULES.forEach((r) => {
    const k = r.from.slice(-1);
    if (!RULE_INDEX.has(k)) RULE_INDEX.set(k, []);
    RULE_INDEX.get(k).push(r);
  });

  const deinflectCache = new Map();
  function deinflectRaw(word) {
    if (deinflectCache.has(word)) return deinflectCache.get(word);
    const results = [{ base: word, mask: 0, rules: [] }];
    const seen = new Set([word + '|0']);
    for (let i = 0; i < results.length && results.length < 400; i++) {
      const cur = results[i];
      if (cur.rules.length >= 7) continue;
      const bucket = (RULE_INDEX.get(cur.base.slice(-1)) || []).concat(RULE_INDEX.get('') || []);
      for (const r of bucket) {
        if (cur.mask !== 0 && (cur.mask & r.inM) === 0) continue;
        if (!cur.base.endsWith(r.from)) continue;
        const stem = cur.base.slice(0, cur.base.length - r.from.length);
        if (!stem && !r.whole) continue;
        const base = stem + r.to;
        if (!base) continue;
        const key = base + '|' + r.outM;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({ base, mask: r.outM, rules: cur.rules.concat([r]) });
      }
    }
    const out = results.slice(1);
    if (deinflectCache.size > 3000) deinflectCache.clear();
    deinflectCache.set(word, out);
    return out;
  }
  // Human-readable steps, from the dictionary form outward.
  function describe(rulesOuterFirst) {
    const inner = rulesOuterFirst.slice().reverse();
    const out = [];
    for (let i = 0; i < inner.length; i++) {
      if (inner[i].te && inner[i + 1] && inner[i + 1].afterTe) continue;
      out.push(inner[i].d);
    }
    return out;
  }
  /* deinflect(word[, {known:true}]) → [{base, rules:[plain-English steps,
   * base outward], type}]. With known:true only bases that exist in the
   * lexicon with a compatible part of speech are returned. */
  function deinflect(word, opts) {
    let list = deinflectRaw(String(word || ''));
    if (opts && opts.known && RB.lex) {
      list = list.filter((c) => RB.lex.bySurface(c.base).concat(K.hasKanji(c.base) ? [] : RB.lex.byReading(c.base))
        .some((e) => posMask(e.pos) & c.mask));
    }
    return list.map((c) => ({ base: c.base, rules: describe(c.rules), type: typeName(c.mask) }));
  }

  // POS code → compatible type mask
  function posMask(pos) {
    if (!pos) return 0;
    if (pos === 'v1') return T.V1;
    if (pos === 'v5k-s') return T.V5 | T.KS;
    if (pos === 'v5aru') return T.ARU;
    if (/^v5/.test(pos)) return T.V5;
    if (pos === 'vk') return T.VK;
    if (pos === 'vs-i') return T.VS;
    if (pos === 'adj-i' || pos === 'adj-ii') return T.ADJ;
    if (pos === 'adj-na') return T.NOUN | T.NA;
    if (pos === 'n' || pos === 'pn' || pos === 'name' || pos === 'vs' || pos === 'ctr' || pos === 'num') return T.NOUN;
    return 0;
  }

  // ---- lookup -----------------------------------------------------------------
  const LV_ORDER = { F: 0, E: 1, I: 2, A: 3 };
  const FUNC_POS = new Set(['prt', 'aux']);
  const AFFIX_POS = new Set(['prt', 'aux', 'pref', 'suf']);
  const hira = (s) => K.toHira(s);
  const lex = () => RB.lex;

  function lvRank(e) {
    return LV_ORDER[e.lv] != null ? LV_ORDER[e.lv] : 9;
  }
  // Auxiliary verbs that commonly follow a て-form (～ている, ～ておく …).
  const TE_AUX_LEMMAS = new Set(['いる', 'ある', '置く', 'しまう', '見る', '行く', '来る', 'あげる', 'くれる', 'もらう', 'いただく', 'ください', 'くださる', '欲しい', 'おる', 'いらっしゃる', 'いける']);
  /* Ranking. A match spelled exactly as written (e.g. する for した) beats a
   * kana spelling of a word normally written in kanji (下 for した); fewer
   * inflection steps win; a lemma hint or a preceding て-form can decide. */
  function pick(cands, prefer, readingH, ctx) {
    const score = (c) => {
      let s = 0;
      if (prefer && (c.e.w === prefer || hira(c.e.r) === hira(prefer))) s -= 1000;
      if (c.readOk) s -= 100;
      if (ctx && ctx.teAux && TE_AUX_LEMMAS.has(c.e.w)) s -= 60;
      const n = c.rules ? c.rules.length : 0;
      if (!n) s -= c.surf ? 50 : 20;
      else s += n * 3 - (c.surf ? 30 : 10);
      if (c.rules && c.rules.some((r) => r.stem)) s += 20;
      s += lvRank(c.e);
      return s;
    };
    const sorted = cands.slice().sort((a, b) => score(a) - score(b));
    return sorted;
  }

  // Analyse a single unit (no splitting). Returns {entry, forms, others} | null.
  function analyseUnit(surface, readingStr, prefer, opts) {
    const L = lex();
    if (!L || !surface) return null;
    opts = opts || {};
    const rh = hira(readingStr || surface);
    const kanaOnly = !K.hasKanji(surface);
    const cands = [];
    const add = (e, rules, surf, readOk) => {
      if (!cands.some((c) => c.e === e)) cands.push({ e, rules, surf, readOk });
    };
    const exact = L.get(surface, rh);
    if (exact) add(exact, [], true, true);
    L.bySurface(surface).forEach((e) => add(e, [], true, hira(e.r) === rh));
    if (kanaOnly) L.byReading(rh).forEach((e) => add(e, [], false, true));
    // Kana-only tokens are ambiguous (した: 下 or する), so inflected readings
    // are always considered; direct matches still rank first.
    if (!cands.length || kanaOnly || (prefer && !cands.some((c) => c.e.w === prefer))) {
      const readBases = kanaOnly ? null : new Set(deinflectRaw(rh).map((c) => c.base));
      const dcs = deinflectRaw(surface);
      for (const c of dcs) {
        if (opts.noCop && c.rules.some((r) => r.cop)) continue;
        const tryEntries = (list, surf) => {
          list.forEach((e) => {
            if (posMask(e.pos) & c.mask) {
              const readOk = readBases ? readBases.has(hira(e.r)) : true;
              add(e, c.rules, surf, readOk);
            }
          });
        };
        tryEntries(L.bySurface(c.base), true);
        if (kanaOnly) tryEntries(L.byReading(hira(c.base)), false);
        if ((c.mask & T.VS) && c.base.endsWith('する') && c.base.length > 2) {
          const stem = c.base.slice(0, -2);
          const list = L.bySurface(stem).concat(kanaOnly ? L.byReading(hira(stem)) : []);
          list.forEach((e) => {
            if (e.pos === 'vs' && !cands.some((x) => x.e === e)) {
              cands.push({ e, rules: c.rules, surf: true, readOk: true, suru: true });
            }
          });
        }
      }
    }
    if (!cands.length) return null;
    const sorted = pick(cands, prefer, rh, opts.ctx);
    const best = sorted[0];
    const forms = best.rules && best.rules.length ? describe(best.rules) : [];
    if (best.suru) forms.unshift('する-verb: ' + best.e.w + 'する');
    return { entry: best.e, forms, others: sorted.slice(1, 6).map((c) => c.e), inflected: !!(best.rules && best.rules.length) };
  }

  // Allowed split points of a token: not inside a ruby group. Returns an array
  // of {s: surfaceIndex, r: readingIndex}.
  function splitPoints(tk) {
    const pts = [{ s: 0, r: 0 }];
    let s = 0;
    let r = 0;
    for (const seg of tk.segs) {
      if (seg.r != null || seg.ph) {
        s += seg.t.length;
        r += (seg.r != null ? seg.r : seg.t).length;
        pts.push({ s, r });
      } else {
        for (const ch of seg.t) {
          s += ch.length;
          r += ch.length;
          pts.push({ s, r });
        }
      }
    }
    // dedupe
    return pts.filter((p, i) => i === 0 || p.s !== pts[i - 1].s);
  }

  function isFuncEntry(e) {
    return e && FUNC_POS.has(e.pos);
  }
  // Grammatical words that behave like endings after a clause.
  const GRAM_TAIL = new Set(['そう', 'よう', 'みたい', 'はず', 'わけ', 'つもり', 'こと', 'もの', 'ため', 'まま', 'かもしれない', 'かもしれません', 'ところ']);
  // Function words (particles / copula / grammatical nouns) that may trail a word.
  function funcUnit(surface) {
    const L = lex();
    let list = L.bySurface(surface).filter((e) => isFuncEntry(e));
    if (!list.length && GRAM_TAIL.has(surface)) list = L.bySurface(surface).concat(L.byReading(surface)).filter((e) => !K.hasKanji(e.w) || e.w === '所');
    return list.length ? list[0] : null;
  }
  function segmentFunc(surface) {
    // fewest-parts segmentation of surface into function words
    const n = surface.length;
    const best = new Array(n + 1).fill(null);
    best[n] = [];
    for (let i = n - 1; i >= 0; i--) {
      for (let j = n; j > i; j--) {
        if (!best[j]) continue;
        const e = funcUnit(surface.slice(i, j));
        if (!e) continue;
        const cand = [{ surface: surface.slice(i, j), entry: e }].concat(best[j]);
        if (!best[i] || cand.length < best[i].length) best[i] = cand;
      }
    }
    return best[0];
  }

  function partInfo(surface, readingStr, a) {
    const e = a && a.entry;
    const isPrt = e && (e.pos === 'prt');
    return {
      surface,
      reading: readingStr,
      entry: e || null,
      lemma: e ? e.w : surface,
      forms: (a && a.forms) || [],
      romaji: e && e.ro ? e.ro : K.romaji(readingStr, { particle: !!isPrt }),
      meaning: e ? e.m : null,
    };
  }

  function normToken(t) {
    if (t && typeof t === 'object') {
      const surface = t.surface != null ? String(t.surface) : '';
      return {
        surface,
        reading: t.reading != null ? String(t.reading) : surface,
        segs: t.segs || [{ t: surface, r: null }],
        lemma: t.lemma || null,
        gloss: t.gloss || null,
        punct: !!t.punct,
        ph: t.ph || null,
        after: t.after || null,
      };
    }
    const toks = parse(String(t == null ? '' : t));
    const w = toks.filter((x) => !x.punct);
    if (toks.length === 1) return toks[0];
    if (w.length === 1) return w[0];
    if (!toks.length) return makeWord([{ t: '', r: null }]);
    // several words given as one string: merge into one token
    const segs = [];
    toks.forEach((x) => segs.push(...x.segs));
    const m = makeWord(segs);
    m.lemma = w.length ? w[w.length - 1].lemma : null;
    m.gloss = w.length ? w[w.length - 1].gloss : null;
    return m;
  }

  /* lookup(token) — token from parse()/render(), or a markup/plain string.
   * → { surface, entry|null, lemma, forms, reading, romaji, mora, gloss,
   *     meaning, parts?, others, unknown, punct?, name? } */
  function lookup(token) {
    const tk = normToken(token);
    const surface = tk.surface;
    const rd = tk.reading;
    const res = {
      surface, entry: null, lemma: null, forms: [], reading: rd, romaji: '', mora: K.mora(rd),
      gloss: tk.gloss || null, meaning: tk.gloss || null, parts: null, others: [], unknown: true,
    };
    if (tk.punct) {
      res.punct = true;
      res.romaji = K.romaji(rd);
      return res;
    }
    const setRomaji = (e) => {
      res.romaji = e && e.ro ? e.ro : K.romaji(rd, { particle: !!(e && e.pos === 'prt') });
    };
    // Placeholder-only token (the player's or companion's name)
    if (tk.ph && tk.segs.length === 1) {
      res.name = tk.ph;
      res.lemma = surface;
      res.unknown = false;
      res.romaji = K.romaji(rd);
      return res;
    }
    const prefer = tk.lemma || null;
    // After a て-form, auxiliaries such as おく (置く) or みる (見る) are likely.
    const ctx = { teAux: !!(tk.after && /[てで]$/.test(tk.after)) };
    const finish = (entry, forms, others) => {
      res.entry = entry;
      res.lemma = entry ? entry.w : prefer || surface;
      res.forms = forms || [];
      res.others = others || [];
      res.unknown = !entry;
      if (!res.gloss && entry) res.meaning = entry.m;
      setRomaji(entry);
      return res;
    };

    // 1–5: the whole token as one unit (lemma hint preferred). Copula endings
    // after nouns are left to the split step so です shows as its own word.
    const whole = analyseUnit(surface, rd, prefer, { noCop: true, ctx });
    if (whole && (!prefer || whole.entry.w === prefer || hira(whole.entry.r) === hira(prefer))) {
      return finish(whole.entry, whole.forms, whole.others);
    }

    // 6: known word + trailing particle(s)/copula, then general segmentation.
    const parts = splitToken(tk, prefer, ctx);
    if (parts) {
      res.parts = parts;
      const head = parts.find((p) => p.name) || parts.find((p) => p.entry && !AFFIX_POS.has(p.entry.pos)) || parts.find((p) => p.entry) || parts[0];
      if (head.name) res.name = head.name;
      res.entry = head.entry;
      res.lemma = head.lemma;
      res.forms = head.forms;
      res.unknown = false;
      if (!res.gloss) res.meaning = head.meaning;
      res.romaji = parts.map((p) => p.romaji).join(' ');
      if (!prefer || head.lemma === prefer || parts.some((p) => p.entry && p.entry.w === prefer)) return res;
    }
    // Lemma hint that the analysis did not reach: trust the author.
    if (prefer) {
      const L = lex();
      const ents = L.bySurface(prefer).concat(K.hasKanji(prefer) ? [] : L.byReading(hira(prefer)));
      if (ents.length) {
        res.parts = null;
        return finish(ents[0], [], ents.slice(1, 6));
      }
    }
    if (parts) return res;
    if (whole) return finish(whole.entry, whole.forms, whole.others);
    return finish(null, [], []);
  }

  function splitToken(tk, prefer, ctx) {
    const surface = tk.surface;
    if (surface.length < 2 || surface.length > 30) return null;
    const pts = splitPoints(tk);
    const rd = tk.reading;
    const memo = new Map();
    const unit = (a, b) => {
      const key = a.s + ':' + b.s;
      if (memo.has(key)) return memo.get(key);
      const s = surface.slice(a.s, b.s);
      const r = rd.slice(a.r, b.r);
      let out = null;
      // placeholder segment inside a longer token
      const seg = tk.segs.find((sg) => sg.ph && sg.t === s);
      if (seg) out = { ph: seg.ph, info: { surface: s, reading: r, entry: null, lemma: s, forms: [], romaji: K.romaji(r), meaning: null, name: seg.ph } };
      else {
        const an = analyseUnit(s, r, prefer, { noCop: true, ctx: a.s === 0 ? ctx : null });
        if (an) {
          const e = an.entry;
          const kanaOnly = !K.hasKanji(s);
          // single kana is only trusted for particles and affixes
          if (!(kanaOnly && s.length === 1 && !AFFIX_POS.has(e.pos))) out = { info: partInfo(s, r, an), weak: kanaOnly && an.inflected && K.hasKanji(e.w) };
        }
      }
      memo.set(key, out);
      return out;
    };
    // (a) head word + trailing function words, longest head first
    for (let k = pts.length - 2; k >= 1; k--) {
      const p = pts[k];
      const tail = surface.slice(p.s);
      const fs = segmentFunc(tail);
      if (!fs) continue;
      const head = unit(pts[0], p);
      if (!head) continue;
      const parts = [head.info];
      let ri = p.r;
      fs.forEach((f) => {
        const r = rd.slice(ri, ri + f.surface.length);
        ri += f.surface.length;
        parts.push(partInfo(f.surface, r, { entry: f.entry, forms: [] }));
      });
      return parts;
    }
    // (b) general segmentation into known units (lowest cost, longest first).
    // A kana spelling of an inflected kanji word is weak evidence, so it costs
    // more than splitting into plainly spelled words (雪だそうです → 雪+だ+そう+です).
    const n = pts.length - 1;
    const best = new Array(n + 1).fill(null);
    const cost = new Array(n + 1).fill(Infinity);
    best[n] = [];
    cost[n] = 0;
    for (let i = n - 1; i >= 0; i--) {
      for (let j = n; j > i; j--) {
        if (!best[j] || (i === 0 && j === n)) continue;
        const u = unit(pts[i], pts[j]);
        if (!u) continue;
        const c = cost[j] + (u.weak ? 2.1 : 1);
        if (c < cost[i] - 1e-9) {
          cost[i] = c;
          best[i] = [u.info].concat(best[j]);
        }
      }
    }
    return best[0] && best[0].length > 1 ? best[0] : null;
  }

  return {
    PUNCT, isPunct, setVars, parse, plain, reading, render, validate,
    renderMixed, plainMixed, validateMixed, rubyize, esc,
    deinflect, lookup, posMask, _rules: RULES, _types: T,
  };
})();
