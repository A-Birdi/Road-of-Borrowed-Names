# Audio — procedural music, effects and optional Japanese voice

Everything is generated at runtime with the Web Audio API: no samples, no
network, no libraries. Source: `src/audio/`. Spec: SPECIFICATION.txt §17.

## Architecture

| file | contents |
|---|---|
| `10_synth.js` | context lifecycle, mix graph, 13 general instruments + 8 Japanese instruments (wagakki), 16 + 9 percussion voices, shared per-track filters, public `init/ready/setVolume/setMuted/duck` |
| `20_sequencer.js` | notation compiler + validator, `Player`, 25 ms lookahead scheduler, `playSong/stopSong/currentSong/songList/motifList/renderOffline` |
| `30_songs.js` | the 33 original songs + shared motifs (ten of them re-orchestrated for Chapters 2–6 with the same notes); **the notation is documented in this file's header** |
| `31_songs_ch2.js` … `35_songs_ch6.js` | the zone music of Chapters 2–6: routes, towns, dungeons, battle and boss themes, story cues (34 songs) |
| `36_songs_atlas.js` | the Unwritten Atlas's battle and boss themes |
| `39_zones.js` | the zone table (region / map → zone → battle, boss, route and overworld songs) and `RB.audio.battleSong` |
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

## Japanese instruments (wagakki)

Added for the zone music of Chapters 2–6 and the Atlas (the owner's request:
rising intensity "like a japanese shamisen or otherwise"). They are synthesised
like everything else — oscillators, gains and filters, the shared
deterministic noise buffer — and run the same way in the live and the offline
context. What each models:

