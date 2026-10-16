# The full-game voice batch: authorization and agreed scope

## The authorization (production), kept apart from the auditions

Robin, 2026-10-16:
> "The voice/casting reviews are complete. Do not reopen VA-1 or VA-2."
>
> "Then fix the production plan's companion-branch attribution and pronunciation-seam handling, rebuild it from the
> corrected script, and provide the local worker the exact source revision and manifest. Keep the full-game production
> authorization distinct from audition approval; record the scope already agreed with me."
>
> "Handle D6 word-help/support corrections in parallel; do not hold unchanged dialogue generation for
> explanatory-note-only work."

This is the full-game production authorization. It is a separate thing from the audition approvals:
- **Auditions.** VA-1's runner (`tools/voice/audition.mjs`) still accepts only authorizations whose `purpose` is
  `"audition"`. Nothing here widens it.
- **Production.** Nothing about the auditions authorizes production.
- **VA-1 and VA-2 stay closed.** Their frozen texts and takes are not changed or rerun.

**What it covers:** recording the game's lines and the narrator's reference readings, as the recording manifest lists
them, on Robin's PC with free local engines, in Robin's accepted cast, at the source revision named in `GO.json`.

**What it does not cover:**
- **Spending.** Any hosted or paid synthesis, account, key, purchase, subscription or paid fallback. This is Robin's
  standing rule: "No hosted synthesis, including Gemini, ElevenLabs, Azure, DashScope, or hosted free trials. No
  purchases, new accounts, billing activation, API credentials, paid compute, subscriptions, or automatic paid
  fallback."
- **Publishing.** Publishing the recordings anywhere: a voice repository, a Release or the game's site
  (`docs/hosting/RUNTIME_PUBLISHING.md`, Robin's choice).
- **Reopening the auditions.** Any new audition or casting round.
- **Out-of-batch speech.** Generating speech in the game at run time (C-93: "No need for the generative new voices").

**The go signal is `GO.json` in this folder.**
- It names the source revision, the manifest's SHA-256 and the script's content hash.
- It is written after C-95's corrections are in the script and the manifest is rebuilt from them.
- Until it exists, the batch waits. A tooling checkpoint is not the go signal.

## The agreed scope (C-91, C-93; `docs/future/plan/11_CONTRADICTIONS.md`)

### Engines and roles (Robin, C-93)

> "I'm thinking for the narrator, use one of the AivisSpeech models with a directed tone. Player A/B should have two
> separate A/B voices; a higher and lower pitch options for each of their voices, respectively. NPCs in general should
> use a mix of the instruction-capable Qwen3-TTS and AivisSpeech models. … Critically though, lines need to not have
> trailing consonants or overly-breathy sounds that delay words in odd ways. … VOICEVOX Nemo had really only done
> better than some of the others for the Middle-aged Man voicelines, and could be considered for those exclusively."

- **Narrator:** one AivisSpeech model with a directed tone. Narration and the reference readings (citation delivery).
- **Player:** Voice A and Voice B, each at a High and a Low pitch. Every player line is recorded four times.
- **Companions:** Nao, Mio, Ren and Suzu in the voices Robin chose from VA-2's companion sets. Suzu's Kansai lines are
  recorded where the dialect table changes them.
- **NPCs:** Qwen3-TTS by default. AivisSpeech for bubbly, high-energy feminine voices. VOICEVOX Nemo for middle-aged men
  only.
- **NPC choices stand.** "If I dislike any choices per an NPC, I'll let you know; record that anything I don't note as
  disliked should be authoritative to use those model/settings."
- **Supernatural speakers** sound so. The Mill Echo has a slight echo.
- **The Hush has no voice and no lines.** Its speaking agent, the Tide Clerk, keeps the foreboding treatment.
- **Mochi's ニャー** is a sourced recording, not a voice. It is **Robin's pick H8 (round 3)**: a single meow cut from
  "Meow of a pleading cat.oga" by Heismark on Wikimedia Commons, public domain (PD-self), 6.65–7.64 s of the source.
  - This was reported by the local worker on 2026-10-16. It replaces the Tsester CC0 meow that VA-2's run used and
    that this page first named.
  - The casting record in `results.json` carries the source, the cut and the hash.
- **One loudness** for every line, trimmed alike: "The equalized loudness is best."
- **A speaking person always in their own voice.** The narrator speaks narration (C-93's answer on mixed models).

### The cast as accepted

Robin's picks were made locally, on Robin's PC, in VA-2's gallery. **This repository holds no copy of them.** VA-2's run
summary records the gallery as unpicked when it was made.

The local worker reported on 2026-10-16: "Final cast locked locally (player A = Set 3A, B = Set 1B, High/Low; all
accepted references kept)."
- **Player:** Voice A is VA-2's Set 3A, Voice B is Set 1B, each with its High and Low.
- **Everyone else:** the narrator, the companions and the NPCs are as Robin accepted them on the PC.
- **The casting record comes back.** It is returned in `results.json` (`casting`: engine, model and revision, voice,
  style, settings, pitch and the hash of each accepted reference). It becomes the repository's casting record (C-91: "one
  casting record across providers").
- **The lead does not reconstruct the cast.**

### The player's name (C-93)

There are 116 lines with the traveller's name in them, listed under `notRecordable` in the manifest. They are not in
this batch.
- **Robin's rule.** A recording says a neutral word in place of the name. A line that is only the name ("Robin…")
  becomes the speaker's natural way to say "you" to the traveller (あなた, 君, お前… by their relation).
- **What is needed first.** Those spoken texts must be written per speaker before they can be recorded. They are a
  second, small pass.
- **Meanwhile:** the device voice reads those lines with the name, and the screen always keeps the name.

### What is recorded, and how

- **The lines.** The game's lines, after C-95's corrections, as the manifest lists them. A frozen audition case keeps
  its own text; the batch records the game's line.
- **Companion lines** belong to the companions who can say them: through the line's condition, then its branch, then a
  scene named for one companion (RV-0160).
- **Seams and names** are resolved in `send`, so no engine reads a joined compound the line does not mean (RV-0006).
- **The narrator's reference readings** are recorded in the same batch (LI-8), with the phrases the learning controls and
  pastimes read: the listening steps, karuta, the ring toss and the shells. Those controls then work without a device voice.
- **Delivery encoding:** VA-2's. Ogg Opus 48 kHz mono, about 58 kbit/s, −20 LUFS. Not lowered to fit any site.
- **The contract** (variants, file names, results, runtime manifest) is in [VOICE_DELIVERY.md](VOICE_DELIVERY.md).

### Before anything ships

- **Listening.** Someone hears every recording (PRODUCTION_ESTIMATE.md §4). That listening is Robin's.
- **Repairs.** At most one repair per flawed line without a scoped reason (VA1_ADDENDUM §05).
- **The game plays the recordings** only after its runtime change (VOICE_DELIVERY.md §7). Until then nothing in the
  game's speech changes.
