import { CRISIS_KEYWORDS, CRISIS_HELP_TEXT } from "@/lib/crisis-keywords";

export interface SafetyDetectionResult {
  isCrisis: boolean;
  helpText: string | null;
  matchedKeyword?: string;
}

export function detectSafetyCrisis(text: string): SafetyDetectionResult {
  if (!text) return { isCrisis: false, helpText: null };
  const lower = text.toLowerCase();

  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      return {
        isCrisis: true,
        helpText: CRISIS_HELP_TEXT,
        matchedKeyword: kw,
      };
    }
  }

  return { isCrisis: false, helpText: null };
}
