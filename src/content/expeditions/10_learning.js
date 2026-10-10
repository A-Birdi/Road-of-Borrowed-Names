/* The Flood Cellars' language (expansion P07 pilot; an apprenticeship dungeon, plan D6 A31). One construction is
 * new, 〜て ある: a state someone brought about on purpose and left so. The board at the foot of the ladder teaches it
 * (with its grammar card); the lamp room and the sluice use it, each asking the question a cellar hand would: what
 * has been done already, and what is left to me? The outflow door combines it with what was known before: 〜て いる
 * (a state, nobody's intention said) and 〜て ください (a request). Every step has all four profiles; the steps mix
 * choosing, putting a notice in order and writing it, so every input route meets the construction. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const no = (en) => ({ en });

  // ---- the notice at the foot of the ladder: the construction taught -------------------------------------------
  C.challenges['xp.c_notice'] = { title: { jp: '{貼|は}り{紙|がみ}', en: 'The cellar hands\' notice' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '{米|こめ} は {棚|たな} の {上|うえ} に {上|あ}げて あります 。', en: '' },
          prompt: { en: 'The notice says the rice {上|あ}げて あります. What does that tell you?' },
          options: [
            { en: 'Someone has put the rice up on the shelves, and it is there now.', ok: true },
            { en: 'Please put the rice up on the shelves.', ok: false, why: no('That would be {上|あ}げて ください. 〜て あります says it has been done already.') },
            { en: 'The rice is floating up on the water.', ok: false, why: no('With 〜て ある, someone did it on purpose: the rice did not move by itself.') },
          ], explain: { jp: '〜て あります', en: 'て form + あります: someone did it, and it stays done. Here, the rice is safe on the shelves.' } },
        { kind: 'write', item: 'g:te_aru', ctx: { jp: '{階段|かいだん} の {灯|あか}り は つけて ＿＿ 。', en: 'The stair light: switched on, and left on.' },
          prompt: { en: 'Finish the notice the polite way the hands write: あります (arimasu).' },
          template: { before: '{階段|かいだん} の {灯|あか}り は つけて ', after: ' 。' }, answer: 'あります', accept: ['あります', 'ある'], mode: 'reading',
          explain: { jp: 'つけて あります', en: 'つけて あります — it has been switched on (and is on now).' } },
      ],
      E: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '{階段|かいだん} の {灯|あか}り は つけて あります 。', en: '' },
          prompt: { en: 'What do you need to do about the stair light?' },
          options: [
            { jp: 'もう ついて いる 。 その まま で いい 。', ok: true },
            { jp: '{灯|あか}り を つけて ください 。', ok: false, why: no('The notice says it has been switched on already (〜て あります): there is nothing to do.') },
            { jp: '{灯|あか}り は {消|き}えて いる 。', ok: false, why: no('つけて ある: someone switched it on and left it on.') },
          ], explain: { en: '〜て あります tells you what has been done and left so: the light is on.' } },
        { kind: 'order', item: 'g:te_aru', prompt: { en: 'Put the notice back in order: "The rice has been put up on the shelves."' },
          tiles: ['{米|こめ}', 'は', '{棚|たな}', 'の', '{上|うえ}', 'に', '{上|あ}げて', 'あります'], answer: ['{米|こめ}', 'は', '{棚|たな}', 'の', '{上|うえ}', 'に', '{上|あ}げて', 'あります'],
          orderHint: { en: 'The rice first (こめ は), then where (たな の うえ に), then {上|あ}げて あります.' } },
      ],
      I: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: 'Ａ ： {戸|と} が {開|あ}いて いる 。　Ｂ ： {戸|と} が {開|あ}けて ある 。', en: '' },
          prompt: { en: 'Which tells you that someone opened the door on purpose, and left it open?' },
          options: [
            { en: 'B: {開|あ}けて ある', ok: true },
            { en: 'A: {開|あ}いて いる', ok: false, why: no('{開|あ}いて いる only says the door is open ({開|あ}く, nobody acting); it says nothing about anyone.') },
            { en: 'Both say exactly the same.', ok: false, why: no('Both describe an open door, but only {開|あ}けて ある says someone did it deliberately.') },
          ], explain: { en: 'A verb someone does to a thing ({開|あ}ける) + て ある = a state someone left. A verb of the thing itself ({開|あ}く) + て いる = just the state.' } },
        { kind: 'write', item: 'g:te_aru', ctx: { jp: '{階段|かいだん} の {灯|あか}り が ＿＿ ある 。', en: 'The hands left the stair light on.' },
          prompt: { en: 'Write つける (to switch on) in the て form to finish the notice.' },
          template: { before: '{階段|かいだん} の {灯|あか}り が ', after: ' ある 。' }, answer: 'つけて', accept: ['つけて'], mode: 'reading',
          explain: { jp: 'つけて ある', en: 'つける → つけて; + ある: it has been switched on.' } },
      ],
      A: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '{米|こめ} は {上|あ}げて ある けど 、 {味噌|みそ} の {樽|たる} は まだ {下|した} に {置|お}いて ある 。', en: '' },
          prompt: { en: 'What does the notice imply about the miso barrels?' },
          options: [
            { en: 'They were left down below deliberately, for now: nobody forgot them.', ok: true },
            { en: 'Someone forgot them down below.', ok: false, why: no('{置|お}いて ある: they were put there and left so. Forgetting would be {忘|わす}れた.') },
            { en: 'They have been carried up with the rice.', ok: false, why: no('まだ {下|した} に: still down below.') },
          ], explain: { en: 'Two 〜て ある side by side: both are states somebody chose. まだ marks the second as not yet changed.' } },
        { kind: 'order', item: 'g:te_aru', prompt: { en: 'Put it in order: "The ladder has been put up against the wall."' },
          tiles: ['はしご', 'は', '{壁|かべ}', 'に', 'かけて', 'あります'], answer: ['はしご', 'は', '{壁|かべ}', 'に', 'かけて', 'あります'],
          orderHint: { en: 'はしご は, the wall with に, then かけて あります.' } },
      ],
    } };

  // ---- the lamp room (the optional route): what has been done, and what is left -------------------------------------
  C.challenges['xp.c_lamp'] = { title: { jp: '{消|き}えた ランプ', en: 'The lamp that went out' },
    tiers: {
      F: [
        { kind: 'choose', item: 'c:xp_cellars_lamp', ctx: { jp: '{油|あぶら} は {箱|はこ} の {中|なか} に {入|い}れて あります 。', en: '' },
          prompt: { en: 'Where is the lamp oil?' },
          options: [{ en: 'In the box.', ok: true }, { en: 'In the lamp.', ok: false, why: no('はこ の なか: inside the box.') }, { en: 'There is none left.', ok: false, why: no('{入|い}れて あります: someone has put it there, so it is there.') }] },
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: 'ガラス は {拭|ふ}いて あります 。 {油|あぶら} は まだ {入|い}れて いません 。', en: '' },
          prompt: { en: 'What is left for you to do?' },
          options: [{ en: 'Fill the lamp with oil.', ok: true }, { en: 'Wipe the glass.', ok: false, why: no('ふいて あります: the glass has been wiped already.') }],
          explain: { en: '〜て あります: done. まだ 〜て いません: not done yet.' } },
      ],
      E: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: 'ガラス は {拭|ふ}いて あります 。 {油|あぶら} は まだ {入|い}れて いません 。', en: '' },
          prompt: { en: 'What do you do?' },
          options: [{ jp: '{油|あぶら} を {入|い}れる', ok: true }, { jp: 'ガラス を {拭|ふ}く', ok: false, why: no('ふいて あります: it has been done.') }, { jp: '{何|なに} も しない', ok: false, why: no('まだ {入|い}れて いません: the oil is still to do.') }] },
        { kind: 'write', item: 'g:te_aru', ctx: { jp: 'ガラス は ＿＿ あります 。', en: 'The glass has been wiped.' },
          prompt: { en: 'Write ふく (to wipe) in the て form.' },
          template: { before: 'ガラス は ', after: ' あります 。' }, answer: 'ふいて', accept: ['ふいて', '{拭|ふ}いて'], mode: 'reading',
          explain: { jp: '{拭|ふ}いて あります', en: 'ふく → ふいて (く → いて).' } },
      ],
      I: [
        { kind: 'choose', item: 'c:xp_cellars_lamp', ctx: { jp: 'ガラス は {拭|ふ}いて あります 。 {油|あぶら} は {箱|はこ} の {中|なか} に {入|い}れて あります が 、 ランプ に は まだ {入|い}れて いません 。', en: '' },
          prompt: { en: 'Which is true?' },
          options: [{ en: 'The oil is in the box; the lamp is still empty.', ok: true }, { en: 'The oil is already in the lamp.', ok: false, why: no('ランプ に は まだ {入|い}れて いません: not in the lamp yet.') }, { en: 'The glass still needs wiping.', ok: false, why: no('{拭|ふ}いて あります: wiped.') }] },
        { kind: 'order', item: 'g:te_aru', prompt: { en: 'Put it in order: "The oil has been put in the box."' },
          tiles: ['{油|あぶら}', 'は', '{箱|はこ}', 'の', '{中|なか}', 'に', '{入|い}れて', 'あります'], answer: ['{油|あぶら}', 'は', '{箱|はこ}', 'の', '{中|なか}', 'に', '{入|い}れて', 'あります'] },
      ],
      A: [
        { kind: 'choose', item: 'c:xp_cellars_lamp', ctx: { jp: '{油|あぶら} は まだ {入|い}れて いません 。 {先|さき} に {入|い}れて おく と 、 {水|みず} が {入|はい}る から です 。', en: '' },
          prompt: { en: 'Why was the oil not put in?' },
          options: [{ en: 'If it were put in ahead of time, water would get into it.', ok: true }, { en: 'There was no oil left.', ok: false, why: no('Nothing says so: the reason is から です.') }, { en: 'Someone forgot.', ok: false, why: no('A reason is given: {水|みず} が {入|はい}る から.') }],
          explain: { en: '{入|い}れて おく: put in ahead of time (〜て おく, doing something in advance). The hands chose not to.' } },
        { kind: 'write', item: 'g:te_aru', ctx: { jp: '{油|あぶら} は {箱|はこ} の {中|なか} に ＿＿ あります 。', en: 'The oil has been put in the box.' },
          prompt: { en: 'Write いれる (to put in) in the て form.' },
          template: { before: '{油|あぶら} は {箱|はこ} の {中|なか} に ', after: ' あります 。' }, answer: 'いれて', accept: ['いれて', '{入|い}れて'], mode: 'reading' },
      ],
    } };

  // ---- the outflow door: the new construction with the old ones -----------------------------------------------------
  C.challenges['xp.c_final'] = { title: { jp: '{出口|でぐち} の {戸|と}', en: 'The outflow door' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '{鍵|かぎ} は {右|みぎ} の {柱|はしら} に かけて あります 。', en: '' },
          prompt: { en: 'Where is the key?' },
          options: [{ en: 'Hanging on the right-hand post.', ok: true }, { en: 'In the door.', ok: false, why: no('みぎ の はしら に: on the right-hand post.') }, { en: 'Someone took it away.', ok: false, why: no('かけて あります: it has been hung there, and is there now.') }] },
        { kind: 'choose', item: 'g:v_te_kudasai', ctx: { jp: '{出|で}る {時|とき} は 、 {戸|と} を {閉|し}めて ください 。', en: '' },
          prompt: { en: 'What does this part of the notice ask of you?' },
          options: [{ en: 'Close the door when you go out.', ok: true }, { en: 'It says the door has been closed.', ok: false, why: no('{閉|し}めて ください asks you to do it; {閉|し}めて あります would say it was done.') }],
          explain: { en: '〜て ください asks; 〜て あります reports what was done.' } },
      ],
      E: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '{戸|と} に は {鍵|かぎ} が かけて あります 。 {鍵|かぎ} は {右|みぎ} の {柱|はしら} に かけて あります 。', en: '' },
          prompt: { en: 'What do you do first?' },
          options: [{ jp: '{柱|はしら} の {鍵|かぎ} を {取|と}る', ok: true }, { jp: '{戸|と} を {押|お}す', ok: false, why: no('{鍵|かぎ} が かけて あります: it has been locked.') }, { jp: '{鍵|かぎ} を {探|さが}しに {帰|かえ}る', ok: false, why: no('The notice says where it is: on the right-hand post.') }] },
        { kind: 'order', item: 'g:te_aru', prompt: { en: 'Put it in order: "The key has been hung on the post."' },
          tiles: ['{鍵|かぎ}', 'は', '{柱|はしら}', 'に', 'かけて', 'あります'], answer: ['{鍵|かぎ}', 'は', '{柱|はしら}', 'に', 'かけて', 'あります'] },
      ],
      I: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '① {戸|と} に {鍵|かぎ} が かけて あります 。 ② {水|みず} が {流|なが}れて います 。 ③ {出|で}る {時|とき} は 、 {戸|と} を {閉|し}めて ください 。', en: '' },
          prompt: { en: 'Which line asks something of you, and which tells you what someone did?' },
          options: [{ en: '③ asks; ① tells what someone did.', ok: true }, { en: '② asks; ③ tells what someone did.', ok: false, why: no('② is just what is happening: the water is flowing (〜て いる).') }, { en: '① asks; ② tells what someone did.', ok: false, why: no('① is 〜て ある: something done. ② has no one in it.') }] },
        { kind: 'write', item: 'g:te_aru', ctx: { jp: '{鍵|かぎ} は {柱|はしら} に ＿＿ あります 。', en: 'The key has been hung on the post.' },
          prompt: { en: 'Write かける (to hang) in the て form.' },
          template: { before: '{鍵|かぎ} は {柱|はしら} に ', after: ' あります 。' }, answer: 'かけて', accept: ['かけて'], mode: 'reading' },
      ],
      A: [
        { kind: 'choose', item: 'g:te_aru', ctx: { jp: '{戸|と} は {閉|し}めて ある が 、 {鍵|かぎ} は かかって いない 。', en: '' },
          prompt: { en: 'What is the state of the door?' },
          options: [{ en: 'Someone closed it on purpose, but it is not locked.', ok: true }, { en: 'Someone locked it on purpose, but left it open.', ok: false, why: no('{閉|し}めて ある: closed (on purpose). {鍵|かぎ} は かかって いない: not locked.') }, { en: 'It closed by itself, and it is locked.', ok: false, why: no('{閉|し}めて ある means someone closed it; かかって いない is "not locked".') }],
          explain: { en: 'かける (someone locks it) / かかる (it is locked): the pair behind 〜て ある and 〜て いる.' } },
        { kind: 'order', item: 'g:te_aru', prompt: { en: 'Put it in order: "When you go out, please leave the door closed."' },
          tiles: ['{出|で}る', '{時|とき}', 'は', '{戸|と}', 'を', '{閉|し}めて', 'おいて', 'ください'], answer: ['{出|で}る', '{時|とき}', 'は', '{戸|と}', 'を', '{閉|し}めて', 'おいて', 'ください'],
          orderHint: { en: 'When ({出|で}る {時|とき} は), what ({戸|と} を), then {閉|し}めて おいて ください: close it, and leave it so.' } },
      ],
    } };

  // ---- the sluice: a procedure read from the hands' plate (P04's machine; E7, E11) ---------------------------------
  C.encounters = C.encounters || {};
  const step = (item, prompts, ok, wrong) => {
    const task = {};
    for (const t of ['F', 'E', 'I', 'A']) {
      const p = prompts[t];
      task[t] = { kind: 'choose', item, ctx: p.ctx, prompt: { en: p.en }, options: p.options || [{ jp: ok, ok: true }, { jp: wrong, ok: false, why: no(p.why) }], explain: p.explain };
    }
    return task;
  };
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const P1 = '{水門|すいもん} は もう {閉|し}めて あります 。 {栓|せん} を {抜|ぬ}いて ください 。';
  const P2 = '{車輪|しゃりん} に は {油|あぶら} が さして あります 。 {車輪|しゃりん} を {回|まわ}して ください 。';
  const P3 = '{水|みず} が {引|ひ}いたら 、 {栓|せん} を {戻|もど}して ください 。 {東|ひがし} に は {板|いた} が {渡|わた}して あります 。';
  C.encounters['xp.cellars_sluice'] = {
    id: 'xp.cellars_sluice', kind: 'procedure', name: { jp: '{排水|はいすい} の {水門|すいもん}', en: 'The drain sluice' },
    rules: { wait: true },
    procedure: {
      id: 'xp_cellars_sluice', version: 1, restart: 'stable',
      machine: { gate: 'shut', plug: 'in', water: 'high' },
      show: [
        { key: 'gate', label: { jp: '{水門|すいもん}', en: 'Sluice gate' }, values: { shut: { jp: '{閉|し}まって いる', en: 'shut' }, open: { jp: '{開|あ}いて いる', en: 'open' } } },
        { key: 'plug', label: { jp: '{栓|せん}', en: 'Drain plug' }, values: { in: { jp: '{入|はい}って いる', en: 'in' }, out: { jp: '{抜|ぬ}けて いる', en: 'out' } } },
        { key: 'water', label: { jp: '{水|みず}', en: 'Water' }, values: { high: { jp: '{高|たか}い', en: 'high' }, low: { jp: '{低|ひく}い', en: 'low' } } },
      ],
      done: { en: 'The water runs out through the drain, the plug is back, and the east plank stands clear of the water.' },
      steps: [
        { id: 'p1', text: { jp: P1, en: 'The sluice gate has already been shut. Pull the plug.' },
          task: step('g:te_aru', {
            F: { ctx: { jp: '{水門|すいもん} は もう {閉|し}めて あります 。', en: '' }, en: 'The plate says the sluice gate {閉|し}めて あります. What does that mean?',
              options: [{ en: 'The gate has already been shut: leave it.', ok: true }, { en: 'Please shut the gate.', ok: false, why: no('That would be {閉|し}めて ください. {閉|し}めて あります: done already.') }] },
            E: { ctx: { jp: P1, en: '' }, en: 'What do you do now?', why: 'The gate has been shut already ({閉|し}めて あります). The plate asks you to pull the plug.' },
            I: { ctx: { jp: P1, en: '' }, en: 'Which has been done, and which is left to you?', options: [{ en: 'The gate is done; the plug is left to me.', ok: true }, { en: 'The plug is done; the gate is left to me.', ok: false, why: no('{閉|し}めて あります is the gate, done. {抜|ぬ}いて ください is the plug, asked of you.') }] },
            A: { ctx: { jp: P1, en: '' }, en: 'Why must you not touch the gate?', options: [{ en: 'Someone shut it on purpose, and it is meant to stay shut.', ok: true }, { en: 'It is broken and cannot move.', ok: false, why: no('Nothing says broken: {閉|し}めて ある is a choice someone made.') }, { en: 'It is not shut yet.', ok: false, why: no('もう {閉|し}めて あります: already.') }] },
          }, '{栓|せん} を {抜|ぬ}く', '{水門|すいもん} を {閉|し}める'),
          actions: [
            A('pull', '{栓|せん} を {抜|ぬ}く', 'Pull the plug', { ok: true, set: { plug: 'out' }, means: { en: 'You will pull the drain plug; the gate stays as it was left.' }, result: { en: 'The plug comes out with a gulp; the water begins to turn.' } }),
            A('gate', '{水門|すいもん} を {閉|し}める', 'Shut the gate', { means: { en: 'You will shut the sluice gate.' }, wrong: { en: 'You heave at a gate that was shut already; its wheel slips the catch and the gate lifts. You wind it down again: back to the start.' } }),
          ] },
        { id: 'p2', stable: true, text: { jp: P2, en: 'The wheel has been oiled. Turn the wheel.' },
          task: step('g:te_aru', {
            F: { ctx: { jp: '{車輪|しゃりん} に は {油|あぶら} が さして あります 。', en: '' }, en: 'Does the wheel need oil?',
              options: [{ en: 'No: it has been oiled already.', ok: true }, { en: 'Yes: please oil it.', ok: false, why: no('さして あります: someone has oiled it.') }] },
            E: { ctx: { jp: P2, en: '' }, en: 'What do you do now?', why: 'さして あります: the wheel has been oiled. The plate asks you to turn it.' },
            I: { ctx: { jp: P2, en: '' }, en: 'What does the plate tell you, and what does it ask?', options: [{ en: 'It tells me the wheel is oiled; it asks me to turn it.', ok: true }, { en: 'It asks me to oil the wheel and then turn it.', ok: false, why: no('さして あります reports; only {回|まわ}して ください asks.') }] },
            A: { ctx: { jp: P2, en: '' }, en: 'Which word shows that the oiling was done by someone, not just a fact about the wheel?', options: [{ en: 'さして あります', ok: true }, { en: '{回|まわ}して ください', ok: false, why: no('That is the request.') }, { en: 'に は', ok: false, why: no('That marks where, as a contrast; it says nothing of anyone acting.') }] },
          }, '{車輪|しゃりん} を {回|まわ}す', '{油|あぶら} を さす'),
          actions: [
            A('turn', '{車輪|しゃりん} を {回|まわ}す', 'Turn the wheel', { ok: true, set: { water: 'low' }, means: { en: 'You will turn the wheel.' }, result: { en: 'The wheel turns easily (it has been oiled); the water drops down the drain.' } }),
            A('oil', '{油|あぶら} を さす', 'Oil the wheel', { means: { en: 'You will go and oil the wheel first.' }, wrong: { en: 'While you look for oil it does not need, silt settles in the open drain. You clear it: back to the pulled plug.' } }),
          ] },
        { id: 'p3', text: { jp: P3, en: 'When the water has gone down, put the plug back. A plank has been laid across on the east side.' },
          task: step('g:te_aru', {
            F: { ctx: { jp: '{東|ひがし} に は {板|いた} が {渡|わた}して あります 。', en: '' }, en: 'What is on the east side?',
              options: [{ en: 'A plank has been laid across: a way over.', ok: true }, { en: 'Please lay a plank across.', ok: false, why: no('{渡|わた}して あります: it has been laid already.') }] },
            E: { ctx: { jp: P3, en: '' }, en: 'The water is low now. What do you do?', why: 'A plank has already been laid across ({渡|わた}して あります). The plate asks you to put the plug back.' },
            I: { ctx: { jp: P3, en: '' }, en: 'What is left to you, now that the water is low?', options: [{ en: 'Putting the plug back.', ok: true }, { en: 'Laying the plank on the east side.', ok: false, why: no('{渡|わた}して あります: it is there already.') }] },
            A: { ctx: { jp: P3, en: '' }, en: 'When should the plug go back, and how will you cross to the east?', options: [{ en: 'Once the water is down; over the plank someone laid.', ok: true }, { en: 'Straight away; over a plank you must lay.', ok: false, why: no('{引|ひ}いたら: after it has gone down. {渡|わた}して あります: laid already.') }] },
          }, '{栓|せん} を {戻|もど}す', '{板|いた} を {渡|わた}す'),
          actions: [
            A('back', '{栓|せん} を {戻|もど}す', 'Put the plug back', { ok: true, set: { plug: 'in' }, means: { en: 'You will put the plug back now that the water is low.' }, result: { en: 'The plug goes home. The cellar is quiet, and the east plank is out of the water.' } }),
            A('plank', '{板|いた} を {渡|わた}す', 'Lay a plank', { means: { en: 'You will go and lay a plank across.' }, wrong: { en: 'There is a plank there already; while you look at it, the open drain draws silt again. Back to turning the wheel.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The cellar drains.' } }],
  };

  // ---- B2's two encounters (F-29): with a flour moth on Standard and Demanding (one more creature, never two),
  // alone on Relaxed. The blot at the outflow door is the one whose visit is the end of the cellars.
  // a moth that has strayed from the rice store: smaller than the mill's (one knot fewer), so the pair stays a step up
  // from the blot alone, never a spike
  const MOTH = { enemy: 'rw.dustmoth', knots: 1 };
  C.encounters['xp.cellars_pair'] = {
    id: 'xp.cellars_pair', name: { jp: '{墨|すみ} と {粉|こな}', en: 'Ink and flour' },
    lead: { enemy: 'rw.inkblot' }, group: { normal: [MOTH], hard: [MOTH] },
    rules: { wait: true },
  };
  C.encounters['xp.cellars_blot'] = {
    id: 'xp.cellars_blot', name: { jp: '{貼|は}り{紙|がみ} の {染|し}み', en: 'The blot on the notices' },
    lead: { enemy: 'rw.inkblot' }, group: { normal: [MOTH], hard: [MOTH] },
    rules: { wait: true },
  };

  RB.lex.add(RB.lex.parseTable(`
地下|ちか|n|E|underground, basement
倉庫|そうこ|n|I|warehouse, storehouse
貼り紙|はりがみ|n|I|notice (posted up)
階段|かいだん|n|E|stairs
棚|たな|n|E|shelf
上げる|あげる|v1|E|to raise, put up
樽|たる|n|A|barrel, cask
味噌|みそ|n|E|miso
はしご||n|E|ladder
拭く|ふく|v5k|E|to wipe
栓|せん|n|I|plug, stopper
抜く|ぬく|v5k|E|to pull out
戻す|もどす|v5s|E|to put back
板|いた|n|E|board, plank
渡す|わたす|v5s|E|to hand over; to lay across
さす||v5s|I|to apply (oil), to drip in
排水|はいすい|n|A|drainage
水門|すいもん|n|I|sluice gate
引く|ひく|v5k|E|to pull; (water) to recede
柱|はしら|n|E|pillar, post
鍵|かぎ|n|E|key, lock
かかる||v5r|E|to hang; (a lock) to be on
かける||v1|E|to hang; to lock
染み|しみ|n|I|stain, blot
墨|すみ|n|I|ink (sumi)
汚す|よごす|v5s|E|to dirty, smear
格子|こうし|n|I|grate, lattice
留める|とめる|v1|I|to fasten
奥|おく|n|E|the far end, the back
出口|でぐち|n|F|exit
粉|こな|n|E|flour, powder
地下一階|ちかいっかい|n|I|first basement floor
地下二階|ちかにかい|n|I|second basement floor
傷む|いたむ|v5m|I|to spoil, go bad
律儀|りちぎ|adj-na|A|conscientious, dutiful
通路|つうろ|n|I|passage, corridor
無し|なし|n|E|none, nothing (owed)
銅|どう|n|I|copper
勘定|かんじょう|n|I|accounts, the reckoning
開通|かいつう|n|A|opening (of a road or way)
揺れる|ゆれる|v1|E|to sway, shake
沈む|しずむ|v5m|E|to sink
  `), 'expeditions');
})(RB.content);
