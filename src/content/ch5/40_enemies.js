/* Chapter 5 foes: Hush-touched things of Lanternfall's records and the
 * drowned tower, and the Drowned Bell's Keeper. Every fight can be won with
 * Unravel alone; すず (bell) and こえ (voice) answer the Hush's silence. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const POOL = {
    tags: ['lanternfall'],
    F: ['v:鈴', 'v:声', 'v:鐘', 'v:舟', 'v:水'],
    E: ['v:反対', 'v:結構', 'g:v_masu_forms', 'g:register_polite_plain'],
    I: ['g:cond_to', 'g:cond_tara', 'g:v_nakereba', 'g:indirectness', 'g:keigo_kenjo'],
    A: ['g:lf_kaneru', 'g:adv_wake_dewa_nai', 'g:indirectness', 'g:adv_kanenai'],
  };
  const t = (jp, en) => ({ jp, en });
  const choose = (item, ctx, prompt, options) => ({ kind: 'choose', item, ctx, prompt: { en: prompt }, options });
  const ok = (jp, en, why) => ({ jp, en, ok: true, why: { en: why } });
  const no = (jp, en, why) => ({ jp, en, ok: false, why: { en: why } });

  C.enemies['lf.blot'] = {
    name: { en: 'Silence Blot', jp: 'しじま の {染|し}み' }, art: 'blot', artOpts: { col: '#2a2848' }, look: { custom: 'blot', col: '#2a2848' },
    region: 'lanternfall', bg: 'belltower', knots: 2, pool: POOL,
    pattern: ['silence', 'strike', 'rest'],
    intro: t('{床|ゆか} の {染|し}み が 、{音|おと} を {吸|す}い{込|こ}んで いる 。', 'A stain on the floor is soaking up every sound.'),
    settle: t('{染|し}み が {薄|うす}れ 、{足音|あしおと} が {戻|もど}って くる 。', 'The stain fades, and your footsteps come back.'),
  };

  C.enemies['lf.mote'] = {
    name: { en: 'Hush Mote', jp: 'しじま の {綿毛|わたげ}' }, art: 'wisp', artOpts: { col: '#c8c4e8' }, look: { custom: 'wisp', col: '#c8c4e8' },
    region: 'lanternfall', bg: 'belltower', knots: 2, pool: POOL,
    pattern: ['shroud', 'strike', 'rest'],
    intro: t('{白|しろ}い {綿毛|わたげ} が 、{霧|きり} の よう に {漂|ただよ}って くる 。', 'White fluff drifts towards you like fog.'),
    settle: t('{綿毛|わたげ} は {水|みず} に {落|お}ちて 、{溶|と}けた 。', 'The fluff falls into the water and dissolves.'),
  };

  C.enemies['lf.stamp'] = {
    name: { en: 'Consent Stamp', jp: '「{承認|しょうにん}」 の {判子|はんこ}' }, art: 'clerk', artOpts: { col: '#4c4a78' }, look: { custom: 'lf_stamp', col: '#4c4a78' },
    region: 'lanternfall', bg: 'lanternfall', knots: 2, pool: POOL,
    pattern: ['lie:ok', 'strike', 'mend'],
    intents: {
      'lie:ok': {
        text: {
          F: t('「ぜんぶ いい です よ 。」 （ {判子|はんこ} の {下|した} の {紙|かみ} に は 「いいえ」 と {書|か}いて ある ）', '"It\'s all fine." (The paper under its stamp says "no".)'),
          E: t('「{承認|しょうにん} しました 。{何|なに} も {問題|もんだい} は ありません 。」 （ {下|した} の {書類|しょるい} に は 「{反対|はんたい}」 ）', '"Approved. No problems whatsoever." (The document underneath reads "Opposed".)'),
          I: t('「ご{意見|いけん} は 、すべて {承|うけたまわ}りました 。」 （ {受|う}け{取|と}った {紙|かみ} は 、{管|くだ} の {中|なか} へ {消|き}えて いく ）', '"All your opinions have been duly received." (The papers it takes vanish into a pipe.)'),
          A: t('「ご{異議|いぎ} は ごもっとも です 。{前向|まえむ}き に {検討|けんとう} いたします 。」', '"Your objection is entirely reasonable. We shall give it positive consideration."'),
        },
        truth: {
          F: choose('v:いいえ', t('「ぜんぶ いい です よ 。」', '"It\'s all fine."'), 'The paper under the stamp says いいえ. Is it really all fine?', [ok('いいえ', 'No', 'The stamp says yes over a no.'), no('はい', 'Yes', 'Look at what is under the stamp.')]),
          E: choose('v:反対', t('「{承認|しょうにん} しました 。{何|なに} も {問題|もんだい} は ありません 。」', ''), 'What is false?', [ok('', 'It says there\'s no problem, but the document says "Opposed"', '承認 stamped over 反対.'), no('', 'Nothing; it approved it', 'Approval over an objection is not agreement.'), no('', 'It stamped the wrong date', 'Not the issue.')]),
          I: choose('c:lf_stamp', t('「ご{意見|いけん} は 、すべて {承|うけたまわ}りました 。」', ''), 'What is it hiding?', [ok('', '"Received" is not "acted on" — it is sending them away up the pipe', '承る = humbly receive, nothing more.'), no('', 'It is going to act on every opinion', 'It never says so.'), no('', 'It did not receive them', 'It did; that is the trick.')]),
          A: choose('g:indirectness', t('「ご{異議|いぎ} は ごもっとも です 。{前向|まえむ}き に {検討|けんとう} いたします 。」', ''), 'What does this polite formula amount to?', [ok('', 'A courteous way of doing nothing', 'Agreeing with the objection in form while filing it away.'), no('', 'A firm promise to change course', 'Consideration is not change.'), no('', 'An apology', 'No apology is made.')]),
        },
      },
    },
    intro: t('{判子|はんこ} が {跳|は}ねて くる 。{何|なに} に でも 「{承認|しょうにん}」 を {押|お}す つもり だ 。', 'A stamp comes hopping. It means to press "approved" on anything at all.'),
    settle: t('{判子|はんこ} の {朱肉|しゅにく} が {乾|かわ}いて 、ころり と {転|ころ}がった 。', 'Its red ink dries up, and it rolls over.'),
  };

  C.enemies['lf.conduit'] = {
    name: { en: 'Conduit Spirit', jp: '{管|くだ} の {霊|れい}' }, art: 'lf_conduit', artOpts: { col: '#8a90c8' }, look: { custom: 'lf_pipe', col: '#8a90c8' },
    region: 'lanternfall', bg: 'belltower', knots: 3, pool: POOL,
    pattern: ['mend', 'silence', 'sweep', 'rest'],
    intro: t('{管|くだ} が {身|み} を よじり 、{運|はこ}んで いた {声|こえ} で {体|からだ} を {作|つく}った 。', 'A pipe writhes and builds itself a body out of the voices it was carrying.'),
    settle: t('{管|くだ} が ほどけ 、{中|なか} から 「いや」 と いう {小|ちい}さな {声|こえ} が {転|ころ}がり{出|で}た 。', 'The pipe comes apart, and a small voice saying "no" tumbles out.'),
  };

  C.enemies['lf.wraith'] = {
    name: { en: 'Bell Wraith', jp: '{鐘|かね} の {亡霊|ぼうれい}' }, art: 'bell', artOpts: { col: '#3c5c8a' }, look: { custom: 'lf_bell', col: '#3c5c8a' },
    region: 'lanternfall', bg: 'belltower', knots: 3, pool: POOL,
    pattern: ['charge', 'sweep', 'silence', 'strike'],
    intro: t('{鳴|な}らない {鐘|かね} の {影|かげ} が 、{水|みず} の {上|うえ} を {滑|すべ}って くる 。', 'The shadow of a bell that will not ring glides over the water.'),
    settle: t('{影|かげ} は 、{小|ちい}さく 「ちん」 と {鳴|な}って {消|き}えた 。', 'The shadow gives a small "ting" and is gone.'),
  };

  // ---- the boss --------------------------------------------------------------------------------------
  const YES = {
    F: t('「いいよ 。ならして いいよ 。」 （ {鐘|かね} の {綱|つな} を 、ぎゅっと {握|にぎ}った まま ）', '"Sure. You can ring it." (It keeps the bell rope clenched tight.)'),
    E: t('「はい 、はい 。どうぞ {鳴|な}らして ください 。」 （ {綱|つな} を {巻|ま}き{取|と}りながら ）', '"Yes, yes. Please, ring it." (Winding the rope out of reach as it speaks.)'),
    I: t('「もちろん 、{鳴|な}らして かまいません よ 。{鳴|な}らせる もの なら 。」', '"Of course you may ring it. If you can."'),
    A: t('「{鐘|かね} を {鳴|な}らす こと に 、{異存|いぞん} は ございません 。ただ 、それ が {皆|みな}さま の ため に なる か どう か は 、よく お{考|かんが}え いただきたい もの です が 。」', '"I have no objection to your ringing the bell. Though I would ask you to think carefully whether it is truly for everyone\'s good."'),
  };
  const YES_TRUTH = {
    F: choose('v:いいえ', YES.F, 'It says いいよ ("sure") while gripping the rope. What does it really mean?', [ok('いや', 'No', 'Its words say yes; its hands say no.'), no('いいよ', 'Sure', 'Then why is it holding the rope?')]),
    E: choose('g:indirectness', YES.E, 'What is it really saying?', [ok('', 'No — it is keeping the rope out of reach', 'A repeated はい、はい while acting against it is a brush-off.'), no('', 'Yes — go ahead', 'Watch what it does.'), no('', 'It is asking for help with the rope', 'No.')]),
    I: choose('c:lf_keeper', YES.I, 'What does 「鳴らせるものなら」 add?', [ok('', '"…if you think you can": a challenge that takes the permission back', 'ものなら after a potential verb: "if you could (which you can\'t)".'), no('', 'A kind offer of help', 'It is a taunt.'), no('', 'A condition that is easy to meet', 'The tone says the opposite.')]),
    A: choose('c:lf_keeper', YES.A, 'Paraphrase what it means.', [ok('', 'It formally raises no objection while plainly objecting.', '異存はございません + ～いただきたいものですが: a veiled "no".'), no('', 'It sincerely agrees and wants the bell rung.', 'The second sentence retracts the first.'), no('', 'It has no opinion.', 'It has a very strong one.')]),
  };
  const PLEA = {
    F: t('「しずか に して …… 。」', '"Please, be quiet…"'),
    E: t('「もう {鐘|かね} は {鳴|な}らさないで ください 。{言|い}い{争|あらそ}う {声|こえ} は 、もう {聞|き}きたく ない んです 。」', '"Please don\'t ring the bell any more. I don\'t want to hear voices quarrelling ever again."'),
    I: t('「{喧嘩|けんか} を したら 、{誰|だれ} か が いなく なる 。だから 、{静|しず}か な ほう が いい 。そう でしょう ？」', '"When people quarrel, someone disappears. So quiet is better. Isn\'t it?"'),
    A: t('「あの {夜|よる} 、{言|い}い{争|あらそ}い さえ しなければ 、あの {子|こ} は {塔|とう} へ {走|はし}らず に {済|す}んだ 。{違|ちが}います か 。」', '"That night, if only there had been no argument, that boy would not have had to run to the tower. Am I wrong?"'),
  };
  const PLEA_ANS = {
    F: { kind: 'write', item: 'v:大丈夫', ctx: PLEA.F, prompt: { en: 'Tell it: "It\'s all right." — だいじょうぶ.' }, answer: 'だいじょうぶ', accept: ['だいじょうぶ', '大丈夫'], mode: 'kana', explain: { jp: '{大丈夫|だいじょうぶ}', en: 'だいじょうぶ — it\'s all right.' } },
    E: choose('c:lf_keeper', PLEA.E, 'What is it really afraid of, and how do you answer?', [ok('{言|い}い{争|あらそ}って も 、{話|はな}し{合|あ}える よ 。', 'Even when we argue, we can talk it through.', 'It fears arguments end in loss; answer that fear.'), no('はい 、もう {鳴|な}らしません 。', 'Yes, I won\'t ring it again.', 'That is just giving in.'), no('{静|しず}か に しろ ！', 'Be quiet!', 'Silencing it is exactly what it did to the town.')]),
    I: choose('c:lf_keeper', PLEA.I, 'Answer it.', [ok('{誰|だれ} か が いなく なった の は 、{喧嘩|けんか} の せい じゃ ない 。{話|はなし} を {聞|き}かなかった から だ 。', 'Someone was lost not because of the quarrel, but because no one listened.', 'It confuses disagreement with its bad ending.'), no('そう だ ね 。{静|しず}か な ほう が いい 。', 'You\'re right. Quiet is better.', 'That agrees with the Hush.'), no('{喧嘩|けんか} は {楽|たの}しい から 。', 'Because quarrelling is fun.', 'Glib, and it does not answer the grief.')]),
    A: choose('c:lf_keeper', PLEA.A, 'Answer what it is really asking.', [ok('{言|い}い{争|あらそ}った から で は なく 、あの {子|こ} の {言葉|ことば} が {届|とど}かなかった から だ 。だから 、{声|こえ} を {消|け}す の で は なく 、{聞|き}く ほう を {変|か}える べき だ 。', 'Not because they argued, but because his words weren\'t heard. So the answer is to change how we listen, not to erase voices.', 'It names the real failure and refuses the Hush\'s remedy.'), no('{確|たし}か に 、{言|い}い{争|あらそ}い が なければ {誰|だれ} も {死|し}ななかった 。', 'True: without the argument, no one would have died.', 'The argument was the only thing that saved the lower quarter.'), no('{過去|かこ} の こと は 、もう どう でも いい 。', 'The past doesn\'t matter any more.', 'It matters to everyone in this town.')]),
  };

  C.enemies['lf.keeper'] = {
    name: { en: "The Drowned Bell's Keeper", jp: '{沈鐘|ちんしょう} の {番人|ばんにん}' }, art: 'lf_keeper', artOpts: { col: '#4a5a52' },
    region: 'lanternfall', bg: 'belltower', boss: true, music: 'boss', knots: 6, pool: POOL,
    pattern: ['silence', 'strike', 'lie:yes', 'rest'],
    intents: {
      'lie:yes': { text: YES, truth: YES_TRUTH, power: 1 },
      'plea:stop': { text: PLEA, answer: PLEA_ANS },
    },
    phases: [
      { at: 4, pattern: ['flood', 'silence', 'lie:yes', 'strike'],
        line: t('{水|みず} が {鐘|かね} の {縁|ふち} まで {上|あ}がって くる 。', 'The water rises to the bell\'s rim.'),
        teach: { en: 'The keeper now calls up floods that strike you both. A stone inscription (いし / つち) holds against the water; まもる raised before one of you lingers as a ward. すず or こえ still answers its hush.' } },
      { at: 2, pattern: ['plea:stop', 'silence', 'charge', 'strike'],
        line: t('「もう 、{鳴|な}らさないで …… 」', '"Please, don\'t ring it any more…"'),
        teach: { en: 'It is pleading now. Choose "Answer" and reply to what it is really asking; it will loosen on its own. If it gathers strength, なわ holds it.' } },
    ],
    intro: t('{管|くだ} と {鐘|かね} で できた {番人|ばんにん} が 、{水|みず} の {中|なか} から {立|た}ち{上|あ}がる 。', 'A keeper made of pipes and bell-bronze rises out of the water.'),
    settle: t('{番人|ばんにん} は ほどけ 、{最後|さいご} に 「…… はい 」 と だけ {言|い}った 。{今度|こんど} は 、{本当|ほんとう} の 「はい」 だった 。', 'The keeper comes undone. Its last word is "…yes." This time, it is a real yes.'),
    reward: { items: { lf_bell_shard: 1 } },
  };
})(RB.content);
