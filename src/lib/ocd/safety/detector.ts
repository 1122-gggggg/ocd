import { detectSafetyCrisis, SafetyDetectionResult } from "./crisis";

export function detectSafety(text: string): SafetyDetectionResult {
  return detectSafetyCrisis(text);
}
