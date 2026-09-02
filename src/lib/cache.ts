import { unstable_cache } from "next/cache";
import { prisma } from "./db";

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
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });
  },
  ["boards-home"],
  { revalidate: 30, tags: ["boards-home"] }
);
