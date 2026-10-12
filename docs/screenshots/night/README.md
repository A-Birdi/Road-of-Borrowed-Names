# The night sweep: every night and dark state, light On and Off

Made by `node tests/e2e/night_sweep.mjs` from the built `index.html` (synthetic sessions). Mean = mean brightness of the world
(0–255); crushed = share of near-black pixels; p90 = the brightest tenth starts at; ΔY = how far the player stands out from
the ground beside them; edge = the player's outline and shading against the ground's (×; a figure in its own light pool
can match the ground's brightness and still read). Contact sheets `night_NN.webp`: each place with Light and shadow On
above and Off below. A flag is a prompt to look, not a verdict: each flagged sheet was looked at.

| Map | State | On: mean / crushed % / p90 / ΔY / edge | Off: mean / crushed % / p90 / ΔY / edge | Flags |
|---|---|---|---|---|
| co.festival | own | 67 / 0 / 100 / 6 / 4.1 | 67 / 0 / 97 / 3 / 3.9 | — |
| co.festival_yearly | own | 68 / 0 / 99 / 3 / 3.9 | 67 / 0 / 97 / 0 / 4.3 | — |
| co.icehouse | own | 68 / 0 / 143 / 64 / 5.3 | 67 / 0 / 143 / 68 / 4.7 | — |
| co.kiln | own | 81 / 0 / 100 / 41 / 4.5 | 84 / 0 / 107 / 45 / 4.1 | — |
| co.kiln_core | own | 77 / 0 / 122 / 34 / 5.4 | 75 / 0 / 116 / 36 / 4.8 | — |
| co.lookout | own | 50 / 0 / 73 / 4 / 10.5 | 52 / 0 / 74 / 3 / 10.8 | — |
| hall.foyer | own | 82 / 0 / 146 / 8 / 9.2 | 77 / 0 / 134 / 11 / 9.8 | — |
| hall.w10f1 | own | 59 / 0 / 79 / 13 / 4 | 58 / 0 / 74 / 13 / 9.4 | — |
| hall.w10f2 | own | 64 / 0 / 89 / 12 / 7.7 | 63 / 0 / 84 / 13 / 7.3 | — |
| hall.w10f3 | own | 120 / 0 / 162 / 62 / 2.5 | 121 / 0 / 163 / 60 / 3.1 | — |
| hall.w1f1 | own | 51 / 0 / 82 / 12 / 5.8 | 49 / 0 / 76 / 13 / 5.8 | — |
| hall.w1f2 | own | 27 / 0 / 51 / 12 / 9.1 | 28 / 0 / 53 / 10 / 9.2 | — |
| hall.w1f3 | own | 49 / 0 / 74 / 14 / 8.7 | 50 / 0 / 72 / 16 / 9.4 | — |
| hall.w2f3 | own | 75 / 0 / 101 / 11 / 3.6 | 75 / 0 / 95 / 15 / 8.2 | — |
| hall.w3f1 | own | 55 / 0 / 81 / 11 / 8.4 | 54 / 1 / 73 / 10 / 9 | — |
| hall.w3f2 | own | 42 / 0 / 66 / 17 / 8.9 | 42 / 0 / 68 / 16 / 9 | — |
| hall.w3f3 | own | 48 / 0 / 72 / 15 / 8.1 | 47 / 0 / 70 / 17 / 8.1 | — |
| hall.w6f2 | own | 63 / 0 / 72 / 18 / 5.7 | 65 / 0 / 74 / 15 / 5.8 | — |
| hall.w6f3 | own | 53 / 0 / 70 / 14 / 8.8 | 52 / 0 / 69 / 14 / 8.8 | — |
| hall.w7f2 | own | 49 / 0 / 81 / 48 / 9 | 50 / 0 / 80 / 52 / 9.3 | — |
| hall.w8f1 | own | 77 / 0 / 97 / 7 / 7.7 | 73 / 0 / 88 / 14 / 9.3 | — |
| hall.w8f2 | own | 68 / 0 / 79 / 7 / 8.2 | 67 / 0 / 80 / 14 / 9.2 | — |
| hall.w9f2 | own | 75 / 0 / 95 / 10 / 9.2 | 76 / 0 / 93 / 9 / 9.4 | — |
| ko.garden | own | 100 / 0 / 121 / 51 / 5.7 | 104 / 0 / 127 / 53 / 5.2 | — |
| ko.grove | own | 66 / 0 / 102 / 35 / 8.1 | 69 / 0 / 105 / 37 / 7.7 | — |
| ko.roots1 | own | 83 / 0 / 102 / 49 / 5.9 | 88 / 0 / 107 / 55 / 5.4 | — |
| ko.roots2 | own | 73 / 0 / 96 / 25 / 9.2 | 77 / 0 / 103 / 24 / 9.3 | — |
| ko.roots3 | own | 57 / 0 / 74 / 20 / 2.1 | 60 / 0 / 78 / 20 / 2.2 | — |
| ko.seacave | own | 118 / 0 / 135 / 78 / 10.2 | 127 / 0 / 147 / 88 / 11 | — |
| kr.cave1 | own | 68 / 0 / 90 / 28 / 6.4 | 71 / 0 / 94 / 31 / 5.9 | — |
| kr.cave2 | own | 70 / 0 / 92 / 30 / 6.1 | 72 / 0 / 95 / 30 / 5.8 | — |
| kr.cave3 | own | 63 / 0 / 86 / 27 / 7.6 | 64 / 0 / 91 / 26 / 7.3 | — |
| kr.vigil | own | 52 / 0 / 71 / 0 / 4.5 | 55 / 0 / 76 / 4 / 4 | — |
| lf.bellhall | own | 62 / 0 / 88 / 37 / 9.3 | 64 / 0 / 92 / 42 / 10.1 | — |
| lf.stacks | own | 84 / 0 / 110 / 51 / 5.3 | 88 / 0 / 111 / 60 / 4.7 | — |
| lf.tower_low | own | 65 / 0 / 74 / 43 / 6.7 | 68 / 0 / 79 / 47 / 6.1 | — |
| lf.tower_mid | own | 72 / 0 / 102 / 47 / 5.9 | 74 / 0 / 99 / 54 / 5.5 | — |
| lf.tower_top | own | 58 / 0 / 103 / 15 / 9.4 | 58 / 0 / 108 / 16 / 9.7 | — |
| lf.tower_upper | own | 76 / 0 / 89 / 31 / 7.8 | 81 / 0 / 96 / 33 / 7.2 | — |
| mb.deadletter | own | 57 / 0 / 119 / 35 / 4.4 | 55 / 0 / 118 / 33 / 4.2 | — |
| mb.exchange | alt0 (mb_night) | 59 / 0 / 78 / 4 / 2.9 | 63 / 0 / 80 / 3 / 3.3 | — |
| mb.firstbridge | own | 52 / 0 / 79 / 31 / 10.4 | 51 / 0 / 79 / 33 / 11.2 | — |
| mb.firstbridge | alt0 (mb_bridge_named) | 72 / 0 / 116 / 32 / 10.3 | 71 / 0 / 109 / 36 / 11.1 | — |
| mb.kura | alt0 (mb_night) | 58 / 0 / 82 / 3 / 4.8 | 61 / 0 / 79 / 7 / 5.1 | — |
| mb.under1 | own | 59 / 0 / 91 / 32 / 4.7 | 62 / 0 / 100 / 33 / 4.6 | — |
| mb.under2 | own | 51 / 0 / 78 / 21 / 4.4 | 53 / 0 / 83 / 20 / 4.3 | — |
| mb.under3 | own | 51 / 0 / 71 / 6 / 10.1 | 53 / 0 / 75 / 4 / 11.2 | — |
| mp.bottom | own | 55 / 0 / 89 / 26 / 12.1 | 54 / 0 / 84 / 26 / 13.3 | — |
| mp.bottom | alt0 (mp_under_done) | 75 / 0 / 106 / 25 / 10.5 | 74 / 0 / 105 / 27 / 11.3 | — |
| mp.playhouse | alt0 (mp_fireworks&mp_fest_night&!mb2_done) | 83 / 0 / 113 / 32 / 5.4 | 84 / 0 / 113 / 32 / 5.9 | — |
| mp.playhouse | alt1 (mp_fest_night&!mb2_done) | 77 / 0 / 108 / 29 / 5.4 | 78 / 0 / 109 / 30 / 5.9 | — |
| mp.under1 | own | 58 / 1 / 76 / 15 / 10.3 | 60 / 1 / 79 / 17 / 11.4 | — |
| mp.under2 | own | 61 / 0 / 92 / 34 / 10.3 | 63 / 0 / 100 / 37 / 11 | — |
| mp.under3 | own | 53 / 0 / 80 / 47 / 9.9 | 53 / 0 / 77 / 51 / 10.7 | — |
| rw.cellar1 | own | 75 / 0 / 98 / 25 / 8.5 | 77 / 0 / 101 / 27 / 8 | — |
| rw.cellar2 | own | 67 / 0 / 83 / 19 / 8.8 | 70 / 0 / 88 / 20 / 9 | — |
| rw.hall | own | 59 / 0 / 132 / 24 / 2.6 | 51 / 0 / 114 / 26 / 2.5 | — |
| rw.mill0 | own | 50 / 0 / 76 / 13 / 5 | 52 / 1 / 80 / 15 / 5 | — |
| rw.mill1 | own | 65 / 0 / 113 / 30 / 10.4 | 63 / 0 / 103 / 34 / 11.3 | — |
| rw.mill2 | own | 48 / 0 / 93 / 35 / 10.7 | 47 / 0 / 96 / 30 / 11 | — |
| rw.village | alt0 (rw_night) | 72 / 0 / 96 / 23 / 2.1 | 74 / 0 / 95 / 22 / 2.2 | — |
| sa.conduits | own | 71 / 0 / 111 / 8 / 9.8 | 75 / 0 / 119 / 7 / 10.2 | — |
| sa.heart | own | 104 / 0 / 141 / 61 / 3.6 | 105 / 0 / 142 / 67 / 3.8 | — |
| sa.stacks | own | 122 / 0 / 152 / 54 / 3.5 | 129 / 0 / 164 / 64 / 3.3 | — |
| sa.study | own | 80 / 0 / 142 / 51 / 3.3 | 82 / 0 / 146 / 53 / 3.1 | — |
| sb.obs_charts | own | 65 / 0 / 105 / 12 / 4 | 65 / 0 / 106 / 13 / 3.8 | — |
| sb.obs_dome | own | 72 / 0 / 130 / 22 / 5.7 | 70 / 0 / 123 / 24 / 5.5 | — |
| sb.obs_gallery | own | 79 / 0 / 101 / 17 / 4.4 | 82 / 0 / 108 / 19 / 4.3 | — |
| sb.obs_hall | own | 96 / 0 / 126 / 23 / 4 | 100 / 0 / 135 / 24 / 4.3 | — |
| sg.da_entry | own | 50 / 0 / 67 / 26 / 4.3 | 48 / 0 / 62 / 29 / 4.3 | — |
| sg.da_reading | own | 54 / 0 / 80 / 34 / 1.9 | 51 / 1 / 68 / 35 / 2 | — |
| sg.da_sluice | own | 44 / 0 / 56 / 35 / 6.4 | 43 / 0 / 54 / 34 / 6.3 | — |
| sg.da_stacks | own | 47 / 0 / 63 / 33 / 6 | 47 / 0 / 62 / 37 / 7.3 | — |
| sg.da_vault | own | 51 / 0 / 69 / 23 / 4.5 | 50 / 0 / 63 / 26 / 4.8 | — |
| sg.harbor | alt0 (sg_evening) | 83 / 0 / 125 / 33 / 4.5 | 81 / 0 / 116 / 31 / 4.1 | — |
| yn.kettle | own | 106 / 0 / 123 / 20 / 8.7 | 109 / 0 / 129 / 21 / 8.4 | — |
| yn.vents1 | own | 102 / 0 / 120 / 30 / 5 | 105 / 0 / 126 / 29 / 4.8 | — |
| yn.vents2 | own | 99 / 0 / 120 / 12 / 10.1 | 102 / 0 / 126 / 13 / 9.2 | — |
| yn.vents3 | own | 96 / 0 / 113 / 30 / 4 | 99 / 0 / 119 / 35 / 3.7 | — |
