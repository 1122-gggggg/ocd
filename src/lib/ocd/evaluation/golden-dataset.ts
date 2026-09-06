export type GoldenCategory =
  | "REASSURANCE"
  | "COMPULSION"
  | "CRISIS"
  | "NEUTRAL";

export interface GoldenCase {
  id: string;
  text: string;
  expectedCategory: GoldenCategory;
  description: string;
  language: "zh" | "en" | "mixed";
  tags: Array<
    | "colloquial"
    | "negation"
    | "past_event"
    | "third_person"
    | "irony"
    | "recovery"
    | "crisis_severity"
  >;
}

export const GOLDEN_DATASET: readonly GoldenCase[] = [
  // ─── 1. REASSURANCE (尋求保證) ───────────────────────────
  {
    id: "reassurance-01",
    text: "你可以保證我不會害人嗎？我真的好怕失控傷人。",
    expectedCategory: "REASSURANCE",
    description: "傷害型強迫經典求保證句型",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-02",
    text: "我剛剛洗手只洗了兩次，摸到門把這樣到底會不會感染生病？請大家跟我說沒事好不好？",
    expectedCategory: "REASSURANCE",
    description: "污染型強迫尋求他人安全確認",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-03",
    text: "Please reassure me that I'm not a bad person for having this sudden intrusive thought.",
    expectedCategory: "REASSURANCE",
    description: "英文道德審查求保證",
    language: "en",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-04",
    text: "我是不是真的愛我男友？如果看到帥哥多看一眼，算不算不愛他？我要不要現在分手？",
    expectedCategory: "REASSURANCE",
    description: "關係強迫 (ROCD) 確定性尋求",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-05",
    text: "我上網 Google 症狀查了整整一下午，網路說這會致命，求求大家替我確認一下！",
    expectedCategory: "REASSURANCE",
    description: "網路搜尋後尋求外部保證",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-06",
    text: "I already asked ChatGPT 5 times and it says I'm fine, but can someone here promise me I'm safe?",
    expectedCategory: "REASSURANCE",
    description: "AI 求保證後轉向真人尋求再次保證 (Mixed)",
    language: "mixed",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-07",
    text: "我昨天開車過去那條路，剛才一直怕自己撞到人，大家可以幫我確認剛才那條路有沒有車禍嗎？",
    expectedCategory: "REASSURANCE",
    description: "假記憶強迫求外界核實",
    language: "zh",
    tags: ["past_event"],
  },
  {
    id: "reassurance-08",
    text: "我快篩驗了三次都是陰性，可是會不會有千分之一的機率是偽陰性？我這樣真的正常嗎？",
    expectedCategory: "REASSURANCE",
    description: "反覆檢測後的極端懷疑求保證",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "reassurance-09",
    text: "這世界真的存在嗎？我的意識會不會只是唯我論的幻覺？請告訴我這是真實的！",
    expectedCategory: "REASSURANCE",
    description: "存在型強迫尋求確定性",
    language: "zh",
    tags: ["colloquial"],
  },

  // ─── 2. COMPULSION (強迫行為與心智迴圈) ─────────────────
  {
    id: "compulsion-01",
    text: "我剛剛一直回想剛才有沒有講錯話，在腦中把一小時前的對話逐字倒帶了四次。",
    expectedCategory: "COMPULSION",
    description: "心智倒帶回放 (Mental Replay / Review)",
    language: "zh",
    tags: ["past_event"],
  },
  {
    id: "compulsion-02",
    text: "出門後我折返回去檢查瓦斯開關跟門鎖五次，拍照存證後還是不放心，又繞回去看了一次。",
    expectedCategory: "COMPULSION",
    description: "經典反覆物理檢查行為 (Checking)",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "compulsion-03",
    text: "I have been washing my hands with alcohol spray for 40 minutes because of contamination fear.",
    expectedCategory: "COMPULSION",
    description: "英文過度清潔洗滌強迫",
    language: "en",
    tags: ["colloquial"],
  },
  {
    id: "compulsion-04",
    text: "腦中一出現壞念頭，我就必須在心裡默念七次『阿彌陀佛保佑我不是壞人』來抵銷消除它。",
    expectedCategory: "COMPULSION",
    description: "儀式化念咒與心智抵銷強迫 (Prayer / Mental Compulsion)",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "compulsion-05",
    text: "桌上的文具如果沒有對齊到剛好成直線，左邊碰一下右邊也要碰一下，我就完全無法開始做事。",
    expectedCategory: "COMPULSION",
    description: "對稱與恰好感補償強迫 (Symmetry)",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "compulsion-06",
    text: "因為害怕特定數字 4，我繞路走了兩倍遠，把所有跟 4 有關的檔案全刪除不敢碰。",
    expectedCategory: "COMPULSION",
    description: "主動迴避強迫行為 (Avoidance)",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "compulsion-07",
    text: "坐在沙發上一整晚，一直按著脖子量脈搏心跳，還拿著小鏡子狂照喉嚨看有沒有長腫瘤。",
    expectedCategory: "COMPULSION",
    description: "身體感覺檢查強迫 (Body Checking)",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "compulsion-08",
    text: "上網狂查醫學期刊跟論壇直到清晨四點，非要把每一種罕見病的症狀都一一比對完才敢睡。",
    expectedCategory: "COMPULSION",
    description: "網路症狀搜尋強迫 (Google Search)",
    language: "zh",
    tags: ["colloquial"],
  },

  // ─── 3. CRISIS (自傷與危機安全) ─────────────────────────
  {
    id: "crisis-01",
    text: "我現在已經準備結束生命，遺書寫好了，大家永別了。",
    expectedCategory: "CRISIS",
    description: "即刻危急狀態 (IMMINENT_DANGER)",
    language: "zh",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-02",
    text: "我好痛苦真的好想死，強迫症把我折磨得不想活了，想自我了斷。",
    expectedCategory: "CRISIS",
    description: "急性自殺意念 (ACTIVE_RISK)",
    language: "zh",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-03",
    text: "I cannot take this agony anymore, I am going to end my life tonight, goodbye world.",
    expectedCategory: "CRISIS",
    description: "英文即刻告別與結束生命意念",
    language: "en",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-04",
    text: "活著真的太累了，真希望自己能睡著就永遠不要再醒來，消失在這個世界上。",
    expectedCategory: "CRISIS",
    description: "被動消失意念 (PASSIVE_IDEATION)",
    language: "zh",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-05",
    text: "現在一個人坐在頂樓陽台邊緣，拿著刀子，我已經做好所有的準備要離開了。",
    expectedCategory: "CRISIS",
    description: "明確致命手段與地點的即刻危險",
    language: "zh",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-06",
    text: "好想割腕自殘，只有痛覺才能讓我停下大腦的叫聲，真的想死掉算了。",
    expectedCategory: "CRISIS",
    description: "自傷衝動與強烈尋死念頭",
    language: "zh",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-07",
    text: "找不到任何活下去的理由，整個世界都在逼我，我想今天就是終點了。",
    expectedCategory: "CRISIS",
    description: "走投無路之主動輕生意念",
    language: "zh",
    tags: ["crisis_severity"],
  },
  {
    id: "crisis-08",
    text: "Thinking about jumping off the roof to make all these intrusive thoughts stop forever.",
    expectedCategory: "CRISIS",
    description: "英文跳樓致命意念",
    language: "en",
    tags: ["crisis_severity"],
  },

  // ─── 4. NEUTRAL (中性、康復正向、第三方新聞、否定句) ────
  {
    id: "neutral-01",
    text: "我今天終於沒有查 Google，雖然心裡很慌，但我耐受了焦慮去看了電影！",
    expectedCategory: "NEUTRAL",
    description: "康復正向實踐：抵抗強迫分享 (否定句，非求保證)",
    language: "zh",
    tags: ["recovery", "negation"],
  },
  {
    id: "neutral-02",
    text: "我昨天看到新聞提到有人跳樓自殺，覺得很難過，心理健康真的很重要。",
    expectedCategory: "NEUTRAL",
    description: "第三方新聞描述，非當下個人危險",
    language: "zh",
    tags: ["third_person"],
  },
  {
    id: "neutral-03",
    text: "以前我常常想死，但經過 ERP 練習跟服藥後，現在已經走過風暴重回正常生活了。",
    expectedCategory: "NEUTRAL",
    description: "過去事件回顧與康復見證，非當前急性危機",
    language: "zh",
    tags: ["past_event", "recovery"],
  },
  {
    id: "neutral-04",
    text: "今天在診所完成了這週的認知行為治療作業，醫生說我的進步很穩定。",
    expectedCategory: "NEUTRAL",
    description: "常規治療打卡與日常分享",
    language: "zh",
    tags: ["recovery"],
  },
  {
    id: "neutral-05",
    text: "Today I walked past the stove without checking it. My anxiety spiked to 8/10 but dropped after 20 minutes.",
    expectedCategory: "NEUTRAL",
    description: "英文 ERP 成功經驗分享 (Recovery milestone)",
    language: "en",
    tags: ["recovery"],
  },
  {
    id: "neutral-06",
    text: "我想了解一下版上有沒有人也看過這本專門講暴露不反應治療的書？想跟大家交流心得。",
    expectedCategory: "NEUTRAL",
    description: "書籍心得與資訊交流",
    language: "zh",
    tags: ["colloquial"],
  },
  {
    id: "neutral-07",
    text: "我並沒有想自殘或自殺，只是今天工作壓力特別大，想在社群裡找人聊聊。",
    expectedCategory: "NEUTRAL",
    description: "明確否定危機詞語的情緒抒發",
    language: "zh",
    tags: ["negation"],
  },
  {
    id: "neutral-08",
    text: "大腦每天都想騙我世界末日，我現在學會對它說『好喔謝謝提醒隨便你』，感覺幽默感真的能治癒恐懼。",
    expectedCategory: "NEUTRAL",
    description: "幽默接納與對抗強迫心理策略分享",
    language: "zh",
    tags: ["irony", "recovery"],
  },
  {
    id: "neutral-09",
    text: "分享一下我今天帶小狗去公園散步的照片，陽光很棒，希望大家都有一段平靜的午後。",
    expectedCategory: "NEUTRAL",
    description: "日常溫暖閒聊社群分享",
    language: "zh",
    tags: ["colloquial"],
  },
] as const;
