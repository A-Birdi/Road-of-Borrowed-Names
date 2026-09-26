/* Unwritten Atlas — authored room patterns.
 * Each pattern is a small hand-drawn room (ASCII) with anchors that the
 * generator fills according to the run plan. Terrain chars follow the map
 * legend (docs/CONTENT.md) plus:
 *   X  blank page (the unwritten edge, solid)     Y  sketched ground (walkable)
 * Anchors (replaced by the pattern's floor):
 *   @ entry spawn · 1 2 3 exits (top row) · ! gate (veil until the room is solved)
 *   ? objective spot(s) · $ cache spot · % unmoored-name spot · & foe spot
 *   G guard / guardian spot · K clue tablet · < door lamp · W bridge gap (bridge beneath)
 *   ( deep water that is shallow at low tide · [ cache spot uncovered at low tide
 *   ) promise veil (Promise-bound Ruin only; blank otherwise) · ] promise cache · } alcove floor
 *   - climax trigger · I pillar · U lit lantern · V statue · N stone marker
 *   J book pile · H campfire · M tent (2 wide) · Z folded page (behind the entry)
 * Dressings re-skin the generic ground so each room can echo a different
 * region (meadow / shore / snow / ash / paper) without redrawing it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const A = C.atlas;
  A.patterns = {};
  const P = (id, d) => (A.patterns[id] = Object.assign({ id, floor: ':', w: 21, h: 15 }, d));

  // Shared top/bottom rows for single-exit rooms (exit at x=10, gate at y=2).
  const TOP = ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY:YXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX'];
  const BOT = ['XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'];

  // 1 — The Half-written Gate (entry)
  P('threshold', {
    kinds: ['entry'], objectives: ['inscription'], name: { jp: '{書|か}きかけ の {門|もん}', en: 'The Half-written Gate' },
    dress: ['meadow', 'shore', 'snow', 'ash', 'paper'],
    variants: [
      TOP.concat([
        'XXXXXXXY..:..?YXXXXXX',
        'XXXXXXY.,.:..,.YXXXXX',
        'XXXXXY..;.:....,YXXXX',
        'XXXXY.o...:..;...YXXX',
        'XXXXY.,...:...o..YXXX',
        'XXXXY..;..:.,....YXXX',
        'XXXXXY....:....;YXXXX',
        'XXXXXXY.,.:...,YXXXXX',
        'XXXXXXY...:....YXXXXX',
      ], BOT),
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY+YXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX',
        'XXXXXXXYp+++p?YXXXXXX',
        'XXXXXXYppp+pppYXXXXXX',
        'XXXXXYJppp+pppp.YXXXX',
        'XXXXY..ppp+pppJ..YXXX',
        'XXXY...,..+.....,.YXX',
        'XXXY.r....+...r...YXX',
        'XXXXY..,..+..,...YXXX',
        'XXXXXY....+.....YXXXX',
        'XXXXXXY..,+..,.YXXXXX',
        'XXXXXXXY..+...YXXXXXX', 'XXXXXXXXY.@..YXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      TOP.concat([
        'XXXXXX"w..:..?w"XXXXX',
        'XXXXX"ww..:...ww"XXXX',
        'XXXX"www..:...www"XXX',
        'XXXX"ww...:....ww"XXX',
        'XXXX"w..,.:..,..w"XXX',
        'XXXXY"....:....."YXXX',
        'XXXXXY"...:....,"YXXX',
        'XXXXXXY.,.:...."YXXXX',
        'XXXXXXY...:...YXXXXXX',
      ], BOT),
    ],
  });

  // 2 — Row of Blank Lanterns (light each lantern by restoring its word)
  P('lanterns', {
    kinds: ['path', 'branch'], objectives: ['lanterns'], name: { jp: '{白紙|はくし} の {灯籠|とうろう} {並|な}み', en: 'Row of Blank Lanterns' },
    dress: ['meadow', 'shore', 'snow', 'paper'],
    variants: [
      TOP.concat([
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXY.?.:...YXXXXXX',
        'XXXXXY....:....YXXXXX',
        'XXXXY.....:..?..YXXXX',
        'XXXXY.&,..:.....YXXXX',
        'XXXXY.....:.,...YXXXX',
        'XXXXXY.?..:....YXXXXX',
        'XXXXXXY...:...YXXXXXX',
        'XXXXXXY.,.:.,.YXXXXXX',
      ], BOT),
      ['XXXXXXXXXXXXXX1XXXXXX', 'XXXXXXXXXXXXXY:YXXXXX', 'XXXXXXXXXXXXYI!IYXXXX',
        'XXXXXXY.?....:.:.YXXX',
        'XXXXXY..::::::..,YXXX',
        'XXXXXY..:.,....?YXXXX',
        'XXXXXY..:.....YXXXXXX',
        'XXXXXXY.::::::.YXXXXX',
        'XXXXXXXY.,...:..YXXXX',
        'XXXXXXXY.?...:..YXXXX',
        'XXXXXXXY..::::.YXXXXX',
        'XXXXXXXY..:...YXXXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 3 — The Unfinished Bridge (restore the bridge's sign; the planks complete themselves)
  P('crossing', {
    kinds: ['path', 'branch'], objectives: ['sign'], bridge: true, name: { jp: '{未完成|みかんせい} の {橋|はし}', en: 'The Unfinished Bridge' },
    dress: ['meadow', 'shore', 'ash'],
    variants: [
      TOP.concat([
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXY"...:..&,YXXXXX',
        'XXXY"~~~~~B~~~~~"YXXX',
        'XXY"~[((((W~~~~~~~"YX',
        'XXY"~~~~~~W~~~~~~~"YX',
        'XXXY"~~~~~B~~~~~"YXXX',
        'XXXXY.,..?:..;.YXXXXX',
        'XXXXXY....:....YXXXXX',
        'XXXXXXY.,.:...YXXXXXX',
      ], BOT),
      TOP.concat([
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXY.,.:...$YXXXXX',
        'XXXXY"~~~~B~~~~"YXXXX',
        'XXXY"~~~~~W((((("YXXX',
        'XXXY"~~~~~W~~~~w[YXXX',
        'XXXXY"~~~~B~~~~"YXXXX',
        'XXXXXY..?.:..,.YXXXXX',
        'XXXXXXY...:.;.YXXXXXX',
        'XXXXXXY.,.:...YXXXXXX',
      ], BOT),
    ],
  });

  // 4 — Split Signpost (fork: two exits, choose a road)
  P('fork', {
    kinds: ['fork'], objectives: [], name: { jp: '{分|わ}かれ{道|みち}', en: 'The Split Signpost' },
    dress: ['meadow', 'snow', 'ash', 'shore'],
    variants: [
      ['XXXX1XXXXXXXXXXX2XXXX',
        'XXXY:YXXXXXXXXXY:YXXX',
        'XXXY:.YXXXXXXXY.:YXXX',
        'XXXY.:.YTTTTTY.:.YXXX',
        'XXXXY.:.YTTTY.:.YXXXX',
        'XXXXXY.:.YTY.:.YXXXXX',
        'XXXXXXY.:...:.YXXXXXX',
        'XXXXXXXY.:?:.YXXXXXXX',
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXY.,.:.,.YXXXXXX',
        'XXXXXY..;.:....YXXXXX',
        'XXXXXY.,..:..;.YXXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXX1XXXXXXXXXXX2XXXX',
        'XXXY:YXXXXXXXXXY:YXXX',
        'XXXY:.^^^^^^^^^.:YXXX',
        'XXXY.:.^^^^^^^.:.YXXX',
        'XXXXY.:..,r,..:.YXXXX',
        'XXXXXY.::...::.YXXXXX',
        'XXXXXXY..:?:..YXXXXXX',
        'XXXXXXXY.:.:.YXXXXXXX',
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXY.r.:.,.YXXXXXX',
        'XXXXXY....:..r.YXXXXX',
        'XXXXXY.,..:....YXXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 5 — Hall of Three Doors (read the tablet, walk through the right door)
  P('doors', {
    kinds: ['path', 'branch'], objectives: ['doors'], floor: '+', name: { jp: '{三|みっ}つ の {扉|とびら}', en: 'The Hall of Three Doors' },
    dress: ['stone', 'paper'],
    variants: [
      ['XXXX1XXXXX2XXXXX3XXXX',
        'XXXI+IXXXI+IXXXI+IXXX',
        'XXX<++XXX<++XXX<++XXX',
        'XXX+++++++++++++++XXX',
        'XXX+++++++++++++++XXX',
        'XXX++J++++K++++J++XXX',
        'XXX+++++++++++++++XXX',
        'XXX++V+++++++++V++XXX',
        'XXXX+++++++++++++XXXX',
        'XXXXXX+++++++++XXXXXX',
        'XXXXXXXX+++++XXXXXXXX',
        'XXXXXXXX+++++XXXXXXXX',
        'XXXXXXXXY+++YXXXXXXXX', 'XXXXXXXXY+@+YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXX1XXXXX2XXXXX3XXXX',
        'XXXI+IXXXI+IXXXI+IXXX',
        'XXX<++XXX<++XXX<++XXX',
        'XXXL+++++++++++++LXXX',
        'XXXL+++++++++++++LXXX',
        'XXXX++++++K++++++XXXX',
        'XXXXX+++++++++++XXXXX',
        'XXXXX++L+++++L++XXXXX',
        'XXXXX+++++++++++XXXXX',
        'XXXXXX+++++++++XXXXXX',
        'XXXXXXXJ+++++JXXXXXXX',
        'XXXXXXXX+++++XXXXXXXX',
        'XXXXXXXXY+++YXXXXXXXX', 'XXXXXXXXY+@+YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 6 — Grove of Unmoored Names (answer a name; others may be listened to)
  P('grove', {
    kinds: ['path', 'branch'], objectives: ['name'], name: { jp: '{名前|なまえ} の {森|もり}', en: 'The Grove of Unmoored Names' },
    dress: ['meadow', 'ash', 'snow'],
    variants: [
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY:YXXXXXXXXX', 'XXXXXXXXTI!ITXXXXXXXX',
        'XXXXXXT...:...TXXXXXX',
        'XXXXXT.O..:.%..TXXXXX',
        'XXXXT..,..:...O.TXXXX',
        'XXXT.%....:.....,TXXX',
        'XXXT...O..:..,....TXX',
        'XXXT.,....:...%.O.TXX',
        'XXXXT..O..:.......TXX',
        'XXXXXT....:..,.$.TXXX',
        'XXXXXXT.,.:...O.TXXXX',
        'XXXXXXXT..:..TXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY:YXXXXXXXXX', 'XXXXXXXX"I!I"XXXXXXXX',
        'XXXXXX"...:..."XXXXXX',
        'XXXXX"..%.:....."XXXX',
        'XXXX"....;:.,.;..."XX',
        'XXXX".;..:::...%.."XX',
        'XXXX"$...:.:......"XX',
        'XXXXX".%.:.:..;.."XXX',
        'XXXXXX"...::,...."XXX',
        'XXXXXXX"..:....."XXXX',
        'XXXXXXXX".:..,."XXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 7 — Shelves Without Titles (restore a shelf label; ink crawls between the stacks)
  P('stacks', {
    kinds: ['path', 'branch', 'wild'], objectives: ['inscription'], floor: '+', name: { jp: '{題|だい} の ない {書棚|しょだな}', en: 'Shelves Without Titles' },
    dress: ['stone', 'paper'],
    variants: [
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY+YXXXXXXXXX', 'XXXXXXXXLI!ILXXXXXXXX',
        'XXXXXL++++G++++LXXXXX',
        'XXXXL++?+++++++$LXXXX',
        'XXXXL+LLLL+LLLL+LXXXX',
        'XXXXL++++++++&++LXXXX',
        'XXXXL+LLLL+LLLL+LXXXX',
        'XXXXL+&++++++++JLXXXX',
        'XXXXL+LLLL+LLLL+LXXXX',
        'XXXXXL+++++++++LXXXXX',
        'XXXXXXL+++++++LXXXXXX',
        'XXXXXXXY++++YXXXXXXXX', 'XXXXXXXXY+@+YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY+YXXXXXXXXX', 'XXXXXXXXJI!IJXXXXXXXX',
        'XXXXXXL+++G+++LXXXXXX',
        'XXXXXL+++++++++LXXXXX',
        'XXXXL++LL+++LL?+LXXXX',
        'XXXXL++LL+&+LL++LXXXX',
        'XXXXL+++++++++++LXXXX',
        'XXXXL$LL++&++LL+LXXXX',
        'XXXXL+LL+++++LL+LXXXX',
        'XXXXXL+++++++++LXXXXX',
        'XXXXXXL+++++++LXXXXXX',
        'XXXXXXXY++++YXXXXXXXX', 'XXXXXXXXY+@+YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 8 — Wayfarers' Camp (rest, talk, extract early or choose the next road)
  P('camp', {
    kinds: ['camp'], objectives: [], name: { jp: '{旅人|たびびと} の {野営地|やえいち}', en: 'The Wayfarers\' Camp' },
    dress: ['meadow', 'snow', 'shore'], music: 'quiet_road',
    variants: [
      ['XXXX1XXXXXXXXXXX2XXXX',
        'XXXY:YXXXXXXXXXY:YXXX',
        'XXXY:.YXXXXXXXY.:YXXX',
        'X]))Y:.YTTTTTY.:.YXXX',
        'X}})Y.:..,.,..:..YXXX',
        'XX})Y..:.....:..YXXXX',
        'XXXXXY..M.H..,.YXXXXX',
        'XXXXXY.....?...YXXXXX',
        'XXXXXY.,.......YXXXXX',
        'XXXXXXY..,..o.YXXXXXX',
        'XXXXXXY.......YXXXXXX',
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXX1XXXXXXXXXXX2XXXX',
        'XXXY:YXXXXXXXXXY:YXXX',
        'XXXY:.^^^^^^^^^.:YXXX',
        'XXXY.:.,^^^^^,.:.YXXX',
        'XXXXY.:.......:.)))]X',
        'XXXXXY.:.M.H.:..)}}XX',
        'XXXXXY....?.....)XXXX',
        'XXXXXY.,...,...YXXXXX',
        'XXXXXXY..r...,YXXXXXX',
        'XXXXXXY.......YXXXXXX',
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXXY..:..YXXXXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 9 — Court of Unkept Promises (restore what a promise commits to)
  P('court', {
    kinds: ['path', 'branch', 'ante'], objectives: ['promise'], floor: '+', name: { jp: '{守|まも}られなかった {約束|やくそく} の {庭|にわ}', en: 'The Court of Unkept Promises' },
    dress: ['stone', 'meadow', 'snow'],
    variants: [
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY+YXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX',
        'XXXXXXY.I+++I.YXXXXXX',
        'XXXXXY.,++V++,.YXXXXX',
        'XXXXY..+++?+++..YXXXX',
        'XXXXY.I+++++++I.YXXXX',
        'XXXXY..+++++++.&YXXXX',
        'XXXXY.I+++++++I.YXXXX',
        'XXXXXY.,.++$+..YXXXXX',
        'XXXXXXY..+++..YXXXXXX',
        'XXXXXXY.,+++.,YXXXXXX',
        'XXXXXXXY.+++.YXXXXXXX', 'XXXXXXXXY+@+YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY+YXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX',
        'XXXXXXY.r+++..YXXXXXX',
        'XXXXXY...+++.,.YXXXXX',
        'XXXXY.N..+++..V.YXXXX',
        'XXXXY.&..+++....YXXXX',
        'XXXXY.,.+++++.?.YXXXX',
        'XXXXY...+++++...YXXXX',
        'XXXXXY$.,.+..r.YXXXXX',
        'XXXXXXY...+...YXXXXXX',
        'XXXXXXY.,.+.,.YXXXXXX',
        'XXXXXXXY..+..YXXXXXXX', 'XXXXXXXXY+@+YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 10 — Tidal Stair (water steps; the sign here tells you how to cross)
  P('tide', {
    kinds: ['path', 'branch', 'wild'], objectives: ['sign'], name: { jp: '{潮|しお} の {階段|かいだん}', en: 'The Tidal Stair' },
    dress: ['shore'],
    variants: [
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXYsYXXXXXXXXX', 'XXXXXXXXhI!IhXXXXXXXX',
        'XXXXXXYss:G:sYXXXXXXX',
        'XXXX~~~~bbbb~~~~XXXXX',
        'XXXX~~(((ssss(((~XXXX',
        'XXX~~~(s?:s&s[s(~~XXX',
        'XXX~~~~~bbbb~~~~~~XXX',
        'XXXX~~~ssss:ss~~~XXXX',
        'XXXXX~~ss&:ssss~XXXXX',
        'XXXXXX~~bbbbb~~XXXXXX',
        'XXXXXXYss.:.sYXXXXXXX',
        'XXXXXXXYss:ssYXXXXXXX', 'XXXXXXXXYs@sYXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXYsYXXXXXXXXX', 'XXXXXXXXhI!IhXXXXXXXX',
        'XXXXXXXYss:GsYXXXXXXX',
        'XXXXXhwwwwwwwwwhXXXXX',
        'XXXX~~~~~~B~~~~~~XXXX',
        'XXXX~((((sss((((~XXXX',
        'XXXX~([&sss:s?s(~XXXX',
        'XXXX~~~~~~B~~~~~~XXXX',
        'XXXXXhwwwww:wwwwhXXXX',
        'XXXXXXYs&s.:.ssYXXXXX',
        'XXXXXXYss.s:.sYXXXXXX',
        'XXXXXXXYss:ssYXXXXXXX', 'XXXXXXXXYs@sYXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 11 — Field of Margins (paper ground; moths live in the margins)
  P('margin', {
    kinds: ['path', 'branch', 'wild'], objectives: ['inscription'], floor: 'p', name: { jp: '{余白|よはく} の {野原|のはら}', en: 'The Field of Margins' },
    dress: ['paper'],
    variants: [
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXYpYXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX',
        'XXXXXXYppppGppYXXXXXX',
        'XXXXXYpp?pppppp$YXXXX',
        'XXXXYpppppYYpppppYXXX',
        'XXXYppp&ppYYppppppYXX',
        'XXXYpppppppppp&pppYXX',
        'XXXYppYYppppppppppYXX',
        'XXXXYpYYpppppYYpppYXX',
        'XXXXXYppppppppYYpYXXX',
        'XXXXXXYpppppppppYXXXX',
        'XXXXXXXYpppppYXXXXXXX', 'XXXXXXXXYp@pYXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXYpYXXXXXXXXX', 'XXXXXXXXJI!IJXXXXXXXX',
        'XXXXXXXYpppGpYXXXXXXX',
        'XXXXXXYpppppppYXXXXXX',
        'XXXXXYpp&ppp?ppYXXXXX',
        'XXXXYppppYYYppppYXXXX',
        'XXXXYp$ppYYYpp&pYXXXX',
        'XXXXYppppYYYppppYXXXX',
        'XXXXXYppppppppppYXXXX',
        'XXXXXXYpppppppppYXXXX',
        'XXXXXXYppppppppYXXXXX',
        'XXXXXXXYpppppYXXXXXXX', 'XXXXXXXXYp@pYXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 12 — The Still Pool (an echo lives in the water; a name waits at the edge)
  P('pool', {
    kinds: ['path', 'branch', 'wild'], objectives: ['name'], name: { jp: '{静|しず}か な {池|いけ}', en: 'The Still Pool' },
    dress: ['meadow', 'snow', 'ash'],
    variants: [
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY:YXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX',
        'XXXXXXY...:G..YXXXXXX',
        'XXXXXY...:...%.YXXXXX',
        'XXXXY..:"~~~"...YXXXX',
        'XXXY..:"~~~~~"&..YXXX',
        'XXXY.:"~~~~~~~".,YXXX',
        'XXXY.:"~~~~~~~"..YXXX',
        'XXXY.:."~~~~~".$.YXXX',
        'XXXXY.:."~~~"...YXXXX',
        'XXXXXY.::...::.YXXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
      ['XXXXXXXXXX1XXXXXXXXXX', 'XXXXXXXXXY:YXXXXXXXXX', 'XXXXXXXXYI!IYXXXXXXXX',
        'XXXXXXXY..G..YXXXXXXX',
        'XXXXXXY.......%YXXXXX',
        'XXXXXY.,"~~~"..,YXXXX',
        'XXXXY.."~~~~~"...YXXX',
        'XXXY..&"~~~~~"..$.YXX',
        'XXXY...."~~~"..,..YXX',
        'XXXXY.............YXX',
        'XXXXXY..,.....&.YXXXX',
        'XXXXXXY.........YXXXX',
        'XXXXXXXY..:..YXXXXXXX', 'XXXXXXXXY.@.YXXXXXXXX', 'XXXXXXXXXXZXXXXXXXXXX'],
    ],
  });

  // 13 — The Blank Map Room (the guardian at the end of the road)
  P('climax', {
    kinds: ['climax'], objectives: [], floor: 'p', w: 23, h: 17, name: { jp: '{白紙|はくし} の {地図|ちず} の {間|ま}', en: 'The Blank Map Room' },
    dress: ['paper'], music: 'mystery',
    variants: [
      ['XXXXXXXXXXX1XXXXXXXXXXX',
        'XXXXXXXXXXYpYXXXXXXXXXX',
        'XXXXXXXXXYI!IYXXXXXXXXX',
        'XXXXXXXXYppGppYXXXXXXXX',
        'XXXXXXXYpppppppYXXXXXXX',
        'XXXXXXYpppIpIpppYXXXXXX',
        'X]))YYpppppppppppYYXXXX',
        'X}})YpppIpppppIpppYXXXX',
        'XX})YpppppppppppppYXXXX',
        'XXXXY-------------YXXXX',
        'XXXXYpppppppppppppYXXXX',
        'XXXXXYpppIpppIpppYXXXXX',
        'XXXXXXYpppppppppYXXXXXX',
        'XXXXXXXYpppppppYXXXXXXX',
        'XXXXXXXXYpppppYXXXXXXXX',
        'XXXXXXXXXYp@pYXXXXXXXXX',
        'XXXXXXXXXXXZXXXXXXXXXXX'],
      ['XXXXXXXXXXX1XXXXXXXXXXX',
        'XXXXXXXXXXYpYXXXXXXXXXX',
        'XXXXXXXXXYI!IYXXXXXXXXX',
        'XXXXXXXXYppGppYXXXXXXXX',
        'XXXXXXXYJpppppJYXXXXXXX',
        'XXXXXXYppppppppp))))]XX',
        'XXXXXYpppIpppIppY}}XXXX',
        'XXXXYppppppppppppYXXXXX',
        'XXXYpppppppppppppppYXXX',
        'XXXY---------------YXXX',
        'XXXYppIpppppppppIppYXXX',
        'XXXXYpppppppppppppYXXXX',
        'XXXXXYppppppppppppYXXXX',
        'XXXXXXYpppppppppYXXXXXX',
        'XXXXXXXXYpppppYXXXXXXXX',
        'XXXXXXXXXYp@pYXXXXXXXXX',
        'XXXXXXXXXXXZXXXXXXXXXXX'],
    ],
  });

  // 14 — The Road Home (extraction: a lantern that already carries Reedwake's name)
  P('extract', {
    kinds: ['extract'], objectives: [], w: 17, h: 13, name: { jp: '{帰|かえ}り{道|みち}', en: 'The Road Home' },
    dress: ['meadow', 'shore', 'snow'], music: 'wonder',
    variants: [
      ['XXXXXXXXXXXXXXXXX',
        'XXXXXXXYYYXXXXXXX',
        'XXXXXXY,.?.YXXXXX',
        'XXXXXY.,.:.,.YXXX',
        'XXXXY.U..:..U.YXX',
        'XXXXY.,..:.,..YXX',
        'XXXXY.o..:..,.YXX',
        'XXXXY.U..:..U.YXX',
        'XXXXXY.,.:.,.YXXX',
        'XXXXXXY..:..YXXXX',
        'XXXXXXY..:..YXXXX',
        'XXXXXXXY.@.YXXXXX',
        'XXXXXXXXXZXXXXXXX'],
      ['XXXXXXXXXXXXXXXXX',
        'XXXXXXXYYYXXXXXXX',
        'XXXXXXY".?."YXXXX',
        'XXXXXY"..:.."YXXX',
        'XXXXY"U..:..U"YXX',
        'XXXXY",..:..,"YXX',
        'XXXXYw...:...wYXX',
        'XXXXYwU..:..UwYXX',
        'XXXXXY...:...YXXX',
        'XXXXXXY..:..YXXXX',
        'XXXXXXY.,:,.YXXXX',
        'XXXXXXXY.@.YXXXXX',
        'XXXXXXXXXZXXXXXXX'],
    ],
  });

  // Dressings: how generic ground characters are re-skinned.
  A.dressings = {
    meadow: {},
    shore: { '.': 's', ',': 's', ';': '.', o: 'h', T: 'Q', '"': '"' },
    snow: { '.': '*', ',': '*', ';': '*', o: 'R', T: 'P', r: 'R', O: 'P', '"': 'R' },
    ash: { '.': 'a', ',': '.', ';': 'a', o: 'n', T: 'n', O: 'O' },
    paper: { '.': 'p', ',': 'Y', ';': 'p', o: 'L', T: 'L', r: 'L', O: 'L' },
    stone: {},
  };
  // Anchor → decoration prop.
  A.decoProps = { I: 'pillar', U: 'lantern', V: 'statue', N: 'stone_marker', J: 'bookpile', H: 'campfire', M: 'tent', Z: 'atlas_fold' };
})(RB.content);
