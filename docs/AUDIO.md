# Audio — procedural music, effects and optional Japanese voice

Everything is generated at runtime with the Web Audio API: no samples, no
network, no libraries. Source: `src/audio/`. Spec: SPECIFICATION.txt §17.

## Architecture

| file | contents |
|---|---|
| `10_synth.js` | context lifecycle, mix graph, 13 instruments, 16 percussion voices, public `init/ready/setVolume/setMuted/duck` |
| `20_sequencer.js` | notation compiler + validator, `Player`, 25 ms lookahead scheduler, `playSong/stopSong/currentSong/songList/motifList/renderOffline` |
| `30_songs.js` | the 33 songs + shared motifs; **the notation is documented in this file's header** |
| `40_sfx.js` | 44 effects, `sfx(id, {pitch, vol})`, rate limiting and a voice cap |
| `50_voice.js` | `RB.voice`: local-only Japanese speech synthesis |

**Mix graph** (built identically for live and offline contexts):

```
per-song strips (gain → pan) → song fade gains ─┬─→ music bus → duck ─┐
                         └→ reverb send ─→ 3 s room ─┘                 ├→ master → HP 28 Hz → shelf −4 dB @ 6.5 kHz
effects → sfx bus (+ 1.5 s room) ─────────────────────────────────────┤   → glue compressor → trim → limiter
voice bus (reserved) ─────────────────────────────────────────────────┘   → soft-clip shaper (max 0.99) → out
```

The compressor is gentle (−16 dB, 2.5:1). The limiter and the tanh soft-clip
stage mean nothing can hard-clip. Reverb impulses and noise are generated
deterministically from a seeded PRNG.

**Scheduling.** The song compiler turns notation into a sorted event list in
seconds. One `setInterval(25 ms)` tick schedules every event due within
0.2 s of `AudioContext.currentTime`, so timing follows the audio clock rather
than frames. If the tab stalls, late events are dropped rather than played in
a burst. Songs loop sample-accurately (`loopFrom` lets an intro play only
once). `playSong` crossfades two players on independent gains and does nothing
if the same song is already playing. Non-looping cues (`prologue`, `victory`)
end on their own, clear `currentSong()` and emit `audio:songend` on `RB.bus`.

**Lifecycle.**
- Nothing is created at load time. `init()` is called from a gesture; it is idempotent and cheap to repeat.
- `playSong` requested before init is remembered and starts on init.
- `sfx` calls made before init, or while the context is suspended, are dropped rather than queued.
- A context the browser leaves `suspended` or `interrupted` (autoplay, iOS calls, device switch) is resumed on the next pointer/key/touch gesture.
- On `devicechange` it tries to resume.
- When the tab is hidden the context is suspended, and resumed when visible (`setPauseWhenHidden(false)` disables this).
- Without Web Audio every call is a no-op and `renderOffline` resolves `{unsupported:true}`.

**Instruments.** All are small subtractive, FM or additive voices with envelopes:
- `pluck`, `harp`
- `bell` (FM 3.5:1), `celesta` (FM 4:1), `toll` (deep FM), `glass` (beating sines)
- `flute` (sine/triangle with a pitch scoop, delayed vibrato and band-passed noise breath)
- `bowed` (detuned saws, opening low-pass)
- `bass`, `pad`, `keys` (1:1 FM), `mallet`, `choir` (formant band-passes)

