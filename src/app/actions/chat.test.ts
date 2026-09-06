import { describe, it, expect, vi, beforeEach } from "vitest";
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
  senderId?: string;
  sender: {
    id: string;
    nickname: string;
    memberType: string;
    role: string;
    clinicianStatus: string;
  };
}

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    chatMessage: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

describe("sendChatMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as MockSession);
    const res = await sendChatMessage("general", "Hello world");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("UNAUTHORIZED");
  });

  it("fails if content is empty", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as unknown as MockSession);
    const res = await sendChatMessage("general", "   ");
    expect(res.ok).toBe(false);
    expect(res.code).toBe("EMPTY_CONTENT");
  });

  it("fails if content exceeds 1000 characters", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as unknown as MockSession);
    const longMsg = "a".repeat(1001);
    const res = await sendChatMessage("general", longMsg);
    expect(res.ok).toBe(false);
    expect(res.code).toBe("CONTENT_TOO_LONG");
  });

  it("successfully creates message and flags crisis keyword", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as unknown as MockSession);

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

    vi.mocked(prisma.chatMessage.create).mockResolvedValue(
      fakeCreated as unknown as MockChatMessageRecord
    );

    const res = await sendChatMessage("general", "我不想活了，好痛苦");
    expect(res.ok).toBe(true);
    expect(res.data?.isCrisis).toBe(true);
    expect(res.crisisHelp).toBeDefined();
    expect(res.crisisHelp).toContain("1925");
  });

  it("successfully creates normal message without crisis flag", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u2", role: "USER" },
    } as unknown as MockSession);

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

    vi.mocked(prisma.chatMessage.create).mockResolvedValue(
      fakeCreated as unknown as MockChatMessageRecord
    );

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
        sender: {
          id: "u1",
          nickname: "User1",
          memberType: "PATIENT",
          role: "USER",
          clinicianStatus: "NONE",
        },
      },
    ];

    vi.mocked(prisma.chatMessage.findMany).mockResolvedValue(
      fakeList as unknown as MockChatMessageRecord[]
    );

    const messages = await getChatMessages("general", 10);
    expect(messages.length).toBe(2);
    expect(messages[0].id).toBe("m1");
    expect(messages[1].id).toBe("m2");
  });
});
