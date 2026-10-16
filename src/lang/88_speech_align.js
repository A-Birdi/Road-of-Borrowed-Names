/* RB.jp.speech — which word a spoken line is on, and its English counterpart (PT-1c: a new learner asked that "when
 * the voiced lines are spoken, highlight the spoken word in Japanese and the English counterpart(s) in the sentence").
 *
 *   offsets(tokens, spoken)   where each token's reading sits in the text a voice speaks (RB.jp.reading of the line:
 *                             the tokens' readings in order, which every line in the game satisfies)
 *   tokenAt(offs, charIndex)  the token a voice's position (a speech "boundary" event) falls in
 *   timeline(tokens, rate)    an estimate of when each token starts, in seconds, from its beats (morae) and the pauses
 *                             of its punctuation: used when a voice gives no positions (and scalable to a recording's
 *                             length)
 *   enWords(en)               the words of an English line, with their places in the text
 *   align(tokens, en, opts)   { words, map, gmap }: for each token, the English words that render it.
 *                             map (words): a content word whose dictionary meaning names a word of the English line
 *                             (stems and base forms compared: "said" is say, "I'm" is I + am; a sense's head word counts
 *                             even when common: "to go" is go), one English word per token, the nearer where two could.
 *                             gmap (grammar; LI-12, Robin 2026-10-16: "it still feels as if there's a lack of proper
 *                             context … it could possibly highlight a different color depending on the particle"):
 *                             what a particle, the copula or an ending does, as the English says it (と and/with, の of
 *                             or the noun's 's, ない not/n't, ～たい want, ～ましょう let's, です am/is/are), only an
 *                             English word near it in the sentence and not already a word pair. Anything the English
 *                             does not say (は, を, よ, a past tense) gets none: an honest blank, never a guess.
 * Pure functions (no DOM): src/ui/22_speech_mark.js shows them; tests/unit/speech_align.test.mjs holds them. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.jp = RB.jp || {};

RB.jp.speech = (function () {
  'use strict';
  function offsets(tokens, spoken) {
    const out = [];
    let cur = 0;
    tokens.forEach((t, i) => {
      if (!t || t.punct) return;
      const rd = String(t.reading || t.surface || '');
      if (!rd.trim()) return;
      const at = spoken.indexOf(rd, cur);
      if (at < 0) return;
      out.push({ i, start: at, end: at + rd.length });
      cur = at + rd.length;
    });
    return out;
  }
  function tokenAt(offs, ci) {
    let best = null;
    for (const o of offs) { if (o.start <= ci) best = o; else break; }
    return best ? best.i : null;
  }
  const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ';
  const beats = (rd) => [...String(rd || '')].filter((c) => /[\u3041-\u30FC]/.test(c) && SMALL.indexOf(c) < 0).length;
  // about 7.5 beats a second at rate 1 (a measured average of Japanese device voices); a comma, a full stop and an
  // ellipsis add a pause (a slower voice pauses longer too)
  function timeline(tokens, rate) {
    const per = 1 / (7.5 * (rate || 1));
    let t = 0;
    const out = [];
    tokens.forEach((tk, i) => {
      if (!tk) return;
      if (tk.punct) {
        const s = String(tk.surface || '');
        t += (/…|‥/.test(s) ? 0.4 : /[。！？!?]/.test(s) ? 0.35 : /[、，,]/.test(s) ? 0.2 : 0) / (rate || 1);
        return;
      }
      const n = beats(tk.reading || tk.surface);
      if (!n) return;
      out.push({ i, at: t, dur: n * per });
      t += n * per;
    });
    return { items: out, total: t };
  }

  // ---- English ----------------------------------------------------------------------------------------------------
  const WORD = /[A-Za-z0-9\u00C0-\u024F'\u2019]+(?:-[A-Za-z0-9\u00C0-\u024F'\u2019]+)*/g;
  const fold = (w) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function stem(w) {
    let s = fold(String(w)).toLowerCase().replace(/[’']s$/, '').replace(/[^a-z0-9]/g, '');
    if (s.length > 4) s = s.replace(/ies$/, 'y').replace(/ied$/, 'y');
    if (s.length > 4) s = s.replace(/(ing|ed|es|ly)$/, '');
    if (s.length > 6) s = s.replace(/(er|or)$/, ''); // a doer: traveller, performer, teacher (not letter, corner)
    if (s.length > 3) s = s.replace(/s$/, '');
    return s.replace(/(.)\1$/, '$1');
  }
  // base forms of English words the stems cannot reach: irregular verbs and contractions ("I'm" is I + am)
  const IRR = {};
  ('be:am,is,are,was,were,been,being;say:said,says;see:saw,seen;go:went,gone,goes;come:came;take:took,taken;make:made;' +
   'give:gave,given;get:got,gotten;tell:told;think:thought;know:knew,known;find:found;leave:left;bring:brought;hear:heard;' +
   'feel:felt;keep:kept;hold:held;stand:stood;sit:sat;run:ran;eat:ate,eaten;drink:drank,drunk;write:wrote,written;' +
   'speak:spoke,spoken;meet:met;lose:lost;build:built;send:sent;begin:began,begun;break:broke,broken;choose:chose,chosen;' +
   'forget:forgot,forgotten;sleep:slept;teach:taught;catch:caught;buy:bought;fall:fell,fallen;fly:flew,flown;grow:grew,grown;' +
   'lead:led;pay:paid;ride:rode,ridden;rise:rose,risen;sell:sold;shake:shook,shaken;sing:sang,sung;swim:swam,swum;throw:threw,thrown;' +
   'understand:understood;wake:woke,woken;wear:wore,worn;win:won;hide:hid,hidden;light:lit;mean:meant;spend:spent;do:did,done,does;' +
   'have:had,has;can:could;will:would;shall:should;lie:lay,lain;draw:drew,drawn;forgive:forgave,forgiven;bite:bit,bitten;' +
   'blow:blew,blown;dig:dug;feed:fed;fight:fought;hang:hung;lend:lent;ring:rang,rung;seek:sought;shine:shone;shoot:shot;' +
   'sting:stung;strike:struck;swear:swore,sworn;tear:tore,torn;weep:wept;wind:wound;sweep:swept;bear:bore,borne;freeze:froze,frozen;steal:stole,stolen;' +
   // a pronoun's other cases ("my" is I's: 私 の 本 is "my book")
   'i:me,my,mine;you:your,yours;we:us,our,ours;he:him,his;she:her,hers;they:them,their,theirs;it:its')
    .split(';').forEach((g) => { const [base, forms] = g.split(':'); forms.split(',').forEach((f) => { IRR[f] = base; }); });
  const BE_S = new Set('it that he she there here what who where how this'.split(' '));
  // a possessive pronoun is its person and a possession ("my" is I + 's: 私 の is "my", AG-1)
  const POSS_PRON = { my: ['i', 'me'], mine: ['i', 'me'], your: ['you'], yours: ['you'], our: ['we', 'us'], ours: ['we', 'us'],
    his: ['he', 'him'], her: ['she'], hers: ['she'], their: ['they', 'them'], theirs: ['they', 'them'], its: ['it'] };
  /* An English word's parts (AG-1): most words are one part; a contraction is two ("I'm" is I + be, "won't" will +
   * not, "let's" let + us), a possessive pronoun its person and a possession ("my" is I + POSS), a name's 's the name
   * and a possession or "is". Each part is a list of keys (the word, its base form and its stem). A Japanese word or
   * construction claims one part of an English word, so 私 and です can share "I'm" without either taking the other's
   * part; no part is claimed twice. 'POSS' is a key no dictionary meaning can produce. */
  function parts(word) {
    const w = fold(String(word)).toLowerCase().replace(/’/g, "'");
    const base = (x) => { if (!x) return []; const b = IRR[x] || x; return [...new Set([x, b, stem(b), stem(x)])].filter(Boolean); };
    if (POSS_PRON[w]) return [[w].concat(POSS_PRON[w]), ['POSS']];
    if (w === 'cannot') return [base('can'), ['not']];
    const m = /^([a-z]+)'([a-z]+)$/.exec(w);
    if (m) {
      const [, a, b] = m;
      if (b === 't' && /n$/.test(a)) { const v = a.slice(0, -1); return [base(v === 'wo' ? 'will' : v === 'ca' ? 'can' : v === 'sha' ? 'shall' : v === 'ai' ? 'be' : v), ['not']]; }
      if (b === 'm' || b === 're') return [base(a), ['be']];
      if (b === 've') return [base(a), ['have']];
      if (b === 'll') return [base(a), ['will']];
      if (b === 'd') return [base(a), ['would', 'have']];
      if (b === 's') {
        if (a === 'let') return [['let'], ['us', 'we']];
        if (BE_S.has(a)) return [base(a), ['be', 'have']];
        return [base(a), ['POSS', 'be']]; // a name's 's: Ren's book, or Ren's here
      }
      return [base(w.replace(/'/g, ''))];
    }
    if (/n't$/.test(w)) return [base(w.replace(/n't$/, '')), ['not']];
    // a hyphenated word's 's ("lamp-keeper's")
    if (/-/.test(w) && /'s$/.test(w)) return [w.slice(0, -2).split('-').flatMap(base), ['POSS', 'be']];
    return [w.split('-').flatMap(base)];
  }
  // base forms of the word ("I'm" is I + am): every part's keys, for code that wants the word whole
  function lemmas(word) { return [...new Set(parts(word).flat().filter((k) => k !== 'POSS'))]; }
  function enWords(en) {
    const out = [];
    const text = String(en || '');
    let m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(text))) {
      const st = m[0].split('-').map(stem).filter(Boolean);
      const ps = parts(m[0]);
      // (the first part also answers to the whole word's stems: "performers" is perform)
      ps[0] = [...new Set(ps[0].concat(st))];
      out.push({ text: m[0], start: m.index, end: m.index + m[0].length, stems: st, lem: lemmas(m[0]), parts: ps });
    }
    return out;
  }
  // words a meaning shares with too many sentences to point at anything
  const STOP = new Set(('the a an to of be is it in on at for and or one do that this with as by up out so not no i you me my we he she ' +
    'they them his her its your our their there here have has get go come some something someone thing way time what who how just ' +
    'very more most into from about all any eg etc oneself somebody sth sb make take give put').split(' '));
  function meaningStems(m) {
    return String(m || '').replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').split(/[;,/]|\bor\b/)
      .flatMap((p) => p.trim().split(/[\s-]+/)).map(stem).filter((w) => w && w.length > 1 && !STOP.has(w));
  }
  // each sense's head word, even a common one: "to go" is go, "I, me" are I and me, "to be called" is call ("be",
  // "get", "become" before another word give way to it); articles are passed over
  const LIGHT = new Set(['be', 'get', 'become', 'feel', 'make', 'have', 'go', 'do', 'take', 'give', 'keep']);
  const PREP = new Set(['in', 'on', 'at', 'of', 'to', 'for', 'with', 'by', 'up', 'out', 'off', 'into', 'from', 'over']);
  function heads(m, noun) {
    const out = [];
    for (const raw of String(m || '').replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/[“”"…!?.]/g, ' ').split(/[;,/]/)) {
      let ws = raw.trim().toLowerCase().split(/[\s-]+/).filter(Boolean).map((x) => (IRR[x] === 'be' || IRR[x] === 'have' || IRR[x] === 'do' ? IRR[x] : x));
      // a noun's sense names its head last ("face powder" is powder)
      if (noun && ws.length > 1 && !/^(to|the|a|an)$/.test(ws[0]) && !ws.some((x) => PREP.has(x))) ws = ws.slice(-1);
      if (ws[0] === 'to' && ws.length > 1) ws = ws.slice(1);
      while (ws.length > 1 && /^(the|a|an)$/.test(ws[0])) ws = ws.slice(1);
      if (!ws.length) continue;
      while (ws.length > 1 && (LIGHT.has(ws[0]) || PREP.has(ws[0]) || /^(the|a|an)$/.test(ws[0]))) ws = ws.slice(1);
      const h = ws[0];
      out.push(IRR[h] || h, stem(IRR[h] || h));
    }
    return out.filter((w) => w && w.length > 0);
  }
  // words whose dictionary meaning the English rarely repeats: humble and honorific verbs, being and having, giving and
  // receiving (いらっしゃる "is here", いただきます "I'll have …"). 申す is "say": its "I'm …" is the naming
  // construction below, not a meaning of the verb (AG-1).
  const EXTRA = {
    '申す': 'say tell', '言う': 'call name tell', 'いる': 'be here stay', 'おる': 'be here stay', 'ある': 'be there',
    'ござる': 'be have', 'いらっしゃる': 'be come go here', '参る': 'go come', 'いたす': 'do', 'なさる': 'do', 'する': 'do make play',
    'くださる': 'give', 'くれる': 'give', 'いただく': 'get receive have eat drink take', 'もらう': 'get receive have',
    'あげる': 'give', '差し上げる': 'give', 'やる': 'give do', '思う': 'think guess suppose feel', '存じる': 'know think',
    'なる': 'become get turn', 'できる': 'can able done ready', '分かる': 'understand know see get', 'わかる': 'understand know see get',
    '来る': 'come here', '行く': 'go head come', '見る': 'see look watch', '拝見': 'see look', 'ご覧': 'see look', '召し上がる': 'eat drink have',
    'いい': 'good fine okay ok right', '良い': 'good fine okay ok right', 'よい': 'good fine okay right',
  };
  /* What a particle, the copula or an ending can say in English (the grammar tier). These are candidates, not
   * equivalences: each is used only in the role the code below has found for the word (AG-1: と, が, か and の have
   * several roles, and only some of them have an English word). */
  const GRAM = {
    'の': 'of', 'に': 'to in at on into for', 'へ': 'to toward towards for', 'で': 'at in on by with',
    'から': 'from since because so after', 'まで': 'until till to', 'より': 'than from', 'も': 'too also even either both',
    'や': 'and or', 'だけ': 'only just', 'ばかり': 'only just', 'など': 'such like',
    'けど': 'but though although', 'けれど': 'but though although', 'けれども': 'but though although',
    'のに': 'although though but even', 'ので': 'because so since', 'ながら': 'while as', 'ても': 'even though if', 'でも': 'but even though',
    'たら': 'if when', 'ば': 'if', 'なら': 'if', 'ね': 'right huh eh', 'くらい': 'about around', 'ぐらい': 'about around',
    'です': 'be', 'だ': 'be', 'でした': 'be', 'だった': 'be', 'である': 'be', 'でございます': 'be',
    'ない': 'not no never nothing nobody none', 'ません': 'not no never', 'ず': 'not without', 'たい': 'want wish',
    'ましょう': 'let shall', 'でしょう': 'probably surely will right', 'だろう': 'probably surely will right',
    'かもしれない': 'maybe might perhaps may', 'かもしれません': 'maybe might perhaps may', 'かも': 'maybe might perhaps',
    'はず': 'should supposed expect', 'べき': 'should ought', 'ください': 'please',
    // suffixes that an English word says (さん, たち and the like have none)
    'ごと': 'every each per whole', 'どおり': 'as', '中': 'during all throughout while', '宛て': 'to for', '宛': 'to for',
    'だらけ': 'covered full', '付き': 'with', 'ぶり': 'first since', '次第': 'soon once',
  };
  // a conjunction says what its meaning says ("so, therefore" for だから): its own plain words, even the common ones
  const PLAIN_SKIP = new Set('a an the of to in is be it that one sth sb eg etc'.split(' '));
  function plainWords(m) {
    return String(m || '').replace(/\([^)]*\)/g, ' ').replace(/\{[^}]*\}|[^\x00-\x7f]+/g, ' ').split(/[;,/]/)
      .flatMap((p) => p.trim().toLowerCase().split(/\s+/)).map((w) => w.replace(/[^a-z']/g, ''))
      .filter((w) => w && !PLAIN_SKIP.has(w)).flatMap((w) => [w, stem(w)]);
  }
  /* What a word does when the English has no word for it (AG-1: "a grammatical function with no standalone English
   * equivalent" is an outcome of its own, shown in word help, never filled with an arbitrary English word). */
  const NOTE = {
    topic: 'Topic marker ("as for …"): the English shows the topic by word order, not with a word of its own.',
    contrast: 'は after another particle: a contrast ("at least …", "as for …"); not a separate English word here.',
    object: 'Marks what the action is done to: the English shows it by word order.',
    subject: 'Marks the subject: the English shows it by word order.',
    yo: 'Sentence ending: the speaker tells the listener something new; no separate English word.',
    ne: 'Sentence ending: invites agreement ("…, right?"); the English here has no separate word for it.',
    emph: 'Sentence ending: casual emphasis; no separate English word.',
    na_end: 'Sentence ending: casual emphasis or musing; no separate English word.',
    question: 'Question marker: the English makes a question by word order and "?".',
    quote: 'Quotation marker: marks what is said, thought or heard; the English uses word order (or "that").',
    quote_casual: 'Casual quotation or topic (= と, という or は); no separate English word here.',
    nominal: 'Turns the clause before it into a noun ("the …", "-ing"); no separate English word here.',
    final_no: 'Sentence-final の: a casual question or explanation; no separate English word.',
    linker: 'Links the phrase before it to the noun after it; the English shows it by word order.',
    explain: '～んだ / ～のです: explains or gives the background; English rarely has a word for it.',
    polite: 'Polite ending: it sets the register (polite speech), not a separate English word.',
    polite_desu: 'Polite です after an adjective: register only; the adjective is already the predicate.',
    past: 'Past tense: the English shows it in the verb ("went", "-ed"), not with a separate word.',
    te: 'て-form: joins this to what follows ("and …", "-ing", a request …).',
    aspect: '～ている: an action going on, or a state that results; English shows it with "-ing" or the tense.',
    shimau: '～てしまう / ～ちゃう: done completely, often with regret or finality; no fixed English word.',
    te_aux: 'An ending after a て-form (doing it for someone, in advance, going on …); no separate English word here.',
    imperative: 'Command form: English uses the bare verb; how polite it sounds depends on the situation.',
    passive: 'Passive (～れる / ～られる): English uses "be … -ed", not a separate word.',
    ja_disc: 'じゃ (= では) here starts a new turn, "well then"; it is not the copula.',
    honorific: 'A name suffix (さん, 様, くん, ちゃん …): politeness or closeness; English usually drops it.',
    plural: 'Plural for people: English shows it with "-s" or a plural pronoun.',
    stem: 'Verb stem: joined to what follows.',
    adverb: 'に after a な-adjective makes an adverb ("quietly", "carefully"); not a separate English word.',
    modal: 'The copula after そう / よう / つもり / はず …: part of "it seems", "I intend", "it should"; no "is" of its own.',
  };
  /* What an inflection adds, by category (the lookup's own labels: src/lang/20_jp.js deinflect). A form may carry
   * several ("polite negative" is polite + negative); each category with English words is looked for on its own, so
   * 食べたくない gives "want" and "not" (AG-1). */
  const FORM_CAT = [
    [/negative|without doing|～ないで/i, 'neg'], [/want to/i, 'desire'], [/volitional/i, 'vol'],
    [/passive or potential/i, 'passpot'], [/^passive|causative-passive/i, 'pass'], [/potential "can|potential, casual/i, 'pot'],
    [/^conditional/i, 'cond'], [/even if/i, 'evenif'], [/obligation|casual "must/i, 'must'], [/don't have to/i, 'nomust'],
    [/causative "make/i, 'caus'], [/imperative|firm polite command/i, 'imp'], [/prohibition/i, 'prohib'],
    [/request "please don't/i, 'req'], [/request "please …"/i, 'req'], [/^polite/i, 'polite'], [/past/i, 'past'],
    [/^て-form|polite て-form/i, 'te'], [/～ている|casual ～てる/i, 'aspect'], [/～てしまう|～ちゃう|～じゃう/i, 'shimau'],
    [/～てみる/i, 'try'], [/too much|^too /i, 'too'], [/easy to/i, 'easy'], [/hard to/i, 'hard'], [/^while/i, 'while'],
    [/looks/i, 'looks'], [/after doing/i, 'after'], [/～ては/i, 'tewa'], [/stem form/i, 'stem'],
  ];
  const CAT = {
    neg: { en: 'not no never nothing nobody none neither nor without', doSupport: true }, desire: { en: 'want wish like' },
    vol: { en: 'let shall' }, pot: { en: 'can could able' }, passpot: { en: 'can could able' },
    pass: { note: 'passive' }, cond: { en: 'if when once whenever unless' }, evenif: { en: 'even though although if', phrase: [['even', 'if'], ['even', 'though'], ['even', 'when']] },
    caus: { en: 'make let' }, imp: { note: 'imperative' }, prohib: { en: 'not never', doSupport: true },
    req: { en: 'please' }, polite: { note: 'polite' }, past: { note: 'past' }, te: { note: 'te' }, aspect: { note: 'aspect' },
    shimau: { note: 'shimau' }, try: { en: 'try' }, too: { en: 'too' }, easy: { en: 'easy' }, hard: { en: 'hard difficult' },
    while: { en: 'while as' }, looks: { en: 'look seem like' }, after: { en: 'after' }, tewa: {}, stem: {},
    must: {}, nomust: {},
  };
  function catsOf(forms) {
    const out = new Set();
    for (const f of forms || []) for (const [re, c] of FORM_CAT) if (re.test(f)) { out.add(c); if (c === 'passpot') break; }
    if (out.has('passpot')) { out.delete('pass'); out.delete('pot'); }
    return out;
  }
  const FUNCTION_POS = /^(prt|aux|cop|conj|suf|pref)/;
  // after a て-form these are endings, not words of their own (～ている is still doing, ～てある has been done,
  // ～ておく in advance …): the English rarely has a word for them, and ～てください is "please"
  const TE_AUX = { 'いる': '', 'おる': '', 'ある': '', 'おく': '', 'しまう': '', 'くる': '', 'いく': '', '行く': '', '来る': '',
    'もらう': '', 'いただく': '', 'くれる': '', 'くださる': '', 'ください': 'please', 'みる': 'try', '見る': 'try', 'あげる': '', 'やる': '' };
  const TE_NOTE = { 'いる': 'aspect', 'おる': 'aspect', 'しまう': 'shimau' };
  // verbs a quotation と (or って) comes before; naming verbs make "X と申します" a naming construction
  const QUOTE_VERBS = new Set(['言う', 'いう', '申す', '思う', '聞く', '答える', '呼ぶ', '書く', '伝える', '叫ぶ', '考える', '信じる',
    '尋ねる', '頼む', '名乗る', '聞こえる', '感じる', '決める', '告げる', 'おっしゃる', '存じる', '言える']);
  // place nouns that, with their particle, are one English preposition (井戸 の 近く で "by the well")
  const SPATIAL = { '近く': 'near by beside close', '前': 'front before', '後ろ': 'behind back', '上': 'on above over top', '下': 'under below beneath',
    '中': 'in inside into within', '横': 'beside next', '隣': 'next beside', '間': 'between among', '外': 'outside out', 'そば': 'by beside near',
    '側': 'by beside near', '向こう': 'beyond across over', '奥': 'behind back deep', '周り': 'around', '手前': 'before front' };
  const MODAL_N = new Set(['そう', 'よう', 'みたい', 'らしい', 'つもり', 'はず', 'わけ']);
  // case particles: in English a preposition before the noun ("to the town" for 町 に)
  const CASE = new Set(['に', 'へ', 'で', 'から', 'まで', 'より', 'と', 'の']);
  const NAMING_VERBS = new Set(['申す', '言う', 'いう', '呼ぶ', '名乗る']);
  const Q_WORDS = new Set(['何', 'なに', 'なん', '誰', 'だれ', 'どこ', 'いつ', 'どれ', 'どちら', 'どっち', 'なぜ', 'どう', 'どうして', 'いくつ', 'いくら']);
  const HONORIFIC = new Set(['さん', '様', 'さま', 'くん', '君', 'ちゃん', '殿', 'どの', '氏']);
  /* Constructions recognised before their parts (AG-1): the words they span, the endings they take over, and the
   * English that can say the whole. An English pattern is a run of word parts: a key, or a RegExp on the word
   * itself; '?' after a key makes it optional. */
  const TAIL_OBLIG = /^(ならない|ならねえ|ならん|なりません|なりませんでした|ならなかった|いけない|いけません|いけなかった|いけねえ|だめ|ダメ|駄目)$/;
  const TAIL_OK = /^(いい|よい|良い|構わない|かまわない|構いません|かまいません|大丈夫|結構)$/;
  const TAIL_NO = /^(いけない|いけません|だめ|ダメ|駄目|ならない|なりません|ならん)$/;
  const EN_OBLIG = [['must'], ['have', 'to'], ['need', 'to'], [/^got$/, 'to'], [/^gotta$/], ['ought', 'to'], ['should']];
  const EN_NOMUST = [['do?', 'not', 'have', 'to'], ['do?', 'not', 'need', 'to'], ['need', 'not'], ['no', 'need']];
  const EN_PROHIB = [['must', 'not'], ['can', 'not'], ['should', 'not'], ['may', 'not'], ['not', 'allow'], ['do', 'not'], ['never']];
  const EN_PERM = [['can'], ['may'], ['could'], ['allow'], ['okay'], ['ok'], ['fine'], ['all', 'right']];
  const EN_ONLY = [['only'], ['just'], ['nothing', 'but'], ['nobody', 'but'], ['no', 'one', 'but'], ['except']];
  const EN_INVITE = [['why', 'do', 'not'], ['will', 'not', 'you'], ['would', 'you', 'like'], ['how', 'about'], ['shall'], ['want', 'to'], ['let']];
  const EN_NAMING = [['name', 'be'], ['call'], ['name']];
  /* Noun + verb expressions the English says with one word (雨が降る "it rains"): a reviewed list, each pairing a
   * noun, a verb (by dictionary form) and the English that says both (AG-1). */
  const IDIOMS = [
    { n: ['雨'], v: ['降る'], en: 'rain', verb: 1 }, { n: ['雪'], v: ['降る'], en: 'snow', verb: 1 }, { n: ['雷'], v: ['鳴る'], en: 'thunder', verb: 1 },
    { n: ['気'], v: ['つく', '付く'], en: 'notice realize realise aware' }, { n: ['気'], v: ['なる'], en: 'wonder curious bother worry' },
    { n: ['気'], v: ['つける', '付ける'], en: 'careful' }, { n: ['気'], v: ['入る'], en: 'like' }, { n: ['気'], v: ['する'], en: 'feel feeling sense' },
    { n: ['お腹', 'おなか', '腹'], v: ['すく', '空く', '減る', 'へる'], en: 'hungry starve' }, { n: ['喉', 'のど'], v: ['渇く', 'かわく'], en: 'thirsty' },
    { n: ['夢'], v: ['見る'], en: 'dream', verb: 1 }, { n: ['嘘', 'うそ'], v: ['つく', '吐く'], en: 'lie', verb: 1 }, { n: ['目'], v: ['覚める', 'さめる'], en: 'wake awake' },
  ];

  // ---- authored alignments (AG-1): reviewed relations for a displayed line, used before the rules -----------------
  /* RB.jp.speech.authored(entries): add reviewed alignments (src/content/align/). Each entry is keyed by key(tokens,
   * en, dia): the displayed Japanese words with the player's name as a symbol ($name), the dialect, and the English
   * with the name as $name, so a line is found whatever the player is called and never from a different line,
   * translation or dialect. An entry names each word by its place and its text, and is used only when every one still
   * matches (a changed line falls back to the rules). */
  const AUTH = new Map();
  const AUTH_VERSION = 1;
  function fnv(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function symJp(tokens) { return tokens.map((t) => (t && t.ph ? '$' + t.ph : String((t && t.surface) || ''))).join(' '); }
  function symEn(en, name) {
    let s = String(en || '');
    if (name) s = s.split(String(name)).join('$name');
    return s;
  }
  function key(tokens, en, opts) {
    opts = opts || {};
    return 'a' + AUTH_VERSION + '-' + fnv(symJp(tokens) + '␞' + (opts.dia || 'std') + '␞' + symEn(en, opts.name)) + '-' + fnv(symJp(tokens)).slice(0, 4);
  }
  function authored(entries) {
    for (const e of [].concat(entries || [])) if (e && e.key) AUTH.set(e.key, e);
    return AUTH.size;
  }
  // an English anchor: the n-th word with this text, or the player's name
  function enAt(words, a, name) {
    if (a.ph === 'name') {
      const first = String(name || '').split(/[\s-]+/)[0];
      return words.findIndex((w) => w.text === first);
    }
    let n = a.n || 0;
    for (let k = 0; k < words.length; k++) if (words[k].text === a.t && n-- === 0) return k;
    return -1;
  }
  function fromAuthored(e, tokens, words, opts) {
    const rels = [], notes = tokens.map(() => []);
    const claimed = new Set();
    for (const r of e.rels || []) {
      const jp = [], en = [], claims = [];
      for (const [i, s] of r.jp) { if (!tokens[i] || (tokens[i].ph ? '$' + tokens[i].ph : tokens[i].surface) !== s) return null; jp.push(i); }
      for (const a of r.en) {
        const k = enAt(words, a, opts.name);
        const part = a.p || 0;
        if (k < 0 || !words[k].parts[part] || claimed.has(k + ':' + part)) return null;
        claimed.add(k + ':' + part);
        en.push(k); claims.push([k, part]);
      }
      rels.push({ id: rels.length, tier: r.tier === 'grammar' ? 'grammar' : 'word', jp, en, claims, fn: r.fn || '', label: r.label || '', src: 'authored' });
    }
    for (const [i, s, text] of e.notes || []) {
      if (!tokens[i] || tokens[i].surface !== s) return null;
      notes[i].push({ kind: 'function', fn: 'authored', text });
    }
    return { rels, notes };
  }

  function align(tokens, en, opts) {
    opts = opts || {};
    tokens = tokens || [];
    const words = enWords(en);
    const map = tokens.map(() => []);
    const gmap = tokens.map(() => []);
    const notes = tokens.map(() => []);
    const rels = [];
    const finish = (src) => {
      for (const r of rels) for (const i of r.jp) {
        const into = r.tier === 'word' ? map : gmap;
        for (const k of r.en) if (!into[i].includes(k)) into[i].push(k);
      }
      map.forEach((a) => a.sort((x, y) => x - y)); gmap.forEach((a) => a.sort((x, y) => x - y));
      const inRel = new Set(rels.flatMap((r) => r.jp));
      const status = tokens.map((t, i) => (!t || t.punct ? null : inRel.has(i) ? 'linked' : notes[i].some((n) => n.kind === 'function') ? 'function' : 'unresolved'));
      return { words, map, gmap, rels, notes, status, src };
    };
    if (!words.length) return finish('none');
    // reviewed alignments first: the same displayed pair, every anchor still in place
    if (opts.authored !== false && AUTH.size) {
      const e = AUTH.get(key(tokens, en, opts));
      const got = e && fromAuthored(e, tokens, words, opts);
      if (got) { rels.push(...got.rels); got.notes.forEach((ns, i) => notes[i].push(...ns)); return finish('authored'); }
    }
    const look = opts.lookup || ((t) => (RB.jp.lookup ? RB.jp.lookup(t) : null));
    // each word looked up once (the game's own dictionary and deinflection: evidence, not a parse)
    const details = tokens.map((t, i) => {
      if (!t || t.punct || t.ph) return null;
      try { return look(t, i); } catch (e) { return null; }
    });
    const ent = (i) => (details[i] && !details[i].unknown && details[i].entry) || null;
    const pos = (i) => (ent(i) && ent(i).pos) || '';
    const lem = (i) => (ent(i) && ent(i).w) || '';
    const surf = (i) => (tokens[i] && !tokens[i].punct ? String(tokens[i].surface || '') : '');
    const real = (i) => i >= 0 && i < tokens.length && tokens[i] && !tokens[i].punct;
    const nominal = (i) => real(i) && (!!tokens[i].ph || /^(n|pn|name|ctr|num)$/.test(pos(i)));
    // a noun, a name with its suffix (ミオ さん の …), or 誰か / 何か ("someone", "something")
    const nounBefore = (i) => nominal(i - 1) || (real(i - 1) && HONORIFIC.has(surf(i - 1)) && nominal(i - 2)) ||
      (surf(i - 1) === 'か' && real(i - 2) && (Q_WORDS.has(lem(i - 2)) || Q_WORDS.has(surf(i - 2))));
    // the first word of the noun phrase ending at i: back over its modifiers (の, adjectives, a relative clause's verb)
    // to the previous particle or punctuation
    // the place of the word after i, past one comma (井戸 か 、 まさ屋)
    const commaSkip = (i) => (tokens[i + 1] && tokens[i + 1].punct && /^[、，,]$/.test(String(tokens[i + 1].surface || '')) ? i + 1 : i);
    // a verb or adjective that ends its sentence (so not describing a noun after it)
    const predicateEnd = (i) => /^(v|adj-i)/.test(pos(i)) && !real(i + 1);
    // (and over coordination: 水 か 氷 で "with water or ice")
    const phraseStart = (i) => { let j = i; while (j - 1 >= 0 && real(j - 1) && !(/^prt/.test(pos(j - 1)) && !(surf(j - 1) === 'の' || (/^(か|と|や|とか)$/.test(surf(j - 1)) && nominal(j - 2) && nominal(j))))) j--; return j; };
    // after の, と or か a verb's stem is a noun (旅 の 終わり "the end of the journey")
    const nounAfter = (i) => nominal(i + 1) || (real(i + 1) && /^v/.test(pos(i + 1)) && cats[i + 1].has('stem')) || (real(i + 1) && /^adj-na/.test(pos(i + 1)));
    const predicate = (i) => real(i) && /^(v|adj-|aux|cop)/.test(pos(i));
    const cats = tokens.map((t, i) => catsOf(details[i] && details[i].forms));
    const nameStems = opts.name ? String(opts.name).split(/[\s-]+/).map(stem).filter(Boolean) : [];
    const total = tokens.reduce((n, t) => n + String((t && t.surface) || '').length, 0) || 1;

    // ---- sentences: where a word is in its line, from 0 to 1; when both lines have as many sentences, within its own
    // sentence, and a link never crosses from one sentence to another (AG-1)
    const jpEnd = [], enEnd = [];
    tokens.forEach((t, i) => { if (t && t.punct && /[。！？!?]/.test(String(t.surface || ''))) jpEnd.push(i); });
    const text = String(en || '');
    words.forEach((w, k) => { const next = words[k + 1]; const gap = text.slice(w.end, next ? next.start : text.length); if (/[.!?]/.test(gap) && next) enEnd.push(k); });
    const jpS = jpEnd.filter((i) => tokens.slice(i + 1).some((t) => t && !t.punct)).length + 1, enS = enEnd.length + 1;
    // (as many sentences is not enough: each pair must be of comparable size, or the lines are split differently, as
    // "A message from Tami: … objection." against タミから伝言。, and the whole line is one span)
    let bySentence = jpS > 1 && jpS === enS;
    if (bySentence) {
      const jl = [], el = [];
      { let n = 0, s0 = 0; tokens.forEach((t, i) => { if (t && !t.punct) n += String(t.surface || '').length; if (jpEnd.includes(i) && s0 < jpS - 1) { jl.push(n); n = 0; s0++; } }); jl.push(n); }
      { let a = 0; enEnd.forEach((k) => { el.push(k + 1 - a); a = k + 1; }); el.push(words.length - a); }
      const jt = jl.reduce((x, y) => x + y, 0) || 1, et = el.reduce((x, y) => x + y, 0) || 1;
      if (jl.some((n, x) => Math.abs(n / jt - el[x] / et) > 0.35)) bySentence = false;
    }
    const oneSentence = jpS === 1 && enS === 1;
    const sentenceOf = (ends, x) => { let n = 0; while (n < ends.length && x > ends[n]) n++; return n; };
    const enPos = words.map((w, k) => {
      if (!bySentence) return words.length > 1 ? k / (words.length - 1) : 0;
      const sn = sentenceOf(enEnd, k), a = sn ? enEnd[sn - 1] + 1 : 0, b = sn < enEnd.length ? enEnd[sn] : words.length - 1;
      return (sn + (b > a ? (k - a) / (b - a) : 0)) / enS;
    });
    const rel = (k) => enPos[k];
    const jpPos = [], jpSn = [];
    {
      const ends = jpEnd.slice(0, jpS - 1);
      const lens = tokens.map((t) => String((t && t.surface) || '').length);
      const sentLen = [];
      { let acc = 0, s2 = 0; tokens.forEach((t, i) => { acc += lens[i]; if (i === ends[s2] || i === tokens.length - 1) { sentLen.push(acc); acc = 0; s2++; } }); }
      let acc = 0, sn = 0, pos0 = 0;
      tokens.forEach((t, i) => {
        jpPos[i] = bySentence ? (sn + (sentLen[sn] ? acc / sentLen[sn] : 0)) / jpS : pos0 / total;
        jpSn[i] = sn;
        acc += lens[i]; pos0 += lens[i];
        if (i === ends[sn]) { sn++; acc = 0; }
      });
    }
    const same = (i, k) => !bySentence || sentenceOf(enEnd, k) === jpSn[i];
    // the end of the clause a word is in (the next 。！？ or the line's end)
    const sentenceEnd = (i) => { let j = i; while (j + 1 < tokens.length && !(tokens[j + 1] && tokens[j + 1].punct && /[。！？!?]/.test(tokens[j + 1].surface))) j++; return j; };

    // ---- English parts, claimed once each
    const used = new Set();
    const isFree = (k, p) => !used.has(k + ':' + p);
    const partHas = (k, p, keys) => { const ks = words[k].parts[p]; return !!ks && ks.some((x) => keys.has(x)); };
    // the free part of word k with one of these keys
    // (a word's meaning never takes the possession-or-"is" part of a name's 's: that is the copula's or の's)
    const freePart = (k, keys, lexical) => { for (let p = 0; p < words[k].parts.length; p++) if (isFree(k, p) && partHas(k, p, keys) && !(lexical && words[k].parts[p].includes('POSS'))) return p; return -1; };
    function addRel(tier, jp, claims, fn, label) {
      for (const [k, p] of claims) used.add(k + ':' + p);
      rels.push({ id: rels.length, tier, jp: [...new Set(jp)].sort((a, b) => a - b), en: [...new Set(claims.map((c) => c[0]))].sort((a, b) => a - b), claims, fn, label: label || '', src: 'rule' });
    }
    // the parts of the line as one stream ("I'm" is two places), for multi-word English patterns
    const stream = [];
    words.forEach((w, k) => w.parts.forEach((ks, p) => stream.push([k, p])));
    function findPattern(pats, i, okK) {
      let best = null;
      for (const pat of pats) {
        for (let s0 = 0; s0 < stream.length; s0++) {
          const claims = [];
          let s = s0, ok = true;
          for (const el of pat) {
            const opt = typeof el === 'string' && el.endsWith('?');
            const keyName = opt ? el.slice(0, -1) : el;
            const at = stream[s];
            const hit = at && isFree(at[0], at[1]) && (keyName instanceof RegExp ? at[1] === 0 && keyName.test(words[at[0]].text.toLowerCase()) : partHas(at[0], at[1], new Set([keyName])));
            if (hit) { claims.push(at); s++; } else if (!opt) { ok = false; break; }
          }
          if (!ok || !claims.length) continue;
          // the whole run in the sentence; nothing between its words (one word's parts are adjacent anyway)
          if (!claims.every(([k]) => same(i, k) && (!okK || okK(k)))) continue;
          const ks = claims.map((c) => c[0]);
          if (ks.some((k, n) => n && k - ks[n - 1] > 1)) continue;
          const d = Math.abs(rel(ks[0]) - jpPos[i]);
          if (!best || pats.indexOf(pat) < best.rank || (pats.indexOf(pat) === best.rank && d < best.d)) best = { claims, rank: pats.indexOf(pat), d };
        }
        if (best) break; // patterns in order of preference
      }
      return best ? best.claims : null;
    }
    const negBefore = (k) => k > 0 && words[k - 1].parts.some((ks) => ks.includes('not')) ;
    const note = (i, fn, kind) => { if (NOTE[fn] && !notes[i].some((n) => n.fn === fn)) notes[i].push({ kind: kind || 'function', fn, text: NOTE[fn] }); };
    const unresolved = (i, text) => notes[i].push({ kind: 'unresolved', fn: 'unresolved', text });

    // ---- 1. constructions, before their parts: obligation, no obligation, prohibition, permission, しか…ない,
    // invitations, explanations, naming, noun + verb expressions. A construction is recognised from the Japanese, so
    // the endings it is made of never stand for themselves (しか…ない's negative is not "not"), even when its English
    // is not found; an invitation and a noun + verb expression are the exceptions, read either way by their English.
    const taken = tokens.map(() => new Set()); // what each word has handed over: 'lex' (its meaning), 'role', or a form category
    const give = (c) => { for (const [x, ts] of c.take) if (x >= 0) ts.forEach((v) => taken[x].add(v)); };
    const after = (i) => (real(i + 1) ? i + 1 : -1);
    const cons = [];
    const coord = [], gen = []; // と / か between nouns and the genitive の, filled by functionWord below
    tokens.forEach((t, i) => {
      if (!real(i)) return;
      const sf = surf(i), c = cats[i], j = after(i), tail = j >= 0 ? surf(j) : '';
      // ～ないと いけない written as three words
      if (c.has('neg') && tail === 'と' && real(j + 1) && TAIL_NO.test(surf(j + 1))) {
        cons.push({ kind: 'must', jp: [i, j, j + 1], head: i, pats: EN_OBLIG, ok: (k) => !negBefore(k), label: 'obligation: "must" / "have to"', take: [[i, ['neg', 'cond']], [j, ['role']], [j + 1, ['lex', 'neg', 'role']]] });
        return;
      }
      if (c.has('must') || /(なければ|なけりゃ|なくては|なくちゃ|なきゃ|ねば)$/.test(sf) || (/ないと$/.test(sf) && TAIL_NO.test(tail))) {
        const withTail = j >= 0 && TAIL_OBLIG.test(tail);
        if (c.has('must') || withTail || /(なくちゃ|なきゃ)$/.test(sf)) {
          cons.push({ kind: 'must', jp: withTail ? [i, j] : [i], head: i, pats: EN_OBLIG, ok: (k) => !negBefore(k), label: 'obligation: "must" / "have to"', take: [[i, ['neg', 'cond', 'te', 'evenif', 'must']], [withTail ? j : -1, ['lex', 'neg', 'role']]] });
          return;
        }
      }
      if (c.has('nomust') || (/(なくても|なくたって)$/.test(sf) && TAIL_OK.test(tail))) {
        const withTail = j >= 0 && TAIL_OK.test(tail);
        cons.push({ kind: 'nomust', jp: withTail ? [i, j] : [i], head: i, pats: EN_NOMUST, label: 'no obligation: "don\'t have to"', take: [[i, ['neg', 'te', 'evenif', 'nomust']], [withTail ? j : -1, ['lex', 'role']]] });
        return;
      }
      if ((c.has('tewa') || /(ては|では|ちゃ|じゃ)$/.test(sf)) && /^v/.test(pos(i)) && TAIL_NO.test(tail)) {
        cons.push({ kind: 'prohib', jp: [i, j], head: i, pats: EN_PROHIB, label: 'prohibition: "must not" / "don\'t"', take: [[i, ['te', 'tewa']], [j, ['lex', 'neg', 'role']]] });
        return;
      }
      if (c.has('evenif') && !c.has('neg') && TAIL_OK.test(tail)) {
        cons.push({ kind: 'perm', jp: [i, j], head: i, pats: EN_PERM, label: 'permission: "can" / "may"', take: [[i, ['te', 'evenif']], [j, ['lex', 'role']]] });
        return;
      }
      if (sf === 'しか' && /^prt/.test(pos(i))) {
        let n = -1;
        for (let x = i + 1; x <= sentenceEnd(i); x++) if (real(x) && (cats[x].has('neg') || /^(ない|ません|なかった|ねえ)$/.test(surf(x)))) { n = x; break; }
        if (n >= 0) cons.push({ kind: 'only', jp: [i, n], head: i, pats: EN_ONLY, label: 'しか … ない: "only"', take: [[i, ['role']], [n, ['neg']]] });
        return;
      }
      if (c.has('neg') && tail === 'か' && !real(j + 1)) {
        cons.push({ kind: 'invite', jp: [i, j], head: i, pats: EN_INVITE, onlyIfFound: true, label: 'invitation: "won\'t you …?" / "shall we …?"', take: [[i, ['neg']], [j, ['role']]] });
      }
      if ((sf === 'ん' || sf === 'の') && (predicate(i - 1) || surf(i - 1) === 'な') && /^(だ|です|でしょう|だろう|じゃ|でした|だった|じゃない|ではない)$/.test(tail)) {
        cons.push({ kind: 'explain', jp: [i, j], head: i, take: [[i, ['role']], [j, ['role']]] });
        note(i, 'explain'); note(j, 'explain');
        return;
      }
      // (a name before it: a name, the player's, a katakana word, or one with its suffix)
      const nameBefore = (x) => real(x) && (!!tokens[x].ph || pos(x) === 'name' || (/^n/.test(pos(x)) && /^[\u30a0-\u30ff]+$/.test(surf(x))));
      if ((sf === 'と' || sf === 'って') && (nameBefore(i - 1) || (HONORIFIC.has(surf(i - 1)) && nameBefore(i - 2))) && j >= 0 && NAMING_VERBS.has(lem(j))) {
        cons.push({ kind: 'naming', jp: [i, j], head: j, pats: EN_NAMING, late: true, tier: 'word', label: 'naming: "X と申します" is "I\'m X" / "my name is X"', take: [[i, ['role']], [j, ['lex']]] });
        return;
      }
      for (const id of IDIOMS) {
        if (!id.n.includes(lem(i)) && !id.n.includes(sf)) continue;
        for (let x = i + 1; x <= Math.min(i + 2, tokens.length - 1); x++) {
          if (!real(x)) break;
          if (id.v.includes(lem(x))) { cons.push({ kind: 'idiom', jp: [i, x], head: x, keys: new Set(id.en.split(' ')), verbOnly: !!id.verb, tier: 'word', onlyIfFound: true, label: 'noun + verb said with one English word', take: [[i, ['lex']], [x, ['lex']]] }); return; }
          if (!/^prt/.test(pos(x))) break;
        }
      }
    });
    for (const c of cons) if (!c.onlyIfFound) give(c);
    // claim each construction's English (after the word pairs for naming, which needs the name's English)
    const resolveCons = (late) => {
      for (const c of cons) {
        if (!!c.late !== late || c.done || !c.pats && !c.keys) continue;
        c.done = true;
        let claims = null;
        if (c.keys) {
          let best = -1;
          // (said as a verb: "rains", "snowing", not the noun "snow" beside its own verb)
          const verbal = (k) => !c.verbOnly || (/(s|ing|ed)$/.test(words[k].text.toLowerCase()) && !c.keys.has(words[k].text.toLowerCase()));
          words.forEach((w, k) => { if (same(c.head, k) && verbal(k) && freePart(k, c.keys) >= 0 && (best < 0 || Math.abs(rel(k) - jpPos[c.head]) < Math.abs(rel(best) - jpPos[c.head]))) best = k; });
          if (best >= 0) claims = [[best, freePart(best, c.keys)]];
        } else claims = findPattern(c.pats, c.head, c.ok);
        if (!claims && c.kind === 'naming') {
          // "I'm Ren" for レン と申します: the "be" part of the word just before the name's English
          const nameI = c.jp[0] - 1 - (HONORIFIC.has(surf(c.jp[0] - 1)) ? 1 : 0);
          const nk = map[nameI] && map[nameI][0];
          if (nk > 0) { const p = freePart(nk - 1, new Set(['be'])); if (p >= 0 && same(c.head, nk - 1)) claims = [[nk - 1, p]]; }
        }
        if (!claims) {
          if (c.kind === 'naming') note(c.jp[0], 'quote');
          else if (!c.onlyIfFound) unresolved(c.head, c.label + ': its English was not found in this line.');
          continue;
        }
        if (c.onlyIfFound) give(c);
        addRel(c.tier || 'grammar', c.jp, claims, c.kind, c.label);
        if ((c.tier || 'grammar') === 'word') for (const x of c.jp) for (const [k] of claims) if (!map[x].includes(k)) map[x].push(k);
      }
    };
    resolveCons(false);

    // ---- 2. each word's own reading: its meaning (word tier) and what its endings add (grammar tier)
    const cands = [], gcands = [];
    tokens.forEach((t, i) => {
      if (!real(i)) return;
      const here = jpPos[i];
      let want = [], prefer = null;
      const g = []; // grammar wants: [keys, cat]
      if (t.ph) want = nameStems; // the player's name, in the English as it is shown
      else {
        const r = details[i], e = ent(i);
        if (!e) return;
        const w0 = e.w, sf = surf(i);
        // a て-form ending: only straight after a verb that is in its て-form (not a locative で, not across a full stop)
        const pe = ent(i - 1), pr = details[i - 1];
        const afterTe = real(i - 1) && pe && /^v/.test(pe.pos || '') && /[てで]$/.test(surf(i - 1)) && ((pr && pr.forms) || []).some((f) => /て-form/.test(f));
        const lexicalNaka = w0 === '中' && e.pos === 'n';
        if (afterTe && TE_AUX[w0] != null) {
          if (TE_AUX[w0]) g.push([TE_AUX[w0].split(' '), w0 === 'ください' ? 'req' : 'try']);
          else note(i, TE_NOTE[w0] || 'te_aux');
          for (const c of cats[i]) if (c !== 'stem' && CAT[c] && CAT[c].en && c !== 'polite') g.push([CAT[c].en.split(' '), c]);
          if (cats[i].has('polite')) note(i, 'polite');
        } else if (!lexicalNaka && (FUNCTION_POS.test(e.pos || '') || GRAM[w0] || GRAM[sf])) {
          if (!taken[i].has('role')) functionWord(i, sf, w0, e, g);
        } else if (!taken[i].has('lex')) {
          const nounish = /^(n|pn|ctr|num)$/.test(e.pos || '');
          prefer = new Set(heads(e.m, nounish).concat(r.gloss ? heads(r.gloss, nounish) : []));
          want = meaningStems(e.m).concat(r.gloss ? meaningStems(r.gloss) : [], heads(e.m), r.gloss ? heads(r.gloss) : [], EXTRA[w0] ? EXTRA[w0].split(' ') : []);
        }
        if (!(afterTe && TE_AUX[w0] != null)) for (const c of cats[i]) {
          if (taken[i].has(c)) continue;
          const C = CAT[c] || {};
          if (C.en) g.push([C.en.split(' '), c, 'form']);
          if (C.note) note(i, C.note);
          else if (NOTE[c] && !C.en) note(i, c);
        }
      }
      if (want.length) {
        const set = new Set(want);
        const hits = [];
        words.forEach((w, k) => { if (same(i, k) && freePart(k, set, true) >= 0) hits.push(k); });
        if (hits.length) cands.push({ i, here, hits, set, prefer, word: true });
      }
      for (const [keys, cat, from] of g) {
        const set = new Set(keys.filter(Boolean));
        if (!set.size) continue;
        const cop = set.has('be') && cat === 'cop';
        // what an ending adds is looked for beside the English of its own word ("want" and "not" by "eat" for
        // 食べたくない), whatever its place in the Japanese; with no such word, by its place as other grammar is
        const anchored = from === 'form' || from === 'noun' || from === 'case';
        const anchorTo = from === 'noun' || from === 'case' ? (HONORIFIC.has(surf(i - 1)) ? i - 2 : i - 1) : i;
        // explicit request markers may come before the English verb: a unique "please" in the sentence will do
        const request = cat === 'req' && words.filter((w, k) => same(i, k) && w.text.toLowerCase() === 'please').length === 1;
        const near = (k) => same(i, k) && (request || anchored || (cop && (bySentence || oneSentence)) || Math.abs(rel(k) - here) <= (cop ? 0.5 : 0.3));
        const hits = [];
        words.forEach((w, k) => {
          if (!near(k)) return;
          // "like" says a wish only after "would" ("I'd like to …")
          if (cat === 'desire' && !partHas(k, 0, new Set(['want', 'wish'])) && ![1, 2].some((d) => k - d >= 0 && words[k - d].parts.some((ks) => ks.includes('would')))) return;
          if (words[k].parts.some((ks, p) => ks.some((x) => set.has(x)))) hits.push(k);
        });
        if (hits.length) gcands.push({ i, here, hits, set, cat, anchored, anchorTo, reach: from === 'form' ? 4 : 3, before: from === 'case', phrase: from === 'case' ? phraseStart(anchorTo) : anchorTo });
      }
    });
    // a particle, the copula or another function word: its role first, then what that role can say in English
    function functionWord(i, sf, w0, e, g) {
      const prev = i - 1, next = i + 1;
      // the end of a sentence: nothing more, or 。！？ (a comma is not the end: 入れるか、迷う)
      const atEnd = next >= tokens.length || (tokens[next] && tokens[next].punct && /[。！？!?…‥」』]/.test(String(tokens[next].surface || '')));
      switch (sf) {
        case 'は': note(i, real(prev) && /^prt/.test(pos(prev)) ? 'contrast' : 'topic'); return;
        case 'を': note(i, 'object'); return;
        case 'よ': case 'よね': note(i, 'yo'); return;
        case 'さ': case 'わ': case 'ぞ': case 'ぜ': note(i, 'emph'); return;
        case 'って': note(i, 'quote_casual'); return;
        case 'ます': note(i, 'polite'); return;
        case 'ねえ': unresolved(i, 'ねえ: a tag ("…, right?") or a casual "not"; not decided here.'); return;
        case 'な': if (atEnd) { note(i, 'na_end'); return; } break;
        case 'ね': note(i, 'ne'); g.push([GRAM['ね'].split(' '), 'ne']); return;
        case 'が':
          if (nounBefore(i) || (real(prev) && /^(prt|suf)/.test(pos(prev)))) { note(i, 'subject'); return; }
          if (predicate(prev)) { g.push([['but', 'though', 'although', 'yet'], 'conj']); return; }
          unresolved(i, 'が: its role here (subject or "but") was not decided.'); return;
        case 'と':
          if (nounBefore(i) && nounAfter(commaSkip(i)) && !(real(next) && QUOTE_VERBS.has(lem(next)))) { coord.push(i); return; }
          if (real(next) && QUOTE_VERBS.has(lem(next))) { note(i, 'quote'); return; }
          if (nounBefore(i)) { g.push([['with', 'and'], 'prt', 'case']); return; }
          // (a condition in English is often "and": "Climb this slope and there is …")
          if (predicate(prev)) { g.push([['when', 'if', 'whenever', 'once', 'and'], 'prt']); return; }
          unresolved(i, 'と: its role here was not decided.'); return;
        case 'か':
          if (nounBefore(i) && nounAfter(commaSkip(i)) && !Q_WORDS.has(lem(prev)) && !Q_WORDS.has(surf(prev))) { coord.push(i); return; }
          if (real(prev) && (Q_WORDS.has(lem(prev)) || Q_WORDS.has(surf(prev)))) { g.push([['some', 'something', 'someone', 'somebody', 'somewhere', 'sometime', 'somehow', 'any', 'anything', 'anyone', 'anybody', 'anywhere'], 'prt']); return; }
          if (atEnd) { note(i, 'question'); return; }
          // after a clause, mid-sentence: an embedded question ("whether", "if": 入れるか迷う, いいものか考える)
          if (predicate(prev) || nounBefore(i) || (real(next) && /^(分かる|わかる|知る|聞く|尋ねる|覚える|決める|確かめる|考える|どう)$/.test(lem(next)))) { note(i, 'question'); g.push([['whether', 'if'], 'prt']); return; }
          unresolved(i, 'か: its role here was not decided.'); return;
        case 'の':
          // between a noun and what it describes (母 の 古い 友達: the next word may be an adjective)
          if (nounBefore(i) && (nounAfter(i) || (real(next) && !/^(prt|aux|cop)/.test(pos(next)) && !predicateEnd(next)))) { gen.push(i); return; }
          if (predicate(prev)) { note(i, atEnd ? 'final_no' : 'nominal'); return; }
          if (atEnd) { note(i, 'final_no'); return; }
          if (real(prev) && /^prt/.test(pos(prev))) { note(i, 'linker'); return; }
          unresolved(i, 'の: its role here was not decided.'); return;
        case 'ん': unresolved(i, 'ん: an explanation or a casual negative; not decided here.'); return;
        case 'じゃ':
          if (!real(prev) && (!real(next) || (tokens[next] && tokens[next].punct))) { note(i, 'ja_disc'); return; }
          if (real(prev) && MODAL_N.has(surf(prev))) { note(i, 'modal'); return; }
          if (real(next) && /^(ない|ありません|ねえ|ないか)$/.test(surf(next))) { g.push([['be'], 'cop']); return; }
          unresolved(i, 'じゃ: "well then", or part of じゃない; not decided here.'); return;
        case 'じゃない': case 'ではない': case 'じゃありません': case 'ではありません':
          g.push([['be'], 'cop'], [['not'], 'neg']); return;
        case 'です': case 'だ': case 'でした': case 'だった': case 'である': case 'でございます':
          if (real(prev) && /^adj-i/.test(pos(prev))) { note(i, 'polite_desu'); return; }
          // after そう, よう, みたい, つもり, はず, わけ the copula completes "it seems", "I intend", "it should": the English
          // has no "is" of its own for it
          if (real(prev) && MODAL_N.has(surf(prev))) { if (/^(です|でした|でございます)$/.test(sf)) note(i, 'polite'); else note(i, 'modal'); return; }
          g.push([['be'], 'cop']);
          if (sf === 'です' || sf === 'でした' || sf === 'でございます') note(i, 'polite');
          if (sf === 'でした' || sf === 'だった') note(i, 'past');
          return;
      }
      if (HONORIFIC.has(sf) || HONORIFIC.has(w0)) { note(i, 'honorific'); return; }
      // に after a な-adjective makes an adverb (静か に "quietly"), not "to"
      if (sf === 'に' && real(prev) && /^adj-na/.test(pos(prev))) { note(i, 'adverb'); return; }
      if (sf === 'たち' || sf === 'ら' && /^suf/.test(e.pos || '')) { note(i, 'plural'); return; }
      if (sf === 'ない' || sf === 'ません' || sf === 'ず') { g.push([GRAM[sf].split(' '), 'neg']); if (sf === 'ません') note(i, 'polite'); return; }
      const gw = GRAM[sf] || GRAM[w0];
      // a particle after a noun is looked for beside that noun's English ("only water" for 水 だけ, "to the town" for
      // 町 に), whatever the order of the two languages
      if (gw) { g.push([gw.split(' '), sf === 'たい' ? 'desire' : sf === 'ましょう' ? 'vol' : sf === 'ください' ? 'req' : 'prt', /^prt/.test(e.pos || '') && nounBefore(i) ? (CASE.has(sf) ? 'case' : 'noun') : '']); return; }
      if (/^conj/.test(e.pos || '')) { g.push([plainWords(e.m), 'conj']); return; }
    }

    const wordOwner = []; // English word → the Japanese word whose meaning it says (after the word pairs)
    const engOf = (j) => [...new Set(rels.filter((r) => r.jp.includes(j)).flatMap((r) => r.en))];
    // ---- 3. assignment: the most certain first (fewest candidates), the nearer in the sentence preferred
    const assign = (list, tier, fn) => {
      list.sort((a, b) => a.hits.length - b.hits.length || a.i - b.i);
      for (const c of list) {
        // (neither a word's meaning nor the copula takes a name's 's: "children's", "Mio's" are possession first)
        const lexical = c.word || c.cat === 'cop';
        let free = c.hits.filter((k) => freePart(k, c.set, lexical) >= 0);
        // (the copula leaves a name's 's alone when the name is followed by の: that 's is possession)
        if (c.cat === 'cop') free = free.filter((k) => !(words[k].parts.some((ks) => ks.includes('POSS')) && wordOwner[k] != null && (surf(wordOwner[k] + 1) === 'の' || (HONORIFIC.has(surf(wordOwner[k] + 1)) && surf(wordOwner[k] + 2) === 'の'))));
        // "at once" is not a condition
        if (c.cat === 'cond') free = free.filter((k) => !(words[k].text.toLowerCase() === 'once' && k > 0 && words[k - 1].text.toLowerCase() === 'at'));
        if (c.anchored) {
          const at = map[c.anchorTo] && map[c.anchorTo].length ? map[c.anchorTo] : null;
          const dist = (k) => (at ? Math.min(...at.map((a) => Math.abs(a - k))) : Math.abs(rel(k) - c.here) * words.length);
          // a case particle's preposition comes before its noun's English, with only that noun phrase's own words between
          // ("on a sleeping serpent's back" for 眠る海蛇の背中に): a word paired with a Japanese word outside the phrase
          // means the English belongs to another phrase
          const fits = (k, a) => {
            if (!c.before) return Math.abs(a - k) <= c.reach;
            if (k >= a) return false;
            let loose = 0;
            for (let x = k + 1; x < a; x++) {
              const o = wordOwner[x];
              if (o == null) loose++;
              else if (o < c.phrase || o > c.anchorTo) return false;
            }
            return loose <= 2;
          };
          const nearAnchor = at ? free.filter((k) => at.some((a) => fits(k, a))) : [];
          // with nothing beside its word's English (or no such word), by its place, as other grammar is
          // (a case particle whose noun has English abstains when none is beside it; one whose noun has none, a name
          // the English spells differently, is placed as before)
          free = nearAnchor.length ? nearAnchor : c.before && at ? [] : free.filter((k) => Math.abs(rel(k) - c.here) <= 0.3);
          free.sort((a, b) => dist(a) - dist(b) || a - b);
        } else {
          // the copula: a plain "is" / "was" before a name's 's ("Ren's" is more often possession); a word's meaning:
          // its head word first ("powder" for 白粉, face powder)
          const poss = (k) => (c.cat === 'cop' && words[k].parts.some((ks) => ks.includes('POSS')) ? 1 : 0);
          const head = (k) => (c.prefer && words[k].parts[0].some((x) => c.prefer.has(x)) ? 0 : 1);
          free.sort((a, b) => poss(a) - poss(b) || head(a) - head(b) || Math.abs(rel(a) - c.here) - Math.abs(rel(b) - c.here) || a - b);
        }
        if (!free.length) continue;
        const k = free[0], claims = [[k, freePart(k, c.set, lexical)]];
        // a two-word English phrase that says one ending ("even if" for ～ても) is claimed whole
        const ph = c.cat && CAT[c.cat] && CAT[c.cat].phrase;
        if (ph) for (const [a, b] of ph) {
          const t = (x) => (words[x] ? words[x].text.toLowerCase() : '');
          if (t(k) === b && t(k - 1) === a && isFree(k - 1, 0)) claims.push([k - 1, 0]);
          else if (t(k) === a && t(k + 1) === b && isFree(k + 1, 0)) claims.push([k + 1, 0]);
        }
        // English negation is often "do" + "not": the "do" goes with it
        if (c.cat && CAT[c.cat] && CAT[c.cat].doSupport) {
          if (words[k].parts.length > 1 && claims[0][1] === 1 && isFree(k, 0) && partHas(k, 0, new Set(['do']))) claims.push([k, 0]);
          else if (words[k].parts.length === 1 && k > 0 && words[k - 1].parts.length === 1 && isFree(k - 1, 0) && partHas(k - 1, 0, new Set(['do']))) claims.push([k - 1, 0]);
        }
        addRel(tier, [c.i], claims, fn || c.cat || 'meaning', '');
        if (tier === 'word') map[c.i].push(k);
      }
    };
    assign(cands, 'word', 'meaning');
    resolveCons(true);
    for (const r of rels) if (r.tier === 'word') for (const k of r.en) if (wordOwner[k] == null) wordOwner[k] = r.jp[0];
    // N の 近く で: the place noun and its particle say one preposition, before N's English
    tokens.forEach((t, x) => {
      const p = x + 1;
      if (!real(x) || !SPATIAL[surf(x)] || map[x].length || !real(p) || !CASE.has(surf(p)) || surf(p) === 'の' || taken[p].has('role')) return;
      const n = surf(x - 1) === 'の' ? x - 2 : -1;
      const at = n >= 0 ? engOf(n) : [];
      const keys = new Set(SPATIAL[surf(x)].split(' ').concat((GRAM[surf(p)] || '').split(' ')).filter(Boolean));
      let best = -1;
      for (const a of at) for (let k = Math.max(0, a - 3); k < a; k++) if (same(x, k) && freePart(k, keys) >= 0 && (best < 0 || a - k < a - best)) best = k;
      if (best < 0) return;
      // (an English preposition: the grammar colour, for the place noun and its particle together)
      addRel('grammar', [x, p], [[best, freePart(best, keys)]], 'spatial', 'place noun + particle: one English preposition');
      taken[p].add('role');
      if (wordOwner[best] == null) wordOwner[best] = x;
    });
    // の: the possession of the word before it ("Ren's", "my" for 私 の), first; otherwise "of"
    const genOf = [];
    for (const i of gen) {
      const j = HONORIFIC.has(surf(i - 1)) ? i - 2 : i - 1;
      const k = map[j] && map[j][0];
      const p = k != null ? freePart(k, new Set(['POSS'])) : -1;
      if (p >= 0) addRel('grammar', [i], [[k, p]], 'possessive', 'possession: "\'s" / "my"');
      // otherwise "of", before the English of the noun it belongs to ("the end of the journey")
      else genOf.push({ i, here: jpPos[i], hits: words.map((w, kk) => kk).filter((kk) => same(i, kk) && freePart(kk, new Set(['of'])) >= 0), set: new Set(['of']), cat: 'prt', anchored: true, anchorTo: j, reach: 3, before: true, phrase: phraseStart(j) });
    }
    // と / か between two nouns: the one "and" / "or" between their English words (AG-1: anchored, not by position)
    // first the "and" / "or" strictly between the two nouns' English; then, for the rest, one just past them (a list:
    // "soup, horses and sandals") or beside the one noun that has English ("yakitori and rice balls")
    const coordLeft = [];
    for (const pass of [0, 1]) for (const i of pass ? coordLeft : coord) {
      const left = engOf(HONORIFIC.has(surf(i - 1)) ? i - 2 : i - 1), right = engOf(commaSkip(i) + 1);
      const target = surf(i) === 'と' ? 'and' : 'or';
      const ok = (k) => words[k].text.toLowerCase() === target && isFree(k, 0) && same(i, k);
      const hits = [];
      if (left.length === 1 && right.length === 1) {
        const lo = Math.min(left[0], right[0]), hi = Math.max(left[0], right[0]);
        const clean = (k) => !/[.!?;]/.test(text.slice(words[lo].end, words[k].start));
        for (let k = lo + 1; k < (pass ? Math.min(hi + 3, words.length) : hi); k++) if (ok(k) && clean(k)) hits.push(k);
      } else if (pass && (left.length === 1) !== (right.length === 1)) {
        const a = (left.length === 1 ? left : right)[0];
        for (let k = Math.max(0, a - 3); k <= Math.min(words.length - 1, a + 3); k++) if (k !== a && ok(k)) hits.push(k);
      }
      if (hits.length === 1) addRel('grammar', [i], [[hits[0], 0]], 'coordination', target);
      else if (!pass) coordLeft.push(i);
      else unresolved(i, (surf(i) === 'と' ? 'と' : 'か') + ' between two nouns, but no single "' + target + '" was found beside their English.');
    }
    assign(genOf, 'grammar');
    assign(gcands.filter((c) => !taken[c.i].has('role')), 'grammar');
    // ～られる with no "can" found: passive, potential or respectful, not decided
    tokens.forEach((t, i) => { if (real(i) && cats[i].has('passpot') && !taken[i].has('passpot') && !rels.some((r) => r.fn === 'passpot' && r.jp.includes(i))) unresolved(i, '～られる: passive, potential ("can") or respectful; not decided here.'); });
    return finish('rules');
  }
  /* Relations no rule justifies: an English part claimed by two relations (none, by construction), or a relation whose
   * Japanese words are not next to each other and not a known construction. For tests and the review tools. */
  function collisions(a) {
    const seen = new Map(), out = [];
    for (const r of a.rels || []) for (const [k, p] of r.claims || []) {
      const id = k + ':' + p;
      if (seen.has(id) && seen.get(id) !== r.id) out.push({ k, p, rels: [seen.get(id), r.id] });
      seen.set(id, r.id);
    }
    return out;
  }
  return { offsets, tokenAt, timeline, enWords, align, stem, beats, parts, key, authored, authoredEntries: () => [...AUTH.values()], collisions, NOTE };
})();
