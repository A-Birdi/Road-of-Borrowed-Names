/* RB.dialect — Suzu's Kansai-ben (docs/dialect/suzu_kansai.md).
 *
 * The standard lines stay exactly as authored. A dialect table, keyed by the
 * standard Japanese line (whitespace normalised), holds the Kansai version of
 * every line Suzu speaks, Japanese and English; the swap happens only when a
 * line is shown, and only when the line is hers and the player chose Kansai
 * (settings.suzuSpeech === 'kansai'; absent = standard). Nothing Kansai is
 * ever written into a campaign save: the history, memories and kept
 * sentences keep the standard text and are swapped when shown.
 *
 * Tables (src/content/dialect/*.js):
 *   RB.dialect.add('kansai', `
 *   @ ch1/32_scenes_depart [rw.suzu_evening]        (where it comes from; informative)
 *   = <standard Japanese> || <standard English>     (the key: its Japanese)
 *   > <Kansai Japanese> || <Kansai English>         (or "> =" : the same in Kansai,
 *   `, 'file');                                        or "> = || English" : same Japanese)
 *   A standard line containing %T is a template (a title filled in at run time).
 *
 * The Kansai lexicon (separate from RB.lex, so Kansai forms never feed the
 * standard vocabulary: kana practice, kanji words, the writing desk):
 *   RB.dialect.addLex([{ w, r, pos, lv, m, std, n?, final? }], src)
 *     std   the standard equivalent (shown in word help); final: only at the end of a sentence
 *   RB.dialect.lookupIn(tokens, i)  word help for a token of a Kansai line: a Kansai entry, a
 *     Kansai verb form explained through its standard form, or null (standard lookup applies). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect = (function () {
  'use strict';
  const norm = (jp) => String(jp == null ? '' : jp).replace(/\s+/g, ' ').trim();
  const T = { kansai: new Map() };       // norm(standard jp) -> entry
  const TPL = { kansai: [] };            // template entries (standard with %T)
  const KJP = new Set();                 // every Kansai Japanese string (render as Kansai)
  const errors = [];                     // table syntax problems (the validator reports them)
  const files = [];

  function parse(dialect, src, file) {
    const out = [];
    let at = null, std = null;
    src.split(/\r?\n/).forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line[0] === '#') return;
      const where = (file || 'dialect') + ':' + (i + 1);
      if (line[0] === '@') { at = line.slice(1).trim(); return; }
      const body = line.slice(1).trim();
      const bar = body.indexOf('||');
      const jp = bar < 0 ? body : body.slice(0, bar).trim();
      const en = bar < 0 ? null : body.slice(bar + 2).trim();
      if (line[0] === '=') {
        if (std) errors.push(where + ': a standard line without its Kansai line before it');
        std = { jp, en, where, at };
        return;
      }
      if (line[0] === '>') {
        if (!std) { errors.push(where + ': a Kansai line without a standard line'); return; }
        const same = jp === '=';
        const e = { dialect, std: std.jp, stdEn: std.en, jp: same ? std.jp : jp, en: en != null ? en : same ? std.en : '', same: same && en == null, sameJp: same, at: std.at, where: std.where, file };
        if (!same && en == null) errors.push(where + ': a Kansai line without English');
        out.push(e);
        std = null;
        return;
      }
      errors.push(where + ': cannot parse: ' + line.slice(0, 40));
    });
    if (std) errors.push(std.where + ': a standard line without a Kansai line');
    return out;
  }
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tplRe = (s) => new RegExp('^' + reEsc(norm(s)).replace(/%T/g, '(.+?)') + '$');
  function add(dialect, src, file) {
    const tab = T[dialect] || (T[dialect] = new Map());
    const tpl = TPL[dialect] || (TPL[dialect] = []);
    files.push(file);
    for (const e of parse(dialect, src, file)) {
      const k = norm(e.std);
      const old = tab.get(k);
      if (old && (norm(old.jp) !== norm(e.jp) || old.en !== e.en)) errors.push(e.where + ': a second, different Kansai version of a line already in ' + old.where);
      if (old) continue;
      tab.set(k, e);
      KJP.add(norm(e.jp));
      if (k.indexOf('%T') >= 0) {
        e.re = tplRe(e.std);
        e.enRe = e.stdEn ? tplRe(e.stdEn) : null;
        tpl.push(e);
      }
    }
  }

  // ---- the choice ---------------------------------------------------------------------------------
  // settings.suzuSpeech: 'kansai' | 'standard'; absent on older settings records = standard
  function choice() {
    const st = RB.game && RB.game.settings;
    return st && st.suzuSpeech === 'kansai' ? 'kansai' : 'standard';
  }
  const SPEAKERS = { suzu: true };
  function active(who) { return !!SPEAKERS[who] && choice() === 'kansai'; }

  // the table entry for a standard line as shown (a template's %T filled in): { jp, en } or null
  const made = new Map(); // shown standard (template filled) -> result, bounded
  function find(jp, en, dialect) {
    dialect = dialect || 'kansai';
    const k = norm(jp);
    const e = T[dialect] && T[dialect].get(k);
    if (e) return e.same ? { jp, en, same: true } : { jp: e.jp, en: e.sameJp && en != null && e.en === e.stdEn ? en : e.en, entry: e };
    for (const t of TPL[dialect] || []) {
      const m = t.re.exec(k);
      if (!m) continue;
      const title = m[1];
      const me = t.enRe && en != null ? t.enRe.exec(norm(en)) : null;
      const out = { jp: t.jp.replace('%T', title), en: me ? t.en.replace('%T', me[1]) : t.en.replace('%T', title), entry: t };
      KJP.add(norm(out.jp));
      return out;
    }
    void made;
    return null;
  }
  /* line(who, obj) -> obj itself, or a copy with the Kansai jp/en (and dia: 'kansai') when the
   * line is spoken by Suzu and the player chose Kansai. obj: anything with jp (and en). */
  function line(who, obj) {
    if (who === 'comp') { const s = RB.game && RB.game.s; who = s ? s.comp || s.provisional : null; }
    if (!obj || typeof obj.jp !== 'string' || !active(who)) return obj;
    const f = find(obj.jp, obj.en);
    if (!f || f.same) return obj;
    return Object.assign({}, obj, { jp: f.jp, en: f.en, dia: 'kansai', std: { jp: obj.jp, en: obj.en } });
  }
  // the standard line behind a shown one (for anything that is kept in the save)
  const std = (obj) => (obj && obj.std ? Object.assign({}, obj, obj.std, { dia: undefined, std: undefined }) : obj);
  // several lines joined with spaces (a discovery memory keeps its remark's lines joined)
  function joined(who, obj, parts) {
    if (!obj || !active(who) || !parts || !parts.length) return line(who, obj);
    const ls = parts.map((p) => line(who, p));
    if (!ls.some((x) => x.dia)) return obj;
    return Object.assign({}, obj, { jp: ls.map((x) => x.jp).join(' '), en: ls.map((x) => x.en).join(' '), dia: 'kansai' });
  }
  // is this Japanese a Kansai line (word help reads it with the Kansai lexicon first)?
  const isKansai = (jp) => !!jp && KJP.has(norm(jp));

  // ---- the Kansai lexicon and word help ------------------------------------------------------------
  const LEX = new Map();      // surface -> [entry]
  const LEXR = new Map();     // reading -> [entry]
  const lexAll = [];
  const lexProblems = [];
  function addLex(list, src) {
    for (const raw of list || []) {
      const e = Object.assign({ dia: 'kansai', src: src || 'dialect' }, raw);
      e.r = e.r || e.w;
      const p = RB.lex && RB.lex.problemsOf ? RB.lex.problemsOf(e) : [];
      if (!e.std) p.push('missing std (the standard equivalent)');
      if (p.length) { lexProblems.push({ w: e.w, problems: p, src: e.src }); continue; }
      (LEX.get(e.w) || LEX.set(e.w, []).get(e.w)).push(e);
      (LEXR.get(e.r) || LEXR.set(e.r, []).get(e.r)).push(e);
      lexAll.push(e);
    }
  }
  // what may follow a sentence-final particle besides punctuation (わ な, わ ね: "I guess", "you know")
  const FINAL_NEXT = { 'わ': new Set(['な', 'なあ', 'ね']) };
  function nextWord(tokens, i) {
    for (let j = i + 1; j < tokens.length; j++) if (tokens[j] && tokens[j].surface !== '') return tokens[j];
    return null;
  }
  function isFinal(tokens, i) {
    const nx = nextWord(tokens, i);
    return !nx || /^[」』）)…。！？!?]/.test(nx.surface) || !!(FINAL_NEXT[tokens[i].surface] && FINAL_NEXT[tokens[i].surface].has(nx.surface));
  }
  function lexHit(tk, tokens, i) {
    const list = (LEX.get(tk.surface) || []).concat(!/[一-鿿]/.test(tk.surface) ? LEXR.get(tk.surface) || [] : []);
    const fin = isFinal(tokens, i), prev = hasPrev(tokens, i), nx = nextWord(tokens, i);
    // an entry fits its place: `final` ones end a sentence after a word; `initial` ones open it;
    // `notNext` lists words after which this is not the Kansai word (うち に = "while", not "I …")
    // (notNext applies after a word: 観客 が いてる うち に = "while"; …… うち に は = "to me")
    return list.find((e) => (!e.final || (fin && prev)) && (!e.initial || !prev) && !(e.notNext && prev && nx && e.notNext.indexOf(nx.surface) >= 0)) || null;
  }
  // a word before this one in the same sentence
  function hasPrev(tokens, i) {
    for (let j = i - 1; j >= 0; j--) {
      const t = tokens[j];
      if (!t || t.surface === '') continue;
      return !t.punct;
    }
    return false;
  }
  // Kansai verb and copula forms, explained through the standard form they stand for:
  // [ending, standard ending, what the form is]
  const FORMS = [
    ['へんかったら', 'なかったら', 'Kansai negative 〜へんかったら (= 〜なかったら: if not)'],
    ['へんかった', 'なかった', 'Kansai negative past 〜へんかった (= 〜なかった)'],
    ['ひんかって', 'なくて', 'Kansai negative 〜ひん (= 〜ない), て-form'],
    ['ひんかった', 'なかった', 'Kansai negative past 〜ひんかった (= 〜なかった)'],
    ['へんかって', 'なくて', 'Kansai negative 〜へん (= 〜ない), て-form'],
    ['へんの', 'ないの', 'Kansai negative 〜へん (= 〜ない)'],
    ['いひん', 'ない', 'Kansai negative 〜ひん (= 〜ない)'],
    ['へん', 'ない', 'Kansai negative 〜へん (= 〜ない)'],
    ['ひん', 'ない', 'Kansai negative 〜ひん (= 〜ない)'],
    ['てはった', 'ていた', 'Kansai respectful 〜てはった (= 〜ていらっしゃった: friendly respect for the person spoken of)'],
    ['てはる', 'ている', 'Kansai respectful 〜てはる (= 〜ていらっしゃる: friendly respect for the person spoken of)'],
    ['ではった', 'でいた', 'Kansai respectful 〜ではった (= 〜でいらっしゃった)'],
    ['ではる', 'でいる', 'Kansai respectful 〜ではる (= 〜でいらっしゃる)'],
    ['はった', ['ない', 'ました'], 'Kansai respectful 〜はった: past of 〜はる (friendly respect for the person spoken of)'],
    ['はって', ['て', 'なくて'], 'Kansai respectful 〜はって: て-form of 〜はる (friendly respect for the person spoken of)'],
    ['はる', ['ない', 'ます'], 'Kansai respectful 〜はる (friendly respect for the person spoken of)'],
    ['はらへん', 'ない', 'Kansai respectful negative 〜はらへん'],
    ['うたる', 'ってやる', 'Kansai 〜たる (= 〜てやる: I\'ll do it for you)'],
    ['うたろ', 'ってやろう', 'Kansai 〜たろ (= 〜てやろう: let me do it for you)'],
    ['てもうて', 'てしまって', 'Kansai 〜てもうて (= 〜てしまって)'],
    ['てもて', 'てしまって', 'Kansai 〜てもて (= 〜てしまって)'],
    ['てまう', 'てしまう', 'Kansai 〜てまう (= 〜てしまう)'],
    ['でまう', 'でしまう', 'Kansai 〜でまう (= 〜でしまう)'],
    ['たるわ', 'てやるわ', 'Kansai 〜たる (= 〜てやる: I\'ll do it for you)'],
    ['たろか', 'てやろうか', 'Kansai 〜たろか (= 〜てやろうか: shall I do it for you?)'],
    ['たろ', 'てやろう', 'Kansai 〜たろ (= 〜てやろう: let me do it for you)'],
    ['たる', 'てやる', 'Kansai 〜たる (= 〜てやる: I\'ll do it for you)'],
    ['だる', 'でやる', 'Kansai 〜だる (= 〜でやる)'],
    ['てもうた', 'てしまった', 'Kansai 〜てもうた (= 〜てしまった)'],
    ['でもうた', 'でしまった', 'Kansai 〜でもうた (= 〜でしまった)'],
    ['てもた', 'てしまった', 'Kansai 〜てもた (= 〜てしまった)'],
    ['でもた', 'でしまった', 'Kansai 〜でもた (= 〜でしまった)'],
    ['てしもた', 'てしまった', 'Kansai 〜てしもた (= 〜てしまった)'],
    ['でしもた', 'でしまった', 'Kansai 〜でしもた (= 〜でしまった)'],
    ['とった', 'ていた', 'Kansai 〜とった (= 〜ていた)'],
    ['とって', 'ていて', 'Kansai 〜とって (= 〜ていて)'],
    ['とる', 'ている', 'Kansai 〜とる (= 〜ている)'],
    ['てん', 'たん', 'Kansai 〜てん (= 〜たんだ: explaining what happened)'],
    ['でん', 'だん', 'Kansai 〜でん (= 〜だんだ: explaining what happened)'],
    ['ゆうた', 'いった', 'Kansai 言うた (= 言った)'],
    ['うたら', 'ったら', 'Kansai 〜うた (= 〜った: the う-sound past of 〜う verbs)'],
    ['うたん', 'ったん', 'Kansai 〜うた (= 〜った: the う-sound past of 〜う verbs)'],
    ['うてん', 'ったん', 'Kansai 〜うてん (= 〜ったんだ)'],
    ['うてる', 'ってる', 'Kansai 〜うてる (= 〜ってる)'],
    ['うてた', 'ってた', 'Kansai 〜うてた (= 〜ってた)'],
    ['うて', 'って', 'Kansai 〜うて (= 〜って: the う-sound て-form of 〜う verbs)'],
    ['うた', 'った', 'Kansai 〜うた (= 〜った: the う-sound past of 〜う verbs)'],
    ['もろた', 'もらった', 'Kansai もろた (= もらった)'],
    ['んかった', 'なかった', 'Kansai (and casual) negative past 〜んかった (= 〜なかった)'],
    ['んとこ', 'ないでおこう', 'Kansai 〜んとこ (= 〜ないでおこう: let\'s not)'],
    ['んとく', 'ないでおく', 'Kansai 〜んとく (= 〜ないでおく: leave it un-…)'],
    ['んと', 'ないで', 'Kansai 〜んと (= 〜ないで / 〜ずに: without)'],
    ['たない', 'たくない', 'Kansai 〜たない (= 〜たくない: don\'t want to)'],
    ['たって', 'てやって', 'Kansai 〜たって (= 〜てやって: do it for them)'],
    ['ん', 'ない', 'Kansai (and casual) negative 〜ん (= 〜ない)'],
    ['こ', 'こう', 'Kansai short volitional 〜こ (= 〜こう: let\'s)'],
    ['ろ', 'ろう', 'Kansai short volitional 〜ろ (= 〜ろう: let\'s)'],
    ['そ', 'そう', 'Kansai short volitional 〜そ (= 〜そう: let\'s)'],
    ['よ', 'よう', 'Kansai short volitional 〜よ (= 〜よう: let\'s)'],
    ['も', 'もう', 'Kansai short volitional 〜も (= 〜もう: let\'s)'],
    ['お', 'おう', 'Kansai short volitional 〜お (= 〜おう: let\'s)'],
    ['もろて', 'もらって', 'Kansai もろて (= もらって)'],
  ];
  // whole words with an irregular Kansai form
  const WHOLE = { 'せえへん': 'しない', 'せーへん': 'しない', 'せえへんかった': 'しなかった', 'けえへん': 'こない', 'けーへん': 'こない', 'こーへん': 'こない', 'けえへんかった': 'こなかった', 'おらへん': 'いない', 'あらへん': 'ない', 'あらへんかった': 'なかった', 'いてる': 'いる', 'いてへん': 'いない', 'いてた': 'いた', 'もろた': 'もらった', 'もろて': 'もらって', 'おらん': 'いない', 'せな': 'しない', 'せえ': 'しろ', 'せん': 'しない' };
  function retail(tk, from, to) {
    const segs = (tk.segs || [{ t: tk.surface, r: null }]).map((s) => Object.assign({}, s));
    const last = segs[segs.length - 1];
    if (!last || last.r != null || last.ph || !last.t.endsWith(from)) return null;
    last.t = last.t.slice(0, last.t.length - from.length) + to;
    if (!last.t) segs.pop();
    const surface = segs.map((s) => s.t).join('');
    const reading = segs.map((s) => (s.r != null ? s.r : s.t)).join('');
    return { surface, reading, segs, lemma: null, gloss: null, punct: false, ph: null };
  }
  function viaStandard(tk, std, what) {
    if (!std || !RB.jp || !RB.jp.lookup) return null;
    let info;
    try { info = RB.jp.lookup(std); } catch (e) { return null; }
    if (!info || info.unknown || !info.entry) return null;
    return Object.assign({}, info, { surface: tk.surface, reading: tk.reading, mora: RB.kana && RB.kana.mora ? RB.kana.mora(tk.reading) : info.mora, romaji: RB.kana ? RB.kana.romaji(tk.reading) : info.romaji, forms: [what + ' — standard ' + std.surface].concat(info.forms || []), dia: { std: std.surface, m: what }, parts: null });
  }
  function fromEntry(tk, e) {
    return { surface: tk.surface, reading: tk.reading, entry: e, lemma: e.w, forms: [], romaji: e.ro || (RB.kana ? RB.kana.romaji(tk.reading || e.r) : ''), mora: RB.kana && RB.kana.mora ? RB.kana.mora(tk.reading || e.r) : [], gloss: tk.gloss || null, meaning: tk.gloss || e.m, parts: null, others: [], unknown: false, dia: { std: e.std, m: e.m } };
  }
  // tokens: RB.jp.parse of a Kansai line; i: the token's index. Returns a lookup result or null.
  function lookupIn(tokens, i) {
    const tk = tokens && tokens[i];
    if (!tk || tk.punct || tk.ph) return null;
    const hit = lexHit(tk, tokens, i);
    if (hit) return fromEntry(tk, hit);
    const plainSurface = tk.surface;
    if (WHOLE[plainSurface]) {
      const std = { surface: WHOLE[plainSurface], reading: WHOLE[plainSurface], segs: [{ t: WHOLE[plainSurface], r: null }] };
      return viaStandard(tk, std, 'Kansai ' + plainSurface + ' (= ' + WHOLE[plainSurface] + ')');
    }
    // 〜な before あかん (行かな あかん = 行かないと いけない)
    const nx = nextWord(tokens, i);
    if (nx && nx.surface === 'あかん' && /な$/.test(plainSurface)) {
      // 〜たらな あかん = 〜てやらなければ (見せたらな あかん: must show them)
      const r0 = /たらな$/.test(plainSurface) ? viaStandard(tk, retail(tk, 'たらな', 'てやらない'), 'Kansai 〜たらな あかん (= 〜てやらなければ いけない: must do it for them)') : null;
      if (r0) return r0;
      const r = viaStandard(tk, retail(tk, 'な', 'ない'), 'Kansai 〜な あかん (= 〜なければ いけない: must)');
      if (r) return r;
    }
    // a word the standard lookup reads as one word is standard Japanese (〜てる, 〜とく, …); only a
    // token it cannot read whole is explained as a Kansai form
    let whole = null;
    try { whole = RB.jp.lookup(tk); } catch (e) { whole = null; }
    // a standard word that means something else in Kansai (おる: plain "be", not humble)
    const ov = whole && whole.entry && OVERRIDE[whole.entry.w];
    if (ov && !whole.parts) { const k = lexAll.find((e) => e.w === ov); if (k) return Object.assign(fromEntry(tk, k), { forms: whole.forms || [] }); }
    if (whole && !whole.unknown && !whole.parts) return null;
    for (const [from, to, what] of FORMS) {
      if (!plainSurface.endsWith(from) || plainSurface === from) continue;
      for (const t of [].concat(to)) {
        const r = viaStandard(tk, retail(tk, from, t), what);
        if (r) return r;
      }
    }
    return null;
  }
  const OVERRIDE = { 'おる': 'おる' };
  // word help: a note under the meaning for a Kansai word or form
  function note(info) {
    if (!info || !info.dia || (info.entry && info.entry.plain)) return '';
    if (info.entry && info.entry.casual) return 'Casual speech (not only Kansai). The fuller form: ' + info.dia.std + '.';
    return 'Kansai dialect (関西弁). In standard Japanese: ' + info.dia.std + '. Suzu speaks Kansai-ben because you chose it; the game\'s exercises and answers always use standard Japanese.';
  }

  return {
    norm, add, parse, find, line, joined, std, isKansai, choice, active, SPEAKERS,
    addLex, lookupIn, note, lexAll: () => lexAll.slice(), lexProblems: () => lexProblems.slice(),
    table: (d) => T[d || 'kansai'], templates: (d) => (TPL[d || 'kansai'] || []).slice(), errors: () => errors.slice(), files: () => files.slice(),
  };
})();
