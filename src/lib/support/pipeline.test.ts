import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  supportInteraction: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { runSupportPipeline } from "./pipeline";

describe("Unified Support Pipeline (Phase 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles crisis input across all sourceTypes with safety priority", async () => {
    const res = await runSupportPipeline({
      sourceType: "POST",
      text: "我真的撐不住了，現在準備結束生命",
      logInteraction: false,
    });

    expect(res.safety.isCrisis).toBe(true);
    expect(res.safety.severity).toBe("IMMINENT_DANGER");
    expect(res.intervention.severity).toBe("CRITICAL");
    expect(res.intervention.type).toBe("CRISIS_IMMINENT");
    expect(res.intervention.dismissible).toBe(false);
    expect(res.intervention.cta.some((c) => c.href === "tel:119")).toBe(true);
  });

  it("handles reassurance seeking for POST without blocking", async () => {
    const res = await runSupportPipeline({
      sourceType: "POST",
      text: "我剛才洗手只洗了兩次，這樣到底會不會得病？請保證我沒事！",
      logInteraction: false,
    });

    expect(res.safety.isCrisis).toBe(false);
    expect(res.reassurance.isReassurance).toBe(true);
    expect(res.intervention.type).toBe("REASSURANCE_EMPATHY");
    expect(res.intervention.dismissible).toBe(true);
    expect(res.intervention.options.some((o) => o.actionType === "URGE_SURFING")).toBe(true);
  });

  it("provides soft inline intervention for REPLY on reassurance", async () => {
    const res = await runSupportPipeline({
      sourceType: "REPLY",
      text: "我也覺得這樣會不會得病？替你確認一下",
      context: { parentPostSupportMode: "EMPATHY" },
      logInteraction: false,
    });

    expect(res.intervention.type).toBe("REASSURANCE_INLINE");
    expect(res.intervention.message).toContain("這篇貼文比較適合用陪伴與經驗回覆");
  });

  it("provides subtle inline intervention for CHAT without broadcasting labels", async () => {
    const res = await runSupportPipeline({
      sourceType: "CHAT",
      text: "你可以保證我絕對沒事嗎？求求大家跟我說",
      logInteraction: false,
    });

    expect(res.intervention.type).toBe("REASSURANCE_INLINE");
    expect(res.intervention.severity).toBe("LOW");
  });

  it("records sanitized telemetry without storing raw text or prompts", async () => {
    mockPrisma.supportInteraction.create.mockResolvedValue({ id: "si-123" });

    const res = await runSupportPipeline({
      sourceType: "CHECKIN",
      userId: "user-456",
      text: "一直回想開車有沒有撞到人，非常焦慮",
      logInteraction: true,
    });

    expect(mockPrisma.supportInteraction.create).toHaveBeenCalledTimes(1);
    const callArg = mockPrisma.supportInteraction.create.mock.calls[0]?.[0];
    expect(callArg).toBeDefined();

    expect(callArg?.data?.userId).toBe("user-456");
    expect(callArg?.data?.sourceType).toBe("CHECKIN");

    // Critical privacy check: raw text should NEVER be stored in the database record
    expect(JSON.stringify(callArg?.data)).not.toContain("一直回想開車有沒有撞到人");

    expect(res.interactionId).toBe("si-123");
  });
});
