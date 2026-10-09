// Census of what the game contains today (expansion playbook P00, D14): maps, residents, creatures, battle moves,
// language tasks, story records, illustrations and sequences, sounds and wardrobe. Read-only: it loads the source
// modules the way the unit tests do and counts what is registered; it changes nothing.
// Usage: node tools/census.mjs [--json out.json] [--md out.md]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { load } from '../tests/lib/load.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas', 'audio'], { __RB_TEST__: true });
const C = RB.content;
const REGION_NAME = { rw: 'Reedwake', sg: 'Saltglass', co: 'Cinder Orchard', sb: 'Snowbell', lf: 'Lanternfall', sa: 'The Still Archive', lq: 'Long quests and Koharuno', atlas: 'The Atlas' };
const regionOf = (id) => String(id).split('.')[0];
const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
const tally = (arr, f) => { const t = {}; for (const x of arr) { const k = f(x); t[k] = (t[k] || 0) + 1; } return sorted(t); };
const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };

// ---- maps and the people placed on them ----
const maps = Object.entries(C.maps).map(([id, m]) => {
  const t = m.terrain || {};
  const rows = Array.isArray(t) ? t : Array.isArray(t.rows) ? t.rows : null;
  return { id, region: regionOf(id), name: m.name && (m.name.en || m.name), npcs: (m.npcs || []).length, size: rows ? rows.length + '×' + (rows[0] || '').length : (t.w && t.h ? t.h + '×' + t.w : null) };
});
const placements = [];
for (const [id, m] of Object.entries(C.maps)) for (const n of m.npcs || []) placements.push({ map: id, region: regionOf(id), char: n.id });
const charIds = Object.keys(C.chars);
const companions = charIds.filter((k) => C.chars[k].companion);
const placedChars = [...new Set(placements.map((p) => p.char))];
const residentsByRegion = {};
for (const p of placements) (residentsByRegion[p.region] = residentsByRegion[p.region] || new Set()).add(p.char);

// ---- creatures and moves ----
const enemies = Object.entries(C.enemies).map(([id, e]) => ({ id, region: regionOf(id), name: e.name && (e.name.en || e.name), knots: e.knots, pattern: e.pattern || null }));
const L = RB.combatLogic || {};
const intents = Object.keys(L.INTENTS || {});
const intentUse = {};
for (const e of enemies) for (const p of e.pattern || []) { const k = String(p).split(':')[0]; intentUse[k] = (intentUse[k] || 0) + 1; }
const words = Object.keys(C.words || {});
const compActions = Object.fromEntries(Object.entries(C.companionActions || {}).map(([k, v]) => [k, (v || []).map((a) => a.id)]));

// ---- language tasks ----
const challengeSteps = [];
for (const [id, ch] of Object.entries(C.challenges)) for (const [tier, steps] of Object.entries(ch.tiers || {})) for (const s of steps || []) challengeSteps.push({ id, tier, kind: s.kind || '?' });
const drills = C.drills || [];

// ---- illustrations, sequences, art ----
const harmonyDir = path.join(root, 'assets', 'harmony');
const countFiles = (dir, ext) => { let n = 0; const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (f.endsWith(ext)) n++; } }; walk(dir); return n; };

// ---- sounds ----
const songs = safe(() => RB.audio.songList(), []);
const motifs = safe(() => RB.audio.motifList(), []);
const sfx = safe(() => RB.audio.sfxList(), []);

// ---- wardrobe ----
const items = Object.entries(C.items).map(([id, i]) => ({ id, slot: i.slot || (i.key ? 'key item' : 'other') }));

const census = {
  generated: { by: 'tools/census.mjs', note: 'Counts of what is registered in the source today; not a plan or a quota.' },
  maps: { total: maps.length, byRegion: tally(maps, (m) => m.region), list: maps },
  residents: {
    characters: charIds.length, companions, placedOnMaps: placedChars.length, placements: placements.length,
    byRegion: sorted(Object.fromEntries(Object.entries(residentsByRegion).map(([k, v]) => [k, v.size]))),
  },
  creatures: { total: enemies.length, byRegion: tally(enemies, (e) => e.region), list: enemies.map((e) => ({ id: e.id, name: e.name, knots: e.knots })) },
  battle: { intents, intentUseInPatterns: sorted(intentUse), inscriptions: words, companionActions: compActions, difficulty: Object.keys(L.DIFF || {}) },
  language: {
    challenges: Object.keys(C.challenges).length, challengeSteps: challengeSteps.length, stepKinds: tally(challengeSteps, (s) => s.kind), stepTiers: tally(challengeSteps, (s) => s.tier),
    drills: drills.length, drillKinds: tally(drills, (d) => d.kind || '?'), drillLevels: tally(drills, (d) => d.lv || '?'),
    activities: Object.keys(C.activities).length, practiceA: Object.keys(C.practiceA || {}), practiceB: Object.keys(C.practiceB || {}).filter((k) => k !== 'ui'),
    // fishing, shiritori and the pace drills keep their content in their own modules, not in these two registries
    otherPractice: ['fishing', 'shiritori', 'pace'].filter((k) => RB[k === 'pace' ? 'paceCore' : k]),
    wordplay: Object.keys(C.wordplay || {}).length, atlasDrills: (C.atlas && C.atlas.drillIds || []).length,
  },
  story: {
    quests: Object.keys(C.quests).length, scenes: Object.keys(C.scenes).length, banter: (C.banter || []).length, notes: Object.keys(C.notes).length,
    keepsakes: Object.keys(C.keepsakes || {}).length, cases: Object.keys(C.cases || {}).length, clues: Object.keys(C.clues || {}).length, knownDetails: (C.knownDetails || []).length,
    places: Object.keys(C.places), roads: (C.roads || []).length,
  },
  art: {
    sequences: safe(() => RB.sequence.ids().length, null), harmonyPngs: countFiles(harmonyDir, '.png'),
    keepsakeArt: Object.keys(C.keepsakeArt || {}).length, caseArt: Object.keys(C.caseArt || {}).length,
    portraitExpressions: safe(() => Object.keys(RB.portraits.EXPRESSIONS).length, null),
    hairStyles: safe(() => (Array.isArray(RB.portraits.hairStyles) ? RB.portraits.hairStyles : Object.keys(RB.portraits.hairStyles)).length, null),
  },
  sound: { songs: songs.length, motifs: motifs.length, sfx: sfx.length },
  wardrobe: { equipSlots: safe(() => RB.equip.SLOTS.map((s) => s.id + ' (' + s.en + ', ' + s.where + ')'), []), itemsBySlot: tally(items, (i) => i.slot) },
};

