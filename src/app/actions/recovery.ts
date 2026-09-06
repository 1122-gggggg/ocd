"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { getTargetReactions, SupportReactionCounts } from "@/app/actions/reactions";

export interface RecoveryGoalItem {
  id: string;
  title: string;
  target: string | null;
  active: boolean;
  createdAt: string;
}

export interface RecoveryLogItem {
  id: string;
  goalId: string | null;
  situation: string | null;
  trigger: string | null;
  urge: string | null;
  compulsion: string | null;
  response: string | null;
  difficulty: number | null;
  difficultyBefore: number | null;
  difficultyAfter: number | null;
  durationSeconds: number | null;
  compulsionResisted: boolean;
  createdAt: string;
  goalTitle?: string;
}

export interface VictoryItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    memberType: string;
  };
  reactionCounts?: SupportReactionCounts;
}

export async function createRecoveryGoal(
  title: string,
  target?: string
): Promise<{ ok: boolean; message?: string; goal?: RecoveryGoalItem }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入" };
  }

  const cleanTitle = String(title ?? "").trim();
  if (!cleanTitle || cleanTitle.length > 100) {
    return { ok: false, message: "目標名稱需介於 1 至 100 字" };
  }

  const cleanTarget = target ? String(target).trim().slice(0, 200) : null;

  const goal = await prisma.recoveryGoal.create({
    data: {
      userId: session.user.id,
      title: cleanTitle,
      target: cleanTarget,
      active: true,
    },
  });

  revalidatePath("/recovery");
  return {
    ok: true,
    goal: {
      id: goal.id,
      title: goal.title,
      target: goal.target,
      active: goal.active,
      createdAt: goal.createdAt.toISOString(),
    },
  };
}

export async function toggleRecoveryGoal(
  goalId: string,
  active: boolean
): Promise<{ ok: boolean; message?: string }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入" };
  }

  const existing = await prisma.recoveryGoal.findFirst({
    where: { id: goalId, userId: session.user.id },
  });
  if (!existing) {
    return { ok: false, message: "找不到該目標" };
  }

  await prisma.recoveryGoal.update({
    where: { id: goalId },
    data: { active },
  });

  revalidatePath("/recovery");
  return { ok: true };
}

export async function createRecoveryLog(data: {
  goalId?: string;
  situation?: string;
  trigger?: string;
  urge?: string;
  compulsion?: string;
  response?: string;
  difficulty?: number;
  difficultyBefore?: number;
  difficultyAfter?: number;
  durationSeconds?: number;
  compulsionResisted?: boolean;
}): Promise<{ ok: boolean; message?: string }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入" };
  }

  if (!checkRateLimit(`recovery:log:${session.user.id}`, 20, 60_000)) {
    return { ok: false, message: "紀錄過於頻繁，請稍候再試" };
  }

  const situation = data.situation ? String(data.situation).trim().slice(0, 1000) : null;
  const trigger = data.trigger ? String(data.trigger).trim().slice(0, 1000) : null;
  const urge = data.urge ? String(data.urge).trim().slice(0, 1000) : null;

  if (!situation && !trigger && !urge) {
    return { ok: false, message: "請填寫情境或誘發事件" };
  }

  const compulsion = data.compulsion ? String(data.compulsion).trim().slice(0, 1000) : null;
  const response = data.response ? String(data.response).trim().slice(0, 1000) : null;

  const sanitizeRating = (val?: number) =>
    typeof val === "number" && val >= 1 && val <= 10 ? val : null;

  const difficulty = sanitizeRating(data.difficulty);
  const difficultyBefore = sanitizeRating(data.difficultyBefore);
  const difficultyAfter = sanitizeRating(data.difficultyAfter);

  const durationSeconds =
    typeof data.durationSeconds === "number" && data.durationSeconds >= 0
      ? Math.min(data.durationSeconds, 86400)
      : null;

  const compulsionResisted = Boolean(data.compulsionResisted);

  await prisma.recoveryLog.create({
    data: {
      userId: session.user.id,
      goalId: data.goalId || null,
      situation: situation || trigger || "日常面對",
      trigger,
      urge,
      compulsion,
      response,
      difficulty: difficulty ?? difficultyBefore,
      difficultyBefore,
      difficultyAfter,
      durationSeconds,
      compulsionResisted,
    },
  });

  revalidatePath("/recovery");
  return { ok: true };
}

