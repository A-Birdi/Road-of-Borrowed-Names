# Hosting: what Pages publishes, the runtime-only set, and room for the voices

Robin, 2026-10-16:
> "For hosting, audit the actual unpacked Pages output and prepare a runtime-only publishing directory. Keep all
> development evidence in GitHub, but do not publish screenshots, test fixtures, tooling or audition galleries unless
> they are deliberately required public pages."
>
> "Do not lower audio quality merely to fit the current oversized deployment. Prepare a configurable, versioned voice
> manifest so a separate GitHub Pages voice repository or imported Release pack can serve the same recordings if
> needed."
>
> "Do not change the existing game URL or remove saves."

The game's URL is **https://a-birdi.github.io/Road-of-Borrowed-Names/** and stays so under every option below. Saves
live in each player's browser, under that origin. Nothing here touches them.

Nothing in this page was deployed, and no Pages setting was changed. The tools write local folders only.

## The four figures

Bytes are exact where measured. "MB" is 10⁶ bytes. The limit is GitHub's documented "Published GitHub Pages sites may
be no larger than 1 GB". The margins below are taken against 1,000,000,000 bytes, the stricter reading. Against
1 GiB (1,073,741,824 bytes) each margin is 73.7 MB larger.

| | Files | Bytes | Against 1 GB |
| --- | ---: | ---: | --- |
| **1 · Published now** (the whole task branch, every push) | 5,194 | 1,072,095,009 | **72.1 MB over** (1.6 MB under 1 GiB) |
| **2 · Runtime only** (page, every recording, notices, GPL-2 source) | 625 | 523,674,397 | 476.3 MB left |
| **3 · Voice** (estimate; dialogue, reference readings and phrases, the site's indexes) | 26,891 | about 665 MB | see below |
| **4 · Runtime + voice in one site** | about 27,500 | about 1,188 MB | **about 188 MB over** |
| 4a · Runtime site + a separate voice site, same origin | 625 + 26,891 | 523.7 MB + about 665 MB | 476.3 MB left + about 335 MB left |
| 4b · Runtime site + voices as an imported Release pack | 625 | 523.7 MB | 476.3 MB left (the pack is not on Pages) |

So the game and its voices do not fit one Pages site at the chosen quality. They fit as two sites on the same origin
(4a), or as one site plus an imported pack (4b). Both are prepared (below); neither is set up.

### 1 · What Pages publishes today (measured)

- **Pages publishes the whole branch.** It serves the root of `claude/stoic-sagan-n3jvgk` (legacy Jekyll build) and
  republishes on every push.
- **472 deployments.** GitHub's deployment records list 472 deployments of this branch to `github-pages`, from
  2026-09-27 to the latest, 66cee38 at 2026-10-16 05:25 UTC.
- **The artifact matches the branch.** The deployed artifact for f1c4415 (`github-pages`, 992,981,353 bytes compressed)
  was downloaded and unpacked. It held exactly the branch's tree: 5,180 files and 1,071,939,269 bytes on both sides,
  with no Jekyll pages added or dropped.
- **Today's figure.** The current tree (this commit's parent, 948b34d) has 5,194 files and 1,072,095,009 bytes. This
  page and its list add about 0.1 MB.

What it holds:

| | Files | Bytes |
| --- | ---: | ---: |
| Needed at run time (index.html, 464 recordings, 3 notices) | 468 | 518,266,440 |
| Screenshots and captures (`docs/screenshots/`) | 1,860 | 321,364,473 |
| Music evidence and listening pages (`docs/music/`) | 270 | 157,761,942 |
| Review data (`docs/review/`) | 35 | 19,377,449 |
| Source (`src/`), tests, tools, art sources, plans, records and the rest | 2,561 | 55,324,705 |

- **Nothing missing.** Every recording the page's catalog names is in the branch with its catalog size and SHA-256
  (464 of 464).
- **Nothing extra needed.** The page's Content-Security-Policy (`connect-src 'self'`, `media-src data: blob:`) lets it
  fetch only same-origin files, and it fetches only `./assets/music/ensemble/`.

**A correction to the records.** HANDOFF.md, VALIDATION.md and REQUIREMENTS.md said the hosted release was "not
deployed" (C-87's gate). In effect it was: Pages has served each pushed `index.html` and the Ensemble recordings at the
URL above since 2026-09-27.
- The lead did not set this up and has not changed it.
- C-87's order ("deploying the hosted page comes last") describes the deliberate release. It did not describe this
  standing publication.
- The records now say both.

### 2 · The runtime-only set (prepared and tested)

