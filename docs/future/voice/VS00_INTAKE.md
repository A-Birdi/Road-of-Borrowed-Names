# VA-1 · VS00 · End-stage intake (2026-10-12)

The addendum's first packet (VA1_ADDENDUM.md §16): confirm what is finished, the checkout and the speech callers;
record the policy amendment; inventory the lines, the voiced contexts and the existing preferences; name the exact
unknowns. No audio has been generated. Nothing earlier was interrupted: no test, campaign or build was running when
VA-1 began.

## Where the project stands

- **Checkout:** branch `claude/stoic-sagan-n3jvgk` at 0d5684b; the game file `index.html` sha256
  `e456645a9e303d850d15f864a9721156f6a27b0db1ba41c7a1ef0438e49525d4` (built from that source, unchanged since d26ce74).
- **Expansion, art and closure (P02–P17):** done from the lead's side (HANDOFF.md, `docs/future/work/P17_CLOSURE.md`):
  the twelve chapters, the postgame, the art pass (AC-1), the Living World, the complete browser run, the language
  ledger, the speed checks and the night sweep. Open there, and Robin's: the final review set, the night sheets, the
  device checks, a native speaker's review (none available, C-26).
- **P18:** Plan B (Robin's C-89) done: four continuous twelve-chapter campaigns pass on one build, the sixteen
  namings 16/16, every task tier swept, the level-dependent narration checked (VALIDATION.md "P18 — Plan B").
- **LP-1** (the Ledger slow in Firefox): fixed and checked in headless Chromium; Firefox and Robin's machine open.
- **The order** (C-87, unchanged by VA-1): VA-1 now; the hosted page only when everything passes.

## The policy amendment (C-83, recorded)

Recorded in `docs/future/plan/11_CONTRADICTIONS.md` C-83 when the package arrived: optional same-origin voice side
files and their manifests, development-time synthesis and the audio-specific network permissions it needs are allowed;
the game stays complete and offline from `index.html` alone (no account, server, key, model, download or voice file
needed to play); no whole-game synthesis, final cast, purchase, new terms or public release of test clips. Cloud
credentials stay in the development environment, never in the HTML, the repository, the audition page, logs or a
download.

## The speech contract today

`src/audio/50_voice.js` is unchanged since the addendum's baseline ed3a862b (no commit touches it in
`ed3a862b..HEAD`), so §02's description holds exactly: `RB.voice` uses only local Japanese voices
(`localService === true`, `ja*`), sets the voice explicitly, cancels the previous utterance, ducks the music, scales by
the master and voice volumes, fires `onend({spoken})` except for a cancelled or superseded utterance, and has a
watchdog for engines that never end. Status notes for Settings say it is device text-to-speech, not voice acting.

**Callers (11 speaking, 7 cancelling):**

| Where | What is spoken | How |
|---|---|---|
| `src/ui/20_dialogue.js` | the line on screen (its reading, with the speaker's `voice.pitch`) | automatically when Settings › "Speak dialogue automatically" is on; "Say it slower" at 0.75× |
| `src/ui/10_ui.js` | a word's reading (word help's "say") | on request |
| `src/ui/66_words_pages.js` | a remembered line (Company / Words pages), with the speaker's pitch | on request |
| `src/ui/50_menu.js` | a notebook word | on request |
| `src/ui/70_lessons.js` | a kana or kanji in a lesson | on request |
| `src/ui/65_challenge.js` | a listening step's transcript ("Hear it") | on request |
| `src/ui/88d_karuta.js` | the reader's card, 0.9× | in the karuta game when its voice is on |
| `src/ui/88g_festival_games.js` | a festival game's description | on request |
| `src/ui/89s_shells.js` | a shell's fragment | on request |
| `src/ui/55_settings.js` | こんにちは, as a sample | when a voice is chosen |
| `src/engine/90_game.js` | — | applies the chosen voice and rate; cancels on leaving a journey |

**Existing preferences** (the settings record, not the save): `voice: { auto: false, uri: null, rate: 0.95 }`,
`vol.voice: 1` (with master and mute), and `suzuSpeech: 'standard' | 'kansai'` (Suzu's Kansai-ben, which changes her
text and so what is spoken). No save field concerns speech.

## The lines (counted from the compiled scenes)

13,820 spoken lines with Japanese text in 3,065 scenes (12,770 distinct texts; 382,144 characters of plain Japanese
without readings). By speaker: narration 5,482; the travelling companion as `comp` (whoever travels with you) 3,184;
named companion lines Nao 325, Ren 283, Suzu 290, Mio 266; the player 160; other characters 3,821 (281 distinct
speakers); bodiless voices 9. 292 characters carry a `voice.pitch` for device speech. These count every conditional
variant (level, companion, dialect), which is why they exceed what one journey hears.

## Exact unknowns, carried into VS01–VS02

- **Provider access (VS02).** Probed from this environment on 2026-10-12: Google's Generative Language API host is
  reachable and a Google Cloud access token is present in the environment, but whether it is approved for VA-1 and
  under what spending limit is not recorded. The ElevenLabs API, Azure Speech endpoints, DashScope (Qwen), Hugging
  Face (Qwen3-TTS and Aivis models), the Aivis project's sites and the VOICEVOX site are refused by the environment's
  network policy (HTTP 403 at the proxy); VOICEVOX's GitHub release downloads are refused too. No ElevenLabs or Azure
  key is present. Local resources: 4 CPU cores, 15 GB memory, no GPU, about 5 GB free disk, Python 3 and Docker.
- **A Windows device baseline:** none here (Linux container); only Robin's machine can record one.
- **Budget:** no VA-1 spending allowance is recorded anywhere in the repository.
- **Listening:** no person here can listen; quality checks will be measurements and lexical checks, labelled as such.
