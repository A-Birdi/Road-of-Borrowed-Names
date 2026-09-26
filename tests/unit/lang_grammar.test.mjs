// RB.grammar: every example validates (furigana), texts use ruby for kanji,
// coverage of required points, and example words are mostly known to lookup.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const G = RB.grammar;

export default async (t) => {
  const all = G.all();
  t.log('grammar points', all.length, JSON.stringify({ E: G.byLevel('E').length, I: G.byLevel('I').length, A: G.byLevel('A').length }));
  t.ok(all.length >= 70, 'at least 70 grammar points');
  const ids = new Set();
  const bad = [];
  let unknown = [];
  let tokens = 0;
  for (const p of all) {
    if (ids.has(p.id)) bad.push('duplicate id ' + p.id);
    ids.add(p.id);
    if (!['F', 'E', 'I', 'A'].includes(p.lv)) bad.push(p.id + ' bad lv');
    if (!p.ex || !p.ex.length) bad.push(p.id + ' has no examples');
    for (const s of [p.title, p.en, p.notes].filter(Boolean)) {
      const pr = RB.jp.validateMixed(s);
      if (pr.length) bad.push(p.id + ': ' + pr.map((x) => x.code).join(','));
    }
    const sentences = (p.en.match(/[.!?](\s|$)/g) || []).length;
    if (sentences > 6) bad.push(p.id + ' explanation too long (' + sentences + ' sentences)');
    if (p.pat && RB.jp.validate(p.pat).length) bad.push(p.id + ' pattern invalid');
    for (const ex of p.ex) {
      const pr = RB.jp.validate(ex.jp);
      if (pr.length) bad.push(p.id + ' example "' + ex.jp + '": ' + pr.map((x) => x.code).join(','));
      if (!ex.en) bad.push(p.id + ' example without English');
      for (const tk of RB.jp.parse(ex.jp)) {
        if (tk.punct) continue;
        tokens++;
        const r = RB.jp.lookup(tk);
        if (r.unknown) unknown.push(tk.surface);
      }
    }
  }
  t.eq(bad, [], 'all grammar points valid (furigana on every kanji)');
  t.log('example tokens', tokens, 'unknown to lookup', unknown.length, unknown.slice(0, 20).join(' '));
  t.ok(unknown.length <= tokens * 0.03, 'at most 3% of example tokens lack a dictionary note');

  const need = ['prt_wa', 'prt_ga', 'prt_wo', 'prt_ni', 'prt_de', 'cop_desu', 'v_masu', 'v_nai', 'v_ta', 'v_te', 'v_te_iru', 'v_tai',
    'v_te_kudasai', 'v_naide_kudasai', 'adj_i', 'adj_na', 'conj_kara', 'conj_node', 'toki', 'cond_tara', 'cond_ba', 'cond_to', 'cond_nara',
    'temo', 'noni', 'sou_look', 'you_mitai', 'rashii', 'hazu', 'wake', 'koto_ni_suru', 'koto_ni_naru', 'you_ni_suru', 'te_shimau',
    'te_oku', 'te_aru', 'giving', 'passive', 'causative', 'keigo_sonkei', 'keigo_kenjo', 'casual_contractions', 'adv_monono',
    'adv_nimokakawarazu', 'adv_zaru_wo_enai', 'adv_kanenai', 'adv_wake_dewa_nai', 'adv_ni_suginai', 'adv_dokoroka', 'adv_kara_koso',
    'adv_bakari_ka', 'adv_to_wa_ie', 'adv_koto_ka', 'adv_zu_ni_wa_irarenai', 'adv_to_iu_yori', 'adv_ni_koshita', 'sentence_final', 'indirectness'];
  t.eq(need.filter((id) => !G.get(id)), [], 'required grammar points present');

  // add() for content
  const R2 = load(['core', 'lang']);
  t.eq(R2.grammar.add([{ id: 'x_test', lv: 'E', title: 't', en: 'e', ex: [] }], 'content'), 1, 'add new point');
  t.eq(R2.grammar.add([{ id: 'prt_wa', lv: 'E', title: 't', en: 'e', ex: [] }], 'content'), 0, 'duplicate id ignored');
};
