# The night sweep: every night and dark state, light On and Off

Made by `node tests/e2e/night_sweep.mjs` from the built `index.html` (synthetic sessions). Mean = mean brightness of the world
(0–255); crushed = share of near-black pixels; p90 = the brightest tenth starts at; ΔY = how far the player stands out from
the ground beside them; edge = the player's outline and shading against the ground's (×; a figure in its own light pool
can match the ground's brightness and still read). Contact sheets `night_NN.webp`: each place with Light and shadow On
above and Off below. A flag is a prompt to look, not a verdict: each flagged sheet was looked at.

| Map | State | On: mean / crushed % / p90 / ΔY / edge | Off: mean / crushed % / p90 / ΔY / edge | Flags |
|---|---|---|---|---|
| co.festival | own | 67 / 0 / 100 / 6 / 4.1 | 67 / 0 / 98 / 3 / 4.3 | — |
| co.festival_yearly | own | 68 / 0 / 100 / 2 / 4.3 | 68 / 0 / 97 / 1 / 4.3 | — |
| co.icehouse | own | 68 / 0 / 143 / 63 / 5.2 | 67 / 0 / 144 / 68 / 4.7 | — |
| co.kiln | own | 81 / 0 / 100 / 42 / 4.2 | 84 / 0 / 107 / 46 / 4.2 | — |
| co.kiln_core | own | 77 / 0 / 121 / 34 / 5.4 | 75 / 0 / 117 / 37 / 4.9 | — |
| co.lookout | own | 50 / 0 / 72 / 4 / 10.5 | 52 / 0 / 75 / 3 / 10.8 | — |
| hall.foyer | own | 82 / 0 / 146 / 9 / 9.2 | 77 / 0 / 134 / 10 / 9.7 | — |
| hall.w10f1 | own | 59 / 0 / 79 / 13 / 4 | 58 / 0 / 74 / 13 / 9.4 | — |
| hall.w10f2 | own | 64 / 0 / 88 / 14 / 7.6 | 63 / 0 / 84 / 12 / 7.2 | — |
| hall.w10f3 | own | 119 / 0 / 162 / 62 / 2.5 | 121 / 0 / 163 / 60 / 3 | — |
| hall.w1f1 | own | 51 / 0 / 82 / 10 / 5.8 | 49 / 0 / 76 / 13 / 5.8 | — |
| hall.w1f2 | own | 27 / 0 / 51 / 12 / 9.1 | 28 / 0 / 53 / 10 / 9.2 | — |
| hall.w1f3 | own | 49 / 0 / 73 / 14 / 8.7 | 50 / 0 / 72 / 16 / 9.4 | — |
| hall.w2f3 | own | 75 / 0 / 101 / 11 / 3.6 | 75 / 0 / 95 / 16 / 8.2 | — |
| hall.w3f1 | own | 55 / 0 / 81 / 10 / 8.3 | 54 / 1 / 73 / 10 / 9 | — |
| hall.w3f2 | own | 42 / 0 / 66 / 17 / 8.9 | 42 / 0 / 68 / 15 / 9 | — |
| hall.w3f3 | own | 48 / 0 / 72 / 15 / 8.2 | 47 / 0 / 70 / 17 / 8 | — |
| hall.w6f2 | own | 63 / 0 / 72 / 18 / 6 | 65 / 0 / 74 / 16 / 6.2 | — |
| hall.w6f3 | own | 53 / 0 / 70 / 14 / 8.8 | 52 / 0 / 69 / 14 / 8.3 | — |
| hall.w7f2 | own | 49 / 0 / 81 / 50 / 9 | 50 / 0 / 80 / 52 / 9.3 | — |
| hall.w8f1 | own | 77 / 0 / 97 / 7 / 7.7 | 73 / 0 / 88 / 14 / 9.3 | — |
| hall.w8f2 | own | 68 / 0 / 79 / 7 / 8.2 | 67 / 0 / 80 / 14 / 9.2 | — |
| hall.w9f2 | own | 75 / 0 / 95 / 10 / 9.2 | 76 / 0 / 93 / 9 / 9.4 | — |
| ko.garden | own | 100 / 0 / 122 / 51 / 5.8 | 104 / 0 / 127 / 53 / 5.2 | — |
| ko.grove | own | 66 / 0 / 102 / 35 / 8.1 | 69 / 0 / 105 / 37 / 7.7 | — |
| ko.roots1 | own | 83 / 0 / 102 / 49 / 5.9 | 88 / 0 / 107 / 55 / 5.4 | — |
| ko.roots2 | own | 73 / 0 / 96 / 25 / 9.3 | 77 / 0 / 103 / 25 / 9.3 | — |
| ko.roots3 | own | 57 / 0 / 74 / 20 / 2.1 | 60 / 0 / 77 / 21 / 2.2 | — |
| ko.seacave | own | 118 / 0 / 137 / 78 / 10.2 | 127 / 0 / 145 / 88 / 11 | — |
| kr.cave1 | own | 68 / 0 / 91 / 28 / 6.2 | 71 / 0 / 93 / 31 / 5.9 | — |
| kr.cave2 | own | 70 / 0 / 92 / 30 / 6.2 | 72 / 0 / 94 / 29 / 5.8 | — |
| kr.cave3 | own | 63 / 0 / 88 / 28 / 7.6 | 64 / 0 / 89 / 26 / 7.1 | — |
| kr.vigil | own | 52 / 0 / 71 / 3 / 4.2 | 54 / 0 / 76 / 1 / 4.1 | — |
| lf.bellhall | own | 63 / 0 / 89 / 38 / 9.5 | 63 / 0 / 92 / 40 / 9.1 | — |
| lf.stacks | own | 85 / 0 / 111 / 53 / 5.4 | 87 / 0 / 110 / 59 / 4.8 | — |
| lf.tower_low | own | 65 / 0 / 74 / 43 / 6.8 | 68 / 0 / 79 / 47 / 6.1 | — |
| lf.tower_mid | own | 73 / 0 / 103 / 47 / 6 | 73 / 0 / 99 / 53 / 5.5 | — |
| lf.tower_top | own | 58 / 0 / 103 / 17 / 9.5 | 58 / 0 / 108 / 14 / 9.8 | — |
| lf.tower_upper | own | 76 / 0 / 90 / 31 / 7.9 | 80 / 0 / 96 / 32 / 7.3 | — |
| mb.deadletter | own | 57 / 0 / 119 / 36 / 4.6 | 55 / 0 / 118 / 32 / 4.2 | — |
| mb.exchange | alt0 (mb_night) | 60 / 0 / 80 / 3 / 2.9 | 63 / 0 / 80 / 2 / 3.3 | — |
| mb.firstbridge | own | 52 / 0 / 79 / 31 / 10.4 | 51 / 0 / 79 / 33 / 11.2 | — |
| mb.firstbridge | alt0 (mb_bridge_named) | 72 / 0 / 116 / 31 / 10.3 | 71 / 0 / 109 / 34 / 11.2 | — |
| mb.kura | alt0 (mb_night) | 58 / 0 / 83 / 4 / 4.8 | 60 / 0 / 77 / 5 / 5.3 | — |
| mb.under1 | own | 60 / 0 / 94 / 33 / 4.7 | 62 / 0 / 97 / 34 / 4.4 | — |
| mb.under2 | own | 51 / 0 / 80 / 22 / 4.3 | 53 / 0 / 83 / 20 / 4.3 | — |
| mb.under3 | own | 51 / 0 / 71 / 6 / 9.9 | 53 / 0 / 75 / 4 / 11 | — |
| mp.bottom | own | 54 / 0 / 89 / 24 / 12.6 | 53 / 0 / 83 / 28 / 11.9 | — |
| mp.bottom | alt0 (mp_under_done) | 75 / 0 / 106 / 26 / 10.6 | 74 / 0 / 105 / 27 / 11.3 | — |
| mp.playhouse | alt0 (mp_fireworks&mp_fest_night&!mb2_done) | 83 / 0 / 113 / 33 / 5.4 | 84 / 0 / 113 / 31 / 5.8 | — |
| mp.playhouse | alt1 (mp_fest_night&!mb2_done) | 77 / 0 / 109 / 29 / 5.4 | 78 / 0 / 108 / 31 / 5.8 | — |
| mp.under1 | own | 58 / 1 / 76 / 16 / 10.5 | 60 / 1 / 79 / 18 / 11.3 | — |
| mp.under2 | own | 61 / 0 / 92 / 35 / 10 | 63 / 0 / 100 / 35 / 11.3 | — |
| mp.under3 | own | 53 / 0 / 79 / 46 / 9.8 | 53 / 0 / 77 / 49 / 10.5 | — |
| rw.cellar1 | own | 75 / 0 / 100 / 25 / 8.7 | 77 / 0 / 99 / 26 / 8.1 | — |
| rw.cellar2 | own | 68 / 0 / 83 / 20 / 9.2 | 70 / 0 / 88 / 19 / 8.7 | — |
| rw.hall | own | 59 / 0 / 132 / 21 / 2.5 | 51 / 0 / 114 / 28 / 2.5 | — |
| rw.mill0 | own | 51 / 0 / 76 / 15 / 5.1 | 52 / 1 / 80 / 13 / 5 | — |
| rw.mill1 | own | 65 / 0 / 116 / 31 / 10.4 | 63 / 0 / 103 / 33 / 10.8 | — |
| rw.mill2 | own | 48 / 0 / 95 / 37 / 10.7 | 47 / 0 / 94 / 28 / 11.1 | — |
| rw.village | alt0 (rw_night) | 72 / 0 / 96 / 23 / 2.1 | 73 / 0 / 94 / 24 / 2.2 | — |
| sa.conduits | own | 71 / 0 / 111 / 9 / 9.8 | 74 / 0 / 119 / 6 / 10 | — |
| sa.heart | own | 104 / 0 / 141 / 68 / 3.5 | 105 / 0 / 142 / 66 / 3.7 | — |
| sa.stacks | own | 122 / 0 / 152 / 57 / 3.6 | 129 / 0 / 164 / 57 / 3.4 | — |
| sa.study | own | 81 / 0 / 145 / 52 / 3.2 | 81 / 0 / 145 / 54 / 3 | — |
| sb.obs_charts | own | 65 / 0 / 106 / 12 / 3.9 | 65 / 0 / 103 / 11 / 3.8 | — |
| sb.obs_dome | own | 72 / 0 / 132 / 18 / 4.1 | 69 / 0 / 121 / 17 / 4.2 | — |
| sb.obs_gallery | own | 79 / 0 / 103 / 20 / 4.4 | 82 / 0 / 106 / 17 / 4.4 | — |
| sb.obs_hall | own | 97 / 0 / 126 / 24 / 4.4 | 100 / 0 / 135 / 25 / 3.7 | — |
| sg.da_entry | own | 50 / 0 / 67 / 27 / 4.4 | 48 / 0 / 61 / 26 / 4.1 | — |
| sg.da_reading | own | 54 / 0 / 80 / 32 / 2 | 51 / 1 / 68 / 36 / 2 | — |
| sg.da_sluice | own | 44 / 0 / 56 / 33 / 6.1 | 43 / 0 / 53 / 35 / 6.6 | — |
| sg.da_stacks | own | 47 / 0 / 63 / 35 / 7 | 47 / 0 / 62 / 34 / 6 | — |
| sg.da_vault | own | 50 / 0 / 68 / 23 / 4.5 | 50 / 0 / 63 / 23 / 4.4 | — |
| sg.harbor | alt0 (sg_evening) | 82 / 0 / 122 / 31 / 4.3 | 81 / 0 / 118 / 29 / 4.1 | — |
| yn.kettle | own | 106 / 0 / 123 / 21 / 8.8 | 109 / 0 / 129 / 20 / 8.3 | — |
| yn.vents1 | own | 102 / 0 / 120 / 29 / 4.7 | 105 / 0 / 126 / 30 / 4.7 | — |
| yn.vents2 | own | 99 / 0 / 120 / 11 / 10.3 | 101 / 0 / 126 / 15 / 8.9 | — |
| yn.vents3 | own | 96 / 0 / 113 / 33 / 4 | 98 / 0 / 119 / 32 / 3.7 | — |
