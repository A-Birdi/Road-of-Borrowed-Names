// A small real voice site for the browser tests: the production manifest built from the current script, the
// recordings for the chosen scenes and reference keys made as short synthetic tones (ffmpeg, Ogg Opus 48 kHz mono;
// each its own pitch and length), a results file in the worker's schema, and the site built by tools/voice/voice_site.mjs
// exactly as the real one would be. No voice is generated: these are test tones standing in for recordings.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root } from './lib.mjs';
import { buildSite, readResults, writeSite } from '../../tools/voice/voice_site.mjs';

export function makeVoiceSite(dir, o) {
  fs.mkdirSync(dir, { recursive: true });
  const pm = path.join(dir, 'pm');
  execFileSync(process.execPath, [path.join(root, 'tools/voice/production_manifest.mjs'), '--out', pm], { cwd: root, stdio: 'pipe' });
  const production = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(pm, 'RECORDING_MANIFEST.json.gz'))).toString());
  const scenes = new Set(o.scenes);
  const chosen = production.entries.filter((e) => e.lines.some((l) => scenes.has(l.scene))).concat((production.references || []).filter((r) => (o.refs || []).includes(r.key)));
  const audio = path.join(dir, 'audio');
  fs.mkdirSync(audio, { recursive: true });
  const recordings = {};
  chosen.forEach((e, i) => {
    const seconds = +(0.7 + (i % 5) * 0.15).toFixed(2);
    const file = e.id + '.opus';
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=f=' + (330 + i * 23) + ':d=' + seconds, '-ac', '1', '-ar', '48000', '-c:a', 'libopus', '-b:a', '48k', path.join(audio, file)]);
    const b = fs.readFileSync(path.join(audio, file));
    recordings[e.id] = { file, bytes: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex'), seconds };
  });
  const resultsPath = path.join(dir, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({ schema: 'rbn.voice.results/1', contentHash: production.contentHash, sourceRevision: 'test', casting: {}, recordings }));
  const read = readResults([resultsPath], [audio]);
  if (read.errors.length) throw new Error(read.errors.join('\n'));
  const site = buildSite(production, read.recordings, { voiceBuild: o.voiceBuild || 'test-1' });
  if (site.errors.length) throw new Error(site.errors.join('\n'));
  const out = path.join(dir, 'site', 'ja-JP');
  writeSite(out, site, read.recordings);
  return { site: path.join(dir, 'site'), lang: out, production, chosen, index: site.index };
}
