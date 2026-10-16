# The voice batch: what goes in, what comes back, and how the game finds it

This is the contract between this repository and the local voice worker on Robin's PC. The scope and the
authorization are in [PRODUCTION_SCOPE.md](PRODUCTION_SCOPE.md); this page is the mechanics.

## 1 · Input: the recording manifest

`docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz` (schema `rbn.voice.production/1`), built by
`node tools/voice/production_manifest.mjs` from the script at the named source revision. `SUMMARY.json` beside it
gives the counts. Check that it matches the script before starting:

```
node tools/voice/production_manifest.mjs --check
```

It prints `manifest is current: …` (exit 0), or exit 1 if the script changed since the manifest was built.

### One entry per recording (`entries`)

| Field | Meaning |
| --- | --- |
| `id` | The recording id, `r1-` + 16 hex. Made from speaker, player voice, dialect, delivery, spoken text and, for the player, pitch. A changed line gets a new id; an unchanged one keeps its id across revisions. |
| `speaker` | `narrator`, `pc` (the player), `nao`, `mio`, `ren`, `suzu`, or the NPC's id. |
| `voice`, `pitch` | The player only: `voice` `A` or `B`, `pitch` `high` or `low`. Every player line is four entries. `null` for everyone else. |
| `dialect` | `standard`, or `kansai` (Suzu's lines where the Kansai table changes them). |
| `delivery` | The line's expression in the script (`neutral`, `smile`, `worried`, …). |
| `send` | **The text to send to the engine.** Names are given as their own kana; a seam's kanji is written as the reading the line means. |
| `spoken` | The line as written, without readings or the learner spacing (for engines with their own reading control). |
| `kana` | The whole line in the game's own readings. |
| `names` | The names in the line, with their readings. |
| `seams` | Where removing the spacing joins two words into a compound read differently: `joined` (今朝), `wouldRead` (けさ), `means` (いま\|あさ), `kanji`, `kana`. |
| `chars`, `morae`, `pauses` | For planning. |
| `textHash` | SHA-256 of `spoken`, first 16 hex. |
| `lines` | Every line this recording serves: `key` (`scene#hash`), `scene`, `file`, `line`; `attribution` for a companion line; `frozen` when a VA-1 or VA-2 case binds it. |

**Text rules.**
- **What is sent.** Never send the display markup, a speaker label or the English. Send `send`. An engine with its own
  reading control may send `spoken` and apply `names` and `seams` through it instead.
- **Frozen audition text.** A frozen audition case (`frozen`) keeps its own text in VA-1 or VA-2. The batch records the
  game's line as given here, even where the two differ.

### The narrator's reference readings (`references`)

These are the recordings for Listen / Say it / Hear it on a kana, a kanji or a word (LI-8). The narrator records them
in a plain citation delivery: clear, unhurried, the same pitch every time, no character in it.

| Field | Meaning |
| --- | --- |
| `id` | `r1-ref-` + 16 hex. |
| `key` | `kana:あ\|あ`, `kanji:<kanji>\|<readings>`, `word:<written>\|<reading>`. Two words with one reading and different kanji are two recordings. |
| `spoken` | What to say. A kanji's readings are a short list in the chart's order. A particle is sent as it is said (は → わ, へ → え, を → お). |

### Listed apart

- **`notRecordable`:** 115 lines with a run-time name (`$name`). These are not in this batch; see PRODUCTION_SCOPE.md.
- **`nonverbal`:** lines that are only a pause (「……」). They are a beat in the scene and are not recorded.

## 2 · Variants and file names

**One file per recording id.**
- **Dialogue:** `<speaker>/<id>.opus`.
- **Reference readings:** `ref/<id>.opus`.

The id already carries the variant, so nothing else is needed in the name. For example:

| Entry | File |
| --- | --- |
| player, Voice A, High | `pc/r1-1a2b….opus` |
| player, Voice A, Low | `pc/r1-9c8d….opus` |
| Suzu, Kansai | `suzu/r1-77aa….opus` |
| the word 橋 (はし) | `ref/r1-ref-3f….opus` |

**The player's High and Low.** These are two recordings each, so each gets its own file. They may come from one take
moved ±2 semitones with the formants kept, as VA-2 made them. The casting record says which.

## 3 · Encoding (C-93; VA-2's delivery)

- **Format:** Ogg Opus, 48 kHz, mono. This is VA-2's render setting: libsndfile `format='OGG', subtype='OPUS',
  compression_level=0.8`, about 57–58 kbit/s.
- **Not lower.** Robin, 2026-10-16: "Do not lower audio quality merely to fit the current oversized deployment."
  32 kbit/s is not the delivery.
- **Loudness:** one loudness for every line: −20 LUFS integrated, peaks under −1 dBFS (C-93).
- **Edges:** trimmed as VA-2 trimmed them.
- **Clean endings:** no trailing consonants and no breathy tails that delay words. As in VA-2, at most three tries,
  keeping the cleanest, and still-flagged takes listed.
- **Treatments:** supernatural speakers keep their treatment, and the Hush has no voice. Mochi's ニャー is the sourced
  CC0 meow (C-93).

## 4 · Output: `results.json` (schema `rbn.voice.results/1`)

```json
{
  "schema": "rbn.voice.results/1",
  "contentHash": "<the manifest's contentHash>",
  "sourceRevision": "<the commit the manifest was taken from>",
  "encoding": { "format": "Ogg Opus", "sampleRate": 48000, "channels": 1, "libsndfileCompressionLevel": 0.8, "lufs": -20 },
  "casting": {
    "<speaker>[/<voice>/<pitch>]": { "engine": "qwen3-tts | aivis | nemo | sound", "model": "…", "revision": "…",
      "voice": "…", "style": "…", "params": {}, "pitchSemitones": 0, "fx": null, "referenceSha256": "…" }
  },
  "recordings": {
    "<id>": { "file": "<speaker>/<id>.opus", "bytes": 12345, "sha256": "<64 hex>", "seconds": 1.73,
      "lufs": -20.0, "peakDb": -3.1, "tries": 1, "flags": [] }
  }
}
```

Every file has its exact `bytes` and `sha256`. `casting` is Robin's accepted cast as used, per speaker (and per player
voice and pitch), with each reference file's hash. It is the casting record C-91 asked for.

## 5 · The runtime manifest (schema `rbn.voice.runtime/1`)

```
node tools/voice/runtime_manifest.mjs --results results.json --voice-build <id> --files <audio folder> \
  [--base <relative path | pack:<id>>] --out manifest.json
```

The tool refuses three things:
- results made for another script (`contentHash`);
- an absolute base;
- a file whose size or SHA-256 differs from the results.

It writes the following:

| Field | Meaning |
| --- | --- |
| `schema` | `rbn.voice.runtime/1` |
| `voiceBuild` | Your id for this set of recordings; it is the folder name. |
| `base` | Where the files are, relative to the game page (below). |
| `scriptContentHash` | The script these recordings say. |
| `lines` | `{ "<line key>": [ { speaker, dialect, delivery, voice?, pitch?, file, bytes, sha256, seconds, textHash } ] }`: every variant of every line. |
| `references` | `{ "<kind:written\|reading>": { file, bytes, sha256, seconds } }` |
| `totals` | Files, bytes, seconds, and what is missing. |

The game finds the recording for a line by the line's key (`scene#hash`), its speaker and dialect, and for the player
the player's chosen voice and pitch. A line whose key is not in the manifest falls back to the device voice. Stale audio
is never played as "close enough".

### Where the files live (`base`)

| Option | `base` | Notes |
| --- | --- | --- |
| Beside the game | `./voices/ja-JP/<voiceBuild>/` | Only if the game's site has room; it does not today (`docs/hosting/RUNTIME_PUBLISHING.md`). |
| A separate Pages repository | `../Road-of-Borrowed-Names-voices/ja-JP/<voiceBuild>/` | Same origin (`a-birdi.github.io`), so the page's `connect-src 'self'` allows it. No absolute address goes into the game. |
| An imported Release pack | `pack:<voiceBuild>` | A ZIP the player chooses in the game; read locally and stored in the browser, never fetched. Each Release file must be under 2 GiB. |

The same recordings and the same manifest serve all three; only `base` differs. Which one is used is Robin's choice
(RUNTIME_PUBLISHING.md).

## 6 · A later script change

1. Rebuild the manifest at the new revision.
2. Every entry whose id is already in `results.json` keeps its file.
3. Only new ids are recorded.
4. Ids no longer in the manifest are dropped from the next runtime manifest. Their files may stay in the voice folder
   so a page opened before the update still finds them.

## 7 · What comes back to this repository

- **Comes back:** `results.json`, the casting record inside it, and a run summary (counts, flagged takes, time).
- **Does not come back:** the audio. Putting it here would put it in the game's site, which has no room. The audio
  waits on Robin's PC until Robin chooses where it is published.
- **The game itself:** the game plays recordings only after a separate runtime change. That change reads the runtime
  manifest, adds the player's voice and pitch choice, and falls back to the device voice. It is made when results
  exist.
