# AG-1 held-out review 2 (seed 27182, 50 lines)

Drawn with `node tools/review/align_compare.mjs --before <aligner at fb85958> --samples 50 --seed 27182 --changes` on the final rules (nothing in the rules changed after it; the reviewed alignments added later change which lines differ, so the same seed now draws partly different lines).

Tally: **55 better, 6 worse, 19 neutral or unclear** of 80 changed words.
Marks: **B** better than before, **W** worse, **N** neutral or unclear. Each mark is the developer's
judgement of one Japanese word's change against the whole line (code review, not a native speaker).

Format: `n. word [before → after]`, where `=` is a word pair (amber) and `~` a grammar pair (blue); `·` is none.

```

as.streets_done | Next, would you write the first notices for the board? A village's rules only become rules once they're written up and posted.
  B 1. 初めて =the → ·
  N 2. です ~they're → ·

lf.arrive | …Odd. Too quiet. Last time, somebody was always arguing outside the offices.
  B 3. か · → ~somebody
  B 4. いた · → =was

sa.hut_shelf | A wooden top. A bamboo flute. One glove. A pair of very strong spectacles.
  N 5. の ~of → ·
  N 6. の · → ~of

cr.kanbe_first | I've had word from Yae in Lanternfall. So you really came.
  N 7. に ~in → ·

rw.hall_ren | As a keeper, I want to check the western lanterns. That's my first reason. The second… my teacher went west long ago and never came back.
  B 8. 西 =west → ·
  B 9. です · → ~That's
  N 10. 昔 =long → =ago
  B 11. 西 · → =west

as.festival | Everyone. This time last year, this was reed plain. Now there are roads with names, rules, and neighbours who've made up.
  N 12. 去年 =last → =year
  B 13. でした · → ~was
  B 14. と ~with → ·
  B 15. あって =was → ·

mp.fest_stall_masa | This year, Masaya and Masuya are rivals the friendly way.
  B 16. いる · → =are

sg.sota_start | Oh — you're helping the harbourmaster? I've got a favour to ask.
  B 17. ある =you're → ·

sg.b_suzu_lies | Yes. …Then what about a lie that puts no one in danger? One told to make someone smile — to keep them from crying?
  B 18. か · → ~someone

sa.toya_read | I'll wait in the Room of Set-Down Memories below. Let's begin with what was given into my keeping.
  N 19. の ~of → ·

lf.akari_post | Father says he'll come again in spring. He's got good at asking people to mind the lamp.
  B 20. に · → ~in
  N 21. に ~to → ·

lq.road_kayo_certainly | …We made her say yes. In this town, nobody can say no.
  W 22. 言えない =say~can → =say~can,no

mp.press_proofs | Yours is among them.
  B 23. の · → ~Yours

lf.lw_open_sg_fogbell | On foggy nights when the light can't reach, sound stands in for it.
  B 24. 届かない =reach → =reach~can't
  B 25. に · → ~On

gd.mb | Make eight hundred bridges into one? That'd wreck every delivery round.
  N 26. 八百 =eight → =hundred

cr.lamp6 | If you knew its name… Ask to see the relay's ledger at Oiwake's relay office.
  B 27. で · → ~at

lf.lw_open_sg_fogbell | …So it rings. That bell's been dumb for years. On foggy nights, it's needed.
  W 28. だ ~it's → ·

sg.causeway_fog | Ask Genzō at the lighthouse about the wind.
  B 29. に ~at → ·

hall.w10.pg4 | "Until every light came back, the journey did not end."
  B 30. 終わらなかった =end~not → =end~did,not

cr.relay2 | Next, from me, to Otaki at Nakayama: "Once the rain stops, send us carpenters. We'll fix the bridge."
  B 31. やんだら =stops → =stops~Once

cr.relay2 | The teahouse is opening again. Good. …The landslide's a rumour, then. If nobody saw it, I won't send anyone out. Understood.
  B 32. いない =is~nobody → ~nobody

lf.sluice_gate | The old sluice gate. Board upon board, stacked to close off the lake's outlet.
  B 33. 水門 =sluice → =gate

hall.w4.t4_diary | "I thought I'd go through the woods, but it was dark and frightening. So I spent the night at the teahouse."
  B 34. と ~and → ·

lq.kh_stone | Every one of their addresses is right here. It's only the people who got scattered.
  W 35. 配達先 =addresses → ·

rw.mochi_home | Mochi is curled up at Tomo's feet. Her tag has her name on it again.
  N 36. に ~on → ·
  N 37. ある =is → ·

sz.lw_sl_sz_mina_r3 | I'm looking for shells. Only empty ones! If someone lives inside, I don't take it!
  B 38. 中 · → =inside
  B 39. か · → ~someone
  B 40. いる =I'm → ·

hall.w9.t1 | "She said, "While I weave, please never look in," and wove wonderful cloth."
  B 41. と ~and → ·

hall.w8.end | Hisa comes back through the morning sun. Beside them is an old traveller with the box in his arms.
  B 42. 朝日 =morning → =sun

hall.w2.end | Who gave what to whom. Once you know all of it, it was a gentle tale.
  B 43. と · → ~Once

hall.w9.t6 | "She asked: keep the hearth fire going all night, and never look in while she weaves."
  W 44. 中 ~all → ·
  B 45. 見ないで · → =look

sg.cove_nets | Heavy. …Maybe we'll take our delivery fee in fish.
  B 46. 配達料 =delivery → =fee

sb.bn_suzu2 | Audiences in cold places laugh late. Their mouths are frozen. But once they laugh, they laugh for ages. Snowbell's that kind of house.
  B 47. が ~But → ·
  B 48. でも · → ~But
  B 49. 笑ったら =laugh → =laugh~once

ko.otoha_tellings | "Every leaf goes home." A greedy promise. It is mine.
  B 50. の · → ~mine

wp.reflect_ren | I was rereading the record of our game. One last kana, and a word calls up the next. A curious rule.
  N 51. の ~of → ·
  N 52. の · → ~of

hall.w5.t1 | "The east house said, "It's the west's fault," and the west house said, "It's the east's.""
  B 53. と ~and → ·

cr.deliver | …I'm glad it arrived. There's no such thing as a letter too late. Probably.
  B 54. 遅すぎる =late → =late~too

co.suspect | Everything here walks around the same hole. Same feeling as a letter with the address missing.
  B 55. と ~with → ·

wp.reflect_nao | That's why it held. We were both reading the same map.
  W 56. だ ~That's → ·

co.bell_ring | Oh — a rope! …It feels like I've been waiting for this. Odd.
  B 57. 気 · → =feels
  B 58. する · → =feels

co.kotaro | Hey, hey, travellers! You here for the festival? Kids only get one cup of amazake. Not fair, right?
  N 59. の ~of → ·

mb.dispute_after | Under the Exchange there's the office that keeps undeliverable letters. Ask Yoshi. For old addresses, there's nowhere better.
  N 60. 宛先不明 =addresses → ·
  N 61. に ~For → ·
  B 62. です · → ~there's

pt.bench_two | The click of the pieces mixes with the sound of the harbour's waves. This morning, too, Fuku wins.
  B 63. 今朝 =This → =morning

mb.yoshi_idle | I never throw away a letter that couldn't be delivered. The addressee might come for it one day.
  B 64. 届かない =delivered~never → =delivered~couldn't
  B 65. 捨てません =away~couldn't → =throw~never

yn.mio_dawn | It's the letter Kikue sent after my mother died. "Come to Steamhollow and learn." …Reedwake needed me. But Kikue had been so kind. I couldn't say I'd go, and I couldn't say I wouldn't.
  B 66. 来た =Come → ·
  B 67. いらっしゃい · → =Come
  B 68. が ~But → ·
  B 69. いないと =been → ·
  B 70. でも · → ~But

kr.lw_road_steps_marks | Kumazō is walking among the cedars with his axe on his shoulder, marking the trunks.
  N 71. に · → ~on
  N 72. に ~on → ·

sa.b_mio1 | Mountain air: good for the lungs, bad for the knees. …Remember I said so. I'll be complaining later.
  W 73. 言う =said → ·
  B 74. から ~so → ·

sa.shelf_saltglass | "Saltglass — transferred from the Drowned Archive. The harbour's names, complete set." Stamped: "Returned".
  B 75. 沈んだ =set → ·
  B 76. 一式 =complete → =set

co.tablet3 | In the top chamber you find the last tile. Something has been added in the margin, in a different hand.
  B 77. か · → ~Something
  B 78. ある · → =been

kr.hisae_after | With the lamps lit, the nights are short. A mercy for an old woman.
  N 79. と ~With → ·

hall.w8.t8_board | "A child's straw sandals should leave small prints."
  B 80. わらじ =straw → =sandals

```