export async function getRecoveryData(): Promise<{
  goals: RecoveryGoalItem[];
  logs: RecoveryLogItem[];
}> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { goals: [], logs: [] };
  }

  const [goals, logs] = await Promise.all([
    prisma.recoveryGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.recoveryLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        goal: { select: { title: true } },
      },
    }),
  ]);

  return {
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      target: g.target,
      active: g.active,
      createdAt: g.createdAt.toISOString(),
    })),
    logs: logs.map((l) => ({
      id: l.id,
      goalId: l.goalId,
      situation: l.situation,
      trigger: l.trigger,
      urge: l.urge,
      compulsion: l.compulsion,
      response: l.response,
      difficulty: l.difficulty,
      difficultyBefore: l.difficultyBefore,
      difficultyAfter: l.difficultyAfter,
      durationSeconds: l.durationSeconds,
      compulsionResisted: l.compulsionResisted,
      createdAt: l.createdAt.toISOString(),
      goalTitle: l.goal?.title,
    })),
  };
}

export async function createVictory(
  content: string
): Promise<{ ok: boolean; message?: string; victory?: VictoryItem }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入後分享小小勝利" };
  }

  if (!checkRateLimit(`victory:${session.user.id}`, 10, 60_000)) {
    return { ok: false, message: "發布過於頻繁，請稍候" };
  }

  const cleanContent = String(content ?? "").trim();
  if (!cleanContent || cleanContent.length > 500) {
    return { ok: false, message: "勝利內容需介於 1 至 500 字" };
  }

  const victory = await prisma.victory.create({
    data: {
      userId: session.user.id,
      content: cleanContent,
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          memberType: true,
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/recovery");

  return {
    ok: true,
    victory: {
      id: victory.id,
      content: victory.content,
      createdAt: victory.createdAt.toISOString(),
      user: victory.user,
      reactionCounts: {
        UNDERSTAND: 0,
        HOLD_ON: 0,
        RELATABLE: 0,
        GRATEFUL: 0,
        RESISTED: 0,
        userReacted: [],
      },
    },
  };
}

export async function getVictoryReactionCounts(
  victoryId: string,
  currentUserId?: string
): Promise<SupportReactionCounts> {
  return getTargetReactions("VICTORY", victoryId, currentUserId);
}

export async function getVictories(
  limit = 10,
  currentUserId?: string
): Promise<VictoryItem[]> {
  const list = await prisma.victory.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 50),
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          memberType: true,
        },
      },
    },
  });

  const victoryIds = list.map((v) => v.id);
  const reactions = await prisma.supportReaction.findMany({
    where: {
      targetType: "VICTORY",
      targetId: { in: victoryIds },
    },
    select: {
      targetId: true,
      reactionType: true,
      userId: true,
    },
  });

  const reactionMap = new Map<string, SupportReactionCounts>();
  for (const id of victoryIds) {
    reactionMap.set(id, {
      UNDERSTAND: 0,
      HOLD_ON: 0,
      RELATABLE: 0,
      GRATEFUL: 0,
      RESISTED: 0,
      userReacted: [],
    });
  }

  for (const r of reactions) {
    const c = reactionMap.get(r.targetId);
    if (c) {
      c[r.reactionType] = (c[r.reactionType] || 0) + 1;
      if (currentUserId && r.userId === currentUserId) {
        c.userReacted = c.userReacted || [];
        c.userReacted.push(r.reactionType);
      }
    }
  }

  return list.map((v) => ({
    id: v.id,
    content: v.content,
    createdAt: v.createdAt.toISOString(),
    user: v.user,
    reactionCounts: reactionMap.get(v.id),
  }));
}
