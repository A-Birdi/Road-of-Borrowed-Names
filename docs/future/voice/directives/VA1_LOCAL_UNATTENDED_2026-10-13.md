# VA-1 — Run the free voice audition on my PC, unattended

## Authority and finish line

Run this task on **my Windows PC**, through the project's **Work locally** / connected-device capability or an already-authorized local Claude Code session. Keep unrelated project work where it already runs.

I, Robin, authorize you to download, install or unpack, configure, and run the free local software and models needed for the existing VA-1 voice audition. I am away from the keyboard. I believe Node.js is installed, but you must check and handle either outcome.

Continue autonomously until **actual audition audio and a working first-review gallery are ready**. Do not stop at an inventory, an empty casting template, an installer download, a plan, or a request for me to fill out JSON. Make the provisional choices needed to produce the examples yourself.

This changes the earlier requirement to wait for my candidate approval before generating audition examples: you may select provisional candidates and a provisional lead per role. It does **not** approve any final cast, certify any recording as human-reviewed, authorize paid synthesis, or authorize whole-game production.

## 1. Establish real access before installing anything

First verify where your commands execute. Distinguish my Windows host, an existing local WSL environment, and the cloud VM. An attachment, a known Windows path, or a GitHub connection does not establish access to my PC.

If coordinating from Claude Projects, attempt its supported **Work locally** route for this task. Use the existing connected PC/folder, without interrupting other threads. A local worker must receive this entire directive, the relevant VA-1 instructions, the frozen corpus, and the current kit—not merely a short summary that drops permissions or the review boundary.

Confirm local execution with non-sensitive checks: OS, working directory, ability to create a harmless file in the dedicated audition workspace, runtime paths, and available hardware/storage. Do not read unrelated personal files or dump environment variables.

If the platform presents a device/folder approval card, identify it clearly. My authorization covers this task, but do not bypass the platform's required approval mechanism. If no local connection exists, report **BLOCKED: no execution access to Robin's PC**, rather than installing into the cloud and calling that a PC installation. Prepare the remaining setup for later resumption, but do not repeatedly probe unavailable access or claim downloads/generation are running locally.

## 2. Protect my machine and existing work

Use one dedicated audition workspace inside the granted local folder, preferably a new `_va1_audition` subfolder. Keep models, downloaded installers, temporary files, logs and outputs there where supported. A documented per-user application/cache location is acceptable where the engine requires it.

Reuse compatible existing installations. Prefer portable or per-user installs. Do not uninstall or globally upgrade Node, Python, existing voice engines, or GPU software. An existing incompatible runtime can remain installed while this task uses an isolated one by its full path.

Do not reset, clean, overwrite, change branches in, or force-pull an existing working checkout. Do not modify the playable game, its saves, browser data, accepted art/audio, or completed testing records. Do not touch Night Signal, Ember Duel, Farbound, or other unrelated projects.

Do not disable Defender, SmartScreen, UAC, the firewall, browser security, or certificate checking. Do not bypass signing/hash failures. No global execution-policy weakening, driver installation, OS upgrade, restart, permanent service, startup entry, port forwarding, or public tunnel. Prefer plain Node/Python commands over changing policy merely to run a PowerShell wrapper.

Use official project sites, official release repositories, and their documented package/model registries. Verify published hashes/signatures when available; record provenance and your own download hashes regardless. A locally computed hash alone is not publisher verification. Never execute HTML/error pages or unrelated third-party download bundles as installers.

You may accept the standard zero-cost software/model terms necessary for this private local audition, after checking that they permit the intended use and recording the obligations. Do not accept paid plans, recurring charges, account creation, separate negotiated agreements, or unclear permission on my behalf. Exclude an unsuitable candidate and continue with suitable ones.

If an unavoidable administrator consent prompt, login, security restriction, or missing capability requires my presence, leave that route pending and continue other independent routes. Do not stop everything for a single engine's blocker.

## 3. Zero additional monetary spending

Authorize **local inference only** for this pass. No Gemini, ElevenLabs, Azure, DashScope or other hosted synthesis—even a hosted free tier or trial. No API keys, unidentified credentials, subscriptions, rented compute, purchases, donations, billing activation, or automatic paid fallback.

Normal downloads from approved official sources are allowed. Existing Claude-plan usage and normal PC resource use remain part of this task; do not buy extra credits. Here, “free” means no new software, model, or synthesis-service charge.

Send the audition text only to engines running on my PC. Do not upload voice samples, personal recordings, full environment reports, or unrelated files to external services. Use stock, legitimately supplied voices; do not clone or impersonate a real person.

## 4. Preflight and prerequisites

Check Windows architecture, free RAM, free disk, CPU, and the actual GPU/available VRAM. Do not assume a remembered GPU guarantees that a model fits. Check for Node, Python, relevant installed voice engines, occupied local ports and other active workloads.

