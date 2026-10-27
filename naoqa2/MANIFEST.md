# Nao QA2 portable checkpoints

## Current checkpoint: actual-file restore proof PASSED (11/11)
- File: `naoqa2/current.json`, unchanged supported QA export.
- File UTF-8 bytes: 550336; SHA-256: `6e53b369f12a110a467d341350293ba02ee1a70eb9fa502caf5198fca704e06c`.
- Payload UTF-8 bytes: 494075; SHA-256: `157666d38c3aadc21fe183096dc60ffc2dd7fe81fdaac0101af360c484f2570a`.
- Exported at 2026-10-27T05:01:47.957Z; source slot 7; label: Nao QA2 Nao departure 2026-10-27 0449 UTC.
- Format road-qa-save, fv 1, gameVersion 0.1.0, saveSchema 1.
- Campaign `mvq1txabomytlq`, player Nao QA2 (courier, they), consistent across all five records.
- Manual 2026-10-27T04:49:38.688Z: `rw.road` (26,9), playtime 9197.6599 seconds (153m18s), companion `nao`, provisional null. Flags `departed`, `comp_nao`, `ch1_done` true. Numeric state chapter remains 0; the chapter-one-complete claim is based on the flag, not numeric chapter.
- Autos (2026-10-27 UTC): 04:32:06.286 `rw.hall` (5,8), no companion; 04:35:06.124 `rw.hall` (5,6), no companion; 04:48:06.749 `rw.road` (26,9), companion nao.
- Predeparture 04:43:09.142 UTC: `rw.hall` (3,2), companion null, provisional nao; this is the game's retained predeparture state.
- Exactly one manual, three autos and one predeparture; no suspend.
- Actual-file restore proof: Claude Local [CL-467](https://github.com/A-Birdi/Road-of-Borrowed-Names/issues/1#issuecomment-6434240536), 2026-10-27 05:05–05:06:00 UTC, reported **11/11 PASS** on this exact file from `069d87f87ffbd6a66c669f4a86007ff9f0505c60`.
- Scope: disposable Windows headless-Chromium context on the live origin; initial IndexedDB slots empty/current slot null; restored through the published QA API into empty slot 9. Before any Load, re-export reproduced the exact payload bytes/hash across all five records, including the companion field and predeparture state. Restore retained the campaign ID, left no `rbn-slot-*` lock held and left the current slot unchanged.
- Separate ordinary Load entered playing mode in slot 9 at `rw.road` (26,9), with flags, quests and vars identical, and normally advancing playtime (9198.9 seconds). **The post-Load check did not separately assert `comp`; companion preservation is covered by pre-Load byte equality only.**
- The live page was first verified HTTP 200, 24418832 bytes, SHA-256 `ba1c35ecf30bc6adb61d0260c5afe28bc960db8b1398fffcaa114af68eec40fe`. Zero page errors and no other-origin requests were reported. The disposable context was closed; no active/user save or managed-browser profile was touched.
- This is actual-file API restoration plus ordinary Load evidence, not native file-picker/UI replay. Future restorations must still use an empty disposable slot and verify re-exported payload before Load. Do not overwrite active/user saves.

## Previous checkpoint: restore proof PASSED
The former current file is retained unchanged at `naoqa2/previous.json`. Its verified details and proof follow; that proof applies only to previous.json, not the new current.json.

### Previous proof
Actual-file restore proof: **PASSED, 11/11 checks**, reported by Claude Local in [CL-463](https://github.com/A-Birdi/Road-of-Borrowed-Names/issues/1#issuecomment-6433743697), 2026-10-27 04:25–04:26:29 UTC.

The exact current.json from backup commit `fe3683a3fc1c60cdce5ffbb43b7d103d34b02788` was independently hash-checked and restored using the published QA API into empty slot 9 on the live origin in a disposable Windows headless-Chromium context (all 20 slots initially empty). Re-export before any Load reproduced the exact payload bytes and SHA-256 across all four records. A separate ordinary `RB.game.loadCampaign(9, 'manual')` check entered playing mode at `rw.village` (31,17), with flags, quests and vars identical; playtime advanced normally from 7475.1 to 7476.0 seconds.

Restore left the current slot null and held no `rbn-slot-*` lock. The proof reported zero page errors and no other-origin requests. The disposable context was closed after the checks; no active or user save was touched. The live page was first verified as 24418832 bytes with the source-build hash below. Scope: an actual-file API restore and ordinary Load proof in headless Chromium, not a native managed-browser file-picker/UI replay or recovery of the old Nao QA profile.

Cloud's independent [CC-331 integrity check](https://github.com/A-Birdi/Road-of-Borrowed-Names/issues/1#issuecomment-6433747791) also matched both hashes and passed the published `RB.save.qa.check()` with zero errors; it was not a second restore.

Future restorations must still use an empty slot in a disposable isolated profile, compare re-exported payload bytes/hash before Load, then verify the loaded checkpoint. Do not overwrite the active playthrough.

### Previous file
- Path: `naoqa2/previous.json` (unchanged downloaded QA-only envelope)
- File bytes (UTF-8): 340251
- File SHA-256: `988893f9b93c0bc5785da8d3829087fc1e2b7ab0790baf9507249906ed9fdf63`
- Payload bytes (UTF-8): 304687
- Payload SHA-256: `035de583e26e67de453e8b2394291e03067742bde24ba470626f2b074a5c0092`
- Envelope: road-qa-save, format version 1; gameVersion 0.1.0; saveSchema 1.
- Exported at: 2026-10-27T04:18:03.003Z; source slot 7.
- Label: Nao QA2 post-bridge Reedwake 2026-10-27 0415 UTC.
- Campaign ID: `mvq1txabomytlq`; player Nao QA2, courier, they.
- Manual: 2026-10-27T04:15:37.104Z, `rw.village` (31,17), approximately 124m35s.
- Autos: 03:59:22.546Z `rw.mill2` (7,2); 04:00:55.396Z `rw.mill1` (2,4); 04:14:07.254Z `rw.village` (31,17), all 2026-10-27 UTC.
- Exactly one manual and three autos; no predeparture or suspend record.
- Post-bridge Reedwake progression; companion and provisional companion are null in all four records. This is the fresh Nao QA2 campaign, not recovery of the old inaccessible Nao QA save.

## Source build (both checkpoints)
- Published task commit: `0c6d602c17327c9c154d4be8a83322c20cb26eb5`.
- Live index.html: 24418832 bytes; SHA-256 `ba1c35ecf30bc6adb61d0260c5afe28bc960db8b1398fffcaa114af68eec40fe`.
- Published build independently checked 2026-10-27 before export. Pages run 40447545214 succeeded for this commit.


## Privacy and retention
Both envelopes were recursively inspected, including all nested keys/string values and the new checkpoint's differences from the previously inspected file. Only intended game-save data was detected: game dialogue/history, progression, learning/practice data and the QA character. No credentials, cookies, browser profiles, unrelated personal data, URLs, email addresses or file paths were detected. This is not a guarantee against every conceivable secret encoding. Historical Hana wording retained in the save backlog is game dialogue, not an instruction or new content correction.

Keep only these stable current and previous checkpoint files plus this manifest. Rotate only at meaningful milestones; no per-export duplicates. No task/Pages ref, product file or history rewrite is part of this backup. Ordinary Git history retains prior committed versions; file removal does not erase history.
