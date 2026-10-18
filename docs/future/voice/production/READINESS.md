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

Progress (the local worker's checkpoints, latest first):
- **2026-10-18: the run records are in the repository** (38a397f, the worker's own push, new files only):
  [run/RUN_SUMMARY.md](run/RUN_SUMMARY.md), `run/results.json.gz` (`results.json` gzipped), `run/results_MW1.json` and
  `run/POST_CHECK.json`.
  - **The worker reports:**
    - 23,816 + MW-1's 7 made, 0 failed, 0 pending;
    - every file decodes and matches its bytes and SHA-256;
    - `voice_site.mjs` built a site from them locally with 0 errors and 0 missing recordings or references;
    - the voice folder is 557,980,768 bytes;
    - the audio (552,138,662 bytes) stays on Robin's PC.
  - **Checked here** (the lead, on the pushed files):
    - the results name the GO pins (ff8a0fa, 513ec3ff…, content 65cd38053ad6);
    - all 23,816 GO manifest ids (14,721 recordings + 9,095 references) have a result, and none are pending or failed;
    - `results_MW1.json` covers the supplement's 7 ids and nothing else;
    - none of the four files carries a local path or a credential.
  - **Open:** `r1-6ab18b4d8dcef181` (Wataru, surprise, 「……辞めさせないんですか。」, sg.omi_wataru) is 1.17 s for 10 morae
    on all 12 seeds tried, and is flagged. The expected 2.9 s counts the opening 「……」, which the trim removes from
    every line; the 14 other short 「……」 lines are 0.5–0.8 s and were judged not errors. Its actual pace is about
    8.5 morae a second: brisk for a surprised line, not impossible. **A listen decides.** If it sounds clipped, a
    send text without the 「……」 is a new id: an NPC take, outside the narrator-only supplement rule, so it is
    Robin's call.
  - **Fixed after the worker's note:** `voice_site.mjs`, `site_size.mjs`, `voice/lines.mjs` and the music
    `export_events.mjs` compared `import.meta.url` with `'file://' + argv[1]`. On Windows that never matches, so the
    commands exited silently. They now compare with `pathToFileURL(path.resolve(argv[1]))`, as `scene_manifest.mjs`
    already did.
  - **For the hosted site:** pass `voice_site.mjs --production` a manifest rebuilt at the site's revision
    (`production_manifest.mjs --out <dir>`). The committed manifest is the GO one, and it neither uses the MW-1 ids
    nor drops the 3 retired ones.
- 2026-10-18: the MW-1 supplement recorded after the batch: 7 of 7 made, 0 failed: the 6 narrator lines and the
  どすん reference. It was taken from the record at 5a8353c, and the worker's sha256 (52e292f2…) is that file's: it
  checks out byte-identical here and has not changed since. Results are in `results_MW1.json`, beside `results.json`.
  The 3 retired ids keep their files (VOICE_DELIVERY.md §8.4). Nothing pushed. Status only; no request to the lead.
- **2026-10-18: the batch run FINISHED:** 23,816 recordings made, 0 pending, 0 failed (the GO manifest's whole count).
  The audio stays on Robin's PC (§9). `results.json` and the run summary come back to this repository after the
  worker's own checks. Nothing pushed yet. Status only; no request to the lead.
- 2026-10-17, after the resumption (superseded by the lines above): phase 1 finished again (the AivisSpeech narrator, the reference readings, the
  AivisSpeech and Nemo NPCs, and Mochi), with the same counts as at the pause: 20,731 made, 3,085 pending, 0 failed. So
  the resumed pass made nothing new in phase 1, and what is left is Qwen's (the pause listed the rest of Ren, Suzu and
  the last Qwen NPCs). Qwen is starting. Status only; no request to the lead.
- 2026-10-17, after the pause (superseded by the line above): RESUMED on the same pinned source ff8a0fa and manifest 513ec3ff…, with the
  runaway-length guard on Qwen takes (normal takes unchanged). The counts are as at the pause: 20,731 made, 3,085
  pending, 0 failed. Nothing pushed. Status only; no request to the lead.
- 2026-10-17, later (the pause; superseded by the resumption above): PAUSED at Robin's request (the GPU is needed for a while). Saved: 20,731 recordings made,
  3,085 pending, 0 failed (20,731 + 3,085 = 23,816, the GO manifest's count). Still to make: the rest of Ren, Suzu and
  the last Qwen NPCs, then the MW-1 supplement as recorded at 5a8353c (6 narrator lines and 1 reference reading, on
  top of the 23,816). It resumes by exact input identity from the same pinned inputs. Nothing pushed. Status only; no
  request to the lead.
- 2026-10-17 (superseded by the counts above): phase 1 finished (the AivisSpeech narrator, the reference readings, the AivisSpeech and Nemo NPCs,
  and Mochi): 18,781 recordings made, 5,035 pending, 0 failed (18,781 + 5,035 = 23,816, the manifest's count). Qwen
  started. The whole-game batch was then resumed on the same pinned source ff8a0fa and manifest 513ec3ff…, with a
  runaway-length guard added to Qwen takes; normal takes are unchanged. Status only; no request to the lead.
- 2026-10-16 (superseded by the counts above): phase 1 done, 14,306 made, 0 failed; Qwen, 9,510 pending, started.

FR-1 (§5) changed none of the inputs above: the manifest check still reports content 65cd38053ad6.

Nothing has been pushed. Results come back as `results.json` (VOICE_DELIVERY.md §4 and §9).

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
- **MW-1 supplement (2026-10-17):** Robin's Old Mill flow change adds 6 narrator lines and 1 narrator reference reading
  (どすん), and retires 3 lines: [supplements/MW1_SUPPLEMENT.json](supplements/MW1_SUPPLEMENT.json) (187 characters).
  It is recorded after the batch, with the same narrator voice, delivery and encoding: done on 2026-10-18, 7 of 7, 0
  failed (`results_MW1.json`; the progress list above). The batch's inputs are unchanged
  (`GO.json`: ff8a0fa, 513ec3ff…). At the branch head, `--check` now reports that the script has moved past the GO
  manifest. That is expected; it does not touch the batch, which checks out ff8a0fa.

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

**VR-C1** (Astra's audit, 2026-10-16) corrected the loader after reproducing its cases on the full module. The
changes:
- lookahead to lines that will certainly come;
- one bounded speculative queue;
- index recovery;
- checked kept copies;
- bookkeeping across tabs;
- writes never waited for.

`tests/e2e/voice_runtime_vrc1.mjs` (Chromium, 7/0) checks them on the built page. They are not real-audio or other-browser
evidence (VALIDATION.md "VR-C1").

**Open:**
- the first real recordings, to hear and to time;
- `HOSTED_BASE`, set when the host is chosen;
- browsers other than Chromium (Firefox, Safari): not installed where the tests run;
- phones.

## 3 · Hosting: AUDITED; PUBLISHING NEEDS ROBIN

[../../../hosting/RUNTIME_PUBLISHING.md](../../../hosting/RUNTIME_PUBLISHING.md) has the full account.

**Done:**
- The unpacked Pages output was audited.
- The runtime-only folder is prepared and browser-tested on its own: 625 files, 523,674,397 bytes.
- The voice site format and the offline package are built.
- Development evidence stays in the repository and is not published; nothing was deleted.

**The size guard** (VR-C1): `tools/publish/site_size.mjs`, a ceiling of 900,000,000 bytes, in `prepare_runtime.mjs`,
`voice_site.mjs` (the whole site folder, kept builds included) and the draft workflow before upload.

**Concrete blockers, Robin's to remove (the lead cannot):**
1. **The game's site.** It publishes the whole branch, about 1.07 GB, over the 1 GB limit. Switching Pages to the runtime-only workflow (draft: `docs/hosting/pages-runtime.workflow.yml`) is a Pages setting. The URL is unchanged.
2. **Where the voices are published.** The lead's recommendation is a same-origin Pages repository, for example `A-Birdi/Road-of-Borrowed-Names-voices`: about 665 MB, under its own 1 GB.
   - Creating that repository and enabling its Pages is Robin's.
   - The game then gets its base path (`HOSTED_BASE`) in a one-line change.
3. **Then the audio is published there.** The lead pushes nothing of the audio to this branch.

## 4 · The voiced offline package: BUILT AND TESTED (Chromium)

`node tools/publish/offline_package.mjs --site <voice site> --out <dir>` builds the package. It uses the same accepted recordings, the same files and the same site; opening its `index.html` from disk plays them. It is a separate delivery from the hosted game; the hosted game never needs it.

## 5 · Status note to Local: FR-1 (2026-10-17)

FR-1 (Robin's Foundations clarity pass, `docs/review/fr1/FR1_REPORT.md`) is UI and learning-path work. Local's current
voice batch stays pinned and running unchanged:

> FR-1 needs 0 new spoken lines. Existing reference audio is reused.
> No change to your batch inputs or accepted audio is requested.

What was checked: `node tools/voice/production_manifest.mjs --check` reports the manifest current (14,721 recordings and
9,095 reference readings, content `65cd38053ad6`), the same as before FR-1. `GO.json`, the production manifest, the
spoken script lines, speakers, readings and recording IDs are untouched. The two script edits FR-1 made are stage
directions on lines that already existed (`!lesson kana` → `!lesson kana for <challenge>` in `rw.m1_gears` and
`rw.m2_lantern`), in place, so no line number moved. The new UI wording (the summary, "Add character", the help
lines, the single-kana feedback, the lesson sheet) is written text only.
