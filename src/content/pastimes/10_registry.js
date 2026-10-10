/* The pastimes that came before the expansion, on the Ledger's Distractions tab (K7): shiritori with your companion
 * (src/ui/87_wordplay*.js) and A Quiet Cast's fishing (src/ui/86_fishing*.js). Their games and records are their own;
 * these entries only give each a page: what it is, how to play, where, and the records it already keeps. Shogi's entry
 * is with its ladder (00_shogi.js). Twelve-chapter journeys only (F-21). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  if (!RB.pastimes) return;
  const T = (en, jp) => ({ en, jp });
  const ed2 = (s) => !!(RB.edition && RB.edition.of(s) >= 2);

  RB.pastimes.define('shiritori', {
    order: 10, title: T('Shiritori', 'しりとり'), kind: 'game', activity: 'shiritori', companion: true, art: 'shiritori',
    venue: T('At a quiet rest stop with your companion: an inn, the teahouse, a hut or a camp.', '{宿|やど} や {茶屋|ちゃや} で {休|やす}む とき'),
    met: (s) => ed2(s) && !!(s.comp || (s.practice && s.practice.shiritori && Object.keys(s.practice.shiritori.byCompanion || {}).length)),
    blurb: T('A word game as old as the road: each word begins with the sound the last one ended on.', '{前|まえ} の {言葉|ことば} の {最後|さいご} の {音|おと} から {始|はじ}める 。'),
    howto: [
      T('Your companion says a word. Answer with a word that begins with its last sound.', '{最後|さいご} の {音|おと} で {始|はじ}まる {言葉|ことば} を {言|い}う 。'),
      T('Nothing can follow a word that ends in ん: whoever says one loses.', '「ん」 で {終|お}わったら {負|ま}け 。'),
      T('No word twice in one game. Suggestions are there if you want them, and never count against you.', '{同|おな}じ {言葉|ことば} は {一度|いちど} だけ 。'),
    ],
    records: (s) => {
      const WP = RB.wordplay;
      if (!WP || !s.comp) return [];
      const cells = WP.cells(s, s.comp), won = cells.filter((x) => x.state === 'won').length;
      const r = WP.peek(s, s.comp);
      const out = [{ en: 'Stages won with ' + ((C.chars[s.comp] || {}).name || {}).en, value: won + ' of ' + cells.length }];
      if (r && r.cooperative && r.cooperative.best) out.push({ en: 'Longest chain together', value: r.cooperative.best + ' words' });
      return out;
    },
  });

  RB.pastimes.define('fishing', {
    order: 90, title: T('A quiet cast', '{静|しず}か な {釣|つ}り'), kind: 'game', activity: 'fishing', companion: false, art: 'fishing',
    venue: T('At Yasu\'s three stations: the Reedwake riverbank, the pond by the Lantern Road and the Saltglass quay, once the survey has begun.', '{三|みっ}つ の {釣|つ}り{場|ば}'),
    // Yasu's survey begins once the journey has reached its end (the fishing engine's own rule)
    met: (s) => ed2(s) && !!RB.fishing && (!!(s.flags && s.flags.postgame) || RB.fishing.distinct(s) > 0),
    blurb: T('A peaceful pastime: nine fish to meet, each drawn in your Fishing notes the first time you see one.', '{魚|さかな} を {見|み}る {静|しず}か な {時間|じかん} 。'),
    howto: [
      T('Stand at one of the stations and choose to fish.', '{釣|つ}り{場|ば} に {立|た}つ 。'),
      T('Read the water, choose where to cast, and wait.', '{水|みず} を {見|み}て 、 {待|ま}つ 。'),
      T('A fish seen for the first time is drawn in your notes, with where and with whom.', '{初|はじ}めて {見|み}た {魚|さかな} は ノート に {描|か}かれる 。'),
    ],
    records: (s) => (RB.fishing ? [{ en: 'Fish met', value: RB.fishing.distinct(s) + ' of ' + RB.fishing.FISH_ORDER.length }] : []),
  });
})(RB.content);
