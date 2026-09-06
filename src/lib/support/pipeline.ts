import { prisma } from "@/lib/db";
import { detectSafetyCrisis, SafetyDetectionResult } from "@/lib/ocd/safety/crisis";
import { detectReassurance, ReassuranceDetectionResult } from "@/lib/ocd/reassurance/detector";
import { detectOcdLoop, LoopDetectionResult } from "@/lib/ocd/loop/detector";
import {
  classifySupportText,
  SemanticClassificationResult,
} from "@/lib/ocd/semantic/classifier";
import { decideSupportPolicy } from "./policy";
import type { SupportContext } from "./context";
import type { SupportIntervention } from "./intervention";
import type {
  SupportSourceType,
  SupportDetectionType,
  SupportAction,
  Prisma,
} from "@prisma/client";

export interface PipelineInput {
  sourceType: SupportSourceType | "POST" | "REPLY" | "CHAT" | "CHECKIN";
  sourceId?: string;
  userId?: string;
  text: string;
  context?: SupportContext;
  logInteraction?: boolean;
}

export interface PipelineResult {
  intervention: SupportIntervention;
  safety: SafetyDetectionResult;
  reassurance: ReassuranceDetectionResult;
  loop: LoopDetectionResult;
  semantic?: SemanticClassificationResult;
  interactionId?: string;
}

/**
 * Maps pipeline findings to standard Prisma SupportDetectionType
 */
function deriveDetectionType(
  safety: SafetyDetectionResult,
  reassurance: ReassuranceDetectionResult,
  loop: LoopDetectionResult
): SupportDetectionType {
  if (safety.isCrisis) return "CRISIS";
  if (reassurance.isReassurance) return "REASSURANCE_SEEKING";
  if (loop.hasLoopPattern) return "COMPULSION_LOOP";
  return "NEUTRAL";
}

/**
 * Maps intervention to standard Prisma SupportAction
 */
function deriveSupportAction(intervention: SupportIntervention): SupportAction {
  if (intervention.type.startsWith("CRISIS")) return "CRISIS_ESCALATE";
  if (intervention.type.startsWith("REASSURANCE")) return "EMPATHY_SHIELD";
  if (intervention.type === "LOOP_EDUCATION") return "LOOP_EDUCATION";
  if (intervention.type === "URGE_SURFING" || intervention.type === "FACING_UNCERTAINTY") {
    return "URGE_SURFING_PROMPT";
  }
  return "EMPATHY_SHIELD";
}

/**
 * Unified Support Pipeline
 * Receives POST, REPLY, CHAT, or CHECKIN content,
 * executes safety, reassurance, loop and semantic classifiers,
 * evaluates support policy, and generates an intervention.
 */
export async function runSupportPipeline(
  input: PipelineInput
): Promise<PipelineResult> {
  const { sourceType, sourceId, userId, text, context, logInteraction = true } = input;
  const cleanText = (text ?? "").trim();

  // 1. Safety detection (first layer)
  const safety = detectSafetyCrisis(cleanText);

  // 2. Reassurance detection (deterministic rule core)
  const reassurance = detectReassurance(cleanText);

  // 3. OCD loop & compulsion detection
  const loop = detectOcdLoop(cleanText);

  // 4. Contextual & Semantic classification (optional LLM fallback for ambiguous cases)
  let semantic: SemanticClassificationResult | undefined;
  try {
    semantic = await classifySupportText(cleanText, context);
  } catch {
    // Non-blocking fallback
  }

  // 5. Support Policy Evaluation (Decides intervention, detectors do NOT dictate UI directly)
  const intervention = decideSupportPolicy({
    sourceType,
    safety,
    reassurance,
    loop,
    semantic,
    context,
  });

  // 6. Optional telemetry logging (sanitized, zero sensitive text saved)
  let interactionId: string | undefined;

  if (logInteraction && userId) {
    try {
      const detectedType = deriveDetectionType(safety, reassurance, loop);
      const action = deriveSupportAction(intervention);

      const metadata: Prisma.InputJsonValue = {
        safetySeverity: safety.severity,
        reassuranceScore: reassurance.score,
        reassuranceSubtypes: reassurance.subtypes,
        matchedCompulsions: loop.compulsions.map((c) => c.category),
        interventionType: intervention.type,
        interventionSeverity: intervention.severity,
        semanticCategory: semantic?.category,
        textLength: cleanText.length,
      };

      const record = await prisma.supportInteraction.create({
        data: {
          userId,
          sourceType: sourceType as SupportSourceType,
          sourceId,
          detectedType,
          confidence: reassurance.isReassurance ? reassurance.score : safety.score,
          userAction: action,
          recommendedAction: intervention.type,
          metadata,
        },
        select: { id: true },
      });

      interactionId = record.id;
    } catch (err) {
      // Non-blocking telemetry error
      console.error("[SupportPipeline] Telemetry write failed:", err);
    }
  }

  return {
    intervention,
    safety,
    reassurance,
    loop,
    semantic,
    interactionId,
  };
}
