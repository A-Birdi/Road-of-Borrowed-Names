# Music performance: Original and Ensemble (MT-1)

Robin's MT-1 asks for a permanent choice of how the music sounds, **Original** (the game's own procedural score, the
default) or **Ensemble** (a recorded performance of the same score in the SC-1 instrumental treatment), with switching
in either direction that keeps the music's place, blends rather than cuts, and never makes the game wait.

This page describes what was built, how a recording is made and admitted, and what has and has not been checked.
The measured results are in `docs/music/ensemble/qa/<song>.json`; the record of what was tested is VALIDATION.md.

## For the player

- **Settings › Audio › Music performance: Original / Ensemble.** The control appears on the title's Settings, the
  Ledger's Settings and the battle's settings sheet (it is presentation only, so a battle allows it). It is offered
  only when the game has at least one recording.
- **A status line under it says what is actually playing**, which can differ from what is chosen: "Original playing",
  "Ensemble playing", "Original playing while Ensemble loads", "Ensemble selected · Original playing for this track",
  "… in this standalone copy", "… recording unavailable", "Music off · Ensemble remembered". With Ensemble chosen it adds
  how far Ensemble reaches: "Ensemble is available for two tracks so far."
- **Two tracks have recordings:** `snowbell` (the Snowbell area) and `battle_keepers` (the Keepers' Road battle).
  Every other piece plays its Original whatever is chosen.
- **The downloaded single file never needs them.** It plays Original, fetches nothing, and says so. Only a hosted copy,
  with the files beside it, plays Ensemble.

## How it works (src/audio/22_ensemble.js)

**One director, one clock.** A cue's clock is its Original player's: score time `e = ctx.currentTime − anchor0` on the
audio clock (a suspended context stops it; no wall time is added). Its place in the score is `e` in the first pass and
`L + ((e − D) mod (D − L))` after it (D the compiled length, L the loop start: Snowbell loops from zero, so its
introduction is in its repeat; the Keepers' battle from its third bar, so its introduction plays once).

**The Original stays warm.** While a recording sounds, the same Original player goes on, unheard: its notes, its seeded
variations, its loop count and its room. Its output gain is closed and so is the gate on the music room's return
(`g.revGate`), so none of its reverb escapes. Coming back reveals it mid-phrase: nothing restarts, no chord is cut and
no note is struck twice. Only the current cue is kept warm. The cost is measured (MT-T39, below).

**A handover is scheduled on the audio clock.** It happens at least 120 ms ahead, on the next beat if that comes within
0.6 s. It is a complementary linear crossfade of 200 ms on all three gains: the recording's, the Original's output and
the room's return. The two performances are the same score, so they are correlated: a linear fade keeps their sum, and
an equal-power one would bulge. Changes of mind retarget a fade from where its gains are. Repeated choices do nothing.

**The recording's layout.** Each format has two files:

- **a first pass**: from silence to a join `J`, past the longest tail of the introduction and of the cycle before, plus
  a guard;
- **one steady cycle** of the repeat `[L, D)`, rendered circularly so it holds the tails of the cycle before, with guard
  samples of its own end before it and of its own start after it.

After `J`, the first pass and the steady cycle are the same music (they agree to −144 dB in the masters). So the cue
goes over to the cycle there. Each cycle is its own source, started on the score's cycle boundary and crossfaded over
50 ms with the one before, on matching phases: the guard after a cycle is the start of the next.

- **Why separate sources:** this keeps the score's rhythm exact, so no cycle drifts from the Original's clock. It also
  means a lossy codec's two renderings of the same instant are blended, not butted (a wrap inside one buffer would jump
  between two coding-noise patterns).
- **Frame-aligned starts:** start times are put on the context's frame grid and the offset is moved to match. Chromium
  reads a source started between frames by interpolation for its whole length (measured with a ramp buffer), which
  would dull the top of the Keepers' cycle, whose period is not a whole number of frames.
- **Silent from creation:** an incoming segment's gain is zero from the moment it is made, not only from its fade's
  first automation event. In Chromium an event on the very frame a source starts let that one frame through at full
  level: a one-sample tick at a seam, found by the browser suite (MT-T19) and fixed before the final measurements.

**Routing.** The recording enters the music bus before the user's music volume, the speech ducking and the master
chain, as the Original does. It carries its own room (SC-1's) and never reaches the game's room, so nothing is
processed twice. Its trim is calibrated through the game's own graph (below).

**Loading never holds anything up.** Original sounds at once; the recording replaces it only when it is decoded, still
wanted and still the same cue (a generation check after every wait). Nothing is fetched:

- for Original;
- with music off or muted;
- for a song without a ready recording;
- in a standalone file.

**Each file is checked before use.** It must be:

- same-origin, inside `assets/music/ensemble/`, page-relative, with a known extension, and free of traversal, encoded
  separators, query or fragment;
- fetched with `redirect: 'error'`, size-capped while it is read (24 MiB), then SHA-256 checked;
- decoded and measured: two channels, the stated length, finite and not silent.

**Failures fall back.**

- A failed format falls through to the next format (Opus, then MP3).
- A failed cue retries once; then it keeps Original and says so.
- Files that fail twice cool down for five minutes.
- Decoded music is kept within 128 MiB, least recently used first, and never while a cue holds it.
- A recording of a different score (by fingerprint) is refused before anything is downloaded.

**Completion stays the sequencer's.** A one-shot's `audio:songend` is emitted once, by the Original. Nothing here
emits it, and a recording arriving after its cue ended plays nothing.

## The catalog and the page's policy (tools/build.mjs)

The authoring manifest is `assets/music/ensemble/manifest.json`, in MT-1's schema. The build embeds a track as
`RB.audio.ensembleCatalog` only if all of the following hold (`tools/music/ensemble/manifest.mjs`):

- it is `ready`;
- its score fingerprint (`mt1-score-v1`) is the current build's, so a stale recording stays out;
- its timeline is the score's;
- every evidence flag is true and names a report;
- its mix profile is the pre-master music bus with its gain and room stated;
- its files exist, at their stated sizes and hashes;
- its first-pass and steady-loop alternatives pair up by type;
- its cycle is the score's period within 50 ppm.

Only when at least one track is embedded does the page's CSP change, from `connect-src 'none'` to `connect-src
'self'`. The recordings themselves are never embedded.

## Making a recording (tools/music/ensemble/)

Development tools only; none of them ships. They need Python with NumPy, SciPy and soundfile, the system FluidSynth
library, the TimGM6mb sound bank, FFmpeg (libopus, libmp3lame), and the repo's Playwright Chromium.

1. `node tools/music/ensemble/export_events.mjs` compiles the current score and fingerprints it. It also realises the
   first pass exactly as the Original player does: one seeded stream per song, in event order. For both pilots this
   is identical, event for event, to the performance SC-1 converted.
2. `python3 tools/music/ensemble/render.py` renders the SC-1 treatment at 48 kHz:
   - its voices (`rs1.py`, forked from SC-1's), its per-part gains (copied from SC-1's conversion logs), pans, sends,
     room and filters;
   - every note rendered once, from silence, and placed at its exact sample;
   - the steady cycle by circular placement, circular convolution and filters in steady state;
   - outputs `head.wav` and `loop.wav` (float, unfaded) and `render.json`.
3. `python3 tools/music/ensemble/package.py` encodes Ogg Opus (about 160 kbit/s) and MP3 (192 kbit/s), byte for byte
   reproducibly. It names each file by its content and checks it locally against the master with FFmpeg's decoder.
4. `node tools/music/ensemble/verify.mjs` (built page via `RB_PAGE`) measures in Chromium:
   - every file decoded at 48 and 44.1 kHz, with its alignment and coding error;
   - the game's own scheduler, against a model of the decoded files, from the cue's start through the join and the
     first ten cycle boundaries, and from odd starting points;
   - the trim, calibrated through the game graph so the recording's integrated loudness over the first pass equals
     the Original's within 0.5 LU;
   - the onsets of the two performances, which must line up;
   - each handover's momentary level, against each performance alone.

   It writes `docs/music/ensemble/qa/<song>.json` and the manifest. A track becomes `ready` only if a format passes
   everything and the provenance notice is in place.
5. `node tools/build.mjs`, then the unit and browser tests.

A future track is added the same way. Its song id needs no change to any story script.

**Testing scope (Robin's C-88).** Both performances are tested by MT-1's own suite, its unit test, the recordings'
measurements and the audio suites. The twelve-chapter chain and the full matrix run at the default, Original, and
are not repeated with Ensemble.

## Results

See the table in VALIDATION.md (MT-1) and the reports. In summary, from Chromium (Playwright's headless shell) on the
development machine, not a physical device:

| | Snowbell | Keepers' Road battle |
|---|---|---|
| Score (D, L) | 94.5 s, loops from 0 | 71.579 s, loops from 4.211 s |
| Fingerprint | `sha256:d51d59d9…` (= SC-1's) | `sha256:2c3ef95b…` (= SC-1's) |
| First pass realised | 515 events, identical to SC-1's | 1,434 events, identical to SC-1's |
| Join J (first pass → cycle) | 6.0 s | 9.711 s |
| First pass and cycle past J (masters) | −144.0 dB apart | −144.7 dB apart |
| Cycle against the score's period | 0 ppm (exactly 4,536,000 frames) | −0.065 ppm (3,233,684 frames) |
| Files (Opus / MP3) | 0.16 + 2.32 MB / 0.16 + 2.29 MB | 0.24 + 1.47 MB / 0.25 + 1.64 MB |
| Decoded at 48 kHz / 44.1 kHz | exactly the masters' frames / the same seconds (±2 frames) | the same |
| Alignment against the masters | no shift at any window; coding SNR ≥ 23.7 dB (Opus), ≥ 28.0 dB (MP3) | no shift; ≥ 24.7 dB, ≥ 29.8 dB |
| The scheduler against its model | ≥ 157 dB (bit-exact) | ≥ 158 dB (bit-exact) |
| Join and boundaries 1–10 | no larger sample step than either rendering alone (ratio ≤ 1.00) | ratio ≤ 1.00 |
| Integrated loudness through the game graph | Original −19.99 LUFS, Ensemble −20.01 (+2.97 dB trim); MP3 −20.25 | Original −17.41, Ensemble −17.50 (+4.03 dB); MP3 −17.71 |
| Onsets, Ensemble against Original | +3 ms | +4 ms |
| Handover level (400 ms blocks against each performance alone) | at most 0.72 LU below both, never above | at most 0.36 LU below both, never above |
| Peak through the game graph | 0.53, no clipped sample | 0.66, none |

**The warm Original's cost (MT-T39, offline, 30 s of music at 48 kHz):** Snowbell 6.5 s to render the Original
alone, 7.3 s with the recording over it (×1.13); the Keepers' battle 19.9 s and 19.5 s (×0.98). The recording alone
takes 0.6–1.1 s. The extra work is a few buffer sources and gains; the Original's own synthesis dominates either way.
This is offline rendering on the development machine, not a measurement of a phone's audio thread. **Memory:** the
two pilots decoded at 48 kHz hold about 66 MiB (Snowbell 37.4, Keepers 28.8), within the 128 MiB budget; at 44.1 kHz
about 8 % less.

The scheduler model is how Chromium reads a source, measured with a ramp buffer: the offset is rounded to a frame,
and a start between frames is honoured by interpolation. The runtime therefore starts every segment on a frame.

## What this is not

- **Listened to on the captures, not yet in the game.** Robin heard the excerpts on the captures page (the
  game's own code rendering both performances through its graph; `docs/music/ensemble/listen.html`) on 2026-10-12:
  "It sounds great, nice job". That covers how the recordings and the switches sound in those excerpts. Hearing them
  in the game itself, on Robin's own device, is still to come.
- **Not device-tested.** Only Chromium on Linux was used. Opus decoding in Safari, MP3 gapless handling elsewhere, and
  phones are untested. A browser that decodes a file to another length is refused by the length check and falls to the
  next format or to Original.
- **Not deployed.** The hosted page is updated only after the whole project's gate (C-87). Its deploy must copy
  `assets/music/ensemble/` beside the page and keep files an older page still names.
- **The rights question is open.** The sampled voices come from TimGM6mb (GPL-2). `assets/music/ensemble/NOTICE.md`
  records the provenance and the retained notices. No licence is chosen for the recordings, and whether distributing
  them carries obligations is for Robin.
- **A recording repeats itself.** The Original draws fresh small variations of timing and velocity each cycle; the
  recording repeats its first-pass realisation. The notes, rhythms and form are the same.
