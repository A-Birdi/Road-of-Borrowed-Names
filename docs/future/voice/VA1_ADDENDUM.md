<!-- Robin's VA-1 package (2026-10-11), kept so the queued voice audition survives the working copy.
     This file is RBN_Voice_Audition_Addendum_VA1.md, unchanged except in three places where the implementation
     model's name is replaced by "the lead" (the repository's rule: no model names in committed files). The original's
     SHA-256 is da179c4459391327872c06af46d3535c8468dddbec7ef7a3e3a8ebb8462ba575; templates/ are the package's
     templates, byte for byte (their checksums are in README.md). The PDF and HTML reading copies are not committed.
     Status and the lead's reconciliations: 11_CONTRADICTIONS.md C-83. -->

# The Road of Borrowed Names
## VA-1 · End-of-project Japanese voice audition

**Claude implementation addendum · v1.0 · 11 October 2026 · Prepared for Robin**

> **Queue this after the entire currently authorized expansion, final art and existing quality-closure work. Do not interrupt that work. Then run a bounded, cross-system voice audition and a small hosted/fallback playback proof. Return actual listening results to Robin. Do not generate the entire game's dialogue until Robin has heard the auditions, selected the cast/delivery approach, and authorized the production batch.**

**Deliverable now:** an instruction and test-design package. No voice was generated, auditioned, scored or selected while preparing it. The included matrix deliberately leaves final-script line fields empty.

### Quick execution map

| Decision | Required interpretation |
| --- | --- |
| Timing | Last queued task after the current expansion and art work; no new prerequisite for finishing that work. |
| Narration | A consistent **female narrator**, tested across every relevant tonal category. |
| Main cast | Five differently toned lines for **each of Suzu, Nao, Mio and Ren**. |
| Player | The same five player lines in **both selectable voice types A and B**; these are the in-game player, not Robin's real voice. |
| NPCs | Broad, purposeful variation across age, gender, profession and delivery; a matched pair of tones per sampled NPC role. |
| Providers | All seven configurations listed in §04, plus an actual local-device baseline when available. |
| Runtime | Optional pre-generated audio beside `index.html`, loaded only as needed; no live synthesis provider required by players. |
| Fallback | Windows/local Japanese device speech when available; otherwise silence. **None always wins.** |
| Stop point | Return the listening gallery and recommendations. Bulk dialogue production requires Robin's next decision. |

## 01 · Authority, timing and boundaries

Robin has authorized the expansion to proceed autonomously. This addendum does not restore earlier chapter, sprite or art approval gates. Record it as the final queued voice task and carry on with the active packet. Execute it only after the expansion, postgame, art and ordinary quality work are complete to the extent permitted by the current authorization. Any genuinely separate final-matrix or publication permission remains governed by the latest actual authorization; this document neither invents nor removes one.

At that point, freeze a recoverable script/build checkpoint for the audition. Do not block the existing expansion's completion because a speech provider needs credentials or unavailable hardware. Complete accessible audition routes, list the blocked routes precisely, and ask once for the missing prerequisites. **A partial provider comparison is partial, not complete.** The later casting and full-batch decision is an intentional new review point requested by Robin.

This is a narrow policy amendment: optional hosted speech files, their manifests, development-time synthesis and the necessary audio-specific network permissions are allowed. The core game remains playable from `index.html` alone, with no mandatory account, server, API key, model, download or voice file. Existing bans on runtime AI grading, cloud saves and other unrelated dependencies are unchanged. The historical expansion draft's blanket network/sample restrictions do not override this newer, speech-specific instruction.

The lead remains the implementation owner. Speech engines are production tools, not extra coding agents. Do not recruit a new coordination hierarchy, change the game's story to fit a voice, or replace the synthesized music/soundtrack under this amendment. The source plan's optional-listening, manual-reading and honest-learning-evidence principles remain in force [project basis: expansion draft 7, G1/G5/G6 and technical boundaries; superseded only as explicitly stated here].

**Scope authorized at the end:** current-code audit; sample extraction; casting trials; provider adapters; audition generation within actual access/approved spending; comparison gallery; minimal isolated in-game playback/fallback proof; results and a full-production proposal. **Not authorized by this task:** synthesizing every dialogue line, committing a final cast, purchasing subscriptions, accepting new contractual terms for Robin, training on unlicensed voices, or publishing unfinished audition assets as the final soundtrack.

## 02 · Preserve the existing speech contract

The inspected baseline `src/audio/50_voice.js` at `ed3a862b` exposes `RB.voice`: it filters for local Japanese voices, explicitly sets the chosen voice, cancels older speech, ducks music, and reports completion. Its canceled/superseded utterance deliberately does not fire the old completion callback. Re-read the actual current implementation before changing any callers; this is a fixed historical source check, not a claim about the final expansion build [S01].

The fallback is **local device Japanese speech**, which includes Windows Japanese voice packs when the browser exposes them. Do not label a Linux, Android or macOS voice as Windows, assume every Windows installation exposes a Japanese voice, or substitute an online browser voice silently [S01–S02]. In the audition, a missing Windows machine is a missing baseline recording, not permission to fake it with a hosted Microsoft voice. Azure is a different candidate.

Keep the fallback engine's local-only selection and explicit voice assignment. Fix a real defect if found, but do not alter callbacks, volume semantics or cancellation behavior casually. A recorded-clip router should delegate to the existing local backend where appropriate rather than duplicating its queue logic.

## 03 · Runtime experience: hosted enhancement, self-contained core

### Voice mode and casting are separate

Use the existing settings system and its visual language. These labels are the working contract; localized wording can be refined without changing behavior.

| Voice mode | Behavior |
| --- | --- |
| **None** | No prepared clips, device synthesis or fallback speech. Cancel current speech and queued voice work. No voice-asset requests or speculative voice prefetch. Music and ordinary SFX retain their independent settings. |
| **Device voice** | Use the selected local Japanese voice only. Never fetch prepared clips. Explain availability in the existing speech status area. |
| **Prepared voices + local fallback** | Prefer a matching, available recording. If it cannot start within the current line's validity window, use local Japanese speech when enabled and available; otherwise stay silent. The text never waits. |

The player has **Voice A / Voice B / None**, previewable without changing their appearance, pronouns, name or personality. Global None suppresses everyone. Player None suppresses only the player's speech, including its device fallback; narrator and other characters can still speak. A/B are stable casting identities, not on-the-fly pitch presets. For the trial, A should offer a lighter/brighter natural adult voice and B a lower/warmer natural adult voice; treat these as contrasting audition targets, not a rule mapping voices to sex or pronouns. Audition quality may justify refining those descriptors before selection.

