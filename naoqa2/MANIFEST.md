# Nao QA2 portable checkpoint

## Status
Actual-file restore proof: **PASSED, 11/11 checks**, reported by Claude Local in [CL-463](https://github.com/A-Birdi/Road-of-Borrowed-Names/issues/1#issuecomment-6433743697), 2026-10-27 04:25–04:26:29 UTC.

The exact current.json from backup commit `fe3683a3fc1c60cdce5ffbb43b7d103d34b02788` was independently hash-checked and restored using the published QA API into empty slot 9 on the live origin in a disposable Windows headless-Chromium context (all 20 slots initially empty). Re-export before any Load reproduced the exact payload bytes and SHA-256 across all four records. A separate ordinary `RB.game.loadCampaign(9, 'manual')` check entered playing mode at `rw.village` (31,17), with flags, quests and vars identical; playtime advanced normally from 7475.1 to 7476.0 seconds.

Restore left the current slot null and held no `rbn-slot-*` lock. The proof reported zero page errors and no other-origin requests. The disposable context was closed after the checks; no active or user save was touched. The live page was first verified as 24418832 bytes with the source-build hash below. Scope: an actual-file API restore and ordinary Load proof in headless Chromium, not a native managed-browser file-picker/UI replay or recovery of the old Nao QA profile.

Cloud's independent [CC-331 integrity check](https://github.com/A-Birdi/Road-of-Borrowed-Names/issues/1#issuecomment-6433747791) also matched both hashes and passed the published `RB.save.qa.check()` with zero errors; it was not a second restore.

Future restorations must still use an empty slot in a disposable isolated profile, compare re-exported payload bytes/hash before Load, then verify the loaded checkpoint. Do not overwrite the active playthrough.

## Current file
- Path: `naoqa2/current.json` (unchanged downloaded QA-only envelope)
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

## Source build
- Published task commit: `0c6d602c17327c9c154d4be8a83322c20cb26eb5`.
- Live index.html: 24418832 bytes; SHA-256 `ba1c35ecf30bc6adb61d0260c5afe28bc960db8b1398fffcaa114af68eec40fe`.
- Published build independently checked 2026-10-27 before export. Pages run 40447545214 succeeded for this commit.

## Privacy and retention
Full nested envelope/payload inspection found intended game-save data only: game progression, dialogue history, learning/practice data and the QA character. No credentials, cookies, browser profile, unrelated personal data, URLs, email addresses or file paths detected. All four records have the same campaign ID and chronological progression. This inspection is not a guarantee against every conceivable secret encoding.

Keep stable current and, when a second meaningful checkpoint replaces it, previous files only. There is no previous.json yet: this is the first checkpoint. Do not add per-export copies, screenshots, browser profiles or credentials. Changes on this backup branch must not change task/Pages refs or rewrite history. Ordinary Git history retains prior committed versions; removing a current file is not history erasure.
