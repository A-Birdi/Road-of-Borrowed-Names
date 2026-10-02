# Battle presentation contract (integrator) — what was built and how it is checked

Battle addendum Phase B (§12–§16, §21.3, §22.2, §23.1–§23.3). The integrator owns this; the art
areas build on it (`docs/BATTLE_ART_CONTRACTS.md`). Test results, with the build they ran on, are
in `VALIDATION.md`; this file says what the behaviour is and which test proves each part.

## Settings (Settings → Learning → Battles)

| Setting | Values (default first) | What it does |
|---|---|---|
| Battle animations | Normal, Fast, Instant | Normal plays every action at its authored timing; Fast at about 70 % (×1.43); Instant plays no movement, no menu slide and no banner, applies the committed results once in order and leaves the recap (**Last exchange**) in the log. Text speed has no say in battle (RBN-03). A save without the setting reads as Normal. |
| Battle controls during actions | Adaptive, Keep visible | Adaptive withdraws the telegraph and the response dock through their own edge once the exchange is committed (desktop and landscape: right; portrait: down; the telegraph up), and brings them back once, for the next decision. Keep visible leaves them in place, dimmed and inert. |
| What creatures are about to do | Adaptive, Expanded | Adaptive: a compact badge per creature; the target's telegraph in the panel, plus every other creature whose words are the task. Expanded: every creature's telegraph in the panel while you decide. Neither changes the creatures, what is revealed, or the help on offer. |

## The action banner (`src/ui/82b_battle_banner.js`, §15)

- Shown by the sequencer at the action's first frame and hidden inside the action's own
  interval: the player's response ends at `P.end` and the companion's at `C.end`, never at the
  end of the settling or finish appended to them (§15.3). A creature's move ends at `E.end`.
- Blue for the party (your response, your companion's support, a technique you share — one banner
  naming you both), red for a creature (its own buff included). Actor name and a party/creature
  mark always accompany the colour.
- Never while choosing, inspecting, reading or writing, choosing support, between actions, during
  the result, in Instant, after Skip, with the tab hidden, or after the encounter.
- Token-owned: only the token that showed it can hide it; a late callback from an earlier action
  returns `false` and leaves the newer title alone. `clear()` on exit and error paths.
- Overlays the scene (no reserved row), takes no input (it is `inert`: its Japanese words are not
  focus or word-help targets), announced once per action (`role=status`). The word strip of a
  response is inert too.
- Reading-critical moves are named neutrally: a lie is "A promise", a mirror is "Your words,
  echoed" (§13.3).

## Intent badges and the inspector (`src/ui/82c_battle_intents.js`, §13)

- One badge per standing creature, at its resting place in the formation (it never chases a
  lunge), with the move's symbol, the strength the telegraph already states, and an instance mark
  (A, B, C in formation order) where names repeat. The slip, the badge, the telegraph panel, the
  response cards' targets and the banner carry the same mark.
- 44 × 44 px targets; neighbours that would overlap are pushed apart; when a row cannot fit they
  line up as a rail along the top of the scene. With no scene to sit in (a stage squeezed under
  60 px) the badges stand down and the slips carry the moves.
- Pointer resting 200 ms → preview; keyboard focus → preview; press → pinned (one at a time;
  another badge switches; the same badge again closes). Close button and Escape close it; the
  pointer may move into a preview; a keyword note or word help opened from inside it does not
  close it. A press on a badge never targets, chooses or hurries anything.
- The card shows what the telegraph reveals: symbol, name, stated strength, the creature's
  Japanese line (with readings), the English only when it is already shown, and what the move does.
  How to answer it is a note the player opens. Reading-critical moves (lie, mirror, plea; an authored
  table, `READING` in `80_combat.js`) say only "It is telling you something. Read what it says." /
  "It is asking you something."
- The card stays inside the scene's column, above the party slip, and scrolls inside itself when
  room is short.
