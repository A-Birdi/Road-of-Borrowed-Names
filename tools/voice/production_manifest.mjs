// The full-game recording manifest (C-95 reconciliation, Robin 2026-10-16: "fix the production plan's
// companion-branch attribution and pronunciation-seam handling, rebuild it from the corrected script, and provide the
// local worker the exact source revision and manifest"). One entry per distinct recording, resolved as the game plays:
//  - companions through the scene's branches (tools/voice/attribution.mjs; RV-0160);
//  - the player four times: Voice A and Voice B, each at its High and its Low pitch (C-93: "two separate A/B voices; a
//    higher and lower pitch options for each"), each variant its own recording id and file; the narrator once; Suzu's
//    lines again in Kansai where the table changes them;
//  - distinct by speaker, player voice, dialect, delivery (the line's expression) and spoken text, never by text alone.
// Each entry keeps the display markup apart from what is spoken, and gives the voice what it needs to say it right:
//  - spoken          the line without readings and without the learner spacing (NFC), as written;
//  - spokenNamesKana the same with names given as their own kana (VA-2's method: the line's own reading, never a guess);
//  - kana            the whole line in the game's own readings;
//  - seams           where removing the spacing joins two words into a compound read differently ({今|いま} {朝|あさ}
//                    → 今朝), with the reading the line means (kanji → kana);
//  - send            the text to send to the engine: spokenNamesKana with each seam's kanji written as the reading the
//                    line means (いま朝 → いまあさ), so no engine reads 今朝 as けさ; an engine with its own reading
//                    control may send `spoken` and apply names and seams through it instead (C-91/VA-1);
//  - lines           every line key it serves (scene, file, line), and whether a frozen audition case binds it.
// Lines with a run-time name ($name …) cannot be recorded as written; they are listed apart (device voice or silence).
// `references` lists the narrator's reference readings (LI-8), recorded in the same batch with a citation delivery.
// Nothing here generates audio or authorises generation (docs/future/voice/production/PRODUCTION_SCOPE.md).
// Usage: node tools/voice/production_manifest.mjs [--out <dir>] [--check]
//   writes <dir>/RECORDING_MANIFEST.json.gz and <dir>/SUMMARY.json (default docs/future/voice/production/manifest);
//   --check rebuilds and compares with what is there (exit 1 if it differs: the script changed since it was built)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { RB, allLines } from './lines.mjs';
import { branches, companionsOf } from './attribution.mjs';
import { root } from '../../tests/lib/load.mjs';

const args = process.argv.slice(2);
const OUT = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : path.join(root, 'docs/future/voice/production/manifest');
const SCHEMA = 'rbn.voice.production/1';
const sha = (s) => crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');
const NFC = (s) => String(s).normalize('NFC');
const spoken = (jp) => NFC(RB.jp.plain(jp).replace(/\s+/g, ''));
const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ';
const kanaOf = (jp) => NFC(String(RB.jp.reading(jp) || '').replace(/\s+/g, ''));
const moraeOf = (jp) => [...RB.jp.reading(jp)].filter((ch) => /[ぁ-ー]/.test(ch) && !SMALL.includes(ch)).length;
const pausesOf = (text) => [...text].filter((ch) => '、。…！？!?—―'.includes(ch)).length;

// ---- names in kana (as tools/voice/va2/plan.mjs gives them) ------------------------------------------------------
const NAMES = new Map();
function addName(jp) {
  if (!jp) return;
  const surface = RB.jp.plain(jp).replace(/\s+/g, '');
  const reading = String(jp).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, s, r) => r.split('|').join('')).replace(/\s+/g, '');
  if (/[一-鿿]/.test(surface) && surface !== reading) NAMES.set(surface, reading);
}
for (const k in RB.content.chars) addName(RB.content.chars[k].name && RB.content.chars[k].name.jp);
for (const k in RB.content.places || {}) addName(RB.content.places[k].name && RB.content.places[k].name.jp);
for (const k in RB.content.maps) addName(RB.content.maps[k].name && RB.content.maps[k].name.jp);
const NAME_LIST = [...NAMES.keys()].filter((n) => n.length > 1);
function names(jp) {
  const out = [];
  let text = String(jp).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, s, r) => {
    const rd = r.split('|').join('');
    if (NAMES.has(s) || NAME_LIST.some((n) => s.indexOf(n) >= 0)) { if (!out.some((o) => o.surface === s)) out.push({ surface: s, reading: rd }); return rd; }
    return s;
  });
  text = NFC(RB.jp.plain(text).replace(/\s+/g, ''));
  return { names: out, spokenNamesKana: text };
}