Retain existing explicit preferences. Do not turn voice on for an existing user who disabled it. For an unset new setting, use None until the user chooses a voice mode. Do not mutate old saves merely by inspecting a voice setting. Store chosen A/B/None as player preference metadata, carried with the player's existing NG+ identity settings, while device voice availability stays device-local. Missing legacy values resolve harmlessly as unselected/None until chosen.

### Failure must be quiet and non-blocking

| Situation | Required behavior |
| --- | --- |
| Hosted page, correct recording | Play one matching clip; return control normally. |
| Hosted page, missing/invalid/stale clip | Use allowed local fallback once, or silence; no repeated warning per line. |
| Slow download | Text and Next remain usable. A bounded start deadline can choose fallback; a late clip must not interrupt it. |
| Advance, skip, change speaker, load another save, or choose None | Invalidate the utterance token, cancel all applicable speech, release ducking and suppress late callbacks. |
| Audio starts then fails | Do not replay the whole line automatically with another voice. Leave replay available; continue the game. |
| `file://` copy of `index.html` alone | Do not probe the hosted deployment or request a relative voice manifest. Resolve directly to the allowed local fallback, or silence. |
| No local Japanese voice or unsupported API | Remain fully playable and silent; never force installation. |
| Browser blocks playback | Provide a normal user-gesture play/replay path; handle promise rejection, not a broken modal or silent hang [S10]. |

An engineering starting point is a **2-second maximum wait to start a requested prepared clip**, with text immediately visible and responsive throughout. Measure and revise that deadline during the proof; it is not a guarantee of instant networking. Fall back only while the line still owns the current utterance token. Never start either recording or device speech after its scene has been left.

No dialogue auto-advance is introduced. Speech duration, load time, retries, help, replay and animation do not advance gameplay danger. Speech completion cannot award a stamp, change Bond, count an answer, spend a turn or mark a scene witnessed. An explicit listening exercise retains its own established evidence rules; ordinary story playback is not a new learning-credit source.


## 04 · Provider comparison: test every proposed route

Do not discard a candidate because a previous answer predicted it would be weaker. Make a genuine documented setup attempt for each route. For every accessible, appropriately licensed configuration, run the full common matrix. A missing style or unsuitable role is a result to expose, not a reason to silently remove its cells.

| ID | Configuration | How it is included | Sources |
| --- | --- | --- | --- |
| voicevox | VOICEVOX character voices | Local; select a licensed voice and its available styles. | S03, S14 |
| voicevox_nemo | VOICEVOX Nemo | Separate character-free casting route; do not collapse it into the first entry. | S04 |
| aivis | AivisSpeech | Local engine plus an explicitly identified model, speaker and style. | S05 |
| qwen | Qwen3-TTS | Use an instruction-capable configuration; separately label any voice-design/consistency subtrial. | S06 |
| gemini | Gemini-TTS | Hosted production-time synthesis; pin exact API/model and voice. | S07 |
| elevenlabs | ElevenLabs | Hosted production-time synthesis; use a Japanese-capable expressive model. | S08 |
| azure | Azure Speech | Include because it was also proposed; styles/roles are voice-specific. | S09 |

VOICEVOX and Nemo are separate casting configurations, not two unrelated underlying technologies. Qwen VoiceDesign is an optional separately labelled subtrial within the Qwen route when stock casting is inadequate; it must not silently replace CustomVoice results mid-matrix. Additional models may be included only as clearly marked extra comparisons, never as replacements for the seven requested routes.

For each configuration record the exact model/API version, engine or weight revision, voice/style IDs, languages, actual supported controls, access requirements, model/voice terms, output format and reproducibility limits. Pin that configuration during its pass. Do not mix results from different provider model versions under one candidate label. Recheck official documentation when the end-of-project work starts; the API notes below were checked for this document on 11 October 2026, not promised immutable.

Run one basic smoke sample first. Then choose a provisional voice for each role using up to three plausible voices and two short anchor lines per role, within the approved trial budget. Carry the selected candidate consistently through that role's matrix. Keep the discarded casting samples accessible, with short reasons. Similar NPC profiles may share a voice candidate where the available bank requires it; disclose the reuse rather than calling them distinct voices.

Do not accept a known-bad word or an incompatible licence just because the tone is attractive. Check permission for synthetic voice acting for an original character, redistribution of generated audio, credit requirements, reference-audio reuse and the intended hosted release. Engine code licensing, model licensing and rights to a particular voice are different records. No actor imitation, unlicensed voice cloning, or cross-provider cloning of a candidate output without explicit compatible rights. Identify generated speech as synthetic in the game's credits/settings as appropriate [S03–S09, S14–S16].

Cloud credentials stay in the development environment. Never place them in the HTML, a public repository, the audition page, logs or a download. Use already approved access and spending limits. A new paid plan, unavailable quota or extra expense without an existing allowance needs a single consolidated access/budget request; this addendum is not an unlimited spending authorization.

## 05 · The audition corpus and exact minimum coverage

**Use one frozen corpus across providers.** Select actual lines from the completed game's relevant scene, together with their speaker, language profile, dialect, previous/next context and source locator. All five companion samples must be distinct lines with distinct intentions. The five player texts are identical for A and B. Do not choose simpler text for an engine that struggles.

Prefer early, spoiler-safe dialogue for Robin's gallery. A later line can be placed behind an explicit spoiler reveal, with its filename/context hidden too. When no canonical line can cover a test role or tone, write a small, self-reviewed **noncanonical audition fixture**, label it, and never add it to the game's story. Do not invent an NPC's age or gender and present it as established canon. The NPC profiles below are sampling targets, not new cast biographies.

| Group | Directed samples per configuration | Rule |
| --- | ---: | --- |
| Female narrator | 16 minimum | One per tonal category below, plus any genuinely distinct narrator delivery found in the final script. |
| Four companions | 20 | Five per companion, with one stable candidate voice per character. |
| Player A and B | 10 | Five identical texts voiced once by A and once by B. |
| NPC range | 24 | Twelve demographic/profession profiles, two contrasting lines each. |
| Suzu dialect contrast | 5 | Kansai counterparts to her five standard samples, same casting identity. |
| Language/prosody stress set | 8 | Defined in §09. |
| **Minimum directed total** | **83** | These are audition cases, not 83 unique strings or 83 required new story lines. |

Also render **14 matched neutral controls per configuration** using the exact selected text and the same voice, without the optional per-line acting direction. Keep correct reading overrides in both versions. Control IDs are listed in the matrix. This isolates whether the additional direction helps, rather than comparing a corrected script against a different uncorrected script.

