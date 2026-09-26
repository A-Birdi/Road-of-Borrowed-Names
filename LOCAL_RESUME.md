# Resuming locally (Windows)

Development checkpoints are on the task branch **`claude/stoic-sagan-n3jvgk`**
of `https://github.com/A-Birdi/Road-of-Borrowed-Names.git` — not on `main`.
`<LOCAL_PROJECT_DIR>` below means your chosen local project folder.

## Option A — native session handoff
If your Claude Code client offers a documented way to continue this cloud
session locally (for example "open in CLI"/teleport from the Claude app), use
it only after the cloud session has stopped writing to the branch. Confirm the
local checkout's remote and branch match the ones above before continuing.
Producing this document does not start anything on your PC.

## Option B — fresh local session from repository files
PowerShell:

```powershell
cd <LOCAL_PROJECT_DIR>
git status                      # if this is already a checkout: inspect first
# Empty folder only:
git clone https://github.com/A-Birdi/Road-of-Borrowed-Names.git .
git fetch origin
git switch claude/stoic-sagan-n3jvgk   # or: git switch -c claude/stoic-sagan-n3jvgk --track origin/claude/stoic-sagan-n3jvgk
git log --oneline -5
```

If the folder contains unrelated or uncommitted files, do not clone into it or
overwrite them; clone into an empty subfolder instead and compare.

Then start Claude Code in that folder and say: "Read CLAUDE.md and HANDOFF.md,
recover the current state, and continue the assignment."

## Tooling
- Node.js 20+ is needed only for development (build/tests), not to play.
- Build: `node tools/build.mjs` → writes `index.html`.
- Unit tests: `node tests/run-unit.mjs`.
- Browser tests: `npm install` (installs Playwright locally) then
  `npx playwright install chromium` on a local machine, then
  `node tests/e2e/run.mjs`.

## Playing
Open `index.html` in a browser. For reliable saves, serve the folder from a
stable local origin, e.g. `npx http-server -p 8080` and open
`http://localhost:8080/`. Saves belong to that browser profile + origin.
