# Ensemble recordings: provenance

These files are the optional **Ensemble** performances of two pieces of the game's own music, for the hosted copy of
*The Road of Borrowed Names* (Settings › Audio › Music performance; docs/MUSIC_PERFORMANCE.md). The game never needs
them: the single downloaded file plays the Original music without them, and so does any copy that cannot fetch them.

| Song | Where it plays | Files |
|---|---|---|
| `snowbell` | the Snowbell area | `snowbell/` |
| `battle_keepers` | the Keepers' Road battle | `battle_keepers/` |

Each song has a first-pass file and a steady-cycle file in two encodings (Ogg Opus, and MP3 for browsers without
Opus), named by their content. `manifest.json` lists them with their measurements and the evidence for each.

## What they are made of

- **The composition** is the game's: the notes, rhythms, arrangement, tempo and form compiled by `src/audio/` (the
  score fingerprint in the manifest), and the first-pass realisation the Original player gives it (its seeded timing
  and velocities). Nothing was recomposed.
- **The instrumental realisation** is the SC-1 treatment Robin auditioned: its voice assignment, part balance, room
  and filters, re-rendered from the current score by `tools/music/ensemble/` at 48 kHz.
- **Sampled voices** (koto, shakuhachi, shamisen, strings, cello, acoustic bass) come from the **TimGM6mb** sound bank,
  © 2004 Tim Brechbill, © 2010 David Bolton, distributed under the GNU General Public License version 2: its
  copyright file and the licence text are in `notes/` unchanged. The sound bank itself is not distributed here.
- **Modelled voices** (the biwa-like lute, rin, taiko, shime and the small strokes) are SC-1's own synthesis code
  (`tools/music/ensemble/rs1.py`). The biwa is a modelled lute, not a recording of a biwa.
- **Software** used to make them, not distributed: FluidSynth (system library), NumPy, SciPy, soundfile, FFmpeg
  (libopus, libmp3lame).

## Open question for the project owner

Whether distributing recordings rendered with a GPL-2 sound bank carries obligations for these files is a rights
question this note does not settle. No licence is chosen or declared for these recordings here; the bank's terms and
attribution are recorded so the question can be reviewed before the files are published.
