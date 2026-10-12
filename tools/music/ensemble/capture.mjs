// MT-1: listening captures for Robin, rendered through the game's own graph in Chromium (development tool).
//
//   node tools/music/ensemble/capture.mjs          (RB_PAGE=<built page with the catalog>)
//
// For each pilot, short excerpts as the game would play them (default volumes, no ducking), each rendered offline by
// the game's own code (RB.audio.renderEnsembleOffline: the Original player warm, the recording through the same
// music bus and master chain, the handover gains as live) and encoded to Ogg Opus 128 kbit/s in
// docs/music/ensemble/listen/, with docs/music/ensemble/listen.json describing them. The page
// docs/music/ensemble/listen.html plays them. Robin listened to them on 2026-10-12; the page says so.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { serve, launch, page, root } from '../../../tests/e2e/lib.mjs';
import { PAGE_LIB } from './page_lib.mjs';

const OUT = path.join(root, 'docs/music/ensemble/listen');
fs.mkdirSync(OUT, { recursive: true });

function wav(file, L, R, sr) {
  const n = L.length, b = Buffer.alloc(44 + n * 8);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 8, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(3, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 8, 28); b.writeUInt16LE(8, 32); b.writeUInt16LE(32, 34);
  b.write('data', 36); b.writeUInt32LE(n * 8, 40);
  for (let i = 0; i < n; i++) { b.writeFloatLE(L[i], 44 + i * 8); b.writeFloatLE(R[i], 48 + i * 8); }
  fs.writeFileSync(file, b);
}