That is **97 planned takes per fully available configuration**, or **679 across all seven**, before casting screens, repairs, extra discovered narrator tones, optional subtrials or the device baseline. This is an accounting total, not a price or duration estimate. Count the script characters and observed sample duration before requesting any paid batch. Do not silently shrink the matrix to fit unknown credits; finish accessible work and report the exact unfilled cells.

A base-plus-directed pass is not mandatory for all 83 cases because the matched controls and stress pairs already test direction efficiently. Permit one targeted repair take per flawed directed cell after its cause is documented. More repairs need a scoped reason and remaining budget, not a random reroll loop. Retain failed/first takes, parameters and reasons. File count alone never means that listening review happened.


## 06 · Female narrator: full delivery range

Keep one adult female narrator identity per candidate throughout this section. She is a storyteller, not a neutral screen reader and not a new named character. An emotion change must not replace her voice. Derive emphasis from the actual Japanese phrase, not from English word order.

| Case | Delivery | What the sample must demonstrate |
| --- | --- | --- |
| N01 | Warm welcome | An inviting opening, with adult warmth and restraint; not a promotional announcer. |
| N02 | Plain observation | Describe an ordinary action with natural sentence grouping and no imposed drama. |
| N03 | Wonder and discovery | Genuine widening curiosity at a beautiful or surprising place; clear articulation. |
| N04 | Pastoral calm | An unhurried scene with space to breathe, not sleepy or excessively breathy. |
| N05 | Gentle humor | Light, dry amusement that lets the writing carry the joke; no canned laughter. |
| N06 | Inquiry and uncertainty | Tentative interpretation or a question without making every clause rise. |
| N07 | Suspense | Quiet tension and anticipation, not an added horror voice or whispered sound effect. |
| N08 | Sudden alarm | A brief clear warning, energetic but not clipped, screamed, or louder by default. |
| N09 | Determined momentum | Purpose and forward movement without turning narration into a battle announcer. |
| N10 | Solemn gravity | Serious weight without melodrama, villainous growling, or flatness. |
| N11 | Sorrow and loss | Controlled sadness that preserves intelligibility; no invented sobbing. |
| N12 | Compassion and reassurance | Kind, steady reassurance without patronizing the listener. |
| N13 | Private reflection | Intimate, reflective phrasing, not mandatory whispering or seductive delivery. |
| N14 | Celebration and relief | Warm happiness and release of tension; not constant shouting. |
| N15 | Bittersweet closure | Hope and sadness held together, with a natural settled ending. |
| N16 | Precise explanation | A longer factual or instructional sentence with clauses and important contrasts clear. |

Audit final narration and add a case for any uncovered delivery that is materially distinct; do not manufacture sixteen emotions in the story just to match the table. A missing tone can use an explicitly noncanonical test. Scope excludes singing, voice impressions, gratuitous crying and non-speech effect generation. Clean speech comes first.


## 07 · Companions and the two player voices

These are starting vocal directions, derived from the established characterization rather than a new story interpretation. Before choosing lines, re-read the finished companion profiles and the scene. A smile portrait is not proof of a cheerful line; visible expression and vocal subtext may differ.



### Suzu · five distinct moments

| Case | Delivery | Direction |
| --- | --- | --- |
| SUZU01 | Warm invitation | Ordinary friendly company, away from the stage. |
| SUZU02 | Comic flourish | A playful punchline or welcoming stage line, controlled timing and bright confidence. |
| SUZU03 | Concern | Her performance drops away; she notices something is wrong. |
| SUZU04 | Sincere apology | A vulnerable, plainly spoken admission, without a wink in the voice. |
| SUZU05 | Shared resolve | A confident rally into a shared action, energetic rather than celebrity-like. |


### Nao · five distinct moments

| Case | Delivery | Direction |
| --- | --- | --- |
| NAO01 | Practical explanation | A clear route or useful instruction, focused and assured. |
| NAO02 | Dry humor | A short understated joke, not Suzu's theatrical rhythm. |
| NAO03 | Urgent warning | Alert and precise, preserving names and the actionable clause. |
| NAO04 | Honest vulnerability | An apology or admission of uncertainty without changing vocal identity. |
| NAO05 | Decisive encouragement | A firm, practical invitation to act together. |


### Mio · five distinct moments

| Case | Delivery | Direction |
| --- | --- | --- |
| MIO01 | Calm explanation | Competent care: explain a process clearly, not timidly. |
| MIO02 | Light teasing | Small warmth or amusement appropriate to her existing writing. |
| MIO03 | Focused concern | Urgency while remaining composed and specific. |
| MIO04 | Regret or apology | Sincere personal responsibility without exaggerated crying. |
| MIO05 | Confident reassurance | Reassurance with conviction and a warm, settled phrase ending. |


### Ren · five distinct moments

| Case | Delivery | Direction |
| --- | --- | --- |
| REN01 | Thoughtful observation | Reflective but not monotonous; considered phrasing. |
| REN02 | Quiet amusement | Dry warmth, leaving room for the joke. |
| REN03 | Measured warning | Controlled intensity rather than an artificial deep voice. |
| REN04 | Vulnerable admission | A personal uncertainty or apology that still sounds like Ren. |
| REN05 | Protective certainty | A deliberate promise or rally, firm and reassuring. |


Suzu is a travelling comedian/performer seeking shared company and a double act, not an aspiring celebrity by default. Nao and Ren retain their canon they/them identities. Their voice casting is chosen by character fit, not an automatic pitch rule attached to pronouns. Mio's care is capable and confident, not permanently shy. None of these notes licenses new dialogue facts.

### Player A and Player B · ten takes from five texts

| Paired cases | Delivery | Direction |
| --- | --- | --- |
| PCA01 / PCB01 | Curious question | Ask for clarification, with a natural Japanese question contour. |
| PCA02 / PCB02 | Lighthearted delight | Pleasure or playfulness without caricature. |
| PCA03 / PCB03 | Firm resolve | Commit to a response or an action, clearly and confidently. |
| PCA04 / PCB04 | Vulnerable apology | Admit a mistake or concern, without imposing an unchosen personality. |
| PCA05 / PCB05 | Warm reassurance | Offer companionship or confidence to the other person. |

Use the same five final-script texts for both types. Preview both independently of visual appearance. Do not read unchosen response options as if the player said them: audition selected-line playback, and later wire actual player speech only at the established commitment point. Do not synthesize Robin's real voice or ask for a personal recording; that is not this request.

### Suzu's Kansai option

