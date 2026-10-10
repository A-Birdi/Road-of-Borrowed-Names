/* East Landing (東の渡し場), Saltglass's old landing round the east beach (expansion P11d; plan 07_REGIONS.md R6;
 * docs/future/work/P11_SEA.md). The landing Saltglass's call-bell case speaks of: silted up and closed, the ferry moved
 * to the stone quay, the bell workshop with it. Genroku, of the Seto family that owned it, has never left his shack
 * by the inlet. Rebuilt over several visits: terms agreed with him, a notice asking Saltglass for hands, the channel
 * dug and the jetty mended (each finished by the next visit), and the bell he kept hung again; then the boat can put
 * in here. Twelve-chapter journeys only. The scenes are in 20_scenes.js, the tasks in 30_learning.js; the sea's side
 * of it (sailing past before it is rebuilt) in src/content/sea/23_voyage.js.
 *   el_rebuild  0 terms with Genroku · 1 the notice · 2 the channel (the volunteers come; the work is done by the next
 *               visit) · 3 the jetty (likewise) · 4 the bell · done: the port opens (el_done).
 * A job waiting to be finished is `el_pending`; leaving for anywhere else sets `el_away`; coming back finishes it
 * (el.progress). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const J = (jp, en) => ({ jp, en });

  // Genroku: the last keeper of the East Landing, Seto's great-uncle; gruff, stubborn, and still sweeps the jetty
  // that no boat uses (he/him)
  C.chars.el_genroku = {
    name: T('Genroku', 'ゲンロク'), voice: { pitch: 0.7 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#5a5a6a', '#46465a', '#c8b890'], shape: 'robe', acc: ['beard', 'cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', beard: '#d0d0d0', age: 'old', bg: '#24242e' },
  };

  // ---- the landing ---------------------------------------------------------------------------------------------------
  C.maps['el.landing'] = {
    name: T('East Landing', '{東|ひがし} の {渡|わた}し{場|ば}'), region: 'saltglass', place: 'saltglass', music: 'saltglass', edition: 2,
    terrain: K.build(30, 20, 's', (k) => {
      k.rect(0, 0, 30, 3, '^');                       // the headland's cliff
      k.rect(0, 3, 30, 4, '.');                       // the slope
      k.scatter(';', 8, 1201, [0, 3, 30, 4], '.');
      k.path([[0, 12], [17, 12]], ':', 1);            // the old path in from the east beach
      k.path([[17, 8], [17, 12]], ':', 1);
      k.rect(0, 14, 30, 6, '~');                      // the inlet
      k.rect(0, 13, 30, 1, 'w');
      k.rect(18, 10, 2, 8, '_');                      // the old jetty
      k.scatter('h', 4, 1202, [1, 8, 10, 4], 's');
    }),
    structs: [
      { type: 'house', x: 22, y: 4, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0], shut: T('Genroku\'s shack. The door is shut, but the step has been swept.', 'ゲンロク の {小屋|こや} 。 {戸|と} は {閉|し}まって いる が 、 {入|い}り{口|ぐち} は {掃|は}いて ある 。') },
    ],
    props: [
      { p: 'el_silt', x: 14, y: 15, if: '!el_channel' }, { p: 'el_silt', x: 22, y: 16, if: '!el_channel' }, { p: 'el_silt', x: 10, y: 17, if: '!el_channel' },
      { p: 'el_brokenplanks', x: 18, y: 14, if: '!el_jetty' }, { p: 'el_brokenplanks', x: 19, y: 15, if: '!el_jetty' },
      { p: 'pier', x: 18, y: 17, if: 'el_jetty' }, { p: 'pier', x: 19, y: 17, if: 'el_jetty' },
      { p: 'noticeboard', x: 4, y: 10, scene: 'el.board' },
      { p: 'cs_bellpost', x: 20, y: 9, if: 'el_bell', scene: 'el.bell' },
      { p: 'crate', x: 12, y: 9 }, { p: 'barrel', x: 13, y: 9 }, { p: 'bench', x: 24, y: 9 },
      { p: 'boat', x: 6, y: 12 },
    ],
    npcs: [
      { id: 'el_genroku', x: 21, y: 8, dir: 'down', talk: [{ scene: 'el.genroku_idle' }] },
      { id: 'el_daigo', char: 'daigo', x: 11, y: 10, dir: 'right', if: 'el_notice&!el_done', talk: [{ scene: 'el.daigo_idle' }] },
      { id: 'el_sota', char: 'sota', x: 14, y: 12, dir: 'up', if: 'el_notice&!el_done', talk: [{ scene: 'el.sota_idle' }] },
      { id: 'el_hama', char: 'cs_hama', x: 16, y: 9, dir: 'down', if: 'el_notice&!el_done', talk: [{ scene: 'el.hama_idle' }] },
    ],
    exits: [{ x: 0, y: 12, w: 1, h: 1, to: 'sg.harbor', tx: 54, ty: 28, dir: 'left' }],
    onEnter: [{ scene: 'el.progress', if: 'el_pending&el_away', once: false }, { scene: 'el.first', if: '!el_seen' }],
    spawn: { default: [1, 12, 'right'] },
  };
  // the way round from Saltglass's east beach (twelve-chapter journeys)
  C.maps['sg.harbor'].exits.push({ x: 55, y: 28, w: 1, h: 2, to: 'el.landing', tx: 1, ty: 12, dir: 'right', if: 'ed>=2' });

  // the port, once the landing is rebuilt (the boat's prop is added with the others, src/content/sea/01_region.js)
  C.ports = C.ports || {};
  C.ports.eastlanding = { place: 'saltglass', pos: [198, 262], name: T('East Landing', '{東|ひがし} の {渡|わた}し{場|ば}'), if: 'el_done', reach: 'el_done',
    dock: { map: 'el.landing', x: 19, y: 16, dir: 'right' }, boat: { x: 20, y: 16 },
    sea: { x: 34, y: 10, dir: 'down' }, zone: { x: 33, y: 3, w: 4, h: 7 } };

  // ---- the rebuilding ------------------------------------------------------------------------------------------------
  const at = (o, a) => Object.assign(o, { at: a });
  C.quests.el_rebuild = {
    chapter: 'sea', title: J('{東|ひがし} の {渡|わた}し{場|ば} を {建|た}て{直|なお}す', 'Rebuilding East Landing'),
    stages: [
      at(J('ゲンロク は 、 {誰|だれ} に も {渡|わた}し{場|ば} に {触|さわ}らせない と {言|い}う 。 {話|はなし} を {聞|き}いて 、 {約束|やくそく} を {決|き}めよう 。', 'Genroku won\'t let anyone touch the landing. Hear him out and settle terms.'), { map: 'el.landing', npc: 'el_genroku' }),
      at(J('{掲示板|けいじばん} に 、 {手伝|てつだ}い を {頼|たの}む {貼|は}り{紙|がみ} を {出|だ}そう 。', 'Put a notice on the board asking for hands.'), { map: 'el.landing', prop: 'noticeboard', x: 4, y: 10 }),
      J('{貼|は}り{紙|がみ} を {見|み}た {人|ひと} が {来|く}る の は 、 {次|つぎ} の {日|ひ} 。 {来|き}たら 、 {一緒|いっしょ} に {水路|すいろ} を {掘|ほ}ろう 。', 'Whoever reads the notice will come another day. When they do, dig out the channel with them.'),
      J('{次|つぎ} は {桟橋|さんばし} の {板|いた} 。 ハマ と {一緒|いっしょ} に {直|なお}そう 。', 'Next, the jetty\'s planks: mend them with Hama.'),
      at(J('ゲンロク が 、 {見|み}せたい もの が ある と {言|い}う 。', 'Genroku has something he wants to show you.'), { map: 'el.landing', npc: 'el_genroku' }),
    ],
    reward: { flags: ['el_rebuild_done'] },
  };
  // stages 2 and 3: the volunteers once they have come, the landing itself while you wait for them
  C.quests.el_rebuild.stages[2].at = [{ map: 'el.landing', npc: 'el_daigo' }];
  C.quests.el_rebuild.stages[3].at = [{ map: 'el.landing', npc: 'el_hama' }];
  C.questOnly = C.questOnly || {};
  C.questOnly.el_rebuild = 'ed>=2';

  const npc = (id) => C.maps['el.landing'].npcs.find((n) => n.id === id);
  npc('el_genroku').talk.unshift(
    { if: 'item.sea_mailbag&!sea_post_el', scene: 'el.genroku_post' },
    { if: 'quest.el_rebuild=4', scene: 'el.genroku_bell' },
    { if: 'quest.el_rebuild=0', scene: 'el.genroku_terms' },
    { if: '!quest.el_rebuild', scene: 'el.genroku_first' },
    { if: 'el_done', scene: 'el.genroku_after' });
  npc('el_daigo').talk.unshift({ if: 'quest.el_rebuild=2&!el_pending', scene: 'el.channel' }, { if: 'el_pending', scene: 'el.wait' });
  npc('el_hama').talk.unshift({ if: 'quest.el_rebuild=3&!el_pending', scene: 'el.jetty' }, { if: 'el_pending', scene: 'el.wait' });

  // leaving the landing while a job is waiting: coming back finishes it (el.progress)
  RB.bus && RB.bus.on && RB.bus.on('map:enter', (e) => {
    const s = RB.game && RB.game.s;
    if (s && s.flags && s.flags.el_pending && e && e.id !== 'el.landing') s.flags.el_away = true;
  });
})(RB.content, RB.mapkit);
