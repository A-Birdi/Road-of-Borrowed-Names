// VA-1: the first-review packer (tools/voice/pack_review.mjs) splits a review folder into ordinary ZIPs each under
// 30,000,000 bytes, every file in exactly one part, START_REVIEW.html and the parts list in part 1, nothing that looks
// like model weights or installers; and the gallery writes START_REVIEW.html and labels an agent's provisional lead.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { root } from '../lib/load.mjs';

function unzip(buf) {
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buf.readUInt16LE(end + 10), cdOff = buf.readUInt32LE(end + 16);
  const out = [];
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    const crc = buf.readUInt32LE(p + 16), size = buf.readUInt32LE(p + 24), nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), loc = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    const data = buf.subarray(loc + 30 + buf.readUInt16LE(loc + 26) + buf.readUInt16LE(loc + 28), loc + 30 + buf.readUInt16LE(loc + 26) + buf.readUInt16LE(loc + 28) + size);
    out.push({ name, data, crcOk: !zlib.crc32 || (zlib.crc32(data) >>> 0) === crc });
    p += 46 + nlen + xlen + clen;
  }
  return out;
}

export default async (t) => {
  const { packReview } = await import(pathToFileURL(path.join(root, 'tools/voice/pack_review.mjs')).href);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-va1-rev-'));
  try {
    const dir = path.join(tmp, 'review');
    const put = (f, data) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), data); };
    put('START_REVIEW.html', '<!doctype html><title>x</title>');
    put('review.html', '<!doctype html><title>x</title>');
    put('results.json', '{"records":[]}');
    put('requests/voicevox/N01/N01.d.C01.json', '{}');
    put('jobs/qwen.smoke.json', '{}');
    put('models/voice.onnx', 'weights');
    for (let i = 0; i < 7; i++) put('audio/masters/voicevox/N0' + i + '/N0' + i + '.d.C01.r1.wav', crypto.randomBytes(9 * 1000 * 1000));
    const extra = path.join(tmp, 'speakers_voicevox.json');
    fs.writeFileSync(extra, '{"speakers":[]}');
    const parts = packReview(dir, path.join(tmp, 'zips'), [extra]);
    t.ok(parts.length >= 3 && parts.every((p) => p.bytes < 30000000), parts.length + ' parts, each under 30,000,000 bytes (' + parts.map((p) => p.bytes).join(', ') + ')');
    const all = parts.map((p) => unzip(fs.readFileSync(p.file)));
    t.ok(all.every((files) => files.every((f) => f.crcOk)), 'every part reads back with correct CRCs');
    const names = all.flat().map((f) => f.name);
    t.ok(names.length === new Set(names).size, 'no file in two parts');
    t.ok(['START_REVIEW.html', 'review.html', 'results.json', 'requests/voicevox/N01/N01.d.C01.json', 'extras/speakers_voicevox.json', 'REVIEW_PARTS.txt'].every((n) => all[0].some((f) => f.name === n)), 'part 1 holds the entry page, gallery, records, requests, extras and the parts list');
    t.ok(names.filter((n) => n.startsWith('audio/')).length === 7, 'every audio file is packed once');
    t.ok(!names.some((n) => /onnx|jobs\//.test(n)), 'no model weights or job files');
    const listing = all[0].find((f) => f.name === 'REVIEW_PARTS.txt').data.toString('utf8');
    t.ok(/Extract every part into ONE folder/.test(listing) && all.flat().filter((f) => f.name !== 'REVIEW_PARTS.txt').every((f) => listing.includes(crypto.createHash('sha256').update(f.data).digest('hex'))), 'REVIEW_PARTS.txt says how to open it and lists every file\'s SHA-256');

    // the gallery: START_REVIEW.html and the provisional-lead label
    const { writeGallery } = await import(pathToFileURL(path.join(root, 'tools/voice/gallery.mjs')).href);
    const castDir = path.join(tmp, 'cast');
    fs.mkdirSync(castDir);
    const cast = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/casting/voicevox.json'), 'utf8'));
    cast.roles.narrator_female.candidates = [{ label: 'C01', voice: { styleId: 1 }, rights: { status: 'ok_test' } }];
    cast.roles.narrator_female.selected = 'C01';
    cast.roles.narrator_female.selectionStatus = 'agent_provisional';
    fs.writeFileSync(path.join(castDir, 'voicevox.json'), JSON.stringify(cast));
    const gdir = path.join(tmp, 'g');
    fs.mkdirSync(gdir);
    fs.writeFileSync(path.join(gdir, 'results.json'), JSON.stringify({ records: [] }));
    const g = writeGallery({ out: gdir, castDir });
    const start = fs.readFileSync(path.join(gdir, 'START_REVIEW.html'), 'utf8');
    t.ok(start === fs.readFileSync(g.file, 'utf8') && /"selectionStatus":"agent_provisional"/.test(start) && /provisional lead, not Robin/.test(start), 'the gallery writes START_REVIEW.html and carries the provisional-lead label');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
};
