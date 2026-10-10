/* Exploration actions' fixtures (expansion P05; the templates in src/engine/55b_verbs.js). One small, complete
 * example of each, on the Lantern Road and the Saltglass road, for the tests and for review on a development page
 * (?dev=verbs). All `fixture: true`: their props, people and creatures appear, and their puzzles count, only in a
 * throwaway session that sets the flag dev_verbs; a journey never meets them. The new chapters write the real ones
 * (Manybridge's notices and locks, the Cloudroad's relay, Playhouse Row's rehearsals). */
var RB = (globalThis.RB = globalThis.RB || {});
(function () {
  'use strict';
  const V = RB.verbs;
  const T = (en, jp) => ({ en, jp });

  // ---- W9 · a notice by the road: where to queue ---------------------------------------------------------------
  V.define('notice', {
    id: 'vb_notice', fixture: true, map: 'rw.road', x: 26, y: 12, region: 'reedwake',
    title: T('A notice for the queue', '{並|なら}ぶ {人|ひと} へ の {貼|は}り{紙|がみ}'),
    slots: [
      { key: 'where', label: T('Where', 'どこ'), options: [
        { id: 'left', jp: '{左|ひだり} に', en: 'on the left' },
        { id: 'right', jp: '{右|みぎ} に', en: 'on the right' },
        { id: 'road', jp: '{道|みち} に', en: 'on the road' },
      ] },
      { key: 'do', label: T('What to do', '{何|なに} を する'), options: [
        { id: 'line', jp: '{並|なら}んで ください', en: 'please line up' },
        { id: 'run', jp: '{走|はし}って ください', en: 'please run' },
        { id: 'wait', jp: '{待|ま}って ください', en: 'please wait' },
      ] },
    ],
    readings: [
      { when: { where: 'left', do: ['line', 'wait'] }, behaviour: 'queue_left', heard: T('People read it and line up along the left of the board. The way in front is clear.', '{読|よ}んだ {人|ひと} たち が 、 {貼|は}り{紙|がみ} の {左|ひだり} に {並|なら}んだ 。 {前|まえ} が {通|とお}れる よう に なった 。') },
      { when: { where: 'right', do: ['line', 'wait'] }, behaviour: 'queue_right', heard: T('People read it and line up to the right of the board, toward the bend. The way in front is clear.', '{読|よ}んだ {人|ひと} たち が 、 {貼|は}り{紙|がみ} の {右|みぎ} に {並|なら}んだ 。 {前|まえ} が {通|とお}れる よう に なった 。') },
      { when: { where: 'road', do: ['line', 'wait'] }, behaviour: 'on_road', heard: T('People line up out on the road itself. They did what it said; carts will have to go round them.', '{人|ひと} たち は {道|みち} の {上|うえ} に {並|なら}んだ 。 {言|い}われた とおり だ が 、 {荷車|にぐるま} は {通|とお}り にくい 。') },
    ],
    unclear: T('People read it, look at one another, and stay where they were.', '{読|よ}んだ {人|ひと} たち は {顔|かお} を {見合|みあ}わせて 、 そのまま だ 。'),
    goal: ['queue_left', 'queue_right'],
    people: {
      none: [{ char: 'tobi', x: 25, y: 13 }, { char: 'sota', x: 26, y: 13, dir: 'up' }, { char: 'daigo', x: 28, y: 13, dir: 'left' }],
      unclear: [{ char: 'tobi', x: 25, y: 13 }, { char: 'sota', x: 26, y: 13, dir: 'up' }, { char: 'daigo', x: 28, y: 13, dir: 'left' }],
      queue_left: [{ char: 'tobi', x: 24, y: 13, dir: 'right' }, { char: 'sota', x: 23, y: 13, dir: 'right' }, { char: 'daigo', x: 22, y: 13, dir: 'right' }],
      queue_right: [{ char: 'tobi', x: 29, y: 13, dir: 'left' }, { char: 'sota', x: 30, y: 13, dir: 'left' }, { char: 'daigo', x: 30, y: 14, dir: 'up' }],
      on_road: [{ char: 'tobi', x: 24, y: 10 }, { char: 'sota', x: 25, y: 10 }, { char: 'daigo', x: 26, y: 10 }],
    },
  });

  // ---- W11 · a courier's round of three stops -------------------------------------------------------------------
  V.define('courier', {
    id: 'vb_courier', fixture: true, map: 'rw.road', x: 3, y: 3,
    title: T('The courier\'s round', '{配達|はいたつ} の {順番|じゅんばん}'),
    legs: [T('First', '{最初|さいしょ}'), T('Next', '{次|つぎ}'), T('Last', '{最後|さいご}')],
    stops: {
      square: T('the village square', '{村|むら} の {広場|ひろば}'),
      tea: T('the teahouse', '{茶屋|ちゃや}'),
      harbour: T('the harbour', '{港|みなと}'),
      inn: T('the inn', '{宿|やど}'),
    },
    recipients: {
      hana: { name: T('Hana', 'ハナ'), at: ['tea', 'tea', 'square'] },
      tetsu: { name: T('Tetsu', 'テツ'), at: ['harbour', 'inn', 'inn'] },
      fuku: { name: T('Fuku', 'フク'), at: ['harbour', 'harbour', 'square'] },
    },
    parcels: [
      { id: 'letter', to: 'hana', jp: '{手紙|てがみ}', en: 'a letter' },
      { id: 'parcel', to: 'tetsu', jp: '{小包|こづつみ}', en: 'a parcel' },
      { id: 'medicine', to: 'fuku', jp: '{薬|くすり}', en: 'medicine' },
    ],
  });

  // ---- W12 · mending a road lamp ------------------------------------------------------------------------------------
  V.define('repair', {
    id: 'vb_repair', fixture: true, map: 'rw.road', x: 2, y: 5,
    name: T('A road lamp that will not light', '{点|つ}かない {道|みち} の {灯|あか}り'),
    inspect: T('The glass is sooty, the wick is ragged, and the oil well is dry.', 'ガラス が {黒|くろ}く {汚|よご}れて いる 。 {芯|しん} は ぼろぼろ で 、 {油|あぶら} も ない 。'),
    parts: { glass: T('glass', 'ガラス'), wick: T('wick', '{芯|しん}'), well: T('oil well', '{油|あぶら} の {入|い}れ{物|もの}') },
    read: [
      T('1. Wipe the glass with the cloth.', '{一|いち} 、 {布|ぬの} で ガラス を {拭|ふ}く 。'),
      T('2. Trim the wick with the scissors.', '{二|に} 、 はさみ で {芯|しん} を {切|き}る 。'),
      T('3. Pour oil into the oil well.', '{三|さん} 、 {油|あぶら} を {入|い}れ{物|もの} に {入|い}れる 。'),
    ],
    tools: [
      { id: 'cloth', jp: '{布|ぬの}', en: 'cloth' },
      { id: 'scissors', jp: 'はさみ', en: 'scissors' },
      { id: 'oil', jp: '{油|あぶら}', en: 'oil' },
    ],
    steps: [
      { part: 'glass', tool: 'cloth', done: T('You wipe the soot away. The glass is clear.', 'ガラス を {拭|ふ}いた 。 きれい に なった 。') },
      { part: 'wick', tool: 'scissors', done: T('You trim the wick square.', '{芯|しん} を まっすぐ に {切|き}った 。') },
      { part: 'well', tool: 'oil', done: T('You pour the oil in, slowly.', 'ゆっくり {油|あぶら} を {入|い}れた 。') },
    ],
    ran: T('The lamp lights, steady and bright.', '{灯|あか}り が {点|つ}いた 。 {明|あか}るい 。'),
  });

  // ---- W13 · water across two roads ------------------------------------------------------------------------------
  V.define('network', {
    id: 'vb_network', fixture: true, medium: 'water', levels: 3,
    basins: {
      pond: { map: 'rw.road', x: 10, y: 2, jp: '{池|いけ}', en: 'pond', level: 3 },
      ditch: { map: 'rw.road', x: 9, y: 6, jp: '{用水路|ようすいろ}', en: 'channel', level: 0 },
      ford: { map: 'sg.road', x: 21, y: 16, jp: '{浅瀬|あさせ}', en: 'ford', level: 0 },
      outflow: { map: 'sg.road', x: 13, y: 12, jp: '{排水口|はいすいこう}', en: 'outflow', level: 0 },
    },
    gates: {
      g1: { between: ['pond', 'ditch'], map: 'rw.road', x: 11, y: 4, jp: '{池|いけ} の {水門|すいもん}', en: 'pond sluice', open: false },
      g2: { between: ['ditch', 'ford'], map: 'sg.road', x: 16, y: 13, jp: '{浅瀬|あさせ} の {水門|すいもん}', en: 'ford sluice', open: true, weave: 'water' },
      g3: { between: ['ford', 'outflow'], map: 'sg.road', x: 12, y: 13, jp: '{排水|はいすい} の {水門|すいもん}', en: 'outflow sluice', open: true },
    },
    sources: ['pond'], drains: ['outflow'],
    required: [{ id: 'crossing', basin: 'ford', max: 1, map: 'sg.road', tiles: [[18, 15], [19, 15]], jp: '{浅瀬|あさせ} を {渡|わた}る {道|みち}', en: 'the way across the ford', look: T('The ford is under water. Nobody can cross here now.', '{浅瀬|あさせ} が {水|みず} の {下|した} だ 。 {今|いま} は {渡|わた}れない 。') }],
    goal: { ditch: 3, ford: [0, 1] },
  });

  // ---- W14 · a striking clock to watch, and a paper boat to fold ---------------------------------------------------
  V.define('observe', {
    id: 'vb_observe', fixture: true, map: 'rw.road', x: 8, y: 2, beat: 900,
    name: T('The roadside bell clock', '{道|みち} の {鐘|かね} の {時計|とけい}'),
    parts: [
      { key: 'wheel', jp: '{車|くるま}', en: 'wheel', states: { turn: T('turning', '{回|まわ}って いる'), still: T('still', '{止|と}まって いる') } },
      { key: 'hammer', jp: '{槌|つち}', en: 'hammer', states: { down: T('down', '{下|した}'), up: T('raised', '{上|うえ}'), stuck: T('stuck up', '{上|うえ} で {止|と}まって いる') } },
      { key: 'bell', jp: '{鐘|かね}', en: 'bell', states: { quiet: T('quiet', '{静|しず}か'), ring: T('ringing', '{鳴|な}って いる'), dull: T('a dull knock', 'こつん と {鈍|にぶ}い {音|おと}') } },
    ],
    phases: {
      turn: { jp: '{車|くるま} が {回|まわ}る', en: 'the wheel turns', parts: { wheel: 'turn', hammer: 'down', bell: 'quiet' } },
      lift: { jp: '{槌|つち} が {上|あ}がる', en: 'the hammer rises', parts: { wheel: 'still', hammer: 'up', bell: 'quiet' } },
      strike: { jp: '{槌|つち} が {鐘|かね} を {打|う}つ', en: 'the hammer strikes the bell', parts: { wheel: 'still', hammer: 'down', bell: 'ring' } },
      knock: { jp: '{槌|つち} が {台|だい} を {打|う}つ', en: 'the hammer falls on the frame', parts: { wheel: 'still', hammer: 'down', bell: 'dull' } },
      stuck: { jp: '{槌|つち} が {止|と}まる', en: 'the hammer sticks', parts: { wheel: 'still', hammer: 'stuck', bell: 'quiet' } },
    },
    base: ['turn', 'knock', 'lift', 'stuck'],
    adjustments: [
      { id: 'order', op: 'swap', a: 'knock', b: 'lift', jp: '{槌|つち} の {順番|じゅんばん} を {入|い}れ{替|か}える', en: 'change the order of the hammer\'s cams' },
      { id: 'oil', op: 'remove', a: 'stuck', jp: '{留|と}め{金|がね} に {油|あぶら} を さす', en: 'oil the catch' },
      { id: 'ring', op: 'replace', a: 'knock', b: 'strike', jp: '{鐘|かね} の {位置|いち} を {直|なお}す', en: 'move the bell to where the hammer falls' },
    ],
    goal: ['turn', 'lift', 'strike'],
    clues: [
      { id: 'falls_first', phase: 'knock', jp: '{槌|つち} は {上|あ}がる {前|まえ} に {落|お}ちて いる 。', en: 'The hammer falls before it has risen.' },
      { id: 'misses', phase: 'knock', jp: '{槌|つち} は {鐘|かね} に {届|とど}かず 、 {台|だい} を {打|う}つ 。', en: 'The hammer falls short of the bell and hits the frame.' },
      { id: 'catch_dry', phase: 'stuck', jp: '{留|と}め{金|がね} が {乾|かわ}いて いて 、 {槌|つち} が {上|うえ} で {止|と}まる 。', en: 'The catch is dry: the hammer sticks at the top.' },
    ],
  });
  V.define('follow', {
    id: 'vb_follow', fixture: true, map: 'rw.road', x: 9, y: 4,
    name: T('Folding a paper boat', '{紙|かみ} の {船|ふね} を {折|お}る'),
    steps: [
      { jp: '{紙|かみ} を {半分|はんぶん} に {折|お}って ください 。', en: 'Fold the paper in half.', options: [
        { id: 'half', ok: true, jp: '{半分|はんぶん} に {折|お}る', en: 'Fold it in half' },
        { id: 'corner', jp: '{角|かど} を {折|お}る', en: 'Fold a corner', why: T('Not yet: in half first.', 'まだ だ 。 {先|さき} に {半分|はんぶん} に {折|お}る 。') },
        { id: 'open', jp: '{広|ひろ}げる', en: 'Open it out', why: T('It is already open. Fold it in half.', 'もう {広|ひろ}がって いる 。 {半分|はんぶん} に {折|お}ろう 。') },
      ] },
      { jp: '{上|うえ} の {角|かど} を {両方|りょうほう} {下|した} に {折|お}って ください 。', en: 'Fold both top corners down.', options: [
        { id: 'corners', ok: true, jp: '{両方|りょうほう} の {角|かど} を {下|した} に {折|お}る', en: 'Fold both corners down' },
        { id: 'onecorner', jp: '{角|かど} を {一|ひと}つ だけ {折|お}る', en: 'Fold one corner', why: T('Both corners, the direction says.', '{両方|りょうほう} の {角|かど} だ 。') },
      ] },
      { jp: '{下|した} の {部分|ぶぶん} を {上|うえ} に {折|お}って 、 {開|ひら}いて ください 。', en: 'Fold the bottom up, then open it out.', options: [
        { id: 'open', ok: true, jp: '{下|した} を {上|うえ} に {折|お}って {開|ひら}く', en: 'Fold the bottom up and open it' },
        { id: 'half', jp: 'もう {一度|いちど} {半分|はんぶん} に {折|お}る', en: 'Fold it in half again', why: T('The bottom edge goes up, then you open it.', '{下|した} の {部分|ぶぶん} を {上|うえ} に {折|お}って から 、 {開|ひら}く 。') },
      ] },
    ],
    done: T('A small paper boat.', '{小|ちい}さな {紙|かみ} の {船|ふね} が できた 。'),
  });

  // ---- W15 · a fog wisp at the ford, moved without a fight ---------------------------------------------------------
  V.define('route', {
    id: 'vb_route', fixture: true, map: 'sg.road',
    creature: { enemy: 'sg.fogwisp', at: { block: [18, 20], shade: [16, 18], away: null }, say: {
      block: T('A fog wisp hangs in front of the way down, thick and cold.', '{霧|きり} の {精|せい} が 、 {下|くだ}る {道|みち} の {前|まえ} に {漂|ただよ}って いる 。'),
      shade: T('The fog wisp rests in the shade by the wall. The way down is clear.', '{霧|きり} の {精|せい} は {壁|かべ} の {陰|かげ} に いる 。 {道|みち} は {通|とお}れる 。'),
      away: T('The fog wisp has gone off down the road.', '{霧|きり} の {精|せい} は {道|みち} の {向|む}こう へ {去|さ}った 。'),
    } },
    start: 'block', goal: ['shade', 'away'],
    means: [
      { id: 'light', family: 'light', from: ['block'], to: 'shade', obj: { key: 'lamp', x: 22, y: 18, prop: 'lantern', jp: '{灯|あか}り', en: 'lamp' },
        say: T('The lamp flares. The fog wisp shrinks from the light and drifts into the shade by the wall.', '{灯|あか}り が {明|あか}るく なった 。 {霧|きり} の {精|せい} は {光|ひかり} を {嫌|きら}って 、 {壁|かべ} の {陰|かげ} へ {流|なが}れた 。'), fx: 'light' },
      { id: 'bell', family: 'bell', from: ['block', 'shade'], to: 'away', obj: { key: 'bellpost', x: 15, y: 17, prop: 'cs_bellpost', jp: '{鈴|すず} の {柱|はしら}', en: 'bell post' }, sound: true,
        say: T('The bell rings out, clear. The fog wisp trembles with each ring and drifts away down the road.', '{鈴|すず} が {澄|す}んだ {音|おと} で {鳴|な}った 。 {霧|きり} の {精|せい} は {音|おと} に {震|ふる}えて 、 {道|みち} の {向|む}こう へ {去|さ}った 。'), fx: 'ring' },
    ],
  });

  // ---- W16 · the old plan of the Lantern Road ------------------------------------------------------------------------
  V.define('layers', {
    id: 'vb_layers', fixture: true, map: 'rw.road', near: 1,
    title: T('The well on the old plan', '{古|ふる}い {地図|ちず} の {井戸|いど}'),
    question: T('What happened to the well the old plan shows?', '{古|ふる}い {地図|ちず} に ある {井戸|いど} は どう なった の か 。'),
    plan: {
      x: 20, y: 12, prop: 'noticeboard', title: T('The road, drawn fifty years ago', '{五十年|ごじゅうねん} {前|まえ} の {道|みち} の {地図|ちず}'),
      marks: [
        { id: 'well', x: 7, y: 12, jp: '{井戸|いど}', en: 'a well', now: 'missing', obs: T('Where the plan shows a well, there is only a ring of flat stones, level with the ground.', '{地図|ちず} で は {井戸|いど} の {場所|ばしょ} だ が 、 {平|たい}らな {石|いし} が {丸|まる} く {並|なら}んで いる だけ だ 。') },
        { id: 'stone', x: 14, y: 8, jp: '{道|みち}しるべ', en: 'a waystone', now: 'present', obs: T('The waystone is still here, and its base is made of the same flat stones, newer than the rest.', '{道|みち}しるべ は {今|いま} も ある 。 {台|だい} は {同|おな}じ {平|たい}らな {石|いし} で 、 {他|ほか} より {新|あたら}しい 。') },
        { id: 'trough', x: 24, y: 8, jp: '{水|みず} {飲|の}み {場|ば}', en: 'a drinking trough', now: 'moved', obs: T('No trough here now; there are marks in the ground where one stood.', '{今|いま} は {水|みず} {飲|の}み {場|ば} が ない 。 {地面|じめん} に {置|お}いて あった {跡|あと} が ある 。') },
      ],
    },
    hypotheses: [
      { id: 'filled', label: T('The well was filled in, and its stones reused for the waystone\'s base.', '{井戸|いど} は {埋|う}められて 、 その {石|いし} が {道|みち}しるべ の {台|だい} に なった 。'), from: ['well', 'stone'], correct: true },
      { id: 'covered', label: T('The well is still there, covered over with flat stones.', '{井戸|いど} は {今|いま} も あって 、 {平|たい}らな {石|いし} で ふた を して ある 。'), from: ['well'], correct: true },
      { id: 'never', label: T('There never was a well: the plan is wrong.', '{井戸|いど} は {最初|さいしょ} から なかった 。 {地図|ちず} が {間違|まちが}って いる 。'), from: ['well'], mismatch: T('The ring of stones says something stood there.', '{丸|まる} く {並|なら}んだ {石|いし} が 、 {何|なに} か が あった こと を {示|しめ}して いる 。') },
    ],
    sufficient: [['well', 'stone'], ['well', 'trough']],
  });

  // ---- W17 · a rehearsal on the road's little stage ---------------------------------------------------------------
  V.define('blocking', {
    id: 'vb_blocking', fixture: true, map: 'rw.road', x: 17, y: 13,
    name: T('A rehearsal by the road', '{道|みち} {端|ばた} の {稽古|けいこ}'),
    stage: { w: 5, h: 3, scenery: [[0, 0], [4, 0]] },
    pieces: [
      { id: 'hana', kind: 'actor', jp: 'ハナ', en: 'Hana' },
      { id: 'tetsu', kind: 'actor', jp: 'テツ', en: 'Tetsu' },
      { id: 'lantern', kind: 'prop', jp: '{提灯|ちょうちん}', en: 'paper lantern' },
    ],
    directions: [
      { jp: 'ハナ さん は {舞台|ぶたい} の {真|ま}ん{中|なか} 、 {一番|いちばん} {前|まえ} に {立|た}って ください 。', en: 'Hana, stand in the middle of the stage, right at the front.', want: { who: 'hana', at: [2, 2] } },
      { jp: '{提灯|ちょうちん} は その {隣|となり} に {置|お}いて ください 。', en: 'Put the lantern next to her.', want: { who: 'lantern', next: 'hana' } },
      { jp: 'テツ さん は {上手|かみて} で {待|ま}って いて ください 。', en: 'Tetsu, wait in the wings on the kamite side (the audience\'s right).', want: { who: 'tetsu', wing: 'right' } },
    ],
  });
})();
