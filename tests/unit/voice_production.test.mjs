// C-95 reconciliation: the full-game recording plan.
//   - companions are attributed through the scene's branches (RV-0160): a line behind `!if comp=ren -> ren` is Ren's
//     only; nothing is recorded for a companion who never says it;
//   - the recording manifest never speaks markup, spacing or English; seams carry the reading the line means; every
//     recording serves at least one line; lines with a run-time name are listed apart;
//   - the narrator's reference readings (LI-8) are in the same manifest, particles said as said;
//   - the runtime voice manifest refuses audio made for another script, an absolute base, or a file without its size
//     and hash.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { root } from '../lib/load.mjs';

export default async (t) => {
  const { RB, allLines } = await import('../../tools/voice/lines.mjs');
  const { branches, companionsOf, COMPS } = await import('../../tools/voice/attribution.mjs');
  const L = allLines();
  const comp = L.filter((l) => l.who === 'comp');
  const BR = {};
  const att = comp.map((l) => ({ l, a: companionsOf(l, (BR[l.scene] || (BR[l.scene] = branches(RB.content.scenes[l.scene])))[l.idx] || null) }));
  t.ok(att.every(({ a }) => a.comps.length >= 1 && a.comps.every((c) => COMPS.includes(c))), 'every companion line has one to four companions');
  const byBranch = att.filter(({ a }) => a.basis === 'branch');
  t.ok(byBranch.length > 20 && byBranch.every(({ a }) => a.comps.length === 1), 'lines inside a companion\'s branch are that companion\'s only: ' + byBranch.length);
  const cond = att.filter(({ l }) => /comp=(nao|mio|ren|suzu)/.test(l.if || '') && !/[|]/.test(l.if || ''));
  t.ok(cond.every(({ l, a }) => a.comps.length === 1 && l.if.includes('comp=' + a.comps[0])), 'a line\'s own comp= condition decides');

  // the manifest, built into a scratch folder
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-manifest-'));
  execFileSync(process.execPath, [path.join(root, 'tools/voice/production_manifest.mjs'), '--out', dir], { cwd: root, stdio: 'pipe' });
  const m = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'RECORDING_MANIFEST.json.gz'))).toString());
  const sum = JSON.parse(fs.readFileSync(path.join(dir, 'SUMMARY.json'), 'utf8'));
  t.ok(m.schema === 'rbn.voice.production/1' && /^[0-9a-f]{64}$/.test(m.contentHash), 'versioned schema and a content hash of the script');
  const bad = m.entries.filter((e) => /[{}|\s]/.test(e.spoken) || /[{}|\s]/.test(e.kana) || e.spoken === e.display);
  t.ok(bad.length === 0, 'nothing spoken carries markup or the learner spacing (' + bad.length + ')');
  t.ok(m.entries.every((e) => e.lines.length >= 1 && e.kana && e.chars > 0), 'every recording serves a line and has its reading');
  t.ok(m.entries.every((e) => e.speaker !== 'pc' || e.voice === 'A' || e.voice === 'B'), 'the player is recorded as Voice A and Voice B');
  const hana = m.entries.find((e) => e.seams.some((s) => s.joined === '今朝' && s.means === 'いま|あさ'));
  t.ok(!!hana, 'the 今朝 seam (RV-0006) carries the reading the line means: いま|あさ');
  t.ok(m.notRecordable.length === sum.notRecordable.lines && m.notRecordable.every((d) => /\$\w+/.test(d.jp)), 'lines with a run-time name are listed apart: ' + m.notRecordable.length);
  t.ok(sum.recordings === m.entries.length && sum.companionAttribution && !('undefined' in sum.companionAttribution), 'the summary agrees: ' + sum.recordings + ' recordings');
  // the narrator's reference readings (LI-8): the same set tools/voice/reference_count.mjs counts, said as said
  const refCount = JSON.parse(execFileSync(process.execPath, [path.join(root, 'tools/voice/reference_count.mjs'), '--json'], { cwd: root, encoding: 'utf8' }));
  t.ok(m.references.length === refCount.all.recordings && new Set(m.references.map((r) => r.key)).size === m.references.length, 'reference readings: ' + m.references.length + ', one per kind, written form and reading');
  const ha = m.references.find((r) => r.key === 'word:は|は');
  t.ok(ha && ha.spoken === 'わ' && m.references.every((r) => r.speaker === 'narrator' && r.delivery === 'citation' && r.spoken), 'the topic particle は is sent as said (わ), never as spelled');
  fs.rmSync(dir, { recursive: true, force: true });

  // the runtime manifest
  const { buildRuntime } = await import('../../tools/voice/runtime_manifest.mjs');
  const prod = { schema: 'rbn.voice.production/1', contentHash: 'c'.repeat(64), entries: [
    { id: 'r1-a', speaker: 'pc', voice: 'A', dialect: 'standard', delivery: 'neutral', textHash: 'x', lines: [{ key: 's.a#1' }] },
    { id: 'r1-b', speaker: 'suzu', voice: null, dialect: 'kansai', delivery: 'smile', textHash: 'y', lines: [{ key: 's.b#2' }, { key: 's.c#3' }] }] };
  const rec = (f) => ({ file: f, bytes: 1000, sha256: 'a'.repeat(64), seconds: 1.2 });
  const ok = buildRuntime(prod, { contentHash: prod.contentHash, recordings: { 'r1-a': rec('pc/a.opus'), 'r1-b': rec('suzu/b.opus') } }, { voiceBuild: 'vb1' });
  t.ok(!ok.errors.length && ok.manifest.lines['s.c#3'][0].dialect === 'kansai' && ok.manifest.base === './voices/ja-JP/vb1/' && ok.manifest.totals.files === 2, 'a runtime manifest keyed by line and variant, beside the game by default');
  t.ok(buildRuntime(prod, { contentHash: 'd'.repeat(64), recordings: {} }, { voiceBuild: 'vb1' }).errors.some((e) => /another script/.test(e)), 'audio made for another script is refused');
  t.ok(buildRuntime(prod, { recordings: {} }, { voiceBuild: 'vb1', base: 'https://example.org/v/' }).errors.some((e) => /relative/.test(e)), 'an absolute base is refused');
  t.ok(buildRuntime(prod, { recordings: { 'r1-a': { file: 'pc/a.opus' } } }, { voiceBuild: 'vb1' }).errors.some((e) => /size and sha256/.test(e)), 'a file without its size and hash is refused');
  t.ok(buildRuntime(prod, { recordings: {} }, { voiceBuild: 'vb1', base: '../Road-of-Borrowed-Names-voices/ja-JP/vb1/' }).manifest.base.startsWith('../'), 'a separate voice repository on the same site is a relative base');
  const withRef = Object.assign({}, prod, { references: [{ id: 'r1-ref-a', key: 'word:橋|はし' }] });
  const rr = buildRuntime(withRef, { recordings: { 'r1-a': rec('pc/a.opus'), 'r1-b': rec('suzu/b.opus'), 'r1-ref-a': rec('ref/a.opus') } }, { voiceBuild: 'vb1' });
  t.ok(!rr.errors.length && rr.manifest.references['word:橋|はし'].file === 'ref/a.opus' && rr.manifest.totals.files === 3, 'reference readings are keyed by kind, written form and reading');
};
