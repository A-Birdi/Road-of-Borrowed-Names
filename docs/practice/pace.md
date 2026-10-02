# Fishing pace — the optional response-entry clock

Practice addendum (*Roadside Practice, A Quiet Cast, and Companion Shiritori*, v1.0) §7
in full, with §1.3 (the fishing timing exception), §4.1/§4.3 (pace facts kept apart),
§20.3 (fishing pace settings), §21 (pace records and limits), §23.2 (first two
invariants), §23.3 (timing and calibration tests) and §26.1 (the worked example).
Shared rules: `docs/PRACTICE_CONTRACTS.md`.

| File | What it holds |
|---|---|
| `src/engine/76_pace.js` | `RB.paceCore`: the clock, buckets, authored complexity, nearest-rank percentiles, presets, calibration state, exclusions, records, diagnostics, summary. No DOM. |
| `src/ui/69_pace.js` | `RB.pace`: `attempt()` (replaces the provisional stub, same contract), the Pace bar and slack line, Ready, Pause, the pause/expiry sheet, the Pace control for the preparation sheet, developer tooling. |
| `src/styles/75_pace.css` | Bar, Ready card, sheet, pad repair row, Pace control. |
| `tests/unit/pace_clock.test.mjs`, `pace_calibration.test.mjs`, `pace_noclock.test.mjs` | Fake monotonic clock; calibration math; no clock elsewhere. |
| `tests/e2e/pace.mjs` | Chromium, built `index.html`, a generic paced step. Captures: `--shots`. |
| `docs/screenshots/pace/` | WebP captures from `node tests/e2e/pace.mjs --shots`. |

## 1. For the fishing integration

Call `RB.pace.attempt` for **every** response entry, Off included. It runs the step
through `RB.challenge.runStep` with `noRecord: true` and your options, times it only if a
pace applies, writes the separate timing record, and returns the runStep result plus
`paced`.

```js
const st = RB.practice.settings(s);
const res = await RB.pace.attempt(step, {
  pace: st.fishingPace,            // 'off' | 'gentle' | 'brisk' | 'custom' (per campaign; default 'off')
  budgetSec: st.fishingCustomSec,  // used only for 'custom' (5–180); unset → this answer is untimed
  header: situationHtml,           // shown above the task, as runStep's header
  ctxTag: 'fishing',
  taskId: 'C02/' + profile,        // stored in the timing record (fallback: step.id, then ctxTag:item)
  representation: undefined,       // optional 'kana' | 'mixed' default before Ready (the player can change it)
  session,                         // the RB.activity session: nothing is written once !session.alive()
  runOpts: { cancelLabel: 'Leave this cast', continueLabel: 'Land it' },
});
if (res.cancelled) { /* stepped away, or Let it go (res.paced.letGo): not observed, nothing consumed */ }
// ordinary mastery: never from a timed attempt (§4.3)
objectives.assess(objId, step.item, res, { paced: res.paced.timed });
```

`res.paced`:

| Field | Meaning |
|---|---|
| `kind` | The selected pace (`off`/`gentle`/`brisk`/`custom`). |
| `clock` | `none` (untimed, no Ready), `measure` (untimed, measured from Ready, a possible calibration sample) or `timed` (a deadline ran). |
| `timed` | A deadline existed at Ready. Pass it as `paced` to the learning adapter. |
| `budgetMs`, `activeMs` | Budget (timed only); accumulated active entry time to the end (paused time excluded; measured on after an untimed conversion). |
| `expired`, `onTime` | Soft expiry happened; the final submission was stamped before the deadline (`null` when untimed). |
| `convertedToUntimed`, `convertedAtMs` | `player`, `expired`, `content-correction`, `answer-shown`, `input-changed`, `representation-changed`, `device-changed`, `settings-changed`, or `null`. |
| `pauseReasons` | `{ reason: times }`: `help`, `modal`, `hidden`, `blur`, `pause`, `candidate-review`, `recognition-repair`, `layout`, `pointer-cancel`, `processing`, `evaluating`. |
| `inputMode`, `pointerClass`, `representation`, `bucket`, `layout` | Input actually used; `mouse`/`touch`/`pen`/`key`; `kana`/`mixed`/`select`; calibration bucket; pad layout class. |
| `recognitionRepair`, `assistance` | Any repair; help used (`word-help`, `translation`, `answer-shown`, `stroke-model`, `chart`, `other-candidate`). |
| `submittedResult` | `correct`, `correct-after-correction`, `revealed`, `let-go`, `stepped-away`, `unresolved`. |
| `letGo`, `sample`, `excluded`, `note` | Let it go at expiry; became a calibration sample; why not; why a chosen pace did not apply (`too-long`, `unknown`, `layout`, `over-180`, `custom-unset`). |

