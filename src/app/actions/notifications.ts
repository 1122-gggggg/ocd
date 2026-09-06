"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Notification, Prisma } from "@prisma/client";

type PostBrief = Prisma.PostGetPayload<{
  select: { id: true; title: true; board: { select: { slug: true } } };
}>;

export type NotificationWithPost = Prisma.NotificationGetPayload<true> & {
  post: PostBrief | null;
};

export async function getNotifications(): Promise<NotificationWithPost[]> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) return [];
  const notifications: Notification[] = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const ids = [...new Set(notifications.map((n) => n.postId).filter((id): id is string => !!id))];
  const posts: PostBrief[] =
    ids.length > 0
      ? await prisma.post.findMany({
          where: { id: { in: ids } },
          select: { id: true, title: true, board: { select: { slug: true } } },
        })
      : [];
  const map = new Map(posts.map((p) => [p.id, p] as const));
  return notifications.map((n) => ({
    ...n,
    post: n.postId ? (map.get(n.postId) ?? null) : null,
  }));
}

export async function markAllRead(): Promise<void> {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) return;
  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}
