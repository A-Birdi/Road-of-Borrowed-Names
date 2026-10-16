/* Item icons: Steamhollow (yn_), the Living World's keepsakes (lw_) and the Unwritten Atlas's rewards (atlas_).
 * 16×16 authored pixel tables (src/ui/11_item_art.js): '.' clear, 'o' the shared outline ink; light from the upper
 * left; one shade and one highlight, no dithering noise. The keepsakes follow their 32×32 catalogue drawings
 * (src/content/zzzz_keepsakes/00_items.js); the Atlas cosmetics follow the accessories the figures wear
 * (src/engine/32k_spriteacc.js, src/engine/35_portraits.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (D) {
  'use strict';
  // ---- Steamhollow -------------------------------------------------------------------------------------------------
  // Rokubei's letter, up the relay: the written sheet drawn half out of its kraft envelope, a red stamp in the corner
  D('yn_letter', {
    pal: { w: '#fbf7ec', k: '#3a3036', l: '#e8c690', b: '#d4a86c', n: '#ac8048', r: '#b0402c' },
    px: [
      '................',
      '....oooooooo....',
      '....owwwwwwo....',
      '....owkkkkwo....',
      '....owwwwwwo....',
      '....owkkkwwo....',
      '....owwwwwwo....',
      '..oooooooooooo..',
      '..olllllllllno..',
      '..olbbbbbbrrno..',
      '..olbbbbbbrrno..',
      '..olbbbbbbbbno..',
      '..olbbbbbbbbno..',
      '..onnnnnnnnnno..',
      '..oooooooooooo..',
      '................',
    ],
  });
  // the inn's tenugui hung over a bamboo rail: white cotton, the Upper House's ring crest, indigo bands at the hem
  D('yn_towel', {
    pal: { w: '#f6f3ea', s: '#c6cad4', i: '#34477e', j: '#24325c', g: '#a08a4a' },
    px: [
      '................',
      '...ooooooooo....',
      '.oowwwwwwwwsooo.',
      'ogowwwwwwwwsoggo',
      '.oosssssssssooo.',
      '..owwwwwwwwsoso.',
      '..owwwiiwwwsoso.',
      '..owwiwwiwwsoso.',
      '..owwiwwiwwsoso.',
      '..owwwiiwwwsoso.',
      '..owwwwwwwwsoso.',
      '..oiiiiiiiijoso.',
      '..owwwwwwwwsoso.',
      '..oiiiiiiiijoso.',
      '..ooooooooooooo.',
      '................',
    ],
  });
  // the inn's lent yukata: indigo cotton with white steam curls, a light obi, worn left over right
  D('yn_yukata', {
    pal: { m: '#3c4c80', l: '#566aa4', n: '#2a3660', c: '#eeeadc', y: '#d8c8a0', w: '#dce4f2' },
    px: [
      '................',
      '.....oooooo.....',
      '.oooooccccooooo.',
      '.ollmmcnncmmmno.',
      '.olmmmmccmmwmno.',
      '.olmmmmcmmmmwno.',
      '.olmomcmmmmomno.',
      '.owmocmmmmmomno.',
      '.olwoyyyyyyomno.',
      '.olmoyyyyyyomno.',
      '.oooommmmmmoooo.',
      '....olmmmmno....',
      '....ommwmmno....',
      '....ommmwmno....',
      '....oooooooo....',
      '................',
    ],
  });
  // the guild's water ledger: a stitched Japanese account book, water-blue cover, a title slip, the binding thread
  D('yn_ledger', {
    pal: { b: '#5a82a8', l: '#7aa2c4', n: '#3e6488', w: '#f4ecd8', k: '#3a3036', q: '#c8b890' },
    px: [
      '................',
      '...oooooooooo...',
      '...ollllllwno...',
      '...olwwwbbwwo...',
      '...olwkwbbwno...',
      '...olwwwbbwno...',
      '...olwkwbbwwo...',
      '...olwwwbbwno...',
      '...olwkwbbwno...',
      '...olbbbbbwwo...',
      '...olbbbbbwno...',
      '...onnnnnnwno...',
      '...oooooooooo...',
      '...owwwwwwwqo...',
      '...oqqqqqqqqo...',
      '...oooooooooo...',
    ],
  });
  // the spring agreement: a sheet folded once and opened, written in columns, four red seals (two houses, guild, town)
  D('yn_agreement', {
    pal: { p: '#f4ecd6', s: '#d8cba8', k: '#4a3e44', r: '#b0382a', h: '#e0705a' },
    px: [
      '................',
      '................',
      '.oooooooooooooo.',
      '.oppppppsssssso.',
      '.opkpkppsskskso.',
      '.opkpkppsskskso.',
      '.opppkppsssskso.',
      '.opkppppsskskso.',
      '.oppppppsssssso.',
      '.ohrphrpshrshro.',
      '.orrprrpsrrsrro.',
      '.oppppppsssssso.',
      '.oooooooooooooo.',
      '................',
      '................',
      '................',
    ],
  });
  // spring buns: three steamed brown buns sitting in a little pale wooden box
  D('yn_buns', {
    pal: { b: '#b06a38', h: '#d08c50', n: '#844a26', l: '#ecd0a0', w: '#d8b07a', d: '#a87e4a' },
    px: [
      '................',
      '................',
      '................',
      '......oooo......',
      '.ooo.ohhhbo.ooo.',
      'ohbbohbbbbnobbno',
      'obbnobbbbnnobnno',
      'oooooooooooooooo',
      'ollllllllllllldo',
      'owwwwwwwwwwwwwdo',
      'owwwwwwwwwwwwwdo',
      'oddddddddddddddo',
      'oooooooooooooooo',
      '................',
      '................',
      '................',
    ],
  });
  // spring eggs: three white eggs in a bamboo basket with a hoop handle, as they hang in the steam box
  D('yn_eggs', {
    pal: { e: '#f8f2e4', h: '#ffffff', s: '#d8ccb0', y: '#c8a860', z: '#9a7a3a', r: '#e0c888' },
    px: [
      '................',
      '.....oooooo.....',
      '...ooyyyyyyoo...',
      '..oyyooooooyyo..',
      '.oyo..oheo..oyo.',
      'oyoo.oheeeo.ooyo',
      '.oheooeeesooeeo.',
      'oheeeoeeesoeeeso',
      'oeeesoeessoeesso',
      'oooooooooooooooo',
      'orrrrrrrrrrrrrro',
      '.oyyzyyzyyzyyzo.',
      '..ozzzzzzzzzzo..',
      '...oooooooooo...',
      '................',
      '................',
    ],
  });
  // ---- the Living World's keepsakes --------------------------------------------------------------------------------
  // the iroha print (as its keepsake): a tall cream sheet, columns of kana, the press's red seal at the foot
  D('lw_iroha_print', {
    pal: { h: '#fff8e4', p: '#f4ecd0', s: '#d8ccac', k: '#3a3036', r: '#b83a2e', e: '#e8806a' },
    px: [
      '................',
      '...oooooooooo...',
      '...ohhhhhhhho...',
      '...oppkpkpkso...',
      '...oppkpppkso...',
      '...oppppkppso...',
      '...oppkpkpkso...',
      '...oppkpppkso...',
      '...oppppkppso...',
      '...oppkpkpkso...',
      '...oerppppkso...',
      '...orrppkppso...',
      '...opppppppso...',
      '...osssssssso...',
      '...oooooooooo...',
      '................',
    ],
  });
  // the tide-stone rubbing (as its keepsake): charcoal on paper, the calendar's ring, a notch for each tide
  D('lw_ko_tiderubbing', {
    pal: { p: '#ece4d0', c: '#4a4650', g: '#a8a4b0' },
    px: [
      '................',
      '................',
      '.oooooooooooooo.',
      '.oggpppcppppppo.',
      '.oppcppppppcppo.',
      '.oppppccccppppo.',
      '.opppcppppcpppo.',
      '.opppcpccpcpcpo.',
      '.opcpcpccpcpppo.',
      '.opppcppppcpppo.',
      '.oppppccccppppo.',
      '.oppcppppppcppo.',
      '.oppppppcpppggo.',
      '.oooooooooooooo.',
      '................',
      '................',
    ],
  });
  // the "Fish Street" name slip (as its keepsake): a narrow slip on its string, inked, a corner torn on a thorn
  D('lw_sa_slip', {
    pal: { t: '#8a7a5a', p: '#f0e6cc', s: '#c8bca0', k: '#4a3a40', v: '#6a5032' },
    px: [
      '.......t........',
      '.......t........',
      '......otoo......',
      '.....opppso.....',
      '.....opkkso.....',
      '.....oppkso.....',
      '.....opppso.....',
      '.....opkkso.....',
      '.....opkpso.....',
      '.....opppso...o.',
      '.....opkkso.oovo',
      '.....oppksoovvo.',
      '.....opppoovoo..',
      '.....oppoovo....',
      '......oo..o.....',
      '................',
    ],
  });
  // ---- the Unwritten Atlas's charms --------------------------------------------------------------------------------
  // the reed knot: a green reed looped and crossed, its two ends hanging
  D('atlas_charm_reed', {
    pal: { l: '#c4d47a', g: '#8aa048', d: '#5a7030' },
    px: [
      '................',
      '.....oooooo.....',
      '....olllllgo....',
      '...ollooooggo...',
      '...olo....ogo...',
      '...olo....ogo...',
      '...olgo..ogdo...',
      '....olgoogdo....',
      '.....olggdo.....',
      '.....ogdlgo.....',
      '....oldooldo....',
      '...oldo..oldo...',
      '..oldo....oldo..',
      '..olo......olo..',
      '..oo........oo..',
      '................',
    ],
  });
  // the tide-glass: a sea-green glass drop on a brass cap, the tide held inside it
  D('atlas_charm_tide', {
    pal: { m: '#c8a858', l: '#c4f0e6', w: '#ffffff', a: '#6cc4bc', d: '#3a8a90', b: '#2e6a9a' },
    px: [
      '.......oo.......',
      '......oooo......',
      '......ommo......',
      '......olwo......',
      '.....olwaao.....',
      '....olwaaaao....',
      '....olwaaado....',
      '...ollaaaaado...',
      '...olaaaaaado...',
      '...owwwwwwwwo...',
      '...obbbbbbbdo...',
      '....obbbbbdo....',
      '.....obbddo.....',
      '......oooo......',
      '................',
      '................',
    ],
  });
  // the blank bookmark: a white strip with nothing written on it, cut to a swallowtail, a violet cord and tassel
  D('atlas_charm_page', {
    pal: { w: '#fbfaf2', s: '#d0d6e0', t: '#8a4ab8', u: '#743c9e', q: '#b07ad8' },
    px: [
      '................',
      '........tt......',
      '.......t..too...',
      '.....ootooouuo..',
      '....owwtwsoquuo.',
      '....owwowsoquuo.',
      '....owwwwsoquuo.',
      '....owwwwsoqouo.',
      '....owwwwsoo.o..',
      '....owwwwso.....',
      '....owwwwso.....',
      '....owwwwso.....',
      '....owwwwso.....',
      '....owwowso.....',
      '....owo.oso.....',
      '.....o...o......',
    ],
  });
  // the mirror shard: a jagged sliver of silvered glass with a bright streak of reflection
  D('atlas_charm_mirror', {
    pal: { l: '#e6eef6', m: '#b4c4d6', d: '#7c8ca4', w: '#ffffff', b: '#8eb4dc' },
    px: [
      '.........o......',
      '........owo.....',
      '.......olwo.....',
      '.......olwmo....',
      '......ollwmo....',
      '......olwmmdo...',
      '.....ollwmbdo...',
      '.....olwmbmddo..',
      '....ollwmbwmdo..',
      '....olwmmwbmddo.',
      '...ollwmwmmmmdo.',
      '...olwmwmmmddo..',
      '..ollwmmmddoo...',
      '..oddodddoo.....',
      '...oo.ooo.......',
      '................',
    ],
  });
  // ---- the Unwritten Atlas's cosmetics -----------------------------------------------------------------------------
  // the map-paper sash, tied as it is worn at the hip: a bow of map paper (a river, a red road), its ends hanging
  D('atlas_cos_sash', {
    pal: { s: '#d8c89a', l: '#ece0b8', d: '#b4a274', r: '#b0402c', b: '#4a7ab0' },
    px: [
      '................',
      '.oo..........oo.',
      'olsoo......oosdo',
      'olssboooooosssdo',
      'olsbssdlddrsssdo',
      'olsbssddddsrssdo',
      'olbsssddddssssdo',
      'olsssddddddssrdo',
      'odssdosdsdodssdo',
      'oddoosdoosdooddo',
      '.oo.osdoosdo.oo.',
      '...osdo..osdo...',
      '...oso....odo...',
      '....o......o....',
      '................',
      '................',
    ],
  });
  // the compass-rose pin: four gold points round a blue heart
  D('atlas_cos_pin', {
    pal: { l: '#fff0a8', g: '#e8c860', d: '#a8842c', b: '#3a5a8a', c: '#8ab0e0' },
    px: [
      '.......o........',
      '......olo.......',
      '......olo.......',
      '.....ollgo......',
      '.....ollgo......',
      '...oolggggoo....',
      '.oollgcbbgggoo..',
      'ollllgbbbgggddo.',
      '.oogggbbbdddoo..',
      '...oogggddoo....',
      '.....oggdo......',
      '.....oggdo......',
      '......ogo.......',
      '......ogo.......',
      '.......o........',
      '................',
    ],
  });
  // the little lantern: a paper chochin still lit, dark cap and foot, hung from its hook
  D('atlas_cos_lamplet', {
    pal: { y: '#ffd27a', h: '#fff0b8', a: '#e8a040', k: '#3a3440', i: '#8a8490' },
    px: [
      '.......ii.......',
      '.....ooiioo.....',
      '....okkkkkko....',
      '...ohhyyyyyao...',
      '..ohhyyyyyyyao..',
      '..oaaaaaaaaaao..',
      '..ohhyyyyyyyao..',
      '..ohyyyyyyyyao..',
      '..oaaaaaaaaaao..',
      '..ohhyyyyyyyao..',
      '...ohyyyyyaao...',
      '....okkkkkko....',
      '.....oooooo.....',
      '................',
      '................',
      '................',
    ],
  });
  // the quill: a long white feather cut to a nib, the cartographer's pen worn behind the ear
  D('atlas_cos_quill', {
    pal: { w: '#f4f0e0', v: '#d8d0bc', q: '#b8a88a', n: '#6a5a3a', k: '#3a3036' },
    px: [
      '............oo..',
      '..........oowwo.',
      '.........owwqvo.',
      '........owwqvvo.',
      '.......owwqvvvo.',
      '......owwqvvvo..',
      '.....owwqvvvo...',
      '....owwqvvvo....',
      '...owwqvvoo.....',
      '...owqvvo.......',
      '...oqvoo........',
      '..oqoo..........',
      '.ono............',
      'oko.............',
      '.o..............',
      '................',
    ],
  });
  // the pressed road-flower: a flattened pale blue five-petalled flower on its stem
  D('atlas_cos_flower', {
    pal: { p: '#9fb6ea', l: '#c8d8f6', d: '#6a84c0', y: '#f0d060', g: '#5a8a42', h: '#8ab868' },
    px: [
      '......oooo......',
      '....oolpppoo....',
      '...ololpppopo...',
      '..olldppppdppo..',
      '..olpppyypppdo..',
      '..olpppyypppdo..',
      '...odppppppdo...',
      '..olpppddpppdo..',
      '...opppgoppdo...',
      '....opdgoddo....',
      '.....oogooo.....',
      '....ohhgo.......',
      '.....ohgoo......',
      '......oghho.....',
      '......ogho......',
      '.......oo.......',
    ],
  });
  // the traveller's cape: a slate-green hooded cape, fastened at the throat with a gold clasp
  D('atlas_cos_cape', {
    pal: { c: '#51666e', l: '#6e8690', d: '#3a4a52', g: '#e8c860', n: '#8a4a3a' },
    px: [
      '......oooo......',
      '.....olccdo.....',
      '....olcccddo....',
      '....olcccddo....',
      '...ooddggddoo...',
      '..ollccnnccddo..',
      '..olcccnnccddo..',
      '.ollcccnncccddo.',
      '.olccdcnncdcddo.',
      '.olccdcnncdcddo.',
      'ollccdcnncdccddo',
      'olcccdcnncdccddo',
      'olcccdcnncdccddo',
      'olcccdcnncdccddo',
      'olcccdcnncdccddo',
      '.oooooooooooooo.',
    ],
  });
  // the cartographer's compass: a brass case on its ring, a pale face, the red needle pointing north
  D('atlas_cos_compass', {
    pal: { h: '#fff0a8', g: '#e8c860', d: '#a8842c', f: '#f4ecd0', r: '#c0402a', k: '#3a3440' },
    px: [
      '......oggo......',
      '.....ogoogo.....',
      '......oggo......',
      '......oooo......',
      '.....ohhggo.....',
      '....ohffffgo....',
      '...ohffrrffdo...',
      '..ohfffrrfffdo..',
      '..ohdffrrffddo..',
      '..ohdffkkffddo..',
      '..ogfffkkfffdo..',
      '...ogffkkffdo...',
      '....ogffffdo....',
      '.....oddddo.....',
      '......oooo......',
      '................',
    ],
  });
})(RB.itemArt.def);
