# Whole-game voice batch: run summary (local worker, Robin's PC)

2026-10-16 03:38 → 2026-10-18 11:13 (EDT). Generated from the `GO.json` inputs, recorded on Robin's PC, free and local
only. This folder holds the records, not the audio (VOICE_DELIVERY.md §9). The audio waits on Robin's PC until Robin
chooses where it is published.

## Inputs (pinned, never a moving branch)

| | |
| --- | --- |
| Go signal | `GO.json` at 5b6cebe |
| Source revision | `ff8a0fa87cfacb322b8c277305eddd9b4cc196fb` (`production_manifest.mjs --check`: "manifest is current: 14721 recordings + 9095 reference readings, content 65cd38053ad6") |
| Manifest | `docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz`, SHA-256 `513ec3fff9c8aa69f0874539757631a8c6feb56a8f789a23d3adcf0d6654ba66`, script content `65cd38053ad6…` |
| Supplement | `supplements/MW1_SUPPLEMENT.json` pinned at `5a8353c443b5eb6ccb1b99d81b83a415cdba3d3a` (identical at 1705cbd), SHA-256 `52e292f27aa2fa71f671f6c9a4c31b1df03a1439a645257ecf703c30d655bf2f`; recorded after the batch as it asks |
| Cast | Robin's locked cast (FINAL_CAST): narrator AivisSpeech ほのか; player A = P3A, B = P1B, each High/Low (±2 st); Nao 1A-High, Mio 3A-Low, Ren 3B-Low, Suzu 6A-High with the energy edit; 281 NPCs (250 Qwen reference-conditioned, 18 AivisSpeech, 12 Nemo, Mochi = H8 Heismark meow, public domain). Every reference's SHA-256 checked before anything started (256 of 256). The casting record is `casting` in the results. |
| Engines | AivisSpeech 1.2.0 and VOICEVOX Nemo 0.24.0 on loopback; Qwen3-TTS-12Hz-1.7B-Base @ `fd4b254389122332181a7c3db7f27e918eec64e3` on the GPU (RTX 3080), one engine at a time |

## Result