- Committed: the card closes; the badges go quiet and inert, keep the moves as committed (never
  the next exchange's), mark the creature acting, mark a move your response answered once that
  response has played, and drop a creature that settles.

## Menus, input ownership and focus (§14.1, §14.5, §14.6)

- The menus withdraw on commitment (after the language task and the companion's choice), stay
  away through every action of the exchange, and return once. They are `inert` while away (no
  pointer, no keyboard, no focus); focus inside them moves to Skip (Normal/Fast) or the overlay.
- Skip (in the scene's corner while an exchange plays) settles the rest of the exchange: every
  committed result once, in order; the banner cleared; transient effects dropped. It accepts only a
  fresh press (≥ 150 ms after it appears).
- On return, focus goes to the response chosen last time if it is still offered, otherwise to the
  first response that can be chosen. A press that began before the menu opened — the click or the
  held Enter / Space that submitted the answer, a key repeating across the exchange — chooses
  nothing, nor does the second click of a double click that opened it (Instant brings the menu back
  at once); a fresh press does. The companion's menu keeps its 250 ms guard.

## Permanent status (§16)

- The party slip (Resolve per adventurer, Harmony with a companion) stays visible and uncovered in
  every battle state; on the language sheet an explicit status inset carries the same numbers.
- Portrait phones: the dock sits above the party slip so withdrawing it opens one continuous scene;
  the slip is pinned at the bottom if the overlay scrolls. At large text (≥ 140 %, `html.text-large`)
  the dock takes the height its content needs and the overlay scrolls, so the companion's queued note
  never squeezes the support cards.
- On phones, keyword help and word help open as sheets that rise from the top of the party slip
  (not from the bottom of the screen), so Resolve and Harmony stay in view; on the language sheet the
  status inset carries them.

## Tests

| What | Where |
|---|---|
| Banner: hidden in decision, language and support states and in gaps; blue/red with actor and name; companion support; technique (one banner); finishing response leaves before the settling; never-run creature move; hidden tab; tokens; after the encounter | `tests/e2e/battle_presentation.mjs` |
| Normal / Fast / Instant; Text speed independence; Skip | `tests/e2e/battle_presentation.mjs` |
| Intent badges: per-creature, marks, 44 px, no overlap, hover delay, preview kept while inside, press pins without targeting, switch, Escape and focus return, keyboard focus, Close, quiet and inert while acting, acting mark; three viewports | `tests/e2e/battle_presentation.mjs` |
| Reading-critical wording visible and neutrally named; Expanded; settled creature loses its badge; one creature | `tests/e2e/battle_presentation.mjs` |
| Held Enter cannot choose in the next menu; focus return; fresh press chooses | `tests/e2e/battle_presentation.mjs` |
| Withdrawn / Keep-visible controls unreachable by Tab and pointer; Resolve and Harmony visible in every frame (party slip uncovered, or the inset on the language sheet) | `tests/e2e/battle_presentation.mjs` |
| Geometry at the eight §22.2 viewports (canvas, stage, occluders, union of covered area, decision-safe and action-safe rectangles, status, banner, actor coverage) | `tests/e2e/battle_geometry.mjs` → `tests/e2e/out/battle_geometry.json` |
| Rules unchanged by any presentation setting (540 configurations + pet variations) | `tests/e2e/battle_invariance.mjs` → `tests/e2e/out/battle_invariance.json` |
| Delivery seam, posed frames | `tests/unit/battle_seams.test.mjs` |
| Repairs RBN-01, -02, -04, -05, -07 | `tests/e2e/playtest_repairs.mjs`; the ledger is `docs/battle/LEDGER.md` |
| Generated "write the word" prompts name their script (RBN-02 beyond the recall step) | `tests/unit/script_prompts.test.mjs` |
| 20 battle entries and exits: no battle-only element left, listeners and DOM nodes stable | `tests/e2e/battle_cycle.mjs` → `tests/e2e/out/battle_cycle.json` |
