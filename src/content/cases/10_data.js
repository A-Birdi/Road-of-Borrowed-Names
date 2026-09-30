/* The two deduction cases (addendum §15): people, items, quests, the case
 * definitions (clues, hypotheses, sufficient evidence, hints) and the
 * pictures of the evidence, which are drawn from the maps themselves where a
 * deduction depends on where things are. Scenes: 20_parcel.js, 30_view.js;
 * placement on the maps: src/content/zz_cases.js. docs/addendum/cases.md. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  // ---- people ------------------------------------------------------------------------------
  // Hama keeps the repair bench by the ferry on the Saltglass quay: rope, floats, ferry gear.
  C.chars.cs_hama = {
    name: { en: 'Hama', jp: 'ハマ' }, voice: { pitch: 0.95 },
    look: { skin: 3, hair: 'wrap', wrapCol: '#6a8a6a', hairColor: 1, cloth: ['#5a6a5e', '#46544a', '#d8c090'], shape: 'apron', acc: [] },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#6a8a6a', collar: 'apron', bg: '#26322a' },
  };
  // Seto lives up the hill in Saltglass; her grandfather kept a workshop on the sand.
  C.chars.cs_seto = {
    name: { en: 'Seto', jp: 'セト' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#7a6a5a', '#5e5044', '#c8b8a0'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', collar: 'high', bg: '#322c28' },
  };

  // ---- items ---------------------------------------------------------------------------------
  C.items.cs_parcel = { name: T('Sealed parcel', '{封|ふう} を した {小包|こづつみ}'), key: true,
    desc: 'Addressed to "the keeper of the bell workshop, the East Landing, Saltglass". No one\'s name. The wax seal shows a small bell.' };
  C.items.cs_sketch = { name: T('Translucent sketch', '{薄|うす}い {紙|かみ} の {絵|え}'), key: true,
    desc: 'A traveller\'s sketch on very thin paper, lent by Genzō. The case record in your Journey lets you turn it over and compare it.' };

  // ---- quests (the Journey entries; their next step is never marked until you choose) ----------------
  const conceal = (id, stage) => Object.assign({ mark: 'afterHypothesis', markAt: (s) => RB.cases.markAt(s, id) }, stage);
  C.quests.cs_parcel = {
    title: T('A Parcel for a Place That Moved', '{移|うつ}った {場所|ばしょ} へ の {小包|こづつみ}'),
    stages: [conceal('parcel', {
      jp: '{名前|なまえ} の ない {宛名|あてな} の {小包|こづつみ} 。 {本当|ほんとう} は {誰|だれ} に {届|とど}ける もの か 、 {考|かんが}えよう 。',
      en: 'A parcel addressed to a job and a place, not a name. Work out who it is really for (Journey › Cases keeps what you find).',
      hint: { jp: '{宛名|あてな} は {仕事|しごと} を {指|さ}して いる 。 その {仕事|しごと} を {今|いま} {続|つづ}けて いる の は {誰|だれ} だろう 。', en: 'The address names a job. Who is doing that job now?' },
    })],
  };
  C.quests.cs_view = {
    title: T('The View on the Other Side', '{向|む}こう {側|がわ} の {景色|けしき}'),
    stages: [conceal('view', {
      jp: 'どこ の {景色|けしき} とも {合|あ}わない {絵|え} 。 どこ で {描|か}かれた の か 、 {考|かんが}えよう 。',
      en: 'A sketch that matches no view you know. Work out where it was drawn (Journey › Cases: turn it over, compare, reset).',
      hint: { jp: '{薄|うす}い {紙|かみ} に {描|か}いて ある 。 どちら の {面|めん} を {見|み}て いる だろう 。', en: 'It is drawn on very thin paper. Which side are you looking at?' },
    })],
  };

  // ---- Case A: A Parcel for a Place That Moved --------------------------------------------------
  const clue = (id, d) => (C.clues[id] = Object.assign({ id }, d));
  clue('parcel.address', { case: 'parcel', kind: 'document', title: T('The address label', '{宛名|あてな} の {札|ふだ}'),
    source: { en: 'The parcel itself', map: 'rw.warehouse' },
    jp: '{潮|しお}{硝子|がらす} 、 {東|ひがし} の {渡|わた}し{場|ば} 。 {鈴|すず} の {工房|こうぼう} の {主|あるじ} {様|さま} 。 ／ （{赤|あか}い {判|はん}） {宛先|あてさき} {不明|ふめい} ── {東|ひがし} の {渡|わた}し{場|ば} は ありません 。',
    en: '"Saltglass, the East Landing. To the keeper of the bell workshop." / (a red stamp) "Address unknown — there is no East Landing."',
    obs: { en: 'A place and a job, no one\'s name. The harbour sent it back because the East Landing no longer exists.' },
    lang: [{ w: '{主|あるじ}', en: 'the head of a house or a workshop: whoever keeps it' }, { w: '{渡|わた}し{場|ば}', en: 'a ferry landing' }, { w: '{宛先|あてさき} {不明|ふめい}', en: 'address unknown (a post office stamp)' }, { w: '〜 {様|さま}', en: 'polite "to …" on an address' }] });
  clue('parcel.seal', { case: 'parcel', kind: 'object', title: T('The wax seal', '{封|ふう} の {蝋|ろう}'),
    source: { en: 'The parcel itself', map: 'rw.warehouse' },
    obs: { en: 'Pressed with a small bell that has one notch in its right shoulder.' }, diagram: 'bell_notch' });
  clue('parcel.record', { case: 'parcel', kind: 'document', title: T('The harbour record of the landings', '{渡|わた}し{場|ば} の {記録|きろく}'),
    source: { en: 'A ledger in the Harbour Office', map: 'sg.office' },
    jp: '{東|ひがし} の {渡|わた}し{場|ば} 、 {砂|すな} で {浅|あさ}く なり {閉|と}じる 。 {渡|わた}し{船|ぶね} は {石|いし} の {岸壁|がんぺき} へ {移|うつ}る 。 {工房|こうぼう} の {備品|びひん} ── {渡|わた}し の {呼|よ}び{鈴|りん} 、 {刻|きざ}み{目|め} の ある {作業台|さぎょうだい} ── は 、 {工房|こうぼう} と {共|とも}に {移|うつ}す 。',
    en: '"East Landing: silted up; closed. The ferry moves to the stone quay. The workshop\'s fittings — the ferry\'s call bell, the notched workbench — go with the workshop."',
    obs: { en: 'It does not say where the workshop went.' },
    lang: [{ w: '{備品|びひん}', en: 'fittings, equipment belonging to a place' }, { w: '{共|とも}に', en: 'together with' }, { w: '{呼|よ}び{鈴|りん}', en: 'a bell rung to call someone' }, { w: '{岸壁|がんぺき}', en: 'a stone quay' }],
    diagram: 'harbour' });
  clue('parcel.oldsite', { case: 'parcel', kind: 'place', title: T('The old footing on the east beach', '{東|ひがし} の {浜|はま} の {土台|どだい}'),
    source: { en: 'The east beach, at the water\'s edge', map: 'sg.harbor' },
    obs: { en: 'A low stone footing where a small hut stood, and a post with an empty iron bracket. Faded letters: "East Landing". No one works here.' },
    known: { map: 'sg.harbor', id: 'cs_footing', label: T('Old stone footing: "East Landing" (no one works here now)', '{古|ふる}い {土台|どだい}'), state: 'seen', x: 53, y: 31 } });
  clue('parcel.crest', { case: 'parcel', kind: 'object', title: T('The crest on a door up the hill', '{丘|おか} の {上|うえ} の {紋|もん}'),
    source: { en: 'The door plate of a small house on the hill', map: 'sg.harbor' },
    obs: { en: 'A bell with a wavy line beneath it. No notch.' }, diagram: 'bell_wave',
    known: { map: 'sg.harbor', id: 'cs_seto', label: T('A house with a bell crest', '{紋|もん} の ある {家|いえ}'), state: 'seen', x: 51, y: 4 } });
  clue('parcel.seto_memory', { case: 'parcel', kind: 'speaker', sure: false, title: T('What Seto remembers', 'セト の {話|はなし}'),
    source: { en: 'Seto, outside her house on the hill', who: 'cs_seto', map: 'sg.harbor' },
    jp: 'うち の {祖父|そふ} は 、 {浜|はま} の ほう で {工房|こうぼう} を して いた …… と {思|おも}う の 。 わたし は {小|ちい}さくて 、 よく {覚|おぼ}えて いない けど 。',
    en: '"My grandfather kept a workshop somewhere down by the shore… I think. I was little; I don\'t really remember."' });
  clue('parcel.bench', { case: 'parcel', kind: 'object', title: T('The notched workbench on the quay', '{刻|きざ}み{目|め} の {作業台|さぎょうだい}'),
    source: { en: 'The repair bench by the ferry, on the stone quay', map: 'sg.harbor' },
    obs: { en: 'Notches cut at even spacing along its front edge, for measuring rope. Older than its keeper\'s teacher, she says.' },
    known: { map: 'sg.harbor', id: 'cs_bench', label: T('Repair bench by the ferry (notched edge)', '{作業台|さぎょうだい}'), state: 'seen', x: 38, y: 27 } });
  clue('parcel.bell', { case: 'parcel', kind: 'object', title: T('The call bell by the bench', '{呼|よ}び{鈴|りん}'),
    source: { en: 'A post beside the repair bench, on the stone quay', map: 'sg.harbor' },
    obs: { en: 'The ferry\'s call bell. Stamped on its shoulder: a small bell with one notch in its right shoulder.' }, diagram: 'bell_notch' });
  clue('parcel.makernote', { case: 'parcel', kind: 'document', title: T('The post house\'s record of marks', '{印|しるし} の {控|ひか}え'),
    source: { en: 'A ledger in Shino\'s Post House', map: 'co.post' },
    jp: '{鈴|すず} 、 {右|みぎ} の {肩|かた} に {切|き}り{込|こ}み {一|ひと}つ ── {鋳物師|いもじ} トクゾウ の {刻印|こくいん} 。 {呼|よ}び{鈴|りん} など 。 ／ {似|に}た {印|しるし} に {注意|ちゅうい} ： {潮|しお}{硝子|がらす} の セト {家|け} の {紋|もん} は 、 {鈴|すず} の {下|した} に {波|なみ} 。 {切|き}り{込|こ}み なし 。',
    en: '"A bell with one notch in its right shoulder — the stamp of the caster Tokuzō. On call bells and the like." / "Beware a look-alike: the Seto family crest in Saltglass has a wave beneath the bell, and no notch."',
    lang: [{ w: '{鋳物師|いもじ}', en: 'a metal caster (makes bells, pots)' }, { w: '{刻印|こくいん}', en: 'a stamped maker\'s mark' }, { w: '〜 {家|け}', en: 'the … family' }] });

  C.cases.parcel = {
    id: 'parcel', quest: 'cs_parcel', region: 'saltglass', keepsake: 'parcel_seal', talk: 'cs.talk_parcel',
    title: C.quests.cs_parcel.title,
    question: T('Who is the parcel really for? The label names a workshop at a landing that no longer exists.', 'この {小包|こづつみ} は 、 {本当|ほんとう} は {誰|だれ} {宛|あて} なのか 。'),
    clues: ['parcel.address', 'parcel.seal', 'parcel.record', 'parcel.oldsite', 'parcel.crest', 'parcel.seto_memory', 'parcel.bench', 'parcel.bell', 'parcel.makernote'],
    groups: { fixture: ['parcel.bench', 'parcel.bell'] },
    hypotheses: [
      { id: 'oldsite', label: T('The old East Landing itself', '{東|ひがし} の {渡|わた}し{場|ば} の {跡|あと}'), from: ['parcel.address'],
        place: { map: 'sg.harbor', x: 53, y: 31 }, placeBy: ['parcel.oldsite'],
        mismatch: T('No workshop and no one stands there now. The address asks for the workshop\'s keeper.') },
      { id: 'family', label: T('The house up the hill with the bell crest', '{丘|おか} の {上|うえ} の {紋|もん} の {家|いえ}'), from: ['parcel.crest', 'parcel.seto_memory'],
        place: { map: 'sg.harbor', npc: 'cs_seto' }, placeBy: ['parcel.crest', 'parcel.seto_memory'],
        mismatch: T('Seto: their crest has a wave under the bell and no notch, and they have kept no workshop for years.') },
      { id: 'keeper', label: T('Whoever keeps the call bell and the notched workbench now', '{今|いま} 、 {呼|よ}び{鈴|りん} と {作業台|さぎょうだい} を {守|まも}って いる {人|ひと}'), from: ['parcel.record', 'parcel.bench', 'parcel.bell'],
        place: { map: 'sg.harbor', npc: 'cs_hama' }, placeBy: ['parcel.bench', 'parcel.bell'], correct: true },
    ],
    // the transfer record, the address and the fixture as it is now; or the caster's note in place of the record
    sufficient: [['parcel.address', 'parcel.record', 'fixture'], ['parcel.address', 'parcel.makernote', 'fixture']],
    hints: [
      { kind: 'nudge', jp: '{宛名|あてな} に は {人|ひと} の {名前|なまえ} が ない 。 {場所|ばしょ} と {仕事|しごと} だけ だ 。', en: 'The label names no person: only a place and a job. Places can change; jobs can move.' },
      { kind: 'compare', jp: '{封|ふう} の {印|しるし} を 、 {見|み}た {紋|もん} や {刻印|こくいん} と {比|くら}べて みよう 。 {切|き}り{込|こ}み は ある か 。', en: 'Compare the seal on the parcel with every crest or stamp you have seen. Look for the notch.' },
      { kind: 'step', jp: '{港|みなと} の {事務所|じむしょ} の {古|ふる}い {記録|きろく} に 、 {東|ひがし} の {渡|わた}し{場|ば} の こと が {書|か}いて ある 。 {備品|びひん} が どう なった か {読|よ}もう 。', en: 'The Harbour Office keeps old records of the East Landing. Read what happened to the workshop\'s fittings — then look for them.' },
      { kind: 'solution', discloses: 'keeper', jp: '{小包|こづつみ} は 、 {岸壁|がんぺき} の {渡|わた}し{船|ぶね} の そば で {作業台|さぎょうだい} を {守|まも}る ハマ {宛|あて} だ 。 {呼|よ}び{鈴|りん} と {刻|きざ}み{目|め} の {台|だい} は 、 {工房|こうぼう} と {一緒|いっしょ} に そこ へ {移|うつ}った 。', en: 'The parcel is for Hama, who keeps the repair bench beside the ferry on the stone quay: the call bell and the notched bench moved there with the workshop.' },
    ],
    hypPrompt: T('Your own conclusion. Nothing here is marked right or wrong: offer the parcel to whoever you think it is for, and the world will tell you.'),
    result: T('The parcel was for Hama, the workshop\'s keeper now. The address named a job and a place; the workshop moved from the East Landing to the stone quay, and its call bell and notched bench went with it.', '{小包|こづつみ} は 、 {今|いま} の {工房|こうぼう} の {主|あるじ} 、 ハマ {宛|あて} だった 。 {工房|こうぼう} は {東|ひがし} の {渡|わた}し{場|ば} から {岸壁|がんぺき} へ {移|うつ}り 、 {呼|よ}び{鈴|りん} と {台|だい} も {一緒|いっしょ} に {移|うつ}って いた 。'),
    methods: {
      reasoned: T('You worked it out from what you had seen and read.'),
      early: T('You recognised the right person before the whole trail was in your notes — and it was right.'),
      helped: T('You asked for the answer and delivered it. The keepsake and everything else are the same.'),
    },
    method(s, rec, K) {
      if (K.hintLevel(s, 'parcel') >= 4) return 'helped';
      return K.sufficient(s, 'parcel') ? 'reasoned' : 'early';
    },
    // Hama asks how you knew: only what you actually observed is said
    acknowledge(s, rec, K) {
      const o = (id) => K.observed(s, id);
      const out = [];
      if (o('parcel.record')) out.push({ who: 'pc', jp: '{港|みなと} の {記録|きろく} に 、 {呼|よ}び{鈴|りん} と {作業台|さぎょうだい} は {工房|こうぼう} と {一緒|いっしょ} に {移|うつ}った 、 と あった ん です 。', en: 'The harbour record said the call bell and the workbench went with the workshop.' });
      if (o('parcel.makernote')) out.push({ who: 'pc', jp: 'シノ の {郵便所|ゆうびんじょ} の {帳面|ちょうめん} で 、 {封|ふう} の {印|しるし} が {鋳物師|いもじ} の {刻印|こくいん} だ と {分|わ}かりました 。', en: 'The post house book in Cinder Orchard said the seal was the caster\'s stamp.' });
      if (o('parcel.bell') || o('parcel.bench')) out.push({ who: 'pc', jp: 'それ で 、 {刻|きざ}み{目|め} の {台|だい} と 、 {同|おな}じ {印|しるし} の {呼|よ}び{鈴|りん} を {見|み}て 。', en: 'And then I saw your notched bench, and the call bell with the same mark.' });
      if (rec && rec.tried && rec.tried.family) out.push({ who: 'pc', jp: '{丘|おか} の {上|うえ} の {紋|もん} は {似|に}て いた けど 、 {違|ちが}いました 。', en: 'The crest up the hill looked alike, but it wasn\'t the same.' });
      if (!out.length) out.push({ who: 'pc', jp: '{一|ひと}つ ずつ {聞|き}いて {回|まわ}った だけ です 。', en: 'I just asked, one place at a time.' });
      const m = rec && rec.method;
      out.push(m === 'reasoned' ? { who: 'cs_hama', expr: 'smile', jp: 'ちゃんと {読|よ}んで 、 ちゃんと {見|み}た ん だ ね 。', en: 'You read it properly and looked properly.' }
        : m === 'helped' ? { who: 'cs_hama', expr: 'smile', jp: 'どう やって {来|き}た に しろ 、 {届|とど}いた の は ここ だ よ 。', en: 'However you got here, this is where it arrived.' }
          : { who: 'cs_hama', expr: 'smile', jp: 'いい {目|め} を してる 。', en: 'You\'ve got a good eye.' });
      return out;
    },
  };

  // ---- Case B: The View on the Other Side -------------------------------------------------------
  // The landmarks and viewpoints on the Star Stair (sb.obs_path). Every view is
  // computed from these positions — the same props the map draws — so the
  // pictures, the words and the deduction agree with the world (tests/unit/cases.test.mjs).
  const VIEW = C.caseView = {
    map: 'sb.obs_path',
    landmarks: {
      lamp: { x: 7, y: 33, w: 1, props: ['deadlantern', 'lantern'], name: T('the stair lantern', '{石段|いしだん} の {灯|あか}り') },
      shrine: { x: 9, y: 30, w: 2, props: ['shrine'], name: T('the little shrine', '{小|ちい}さな {祠|ほこら}') },
      tree: { x: 11, y: 32, w: 1, props: ['deadtree'], name: T('the bare tree', '{枯|か}れ{木|き}') },
    },
    // where the viewer stands (tile centres) and which way they look
    points: {
      seat: { x: 10.0, y: 36.5, dir: 'up', name: T('the stone seat at the foot of the stair', '{石段|いしだん} の {下|した} の {腰掛|こしか}け'), facing: T('looking up the stair (north)', '{石段|いしだん} を {見上|みあ}げて （{北|きた}）'),
        look: T('You sit on the stone seat and look up the stair, to the north.', '{腰掛|こしか}け に {座|すわ}って 、 {北|きた} へ {石段|いしだん} を {見上|みあ}げる 。') },
      west: { x: 4.5, y: 31.5, dir: 'right', name: T('the flat stone beside the stair path', '{石段|いしだん} の {脇|わき} の {平|たい}らな {石|いし}'), facing: T('looking across the slope (east)', '{斜面|しゃめん} の {向|む}こう を {見|み}て （{東|ひがし}）'),
        look: T('You stand by the flat stone and look east, across the slope.', '{平|たい}らな {石|いし} の そば に {立|た}って 、 {東|ひがし} へ {斜面|しゃめん} を {見渡|みわた}す 。') },
      east: { x: 14.5, y: 33.5, dir: 'left', name: T('the flat stone above the lower path', '{下|した} の {道|みち} の {上|うえ} の {平|たい}らな {石|いし}'), facing: T('looking back along the slope (west)', '{斜面|しゃめん} を {振|ふ}り{返|かえ}って （{西|にし}）'),
        look: T('You stand by the flat stone and look west, back along the slope.', '{平|たい}らな {石|いし} の そば に {立|た}って 、 {西|にし} へ {斜面|しゃめん} を {振|ふ}り{返|かえ}る 。') },
    },
    // the sketch was drawn from here, facing this way
    target: 'seat',
  };
  const FWD = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  // bearing of each landmark from a viewpoint (degrees; negative = left), in view order
  VIEW.see = function (pid) {
    const v = VIEW.points[pid];
    return Object.keys(VIEW.landmarks).map((k) => {
      const l = VIEW.landmarks[k], lx = l.x + l.w / 2, ly = l.y + 0.5;
      const dx = lx - v.x, dy = ly - v.y, [fx, fy] = FWD[v.dir];
      const f = dx * fx + dy * fy;
      const r = v.dir === 'up' ? dx : v.dir === 'down' ? -dx : v.dir === 'left' ? -dy : dy;
      return { k, f, r, deg: Math.atan2(r, f) * 180 / Math.PI };
    }).sort((a, b) => a.deg - b.deg);
  };
  VIEW.order = (pid) => VIEW.see(pid).map((x) => x.k);
  VIEW.words = function (order) {
    const n = order.map((k) => VIEW.landmarks[k].name);
    return { jp: '{左|ひだり} から 、 ' + n.map((x) => x.jp).join(' 、 ') + ' 。', en: 'From left to right: ' + n.map((x) => x.en).join(', ') + '.' };
  };

  clue('view.sketch', { case: 'view', kind: 'object', title: T('The sketch in the lighthouse window', '{灯台|とうだい} の {窓|まど} の {絵|え}'),
    source: { en: 'Pinned in the lighthouse window', map: 'sg.lighthouse' },
    obs: { en: 'Pencil on paper so thin the window light comes through it. As it hung, facing the room, it showed — from left to right — a bare tree, a little shrine and a lamp on a post. It looks like no place Genzō knows.' } });
  clue('view.genzo', { case: 'view', kind: 'speaker', sure: false, title: T('What Genzō remembers', 'ゲンゾウ の {話|はなし}'),
    source: { en: 'Genzō, at the lighthouse', who: 'genzo', map: 'sg.lighthouse' },
    jp: '{旅|たび} の {絵描|えか}き が {置|お}いて いった 。 {北|きた} の {道|みち} の 、 {座|すわ}って {休|やす}む {場所|ばしょ} から {描|か}いた …… と {言|い}って いた か な 。',
    en: '"A travelling artist left it. Drew it from somewhere on the road north where you sit and rest… or so I think she said."' });
  clue('view.note', { case: 'view', kind: 'document', title: T('A page in the inn\'s guestbook', '{宿|やど} の {帳面|ちょうめん}'),
    source: { en: 'The guestbook at Fusa\'s Inn', map: 'co.inn' },
    jp: '{薄|うす}い {紙|かみ} に {描|か}いて います 。 {表|おもて} の {隅|すみ} に 、 {葉|は} の {印|しるし} を {押|お}します 。 {軸|じく} は {左|ひだり} 。 {裏|うら} から {見|み}る と 、 {軸|じく} は {右|みぎ} を {向|む}いて 、 へこんで {見|み}えます 。',
    en: '"I draw on thin paper. In a front corner I press my leaf mark, stem to the left. From the back, the stem points right, and the mark looks sunken."',
    obs: { en: 'Signed with a little drawing of a leaf instead of a name.' },
    lang: [{ w: '{表|おもて}', en: 'the front (face) of a sheet' }, { w: '{裏|うら}', en: 'the back' }, { w: '{軸|じく}', en: 'here: a leaf\'s stem' }, { w: 'へこむ', en: 'to be dented, sunken' }], diagram: 'leaf_both' });
  clue('view.impression', { case: 'view', kind: 'object', title: T('The mark pressed into a corner', '{隅|すみ} の {押|お}し{跡|あと}'),
    source: { en: 'The sketch itself', map: null },
    obs: { en: 'A small leaf pressed into a lower corner. On the side that faced the room it is a dent, stem pointing right; on the other side it stands up, stem pointing left.' }, diagram: 'leaf_both' });
  const viewClue = (pid, title) => clue('view.' + pid, { case: 'view', kind: 'view', title,
    source: { en: 'The Star Stair above Snowbell', map: 'sb.obs_path' }, diagram: 'view:' + pid,
    obs: { en: VIEW.points[pid].name.en[0].toUpperCase() + VIEW.points[pid].name.en.slice(1) + ', ' + VIEW.points[pid].facing.en + '.' } });
  viewClue('seat', T('The view from the stone seat', '{腰掛|こしか}け から の {景色|けしき}'));
  viewClue('west', T('The view from the flat stone by the path', '{道|みち} の {脇|わき} の {石|いし} から の {景色|けしき}'));
  viewClue('east', T('The view from the flat stone above the lower path', '{下|した} の {道|みち} の {上|うえ} の {石|いし} から の {景色|けしき}'));

  C.cases.view = {
    id: 'view', quest: 'cs_view', region: 'snowbell', keepsake: 'turning_picture', talk: 'cs.talk_view',
    title: C.quests.cs_view.title,
    question: T('Where was the sketch drawn? It seems to match no view exactly.', 'この {絵|え} は 、 どこ で {描|か}かれた のか 。'),
    clues: ['view.sketch', 'view.genzo', 'view.note', 'view.impression', 'view.seat', 'view.west', 'view.east'],
    hypotheses: ['seat', 'west', 'east'].map((pid) => ({ id: pid, label: C.clues['view.' + pid].title, from: ['view.' + pid],
      place: { map: 'sb.obs_path', x: Math.floor(VIEW.points[pid].x), y: Math.floor(VIEW.points[pid].y) }, placeBy: ['view.' + pid], correct: pid === VIEW.target })),
    sufficient: [['view.impression', 'view.' + VIEW.target], ['view.note', 'view.' + VIEW.target]],
    hints: [
      { kind: 'nudge', jp: 'とても {薄|うす}い {紙|かみ} だ 。 {今|いま} 、 どちら の {面|めん} を {見|み}て いる だろう 。', en: 'The paper is very thin. Which side of it are you looking at?' },
      { kind: 'compare', jp: '{隅|すみ} の {押|お}し{跡|あと} を よく {見|み}て 、 {絵|え} を {見|み}た {景色|けしき} と {比|くら}べよう 。', en: 'Look closely at the mark pressed into a corner, then compare the sketch with the views you have kept.' },
      { kind: 'step', jp: '{絵|え} を {裏返|うらがえ}して 、 {雪鈴|ゆきすず} の {星|ほし} の {石段|いしだん} で {座|すわ}れる {場所|ばしょ} から の {景色|けしき} と {比|くら}べよう 。', en: 'Turn the sketch over and compare it with the view from a place to sit on the Star Stair above Snowbell.' },
      { kind: 'solution', discloses: 'seat', jp: '{裏返|うらがえ}す と 、 {絵|え} は {石段|いしだん} の {下|した} の {腰掛|こしか}け から の {景色|けしき} だ 。 {左|ひだり} から {灯|あか}り 、 {祠|ほこら} 、 {枯|か}れ{木|き} 。', en: 'Turned over, the sketch is the view from the stone seat at the foot of the Star Stair: from the left, the lantern, the shrine, the bare tree.' },
    ],
    hypPrompt: T('Which view does it show? Your own choice: compare it with the sketch above, held one way or the other.'),
    result: T('The sketch shows the view up the Star Stair from the stone seat at its foot. It had hung in the lighthouse window back to front: turned over, the lantern, the shrine and the bare tree fall into place.', '{絵|え} は 、 {星|ほし} の {石段|いしだん} の {下|した} の {腰掛|こしか}け から の {景色|けしき} だった 。 {窓|まど} に {裏|うら} を {向|む}けて {貼|は}られて いた 。'),
    methods: {
      noticed: T('You saw which side was the front from the pressed mark, and matched the view yourself.'),
      note: T('The artist\'s own note told you how her sheets are made, and you matched the view.'),
      compared: T('You turned it over and matched the view by the landmarks alone.'),
      helped: T('You asked for the answer. The keepsake and everything else are the same.'),
    },
    method(s, rec, K) {
      if (K.hintLevel(s, 'view') >= 4) return 'helped';
      if (K.observed(s, 'view.note')) return 'note';
      return K.observed(s, 'view.impression') ? 'noticed' : 'compared';
    },
    // the sheet: Turn over, Compare, Reset (src/ui/59_casebook.js)
    sheet: {
      name: T('The sketch'), start: 'back',
      startText: T('As it hung in the lighthouse window: the side that faced the room.'),
      turnedText: T('Turned over: the side that faced the glass.'),
      revealHint: T('Something is pressed into one corner, too faint to make out as it is. Look closer below.'),
      confirmLabel: T('This is the view, held this way'),
      reveals: [
        { id: 'tilt', label: T('Tilt it to the light and look at both sides'), clue: 'view.impression' },
        { id: 'backing', label: T('Lay it on Genzō\'s white chart paper'), clue: 'view.impression', if: 'cs_view_backing' },
        { id: 'light', label: T('Weave ひかり behind it'), clue: 'view.impression', if: 'word.hikari' },
      ],
      revealed: (s) => RB.cases.observed(s, 'view.impression'),
      viewOf: (hid) => 'view.' + hid,
      order: (side) => (side === 'front' ? VIEW.order(VIEW.target) : VIEW.order(VIEW.target).slice().reverse()),
      matches: (s, side, hid) => !!hid && RB.cases.observed(s, 'view.' + hid) && VIEW.order(hid).join() === (side === 'front' ? VIEW.order(VIEW.target) : VIEW.order(VIEW.target).slice().reverse()).join(),
      mismatch: () => T('They don\'t line up: the lantern, the shrine and the bare tree are not in the same order.'),
      draw: (s, side, shown) => RB.content.caseArt.sheet(s, side, shown),
      solvedScene: 'cs.view_solved',
    },
    remembered: (s) => RB.content.caseArt.remembered(s),
  };

  // ---- pictures of the evidence (inline SVG + a text equivalent) ------------------------------------------
  const A = (C.caseArt = C.caseArt || {});
  const svg = (w, h, body, label) => '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + RB.util.esc(label) + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  const bell = (cx, cy, s, notch, wave) => {
    let b = '<path d="M' + (cx - 10 * s) + ' ' + (cy + 12 * s) + ' L' + (cx - 7 * s) + ' ' + (cy - 6 * s) + ' Q' + cx + ' ' + (cy - 14 * s) + ' ' + (cx + 7 * s) + ' ' + (cy - 6 * s) + ' L' + (cx + 10 * s) + ' ' + (cy + 12 * s) + ' Z" fill="#8a5a2a" stroke="#2a1a0e" stroke-width="2"/>' +
      '<rect x="' + (cx - 2 * s) + '" y="' + (cy - 16 * s) + '" width="' + 4 * s + '" height="' + 4 * s + '" fill="#8a5a2a" stroke="#2a1a0e" stroke-width="1.5"/>';
    if (notch) b += '<path d="M' + (cx + 5 * s) + ' ' + (cy - 9 * s) + ' l' + 5 * s + ' ' + 2 * s + ' l' + -4 * s + ' ' + 4 * s + ' Z" fill="#f7f0de" stroke="#2a1a0e" stroke-width="1.5"/>';
    if (wave) b += '<path d="M' + (cx - 14 * s) + ' ' + (cy + 20 * s) + ' q' + 3.5 * s + ' ' + -5 * s + ' ' + 7 * s + ' 0 t' + 7 * s + ' 0 t' + 7 * s + ' 0 t' + 7 * s + ' 0" fill="none" stroke="#2a4a6a" stroke-width="2.5"/>';
    return b;
  };
  A.bell_notch = () => ({ svg: svg(120, 90, bell(60, 42, 2, true, false), 'A bell with one notch in its right shoulder'), text: T('A small bell with one notch cut into its right shoulder, and no line beneath it.') });
  A.bell_wave = () => ({ svg: svg(120, 90, bell(60, 36, 2, false, true), 'A bell with a wave beneath it and no notch'), text: T('A bell with no notch, and a wavy line beneath it.') });
  // the harbour: where the old landing was and where the ferry is now, from the map itself
  A.harbour = () => {
    const m = C.maps['sg.harbor'];
    const ferry = (m.props || []).find((p) => p.p === 'sg_ferry') || { x: 32, y: 38 };
    const foot = { x: 53, y: 31 };
    const W = 56, H = 42, k = 3;
    const pt = (x, y, lab, col, shape) => (shape === 'x' ? '<path d="M' + (x * k - 5) + ' ' + (y * k - 5) + ' l10 10 M' + (x * k + 5) + ' ' + (y * k - 5) + ' l-10 10" stroke="' + col + '" stroke-width="3"/>' : '<rect x="' + (x * k - 5) + '" y="' + (y * k - 5) + '" width="10" height="10" fill="' + col + '" stroke="#2a2024" stroke-width="1.5"/>') +
      '<text x="' + (x * k) + '" y="' + (y * k - 9) + '" font-size="9" text-anchor="middle" fill="#261f15" font-family="Georgia, serif">' + lab + '</text>';
    const body = '<rect width="' + W * k + '" height="' + H * k + '" fill="#efe3c6"/><rect x="0" y="' + 32 * k + '" width="' + W * k + '" height="' + 10 * k + '" fill="#cfdbd6"/>' +
      '<rect x="' + 12 * k + '" y="' + 24 * k + '" width="' + 32 * k + '" height="' + 5 * k + '" fill="#d0c4a8" stroke="#8a7a5a"/>' +
      pt(foot.x + 1, foot.y + 0.5, 'old East Landing', '#8a8478', 'x') + pt(ferry.x + 2.5, ferry.y, 'ferry now', '#8a5a2a');
    return { svg: svg(W * k, H * k, body, 'The old East Landing on the east beach, crossed out; the ferry now at the stone quay to the south-west'), text: T('The old East Landing stood at the east end of the beach (closed); the ferry now lands at the stone quay, south-west of it.') };
  };
  // the pressed leaf, both sides
  const leaf = (x, y, flip, dent) => {
    const d = flip ? -1 : 1;
    return '<path d="M' + x + ' ' + y + ' q' + 10 * d + ' -10 ' + 22 * d + ' 0 q' + -12 * d + ' 10 ' + -22 * d + ' 0 Z" fill="' + (dent ? 'none' : '#d8ceb4') + '" stroke="#5a5040" stroke-width="2"' + (dent ? ' stroke-dasharray="3 2"' : '') + '/>' +
      '<path d="M' + x + ' ' + y + ' l' + -8 * d + ' 0" stroke="#5a5040" stroke-width="2"/>';
  };
  A.leaf_both = () => ({
    svg: svg(200, 80, '<rect width="200" height="80" fill="#f7f0de"/>' + leaf(30, 42, false, false) + '<text x="36" y="72" font-size="10" fill="#261f15" font-family="Georgia, serif">front: raised, stem left</text>' +
      leaf(170, 42, true, true) + '<text x="100" y="18" font-size="10" fill="#261f15" font-family="Georgia, serif">back: sunken, stem right</text>', 'The leaf mark: raised with its stem to the left on the front; sunken with its stem to the right on the back'),
    text: T('The leaf mark: on the front it stands up, stem to the left; from the back it is sunken, stem to the right.'),
  });
  // icons for the landmarks
  const icon = {
    lamp: (x, y, s) => '<rect x="' + (x - 1.5 * s) + '" y="' + (y - 18 * s) + '" width="' + 3 * s + '" height="' + 18 * s + '" fill="#5a4a3a"/><rect x="' + (x - 4 * s) + '" y="' + (y - 24 * s) + '" width="' + 8 * s + '" height="' + 7 * s + '" fill="#e8c060" stroke="#3a2a1a" stroke-width="1.5"/>',
    shrine: (x, y, s) => '<rect x="' + (x - 7 * s) + '" y="' + (y - 9 * s) + '" width="' + 14 * s + '" height="' + 9 * s + '" fill="#9a6a44" stroke="#3a2a1a" stroke-width="1.5"/><path d="M' + (x - 10 * s) + ' ' + (y - 9 * s) + ' L' + x + ' ' + (y - 16 * s) + ' L' + (x + 10 * s) + ' ' + (y - 9 * s) + ' Z" fill="#6a4a36" stroke="#3a2a1a" stroke-width="1.5"/>',
    tree: (x, y, s) => '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - 26 * s) + ' M' + x + ' ' + (y - 14 * s) + ' l' + -7 * s + ' ' + -7 * s + ' M' + x + ' ' + (y - 18 * s) + ' l' + 6 * s + ' ' + -8 * s + ' M' + x + ' ' + (y - 8 * s) + ' l' + 5 * s + ' ' + -4 * s + '" stroke="#4a4038" stroke-width="' + 2.2 * s + '" fill="none" stroke-linecap="round"/>',
  };
  const scene = (list, faint, mirror) => {
    let b = '<rect width="200" height="110" fill="' + (faint ? '#f2ecdc' : '#f7f0de') + '"/><path d="M0 84 Q50 78 100 82 T200 80 L200 110 L0 110 Z" fill="#e6ecf2"/>';
    for (const it of list) {
      const x = 100 + (mirror ? -1 : 1) * it.deg * 1.25, s = Math.max(0.7, Math.min(1.6, 5 / it.f));
      b += '<g opacity="' + (faint ? 0.55 : 1) + '">' + icon[it.k](x, 88, s) + '</g>';
    }
    return b;
  };
  // a view from a viewpoint, drawn from the map
  const viewOf = (pid) => {
    const list = VIEW.see(pid), P = VIEW.points[pid];
    const w = VIEW.words(list.map((x) => x.k));
    return { svg: svg(200, 110, scene(list, false, false), P.facing.en + ': ' + w.en), text: T(P.facing.en[0].toUpperCase() + P.facing.en.slice(1) + '. ' + w.en) };
  };
  for (const pid in VIEW.points) A['view:' + pid] = () => viewOf(pid);
  // the sketch as held: the front shows the target view; the back shows it mirrored and faint
  A.sheet = (s, side, shown) => {
    const list = VIEW.see(VIEW.target), back = side !== 'front';
    let b = scene(list, back, back);
    if (shown) b += back ? leaf(178, 100, true, true) : leaf(22, 100, false, false);
    const order = back ? list.map((x) => x.k).reverse() : list.map((x) => x.k);
    const w = VIEW.words(order);
    const mark = shown ? (back ? ' In the lower right corner, a pressed leaf: a dent, stem pointing right.' : ' In the lower left corner, a pressed leaf: raised, stem pointing left.') : '';
    return { svg: svg(200, 110, b, (back ? 'The sketch from the side that faced the room. ' : 'The sketch from the side that faced the glass. ') + w.en + mark), text: T((back ? 'Seen from the side that faced the room, faint through the paper. ' : 'Seen from the side that faced the glass, clear. ') + w.en + mark) };
  };
  A.remembered = () => {
    const a = A.sheet(null, 'front', true), v = viewOf(VIEW.target);
    return { svg: '<div class="cs-pair">' + a.svg + v.svg + '</div>', text: T('Kept: the sketch, the right way round, beside the view it shows. ' + v.text.en) };
  };

  // ---- keepsakes this worker defines (the catalogue registry: docs/ADDENDUM_CONTRACTS.md) -----------------
  const KS = C.keepsakes, ART = C.keepsakeArt || {};
  const ks = (id, d) => (KS[id] = Object.assign({ id, artSize: 32, art: (c) => ART[id] && ART[id](c) }, d));
  ks('parcel_seal', { name: T('Parcel Seal', '{封|ふう} の {印|しるし}'), region: 'saltglass', source: { kind: 'case', id: 'parcel' },
    desc: { en: 'The red wax from the parcel, a small notched bell pressed into it. Hama gave it to you after the delivery.' },
    hint: { broad: { en: 'Something in Reedwake has been waiting a long time to be carried west.' }, specific: { en: 'A parcel on the River Warehouse\'s shelf of unclaimed things; the Harbour Office in Saltglass remembers the old landings.' } } });
  ks('turning_picture', { name: T('Turning Picture', '{裏返|うらがえ}し の {絵|え}'), region: 'snowbell', source: { kind: 'case', id: 'view' },
    desc: { en: 'A small card you traced from the traveller\'s sketch: turn it one way and it is the view from the stone seat; the other way, the back of the same page.' },
    hint: { broad: { en: 'A picture in a Saltglass window has been looking the wrong way for years.' }, specific: { en: 'Ask Genzō about the sketch in the lighthouse window; the Star Stair above Snowbell has places to stop and look.' } } });
  ks('shell_button', { name: T('Shell Button', '{貝|かい} の ボタン'), region: 'saltglass', source: { kind: 'sequence', id: 'sg.c_tidetable' },
    desc: { en: 'A button cut from a shell, from the jar on Shiori\'s shelf. She gives one to people who read the tide right, she says, however long it takes them.' },
    hint: { broad: { en: 'The tide-watcher in Saltglass keeps something small for careful readers.' }, specific: { en: 'Read Shiori\'s tide table and wait for the low tide; she has a jar of shell buttons.' } } });
  ks('clay_swallow', { name: T('Clay Swallow', '{土|つち} の {燕|つばめ}'), region: 'cinder', source: { kind: 'sequence', id: 'co.c_kiln' },
    desc: { en: 'A small fired swallow from Nobu\'s kiln, made in the week the old firing steps were read aloud again.' },
    hint: { broad: { en: 'A potter in Cinder Orchard is grateful to whoever read the old kiln right.' }, specific: { en: 'Once the Great Kiln\'s firing steps are in order, visit Nobu\'s Pottery.' } } });
  ks('star_rosette', { name: T('Star Rosette', '{星|ほし} の {飾|かざ}り'), region: 'snowbell', source: { kind: 'sequence', id: 'sb.c_log' },
    desc: { en: 'A folded paper star with a blue centre, one of dozens Akari made as a child. Hoshino gives it away because, he says, stars are for sharing. It proves nothing about astronomy.' },
    hint: { broad: { en: 'The astronomer of Snowbell has a drawer of paper stars.' }, specific: { en: 'After the observing log has been read and the lamp relit, visit Hoshino at home.' } } });
  ks('thread_spool', { name: T('Thread Spool', '{糸巻|いとま}き'), region: 'lanternfall', source: { kind: 'sequence', id: 'lf.ch_gate1' },
    desc: { en: 'A miniature spool of indigo thread, the kind used to mend the bell tower\'s old rope ladder. A thank-you from the people who look after the tower.' },
    hint: { broad: { en: 'The tower in Lanternfall is looked after carefully once its gates are read.' }, specific: { en: 'After the drowned bell rings, talk to Tokuji at the sluice shore.' } } });
})(RB.content);
