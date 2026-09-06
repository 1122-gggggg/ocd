import { detectSafetyCrisis, SafetyDetectionResult } from "./crisis";

export function detectSafety(text: string): SafetyDetectionResult {
  return detectSafetyCrisis(text);
}

export type { SafetyDetectionResult, CrisisSeverity } from "./crisis";
