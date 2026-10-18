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
| `key` | `kana:あ\|あ`, `kanji:<kanji>\|<readings>`, `word:<written>\|<reading>`, `phrase:<reading>`. Two words with one reading and different kanji are two recordings. |
| `kind` | `kana`, `kanji`, `word`, or `phrase` (the listening steps' transcripts, karuta's proverbs, the ring toss's descriptions, the shells' fragments: read in a plain reading delivery). |
| `spoken` | What to say. A kanji's readings are a short list in the chart's order. A particle is sent as it is said (は → わ, へ → え, を → お). |

### Listed apart

- **`notRecordable`:** 116 lines with a run-time name (`$name`). These are not in this batch; see PRODUCTION_SCOPE.md.
- **`nonverbal`:** lines that are only a pause (「……」). They are a beat in the scene and are not recorded.

## 2 · Variants and file names

**One file per recording id.**
- **Dialogue:** `<speaker>/<id>.opus` in the worker's own folder.
- **Reference readings:** `ref/<id>.opus`.

The site tool renames the files to their content-named addresses (§5).

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
- **Treatments:** supernatural speakers keep their treatment, and the Hush has no voice. Mochi's ニャー is Robin's
  pick H8, a meow cut from Heismark's public-domain "Meow of a pleading cat.oga" (PRODUCTION_SCOPE.md).

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

## 5 · The voice site the game reads (schema `rbn.voice.site/1`)

```
node tools/voice/voice_site.mjs --results results.json --files <audio folder> --voice-build <id> --out <site>/ja-JP
```

The tool checks every file's size and SHA-256 against the results, then writes the folder below. It accepts a result
for any recording id the current manifest lists, under whichever manifest revision the result was made.

| Path | What it holds |
| --- | --- |
| `index.json` | `{ schema, voiceBuild, scriptContentHash, made, timing: "estimated", encoding, scenes: { <scene>: <path> }, refs: <path>, totals }`. The only file that changes in place; the game revalidates it once a session. |
| `idx/s/<scene>.<sha12>.json` | `{ lines: { <line key>: [ variant … ] } }`, one per scene, named by its content |
| `idx/refs.<sha12>.json` | `{ <ref key>: { id, f, b, h, t } }`, the reference readings and phrases |
| `rec/<speaker>/<id>.<sha12>.opus` | each recording, named by its id and the first 12 hex of its audio's SHA-256; reference readings under `rec/ref/` |

A variant is `{ id, sp, d, v?, p?, f, b, h, t, th }`:
- `sp` is the speaker.
- `d` is `s` (standard) or `k` (Kansai).
- `v` (`A` or `B`) and `p` (`h` or `l`) are given for the player only.
- `f` is the file, `b` its bytes, `h` its SHA-256 and `t` its length in seconds.
- `th` is the spoken-text hash; the game plays the file only when the line it shows hashes to it.

Missing recordings are counted, and their lines fall back.

### Where the site lives

**The game's own copy:** the game reads the site from one base path relative to its page, set in `src/audio/52_voicebank.js` (`HOSTED_BASE`).

| Option | Base | Notes |
| --- | --- | --- |
| Beside the game | `./voices/ja-JP/` | Only if the game's site has room; it does not today (`docs/hosting/RUNTIME_PUBLISHING.md`). |
| A separate Pages repository | `../Road-of-Borrowed-Names-voices/ja-JP/` | Same origin (`a-birdi.github.io`), so the page's `connect-src 'self'` already allows it. No absolute address goes into the game. |

**The voiced offline package:** `tools/publish/offline_package.mjs --site <site> --out <dir>` copies the same site beside a copy of the page, with the indexes embedded in it.

**Which one:** the choice of host is Robin's. Generation does not wait for it: the same files serve every option.

## 6 · The recording key: what makes a recording the same one

`id = "r1-" + sha256(speaker | voice | dialect | delivery | spoken [| pitch])[:16]`. The parts are joined with U+0001, and pitch is added for the player only.

