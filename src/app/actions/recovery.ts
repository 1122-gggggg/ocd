"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

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
  situation: string;
  compulsion: string | null;
  response: string | null;
  difficulty: number | null;
  createdAt: string;
  goalTitle?: string;
}

export interface VictoryItem {
  id: string;
  content: string;
  cheersCount: number;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    memberType: string;
  };
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
  situation: string;
  compulsion?: string;
  response?: string;
  difficulty?: number;
}): Promise<{ ok: boolean; message?: string }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入" };
  }

  if (!checkRateLimit(`recovery:log:${session.user.id}`, 20, 60_000)) {
    return { ok: false, message: "紀錄過於頻繁，請稍候再試" };
  }

  const situation = String(data.situation ?? "").trim();
  if (!situation || situation.length > 1000) {
    return { ok: false, message: "情境描述需介於 1 至 1000 字" };
  }

  const compulsion = data.compulsion ? String(data.compulsion).trim().slice(0, 1000) : null;
  const response = data.response ? String(data.response).trim().slice(0, 1000) : null;
  const difficulty =
    typeof data.difficulty === "number" && data.difficulty >= 1 && data.difficulty <= 10
      ? data.difficulty
      : null;

  await prisma.recoveryLog.create({
    data: {
      userId: session.user.id,
      goalId: data.goalId || null,
      situation,
      compulsion,
      response,
      difficulty,
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
      compulsion: l.compulsion,
      response: l.response,
      difficulty: l.difficulty,
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
      cheersCount: victory.cheersCount,
      createdAt: victory.createdAt.toISOString(),
      user: victory.user,
    },
  };
}

export async function cheerVictory(
  victoryId: string
): Promise<{ ok: boolean; cheersCount?: number; message?: string }> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) {
    return { ok: false, message: "請先登入後給予鼓勵" };
  }

  if (!checkRateLimit(`cheer:${session.user.id}:${victoryId}`, 20, 60_000)) {
    return { ok: false, message: "點氣過於頻繁" };
  }

  const updated = await prisma.victory.update({
    where: { id: victoryId },
    data: { cheersCount: { increment: 1 } },
    select: { cheersCount: true },
  });

  revalidatePath("/");
  revalidatePath("/recovery");
  return { ok: true, cheersCount: updated.cheersCount };
}

export async function getVictories(limit = 10): Promise<VictoryItem[]> {
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

  return list.map((v) => ({
    id: v.id,
    content: v.content,
    cheersCount: v.cheersCount,
    createdAt: v.createdAt.toISOString(),
    user: v.user,
  }));
}