| voice | model |
|---|---|
| `shamisen` | A sawtooth string heard three ways: raw with a ~35 ms decay (the bright strike of the bachi), through a fixed low-pass with the note's own decay (the tone), and through the track's **sawari** clipper — an asymmetric clipping curve that turns the string's periodic wave into a buzz of its own harmonics, band-passed around 2.9 kHz and ringing 2.6× longer than the tone (the "zing" of the first string touching the neck). A plectrum click (band-passed noise, 8 ms) and a short low body "tsun" from the skin. The pitch starts 2 % sharp — string tension at the strike — and drops into tune in 45 ms. |
| `biwa` | The same lute, lower and rounder: saw + half a triangle in one periodic wave, a heavier bachi click, a longer note and a stronger, lower (1.8 kHz) and longer buzz (the biwa's frets are built for sawari), a pitch drop of about 55 cents over 70 ms. |
| `koto` | A rounded sustaining core (triangle with its octave partial, one periodic-wave oscillator) that rings 0.9–3.2 s depending on pitch, a sawtooth that is loud only at the strike (the ivory pick, tsume), an inharmonic "ting" at 3.01× the note (80 ms) and a noise click. |
| `koto_oshi` | The koto with **ato-oshi** (oshide): plucked a whole tone low and pressed up to the written note behind the bridge after 60 ms (130 ms glide). The written note is the one that sounds. |
| `shakuhachi` | Sine + triangle with far more breath than the flute: an edge-tone hiss band-passed at 1.6× the note and a band of air above 3.2 kHz; a **meri** scoop (the note starts 85 cents flat and is lifted into tune over 90–240 ms); a slow (4.3 Hz), wide, late vibrato; accented notes get a burst of breath (**muraiki**). |
| `shinobue` | The high festival flute: sine + triangle + some square through a bright low-pass, a little breath, a finger "hit" (uchi) from a whole tone above on notes long enough to carry it, a fast (5.9 Hz) shallow vibrato. |
| `sho` | The gagaku mouth organ: a reedy periodic wave (all harmonics, odd ones stronger) on two oscillators 0.3 % apart so they beat, a slow swell and release; written as held chords (aitake-like clusters). |
| `rin` | A struck bowl bell: modes at 1 : 2.76 : 5.2, the lower two as slightly mistuned pairs so they beat, faded out at about −30 dB. Also a percussion letter. |

New percussion letters (documented in the notation header of `30_songs.js`):

| letter | voice | model |
|---|---|---|
| `z` | ōdaiko "don" | a deep membrane (104 → 58 Hz), a higher mode, a low rumble, a skin slap |
| `e` | shime-daiko "ten" | tight, high (about 300 Hz), dry |
| `f` | taiko rim "ka" (fuchi) | wood on wood: two short partials and a click |
| `m` | kotsuzumi "pon" | a hollow pitched tone (470 → 396 Hz) that sags as the ropes relax |
| `q` | ōtsuzumi "kan" | a sharp dry crack around 3.3 kHz, almost no ring |
| `y` | hyōshigi | two hardwood clappers: high partials, a few ms |
| `a` | atarigane | the small festival hand gong (plate modes 1 : 2.72 : 4.98 : 7.6) |
| `v` | chappa | small cymbals: band-passed and high-passed noise, two beating partials |
| `i` | rin | the bowl bell |

**Measured, not listened to.** `tests/e2e/audio_instruments.mjs` renders one
note or stroke of every voice in an OfflineAudioContext straight into the
destination (no master chain) and measures it. Final numbers (44.1 kHz; D4
for the plucked strings, D5 for the winds, D3 for the biwa, D6 for the
shinobue; "hi > 6f" = share of energy from the 6th harmonic up, 150–450 ms
into the note; "off-harm." = share of energy off the note's harmonics, i.e.
breath; centroids are magnitude-weighted; cents = pitch at the start and once
settled):

| voice | nodes / note (+ shared per track) | peak | attack | −20 dB after | centroid early → late | hi > 6f | off-harm. | cents start / settled |
|---|---|---|---|---|---|---|---|---|
| pluck (reference) | 5 | 0.26 | 5 ms | 0.66 s | 2276 → 450 Hz | 0.000 | 0.000 | 2 / 3 |
| flute (reference) | 10 | 0.26 | 50 ms | 1.26 s | 2515 → 1485 Hz | 0.000 | 0.001 | −14 / 2 |
| shamisen | 8 (+6) | 0.30 | < 5 ms | 0.70 s | 3274 → 3788 Hz | **0.325** | 0.000 | **+15** / 0 |
| biwa | 8 (+6) | 0.48 | < 5 ms | 1.04 s | 2045 → 2051 Hz | **0.107** | 0.000 | **+36** / 0 |
| koto | 8 (+1) | 0.46 | 5 ms | 1.27 s | 3210 → 928 Hz | 0.001 | 0.000 | 3 / 1 |
| koto_oshi | 8 (+1) | 0.45 | < 5 ms | 1.27 s | 2991 → 1445 Hz | 0.001 | 0.000 | **−198** / 2 |
| shakuhachi | 9 (+3) | 0.34 | 180 ms | 1.16 s | 6233 → 6062 Hz | 0.008 | **0.045** | **−92** / 0 |
| shinobue | 11 (+2) | 0.33 | 20 ms | 1.08 s | 3997 → 4147 Hz | 0.001 | 0.008 | **+197** / 0 |
| sho | 3 (+1) | 0.09 | 745 ms | 1.14 s | 2167 → 2060 Hz | 0.121 | 0.000 | −2 / 0 |
| rin (A5) | 11 | 0.15 | 5 ms | 1.97 s | 2047 → 1596 Hz | — | 0.083 | (inharmonic) |

Percussion (strongest partial / −20 dB after): ōdaiko 86 Hz / 0.61 s (71 %
of its energy below 150 Hz; the old big drum `o`: 97 Hz / 0.38 s), shime
301 Hz / 0.12 s, kotsuzumi 441 Hz / 0.35 s, ōtsuzumi centroid 5.6 kHz /
0.06 s, hyōshigi 2304 Hz / 0.08 s, atarigane 1152 Hz / 0.44 s, chappa
centroid 11.9 kHz / 0.22 s, rin 1184 Hz / 1.93 s, rim 1453 Hz / 0.04 s.

What the test asserts (all pass): every voice is finite, non-silent, peak < 1,
at most 16 nodes per note and 8 shared per track; the shamisen strikes in
≤ 10 ms, starts ≥ 12 cents sharp and settles in tune, keeps > 5 % of its late
energy from the 6th harmonic up (the buzz; the pluck keeps none) and is drier
than the koto; the biwa buzzes, rings longer than the shamisen and is darker;
the koto has a plucked attack, a long ring and a bright start that mellows;
koto_oshi starts ≤ −150 cents and settles in tune; the shakuhachi has more
than twice the flute's off-harmonic (breath) energy, a scoop from ≥ 40 cents
below and a slower swell than the flute; the shinobue is brighter than the
flute relative to its pitch and starts a whole tone above; the shō swells
slowly with a reedy spectrum; the rin rings > 1.5 s; the ōdaiko is deep and
rings longer than the shime and the old big drum; the shime is tight and high;
the kotsuzumi is pitched and resonant, the ōtsuzumi a short crack; the
hyōshigi is bright and short; the atarigane metallic and longer than wood; the
chappa cymbal-bright. These numbers say each voice has the features its model
claims. **They do not say it sounds good or convincing: nobody has listened.**

**CPU.** A biquad whose frequency is automated recomputes its coefficients
every sample (measured in Chromium: a filter sweep that never ends costs about
twice a fixed filter). So the Japanese voices never automate a filter:
brightness that changes over a note is made with gains (a bright path fading
fast beside a duller one), and every fixed filter is created once per track
strip and shared by all its notes (filtering is linear, so filtering the sum
equals the sum of the filtered notes; frequencies snap to quarter-octave steps,
so a track holds at most a few dozen; the cache lives on the graph and goes
with it). The sawari clipper is shared per track too (overlapping strings buzz
against each other, as on the instrument). A note owns only oscillators and
gains, and its short parts (click, thump, ting) stop as soon as they are
inaudible. The koto core and the biwa string are single periodic-wave
oscillators. New percussion strokes live 4.5 time constants (about −40 dB)
instead of 7. No AudioWorklet is used. Render cost of a 10 s passage at
4 notes/s through the full graph, in ms per second of audio, best of 3, on
the shared test machine (the graph alone 15–18): pluck 22, harp 35, flute 35,
shamisen 23, biwa 22, koto 29, shakuhachi 33, shinobue 32, shō 21, rin 71 (a
long ring; used sparingly). These figures move by ±20 % between runs on the
shared machine; real-time CPU on phones was not measured.

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

The original 33 songs (Chapter 1 and the songs shared across the game; ten of
them were later re-orchestrated for their zones, see "Zone music" below — the
table gives their notes, which did not change). Lengths come from the
compiler. "Loop" is the repeating span. Arrangement notes for each song are in
`30_songs.js` and in `RB.audio.songList()`.

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

## Zone music (Chapters 2–6 and the Atlas)

The owner asked for thematic music for each zone, rising in intensity through
the story — overworld, battle and boss — with Japanese instruments, without
turning into an epic; Reedwake keeps its calm music; important cutscenes get
their own cues. The plan:

- **Chapter 1 is unchanged** (`title`, `prologue`, `reedwake`,
  `reedwake_night`, `road`, `mill`, `battle`, `boss`, `victory` and the shared
  moods compile to exactly the same events as before; checked).
- **From Chapter 2 on, every zone has its own route, battle and boss themes**
  and its town and dungeon music; no map outside Chapter 1 plays Chapter 1's
  `road`. Ten original area themes are **re-orchestrated in place** for the
  Japanese instruments with the same notes (checked track by track: every
  original melodic and harmonic track keeps the same pitch classes, times and
  lengths; only percussion patterns changed and two tracks were added — a
  heartbeat in `drowned_archive`, a biwa drone in `kiln`); everything else is
  new.
- **One family.** Every route opens with (or carries) the road motif; most
  routes quote the next town's tune as it comes into view; every battle quotes
  the road motif; every boss sets the road motif falling against the Hush
  motif on glass (bosses are places the Hush has touched) over the same
  phrygian half-step shuttle, so the bosses sound related while their keys,
  riffs, instruments and textures change. The Hush's own theme (`hush`) is
  deliberately left as it was — glass, open fifths, nothing human in it.
- **Chamber-sized.** At most 13 tracks, no choir of hundreds, no brass; the
  bowed voice is the only non-Japanese string. The game's patient 3+3+2
  battle pulse is kept in every battle theme (combat is untimed).
- Shared moods (`mystery`, `inn`, `quiet_road`, `wonder`, `sorrow`, `hush`,
  `finale`, `ending`, `departure`, the companion themes) may still play in any
  zone where a scene or a map asks for them.

### Per chapter

| chapter / zone | overworld | battle | boss | story cues |
|---|---|---|---|---|
| 1 Reedwake (unchanged) | `reedwake`, `reedwake_night`, `road`, `mill`, `mystery` | `battle` | `boss` | `hush`, `wonder`, `departure` (as before) |
| 2 Saltglass | `sg_road` (coast road, **new**), `saltglass` (harbour, re-orch.), `drowned_archive` (re-orch.), `quiet_road` (cove, shared) | `battle_saltglass` | `boss_saltglass` | `sg_confession`, `sg_counter`, `sg_letters`, `sg_lighthouse` |
| 3 Cinder Orchard | `co_road` (**new**), `cinder` (village, terraces; re-orch.), `co_terraces` (upper terraces, workshop row; **new**), `kiln` (re-orch.), `co_festival` (**new**), `co_assembly` (dusk square), `quiet_road` (lookout, shared) | `battle_cinder` | `boss_cinder` | `co_fire`, `co_assembly`, `co_festival` |
| 4 Snowbell | `sb_road` (**new**), `snowbell` (re-orch.), `observatory` (re-orch.), `inn` (shared), `sb_snowlight` (inn room), `sb_lamp` (evening hamlet, lit dome) | `battle_snowbell` | `boss_snowbell` | `sb_blizzard`, `sb_snowlight`, `sb_lamp` |
| 5 Lanternfall | `lf_road` (**new**), `lanternfall` (before the bell; re-orch.), `lf_town_after` (after the bell; **new**), `lf_records` (records hall, council, stacks, sluice before the bell; **new**), `belltower` (re-orch.), `hush` (bell chamber before), `lf_bell` (after), `inn` (shared) | `battle_lanternfall` | `boss_lanternfall` | `lf_flood`, `lf_bell` |
| 6 Still Archive | `sa_road` (**new**), `sa_road_home` (the road after the Hush; **new**), `still_archive` (re-orch.), `hush` (stacks, conduits, heart; unchanged), `sa_memories` (**new**), `finale` (re-orch.), `inn`, `mystery`, `wonder`, `ending` (shared) | `battle_still` | `boss_hush` (the last fight) | `sa_kasane`, `sa_toya` |
| Atlas (post-game) | `atlas` (unchanged) | `battle_atlas` (**new**, 7/8) | `boss_atlas` (**new**, 7/8) | — |

All the new and re-orchestrated songs (`songList()` reports `chapter` and
`kind`; "intensity" is the composite score defined below):

| ch | id | title | kind | key / mode | bpm | meter | length | loop | motifs | intensity |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | `sg_road` | The Coast Road | area | B♭ | 88 | 4/4 | 120 s | 109 s | road | 3.59 |
| 2 | `saltglass` | Saltglass Harbour | area (re-orch.) | F | 104 | 4/4 | 97 s | 97 s | road | 3.47 |
| 2 | `drowned_archive` | The Drowned Archive | area (re-orch.) | E minor | 66 | 4/4 | 116 s | 116 s | road, hush | 2.98 |
| 2 | `battle_saltglass` | Inkweaving — Salt Wind | battle | D dorian | 104 | 4/4 | 78 s | 74 s | road | 5.65 |
| 2 | `boss_saltglass` | Low Tide Reckoning | boss | E phrygian | 140 | 4/4 | 72 s | 69 s | road, hush | 8.75 |
| 2 | `sg_confession` | The Ledger | scene | D minor | 63 | 4/4 | 91 s | 91 s | — | 2.36 |
| 2 | `sg_counter` | The Returns Counter | scene | E phrygian | 60 | 4/4 | 48 s | 48 s | hush | 2.22 |
| 2 | `sg_letters` | Letters on the Tide | scene | F | 80 | 4/4 | 48 s | 48 s | road | 3.56 |
| 2 | `sg_lighthouse` | The Lighthouse Beam | scene | B♭ | 66 | 3/4 | 87 s | 87 s | road | 2.97 |
| 3 | `co_road` | The Orchard Road | area | A mixolydian | 92 | 4/4 | 89 s | 83 s | road | 4.00 |
| 3 | `cinder` | Cinder Orchard Festival | area (re-orch.) | A mixolydian | 112 | 4/4 | 88 s | 88 s | road | 4.13 |
| 3 | `co_terraces` | Ash on the Terraces | area | B minor | 96 | 4/4 | 80 s | 80 s | road | 3.24 |
| 3 | `kiln` | The Sealed Kiln | area (re-orch.) | E phrygian | 84 | 4/4 | 91 s | 91 s | hush | 4.09 |
| 3 | `co_festival` | The Autumn Festival | area | A | 116 | 4/4 | 87 s | 83 s | road | 4.68 |
| 3 | `battle_cinder` | Inkweaving — Festival Fire | battle | A minor | 108 | 4/4 | 76 s | 71 s | road | 7.47 |
| 3 | `boss_cinder` | The Kiln Will Not Cool | boss | D phrygian | 142 | 4/4 | 71 s | 68 s | road, hush | 9.27 |
| 3 | `co_fire` | The Kiln's Last Page | scene | A minor | 72 | 4/4 | 80 s | 80 s | — | 4.28 |
| 3 | `co_assembly` | What the Village Remembers | scene | F | 60 | 4/4 | 96 s | 96 s | road | 2.26 |
| 4 | `sb_road` | The Snowbell Road | area | D minor (3/4 waltz in F in B) | 96 | 4/4 | 80 s | 75 s | road | 4.04 |
| 4 | `snowbell` | Snowbell | area (re-orch.) | F | 80 | 3/4 | 95 s | 95 s | road | 3.02 |
| 4 | `observatory` | The Observatory | area (re-orch.) | C lydian | 72 | 4/4 | 107 s | 107 s | road | 3.66 |
| 4 | `battle_snowbell` | Inkweaving — Frost | battle | F♯ minor | 112 | 4/4 | 73 s | 69 s | road | 8.32 |
| 4 | `boss_snowbell` | A Light Kept Waiting | boss | B phrygian | 144 | 4/4 | 70 s | 67 s | road, hush | 9.46 |
| 4 | `sb_blizzard` | Blizzard at Yukimiya | scene | A minor | 66 | 4/4 | 58 s | 58 s | — | 3.08 |
| 4 | `sb_snowlight` | Snow Light | scene | F | 58 | 3/4 | 99 s | 99 s | road | 2.28 |
| 4 | `sb_lamp` | The Lamp on the Mountain | scene | F lydian | 76 | 3/4 | 57 s | 57 s | road | 3.04 |
| 5 | `lf_road` | The Lantern Road Down | area | E dorian | 100 | 4/4 | 82 s | 77 s | road | 4.12 |
| 5 | `lanternfall` | Lanternfall | area (re-orch.) | C | 96 | 4/4 | 100 s | 100 s | road, hush | 3.94 |
| 5 | `lf_town_after` | Lanternfall, Talking Back | area | C (swung) | 104 | 4/4 | 74 s | 74 s | road | 4.02 |
| 5 | `lf_records` | Public Records | area | A minor | 92 | 4/4 | 83 s | 83 s | road, hush | 2.87 |
| 5 | `belltower` | The Submerged Bell Tower | area (re-orch.) | D dorian | 60 | 4/4 | 96 s | 96 s | road, hush | 2.22 |
| 5 | `battle_lanternfall` | Inkweaving — Certainly Not | battle | G dorian | 116 | 4/4 | 70 s | 66 s | road, hush | 9.06 |
| 5 | `boss_lanternfall` | The Bell Under the Water | boss | C phrygian | 148 | 4/4 | 68 s | 65 s | road, hush | 9.72 |
| 5 | `lf_flood` | Old Minutes | scene | D minor | 63 | 4/4 | 91 s | 91 s | road | 2.99 |
| 5 | `lf_bell` | The Bell Rings | scene | B♭ | 72 | 4/4 | 53 s | 53 s | road | 3.82 |
| 6 | `sa_road` | The Archive Road | area | B minor | 104 | 4/4 | 78 s | 74 s | road, hush | 4.38 |
| 6 | `sa_road_home` | The Road of Borrowed Names (Home) | area | D | 84 | 4/4 | 149 s | 137 s | road | 3.80 |
| 6 | `still_archive` | The Still Archive | area (re-orch.) | B minor | 80 | 4/4 | 96 s | 96 s | road, hush | 3.30 |
| 6 | `sa_memories` | Set-Down Memories | area | B minor | 58 | 4/4 | 99 s | 99 s | road | 2.15 |
| 6 | `finale` | Which Promises We Keep | area (re-orch.) | D minor → major | 92 | 4/4 | 104 s | 104 s | road, hush | 4.40 |
| 6 | `battle_still` | Inkweaving — Every Name | battle | B minor | 120 | 4/4 | 68 s | 64 s | road, hush | 9.72 |
| 6 | `boss_hush` | Nothing Left to Shelve | boss | F phrygian | 152 | 4/4 | 73 s | 69 s | road, hush | 9.93 |
| 6 | `sa_kasane` | The Keeper | scene | F lydian | 60 | 4/4 | 96 s | 96 s | road, hush | 2.04 |
| 6 | `sa_toya` | The Note, Read Again | scene | D | 63 | 4/4 | 91 s | 91 s | road, hush | 2.19 |
| A | `battle_atlas` | Inkweaving — Unwritten | battle | A mixolydian | 112 | 7/8 | 68 s | 64 s | road, hush | 7.56 |
| A | `boss_atlas` | The Map Unmade | boss | A phrygian | 138 | 7/8 | 64 s | 61 s | road, hush | 9.07 |

The arrangement of each song (instruments, what each section does, which
motif goes where) is in its `notes` in the song files and in
`RB.audio.songList()`. Titles do not appear anywhere in the game's UI
(`songList()` is used only by tests and tools); the few cue titles that could
hint at later story were kept neutral anyway.

**Instrument colour by zone** (rising, but never orchestral): Chapter 2 is a
min'yō band by the sea — shakuhachi, koto, shamisen chords, light shime and
hyōshigi; Chapter 3 a festival — shinobue, the atarigane's chan-chiki, a small
kumi-daiko (ōdaiko, shime, rim), and the in-scale's heat for the kiln;
Chapter 4 cold and quiet — koto high in its register, shakuhachi breath, noh
drums, small bells and rin, shō for the lamp; Chapter 5 orderly and then
arguing — koto in square steps, ticks, the Hush's lydian cluster, a temple bell
under the boss, and a swung, heckling town after the bell; Chapter 6 all of
it, the whole kit in the battle, and the main theme played by the whole
ensemble on the road home.

### Intensity curve

Measured from the compiled songs over their loop (`tests/lib/intensity.mjs`;
asserted by `tests/unit/audio_zones.test.mjs`): **bpm** (time-weighted);
**density** = pitched note onsets per second (a chord on one track counts
once); **perc** = percussion weight per second (Σ velocity × voice weight: big
drums 1, mid drums ≈ 0.45, wood/metal/small 0.15); **dissonance** = share of
simultaneously sounding pitch-class pairs a semitone/major seventh or a
tritone apart, sampled every quarter beat; **layers** = mean number of tracks
sounding at once; **score** = bpm/100 + density/4 + perc/2 + 4·dissonance +
layers/4.

| ch | battle theme | bpm | density /s | perc /s | dissonance | layers | score |
|---|---|---|---|---|---|---|---|
| 1 | `battle` | 100 | 6.08 | 0.81 | 5.0 % | 5.49 | 4.50 |
| 2 | `battle_saltglass` | 104 | 9.02 | 1.13 | 7.1 % | 6.04 | 5.65 |
| 3 | `battle_cinder` | 108 | 11.12 | 2.59 | 10.0 % | 7.63 | 7.47 |
| 4 | `battle_snowbell` | 112 | 12.66 | 3.07 | 13.4 % | 7.88 | 8.32 |
| 5 | `battle_lanternfall` | 116 | 12.93 | 4.10 | 14.4 % | 8.16 | 9.06 |
| 6 | `battle_still` | 120 | 13.59 | 4.51 | 18.0 % | 8.59 | 9.72 |

| ch | boss theme | bpm | density /s | perc /s | dissonance | layers | score |
|---|---|---|---|---|---|---|---|
| 1 | `boss` | 138 | 14.78 | 3.01 | 8.5 % | 6.78 | 8.62 |
| 2 | `boss_saltglass` | 140 | 13.07 | 3.75 | 13.8 % | 6.61 | 8.75 |
| 3 | `boss_cinder` | 142 | 13.73 | 4.20 | 14.5 % | 6.96 | 9.27 |
| 4 | `boss_snowbell` | 144 | 13.23 | 4.49 | 17.3 % | 7.08 | 9.46 |
| 5 | `boss_lanternfall` | 148 | 13.94 | 4.73 | 13.7 % | 7.37 | 9.72 |
| 6 | `boss_hush` | 152 | 13.42 | 5.45 | 13.5 % | 7.13 | 9.93 |

The test asserts, chapter by chapter for the battle themes: score, tempo,
note density and percussion weight strictly rise, dissonance and layering do
not fall; for the boss themes the score strictly rises; and in every chapter
the battle theme stays below its boss theme. (Ch1's boss was already dense at
138 bpm; the new bosses rise above it in percussion, tension and the
composite, not in raw note density. Chapter 4's and 6's battle tension comes
from in-scale and Hush clusters held in one section each.) The overworld is
not forced onto a curve, but it rises too, e.g. the routes: `road` 3.73 →
`sg_road` 3.59 → `co_road` 4.00 → `sb_road` 4.04 → `lf_road` 4.12 →
`sa_road` 4.38. **Self-review:** these are structural measures of the
notation, not of how intense the music feels.

### Battle and boss selection

`src/audio/39_zones.js` maps regions to zones:

| zone | regions (enemy or map) | map id prefixes | battle | boss | route |
|---|---|---|---|---|---|
| reedwake | reedwake | `rw.`, `lq.` | `battle` | `boss` | `road` |
| saltglass | saltglass, archive | `sg.` | `battle_saltglass` | `boss_saltglass` | `sg_road` |
| cinder | cinder | `co.` | `battle_cinder` | `boss_cinder` | `co_road` |
| snowbell | snowbell | `sb.` | `battle_snowbell` | `boss_snowbell` | `sb_road` |
| lanternfall | lanternfall | `lf.` | `battle_lanternfall` | `boss_lanternfall` | `lf_road` |
| still | still, sa_mount, sa_still | `sa.` | `battle_still` | `boss_hush` | `sa_road` |
| atlas | atlas | `atlas` | `battle_atlas` | `boss_atlas` | — |

`RB.audio.battleSong(enemy, mapDef, mapId)` (used by `src/ui/80_combat.js`):
an `enemy.music` naming a real song other than `battle`/`boss` wins (an
explicit override); otherwise the zone of `enemy.region`, else of the map's
region, else of the map id's prefix, gives its boss theme for a boss and its
battle theme for anything else; with nothing known, Chapter 1's `boss` /
`battle`. The placeholders `music: 'battle'` / `'boss'` that some enemy
definitions carry therefore mean "this zone's theme". After a battle the
combat screen restores the map's music through `RB.world.musicFor(def, s)`
(the same picker the world uses on entry, now also for function-valued
music), or the song that was playing before when the map has none.

### Story cues

Each cue is a looping `scene` song started with `!music` in the script and
replaced by the area's music afterwards the way scenes already do (an explicit
`!music <area>` or the next map's music). No story text, flag or outcome
changed. Where a scene's lines are referenced by index (the practice compare
data), the command was inserted after the referenced line.

