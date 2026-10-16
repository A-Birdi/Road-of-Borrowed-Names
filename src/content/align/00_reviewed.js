/* Reviewed alignments for authored dialogue (AG-1): what each word of a displayed line says in its English, checked
 * by a person against the whole line, used by RB.jp.speech.align before its rules (src/lang/88_speech_align.js).
 * Each entry is keyed to the displayed pair: the Japanese words (the player's name as $name), the dialect and the
 * English (the name as $name), and names every word by its place and its text; a line that changes no longer matches
 * and falls back to the rules. Propose an entry with `node tools/review/align_registry.mjs --propose <scene> <n>`,
 * correct it against the line, and check all with `--check` (also run by tests/unit/align_registry.test.mjs).
 * Reviewed by the developer, not by a native speaker; see VALIDATION.md "AG-1". */
var RB = (globalThis.RB = globalThis.RB || {});
if (RB.jp && RB.jp.speech && RB.jp.speech.authored) RB.jp.speech.authored(
[
 {
  "key": "a1-c3da78e0-e004",
  "scene": "rw.ren_first",
  "line": 2,
  "jp": "レン と {申|もう}します 。 {川上|かわかみ} から 、 {嵐|あらし} の あと の {灯|あか}り を {直|なお}し に {来|き}ました 。 {灯守|ひもり} です 。 {一応|いちおう} 。",
  "en": "I'm Ren. I came down from upriver to mend the lanterns after the storm. A keeper. Nominally.",
  "dia": null,
  "reviewed": "2026-10-16 developer review against the full line (not a native speaker); AG-1 seed",
  "rels": [
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      0,
      "レン"
     ]
    ],
    "en": [
     {
      "t": "Ren"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "naming",
    "jp": [
     [
      1,
      "と"
     ],
     [
      2,
      "申します"
     ]
    ],
    "en": [
     {
      "t": "I'm",
      "p": 1
     }
    ],
    "label": "naming: \"X と申します\" is \"I'm X\" (humble)"
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      4,
      "川上"
     ]
    ],
    "en": [
     {
      "t": "upriver"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "case",
    "jp": [
     [
      5,
      "から"
     ]
    ],
    "en": [
     {
      "t": "from"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      7,
      "嵐"
     ]
    ],
    "en": [
     {
      "t": "storm"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      9,
      "あと"
     ]
    ],
    "en": [
     {
      "t": "after"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      11,
      "灯り"
     ]
    ],
    "en": [
     {
      "t": "lanterns"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      13,
      "直し"
     ]
    ],
    "en": [
     {
      "t": "mend"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "purpose",
    "jp": [
     [
      14,
      "に"
     ]
    ],
    "en": [
     {
      "t": "to"
     }
    ],
    "label": "～しに来る: comes \"to\" do something"
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      15,
      "来ました"
     ]
    ],
    "en": [
     {
      "t": "came"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      17,
      "灯守"
     ]
    ],
    "en": [
     {
      "t": "keeper"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      20,
      "一応"
     ]
    ],
    "en": [
     {
      "t": "Nominally"
     }
    ]
   }
  ],
  "notes": [
   [
    2,
    "申します",
    "Humble 申す: a polite way to give your own name. The English says \"I'm Ren\"."
   ],
   [
    18,
    "です",
    "Polite です: \"A keeper.\" has no \"is\" of its own."
   ]
  ]
 },
 {
  "key": "a1-3481c22e-615a",
  "scene": "sg.genzo_waiting",
  "line": 0,
  "jp": "{渡|わた}し{船|ぶね} は まだ か 。 …… {別|べつ} に 、 {待|ま}ってる わけ じゃ ない 。 {灯台守|とうだいもり} は 、 {海|うみ} を {見|み}る の が {仕事|しごと} だ 。",
  "en": "The ferry's not in yet? …Not that I'm waiting. A lighthouse keeper's job is to watch the sea.",
  "dia": null,
  "reviewed": "2026-10-16 developer review against the full line (not a native speaker); AG-1 seed",
  "rels": [
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      0,
      "渡し船"
     ]
    ],
    "en": [
     {
      "t": "ferry's"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      2,
      "まだ"
     ]
    ],
    "en": [
     {
      "t": "not"
     },
     {
      "t": "yet"
     }
    ],
    "label": "まだ … か: \"not … yet?\""
   },
   {
    "tier": "grammar",
    "fn": "construction",
    "jp": [
     [
      7,
      "別"
     ],
     [
      8,
      "に"
     ],
     [
      11,
      "わけ"
     ],
     [
      12,
      "じゃ"
     ],
     [
      13,
      "ない"
     ]
    ],
    "en": [
     {
      "t": "Not"
     },
     {
      "t": "that"
     }
    ],
    "label": "別に … わけじゃない: \"not that …\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      10,
      "待ってる"
     ]
    ],
    "en": [
     {
      "t": "waiting"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "aspect",
    "jp": [
     [
      10,
      "待ってる"
     ]
    ],
    "en": [
     {
      "t": "I'm",
      "p": 1
     }
    ],
    "label": "～てる (～ている): an action going on, \"am …-ing\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      15,
      "灯台守"
     ]
    ],
    "en": [
     {
      "t": "lighthouse"
     },
     {
      "t": "keeper's"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      18,
      "海"
     ]
    ],
    "en": [
     {
      "t": "sea"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      20,
      "見る"
     ]
    ],
    "en": [
     {
      "t": "watch"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "nominal",
    "jp": [
     [
      21,
      "の"
     ]
    ],
    "en": [
     {
      "t": "to"
     }
    ],
    "label": "の makes \"見る\" a noun: here the English \"to watch\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      23,
      "仕事"
     ]
    ],
    "en": [
     {
      "t": "job"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "cop",
    "jp": [
     [
      24,
      "だ"
     ]
    ],
    "en": [
     {
      "t": "is"
     }
    ]
   }
  ],
  "notes": [
   [
    3,
    "か",
    "Question marker: \"…yet?\""
   ],
   [
    16,
    "は",
    "Topic marker: \"a lighthouse keeper (as for him), the job is …\"."
   ]
  ]
 },
 {
  "key": "a1-b4123a67-ce86",
  "scene": "sb.hoshino",
  "line": 45,
  "jp": "$name 、 {鐘|かね} の {決|き}まり 、 {覚|おぼ}えてる よね ？ {行|い}こう ！",
  "en": "$name, you remember the bell rules, right? Let's go!",
  "dia": null,
  "reviewed": "2026-10-16 developer review against the full line (not a native speaker); AG-1 seed",
  "rels": [
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      0,
      "$name"
     ]
    ],
    "en": [
     {
      "ph": "name"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      2,
      "鐘"
     ]
    ],
    "en": [
     {
      "t": "bell"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      4,
      "決まり"
     ]
    ],
    "en": [
     {
      "t": "rules"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      6,
      "覚えてる"
     ]
    ],
    "en": [
     {
      "t": "remember"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "tag",
    "jp": [
     [
      7,
      "よね"
     ]
    ],
    "en": [
     {
      "t": "right"
     }
    ],
    "label": "よね: seeking agreement, \"…, right?\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      9,
      "行こう"
     ]
    ],
    "en": [
     {
      "t": "go"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "vol",
    "jp": [
     [
      9,
      "行こう"
     ]
    ],
    "en": [
     {
      "t": "Let's"
     },
     {
      "t": "Let's",
      "p": 1
     }
    ],
    "label": "volitional ～よう: \"let's …\""
   }
  ],
  "notes": [
   [
    3,
    "の",
    "Links 鐘 to 決まり: the English puts the two nouns together, \"bell rules\"."
   ]
  ]
 },
 {
  "key": "a1-c5de3c39-bc7b",
  "scene": "sb.quiet_mio",
  "line": 11,
  "jp": "わたし 、 {頼|たの}まれる と {断|ことわ}れない でしょう 。 {夜中|よなか} でも 、 {熱|ねつ} を {出|だ}した {子|こ} が いれば {行|い}く 。 {隣|となり} の {村|むら} でも 。 それ は いい の 。 {好|す}き で やってる から 。",
  "en": "I can't say no when someone asks, can I. Middle of the night, a child with a fever — I go. Even to the next village. That part's fine. I do it because I want to.",
  "dia": null,
  "reviewed": "2026-10-16 developer review against the full line (not a native speaker); AG-1 seed",
  "rels": [
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      0,
      "わたし"
     ]
    ],
    "en": [
     {
      "t": "I"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      2,
      "頼まれる"
     ]
    ],
    "en": [
     {
      "t": "asks"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "passive",
    "jp": [
     [
      2,
      "頼まれる"
     ]
    ],
    "en": [
     {
      "t": "someone"
     }
    ],
    "label": "passive 頼まれる \"be asked\": the English says it actively, \"someone asks\""
   },
   {
    "tier": "grammar",
    "fn": "cond",
    "jp": [
     [
      3,
      "と"
     ]
    ],
    "en": [
     {
      "t": "when"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      4,
      "断れない"
     ]
    ],
    "en": [
     {
      "t": "say"
     },
     {
      "t": "no"
     }
    ],
    "label": "断る \"refuse\": \"say no\""
   },
   {
    "tier": "grammar",
    "fn": "pot",
    "jp": [
     [
      4,
      "断れない"
     ]
    ],
    "en": [
     {
      "t": "can't"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "neg",
    "jp": [
     [
      4,
      "断れない"
     ]
    ],
    "en": [
     {
      "t": "can't",
      "p": 1
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "tag",
    "jp": [
     [
      5,
      "でしょう"
     ]
    ],
    "en": [
     {"t": "can"},
     {
      "t": "I",
      "n": 1
     }
    ],
    "label": "でしょう here seeks agreement: \"…, can I?\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      7,
      "夜中"
     ]
    ],
    "en": [
     {
      "t": "Middle"
     },
     {
      "t": "night"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      10,
      "熱"
     ]
    ],
    "en": [
     {
      "t": "fever"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "construction",
    "jp": [
     [
      11,
      "を"
     ],
     [
      12,
      "出した"
     ]
    ],
    "en": [
     {
      "t": "with"
     }
    ],
    "label": "熱を出した子 \"a child who has a fever\": \"a child with a fever\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      13,
      "子"
     ]
    ],
    "en": [
     {
      "t": "child"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      16,
      "行く"
     ]
    ],
    "en": [
     {
      "t": "go"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "focus",
    "jp": [
     [
      21,
      "でも"
     ]
    ],
    "en": [
     {
      "t": "Even"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      18,
      "隣"
     ]
    ],
    "en": [
     {
      "t": "next"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      20,
      "村"
     ]
    ],
    "en": [
     {
      "t": "village"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      23,
      "それ"
     ]
    ],
    "en": [
     {
      "t": "That"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      25,
      "いい"
     ]
    ],
    "en": [
     {
      "t": "fine"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      28,
      "好き"
     ]
    ],
    "en": [
     {
      "t": "want"
     }
    ],
    "label": "好きで \"because I like to\": \"because I want to\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      30,
      "やってる"
     ]
    ],
    "en": [
     {
      "t": "do"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "reason",
    "jp": [
     [
      31,
      "から"
     ]
    ],
    "en": [
     {
      "t": "because"
     }
    ]
   }
  ],
  "notes": [
   [
    8,
    "でも",
    "でも \"even\": \"even in the middle of the night\"; the English leaves the \"even\" out here."
   ],
   [
    15,
    "いれば",
    "いれば \"if there is\": the English sets it as a scene, \"a child with a fever — I go\"."
   ]
  ]
 },
 {
  "key": "a1-d4b93e0f-508c",
  "scene": "hall.w5.c_stone",
  "line": 1,
  "jp": "{水路|すいろ} から {石|いし} を {取|と}り{除|のぞ}いた 。 …… {何|なに} も {変|か}わらない 。 {理由|りゆう} は 、 ここ で は ない よう だ 。",
  "en": "You lift the stone out of the channel. …Nothing changes. That isn't why, it seems.",
  "dia": null,
  "reviewed": "2026-10-16 developer review against the full line (not a native speaker); AG-1 seed",
  "rels": [
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      0,
      "水路"
     ]
    ],
    "en": [
     {
      "t": "channel"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "case",
    "jp": [
     [
      1,
      "から"
     ]
    ],
    "en": [
     {
      "t": "out"
     },
     {
      "t": "of"
     }
    ],
    "label": "から \"from\": here \"out of\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      2,
      "石"
     ]
    ],
    "en": [
     {
      "t": "stone"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      4,
      "取り除いた"
     ]
    ],
    "en": [
     {
      "t": "lift"
     }
    ]
   },
   {
    "tier": "grammar",
    "fn": "construction",
    "jp": [
     [
      8,
      "何"
     ],
     [
      9,
      "も"
     ],
     [
      10,
      "変わらない"
     ]
    ],
    "en": [
     {
      "t": "Nothing"
     }
    ],
    "label": "何も … ない: \"nothing\""
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      10,
      "変わらない"
     ]
    ],
    "en": [
     {
      "t": "changes"
     }
    ]
   },
   {
    "tier": "word",
    "fn": "meaning",
    "jp": [
     [
      12,
      "理由"
     ]
    ],
    "en": [
     {
      "t": "why"
     }
    ],
    "label": "理由 \"the reason\": \"That isn't why\""
   },
   {
    "tier": "grammar",
    "fn": "cop",
    "jp": [
     [
      16,
      "で"
     ],
     [
      17,
      "は"
     ],
     [
      18,
      "ない"
     ]
    ],
    "en": [
     {
      "t": "isn't"
     },
     {
      "t": "isn't",
      "p": 1
     }
    ],
    "label": "ではない: \"is not\""
   },
   {
    "tier": "grammar",
    "fn": "modal",
    "jp": [
     [
      19,
      "よう"
     ],
     [
      20,
      "だ"
     ]
    ],
    "en": [
     {
      "t": "it"
     },
     {
      "t": "seems"
     }
    ],
    "label": "～ようだ: \"it seems\""
   }
  ],
  "notes": [
   [
    15,
    "ここ",
    "ここ \"here\" (this spot): the English says \"That\"."
   ]
  ]
 }
]);
