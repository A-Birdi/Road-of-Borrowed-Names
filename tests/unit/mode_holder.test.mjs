// The mode stack's holders (src/engine/90_game.js; RBN-QA-102, Agnes 6342104644). An entry may have a holder, and
// popMode with a holder takes away that holder's entry only, never another's of the same name: a door's transition
// holds the 'transition' entry it pushed, so an old transition settling late (after a load was cancelled, or a journey
// replaced) never takes away a newer transition's entry.
// - with a holder: its own entry, wherever it is in the stack; nothing once it is gone;
// - without one: the topmost of the name, as before;
// - a stack set afresh (setBase, as a load or a new journey does): an old holder finds nothing;
// - a stack assigned directly keeps working;
// - transition() pushes and takes away its entry by its own holder, and nowhere by name alone.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const g = RB.game, G = g.G;

  g.setBase('world');
  g.pushMode('transition', 'transition:1');
  g.pushMode('menu');
  g.pushMode('transition', 'transition:2');
  g.popMode('transition', 'transition:1');
  t.eq(G.modes, ['world', 'menu', 'transition'], 'an old transition takes away its own entry (under the menu), not the newer one on top');
  t.eq(g.mode(), 'transition', 'the newer transition is still the mode');
  g.popMode('transition', 'transition:1');
  t.eq(G.modes, ['world', 'menu', 'transition'], 'its entry gone, the same holder takes nothing more');
  g.popMode('transition', 'transition:2');
  t.eq(G.modes, ['world', 'menu'], 'the newer transition takes away its own');

  g.pushMode('dialogue');
  g.pushMode('menu');
  g.popMode('menu');
  t.eq(G.modes, ['world', 'menu', 'dialogue'], 'without a holder: the topmost of the name');

  g.pushMode('transition', 'transition:3');
  g.setBase('world');
  g.pushMode('transition', 'transition:4');
  g.popMode('transition', 'transition:3');
  t.eq(G.modes, ['world', 'transition'], 'the stack set afresh (a journey loaded): the old holder takes nothing');
  g.popMode('transition', 'transition:4');
  t.eq(G.modes, ['world'], 'and the new one takes its own');

  G.modes = ['world', 'menu'];
  g.pushMode('transition', 'transition:5');
  g.popMode('transition', 'transition:5');
  t.eq(G.modes, ['world', 'menu'], 'a stack assigned directly keeps working');
  t.eq(G.modeBy.length, G.modes.length, 'and its holders stay in step with it');

  const src = fs.readFileSync(new URL('../../src/engine/90_game.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('async function transition('), src.indexOf('function runEnterEvents('));
  t.ok(body.includes("pushMode('transition', 'transition:' + tok)"), 'transition() pushes its entry with its own holder');
  t.ok(body.includes("popMode('transition', 'transition:' + tok)"), 'and takes it away by that holder');
  t.ok(!/popMode\('transition'\)/.test(src), "nothing takes a transition's entry away by name alone");
  g.setBase('world');
};
