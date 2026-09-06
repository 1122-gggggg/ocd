import { prisma } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

/**
 * 等一個懂的人：找出該版超過 24 小時、仍零則未刪除回覆的文章。
 * 舊文優先（createdAt asc），讓等最久的人先被接住。
 */
export async function getRescuePosts(boardId: string, limit = 5) {
  const cutoff = new Date(Date.now() - DAY_MS);
  return prisma.post.findMany({
    where: {
      boardId,
      deletedAt: null,
      createdAt: { lt: cutoff },
      replies: { none: { deletedAt: null } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { nickname: true } },
    },
  });
}

/**
 * 打撈通知：對每篇全站救援文章，找同版近 30 天發文或回文過的老手
 *（排除作者本人、排除已通知過的人），每人建一筆 RESCUE 通知。
 * 單筆失敗不中斷，總數上限 limit（預設 20）。
 * 回傳實際建立的通知數。
 */
export async function notifyRescuePosts(limit = 20): Promise<number> {
  const dayAgo = new Date(Date.now() - DAY_MS);
  const monthAgo = new Date(Date.now() - MONTH_MS);

  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      createdAt: { lt: dayAgo },
      replies: { none: { deletedAt: null } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true, boardId: true, authorId: true },
  });

  let notified = 0;
  for (const post of posts) {
    if (notified >= limit) break;

    const [recentPosts, recentReplies] = await Promise.all([
      prisma.post.findMany({
        where: {
          boardId: post.boardId,
          deletedAt: null,
          createdAt: { gte: monthAgo },
        },
        select: { authorId: true },
      }),
      prisma.reply.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: monthAgo },
          post: { boardId: post.boardId, deletedAt: null },
        },
        select: { authorId: true },
      }),
    ]);

    const veteranIds = new Set<string>();
    for (const r of recentPosts) veteranIds.add(r.authorId);
    for (const r of recentReplies) veteranIds.add(r.authorId);
    veteranIds.delete(post.authorId);

    for (const recipientId of veteranIds) {
      if (notified >= limit) break;
      const already = await prisma.notification.findFirst({
        where: { postId: post.id, kind: "RESCUE", recipientId },
      });
      if (already) continue;
      try {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            recipientId,
            postId: post.id,
            kind: "RESCUE",
          },
        });
        notified += 1;
      } catch {
        // 單筆失敗不中斷，繼續打撈下一位。
      }
    }
  }
  return notified;
}
