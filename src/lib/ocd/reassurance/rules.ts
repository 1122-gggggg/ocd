export type ReassuranceSubtype =
  | "EXISTENTIAL"
  | "SCRUPULOSITY"
  | "FALSE_MEMORY"
  | "BODY_CHECKING"
  | "RELATIONSHIP_CHECKING"
  | "MENTAL_CHECKING"
  | "GOOGLE_REASSURANCE"
  | "AI_REASSURANCE"
  | "PARTNER_REASSURANCE"
  | "REPEATED_TESTING"
  | "GENERAL_CHECKING"
  | "HARM_FEAR"
  | "CONTAMINATION";

export interface ReassuranceRule {
  id: string;
  subtype: ReassuranceSubtype;
  pattern: RegExp;
  weight: number;
  description: string;
}

export const REASSURANCE_RULES: readonly ReassuranceRule[] = [
  // 1. Existential Reassurance
  {
    id: "existential_reassurance",
    subtype: "EXISTENTIAL",
    pattern: /(這世界(真的)?存在嗎|我是不是(真的)?存在|這世界是不是(真的|假的|虛假的|幻覺)|我活著是不是假的|有沒有可能一切都不存在|唯我論|意識到底正不正常|會不會我其實在做夢|請告訴我這是真實的|人生到底有沒有意義)/,
    weight: 0.85,
    description: "存在型強迫：詢問自我存在、意識或世界真實性的確定性保證",
  },
  {
    id: "existential_reassurance_en",
    subtype: "EXISTENTIAL",
    pattern: /(is reality real|am i real|do i actually exist|solipsism|what if everything is a simulation|is my consciousness normal)/i,
    weight: 0.85,
    description: "Existential OCD reassurance seeking",
  },

  // 2. Scrupulosity (Moral / Religious)
  {
    id: "scrupulosity_reassurance",
    subtype: "SCRUPULOSITY",
    pattern: /(我是不是(個)?(罪人|壞人|變態|怪物|偽善者|冷血|潛在殺人犯)|(會不會下地獄|神會不會(懲罰|原諒)|被神懲罰|遭天譴)|這樣算不算(褻瀆|犯罪|造孽|觸犯戒律)|有這個念頭是不是代表我(邪惡|很壞))/,
    weight: 0.9,
    description: "道德與宗教型強迫：針對道德本質、罪孽或懲罰尋求確認",
  },
  {
    id: "scrupulosity_reassurance_en",
    subtype: "SCRUPULOSITY",
    pattern: /(am i a (bad|terrible|evil|sinful) person|did i commit a sin|will god punish me|am i going to hell|does this intrusive thought make me evil)/i,
    weight: 0.9,
    description: "Scrupulosity moral/religious checking",
  },

  // 3. False Memory
  {
    id: "false_memory_reassurance",
    subtype: "FALSE_MEMORY",
    pattern: /(怕自己|懷疑自己|會不會|有沒有|擔心自己)?.*(撞到人|撞了人|撞死人|偷了東西|摸了別人|犯了法|肇事逃逸|得罪人).*(幫我確認|確認一下|有沒有車禍|請確認|是不是真的|我真的有做過嗎)/,
    weight: 0.85,
    description: "假記憶強迫：對過去未曾發生的事件反覆向他人尋求澄清與記憶核對",
  },
  {
    id: "false_memory_reassurance_en",
    subtype: "FALSE_MEMORY",
    pattern: /(did i hit someone( with my car)?|did i do something terrible in the past|what if i did it and forgot|can someone confirm i didn't do it)/i,
    weight: 0.85,
    description: "False-memory reassurance seeking",
  },

  // 4. Body Checking (Somatic / Sensorimotor)
  {
    id: "body_checking_reassurance",
    subtype: "BODY_CHECKING",
    pattern: /(量了(心跳|血壓|體溫)|心跳一分鐘\d+下(算不算|到底有沒)|呼吸感覺不順是不是有病|吞嚥卡卡的是不是癌症|摸到淋巴(結)?是不是腫瘤|捏身體感覺麻|照鏡子檢查皮膚|這樣算正常嗎)/,
    weight: 0.8,
    description: "身體感覺型強迫：將身體自律感官或生理數值向外界重複確認正常與否",
  },
  {
    id: "body_checking_reassurance_en",
    subtype: "BODY_CHECKING",
    pattern: /(is my heart rate normal|does this body sensation mean i have cancer|checking my pulse repeatedly|swallowing feels weird is it a disease)/i,
    weight: 0.8,
    description: "Somatic symptom checking",
  },

  // 5. Relationship Checking (ROCD)
  {
    id: "rocd_reassurance",
    subtype: "RELATIONSHIP_CHECKING",
    pattern: /(我是不是(真的)?不愛(他|她|另一半|伴侶|男友|女友)|算不算不愛|這算不算是?(真愛|適合)|要不要分手|看別人.*(帥|美).*(出軌|不愛)|怎麼確認對方是不是對的人|我們到底配不配)/,
    weight: 0.8,
    description: "關係型強迫：對伴侶感覺或感情確定性尋求保證",
  },
  {
    id: "rocd_reassurance_en",
    subtype: "RELATIONSHIP_CHECKING",
    pattern: /(do i really love my partner|how do i know (s)?he is the one|should i break up|am i attracted to someone else so i don't love)/i,
    weight: 0.8,
    description: "Relationship OCD certainty seeking",
  },

  // 6. Mental Checking (Pure O / Mental Intrusion)
  {
    id: "mental_checking_reassurance",
    subtype: "MENTAL_CHECKING",
    pattern: /(腦中(跳出|出現|有)這個念頭是不是代表我(想做|潛在是)|腦袋一直(回放|回想|重複一句話)|有性侵入念頭是不是代表我有這傾向|我怎麼會想到這個|大家也會這樣想嗎)/,
    weight: 0.85,
    description: "純心智強迫：因侵入性念頭向外界求證是否代表真實意願",
  },
  {
    id: "mental_checking_reassurance_en",
    subtype: "MENTAL_CHECKING",
    pattern: /(does having this thought mean i want it|intrusive thought about harm\/sex|why am i thinking this does it mean i am)/i,
    weight: 0.85,
    description: "Mental intrusion validation",
  },

  // 7. Google Reassurance
  {
    id: "google_reassurance",
    subtype: "GOOGLE_REASSURANCE",
    pattern: /(Google(查了|搜尋|說)|上網查了一整(天|晚|夜)|查完百度\/維基更怕|網路上說這個症狀會(死|癱瘓|致癌)|越查越害怕但還是忍不住查|在網上爬文確認)/,
    weight: 0.85,
    description: "網路強迫確認：因搜尋引擎醫療資訊陷入更深恐慌並向外求保證",
  },
  {
    id: "google_reassurance_en",
    subtype: "GOOGLE_REASSURANCE",
    pattern: /(i googled my symptoms|google says i might have|searched online all day for reassurance)/i,
    weight: 0.85,
    description: "Cyberchondria and online reassurance loops",
  },

  // 8. AI Reassurance
  {
    id: "ai_reassurance",
    subtype: "AI_REASSURANCE",
    pattern: /(AI(請)?(跟我說|保證|確認)|問了(ChatGPT|Claude|GPT|機器人).*想要.*(保證|確認)|請AI替我確認|你可以(承諾|保證)我不會(怎樣|失控|生病)嗎|你可以保證我)/i,
    weight: 0.9,
    description: "AI求保證：嘗試要求大語言模型或助手給予安全承諾與不致病保證",
  },
  {
    id: "ai_reassurance_en",
    subtype: "AI_REASSURANCE",
    pattern: /(chatgpt told me i'm fine|ask(ed)? (chatgpt|ai).*promise|ai please reassure me|can you promise me i won't|promise me i am (not|safe|fine)|tell me i'm safe|promise me i'm safe)/i,
    weight: 0.9,
    description: "AI-targeted reassurance seeking",
  },

  // 9. Reassurance via Partner / Family
  {
    id: "reassurance_via_partner",
    subtype: "PARTNER_REASSURANCE",
    pattern: /(一直(問|逼問|確認)(伴侶|老公|老婆|男友|女友|媽媽|家人|朋友)|跟(另一半|家人)確認了\d+次|問了他很多遍他有沒生氣|需要另一半一直保證)/,
    weight: 0.85,
    description: "人際牽連求保證：反覆向親友或伴侶要求回答同樣的問題以獲取安全感",
  },
  {
    id: "reassurance_via_partner_en",
    subtype: "PARTNER_REASSURANCE",
    pattern: /(asking my partner repeatedly|asking my mom if i'm okay|constantly needing my family to confirm)/i,
    weight: 0.85,
    description: "Interpersonal reassurance seeking",
  },

  // 10. Reassurance via Repeated Testing
  {
    id: "reassurance_repeated_testing",
    subtype: "REPEATED_TESTING",
    pattern: /(快篩|驗孕|抽血|檢查|測驗).*(驗了|做了|重複).*([0-9]+|[一二兩三四五六七八九十]+)次.*(陰性|正常).*(會不會|不相信|偽陰性|正常嗎|還是怕|但我該相信嗎)|(快篩(驗了|做了)\d+次)/,
    weight: 0.85,
    description: "重複檢驗疑慮：即使醫學或客觀檢測多次陰性，仍對檢驗結果真實性存疑並求安慰",
  },
  {
    id: "reassurance_repeated_testing_en",
    subtype: "REPEATED_TESTING",
    pattern: /(tested \d+ times still (doubt|worry)|got negative results but don't believe it|tested multiple times)/i,
    weight: 0.85,
    description: "Repeated testing reassurance seeking",
  },

  // General checking & common patterns
  {
    id: "check_if_fine",
    subtype: "GENERAL_CHECKING",
    pattern: /(這樣|到底|會不會)(是不是|算不算)?(沒事|正常|生病|感染|得病|死掉|壞掉|懷孕)/,
    weight: 0.8,
    description: "詢問特定事件是否算正常或沒事",
  },
  {
    id: "ask_guarantee",
    subtype: "GENERAL_CHECKING",
    pattern: /(保證|確認一下|替我確認|求安慰|求保證|告訴我沒事|跟我說不會|請保證我沒事|求大家告訴我沒事)/,
    weight: 0.9,
    description: "明確尋求外部保證或確認",
  },
  {
    id: "harm_fear_reassurance",
    subtype: "HARM_FEAR",
    pattern: /(我會不會(真的)?(去)?(傷害|殺|砍|推|掐|侵犯)|我會不會失控)/,
    weight: 0.85,
    description: "傷害或失控疑慮的再保證尋求",
  },
  {
    id: "contamination_checking",
    subtype: "CONTAMINATION",
    pattern: /(碰(到|了)|摸(到|了)|洗了\d+次|有沒有毒|有沒有細菌|有沒有洗乾淨)/,
    weight: 0.75,
    description: "清潔與汙染相關的重複確認",
  },
  {
    id: "english_reassurance",
    subtype: "GENERAL_CHECKING",
    pattern: /(please reassure me|is it possible that i (am|did)|can someone tell me i'm fine)/i,
    weight: 0.85,
    description: "英文常見求保證句型",
  },
] as const;
