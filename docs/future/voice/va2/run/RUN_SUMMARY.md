# VA-2 casting samples — run summary

Run on Robin's Windows PC (ROBIN: Windows 11 Pro, i7-11700K, 32 GB RAM, RTX 3080 10 GB) on 2026-10-15 by the local
Claude worker, under HANDOFF_VA2.md (C-93) with START_VA2_ON_PC_FRESH.md; where they differ, the handoff was followed.
Free, local engines only; endpoints on loopback; no hosted or paid synthesis, accounts or keys.

**Listen:** `VA2_CASTING_SAMPLES.html` (33.9 MB, every recording embedded, plays offline from anywhere). Copies:
`_va2_samples\work\VA2_CASTING_SAMPLES.html` and the desktop.

Nothing has been heard by anyone. Every voice choice below is **agent-provisional** (metadata-based), not Robin's
casting. Picks, dislikes and listened marks are empty.

## Counts: 595 of 595 made, 0 missing, 0 failed

| Section | Planned | Made | Engine |
| --- | ---: | ---: | --- |
| 1 · Player voices | 60 | 60 | Qwen3-TTS VoiceDesign |
| 1b · Companions | 240 | 240 | Qwen VoiceDesign; Suzu's set 3 AivisSpeech |
| — Nao / Mio / Ren / Suzu | 60 / 60 / 60 / 60 | 60 / 60 / 60 / 60 | |
| 2 · Narrator | 14 | 14 | AivisSpeech (N1–N7) |
| 3 · NPCs | 281 | 281 | 250 Qwen, 18 AivisSpeech, 12 Nemo, 1 sourced sound (Mochi) |

- Qwen: 390 base takes (each High/Low pair is one take moved ±2 semitones, formants kept, as planned). 72 base takes
  needed a second or third seed under the plan's clean-ending rule (at most three tries; the cleanest was kept).
- **Still flagged after trimming** (an unvoiced tail over 0.18 s; listen for a breathy or trailing end):
  P3B-frustrated-low (0.31 s), C-ren-2A-excited-low (0.26 s), C-suzu-2B-frustrated-high (0.22 s),
  C-suzu-2B-frustrated-low (0.24 s), NPC-sg_clerk (0.335 s), NPC-mb_bridgespirit (0.445 s), NPC-mp_naraku (0.42 s),
  NPC-ko_kihei (0.185 s). The bridge spirit and Naraku carry the plan's supernatural treatment, which may itself add a tail.