SUZU_K01–K05 are the real Kansai counterparts of SUZU01–05. Keep the same voice identity, intent and listener. Preserve the game's approved dialect wording, labels and teaching boundaries. Do not ask a provider to rewrite standard dialogue into generic “Osaka speech.” If an existing line has no alternate, choose a different matched pair or label a dialect test fixture explicitly. Fluent-sounding delivery is not proof of authentic regional prosody; record the review level honestly.


## 08 · NPC coverage without caricature

Each profile supplies two different lines. At least one should expose what the person's work or social setting requires: explaining a repair, greeting a customer, reporting a delivery, setting a boundary, recounting a memory, or encouraging someone. Do not reduce “age” to lowering pitch or making elders frail. Children use ordinary age-appropriate speech; do not manufacture baby talk or import unsuitable material.

| Profile | Casting target | Work / setting | Tone 1 | Tone 2 |
| --- | --- | --- | --- | --- |
| NPC01 | Child girl | Village child; not assigned an adult job | Curious discovery | Brief disappointment that resolves calmly |
| NPC02 | Child boy | Village child helping with a small errand | Earnest explanation | Excited good news |
| NPC03 | Adolescent girl | Trainee messenger or apprentice | Polite nervousness | Proud relief |
| NPC04 | Adolescent boy | Workshop apprentice | Routine practical explanation | Embarrassed correction |
| NPC05 | Young adult woman | Stallholder | Welcoming sales greeting | Firm but courteous refusal |
| NPC06 | Young adult man | Courier or dock worker | Brisk directions | Sincere gratitude |
| NPC07 | Middle-aged woman | Innkeeper or craftsperson | Confident reassurance | Controlled frustration |
| NPC08 | Middle-aged man | Harbor official or clerk | Formal instruction | Warm off-duty humor |
| NPC09 | Older woman | Retired teacher or keeper | Reflective storytelling | Spirited, clear encouragement |
| NPC10 | Older man | Fisher or boatwright | Steady technical explanation | Tender remembrance |
| NPC11 | Adult nonbinary person | Scholar, keeper or archivist | Precise information | Wry amusement |
| NPC12 | Adult nonbinary person | Artisan, host or traveler | Easy welcome | Serious boundary-setting |

Bind each profile to an actual speaker only when the final source supports the identity. If no such person exists, use a marked audition persona without changing the roster. Older voices may be strong and energetic; formal voices can be warm; nonbinary speakers need no stereotyped “neutral” sound. Regional voice traits are added only when supported by the character's established dialogue.


## 09 · Structure, pronunciation and consistency stress tests

The same exact stress lines go through every configuration. These tests are safeguards for a language-learning game, not an attempt to certify the model's Japanese.

| Case | Test | Selection rule |
| --- | --- | --- |
| J01 | Names and unusual readings | Canon names/place names with verified readings, including a reading a default engine might miss. |
| J02 | Numbers and counters | A genuine quantity/date/counter sentence; preserve its intended reading and meaning. |
| J03 | Negation and conditions | A multi-clause instruction where the negative or condition must not be swallowed or misgrouped. |
| J04 | Controlled same-text test: confirmation | Use exactly the same Japanese wording as J05; a plausible neutral confirmation. |
| J05 | Controlled same-text test: doubt | The J04 wording with restrained doubt; test direction without changing the words. |
| J06 | Quotation and speaker boundary | Narration containing a quotation; retain the assigned narrator unless the canonical utterance truly changes speaker. |
| J07 | Long sentence and clause grouping | A natural 15–30-second passage, if the final script contains one; no added words to reach a duration. |
| J08 | Mora and sound distinctions | A phrase checking long vowels, small kana, gemination or similar easily confused sounds, taken from actual content where possible. |

Readings, mora timing and sentence-level intonation are separate. Preserve short/long vowels, gemination, negation, counters and questions. A furigana reading is not a complete accent annotation. Never invent an accent nucleus to fill a metadata field. Use a documented reference or leave the accent uncertain.

J04 and J05 deliberately share one plausible sentence but differ in direction. Keep its wording and punctuation constant; do not “help” only one engine by rewriting it. They are controlled audition fixtures when the actual script does not contain a suitable pair. Do not convert ordinary story meaning into its opposite merely to make a dramatic clip.

For consistency, play each character's five lines consecutively, plus a short alternating-dialogue edit made from already generated clips. Listen for speaker drift, inconsistent age/resonance, abrupt loudness and dialect changes. Do not regenerate the dialogue edit with a separate multi-speaker model and pass it off as the single-line results.


## 10 · Provider-independent structure block

Keep the canonical record small and semantic. It exists for extraction, reproducibility and adapters; **do not send the entire JSON as spoken text**. The text, speaker identity and performance direction remain separate. `providerExtensions` holds necessary backend-specific data without contaminating the shared script.

The example below reuses Robin's illustrative reassurance. It is **not a claim that this exact line appears in the final game**. The package includes the complete JSON and a JSON Schema. Matrix rows with unset source/text fields are not synthesis-ready.

```json
{
  "schemaVersion": "rbn-speech-line-1",
  "lineId": "audition.suzu.reassurance.fixture",
  "caseId": "EXAMPLE_ONLY",
  "source": {
    "kind": "illustrative_fixture",
    "repository": null,
    "commit": null,
    "path": null,
    "locator": null,
    "spoilerLevel": "none"
  },
  "speakerId": "suzu",
  "voiceProfile": "suzu_candidate_01",
  "language": "ja-JP",
  "dialectVariant": "standard",
  "playerVoiceType": null,
  "purpose": "audition",
  "displayText": "大丈夫。一緒に考えよう。",
  "spokenText": "大丈夫。一緒に考えよう。",
  "translationEn": "It’s all right. Let’s think it through together.",
  "delivery": {
    "intent": "reassure",
    "energy": "gentle",
    "direction": "Private reassurance, not a stage performance. Keep the first sentence steady; make the invitation warm.",
    "pace": "natural",
    "subtext": "She wants the listener to feel accompanied, not dismissed.",
    "beats": [],
    "vocalEvents": []
  },
  "pronunciationOverrides": [],
  "context": {
    "listener": "player",
    "situation": "The listener is uncertain; she wants to help.",
    "previousLine": null,
    "nextLine": null,
    "audibleContext": false
  },
  "providerExtensions": {},
  "production": {
    "status": "example_only",
    "spokenTextSha256": "1809e18c1eac6674d4c409a412c809cad7a462fed7bd466d957f92f88aea884c",
    "allowParaphrase": false,
    "allowAddedSpeech": false,
    "publicationApproved": false
  }
}
```