const { srv, url } = await serve();
const browser = await launch();
const { p, errors } = await page(browser, url);
await p.addScriptTag({ content: PAGE_LIB });
const songs = await p.evaluate(() => Object.keys((RB.audio.ensembleCatalog || {}).songs || {}));
if (!songs.length) throw new Error('the page has no Ensemble catalog: build it after the manifest is ready');
const list = [];
for (const id of songs) {
  const e = await p.evaluate((id) => { const e = RB.audio.ensembleCatalog.songs[id]; return { D: e.durationSec, L: e.loopStartSec, J: (e.formats[0].first.end - e.formats[0].first.start) / e.formats[0].first.rate }; }, id);
  const P = e.D - e.L;
  const clips = [
    { key: 'intro_original', title: 'The introduction, Original', from: 0, seconds: 24, mix: 1 },
    { key: 'intro_ensemble', title: 'The introduction, Ensemble', from: 0, seconds: 24, mix: 0 },
    { key: 'switch_mid_phrase', title: 'Original → Ensemble → Original, mid-phrase (200 ms crossfades at 8.0 s and 16.0 s)', from: 30, seconds: 24, mix: 1, handovers: [{ at: 8.05, to: 'ensemble' }, { at: 16.05, to: 'original' }] },
    { key: 'first_join', title: 'Ensemble across the join from the first pass to the steady cycle (at ' + e.J.toFixed(2) + ' s of the cue, 4 s in)', from: Math.max(0, e.J - 4), seconds: 12, mix: 0 },
    { key: 'first_repeat', title: 'Ensemble across the first repeat (the end of the first pass into the loop, 8 s in)', from: e.D - 8, seconds: 16, mix: 0 },
    { key: 'later_repeats', title: 'Ensemble across the third repeat (8 s in)', from: e.D + 2 * P - 8, seconds: 16, mix: 0 },
    { key: 'repeat_original', title: 'The same repeat in the Original, for comparison', from: e.D + 2 * P - 8, seconds: 16, mix: 1 },
  ];
  for (const c of clips) {
    // (a pre-roll, cut afterwards, so notes already sounding at the excerpt's start are heard ringing, as in play)
    const pre = Math.min(6, c.from);
    const rc = Object.assign({}, c, { from: c.from - pre, seconds: c.seconds + pre, handovers: (c.handovers || []).map((h) => ({ at: h.at + pre, to: h.to })) });
    const r = await p.evaluate(async ([id, c]) => {
      const e = RB.audio.ensembleCatalog.songs[id], f = e.formats[0];
      for (const u of [f.first.url, f.loop.url]) if (!window.__mt.bufs[u]) await window.__mtDecode(u, [48000]);
      const bufs = { first: window.__mt.bufs[f.first.url], loop: window.__mt.bufs[f.loop.url] };
      const out = await RB.audio.renderEnsembleOffline(id, bufs, c.seconds + 0.05, { entry: e, fmt: f, original: true, mix: c.mix, from: c.from, handovers: c.handovers || [] });
      const enc = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); };
      return { L: enc(out.getChannelData(0)), R: enc(out.getChannelData(1)), sr: out.sampleRate };
    }, [id, rc]);
    const f32 = (b64) => { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
    const tmp = path.join(OUT, '.tmp.wav'), name = `${id}.${c.key}.opus`;
    wav(tmp, f32(r.L), f32(r.R), r.sr);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-ss', String(0.05 + pre), '-fflags', '+bitexact', '-flags:a', '+bitexact', '-c:a', 'libopus', '-b:a', '128k', path.join(OUT, name)]);
    fs.unlinkSync(tmp);
    // a clip identical, byte for byte, to one already kept is not kept twice: it is noted against that one
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(OUT, name))).digest('hex');
    const twin = list.find((x) => x.sha256 === digest);
    if (twin) { fs.unlinkSync(path.join(OUT, name)); (twin.identicalTo = twin.identicalTo || []).push(c.title); console.log(id, c.key, 'identical to', twin.file); continue; }
    list.push({ song: id, file: 'listen/' + name, title: c.title, cueFrom: c.from, seconds: c.seconds, performance: c.handovers ? 'both' : c.mix ? 'original' : 'ensemble', sha256: digest });
    console.log(id, c.key, fs.statSync(path.join(OUT, name)).size, 'bytes');
  }
}
fs.writeFileSync(path.join(root, 'docs/music/ensemble/listen.json'), JSON.stringify({ generatedBy: 'tools/music/ensemble/capture.mjs', renderedIn: 'Chromium (Playwright headless), offline, through the game\'s own audio graph at default volumes', listenedTo: 'Robin, 2026-10-12, on the captures page: "It sounds great, nice job"', clips: list }, null, 1) + '\n');
// the page that plays them (static, no script needed; opened from the checkout or beside the hosted docs)
const esc = (x) => String(x).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);
const qa = (id) => { try { return JSON.parse(fs.readFileSync(path.join(root, 'docs/music/ensemble/qa', id + '.json'), 'utf8')); } catch (e) { return null; } };
const NAMES = { snowbell: 'Snowbell (the Snowbell area)', battle_keepers: "Inkweaving — Told Three Ways (the Keepers' Road battle)" };
let html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ensemble pilot captures</title>
<style>
:root { --bg: #f7f3ea; --fg: #2b2620; --muted: #6d6458; --line: #d9cfbd; --accent: #7a3b2e; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --bg: #1d1a16; --fg: #ece5d8; --muted: #a99e8d; --line: #3d362d; --accent: #e0a08f; color-scheme: dark; } }
body { background: var(--bg); color: var(--fg); font: 16px/1.55 Georgia, 'Times New Roman', serif; margin: 0; padding: 24px 16px 48px; }
main { max-width: 760px; margin: 0 auto; }
h1 { font-size: 1.6rem; margin: 0 0 .3rem; } h2 { font-size: 1.2rem; margin: 2rem 0 .4rem; border-bottom: 1px solid var(--line); padding-bottom: .2rem; }
.note { border-left: 3px solid var(--accent); padding: .4rem .8rem; color: var(--fg); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.clip { display: grid; gap: .3rem; padding: .7rem 0; border-bottom: 1px dotted var(--line); }
.clip .t { font-weight: bold; } .muted { color: var(--muted); font-size: .9rem; }
audio { width: 100%; }
</style></head><body><main>
<h1>Ensemble pilot captures</h1>
<p class="note"><b>Listened to by Robin, 2026-10-12: “It sounds great, nice job.”</b> These excerpts were rendered by the game's own code, offline in Chromium, through its own
audio graph at the default volumes. That listening covers these excerpts; hearing the recordings in the game itself, on Robin's own device, is still to come.</p>
<p class="muted">The measurements behind them (lengths, placement, levels, onsets, seams) are in qa/&lt;song&gt;.json and VALIDATION.md (MT-1).
Each excerpt starting mid-cue was rendered with a few seconds of pre-roll, so notes already sounding are heard ringing as in play.
Not here: a change of song while Ensemble plays (the offline renderer plays one cue at a time); that is heard only in the game.</p>`;
for (const id of songs) {
  const q = qa(id);
  html += `\n<h2>${esc(NAMES[id] || id)}</h2>`;
  if (q && q.calibration) html += `\n<p class="muted">Original ${q.calibration.originalLufs.toFixed(1)} LUFS over its first pass; Ensemble trimmed ${q.calibration.gainDb >= 0 ? '+' : ''}${q.calibration.gainDb.toFixed(2)} dB to ${q.calibration.ensembleLufs.toFixed(1)} LUFS through the same graph.</p>`;
  for (const c of list.filter((x) => x.song === id)) html += `\n<div class="clip"><span class="t">${esc(c.title)}</span><span class="muted">${esc(c.performance === 'both' ? 'Both performances' : c.performance === 'original' ? 'Original' : 'Ensemble')} · from ${c.cueFrom.toFixed(2)} s of the cue · ${c.seconds} s</span><audio controls preload="none" src="${esc(c.file)}"></audio>${c.identicalTo ? `<span class="muted">Rendered the same way, ${esc(c.identicalTo.join('; ').toLowerCase())} came out byte for byte the same as this excerpt: the recording repeats exactly, on the score's clock.</span>` : ''}</div>`;
}
html += '\n</main></body></html>\n';
fs.writeFileSync(path.join(root, 'docs/music/ensemble/listen.html'), html);
if (errors.length) console.log('page errors:', errors.slice(0, 3));
await browser.close();
srv.close();
