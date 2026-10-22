// RBN-QA-120 (Agnes 6346216453; Cloud CC-126 §1): given his spring egg, Tsuneji said he would share it with the ridge
// folk and the narration said he carried it back to the Lower House, but he stood on by the river. Now he walks to the
// Lower House's door and in before the narration says he went, and he is in the Lower House after:
//  1. where he stands, state by state: before the egg, the riverbank only; once it is his, the Lower House only (by the
//     hearth); once the valley's story is done (yn_done), neither, except that while Eggs for Everyone is under way
//     and his egg is still owed he stays at the riverbank (RBN-QA-129); never both;
//  2. the Lower House's place: floor, nothing on it that blocks, off the entrance's earth and the doorway, nobody else
//     placed there; his talk there is his own lines, with no egg in it;
//  3. the scene: the egg taken and the flag set first, as before; his line; the walk (`!refresh gone 9000`: the bound
//     for a walk longer than the usual 4 s); then the narration, then the egg count (a third egg ends the quest);
//  4. his way out is the Lower House's door: the riverbank no longer holds him, the house does, and that door is the
//     way there from the riverbank; his riverbank placement leaves only by its own way (leaveTo the house, leave:
//     'way': if that cannot be walked he fades where he stands, never by another exit; Agnes 6346676788, Local CL-209);
//  4b. every bound given to `!refresh gone` in the game is a whole number of milliseconds from 1 to 12000 (the op
//     clamps anything else to that or to the default);
//  5. asking where he stands changes nothing in the journey.
// (The walk itself, in Chromium on the built game: tests/e2e/tsuneji_egg.mjs.)
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const st = (flags, quest) => {
    const s = RB.state.newCampaign({ difficulty: 'normal' });
    Object.assign(s.flags, { yn_called: true, yn_rooms_done: true }, flags);
    s.quests.yn_eggs = { stage: 0, done: false, t: 1 };
    if (quest === 'done') s.quests.yn_eggs.done = true;
    if (quest === 'never') delete s.quests.yn_eggs;
    return s;
  };
  const where = (s) => {
    const out = [];
    for (const [id, m] of Object.entries(C.maps)) for (const n of m.npcs || []) if ((n.char || n.id) === 'yn_tsuneji' && (!n.if || RB.state.test(s, n.if))) out.push(id + '@' + n.x + ',' + n.y);
    return out;
  };
  // 1. where he stands
  const CASES = [
    ['before the egg', {}, ['yn.lower@22,18']],
    ['the egg his', { yn_egg_tsuneji: true }, ['yn.shimo@9,7']],
    ['the egg his, the other two given too', { yn_egg_tsuneji: true, yn_egg_yasuke: true, yn_egg_oshige: true }, ['yn.shimo@9,7']],
    ['the valley\'s story done, the egg his', { yn_egg_tsuneji: true, yn_done: true }, []],
    ['the valley\'s story done, no egg, the quest under way (his egg owed: RBN-QA-129)', { yn_done: true }, ['yn.lower@22,18']],
    ['the valley\'s story done, no egg, the quest finished', { yn_done: true }, [], 'done'],
    ['the valley\'s story done, no egg, the quest never begun', { yn_done: true }, [], 'never'],
  ];
  const bad = CASES.filter(([, f, want, q]) => JSON.stringify(where(st(f, q))) !== JSON.stringify(want)).map(([n, f, , q]) => n + ': ' + where(st(f, q)).join(' '));
  t.ok(!bad.length, 'where he stands: the riverbank before the egg, the Lower House after, neither once the valley\'s story is done unless his egg is still owed to an unfinished quest, never both' + (bad.length ? ' (' + bad.join('; ') + ')' : ''));
  // 2. the Lower House's place
  const m = C.maps['yn.shimo'], him = m.npcs.find((n) => n.id === 'yn_tsuneji');
  if (!him) { t.ok(false, 'he has a place in the Lower House'); return; }
  const cm = RB.maps.compile('yn.shimo');
  const floor = m.terrain[him.y][him.x] !== '#', free = !cm.block[him.y * cm.w + him.x];
  const EARTH = new Set(['5,7', '6,7', '7,7', '5,8', '6,8', '7,8', '6,9']);
  const others = m.npcs.filter((n) => n !== him && n.x === him.x && n.y === him.y);
  t.ok(floor && free && !EARTH.has(him.x + ',' + him.y) && !others.length, 'in the Lower House he stands on open floor by the hearth, off the entrance\'s earth and the doorway, where nobody else is placed (' + him.x + ',' + him.y + ')');
  t.ok(him.talk === 'yn.tsuneji' && !(C.scenes['yn.tsuneji'].cmds || []).some((c) => c.op === 'take' || c.op === 'set'), 'his talk there is his own lines, with no egg and nothing set');
  const outside = C.maps['yn.lower'].npcs.find((n) => n.id === 'yn_tsuneji');
  t.ok(Array.isArray(outside.talk) && outside.talk[0].scene === 'yn.egg_tsuneji' && outside.talk[0].if === 'quest.yn_eggs=0&item.yn_eggs&!yn_egg_tsuneji', 'the egg is given at the riverbank, as before');
  // 3. the scene
  const cmds = C.scenes['yn.egg_tsuneji'].cmds;
  const ops = cmds.map((c) => c.op === 'say' ? 'say:' + c.who : c.op + (c.args && c.args.length ? ':' + c.args.join(' ') : ''));
  t.ok(JSON.stringify(ops) === JSON.stringify(['faceplayer', 'take:yn_eggs', 'set:yn_egg_tsuneji', 'say:yn_tsuneji', 'refresh:gone 9000', 'say:narr', 'call:yn.egg_check']), 'the scene: the egg taken and the flag set, his line, his walk, then the narration and the egg count (' + ops.join(', ') + ')');
  const narr = cmds.find((c) => c.op === 'say' && c.who === 'narr');
  t.ok(/{下|しも}の{湯|ゆ} の {土間|どま} へ {帰|かえ}って いった/.test(narr.jp) && /back to the Lower House/.test(narr.en), 'the narration\'s words are as they were');
  const check = C.scenes['yn.egg_check'].cmds;
  t.ok(check[0].op === 'if' && check[0].args[0] === 'yn_egg_yasuke&yn_egg_tsuneji&yn_egg_oshige' && check.some((c) => c.op === 'quest' && c.args.join(' ') === 'yn_eggs done'), 'a third egg still ends the quest (the egg count unchanged)');
  // the op's bound: only this scene asks for a longer one; the others keep 4 s
  const longer = [];
  for (const [id, sc] of Object.entries(C.scenes)) for (const c of sc.cmds || []) if (c.op === 'refresh' && c.args[0] === 'gone' && c.args[1]) longer.push(id + ':' + c.args[1]);
  t.ok(longer.length === 1 && longer[0] === 'yn.egg_tsuneji:9000', 'only this walk waits longer than 4 s (' + longer.join(', ') + ')');
  // 4. his way out
  const s = st({ yn_egg_tsuneji: true });
  const ways = Object.keys(C.maps).filter((id) => id !== 'yn.lower' && (C.maps[id].npcs || []).some((n) => (n.char || n.id) === 'yn_tsuneji' && (!n.if || RB.state.test(s, n.if))));
  const door = (C.maps['yn.lower'].structs || []).find((b) => b.to === 'yn.shimo');
  t.ok(ways.join() === 'yn.shimo' && door && (door.x + door.door) + ',' + (door.y + door.h - 1) === '9,10', 'once the egg is his, the only other place that holds him is the Lower House, whose door on the street is (9,10)');
  t.ok(outside.leaveTo === 'yn.shimo' && outside.leave === 'way', 'his riverbank placement goes only by its own way, to the Lower House (leaveTo yn.shimo, leave: way)');
  // 4b. the bounds
  const bounds = [];
  for (const [id, sc] of Object.entries(C.scenes)) for (const c of sc.cmds || []) if (c.op === 'refresh' && c.args[0] === 'gone' && c.args.length > 1) bounds.push([id, c.args[1]]);
  const badBound = bounds.filter(([, v]) => !/^\d+$/.test(v) || +v < 1 || +v > 12000);
  t.ok(!badBound.length, 'every bound given to `!refresh gone` is a whole number of ms from 1 to 12000 (' + bounds.map((b) => b.join(' ')).join(', ') + ')');
  // 5. pure
  const before = JSON.stringify(s);
  where(s);
  t.ok(JSON.stringify(s) === before, 'asking where he stands changes nothing');
};
