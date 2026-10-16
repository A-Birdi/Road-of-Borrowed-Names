/* Item icons: the cases (cs_), Reedwake (rw_) and Saltglass (sg_). 16×16 authored pixel tables (src/ui/11_item_art.js):
 * '.' clear, 'o' the shared outline ink; light from the upper left; one or two highlights, no dithering noise. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (D) {
  'use strict';
  // ---- Reedwake ----------------------------------------------------------------------------------------------
  // the letter of introduction: a folded paper envelope, its flap closed with a red wax seal
  D('rw_letter', {
    pal: { p: '#f4ead2', s: '#d9c9a2', d: '#b8a57e', r: '#a83e27', h: '#d8664a' },
    px: [
      '................',
      '................',
      '................',
      'oooooooooooooooo',
      'osppppppppppppso',
      'opsppppppppppspo',
      'oppsppppppppsppo',
      'opppsppppppsdppo',
      'oppppsrrrrsdpppo',
      'oppppprhhrdppppo',
      'opppppprrppppppo',
      'oppppppppppppppo',
      'odppppppppppppdo',
      'oddddddddddddddo',
      'oooooooooooooooo',
      '................',
    ],
  });
  // Bunta's plane: a woodworker's plane, oak body, the iron blade wedged in, a shaving curling out
  D('rw_plane', {
    pal: { w: '#c08a52', l: '#dcae74', d: '#8a5a30', b: '#9aa4ac', m: '#d8dee2', s: '#f0d9a8' },
    px: [
      '................',
      '................',
      '................',
      '.......oo.......',
      '......obbo......',
      '......obmo..ss..',
      '.....oobbooos.s.',
      '..oooolbbllloo..',
      '.ollllwbbwwwwwo.',
      'olwwwwwbbwwwwwdo',
      'owwwwwwbbwwwwwdo',
      'owwwwwwwwwwwwddo',
      'odddddddddddddo.',
      '.ooooooooooooo..',
      '................',
      '................',
    ],
  });
  // the millstone charm: a round grey stone with a hole and a red cord tied through it
  D('rw_mill_charm', {
    pal: { g: '#9a948a', l: '#c4beb2', d: '#6e695f', h: '#e2ddd2', r: '#a83e27', k: '#d8664a' },
    px: [
      '......orro......',
      '.....orkko......',
      '......orro......',
      '.....oolloo.....',
      '...oolhhllloo...',
      '..olhhllllgggo..',
      '..olhllooogggo..',
      '.olllloo..ogggo.',
      '.ollggo....ogdo.',
      '.ollggo....ogdo.',
      '.ogggggo..ogddo.',
      '..ogggggooogddo.',
      '..oggggggddddo..',
      '...oodddddddoo..',
      '.....ooooooo....',
      '................',
    ],
  });
})(RB.itemArt.def);
