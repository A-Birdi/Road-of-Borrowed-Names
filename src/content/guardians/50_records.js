/* The old guardians: their rewards (expansion P15e; plan E16; C-53: stamps, illustrations and cosmetics only, never
 * an essential). For each: a stamp (K1) in its own family, pressed when the guardian settles and carrying the honest
 * record of the win (src/engine/98g_guardians.js); a page in the travel volume (K2), witnessed when it settles and
 * revealable before then by confirmation (H1: then viewable, never witnessed); a keepsake to wear. Hidden until won,
 * with spoiler-safe words; nothing asks for a setting, an input mode, going without help or a time (C-13). Each
 * page is the painting of the place just after it settles (sequence gd.<key>, src/ui/43n_seq_post.js; P16). Hidden
 * criteria name no place, so a journey still under way learns nothing of the regions to come. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.items = C.items || {};
  // key: [the guardian, its stamp's motif and ink, its keepsake]
  const D = {
    rw: ['gd.founder', 'wave', '#6a7a4a', T('The founder\'s miller\'s cap', '{粉屋|こなや} の {帽子|ぼうし}'), 'Flour-white and patched, older than the village. The founder\'s voice left it between the millstones.', 'cap', { capCol: '#e6dcc4' }],
    sg: ['gd.headoffice', 'seal', '#2a3a4c', T('Head Office spectacles', '{本局|ほんきょく} の {眼鏡|めがね}'), 'Left in the top drawer "for the next clerk".', 'glasses', { glassCol: '#5a6a7a', glassChainCol: '#c8a858' }],
    co: ['gd.firstfire', 'firework', '#b04a22', T('Ember scarf', '{熾火|おきび} {色|いろ} の {襟巻|えりま}き'), 'Dyed the colour of the First Fire, and somehow always a little warm.', 'scarf', { scarfCol: '#c4502a', scarfStripe: '#f0a050' }],
    sb: ['gd.sisterstar', 'lantern', '#4a5a8a', T('Star earrings', '{星|ほし} の {耳飾|みみかざ}り'), 'Two chips of starlight the Sister Star left on the observatory floor.', 'earrings', { earCol: '#eef0ff' }],
    lf: ['gd.maker', 'bell', '#7a5a2a', T('The maker\'s little bell', '{鋳物師|いもじ} の {小鈴|こすず}'), 'A little bronze bell that rings the same low note as the Drowned Bell.', 'bell', { bellCol: '#9a7a3a' }],
    mb: ['gd.bridgefounder', 'bridge', '#3a5a7a', T('Bridge-builder\'s headband', '{橋大工|はしだいく} の {鉢巻|はちまき}'), 'Old indigo, unfaded, tied round the first bridge\'s oldest pile.', 'headband', { bandCol: '#2e4a6a' }],
    cr: ['gd.oxelder', 'mountain', '#6a7a8a', T('Cloud cape', '{雲|くも} の {合羽|かっぱ}'), 'White as the Elder, light, and always a little damp.', 'cape', { capeCol: '#e4e8ee' }],
    yn: ['gd.kettlemother', 'steam', '#5a5258', T('Steam-grey hood', '{湯気|ゆげ} {色|いろ} の {頭巾|ずきん}'), 'Folded on the edge of the Kettle\'s pool after its mother went back to sleep.', 'hood', { hoodCol: '#b8b2aa' }],
    ko: ['gd.firstkeeper', 'leaf', '#3a6a3a', T('The First Leaf', '{最初|さいしょ} の {葉|は}'), 'Left on the newest shelf, addressed to you.', 'leaf', { leafCol: '#4a8a3a' }],
  };
  C.guardianRewards = D;
  for (const k of Object.keys(D)) {
    const [enemy, motif, ink, kname, kdesc, acc, wear] = D[k];
    const e = C.enemies[enemy];
    C.stamps['gd.' + k] = { id: 'gd.' + k, family: 'guardian', title: e.name, hidden: true, stand: null, when: 'ed>=2&gd.' + k,
      criteria: T('An old guardian, awake after the story: settled.', '{古|ふる}い {守|まも}り{手|て}'),
      design: { shape: 'circle', motif, ink } };
    C.items['gd_' + k + '_keepsake'] = { name: kname, desc: kdesc + ' A keepsake: it changes only how you look.', slot: 'cosmetic', acc, wear };
  }
  // the travel volume's page of each guardian (K2; H1): witnessed when it settles, revealable before
  if (RB.volume) for (const k of Object.keys(D)) {
    const st = C.stamps['gd.' + k];
    RB.volume.add({ id: 'gd.' + k, chapter: 'post', kind: 'guardian', special: true, flag: 'gd.' + k, title: st.title, seq: 'gd.' + k, scene: 'gd.' + k,
      criteria: { en: 'An old guardian, awake after the story: settled.', jp: '{古|ふる}い {守|まも}り{手|て}' } });
  }
})(RB.content);