// ---- seams: the spoken text joins two words into a compound read differently (tools/review/joined_readings.mjs) ----
const kanjiTail = (s) => (s.match(/[一-鿿々〆ヶ]+$/) || [''])[0];
const kanjiHead = (s) => (s.match(/^[一-鿿々〆ヶ]+/) || [''])[0];
function seams(jp) {
  const toks = RB.jp.parse(jp);
  const out = [];
  for (let i = 0; i + 1 < toks.length; i++) {
    const a = toks[i], b = toks[i + 1];
    if (a.punct || b.punct) continue;
    const ta = kanjiTail(a.surface || ''), hb = kanjiHead(b.surface || '');
    if (!ta || !hb) continue;
    const segR = (t, kan, tail) => {
      const segs = (t.segs || []).filter((s) => /[一-鿿々〆ヶ]/.test(s.t));
      const pick = tail ? segs.slice(-1) : segs.slice(0, 1);
      return pick.length && pick[0].t === kan ? pick[0].r : null;
    };
    const ra = segR(a, ta, true), rb = segR(b, hb, false);
    if (!ra || !rb) continue;
    for (const w of [ta + hb, ta.slice(-1) + hb, ta + hb.slice(0, 1), ta.slice(-1) + hb.slice(0, 1)]) {
      const es = RB.lex && RB.lex.bySurface ? RB.lex.bySurface(w) : [];
      const hit = es.find((e) => e.r && e.r !== ra + rb);
      if (hit && es.every((e) => e.r !== ra + rb)) {
        // the reading the line means at the join: each word's own reading, kept apart
        out.push({ joined: w, wouldRead: hit.r, means: ra + '|' + rb, left: a.surface, right: b.surface, kanji: ta + hb, kana: ra + rb });
        break;
      }
    }
  }
  return out;
}

// ---- the frozen audition texts (they stay; the batch records the game's line) ---------------------------------------
const frozen = {};
try {
  const va1 = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/corpus/audition_corpus.json'), 'utf8'));
  for (const c of va1.cases) if (c.lineId) (frozen[c.lineId] = frozen[c.lineId] || []).push('VA-1 ' + c.caseId);
  const va2 = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/va2/va2_plan.json'), 'utf8'));
  for (const k in va2.lines) (frozen[k] = frozen[k] || []).push('VA-2');
} catch (e) { /* the manifest still builds; the frozen marks are then missing (reported in the summary) */ }

// ---- the recordings ------------------------------------------------------------------------------------------------
const L = allLines();
const BR = {};
const branchOf = (l) => (BR[l.scene] || (BR[l.scene] = branches(RB.content.scenes[l.scene])))[l.idx] || null;
const rec = new Map();
const dynamic = [];
const nonverbal = []; // a line that is only a pause (「……」): a beat, not a recording (VA1_ADDENDUM §17)
const basis = {};
const role = (who) => (who === 'narr' ? 'narrator' : who);
function add(speaker, voice, dialect, jp, l, pitch) {
  const sp = spoken(jp);
  const delivery = l.expr || 'neutral';
  const id = 'r1-' + sha([speaker, voice || '', dialect, delivery, sp].concat(pitch ? [pitch] : []).join('\u0001')).slice(0, 16);
  let e = rec.get(id);
  if (!e) {
    const nm = names(jp);
    const sm = seams(jp);
    // what the engine is sent: names in their own kana, each seam's kanji as the reading the line means
    const send = sm.reduce((t, x) => t.split(x.kanji).join(x.kana), nm.spokenNamesKana);
    e = {
      id, speaker, voice: voice || null, pitch: pitch || null, dialect, delivery, display: jp, spoken: sp, spokenNamesKana: nm.spokenNamesKana,
      send, kana: kanaOf(jp), names: nm.names, seams: sm, chars: [...sp].length, morae: moraeOf(jp), pauses: pausesOf(sp),
      textHash: sha(sp).slice(0, 16), lines: [],
    };
    rec.set(id, e);
  }
  e.lines.push(Object.assign({ key: l.key, scene: l.scene, file: l.file || null, line: l.line || null }, l.attribution ? { attribution: l.attribution } : {}, frozen[l.key] ? { frozen: frozen[l.key] } : {}));
}
for (const l of L) {
  if (/\$\w+/.test(l.jp)) { dynamic.push({ key: l.key, scene: l.scene, who: l.who, jp: l.jp, reason: 'run-time name' }); continue; }
  if (!/[ぁ-ゖァ-ヺ一-鿿々]/.test(spoken(l.jp))) { nonverbal.push({ key: l.key, scene: l.scene, who: l.who, jp: l.jp }); continue; }
  let speakers = [role(l.who)];
  if (l.who === 'comp' && l.code) {
    // a line the game's code shows (no scene to read branches from): the companions it names
    speakers = l.comps || ['nao', 'mio', 'ren', 'suzu'];
    basis.code = (basis.code || 0) + 1;
    l.attribution = 'code';
  } else if (l.who === 'comp') {
    const a = companionsOf(l, branchOf(l));
    speakers = a.comps;
    basis[a.basis] = (basis[a.basis] || 0) + 1;
    l.attribution = a.basis;
  }
  for (const s of speakers) {
    if (s === 'pc') { for (const v of ['A', 'B']) for (const p of ['high', 'low']) add('pc', v, 'standard', l.jp, l, p); continue; }
    add(s, null, 'standard', l.jp, l);
    if (s === 'suzu' && RB.dialect && RB.dialect.find) {
      const k = RB.dialect.find(l.jp, l.en, 'kansai');
      if (k && !k.same && k.jp && spoken(k.jp) !== spoken(l.jp)) add('suzu', null, 'kansai', k.jp, l);
    }
  }
}
const entries = [...rec.values()].sort((a, b) => (a.speaker + a.id < b.speaker + b.id ? -1 : 1));

