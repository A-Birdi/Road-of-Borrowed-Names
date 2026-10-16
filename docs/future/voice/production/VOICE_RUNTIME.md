# How the game plays the recorded voices

Robin, 2026-10-16:
> "The primary release remains a browser game that opens at the existing URL and plays the selected cast without
> installing Japanese system voices, manually importing a voicebank, or downloading the entire corpus before play."
>
> "Implement bounded scene/line lookahead and persistent encoded-audio caching. Preserve unchanged recording URLs
> across game updates. Cache failure must not block play. Cache cleanup must not touch saves or other projects'
> storage. None/muted settings must be respected."
>
> "Keep AG-1 text alignment compatible with recorded playback. Preserve the mapping between displayed text, spoken
> text and recording IDs. Document estimated timing honestly; do not make later timing work require regenerating
> accepted audio."

The code:
- `src/audio/52_voicebank.js` finds, fetches, keeps and plays the recordings.
- `src/audio/54_voice_route.js` decides which voice speaks.

It is tested in the browser by `tests/e2e/voice_runtime.mjs` against a real voice site with synthetic tones.

## Three ways the game is delivered, one set of recordings

| Delivery | Where the recordings are | What the player does |
| --- | --- | --- |
| **The hosted game** (the existing URL; the primary release) | A voice site on the same origin, as static files fetched when needed (`HOSTED_BASE` in `52_voicebank.js`, set once Robin chooses the host: `docs/hosting/RUNTIME_PUBLISHING.md`) | Nothing: open the page and play |
| **The game file on its own** (`index.html`, unchanged and self-contained) | None. A copy on its own never fetches anything; the device voice speaks, as today | Nothing |
| **The voiced offline package** (`tools/publish/offline_package.mjs`) | A folder beside the page, read from disk | Open the package's `index.html` |

- **One file per recording.** The same files, named the same way, serve the hosted game and the package.
- **The voicebank is not embedded.** The core `index.html` does not carry it. Putting it in the page would make the whole corpus part of the page download.
- **What the package's page adds.** It is a copy of the game page with two additions:
  - the voice site's indexes, about 6 MB of JSON, because a page opened from disk cannot fetch them;
  - `media-src 'self'`, so it may play the files beside it.

  Measured in Chromium: `fetch()` from a `file:` page is refused, while same-folder media plays once `'self'` is allowed.

## Who speaks (Settings › Sound › Voices)

- **Recorded voices** (the default): a line plays its recording. Without one, the device's Japanese voice speaks it, if the device has one; otherwise the line is silent.
- **Your device's voice:** as before the recordings.
- **No voice:** nothing speaks, and the buttons that would speak are hidden.
- **Your own lines:** Silent (the default; C-83: an unset choice reads as None), Voice A or Voice B. Voice A and B each have a Higher and a Lower pitch. A line with your name in it is spoken by the device voice, which can say the name.
- **Play the voices automatically:** On by default for the recordings. The device voice's own setting is kept as it was.
- **Recordings and the device voice are independent.** Every control that speaks shows when a recording exists, whether or not a Japanese system voice is installed. This covers:
  - dialogue's Voice button;
  - word help's Say it, and the notebook's and bookmarks' Hear it;
  - the kana cards;
  - listening steps and the mastery exam's listening;
  - the karuta reader, the ring toss and the shells.

  The browser test runs on a machine with no Japanese system voice.

## Which recording says a line

The game keeps the mapping between what is shown, what is spoken and the recording:

| Step | How |
| --- | --- |
| The line | its key: the scene and the first 10 hex of the SHA-256 of its script markup (`scene#hash`), the same as `tools/voice/lines.mjs`. A line keeps its key when lines are inserted around it. |
| The speaker | the narrator for narration; for "whoever travels with you" the companion with you now; the player for `pc`; otherwise the character |
| The variant | Suzu's Kansai when the line shown is her Kansai one and says something different from the standard line; the player's Voice A or B and Higher or Lower |
| The check | the shown line's spoken text (no readings, no learner spacing, NFC) must hash to the recording's `th`. A line changed since it was recorded is never played as "close enough": it falls back to the device voice. |
| The file | `rec/<speaker>/<id>.<sha12>.opus`, from the scene's index |

