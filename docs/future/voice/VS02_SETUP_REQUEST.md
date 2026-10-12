# VA-1 · VS02 · Consolidated setup request (2026-10-12)

**No audio has been generated.** Every configuration is blocked from the development environment or waits for your
authorisation. Each is *untested*, not inferior. The non-billable preparation is done, so the first authorised route
can go straight to a smoke check, then the casting screen, then its 97 takes:

| Tool | What it does |
| --- | --- |
| `tools/voice/providers.mjs` | Builds each configuration's request. It voices only the spoken Japanese, and nothing is sent. |
| `tools/voice/audition.mjs` | Runs `plan`, `run`, `repair`, `export-job`, `ingest` and `status`. It refuses to send without an authorisation record. A hosted run also needs a cumulative character cap and its credential from the environment. |
| `tools/voice/audio_check.mjs` | Technical check (measurement only, see below). |
| `tools/voice/gallery.mjs` | Builds `review.html`, the listening gallery. |
| `tools/voice/qwen_local_job.py` | The Qwen job for a capable machine. |
| `docs/future/voice/casting/*.json` | Uncast templates. |
| `docs/future/voice/inventory/provider_inventory.json` | Recorded access for each configuration. |

The technical check covers decoding, level, clipping, silence, and duration against the line's morae. It also
compares each directed take with its neutral control, so a direction read aloud would show up as a longer take. It
measures the file; it never hears it.

`tests/unit/voice_audition.test.mjs` proves three things:

- All 1,328 requests (8 routes × 83 cases × 2 take kinds) voice exactly the case's Japanese. Direction travels only in
  each provider's non-spoken channel, and not at all in neutral controls.
- The refusals hold.
- A full smoke → matrix → repair flow works against a mock engine on localhost.

**Where each fact comes from:**

- **[O]**: an official source read in this environment on 2026-10-12:
  - the VOICEVOX Engine, AivisSpeech Engine and Qwen3-TTS READMEs;
  - Google's `cloud_tts.proto`;
  - the google-gemini cookbook TTS notebook;
  - the `google-genai` 2.29.0 SDK source from PyPI;
  - Docker Hub, ghcr.io and PyPI metadata.
- **[K]**: known from before and not re-read here, because the provider's documentation host is refused by the
  network policy. Verify it at authorisation.
- **[T]**: a third-party figure. Unverified.

## Your decisions, in one list

Each line is independent. Anything you leave unanswered stays untested, with its cells marked `blocked_access`.

1. **Gemini-TTS: the quickest route.** Its host is already reachable from here. Add a **project-specific Gemini API
   key** as the environment variable `GEMINI_API_KEY`:
   - Where: the cloud environment menu in the session's title bar → *Edit* → *Network secrets*, or an environment
     variable where that section isn't offered. Don't paste it into the chat. A new session picks it up.
   - Confirm a budget, for example **≤ US$5 on the project, with `--max-chars 10000`**. I would then run the smoke
     check, the casting screen and the matrix here, and return the audio with the gallery.
2. **The local engines: VOICEVOX, VOICEVOX Nemo, AivisSpeech.** No account, key or cost, but they cannot run here
   (below). Run them on your machine with the same script (*Local jobs* below), or leave them untested.
3. **Azure Speech.** This needs new terms, so it's your decision:
   - an Azure subscription and a Speech resource (the F0 free tier covers the audition [K]);
   - `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` as environment secrets;
   - `<region>.tts.speech.microsoft.com` added under the environment's *Allowed domains*.
4. **ElevenLabs.** This also needs new terms:
   - an account or plan;
   - `ELEVENLABS_API_KEY`;
   - `api.elevenlabs.io` added under *Allowed domains*.
5. **Qwen3-TTS.** Either a machine with an NVIDIA GPU (≥ 8 GB) to run `qwen_local_job.py`, or the hosted route:
   - an Alibaba Cloud Model Studio account and `DASHSCOPE_API_KEY`;
   - `dashscope-intl.aliyuncs.com` and its result-download host allowed.

   The hosted route's request fields are unverified, so the runner refuses it until they are checked against the
   documentation.

