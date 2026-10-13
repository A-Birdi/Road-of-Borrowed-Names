// MT-2: the listening page for every Ensemble recording (development tool; nothing here ships).
//
//   node tools/music/ensemble/listen_all.mjs        (RB_PAGE=<built page with the catalog>)
//
// Writes docs/music/ensemble/listen_all.html: every ready song with its recording's own files (from
// assets/music/ensemble/, as the game fetches them; no new copies), what it is made of and how it measured, and, for a
// few songs chosen to cover the new voices, a 20 s comparison from the cue's start, Original then Ensemble, rendered
// offline by the game's own code through its own graph at default volumes (as capture.mjs did for the pilots) and
// encoded to Ogg Opus 96 kbit/s in docs/music/ensemble/listen/mt2/. Opened from the checkout, it needs no server.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { serve, launch, page, root } from '../../../tests/e2e/lib.mjs';
import { PAGE_LIB } from './page_lib.mjs';
import { load } from '../../../tests/lib/load.mjs';

// the comparison songs: the main menu (Robin's report), one of each new kind of sound, the one-shots
const COMPARE = ['title', 'road', 'mill', 'prologue', 'victory', 'cinder', 'sg_lighthouse', 'inn', 'ending', 'boss_hush'];
const OUT = path.join(root, 'docs/music/ensemble/listen/mt2');
fs.mkdirSync(OUT, { recursive: true });
const RB = load(['core', 'audio'], { __RB_TEST__: true });
const songs = RB.audio.songList();
const man = JSON.parse(fs.readFileSync(path.join(root, 'assets/music/ensemble/manifest.json'), 'utf8'));
const qa = (id) => { try { return JSON.parse(fs.readFileSync(path.join(root, 'docs/music/ensemble/qa', id + '.json'), 'utf8')); } catch (e) { return null; } };

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
const ready = await p.evaluate(() => Object.keys((RB.audio.ensembleCatalog || {}).songs || {}));
if (!ready.length) throw new Error('the page has no Ensemble catalog: build it after the manifest is ready');
const clips = {};
for (const id of COMPARE.filter((x) => ready.includes(x))) {
  clips[id] = [];
  for (const [key, mix] of [['original', 1], ['ensemble', 0]]) {
    const r = await p.evaluate(async ([id, mix]) => {
      const e = RB.audio.ensembleCatalog.songs[id], f = e.formats[0];
      for (const u of [f.first.url, f.loop && f.loop.url].filter(Boolean)) if (!window.__mt.bufs[u]) await window.__mtDecode(u, [48000]);
      const bufs = { first: window.__mt.bufs[f.first.url], loop: f.loop ? window.__mt.bufs[f.loop.url] : null };
      const s = Math.min(20, e.durationSec + 1);
      const out = await RB.audio.renderEnsembleOffline(id, bufs, s + 0.05, { entry: e, fmt: f, original: true, mix, from: 0 });
      const enc = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let t = ''; for (let i = 0; i < u.length; i += 32768) t += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(t); };
      return { L: enc(out.getChannelData(0)), R: enc(out.getChannelData(1)), sr: out.sampleRate, s };
    }, [id, mix]);
    const f32 = (b64) => { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
    const tmp = path.join(OUT, '.tmp.wav'), name = `${id}.${key}.opus`;
    wav(tmp, f32(r.L), f32(r.R), r.sr);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-ss', '0.05', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-c:a', 'libopus', '-b:a', '96k', path.join(OUT, name)]);
    fs.unlinkSync(tmp);
    clips[id].push({ key, file: 'listen/mt2/' + name, seconds: r.s });
    console.log(id, key, fs.statSync(path.join(OUT, name)).size, 'bytes');
  }
}
await browser.close();
srv.close();

