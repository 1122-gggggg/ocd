/**
 * 全台強迫症診療名錄 — 地區寫手輸出此形狀，頁面層只讀此形狀。
 *
 * 收錄原則（硬性）：
 * - 只收「有公開資訊可驗證」的單位：醫學中心/區域醫院精神科（含強迫症特別門診）、
 *   身心科/精神科診所官網明列強迫症專長者。
 * - URL 必須是該單位官網或掛號頁，寫入前 curl 驗證 (<400)。
 * - 不收個人醫師私人電話/Line；電話只用醫院總機或掛號專線（官網可查者）。
 * - 不做推薦排序（依縣市筆畫/字母列），頁面層統一加「僅供參考、就醫前請自行確認」聲明。
 */

export type ClinicRegion = "north" | "central" | "south" | "east";

export interface ClinicEntry {
  /** 單位名稱（如 臺大醫院精神醫學部） */
  name: string;
  /** 縣市（如 台北市） */
  county: string;
  region: ClinicRegion;
  /** 官網可查的地址（無則省略） */
  address?: string;
  /** 官網可查的掛號/總機電話（無則省略，勿填私人號碼） */
  phone?: string;
  /** 官網或掛號頁 URL（已驗證） */
  url: string;
  /** 強迫症相關特色（如 強迫症特別門診 / 兒童青少年 / rTMS，需有出處） */
  features: string[];
  /** 一句話備註（≤60 字，如 需轉診/初診限額，以官網公告為準） */
  note?: string;
}