### What to record and what never to speak

| Field family | Production meaning |
| --- | --- |
| Source and line identity | Stable line ID, source commit/path/scene locator, profile/branch variant and spoiler status. IDs should survive unrelated insertion of a preceding line. |
| Speaker and voice profile | Canon speaker plus immutable candidate voice identity; A/B resolved for the player. A profile contains casting age/timbre/resonance, not an attempt to change identity on every sentence. |
| Display and spoken text | Keep canonical display text separately from the normalized spoken transcript. Never read `{kanji/reading}` markup, both ruby layers, a speaker label or an English translation aloud. |
| Delivery | Intent, energy, phrasing, subtext and only necessary beat markers. No automatic filler laughter/sighs. |
| Pronunciation overrides | Exact surface and reading, reason, evidence and review status. Match the intended occurrence, not a global replacement inside unrelated words. |
| Context | A small amount of previous/next scene context for interpretation. It is non-spoken guidance; omit it for engines without a safe guidance channel. |
| Provider extension | Version-specific style ID, pronunciation notation, instruction text or SSML supported by that engine. Log unsupported requests rather than invent fields. |
| Production record | Request/configuration hashes, source-text hash, candidate/take ID, actual parameters, timing/cost, output path/hash and QA status. |

Normalize Unicode to NFC; preserve wording, punctuation, kana choices and lexical meaning. For required number or abbreviation pronunciation, retain the original and the approved spoken normalization in a reversible record. No automatic synonym replacement. Do not flatten all Japanese to kana by default: retain context-rich orthography unless a specific engine requires an audited pronunciation representation.

Use anchored beat instructions only where needed. Most lines should use their stable voice and a concise direction, not a large acting essay. For multiple clauses, synthesize a coherent utterance when feasible; piecing isolated words together sacrifices phrasing. If a provider truly requires segments, keep clean boundaries and check the reassembled performance, with segment requests logged [S03].

Dynamic names, boat names and generated phrases are not fully coverable by a finite recording library. In this audition, use an explicit fixed test name and mark it as such. The prototype must reject a recording whose expanded text differs from the current line. Until a later name policy is selected, a dynamic line can use local speech or remain silent; do not silently speak a default name or invent chopped-syllable name assembly.


## 11 · Translate the structure into each engine's real controls

These are adapter recipes, not interchangeable API payloads. Re-read the chosen version's documentation at execution. Preserve the exact submitted request beside every output, redacting credentials. A provider can receive less metadata when it has fewer controls; it must never receive fake supported fields merely to resemble another provider.

| Route | Adapter behavior | Critical limit to expose |
| --- | --- | --- |
| VOICEVOX | Enumerate speakers/styles; create an audio query from the Japanese text; apply verified dictionary, accent-phrase, rate and intonation edits; synthesize using that style. | Natural-language acting directions are mapped to actual available controls, not spoken as an instruction. Preserve speaker identity across styles. |
| VOICEVOX Nemo | Use its own available voices and actual engine interface. Keep separate voice IDs, terms and casting results. | Do not reuse a VOICEVOX character style ID by assumption or call Nemo a custom-trained project voice. |
| AivisSpeech | Select the exact installed model/speaker/style; preserve natural text; map supported emotional strength and tempo dynamics. | Its `intonationScale` is style-emotion strength, not VOICEVOX's same-named control; per-mora pitch/duration edits may be ignored. Avoid arbitrary pitch shifts [S05]. |
| Qwen3-TTS | Use an instruction-capable model and its real `text`, `language`, `speaker` and `instruct` path. A stable original voice-design/reference subtrial must be separately recorded. | The 1.7B instruction-capable variants and smaller/base variants do not expose identical control. Do not assume a voice-cloning path also supports all acting instructions [S06]. |
| Gemini-TTS | Pin the actual API/model; map voice identity to its voice configuration and per-line direction to supported speech metadata/style. | The checked documentation separates transcript, turn style and optional inline events. Do not paste an old-generation prompt into a different API and assume it works [S07]. |
| ElevenLabs | Use the selected Japanese-capable expressive model and its supported tags, voice settings and pronunciation route. | Tag and SSML behavior varies by model. No raw direction prose that becomes extra narration; no environmental sound-effect tags in a clean voice sample [S08, S16]. |
| Azure Speech | Build escaped SSML using the chosen Japanese voice; use only its listed styles/roles and supported prosody/pronunciation elements. | Unsupported `express-as` style/role settings can be ignored. Report a neutral limitation rather than claiming simulated age/emotion [S09, S15]. |

Examples of adapter intent for the reassurance line:

```text
VOICEVOX: text -> audio_query -> checked style/accent edits -> synthesis
Aivis:    text -> model/style selection -> supported style/tempo edits -> synthesis
Qwen:     text="大丈夫。一緒に考えよう。", language="Japanese",
          speaker=<enumerated voice>, instruct=<brief reassurance direction>
Gemini:   transcript=<exact text>, voice=<pinned identity>,
          speech_metadata.style=<brief reassurance direction>
Eleven:   text=<exact words + only supported non-spoken tags>,
          voice_id=<pinned>, model_id=<verified>, voice_settings=<supported>
Azure:    <speak ...><voice name="<verified Japanese voice>">
          <supported prosody/style wrapper>exact escaped text</...>
          </voice></speak>
```

The snippets illustrate mappings, not a claim of tested request syntax or real voice IDs. Store real resolved payloads during the work. Adapt pronunciation methods per provider; an unsupported IPA/SSML field must not silently be counted as a correct reading override. A provider may naturally perform a tone without a control; label it **text-conditioned delivery**, not successful explicit direction.

A voice designed once can remain a candidate across its lines. Never generate a new “Suzu” independently for each emotion. If the required identity cannot be retained, report that as a limitation. Do not use another service's generated candidate as cloning input without checking its output-reuse terms and receiving any necessary permission.

## 12 · Audition generation, quality checks and review

### A reproducible pass, not a highlight reel

Keep the full expected matrix before generation. Each cell has one of: `not_started`, `blocked_access`, `blocked_rights`, `unsupported_control`, `generated_unreviewed`, `qa_failed`, `awaiting_robin`, `selected`, or `rejected`. Unsupported expressive control does not prevent rendering an honest best-effort sample, but it remains marked. No empty cell can become a pass because a neighboring speaker sounds good.

Generate the 83 directed cases and 14 neutral controls for every viable configuration. All providers receive equivalent context, appropriate to their interface, and the same Japanese transcript. One documented repair is allowed per flawed directed cell. Keep the first result, repaired result, reason and request change. If the problem is a bad shared transcript rather than the engine, correct the corpus revision and rerun affected cells across providers.

