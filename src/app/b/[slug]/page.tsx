import { cache } from "react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Markdown } from "@/lib/markdown";
import { canCreatePost } from "@/lib/permissions";
import { publicAuthorLabel } from "@/lib/display";
import { AuthorMeta, EmptyState, GROUP_LABELS, Pagination } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

// Shared with BoardPage via React cache(): metadata + page issue a single
// board query per request (no extra query from generateMetadata).
const getBoard = cache(async (slug: string) =>
  prisma.board.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      description: true,
      group: true,
      officialMd: true,
    },
  })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoard(slug);
  if (!board) return { title: "版區不存在" };
  return { title: board.name, description: board.description };
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

  // Round 1: board + session in parallel.
  const [board, session] = await Promise.all([
    getBoard(slug),
    auth() as unknown as Promise<{
      user?: { id: string; role: string; clinicianStatus: string; nickname?: string };
    } | null>,
  ]);
  if (!board || board.status !== "ACTIVE") notFound();

  const viewer = session?.user ?? null;

  const canPost = canCreatePost(viewer, { status: board.status, slug: board.slug });

  // Round 2: count + list in parallel (skip uses requestedPage; Pagination
  // display still clamps to totalPages below).
  const [total, posts] = await Promise.all([
    prisma.post.count({
      where: { boardId: board.id, deletedAt: null },
    }),
    prisma.post.findMany({
      where: { boardId: board.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: (requestedPage - 1) * BOARD_PAGE_SIZE,
      take: BOARD_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        createdAt: true,
        isAnonymous: true,
        authorId: true,
        author: { select: authorSelect },
        _count: { select: { replies: { where: { deletedAt: null } } } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / BOARD_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const postAction = canPost ? (
    <Link href={`/b/${slug}/new`} className="btn btn-primary">
      發表新文
    </Link>
  ) : session?.user ? (
    <span className="badge">此版無發文權限</span>
  ) : (
    <Link href={`/login?callbackUrl=/b/${slug}/new`} className="btn btn-secondary">
      登入後發文
    </Link>
  );

  return (
    <div className="space-y-6">
      <nav className="text-xs text-subtle" aria-label="麵包屑">
        <Link href="/" className="hover:text-accent">
          首頁
        </Link>
        <span className="mx-1.5">/</span>
        <span>{GROUP_LABELS[board.group] ?? board.group}</span>
        <span className="mx-1.5">/</span>
        <span className="text-muted">{board.name}</span>
      </nav>

      {/* Board header */}
      <section className="card card-pad space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge badge-accent">{GROUP_LABELS[board.group] ?? board.group}</span>
              <span className="badge">{total} 篇討論</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{board.name}</h1>
            <p className="text-sm text-muted leading-relaxed">{board.description}</p>
          </div>
          <div className="shrink-0">{postAction}</div>
        </div>

        {board.officialMd?.trim() && (
          <details className="border-t border-line pt-3 group" open>
            <summary className="flex items-center gap-2 text-sm font-medium text-accent select-none">
              <span className="transition-transform group-open:rotate-90">▸</span>
              版區說明
            </summary>
            <div className="prose prose-sm mt-3">
              <Markdown>{board.officialMd}</Markdown>
            </div>
          </details>
        )}
      </section>

      {/* Thread list */}
      <section className="space-y-3">
        <h2 className="section-title">
          討論串
          <span className="text-xs font-normal text-subtle">
            第 {currentPage} / {totalPages} 頁
          </span>
        </h2>

        {posts.length === 0 ? (
          <EmptyState
            title="這個版還很安靜"
            description="還沒有人在這裡發文。你的經驗，可能正好是別人在找的。"
            action={postAction}
          />
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => {
              const { label, badge, anonymous } = publicAuthorLabel(
                { isAnonymous: p.isAnonymous, author: p.author, authorId: p.authorId },
                viewer
              );
              return (
                <li key={p.id}>
                  <Link
                    href={`/b/${slug}/p/${p.id}`}
                    className="card card-link p-4 group flex items-start gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="font-medium text-fg group-hover:text-accent transition-colors name-clip">
                        {p.title}
                      </div>
                      <AuthorMeta
                        label={label}
                        badge={badge}
                        anonymous={anonymous}
                        at={p.createdAt}
                        relative
                      />
                    </div>
                    <span
                      className="badge shrink-0 mt-0.5"
                      title={`${p._count.replies} 則回覆`}
                    >
                      💬 {p._count.replies}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hrefFor={(n) => `/b/${slug}?page=${n}`}
          summary={`${total} 篇`}
        />
      </section>
    </div>
  );
}
