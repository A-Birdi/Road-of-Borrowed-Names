// Kana かい that Word Help read as 回 "times" (Agnes 6352406289, 6353618099, 6354873848; Local CL-232, CL-236; Cloud
// CC-143 §8, CC-144 §7): each now carries the content's own word@lemma hint, the mechanism the game already uses for
// kana homophones (かめ@甕, うち@内, つる@鶴), not a parser rule. Six tokens: Mio's 怒ったかいがありました (甲斐, "worth"),
// the tide-pool notice and its three answers (貝, "shellfish"), the letter to Natsume's ヤギをかいにいきます (買う,
// "to buy"). In node:
//  1. each of the six reads its word in Word Help;
//  2. the hint changes no word, reading or spacing of the line (its text without the hints is what it was);
//  3. every other kana かい in the game reads as before: the sentence-final particle (78) stays the particle, and the
//     two 回 left are an English explanation of the particle (sb.c_reply, left as it is) and 回(かい) itself.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  // every kana かい token in the content and what Word Help makes of it
  const all = [], seen = new Set();
  const visit = (where, s) => {
    if (typeof s !== 'string' || !s.includes('かい')) return;
    let toks; try { toks = RB.jp.render(s, { spacing: true, vars: {}, furigana: true }).tokens; } catch (e) { return; }
    toks.forEach((tk, i) => {
      if (!tk || tk.surface !== 'かい' || seen.has(s + '#' + i)) return;
      seen.add(s + '#' + i);
      const r = RB.jp.lookup(tk);
      all.push({ where, s, w: r && r.entry ? r.entry.w : '?', pos: r && r.entry ? r.entry.pos : '?' });
    });
  };
  const walk = (where, o, so) => { if (!o || typeof o !== 'object' || so.has(o)) return; so.add(o); for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') visit(where, v); else if (v && typeof v === 'object') walk(where, v, so); } };
  for (const kind of Object.keys(C)) { const v = C[kind]; if (v && typeof v === 'object' && kind !== 'sceneSrc') for (const id of Object.keys(v)) walk(kind + ':' + id, v[id], new Set()); }
  // ---- 1.
  const hinted = all.filter((x) => /かい@/.test(x.s));
  const got = hinted.map((x) => x.where + ' ' + x.w).sort();
  t.eq(got, ['activities:sb.a_letters 買う', 'challenges:sz.school_3 貝', 'challenges:sz.school_3 貝', 'challenges:sz.school_3 貝', 'challenges:sz.school_3 貝', 'scenes:mp.boss_won 甲斐'],
    'the six hinted かい read their words: Mio\'s 甲斐, the notice\'s four 貝, the letter\'s 買う');
  // ---- 2.
  const strip = (s) => s.replace(/(かい)@[^\s」。、]+/g, '$1');
  const same = hinted.filter((x) => RB.jp.plain(x.s) === RB.jp.plain(strip(x.s)) && RB.jp.reading(x.s) === RB.jp.reading(strip(x.s)));
  t.eq(same.length, hinted.length, 'the hints change no word or reading: each line without them is what it was (' + same.length + ' of ' + hinted.length + ')');
  // ---- 3.
  const rest = all.filter((x) => !/かい@/.test(x.s));
  const particle = rest.filter((x) => x.pos === 'prt'), other = rest.filter((x) => x.pos !== 'prt');
  t.ok(all.length === 86 && particle.length === 78, 'every kana かい: ' + all.length + ' (86), the sentence-final particle ' + particle.length + ' (78)');
  t.eq(other.map((x) => x.where + ' ' + x.w).sort(), ['challenges:sb.c_bell_board 回', 'challenges:sb.c_reply 回'],
    'the other two: 回(かい) itself, and the English explanation of the particle (left as it is)');
};