Store original outputs untouched, plus common-format review copies. Match codec quality, sample-rate handling and monitoring level fairly. Resampling does not add fidelity. Use measured, conservative level matching from representative anchor clips; preserve intentional quiet/loud differences within a performance and keep an original-level option. Avoid aggressive denoising, pitch shifting, time compression, reverb or music that hides defects. Record all post-processing. Isolated dry voice is the default; a few game-mix checks may reuse the same takes.

Check every output for missing/added words, incorrect readings, clipped beginnings/endings, spoken directions, synthetic noise and identity drift. An automatic transcript can flag discrepancies but cannot certify Japanese accent or acting. A successful API call, nonempty waveform, or file duration is not a listening review. If the execution environment cannot actually audition audio, mark subjective fields unreviewed and let Robin judge; do not fabricate numerical quality scores from text or spectrograms.

### Scoring and casting decision

Use the following rubric only after a real listen; record who listened and whether they can assess the Japanese. Null means unassessed, never zero or a presumed pass. Use 1 (poor), 3 (usable with issues), 5 (strong), with concrete notes. Scores are a comparison aid, not a scientific or native-speaker certification.

| Dimension | Weight | Question |
| --- | ---: | --- |
| Japanese intelligibility and pronunciation | 30% | Are the words/readings preserved and easy to distinguish? Mark accent uncertainty separately. |
| Sentence phrasing and intonation | 25% | Are clauses, questions, negation and emphasis coherent? |
| Stable voice and role fit | 20% | Does it remain the same person across all five lines or narrator tones? |
| Delivery and subtext | 15% | Does the intention fit without exaggeration, a stock anime caricature or changed meaning? |
| Audio cleanliness and edit effort | 10% | Is it clean, complete and repeatable enough to produce at scale? |

Wrong lexical content, unresolved rights, inserted instructions or a mismatched current-script line are hard failures regardless of a pleasing score. Do not compute a total when a dimension is unassessed. When all five dimensions have been assessed, compute the optional 0–100 comparison total as `sum(weight × (rating - 1) / 4)` using the weights above. Hard failures remain failures regardless of the total. No automatic speech recognizer may award “accent correct.” Native review is listed only when a qualified person actually supplied it.

Return a best and runner-up **per role/cast bundle**, not only one overall winning provider. A consistent narrator and consistent individual characters matter more than picking a different voice for each emotional line. Mixing providers across roles is allowed if rights, matching and consistency work. Robin may reject every candidate or choose None; no weak voice is mandatory merely because the matrix was completed.


## 13 · What Robin receives

The audition's primary result is **audio Robin can play**, not a PDF full of claims about voices. Build an ordinary static `review.html` beside its clips, with the matrix metadata embedded so opening it locally does not depend on fetching a JSON file. A hosted review uses the same relative assets. No provider account, key, plugin or synthesis engine is required just to listen.

The page provides a narrator reel, companion sections, separate player A/B sections, NPC profiles and stress tests. Each case shows the exact Japanese with readings, English meaning, non-spoiler context, intended tone, provider/model/voice, actual supported controls and QA status. Compare candidate C01/C02/etc. for the **same line**; those comparison labels must not be confused with player Voice A/B. Offer an optional blind-labelled comparison, then a reveal of the provider metadata.

Provide play, stop, replay, previous/next case, a role reel and a filter for incomplete/failed cells. Start no audio until the listener acts. Only one recording plays at once. A reel stops on missing media, not silently skips a failed case. Make it usable on keyboard and touch, with long Japanese/furigana readable and no mandatory horizontal table scrolling. Book-like styling is welcome, but plain reliable inspection is more important than another UI redesign.

Keep spoiler-sensitive audio/context behind a clear reveal. This is presentation protection, not access control: assets on a public host can still be discovered. Do not publicly deploy sealed story recordings or raw prompts without the appropriate publication permission.

Include an editable score sheet, per-role shortlist, exact gap report, setup/reproducibility notes, rights/credits record, generation/retry/cost accounting, payloads and an asset manifest. The score sheet's export is audition evaluation data only, not a game save-export feature. Working masters may be large; keep a review package with listening copies and a separately preserved master archive. Deliver ordinary ZIPs **strictly under 30,000,000 bytes each**, split by provider/role if needed, with a clear reconstruction guide and hashes. Do not sacrifice audible quality solely to force one ZIP.

Required results folder layout, adapted to the actual repository convention:

```text
voice-audition/VA1/<script-revision>/
  READ_FIRST.md
  review.html
  corpus.json
  voice_profiles.json
  provider_inventory.json
  results.json
  scores.csv
  recommendations.md
  gaps.md
  requests/<provider>/<case>/<take>.json
  audio/review/<provider>/<case>/<take>.mp3
  audio/masters/<provider>/<case>/<take>.<original-format>
  evidence/<check-or-capture>
  rights/VOICE_PROVENANCE.md
  manifests/files.sha256
```

Do not ship model weights, account credentials, unauthorized reference voices or development caches in that handoff. Synthetic Windows baseline audio should only be captured through a verified permitted route with its OS/browser/voice identified. Web Speech does not by itself promise a portable downloadable audio file: if no lawful capture is available, expose a local playback comparator and mark the stored baseline missing rather than fake it.

## 14 · Hosted audio and the small in-game proof

### Asset layout and identity

Place optional audio alongside the main file, using project-relative URLs so GitHub Pages subpaths work. Prefer versioned assets such as `./voices/ja-JP/<voice-build>/...` and a small manifest. No hard-coded absolute deployment URL that a downloaded standalone copy might contact. A file called `index.html` on a different host should still function without its side assets.

Each runtime manifest entry identifies the line, normalized spoken-text hash, speaker, voice profile, player A/B variant, dialect/profile/branch variant, speech-data version, audio hash, duration, format, byte size and compatible script revision. Keep raw acting prompts, provider credentials and sealed scene notes out of the runtime manifest. Do not key recordings solely by a line's current array index, translated English, or text shared by different speakers.

A matching line may reuse audio across profiles only when the actual spoken words, speaker and delivery are identical. A different tone in a repeat scene may need a different delivery variant. The same player line has two voice variants. A stale or incorrect variant is rejected and uses allowed fallback, never “close enough” playback. Cache by version/hash, not a fixed filename overwritten with new dialogue.

### Load and memory behavior

