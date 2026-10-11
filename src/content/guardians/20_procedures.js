/* The old guardians built round a procedure under pressure (expansion P15e; plan E16): the guardian keeps acting while
 * you work, and the procedure is how it settles. Each step is read from the guardian's own words at the profile's
 * level; a wrong action is shown for what it would do and costs nothing but the exchange. The steps you got right are
 * kept if you step back or fall (restart 'stable'), so a retry never starts from nothing.
 *   gd.rw  the Founder's Voice: start the mill as it was first started (sequence: まず, その後, 〜たら, 〜ておく)
 *   gd.ko  the First Keeper: shelve the four leaves of her ledger (to whom, by whom, who is still here, a wish) */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  // the guardian's words at each level (F in kana), and what they ask of you: two options below Intermediate, three above
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }),
      I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }

  // ---- the Founder's Voice (Reedwake's mill) ----------------------------------------------------------------------------
  const RW = [
    ['まず 、 いしうす を あわせろ 。 みず を いれる の は 、 その あと だ 。', 'まず 、 {石臼|いしうす} を {合|あ}わせろ 。 {水|みず} を {入|い}れる の は 、 その {後|あと} だ 。', '"First, set the millstones together. The water comes after."'],
    ['いし を あわせたら 、 すいもん を はんぶん だけ あけろ 。 ぜんぶ あける と 、 すいしゃ が こわれる ぞ 。', '{石|いし} を {合|あ}わせたら 、 {水門|すいもん} を {半分|はんぶん} だけ {開|あ}けろ 。 {全部|ぜんぶ} {開|あ}ける と 、 {水車|すいしゃ} が {壊|こわ}れる ぞ 。', '"With the stones set, open the sluice halfway, no more. Open it all the way and the wheel breaks."'],
    ['すいしゃ が まわりはじめたら 、 むぎ を すこし ずつ いれろ 。 いちど に いれる な 。', '{水車|すいしゃ} が {回|まわ}り{始|はじ}めたら 、 {麦|むぎ} を {少|すこ}し ずつ {入|い}れろ 。 {一度|いちど} に {入|い}れる な 。', '"Once the wheel is turning, feed the grain in a little at a time. Not all at once."'],
    ['ひ が くれる まえ に 、 すいもん を しめて おけ 。 よる の かわ は 、 すいしゃ を ながす 。', '{日|ひ} が {暮|く}れる {前|まえ} に 、 {水門|すいもん} を {閉|し}めて おけ 。 {夜|よる} の {川|かわ} は 、 {水車|すいしゃ} を {流|なが}す 。', '"Before the sun goes down, have the sluice shut. The river at night carries mills away."'],
  ];
  C.encounters['gd.rw'] = {
    id: 'gd.rw', kind: 'battle', name: say('{初代|しょだい} の {声|こえ}', 'The Founder\'s Voice'), story: true, canFlee: true, guardian: 'rw',
    lead: { enemy: 'gd.founder' },
    rules: { wait: true },
    procedure: {
      id: 'gd_rw', version: 1, restart: 'stable',
      machine: { stones: 'apart', sluice: 'shut', wheel: 'still', grain: 'none' },
      show: [
        { key: 'stones', label: say('{石臼|いしうす}', 'Millstones'), values: vals({ apart: ['{離|はな}れて いる', 'apart'], set: ['{合|あ}わさって いる', 'set together'] }) },
        { key: 'sluice', label: say('{水門|すいもん}', 'Sluice'), values: vals({ shut: ['{閉|し}まって いる', 'shut'], half: ['{半分|はんぶん} {開|あ}いて いる', 'half open'] }) },
        { key: 'wheel', label: say('{水車|すいしゃ}', 'Wheel'), values: vals({ still: ['{止|と}まって いる', 'still'], turning: ['{回|まわ}って いる', 'turning'] }) },
        { key: 'grain', label: say('{粉|こな}', 'Flour'), values: vals({ none: ['まだ ない', 'none yet'], flour: ['{出|で}て いる', 'coming'] }) },
      ],
      done: { en: 'The stones set, the grain ground, the sluice shut for the night: the mill has worked as it first worked.' },
      steps: [
        { id: 'm1', stable: true, text: say(RW[0][1], RW[0][2]),
          task: hear('g:mae_ato', RW[0][0], RW[0][1], 'What does the founder want done first?', 'Set the millstones together.', 'Open the sluice.', 'その {後|あと}: the water comes after.', 'Pour in the grain.', 'Nothing is said of grain yet.'),
          actions: [
            A('stones', '{石臼|いしうす} を {合|あ}わせる', 'Set the millstones together', { ok: true, set: { stones: 'set' }, means: { en: 'You will set the upper stone down onto the lower.' }, result: { en: 'The upper stone settles onto the lower with a deep, grinding thud.' } }),
            A('water', '{水門|すいもん} を {開|あ}ける', 'Open the sluice', { means: { en: 'You will let the water in with the stones still apart.' }, wrong: { en: 'The wheel lurches round with the stones apart, grinding nothing. The voice roars: "Stones first!"' } }),
          ] },
        { id: 'm2', stable: true, text: say(RW[1][1], RW[1][2]),
          task: hear('g:cond_to', RW[1][0], RW[1][1], 'How far should the sluice open, and why?', 'Halfway: open all the way, the wheel would break.', 'All the way, as fast as it will go.', '{全部|ぜんぶ} {開|あ}ける と {壊|こわ}れる: open it fully and it breaks.', 'Not at all.', '{半分|はんぶん} だけ {開|あ}けろ: halfway.'),
          actions: [
            A('half', '{水門|すいもん} を {半分|はんぶん} {開|あ}ける', 'Open the sluice halfway', { ok: true, set: { sluice: 'half', wheel: 'turning' }, means: { en: 'You will raise the sluice board halfway.' }, result: { en: 'Water pours under the board, and the wheel begins to turn.' } }),
            A('full', '{水門|すいもん} を {全部|ぜんぶ} {開|あ}ける', 'Open the sluice all the way', { means: { en: 'You will haul the sluice board right up.' }, wrong: { en: 'You haul at the board; the voice bellows "Half!" and you stop before the wheel shakes itself apart.' } }),
          ] },
        { id: 'm3', stable: true, text: say(RW[2][1], RW[2][2]),
          task: hear('g:cond_tara', RW[2][0], RW[2][1], 'When, and how, does the grain go in?', 'Once the wheel turns, a little at a time.', 'All at once, before the wheel turns.', '{回|まわ}り{始|はじ}めたら: once it starts turning; {少|すこ}し ずつ: a little at a time.', 'Only after dark.', 'Nothing is said of the dark here.'),
          actions: [
            A('little', '{麦|むぎ} を {少|すこ}し ずつ {入|い}れる', 'Feed the grain in a little at a time', { ok: true, set: { grain: 'flour' }, means: { en: 'You will trickle the grain into the hopper.' }, result: { en: 'Flour, pale and warm, begins to sift out of the stones.' } }),
            A('all', '{麦|むぎ} を {全部|ぜんぶ} {入|い}れる', 'Tip all the grain in at once', { means: { en: 'You will tip the whole sack in.' }, wrong: { en: 'The hopper chokes and the stones groan to a halt. The voice sighs: "Little by little."' } }),
          ] },
        { id: 'm4', stable: true, text: say(RW[3][1], RW[3][2]),
          task: hear('g:te_oku', RW[3][0], RW[3][1], 'What must be done before dark, and why?', 'The sluice shut: the river at night can carry a mill away.', 'The sluice opened fully for the night.', '{閉|し}めて おけ: have it shut.', 'A lantern lit by the wheel.', 'Nothing is said of a lantern.'),
          actions: [
            A('shut', '{水門|すいもん} を {閉|し}める', 'Shut the sluice', { ok: true, set: { sluice: 'shut', wheel: 'still' }, means: { en: 'You will lower the sluice board for the night.' }, result: { en: 'The board drops; the wheel slows, and stops, and drips.' } }),
            A('leave', '{水門|すいもん} を {開|あ}けた まま に する', 'Leave the sluice open', { means: { en: 'You will leave it open overnight.' }, wrong: { en: 'You turn to go. The voice says, very quietly: "The river took my first wheel that way."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'turning', when: { proc: 'done' }, result: 'win', text: { en: 'The mill has worked as it first worked, and the founder\'s voice is satisfied.' } }],
    help: { explain: { en: 'The voice gives its orders in order: まず, then その {後|あと}, then 〜たら. Do each thing when it says, not before.' },
      suggest: { en: 'Read each order for when (まず, 〜たら, {前|まえ} に) and how much ({半分|はんぶん} だけ, {少|すこ}し ずつ); its blows come regardless, so keep your footing with Wait if you need to.' } },
  };

  // ---- the First Keeper (Kotonoha's roots) -------------------------------------------------------------------------------
  const KO = [
    ['りょうし が つま に かいた はっぱ 。 つま は もう よんだ 。', '{漁師|りょうし} が {妻|つま} に {書|か}いた {葉|は} 。 {妻|つま} は もう {読|よ}んだ 。', '"A leaf from a fisherman to his wife. She has read it already."'],
    ['むすめ に あてた はっぱ 。 むすめ は まだ うまれて いない 。', '{娘|むすめ} に {宛|あ}てられた {葉|は} 。 {娘|むすめ} は まだ {生|う}まれて いない 。', '"A leaf addressed to a daughter. The daughter is not born yet."'],
    ['あてさき の ない はっぱ 。 かいた ひと は 、 まだ しま に いる 。', '{宛先|あてさき} の ない {葉|は} 。 {書|か}いた {人|ひと} は 、 まだ {島|しま} に いる 。', '"A leaf with no address. The one who wrote it is still on the island."'],
    ['わたし が わたし に かいた はっぱ 。 「 だれか が この たな を つづけて くれます よう に 」 。', '{私|わたし} が {私|わたし} に {書|か}いた {葉|は} 。 「 {誰|だれ} か が この {棚|たな} を {継|つ}いで くれます よう に 」 。', '"A leaf I wrote to myself: \'May someone carry on these shelves.\'"'],
  ];
  const SHELF = vals({ loose: ['{散|ち}らばって いる', 'loose'], read: ['{届|とど}いた {棚|たな}', 'delivered'], wait: ['{待|ま}つ {棚|たな}', 'waiting'], back: ['{返|かえ}す {棚|たな}', 'to go back'], told: ['{読|よ}み{上|あ}げた', 'read aloud'] });
  C.encounters['gd.ko'] = {
    id: 'gd.ko', kind: 'battle', name: say('{最初|さいしょ} の {葉守|はもり}', 'The First Keeper'), story: true, canFlee: true, guardian: 'ko',
    lead: { enemy: 'gd.firstkeeper', conditions: ['rooted'] },
    group: { normal: ['ko.leafling'], hard: ['ko.leafling', 'ko.leafling'] },
    rules: { wait: true, conditions: true },
    procedure: {
      id: 'gd_ko', version: 1, restart: 'stable',
      machine: { l1: 'loose', l2: 'loose', l3: 'loose', l4: 'loose' },
      show: [
        { key: 'l1', label: say('{一枚目|いちまいめ}', 'First leaf'), values: SHELF },
        { key: 'l2', label: say('{二枚目|にまいめ}', 'Second leaf'), values: SHELF },
        { key: 'l3', label: say('{三枚目|さんまいめ}', 'Third leaf'), values: SHELF },
        { key: 'l4', label: say('{四枚目|よんまいめ}', 'Fourth leaf'), values: SHELF },
      ],
      done: { en: 'Every leaf of her ledger is where it belongs: one delivered, one waiting, one going home to its writer, and her own read aloud.' },
      steps: [
        { id: 'k1', stable: true, text: say(KO[0][1], KO[0][2]),
          task: hear('g:prt_ni', KO[0][0], KO[0][1], 'Who wrote this leaf, to whom, and has it arrived?', 'The fisherman, to his wife; she has read it.', 'The wife, to the fisherman; he has not read it.', 'が marks the writer; に the one it was written to.', 'The fisherman, to himself.', 'に: to his wife.'),
          actions: [
            A('read', '{届|とど}いた {棚|たな} に {置|お}く', 'Put it on the shelf for delivered leaves', { ok: true, set: { l1: 'read' }, means: { en: 'It has arrived; it goes with the delivered.' }, result: { en: 'The leaf lies flat on the shelf, at rest.' } }),
            A('wait', '{待|ま}つ {棚|たな} に {置|お}く', 'Put it on the shelf for leaves still waiting', { means: { en: 'You will put it with the leaves still waiting.' }, wrong: { en: 'The leaf curls up and will not lie there. She has read it: it is waiting for nothing.' } }),
          ] },
        { id: 'k2', stable: true, text: say(KO[1][1], KO[1][2]),
          task: hear('g:passive', KO[1][0], KO[1][1], 'Who is this leaf for, and can it be delivered yet?', 'A daughter not born yet: it must wait for her.', 'A daughter who has read it already.', 'まだ {生|う}まれて いない: she is not born yet.', 'Nobody: it has no address.', '{娘|むすめ} に {宛|あ}てられた: it was addressed to a daughter.'),
          actions: [
            A('wait', '{待|ま}つ {棚|たな} に {置|お}く', 'Put it on the shelf for leaves still waiting', { ok: true, set: { l2: 'wait' }, means: { en: 'It waits for the one it is for.' }, result: { en: 'The leaf settles on the waiting shelf, patient.' } }),
            A('back', '{返|かえ}す {棚|たな} に {置|お}く', 'Put it on the shelf for leaves going back', { means: { en: 'You will send it back to its writer.' }, wrong: { en: 'The First Keeper\'s hand stops yours. "It is not undeliverable. It is early."' } }),
          ] },
        { id: 'k3', stable: true, text: say(KO[2][1], KO[2][2]),
          task: hear('g:exist_aru_iru', KO[2][0], KO[2][1], 'Where should a leaf with no address go?', 'Back to its writer, who is still on the island.', 'Onto the delivered shelf.', '{宛先|あてさき} の ない: it has nobody to be delivered to.', 'Into the sea.', 'Its writer is still here (いる): it can go home.'),
          actions: [
            A('back', '{返|かえ}す {棚|たな} に {置|お}く', 'Put it on the shelf for leaves going back', { ok: true, set: { l3: 'back' }, means: { en: 'It goes home to the one who wrote it.' }, result: { en: 'The leaf turns, as if to look for someone on the island.' } }),
            A('read', '{届|とど}いた {棚|たな} に {置|お}く', 'Put it on the shelf for delivered leaves', { means: { en: 'You will call it delivered.' }, wrong: { en: 'The leaf flutters off the shelf. Nobody has had it: there is nobody to have had it.' } }),
          ] },
        { id: 'k4', stable: true, text: say(KO[3][1], KO[3][2]),
          task: hear('g:te_giving', KO[3][0], KO[3][1], 'What did the First Keeper wish for, writing to herself?', 'That someone would carry on her shelves.', 'That nobody would touch her shelves.', '{継|つ}いで くれます よう に: may someone carry them on (for her).', 'That the shelves would be burned.', 'くれますように is a wish for kindness, not an end.'),
          actions: [
            A('tell', '{葉|は} を {読|よ}み{上|あ}げ 、 「 {島|しま} の {葉守|はもり} が 、 {今|いま} も {継|つ}いで います 」 と {伝|つた}える', 'Read it aloud, and tell her: "The island\'s keepers carry them on still."', { ok: true, set: { l4: 'told' }, means: { en: 'You read her own wish back to her, and answer it.' }, result: { en: 'For the first time, the First Keeper looks up from her shelves.' } }),
            A('keep', '{葉|は} を {黙|だま}って {待|ま}つ {棚|たな} に {置|お}く', 'Put it on the waiting shelf without a word', { means: { en: 'You will shelve it unread.' }, wrong: { en: 'She takes it back from the shelf and holds it out to you again. It was written to be read.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'shelved', when: { proc: 'done' }, result: 'win', text: { en: 'Every leaf is shelved, and the First Keeper has heard that her shelves go on.' } }],
    help: { explain: { en: 'Each leaf in her ledger says who wrote it, to whom, and whether it can arrive. が and に tell writer and reader; まだ and もう tell you whether to wait.' },
      suggest: { en: 'Read the ledger line before you shelve; her blows and the leaflings keep coming, and she is rooted, so wind will not move her.' } },
  };
})(RB.content);