Reuse an existing supported, compatible Node installation. If it is missing, unsupported, or incompatible with the kit, download an official supported LTS runtime in portable/per-user form and use it locally. Do not leave me an instruction to install Node myself when you can install it within this authorization.

Install Python and an isolated virtual environment only if needed for an engine that will actually be attempted. Use a compatible, pinned dependency set for that environment. Reuse the existing GPU driver; use packaged runtime dependencies where supported instead of installing a system CUDA toolkit or changing drivers.

Before large downloads, estimate compressed, extracted, cache and output space. Operational limits for this unattended pass: no more than **40 GiB of additional task-owned disk use**, and retain at least **20 GiB or 10% of the target volume, whichever is greater**, free. Skip/defer a route that cannot fit; do not delete unrelated files to make room.

Run one resource-heavy synthesis engine at a time. Release its model before loading another. Leave reasonable RAM/VRAM headroom and reduce concurrency or select a supported CPU mode when necessary. Never kill unrelated jobs to obtain resources.

You may temporarily inhibit idle sleep while this finite job runs, using a reversible, process-scoped mechanism. Let the screen turn off and remain locked normally; do not disable the lock or permanently change power policy. Release the inhibition on completion or failure.

## 5. Use the existing VA-1 materials

Start from the supplied `rbn-va1-local-kit.zip`. Verify `KIT_MANIFEST.json` and record its source revision. Work on a separate extracted copy. If the ZIP is unavailable to the local worker, obtain the exact kit contents from the known project source/revision rather than silently using an unrelated branch or rebuilding the game.

Read `README-FIRST.md`, the corpus, provider adapters, casting templates and local-job instructions. Retain the existing commands, result schemas and gallery wherever practical:

- `tools/voice/audition.mjs`
- `tools/voice/providers.mjs`
- `tools/voice/audio_check.mjs`
- `tools/voice/gallery.mjs`
- `tools/voice/qwen_local_job.py`
- `docs/future/voice/corpus/audition_corpus.json`
- `docs/future/voice/casting/*.json`

You may make narrow, tested changes to this isolated copy for Windows paths, startup, unattended orchestration, provisional casting, or actual engine compatibility. Record a patch and changed-file hashes. Do not weaken validation, fabricate a successful mock as provider output, or rewrite the audition's Japanese to make an engine pass.

Use the actual CLI help/source to establish arguments. The kit's documented local flow is `voices`, `plan`, `run --kind smoke`, `run --kind screen`, then `run --kind matrix`, with gallery generation; Qwen uses `export-job`, its Python job, and `ingest`. Do not assume the thin PowerShell wrapper installs dependencies—it may need the orchestration you are now authorized to perform.

## 6. Attempt the free configurations

Attempt **VOICEVOX**, **VOICEVOX Nemo**, **AivisSpeech**, and then the kit's specified **local Qwen3-TTS 1.7B CustomVoice** where resources and compatibility permit. Preserve each as a separate configuration; failure of one does not cancel the others.

Prefer official ready-built Windows engines or portable distributions over installing Docker/WSL just for this task. An existing suitable local environment may be reused, but do not create a new virtualization stack overnight as a prerequisite to every option.

For each engine, pin its release and model revision, launch it yourself, wait for a real readiness response, and obtain its actual voice/style inventory. Nemo's IDs and port are independent: discover them instead of borrowing VOICEVOX's values. Verify who owns a port before reusing it.

Bind inference endpoints to loopback only. Do not expose them on the LAN or Internet. Do not kill an unrelated process occupying the default port; select an available supported port and pass it explicitly.

For AivisSpeech, select a small role-relevant set of permissible models rather than downloading the entire catalogue. For Qwen, inspect and measure the actual model/runtime requirements. Do not silently substitute a smaller non-equivalent model, a hosted service, or a voice-cloning workflow. If that route cannot run reliably, report the blocker and keep the successful engines' output.

A supplemental Windows Japanese baseline is welcome if an already-installed voice can directly export audio through a supported local API. Do not require microphone/loopback recording or install OS language packs as a blocker. Identify the exact voice and do not claim it is the identical browser baseline unless verified.

## 7. Cast provisionally without waiting for me

Save the speaker/style inventories and their bundled terms, then check official voice/model terms as needed. Fill the casting files yourself; do not ask me to return `speakers_*.json` or type candidate IDs while I am away.

Select up to **three sensible candidates per each of the existing nineteen roles**, using the corpus's character descriptions and available voice/style metadata. No arbitrary extra roles, huge model search, or repeated candidate farming. Record why each was proposed and how much of that judgment is metadata-based rather than actually assessed from audio.

Preserve the female narrator, Suzu, Nao, Mio, Ren, player Voice A/B, and the existing age/tone/occupation NPC cases. Preserve Suzu's standard/Kansai pairs. Respect the characters' identities: do not turn every voice into the same energetic anime persona or infer vocal pitch from pronouns alone.