Other calls:

- `RB.pace.budgets(s, ctx)` → `{ gentle, brisk, samples, needed: 12, reason, key, B, proposed, accepted, label }`.
  `ctx`: `{ key }`, or `{ step, inputMode, pointerClass, representation, layout }`. `reason`:
  `collecting`, `proposal` (12+ samples, offered at the next Ready), `ok` (accepted, fixed),
  `layout`, `too-long`, `unknown`.
- `RB.pace.available(s, ctx)` → true unless `ctx.step` is too long to time (Custom is always selectable otherwise).
- `RB.pace.summary(s)` → at most one line, e.g. "Three responses completed at your chosen pace." (or `''`).
- `RB.pace.settingsChanged()` → a cast being timed becomes untimed (a budget changed mid-cast, §7.4).
- `RB.pace.current()` → live snapshot (tests and diagnostics).

### The Pace control for the preparation sheet

```js
box.innerHTML = RB.pace.setupHtml(s);                       // <fieldset class="pace-setup"> labelled "Pace"
RB.pace.wireSetup(box, s, { onChange: (settings) => redraw(settings) });
// or a standalone sheet with the same control:
await RB.pace.openSetup(s);                                 // resolves with RB.practice.settings(s) on Done
```

It offers Off — A Quiet Cast (checked for a new campaign), Gentle — A Little Current, Brisk
— A Quick Current, Custom (number field, −5/+5 buttons, kept within 5–180 in one-second
steps), the calibration status per bucket, *Measure my untimed answers while pace is Off*
(per campaign, `fishingPaceMeasure`, default off), *Show seconds beside the line* (the
device setting `RB.game.settings.fishSeconds`), and Recalibrate (with a confirmation). It
writes `fishingPace`, `fishingCustomSec`, `fishingPaceMeasure` through `RB.practice.set`.

## 2. The timing model (§7.2, §7.3)

- **Off** (and any answer a pace cannot time): no bar, no Ready. The task and input appear
  at once; an untimed clock (no deadline, no consent holds) measures active entry from the
  moment the input is ready, for the record only.
- **Timed or measuring:** the task slip is readable and the input method tabs work; the
  answer area is replaced by the Ready card (budget, *How you will write it: Kana /
  Supported mixed-kanji writing* when both are accepted, Ready, *Answer untimed instead*).
  The representation choice never shows the answer. Ready focuses the input, then waits
  for two animation frames and a stable visual viewport (software keyboard), at most
  700 ms, before `start()`; an entry action during that wait starts it at once.
- **Clock:** accumulated monotonic active time (`performance.now()`, injectable `now()`).
  Never `Date.now()` subtraction, never frame counting. Deadline: `activeEntryMs >= budgetMs`,
  checked by a timeout set for the exact remaining time, by the meter (200 ms; 1 s with
  reduced motion) and at every submission.
