# Harmony plan — cut-in timeline and the four coordinated performances

For the owner's addendum of 2026-10-03 (Harmony Cut-Ins, Expressive Characters, and Illustrated
Storytelling) §5–§10. Module boundaries and the cut-in lifecycle are in CONTRACT.md §3.1–§3.3; this file
is the timing and choreography plan. Every "current" number below was computed from the source at
`20277f1` by calling `RB.battleSeq.choreo.player()` in node on synthetic technique fx (single creature,
3 knots, no slip cost unless stated) — not measured in a browser.

## 1. What exists now

### 1.1 The rules (unchanged by this work)

`src/engine/95_combat.js`:

| Companion | `TECHS[id]` | Knots (`techUnravel`) | `applyTech()` effects | Group (`TECHS[id].group`, `reachOf`) |
|---|---|---|---|---|
| Nao | **Read the Opening** — "Nao reads where it is about to move: frees 2 knots at once." | 2 on the target | fx `{ t: 'tech', who: 'nao', foe: T }` | "In a group it is aimed: all of it lands on the one you target." `reachOf` foes = `[T]` |
| Mio | **Clearwater Draught** — "Restores you both to full resolve, washes away Heat, mist and Gathering, and frees 1 knot." | 1 | `st.pc = st.comp = st.max`; for the target **and every other standing creature**: `heat = 0`, `shroud = false`, `charged = false`; fx `{ t: 'tech', who: 'mio', foe: T, all: others > 0 }` | "the Heat, mist and Gathering on every creature are washed away." allies `['pc','comp']`, foes all |
| Ren | **Lantern Ward** — "Raises a 3-point ward in front of each of you and frees 1 knot." | 1 | `st.ward.pc += 3; st.ward.comp += 3`; fx `{ t: 'tech', who: 'ren', foe: T }` | "the wards stand against every creature's blows." (a ward is an amount used up by blows, not a lasting barrier) |
| Suzu | **Curtain Call** — "Its own move turns back on it: frees 2 knots at once." | 2 on the target | fx `{ t: 'tech', who: 'suzu', foe: T, all }`; in a group every other standing creature is `answered` (its move turns back) and loses 1 knot: fx `{ t: 'unravel', n: 1, foe: i, by: 'suzu' }` each | "every creature's move turns back on it: none of them lands, and each of the others loses a knot too." foes all |

Common to all four (`playerAct()`): the target's knots drop by the technique's count (fx `unravel` first),
the target's telegraphed move is answered (cancelled), Harmony returns to 0, and the technique adds no
Harmony. With a technique queued, the companion's menu offers only "Join the technique" (`compOptions`
→ `'join'`), and no `compAct` runs — there is no separate support turn. Mistakes cost 1 resolve outside
Assisted (fx `cost`, shown first). **Found, for the lead:** `responses()` offers the technique whenever
`st.compId` is set and Harmony is full, also while the companion's resolve is 0; the current choreography
then animates the companion's gesture from their down pose. This is a rules question (§7.1: "handled by
the existing rules"), not something the cut-in should decide; until it is decided the cut-in follows the
rules and shows the committed companion.

### 1.2 The current choreography and durations (Normal, presentation ms)

From `src/ui/84p_party_choreo.js` `TECH` and `player()` (anticipate 200 ms / act 520 ms for the companion,
220 / 540 for the player; recovery 380 ms; beats 150 ms apart from `contact`):

| | Nao — Read the Opening | Mio — Clearwater Draught | Ren — Lantern Ward | Suzu — Curtain Call |
|---|---|---|---|---|
| companion gesture | `point` (BY.nao): anticipate 0–200 (fist drawn back, pitched forward), act 200–720 (arm straight out, finger pointing); recover 1,420–1,800 | `pour` (BY.mio): anticipate 220–420, act 420–940 (vial from the hip, cork drawn, tipped toward you); recover 1,420–1,800 | `ward` (BY.ren): anticipate 0–200 (lamp brought before, right hand flat), act 200–720 (lamp held out, right hand traces the seal); recover 1,420–1,800 | `flourish` (BY.suzu): anticipate 0–200 (arm drawn across, turn of the torso), act 200–720 (unwinding sweep out and up, fingers spread); recover 1,440–1,820 |
| player gesture | `thread` 260–1,020 (strip lifted, thread drawn back); recover 1,360–1,740 | `restore` 0–760 (folio open, hand gathers, rises and opens); recover 1,360–1,740 | `ward` 200–960 (forearm across, closing stroke, palm set); recover 1,360–1,740 | `thread` 300–1,060; recover 1,380–1,760 |
| release points (`RB.battlerMoves.release`) | companion 0.25 → 330 ms; player 0.40 → 696 ms | companion 0.50 → 680; player 0.35 → 409 | companion 0.40 → 408; player 0.42 → 647 | companion 0.45 → 434; player 0.40 → 736 |
| carriers (`arrive()`) | `pSpot` from Nao 330; `pJoin` braid 370; `pThread` 696 to the top knot; `link` 780 | `pJoin` 449; `pPour` into you 680; `link` 780 | `pJoin` 448; `pLamp` over both 408; `link` 720 | `pJoin` 474; `pAttention` (lines from the creatures to Suzu) 434; `pThread` 736; `link` 800 |
| word strip | 320–1,760 | 160–1,600 | 240–1,680 | 340–1,780 |
| results (`beat` cues) | `unravel` 980 (two `knotRelease` 980, 1,070; `loosen`), `tech` 1,130 (`pSpot` done) | `unravel` 980, `tech` 1,130 (`motes` on both, `soothed` poses 1,170, `pSteam` wash 1,190 on the target — every creature in a group; numbers from the real delta only, via `healThen`) | `unravel` 920, `tech` 1,070 (`sealForm` you 1,070, companion 1,150) | `unravel` 1,000 (two `knotRelease`), `tech` 1,150 (`fizzle` on the target; others +90 ms in a group), group: `unravel` 1,300 and 1,450 on the others |
| **end** (`P.end`) | **1,820** | **1,820** | **1,800** | **1,840** |
| Fast (wall, ÷1.43) | 1,273 | 1,273 | 1,259 | 1,287 |
| reduced motion | 1,820 (one held `act` pose each) | 2,070 (numbers held until gone) | 1,800 | 1,840 |
| with a slip cost | 2,140 | 2,140 | 2,120 | 2,160 |
| group of three | 1,820 | 1,820 | 1,800 | 1,840 (four beats end at 1,450) |

