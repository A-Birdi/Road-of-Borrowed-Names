# VA-1 · The end-of-project Japanese voice audition (started 2026-10-12: VS00 and VS01 done; VS02 prepared, waiting for access)

Robin sent this package on 2026-10-11 as a future end-stage instruction. **It is the last queued task:** it starts
only after the currently authorised expansion, art and closure work (P02–P17), and it does not interrupt them. Robin's
C-85 sets the order around it: the whole twelve-chapter campaign shown playable in the shipped build (C-84) first, then
VA-1, and only after VA-1 the full test matrix. The
decision and the lead's reconciliations with the standing rules are in
[../plan/11_CONTRADICTIONS.md](../plan/11_CONTRADICTIONS.md) C-83.

- [VS00_INTAKE.md](VS00_INTAKE.md): the intake (where the project stands, the speech code and its callers, the lines, the unknowns).
- [corpus/CORPUS.md](corpus/CORPUS.md): VS01's frozen corpus (83 cases bound to game lines or labelled fixtures, 14
  neutral controls), built and checked by `tools/voice/corpus.mjs`.
- [VS02_SETUP_REQUEST.md](VS02_SETUP_REQUEST.md): **the consolidated setup request**, per configuration:
  - the exact configuration;
  - the hosts it needs;
  - its secret and header;
  - the permissions and cost it needs, with retries bounded;
  - its size;
  - whether it can run here.

  It also records why the Google Cloud token stays unused, and the whole-game planning count. No audio has been
  generated.
- [inventory/provider_inventory.json](inventory/provider_inventory.json): each configuration's recorded access (all
  `blocked_access` from the development environment on 2026-10-12: untested, not inferior).
- `casting/<config>.json`: casting files (19 roles each). Gemini's list unheard candidates; the others are templates.
- `authorizations/<id>.json`: what a paid run may spend, approved by Robin (Gemini's awaits approval).
- `usage/<id>.jsonl`: each authorization's append-only usage ledger.
- The tooling in `tools/voice/`:

  | Tool | Purpose |
  | --- | --- |
  | `providers.mjs` | Request builders. |
  | `audition.mjs` | The gated runner. |
  | `audio_check.mjs` | Measurement only. |
  | `gallery.mjs` | Writes `review.html`. |
  | `ledger.mjs` | The append-only usage ledger and the dollar allowance. |
  | `pack_local_kit.mjs`, `windows/` | The Windows kit for the local engines. |
  | `qwen_local_job.py` | The Qwen job for a GPU machine. |
  | `fullgame_count.mjs` | The whole-game planning count. |

  Everything the runner writes, audio and gallery included, goes under `voice-audition/`, which git ignores. Test
  clips are never committed or published.
- [VA1_ADDENDUM.md](VA1_ADDENDUM.md): the addendum (sections 01–18, §16 the packets VS00–VS07). The copy's only
  change is noted at its head.
- `templates/`: the package's templates, unchanged: the audition matrix (83 directed cases and 14 neutral controls per
  provider configuration, with text and source fields deliberately empty until the end-stage checkpoint), the
  provider inventory (seven configurations, none checked yet), the speech-line schema and example, the result record,
  the score sheet and the voice profile.

## The package's own reading notes (START_HERE.md, as sent)

> This package contains a **future end-stage instruction**, not generated audio or completed listening results.
>
> 1. Read `RBN_Voice_Audition_Addendum_VA1.md` (the PDF/HTML are reading copies).
> 2. Queue its VS00–VS07 packets after the currently authorized expansion, art and existing closure work. Do not
>    interrupt that work.
> 3. Use `templates/audition_matrix.json` or CSV for the 83 minimum directed cases and 14 neutral controls per provider
>    configuration. Populate final-script text/source fields only at the end-stage checkpoint. Null text fields are
>    intentional, not missing generated output.
> 4. Use the schema/example and provider inventory to implement verified, version-specific adapters. No API keys,
>    speech models, voices or fonts are supplied here.
> 5. Return actual audio plus the comparison gallery after executing the audition; then wait for Robin's
>    casting/full-batch instruction.
>
> All seven configurations must be attempted: VOICEVOX, VOICEVOX Nemo, AivisSpeech, Qwen3-TTS, Gemini-TTS, ElevenLabs,
> Azure Speech. A Windows/local-device baseline is separately recorded when genuinely available.
>
> **Runtime rule:** optional hosted recordings -> allowed local Japanese fallback -> silence. Global None and player
> None must bypass their speech paths entirely. The standalone index remains playable without voice side files.
>
> The addendum is supplementary. It does not replace the prior expansion or art packages, and does not authorize new
> paid subscriptions, final casting, whole-script generation or public release of test clips.

The package's continuation prompt is the addendum's closing "Handoff instruction" (its last section), word for word.

## Package checksums (MANIFEST.sha256, as sent)

```text
398664a3564cd3b3724fb87edea930ecca7edacee1615543fc5df257568aadaa  CONTINUATION_PROMPT.md
ae3082ffa8e5e93e3332f7102b8a5e34a83b160b796dee3598ee9afbcc784890  RBN_Voice_Audition_Addendum_VA1.html
da179c4459391327872c06af46d3535c8468dddbec7ef7a3e3a8ebb8462ba575  RBN_Voice_Audition_Addendum_VA1.md
f77d818c319766ccef580c48e7b003d28ecf7d5736a03cf4529efc506f754eeb  RBN_Voice_Audition_Addendum_VA1.pdf
89a480163e9902d3bf4fdb75e0f2ce45c05da3bbc58d0d5e58b3abcbdd3d27b9  START_HERE.md
28cb49a5f471e584f90b1ebc27c649298d040971ae3e07e4903f2076c021ed2d  templates/audition_matrix.csv
c95d36904f0a0c99b3b52383bf0d74f189b120557cdef1f0c7356d08fd119af9  templates/audition_matrix.json
f5b3df752f62ff5cba043013455f25d893326b46e755332855db9cf4dea489e6  templates/provider_inventory.json
b2a692f5b20c5e3dcad5726b574e8caf1f2ada288358caac4befaa7f60087534  templates/result_record.template.json
97fbb87907fd31a21c5ea56c31e2c770e8a748368dc15f3f7a175d22896146e9  templates/scores.csv
9fcdd0f0642bda03c3910ae3ea8dfaff5eb6f93785f71c0313f6a23099ed774b  templates/speech_line.example.json
44dfb9433e2f63c6d1c08a87b6b197b049c97d4ec07828eb20c783f24bb4682c  templates/speech_line.schema.json
c96052f784dbb9681ffd94346f755666a5702dfcdf9924c305eea4d931b2a05a  templates/voice_profile.template.json
```

The committed templates match these checksums (checked with `sha256sum` when they were added).
