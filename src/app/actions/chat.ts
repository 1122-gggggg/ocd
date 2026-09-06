"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { containsCrisisKeyword, CRISIS_HELP_TEXT } from "@/lib/crisis-keywords";
import { checkRateLimit } from "@/lib/rate-limit";

export type ChatMessageItem = {
  id: string;
  channel: string;
  content: string;
  createdAt: string;
  isCrisis?: boolean;
  sender: {
    id: string;
    nickname: string;
    memberType: string;
    role: string;
    clinicianStatus: string;
  };
};

export async function sendChatMessage(
  channel: string,
  content: string
): Promise<{
  ok: boolean;
  code?: string;
  message?: string;
  data?: ChatMessageItem;
  crisisHelp?: string;
}> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; profileComplete?: boolean };
  } | null;
  const user = session?.user;

  if (!user?.id) {
    return { ok: false, code: "UNAUTHORIZED", message: "請先登入後再發送訊息" };
  }

  const cleanChannel = String(channel || "general").trim().toLowerCase().slice(0, 50);
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    return { ok: false, code: "EMPTY_CONTENT", message: "訊息內容不能為空" };
  }

  if (cleanContent.length > 1000) {
    return { ok: false, code: "CONTENT_TOO_LONG", message: "訊息長度上限為 1000 字" };
  }

  // Rate limit: max 20 messages per 60 seconds per user (1 msg / 3s on average)
  if (!checkRateLimit(`chat:msg:${user.id}`, 20, 60_000)) {
    return { ok: false, code: "RATE_LIMITED", message: "發送過於頻繁，請稍候再試" };
  }

  const isCrisis = containsCrisisKeyword(cleanContent);

  const created = await prisma.chatMessage.create({
    data: {
      channel: cleanChannel,
      content: cleanContent,
      senderId: user.id,
    },
    include: {
      sender: {
        select: {
          id: true,
          nickname: true,
          memberType: true,
          role: true,
          clinicianStatus: true,
        },
      },
    },
  });

  return {
    ok: true,
    data: {
      id: created.id,
      channel: created.channel,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      isCrisis,
      sender: created.sender,
    },
    crisisHelp: isCrisis ? CRISIS_HELP_TEXT : undefined,
  };
}

export async function getChatMessages(
  channel = "general",
  limit = 50,
  after?: string
): Promise<ChatMessageItem[]> {
  const cleanChannel = String(channel || "general").trim().toLowerCase().slice(0, 50);
  const takeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const whereClause: { channel: string; createdAt?: { gt: Date } } = {
    channel: cleanChannel,
  };

  if (after) {
    const afterDate = new Date(after);
    if (!isNaN(afterDate.getTime())) {
      whereClause.createdAt = { gt: afterDate };
    }
  }

  const messages = await prisma.chatMessage.findMany({
    where: whereClause,
    orderBy: { createdAt: after ? "asc" : "desc" },
    take: takeLimit,
    include: {
      sender: {
        select: {
          id: true,
          nickname: true,
          memberType: true,
          role: true,
          clinicianStatus: true,
        },
      },
    },
  });

  // If initial load (ordered desc to get latest), reverse to chronological order
  const chronological = after ? messages : messages.reverse();

  return chronological.map((msg) => ({
    id: msg.id,
    channel: msg.channel,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    isCrisis: containsCrisisKeyword(msg.content),
    sender: msg.sender,
  }));
}