`node tools/publish/prepare_runtime.mjs --out <empty folder>` copies the set the built page needs into a new folder.
It reads the set from the page itself, so nothing is listed by hand. It then checks every copy's size and SHA-256 and
writes `RUNTIME_FILES.tsv` (path, bytes, hash, category) and an empty `.nojekyll`.

| | Files | Bytes |
| --- | ---: | ---: |
| `index.html` (the whole game) | 1 | 23,612,727 |
| Ensemble recordings, Ogg Opus | 232 | 238,692,066 |
| Ensemble recordings, MP3 (for browsers without Opus) | 232 | 255,936,992 |
| Their licence notices: `NOTICE.md`, `GPL-2.txt`, the sound bank's copyright | 3 | 24,655 |
| Their GPL-2 source: `src/audio/`, `tools/music/ensemble/`, `docs/music/ensemble/qa/`, `manifest.json` | 155 | 5,320,595 |
| `RUNTIME_FILES.tsv`, `.nojekyll` | 2 | 87,362 |
| **All** | **625** | **523,674,397** |

**Why the source is in it.** The Ensemble recordings are GPL-2 (C-92), and their NOTICE.md says the source needed to
make them again is published with them: "When the recordings are published with the hosted game (C-87), these are
published with them." That is a deliberately required public part, about 5 MB. `--without-gpl-source` leaves it out,
only if Robin decides a link to this repository is enough.

**What is left out.**
- **Development evidence:** screenshots, test fixtures, tooling, records and plans.
- **Galleries and listening pages:** the audition galleries, `docs/music/ensemble/listen*.html` and the review data.

All of it stays in GitHub, in the repository.

**Old recordings.** `--keep <previous RUNTIME_FILES.tsv>` also copies the recordings an earlier build named, while they
are still in the checkout. A page opened before an update can then still fetch them.

**Tested in a browser** (`tests/e2e/runtime_publish.mjs`, Chromium). The folder is served on its own:
- The game loads with no page error and no request to another origin.
- The page itself fetches all 464 recordings (494,629,058 bytes), each with its catalog size and SHA-256.
- Ensemble music sounds.
- Development files answer 404.

The list for this commit is committed as `docs/hosting/RUNTIME_FILES.tsv`.

The folder itself is not committed. Pages publishes the branch root, so a copy in the branch would be published too and
would add about 0.52 GB to what is published today.

### 3 · Voice in the delivery encoding (estimated from measurements)

**The encoding:** C-93's delivery, as VA-2 rendered it on Robin's PC.
- Ogg Opus, 48 kHz mono, about 58 kbit/s (`va2_render.py`: libsndfile compression level 0.8).
- One loudness for every line: −20 LUFS integrated, peaks under −1 dBFS.
- Measured here with the same libsndfile (1.2.2): 57.1 kbit/s on a minute of programme and 57.8 kbit/s on a modulated
  test signal, plus about 900 bytes of headers per file. The estimate uses 58 kbit/s and 900 bytes.

**The quality is not lowered.** Nothing here proposes a lower bitrate, fewer channels or a lower rate to fit (Robin:
"Do not lower audio quality merely to fit the current oversized deployment").

`node tools/voice/delivery_estimate.mjs` estimates from three inputs:
- what the production manifest says will be recorded;
- the measured speaking rate of the 595 VA-2 casting takes, per section, in seconds per character of the text each
  engine was sent: narrator 0.1713, companions 0.2063, NPCs 0.1997, player 0.1886;
- for the reference readings, the narrator's rate plus 0.4 s of edges per short citation take. This edge is an
  assumption, to be measured on a dozen citation takes first (PRODUCTION_ESTIMATE.md §1b).

For the corrected script (C-95 applied, with the D6 lexicon; script content `65cd38053ad6`; `node tools/voice/delivery_estimate.mjs`):

