/* The people a road's events are met through (RE-1; Robin, 2026-10-19: "These random events on the paths should have
 * actual NPCs where the event is meant to take place"): figures for the unnamed travellers, children, fishers and
 * sellers the events' narration describes. Named people (Kōhachi with his cart, Kumazō, Jūzō …) stand as themselves;
 * these are for everyone else. Each region file places them with `at` on its road's events (05_author.js L.road). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const F = (id, name, pitch, look, portrait, o) => { C.chars[id] = Object.assign({ name, voice: { pitch }, look, portrait }, o || {}); };
  F('lw_rd_child', T('A child', '{子|こ}ども'), 1.32,
    { skin: 2, hair: 'bob', hairColor: 1, cloth: ['#c8603a', '#a44c2c', '#f2e6cc'], shape: 'tunic', acc: [] },
    { eyes: 'round', style: 'bob', blush: true, bg: '#3a2418' }, { size: 'child' });
  // the geese the child herds along the Reedwake road (RBN-QA-049): one actor, a small flock (30_sprites.js custom.geese)
  C.chars.lw_rd_geese = { name: T('Geese', 'ガチョウ'), voice: { pitch: 1.2 }, look: { custom: 'geese' } };
  F('lw_rd_child2', T('A child', '{子|こ}ども'), 1.3,
    { skin: 3, hair: 'spiky', hairColor: 0, cloth: ['#4a7a9a', '#3a6280', '#efe6d0'], shape: 'tunic', acc: [] },
    { eyes: 'round', style: 'spiky', blush: true, bg: '#1e2c38' }, { size: 'child' });
  F('lw_rd_fisher', T('An old fisher', '{年|とし}{寄|よ}り の {漁師|りょうし}'), 0.82,
    { skin: 4, hair: 'shaved', hairColor: 4, cloth: ['#3e5a6a', '#2e4652', '#d8ccb0'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0cc' },
    { eyes: 'narrow', style: 'shaved', acc: ['headband'], bandCol: '#e8e0cc', beard: true, bg: '#1c2a32' });
  F('lw_rd_seller', T('A fish-seller', '{魚売|さかなう}り'), 1.02,
    { skin: 2, hair: 'wrap', hairColor: 1, cloth: ['#6a4a8a', '#56386e', '#f0e4c8'], shape: 'apron', acc: ['scarf'], scarfCol: '#d8b860' },
    { eyes: 'soft', style: 'wrap', bg: '#2a2034' });
  F('lw_rd_traveller', T('A traveller', '{旅人|たびびと}'), 0.94,
    { skin: 1, hair: 'short', hairColor: 2, cloth: ['#7a6a4a', '#62553a', '#e8dcc0'], shape: 'robe', acc: ['hat', 'satchel'], hatCol: '#b89a60' },
    { eyes: 'soft', style: 'short', acc: ['hat'], hatCol: '#b89a60', bg: '#2a2418' });
  F('lw_rd_traveller2', T('A traveller', '{旅人|たびびと}'), 1.08,
    { skin: 3, hair: 'ponytail', hairColor: 0, cloth: ['#4a6a4a', '#3a5438', '#ece2c8'], shape: 'coat', acc: ['satchel'] },
    { eyes: 'round', style: 'ponytail', bg: '#1c2a1c' });
  F('lw_rd_pilgrim', T('A pilgrim', '{巡礼|じゅんれい} の {人|ひと}'), 0.98,
    { skin: 2, hair: 'shaved', hairColor: 3, cloth: ['#ece8dc', '#d4cebe', '#b8b0a0'], shape: 'robe', acc: ['hat', 'cane'], hatCol: '#d8c890' },
    { eyes: 'narrow', style: 'shaved', acc: ['hat'], hatCol: '#d8c890', bg: '#2e2c26' });
  F('lw_rd_courier', T('A courier', '{飛脚|ひきゃく}'), 1.1,
    { skin: 3, hair: 'short', hairColor: 0, cloth: ['#3a5a8a', '#2c466c', '#f0e4c8'], shape: 'tunic', acc: ['headband', 'satchel'], bandCol: '#f0e4c8' },
    { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#f0e4c8', bg: '#1a2436' });
  F('lw_rd_parent', T('A parent', '{親|おや}'), 0.96,
    { skin: 2, hair: 'bun', hairColor: 1, cloth: ['#8a5a4a', '#6e463a', '#ecdcc4'], shape: 'robe', acc: ['basket'] },
    { eyes: 'soft', style: 'bun', bg: '#2e1e18' });
  F('lw_rd_elder', T('An old traveller', '{年|とし}{寄|よ}り の {旅人|たびびと}'), 0.86,
    { skin: 1, hair: 'bun', hairColor: 4, cloth: ['#5a5a6a', '#464654', '#e4dcc8'], shape: 'robe', acc: ['cane', 'hat'], hatCol: '#a89a70' },
    { eyes: 'narrow', style: 'bun', acc: ['hat'], hatCol: '#a89a70', bg: '#24242c' });
  F('lw_rd_worker', T('A worker', '{働|はたら}く {人|ひと}'), 0.9,
    { skin: 4, hair: 'short', hairColor: 0, cloth: ['#6a5a3a', '#54472c', '#d8c8a0'], shape: 'tunic', acc: ['headband', 'toolbelt'], bandCol: '#d8c8a0' },
    { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#d8c8a0', bg: '#262014' });
})(RB.content);