| cue | scene(s) | where it starts / how it ends |
|---|---|---|
| `sg_confession` | `sg.wataru_confront` → `sg.omi_wataru` | at "I heard about the night the lighthouse burned low…"; `!music saltglass` at the end of the harbourmaster's judgement |
| `sg_counter` | `sg.da_boss` | the stamping behind the counter, until the boss fight |
| `sg_letters` | `sg.da_boss_after` (was `wonder`); also the Returns Counter after the boss | the letters rise; the warp to the harbour plays `saltglass` |
| `sg_lighthouse` | `sg.ch2_end` | the night on the pier; `!music saltglass` after the warp to the inn next morning |
| `co_road` | `co.arrive` (was `road`) | chapter opening |
| `co_fire` | `co.core_page` (was `sorrow`) | the vision of the fire night; the warp to the village plays `cinder` |
| `co_assembly` | `co.assembly` (was `sorrow`); the dusk square map | the village remembers |
| `co_festival` | `co.festival_begin` (was `cinder`); the festival map | the festival night |
| `sb_blizzard` | `sb.storm_start` (was `inn`) | the storm at the inn, until the snowed-in night |
| `sb_snowlight` | `sb.quiet_begin` (was `quiet_road`); the inn's upstairs room | the two travellers' night; `snowbell` next morning (unchanged) |
| `sb_lamp` | `sb.lamp_name`, `sb.eve_start` (were `wonder`); lit dome, evening hamlet | the lamp lit and the evening it shines |
| `lf_flood` | `lf.yae_minutes`, `lf.tokuji_story` | the minutes read aloud and the flood night told; `!music lf_records` at the end of each |
| `lf_bell` | `lf.bell_touch` after the ring (was `wonder`); the bell chamber afterwards | the drowned bell rings |
| `sa_road` | `sa.arrive` (was `quiet_road`) | chapter opening |
| `sa_kasane` | `sa.kasane_meet`, `sa.heart_kasane` (were `hush`) | meeting the keeper (`!music still_archive` at the end); the last words before the final fight |
| `sa_toya` | `sa.toya_read` | the old note read again in context; the next map's music follows |

