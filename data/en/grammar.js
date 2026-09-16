window.GRAMMAR = [
  {
    id: "en_g001",
    title: "一般现在时",
    level: "A1",
    explanation: "表示习惯性动作、客观事实或普遍真理。主语为第三人称单数时动词加 -s/-es。",
    structure: "主语 + 动词原形 / 动词-s（第三人称单数）",
    examples: [
      { con: "She works in a hospital.", zh: "她在医院工作。", ipa: "Si w3rks In @ hOspItl" },
      { con: "The sun rises in the east.", zh: "太阳从东方升起。", ipa: "D@ sVn raIzIz In Di ist" }
    ],
    exercises: [
      { type: "fill", question: "He ___ (go) to school every day.", answer: "goes" },
      { type: "fill", question: "They ___ (like) music.", answer: "like" }
    ]
  },
  {
    id: "en_g002",
    title: "一般过去时",
    level: "A1",
    explanation: "表示过去某个时间发生的动作或状态。规则动词加 -ed，不规则动词需单独记忆。",
    structure: "主语 + 动词过去式",
    examples: [
      { con: "I watched a movie yesterday.", zh: "我昨天看了一部电影。", ipa: "aI wAtSt @ muvi jest@rdeI" },
      { con: "She went to Beijing last week.", zh: "她上周去了北京。", ipa: "Si went tu beI'dZIN l&st wik" }
    ],
    exercises: [
      { type: "fill", question: "He ___ (study) English last night.", answer: "studied" },
      { type: "fill", question: "They ___ (go) to the park.", answer: "went" }
    ]
  },
  {
    id: "en_g003",
    title: "一般将来时",
    level: "A2",
    explanation: "表示将来发生的动作或存在的状态。will 用于临时决定，be going to 用于计划好的事。",
    structure: "will + 动词原形 / be going to + 动词原形",
    examples: [
      { con: "I will call you tomorrow.", zh: "我明天会给你打电话。", ipa: "aI wIl kOl ju t@mOr@U" },
      { con: "She is going to travel to Japan.", zh: "她打算去日本旅行。", ipa: "Si Iz goUIN tu tr&vl tu dZ@'p&n" }
    ],
    exercises: [
      { type: "fill", question: "I ___ (see) him tomorrow.", answer: "will see" },
      { type: "fill", question: "They ___ (visit) the museum next week.", answer: "are going to visit" }
    ]
  },
  {
    id: "en_g004",
    title: "现在进行时",
    level: "A1",
    explanation: "表示现在正在进行的动作。由 be 动词 + 动词 -ing 构成。",
    structure: "am / is / are + 动词-ing",
    examples: [
      { con: "I am reading a book.", zh: "我正在读一本书。", ipa: "aI &m ridIN @ bUk" },
      { con: "They are playing football.", zh: "他们正在踢足球。", ipa: "DeI Ar pleIIN fUtbOl" }
    ],
    exercises: [
      { type: "fill", question: "She ___ (write) a letter now.", answer: "is writing" },
      { type: "fill", question: "We ___ (have) dinner.", answer: "are having" }
    ]
  },
  {
    id: "en_g005",
    title: "现在完成时",
    level: "B1",
    explanation: "表示过去发生的动作对现在造成的影响，或从过去持续到现在的动作。四六级高频考点。",
    structure: "have / has + 过去分词",
    examples: [
      { con: "I have finished my homework.", zh: "我已经完成作业了。", ipa: "aI h&v fInISt maI hoUmw3rk" },
      { con: "She has lived here for ten years.", zh: "她在这里住了十年了。", ipa: "Si h&z lIvd hir fOr ten jirz" }
    ],
    exercises: [
      { type: "fill", question: "I ___ (be) to London twice.", answer: "have been" },
      { type: "fill", question: "He ___ (not finish) his work yet.", answer: "hasn't finished" }
    ]
  },
  {
    id: "en_g006",
    title: "被动语态",
    level: "B1",
    explanation: "表示主语是动作的承受者。由 be 动词 + 过去分词构成。四六级考试必考。",
    structure: "be + 过去分词 (+ by + 施动者)",
    examples: [
      { con: "The book was written by Lu Xun.", zh: "这本书是鲁迅写的。", ipa: "D@ bUk w@z rItn baI lu SUn" },
      { con: "English is spoken all over the world.", zh: "全世界都讲英语。", ipa: "INglIS Iz spoUk@n Ol oUv@r D@ w3rld" }
    ],
    exercises: [
      { type: "fill", question: "The letter ___ (send) yesterday.", answer: "was sent" },
      { type: "fill", question: "The house ___ (build) in 1990.", answer: "was built" }
    ]
  },
  {
    id: "en_g007",
    title: "定语从句",
    level: "B1",
    explanation: "修饰名词或代词的从句。关系代词有 who、whom、whose、which、that。四六级高频。",
    structure: "先行词 + 关系代词 + 从句",
    examples: [
      { con: "The man who is standing there is my teacher.", zh: "站在那里的那个人是我的老师。", ipa: "D@ m&n hu Iz st&ndIN Der Iz maI titS@" },
      { con: "This is the book that I bought yesterday.", zh: "这就是我昨天买的书。", ipa: "DIs Iz D@ bUk D&t aI bOt jest@rdeI" }
    ],
    exercises: [
      { type: "fill", question: "The girl ___ is singing is my sister.", answer: "who" },
      { type: "fill", question: "This is the pen ___ I lost.", answer: "that" }
    ]
  },
  {
    id: "en_g008",
    title: "状语从句",
    level: "B1",
    explanation: "用连词引导，表示时间、原因、条件、让步、目的、结果等。",
    structure: "连词 + 从句 + 主句",
    examples: [
      { con: "When I got home, my mother was cooking.", zh: "我到家时，妈妈正在做饭。", ipa: "wen aI gOt hoUm maI mV D@r w@z kUkIN" },
      { con: "If it rains tomorrow, we will stay at home.", zh: "如果明天下雨，我们就待在家里。", ipa: "If It reInz t@mOr@U wi wIl steI &t hoUm" }
    ],
    exercises: [
      { type: "fill", question: "___ he is young, he knows a lot.", answer: "Although" },
      { type: "fill", question: "I will call you ___ I arrive.", answer: "when" }
    ]
  },
  {
    id: "en_g009",
    title: "虚拟语气",
    level: "B2",
    explanation: "表示与事实相反的假设、愿望或建议。四六级重点难点。",
    structure: "If + 过去式, would / could + 动词原形",
    examples: [
      { con: "If I were you, I would accept the offer.", zh: "如果我是你，我会接受这个提议。", ipa: "If aI w3r ju aI wUd &k'sept Di Of@" },
      { con: "I wish I could fly.", zh: "我希望我能飞。", ipa: "aI wIS aI kUd flaI" }
    ],
    exercises: [
      { type: "fill", question: "If I ___ (have) time, I would help you.", answer: "had" },
      { type: "fill", question: "I wish I ___ (be) taller.", answer: "were" }
    ]
  },
  {
    id: "en_g010",
    title: "非谓语动词：不定式",
    level: "B1",
    explanation: "to + 动词原形，可作主语、宾语、定语、状语、补语。",
    structure: "to + 动词原形",
    examples: [
      { con: "I want to learn English well.", zh: "我想学好英语。", ipa: "aI wOnt tu l3rn INglIS wel" },
      { con: "It is important to study hard.", zh: "努力学习很重要。", ipa: "It Iz Im'pOrt@nt tu stVdi hArd" }
    ],
    exercises: [
      { type: "fill", question: "She decided ___ (go) abroad.", answer: "to go" },
      { type: "fill", question: "My dream is ___ (become) a doctor.", answer: "to become" }
    ]
  },
  {
    id: "en_g011",
    title: "非谓语动词：动名词",
    level: "B1",
    explanation: "动词 -ing 形式，起名词作用。某些动词后必须接动名词（如 enjoy、finish、mind）。",
    structure: "动词-ing",
    examples: [
      { con: "I enjoy reading books.", zh: "我喜欢读书。", ipa: "aI In'dZOI ridIN bUks" },
      { con: "Swimming is good for health.", zh: "游泳对健康有好处。", ipa: "swImIN Iz gUd fOr helT" }
    ],
    exercises: [
      { type: "fill", question: "He finished ___ (write) the report.", answer: "writing" },
      { type: "fill", question: "Would you mind ___ (open) the window?", answer: "opening" }
    ]
  },
  {
    id: "en_g012",
    title: "非谓语动词：过去分词",
    level: "B2",
    explanation: "表示被动或完成，可作定语、状语、补语。",
    structure: "过去分词",
    examples: [
      { con: "The broken window needs to be repaired.", zh: "破了的窗户需要修理。", ipa: "D@ broUk@n wIndoU nidz tu bi rI'perd" },
      { con: "Seen from the top, the city looks beautiful.", zh: "从山顶看，这座城市很美。", ipa: "sin frOm D@ tOp D@ sIti lUks bjut@fUl" }
    ],
    exercises: [
      { type: "fill", question: "The ___ (steal) car was found.", answer: "stolen" },
      { type: "fill", question: "___ (give) more time, I could do it better.", answer: "Given" }
    ]
  },
  {
    id: "en_g013",
    title: "名词性从句",
    level: "B1",
    explanation: "在句中起名词作用的从句，包括主语从句、宾语从句、表语从句、同位语从句。",
    structure: "that / whether / wh- 词 + 从句",
    examples: [
      { con: "I don't know whether he will come.", zh: "我不知道他是否会来。", ipa: "aI doUnt noU weD@r hi wIl kVm" },
      { con: "What he said is true.", zh: "他说的是真的。", ipa: "wAt hi sed Iz tru" }
    ],
    exercises: [
      { type: "fill", question: "I think ___ he is right.", answer: "that" },
      { type: "fill", question: "___ she will come is unknown.", answer: "Whether" }
    ]
  },
  {
    id: "en_g014",
    title: "倒装句",
    level: "B2",
    explanation: "将谓语或部分谓语提到主语前。常见于否定词开头、only 开头、so/neither 开头等。",
    structure: "否定词 / only + 助动词 + 主语 + 谓语",
    examples: [
      { con: "Never have I seen such a beautiful place.", zh: "我从没见过这么美的地方。", ipa: "nev@r h&v aI sin sVtS @ bjut@fUl pleIs" },
      { con: "Only then did I realize my mistake.", zh: "直到那时我才意识到我的错误。", ipa: "oUnli Den dId aI ri@laIz maI mI'steIk" }
    ],
    exercises: [
      { type: "fill", question: "Never ___ I heard such a story.", answer: "have" },
      { type: "fill", question: "Only in this way ___ we solve the problem.", answer: "can" }
    ]
  },
  {
    id: "en_g015",
    title: "强调句",
    level: "B1",
    explanation: "用 It is / was ... that ... 强调句子某一部分。",
    structure: "It is / was + 被强调部分 + that / who + 其余部分",
    examples: [
      { con: "It was Tom that broke the window.", zh: "是汤姆打破了窗户。", ipa: "It w@z tOm D&t broUk D@ wIndoU" },
      { con: "It is English that I love most.", zh: "我最喜欢的是英语。", ipa: "It Iz INglIS D&t aI lVv moUst" }
    ],
    exercises: [
      { type: "fill", question: "It ___ Mary that helped me.", answer: "was" },
      { type: "fill", question: "It is music ___ makes me happy.", answer: "that" }
    ]
  },
  {
    id: "en_g016",
    title: "比较级和最高级",
    level: "A2",
    explanation: "形容词、副词比较级和最高级的构成与用法。",
    structure: "比较级 + than / the + 最高级 + in / of",
    examples: [
      { con: "He is taller than his brother.", zh: "他比他哥哥高。", ipa: "hi Iz tOl@r D&n hIz brVD@r" },
      { con: "This is the most interesting book I've ever read.", zh: "这是我读过的最有趣的书。", ipa: "DIs Iz D@ moUst Intr@stIN bUk aIv ev@r red" }
    ],
    exercises: [
      { type: "fill", question: "She is ___ (young) than me.", answer: "younger" },
      { type: "fill", question: "It is the ___ (good) film I've seen.", answer: "best" }
    ]
  },
  {
    id: "en_g017",
    title: "情态动词",
    level: "A2",
    explanation: "表示能力、许可、义务、推测等。常见：can、may、must、should、could、might。",
    structure: "情态动词 + 动词原形",
    examples: [
      { con: "You must finish it today.", zh: "你必须今天完成。", ipa: "ju mVst fInIS It t@deI" },
      { con: "She can speak three languages.", zh: "她会说三种语言。", ipa: "Si k&n spik Tri l&NgwIdZIz" }
    ],
    exercises: [
      { type: "fill", question: "You ___ not smoke here.", answer: "must" },
      { type: "fill", question: "___ you help me, please?", answer: "Could" }
    ]
  },
  {
    id: "en_g018",
    title: "介词搭配",
    level: "B1",
    explanation: "英语中介词与动词、形容词、名词的固定搭配，四六级高频考点。",
    structure: "动词/形容词 + 介词",
    examples: [
      { con: "I am interested in music.", zh: "我对音乐感兴趣。", ipa: "aI &m Intr@stId In mjuzIk" },
      { con: "She depends on her parents.", zh: "她依赖她的父母。", ipa: "Si dI'pendz On h3r pEr@nts" }
    ],
    exercises: [
      { type: "fill", question: "He is good ___ math.", answer: "at" },
      { type: "fill", question: "I'm looking forward ___ seeing you.", answer: "to" }
    ]
  },
  {
    id: "en_g019",
    title: "主谓一致",
    level: "B1",
    explanation: "谓语动词在人称和数上必须与主语一致。注意集合名词、不定代词、就近原则等。",
    structure: "主语 + 谓语（数一致）",
    examples: [
      { con: "The number of students is increasing.", zh: "学生人数在增加。", ipa: "D@ nVmb@r Ov stjud@nts Iz In'krisIN" },
      { con: "Either you or he is right.", zh: "要么你对，要么他对。", ipa: "iD@r ju Or hi Iz raIt" }
    ],
    exercises: [
      { type: "fill", question: "Each of the boys ___ (have) a book.", answer: "has" },
      { type: "fill", question: "Neither Tom nor I ___ (be) wrong.", answer: "am" }
    ]
  },
  {
    id: "en_g020",
    title: "独立主格结构",
    level: "B2",
    explanation: "由名词/代词 + 分词/形容词/副词/介词短语构成，作状语。是四六级写作加分点。",
    structure: "名词/代词 + 分词/形容词/介词短语",
    examples: [
      { con: "The weather being fine, we went out.", zh: "天气很好，我们出去了。", ipa: "D@ weD@r biIN faIn wi went aUt" },
      { con: "His homework finished, he went to bed.", zh: "作业做完了，他去睡觉了。", ipa: "hIz hoUmw3rk fInISt hi went tu bed" }
    ],
    exercises: [
      { type: "fill", question: "The work ___ (do), we went home.", answer: "done" },
      { type: "fill", question: "Time ___ (permit), we will visit you.", answer: "permitting" }
    ]
  }
];