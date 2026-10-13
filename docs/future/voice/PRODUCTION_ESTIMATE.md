# VA-1 · The whole-game production estimate (method; nothing approved)

Robin, 2026-10-13: before any paid whole-game batch, a complete production estimate:

- recording variants;
- measured audio duration;
- correction allowances;
- later regeneration costs.

**Audition approval and full-game approval stay separate.** The audition runner (`tools/voice/audition.mjs`) accepts
only authorizations whose `purpose` is `"audition"` and refuses any other. Whole-game production needs its own
authorization, made after this estimate is filled in with measurements and Robin has chosen the voices. No such
authorization exists, and no tool here can produce the game's dialogue.

This page is the method and the inputs known today. The figures that depend on a chosen voice are left to be
measured, not assumed.

## 1 · What would be recorded (counted from the game; `node tools/voice/fullgame_count.mjs`)

Each recording is a distinct speaker, player voice (A/B), dialect, spoken text and delivery. Two characters saying the
same words are two recordings.

- A line said by "whoever travels with you" counts once for each companion it can belong to.
- The player's lines count for Voice A and for Voice B, never for None.
- Suzu's lines count again in Kansai where the dialect table changes them.

| | Recordings | Characters | Morae | Pauses |
| --- | ---: | ---: | ---: | ---: |
| Narrator | 4,757 | 124,194 | 133,474 | 13,736 |
| Nao | 1,645 | 46,357 | 48,189 | 6,770 |
| Mio | 1,564 | 45,497 | 46,468 | 6,517 |
| Ren | 1,609 | 48,767 | 50,651 | 6,669 |
| Suzu (standard and Kansai) | 2,717 | 77,036 | 80,939 | 10,822 |
| Player, Voice A + Voice B | 318 | 5,682 | 5,898 | 710 |
| 281 other speakers | 3,641 | 113,674 | 116,938 | 15,424 |
| **All** | **16,251** | **461,207** | **482,557** | **60,648** |

Morae come from the game's own readings (furigana); pauses are its punctuation. The 13,820 source lines hold 12,770
distinct texts. 115 lines (3,749 characters) contain a run-time name and cannot be recorded as written. Until a name
policy is chosen, they stay with the device voice or silent.

This counts every conditional variant (level, companion, dialect, story state), not what one journey hears.

## 2 · Duration: measured, per chosen voice

For each chosen voice, its audition takes give a measured speaking rate. That voice's recordings then take:

> seconds = morae ÷ (morae per second) + pauses × (seconds per pause) + recordings × (edge silence)

The rate is fitted on that voice's own takes (the matrix gives 5–24 lines per role), and its spread gives the
estimate's range. **Nothing here has been measured yet.**

Before measurement, an ordinary Japanese reading suggests a range only:
- 8 morae a second, 0.3 s a pause, 0.3 s of edges gives about **23 hours**;
- 6.5 morae a second, 0.5 s a pause, 0.4 s of edges gives about **31 hours**.

## 3 · Cost of one complete pass, per kind of provider

| Kind | Price unit | Formula | Before measurement |
| --- | --- | --- | --- |
| Local (VOICEVOX, Nemo, AivisSpeech, Qwen on your own machine) | none | $0. Compute time = measured real-time factor × duration. | to measure |
| Gemini 3.8 Flash TTS (official prices, see `authorizations/`) | audio output tokens | duration × measured tokens per second (published 25; about 32 reported) × $9.00 per 1M until 2026-12-31, **$18.00 from 2027-01-01**, plus text input at $0.50 per 1M | 23–31 h at 32 tokens/s: **$24–32**, or **$48–64** from 2027 |
| ElevenLabs, Azure (if ever authorised) | characters | characters (plus any reviewed tags) × the plan's or tier's current price | 461,207 characters × price |

## 4 · Correction allowance

A pass is never final. The estimate adds:

- **Repairs:** the share of directed takes that needed a repair in the chosen voice's audition, times the batch, with
  a margin (if 10 % needed one, budget 15 %). At most one repair per flawed line without a scoped reason (§05).
- **Pronunciation fixes:** lines with readings a provider got wrong in the audition, and lines sharing those words.
  For local engines this means dictionary entries; for hosted providers, regenerations.
- **Listening:** someone has to hear every recording before it ships. That is human time, about the duration plus
  replays, and it is the largest cost that is not money.

## 5 · Regeneration later

Recordings are keyed by speaker, voice, model version, dialect, delivery and the spoken text's hash. A change
regenerates only what it touches:

- **A changed line** regenerates its own recordings only. The estimate takes the script's change rate from the
  repository's history over the last months (to be measured from `git log` of `src/content/` at estimate time) and
  prices a year of it.
- **A provider changing its model or a voice** regenerates every recording of that speaker on that provider. Each
  speaker's share is in the table above. This is the largest regeneration risk for hosted voices.
- **A price change** (Gemini doubles on 2027-01-01) is priced at the date the work would happen.

## 6 · Storage and hosting

| Format | Size for 23–31 h |
| --- | ---: |
| Opus at 32 kbit/s | about 330–430 MB |
| MP3 at 64 kbit/s | about 650–870 MB |

That is close to GitHub Pages' published limits on site size (S13: to be rechecked at the time). Hosting bandwidth is
priced separately from generation. The game itself stays complete without any of it.

## 7 · What the finished estimate will need from the audition

- the chosen voice per role;
- that voice's measured rate, pause and edge;
- its measured tokens per second (for Gemini) or real-time factor (local);
- its repair and pronunciation-fix rates;
- the price on the date;
- the script's measured change rate;
- the chosen audio format.

Until those exist, the figures above are ranges and nothing is requested.
