import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    recoveryGoal: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    recoveryLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    victory: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import {
  createRecoveryGoal,
  createRecoveryLog,
  createVictory,
  cheerVictory,
} from "./recovery";

interface MockSession {
  user?: {
    id: string;
    role: string;
  };
}

interface MockGoalRecord {
  id: string;
  userId: string;
  title: string;
  target: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockLogRecord {
  id: string;
  userId: string;
  goalId: string | null;
  situation: string;
  compulsion: string | null;
  response: string | null;
  difficulty: number | null;
  createdAt: Date;
}

interface MockVictoryRecord {
  id: string;
  userId: string;
  content: string;
  cheersCount: number;
  createdAt: Date;
  user: {
    id: string;
    nickname: string;
    memberType: string;
  };
}

describe("Recovery Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRecoveryGoal", () => {
    it("fails if not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await createRecoveryGoal("出門只確認一次瓦斯");
      expect(res.ok).toBe(false);
      expect(res.message).toBe("請先登入");
    });

    it("creates goal successfully", async () => {
      const session: MockSession = { user: { id: "u1", role: "USER" } };
      mockAuth.mockResolvedValue(session);

      const fakeGoal: MockGoalRecord = {
        id: "g1",
        userId: "u1",
        title: "出門只確認一次瓦斯",
        target: "不再回頭折返",
        active: true,
        createdAt: new Date("2026-09-06T10:00:00Z"),
        updatedAt: new Date("2026-09-06T10:00:00Z"),
      };

      mockPrisma.recoveryGoal.create.mockResolvedValue(fakeGoal);

      const res = await createRecoveryGoal("出門只確認一次瓦斯", "不再回頭折返");
      expect(res.ok).toBe(true);
      expect(res.goal?.id).toBe("g1");
      expect(res.goal?.title).toBe("出門只確認一次瓦斯");
    });
  });

  describe("createRecoveryLog", () => {
    it("fails if situation is empty", async () => {
      const session: MockSession = { user: { id: "u1", role: "USER" } };
      mockAuth.mockResolvedValue(session);

      const res = await createRecoveryLog({ situation: "" });
      expect(res.ok).toBe(false);
    });

    it("creates log successfully", async () => {
      const session: MockSession = { user: { id: "u1", role: "USER" } };
      mockAuth.mockResolvedValue(session);

      const fakeLog: MockLogRecord = {
        id: "l1",
        userId: "u1",
        goalId: "g1",
        situation: "出門後腦中懷疑門沒鎖",
        compulsion: "想回去看",
        response: "延遲並走到公車站",
        difficulty: 6,
        createdAt: new Date("2026-09-06T10:00:00Z"),
      };

      mockPrisma.recoveryLog.create.mockResolvedValue(fakeLog);

      const res = await createRecoveryLog({
        goalId: "g1",
        situation: "出門後腦中懷疑門沒鎖",
        compulsion: "想回去看",
        response: "延遲並走到公車站",
        difficulty: 6,
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("createVictory and cheerVictory", () => {
    it("creates a victory post", async () => {
      const session: MockSession = { user: { id: "u1", role: "USER" } };
      mockAuth.mockResolvedValue(session);

      const fakeVictory: MockVictoryRecord = {
        id: "v1",
        userId: "u1",
        content: "今天想到那個念頭但沒有 Google！",
        cheersCount: 0,
        createdAt: new Date("2026-09-06T10:00:00Z"),
        user: {
          id: "u1",
          nickname: "小美",
          memberType: "PATIENT",
        },
      };

      mockPrisma.victory.create.mockResolvedValue(fakeVictory);

      const res = await createVictory("今天想到那個念頭但沒有 Google！");
      expect(res.ok).toBe(true);
      expect(res.victory?.content).toContain("沒有 Google");
    });

    it("increments cheer count on victory", async () => {
      const session: MockSession = { user: { id: "u2", role: "USER" } };
      mockAuth.mockResolvedValue(session);

      const fakeVictory: MockVictoryRecord = {
        id: "v1",
        userId: "u1",
        content: "今天想到那個念頭但沒有 Google！",
        cheersCount: 5,
        createdAt: new Date("2026-09-06T10:00:00Z"),
        user: {
          id: "u1",
          nickname: "小美",
          memberType: "PATIENT",
        },
      };

      mockPrisma.victory.update.mockResolvedValue(fakeVictory);

      const res = await cheerVictory("v1");
      expect(res.ok).toBe(true);
      expect(res.cheersCount).toBe(5);
    });
  });
});
