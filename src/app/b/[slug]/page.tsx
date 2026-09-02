import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Markdown } from "@/lib/markdown";
import { canCreatePost } from "@/lib/permissions";
import { publicAuthorLabel } from "@/lib/display";
import Link from "next/link";
import { notFound } from "next/navigation";

const BOARD_PAGE_SIZE = 20;

const authorSelect = {
  id: true,
  nickname: true,
  memberType: true,
  clinicianStatus: true,
} as const;

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const requestedPage = parsePage(sp?.page);

  const board = await prisma.board.findUnique({ where: { slug } });
  if (!board || board.status !== "ACTIVE") notFound();

  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string; nickname?: string };
  } | null;

  const viewer = session?.user ?? null;

  const canPost = canCreatePost(viewer, { status: board.status, slug: board.slug });

  const total = await prisma.post.count({
    where: { boardId: board.id, deletedAt: null },
  });
  const totalPages = Math.max(1, Math.ceil(total / BOARD_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const posts = await prisma.post.findMany({
    where: { boardId: board.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * BOARD_PAGE_SIZE,
    take: BOARD_PAGE_SIZE,
    select: {
      id: true,
      title: true,
      createdAt: true,
      isAnonymous: true,
      authorId: true,
      author: { select: authorSelect },
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-3">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <p className="text-sm text-gray-600">{board.description}</p>
        <div className="prose prose-sm max-w-none border-t pt-4 mt-4">
          <Markdown>{board.officialMd}</Markdown>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-bold">討論串</h2>
        {canPost ? (
          <Link href={`/b/${slug}/new`} className="px-4 py-2 rounded bg-[#2F6F6A] text-white text-sm hover:bg-[#255A55]">
            發文
          </Link>
        ) : session?.user ? (
          <span className="text-sm text-gray-500">無權限發文</span>
        ) : (
          <Link href={`/login?callbackUrl=/b/${slug}/new`} className="px-4 py-2 rounded border text-sm hover:bg-white">
            登入後發文
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E0D5] p-8 text-center text-gray-500">
          尚無討論，登入後可發第一篇。
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const { label, badge } = publicAuthorLabel(
              { isAnonymous: p.isAnonymous, author: p.author, authorId: p.authorId },
              viewer
            );
            return (
              <Link
                key={p.id}
                href={`/b/${slug}/p/${p.id}`}
                className="block bg-white rounded-lg border border-[#E5E0D5] p-4 hover:shadow-sm"
              >
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex gap-2 items-center">
                  <span>{label}</span>
                  {badge && <span className="px-1.5 py-0.5 rounded bg-[#F7F4EE] border text-[10px]">{badge}</span>}
                  <span>{new Date(p.createdAt).toLocaleString("zh-TW")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {currentPage > 1 ? (
            <Link
              href={`/b/${slug}?page=${currentPage - 1}`}
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
            >
              上一頁
            </Link>
          ) : (
            <span className="px-3 py-1 rounded border bg-gray-100 text-gray-400 cursor-not-allowed">上一頁</span>
          )}
          <span className="text-gray-600">
            第 {currentPage} 頁 / 共 {totalPages} 頁（{total} 篇）
          </span>
          {currentPage < totalPages ? (
            <Link
              href={`/b/${slug}?page=${currentPage + 1}`}
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
            >
              下一頁
            </Link>
          ) : (
            <span className="px-3 py-1 rounded border bg-gray-100 text-gray-400 cursor-not-allowed">下一頁</span>
          )}
        </div>
      )}
    </div>
  );
}