Kept as they were: `!music -` before the Kiln Warden and before the storm and
bell (deliberate silences), the companion themes, `sorrow` at the master's
grave, `finale`, `ending`, `credits`, `reedwake_night` in the epilogue.

### Loudness

Every song is rendered offline through the real mix graph by
`tests/e2e/audio.check.mjs`, which now also asserts that each zone song's
opening-window RMS lies within the original songs' range ± 1 dB and its peak
stays below the original songs' highest peak + 0.05. Final build: the 46 zone
songs open at −27.0 to −17.2 dBFS RMS (the original songs: −30.3 to
−17.0); the highest zone-song peak in those windows is 0.532 (original 0.535).

**(A) Whole songs.** Each zone song was also rendered over its whole length in
consecutive 12 s windows (scratch analysis, 2026-10-03; the numbers below):
no NaN and no sample at full scale anywhere. The loudest any of them gets
after the limiter is 0.581 (`boss_snowbell`), below Chapter 1's own `boss`
(0.585 measured the same way); pre-dynamics peaks reach 0.721
(`boss_snowbell`; Ch1 `boss` 0.652), so the compressor and limiter work a
little harder there (about 1.9 dB from that peak to the output peak, against
0.9 dB on Ch1 `boss`). The 12 s windows of the battle and boss themes sit
between −21.2 and −16.9 dBFS RMS, those of the area themes between −26.2 and
−18.2, the cues between −27.1 and −20.1 — the same band as the original songs
(Ch1 `boss` −19.1 to −17.0, `battle` −21.2 to −18.7, `road` −27.5 to −19.0).

