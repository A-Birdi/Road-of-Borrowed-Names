// VA-1 VS01: the frozen audition corpus, case by case (docs/future/voice/VA1_ADDENDUM.md §05–§09). Each case names a
// spoken line of the game by its stable key (tools/voice/lines.mjs: the scene and a hash of the line's Japanese) and
// says why it was chosen; tools/voice/corpus.mjs resolves, checks and writes the corpus. Lines from the opening
// chapters are preferred (the gallery is spoiler-safe by default); later ones carry their spoiler level.
// A case with `fixture` is a noncanonical audition fixture: written for the audition only (game markup, furigana
// included, so its reading is recorded the same way), labelled as such, never added to the game.
// A companion's line authored for "whoever travels with you" (`comp`, with `comp=<name>`) is that companion's line.
export const CASES = {
  // ---- the female narrator (§06): one adult storyteller across sixteen deliveries ----------------------------------
  N01: { key: 'mb.arrive#0d3c70ae76', why: 'Arriving in Manybridge, "the city of eight hundred bridges": an inviting introduction to a new place, the warmest welcome the narration offers.' },
  N02: { key: 'rw.mio_first#167cceb1a6', why: 'Mio turning each bottle to face the same way while she talks: an ordinary action, no drama.' },
  N03: { key: 'rw.road_lantern#e5c6b4bb38', why: 'Touching the blank lantern paper and feeling the old letters inside it: the first discovery of the journey.' },
  N04: { key: 'rw.village_first#176a1a2a8f', why: 'Reedwake on arrival: river, nets, hammers; three unhurried images.' },
  N05: { key: 'rw.mr_enter#9ba348bae0', why: '"Just as Tsuru said, the worriers got here first": dry amusement carried by the writing.' },
  N06: { key: 'rw.mr_narrows#70ac35955b', why: '"Maybe a song would change the echo": a tentative idea, a question in narration.' },
  N07: { key: 'rw.mr_narrows#9e01db6a1c', why: 'Stepping between the cliffs, footsteps returning many times over, voices pressing: quiet tension.' },
  N08: { key: 'co.bell_ring#f43542d3ae', why: 'The alarm bell: people jump off ladders and run for the channel without a word. Brief, energetic, clear.' },
  N09: { key: 'sb.fuki_notebook#f09fa6c171', why: '"You have the rules in your head. Off to the bell-post": forward movement and purpose.' },
  N10: { key: 'co.upper_stone#726f6ff830', why: 'The carved words "Fire comes. Fire goes. Stone remains, and says nothing": solemn weight without melodrama.' },
  N11: { key: 'sa.shelf_grief3#254d32a017', why: '"Griefs come in different sizes; the shelves are all the same size": controlled sorrow. A late place, no plot in the line itself.' },
  N12: { key: 'rw.mr_mio#ff28dafedc', why: 'Mio puts a cup in Sae\'s hands and speaks to her, meeting her eyes: compassion in the narration\'s own restrained way.' },
  N13: { key: 'rw.tea_cups#261858cdca', why: 'Two teacups, one chipped from years of the same hands: private reflection.' },
  N14: { key: 'cr.lw_turns#4bbd46f0a7', why: 'The child bursts out laughing at the waystone, the parent relieved: happiness and release.' },
  N15: { key: 'rw.seeoff#83cc997a4b', why: 'Morning; a few people have come to see you off at the start of the lantern road: leaving home, hope and loss together.' },
  N16: { key: 'mb.exchange_first#bb98c9ce8c', why: 'The Tally Exchange explained: what it is and what merchants do there, in clauses.' },

  // ---- the companions (§07): five distinct lines, five intentions each ---------------------------------------------
  SUZU01: { key: 'sg.road_bench#a8104441f0', why: '"Let\'s sit a moment. A deep breath before the curtain goes up": ordinary friendly company.' },
  SUZU02: { key: 'rw.suzu_first#9fa6f75f9e', why: 'Her barker\'s opening: "Roll up, traveller! … The price — one smile!"' },
  SUZU03: { key: 'sg.arrive#832c48e8c8', why: '"Odd. I can\'t hear the market": the performance drops; she notices something wrong.' },
  SUZU04: { key: 'rw.hall_suzu#7ee78bfa29', why: 'The one lie she never finished: a plainly spoken admission.' },
  SUZU05: { key: 'sg.check_clues#e27367500d', why: '"A lie told to balance the books never stays one lie. …Let\'s go and see him": a rally into shared action.' },
  NAO01: { key: 'rw.mr_nao#a5bc3a90e9', why: 'The other way up: behind the shed, past the tall reeds, an animal track. A route, clearly given.' },
  NAO02: { key: 'rw.b_nao1#439cf06928', why: '"Every road in three days. …That\'s a lie. Two": understated.' },
  NAO03: { key: 'rw.mr_nao2#4ae937dd39', why: '"If anything happens up there, run. Running isn\'t losing": an actionable warning.' },
  NAO04: { key: 'sg.ch2_end#eb01825c6c', why: 'The letter they decided not to deliver: "Half of me still thinks so."' },
  NAO05: { key: 'rw.depart#8d9ba77c31', why: '"Leave the road to me. You decide where we\'re going": a firm invitation to go together.' },
  MIO01: { key: 'rw.mr_mio#f309384cff', why: 'Why a warm cup helps more than the medicine: competent care, explained.' },
  MIO02: { key: 'rw.mr_mio2#c040763c1a', why: '"Come back in one piece. I\'m worried about my stock": small warm teasing.' },
  MIO03: { key: 'rw.mio_first#91376b0f89', why: 'Blank labels on medicines that look alike, "dangerous to mix up": urgent, composed, specific.' },
  MIO04: { key: 'sg.ch2_end#3ce3dd453e', why: '"I can\'t say no when someone asks": personal responsibility, plainly.' },
  MIO05: { key: 'rw.mr_mio#843f4387a2', why: '"Something real is happening. But it isn\'t your fault": reassurance with conviction.' },
  REN01: { key: 'sg.road_marker#aa19fdaf1f', why: 'An old waystone: "Letters cut in stone last far longer than paper." Considered, reflective.' },
  REN02: { key: 'rw.b_ren1#cff2bf7a69', why: 'The handle polished again, the boots "tomorrow… I say that every day": dry warmth.' },
  REN03: { key: 'sg.crate_glued#2cb3563fda', why: 'The lighthouse oil marked for disposal: "As a keeper I can\'t let that pass". Controlled intensity.' },
  REN04: { key: 'sg.ch2_end#d933dbeed3', why: 'Every word of the teacher\'s lessons, but not the face: "Tonight, for the first time, it frightened me."' },
  REN05: { key: 'rw.hall_ren#ff041a4238', why: 'The promise: beside you to the journey\'s end, "even when we\'re lost".' },

  // ---- the player, Voice A and Voice B on the same five texts (§07) -------------------------------------------------
  PLAYER_LINE_01: { key: 'co.suzu_ask#b9287ba3cc', why: '"The empty seat in the square — who is it for?" A natural question contour.' },
  PLAYER_LINE_02: { key: 'sg.b_mio_temper#061f7e139c', why: '"Genzō looked rather pleased, actually": light pleasure, no caricature.' },
  PLAYER_LINE_03: { key: 'sg.da_boss#8f63375065', why: '"Those letters belong to the people of the harbour": committing to the confrontation.' },
  PLAYER_LINE_04: { key: 'sb.quiet_nao#154af5001b', why: 'The fear of forgetting someone\'s name, said in a quiet moment: a vulnerable admission.' },
  PLAYER_LINE_05: { key: 'co.kotaro#baec657ab3', why: '"You did nothing wrong. A bell\'s there to be rung": warm reassurance to a child.' },

  // ---- the NPC range (§08): twelve casting targets, two lines each ----------------------------------------------------
  // identity: what the game itself establishes about the speaker (age band, gender/pronouns, work), and what it does not
  NPC01_1: { key: 'sb.kanta#1c4aa2f483', speaker: 'chiyo', identity: 'Chiyo: a child (look.size child), a girl ("her win", Rokuta of Chiyo), the snow-sculpture contest at Snowbell.', why: 'Her red-berry lamp is still there: discovery.' },
  NPC01_2: { key: 'sb.chiyo#09da9a5aa3', speaker: 'chiyo', why: '"I won! But really… I\'d be happier if the real lamp came on": disappointment, settled.' },
  NPC02_1: { key: 'ko.ao_lesson#e9fd5a5933', speaker: 'ko_ao', identity: 'Ao: a child (look.size child; "the only big child", Nana three years younger), a boy ("Ao takes a leaf from his basket", narration), Kotonoha\'s leaf-picker.', why: 'ね ends in a loop, れ does not: an earnest explanation of what he has just learnt.' },
  NPC02_2: { key: 'ko.ao_post#e7cb30989b', speaker: 'ko_ao', why: '"I read one today. It said おかえり": good news he is bursting to tell (and to keep secret).' },
  NPC03_1: { fixture: 'あの 、 {配達|はいたつ} の {見習|みなら}い です 。 この {手紙|てがみ} 、 こちら で {合|あ}って います か 。', en: 'Um, I\'m a trainee courier. Is this the right place for this letter?', speaker: 'persona_npc03', identity: 'Audition persona, not a game character: the game has no adolescent girl whose age is established.', why: 'Polite nervousness.' },
  NPC03_2: { fixture: '{全部|ぜんぶ} 、 {時間|じかん} どおり に {届|とど}けました ！ …… よかった 。', en: 'I delivered every one on time! …Thank goodness.', speaker: 'persona_npc03', why: 'Proud relief.' },
  NPC04_1: { fixture: '{釘|くぎ} は 、 {先|さき} に {穴|あな} を {開|あ}けて から {打|う}つ ん です 。 そう しない と 、 {板|いた} が {割|わ}れます 。', en: 'You drill the hole first, then drive the nail. Otherwise the board splits.', speaker: 'persona_npc04', identity: 'Audition persona, not a game character: the game has no adolescent boy apprentice whose age is established.', why: 'Routine practical explanation.' },
  NPC04_2: { fixture: 'あ 、 すみません 。 {今|いま} の は {間違|まちが}い です 。 {三寸|さんずん} じゃ なくて 、 {二寸|にすん} でした 。', en: 'Oh, sorry. That was wrong. Not three sun — two.', speaker: 'persona_npc04', why: 'An embarrassed correction (with counters).' },
  NPC05_1: { fixture: 'いらっしゃいませ 。 {今朝|けさ} とれた {野菜|やさい} です よ 。 どうぞ 、 {見|み}て いって ください 。', en: 'Welcome! These vegetables were picked this morning. Please, have a look.', speaker: 'persona_npc05', identity: 'Audition persona, not a game character: no young woman stallholder\'s age is established in the game.', why: 'A welcoming sales greeting.' },
  NPC05_2: { fixture: '{申|もう}し{訳|わけ} ありません が 、 {値引|ねび}き は できません 。 その {代|か}わり 、 {一|ひと}つ おまけ します ね 。', en: 'I\'m sorry, but I can\'t lower the price. I\'ll add one extra instead.', speaker: 'persona_npc05', why: 'A firm but courteous refusal.' },
  NPC06_1: { key: 'sg.sota_wait#5f1fe6c8e0', speaker: 'sota', identity: 'Sōta: a fisher, Kiyo\'s son, "worried about his nets" (he/him); a young adult by family role (lives with his mother, who keeps him ashore), not by a stated age.', why: 'Where the nets are: brisk directions.' },
  NPC06_2: { key: 'sg.sota_nets#234d83e96e', speaker: 'sota', why: '"My nets! Thank you!": sincere gratitude.' },
  NPC07_1: { key: 'sg.kiyo_fish#c1fda865ce', speaker: 'kiyo', identity: 'Kiyo: the fishmonger, Sōta\'s mother (she/her); middle-aged by family role, not by a stated age; a market stall rather than the profile\'s inn or craft.', why: 'Keeping her son ashore until the lighthouse is lit: confident reassurance.' },
  NPC07_2: { key: 'sg.kiyo_idle#d3892b466d', speaker: 'kiyo', why: '"Cheap, cheap! …Is what I\'d like to say, but there\'s no fish": controlled frustration.' },
  NPC08_1: { key: 'co.tokiwa#203f06ac0a', speaker: 'co_tokiwa', identity: 'Tokiwa: Cinder Orchard\'s recorder, keeper of the chronicle (a records clerk), he/him ("Tokiwa says he\'s calling everyone", Sayo); the chronicle\'s year in "a different hand" is his from his apprentice days twenty years before, so not young: middle age by role, not by a stated age.', why: '"The chronicle is on the desk. Please don\'t fold the pages": a polite instruction.' },
  NPC08_2: { key: 'co.tokiwa_intro#67945c18c8', speaker: 'co_tokiwa', why: 'A hundred and twenty years without a gap, "though some years the writing is messy — my apprentice days": warm self-deprecating humour.' },
  NPC09_1: { key: 'rw.tsuru_first#7e3890f78c', speaker: 'tsuru', identity: 'Tsuru: Reedwake\'s lantern keeper, "an old woman leaning on a cane" (narration; look.age old).', why: 'Her rewritten names slipping off, "you could put it down to my age": reflective.' },
  NPC09_2: { key: 'rw.tsuru_first#b0aa1f82ca', speaker: 'tsuru', why: '"But your writing held. Lend me a hand": spirited encouragement.' },
  NPC10_1: { key: 'sg.tetsu_first#c232304626', speaker: 'tetsu', identity: 'Tetsu: the ferryman (look.age old), "this old man" (Nao).', why: 'The ferry and the tide, "forty years, same": steady explanation.' },
  NPC10_2: { key: 'sg.tetsu_history#d859bccc01', speaker: 'tetsu', why: 'His father stopping the boat and taking off his hat when the bell rang: tender remembrance.' },
  NPC11_1: { key: 'hall.w10.kohaku#4a49b28f2c', speaker: 'hall_kohaku', identity: 'Kohaku: the Hall\'s last keeper\'s apprentice (they/them, documented in src/content/hall/01_region.js); an adult apprentice, age not stated.', why: 'How the waystones work here: precise information.' },
  NPC11_2: { fixture: '{地図|ちず} は {正確|せいかく} です 。 {道|みち} の ほう が 、 ときどき {勝手|かって} に {曲|ま}がります が 。', en: 'The map is accurate. It\'s the road that sometimes bends on its own.', speaker: 'hall_kohaku', identity: 'Noncanonical line in Kohaku\'s casting identity: none of Kohaku\'s lines is wry.', why: 'Wry amusement.' },
  NPC12_1: { key: 'hall.w6.t6#32b35522e9', speaker: 'hall_ibuki', identity: 'Ibuki: the young keeper of the toll gate (they/them, documented in src/content/hall/01_region.js); a keeper rather than the profile\'s artisan, host or traveller, the nearest documented nonbinary adult with these two deliveries.', why: '"I\'ll read it. I can read Kihei\'s hand. What are we looking up?": an easy, open offer (the nearest Ibuki has to a welcome).' },
  NPC12_2: { key: 'hall.w6.t9#b1e6b938b6', speaker: 'hall_ibuki', why: '"The bell has rung. The gate stays shut till morning": serious boundary-setting.' },

  // ---- language and prosody stress (§09): the narrator throughout -------------------------------------------------
  J01: { key: 'rw.arrive#468a284f8e', why: 'Canon readings a default engine may miss: 葦ノ瀬 (あしのせ), 灯守 (ひもり), ツル, 紹介状.' },
  J02: { key: 'lf.timetable#d0a10c0c09', why: 'Times and counters: 三行, 九時 / 十二時 / 十五時, 出航 / 欠航 (gemination as well).' },
  J03: { key: 'sb.gallery_note#b914a611fa', spoiler: 'later', why: '(A puzzle\'s answer: hidden in the review list.) '+ 'Denji\'s crank instructions: a condition (凍ったまま回すと…), numbers (右へ三回, 左へ一回) and a negative imperative (逆にするな).' },
  J04: { key: 'rw.mr_reeds#b74f83f303', why: 'Same text as J05: "Something small must come through here every night", read as a plain confirmation.' },
  J05: { key: 'rw.mr_reeds#b74f83f303', why: 'Same text as J04, read with restrained doubt.' },
  J06: { key: 'rw.mr_enter#4ce19ffc24', why: 'A quotation inside narration (誰も「一緒に行こう」とは言わない): the narrator keeps the line.' },
  J07: { key: 'lq.letters_home#cffd841e0d', why: 'Tsuru\'s letter, 95 characters of clauses, read aloud by the narration (about 15 s).' },
  J08: { key: 'rw.apoth_table#b6f3f774aa', why: 'Small kana, long vowels and gemination together: 帳面 (ちょうめん), 分量 (ぶんりょう), びっしり, 消えていない.' },
};
// Suzu's Kansai counterparts (SUZU_K01–K05) are the dialect table's Kansai versions of SUZU01–05 (src/lang/85_dialect.js).
export const KANSAI_OF = { SUZU_K01: 'SUZU01', SUZU_K02: 'SUZU02', SUZU_K03: 'SUZU03', SUZU_K04: 'SUZU04', SUZU_K05: 'SUZU05' };
// the five player texts, voiced once by A and once by B
export const PLAYER_OF = { PCA01: 'PLAYER_LINE_01', PCB01: 'PLAYER_LINE_01', PCA02: 'PLAYER_LINE_02', PCB02: 'PLAYER_LINE_02', PCA03: 'PLAYER_LINE_03', PCB03: 'PLAYER_LINE_03', PCA04: 'PLAYER_LINE_04', PCB04: 'PLAYER_LINE_04', PCA05: 'PLAYER_LINE_05', PCB05: 'PLAYER_LINE_05' };
// casting screens (§04: up to three voices, two short anchor lines per role)
export const ANCHORS = {
  narrator_female: ['N02', 'N13'], suzu: ['SUZU01', 'SUZU03'], nao: ['NAO02', 'NAO05'], mio: ['MIO02', 'MIO05'], ren: ['REN01', 'REN02'],
  player_a: ['PCA01', 'PCA05'], player_b: ['PCB01', 'PCB05'],
};
