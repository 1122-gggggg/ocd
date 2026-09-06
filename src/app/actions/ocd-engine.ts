"use server";

import { auth } from "@/auth";
import {
  analyzeSupportText,
  logSupportInteraction,
  SupportEngineAnalysis,
} from "@/lib/ocd/engine";
import { checkRateLimit } from "@/lib/rate-limit";
import type { SupportSourceType, SupportAction } from "@prisma/client";

export async function analyzeTextSupport(
  text: string,
  sourceType: SupportSourceType = "POST",
  sourceId?: string
): Promise<{
  ok: boolean;
  analysis?: SupportEngineAnalysis;
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
    ? `ocd:engine:${session.user.id}`
    : "ocd:engine:guest";
  if (!checkRateLimit(rateLimitKey, 30, 60_000)) {
    return { ok: false, message: "請求過於頻繁，請稍後再試" };
  }

  const analysis = analyzeSupportText(clean);

  if (session?.user?.id) {
    await logSupportInteraction({
      userId: session.user.id,
      sourceType,
      sourceId,
      analysis,
    });
  }

  return { ok: true, analysis };
}

export async function recordSupportAction(
  sourceType: SupportSourceType,
  sourceId: string | undefined,
  action: SupportAction
): Promise<void> {
  const session = (await auth()) as unknown as {
    user?: { id: string };
  } | null;

  if (!session?.user?.id) return;

  try {
    await logSupportInteraction({
      userId: session.user.id,
      sourceType,
      sourceId,
      analysis: {
        detectedType: "NEUTRAL",
        confidence: 1.0,
        recommendedAction: action,
        title: "",
        message: "",
        options: [],
      },
      userAction: action,
    });
  } catch {
    // Non-blocking
  }
}