How to change network access: the same *Edit* screen → *Network access* → *Allowed domains* (Limited level), with
*Allow package managers* left ticked. The steps are at
https://code.claude.com/docs/en/cloud-environments#network-access. I recommend **not** opening the large model and
download hosts for this environment: its disk can't hold the local engines anyway.

## The Google Cloud token already in the environment: unused

Checked through non-secret configuration only; I didn't display, export, introspect or send the token anywhere:

- **What's present:** `CLOUDSDK_AUTH_ACCESS_TOKEN` (a gcloud OAuth access token), `CLOUDSDK_PROXY_*` and
  `CLOUDSDK_CORE_CUSTOM_CA_CERTS_FILE` (the environment's proxy settings).
- **What's missing:** a project (`CLOUDSDK_CORE_PROJECT` or `GOOGLE_CLOUD_PROJECT`), an account, a gcloud
  installation or configuration directory, `GOOGLE_APPLICATION_CREDENTIALS`, and any record of the token's purpose
  in the repository or this session.
- **What can't be established:** the intended API, the credential's source, the project, and who owns billing or the
  spending limit.
- **So it stays unused.** For the Cloud TTS route, I would need:
  - a project ID with the Cloud Text-to-Speech API enabled, billing linked and a budget;
  - a credential for that project, as `GOOGLE_CLOUD_PROJECT` + `GOOGLE_OAUTH_TOKEN`.

  The principal needs `serviceusage.services.use` on the project (Service Usage Consumer) to bill it as the quota
  project [K]. Access tokens expire in about an hour [K], so the Gemini API key (item 1) is the simpler route.

## The seven configurations

The upper bound per configuration comes from the corpus:

| Pass | Takes | Characters |
| --- | ---: | ---: |
| Smoke | 2 | 68 |
| Casting screen (19 roles × ≤3 voices × 2 lines) | 114 | 3,594 |
| Matrix (83 directed + 14 neutral controls) | 97 | 3,244 |
| One repair for every directed cell (the most allowed) | 83 | 2,792 |
| **Total** | **296** | **9,698** |

- **Duration:** about **34 minutes** of audio at ~7 morae/s with pauses. Without repairs it is 213 takes, 6,906
  characters, about 24 minutes.
- **Storage:** about 100 MB of 24 kHz 16-bit WAV masters per configuration, never committed.
- **Retries:** at most two transport retries per request, only after a network error, 429 or 5xx. Each is logged.
  A failed request is counted against the cap in case it's billed.
- **Repairs:** billable regeneration happens only through a documented repair, at most one per directed cell. That
  is inside the bound.

The runner's `--max-chars` is cumulative per configuration, so no sequence of runs can exceed what you approve.

### 1 · `voicevox`: VOICEVOX character voices (local)

**Configuration**
- VOICEVOX Engine, pinned to one release for the whole pass. 0.25.2 was the latest on 2026-10-12; 0.26.0-dev images
  exist [O].
- Character voices and their styles from `/speakers` [O]. The flow is `POST /audio_query` → adjust → `POST
  /synthesis` [O].
- Direction goes through a style id per delivery where the same speaker has one, plus ±5% `speedScale` and ±15%
  `intonationScale` by broad energy.
- Readings: the engine's own reading (the query's `kana`) is checked against the overrides. A mismatch is repaired
  only with a user-dictionary word whose accent type a listener chose; the runner removes it after the run [O].

**Hosts:** `127.0.0.1:50021` [O].

**Downloads**
- The VOICEVOX app or engine from `voicevox.hiroshiba.jp`, or `github.com/VOICEVOX/voicevox_engine/releases`.
  Release assets redirect to `objects.githubusercontent.com` / `release-assets.githubusercontent.com` [K].
- Or Docker `voicevox/voicevox_engine:cpu-latest` from `registry-1.docker.io` with `auth.docker.io` and
  `production.cloudflare.docker.com` [O/K].

**Secret:** none.

