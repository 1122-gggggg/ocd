import { COMPULSION_PATTERNS, CompulsionPattern } from "./classifier";

export interface LoopDetectionResult {
  hasLoopPattern: boolean;
  detectedCompulsion?: CompulsionPattern;
  explanation: string;
}

export function detectOcdLoop(text: string): LoopDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      hasLoopPattern: false,
      explanation: "",
    };
  }

  for (const comp of COMPULSION_PATTERNS) {
    if (comp.pattern.test(text)) {
      return {
        hasLoopPattern: true,
        detectedCompulsion: comp,
        explanation: `你描述的情境中可能存在「${comp.name}」模式。它能短暫降低焦慮，但也是維持「觸發 → 焦慮 → 強迫行為 → 短暫安心 → 更多強迫」循環的核心。`,
      };
    }
  }

  return {
    hasLoopPattern: false,
    explanation: "",
  };
}