- **Style fallbacks** (the wanted style does not exist on that model, so its neutral style was used, as the renderer
  records): AV-girl upbeat → normal (8 NPC takes), N6 and N7 upbeat → normal (1 each; their energetic line uses the
  neutral style), AV-suzu-A and AV-suzu-B calm → normal (Suzu's sad line, 2 each).
- Audio in the gallery: 57 minutes. Render time: 2 h 50 min for the full pass, after a 9-take smoke test.
- Mochi's ニャー is Robin's chosen CC0 recording (Wikimedia Commons, Tsester, sha256 5672d956…), trimmed and levelled;
  the AivisSpeech fallback was not needed.
- Suzu's 60 companion clips are standard Japanese, as planned; they are not a Kansai comparison.

## Toolkit and plan

- Toolkit: `A-Birdi/Road-of-Borrowed-Names` at **02217e10e30790facc8cea39a00acb12e8e4062d** (branch
  `claude/stoic-sagan-n3jvgk`), sparse checkout in `_va2_samples\repo_02217e1`. The plan's own `builtFrom.commit`
  (35ed853) is its generation provenance and was left unchanged.
- `node tools/voice/va2/plan.mjs --check`: **"va2_plan.json is current: player 60, companion 240, narrator 14, npc 281"**.
  Two local fixes were needed to run it on Windows, neither weakening the check:
  1. `plan.mjs` read its own folder from `new URL(import.meta.url).pathname`, which keeps the space in "JRPG Project"
     as `%20`; patched to `fileURLToPath` (`patches\plan_mjs_fileURLToPath.patch`).
  2. Git's default `core.autocrlf=true` on this PC turned line endings into CRLF, so the committed plan differed from
     the rebuilt one only by line endings; the toolkit copy was checked out with `core.autocrlf=false`.
- `work\va2_plan.json` is the exact committed plan (sha256 CA1C4EC9…), the one the renderer used.

## Installed / reused

- **Reused from VA-1 on this PC** (VA-1 did run here; verified before reuse): Node v24.19.0; the isolated Python 3.12
  venv `_va1_audition\envs\qwen` (torch 2.8.0+cu128, qwen-tts 0.1.1); AivisSpeech Engine 1.2.0 and VOICEVOX Nemo
  Engine 0.24.0 (official GitHub releases, hashes equal to GitHub's digests).
- **Added:** `praat-parselmouth 0.4.7`, `pyloudnorm 0.2.0` (PyPI) into that venv (freeze: `logs\python_env_freeze.txt`;
  Ogg Opus encode/decode verified, libsndfile 1.2.2).
- **Qwen3-TTS 12Hz 1.7B VoiceDesign**, revision `5ecdb67327fd37bb2e042aab12ff7391903235d3` (Apache-2.0), in
  `_va2_samples\models`; model and speech-tokenizer weights equal to Hugging Face's LFS SHA-256.
- **Eleven AivisSpeech models** from AivisHub, all ACML 1.0, each verified against AivisHub's checksum
  (`casting_work\aivis_model_provenance.json`): みちのくあいり, ほのか, わかな, すみれ, さつき, 花音, 桜音, 中2, るな, もえ,
  かりん. Already installed from VA-1: まお, コハク, 凛音エル (ACML 1.0). Real-person, existing-character and
  voice-clone-derived models were excluded. AivisSpeech keeps its models in its per-user data folder, which the packaged
  Claude app redirects to `%LOCALAPPDATA%\Packages\<Claude app package>\LocalCache\Roaming\AivisSpeech-Engine` (5.2 GiB).
- AivisSpeech was started with `--disable_sentry`; it still sends its anonymous start-up event (OS, CPU/GPU, RAM) to
  AivisHub on each start, as recorded in VA-1. No audition text or audio left the PC.
- Disk: VA-2 workspace 8.8 GiB + AivisSpeech data 5.2 GiB (≈34 GiB task-owned with VA-1, under 40 GiB); 183 GiB free.

## Voices chosen (agent-provisional, not yet heard; details and rights in va2_voices.json)

| Slot | Voice | Styles (normal / upbeat / calm) |
| --- | --- | --- |
| N1 | みちのくあいり (official; "calm, cute female voice") | 標準 / 喜び |
| N2 | ほのか (リアボVC; natural woman in her twenties) | ノーマル / uresii |
| N3 | わかな (リアボVC) | ノーマル / 嬉しい |
| N4 | すみれ (リアボVC) | ノーマル / uresii |
| N5 | さつき (リアボVC) | ノーマル / uresii |
| N6 | 花音 (single-style research model) | ノーマル / — |
| N7 | 桜音 (single-style research model) | ノーマル / — |
| AV-girl | コハク (official; sweet, kitten-like) | ノーマル / — / — |
| AV-teen | 中2 (research model) | ノーマル |
| AV-bright | まお (official; playful) | ノーマル / — / おちつき |
| AV-sweet | るな (research model) | ノーマル |
| AV-showy | 凛音エル | ノーマル / Happy |
| AV-suzu-A | もえ (リアボVC) | ノーマル / uresii / — |
| AV-suzu-B | かりん (リアボVC) | ノーマル / uresii / — |
| NM-A | Nemo 男声2 (mid, even) | normal |
| NM-B | Nemo 男声3 (lowest) | normal |
| NM-C | Nemo 男声1 (lightest, fastest) | normal |

- Fourteen different AivisSpeech models: no narrator or AV slot shares a model.
- NM-A: Robin named no Nemo voice for the middle-aged man in VA-1 (the VA-1 Nemo note was about a female candidate on
  another role), so NM-A is a provisional pick, not a recorded preference.
- No permissive child, middle-aged-female or elderly-female AivisSpeech model was found on AivisHub; AV-girl uses the
  youngest-sounding description available.
- Credits: the リアボVC models (ほのか, わかな, すみれ, さつき, もえ, かりん) ask for 「声は(x.com/dopoiro)のAI」; まお and コハク
  ask for "AivisSpeech: まお / コハク" if credited; ACML 1.0 otherwise makes credit optional. Nemo: 「VOICEVOX Nemo」.
  Qwen3-TTS: Apache-2.0.

## Differences from the plan or handoff

- None to texts, voice descriptions, seeds or settings.
- The handoff assumes VA-1 notes for NM-A; there were none (see above).
- The fresh-setup instruction assumed VA-1 had not run; it had, so verified VA-1 installs were reused instead of
  duplicated, which both documents permit.

## Records

- `work\`: `va2_plan.json`, `results.json`, `clips\` (595 Opus files), `speakers_aivis.json`, `speakers_nemo.json`,
  `VA2_CASTING_SAMPLES.html`.
- `va2_voices.json` (the concrete voice configuration; the meow-only version kept as `va2_voices.meow_only_2026-10-14.json`).
- `logs\` (render log, statistics, gallery check), `patches\`, `casting_work\`.
- Pushed (non-audio only, local paths removed): `docs/future/voice/va2/run/` → `va2_voices.json`, `results.json`,
  `RUN_SUMMARY.md`.