| Part | Values |
| --- | --- |
| speaker | `narrator`; `pc`; `nao`, `mio`, `ren` or `suzu` (a "whoever travels with you" line is attributed to each companion who can say it: its condition, else the branch it sits in, else a scene named for one companion; `lines[].attribution` says which); or the NPC's id |
| voice, pitch | the player's `A`/`B` and `high`/`low`; empty for everyone else |
| dialect | `standard`, or `kansai` (only where Suzu's Kansai line says something different) |
| delivery | the line's expression in the script, or `neutral` |
| spoken | the normalized text (§7) |

**Reference readings:** `"r1-ref-" + sha256(key \u0001 spoken)[:16]`, where the key is one of:
- `kana:<k>|<k>`;
- `kanji:<k>|<readings joined with 、>`;
- `word:<written>|<reading>`;
- `phrase:<reading without spaces>`.

The same speaker saying the same words in the same way is one recording, wherever the line appears. Two characters
saying the same words are two.

## 7 · Pronunciation normalization (what the engine is sent)

1. **The display markup goes.** Readings are dropped: `{今|いま}` → `今`.
2. **The learner spacing goes.** The spaces between words, and every other whitespace, are removed.
3. **Unicode is NFC.** That gives `spoken`, the text the recording id and `textHash` come from.
4. **Names are given in their own kana.** A name's own reading from the script replaces its kanji, so no engine guesses a name (VA-2's method, `textNamesKana`). The result is `spokenNamesKana`.
5. **Seams are written as the reading the line means.** Where removing the spacing joins two words into a compound with a different reading (21 recordings), the kanji are replaced by each word's own reading from the line: 今朝 is sent as いまあさ, never けさ. The result is `send`.
6. **Particles in reference readings are sent as said.** は → わ, へ → え, を → お.
7. **Never sent:** the speaker label, the English, a run-time variable (those lines are listed in `notRecordable`), or a line that is only a pause (`nonverbal`).
8. **A send correction for one recording.** Where an engine cannot say a recording's `send` (words skipped or rushed on
   every seed), Cloud may give that recording a corrected send: the reading the line means, in kana, with a silent
   opening beat left out. The display and `spoken` do not change, so the id, the line keys and the recording's place in
   the site stay. The new take replaces the file in the results (its entry adds `send`), and the replaced takes move to
   `superseded/<stamp>/`. Corrections are listed, append-only, in
   [supplements/SEND_CORRECTIONS.json](supplements/SEND_CORRECTIONS.json) (the first: SC1, Wataru's
   「……辞めさせないんですか。」 sent as 「やめさせないんですか。」, Robin 2026-10-18). A line whose words change is never handled
   this way: it gets a new id (§8).

An engine with its own reading control may send `spoken` and apply steps 4–5 through that control. The casting record
says which was done.

## 8 · A later script change

1. Rebuild the manifest at the new revision.
2. Every entry whose id is already in a results file keeps its file, and its address in the site does not change.
3. Only new ids are recorded, as a supplement.
4. Ids no longer in the manifest drop out of the next site's indexes. Their files stay for one build, so a page opened
   before the update still finds them; files older than that are listed, and removed from the publishing folder only
   with `--prune-older`.
5. The whole site folder, kept files included, is measured against the size guard's ceiling (900,000,000 bytes by
   default; `tools/publish/site_size.mjs`) every time it is written. Over it, the tool exits 1: not to be deployed as
   it is.

## 9 · What comes back to this repository

- **Comes back:** `results.json`, the casting record inside it, and a run summary (counts, flagged takes, time).
- **Does not come back:** the audio. Putting it in this branch would put it in the game's Pages site, which has no room. The audio waits on Robin's PC until Robin chooses where it is published.
- **The game already plays the site.** The runtime is in place and tested with synthetic recordings (VOICE_RUNTIME.md); `HOSTED_BASE` is set when the host is chosen.
