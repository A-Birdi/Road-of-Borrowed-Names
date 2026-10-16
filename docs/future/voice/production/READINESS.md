# Voice production: what is ready, kept apart

Robin, 2026-10-16:
> "Declare generation inputs ready separately from runtime integration and hosting readiness. Local generation need
> not wait for a final hosting URL or completed deployment."
>
> "Use the repository as the shared decision/handoff record. Give Local the exact branch, commit and manifest path.
> Report concrete blockers rather than asking Robin to repeat decisions already recorded."

The repository is the shared record:
- **Branch:** `claude/stoic-sagan-n3jvgk` of `A-Birdi/Road-of-Borrowed-Names`.
- **Lead's session, for coordination:** `session_015RcFBxQ5xp952n4kFB8UbL` (https://claude.ai/code/session_015RcFBxQ5xp952n4kFB8UbL).

## 1 · Generation inputs: READY (`GO.json`)

**Go:** branch `claude/stoic-sagan-n3jvgk`, source commit `ff8a0fa87cfacb322b8c277305eddd9b4cc196fb`. The manifest is
`docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz`, and its SHA-256 is in `GO.json`.

**Batch started** (the local worker, 2026-10-16) from `GO.json`:
- the source ff8a0fa, the manifest 513ec3ff…, and the script content 65cd3805…;
- 23,816 entries resolved against the locked cast, which is 14,721 dialogue recordings plus 9,095 reference readings,
  the manifest's count;
- 256 accepted reference files verified;
- the order: AivisSpeech, Nemo and the sourced sound first, then Qwen.

Nothing has been made or pushed yet. Results come back as `results.json` (VOICE_DELIVERY.md §4 and §9).

To check:
```
git fetch origin claude/stoic-sagan-n3jvgk
git checkout ff8a0fa87cfacb322b8c277305eddd9b4cc196fb
node tools/voice/production_manifest.mjs --check
```
It prints "manifest is current: 14721 recordings + 9095 reference readings, content 65cd38053ad6".

**What the inputs are:**
- **The scope:** [PRODUCTION_SCOPE.md](PRODUCTION_SCOPE.md), Robin's production authorization kept apart from the auditions, and the agreed cast.
- **The contract:** [VOICE_DELIVERY.md](VOICE_DELIVERY.md), with the recording key, the variants, pronunciation normalization, the encoding, the results schema and the voice site.
- **The manifest:** `docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz` (with `SUMMARY.json`), built from the corrected script.
- **The go signal:** [GO.json](GO.json), with the exact source commit, the manifest's SHA-256 and the script's content hash. Check with `node tools/voice/production_manifest.mjs --check`.

**C-95 is reconciled** for the recording ([../../../review/register/DISPOSITIONS.md](../../../review/register/DISPOSITIONS.md)).
- All 304 findings carry a disposition: 222 accepted, 70 retained and 12 deferred.
- D6 word help is done too, in parallel, with no line changed.
- All 80 "fix before recording" findings are applied.
- The 112 preserved lines are unchanged.
- The frozen audition texts are unchanged, with their divergences recorded.

**Not holding generation**, each recorded:
- **Later lexicon changes:** a word added or changed later becomes a small supplement under its own reference id. D6's 54 new words are already in this manifest.
- **12 deferred findings:** these are Robin's decisions. Their lines are recorded as they are now. A later change re-records only those lines (new ids).
- **116 lines with the player's name:** a second small pass, once their neutral-word versions are written (C-93).
- **Hosting:** generation does not wait for a host or a deployment.

## 2 · Runtime integration: BUILT AND TESTED, NOT YET WITH REAL RECORDINGS

[VOICE_RUNTIME.md](VOICE_RUNTIME.md) describes it.

**What `tests/e2e/voice_runtime.mjs` checks** (Chromium, 9/0), on a real voice site with synthetic tones:
- recordings play with no Japanese system voice;
- nothing is fetched before play;
- looking ahead is bounded;
- the cache persists across visits, survives being broken, stays within its limit and clears only itself;
- No voice, Mute and a zero voice level fetch nothing;
- Kansai, and the player's Voice A/B with High/Low, pick the right variant;
- the learning controls play their recordings;
- the voiced offline package plays from `file:`.

**Open:**
- the first real recordings, to hear and to time;
- `HOSTED_BASE`, set when the host is chosen;
- browsers other than Chromium (Firefox, Safari);
- phones.

## 3 · Hosting: AUDITED; PUBLISHING NEEDS ROBIN

[../../../hosting/RUNTIME_PUBLISHING.md](../../../hosting/RUNTIME_PUBLISHING.md) has the full account.

**Done:**
- The unpacked Pages output was audited.
- The runtime-only folder is prepared and browser-tested on its own: 625 files, 523,674,397 bytes.
- The voice site format and the offline package are built.
- Development evidence stays in the repository and is not published; nothing was deleted.

**Concrete blockers, Robin's to remove (the lead cannot):**
1. **The game's site.** It publishes the whole branch, about 1.07 GB, over the 1 GB limit. Switching Pages to the runtime-only workflow (draft: `docs/hosting/pages-runtime.workflow.yml`) is a Pages setting. The URL is unchanged.
2. **Where the voices are published.** The lead's recommendation is a same-origin Pages repository, for example `A-Birdi/Road-of-Borrowed-Names-voices`: about 665 MB, under its own 1 GB.
   - Creating that repository and enabling its Pages is Robin's.
   - The game then gets its base path (`HOSTED_BASE`) in a one-line change.
3. **Then the audio is published there.** The lead pushes nothing of the audio to this branch.

## 4 · The voiced offline package: BUILT AND TESTED (Chromium)

`node tools/publish/offline_package.mjs --site <voice site> --out <dir>` builds the package. It uses the same accepted recordings, the same files and the same site; opening its `index.html` from disk plays them. It is a separate delivery from the hosted game; the hosted game never needs it.
