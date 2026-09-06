"use server";

import { prisma } from "@/lib/db";

export type SearchResult = {
  id: string;
  title: string;
  boardSlug: string;
  createdAt: Date;
};

export async function searchPosts(
  query: string,
  limit = 20
): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const take =
    Number.isFinite(limit) && limit > 0
      ? Math.min(Math.max(Math.floor(limit), 1), 50)
      : 20;
  try {
    const rows = await prisma.$queryRaw<SearchResult[]>`
      SELECT p.id, p.title, b.slug AS "boardSlug", p."createdAt"
      FROM "Post" p
      JOIN "Board" b ON b.id = p."boardId"
      WHERE p."deletedAt" IS NULL
        AND p.search_tsv @@ plainto_tsquery('simple', ${q})
      ORDER BY ts_rank(p.search_tsv, plainto_tsquery('simple', ${q})) DESC
      LIMIT ${take}
    `;
    return rows;
  } catch {
    try {
      const posts = await prisma.post.findMany({
        where: { deletedAt: null, title: { contains: q } },
        select: {
          id: true,
          title: true,
          createdAt: true,
          board: { select: { slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
      });
      return posts.map((p) => ({
        id: p.id,
        title: p.title,
        boardSlug: p.board.slug,
        createdAt: p.createdAt,
      }));
    } catch {
      return [];
    }
  }
}