| | Files | Hours | Bytes |
| --- | ---: | ---: | ---: |
| NPCs (281 speakers) | 3,662 | 6.36 | 169.3 MB |
| Companions (Nao, Mio, Ren, Suzu; Suzu's Kansai where it differs) | 5,632 | 9.04 | 241.0 MB |
| Narrator | 4,791 | 5.95 | 159.7 MB |
| Player, Voice A and Voice B, each Higher and Lower | 636 | 0.60 | 16.1 MB |
| Reference readings and phrases (kana, kanji, words; LI-8; the learning controls' phrases) | 9,095 | 2.49 | 73.1 MB |
| The voice site's indexes (`index.json`, one per scene, the reference index; 2.4 MB gzip on the wire) | 3,075 | | 6.0 MB |
| **All** | **26,891** | **24.4** | **665.1 MB** |

**Why this is an estimate.** No full-game recording exists, so this is not a measured total. The site tool records
each real file's bytes and SHA-256, so the real figure is known the moment the files are.

The figure counts:
- **Corrected companion attribution.** The manifest attributes companion lines through their branches (RV-0160), so
  each companion records only the lines they can say.
- **Each recording once.** One recording serves every line that says the same thing in the same voice.
- **The player four times.** Voice A and B, each High and Low.

The VA-1 and VA-2 audition takes are not part of it: they stay with Robin's local runs.

### 4 · Combined, and the margin

The runtime set and the voices together come to about 1,188 MB. That is about 188 MB over 1 GB, and about 114 MB over
1 GiB. They do not fit one Pages site at the chosen quality.

Two ways keep the quality and the URL. Both are prepared in the voice manifest (`docs/future/voice/production/VOICE_DELIVERY.md`):

**4a · A separate Pages repository for the voices.** For example, `A-Birdi/Road-of-Borrowed-Names-voices`, served at
`https://a-birdi.github.io/Road-of-Borrowed-Names-voices/`.
- **Same origin.** That is the same origin as the game (`a-birdi.github.io`), so the page's existing `connect-src 'self'`
  already allows it.
- **Relative base.** The voice manifest's `base` is a relative path (`../Road-of-Borrowed-Names-voices/ja-JP/<build>/`),
  so no absolute address is written into the game.
- **Margins.** Each site stays under the limit: the game's 523.7 MB leaves 476.3 MB, and the voices' about 665 MB leaves
  about 335 MB.
- **Cost.** Creating that repository and turning on its Pages is Robin's step, since it publishes something new. There
  is no cost.

**4b · A Release pack the player imports** (not the primary release: Robin, 2026-10-16, the hosted game plays the cast
"without … manually importing a voicebank"; the voiced offline package below covers playing from disk). The same recordings and the same manifest (with `base: pack:<build>`) go in
one or more ZIP files attached to a GitHub Release. Each file must be under 2 GiB.
- **How the player uses it.** The player downloads the pack and chooses it in the game. The game reads it locally and
  stores it in the browser. Nothing is fetched from the Release by the game.
- **Not built.** The voiced offline package (`tools/publish/offline_package.mjs`, tested) plays the same recordings
  from disk with no import step, so an importer is not planned. Releases are made by Robin.

**Bandwidth.** GitHub documents a soft bandwidth limit of 100 GB a month for Pages. The game fetches a voice line only
when it is about to be spoken (and the next three ahead) and keeps what it heard, so a journey costs what it plays, not
665 MB.

## What needs Robin (nothing here is done without it)

1. **Publishing only the runtime set** keeps the URL and stops the 1 GB problem. Pages publishes the branch root today,
   so this needs a Pages setting changed: Settings › Pages › Source: "GitHub Actions". A workflow then builds the
   runtime folder from the branch and publishes it.
   - A draft workflow is at `docs/hosting/pages-runtime.workflow.yml`. It is outside `.github/workflows/`, so it
     does nothing.
   - To use it, Robin copies it into `.github/workflows/` and changes the setting. Robin can say so and the lead makes
     the copy; the setting itself stays Robin's.
   - Until then every push keeps publishing the whole branch.
2. **Voices: where to publish them.** 4a, a same-origin voice repository, is the lead's recommendation for the primary
   release, since the game then plays the cast with nothing to install or import. The voiced offline package serves
   playing from disk. No audio is made by any of this.
3. **Old Ensemble recordings.** Should the runtime set keep recordings an earlier build named (`--keep`)? Then a page
   opened before an update still finds them. They are kept only while the files are still in the checkout.
4. **The GPL-2 notice inside the game.** The game's own screens do not mention that the Ensemble recordings are GPL-2.
   The notice and licence are served beside them. This is noted, not changed.

## How the numbers were made (for checking)

| Figure | Command or source |
| --- | --- |
| Published now | `git ls-tree -r -l HEAD` (sum of blob sizes); identical to the unpacked artifact of f1c4415 |
| Runtime only | `node tools/publish/prepare_runtime.mjs --out <dir>`, then `RUNTIME_FILES.tsv` |
| Runtime, served on its own | `node tests/e2e/runtime_publish.mjs` (3/0, Chromium) |
| Voice | `node tools/voice/delivery_estimate.mjs` (on the committed production manifest) |
| Deployments | GitHub's deployment records for `github-pages` |