| | Count | Bytes | Hours |
| --- | ---: | ---: | ---: |
| **Delivery files (Ogg Opus 48 kHz mono, −20 LUFS, ≈58 kbit/s), all** | **23,823** | **552,138,662** | **20.63** |
| GO manifest: 14,721 recordings + 9,095 reference readings | 23,816 | 551,930,210 | 20.62 |
| MW1 supplement: 6 narrator lines + 1 reference reading (どすん) | 7 | 208,452 | 0.01 |
| Generated masters (lossless FLAC 24 kHz, kept on Robin's PC, not delivered) | 21,522 | 1,889,378,370 | |
| Failed | 0 | | |
| Pending | 0 | | |

Delivery files by role:

| Role | Files | Bytes | Hours |
| --- | ---: | ---: | ---: |
| Narrator | 4,797 | 143,649,034 | 5.45 |
| Reference readings | 9,096 | 59,432,008 | 1.98 |
| NPCs | 3,662 | 144,199,526 | 5.47 |
| Suzu | 2,250 | 72,932,202 | 2.75 |
| Ren | 1,121 | 44,145,042 | 1.67 |
| Nao | 1,182 | 38,044,766 | 1.43 |
| Mio | 1,079 | 35,828,288 | 1.35 |
| Player (A/B × High/Low) | 636 | 13,907,796 | 0.52 |

By engine: AivisSpeech 14,083 files (7.69 h), Qwen3-TTS 9,510 (12.64 h), Nemo 229 (0.31 h), sound 1.
Masters are fewer than files because one generation serves every file of the same text and voice: the player's High
and Low, and a companion line said in more than one delivery.

## Files

- `results.json.gz`: the batch results (`rbn.voice.results/1`, 10,659,519 bytes uncompressed; gzipped here to spare the
  Pages site). `gunzip -k results.json.gz` gives the `results.json` that `voice_site.mjs --results` reads.
- `results_MW1.json`: the supplement's results, same schema, with a `supplement` block naming the supplement, its
  pin and the 3 retired ids. Retired ids keep their files from the main results (§8.4); nothing was deleted.
- `POST_CHECK.json`: the technical checks below.

## Technical checks (all 23,823 files; not a listening review)

Each file: result present, file present, bytes and SHA-256 as recorded, decodes, duration as recorded, loudness and
peak, and length in proportion to its text. **All present, decoding and matching.**

- **Clean endings:** 350 takes needed a second or third seed to end cleanly; 131 still carry an edge flag
  (0.2–0.35 s of extra sound before or after the voice), for listening.
- **Quieter takes:** 120 takes sit between −21.5 and −24.5 LUFS with their peak at −1.0 dB: the levelling holds the
  peak ceiling before the loudness target, as designed. Not errors.
- **Short lines:** 14 short lines that open with 「……」 are 0.5–0.8 s; the trim removes the silent pause, as on every
  line. Not errors.

## What happened during the run

- **Runaway guard (2026-10-17 08:50).** One Qwen take ran past 40 minutes without ending: the model's own limit is
  8,192 frames, about 11 minutes of audio, up to three seeds. Qwen takes now carry a cap of 0.6 s per character + 6 s;
  a take reaching it is retried with the next seed and never kept. Verified: the same text and seed gave a
  bit-identical take with and without the cap, so every normal take is as it would have been. The guard caught that
  line again and one more since; the batch resumed on the same pinned inputs.
- **Length outliers redone (2026-10-18).** After the batch, 8 Qwen takes stood apart from all others: 7 ran 2.4–4.1×
  a normal pace (every other take is under 1.5×, effect tails included), and 1 was cut short. Each was regenerated
  with the next seeds and the cap. The old files and masters are kept in a `superseded` folder on Robin's PC, and each
  is listed under `superseded` in the results with its reason. Seven now fit their text.
- **One line reconciled, for listening:** `r1-6ab18b4d8dcef181` (wataru, 「……辞めさせないんですか。」) came out at about
  1 s on all 12 seeds tried.
  - **The fix (2026-10-18, SC1):** the lead's send correction keeps the id and sends 「やめさせないんですか。」
    (`supplements/SEND_CORRECTIONS.json` at fcacaf3, SHA-256 `0fbe5888…`; VOICE_DELIVERY.md §7 step 8).
  - **The new take:** all 12 seeds were clean, at 0.97–1.24 s, under the 1.43–1.93 s window, which is drawn from
    Wataru's median pace. The closest, 1.24 s, is kept, with `send`, `sendCorrection` and a flag in its result.
  - **Reading it:** the lengths are this consistent across seeds, so Wataru most likely says the whole line quickly
    rather than skipping words. Listening decides. The three earlier takes (0.94, 0.94 and 1.17 s) are kept in
    `superseded/` and are on the listening page beside it.
- **Pauses:** Robin paused the batch once (2026-10-17 18:53–19:12) to use the GPU; it resumed by exact input
  identity, with nothing remade.
- **Identity:** an early diagnostic on Mio's first 311 lines (speaker-embedding similarity to her approved takes:
  median 0.995, the same as her approved takes among themselves) showed no drift. Robin then chose to skip further
  identity diagnostics.
- Bounded checkpoints went to the lead's session at start, resume, the end of each phase, the pause and the
  supplement.

## Not in this batch (as GO.json says)

- The 116 lines with a run-time player name (C-93): a second small pass once their neutral-word versions exist.
- The 12 deferred C-95 findings: their lines are recorded as they are now.

## Merge check with the lead's site tool (local, scratch folder; nothing published)

`voice_site.mjs` at 4e3c661 (its exported `readResults`, `buildSite`, `writeSite` and `site_size.mjs`'s `measure`; the
command-line guard compares `import.meta.url` with `'file://' + argv[1]`, which never matches on Windows, so the CLI
exits silently there) built a site from `results.json` + `results_MW1.json` and the audio:
- **0 errors.** Every file's size and SHA-256 matched.
- 23,816 files: 13,897 lines and 9,095 references, with **0 missing recordings and 0 missing references** against
  the GO manifest.
