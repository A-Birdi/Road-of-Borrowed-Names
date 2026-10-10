/* The performance library's gallery (expansion P05; src/engine/67a_perform.js): seven people at work on the Saltglass
 * road, each with what their work needs, for the tests and for review (?dev=verbs: "Performance gallery"). Only in a
 * throwaway session with the flag dev_perform: no journey meets them. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const m = C.maps['sg.road'];
  if (!m) return;
  const G = 'dev_perform';
  const talk = 'pf.hello';
  m.props = (m.props || []).concat([
    { p: 'desk', x: 10, y: 6, if: G },
    { p: 'signblank', x: 22, y: 6, if: G },
    { p: 'lantern', x: 27, y: 6, if: G },
    { p: 'smalltable', x: 35, y: 6, if: G },
  ]);
  m.npcs = (m.npcs || []).concat([
    { id: 'pf_sweep', char: 'tobi', x: 6, y: 7, dir: 'down', perform: 'sweep', if: G, talk },
    { id: 'pf_sort', char: 'tetsu', x: 10, y: 7, dir: 'up', perform: 'sort', if: G, talk },
    { id: 'pf_carry', char: 'sota', x: 16, y: 9, dir: 'left', perform: { act: 'carry', traits: ['brisk'] }, if: G, talk },
    { id: 'pf_tie', char: 'daigo', x: 22, y: 7, dir: 'up', perform: 'tie', if: G, talk },
    { id: 'pf_tend', char: 'fuku', x: 27, y: 7, dir: 'up', perform: { act: 'tend', traits: ['unhurried'] }, if: G, talk },
    { id: 'pf_read', char: 'genzo', x: 31, y: 8, dir: 'down', perform: { act: 'read', traits: ['thoughtful'] }, if: G, talk },
    { id: 'pf_grind', char: 'nagisa', x: 35, y: 7, dir: 'up', perform: 'grind', if: G, talk },
  ]);
  RB.script.add(`
@scene pf.hello
narr: {仕事|しごと} の {手|て} を {止|と}めて 、 こちら を {向|む}いた 。 || They stop what they are doing and turn to you.
`, 'world/10_perform_gallery.js');
})(RB.content);
