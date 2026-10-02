// Runs the browser test scripts against the built index.html, one after another,
// and prints a summary. Usage: node tests/e2e/run.mjs [--full]
//   default: UI, systems, audio, per-chapter story tests (one or two
//            configurations each), an Atlas expedition, and one whole-game run
//   --full:  per-chapter story tests in all their configurations and the
//            16-combination whole-game matrix (takes an hour or more)
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const full = process.argv.includes('--full');
const suites = [
  ['ui.mjs'], ['systems.mjs'], ['settings.mjs'], ['folio.mjs'], ['equipment.mjs'], ['characters.mjs'], ['play_ui.mjs'], ['world_view.mjs'], ['world_fixes.mjs'], ['encounters.mjs'], ['departures.mjs'], ['quest_guide.mjs'], ['fieldweave.mjs'], ['mill_road.mjs'], ['keepsakes.mjs'], ['backdrops.mjs'], ['title_ledger.mjs'], ['create.mjs'], ['learning_ui.mjs'], ['pad_kanji.mjs'], ['kanji_chart.mjs'], ['combat_ui.mjs'], ['combat_small.mjs'], ['battle_anim.mjs'], ['battle_group.mjs'], ['companion_turn.mjs'], ['bookmarks.mjs'], ['pets.mjs'], ['pets_greet.mjs'], ['pets_weave.mjs'], ['pets_gallery.mjs'], ['audio.check.mjs'],
  ['shift_load_regression.mjs', '--origin'], ['shift_load_regression.mjs'], // hotfix regressions (http origin, file://)
  full ? ['story_ch1.mjs'] : ['story_ch1.mjs', 'F', 'mio'],
  full ? ['story_ch3.mjs'] : ['story_ch3.mjs', 'E', 'nao'], ['side_ch3.mjs'],
  full ? ['story_ch4.mjs'] : ['story_ch4.mjs', 'I', 'ren', 'go'],
  full ? ['story_ch5.mjs'] : ['story_ch5.mjs', 'A', 'suzu'],
  ...(full ? [0, 1, 2, 3, 4].map((i) => ['story_ch6.mjs', String(i)]) : [['story_ch6.mjs', '2']]),
  ['atlas.check.mjs'],
  // the companion ending extensions and The Pages We Keep (all four companions; captures to tests/e2e/out/pages)
  ['pages_ending.mjs'],
  // companionship: Company › Companion and Shared memories, invitations, reflections, rest (addendum §6–9, §19)
  ['company.mjs'],
  ['company_pets.mjs'],
  ['addendum_integration.mjs'],
  // the two quest lines across the chapters (fixtures; --full adds all four
  // companions and a whole-game run with both lines as goals)
  full ? ['long_quests.mjs', '--all-companions'] : ['long_quests.mjs', '--fixtures-only'],
  // the two deduction cases, the refined sequences and their keepsakes, Known Details (addendum §14.8–§18)
  ['cases.mjs'], ['cases_shots.mjs'], ['known.mjs'],
  ['practice_b.mjs'], // practice suite B: letters, the Proofreader's Tray, One word two moments (docs/practice/suite_b.md)
  full ? ['matrix.mjs'] : ['pursue.mjs', 'E', 'mio'],
];
const results = [];
for (const [file, ...args] of suites) {
  const t0 = Date.now();
  const code = await new Promise((resolve) => {
    const ch = spawn(process.execPath, [path.join(here, file), ...args], { stdio: 'inherit' });
    ch.on('close', resolve);
  });
  results.push({ name: [file, ...args].join(' '), ok: code === 0, s: Math.round((Date.now() - t0) / 1000) });
  console.log((code === 0 ? '== PASS ' : '== FAIL ') + [file, ...args].join(' ') + ' (' + results[results.length - 1].s + ' s)\n');
}
console.log('\nSummary:');
for (const r of results) console.log('  ' + (r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + '  ' + r.s + ' s');
const failed = results.filter((r) => !r.ok).length;
console.log('\n' + (results.length - failed) + '/' + results.length + ' browser test scripts passed');
process.exit(failed ? 1 : 0);