- 7 results unused: the MW1 ids, which a manifest built at 6917fe0 or later will use.
- The voice folder came to **26,891 files, 557,980,768 bytes**: audio plus the site's index files. That is under the
  900,000,000-byte ceiling on its own, with 342,019,232 bytes of headroom before the rest of the site is counted.

## Size, before any audio is pushed

- The voice files total **552,138,662 bytes (552.1 MB)**, everything the site would need; as a built voice site,
  557,980,768 bytes (558.0 MB).
- GitHub Pages allows 1 GB per site. `voice_site.mjs` measures the whole site folder against 900,000,000 bytes.
  Whether the voices fit beside the game depends on the hosting audit (`docs/hosting/RUNTIME_PUBLISHING.md`).
- Nothing of the audio has been pushed. Robin decides where it is published once the size is confirmed.

## Review round 1 (Robin's listening, 2026-10-18)

Robin's decisions: 50 redo, 101 keep, the rest stands (`review_round1_decisions.json`). What was done (each replaced
take kept in `superseded/` on Robin's PC and listed under `superseded` in the results with its reason):
- **Narrator single words (35):** read straight, as Robin asked ('no need for real emotion there'): AivisSpeech
  intonation 0.6, tempo dynamics 0.8, no padding around the word; the best of 3 takes; a text-aware trim (below).
  `engineParams` and `trim` are in each result.
- **Send corrections (the lead's, SEND_CORRECTIONS.json at 3502f53):** SC2 (札 as ふだ) recorded at 1.82 s, in its
  window. SC3 (no comma before か) recorded at 3.62 s, the closest of 12 seeds (3.14–3.60 s), at the window's lower
  edge: without the comma the pause goes too.
- **Lighter reverb** (Robin: the Tide Clerk, the Gardener of Unsent Words and the Nameless Bridge, 'just a slight
  adjustment'): all 15 of their lines re-rendered from the kept masters (the same takes) with presets `hush_light`
  and `ancient_light`, about 30% shorter and 35% quieter reverb. The cast records the change, and `castingSuperseded`
  keeps the earlier record. The Kiln Warden and the Lord of the Understage are unchanged.
- **Abrupt endings (5):** the same seeds (the same performance) with the text-aware trim, which keeps a creaky or
  devoiced final syllable.
- **Other Qwen redos (6):** new seeds with a length-fit search. Uno's 「かわやへようこそ…」 needed a further 16-seed
  search (the 8-seed one ran away or misfit) and now fits at 3.49 s.
- **The MW-1 narrator line** 「石臼が…」: a new take.
- **A worker error, repaired:** a re-render run not given the send corrections remade Wataru's SC1 line with its old
  send. The kept take was re-rendered from its master: the same performance, 1.24 s, but not byte-identical, because
  the master is 24 kHz. The result says so (`restored`). The tool now refuses any run that is missing a recorded
  correction.

**The trim finding.** The first trim began at the first voiced frame whenever more than 0.20 s of sound came before
it, keeping 0.06 s. A strong opening fricative (the さ and は rows) was then cut: Robin's 'ふ is effectively silent'.
Under that threshold, a breath before a vowel was kept: the narrator's 'gasping'. The text-aware trim (`text/2`)
reads the line's first and last kana:
- a voiceless opening keeps up to 0.25 s before the voice;
- a voiced opening is cut close to the voice, which drops the breath;
- the end keeps a creaky (40 Hz floor) or devoiced final syllable.
`CLIP_SCAN.json` counts the delivered takes whose opening fricative was still sounding where the file begins: **1,196**
(1,082 narrator reference readings, 49 narrator lines, about 65 Qwen lines). Qwen's faint h/f openings were not
clipped. Robin is asked before any unmarked take is changed. Seven narrator samples are fixed for listening.

**Review round 2:** `REVIEW_LIST_round2.json` (72 takes, each beside the take it replaced). The page is built in the
batch folder with `review_page.mjs`. The technical checks pass on all 23,823 files.
