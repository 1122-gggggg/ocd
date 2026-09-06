import { REASSURANCE_RULES, ReassuranceRule, ReassuranceSubtype } from "./rules";

export interface ReassuranceDetectionResult {
  isReassurance: boolean;
  score: number;
  evidence: string[];
  uncertainty: number;
  matchedRuleIds: string[];
  subtypes: ReassuranceSubtype[];
  explanation: string;
}

const RECOVERY_OR_RESISTANCE_PATTERNS = [
  /(忍住(沒有)?|成功(抵抗|忍耐|不|延遲)|克服了).*(查|問|確認|求保證|檢查|回想)/,
  /(我(今天)?(終於)?沒有(再去)?(查|問|看|確認|檢查|求保證))/,
  /(並沒有(去)?(查|問|看|確認|檢查|求保證))/,
  /(resisted (the urge to |compulsion)|did not (check|ask|google|reassure))/i,
];

export function detectReassurance(text: string): ReassuranceDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      isReassurance: false,
      score: 0,
      evidence: [],
      uncertainty: 0.05,
      matchedRuleIds: [],
      subtypes: [],
      explanation: "",
    };
  }

  const clean = text.trim();

  // 1. Check for resistance / recovery statement (e.g., "我今天終於沒有查 Google")
  const isResistanceOrVictory = RECOVERY_OR_RESISTANCE_PATTERNS.some((p) => p.test(clean));
  if (isResistanceOrVictory && !/(請保證|求安慰|告訴我沒事)/.test(clean)) {
    return {
      isReassurance: false,
      score: 0.1,
      evidence: ["描述抵抗強迫行為或不再求取保證的成功經歷，非當下求保證"],
      uncertainty: 0.15,
      matchedRuleIds: [],
      subtypes: [],
      explanation: "這是一段非強迫或抗拒求保證的歷程分享。",
    };
  }

  const matchedRules: ReassuranceRule[] = [];
  const matchedRuleIds: string[] = [];
  const subtypesSet = new Set<ReassuranceSubtype>();
  const evidence: string[] = [];

  for (const rule of REASSURANCE_RULES) {
    if (rule.pattern.test(clean)) {
      matchedRules.push(rule);
      matchedRuleIds.push(rule.id);
      subtypesSet.add(rule.subtype);
      evidence.push(`符合「${rule.description}」特徵`);
    }
  }

  if (matchedRules.length === 0) {
    return {
      isReassurance: false,
      score: 0,
      evidence: [],
      uncertainty: 0.1,
      matchedRuleIds: [],
      subtypes: [],
      explanation: "",
    };
  }

  // 2. Compute dynamic score based on rule weights and linguistic tone
  let highestWeight = 0;
  for (const r of matchedRules) {
    if (r.weight > highestWeight) {
      highestWeight = r.weight;
    }
  }

  const hasQuestion = /[?？嗎呢巴能不能可不可以會不會是不是有沒有]/.test(clean);
  const hasUrgentDemand = /(請|求|拜託|告訴我|保證|確認|一定|必須|100%|百分之百)/.test(clean);

  let dynamicScore = highestWeight;
  if (hasQuestion) dynamicScore += 0.08;
  if (hasUrgentDemand) dynamicScore += 0.07;
  if (matchedRules.length >= 2) dynamicScore += 0.05;

  const score = Math.min(1.0, Math.round(dynamicScore * 100) / 100);
  const isReassurance = score >= 0.7;

  // Uncertainty calculation: shorter text or lack of explicit question marks increases uncertainty
  let uncertainty = 0.15;
  if (clean.length < 15) uncertainty += 0.15;
  if (!hasQuestion) uncertainty += 0.1;
  uncertainty = Math.min(0.5, Math.round(uncertainty * 100) / 100);

  const subtypes = Array.from(subtypesSet);

  let explanation = "";
  if (isReassurance) {
    explanation =
      "這段文字包含向外界「尋求 100% 確定保證」的模式。在強迫症中，尋求保證往往只能換得幾分鐘的短暫安心，隨後大腦會製造更刁鑽的懷疑。";
  }

  return {
    isReassurance,
    score,
    evidence,
    uncertainty,
    matchedRuleIds,
    subtypes,
    explanation,
  };
}
