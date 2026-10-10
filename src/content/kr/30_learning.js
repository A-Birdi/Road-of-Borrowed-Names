/* The Keepers' Road, Chapter 7: the language tasks of the road (expansion P10). Each lamp relit by its name (the
 * name read from clues on the road: the board and the waystone, Kumazō, Kame and the register, the registers in the
 * cave); the fallen cedar (instructions to follow); the etoki scroll's captions put back under their pictures. The
 * tellings' reading tasks are in 31_tellings.js. F reads kana and counts; E narrative past and sequence; I naming and
 * comparing sources (〜という, 〜によると); A the classical line, always optional and glossed. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  // ---- lamps relit by name ------------------------------------------------------------------------------------------
  C.challenges['kr.name_foot'] = { title: T('{迎|むか}え の {灯|ひ}', 'The first lamp\'s name'), tiers: {
    F: [ch({ item: 'v:迎える', ctx: { jp: 'けいじばん ： 「ひ の なまえ ： むかえ の ひ 、 すぎ の ひ 、 きつね の ひ」 （した から じゅんばん に）', en: '' }, prompt: { en: 'The board lists the lamps from the bottom of the road up. This is the lowest lamp. What is it called?' }, options: [o('むかえ の ひ', 1), o('すぎ の ひ', 0, 'That is the second on the board.'), o('きつね の ひ', 0, 'That is the third on the board.')] })],
    E: [ch({ item: 'v:迎える', ctx: { jp: '{掲示板|けいじばん} ： 「{灯|ひ} の {名|な} ： {迎|むか}え の {灯|ひ} 、 {杉|すぎ} の {灯|ひ} 、 {狐|きつね} の {灯|ひ}」 。 {下|した} から {順|じゅん} に {書|か}いて ある 。', en: '' }, prompt: { en: 'This is the lowest lamp on the road. Which name is it?' }, options: [o('{迎|むか}え の {灯|ひ}', 1), o('{杉|すぎ} の {灯|ひ}', 0, 'The board goes from the bottom: 杉 is second.'), o('{狐|きつね} の {灯|ひ}', 0, 'The board goes from the bottom: 狐 is third.')] })],
    I: [ch({ item: 'g:kr_to_iu', ctx: { jp: '{道標|みちしるべ} に 「{迎|むか}え の {灯|ひ} より {登|のぼ}る べし」 と ある 。 この {灯籠|とうろう} は {道|みち} の {一番|いちばん} {下|した} に ある 。', en: '' }, prompt: { en: 'What is this lamp called?' }, options: [o('「{迎|むか}え の {灯|ひ}」 と いう {灯籠|とうろう}', 1), o('「{尾根|おね} の {灯|ひ}」 と いう {灯籠|とうろう}', 0, 'The Ridge Light is far up the road; this one is at the bottom.'), o('「{登|のぼ}る {灯|ひ}」 と いう {灯籠|とうろう}', 0, 'The waystone says climb FROM the Welcoming Light: that is its name.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '「{迎|むか}え の {灯|ひ} より {登|のぼ}る べし」', en: '' }, prompt: { en: 'On the waystone (classical, optional): what does より mean here, and so what is this first lamp?' }, options: [o('「〜から」 の {意味|いみ} 。 この {灯|ひ} は {迎|むか}え の {灯|ひ}', 1), o('「〜より {高|たか}い」 の {意味|いみ} 。 この {灯|ひ} は {尾根|おね} の {灯|ひ}', 0, 'より here marks the starting point, "from"; it is not a comparison.'), o('「〜ために」 の {意味|いみ}', 0, 'より marks where you start: "climb from the Welcoming Light".')] })],
  } };
  C.challenges['kr.name_steps'] = { title: T('{杉|すぎ} の {灯|ひ}', 'The Cedar Light'), tiers: {
    F: [ch({ item: 'v:杉', ctx: { jp: 'クマゾウ ： 「この うえ の とうろう は 、 すぎ の ひ と いう んだ 。」', en: '' }, prompt: { en: 'What is the lamp\'s name?' }, options: [o('すぎ の ひ', 1), o('もり の ひ', 0, 'Kumazō says すぎ.')] })],
    E: [ch({ item: 'v:杉', ctx: { jp: 'クマゾウ さん は 「{親父|おやじ} が 、 {杉|すぎ} の {灯|ひ} と {呼|よ}んで いました 。」 と {言|い}いました 。', en: '' }, prompt: { en: 'What did Kumazō\'s father call the lamp?' }, options: [o('{杉|すぎ} の {灯|ひ}', 1), o('{石段|いしだん} の {灯|ひ}', 0, 'He called it 杉 の 灯.'), o('{苔|こけ} の {灯|ひ}', 0, 'He called it 杉 の 灯.')] })],
    I: [ch({ item: 'g:kr_to_iu', ctx: { jp: 'クマゾウ さん に よると 、 その {灯籠|とうろう} は 「{杉|すぎ} の {灯|ひ}」 と いう {名前|なまえ} だ そう だ 。 {名札|なふだ} に は 「{杉|すぎ}」 だけ {読|よ}める 。', en: '' }, prompt: { en: 'Do the plate and Kumazō agree? Read its name.' }, options: [o('{杉|すぎ} の {灯|ひ}', 1), o('{杉|すぎ} の {木|き}', 0, 'The name is the lamp\'s, 〜の灯.'), o('{名札|なふだ} の {灯|ひ}', 0, 'The plate shows 杉; Kumazō gives the rest.')] })],
    A: [ch({ item: 'v:杉', ctx: { jp: '{名札|なふだ} ： 「{杉|すぎ} □ □」 。 クマゾウ ： 「{親父|おやじ} が そう {呼|よ}んで いた 。」', en: '' }, prompt: { en: 'The plate and a memory: which reading puts them together?' }, options: [o('{杉|すぎ} の {灯|ひ} （{名札|なふだ} の {一字|いちじ} と {記憶|きおく} が {合|あ}う）', 1), o('{杉|すぎ} の {宿|やど} （{名札|なふだ} だけ から）', 0, 'The plate alone can\'t give the rest; Kumazō\'s memory does.'), o('わから ない （{記憶|きおく} は {信用|しんよう} できない）', 0, 'He is sure, and the plate agrees on 杉: that is enough.')] })],
  } };
  C.challenges['kr.name_fox'] = { title: T('{狐|きつね} の {灯|ひ}', 'The Fox Light'), tiers: {
    F: [ch({ item: 'v:狐', ctx: { jp: 'カメ ： 「はし の そば の とうろう は 、 きつね の ひ と いう の さ 。 きつねいろ だから ね 。」', en: '' }, prompt: { en: 'What is the lamp by the bridge called?' }, options: [o('きつね の ひ', 1), o('はし の ひ', 0, 'Kame says きつね の ひ.')] })],
    E: [ch({ item: 'v:狐色', ctx: { jp: 'カメ さん は 「{狐色|きつねいろ} だ から 、 {狐|きつね} の {灯|ひ} と {言|い}う ん だ よ 。」 と {言|い}いました 。', en: '' }, prompt: { en: 'Why is it called the Fox Light?' }, options: [o('{狐色|きつねいろ} に {塗|ぬ}って ある から', 1), o('{狐|きつね} が {点|つ}けた から', 0, 'Kame gives the reason: 狐色 だ から.'), o('{狐|きつね} が {住|す}んで いる から', 0, 'Kame gives the reason: 狐色 だ から.')] })],
    I: [ch({ item: 'g:kr_ni_yoruto', ctx: { jp: '{里|さと} の {記録|きろく} に よると 、 {灯守|ひもり} が {橋|はし} の そば の {灯籠|とうろう} を {狐色|きつねいろ} に {塗|ぬ}った 。 カメ さん は 「{狐|きつね} の {灯|ひ}」 と {呼|よ}ぶ 。', en: '' }, prompt: { en: 'Read the lamp\'s name.' }, options: [o('{狐|きつね} の {灯|ひ}', 1), o('{狐橋|きつねばし} の {灯|ひ}', 0, 'The bridge is 狐橋; the lamp is 狐 の 灯.'), o('{茶色|ちゃいろ} の {灯|ひ}', 0, '狐色 is the colour; the name is 狐 の 灯.')] })],
    A: [ch({ item: 'v:記録', ctx: { jp: '{記録|きろく} ： 「{灯籠|とうろう} を {狐色|きつねいろ} に {塗|ぬ}り 、 {狐橋|きつねばし} と {名付|なづ}く 。」 カメ ： 「{狐|きつね} の {灯|ひ}」 。', en: '' }, prompt: { en: 'The register names the bridge; who names the lamp?' }, options: [o('カメ さん の {呼|よ}び{名|な} 、 「{狐|きつね} の {灯|ひ}」', 1), o('{記録|きろく} の 「{狐橋|きつねばし}」', 0, 'The register names the bridge, not the lamp.'), o('{名付|なづ}く', 0, '名付く is the old form of 名付ける, "named".')] })],
  } };
  C.challenges['kr.name_ridge'] = { title: T('{尾根|おね} の {灯|ひ}', 'The Ridge Light'), tiers: {
    F: [ch({ item: 'v:尾根', ctx: { jp: 'きろく ： 「おね の ひ 。 みならい 、 こない 。 ひ 、 きえる 。」', en: '' }, prompt: { en: 'Call the lamp by its name.' }, options: [o('おね の ひ', 1), o('みならい の ひ', 0, 'The register names it おね の ひ.')] })],
    E: [ch({ item: 'v:尾根', ctx: { jp: '{記録|きろく} ： 「{尾根|おね} の {灯|ひ} 。 {見習|みなら}い 、 {来|き}たらず 。 {灯|ひ} {消|き}ゆ 。」', en: '' }, prompt: { en: 'Call the lamp by its name.' }, options: [o('{尾根|おね} の {灯|ひ}', 1), o('{峠|とうげ} の {灯|ひ}', 0, 'The register says 尾根.')] })],
    I: [ch({ item: 'g:kr_to_iu', ctx: { jp: '{記録|きろく} に 「{尾根|おね} の {灯|ひ}」 と いう {名前|なまえ} が ある 。 {見習|みなら}い が {来|こ}なかった {灯|ひ} だ 。', en: '' }, prompt: { en: 'Call the lamp by its name.' }, options: [o('{尾根|おね} の {灯|ひ}', 1), o('{見習|みなら}い の {灯|ひ}', 0, 'That is what happened to it, not its name.'), o('{消|き}えた {灯|ひ}', 0, 'That is what happened to it, not its name.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '「{尾根|おね} の {灯|ひ} 。 {見習|みなら}い 、 {来|き}たらず 。 {灯|ひ} {消|き}ゆ 。」', en: '' }, prompt: { en: 'What does 来たらず mean (classical)?' }, options: [o('{来|こ}なかった', 1), o('{来|き}た', 0, 'ず is the classical negative.'), o('{来|く}る べき だ', 0, 'That would be 来べし.')] })],
  } };

  // ---- the fallen cedar (instructions) ------------------------------------------------------------------------------
  C.challenges['kr.cedar'] = { title: T('{倒|たお}れた {杉|すぎ}', 'The fallen cedar'), tiers: {
    F: [ch({ item: 'v:押す', ctx: { jp: 'クマゾウ ： 「そっち の はし を もって 。 せーの で 、 おす んだ 。」', en: '' }, prompt: { en: 'Kumazō says "se-no!". What do you do?' }, options: [o('おす', 1), o('ひく', 0, 'He said おす: push.'), o('まつ', 0, 'せーの is the signal: push now.')] })],
    E: [ch({ item: 'g:v_te', ctx: { jp: 'クマゾウ さん は 「そっち の {端|はし} を {持|も}って 、 「せーの」 で {押|お}して くれ 。」 と {言|い}いました 。', en: '' }, prompt: { en: 'What two things does he ask, in order?' }, options: [o('{端|はし} を {持|も}って 、 それから {押|お}す', 1), o('{押|お}して から 、 {端|はし} を {持|も}つ', 0, 'Hold first (持って), then push.'), o('{真|ま}ん{中|なか} を {持|も}って 、 {引|ひ}く', 0, 'そっち の 端: the other end; 押す: push.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: 'クマゾウ ： 「{俺|おれ} が 「せーの」 と {言|い}ったら 、 {押|お}す ん だ 。 {先|さき} に {押|お}す と 、 {転|ころ}がる ぞ 。」', en: '' }, prompt: { en: 'When do you push?' }, options: [o('クマゾウ さん が 「せーの」 と {言|い}って から', 1), o('{言|い}われる {前|まえ} に', 0, '先 に 押す と 、 転がる: pushing early sends it rolling.'), o('{杉|すぎ} が {転|ころ}がったら', 0, '〜たら here: when he has said せーの.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: 'クマゾウ ： 「…… {一人|ひとり} じゃ {動|うご}かん 。 そっち の {端|はし} 、 {空|あ}いてる な 。」', en: '' }, prompt: { en: 'What is Kumazō really asking?' }, options: [o('そっち の {端|はし} を {持|も}って {手伝|てつだ}って ほしい', 1), o('{端|はし} が {空|あ}いて いる から 、 {通|とお}れる', 0, 'He is hinting that he needs a hand there.'), o('{一人|ひとり} で やる から 、 {待|ま}って いて', 0, '一人 じゃ 動かん: he can\'t do it alone.')] })],
  } };

  // ---- the etoki scroll's captions ----------------------------------------------------------------------------------
  C.challenges['kr.scroll_captions'] = { title: T('{絵巻|えまき} の {字|じ}', 'The scroll\'s captions'), tiers: {
    F: [{ kind: 'order', item: 'v:絵巻', prompt: { en: 'Put the captions back in the order of the pictures: the apprentice lights east, spring, name, then the bell rings.' },
      tiles: ['ひがし の ひ', 'いずみ の ひ', 'なまえ の ひ', 'かね が なる'], answer: ['ひがし の ひ', 'いずみ の ひ', 'なまえ の ひ', 'かね が なる'] }],
    E: [{ kind: 'order', item: 'g:v_te_kara', prompt: { en: 'Put the scroll\'s captions back under the pictures, in order (first, then, last).' },
      tiles: ['{最初|さいしょ} に {東|ひがし} の {灯|ひ}', 'それから {泉|いずみ} の {灯|ひ}', 'そして {名|な} の {灯|ひ}', '{最後|さいご} に {鐘|かね}'], answer: ['{最初|さいしょ} に {東|ひがし} の {灯|ひ}', 'それから {泉|いずみ} の {灯|ひ}', 'そして {名|な} の {灯|ひ}', '{最後|さいご} に {鐘|かね}'] }],
    I: [ch({ item: 'g:kr_tsutaerareru', ctx: { jp: '{絵|え} ： {見習|みなら}い が {鐘|かね} を {鳴|な}らし 、 {戸|と} が {開|ひら}く 。 {隅|すみ} に {狐|きつね} 。', en: '' }, prompt: { en: 'Which caption fits the last picture, told as a tradition?' }, options: [o('{最後|さいご} に {鐘|かね} を {鳴|な}らす と 、 {戸|と} が {開|ひら}いた と {伝|つた}えられて いる 。', 1), o('{最後|さいご} に {鐘|かね} を {鳴|な}らした が 、 {戸|と} は {開|ひら}かなかった 。', 0, 'In the picture the door opens.'), o('{狐|きつね} が {戸|と} を {開|ひら}けた と {伝|つた}えられて いる 。', 0, 'The fox only watches from the corner.')] })],
    A: [ch({ item: 'g:kr_to_iu', ctx: { jp: '{絵|え} ： {見習|みなら}い と {灯|ひ} 。 {隅|すみ} に {狐|きつね} 。 キキョウ ： 「{狐|きつね} は 、 {師匠|ししょう} が {足|た}した の 。」', en: '' }, prompt: { en: 'A caption for the fox that keeps the teller\'s addition apart from the tale.' }, options: [o('「{狐|きつね} が {見守|みまも}って いた 」 と いう の は 、 {語|かた}り{手|て} の {付|つ}け{足|た}し で ある 。', 1), o('{狐|きつね} が {見習|みなら}い を {助|たす}けた 。', 0, 'That tells the addition as if it were the tale.'), o('{狐|きつね} は いなかった 。', 0, 'The fox is in the picture; the caption should say whose addition it is.')] })],
  } };
})(RB.content);
