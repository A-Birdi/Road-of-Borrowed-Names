# Existing campaign decisions: four-companion coverage (addendum §7.6)

The audit covered every scene in `src/content/` with a player choice (listed with
`!choice`). This table keeps only the **meaningful decisions**: interpretation
choices, the long quest lines, personal-quest decisions, clearly different
solutions to a substantial obstacle, and ending decisions. Mechanical
confirmations (rest or not, open a shortcut, "go on / not yet", the tower's
gate levers, bell-signal answers, side-quest yes/no) are left out on purpose.

How it was checked: a script listed every branch of every choice with the
companions who have a conditioned line in it; then each scene was read branch by
branch (which companions have a conditioned line in
the branch the choice leads to, and whether that line is about the choice).

Legend: **✓** an existing line in that branch reacts to the choice or its
consequence (kept as is). **T** a deferred Company thought was added (shown on
Company › Companion as the current thought after the choice; `src/content/company/60_decisions.js`).
**R** the reply is now recorded forward (`!hook co_note`, placed at the start of
each reply's branch; older saves have no record and every line that uses it has
a neutral fallback). **—** the companion cannot be present (another companion's
personal story; the cameo versions carry their own lines). **n/a** no companion
line is needed (the choice is a question, not a decision with consequences).

| Decision (scene) | Durable record | Nao | Mio | Ren | Suzu | Added |
|---|---|---|---|---|---|---|
| Saltglass: who takes Wataru's confession to the harbourmaster (`sg.wataru_confront` self / us) | `sg_wataru_self`, `sg_wataru_confessed` | T | T | T | T | Before the choice all four react to the confession itself; neither branch had a companion line about who tells Ōmi. Thoughts for both outcomes (8). The Saltglass invitation's follow-up also speaks to the outcome when it replaces an unanswered question. |
| Saltglass: Nao on Isamu's letter (`sg.isamu_nao` should / quiet) | `sg_nao_isamu` | ✓ | — | — | — | Nao's own story; Nao answers both. |
| Cinder Orchard: the first line of the chronicle (`co.assembly` names / living / ume) | `co_asm_names`, `co_asm_living`, `co_asm_ume` | T | T | T | T | All four speak after the village decides (✓ for the outcome), none to the first line the player chose. Thoughts for each choice (12). |
| Cinder Orchard: Suzu's night — "maybe now it could reach him" / "you don't have to tell him" (`co.suzu_night` reach / push) | none → **R** `talk.d.suzu_night` | — | — | — | ✓ R | Suzu answers each reply in the scene. Recorded for later callbacks. |
| Cinder Orchard: at Hiro's workshop — say nothing / "Suzu came back to say this" (`co.suzu_truth` quiet / speak) | none → **R** `talk.d.suzu_truth` | ✓ | ✓ | ✓ | ✓ R | Hiro answers each; all four companions close the scene (`:finish`). Recorded. |
| Snowbell: Hoshino's lamp — stay / go / both (`sb.lamp_name`) | `sb_hoshino_stays` / `_goes` / `_both` | ✓ | ✓ | ✓ | ✓ | Every branch already has a line for each companion. Nothing added. |
| Snowbell: the snowed-in night — the heart of each conversation (`sb.quiet_<comp>`: nao push/listen/share, mio reassure/honest/share, ren recite/keep/hope, suzu which/wait/helped) | `var.sb_tone` (2 or 3 only; see note) → **R** `talk.d.quiet_night` | ✓ R | ✓ R | ✓ R | ✓ R | Each companion answers each reply. The exact reply is now recorded. |
| Snowbell: Ren and the teacher's sketch — keep it / keep going (`sb.charts_sketch`) | `sb_ren_ushio1` (both) → **R** `talk.d.ren_sketch` | ✓ (finding it) | ✓ | ✓ R | ✓ | The other three react to finding the sketch; Ren answers each reply. Recorded. |
| Lanternfall: ring the drowned bell (`lf.bell_touch`) | `lf_bell_rung` | ✓ | ✓ | ✓ | ✓ | Covered. (The Lanternfall invitation adds a question beforehand, and a follow-up if the bell rings first.) |
| Lanternfall: Nao delivers the letter / Mio refuses (`lf.nao_deliver`, `lf.mio_refuse`) | `lf_nao_done`, `lf_mio_done` | ✓ | ✓ | — | — | Own stories; played through challenges, no reply choice. |
| The Still Archive: the question put to Kasane (`sa.kasane_meet` asked / quarrels) | none | n/a | n/a | n/a | n/a | A question, answered by Kasane; all four react to her afterwards. |
| The Still Archive: Ren's folio, for Nao, Mio, Suzu — carry it home / leave it and tell Ren (`sa.shelf_ren` take / leave) | `sa_ren_carried` / `sa_ren_told` | ✓ / T | ✓ / T | — | ✓ / T | Lines existed only for "carry it home". Thoughts for "leave it and tell Ren" (3). |
| The Still Archive: Ren's own choice — take it back / leave it / you decide (`sa.shelf_ren` rtake / rleave / ryours) | `sa_ren_took` / `sa_ren_left` (the player's advice not kept) → **R** `talk.d.ren_folio` | — | — | ✓ R | — | Ren answers each. The advice given is now recorded. |
| The heart of the Hush: "You're wrong" / "I read Tōya's note" (`sa.heart_kasane` wrong / toya) | none → **R** `talk.d.sa_heart` | T R | T R | T R | T R | All four speak before the battle, none to the player's words. Recorded, with a thought for each reply (8). Older saves: no thought (nothing is claimed). |
| The ending: the memories — return them all / let each choose (`sa.choose_mem`) | `end_mem_return` / `end_mem_choose` | ✓ | ✓ | ✓ | ✓ | Covered in every branch. |
| The ending: the Archive — library / closed (`sa.choose_archive`) | `end_archive_library` / `end_archive_closed` | ✓ | ✓ | ✓ | ✓ | Covered. |
| The ending: Kasane — trial / keeper (`sa.choose_kasane`) | `end_kasane_trial` / `end_kasane_keeper` | ✓ | ✓ | ✓ | ✓ | Covered (the companion endings also follow these flags). |
| Long road A: Chigusa decides to go down (`lq.fare_chigusa`) | `lq_ally1` | ✓ | ✓ | ✓ | ✓ | No player reply; the companion's words decide her. Now also a Together memory (`story:lq1`) quoting the companion's resolve. |
| Long road B: what to tell Kayo — the tree / Yasu (`lq.road_kayo`) | `lq_kayo_going` (both) | ✓ | ✓ | ✓ | ✓ | All four speak to Kayo's fear, which both replies answer; the difference is small and already carried by Kayo's reply. Nothing added. |
| Long road B: the two names on the Koharuno shade (`lq.road_write`) | `lq_ally2` | ✓ | ✓ | ✓ | ✓ | Covered; now a Together memory (`story:lq2`) quoting the companion. |

Totals: 20 meaningful decisions audited; 31 new thoughts in four voices
(`sg_wataru` 8, `co_asm` 12, `ren_shelf` 3, `sa_heart` 8); 9 scenes / 23 reply
branches recorded forward. No outcome changed; no bond category added; nothing
inferred from completion alone (a thought appears only for the flag or reply
that was actually set).

## Notes
- `sb.quiet_*`: the morning lines test `var.sb_tone=1`, but the last reply of
  every conversation sets 2 or 3, so the tone-1 morning variant never plays.
  Found during the audit; not changed here (it is not a companionship rule and
  the fix belongs to the Snowbell scenes' owner). The forward record now keeps
  the actual reply.
- The recorded replies are used by: the Company thoughts above (`sa_heart`);
  What We Keep's callbacks for the snowed-in night (`quiet_night`: Nao share,
  Mio share, Ren keep, Suzu helped), Hiro's workshop (`suzu_truth`) and Ren's
  folio (`ren_folio`), each with the neutral line as the last variant.
  `suzu_night` and `ren_sketch` are recorded for later callbacks (the ending
  passages, The Pages We Keep); every consumer must keep a neutral line for
  saves without a record.
