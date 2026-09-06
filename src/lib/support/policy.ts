import type { SafetyDetectionResult } from "@/lib/ocd/safety/crisis";
import type { ReassuranceDetectionResult } from "@/lib/ocd/reassurance/detector";
import type { LoopDetectionResult } from "@/lib/ocd/loop/detector";
import type { SemanticClassificationResult } from "@/lib/ocd/semantic/classifier";
import type { SupportContext } from "./context";
import type { SupportIntervention } from "./intervention";
import type { SupportSourceType } from "@prisma/client";

export interface PolicyEvaluationInput {
  sourceType: SupportSourceType | "POST" | "REPLY" | "CHAT" | "CHECKIN";
  safety: SafetyDetectionResult;
  reassurance: ReassuranceDetectionResult;
  loop: LoopDetectionResult;
  semantic?: SemanticClassificationResult | null;
  context?: SupportContext;
}

export function decideSupportPolicy(
  input: PolicyEvaluationInput
): SupportIntervention {
  const { sourceType, safety, reassurance, loop, context } = input;

  // 1. Safety Priority (Highest Tier)
  if (safety.severity === "IMMINENT_DANGER") {
    return {
      type: "CRISIS_IMMINENT",
      severity: "CRITICAL",
      title: "⚠️ 緊急安全防護與即時醫療援助",
      message:
        "我們非常在乎你的生命安全。社群互助無法替代即時緊急援助，請立即撥打 119 或前往就近急診，或撥打 24 小時安心專線 1925，讓專業人員即時守護你的安全。",
      options: [
        {
          id: "call_119",
          label: "撥打 119 或至急診",
          actionType: "EMERGENCY_MEDICAL",
          hint: "緊急醫療與人身安全防護",
        },
        {
          id: "call_1925",
          label: "撥打 1925 安心專線（24 小時免費）",
          actionType: "CALL_HOTLINE",
          hint: "即刻專業心理諮詢陪伴",
        },
      ],
      dismissible: false,
      cta: [
        { label: "撥打 119 緊急電話", href: "tel:119", primary: true },
        { label: "撥打 1925 安心專線", href: "tel:1925" },
      ],
    };
  }

  if (safety.severity === "ACTIVE_RISK") {
    return {
      type: "CRISIS_ACTIVE",
      severity: "HIGH",
      title: "⚠️ 即時專業支持與陪伴資源",
      message:
        "感受到你現在承受著巨大的痛苦與重擔。你不需要孤單面對，請給自己一個被接住的機會，強烈建議立即聯絡專業心理求助專線。",
      options: [
        {
          id: "call_1925",
          label: "撥打 1925 安心專線（24 小時免費）",
          actionType: "CALL_HOTLINE",
          hint: "由專業人員線上傾聽陪伴",
        },
        {
          id: "call_1995",
          label: "撥打 1995 生命線協談專線",
          actionType: "CALL_HOTLINE",
          hint: "24 小時輔導協談資源",
        },
      ],
      dismissible: true,
      cta: [
        { label: "撥打 1925 安心專線", href: "tel:1925", primary: true },
        { label: "查看求助資源", href: "/disclaimer" },
      ],
    };
  }

  if (safety.severity === "PASSIVE_IDEATION") {
    return {
      type: "CRISIS_PASSIVE",
      severity: "MEDIUM",
      title: "🌱 我們陪你在一起",
      message:
        "生活有時真的非常疲憊沉重。在這裡，你的疲累被理解與接納。如果這份沉重讓你感到孤立無援，隨時可以聯絡安心專線 1925，或是與信任的親友聊聊。",
      options: [
        {
          id: "call_1925",
          label: "安心專線 1925",
          actionType: "CALL_HOTLINE",
          hint: "24 小時免費專業傾聽",
        },
      ],
      dismissible: true,
      cta: [{ label: "閱讀安心資源", href: "/disclaimer" }],
    };
  }

  // 2. Reassurance Seeking Detection
  if (reassurance.isReassurance) {
    if (sourceType === "POST") {
      return {
        type: "REASSURANCE_EMPATHY",
        severity: "MEDIUM",
        title: "💡 支持提示：陪伴比保證更有力量",
        message:
          "這篇內容似乎在向外界尋求確定的保證。在 OCD 互助中，尋求保證往往只能帶來短暫安心，隨後誘發更多懷疑。建議選擇以同理心、陪伴與面對不確定性的角度交流，我們不阻止你發文，而是提供更有韌性的支持視角。",
        options: [
          {
            id: "urge_surf",
            label: "進行 2 分鐘衝動衝浪練習",
            actionType: "URGE_SURFING",
            hint: "練習延遲當下想確認的衝動",
          },
          {
            id: "no_answer_needed",
            label: "選擇「純抒發・不需解答」支持模式",
            actionType: "LABEL_EMPATHY",
            hint: "提醒病友以陪伴與同理回覆，而非直接給予安全確認",
          },
        ],
        dismissible: true,
        cta: [
          { label: "前往陪伴大廳", href: "/chat" },
          { label: "了解強迫循環與保證陷阱", href: "/learn" },
        ],
      };
    }

    if (sourceType === "REPLY") {
      return {
        type: "REASSURANCE_INLINE",
        severity: "LOW",
        title: "💡 回覆提示",
        message: "這篇貼文比較適合用陪伴與經驗回覆，而不是替對方確認答案。",
        options: [],
        dismissible: true,
        cta: [],
      };
    }

    if (sourceType === "CHAT") {
      return {
        type: "REASSURANCE_INLINE",
        severity: "LOW",
        title: "💡 陪伴叮嚀",
        message:
          "大腦可能正在催促你尋求確定答案。試著與不確定性共處 2 分鐘，我們在這裡陪你。",
        options: [
          {
            id: "urge_surf",
            label: "開啟 2 分鐘衝動衝浪練習",
            actionType: "URGE_SURFING",
            hint: "深呼吸並等待焦慮浪潮自然消退",
          },
        ],
        dismissible: true,
        cta: [],
      };
    }

    // CHECKIN or default
    return {
      type: "REASSURANCE_EMPATHY",
      severity: "MEDIUM",
      title: "🌊 衝動衝浪與延遲強迫",
      message:
        "察覺到當下想求保證的強烈衝動。練習延遲 5 分鐘再決定是否發問，讓大腦習慣不確定感。",
      options: [
        {
          id: "delay_timer",
          label: "設定 5 分鐘延遲計時",
          actionType: "DELAY_TIMER",
          hint: "不立即採取行動，練習耐受焦慮",
        },
      ],
      dismissible: true,
      cta: [{ label: "記錄到非強迫日記", href: "/recovery" }],
    };
  }

  // 3. OCD Loop / Compulsion Detection
  if (loop.hasLoopPattern) {
    const mainCompulsion = loop.compulsions[0]?.name || "強迫行為";

    if (sourceType === "CHAT") {
      // In chat: subtle and optional education, not intrusive
      return {
        type: "LOOP_EDUCATION",
        severity: "LOW",
        title: `🔄 辨認強迫循環：${mainCompulsion}`,
        message: loop.explanation,
        options: [
          {
            id: "urge_surf",
            label: "2 分鐘衝動衝浪練習",
            actionType: "URGE_SURFING",
            hint: "讓焦慮浪潮自然經過",
          },
        ],
        dismissible: true,
        cta: [{ label: "復原練習", href: "/recovery" }],
      };
    }

    return {
      type: "LOOP_EDUCATION",
      severity: "MEDIUM",
      title: `🔄 辨認強迫循環：${mainCompulsion}`,
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
          label: "閱讀同類型的 ERP 復原指南",
          actionType: "READ_STORIES",
          hint: "參考他人如何打破檢查或清潔迴圈",
        },
      ],
      dismissible: true,
      cta: [{ label: "前往復原專區", href: "/recovery", primary: true }],
    };
  }

  // 4. Contextual Interpretation & Support Mode Guidance
  const postMode = context?.postSupportMode || context?.parentPostSupportMode;

  if (postMode === "FACING_OCD") {
    return {
      type: "FACING_UNCERTAINTY",
      severity: "LOW",
      title: "🛡️ 面對強迫中",
      message: "鼓勵面對不確定，而不是要求立即消除焦慮。",
      options: [],
      dismissible: true,
      cta: [],
    };
  }

  if (postMode === "LOOKING_FOR_EXPERIENCE") {
    return {
      type: "PEER_EXPERIENCE",
      severity: "LOW",
      title: "🔍 尋找病友經驗",
      message: "分享你的經驗，而不是替對方判斷。",
      options: [],
      dismissible: true,
      cta: [],
    };
  }

  if (postMode === "EMPATHY") {
    return {
      type: "GENERAL_SUPPORT",
      severity: "LOW",
      title: "💬 純心情傾聽",
      message: "陪伴比解答更重要，在這裡你的感受會被溫柔接納。",
      options: [],
      dismissible: true,
      cta: [],
    };
  }

  // 5. Neutral / Healthy peer sharing
  return {
    type: "NONE",
    severity: "NONE",
    title: "🌱 真誠傾聽與同行",
    message: "謝謝你的真誠分享。在這裡，所有的脆弱都會被溫柔接納。",
    options: [],
    dismissible: true,
    cta: [],
  };
}
