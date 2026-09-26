// RB.kanaLessons: sequence covers all kana, example words use only taught
// kana, every example word has a lexicon entry, notes are present.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const L = RB.kanaLessons;
const K = RB.kana;

export default async (t) => {
  const G = L.groups;
  t.ok(G.length >= 30, 'hiragana + katakana groups');
  t.eq(G[0].id, 'h_a', 'starts with あ行');
  const firstKata = G.findIndex((g) => g.script === 'kata');
  t.ok(G.slice(0, firstKata).every((g) => g.script === 'hira'), 'hiragana groups first, then katakana');

  // every supported kana is taught somewhere
  const known = L.knownSet();
  const inv = ['hira', 'kata'].map((s) => K.inventory(s));
  const missing = [];
  inv.forEach((v) => v.basic.concat(v.voiced, v.semivoiced, v.long, ['ゃ', 'ゅ', 'ょ', 'っ', 'ャ', 'ュ', 'ョ', 'ッ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ'].filter((c) => (K.isKata(c) ? v === inv[1] : v === inv[0])))
    .forEach((c) => { if (!known.has(c)) missing.push(c); }));
  t.eq(missing, [], 'all basic, voiced, semi-voiced, small and ー taught');

  // example words only use kana taught so far, and each has a lexicon entry
  const bad = [];
  let words = 0;
  G.forEach((g, i) => {
    const ks = L.knownSet(i);
    for (const w of g.words) {
      words++;
      const extra = Array.from(w.w).filter((c) => !ks.has(c));
      if (extra.length) bad.push(g.id + ' ' + w.w + ' uses untaught ' + extra.join(''));
      if (!w.m) bad.push(g.id + ' ' + w.w + ' has no meaning');
      if (!RB.lex.get(w.lemma, w.w)) bad.push(g.id + ' ' + w.w + ' → no lexicon entry ' + w.lemma);
      if (!L.usesOnly(w.w, i)) bad.push(g.id + ' usesOnly mismatch ' + w.w);
    }
    for (const k of g.kana) {
      if (!k.r) bad.push(g.id + ' ' + k.k + ' has no romaji');
      if (!k.note) bad.push(g.id + ' ' + k.k + ' has no note');
      if (RB.jp.validateMixed(k.note).length) bad.push(g.id + ' ' + k.k + ' note has bare kanji');
    }
    for (const n of g.notes) if (RB.jp.validateMixed(n).length) bad.push(g.id + ' note has bare kanji');
    if (g.jp && RB.jp.validate(g.jp).length) bad.push(g.id + ' jp title invalid');
  });
  t.eq(bad, [], 'lesson data valid; examples use only taught kana');
  t.log('kana lesson groups', G.length, 'example words', words);
  t.ok(words >= 150, 'plenty of example words');

  // spot checks
  t.eq(G[L.indexOf('h_ka')].kana.map((k) => k.r), ['ka', 'ki', 'ku', 'ke', 'ko'], 'romaji per kana');
  t.ok(/shi/.test(L.get('h_sa').kana.find((k) => k.k === 'し').note), 'し note says shi');
  t.ok(/tsu/.test(L.get('h_ta').kana.find((k) => k.k === 'つ').note), 'つ note says tsu');
  t.ok(/doubles/.test(L.get('h_sokuon').kana[0].note), 'っ note: doubles the next consonant');
  t.ok(!L.knownSet(0).has('か') && L.knownSet(1).has('か'), 'knownSet(i) grows by group');
  t.eq(L.groupOf('ゃ'), L.indexOf('h_yoon'), 'groupOf');
};
