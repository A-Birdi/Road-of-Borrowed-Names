/* RB.answers — answer evaluation, specific feedback, and distractors.
 * Recognition is separate: this module only judges *confirmed* text.
 * Feedback messages ("en") are mixed text (English + {漢字|かんじ} ruby) and
 * explain the language difference; they never mention the recognizer. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.answers = (function () {
  'use strict';
  const K = RB.kana;

  // ---- normalisation -----------------------------------------------------------
  const SENT_PUNCT = /[。、，．！？!?,.・「」『』"]/g;
  function normKana(s) {
    return K.widen(String(s == null ? '' : s).normalize('NFC')).trim().replace(/[\s　]+/g, '').replace(SENT_PUNCT, '');
  }
  const ARTICLES = new Set(['a', 'an', 'the']);
  function normMeaning(s) {
    let t = K.narrowAscii(String(s == null ? '' : s).normalize('NFC')).toLowerCase().trim();
    t = t.replace(/[’']/g, "'").replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim();
    let words = t.split(' ').filter(Boolean);
    if (words[0] === 'to' && words.length > 1) words = words.slice(1);
    words = words.filter((w) => !ARTICLES.has(w));
    return words.join('');
  }

  // Accepted answer → comparable forms
  function forms(acc, vars) {
    const surface = normKana(RB.jp.plain(acc, vars));
    const reading = normKana(RB.jp.reading(acc, vars));
    return { acc, surface, reading };
  }

  // ---- confusables (shape) -------------------------------------------------------
  // Each entry: [a, b, note]. Notes describe standard shape differences.
  const SHAPES = [
    ['さ', 'ち', 'In さ the lower curve opens to the right; in ち it opens to the left.'],
    ['き', 'さ', 'き has two horizontal strokes; さ has one.'],
    ['ぬ', 'め', 'ぬ ends with a small loop at the bottom right; め does not.'],
    ['ぬ', 'ね', 'ね starts with a vertical stroke on the left; ぬ starts with a short slanted stroke.'],
    ['ね', 'れ', 'ね ends in a small loop; れ ends with an outward flick.'],
    ['ね', 'わ', 'ね ends in a small loop; わ ends with an inward curve.'],
    ['れ', 'わ', 'れ ends with an outward flick; わ ends with an inward curve.'],
    ['る', 'ろ', 'る ends with a small loop at the bottom; ろ does not.'],
    ['は', 'ほ', 'ほ has an extra horizontal stroke closing the top of its right part; は does not.'],
    ['い', 'り', 'In り the right stroke is much longer than the left; い has two short strokes.'],
    ['こ', 'に', 'に has an extra vertical stroke on the left.'],
    ['あ', 'お', 'お has a separate dot at the upper right; あ does not.'],
    ['め', 'あ', 'あ has a horizontal stroke across the top; め does not.'],
    ['う', 'つ', 'う has a short stroke on top; つ is a single curve.'],
    ['ま', 'も', 'ま has two horizontal strokes crossing a vertical that ends in a loop; in も the vertical stroke curves up to the right.'],
    ['た', 'な', 'な ends in a loop at the bottom right; た has two short strokes instead.'],
    ['シ', 'ツ', 'In シ the two short strokes are on the left and the long stroke is written upward from the bottom; in ツ the short strokes are on top and the long stroke is written downward.'],
    ['ソ', 'ン', 'In ソ the short stroke is on top and the long stroke comes down from the top right; in ン the short stroke is on the left and the long stroke is written upward.'],
    ['シ', 'ン', 'シ has two short strokes; ン has one.'],
    ['ツ', 'ソ', 'ツ has two short strokes; ソ has one.'],
    ['ク', 'ケ', 'ケ has a horizontal stroke reaching out to the right with a vertical hanging from it; ク has a hooked top instead.'],
    ['ク', 'タ', 'タ has an extra short stroke inside; ク does not.'],
    ['ケ', 'タ', 'タ has a closed hooked top with a short stroke inside; ケ has a horizontal stroke with a vertical hanging from it.'],
    ['ウ', 'ワ', 'ウ has a short stroke on top; ワ has no top stroke.'],
    ['ワ', 'フ', 'ワ has a short vertical stroke on the left; フ is a single stroke.'],
    ['ウ', 'フ', 'ウ has a short stroke on top and a vertical on the left; フ is a single stroke.'],
    ['ヌ', 'ス', 'In ヌ the second stroke crosses the first; in ス it only touches it.'],
    ['コ', 'ユ', 'In ユ the bottom stroke extends past the vertical; コ is closed on the right.'],
    ['チ', 'テ', 'チ has a slanted top stroke and a vertical crossing the middle; テ has two horizontal strokes with a stroke hanging below.'],
    ['ア', 'マ', 'ア has a short stroke hanging down from the middle of the top stroke; マ has a short stroke at the bottom right instead.'],
    ['ノ', 'メ', 'メ adds a second stroke crossing ノ.'],
    ['ロ', 'コ', 'ロ is closed on all four sides; コ is open on the left.'],
    ['ル', 'レ', 'ル has two strokes; レ is a single stroke.'],
    ['ナ', 'メ', 'ナ has a horizontal stroke crossed by a vertical; メ has two crossing diagonals.'],
    ['ヘ', 'へ', 'The hiragana へ and the katakana ヘ look almost the same; the script of the rest of the word tells them apart.'],
    ['り', 'リ', 'The hiragana り and the katakana リ look very similar; the script of the rest of the word tells them apart.'],
    ['カ', 'か', 'か has an extra short stroke on the right; カ does not.'],
    ['キ', 'き', 'き has a curved stroke at the bottom; キ does not.'],
    ['セ', 'せ', 'The hiragana せ and katakana セ look similar; せ has two vertical strokes, セ one.'],
    ['ヤ', 'や', 'や has an extra short stroke; ヤ does not.'],
  ];
  const SHAPE_MAP = new Map();
  SHAPES.forEach(([a, b, note]) => {
    [[a, b], [b, a]].forEach(([x, y]) => {
      if (!SHAPE_MAP.has(x)) SHAPE_MAP.set(x, new Map());
      SHAPE_MAP.get(x).set(y, note);
    });
  });
  const confusablesOf = (ch) => (SHAPE_MAP.has(ch) ? Array.from(SHAPE_MAP.get(ch).keys()) : []);

  // ---- handwriting: one written shape, two characters ----------------------------
  // Characters written with the same shape (the recognizer's identical-shape
  // groups, checked against RB.recog by tests/unit/lang_answers.test.mjs).
  // A handwritten answer cannot show which one was meant, so with
  // {handwritten:true} they count as one form. Typed answers are never folded.
  const HAND_SAME = ['へヘ', 'べベ', 'ぺペ', 'ー一', 'ロ口', 'カ力', 'ニ二', 'エ工', 'チ千', 'タ夕', 'オ才'];
  const HAND_ONE = {};
  HAND_SAME.forEach((g) => Array.from(g).forEach((c) => { HAND_ONE[c] = g[0]; }));
  const handFold = (s) => Array.from(s).map((c) => HAND_ONE[c] || c).join('');

  // A common reading of a single kanji, for furigana where there is no word
  // context (a handwritten character on the pad, a quoted character in
  // feedback): the first 33 kanji the handwriting pad could read (a kun
  // reading, or the stem a learner meets first: 大 おお(きい), 入 い(る)), then
  // the kanji's own word in the lexicon, then the reading the game's text uses
  // most for it (RB.kanjiRead via RB.kanjiInfo.readings; every kanji the game
  // displays has one, but 々, which repeats the kanji before it).
  // Accepted answers are shown with the word's own reading instead.
  const KANJI_READ = {
    一: 'いち', 二: 'に', 三: 'さん', 十: 'じゅう', 人: 'ひと', 口: 'くち', 日: 'ひ', 月: 'つき', 山: 'やま', 川: 'かわ', 木: 'き',
    水: 'みず', 火: 'ひ', 土: 'つち', 石: 'いし', 田: 'た', 力: 'ちから', 大: 'おお', 小: 'ちい', 上: 'うえ', 下: 'した', 中: 'なか',
    名: 'な', 手: 'て', 目: 'め', 雨: 'あめ', 本: 'ほん', 入: 'い', 出: 'で', 王: 'おう', 門: 'もん', 心: 'こころ', 花: 'はな',
  };
  function kanjiReading(ch) {
    if (KANJI_READ[ch]) return KANJI_READ[ch];
    const e = RB.lex ? RB.lex.bySurface(ch).find((x) => x.r && K.isKanaString(x.r) && !/^(suf|pref|name)$/.test(x.pos)) : null;
    if (e) return e.r;
    const rs = RB.kanjiInfo && RB.kanjiInfo.readings ? RB.kanjiInfo.readings(ch) : [];
    return rs.length ? rs[0] : null;
  }
  // Markup for text the player wrote: each kanji gets its reading on its own
  // where one is known ('み水' → 'み{水|みず}'). Kanji without a known reading
  // stay as they are.
  // 々 repeats the kanji before it, so it takes that kanji's reading.
  function rubyText(s) {
    let prev = null;
    return Array.from(String(s || '')).map((c) => {
      const r = c === '々' ? prev : K.isKanji(c) ? kanjiReading(c) : null;
      prev = r;
      return r ? '{' + c + '|' + r + '}' : c.replace(/[{}|]/g, '');
    }).join('');
  }

  // ---- helpers ---------------------------------------------------------------------
  const VOWEL_OF = {};
  (function () {
    const rows = K.GOJUON.concat(K.VOICED, K.SEMIVOICED);
    const v = ['a', 'i', 'u', 'e', 'o'];
    rows.forEach((row) => row.forEach((k, i) => { if (k) { VOWEL_OF[k] = v[i]; VOWEL_OF[K.toKata(k)] = v[i]; } }));
    ['ゃ', 'ゅ', 'ょ'].forEach((k, i) => { VOWEL_OF[k] = ['a', 'u', 'o'][i]; VOWEL_OF[K.toKata(k)] = ['a', 'u', 'o'][i]; });
    ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'].forEach((k, i) => { VOWEL_OF[k] = v[i]; VOWEL_OF[K.toKata(k)] = v[i]; });
    delete VOWEL_OF['ん']; delete VOWEL_OF['ン'];
  })();
  const VOWEL_KANA = { あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o', ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o' };
  // Does ch (a vowel kana or ー) lengthen the vowel of prev?
  function extendsVowel(prev, ch) {
    if (!prev) return false;
    if (ch === 'ー') return !!VOWEL_OF[prev];
    const pv = VOWEL_OF[prev];
    const cv = VOWEL_KANA[ch];
    if (!pv || !cv) return false;
    return pv === cv || (pv === 'o' && cv === 'u') || (pv === 'e' && cv === 'i');
  }
  const esc = (s) => String(s).replace(/[{}|]/g, '');
  const roma = (k) => K.romaji(k);

  // Weighted Damerau–Levenshtein with backtrace; related substitutions are cheaper
  // so the alignment pairs e.g. が with か rather than with an unrelated kana.
  function related(a, b) {
    if (K.base(a) === K.base(b)) return true;
    if (K.toLarge(a) === K.toLarge(b)) return true;
    if (K.toHira(a) === K.toHira(b)) return true;
    if (SHAPE_MAP.has(a) && SHAPE_MAP.get(a).has(b)) return true;
    const pair = a + b;
    return ['はわ', 'わは', 'をお', 'おを', 'へえ', 'えへ', 'うお', 'おう', 'いえ', 'えい', 'ーう', 'うー', 'ーい', 'いー', 'ーお', 'おー'].includes(pair);
  }
  function align(inp, tgt) {
    const a = Array.from(inp);
    const b = Array.from(tgt);
    const n = a.length;
    const m = b.length;
    const d = [];
    for (let i = 0; i <= n; i++) {
      d.push(new Array(m + 1).fill(0));
      d[i][0] = i;
    }
    for (let j = 0; j <= m; j++) d[0][j] = j;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const sub = a[i - 1] === b[j - 1] ? 0 : related(a[i - 1], b[j - 1]) ? 0.6 : 1;
        let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + sub);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] && a[i - 1] !== a[i - 2]) v = Math.min(v, d[i - 2][j - 2] + 0.9);
        d[i][j] = v;
      }
    }
    // backtrace → ops: {op:'eq'|'sub'|'del'|'ins'|'swap', got, want, i (input idx), j (target idx)}
    const ops = [];
    let i = n;
    let j = m;
    const near = (x, y) => Math.abs(x - y) < 1e-9;
    while (i > 0 || j > 0) {
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] && a[i - 1] !== a[i - 2] && near(d[i][j], d[i - 2][j - 2] + 0.9)) {
        ops.push({ op: 'swap', got: a[i - 2] + a[i - 1], want: b[j - 2] + b[j - 1], i: i - 2, j: j - 2 });
        i -= 2;
        j -= 2;
        continue;
      }
      if (i > 0 && j > 0) {
        const sub = a[i - 1] === b[j - 1] ? 0 : related(a[i - 1], b[j - 1]) ? 0.6 : 1;
        if (near(d[i][j], d[i - 1][j - 1] + sub)) {
          ops.push({ op: sub === 0 ? 'eq' : 'sub', got: a[i - 1], want: b[j - 1], i: i - 1, j: j - 1 });
          i--;
          j--;
          continue;
        }
      }
      if (j > 0 && near(d[i][j], d[i][j - 1] + 1)) {
        ops.push({ op: 'del', got: null, want: b[j - 1], i, j: j - 1 }); // input is missing want
        j--;
        continue;
      }
      ops.push({ op: 'ins', got: a[i - 1], want: null, i: i - 1, j }); // input has an extra char
      i--;
    }
    ops.reverse();
    return { ops, dist: d[n][m], a, b };
  }

  // Is target position j (in the plain reading of the accepted markup) a particle?
  function particleAt(acc, j, vars) {
    if (!acc || !RB.jp) return false;
    const toks = RB.jp.parse(acc, vars);
    let pos = 0;
    for (const tk of toks) {
      const len = Array.from(normKana(tk.reading)).length;
      if (j >= pos && j < pos + len) {
        if (tk.punct) return false;
        const info = RB.jp.lookup(tk);
        if (info.entry && info.entry.pos === 'prt' && !info.parts) return true;
        if (info.parts) {
          let p = pos;
          for (const part of info.parts) {
            const pl = Array.from(normKana(part.reading)).length;
            if (j >= p && j < p + pl) return !!(part.entry && part.entry.pos === 'prt');
            p += pl;
          }
        }
        return false;
      }
      pos += len;
    }
    return false;
  }

  // Position of an insertion before target index j.
  function where(b, j) {
    if (j <= 0) return 'at the start';
    if (j >= b.length) return 'after ' + b[b.length - 1];
    return 'between ' + b[j - 1] + ' and ' + b[j];
  }
  // Position of the missing target character b[j], described by its neighbours.
  function whereMissing(b, j) {
    if (j <= 0) return 'at the start';
    if (j >= b.length - 1) return 'at the end, after ' + b[j - 1];
    return 'between ' + b[j - 1] + ' and ' + b[j + 1];
  }

  // ---- feedback ---------------------------------------------------------------------
  function explainSub(got, want, ctx) {
    const { acc, j, vars } = ctx;
    if (K.isKanji(got) || K.isKanji(want)) {
      // a kanji has no romaji: name it with its reading instead
      const desc = (c) => {
        if (!K.isKanji(c)) return c + ' (' + roma(c) + ')';
        const r = kanjiReading(c);
        return r ? 'the kanji {' + c + '|' + r + '}' : 'a kanji';
      };
      return { code: 'wrong_char', en: 'The answer has ' + desc(want) + ' where you ' + vb() + ' ' + desc(got) + '.' };
    }
    // particles は/わ, を/お, へ/え
    const pairs = { 'はわ': 'particle_wa', 'わは': 'particle_wa', 'をお': 'particle_o', 'おを': 'particle_o', 'へえ': 'particle_e', 'えへ': 'particle_e' };
    const pk = pairs[want + got];
    if (pk) {
      const isPrt = particleAt(acc, j, vars);
      if (pk === 'particle_wa') {
        return want === 'は'
          ? { code: 'particle_wa', en: isPrt ? 'The topic particle is written は, even though it is pronounced wa. You ' + vb() + ' わ.' : 'This word is spelled with は here; you ' + vb() + ' わ.' }
          : { code: 'particle_wa', en: 'This word is spelled with わ. は is read wa only when it is the topic particle.' };
      }
      if (pk === 'particle_o') {
        return want === 'を'
          ? { code: 'particle_o', en: isPrt ? 'The object particle is written を (pronounced o), not お.' : 'This is spelled with を here, not お.' }
          : { code: 'particle_o', en: 'This word is spelled with お. を is used only as the object particle.' };
      }
      return want === 'へ'
        ? { code: 'particle_e', en: isPrt ? 'The direction particle is written へ (pronounced e), not え.' : 'This is spelled with へ here, not え.' }
        : { code: 'particle_e', en: 'This word is spelled with え. へ is read e only as the direction particle.' };
    }
    if (K.toHira(got) === K.toHira(want) && got !== want) {
      return { code: 'script', en: want + ' is ' + (K.isKata(want) ? 'katakana' : 'hiragana') + '; you ' + vb() + ' the ' + (K.isKata(got) ? 'katakana' : 'hiragana') + ' ' + got + '.' };
    }
    if (K.base(got) === K.base(want)) {
      const wd = K.hasDakuten(want), wh = K.hasHandakuten(want), gd = K.hasDakuten(got), gh = K.hasHandakuten(got);
      if ((wh && gd) || (wd && gh)) {
        return { code: 'handakuten_mixup', en: 'The answer has ' + want + ' (' + roma(want) + '), not ' + got + ' (' + roma(got) + '): ゜ (handakuten) gives a p- sound, ゛ (dakuten) a b- sound.' };
      }
      if (wh && !gh) return { code: 'handakuten_mixup', en: want + ' (' + roma(want) + ') has the small circle ゜ (handakuten); you ' + vb() + ' ' + got + ' (' + roma(got) + ').' };
      if (gh && !wh) return { code: 'handakuten_mixup', en: 'The answer has ' + want + ' (' + roma(want) + ') without ゜; you ' + vb() + ' ' + got + ' (' + roma(got) + ').' };
      if (wd && !gd) return { code: 'missing_dakuten', en: want + ' (' + roma(want) + ') has dakuten ゛; you ' + vb() + ' ' + got + ' (' + roma(got) + ') without it.' };
      if (gd && !wd) return { code: 'extra_dakuten', en: 'The answer has ' + want + ' (' + roma(want) + ') without dakuten; you ' + vb() + ' ' + got + ' (' + roma(got) + ').' };
    }
    if (K.toLarge(got) === K.toLarge(want) && got !== want) {
      const wantSmall = K.isSmall(want);
      let why = '';
      if (want === 'っ' || want === 'ッ' || got === 'っ' || got === 'ッ') why = ' A small っ doubles the next consonant (a short pause); a full-size つ is the syllable tsu.';
      else if (/[ゃゅょャュョ]/.test(want + got)) why = ' A small ゃ/ゅ/ょ joins the kana before it into one syllable (きゃ = kya); full-size や/ゆ/よ is a separate syllable (きや = kiya).';
      else why = ' Small vowels join the kana before them into one syllable.';
      return { code: 'small_large', en: 'Here it should be ' + (wantSmall ? 'small ' : 'full-size ') + want + ', not ' + (wantSmall ? 'full-size ' : 'small ') + got + '.' + why };
    }
    if ((want === 'ー' || got === 'ー' || VOWEL_KANA[want] || VOWEL_KANA[got]) && ctx.prev && (extendsVowel(ctx.prev, want) || extendsVowel(ctx.prev, got))) {
      if (want === 'ー') return { code: 'long_vowel', en: 'In katakana a long vowel is written with ー; you ' + vb() + ' ' + got + '.' };
      if (got === 'ー') return { code: 'long_vowel', en: 'In hiragana a long vowel is written with a vowel kana (here ' + want + '), not ー.' };
      return { code: 'long_vowel', en: 'The long vowel here is spelled ' + ctx.prev + want + ', not ' + ctx.prev + got + '.' };
    }
    const note = SHAPE_MAP.has(got) && SHAPE_MAP.get(got).get(want);
    if (note) return { code: 'confusable', en: got + ' and ' + want + ' look alike. ' + note + ' The answer has ' + want + '.' };
    return { code: 'wrong_char', en: 'The answer has ' + want + ' (' + roma(want) + ') where you ' + vb() + ' ' + got + ' (' + roma(got) + ').' };
  }

  function charFeedback(input, target, ctx) {
    const { ops, b } = align(input, target);
    const out = [];
    ops.forEach((o, k) => {
      if (o.op === 'eq') return;
      const prevT = o.j > 0 ? b[o.j - 1] : null;
      if (o.op === 'swap') {
        out.push({ code: 'swapped', en: 'Two characters are swapped: the answer has ' + o.want + ', you ' + vb() + ' ' + o.got + '.', at: o.j });
      } else if (o.op === 'sub') {
        const f = explainSub(o.got, o.want, Object.assign({}, ctx, { j: o.j, prev: prevT }));
        f.at = o.j;
        f.got = o.got;
        f.want = o.want;
        out.push(f);
      } else if (o.op === 'del') {
        const w = o.want;
        if ((w === 'ー' || VOWEL_KANA[w]) && extendsVowel(prevT, w)) {
          out.push({ code: 'long_vowel', en: 'The vowel after ' + prevT + ' is long: write ' + prevT + w + '. A long vowel is held for an extra beat (one more mora).', at: o.j, want: w });
        } else if (w === 'っ' || w === 'ッ') {
          out.push({ code: 'missing_char', en: 'A small ' + w + ' is missing ' + whereMissing(b, o.j) + '. It doubles the next consonant (a short pause).', at: o.j, want: w });
        } else {
          out.push({ code: 'missing_char', en: 'Something is missing ' + whereMissing(b, o.j) + ': the answer has ' + w + ' there.', at: o.j, want: w });
        }
      } else if (o.op === 'ins') {
        const g = o.got;
        // previous character on the input side
        const prevI = o.i > 0 ? Array.from(input)[o.i - 1] : null;
        if ((g === 'ー' || VOWEL_KANA[g]) && extendsVowel(prevI, g)) {
          out.push({ code: 'long_vowel', en: 'The vowel after ' + prevI + ' is short here; ' + g + ' makes it long (one extra mora).', at: o.j, got: g });
        } else if (g === 'っ' || g === 'ッ') {
          out.push({ code: 'extra_char', en: 'There is no small ' + g + ' in this word; it would double the next consonant.', at: o.j, got: g });
        } else {
          out.push({ code: 'extra_char', en: 'There is an extra ' + g + ' ' + where(b, o.j) + '.', at: o.j, got: g });
        }
      }
    });
    return out;
  }

  // A lexicon word spelled exactly like s (same script), if any.
  function lexWordFor(s) {
    if (!RB.lex || !s) return null;
    const cands = RB.lex.bySurface(s).concat(K.hasKanji(s) ? [] : RB.lex.byReading(s).filter((e) => e.r === s));
    return cands.length ? cands[0] : null;
  }

  // Does kana reading r line up with the kanji/kana spelling w (okurigana match)?
  function alignsWith(w, r) {
    const md = RB.jp.rubyize(w, r);
    return !(K.hasKanji(w) && md === '{' + w + '|' + r + '}' && Array.from(w).some((c) => !K.isKanji(c)));
  }
  // The kana reading of an accepted form that contains kanji: its own ruby,
  // else a kana-only accepted form that lines up with it, else the first one.
  function readingFor(c, cands) {
    if (!K.hasKanji(c.reading)) return c.reading;
    const kana = cands.filter((x) => !K.hasKanji(x.reading) && !K.hasKanji(x.surface)).map((x) => x.reading);
    return kana.find((r) => alignsWith(c.surface, r)) || kana[0] || null;
  }
  // Notes on an accepted answer (mixed text): written with kanji, and which
  // one-shape character a handwritten answer was taken as.
  function successNotes(n, form, c, cands) {
    const notes = [];
    let md = null;
    if (K.hasKanji(form)) {
      const r = readingFor(c, cands);
      if (r) {
        md = RB.jp.rubyize(form, r);
        const all = Array.from(form).every((ch) => K.isKanji(ch));
        notes.push({ code: 'kanji', en: md + ' (' + r + ') — written ' + (all ? 'in kanji' : 'with kanji') + '.', jp: md });
      }
    }
    const a = Array.from(n), b = Array.from(form);
    if (a.length === b.length) {
      // the ruby of the kanji at position i, from the accepted word's markup
      const segs = [];
      if (md) for (const tk of RB.jp.parse(md)) for (const sg of tk.segs) for (const ch of Array.from(sg.t)) segs.push(sg);
      const kind = (ch) => (K.isKanji(ch) ? 'kanji' : ch === 'ー' ? 'long-vowel mark' : K.isKata(ch) ? 'katakana' : 'hiragana');
      const name = (ch, i) => {
        const sg = segs[i];
        const r = K.isKanji(ch) ? (sg && sg.r && sg.t === ch ? sg.r : kanjiReading(ch)) : null;
        return (r ? '{' + ch + '|' + r + '}' : ch) + ' (' + kind(ch) + ')';
      };
      const seen = new Set();
      a.forEach((got, i) => {
        const want = b[i];
        if (got === want || !HAND_ONE[got] || HAND_ONE[got] !== HAND_ONE[want] || seen.has(got + want)) return;
        seen.add(got + want);
        notes.push({ code: 'same_shape', en: name(got, i) + ' and ' + name(want, i) + ' look the same when handwritten; here it is the ' + kind(want) + '.', got, want });
      });
    }
    return notes;
  }

  /* check(input, task) → { ok, matched, form?, notes?, normalized, feedback:[{code, en, jp?, …}], assisted:false, closest }
   * task: { accept:[markup…], mode:'exact'|'kana'|'reading'|'meaning', scriptFree?, vars?, handwritten? }
   * handwritten: the input came from the handwriting pad, so characters written
   * with one shape (ロ/口, へ/ヘ…) count as one form. On success, `form` is the
   * accepted spelling that matched and `notes` (mixed text) say how it was written. */
  // how the player gave the answer, for feedback wording only (set for the duration of one check)
  let VERB = 'wrote';
  const vb = () => VERB;
  function check(input, task) {
    task = task || {};
    VERB = task.input === 'choice' ? 'chose' : task.input === 'ime' ? 'typed' : 'wrote';
    try { return check1(input, task); } finally { VERB = 'wrote'; }
  }
  function check1(input, task) {
    const mode = task.mode || 'reading';
    const accept = (task.accept || []).filter((x) => x != null && x !== '');
    const res = { ok: false, matched: null, normalized: '', feedback: [], assisted: false, closest: null };
    if (mode === 'meaning') {
      const n = normMeaning(input);
      res.normalized = n;
      if (!n) {
        res.feedback.push({ code: 'empty', en: 'Nothing was entered.' });
        return res;
      }
      for (const acc of accept) {
        if (normMeaning(acc) === n) {
          res.ok = true;
          res.matched = acc;
          return res;
        }
      }
      let best = null;
      let bd = Infinity;
      accept.forEach((acc) => {
        const d = align(n, normMeaning(acc)).dist;
        if (d < bd) { bd = d; best = acc; }
      });
      res.closest = best;
      if (best && bd <= 1.2 && n.length >= 4) res.feedback.push({ code: 'spelling', en: 'Very close: check the spelling of the English word.' });
      else res.feedback.push({ code: 'generic', en: "That meaning doesn't fit here." });
      return res;
    }

    const n = normKana(input);
    res.normalized = n;
    if (!n) {
      res.feedback.push({ code: 'empty', en: 'Nothing was entered.' });
      return res;
    }
    const sf = !!task.scriptFree;
    const fold = (s) => (sf ? K.toHira(s) : s);
    const hand = !!task.handwritten;
    const cands = accept.map((acc) => forms(acc, task.vars));
    const targetsOf = (c) => (mode === 'exact' ? [c.surface] : mode === 'kana' ? [c.reading] : [c.surface, c.reading]);
    // exact first; then, for handwriting only, one-shape characters folded (ロ/口, へ/ヘ…)
    const passes = hand ? [fold, (s) => fold(handFold(s))] : [fold];
    for (const key of passes) {
      for (const c of cands) {
        const hit = targetsOf(c).find((t) => key(t) === key(n));
        if (hit != null) {
          res.ok = true;
          res.matched = c.acc;
          res.form = hit;
          res.notes = successNotes(n, hit, c, cands, task.vars);
          return res;
        }
      }
    }
    // ---- wrong: find the closest accepted form and explain the difference ----
    const inputHasKanji = K.hasKanji(n);
    // Kanji whose reading is an accepted answer: where the task only accepts
    // kana (田 for the kana blank た), the right sound written the wrong way;
    // where it accepts another kanji (日 for 火, both ひ), a homophone.
    if (inputHasKanji && mode !== 'exact' && !cands.some((c) => fold(c.surface) === fold(n))) {
      const hit = (RB.lex ? RB.lex.bySurface(n) : []).concat(kanjiReading(n) ? [{ w: n, r: kanjiReading(n) }] : [])
        .find((e) => e.r && cands.some((c) => fold(c.reading) === fold(normKana(e.r)) && !K.hasKanji(c.reading)));
      if (hit) {
        const rb = RB.jp.rubyize(hit.w, hit.r);
        if (cands.some((c) => K.hasKanji(c.surface))) res.feedback.push({ code: 'other_word', en: "That's " + rb + (hit.m ? ', "' + esc(hit.m) + '"' : '') + ': the same reading, but a different word.', jp: rb });
        else res.feedback.push({ code: 'needs_kana', en: rb + ' has the right reading, but here the answer is written in kana.', jp: rb });
        return res;
      }
    }
    let best = null;
    cands.forEach((c) => {
      const opts = mode === 'exact' ? [c.surface] : mode === 'kana' ? [c.reading] : inputHasKanji ? [c.surface, c.reading] : [c.reading, c.surface];
      opts.forEach((t) => {
        const d = align(fold(n), fold(t)).dist;
        if (!best || d < best.d - 1e-9) best = { d, t, c };
      });
    });
    if (!best) {
      res.feedback.push({ code: 'generic', en: 'There is no accepted answer to compare with.' });
      return res;
    }
    res.closest = best.t;
    // Mode-specific near misses
    if (mode === 'exact' && cands.some((c) => fold(c.reading) === fold(n))) {
      res.feedback.push({ code: 'reading_only', en: 'That is the right reading, but this task asks for the written form.' });
      return res;
    }
    if (mode === 'kana' && cands.some((c) => fold(c.surface) === fold(n))) {
      res.feedback.push({ code: 'needs_kana', en: 'That is the right word, but this task asks for it in kana.' });
      return res;
    }
    const fb = [];
    // Different real word?
    const other = lexWordFor(n);
    const isAccepted = other && cands.some((c) => fold(c.surface) === fold(other.w) || fold(c.reading) === fold(other.r));
    if (other && !isAccepted) {
      fb.push({ code: 'other_word', en: "That's " + RB.jp.rubyize(other.w, other.r) + ', "' + esc(other.m) + '".', jp: RB.jp.rubyize(other.w, other.r) });
    }
    // Whole-word script difference
    if (K.toHira(n) === K.toHira(best.t) && n !== best.t) {
      const ks = K.script(best.t);
      fb.push({
        code: 'script',
        en: ks === 'kata' ? 'This is written in katakana; you used hiragana.' : ks === 'hira' ? 'This is written in hiragana; you used katakana.' : 'Some characters are in the other script (hiragana and katakana are not interchangeable here).',
      });
      res.feedback = fb;
      return res;
    }
    const tLen = Array.from(best.t).length;
    // A different real word that shares little with the answer: naming it is enough.
    if (fb.length && best.d > tLen * 0.5 && best.d >= 1) {
      res.feedback = fb;
      return res;
    }
    if (best.d > Math.max(2, tLen * 0.6)) {
      if (!fb.length) fb.push({ code: 'generic', en: "That's not the answer here. Compare it with the model answer." });
      res.feedback = fb;
      return res;
    }
    const detail = charFeedback(fold(n), fold(best.t), { acc: best.c.acc, vars: task.vars });
    const seen = new Set();
    detail.forEach((f) => {
      const key = f.code + '|' + (f.got || '') + '|' + (f.want || '');
      if (seen.has(key)) return;
      seen.add(key);
      fb.push(f);
    });
    if (!fb.length) fb.push({ code: 'generic', en: "That's not the answer here." });
    res.feedback = fb.slice(0, 4);
    return res;
  }

  // ---- distractors -------------------------------------------------------------------
  const YOON_OK = new Set(K.YOON.map((y) => y[0]).concat(K.YOON.map((y) => K.toKata(y[0]))));
  const SMALL_V_OK = new Set(Array.from('ふてでとどうゔつしじちくぐいフテデトドウヴツシジチクグイ'));
  // Rejects strings that are not plausible kana spellings.
  function plausible(s) {
    const a = Array.from(s);
    if (!a.length) return false;
    for (let i = 0; i < a.length; i++) {
      const c = a[i];
      const p = a[i - 1];
      if (/[ゃゅょャュョ]/.test(c) && !YOON_OK.has(p)) return false;
      if (/[ぁぃぅぇぉァィゥェォ]/.test(c) && !SMALL_V_OK.has(p)) return false;
      if ((c === 'っ' || c === 'ッ') && (i === a.length - 1 && a.length === 1)) return false;
      if ((c === 'っ' || c === 'ッ') && a[i + 1] && (VOWEL_KANA[a[i + 1]] || /[んンっッーゃゅょャュョ]/.test(a[i + 1]))) return false;
      if ((c === 'っ' || c === 'ッ') && p && /[んンっッー]/.test(p)) return false;
      if (/[ゕゖヵヶゎヮ]/.test(c)) return false;
      if (c === 'ー' && (i === 0 || /[んンっッー]/.test(p))) return false;
      if ((c === 'ん' || c === 'ン') && i === 0 && a.length > 1) return false;
    }
    return true;
  }

  // Candidate generators by kind of genuine confusion.
  function variantsAt(a, i, single) {
    const out = [];
    const c = a[i];
    const put = (x, kind) => {
      if (x == null) return;
      const b = a.slice();
      b[i] = x;
      out.push({ s: b.join(''), kind });
    };
    const bse = K.base(c);
    if (bse !== c) put(bse, 'diacritic');
    put(K.addDakuten(c) !== c ? K.addDakuten(c) : null, 'diacritic');
    put(K.addHandakuten(c) !== c ? K.addHandakuten(c) : null, 'diacritic');
    // size confusions: only っ and ゃゅょ inside words (small vowels only for single kana)
    const sizeOk = (x) => /[っッゃゅょャュョつツやゆよヤユヨ]/.test(x) || single;
    if (K.toLarge(c) !== c && sizeOk(c)) put(K.toLarge(c), 'small');
    else if (K.toSmall(c) !== c && sizeOk(c)) put(K.toSmall(c), 'small');
    confusablesOf(c).forEach((x) => put(x, 'shape'));
    const pairs = { は: 'わ', わ: 'は', を: 'お', お: 'を', へ: 'え', え: 'へ' };
    if (pairs[c]) put(pairs[c], 'particle');
    return out;
  }
  function longVowelVariants(a) {
    const out = [];
    for (let i = 1; i < a.length; i++) {
      if ((a[i] === 'ー' || VOWEL_KANA[a[i]]) && extendsVowel(a[i - 1], a[i])) {
        out.push({ s: a.slice(0, i).concat(a.slice(i + 1)).join(''), kind: 'long' }); // shorten
        const alt = { う: 'お', お: 'う', い: 'え', え: 'い' }[a[i]];
        if (alt && extendsVowel(a[i - 1], alt)) {
          const b = a.slice();
          b[i] = alt;
          out.push({ s: b.join(''), kind: 'long' });
        }
      }
    }
    // lengthen a short final-ish vowel
    for (let i = 0; i < a.length; i++) {
      const v = VOWEL_OF[a[i]];
      if (!v || (a[i + 1] && (a[i + 1] === 'ー' || extendsVowel(a[i], a[i + 1])))) continue;
      if (i > 0 && extendsVowel(a[i - 1], a[i])) continue; // already a long-vowel extension
      if (K.isSmall(a[i + 1] || '')) continue;
      const ext = K.isKata(a[i]) ? 'ー' : { a: 'あ', i: 'い', u: 'う', e: 'い', o: 'う' }[v];
      out.push({ s: a.slice(0, i + 1).concat([ext]).concat(a.slice(i + 1)).join(''), kind: 'long' });
    }
    return out;
  }
  function geminateVariants(a) {
    const out = [];
    const tsu = (ch) => (K.isKata(ch) ? 'ッ' : 'っ');
    for (let i = 0; i < a.length; i++) {
      if (a[i] === 'っ' || a[i] === 'ッ') out.push({ s: a.slice(0, i).concat(a.slice(i + 1)).join(''), kind: 'small' });
      else if (i > 0 && !VOWEL_KANA[a[i]] && !/[んンーっッ]/.test(a[i]) && !K.isSmall(a[i]) && a[i - 1] !== 'っ' && a[i - 1] !== 'ッ' && /[かきくけこさしすせそたちつてとぱぴぷぺぽカキクケコサシスセソタチツテトパピプペポ]/.test(a[i])) {
        out.push({ s: a.slice(0, i).concat([tsu(a[i])]).concat(a.slice(i)).join(''), kind: 'small' });
      }
    }
    return out;
  }

  /* distractors(answer, {count=3, kind:'kana'|'word', accept:[…], seed})
   * → array of plausible wrong options built from genuine confusions. The
   * answer is taken as markup; for words containing kanji the reading is used. */
  function distractors(answer, opts) {
    opts = opts || {};
    const count = opts.count || 3;
    const kind = opts.kind || (Array.from(normKana(RB.jp.reading(answer))).length <= 2 ? 'kana' : 'word');
    const base = normKana(RB.jp.reading(answer, opts.vars));
    const forbidden = new Set();
    [answer].concat(opts.accept || []).forEach((acc) => {
      const f = forms(acc, opts.vars);
      [f.surface, f.reading].forEach((x) => { forbidden.add(x); if (opts.scriptFree) { forbidden.add(K.toHira(x)); forbidden.add(K.toKata(x)); } });
    });
    const a = Array.from(base);
    let cands = [];
    if (kind === 'kana') {
      // a single kana or a yōon pair
      a.forEach((_, i) => cands.push(...variantsAt(a, i, true)));
      const scriptSwap = K.isKata(a[0]) ? K.toHira(base) : K.toKata(base);
      if (scriptSwap !== base) cands.push({ s: scriptSwap, kind: 'script' });
      if (a.length === 2 && /[ゃゅょャュョ]/.test(a[1])) {
        const rowSwap = { ゃ: ['ゅ', 'ょ'], ゅ: ['ゃ', 'ょ'], ょ: ['ゃ', 'ゅ'], ャ: ['ュ', 'ョ'], ュ: ['ャ', 'ョ'], ョ: ['ャ', 'ュ'] }[a[1]];
        rowSwap.forEach((y) => cands.push({ s: a[0] + y, kind: 'shape' }));
      }
    } else {
      a.forEach((_, i) => cands.push(...variantsAt(a, i)));
      cands.push(...longVowelVariants(a));
      cands.push(...geminateVariants(a));
      const scriptSwap = K.script(base) === 'kata' ? K.toHira(base) : K.toKata(base);
      if (scriptSwap !== base) cands.push({ s: scriptSwap, kind: 'script' });
    }
    // Fill for single kana: same row or same vowel column, same script.
    if (kind === 'kana' && opts.fill !== false) {
      const head = K.toHira(a[0]);
      const tail = a.slice(1).join('');
      const conv = K.isKata(a[0]) ? K.toKata : (x) => x;
      const rows = K.GOJUON.concat(K.VOICED, K.SEMIVOICED);
      rows.forEach((row, ri) => row.forEach((k, ci) => {
        if (k !== head) return;
        row.forEach((x) => { if (x && x !== head) cands.push({ s: conv(x) + tail, kind: 'fill' }); });
        rows.forEach((r2, rj) => { if (rj !== ri && r2[ci] && (tail === '' || K.YOON.includes(r2[ci] + K.toHira(tail)))) cands.push({ s: conv(r2[ci]) + tail, kind: 'fill' }); });
      }));
      if (head === 'っ') ['ゃ', 'ゅ', 'ょ'].forEach((x) => cands.push({ s: conv(x), kind: 'fill' }));
    }
    // de-duplicate, drop implausible, mixed-script and valid answers
    const baseScript = K.script(base);
    const seen = new Set();
    cands = cands.filter((c) => {
      const single = kind === 'kana' && Array.from(c.s).length === 1;
      if (!c.s || seen.has(c.s) || forbidden.has(c.s) || c.s === base || !(plausible(c.s) || (single && !/[ゕゖヵヶゎヮ]/.test(c.s)))) return false;
      if (kind === 'word' && baseScript !== 'mixed' && K.script(c.s) === 'mixed') return false;
      if (opts.scriptFree && (forbidden.has(K.toHira(c.s)) || forbidden.has(K.toKata(c.s)))) return false;
      seen.add(c.s);
      return true;
    });
    const rng = RB.util && RB.util.rng ? RB.util.rng(opts.seed != null ? opts.seed : (RB.util.hashStr ? RB.util.hashStr(base) : 1)) : Math.random;
    // Prefer variety: one per kind first (in shuffled kind order), then the rest.
    const byKind = new Map();
    cands.forEach((c) => {
      if (!byKind.has(c.kind)) byKind.set(c.kind, []);
      byKind.get(c.kind).push(c);
    });
    const kinds = Array.from(byKind.keys());
    const shuffle = (arr) => {
      const x = arr.slice();
      for (let i = x.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const t = x[i];
        x[i] = x[j];
        x[j] = t;
      }
      return x;
    };
    // script swaps are the weakest distractor for single kana; keep them last
    const orderedKinds = shuffle(kinds.filter((k) => k !== 'script' && k !== 'fill'))
      .concat(kinds.includes('script') ? ['script'] : [])
      .concat(kinds.includes('fill') ? ['fill'] : []);
    const pools = orderedKinds.map((k) => shuffle(byKind.get(k)));
    const out = [];
    let added = true;
    while (out.length < count && added) {
      added = false;
      for (const pool of pools) {
        if (out.length >= count) break;
        const c = pool.shift();
        if (c) {
          out.push(c.s);
          added = true;
        }
      }
    }
    return out;
  }

  return { check, distractors, normKana, normMeaning, align, plausible, confusablesOf, SHAPES, HAND_SAME, kanjiReading, rubyText };
})();