// ---- the page
const esc = (x) => String(x).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);
const rel = (u) => '../../../' + u.replace(/^\.\//, '');
const PILOTS = ['snowbell', 'battle_keepers'];
const tracks = man.tracks.filter((t) => t.releaseStatus === 'ready');
const notReady = songs.filter((s) => !tracks.some((t) => t.songId === s.id));
let html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ensemble recordings</title>
<style>
:root { --bg: #f7f3ea; --fg: #2b2620; --muted: #6d6458; --line: #d9cfbd; --accent: #7a3b2e; --chip: #ebe3d3; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --bg: #1d1a16; --fg: #ece5d8; --muted: #a99e8d; --line: #3d362d; --accent: #e0a08f; --chip: #2a251f; color-scheme: dark; } }
body { background: var(--bg); color: var(--fg); font: 16px/1.55 Georgia, 'Times New Roman', serif; margin: 0; padding: 24px 16px 48px; }
main { max-width: 820px; margin: 0 auto; }
h1 { font-size: 1.6rem; margin: 0 0 .3rem; } h2 { font-size: 1.2rem; margin: 2rem 0 .4rem; border-bottom: 1px solid var(--line); padding-bottom: .2rem; }
.note { border-left: 3px solid var(--accent); padding: .4rem .8rem; background: color-mix(in srgb, var(--accent) 8%, transparent); }
.song { display: grid; gap: .35rem; padding: .8rem 0; border-bottom: 1px dotted var(--line); }
.song .t { font-weight: bold; } .muted { color: var(--muted); font-size: .9rem; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: .5rem; }
.pair > div { display: grid; gap: .2rem; min-width: 0; }
.chip { display: inline-block; background: var(--chip); border-radius: 3px; padding: 0 .35rem; margin: 0 .2rem .2rem 0; font-size: .85rem; }
audio { width: 100%; }
</style></head><body><main>
<h1>Ensemble recordings</h1>
<p class="note"><b>Not yet listened to by anyone.</b> MT-2 (C-92) recorded every song the game plays in the Ensemble treatment. The two pilots
(Snowbell, the Keepers' Road battle) were heard by Robin on 2026-10-12 (<a href="listen.html">their captures</a>). The others were
made the same way, with each part's balance set by measurement against the Original and voices chosen by the lead for the
instruments the pilots did not use; nobody has heard them yet. What each is made of is listed under it.</p>
<p class="muted">Each song's players are the recording's own files, as the game fetches them (Ogg Opus): the first pass from the cue's
start to its join, then the steady cycle that repeats (a cue that does not loop is one file). They play at the level they were
mastered at; in the game a measured trim matches the Original's loudness (shown). The comparisons below were rendered by the
game's own code through its own audio graph. Measurements: <code>docs/music/ensemble/qa/&lt;song&gt;.json</code>.</p>`;
html += '\n<h2>Original and Ensemble side by side (20 s from the cue\'s start)</h2>';
for (const id of Object.keys(clips)) {
  const s = songs.find((x) => x.id === id);
  html += `\n<div class="song"><span class="t">${esc(s ? s.title : id)}</span><div class="pair">` + clips[id].map((c) => `<div><span class="muted">${c.key === 'original' ? 'Original' : 'Ensemble'}</span><audio controls preload="none" src="${esc(c.file)}"></audio></div>`).join('') + '</div></div>';
}
html += '\n<h2>Every recording</h2>';
for (const s of songs) {
  const t = tracks.find((x) => x.songId === s.id);
  if (!t) continue;
  const q = qa(s.id), tr = q && q.render && q.render.treatment, opus = (k) => (t.assets[k] || []).find((a) => /\.opus$/.test(a.relativeUrl));
  const first = opus('firstPass'), loop = opus('steadyLoop');
  const chips = tr ? Object.entries(tr.instruments || {}).map(([g, e]) => `<span class="chip">${esc(g)} → ${esc(e)}</span>`).join('') + Object.entries(tr.percussion || {}).map(([g, e]) => `<span class="chip">stroke ${esc(g)} → ${esc(e)}</span>`).join('') : '';
  const meta = [PILOTS.includes(s.id) ? 'pilot (SC-1 balance; heard by Robin)' : 'balance measured against the Original', tr && tr.room ? 'room ' + tr.room.seconds + ' s' : null, tr && tr.echo ? 'the game\'s echo' : null, 'trim ' + (t.mix.gainDb >= 0 ? '+' : '') + t.mix.gainDb.toFixed(2) + ' dB'].filter(Boolean).join(' · ');
  html += `\n<div class="song"><span class="t">${esc(s.title)}</span><span class="muted">${esc(s.id)} · ${esc(meta)}</span><div>${chips}</div><div class="pair">`
    + (first ? `<div><span class="muted">${loop ? 'First pass, to ' + ((first.playableEndFrame - first.playableStartFrame) / first.sampleRate).toFixed(1) + ' s' : 'The whole cue'}</span><audio controls preload="none" src="${esc(rel(first.relativeUrl))}"></audio></div>` : '')
    + (loop ? `<div><span class="muted">Steady cycle, ${((loop.playableEndFrame - loop.playableStartFrame) / loop.sampleRate).toFixed(1)} s</span><audio controls preload="none" src="${esc(rel(loop.relativeUrl))}"></audio></div>` : '')
    + '</div></div>';
}
if (notReady.length) html += '\n<h2>Playing their Original</h2>\n<p class="muted">No ready recording: ' + notReady.map((s) => esc(s.title) + ' (' + esc(s.id) + ')').join(', ') + '. Their reports say why.</p>';
html += '\n</main></body></html>\n';
fs.writeFileSync(path.join(root, 'docs/music/ensemble/listen_all.html'), html);
fs.writeFileSync(path.join(root, 'docs/music/ensemble/listen_all.json'), JSON.stringify({ generatedBy: 'tools/music/ensemble/listen_all.mjs', renderedIn: 'Chromium (Playwright headless), offline, through the game\'s own audio graph at default volumes', listenedTo: null, comparisons: clips }, null, 1) + '\n');
if (errors.length) console.log('page errors:', errors.slice(0, 3));
console.log('songs on the page', tracks.length, 'comparisons', Object.keys(clips).length);
