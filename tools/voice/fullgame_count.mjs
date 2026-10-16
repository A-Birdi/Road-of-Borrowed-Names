// VA-1 planning (not the audition): how many distinct recordings a whole-game voice batch would need, and how many
// characters, resolved the way the game would play them. Nothing is generated.
//  - A line said by "whoever travels with you" (`comp`) is recorded once per companion it can belong to, in that
//    companion's voice: its own condition, else the scene branch it sits in (`!if comp=ren -> ren`), else a scene named
//    for one companion, else all four (tools/voice/attribution.mjs; RV-0160, C-95: the line's condition alone recorded
//    branch-only lines for all four).
//  - The player's lines are recorded twice, Voice A and Voice B (and never for "player None").
//  - Suzu's lines (as herself or as the companion) are recorded again in Kansai where the dialect table changes them.
//  - The narrator is one female narrator.
//  - Recordings are distinct by (speaker identity, player voice, dialect, spoken text, delivery); two characters
//    saying the same words are two recordings, and the same words in a different expression are kept apart.
//  - A line with a run-time variable ($name, a boat's name) cannot be recorded in full; it is counted apart.
//  - Each recording also counts its morae (from the game's own readings) and pauses, so a production estimate can
//    turn a speaking rate measured on real audition takes into duration (docs/future/voice/PRODUCTION_ESTIMATE.md).
// Usage: node tools/voice/fullgame_count.mjs [--json]
import { RB, allLines } from './lines.mjs';
import { branches, companionsOf } from './attribution.mjs';

const BR = {};
const branchOf = (l) => (BR[l.scene] || (BR[l.scene] = branches(RB.content.scenes[l.scene])))[l.idx] || null;
const basis = {};
const L = allLines();
const keys = new Map(); // recording key -> characters
const dyn = { lines: 0, chars: 0 };
const by = {};
const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ';
const moraeOf = (jp) => [...RB.jp.reading(jp)].filter((ch) => /[\u3041-\u30FC]/.test(ch) && !SMALL.includes(ch)).length;
const pausesOf = (text) => [...text].filter((ch) => '、。…！？!?—―'.includes(ch)).length;
let morae = 0, pauses = 0;
const add = (speaker, variant, dialect, text, expr, jp) => {
  const k = [speaker, variant || '', dialect, text, expr || ''].join('\u0001');
  if (!keys.has(k)) {
    const m = moraeOf(jp), pz = pausesOf(text);
    keys.set(k, [...text].length); morae += m; pauses += pz;
    by[speaker] = by[speaker] || { recordings: 0, chars: 0, morae: 0, pauses: 0 };
    by[speaker].recordings++; by[speaker].chars += [...text].length; by[speaker].morae += m; by[speaker].pauses += pz;
  }
};
const spoken = (jp) => RB.jp.plain(jp).replace(/\s+/g, '').normalize('NFC');
for (const l of L) {
  if (/\$\w+/.test(l.jp)) { dyn.lines++; dyn.chars += [...l.plain].length; continue; }
  const who = l.who;
  let speakers = [who === 'narr' ? 'narrator_female' : who];
  if (who === 'comp') { const a = companionsOf(l, branchOf(l)); speakers = a.comps; basis[a.basis] = (basis[a.basis] || 0) + 1; }
  for (const s of speakers) {
    if (s === 'pc') { add('pc', 'A', 'standard', l.plain, l.expr, l.jp); add('pc', 'B', 'standard', l.plain, l.expr, l.jp); continue; }
    add(s, null, 'standard', l.plain, l.expr, l.jp);
    if (s === 'suzu') {
      const k = RB.dialect.find(l.jp, l.en, 'kansai');
      if (k && !k.same && k.jp && spoken(k.jp) !== l.plain) add('suzu', null, 'kansai', spoken(k.jp), l.expr, k.jp);
    }
  }
}
const total = { recordings: keys.size, chars: [...keys.values()].reduce((a, b) => a + b, 0), morae, pauses };
const textOnly = new Set(L.map((l) => l.plain)).size;
const out = {
  sourceLines: L.length, distinctJapaneseTextsOnly: textOnly, recordings: total.recordings, characters: total.chars, morae: total.morae, pauses: total.pauses,
  dynamicLinesNotRecordable: dyn,
  companionAttribution: basis,
  byRole: Object.fromEntries(Object.entries(by).filter(([k]) => ['narrator_female', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(k))),
  otherSpeakers: (() => { const o = Object.entries(by).filter(([k]) => !['narrator_female', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(k)); return { speakers: o.length, recordings: o.reduce((a, [, v]) => a + v.recordings, 0), chars: o.reduce((a, [, v]) => a + v.chars, 0), morae: o.reduce((a, [, v]) => a + v.morae, 0), pauses: o.reduce((a, [, v]) => a + v.pauses, 0) }; })(),
  note: 'Counts every conditional variant (level, companion, dialect, story state), not what one journey hears. Distinct by speaker, player voice, dialect, spoken text and delivery (the line\'s expression); not by text alone.',
};
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else console.log(JSON.stringify(out));
