// VA-1 planning (not the audition): how many distinct recordings a whole-game voice batch would need, and how many
// characters, resolved the way the game would play them. Nothing is generated.
//  - A line said by "whoever travels with you" (`comp`) is recorded once per companion it can belong to (its
//    `comp=` / `comp!=` / `party` conditions narrow that), in that companion's voice.
//  - The player's lines are recorded twice, Voice A and Voice B (and never for "player None").
//  - Suzu's lines (as herself or as the companion) are recorded again in Kansai where the dialect table changes them.
//  - The narrator is one female narrator.
//  - Recordings are distinct by (speaker identity, player voice, dialect, spoken text, delivery); two characters
//    saying the same words are two recordings, and the same words in a different expression are kept apart.
//  - A line with a run-time variable ($name, a boat's name) cannot be recorded in full; it is counted apart.
// Usage: node tools/voice/fullgame_count.mjs [--json]
import { RB, allLines } from './lines.mjs';

const COMPS = ['nao', 'mio', 'ren', 'suzu'];
// which companions a `comp` line can belong to, from its condition (an `|` alternative opens all four)
function compsOf(cond) {
  if (!cond) return COMPS;
  const alts = String(cond).split('|');
  const out = new Set();
  for (const a of alts) {
    let allowed = COMPS.slice();
    for (const t of a.split('&')) {
      const m = /^(?:comp|party)(=|!=)(\w+)$/.exec(t.trim());
      if (!m) continue;
      allowed = m[1] === '=' ? allowed.filter((c) => c === m[2]) : allowed.filter((c) => c !== m[2]);
    }
    allowed.forEach((c) => out.add(c));
  }
  return [...out];
}
const L = allLines();
const keys = new Map(); // recording key -> characters
const dyn = { lines: 0, chars: 0 };
const by = {};
const add = (speaker, variant, dialect, text, expr) => {
  const k = [speaker, variant || '', dialect, text, expr || ''].join('\u0001');
  if (!keys.has(k)) { keys.set(k, [...text].length); by[speaker] = by[speaker] || { recordings: 0, chars: 0 }; by[speaker].recordings++; by[speaker].chars += [...text].length; }
};
const spoken = (jp) => RB.jp.plain(jp).replace(/\s+/g, '').normalize('NFC');
for (const l of L) {
  if (/\$\w+/.test(l.jp)) { dyn.lines++; dyn.chars += [...l.plain].length; continue; }
  const who = l.who;
  const speakers = who === 'comp' ? compsOf(l.if) : [who === 'narr' ? 'narrator_female' : who];
  for (const s of speakers) {
    if (s === 'pc') { add('pc', 'A', 'standard', l.plain, l.expr); add('pc', 'B', 'standard', l.plain, l.expr); continue; }
    add(s, null, 'standard', l.plain, l.expr);
    if (s === 'suzu') {
      const k = RB.dialect.find(l.jp, l.en, 'kansai');
      if (k && !k.same && k.jp && spoken(k.jp) !== l.plain) add('suzu', null, 'kansai', spoken(k.jp), l.expr);
    }
  }
}
const total = { recordings: keys.size, chars: [...keys.values()].reduce((a, b) => a + b, 0) };
const textOnly = new Set(L.map((l) => l.plain)).size;
const out = {
  sourceLines: L.length, distinctJapaneseTextsOnly: textOnly, recordings: total.recordings, characters: total.chars,
  dynamicLinesNotRecordable: dyn,
  byRole: Object.fromEntries(Object.entries(by).filter(([k]) => ['narrator_female', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(k))),
  otherSpeakers: { speakers: Object.keys(by).filter((k) => !['narrator_female', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(k)).length, recordings: Object.entries(by).filter(([k]) => !['narrator_female', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(k)).reduce((a, [, v]) => a + v.recordings, 0), chars: Object.entries(by).filter(([k]) => !['narrator_female', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(k)).reduce((a, [, v]) => a + v.chars, 0) },
  note: 'Counts every conditional variant (level, companion, dialect, story state), not what one journey hears. Distinct by speaker, player voice, dialect, spoken text and delivery (the line\'s expression); not by text alone.',
};
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else console.log(JSON.stringify(out));
