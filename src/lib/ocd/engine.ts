import { detectSafetyCrisis } from "./safety/crisis";
import { detectReassurance } from "./reassurance/detector";
import { getReassuranceResponseStrategy } from "./reassurance/response";
import { detectOcdLoop } from "./loop/detector";
import { prisma } from "@/lib/db";
import type {
  SupportDetectionType,
  SupportAction,
  SupportSourceType,
} from "@prisma/client";

export interface SupportEngineAnalysis {
  detectedType: SupportDetectionType;
  confidence: number;
  recommendedAction: SupportAction;
  title: string;
  message: string;
  options: Array<{
    id: string;
    label: string;
    actionType: string;
    hint: string;
  }>;
}

export function analyzeSupportText(text: string): SupportEngineAnalysis {
  // 1. Safety & Crisis check (Highest Priority)
  const safety = detectSafetyCrisis(text);
  if (safety.isCrisis) {
    return {
      detectedType: "CRISIS",
      confidence: 1.0,
      recommendedAction: "CRISIS_ESCALATE",
      title: "⚠️ 危機求助與即時陪伴",
      message:
        "偵測到你可能正面臨極大的痛苦或危機念頭。社群支持無法替代即時緊急援助，請立即聯繫專業資源，我們非常在乎你的生命安全。",
      options: [
        {
          id: "call_1925",
          label: "撥打 1925 安心專線（24 小時免費）",
          actionType: "CALL_HOTLINE",
          hint: "立即與受過專業訓練的輔導員對話",
        },
        {
          id: "call_119",
          label: "緊急危險撥打 119 或至急診",
          actionType: "EMERGENCY_MEDICAL",
          hint: "尋求實體即時醫療保護",
        },
      ],
    };
  }

  // 2. Reassurance Seeking check (Deterministic Policy Core)
  const reassurance = detectReassurance(text);
  if (reassurance.isReassurance) {
    const strategy = getReassuranceResponseStrategy();
    return {
      detectedType: "REASSURANCE_SEEKING",
      confidence: reassurance.score,
      recommendedAction: "EMPATHY_SHIELD",
      title: strategy.title,
      message: strategy.leadMessage,
      options: strategy.options,
    };
  }

  // 3. OCD Loop & Compulsion Detection
  const loop = detectOcdLoop(text);
  if (loop.hasLoopPattern && loop.detectedCompulsion) {
    return {
      detectedType: "COMPULSION_LOOP",
      confidence: 0.8,
      recommendedAction: "LOOP_EDUCATION",
      title: `🔄 辨認強迫循環：${loop.detectedCompulsion.name}`,
      message: loop.explanation,
      options: [
        {
          id: "urge_surf",
          label: "進行 2 分鐘衝動衝浪練習",
          actionType: "URGE_SURFING",
          hint: "練習延遲並抵抗當下的強迫行為",
        },
        {
          id: "read_recovery_cases",
          label: "閱讀同類型的 ERP 康復指南",
          actionType: "READ_STORIES",
          hint: "參考他人如何打破檢查或清洗迴圈",
        },
      ],
    };
  }

  // 4. Neutral / Healthy peer sharing
  return {
    detectedType: "NEUTRAL",
    confidence: 0.9,
    recommendedAction: "EMPATHY_SHIELD",
    title: "🌱 真誠傾聽與同行",
    message: "謝謝你的真誠分享。在這裡，所有的脆弱都會被溫柔接納。",
    options: [],
  };
}

export async function logSupportInteraction(params: {
  userId: string;
  sourceType: SupportSourceType;
  sourceId?: string;
  analysis: SupportEngineAnalysis;
  userAction?: SupportAction;
}): Promise<void> {
  try {
    await prisma.supportInteraction.create({
      data: {
        userId: params.userId,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        detectedType: params.analysis.detectedType,
        confidence: params.analysis.confidence,
        userAction: params.userAction ?? params.analysis.recommendedAction,
      },
    });
  } catch (err) {
    // Non-blocking telemetry failure
    console.error("[SupportEngine] Failed to log interaction:", err);
  }
}
