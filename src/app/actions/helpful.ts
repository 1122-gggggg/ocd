"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidateTag } from "next/cache";

function isPrismaP2002(e: unknown): boolean {
  return (
    e !== null &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string" &&
    (e as { code: string }).code === "P2002"
  );
}

export async function toggleHelpful(
  targetType: "POST" | "REPLY",
  targetId: string
): Promise<{
  ok: boolean;
  code?: string;
  message?: string;
  voted?: boolean;
  count?: number;
}> {
  const session = (await auth()) as unknown as {
    user?: { id: string; role: string };
  } | null;
  const user = session?.user;
  if (!user?.id) {
    return { ok: false, code: "UNAUTHORIZED", message: "請先登入" };
  }
  if (!checkRateLimit(`helpful:${user.id}`, 30, 60_000)) {
    return { ok: false, code: "RATE_LIMITED", message: "操作過於頻繁，請稍後再試" };
  }
  if ((targetType !== "POST" && targetType !== "REPLY") || !targetId) {
    return { ok: false, code: "INVALID_TARGET" };
  }

  if (targetType === "POST") {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
    if (!post) return { ok: false, code: "NOT_FOUND" };
  } else {
    const reply = await prisma.reply.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
    if (!reply) return { ok: false, code: "NOT_FOUND" };
  }

  const existing = await prisma.helpfulVote.findFirst({
    where: { userId: user.id, targetType, targetId },
    select: { id: true },
  });

  if (existing) {
    await prisma.helpfulVote.delete({ where: { id: existing.id } });
    if (targetType === "POST") {
      await prisma.post.update({
        where: { id: targetId },
        data: { helpfulCount: { decrement: 1 } },
      });
      const updated = await prisma.post.findUnique({
        where: { id: targetId },
        select: { helpfulCount: true },
      });
      const count = Math.max(0, updated?.helpfulCount ?? 0);
      if ((updated?.helpfulCount ?? 0) < 0) {
        await prisma.post.update({
          where: { id: targetId },
          data: { helpfulCount: 0 },
        });
      }
      revalidateTag("boards-home");
      return { ok: true, voted: false, count };
    }
    const count = await prisma.helpfulVote.count({
      where: { targetType, targetId },
    });
    revalidateTag("boards-home");
    return { ok: true, voted: false, count };
  }

  try {
    await prisma.helpfulVote.create({
      data: { userId: user.id, targetType, targetId },
    });
  } catch (e: unknown) {
    if (isPrismaP2002(e)) {
      const count =
        targetType === "POST"
          ? (
              await prisma.post.findUnique({
                where: { id: targetId },
                select: { helpfulCount: true },
              })
            )?.helpfulCount ?? 0
          : await prisma.helpfulVote.count({ where: { targetType, targetId } });
      return { ok: true, voted: true, count };
    }
    throw e;
  }

  if (targetType === "POST") {
    await prisma.post.update({
      where: { id: targetId },
      data: { helpfulCount: { increment: 1 } },
    });
    const updated = await prisma.post.findUnique({
      where: { id: targetId },
      select: { helpfulCount: true },
    });
    revalidateTag("boards-home");
    return { ok: true, voted: true, count: updated?.helpfulCount ?? 1 };
  }

  const count = await prisma.helpfulVote.count({
    where: { targetType, targetId },
  });
  revalidateTag("boards-home");
  return { ok: true, voted: true, count };
}
