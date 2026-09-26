/* RB.kana — kana tables, script tests, conversions, romaji and mora.
 * Pure functions; no DOM. Loaded in browsers and in node vm tests. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.kana = (function () {
  'use strict';

  // ---- tables ---------------------------------------------------------------
  // Gojūon grid (hiragana). null = no kana in that cell.
  const GOJUON = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', null, 'ゆ', null, 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', null, null, null, 'を'],
    ['ん', null, null, null, null],
  ];
  const VOICED = [
    ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
    ['だ', 'ぢ', 'づ', 'で', 'ど'],
    ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ];
  const SEMIVOICED = [['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ']];
  const SMALL_LIST = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ', 'ゎ'];
  const YOON_HEADS = ['き', 'ぎ', 'し', 'じ', 'ち', 'ぢ', 'に', 'ひ', 'び', 'ぴ', 'み', 'り'];

  // Single-kana romaji (modified Hepburn). を is 'wo' here; romaji() with
  // {particle:true} renders the particle as 'o'.
  const ROMA = {
    あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
    か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
    さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
    た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
    な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
    は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
    ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
    や: 'ya', ゆ: 'yu', よ: 'yo',
    ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
    わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'wo', ん: 'n',
    が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
    ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
    だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
    ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
    ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
    ゔ: 'vu',
    ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o', ゃ: 'ya', ゅ: 'yu', ょ: 'yo', ゎ: 'wa', ゕ: 'ka', ゖ: 'ke',
  };
  // Two-kana combinations (yōon and the extended combinations used in katakana).
  const COMBO = {};
  (function () {
    const heads = { き: 'ky', ぎ: 'gy', し: 'sh', じ: 'j', ち: 'ch', ぢ: 'j', に: 'ny', ひ: 'hy', び: 'by', ぴ: 'py', み: 'my', り: 'ry' };
    for (const h in heads) {
      COMBO[h + 'ゃ'] = heads[h] + 'a';
      COMBO[h + 'ゅ'] = heads[h] + 'u';
      COMBO[h + 'ょ'] = heads[h] + 'o';
    }
    Object.assign(COMBO, {
      しぇ: 'she', じぇ: 'je', ちぇ: 'che', ぢぇ: 'je',
      ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo', ふゅ: 'fyu',
      てぃ: 'ti', でぃ: 'di', とぅ: 'tu', どぅ: 'du', てゅ: 'tyu', でゅ: 'dyu',
      うぃ: 'wi', うぇ: 'we', うぉ: 'wo', いぇ: 'ye',
      ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo', ゔゅ: 'vyu',
      つぁ: 'tsa', つぃ: 'tsi', つぇ: 'tse', つぉ: 'tso',
      くぁ: 'kwa', ぐぁ: 'gwa', くぃ: 'kwi', くぇ: 'kwe', くぉ: 'kwo',
      すぃ: 'si', ずぃ: 'zi', きぇ: 'kye', ぎぇ: 'gye',
    });
  })();

  // Diacritic pairs (plain → voiced / semi-voiced), both scripts.
  const DAK_PAIRS = 'かが きぎ くぐ けげ こご さざ しじ すず せぜ そぞ ただ ちぢ つづ てで とど はば ひび ふぶ へべ ほぼ うゔ ゝゞ ' +
    'カガ キギ クグ ケゲ コゴ サザ シジ スズ セゼ ソゾ タダ チヂ ツヅ テデ トド ハバ ヒビ フブ ヘベ ホボ ウヴ ワヷ ヰヸ ヱヹ ヲヺ ヽヾ';
  const HAN_PAIRS = 'はぱ ひぴ ふぷ へぺ ほぽ ハパ ヒピ フプ ヘペ ホポ';
  const SMALL_PAIRS = 'あぁ いぃ うぅ えぇ おぉ つっ やゃ ゆゅ よょ わゎ かゕ けゖ アァ イィ ウゥ エェ オォ ツッ ヤャ ユュ ヨョ ワヮ カヵ ケヶ';
  const toDak = {}, toHan = {}, fromMark = {}, smallOf = {}, largeOf = {};
  DAK_PAIRS.split(' ').forEach((p) => { toDak[p[0]] = p[1]; fromMark[p[1]] = p[0]; });
  HAN_PAIRS.split(' ').forEach((p) => { toHan[p[0]] = p[1]; fromMark[p[1]] = p[0]; });
  SMALL_PAIRS.split(' ').forEach((p) => { smallOf[p[0]] = p[1]; largeOf[p[1]] = p[0]; });

  // Half-width katakana (U+FF61–FF9F) → full-width.
  const HALF = '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
  const FULL = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
  const halfMap = {};
  for (let i = 0; i < HALF.length; i++) halfMap[HALF[i]] = FULL[i];

  // ---- character classes ----------------------------------------------------
  const cp = (ch) => (ch ? ch.codePointAt(0) : 0);
  function isHira(ch) {
    const c = cp(ch);
    return (c >= 0x3041 && c <= 0x3096) || c === 0x309d || c === 0x309e;
  }
  function isKata(ch) {
    const c = cp(ch);
    return (c >= 0x30a1 && c <= 0x30fa) || (c >= 0x30fc && c <= 0x30fe) || (c >= 0x31f0 && c <= 0x31ff);
  }
  function isLongMark(ch) {
    return ch === 'ー';
  }
  function isKana(ch) {
    return isHira(ch) || isKata(ch);
  }
  function isKanji(ch) {
    const c = cp(ch);
    return (
      (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf) || (c >= 0xf900 && c <= 0xfaff) ||
      (c >= 0x20000 && c <= 0x2ebef) || c === 0x3005 // 々
    );
  }
  function hasKanji(s) {
    for (const ch of String(s || '')) if (isKanji(ch)) return true;
    return false;
  }
  function isKanaString(s) {
    s = String(s || '');
    if (!s) return false;
    for (const ch of s) if (!isKana(ch)) return false;
    return true;
  }
  function isSmall(ch) {
    return !!largeOf[ch] || (cp(ch) >= 0x31f0 && cp(ch) <= 0x31ff);
  }
  function toSmall(ch) {
    return smallOf[ch] || ch;
  }
  function toLarge(ch) {
    return largeOf[ch] || ch;
  }
  // Returns the voiced form, or null when the kana cannot take dakuten.
  function addDakuten(ch) {
    const b = fromMark[ch] || ch;
    return toDak[b] || null;
  }
  function addHandakuten(ch) {
    const b = fromMark[ch] || ch;
    return toHan[b] || null;
  }
  function base(ch) {
    return fromMark[ch] || ch;
  }
  function hasDakuten(ch) {
    return !!fromMark[ch] && toDak[fromMark[ch]] === ch;
  }
  function hasHandakuten(ch) {
    return !!fromMark[ch] && toHan[fromMark[ch]] === ch;
  }

  // ---- conversions ------------------------------------------------------------
  function toKata(s) {
    let out = '';
    for (const ch of String(s || '')) {
      const c = cp(ch);
      if ((c >= 0x3041 && c <= 0x3096) || c === 0x309d || c === 0x309e) out += String.fromCodePoint(c + 0x60);
      else out += ch;
    }
    return out;
  }
  function toHira(s) {
    let out = '';
    for (const ch of String(s || '')) {
      const c = cp(ch);
      if ((c >= 0x30a1 && c <= 0x30f6) || c === 0x30fd || c === 0x30fe) out += String.fromCodePoint(c - 0x60);
      else out += ch;
    }
    return out;
  }
  // Half-width katakana → full-width (combining ﾞ/ﾟ where possible).
  function widen(s) {
    let out = '';
    for (const ch of String(s || '')) {
      if (ch === 'ﾞ' || ch === 'ﾟ') {
        const prev = out.slice(-1);
        const m = ch === 'ﾞ' ? addDakuten(prev) : addHandakuten(prev);
        if (m) out = out.slice(0, -1) + m;
        else out += ch === 'ﾞ' ? '゛' : '゜';
      } else out += halfMap[ch] || ch;
    }
    return out;
  }
  // Full-width ASCII (U+FF01–FF5E) and ideographic space → ASCII.
  function narrowAscii(s) {
    let out = '';
    for (const ch of String(s || '')) {
      const c = cp(ch);
      if (c >= 0xff01 && c <= 0xff5e) out += String.fromCharCode(c - 0xfee0);
      else if (c === 0x3000) out += ' ';
      else out += ch;
    }
    return out;
  }
  // 'hira' | 'kata' | 'kanji' | 'latin' | 'mixed' | '' — ー counts as neutral.
  function script(s) {
    const kinds = new Set();
    for (const ch of String(s || '')) {
      if (ch === 'ー') continue;
      if (isHira(ch)) kinds.add('hira');
      else if (isKata(ch)) kinds.add('kata');
      else if (isKanji(ch)) kinds.add('kanji');
      else if (/[A-Za-z0-9]/.test(ch)) kinds.add('latin');
    }
    if (kinds.size === 0) return '';
    return kinds.size === 1 ? Array.from(kinds)[0] : 'mixed';
  }

  // ---- romaji ---------------------------------------------------------------
  const PUNCT_ROMA = { '。': '.', '、': ',', '！': '!', '？': '?', '「': '"', '」': '"', '『': '"', '』': '"', '・': ' ', '　': ' ', '…': '...', '〜': '~', '～': '~', '（': '(', '）': ')' };
  const VOWELS = 'aeiou';
  const MACRON = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };

  // Split a (hiragana) string into romanisable units: [{k, r}]
  function units(h) {
    const out = [];
    for (let i = 0; i < h.length; i++) {
      const two = h.slice(i, i + 2);
      if (two.length === 2 && COMBO[two]) {
        out.push({ k: two, r: COMBO[two] });
        i++;
      } else {
        const ch = h[i];
        out.push({ k: ch, r: ROMA[ch] != null ? ROMA[ch] : null });
      }
    }
    return out;
  }

  /* romaji(s, opts)
   *  opts.particle — treat は/へ/を as particles (wa/e/o). Default false.
   *  opts.macron   — write ー and おう/おお/うう/ああ/ええ as macron vowels.
   *                  Default false: long vowels are spelled letter-for-letter
   *                  (おう → ou, おお → oo, ー repeats the vowel: コーヒー → koohii).
   *                  Note: macron mode cannot tell a long vowel from two vowels
   *                  across a word boundary (思う is omou, not omō).
   * Sokuon っ doubles the next consonant (っち → tchi); before a vowel or at
   * the end it is written as an apostrophe. ん before a vowel or y is n'. */
  function romaji(s, opts) {
    opts = opts || {};
    const h = toHira(widen(String(s || '')));
    const us = units(h);
    let out = '';
    let geminate = false;
    for (let i = 0; i < us.length; i++) {
      const u = us[i];
      let r = u.r;
      if (u.k === 'っ') {
        const next = us[i + 1];
        if (next && next.r && !VOWELS.includes(next.r[0]) && next.k !== 'ん' && next.k !== 'っ') {
          geminate = true;
        } else out += "'";
        continue;
      }
      if (u.k === 'ー') {
        const m = out.match(/[aeiouāīūēō]$/);
        if (m) {
          if (opts.macron && MACRON[m[0]]) out = out.slice(0, -1) + MACRON[m[0]];
          else out += m[0];
        } else out += '-';
        continue;
      }
      if (opts.particle) {
        if (u.k === 'は') r = 'wa';
        else if (u.k === 'へ') r = 'e';
        else if (u.k === 'を') r = 'o';
      }
      if (r == null) {
        out += PUNCT_ROMA[u.k] != null ? PUNCT_ROMA[u.k] : u.k;
        geminate = false;
        continue;
      }
      if (u.k === 'ん') {
        const next = us[i + 1];
        out += next && next.r && (VOWELS.includes(next.r[0]) || next.r[0] === 'y') ? "n'" : 'n';
        continue;
      }
      if (geminate) {
        out += r.startsWith('ch') ? 't' : r[0];
        geminate = false;
      }
      if (opts.macron) {
        const last = out.slice(-1);
        const long =
          (r === 'u' && (last === 'o' || last === 'u')) || (r === 'o' && last === 'o') ||
          (r === 'a' && last === 'a') || (r === 'e' && last === 'e');
        if (long && out.length) {
          out = out.slice(0, -1) + MACRON[last];
          continue;
        }
      }
      out += r;
    }
    return out;
  }

  // ---- mora -----------------------------------------------------------------
  const JOINERS = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ', 'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ヮ']);
  // Splits kana into morae: small ゃゅょ (and small vowels) join the previous
  // kana; っ, ん and ー are morae of their own. Punctuation and spaces are skipped.
  function mora(s) {
    const out = [];
    for (const ch of widen(String(s || ''))) {
      if (/\s/.test(ch) || PUNCT_ROMA[ch] != null || /[!?.,"'()]/.test(ch)) continue;
      if (JOINERS.has(ch) && out.length && isKana(out[out.length - 1].slice(-1)) && !isSmall(out[out.length - 1].slice(-1))) {
        out[out.length - 1] += ch;
      } else out.push(ch);
    }
    return out;
  }

  // ---- inventories for curriculum / recognizer --------------------------------
  function flat(rows) {
    const o = [];
    rows.forEach((r) => r.forEach((k) => { if (k) o.push(k); }));
    return o;
  }
  const BASIC_H = flat(GOJUON); // 46
  const VOICED_H = flat(VOICED); // 20
  const SEMI_H = flat(SEMIVOICED); // 5
  const YOON_H = [];
  YOON_HEADS.forEach((h) => ['ゃ', 'ゅ', 'ょ'].forEach((y) => YOON_H.push(h + y)));

  function inventory(scriptName) {
    const conv = scriptName === 'kata' ? toKata : (x) => x;
    return {
      basic: BASIC_H.map(conv),
      voiced: VOICED_H.map(conv).concat(scriptName === 'kata' ? ['ヴ'] : []),
      semivoiced: SEMI_H.map(conv),
      small: SMALL_LIST.map(conv),
      yoon: YOON_H.map(conv),
      long: scriptName === 'kata' ? ['ー'] : [],
    };
  }

  return {
    GOJUON, VOICED, SEMIVOICED, SMALL: SMALL_LIST, YOON: YOON_H, ROMA, COMBO,
    isHira, isKata, isKana, isKanji, isLongMark, hasKanji, isKanaString, isSmall, toSmall, toLarge,
    addDakuten, addHandakuten, base, hasDakuten, hasHandakuten,
    toKata, toHira, widen, fromHalfwidth: widen, narrowAscii, script,
    romaji, mora, units, inventory,
  };
})();