The banner shows "<player> & <companion> — <technique>" from the sequence's first frame to
`P.end − 120` (Fast: −80) (`82_battle_seq.js` `bannerOff`). A winning technique appends `choreo.finish`
at `P.end − 360` (+640 ms). Distinctness today: the player's gesture is `thread` for Nao and Suzu and
`ward` for Ren, and Ren's own gesture is also named `ward` — so with particles off, Nao's and Suzu's
pairings differ only by the companion's arm path, and Ren's pairing shows the same closing stroke twice.

## 2. Principles for the new performance

- One technique, one coordinated action, **one** portrait cue at the technique's own start (§7.1). No
  extra sequence, no extra support turn, no new beat: the rules' fx are placed once, in order (§20.1).
- The portrait is gone (opacity 0, layer removed) **before** the principal impact at every setting (§7.2,
  §23.1). Stage preparation overlaps the portrait's fade so the two read as one moment.
- The player always contributes a visible rally: grounded breath → gathering the writing hand → a
  coordinated arc → release on the companion's cue; start and recovery in the rear-three-quarter ready
  stance (§9.2). The terminal gesture differs per technique.
- Each companion gets three purposeful silhouettes — anticipation, signature, recovery — with the
  in-betweens to connect them; body mechanics must differ with particles and portrait off (§9.7).
- Stable ids select everything: technique = companion id; gestures are new ids in
  `RB.battlerMoves.BY[comp]` / `GEST`; nothing is chosen by translated text (§20.1).

## 3. The new timeline per playback setting

> **Robin's decision, 2026-10-05 (supersedes the portrait's numbers below):** Normal plays the proposed performance,
> in 220 / hold 820 / fade 360 ms (1,400), with a small motion (a 3 art px overshoot at the end of the slide, a 2.5 px
> lean as the peak lands, a 1.5 px drift through the fade); Fast plays what Normal played before, 180 / 380 / 220 ms of
> wall time (780; 257 / 543 / 315 presentation ms), no motion; Instant and the setting Off show nothing. The stage now
> **waits** for the portrait: when it can play, every other cue of the technique starts `max(0, portrait end + 120 −
> contact)` later (Normal: Nao 220, Mio 270, Ren 320, Suzu 240; Fast: Ren 35, the others 0), so the first result comes
> ≥ 120 ms after it is gone; both performers stand in their ready stance through the wait. Totals: Normal 2.57–2.69 s,
> Fast 1.63–1.71 s of wall time. A seventh portrait state, `cue_b`, sits between cue and peak. Details:
> docs/harmony/contract/CONTRACT.md §4; code: src/ui/82_battle_seq.js `T.cutin`, src/ui/82d_harmony_cutin.js,
> src/ui/84p_party_choreo.js `player()`. The tables below keep the plan as it was made; the stage's `TECH` times are
> unchanged and now count from the end of the wait.

### 3.1 Shared skeleton (Normal; presentation ms = wall ms)

| Interval | Cut-in (`RB.harmonyCutin`) | Stage (`RB.partyChoreo`) |
|---|---|---|
| 0–180 | **entering**: the pair slides in from beyond the left edge, ease-out (reduced motion: fades in, no travel) | player: breath and stance shift (`anticipate` of the rally); companion: first anticipation key |
| 180–560 | **holding**: one characteristic expression/gesture resolves once (Suzu's wink, Ren's lamplight lifting, Mio's hand settling on the bottle, Nao's pointing hand) — no loop | player gathers the writing hand; companion holds the anticipation |
| 560–780 | **fading**: whole composition and accents to 0 in place; layer removed at 0 → **disposed** | companion preparation develops (≈500–1,050) |
| ≈1,050–1,750 | — | coordinated release; first result beat (`contact`) ≈1,150–1,250; remaining beats 150 ms apart |
| ≈1,750–2,400 | — | recovery to the ready stance; results legible; `P.end` |

Proposed `TECH` values (all presentation ms; `pAt`/`gAt` start the companion's / player's gesture; the
anticipate/act lengths become per-technique fields instead of the fixed 200/520 and 220/540):

