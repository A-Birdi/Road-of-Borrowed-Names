// The go signal for the local voice worker (docs/future/voice/production/READINESS.md): GO.json names the exact commit
// the batch is made from, the manifest's path and SHA-256, and what to run to check it. It is written in the commit after
// the one it names (a commit cannot name itself), and only from a clean checkout whose manifest matches the script.
// Usage: node tools/voice/go.mjs --source <commit>   (writes docs/future/voice/production/GO.json)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root } from '../../tests/lib/load.mjs';

const a = process.argv.slice(2);
const src = a.includes('--source') ? a[a.indexOf('--source') + 1] : null;
if (!src) { console.error('usage: --source <commit>'); process.exit(2); }
const git = (...x) => execFileSync('git', x, { cwd: root, encoding: 'utf8' }).trim();
const full = git('rev-parse', src);
const rel = 'docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz';
// the manifest as committed at that revision, and the script it was built from
const gz = execFileSync('git', ['show', full + ':' + rel], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
const m = JSON.parse(zlib.gunzipSync(gz).toString());
const sum = JSON.parse(git('show', full + ':docs/future/voice/production/manifest/SUMMARY.json'));
const here = fs.readFileSync(path.join(root, rel));
if (!here.equals(gz)) { console.error('the working manifest differs from the one at ' + full.slice(0, 7) + ': commit it first'); process.exit(1); }
const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
const go = {
  schema: 'rbn.voice.go/1',
  go: true,
  what: 'The full-game voice batch may be generated from this source revision and manifest, under PRODUCTION_SCOPE.md and VOICE_DELIVERY.md.',
  authorization: 'Robin, 2026-10-16: full-game production, kept apart from the audition approvals (PRODUCTION_SCOPE.md)',
  repository: 'A-Birdi/Road-of-Borrowed-Names',
  branch,
  sourceRevision: full,
  manifest: {
    path: rel,
    sha256: crypto.createHash('sha256').update(gz).digest('hex'),
    bytes: gz.length,
    schema: m.schema,
    scriptContentHash: m.contentHash,
    recordings: m.entries.length,
    references: (m.references || []).length,
    notRecordable: m.notRecordable.length,
  },
  check: ['git fetch origin ' + branch, 'git checkout ' + full, 'node tools/voice/production_manifest.mjs --check'],
  contract: ['docs/future/voice/production/PRODUCTION_SCOPE.md', 'docs/future/voice/production/VOICE_DELIVERY.md', 'docs/future/voice/production/VOICE_RUNTIME.md'],
  results: { schema: 'rbn.voice.results/1', contentHash: m.contentHash, sourceRevision: full },
  notInThisBatch: {
    playerNameLines: m.notRecordable.length + ' lines with a run-time name: a second small pass once their neutral-word versions exist (C-93)',
    deferredFindings: '12 C-95 findings are Robin\'s (docs/review/register/DISPOSITIONS.md); their lines are recorded as they are now',
  },
  counts: { byRole: sum.byRole, references: sum.references },
  readiness: 'docs/future/voice/production/READINESS.md',
  coordination: { session: 'session_015RcFBxQ5xp952n4kFB8UbL', url: 'https://claude.ai/code/session_015RcFBxQ5xp952n4kFB8UbL' },
};
fs.writeFileSync(path.join(root, 'docs/future/voice/production/GO.json'), JSON.stringify(go, null, 1) + '\n');
console.log(JSON.stringify({ sourceRevision: full, sha256: go.manifest.sha256, recordings: go.manifest.recordings, references: go.manifest.references }));