Fetch lazily once prepared voices are explicitly enabled and relevant. Treat `navigator.onLine` as a hint, not a connectivity guarantee. Prefetch only a small amount of known, eligible imminent dialogue; do not fetch every branch or the whole game at boot. A useful prototype starts with at most two concurrent voice requests and two decoded utterances; measure before expanding. Record compressed-cache and decoded-audio memory separately. Release abandoned scene work and bound caches.

The text renderer, writing pad, Next button, scene commitment and audio loader are separate paths. One token owns one utterance. Ensure a delayed fetch, decode, device callback or replay completion cannot reclaim an old token. Avoid double-ducking music when switching backends, and restore gain on cancel, error, mute, hidden page or replaced scene.

Test browser-supported compressed formats using the actual target devices; retain clean masters separately. Start with an ordinary broadly playable listening format, then compare smaller encodings without assuming every browser supports the chosen container. No giant per-game audio sprite is required. Do not promise cached hosted voices will remain available offline after browser eviction; the standalone guarantee is text and allowed local speech, not every recording.

### Network policy and hosting

The older supplied HTML uses `connect-src 'none'` and permits only data/blob media. The current build must be inspected; those policies would block ordinary side manifests/audio. Apply the smallest scoped change needed for optional same-origin JSON/audio, preserving unrelated script/style/font restrictions. `media-src` and `connect-src` govern different operations [S11–S12]. Validate URL origin and the approved voice path in application code; do not add `*`, fetch arbitrary manifest URLs, execute downloaded scripts, or enable provider runtime calls.

Static hosting stores finished files; it does not run the speech engines. For the present GitHub Pages plan, recheck site limits before the full batch. The documentation checked here sets a 1 GB published-site maximum and a 100 GB/month soft bandwidth limit. Count the game, artwork and published audio together; keep redundant auditions and masters off the public game deployment [S13]. A later host change is a separate operational decision, not assumed necessary or already approved.

### Prototype extent

Integrate only a representative approved-for-audition subset in a throwaway/dev session: one narrator passage, each companion, player A and B, one NPC, one missing clip and one stale clip. Exercise existing dialogue/history/readback callers and a safe committed battle line if they are already voice-capable. No new story event, full lip-sync system, default production cast or compulsory dialogue audio is required to prove the loader.

Use the actual existing portrait/gesture system where feasible, but do not keep a character speaking after audio is canceled or make audio completion drive gameplay. Before answering a language task, voice only what that task is permitted to expose; never auto-read a hidden correct answer or unchosen response. Do not mutate assistance records merely because a narrative clip played.


## 15 · Required acceptance checks

Record observed results on the actual source revision; these are future tests, not tests already executed.

| ID | Acceptance check |
| --- | --- |
| VA-A01 | The current expansion/art work was not interrupted; the voice task began from a recorded final-work checkpoint. |
| VA-A02 | Every requested provider configuration has a genuine setup/result or an exact access/rights/hardware limitation; no silent omissions. |
| VA-A03 | Narrator tone census covers the final script; at least N01–N16 are represented or marked noncanonical fixtures. |
| VA-A04 | All four companions have five different tonal lines and a stable voice; both player types use the same five texts. |
| VA-A05 | Twelve NPC profiles each have two different deliveries, with canon/source or fixture status stated. |
| VA-A06 | Standard/Kansai Suzu is matched by line and casting identity; no undocumented dialect rewriting. |
| VA-A07 | All eight structure tests and fourteen neutral controls are accounted for per configuration. |
| VA-A08 | The submitted request never accidentally voices context, a direction block, English gloss, speaker ID or ruby markup. |
| VA-A09 | Audio file generation, lexical checks, actual listening and qualified Japanese review have distinct statuses. |
| VA-A10 | Every retained take has a source/configuration hash, real file, exact settings and repair history; no invented metrics. |
| VA-A11 | Review gallery plays each available candidate locally and hosted, with keyboard/touch, no keys and no overlapping playback. |
| VA-A12 | Prepared audio works under the deployed project subpath; current script/voice/dialect/player variant matches the manifest. |
| VA-A13 | Copying only index.html to file:// causes no voice-network requests and preserves full gameplay. |
| VA-A14 | Device mode makes no prepared-asset requests and never selects an online or non-Japanese fallback. |
| VA-A15 | Global None makes no speech or voice requests; player None suppresses only player speech and its fallback. |
| VA-A16 | 404, bad manifest, wrong version/hash, unsupported codec, decode failure, timeout and unavailable local voice all degrade without a gameplay block. |
| VA-A17 | Slow/late audio cannot start after Next, skip, load, scene exit, player-type change or None; no double playback after fallback. |
| VA-A18 | Mid-clip failure does not unexpectedly restart the full sentence; replay remains controlled by the user. |
| VA-A19 | Dialogue stays manually advanced; no danger, turn, reward, Bond, answer or witness event comes from audio timing. |
| VA-A20 | Existing volume/ducking/mute/cancel and callback contracts remain correct; browser autoplay rejection has a user-gesture recovery. |
| VA-A21 | Readback cannot leak hidden correct answers; ordinary narrative voice does not fabricate learning evidence. |
| VA-A22 | Legacy voice-off preferences are preserved; old saves do not change merely from reading settings; A/B/None persists correctly when chosen. |
| VA-A23 | Browser-target tests include Firefox and available desktop/mobile engines; unavailable real-device checks are labelled untested, not inferred from emulation. |
| VA-A24 | Script/model version changes invalidate only affected voice assets; old content is never matched by filename alone. |
| VA-A25 | Generation keys and engines are absent from the shipped runtime; rights/credits and actual hosting totals are recorded. |
| VA-A26 | All available audio, controls, first/repair takes, scores and blocked cells are delivered; Robin's shortlist can be reviewed without bulk generation. |
| VA-A27 | Whole-game generation and final casting remain stopped until Robin selects and authorizes them. |

Focused tests first. Use the project's existing F/Ren and final-matrix authority rather than launching a new full campaign for every voice parameter. A runtime speech-code change needs a representative route regression, but API audition files alone do not establish a reason to rerun all sixteen campaigns.

## 16 · Sequential work packets for Claude

