// Story reachability matrix: plays a new campaign through all six chapters
// (tests/e2e/pursue.mjs) for every learning profile × companion, a few runs
// at a time, and prints a table. Usage: node tests/e2e/matrix.mjs [profiles] [comps] [parallel]
//   e.g. node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const profiles = (process.argv[2] || 'FEIA').split('');
const comps = (process.argv[3] || 'nao,mio,ren,suzu').split(',');
const par = +(process.argv[4] || 3);
const jobs = [];
for (const pr of profiles) for (const c of comps) jobs.push({ pr, c });
const results = [];
async function runOne(j) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const ch = spawn(process.execPath, [path.join(here, 'pursue.mjs'), j.pr, j.c], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    ch.stdout.on('data', (d) => (out += d));
    ch.stderr.on('data', (d) => (out += d));
    ch.on('close', (code) => {
      const legs = (out.match(/^(reached|STUCK) +\S+/gm) || []).map((l) => (l.startsWith('reached') ? '✓' : '✗') + l.split(/ +/)[1].replace('_done', ''));
      const lost = /"lost": \[\s*"/.test(out);
      const probs = /"problems": \[\s*\{/.test(out);
      const r = { profile: j.pr, comp: j.c, ok: code === 0, legs: legs.join(' '), minutes: ((Date.now() - t0) / 60000).toFixed(1), lost, probs, tail: code === 0 ? '' : out.split('\n').filter((l) => /STUCK|fail|companion|error/i.test(l)).slice(0, 4).join(' | ') };
      console.log((r.ok ? 'PASS ' : 'FAIL ') + j.pr + '/' + j.c + '  ' + r.legs + '  (' + r.minutes + ' min)' + (r.tail ? '\n     ' + r.tail : ''));
      resolve(r);
    });
  });
}
const queue = jobs.slice();
await Promise.all(Array.from({ length: par }, async () => { while (queue.length) results.push(await runOne(queue.shift())); }));
const failed = results.filter((r) => !r.ok);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' combinations reached the end of Chapter 6');
process.exit(failed.length ? 1 : 0);
