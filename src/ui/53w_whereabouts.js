/* "Have you seen…?" (expansion P05, W3; the answers come from src/engine/53_town.js). Talking to someone who can be
 * asked after others (an NPC with `asks: true`) offers Talk (what they always say), Have you seen…? (the people you
 * know of), or Never mind. With nobody to ask about, talking is simply talking, as before. The person answers in
 * both languages with one of four kinds of answer: a sighting just now, someone's usual places, an unsure
 * recollection, or a refusal or not knowing them. An answer becomes a note in Known details, never a live marker;
 * the quest guide stays the explicit, optional aid. Nothing here moves anyone or changes the story. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.whereabouts = (function () {
  'use strict';
  const PAGE = 5; // people offered at a time (then "Someone else…")
  const personOf = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  // from the world (50_world.js talkTo): run the menu as a scene, so it is a conversation like any other
  function ask(n, scene) {
    return RB.script.run('wb.ask', { npc: n.id, talk: scene, asker: personOf(n) });
  }
  const nameOf = (p) => { const c = RB.content.chars[p]; return c && c.name ? c.name : { en: p, jp: p }; };
  // The question and the answers are spoken lines (Robin, 2026-10-19: "The 'have you seen' dialogue interactions have
  // no voiced lines from either the player nor the NPC I've talked to - tried with Bunta and Tomo"): shown under one
  // scene id, so their recordings are found, and every one this content can produce is listed for recording
  // (RB.content.spokenSources, read by tools/voice/lines.mjs)
  const SCENE = 'code.wb';
  const question = (p) => { const nm = nameOf(p); return { jp: (nm.jp || nm.en) + ' を {見|み}かけません でした か ？', en: 'Have you seen ' + nm.en + '?' }; };
  RB.content.spokenSources = RB.content.spokenSources || [];
  RB.content.spokenSources.push(() => {
    const out = [];
    if (!RB.town) return out;
    for (const p of RB.town.findable()) out.push(Object.assign({ scene: SCENE, who: 'pc', file: 'ui/53w_whereabouts' }, question(p)));
    for (const a in RB.content.relations || {}) {
      if (!(RB.content.relations[a] || {}).knows && (RB.content.relations[a] || {}).friendly !== false) continue;
      const who = RB.content.chars[a] ? a : 'narr';
      for (const l of RB.town.answersOf(a)) out.push({ scene: SCENE, who, jp: l.jp, en: l.en, file: 'engine/53_town' });
    }
    return out;
  });
  const said = (s, o) => s.backlog.push({ who: 'pc', jp: o.jp, en: o.en, choice: true });
  async function pickPerson(s, people) {
    let at = 0;
    for (;;) {
      const page = people.slice(at, at + PAGE);
      const opts = page.map((p) => ({ jp: nameOf(p).jp || nameOf(p).en, en: nameOf(p).en, p }));
      if (people.length > PAGE) opts.push({ jp: '{他|ほか} の {人|ひと}', en: 'Someone else…', more: true });
      opts.push({ jp: 'なんでも ない', en: 'Never mind', none: true });
      const i = await RB.ui.dialogue.choose(opts, {});
      const o = opts[i];
      if (o.more) { at = at + PAGE >= people.length ? 0 : at + PAGE; continue; }
      if (o.none) { said(s, o); return null; }
      return o.p;
    }
  }
  RB.hooks = RB.hooks || {};
  RB.hooks.wb_ask = async (a, ctx) => {
    const s = RB.game && RB.game.s;
    if (!s || !ctx || !RB.town) return;
    const asker = ctx.asker;
    const people = RB.town.askable(s, asker);
    if (!people.length) { if (ctx.talk) await RB.script.run(ctx.talk, { npc: ctx.npc }); return; }
    const opts = [
      { jp: '{話|はな}す', en: 'Talk', k: 'talk' },
      { jp: '{人|ひと} を {探|さが}して います', en: 'Have you seen…?', k: 'ask' },
      { jp: 'なんでも ない', en: 'Never mind', k: 'none' },
    ];
    const o = opts[await RB.ui.dialogue.choose(opts, {})];
    said(s, o);
    if (o.k === 'talk') { if (ctx.talk) await RB.script.run(ctx.talk, { npc: ctx.npc }); return; }
    if (o.k === 'none') return;
    const target = await pickPerson(s, people);
    if (!target) return;
    await RB.ui.dialogue.say(Object.assign({ who: 'pc', sceneId: SCENE }, question(target)));
    const ans = RB.town.whereabouts(s, asker, target, s.map);
    const who = RB.content.chars[asker] ? asker : 'narr';
    await RB.ui.dialogue.say({ who, jp: ans.line.jp, en: ans.line.en, sceneId: SCENE });
    if (RB.town.note(s, asker, ans) && RB.ui.toast) RB.ui.toast('Noted in Map › Known details (what you were told, not where they are now).');
  };
  return { ask, PAGE, SCENE, question };
})();