### CPU per song

**(A)** Render time of each song over its whole length in consecutive 12 s
windows through the full graph (the way the live scheduler meets it, a little
at a time), as % of real time, on the shared test machine while other test
runs were going on (load average 8–13), 2026-10-03. Chapter 1's `boss`, the
heaviest original song, was rendered first and last in the same run:
**34.3 % and 29.8 %**; for scale, `battle` 19.9 %, `road` 18.6 %.

| ch | battle | boss | heaviest area / cue | others |
|---|---|---|---|---|
| 2 | `battle_saltglass` 22.2 % | `boss_saltglass` 28.6 % | `sg_letters` 21.7 %, `saltglass` 18.0 % | `sg_lighthouse` 18.3, `sg_road` 12.3, `sg_confession` 10.6, `drowned_archive` 10.1, `sg_counter` 7.8 |
| 3 | `battle_cinder` 26.3 % | `boss_cinder` 28.3 % | `cinder` 27.7 %, `co_festival` 21.2 % | `co_road` 15.9, `co_fire` 14.8, `kiln` 11.7, `co_terraces` 10.8, `co_assembly` 7.8 |
| 4 | `battle_snowbell` 28.0 % | `boss_snowbell` 29.1 % | `observatory` 12.4 % | `sb_road` 11.7, `snowbell` 10.7, `sb_lamp` 9.7, `sb_blizzard` 8.6, `sb_snowlight` 7.8 |
| 5 | `battle_lanternfall` 29.9 % | `boss_lanternfall` 29.7 % | `lf_town_after` 17.7 % | `lf_road` 15.3, `lf_bell` 13.2, `lanternfall` 12.8, `lf_flood` 11.1, `lf_records` 8.4, `belltower` 8.2 |
| 6 | `battle_still` 29.2 % | `boss_hush` 31.3 % | `finale` 18.7 % | `sa_road` 13.8, `still_archive` 11.5, `sa_road_home` 11.4, `sa_toya` 7.7, `sa_memories` 6.9, `sa_kasane` 6.0 |
| Atlas | `battle_atlas` 23.0 % | `boss_atlas` 26.9 % | — | — |

