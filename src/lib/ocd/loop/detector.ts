import {
  COMPULSION_PATTERNS,
  CompulsionPattern,
  CompulsionCategory,
  LoopStages,
} from "./classifier";

export interface LoopDetectionResult {
  hasLoopPattern: boolean;
  score: number;
  evidence: string[];
  uncertainty: number;
  stages: LoopStages;
  compulsions: Array<{
    name: string;
    category: CompulsionCategory;
    description: string;
  }>;
  detectedCompulsion?: CompulsionPattern;
  explanation: string;
}

const TRIGGER_PATTERNS = [
  /(出門|回家|碰(了|到)|摸(了|到)|看到|聽說|讀到|開車|洗澡|經過|想到|腦中浮現)[^，。！？\n]*/,
];

const OBSESSION_PATTERNS = [
  /(懷疑|擔心|害怕|萬一|會不會|怕自己|如果不小心)[^，。！？\n]*/,
];

const ANXIETY_PATTERNS = [
  /(焦慮|恐慌|心跳加速|極度不安|快要崩潰|坐立難安|痛苦萬分|窒息感)[^，。！？\n]*/,
];

export function detectOcdLoop(text: string): LoopDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      hasLoopPattern: false,
      score: 0,
      evidence: [],
      uncertainty: 0.05,
      stages: {},
      compulsions: [],
      explanation: "",
    };
  }

  const clean = text.trim();
  const matchedCompulsions: Array<{
    name: string;
    category: CompulsionCategory;
    description: string;
  }> = [];
  const evidence: string[] = [];

  for (const comp of COMPULSION_PATTERNS) {
    if (comp.pattern.test(clean)) {
      matchedCompulsions.push({
        name: comp.name,
        category: comp.category,
        description: comp.description,
      });
      evidence.push(`偵測到強迫特徵：${comp.name}（${comp.description}）`);
    }
  }

  const hasLoopPattern = matchedCompulsions.length > 0;

  if (!hasLoopPattern) {
    return {
      hasLoopPattern: false,
      score: 0.1,
      evidence: [],
      uncertainty: 0.1,
      stages: {},
      compulsions: [],
      explanation: "",
    };
  }

  // Extract or synthesize stages for OCD Cycle visualization
  let triggerExtract: string | undefined;
  for (const p of TRIGGER_PATTERNS) {
    const m = clean.match(p);
    if (m) {
      triggerExtract = m[0].trim();
      break;
    }
  }

  let obsessionExtract: string | undefined;
  for (const p of OBSESSION_PATTERNS) {
    const m = clean.match(p);
    if (m) {
      obsessionExtract = m[0].trim();
      break;
    }
  }

  let anxietyExtract: string | undefined;
  for (const p of ANXIETY_PATTERNS) {
    const m = clean.match(p);
    if (m) {
      anxietyExtract = m[0].trim();
      break;
    }
  }
  const compulsionNames = matchedCompulsions.map((c) => c.name).join("、");

  const stages: LoopStages = {
    trigger: triggerExtract || "遇到誘發情境或侵入性刺激",
    obsession: obsessionExtract || "產生強烈的懷疑、災難化想像或道德自責",
    anxiety: anxietyExtract || "不確定性感上升，引發強烈恐慌或心理壓力",
    compulsion: `執行：${compulsionNames}`,
    temporaryRelief: "獲得短暫安心，但大腦錯誤學習『唯有強迫能解危』，進一步強化下一次迴圈",
  };

  const score = Math.min(1.0, 0.75 + matchedCompulsions.length * 0.08);
  const uncertainty = Math.max(0.1, 0.3 - matchedCompulsions.length * 0.05);

  const explanation = `你描述的情境中可能存在強迫循環（包含：${compulsionNames}）。強迫行為看似能短暫撲滅焦慮火苗，實質上卻給予了大腦『懷疑真的是威脅』的危險信號，促使下一次警報響得更大聲。`;

  return {
    hasLoopPattern: true,
    score,
    evidence,
    uncertainty,
    stages,
    compulsions: matchedCompulsions,
    detectedCompulsion: matchedCompulsions[0]
      ? COMPULSION_PATTERNS.find((c) => c.category === matchedCompulsions[0]?.category)
      : undefined,
    explanation,
  };
}