Percussion is noise- or sine-based:
- kick, tom, low drum, shaker, brush, hand pat
- woodblocks, rim, clock tick, glass tick
- water drop, wooden creak, small bells
- big drum and frame-drum snap (the boss theme's weight)

## Motifs

Motifs are spelled in scale degrees. Tests confirm each song quotes the motifs
it claims by matching their diatonic contour, which works in any key or mode.

| motif | degrees | idea |
|---|---|---|
| road (main theme) | `5, 3 2 1 2` | a rising sixth and a stepwise fall that turns back up: setting out, looking back, going on |
| hush (antagonist) | `5, 1 2 3 ♯4` | the road motif's own pitches **sorted into order and evened out**, left hanging on a lydian raised 4th. In the finale it returns with a natural 4th and resolves instead of erasing. |
| Nao | `1 1 5 4 3 4 1` | two quick knocks, a glance up, a wry sidestep: a courier checking exits |
| Mio | `3 2 3 5 3 2 3` (→1) | a symmetrical figure set straight like labelled bottles, closing firmly |
| Ren | `5, 1 4 5 1′ 7 1′` | fourths climbing like a lamplighter, then a small turn that is almost a joke |
| Suzu | `1 1′ 7 ♭7 6 5` | a flourish up an octave and a sly chromatic slide down: a performer's bow |

## Songs

Lengths come from the compiler. "Loop" is the repeating span. Arrangement
notes for each song are in `30_songs.js` and in `RB.audio.songList()`.

| id | title | key / mode | bpm | meter | length | loop | motifs |
|---|---|---|---|---|---|---|---|
| `title` | Lanterns at Dusk | D ionian | 66 | 4/4 | 102 s | 87 s | road |
| `prologue` | The Name That Went Out | D ionian→lydian | 60 | 4/4 | 48 s | no | road, hush |
| `reedwake` | Reedwake — Mending Day | G ionian | 96 | 6/8 | 94 s | 94 s | road |
| `reedwake_night` | Reedwake — Lamps on the Water | G ionian | 72 | 6/8 | 80 s | 80 s | road |
| `road` | The Road of Borrowed Names | D ionian | 84 | 4/4 | 149 s | 137 s | road |
| `mill` | The Mill That Calls Back | A dorian | 108 | 3/4 | 83 s | 83 s | road |
| `battle` | Inkweaving | E aeolian | 100 | 4/4 (3+3+2) | 82 s | 82 s | road |
| `boss` | A Promise Held Too Tightly | C aeolian + ♭2 | 138 | 4/4 (3+3+2) | 73 s | 70 s | road, hush |
| `victory` | Victory Sting | D ionian | 120 | 4/4 | 6 s | no | road |
| `saltglass` | Saltglass Harbour | F ionian (swing) | 104 | 4/4 | 97 s | 97 s | road |
| `drowned_archive` | The Drowned Archive | E aeolian | 66 | 4/4 | 116 s | 116 s | road, hush |
| `cinder` | Cinder Orchard Festival | A mixolydian | 112 | 4/4 | 88 s | 88 s | road |
| `kiln` | The Sealed Kiln | E phrygian / lydian | 84 | 4/4 | 91 s | 91 s | hush |
| `snowbell` | Snowbell | F ionian | 80 | 3/4 | 95 s | 95 s | road |
| `observatory` | The Observatory | C lydian | 72 | 4/4 | 107 s | 107 s | road |
| `quiet_road` | The Quiet Road | B♭ ionian | 70 | 4/4 | 110 s | 110 s | road |
| `lanternfall` | Lanternfall | C ionian / lydian | 96 | 4/4 | 100 s | 100 s | road, hush |
| `belltower` | The Submerged Bell Tower | D dorian | 60 | 4/4 | 96 s | 96 s | road, hush |
| `hush` | The Hush | F lydian | 60 | 4/4 | 96 s | 96 s | hush, road |
| `still_archive` | The Still Archive | B aeolian / lydian | 80 | 4/4 | 96 s | 96 s | road, hush |
| `finale` | Which Promises We Keep | D aeolian → ionian | 92 | 4/4 | 104 s | 104 s | road, hush |
| `ending` | What the Lanterns Kept | D → E ionian | 66 | 4/4 | 116 s | 116 s | road |
| `credits` | Borrowed Names, Returned | medley | 84/96/80 | mixed | 124 s | 124 s | road + all four companions |
| `atlas` | The Unwritten Atlas | A mixolydian | 104 | 7/8 (2+2+3) | 85 s | 85 s | road |
| `departure` | The Departure Room | D ionian | 72 | 4/4 | 107 s | 107 s | road + all four companions |
| `inn` | The Inn at the Crossing | B♭ ionian (swing) | 88 | 4/4 | 87 s | 87 s | — |
| `mystery` | Something Doesn't Add Up | B dorian | 92 | 4/4 | 83 s | 83 s | road (scattered) |
| `companion_nao` | Nao — The Letter Not Delivered | A dorian | 108 | 4/4 | 53 s | 53 s | Nao |
| `companion_mio` | Mio — Labels in Neat Rows | F ionian | 84 | 4/4 | 69 s | 69 s | Mio |
| `companion_ren` | Ren — A Lamp Polished Too Carefully | E♭ ionian | 76 | 4/4 | 76 s | 76 s | Ren |
| `companion_suzu` | Suzu — The Comfortable Lie | G ionian | 96 | 6/8 | 60 s | 60 s | Suzu |
| `sorrow` | Sorrow | D aeolian | 58 | 4/4 | 99 s | 99 s | road (falling) |
| `wonder` | Wonder | E♭ lydian | 76 | 4/4 | 76 s | 76 s | road (lydian) |

**Design choices.**
- **Hush-touched places** (the Hush theme, the town of Lanternfall, the kiln, the bell tower, the Still Archive) share a colour: the lydian raised 4th over open fifths, strictly even rhythm, glass tones and a glass tick. Everywhere else, the modes carry mood: dorian for curiosity (mill, mystery, Nao), phrygian for the kiln's heat, mixolydian for festival and expeditions.
- **Battle** music keeps a steady, non-accelerating 3+3+2 pulse. This suits the untimed combat: it adds tension without urgency.
- **Loop lengths.** Area themes loop for 76–137 s and rotate instrumentation between repeats. Companion themes loop for 53–76 s.

## Effects

- **Movement:** `step` `step_snow` `step_wood` `footstep_grass` `bump` `door`
- **Interface:** `confirm` `cancel` `cursor` `text_blip` `menu_open` `menu_close` `page` `save` `quest_update`
- **Writing:** `pen_down` `pen_stroke` `pen_up`
- **Recognition:** `recog_ok`, and `recog_unsure` (a neutral rising second: a question, not a judgement)
- **Answers:** `answer_right`, and `answer_wrong` (a soft falling mallet third: never a buzzer)
- **Inkweaving:** `ward` `water` `wind` `light` `fire_out` `reveal` `heal` `knot_untie` `enemy_intent` `enemy_hit` `party_hit` `harmony_ready` `technique`
- **World:** `discover` `item_get` `lantern` `bell` `splash` `chest` `levelup` `defeat` (a gentle falling line) `flee`

`pitch` is in semitones and `vol` is a 0–2 multiplier. Each effect has a
minimum retrigger gap (e.g. 35 ms for `text_blip`), and at most 24 effects
sound at once.

## Voice (`RB.voice`)

- **Local voices only.** It uses only voices with `localService === true` and a `ja*` language, and always sets `utterance.voice` explicitly, so a browser default (possibly a network voice) is never used silently. With no local Japanese voice, `speak()` returns `false`, `onend({spoken:false})` still fires, and `status().note` explains the situation for settings.
- **No overlap.** `speak()` cancels any previous utterance first. Music is ducked while speaking. The rate is clamped to 0.5–1.5 and `pitch` to 0.5–1.5. Utterance volume = master × voice (0 when muted), and muting cancels speech.
- **Honest labelling.** The note labels this as device text-to-speech, not recorded voice acting, and not a pronunciation reference.

## Tests and results

Run on 2026-09-26 in this container: Node 22, Playwright Chromium 1194 headless.

- **`node tests/run-unit.mjs audio` (U):** 978 checks pass. What they cover:
  - every required song and sfx id exists, and every song compiles;
  - bar lengths are checked; no zero-length sections;
  - note ranges per instrument; every declared track is used; compilation is deterministic;
  - area loops ≥ 60 s, companion/scene loops ≥ 40 s, prologue 30–60 s, victory ≤ 10 s;
  - every claimed motif is actually quoted;
  - a harmony lint (below);
  - 15 negative cases that prove the validator rejects malformed notation;
  - `RB.voice` against a mocked `speechSynthesis`: local-only, cancel-before-speak, ducking, clamping, mute, notes.
- **Harmony lint:** fails on any melody note held ≥ 1.5 beats a semitone above a chord tone, or a tritone above the root. Only intentional cases are allowed: the Hush's raised 4th over open fifths, and the sorrow B-section sigh. While composing, the lint found about a dozen real clashes, which were fixed.
- **`node tests/e2e/audio.check.mjs` (B, built `index.html`):** all checks pass.
  - **Songs:** every song is rendered offline through the real mix graph, 8 s from the start plus 6 s from mid-song (65 renders; the 6 s sting gets one). No NaN, no full-scale samples. Peak ≤ 0.453 after the limiter (raw pre-dynamics peak ≤ 0.446, so the dynamics stage is barely working). The longest near-silent stretch is 0.85 s. Loudness is −18.6 to −30.3 dBFS RMS (median of opening windows −22.3); the quietest windows are the title/road intros.
  - **Effects:** all 44 render, with peaks from 0.026 (`pen_up`, deliberately faint) to 0.419 (`levelup`).
  - **Live:** after a real click, the context runs and an AnalyserNode sees signal while `road` plays. Crossfade to `battle` works; same-id `playSong` is a no-op; sfx fire and are rate-limited; mute silences output (peak < 1e-4). A simulated hidden tab suspends the context and it resumes when visible. `stopSong` clears the current song, and `victory` ends by itself.
  - **Voice:** headless Chromium lists no voices. `status()` explains this and `speak()` refuses.
- **Mix balance:** measured with `renderOffline(id, s, {solo:[track]})`. Leads sit 5–10 dB above pads, and the bass is loud in RMS but well below the lead once A-weighted.

**What these tests do not show.**
- The synthetic render statistics prove the code produces sound in range, without clipping or NaN, and that the notation is well-formed. **They do not validate musical quality.** No human has listened to this build yet. The harmony lint is a heuristic.
- Only headless Chromium was exercised. Firefox, Safari (including iOS `interrupted` handling), mobile CPU load and real output-device switching were **not** tested.
- No real Japanese TTS voice was available, so actual speech playback in a browser is untested beyond the mock.
- An 8 s offline render takes about 0.6 s on this machine, graph construction included (~7% of real time). Real-time CPU on phones is not measured.