So no zone song costs more than Chapter 1's boss theme did in the same run;
the later battle and boss themes come close to it (they are the densest
music in the game), the area themes and cues stay at roughly the cost of
`road` or below. Earlier runs on a quieter machine (three 12 s windows, best of
3 each) gave the same picture at lower absolute numbers: Ch1 `boss` 26.7–27.9 %,
the new bosses 22.7–28.0 %, the new battles 18.3–27.8 %. The first versions
of the Saltglass themes cost up to 40 % before the shared-filter work described
under "Japanese instruments" above.

Caveats: these are offline renders in headless Chromium on a shared server
whose load changes from minute to minute (±20 % between runs); they compare
songs with each other and with Chapter 1, they do not predict real-time CPU on
a phone or in Firefox, which were not measured. A single offline render of a
whole song at once costs far more (all of its notes' nodes exist from the
start: Ch1 `boss` 188 %), which is why the windows are used; live playback
schedules notes only 0.2 s ahead.

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

Last run on 2026-10-03 in this container (Node 22, Playwright Chromium 1194
headless), after the zone music. **(U)** = node unit test, **(B)** = browser
test of the built `index.html`, **(A)** = analysis by the author of the music
(scripts run during the work, not part of the test suite).

- **`node tests/run-unit.mjs audio` (U):** 2662 checks pass (`audio_songs`, `audio_voice`, `audio_zones`); the whole unit suite: 17068 passed, 0 failed; `node tools/validate.mjs`: no errors. `audio_songs` covers:
  - every required song and sfx id exists, and every song compiles;
  - bar lengths are checked; no zero-length sections;
  - note ranges per instrument (now including the eight Japanese voices, roughly their real compass); every declared track is used; compilation is deterministic;
  - area, battle and boss loops ≥ 60 s, companion/scene loops ≥ 40 s, prologue 30–60 s, victory ≤ 10 s; every song has a known kind;
  - every claimed motif is actually quoted;
  - a harmony lint (below);
  - 15 negative cases that prove the validator rejects malformed notation;
  - `RB.voice` against a mocked `speechSynthesis`: local-only, cancel-before-speak, ducking, clamping, mute, notes.
