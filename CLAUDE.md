# Project instructions — The Road of Borrowed Names

A single-file (index.html) Japanese-learning fantasy RPG. The authoritative
game specification is `SPECIFICATION.txt` (complete, unabridged). Do not
reduce its scope.

## Before doing anything
1. Recover current work first: `git status`, `git log --oneline -15`,
   `git fetch origin` and compare with the task branch named in HANDOFF.md.
   Never reset to `main` or restart the project; development checkpoints live
   on the task branch, not on `main`.
2. Read `HANDOFF.md` (state + next actions), `REQUIREMENTS.md` (evidence-linked
   checklist), `VALIDATION.md` (what was actually tested).

## Layout
- `src/` modular source (engine, content, learning, recognition, audio, save, ui).
- `tools/build.mjs` assembles the self-contained `index.html` at repo root.
- `tests/` node unit tests + Playwright browser tests of the built `index.html`.
- `data/` embedded third-party data with provenance/licence notes.

## Commands
- Build: `node tools/build.mjs`
- Unit/content tests: `node tests/run-unit.mjs`
- Browser tests: `node tests/e2e/run.mjs` (uses installed Playwright + Chromium)

## Rules
- The shipped game must not need network, CDN, accounts, API keys or a server.
- No save export/import, cloud saves, share codes or equivalents (spec §14).
- Every displayed kanji needs furigana; the content validator enforces this.
- Recognition must stay separate from answer checking; never use the expected
  answer to manufacture a recognition result.
- Never mark something verified in REQUIREMENTS.md/VALIDATION.md without
  having run the check. Distinguish browser tests, unit tests and code review.
- Keep personal local paths and credentials out of committed files.
- Art work (region kits, rendering, camera, actors, animation, light, battle staging, the book's look) follows
  `docs/future/plan/AC1_ART.md` (Robin's C-82); it applies to art work only.

## Checkpoint policy
Commit and push to the task branch after meaningful milestones, before risky
refactors, and roughly every 10–15 minutes of substantive work. Run quick
checks first, update HANDOFF.md/REQUIREMENTS.md/VALIDATION.md when meaningful,
then verify the remote ref (`git ls-remote origin <branch>`) equals local HEAD.
Never force-push, never merge into main, never delete branches.
