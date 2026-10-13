# VA-1 local audition kit (Windows)

This kit runs the voice audition's **local engines** on your own PC: VOICEVOX, VOICEVOX Nemo and AivisSpeech. It is
the same runner, corpus and result format the cloud environment uses, packed so nothing has to be rebuilt by hand. It
needs no account, key or payment, and it uploads nothing. Audio stays in this folder.

What you need: Windows 10 or 11, **Node.js 18 or newer** (the LTS installer from nodejs.org), and the engine you want
to audition:

| Engine | Get it from | Address it listens on |
| --- | --- | --- |
| VOICEVOX | the VOICEVOX app (voicevox.hiroshiba.jp); its engine runs while the app is open | `http://127.0.0.1:50021` |
| VOICEVOX Nemo | the Nemo engine (voicevox.hiroshiba.jp/nemo), added to the VOICEVOX app | its own port: pass `-EngineUrl` |
| AivisSpeech | the AivisSpeech app (aivis-project.com); the first start downloads about 0.9 GB of models | `http://127.0.0.1:10101` |

## Steps (VOICEVOX shown; use `voicevox_nemo` or `aivis` the same way)

1. Unzip the kit to a folder (for example `Documents\rbn-va1-kit`). Open PowerShell in that folder
   (in Explorer: File → Open Windows PowerShell, or Shift + right-click → Open PowerShell window here).
2. Start the engine app and leave it open.
3. List its voices and styles:
   `.\tools\voice\windows\run-local-audition.cmd -Config voicevox -Step voices`
4. Open `docs\future\voice\casting\voicevox.json` in a text editor. For each role, list up to three candidates:
   `{ "label": "C01", "voice": { "styleId": 3 }, "rights": { "status": "ok_private_audition", "terms": "…", "credit": "VOICEVOX:…" }, "pickedBecause": "…" }`.
   Set `rights.status` to something beginning with `ok` only after reading that voice's own terms (each VOICEVOX
   character has its own); until then its takes stay blocked.
5. The smoke check: one narrator line with and without its direction:
   `.\tools\voice\windows\run-local-audition.cmd -Config voicevox -Step smoke -By "Robin, <date>, VOICEVOX local"`
6. The casting screen: every candidate on its role's two anchor lines:
   `… -Step screen -By "…"`, then `… -Step gallery`, which opens `review.html` in your browser.
7. Listen. Write each role's choice in the casting file (`"selected": "C02"`) and move the others to `discarded`
   with a short reason. Then the full audition matrix: `… -Step matrix -By "…"`, and `-Step gallery` again.

If PowerShell refuses the script, every step is one `node` command run from the same folder:

```
node tools/voice/audition.mjs voices --config voicevox
node tools/voice/audition.mjs run --config voicevox --kind smoke --authorised "Robin, <date>, VOICEVOX local"
node tools/voice/audition.mjs run --config voicevox --kind screen --authorised "…"
node tools/voice/gallery.mjs
node tools/voice/audition.mjs run --config voicevox --kind matrix --authorised "…"
node tools/voice/audition.mjs repair --config voicevox --take N05.d.C01 --reason "<what was wrong>" --authorised "…"
```

(Nemo: add `--engine-url http://127.0.0.1:<port>`.)

## What comes out

- `voice-audition\VA1\<revision>\audio\masters\…`: the engine's own WAV files, untouched;
- `results.json`: one record per take, with the request check, the engine's answer, the measurements (which can
  flag a problem but cannot show the words are right), "words not checked" and "not listened" kept apart;
- `review.html`: the gallery. Its score sheet exports a CSV; scores belong to one attempt and its audio, so a repair
  starts unscored.

To share results, send the exported scores CSV and `results.json`. Audio only if you want it heard elsewhere: the
clips are not published anywhere.

## Qwen3-TTS (needs an NVIDIA GPU with at least 8 GB)

In a fresh Python 3.12 environment: `pip install -U qwen-tts` (and a CUDA build of PyTorch for your GPU), then

```
node tools/voice/audition.mjs export-job --config qwen --kind smoke
python tools/voice/qwen_local_job.py voice-audition/VA1/<revision>/jobs/qwen.smoke.json
node tools/voice/audition.mjs ingest --config qwen --kind smoke
```

The model `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` downloads on first use (about 4 GB). The job refuses any other model.

`KIT_MANIFEST.json` lists every file with its SHA-256 and the commit it came from.
