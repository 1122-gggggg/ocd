export const CRISIS_KEYWORDS: string[] = [
  "自殺",
  "想死",
  "不想活",
  "了結生命",
  "自傷",
  "割腕",
  "跳樓",
  "尋死",
  "suicide",
  "kill myself",
  "self-harm",
  "want to die",
];

export function containsCrisisKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export const CRISIS_HELP_TEXT = `如有危機念頭，請立即求助：
- 衛生福利部安心專線 1925（24 小時）
- https://www.iasp.info/suicidalthoughts/`;

export const DISCLAIMER_TEXT =
  "本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。請勿依據本站內容自行停藥或改變治療。緊急狀況請撥打 1925 或當地緊急醫療。";
