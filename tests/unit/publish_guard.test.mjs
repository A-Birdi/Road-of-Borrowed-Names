// VR-C1: the publishing size guard and what a voice site keeps across updates (tools/publish/site_size.mjs,
// tools/voice/voice_site.mjs, tools/publish/prepare_runtime.mjs). A tiny voice site in a temporary folder, built three
// times with the real command line; nothing outside that folder is written.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { root } from '../lib/load.mjs';
import { measure } from '../../tools/publish/site_size.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
export default async function (t) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-guard-'));
  try {
    const prod = (ids) => {
      const m = { schema: 'rbn.voice.production/1', contentHash: 'test', entries: ids.map((id, i) => ({ id, speaker: 'narrator', dialect: 'standard', textHash: 'th' + i, lines: [{ key: 's#' + i, scene: 's' }] })), references: [] };
      const f = path.join(tmp, 'prod-' + ids.join('-') + '.json.gz');
      fs.writeFileSync(f, zlib.gzipSync(JSON.stringify(m)));
      return f;
    };
    const audio = path.join(tmp, 'audio');
    fs.mkdirSync(audio);
    const rec = {};
    const make = (id, n) => { const b = crypto.createHash('sha512').update(id).digest(); const body = Buffer.alloc(n, b); fs.writeFileSync(path.join(audio, id + '.opus'), body); rec[id] = { file: id + '.opus', bytes: n, sha256: sha(body), seconds: 1 }; };
    make('r1-aaaa', 4000); make('r1-bbbb', 5000); make('r1-cccc', 6000); make('r1-dddd', 7000);
    const results = path.join(tmp, 'results.json');
    fs.writeFileSync(results, JSON.stringify({ schema: 'rbn.voice.results/1', recordings: rec }));
    const out = path.join(tmp, 'site', 'ja-JP');
    const run = (build, ids, extra = []) => {
      const r = spawnSync(process.execPath, [path.join(root, 'tools/voice/voice_site.mjs'), '--results', results, '--files', audio, '--voice-build', build, '--out', out, '--production', prod(ids), ...extra], { encoding: 'utf8' });
      return { code: r.status, out: r.stdout ? JSON.parse(r.stdout.trim().split('\n').pop()) : null, err: r.stderr };
    };
    const has = (id) => fs.readdirSync(path.join(out, 'rec/narrator')).some((f) => f.startsWith(id + '.'));
    const b1 = run('b1', ['r1-aaaa', 'r1-bbbb']);
    t.ok(b1.code === 0 && b1.out.folder.bytes > 9000 && b1.out.keptFromPreviousBuild === null, 'first build: measured, nothing older ' + JSON.stringify(b1.out && b1.out.folder));
    const b2 = run('b2', ['r1-bbbb', 'r1-cccc'], ['--update']);
    t.ok(b2.code === 0 && b2.out.keptFromPreviousBuild === 'b1' && b2.out.olderThanThat === 0 && has('r1-aaaa'), 'an update keeps the build before it (aaaa stays)');
    const v = b2.out.folder.voice[0];
    // (kept from b1: its recording r1-aaaa and its scene index)
    t.ok(v.notInCurrentBuild.files === 2 && v.notInCurrentBuild.bytes > 4000 && v.notInCurrentBuild.bytes < 5000 && v.current.files === 4, 'the folder report splits what the current build names from what is only kept ' + JSON.stringify(v));
    const b3 = run('b3', ['r1-cccc', 'r1-dddd'], ['--update']);
    t.ok(b3.code === 0 && b3.out.olderThanThat >= 1 && b3.out.pruned === 0 && has('r1-aaaa'), 'two builds on, aaaa is listed as older and still there without --prune-older');
    const b4 = run('b4', ['r1-cccc', 'r1-dddd'], ['--update', '--prune-older']);
    t.ok(b4.code === 0 && b4.out.pruned >= 1 && !has('r1-aaaa') && has('r1-cccc') && has('r1-dddd'), 'with --prune-older the older files go; the current ones stay');
    const over = run('b5', ['r1-cccc', 'r1-dddd'], ['--update', '--max-bytes', '1000']);
    t.ok(over.code === 1 && /over the ceiling/.test(over.err), 'over the ceiling: exit 1');
    const m = measure(path.join(tmp, 'site'), { maxBytes: 10 });
    t.ok(!m.ok && m.files > 0 && m.ceiling === 10, 'site_size reports a folder over its ceiling');
    const cli = spawnSync(process.execPath, [path.join(root, 'tools/publish/site_size.mjs'), path.join(tmp, 'site'), '--max-bytes', '10'], { encoding: 'utf8' });
    t.ok(cli.status === 1, 'site_size exits 1 over the ceiling');
    // a clone's .git is never published: left out of the measure and reported apart (a site within its ceiling stays
    // within it however large its history), and a worktree's .git pointer file the same
    const site = path.join(tmp, 'site');
    const before = measure(site);
    fs.mkdirSync(path.join(site, '.git', 'objects', 'pack'), { recursive: true });
    fs.writeFileSync(path.join(site, '.git', 'objects', 'pack', 'pack-x.pack'), Buffer.alloc(200000));
    fs.writeFileSync(path.join(site, '.git', 'HEAD'), 'ref: refs/heads/main\n');
    const withGit = measure(site, { maxBytes: before.bytes + 1000 });
    t.ok(withGit.ok && withGit.bytes === before.bytes && withGit.files === before.files && withGit.notPublished && withGit.notPublished.files === 2 && withGit.notPublished.bytes === 200000 + 21, '.git is left out of the measure and reported apart ' + JSON.stringify(withGit.notPublished));
    fs.rmSync(path.join(site, '.git'), { recursive: true, force: true });
    fs.writeFileSync(path.join(site, '.git'), 'gitdir: /elsewhere\n');
    const wt = measure(site);
    t.ok(wt.bytes === before.bytes && wt.notPublished && wt.notPublished.files === 1, 'a worktree\'s .git file is left out too');
    fs.rmSync(path.join(site, '.git'), { force: true });
    // the game's runtime set: within the default ceiling; a tiny ceiling refuses it before anything is copied
    if (fs.existsSync(path.join(root, 'index.html'))) {
      const ok = JSON.parse(execFileSync(process.execPath, [path.join(root, 'tools/publish/prepare_runtime.mjs'), '--list-only'], { encoding: 'utf8' }));
      t.ok(ok.withinCeiling && ok.ceiling === 900000000 && ok.bytes < ok.ceiling, 'the runtime set is within the ceiling: ' + ok.bytes);
      const dst = path.join(tmp, 'runtime');
      const no = spawnSync(process.execPath, [path.join(root, 'tools/publish/prepare_runtime.mjs'), '--out', dst, '--max-bytes', '1000000'], { encoding: 'utf8' });
      t.ok(no.status === 1 && !fs.existsSync(dst), 'over the ceiling, prepare_runtime copies nothing and exits 1');
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
