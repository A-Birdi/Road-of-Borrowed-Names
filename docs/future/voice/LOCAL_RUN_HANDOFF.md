# VA-1 · Handoff for the local run on Robin's Windows PC

**For a Claude session running on Robin's own computer** (the Claude Desktop app's local session, or `claude
remote-control` started in a folder on that PC). The cloud session that wrote this could not reach the PC: it runs
in a cloud container with no connected device. It reported "BLOCKED: no execution access to Robin's PC" and
installed nothing anywhere.

**Your authority is Robin's directive**, kept verbatim beside this file as
`directives/VA1_LOCAL_UNATTENDED_2026-10-13.md` (in the kit: `docs/future/voice/directives/`). Read it first; it
governs over this page. In short:

- **Allowed:** free downloads from official sources; portable or per-user installs; provisional casting; local
  synthesis of the audition (smoke, casting screen, then the 97-take matrix with a provisional lead per role); one
  documented repair per defective directed case; a review package.
- **Not allowed:**
  - hosted or paid synthesis of any kind;
  - accounts, keys or purchases;
  - cloning;
  - weakening security settings or execution policy;
  - restarts, services or startup entries, or exposing ports beyond loopback;
  - touching the game, its saves or other projects;
  - final casting;
  - whole-game generation.
- **Limits:** at most 40 GiB of task-owned disk, keeping 20 GiB or 10 % of the drive free (whichever is greater);
  one heavy engine at a time; idle-sleep inhibition only for the run's own process, released at the end.
- **Finish line:** real recordings and a working `START_REVIEW.html`, packaged for Robin's first listening review.
  Then stop.

## What already exists (the kit: `rbn-va1-local-kit.zip`)

Unzip it into a new `_va1_audition\kit` folder inside the folder Robin granted. Check `KIT_MANIFEST.json`: every
file's SHA-256 and `builtFrom`, the repository commit (branch `claude/stoic-sagan-n3jvgk` of
A-Birdi/Road-of-Borrowed-Names). Verify it with:

```
node -e "const fs=require('fs'),c=require('crypto');const m=JSON.parse(fs.readFileSync('KIT_MANIFEST.json'));let bad=m.files.filter(f=>c.createHash('sha256').update(fs.readFileSync(f.path)).digest('hex')!==f.sha256);console.log(bad.length?'MISMATCH '+bad.map(f=>f.path):'manifest ok, '+m.files.length+' files, from '+m.builtFrom)"
```

| File | What it is |
| --- | --- |
| `docs/future/voice/corpus/audition_corpus.json` | The frozen corpus: 83 directed cases and 14 neutral controls, with readings, pronunciation overrides, spoiler levels and directions. Do not change it. |
| `tools/voice/audition.mjs` | The runner: `voices [--save]`, `plan`, `run --kind smoke|screen|matrix`, `repair`, `status`, `export-job` / `ingest` (Qwen). It resumes by request identity: a take is reused only if its voice, style, parameters, engine and model all match. |
| `tools/voice/providers.mjs` | Request builders. VOICEVOX and Nemo use `audio_query` → `synthesis` with style, speed and intonation, and the user dictionary for readings. AivisSpeech is the same API, but its `intonationScale` is emotional strength and readings go through `kana`. |
| `tools/voice/audio_check.mjs` | Measurements only. Its outcomes are `no_anomaly_found`, `anomaly_flagged` or `unusable`, never "passed". |
| `tools/voice/gallery.mjs` | Writes `review.html` and `START_REVIEW.html` beside the audio. |
| `tools/voice/pack_review.mjs` | Packs the review into `review-part-N.zip` files, each under 30 MB. |
| `tools/voice/qwen_local_job.py` | The Qwen3-TTS 1.7B CustomVoice job (CUDA). |
| `docs/future/voice/casting/{voicevox,voicevox_nemo,aivis,qwen}.json` | Casting files. Each of the 19 roles has a `target` (who the voice is for), `candidates`, `selected` and `discarded`. |
| `README-FIRST.md` | Plain commands; the PowerShell wrapper is optional. |

Run everything as plain `node …` commands from the kit folder; no execution-policy change is needed.

## The run, in order

1. **Where am I.** Confirm a Windows host (not WSL, not a cloud VM): `node -p "process.platform + ' ' + os.release()"` or `ver`. Write a harmless file in `_va1_audition`.
2. **Preflight**, recorded in `_va1_audition\RUN_SUMMARY.md`:
   - Node: `where node` and `node --version`. 18 or newer is fine. Otherwise take the official LTS **zip** from
     nodejs.org/dist, check it against that release's `SHASUMS256.txt`, unzip it into `_va1_audition\node` and call
     it by full path.
   - Disk and RAM (PowerShell `Get-PSDrive`, `Get-CimInstance Win32_OperatingSystem`); GPU and VRAM (`nvidia-smi`
     if present).
   - Whether ports 50021, 50121 and 10101 are free (`netstat -ano`): never stop another program's port; choose a
     free one.
   - Python only if Qwen will be attempted.
3. **Keep the PC awake** for the run only: a PowerShell process calling `SetThreadExecutionState(ES_CONTINUOUS |
   ES_SYSTEM_REQUIRED)` (no `ES_DISPLAY_REQUIRED`, so the screen still sleeps and locks) and waiting. Stop that
   process at the end or on failure.
