/**
 * 學習資源區內容模型 — 研究寫手輸出此形狀，頁面層只讀此形狀。
 *
 * 寫作規範（硬性）：
 * - 全繁中（zh-Hant），語氣溫和、去污名，不做診斷、不承諾療效。
 * - 案例一律「綜合改寫的匿名短 vignette」，註明為示意；不含自傷/自殺手法細節、
 *   不含血腥露骨描述；每篇症狀頁由頁面層統一加求助 strip，內文不再重複堆電話。
 * - 每個 resource.url 寫入前必須實際請求驗證（HEAD/GET < 400），失連改找替代。
 * - 解法只寫具實證基礎者並標 evidence 等級；新興/爭議療法標 emerging 且加「與醫師討論」。
 */

export type BoardGroup = "SYMPTOM" | "TREATMENT";

export type ResourceKind =
  | "guideline"
  | "org"
  | "book"
  | "paper"
  | "course"
  | "video"
  | "tool";

export type ResourceRegion = "TW" | "INTL";

export interface LearnResource {
  /** 資源名稱（原文或譯名） */
  title: string;
  /** 出版/所屬單位 */
  org: string;
  region: ResourceRegion;
  kind: ResourceKind;
  /** 已驗證可連線的 URL */
  url: string;
  /** 一句話說明（≤60 字） */
  blurb: string;
}

export type EvidenceLevel = "strong" | "moderate" | "emerging";

export interface LearnSolution {
  name: string;
  evidence: EvidenceLevel;
  /** 100–200 字：是什麼、對什麼有幫助 */
  summary: string;
  /** 3–6 步的大方向（不做個人化處方） */
  steps: string[];
  /** 對應本站治療法 slug（症狀頁用），治療法頁用 applicableTo 反向連結 */
  linkSlug?: string;
}

export interface LearnCase {
  title: string;
  /** 病情摘要 50–100 字（去識別化改寫，不含可定位個資） */
  condition: string;
  /** 嘗試過的解方（含無效 / 部分有效者，至少 1 項） */
  tried: string[];
  /** 個案認為有用的解方（至少 1 項） */
  worked: string[];
  /** 150–250 字匿名改寫 vignette，開頭標「示意改寫」 */
  vignette: string;
  /** 一句話 takeaway */
  takeaway: string;
  /** 案例來源平台 */
  source: "zhihu" | "reddit" | "other";
  /** 來源原文連結（讀者可點驗；改寫須忠於原文） */
  sourceUrl: string;
}

/**
 * 案例收錄門檻（三者缺一不可，否則不收）：
 * 1. 有病情（condition 非空） 2. 有嘗試過的解方（tried 非空）
 * 3. 有被認為有用的解方（worked 非空） + 可連線的 sourceUrl。
 * 來源優先知乎 / Reddit r/OCD 等；改寫去識別化（不貼原文大段、不留帳號）。*/
export interface LearnEntry {
  /** 對應 board slug（如 contamination、erp） */
  slug: string;
  /** 顯示名稱（如 污染與清洗） */
  condition: string;
  group: BoardGroup;
  /** 200–350 字認識概述 */
  overview: string;
  solutions: LearnSolution[];
  cases: LearnCase[];
  /** 症狀頁 ≥3 TW + ≥3 INTL；治療法頁 ≥2 TW + ≥2 INTL */
  resources: LearnResource[];
  /** 連回討論區的 board slug（通常同 slug） */
  boardSlug: string;
}