- **`tests/unit/audio_zones.test.mjs` (U, new):** the zone table names real songs; Chapter 1 keeps `battle`, `boss` and `road`; the Atlas has its own pair; every map of Chapters 2–6 plays only its own zone's songs or a shared mood (never a Chapter 1 song); each zone's route map plays its route theme; every placed enemy gets its zone's battle or boss theme through `battleSong`, an explicit `enemy.music` still wins and unknown enemies fall back to `battle`/`boss`; every `!music` in a scene of Chapters 2–6 names a zone song or a shared mood (the one exception: a warp back to Reedwake that plays `reedwake`); every story cue is used by a scene; and the intensity curve (see above; the numbers are printed with the result).
- **Harmony lint:** fails on any melody note held ≥ 1.5 beats a semitone above a chord tone, or a tritone above the root. Only intentional cases are allowed: the Hush's raised 4th over open fifths, and the sorrow B-section sigh. **Changed:** the raised 4th used to be allowed only in `hush`, `lanternfall` and `still_archive`; it is now allowed in any song that claims the Hush motif (the boss themes and the Hush-touched places quote it on purpose). While composing the zone music the lint found real clashes (a koto line over the wrong chord in `boss_cinder`, a low line in `boss_hush`), which were fixed in the notes, not in the lint.
- **Negative case changed:** the "unknown percussion letter" case used `z`, which is now the ōdaiko; it uses the unassigned `u`.
- **`node tests/e2e/audio.check.mjs` (B):** all checks pass.
  - **Songs:** all 69 songs are rendered offline through the real mix graph, 8 s from the start plus 6 s from mid-song (137 renders). No NaN, no full-scale samples. Highest peak 0.535 (Chapter 1's `boss`; raw pre-dynamics peak 0.596), so the dynamics stage barely works. The longest near-silent stretch is 0.85 s (`victory`'s tail; among the zone songs 0.70 s, a rest in `lf_records`). Opening-window loudness −30.3 to −17.0 dBFS RMS (median −21.8).
  - **Zone music (new assertion):** the 46 songs of Chapter 2 on (36 new, 10 re-orchestrated) must open within the original songs' RMS range ± 1 dB and peak no higher than the original songs' highest peak + 0.05. Result: −27.0 to −17.2 dB against −30.3 to −17.0; peak max 0.532 against 0.535.
  - **Effects:** all 48 render, with peaks from 0.026 (`pen_up`, deliberately faint) to 0.419 (`levelup`).
  - **Live:** after a real click, the context runs and an AnalyserNode sees signal while `road` plays. Crossfade to `battle` works; same-id `playSong` is a no-op; sfx fire and are rate-limited; mute silences output (peak 7e-5). A simulated hidden tab suspends the context and it resumes when visible. `stopSong` clears the current song, and `victory` ends by itself.
  - **Voice:** headless Chromium lists no voices. `status()` explains this and `speak()` refuses.
