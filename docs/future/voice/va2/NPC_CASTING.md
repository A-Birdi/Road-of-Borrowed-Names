# VA-2 · NPC casting (one sample per NPC)

Casting data for the render job on Robin's PC. No audio was made here. The machine-readable table is
`npc_casting.json` in this folder (schema `rbn-va2-npc-1`). This page sums up how the table was decided and lists the
calls Robin should check first.

## What is covered

All 281 speakers in `tools/voice/lines.mjs` `allLines()` other than the narrator, the player and the four companions.
Together they have 3,859 lines. Each entry has:

- a profile (age, voice presentation, register, occupation, temperament, an always-on mood where there is one);
- the evidence behind it, from the character record, the content comments, narration and other speakers' lines;
- the engine and its settings;
- an effect preset for supernatural speakers;
- one sample line, taken unchanged from `allLines()` (scene, key, jp, plain, en).

Entries are sorted by home region in story order, then by line count. The home region comes from the id's region
prefix where there is one; otherwise it is the story region with the most lines.

## How the calls were made

- **Evidence first.** I read the definition comment for every NPC. Many region files also list pronouns (for
  example `cr/05_data.js`, `yn/05_data.js`, `ko/05_data.js`, `settle/01_region.js` and the Hall's `01_region.js`).
  Narration ("Tsuru narrows her eyes") and other speakers' lines filled the gaps, along with each NPC's own Japanese
  (first-person pronoun, sentence endings, keigo, dialect) and the look fields (`age: 'old'`, `size: 'child'`, beard).
- **Robin's engine rules.**
  - Qwen3-TTS VoiceDesign is the default. Each description is written in plain English and ends with: "Clear
    articulation; every word ends cleanly; no breathiness, no trailing sounds."
  - AivisSpeech is used only for bubbly or high-energy feminine voices.
  - VOICEVOX Nemo is used only for ordinary middle-aged men. Middle-aged men with a strong particular character stay on
    Qwen: Manbē the showman, Tokubē the tonic seller, Ryūsui the vain author and Ujie the ceremonious barrier keeper.
- **Wording.** I avoided words that tend to make a designed voice breathy (soft, quiet, tired, dreamy, faltering,
  thin). Where a character is like that, the description asks for the manner and keeps the sound fully voiced.
- **Delivery.** Every sample is read neutrally, except children who are always excited or happy (see below).
- **No caricature.** Voices are cast by fit, never by a pitch rule attached to pronouns. They/them characters are cast
  by fit and not given a forced gender; with these, the fit is usually a voice that is not strongly gendered. Elders
  are given firmness, not frailty. Children speak ordinarily.
- **Samples.**
  - Each sample is 8–45 spoken characters where possible.
  - No sample has a run-time variable (`$name`, `$boat`, …).
  - I preferred lines that show the speaker's register.
  - I avoided late twists where an equally good line existed. For example, Tōya gets 「……鳴った。やっと。」 rather than
    his argument in Kasane's folio.

## Counts

| | |
|---|---|
| Engine | qwen_design 251 · aivis 18 · nemo 12 |
| Effect | none 253 · spirit 10 · hollow 6 · echo_light 4 · ghost 4 · ancient 2 · hush 1 · ember 1 |
| Age | elderly 76 · adult 89 · young adult 41 · middle-aged 32 · child 27 · teen 3 · ageless 13 |
| Presentation | masculine 133 · feminine 115 · androgynous 33 |
| Delivery | neutral 267 · happy 8 · excited 6 |

- **Aivis (18).**
  - AV-girl: Mame, Miyo, Chiyo, Hinata, Kei, Nana, Mina, Koma, Momo (the Hall).
  - AV-bright: Asahi, Masu, Sayo (Cinder Orchard), Nui, Onatsu.
  - AV-sweet: Setsu, Okiyo.
  - AV-showy: Uki, Koume.
  - AV-teen is unused. No lively teenage girl is established; Natsume and the Hall's Shino are calm.
- **Nemo (12).**
  - NM-A, the warm ordinary voice Robin preferred: Gohei, Torakichi, Yahei, Isamu.
  - NM-B, gruffer: Bunta, Daigo, Nobu, Tetsuji, Kumazō, Tahei.
  - NM-C, clerk: Tokiwa, Registrar Tadashi.
- **Non-neutral delivery (14).** Mame, Miyo, Kotarō, Kanta, Kai and Riku are excited. Tobi, Chiyo, Hinata, Kei, Nana,
  Mina, Koma and Momo are happy. Each one's lines are nearly all exclamations or smiles. The delivery words are the
  moods `tools/voice/va2/plan.mjs` already knows; it has no "cheerful". For Aivis, the delivery only labels the
  gallery; the upbeat style carries the mood.

## Supernatural speakers and their presets

| Preset | Speakers | Why |
|---|---|---|
| hush | The Tide Clerk | The Hush never speaks; this is its one speaking functionary ("The Hush erases them. I only tidy up"). |
| echo_light | The Mill Echo; remembered voices: Tōya, Master Ushio, Tomoe | The Mill Echo per Robin. The other three are heard only as memories (the bell tower, a memory folio, the kiln's night). |
| ghost | Kihei (Kotonoha's drowned sailor); the Courier Who Never Arrived; Sōan and Kohaku (the Hundredth Tale's tellers) | The lingering dead, and the Hall's tellings seen "as they were long ago". |
| spirit | Owan; the fox wedding (Kozue, Gin, Toku, Konta, the lantern-bearer, the porter); Mame and Kobu (tanuki); Kero (frog) | Kindly spirits and shape-shifting animals in human shape. |
| hollow | The Snowbell observatory lamp; the Hall's crossroads lamp; the umbrella (karakasa); the Catalogue Clerk and Tsuzuri; the Lord of the Understage | An object or place speaking: lamps, an umbrella, an index-card construct, a stage's machinery. |
| ancient | The Gardener of Unsent Words; the Nameless Bridge | Huge, very old beings. |
| ember | The Kiln Warden | A fire guardian. |

## Check these first

1. **The Hush has no voice line.** No scene gives it a spoken line: the climax `sa.hush_core` has narration and Kasane
   only, and `sa2` only silences the companion. I put the `hush` preset on the Tide Clerk, its functionary. If the Hush
   should speak later, it needs a new line, and this preset is ready for it.
2. **Kasane is cast without an effect.** Kasane is the human antagonist, "sincere, tired, articulate and wrong", and
   they/them. I cast a calm, low-mid voice that is not strongly gendered, with a quiet certainty, because their
   Japanese is neutral polite. I did not use a menacing effect, which would read as caricature. If Robin wants more
   foreboding, a very light `hush` on the Heart scenes only would be the place for it.
3. **The Hall's ordinary tale people have no effect.** Only the spirits, the shape-shifters, the object voices and the
   Hundredth Tale's tellers have one. If "tellings" should cover everyone inside a lantern's tale, add `ghost` to every
   `hall_*` entry.
4. **The fox wedding's lantern-bearer and porter are treated as foxes.** The wing is "foxes in human shape", but the
   two are not named as foxes.
5. **Owan gets spirit, the umbrella gets hollow.** The rule I used: an object spirit in human shape gets `spirit`; an
   object speaking as itself gets `hollow`.
6. **Nemo ages taken from the look.** Torakichi, Yahei and Kumazō are drawn with a beard and a low device pitch.
   Isamu's portrait shows a grey beard. None of the four has a stated age.
7. **Borderline Aivis.** Tamae (the Gull's loud cook) and Kiyo (sing-song market prices) are high-energy, but they are
   middle-aged, so they stay on Qwen. Swap them to AV-showy if that fits Robin's ear better.
8. **Gender is never given for eight people:** Oto, Sen, Masa, Uno, Hayashi, Asa, the Steamhollow guest on the Lantern
   Road, and the Cloudroad traveller. I cast them androgynous by fit. Hayashi is a lively busker but stays on Qwen
   because the Aivis slots are feminine.
   - Another 60 are inferred from their Japanese, the form of their name and their look. These are listed in
     `summary.genderNotStated`.
   - Tobi is cast as a boy because Tobi uses 僕.
   - "bun" hair is not proof of a woman in this game: Ujie, who is he/him, wears one.
9. **Mochi the cat only says ニャー.** A recorded cat sound would serve better than any TTS voice.
10. **Samples outside 8–45 characters.**
    - Mochi (4) and Kichibei (49) have only those lines.
    - Ushio (11) has a single line.
    - Tōya (10) is short by choice, to avoid a spoiler.
    - Several Hall tale people's samples are puzzle statements in 「」, because those are all they have. The job may
      strip the brackets before synthesis.
11. **Ages.** 131 ages are casting guesses from role and manner (`summary.ageNotEstablished`). Look-based ages
    (`age: old`, `size: child`) and ages implied by family or tenure are not in that list.

## Checks run (2026-10-14)

`npc_casting.json` was loaded back in node and checked against `allLines()`. All checks passed:

- every one of the 281 NPC speakers is present exactly once, with the right line count;
- every entry has the fields its engine needs:
  - Qwen: a description with the fixed ending;
  - Aivis: a slot, a style and parameters in range;
  - Nemo: a slot and parameters, and only for middle-aged men;
- every effect is from the list and has a reason;
- every sample's key exists among that speaker's lines, and its text is identical to the line in `allLines()`;
- no sample contains a run-time variable;
- the order is correct.

A deliberately broken copy (a missing speaker, a bad key, an added `$name`, a missing description, a wrong engine) failed
all five checks, so the checker does catch these faults. Nothing was built, and no game file was changed.