4. **For each engine, in turn**, one at a time, each its own configuration:

   | Engine | Where from (official) | Notes |
   | --- | --- | --- |
   | VOICEVOX (`voicevox`) | github.com/VOICEVOX/voicevox_engine/releases: the Windows CPU (or DirectML) engine. Its `.7z.001`/`.002` parts need 7-Zip; if 7-Zip isn't already installed, the VOICEVOX app from voicevox.hiroshiba.jp (per-user) includes the engine. | Start `run.exe --host 127.0.0.1 --port <free>`. Ready when `GET /version` answers. Terms: voicevox.hiroshiba.jp/term and each character's own terms (`/speaker_info` policy). Credit form: `VOICEVOX:<character>`. |
   | VOICEVOX Nemo (`voicevox_nemo`) | voicevox.hiroshiba.jp/nemo | A separate engine with its own port and IDs: discover them; never reuse VOICEVOX's style IDs. |
   | AivisSpeech (`aivis`) | github.com/Aivis-Project/AivisSpeech-Engine/releases (the Windows engine), or the app from aivis-project.com | It downloads a default model (≈250 MB) and a BERT model (≈650 MB) on first start; it needs ≥ 1.5 GB free RAM. Add only a few role-relevant AIVMX models from hub.aivis-project.com whose licence permits this use (record each licence). Port 10101 by default; pass `--host 127.0.0.1`. |
   | Qwen3-TTS (`qwen`) | github.com/QwenLM/Qwen3-TTS; PyPI `qwen-tts==0.1.1`; PyTorch's official CUDA wheels; the model `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` from Hugging Face | Only with an NVIDIA GPU with ≥ 8 GB free VRAM and room on disk (≈ 4 GB weights + ≈ 3–5 GB PyTorch). Use an isolated Python 3.12 venv. It must be this model only (the job refuses others). Its nine stock speakers include one Japanese-native voice (Ono_Anna), so reuse is inevitable: disclose it. Run `export-job` → `python tools/voice/qwen_local_job.py …` → `ingest`. |

   For each engine:
   - Record the version, source URL, file hashes and any publisher hash.
   - Save its inventory with its terms, without its pictures or sample audio:
     `node tools/voice/audition.mjs voices --config <id> --engine-url http://127.0.0.1:<port> --save voice-audition/speakers_<id>.json`.
     Set `--engine-url` on every command for a non-default port.
5. **Cast provisionally** by writing `docs/future/voice/casting/<id>.json` yourself:
   - **Candidates:** up to three per role:
     `{ label: "C01", voice: { styleId: <id>, styleFor: {<delivery label>: <a style of the SAME speaker>} }, rights: {…}, pickedBecause: "…" }`.
   - **`pickedBecause`:** say what the choice rests on, from the role's `target`, its corpus lines and the voice's
     metadata. Say plainly that it is metadata-based and unheard unless you measured something.
   - **`rights`:**
     `{ status: "ok_private_audition", privateAudition: "<what the terms allow>", redistribution: "<allowed / conditions / unclear>", credit: "<required credit>", source: "<policy text and URL read>" }`.
     A status beginning `ok` is only for a voice whose terms allow this private audition. An unclear licence blocks
     that candidate, not the run.
   - **The lead:** `selected: "C0x"`, `selectionStatus: "agent_provisional"`, and a `selectionNote` saying it is an
     operational provisional choice, not Robin's.
   - **The roles must stay distinct:**
     - a female adult storyteller for the narrator;
     - Suzu: a performer, warm and lively but not a celebrity;
     - Nao: dry humour, they/them;
     - Mio: capable care;
     - Ren: thoughtful, they/them;
     - player Voice A lighter and brighter, Voice B lower and warmer;
     - the NPC profiles by age, tone and work.

     Do not give everyone the same high-energy anime style, and do not choose pitch from pronouns. Character engines
     lean bright, so prefer each speaker's calmer or normal styles unless the delivery calls for more.
   - **Never invent accent positions:** a reading override that the engine reads differently stays flagged.
6. **Generate**, per engine, with the engine running:
   ```
   node tools/voice/audition.mjs run --config <id> --kind smoke  --authorised "Robin's directive 2026-10-13 (local unattended)" --engine-url http://127.0.0.1:<port>
   node tools/voice/audition.mjs run --config <id> --kind screen --authorised "…" --engine-url …
   node tools/voice/audition.mjs run --config <id> --kind matrix --authorised "…" --engine-url …
   node tools/voice/gallery.mjs
   ```
   - The smoke check must give two decodable, non-silent files.
   - The screen is up to 3 candidates × 2 anchor lines per role (≤ 114 takes); the matrix is the leads' 97 takes.
     Alternates stay at their screen lines.
   - A repair (`repair --take <id> --reason "…"`) only for a technical failure or a supported correction: one per
     case, the original kept.
   - Rebuild the gallery after each engine, then stop that engine before starting the next.
7. **Verify the review** with the real files: playback, filters, candidate comparison, first take versus repair,
   score export. A headless browser started with `--mute-audio` can do this; never play anything through the
   speakers. Spoilers stay hidden; the scores, listened marks and picks stay empty.
8. **Package:**
   `node tools/voice/pack_review.mjs --extra voice-audition/speakers_voicevox.json,…,_va1_audition/RUN_SUMMARY.md`
   → `voice-audition/review-zips/review-part-N.zip`, each under 30 MB, with no models or installers. Return them
   privately through the conversation if the session can attach files; never publish them. Otherwise report the
   exact local path.
9. **Report** in `RUN_SUMMARY.md` and the reply:
   - each configuration complete, partial or blocked, and why;
   - take counts (smoke, screen, matrix), repairs and technical or reading flags;
   - disk used;
   - exact paths;
   - the resume command (the same `run` lines: done takes are skipped).

   Stop only this task's processes and release the sleep inhibition. Keep the installs and every output.
