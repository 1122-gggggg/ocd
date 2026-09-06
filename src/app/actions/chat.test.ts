import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    chatMessage: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    supportInteraction: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { sendChatMessage, getChatMessages } from "./chat";

interface MockSession {
  user?: {
    id: string;
    role: string;
    nickname?: string;
  };
}

interface MockChatMessageRecord {
  id: string;
  channel: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: {
    id: string;
    nickname: string;
    memberType: string;
    role: string;
    clinicianStatus: string;
  };
}

describe("sendChatMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await sendChatMessage("general", "Hello world");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("UNAUTHORIZED");
  });

  it("fails if content is empty", async () => {
    const session: MockSession = { user: { id: "u1", role: "USER" } };
    mockAuth.mockResolvedValue(session);
    const res = await sendChatMessage("general", "   ");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("EMPTY_CONTENT");
  });

  it("fails if content exceeds 1000 characters", async () => {
    const session: MockSession = { user: { id: "u1", role: "USER" } };
    mockAuth.mockResolvedValue(session);
    const longMsg = "a".repeat(1001);
    const res = await sendChatMessage("general", longMsg);
    expect(res.ok).toBe(false);
    expect(res.code).toBe("CONTENT_TOO_LONG");
  });

  it("successfully creates message and flags crisis keyword", async () => {
    const session: MockSession = { user: { id: "u1", role: "USER" } };
    mockAuth.mockResolvedValue(session);

    const fakeCreated: MockChatMessageRecord = {
      id: "m1",
      channel: "general",
      content: "我不想活了，好痛苦",
      createdAt: new Date("2026-09-06T10:00:00Z"),
      senderId: "u1",
      sender: {
        id: "u1",
        nickname: "小明",
        memberType: "PATIENT",
        role: "USER",
        clinicianStatus: "NONE",
      },
    };

    mockPrisma.chatMessage.create.mockResolvedValue(fakeCreated);

    const res = await sendChatMessage("general", "我不想活了，好痛苦");
    expect(res.ok).toBe(true);
    expect(res.data?.isCrisis).toBe(true);
    expect(res.crisisHelp).toBeDefined();
    expect(res.crisisHelp).toContain("1925");
  });

  it("successfully creates normal message without crisis flag", async () => {
    const session: MockSession = { user: { id: "u2", role: "USER" } };
    mockAuth.mockResolvedValue(session);

    const fakeCreated: MockChatMessageRecord = {
      id: "m2",
      channel: "general",
      content: "我懂這種感覺，陪你一起撐過去！",
      createdAt: new Date("2026-09-06T10:05:00Z"),
      senderId: "u2",
      sender: {
        id: "u2",
        nickname: "大華",
        memberType: "PATIENT",
        role: "USER",
        clinicianStatus: "NONE",
      },
    };

    mockPrisma.chatMessage.create.mockResolvedValue(fakeCreated);

    const res = await sendChatMessage("general", "我懂這種感覺，陪你一起撐過去！");
    expect(res.ok).toBe(true);
    expect(res.data?.isCrisis).toBe(false);
    expect(res.crisisHelp).toBeUndefined();
  });
});

describe("getChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves and returns messages in chronological order", async () => {
    const fakeList: MockChatMessageRecord[] = [
      {
        id: "m2",
        channel: "general",
        content: "第二篇",
        createdAt: new Date("2026-09-06T10:02:00Z"),
        senderId: "u2",
        sender: {
          id: "u2",
          nickname: "User2",
          memberType: "PATIENT",
          role: "USER",
          clinicianStatus: "NONE",
        },
      },
      {
        id: "m1",
        channel: "general",
        content: "第一篇",
        createdAt: new Date("2026-09-06T10:01:00Z"),
        senderId: "u1",
        sender: {
          id: "u1",
          nickname: "User1",
          memberType: "PATIENT",
          role: "USER",
          clinicianStatus: "NONE",
        },
      },
    ];

    mockPrisma.chatMessage.findMany.mockResolvedValue(fakeList);

    const messages = await getChatMessages("general", 10);
    expect(messages.length).toBe(2);
    expect(messages[0]?.id).toBe("m1");
    expect(messages[1]?.id).toBe("m2");
  });
});
