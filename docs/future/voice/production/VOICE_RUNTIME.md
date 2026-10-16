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

It is tested in the browser by `tests/e2e/voice_runtime.mjs` and `tests/e2e/voice_runtime_vrc1.mjs` against a real
voice site with synthetic tones, and in Node against the full module by `tests/unit/voicebank_vrc1.test.mjs` and
`tests/unit/voicebank_plan_content.test.mjs` (VR-C1, Astra's audit: VALIDATION.md "VR-C1").

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
- **When a scene begins:** the site's `index.json` (revalidated once a session) and that scene's index (one small file,
  content-named).
- **The reference readings' index** (about 1.9 MB of JSON, 660 KB gzipped, for 9,095 readings: measured on the
  production manifest) is not loaded by a scene. A learning control asks for it when it shows; otherwise it is loaded
  once the scene's own lines are in and nothing waits.
- **Lookahead (VR-C1):** while a line is shown, the encoded recordings of the lines that will certainly come next, at
  most three and 1.5 MB.
  - **Where from:** the runner's own position (`RB.script.position()`), so a called scene is followed into and back out
    to its caller.
  - **What counts as certain:** a line whose condition can be read now (`RB.state.peek`: flags, companion, quests,
    items, values, profile, chapter, words, seen scenes; a condition another system registered is not read, since some
    build the record they read) and that no choice, end or jump separates from the line shown. After a command that
    changes the state (`!set`, `!give`, `!quest` …), conditions are not guessed.
  - **Where it stops:** a choice (until it is made: the chosen branch's first line then plans again), an `!if` it cannot
    know, a battle, encounter, challenge, lesson, shop, menu, hook, recruit or departure.
  - **How much:** over the whole script, from every spoken line with each companion (69,592 positions), the plan knows
    the next line at 60 % of the positions that have one; the old raw-order scan named 88,024 lines the plan does not.
  - **One queue for the game:** one transfer ahead at a time; none starts while the line asked for is loading; a new
    plan or a new scene drops what is queued and aborts a transfer for a line no longer ahead (never one the line on
    screen waits for). Moving on, closing the scene or changing the voice settings drops the queue; Mute, a level of
    zero, No voice and leaving the journey abort what is running too. An abort is not counted as a failure.
  - It runs only while the voices play automatically, or once one has been played in that scene. It fetches only;
    nothing is decoded or played ahead. Lines for another companion or variant are skipped.
- **When nothing is fetched at all:** with No voice, with Mute, at a voice or master level of zero, and in the standalone file.
- **Bounded:**
  - each file is capped at 4 MB and checked for its size and SHA-256 (an index by the hash in its name);
  - a slow file gives up after 10 s;
  - a recording has 2 s to start (C-83), after which the line falls back to the device voice;
  - a file that fails twice rests for five minutes;
  - an index that fails to load is asked again after 1 s, 2 s, 4 s … up to a minute, on the same page (a valid index
    that does not list a scene is remembered as such).

## Kept on the device, and what is never touched

- **One cache of the game's own:** recordings and indexes go into a Cache Storage cache named `rbn-voice-v1`. It is the only cache the game opens, trims or clears. Other projects on `a-birdi.github.io` share the origin, so no other cache is ever deleted.
- **The saves are separate:** they live in IndexedDB or localStorage and are never read or written by this code.
- **Bounded at 150 MB:** the oldest-used recordings go first, down to 80 %; each kept entry counts its bytes and 512
  bytes for its address and headers, indexes included.
- **The bookkeeping** (each kept file's size and last use) lives inside the same cache. It is changed one step at a time,
  under one Web Lock that the game's tabs share: each change reads what is stored, merges in this tab's own changes and
  writes it back, so two tabs never lose each other's entries. Once a session it is checked against what the cache
  really holds: a file it does not list (a write cut short) is counted and goes first; an entry for a file that is gone
  is dropped; an unreadable bookkeeping file is rebuilt.
- **A kept copy is checked as a fresh one is** (size and SHA-256, using the browser's own digest where it has one). A
  copy that fails is removed and fetched again.
- **Writing a copy is never waited for:** the line plays from what arrived; the copy is written in the background and
  recorded once it is in. When the browser refuses a write for lack of space, this cache alone is trimmed to half and
  the write tried once more.
- **Clearing:** Settings › Sound › "Clear the kept recordings" empties that one cache.
  - The browser test checks that another project's cache, another key in localStorage, another IndexedDB database and the saves all stay.
- **Stable addresses:** a recording's file is named by its id and its audio's hash, directly under the language folder
  (`ja-JP/rec/<speaker>/<id>.<sha12>.opus`), never under a build folder. A game or voice update that does not change a
  recording keeps its address, so what was kept stays good; the browser test plays a kept copy after an update with no
  request for it.
- **Failure is a miss:** if the cache cannot open, times out or refuses a write (a private window, a full disk), the
  line is fetched or falls back, and play goes on. The browser tests break the cache, stall its writes and slow it to
  3 s, and still hear the line within its start.

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

- **Tested in Chromium only, with synthetic tones.** Firefox is not installed where these tests run, and no phone or
  Safari was tried; no real recording has been played yet. Those are separate checks (READINESS.md).
- **Without Web Locks** (an older browser), the bookkeeping is still changed one step at a time in each tab, each a fresh
  read, merge and write, but two tabs can then interleave; the session check repairs the count on the next visit.

- **Browsers without Ogg Opus:** a browser that cannot play Ogg Opus (some older Safari) falls back to the device voice, and the settings page says so. A second encoding would double the voice bytes, and none is planned.
- **The offline package was tested in Chromium only.** Firefox's handling of `file:` media was not tested here.
- **"Slower" playback:** the "Ask again, slower" request plays the recording at 0.75× with its pitch kept (the browser's own time-stretch), or the device voice slowed.
