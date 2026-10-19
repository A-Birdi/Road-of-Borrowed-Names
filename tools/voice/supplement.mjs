// An append-only recording supplement (VOICE_DELIVERY.md §8): the recordings the current script needs that neither the
// GO manifest nor an earlier supplement lists, by id, with the lines they are for; and the GO ids the script no longer
// uses (retired: kept for one site build, nothing deleted). Nothing here generates audio.
//   node tools/voice/supplement.mjs --id SL1 --what "…" --authorization "…" --out docs/future/voice/production/supplements/SL1_SUPPLEMENT.json
// (builds the manifest from the current script into a scratch directory with tools/voice/production_manifest.mjs)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const id = arg('--id'), out = arg('--out');
if (!id || !out) { console.log('usage: node tools/voice/supplement.mjs --id <ID> --what <text> --authorization <text> --out <file>'); process.exit(2); }
const P = (p) => path.join(root, p);
const gz = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString());

const go = JSON.parse(fs.readFileSync(P('docs/future/voice/production/GO.json'), 'utf8'));
const goPath = P(go.manifest.path);
const goMan = gz(goPath);
const supDir = P('docs/future/voice/production/supplements');
const earlier = fs.readdirSync(supDir).filter((f) => /_SUPPLEMENT\.json$/.test(f) && f !== path.basename(out)).map((f) => JSON.parse(fs.readFileSync(path.join(supDir, f), 'utf8')));
const known = new Set(goMan.entries.map((e) => e.id).concat(goMan.references.map((e) => e.id)));
for (const s of earlier) for (const e of (s.entries || []).concat(s.references || [])) known.add(e.id);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-sup-'));
execFileSync(process.execPath, [P('tools/voice/production_manifest.mjs'), '--out', tmp], { cwd: root, stdio: 'pipe' });
const now = gz(path.join(tmp, 'RECORDING_MANIFEST.json.gz'));
fs.rmSync(tmp, { recursive: true, force: true });

const entries = now.entries.filter((e) => !known.has(e.id));
const references = (now.references || []).filter((e) => !known.has(e.id));
const nowIds = new Set(now.entries.map((e) => e.id).concat((now.references || []).map((e) => e.id)));
const retiredEarlier = new Set(earlier.flatMap((s) => ((s.retired && s.retired.ids) || []).map((x) => x.id)));
const retired = goMan.entries.filter((e) => !nowIds.has(e.id) && !retiredEarlier.has(e.id)).map((e) => ({ id: e.id, speaker: e.speaker, spoken: e.spoken, lines: e.lines.map((l) => l.key) }));
const git = (...a) => execFileSync('git', a, { cwd: root }).toString().trim();
const sum = (k) => entries.reduce((a, e) => a + (e[k] || 0), 0) + references.reduce((a, e) => a + (k === 'pauses' ? 0 : e[k] || 0), 0);
const bySpeaker = {};
for (const e of entries) bySpeaker[e.speaker] = (bySpeaker[e.speaker] || 0) + 1;
const doc = {
  schema: 'rbn.voice.supplement/1', id,
  what: arg('--what') || '', authorization: arg('--authorization') || '',
  after: { goSourceRevision: go.sourceRevision, goManifestSha256: crypto.createHash('sha256').update(fs.readFileSync(goPath)).digest('hex'), goScriptContentHash: go.manifest.scriptContentHash, earlierSupplements: earlier.map((s) => s.id) },
  builtFrom: { branch: git('rev-parse', '--abbrev-ref', 'HEAD'), commit: git('rev-parse', 'HEAD'), scriptContentHash: now.contentHash, command: 'node tools/voice/supplement.mjs --id ' + id + ' (tools/voice/production_manifest.mjs into a scratch directory, compared by id with the GO manifest and the earlier supplements)' },
  counts: { entries: entries.length, references: references.length, retired: retired.length, chars: sum('chars'), morae: sum('morae'), bySpeaker },
  entries, references,
  retired: { note: 'GO ids the current script no longer uses. Their recordings (if made) are kept for one site build and then drop out of its indexes (§8.4); nothing is deleted.', ids: retired },
  unchanged: 'Every other id is as in the GO manifest and the earlier supplements (' + earlier.map((s) => s.id).join(', ') + ').',
};
fs.writeFileSync(P(out), JSON.stringify(doc, null, 1) + '\n');
console.log(id + ': ' + entries.length + ' new recordings ' + JSON.stringify(bySpeaker) + ', ' + references.length + ' new references, ' + retired.length + ' retired → ' + out);