- **`node tests/e2e/audio_zones.mjs` (B, new):** for every zone of Chapters 1–6 and the Atlas, in the real game with audio initialised: the creature's map plays its own music on entry; a real battle with one of the zone's creatures plays the zone's battle theme; after stepping back from the fight the map's music returns; the zone's route map plays its route theme; the zone's boss plays its boss theme; no audio-engine error and no page error. The Atlas generates its rooms, so its creature is fought on the first Reedwake route (its theme follows the creature, not the map). Result: 69 passed, 0 failed.
- **`node tests/e2e/audio_instruments.mjs` (B, new):** the instrument analysis in "Japanese instruments" above. All checks pass.
- **`node tests/e2e/audio_suite.mjs [--story] [--quick] [file.mjs:args …]` (B, new):** runs the audio browser scripts above, `combat_ui.mjs` and `battle_presentation.mjs` (the battle screen whose music wiring changed), and optionally story tests, one after another, with a summary. Final run, all passed: `audio_zones` (69 passed, 0 failed), `audio_instruments` (all instrument checks passed), `audio.check` (all audio checks passed), `combat_ui` (7 passed, 0 failed), `battle_presentation` (13 passed, 0 failed), `story_ch1 F mio` (31 checks), `story_ch3 E nao` (38 checks), `story_ch4 I ren go` (53/53), `story_ch5 A suzu` (44 steps), `story_ch6 2` (36/36).
- **(A) Unchanged songs:** every song not listed as new or re-orchestrated compiles to exactly the same event list as before the zone music (`title`, `prologue`, `reedwake`, `reedwake_night`, `road`, `mill`, `battle`, `boss`, `victory`, the shared moods and companion themes, `hush`, `ending`, `credits`, `atlas`, …). For the ten re-orchestrated songs every original melodic and harmonic track keeps the same pitch classes, onset times and lengths; only percussion patterns changed and two tracks were added.
- **Mix balance:** measured with `renderOffline(id, s, {solo:[track]})`. Leads sit 5–10 dB above pads, and the bass is loud in RMS but well below the lead once A-weighted.

**What these tests do not show.**
- The render statistics and the instrument analysis prove the code produces sound in range, without clipping or NaN, that the notation is well-formed and that each voice has the features its model claims. **They do not validate musical quality.** Every musical judgement in this document (that a voice reads as a shamisen, that a theme fits its place, that the curve *feels* rising) is the composer's self-review from analysis: **nobody has listened to the zone music yet.** The harmony lint and the intensity score are heuristics.
- Only headless Chromium was exercised. **Firefox** (the owner's desktop browser) and Android Chrome were not; Firefox's Web Audio differs in biquad, WaveShaper and PeriodicWave details, so timbres may differ slightly there, and its CPU cost is unmeasured. Safari (including iOS `interrupted` handling) and real output-device switching were **not** tested.
- Real-time CPU on phones (the owner's Android foldable) is not measured; the figures above are offline renders on a shared, busy test machine, accurate to perhaps ±20 %.
- No real Japanese TTS voice was available, so actual speech playback in a browser is untested beyond the mock.
