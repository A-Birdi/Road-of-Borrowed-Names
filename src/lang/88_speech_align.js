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
  const BE_S = new Set('it that he she there here what who where how let this'.split(' '));
  function lemmas(word) {
    const w = fold(String(word)).toLowerCase().replace(/\u2019/g, "'");
    const out = [];
    const add = (x) => { if (!x) return; const b = IRR[x] || x; out.push(b, stem(b)); };
    const m = /^([a-z]+)'([a-z]+)$/.exec(w);
    if (m) {
      const [, a, b] = m;
      if (b === 't' && /n$/.test(a)) { const v = a.slice(0, -1); add(v === 'wo' ? 'will' : v === 'ca' ? 'can' : v === 'sha' ? 'shall' : v === 'ai' ? 'be' : v); out.push('not'); }
      else if (b === 'm') { add(a); out.push('be'); }
      else if (b === 're') { add(a); out.push('be'); }
      else if (b === 've') { add(a); out.push('have'); }
      else if (b === 'll') { add(a); out.push('will'); }
      else if (b === 'd') { add(a); out.push('would', 'have'); }
      else if (b === 's') { add(a); if (a === 'let') out.push('us', 'let'); else if (BE_S.has(a)) out.push('be'); }
      else add(w.replace(/'/g, ''));
    } else if (/n't$/.test(w)) { add(w.replace(/n't$/, '')); out.push('not'); }
    else w.split('-').forEach(add);
    return [...new Set(out.filter(Boolean))];
  }
  function enWords(en) {
    const out = [];
    const text = String(en || '');
    let m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(text))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length, stems: m[0].split('-').map(stem).filter(Boolean), lem: lemmas(m[0]) });
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
  function heads(m) {
    const out = [];
    for (const raw of String(m || '').replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/[“”"…!?.]/g, ' ').split(/[;,/]/)) {
      let ws = raw.trim().toLowerCase().split(/[\s-]+/).filter(Boolean);
      if (ws[0] === 'to' && ws.length > 1) ws = ws.slice(1);
      while (ws.length > 1 && /^(the|a|an)$/.test(ws[0])) ws = ws.slice(1);
      if (!ws.length) continue;
      while (ws.length > 1 && (LIGHT.has(ws[0]) || PREP.has(ws[0]))) ws = ws.slice(1);
      const h = ws[0];
      out.push(IRR[h] || h, stem(IRR[h] || h));
    }
    return out.filter((w) => w && w.length > 0);
  }
  // words whose dictionary meaning the English rarely repeats: humble and honorific verbs, being and having, naming,
  // giving and receiving (申します "I'm …", いらっしゃる "is here", いただきます "I'll have …")
  const EXTRA = {
    '申す': 'be name call', '言う': 'call name tell', 'いる': 'be here stay', 'おる': 'be here stay', 'ある': 'be there',
    'ござる': 'be have', 'いらっしゃる': 'be come go here', '参る': 'go come', 'いたす': 'do', 'なさる': 'do', 'する': 'do make play',
    'くださる': 'give', 'くれる': 'give', 'いただく': 'get receive have eat drink take', 'もらう': 'get receive have',
    'あげる': 'give', '差し上げる': 'give', 'やる': 'give do', '思う': 'think guess suppose feel', '存じる': 'know think',
    'なる': 'become get turn', 'できる': 'can able done ready', '分かる': 'understand know see get', 'わかる': 'understand know see get',
    '来る': 'come here', '行く': 'go head come', '見る': 'see look watch', '拝見': 'see look', 'ご覧': 'see look', '召し上がる': 'eat drink have',
    'いい': 'good fine okay ok right', '良い': 'good fine okay ok right', 'よい': 'good fine okay right',
  };
  // what a particle, the copula or an ending does, in the English that would say it (the grammar tier)
  const GRAM = {
    'と': 'and with', 'の': 'of', 'に': 'to in at on into for', 'へ': 'to toward towards for', 'で': 'at in on by with',
    'から': 'from since because so after', 'まで': 'until till to', 'より': 'than from', 'も': 'too also even either both',
    'や': 'and or', 'か': 'or whether', 'だけ': 'only just', 'しか': 'only', 'ばかり': 'only just', 'など': 'such like',
    'けど': 'but though although', 'けれど': 'but though although', 'けれども': 'but though although', 'が': 'but',
    'のに': 'although though but even', 'ので': 'because so since', 'ながら': 'while as', 'ても': 'even though if', 'でも': 'but even though',
    'たら': 'if when', 'ば': 'if', 'なら': 'if', 'ね': 'right huh eh', 'ねえ': 'not no', 'くらい': 'about around', 'ぐらい': 'about around',
    'です': 'be', 'だ': 'be', 'でした': 'be', 'だった': 'be', 'である': 'be', 'でございます': 'be', 'じゃ': 'be', 'じゃない': 'not be',
    'ない': 'not no never nothing nobody', 'ません': 'not no never', 'ず': 'not without', 'たい': 'want wish like',
    'ましょう': 'let shall', 'でしょう': 'probably must will surely right', 'だろう': 'probably must will surely right',
    'かもしれない': 'maybe might perhaps may', 'かもしれません': 'maybe might perhaps may', 'かも': 'maybe might perhaps',
    'はず': 'should must supposed', 'べき': 'should ought', 'ください': 'please', 'くれ': 'please', 'なさい': 'please',
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
  const NOT_SAID = new Set(['は', 'を', 'よ', 'な', 'さ', 'わ', 'ぞ', 'ぜ', 'って', 'て', 'ます']);
  // what an inflection adds (the lookup's own labels: src/lang/20_jp.js deinflect)
  const FORMS = [
    [/negative/i, 'not no never nothing nobody'], [/want to/i, 'want wish like'], [/volitional|let's/i, 'let shall'],
    [/potential/i, 'can could able'], [/conditional|～たら|～ば\b|if/i, 'if when'], [/～ても|even if/i, 'even though if'],
    [/must|have to|なければ/i, 'must have need'], [/causative/i, 'make let'], [/imperative|～なさい/i, 'please'],
  ];
  const FUNCTION_POS = /^(prt|aux|cop|conj|suf|pref)/;
  // after a て-form these are endings, not words of their own (～ている is still doing, ～てある has been done,
  // ～ておく in advance …): the English rarely has a word for them, and ～てください is "please"
  const TE_AUX = { 'いる': '', 'おる': '', 'ある': '', 'おく': '', 'しまう': '', 'くる': '', 'いく': '', '行く': '', '来る': '',
    'もらう': '', 'いただく': '', 'くれる': '', 'くださる': '', 'ください': 'please', 'みる': 'try', '見る': 'try', 'あげる': '', 'やる': '' };
  function align(tokens, en, opts) {
    opts = opts || {};
    const words = enWords(en);
    const map = tokens.map(() => []);
    const gmap = tokens.map(() => []);
    if (!words.length) return { words, map, gmap };
    const look = opts.lookup || ((t) => (RB.jp.lookup ? RB.jp.lookup(t) : null));
    const nameStems = opts.name ? String(opts.name).split(/[\s-]+/).map(stem).filter(Boolean) : [];
    const total = tokens.reduce((n, t) => n + String((t && t.surface) || '').length, 0) || 1;
    // where a word is in its line, from 0 to 1; when both lines have as many sentences, within its own sentence, so a
    // word is looked for in the English sentence that says it
    const jpEnd = [], enEnd = [];
    tokens.forEach((t, i) => { if (t && t.punct && /[。！？!?]/.test(String(t.surface || ''))) jpEnd.push(i); });
    const text = String(en || '');
    words.forEach((w, k) => { const next = words[k + 1]; const gap = text.slice(w.end, next ? next.start : text.length); if (/[.!?]/.test(gap) && next) enEnd.push(k); });
    const jpS = jpEnd.filter((i) => tokens.slice(i + 1).some((t) => t && !t.punct)).length + 1, enS = enEnd.length + 1;
    const bySentence = jpS > 1 && jpS === enS;
    const sentenceOf = (ends, x) => { let n = 0; while (n < ends.length && x > ends[n]) n++; return n; };
    const enPos = words.map((w, k) => {
      if (!bySentence) return words.length > 1 ? k / (words.length - 1) : 0;
      const sn = sentenceOf(enEnd, k), a = sn ? enEnd[sn - 1] + 1 : 0, b = sn < enEnd.length ? enEnd[sn] : words.length - 1;
      return (sn + (b > a ? (k - a) / (b - a) : 0)) / enS;
    });
    const rel = (k) => enPos[k];
    const forms = (w) => w.stems.concat(w.lem);
    const cands = [], gcands = [];
    let pos = 0;
    // the same for each Japanese word, by its characters
    const jpPos = [], jpSn = [];
    if (bySentence) {
      const ends = jpEnd.slice(0, jpS - 1);
      let sn = 0, start = 0;
      const lens = tokens.map((t) => String((t && t.surface) || '').length);
      const sentLen = [];
      { let acc = 0, s2 = 0; tokens.forEach((t, i) => { acc += lens[i]; if (i === ends[s2] || i === tokens.length - 1) { sentLen.push(acc); acc = 0; s2++; } }); }
      let acc = 0;
      tokens.forEach((t, i) => {
        jpPos[i] = (sn + (sentLen[sn] ? acc / sentLen[sn] : 0)) / jpS;
        jpSn[i] = sn;
        acc += lens[i];
        if (i === ends[sn]) { sn++; acc = 0; start = i + 1; }
      });
    }
    tokens.forEach((t, i) => {
      const here = bySentence ? jpPos[i] : pos / total;
      pos += String((t && t.surface) || '').length;
      if (!t || t.punct) return;
      let want = [], gwant = [];
      if (t.ph) want = nameStems; // the player's name, in the English as it is shown
      else {
        let r = null;
        try { r = look(t, i); } catch (e) { r = null; }
        const e = r && r.entry;
        if (!e || r.unknown) return;
        const w0 = e.w, sf = String(t.surface || '');
        let pj = i - 1;
        while (pj >= 0 && tokens[pj] && tokens[pj].punct) pj--;
        const afterTe = pj >= 0 && tokens[pj] && /[てで]$/.test(String(tokens[pj].surface || ''));
        if (afterTe && TE_AUX[w0] != null) {
          gwant = TE_AUX[w0] ? TE_AUX[w0].split(' ') : [];
          for (const f of r.forms || []) for (const [re, ws] of FORMS) if (re.test(f)) gwant = gwant.concat(ws.split(' '));
        } else if (FUNCTION_POS.test(e.pos || '') || GRAM[w0] || GRAM[sf]) {
          if (!NOT_SAID.has(sf) && !NOT_SAID.has(w0)) gwant = GRAM[sf] || GRAM[w0] ? String(GRAM[sf] || GRAM[w0]).split(' ') : /^conj/.test(e.pos || '') ? plainWords(e.m) : [];
        } else {
          want = meaningStems(e.m).concat(r.gloss ? meaningStems(r.gloss) : [], heads(e.m), r.gloss ? heads(r.gloss) : [], EXTRA[w0] ? EXTRA[w0].split(' ') : []);
          for (const f of r.forms || []) for (const [re, ws] of FORMS) if (re.test(f)) gwant = gwant.concat(ws.split(' '));
        }
      }
      if (want.length) {
        const set = new Set(want);
        const hits = [];
        words.forEach((w, k) => { if (forms(w).some((s) => s.length > 0 && set.has(s))) hits.push(k); });
        if (hits.length) cands.push({ i, here, hits });
      }
      if (gwant.length) {
        const set = new Set(gwant);
        const hits = [];
        // the copula ends a Japanese sentence and begins an English one ("I'm Ren" for レン です): any "be" in its own
        // sentence will do; every other ending stays near its place
        const cop = set.has('be');
        const near = (k) => (cop && bySentence ? sentenceOf(enEnd, k) === jpSn[i] : Math.abs(rel(k) - here) <= (cop ? 0.5 : 0.3));
        words.forEach((w, k) => { if (w.lem.concat(w.stems).some((s) => set.has(s)) && near(k)) hits.push(k); });
        if (hits.length) gcands.push({ i, here, hits });
      }
    });
    // the most certain first (fewest candidates), each English word used once, the nearer in the sentence preferred
    const used = new Set();
    const assign = (list, into) => {
      list.sort((a, b) => a.hits.length - b.hits.length || a.i - b.i);
      for (const c of list) {
        const free = c.hits.filter((k) => !used.has(k));
        if (!free.length) continue;
        free.sort((a, b) => Math.abs(rel(a) - c.here) - Math.abs(rel(b) - c.here));
        used.add(free[0]);
        into[c.i] = [free[0]];
      }
    };
    assign(cands, map);
    // の as the English 's of the noun before it ("Ren's"), or the pronoun's own case ("my" for 私 の), first;
    // otherwise "of"
    const poss = new Set();
    tokens.forEach((t, i) => {
      if (!t || t.surface !== 'の') return;
      let j = i - 1;
      while (j >= 0 && tokens[j] && tokens[j].punct) j--;
      if (j < 0 || !map[j].length) return;
      const k = map[j][0];
      if (/['\u2019]s$|^(my|your|our|their|his|her|its)$/i.test(words[k].text)) { gmap[i] = [k]; poss.add(i); }
    });
    assign(gcands.filter((c) => !poss.has(c.i)), gmap);
    return { words, map, gmap };
  }
  return { offsets, tokenAt, timeline, enWords, align, stem, beats };
})();