- **Pause reasons nest** (counted). Environment: `help` (a word-help card exists), `modal`
  (any layer above the challenge: the chart, a confirmation), `hidden`
  (`visibilityState`), `blur` (window). Player states: `pause`, `candidate-review`,
  `recognition-repair`. Events: `layout` (window width change, or height change without a
  focused text field; orientation change), `pointer-cancel` (pad `pointercancel`, or capture
  lost mid-stroke — a normal release is not one). Processing: `processing` (the
  recognizer's synchronous, input-blocking work) and `evaluating` (after a submission).
- **Consent:** every user-visible pause of a timed attempt leaves a hold. Only Continue
  (bar or sheet), or *Confirm character & continue* on the pad, resumes; returning from
  help, another window or a background tab never does. Continue while an environment
  reason still holds (tab hidden) keeps the hold. Processing-only exclusions restore the
  run silently and are subtracted once (no overlap with an open pause).
- **What is shown:** the bar "Pace · Gentle · 27 s" with a slack line (taut at Ready,
  sagging as the window runs out; dashed while stopped), the state in words ("Running",
  "Paused: word help is open"), optional seconds (`fishSeconds`; otherwise read to screen
  readers only), Pause, Continue, Untimed. A full sheet over the task for an explicit
  pause, a background tab, focus loss, resize or pointer cancellation; no sheet while help
  or a modal is up, nor during pad review/repair (the pad stays usable).
- **Recognition repair:** the pad has a fixed row with *That is not what I wrote* (enabled
  whenever it shows a reading, confident or not); tapping another candidate is candidate
  review. Both stop the clock; *Confirm character & continue* inserts and resumes in one
  press. An uncertain submission ("I could not read that clearly") stops it too. After a
  wrong handwritten answer, the feedback offers *That is not what I wrote*: the mistake is
  uncounted (`mistakes`, `firstTry` restored, `recogMisses` +1), and if no genuine content
  error remains the timed window comes back, stopped for repair. Intermediate unsure reads
  while a character is still being written do **not** stop the clock (they would make
  every later stroke untimed).
- **Content error** (confirmed wrong answer): explanation, and the same catch continues
  untimed (`content-correction`); the draft is kept (ordinary challenges still clear the
  pad as before).
- **Soft expiry:** the pace freezes; a stroke or IME composition in progress finishes
  first (the bar says so), then the sheet: **The line is loosening. Continue at your own
  pace, or let this one go.** — *Continue untimed* / *Let it go*. The draft stays; Back on
  the sheet means Continue untimed; nothing is submitted. The attempt stays `expired`. No
  hard escape exists.
- **Submission order:** `submit()` stamps the active time before evaluation; on time if
  below the budget, whatever evaluation or rendering does later.
- **Untimed at any time:** Untimed (bar), *Finish untimed* (sheet), *Answer untimed
  instead* (Ready card). Switching input mode, writing kanji after choosing Kana, a
  different pointer class for strokes, the answer shown, or a settings change also make the
  cast untimed. Draft and fish are kept.

## 3. Calibration (§7.4)

**Buckets** (finite: 70). Handwriting: pointer `mouse`/`touch`/`pen` × kana `l1 l2 l3`
(1–2, 3–4, 5–8 kana-equivalent units) and × mixed-kanji `l1–l3` × reference strokes
`s1 s2 s3` (1–8, 9–20, 21–40) = 36. Typing (IME): kana/mixed × `l1–l3` = 6. Selection
("selection pace"): pointer `mouse`/`touch`/`pen`/`key` × reading choices `o2-4`/`o5-8`,
choosing a written answer `o2-4`/`o5-8`, arranging `l1–l3` pieces = 28.

**Authored complexity.** From the step's accepted forms (`step.accept`, else `answer`),
per representation: kana forms (kana-only forms, plus the reading of a kanji form unless
the check is `exact`) and mixed forms (units = the markup reading, or each kanji's own
reading; strokes = KanjiVG reference counts summed over the form). The bucket is that of
the **longest accepted short variant** (≤ 8 units and ≤ 40 strokes); if every variant is
longer, the answer is untimed in this release; if units or strokes cannot be known, Gentle
and Brisk do not apply (Off or Custom). An author can give `step.pace = { kana: { units },
mixed: { units, strokes } }`.

**Pointer class** is the last pointer seen in the attempt, else a coarse-pointer guess. If
Ready is pressed with another class and that changes the plan, the card re-plans and asks
for Ready again (no budget runs that the player has not seen). Strokes with another class
make a timed cast untimed. No hardware fingerprinting; nothing compares people.

**Samples.** Only a `measure` attempt (Gentle/Brisk not yet prepared for the bucket, or Off
with measuring on) from Ready to a correct final commit, with none of: recognition repair,
candidate review, answer shown, stroke model, chart pick, content correction, input or
device or representation change, pointer cancellation, layout change, conversion
(`RB.paceCore.exclusions`). The sample goes to the bucket actually used. The latest 24 per
bucket are kept.

**Math.** `B` = nearest-rank p75: sort ascending, rank = ⌈0.75 × N⌉ (1-based). With
`B` in whole milliseconds, integer arithmetic gives exactly
`Gentle = ⌈1.80 × B + 5⌉ = ⌈(18·Bms + 50000) / 10000⌉` and
`Brisk = ⌈1.25 × B + 3⌉ = ⌈(125·Bms + 300000) / 100000⌉` seconds (no float overshoot:
B = 15 s gives 32, not 33). B = 12 s → 27 / 18. Over 180 s: reported, never clamped
tighter; that pace is not offered (Off or Custom).

**Lifecycle.** 0–11 samples: `collecting` — a Gentle/Brisk cast is untimed and measured.
12+: `proposal` — the Ready card offers "Gentle is ready … 22 seconds, from 12 of your
untimed answers"; pressing Ready accepts it (`acc` stored with B, both budgets, n, the pad
layout class). Accepted budgets stay fixed: new samples cannot tighten them; only
Recalibrate (sets the bucket's samples and budgets aside) or Custom changes them. Another
pad layout class (`S` < 600 px wide, `L` ≥ 900×560, else `M`) makes the accepted preset
inapplicable (`layout`), without deleting samples. A different pointer class or
representation is a different bucket.

## 4. Records (§7.5, §21)

`s.practice.fishing.recentAttempts` (latest 50): `n, at, taskId, profile, paceKind,
clock, budgetMs, activeMs, expired, onTime, convertedToUntimed, pauseReasons, inputMode,
pointerClass, representationClass, bucket, layout, assistance, recognitionRepair,
submittedResult, sample, excluded`. No strokes, no answer text.
`s.practice.fishing.calibration = { v: 1, n, buckets: { key: { s: [ms ×≤24], acc } } }`,
validated on read. Records are written only while `session.alive()` and the same
campaign is loaded. Nothing here calls `RB.learn.record`; `attempt()` forces
`noRecord: true`; a timeout, abandon or repair is never an `ok:false`. No rankings, no
fastest writer, no "level"; the optional summary counts on-time responses only.

## 5. Measurement tooling and the human pilot (§7.6)

**No human data exists.** No person has used this pace; every number in §7 remains a
tuning hypothesis.

Developer tooling (local only, no upload, consent first): in the browser console on the
pilot device, `RB.pace.dev.open()` shows the campaign's comparable buckets (n, p50, p75,
p90, offered/kept budgets), expiry by pace (expired / completed timed attempts; leaving
early counted apart) and every excluded sample with its reasons. The facilitator ticks
*The player has agreed to keep pilot timing records on this device*; then each fishing
response record (the same fields, plus the optional 1–5 answer to "Did this feel
comfortable enough to repeat?" after a timed one) is also kept in `localStorage`
(`rb.pace.pilot.v1`, latest 2000). *Print to console* (`RB.pace.dev.print()`) prints all of
it as JSON for the facilitator to copy by hand; *Delete pilot capture* removes it.

Pilot plan, as the addendum sets it: 4–8 consenting players on their own input setups.
First untimed (Off, *Measure my untimed answers* on): at least 24 comfortable responses
per tested setup. Then, only with consent, up to 12 Gentle and 12 Brisk responses.
Rotate comparable prompt sets and the condition order; never repeat the exact same answer
and call the faster result a benefit. Report participant counts, input methods, prompts,
exclusions (from the tooling), p50/p75/p90 per bucket with sample counts, expiry rate
(Gentle ≤ 10 %, Brisk ≈ 10–30 % are provisional targets, not learner verdicts),
whole-response repair rate (prototype target ≤ 10 %), lost-input incidents (target 0),
misattributed mistakes (target 0) and comfort (median; aim ≥ 4 for Gentle). If targets are
missed, adjust the activity or recommend Off; never bias recognition or drop trials.

## 6. Coverage

Evidence: **U** unit test (node, fake clock), **B** browser test (`tests/e2e/pace.mjs`,
Chromium, built `index.html`), **S** simulated in the browser (named), **I** inspection.

| Requirement | Where | Evidence |
|---|---|---|
| §1.3 only a player-selected fishing response entry is timed, after Ready | `attempt` is the only clock creator | U `pace_noclock`; B "ordinary challenges have no clock" |
| §7.1 Off default for every campaign; Gentle/Brisk/Custom 5–180 s; no fake fixed fallback; nothing auto-enabled or tightened | `planFor`, `setupHtml` | U (defaults, 0/11 samples), B (Off test, setup keyboard 200→180, −5) |
| §7.1 labelled Pace, explained, optional numeric seconds | bar, Ready card, setup | B (bar text), I (captures) |
| §7.2 Ready after render, focus and settled transitions; reading untimed | `ready`, `settleThen` | B (no clock before Ready, focus on input) |
| §7.2 accumulated monotonic active duration | `clock()` | U |
| §7.2 help, pinned help, explicit pause, modal | `syncEnv`, Pause | B (word help, kanji chart, Pause) |
| §7.2 recognizer processing once, candidate review, repair | pad `busy`, `review` | U (processing inside help not doubled), B (processing ≥ 3, review, repair) |
| §7.2 hidden, blur | listeners | U; S (visibilityState override, window blur event) |
| §7.2 pointer cancellation vs normal release; lost capture | pad `stroke` | B (real mouse stroke; synthetic `pointercancel`, `lostpointercapture`) |
| §7.2 layout/orientation change | `onResize` | U; B (`setViewportSize`) |
| §7.2 explicit continuation; Confirm character & continue | `resume`, `confirmed` | U; B |
| §7.2 convert to untimed, keeping draft and fish | `untimed` | B |
| §7.2 IME composition is entry time, never cut off | `composing` | B (real CDP `Input.imeSetComposition`) |
| §7.3 soft expiry, exact message, Continue untimed / Let it go, marked expired | sheet | U (boundary), B |
| §7.3 stroke/composition in progress finishes | `pendingExpiry` | B |
| §7.3 submission before deadline on time; evaluation after | `submit()` | U |
| §7.4 buckets, representation choice before Ready, longest short variant, > 8 / > 40 untimed | core | U; B (Kana/mixed keys) |
| §7.4 12 samples, latest 24, p75 nearest rank, presets, > 180 | core | U (0/11/12/24, known arrays, outliers, 365/253) |
| §7.4 fixed until Recalibrate; layout/device/representation applicability | `accept`, `budgets` | U; B (offer accepted, later samples ignored, keyboard bucket) |
| §7.4 exclusions explained in diagnostics | `exclusions`, `diagnostics` | U; B (panel) |
| §7.5 separate records, no rankings, small summary | `record`, `summary` | U; B |
| §4.1/§4.3 pace facts apart; no mastery from paced attempts | `noRecord`, `paced` | U; B (`learn.items` untouched) |
| §6.4 uncertain recognition stops; misread not an error; content error untimed | hooks | B |
| §20.2 44 px, keyboard/mouse/touch, 320×640 / 390×844 / 844×390 / 1280×800, 200 % text, reduced motion | CSS | B (no overflow, targets ≥ 44 px, Tab/Enter, transition 0 s) |
| §20.3 fishing pace saved per campaign, seconds display Off by default | `RB.practice` settings | U |
| §21.3 50 attempts, 24 per bucket, finite buckets | core | U |
| §21.6, §23.2 no network; pilot capture local, consented, deletable | `dev` | B (no request) |
| §23.2 no clock elsewhere; none by default | | U (source scan, defaults), B (clock counter unchanged) |
| §26.1 a quiet catch with Gentle: repair stops it, Continue resumes, expiry, untimed landing, no timeout mistake | | B (repair test + flow test; generic step, not the fishing scene) |
| §7.6 human pilot | | **Not run: no human data** |

## 7. Commands and results (this branch, Chromium headless, shared Linux container)

| Command | Result |
|---|---|
| `node tools/build.mjs` | built `index.html` — 230 source files, 6852.7 KiB |
| `node tests/run-unit.mjs` | 6521 passed, 0 failed (pace: 134 checks in three files) |
| `node tools/validate.mjs` | no errors (lexicon-conflict warnings unchanged) |
| `node tests/e2e/pace.mjs --shots` | 13 passed, 0 failed on the final build at load average ≈ 25 (also 13/13 on the two builds before it; the first run, 11/12, exposed a test bug — a mouse click on a touch-planned Ready correctly re-plans — and a real layout bug, fixed: the short-landscape writing sheet was pinned, hiding Ready) |
| `node tests/e2e/learning_ui.mjs` | 14 passed, 0 failed |
| `node tests/e2e/pad_kanji.mjs` | 8 passed, 0 failed |
| `node tests/e2e/combat_ui.mjs` | 7 passed, 0 failed |
| `node tests/e2e/fieldweave.mjs` | 89/89 checks passed |
| `node tests/e2e/kanji_chart.mjs` | 7 passed, 1 failed (three runs): the recognizer speed check (p95 113–125 ms against a 50 ms target) at load average ≈ 19–22 from other workers; the **base commit c86d615 fails the same check under the same load** (median 48 ms, p95 166 ms). A kana-read check failed once in the first run and passed on both reruns. Neither involves pace code (ordinary pads have no hooks). Not rerun on a quiet machine. |
| `node tests/e2e/run.mjs` (full default suite) | **not run** (whole-game runs; hours on this loaded machine) |

Bundle: base 6,923,624 B raw / 2,166,457 B gzip −9; this branch 7,017,209 / 2,192,843
(+93.6 kB raw, +26.4 kB gzip).

Captures (`docs/screenshots/pace/`, WebP, real renders of the built game with a synthetic
campaign; static images cannot show the line's motion): `gate_1280` (Ready card, Custom,
representation choice), `running_1280`, `help_paused_1280` (word help open), `paused_1280`
(after help: Continue), `expiry_1280` (the soft-expiry sheet), `repair_1280` (*That is not
what I wrote*, *Confirm character & continue*), `measure_gate_1280` (Gentle being
prepared), `offer_gate_1280` (Gentle offered at 22 s), `running_390x844`,
`gate_320x640_200`, `paused_320x640_200`, `setup_390x844`, `setup_320x640_200` (the Pace
control), `dev_1280` (developer diagnostics).

## 8. Limitations and decisions

- Interpretation: "longest accepted short variant" = the longest variant that is itself
  timeable (≤ 8 units, ≤ 40 strokes); a longer optional variant does not make a short
  answer untimed.
- Off answers are measured from the moment the input is ready (record only). They become
  calibration samples only with *Measure my untimed answers* (which adds Ready), because
  reading time would otherwise make them incomparable with Ready-started answers.
- Preparing Gentle/Brisk happens by choosing them: until 12 samples exist those casts are
  untimed and measured. The first timed use is the player's own Ready on the offered
  budget; nothing is switched on by itself.
- Pause during untimed measuring never asks for Continue; the next entry action ends it.
- Recalibrate sets the samples aside (deletes them) as well as the budgets.
- "Substantial pad layout" is approximated by the challenge's three layout classes.
- A hidden tab and window blur are simulated in the browser tests (headless Chromium
  cannot hide a page); pointer cancellation and lost capture use synthetic PointerEvents.
  IME composition uses Chromium's real composition path via CDP. Firefox, Safari, real
  touch/pen hardware and real software keyboards were not tested.
- Tested with a generic authored step, not the fishing scene (owned by the fishing
  worker); the integration example above is unexercised until fishing calls it.
- `index.html` is not committed on this branch; rebuild after merging.
- No human pilot, no native-speaker review of any text, no accuracy claim.

## 9. Merge notes (shared files touched)

All hooks are guarded (`if (PH)`) and inert without a pace attempt;
`tests/unit/pace_noclock.test.mjs` checks this and the e2e test runs ordinary challenges.

- `src/ui/65_challenge.js` (runStep only):
  `const PH = opts.pace || null;` · pad gets `pace: PH`, `onChange` → `PH.draft()`,
  `onAssist` → `PH.assist(why)` · translate → `PH.assist('translation')` · `showMode` end →
  `PH.modeShown(m, how)` · `setHint` uses `PH.hint(mode)` first · `success` →
  `PH.outcome('ok')` · `evaluate` start → `PH.submit(modeUsed)`; unsure →
  `PH.outcome('unsure')`; wrong → `PH.outcome('wrong')`, and in a pace attempt with
  handwriting the draft is kept and *That is not what I wrote* is offered (`firstBefore`
  restores `firstTry`); ordinary challenges still `pad.reset()` · `evaluateChoice` /
  `evaluateOrder` → `PH.submit(...)` and `PH.outcome('wrong')` · `revealAnswer` →
  `PH.assist('reveal')` · `finish` start → `PH.finish(cancelled, res)` · `layer.onAction`
  first → `PH.onAction(a, e)` · after `pushLayer` → `PH.mount({ wrap, frame, body, sheet,
  answer, layer, step, mode, pad, ime, finish, setHint })`.
- `src/ui/60_pad.js` (`RB.pad.create`): `const PH = opts.pace || null;` · the
  `.pad-repair` row (*That is not what I wrote*) only when `PH` · `PH.stroke('down'|'up'|
  'cancel'|'lost', e)` in the pointer lifecycle (`end(e, cancelled, lost)`; lost capture
  passes `lost`) · `PH.busy(true/false)` around `RB.recog.recognize` · candidate tap →
  `PH.review('candidate')` · `renderRead` sets the Confirm label (*Confirm character &
  continue* while `PH.reviewing()`) and the repair button state · `confirm` →
  `PH.confirmed()` · `notwrote` action → `PH.review('repair')` · new API
  `strokeActive()`.
- `tests/e2e/run.mjs`: one line, `['pace.mjs'],`.
- Not touched: `src/ui/10_ui.js` (help cards and layers are observed with a
  MutationObserver on `#overlay` and `#ui`, and `RB.ui.topLayer()`),
  `src/engine/10_input.js`, `src/engine/08_practice.js` (`fishingPaceMeasure` is stored
  through `RB.practice.set`; the existing `fishingPace`/`fishingCustomSec` defaults are
  used), `src/ui/68_practice_index.js` (its `fishSeconds` switch is mirrored in the Pace
  control).
