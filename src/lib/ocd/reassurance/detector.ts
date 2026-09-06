import { REASSURANCE_RULES } from "./rules";

export interface ReassuranceDetectionResult {
  isReassurance: boolean;
  score: number;
  matchedRuleIds: string[];
  explanation: string;
}

export function detectReassurance(text: string): ReassuranceDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      isReassurance: false,
      score: 0,
      matchedRuleIds: [],
      explanation: "",
    };
  }

  const clean = text.trim();
  const matchedRuleIds: string[] = [];
  let maxWeight = 0;

  for (const rule of REASSURANCE_RULES) {
    if (rule.pattern.test(clean)) {
      matchedRuleIds.push(rule.id);
      if (rule.weight > maxWeight) {
        maxWeight = rule.weight;
      }
    }
  }

  // Question mark or seeking help with question tone increases confidence
  const hasQuestion = /[?？嗎呢巴]/.test(clean);
  const normalizedScore = Math.min(
    1,
    matchedRuleIds.length > 0 ? maxWeight + (hasQuestion ? 0.1 : 0) : 0
  );

  const isReassurance = normalizedScore >= 0.7;

  let explanation = "";
  if (isReassurance) {
    explanation =
      "這段文字可能包含向外界「尋求 100% 確定保證」的模式。OCD 容易讓人陷入「渴望保證 → 得到短暫安心 → 懷疑又起」的循環。";
  }

  return {
    isReassurance,
    score: normalizedScore,
    matchedRuleIds,
    explanation,
  };
}
