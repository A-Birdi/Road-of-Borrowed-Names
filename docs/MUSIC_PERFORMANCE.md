# Music performance: Original and Ensemble (MT-1, MT-2)

Robin's MT-1 asks for a permanent choice of how the music sounds, **Original** (the game's own procedural score, the
default) or **Ensemble** (a recorded performance of the same score in the SC-1 instrumental treatment), with switching
in either direction that keeps the music's place, blends rather than cuts, and never makes the game wait.

MT-1 built the choice and two pilot recordings. **MT-2** (2026-10-13, C-92: Robin chose "All 115 now", Ogg Opus and MP3,
and to carry on with the TimGM6mb sound bank while deciding its rights) recorded every other song the same way; how it
differs from the pilots is under "MT-2" below.

This page describes what was built, how a recording is made and admitted, and what has and has not been checked.
The measured results are in `docs/music/ensemble/qa/<song>.json`; the record of what was tested is VALIDATION.md.

## For the player

- **Settings › Audio › Music performance: Original / Ensemble.** The control appears on the title's Settings, the
  Ledger's Settings and the battle's settings sheet (it is presentation only, so a battle allows it). It is offered
  only when the game has at least one recording.
- **A status line under it says what is actually playing**, which can differ from what is chosen: "Original playing",
  "Ensemble playing", "Original playing while Ensemble loads", "Ensemble selected · Original playing for this track",
  "… in this standalone copy", "… recording unavailable", "Music off · Ensemble remembered". With Ensemble chosen it adds
  how far Ensemble reaches: "Ensemble is available for every track." once every song has one (until then, "… for N
  tracks so far.").
- **Which songs have recordings:** the manifest's ready tracks (`assets/music/ensemble/manifest.json`). MT-1's pilots
  were `snowbell` (the Snowbell area) and `battle_keepers` (the Keepers' Road battle); MT-2 adds the rest. A song
  without a ready recording plays its Original whatever is chosen.
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
0.6 s. It is a complementary **equal-power** crossfade of 200 ms (sine and cosine) on all three gains: the recording's,
the Original's output and the room's return. Changes of mind retarget a fade from where its gains are (a gain at v
continues along the same curve from asin v), so the pair stays complementary. Repeated choices do nothing.
*MT-1 used a linear fade*, reasoning that the two performances, being the same score, are correlated. MT-2 measured
it: over 200 ms windows through the game graph the two are uncorrelated (Snowbell median correlation −0.01, the mill
+0.02, 5th–95th percentiles about ±0.5), so a linear fade sagged about 3 dB at its middle. Re-measured with the
equal-power fade, Snowbell's worst handover block went from 0.72 LU below both performances to 0.05 LU; Playhouse Row's
"Footlights" (`playhouse`), which failed MT-1's limit at 2.36 LU below, to 1.52. The 50 ms crossfades between a recording's own segments
stay linear: there the two sides are the same music.

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
emits it, and a recording arriving after its cue ended plays nothing. (MT-2) At a one-shot's natural end a sounding
recording plays out its own file, which holds the score's decay, as the Original's notes and room ring on; the room's
return reopens at once for what follows, and the decoded files are held until the file ends. Before MT-2 nothing
tested this (no one-shot had a recording) and the recording was cut at the score's end.

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

(MT-2: `tools/music/ensemble/produce.sh <song>` runs steps 1 to 4 for one song, with `stems.mjs` between 1 and 2.)

1. `node tools/music/ensemble/export_events.mjs` compiles the current score and fingerprints it. It also realises the
   first pass exactly as the Original player does: one seeded stream per song, in event order. For both pilots this
   is identical, event for event, to the performance SC-1 converted.
   (MT-2) `node tools/music/ensemble/stems.mjs` measures the Original's parts and its whole first pass in Chromium.
2. `python3 tools/music/ensemble/render.py` renders the SC-1 treatment at 48 kHz:
   - its voices (`rs1.py`, forked from SC-1's), its per-part gains (copied from SC-1's conversion logs for the pilots;
     measured against the Original's parts for MT-2), pans, sends, room, the game's echo (MT-2) and filters;
   - every note rendered once, from silence, and placed at its exact sample;
   - the steady cycle by circular placement, circular convolution and filters in steady state;
   - outputs `head.wav` and `loop.wav` (float, unfaded; a one-shot only `head.wav`, its guard faded) and `render.json`.
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

## MT-2: every other song (2026-10-13)

The same pipeline, generalised; the pilots render exactly as before (the generalised renderer gives the same samples
as MT-1's, bit for bit, run in the same session; both differ from the shipped pilot masters by −118 to −127 dB, which
is FluidSynth's run-to-run variation, not a change). `tools/music/ensemble/produce.sh <song>` runs one song through
every step; several run at once.

**Voices for what the pilots never used** (the lead's choice; nobody has heard them yet):

| The game's instrument or stroke | Ensemble voice |
|---|---|
| sho, glass, rin | SC-1's modelled sho, glass and rin |
| shinobue, flute, celesta, harp | TimGM6mb piccolo (a colour, not a shinobue), flute, celesta, harp |
| pluck (a guitar-ish plucked string) | TimGM6mb nylon guitar |
| bell, toll (FM bells) | TimGM6mb tubular bells |
| mallet (marimba-ish), keys (FM electric piano), choir | TimGM6mb marimba, electric piano, choir |
| koto_oshi (ato-oshi: plucked a tone low, pressed up) | the koto with the game's own bend (a tone, held 60 ms, risen over 130 ms) |
| low drum, big drum | SC-1's modelled ōdaiko (a little lower for the low drum) |
| taiko rim (fuchi), brush | SC-1's modelled wood click and brush |
| soft kick, hand tom, frame-drum snap, hand pat | TimGM6mb kick, low conga, high bongo, muted conga |
| shaker, woodblock, high woodblock, rim click, hyōshigi, chappa | TimGM6mb maracas, low and high wood block, side stick, claves, splash cymbal |
| clock tick, glass tick (the Hush's metronome), water drop, wooden creak, atarigane | the game's own synthesis, ported to the renderer |

**Part balance by measurement.** SC-1 balanced the pilots by measurement and then by ear. For MT-2 each part is set to
the Original part's level: `stems.mjs` renders the Original's first pass in Chromium with every track's strip tapped
before its pan, room and echo, and `render.py` gives the Ensemble part the same K-weighted level (BS.1770's filter,
over the same first pass). Checked on the pilots: the measured balance is within ±2.3 dB of SC-1's, part by part,
most parts within ±1 dB (the rest is SC-1's ear). The same render gives the whole Original through the game graph,
which the calibration then uses instead of rendering it again (they agree within 0.00001 LU).

**Room and echo.** Battles and bosses take SC-1's battle room (1.35 s, 0.14 wet), the Snowbell songs its Snowbell room
(1.85 s, 0.19), the rest rs1's default (1.7 s, 0.17). A score with an echo (`echo`, the tracks' `dl` sends) gets the
game's own: the same delay, feedback, 2.6 kHz low-pass in the loop and mix, applied exactly (circularly for the cycle).

**One-shot cues** (the prologue, the victory sting) are one file: the whole score and its decay, its guard faded to
silence (manifest layout `single_pass`, evidence `oneShotPlacementVerified` in place of the seam and repeat flags).
The runtime already played a non-looping entry's first file only.

**What verify.mjs adds for MT-2.**
- A cue under 32 s has its two handovers at its steadiest moments (MT-1's fixed 20.3 s and 26.4 s do not fit a 6 s
  sting; at a fixed time the check measured two different envelopes rather than the fade).
- The onset check has a negative control (the Ensemble's envelope read 100 ms late must fail) and a second detector.
  MT-1's 1 ms broadband frames also follow the ripple of sustained low notes, so on a slow cue its curve oscillates and
  its peak, though at the right lag, can stand out too little (the prologue: +1 ms, z 3.7). The band-flux envelope
  (energy above 400 Hz in three bands over 10 ms windows) finds the same lag clearly (the prologue: +1 ms, r 0.53,
  z 50). **The rule:** a detector passes when its peak is within 15 ms, r ≥ 0.03 and it stands 4 SD above every lag
  25–50 ms away; its control must not pass the same rule; either detector may pass. MT-1's other branch (peak ≥ 3× the
  correlation 40 ms away) is still recorded but no longer decides: on two sparse cues (sa_thin, cr_hut) it passed the
  controls themselves. Every report was judged again from its recorded measurements (`verify.mjs --rejudge-onsets`):
  no song that had passed failed.
- An MP3 whose length ends within 12 samples of an MP3 frame decoded up to 12 samples long (LAME's padding record was
  short; hall_w3's cycle): `render.py` gives such a file a few more samples of guard (`guard_extra`). An Opus file
  whose local check finds a window fitting 1 dB better shifted (the codec's phase in a high band) is encoded again at
  192, then 256 kbit/s (`package.py`; four files).
- The cached Original (`stems.mjs`) and verify's own render of the same first pass agree within 0.00001 LU and 0.00001
  in peak (five songs measured both ways).

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

## MT-2 results

From Chromium (Playwright's headless shell) on the development machine, not a device; every figure is in the song's
report. **114 of the game's 117 songs have a ready recording** (the two pilots and 112 of MT-2's 115). Over MT-2's
115 songs (74,630 notes, 465 MB of Opus and MP3; 473 MB with the pilots):

| Check | Result |
|---|---|
| Decoded length (48 kHz / 44.1 kHz) | exactly the master's frames / the same seconds |
| Alignment against the masters | no shift; coding SNR at no shift ≥ 19.9 dB (Opus), ≥ 27.8 dB (MP3) |
| The scheduler against its model | ≥ 154.1 dB (bit-exact), the cue's start through ten boundaries and odd starts |
| Seams | agreement ≥ 16.9 dB; no step larger than either side (ratio ≤ 1.0001) |
| First pass and cycle past the join (masters) | ≤ −125.8 dB apart |
| Cycle against the score's period | ≤ 0.156 ppm |
| Loudness through the game graph | within 0.1 LU of the Original (trims −13.71 to +5.56 dB); MP3 within 0.34 LU at the same trim; peaks ≤ 0.751 |
| Onsets | every song at z ≥ 4 with its control failing (69 on MT-1's envelope, 46 on the band flux) |
| Handovers (equal power) | median worst block 0.12 LU below both performances, 90th percentile 0.64 |

**Three songs play their Original:** `playhouse` (Footlights), `sb_road` and `sa_kasane` pass every check but the
handover level at one of the two moments measured: 1.52 and 2.31 LU below both performances alone (limit 1.5), and
1.04 LU above (limit 1.0). The recordings are not at fault: at that instant the two performances, the same notes on
different instruments, are partly out of phase (or in phase), which any fixed crossfade turns into a short dip (or
bump) for its 200 ms. The limits stay; whether to admit these three is Robin's to decide.

**Listening:** `docs/music/ensemble/listen_all.html` plays every recording's own files from the checkout, with
Original/Ensemble comparisons from the cue's start for ten songs (the main menu theme among them).

## What this is not

- **MT-2's recordings have not been heard by anyone.** Their voices for the new instruments and their balance were
  chosen and measured, not judged by ear. `docs/music/ensemble/listen_all.html` plays every recording from the
  checkout, with Original/Ensemble comparisons for ten songs; anything Robin hears wrong is a later round.
- **The pilots were listened to on the captures, not yet in the game.** Robin heard the excerpts on the captures page (the
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
