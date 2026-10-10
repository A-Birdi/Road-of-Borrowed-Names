/* Manybridge, Chapter 4: the Understage's language, machines and creatures (expansion P09; plan R1 B, A5, A16, E7,
 * E10).
 *  - three pages of the prompt-book: stage directions that leave things out (左の: the left one; もう半分: turn
 *    another half, the same way) and point back (それ, その分, 二つ目): read at the pages, quoted by the machines;
 *  - three procedures: mp.lifts (two trap lifts and their weight), mp.revolve (the revolving stage, in the page's
 *    order), mp.weights (counterweights raise the platform across the well);
 *  - the Lord of the Understage (mp.boss): the machinery itself, holding the names it has drawn down. Procedure and
 *    performance: the last page's cues worked in order while answering its moves; the companion's actions are stage
 *    cues (E10); it ends with the roll call, every name called back to the stage;
 *  - four creatures: Prompter's Ghost (there only once acknowledged in words), Misprint Moth, Loose Type Imp, Block
 *    Golem. Interim art under F-36's rule (an existing family with its own palette; AC-1).
 * Every step has F, E, I and A. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const no = (en) => ({ en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  function step(item, tiers, okJp, wrongJp, wrongWhy) {
    const out = {};
    for (const k of ['F', 'E', 'I', 'A']) {
      const t = tiers[k];
      out[k] = ch({ item, ctx: t.ctx, prompt: { en: t.en }, options: t.options || [{ jp: okJp, ok: true }, { jp: wrongJp, ok: false, why: no(t.why || wrongWhy) }] });
    }
    return out;
  }
  const A = (id, jp, en, o) => Object.assign({ id, label: { jp, en } }, o);
  const vals = (o) => { const out = {}; for (const k in o) out[k] = { jp: o[k][0], en: o[k][1] }; return out; };

  // ---- the prompt-book's pages -------------------------------------------------------------------------------------
  const BOOK1 = '{右|みぎ} の せり を {下|お}ろして 、 {左|ひだり} の を {上|あ}げる 。 それ が {止|と}まったら 、 {錘|おもり} を {外|はず}す 。';
  const BOOK1K = 'みぎ の せり を おろして 、 ひだり の を あげる 。 それ が とまったら 、 おもり を はずす 。';
  const BOOK2 = '{回|まわ}り{舞台|ぶたい} を {東|ひがし} へ {半分|はんぶん} {回|まわ}す 。 {道具|どうぐ} が {乗|の}ったら 、 もう {半分|はんぶん} 。 {戻|もど}す の は 、 {幕|まく} が {下|お}りて から 。';
  const BOOK2K = 'まわりぶたい を ひがし へ はんぶん まわす 。 どうぐ が のったら 、 もう はんぶん 。 もどす の は 、 まく が おりて から 。';
  const BOOK3 = '{錘|おもり} を {一|ひと}つ {下|お}ろせば 、 その {分|ぶん} だけ {台|だい} が {上|あ}がる 。 {二|ふた}つ{目|め} は 、 {一|ひと}つ{目|め} の {半分|はんぶん} で いい 。 {三|みっ}つ{目|め} は いらない 。';
  const BOOK3K = 'おもり を ひとつ おろせば 、 その ぶん だけ だい が あがる 。 ふたつめ は 、 ひとつめ の はんぶん で いい 。 みっつめ は いらない 。';
  C.challenges['mp.book1'] = { title: T('The prompt-book: the trap lifts', '{台本|だいほん} ・ せり'),
    tiers: {
      F: [ch({ item: 'g:kosoado', ctx: { jp: BOOK1K, en: 'Lower the right lift and raise the left one. When it stops, take off the weight.' }, prompt: { en: 'それ が とまったら: which lift is それ?' },
        options: [{ en: 'The left one, the last one named.', ok: true }, { en: 'The right one.', ok: false, why: no('それ points back to what was just said: ひだり の (the left one).') }] })],
      E: [ch({ item: 'g:kosoado', ctx: { jp: BOOK1, en: '' }, prompt: { en: 'What does それ point back to?' },
        options: [{ jp: '{左|ひだり} の せり', ok: true }, { jp: '{右|みぎ} の せり', ok: false, why: no('それ is the one just raised: {左|ひだり} の.') }, { jp: '{錘|おもり}', ok: false, why: no('The weight is what you take off after; それ stops first.') }] })],
      I: [ch({ item: 'g:prt_no', ctx: { jp: BOOK1, en: '' }, prompt: { en: '左の を 上げる: what has been left out after 左の?' },
        options: [{ jp: 'せり', ok: true }, { jp: '{錘|おもり}', ok: false, why: no('の stands for the thing already named: the lift (せり).') }, { jp: '{右|みぎ}', ok: false, why: no('{左|ひだり} の is "the left one": the left lift.') }] })],
      A: [ch({ item: 'g:kosoado', ctx: { jp: BOOK1, en: '' }, prompt: { en: 'Write the page out in full, nothing left to the reader.' },
        options: [{ jp: '{右|みぎ} の せり を {下|お}ろして 、 {左|ひだり} の せり を {上|あ}げる 。 {左|ひだり} の せり が {止|と}まったら 、 {錘|おもり} を {外|はず}す 。', ok: true },
          { jp: '{右|みぎ} の せり を {下|お}ろして 、 {左|ひだり} の せり を {上|あ}げる 。 {右|みぎ} の せり が {止|と}まったら 、 {錘|おもり} を {外|はず}す 。', ok: false, why: no('それ is the left lift, the one being raised.') },
          { jp: '{右|みぎ} の せり を {下|お}ろして 、 {左|ひだり} の {錘|おもり} を {上|あ}げる 。 {錘|おもり} が {止|と}まったら 、 {外|はず}す 。', ok: false, why: no('{左|ひだり} の is the left lift, not a weight.') }] })],
    } };
  C.challenges['mp.book2'] = { title: T('The prompt-book: the revolve', '{台本|だいほん} ・ {回|まわ}り{舞台|ぶたい}'),
    tiers: {
      F: [ch({ item: 'g:cond_tara', ctx: { jp: BOOK2K, en: 'Turn the revolve half way east. Once the set is on, another half. Turn it back only after the curtain is down.' }, prompt: { en: 'もう はんぶん: another half which way?' },
        options: [{ en: 'East again, the same way.', ok: true }, { en: 'Back west.', ok: false, why: no('もう はんぶん: another half of the same turn. Turning back comes only after the curtain.') }] })],
      E: [ch({ item: 'g:cond_tara', ctx: { jp: BOOK2, en: '' }, prompt: { en: 'When do you turn the second half?' },
        options: [{ en: 'Once the set is on the revolve.', ok: true }, { en: 'Straight after the first half.', ok: false, why: no('{道具|どうぐ} が {乗|の}ったら: once the set is loaded.') }, { en: 'After the curtain is down.', ok: false, why: no('That is when it may be turned back.') }] })],
      I: [ch({ item: 'g:v_te_kara', ctx: { jp: BOOK2, en: '' }, prompt: { en: 'もう半分: what has been left out?' },
        options: [{ jp: '{東|ひがし} へ {回|まわ}す', ok: true }, { jp: '{西|にし} へ {戻|もど}す', ok: false, why: no('Turning back is the last sentence, and only after the curtain.') }, { jp: '{道具|どうぐ} を {乗|の}せる', ok: false, why: no('That is the condition (〜たら), not what is done.') }] })],
      A: [ch({ item: 'g:v_te_kara', ctx: { jp: BOOK2, en: '' }, prompt: { en: 'There is no curtain down here. What does the last sentence tell you to do?' },
        options: [{ en: 'Leave the revolve where it is: turning it back is for later.', ok: true }, { en: 'Turn it back at once.', ok: false, why: no('{戻|もど}す の は … {下|お}りて から: not before the curtain.') }, { en: 'Lower a curtain first.', ok: false, why: no('The page sets when to turn it back; it asks for no curtain.') }] })],
    } };
  C.challenges['mp.book3'] = { title: T('The prompt-book: the weights', '{台本|だいほん} ・ {錘|おもり}'),
    tiers: {
      F: [ch({ item: 'g:cond_ba', ctx: { jp: BOOK3K, en: 'Lower one weight, and the platform rises by that much. The second need only be half the first. The third is not needed.' }, prompt: { en: 'How heavy is the second weight?' },
        options: [{ en: 'Half as heavy as the first.', ok: true }, { en: 'As heavy as the first.', ok: false, why: no('ひとつめ の はんぶん: half the first one.') }] })],
      E: [ch({ item: 'g:cond_ba', ctx: { jp: BOOK3, en: '' }, prompt: { en: 'How many weights do you lower in all?' },
        options: [{ en: 'Two: the first, then one half its size.', ok: true }, { en: 'Three.', ok: false, why: no('{三|みっ}つ{目|め} は いらない: no third.') }, { en: 'One.', ok: false, why: no('{二|ふた}つ{目|め} は …: there is a second.') }] })],
      I: [ch({ item: 'g:kosoado', ctx: { jp: BOOK3, en: '' }, prompt: { en: 'その分だけ: by how much does the platform rise?' },
        options: [{ en: 'By as much as the weight lowered.', ok: true }, { en: 'By half a weight.', ok: false, why: no('その {分|ぶん}: the amount just named, the weight you lowered.') }, { en: 'All the way at once.', ok: false, why: no('だけ: by that much and no more.') }] })],
      A: [ch({ item: 'g:kosoado', ctx: { jp: BOOK3, en: '' }, prompt: { en: 'Which reads the page with nothing left out?' },
        options: [{ jp: '{錘|おもり} を {一|ひと}つ {下|お}ろせば 、 {錘|おもり} の {重|おも}さ の {分|ぶん} だけ {台|だい} が {上|あ}がる 。 {二|ふた}つ{目|め} の {錘|おもり} は 、 {一|ひと}つ{目|め} の {錘|おもり} の {半分|はんぶん} の {重|おも}さ で いい 。', ok: true },
          { jp: '{錘|おもり} を {一|ひと}つ {下|お}ろせば 、 {台|だい} が {半分|はんぶん} {上|あ}がる 。 {二|ふた}つ{目|め} の {錘|おもり} は 、 {一|ひと}つ{目|め} と {同|おな}じ {重|おも}さ で いい 。', ok: false, why: no('その {分|ぶん} is the weight\'s own amount, and the second is half the first.') }] })],
    } };

  // ---- the trap lifts ----------------------------------------------------------------------------------------------
  C.encounters['mp.lifts'] = {
    id: 'mp.lifts', kind: 'procedure', name: T('The trap lifts', 'せり'),
    rules: { wait: true },
    procedure: {
      id: 'mp_lifts', version: 1, restart: 'start',
      machine: { right: 'up', left: 'down', weight: 'on' },
      show: [
        { key: 'right', label: T('Right lift', '{右|みぎ} の せり'), values: vals({ up: ['{上|うえ}', 'up'], down: ['{下|した}', 'down'] }) },
        { key: 'left', label: T('Left lift', '{左|ひだり} の せり'), values: vals({ up: ['{上|うえ}', 'up'], down: ['{下|した}', 'down'], moving: ['{動|うご}いて いる', 'moving'] }) },
        { key: 'weight', label: T('The weight', '{錘|おもり}'), values: vals({ on: ['{掛|か}かって いる', 'hooked on'], off: ['{外|はず}れて いる', 'off'] }) },
      ],
      done: T('The left lift rises with its stack of flats and stays; the doorway east is clear.', '{戸口|とぐち} が {空|あ}いた 。'),
      steps: [
        { id: 'l1', text: { jp: '{右|みぎ} の せり を {下|お}ろす 。', en: 'Lower the right lift.' },
          task: step('g:v_te', {
            F: { ctx: { jp: BOOK1K, en: '' }, en: 'What is first?', options: [{ en: 'Lower the right lift.', ok: true }, { en: 'Raise the left lift.', ok: false, why: no('みぎ の せり を おろして: the right one first.') }] },
            E: { ctx: { jp: BOOK1, en: '' }, en: 'What is first?', options: [{ jp: '{右|みぎ} の せり を {下|お}ろす', ok: true }, { jp: '{左|ひだり} の せり を {上|あ}げる', ok: false, why: no('〜て joins them in order: the right one comes first.') }] },
            I: { ctx: { jp: BOOK1, en: '' }, en: 'Which lift moves first, and which way?', options: [{ en: 'The right lift, down.', ok: true }, { en: 'The left lift, up.', ok: false, why: no('{下|お}ろして, then {上|あ}げる: in that order.') }, { en: 'The right lift, up.', ok: false, why: no('{下|お}ろす is to lower.') }] },
            A: { ctx: { jp: BOOK1, en: '' }, en: 'Why would lowering the right lift come first?', options: [{ en: 'Its weight is what will lift the left one.', ok: true }, { en: 'It is nearer the door.', ok: false, why: no('Nothing on the page is about nearness: the order is the machine\'s.') }] },
          }),
          actions: [
            A('lower_r', '{右|みぎ} の せり を {下|お}ろす', 'Lower the right lift', { ok: true, set: { right: 'down' }, means: { en: 'You will lower the right lift.' }, result: { en: 'The right lift sinks with a creak; ropes tighten overhead.' } }),
            A('raise_l', '{左|ひだり} の せり を {上|あ}げる', 'Raise the left lift', { means: { en: 'You will heave the left lift up first.' }, wrong: { en: 'The left lift won\'t move: nothing yet pulls it from the other side.' } }),
          ] },
        { id: 'l2', text: { jp: '{左|ひだり} の を {上|あ}げる 。', en: 'Raise the left one.' },
          task: step('g:prt_no', {
            F: { ctx: { jp: 'ひだり の を あげる 。', en: '' }, en: 'ひだり の を: the left what?', options: [{ en: 'The left lift.', ok: true }, { en: 'The left weight.', ok: false, why: no('の stands for the thing just named: せり.') }] },
            E: { ctx: { jp: '{左|ひだり} の を {上|あ}げる 。', en: '' }, en: 'The left what?', options: [{ jp: '{左|ひだり} の せり', ok: true }, { jp: '{左|ひだり} の {錘|おもり}', ok: false, why: no('の here is "the one": the lift.') }] },
            I: { ctx: { jp: BOOK1, en: '' }, en: 'What now?', options: [{ jp: '{左|ひだり} の せり を {上|あ}げる', ok: true }, { jp: '{左|ひだり} の せり を {下|お}ろす', ok: false, why: no('{上|あ}げる: raise.') }, { jp: '{錘|おもり} を {外|はず}す', ok: false, why: no('The weight comes off only once the lift has stopped.') }] },
            A: { ctx: { jp: BOOK1, en: '' }, en: 'What now?', options: [{ jp: '{左|ひだり} の せり を {上|あ}げる', ok: true }, { jp: '{錘|おもり} を {外|はず}す', ok: false, why: no('Not yet: それ が {止|と}まったら.') }] },
          }),
          actions: [
            A('raise_l', '{左|ひだり} の せり を {上|あ}げる', 'Raise the left lift', { ok: true, set: { left: 'moving' }, means: { en: 'You will raise the left lift.' }, result: { en: 'The left lift rises, the stacked flats riding up on it out of the doorway.' } }),
            A('unhook', '{錘|おもり} を {外|はず}す', 'Take off the weight', { means: { en: 'You will take off the weight now.' }, wrong: { en: 'Without its weight the right lift jerks back up. Start again.' } }),
          ] },
        { id: 'l3', text: { jp: 'それ が {止|と}まったら 、 {錘|おもり} を {外|はず}す 。', en: 'When it stops, take off the weight.' },
          task: step('g:kosoado', {
            F: { ctx: { jp: 'それ が とまったら 、 おもり を はずす 。', en: '' }, en: 'The left lift is still rising. When do you take off the weight?', options: [{ en: 'Once the left lift has stopped.', ok: true }, { en: 'Now, while it rises.', ok: false, why: no('それ (the left lift) が とまったら: once it has stopped.') }] },
            E: { ctx: { jp: 'それ が {止|と}まったら 、 {錘|おもり} を {外|はず}す 。', en: '' }, en: 'Wait for what?', options: [{ jp: '{左|ひだり} の せり が {止|と}まる の を', ok: true }, { jp: '{右|みぎ} の せり が {止|と}まる の を', ok: false, why: no('The right lift is already down. それ is the left.') }] },
            I: { ctx: { jp: BOOK1, en: '' }, en: 'The left lift is still moving. What do you do?', options: [{ jp: '{止|と}まる まで {待|ま}って から {外|はず}す', ok: true }, { jp: 'すぐ {外|はず}す', ok: false, why: no('〜たら: after it has stopped.') }] },
            A: { ctx: { jp: BOOK1, en: '' }, en: 'The left lift is still moving. What do you do?', options: [{ jp: '{止|と}まる まで {待|ま}って から {外|はず}す', ok: true }, { jp: '{外|はず}して から {止|と}める', ok: false, why: no('The order is the other way: stopped, then unhooked.') }] },
          }),
          actions: [
            A('wait', '{止|と}まる まで {待|ま}って 、 {錘|おもり} を {外|はず}す', 'Wait for it to stop, then unhook', { ok: true, set: { left: 'up', weight: 'off' }, means: { en: 'You will wait for the left lift to stop, then take the weight off.' }, result: { en: 'The lift settles with a thud. You unhook the weight; everything holds.' } }),
            A('now', 'すぐ {錘|おもり} を {外|はず}す', 'Unhook it now', { means: { en: 'You will unhook the weight while the lift is still rising.' }, wrong: { en: 'The left lift drops back with a crash, flats and all. Start again.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The doorway east is clear.' }, flags: { mp_u1_lift: true } }],
  };

  // ---- the revolve -----------------------------------------------------------------------------------------------
  C.encounters['mp.revolve'] = {
    id: 'mp.revolve', kind: 'procedure', name: T('The revolving stage', '{回|まわ}り{舞台|ぶたい}'),
    rules: { wait: true },
    procedure: {
      id: 'mp_revolve', version: 1, restart: 'stable',
      machine: { turn: 'none', set: 'off' },
      show: [
        { key: 'turn', label: T('The revolve', '{回|まわ}り{舞台|ぶたい}'), values: vals({ none: ['{元|もと} の まま', 'as it was'], half: ['{東|ひがし} へ {半分|はんぶん}', 'half east'], full: ['{東|ひがし} へ {一回|いっかい}', 'a whole turn east'] }) },
        { key: 'set', label: T('The set', '{道具|どうぐ}'), values: vals({ off: ['{乗|の}って いない', 'not loaded'], on: ['{乗|の}って いる', 'loaded'] }) },
      ],
      done: T('The revolve comes round with its flats; the way through beneath its edge stands open.', '{道|みち} が {開|ひら}いた 。'),
      steps: [
        { id: 'r1', stable: true, text: { jp: '{東|ひがし} へ {半分|はんぶん} {回|まわ}す 。', en: 'Turn it half way east.' },
          task: step('g:prt_he', {
            F: { ctx: { jp: BOOK2K, en: '' }, en: 'Which way, how far?', options: [{ en: 'East, half way.', ok: true }, { en: 'West, half way.', ok: false, why: no('ひがし へ: east.') }] },
            E: { ctx: { jp: BOOK2, en: '' }, en: 'Which way, how far?', options: [{ jp: '{東|ひがし} へ {半分|はんぶん}', ok: true }, { jp: '{西|にし} へ {半分|はんぶん}', ok: false, why: no('{東|ひがし} へ: east.') }, { jp: '{東|ひがし} へ {一回|いっかい}', ok: false, why: no('{半分|はんぶん}: half.') }] },
            I: { ctx: { jp: BOOK2, en: '' }, en: 'What is the first turn?', options: [{ jp: '{東|ひがし} へ {半分|はんぶん}', ok: true }, { jp: '{東|ひがし} へ {一回|いっかい}', ok: false, why: no('The whole turn comes in two halves, with the set loaded between.') }] },
            A: { ctx: { jp: BOOK2, en: '' }, en: 'What is the first turn?', options: [{ jp: '{東|ひがし} へ {半分|はんぶん}', ok: true }, { jp: '{東|ひがし} へ {一回|いっかい}', ok: false, why: no('The page splits the turn: half, load, half.') }] },
          }),
          actions: [
            A('east', '{東|ひがし} へ {半分|はんぶん} {回|まわ}す', 'Turn it half way east', { ok: true, set: { turn: 'half' }, means: { en: 'You will turn the capstan half way east.' }, result: { en: 'The great ring rumbles round half a turn; the empty side comes to the loading bay.' } }),
            A('west', '{西|にし} へ {回|まわ}す', 'Turn it west', { means: { en: 'You will turn the capstan west.' }, wrong: { en: 'The ring jams against its stop with a bang.' } }),
          ] },
        { id: 'r2', stable: true, text: { jp: '{道具|どうぐ} が {乗|の}ったら 、 もう {半分|はんぶん} 。', en: 'Once the set is on, another half.' },
          task: step('g:cond_tara', {
            F: { ctx: { jp: 'どうぐ が のったら 、 もう はんぶん 。', en: '' }, en: 'The flats are not on yet. What now?', options: [{ en: 'Load the set first, then turn another half.', ok: true }, { en: 'Turn another half now.', ok: false, why: no('のったら: once the set is on.') }] },
            E: { ctx: { jp: '{道具|どうぐ} が {乗|の}ったら 、 もう {半分|はんぶん} 。', en: '' }, en: 'The flats are not on yet. What now?', options: [{ jp: '{道具|どうぐ} を {乗|の}せて から {回|まわ}す', ok: true }, { jp: 'すぐ {回|まわ}す', ok: false, why: no('〜たら: after the set is on.') }] },
            I: { ctx: { jp: BOOK2, en: '' }, en: 'Load the set, then: もう半分. What do you do?', options: [{ jp: '{東|ひがし} へ もう {半分|はんぶん} {回|まわ}す', ok: true }, { jp: '{西|にし} へ {半分|はんぶん} {戻|もど}す', ok: false, why: no('もう: another, of the same.') }] },
            A: { ctx: { jp: BOOK2, en: '' }, en: 'Load the set, then: もう半分. What do you do?', options: [{ jp: '{東|ひがし} へ もう {半分|はんぶん} {回|まわ}す', ok: true }, { jp: '{西|にし} へ {半分|はんぶん} {戻|もど}す', ok: false, why: no('Turning back is for after the curtain.') }] },
          }),
          actions: [
            A('load_turn', '{道具|どうぐ} を {乗|の}せて 、 もう {半分|はんぶん}', 'Load the set, then another half east', { ok: true, set: { set: 'on', turn: 'full' }, means: { en: 'You will load the flats onto the revolve, then turn it another half east.' }, result: { en: 'The flats go on; the ring turns again and carries them round, out of the way through.' } }),
            A('turn_now', 'すぐ もう {半分|はんぶん}', 'Turn another half straight away', { means: { en: 'You will turn the second half without loading the set.' }, wrong: { en: 'The empty side comes round, and the flats are still stacked in the way. Turn it back to the loading bay and load them.' } }),
          ] },
        { id: 'r3', text: { jp: '{戻|もど}す の は 、 {幕|まく} が {下|お}りて から 。', en: 'Turn it back only after the curtain is down.' },
          task: step('g:v_te_kara', {
            F: { ctx: { jp: 'もどす の は 、 まく が おりて から 。', en: '' }, en: 'The way is open. Do you turn the revolve back?', options: [{ en: 'No: not until the curtain is down.', ok: true }, { en: 'Yes, now.', ok: false, why: no('おりて から: only after the curtain comes down.') }] },
            E: { ctx: { jp: '{戻|もど}す の は 、 {幕|まく} が {下|お}りて から 。', en: '' }, en: 'Do you turn it back now?', options: [{ jp: 'まだ {戻|もど}さない', ok: true }, { jp: '{今|いま} {戻|もど}す', ok: false, why: no('〜て から: only after.') }] },
            I: { ctx: { jp: BOOK2, en: '' }, en: 'The way is open. What now?', options: [{ jp: 'その まま に して おく', ok: true }, { jp: '{西|にし} へ {戻|もど}す', ok: false, why: no('The curtain is not down yet.') }] },
            A: { ctx: { jp: BOOK2, en: '' }, en: 'The way is open. What now?', options: [{ jp: 'その まま に して おく', ok: true }, { jp: '{西|にし} へ {戻|もど}す', ok: false, why: no('The page keeps it turned until the curtain.') }] },
          }),
          actions: [
            A('leave', 'その まま に する', 'Leave it as it is', { ok: true, set: { set: 'on' }, means: { en: 'You will leave the revolve as it stands.' }, result: { en: 'You step back from the capstan. The way through stays open.' } }),
            A('back', '{西|にし} へ {戻|もど}す', 'Turn it back west', { means: { en: 'You will turn the revolve back now.' }, wrong: { en: 'The flats swing back round into the way. Turn it again, half and half.' }, restart: 'stable' }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The way through stands open.' }, flags: { mp_u2_turned: true } }],
  };

  // ---- the weights ------------------------------------------------------------------------------------------------
  C.encounters['mp.weights'] = {
    id: 'mp.weights', kind: 'procedure', name: T('The counterweights', '{錘|おもり}'),
    rules: { wait: true },
    procedure: {
      id: 'mp_weights', version: 1, restart: 'start',
      machine: { first: 'up', second: 'up', third: 'up', platform: 'low' },
      show: [
        { key: 'first', label: T('First weight', '{一|ひと}つ{目|め}'), values: vals({ up: ['{上|うえ}', 'up'], down: ['{下|した}', 'down'] }) },
        { key: 'second', label: T('Second weight (half)', '{二|ふた}つ{目|め} （ {半分|はんぶん} ）'), values: vals({ up: ['{上|うえ}', 'up'], down: ['{下|した}', 'down'] }) },
        { key: 'third', label: T('Third weight', '{三|みっ}つ{目|め}'), values: vals({ up: ['{上|うえ}', 'up'], down: ['{下|した}', 'down'] }) },
        { key: 'platform', label: T('The platform', '{台|だい}'), values: vals({ low: ['{下|した}', 'down the well'], mid: ['{半|なか}ば', 'part way'], level: ['{床|ゆか} と {同|おな}じ', 'level with the floor'] }) },
      ],
      done: T('The platform rises level with the floor, a bridge across the well.', '{台|だい} が {上|あ}がった 。'),
      steps: [
        { id: 'w1', text: { jp: '{錘|おもり} を {一|ひと}つ {下|お}ろせば 、 その {分|ぶん} だけ {台|だい} が {上|あ}がる 。', en: 'Lower one weight, and the platform rises by that much.' },
          task: step('g:cond_ba', {
            F: { ctx: { jp: 'おもり を ひとつ おろせば 、 その ぶん だけ だい が あがる 。', en: '' }, en: 'What happens if you lower one weight?', options: [{ en: 'The platform rises that much.', ok: true }, { en: 'The platform sinks.', ok: false, why: no('あがる: it rises.') }] },
            E: { ctx: { jp: BOOK3, en: '' }, en: 'What first?', options: [{ jp: '{一|ひと}つ{目|め} を {下|お}ろす', ok: true }, { jp: '{三|みっ}つ {全部|ぜんぶ} {下|お}ろす', ok: false, why: no('{三|みっ}つ{目|め} は いらない: never the third.') }] },
            I: { ctx: { jp: BOOK3, en: '' }, en: 'What first?', options: [{ jp: '{一|ひと}つ{目|め} を {下|お}ろす', ok: true }, { jp: '{二|ふた}つ{目|め} を {下|お}ろす', ok: false, why: no('The second is measured against the first: the first comes first.') }] },
            A: { ctx: { jp: BOOK3, en: '' }, en: 'What first?', options: [{ jp: '{一|ひと}つ{目|め} を {下|お}ろす', ok: true }, { jp: '{二|ふた}つ{目|め} を {下|お}ろす', ok: false, why: no('{一|ひと}つ{目|め} の {半分|はんぶん} assumes the first is already down.') }] },
          }),
          actions: [
            A('first', '{一|ひと}つ{目|め} を {下|お}ろす', 'Lower the first weight', { ok: true, set: { first: 'down', platform: 'mid' }, means: { en: 'You will lower the first weight.' }, result: { en: 'The first weight slides down the well; the platform climbs part way.' } }),
            A('all', '{全部|ぜんぶ} {下|お}ろす', 'Lower all three', { means: { en: 'You will drop all three weights at once.' }, wrong: { en: 'The platform shoots up and jams against the beams. You haul the weights back up.' } }),
          ] },
        { id: 'w2', text: { jp: '{二|ふた}つ{目|め} は 、 {一|ひと}つ{目|め} の {半分|はんぶん} で いい 。', en: 'The second need only be half the first.' },
          task: step('g:kosoado', {
            F: { ctx: { jp: 'ふたつめ は 、 ひとつめ の はんぶん で いい 。', en: '' }, en: 'Which weight next?', options: [{ en: 'The small one, half the first.', ok: true }, { en: 'The big one, the same as the first.', ok: false, why: no('ひとつめ の はんぶん: half the first.') }] },
            E: { ctx: { jp: '{二|ふた}つ{目|め} は 、 {一|ひと}つ{目|め} の {半分|はんぶん} で いい 。', en: '' }, en: 'Which weight next?', options: [{ jp: '{半分|はんぶん} の {錘|おもり}', ok: true }, { jp: '{同|おな}じ {重|おも}さ の {錘|おもり}', ok: false, why: no('{半分|はんぶん} で いい: half is enough.') }] },
            I: { ctx: { jp: BOOK3, en: '' }, en: '二つ目 is short for what?', options: [{ jp: '{二|ふた}つ{目|め} の {錘|おもり}', ok: true }, { jp: '{二|ふた}つ{目|め} の {台|だい}', ok: false, why: no('There is one platform; the weights are counted.') }] },
            A: { ctx: { jp: BOOK3, en: '' }, en: 'Why only half?', options: [{ en: 'The platform is part way: half the first weight\'s lift brings it level.', ok: true }, { en: 'The second weight is weaker.', ok: false, why: no('A weight is not weak or strong: it is how much, and only half is wanted.') }] },
          }),
          actions: [
            A('half', '{半分|はんぶん} の {錘|おもり} を {下|お}ろす', 'Lower the half weight', { ok: true, set: { second: 'down', platform: 'level' }, means: { en: 'You will lower the half-sized weight.' }, result: { en: 'The platform rises the last stretch and locks level with the floor.' } }),
            A('full', '{同|おな}じ {重|おも}さ の を {下|お}ろす', 'Lower the full-sized one', { means: { en: 'You will lower a full-sized weight.' }, wrong: { en: 'The platform overshoots and jams. You haul everything back up.' } }),
          ] },
        { id: 'w3', text: { jp: '{三|みっ}つ{目|め} は いらない 。', en: 'The third is not needed.' },
          task: step('g:v_nai', {
            F: { ctx: { jp: 'みっつめ は いらない 。', en: '' }, en: 'The platform is level. The third weight?', options: [{ en: 'Leave it.', ok: true }, { en: 'Lower it too.', ok: false, why: no('いらない: not needed.') }] },
            E: { ctx: { jp: '{三|みっ}つ{目|め} は いらない 。', en: '' }, en: 'The third weight?', options: [{ jp: 'その まま', ok: true }, { jp: '{下|お}ろす', ok: false, why: no('いらない: it is not needed.') }] },
            I: { ctx: { jp: BOOK3, en: '' }, en: 'The third weight?', options: [{ jp: 'その まま', ok: true }, { jp: '{下|お}ろす', ok: false, why: no('The platform is level: more would jam it.') }] },
            A: { ctx: { jp: BOOK3, en: '' }, en: 'The third weight?', options: [{ jp: 'その まま', ok: true }, { jp: '{下|お}ろす', ok: false, why: no('いらない: leave it.') }] },
          }),
          actions: [
            A('leave', '{三|みっ}つ{目|め} は その まま', 'Leave the third', { ok: true, set: { third: 'up' }, means: { en: 'You will leave the third weight where it hangs.' }, result: { en: 'The platform holds, level and still.' } }),
            A('third', '{三|みっ}つ{目|め} も {下|お}ろす', 'Lower the third too', { means: { en: 'You will lower the third weight as well.' }, wrong: { en: 'The platform jams against the beams. Start again.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'A bridge across the well.' }, flags: { mp_u3_raised: true } }],
  };

  // ---- the Prompter's Ghost: there only once acknowledged in words ------------------------------------------------
  C.challenges['mp.kuroko_name'] = { title: T('Someone in black', '{黒子|くろこ}'),
    tiers: {
      F: [ch({ item: 'g:exist_aru_iru', prompt: { en: 'By the theatre\'s rule a kuroko is not there. Say that it is.' }, options: [{ jp: 'くろこ さん 、 そこ に います ね 。', ok: true }, { jp: 'くろこ さん 、 そこ に あります ね 。', ok: false, why: no('A person (or a ghost) います; あります is for things.') }] })],
      E: [ch({ item: 'g:exist_aru_iru', prompt: { en: 'Acknowledge it out loud.' }, options: [{ jp: '{黒子|くろこ} さん 、 そこ に います ね 。', ok: true }, { jp: '{黒子|くろこ} さん 、 そこ に {誰|だれ} も いません ね 。', ok: false, why: no('That keeps the rule: it says nobody is there.') }] })],
      I: [ch({ item: 'g:n_desu', prompt: { en: 'Acknowledge it, and ask what it wants.' }, options: [{ jp: 'そこ に いる の は 、 {黒子|くろこ} さん です ね 。 {何|なに} を して いる ん です か 。', ok: true }, { jp: 'そこ に は 、 {何|なに} も ない ん です ね 。', ok: false, why: no('That agrees it is not there.') }, { jp: '{黒子|くろこ} さん は 、 {見|み}えない ん です ね 。', ok: false, why: no('That still treats it as unseen.') }] })],
      A: [ch({ item: 'g:indirectness', prompt: { en: 'Break the convention, politely.' }, options: [{ jp: '{失礼|しつれい} です が 、 そこ に いらっしゃいます よ ね 。', ok: true }, { jp: '{見|み}えない こと に して おきます 。', ok: false, why: no('That keeps the convention: "I\'ll treat you as unseen".') }, { jp: 'いない はず の {人|ひと} は 、 いません 。', ok: false, why: no('That denies it outright.') }] })],
    } };

  // ---- the creatures ---------------------------------------------------------------------------------------------
  const EN = (id, d) => (C.enemies[id] = Object.assign({ region: 'manybridge', bg: 'understage', music: 'battle', boss: false, setting: 'indoor' }, d));
  const POOL = {
    tags: ['manybridge'],
    F: ['v:舞台', 'v:幕', 'v:名前', 'v:東', 'v:西', 'g:prt_no'],
    E: ['v:役者', 'v:台本', 'v:半分', 'g:v_te', 'g:kosoado', 'g:prt_he'],
    I: ['v:主役', 'v:活字', 'g:cond_tara', 'g:v_te_kara', 'g:cond_ba'],
    A: ['v:奈落', 'g:indirectness', 'g:te_oku'],
  };
  EN('mp.kuroko', {
    name: T('Prompter\'s Ghost', '{黒子|くろこ} の {幽霊|ゆうれい}'), art: 'wisp', artOpts: { col: '#1e1c22' }, look: { custom: 'spirit', col: '#2a2830' }, knots: 3, pool: POOL,
    pattern: ['shroud', 'strike', 'rest'],
    intro: T('A figure in a kuroko\'s black, the hood down over its face. It whispers the line before yours, always one ahead.', '{黒|くろ} い {頭巾|ずきん} の {黒子|くろこ} 。 あなた の {台詞|せりふ} を 、 いつ も {一|ひと}つ {先|さき} に ささやく 。'),
    settle: T('The ghost bows, as kuroko do when no one is looking, and is simply not there any more.', '{黒子|くろこ} は {頭|あたま} を {下|さ}げて 、 もう そこ に は いなかった 。') });
  EN('mp.moth', {
    name: T('Misprint Moth', '{誤植|ごしょく}{蛾|が}'), art: 'moth', artOpts: { col: '#d8ccb0', col2: '#2a2420' }, look: { custom: 'moth', col: '#d8ccb0' }, knots: 2, pool: POOL,
    pattern: ['strike', 'shroud', 'rest'],
    intro: T('A moth with paper wings. Wherever it settles, a letter changes into its neighbour.', '{紙|かみ} の {羽|はね} の {蛾|が} 。 とまった {所|ところ} の {字|じ} が 、 {隣|となり} の {字|じ} に {変|か}わる 。'),
    settle: T('The moth folds its wings, and the letters under it come right again.', '{蛾|が} が {羽|はね} を たたむ と 、 {字|じ} が {元|もと} に {戻|もど}った 。') });
  EN('mp.imp', {
    name: T('Loose Type Imp', '{活字|かつじ}{小鬼|こおに}'), art: 'blot', artOpts: { col: '#5a5e66' }, look: { custom: 'blot', col: '#5a5e66' }, knots: 2, pool: POOL,
    pattern: ['strike', 'sweep', 'rest'],
    intro: T('A little imp clattering with loose pieces of type, every one of them backwards.', '{逆|さか}さま の {活字|かつじ} を じゃらじゃら {鳴|な}らす {小鬼|こおに} 。'),
    settle: T('The imp drops its type in a neat row, the right way round for printing, and scampers off.', '{小鬼|こおに} は {活字|かつじ} を きちんと {並|なら}べて 、 {逃|に}げて いった 。') });
  EN('mp.golem', {
    name: T('Block Golem', '{版木|はんぎ}{人形|にんぎょう}'), art: 'golem', artOpts: { col: '#8a6a48', core: '#e0d0a8' }, look: { custom: 'golem', col: '#8a6a48' }, knots: 4, pool: POOL,
    pattern: ['charge', 'strike', 'rest', 'strike'],
    intro: T('A figure stacked out of old woodblocks, their faces worn blank. It stamps where it walks, and leaves no mark.', '{白|しろ} く なった {古|ふる}い {版木|はんぎ} を {積|つ}んだ {人形|にんぎょう} 。 {踏|ふ}んで も 、 {跡|あと} が {残|のこ}らない 。'),
    settle: T('The blocks come apart and lie in a heap, a letter or two showing again on their faces.', '{版木|はんぎ} は ばらばら に なり 、 {字|じ} が {少|すこ}し {戻|もど}って いた 。') });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: Manybridge creature (P09) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    RB.creaturesA.auditEnemy('mp.moth', 'moth', 'meets', 'the moth family in paper and ink: it fits the creature (a paper-winged moth)');
    RB.creaturesA.auditEnemy('mp.golem', 'golem', 'meets', 'the golem family in woodblock timber: it fits the creature (a figure of stacked blocks)');
    for (const [id, art] of [['mp.kuroko', 'wisp'], ['mp.imp', 'blot'], ['mp.naraku', 'golem']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- the Lord of the Understage ---------------------------------------------------------------------------------
  // the machinery itself: ropes and wheels and the dark between the boards, wearing a prompter's hood
  C.chars.mp_naraku = { name: T('The Lord of the Understage', '{奈落|ならく} の {主|ぬし}'), voice: { pitch: 0.55 }, look: { custom: 'spirit', col: '#4a3a30' },
    portrait: { skin: ['#5a4a40', '#3e3028'], hair: ['#1e1814', '#2a221c', '#3a2e26'], cloth: ['#2a2420', '#1e1a16', '#c8a050'], style: 'long', eyes: 'soft', acc: ['hood'], hoodCol: '#1e1a16', bg: '#100c0a' } };
  EN('mp.naraku', {
    name: T('The Lord of the Understage', '{奈落|ならく} の {主|ぬし}'), art: 'golem', artOpts: { col: '#3e3028', core: '#c8a050' }, look: { custom: 'spirit', col: '#4a3a30' },
    region: 'understage', boss: true, music: 'boss', knots: 6, pool: POOL,
    pattern: ['charge', 'strike', 'flood', 'rest', 'strike'],
    intro: T('The Understage itself rises out of the dark: ropes, wheels and weights in a prompter\'s hood. Round it, like moths round a lamp, circle the names it has drawn down. "The play needs no names. It needs only its cues."', '{奈落|ならく} {自身|じしん} が 、 {闇|やみ} から {立|た}ち{上|あ}がる 。 {縄|なわ} と {車|くるま} と {錘|おもり} 。 その {周|まわ}り を 、 {吸|す}い{込|こ}まれた {名前|なまえ} が {回|まわ}って いる 。 「{芝居|しばい} に {名前|なまえ} は いらぬ 。 きっかけ だけ で よい 。」'),
    settle: T('The ropes go slack, the wheels slow, and the names spiral up through the boards toward the stage.', '{縄|なわ} が {緩|ゆる}み 、 {車|くるま} が {止|と}まり 、 {名前|なまえ} が {舞台|ぶたい} へ {昇|のぼ}って いく 。'),
  });
  const BOOK4 = '{幕|まく} が {開|あ}いたら 、 せり で {主役|しゅやく} を {上|あ}げる 。 {次|つぎ} に {回|まわ}り{舞台|ぶたい} 、 {最初|さいしょ} と {逆|ぎゃく} に 。 {最後|さいご} に 、 {全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ 。';
  C.encounters['mp.boss'] = {
    id: 'mp.boss', name: T('The Lord of the Understage', '{奈落|ならく} の {主|ぬし}'),
    lead: { enemy: 'mp.naraku', knots: 6, pattern: ['charge', 'strike', 'flood', 'rest', 'strike'] },
    rules: { wait: true, conditions: true },
    noFlee: true,
    procedure: {
      id: 'mp_naraku', version: 1, restart: 'stable',
      machine: { lift: 'down', revolve: 'east', names: 'below' },
      show: [
        { key: 'lift', label: T('The lead\'s lift', '{主役|しゅやく} の せり'), values: vals({ down: ['{下|した}', 'down'], up: ['{上|うえ}', 'up'] }) },
        { key: 'revolve', label: T('The revolve', '{回|まわ}り{舞台|ぶたい}'), values: vals({ east: ['{東|ひがし} へ {回|まわ}した まま', 'turned east'], west: ['{西|にし} へ {戻|もど}した', 'turned back west'] }) },
        { key: 'names', label: T('The names', '{名前|なまえ}'), values: vals({ below: ['{奈落|ならく} に', 'below'], stage: ['{舞台|ぶたい} に', 'on the stage'] }) },
      ],
      done: T('Every name called, every name gone up through the boards: the play has its people back.', '{名前|なまえ} が {舞台|ぶたい} に {戻|もど}った 。'),
      steps: [
        { id: 'c1', stable: true, text: { jp: '{幕|まく} が {開|あ}いたら 、 せり で {主役|しゅやく} を {上|あ}げる 。', en: 'When the curtain opens, bring the lead up on the lift.' },
          task: step('g:cond_tara', {
            F: { ctx: { jp: 'まく が あいたら 、 せり で しゅやく を あげる 。', en: 'The last page of the prompt-book: the finale.' }, en: 'The curtain is opening above. What do you do?', options: [{ en: 'Bring the lead up on the lift.', ok: true }, { en: 'Turn the revolve.', ok: false, why: no('First the lift: せり で しゅやく を あげる.') }] },
            E: { ctx: { jp: BOOK4, en: '' }, en: 'The curtain is opening. What first?', options: [{ jp: '{主役|しゅやく} の せり を {上|あ}げる', ok: true }, { jp: '{回|まわ}り{舞台|ぶたい} を {回|まわ}す', ok: false, why: no('{次|つぎ} に {回|まわ}り{舞台|ぶたい}: the revolve comes next.') }] },
            I: { ctx: { jp: BOOK4, en: '' }, en: 'The curtain is opening. What first?', options: [{ jp: '{主役|しゅやく} の せり を {上|あ}げる', ok: true }, { jp: '{全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ', ok: false, why: no('{最後|さいご} に: the names come last.') }] },
            A: { ctx: { jp: BOOK4, en: '' }, en: 'The curtain is opening. What first?', options: [{ jp: '{主役|しゅやく} の せり を {上|あ}げる', ok: true }, { jp: '{全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ', ok: false, why: no('The page orders it: lift, revolve, then the names.') }] },
          }),
          actions: [
            A('lift', '{主役|しゅやく} の せり を {上|あ}げる', 'Bring the lead up on the lift', { ok: true, set: { lift: 'up' }, means: { en: 'You will haul the lead\'s lift up into the light.' }, result: { en: 'The lift rises into the light above. Somewhere up there, Sakutarō\'s voice: a line, then his own name.' } }),
            A('revolve', '{回|まわ}り{舞台|ぶたい} を {回|まわ}す', 'Turn the revolve', { means: { en: 'You will turn the revolve first.' }, wrong: { en: 'The revolve grinds round with the lead still below: the cue is missed.' } }),
          ] },
        { id: 'c2', stable: true, text: { jp: '{次|つぎ} に {回|まわ}り{舞台|ぶたい} 、 {最初|さいしょ} と {逆|ぎゃく} に 。', en: 'Next the revolve: the other way from the first time.' },
          task: step('g:kosoado', {
            F: { ctx: { jp: 'つぎ に まわりぶたい 、 さいしょ と ぎゃく に 。', en: 'The first time, you turned it east.' }, en: 'Which way now?', options: [{ en: 'West: the other way from the first time.', ok: true }, { en: 'East again.', ok: false, why: no('さいしょ と ぎゃく: the opposite of the first turn (east).') }] },
            E: { ctx: { jp: '{次|つぎ} に {回|まわ}り{舞台|ぶたい} 、 {最初|さいしょ} と {逆|ぎゃく} に 。', en: 'The first time, you turned it east.' }, en: 'Which way now?', options: [{ jp: '{西|にし} へ', ok: true }, { jp: '{東|ひがし} へ', ok: false, why: no('{逆|ぎゃく}: the opposite.') }] },
            I: { ctx: { jp: BOOK4, en: '' }, en: 'The page leaves the verb out, and the direction. Which way now?', options: [{ jp: '{西|にし} へ {回|まわ}す', ok: true }, { jp: '{東|ひがし} へ {回|まわ}す', ok: false, why: no('{最初|さいしょ} と {逆|ぎゃく}: you turned it east the first time.') }] },
            A: { ctx: { jp: BOOK4, en: '' }, en: 'The curtain is up, so turning it back is allowed now. Which way?', options: [{ jp: '{西|にし} へ {回|まわ}す', ok: true }, { jp: '{東|ひがし} へ もう {一度|いちど}', ok: false, why: no('{最初|さいしょ} と {逆|ぎゃく}: back the other way.') }] },
          }),
          actions: [
            A('west', '{西|にし} へ {回|まわ}す', 'Turn it west', { ok: true, set: { revolve: 'west' }, means: { en: 'You will turn the revolve back west, the other way from the first time.' }, result: { en: 'The revolve swings back; above, the whole company comes round into view.' } }),
            A('east', '{東|ひがし} へ {回|まわ}す', 'Turn it east', { means: { en: 'You will turn the revolve east again.' }, wrong: { en: 'The ring jams on its stop. The Understage laughs, a creak of ropes.' } }),
          ] },
        { id: 'c3', text: { jp: '{最後|さいご} に 、 {全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ 。', en: 'Last, call everyone\'s names.' },
          task: step('g:prt_no', {
            F: { ctx: { jp: 'さいご に 、 ぜんいん の なまえ を よぶ 。', en: '' }, en: 'Whose names?', options: [{ en: 'Everyone\'s.', ok: true }, { en: 'Only the lead\'s.', ok: false, why: no('ぜんいん: everyone.') }] },
            E: { ctx: { jp: '{最後|さいご} に 、 {全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ 。', en: '' }, en: 'Whose names?', options: [{ jp: '{全員|ぜんいん} の', ok: true }, { jp: '{主役|しゅやく} だけ の', ok: false, why: no('{全員|ぜんいん}: the whole company.') }] },
            I: { ctx: { jp: BOOK4, en: '' }, en: 'What is last?', options: [{ jp: '{全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ', ok: true }, { jp: '{主役|しゅやく} の {名前|なまえ} を もう {一度|いちど} {呼|よ}ぶ', ok: false, why: no('{全員|ぜんいん}: everyone, the lead and all the rest.') }] },
            A: { ctx: { jp: BOOK4, en: '' }, en: 'What is last?', options: [{ jp: '{全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ', ok: true }, { jp: '{呼|よ}ばない まま {幕|まく} を {下|お}ろす', ok: false, why: no('A curtain call without names is what the Understage wants.') }] },
          }),
          actions: [
            A('roll', '{全員|ぜんいん} の {名前|なまえ} を {呼|よ}ぶ', 'Call the roll: every name', { ok: true, set: { names: 'stage' }, means: { en: 'You will call every name in the company, one after another.' }, result: { en: 'You call them, name after name. Each one, as it is called, flies up through the boards.' } }),
            A('lead', '{主役|しゅやく} の {名前|なまえ} だけ', 'Only the lead\'s', { means: { en: 'You will call only the lead\'s name.' }, wrong: { en: 'One name goes up. The rest circle tighter round the dark.' } }),
          ] },
      ],
    },
    // the companion's actions are stage cues (E10): each, in its own role, works the house on the right moment
    companion: {
      nao: [{ id: 'nao_rope', name: T('Haul on the cue', 'きっかけ で {引|ひ}く'), desc: 'Nao takes the fly rope and hauls on your word.', once: true, effect: { knots: 2 }, says: { en: 'Nao: "On your word!" The rope burns through their hands; a whole bank of weights drops, and the Understage reels.' } }],
      mio: [{ id: 'mio_lights', name: T('Bring up the footlights', '{足元|あしもと} の {灯|あか}り'), desc: 'Mio lights the footlights down the line.', once: true, effect: { ward: { pc: 1, comp: 1 } }, says: { en: 'Mio runs the footlights down the line, one after another. In their glow the Understage\'s shadows can\'t reach you.' } }],
      ren: [{ id: 'ren_lamp', name: T('Light the trap', 'せり を {照|て}らす'), desc: 'Ren holds the lantern over the open trap.', once: true, effect: { knots: 1, ward: { pc: 1 } }, says: { en: 'Ren holds the lantern over the trap. "Every cue needs a light to be seen by." The names below turn toward it.' } }],
      suzu: [{ id: 'suzu_line', name: T('Give the cue line', 'きっかけ の {台詞|せりふ}'), desc: 'Suzu speaks the line that cues the turn, from the wings.', once: true, effect: { knots: 2 }, says: { en: 'Suzu, from the wings, word-perfect: the line that cues the turn. Every wheel in the Understage answers it, and the creature with them.' } }],
    },
    conclusions: [{ id: 'roll', when: { proc: 'done' }, result: 'win', text: { en: 'Every name back on the stage. The Understage is only machinery again.' }, flags: { mp_under_done: true } }],
  };
})(RB.content);
