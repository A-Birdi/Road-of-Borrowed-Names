// RV-1: places where the spoken text (the line without the learner's word spacing, tools/voice/lines.mjs) joins two
// separate words into a written compound that is read differently: {今|いま} {朝|あさ} "now, the morning…" becomes
// 今朝, which a voice reads けさ. For each spoken line: two neighbouring tokens ending and starting in kanji whose joined
// kanji run is a lexicon word with a reading other than the two readings put together.
// Usage: node tools/review/joined_readings.mjs [--json]
import { allLines, RB } from '../voice/lines.mjs';

const kanjiTail = (s) => (s.match(/[一-鿿々〆ヶ]+$/) || [''])[0];
const kanjiHead = (s) => (s.match(/^[一-鿿々〆ヶ]+/) || [''])[0];
const out = [];
for (const l of allLines()) {
  if (l.who === 'narr') continue;
  const toks = RB.jp.parse(l.jp);
  for (let i = 0; i + 1 < toks.length; i++) {
    const a = toks[i], b = toks[i + 1];
    if (a.punct || b.punct) continue;
    const ta = kanjiTail(a.surface || ''), hb = kanjiHead(b.surface || '');
    if (!ta || !hb) continue;
    // the readings of the kanji at the seam, from the furigana groups
    const segR = (t, kan, tail) => {
      const segs = (t.segs || []).filter((s) => /[一-鿿々〆ヶ]/.test(s.t));
      const pick = tail ? segs.slice(-1) : segs.slice(0, 1);
      return pick.length && pick[0].t === kan ? pick[0].r : null;
    };
    const ra = segR(a, ta, true), rb = segR(b, hb, false);
    if (!ra || !rb) continue;
    for (const w of [ta + hb, ta.slice(-1) + hb, ta + hb.slice(0, 1), ta.slice(-1) + hb.slice(0, 1)]) {
      const es = RB.lex && RB.lex.bySurface ? RB.lex.bySurface(w) : [];
      const hit = es.find((e) => e.r && e.r !== (ra.slice(-(ta === w.slice(0, ta.length) ? ra.length : 99)) + rb));
      if (hit && es.every((e) => e.r !== ra + rb)) { out.push({ key: l.key, who: l.who, joined: w, as: hit.r, meant: ra + '+' + rb, text: l.plain, en: l.en }); break; }
    }
  }
}
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else { for (const o of out) console.log(o.key, o.who, o.joined, 'read', o.as, 'meant', o.meant, '|', o.text.slice(0, 50)); console.log(out.length, 'lines'); }
