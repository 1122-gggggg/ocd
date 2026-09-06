"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ReactionTargetType, SupportReactionType } from "@prisma/client";

export interface SupportReactionCounts {
  UNDERSTAND: number;
  HOLD_ON: number;
  RELATABLE: number;
  GRATEFUL: number;
  RESISTED: number;
  userReacted?: SupportReactionType[];
}


export async function toggleSupportReaction(
  targetType: ReactionTargetType,
  targetId: string,
  reactionType: SupportReactionType
): Promise<{ ok: boolean; added?: boolean; message?: string }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入後給予支持" };
  }

  if (!checkRateLimit(`react:${session.user.id}`, 30, 60_000)) {
    return { ok: false, message: "操作過於頻繁" };
  }

  const existing = await prisma.supportReaction.findUnique({
    where: {
      userId_targetType_targetId_reactionType: {
        userId: session.user.id,
        targetType,
        targetId,
        reactionType,
      },
    },
  });

  if (existing) {
    await prisma.supportReaction.delete({
      where: { id: existing.id },
    });
    return { ok: true, added: false };
  } else {
    await prisma.supportReaction.create({
      data: {
        userId: session.user.id,
        targetType,
        targetId,
        reactionType,
      },
    });
    return { ok: true, added: true };
  }
}

export async function getTargetReactions(
  targetType: ReactionTargetType,
  targetId: string,
  currentUserId?: string
): Promise<SupportReactionCounts> {
  const reactions = await prisma.supportReaction.findMany({
    where: { targetType, targetId },
    select: { reactionType: true, userId: true },
  });

  const counts: SupportReactionCounts = {
    UNDERSTAND: 0,
    HOLD_ON: 0,
    RELATABLE: 0,
    GRATEFUL: 0,
    RESISTED: 0,
    userReacted: [],
  };

  for (const r of reactions) {
    counts[r.reactionType] = (counts[r.reactionType] || 0) + 1;
    if (currentUserId && r.userId === currentUserId) {
      counts.userReacted?.push(r.reactionType);
    }
  }

  return counts;
}
