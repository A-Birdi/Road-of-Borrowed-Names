// Story reachability matrix: plays a new campaign (tests/e2e/pursue.mjs) for each learning profile × companion, a few
// runs at a time, and prints a table.
//   node tests/e2e/matrix.mjs [profiles] [comps] [parallel]                    the six-chapter edition's route, six
//       chapters and one Atlas expedition (the original matrix), e.g. node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3
//   node tests/e2e/matrix.mjs --twelve [profiles] [comps] [parallel]           the shipped twelve-chapter edition's
//       route: each run gets PURSUE_EDITION=new (the edition the build gives a new journey) and the twelve-chapter
//       legs explicitly, and must report that edition and reach all seventeen milestones in order
//   node tests/e2e/matrix.mjs --twelve --pairs F/ren,E/nao,I/mio,A/suzu [parallel]   named pairs instead of the
//       product (P18's four continuous campaigns, Robin's C-89); --fixtures writes each run's milestone states to
//       tests/fixtures/campaign/ (PURSUE_FIXTURES=1); MATRIX_LOG_DIR=<dir> keeps each run's whole output there
// The full product (FEIA × nao,mio,ren,suzu: sixteen campaigns) stays available; nothing runs it by itself.
// Every run is at the default settings, so the music plays its Original: the music performance (MT-1) is not a
// dimension here, nor of the F/Ren chain (Robin's C-88); tests/e2e/music_performance.mjs covers both performances.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (f) => { const i = args.indexOf(f); if (i < 0) return false; args.splice(i, 1); return true; };
const opt = (f) => { const i = args.indexOf(f); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const twelve = flag('--twelve');
const fixtures = flag('--fixtures');
const pairsArg = opt('--pairs');
// the twelve-chapter route's milestones, in order (pursue.mjs LEGS12)
const TWELVE_MILESTONES = ['ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_passed', 'cr_done', 'yn_called', 'yn_vents_open', 'yn_kettle_settled', 'yn_done', 'ch6_done'];
const SIX_MILESTONES = ['ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'ch6_done', 'atlas_restore_1'];
const expected = twelve ? TWELVE_MILESTONES : SIX_MILESTONES;
const jobs = [];
let par;
if (pairsArg) {
  for (const pc of pairsArg.split(',')) { const [pr, c] = pc.split('/'); if (!/^[FEIA]$/.test(pr) || !['nao', 'mio', 'ren', 'suzu'].includes(c)) throw new Error('bad pair ' + pc); jobs.push({ pr, c }); }
  par = +(args[0] || 2);
} else {
  const profiles = (args[0] || 'FEIA').split('');
  const comps = (args[1] || 'nao,mio,ren,suzu').split(',');
  par = +(args[2] || 3);
  for (const pr of profiles) for (const c of comps) jobs.push({ pr, c });
}
const results = [];
async function runOne(j) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const env = Object.assign({}, process.env, twelve ? { PURSUE_EDITION: 'new' } : {}, fixtures ? { PURSUE_FIXTURES: '1' } : {});
    const ch = spawn(process.execPath, [path.join(here, 'pursue.mjs'), j.pr, j.c].concat(twelve ? ['twelve'] : []), { stdio: ['ignore', 'pipe', 'pipe'], env });
    let out = '';
    ch.stdout.on('data', (d) => (out += d));
    ch.stderr.on('data', (d) => (out += d));
    ch.on('close', (code) => {
      // each run's whole output, kept where MATRIX_LOG_DIR says (the evidence outlives this table)
      if (process.env.MATRIX_LOG_DIR) { fs.mkdirSync(process.env.MATRIX_LOG_DIR, { recursive: true }); fs.writeFileSync(path.join(process.env.MATRIX_LOG_DIR, j.pr + '-' + j.c + (twelve ? '-twelve' : '') + '.log'), out); }
      const reached = (out.match(/^reached +\S+/gm) || []).map((l) => l.split(/ +/)[1]);
      const legs = (out.match(/^(reached|STUCK) +\S+/gm) || []).map((l) => (l.startsWith('reached') ? '✓' : '✗') + l.split(/ +/)[1].replace('_done', ''));
      const lost = /"lost": \[\s*"/.test(out);
      const probs = /"problems": \[\s*\{/.test(out);
      const ed = (out.match(/^edition: .*$/m) || [''])[0];
      // all the expected milestones, in the expected order (pursue.mjs also refuses one reached out of order)
      const sequence = reached.length === expected.length && reached.every((f, i) => f === expected[i]);
      const r = { profile: j.pr, comp: j.c, ok: code === 0 && sequence, sequence, edition: ed, legs: legs.join(' '), minutes: ((Date.now() - t0) / 60000).toFixed(1), lost, probs, tail: code === 0 && sequence ? '' : out.split('\n').filter((l) => /STUCK|"fail"|NOT THE SHIPPED|NOT A WHOLE|OUT OF ORDER|NOT SEEN SET|problems|pageErrors/.test(l)).slice(0, 6).join('\n     ') };
      console.log((r.ok ? 'PASS ' : 'FAIL ') + j.pr + '/' + j.c + '  ' + r.legs + '  (' + r.minutes + ' min)' + (twelve ? '  [' + ed + ']' : '') + (r.tail ? '\n     ' + r.tail : ''));
      resolve(r);
    });
  });
}
console.log((twelve ? 'twelve-chapter route (PURSUE_EDITION=new), ' : 'six-chapter route, ') + jobs.length + ' campaign(s): ' + jobs.map((j) => j.pr + '/' + j.c).join(', ') + '; expected milestones: ' + expected.join(' > '));
const queue = jobs.slice();
await Promise.all(Array.from({ length: par }, async () => { while (queue.length) results.push(await runOne(queue.shift())); }));
const failed = results.filter((r) => !r.ok);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' campaigns ' + (twelve ? 'played the twelve chapters to the ending, every milestone in order' : 'played all six chapters and one Atlas expedition'));
process.exit(failed.length ? 1 : 0);
