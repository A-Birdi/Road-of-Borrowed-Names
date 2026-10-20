// RBN audit T01 and T02 (owner-approved, revised per Agnes's review).
// T01: じ/ぢ, ず/づ, ジ/ヂ, ズ/ヅ share their rōmaji, so a kana question never asks for one of them by rōmaji alone: it
// names the base kana and the dakuten mark, or completes a real word with that hint. The target is never in the
// question, and only the target is accepted (no folding). Every other kana's bare prompt is unchanged.
// T02: "Write the kanji in <word>" for a word with more than one kanji names the target's place among the word's
// kanji (a repeated target at one named place); no word is skipped, no reading is given per character, and the choice
// options never include another character of the word. The question says how it counts (Agnes, 15:43Z): kana are not
// counted; a word with the repeat mark 々 counts "characters", each kanji and the mark as one (the mark not shown when
// it is the answer); the wording the learner sees is what is tested.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const K = RB.kana, A = RB.answers, X = RB.exams, T = RB.tasks;
  const s = RB.state.newCampaign({ profile: 'E' });
  s.learn.kanaKnown = 'both';
  RB.game.s = s;

  // ---- T01 ----------------------------------------------------------------------------------------------------
  const PAIRS = { じ: ['ぢ', 'し'], ぢ: ['じ', 'ち'], ず: ['づ', 'す'], づ: ['ず', 'つ'], ジ: ['ヂ', 'シ'], ヂ: ['ジ', 'チ'], ズ: ['ヅ', 'ス'], ヅ: ['ズ', 'ツ'] };
  const romajiOnly = /for “(ji|zu)”|\((ji|zu)\)/;
  const isNonWord = (m) => /^\(not a word\b/.test(m || '');
  for (const ch in PAIRS) {
    const [other, base] = PAIRS[ch];
    const sc = K.isKata(ch) ? 'katakana' : 'hiragana';
    const b = T.kanaStep(ch, { bare: true });
    t.eq(b.prompt.en, 'Write the ' + sc + ' ' + base + ' with dakuten (゛), read “' + K.romaji(ch) + '”.', ch + ': the bare question names ' + base + ' and dakuten');
    t.ok(b.prompt.en.indexOf(ch) < 0 && b.prompt.en.indexOf(other) < 0, ch + ': neither kana of the pair is in the question');
    t.eq(b.accept, [ch], ch + ': only the target is accepted');
    t.ok(A.check(ch, b).ok, ch + ': the target is right');
    const wrong = A.check(other, b);
    t.ok(!wrong.ok, ch + ': ' + other + ' is not folded into it');
    const fb = wrong.feedback.find((f) => f.code === 'same_sound');
    t.ok(fb && fb.en.indexOf(base + ' with dakuten') >= 0 && fb.en.indexOf(PAIRS[other][1] + ' with dakuten') >= 0, ch + ': writing ' + other + ' says both are read alike and names each base kana');
    t.ok(b.explain.en.indexOf(base + ' with dakuten') >= 0, ch + ': the explanation after answering names the answer and its base');
    // every word completion over many draws: a real word, the base-and-dakuten hint, the target never shown
    const seen = new Set();
    for (let c = 0; c < 40; c++) {
      s.learn.clock = c;
      const w = T.kanaStep(ch, {});
      t.ok(!romajiOnly.test(w.prompt.en), ch + ': never asked by rōmaji alone (draw ' + c + ')');
      t.ok(w.prompt.en.indexOf(ch) < 0 && (!w.template || (w.template.before + w.template.after).indexOf(ch) < 0 || w.word.r.split(ch).length > 2), ch + ': the target is not in the question (draw ' + c + ')');
      if (w.template) {
        seen.add(w.word.r);
        t.ok(!isNonWord(w.word.m), ch + ': completed only in a real word, not ' + w.word.r + ' “' + w.word.m + '”');
        t.ok(w.prompt.en.indexOf('(' + base + ' with dakuten ゛, read ' + K.romaji(ch) + ')') >= 0, ch + ': the completion gives the base-and-dakuten hint');
      }
    }
    s.learn.clock = 0;
    t.log(ch + ': word completions drawn: ' + (Array.from(seen).join(' ') || 'none (bare only)'));
  }
  // ヅ's only fitting entry used to be スヅ, a deliberate non-word from a spotting task
  t.ok(!T.kanaWordIndex().filter((e) => e.r.indexOf('ヅ') >= 0 && !isNonWord(e.m)).some((e) => e.r === 'スヅ'), 'スヅ is a non-word entry');
  // the exams' kana rows (both scripts, every mode, ten draws): no rōmaji-only question for the pair kana
  for (const id of ['k:じ', 'k:ぢ', 'k:ず', 'k:づ', 'k:ジ', 'k:ヂ', 'k:ズ', 'k:ヅ']) {
    for (const mode of ['hand', 'ime', 'choice']) for (let n = 0; n < 10; n++) {
      const q = X.question(s, id, mode, n);
      t.ok(q && !romajiOnly.test(q.prompt.en) && q.prompt.en.indexOf(id.slice(2)) < 0 && q.accept.join('') === id.slice(2), id + ' ' + mode + ' ' + n + ': ' + (q && q.prompt.en));
    }
  }
  // the Foundations single-kana blank in an authored word asks the same item with the same hint
  const f = RB.state.newCampaign({ profile: 'F' });
  f.learn.kanaKnown = 'none'; f.learn.taught = { づ: true };
  RB.game.s = f;
  const blank = T.prepare({ kind: 'write', answer: 'つづく', accept: ['つづく'], mode: 'kana', prompt: { en: 'Write “to continue”.' } });
  t.eq([blank.answer, blank.template.before, blank.template.after], ['づ', 'つ', 'く'], 'Foundations: づ is the one kana blanked in つづく');
  t.ok(/\(つ with dakuten ゛, read zu\)\.$/.test(blank.prompt.en) && !A.check('ず', blank).ok, 'Foundations blank: named by つ and dakuten; ず is still wrong');
  f.learn.taught = { か: true };
  const kb = T.prepare({ kind: 'write', answer: 'かく', accept: ['かく'], mode: 'kana', prompt: { en: 'Write it.' } });
  t.eq([kb.answer, kb.prompt.en], ['か', 'Write it. Write the missing kana (ka).'], 'Foundations blank for another kana keeps its rōmaji hint');
  RB.game.s = s;
  // inside a word too: つずく for つづく says why, and is wrong
  const tz = A.check('つずく', { accept: ['つづく'], mode: 'kana' });
  t.ok(!tz.ok && tz.feedback.some((x) => x.code === 'same_sound'), 'つずく for つづく: wrong, with the same-sound note');
  // regression: every other taught kana's bare question and explanation are as before
  const changed = [];
  let others = 0;
  for (const g of RB.kanaLessons.groups) for (const x of g.kana) {
    const ch = x.k || x.ch;
    if (PAIRS[ch]) continue;
    others++;
    const q = T.kanaStep(ch, { bare: true });
    const rom = K.romaji(ch);
    if (q.prompt.en !== 'Write the ' + (K.isKata(ch) ? 'katakana' : 'hiragana') + ' for “' + rom + '”.' || q.explain.en !== ch + ' is read ' + rom + '.' || q.accept.join('') !== ch) changed.push(ch);
  }
  t.eq(changed, [], 'the other ' + others + ' taught kana keep their bare question');
  t.ok(others > 150, 'the regression covers the lesson groups (' + others + ' kana)');

  // ---- T02 ----------------------------------------------------------------------------------------------------
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  const kanjiOf = (w) => Array.from(w).filter((c) => K.isKanji(c));
  const all = RB.kanjiInfo.all();
  let words = 0, multi = 0, odo = 0, mixed = 0, repeated = 0;
  const bad = [];
  for (const e of all) {
    const ws = e.words || [];
    const id = 'j:' + e.ch;
    for (let n = 0; n < ws.length; n++) {
      const w = ws[n];
      words++;
      const kj = kanjiOf(w.w);
      const wq = X.question(s, id, 'hand', n), cq = X.question(s, id, 'choice', n);
      if (!wq || !cq) { bad.push(w.w + ': skipped'); continue; }
      if (wq.accept.join('') !== e.ch) bad.push(w.w + ': accepts ' + wq.accept.join(','));
      if (kj.length > 1) {
        multi++;
        if (w.w.indexOf('々') >= 0) odo++;
        if (kj.length < Array.from(w.w).length) mixed++;
        if (kj.filter((c) => c === e.ch).length > 1) repeated++;
        // the learner-visible wording (Agnes, 15:43Z): a word with 々 counts "characters" and says each kanji and the
        // repeat mark count as one (the mark itself not shown when it is the answer); a word without it counts
        // "kanji"; a word with kana says kana are not counted; a word without kana never says so
        const hasOdo = w.w.indexOf('々') >= 0, hasKana = kj.length < Array.from(w.w).length;
        const unit = hasOdo ? 'character' : 'kanji';
        const note = (hasOdo ? ' Each kanji and the repeat mark' + (e.ch === '々' ? '' : ' 々') + ' count as one' + (hasKana ? '; kana are not counted.' : '.') : hasKana ? ' Kana are not counted.' : '');
        const m = new RegExp('^Write the (\\w+) ' + unit + ' of (.+) \\(“[^”]*”\\)\\.(.*)$').exec(wq.prompt.en);
        const mc = new RegExp('^Which is the (\\w+) ' + unit + ' of (.+) \\(“[^”]*”\\)\\?(.*)$').exec(cq.prompt.en);
        if (!m || kj[ORD.indexOf(m[1])] !== e.ch || m[2] !== w.r || m[3] !== note) bad.push(w.w + ' ' + e.ch + ': write prompt ' + wq.prompt.en);
        if (!mc || kj[ORD.indexOf(mc[1])] !== e.ch || mc[3] !== note) bad.push(w.w + ' ' + e.ch + ': choice prompt ' + cq.prompt.en);
        if (/ kanji of /.test(wq.prompt.en + cq.prompt.en) && hasOdo) bad.push(w.w + ': a word with 々 counted as kanji');
        if (e.ch === '々' && (wq.prompt.en + cq.prompt.en).indexOf('々') >= 0) bad.push(w.w + ': 々 shown in its own question');
        if (wq.explain.en.indexOf('its ' + (m ? m[1] : '?') + ' ' + unit) < 0) bad.push(w.w + ': explanation');
      } else if (wq.prompt.en !== 'Write the kanji in ' + w.r + ' (“' + w.m + '”).' || cq.prompt.en !== 'Which kanji is in ' + w.r + ' (“' + w.m + '”)?') bad.push(w.w + ': one-kanji wording changed');
      const ok = cq.options.filter((o) => o.ok);
      if (ok.length !== 1 || ok[0].jp.indexOf('{' + e.ch + '|') !== 0) bad.push(w.w + ': answer option');
      const rt = ok[0] && /\|([^}]*)\}/.exec(ok[0].jp)[1];
      if (rt !== (e.readings[0] || (w.w === e.ch ? w.r : ''))) bad.push(w.w + ': answer ruby ' + rt);
      for (const o of cq.options) if (!o.ok && Array.from(w.w).indexOf(/^\{([^|]+)\|/.exec(o.jp)[1]) >= 0) bad.push(w.w + ': distractor ' + o.jp + ' is in the word');
    }
  }
  t.eq(bad.slice(0, 10), [], 'every example word of every kanji: the right place named, no skip, no in-word distractor (' + bad.length + ' problems)');
  t.log('T02: ' + words + ' words over ' + all.length + ' kanji; ' + multi + ' with more than one kanji (' + mixed + ' mixed with kana, ' + odo + ' with 々, ' + repeated + ' with the target twice)');
  t.ok(multi > 7000 && mixed > 1000 && odo >= 30 && repeated >= 10, 'the sweep reaches mixed words, 々 and repeated targets');
  // explicit cases
  const ask = (ch, word, mode, k) => {
    const ws = RB.kanjiInfo.get(ch).words;
    const i = ws.findIndex((w) => w.w === word);
    if (i < 0) return null;
    return X.question(s, 'j:' + ch, mode, i + (k || 0) * ws.length);
  };
  const P = (ch, word) => { const q = ask(ch, word, 'hand'); return q ? q.prompt.en : 'no ' + word + ' for ' + ch; };
  t.eq(P('学', '学校'), 'Write the first kanji of がっこう (“school”).', '学 in 学校: first');
  t.eq(P('校', '学校'), 'Write the second kanji of がっこう (“school”).', '校 in 学校: second');
  t.eq(P('物', '食べ物'), 'Write the second kanji of たべもの (“food”). Kana are not counted.', 'mixed kana and kanji: べ is not counted, and the question says so');
  t.eq(P('食', '食べ物'), 'Write the first kanji of たべもの (“food”). Kana are not counted.', '食 in 食べ物: first');
  t.eq(P('時', '時々'), 'Write the first character of ときどき (“sometimes”). Each kanji and the repeat mark 々 count as one.', '時 in 時々: the first character, the counting said');
  t.eq(P('々', '時々'), 'Write the second character of ときどき (“sometimes”). Each kanji and the repeat mark count as one.', '々 in 時々: the second character, never called a kanji, the mark not shown');
  t.eq(P('畑', '段々畑'), 'Write the third character of だんだんばたけ (“terraced fields”). Each kanji and the repeat mark 々 count as one.', '畑 is the third character of 段々畑, 々 counted once');
  t.eq(P('代', '先々代'), 'Write the third character of せんせんだい (“the head of the house two generations back”). Each kanji and the repeat mark 々 count as one.', '代 is the third character of 先々代');
  t.ok(/^Write the fourth character of さんさんくど .*\. Each kanji and the repeat mark 々 count as one\.$/.test(P('度', '三々九度')), '度 is the fourth character of 三々九度');
  const dq = ask('々', '代々', 'choice');
  t.eq(dq && dq.prompt.en, 'Which is the second character of だいだい (“from generation to generation”)? Each kanji and the repeat mark count as one.', 'Agnes\'s 19:41Z case, だいだい: the second character, not "the second kanji"');
  t.eq(ask('々', '時々', 'hand').explain.en, '時々（ときどき） — sometimes. The answer is its second character: 々, the repeat mark, which repeats the kanji before it.', 'after answering, the explanation names 々 as the repeat mark');
  // a repeated target: each place is named exactly, and either way the answer is the target
  const one = [0, 1].map((k) => ask('一', '一字一句', 'hand', k)).filter(Boolean);
  t.eq(one.map((q) => q.prompt.en.split(' ')[2]).sort(), ['first', 'third'], '一 in 一字一句: asked at the first and at the third place');
  t.ok(one.every((q) => q.accept.join('') === '一'), 'the repeated target is still the only answer');
  // choice: the word's other characters (and its 々) are never offered
  for (let k = 0; k < 12; k++) {
    const q = ask('時', '時々', 'choice', k);
    t.ok(q && !q.options.some((o) => !o.ok && /^\{(々)\|/.test(o.jp)), '時々: 々 is not a distractor (' + k + ')');
    const g = ask('学', '学校', 'choice', k);
    t.ok(g && !g.options.some((o) => /^\{校\|/.test(o.jp)), '学校: 校 is not offered for 学 (' + k + ')');
  }
  const od = ask('々', '時々', 'choice');
  t.eq(od.options.find((o) => o.ok).jp, '{々|}', '々 as the answer: shown as the mark, not with the word\'s whole reading');
  // answering with the word's other kanji is wrong
  const gq = ask('学', '学校', 'hand');
  t.ok(!A.check('校', gq).ok && A.check('学', gq).ok, '学校, first kanji: 校 is wrong, 学 is right');
  t.ok(/The answer is its first kanji\.$/.test(gq.explain.en), 'the explanation names the place');
  t.ok(/The answer is its third character\. Each kanji and the repeat mark 々 count as one\.$/.test(ask('畑', '段々畑', 'hand').explain.en), 'and how it was counted');
};
