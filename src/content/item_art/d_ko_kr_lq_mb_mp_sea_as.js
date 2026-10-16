/* Item icons: Kotonoha (ko_), the Keepers' Road (kr_), the two long roads (lq_), Manybridge (mb_, mp_), the open sea
 * (sea_) and Ashihara Shinden (as_). 16×16 authored pixel tables (src/ui/11_item_art.js): '.' clear, 'o' the shared
 * outline ink; light from the upper left; one shade and one highlight, no dithering noise. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (D) {
  'use strict';
  // ---- Kotonoha ----------------------------------------------------------------------------------------------
  // The island's written leaves are the great camphor's (src/content/ko/02_art.js). Each one here is told apart by the
  // way it lies, its colour and what its words are about.

  // "Sweet dumplings today": a gold leaf lying up to the right, a skewer of pink, white and green dango painted down it
  D('ko_leaf_rw', {
    pal: { l: '#e8c868', g: '#d0a844', d: '#a8822e', v: '#7a5a1e', p: '#e8909e', w: '#fbf6ea', n: '#7aa84a' },
    px: [
      '................',
      '............ooo.',
      '.........ooollo.',
      '.......oolgvgdo.',
      '......olgppggdo.',
      '.....olggppgddo.',
      '....olgwwgggdo..',
      '...olggwwggddo..',
      '..olgnngggddo...',
      '..olgnnggddo....',
      '..olvgggdddo....',
      '.olvggdddoo.....',
      '.ovgdddoo.......',
      '.vooooo.........',
      'v...............',
      '................',
    ],
  });
  // "Fragile: take care": a pale yellow-green leaf lying low, tip rising, a crate's red stencil of a cracked glass
  D('ko_leaf_sg', {
    pal: { l: '#e8dc94', g: '#c8b85e', d: '#9a8a3a', v: '#6a6026', r: '#b83a2a' },
    px: [
      '................',
      '................',
      '............oo..',
      '.........ooollo.',
      '.......oolllgvgo',
      '.....oollggvvdo.',
      '....orrrrrvgdo..',
      '...olrrgrrgdo...',
      '..olggrrrgdo....',
      '.olgvvgrddo.....',
      '.ogvddrrro......',
      '..vddddoo.......',
      '.v.oooo.........',
      'v...............',
      '................',
      '................',
    ],
  });
  // "Baggage here": a broad pale leaf standing up, a porter's strapped trunk painted on it in bold black, the way a
  // board for people in a hurry says it
  D('ko_leaf_mb', {
    pal: { l: '#f8eab0', g: '#ecd27c', d: '#c4a048', v: '#8a6a2a', k: '#231c28', b: '#c89a48' },
    px: [
      '.........o......',
      '........olo.....',
      '......oolvgo....',
      '.....ollvgggo...',
      '....olggvgggdo..',
      '...olgggvgggdo..',
      '..olggkkkkggdo..',
      '..olggkggkggdo..',
      '..olkkkkkkkkdo..',
      '..olkbkbbkbkdo..',
      '..olkbkbbkbkdo..',
      '..ogkkkkkkkkdo..',
      '...ogggvdddoo...',
      '....ogvddoo.....',
      '.....ovoo.......',
      '.....v..........',
    ],
  });
  // "Full house, with thanks": a red camphor leaf lying up to the left, one fat festive character on it (大, as in a
  // full house's 大入り)
  D('ko_leaf_mp', {
    pal: { l: '#ec7a4c', g: '#c8462a', d: '#902c1c', v: '#5e2216', k: '#1a1014' },
    px: [
      '................',
      '..oo............',
      '.oglooo.........',
      '.odvllloo.......',
      '.odgvglllo......',
      '.oddgggkglo.....',
      '..odgkkkkklo....',
      '..oddggkggllo...',
      '...oddkgkggllo..',
      '....okddgkgglo..',
      '....odddggvglo..',
      '.....ooddggvglo.',
      '.......oodddvgo.',
      '.........ooooov.',
      '...............v',
      '................',
    ],
  });
  // "Dried persimmons": a russet leaf hung tip-down on a red string like a rack's tag, small careful writing on it
  D('ko_leaf_co', {
    pal: { r: '#b8302a', l: '#e8a868', g: '#c87a3c', d: '#985024', v: '#6a3418', k: '#2a1810' },
    px: [
      '.....rrr........',
      '....r...r.......',
      '.....r.r........',
      '......v.........',
      '.....ovo........',
      '....olvgo.......',
      '...olggvgo......',
      '...olggvgdo.....',
      '...olgkkvgdo....',
      '....olggvgdo....',
      '....olgkkvgdo...',
      '.....olggvgdo...',
      '......olgkvdo...',
      '.......oggvdo...',
      '........oogdo...',
      '..........oo....',
    ],
  });
  // "I'll be home in spring": a cream leaf lying down to the right, one broken line in a letter-writer's blue-black
  // hand, a plum blossom above it
  D('ko_leaf_sb', {
    pal: { l: '#fff8e4', g: '#efdfb0', d: '#c9b07c', v: '#9a8050', k: '#30508e', p: '#f2a0b8', P: '#c84a6a' },
    px: [
      '.............o..',
      '.v..........opo.',
      '..voooo....opPpo',
      '..ovllloo...opo.',
      '.oggvgklloo..o..',
      '..odgvgkgllo....',
      '..oddgvggglo....',
      '..oddggvgkglo...',
      '...oddggvgkglo..',
      '....oddggvgggo..',
      '.....oddggvgklo.',
      '......oddggvggo.',
      '.......ooddgvgo.',
      '.........ooodgo.',
      '............oo..',
      '................',
    ],
  });
  // "The Pass Light": a dark bronze leaf standing up, its characters cut through like a lantern's plate and the light
  // showing through them (a mountain over a flame)
  D('ko_leaf_kr', {
    pal: { l: '#b09058', g: '#7e6036', d: '#56401e', v: '#3a2a14', y: '#ffd060', w: '#fff6c8' },
    px: [
      '......oo........',
      '.....olgo.......',
      '....olggdo......',
      '...olggygdo.....',
      '...olygygydo....',
      '..olgygygydo....',
      '..olgyyyyygdo...',
      '..olgggvgggdo...',
      '..olggggyggdo...',
      '...olggywygdo...',
      '...olggywyddo...',
      '....olggyddo....',
      '.....oggvddo....',
      '......odvdo.....',
      '.......ovo......',
      '........v.......',
    ],
  });
  // "Against": the dried grey-brown leaf that came in Ōmi's letter (the envelope beside it), one word in a thin hand
  D('ko_leaf_lf', {
    pal: { l: '#d8c8a4', g: '#b0986c', d: '#86704c', v: '#5e4c32', k: '#22223c', p: '#f8f2e4', s: '#b8b0a0' },
    px: [
      '................',
      '...............v',
      '.........ooooov.',
      '.......oolllgvo.',
      '.....oollkggvdo.',
      '....olgggggvdo..',
      '....olgkggvddo..',
      '...olgkggvgddo..',
      '..olggggvgddo...',
      '..olkggvgddo....',
      '.olgggvgddoooooo',
      '.olggvdddoosppso',
      '.oggvddoo.opsspo',
      '.ogvooo...oppppo',
      '..oo......oooooo',
      '................',
    ],
  });
  // the leaf with your name: a fresh green leaf, the name written down it, a glint of gold about it
  D('ko_myleaf', {
    pal: { l: '#b4d47a', g: '#78a848', d: '#4a7a30', v: '#2e5420', k: '#1e2a30', y: '#e8b830', w: '#fffbe8' },
    px: [
      '................',
      '...y........ooo.',
      '..ywy....ooollo.',
      '...y...oolgkgdo.',
      '......olggkggdo.',
      '.....olggvggddo.',
      '....olggkgggdo..',
      '...olggkgggddo..',
      '..olggvgggddo...',
      '..olgkgggddo....',
      '..olkgggdddo....',
      '.olvggdddoo..y..',
      '.ovgdddoo...ywy.',
      '.vooooo......y..',
      'v...............',
      '................',
    ],
  });
  // Kihei's letter: a sea-stained leaf from the cave, lying up to the left, rows of a sailor's careful writing on it,
  // still dripping
  D('ko_kihei_letter', {
    pal: { l: '#a8ccb4', g: '#6e9c88', d: '#46705e', v: '#2c4a3e', k: '#16202a', b: '#3e88c8', B: '#a8dcf4' },
    px: [
      '................',
      '..oo............',
      '.ollooo.........',
      'ogvllkloo.......',
      '.odvvkgkloo.....',
      '..odgvvkgklo....',
      '...odkgvvkgko...',
      '....okdkgvvklo..',
      '.....odkgkgvvlo.',
      '......oddkgggvo.',
      '.......ooddddov.',
      '.....b...oooo..v',
      '....Bbb.........',
      '....bbb..b......',
      '.....b..Bb......',
      '................',
    ],
  });

  // ---- the Keepers' Road -------------------------------------------------------------------------------------
  // Iwa's stamp book: a folding book of shrine seals standing open, brocade cover at one end, red seals on the pages
  D('kr_stampbook', {
    pal: { c: '#3a3e78', C: '#5a5ea0', y: '#d8b048', p: '#f6eedc', s: '#d8ccb0', r: '#b8302a' },
    px: [
      '................',
      '.....o.........o',
      '....oooo.....ooo',
      '..ooCoppoo.oosso',
      'ooCCcopoppososso',
      'oCcpcopoppososso',
      'ocypcoprrposssso',
      'occpyorrrrosrrso',
      'oycpcorrrrosrrso',
      'occccoprrposrrso',
      'ocycyoppoposssso',
      'occccoppopososso',
      'occco.ooppossoo.',
      'ocoo....ooooo...',
      'oo........o.....',
      '................',
    ],
  });
  // lamp oil: the keepers' earthenware jar, its mouth sealed with paper and tied with cord, a run of golden rapeseed
  D('kr_oil', {
    pal: { c: '#a8683a', l: '#c88a50', h: '#e2b078', d: '#7a4626', p: '#efe2c4', r: '#8a2a1e', y: '#e8c040' },
    px: [
      '................',
      '................',
      '.....oooooo.....',
      '....oppppppo....',
      '....orrrrrro....',
      '...oppppppppo...',
      '..oolhllcyccoo..',
      '.olhhllccyccddo.',
      '.olhlcccccccddo.',
      '.ollcccccccdddo.',
      '.olccccccccdddo.',
      '..olcccccccddo..',
      '..occccccddddo..',
      '...occcdddddo...',
      '....oooooooo....',
      '................',
    ],
  });
  // the inkstone: a small dark slate seen from the front, a pool of wet ink in its far well, an ink stick with its gold
  // name laid across the worn grinding face
  D('kr_inkstone', {
    pal: { s: '#5e5e6a', l: '#868694', h: '#b4b4c4', d: '#3a3a46', k: '#141218', w: '#90a6d0', g: '#c8a040' },
    px: [
      '................',
      '................',
      '.............oo.',
      '....ooooooooolko',
      '...ohkkkkkkolko.',
      '...olkwkkkolko..',
      '..olskkkkogko...',
      '..olssskogkoo...',
      '.olssslolkoddo..',
      '.olsslolkolsdo..',
      '.ollllolkolldo..',
      '.oddddddooddddo.',
      '.oddddddddddddo.',
      '..oooooooooooo..',
      '................',
      '................',
    ],
  });
  // the keepers' register: a copied page, red-ruled columns of the road's lamps by name, a flame at the head of each,
  // the last one gone out
  D('kr_register', {
    pal: { p: '#f2e6c8', s: '#d6c6a0', r: '#c06048', f: '#e8902a', y: '#ffd060', d: '#a89670' },
    px: [
      '................',
      '..oooooooooooo..',
      '..oppprppprpso..',
      '..opfprpfprdso..',
      '..opyprpyprdso..',
      '..oppprppprpso..',
      '..opoprpoprdso..',
      '..opoprpoprpso..',
      '..oppprpoprdso..',
      '..opoprppprpso..',
      '..opoprpoprpso..',
      '..oppprpoprpso..',
      '..opoprppprpso..',
      '..osssrsssrsso..',
      '..oooooooooooo..',
      '................',
    ],
  });

  // ---- the long roads: A Fare Thirty Years Owed, The Name Nobody Calls ----------------------------------------
  // the stamped scrap: a torn slip of paper, the ferry book's little red seal pressed in one corner (か of かもめ), the
  // space for a name left blank
  D('lq_stamp', {
    pal: { p: '#f4ecd8', s: '#d8c8a4', r: '#b8302a' },
    px: [
      '................',
      '...ooooo..ooo...',
      '..oppppooopppoo.',
      '.opppppppppppso.',
      '.opppppppppppso.',
      '..oppppppppppso.',
      '.oppppprrrrrpso.',
      '.opppprrprrrrso.',
      '.opppprpppprrso.',
      '.opppprrprprpso.',
      '.opppprprrprrso.',
      '.opppprrrpprrso.',
      '.oppppprrrrrsso.',
      '..ossssosssssoo.',
      '...oooo.ooooo...',
      '................',
    ],
  });
  // the Koharu dried persimmon: squat, wrinkled and dark orange, a bloom of sugar on it, its calyx and stalk on top
  D('lq_koharu_fruit', {
    pal: { c: '#4a3a1e', C: '#7a6a34', g: '#b05a24', l: '#d07a3a', h: '#e8a060', d: '#7a3818', w: '#f2e6d0' },
    px: [
      '................',
      '.......oo.......',
      '......ocCo......',
      '....oooccoooo...',
      '..oolccCCccgoo..',
      '.olhlcggggcggdo.',
      '.olhwwlggggggdo.',
      '.olhlgdgggwggdo.',
      '.ollgdgggdggddo.',
      '.olggdgwgdgggdo.',
      '.oggggdgggdgddo.',
      '.oggwggdgggdddo.',
      '..oggggdgggddo..',
      '...oogggdddoo...',
      '.....oooooo.....',
      '................',
    ],
  });
  // the kept cup: Chigusa's thick little teacup, blue-grey glaze running down short of the bare clay foot
  D('lq_kept_cup', {
    pal: { g: '#6a7e96', l: '#90a4ba', h: '#c4d4e4', d: '#46566c', i: '#2c2a30', f: '#c8a07a', F: '#9a7452' },
    px: [
      '................',
      '................',
      '...oooooooooo...',
      '..ohddddddddlo..',
      '..ohdiiiiiidlo..',
      '..ohlllllllllo..',
      '..ohlgggggggdo..',
      '..ohlgggggggdo..',
      '..ohgggggggddo..',
      '...olggggggdo...',
      '...olggdgggdo...',
      '...ofgffgfgFo...',
      '....offfffFo....',
      '.....oooooo.....',
      '................',
      '................',
    ],
  });
  // the persimmon-seed charm: a little pouch sewn from an old indigo kasuri sleeve, tied with red, the seed before it
  D('lq_kaki_seed', {
    pal: { i: '#34407a', I: '#52609a', D: '#262e58', w: '#dfe2ec', r: '#b8302a', s: '#6a3a1a', S: '#b0703a' },
    px: [
      '................',
      '......oooo......',
      '.....oIiIio.....',
      '.....orrrro.....',
      '....oIiiiiio....',
      '...oIiwiiiwio...',
      '..oIiiiiiiiiDo..',
      '..oIwiiiwiiooo..',
      '..oIiiiiiioSso..',
      '..oIiiwiioSsso..',
      '..oIiiiioSssso..',
      '..oiwiiioSssoo..',
      '...oiDDosssoo...',
      '....oooosooo....',
      '........o.......',
      '................',
    ],
  });
  // the persimmon-dyed cloth: a folded tenugui in kakishibu brown-orange, fringed, a little persimmon in one corner
  D('lq_tenugui', {
    pal: { g: '#b8642a', d: '#a4561f', l: '#d08a4a', p: '#e8a050', n: '#5a7a3a' },
    px: [
      '................',
      '................',
      '................',
      '..g.g.g.g.g.g...',
      '.oooooooooooooo.',
      '.oggdggdggdggdo.',
      '.oggdggdggdggdo.',
      '.oggdggdggdggdo.',
      '.ollllllllllllo.',
      '.oggdggdggdngdo.',
      '.oggdggdggppgdo.',
      '.oggdggdggppgdo.',
      '.oooooooooooooo.',
      '..g.g.g.g.g.g...',
      '................',
      '................',
    ],
  });

  // ---- Manybridge, Chapter 3 -----------------------------------------------------------------------------------
  // the forty-year-old letter: a tall envelope gone yellow, an old stamp, the address column fading out, age stains
  D('mb_letter', {
    pal: { p: '#e6d4a0', l: '#f0e2b8', s: '#c4a870', t: '#a88a52', k: '#7a6a5a', r: '#b0503a' },
    px: [
      '................',
      '...oooooooooo...',
      '...olllllllso...',
      '...oprrrpkpso...',
      '...oprlrpkpso...',
      '...oprrrpkpso...',
      '...opppppkpso...',
      '...opppppkpso...',
      '...opppppspso...',
      '...opppppppso...',
      '...opppspspso...',
      '...osppppppso...',
      '...otsppppsso...',
      '...ottsssssso...',
      '...oooooooooo...',
      '................',
    ],
  });
  // the printed bridge map: a sheet from Blockprint Row, blue canals across the district, every bridge a red mark
  D('mb_bridgemap', {
    pal: { p: '#f2e6c4', s: '#d4c296', b: '#4a7ab0', B: '#7aa8d4', r: '#c0442a', k: '#8a7a62' },
    px: [
      '................',
      '................',
      '.oooooooooooooo.',
      '.opppbbpppbbppo.',
      '.okkprrpkprrkpo.',
      '.okkpbbpkpbbkpo.',
      '.opppbbpppbbppo.',
      '.oBrBBBBrBBBrBo.',
      '.obrbbbbrbbbrbo.',
      '.opppbbpppppppo.',
      '.okkpbbpkkpkkpo.',
      '.oppprrpppppppo.',
      '.osssbbssssssso.',
      '.oooooooooooooo.',
      '................',
      '................',
    ],
  });
  // the old agreement: sixty years old, columns of writing, the two parties' red seals, the rest still rolled up
  D('mb_contract', {
    pal: { p: '#ecdcae', l: '#f6ecd0', s: '#c8ae78', d: '#a08856', r: '#b8302a' },
    px: [
      '................',
      '............ooo.',
      '.ooooooooooolpdo',
      '.olllllllllolpdo',
      '.opppppppopolpdo',
      '.opppppopopolpdo',
      '.opopopopopolpdo',
      '.opopopopopolpdo',
      '.opopopppopolpdo',
      '.opopppopopolpdo',
      '.oprrprrpopolpdo',
      '.oprrprrpppolpdo',
      '.osssssssssolpdo',
      '.ooooooooooolpdo',
      '............ooo.',
      '................',
    ],
  });

  // ---- Manybridge, Chapter 4 (Playhouse Row) -------------------------------------------------------------------
  // the print of Manybridge: a tall picture print of the city, red title slip in the sky, roofs, a drum bridge, water
  D('mp_cityprint', {
    pal: { a: '#bcd4e0', r: '#c0442a', g: '#5a6878', b: '#3a6aa0', B: '#7aa8d4', p: '#f2e6c4' },
    px: [
      '................',
      '..oooooooooooo..',
      '..oaaaaaarraao..',
      '..oaaaaaarraao..',
      '..oaaaaaarraao..',
      '..oagaaggaagao..',
      '..ogggaggggggo..',
      '..oggggggggggo..',
      '..obbbrrrrbbbo..',
      '..obbrbBBbrbbo..',
      '..obrbbbbbbrbo..',
      '..orbBbbbBbbro..',
      '..obbbbbbbbbbo..',
      '..oppppppppppo..',
      '..oooooooooooo..',
      '................',
    ],
  });
  // the old playbill: a troupe's bill in a red frame, the title a column of fat black characters, the cast either side
  D('mp_playbill', {
    pal: { p: '#f4ead0', r: '#b8302a', k: '#1e1418' },
    px: [
      '................',
      '..oooooooooooo..',
      '..orrrrrrrrrro..',
      '..orppkkkkpkro..',
      '..orkppkkppkro..',
      '..orkpkkkkppro..',
      '..orpppppppkro..',
      '..orkpkppkpkro..',
      '..orkpkkkkppro..',
      '..orppkppkpkro..',
      '..orkppppppkro..',
      '..orkpkkkkppro..',
      '..orppkpkkpkro..',
      '..orrrrrrrrrro..',
      '..oooooooooooo..',
      '................',
    ],
  });
  // the manuscript: Shinobu's first draft on squared manuscript paper, the right-hand columns written, sheets under
  D('mp_manuscript', {
    pal: { p: '#f6eedc', s: '#d8ccb0', g: '#d08a6a', k: '#2a3048' },
    px: [
      '................',
      '.ooooooooooo....',
      '.oppgkpgpkpooo..',
      '.oppgpkgkpposo..',
      '.ogggggggggoso..',
      '.oppgkpgkkposo..',
      '.oppgppgpkposo..',
      '.ogggggggggoso..',
      '.oppgppgkpposo..',
      '.oppgppgkkposo..',
      '.oppgppgppposo..',
      '.oooooooooooso..',
      '..osssssssssso..',
      '..oooooooooooo..',
      '................',
      '................',
    ],
  });

  // ---- the open sea --------------------------------------------------------------------------------------------
  // the timber's delivery note: a paper slip with a column of writing, lying on the stacked planking
  D('sea_timber_note', {
    pal: { l: '#d8a466', w: '#b07a44', d: '#7a5028', e: '#e8c088', p: '#f6eedc' },
    px: [
      '................',
      '........ooooo...',
      '........opppo...',
      '........opopo...',
      '........opopo...',
      '.oooooooopopooo.',
      '.oelllllopppolo.',
      '.oewwwwwopopowo.',
      '.oooooooooooooo.',
      'oelllllllllllllo',
      'oewwwdddwwwwwwwo',
      'oooooooooooooooo',
      '.oellllllllllllo',
      '.oewwwwwwwddwwo.',
      '.oooooooooooooo.',
      '................',
    ],
  });
  // the coast's mailbag: a canvas sack with a leather strap, a letter showing at its drawn mouth, the post's red mark
  D('sea_mailbag', {
    pal: { c: '#c8b48a', l: '#e0d0aa', d: '#9a8660', s: '#6a4a2a', r: '#c0302a', w: '#f8f2e4' },
    px: [
      '................',
      '....ssssssss....',
      '...s.oooooo.s...',
      '...s.owwwro.s...',
      '...s.owwwwo.s...',
      '..oooooooooooo..',
      '..oldldldldldo..',
      '.ollccccccccddo.',
      '.olccrrrrrccddo.',
      '.olcccccccccddo.',
      '.olccrrrrrccddo.',
      '.olccccrccccddo.',
      '.olccccrcccdddo.',
      '..olcccccccddo..',
      '...oooooooooo...',
      '................',
    ],
  });
  // the licence for the open sea: folded in glossy oilcloth against the spray, tied with cord, the paper's red seal
  // showing at one corner
  D('sea_licence_doc', {
    pal: { g: '#7a6a3a', l: '#a8945a', h: '#d8c890', d: '#544824', c: '#e0c890', p: '#f4ecd8', r: '#b8302a' },
    px: [
      '................',
      '................',
      '..........oo....',
      '.........oppo...',
      '........opprpo..',
      '.......opprrppo.',
      '.oooooooooooooo.',
      '.ohlllllclllllo.',
      '.olhggggcggggdo.',
      '.olghgggcggggdo.',
      '.olggggcccgggdo.',
      '.occcccccccccco.',
      '.olgggggcggggdo.',
      '.oddddddcdddddo.',
      '.oooooooooooooo.',
      '................',
    ],
  });

  // ---- Ashihara Shinden ----------------------------------------------------------------------------------------
  // the planting hat: a wide sedge kasa, its rings and the rays of the weave, the chin cord below (as the keepsake)
  D('as_kasa', {
    pal: { s: '#c8a860', d: '#b0904a', l: '#e0c47c', w: '#8a6a30', c: '#7a3a2a' },
    px: [
      '................',
      '................',
      '.......oo.......',
      '......olso......',
      '.....olssdo.....',
      '....olwsswdo....',
      '...oddddddddo...',
      '..olswsssswsdo..',
      '.olswsssssswsdo.',
      'oddddddddddddddo',
      '.oooooooooooooo.',
      '...c........c...',
      '....c......c....',
      '.....cccccc.....',
      '................',
      '................',
    ],
  });
})(RB.itemArt.def);
