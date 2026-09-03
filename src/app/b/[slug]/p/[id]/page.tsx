import { cache } from "react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Markdown } from "@/lib/markdown";
import { publicAuthorLabel } from "@/lib/display";
import { canReply } from "@/lib/permissions";
import { createReply, updatePost, deletePost, updateReply, deleteReply } from "@/app/actions/posts";
import { createReport } from "@/app/actions/reports";
import { PostForm } from "@/components/PostForm";
import { AuthorMeta, Pagination } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const REPLY_PAGE_SIZE = 50;

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

// Shared with PostPage via React cache(): metadata + page issue a single
// post query per request (no extra query from generateMetadata).
const getPost = cache(async (id: string) =>
  prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      boardId: true,
      authorId: true,
      title: true,
      bodyMd: true,
      isAnonymous: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      author: { select: authorSelect },
    },
  })
);

const getBoard = cache(async (slug: string) =>
  prisma.board.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, status: true },
  })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post || post.deletedAt) return { title: "文章不存在" };
  return { title: post.title };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug, id } = await params;
  const sp = await searchParams;
  const requestedPage = parsePage(sp?.page);

  // Round 1: board + post + session in parallel (1 sequential DB round).
  const [board, post, session] = await Promise.all([
    getBoard(slug),
    getPost(id),
    auth() as unknown as Promise<{
      user?: { id: string; role: string; clinicianStatus: string; nickname?: string };
    } | null>,
  ]);
  if (!board) notFound();
  if (!post || post.boardId !== board.id) notFound();

  const viewer = session?.user ?? null;

  // Round 2: reply count + list in parallel; soft-deleted excluded from both
  // so counts match the listed pages. Skip uses requestedPage; Pagination
  // display still clamps to totalPages below.
  const [totalReplies, replies] = await Promise.all([
    prisma.reply.count({ where: { postId: id, deletedAt: null } }),
    prisma.reply.findMany({
      where: { postId: id, deletedAt: null },
      orderBy: { floor: "asc" },
      skip: (requestedPage - 1) * REPLY_PAGE_SIZE,
      take: REPLY_PAGE_SIZE,
      select: {
        id: true,
        postId: true,
        authorId: true,
        floor: true,
        replyToFloor: true,
        bodyMd: true,
        isAnonymous: true,
        createdAt: true,
        deletedAt: true,
        author: { select: authorSelect },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalReplies / REPLY_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const isAdmin = viewer?.role === "ADMIN";
  const isDeleted = !!post.deletedAt;
  const canDoReply = canReply(viewer, { status: board.status, slug: board.slug }, { deletedAt: post.deletedAt });

  const postAuthor = publicAuthorLabel(
    { isAnonymous: post.isAnonymous, author: post.author, authorId: post.authorId },
    viewer
  );

  const boundReply = createReply.bind(null, id);

  return (
    <div className="space-y-6">
      <nav className="text-xs text-subtle" aria-label="麵包屑">
        <Link href="/" className="hover:text-accent">
          首頁
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/b/${slug}`} className="hover:text-accent">
          {board.name}
        </Link>
      </nav>

      {/* Original post */}
      <article className="card card-pad space-y-4">
        {isDeleted && !isAdmin ? (
          <p className="text-muted italic">此內容已由管理員移除。</p>
        ) : (
          <>
            <header className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight name-clip">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <AuthorMeta
                  label={postAuthor.label}
                  badge={postAuthor.badge}
                  anonymous={postAuthor.anonymous}
                  at={post.createdAt}
                />
                {post.updatedAt.getTime() - post.createdAt.getTime() > 1000 && (
                  <span className="badge">已編輯</span>
                )}
                {isDeleted && <span className="badge badge-danger">已刪除</span>}
              </div>
            </header>

            <div className="prose border-t border-line pt-4">
              <Markdown>{post.bodyMd}</Markdown>
            </div>

            {isDeleted && isAdmin && (
              <p className="alert alert-error">
                管理員可見：此文已被刪除，原文保留但對外隱藏。
              </p>
            )}

            {!isDeleted && (
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {viewer && (post.authorId === viewer.id || isAdmin) && (
                  <>
                    <details className="w-full">
                      <summary className="btn btn-ghost btn-sm">✎ 編輯</summary>
                      <form
                        action={updatePost.bind(null, post.id) as unknown as string}
                        className="mt-3 space-y-2 rounded-lg border border-line bg-surface-2 p-3"
                      >
                        <div>
                          <label className="label" htmlFor={`t-${post.id}`}>
                            標題
                          </label>
                          <input
                            id={`t-${post.id}`}
                            name="title"
                            defaultValue={post.title}
                            required
                            maxLength={80}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label" htmlFor={`b-${post.id}`}>
                            正文
                          </label>
                          <textarea
                            id={`b-${post.id}`}
                            name="bodyMd"
                            defaultValue={post.bodyMd}
                            required
                            maxLength={20000}
                            rows={8}
                            className="textarea mono"
                          />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm">
                          儲存變更
                        </button>
                      </form>
                    </details>
                    <form action={deletePost.bind(null, post.id) as unknown as string}>
                      <button type="submit" className="btn btn-danger btn-sm">
                        刪除
                      </button>
                    </form>
                  </>
                )}
                {session?.user && post.authorId !== viewer?.id && (
                  <ReportBox targetType="POST" targetId={post.id} />
                )}
              </div>
            )}
          </>
        )}
      </article>

      {/* Replies */}
      <section className="space-y-3">
        <h2 className="section-title" id="replies">
          回覆
          <span className="text-xs font-normal text-subtle">{totalReplies} 則</span>
        </h2>

        {replies.length === 0 ? (
          <div className="card card-pad text-center text-sm text-muted">
            還沒有人回覆。你的一句話，可能就是有人今天需要的。
          </div>
        ) : (
          <ol className="space-y-2">
            {replies.map((r) => {
              const deleted = !!r.deletedAt;
              if (deleted && !isAdmin) {
                return (
                  <li key={r.id} className="card p-4">
                    <div className="flex items-center gap-2 text-xs text-subtle">
                      <span className="mono">#{r.floor}</span>
                      <span className="italic">此內容已由管理員移除</span>
                    </div>
                  </li>
                );
              }
              const { label, badge, anonymous } = publicAuthorLabel(
                { isAnonymous: r.isAnonymous, author: r.author, authorId: r.authorId },
                viewer
              );
              return (
                <li key={r.id} id={`f${r.floor}`} className="card p-4 space-y-3 scroll-mt-20">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <a
                      href={`#f${r.floor}`}
                      className="mono text-xs text-subtle hover:text-accent shrink-0"
                      aria-label={`第 ${r.floor} 樓`}
                    >
                      #{r.floor}
                    </a>
                    <AuthorMeta
                      label={label}
                      badge={badge}
                      anonymous={anonymous}
                      at={r.createdAt}
                      relative
                    />
                    {r.replyToFloor != null && (
                      <a href={`#f${r.replyToFloor}`} className="badge hover:text-accent">
                        ↩ #{r.replyToFloor}
                      </a>
                    )}
                    {deleted && <span className="badge badge-danger">已刪</span>}
                  </div>

                  <div className="prose prose-sm">
                    <Markdown>{r.bodyMd}</Markdown>
                  </div>

                  {!deleted && (
                    <div className="flex flex-wrap items-center gap-2">
                      {viewer && (r.authorId === viewer.id || isAdmin) && (
                        <>
                          <details className="w-full">
                            <summary className="btn btn-ghost btn-sm">✎ 編輯</summary>
                            <form
                              action={updateReply.bind(null, r.id) as unknown as string}
                              className="mt-3 space-y-2 rounded-lg border border-line bg-surface-2 p-3"
                            >
                              <textarea
                                name="bodyMd"
                                defaultValue={r.bodyMd}
                                required
                                maxLength={20000}
                                rows={5}
                                className="textarea mono"
                                aria-label="回覆內容"
                              />
                              <button type="submit" className="btn btn-primary btn-sm">
                                儲存變更
                              </button>
                            </form>
                          </details>
                          <form action={deleteReply.bind(null, r.id) as unknown as string}>
                            <button type="submit" className="btn btn-danger btn-sm">
                              刪除
                            </button>
                          </form>
                        </>
                      )}
                      {session?.user && r.authorId !== viewer?.id && (
                        <ReportBox targetType="REPLY" targetId={r.id} />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hrefFor={(n) => `/b/${slug}/p/${id}?page=${n}`}
          summary={`${totalReplies} 則`}
        />
      </section>

      {/* Reply composer */}
      <section className="card card-pad space-y-3">
        <h2 className="section-title">發表回覆</h2>
        {!session?.user ? (
          <p className="text-sm text-muted">
            請先{" "}
            <Link
              href={`/login?callbackUrl=/b/${slug}/p/${id}`}
              className="text-accent underline underline-offset-2"
            >
              登入
            </Link>{" "}
            後回覆。
          </p>
        ) : !canDoReply ? (
          <p className="alert">無法回覆：文章已刪除或版區已關閉。</p>
        ) : (
          <>
            <PostForm
              postId={id}
              action={boundReply as unknown as (formData: FormData) => Promise<void>}
              isReply
              submitLabel="送出回覆"
            />
            <p className="hint">
              求助資源 — 衛生福利部安心專線 1925（24 小時）｜{" "}
              <a
                href="https://www.iasp.info/suicidalthoughts/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                IASP
              </a>
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function ReportBox({ targetType, targetId }: { targetType: "POST" | "REPLY"; targetId: string }) {
  return (
    <details className="w-full">
      <summary className="btn btn-ghost btn-sm">⚑ 舉報</summary>
      <form
        action={createReport as unknown as string}
        className="mt-3 space-y-2 rounded-lg border border-line bg-surface-2 p-3"
      >
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <textarea
          name="reason"
          required
          minLength={10}
          maxLength={500}
          placeholder="請說明理由（10–500 字）"
          className="textarea"
          rows={3}
          aria-label="舉報理由"
        />
        <button type="submit" className="btn btn-secondary btn-sm">
          送出舉報
        </button>
      </form>
    </details>
  );
}