**Permissions:** none. Read each character's terms before casting it: credit "VOICEVOX:<name>", and each voice
library has its own terms (S14) [K].

**Cost:** $0.

**Size**
- Docker image cpu-0.25.2 amd64: **1.99 GB compressed** [O: Docker Hub metadata]. The extracted size is larger.
- RAM: 1–2 GB [K].

**Feasibility here:** not feasible.
- No Docker daemon.
- Docker Hub's anonymous pull limit was reached.
- GitHub release downloads and the VOICEVOX site are refused.
- Even if they weren't, about 2 GB compressed plus its extraction leaves too little of the 5.5 GB free.

**On your machine:** feasible (the app starts the engine).

### 2 · `voicevox_nemo`: VOICEVOX Nemo (local)

**Configuration**
- The Nemo engine and its own voices from its own `/speakers`. A VOICEVOX character style id is never reused by
  assumption.
- Its own terms (S04). Same API family and controls as VOICEVOX.

**Hosts:** its local port. 50121 is an assumption; pass `--engine-url` once you see it [K].

**Downloads:** from `voicevox.hiroshiba.jp/nemo` and the release host it links to [K].

**Secret / cost:** none / $0.

**Size:** not readable here.

**Feasibility here:** not feasible (site and downloads refused, no Docker daemon).

**On your machine:** feasible.

### 3 · `aivis`: AivisSpeech (local)

**Configuration**
- AivisSpeech Engine, pinned. 1.2.0 was the latest read here.
- An explicitly identified AIVMX model (uuid + version), speaker and style [O].
- `intonationScale` here is the style's emotional strength. It's left at 1 and ignored for a Normal style.
  `tempoDynamicsScale` is left at 1, `pitchScale` at 0 (changing it degrades quality), and `pauseLength` is ignored
  [O]. Direction goes through the style choice plus ±5% `speedScale`.
- Readings go in the query's `kana`, which this engine reads as the reading text [O].

**Hosts:** `127.0.0.1:10101` [O].

**Downloads**
- `ghcr.io/aivis-project/aivisspeech-engine:cpu-latest` or the GitHub releases.
- On first start, the engine fetches the default model (~250 MB) and the BERT model (~650 MB, `huggingface.co`) [O].
- Further models come from `hub.aivis-project.com`.

**Secret / cost:** none / $0.

**Permissions:** each model's licence is in its AIVM metadata and on AivisHub. Record it before casting.

**Size**
- Image cpu-latest amd64: **2.16 GB compressed** [O: ghcr.io manifest].
- Plus 0.9 GB of first-start models, plus each AIVMX model.
- RAM: **≥ 1.5 GB free** [O].

**Feasibility here:** not feasible (no Docker daemon; AivisHub and Hugging Face refused; too little disk).

**On your machine:** feasible (the app).

### 4 · `qwen`: Qwen3-TTS 1.7B CustomVoice (local, or hosted)

**Configuration**
- `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` with `Qwen3-TTS-Tokenizer-12Hz`, called as
  `generate_custom_voice(text, language="Japanese", speaker, instruct)` [O].
- Only the 1.7B CustomVoice and VoiceDesign models have instruction control. The 0.6B CustomVoice doesn't, so it is
  not a substitute, and the job refuses any other model [O].
- Nine preset speakers. **Ono_Anna** is the only Japanese-native one ("playful, light, nimble") [O]. With 19 roles,
  voice reuse is unavoidable and will be disclosed.
- VoiceDesign is only a separately labelled subtrial.

**Hosts**
- Local: `pypi.org` / `files.pythonhosted.org` for `qwen-tts` 0.1.1 (Apache-2.0; pins transformers 4.57.3 and
  accelerate 1.12.0) and torch [O: PyPI].
- Weights from `huggingface.co` (+ `cdn-lfs*.huggingface.co`, `*.hf.co`) or `modelscope.cn` [O/K].
- Hosted: `dashscope-intl.aliyuncs.com` plus its result-file host [K, verify].

**Secret:** hosted only, `DASHSCOPE_API_KEY` as `Authorization: Bearer` [K].

