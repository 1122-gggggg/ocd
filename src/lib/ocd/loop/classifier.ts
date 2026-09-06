export type LoopStage =
  | "TRIGGER"
  | "OBSESSION"
  | "ANXIETY"
  | "COMPULSION"
  | "TEMPORARY_RELIEF";

export interface CompulsionPattern {
  name: string;
  category: "CHECKING" | "WASHING" | "MENTAL_REVIEW" | "REASSURANCE" | "SYMMETRY";
  pattern: RegExp;
  description: string;
}

export const COMPULSION_PATTERNS: readonly CompulsionPattern[] = [
  {
    name: "反覆檢查行為 (Checking)",
    category: "CHECKING",
    pattern: /(回(去|頭)?(看|檢查|確認)|重(複|新)?(看|檢查|鎖)|錄影|拍照存證)/,
    description: "檢查門窗、瓦斯、電器、文字等行為",
  },
  {
    name: "過度清洗與清潔 (Washing)",
    category: "WASHING",
    pattern: /(一直(洗|搓)|洗手\d+次|用酒精噴|消毒全部|不敢碰)/,
    description: "重複洗滌或物理隔離汙染",
  },
  {
    name: "心智審查與精神反芻 (Mental Rumination)",
    category: "MENTAL_REVIEW",
    pattern: /(一直想|腦中(倒帶|回放|重播)|分析(動機|細節)|在腦子裡(辯論|證明)|反芻)/,
    description: "在大腦內部進行長達數小時的倒帶與自我證明",
  },
  {
    name: "向外求取保證 (Reassurance Seeking)",
    category: "REASSURANCE",
    pattern: /(一直問(別人|朋友|伴侶)|Google(病徵|症狀)|上網查了一整(天|晚))/,
    description: "透過網路或他人肯定來緩解懷疑",
  },
  {
    name: "對稱與平衡補償 (Symmetry/Just Right)",
    category: "SYMMETRY",
    pattern: /(擺到正|對齊|左邊碰一下右邊也要|不平衡|感覺不對勁才)/,
    description: "追求非恰好感（NJREs）的平衡與重複微調",
  },
] as const;
