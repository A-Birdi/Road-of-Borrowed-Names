// C-95 reconciliation: the full-game recording plan.
//   - companions are attributed through the scene's branches (RV-0160): a line behind `!if comp=ren -> ren` is Ren's
//     only; nothing is recorded for a companion who never says it;
//   - the recording manifest never speaks markup, spacing or English; seams carry the reading the line means; every
//     recording serves at least one line; lines with a run-time name are listed apart;
//   - the narrator's reference readings (LI-8) are in the same manifest, particles said as said;
//   - the voice site: one index per scene, content-named recordings whose addresses do not change when nothing in them
//     did, partial batches counted, results nothing uses reported.
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
  const pcs = m.entries.filter((e) => e.speaker === 'pc');
  const pcTexts = new Set(pcs.map((e) => e.delivery + '|' + e.spoken));
  t.ok(pcs.every((e) => ['A', 'B'].includes(e.voice) && ['high', 'low'].includes(e.pitch)) && pcs.length === pcTexts.size * 4 && new Set(pcs.map((e) => e.id)).size === pcs.length,
    'the player is recorded as Voice A and Voice B, each High and Low, each variant its own id: ' + pcs.length);
  t.ok(m.entries.every((e) => e.speaker === 'pc' || e.pitch === null), 'only the player has pitch variants');
  const hana = m.entries.find((e) => e.seams.some((s) => s.joined === '今朝' && s.means === 'いま|あさ'));
  t.ok(!!hana, 'the 今朝 seam (RV-0006) carries the reading the line means: いま|あさ');
  t.ok(hana && !hana.send.includes('今朝') && hana.send.includes('いまあさ'), 'and what the engine is sent never says 今朝: ' + (hana && hana.send));
  t.ok(m.entries.every((e) => e.seams.every((x) => !e.send.includes(x.kanji))) && m.entries.every((e) => e.send && !/[{}|\s]/.test(e.send)), 'no seam survives in what any engine is sent');
  t.ok(m.notRecordable.length === sum.notRecordable.lines && m.notRecordable.every((d) => /\$\w+/.test(d.jp)), 'lines with a run-time name are listed apart: ' + m.notRecordable.length);
  t.ok(sum.recordings === m.entries.length && sum.companionAttribution && !('undefined' in sum.companionAttribution), 'the summary agrees: ' + sum.recordings + ' recordings');
  // the narrator's reference readings (LI-8): the same set tools/voice/reference_count.mjs counts, said as said
  const refCount = JSON.parse(execFileSync(process.execPath, [path.join(root, 'tools/voice/reference_count.mjs'), '--json'], { cwd: root, encoding: 'utf8' }));
  const cites = m.references.filter((r) => r.kind !== 'phrase'), phrases = m.references.filter((r) => r.kind === 'phrase');
  t.ok(cites.length === refCount.all.recordings && new Set(m.references.map((r) => r.key)).size === m.references.length, 'reference readings: ' + cites.length + ', one per kind, written form and reading');
  t.ok(phrases.length >= 50 && phrases.every((r) => r.key === 'phrase:' + r.reading && !/\s/.test(r.reading) && r.delivery === 'reading'), 'the phrases the learning controls and pastimes read (listening, karuta, ring toss, shells): ' + phrases.length);
  const ha = m.references.find((r) => r.key === 'word:は|は');
  t.ok(ha && ha.spoken === 'わ' && cites.every((r) => r.speaker === 'narrator' && r.delivery === 'citation' && r.spoken), 'the topic particle は is sent as said (わ), never as spelled');
  fs.rmSync(dir, { recursive: true, force: true });

  // the voice site (tools/voice/voice_site.mjs): per-scene indexes, content-named recordings, unchanged addresses
  const { buildSite } = await import('../../tools/voice/voice_site.mjs');
  const prod = { schema: 'rbn.voice.production/1', contentHash: 'c'.repeat(64), entries: [
    { id: 'r1-a', speaker: 'pc', voice: 'A', pitch: 'low', dialect: 'standard', delivery: 'neutral', textHash: 'x', lines: [{ key: 's.a#1', scene: 's.a' }] },
    { id: 'r1-b', speaker: 'suzu', voice: null, pitch: null, dialect: 'kansai', delivery: 'smile', textHash: 'y', lines: [{ key: 's.b#2', scene: 's.b' }, { key: 's.c#3', scene: 's.c' }] },
    { id: 'r1-c', speaker: 'narrator', voice: null, pitch: null, dialect: 'standard', delivery: 'neutral', textHash: 'z', lines: [{ key: 's.b#4', scene: 's.b' }] }],
    references: [{ id: 'r1-ref-a', key: 'word:橋|はし' }] };
  const rec = (h) => ({ bytes: 1000, sha256: h.repeat(64), seconds: 1.2 });
  const one = buildSite(prod, { 'r1-a': rec('a'), 'r1-b': rec('b'), 'r1-c': rec('c'), 'r1-ref-a': rec('d') }, { voiceBuild: 'vb1', made: 'x' });
  const shard = (site, sc) => JSON.parse(site.out[site.index.scenes[sc]]);
  t.ok(!one.errors.length && one.index.schema === 'rbn.voice.site/1' && shard(one, 's.a').lines['s.a#1'][0].v === 'A' && shard(one, 's.a').lines['s.a#1'][0].p === 'l' && shard(one, 's.c').lines['s.c#3'][0].d === 'k',
    'one index per scene; each variant says its speaker, dialect, and for the player voice and pitch');
  t.ok(one.files.every((f) => /^rec\/[a-z0-9_]+\/r1-[a-z0-9-]+\.[0-9a-f]{12}\.opus$/.test(f.f)) && JSON.parse(one.out[one.index.refs])['word:橋|はし'].f.startsWith('rec/ref/'), 'recordings are named by id and audio hash; reference readings under rec/ref');
  const two = buildSite(prod, { 'r1-a': rec('a'), 'r1-b': rec('e'), 'r1-c': rec('c'), 'r1-ref-a': rec('d'), 'r1-old': rec('f') }, { voiceBuild: 'vb2', made: 'y' });
  const fa = (site, id) => site.files.find((f) => f.id === id).f;
  t.ok(fa(one, 'r1-a') === fa(two, 'r1-a') && fa(one, 'r1-c') === fa(two, 'r1-c') && fa(one, 'r1-b') !== fa(two, 'r1-b'), 'an unchanged recording keeps its address in the next build; a re-recorded one gets a new one');
  t.ok(one.index.scenes['s.a'] === two.index.scenes['s.a'] && one.index.scenes['s.b'] !== two.index.scenes['s.b'], 'a scene index changes only when one of its recordings does');
  t.ok(two.unused.length === 1 && two.index.totals.unusedResults === 1, 'a result no current recording uses is reported, not served');
  const part = buildSite(prod, { 'r1-a': rec('a') }, { voiceBuild: 'vb3' });
  t.ok(!part.errors.length && part.index.totals.missingRecordings === 2 && part.index.totals.missingReferences === 1, 'a partial batch builds a partial site; what is missing is counted (the game falls back for it)');
  t.ok(buildSite(prod, { 'r1-a': { bytes: 1000 } }, { voiceBuild: 'vb1' }).errors.some((e) => /size and sha256/.test(e)), 'a recording without its size and hash is refused');
};
