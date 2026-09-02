import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Markdown } from "@/lib/markdown";
import { canCreatePost } from "@/lib/permissions";
import { publicAuthorLabel } from "@/lib/display";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await prisma.board.findUnique({ where: { slug } });
  if (!board || board.status !== "ACTIVE") notFound();

  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string; nickname?: string };
  } | null;

  const viewer = session?.user as any;

  const canPost = canCreatePost(viewer ?? null, board as any);

  const posts = await prisma.post.findMany({
    where: { boardId: board.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 50,
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
              { isAnonymous: p.isAnonymous, author: p.author as any, authorId: p.authorId },
              viewer ?? null
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
    </div>
  );
}
