import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type FeedbackOutcome =
  | "HELPFUL"
  | "UNHELPFUL"
  | "DISMISSED"
  | "CLICKED_CTA";

export interface RecordFeedbackInput {
  interactionId: string;
  outcome: FeedbackOutcome | string;
  reason?: "HELPFUL" | "NOT_HELPFUL" | "FALSE_POSITIVE" | "TOO_INTRUSIVE" | "IRRELEVANT" | string;
  metadata?: Record<string, unknown>;
}

/**
 * Record user feedback on a support intervention
 * Stores strictly anonymized, non-sensitive outcome metadata.
 */
export async function recordSupportFeedback(
  input: RecordFeedbackInput
): Promise<{ ok: boolean; message?: string }> {
  const { interactionId, outcome, reason, metadata } = input;

  if (!interactionId) {
    return { ok: false, message: "缺少 interactionId" };
  }

  try {
    const existing = await prisma.supportInteraction.findUnique({
      where: { id: interactionId },
      select: { id: true, metadata: true },
    });

    if (!existing) {
      return { ok: false, message: "找不到該互動紀錄" };
    }

    const currentMeta =
      typeof existing.metadata === "object" && existing.metadata !== null
        ? (existing.metadata as Record<string, unknown>)
        : {};

    const updatedMeta: Prisma.InputJsonValue = {
      ...currentMeta,
      feedbackReason: reason || null,
      feedbackAt: new Date().toISOString(),
      ...(metadata ? metadata : {}),
    };

    await prisma.supportInteraction.update({
      where: { id: interactionId },
      data: {
        outcome,
        metadata: updatedMeta,
      },
    });

    return { ok: true };
  } catch (err) {
    console.error("[SupportFeedback] Failed to record feedback:", err);
    return { ok: false, message: "無法記錄回饋" };
  }
}
