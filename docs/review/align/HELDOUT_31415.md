# AG-1 held-out review 1 (seed 31415, 60 lines)

Drawn with `node tools/review/align_compare.mjs --before <aligner at fb85958> --samples 60 --seed 31415 --changes`, before the last two fixes (sentence pairs of comparable size; articles after a preposition in a sense's head word), which this sample found: its worst line (5 W, sa.after_battle) is fixed since.

Tally: **66 better, 11 worse, 24 neutral or unclear** of 101 changed words.
Marks: **B** better than before, **W** worse, **N** neutral or unclear. Each mark is the developer's
judgement of one Japanese word's change against the whole line (code review, not a native speaker).

Format: `n. word [before → after]`, where `=` is a word pair (amber) and `~` a grammar pair (blue); `·` is none.

```

sg.ch2_end | I've said something gloomy. Forgive me — in front of a lighthouse, even gloomy talk sounds a little brighter.
  B 1. 話 =talk → ·
  B 2. 話 · → =talk

yn.agreement_write | What we've decided, we'll put on paper. What we haven't decided, we'll write down as not decided. Help us choose the words.
  B 3. 書こう =write → ·
  B 4. 書く · → =write

co.inv_lf_word_after | Since the bell, the whole town is full of "no". …To someone who can refuse, there are things you can finally hand over.
  N 5. ある =are → =there

sa.hut_shelf | Some come back for their things. Some don't. I can hardly throw them out.
  B 6. いかない ~don't → ·

sg.cove_wreck | Look closely at the grooves in the plate: the shape of Chidori-maru is still there.
  W 7. の ~of → ·

hall.w3.t6 | "Today, ring after the first cock-crow and before the second."
  N 8. にばんどり =cock-crow → =second

ko.myname_read | The line written on the wrapping of the first chopsticks you ever sold. The wrapping must have been opened and thrown away; only what the writer felt came this far.
  N 9. の ~of → ·
  W 10. だろう ~must → ·
  B 11. 来た · → =came

lf.akari_reply | "There's no need to hurry. The lamp is here. — Dad"
  B 12. に ~to → ·

sb.lamp_name | "Akari" is making light. …That wasn't a pun. It's a fact.
  B 13. ありません =wasn't → =wasn't~wasn't

sb.hoshino | "Lately the people at the office only ever say 'Certainly', whatever they're asked. It's a little strange."
  B 14. 言いません =say → =say~only

sb.lamp_name | Should I stay here and keep the lamp? Or go down the mountain and see her? What would you say?
  B 15. か ~Or → ·
  B 16. それとも · → ~Or

sb.hayate_post | The foxes' eyes are back to normal. They just watch from the snow. Like they used to.
  B 17. 中 · → ~from
  W 18. に ~to → ·

lf.yae_minutes | Afterwards, Kasane went up to the Archive on the mountain, and never came down to the town again.
  N 19. と ~and → ·

sa.heart_enter | A floor of paper floats over empty darkness.
  B 20. 上 · → ~over
  B 21. に · → ~over

yn.suzu_evening | Your place in the company is kept open. Come with us when we leave tomorrow.
  B 22. 空けて =leave → ·
  B 23. 出る · → =leave

co.nao_cameo | The hills' fault. Not mine.
  B 24. の · → ~mine

hall.w10.pg4 | "Until every light came back, the journey did not end."
  B 25. おわらなかった =end~not → =end~did,not

sb.charts_stove | You warm your hands at the stove. A little of the tiredness drains away.
  B 26. 前 · → ~at

cr.saka_shelf | On the shelf: an old straw hat, and a happi coat with the relay's emblem on it.
  N 27. 法被 =coat → =happi

co.fest_tokiwa | I'll write "this year". Not "that same year". Because this record is being written here, now.
  N 28. 本年 =this → =year
  N 29. 同年 =year → =same

hall.w10.to_w1 | The light of "The Lamp at the Crossroads".
  W 30. の ~of → ·

lq.fare_fusa | It's like leaving one lantern burning.
  B 31. です · → ~It's

hall.w7.i_lantern | You pick up the paper lantern from the boards.
  B 32. 提灯 =paper → =lantern

hall.w9.t1 | "One snowy day, an old man freed a crane caught in a trap."
  B 33. おじいさん =old → =man
  B 34. に · → ~in

hall.foyer_first | The keepers' hall… They say the apprentices put back a hundred lanterns, one tale at a time.
  N 35. 戻した =back → =put

hall.tsuru_final | I wanted to see this place once while my legs still work. The Cloudroad folk helped me up the hill.
  B 36. に ~to → ·
  B 37. に · → ~to

pets.bird.bird | You stay still a while, listening to the waves.
  B 38. 聞きながら =listening → =listening~while
  W 39. しばらく =while → =a

yn.kanae | When I put my feet in the footbath, stories come to me. …I have a new one. Would you read it? It's short.
  B 40. と · → ~When

sg.da_reading_first | A dry room. The floor is raised; the water hasn't got in. Desks and chairs on a carpet.
  B 41. 上 · → ~on

lf.setsu_after | Listen! "We're full, so I'm afraid not" — I managed to say it three times this morning!
  B 42. 今朝 =this → =morning

rw.lw_road_mill_sacks | But the rain's got at the tags on my sacks. Could you read me which one to take up today?
  N 43. で ~at → ·

sb.charts_stair_locked | We need a key. Doesn't the note on the desk say something?
  N 44. に ~on → ·
  B 45. か · → ~something

sb.quiet_mio | I can't say no when someone asks, can I. Middle of the night, a child with a fever — I go. Even to the next village. That part's fine. I do it because I want to.
  B 46. と ~with → ~when
  N 47. 断れない ~no → ~no,can
  N 48. でも ~Even → ·
  N 49. いれば ~when → ·
  N 50. の ~of → ·
  B 51. でも · → ~Even
  B 52. やってる · → =do

co.upper_wall | The passage through the terrace wall is crumbling. Move one stone and another slides down from above.
  B 53. 通り道 =through → =passage
  B 54. いる · → =is

sb.hoshino | And I couldn't keep the lamp alight.
  B 55. 守れなかった =keep → =keep~couldn't

sb.gallery_note | On a board on the wall, in Denji's heavy hand: "Opening the hatch. First, warm the handle well with fire. Turn it frozen and the shaft snaps. Next, three turns to the right. Last, one turn back to the left. Do NOT do it the other way round. Hoshino, that means you."
  N 56. に ~on → ~On
  N 57. に ~to → ·
  B 58. へ · → ~to

ko.ao_ask | It's all right. We won't tell anyone until you can read.
  B 59. 読める =read → =read~can

road.ren.quiet3 | Watching the flame in silence is part of a lantern keeper's work too.
  B 60. 灯守 =lantern → =keeper's
  B 61. の ~of → ~keeper's
  B 62. の · → ~of

sb.quiet_nao | Every one of them is proof that somebody was waiting for somebody. …Go on, laugh. Sentimental, right?
  B 63. か · → ~somebody
  B 64. か · → ~somebody

cs.view_seat | The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
  B 65. と ~and → ·
  B 66. と · → ~and
  B 67. 枯れ木 =bare → =tree

hall.w10.t2_board | Let's set the tablets on the waystones in the order we passed through.
  W 68. に ~on → ~in

ko.vb_tide_rule | The keepers' writing is cut into the stone.
  B 69. に · → ~into

mp.fest_stall_masu | Two bowls of hot udon. You eat them sitting on the bank together.
  B 70. 二人 =Two → ·

lf.nao_deliver | "Only, there's something I couldn't say that morning at the harbour. I'm sorry."
  B 71. ある =I'm → =there's

co.festival_begin | When the sun goes down, fire is set in thirty glass lanterns.
  B 72. と · → ~When

sa.after_battle | A message from Tami: the minutes kept both — your counter-argument and Tōya's objection. Both, properly recorded.
  W 73. 議事録 =minutes → ·
  W 74. あなた =your → ·
  W 75. の ~your → ·
  W 76. 反論 =counter-argument → ·
  W 77. 異議 =objection → ·

yn.rokubei_first | Rokubei, bath-keeper. I didn't think you'd really come. I heard the Cloudroad was running again and wrote clutching at straws.
  B 78. と ~and → ·
  N 79. 思い =think → ·
  N 80. だ ~was → ·

co.lw_road_embers | Good. As dry as it is, that really was dangerous.
  B 81. です ~was → ·

sg.kiyo_fish | Cheap, cheap! This morning's horse mackerel! The nets are back!
  B 82. 今朝 =This → =morning's
  B 83. の · → ~morning's
  B 84. 鯵 =horse → =mackerel

co.sayo | A travelling performer wrote asking for a slot, so I gave her one. When did we last have an outside act?
  B 85. 旅芸人 =travelling → =performer
  B 86. 芸人 =performer → ·

sea.lw_sg_trial_tamae | Heard about the sea trial! My guests have talked of nothing else all morning. The tea's on me, for your licence.
  N 87. の ~of → ·

cs.spool_tokuji | Thread left over from mending the rope ladder. I wound it small. Take it.
  N 88. 縄ばしご =rope → =ladder
  N 89. 余り =over → =left

ko.census_report | Because you've counted every day, you could tell something had changed.
  N 90. 毎日 =every → =day

hall.w6.tag_one | You take the one-mon tag from the box.
  B 91. から · → ~from

sg.da_raft | "Only fools go near water without a rope." The old man was right.
  B 92. 爺さん =old → =man

co.arrive | If people in the village of ash say nothing but "hai", don't be surprised. …Forgive me. That was a pun.
  B 93. が ~but → ·
  B 94. 驚かない =surprised~nothing → =surprised~don't

cr.guest_settle | The guest book: "Master Tatsu. One night. To arrive by dusk. If later, cancelled."
  N 95. 宿帳 =guest → =book

sg.tetsu_ferry | …Genzō's girl is coming on the next boat, I hear. The old man's been down three times since morning to check the board.
  N 96. だ ~is → ·
  B 97. 爺さん =old → =man's

rw.hall_suzu | Choose me and you'll never be bored on the road! Songs, plays and conjuring tricks included.
  B 98. しない =plays~never → ~never
  B 99. 芝居 · → =plays
  B 100. 手品 =conjuring → =tricks

sb.lw_road_slope | Mountain rules are shorter than the records' rules, and more exact.
  B 101. です · → ~are

```