// ---- the narrator's reference readings (LI-8: Listen / Say it / Hear it on a kana, a kanji or a word) ---------------
// The same set as tools/voice/reference_count.mjs, in a plain citation delivery. Keyed by kind + written form + reading
// (two words with one reading and different kanji are two recordings: their accent can differ). A particle whose
// lexicon note says how it is said (は "wa", へ "e", を "o") is sent as said, never as spelled.
const SAID = { wa: 'わ', e: 'え', o: 'お' };
const references = [];
const refSeen = new Set();
function addRef(kind, written, reading, spokenText) {
  const key = kind + ':' + written + '|' + reading;
  if (refSeen.has(key)) return;
  refSeen.add(key);
  const sp = NFC(spokenText);
  references.push({ id: 'r1-ref-' + sha(key + '\u0001' + sp).slice(0, 16), key, kind, speaker: 'narrator', delivery: 'citation', written, reading, spoken: sp, chars: [...sp].length, morae: [...sp].filter((ch) => /[ぁ-ー]/.test(ch) && !SMALL.includes(ch)).length || 1 });
}
for (const g of RB.lessons.groups()) for (const c of RB.lessons.groupChars(g)) addRef('kana', c.ch, c.ch, c.ch);
for (const k of RB.kanjiInfo.all()) {
  const rs = (k.readings || []).map((r) => (typeof r === 'string' ? r : r.r || r.reading || '')).filter(Boolean);
  if (rs.length) addRef('kanji', k.ch, rs.join('、'), rs.join('、'));
}
for (const e of RB.lex.all()) {
  const w = e.w || e.surface, r = e.r || e.reading;
  if (!w || !r) continue;
  const said = e.pos === 'prt' && /pronounced (wa|e|o)\b/.exec(e.n || '');
  addRef('word', w, r, said ? SAID[said[1]] : r);
}
// phrases the learning controls and pastimes read aloud (today through the device voice only): the listening steps'
// transcripts, the karuta reader's proverbs, the ring toss's descriptions (both tiers), the shells' fragments (every
// tier). Keyed by the reading without spaces, which is what those controls already speak; the engine is sent the
// written line (names in kana, seams as the line means them) like dialogue. The narrator, in a plain reading delivery.
const phraseOf = (jp) => {
  if (!jp || /\$\w+/.test(jp)) return;
  const reading = NFC(String(RB.jp.reading(jp)).replace(/\s+/g, ''));
  const key = 'phrase:' + reading;
  if (refSeen.has(key)) return;
  refSeen.add(key);
  const nm = names(jp), sm = seams(jp);
  const send = sm.reduce((t, x) => t.split(x.kanji).join(x.kana), nm.spokenNamesKana);
  references.push({ id: 'r1-ref-' + sha(key + '\u0001' + send).slice(0, 16), key, kind: 'phrase', speaker: 'narrator', delivery: 'reading', written: spoken(jp), reading, spoken: send, display: jp, chars: [...send].length, morae: moraeOf(jp) || 1 });
};
for (const id in RB.content.challenges || {}) for (const lv in RB.content.challenges[id].tiers || {}) for (const st of RB.content.challenges[id].tiers[lv] || []) if (st.kind === 'listen' && st.transcript) phraseOf(st.transcript.jp);
for (const c of (RB.content.karuta && RB.content.karuta.deck) || []) phraseOf(c.jp);
for (const pz of (RB.content.festival && RB.content.festival.wanage && RB.content.festival.wanage.prizes) || []) { phraseOf(pz.easy && pz.easy.jp); phraseOf(pz.full && pz.full.jp); }
for (const k in RB.content.shells || {}) for (const f of RB.content.shells[k].frags || []) for (const t of Object.values(f.text || {})) phraseOf(t && t.jp);
const contentHash = sha(L.map((l) => l.key + '\u0001' + l.who + '\u0001' + (l.if || '') + '\u0001' + l.jp).join('\n'));
const byRole = {};
for (const e of entries) {
  const r = ['narrator', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(e.speaker) ? e.speaker : 'npc';
  const b = byRole[r] || (byRole[r] = { recordings: 0, chars: 0, morae: 0, pauses: 0 });
  b.recordings++; b.chars += e.chars; b.morae += e.morae; b.pauses += e.pauses;
}
const manifest = {
  schema: SCHEMA, contentHash, sourceLines: L.length,
  note: 'One entry per distinct recording (speaker, player voice, dialect, delivery, spoken text). Display markup is never spoken. Apply names and seam readings through the engine\'s own mechanism; never read markup, speaker labels or English aloud. A frozen audition case keeps its own text; the batch records the game\'s line as given here.',
  delivery: { format: 'Ogg Opus', sampleRate: 48000, channels: 1, loudness: '-20 LUFS integrated, peaks under -1 dBFS (C-93: one loudness for every line)', nominalBitrate: 'about 58 kbit/s (the VA-2 render setting)' },
  entries, references, notRecordable: dynamic, nonverbal,
};
const summary = {
  schema: SCHEMA, contentHash, sourceLines: L.length, recordings: entries.length,
  characters: entries.reduce((n, e) => n + e.chars, 0), morae: entries.reduce((n, e) => n + e.morae, 0), pauses: entries.reduce((n, e) => n + e.pauses, 0),
  byRole, speakers: new Set(entries.map((e) => e.speaker)).size, companionAttribution: basis,
  withSeams: entries.filter((e) => e.seams.length).length, withNames: entries.filter((e) => e.names.length).length,
  frozenLines: entries.reduce((n, e) => n + e.lines.filter((x) => x.frozen).length, 0), frozenMarksLoaded: Object.keys(frozen).length > 0,
  references: { recordings: references.length, characters: references.reduce((n, r) => n + r.chars, 0), morae: references.reduce((n, r) => n + r.morae, 0), byKind: references.reduce((o, r) => ((o[r.kind] = (o[r.kind] || 0) + 1), o), {}), saidNotSpelled: references.filter((r) => r.kind === 'word' && r.spoken !== r.reading).map((r) => r.written + ' → ' + r.spoken) },
  nonverbal: { lines: nonverbal.length, note: 'only a pause (「……」): a beat in the scene, not recorded' },
  notRecordable: { lines: dynamic.length, reason: 'run-time name: device voice or silence until a name policy is chosen (C-93: a line that is only the name becomes the speaker\'s "you" by relation)' },
};
const gz = zlib.gzipSync(Buffer.from(JSON.stringify(manifest)), { level: 9, mtime: 0 });
const sumText = JSON.stringify(summary, null, 1) + '\n';
if (args.includes('--check')) {
  let ok = true;
  try {
    const old = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(OUT, 'RECORDING_MANIFEST.json.gz'))).toString());
    if (old.contentHash !== contentHash || JSON.stringify(old) !== JSON.stringify(manifest)) ok = false;
  } catch (e) { ok = false; }
  console.log(ok ? 'manifest is current: ' + entries.length + ' recordings + ' + references.length + ' reference readings, content ' + contentHash.slice(0, 12) : 'manifest is NOT current with the script (rebuild it)');
  process.exit(ok ? 0 : 1);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'RECORDING_MANIFEST.json.gz'), gz);
fs.writeFileSync(path.join(OUT, 'SUMMARY.json'), sumText);
console.log(JSON.stringify({ recordings: summary.recordings, references: references.length, characters: summary.characters, morae: summary.morae, gzBytes: gz.length, attribution: basis, withSeams: summary.withSeams, withNames: summary.withNames, notRecordable: dynamic.length, contentHash: contentHash.slice(0, 12) }));
