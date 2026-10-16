// VA-1 VS01: build and check the frozen audition corpus from tools/voice/corpus_selection.mjs and the package's
// matrix (docs/future/voice/templates/audition_matrix.json). Every case is resolved against the game's compiled scenes
// (or is a labelled noncanonical fixture), checked (speaker, distinctness, the A/B and same-text pairs, the Kansai
// counterparts, nothing but Japanese in what is spoken), and written as:
//   docs/future/voice/corpus/audition_corpus.json  the matrix with its source/text fields filled, one speech-line
//                                                  record per case (rbn-speech-line-1), the take accounting;
//   docs/future/voice/corpus/CORPUS.md             a spoiler-safe list for review.
// Nothing here generates audio. Usage: node tools/voice/corpus.mjs [--check]   (--check: build and compare, no write)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { RB, allLines } from './lines.mjs';
import { CASES, KANSAI_OF, PLAYER_OF, ANCHORS } from './corpus_selection.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const OUT = path.join(root, 'docs/future/voice/corpus');
const tpl = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/templates/audition_matrix.json'), 'utf8'));
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const errors = [];
const fail = (c, m) => errors.push(c + ': ' + m);

// ---- the game's lines, and where each scene is written --------------------------------------------------------------
const LINES = new Map(allLines().map((l) => [l.key, l]));
const sceneSource = new Map();
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (e.name.endsWith('.js')) fs.readFileSync(p, 'utf8').split('\n').forEach((t, i) => { const m = /^@scene\s+(\S+)/.exec(t.trim()); if (m && !sceneSource.has(m[1])) sceneSource.set(m[1], { path: path.relative(root, p), line: i + 1 }); });
  }
})(path.join(root, 'src/content'));
// the words that are names (places, people), for pronunciation records: a name's reading is the game's own furigana
const NAMES = new Set();
for (const k in RB.content.chars) { const n = RB.content.chars[k].name; if (n && n.jp) NAMES.add(RB.jp.plain(n.jp).replace(/\s+/g, '')); }
for (const k in RB.content.places || {}) { const n = RB.content.places[k].name; if (n && n.jp) NAMES.add(RB.jp.plain(n.jp).replace(/\s+/g, '')); }
for (const k in RB.content.maps) { const n = RB.content.maps[k].name; if (n && n.jp) NAMES.add(RB.jp.plain(n.jp).replace(/\s+/g, '')); }

