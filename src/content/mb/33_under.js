/* Manybridge, Chapter 3: the Undercroft's language, machines and creatures (expansion P08).
 *  - three lock tablets: the old keeper's instructions are routing sentences (what goes from where to where, and on
 *    what condition); reading them is how the levels are worked;
 *  - two procedures: mb.locks (two basins joined by a middle gate: raising one lowers the other; the punt crosses
 *    when they match) and mb.greatlock (the last lock lowers the punt to the oldest level);
 *  - the Nameless Bridge (mb.boss): a machine-procedure boss. Three spans restored in order while answering its
 *    moves; it ends when the bridge is given back its name, assembled from what the chapter gathered (the dead
 *    letter's first and last sounds, Ichi's counting song; Fujiya's rubbing and Kansuke's riddle if found);
 *  - five creatures: Tally Crab, Lockgate Snail, Abacus Beetle, IOU Tangle, Driftbarge.
 * Every step has F, E, I and A. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const no = (en) => ({ en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  // a procedure step's language task, four tiers: tiers[k] = { ctx, en, options } (options default to ok/wrong labels)
  function step(item, tiers, okJp, wrongJp, wrongWhy) {
    const out = {};
    for (const k of ['F', 'E', 'I', 'A']) {
      const t = tiers[k];
      out[k] = ch({ item, ctx: t.ctx, prompt: { en: t.en }, options: t.options || [{ jp: okJp, ok: true }, { jp: wrongJp, ok: false, why: no(t.why || wrongWhy) }] });
    }
    return out;
  }
  const A = (id, jp, en, o) => Object.assign({ id, label: { jp, en } }, o);

  // ---- the lock tablets (read at the tablet; the procedure steps quote them) ---------------------------------------
  const TAB1 = '{西|にし} の {水門|すいもん} を {開|あ}けると 、 {上|うえ} の {池|いけ} から {下|した} の {水路|すいろ} へ {水|みず} が {流|なが}れる 。';
  const TAB2 = '{真|ま}ん{中|なか} の {門|もん} を {開|あ}けたら 、 {高|たか}い {池|いけ} から {低|ひく}い {池|いけ} へ {水|みず} が {移|うつ}る 。 {高|たか}さ が {同|おな}じ に なる まで {待|ま}って から 、 {舟|ふね} を {通|とお}す こと 。';
  const TAB3 = '{大閘門|だいこうもん} は 、 {上|うえ} の {門|もん} を {閉|し}めない かぎり 、 {下|した} の {門|もん} が {開|ひら}かない 。';
  C.challenges['mb.tablet1'] = { title: T('The first tablet', '{一|いち} の {石板|せきばん}'),
    tiers: {
      F: [ch({ item: 'g:cond_to', ctx: { jp: TAB1, en: 'Open the west sluice, and the water flows from the upper basin to the channels below.' }, prompt: { en: 'Where does the water go when the west sluice is opened?' },
        options: [{ en: 'From the upper basin down to the channels below.', ok: true }, { en: 'From the channels up into the upper basin.', ok: false, why: no('から marks where it comes from ({上|うえ} の {池|いけ}), へ where it goes.') }] })],
      E: [ch({ item: 'g:prt_kara_made', ctx: { jp: TAB1, en: '' }, prompt: { en: 'Where does the water go, and what makes it go?' },
        options: [{ en: 'Opening the west sluice sends it from the upper basin to the channels below.', ok: true }, { en: 'Opening the west sluice brings water up from the channels.', ok: false, why: no('{上|うえ} の {池|いけ} から {下|した} の {水路|すいろ} へ: from above, to below.') }, { en: 'Shutting the west sluice sends it down.', ok: false, why: no('{開|あ}けると: when it is opened.') }] })],
      I: [ch({ item: 'g:cond_to', ctx: { jp: TAB1, en: '' }, prompt: { en: 'The walkway east is under water. What will clear it?' },
        options: [{ en: 'Opening the west sluice: the basin drains into the channels.', ok: true }, { en: 'Waiting: the water goes down by itself.', ok: false, why: no('〜と here: whenever the sluice is opened, the water flows. Nothing says it falls by itself.') }, { en: 'Opening the sluice on the east side.', ok: false, why: no('The tablet names the west sluice ({西|にし} の {水門|すいもん}).') }] })],
      A: [ch({ item: 'g:cond_to', ctx: { jp: TAB1, en: '' }, prompt: { en: 'Why would the keeper have written 開けると and not 開けたら here?' },
        options: [{ en: 'It states what always happens, like a rule of the machine.', ok: true }, { en: 'It is a request to open the sluice.', ok: false, why: no('A request would be {開|あ}けて ください.') }, { en: 'It describes one particular time it was opened.', ok: false, why: no('〜と for a machine is "whenever"; a single past occasion would be {開|あ}けたら … {流|なが}れた.') }] })],
    } };
  C.challenges['mb.tablet3'] = { title: T('The third tablet', '{三|さん} の {石板|せきばん}'),
    tiers: {
      F: [ch({ item: 'g:v_nakereba', ctx: { jp: TAB3, en: 'The lower gate of the Great Lock will not open unless the upper gate is shut.' }, prompt: { en: 'What must be done before the lower gate opens?' },
        options: [{ en: 'Shut the upper gate.', ok: true }, { en: 'Open the upper gate.', ok: false, why: no('{閉|し}めない かぎり … {開|ひら}かない: it will not open unless the upper gate is shut.') }] })],
      E: [ch({ item: 'g:v_nakereba', ctx: { jp: TAB3, en: '' }, prompt: { en: 'What has to happen first?' },
        options: [{ en: 'The upper gate is shut; then the lower gate can open.', ok: true }, { en: 'The lower gate opens; then the upper one shuts.', ok: false, why: no('The upper gate first: 〜ない かぎり, "unless".') }, { en: 'Both gates open together.', ok: false, why: no('The lower gate does not open while the upper is open.') }] })],
      I: [ch({ item: 'g:v_nakereba', ctx: { jp: TAB3, en: '' }, prompt: { en: 'Which says the same thing?' },
        options: [{ jp: '{上|うえ} の {門|もん} を {閉|し}めなければ 、 {下|した} の {門|もん} は {開|ひら}かない 。', ok: true }, { jp: '{上|うえ} の {門|もん} を {閉|し}めれば 、 {下|した} の {門|もん} も {閉|し}まる 。', ok: false, why: no('That says shutting the upper shuts the lower too.') }, { jp: '{下|した} の {門|もん} を {開|あ}けなければ 、 {上|うえ} の {門|もん} は {閉|し}まらない 。', ok: false, why: no('That turns the condition round.') }] })],
      A: [ch({ item: 'g:v_nakereba', ctx: { jp: TAB3, en: '' }, prompt: { en: 'What does the rule protect against?' },
        options: [{ en: 'Both gates open at once: the upper water rushing through the chamber.', ok: true }, { en: 'The punt being too heavy for the lock.', ok: false, why: no('Nothing about weight: the rule is about which gate may open.') }, { en: 'Strangers using the lock.', ok: false, why: no('That was Matsu\'s rule, not the tablet\'s.') }] })],
    } };

  // ---- the Channels: two basins and a middle gate ------------------------------------------------------------------
  const vals = (o) => { const out = {}; for (const k in o) out[k] = { jp: o[k][0], en: o[k][1] }; return out; };
  C.encounters['mb.locks'] = {
    id: 'mb.locks', kind: 'procedure', name: T('The middle gate', '{真|ま}ん{中|なか} の {門|もん}'),
    rules: { wait: true },
    procedure: {
      id: 'mb_locks', version: 1, restart: 'stable',
      machine: { west: 'high', east: 'low', gate: 'shut', punt: 'west' },
      show: [
        { key: 'west', label: T('West basin', '{西|にし} の {池|いけ}'), values: vals({ high: ['{高|たか}い', 'high'], low: ['{低|ひく}い', 'low'], level: ['{同|おな}じ', 'level'] }) },
        { key: 'east', label: T('East basin', '{東|ひがし} の {池|いけ}'), values: vals({ high: ['{高|たか}い', 'high'], low: ['{低|ひく}い', 'low'], level: ['{同|おな}じ', 'level'] }) },
        { key: 'gate', label: T('Middle gate', '{真|ま}ん{中|なか} の {門|もん}'), values: vals({ shut: ['{閉|し}まって いる', 'shut'], open: ['{開|あ}いて いる', 'open'] }) },
        { key: 'punt', label: T('The punt', '{舟|ふね}'), values: vals({ west: ['{西|にし}', 'west'], east: ['{東|ひがし}', 'east'] }) },
      ],
      done: T('The basins stand level, the punt glides through to the east, and the gate is shut behind it.', '{舟|ふね} が {東|ひがし} へ {通|とお}った 。'),
      steps: [
        { id: 'k1', stable: true, text: { jp: '{真|ま}ん{中|なか} の {門|もん} を {開|あ}けたら 、 {高|たか}い {池|いけ} から {低|ひく}い {池|いけ} へ {水|みず} が {移|うつ}る 。', en: 'Open the middle gate, and the water moves from the high basin to the low one.' },
          task: step('g:cond_tara', {
            F: { ctx: { jp: 'まんなか の もん を あけたら 、 たかい いけ から ひくい いけ へ みず が うつる 。', en: '' }, en: 'The west basin is high and the east low. What happens if you open the middle gate?', options: [{ en: 'Water moves from the west basin into the east.', ok: true }, { en: 'Water moves from the east basin into the west.', ok: false, why: no('から: from the high one (west). へ: to the low one (east).') }] },
            E: { ctx: { jp: TAB2, en: '' }, en: 'The west basin is high. Which way will the water go?', options: [{ en: 'West to east: high to low.', ok: true }, { en: 'East to west.', ok: false, why: no('{高|たか}い {池|いけ} から {低|ひく}い {池|いけ} へ.') }] },
            I: { ctx: { jp: TAB2, en: '' }, en: 'What will the middle gate change, and what will it not?', options: [{ en: 'The levels, as water runs high to low; not where the punt is.', ok: true }, { en: 'It moves the punt through at once.', ok: false, why: no('The punt goes through only after the levels match: {待|ま}って から.') }, { en: 'It raises both basins.', ok: false, why: no('{移|うつ}る: the water moves from one to the other, the total stays.') }] },
            A: { ctx: { jp: TAB2, en: '' }, en: 'Why does the tablet say 待ってから before 舟を通す?', options: [{ en: 'Taking the punt through while the levels differ would drag it with the rush.', ok: true }, { en: 'The keeper liked to rest.', ok: false, why: no('{待|ま}って から marks an order of events, not a rest.') }, { en: 'The gate opens slowly.', ok: false, why: no('The wait is for the levels (〜まで), not the gate.') }] },
          }),
          actions: [
            A('open', '{真|ま}ん{中|なか} の {門|もん} を {開|あ}ける', 'Open the middle gate', { ok: true, set: { gate: 'open' }, means: { en: 'You will open the middle gate; the water will run from west to east.' }, result: { en: 'The gate grinds open; water pours from the west basin into the east.' } }),
            A('punt', '{舟|ふね} を {通|とお}す', 'Take the punt through', { means: { en: 'You will push the punt through the gate now.' }, wrong: { en: 'The gate is shut: the punt noses against it and drifts back.' } }),
          ] },
        { id: 'k2', stable: true, text: { jp: '{高|たか}さ が {同|おな}じ に なる まで {待|ま}って ください 。', en: 'Wait until the levels are the same.' },
          task: step('g:prt_kara_made', {
            F: { ctx: { jp: 'たかさ が おなじ に なる まで まって ください 。', en: '' }, en: 'Water is pouring through. What now?', options: [{ en: 'Wait until the two basins are level.', ok: true }, { en: 'Take the punt through now.', ok: false, why: no('まで: until the levels are the same.') }] },
            E: { ctx: { jp: '{高|たか}さ が {同|おな}じ に なる まで {待|ま}って ください 。', en: '' }, en: 'Water is pouring through. What now?', options: [{ jp: '{待|ま}つ', ok: true }, { jp: '{舟|ふね} を {通|とお}す', ok: false, why: no('まで {待|ま}って: wait until they are level.') }] },
            I: { ctx: { jp: TAB2, en: '' }, en: 'How do you know when to stop waiting?', options: [{ en: 'When the two basins stand at the same height.', ok: true }, { en: 'When the gate has been open a while.', ok: false, why: no('{高|たか}さ が {同|おな}じ に なる まで: until the heights match.') }] },
            A: { ctx: { jp: TAB2, en: '' }, en: 'The water is still rushing. Which is the keeper\'s instruction now?', options: [{ jp: '{待|ま}って から {通|とお}す', ok: true }, { jp: '{通|とお}して から {待|ま}つ', ok: false, why: no('The order is wait, then take it through.') }, { jp: '{通|とお}さない で {帰|かえ}る', ok: false, why: no('Nothing says give up.') }] },
          }),
          actions: [
            A('wait', '{待|ま}つ', 'Wait', { ok: true, set: { west: 'level', east: 'level' }, means: { en: 'You will wait for the basins to level.' }, result: { en: 'The rush slows to a murmur; the two basins stand level.' } }),
            A('punt', '{舟|ふね} を {通|とお}す', 'Take the punt through', { means: { en: 'You will push the punt through while the water still rushes.' }, wrong: { en: 'The rush swings the punt round and back into the west basin. Wait for the levels.' } }),
          ] },
        { id: 'k3', text: { jp: '{舟|ふね} を {東|ひがし} へ {通|とお}して 、 {門|もん} を {閉|し}めて ください 。', en: 'Take the punt through to the east, then shut the gate.' },
          task: step('g:v_te', {
            F: { ctx: { jp: 'ふね を ひがし へ とおして 、 もん を しめて ください 。', en: '' }, en: 'The basins are level. What first?', options: [{ en: 'Take the punt east, then shut the gate.', ok: true }, { en: 'Shut the gate, then take the punt east.', ok: false, why: no('〜て joins them in order: the punt first, then the gate.') }] },
            E: { ctx: { jp: '{舟|ふね} を {東|ひがし} へ {通|とお}して 、 {門|もん} を {閉|し}めて ください 。', en: '' }, en: 'What do you do first?', options: [{ jp: '{舟|ふね} を {通|とお}す', ok: true }, { jp: '{門|もん} を {閉|し}める', ok: false, why: no('{通|とお}して 、 {閉|し}めて: in that order.') }] },
            I: { ctx: { jp: '{舟|ふね} を {東|ひがし} へ {通|とお}して 、 {門|もん} を {閉|し}めて ください 。', en: '' }, en: 'What would happen if you shut the gate first?', options: [{ en: 'The punt would be stuck on the west side.', ok: true }, { en: 'The water would rise again.', ok: false, why: no('The levels are matched; shutting the gate only stops the punt.') }] },
            A: { ctx: { jp: '{舟|ふね} を {東|ひがし} へ {通|とお}して 、 {門|もん} を {閉|し}めて ください 。', en: '' }, en: 'Why shut the gate at all, once through?', options: [{ en: 'So the next keeper finds the basins held as the tablets expect.', ok: true }, { en: 'To keep the creatures out.', ok: false, why: no('Nothing on the tablet mentions them.') }, { en: 'To raise the east basin.', ok: false, why: no('Shutting a gate between level basins changes nothing in the water.') }] },
          }),
          actions: [
            A('through', '{舟|ふね} を {通|とお}す', 'Take the punt through', { ok: true, set: { punt: 'east' }, means: { en: 'You will pole the punt through to the east basin.' }, result: { en: 'The punt slides through the gate into the east basin.' } }),
            A('shut', '{門|もん} を {閉|し}める', 'Shut the gate', { means: { en: 'You will shut the gate with the punt still on the west side.' }, wrong: { en: 'The gate shuts with the punt behind it. You open it again: the basins are still level.' }, restart: 'stable' }),
          ] },
        { id: 'k4', text: { jp: '{門|もん} を {閉|し}めて ください 。', en: 'Shut the gate.' },
          task: step('g:v_te_kudasai', {
            F: { ctx: { jp: 'もん を しめて ください 。', en: '' }, en: 'The punt is through. What now?', options: [{ en: 'Shut the gate.', ok: true }, { en: 'Open the gate wider.', ok: false, why: no('しめて: shut.') }] },
            E: { ctx: { jp: '{門|もん} を {閉|し}めて ください 。', en: '' }, en: 'The punt is through. What now?', options: [{ jp: '{門|もん} を {閉|し}める', ok: true }, { jp: '{門|もん} を {開|あ}ける', ok: false, why: no('{閉|し}めて: shut.') }] },
            I: { ctx: { jp: '{門|もん} を {閉|し}めて ください 。', en: '' }, en: 'The punt is through. What does the tablet ask last?', options: [{ jp: '{門|もん} を {閉|し}める', ok: true }, { jp: '{池|いけ} を {待|ま}つ', ok: false, why: no('The waiting is done: the last thing is the gate.') }] },
            A: { ctx: { jp: '{門|もん} を {閉|し}めて ください 。', en: '' }, en: 'The punt is through. What is left?', options: [{ jp: '{門|もん} を {閉|し}める', ok: true }, { jp: '{舟|ふね} を {戻|もど}す', ok: false, why: no('Nothing asks for the punt back.') }] },
          }),
          actions: [
            A('shut', '{門|もん} を {閉|し}める', 'Shut the gate', { ok: true, set: { gate: 'shut' }, means: { en: 'You will shut the middle gate behind the punt.' }, result: { en: 'The gate swings shut. The punt waits at the east walkway.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The punt is through to the east.' }, flags: { mb_u2_through: true } }],
  };

  // ---- the Great Lock: the punt down to the oldest level ----------------------------------------------------------
  C.encounters['mb.greatlock'] = {
    id: 'mb.greatlock', kind: 'procedure', name: T('The Great Lock', '{大閘門|だいこうもん}'),
    rules: { wait: true },
    procedure: {
      id: 'mb_greatlock', version: 1, restart: 'start',
      machine: { upper: 'open', lower: 'shut', water: 'high' },
      show: [
        { key: 'upper', label: T('Upper gate', '{上|うえ} の {門|もん}'), values: vals({ open: ['{開|あ}いて いる', 'open'], shut: ['{閉|し}まって いる', 'shut'] }) },
        { key: 'lower', label: T('Lower gate', '{下|した} の {門|もん}'), values: vals({ open: ['{開|あ}いて いる', 'open'], shut: ['{閉|し}まって いる', 'shut'] }) },
        { key: 'water', label: T('The chamber', '{閘室|こうしつ}'), values: vals({ high: ['{高|たか}い', 'high'], low: ['{低|ひく}い', 'low'] }) },
      ],
      done: T('The punt sinks with the water to the lowest quay; the lower gate opens on old dark water.', '{舟|ふね} は {一番|いちばん} {下|した} へ 。'),
      steps: [
        { id: 'g1', text: { jp: TAB3, en: 'The lower gate will not open unless the upper gate is shut.' },
          task: step('g:v_nakereba', {
            F: { ctx: { jp: TAB3, en: '' }, en: 'The punt is in the chamber. What first?', options: [{ en: 'Shut the upper gate.', ok: true }, { en: 'Open the lower gate.', ok: false, why: no('It will not open until the upper gate is shut.') }] },
            E: { ctx: { jp: TAB3, en: '' }, en: 'What first?', options: [{ jp: '{上|うえ} の {門|もん} を {閉|し}める', ok: true }, { jp: '{下|した} の {門|もん} を {開|あ}ける', ok: false, why: no('〜ない かぎり {開|ひら}かない: not until the upper is shut.') }] },
            I: { ctx: { jp: TAB3, en: '' }, en: 'Which comes first, and why?', options: [{ en: 'The upper gate shut: the lower opens only then.', ok: true }, { en: 'The lower gate opened: the water must go first.', ok: false, why: no('It cannot open while the upper is open.') }] },
            A: { ctx: { jp: TAB3, en: '' }, en: 'What does the keeper mean by かぎり here?', options: [{ en: '"So long as it is not shut", the lower gate stays closed.', ok: true }, { en: '"As far as I know".', ok: false, why: no('That かぎり would follow a verb of knowing (知る かぎり).') }, { en: '"Only once".', ok: false, why: no('かぎり here is a limit on a condition: unless.') }] },
          }),
          actions: [
            A('shut', '{上|うえ} の {門|もん} を {閉|し}める', 'Shut the upper gate', { ok: true, set: { upper: 'shut' }, means: { en: 'You will shut the upper gate behind the punt.' }, result: { en: 'The upper gate thunders shut behind you.' } }),
            A('lower', '{下|した} の {門|もん} を {開|あ}ける', 'Open the lower gate', { means: { en: 'You will try the lower gate with the upper one still open.' }, wrong: { en: 'The lower gate will not budge: the catch holds while the upper gate stands open.' } }),
          ] },
        { id: 'g2', text: { jp: '{水|みず} が {下|さ}がったら 、 {下|した} の {門|もん} を {開|あ}けて ください 。', en: 'When the water has gone down, open the lower gate.' },
          task: step('g:cond_tara', {
            F: { ctx: { jp: 'みず が さがったら 、 した の もん を あけて ください 。', en: '' }, en: 'The water is sinking. When do you open the lower gate?', options: [{ en: 'Once the water has gone down.', ok: true }, { en: 'Right now, while it sinks.', ok: false, why: no('さがったら: after it has gone down.') }] },
            E: { ctx: { jp: '{水|みず} が {下|さ}がったら 、 {下|した} の {門|もん} を {開|あ}けて ください 。', en: '' }, en: 'When do you open the lower gate?', options: [{ en: 'After the water has gone down.', ok: true }, { en: 'Before it goes down.', ok: false, why: no('〜たら: once it has.') }] },
            I: { ctx: { jp: '{水|みず} が {下|さ}がったら 、 {下|した} の {門|もん} を {開|あ}けて ください 。', en: '' }, en: 'Which says the same?', options: [{ jp: '{水|みず} が {下|さ}がって から 、 {下|した} の {門|もん} を {開|あ}ける 。', ok: true }, { jp: '{水|みず} が {下|さ}がる {前|まえ} に 、 {下|した} の {門|もん} を {開|あ}ける 。', ok: false, why: no('{前|まえ} に: before. The tablet says after.') }] },
            A: { ctx: { jp: '{水|みず} が {下|さ}がったら 、 {下|した} の {門|もん} を {開|あ}けて ください 。', en: '' }, en: 'Why 下がったら and not 下がると?', options: [{ en: 'たら marks the moment after which you act: wait for it, then open.', ok: true }, { en: 'と would be ruder.', ok: false, why: no('Not a matter of politeness: と states what always follows; たら sets your next action after an event.') }] },
          }),
          actions: [
            A('wait_open', '{待|ま}って {下|した} の {門|もん} を {開|あ}ける', 'Wait, then open the lower gate', { ok: true, set: { water: 'low', lower: 'open' }, means: { en: 'You will wait for the water to drop, then open the lower gate.' }, result: { en: 'The chamber drains with a long sigh; the lower gate opens on still, black water.' } }),
            A('open_now', '{今|いま} {下|した} の {門|もん} を {開|あ}ける', 'Open the lower gate now', { means: { en: 'You will heave the lower gate while the chamber is full.' }, wrong: { en: 'The weight of water holds it fast. The keeper\'s rule is the keeper\'s rule: you start again from the upper gate.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'Down to the oldest level.' }, flags: { mb_u3_down: true } }],
  };

  // ---- the creatures ---------------------------------------------------------------------------------------------
  const EN = (id, d) => (C.enemies[id] = Object.assign({ region: 'manybridge', bg: 'undercroft', music: 'battle', boss: false }, d));
  const POOL = {
    tags: ['manybridge'],
    F: ['v:橋', 'v:水', 'v:舟', 'v:米', 'v:名前', 'g:prt_ni'],
    E: ['v:送る', 'v:届ける', 'v:蔵', 'g:prt_kara_made', 'g:prt_he', 'g:prt_de'],
    I: ['v:取引', 'v:条件', 'g:cond_tara', 'g:cond_ba', 'g:cond_nara'],
    A: ['v:約定', 'g:indirectness', 'g:v_nakereba'],
  };
  EN('mb.crab', { setting: 'indoor',
    name: T('Tally Crab', '{札蟹|ふだがに}'), art: 'crab', artOpts: { col: '#3e4c7a' }, look: { custom: 'sg_crab', col: '#3e4c7a' }, knots: 2, pool: POOL,
    pattern: ['strike', 'mend', 'rest'],
    intro: T('A crab stamps "paid" on everything it touches, whether anyone paid or not.', '{触|さわ}った もの {全部|ぜんぶ} に 「{済|す}み」 の {判|はん} を {押|お}す {蟹|かに} だ 。'),
    settle: T('The crab sets down its stamp and backs away into the dark.', '{蟹|かに} は {判|はん} を {置|お}いて 、 {暗|くら}がり へ {下|さ}がった 。') });
  EN('mb.snail', { setting: 'indoor',
    name: T('Lockgate Snail', '{閘門|こうもん}かたつむり'), art: 'golem', artOpts: { col: '#6e7a6a', core: '#c8d0b8' }, look: { custom: 'golem', col: '#6e7a6a' }, knots: 3, pool: POOL,
    pattern: ['charge', 'rest', 'strike'],
    intro: T('A snail with a shell like a lock gate. It closes up tight when spoken to rudely.', '{水門|すいもん} の よう な {殻|から} の かたつむり 。 {乱暴|らんぼう} に {話|はな}しかける と 、 {殻|から} を {閉|と}じる 。'),
    settle: T('The snail opens its gate-shell a crack, and slides off along the wet stone.', 'かたつむり は {殻|から} を {少|すこ}し {開|ひら}いて 、 {濡|ぬ}れた {石|いし} の {上|うえ} を {去|さ}って いった 。') });
  EN('mb.beetle', { setting: 'indoor',
    name: T('Abacus Beetle', '{算盤|そろばん}{虫|むし}'), art: 'moth', artOpts: { col: '#7a5a3a', col2: '#c8a050' }, look: { custom: 'moth', col: '#7a5a3a' }, knots: 2, pool: POOL,
    pattern: ['charge', 'strike', 'rest'],
    intro: T('A beetle whose back is lined like an abacus. Wherever it scuttles, the numbers change.', '{背中|せなか} が {算盤|そろばん} の よう な {虫|むし} 。 {通|とお}った {所|ところ} の {数字|すうじ} が {変|か}わる 。'),
    settle: T('The beetle folds its beads away and clicks off into a crack.', '{虫|むし} は {珠|たま} を しまって 、 {隙間|すきま} に {消|き}えた 。') });
  EN('mb.tangle', { setting: 'indoor',
    name: T('IOU Tangle', '{借金|しゃっきん}の{糸|いと}'), art: 'blot', artOpts: { col: '#8a6a4a' }, look: { custom: 'blot', col: '#8a6a4a' }, knots: 3, pool: POOL,
    pattern: ['strike', 'rest', 'sweep'],
    intro: T('A knot of strings, each tied to a slip that says who owes whom. It is very tangled.', '{誰|だれ} が {誰|だれ} に {借|か}りて いる か を {書|か}いた {札|ふだ} の {糸|いと} が 、 {絡|から}まって いる 。'),
    settle: T('The strings come apart, each slip hanging straight from its own thread.', '{糸|いと} は ほどけて 、 {札|ふだ} が {一枚|いちまい} ずつ まっすぐ {下|さ}がった 。') });
  EN('mb.barge', { setting: 'indoor',
    name: T('Driftbarge', '{流|なが}れ{舟|ぶね}'), art: 'golem', artOpts: { col: '#7e5a3e', core: '#c6a150' }, look: { custom: 'golem', col: '#7e5a3e' }, knots: 3, pool: POOL,
    pattern: ['charge', 'flood', 'rest', 'strike'],
    intro: T('An empty barge that goes wherever the last order sent it. Its last order was "here".', '{最後|さいご} に {言|い}われた {所|ところ} へ {行|い}く {空|から} の {荷舟|にぶね} 。 {最後|さいご} の {命令|めいれい} は 「ここ」 だった 。'),
    settle: T('The barge bumps gently against the wall and stays there, waiting for a clearer order.', '{舟|ふね} は {壁|かべ} に そっと {当|あ}たって 、 {止|と}まった 。') });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: Manybridge creature (P08) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    RB.creaturesA.auditEnemy('mb.crab', 'crab', 'meets', 'the crab family in Tally indigo: it fits the creature (a crab that stamps)');
    for (const [id, art] of [['mb.snail', 'golem'], ['mb.beetle', 'moth'], ['mb.tangle', 'blot'], ['mb.barge', 'golem'], ['mb.bridge', 'golem']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- the Nameless Bridge -----------------------------------------------------------------------------------------
  // a pale, weathered figure of grey timber and water (its portrait: wood-grey, a hood like a bridge's roof)
  C.chars.mb_bridgespirit = { name: T('The Nameless Bridge', '{名無|なな}し{橋|ばし}'), voice: { pitch: 0.6 }, look: { custom: 'spirit', col: '#b8c8c0' },
    portrait: { skin: ['#c8ccc0', '#a8ac9e'], hair: ['#8a8676', '#a8a494', '#d8d4c4'], cloth: ['#6a6458', '#544e44', '#d8ccb0'], style: 'long', eyes: 'soft', acc: ['hood'], hoodCol: '#6a6458', bg: '#141c1c' } };
  const NAME_F = ['むすびばし', 'なかばし', 'ふだばし'];
  EN('mb.bridge', {
    name: T('The Nameless Bridge', '{名無|なな}し{橋|ばし}'), art: 'golem', artOpts: { col: '#6a6458', core: '#d8ccb0' }, look: { custom: 'spirit', col: '#b8c8c0' },
    boss: true, music: 'boss', knots: 6, pool: POOL,
    pattern: ['flood', 'strike', 'charge', 'rest', 'strike'],
    intro: T('The first bridge has torn up its own planks and stands in the dark water, holding them like a wall. "No one crosses. No one crosses to the wrong place."', '{一番|いちばん} の {橋|はし} が 、 {自分|じぶん} の {板|いた} を {剥|は}がして 、 {壁|かべ} の よう に {立|た}って いる 。 「{誰|だれ} も {渡|わた}らせない 。 {間違|まちが}った {所|ところ} へ は 。」'),
    settle: T('The bridge lays its planks back down, one span after another.', '{橋|はし} は {板|いた} を {一|ひと}つ ずつ {戻|もど}して いった 。'),
  });
  const span = (id, jp, en, task, okJp, okEn, wrongJp, wrongEn, wrongWhat) => ({ id, text: { jp, en }, task,
    actions: [A(id + '_ok', okJp, okEn, { ok: true, set: { [id]: 'laid' }, means: { en: 'You will lay this span as the bridge\'s own words say.' }, result: { en: 'The span settles into place with a groan of old timber.' } }),
      A(id + '_no', wrongJp, wrongEn, { means: { en: 'You will lay the span ' + wrongWhat + '.' }, wrong: { en: 'The bridge shudders and throws the plank back into the water: "Not there!" The spans you laid hold.' } })] });
  C.encounters['mb.boss'] = {
    id: 'mb.boss', name: T('The Nameless Bridge', '{名無|なな}し{橋|ばし}'),
    lead: { enemy: 'mb.bridge', knots: 6, pattern: ['flood', 'strike', 'charge', 'rest', 'strike'] },
    rules: { wait: true, conditions: true },
    noFlee: true,
    procedure: {
      id: 'mb_bridge', version: 1, restart: 'stable',
      machine: { s1: 'torn', s2: 'torn', s3: 'torn', name: 'none' },
      show: [
        { key: 's1', label: T('Near span', '{手前|てまえ} の {橋桁|はしげた}'), values: vals({ torn: ['{外|はず}れて いる', 'torn up'], laid: ['{架|か}かって いる', 'laid'] }) },
        { key: 's2', label: T('Middle span', '{真|ま}ん{中|なか} の {橋桁|はしげた}'), values: vals({ torn: ['{外|はず}れて いる', 'torn up'], laid: ['{架|か}かって いる', 'laid'] }) },
        { key: 's3', label: T('Far span', '{向|む}こう の {橋桁|はしげた}'), values: vals({ torn: ['{外|はず}れて いる', 'torn up'], laid: ['{架|か}かって いる', 'laid'] }) },
        { key: 'name', label: T('Its name', '{名前|なまえ}'), values: vals({ none: ['ない', 'none'], given: ['ある', 'given back'] }) },
      ],
      done: T('The three spans lie end to end, and the bridge has its name again.', '{橋|はし} に {名前|なまえ} が {戻|もど}った 。'),
      steps: [
        Object.assign(span('s1', '「{手前|てまえ} の {岸|きし} から {真|ま}ん{中|なか} の {柱|はしら} まで 、 {最初|さいしょ} の {板|いた} を {渡|わた}せ 。」', 'The bridge mutters its own old words: "From the near bank to the middle pillar, lay the first plank."',
          step('g:prt_kara_made', {
            F: { ctx: { jp: '「てまえ の きし から まんなか の はしら まで 、 さいしょ の いた を わたせ 。」', en: '' }, en: 'Where does the first plank go?', options: [{ en: 'From the near bank to the middle pillar.', ok: true }, { en: 'From the middle pillar to the far bank.', ok: false, why: no('から: from the near bank. まで: as far as the middle pillar.') }] },
            E: { ctx: { jp: '「{手前|てまえ} の {岸|きし} から {真|ま}ん{中|なか} の {柱|はしら} まで 、 {最初|さいしょ} の {板|いた} を {渡|わた}せ 。」', en: '' }, en: 'Where does the first plank go?', options: [{ en: 'Near bank → middle pillar.', ok: true }, { en: 'Middle pillar → far bank.', ok: false, why: no('{手前|てまえ} の {岸|きし} から: from this bank.') }] },
            I: { ctx: { jp: '「{手前|てまえ} の {岸|きし} から {真|ま}ん{中|なか} の {柱|はしら} まで 、 {最初|さいしょ} の {板|いた} を {渡|わた}せ 。」', en: '' }, en: 'Which plank, and between where?', options: [{ en: 'The first plank, from the near bank to the middle pillar.', ok: true }, { en: 'Any plank, from the middle pillar outward.', ok: false, why: no('{最初|さいしょ} の {板|いた}, from {手前|てまえ} の {岸|きし}.') }] },
            A: { ctx: { jp: '「{手前|てまえ} の {岸|きし} から {真|ま}ん{中|なか} の {柱|はしら} まで 、 {最初|さいしょ} の {板|いた} を {渡|わた}せ 。」', en: '' }, en: 'The bridge speaks in commands (渡せ). What does that tell you about it?', options: [{ en: 'It speaks as the old builders spoke to their crews: plain orders.', ok: true }, { en: 'It is asking you a favour.', ok: false, why: no('A favour would be 〜て くれ or 〜て ください; 渡せ is a bare command.') }] },
          }), '{手前|てまえ} から {真|ま}ん{中|なか} へ', 'Near bank to the middle', '{真|ま}ん{中|なか} から {向|む}こう へ', 'Middle to the far bank', 'from the middle pillar to the far bank'), { stable: true }),
        Object.assign(span('s2', '「{次|つぎ} の {板|いた} は 、 {最初|さいしょ} の {板|いた} の {上|うえ} に {重|かさ}ねず 、 {柱|はしら} の {向|む}こう {側|がわ} に {架|か}けよ 。」', '"The next plank: not on top of the first, but on the far side of the pillar."',
          step('g:v_naide_kudasai', {
            F: { ctx: { jp: '「つぎ の いた は 、 さいしょ の いた の うえ に かさねず 、 はしら の むこうがわ に かけよ 。」', en: '' }, en: 'Where does the second plank go?', options: [{ en: 'On the far side of the middle pillar.', ok: true }, { en: 'On top of the first plank.', ok: false, why: no('かさねず: without stacking it on the first.') }] },
            E: { ctx: { jp: '「{次|つぎ} の {板|いた} は 、 {最初|さいしょ} の {板|いた} の {上|うえ} に {重|かさ}ねず 、 {柱|はしら} の {向|む}こう {側|がわ} に {架|か}けよ 。」', en: '' }, en: 'Where does the second plank go?', options: [{ en: 'Beyond the pillar, not on the first plank.', ok: true }, { en: 'On the first plank, doubled.', ok: false, why: no('{重|かさ}ねず = {重|かさ}ねないで: do not stack it.') }] },
            I: { ctx: { jp: '「{次|つぎ} の {板|いた} は 、 {最初|さいしょ} の {板|いた} の {上|うえ} に {重|かさ}ねず 、 {柱|はしら} の {向|む}こう {側|がわ} に {架|か}けよ 。」', en: '' }, en: 'Which word says "without doing"?', options: [{ jp: '{重|かさ}ねず', ok: true }, { jp: '{架|か}けよ', ok: false, why: no('That is the command: lay it.') }, { jp: '{向|む}こう {側|がわ}', ok: false, why: no('That is "the far side".') }] },
            A: { ctx: { jp: '「{次|つぎ} の {板|いた} は 、 {最初|さいしょ} の {板|いた} の {上|うえ} に {重|かさ}ねず 、 {柱|はしら} の {向|む}こう {側|がわ} に {架|か}けよ 。」', en: '' }, en: 'Give the instruction in plain modern Japanese.', options: [{ jp: '{最初|さいしょ} の {板|いた} に {重|かさ}ねないで 、 {柱|はしら} の {向|む}こう に {架|か}けて ください 。', ok: true }, { jp: '{最初|さいしょ} の {板|いた} に {重|かさ}ねて から 、 {柱|はしら} の {向|む}こう に {架|か}けて ください 。', ok: false, why: no('〜ず is "without", not "after".') }] },
          }), '{柱|はしら} の {向|む}こう に {架|か}ける', 'Lay it beyond the pillar', '{最初|さいしょ} の {板|いた} に {重|かさ}ねる', 'Stack it on the first plank', 'on top of the first plank'), { stable: true }),
        span('s3', '「{最後|さいご} の {板|いた} は 、 {名前|なまえ} を {呼|よ}ばれた とき に だけ 、 {向|む}こう の {岸|きし} に {届|とど}く 。」', '"The last plank reaches the far bank only when the bridge\'s name is called."',
          step('g:toki', {
            F: { ctx: { jp: '「さいご の いた は 、 なまえ を よばれた とき に だけ 、 むこう の きし に とどく 。」', en: '' }, en: 'When does the last plank reach the far bank?', options: [{ en: 'Only when the bridge\'s name is called.', ok: true }, { en: 'Whenever it is pushed hard enough.', ok: false, why: no('なまえ を よばれた とき に だけ: only when its name is called.') }] },
            E: { ctx: { jp: '「{最後|さいご} の {板|いた} は 、 {名前|なまえ} を {呼|よ}ばれた とき に だけ 、 {向|む}こう の {岸|きし} に {届|とど}く 。」', en: '' }, en: 'What will make the last plank reach?', options: [{ en: 'Calling the bridge by its name.', ok: true }, { en: 'Laying it from the far bank.', ok: false, why: no('The plank answers to its name ({名前|なまえ} を {呼|よ}ばれた とき).') }] },
            I: { ctx: { jp: '「{最後|さいご} の {板|いた} は 、 {名前|なまえ} を {呼|よ}ばれた とき に だけ 、 {向|む}こう の {岸|きし} に {届|とど}く 。」', en: '' }, en: 'What do you need before laying the last plank?', options: [{ en: 'The bridge\'s name.', ok: true }, { en: 'A longer plank.', ok: false, why: no('Nothing about length: it reaches when named.') }] },
            A: { ctx: { jp: '「{最後|さいご} の {板|いた} は 、 {名前|なまえ} を {呼|よ}ばれた とき に だけ 、 {向|む}こう の {岸|きし} に {届|とど}く 。」', en: '' }, en: 'What does に だけ add?', options: [{ en: 'That calling its name is the only way: nothing else will do.', ok: true }, { en: 'That it reaches only partway.', ok: false, why: no('だけ limits the occasion, not the distance.') }] },
          }), '{名前|なまえ} を {呼|よ}ぶ {用意|ようい} を する', 'Ready its name', '{力|ちから} で {押|お}す', 'Shove it across', 'by brute force'),
        { id: 'name', text: { jp: '{名前|なまえ} を {呼|よ}ぶ 。', en: 'Call the bridge by its name.' },
          task: {
            F: ch({ item: 'k:hira', ctx: { jp: '「ひとつ むすんで …… 」', en: 'What you gathered: the dead letter\'s address keeps the name\'s first and last sounds, む…び (mu…bi); Ichi\'s song, "One, tie it…": the first bridge ties the city together.' }, prompt: { en: 'Call the bridge by its name.' },
              options: [{ jp: NAME_F[0], ok: true }, { jp: NAME_F[1], ok: false, why: no('なかばし is the Middle Bridge, up in the city: this name begins with む and ends with び.') }, { jp: NAME_F[2], ok: false, why: no('ふだばし is the Tally Bridge: the song says むすんで, to tie.') }] }),
            E: ch({ item: 'v:結ぶ', ctx: { jp: 'イチ の {歌|うた} ： 「{一|ひと}つ {結|むす}んで 」 。', en: 'What you gathered: the dead letter keeps the name\'s first and last sounds, む…び (mu…bi); Ichi\'s song: "One, tie it".' }, prompt: { en: 'Call the bridge by its name.' },
              options: [{ jp: '{結|むす}び{橋|ばし}', ok: true }, { jp: '{中橋|なかばし}', ok: false, why: no('The Middle Bridge is up in the city; this name begins with む.') }, { jp: '{札橋|ふだばし}', ok: false, why: no('The Tally Bridge is up in the city; the song says {結|むす}んで: to tie.') }] }),
            I: { kind: 'write', item: 'v:結ぶ', ctx: { jp: '「{一|ひと}つ {結|むす}んで …… 」', en: 'The letter: the name begins with む and ends with び.' }, prompt: { en: 'Call the bridge by its name: write the part before {橋|はし} in hiragana.' }, answer: 'むすび', accept: ['むすび'], mode: 'reading', template: { before: '', after: ' {橋|ばし}' } },
            A: { kind: 'write', item: 'v:結ぶ', ctx: { jp: '{町|まち} を {結|むす}ぶ {橋|はし} 。', en: '' }, prompt: { en: 'Call it by name, in hiragana (the part before {橋|はし}): the bridge that ties the city together, its name beginning with む and ending with び.' }, answer: 'むすび', accept: ['むすび'], mode: 'reading', template: { before: '', after: ' {橋|ばし}' } },
          },
          actions: [A('call', '「{結|むす}び{橋|ばし}」 と {呼|よ}ぶ', 'Call it "Musubi Bridge"', { ok: true, set: { name: 'given', s3: 'laid' }, means: { en: 'You will call the bridge by the name you gathered: Musubi Bridge.' }, result: { en: '"Musubi…" The last plank swings out, finds the far bank, and holds.' } })] },
      ],
    },
    conclusions: [{ id: 'named', when: { proc: 'done' }, result: 'win', text: { en: 'The bridge has its name: Musubi Bridge, the bridge that ties the city.' }, flags: { mb_bridge_named: true } }],
  };
})(RB.content);
