// Quick travel (src/engine/52_travel.js): where the Map tab's Travel list
// works, and what it says where it doesn't.
// - Every map is classified: open, or `noTravel` with a kind (interior,
//   dungeon) or an authored reason (story, expedition) — including the
//   Unwritten Atlas's generated maps. No map has noTravel without one.
// - The classification itself: the owner's beach (the Fishers' Cove) and the
//   other open-air maps that used to be closed are open; buildings are
//   interiors; dungeons name the whole place; two story locks remain.
// - The rule the validator applies (RB.travel.problems, called for every map
//   by tools/validate.mjs): unclassified maps, reasons without English,
//   travel fields on open maps, interiors left open, unknown kinds, and any
//   Japanese in a reason with a kanji outside furigana are rejected.
// - The messages, in the place's own terms, with the way out found through
//   the exits usable in the state at hand; "under way" during a conversation.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, TR = RB.travel;
  const kinds = ['open'].concat(TR.KINDS);

  // ---- 1. every map is classified ---------------------------------------------------------------
  const by = {};
  for (const id in C.maps) {
    const def = C.maps[id], k = TR.kindOf(def);
    t.eq(TR.problems(id, def), [], id + ': travel fields are complete');
    t.ok(kinds.includes(k), id + ': classified (' + k + ')');
    (by[k] = by[k] || []).push(id);
  }
  t.log('maps: ' + Object.keys(by).map((k) => k + ' ' + by[k].length).join(', '));
  const unclassified = Object.keys(C.maps).filter((id) => C.maps[id].noTravel && !TR.kindOf(C.maps[id]));
  t.eq(unclassified, [], 'no map has noTravel without a kind or a reason');

  // the Unwritten Atlas's generated rooms: an expedition with its own reason
  const s0 = RB.state.newCampaign({ profile: 'E' });
  s0.comp = 'ren'; s0.flags.postgame = true;
  RB.game.s = s0;
  const run = RB.atlas.newRun(s0, [], { seed: 4242 });
  const gen = RB.atlas.buildMaps(run).maps;
  const genIds = Object.keys(gen);
  t.ok(genIds.length > 5, 'an expedition builds its rooms (' + genIds.length + ')');
  t.ok(genIds.every((id) => TR.kindOf(gen[id]) === 'expedition' && !TR.problems(id, gen[id]).length && /Unwritten Atlas/.test(gen[id].noTravelWhy.en)), 'every expedition room is an expedition lock with its reason');

  // ---- 2. the classification -----------------------------------------------------------------------
  const kindIs = (ids, k) => { for (const id of ids) t.eq(TR.kindOf(C.maps[id]), k, id + ' is ' + k); };
  // open air: the owner's beach and the other outdoor maps that used to be closed, plus the towns
  kindIs(['sg.cove', 'co.upper', 'co.oldworks', 'co.lookout', 'sb.obs_path', 'sg.harbor', 'rw.village', 'rw.millroad', 'sa.gate', 'lq.koharu'], 'open');
  // buildings, whichever helper made them
  kindIs(['rw.hall', 'sg.tidehut', 'sg.office', 'sg.lighthouse', 'co.hall', 'co.icehouse', 'sb.inn', 'sb.inn_room', 'lf.records', 'lf.tokuji', 'sa.hut', 'lq.koharu_hut'], 'interior');
  t.ok(Object.keys(C.maps).filter((id) => C.maps[id].region === 'interior').every((id) => TR.kindOf(C.maps[id]) === 'interior'), 'every map in the interior region is an interior');
  // dungeons, each named as a whole
  const site = { 'rw.mill1': 'the Old Mill', 'rw.mill0': 'the Old Mill', 'rw.mill2': 'the Old Mill', 'sg.da_entry': 'the Drowned Archive', 'sg.da_vault': 'the Drowned Archive', 'co.kiln': 'the Great Kiln', 'co.kiln_core': 'the Great Kiln', 'sb.obs_hall': 'the Observatory', 'sb.obs_dome': 'the Observatory', 'lf.stacks': 'the Basement Stacks', 'lf.tower_top': 'the bell tower', 'lf.bellhall': 'the bell tower', 'sa.reading': 'the Still Archive', 'sa.heart': 'the Still Archive' };
  for (const id in site) { t.eq(TR.kindOf(C.maps[id]), 'dungeon', id + ' is a dungeon'); t.eq(TR.placeIn(C.maps[id]), site[id], id + ' is named ' + site[id]); }
  t.eq((by.story || []).sort(), ['co.eve', 'co.festival'], 'the story locks are the dusk assembly and the festival night');
  t.eq(by.expedition || [], [], 'no authored map is an expedition (only the Atlas generates them)');

  // ---- 3. the validator's rule (synthetic maps) -----------------------------------------------------
  const P = (def) => TR.problems('x', def).join(' | ');
  t.ok(/without a kind/.test(P({ noTravel: true })), 'noTravel alone is rejected: ' + P({ noTravel: true }));
  t.eq(P({ noTravel: true, travelKind: 'dungeon' }), '', 'a dungeon kind is enough');
  t.eq(P({ noTravel: true, noTravelWhy: { en: 'Not tonight.' } }), '', 'an authored reason is enough');
  t.ok(/Kanji without furigana/.test(P({ noTravel: true, noTravelWhy: { en: 'Tonight is the festival.', jp: '{今夜|こんや} は 祭り だ 。' } })), 'a reason whose Japanese has a kanji without furigana is rejected');
  t.ok(/Kanji without furigana/.test(P({ noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the Archive', jp: '書庫' } })), 'the same for a place name');
  t.eq(P({ noTravel: true, noTravelWhy: { en: 'Tonight is the festival.', jp: '{今夜|こんや} は {祭|まつ}り だ 。' } }), '', 'with furigana it passes');
  t.ok(/needs English/.test(P({ noTravel: true, noTravelWhy: 'Not tonight.' })) && /needs English/.test(P({ noTravel: true, noTravelWhy: { jp: 'だめ' } })), 'a reason must be { en }');
  t.ok(/without its reason/.test(P({ noTravel: true, travelKind: 'expedition' })) && /without its reason/.test(P({ noTravel: true, travelKind: 'story' })), 'story and expedition locks need their reason');
  t.ok(/unknown travelKind/.test(P({ noTravel: true, travelKind: 'castle' })), 'an unknown kind is rejected');
  t.ok(/where travel works/.test(P({ travelKind: 'interior' })) && /where travel works/.test(P({ noTravel: false, noTravelWhy: { en: 'x' } })), 'travel fields on an open map are rejected');
  t.ok(/an interior where travel works/.test(P({ region: 'interior' })), 'an interior left open is rejected');

  // ---- 4. the messages ---------------------------------------------------------------------------------
  const st = (flags) => { const s = RB.state.newCampaign({ profile: 'E' }); Object.assign(s.flags, flags || {}); s.comp = 'mio'; RB.game.s = s; return s; };
  const msg = (map, flags) => { const s = st(flags); s.map = map; return TR.status(map); };
  t.eq(msg('sg.tidehut').en, 'You\'re inside the Tide-Watch Hut. Step out through the door to travel.', 'a one-door hut');
  t.eq(msg('rw.ferry').en, 'You\'re inside Kōji\'s Ferry House. Step out through the door to travel.', 'a house named for its owner takes no article');
  t.eq(msg('sg.warehouse').en, 'You\'re inside No. 2 Warehouse. Step out through the door to travel.', 'a numbered building takes no article');
  t.eq(msg('sg.inn').en, 'You\'re inside the Gull. Step out through the door to travel.', '"The Gull" reads "the Gull" mid-sentence');
  t.eq(msg('sb.inn', { sb_lamp_lit: true }).en, 'You\'re inside the Yukimiya Inn. Step outside to travel — the nearest way out leads to Snowbell.', 'an inn with stairs as well as its door');
  t.eq(msg('sb.inn', { sb_storm: true }).en, 'You\'re inside the Yukimiya Inn, and there\'s no way out just now. Travel works again once you can step outside.', 'the storm keeps everyone in');
  t.eq(msg('sb.inn_room', { sb_lamp_lit: true }).en, 'You\'re inside the upstairs room at Yukimiya. Step outside to travel — the nearest way out leads to Snowbell.', 'upstairs: its own wording, and the way out two maps away');
  t.eq(msg('sg.da_vault').en, 'You\'re in the Drowned Archive. Travel works again once you\'re back out in the open — the way out leads to Saltglass.', 'the deepest room of the Drowned Archive: the way out by the exits open now');
  t.eq(msg('co.kiln_core').en, 'You\'re in the Great Kiln. Travel works again once you\'re back out in the open — the way out leads to the Old Workshop Row.', 'the Great Kiln: out to the workshop row (open air)');
  t.eq(msg('sb.obs_dome').en, 'You\'re in the Observatory. Travel works again once you\'re back out in the open — the way out leads to the Star Stair.', 'the Observatory: out to the Star Stair');
  t.eq(msg('rw.mill2').en, 'You\'re in the Old Mill. Travel works again once you\'re back out in the open — the way out leads to the Mill Road.', 'the Old Mill\'s loft');
  t.eq(msg('co.festival').en, C.maps['co.festival'].noTravelWhy.en, 'a story lock says its own reason');
  t.ok(/fire lookout/.test(msg('co.festival').en), 'and where to go');
  // every closed map says something in its own terms; every open one says nothing about the place
  for (const id in C.maps) {
    const r = msg(id), k = TR.kindOf(C.maps[id]);
    if (k === 'open') continue;
    t.ok(!r.ok && r.en && !/undefined|null|\bthe the\b|this place/i.test(r.en), id + ': "' + r.en + '"');
  }
  // under way: the folio over the world only (src/ui/50_menu.js opens it over the world or a conversation)
  const G = RB.game.G;
  st({}); RB.game.s.map = 'sg.cove';
  G.modes = ['world', 'menu'];
  t.eq(TR.status('sg.cove'), { ok: true, kind: 'open', en: '' }, 'the cove, nothing under way: travel works');
  G.modes = ['world', 'dialogue', 'menu'];
  t.eq(TR.status('sg.cove').kind, 'scene', 'over a conversation: not now');
  t.eq(TR.status('sg.cove').en, 'A conversation is under way. Travel works again once it\'s over.', 'and it says so');
  G.modes = ['world', 'activity', 'menu'];
  t.eq(TR.status('sg.cove').kind, 'busy', 'over anything else: not now');
  G.modes = ['world', 'dialogue', 'menu'];
  t.eq(TR.status('sg.tidehut').kind, 'interior', 'a closed place says why it is closed, even over a conversation');
  G.modes = [];
};
