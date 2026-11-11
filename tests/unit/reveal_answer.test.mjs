// RBN-QA-194, the answer "I don't know" shows (Agnes 6714836104, with native instances in Wings 2, 6, 7, 9 and 10; Local
// CL-714, CL-770; Cloud CC-544; Agnes 6803414018): for a choose or listen step the reveal took the right option's
// English, else its Japanese, and printed it escaped, so a Japanese answer showed its {kanji|reading} source while the
// same option's button showed it with readings over the kanji. Now (RB.challenge.choiceAnswerHtml):
//  1. the four mediation answers of Wing 9 (Yosaku and Otoku) and of Wing 10 (Soan and Kohaku), at every tier: the
//     Japanese as its button shows it (the same rendering), readings over the kanji, no markup;
//  2. outside the Hall, Hisae's questions on the Keepers' Road: the same;
//  3. the field that gave the answer decides, never the characters in it: an English answer is text, escaped, also when
//     it holds Japanese (the listening family's "kite · come") or {kanji|reading} or markup; a bilingual option still
//     reveals its English; an empty English falls back to the Japanese, as before;
//  4. literal markup in either field is shown as text, never made into markup;
//  5. with no Japanese renderer (the fallback), the Japanese without its readings, escaped, never its markup;
//  6. no right option, or one with neither field: nothing, without throwing;
//  7. every authored choose and listen step (all of RB.content): each Japanese answer shows no markup and is rendered as
//     its button renders it; each English answer is exactly its escaped English;
//  8. the written, ordered and forged answers are read as before (their source lines unchanged).
// The reveal on screen (the real "I don't know", Continue, Step away and a second offer, the record kept, the grading)
// is tests/e2e/reveal_answer.mjs.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, esc = RB.util.esc;
  const H = RB.challenge.choiceAnswerHtml;
  t.ok(typeof H === 'function', '0 the reveal\'s choice answer is the challenge\'s own (RB.challenge.choiceAnswerHtml)');
  const reveal = (opts) => { try { return typeof H === 'function' ? H(opts) : null; } catch (e) { return 'THREW ' + e.message; } };
  const norm = (h) => String(h).replace(/ data-src="[^"]*"/g, '');
  const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');
  // what the eye reads: the readings (rt) left out, the tags gone, the spaces too
  const read = (h) => unesc(String(h).replace(/<rt>[\s\S]*?<\/rt>/g, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, '');
  const MARKUP = /\{[^|{}]+\|[^{}]+\}/;
  const plain = (jp) => RB.jp.plain(jp).replace(/\s+/g, '');
  // the button for an option, as the choice pane draws it (src/ui/65_challenge.js, the choice tab)
  const button = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' : '');
  // a Japanese answer, shown as its button shows it
  const asButton = (step) => {
    const ok = step.options.find((o) => o.ok);
    const h = reveal(step.options);
    const btn = (RB.challenge.choicesFor(step) || []).find((o) => o.ok) || ok;
    return { h, ok, same: h != null && norm(h) === norm(button(btn)), ruby: /<ruby>/.test(String(h)), markup: MARKUP.test(read(h)) || /[{}|]/.test(read(h)), text: read(h) === plain(ok.jp) };
  };

  // ---- 1. Wings 9 and 10: the four mediation answers, every tier
  for (const [wing, id] of [['Wing 9', 'hall.w9.quarrel'], ['Wing 10', 'hall.w10.vigil']]) {
    const acts = C.encounters[id].social.actions.filter((a) => a.task);
    t.eq(acts.map((a) => a.id), ['calm', 'ask', 'together', 'blunt'], '1 ' + wing + ' (' + id + '): its four answers with a task');
    for (const a of acts) {
      const rows = ['F', 'E', 'I', 'A'].map((tier) => Object.assign({ tier }, asButton(a.task[tier])));
      const ok0 = a.task.F.options.find((o) => o.ok);
      t.ok(!ok0.en && MARKUP.test(ok0.jp) && rows.every((r) => r.ok.jp === ok0.jp && r.same && r.ruby && !r.markup && r.text),
        '1 ' + wing + ' ' + a.id + ': a Japanese-only answer with readings, shown at each tier as its button shows it, no markup ' + JSON.stringify(rows.filter((r) => !(r.same && r.ruby && !r.markup && r.text)).map((r) => r.tier + ' ' + String(r.h).slice(0, 80))));
    }
  }

  // ---- 2. outside the Hall: Hisae's questions (the Keepers' Road), the answer that asks what she means by "call"
  {
    const a = C.encounters['kr.hisae'].social.actions.find((x) => x.id === 'ask_mean');
    const rows = ['F', 'I'].map((tier) => Object.assign({ tier }, asButton(a.task[tier])));
    t.ok(rows.every((r) => !r.ok.en && r.same && r.ruby && !r.markup && r.text), '2 Hisae, "what she means by call": as its button shows it, no markup ' + JSON.stringify(rows.map((r) => String(r.h).slice(0, 60))));
  }

  // ---- 3. the field decides
  {
    const L16 = C.challenges['ws.L16'].tiers.E[0];
    const okL = L16.options.find((o) => o.ok);
    const h = reveal(L16.options);
    t.ok(L16.kind === 'listen' && okL.en === 'きて · come' && !okL.jp && h === esc(okL.en) && !/<ruby>/.test(h), '3 a listening answer in English that holds Japanese (ws.L16, E): its English as text, not rendered ' + JSON.stringify(h));
    const bi = C.challenges['sg.c_crates'].tiers.E[0];
    const okB = bi.options.find((o) => o.ok);
    t.ok(okB.jp && okB.en === 'to the lighthouse' && reveal(bi.options) === esc('to the lighthouse'), '3 a bilingual option (sg.c_crates, E): still its English ' + JSON.stringify(reveal(bi.options)));
    const stretch = C.challenges['hall.w9.riddle'].stretchA[0];
    const okS = stretch.options.find((o) => o.ok);
    t.ok(okS.en && !okS.jp && reveal(stretch.options) === esc(okS.en), '3 an English-only answer (the riddle stone\'s saying, hall.w9.riddle): its English ' + JSON.stringify(String(reveal(stretch.options)).slice(0, 60)));
    const withMarkup = [{ en: '{傘|かさ} を', ok: true }, { en: 'no', ok: false }];
    t.eq(reveal(withMarkup), '{傘|かさ} を', '3 an English answer that holds {kanji|reading} is text: shown as written');
    const empty = [{ en: '', jp: '{傘|かさ} を {返|かえ}す', ok: true }, { jp: 'いいえ', ok: false }];
    const he = reveal(empty);
    t.ok(norm(he) === norm(RB.ui.jhtml('{傘|かさ} を {返|かえ}す')) && /<ruby>/.test(he) && read(he) === '傘を返す', '3 an empty English falls back to the Japanese, rendered ' + JSON.stringify(String(he).slice(0, 80)));
  }

  // ---- 4. literal markup, both fields
  {
    const en = '<b>bold</b> & "quoted"';
    const he = reveal([{ en, ok: true }]);
    t.ok(he === esc(en) && !/<b>/.test(he) && unesc(he) === en, '4 English with markup: shown as text ' + JSON.stringify(he));
    const jp = '<b>x</b> {傘|かさ} を';
    const hj = reveal([{ jp, ok: true }]);
    t.ok(!/<b>/.test(String(hj)) && /&lt;b&gt;/.test(String(hj)) && /<ruby>/.test(String(hj)), '4 Japanese with markup: shown as text, its readings still over the kanji ' + JSON.stringify(String(hj).slice(0, 160)));
  }

  // ---- 5. the renderer's fallback
  {
    const keep = RB.jp.render;
    RB.jp.render = null;
    const ok = C.encounters['hall.w9.quarrel'].social.actions[0].task.F.options.find((o) => o.ok);
    let h = null;
    try { h = reveal([ok]); } finally { RB.jp.render = keep; }
    t.ok(h != null && !/<ruby>/.test(h) && !/[{}|]/.test(read(h)) && read(h) === plain(ok.jp) && /^<span class="jline" lang="ja">/.test(h), '5 with no renderer: the Japanese without its readings, no markup ' + JSON.stringify(String(h).slice(0, 80)));
    const hb = (() => { RB.jp.render = null; try { return reveal([{ jp: '<i>x</i> {傘|かさ}', ok: true }]); } finally { RB.jp.render = keep; } })();
    t.ok(!/<i>/.test(String(hb)) && /&lt;i&gt;/.test(String(hb)), '5 and literal markup stays text there too ' + JSON.stringify(hb));
  }

  // ---- 6. nothing to show
  t.eq([reveal([{ jp: 'あ', ok: false }]), reveal([{ ok: true }]), reveal([]), reveal(undefined)], ['', '', '', ''], '6 no right option, or one with neither field, or no options: nothing, no error');

  // ---- 7. every authored choose and listen step
  {
    const seen = new Set();
    const steps = [];
    const walk = (o, d) => {
      if (!o || typeof o !== 'object' || d > 12 || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { o.forEach((x) => walk(x, d + 1)); return; }
      if ((o.kind === 'choose' || o.kind === 'listen') && Array.isArray(o.options)) steps.push(o);
      for (const k in o) walk(o[k], d + 1);
    };
    for (const k of Object.keys(C)) walk(C[k], 0);
    let jp = 0, ruby = 0, en = 0, enJp = 0;
    const bad = [];
    for (const st of steps) {
      const ok = st.options.find((o) => o.ok) || {};
      const h = reveal(st.options);
      if (ok.en) {
        en++;
        if (/[぀-ヿ一-鿿]/.test(ok.en)) enJp++;
        if (h !== esc(ok.en)) bad.push('en ' + ok.en.slice(0, 40));
      } else if (ok.jp) {
        jp++;
        if (MARKUP.test(ok.jp)) ruby++;
        if (norm(h) !== norm(RB.ui.jhtml(ok.jp)) || /[{}|]/.test(read(h)) || read(h) !== plain(ok.jp)) bad.push('jp ' + ok.jp.slice(0, 40));
      }
    }
    t.ok(steps.length > 2000 && jp > 1000 && ruby > 1000 && en > 1000 && enJp > 50 && !bad.length,
      '7 every authored choose and listen step (' + steps.length + '): ' + jp + ' Japanese answers (' + ruby + ' with readings), each rendered with no markup; ' + en + ' English answers (' + enJp + ' holding Japanese), each its escaped English ' + JSON.stringify(bad.slice(0, 4)));
  }

  // ---- 8. the written, ordered and forged answers: their lines as before
  {
    const src = fs.readFileSync(new URL('../../src/ui/65_challenge.js', import.meta.url), 'utf8');
    const lines = ["if (step.kind === 'write') ans = plain(step.answer);", "if (step.kind === 'order') ans = step.answer.map(plain).join(' ');", "if (step.kind === 'forge') ans = step.answerReading;"];
    t.ok(lines.every((l) => src.split(l).length === 2), '8 the written, ordered and forged answers are read as before (each line once, unchanged)');
    t.ok(/\(ansHtml != null \? ansHtml : esc\(ans\)\)/.test(src) && /if \(step\.kind === 'choose' \|\| step\.kind === 'listen'\) ansHtml = choiceAnswerHtml\(step\.options\);/.test(src), '8 only the choose and listen answer takes the new path; the others are escaped as before');
  }
};
