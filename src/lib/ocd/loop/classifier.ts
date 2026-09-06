export type LoopStageKey =
  | "trigger"
  | "obsession"
  | "anxiety"
  | "compulsion"
  | "temporaryRelief";

export type CompulsionCategory =
  | "CHECKING"
  | "WASHING"
  | "MENTAL_REVIEW"
  | "REASSURANCE"
  | "SYMMETRY"
  | "AVOIDANCE"
  | "GOOGLE_SEARCH"
  | "BODY_CHECKING"
  | "MENTAL_REPLAY"
  | "PRAYER"
  | "COUNTING"
  | "MENTAL_COMPULSION"
  | "CONFIRMATION"
  | "REPEATED_TESTING";

export interface CompulsionPattern {
  name: string;
  category: CompulsionCategory;
  pattern: RegExp;
  description: string;
}

export interface LoopStages {
  trigger?: string;
  obsession?: string;
  anxiety?: string;
  compulsion?: string;
  temporaryRelief?: string;
}

export const COMPULSION_PATTERNS: readonly CompulsionPattern[] = [
  // 1. Checking (反覆檢查)
  {
    name: "反覆檢查行為 (Checking)",
    category: "CHECKING",
    pattern: /(回(去|頭)?(看|檢查|確認)|重(複|新)?(看|檢查|鎖)|錄影存證|拍照存證|檢查了\d+次|反覆看門窗)/,
    description: "檢查門窗、瓦斯、電器、文字等行為以確保安全",
  },
  // 2. Washing & Cleaning (過度清潔)
  {
    name: "過度清洗與清潔 (Washing)",
    category: "WASHING",
    pattern: /(一直(洗|搓)|洗手\d+次|用酒精噴|消毒全部|不敢碰髒|洗澡洗了\d+小時|反覆洗|washing (my )?hands|alcohol spray|scrubbing (my )?hands|disinfecting)/i,
    description: "重複洗滌或物理隔離汙染感",
  },
  // 3. Mental Review (精神反芻與分析)
  {
    name: "心智審查與精神反芻 (Mental Rumination)",
    category: "MENTAL_REVIEW",
    pattern: /(一直想|分析(動機|細節)|在腦子裡(辯論|證明)|反芻|回想剛才(對話|細節|有沒有講錯))/,
    description: "在大腦內部進行長達數小時的分析、推理與自我辯護",
  },
  // 4. Reassurance (尋求保證)
  {
    name: "向外求取保證 (Reassurance Seeking)",
    category: "REASSURANCE",
    pattern: /(一直問(別人|朋友|伴侶)|求保證|要別人跟我說沒事|逼問家人)/,
    description: "透過他人肯定來換取短暫安全感",
  },
  // 5. Symmetry / Just Right (對稱與剛好)
  {
    name: "對稱與平衡補償 (Symmetry/Just Right)",
    category: "SYMMETRY",
    pattern: /(擺到正|對齊|左邊碰一下右邊也要|不平衡|感覺不對勁才重新|必須剛好)/,
    description: "追求非恰好感（NJREs）的平衡與重複微調",
  },
  // 6. Avoidance (迴避行為)
  {
    name: "主動迴避行為 (Avoidance)",
    category: "AVOIDANCE",
    pattern: /(不敢(去|摸|看|碰|走)|繞路|丟掉(衣服|東西)|避開(數字|字眼|刀具|人群|醫院)|躲在房間)/,
    description: "透過繞開誘發情境以逃避焦慮，但會持續擴大恐懼邊界",
  },
  // 7. Google Search (網路搜尋症狀)
  {
    name: "網路搜尋強迫 (Cyberchondria / Google Search)",
    category: "GOOGLE_SEARCH",
    pattern: /(Google(查了|搜尋|找資料)|上網(狂)?查|查了一整(天|晚|夜)|查了一下午|爬遍了(Dcard|PTT|Reddit|論壇)|狂查(病徵|症狀)|非要把.*(症狀|病徵).*比對完)/,
    description: "透過搜尋引擎不斷尋找醫療或確診資訊以求安心",
  },
  // 8. Body Checking (身體感官檢查)
  {
    name: "身體感知檢查 (Body Checking)",
    category: "BODY_CHECKING",
    pattern: /(一直.*(摸|按|量|測).*(淋巴|脈搏|心跳|體溫|血壓)|照鏡子.*(檢查|皮膚|喉嚨|腫瘤)|反覆吞口水測試|捏自己看看有沒有麻)/,
    description: "反覆監控自身生理指標、器官感官或外觀異狀",
  },
  // 9. Mental Replay (場景倒帶回放)
  {
    name: "記憶場景倒帶回放 (Mental Replay)",
    category: "MENTAL_REPLAY",
    pattern: /(腦中.*(倒帶|回放|重播)|逐字倒帶|重新經歷剛才的場景|一格一格回想|反覆倒帶剛才講的話)/,
    description: "在大腦中像錄影帶一樣不斷重播過去事件確認細節",
  },
  // 10. Prayer & Neutralizing Mantras (儀式化祈禱或默念)
  {
    name: "儀式化祈禱或念咒 (Prayer & Neutralizing Mantras)",
    category: "PRAYER",
    pattern: /(默念.*(次|祈禱|咒語|好話|佛號|抵銷|保佑|消除)|在心裡(禱告|念|默念|抵銷)|一直(在心裡)?說對不起|祈求神明)/,
    description: "使用固定字詞、神聖符號或道歉抵銷不祥念頭",
  },
  // 11. Counting (計數強迫)
  {
    name: "計數強迫 (Counting Compulsion)",
    category: "COUNTING",
    pattern: /(數到\d+|算步數|敲\d+下|必須是(偶數|雙數|特定數字|吉利數字)|數了\d+次)/,
    description: "依賴數字規則、敲擊或計算頻率來確保安全感",
  },
  // 12. Mental Compulsion (純心智強迫消除)
  {
    name: "純心智強迫行為 (Mental Compulsion)",
    category: "MENTAL_COMPULSION",
    pattern: /(在心裡(替換|推翻|取消|消除)|想像一個好畫面來蓋過|在大腦裡抵銷|在腦中跟念頭辯駁)/,
    description: "不具外顯動作，完全在大腦內進行的抵銷、想像置換或心理自我證明",
  },
  // 13. Confirmation (索求他人確認)
  {
    name: "索求他人確認 (Confirmation Seeking)",
    category: "CONFIRMATION",
    pattern: /(問身邊人.*(有沒有|是不是|撞到人)|問了.*好幾遍|要求對方重複說|跟(朋友|家人|同事)核對事實|要同事保證)/,
    description: "向身邊重要他人索求事實重複核實",
  },
  // 14. Repeated Testing (反覆重做檢測)
  {
    name: "反覆醫學或自我檢測 (Repeated Testing)",
    category: "REPEATED_TESTING",
    pattern: /(反覆(快篩|做測驗|看醫生|做檢查)|換了\d+個醫生|做了好幾次檢查|重複檢測)/,
    description: "多次進行實體篩檢或奔波各大醫院尋求重複診斷",
  },
] as const;
