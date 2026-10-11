/* The old guardians built round an argument (expansion P15e; plan E16; the social encounter of E5): settled by
 * listening, asking, showing and proposing, never by Unravel (C-09). Each has something it says, something it does
 * not say until asked or left a silence, and a proposal that only lands once both are heard. A blunt word sends it
 * away (an end, never a defeat: come back and try again); every phrase is chosen at the profile's level.
 *   gd.sg  the Head Office: no letter without its seal (formal register; evidence kept in writing, 〜てある, 〜ておく)
 *   gd.lf  the Bell's Maker: break the bell and cast it again (why it was hurried; what it did; objecting kindly)
 *   gd.mb  the Bridge Founder: one bridge, to the plan (what is carved there; a bargain with conditions) */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  // one phrase for every level: two options below Intermediate, three from Intermediate up
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }

  // ---- the Head Office (Saltglass) -----------------------------------------------------------------------------------------
  C.encounters['gd.sg'] = {
    id: 'gd.sg', kind: 'social', name: say('{本局|ほんきょく}', 'The Head Office'), story: true, canFlee: true, guardian: 'sg',
    // help after a defeat (E19), as every story encounter offers: what the argument is about, then a way through
    help: { explain: { en: 'The Head Office is not angry with you. It is an office that has had no clerks for a very long time, and it has forgotten what its seal was for. Find out when a clerk last came.' },
      suggest: { en: 'Say its rule back to it, ask when a clerk last came, and wait for it to say what its work was for; then show it the harbour post\'s book, and offer a copy kept at the post in place of the seal.' } },
    lead: { enemy: 'gd.headoffice' },
    rules: { wait: true },
    autoRoute: ['s:restate', 's:ask', 'wait', 's:ledger', 's:copy'],
    social: {
      parties: [{ aid: 'n:office', name: say('{本局|ほんきょく}', 'the Head Office'), stance: 'heated', wants: { en: 'Every letter in Saltglass held back until the head office has sealed it.' } }],
      claims: {
        rule: { by: 'n:office', jp: '{全|すべ}て の {手紙|てがみ} に は 、 {本局|ほんきょく} の {印|いん} が {要|い}る 。 {印|いん} の ない {手紙|てがみ} を {届|とど}けて は ならない 。', en: 'Every letter requires the head office\'s seal. No letter without one may be delivered.' },
        last: { by: 'n:office', jp: '{最後|さいご} に {書記|しょき} が {来|き}た の は …… いつ で あった か 。 {記録|きろく} が 、 そこ で {途切|とぎ}れて いる 。', en: 'When did a clerk last come… The record breaks off there.', hidden: true },
        wish: { by: 'n:office', jp: '{我々|われわれ} の {仕事|しごと} は 、 {手紙|てがみ} を {止|と}める こと で は なかった 。 {届|とど}ける こと だった 。 …… {届|とど}いて いる の か 。', en: 'Our work was never to stop letters. It was to deliver them. …Are they being delivered?', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{帳面|ちょうめん} に {自分|じぶん} の {判|はん} を {押|お}す', 'Press your own seal in its ledger'), desc: 'Press your seal on its open ledger, as a clerk would sign for a delivery.', effect: { understanding: 1, stance: { 'n:office': 'listening' } }, once: true, says: { en: 'You press your seal on the open page. The Head Office leans down to read it, and for a moment its drawers stop rattling.' } },
      unravelTip: { en: 'Nothing is knotted. It is an office that has had no clerks for a very long time.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{印|いん} の ない {手紙|てがみ} が 、 ご{心配|しんぱい} なの です ね 。', 'Say back its worry about unsealed letters'),
          task: task('g:n_desu', 'Which says back, politely, what it is worried about?', '{印|いん} の ない {手紙|てがみ} が 、 ご{心配|しんぱい} なの です ね 。', '{印|いん} なんか 、 どう でも いい でしょう 。', 'That waves its worry away.', '{手紙|てがみ} を {全部|ぜんぶ} {燃|も}やしましょう 。', 'Nobody wants the letters burned.'),
          cases: [{ when: { stance: { 'n:office': 'heated' } }, effect: { stance: { 'n:office': 'listening' }, understanding: 1 }, says: { en: 'The drawers stop slamming. "Precisely," says the Head Office. "Unsealed. Unrecorded. Unaccounted for."' } }],
          says: { en: 'It is already listening, its stamps held still.' } },
        { id: 'ask', kind: 'ask', label: say('{最後|さいご} に {本局|ほんきょく} から {書記|しょき} が {来|き}た の は 、 いつ です か 。', 'Ask when a clerk last came from the head office'), once: true, when: { stance: { 'n:office': 'listening' } },
          task: task('g:keigo_kenjo', 'Which asks when a clerk last came from the head office?', '{最後|さいご} に {本局|ほんきょく} から {書記|しょき} が {来|き}た の は 、 いつ です か 。', '{本局|ほんきょく} は 、 どこ に あります か 。', 'That asks where it is, not when anyone came.', '{書記|しょき} に なりたい ん です が 。', 'That asks for a job.'),
          effect: { reveal: 'last', understanding: 1 }, says: { en: 'Pages turn by themselves, faster and faster, and stop at a blank one. "When did a clerk last come… The record breaks off there."' } },
        { id: 'ledger', kind: 'evidence', label: say('{港|みなと} の {郵便|ゆうびん} の {帳面|ちょうめん} に 、 {届|とど}いた {日|ひ} が {全部|ぜんぶ} {書|か}いて あります 。', 'Show it the harbour post\'s book: every delivery written down'), once: true, when: { claims: ['wish'] },
          task: task('g:te_aru', 'Which tells it every delivery has been written down?', '{港|みなと} の {郵便|ゆうびん} の {帳面|ちょうめん} に 、 {届|とど}いた {日|ひ} が {全部|ぜんぶ} {書|か}いて あります 。', '{港|みなと} の {郵便|ゆうびん} の {帳面|ちょうめん} は 、 {真|ま}っ{白|しろ} です 。', 'That says nothing was written.', '{帳面|ちょうめん} を {書|か}く {人|ひと} は 、 もう いません 。', 'There is: the post office keeps it.'),
          effect: { flag: 'shown', understanding: 1 }, says: { en: 'You hold up the post office\'s delivery book. The Head Office reads it, page after page. "Received. Received. Received," it murmurs. "They are being delivered."' } },
        { id: 'copy', kind: 'propose', label: say('{印|いん} の {代|か}わり に 、 {港|みなと} の {郵便|ゆうびん} で {控|ひか}え を {取|と}って おきます 。 それ で よろしい でしょう か 。', 'Propose the harbour post keeps a copy, in place of the seal'), when: { all: [{ claims: ['last'] }, { flag: 'shown' }] },
          task: task('g:te_oku', 'Which proposes, politely, that the harbour post keep a copy in place of the seal?', '{印|いん} の {代|か}わり に 、 {港|みなと} の {郵便|ゆうびん} で {控|ひか}え を {取|と}って おきます 。 それ で よろしい でしょう か 。', '{印|いん} が ない まま 、 {何|なに} も {書|か}かず に {届|とど}けます 。', 'That gives it nothing it can keep.', '{全部|ぜんぶ} の {手紙|てがみ} を 、 {本局|ほんきょく} に {送|おく}り{返|かえ}します 。', 'That stops every letter again.'),
          effect: { flag: 'agreed', understanding: 1 }, says: { en: '"A copy," says the Head Office slowly, "kept on file." It stamps the air once, firmly. "Approved."' } },
        { id: 'blunt', kind: 'propose', label: say('{本局|ほんきょく} なんて 、 もう ない よ 。', 'Tell it bluntly that the head office is gone'), lasting: true, means: { en: 'You will tell it, bluntly, that it no longer exists.' },
          task: task('g:register_polite_plain', 'Which tells it bluntly that it no longer exists?', '{本局|ほんきょく} なんて 、 もう ない よ 。', '{本局|ほんきょく} の お{仕事|しごと} は 、 {大変|たいへん} でした ね 。', 'That is kind, not blunt.', '{本局|ほんきょく} は 、 どちら です か 。', 'That asks where it is.'),
          effect: { stance: { 'n:office': 'leaving' } }, says: { en: 'Every drawer in the wall slams shut at once. The Head Office folds itself away like a ledger closed in your face.' } },
      ],
      responses: {
        light: { effect: { stance: { 'n:office': 'listening' } }, says: { en: 'You hold up a light to its ledgers. For the first time in years it can read its own last page.' } },
        water: { says: { en: 'You think better of it: water and ledgers do not mix.' } },
        unravel: { says: { en: 'There is nothing to untie. It is an office waiting for a clerk.' } },
      },
      wait: { when: { stance: { 'n:office': 'listening' } }, effect: { reveal: 'wish', understanding: 1 }, says: { en: 'In the quiet the Head Office speaks, almost to itself: "Our work was never to stop letters. It was to deliver them. …Are they being delivered?"' } },
      companion: {
        nao: [{ id: 'nao_post', name: say('{配達|はいたつ} の {話|はなし}', 'A courier\'s word'), desc: 'Nao has carried letters on every road you walked.', once: true, effect: { understanding: 1, stance: { 'n:office': 'listening' } }, says: { en: 'Nao: "I\'ve carried letters over three mountains. Every one got there. Want me to sign your book?" The Head Office, astonishingly, does.' } }],
        mio: [{ id: 'mio_order', name: say('{薬棚|くすりだな} の {順番|じゅんばん}', 'Like a medicine chest'), desc: 'Mio understands wanting everything in its drawer.', once: true, effect: { understanding: 1, stance: { 'n:office': 'listening' } }, says: { en: 'Mio: "I keep my remedies in labelled drawers too. It isn\'t fussiness. It\'s so nothing gets lost." The drawers rattle, pleased.' } }],
        ren: [{ id: 'ren_record', name: say('{記録|きろく} を {読|よ}む', 'Read its record'), desc: 'Ren reads old hands well.', once: true, effect: { reveal: 'last', understanding: 1 }, says: { en: 'Ren reads the last full page aloud: a date, a clerk\'s name, "returned to Saltglass". Then nothing. "Your clerk went home," Ren says gently. "And stayed."' } }],
        suzu: [{ id: 'suzu_bow', name: say('{丁寧|ていねい} な お{辞儀|じぎ}', 'A proper bow'), desc: 'Suzu knows how to play to a stickler.', once: true, effect: { understanding: 1, stance: { 'n:office': 'listening' } }, says: { en: 'Suzu bows, deeply and correctly, the way you bow to a theatre owner on opening night. The Head Office straightens its stamps.' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:office': 'heated' } }] }, once: true, effect: { stance: { 'n:office': 'listening' } }, says: { en: 'Outside, the bell for the noon post rings. The Head Office stops mid-sentence to listen to it.' } }],
    },
    conclusions: [
      { id: 'left', when: { left: 'n:office' }, result: 'end', text: { en: 'The Head Office has shut itself away. It will open again for someone who speaks to it properly.' } },
      { id: 'approved', when: { all: [{ flag: 'agreed' }, { understanding: 3 }] }, result: 'win', text: { en: 'The Head Office approves: a copy on file at the harbour post, and every letter on its way.' } },
      { id: 'heard', when: { understanding: 4 }, result: 'win', text: { en: 'The Head Office has heard that its letters arrive. That was all it ever wanted to know.' } },
    ],
  };

  // ---- the Bell's Maker (Lanternfall) --------------------------------------------------------------------------------------
  C.encounters['gd.lf'] = {
    id: 'gd.lf', kind: 'social', name: say('{鐘|かね} の {鋳物師|いもじ}', 'The Bell\'s Maker'), story: true, canFlee: true, guardian: 'lf',
    help: { explain: { en: 'The Maker wants to break the Drowned Bell because it was cast in a hurry, in a single night of the flood year. What the Maker never learned is whether it did anyone any good.' },
      suggest: { en: 'Say the wish back, ask why it was cast in one night, and wait; then tell the Maker what the town\'s record says the bell did that night, and ask for it to be kept.' } },
    lead: { enemy: 'gd.maker' },
    rules: { wait: true },
    autoRoute: ['s:restate', 's:why', 'wait', 's:record', 's:keep'],
    social: {
      parties: [{ aid: 'n:maker', name: say('{鋳物師|いもじ}', 'the Bell\'s Maker'), stance: 'heated', wants: { en: 'To break the Drowned Bell and cast it again, properly this time.' } }],
      claims: {
        flaw: { by: 'n:maker', jp: 'あの {鐘|かね} は 、 {音|おと} が {低|ひく}い 。 {急|いそ}いで {鋳|い}た から だ 。 {割|わ}って 、 {鋳|い}{直|なお}す しか ない 。', en: 'That bell rings flat. I cast it in a hurry. There\'s nothing for it but to break it and cast it again.' },
        night: { by: 'n:maker', jp: '{洪水|こうずい} の {年|とし} だった 。 {一晩|ひとばん} で {鋳|い}た 。 {町|まち} に は 、 {鳴|な}らす もの が {何|なに} も なかった から 。', en: 'It was the flood year. I cast it in a single night, because the town had nothing to ring.', hidden: true },
        wish: { by: 'n:maker', jp: '…… あの {夜|よる} 、 {鐘|かね} は {誰|だれ} か の {役|やく} に {立|た}った の か 。 {私|わたし} は 、 それ を {知|し}らない まま だった 。', en: '…That night, was the bell any use to anyone? I never found out.', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{鐘|かね} を {一度|いちど} {鳴|な}らす', 'Ring the bell once'), desc: 'Ring the Drowned Bell once, gently, and let its low note fill the hall.', effect: { understanding: 1, stance: { 'n:maker': 'listening' } }, once: true, says: { en: 'You ring it once. The note is low and long, and somewhere below in the town a door opens and someone looks up. The Maker turns to listen.' } },
      unravelTip: { en: 'Nothing is knotted. The Maker is ashamed of a hurried night\'s work.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{音|おと} が {低|ひく}い の が 、 {気|き} に なる ん です ね 。', 'Say back what bothers the Maker'),
          task: task('g:n_desu', 'Which says back what bothers the Maker?', '{音|おと} が {低|ひく}い の が 、 {気|き} に なる ん です ね 。', '{音|おと} なんて 、 {誰|だれ} も {聞|き}いて いません よ 。', 'That dismisses the Maker\'s care.', '{鐘|かね} は 、 {重|おも}すぎる ん です ね 。', 'Weight is not the complaint.'),
          cases: [{ when: { stance: { 'n:maker': 'heated' } }, effect: { stance: { 'n:maker': 'listening' }, understanding: 1 }, says: { en: 'The hammer stops. "Flat," says the Maker. "A whole tone flat. Everyone must hear it."' } }],
          says: { en: 'The Maker is already listening, hammer lowered.' } },
        { id: 'why', kind: 'ask', label: say('どうして 、 そんな に {急|いそ}いで {鋳|い}た ん です か 。', 'Ask why it was cast in such a hurry'), once: true, when: { stance: { 'n:maker': 'listening' } },
          task: task('g:n_desu', 'Which asks why the bell was cast in such a hurry?', 'どうして 、 そんな に {急|いそ}いで {鋳|い}た ん です か 。', 'いつ 、 {鐘|かね} を {割|わ}る ん です か 。', 'That asks when, and agrees to break it.', '{鐘|かね} は 、 いくら でした か 。', 'That asks the price.'),
          effect: { reveal: 'night', understanding: 1 }, says: { en: 'The Maker looks at the floor. "It was the flood year. I cast it in a single night, because the town had nothing to ring."' } },
        { id: 'record', kind: 'evidence', label: say('{町|まち} の {記録|きろく} に よる と 、 あの {夜|よる} 、 {鐘|かね} の おかげ で 、 {皆|みな} {逃|に}げられた そう です 。', 'Tell the Maker what the town\'s records say of that night'), once: true, when: { claims: ['wish'] },
          task: task('g:okage_sei', 'Which tells the Maker that, by the records, the bell got everyone out?', '{町|まち} の {記録|きろく} に よる と 、 あの {夜|よる} 、 {鐘|かね} の おかげ で 、 {皆|みな} {逃|に}げられた そう です 。', '{町|まち} の {記録|きろく} に よる と 、 {鐘|かね} の せい で 、 {皆|みな} {逃|に}げ{遅|おく}れた そう です 。', 'せいで blames it, and the records say otherwise.', '{記録|きろく} に は 、 {何|なに} も {書|か}いて ありません 。', 'The records remember that night.'),
          effect: { flag: 'saved', understanding: 1 }, says: { en: 'The Maker is silent a long time. "Everyone," they say at last. "On a flat note." They laugh, once, and it sounds like crying.' } },
        { id: 'keep', kind: 'propose', label: say('お{気持|きも}ち は {分|わ}かります が 、 {割|わ}る こと に は {賛成|さんせい} し かねます 。 あの {低|ひく}い {音|おと} が 、 {町|まち} の {音|おと} です から 。', 'Object, kindly, to breaking it: the low note is the town\'s'), when: { flag: 'saved' },
          task: task('g:lf_kaneru', 'Which objects, kindly and firmly, to breaking the bell?', 'お{気持|きも}ち は {分|わ}かります が 、 {割|わ}る こと に は {賛成|さんせい} し かねます 。 あの {低|ひく}い {音|おと} が 、 {町|まち} の {音|おと} です から 。', 'どうぞ 、 {割|わ}って ください 。', 'That agrees to break it.', '{賛成|さんせい} です 。 {早|はや}く {鋳|い}{直|なお}しましょう 。', 'That agrees too, and hurries it.'),
          effect: { flag: 'kept', understanding: 1 }, says: { en: '"An objection," says the Maker, and for the first time smiles. "Lanternfall always did love an objection." They put the hammer down.' } },
        { id: 'blunt', kind: 'propose', label: say('{鐘|かね} の こと は 、 もう {放|ほう}って おいて ください 。', 'Tell the Maker to leave the bell alone'), lasting: true, means: { en: 'You will tell the Maker to leave the bell alone.' },
          task: task('g:v_te_kudasai', 'Which tells the Maker to leave the bell alone?', '{鐘|かね} の こと は 、 もう {放|ほう}って おいて ください 。', '{鐘|かね} の こと を 、 もっと {聞|き}かせて ください 。', 'That invites the Maker to say more.', '{鐘|かね} を 、 {一緒|いっしょ} に {見|み}ましょう 。', 'That offers to look together.'),
          effect: { stance: { 'n:maker': 'leaving' } }, says: { en: 'The Maker shoulders the hammer without a word and walks into the bronze of the bell, and is gone.' } },
      ],
      responses: {
        bell: { effect: { stance: { 'n:maker': 'listening' } }, says: { en: 'You ring a little bell of your own. Its bright note and the great bell\'s low hum sound together, and the Maker cocks their head.' } },
        water: { says: { en: 'The bell has had enough water for one lifetime.' } },
        unravel: { says: { en: 'Nothing is knotted. The Maker is ashamed of a hurried night\'s work.' } },
      },
      wait: { when: { all: [{ stance: { 'n:maker': 'listening' } }, { claims: ['night'] }] }, effect: { reveal: 'wish', understanding: 1 }, says: { en: 'In the quiet, the Maker lays a hand on the bronze. "…That night, was it any use to anyone? I never found out."' } },
      companion: {
        nao: [{ id: 'nao_rush', name: say('{急|いそ}ぎ の {仕事|しごと}', 'A rush job'), desc: 'Nao knows about doing a thing fast because it had to be done.', once: true, effect: { understanding: 1, stance: { 'n:maker': 'listening' } }, says: { en: 'Nao: "Fastest run I ever made, the letter was a mess and the seal was crooked. It got there. That\'s the job."' } }],
        mio: [{ id: 'mio_scar', name: say('{傷|きず} の {話|はなし}', 'About scars'), desc: 'Mio talks about stitches done in a hurry.', once: true, effect: { understanding: 1, stance: { 'n:maker': 'listening' } }, says: { en: 'Mio: "The worst stitches I ever put in were on a flood night, by lamplight. The man still has the scar. He shows it to his grandchildren."' } }],
        ren: [{ id: 'ren_inscription', name: say('{銘|めい} を {読|よ}む', 'Read the inscription'), desc: 'Ren reads the inscription on the bell\'s lip.', once: true, effect: { reveal: 'night', understanding: 1 }, says: { en: 'Ren kneels and reads the rough letters on the bell\'s lip: "Cast in one night, the year of the water." The Maker flinches, then nods.' } }],
        suzu: [{ id: 'suzu_flat', name: say('{低|ひく}い {音|おと} で {歌|うた}う', 'Sing on the low note'), desc: 'Suzu sings a phrase pitched to the bell.', once: true, effect: { understanding: 1, stance: { 'n:maker': 'listening' } }, says: { en: 'Suzu hums a phrase from the troupe\'s flood song, pitched right on the bell\'s note. It fits exactly. "Funny," Suzu says. "It\'s the note the whole song\'s in."' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:maker': 'heated' } }] }, once: true, effect: { stance: { 'n:maker': 'listening' } }, says: { en: 'Down in the town, children are singing the bell song, flat, the way they learned it. The Maker stops to listen.' } }],
    },
    conclusions: [
      { id: 'left', when: { left: 'n:maker' }, result: 'end', text: { en: 'The Maker has gone into the bronze. The bell is still whole; you can come back and talk again.' } },
      { id: 'kept', when: { all: [{ flag: 'kept' }, { understanding: 3 }] }, result: 'win', text: { en: 'The Drowned Bell stays as it is, flat and loved, and its maker knows at last what it did.' } },
      { id: 'heard', when: { understanding: 4 }, result: 'win', text: { en: 'The Maker has heard what the bell did that night. They will not break it now.' } },
    ],
  };

  // ---- the Bridge Founder (Manybridge) --------------------------------------------------------------------------------------
  C.encounters['gd.mb'] = {
    id: 'gd.mb', kind: 'social', name: say('{橋|はし} の {開祖|かいそ}', 'The Bridge Founder'), story: true, canFlee: true, guardian: 'mb',
    help: { explain: { en: 'The Founder wants every bridge but the first taken down, because nobody can read the name carved on the first one any more. It is afraid of being forgotten.' },
      suggest: { en: 'Say the plan back, ask about the carved name, and wait; then offer to recut the name if the other bridges may stay, or to draw the first bridge at the very top of Manybridge\'s map.' } },
    lead: { enemy: 'gd.bridgefounder' },
    rules: { wait: true },
    autoRoute: ['s:restate', 's:carved', 'wait', 's:carve', 's:map'],
    social: {
      parties: [{ aid: 'n:founder', name: say('{開祖|かいそ}', 'the Bridge Founder'), stance: 'heated', wants: { en: 'Every bridge but the first taken down: one crossing, built to the plan.' } }],
      claims: {
        plan: { by: 'n:founder', jp: '{橋|はし} は 、 {一本|いっぽん} で {足|た}りる 。 {私|わたし} の {図面|ずめん} に は 、 {一本|いっぽん} しか {描|か}いて いない 。', en: 'One bridge is enough. My plan shows only one.' },
        name: { by: 'n:founder', jp: '{最初|さいしょ} の {橋|はし} に {刻|きざ}んだ {私|わたし} の {名前|なまえ} は 、 もう {誰|だれ} も {読|よ}めない 。 {橋|はし} が {八百|はっぴゃく} も あれば 、 {最初|さいしょ} の {一本|いっぽん} なんて {忘|わす}れられる 。', en: 'The name I carved on the first bridge: nobody can read it now. With eight hundred bridges, who remembers the first?', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{欄干|らんかん} の {苔|こけ} を {拭|ふ}く', 'Wipe the moss off the first bridge\'s rail'), desc: 'Wipe the moss off the oldest rail with your sleeve.', effect: { understanding: 1, stance: { 'n:founder': 'listening' } }, once: true, says: { en: 'Under the moss the old wood is smooth with hands: a hundred years of people steadying themselves on it. The Founder watches you do it.' } },
      unravelTip: { en: 'Nothing is knotted. The Founder is afraid of being forgotten.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{図面|ずめん} に ない {橋|はし} が {増|ふ}えた の が 、 {嫌|いや} なん です ね 。', 'Say back what the Founder objects to'),
          task: task('g:n_desu', 'Which says back what the Founder objects to?', '{図面|ずめん} に ない {橋|はし} が {増|ふ}えた の が 、 {嫌|いや} なん です ね 。', '{橋|はし} が {少|すく}ない の が 、 {嫌|いや} なん です ね 。', 'The Founder wants fewer, not more.', '{図面|ずめん} が {古|ふる}い の が 、 {嫌|いや} なん です ね 。', 'The Founder is proud of the plan.'),
          cases: [{ when: { stance: { 'n:founder': 'heated' } }, effect: { stance: { 'n:founder': 'listening' }, understanding: 1 }, says: { en: '"Not on the plan," the Founder agrees, tapping it. "Not one of them."' } }],
          says: { en: 'The Founder is already listening, the plan held loosely.' } },
        { id: 'carved', kind: 'ask', label: say('{最初|さいしょ} の {橋|はし} に は 、 {何|なに} が {刻|きざ}んで ある ん です か 。', 'Ask what is carved on the first bridge'), once: true, when: { stance: { 'n:founder': 'listening' } },
          task: task('g:te_aru', 'Which asks what is carved on the first bridge?', '{最初|さいしょ} の {橋|はし} に は 、 {何|なに} が {刻|きざ}んで ある ん です か 。', '{最初|さいしょ} の {橋|はし} は 、 {何|なん} {年|ねん} に できた ん です か 。', 'That asks the year it was built.', '{最初|さいしょ} の {橋|はし} を 、 {壊|こわ}して も いい です か 。', 'That asks to break it.'),
          effect: { reveal: 'name', understanding: 1 }, says: { en: 'The Founder runs a thumb along a worn beam. "My name. Nobody can read it now. With eight hundred bridges, who remembers the first?"' } },
        { id: 'carve', kind: 'propose', label: say('{名前|なまえ} を {刻|きざ}み{直|なお}したら 、 {他|ほか} の {橋|はし} は {残|のこ}して も いい です か 。', 'Offer to recut the name, if the other bridges may stay'), when: { claims: ['name'] },
          task: task('g:cond_tara', 'Which offers to recut its name, if the other bridges may stay?', '{名前|なまえ} を {刻|きざ}み{直|なお}したら 、 {他|ほか} の {橋|はし} は {残|のこ}して も いい です か 。', '{他|ほか} の {橋|はし} を {壊|こわ}したら 、 {名前|なまえ} を {刻|きざ}みます 。', 'That gives away every other bridge.', '{名前|なまえ} は 、 もう {要|い}らない でしょう 。', 'Its name is the whole point.'),
          effect: { flag: 'deal', understanding: 1 }, says: { en: 'The Founder considers it, the way a builder weighs a beam. "Cut deep," they say. "Deep enough to outlast me twice."' } },
        { id: 'map', kind: 'propose', label: say('{八百橋|やおばし} の {地図|ちず} の {一番|いちばん} {上|うえ} に 、 {最初|さいしょ} の {橋|はし} を {描|か}く なら 、 {納得|なっとく} して いただけます か 。', 'Offer to put the first bridge at the top of every map of Manybridge'), once: true, when: { flag: 'deal' },
          task: task('g:cond_nara', 'Which offers, politely, a place at the top of the town\'s map?', '{八百橋|やおばし} の {地図|ちず} の {一番|いちばん} {上|うえ} に 、 {最初|さいしょ} の {橋|はし} を {描|か}く なら 、 {納得|なっとく} して いただけます か 。', '{地図|ちず} から 、 {最初|さいしょ} の {橋|はし} を {消|け}します 。', 'That forgets it outright.', '{地図|ちず} は 、 もう {誰|だれ} も {見|み}ません 。', 'Everyone in Manybridge lives by its maps.'),
          effect: { understanding: 1 }, says: { en: '"At the top," says the Founder, and rolls the plan a little tighter, as if it no longer needed to show anyone.' } },
        { id: 'blunt', kind: 'propose', label: say('{古|ふる}い {図面|ずめん} なんて 、 {関係|かんけい} ない よ 。', 'Tell the Founder the old plan doesn\'t matter'), lasting: true, means: { en: 'You will tell the Founder the plan no longer matters.' },
          task: task('g:register_polite_plain', 'Which tells the Founder, bluntly, the old plan doesn\'t matter?', '{古|ふる}い {図面|ずめん} なんて 、 {関係|かんけい} ない よ 。', '{古|ふる}い {図面|ずめん} を 、 {見|み}せて いただけます か 。', 'That asks to see it, kindly.', 'この {図面|ずめん} は 、 {素晴|すば}らしい です ね 。', 'That praises it.'),
          effect: { stance: { 'n:founder': 'leaving' } }, says: { en: 'The Founder rolls up the plan with a snap and steps back into the oldest pile, timber into timber.' } },
      ],
      responses: {
        stone: { effect: { stance: { 'n:founder': 'listening' } }, says: { en: 'You set a stone at the foot of the first pile, as builders do for luck. The Founder grunts approval.' } },
        water: { says: { en: 'The river already has plenty to say to these piles.' } },
        unravel: { says: { en: 'Nothing is knotted. The Founder is afraid of being forgotten.' } },
      },
      wait: { when: { stance: { 'n:founder': 'listening' } }, effect: { reveal: 'name', understanding: 1 }, says: { en: 'In the quiet, the Founder looks up at the worn beam. "…My name was there. Nobody can read it now."' } },
      companion: {
        nao: [{ id: 'nao_names', name: say('{橋|はし} の {名前|なまえ}', 'Bridges by name'), desc: 'Nao has crossed most of them, and knows them by name.', once: true, effect: { understanding: 1, stance: { 'n:founder': 'listening' } }, says: { en: 'Nao: "Every courier in Manybridge learns the first bridge first. You give directions from it. \'Three past the first, then left.\'"' } }],
        mio: [{ id: 'mio_roots', name: say('{根|ね} と {枝|えだ}', 'Root and branch'), desc: 'Mio speaks of a tree and what grows from it.', once: true, effect: { understanding: 1, stance: { 'n:founder': 'listening' } }, says: { en: 'Mio: "A tree with eight hundred branches still has one root. Nobody thinks the branches mean the root was wrong."' } }],
        ren: [{ id: 'ren_read', name: say('{名前|なまえ} を {読|よ}む', 'Read the name'), desc: 'Ren can make out worn letters.', once: true, effect: { reveal: 'name', understanding: 1 }, says: { en: 'Ren traces the worn beam with a fingertip. "There\'s a name here. Just. I can read the first half." The Founder goes very still.' } }],
        suzu: [{ id: 'suzu_billing', name: say('{一番|いちばん} {上|うえ} の {名前|なまえ}', 'Top billing'), desc: 'Suzu knows what it is to want your name remembered.', once: true, effect: { understanding: 1, stance: { 'n:founder': 'listening' } }, says: { en: 'Suzu: "Nobody minds a big cast as long as their name\'s at the top of the bill. I should know."' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:founder': 'heated' } }] }, once: true, effect: { stance: { 'n:founder': 'listening' } }, says: { en: 'A barge passes under, and its pole-hand taps the first pile for luck in passing, the way they all do. The Founder notices.' } }],
    },
    conclusions: [
      { id: 'left', when: { left: 'n:founder' }, result: 'end', text: { en: 'The Founder has stepped back into the oldest pile. The bridges all still stand; come back and speak again.' } },
      { id: 'deal', when: { all: [{ flag: 'deal' }, { understanding: 3 }] }, result: 'win', text: { en: 'The Founder\'s name will be cut again, deep, and the other seven hundred and ninety-nine bridges stay.' } },
      { id: 'heard', when: { understanding: 4 }, result: 'win', text: { en: 'The Founder has heard that the first bridge is remembered. That was what the plan was for.' } },
    ],
  };
})(RB.content);