**Cost**
- Local: $0.
- Hosted: about US$0.10 for 9.7k characters [T].

**Size**
- Weights: ≈ 3.5–4 GB in bf16 [K: 1.7B parameters × 2 bytes].
- torch: 555 MB wheel [O], plus its CUDA libraries.
- Peak disk: ≈ 8–10 GB.
- RAM: ≈ 8 GB+. A GPU with ≥ 8 GB is recommended (the README loads it on CUDA in bf16) [O].

**Feasibility here:** not sensible (5.5 GB free, weight hosts refused, no GPU).

**Elsewhere:** feasible on a GPU machine via `qwen_local_job.py`. CPU works but is slow.

### 5 · `gemini`: Gemini-TTS (hosted)

**Configuration**
- **`gemini-3.8-flash-tts`** through the Gemini API Interactions endpoint, `POST /v1beta/interactions`, as the
  official SDK sends it [O: cookbook + google-genai 2.29.0]:
  - `input: [{type: "text", text: <the Japanese>, annotations: [{type: "speech_metadata", style: <direction>}]}]`;
  - `response_format: {type: "audio"}`;
  - `generation_config.speech_config: [{voice: <prebuilt name>}]`;
  - `store: false`.
- The cookbook states that the text is spoken verbatim and that delivery belongs in `speech_metadata`, never in the
  text [O]. Output is a 24 kHz mono 16-bit WAV [O]. Neutral controls carry no annotation.
- Voices: one of the 30 prebuilt voices [O]. A Voices API (Voice Design) voice would be a separately labelled
  subtrial.
- `gemini-3.8-flash-lite-tts` would be its own configuration, never mixed into this one.
- **Alternative route:** Cloud Text-to-Speech `v1/text:synthesize` with `input.text` + `input.prompt` (a style
  instruction; "we pass the unedited text") and `voice.model_name` [O: googleapis proto]. Its Gemini model names are
  not readable here.
- Readings: no Japanese route. Cloud TTS `custom_pronunciations` is en-US only [O], so overrides are recorded as not
  applied.

**Hosts:** `generativelanguage.googleapis.com` (reachable), or `texttospeech.googleapis.com` (reachable).

**Secret:** `x-goog-api-key: $GEMINI_API_KEY` [O].

**Permissions:** a Google Cloud / AI Studio project with the Generative Language API enabled and billing on. TTS may
not be on the free tier [K, verify]. Restrict the key to that API and set a budget alert or cap.

**Cost**
- 3.8 prices are not readable here.
- Reference prices for the 2.5 TTS previews: input $0.50 / 1M text tokens; audio output $10 (Flash) or $20 (Pro)
  per 1M tokens, at 25 audio tokens per second [K].
- Upper bound: ~2,064 s ≈ 52k audio tokens ≈ **$0.52–1.03**.
- Without repairs: ≈ $0.37–0.73.

**Size:** none locally.

**Feasibility here:** feasible as soon as a key is provided.

### 6 · `elevenlabs`: ElevenLabs (hosted)

**Configuration**
- `eleven_v3`, or `eleven_multilingual_v2`: one model for the whole pass, never mixed [K]. Verify Japanese support for
  the chosen model.
- A voice id from your library. No cloning of real people.
- `language_code: "ja"`, `output_format=mp3_44100_128`.
- Direction goes only through `voice_settings` (stability and style by broad energy). v3's inline audio tags are not
  used, so nothing but the words is in the text.
- `previous_text` / `next_text` are left out because they could colour the take.
- A pronunciation dictionary could carry the readings but isn't configured, so overrides are recorded as not applied.

**Hosts:** `api.elevenlabs.io` (refused here).

**Secret:** `xi-api-key: $ELEVENLABS_API_KEY` [K].

**Permissions:** an account. The key needs text-to-speech access and voice reading; set a key credit limit if offered
[K].

**Cost**
- One credit per character [K]: 9,698 at the bound, ≈ **$0.97** at about $0.10 per 1K [T].
- In practice it needs a plan, about $6/month for Starter [T]. A free tier (~10k credits/month, non-commercial,
  attribution [K]) might cover the 6.9k-character pass without repairs.
