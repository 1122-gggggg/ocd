// "use server" 模組僅能 export async 函數（type/interface 除外），
// 故 COMMON_TOPICS 等非函數值集中定義於此（無 "use server"），
// 供 server action 與 client 元件共用。
export const COMMON_TOPICS = [
  { id: "contamination", label: "清潔與污染 (Contamination)" },
  { id: "harm", label: "傷害與失控疑慮 (Harm OCD)" },
  { id: "rocd", label: "伴侶與關係強迫 (ROCD)" },
  { id: "scrupulosity", label: "道德宗教與罪咎 (Scrupulosity)" },
  { id: "false_memory", label: "假記憶與過去核對 (False Memory)" },
  { id: "health", label: "健康與身體感官 (Health OCD)" },
  { id: "sexual", label: "性侵入性念頭 (Sexual Intrusive)" },
  { id: "existential", label: "存在與真實感 (Existential OCD)" },
] as const;