const spokenOf = (jp) => RB.jp.plain(jp).replace(/\s+/g, '').normalize('NFC');
const displayOf = (jp) => RB.jp.plain(jp).normalize('NFC');
function readingTokens(jp) {
  const out = [];
  String(jp).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, surface, reading) => { out.push({ surface, reading: reading.split('|').join('') }); return m; });
  return out;
}
const spoilerOf = (scene) => {
  const r = scene.split('.')[0];
  if (['rw', 'sg'].includes(r)) return 'none';
  if (['mb', 'mp', 'el', 'cs', 'co', 'lq', 'sz', 'sb', 'sb2', 'co2', 'road'].includes(r)) return 'early';
  if (['kr', 'lf', 'lf2', 'ko', 'cr', 'yn', 'sea', 'pt', 'pages'].includes(r)) return 'later';
  return 'sealed';
};
let commit = 'unknown';
try { commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch (e) { /* not a checkout */ }

// ---- resolve one selection to its text and source ----------------------------------------------------------------------
function resolve(caseId, sel) {
  if (sel.fixture) {
    return {
      kind: 'noncanonical_audition_fixture', jp: sel.fixture, en: sel.en, display: displayOf(sel.fixture), spoken: spokenOf(sel.fixture),
      tokens: readingTokens(sel.fixture), path: 'tools/voice/corpus_selection.mjs', locator: 'CASES.' + caseId + '.fixture', scene: null, spoiler: 'none', who: sel.speaker, prev: null, next: null,
    };
  }
  const l = LINES.get(sel.key);
  if (!l) { fail(caseId, 'no line ' + sel.key + ' in the current scenes (changed or removed)'); return null; }
  const src = sceneSource.get(l.scene) || {};
  return {
    kind: 'game_line', jp: l.jp, en: l.en, display: displayOf(l.jp), spoken: l.plain, tokens: readingTokens(l.jp), path: src.path || null,
    locator: '@scene ' + l.scene + ' (from line ' + (src.line || '?') + '), say #' + l.idx + ', ' + (l.file || '') + ':' + (l.line || '?'), scene: l.scene, spoiler: spoilerOf(l.scene),
    who: l.who, ifCond: l.if, prev: l.prev, next: l.next, key: l.key,
  };
}
const companion = (r) => (r.who === 'comp' ? (/(^|[&|])comp=(\w+)/.exec(r.ifCond || '') || [])[2] : r.who);

// ---- every case of the matrix ------------------------------------------------------------------------------------------
const cases = [];
for (const t of tpl.cases) {
  const id = t.caseId;
  let sel = CASES[id], r, dialect = 'standard', playerVoiceType = null, sourceKind;
  if (KANSAI_OF[id]) {
    const base = resolve(KANSAI_OF[id], CASES[KANSAI_OF[id]]);
    if (!base) continue;
    const k = RB.dialect.find(base.jp, base.en, 'kansai');
    if (!k || k.same || !k.jp || spokenOf(k.jp) === base.spoken) { fail(id, 'no distinct Kansai version of ' + KANSAI_OF[id]); continue; }
    r = Object.assign({}, base, { jp: k.jp, en: k.en, display: displayOf(k.jp), spoken: spokenOf(k.jp), tokens: readingTokens(k.jp), locator: base.locator + ' → the Kansai table (RB.dialect, src/content/dialect/)', standardOf: KANSAI_OF[id] });
    dialect = 'kansai';
    sel = { why: 'The dialect table\'s Kansai version of ' + KANSAI_OF[id] + ' (same moment, same listener).' };
  } else if (PLAYER_OF[id]) {
    sel = CASES[PLAYER_OF[id]];
    r = resolve(id, sel);
    playerVoiceType = id.startsWith('PCA') ? 'a' : 'b';
  } else {
    if (!sel) { fail(id, 'not selected'); continue; }
    r = resolve(id, sel);
  }
  if (!r) continue;
  if (sel.spoiler) r.spoiler = sel.spoiler; // a line that gives a puzzle's answer away, say
  sourceKind = r.kind;
  // the speaker the case asks for
  const role = t.speakerRole;
  if (r.kind === 'game_line') {
    if (role === 'narrator_female' && r.who !== 'narr') fail(id, 'not narration (' + r.who + ')');
    if (['suzu', 'nao', 'mio', 'ren'].includes(role) && companion(r) !== role) fail(id, 'not ' + role + '\'s line (' + r.who + ' ' + (r.ifCond || '') + ')');
    if (/^player_/.test(role) && r.who !== 'pc') fail(id, 'not the player\'s line');
    if (/^npc/.test(t.group) && sel.speaker && r.who !== sel.speaker && !(sel.fixture)) fail(id, 'spoken by ' + r.who + ', not ' + sel.speaker);
  }
  if (/[{}|]/.test(r.spoken)) fail(id, 'markup left in the spoken text');
  if (/[A-Za-z]/.test(r.spoken)) fail(id, 'Latin letters in the spoken text');
  if (/\$\w+/.test(r.jp)) fail(id, 'a run-time variable in the line (a dynamic name)');
  if (!r.spoken) fail(id, 'empty');
  const overrides = r.tokens.filter((x) => NAMES.has(x.surface)).map((x) => ({ surface: x.surface, reading: x.reading, reason: 'proper noun', evidence: 'the game\'s own furigana for this line', reviewStatus: 'from game data' }));
  const speakerId = r.kind === 'game_line' ? (role === 'narrator_female' ? 'narrator_female' : r.who === 'comp' ? companion(r) : r.who) : r.who;
  const speechLine = {
    schemaVersion: 'rbn-speech-line-1',
    lineId: r.kind === 'game_line' ? r.key + (dialect === 'kansai' ? '@kansai' : '') : 'audition.' + id.toLowerCase() + '.fixture',
    caseId: id,
    source: { kind: sourceKind, repository: 'A-Birdi/Road-of-Borrowed-Names', commit, path: r.path, locator: r.locator, spoilerLevel: r.spoiler },
    speakerId, voiceProfile: t.castingProfile + '_candidate_tbd', language: 'ja-JP', dialectVariant: dialect, playerVoiceType, purpose: 'audition',
    displayText: r.display, spokenText: r.spoken, translationEn: r.en,
    delivery: { intent: t.deliveryLabel, energy: 'as directed', direction: t.direction, pace: 'natural', subtext: sel.why || '', beats: [], vocalEvents: [] },
    pronunciationOverrides: overrides,
    context: { listener: role === 'narrator_female' ? 'player (narration)' : 'per scene', situation: sel.why || '', previousLine: r.prev ? r.prev.plain : null, nextLine: r.next ? r.next.plain : null, audibleContext: false },
    providerExtensions: {},
    production: { status: 'prepared', spokenTextSha256: sha(r.spoken), allowParaphrase: false, allowAddedSpeech: false, publicationApproved: false },
  };
  cases.push(Object.assign({}, t, {
    sourceStatus: sourceKind === 'game_line' ? 'bound_game_line' : 'noncanonical_audition_fixture', sourcePath: r.path, sourceLocator: r.locator, sourceCommit: commit,
    sourceKind, lineId: speechLine.lineId, spokenText: r.spoken, translationEn: r.en, readingTokens: r.tokens, pronunciationOverrides: overrides,
    spoilerLevel: r.spoiler, screeningCandidate: Object.values(ANCHORS).some((a) => a.includes(id)),
    speakerIdentity: sel.identity || (cases.find((c) => c.castingProfile === t.castingProfile && c.speakerIdentity) || {}).speakerIdentity || null,
    selectionReason: sel.why || null, speechLine,
  }));
}

// ---- the checks across cases -----------------------------------------------------------------------------------------------
const by = (f) => cases.filter(f);
for (const c of ['suzu', 'nao', 'mio', 'ren']) {
  const five = by((x) => x.speakerRole === c && x.dialectVariant === 'standard');
  if (five.length !== 5) fail(c, five.length + ' standard lines, not 5');
  if (new Set(five.map((x) => x.spokenText)).size !== five.length) fail(c, 'the five lines are not distinct');
}
for (let i = 1; i <= 5; i++) {
  const a = cases.find((x) => x.caseId === 'PCA0' + i), b = cases.find((x) => x.caseId === 'PCB0' + i);
  if (!a || !b || a.spokenText !== b.spokenText) fail('PC0' + i, 'A and B do not share one text');
}
const j4 = cases.find((x) => x.caseId === 'J04'), j5 = cases.find((x) => x.caseId === 'J05');
if (!j4 || !j5 || j4.spokenText !== j5.spokenText) fail('J04/J05', 'not the same text');
for (const p of new Set(by((x) => x.group === 'npc').map((x) => x.castingProfile))) {
  const two = by((x) => x.castingProfile === p);
  if (two.length !== 2 || two[0].spokenText === two[1].spokenText) fail(p, 'two different lines are required');
  if (new Set(two.map((x) => x.speechLine.speakerId)).size !== 1) fail(p, 'one speaker per profile');
}
if (cases.length !== tpl.minimumDirectedCasesPerConfiguration) fail('matrix', cases.length + ' cases bound, not ' + tpl.minimumDirectedCasesPerConfiguration);
const controls = by((x) => x.neutralControl);
if (controls.length !== tpl.neutralControlsPerConfiguration) fail('matrix', controls.length + ' neutral controls, not ' + tpl.neutralControlsPerConfiguration);

// ---- the take accounting (characters are what hosted providers bill by) --------------------------------------------------
const chars = (list) => list.reduce((n, x) => n + [...x.spokenText].length, 0);
const anchorCases = Object.values(ANCHORS).flat().map((id) => cases.find((x) => x.caseId === id)).filter(Boolean);
const roles = new Set(cases.map((x) => x.castingProfile));
// the casting screen (§04): up to three voices per role, two short anchor lines each; a role without named anchors uses
// its two shortest lines
const anchorsOf = (p) => { const named = Object.entries(ANCHORS).find(([k]) => k === p); return named ? named[1].map((id) => cases.find((x) => x.caseId === id)) : by((x) => x.castingProfile === p).sort((a, b) => a.spokenText.length - b.spokenText.length).slice(0, 2); };
const screenChars = [...roles].reduce((n, p) => n + 3 * chars(anchorsOf(p)), 0);
const accounting = {
  directedCases: cases.length, neutralControls: controls.length, plannedTakesPerConfiguration: cases.length + controls.length,
  charactersDirected: chars(cases), charactersControls: chars(controls), charactersPerConfiguration: chars(cases) + chars(controls),
  castingScreen: { roles: roles.size, voicesPerRole: 3, linesPerVoice: 2, takes: roles.size * 3 * 2, characters: screenChars },
  repairsBound: { takes: cases.length, characters: chars(cases), rule: 'at most one targeted repair per flawed directed cell (§05)' },
  maxCharactersPerConfiguration: chars(cases) + chars(controls) + screenChars + chars(cases),
  byKind: { game_line: by((x) => x.sourceKind === 'game_line').length, noncanonical_audition_fixture: by((x) => x.sourceKind === 'noncanonical_audition_fixture').length },
  bySpoiler: Object.fromEntries(['none', 'early', 'later', 'sealed'].map((s) => [s, by((x) => x.spoilerLevel === s).length])),
};
void anchorCases;
const corpus = { schemaVersion: 'rbn-voice-audition-corpus-1', status: 'corpus_frozen_no_audio_generated', builtFrom: { commit, matrix: 'docs/future/voice/templates/audition_matrix.json', selection: 'tools/voice/corpus_selection.mjs' }, providerConfigurationIds: tpl.providerConfigurationIds, accounting, cases };

// ---- the review list ---------------------------------------------------------------------------------------------------------
const show = (c) => (c.spoilerLevel === 'none' || c.spoilerLevel === 'early' ? c.spokenText : '(' + c.spoilerLevel + ': hidden in the review list)');
let md = '# VA-1 · VS01 · The frozen audition corpus\n\nBuilt by `node tools/voice/corpus.mjs` from `tools/voice/corpus_selection.mjs` and the package\'s matrix; the full records are in `audition_corpus.json`. No audio has been generated. Text from later chapters is hidden here (its spoiler level is shown); fixtures are labelled.\n\n';
md += '**Accounting per provider configuration:** ' + accounting.directedCases + ' directed cases + ' + accounting.neutralControls + ' neutral controls = ' + accounting.plannedTakesPerConfiguration + ' takes, ' + accounting.charactersPerConfiguration + ' characters of spoken Japanese (directed ' + accounting.charactersDirected + ', controls ' + accounting.charactersControls + '). Casting screen: ' + accounting.castingScreen.roles + ' roles × 3 voices × 2 anchor lines = ' + accounting.castingScreen.takes + ' takes, ' + accounting.castingScreen.characters + ' characters. Repairs: at most one per flawed directed cell (' + accounting.repairsBound.characters + ' characters if every cell needed one). Upper bound per configuration: **' + accounting.maxCharactersPerConfiguration + ' characters**. Sources: ' + accounting.byKind.game_line + ' game lines, ' + accounting.byKind.noncanonical_audition_fixture + ' noncanonical fixtures; spoiler levels ' + JSON.stringify(accounting.bySpoiler) + '.\n\n';
md += '| Case | Speaker | Delivery | Source | Spoiler | Spoken text | Control |\n|---|---|---|---|---|---|---|\n';
for (const c of cases) md += '| ' + c.caseId + ' | ' + c.speechLine.speakerId + (c.dialectVariant === 'kansai' ? ' (Kansai)' : '') + (c.playerVoiceType ? ' (' + c.playerVoiceType.toUpperCase() + ')' : '') + ' | ' + c.deliveryLabel + ' | ' + (c.sourceKind === 'game_line' ? '`' + c.lineId + '`' : '**fixture**') + ' | ' + c.spoilerLevel + ' | ' + show(c) + ' | ' + (c.neutralControl ? 'yes' : '') + ' |\n';
md += '\n## NPC casting targets and what the game establishes\n\n';
for (const p of [...new Set(by((x) => x.group === 'npc').map((x) => x.castingProfile))]) { const c = cases.find((x) => x.castingProfile === p && x.speakerIdentity); md += '- **' + p + '**: ' + (c ? c.speakerIdentity : '(not recorded)') + '\n'; }

if (errors.length) { console.log('CORPUS PROBLEMS (' + errors.length + '):\n  ' + errors.join('\n  ')); process.exit(1); }
const json = JSON.stringify(corpus, null, 1) + '\n';
if (process.argv.includes('--check')) {
  const have = fs.existsSync(path.join(OUT, 'audition_corpus.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'audition_corpus.json'), 'utf8')) : null;
  // a frozen case the game has since corrected stays frozen (C-95, Robin 2026-10-16: "Preserve the frozen audition
  // text"): listed in DIVERGENCES.json with both texts' hashes, so any further change to either still fails here
  const DIV = fs.existsSync(path.join(OUT, 'DIVERGENCES.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'DIVERGENCES.json'), 'utf8')).divergences || [] : [];
  const kept = [];
  const diff = !have ? ['no committed corpus'] : cases.filter((c, i) => {
    const h = have.cases[i];
    if (h && h.speechLine.production.spokenTextSha256 === c.speechLine.production.spokenTextSha256 && h.lineId === c.lineId) return false;
    const d = h && DIV.find((x) => x.caseId === c.caseId && x.frozenSpokenSha256 === h.speechLine.production.spokenTextSha256 && x.gameSpokenSha256 === c.speechLine.production.spokenTextSha256);
    if (d) { kept.push(c.caseId + ' (' + d.finding + ')'); return false; }
    return true;
  }).map((c) => c.caseId);
  console.log(diff.length ? 'the corpus no longer matches the game: ' + diff.join(', ') : 'corpus ok: ' + cases.length + ' cases match the game' + (kept.length ? '; kept frozen as recorded: ' + kept.join(', ') : ''));
  if (process.argv.includes('--hashes')) for (const id of process.argv.slice(process.argv.indexOf('--hashes') + 1)) { const i = cases.findIndex((c) => c.caseId === id); if (i >= 0) console.log(id, have.cases[i].speechLine.production.spokenTextSha256, cases[i].speechLine.production.spokenTextSha256); }
  process.exit(diff.length ? 1 : 0);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'audition_corpus.json'), json);
fs.writeFileSync(path.join(OUT, 'CORPUS.md'), md);
console.log('wrote ' + cases.length + ' cases; ' + JSON.stringify(accounting));
