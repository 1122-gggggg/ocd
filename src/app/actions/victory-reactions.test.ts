import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    victory: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    supportReaction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createVictory,
  getVictoryReactionCounts,
  getVictories,
} from "./recovery";
import { toggleSupportReaction } from "./reactions";

describe("Unified Victory & SupportReaction Model (Phase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a victory record without cheersCount column", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockPrisma.victory.create.mockResolvedValue({
      id: "v-1",
      userId: "u-1",
      content: "今天出門沒有回頭檢查門鎖！",
      createdAt: new Date(),
      user: { id: "u-1", nickname: "小明", memberType: "PATIENT" },
    });

    const res = await createVictory("今天出門沒有回頭檢查門鎖！");

    expect(res.ok).toBe(true);
    expect(res.victory?.content).toBe("今天出門沒有回頭檢查門鎖！");
    // Verify cheersCount is not present in victory item
    expect((res.victory as unknown as Record<string, unknown>).cheersCount).toBeUndefined();
    expect(res.victory?.reactionCounts).toBeDefined();
  });

  it("retrieves victory reactions via SupportReaction with getVictoryReactionCounts", async () => {
    mockPrisma.supportReaction.findMany.mockResolvedValue([
      { reactionType: "UNDERSTAND", userId: "u-2" },
      { reactionType: "UNDERSTAND", userId: "u-3" },
      { reactionType: "RESISTED", userId: "u-2" },
    ]);

    const counts = await getVictoryReactionCounts("v-1", "u-2");

    expect(counts.UNDERSTAND).toBe(2);
    expect(counts.RESISTED).toBe(1);
    expect(counts.HOLD_ON).toBe(0);
    expect(counts.userReacted).toContain("UNDERSTAND");
    expect(counts.userReacted).toContain("RESISTED");
  });

  it("toggles reaction on a victory idempotently", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u-2" } });

    // 1. Not reacted yet -> creates reaction
    mockPrisma.supportReaction.findUnique.mockResolvedValueOnce(null);
    mockPrisma.supportReaction.create.mockResolvedValueOnce({ id: "sr-1" });

    const added = await toggleSupportReaction("VICTORY", "v-1", "RESISTED");
    expect(added.ok).toBe(true);
    expect(added.added).toBe(true);

    // 2. Already reacted -> deletes reaction
    mockPrisma.supportReaction.findUnique.mockResolvedValueOnce({ id: "sr-1" });
    mockPrisma.supportReaction.delete.mockResolvedValueOnce({ id: "sr-1" });

    const removed = await toggleSupportReaction("VICTORY", "v-1", "RESISTED");
    expect(removed.ok).toBe(true);
    expect(removed.added).toBe(false);
  });

  it("aggregates reaction counts when fetching multiple victories", async () => {
    mockPrisma.victory.findMany.mockResolvedValue([
      {
        id: "v-1",
        content: "成功抗拒一次洗手衝動",
        createdAt: new Date(),
        user: { id: "u-1", nickname: "小明", memberType: "PATIENT" },
      },
      {
        id: "v-2",
        content: "延遲了 15 分鐘才去查資料",
        createdAt: new Date(),
        user: { id: "u-2", nickname: "小華", memberType: "PATIENT" },
      },
    ]);

    mockPrisma.supportReaction.findMany.mockResolvedValue([
      { targetId: "v-1", reactionType: "RESISTED", userId: "u-3" },
      { targetId: "v-1", reactionType: "GRATEFUL", userId: "u-4" },
      { targetId: "v-2", reactionType: "HOLD_ON", userId: "u-3" },
    ]);

    const victories = await getVictories(10, "u-3");

    expect(victories.length).toBe(2);
    expect(victories[0]?.reactionCounts?.RESISTED).toBe(1);
    expect(victories[0]?.reactionCounts?.GRATEFUL).toBe(1);
    expect(victories[0]?.reactionCounts?.userReacted).toContain("RESISTED");
    expect(victories[1]?.reactionCounts?.HOLD_ON).toBe(1);
  });
});
