import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Markdown } from "@/lib/markdown";
import { publicAuthorLabel } from "@/lib/display";
import { canReply } from "@/lib/permissions";
import { createReply } from "@/app/actions/posts";
import { createReport } from "@/app/actions/reports";
import { PostForm } from "@/components/PostForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const board = await prisma.board.findUnique({ where: { slug } });
  if (!board) notFound();

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true, board: true },
  });
  if (!post || post.boardId !== board.id) notFound();

  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string; nickname?: string };
  } | null;
  const viewer = session?.user as any;

  const replies = await prisma.reply.findMany({
    where: { postId: id },
    orderBy: { floor: "asc" },
    include: { author: true },
  });

  const isAdmin = viewer?.role === "ADMIN";
  const isDeleted = !!post.deletedAt;

  const canDoReply = canReply(viewer ?? null, board as any, post as any);

  const boundReply = createReply.bind(null, id);

  return (
    <div className="space-y-6">
      <Link href={`/b/${slug}`} className="text-sm underline text-[#2F6F6A]">
        ← 返回 {board.name}
      </Link>

      <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-3">
        {isDeleted && !isAdmin ? (
          <div className="text-gray-500 italic">此內容已由管理員移除</div>
        ) : (
          <>
            <h1 className="text-xl font-bold">{post.title}</h1>
            <div className="text-xs text-gray-500 flex gap-2 items-center">
              {(() => {
                const { label, badge } = publicAuthorLabel(
                  { isAnonymous: post.isAnonymous, author: post.author as any, authorId: post.authorId },
                  viewer ?? null
                );
                return (
                  <>
                    <span>{label}</span>
                    {badge && <span className="px-1.5 py-0.5 rounded bg-[#F7F4EE] border text-[10px]">{badge}</span>}
                  </>
                );
              })()}
              <span>{new Date(post.createdAt).toLocaleString("zh-TW")}</span>
              {isDeleted && <span className="text-red-600">（已刪除）</span>}
            </div>
            <div className="prose prose-sm max-w-none border-t pt-4">
              <Markdown>{post.bodyMd}</Markdown>
            </div>
            {isDeleted && isAdmin && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">管理員可見：此文已被刪除，原文如下保留但公開隱藏。</div>
            )}
            {!isDeleted && session?.user && post.authorId !== viewer?.id && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer text-gray-500 hover:text-[#2F6F6A]">舉報</summary>
                <form action={createReport as any} className="mt-2 space-y-2 border rounded p-3 bg-gray-50">
                  <input type="hidden" name="targetType" value="POST" />
                  <input type="hidden" name="targetId" value={post.id} />
                  <textarea
                    name="reason"
                    required
                    minLength={10}
                    maxLength={500}
                    placeholder="請說明理由（10–500 字）"
                    className="w-full border rounded px-2 py-1 text-sm"
                    rows={3}
                  />
                  <button type="submit" className="text-xs px-3 py-1 rounded bg-white border hover:bg-gray-100">
                    送出舉報
                  </button>
                </form>
              </details>
            )}
          </>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-bold">回覆（{replies.filter((r) => !r.deletedAt || isAdmin).length}）</h2>
        {replies.length === 0 ? (
          <div className="text-sm text-gray-500">尚無回覆</div>
        ) : (
          replies.map((r) => {
            const deleted = !!r.deletedAt;
            if (deleted && !isAdmin) {
              return (
                <div key={r.id} className="bg-white rounded-lg border border-[#E5E0D5] p-4">
                  <div className="text-sm text-gray-500 italic">此內容已由管理員移除</div>
                  <div className="text-xs text-gray-400">#{r.floor}・{new Date(r.createdAt).toLocaleString("zh-TW")}</div>
                </div>
              );
            }
            const { label, badge } = publicAuthorLabel(
              { isAnonymous: r.isAnonymous, author: r.author as any, authorId: r.authorId },
              viewer ?? null
            );
            return (
              <div key={r.id} className="bg-white rounded-lg border border-[#E5E0D5] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-mono">#{r.floor}</span>
                  {r.replyToFloor && <span>回覆 #{r.replyToFloor}</span>}
                  <span>{label}</span>
                  {badge && <span className="px-1.5 py-0.5 rounded bg-[#F7F4EE] border text-[10px]">{badge}</span>}
                  <span>{new Date(r.createdAt).toLocaleString("zh-TW")}</span>
                  {deleted && <span className="text-red-600">（已刪）</span>}
                </div>
                <div className="prose prose-sm max-w-none">
                  <Markdown>{r.bodyMd}</Markdown>
                </div>
                {!deleted && session?.user && r.authorId !== viewer?.id && (
                  <details className="mt-1">
                    <summary className="text-xs cursor-pointer text-gray-500">舉報</summary>
                    <form action={createReport as any} className="mt-2 space-y-2 border rounded p-3 bg-gray-50">
                      <input type="hidden" name="targetType" value="REPLY" />
                      <input type="hidden" name="targetId" value={r.id} />
                      <textarea
                        name="reason"
                        required
                        minLength={10}
                        maxLength={500}
                        placeholder="理由 10–500 字"
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                      />
                      <button type="submit" className="text-xs px-3 py-1 rounded bg-white border hover:bg-gray-100">
                        送出舉報
                      </button>
                    </form>
                  </details>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white rounded-lg border border-[#E5E0D5] p-6">
        <h3 className="font-bold mb-3">發表回覆</h3>
        {!session?.user ? (
          <div className="text-sm text-gray-600">
            請先 <Link href={`/login?callbackUrl=/b/${slug}/p/${id}`} className="underline text-[#2F6F6A]">登入</Link> 後回覆。
          </div>
        ) : !canDoReply ? (
          <div className="text-sm text-gray-500">無法回覆（文章已刪除或版區關閉）。</div>
        ) : (
          <>
            <PostForm postId={id} action={boundReply as any} isReply submitLabel="回覆" />
            <p className="text-xs text-gray-500 mt-2">
              求助資源 — 衛生福利部安心專線 1925（24 小時）｜ https://www.iasp.info/suicidalthoughts/
            </p>
          </>
        )}
      </div>
    </div>
  );
}
