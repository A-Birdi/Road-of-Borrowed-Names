# VA-2 · Handoff: make the casting samples on Robin's PC

**For a Claude session running on Robin's own Windows PC** (the Claude app's local session, or `claude remote-control`
started in the folder Robin granted for VA-1). The cloud session that wrote this cannot run the engines: their model
hosts are refused there, it has no GPU and about 2 GB of disk. It prepared the plan, the scripts and this page, and
generated nothing.

**Your authority is Robin's message of 2026-10-14**, quoted in `docs/future/plan/11_CONTRADICTIONS.md` **C-93**. In
short: make the casting samples Robin asked for, exactly and only these, and one gallery file for Robin to listen to.

- **Allowed:** one CC0 or public-domain cat meow for Mochi (below); free, local engines that VA-1 already set up on this PC (AivisSpeech, the VOICEVOX Nemo engine,
  Qwen3-TTS through the `qwen-tts` Python package); free downloads from their official sources of what this needs
  in addition: the **Qwen3-TTS 1.7B VoiceDesign** model (Hugging Face `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign`,
  Apache-2.0) and **free AivisSpeech models from AivisHub** for the narrator candidates and the AV slots; pip packages
  `praat-parselmouth` and `pyloudnorm` into the VA-1 Python environment.
- **Not allowed** (as in VA-1): any hosted or paid synthesis (Gemini, ElevenLabs, Azure, DashScope, trials); accounts,
  keys or purchases (an AivisHub model that needs an account or payment is skipped); voice cloning of anyone;
  weakening security settings or the execution policy; restarts, services, startup entries or ports beyond loopback;
  touching the game, its saves or other projects; a final cast; any line beyond the plan's; whole-game generation.
- **Limits:** VA-1's: a task-owned folder (`_va2_samples` beside `_va1_audition`), at most 40 GiB of task-owned disk,
  keeping 20 GiB or 10 % of the drive free; one heavy engine at a time.
- **Finish line:** `VA2_CASTING_SAMPLES.html` (one file, every recording inside it) ready for Robin, and the run's
  records pushed back (below). Then stop.

## What the samples are (the plan: `docs/future/voice/va2/va2_plan.json`)

| Section | Takes | Engine | What Robin decides |
| --- | ---: | --- | --- |
| 1 · Player voices | 60 | Qwen3-TTS VoiceDesign | Three sets, each a Voice A and a Voice B at High and Low pitch (the same take moved ±2 semitones, formants kept), five moods (neutral, happy, sad, frustrated, excited) on the player's own lines. Robin picks a set. |
| 2 · Narrator | 14 | AivisSpeech | Seven different female models you choose (N1–N7), each reading one line Directed-Neutral and Directed-Energetic. Robin picks one. |
| 3 · NPCs | one per NPC (281) | as cast per NPC (Mochi the cat: a sourced meow, not a voice) | One line each with the engine and settings in the plan: Qwen3-TTS VoiceDesign for most, AivisSpeech (slots AV-girl, AV-teen, AV-bright, AV-sweet, AV-showy) for bubbly, high-energy feminine voices, VOICEVOX Nemo (slots NM-A, NM-B, NM-C) for middle-aged men only; supernatural speakers with a treatment. Robin ticks what is disliked; the rest stands. |

Do not change the plan's texts, voices descriptions, seeds or settings. If something cannot be made as planned, make
the rest and say exactly what and why in the summary.

## The run

1. **Where am I.** A Windows host (not WSL, not a cloud VM); the folder Robin granted; `_va1_audition` from VA-1.
   Create `_va2_samples`.