Reference readings and phrases use the keys in VOICE_DELIVERY.md: `word:<written>|<reading>`, `kana:…`, `kanji:…` and `phrase:<reading>`.

## Fetching: nothing before play, a few lines ahead, nothing while silent

- **On page load:** nothing.
- **When a scene begins:** the site's `index.json` (small, revalidated once a session), that scene's index (one small file, content-named) and the reference index.
- **Lookahead:** while a line is shown, the encoded recordings of the next three lines of the scene, up to 1.5 MB.
  - It runs only while the voices play automatically, or once one has been played in that scene.
  - It fetches only; nothing is decoded or played ahead.
  - Lines for another companion or variant are skipped.
- **When nothing is fetched at all:** with No voice, with Mute, at a voice or master level of zero, and in the standalone file.
- **Bounded:**
  - each file is capped at 4 MB and checked for its size and SHA-256;
  - a slow file gives up after 10 s;
  - a recording has 2 s to start (C-83), after which the line falls back to the device voice;
  - a file that fails twice rests for five minutes.

## Kept on the device, and what is never touched

- **One cache of the game's own:** recordings and indexes go into a Cache Storage cache named `rbn-voice-v1`. It is the only cache the game opens, trims or clears. Other projects on `a-birdi.github.io` share the origin, so no other cache is ever deleted.
- **The saves are separate:** they live in IndexedDB or localStorage and are never read or written by this code.
- **Bounded at 150 MB:** the oldest-used recordings go first, down to 80 %. The bookkeeping lives inside the same cache.
- **Clearing:** Settings › Sound › "Clear the kept recordings" empties that one cache.
  - The browser test checks that another project's cache, another key in localStorage, another IndexedDB database and the saves all stay.
- **Stable addresses:** a recording's file is named by its id and its audio's hash. A game or voice update that does not change a recording keeps its address, so what was kept stays good.
- **Failure is a miss:** if the cache cannot open, times out or refuses a write (a private window, a full disk), the line is fetched or falls back, and play goes on. The browser test breaks the cache and still hears the line.

## Following the words while a recording plays (AG-1)

- **What is known.** A recording has no word timings: synthesis engines do not report them, and the batch does not measure them.
- **How the highlight follows.** While a recording plays, the spoken-word highlight and its English counterparts (AG-1's relations) follow an estimate:
  - each word's beats (morae) and pauses, from the game's own readings (`RB.jp.speech.timeline`);
  - stretched to the recording's own length and clock.

  This is an estimate. It is right on average and can lead or lag a word on long lines or unusual pacing.
- **How it can improve later, with no new recordings.** Word timings measured from the audio (forced alignment of each accepted file against its reading) can be added beside each recording as optional `marks` in the scene index, keyed by its id and SHA-256.
  - The game would use them when present and the estimate otherwise.
  - Nothing about the recordings, their names or the line keys changes, so later timing work never requires generating audio again.
- **The relations are unchanged.** They come from the displayed tokens:
  - Suzu's Kansai tokens for her Kansai recording;
  - the name as written while the recording says its reading;
  - the seam's words while the recording says the reading the line means.

## Known limits

- **Browsers without Ogg Opus:** a browser that cannot play Ogg Opus (some older Safari) falls back to the device voice, and the settings page says so. A second encoding would double the voice bytes, and none is planned.
- **The offline package was tested in Chromium only.** Firefox's handling of `file:` media was not tested here.
- **"Slower" playback:** the "Ask again, slower" request plays the recording at 0.75× with its pitch kept (the browser's own time-stretch), or the device voice slowed.
