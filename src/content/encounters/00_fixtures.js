/* The encounter platform's fixtures (playbook P04: "create fixture examples before region-specific content"). These
 * are DEVELOPMENT FIXTURES, not story content: no map, scene or quest starts them. They are played by the unit
 * tests (tests/unit/encounters.test.mjs), the browser test (tests/e2e/encounters.mjs) and the development panel
 * (index.html?dev=enc). Each shows one kind of encounter a chapter will author: an ordinary fight with conditions,
 * a summoner, an independent guest, a protected object, a short machine that restarts, a long one with stable
 * checkpoints, a disagreement, a recovery from a Hush on one family of responses, two-move turns, arrivals, and
 * Tactics Board studies. Creatures are existing ones, varied for the encounter (never a new species). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.encounters = C.encounters || {};
  const add = (d) => { C.encounters[d.id] = Object.assign({ fixture: true }, d); };
  const ch = (opts) => ({ kind: 'choose', ...opts });

  // ---- an ordinary fight, with conditions and Wait ---------------------------------------------------------------
  add({
    id: 'fx.ordinary', name: { jp: '{燃|も}える {紙|かみ}', en: 'Fire and paper' },
    lead: { enemy: 'co.ember', conditions: ['flame'] }, group: [{ enemy: 'sg.crane', conditions: ['paper'] }],
    rules: { wait: true, conditions: true },
  });

  // ---- a summoner: it calls others, never more than two at once; a bell calls them off, a rope bars the way ----
  add({
    id: 'fx.summoner', name: { jp: '{呼|よ}ぶ もの', en: 'The one who calls' }, setPiece: true, capacity: 4,
    lead: { enemy: 'co.warden', pattern: ['call', 'strike', 'heat', 'call', 'sweep'], intents: { call: { say: 'It throws back its head and calls.' } } },
    calls: { enemy: { enemy: 'co.ember', pattern: ['strike', 'rest'] }, standing: 2, knots: 1 },
  });

  // ---- an independent guest: a porter with their own aim ----------------------------------------------------------
  add({
    id: 'fx.guest', name: { jp: '{荷物|にもつ} を {取|と}り{返|かえ}す', en: 'The porter\'s cargo' },
    lead: { enemy: 'sg.crab', knots: 3 },
    actors: [{
      aid: 'g:porter', side: 'guest', name: { jp: '{荷運|にはこ}び', en: 'The porter' }, hp: 4,
      agenda: { wants: 'settle', target: 'f0', act: { kind: 'unravel', n: 1 }, reactsTo: { youSettle: 'satisfied', youHelp: 'thanks' } },
      lines: {
        arrive: { jp: 'その {蟹|かに} 、 {荷物|にもつ} を {離|はな}さない んだ ！', en: 'That crab won\'t let go of my cargo!' },
        act: { jp: 'よいしょ ！', en: 'The porter heaves at a knot: it comes loose.' },
        thanks: { jp: 'いい ぞ 、 その {調子|ちょうし} ！', en: '"Good, keep it up!"' },
        satisfied: { jp: '{助|たす}かった ！ ありがとう 。', en: '"You saved me there. Thank you!" The porter shoulders the cargo and goes.' },
        done: { jp: 'よし 、 {取|と}り{返|かえ}した 。', en: '"Right, got it back." The porter goes on their way.' },
      },
    }],
  });

  // ---- a protected object: a paper letter the creatures aim at ----------------------------------------------------
  add({
    id: 'fx.protect', name: { jp: '{手紙|てがみ} を {守|まも}る', en: 'Keep the letter safe' },
    lead: { enemy: 'sa.crane', pattern: ['strike:letter', 'rest', 'strike:letter', 'gust'], intents: { 'strike:letter': { target: 'o:letter' } } },
    group: { normal: ['sg.fogwisp'], hard: ['sg.fogwisp', 'rw.reedling'] },
    rules: { conditions: true },
    actors: [{ aid: 'o:letter', side: 'object', name: { jp: '{手紙|てがみ}', en: 'the letter' }, hp: 3, cond: ['paper'], protectable: true }],
    objective: { kind: 'protect', aid: 'o:letter', text: { jp: '{手紙|てがみ} を {守|まも}る', en: 'Keep the letter safe until the creatures settle or give up.' } },
    settleWins: true,
    conclusions: [
      { id: 'lost', when: { down: 'o:letter' }, result: 'end', text: { en: 'The letter is torn past reading. It can be written again; the words are not lost, only the paper.' } },
      { id: 'safe', when: { settled: 'all' }, result: 'win', text: { en: 'The letter is safe.' } },
      { id: 'held', when: { all: [{ rounds: 6 }, { standing: 'o:letter' }] }, result: 'win', text: { en: 'They give up on the letter and drift away.' } },
    ],
  });

  // ---- a short machine: a wrong move starts it again from the first step ------------------------------------------
  const gateTask = (en, ok, wrong) => ({
    F: ch({ item: 'c:fx_sluice', prompt: { en }, options: [{ jp: ok, ok: true }, { jp: wrong, ok: false, why: { en: 'That is not what the notice says to do now.' } }] }),
    E: ch({ item: 'c:fx_sluice', prompt: { en }, options: [{ jp: ok, ok: true }, { jp: wrong, ok: false, why: { en: 'That is not what the notice says to do now.' } }] }),
    I: ch({ item: 'c:fx_sluice', prompt: { en }, options: [{ jp: ok, ok: true }, { jp: wrong, ok: false, why: { en: 'That is not what the notice says to do now.' } }] }),
    A: ch({ item: 'c:fx_sluice', prompt: { en }, options: [{ jp: ok, ok: true }, { jp: wrong, ok: false, why: { en: 'That is not what the notice says to do now.' } }] }),
  });
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  add({
    id: 'fx.sluice', kind: 'procedure', name: { jp: '{小|ちい}さな {水門|すいもん}', en: 'The little sluice' },
    rules: { wait: true },
    procedure: {
      id: 'fx_sluice', version: 1, restart: 'start',
      machine: { gate: 'shut', wheel: 'still' },
      show: [
        { key: 'gate', label: { jp: '{水門|すいもん}', en: 'Sluice gate' }, values: { shut: { jp: '{閉|し}まっている', en: 'shut' }, open: { jp: '{開|あ}いている', en: 'open' } } },
        { key: 'wheel', label: { jp: '{車輪|しゃりん}', en: 'Wheel' }, values: { still: { jp: '{止|と}まっている', en: 'still' }, turning: { jp: '{回|まわ}っている', en: 'turning' } } },
      ],
      done: { en: 'Water runs, the wheel turns, and the gate is shut again: the mill can work.' },
      steps: [
        { id: 's1', text: { jp: 'まず 、 {水門|すいもん} を {開|あ}けて ください 。', en: 'First, open the sluice gate.' },
          task: gateTask('What does the notice ask you to do first?', '{水門|すいもん} を {開|あ}ける', '{車輪|しゃりん} を {回|まわ}す'),
          actions: [
            A('open', '{水門|すいもん} を {開|あ}ける', 'Open the gate', { ok: true, set: { gate: 'open' }, means: { en: 'You will open the sluice gate first.' }, result: { en: 'The gate lifts; water rushes into the race.' } }),
            A('turn', '{車輪|しゃりん} を {回|まわ}す', 'Turn the wheel', { means: { en: 'You will turn the wheel first.' }, wrong: { en: 'The wheel grinds against dry wood and jams. Everything settles back to the start.' } }),
          ] },
        { id: 's2', text: { jp: '{次|つぎ} に 、 {車輪|しゃりん} を {回|まわ}して ください 。', en: 'Next, turn the wheel.' },
          task: gateTask('What does the notice ask you to do next?', '{車輪|しゃりん} を {回|まわ}す', '{水門|すいもん} を {閉|し}める'),
          actions: [
            A('turn', '{車輪|しゃりん} を {回|まわ}す', 'Turn the wheel', { ok: true, set: { wheel: 'turning' }, means: { en: 'You will turn the wheel now.' }, result: { en: 'The wheel catches the water and turns.' } }),
            A('close', '{水門|すいもん} を {閉|し}める', 'Close the gate', { means: { en: 'You will close the gate now.' }, wrong: { en: 'The water stops before the wheel has moved. Back to the start.' } }),
          ] },
        { id: 's3', text: { jp: '{最後|さいご} に 、 {水門|すいもん} を {閉|し}めて ください 。', en: 'Finally, close the gate.' },
          task: gateTask('What does the notice ask you to do last?', '{水門|すいもん} を {閉|し}める', '{車輪|しゃりん} を {止|と}める'),
          actions: [
            A('close', '{水門|すいもん} を {閉|し}める', 'Close the gate', { ok: true, set: { gate: 'shut' }, means: { en: 'You will close the gate now.' }, result: { en: 'The gate drops; the race keeps just enough water.' } }),
            A('stop', '{車輪|しゃりん} を {止|と}める', 'Stop the wheel', { set: { wheel: 'still' }, means: { en: 'You will stop the wheel now.' }, wrong: { en: 'The wheel stops, the race floods over. Back to the start.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The sluice works.' } }],
  });

  // ---- a long machine: a wrong move goes back only to the last stable step ----------------------------------------
  const lockTask = (en, ok, wrong) => gateTask(en, ok, wrong);
  add({
    id: 'fx.lock', kind: 'procedure', name: { jp: '{閘門|こうもん}', en: 'The canal lock' },
    procedure: {
      id: 'fx_lock', version: 1, restart: 'stable',
      machine: { lower: 'open', upper: 'shut', water: 'low', boat: 'outside' },
      show: [
        { key: 'lower', label: { jp: '{下|した} の {門|もん}', en: 'Lower gate' }, values: { open: { jp: '{開|あ}いている', en: 'open' }, shut: { jp: '{閉|し}まっている', en: 'shut' } } },
        { key: 'upper', label: { jp: '{上|うえ} の {門|もん}', en: 'Upper gate' }, values: { open: { jp: '{開|あ}いている', en: 'open' }, shut: { jp: '{閉|し}まっている', en: 'shut' } } },
        { key: 'water', label: { jp: '{水|みず}', en: 'Water' }, values: { low: { jp: '{低|ひく}い', en: 'low' }, high: { jp: '{高|たか}い', en: 'high' } } },
        { key: 'boat', label: { jp: '{舟|ふね}', en: 'Boat' }, values: { outside: { jp: '{外|そと}', en: 'outside' }, inside: { jp: '{中|なか}', en: 'inside' }, through: { jp: '{通|とお}った', en: 'through' } } },
      ],
      done: { en: 'The boat rides up and out onto the higher canal.' },
      steps: [
        { id: 'l1', text: { jp: '{舟|ふね} を {中|なか} に {入|い}れて ください 。', en: 'Bring the boat inside.' }, task: lockTask('What comes first?', '{舟|ふね} を {入|い}れる', '{上|うえ} の {門|もん} を {開|あ}ける'),
          actions: [A('boat_in', '{舟|ふね} を {入|い}れる', 'Bring the boat in', { ok: true, set: { boat: 'inside' }, means: { en: 'You will bring the boat into the lock.' }, result: { en: 'The boat glides into the chamber.' } }),
            A('upper', '{上|うえ} の {門|もん} を {開|あ}ける', 'Open the upper gate', { means: { en: 'You will open the upper gate now.' }, wrong: { en: 'Water pours through the open lower gate: the keeper shuts everything again.' } })] },
        { id: 'l2', stable: true, text: { jp: '{下|した} の {門|もん} を {閉|し}めて ください 。', en: 'Close the lower gate.' }, task: lockTask('What now?', '{下|した} の {門|もん} を {閉|し}める', '{舟|ふね} を {出|だ}す'),
          actions: [A('lower', '{下|した} の {門|もん} を {閉|し}める', 'Close the lower gate', { ok: true, set: { lower: 'shut' }, means: { en: 'You will close the lower gate.' }, result: { en: 'The lower gate swings shut behind the boat.' } }),
            A('out', '{舟|ふね} を {出|だ}す', 'Take the boat out', { means: { en: 'You will take the boat back out.' }, wrong: { en: 'The boat bumps back out: you start again from bringing it in.' } })] },
        { id: 'l3', text: { jp: '{水|みず} が {高|たか}く なる まで {待|ま}って ください 。', en: 'Wait until the water is high.' }, task: lockTask('What now?', '{待|ま}つ', '{上|うえ} の {門|もん} を {開|あ}ける'),
          actions: [A('wait', '{待|ま}つ', 'Wait for the water', { ok: true, set: { water: 'high' }, means: { en: 'You will wait for the water to rise.' }, result: { en: 'The water rises, and the boat with it.' } }),
            A('upper', '{上|うえ} の {門|もん} を {開|あ}ける', 'Open the upper gate', { means: { en: 'You will open the upper gate before the water has risen.' }, wrong: { en: 'The gate will not budge against the weight of water. The keeper sets it back: the lower gate is still shut.' } })] },
        { id: 'l4', stable: true, text: { jp: '{上|うえ} の {門|もん} を {開|あ}けて ください 。', en: 'Open the upper gate.' }, task: lockTask('What now?', '{上|うえ} の {門|もん} を {開|あ}ける', '{下|した} の {門|もん} を {開|あ}ける'),
          actions: [A('upper', '{上|うえ} の {門|もん} を {開|あ}ける', 'Open the upper gate', { ok: true, set: { upper: 'open' }, means: { en: 'You will open the upper gate.' }, result: { en: 'The upper gate opens onto the high canal.' } }),
            A('lower', '{下|した} の {門|もん} を {開|あ}ける', 'Open the lower gate', { means: { en: 'You will open the lower gate.' }, wrong: { en: 'The water drains away again. Back to waiting for it.' } })] },
        { id: 'l5', text: { jp: '{舟|ふね} を {出|だ}して ください 。', en: 'Take the boat out.' }, task: lockTask('What now?', '{舟|ふね} を {出|だ}す', '{上|うえ} の {門|もん} を {閉|し}める'),
          actions: [A('out', '{舟|ふね} を {出|だ}す', 'Take the boat out', { ok: true, set: { boat: 'through' }, means: { en: 'You will take the boat out onto the high canal.' }, result: { en: 'The boat slides out onto the high canal.' } }),
            A('upper_shut', '{上|うえ} の {門|もん} を {閉|し}める', 'Close the upper gate', { means: { en: 'You will close the upper gate with the boat still inside.' }, wrong: { en: 'The boat is shut in. The keeper opens the upper gate again.' } })] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'Through the lock.' } }],
  });

  // ---- a disagreement: claims on record, what each wants, a situation that changes -------------------------------
  const say = (jp, en) => ({ jp, en });
  const choose3 = (item, en, ok, w1, why1) => {
    const st = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    return { F: st, E: st, I: st, A: st };
  };
  add({
    id: 'fx.dispute', kind: 'social', name: { jp: '{足|た}りない かご', en: 'The missing basket' },
    rules: { wait: true },
    social: {
      parties: [
        { aid: 'n:baker', name: { jp: 'パン{屋|や}さん', en: 'The baker' }, stance: 'heated', wants: { en: 'Paid for three baskets.' } },
        { aid: 'n:runner', name: { jp: '{配達|はいたつ} の {子|こ}', en: 'The delivery runner' }, stance: 'closed', wants: { en: 'Not to be called a thief.' } },
      ],
      claims: {
        c1: { by: 'n:baker', jp: 'かご を {三|みっ}つ {渡|わた}しました 。', en: 'I handed over three baskets.' },
        c2: { by: 'n:runner', jp: '{二|ふた}つ しか {受|う}け{取|と}って いません 。', en: 'I only received two.' },
        c3: { by: 'slip', jp: '{三|みっ}つ{目|め} は {午後|ごご} 。', en: 'The slip: the third is for the afternoon.', hidden: true },
        c4: { by: 'n:runner', jp: '{裏口|うらぐち} で {受|う}け{取|と}りました 。', en: 'I picked them up at the back door.', hidden: true },
      },
      understanding: 3,
      gesture: { name: { jp: '{二人|ふたり} を つなぐ', en: 'Bring them together' }, desc: 'With your companion, help them hear each other.', effect: { flag: 'reconciled' }, says: { en: 'For a moment they laugh at the same thing. The rest is easy.' } },
      unravelTip: { en: 'Nothing is tangled here. Look at the record of what each said, who is heated, and what each one wants.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('お{二人|ふたり} とも 、 {落|お}ち{着|つ}いて ください 。', 'Ask them both to calm down'),
          task: choose3('c:fx_dispute_calm', 'Which asks them both to calm down?', 'お{二人|ふたり} とも 、 {落|お}ち{着|つ}いて ください 。', 'お{二人|ふたり} とも 、 {急|いそ}いで ください 。', 'That one asks them to hurry.'),
          cases: [{ when: { stance: { 'n:baker': 'heated' } }, effect: { stance: { 'n:baker': 'listening' } }, says: { en: 'The baker takes a breath.' } }],
          says: { en: 'They are already calm. Saying it again changes nothing.' } },
        { id: 'ask_where', kind: 'ask', label: say('どこ で {受|う}け{取|と}りました か 。', 'Ask the runner where they picked them up'), once: true,
          task: choose3('c:fx_dispute_where', 'Which asks where they picked them up?', 'どこ で {受|う}け{取|と}りました か 。', 'いつ {受|う}け{取|と}りました か 。', 'That one asks when, not where.'),
          effect: { reveal: 'c4', stance: { 'n:runner': 'listening' } }, says: { en: 'The runner looks up, surprised to be asked.' } },
        { id: 'ask_slip', kind: 'evidence', label: say('{伝票|でんぴょう} を {見|み}せて ください 。', 'Ask to see the delivery slip'), once: true, when: { used: 'ask_where' },
          task: choose3('c:fx_dispute_slip', 'Which asks to see the slip?', '{伝票|でんぴょう} を {見|み}せて ください 。', '{伝票|でんぴょう} を {書|か}いて ください 。', 'That one asks them to write a slip.'),
          effect: { reveal: 'c3', understanding: 1 }, says: { en: 'The slip says it plainly: the third basket was for the afternoon.' } },
        { id: 'propose', kind: 'propose', label: say('{三|みっ}つ{目|め} は {午後|ごご} に {届|とど}けましょう 。', 'Suggest the third goes out this afternoon'), when: { claims: 'c3' },
          task: choose3('c:fx_dispute_propose', 'Which suggests delivering the third this afternoon?', '{三|みっ}つ{目|め} は {午後|ごご} に {届|とど}けましょう 。', '{三|みっ}つ{目|め} は {明日|あした} {返|かえ}しましょう 。', 'That suggests returning it tomorrow.'),
          effect: { flag: 'agreed' }, says: { en: 'Both nod. The third basket goes out this afternoon.' } },
        { id: 'blame', kind: 'propose', label: say('{配達|はいたつ} の {子|こ} が {悪|わる}い です 。', 'Say the runner is to blame'), lasting: true, means: { en: 'You will tell them the runner is to blame.' },
          task: choose3('c:fx_dispute_blame', 'Which says the runner is to blame?', '{配達|はいたつ} の {子|こ} が {悪|わる}い です 。', 'パン{屋|や}さん が {悪|わる}い です 。', 'That blames the baker.'),
          effect: { stance: { 'n:runner': 'leaving' } }, says: { en: 'The runner goes white, then turns to leave.' } },
      ],
      responses: {
        hikari: { when: { not: { claims: 'c3' } }, effect: { reveal: 'c3', understanding: 1 }, says: { en: 'In the light, the slip\'s small print can be read.' } },
        water: { when: { stance: { 'n:baker': 'heated' } }, effect: { stance: { 'n:baker': 'listening' } }, says: { en: 'A cup of water, and the baker\'s temper cools.' } },
        bell: { when: { any: [{ stance: { 'n:baker': 'heated' } }, { stance: { 'n:runner': 'heated' } }] }, effect: { stance: { 'n:baker': 'listening' } }, says: { en: 'A clear note: for a moment, everyone stops talking.' } },
        unravel: { says: { en: 'Nothing here is tangled: the problem is what each of them believes.' } },
      },
      wait: { when: { stance: { 'n:runner': 'closed' } }, effect: { reveal: 'c4', stance: { 'n:runner': 'listening' } }, says: { en: 'In the quiet, the runner speaks up at last.' } },
      companion: {
        nao: [{ id: 'nao_mismatch', name: say('{食|く}い{違|ちが}い を {見|み}つける', 'Spot the mismatch'), desc: 'Nao looks for where the stories differ.', when: { claims: 'c4' }, once: true, effect: { understanding: 1 }, says: { en: 'Nao: "You\'re both right about the number. It\'s the time you disagree about."' } }],
        mio: [{ id: 'mio_calm', name: say('{落|お}ち{着|つ}かせる', 'Calm the baker'), desc: 'Mio speaks to the baker quietly.', when: { stance: { 'n:baker': 'heated' } }, effect: { stance: { 'n:baker': 'listening' } }, says: { en: 'Mio: "Nobody is calling you a liar." The baker sits down.' } }],
        ren: [{ id: 'ren_light', name: say('{伝票|でんぴょう} を {照|て}らす', 'Hold the lamp to the slip'), desc: 'Ren holds the lamp close to the paper.', when: { not: { claims: 'c3' } }, effect: { reveal: 'c3' }, says: { en: 'Ren holds the lamp close: there is writing at the bottom of the slip.' } }],
        suzu: [{ id: 'suzu_joke', name: say('{冗談|じょうだん} を {言|い}う', 'Make a joke'), desc: 'Suzu breaks the tension.', once: true, effect: { understanding: 1, stance: { 'n:runner': 'listening' } }, says: { en: 'Suzu: "If the basket ran off by itself, it\'s faster than both of you." Even the runner smiles.' } }],
      },
      drift: [
        { when: { all: [{ rounds: 2 }, { stance: { 'n:baker': 'heated' } }] }, effect: { stance: { 'n:runner': 'closed' } }, says: { en: 'The baker\'s voice rises; the runner folds their arms.' } },
        { when: { all: [{ rounds: 4 }, { stance: { 'n:baker': 'heated' } }] }, effect: { stance: { 'n:runner': 'leaving' } }, says: { en: '"I don\'t have to listen to this." The runner turns to go.' } },
        { when: { stance: { 'n:baker': 'listening', 'n:runner': 'listening' } }, effect: { understanding: 1 }, says: { en: 'They are both listening now.' } },
      ],
    },
    conclusions: [
      { id: 'walked_out', when: { left: 'n:runner' }, result: 'end', text: { en: 'The runner walks out. The baker is left counting baskets alone.' } },
      { id: 'reconciled', when: { flag: 'reconciled' }, result: 'end', text: { en: 'They settle it together, and agree to check the slip next time.' } },
      { id: 'resolved', when: { flag: 'agreed' }, result: 'end', text: { en: 'The third basket goes out this afternoon. Nobody was a thief.' } },
      { id: 'differ', when: { all: [{ rounds: 6 }, { claims: 'c3' }] }, result: 'end', text: { en: 'The slip is clear, but neither will say so. They agree to disagree, and the basket goes out anyway.' } },
      { id: 'unresolved', when: { rounds: 6 }, result: 'end', text: { en: 'The shop opens; the argument goes nowhere. The basket stays a mystery for today.' } },
    ],
  });

  // ---- a Hush on one family: water silenced for two exchanges; a bell or a voice ends it -------------------------
  add({
    id: 'fx.hush', name: { jp: '{静|しず}かな {水|みず}', en: 'The silenced water' },
    lead: { enemy: 'lf.blot', knots: 4, pattern: ['silence:water', 'heat', 'strike', 'silence', 'heat'], intents: { 'silence:water': { family: 'water', rounds: 2 } } },
  });

  // ---- two moves at once, a plan over two exchanges, and a signal -------------------------------------------------
  add({
    id: 'fx.doubles', name: { jp: '{二|ふた}つ の {動|うご}き', en: 'Two moves at once' },
    lead: { enemy: 'sb.golem', pattern: ['strike:cued', 'charge:plan', 'flood', 'strike:and'], intents: { 'strike:cued': { cue: true }, 'charge:plan': { then: 'flood' }, 'strike:and': { and: 'shroud' } } },
    // (the second creature starts one step into its pattern: its signal and the lead's cued blow come together)
    group: [{ enemy: 'sb.fox', pattern: ['rest', 'charge:signal', 'strike'], intents: { 'charge:signal': { signal: true } } }],
    rules: { doubles: true },
  });

  // ---- arrivals: one is coming in two exchanges; a bell or a rope can stop it -------------------------------------
  add({
    id: 'fx.arrivals', name: { jp: '{近|ちか}づく {羽音|はおと}', en: 'Wings coming closer' },
    lead: 'rw.reedling',
    arrivals: [{ enemy: 'rw.dustmoth', after: 2, prevent: ['bell', 'bind'], say: { jp: '{遠|とお}く で {羽音|はおと} が する 。', en: 'Wings whirr in the distance: something is coming.' } }],
    extras: [{ enemy: 'rw.reedling', after: 3 }],
  });

  // ---- every modifier option (E27): three creatures with moves of every kind; every modifier known ------------
  add({
    id: 'fx.mods', name: { jp: '{言葉|ことば} の {届|とど}く {先|さき}', en: 'How far words reach' }, setPiece: true, capacity: 3,
    lead: { enemy: 'sb.golem', knots: 4, pattern: ['strike', 'charge', 'shroud', 'heat', 'mend', 'gust'] },
    group: [{ enemy: 'sb.fox', knots: 3, pattern: ['heat', 'strike', 'chill', 'charge', 'sweep', 'shroud'] }, { enemy: 'sg.fogwisp', knots: 3, pattern: ['charge', 'shroud', 'strike', 'mend', 'heat', 'flood'] }],
    rules: { modifiers: 'all', doubles: true },
  });
  // the same creatures before any modifier (the curve's comparison)
  add(Object.assign(JSON.parse(JSON.stringify(C.encounters['fx.mods'])), { id: 'fx.mods_base', name: { jp: '{言葉|ことば} の {届|とど}く {先|さき}', en: 'How far words reach (before modifiers)' }, rules: { doubles: true } }));
  add({
    id: 'fx.mods_hush', name: { jp: '{届|とど}かない {言葉|ことば}', en: 'Words that do not reach' },
    lead: { enemy: 'sa.wraith', knots: 4, pattern: ['silence:mods', 'strike', 'rest', 'strike'], intents: { 'silence:mods': { family: 'modifiers', rounds: 2 } } },
    rules: { modifiers: 'all' },
  });

  // ---- Tactics Board studies (E15): a fixed toolset, a goal, a number of committed exchanges ----------------------
  add({
    id: 'fx.study.mist', kind: 'study', name: { jp: '{霧|きり} の {中|なか} で', en: 'In the mist' },
    lead: { enemy: 'sg.fogwisp', pattern: ['shroud', 'rest', 'shroud'], knots: 2 },
    study: { tools: ['kaze', 'hikari'], turns: 3, explain: { en: 'Clear the mist first, then untie: wind reaches every creature, light only one.' } },
  });
  add({
    id: 'fx.study.fire', kind: 'study', name: { jp: '{炎|ほのお} の {体|からだ}', en: 'A body of flame' }, rules: { conditions: true },
    lead: { enemy: 'co.ember', conditions: ['flame'], pattern: ['mend', 'rest', 'mend'], knots: 3 },
    study: { tools: ['mizu', 'kaze'], turns: 3, explain: { en: 'Water weakens a creature of flame, so the next Unravel frees one more knot. Wind only feeds it.' } },
  });
})(RB.content);