2. **Get the branch** `claude/stoic-sagan-n3jvgk` of `A-Birdi/Road-of-Borrowed-Names` at the commit named in
   `va2_plan.json` → `builtFrom.commit` (a `git clone`/`git pull` into `_va2_samples\repo`, or GitHub's ZIP of that
   commit). Check `node tools/voice/va2/plan.mjs --check` prints "is current" (Node 18+; VA-1's Node is fine).
3. **Python.** Reuse VA-1's Qwen environment (Python 3.12, `qwen-tts`, torch with CUDA if the GPU allowed it). Add
   `pip install praat-parselmouth pyloudnorm` (soundfile, numpy and scipy come with qwen-tts). Download the
   VoiceDesign model (about 4.5 GB) with `huggingface-cli download Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign` or let the
   first run fetch it. Record the revision.
4. **Choose the voices** (`va2_voices.json`, from `docs/future/voice/va2/va2_voices.template.json`): start AivisSpeech
   and the Nemo engine; `python tools\voice\va2\va2_render.py voices --voices va2_voices.json --out _va2_samples\work`
   lists every speaker and style id.
   - **Narrator N1–N7:** seven different adult female AivisSpeech models suited to calm, clear storytelling, as
     different from each other as you can find (warm low, clear mid, light high, mature, soft, crisp, rich). Include
     the default model (Anneli) if installed. Install more from AivisHub through AivisSpeech's own model manager
     (free models only; read each model's licence and record it: it must allow use in a free, distributed game with
     credit). For each: `normal` style id, and `upbeat` if the model has a brighter style (テンション高め, 上機嫌,
     喜び…), else null (the job then uses the neutral style with stronger inflection and says so).
   - **AV slots:** a model and speaker for each `want`; distinct from the seven narrators where possible.
   - **NM slots:** NM-A is the Nemo voice Robin preferred in VA-1 for the middle-aged man (VA-1's casting file for
     `voicevox_nemo`, role `npc08`, and Robin's VA-1 notes); NM-B and NM-C two other Nemo male voices.
   - **Mochi's meow (`sounds.cat_meow`):** Robin, 2026-10-14: "source a basic cat meow for Mochi". Find one basic,
     clean domestic cat meow (about 0.5–1.5 s, nothing else in it) released **CC0 or public domain, as stated on the
     recording's own page** (a Wikimedia Commons file page states it; other sources only if their page states CC0 or
     public domain for that file). Download it into `_va2_samples\sounds\`, and record `file` (relative to
     va2_voices.json), `title`, `url`, `author`, `licence` and `sha256`. If no recording's terms can be confirmed,
     leave it null: Mochi's ニャー is then said by the AV-bright AivisSpeech voice in its upbeat style, playfully, as
     Robin asked ("generate it using a female model, any one is fine. Just keep it playful"), and the gallery says so. Never record a cat, a voice or anything else
     yourself, and never use a recording with attribution, share-alike or non-commercial terms here.
   - Re-run `voices` until it prints "va2_voices.json: ready".
5. **Smoke test:** `python tools\voice\va2\va2_render.py render --plan docs\future\voice\va2\va2_plan.json --voices
   va2_voices.json --out _va2_samples\work --ids P1A-neutral-high,N1-neutral,<one NPC id of each engine> ` and listen
   to nothing yourself (you cannot judge a voice); check the files exist, play in a browser, and `results.json` has
   no failure.
6. **Render everything:** the same command without `--ids`. It goes engine by engine (AivisSpeech, Nemo, then Qwen),
   resumes if stopped, and makes a Qwen take again (next seed, at most three tries) when it starts with sound before
   the voice or ends in an unvoiced tail ("no trailing consonants or overly-breathy sounds").
7. **The gallery:** `python tools\voice\va2\va2_gallery.py --plan docs\future\voice\va2\va2_plan.json --out
   _va2_samples\work` writes `_va2_samples\work\VA2_CASTING_SAMPLES.html`. Open it once to check it plays and every
   section has its recordings. Copy it to the desktop for Robin.
8. **Summary:** `_va2_samples\RUN_SUMMARY.md`: what was installed (sources, versions, hashes, licences), the voices
   chosen and why, counts made and failed, takes the clean check still flagged, time taken, anything that differs
   from the plan.
9. **Send the records back** (not the audio): commit `va2_voices.json`, `results.json` and `RUN_SUMMARY.md` to
   `docs/future/voice/va2/run/` on the branch `claude/stoic-sagan-n3jvgk` and push, if this session can push; if it
   cannot, leave them in `_va2_samples` and tell Robin where. Never commit the clips, the models or the gallery
   (it holds the recordings).

## Afterwards (not yours)

Robin listens and sends back the gallery's "Copy my decisions" text. Only then does the lead build anything (C-93).
