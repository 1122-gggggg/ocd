import { describe, it, expect } from "vitest";
import { decideSupportPolicy } from "./policy";
import type { SafetyDetectionResult } from "@/lib/ocd/safety/crisis";
import type { ReassuranceDetectionResult } from "@/lib/ocd/reassurance/detector";
import type { LoopDetectionResult } from "@/lib/ocd/loop/detector";

describe("Support Policy (Phase 1)", () => {
  const baseSafety: SafetyDetectionResult = {
    severity: "NONE",
    isCrisis: false,
    score: 0,
    evidence: [],
    uncertainty: 0.1,
    matchedKeywords: [],
    helpText: null,
  };

  const baseReassurance: ReassuranceDetectionResult = {
    isReassurance: false,
    score: 0,
    evidence: [],
    uncertainty: 0.1,
    matchedRuleIds: [],
    subtypes: [],
    explanation: "",
  };

  const baseLoop: LoopDetectionResult = {
    hasLoopPattern: false,
    score: 0,
    evidence: [],
    uncertainty: 0.1,
    stages: {},
    compulsions: [],
    explanation: "",
  };

  it("prioritizes IMMINENT_DANGER safety with non-dismissible critical intervention", () => {
    const intervention = decideSupportPolicy({
      sourceType: "POST",
      safety: {
        ...baseSafety,
        severity: "IMMINENT_DANGER",
        isCrisis: true,
        score: 0.98,
      },
      reassurance: {
        ...baseReassurance,
        isReassurance: true,
      },
      loop: baseLoop,
    });

    expect(intervention.type).toBe("CRISIS_IMMINENT");
    expect(intervention.severity).toBe("CRITICAL");
    expect(intervention.dismissible).toBe(false);
    expect(intervention.cta.some((c) => c.href === "tel:119")).toBe(true);
  });

  it("escalates ACTIVE_RISK safety with 1925 helpline cta", () => {
    const intervention = decideSupportPolicy({
      sourceType: "CHAT",
      safety: {
        ...baseSafety,
        severity: "ACTIVE_RISK",
        isCrisis: true,
        score: 0.9,
      },
      reassurance: baseReassurance,
      loop: baseLoop,
    });

    expect(intervention.type).toBe("CRISIS_ACTIVE");
    expect(intervention.severity).toBe("HIGH");
    expect(intervention.cta.some((c) => c.href === "tel:1925")).toBe(true);
  });

  it("provides soft guidance for POST with reassurance seeking", () => {
    const intervention = decideSupportPolicy({
      sourceType: "POST",
      safety: baseSafety,
      reassurance: {
        ...baseReassurance,
        isReassurance: true,
        score: 0.85,
      },
      loop: baseLoop,
    });

    expect(intervention.type).toBe("REASSURANCE_EMPATHY");
    expect(intervention.severity).toBe("MEDIUM");
    expect(intervention.dismissible).toBe(true);
    expect(intervention.options.some((o) => o.actionType === "URGE_SURFING")).toBe(true);
  });

  it("provides inline guidance for REPLY with reassurance", () => {
    const intervention = decideSupportPolicy({
      sourceType: "REPLY",
      safety: baseSafety,
      reassurance: {
        ...baseReassurance,
        isReassurance: true,
        score: 0.85,
      },
      loop: baseLoop,
    });

    expect(intervention.type).toBe("REASSURANCE_INLINE");
    expect(intervention.severity).toBe("LOW");
    expect(intervention.message).toContain("這篇貼文比較適合用陪伴與經驗回覆");
  });

  it("handles contextual support mode FACING_OCD with uncertainty encouragement", () => {
    const intervention = decideSupportPolicy({
      sourceType: "POST",
      safety: baseSafety,
      reassurance: baseReassurance,
      loop: baseLoop,
      context: { postSupportMode: "FACING_OCD" },
    });

    expect(intervention.type).toBe("FACING_UNCERTAINTY");
    expect(intervention.message).toContain("鼓勵面對不確定");
  });

  it("handles contextual support mode LOOKING_FOR_EXPERIENCE with peer story guidance", () => {
    const intervention = decideSupportPolicy({
      sourceType: "POST",
      safety: baseSafety,
      reassurance: baseReassurance,
      loop: baseLoop,
      context: { postSupportMode: "LOOKING_FOR_EXPERIENCE" },
    });

    expect(intervention.type).toBe("PEER_EXPERIENCE");
    expect(intervention.message).toContain("分享你的經驗，而不是替對方判斷");
  });
});
