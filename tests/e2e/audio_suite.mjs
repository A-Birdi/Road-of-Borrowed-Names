// Runs the audio-related browser checks one after another against the built
// index.html and prints a summary (zone music, instruments, the audio engine,
// and the battle/story tests the music wiring touches).
// Usage: node tools/build.mjs && node tests/e2e/audio_suite.mjs [--story]
//   --story  also runs story_ch1.mjs F mio and story_ch3.mjs E nao
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const story = process.argv.includes('--story');
const suites = [
  ['audio_zones.mjs'], ['audio_instruments.mjs'], ['audio.check.mjs'],
  ['combat_ui.mjs'], ['battle_presentation.mjs'],
  ...(story ? [['story_ch1.mjs', 'F', 'mio'], ['story_ch3.mjs', 'E', 'nao']] : []),
];
const results = [];
for (const [file, ...args] of suites) {
  const t0 = Date.now();
  const code = await new Promise((resolve) => {
    const ch = spawn(process.execPath, [path.join(here, file), ...args], { stdio: 'inherit' });
    ch.on('close', resolve);
  });
  const name = [file, ...args].join(' ');
  results.push({ name, ok: code === 0, s: Math.round((Date.now() - t0) / 1000) });
  console.log((code === 0 ? '== PASS ' : '== FAIL ') + name + ' (' + results[results.length - 1].s + ' s)\n');
}
console.log('\nSummary:');
for (const r of results) console.log('  ' + (r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + '  ' + r.s + ' s');
const failed = results.filter((r) => !r.ok).length;
console.log('\n' + (results.length - failed) + '/' + results.length + ' audio browser scripts passed');
process.exit(failed ? 1 : 0);