// The plan files this census is read against (their hashes identify the source revision).
const planDir = path.join(root, 'docs', 'future', 'plan');
census.planSource = sorted(Object.fromEntries(fs.readdirSync(planDir).filter((f) => f.endsWith('.md')).map((f) => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(planDir, f))).digest('hex').slice(0, 16)])));

const md = [];
md.push('# Census of the game as it stands', '', '*Generated by `node tools/census.mjs`. Counts of what the source registers today, for the expansion playbook\'s P00 (D14: every region\'s list starts from what exists). Not a plan, not a quota.*', '');
const row = (cells) => '| ' + cells.join(' | ') + ' |';
md.push('## By region', '', row(['Region', 'Maps', 'Residents placed', 'Creature kinds']), row(['---', '---:', '---:', '---:']));
for (const r of Object.keys(REGION_NAME)) md.push(row([REGION_NAME[r] + ' (`' + r + '`)', census.maps.byRegion[r] || 0, census.residents.byRegion[r] || 0, census.creatures.byRegion[r] || 0]));
md.push(row(['**Total**', census.maps.total, census.residents.placedOnMaps + ' distinct', census.creatures.total]), '');
md.push('## People', '', `- ${census.residents.characters} characters registered; ${census.residents.placedOnMaps} placed on maps in ${census.residents.placements} placements; companions: ${companions.join(', ')}.`, '');
md.push('## Battle', '', `- Creature moves (intents): ${intents.length} — ${intents.join(', ')}.`, `- Inscriptions: ${words.length} — ${words.join(', ')}.`, `- Companion actions: ${Object.entries(compActions).map(([k, v]) => k + ' ' + v.length).join(', ')}.`, `- Settings: ${census.battle.difficulty.join(', ')}.`, '');
md.push('## Language tasks', '', `- Challenges: ${census.language.challenges}, with ${census.language.challengeSteps} steps across tiers (kinds: ${Object.entries(census.language.stepKinds).map(([k, v]) => k + ' ' + v).join(', ')}).`,
  `- Drills: ${census.language.drills} (kinds: ${Object.entries(census.language.drillKinds).map(([k, v]) => k + ' ' + v).join(', ')}; levels: ${Object.entries(census.language.drillLevels).map(([k, v]) => k + ' ' + v).join(', ')}).`,
  `- Story activities: ${census.language.activities}; practice games: ${[...census.language.practiceA, ...census.language.practiceB, ...census.language.otherPractice].join(', ')}; wordplay sets: ${census.language.wordplay}; Atlas drills: ${census.language.atlasDrills}.`, '');
md.push('## Story records', '', `- Quests ${census.story.quests}; scenes ${census.story.scenes}; banter lines ${census.story.banter}; notes ${census.story.notes}; keepsakes ${census.story.keepsakes}; cases ${census.story.cases} (clues ${census.story.clues}); known details ${census.story.knownDetails}; fast-travel places ${census.story.places.length}; charted roads ${census.story.roads}.`, '');
md.push('## Art and sound', '', `- Illustrated sequences: ${census.art.sequences}; painted Harmony frames (PNG): ${census.art.harmonyPngs}; keepsake art ${census.art.keepsakeArt}; case art ${census.art.caseArt}; portrait expressions ${census.art.portraitExpressions}; hair styles ${census.art.hairStyles}.`,
  `- Songs ${census.sound.songs}; motifs ${census.sound.motifs}; sound effects ${census.sound.sfx}.`, '');
md.push('## Wardrobe and items', '', `- Equipment slots: ${census.wardrobe.equipSlots.join(', ')}.`, `- Items by slot: ${Object.entries(census.wardrobe.itemsBySlot).map(([k, v]) => k + ' ' + v).join(', ')}.`, '');
md.push('## Plan source', '', 'The plan files read against this census (first 16 hex digits of each SHA-256):', '', ...Object.entries(census.planSource).map(([f, h]) => `- \`${f}\` ${h}`), '');

const jsonOut = arg('--json'), mdOut = arg('--md');
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(census, null, 1) + '\n');
if (mdOut) fs.writeFileSync(mdOut, md.join('\n'));
if (!jsonOut && !mdOut) console.log(md.join('\n'));
