# Illustrated sequences — selections and shot plans

For the owner's addendum of 2026-10-03 (Harmony Cut-Ins, Expressive Characters, and Illustrated
Storytelling) §17–§19. One integrated sequence at an existing key moment of each of Chapters 1–6, the
prologue's manual-advance rework, and the audit of the personal questlines, both long questlines, the
endings and The Pages We Keep. The player (`RB.sequence`), its controls and continuity rules are in
CONTRACT.md §3.5. Line numbers are the source files' own (`src/content/…`), at `20277f1`. Nothing here adds an
event, a line or a consequence: each sequence wraps lines that already exist.

## 0. Common rules for every sequence

- **Selection criteria (§17.2):** importance to the chapter; a real gain in visual clarity; a view the tile
  map cannot give; compatibility with every branch that reaches it. Each selection below states all four.
- **Wrapping:** `!sequence <id> begin` right after the scene's own entry transition, `!shot <shot>` before the
  line that the shot opens with, `!sequence <id> end` before the return to the world. State commands (`!set`,
  `!give`, `!take`, `!quest`, `!note`, `!refresh`) stay where they are and run once (§20.3); review and replay
  never run them.
- **Phases of a shot:** *entrance* (a 300–400 ms dissolve from the world or the previous shot, never a cut to
  black on a timer), *one-time action* (listed per shot; at most ≈1.5 s, started by the line that reveals it),
  *quiet hold* (indefinite; only light ambient motion such as steam, water or flame). `st.k` reaches 1 at the
  end of the action and stays there. With reduced motion each shot shows its post-action hold at once (and a
  pre-action key only where showing the end state early would reveal a line before it is read).
- **Reveal timing (§17.3):** no shot shows the end state of a revelation before its line; where a later line
  changes what is visible, the change is a one-time action of *that* line (named below as "on line N").
- **Captions:** the real dialogue sheet with furigana and word help, docked at the bottom during a sequence;
  `vb` (the sheet's top, as `RB.interlude` measures it) bounds the focal area. Safe areas per shot: **wide**
  (16:10–16:9 desktop): faces and the focal object inside the top 62 % of the picture; **narrow** (390 × 844
  upright): an authored vertical layout with the focal area in the top 55 %; **landscape phone** (844 × 390):
  the sheet covers most of the height, so the shot's tight crop (faces or the object only) sits in the top
  38 %, and Hide text is the way to see the whole picture. No caption is drawn into the art.
- **Controls (§18.2):** Next (reveal, then one beat), Previous (read-only review), Replay this shot, Hide text
  / Show text, Skip scene (confirmed when anything ahead is unseen; stops at any choice or challenge).
- **No shake, no flash:** a `!shake` inside a wrapped section (Ch3 line 59, Ch5 line 340) is shown as the
  shot's own one-time action instead (a held still frame or a slow ripple), never a screen shake (§18.5).
- **People drawn:** only those present: the committed companion (or, in Chapter 1, the provisional one
  walking with you: `s.provisional`), the player from `RB.equip.look(s)` snapshotted at entry, and the
  scene's speakers; a pet only where a scene concerns it (none below).
- **Replay record:** at `end`, `RB.company.memory()` with `kind: 'together'`, the sequence id, the labels of
  the branch taken, the companion and the look selectors (CONTRACT.md §3.5).

### 0.1 The player as built (`RB.sequence`, `src/ui/43_sequence.js`) — the API for later sequence files

Sequences are added as new files that only register shots; nothing in the core or in another chapter's file
changes. Chapter 1 is `src/ui/43a_seq_ch1.js`, Chapter 2 (and its faded passage) `43b_seq_ch2.js`; later chapters
and passages go in `43c_…`, `43d_…` (loaded after the core and its kit by file name). A dev viewer
(`src/ui/43z_sequence_dev.js`, `?dev=sequences`) shows every registered shot.

**Scene script** (the validator checks all of it; the quest guide treats the ops as presentation):

```
!sequence <seqId> begin     right after the scene's entry transition; the map dissolves into the first shot
!shot <shotId> [phase]      before the line the shot (or the phase's one-time action) opens with
…the scene's own lines and state commands, unchanged…
!sequence <seqId> end       before the return to the world; the picture dissolves back into the map
```
- A new shot dissolves in (≈350 ms); `!shot <same shot> <phase>` starts that phase's one-time action with no
  dissolve. Phases only go forward; earlier ones stay at their end state. `?(cond)` works on these ops, so a
  branch-only shot or phase is written like a branch-only line (e.g. `?(sg_wataru_self) !shot face soften`).
- Inside a sequence the world is behind the picture: `!move` and `!walkto` finish at once (the shots show the
  movement; positions still change, so the world matches on return), `!emote` does not wait, `!shake` never
  fires (the validator rejects one inside), and `!fade` is left to the shots. A sequence begun in the dark
  (after a `!fade out`) lifts the dark over its first shot and puts it back at `end`, so the scene's own
  `!fade in` shows the world as written. Put `!sequence … end` before a fade that should go to black.
- A sequence left open is disposed when its scene ends (also on an error, a defeat that ends the scene, a load
  or any campaign change).

**Shot definitions:**

```js
RB.sequence.define('ch3.assembly', {
  title: { en: '…', jp: '…(furigana)…' }, chapter: 3, scene: 'co.assembly',
  memory: true, memo: { jp: '', en: '…' },          // keep a Shared memory at the end (needs a companion)
  shots: {
    dusk: {
      phases: [['murmur', 900]],                     // [[id, ms], …] one-time actions in order; 0 = none
      draw(c, w, h, t, st) { … },                    // at art resolution into the buffer c (w × h)
      focus(w, h, vb, st) { return { x, y, w, h }; }, // the faces / focal object (tests keep it above the sheet)
    },
  },
});
RB.sequence.shot('ch3.assembly', 'names', { … });  // or one shot at a time
```
`st = { shot, phase, pi, k, at(phase), since, vb, still, review, hold, cast: { pc, comp }, test(cond), t }`:
`k` runs 0→1 through the current phase's action and then stays 1; `at(name)` gives any phase's progress
(earlier phases 1); `vb` is the dialogue sheet's top (keep the focal area above it; a phone on its side leaves
only a band, where a face stays in view and the rest goes under the sheet); `still` is reduced motion (k is 1
at once; stop ambient motion); `cast.pc` is the player's look snapshotted at entry and `cast.comp` the
companion actually on the map (else null; never draw an absent companion); `test(cond)` reads campaign state
(e.g. the Saltglass furnace lit only once `sg_boss_done`). A shot reads state; it never writes it.
The drawing kit `RB.seqKit` (`43_sequence_kit.js`) has the layout (`stage`), caches (`cached`, `small`; dropped
when a sequence ends), people from the game's own drawings (`figure` — road sprites with poses and props,
shrunk onto the grid; `bust` — portraits with expression and frame descriptors; `back` — a person from
behind), `hand`, light grading, and small live things (`gull`, `dust`, `steam`, `shoji`).