| Packet | Work | Exit evidence |
| --- | --- | --- |
| VS00 · End-stage intake | Confirm expansion/art/closure status, actual checkout and speech callers; record this narrow policy amendment. Inventory lines, voiced contexts and existing preferences. | Baseline receipt, no earlier work interrupted, exact unknowns. |
| VS01 · Frozen corpus and casting targets | Bind 83 matrix cases to final lines or labelled fixtures; expand narrator tones if needed; finalize five paired player texts and dialect pairs. | Corpus validation, source/speaker check, spoiler-safe review labels. |
| VS02 · Access and adapter proof | Verify all seven configurations, rights, credentials/budget and one working smoke call each; enumerate actual controls. | Provider inventory, executable adapters, real requests; consolidated blockers. |
| VS03 · Casting screen and full audition | Select provisional role identities, generate the matrix and matched controls, keep originals and bounded repairs. | Actual files plus expected/completed/blocked accounting. |
| VS04 · Quality and comparison | Run lexical/audio checks, listen where possible, assemble role reels, normalize review copies conservatively. | Honest QA, individual weak samples retained, per-role shortlist. |
| VS05 · Optional hosted/fallback proof | Wire only a small dev subset; prepared/device/None behavior, A/B, source matching and cancel/late-response controls. | VA-A12–VA-A24 evidence, local and hosted captures/logs. |
| VS06 · Handoff | Build review.html, audio packages, scores, provenance, cost/storage estimate and a proposal for the full dialogue batch. | Real listening gallery, all requested routes accounted for, ZIPs under 30 MB. |
| VS07 · Robin's selection | Present top candidates and specific casting/delivery tradeoffs; await choices or rejection. | **Stop before full-batch synthesis.** Preserve everything for continuation. |

If any provider is unavailable, complete the independent accessible work, retain its empty expected cells and report the specific missing prerequisite. Do not substitute a written impression for an audio sample. Avoid a planning loop: the first substantive provider evidence is a real smoke sample, not a long speculative adapter document.

## 17 · Proposal for the later full-dialogue batch, not its execution

Once Robin has selected the voices and delivery approach, the next task can generate all approved spoken dialogue across the finished game. Prepare the inventory now at the end stage, but do not perform the batch under this audition instruction.

The inventory must include all twelve chapters, all four companion routes, narrator lines, named/background NPC dialogue, side-quest outcomes, postgame, replays, farewell/NG+ variants, approved standard/dialect wording and player A/B lines. Include any already-authorized spoken battle or reading lines as separately classified categories. Count exact distinct utterances rather than multiplying every line by four language profiles. Separate truly dynamic/unbounded text, optional explicit reading, nonverbal cues and unspeakable UI markup.

Report projected duration and storage from measured samples, production cost from the selected provider's actual current terms, expected repair effort and coverage gaps. Separate generation cost from hosting bandwidth. Supply the versioned clip/manifest scheme and incremental rebuild plan. A newly changed line must not trigger replacement of an entire accepted chapter's performances.

No provider, narrator or player choice is final merely because the lead recommends it. The requested next decision is Robin's casting and delivery selection, including choosing None. Only after that selection and full-batch authorization should the complete dialogue-production task begin.

## 18 · Source basis and verification limits

**User direction** is the authority for timing, the audition coverage, female narration, player A/B/None, hosted side assets, local fallback and the bulk-production review boundary. The historical expansion plan supplies optional listening and core offline play; its older blanket restrictions are overridden only for this optional speech path. Existing art/companion references supply identity context, not voice samples or consent to imitate real performers.

**Repository check:** only the pinned voice module described in §02 was retrieved for this addendum. This is not a new whole-repository audit or a claim that the latest expansion is complete.

**Outside documentation:** the following primary sources were checked on 11 October 2026. They establish documented interfaces and constraints, not audition quality, successful installation in Claude's environment, licence clearance for a selected voice, or measured end-user performance. Reverify the selected versions at VS02. Earlier marketing rankings and model-generation assumptions are not acceptance evidence.



**[S01] Project baseline: local Japanese voice module.** Read through the GitHub connector at this fixed revision. Later code may differ; re-audit at execution.

https://github.com/A-Birdi/Road-of-Borrowed-Names/blob/ed3a862bb9add078115fbdf76a98735f6792b0c0/src/audio/50_voice.js


**[S02] Browser local voice identification.** Local-service flag; device/browser exposure is not universal.

https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService


**[S03] VOICEVOX Engine documentation.** Voice/style enumeration, audio query, synthesis, accent phrases and dictionary controls.

https://github.com/VOICEVOX/voicevox_engine


**[S04] VOICEVOX Nemo.** Character-free voice route; separate casting/model terms still need inspection.

https://voicevox.hiroshiba.jp/nemo/


**[S05] AivisSpeech Engine documentation.** Style and tempo dynamics; documented incompatibilities with VOICEVOX control fields.

https://github.com/Aivis-Project/AivisSpeech-Engine


**[S06] Qwen3-TTS documentation and model table.** Japanese, instruction-capable variants, custom voices and voice-design workflows.

https://github.com/QwenLM/Qwen3-TTS


**[S07] Gemini speech-generation documentation.** Speech metadata/style and voice identity controls; version-specific request format.

https://ai.google.dev/gemini-api/docs/speech-generation


**[S08] ElevenLabs speech best practices.** Model-specific tags, voice selection and pronunciation support; do not mix versions.

https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices


**[S09] Azure SSML voice/style/role documentation.** Styles/roles available only for supported voices; unsupported settings can be ignored.

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice


**[S10] Browser autoplay handling.** Playback may require user activation; handle rejected playback promises.

https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay


**[S11] CSP media-src.** Optional same-origin media delivery must be permitted by the actual policy.

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/media-src


**[S12] CSP connect-src.** Manifest/fetch requests need their own narrow policy permission.

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src


**[S13] GitHub Pages limits.** Published site size and bandwidth constraints; recheck before a full voice deployment.

https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits


**[S14] VOICEVOX terms.** Credit and individual voice-library terms; not a blanket clearance for every voice.

https://voicevox.hiroshiba.jp/term/


**[S15] Azure language and voice availability.** Verify the actual Japanese voice, language, styles and roles.

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts


**[S16] ElevenLabs TTS capabilities.** Japanese-capable models; exact model selection to be verified at execution.

https://elevenlabs.io/docs/overview/capabilities/text-to-speech


---

### Handoff instruction to paste above this addendum

> Queue VA-1 as the last task after the currently authorized expansion, art and existing closure work. Do not switch to it early. At that point, carry out the cross-system Japanese voice audition and small optional-hosted-audio proof in this document, using one implementation owner (the lead) and the actual completed script. Return the listening gallery and all providers' actual results, including female narration, five lines per companion, player A and B, the NPC range, Suzu's dialect pairs and the structure tests. Prepared voices are optional side assets; local Japanese device speech, including Windows when available, is the fallback. None suppresses speech rather than triggering fallback. Do not generate the whole game's dialogue or settle the final cast until I have heard the samples and given the next instruction.