- Any account or plan is new terms: your decision.

**Feasibility here:** feasible once the host is allowed and a key provided.

### 7 · `azure`: Azure Speech (hosted)

**Configuration**
- Speech REST `cognitiveservices/v1` with SSML [K].
- A ja-JP neural voice, for example `ja-JP-NanamiNeural`. Use only the styles and roles `voices/list` reports for it,
  through `mstts:express-as` (S09) [K]. Deliveries without a listed style are marked as text-conditioned.
- Readings as `<sub alias>` [K, verify that the voice honours it].
- Output `riff-24khz-16bit-mono-pcm`.

**Hosts:** `<region>.tts.speech.microsoft.com` (refused here).

**Secret:** `Ocp-Apim-Subscription-Key: $AZURE_SPEECH_KEY` with `AZURE_SPEECH_REGION` [K].

**Permissions:** an Azure subscription and a Speech (or AI Services) resource. Sign-up asks for a payment card even
for the free tier [K]. The key grants use of that resource only.

**Cost**
- F0 free tier: 0.5M neural characters/month [K], so **$0** for the audition.
- S0: about $15–16 per 1M characters [K], about $0.15.

**Feasibility here:** feasible once the host is allowed and a key provided.

## Local jobs (your machine; same script, same records)

**Requirements:** Node 18+ and a checkout of this branch at `<LOCAL_PROJECT_DIR>`. For each local engine:

1. Start the engine: the VOICEVOX app, or Nemo, or the AivisSpeech app.
2. List its voices: `node tools/voice/audition.mjs voices --config voicevox`. Add `--engine-url
   http://127.0.0.1:<port>` for Nemo.
3. Fill `docs/future/voice/casting/<config>.json`:
   - up to three candidates per role, with `pickedBecause`;
   - `rights.status` starting with `ok` only after reading that voice's terms.
4. Run the smoke check: `node tools/voice/audition.mjs run --config voicevox --kind smoke --authorised "Robin,
   <date>, VOICEVOX local"`.
5. Run the casting screen: `--kind screen`. Then build the gallery with `node tools/voice/gallery.mjs` and open
   `voice-audition/VA1/<revision>/review.html` to listen.
6. Set `selected` per role (and keep `discarded`). Then run `--kind matrix`. Repair a flawed take with `repair --take
   <id> --reason "<cause>"`. Only one repair per take is allowed.
7. For Qwen: `export-job --config qwen --kind smoke`, then `python tools/voice/qwen_local_job.py
   voice-audition/VA1/<revision>/jobs/qwen.smoke.json`, then `ingest --config qwen --kind smoke`.

The output stays on your machine: `voice-audition/` is ignored by git, so test clips are never published. The
gallery's score sheet exports a CSV; send me that, or `results.json`, if you want them recorded here.

## For later, not requested now: the whole-game count

`node tools/voice/fullgame_count.mjs` resolves each line before counting:

- generic companion lines go to the companion(s) they can belong to;
- the player is counted once for Voice A and once for Voice B (never for None);
- Suzu's lines get their Kansai variants where the dialect table changes them;
- recordings are distinct by speaker, player voice, dialect, spoken text and delivery, not by text alone.

| | Lines / recordings | Characters |
| --- | ---: | ---: |
| Source lines | 13,820 | |
| Distinct texts | 12,770 | |
| **Recordings** | **16,251** | **461,207** |
| Narrator | 4,757 | 124,194 |
| Nao | 1,645 | 46,357 |
| Mio | 1,564 | 45,497 |
| Ren | 1,609 | 48,767 |
| Suzu | 2,717 | 77,036 |
| Player (A + B) | 318 | 5,682 |
| 281 other speakers | 3,641 | 113,674 |
| Dynamic-name lines, not recordable as-is | 115 | 3,749 |

This counts every conditional variant, not one journey. It is a planning figure only: no whole-game synthesis or
casting decision follows from it until you have listened and given the next instruction.