**What the reader can do** (the dialogue sheet's control row while a sequence is on): Next (Enter, Space, Z,
a click or tap on the line or Next) reveals the line, then moves on one beat; a press while a shot is still
dissolving in only completes the dissolve; key repeat is ignored. Previous (P, PageUp, ←) looks back at reached
beats read-only, Next walks forward and rejoins the live line without moving it on. Replay shot (R) plays the
shot's actions again. Hide text (I) leaves Show text and the navigation; a tap on the picture brings the text
back. Skip scene asks first when any line ahead (to the sequence's end or the next choice) is new to the
campaign, then runs the remaining lines quickly — the state commands run once — and stops at the end of the
sequence, at a choice, a challenge or any decision. Escape opens that question (it never skips by itself) or
closes word help. On phones Previous, Replay, Hide and Skip sit behind a labelled "Scene" button. P, R and I
are remappable in Settings › Controls.

**Seen state:** `s.seq[seqId] = { n: times ended, h: [hashes of the lines shown] }` (optional; older saves gain
it through `migrate`). Skip-seen stops at the first line of a sequence this campaign has not shown.

**The prologue** runs on the same player outside a scene (`RB.sequence.view`), with its own caption slip.

---

## 1. Chapter 1 — the bridge reaches the far bank (`rw.bridge_scene`)

`src/content/ch1/31_scenes_mill.js` line 270 (its own `RB.script.add` block, label `ch1/31_bridge`). Reached
only one way: after the Mill Echo (`rw.m1_boss`: `!battle rw.mill_echo`, `!set rw_echo_done bridge_fixed`,
`!fade out`, `!warp rw.village 31 17 right`, `!fade in`, `!call rw.bridge_scene`). No branches, no
companion lines (before recruitment).

**Why this moment.** *Importance:* it resolves "The Mill That Calls Back" (`!quest rw_mill done`, line 284)
and the chapter's emotional thread — the two cups Hana pours every morning and the bridge that "no longer
reached the other bank", both shown in the prologue (shots 2, 3 and 5). *Clarity:* the cup Kōji carries, Hana's
face at the door and his wave are a few pixels at tile scale. *View:* the bridge's end settling onto the far
bank is a change of state the map can only switch. *Branches:* linear; one route in. Alternatives considered:
the departure (`rw.depart`, `rw.seeoff`, line 176/194 of `32_scenes_depart.js`) is staged well in the world (a
crowd at the edge of the village) and depends on four candidate variants; the Mill Echo is a battle.

**Sequence `ch1.bridge`:** lines 272–282; world again from line 283 (`!set rw_koji_back`, `!quest rw_mill done`,
`!refresh`) for Tsuru's lines 286–289 and the evening (290–295). Content change in Phase E: the blocking
`!move koji left 10 260` (line 274, 2.6 s of forced waiting) becomes shot 2's action; `!refresh` at line 285
puts Kōji where the story now keeps him.

| Shot | Beat, place | Composition | Participants, appearance | One-time action → quiet hold | Lines, reveal | Safe areas |
|---|---|---|---|---|---|---|
| 1 "It reaches" | after the battle; lines 272–273 | wide from the near bank by the teahouse: the river high and brown after the storm, the bridge in three-quarter view, the far bank's hut; the player (and a provisional companion if walking with you) small, from behind, at the bridge foot | player (look snapshot); the hut | the bridge's last span settles onto the far bank, a few motes settling where the prologue's motes left it (≈1.2 s) → water moving, hold. On line 273 the hut's door opens and a man in a hat steps out holding a teacup (≈0.8 s) | 272 (the bridge reaches), 273 (the man with a cup) — Kōji is not visible before 273 | wide: bridge and hut in the top 60 %; narrow: the bridge runs diagonally up the frame, the hut top right; landscape phone: crop to the bridge end and the hut |
| 2 "His own cup" | line 274's crossing, 275 | mid shot along the bridge from the near end: Kōji walking toward us with the cup held level; in the background the teahouse door at the left edge; Tsuru coming from the square with her cane, far | Kōji (`koji`: short brown hair, hat `#a8884a`, beard, tunic), Tsuru (white bun, cane, robe) small | Kōji walks from mid-span to the near end and stops (≈1.4 s); on line 275 the teahouse door slides open and Tsuru appears in the distance → hold | 275 | wide: Kōji centre-left above `vb`; narrow: vertical bridge, Kōji in the upper half |
| 3 "…Kōji?" | lines 276–278 | two-shot at the teahouse: Hana in the doorway (hand on the frame), Kōji at the step, the cup between them | Hana (`hana`: brown bob, apron `#a86a5a`), Kōji | on 276 Hana's hand stops on the frame (surprise); on 278 Kōji lifts the cup a little ("my own cup") → hold | 276 surprise, 277 three days of tea, 278 the rule | wide: both faces top 55 %; narrow: stacked, Hana above |
| 4 "I had forgotten" | lines 279–281 | close-up inside the doorway: Hana's face and hands; behind her on the counter the two cups she poured this morning | Hana; Kōji's hand and cup at the frame edge | 279: her head lowers (sad) and stays lowered through 280; on 281 she raises her head with a small smile and reaches toward the cups → hold (steam from the cups) | 279 apology, 280 Kōji's "who I was meant to be crossing to", 281 "yours" — the smile only on 281 | wide: face and cups top 60 %; narrow: face top, cups middle |
| 5 "Before the door closes" | line 282 | wide from the square: the two going in; the shoji glowing | Hana, Kōji | Kōji turns on the step and waves, the door slides shut (≈1.2 s) → hold on the closed door with the warm light behind the paper | 282 | wide and narrow: the door in the upper half |

Entry: after `rw.m1_boss`'s `!fade in`, a dissolve from the village to shot 1. Continue: Next per line; the shot
changes on lines 274, 276, 279, 282. Review: Previous within 272–282. Skip: confirm, then straight to line 283
(no choices inside). Return: `!sequence ch1.bridge end` after line 282, the state lines 283–285, then a dissolve
to the world at (31, 17) with Kōji and Hana indoors and Tsuru arriving for line 286. Music: `!music wonder`
(line 271) stays as authored (worker (c) owns music).

---

## 2. Chapter 2 — the pivotal exchange in the harbour office (`sg.omi_wataru`)

**Evaluation of the tide wait.** `sg.tide_wait` (`src/content/ch2/22_scenes_tide.js` line 44) already shows
the view from Shiori's window (`src/ui/42b_interlude_tide.js`; docs/ART_DIRECTION.md §13): one framing in three
states (`wait`, `road`, `fog`), stepped by the scene's `!interlude` lines, so its lines are already read at the
reader's pace. It is a strong "view the overworld cannot give", but as a chapter sequence it falls short on
two criteria: *importance* (a wait before the causeway, not the chapter's turn) and *distinct compositions*
(the three states are one picture recoloured by the tide — §17.2 does not count that as three). Adding
compositions would mean drawing the narrated companion asides (shells, a card trick) into scenes of their
own — padding, not the chapter's moment. **Decision:** keep the tide wait as it is, give it the shared
sequence controls (Previous, Replay, Hide text, Skip), and choose the Wataru/Omi exchange as Chapter 2's
sequence: it is the chapter's theme (a misunderstanding vs. a deliberate lie, docs/STORY.md), it is the §14
showcase, and §14 itself prescribes an illustrated close-up "if the room cannot show the expressions".

`src/content/ch2/21_scenes_main.js` line 312; reached only from `sg.wataru_confront` (line 278) after the lie
challenge (`!challenge sg.c_lie`) and its choice: `:self` sets `sg_wataru_self` ("Tell the harbourmaster
yourself. We'll go with you."), `:us` does not; both set `sg_wataru_confessed` and `!warp sg.office 5 6 up`.

**Why this moment.** *Importance:* the chapter's moral resolution (repayment, apology, the labels, the unopened
notice). *Clarity:* faces and hands across a desk — Omi's judgement, Wataru's "not dismissing me?", the notice
opened — are the content of the beat and unreadable at tile scale. *View:* the close two-shot and the envelope.
*Branches:* both routes reach it; the only branch inside the close-up is line 326 (`?(sg_wataru_self)`), and the
companion aside differs by `comp` (327–330, 338).

**Sequence `ch2.notice`:** lines 321–335, after the world performance of 313–320 (GESTURES.md §8); world again
for line 338 and Wataru's exit (339). The dialogue is not duplicated: 313–320 are performed in the world only,
321–335 in the picture only.

| Shot | Beat, place | Composition | Participants, appearance | One-time action → quiet hold | Lines, reveal | Safe areas |
|---|---|---|---|---|---|---|
| 1 "Two faults" | lines 321–323 | over Wataru's shoulder onto Omi behind the desk: the company's ledger and a stack of re-labelled tags on the desk, the window behind her with the harbour | Omi (`omi`: grey bun, hat `#23283a`, high collar, scar, coat `#2e3e5e`), Wataru from behind (glasses frame edge, short black hair) | on 321 Omi's hand rests on the company ledger ("the company's fault"); on 322 the hand moves across to the tags ("your fault") — two places for two faults (§14.2) → hold | 321, 322, 323 (every label in the harbour) | wide: Omi's face and both hands top 60 %; narrow: Omi upper half, desk below |
| 2 "Not dismissing me?" | lines 324–326 | reverse close-up on Wataru, Omi's shoulder at the frame edge | Wataru (`wataru`: glasses, notebook in hand) | on 324 a brief upward look (surprise), then a careful exhale on 325 (shoulders drop) → hold; line 326 only on `sg_wataru_self`: Omi's softened profile enters the frame edge as its one-time action (absent on the other route) | 324, 325, `?(sg_wataru_self)` 326 | wide: his face top 55 %; narrow: face top third |
| 3 "The room" | lines 327–331 (one of 327–330 by `comp`) | medium-wide inside the office from the window side: Omi, Wataru, the player and the companion who is actually travelling with you, a little apart | all four; the player and companion from their looks | the companion's small reaction (a nod or glance, by companion profile) on their aside; on 331 Omi points toward the window — Lanternfall, Kurobe — then back to Wataru → hold | 327–330 (one), 331 | wide: the four in the top 60 %; narrow: tighter, Omi and Wataru with the pair at the bottom edge above `vb` |
| 4 "The notice" | lines 332–335 (`!take sg_notice` at 332) | insert: the player's hand holding out the final notice across the desk; Wataru's hands taking it; then the envelope in his hands as the seal breaks; the window with a gull | the player's hand and sleeve (look snapshot: garment colour), Wataru's hands | on 333 the handover (≈0.9 s, the envelope moves from one hand to the other — no copy left behind); on 334 his hands steady; on 335 the seal breaks and a gull crosses the window → hold, the opened envelope in his hands | 333, 334, 335 — the seal is unbroken until 335 | wide: hands and envelope central; narrow: envelope in the upper half |

Entry: after line 320 (the narration of what he told her) a dissolve from the office to shot 1. Continue: Next
per line; shot changes on 324, 327, 332. Review: Previous within 321–335 (read-only). Skip: confirm; jumps to
the state lines 336–337 and the world. Return: `!sequence ch2.notice end` after 335, then line 336–337 run, a
dissolve to the office as the world: Omi at her desk, Wataru holding the opened letter; Suzu's aside (338) and
Wataru's exit (339) are staged in the world. The notice is no longer in the inventory (line 332) and is never
shown in two places.

---

## 3. Chapter 3 — the assembly at dusk (`co.assembly`)

`src/content/ch3/43_scenes_end.js` line 6. Reached by `co.suzu_truth`'s end when the kiln page is already
shown, or from Tokiwa after `co.tokiwa_page` (`co_main` 8); `!fade out`, `!warp co.eve 23 18 up`. Inside: a
learning challenge (`!challenge co.c_assembly`, line 31), a three-way choice (line 32: `:names` 37,
`:living` 43, `:ume` 48, rejoining at `:decide` 53), one condition (`?(co_bell_rung)` line 28) and the four
companion asides (63–66).

**Why this moment.** *Importance:* the chapter's decision — the village chooses to write the fire back and
remember (docs/STORY.md) — and `co_main` 9. *Clarity:* a crowd's raised hands, Tokiwa's trembling brush and the
ink sinking into the page cannot be read on the tile map. *View:* the half-decorated stage at dusk and the
chronicle's page close up. *Branches:* every route reaches it; each choice gets its own composition.
Alternatives: the kiln page (`co.core_page`, voices in the dark) — strong, but a dungeon pickup; Suzu's truth at
the workshop is optional content (audited in §8).

**Sequence `co.assembly`:** lines 11–66 (state lines 67–70 then `!call co.festival_begin`).

| Shot | Beat, place | Composition | Participants, appearance | One-time action → quiet hold | Lines, reveal | Safe areas |
|---|---|---|---|---|---|---|
| 1 "Dusk in the square" | lines 11–15 | wide: the square at dusk with the half-decorated stage, paper lanterns not yet lit, the villagers gathered; Tokiwa standing on the stage with the chronicle | Tokiwa (`co_tokiwa`: glasses, robe, the chronicle), Sayo, Tamotsu, Fusa, Nobu, Ume, Gorō, Heita and others as silhouettes with readable faces in front; the player and companion at the side | on 14 the murmur: heads turn toward each other; one laugh stops halfway (a single figure) → hold | 11–15; Sayo's "a fire?" is the first visible reaction | wide: stage top-centre; narrow: stage top, crowd below |
| 2 "I rewrote the chronicle" | lines 16–23 | medium on Tokiwa at the stage edge, the chronicle held to the chest; Tamotsu below the stage | Tokiwa, Tamotsu | on 16 Tokiwa lowers the head (the confession), raises it on 22 to ask the village → hold | 16–23 (Tamotsu 21) | wide/narrow: Tokiwa's face top 50 % |
| 3 "Voices from the square" | lines 24–30 (`?(co_bell_rung)` 28) | reverse from the stage over Tokiwa's shoulder: Fusa, Nobu, Ume, Gorō in the front of the crowd; then all eyes turning to the travellers | Fusa (flower, apron), Nobu (wrap, beard), Ume (basket, old), Gorō (beard, old) | each speaker leans in on their own line (no group nod); on 29 the crowd's faces turn toward the player and companion → hold; the challenge (31) and the choice (32) are answered over this held shot | 24–30; the shot does not change during the challenge or the choice | wide: faces in the top 55 %; narrow: two rows |
| 4a "The names" (`:names`) | lines 38–40 | close on Tokiwa reading, Gorō in the crowd below | Tokiwa, Gorō | each name on 38 lights one paper lantern behind the stage, one by one (≈1.5 s); on 40 Gorō's head lowers → hold | 38–40 | as shot 2 |
| 4b "For the living" (`:living`) | lines 44–45 | Tamotsu below the stage, Heita raising a sickle a little | Tamotsu (toolbelt, hat), Heita (headband) | on 45 Heita half-raises the sickle (small, not comic) → hold | 44–45 | as shot 3 |
| 4c "Ume speaks" (`:ume`) | lines 49–50 | close on Ume, the roof beams of the houses behind her in the dusk | Ume | on 50 she looks up toward Tokiwa → hold | 49–50 | face top 55 % |
| 5 "Every hand" | lines 53–56 | wide on the square: one hand rising, then another, then all | the crowd; Fusa in front | on 53 two hands rise; on 54 Fusa (sad) raises hers ("Yoshino"); on 55 the whole square's hands rise (≈1.4 s) → hold | 53–56 | wide: the crowd fills the band above `vb`; narrow: crowd in the upper 55 % |
| 6 "The ink does not fade" | lines 57–66 | insert: the chronicle open at the page from twenty years ago, Tokiwa's trembling brush adding a line; then the square weeping (cut back to a quieter wide on 61) | Tokiwa's hand; the square | on 57 the brush writes the line (≈1.4 s); on 58 the ink sinks into the paper instead of fading (≈1 s) — this replaces the `!shake` at line 59; on 61 a dissolve to the square in the lantern light, people holding one another → hold. The companion's aside (63–66) over this hold, their figure at the edge with their own small gesture | 57–66 | insert: page and brush central; the square as shot 5 |

Entry: the scene's own `!fade in` (line 10) ends on shot 1 instead of the map. Continue: Next per line; the
choice is answered on shot 3; the branch shot follows the label taken. Review: only reached beats of the
branch actually taken. Skip: confirm, then stops at the challenge (line 31) and the choice (line 32) — it never
answers either. Return: `!sequence co.assembly end` after 66; state lines 67–70; `co.festival_begin` begins
with its own `!fade out` and `!card`, so the world returns through that transition.

---

## 4. Chapter 4 — the lamp's name holds (`sb.lamp_name`, `sb.lamp_reply`)

`src/content/ch4/34_scenes_end.js`: `sb.dome_hoshino` (line 37) calls `sb.lamp_name` (line 50) the first time
and `sb.lamp_reply` (line 113) when the lamp is lit but the reply letter was not yet written. Inside
`sb.lamp_name`: a kana lesson and the name challenge (51–53; failure goes to `:later`, line 111, with no
sequence), then a three-way choice (line 65: `:stay` 70, `:go` 79, `:both` 89, joining at `:light` 98) with
companion lines per branch. `sb.lamp_reply` has its own challenge (115; failure → `:later` 128) and a
conditional line (120, `?(sb_hoshino_goes)`); then `!warp sb.hamlet 22 20 up` and `sb.eve_start`.

**Why this moment.** *Importance:* the chapter's promise — the observatory lamp lit for Akari — and `sb_lamp`.
*Clarity:* the name staying on the shade, the flame turning from blue to orange, the flint spark, the sealed
envelope with a blank address. *View:* the light pouring from the dome across the valley toward Lanternfall
can only be shown from outside. *Branches:* the three answers to Hoshino each get their own reaction; the
failure paths simply never start the sequence.

**Sequence `ch4.lamp`:** `sb.lamp_name` lines 54–107 and `sb.lamp_reply` lines 117–120 (the second part also
plays alone when `sb.lamp_reply` is reached later from `sb.dome_hoshino`).

| Shot | Beat, place | Composition | Participants, appearance | One-time action → quiet hold | Lines, reveal | Safe areas |
|---|---|---|---|---|---|---|
| 1 "Akari" | lines 56–59 (after the challenge succeeds) | close on the lamp's paper shade in the dome, the name just written in the player's ink; the blue flame inside | the shade; the player's writing hand at the edge | on 56 the ink holds (no running); on 57 the lamp's voice (bodiless: no figure); on 58 the flame turns blue → yellow → orange (≈1.5 s) → hold, the warm flame | 56–59 — the colour change waits for 58 | wide: shade central above `vb`; narrow: shade top half |
| 2 "Should I stay?" | lines 60–64 and the choice (65) | medium two-shot under the dome: Hoshino by the lamp, the telescope behind, the player and companion facing him | Hoshino (`hoshino`: old, glasses, beard, scarf, coat), player, companion | on 62 Hoshino looks from the lamp to the player (look-between) → hold through the choice | 60–64; choice answered on this shot | faces top 55 % |
| 3a/3b/3c "His answer" | `:stay` 70–76 · `:go` 79–86 · `:both` 89–96 | the same place, closer on Hoshino; 3a: hand on the lamp's frame; 3b: looking out of the dome window toward the valley; 3c: a hand on the lamp and the other toward the window | Hoshino; the companion's aside at the frame edge | 3a: his shoulders settle (72 smile); 3b: surprise on 80, then he turns to the window on 82; 3c: think on 90, smile on 91 → hold | branch lines including the companion's | as shot 2 |
| 4 "The light goes out to the valley" | lines 98–107 | first an insert: Hoshino's old flint struck, the spark, the player's word added, the flame rising round the wick; then (on 103) the outside: the observatory dome at night with light pouring from its window across the snowy valley, southeast toward Lanternfall's faint lights | Hoshino's hands; the dome exterior | on 99 the spark and the flame (≈1.2 s); on 103 the outside view's light spreads across the valley (≈1.5 s) → hold, the light steady | 98–107 (the companion's line 104–107) | insert central; exterior: dome top-left, the light band above `vb` |
| 5 "The address left blank" | `sb.lamp_reply` lines 117–120 (after its challenge) | insert under the lamp: Hoshino's hand sealing the envelope; the address line visibly blank | Hoshino's hands, the envelope | on 117 the seal pressed, the envelope turned to show the blank address (≈1 s) → hold | 117, 118, `!give sb_reply_letter` (119), `?(sb_hoshino_goes)` 120 | envelope central |

Entry: after the name challenge succeeds (line 53), a dissolve from the dome map to shot 1. Continue: shot
changes on lines 60, the label taken, 98 and 117. Review: reached beats only. Skip: confirm; stops at the
choice (65) and at `sb.lamp_reply`'s challenge (115). Return: `!sequence ch4.lamp end` after line 120 (or after
107 when the reply is postponed: its challenge failing returns to the dome map); then `!fade out`, `!warp
sb.hamlet 22 20 up`, `!fade in` and `sb.eve_start` performed in the world (the square looks up at the lamp;
CURATED as Performed overworld in the manifest).

