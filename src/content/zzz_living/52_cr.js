/* The Cloudroad's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md). A chain of post stations:
 * the two busiest, Oiwake (where the highway leaves the Lantern Road, with the relay office) and Nakayama (two rival
 * inns and a mapmaker), are towns; their routines run once the chapter is done (`cr_done`).
 * W2 routines: Tome draws the well water or hears Kanbe's news; Kanbe posts the relay's times or waits at the station
 *   entrance for the runner (a note in the office says where); Otaki and Seibe go back and forth between the two inns,
 *   to the fence they may take down, to the board, to the lamp whose name Seibe calls at night; Rin paces the station
 *   out with her own feet, or sketches only what she can see of the pass.
 * W3 Tome and Kanbe, Otaki and Seibe can be asked after people; Rin says only what she has seen herself. The route
 *   reports with their certainty (cr/31_reports.js) are the Cloudroad's own and are registered, not repeated.
 * W1 beats: registered, Jinpachi at each station with the valley's call (cr_done, before yn_called); added, at Oiwake
 *   a poster from Steamhollow's inns (Steamhollow done) and the relay's new ring (after the story); at Nakayama, Rin's
 *   map carried down to the valley (Steamhollow done), and Tatsu back as a guest of both inns (after the story).
 * W5 the legs and the pass have the richest bespoke events of the journey (the ford, the washed-out bridge, the
 *   rockslide, the fog ox and porter, the wanderers, the drift: cr/10_maps.js, 11_pass.js): no unique events here, only
 *   variants, each once the leg's own event is behind it and the chapter is done.
 * W6 return keys: Nakayama's association box, opened by the station as one (全体, Steamhollow); the relay's route
 *   scroll at Oiwake whose names past the pass come back once the Hush is settled; the Barrier's chest of held
 *   goods, opened once the Barrier is a teahouse (after the story). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;
  const J = (jp, en) => ({ jp, en }); // a challenge's title: Japanese first (L.T is en, jp)
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
総出|そうで|n|A|everyone turning out together
カジカ||n|I|kajika, a mountain-stream frog famous for its song (カジカガエル)
猟師|りょうし|n|I|a hunter
十歩|じっぽ|n|E|ten paces
二十歩|にじっぽ|n|E|twenty paces
三十歩|さんじっぽ|n|E|thirty paces
五十歩|ごじっぽ|n|E|fifty paces
六十歩|ろくじっぽ|n|E|sixty paces
寄合|よりあい|n|A|a meeting, an association (of a village or a station)
道順|みちじゅん|n|I|a route, the order of the way
両宿|りょうしゅく|n|A|both stations
番所|ばんしょ|n|A|a guardhouse, a checkpoint office
長持|ながもち|n|A|a long chest (for storing clothes and goods)
預かり|あずかり|n|I|keeping, custody (goods left in someone's keeping)
ぐらり||adv|I|with a lurch, rocking (of something loose)
荷馬|にうま|n|I|a pack horse
鉄砲|てっぽう|n|I|a gun (an old matchlock or hunting gun)
仕留める|しとめる|v1|A|to bring down (game), to finish off
深々|ふかぶか|adv|A|deeply (of a bow)
二色|にしょく|n|I|two colours
入り鉄砲|いりでっぽう|n|A|guns coming in (入り鉄砲に出女: what the Edo checkpoints watched for; real history)
出女|でおんな|n|A|women going out (of Edo: 入り鉄砲に出女; real history)
動かば|うごかば|exp|A|(classical) if it moves (動けば)
赤き|あかき|exp|A|(classical) red (the old form of 赤い before a noun)
自ら|みずから|adv|I|oneself, with one's own hands
出づれば|いづれば|exp|A|(classical) when it comes out, when it rises (出れば; of water: in flood)
見えざれば|みえざれば|exp|A|(classical) if it cannot be seen (見えなければ)
捕る|とる|v5r|I|to catch (an animal, a fish)
こいつ||pn|I|this one, this fellow (rough, familiar)
こた||exp|A|(casual contraction of ことは: 〜こたない = 〜ことはない, no need to)
`), 'living');

  // ---- the towns ----------------------------------------------------------------------------------------------------
  L.town('oiwake', { maps: ['cr.oiwake', 'cr.oiwake_post'], care: ['yn_done', 'sa_hush_down', 'postgame'], after: 'cr_done' });
  L.town('nakayama', { maps: ['cr.nakayama'], care: ['yn_done', 'sa_hush_down', 'postgame'], after: 'cr_done' });

  // ---- W2: routines -----------------------------------------------------------------------------------------------
  // Oiwake: Tome, the innkeeper (her inn's front, the well, the relay office); Kanbe, the relay master (the office,
  // the notice board, the station's west entrance)
  L.routine('oiwake', 'cr_tome', { base: 'cr.oiwake:cr_tome', slots: [
    { map: 'cr.oiwake', x: 10, y: 17, dir: 'up', line: ['{井戸|いど} の {水|みず} を {汲|く}んで いる の 。 お{客|きゃく} さん の {朝|あさ} の お{茶|ちゃ} は 、 この {水|みず} で なきゃ 。', 'Drawing water from the well. The guests\' morning tea has to be made with this.'] },
    { map: 'cr.oiwake_post', x: 6, y: 4, dir: 'left', line: ['カンベエ さん に 、 {上|うえ} の {宿|しゅく} の {話|はなし} を {聞|き}きに {来|き}た の 。 {半分|はんぶん} だけ {信|しん}じる けど ね 。', 'I\'ve come to hear Kanbe\'s news from the stations up the road. I\'ll believe half of it, mind.'] },
  ] });
  L.routine('oiwake', 'cr_kanbe', { base: 'cr.oiwake_post:cr_kanbe', slots: [
    { map: 'cr.oiwake', x: 26, y: 16, dir: 'up', line: ['{継|つ}ぎ{飛脚|びきゃく} の {時刻|じこく} を {貼|は}り{替|か}えて いる 。 {走|はし}る {者|もの} が {増|ふ}えて 、 {紙|かみ} が {足|た}りん わい 。', 'Putting up the relay\'s new times. More runners, and never enough paper.'] },
    { map: 'cr.oiwake', x: 3, y: 15, dir: 'right', line: ['{下|した} から {来|く}る {飛脚|ひきゃく} を {待|ま}って いる 。 …… {遅|おそ}い ！ いや 、 {時刻|じこく} どおり か 。', 'Waiting for the runner up from below. …Late! No. On time, is it.'] },
  ] });
  L.away('oiwake', 'cr_kanbe', { map: 'cr.oiwake_post', x: 8, y: 5, p: 'fw_note', line: ['{書|か}き{置|お}き 。 「{表|おもて} に いる 。 {掲示板|けいじばん} か 、 {宿場|しゅくば} の {入|い}り{口|ぐち} だ 。 カンベエ」', 'A note: "Outside. The notice board, or the station entrance. —Kanbe"'] });
  // Nakayama: Otaki (the Matsuba's front, the fence between the inns, the board), Seibe (the Take's stall, the
  // Matsuba's door, the everlasting lamp), Rin (her map table, the east end, the view up to the pass)
  L.routine('nakayama', 'cr_otaki', { base: 'cr.nakayama:cr_otaki', slots: [
    { map: 'cr.nakayama', x: 13, y: 11, dir: 'up', line: ['{竹屋|たけや} と の {間|あいだ} の {垣根|かきね} 、 {外|はず}そう か って {話|はなし} に なって いる の 。 {向|む}こう の {旦那|だんな} は 、 まだ {迷|まよ}って いる けど 。', 'We\'re talking about taking down the fence between us and the Take. Its master is still making up his mind.'] },
    { map: 'cr.nakayama', x: 27, y: 16, dir: 'up', line: ['{空|あ}き{部屋|べや} の {札|ふだ} を {貼|は}って いる の 。 うち と {竹屋|たけや} 、 {両方|りょうほう} の ね 。', 'I\'m putting up the free-rooms notice. Ours and the Take\'s, both.'] },
  ] });
  L.routine('nakayama', 'cr_seibe', { base: 'cr.nakayama:cr_seibe', slots: [
    { map: 'cr.nakayama', x: 5, y: 11, dir: 'down', line: ['{今夜|こんや} は うち が {満室|まんしつ} で ござる 。 {松葉屋|まつばや} に 、 {布団|ふとん} を {借|か}り に {来|き}た 。', 'We\'re full tonight. I\'ve come to the Matsuba to borrow futons.'] },
    { map: 'cr.nakayama', x: 31, y: 15, dir: 'right', line: ['{夜|よる} に なったら 、 {常夜灯|じょうやとう} の {名|な} を {呼|よ}ぶ 。 「{中山|なかやま}」 と な 。 {飛脚|ひきゃく} の まね で ござる よ 。', 'At nightfall I call the lamp\'s name. "Nakayama." The way the runners did.'] },
  ] });
  L.routine('nakayama', 'cr_rin', { base: 'cr.nakayama:cr_rin', slots: [
    { map: 'cr.nakayama', x: 30, y: 11, dir: 'down', perform: 'tally', line: ['{宿場|しゅくば} の {長|なが}さ を 、 {自分|じぶん} の {足|あし} で {測|はか}って います 。 {聞|き}いた {数字|すうじ} は 、 もう {使|つか}いません 。', 'I\'m measuring the station\'s length with my own feet. I don\'t use numbers I\'ve only been told any more.'] },
    { map: 'cr.nakayama', x: 24, y: 4, dir: 'up', perform: 'read', line: ['{峠|とうげ} の {方|ほう} を {描|か}いて います 。 {見|み}える {所|ところ} だけ 。 {見|み}えない {所|ところ} は 、 {白|しろ} の まま に して おきます 。', 'I\'m drawing towards the pass. Only what I can see. What I can\'t, I leave white.'] },
  ] });

  // ---- W3: who can be asked after whom ---------------------------------------------------------------------------
  L.asks('cr_tome');
  L.knows('cr_tome', { cr_kanbe: 'routine', cr_jinpachi: 'routine', cr_ine: 'loose', cr_sada: 'loose', cr_sono: 'loose', cr_otaki: 'loose', cr_seibe: 'loose', cr_heisuke: 'loose', cr_genji: 'loose' });
  L.asks('cr_kanbe');
  L.knows('cr_kanbe', { cr_tome: 'routine', cr_jinpachi: 'routine', cr_ine: 'routine', cr_sono: 'routine', cr_sakichi: 'routine', cr_heisuke: 'loose', cr_genji: 'loose', cr_shizu: 'loose', cr_otaki: 'loose', cr_seibe: 'loose' });
  L.asks('cr_otaki');
  L.knows('cr_otaki', { cr_seibe: 'routine', cr_rin: 'routine', cr_tatsu: 'loose', cr_genji: 'loose', cr_chika: 'loose', cr_heisuke: 'loose', cr_sono: 'loose' });
  L.asks('cr_seibe');
  L.knows('cr_seibe', { cr_otaki: 'routine', cr_rin: 'routine', cr_tatsu: 'loose', cr_genji: 'loose', cr_kosuke: 'loose', cr_tome: 'loose' });
  L.asks('cr_rin');
  L.cold('cr_rin', ['{自分|じぶん} の {目|め} で {見|み}た こと しか 、 {言|い}わない こと に して います 。 {人|ひと} の {居場所|いばしょ} は 、 {見|み}て いません 。', 'I\'ve made it a rule to say only what I\'ve seen with my own eyes. I haven\'t seen where anyone is.']);
  L.usual('cr_jinpachi', ['ジンパチ なら 、 {宿|しゅく} から {宿|しゅく} へ {走|はし}って いる か 、 {寝|ね}て いる か です よ 。', 'Jinpachi? Either running station to station, or asleep.']);
  L.usual('cr_ine', ['イネ さん は 、 {杉|すぎ}ノ{木|き} の {大杉|おおすぎ} の {下|した} の {茶屋|ちゃや} です よ 。', 'Ine keeps the teahouse under the great cedar at Suginoki.']);
  L.usual('cr_sono', ['ソノ さん は 、 {坂下|さかした} の {飛脚宿|ひきゃくやど} です 。', 'Sono keeps the Courier\'s Inn at Sakashita.']);
  L.usual('cr_sakichi', ['サキチ なら 、 {霧下|きりした} の {宿|やど} の {前|まえ} に いる だろう 。 {郵便箱|ゆうびんばこ} の そば だ 。', 'Sakichi? Likely out in front of the station house at Kirishita, by the post box.']);

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  // registered: Jinpachi at each station with the valley's call (cr/10_maps.js: ed>=2&cr_done&!yn_called)
  L.beat('oiwake', { id: 'jinpachi', when: 'ed>=2&cr_done&!yn_called', en: 'Jinpachi, with a letter from the valley', jp: '{谷|たに} から の {知|し}らせ' });
  L.beat('nakayama', { id: 'jinpachi', when: 'ed>=2&cr_done&!yn_called', en: 'Jinpachi, with a letter from the valley', jp: '{谷|たに} から の {知|し}らせ' });
  // added at Oiwake: Steamhollow's inns invite the Cloudroad's travellers; after the story, the relay runs in a ring
  L.beat('oiwake', { id: 'valley', when: 'ed>=2&yn_done', en: 'A poster from Steamhollow\'s inns', jp: '{湯|ゆ}ノ{谷|たに} の {宿|やど} の {貼|は}り{紙|がみ}' });
  C.maps['cr.oiwake'].props.push({ p: 'fw_postnote', x: 19, y: 11, if: 'beat.oiwake.valley', scene: 'yn.lw_cr_valley_poster' });
  L.talk('cr.oiwake:cr_tome', [{ if: 'beat.oiwake.valley&!seen.yn.lw_cr_tome_valley', scene: 'yn.lw_cr_tome_valley' }]);
  L.beat('oiwake', { id: 'ring', when: 'ed>=2&postgame', en: 'The relay\'s new route', jp: '{継|つ}ぎ{飛脚|びきゃく} の {新|あたら}しい {道順|みちじゅん}' });
  C.maps['cr.oiwake'].props.push({ p: 'fw_postnote', x: 24, y: 15, if: 'beat.oiwake.ring', scene: 'cr.lw_cr_ring_post' });
  L.talk('cr.oiwake_post:cr_kanbe', [{ if: 'beat.oiwake.ring&!seen.cr.lw_cr_kanbe_ring_post', scene: 'cr.lw_cr_kanbe_ring_post' }]);
  // added at Nakayama: Rin's map carried on down to Steamhollow; after the story, Tatsu back, booked with both inns
  L.beat('nakayama', { id: 'map', when: 'ed>=2&yn_done', en: 'Rin\'s map, carried on over the pass', jp: '{峠|とうげ} の {先|さき} まで の {地図|ちず}' });
  C.maps['cr.nakayama'].props.push({ p: 'fw_postnote', x: 22, y: 15, if: 'beat.nakayama.map', scene: 'yn.lw_cr_rin_sheet' });
  L.talk('cr.nakayama:cr_rin', [{ if: 'beat.nakayama.map&!seen.yn.lw_cr_rin_valley', scene: 'yn.lw_cr_rin_valley' }]);
  L.beat('nakayama', { id: 'tatsu', when: 'ed>=2&postgame&quest.cr_guest=done', en: 'A guest of both inns', jp: '{両方|りょうほう} の {宿|やど} の {客|きゃく}' });
  C.maps['cr.nakayama'].npcs.push({ id: 'lw_cr_tatsu', char: 'cr_tatsu', x: 14, y: 15, dir: 'up', if: 'beat.nakayama.tatsu', talk: 'cr.lw_cr_tatsu_post' });

  // ---- W5: the legs and the pass: variants after their own events -------------------------------------------------
  C.chars.lw_cr_runner = { name: T('A relay runner', '{継|つ}ぎ{飛脚|びきゃく}'), voice: { pitch: 1.1 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#c86a3a', '#a4542c', '#f0e4c8'], shape: 'tunic', acc: ['headband', 'satchel'], bandCol: '#f0e4c8' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#f0e4c8', bg: '#3a2014' } };
  C.chars.lw_cr_traveller = { name: T('A traveller', '{旅人|たびびと}'), voice: { pitch: 0.95 },
    look: { skin: 2, hair: 'bun', hairColor: 2, cloth: ['#5a6a7a', '#465462', '#e0d8c4'], shape: 'robe', acc: ['hat'], hatCol: '#a89060' },
    portrait: { eyes: 'soft', style: 'bun', acc: ['hat'], hatCol: '#a89060', bg: '#22282e' } };
  C.chars.lw_cr_child = { name: T('A child from Sakashita', '{坂下|さかした} の {子|こ}'), voice: { pitch: 1.3 }, size: 'child',
    look: { skin: 3, hair: 'spiky', hairColor: 1, cloth: ['#6a8a5a', '#546e46', '#f0e8d0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'spiky', blush: true, bg: '#26301e' } };
  C.chars.lw_cr_hunter = { name: T('A hunter', '{猟師|りょうし}'), voice: { pitch: 0.78 },
    look: { skin: 4, hair: 'short', hairColor: 0, cloth: ['#5a4a3a', '#46382c', '#c8b890'], shape: 'coat', acc: ['hat'], hatCol: '#6a5a44' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['hat'], hatCol: '#6a5a44', beard: true, bg: '#241e18' } };
  // each event stands where it happens (RE-1), by event id (05_author.js L.road `at`; on the pass, the map it is on):
  //   the Cedar Avenue: the runner sits under the cedars of the west avenue; the frightened traveller between the
  //     cedars of the east avenue, the dark thing (a stump) behind them; the rota card on a post by the milestone mound
  //   the Stone Steps: a waystone on the east steps with the red cloths (a ribboned post) by it; the yellowed notice
  //     by the old slide's rock at the gorge's west mouth; Sada resting by the road, his loads beside him
  //   the Stream: the traveller at the shallows (the old road's ford), the gauge post beside them; the child on the far
  //     bank with the jar, the card at the water's edge; Yahei upstream on the bank above the ford, a felled log by him
  //   the Ledge: the two travellers arguing where the roads part; Rin's stakes along the main road east of the gorge,
  //     a gap where one was pulled up, her card on one; Genji and Kuri stopped on the main road
  //   the Fog Slope: the lost traveller off the road in the meadow; the hunter at the gorge's mouth, where the tracks
  //     cross the road; the dropped papers on the road, the two travellers a little further on
  //   the High Pass: the card by the shelter's woodpile (cr.pass2); the child at the first turn by the waystone, the
  //     parent behind at the corner (cr.pass1); a waystone's head above the fresh snow, drifts round it (cr.pass3)
  const AT = {
    runner: { who: [{ char: 'lw_cr_runner', x: 9, y: 13, dir: 'up' }] },
    bear: { who: [{ char: 'lw_cr_traveller', x: 25, y: 13, dir: 'down' }], props: [{ p: 'stump', x: 26, y: 15 }] },
    rota: { props: [{ p: 'fw_postnote', x: 5, y: 14, meet: true }] },
    cloth: { props: [{ p: 'signblank', x: 28, y: 13, meet: true }, { p: 'pet_post', x: 29, y: 13, meet: true }] },
    pebbles: { props: [{ p: 'fw_postnote', x: 11, y: 10, meet: true }] },
    loads: { who: [{ char: 'cr_sada', x: 6, y: 10, dir: 'down' }], props: [{ p: 'crate', x: 7, y: 10 }, { p: 'crate', x: 8, y: 10 }] },
    gauge: { who: [{ char: 'lw_rd_traveller2', x: 15, y: 2, dir: 'right' }], props: [{ p: 'pet_post_fixed', x: 16, y: 2, meet: true }] },
    kajika: { who: [{ char: 'lw_cr_child', x: 20, y: 2, dir: 'left' }], props: [{ p: 'fw_postnote', x: 19, y: 2, meet: true }, { p: 'kr_jar', x: 20, y: 1 }] },
    logs: { who: [{ char: 'cr_yahei', x: 19, y: 1, dir: 'down' }], props: [{ p: 'kr_cedar', x: 20, y: 1 }] },
    lines: { who: [{ char: 'lw_rd_traveller', x: 6, y: 8, dir: 'right' }, { char: 'lw_rd_traveller2', x: 7, y: 8, dir: 'left' }] },
    stakes: { props: [{ p: 'pet_post_fixed', x: 23, y: 13, meet: true }, { p: 'fw_postnote', x: 25, y: 13, meet: true }, { p: 'pet_post_fixed', x: 29, y: 13, meet: true }] },
    horse: { who: [{ char: 'cr_genji', x: 30, y: 12, dir: 'right' }], props: [{ p: 'cr_horse', x: 31, y: 12, meet: true }] },
    voice: { who: [{ char: 'lw_cr_traveller', x: 6, y: 17, dir: 'left' }] },
    tracks: { who: [{ char: 'lw_cr_hunter', x: 11, y: 10, dir: 'down' }] },
    papers: { who: [{ char: 'lw_rd_traveller', x: 29, y: 13, dir: 'right' }, { char: 'lw_rd_traveller2', x: 30, y: 13, dir: 'left' }], props: [{ p: 'pet_papers', x: 25, y: 12, meet: true }] },
    shelter: { map: 'cr.pass2', props: [{ p: 'fw_postnote', x: 31, y: 8, meet: true }] },
    turns: { map: 'cr.pass1', who: [{ char: 'lw_rd_child', x: 6, y: 28, dir: 'right' }, { char: 'lw_rd_parent', x: 3, y: 28, dir: 'right' }] },
    stones: { map: 'cr.pass3', props: [{ p: 'stone_marker', x: 9, y: 11, meet: true }, { p: 'sb_drift', x: 8, y: 11 }, { p: 'sb_drift', x: 10, y: 11 }] },
  };
  const V = (id) => Object.assign({ id, scene: 'cr.lw_' + id }, AT[id] ? { at: AT[id] } : {});
  const road = (rid, maps, when, ids, title, ink) => L.road(rid, { maps, variants: ids.map((id) => Object.assign(V(id), { when })), stamp: { title, ink } });
  road('cr_leg1', ['cr.leg1'], 'cr_done', ['runner', 'bear', 'rota'], ['{杉並木|すぎなみき}', 'the Cedar Avenue'], '#3e5a34');
  road('cr_leg2', ['cr.leg2'], 'cr_done', ['cloth', 'pebbles', 'loads'], ['{石畳|いしだたみ}', 'the Stone Steps'], '#6a6a6a');
  road('cr_leg3', ['cr.leg3'], 'cr_bridge_mended&cr_done', ['gauge', 'kajika', 'logs'], ['{沢|さわ}', 'the Stream'], '#3a6a74');
  road('cr_leg4', ['cr.leg4'], 'cr_ledge_cleared&cr_done', ['lines', 'stakes', 'horse'], ['{崖道|がけみち}', 'the Ledge'], '#7a5a3a');
  road('cr_leg5', ['cr.leg5'], 'cr_ox_done&cr_done', ['voice', 'tracks', 'papers'], ['{霧|きり} の {坂|さか}', 'the Fog Slope'], '#8a96a2');
  road('cr_pass', ['cr.pass1', 'cr.pass2', 'cr.pass3'], 'cr_drift_cleared&cr_done', ['shelter', 'turns', 'stones'], ['{雲路峠|くもじとうげ}', 'the High Pass'], '#4a5a7a');

  C.notes.lw_cr_as_heard = { title: T('As heard', '{聞|き}いた まま'), fiction: true,
    jp: '{継|つ}ぎ{飛脚|びきゃく} は 、 {伝言|でんごん} を {聞|き}いた まま {渡|わた}す 。 {見|み}た こと は {見|み}た と 、 {聞|き}いた こと は {聞|き}いた と 。',
    en: 'A relay runner hands a message on as it was heard: what they saw, they say they saw; what they were told, they say they were told. (そうだ and らしい mark hearsay in real Japanese; the relay is the game\'s.)' };
  C.notes.lw_cr_red_cloth = { title: T('The red cloth', '{赤|あか}い {布|ぬの}'), fiction: true,
    jp: '{石畳|いしだたみ} の {石|いし} が {動|うご}いたら 、 {赤|あか}い {布|ぬの} を {結|むす}んで おく 。 {直|なお}す {人|ひと} が 、 {遠|とお}く から {見|み}つけられる よう に 。',
    en: 'When a paving stone on the Stone Steps works loose, a red cloth is tied by it, so the menders can find it from far off. (The custom is the game\'s.)' };
  C.notes.lw_cr_kajika = { title: T('Kajika frogs', 'カジカ'), fiction: false,
    jp: 'カジカガエル は 、 {山|やま} の {沢|さわ} に {住|す}む {小|ちい}さな {蛙|かえる} 。 {夏|なつ} に 、 {笛|ふえ} の よう な {声|こえ} で {鳴|な}く 。',
    en: 'The kajika frog (カジカガエル) is a small frog of mountain streams, loved for its flute-like song in summer. (Real: poets have written about it for centuries.)' };
  C.notes.lw_cr_two_lines = { title: T('Two colours of line', '{二色|にしょく} の {線|せん}'), fiction: true,
    jp: 'リン の {地図|ちず} で は 、 {黒|くろ} の {線|せん} は {自分|じぶん} で {歩|ある}いた {道|みち} 、 {赤|あか} の {線|せん} は {人|ひと} に {聞|き}いた {道|みち} 。',
    en: 'On Rin\'s map a black line is a road she walked herself, a red line one she was told about. Red is not wrong: only not yet checked.' };
  C.notes.lw_cr_cloud_ox = { title: T('The Cloud Ox', '{雲|くも} の {牛|うし}'), fiction: true,
    jp: '{雲|くも} の {牛|うし} は 、 {霧|きり} が {牛|うし} の {形|かたち} を した もの に すぎない 。 {人|ひと} を {食|く}う と いう の は 、 {噂|うわさ} だ 。',
    en: 'The Cloud Ox is only mist in the shape of an ox. That it eats people is a rumour. (The game\'s own creature.)' };
  C.notes.lw_cr_shelter = { title: T('The shelter\'s firewood', '{小屋|こや} の {薪|まき}'), fiction: true,
    jp: '{峠|とうげ} の {避難小屋|ひなんごや} で は 、 {使|つか}った {分|ぶん} の {薪|まき} は 、 {次|つぎ} の {人|ひと} の ため に {足|た}して おく 。',
    en: 'At the pass\'s snow shelter, the firewood you burn is put back for whoever comes next. (Leave a mountain hut as you found it: a real courtesy; this shelter is the game\'s.)' };

  C.challenges['cr.lw_runner'] = { title: J('{聞|き}いた まま', 'As it was heard'), tiers: {
    F: [ch({ item: 'v:団子', ctx: { jp: 'ひきゃく ： 「すぎのき の イネ さん に 、 『だんご を にじゅう』 と いって ください 。」', en: '' }, prompt: { en: 'What is the message for Ine?' },
      options: [o('だんご を にじゅう', 1), o('だんご を じゅう', 0, 'にじゅう is twenty.'), o('おちゃ を にじゅう', 0, 'The order is for だんご.')] })],
    E: [ch({ item: 'g:cr_to_itte', ctx: { jp: '{飛脚|ひきゃく} ： 「イネ さん に 、 『{明日|あした} の {朝|あさ} 、 {団子|だんご} を {二十本|にじゅっぽん} {頼|たの}みます』 と {伝|つた}えて ください 。 トメ さん から です 。」', en: '' }, prompt: { en: 'How do you pass it on at Suginoki?' },
      options: [o('トメ さん が 、 {明日|あした} の {朝|あさ} {団子|だんご} を {二十本|にじゅっぽん} {頼|たの}みます 、 と {言|い}って いました 。', 1), o('トメ さん が 、 {今日|きょう} {団子|だんご} を {二十本|にじゅっぽん} {頼|たの}みます 、 と {言|い}って いました 。', 0, 'The order is for tomorrow morning.'), o('わたし が {団子|だんご} を {二十本|にじゅっぽん} {頼|たの}みます 。', 0, 'It is Tome\'s order: と言っていました.')] })],
    I: [ch({ item: 'g:sou_hear', ctx: { jp: '{飛脚|ひきゃく} ： 「{上|うえ} の {宿|しゅく} で {聞|き}いた ん だ が 、 {石畳|いしだたみ} で {小石|こいし} が {落|お}ちた らしい 。 {俺|おれ} は {見|み}て いない 。」', en: '' }, prompt: { en: 'Pass it on honestly at the next station.' },
      options: [o('{石畳|いしだたみ} で {小石|こいし} が {落|お}ちた そう です 。', 1), o('{石畳|いしだたみ} で {小石|こいし} が {落|お}ちました 。', 0, 'Nobody here saw it: say it as hearsay, そうです.'), o('{石畳|いしだたみ} は {通|とお}れません 。', 0, 'That is more than anyone said.')] })],
    A: [ch({ item: 'g:cr_tono', ctx: { jp: '{書|か}き{付|つ}け ： 「{坂下|さかした} の ソノ {殿|どの} へ 。 {今夜|こんや} 、 {飛脚宿|ひきゃくやど} に {二人|ふたり} {泊|と}まりたし 。」', en: '' }, prompt: { en: 'Pass the note on faithfully.' },
      options: [o('{今夜|こんや} 、 {二人|ふたり} {泊|と}めて ほしい 、 と の {伝言|でんごん} です 。', 1), o('{今夜|こんや} 、 {二人|ふたり} {泊|と}まりました 、 と の {伝言|でんごん} です 。', 0, '〜たし is an old "want to": they want to stay, they have not stayed.'), o('{今夜|こんや} は {泊|と}まれない 、 と の {伝言|でんごん} です 。', 0, 'Nothing in the note refuses.')] })],
  } };
  C.challenges['cr.lw_bear'] = { title: J('{熊|くま} の {噂|うわさ}', 'Talk of a bear'), tiers: {
    F: [ch({ item: 'v:熊', ctx: { jp: 'たびびと ： 「くま が いる 、 と きいた ！ …… みて は いない けど 。」', en: '' }, prompt: { en: 'Did the traveller see a bear?' },
      options: [o('みて いない 。 きいた だけ 。', 1), o('みた', 0, 'みてはいない: they did not see it.')] })],
    E: [ch({ item: 'g:cr_to_itte', ctx: { jp: '{旅人|たびびと} ： 「{茶屋|ちゃや} の {人|ひと} が 、 『{旧道|きゅうどう} に {熊|くま} が {出|で}た』 と {言|い}って いました ！」', en: '' }, prompt: { en: 'Who said there was a bear?' },
      options: [o('{茶屋|ちゃや} の {人|ひと}', 1), o('{旅人|たびびと} {自身|じしん}', 0, 'と言っていました: they are passing on what someone else said.'), o('{熊|くま}', 0, 'Bears say very little.')] })],
    I: [ch({ item: 'g:you_mitai', ctx: { jp: '{杉|すぎ} の {陰|かげ} の {黒|くろ}い もの は 、 {動|うご}かない 。 {近|ちか}づく と 、 {古|ふる}い {切|き}り{株|かぶ} の よう だ 。 {熊|くま} の {足跡|あしあと} は ない 。', en: '' }, prompt: { en: 'What do you tell the traveller?' },
      options: [o('{熊|くま} で は なくて 、 {切|き}り{株|かぶ} の よう です 。', 1), o('{熊|くま} が いました 。', 0, 'You saw a stump, and no tracks.'), o('{熊|くま} は {逃|に}げた よう です 。', 0, 'No tracks: nothing ran off.')] })],
    A: [ch({ item: 'g:adv_wake_dewa_nai', ctx: { jp: '{旅人|たびびと} ： 「{熊|くま} が {怖|こわ}い わけ で は ない ん です 。 ただ 、 {一人|ひとり} で {杉並木|すぎなみき} を {歩|ある}く の が …… 」', en: '' }, prompt: { en: 'What does the traveller really want?' },
      options: [o('{一緒|いっしょ} に {歩|ある}いて ほしい', 1), o('{熊|くま} を {追|お}い{払|はら}って ほしい', 0, '熊が怖いわけではない: it is not the bear.'), o('{追分|おいわけ} へ {戻|もど}りたい', 0, 'They want to go on, just not alone.')] })],
  } };
  C.challenges['cr.lw_rota'] = { title: J('{掃除|そうじ} の {当番|とうばん}', 'Whose turn to sweep'), tiers: {
    F: [ch({ item: 'v:掃除', ctx: { jp: 'ふだ ： 「そうじ ： 1 がつ おいわけ 、 2 がつ すぎのき 、 3 がつ おいわけ 、 4 がつ すぎのき …」 いま は 4 がつ 。', en: '' }, prompt: { en: 'Whose turn is it this month?' },
      options: [o('すぎのき', 1), o('おいわけ', 0, '4 がつ is すぎのき on the card.')] })],
    E: [ch({ item: 'v:当番', ctx: { jp: '{札|ふだ} ： 「{一里塚|いちりづか} の {掃除|そうじ} 。 {一月|いちがつ} {追分|おいわけ} 、 {二月|にがつ} {杉|すぎ}ノ{木|き} 、 {三月|さんがつ} {追分|おいわけ} …… 」 {今|いま} は {六月|ろくがつ} 。', en: '' }, prompt: { en: 'Whose turn is it?' },
      options: [o('{杉|すぎ}ノ{木|き}', 1), o('{追分|おいわけ}', 0, 'Odd months are Oiwake; June is even.')] })],
    I: [ch({ item: 'g:mod_goto', ctx: { jp: '{札|ふだ} ： 「{一里塚|いちりづか} の {掃除|そうじ} は 、 {月|つき} ごと に {追分|おいわけ} と {杉|すぎ}ノ{木|き} が {交代|こうたい} する 。 {一月|いちがつ} は {追分|おいわけ} 。」 {今|いま} は {九月|くがつ} 。', en: '' }, prompt: { en: 'It is September. Whose turn is it?' },
      options: [o('{追分|おいわけ}', 1), o('{杉|すぎ}ノ{木|き}', 0, 'They change every month, starting with Oiwake: September is Oiwake again.'), o('{両方|りょうほう} {一緒|いっしょ} に', 0, 'ごとに: in turn, month by month.')] })],
    A: [ch({ item: 'g:mod_goto', ctx: { jp: '{札|ふだ} の {下|した} ： 「{但|ただ}し 、 {雪|ゆき} の {月|つき} は {月|つき} ごと に あらず 。 {両宿|りょうしゅく} {総出|そうで} に て {掃|は}く べし 。」', en: '' }, prompt: { en: 'What happens in the snowy months?' },
      options: [o('{両方|りょうほう} の {宿|しゅく} が 、 {総出|そうで} で {一緒|いっしょ} に {掃|は}く 。', 1), o('{掃除|そうじ} は しない 。', 0, '掃くべし: sweep, they must.'), o('いつも {通|どお}り 、 {月|つき} ごと に {交代|こうたい} する 。', 0, '月ごとにあらず: not month by month.')] })],
  } };
  C.challenges['cr.lw_cloth'] = { title: J('{赤|あか}い {布|ぬの}', 'The red cloth'), tiers: {
    F: [ch({ item: 'v:赤い', ctx: { jp: 'ふだ ： 「うごく いし に は 、 あかい ぬの を むすぶ 。」', en: '' }, prompt: { en: 'A paving stone rocks under your foot. What do you tie by it?' },
      options: [o('あかい ぬの', 1), o('しろい ぬの', 0, 'あかい: red.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{札|ふだ} ： 「{動|うご}く {石|いし} を {見|み}つけたら 、 {赤|あか}い {布|ぬの} を {結|むす}んで ください 。 それから 、 {坂下|さかした} に {知|し}らせて ください 。」', en: '' }, prompt: { en: 'What two things does the notice ask?' },
      options: [o('{布|ぬの} を {結|むす}んで 、 {坂下|さかした} に {知|し}らせる', 1), o('{石|いし} を {抜|ぬ}いて 、 {坂下|さかした} へ {持|も}って {行|い}く', 0, 'Tie the cloth; just tell Sakashita.'), o('{布|ぬの} を {結|むす}んで 、 {杉|すぎ}ノ{木|き} に {知|し}らせる', 0, 'The notice says 坂下.')] })],
    I: [ch({ item: 'g:te_oku', ctx: { jp: '{札|ふだ} ： 「{直|なお}す {者|もの} が {来|く}る まで 、 {布|ぬの} を {結|むす}んで おく こと 。 {石|いし} は {抜|ぬ}かない こと 。」', en: '' }, prompt: { en: 'What do you do with the loose stone?' },
      options: [o('{布|ぬの} を {結|むす}んで 、 {石|いし} は その まま に して おく', 1), o('{石|いし} を {抜|ぬ}いて 、 {脇|わき} に {置|お}いて おく', 0, '抜かないこと: leave it in.'), o('{直|なお}す {者|もの} が {来|く}る まで 、 ここ で {待|ま}つ', 0, 'The cloth waits for them, not you: 結んでおく.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {札|ふだ} ： 「{石|いし} {動|うご}かば 、 {赤|あか}き {布|ぬの} を {結|むす}ぶ べし 。 {自|みずか}ら {抜|ぬ}く べからず 。」', en: '' }, prompt: { en: 'What does the old notice require?' },
      options: [o('{赤|あか}い {布|ぬの} を {結|むす}び 、 {自分|じぶん} で {抜|ぬ}いて は いけない', 1), o('{自分|じぶん} で {抜|ぬ}いて 、 {赤|あか}い {布|ぬの} で {包|つつ}む', 0, 'べからず: must not.'), o('{石|いし} を {動|うご}かして 、 {確|たし}かめる', 0, '動かば is "if it moves", not an order to move it.')] })],
  } };
  C.challenges['cr.lw_pebbles'] = { title: J('{落石|らくせき}', 'Falling stones'), tiers: {
    F: [ch({ item: 'v:走る', ctx: { jp: 'ふだ ： 「いし の おと が したら 、 はしらないで 、 いわ の かげ へ 。」', en: '' }, prompt: { en: 'Stones are rattling down. What do you do?' },
      options: [o('はしらないで 、 いわ の かげ へ いく', 1), o('はしって にげる', 0, 'はしらないで: don\'t run.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{札|ふだ} ： 「{落石|らくせき} の {音|おと} が したら 、 {走|はし}らないで ください 。 {岩|いわ} の {陰|かげ} で {待|ま}って ください 。」', en: '' }, prompt: { en: 'What does the notice tell you to do?' },
      options: [o('{岩|いわ} の {陰|かげ} で {待|ま}つ', 1), o('{坂|さか} を {走|はし}って {下|お}りる', 0, '走らないでください: don\'t run.'), o('{石|いし} を {拾|ひろ}う', 0, 'Wait behind the rock.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{札|ふだ} ： 「{音|おと} が {止|や}んだら 、 {上|うえ} を {見|み}て から {進|すす}む こと 。」 {音|おと} が {止|や}んだ 。', en: '' }, prompt: { en: 'The sound has stopped. What now?' },
      options: [o('{上|うえ} を {見|み}て から 、 {進|すす}む', 1), o('すぐ {進|すす}む', 0, '見てから: look up first.'), o('もう {一度|いちど} {音|おと} が する まで {待|ま}つ', 0, '止んだら: once it has stopped, go on.')] })],
    A: [ch({ item: 'g:adv_kanenai', ctx: { jp: '{札|ふだ} ： 「{雨|あめ} の {後|あと} は 、 {小石|こいし} {一|ひと}つ が {大|おお}きな {落石|らくせき} を {呼|よ}び かねない 。」', en: '' }, prompt: { en: 'What is the notice warning?' },
      options: [o('{雨|あめ} の {後|あと} は 、 {小石|こいし} {一|ひと}つ でも {大|おお}きな {落石|らくせき} に なる おそれ が ある', 1), o('{雨|あめ} の {後|あと} は 、 {小石|こいし} は {落|お}ちない', 0, '〜かねない: it could well happen.'), o('{大|おお}きな {落石|らくせき} は 、 {雨|あめ} を {呼|よ}ぶ', 0, 'It is the pebble that may bring on the rockfall.')] })],
  } };
  C.challenges['cr.lw_loads'] = { title: J('{荷|に} の {札|ふだ}', 'The load tags'), tiers: {
    F: [ch({ item: 'v:荷物', ctx: { jp: 'にもつ の ふだ ： 「さかした ・ ソノ さま」 「なかやま ・ たけや」 。 つぎ の しゅく は さかした 。', en: '' }, prompt: { en: 'Which load comes off at the next station?' },
      options: [o('ソノ さま の にもつ', 1), o('たけや の にもつ', 0, 'たけや is at なかやま, further up.')] })],
    E: [ch({ item: 'v:札', ctx: { jp: '{荷|に} の {札|ふだ} ： 「{坂下|さかした} ・ {飛脚宿|ひきゃくやど} ・ ソノ {様|さま}」 「{中山|なかやま} ・ {竹屋|たけや} ・ セイベエ {様|さま}」', en: '' }, prompt: { en: 'Sada asks which one is for Sakashita.' },
      options: [o('ソノ {様|さま} の {荷|に}', 1), o('セイベエ {様|さま} の {荷|に}', 0, 'セイベエ is at Nakayama, the Take.')] })],
    I: [ch({ item: 'g:relative_clause', ctx: { jp: 'サダ ： 「{坂下|さかした} で {降|お}ろす {荷|に} は 、 {濡|ぬ}れて も いい {炭|すみ} だ 。 {中山|なかやま} へ {行|い}く {荷|に} は 、 {濡|ぬ}れて は いけない {紙|かみ} だ 。」 {雨|あめ} が {降|ふ}り{出|だ}した 。', en: '' }, prompt: { en: 'Which load needs covering first?' },
      options: [o('{中山|なかやま} へ {行|い}く {紙|かみ} の {荷|に}', 1), o('{坂下|さかした} で {降|お}ろす {炭|すみ} の {荷|に}', 0, 'The charcoal may get wet; the paper must not.')] })],
    A: [ch({ item: 'g:omission', ctx: { jp: 'サダ ： 「{上|うえ} の は {濡|ぬ}らす な 。 {下|した} の は 、 まあ 、 いい 。」 （{上|うえ} に {積|つ}んで ある の は {紙|かみ} 、 {下|した} は {炭|すみ}）', en: '' }, prompt: { en: 'What does Sada mean, in so few words?' },
      options: [o('{上|うえ} の {紙|かみ} は {濡|ぬ}らさない で 。 {下|した} の {炭|すみ} は {濡|ぬ}れて も かまわない 。', 1), o('{上|うえ} も {下|した} も {濡|ぬ}らして は いけない 。', 0, 'まあ、いい: the lower one doesn\'t matter.'), o('{下|した} の {荷|に} を {上|うえ} に {積|つ}み{直|なお}して ほしい 。', 0, 'He says nothing about re-stacking.')] })],
  } };
  C.challenges['cr.lw_gauge'] = { title: J('{水|みず} の {目盛|めも}り', 'The water gauge'), tiers: {
    F: [ch({ item: 'v:橋', ctx: { jp: 'くい ： 「みず が しろい せん@線 より うえ なら 、 はし を わたる 。」 いま 、 みず は しろい せん@線 より うえ 。', en: '' }, prompt: { en: 'How do you cross?' },
      options: [o('はし を わたる', 1), o('あさせ を わたる', 0, 'The water is over the white line: the bridge.')] })],
    E: [ch({ item: 'g:comp_yori_hou', ctx: { jp: '{杭|くい} ： 「{水|みず} が {白|しろ}い {線|せん} より {高|たか}い {日|ひ} は 、 {浅瀬|あさせ} より {橋|はし} の {方|ほう} が {安全|あんぜん} です 。」 {今日|きょう} は {線|せん} より {高|たか}い 。', en: '' }, prompt: { en: 'Which way is safer today?' },
      options: [o('{橋|はし}', 1), o('{浅瀬|あさせ}', 0, '橋の方が安全: the bridge is safer.')] })],
    I: [ch({ item: 'g:cond_nara', ctx: { jp: '{杭|くい} ： 「{浅瀬|あさせ} を {渡|わた}る なら 、 {水|みず} が {膝|ひざ} より {低|ひく}い {時|とき} に 。」 {今日|きょう} は {膝|ひざ} より {上|うえ} まで {来|き}て いる 。', en: '' }, prompt: { en: 'A traveller wants to wade the shallows today. What do you say?' },
      options: [o('{今日|きょう} は {浅瀬|あさせ} を {渡|わた}らない {方|ほう} が いい', 1), o('{膝|ひざ} まで なら {大丈夫|だいじょうぶ}', 0, 'It is above the knee today.'), o('{急|いそ}げば {渡|わた}れる', 0, 'The post says nothing about hurrying.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {石|いし} ： 「{水|みず} {出|い}づれば 、 {上|かみ} の {浅瀬|あさせ} を {渡|わた}る べし 。」 {新|あたら}しい {杭|くい} ： 「{今|いま} は {橋|はし} が ある 。 {水|みず} の {多|おお}い {日|ひ} は 、 {橋|はし} を {使|つか}う こと 。」', en: '' }, prompt: { en: 'The old stone and the new post disagree. Which do you follow, and why?' },
      options: [o('{新|あたら}しい {杭|くい} 。 {石|いし} の {頃|ころ} に は 、 まだ {橋|はし} が なかった 。', 1), o('{古|ふる}い {石|いし} 。 {古|ふる}い {方|ほう} が {正|ただ}しい 。', 0, 'The stone was carved before there was a bridge.'), o('どちら も {同|おな}じ こと を {言|い}って いる 。', 0, 'One says the upper shallows, the other the bridge.')] })],
  } };
  C.challenges['cr.lw_kajika'] = { title: J('カジカ の {歌|うた}', 'The kajika\'s song'), tiers: {
    F: [ch({ item: 'v:蛙', ctx: { jp: 'ふだ ： 「カジカ を とらないで 。 さわ の うた が きえる 。」', en: '' }, prompt: { en: 'The child has caught a frog in a jar. What does the sign ask?' },
      options: [o('カジカ を とらないで', 1), o('カジカ を たくさん とって', 0, 'とらないで: please don\'t catch them.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{札|ふだ} ： 「カジカ を {捕|と}らないで ください 。 {沢|さわ} の {歌|うた} が {消|き}えて しまいます 。」', en: '' }, prompt: { en: 'Why does the sign ask it?' },
      options: [o('{沢|さわ} の {歌|うた} が {消|き}えて しまう から', 1), o('カジカ が {噛|か}む から', 0, 'The reason is the song.'), o('{沢|さわ} が {危|あぶ}ない から', 0, 'The reason is the song.')] })],
    I: [ch({ item: 'g:cond_to', ctx: { jp: '{札|ふだ} ： 「カジカ が いなく なる と 、 {夏|なつ} の {沢|さわ} は {静|しず}か に なる 。」', en: '' }, prompt: { en: 'What happens if the frogs go?' },
      options: [o('{夏|なつ} の {沢|さわ} が {静|しず}か に なる', 1), o('{沢|さわ} の {水|みず} が {増|ふ}える', 0, 'いなくなると: once they are gone, the stream goes quiet.'), o('{夏|なつ} が {来|こ}なく なる', 0, 'Summer still comes, only quieter.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: '{子|こ} ： 「…… {一匹|いっぴき} だけ でも 、 だめ かな 。 {家|うち} で {聞|き}きたい ん だ けど 。」', en: '' }, prompt: { en: 'What is the child asking, and what fits the sign\'s reason?' },
      options: [o('{一匹|いっぴき} なら {持|も}って {帰|かえ}れる か と {聞|き}いて いる 。 「{歌|うた} は 、 {沢|さわ} に {聞|き}きに {来|く}れば いい」 と {答|こた}える 。', 1), o('もっと {捕|と}りたい と {言|い}って いる 。', 0, '一匹だけでも: even just one.'), o('{家|いえ} に {帰|かえ}りたい と {言|い}って いる 。', 0, 'They want to hear the frogs at home.')] })],
  } };
  C.challenges['cr.lw_logs'] = { title: J('{流|なが}れて くる {木|き}', 'Logs coming down'), tiers: {
    F: [ch({ item: 'v:昼', ctx: { jp: 'うえ から の こえ ： 「ひる まで 、 さわ に はいらないで ！」', en: '' }, prompt: { en: 'Until when should you stay out of the stream?' },
      options: [o('ひる まで', 1), o('よる まで', 0, 'ひる: noon.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: 'ヤヘイ ： 「{昼|ひる} まで {沢|さわ} に {入|はい}らないで くれ ！ {上|うえ} から {木|き} を {流|なが}す から な ！」', en: '' }, prompt: { en: 'Why must you keep out?' },
      options: [o('{上|うえ} から {木|き} を {流|なが}す から', 1), o('{水|みず} が {冷|つめ}たい から', 0, 'から gives the reason: logs.'), o('{昼|ひる} ご{飯|はん} だ から', 0, '昼まで: until noon.')] })],
    I: [ch({ item: 'g:uchi_ni', ctx: { jp: 'ヤヘイ ： 「{木|き} が {流|なが}れて いる うち は 、 {橋|はし} の {下|した} に も {寄|よ}らないで くれ 。」', en: '' }, prompt: { en: 'A traveller wants to fill a water bottle under the bridge. What do you say?' },
      options: [o('{木|き} が {流|なが}れて いる {間|あいだ} は 、 {橋|はし} の {下|した} に {寄|よ}らない で', 1), o('{橋|はし} の {下|した} なら {大丈夫|だいじょうぶ}', 0, '橋の下にも寄らないで: not even under the bridge.')] })],
    A: [ch({ item: 'g:cr_tono', ctx: { jp: 'ヤヘイ ： 「{坂下|さかした} の {衆|しゅう} に 、 {昼|ひる} まで は {沢|さわ} に {入|はい}る な 、 と {伝|つた}えて くれ 。」', en: '' }, prompt: { en: 'How do you pass it on, politely, at Sakashita?' },
      options: [o('{昼|ひる} まで は {沢|さわ} に {入|はい}らない よう に 、 と の {伝言|でんごん} です 。', 1), o('{昼|ひる} から {沢|さわ} に {入|はい}れ 、 と の {伝言|でんごん} です 。', 0, 'まで: until noon, keep out.'), o('{沢|さわ} に {入|はい}る な 。', 0, 'A bare command, and it drops 昼まで: pass it on as a message, との伝言です.')] })],
  } };
  C.challenges['cr.lw_lines'] = { title: J('{二色|にしょく} の {線|せん}', 'Two colours of line'), tiers: {
    F: [ch({ item: 'v:地図', ctx: { jp: 'ちず ： 「くろ ＝ あるいた みち 。 あか ＝ きいた みち 。」 がけみち は あか 。', en: '' }, prompt: { en: 'Did Rin walk the ledge herself?' },
      options: [o('あるいて いない 。 きいた だけ 。', 1), o('あるいた', 0, 'あか: a road she was told about.')] })],
    E: [ch({ item: 'v:線', ctx: { jp: '{地図|ちず} ： 「{黒|くろ} ＝ {歩|ある}いた {道|みち} 。 {赤|あか} ＝ {聞|き}いた {道|みち} 。」 {本道|ほんどう} は {黒|くろ} 、 {崖道|がけみち} は {赤|あか} 。', en: '' }, prompt: { en: 'Which road on the map has someone actually walked?' },
      options: [o('{本道|ほんどう}', 1), o('{崖道|がけみち}', 0, 'The ledge is red: hearsay.')] })],
    I: [ch({ item: 'g:rashii', ctx: { jp: '{旅人|たびびと} ： 「{崖道|がけみち} の {方|ほう} が {近|ちか}い らしい よ 。」 {地図|ちず} で は 、 {崖道|がけみち} は {赤|あか} だ 。', en: '' }, prompt: { en: 'How sure is the traveller?' },
      options: [o('{聞|き}いた だけ 。 {地図|ちず} も {聞|き}いた {話|はなし} だ 。', 1), o('{自分|じぶん} で {歩|ある}いて {確|たし}かめた', 0, 'らしい: they heard it.'), o('{地図|ちず} が {黒|くろ} だ から {確|たし}か', 0, 'The ledge is red on the map: hearsay.')] })],
    A: [ch({ item: 'g:adv_wake_dewa_nai', ctx: { jp: 'リン の {書|か}き{込|こ}み ： 「{赤|あか} の {線|せん} が {間違|まちが}い だ と いう わけ で は ない 。 {確|たし}かめて いない だけ だ 。」', en: '' }, prompt: { en: 'What does Rin\'s note say about the red lines?' },
      options: [o('{間違|まちが}い と は {限|かぎ}らない 。 まだ {確|たし}かめて いない だけ 。', 1), o('{赤|あか} の {線|せん} は {全部|ぜんぶ} {間違|まちが}い だ 。', 0, 'わけではない denies exactly that.'), o('{赤|あか} の {線|せん} は {確|たし}かめた {道|みち} だ 。', 0, '確かめていない: not checked.')] })],
  } };
  C.challenges['cr.lw_stakes'] = { title: J('リン の {杭|くい}', 'Rin\'s stakes'), tiers: {
    F: [ch({ item: 'g:counters', ctx: { jp: 'ふだ ： 「10 ぽ ごと に くい を 1 ぽん 。」 くい が 3 ぼん ある 。', en: '' }, prompt: { en: 'How many paces from the start is the third stake?' },
      options: [o('30 ぽ', 1), o('3 ぽ', 0, 'One stake every ten paces.'), o('10 ぽ', 0, 'That is the first.')] })],
    E: [ch({ item: 'g:counters', ctx: { jp: '{札|ふだ} ： 「{十歩|じっぽ} ごと に {杭|くい} を {一本|いっぽん} 。 {五十歩|ごじっぽ} まで 。 リン」', en: '' }, prompt: { en: 'How many stakes should there be?' },
      options: [o('{五本|ごほん}', 1), o('{十本|じゅっぽん}', 0, 'Fifty paces, one every ten: five.'), o('{五十本|ごじゅっぽん}', 0, 'One every ten paces, not every pace.')] })],
    I: [ch({ item: 'g:mod_goto', ctx: { jp: '{札|ふだ} ： 「{十歩|じっぽ} ごと に {杭|くい} を {一本|いっぽん} 。 {五十歩|ごじっぽ} まで 。」 {今|いま} 、 {杭|くい} は {三本|さんぼん} しか ない 。 {旅人|たびびと} が {馬|うま} を {繋|つな}ぐ の に {抜|ぬ}いた らしい 。', en: '' }, prompt: { en: 'How many stakes must go back?' },
      options: [o('{二本|にほん}', 1), o('{三本|さんぼん}', 0, 'Five in all, three still there.'), o('{五本|ごほん}', 0, 'Three are still in.')] })],
    A: [ch({ item: 'g:mod_goto', ctx: { jp: '{札|ふだ} の {裏|うら} ： 「{曲|ま}がり{角|かど} ごと に {一本|いっぽん} 。 {真|ま}っ{直|す}ぐ な {所|ところ} は 、 {二十歩|にじっぽ} ごと に {一本|いっぽん} 。」 {六十歩|ろくじっぽ} の {真|ま}っ{直|す}ぐ な {道|みち} が ある 。', en: '' }, prompt: { en: 'How many stakes on that straight stretch?' },
      options: [o('{三本|さんぼん}', 1), o('{六本|ろっぽん}', 0, 'On the straight it is every twenty paces.'), o('{一本|いっぽん}', 0, 'One per corner; the straight has its own rule.')] })],
  } };
  C.challenges['cr.lw_horse'] = { title: J('{馬|うま} の クリ', 'Kuri the pack horse'), tiers: {
    F: [ch({ item: 'v:前', ctx: { jp: 'ゲンジ ： 「うま に は 、 まえ から ちかづいて 。 うしろ は だめ 。」', en: '' }, prompt: { en: 'How do you approach the horse?' },
      options: [o('まえ から', 1), o('うしろ から', 0, 'うしろはだめ: not from behind.')] })],
    E: [ch({ item: 'g:v_te_kara', ctx: { jp: 'ゲンジ ： 「{声|こえ} を {掛|か}けて から 、 {前|まえ} から {近|ちか}づいて くれ 。」', en: '' }, prompt: { en: 'In what order?' },
      options: [o('{声|こえ} を {掛|か}けて 、 それから {前|まえ} から {近|ちか}づく', 1), o('{近|ちか}づいて から 、 {声|こえ} を {掛|か}ける', 0, '掛けてから: call to it first.')] })],
    I: [ch({ item: 'g:cond_to', ctx: { jp: 'ゲンジ ： 「{急|きゅう} に {動|うご}く と 、 クリ は {驚|おどろ}く 。 ゆっくり {手綱|たづな} を {引|ひ}けば 、 {歩|ある}く 。」', en: '' }, prompt: { en: 'How do you get Kuri moving?' },
      options: [o('ゆっくり {手綱|たづな} を {引|ひ}く', 1), o('{急|きゅう} に {引|ひ}っ{張|ぱ}る', 0, '急に動くと驚く: sudden moves startle Kuri.'), o('{後|うし}ろ から {押|お}す', 0, 'Pull the reins, slowly.')] })],
    A: [ch({ item: 'g:casual_contractions', ctx: { jp: 'ゲンジ ： 「こいつ は {風|かぜ} の {匂|にお}い を {嗅|か}いでる だけ さ 。 {急|せ}かす こた ない 。」', en: '' }, prompt: { en: 'What is Genji saying?' },
      options: [o('{風|かぜ} の {匂|にお}い を {嗅|か}いで いる だけ だ から 、 {急|せ}かす こと は ない', 1), o('{風|かぜ} が {強|つよ}い から 、 {急|いそ}げ', 0, 'こたない is ことはない: no need.'), o('{馬|うま} が {病気|びょうき} だ', 0, '嗅いでるだけ: only sniffing the wind.')] })],
  } };
  C.challenges['cr.lw_voice'] = { title: J('{霧|きり} の {中|なか} の {声|こえ}', 'A voice in the fog'), tiers: {
    F: [ch({ item: 'v:灯籠', ctx: { jp: 'こえ ： 「まえ に とうろう が みえます ！」', en: '' }, prompt: { en: 'Where is the voice?' },
      options: [o('とうろう の ちかく', 1), o('いし の ちかく', 0, 'They said とうろう, a lantern.')] })],
    E: [ch({ item: 'g:v_te_iru', ctx: { jp: '{声|こえ} ： 「{前|まえ} に {灯籠|とうろう} が {見|み}えます 。 {道|みち} が {分|わ}かりません 。」', en: '' }, prompt: { en: 'What do you call back?' },
      options: [o('{灯籠|とうろう} の {所|ところ} で {待|ま}って いて ください ！', 1), o('{走|はし}って ください ！', 0, 'In fog, running is how people get lost.'), o('{目|め} を {閉|と}じて ください ！', 0, 'Keep them where they are, by the lantern.')] })],
    I: [ch({ item: 'g:you_mitai', ctx: { jp: '{声|こえ} ： 「{道|みち} が {下|くだ}って いる みたい です 。 {水|みず} の {音|おと} も します 。」 {霧|きり} の {坂|さか} の {道|みち} は 、 {上|のぼ}り だ 。', en: '' }, prompt: { en: 'What is happening to the traveller?' },
      options: [o('{道|みち} から {外|はず}れて 、 {沢|さわ} の {方|ほう} へ {下|お}りて いる', 1), o('{正|ただ}しく {上|のぼ}って いる', 0, 'The road climbs; they are going down.'), o('もう {宿|しゅく} に {着|つ}いた', 0, 'Water sounds mean the stream, not a station.')] })],
    A: [ch({ item: 'g:ni_chigainai', ctx: { jp: '{声|こえ} ： 「{目|め} の {前|まえ} の {石|いし} に 、 『{霧|きり} の {日|ひ} は 、 {本道|ほんどう} を {行|い}く べし』 と {彫|ほ}って あります 。」', en: '' }, prompt: { en: 'Where must the traveller be?' },
      options: [o('{霧|きり} の {坂|さか} の {道標|みちしるべ} の {前|まえ} に {違|ちが}いない', 1), o('{関所|せきしょ} の {前|まえ} に {違|ちが}いない', 0, 'That carving is the fog slope\'s waystone.'), o('どこ か {分|わ}からない', 0, 'The words on the stone tell you exactly.')] })],
  } };
  C.challenges['cr.lw_tracks'] = { title: J('{大|おお}きな {足跡|あしあと}', 'Huge tracks'), tiers: {
    F: [ch({ item: 'v:牛', ctx: { jp: 'りょうし ： 「くも の うし は ひと を たべる 、 と きいた 。」', en: '' }, prompt: { en: 'Did the hunter see it eat anyone?' },
      options: [o('みて いない 。 きいた だけ 。', 1), o('みた', 0, 'ときいた: they heard it.')] })],
    E: [ch({ item: 'g:cr_to_itte', ctx: { jp: '{猟師|りょうし} ： 「{麓|ふもと} の {人|ひと} が 、 『{雲|くも} の {牛|うし} は {人|ひと} を {食|た}べる』 と {言|い}って いました 。」', en: '' }, prompt: { en: 'Whose story is it?' },
      options: [o('{麓|ふもと} の {人|ひと} の {話|はなし}', 1), o('{猟師|りょうし} が {見|み}た {話|はなし}', 0, 'と言っていました: someone else said it.')] })],
    I: [ch({ item: 'g:rashii', ctx: { jp: '{猟師|りょうし} ： 「{雲|くも} の {牛|うし} は {人|ひと} を {食|く}う らしい 。 だから {鉄砲|てっぽう} を {持|も}って きた 。」 あなた は {霧|きり} の {坂|さか} で 、 その {牛|うし} に {会|あ}った 。 {大|おお}きかった が 、 {霧|きり} で できて いた 。', en: '' }, prompt: { en: 'What do you tell them?' },
      options: [o('それ は {噂|うわさ} です 。 わたし が {会|あ}った {牛|うし} は 、 {霧|きり} で できて いました 。', 1), o('{本当|ほんとう} です 。 {気|き} を つけて ください 。', 0, 'You met it: it was mist, not a man-eater.'), o('{牛|うし} は いません 。', 0, 'You did meet it.')] })],
    A: [ch({ item: 'g:adv_ni_suginai', ctx: { jp: '{馬子|まご} の ゲンジ ： 「{雲|くも} の {牛|うし} は 、 {霧|きり} が {牛|うし} の {形|かたち} を して いる に すぎん 。 {人|ひと} を {食|く}う など 、 {噂|うわさ} だ 。」', en: '' }, prompt: { en: 'What does Genji hold the Cloud Ox to be?' },
      options: [o('{牛|うし} の {形|かたち} を した {霧|きり} に すぎない', 1), o('{人|ひと} を {食|く}う {本物|ほんもの} の {牛|うし}', 0, '噂だ: just talk.'), o('{霧|きり} を {食|た}べる {牛|うし}', 0, 'It is the mist that takes an ox\'s shape.')] })],
  } };
  C.challenges['cr.lw_papers'] = { title: J('{落|お}ちた {手形|てがた}', 'Dropped papers'), tiers: {
    F: [ch({ item: 'v:名前', ctx: { jp: 'てがた ： 「なまえ ： トヨ 。 いきさき ： くもい 。」 ひとり は 「くもい へ いく」 と いう 。 もう ひとり は 「うまがえし へ かえる」 と いう 。', en: '' }, prompt: { en: 'Whose papers are these?' },
      options: [o('くもい へ いく ひと', 1), o('うまがえし へ かえる ひと', 0, 'いきさき: くもい.')] })],
    E: [ch({ item: 'v:行き先', ctx: { jp: '{手形|てがた} ： 「{名前|なまえ} ： トヨ 。 {行|い}き{先|さき} ： {雲居宿|くもいじゅく} 。」 {一人|ひとり} は 「{雲居|くもい} へ {行|い}きます」 、 もう {一人|ひとり} は 「{馬返|うまがえ}し へ {帰|かえ}ります」 。', en: '' }, prompt: { en: 'Who gets these papers?' },
      options: [o('{雲居|くもい} へ {行|い}く {人|ひと}', 1), o('{馬返|うまがえ}し へ {帰|かえ}る {人|ひと}', 0, 'The papers say 雲居宿.')] })],
    I: [ch({ item: 'g:relative_clause', ctx: { jp: '{手形|てがた} が {二枚|にまい} 。 {一枚|いちまい} は {判|はん} が {二|ふた}つ 、 もう {一枚|いちまい} は {一|ひと}つ 。 スミ さん の {話|はなし} で は 、 「{関所|せきしょ} を {越|こ}える {人|ひと} の {手形|てがた} に は 、 {判|はん} が {二|ふた}つ {要|い}る 。」', en: '' }, prompt: { en: 'Which papers belong to the one crossing the Barrier?' },
      options: [o('{判|はん} が {二|ふた}つ ある {手形|てがた}', 1), o('{判|はん} が {一|ひと}つ の {手形|てがた}', 0, 'Crossing the Barrier needs two seals.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{旅人|たびびと} ： 「{恐|おそ}れ{入|い}ります が 、 そちら は {雲居|くもい} へ お{越|こ}し に なる {方|かた} の {手形|てがた} で は ございません か 。」', en: '' }, prompt: { en: 'What is the traveller asking you?' },
      options: [o('その {手形|てがた} は 、 {雲居|くもい} へ {行|い}く {人|ひと} の もの で は ない か', 1), o('{雲居|くもい} へ {一緒|いっしょ} に {行|い}かない か', 0, 'お越しになる方: the person going there; it is about whose papers.'), o('{手形|てがた} を {売|う}って ほしい', 0, 'Nothing about buying.')] })],
  } };
  C.challenges['cr.lw_shelter'] = { title: J('{小屋|こや} の {薪|まき}', 'The shelter\'s firewood'), tiers: {
    F: [ch({ item: 'v:薪', ctx: { jp: 'ふだ ： 「まき を つかったら 、 つぎ の ひと の ため に たす 。」 まき が すこし しか ない 。', en: '' }, prompt: { en: 'The woodpile is low. What does the card ask?' },
      options: [o('つぎ の ひと の ため に 、 まき を たす', 1), o('まき を ぜんぶ つかう', 0, 'たす: add more, for the next person.')] })],
    E: [ch({ item: 'g:tame', ctx: { jp: '{札|ふだ} ： 「{次|つぎ} の {人|ひと} の ため に 、 {薪|まき} を {足|た}して ください 。」', en: '' }, prompt: { en: 'Who is the firewood for?' },
      options: [o('{次|つぎ} に {来|く}る {人|ひと}', 1), o('{小屋|こや} の {持|も}ち{主|ぬし}', 0, '次の人のために: for the next person.')] })],
    I: [ch({ item: 'g:te_oku', ctx: { jp: '{札|ふだ} ： 「{出|で}る {前|まえ} に 、 {薪|まき} を {足|た}して おく こと 。 {火|ひ} は {消|け}して おく こと 。」', en: '' }, prompt: { en: 'Before you leave, what two things?' },
      options: [o('{薪|まき} を {足|た}して 、 {火|ひ} を {消|け}す', 1), o('{薪|まき} を {足|た}して 、 {火|ひ} を {点|つ}けて おく', 0, '消しておく: put it out.'), o('{火|ひ} を {消|け}して 、 {薪|まき} を {持|も}って {行|い}く', 0, 'The wood stays, and more is added.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {札|ふだ} ： 「{薪|まき} を {用|もち}いし {者|もの} は 、 {同|おな}じ だけ {補|おぎな}う べし 。」', en: '' }, prompt: { en: 'What does the old card require?' },
      options: [o('{使|つか}った {分|ぶん} だけ 、 {薪|まき} を {足|た}す', 1), o('{薪|まき} を {使|つか}って は いけない', 0, '用いし者: whoever has used it.'), o('{倍|ばい} の {薪|まき} を {足|た}す', 0, '同じだけ: the same amount.')] })],
  } };
  C.challenges['cr.lw_turns'] = { title: J('{九十九折|つづらお}り', 'The switchbacks'), tiers: {
    F: [ch({ item: 'g:counters', ctx: { jp: 'こども ： 「まがりかど 、 いち 、 に 、 さん 、 よん 、 ご ！ …… あと きゅうじゅうよん ？」 みち の まがりかど は ぜんぶ で いつつ 。', en: '' }, prompt: { en: 'How many turns does this road really have?' },
      options: [o('いつつ', 1), o('きゅうじゅうきゅう', 0, 'You can count them: five.')] })],
    E: [ch({ item: 'v:曲がり角', ctx: { jp: '{子|こ} ： 「{曲|ま}がり{角|かど} が {九十九|きゅうじゅうきゅう} ある ん でしょ ？ {看板|かんばん} に {書|か}いて ある もん 。」', en: '' }, prompt: { en: 'What does the child think?' },
      options: [o('{曲|ま}がり{角|かど} が {九十九|きゅうじゅうきゅう} ある', 1), o('{道|みち} が {九十九|きゅうじゅうきゅう} {本|ほん} ある', 0, '曲がり角: turns.')] })],
    I: [ch({ item: 'g:wake', ctx: { jp: '{道標|みちしるべ} ： 「{九十九|つづら} は {数|かず} で は ない 。 つづら の {蔓|つる} の よう に {曲|ま}がる {道|みち} の こと 。」', en: '' }, prompt: { en: 'So why did the child count only five?' },
      options: [o('{九十九|つづら} は {数|かず} で は ない から 、 {五|いつ}つ で {合|あ}って いる わけ だ', 1), o('{残|のこ}り は {雪|ゆき} の {下|した} に ある', 0, 'The waystone says it is not a number.'), o('{子|こ} が {数|かぞ}え{間違|まちが}えた', 0, 'Five is right.')] })],
    A: [ch({ item: 'g:adv_to_iu_yori', ctx: { jp: '「{九十九折|つづらお}り と は 、 {数|かず} と いう より 、 {形|かたち} の {名前|なまえ} だ 。」', en: '' }, prompt: { en: 'What is the word 九十九折り, then?' },
      options: [o('{数|かず} より も 、 {道|みち} の {形|かたち} を {言|い}う {名前|なまえ}', 1), o('{九十九|きゅうじゅうきゅう} の {曲|ま}がり{角|かど} の {数|かず}', 0, 'というより: rather than a number.'), o('{峠|とうげ} の {高|たか}さ', 0, 'It names the winding shape.')] })],
  } };
  C.challenges['cr.lw_stones'] = { title: J('{雪|ゆき} の {下|した} の {道標|みちしるべ}', 'Waystones under the snow'), tiers: {
    F: [ch({ item: 'v:左', ctx: { jp: 'いし ： 「つぎ の いし は 、 おおきな いわ の ひだり 。」', en: '' }, prompt: { en: 'Where is the next stone?' },
      options: [o('いわ の ひだり', 1), o('いわ の みぎ', 0, 'ひだり: left.')] })],
    E: [ch({ item: 'g:kosoado', ctx: { jp: '{石|いし} ： 「{次|つぎ} の {石|いし} は 、 あの {大|おお}きな {岩|いわ} の {左|ひだり} 、 {五十歩|ごじっぽ} {先|さき} 。」', en: '' }, prompt: { en: 'Which way, and how far?' },
      options: [o('{岩|いわ} の {左|ひだり} 、 {五十歩|ごじっぽ}', 1), o('{岩|いわ} の {右|みぎ} 、 {五十歩|ごじっぽ}', 0, '左: left.'), o('{岩|いわ} の {左|ひだり} 、 {十歩|じっぽ}', 0, '五十歩: fifty paces.')] })],
    I: [ch({ item: 'g:cond_ba', ctx: { jp: '{石|いし} の {裏|うら} ： 「{雪|ゆき} が {深|ふか}ければ 、 {石|いし} の {頭|あたま} を {掘|ほ}って {確|たし}かめる こと 。」 {今日|きょう} は {雪|ゆき} が {深|ふか}い 。', en: '' }, prompt: { en: 'What do you do at each stone today?' },
      options: [o('{石|いし} の {頭|あたま} を {掘|ほ}って {確|たし}かめる', 1), o('{確|たし}かめず に {進|すす}む', 0, '深ければ: deep snow means dig and check.'), o('{雪|ゆき} が {溶|と}ける まで {待|ま}つ', 0, 'The stone says to dig, not to wait.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {石|いし} ： 「{石|いし} {見|み}えざれば 、 {杖|つえ} に て {雪|ゆき} を {探|さぐ}る べし 。」', en: '' }, prompt: { en: 'What does the old stone say to do?' },
      options: [o('{石|いし} が {見|み}えない とき は 、 {杖|つえ} で {雪|ゆき} の {中|なか} を {探|さぐ}る', 1), o('{石|いし} が {見|み}えたら 、 {杖|つえ} を {置|お}く', 0, '見えざれば: if it cannot be seen.'), o('{杖|つえ} を {雪|ゆき} に {立|た}てて {目印|めじるし} に する', 0, '探る: feel about, probe.')] })],
  } };

  // ---- W6: return keys ----------------------------------------------------------------------------------------------
  L.seal('cr_inns', { map: 'cr.nakayama', x: 25, y: 15, p: 'chest', needs: 'mod_zentai', opens: 'lw_cr_inns_open', scene: 'yn.lw_cr_inns_open',
    hint: ['{宿場|しゅくば} の {寄合|よりあい} の {箱|はこ} 。 {鍵|かぎ} が {二|ふた}つ 。 {片方|かたほう} を {回|まわ}す と 、 もう {片方|かたほう} が {固|かた}く なる 。 「{宿|しゅく} {一同|いちどう} で {開|あ}ける こと」 。', 'The station association\'s box. Two locks: turn one, and the other stiffens. "To be opened by the whole station together."'],
    openedLabel: ['{寄合|よりあい} の {箱|はこ}', 'The association\'s box, opened'], after: { p: 'chest', o: { open: true }, scene: 'yn.lw_cr_inns_after' } });
  L.seal('cr_route', { map: 'cr.oiwake_post', x: 6, y: 2, p: 'kr_scroll', needs: 'sa_hush_down', opens: 'lw_cr_route_read', scene: 'sa.lw_cr_route_open',
    hint: ['{壁|かべ} の {掛|か}け{軸|じく} 。 {継|つ}ぎ{飛脚|びきゃく} の {道順|みちじゅん} が {書|か}いて ある 。 {峠|とうげ} より {先|さき} の {名前|なまえ} だけ が 、 {上|うえ} へ {引|ひ}かれた よう に {消|き}えて いる 。', 'A hanging scroll: the relay\'s route. Only the names beyond the pass have faded, as if drawn upward.'],
    openedLabel: ['{継|つ}ぎ{飛脚|びきゃく} の {道順|みちじゅん}', 'The relay\'s route, read'], after: { p: 'kr_scroll', scene: 'sa.lw_cr_route_after' } });
  L.seal('cr_held', { map: 'cr.barrier_office', x: 11, y: 6, p: 'chest', needs: 'ed>=2&postgame', opens: 'lw_cr_held_open', scene: 'cr.lw_cr_held_open_post',
    hint: ['{番所|ばんしょ} の {隅|すみ} の {長持|ながもち} 。 {貼|は}り{紙|がみ} ： 「{関所|せきしょ} {預|あず}かり の {品|しな} 。 {関所|せきしょ} が {閉|と}じる まで 、 {開|あ}ける べからず 。」', 'A long chest in the corner of the office. A paper on it: "Goods held by the Barrier. Not to be opened until the Barrier closes."'],
    openedLabel: ['{預|あず}かり の {長持|ながもち}', 'The chest of held goods, opened'], after: { p: 'chest', o: { open: true }, scene: 'cr.lw_cr_held_after_post' } });
  C.notes.lw_cr_inns = { title: T('The association\'s old rule', '{寄合|よりあい} の {古|ふる}い {決|き}まり'), fiction: true,
    jp: '「{冬|ふゆ} の {間|あいだ} 、 {二軒|にけん} の {宿|やど} は 、 {風呂|ふろ} と {布団|ふとん} を {貸|か}し{借|か}り する こと 。」 {中山|なかやま} の {寄合|よりあい} の {古|ふる}い {記録|きろく} 。',
    en: '"Through the winter, the two inns shall lend each other baths and futons." From Nakayama station\'s old association record: what Otaki and Seibe have just agreed, agreed once before.' };
  C.notes.lw_cr_route = { title: T('The relay\'s ring', '{継|つ}ぎ{飛脚|びきゃく} の {輪|わ}'), fiction: true,
    jp: '{昔|むかし} の {継|つ}ぎ{飛脚|びきゃく} は 、 {灯落|ひおち} から {雲路|くもじ} を {登|のぼ}り 、 {峠|とうげ} を {越|こ}えて {湯|ゆ}ノ{谷|たに} へ 。 {北|きた} の {道|みち} を {通|とお}って 、 また {灯落|ひおち} へ {戻|もど}った 。',
    en: 'The old relay ran from Lanternfall up the Cloudroad, over the pass to Steamhollow, then by the north road back down to Lanternfall: a ring.' };
  C.notes.lw_cr_sekisho = { title: T('Checkpoints', '{関所|せきしょ}'), fiction: false,
    jp: '{江戸時代|えどじだい} の {関所|せきしょ} は 、 {旅人|たびびと} の {手形|てがた} を {調|しら}べた 。 「{入|い}り{鉄砲|でっぽう} に {出女|でおんな}」 と {言|い}って 、 {江戸|えど} へ {入|はい}る {鉄砲|てっぽう} と 、 {江戸|えど} から {出|で}る {女|おんな} の {人|ひと} を 、 {特|とく}に {厳|きび}しく {見|み}た 。',
    en: 'Edo-period checkpoints (関所) inspected travellers\' papers. The saying 入り鉄砲に出女 ("guns coming in, women going out") names what they watched most closely: firearms heading into Edo, and women leaving it. (Real history; the Mist Barrier is the game\'s.)' };

  // a variant scene: what you see, the task, what comes of it (or the road as it was, until next time)
  const nl = (l) => (l[0] || 'narr') + ': ' + l[1] + ' || ' + l[2];
  function ev(rid, id, intro, done, later, note) {
    L.scenes('@scene cr.lw_' + id + '\n' + intro.map(nl).join('\n') + '\n!challenge cr.lw_' + id + '\n!if var._res=0 -> later\n'
      + done.map(nl).join('\n') + (note ? '\n!note ' + note : '') + '\n!hook road_done ' + rid + ' ' + id + '\n!end\n:later\n' + later.map(nl).join('\n'));
  }
  ev('cr_leg1', 'runner', [
    ['narr', '{杉|すぎ} の {下|した} で 、 {継|つ}ぎ{飛脚|びきゃく} が {一人|ひとり} 、 {足|あし} を {押|お}さえて {座|すわ}り{込|こ}んで いる 。', 'Under the cedars a relay runner sits holding one leg.'],
    ['lw_cr_runner', '{足|あし} が つった 。 {伝言|でんごん} を {忘|わす}れ そう だ 。 {聞|き}いて 、 {言|い}って みて くれ 。 {合|あ}って いれば 、 {頭|あたま} に {戻|もど}る 。', 'Cramp. And I\'m about to lose the message. Hear it and say it back to me. If you get it right, it\'ll stick again.'],
  ], [
    ['lw_cr_runner', 'そう 、 それ だ ！ …… {足|あし} も {治|なお}った 。 {聞|き}いた まま 、 {渡|わた}して くる よ 。', 'That\'s it! …And the leg\'s better. I\'ll hand it on as I heard it.'],
    ['narr', '{飛脚|ひきゃく} は {杉並木|すぎなみき} を {走|はし}って いった 。', 'The runner sets off up the cedar avenue at a run.'],
  ], [['lw_cr_runner', '…… {違|ちが}う {気|き} が する 。 {自分|じぶん} で {思|おも}い{出|だ}す よ 。', '…That doesn\'t sound right. I\'ll remember it myself.']], 'lw_cr_as_heard');
  ev('cr_leg1', 'bear', [
    ['lw_cr_traveller', '{熊|くま} ！ {熊|くま} が いる ん です ！ …… たぶん 。', 'A bear! There\'s a bear! …I think.'],
    ['narr', '{杉|すぎ} の {陰|かげ} に 、 {黒|くろ}い もの が {見|み}える 。', 'In the shadow of the cedars, something dark.'],
  ], [
    ['narr', '{近|ちか}づいて みる と 、 {古|ふる}い {切|き}り{株|かぶ} だった 。 {旅人|たびびと} と {並|なら}んで 、 {杉並木|すぎなみき} の {終|お}わり まで {歩|ある}いた 。', 'Up close it is an old stump. You walk with the traveller to the end of the avenue.'],
    ['lw_cr_traveller', '{話|はな}し ながら {歩|ある}く と 、 {怖|こわ}く ない もの です ね 。', 'Walking and talking, it isn\'t frightening at all.'],
  ], [['lw_cr_traveller', 'や 、 やっぱり {引|ひ}き{返|かえ}します ！', 'I-I\'ll go back after all!']]);
  ev('cr_leg1', 'rota', [
    ['narr', '{一里塚|いちりづか} の {脇|わき} に 、 {箒|ほうき} が {立|た}て{掛|か}けて ある 。 {石畳|いしだたみ} に は {杉|すぎ} の {葉|は} が {積|つ}もって 、 よく {滑|すべ}る 。 {塚|つか} に {札|ふだ} が {下|さ}がって いる 。', 'A broom leans against the milestone mound. Cedar needles lie thick and slippery on the paving. A card hangs on the mound.'],
  ], [
    ['narr', '{今月|こんげつ} の {当番|とうばん} の {宿|しゅく} の {釘|くぎ} に 、 {箒|ほうき} を {掛|か}けて おいた 。 ついでに 、 {少|すこ}し {掃|は}いた 。', 'You hang the broom on the hook for this month\'s station, and sweep a little while you\'re at it.'],
  ], [['narr', '{箒|ほうき} は {塚|つか} に {立|た}て{掛|か}けた まま だ 。', 'The broom stays leaning against the mound.']]);
  ev('cr_leg2', 'cloth', [
    ['narr', '{足|あし} の {下|した} で 、 {石畳|いしだたみ} の {石|いし} が ぐらり と {動|うご}いた 。 {道標|みちしるべ} の {横|よこ} に 、 {赤|あか}い {布|ぬの} の {束|たば} と {札|ふだ} が ある 。', 'A paving stone rocks under your foot. By the waystone hang a bundle of red cloths and a card.'],
  ], [
    ['narr', '{赤|あか}い {布|ぬの} を {石|いし} の {横|よこ} に {結|むす}んだ 。 {遠|とお}く から でも 、 よく {見|み}える 。', 'You tie a red cloth by the stone. It shows from far off.'],
  ], [['narr', '{石|いし} は ぐらぐら した まま だ 。 {誰|だれ} か が {足|あし} を {取|と}られない と いい が 。', 'The stone still rocks. You hope nobody turns an ankle on it.']], 'lw_cr_red_cloth');
  ev('cr_leg2', 'pebbles', [
    ['narr', 'からから と 、 {上|うえ} から {小石|こいし} が {落|お}ちて くる {音|おと} 。 {黄色|きいろ}く なった {札|ふだ} が 、 {岩|いわ} に {貼|は}って ある 。', 'A rattle of pebbles coming down from above. A notice, gone yellow, is pasted to a rock.'],
  ], [
    ['narr', '{岩|いわ} の {陰|かげ} で {音|おと} が {止|や}む の を {待|ま}ち 、 {上|うえ} を {見|み}て から {進|すす}んだ 。 {小石|こいし} は 、 {道|みち} の {脇|わき} に {転|ころ}がって {止|と}まった 。', 'You wait behind the rock until the sound stops, look up, and go on. The pebbles have rolled to a stop at the roadside.'],
  ], [['narr', '{音|おと} は {止|や}んだ 。 でも 、 {何|なに} が {正|ただ}しかった の か 、 {分|わ}からない まま だ 。', 'The sound stops. What you should have done, you still don\'t know.']]);
  ev('cr_leg2', 'loads', [
    ['narr', '{荷|に} を {背負|せお}った {男|おとこ} が 、 {石段|いしだん} に {腰|こし} を {下|お}ろして いる 。 {杉|すぎ}ノ{木|き} の {人足|にんそく} 、 サダ だ 。', 'A man with a load on his back sits on the steps: Sada, the porter from Suginoki.'],
    ['cr_sada', '{札|ふだ} の {字|じ} が 、 {雨|あめ} で にじんだ 。 {見|み}た まま {言|い}う が 、 {俺|おれ} に は {読|よ}めん 。 {頼|たの}む 。', 'The rain\'s run the ink on the tags. I tell what I see, and I can\'t read these. Help me out.'],
  ], [
    ['cr_sada', '…… {分|わ}かった 。 {助|たす}かる 。', '…Got it. Much obliged.'],
    ['narr', 'サダ は {荷|に} を {積|つ}み{直|なお}して 、 {黙|だま}って {石段|いしだん} を {登|のぼ}って いった 。', 'Sada re-stacks the loads and climbs the steps without another word.'],
  ], [['cr_sada', '{坂下|さかした} で {聞|き}く 。 {気|き} に する な 。', 'I\'ll ask at Sakashita. Don\'t worry about it.']]);
  ev('cr_leg3', 'gauge', [
    ['narr', '{雨|あめ} の {後|あと} で 、 {沢|さわ} の {水|みず} が {増|ふ}えて いる 。 {浅瀬|あさせ} の {前|まえ} で 、 {旅人|たびびと} が {靴|くつ} を {脱|ぬ}ごう と して いる 。 {横|よこ} に 、 {白|しろ}い {線|せん} の {入|はい}った {杭|くい} 。', 'After the rain the stream is up. At the shallows a traveller is taking off their shoes. Beside them, a post with a white line painted on it.'],
  ], [
    ['narr', '{杭|くい} の {線|せん} を {見|み}せる と 、 {旅人|たびびと} は {靴|くつ} を {履|は}き{直|なお}して 、 {直|なお}った {橋|はし} の {方|ほう} へ {回|まわ}った 。', 'You show the traveller the line on the post. They put their shoes back on and go round by the mended bridge.'],
  ], [['narr', '{旅人|たびびと} は {迷|まよ}って 、 {浅瀬|あさせ} の {前|まえ} に {立|た}った まま だ 。', 'The traveller hesitates, still standing at the shallows.']]);
  ev('cr_leg3', 'kajika', [
    ['narr', '{沢|さわ} の {岸|きし} で 、 {子|こ} が {瓶|びん} を {抱|かか}えて いる 。 {中|なか} で 、 {小|ちい}さな {蛙|かえる} が {鳴|な}いて いる 。 {岸|きし} の {石|いし} に 、 {札|ふだ} 。', 'On the bank a child clutches a jar. Inside, a small frog is singing. A card stands on a stone at the water\'s edge.'],
    ['lw_cr_child', 'カジカ 、 {捕|つか}まえた ！ {家|うち} で {鳴|な}かせる ん だ 。', 'I caught a kajika! It\'s going to sing at home.'],
  ], [
    ['narr', '{子|こ} は しばらく {瓶|びん} を {見|み}て から 、 {蛙|かえる} を {沢|さわ} に {返|かえ}した 。 すぐ に 、 {笛|ふえ} の よう な {声|こえ} が {戻|もど}って きた 。', 'The child looks at the jar a while, then lets the frog back into the stream. Almost at once, the flute-like song starts up again.'],
    ['lw_cr_child', '…… {夏|なつ} に なったら 、 ここ に {聞|き}きに {来|く}る 。', '…When it\'s summer, I\'ll come here to listen.'],
  ], [['lw_cr_child', 'もう ちょっと だけ 、 {見|み}て から 。', 'Just a little longer, then.']], 'lw_cr_kajika');
  ev('cr_leg3', 'logs', [
    ['narr', '{沢|さわ} の {上|うえ} の {方|ほう} から 、 {大|おお}きな {声|こえ} が {降|ふ}って くる 。 {木|き} を {切|き}る ヤヘイ だ 。', 'A big voice comes down from upstream: Yahei, the woodcutter.'],
  ], [
    ['narr', '{沢|さわ} から {離|はな}れて {待|ま}つ と 、 {丸太|まるた} が {何本|なんぼん} も 、 {音|おと} を {立|た}てて {流|なが}れて いった 。', 'You keep back from the stream and wait. Log after log goes thundering by.'],
    ['cr_yahei', 'よし ！ {聞|き}こえた か ！ {助|たす}かった ぞ ！', 'Good! You heard me! Much obliged!'],
  ], [['narr', 'ヤヘイ の {声|こえ} は 、 {水|みず} の {音|おと} に {消|け}された 。', 'Yahei\'s voice is lost in the noise of the water.']]);
  ev('cr_leg4', 'lines', [
    ['narr', '{二人|ふたり} の {旅人|たびびと} が 、 {地図|ちず} を {広|ひろ}げて {言|い}い{合|あ}って いる 。 {中山|なかやま} の リン の {地図|ちず} だ 。 {線|せん} が {黒|くろ} と {赤|あか} で {分|わ}けて ある 。', 'Two travellers are arguing over a map spread between them: Rin\'s, from Nakayama, its lines in black and red.'],
  ], [
    ['narr', '{黒|くろ} の {線|せん} の {本道|ほんどう} を {指|さ}す と 、 {二人|ふたり} は {顔|かお} を {見合|みあ}わせて 、 {本道|ほんどう} を {行|い}く こと に した 。', 'You point to the black line of the main road. They look at each other, and decide on the main road.'],
  ], [['narr', '{二人|ふたり} は まだ {言|い}い{合|あ}って いる 。', 'They are still arguing.']], 'lw_cr_two_lines');
  ev('cr_leg4', 'stakes', [
    ['narr', '{道|みち} の {脇|わき} に 、 {細|ほそ}い {杭|くい} が {並|なら}んで いる 。 ところどころ 、 {抜|ぬ}けた {穴|あな} が ある 。 {一本|いっぽん} に 、 リン の {札|ふだ} 。', 'Thin stakes run along the roadside, with holes here and there where some have been pulled up. On one of them, a card from Rin.'],
  ], [
    ['narr', '{近|ちか}く に {落|お}ちて いた {杭|くい} を 、 {穴|あな} に {戻|もど}した 。 これ で 、 リン の {測|はか}った {線|せん} が {元|もと} に {戻|もど}る 。', 'You put the stakes lying nearby back in their holes. Rin\'s measured line is whole again.'],
  ], [['narr', '{杭|くい} は {抜|ぬ}けた まま だ 。', 'The stakes stay where they fell.']]);
  ev('cr_leg4', 'horse', [
    ['narr', '{本道|ほんどう} の {真|ま}ん{中|なか} で 、 {荷馬|にうま} が {立|た}ち{止|ど}まって 、 {動|うご}かない 。 {馬子|まご} の ゲンジ が 、 {手綱|たづな} を {持|も}って {困|こま}って いる 。', 'In the middle of the main road a pack horse has stopped dead. Genji, its driver, stands holding the reins at a loss.'],
    ['cr_genji', 'クリ の やつ 、 {機嫌|きげん} が {悪|わる}い 。 {手|て} を {貸|か}して くれる か 。 {言|い}う {通|とお}り に {頼|たの}む ぞ 。', 'Kuri\'s in a mood. Lend a hand? Do as I say, mind.'],
  ], [
    ['narr', '{言|い}われた {通|とお}り に する と 、 クリ は {鼻|はな} を {鳴|な}らして 、 また {歩|ある}き{出|だ}した 。', 'You do just as he says. Kuri snorts, and walks on.'],
    ['cr_genji', 'ほら な 。 {馬|うま} は {話|はなし} を {聞|き}く ん だ 。 {人|ひと} より も な 。', 'See? Horses listen. Better than people do.'],
  ], [['cr_genji', 'まあ いい 。 {風|かぜ} が {変|か}われば 、 {歩|ある}く さ 。', 'Never mind. Kuri will walk when the wind changes.']]);
  ev('cr_leg5', 'voice', [
    ['narr', '{急|きゅう} に {霧|きり} が {降|お}りて きた 。 {真|ま}っ{白|しろ} な {中|なか} から 、 {声|こえ} が する 。', 'All at once the fog comes down. Out of the white, a voice.'],
    ['lw_cr_traveller', 'だれ か いません か ！ {道|みち} が {分|わ}からない ん です ！', 'Is anyone there? I can\'t find the road!'],
  ], [
    ['narr', '{声|こえ} を {頼|たよ}り に {近|ちか}づく と 、 {旅人|たびびと} の {影|かげ} が {見|み}えた 。 {一緒|いっしょ} に {道|みち} へ {戻|もど}った 。', 'Following the voice, you make out the traveller\'s shape, and bring them back to the road.'],
  ], [['narr', '{霧|きり} が {晴|は}れる と 、 {声|こえ} の {主|ぬし} は 、 {自分|じぶん} で {道|みち} に {戻|もど}って いた 。', 'When the fog lifts, whoever it was has found the road on their own.']]);
  ev('cr_leg5', 'tracks', [
    ['narr', '{泥|どろ} の {上|うえ} に 、 {大|おお}きな {足跡|あしあと} が {続|つづ}いて いる 。 {鉄砲|てっぽう} を {担|かつ}いだ {猟師|りょうし} が 、 {足跡|あしあと} を {睨|にら}んで いる 。', 'Huge tracks run across the mud. A hunter, a gun on their shoulder, is glaring at them.'],
  ], [
    ['lw_cr_hunter', '…… {噂|うわさ} か 。 {確|たし}か に 、 {人|ひと} の {骨|ほね} {一本|いっぽん} {見|み}た こと が ない 。 {帰|かえ}る と しよう 。', '…Just talk, eh. True enough, I never saw so much as a bone. I\'ll be off home.'],
  ], [['lw_cr_hunter', 'ふん 。 {見|み}つけたら 、 {仕留|しと}めて やる 。', 'Hmph. If I find it, I\'ll have it.']], 'lw_cr_cloud_ox');
  ev('cr_leg5', 'papers', [
    ['narr', '{霧担|きりかつ}ぎ が {落|お}として いった の か 、 {道|みち} に {手形|てがた} が {落|お}ちて いる 。 {少|すこ}し {先|さき} で 、 {旅人|たびびと} が {二人|ふたり} 、 {荷物|にもつ} を ひっくり{返|かえ}して いる 。', 'Travel papers lie on the road: dropped by the Fog Porter, perhaps. A little further on, two travellers are turning out their bags.'],
  ], [
    ['narr', '{手形|てがた} を {持|も}ち{主|ぬし} に {返|かえ}す と 、 {深々|ふかぶか} と {頭|あたま} を {下|さ}げられた 。', 'You hand the papers back to their owner, who bows deeply.'],
  ], [['narr', '{手形|てがた} は {拾|ひろ}って おいた 。 {次|つぎ} の {宿|しゅく} で 、 {誰|だれ} か が {探|さが}して いる だろう 。', 'You pick the papers up. Someone at the next station will probably be looking for them.']]);
  ev('cr_pass', 'shelter', [
    ['narr', '{避難小屋|ひなんごや} の {薪|まき} が 、 {少|すこ}し しか {残|のこ}って いない 。 {誰|だれ} か が {使|つか}った まま 、 {出|で}て いった らしい 。 {壁|かべ} に {札|ふだ} 。', 'The shelter\'s firewood is down to a few sticks. Someone used it and left, it seems. A card on the wall.'],
  ], [
    ['narr', '{外|そと} の {枯|か}れ{枝|えだ} を {集|あつ}めて 、 {薪|まき} の {山|やま} に {足|た}した 。 {次|つぎ} の {人|ひと} は 、 {温|あたた}かい {夜|よる} を {過|す}ごせる 。', 'You gather dead wood outside and build the pile back up. Whoever comes next will have a warm night.'],
  ], [['narr', '{薪|まき} の {山|やま} は {低|ひく}い まま だ 。', 'The woodpile stays low.']], 'lw_cr_shelter');
  ev('cr_pass', 'turns', [
    ['narr', '{九十九折|つづらお}り の {曲|ま}がり{角|かど} で 、 {子|こ} が {指|ゆび} を {折|お}って {数|かぞ}えて いる 。 {親|おや} は {後|うし}ろ で {息|いき} を {切|き}らして いる 。', 'At a turn of the switchbacks a child is counting on their fingers, a parent puffing along behind.'],
  ], [
    ['narr', '{子|こ} は {道標|みちしるべ} を {見|み}て 、 {笑|わら}い{出|だ}した 。 「{九十九|きゅうじゅうきゅう} じゃ ない ん だ ！」 {親|おや} も 、 ほっと した {顔|かお} を した 。', 'The child reads the waystone and bursts out laughing: "It isn\'t ninety-nine!" The parent looks very relieved.'],
  ], [['narr', '{子|こ} は 、 {九十九|きゅうじゅうきゅう} まで {数|かぞ}える つもり で {登|のぼ}って いった 。', 'The child climbs on, meaning to count all the way to ninety-nine.']]);
  ev('cr_pass', 'stones', [
    ['narr', '{新|あたら}しい {雪|ゆき} が 、 {雪原|せつげん} の {道標|みちしるべ} を {隠|かく}して いる 。 {頭|あたま} を {出|だ}して いる {石|いし} に 、 {字|じ} が {見|み}える 。', 'Fresh snow has hidden the snowfield\'s waystones. On one that still shows its head, words.'],
  ], [
    ['narr', '{石|いし} の {言|い}う {通|とお}り に {進|すす}む と 、 {次|つぎ} の {石|いし} が {雪|ゆき} の {下|した} から {出|で}て きた 。 {道|みち} は 、 つながって いる 。', 'Going the way the stone says, you find the next stone under the snow. The road holds together.'],
  ], [['narr', '{雪|ゆき} の {中|なか} で 、 {石|いし} を {見失|みうしな}った 。 {足跡|あしあと} を {辿|たど}って {戻|もど}る 。', 'You lose the stones in the snow and follow your own tracks back.']]);

  L.scenes(`
@scene yn.lw_cr_valley_poster
narr: {新|あたら}しい {貼|は}り{紙|がみ} 。 「{湯|ゆ}ノ{谷|たに} 。 {雲路|くもじ} の {旅|たび} の {疲|つか}れ は 、 {湯|ゆ} で {流|なが}して ください 。 {上|かみ} の {湯|ゆ} 、 {下|しも} の {湯|ゆ} 、 どちら も {歓迎|かんげい} 。」 || A new poster: "Steamhollow. Wash off the weariness of the Cloudroad in hot water. The Upper House and the Lower House both welcome you."

@scene yn.lw_cr_tome_valley
!faceplayer
cr_tome: {峠|とうげ} の {向|む}こう の {湯|ゆ} の {宿|やど} から 、 {貼|は}り{紙|がみ} が {届|とど}いた の 。 {両方|りょうほう} の {宿|やど} が {仲直|なかなお}り した ん です って 。 || A poster's come from the hot-spring inns over the pass. Both houses have made up, apparently.
cr_tome: …… {半分|はんぶん} {信|しん}じて おく わ 。 {泊|と}まって みた {人|ひと} の {話|はなし} を {聞|き}く まで は ね 。 || …I'll believe half of it. Until I hear from someone who's stayed there.

@scene cr.lw_cr_ring_post
narr: {継|つ}ぎ{飛脚|びきゃく} の {新|あたら}しい {道順|みちじゅん} 。 「{追分|おいわけ} → {雲路|くもじ} の {七|なな}つ の {宿|しゅく} → {峠|とうげ} → {湯|ゆ}ノ{谷|たに} → {北|きた} の {道|みち} → {灯落|ひおち} → {追分|おいわけ}」 。 || The relay's new route: "Oiwake, the seven stations of the Cloudroad, the pass, Steamhollow, the north road, Lanternfall, and Oiwake again."
narr: {下|した} に カンベエ の {字|じ} 。 「{一周|いっしゅう} {五日|いつか} 。 {遅|おく}れる {者|もの} は {走|はし}れ 。」 || Underneath, in Kanbe's hand: "Five days round. Anyone late: run."

@scene cr.lw_cr_kanbe_ring_post
!faceplayer
cr_kanbe: {継|つ}ぎ{飛脚|びきゃく} が 、 {輪|わ} に なった 。 {出|で}た {手紙|てがみ} が 、 {山|やま} を ぐるり と {回|まわ}って 、 {灯落|ひおち} から {戻|もど}って くる 。 || The relay runs in a ring now. A letter goes out, goes all the way round the mountains, and comes back by way of Lanternfall.
cr_kanbe: {帳面|ちょうめん} が また {足|た}りん わい 。 …… {悪|わる}く ない 。 || Not enough ledger again. …Not bad.

@scene yn.lw_cr_rin_sheet
narr: リン の {新|あたら}しい {地図|ちず} 。 {峠|とうげ} の {先|さき} 、 {湯|ゆ}ノ{谷|たに} まで {線|せん} が {伸|の}びて いる 。 {全部|ぜんぶ} 、 {黒|くろ} の {線|せん} だ 。 || Rin's new map. The line runs on past the pass, all the way down to Steamhollow. Every bit of it in black.

@scene yn.lw_cr_rin_valley
!faceplayer
cr_rin: {湯|ゆ}ノ{谷|たに} まで 、 {自分|じぶん} の {足|あし} で {下|お}りて きました 。 {峠|とうげ} から {先|さき} は 、 {全部|ぜんぶ} {黒|くろ} で {描|か}けます 。 || I walked down to Steamhollow on my own feet. From the pass onwards, I can draw it all in black.
cr_rin[smile]: {湯|ゆ} に も {入|はい}りました 。 {熱|あつ}さ は 、 {地図|ちず} に は {描|か}けません けど 。 || I had a bath too. Though you can't draw how hot it was on a map.

@scene cr.lw_cr_tatsu_post
!faceplayer
cr_tatsu: …… また {来|き}た 。 {今度|こんど} は 、 {両方|りょうほう} の {宿|やど} に {予約|よやく} した 。 {一晩|ひとばん} ずつ だ 。 || …I'm back. This time I booked with both inns. One night each.
cr_tatsu: {松葉屋|まつばや} の {布団|ふとん} で {寝|ね}て 、 {竹屋|たけや} の {風呂|ふろ} に {入|はい}る 。 {一番|いちばん} {贅沢|ぜいたく} な {泊|と}まり{方|かた} だ そう だ 。 || Sleep on the Matsuba's futons, bathe in the Take's bath. The most extravagant way to stay, they say.

@scene yn.lw_cr_inns_open
!gesture pc observe prop:chest
narr: {松葉屋|まつばや} の {鍵|かぎ} と 、 {竹屋|たけや} の {鍵|かぎ} 。 {片方|かたほう} ずつ で は なく 、 {宿場|しゅくば} {全体|ぜんたい} の {鍵|かぎ} と して 、 {二|ふた}つ {一緒|いっしょ} に {回|まわ}す と 、 {箱|はこ} は {開|あ}いた 。 || The Matsuba's lock and the Take's. Not one and then the other: turned together, as the whole station's key, and the box opens.
narr: {中|なか} に は 、 {古|ふる}い {寄合|よりあい} の {記録|きろく} 。 「{冬|ふゆ} の {間|あいだ} 、 {二軒|にけん} の {宿|やど} は 、 {風呂|ふろ} と {布団|ふとん} を {貸|か}し{借|か}り する こと 。」 || Inside, the association's old record: "Through the winter, the two inns shall lend each other baths and futons."
narr: オタキ と セイベエ が {今|いま} {決|き}めた こと は 、 {昔|むかし} の {宿場|しゅくば} も {決|き}めて いた の だ 。 || What Otaki and Seibe have just agreed, the station once agreed before.
!note lw_cr_inns

@scene yn.lw_cr_inns_after
narr: {寄合|よりあい} の {箱|はこ} 。 {記録|きろく} は 、 {二軒|にけん} の {宿|やど} が {交代|こうたい} で {預|あず}かる こと に なった らしい 。 || The association's box. The two inns keep the record turn and turn about now, it seems.

@scene sa.lw_cr_route_open
!gesture pc read prop:kr_scroll
narr: {上|うえ} へ {引|ひ}かれて いた {名前|なまえ} が 、 {戻|もど}って いる 。 {峠|とうげ} の {先|さき} は 「{湯|ゆ}ノ{谷|たに}」 。 その {先|さき} は 「{北|きた} の {道|みち}」 、 そして 「{灯落|ひおち}」 。 || The names that were drawn upward have come back. Beyond the pass: Steamhollow. Then "the north road", and then Lanternfall.
narr: {継|つ}ぎ{飛脚|びきゃく} の {道|みち} は 、 {昔|むかし} 、 {輪|わ} に なって いた の だ 。 || Long ago, the relay ran in a ring.
?(slot.cr_kanbe=1) !look cr_kanbe pc
?(slot.cr_kanbe=1) cr_kanbe: …… {輪|わ} か 。 {誰|だれ} から も {聞|き}いた こと が ない 。 {帳面|ちょうめん} を {一冊|いっさつ} 、 {増|ふ}やさない と な 。 || …A ring. Nobody ever told me that. I'll need another ledger.
?(!slot.cr_kanbe=1) narr: カンベエ に {見|み}せたら 、 {帳面|ちょうめん} を {一冊|いっさつ} {増|ふ}やす だろう 。 || Show Kanbe, and he'll be needing another ledger.
!note lw_cr_route

@scene sa.lw_cr_route_after
narr: {継|つ}ぎ{飛脚|びきゃく} の {道順|みちじゅん} の {掛|か}け{軸|じく} 。 {峠|とうげ} の {先|さき} の {名前|なまえ} も 、 {今|いま} は はっきり {読|よ}める 。 || The scroll of the relay's route. The names past the pass can be read clearly now.

@scene cr.lw_cr_held_open_post
!gesture pc observe prop:chest
narr: {関所|せきしょ} は もう ない 。 {長持|ながもち} の {貼|は}り{紙|がみ} の {約束|やくそく} どおり 、 {蓋|ふた} は {開|あ}けて いい 。 || There is no Barrier any more. As the paper on the chest promised, the lid may be opened.
narr: {中|なか} に は 、 {五十年|ごじゅうねん} {分|ぶん} の {預|あず}かり{物|もの} 。 {傘|かさ} 、 {独楽|こま} 、 {文|ふみ} の {束|たば} 。 {一|ひと}つ {一|ひと}つ に 、 {持|も}ち{主|ぬし} の {名前|なまえ} と {行|い}き{先|さき} の {札|ふだ} 。 || Inside, fifty years of things held at the Barrier: umbrellas, a spinning top, a bundle of letters. Each with a tag for its owner's name and where they were going.
!look cr_sumi pc
cr_sumi: {札|ふだ} が ある なら 、 {返|かえ}せます 。 {継|つ}ぎ{飛脚|びきゃく} に {頼|たの}んで 、 {一|ひと}つ ずつ 。 …… {関所|せきしょ} の {最後|さいご} の {仕事|しごと} です ね 。 || If there's a tag, it can go back. By the relay, one by one. …The Barrier's last piece of work.
!note lw_cr_sekisho

@scene cr.lw_cr_held_after_post
narr: {空|から} に なって いく {長持|ながもち} 。 {返|かえ}す {前|まえ} の {品|しな} が 、 {札|ふだ} を {付|つ}けて {並|なら}んで いる 。 || A long chest emptying slowly, the things still to go back set out with their tags.
`);
})(RB.living);
