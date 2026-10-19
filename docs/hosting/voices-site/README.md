# The Road of Borrowed Names — voices

The recorded voices of [The Road of Borrowed Names](https://a-birdi.github.io/Road-of-Borrowed-Names/), served by
GitHub Pages at `https://a-birdi.github.io/Road-of-Borrowed-Names-voices/`. The game, on the same origin, reads them
from `../Road-of-Borrowed-Names-voices/ja-JP/` as they are needed. Nothing here is a page to visit.

- `ja-JP/index.json` names the build and where the rest is.
- `ja-JP/idx/` holds one index per scene and the reference index, each named by its content.
- `ja-JP/rec/<speaker>/<id>.<sha12>.opus` holds the recordings (Ogg Opus, 48 kHz mono, −20 LUFS), each named by its
  content, so an unchanged recording keeps its address from build to build.

The format is `rbn.voice.site/1` (the game repository's `docs/future/voice/production/VOICE_DELIVERY.md` §5). The
site is written by `tools/voice/voice_site.mjs` in that repository; it is not edited by hand.

## Credits

All the voices are speech synthesis (AI voices), not human performances, made on the developer's own computer.

- **Narrator:** 「声は(x.com/dopoiro)のAI」 — the リアボVC model ほのか, with AivisSpeech (ACML 1.0; the credit the
  model's publisher asks for).
- **AivisSpeech models from AivisHub** (ACML 1.0): まお and コハク ("AivisSpeech: まお", "AivisSpeech: コハク", as their
  publisher asks when credited), るな, 凛音エル.
- **VOICEVOX Nemo** (男声1, 男声2, 男声3).
- **Qwen3-TTS** (Qwen/Qwen3-TTS-12Hz-1.7B-Base; Apache-2.0): the player's voices, the companions and most of the
  other characters, each conditioned on a reference voice whose SHA-256 is in the casting record; one of the
  narrator's words, conditioned on the narrator's own readings.
- **One sourced sound** (a cat's meow), CC0 1.0.

Each recording's engine, model, revision and settings are listed in the game repository's
`docs/future/voice/production/run/results.json.gz` (`casting`).
