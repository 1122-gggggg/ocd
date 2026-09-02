import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canCreatePost } from "@/lib/permissions";
import { createPost } from "@/app/actions/posts";
import { PostForm } from "@/components/PostForm";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function NewPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await prisma.board.findUnique({ where: { slug } });
  if (!board || board.status !== "ACTIVE") notFound();

  const session = (await auth()) as unknown as { user?: { id: string; role: string; clinicianStatus: string } } | null;
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/b/${slug}/new`);
  }
  const can = canCreatePost(session.user as any, board as any);
  if (!can) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 text-center">
        <p className="text-gray-600">您無權限在此版發文。</p>
        <Link href={`/b/${slug}`} className="underline text-[#2F6F6A] mt-2 inline-block">
          返回版區
        </Link>
      </div>
    );
  }

  // Bind boardSlug to action
  const boundAction = createPost.bind(null, slug);

  return (
    <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">在「{board.name}」發文</h1>
      <PostForm boardSlug={slug} action={boundAction as any} />
      <p className="text-xs text-gray-500">
        小提醒：求助資源 — 衛生福利部安心專線 1925（24 小時）｜ https://www.iasp.info/suicidalthoughts/
      </p>
    </div>
  );
}