| | Nao | Mio | Ren | Suzu |
|---|---|---|---|---|
| player rally anticipation | 0–500 | 0–500 | 0–500 | 0–500 |
| companion anticipation (`pAt`, `pAnt`) | 500, 280 | 450, 300 | 480, 300 | 450, 300 (the twirl's wind-up) |
| companion signature (`pAct`, release) | 780–1,300, release ≈1,050 | 750–1,350, pour ≈1,100 | 780–1,330, plane set ≈1,100 | 750–1,350 (twirl 750–1,050, open-armed cue ≈1,100) |
| player release (`gAt`, `gAnt`, `gAct`) | 700, 300, 520 → ≈1,100 | 650, 300, 560 → ≈1,130 | 700, 300, 520 → ≈1,120 | 750, 280, 520 → ≈1,150 ("catches the opening") |
| `contact` (first beat: `unravel`) | 1,150 | 1,200 | 1,150 | 1,250 |
| `tech` beat | 1,300 | 1,350 | 1,300 | 1,400 (group: others 1,550, 1,700) |
| recovery (`rec`, `recD`) | 1,750, 450 | 1,800, 450 | 1,750, 450 | 1,850, 500 |
| `end` | **2,300** | **2,400** | **2,300** | **2,450** (group 2,650) |
| Fast wall (÷1.43) | 1,608 | 1,678 | 1,608 | 1,713 (group 1,853 — just above 1.8 s; acceptable for multi-target per §7.2 or trim the group spacing to 120 ms) |

### 3.2 Per setting

| Setting | Cut-in | Stage |
|---|---|---|
| **Normal** | in 180 / hold 380 / fade 220 (ends 780). **Since 2026-10-05:** in 220 / hold 820 / fade 360 (ends 1,400), with the small motion | §3.1; since 2026-10-05 after the wait (Nao 220, Mio 270, Ren 320, Suzu 240 ms): 2.57–2.69 s |
| **Fast** | `T.cutin.fast` = 143 / 315 / 229 presentation ms = **100 / 220 / 160 ms wall (480 ms)**; ends at 687 presentation ms, before every `contact` (≥1,150). **Since 2026-10-05:** 257 / 543 / 315 presentation ms = **180 / 380 / 220 ms wall (780)**, no motion; ends at 1,115 presentation ms | §3.1 values on the ×1.43 clock: 1.61–1.71 s per single-target technique (since 2026-10-05: 1.63–1.71 s; Ren waits 35 ms) |
| **Instant** | none (the sequencer settles at once; the `cutin` cue is in `fire1()`'s visual branch, skipped when `instant`) | none; the recap shows the result (unchanged) |
| **Reduced motion** | fade in 180 at the final position (no slide), hold the resolved pose (no wink animation — the held "knowing" key), fade out 220; full detail (since 2026-10-05 on the mode's segments: Normal 220 / 820 / 360; no motion) | three distinct held keys per performer instead of interpolated travel: anticipation (0–750), signature (750–1,750), recovery (1,750–end); Suzu: preparation, open-armed cue, finish — no spin (§9.6) |
| **Harmony portrait flourish: Off** | none (since 2026-10-05 no cue at all) | unchanged §3.1 timings (the stage choreography and banner are kept; only the portrait goes; no wait) |
| **Hurried** (Z / Enter / click) | the same instance runs on the ×4 clock (fades fully, then disposes) | ×4 (existing) |
| **Skip** | `settle('skip')` → `dispose('skip')` at once | the rest applied at once (existing) |
| **Hidden tab / watchdog / scene exit** | `dispose('hidden' / 'watchdog' / 'exit')` | settled (existing) |
| **A slip cost** | the cut-in starts with the technique's gesture, after the 320 ms slip beat (the cue's `at` = the `t` after the cost) | +320 (existing); the same wait after it |
| **Winning technique** | unchanged (gone by 780; since 2026-10-05 by 1,400, before the first result) | `choreo.finish` appended at `P.end − 360` (existing) |

The banner's interval follows `P.end` automatically (blue party banner throughout, out by `P.end − 120`).

## 4. The four companions

For each: the existing effects (exact), the current choreography (§1.2), and the new silhouettes for the
companion and the player. Portrait directions are for `RB.harmonyArt` (CONTRACT.md §3.1). Gesture ids are
proposals for `34m_battler_moves.js`.

### 4.1 Nao — Read the Opening (`nao`)

- **Effect (exact):** 2 knots on the target; the target's move cancelled; Harmony emptied; in a group
  everything lands on the target only.
- **Current:** `point` (fist back → straight arm, finger) then the player's `thread`; `pSpot` and `pThread`
  to the top knot; two `knotRelease` 90 ms apart.
- **Portrait:** focused three-quarter gaze toward the shared target, slight confident smile, one hand
  indicating a precise direction; courier scarf (ochre `#c8962e`), spiky dark-brown hair, the big satchel's
  strap across the chest; a small route-like ink stroke may join the pair (no map clue, no new skill).
- **Companion, new gesture `opening`:**
  - anticipation (500–780): centre of balance lowered (pelvis −4 to −5 units, knees bent), head and
    shoulders track the selected creature (`headYaw`/`spineYaw` follow `anchor('foe:i')`), the free hand
    steadies the satchel;
  - signature (780–1,300): one short purposeful step forward with the right foot (lifted, no slide), then
    the hand cuts across the opening — flat hand, edge leading — finishing in a precise point at the knot;
  - recovery (1,750–2,200): hand lowers, a small acknowledging nod toward the player (head turns left),
    back to the practical ready stance. No spin, wink or bow.
- **Player, new terminal `rally_thread`:** gathers the strip at the chest during Nao's anticipation, then the
  thread follows the line Nao's hand drew, released at ≈1,100, pulled back on the second knot.
- **Contacts:** two linked but distinguishable knot contacts (first at `contact`, second +120 ms with a
  smaller flash), both on the target only.
- **Rule protection:** in a group, no splash on other creatures (`arrive()` already aims `pThread`/`pSpot`
  at `T`); the plan's `target` stays the single target.

### 4.2 Mio — Clearwater Draught (`mio`)

- **Effect (exact):** both adventurers to full resolve; Heat, mist (Shroud) and Gathering cleared on the
  target **and every other standing creature**; 1 knot on the target; move cancelled; Harmony emptied.
  No other condition is cleared (Hush/Silence, stripped wards, Chill are not in the list).
- **Current:** the player's `restore`, Mio's `pour` into the player's ink (`pPour`), `motes` and `soothed` at
  the `tech` beat, `pSteam` wash on the creatures; numbers only for real recovery (`healThen` uses the
  displayed delta).
- **Portrait:** composed, reassuring expression; a clear purposeful hand position with the vial drawn
  from the bottles at her hip; apron, bun with pins, sleeves rolled; no staff, no prayer pose.
- **Companion, new gesture `draught`:**
  - anticipation (450–750): the vial drawn from the hip and lifted to eye level, the other hand cupped under
    it — a check of the measure (head pitched to the vial);
  - signature (750–1,350): steadied, uncorked with the thumb, tipped into the player's rising ink in one
    controlled pour (`vialTilt` 0 → 100), the cupping hand guiding the stream;
  - recovery (1,800–2,250): a glance from the player to herself (two short head turns), the vial back to
    the hip, hands resting before the apron. Relief calm, practical.
- **Player, new terminal `rally_release`:** the folio held open to receive the pour, the hand rises and
  opens outward over both (the existing `restore` arc, timed to the pour).
- **Three distinct beats** (§9.4) on one authoritative state step: knot release at `contact` (the `unravel`
  beat, on the target); restoration at the `tech` beat (`motes`, `soothed`, numbers only where `delta > 0`);
  condition dispersal as a visual that starts at the `tech` beat +150 ms and travels to each creature that
  actually had Heat, mist or Gathering (read from `ctx.view` before the sequence) — creatures without them
  get nothing.
- **Rule protection:** no extra bottle, healing, cleansing or revival shown; at full resolve no positive
  number (already true); dispersal only on the creatures the rules cleared.

### 4.3 Ren — Lantern Ward (`ren`)

- **Effect (exact):** a 3-point ward before each adventurer (`ward.pc += 3`, `ward.comp += 3`, consumed by
  blows as any ward); 1 knot on the target; move cancelled; Harmony emptied.
- **Current:** Ren's `ward` (lamp out, right hand tracing a seal) and the player's `ward` (forearm across,
  closing stroke); `pLamp` over both; `sealForm` on each at the `tech` beat.
- **Portrait:** intent gaze behind correctly drawn glasses (frames over the eyes, a lens glint that stays
  put), the lamp raised or framing the face in its light, a measured flat hand; patched ceremonial coat,
  blue-black ponytail (`hairColor: 7`). A glasses adjustment may appear but is not the whole gesture.
- **Companion, new gesture `ward_plane`:**
  - anticipation (480–780): feet planted wide (both feet set, no lift), lamp drawn in to the chest with the
    left hand, right hand flat beside it;
  - signature (780–1,330): the lamp raised high and turned so its light falls across the pair (the shutter
    side toward the creatures), the right hand sweeps a level line at chest height — the protective plane;
  - recovery (1,750–2,200): lamp lowered to the ordinary ready position, a brief check left and right (head
    turns to the player, then forward) — geometric, restrained.
- **Player, new terminal `rally_seal`:** the inscription completed along Ren's plane: the brush traces the
  level line from the other end and closes it with a short vertical stroke (distinct from the `ward`
  forearm-across stroke, which stays for the ordinary Protect response).
- **Two places, two meanings:** the ward forms at each ally anchor (`anchor('pc'|'comp','chest')`) at the
  `tech` beat; the knot consequence is shown separately on the target at `contact`.
- **Rule protection:** the ward's look scales with its amount (3) and disappears as it is used up, like
  other wards; no invulnerability dome.

### 4.4 Suzu — Curtain Call (`suzu`)

- **Effect (exact):** 2 knots on the target, its move turned back (cancelled); in a group each other standing
  creature's move also turns back and each loses 1 knot; Harmony emptied.
- **Current:** `flourish` (arm drawn across, sweep out and up) then the player's `thread`; `pAttention`
  lines from the creatures to Suzu; `fizzle` on each cancelled creature; extra `unravel` beats in a group.
- **Portrait:** welcoming rally pose, animated eyes, one wink or knowing look, one quick glint beside the
  face at the hold (not a loop); pink ribbon (`ribbonCol #c8a0a8`), earrings on the correct sides, wavy
  reddish-brown (auburn, `hairColor: 3`) hair, plum-purple dress, medium-deep complexion (`skin: 4`), the mole of her portrait.
  The player's look stays independent of hers.
- **Companion, new gesture `curtain`:**
  - anticipation (450–750): a preparation step back onto the left foot, arm drawn across the body, weight
    gathered;
  - signature (750–1,350): a compact twirl on the spot with dedicated turning silhouettes — side view,
    back view, the other side — dress and hair following a beat late; a planted finish facing the
    creatures, one arm opened toward the shared action (the cue at ≈1,100);
  - recovery (1,850–2,300): a small theatrical finish (a half-bow of the head, hand to the hip) that becomes
    the ordinary ready stance before the creatures act.
  - The battle rig draws a rear three-quarter view mirrored for `facing: 'upleft'`; the side and back
    silhouettes need a per-key yaw in `34_battlers.js` (not a horizontal flip — the ribbon and earrings must
    stay on their sides, §6.4).
- **Player, new terminal `rally_catch`:** the thread drawn on Suzu's cue as a curtain-like arc that "catches"
  the opening and swings the creature's move back.
- **Group:** every cancelled creature gets its own `fizzle` and, for the others, a knot release that matches
  the `unravel` beat on that creature (`foe: i`).
- **Reduced motion:** three held poses — preparation, open-armed cue, finish — no spin.
- **Rule protection:** one portrait and one technique even with three creatures; no repeated cut-ins.

## 5. Party, pets, sound

- The companion not acting: in a technique both act, so this concerns other party actions; unchanged.
- Pets (`RB.battlePets`) may glance at the rally on `present:action` with `family: 'technique'`; no
  duration, effect, RNG or targeting change (HX27); they never enter the portrait.
- Sound: a short rally accent at the technique's start and the existing effect sounds; no voice; muted play
  loses nothing (the banner and the stage carry the beat). New sounds go through worker (c)'s audio owner
  (CONTRACT.md §4).

## 6. Acceptance hooks for the workers

- `RB.harmonyCutin.state()` / `stats()` and `RB.battleSeq.trace()` (each sequence's fired cues and beats)
  give cue timestamps for one capture per pairing (§23.1).
- Unit: from `RB.partyChoreo.player()`, assert per technique: one `cutin` cue at `t`; its end ≤ 780 (Normal),
  ≤ 687 presentation ms (Fast); first `beat` after the cut-in's end; `end` in 2,200–2,700 (group < 3,000);
  `RB.partyChoreo.coverage().techs` all mapped; with reduced motion, three held keys per performer. **Since Robin's
  decision of 2026-10-05** (`tests/unit/harmony_timing.test.mjs`): the cue's `d` is 1,400 (Normal) / 1,115
  presentation ms (Fast); the first `beat` ≥ the portrait's end + 120 at Normal, Fast and after a slip; every other
  cue exactly the wait later than with the portrait Off; `end` 2,500–2,750 at Normal (group and slip ≤ 3,300), Fast
  1.4–1.8 s of wall time; no cue and no wait with the setting Off or at Instant.
- Browser: the 24 core configurations, geometry and overlay on/off comparisons (CONTRACT.md HX64–HX65).

## 7. As built (the cut-in and stage worker)

Files: `src/ui/82d_harmony_cutin.js` (`RB.harmonyCutin`), `src/styles/61h_harmony_cutin.css`, the `cutin` cue
in `src/ui/82_battle_seq.js` (fired in `fire1()`'s visual branch, advanced in `tick()`, disposed in `settle()`,
`finish()` and `detach()`; `T.cutin`), fixed-progress pose cues in `src/ui/83_battle_stage.js`, the timeline
and carriers in `src/ui/84p_party_choreo.js`, effects `pCourier`, `pThreadRoute`, `pKnotPair`, `pRead` (Nao), `pCascade`,
`pDrop`, `pRefill`, `pWash` (Mio), `pCurtain`, `pPlane` in `src/ui/84p_party_fx.js`,
gestures in `src/engine/34m_battler_moves.js`, the rig's `turn` / `clothFlare`, the lamp's shutter, Nao's pencil
(`prop.pencil`) and Mio's larger vial (`prop.vialBig`) in `src/engine/34_battlers.js`, the setting (`harmonyFlourish`, default On) in `src/engine/90_game.js` and
`src/ui/55_settings.js` (the folio's Battles rows and the battle's own settings sheet), the development viewer
`src/ui/82e_harmony_dev.js` (`?dev=harmony`).

### 7.1 Lifecycle and timing as built

One instance at a time, token `n`; states `inactive → entering → holding → fading → disposed`, each transition
stamped on the presentation clock (`RB.harmonyCutin.last().marks`, frame resolution). The choreography places
the cue (one per technique, groups included, only with a committed companion — and, since Robin's decision of
2026-10-05, only when a portrait can play: the setting On, not Instant; the stage then waits for it, §3); the overlay
decides whether it shows: setting Off, Instant (never fired), a reading layer open (dialogue, word help, the
language task, a confirmation, any `aria-modal` sheet), a hidden tab, or no safe placement — each counted in
`stats().suppressed`, a placement failure recorded in `stats().fallbacks` with every fit step tried.

Measured (headless Chromium, 2026-10-03; presentation ms from the cue, frame resolution; Fast runs the presentation clock ×1.43, so 143 / 315 / 229 presentation ms are 100 / 220 / 160 ms of wall time; the Nao and Mio rows re-measured after their v2 performances, §7.3, by `node tests/e2e/harmony_cutin.mjs --docs` on a loaded shared machine):

| Pairing | Speed | entering | holding | fading | disposed | first result | sequence end | wall time |
|---|---|---|---|---|---|---|---|---|
| Nao | normal | 0 | 183.4 | 566.7 | 783.4 | 1317 | 2350 | 2354 ms |
| Nao | normal (reduced motion) | 0 | 183.3 | 566.6 | 783.3 | 1300 | 2350 | 2357 ms |
| Nao | fast | 0 | 143 | 476.6 | 691.3 | 1311 | 2350 | 1634 ms |
| Nao | fast (reduced motion) | 0 | 166.7 | 476.6 | 691.1 | 1311 | 2350 | 1628 ms |
| Nao | instant | — | — | — | — (no portrait) | 0 | 2350 | 4 ms |
| Nao | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2350 | 4 ms |
| Mio | normal | 0 | 183.4 | 566.7 | 800 | 1250 | 2400 | 2403 ms |
| Mio | normal (reduced motion) | 0 | 183.4 | 566.7 | 783.3 | 1250 | 2400 | 2383 ms |
| Mio | fast | 0 | 143 | 476.8 | 691.3 | 1263 | 2400 | 1663 ms |
| Mio | fast (reduced motion) | 0 | 166.7 | 476.6 | 691.1 | 1263 | 2400 | 1666 ms |
| Mio | instant | — | — | — | — (no portrait) | 0 | 2400 | 11 ms |
| Mio | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2400 | 6 ms |
| Ren | normal | 0 | 183.3 | 566.7 | 783.3 | 1217 | 2300 | 2294 ms |
| Ren | normal (reduced motion) | 0 | 183.3 | 566.6 | 783.3 | 1217 | 2300 | 2306 ms |
| Ren | fast | 0 | 143.1 | 476.6 | 691.3 | 1216 | 2300 | 1607 ms |
| Ren | fast (reduced motion) | 0 | 166.9 | 476.6 | 691.3 | 1215 | 2300 | 1606 ms |
| Ren | instant | — | — | — | — (no portrait) | 0 | 2300 | 6 ms |
| Ren | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2300 | 4 ms |
| Suzu | normal | 0 | 183.3 | 566.6 | 783.3 | 1283 | 2450 | 2443 ms |
| Suzu | normal (reduced motion) | 0 | 183.4 | 566.7 | 783.4 | 1283 | 2450 | 2454 ms |
| Suzu | fast | 0 | 143 | 476.6 | 691.1 | 1287 | 2450 | 1706 ms |
| Suzu | fast (reduced motion) | 0 | 166.7 | 476.6 | 691.1 | 1287 | 2450 | 1707 ms |
| Suzu | instant | — | — | — | — (no portrait) | 0 | 2450 | 4 ms |
| Suzu | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2450 | 4 ms |

Also run per pairing: pet hidden, pet shown, portrait off — no portrait layer at any frame with the setting Off; the stage performance and every result unchanged (the rules' state compared across all 30 configurations).

Measured again after Robin's decision (headless Chromium, 2026-10-05, `node tests/e2e/harmony_cutin.mjs core`; Normal
1,400 ms with the wait before the stage, Fast 1,115 presentation ms = 780 wall; the portrait Off: no cue, no wait):

| Pairing | Speed | entering | holding | fading | disposed | first result | sequence end | wall time |
|---|---|---|---|---|---|---|---|---|
| Nao | normal | 0 | 233.3 | 1050 | 1400 | 1533 | 2570 | 2564 ms |
| Nao | normal (reduced motion) | 0 | 233.5 | 1050 | 1400 | 1533 | 2570 | 2572 ms |
| Nao | fast | 0 | 262.1 | 810.2 | 1120 | 1311 | 2350 | 1637 ms |
| Nao | fast (reduced motion) | 0 | 262.1 | 810.2 | 1120 | 1311 | 2350 | 1639 ms |
| Nao | instant | — | — | — | — (no portrait) | 0 | 2350 | 4 ms |
| Nao | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2350 | 5 ms |
| Nao | normal (portrait off) | — | — | — | — (no portrait) | 1300 | 2350 | 2342 ms |
| Mio | normal | 0 | 233.4 | 1050 | 1416.7 | 1533 | 2670 | 2664 ms |
| Mio | normal (reduced motion) | 0 | 233.3 | 1050 | 1400 | 1533 | 2670 | 2673 ms |
| Mio | fast | 0 | 262.3 | 810.4 | 1120.1 | 1263 | 2400 | 1672 ms |
| Mio | fast (reduced motion) | 0 | 262.1 | 810.4 | 1120.1 | 1263 | 2400 | 1669 ms |
| Mio | instant | — | — | — | — (no portrait) | 0 | 2400 | 5 ms |
| Mio | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2400 | 4 ms |
| Mio | normal (portrait off) | — | — | — | — (no portrait) | 1267 | 2400 | 2408 ms |
| Mio | normal (pet shown) | 0 | 233.4 | 1050 | 1400 | 1533 | 2670 | 2674 ms |
| Mio | normal (pet hidden) | 0 | 233.3 | 1049.9 | 1416.5 | 1533 | 2670 | 2675 ms |
| Ren | normal | 0 | 233.3 | 1049.9 | 1416.5 | 1533 | 2620 | 2623 ms |
| Ren | normal (reduced motion) | 0 | 233.3 | 1049.9 | 1416.6 | 1533 | 2620 | 2621 ms |
| Ren | fast | 0 | 262.1 | 810.2 | 1120 | 1239 | 2335 | 1623 ms |
| Ren | fast (reduced motion) | 0 | 262.1 | 810.2 | 1120.1 | 1239 | 2335 | 1622 ms |
| Ren | instant | — | — | — | — (no portrait) | 0 | 2300 | 5 ms |
| Ren | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2300 | 4 ms |
| Ren | normal (portrait off) | — | — | — | — (no portrait) | 1217 | 2300 | 2307 ms |
| Suzu | normal | 0 | 233.4 | 1050 | 1400 | 1533 | 2690 | 2685 ms |
| Suzu | normal (reduced motion) | 0 | 233.3 | 1050 | 1400 | 1533 | 2690 | 2688 ms |
| Suzu | fast | 0 | 262.3 | 810.2 | 1120.1 | 1287 | 2450 | 1708 ms |
| Suzu | fast (reduced motion) | 0 | 262.1 | 810.4 | 1120.1 | 1287 | 2450 | 1707 ms |
| Suzu | instant | — | — | — | — (no portrait) | 0 | 2450 | 4 ms |
| Suzu | instant (reduced motion) | — | — | — | — (no portrait) | 0 | 2450 | 5 ms |
| Suzu | normal (portrait off) | — | — | — | — (no portrait) | 1283 | 2450 | 2458 ms |

An art timeline (`RB.harmonyArt.timeline(comp)`, if the art provides one) is played instead of the two
drawings: states on the in / hold / out segments by fraction, a missing state holds the one before, reduced
motion shows the last; every state is footprint and is prepared ahead (unit-tested with a stub, and
browser-tested with the painted path's SYNTHETIC sample — see 7.4; the build ships no painted set, so today's
code-drawn busts, which have no timeline, are what players see).

Interruptions (browser-tested): Skip disposes it at once and settles every result once; a hidden tab, a
campaign change (the battle is abandoned whole, its scene exit disposing the portrait; the overlay's caches are
cleared too), word help opening (removed, never animated over it), the scene's exit and
defeat dispose it; the press that committed the technique neither skips nor hurries it; a resize places the same
instance again (no replay, one start, Harmony spent once); the battle's settings sheet pauses it with the
encounter, and turning the setting Off there removes it on resuming. With large text (or an overlay that
scrolls) it waits unseen until the layout has held still for six frames, then fades in where it stands — or,
if no place is left then, is not shown at all (never a flash over content that moved under it).

### 7.2 Placement and fit modes per viewport

Protected, measured each time: the status dock, the action banner (as it appears, +8 px for its drop), the
telegraph and responses unless Adaptive has withdrawn them, Skip, the battle's Settings button (it stays
shown through an action; its appearing is part of the layout signature), plates and badges, an open intent card, each
creature's box with its knots, the on-field party's box, any visible HUD or touch control — 12 px clear, tested
against the composition's drawn rows. The browser test checks the drawn pixels independently in every frame of
the hold and fade.

Measured by `tests/e2e/harmony_cutin.mjs` (geometry and plan): the fit chosen, the scale, the drawn face height, the footprint as a share of the viewport, frames checked against the protected rectangles (hold and fade), overlaps found.

| Viewport | Text | Pairing | Fit | Variant × scale | Faces | Footprint (w / h / area %) | Frames checked | Overlaps | Placed again | Same layouts as with the portrait Off |
|---|---|---|---|---|---|---|---|---|---|---|
| 1648×840 | 100% | Nao | standard | standard ×2 | 66 px | 26.8 / 23.3 / 6.3 | 35 | 0 | 0 | yes |
| 1648×840 | 200% | Mio | standard | standard ×2 | 66 px | 26.8 / 23.3 / 6.3 | 36 | 0 | 1 | — |
| 1440×900 | 100% | Ren | standard-moved | standard ×2 | 66 px | 30.7 / 20 / 6.1 | 35 | 0 | 0 | — |
| 1440×900 | 200% | Suzu | compact | compact ×2 | 66 px | 21.8 / 17.3 / 3.8 | 35 | 0 | 1 | — |
| 1280×720 | 100% | Nao | compact | compact ×2 | 66 px | 24.5 / 23.1 / 5.7 | 35 | 0 | 0 | yes |
| 1280×720 | 200% | Mio | compact-small | compact ×1 | 33 px | 12.3 / 11.5 / 1.4 | 34 | 0 | 1 | yes |
| 768×1024 | 100% | Ren | compact | compact ×3 | 99 px | 61.3 / 22 / 13.5 | 36 | 0 | 0 | — |
| 768×1024 | 200% | Suzu | compact | compact ×3 | 99 px | 61.3 / 22.9 / 14 | 34 | 0 | 1 | — |
| 390×844 | 100% | Nao | compact | compact ×2 | 66 px | 80.5 / 19.7 / 15.8 | 36 | 0 | 0 | yes |
| 390×844 | 200% | Mio | omitted (placed again: overlaps banner) | — | — | — | 0 | 0 | 1 | yes |
| 320×640 | 100% | Ren | compact | compact ×2 | 66 px | 98.1 / 23.4 / 23 | 36 | 0 | 0 | — |
| 320×640 | 200% | Suzu | omitted (overlaps banner) | — | — | — | 0 | 0 | 0 | — |
| 844×390 | 100% | Nao | compact-bare | compact ×1 | 33 px | 16.1 / 21 / 3.4 | 36 | 0 | 0 | — |
| 844×390 | 200% | Mio | omitted (overlaps status) | — | — | — | 0 | 0 | 0 | — |

The combination plan (one technique each):

| Scene | Text | Pairing | Fit | Variant × scale | Faces | Footprint (w / h / area %) | Frames checked | Overlaps | Placed again |
|---|---|---|---|---|---|---|---|---|---|
| Keep visible + Expanded, 1280×720, Ren | 100% | Ren | compact-small | compact ×1 | 33 px | 12.3 / 10.4 / 1.3 | 35 | 0 | 0 |
| Keep visible + Expanded, 1648×840, Suzu | 100% | Suzu | standard | standard ×2 | 66 px | 26.8 / 22.1 / 5.9 | 32 | 0 | 0 |
| group of three, 1280×720, Suzu | 100% | Suzu | omitted (overlaps creature) | — | — | — | 0 | 0 | 0 |
| group of three, 1648×840, Mio | 100% | Mio | compact-small | compact ×1 | 33 px | 9.5 / 9.9 / 0.9 | 35 | 0 | 0 |
| group of two, 1920×1080, Nao | 100% | Nao | compact-small | compact ×1 | 33 px | 8.2 / 7.7 / 0.6 | 34 | 0 | 0 |
| finishing technique, 1280×720, Nao | 100% | Nao | compact | compact ×2 | 66 px | 24.5 / 23.1 / 5.7 | 36 | 0 | 0 |
| Adaptive + Expanded, 390×844, Mio | 100% | Mio | compact | compact ×2 | 66 px | 80.5 / 19.7 / 15.8 | 35 | 0 | 0 |
| Keep visible, 390×844, Mio | 100% | Mio | omitted (overlaps banner) | — | — | — | 0 | 0 | 0 |

Why the desktop fits differ (the fit order's own record, one creature, during the hold): at 1648 × 840 the
standard pair fits at mid height; at 1440 × 900 it meets the creature's box at mid height and is moved up; at
1280 × 720 the standard pair at ×2 (456 px wide) reaches the creature's name plate (x 443, inside 12 px) at
every height, so the compact pair at ×2 is used — same 66 px faces, a smaller band. Groups fill the left side
with a creature's box (not its silhouette), hence compact ×1 or the recorded omission there. At 200 % text
(`textScale` 2) on phones the banner and the status dock take the room: omitted, recorded, never shown over them.

**The painted art in groups (2026-10-06).** The tables above were measured on the code-drawn busts. The painted compact
pair is 248 × 128 art px against the code busts' 160 × 84, and its smallest scale is 1, so with the approved art the
groups at common desktop sizes left the portrait out (the plan's "group of three, 1648×840" and "group of two,
1920×1080", and Robin's 2048×1046 with three). `place()` now has two further passes, each tried only when the one
before finds nothing, so every placement that fitted before is unchanged:
1. **Slid past the left edge** the pair already enters from, in steps of 2 art px, while every face (with the motion's
   reach) keeps at least 8 px on screen.
2. **Its top rows past the top edge**, up to 16 art px (an eighth of the pair: hair crowns, a hat's crown, the band's
   edge), slid or not, the least of the pair cut off first. Faces stay whole and at least 8 px below the edge.

Measured by harmony_cutin "groups at desktop sizes" (one technique each, real clicks, every frame checked):

| View, creatures | Pairing | Fit | Slid | Top rows cut | Faces from (left / top) | Overlaps |
|---|---|---|---|---|---|---|
| 2048×1046, three | each of the four | compact-small ×1 | 4 px | 0 | 32 / 253 px | 0 |
| 1920×1080, two | Nao | compact-small ×1 | 0 | 5 px | 36 / 44 px | 0 |
| 1920×1080, three | Mio | compact-small ×1 | 0 | 5 px | 36 / 44 px | 0 |
| 1648×840, three | Ren | compact ×1 | 0 | 15 px | 36 / 34 px | 0 |
| 1536×864, two | Suzu | compact ×1 | 12 px | 3 px | 24 / 46 px | 0 |

Still left out with the painted art, as designed (the stage performance plays, the banner names the technique),
measured on 91ef7d2 by a scratch probe of `place()` in the same encounters (the Flour Moth, Adaptive): two
creatures at 1280×720 and 1366×768; three at 1280×720, 1366×768, 1440×900 and 1104×884 (every protected box would
have to shrink by 14–68 px more for it to fit); Keep visible + Expanded at 1280×720 (the menus stay); and the phone
cases at 200 % text above. It shows with two creatures at 1440×900 (slid 16 px) and three at 1536×864 (3 px cut);
phones in portrait (390×844), a tablet (768×1024) and an unfolded foldable held upright (884×1104) show it with three
creatures without either pass.

### 7.3 The four stage performances as built (Normal, presentation ms from the technique's start)

Both performers start and end in the rear-three-quarter ready stance; pose segments overlap by 20 ms (no idle
frame between them); a held segment carries a fixed progress. Reduced motion: three held poses each (the
anticipation key, the signature, the recovery's own key) — cut, never travelled.

| | Companion: anticipation → signature (cue) → held → recovery | You (rally) | Results |
|---|---|---|---|
| Nao — `opening` (v2) | 400–780: their right hand up to their ear, the courier pencil taken from behind it (560–613; the pencil is a prop of the battle rig, as in their portrait), brought out before their shoulder as they start to turn (turn 26°), the weight dropped (pelvis −2.8 → −5.8 units) → 780–888 turned sharply side-on (turn 54°, the rig's own side view, read from behind), a step in with the right foot while the back foot stays planted through the turn, the pencil arm raised, the left arm swung back for balance → 888–1,320 the pencil sketches the route out to the creature, ticking twice (1,032 — the cue — and 1,176) → held at the route's end to 1,850 → 1,850–2,350 the pencil back behind their ear with a glance to you (2,050–2,100), a short nod (2,230), the stance | 0–500 a breath and the writing hand gathered; held to 900; `rally_thread` 900–1,420 (release 1,118: the thread sent out along their route, then drawn back taut); recovery 1,790–2,290 | `pCourier` from 888: a dashed gold route sketched at the pencil's pace over the party, a waypoint pin landing on each knot that really comes loose (1,032 and 1,176; when only one is left, the one, at 1,104), then up to the creature, where a ring closes round the opening (1,320); `pThreadRoute` 1,118: your thread follows the route to those knots; knots 1,300 together, in one shared burst (`pKnotPair`, a ring round both, the hop between them flaring) only when two really come loose; `pRead` 1,450 (its move answered: the ring pulled tight round the opening); the braid (`pJoin`) drawn fine under the route; nothing on any other creature; end 2,350 |
| Mio — `draught` (v2) | 350–750: a hand to the bottles at her hip (518), the vial — drawn larger in this technique (`vialBig`, about 1.5 art px wider and 3 longer) — raised to eye level and cupped as she turns (turn 26°) → 750–1,350 uncorked (834), lifted high over her head, side-on (978, turn 40°), tipped from there (the cue 1,020, as the stream leaves) and poured (1,110), her free hand spread over you both → held, still tipping, to 1,920 → 1,920–2,360 the cork back before her chest (2,052), the vial at her hip and a small satisfied nod (2,140), her head up (2,237), the stance | `rally_release` 800–1,360 (the folio open to receive the pour, the hand rising and opening over you both; release 1,052); recovery 1,860–2,300 | `pCascade` 1,020–1,920, the pour to you both (also when both are full: the pour is the act): a clear stream arcs from the vial's lip high over the party (its head over you by about 1,240), breaks into a shimmering fall of drops and streaks over each of you (about 1,200–1,740), ripples at both pairs of feet (from about 1,330); `pDrop` 1,092: your ink carries one drop of it to the knot, landing at 1,250; the knot 1,250; the restoring at 1,400 (`motes` from 1,280, `pRefill` — clear water rising round you — from 1,320, the `soothed` pose) only on one of you below full (numbers from the applied change); the washing: a rinse (`pWash`) from 1,490 over each creature that had Heat, mist or Gathering, then steam (Heat), the mist parting, the gathered motes scattering from 1,550 (+70 for each further creature) — only what was there; the braid drawn fine; end 2,400 |
| Ren — `ward_plane` | 260–660 knees down, the lamp drawn in at their left → 660–1,210 the lamp raised high at their side and shaded (its shutter toward the creatures), the flat right hand drawing a level line at chest height (cue 990) → held → 1,810–2,210 the lamp lowered, a check to you and to the other side | `rally_seal` 760–1,320 (the brush along the plane from its other end, closed with a short vertical stroke; release 1,197) | the knot on the creature 1,200; the lamp's light over the pair from 810; the plane before each of you from 930, a ward at each 1,350 (+80); end 2,300 |
| Suzu — `curtain` | 350–750 a step back onto the left foot, the arm drawn across → 750–1,014 one twirl on the spot (the rig's own side, front, other side and back; hem and hair flaring a beat late) → 1,014–1,113 planted, the arm opened toward the action (cue 1,091) → held → 1,910–2,410 a half-bow, a hand to her hip | `rally_catch` 850–1,410 (lifted high, swept out as a curtain's arc round the opening, hooked back; release 1,141) | knots 1,280 and 1,370; turned back 1,430 (+90 for each other creature); in a group each other creature's knot 1,580, 1,730, the curtain round each; end 2,450 |

Short local accents (no voice): a brush stroke as the rally starts; Nao `pen_down` as their pencil comes out (600), a
`pen_stroke` as the sketch starts (890) and `pen_up` at the route's end (1,320), Mio `splash` at the pour, Ren `lantern`
as the lamp rises, Suzu `wind` with the twirl; the existing `technique` chime at the result.

Ren's timing, 2026-10-06 (Robin): Ren's whole performance, with its lamp and plane effects and the `lantern` accent
(now 780), moved 120 ms earlier. It had started 20 ms after your `rally_seal`, against its own description (Ren draws
the plane; your brush closes it). Ren's signature now leads your gesture by 100 ms, as the others lead by 50–120 ms.
Your rally, the result and the end are unchanged.

Nao and Mio, v2 (the owner's review of 2026-10-03: "Suzu and Ren's animations look great in battle — Nao and Mio's
feel a tad lacking in comparison"). The first build gave Nao an `opening` that barely differed from their ordinary point
and lunge from behind, an ink circle and threads that read like a plain Unravel, and a short ochre line after contact
for "two knots at once"; Mio's vial was tiny at play scale, her eye-level and pouring keys hardly differed, the pour went
only to you as a few drops, and the payoff read as a number on one of you. v2 keeps each one's character and matches
Suzu's and Ren's readability: three purposeful silhouettes each with in-betweens (Nao: the pencil from behind their ear,
side-on sketching, the pencil back and a nod; Mio: the vial at eye level, high over her head pouring, the satisfied nod),
an effect that is clearly that companion's (the courier's route; the fountain of clear water over both of you), and the
technique's defining rule given its own moment (the two knots going together; the pour reaching both of you, the
restoring only where it restores, the rinse only where it washes something off). Before and after frame sheets at
1280 × 720 and 390 × 844: docs/screenshots/harmony/cutin/perf_v2/ (`node tests/e2e/harmony_perf_sheets.mjs`).
Reduced motion: Nao — the pencil out before their shoulder, the route's end, the pencil back behind their ear with a glance
to you; Mio — the vial at eye level, the vial high and tipped, the nod with the vial at her hip; their effects drawn
as still marks (the whole route with its pins and ring; the arc, a few drops and a ripple at each of your feet).

### 7.4 Evidence and measurements

`tests/e2e/harmony_cutin.mjs` (sections core, never, geometry, plan, frozen, life, cycles, setting, dev, painted;
`--docs` writes the evidence); `tests/unit/harmony_timing.test.mjs`; `tests/e2e/battle_invariance.mjs --tech` (96 technique
configurations, the portrait On / Off). Evidence in `docs/screenshots/harmony/cutin/`: a real-time WebM of each
pairing at Normal (1280 × 720), the four stage performances with the portrait Off as frame sheets, the compact
cut-in at 390 × 844, and `cutin_results.json` (every measurement above, the timelines at frame resolution, costs).
All figures are from headless Chromium on a shared, loaded 4-core machine — not a physical device, not a phone.

The painted path with its SYNTHETIC sample (Suzu only; `painted` in the browser test, recorded in cutin_results.json):

| View | Fit | Variant × scale | Faces | Canvas (art px) → shown (CSS px) | States shown, in order | Overlaps | Gone at / first result |
|---|---|---|---|---|---|---|---|
| 1280×720 normal | standard-moved | standard ×1 | 33 px | 352×160 → 352×160 | prep_a → prep_b → cue → peak → settle_b | 0 of 30 frames | 783.4 / 1283 ms |
| 1280×720 fast | standard-moved | standard ×1 | 33 px | 352×160 → 352×160 | prep_a → prep_b → cue → peak → settle_b | 0 of 22 frames | 691 / 1287 ms |
| 1280×720 normal reduced | standard-moved | standard ×1 | 33 px | 352×160 → 352×160 | settle_b | 0 of 36 frames | 783.3 / 1283 ms |
| 390×844 @3x normal | compact | compact ×1.333 | 44 px | 248×128 → 330.66×170.66 | prep_a → prep_b → cue → peak → settle_b | 0 of 34 frames | 800 / 1283 ms |

### 7.5 Limits, stated plainly

- A creature is protected by its box, not its silhouette: where a group puts one creature over the party on the
  left, the portrait shrinks to compact ×1 or is omitted (recorded), even where its wings leave a gap.
  With the painted art (2026-10-06) the pair may also slide past the left edge or lose up to 16 art px of its top rows
  to fit there (§7.2, "The painted art in groups"); smaller windows with three creatures still omit it.
- 200 % text is reached only by setting `textScale` to 2 (the slider stops at 150 %); there the portrait is often
  omitted on phones — by the fit order, with the fallback recorded.
- In the frozen-frame comparison the scene and every surface are identical outside the overlay; Chromium
  re-rasterises the Skip button's text and gradient (and once a banner edge) by a level or two when the overlay is
  shown or hidden — measured and reported, not a layout change.
- The stage uses the rig's existing faces: Suzu's front view in the twirl has small features (the far eye is
  added only when she is turned toward us); the spin is its 3-D rig turned through about ten drawings at Normal,
  not a hand-drawn turn.
- The overlay was built against today's code-drawn busts; painted art can replace them behind the same API: sizes
  come from `NATIVE` / `fitScale` / the canvas, fractional scales are accepted, and the art's phases or timeline
  are data. With the contract-v2 pair sizes (tried only with the synthetic sample) the standard pair fits
  1280 × 720 only at ×1 (faces 33 px) and the compact pair at 390 × 844 (ratio 3) at ×4/3 (faces 44 px) — below
  the 64 px the code-drawn compact pair reaches on that phone. Those sizes are the art contract's; the overlay
  follows them.