---

## 5. Chapter 5 — the drowned bell rings (`lf.bell_touch`)

`src/content/ch5/24_tower.js` line 324. Guarded by `lf_boss_done` (else it calls `lf.boss_intro`). The bell's
inscription is a kana lesson and a challenge (327–328), then the companion's reading (330–333) and a choice
(334: `:ring` 338 or "Not yet" → end). After ringing: `lf_toya`'s voice (346), the companion's lines (348–355),
state (356–363), the fade, the warp to `lf.sluice` and Tokuji on the shore (368–372).

**Why this moment.** *Importance:* "Ringing the drowned bell restores disagreement" (docs/STORY.md), `lf_main` 9,
and the turn that frees Akari, Mio's refusal and Nao's letter (lines 359–361). *Clarity:* the sound made visible
— water, stone, the pipes, voices turning back toward the town. *View:* the flooded bell hall from below and the
town beyond the tower cannot be shown on the map. *Branches:* the choice "Not yet" leaves without ringing
(sequence exits to the hall; a later visit re-enters at shot 1); the companion lines vary by `comp`.

**Sequence `ch5.bell`:** lines 326–355 (the hold continues through the state lines 356–363 and line 364).

| Shot | Beat, place | Composition | Participants, appearance | One-time action → quiet hold | Lines, reveal | Safe areas |
|---|---|---|---|---|---|---|
| 1 "The bell" | lines 326–333 and the choice (334) | low view up at the great green-bronze bell in the half-drowned hall, the slack pipes that had wound round it lying in the water, the player and companion small on the platform | player, companion | on 326 a slow light across the bell's surface (the cast words visible as relief, **not legible** in the art: reading them is the challenge) → hold through the lesson, the challenge and the choice | 326, 329 (the translation, after the challenge), 330–333 (one) | bell top-centre, figures above `vb` |
| 2 "GONNNG" | lines 341–342 (`!sfx bell` 339; the `!shake` at 340 becomes this shot's action) | close on the bell's lip, the water below and the foot of the pipes at the frame's edge | — | on 341 the bell swings once; rings of ripples spread across the water (≈1.4 s, slow, no flash); on 342 the ripples reach the stone and a pale line of sound starts up the pipes (≈1 s) → hold, the water still trembling | 341, 342 | ripples in the band above `vb` |
| 3 "Towards the town" | lines 344–345 (`!sfx bell` 343) | from the tower's upper window: the conduits climbing the wall in the foreground, Lanternfall's roofs and canals beyond at dusk | — | on 344 two more pulses climb the pipes; on 345 they turn and run down, out toward the town, and windows light street by street (≈1.5 s) → hold | 344, 345 — the town changes only on 345 | pipes left, town in the upper 60 %; narrow: pipes vertical, town above `vb` |
| 4 "…It rang. At last." | lines 346–355 | back in the hall: the player turned toward the water where the voice came from; the water empty; the companion beside | player, companion; **no figure for `lf_toya`** (line 347: "there's no one on the water") | on 346 the player turns (a body turn, not a reveal of anyone); the water stays empty → hold; the companion's lines with their own small gesture | 346–355 | figures above `vb`; the empty water central |

Entry: after the guard (line 325) a dissolve from the bell hall map to shot 1. Continue: shot changes on 341, 344
and 346. Review: reached beats only. Skip: confirm; stops at the challenge (328)
and the choice (334). "Not yet": `!sequence ch5.bell end` and back to the hall. Return after ringing: end after
line 364 (the lake drawing back), then the existing `!fade out`, `!warp lf.sluice 19 16 up`, `!fade in`; Tokuji's
lines (368–372) are staged in the world (GESTURES.md: arms folded, looking at the lake, then the sniff).

---

**As built** (`src/ui/43e_seq_ch5.js`; the plan above holds except where said): line numbers are now 326 → the
first `narr`. The `!shake` that stood after `!sfx bell` is gone from the scene (a `#` note marks its place): the
validator rejects one inside a sequence and the runner never fires it there, so the gong shot's swing is the stone's
shake (this is the one line of the scene that is not an added op). `!shot gong` stands at `:ring`, before `!music -`
and the first bell, so the picture changes with the sound; `!shot town` before the second `!sfx bell`. The hall
shot is three-quarter from across the water (not the bell shot's framing again) and has four phases: `voice` (a ring
on the empty water — nobody), `turn` (you and your companion turn from the bell to the water), `aside` (the
companion's own gesture: Nao a hand to the ear, Mio a hand to the heart, Ren the lamp lifted, Suzu the hands
clasped) and `ebb` on line 364 (the water drawing back down the stones). The bell is green in shots 1–2, the green
shaken off its lip by the stroke in shot 2, gold in shot 4 (as the world shows it once rung). "Not yet" ends the
scene with the sequence open: it is disposed and the picture dissolves back into the chamber.

## 6. Chapter 6 — Tōya's four words read in context (`sa.toya_read`)

`src/content/ch6/52_scenes_climax.js` line 113; called from `sa.after_battle` (`:have`) or `sa.after_return`
once the player carries Kasane's folio (`item.sa_letter_kasane`). Inside: a challenge (117), conditional lines
for Ren (123–124) and for the bell (127–130, `?(item.lf_toya_bell)`), the companion's answer (133–136), then
`!take sa_letter_kasane` (138), `sa_toya_read`, `sa_main` 6.

**Why this moment.** *Importance:* the interpretive climax: "understand Tōya's last message — the vague promise
read in context" (docs/STORY.md). *Clarity:* two documents side by side, front and back, and Kasane's face as the
meaning turns. *View:* papers on the floor of the Heart, read close. *Branches:* the bell lines appear only if it
is carried; Ren's pun only with Ren; the four companions' answers.

**Sequence `ch6.toya`:** lines 114–137.

| Shot | Beat, place | Composition | Participants, appearance | One-time action → quiet hold | Lines, reveal | Safe areas |
|---|---|---|---|---|---|---|
| 1 "The folio" | lines 114–115 | two-shot in the Heart of the Archive among settled white pages: the player handing the folio to Kasane | player (look snapshot), Kasane (`kasane`: long grey hair, hood, pale robe) | on 114 the folio passes from the player's hands to Kasane's (≈0.9 s) — from here Kasane holds it (the inventory step comes later, line 138, and shows nothing new) → hold; 115 Kasane's eyes closed | 114, 115 | faces and hands top 55 % |
| 2 "Laid out on the floor" | line 116 and the challenge (117) | top-down insert: the folio's four-word note, the key slip and the council notice side by side on the stone floor | papers; the player's hand setting the last one down | on 116 the two papers set down beside the note (≈0.8 s) → hold through the challenge. The note shows its **back** (the side Kasane read for thirty years); its front is not visible yet | 116 | papers central |
| 3 "He was answering me" | lines 118–122 | close on Kasane, the turned note in their hands | Kasane | on 118 the note turned over (front visible: Kasane's own hand naming Tōya as the one who took the key, line 120 — shown as handwriting texture, not a legible caption) and Kasane's surprise; on 122 eyes close → hold | 118–122 (Ren's 123–124 over this hold) | face top half |
| 4 "Ting" (`?(item.lf_toya_bell)`) | lines 127–130 | insert: Kasane's hand ringing the small brass messenger's bell once, then holding it out | Kasane's hand, the bell | on 129 one ring: a single small ripple of light through the white pages (≈0.8 s) → hold; on 130 the bell offered back | 127–130 — absent when the bell is not carried | hand and bell central |
| 5 "Decide" | lines 131–137 | medium: Kasane facing the player and companion, the pages settled like snow around them | Kasane, player, companion | on 131 Kasane's head lowers (tired); on 132 lifts to face the player → hold; the companion's answer (133–136) with their own gesture | 131–137 | faces top 55 % |

Entry: from `sa.after_battle` / `sa.after_return` (the Heart map) by a dissolve to shot 1. Continue: shot changes on
116, 118, 127 (only with the bell), 131. Review: reached beats only (shot 4 never appears in review when the
bell lines did not play). Skip: confirm; stops at the challenge (117). Return: `!sequence ch6.toya end` after 137;
state lines 138–143; the world (the Heart) with Kasane present; the next steps are the choices in the Room of
Set-Down Memories (performed in the world). Found in passing (not changed): line 127 says the bell came from
**Tetsu** (テツ), but it is given by **Old Tokuji** (`lf.tokuji_story`, `src/content/ch5/22_main.js` line 339;
the item's description says so too) — a content question for the lead.

---

**As built** (`src/ui/43f_seq_ch6.js`): line numbers now one later than above (the scene's `!music` comes first).
Kasane kneels on the paper floor among the pages (their portrait over a pooled robe), since the papers are laid out
on the floor; you and your companion are seen from behind. Shot 3 turns the slip over on the line about its front
("The front says, in my own hand…", 121 now), not on the first line of the shot: the reveal waits for its line;
its first phase is Kasane's surprise as they read it. Shot 4 starts on "You take out the little bell…" (your open
hand with the bell), rings on "Kasane rings it once" and is held out to you again on "Please keep it" — all three
`?(item.lf_toya_bell)`. Shot 5 has a third phase, `aside`, before the companion's answer (Nao's hand to the
satchel's strap, Mio's hand held out, Ren's lamp raised, Suzu one finger up). The writing on the papers is marks
only: Kasane's neat hand as columns of small dashes, Tōya's four hurried words as four slanted ink blots. Line 127
now says Tokuji gave the bell (the content question above is settled in the source).

## 7. The prologue — manual advancement (§17.5)

Current (`src/ui/40_create.js` lines 44–117): six shots (`road`, `tea`, `cup`, `lantern`, `bridge`, `walker`;
7.5–8 s each, 46 s in all) drawn by `RB.prologueArt.draw(kind, c, w, h, t, k, o)`; `k = (now − t0) / s.d` drives
both the one-time action (the traveller's walk up the road, the fading lantern name, motes) and a fade to black
over the first and last eighth of each shot; at `k ≥ 1` it calls `next()`; Escape (`cancel`) skips the whole
prologue at once.

Rework (Phase E; HX44, HX46, HX50):

| Phase | Today | After |
|---|---|---|
| entrance | fade from black over `d/8` | a 400 ms dissolve from the previous shot (from black only for the first) |
| one-time action | `k` over the whole duration `d` | `k` over the action's own length (`road` 3 s of drifting lanterns, `tea` 2 s steam and the second cup set down, `cup` 2.5 s Hana's hand pausing over the second cup, `lantern` 4 s the name leaving letter by letter, `bridge` 3 s the motes leaving the broken end, `walker` 6 s the walk up the road); then `k` stays 1 |
| hold | none — the shot fades out and advances | indefinite: ambient motion only (steam, flicker, water); the caption stays |
| exit | automatic at `k ≥ 1`, through black | only on Next (one beat per press: reveal is instant here, so one press = next shot) with a 300 ms dissolve; the last Next leaves for creation once |
| Escape / Skip prologue | skips at once | opens a confirm ("Skip the prologue?"); confirmed → creation; Previous and Replay this shot available as in every sequence |
| identity | anonymous traveller (`RB.prologueArt` `LOOK`) | unchanged — creation still follows the prologue (§17.5) |

`tests/e2e/prologue.mjs` keeps working if `draw()` keeps its `k` signature; add the 60-second idle check.

---

## 7b. Faded passages: fill the gap where darkness is a shortcut (the owner's note of 2026-10-03)
The owner's note: lines readable over a black screen are good only "if darkness is truly the intent; otherwise
a cutscene should be played to fill in gaps where movement in the overworld/interior/exterior may feel
inadequate". Every `!fade out` that speaks in the dark (nine, found by code review; all readable since
6e6f079) is audited here. Each is either **darkness intended** (time truly passing at night, where the black
is the beat) or **a gap to fill** with an interlude/illustrated shot (`!interlude`, later the sequence player)
or with performed overworld movement (the actor system). Decide each with the same criteria as §0.

| Scene | What the dark covers | Status / plan |
|---|---|---|
| `sg.tide_wait` (ch2) | two hours' wait at Shiori's window | **Filled**: the tide interlude (`42b_interlude_tide.js`) |
| `sg.genzo_wind` (ch2) | the climb up the spiral stairs | **Filled** by the real map (`sg.lighthouse_top`). The one climbing line over the dark could become a short stairwell shot: candidate. |
| `sg.asahi_name` (ch2) | Asahi carving and polishing the nameplate, gulls outside | **Filled**: the sequence `ch2.plate` (`src/ui/43b_seq_ch2.js`) — the registry card on the glassworks counter, the hands at work as the plate takes shape, Asahi holding it up; the scene's fades are inside the sequence and left to the pictures. |
| `co.suzu_night` (ch3) | the cut to that night, Suzu alone on the inn veranda | Darkness as a scene change: **performed** on the veranda (her sitting, the night ambience) instead of a line over black. |
| `co.festival_begin` (ch3) | a whole morning of village labour (four lines) | **Gap**: an illustrated sequence (the terraces, the water gate, the cut firebreaks, the new rope on the tower). Candidate for joining Chapter 3's sequence. |
| `sb.quiet_morning` (ch4) | the storm night ending ("at some point the wind stopped") | **Darkness intended** (sleep and the storm's end); keep the black, possibly a single quiet window shot as the light returns. |
| `sb.next_day_inn` (ch4) | a night at the inn, lights on the mountain | Mostly time passing; a **single shot** of the window and the mountain lights would carry it better than black. |
| `lf.boat_to_tower` (ch5) | rowing across the still lake to the bell tower | **Filled**: the sequence `ch5.boat` (`src/ui/43e_seq_ch5.js`) — begun in the dark of the scene's own fade (the dark lifts over the picture and comes back before the warp, which brings the tower top in as written): a cut at the water's surface, Tokuji's boat in profile with you at the oars and your companion in the bow, the drowned lower town under it, the tower ahead with the green bell in its belfry; the stroke is the shot's one-time action. One composition: the passage has one line. "Not yet" starts nothing. |
| *(and any later `!fade out` added with lines in the dark)* | — | The sequence worker re-runs this audit from source and keeps the table current. |

## 8. Audit: personal questlines, long questlines, endings, The Pages We Keep (§17.2 last paragraph)

From the manifest (`storyline` personal:*, longquest:*, ending, pages). For each major beat: what happens
physically and emotionally, the overworld direction (primitive numbers from GESTURES.md §2), and whether the
tile view limits it enough to justify illustrated shots (**insert** = 1–3 shots inside the scene, same rules as
above). Decided inserts are CURATED in the manifest; the others are Phase D's to perform.

### 8.1 Suzu — A Seat Kept Until Spring (`co_suzu`, `src/content/ch3/45_scenes_suzu.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `co.suzu_night` (line 8, companion version, in the dark) | she tells the player about the lie on the inn's night | Suzu 25 lowered, 27 avert then face; player 1 | partly dark; performed |
| `co.suzu_c_square` / `co.suzu_c_inn` (lines 74 / 95, cameo version) | meeting again; the account book opened to "Hiro — one truth. Unpaid." | 31 at the reunion, then 16 reading her own ledger, 19 | the ledger line is narrated; no insert |
| `co.suzu_ask` (line 56) | the player asks Hiro about the seat | Hiro keeps working (blowpipe), 20 | performed |
| `co.suzu_truth` (line 121; both versions end here) | the faded ribbon untied and laid on the bench; the truth; Hiro's silence while the glass turns; the forehead cloth; "Paid in part" written in a shaking hand that does not fade; the globe marked トモエ | Suzu 28 then 27; Hiro works on (one hand on the blowpipe), 25 on "angry" | **yes — insert (CURATED Illustrated):** (1) the workbench: ribbon laid down beside the turning glass (on the narration line where she unties it); (2) Hiro's hand touching the forehead cloth (on that line); (3) the account book, the line written and staying (on that line); the globe close-up only when `item.co_globe` |

### 8.2 Nao — The Letter for Umi (`lf_nao`, `src/content/ch5/28_companions.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `lf.arrive` (`ch5/20_town.js`) | Nao's letter mentioned on arrival (`?(comp=nao)` quest start) | Nao 14 hand on the satchel strap | no |
| `lf.nao_umi_first` (line 11) | Umi's timetable office; Nao recognises the name | Umi 24 ("does NOT run!"), Nao 3 | no |
| `lf.nao_deliver` (line 35) | Nao asks instead of deciding; the letter read aloud; Umi's one-line reply; the old label peeled off into the satchel | Nao 27, 14 (envelope held out), Umi 16 reading; Nao writes slowly (bespoke) | the letter text is narrated in full; an optional single insert of the envelope (address rewritten three times) — not required |
| `lf.naoc` / `lf.naoc_after` (cameo versions) | the same delivery when Nao is not travelling with you | as above, Nao as an NPC | no |

### 8.3 Mio — A No, Out Loud (`lf_mio`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `lf.mio_start` (line 107) | Lanternfall's requests pile up on Mio | Mio 19, 26; the townspeople 9 | no |
| `lf.mio_refuse` (line 134) | the player's hand on her back; "I refuse"; Tadashi's stamp stopping in mid-air; her shaking hands | Mio 24 + 20 (firm, not a bow), then 26 ("my hands are shaking"), 32 (laugh); Tadashi 8 (the stamp held), 21 small; player: a hand toward her back (bespoke) | no — performed (CURATED); the stamp in mid-air reads at play scale if Tadashi faces sideways |
| `lf.mioc` / `lf.mioc_after` (cameo) | the same when Mio is not your companion | as above | no |

### 8.4 Ren — The Teacher's Face (`ren_ushio`; scenes in ch4 and ch6, journal in `src/content/zz_ren_quest.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `sb.charts_sketch` (`ch4/33_scenes_dungeon.js` line 154) | the pencil portrait of Ushio; Ren knows the words and the hand but not the face | Ren 16 (holding it further away, closer again — bespoke), 25 | a single insert of the sketch is optional (the text describes it) |
| `sa.ushio_grave` (`ch6/50_scenes_road.js` line 179) | the small stone, "One who disagreed to the very end"; Ren sets the lamp down and polishes it | Ren 15 (bend), the lamp placed (`!prop … place`) | no |
| `sa.shelf_ren` (`ch6/51_scenes_archive.js` line 423) | the folio labelled in Ushio's hand; Ren chooses; on the open branch Ushio's face surfaces on the paper and the voice fades but the face does not; glasses cleaned for a long time | Ren 16, 25, then bespoke glasses cleaning (the one use of 7 this scene) | **yes — insert (CURATED Illustrated), open branch only (`:ropen`):** (1) the folio opening; (2) the face surfacing on the paper (heavy eyebrows, eyes that vanish when it smiles, an ink smudge) on that narration line; (3) Ren with the glasses off. Other branches stay in the world |
| `sa.epi_ren_home` (`ch6/53_scenes_ending.js` line 160) | news of the teacher; the folio handed over unopened (when carried) | 14 handover, Ren 25 → 30 | no |

**As built** (`ch6.ren` in `src/ui/43f_seq_ch6.js`; the scene now begins at line 424): begun under `:ropen` after the
branch's `!set`, `!quest` and `!music` (they run once, as before), so "Take it back" falls through to it and "You
decide" reaches it by its `!goto ropen`; "Leave it" and the path without Ren never start it. Ended on the glasses line,
before `!music sorrow`. `open` (one phase): Ren's bust before the shelves, the folio's cover swinging open at their
chest. `face` (`surface`, `smile`, `fade`): the spread close; on the inside of the cover Ushio's filing slip as marks
and a red seal square (no writing); on the right-hand page the teacher's face (`sa_ushio`'s portrait turned to ink,
thresholded and fading below the chin) surfaces, smiles on Ushio's own line and keeps its smile while the voice's
light goes out on "The voice fades"; held through the challenge (`sa.ren_reply`). `ren` (`sad`, `smirk`, `glasses`):
close on Ren, sad, then the smirk at the eyebrows, then the glasses lifted off to their hands (the portrait drawn
without its glasses, eyes half-lidded and down) and the cloth going round one lens. Kept as a memory.

### 8.5 Long questline — A Fare Thirty Years Owed (`lq_fare`, `src/content/lq/30_fare.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `lq.fare_koji` (line 8), `lq.fare_book` (29) | the ferry's fare book with an unpaid line; the stamped scrap | Kōji 16, player 15 at the book | no |
| `lq.fare_tamae` (54), `lq.fare_fusa` (70) | the seal "Kamome" recognised; Sister Dove remembered | Tamae 31, Fusa 1 | no |
| `lq.fare_chigusa` (96) | Chigusa at the pass: the kettle left whistling; the story of the stormy night | Chigusa 25, the kettle not lifted (bespoke hold), 27 | no |
| `lq.fare_pay` (149) | coins laid before Kōji; the name written in the fare book, "Paid" | Chigusa 28 then 13 (coins), Kōji 16, Hana 32 | an optional insert of the fare book line "Chigusa — Paid" |
| `lq.fare_gull` (177) | the seal returned to Tamae; the kept cup given to the player | 14 handovers, Tamae 32 | no |

### 8.6 Long questline — The Name Nobody Calls (`lq_road`, `src/content/lq/40_road.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `lq.road_lantern` (9), `lq.road_loops` (26) | the blank lantern; the road that loops | player 4 at the shade | no |
| `lq.road_yasu1` (40), `lq.road_tetsu` (54), `lq.road_ume` (76), `lq.road_yasu2` (93) | the name gathered from three people | Yasu 12 (counting), Tetsu 10, Ume 13 (dried persimmon) | no |
| `lq.road_write` (114) | "Koharuno" on the shade; both names written at its edge | player 16 (writing), Yasu 2 | no |
| `lq.kh_tree` (155) | height marks on the persimmon trunk stopping at 12 | player 4 at the trunk | the marks are narrated; no insert |
| `lq.road_kayo` (238), `lq.road_home` (263) | Kayo calls the tree's name; cuts a new line "Kayo, 42"; gives the seed | Kayo 31 (calling), bespoke reaching/picking, 13 (the seed bag) | an optional insert of the trunk with the new line |

### 8.7 Endings (`src/content/ch6/52_scenes_climax.js`, `53_scenes_ending.js`, `src/content/pages/20_ending.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `sa.choose_mem`, `sa.choose_archive`, `sa.choose_kasane` (lines 145, 186, 223) | the three decisions (the memories; the Archive; Kasane) | Kasane 9, 25; companions answer by profile; the player 1 | no — decisions stay in the world (the choices are the content) |
| `sa.kasane_bye` (261) | "Off you go, then." | Kasane 30 | no |
| `sa.camp_descent` (`53_scenes_ending.js` line 10) | Isamu, Oyone and Kasane at the camp on the way down | Isamu's hand near the ear, Oyone 16 (the ledger) | no |
| `sa.epilogue` → `sa.epi_lf`, `sa.epi_sb`, `sa.epi_co`, `sa.epi_sg`, `sa.epi_rw` | the walk back through changed towns | each town's people by profile (Akari and Umi, Hoshino and Kanta, Hiro and Suzu, Wataru and Isamu, Hana and Kōji) | no — the denouement is the world itself |
| `sa.end_comp` (185) | at the bridge: Nao's label with only your name, Mio's empty bottle, Ren's two lamps, Suzu's ribbon tied round your wrist | 14 / 13 handovers by companion (CURATED Performed) | no; the gifts are staging only (no item is given) |
| `end.<comp>.core/reply/b/c`, `pages.retro`, `pages.unfinished` (`pages/20_ending.js`) | the ending extensions of the Living Company addendum | companion profiles; short | no |

### 8.8 The Pages We Keep (`src/content/pages/30_project.js`, topics `40_topics.js`)

| Scene | Beat | Overworld direction | Viewpoint limit? |
|---|---|---|---|
| `pages.offer` (line 19) | the companion proposes keeping pages of the roads | 9, 13 | no |
| `pages.p2q`, `pages.p2r`, `pages.camp`, `pages.p2ret` | planning and returning from an Atlas road | profiles | no |
| `pages.home3` (186), `pages.home` (269) | the card made at home: Nao's folded road card, Mio's two teacups, Ren's lantern page, Suzu's programme; pinned to the Lantern Hall or the teahouse wall; a copy for you | 13 presenting the card, 16 writing the caption (the `pages_choose` hook), Suzu's read-aloud choice | an optional single insert of the finished card per companion (the drawn object is the beat); routine Atlas returns get no cinematic (§17.2) |
| the `road.<comp>.*` topics and quiet moments (`40_topics.js`) | short road talk | Quiet by design / light profiles | no |
