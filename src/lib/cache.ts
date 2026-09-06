import { unstable_cache } from "next/cache";
import { prisma } from "./db";

// Cache-tag contract (read-only here — mutations own invalidation, no
// revalidateTag in this file or in the board/post pages):
// - "boards-nav" (60s): board set changes MUST revalidateTag("boards-nav")
//   (board create/delete, slug/name/group/status updates) plus "boards-home".
// - "boards-home" (30s): ANY post/reply/board mutation MUST
//   revalidateTag("boards-home") (post/reply create/update/delete, board
//   changes above).

export const getCachedBoards = unstable_cache(
  async () => {
    return prisma.board.findMany({
      where: { status: "ACTIVE" },
      orderBy: { slug: "asc" },
      select: { slug: true, name: true, group: true },
    });
  },
  ["boards-nav"],
  { revalidate: 60, tags: ["boards-nav"] }
);

export const getCachedHomeBoards = unstable_cache(
  async () => {
    return prisma.board.findMany({
      where: { status: "ACTIVE" },
      orderBy: { slug: "asc" },
      select: {
        slug: true,
        name: true,
        group: true,
        description: true,
        posts: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, title: true },
        },
        _count: { select: { posts: { where: { deletedAt: null } } } },
      },
    });
  },
  ["boards-home"],
  { revalidate: 30, tags: ["boards-home"] }
);

export type BoardSort = "recent" | "helpful" | "solved";

const BOARD_POSTS_TAKE = 20;

const boardPostAuthorSelect = {
  id: true,
  nickname: true,
  memberType: true,
  clinicianStatus: true,
} as const;

export async function getBoardPosts(
  boardId: string,
  sort: BoardSort,
  page: number
) {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const orderBy =
    sort === "helpful"
      ? [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "solved"
        ? [
            { isSolved: "desc" as const },
            { helpfulCount: "desc" as const },
            { createdAt: "desc" as const },
          ]
        : [{ createdAt: "desc" as const }];
  return prisma.post.findMany({
    where: { boardId, deletedAt: null },
    orderBy,
    skip: (safePage - 1) * BOARD_POSTS_TAKE,
    take: BOARD_POSTS_TAKE,
    select: {
      id: true,
      title: true,
      bodyMd: true,
      createdAt: true,
      isAnonymous: true,
      authorId: true,
      isSolved: true,
      helpfulCount: true,
      author: { select: boardPostAuthorSelect },
      tags: { select: { tag: { select: { slug: true, name: true } } } },
      _count: { select: { replies: { where: { deletedAt: null } } } },
    },
  });
}
