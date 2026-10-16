/* Item icons: the Still Archive (sa_), the Cloudroad (cr_), the old guardians' gifts (gd_) and the Hall of a Hundred
 * Tales (hall_). 16×16 authored pixel tables (src/ui/11_item_art.js): '.' clear, 'o' the shared outline ink; light
 * from the upper left; flat colour with one shade and one highlight, no dithering noise. The keepsakes take their
 * colours and design from their 32×32 catalogue drawings (src/content/zzzz_keepsakes/), redrawn where 16 pixels need a
 * clearer outline (the cape, the hood, the scarf, the headband); the Archive's folios and papers follow the chapter's
 * own drawings of them (src/ui/43f_seq_ch6.js). The books and papers differ in outline and colour, not just detail. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (D) {
  'use strict';
  // ---- The Still Archive (chapter 6) -------------------------------------------------------------------------
  // Kasane's first folio: blue-grey card covers, a blank label, tied round with a red cord whose ends hang loose
  D('sa_letter_kasane', {
    pal: { c: '#98a0b4', l: '#b8c0d0', d: '#737b91', w: '#ece5d3', r: '#8a3434', k: '#c0584c' },
    px: [
      '...oooooooooo...',
      '...ollllllldo...',
      '...olwwwcccdo...',
      '...olwwwcccdo...',
      '...olwwwcccdo...',
      '...olwwwoocdo...',
      '...olccorrodo...',
      '...okkkkkrkko...',
      '...orrrrrrrro...',
      '...olccorrodo...',
      '...olcccrrcdo...',
      '...oddddrdrdo...',
      '...oooorooroo...',
      '......oro.oro...',
      '.....oro..oro...',
      '......o....o....',
    ],
  });
  // Tōya's note: the bell tower's key slip, a stiff tag on a string, Tōya's four hurried words across its back
  D('sa_toya_reply', {
    pal: { p: '#ece4cc', h: '#f8f2e2', s: '#cbbf9f', k: '#3a3036', r: '#a8564a' },
    px: [
      '...oooo.........',
      '..oorroo........',
      '..orooro........',
      '..orooro........',
      '..oorooooooooooo',
      '..oorhhhhhhhhhso',
      '.ooprpppkppkppso',
      '.oppoppkppkppkso',
      '.oppopkppkppkpso',
      '.oopppppppppppso',
      '..oossssssssssso',
      '...ooooooooooooo',
      '................',
      '................',
      '................',
      '................',
    ],
  });
  // the council notice: a wide sheet of print columns, water-stained to a tide line, the council's red seal
  D('sa_notice', {
    pal: { p: '#e6dcc2', h: '#f4ecd8', t: '#c9b086', u: '#9a7a50', k: '#4e4a58', r: '#a83a32' },
    px: [
      '................',
      'oooooooooooooooo',
      'ohhhhhhhhhhhhhho',
      'opppppppppppkppo',
      'opppppkpkpkpkppo',
      'opppppkpkpkpkppo',
      'opppppkpppkpkppo',
      'opppppkpkpppkppo',
      'opuuppuukpkukpuo',
      'outtuuttkuktkuto',
      'otrrrtttttktttto',
      'otrrrtttttttttto',
      'otrrrtttttttttoo',
      'ottttttttttttoo.',
      'oooooooooooooo..',
      '................',
    ],
  });
  // Tae's slip: a small slip with a corner turned down, the bell of the flood night drawn in ink above the water
  D('sa_tae_slip', {
    pal: { p: '#eee6d2', h: '#faf5e8', s: '#cfc3a5', k: '#3e3a46', b: '#5f86a8' },
    px: [
      '................',
      '..oooooooooo....',
      '..ohhhhhhhhoo...',
      '..opppppppspoo..',
      '..oppppkkpsspo..',
      '..opppkkkkpppo..',
      '..opppkkkkpppo..',
      '..opppkkkkpppo..',
      '..oppkkkkkkppo..',
      '..oppppkpppppo..',
      '..oppbbppbbppo..',
      '..opbppbbppbpo..',
      '..oppppppppppo..',
      '..osssssssssso..',
      '..oooooooooooo..',
      '................',
    ],
  });
  // Isamu's folio: a thin sea-green folio from the Saltglass shelf, the return request pasted on its spine
  D('sa_folio_isamu', {
    pal: { c: '#5e968e', l: '#80b6ac', d: '#44736c', s: '#365c57', w: '#eee8d6', r: '#b8443a' },
    px: [
      '......ooooooo...',
      '....ooolllldo...',
      '....osslcccdo...',
      '....osslcccdo...',
      '....owwlcccdo...',
      '....owwlcccdo...',
      '....owwlcccdo...',
      '....owwlcccdo...',
      '....orrlcccdo...',
      '....owwlcccdo...',
      '....osslcccdo...',
      '....osslcccdo...',
      '....osslcccdo...',
      '....osslcccdo...',
      '....ossdddddo...',
      '....ooooooooo...',
    ],
  });
  // Ushio's notebook: a battered brown pocket book, a corner folded over, loose recipes sticking out of its pages
  D('sa_ushio_notes', {
    pal: { c: '#8a5a3a', l: '#a87450', d: '#6a4028', p: '#efe4c8', s: '#cdbf9e' },
    px: [
      '................',
      '..ooooooooo.....',
      '..ollllllloooo..',
      '..olcccccsspso..',
      '..olcccccssdsooo',
      '..olcccccccdsppo',
      '..olcccddccdspso',
      '..olcccccccdsooo',
      '..olcccccccdsoo.',
      '..olcccccccdspo.',
      '..olcllccccdspo.',
      '..olcclccccdspo.',
      '..ollccccccdsoo.',
      '..odddddddddso..',
      '..oossssssssso..',
      '...ooooooooooo..',
    ],
  });
  // the Archive bookmark: a narrow pale card, its red thread through the hole at the top and hanging in a tassel
  D('sa_bookmark', {
    pal: { p: '#f0e8d4', h: '#fbf6ea', s: '#d4c8a8', r: '#b8302a', q: '#e0605a' },
    px: [
      '.......ooo......',
      '......orrro.....',
      '....ooroooro....',
      '...ohprpsoro....',
      '...ohprpsoro....',
      '...ohpopsoro....',
      '...ohpppsoro....',
      '...ohpppsoro....',
      '...ohpppsoqro...',
      '...ohssssoqro...',
      '...ohpppsoqro...',
      '...ohsspsoqro...',
      '...ohpppsororo..',
      '...ohpppsoo.o...',
      '...ossssso......',
      '....ooooo.......',
    ],
  });
  // Ren's folio: dark plum card covers, Ushio's strong hand on the label, his filing slip standing out of the pages
  D('sa_ren_folio', {
    pal: { c: '#5a4a5e', l: '#7a6a7e', d: '#43374a', w: '#e4dcc4', s: '#f6f0e2', p: '#c4b898' },
    px: [
      '.........oooo...',
      '.........ossoo..',
      '.........ososo..',
      '...ooooooososo..',
      '...ollllllldso..',
      '...olccccccdpo..',
      '...olcwwwwcdpo..',
      '...olcwowwcdpo..',
      '...olcwowocdpo..',
      '...olcwoowcdpo..',
      '...olcwoowcdpo..',
      '...olcwwwwcdpo..',
      '...olccccccdpo..',
      '...oddddddddpo..',
      '...ooppppppppo..',
      '....oooooooooo..',
    ],
  });
  // ---- The Cloudroad -----------------------------------------------------------------------------------------
  // the relay's ledger: a thick ochre account book hung on a string, its title in big brush strokes, stitched
  D('cr_ledger', {
    pal: { c: '#c8a050', l: '#e2c070', d: '#9c7834', w: '#f4ecd6', s: '#d8caa4', n: '#7a4a2a' },
    px: [
      '.....oonnoo.....',
      '.....onoono.....',
      '..oooonoonoooo..',
      '..ollllllllndoo.',
      '..olcwwwccnndso.',
      '..olcwowcccndso.',
      '..olcooocccndwo.',
      '..olcwowccnndso.',
      '..olcwwwcccndso.',
      '..olcwowcccndwo.',
      '..olcoowccnndso.',
      '..olcwoocccndso.',
      '..oddwwwdddndwo.',
      '..oowwwwwwwwwso.',
      '...osswsswsssso.',
      '...oooooooooooo.',
    ],
  });
  // travel papers: a pass under Oiwake's red seal, the box where your name belongs gone blank
  D('cr_papers', {
    pal: { p: '#efe6cf', h: '#faf4e4', s: '#cdbf9c', k: '#3a3440', r: '#b03a2e' },
    px: [
      '..oooooooooooo..',
      '..ohhhhhhhhhho..',
      '..oppppppppppo..',
      '..oppsssspkkpo..',
      '..oppshhspkkpo..',
      '..oppshhspkkpo..',
      '..oppshhspkkpo..',
      '..oppshhspkkpo..',
      '..oppshhsppppo..',
      '..oppshhspkppo..',
      '..oppsssspkppo..',
      '..oprrrpppkppo..',
      '..oprrrppppppo..',
      '..oprrrppppppo..',
      '..osssssssssso..',
      '..oooooooooooo..',
    ],
  });
  // the letter of guarantee: Shizu's letter on rolled paper, unrolled to her hand and Kumoi's red seal
  D('cr_proof', {
    pal: { p: '#f2ead6', h: '#fdf8ec', s: '#d2c4a2', k: '#2e2a34', m: '#b8342a' },
    px: [
      '.ooooo..........',
      '.ohpso..........',
      '.ohpsoooooooooo.',
      '.ohpshhhhhhhhho.',
      '.ohpspppppppppo.',
      '.ohpspkpkpkpkpo.',
      '.ohpspkpkpkpkpo.',
      '.ohpspppkpkpkpo.',
      '.ohpspmmkpppkpo.',
      '.ohpspmmppkpkpo.',
      '.ohpspmmppkpkpo.',
      '.ohpspppppppppo.',
      '.ohpsssssssssso.',
      '.ohpsoooooooooo.',
      '.ohpso..........',
      '.ooooo..........',
    ],
  });
  // the old letter: folded small, its address almost gone, lying on the oiled paper that kept it dry fifty years
  D('cr_message', {
    pal: { a: '#c89448', b: '#e0b066', c: '#a2702c', p: '#ece0bc', s: '#c8b484', f: '#a49478' },
    px: [
      '......oooo......',
      '.....oobboo.....',
      '.....obbaao.....',
      '...oooooooooo...',
      '..oobopppsoaoo..',
      '.oobbopffsoaaoo.',
      'oobbaopfpsoaaaoo',
      'obbaaossssoaaaco',
      'obaaaopppsoaacco',
      'ooaaaopfpsoaccoo',
      '.ooaaopfpsoccoo.',
      '..ooaossssocoo..',
      '...oooooooooo...',
      '.....oaacco.....',
      '.....ooccoo.....',
      '......oooo......',
    ],
  });
  // the seal book: a little folding book opened out in its zigzag, a red station seal on every page
  D('cr_sealbook', {
    pal: { p: '#f2ead4', s: '#cdbd98', h: '#fffaf0', r: '#b8342a', c: '#7a5a3a' },
    px: [
      '................',
      '.ooo...ooo...ooo',
      'oohoo.oohoo.ooho',
      'ochpoooshpooosho',
      'ochpposshppossho',
      'ochppssshppsssho',
      'ochppssshppsssho',
      'ochrrsrrhrrsrrho',
      'ochrrsrrhrrsrrho',
      'ochppssshppsssho',
      'ochppssshppsssho',
      'ochpposshppossho',
      'ochpoooshpooosho',
      'oohoo.oohoo.ooho',
      '.ooo...ooo...ooo',
      '................',
    ],
  });
  // the Matsuba's guest book: a deep green cover stab-bound with white thread, the inn's pine-needle crest on it
  D('cr_guestbook', {
    pal: { g: '#3e6a4a', l: '#5a8a62', d: '#2c4e36', w: '#efe6cc', t: '#e6dcc0', p: '#d8cba8' },
    px: [
      '.oooooooooooo...',
      '.ollllllllldoo..',
      '.olgggggggtdpo..',
      '.olwggggwtttto..',
      '.olwlgglwgtdpo..',
      '.olgwggwggtdpo..',
      '.olgwggwgtttto..',
      '.olggwwgggtdpo..',
      '.olggwwgggtdpo..',
      '.olggwwggtttto..',
      '.olgggggggtdpo..',
      '.olgggggggtdpo..',
      '.olggggggtttto..',
      '.oddddddddddpo..',
      '.ooppppppppppo..',
      '..oooooooooooo..',
    ],
  });
  // Oshika's pilgrim book: open in its red brocade covers, every page a temple's red seal and black brushwork
  D('cr_pilgrimbook', {
    pal: { p: '#f4ecd8', s: '#d8cbaa', c: '#7a2a34', y: '#d0a850', r: '#c0382c', k: '#2e2a34' },
    px: [
      '................',
      '................',
      '.oooooooooooooo.',
      'oopppppoopppppoo',
      'ocpppppssppkppco',
      'ocpkprrssppkppco',
      'ocpkprrssprkppco',
      'ocpkpppssrrkrpco',
      'ocpkkppssrrkrpco',
      'ocpkpppssprkppco',
      'ocpkpppssppkppco',
      'ocpkpppssppkppco',
      'ocpppppsspppppco',
      'occyccyccyccycco',
      'oooooooooooooooo',
      '................',
    ],
  });
  // the parcel of medicine: headache powder wrapped in glossy oiled paper, tied with twine and a bow
  D('cr_parcel', {
    pal: { a: '#c08840', h: '#e2b46a', s: '#966426', t: '#f0e4c4', w: '#f8f0dc', r: '#a83e27' },
    px: [
      '................',
      '................',
      '.....oo..oo.....',
      '....ottootto....',
      '..ooottoottooo..',
      '.ohhhhhtthhhhso.',
      '.ohaaaattaaaaso.',
      '.ohaaaattaaaaso.',
      '.ohaaaattaaaaso.',
      '.otttttttttttto.',
      '.ohwwwattaaaaso.',
      '.ohwrwattaaaaso.',
      '.ohwwwattaaaaso.',
      '.osssssttssssso.',
      '..oooooooooooo..',
      '................',
    ],
  });
  // ---- The old guardians' gifts (keepsakes) ------------------------------------------------------------------
  // the founder's miller's cap: flour-white and patched, a button on top, flour still in the cloth
  D('gd_rw_keepsake', {
    pal: { w: '#e6dcc4', h: '#f6efdc', s: '#d0c3a4', p: '#c4b694', q: '#a8987a', f: '#ffffff' },
    px: [
      '................',
      '................',
      '.......oo.......',
      '....oooqqooo....',
      '...ohhhhhhhho...',
      '..ohhhhhhhhhho..',
      '..ohhhhhhhhhso..',
      '..ohwqqqwwfwso..',
      '..ohwppqwwwwso..',
      '..ohwppqwfwwso..',
      '.oshwwwwwwwwsso.',
      'osfsssssssssssso',
      '.oqqqqqqqqqqqfo.',
      '..ooqqqqqqqqoo..',
      '....oooooooo....',
      '................',
    ],
  });
  // Head Office spectacles: two round lenses catching the light, a thin gold chain hanging between them
  D('gd_sg_keepsake', {
    pal: { g: '#cfe0ea', f: '#93a6b6', w: '#ffffff', c: '#e0bc5c', e: '#8e6c26' },
    px: [
      '................',
      '................',
      '................',
      '..oooo....oooo..',
      '.owwggoooowwggo.',
      '.owgggo..owgggo.',
      '.ogggfo..ogggfo.',
      '.oggffo..oggffo.',
      '..oooo....oooo..',
      '.c............e.',
      '.e............c.',
      '..c..........e..',
      '...e........c...',
      '....ce....ce....',
      '......cece......',
      '................',
    ],
  });
  // the ember scarf: folded across, one fringed end hanging down, dyed the colour of the First Fire and still warm
  D('gd_co_keepsake', {
    pal: { r: '#c4502a', d: '#9a3a1c', e: '#e47448', s: '#f0a050' },
    px: [
      '.............s..',
      '...s..........s.',
      '..s......oooo...',
      '.ooooooooeeeeo..',
      'oreeeeeeoerrdo..',
      '.orrsrrsoerrdo..',
      'orrrsrrsoerrdo..',
      '.orrsrrsosssso..',
      'orddddddoerrdo..',
      '.ooooooooerrdo..',
      '........osssso..',
      '........oerrdo..',
      '........oerrdo..',
      '........oerrdo..',
      '........ororoo..',
      '........ororo...',
    ],
  });
  // the star earrings: two chips of starlight, four-pointed and bright, each on a silver hook
  D('gd_sb_keepsake', {
    pal: { w: '#eef0ff', h: '#ffffff', b: '#9fb0f4', m: '#c4c8d6' },
    px: [
      '.....oo.........',
      '....ommo........',
      '...omoomo...oo..',
      '...omo.o...ommo.',
      '...omo....omoomo',
      '...owo....omo.o.',
      '...owo....omo...',
      '.oohhhoo..owo...',
      'owwhhhwbo.owo...',
      '.oohhboooohhhoo.',
      '...owo.owwhhhwbo',
      '...obo..oohhboo.',
      '....o.....owo...',
      '..........obo...',
      '...........o....',
      '................',
    ],
  });
  // the maker's little bell: bronze, flared at the lip, hanging from a dark cord, its clapper showing
  D('gd_lf_keepsake', {
    pal: { b: '#b89a4a', m: '#9a7a3a', s: '#e0c880', d: '#6e5024', c: '#7a3a2a', k: '#4a3418' },
    px: [
      '.......oo.......',
      '......occo......',
      '......occo......',
      '.....obbbbo.....',
      '....obsbbbbo....',
      '....obsbbbbo....',
      '....obsbbbbo....',
      '...omsmmmmmmo...',
      '...omsmmmmmmo...',
      '...omsmmmmmmo...',
      '..omsmmmmmmmmo..',
      '..ommmmmmmmmmo..',
      '.oddddddddddddo.',
      '..oooookkooooo..',
      '.......oo.......',
      '................',
    ],
  });
  // the bridge-builder's headband: old indigo tied in a ring, its knot and two loose ends, a white pattern
  D('gd_mb_keepsake', {
    pal: { i: '#41689a', d: '#2e4c74', l: '#6a90c0', w: '#dfe6f2' },
    px: [
      '........o.......',
      '....oooowooo....',
      '...owlllllllo...',
      '..oiiiiooiiiwo..',
      '.oiiioo..ooiiio.',
      '.oiio......oiio.',
      'oiwio......oiiio',
      '.oiioo....ooiwo.',
      '.oddddo..oddddo.',
      '..odddoooodddo..',
      '...oddoiioddo...',
      '....oooidooo....',
      '.....oooooo.....',
      '....oiiooddo....',
      '...oiio..oddo...',
      '....oo....oo....',
    ],
  });
  // the cloud cape: white as the Elder, from a grey collar to a hem that billows like cloud, beaded with damp
  D('gd_cr_keepsake', {
    pal: { w: '#e6eaf0', h: '#f8f9fc', f: '#c2cad6', c: '#9aa2b2', b: '#6e9cd0' },
    px: [
      '.....oo..oo.....',
      '....occoocco....',
      '...occcccccco...',
      '...occcbbccco...',
      '..ohwwwfwwwbfo..',
      '..ohwfwfwwfwfo..',
      '..ohwfwfwwfwfo..',
      '..ohwwwfwwwwfo..',
      '.ohwfwwfwwwfwfo.',
      '.ohwfwwfwwwfwfo.',
      '.ohwwwwfwwwwwfo.',
      'ohbfwwwfwwwwfwfo',
      'ohwfwwwfwwbwfwfo',
      'owwwowwfowwwowfo',
      '.ooo.ooo.ooo.oo.',
      '................',
    ],
  });
  // the steam-grey hood: soft grey cloth to a rounded point, dark inside, a little steam still rising off it
  D('gd_yn_keepsake', {
    pal: { g: '#b8b2aa', h: '#d4cec6', s: '#9a948c', k: '#4e464c', v: '#8f9cab' },
    px: [
      '..........oo....',
      '...v....oohho...',
      '.v....oohhggho..',
      '..v..ohhggggso..',
      '.v..ohgggggso.v.',
      '...ohghhgggghv..',
      '..ohghkkkkggsov.',
      '..ohggkkkkggso..',
      '..ohgkkkkkkgso..',
      '..ohggkkkkggso..',
      '..ohggkkkkggso..',
      '.ohggggggggggho.',
      'ohggsggggggsggho',
      'ohssssssssssssso',
      '.oooooooooooooo.',
      '................',
    ],
  });
  // the First Leaf: one green leaf, its veins drawn dark, an address tag tied to its stem
  D('gd_ko_keepsake', {
    pal: { g: '#5a9a4a', d: '#47843a', l: '#7cba68', v: '#2e5a2a', t: '#f4ecd0', n: '#8a7a5a' },
    px: [
      '......ooo.......',
      '.....olggo......',
      '....olgvggo.....',
      '...olggvgggo....',
      '..olgvgvgvggo...',
      '.olgggvvvggggo..',
      '.olggggvgggggo..',
      '.olddvdvdvdddo..',
      '.oldddvvvddddo..',
      '..oldddvddddo...',
      '...olvdvdvdoooo.',
      '....olvvvdotttto',
      '.....olvdnntnnto',
      '......ovnootttto',
      '......ovo..oooo.',
      '.......o........',
    ],
  });
  // ---- The Hall of a Hundred Tales ---------------------------------------------------------------------------
  // the Hall's key ledger: an old dark-red book with its title slip, the Hall's iron key hanging from it on a ring
  D('hall_ledger', {
    pal: { c: '#6e2e2a', l: '#8e4a3e', d: '#4e1e1c', w: '#e8dcc0', i: '#7a8690', j: '#b8c4cc' },
    px: [
      '.oooooooo.......',
      'ollllllldo......',
      'olccccccdio.....',
      'olcwwcccdwioo...',
      'olcwwcccdwjiio..',
      'olcwwcccdwioio..',
      'olcwwcccdwiiio..',
      'olcwwcccdwoio...',
      'olcwwcccdwojo...',
      'olccccccdwoio...',
      'olccccccdwoio...',
      'olccccccdwoioo..',
      'olccccccdwoiiio.',
      'oddddddddwoioo..',
      '.owwwwwwwwoiiio.',
      '..oooooooo.ooo..',
    ],
  });
  // the Lantern of the Hundred: the Hall's last hand lantern, lit, its paper ribs glowing between dark cap and base
  D('hall_lantern', {
    pal: { y: '#f0c060', b: '#f8d878', g: '#fff2c0', r: '#c8903a', k: '#3a3036', h: '#5e5460' },
    px: [
      '.......oo.......',
      '.....ookkoo.....',
      '....ohhhhhko....',
      '....okkkkkko....',
      '...oyyyyyyyyo...',
      '..orrrrrrrrrro..',
      '.obbbbggggbbbbo.',
      '.obbbbggggbbbbo.',
      '.orrrrggggrrrro.',
      '.obbbbggggbbbbo.',
      '.obbbbggggbbbbo.',
      '..orrrrrrrrrro..',
      '...oyyyyyyyyo...',
      '....ohhhhhko....',
      '....okkkkkko....',
      '.....oooooo.....',
    ],
  });
})(RB.itemArt.def);
