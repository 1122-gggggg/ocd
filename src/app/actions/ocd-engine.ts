"use server";

import { auth } from "@/auth";
import { runSupportPipeline } from "@/lib/support/pipeline";
import { recordSupportFeedback, FeedbackOutcome } from "@/lib/support/feedback";
import { checkRateLimit } from "@/lib/rate-limit";
import type {
  SupportSourceType,
  SupportAction,
  SupportDetectionType,
} from "@prisma/client";
import type { SupportIntervention } from "@/lib/support/intervention";
import type { LoopStages } from "@/lib/ocd/loop/classifier";

export interface AssistantAnalysisResult {
  detectedType: SupportDetectionType;
  intervention: SupportIntervention;
  interactionId?: string;
  cycleStages?: LoopStages;
  compulsions?: Array<{ name: string; category: string; description?: string }>;
  isCrisis: boolean;
}

export async function analyzeTextSupport(
  text: string,
  sourceType: SupportSourceType = "CHECKIN",
  sourceId?: string
): Promise<{
  ok: boolean;
  result?: AssistantAnalysisResult;
  message?: string;
}> {
  const session = (await auth()) as unknown as {
    user?: { id: string };
  } | null;

  const clean = String(text ?? "").trim();
  if (!clean) {
    return { ok: false, message: "輸入內容不可為空" };
  }

  // Rate limit: max 30 analyses per minute per user/ip
  const rateLimitKey = session?.user?.id
    ? `ocd:assistant:${session.user.id}`
    : "ocd:assistant:guest";
  if (!checkRateLimit(rateLimitKey, 30, 60_000)) {
    return { ok: false, message: "請求過於頻繁，請稍後再試" };
  }

  const pipeline = await runSupportPipeline({
    sourceType,
    sourceId,
    userId: session?.user?.id,
    text: clean,
    logInteraction: Boolean(session?.user?.id),
  });

  const detectedType: SupportDetectionType = pipeline.safety.isCrisis
    ? "CRISIS"
    : pipeline.reassurance.isReassurance
    ? "REASSURANCE_SEEKING"
    : pipeline.loop.hasLoopPattern
    ? "COMPULSION_LOOP"
    : "NEUTRAL";

  return {
    ok: true,
    result: {
      detectedType,
      intervention: pipeline.intervention,
      interactionId: pipeline.interactionId,
      cycleStages: pipeline.loop.hasLoopPattern ? pipeline.loop.stages : undefined,
      compulsions: pipeline.loop.hasLoopPattern ? pipeline.loop.compulsions : undefined,
      isCrisis: pipeline.safety.isCrisis,
    },
  };
}

export async function submitSupportFeedback(
  interactionId: string,
  helpful: boolean,
  reason?: string
): Promise<{ ok: boolean; message?: string }> {
  const outcome: FeedbackOutcome = helpful ? "HELPFUL" : "UNHELPFUL";
  return recordSupportFeedback({
    interactionId,
    outcome,
    reason: reason || (helpful ? "HELPFUL" : "NOT_HELPFUL"),
  });
}

export async function recordSupportAction(
  _sourceType: SupportSourceType,
  _sourceId: string | undefined,
  _action: SupportAction
): Promise<void> {
  // Retained for backward compatibility
}