Choose one **agent-provisional lead candidate** per role to generate the tonal examples. If the runner requires a `selected` field, document that this is an operational provisional selection, not my approval. Keep all other candidate information; do not label unheard alternatives as rejected by me.

Treat private-audition eligibility, redistribution rights, attribution obligations and human casting approval as separate fields. An unclear licence is not a quality failure. Prefer candidates with a plausible documented route to later game use, without declaring production rights cleared prematurely.

## 8. Produce the first-review audio, not just configuration

For each runnable configuration:

1. Run the actual two-take smoke check through the real engine. Verify it returns decodable, non-silent speech files, not an error page, placeholder or mock tone.
2. Run the existing casting screen: up to three candidates per role, on the existing two anchor lines per role—up to 114 takes.
3. With the agent-provisional cast, generate the existing **83 directed cases plus 14 neutral controls**, 97 takes. This fuller provisional pass is authorized so my first review can include emotional range, dialect and difficult readings, not only neutral samples.
4. Keep alternate candidates at their anchor-line screen; do not multiply the 97-case matrix by every alternate before I listen.
5. Build/update the review gallery immediately after each completed configuration. A later blocked engine must not prevent delivery of earlier recordings.

Use the frozen corpus's actual IDs and accounting. If its version genuinely differs, record and reconcile the difference instead of silently dropping cases or expanding into whole-game dialogue.

For this pass, allow one documented corrective regeneration per defective directed case, up to the existing 83-case repair allowance per configuration. Keep original and repair. Technical failure or a supported pronunciation/control correction is a reason; blindly generating many versions hoping one sounds better is not.

Use finite retry/backoff limits. A permission error is not a reason to retry forever. Resume completed work by matching corpus, model, request and audio identities; do not regenerate successful recordings after an interruption merely because the process restarted.

## 9. Direction, pronunciation and evidence

Keep the canonical spoken Japanese intact. Feed delivery/context through the engine's supported controls; use only documented non-spoken markup where applicable and log it separately. Keep neutral controls neutral. Never pass the English direction into the spoken channel.

Honor the corpus's pronunciation information through the correct engine mechanism. Do not invent an accent position just to mark an override applied. Record unsupported controls and uncertain readings. Suzu's Kansai audition must use its actual supplied variant, not newly improvised dialect dialogue.

Keep original WAV masters untouched. Check decoding, duration, sample rate, channels, clipping, non-finite samples, silence and excessive leading/trailing silence. A duration comparison is an anomaly test, not proof that the transcript or delivery is correct. Free local recognition may provide a labelled supporting check if already practical, but do not turn installing another large model into a prerequisite.

Maintain separate states for generated, technically checked, lexical/phonetic check, and human listening. All my listened flags, ratings and final choices remain empty. Audio hashes and attempt IDs must distinguish repairs from originals.

Pin and log engine/model/speaker/style IDs, actual parameters, corpus hash, request identity, elapsed generation time and source/download provenance. Keep logs free of secrets and irrelevant personal information.

## 10. Prepare an easy first review and stop at the right point

Leave a clearly identified **`START_REVIEW.html`** entry point with working relative media paths or a loopback-only launcher. Verify playback using the actual generated recordings, plus filters, candidate selection, original/repair distinction and score export. Do not call a page full of missing files a completed review package.

Present narrator/companions/player A and B first, then NPC comparisons and pronunciation stress cases. Preserve spoiler hiding; do not reveal sealed story lines in the landing summary or autoplay them. Do not play samples aloud through my speakers unattended.

Keep the raw masters, result records, provisional casting, inventories, rights notes and a short run summary. Provide exact local paths and a restart/resume command. Package a compact review ZIP; split into ordinary ZIPs under 30 MB each if required by attachment limits. Do not include model weights or installers in the review ZIP.

If supported by the connected workflow and voice terms, return the review package privately to this conversation/project. Do not publish it to GitHub, GitHub Pages or another public site. If private attachment transfer is unavailable, leave the local review complete and report its exact path without inventing an upload.

Checkpoint after each engine and retain an installation/change manifest. Stop only processes started for this task, restore temporary sleep inhibition, and leave my applications and reusable installations intact. Avoid a cleanup spree after success.

The final report must distinguish **complete**, **partial**, and **blocked** configurations; give actual clip counts, repair counts, technical/reading flags, disk use and what remains for my ears. No audio quality or cast is “approved” until I listen.

After the first-review deliverables are ready, stop further synthesis. No final casting, full-game batch, deployment, paid-provider fallback or campaign reruns are authorized by this task.

**Begin with local-access verification and preflight now. Do the downloads, installation, provisional casting and actual audition work yourself wherever access permits; return for my first listening review, not for routine setup decisions.**
