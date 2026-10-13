// VA-1: the Windows local-engine kit (tools/voice/pack_local_kit.mjs) is self-contained. The zip is read back with an
// independent reader (every CRC and manifest hash checked), unpacked into an empty folder outside the repository, and
// the kit's own runner plans, runs a smoke check against a mock VOICEVOX engine and builds its gallery there, so
// nothing in it reaches back into the repository. It carries no hosted authorization, ledger or credential.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import { spawn, spawnSync } from 'node:child_process';
import { root } from '../lib/load.mjs';

function unzip(buf) {
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buf.readUInt16LE(end + 10), cdOff = buf.readUInt32LE(end + 16);
  const out = [];
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16), size = buf.readUInt32LE(p + 24), nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), loc = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    const lnlen = buf.readUInt16LE(loc + 26), lxlen = buf.readUInt16LE(loc + 28);
    const data = buf.subarray(loc + 30 + lnlen + lxlen, loc + 30 + lnlen + lxlen + size);
    out.push({ name, method, crcOk: (zlib.crc32 ? zlib.crc32(data) >>> 0 : crc) === crc, data });
    p += 46 + nlen + xlen + clen;
  }
  return out;
}

export default async (t) => {
  const { packKit } = await import(path.join(root, 'tools/voice/pack_local_kit.mjs'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-va1-kit-'));
  try {
    const r = packKit(path.join(tmp, 'kit.zip'));
    const files = unzip(fs.readFileSync(r.file));
    t.ok(files.length === r.files && files.every((f) => f.method === 0 && f.crcOk), 'the zip reads back: ' + files.length + ' stored files, every CRC right');
    const manifest = JSON.parse(files.find((f) => f.name === 'KIT_MANIFEST.json').data.toString('utf8'));
    const crypto = await import('node:crypto');
    t.ok(manifest.files.every((m) => { const f = files.find((x) => x.name === m.path); return f && crypto.createHash('sha256').update(f.data).digest('hex') === m.sha256; }), 'every file matches its manifest hash');
    t.ok(!files.some((f) => /authorizations\/|usage\/.*\.jsonl|\.env|gemini\.json|elevenlabs\.json|azure\.json/.test(f.name)) && !files.some((f) => /GEMINI_API_KEY=|xi-api-key: [A-Za-z0-9]{8}/.test(f.data.toString('utf8'))), 'no hosted authorization, ledger, hosted casting or credential in the kit');
    const kit = path.join(tmp, 'unpacked');
    for (const f of files) { const dest = path.join(kit, f.name); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, f.data); }
    const plan = spawnSync(process.execPath, ['tools/voice/audition.mjs', 'plan', '--config', 'voicevox', '--kind', 'smoke'], { cwd: kit, encoding: 'utf8' });
    t.ok(plan.status === 0 && JSON.parse(plan.stdout).cells === 2, 'the unpacked kit plans on its own: ' + (plan.stderr || '').slice(0, 120));
    // fill one candidate as Robin would, then a smoke check against a mock engine
    const castF = path.join(kit, 'docs/future/voice/casting/voicevox.json');
    const cast = JSON.parse(fs.readFileSync(castF, 'utf8'));
    cast.roles.narrator_female.candidates = [{ label: 'C01', voice: { styleId: 1 }, rights: { status: 'ok_test' }, pickedBecause: 'test' }];
    fs.writeFileSync(castF, JSON.stringify(cast));
    const wav = Buffer.alloc(44 + 48000); wav.write('RIFF', 0); wav.writeUInt32LE(36 + 48000, 4); wav.write('WAVE', 8); wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(24000, 24); wav.writeUInt32LE(48000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(48000, 40);
    for (let i = 0; i < 24000; i++) wav.writeInt16LE(Math.round(6000 * Math.sin(i / 10)), 44 + i * 2);
    const srv = http.createServer((req, res) => { req.on('data', () => {}); req.on('end', () => { const u = new URL(req.url, 'http://x'); if (u.pathname === '/version') return res.end('"m"'); if (u.pathname === '/audio_query') return res.end('{"kana":""}'); if (u.pathname === '/synthesis') return res.end(wav); res.statusCode = 404; res.end(); }); });
    await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
    const run = await new Promise((resolve) => { const p = spawn(process.execPath, ['tools/voice/audition.mjs', 'run', '--config', 'voicevox', '--kind', 'smoke', '--authorised', 'kit test', '--engine-url', 'http://127.0.0.1:' + srv.address().port], { cwd: kit }); let o = '', e = ''; p.stdout.on('data', (d) => (o += d)); p.stderr.on('data', (d) => (e += d)); p.on('close', (code) => resolve({ code, o, e })); });
    srv.close();
    t.ok(run.code === 0, 'the kit runs a smoke check against a local engine: ' + (run.e || '').slice(0, 160));
    const gal = spawnSync(process.execPath, ['tools/voice/gallery.mjs'], { cwd: kit, encoding: 'utf8' });
    const out = gal.status === 0 ? JSON.parse(gal.stdout) : {};
    t.ok(out.withAudio === 2 && fs.existsSync(path.join(kit, out.file || 'x')), 'the kit builds its gallery with the two smoke takes, inside the kit folder');
    t.ok(!fs.existsSync(path.join(kit, 'docs/future/voice/usage')) || fs.readdirSync(path.join(kit, 'docs/future/voice/usage')).every((f) => !f.endsWith('.jsonl')), 'a local run writes no usage ledger (nothing billable)');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
};
